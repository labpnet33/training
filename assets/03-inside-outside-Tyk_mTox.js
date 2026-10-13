var e={id:`inside-outside`,h:{en:`Inside vs outside interfaces and the order of operations`,hi:`Inside vs outside interfaces aur order of operations`},body:{en:`
<p>At an international airport, passport control only happens when you cross from the domestic side to the international side, or back. Walking from gate 3 to gate 7 on the same side changes nothing. NAT on a Cisco router works the same way. You draw a border by labelling each interface <b>inside</b> or <b>outside</b>, and the router translates only packets that <b>cross that border</b>. Get the labels wrong and NAT silently does nothing, which is the single most common NAT fault in labs and in real life.</p>

<h3>Marking the border</h3>
<p>Two interface commands define the border:</p>
<pre class="code">EDGE(config)# interface GigabitEthernet0/0
EDGE(config-if)#  description LAN
EDGE(config-if)#  ip nat inside
EDGE(config-if)# interface GigabitEthernet0/1
EDGE(config-if)#  description ISP-uplink
EDGE(config-if)#  ip nat outside</pre>
<ul>
<li><b>ip nat inside</b> goes on interfaces facing your private hosts: LANs, VLAN subinterfaces, SVIs.</li>
<li><b>ip nat outside</b> goes on the interface facing the ISP or the public side.</li>
<li>You may have <b>several inside interfaces</b> and several outside interfaces. In the PAT lab, BR has two inside LANs (g0/0 and g0/2) and one outside uplink (g0/1).</li>
<li>An interface with no NAT label is simply ignored by NAT. Traffic between two inside interfaces, for example LAN-1 to LAN-2, is routed normally and never translated.</li>
</ul>
<p>The labels alone translate nothing. You also need a <b>rule</b>, such as <code>ip nat inside source static …</code> or <code>ip nat inside source list … </code>. Label plus rule together make NAT work.</p>

<h3>Which packets are translated?</h3>
<p>For inside source NAT, the router asks three questions about every packet:</p>
<ol>
<li>Did it arrive on an <b>inside</b> interface and is it being routed out of an <b>outside</b> interface?</li>
<li>Does its source address match a <b>rule</b> (a static entry, or the ACL of a dynamic rule)?</li>
<li>For dynamic NAT: is there a <b>free address or port</b> to use?</li>
</ol>
<p>If all answers are yes, the source is translated. Return traffic arriving on the outside interface is translated back if its destination matches an existing entry. For a static entry, traffic arriving on the outside for the inside global address is translated even if the inside host never spoke first; that is how servers are published.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="NAT order of operations">
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">Inside to outside</text>
<rect x="10" y="30" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="57" text-anchor="middle" class="svg-ink" font-size="12">In ACL (local)</text>
<rect x="170" y="30" width="140" height="44" rx="8" fill="#bae6fd"/><text x="240" y="57" text-anchor="middle" class="svg-ink" font-size="12">Routing</text>
<rect x="330" y="30" width="140" height="44" rx="8" fill="#fde68a"/><text x="400" y="57" text-anchor="middle" class="svg-ink" font-size="12">NAT local→global</text>
<rect x="490" y="30" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="560" y="57" text-anchor="middle" class="svg-ink" font-size="12">Out ACL (global)</text>
<line x1="150" y1="52" x2="170" y2="52" stroke="#64748b" stroke-width="2"/><line x1="310" y1="52" x2="330" y2="52" stroke="#64748b" stroke-width="2"/><line x1="470" y1="52" x2="490" y2="52" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Outside to inside</text>
<rect x="10" y="140" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="80" y="167" text-anchor="middle" class="svg-ink" font-size="12">In ACL (global)</text>
<rect x="170" y="140" width="140" height="44" rx="8" fill="#fde68a"/><text x="240" y="167" text-anchor="middle" class="svg-ink" font-size="12">NAT global→local</text>
<rect x="330" y="140" width="140" height="44" rx="8" fill="#bae6fd"/><text x="400" y="167" text-anchor="middle" class="svg-ink" font-size="12">Routing</text>
<rect x="490" y="140" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="167" text-anchor="middle" class="svg-ink" font-size="12">Out ACL (local)</text>
<line x1="150" y1="162" x2="170" y2="162" stroke="#64748b" stroke-width="2"/><line x1="310" y1="162" x2="330" y2="162" stroke="#64748b" stroke-width="2"/><line x1="470" y1="162" x2="490" y2="162" stroke="#64748b" stroke-width="2"/>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">Inside→outside: route first, then NAT. Outside→inside: NAT first, then route.</text>
</svg><p class="cap">The simplified Cisco IOS order of operations for NAT, which decides what ACLs and the routing table "see".</p></div>

<h3>Order of operations, at a high level</h3>
<p>Cisco IOS applies features in a fixed order. You do not need every step for the CCNA, but this simplified view explains many real problems:</p>
<ul>
<li><b>Inside to outside:</b> the inbound ACL on the inside interface is checked first, so it sees the <b>inside local</b> address. Then the router makes its <b>routing decision</b> on the destination. Only then does <b>NAT</b> translate the source. An outbound ACL on the outside interface therefore sees the <b>inside global</b> address.</li>
<li><b>Outside to inside:</b> the inbound ACL on the outside interface is checked first, so it must permit traffic to the <b>inside global</b> address (for example 203.0.113.5 for a published server). Then <b>NAT</b> translates the destination back to the inside local, and only then does the router <b>route</b> the packet, using a route to the inside local address.</li>
</ul>
<p>Two practical results follow. First, an ACL on the outside interface must be written with public (global) addresses, never with the server's private address. Second, the NAT router itself needs a route to the inside local subnet (usually a connected route), while the <b>upstream</b> router needs a route to the inside global addresses. That second route is the "route back" you will troubleshoot in chapter 10.</p>

<div class="eg"><p><b>Worked example.</b> In the static lab, PC-EXT 198.51.100.50 sends a SYN to 203.0.113.5 port 80. It arrives on EDGE g0/1 (outside). An inbound ACL there would have to permit destination 203.0.113.5. NAT then rewrites the destination to 172.16.10.80. The routing table matches the connected 172.16.10.0/24 on g0/0, and the packet reaches PORTAL. PORTAL replies from 172.16.10.80 to 198.51.100.50; the packet enters g0/0 (inside), the router routes it to the default route via g0/1, NAT rewrites the source to 203.0.113.5, and PC-EXT sees a reply from the address it called.</p></div>

<h3>Verifying the border</h3>
<pre class="out">EDGE# show ip nat statistics
Total active translations: 1 (1 static, 0 dynamic; 0 extended)
<span class="hl">Outside interfaces:
  GigabitEthernet0/1
Inside interfaces:
  GigabitEthernet0/0</span>
Hits: 0  Misses: 0
...</pre>
<p>The first thing to check in any NAT problem is this block. If the LAN appears under "Outside interfaces", the labels are swapped.</p>

<div class="warn"><p><b>Common mistake.</b> Testing NAT with a ping from the NAT router's own CLI. Router-generated packets do not enter through an inside interface, so they do not behave like host traffic and the result can mislead you. Always test from a real inside host, as the labs do with PC1, PC2 and PC-EXT.</p></div>

<div class="exam"><p><b>Exam trap.</b> A question shows correct pool, ACL and <code>ip nat inside source list</code> commands, but <code>ip nat inside</code> is on the WAN interface and <code>ip nat outside</code> on the LAN. The answer is "no translation happens", even though every rule line is perfect.</p></div>

<div class="scn"><h4>Ticket: inside/outside swapped</h4><p>After a router replacement at a clinic, nobody could browse. The new engineer had copied the NAT lines from the old config but typed <code>ip nat outside</code> on the LAN and <code>ip nat inside</code> on the uplink. <code>show ip nat translations</code> was empty, the ACL and PAT rule looked correct, and the ISP saw packets arriving with source 192.168.10.x. <code>show ip nat statistics</code> listed the LAN under Outside interfaces. Swapping the two labels fixed it immediately.</p><p><b>Lesson:</b> when the table stays empty, check the inside/outside labels before touching the ACL or the rule.</p></div>

<div class="iv"><p class="q">"On a NAT router, does routing happen before or after translation?"</p><p>Strong answer: it depends on direction. Inside to outside, the router routes on the destination first and then translates the source. Outside to inside, NAT translates the destination first and then routes, which is why the router routes return traffic toward the inside local address. Add the ACL consequence: inbound on the outside interface you match inside global addresses; inbound on the inside interface you match inside local.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ip nat inside on private-facing interfaces, ip nat outside on the public-facing one; several of each are allowed.</li>
<li>Only traffic crossing between an inside and an outside interface is translated; inside-to-inside is not.</li>
<li>Labels need a rule (static or list) to do anything.</li>
<li>Inside→outside: ACL in, route, NAT. Outside→inside: ACL in, NAT, route.</li>
<li>show ip nat statistics lists the inside and outside interfaces: check it first.</li>
</ul></div>
`,hi:`
<p>International airport par passport control tabhi hota hai jab aap domestic side se international side jaate ho, ya wapas aate ho. Same side par gate 3 se gate 7 chalne se kuch nahi badalta. Cisco router par NAT bhi aise hi kaam karta hai. Aap har interface ko <b>inside</b> ya <b>outside</b> label karke ek border kheenchte ho, aur router sirf un packets ko translate karta hai jo <b>us border ko cross</b> karte hain. Labels galat hue to NAT chupchaap kuch nahi karta, aur yahi labs aur real life dono mein sabse common NAT fault hai.</p>

<h3>Border mark karna</h3>
<p>Do interface commands border define karti hain:</p>
<pre class="code">EDGE(config)# interface GigabitEthernet0/0
EDGE(config-if)#  description LAN
EDGE(config-if)#  ip nat inside
EDGE(config-if)# interface GigabitEthernet0/1
EDGE(config-if)#  description ISP-uplink
EDGE(config-if)#  ip nat outside</pre>
<ul>
<li><b>ip nat inside</b> un interfaces par jaata hai jo aapke private hosts ki taraf hain: LANs, VLAN subinterfaces, SVIs.</li>
<li><b>ip nat outside</b> us interface par jaata hai jo ISP ya public side ki taraf hai.</li>
<li>Aapke paas <b>kai inside interfaces</b> aur kai outside interfaces ho sakte hain. PAT lab mein BR ke do inside LANs (g0/0 aur g0/2) aur ek outside uplink (g0/1) hai.</li>
<li>Jis interface par NAT label nahi, NAT use ignore karta hai. Do inside interfaces ke beech ka traffic, jaise LAN-1 se LAN-2, normally route hota hai aur kabhi translate nahi hota.</li>
</ul>
<p>Sirf labels kuch translate nahi karte. Aapko ek <b>rule</b> bhi chahiye, jaise <code>ip nat inside source static …</code> ya <code>ip nat inside source list … </code>. Label plus rule milkar NAT chalate hain.</p>

<h3>Kaunse packets translate hote hain?</h3>
<p>Inside source NAT ke liye router har packet ke baare mein teen sawaal poochta hai:</p>
<ol>
<li>Kya yeh <b>inside</b> interface par aaya aur <b>outside</b> interface se route ho raha hai?</li>
<li>Kya iska source address kisi <b>rule</b> se match karta hai (static entry, ya dynamic rule ka ACL)?</li>
<li>Dynamic NAT ke liye: kya use karne ke liye <b>free address ya port</b> hai?</li>
</ol>
<p>Agar saare jawab haan hain, source translate hota hai. Outside interface par aane wala return traffic wapas translate hota hai agar uska destination kisi existing entry se match kare. Static entry ke liye, outside par inside global address ke liye aane wala traffic translate hota hai chahe inside host ne pehle baat na ki ho; isi tarah servers publish hote hain.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="NAT order of operations">
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">Inside se outside</text>
<rect x="10" y="30" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="57" text-anchor="middle" class="svg-ink" font-size="12">In ACL (local)</text>
<rect x="170" y="30" width="140" height="44" rx="8" fill="#bae6fd"/><text x="240" y="57" text-anchor="middle" class="svg-ink" font-size="12">Routing</text>
<rect x="330" y="30" width="140" height="44" rx="8" fill="#fde68a"/><text x="400" y="57" text-anchor="middle" class="svg-ink" font-size="12">NAT local→global</text>
<rect x="490" y="30" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="560" y="57" text-anchor="middle" class="svg-ink" font-size="12">Out ACL (global)</text>
<line x1="150" y1="52" x2="170" y2="52" stroke="#64748b" stroke-width="2"/><line x1="310" y1="52" x2="330" y2="52" stroke="#64748b" stroke-width="2"/><line x1="470" y1="52" x2="490" y2="52" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Outside se inside</text>
<rect x="10" y="140" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="80" y="167" text-anchor="middle" class="svg-ink" font-size="12">In ACL (global)</text>
<rect x="170" y="140" width="140" height="44" rx="8" fill="#fde68a"/><text x="240" y="167" text-anchor="middle" class="svg-ink" font-size="12">NAT global→local</text>
<rect x="330" y="140" width="140" height="44" rx="8" fill="#bae6fd"/><text x="400" y="167" text-anchor="middle" class="svg-ink" font-size="12">Routing</text>
<rect x="490" y="140" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="167" text-anchor="middle" class="svg-ink" font-size="12">Out ACL (local)</text>
<line x1="150" y1="162" x2="170" y2="162" stroke="#64748b" stroke-width="2"/><line x1="310" y1="162" x2="330" y2="162" stroke="#64748b" stroke-width="2"/><line x1="470" y1="162" x2="490" y2="162" stroke="#64748b" stroke-width="2"/>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">Inside→outside: pehle route, phir NAT. Outside→inside: pehle NAT, phir route.</text>
</svg><p class="cap">NAT ke liye simplified Cisco IOS order of operations, jo decide karta hai ki ACLs aur routing table kya "dekhte" hain.</p></div>

<h3>Order of operations, high level par</h3>
<p>Cisco IOS features ko ek fixed order mein apply karta hai. CCNA ke liye har step zaroori nahi, par yeh simplified view kai real problems samjhata hai:</p>
<ul>
<li><b>Inside se outside:</b> inside interface ka inbound ACL pehle check hota hai, isliye use <b>inside local</b> address dikhta hai. Phir router destination par <b>routing decision</b> leta hai. Uske baad hi <b>NAT</b> source translate karta hai. Isliye outside interface ka outbound ACL <b>inside global</b> address dekhta hai.</li>
<li><b>Outside se inside:</b> outside interface ka inbound ACL pehle check hota hai, isliye use <b>inside global</b> address ki taraf traffic permit karna hoga (jaise published server ke liye 203.0.113.5). Phir <b>NAT</b> destination ko wapas inside local mein translate karta hai, aur uske baad hi router packet ko inside local address ke route se <b>route</b> karta hai.</li>
</ul>
<p>Isse do practical nateeje nikalte hain. Pehla, outside interface ka ACL public (global) addresses se likhna hoga, kabhi server ke private address se nahi. Doosra, NAT router ko khud inside local subnet ka route chahiye (aam taur par connected route), jabki <b>upstream</b> router ko inside global addresses ka route chahiye. Yahi doosra route "route back" hai jise aap chapter 10 mein troubleshoot karoge.</p>

<div class="eg"><p><b>Worked example.</b> Static lab mein PC-EXT 198.51.100.50 203.0.113.5 port 80 par SYN bhejta hai. Yeh EDGE g0/1 (outside) par aata hai. Wahan inbound ACL hota to use destination 203.0.113.5 permit karna padta. Phir NAT destination ko 172.16.10.80 mein rewrite karta hai. Routing table g0/0 par connected 172.16.10.0/24 match karti hai, aur packet PORTAL tak pahunchta hai. PORTAL 172.16.10.80 se 198.51.100.50 ko reply karta hai; packet g0/0 (inside) par aata hai, router use g0/1 wale default route se route karta hai, NAT source ko 203.0.113.5 mein rewrite karta hai, aur PC-EXT ko usi address se reply dikhta hai jise usne call kiya tha.</p></div>

<h3>Border verify karna</h3>
<pre class="out">EDGE# show ip nat statistics
Total active translations: 1 (1 static, 0 dynamic; 0 extended)
<span class="hl">Outside interfaces:
  GigabitEthernet0/1
Inside interfaces:
  GigabitEthernet0/0</span>
Hits: 0  Misses: 0
...</pre>
<p>Kisi bhi NAT problem mein sabse pehle yahi block check karo. Agar LAN "Outside interfaces" ke neeche dikhe, to labels ulte hain.</p>

<div class="warn"><p><b>Common galti.</b> NAT router ke apne CLI se ping karke NAT test karna. Router-generated packets inside interface se enter nahi karte, isliye woh host traffic jaisa behave nahi karte aur result aapko gumraah kar sakta hai. Hamesha asli inside host se test karo, jaise labs PC1, PC2 aur PC-EXT se karte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Question mein sahi pool, ACL aur <code>ip nat inside source list</code> commands dikhte hain, par <code>ip nat inside</code> WAN interface par hai aur <code>ip nat outside</code> LAN par. Jawab hai "koi translation nahi hota", chahe har rule line perfect ho.</p></div>

<div class="scn"><h4>Ticket: inside/outside ulta</h4><p>Ek clinic mein router replace hone ke baad koi browse nahi kar paa raha tha. Naye engineer ne purane config se NAT lines copy ki thin par LAN par <code>ip nat outside</code> aur uplink par <code>ip nat inside</code> type kar diya. <code>show ip nat translations</code> khali tha, ACL aur PAT rule sahi dikh rahe the, aur ISP ko source 192.168.10.x wale packets aa rahe the. <code>show ip nat statistics</code> ne LAN ko Outside interfaces ke neeche dikhaya. Dono labels swap karte hi sab theek ho gaya.</p><p><b>Seekh:</b> jab table khali rahe, ACL ya rule chhoone se pehle inside/outside labels check karo.</p></div>

<div class="iv"><p class="q">"NAT router par routing translation se pehle hoti hai ya baad mein?"</p><p>Strong answer: direction par depend karta hai. Inside se outside, router pehle destination par route karta hai phir source translate karta hai. Outside se inside, NAT pehle destination translate karta hai phir route hota hai, isliye router return traffic ko inside local address ki taraf route karta hai. ACL wala nateeja jodo: outside interface par inbound aap inside global addresses match karte ho; inside interface par inbound inside local.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Private-facing interfaces par ip nat inside, public-facing par ip nat outside; dono kai ho sakte hain.</li>
<li>Sirf inside aur outside interface ke beech cross karne wala traffic translate hota hai; inside-to-inside nahi.</li>
<li>Labels ko kuch karne ke liye rule (static ya list) chahiye.</li>
<li>Inside→outside: ACL in, route, NAT. Outside→inside: ACL in, NAT, route.</li>
<li>show ip nat statistics inside aur outside interfaces list karta hai: pehle ise check karo.</li>
</ul></div>
`}};export{e as default};