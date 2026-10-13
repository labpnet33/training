var e={id:`direction`,h:{en:`Inbound vs outbound: thinking in directions`,hi:`Inbound vs outbound: directions mein sochna`},body:{en:`
<p>Picture a toll plaza on a highway. It can check vehicles <b>entering</b> the city, vehicles <b>leaving</b> it, or both, but each booth faces one way. A car coming in and the same car going home later pass through <b>different</b> booths. An ACL on a router interface is a booth that faces one direction. Most ACL confusion disappears once you learn to stand <b>inside the router</b> and ask: is this packet coming in through this door, or going out of it?</p>

<h3>The definitions, from the router's point of view</h3>
<dl class="terms">
<dt>Inbound (in)</dt><dd>The ACL checks packets <b>arriving</b> on the interface, before the router does its routing lookup. Denied packets are dropped without wasting a route lookup.</dd>
<dt>Outbound (out)</dt><dd>The ACL checks packets <b>leaving</b> through the interface, after the routing decision has chosen that interface as the exit.</dd>
</dl>
<p>Applied with <code>ip access-group NAME|NUMBER in|out</code> in interface configuration. On a Layer 3 switch the same command works on an SVI (<code>interface vlan 20</code>) or a routed port: "in" on an SVI means packets coming <b>from</b> hosts in that VLAN into the switch's routing engine.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Inbound and outbound checks">
<rect x="230" y="70" width="180" height="110" rx="12" fill="#bae6fd"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="14">Router</text><text x="320" y="137" text-anchor="middle" class="svg-muted" font-size="12">routing lookup</text>
<rect x="200" y="105" width="30" height="40" fill="#fde68a"/><text x="215" y="200" text-anchor="middle" class="svg-ink" font-size="12">Gi0/2</text>
<rect x="410" y="105" width="30" height="40" fill="#fde68a"/><text x="425" y="200" text-anchor="middle" class="svg-ink" font-size="12">Gi0/1</text>
<line x1="40" y1="125" x2="195" y2="125" stroke="#64748b" stroke-width="3"/><polygon points="195,119 205,125 195,131" fill="#64748b"/>
<line x1="445" y1="125" x2="595" y2="125" stroke="#64748b" stroke-width="3"/><polygon points="595,119 605,125 595,131" fill="#64748b"/>
<text x="110" y="110" text-anchor="middle" class="svg-ink" font-size="13">packet arrives</text>
<text x="530" y="110" text-anchor="middle" class="svg-ink" font-size="13">packet leaves</text>
<text x="150" y="40" text-anchor="middle" class="svg-accent" font-size="13">1. Gi0/2 IN checked</text>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="13">2. route lookup</text>
<text x="490" y="40" text-anchor="middle" class="svg-accent" font-size="13">3. Gi0/1 OUT checked</text>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">Router's own packets (pings, OSPF, syslog) skip step 3</text>
</svg><p class="cap">A transit packet can be checked twice: inbound on the ingress interface and outbound on the egress interface.</p></div>

<h3>The one-per rule</h3>
<p>You can apply <b>one ACL per interface, per direction, per protocol</b>. So an interface can have at most one IPv4 inbound, one IPv4 outbound, one IPv6 inbound and one IPv6 outbound list. If you type a second <code>ip access-group</code> in the same direction, it <b>replaces</b> the first one silently. Everything you want to filter in that direction must live in one list.</p>

<h3>Traffic to and from the router itself</h3>
<ul>
<li><b>Inbound ACLs filter everything arriving</b>, including packets addressed to the router itself: OSPF hellos, SSH to the router, pings to the interface, DHCP relay requests. This is why an inbound ACL can break routing adjacencies.</li>
<li><b>Outbound ACLs do not filter packets the router originates</b>: its own pings, OSPF hellos, syslog and NTP messages leave regardless. They only check transit traffic being routed out of that interface.</li>
</ul>

<h3>Stateless means you must think about the return path</h3>
<p>A normal ACL does not remember that a request went out, so the <b>reply</b> is judged as a brand-new packet. If an ACL somewhere on the reply path denies it, the conversation fails even though the request was permitted. When you design or troubleshoot, always trace <b>both directions</b>: the request (client to server) and the reply (server to client, with source and destination swapped and ports swapped).</p>

<div class="eg"><p><b>Worked example: four checkpoints for one conversation.</b> In the extended lab, PC-LAB 192.168.40.10 browses WEB 172.31.1.80. On R1 the request enters Gi0/2 and leaves Gi0/1; the reply enters Gi0/1 and leaves Gi0/2. That gives four possible checkpoints on R1:</p>
<table class="cmp">
<tr><th>Checkpoint</th><th>Packet seen</th><th>Source → destination</th></tr>
<tr><td>Gi0/2 in</td><td>Request</td><td>192.168.40.10:51514 → 172.31.1.80:80</td></tr>
<tr><td>Gi0/1 out</td><td>Request</td><td>192.168.40.10:51514 → 172.31.1.80:80</td></tr>
<tr><td>Gi0/1 in</td><td>Reply</td><td>172.31.1.80:80 → 192.168.40.10:51514</td></tr>
<tr><td>Gi0/2 out</td><td>Reply</td><td>172.31.1.80:80 → 192.168.40.10:51514</td></tr>
</table>
<p>ACL 110 sits at Gi0/2 in, so it sees only requests, and all its entries are written with the lab as the source. If you mistakenly applied ACL 110 at Gi0/2 <b>out</b>, it would see replies whose source is 172.31.1.80, nothing would match, and the implicit deny would drop every reply.</p></div>

<pre class="code"><span class="c">! Wrong: applied in the direction where the sources never appear</span>
R1(config)# interface GigabitEthernet0/2
R1(config-if)# ip access-group 110 out
<span class="c">! Right: where the lab's packets enter the router</span>
R1(config-if)# no ip access-group 110 out
R1(config-if)# ip access-group 110 in</pre>
<pre class="out">R1# show ip interface GigabitEthernet0/2
GigabitEthernet0/2 is up, line protocol is up
  Internet address is 192.168.40.1/24
  ...
  <span class="hl">Outgoing access list is not set</span>
  <span class="hl">Inbound  access list is 110</span>
  Proxy ARP is enabled</pre>

<h3>A reliable thinking method</h3>
<ol>
<li>Write the flow: source IP and port, destination IP and port, protocol.</li>
<li>Trace the path hop by hop; note each ingress and egress interface.</li>
<li>For each checkpoint, write the packet as that interface sees it in that direction.</li>
<li>Repeat for the reply, with addresses and ports swapped.</li>
<li>Only then choose where and in which direction to apply the list.</li>
</ol>

<div class="warn"><p><b>Common mistake.</b> Thinking of "in" and "out" from the network's or the user's point of view ("traffic going out to the internet"). ACL directions are always relative to the router interface. Traffic from a LAN to the internet is <b>inbound</b> on the LAN interface and <b>outbound</b> on the WAN interface.</p></div>

<div class="exam"><p><b>Exam trap.</b> An outbound ACL with <code>deny ip any any</code> does not stop the router's own OSPF hellos leaving that interface, but an inbound one on the neighbour does. And a second <code>ip access-group</code> in the same direction replaces the first; it does not add to it.</p></div>

<div class="scn"><h4>Replies that never came home</h4><p>A retail chain added an inbound ACL on each store router's WAN interface to block the internet from reaching point-of-sale terminals. It permitted only DNS and NTP from specific servers. The next morning card payments failed. Terminals were opening HTTPS sessions to the payment gateway, but the <b>replies</b> arrived on the WAN interface and hit the implicit deny, because nothing permitted traffic from the gateway back in. Adding <code>permit tcp host 203.0.113.50 eq 443 10.60.0.0 0.0.255.255 established</code> restored payments while still blocking new inbound connections.</p><p><b>Lesson:</b> plain ACLs are stateless. Every permitted request needs a permitted reply path.</p></div>

<div class="iv"><p class="q">"What is the difference between applying an ACL inbound and outbound?"</p><p>Strong answer: inbound checks packets as they arrive, before the routing lookup, and also filters traffic destined to the router itself; outbound checks packets after routing, as they leave, and does not filter traffic the router generates. Only one ACL per interface, direction and protocol. Then show the method: trace both request and reply, write the packet as each checkpoint sees it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Directions are relative to the router interface: in = arriving, out = leaving.</li>
<li>Inbound runs before the routing lookup and also filters traffic to the router itself.</li>
<li>Outbound does not filter packets the router originates.</li>
<li>One ACL per interface, per direction, per protocol; a new access-group replaces the old one.</li>
<li>ACLs are stateless: always trace the reply path with addresses and ports swapped.</li>
</ul></div>
`,hi:`
<p>Highway par ek toll plaza socho. Woh shehar mein <b>aane wali</b> gaadiyan check kar sakta hai, shehar se <b>jaane wali</b>, ya dono, par har booth ek hi taraf dekhta hai. Andar aati hui car aur wahi car baad mein ghar laut'ti hui <b>alag</b> booths se guzarti hain. Router interface par ACL ek booth hai jo ek direction mein dekhta hai. Zyada tar ACL confusion tab gayab ho jaata hai jab aap <b>router ke andar</b> khade hokar poochna seekh lete ho: kya yeh packet is darwaze se andar aa raha hai, ya bahar jaa raha hai?</p>

<h3>Definitions, router ke point of view se</h3>
<dl class="terms">
<dt>Inbound (in)</dt><dd>ACL interface par <b>aane wale</b> packets check karta hai, router ke routing lookup se pehle. Denied packets bina route lookup barbaad kiye drop ho jaate hain.</dd>
<dt>Outbound (out)</dt><dd>ACL interface se <b>nikalne wale</b> packets check karta hai, jab routing decision ne us interface ko exit chun liya ho.</dd>
</dl>
<p>Interface configuration mein <code>ip access-group NAME|NUMBER in|out</code> se apply hota hai. Layer 3 switch par yahi command SVI (<code>interface vlan 20</code>) ya routed port par kaam karti hai: SVI par "in" ka matlab hai us VLAN ke hosts <b>se</b> switch ke routing engine mein aane wale packets.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Inbound aur outbound checks">
<rect x="230" y="70" width="180" height="110" rx="12" fill="#bae6fd"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="14">Router</text><text x="320" y="137" text-anchor="middle" class="svg-muted" font-size="12">routing lookup</text>
<rect x="200" y="105" width="30" height="40" fill="#fde68a"/><text x="215" y="200" text-anchor="middle" class="svg-ink" font-size="12">Gi0/2</text>
<rect x="410" y="105" width="30" height="40" fill="#fde68a"/><text x="425" y="200" text-anchor="middle" class="svg-ink" font-size="12">Gi0/1</text>
<line x1="40" y1="125" x2="195" y2="125" stroke="#64748b" stroke-width="3"/><polygon points="195,119 205,125 195,131" fill="#64748b"/>
<line x1="445" y1="125" x2="595" y2="125" stroke="#64748b" stroke-width="3"/><polygon points="595,119 605,125 595,131" fill="#64748b"/>
<text x="110" y="110" text-anchor="middle" class="svg-ink" font-size="13">packet aata hai</text>
<text x="530" y="110" text-anchor="middle" class="svg-ink" font-size="13">packet nikalta hai</text>
<text x="150" y="40" text-anchor="middle" class="svg-accent" font-size="13">1. Gi0/2 IN check</text>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="13">2. route lookup</text>
<text x="490" y="40" text-anchor="middle" class="svg-accent" font-size="13">3. Gi0/1 OUT check</text>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">Router ke apne packets (pings, OSPF, syslog) step 3 skip karte hain</text>
</svg><p class="cap">Transit packet do baar check ho sakta hai: ingress interface par inbound aur egress interface par outbound.</p></div>

<h3>One-per rule</h3>
<p>Aap <b>har interface, har direction, har protocol par ek ACL</b> laga sakte ho. Yaani ek interface par zyada se zyada ek IPv4 inbound, ek IPv4 outbound, ek IPv6 inbound aur ek IPv6 outbound list ho sakti hai. Agar aap same direction mein doosra <code>ip access-group</code> type karte ho, to woh pehle wale ko chupchaap <b>replace</b> kar deta hai. Us direction mein jo bhi filter karna hai, woh sab ek hi list mein hona chahiye.</p>

<h3>Router tak aur router se traffic</h3>
<ul>
<li><b>Inbound ACLs aane wali har cheez filter karte hain</b>, router ko hi address kiye gaye packets bhi: OSPF hellos, router par SSH, interface ko pings, DHCP relay requests. Isi wajah se inbound ACL routing adjacencies tod sakta hai.</li>
<li><b>Outbound ACLs router ke khud banaye packets filter nahi karte</b>: uske apne pings, OSPF hellos, syslog aur NTP messages waise bhi nikal jaate hain. Yeh sirf us interface se route ho rahe transit traffic ko check karte hain.</li>
</ul>

<h3>Stateless matlab aapko return path ke baare mein sochna padega</h3>
<p>Normal ACL yaad nahi rakhta ki request bahar gayi thi, isliye <b>reply</b> ko bilkul naye packet ki tarah judge kiya jaata hai. Agar reply path par kahin koi ACL use deny kare, to conversation fail ho jaati hai, bhale hi request permit hui thi. Design ya troubleshoot karte waqt hamesha <b>dono directions</b> trace karo: request (client se server) aur reply (server se client, source aur destination swap aur ports swap).</p>

<div class="eg"><p><b>Worked example: ek conversation ke chaar checkpoints.</b> Extended lab mein PC-LAB 192.168.40.10 WEB 172.31.1.80 browse karta hai. R1 par request Gi0/2 par aati hai aur Gi0/1 se nikalti hai; reply Gi0/1 par aata hai aur Gi0/2 se nikalta hai. Isse R1 par chaar possible checkpoints bante hain:</p>
<table class="cmp">
<tr><th>Checkpoint</th><th>Kaunsa packet dikhta hai</th><th>Source → destination</th></tr>
<tr><td>Gi0/2 in</td><td>Request</td><td>192.168.40.10:51514 → 172.31.1.80:80</td></tr>
<tr><td>Gi0/1 out</td><td>Request</td><td>192.168.40.10:51514 → 172.31.1.80:80</td></tr>
<tr><td>Gi0/1 in</td><td>Reply</td><td>172.31.1.80:80 → 192.168.40.10:51514</td></tr>
<tr><td>Gi0/2 out</td><td>Reply</td><td>172.31.1.80:80 → 192.168.40.10:51514</td></tr>
</table>
<p>ACL 110 Gi0/2 in par baitha hai, isliye use sirf requests dikhti hain, aur uski saari entries lab ko source maan kar likhi gayi hain. Agar aap galti se ACL 110 ko Gi0/2 <b>out</b> par laga dete, to use replies dikhte jinka source 172.31.1.80 hai, kuch match nahi hota, aur implicit deny har reply drop kar deta.</p></div>

<pre class="code"><span class="c">! Galat: us direction mein laga jahan sources kabhi dikhte hi nahi</span>
R1(config)# interface GigabitEthernet0/2
R1(config-if)# ip access-group 110 out
<span class="c">! Sahi: jahan lab ke packets router mein ghuste hain</span>
R1(config-if)# no ip access-group 110 out
R1(config-if)# ip access-group 110 in</pre>
<pre class="out">R1# show ip interface GigabitEthernet0/2
GigabitEthernet0/2 is up, line protocol is up
  Internet address is 192.168.40.1/24
  ...
  <span class="hl">Outgoing access list is not set</span>
  <span class="hl">Inbound  access list is 110</span>
  Proxy ARP is enabled</pre>

<h3>Ek bharosemand sochne ka tareeka</h3>
<ol>
<li>Flow likho: source IP aur port, destination IP aur port, protocol.</li>
<li>Path ko hop by hop trace karo; har ingress aur egress interface note karo.</li>
<li>Har checkpoint ke liye packet waise likho jaise woh interface us direction mein use dekhta hai.</li>
<li>Reply ke liye repeat karo, addresses aur ports swap karke.</li>
<li>Tabhi chuno ki list kahan aur kis direction mein apply karni hai.</li>
</ol>

<div class="warn"><p><b>Common galti.</b> "in" aur "out" ko network ya user ke point of view se sochna ("internet ki taraf bahar jaane wala traffic"). ACL directions hamesha router interface ke relative hoti hain. LAN se internet ka traffic LAN interface par <b>inbound</b> aur WAN interface par <b>outbound</b> hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>deny ip any any</code> wala outbound ACL router ke apne OSPF hellos ko us interface se nikalne se nahi rokta, par neighbour par laga inbound ACL rokta hai. Aur same direction mein doosra <code>ip access-group</code> pehle wale ko replace karta hai; usmein jodta nahi.</p></div>

<div class="scn"><h4>Replies jo kabhi ghar nahi pahunche</h4><p>Ek retail chain ne har store router ke WAN interface par inbound ACL joda taaki internet point-of-sale terminals tak na pahunche. Yeh sirf specific servers se DNS aur NTP permit karta tha. Agli subah card payments fail ho gaye. Terminals payment gateway ki taraf HTTPS sessions khol rahe the, par <b>replies</b> WAN interface par aaye aur implicit deny se takra gaye, kyunki gateway se wapas andar aane wale traffic ko kuch bhi permit nahi karta tha. <code>permit tcp host 203.0.113.50 eq 443 10.60.0.0 0.0.255.255 established</code> jodne se payments wapas chalu ho gaye aur naye inbound connections block bhi rahe.</p><p><b>Seekh:</b> plain ACLs stateless hain. Har permit hui request ko permit hua reply path chahiye.</p></div>

<div class="iv"><p class="q">"ACL ko inbound aur outbound apply karne mein kya fark hai?"</p><p>Strong answer: inbound packets ko aate hi check karta hai, routing lookup se pehle, aur router ko hi jaane wala traffic bhi filter karta hai; outbound routing ke baad packets ko nikalte waqt check karta hai, aur router ka banaya traffic filter nahi karta. Har interface, direction aur protocol par sirf ek ACL. Phir tareeka dikhao: request aur reply dono trace karo, packet ko waise likho jaise har checkpoint use dekhta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Directions router interface ke relative hain: in = aana, out = nikalna.</li>
<li>Inbound routing lookup se pehle chalta hai aur router tak jaane wala traffic bhi filter karta hai.</li>
<li>Outbound router ke khud banaye packets filter nahi karta.</li>
<li>Har interface, har direction, har protocol par ek ACL; naya access-group purane ko replace karta hai.</li>
<li>ACLs stateless hain: reply path ko hamesha addresses aur ports swap karke trace karo.</li>
</ul></div>
`}};export{e as default};