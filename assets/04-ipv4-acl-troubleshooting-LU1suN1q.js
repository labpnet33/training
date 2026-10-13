var e={id:`ipv4-acl-troubleshooting`,h:{en:`IPv4 ACL troubleshooting: order, direction, wildcards and the implicit deny`,hi:`IPv4 ACL troubleshooting: order, direction, wildcards aur implicit deny`},body:{en:`
<p>A door list is read by a guard who is very fast and very literal. He reads from the top, stops at the <b>first</b> line that fits the visitor, and does what that line says. If nothing fits, the unwritten last line applies: "no entry". He never reads the rest of the list, never guesses what you meant, and he only stands at the door you told him to stand at, facing the way you told him to face. Almost every ACL fault is one of those four facts: order, implicit deny, the wrong mask, or the wrong door and direction.</p>

<h3>The five questions for any ACL ticket</h3>
<ol>
<li><b>Is the ACL applied, where, and in which direction?</b> <code>show ip interface Gi0/1 | include access list</code>. An ACL that is written but not applied does nothing; an ACL applied <code>out</code> when you meant <code>in</code> filters different packets.</li>
<li><b>Which line matches first?</b> Walk the packet down the list; a broad <code>deny</code> above a specific <code>permit</code> wins.</li>
<li><b>Are the wildcards right?</b> A subnet mask typed where a wildcard belongs changes the meaning completely.</li>
<li><b>What does the implicit deny catch?</b> Routing protocols, DHCP, return traffic, ICMP unreachables.</li>
<li><b>What do the counters say?</b> <code>show ip access-lists</code> tells you which line really matched.</li>
</ol>

<h3>Direction: in, out and the router's own packets</h3>
<p><b>Inbound</b> means "as the packet enters this interface, before the routing decision". <b>Outbound</b> means "as the packet leaves this interface, after routing". Two facts trip people up:</p>
<ul>
<li>An <b>inbound</b> ACL also filters packets addressed to the router itself: OSPF hellos (IP protocol 89), EIGRP (protocol 88), BGP (TCP 179), SSH, SNMP. An implicit deny inbound on a WAN link can therefore kill the routing adjacency.</li>
<li>An <b>outbound</b> ACL does <b>not</b> filter packets the router generates itself, such as its own pings, OSPF hellos or syslog. So "I pinged from the router and it worked" proves nothing about an outbound ACL; test from a host behind the router.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Inbound versus outbound">
<rect x="250" y="60" width="140" height="80" rx="10" fill="#bae6fd"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">routing decision</text>
<rect x="30" y="75" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="90" y="105" text-anchor="middle" class="svg-ink" font-size="13">LAN 10.1.1.0/24</text>
<rect x="490" y="75" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="550" y="105" text-anchor="middle" class="svg-ink" font-size="13">WAN / OSPF</text>
<line x1="150" y1="100" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="390" y1="100" x2="490" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="200" y="90" text-anchor="middle" class="svg-accent" font-size="12">Gi0/1 in</text>
<text x="440" y="90" text-anchor="middle" class="svg-accent" font-size="12">Gi0/0 out</text>
<text x="440" y="160" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 in also sees</text>
<text x="440" y="176" text-anchor="middle" class="svg-muted" font-size="12">OSPF hellos to R1</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Outbound ACLs skip packets R1 creates itself</text>
</svg><p class="cap">Inbound filters before routing and includes traffic to the router; outbound filters after routing and skips locally generated traffic.</p></div>

<h3>Wildcard errors</h3>
<p>A wildcard mask marks with 1 the bits that do <b>not</b> matter. <code>10.1.1.0 0.0.0.255</code> means "10.1.1.anything". The classic error is typing the subnet mask instead. IOS accepts it, then normalises the address by clearing the don't-care bits, so the mistake is visible in the running configuration:</p>
<pre class="code">R1(config)# access-list 10 permit 10.1.1.0 255.255.255.0
R1# show access-lists 10
Standard IP access list 10
    10 permit 0.0.0.0, wildcard bits 255.255.255.0</pre>
<p>That line now permits every address whose last octet is 0, anywhere, and not the 10.1.1.0/24 hosts you wanted. Other wildcard traps: <code>0.0.0.3</code> is a /30, <code>0.0.1.255</code> is a /23 and must start on an even third octet, and discontiguous masks such as <code>0.0.254.255</code> are legal and match every odd or even third octet, which is clever but hard to read.</p>

<h3>Order and the counters</h3>
<pre class="out">R1# show ip access-lists WAN-IN
Extended IP access list WAN-IN
    10 permit tcp any host 10.1.1.20 eq 443 (1204 matches)
    20 <span class="hl">deny ip 203.0.113.0 0.0.0.255 any (87 matches)</span>
    30 permit tcp 203.0.113.0 0.0.0.255 host 10.1.1.25 eq 22
    40 permit ospf any any (5530 matches)
    50 permit ip any any (98311 matches)</pre>
<p>Line 30 never matches: every packet from 203.0.113.0/24 was already caught by line 20. The fix is not to delete line 20 but to insert the exception above it, for example with sequence 15. Named ACLs and numbered ACLs edited with <code>ip access-list extended 110</code> both accept sequence numbers. Clear the counters with <code>clear ip access-list counters WAN-IN</code> and reproduce the problem so the numbers mean something.</p>

<h3>Standard or extended, and VTY filtering</h3>
<p>A <b>standard</b> ACL (1 to 99, 1300 to 1999) matches only the source address, so it is placed close to the destination or used as a selector (route maps, NAT, SNMP communities, VTY access). An <b>extended</b> ACL (100 to 199, 2000 to 2699) matches protocol, source, destination and ports and is placed close to the source. To restrict who may reach the VTY lines, apply the ACL on the lines with <code>access-class NAME in</code>, not on every interface. <code>show line</code> and <code>show running-config | section line vty</code> confirm it.</p>

<div class="eg"><p><b>Worked example.</b> ACL WAN-IN is applied inbound on the WAN link Gi0/0 and ends with <code>permit tcp any 10.1.1.0 0.0.0.255 established</code> and nothing else. Users can browse, but the OSPF neighbour on Gi0/0 goes down after the dead interval (40 seconds on broadcast links). OSPF is IP protocol 89 and matches no line, so the implicit deny drops the hellos. Add <code>permit ospf any any</code> (or <code>permit ospf host 10.0.12.2 any</code>) above the end of the list. The same logic applies to EIGRP 88 and BGP TCP 179.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Editing a numbered ACL with <code>no access-list 110 permit ...</code>, which deletes the whole ACL 110. Applying an extended ACL for web traffic but forgetting DNS, so "websites do not open". Adding <code>deny ip any any log</code> at the end and then being surprised that CPU rises during an attack; ACL logging is punted to the CPU and is rate limited.</p></div>

<div class="exam"><p><b>Exam trap.</b> Only one ACL per interface, per direction, per protocol (one IPv4 and one IPv6 in each direction). Applying a second <code>ip access-group</code> in the same direction silently replaces the first. And an ACL referenced but not defined permits everything on an interface in IOS.</p></div>

<div class="scn"><h4>SSH worked from the router, not from the users</h4><p>A new outbound ACL on R1 Gi0/0 was meant to allow the admin subnet to SSH to servers beyond the WAN. The engineer tested with <code>ssh -l admin 198.51.100.20</code> from R1 itself and it worked. Admins on 10.1.1.0/24 still failed. The outbound ACL had the wrong source wildcard, but the router's own session was never filtered by an outbound ACL, so the test hid the bug.</p><p><b>Lesson:</b> test ACLs with traffic from a real host behind the router, and read the counters.</p></div>

<div class="iv"><p class="q">"You applied an inbound ACL on a WAN interface and the OSPF neighbour dropped. Why?"</p><p>Strong answer: inbound ACLs filter everything entering the interface, including packets addressed to the router such as OSPF hellos. OSPF is IP protocol 89; if no line permits it, the implicit deny drops the hellos and the neighbour times out after the dead interval. Permit OSPF (and EIGRP 88 or BGP TCP 179 where used) near the top. Mention that outbound ACLs do not filter router-generated packets.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ACLs are read top down, first match wins, and an implicit deny ends every list.</li>
<li>Inbound ACLs also filter traffic to the router: routing protocols and management.</li>
<li>Outbound ACLs do not filter packets the router generates itself.</li>
<li>A subnet mask typed as a wildcard is accepted and normalised; read the running config.</li>
<li>Use sequence numbers to insert exceptions and <code>show ip access-lists</code> counters to prove matches.</li>
</ul></div>
`,hi:`
<p>Door list ek guard padhta hai jo bahut tez aur bahut shabdik hai. Woh upar se padhta hai, <b>pehli</b> line par rukta hai jo visitor par fit baithe, aur wahi karta hai jo woh line kehti hai. Agar kuch fit nahi hota, to anlikhi aakhri line lagti hai: "entry nahi". Woh baaki list kabhi nahi padhta, kabhi andaza nahi lagata ki aapka matlab kya tha, aur sirf usi darwaze par khada hota hai jahan aapne kaha, usi taraf mooh karke jo aapne kaha. Lagbhag har ACL fault in chaar baaton mein se ek hai: order, implicit deny, galat mask, ya galat darwaza aur direction.</p>

<h3>Kisi bhi ACL ticket ke paanch sawaal</h3>
<ol>
<li><b>Kya ACL apply hai, kahan, aur kis direction mein?</b> <code>show ip interface Gi0/1 | include access list</code>. Jo ACL likhi hai par apply nahi hui woh kuch nahi karti; <code>in</code> ki jagah <code>out</code> lagi ACL alag packets filter karti hai.</li>
<li><b>Kaunsi line pehle match karti hai?</b> Packet ko list mein neeche chalao; specific <code>permit</code> ke upar broad <code>deny</code> jeet jaata hai.</li>
<li><b>Kya wildcards sahi hain?</b> Wildcard ki jagah subnet mask likhne se matlab poora badal jaata hai.</li>
<li><b>Implicit deny kya pakadta hai?</b> Routing protocols, DHCP, return traffic, ICMP unreachables.</li>
<li><b>Counters kya kehte hain?</b> <code>show ip access-lists</code> batata hai ki asal mein kaunsi line match hui.</li>
</ol>

<h3>Direction: in, out aur router ke apne packets</h3>
<p><b>Inbound</b> matlab "jab packet is interface mein ghusta hai, routing decision se pehle". <b>Outbound</b> matlab "jab packet is interface se nikalta hai, routing ke baad". Do baatein logon ko phansaati hain:</p>
<ul>
<li><b>Inbound</b> ACL router ko khud address kiye gaye packets bhi filter karti hai: OSPF hellos (IP protocol 89), EIGRP (protocol 88), BGP (TCP 179), SSH, SNMP. Isliye WAN link par inbound implicit deny routing adjacency ko maar sakta hai.</li>
<li><b>Outbound</b> ACL router ke khud banaye packets ko filter <b>nahi</b> karti, jaise uske apne pings, OSPF hellos ya syslog. Isliye "maine router se ping kiya aur chal gaya" outbound ACL ke baare mein kuch sabit nahi karta; router ke peeche ke host se test karo.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Inbound vs outbound">
<rect x="250" y="60" width="140" height="80" rx="10" fill="#bae6fd"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">routing decision</text>
<rect x="30" y="75" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="90" y="105" text-anchor="middle" class="svg-ink" font-size="13">LAN 10.1.1.0/24</text>
<rect x="490" y="75" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="550" y="105" text-anchor="middle" class="svg-ink" font-size="13">WAN / OSPF</text>
<line x1="150" y1="100" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="390" y1="100" x2="490" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="200" y="90" text-anchor="middle" class="svg-accent" font-size="12">Gi0/1 in</text>
<text x="440" y="90" text-anchor="middle" class="svg-accent" font-size="12">Gi0/0 out</text>
<text x="440" y="160" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 in bhi dekhta hai</text>
<text x="440" y="176" text-anchor="middle" class="svg-muted" font-size="12">R1 ke OSPF hellos</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Outbound ACLs R1 ke apne packets chhod deti hain</text>
</svg><p class="cap">Inbound routing se pehle filter karta hai aur router ka traffic bhi shamil karta hai; outbound routing ke baad filter karta hai aur locally generated traffic chhod deta hai.</p></div>

<h3>Wildcard errors</h3>
<p>Wildcard mask 1 se un bits ko mark karta hai jo matter <b>nahi</b> karte. <code>10.1.1.0 0.0.0.255</code> matlab "10.1.1.kuch bhi". Classic galti hai iski jagah subnet mask likhna. IOS use accept karta hai, phir don't-care bits saaf karke address normalise karta hai, isliye galti running configuration mein dikh jaati hai:</p>
<pre class="code">R1(config)# access-list 10 permit 10.1.1.0 255.255.255.0
R1# show access-lists 10
Standard IP access list 10
    10 permit 0.0.0.0, wildcard bits 255.255.255.0</pre>
<p>Woh line ab kahin bhi har woh address permit karti hai jiska aakhri octet 0 hai, aur 10.1.1.0/24 ke hosts nahi jo aap chahte the. Doosre wildcard traps: <code>0.0.0.3</code> ek /30 hai, <code>0.0.1.255</code> ek /23 hai aur even third octet se shuru hona chahiye, aur <code>0.0.254.255</code> jaise discontiguous masks legal hain aur har odd ya even third octet match karte hain, jo chalaak hai par padhne mein mushkil.</p>

<h3>Order aur counters</h3>
<pre class="out">R1# show ip access-lists WAN-IN
Extended IP access list WAN-IN
    10 permit tcp any host 10.1.1.20 eq 443 (1204 matches)
    20 <span class="hl">deny ip 203.0.113.0 0.0.0.255 any (87 matches)</span>
    30 permit tcp 203.0.113.0 0.0.0.255 host 10.1.1.25 eq 22
    40 permit ospf any any (5530 matches)
    50 permit ip any any (98311 matches)</pre>
<p>Line 30 kabhi match nahi hoti: 203.0.113.0/24 ka har packet pehle hi line 20 ne pakad liya. Fix line 20 delete karna nahi, balki uske upar exception insert karna hai, jaise sequence 15 ke saath. Named ACLs aur <code>ip access-list extended 110</code> se edit ki gayi numbered ACLs dono sequence numbers accept karti hain. <code>clear ip access-list counters WAN-IN</code> se counters saaf karo aur problem reproduce karo taaki numbers ka kuch matlab ho.</p>

<h3>Standard ya extended, aur VTY filtering</h3>
<p><b>Standard</b> ACL (1 se 99, 1300 se 1999) sirf source address match karti hai, isliye destination ke paas lagti hai ya selector ki tarah use hoti hai (route maps, NAT, SNMP communities, VTY access). <b>Extended</b> ACL (100 se 199, 2000 se 2699) protocol, source, destination aur ports match karti hai aur source ke paas lagti hai. VTY lines tak kaun pahunche yeh rokne ke liye ACL ko lines par <code>access-class NAME in</code> se lagao, har interface par nahi. <code>show line</code> aur <code>show running-config | section line vty</code> ise confirm karte hain.</p>

<div class="eg"><p><b>Worked example.</b> ACL WAN-IN WAN link Gi0/0 par inbound lagi hai aur <code>permit tcp any 10.1.1.0 0.0.0.255 established</code> par khatam hoti hai, aur kuch nahi. Users browse kar sakte hain, lekin Gi0/0 par OSPF neighbour dead interval (broadcast links par 40 seconds) ke baad down ho jaata hai. OSPF IP protocol 89 hai aur kisi line se match nahi karta, isliye implicit deny hellos drop kar deta hai. List ke end se pehle <code>permit ospf any any</code> (ya <code>permit ospf host 10.0.12.2 any</code>) jodo. Yahi logic EIGRP 88 aur BGP TCP 179 par lagta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Numbered ACL ko <code>no access-list 110 permit ...</code> se edit karna, jo poori ACL 110 delete kar deta hai. Web traffic ke liye extended ACL lagana lekin DNS bhool jaana, isliye "websites nahi khulti". Aakhir mein <code>deny ip any any log</code> jodna aur phir attack ke dauraan CPU badhne par hairaan hona; ACL logging CPU ko punt hoti hai aur rate limited hoti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Har interface par, har direction mein, har protocol ke liye sirf ek ACL (har direction mein ek IPv4 aur ek IPv6). Same direction mein doosra <code>ip access-group</code> lagane se pehla chupchaap replace ho jaata hai. Aur IOS mein interface par reference ki gayi lekin define na ki gayi ACL sab kuch permit karti hai.</p></div>

<div class="scn"><h4>SSH router se chala, users se nahi</h4><p>R1 Gi0/0 par ek nayi outbound ACL ka maqsad tha admin subnet ko WAN ke paar servers par SSH karne dena. Engineer ne R1 se hi <code>ssh -l admin 198.51.100.20</code> se test kiya aur chal gaya. 10.1.1.0/24 ke admins phir bhi fail ho rahe the. Outbound ACL ka source wildcard galat tha, lekin router ka apna session outbound ACL se kabhi filter hi nahi hota, isliye test ne bug chhupa diya.</p><p><b>Seekh:</b> ACLs ko router ke peeche ke asli host ke traffic se test karo, aur counters padho.</p></div>

<div class="iv"><p class="q">"Aapne WAN interface par inbound ACL lagayi aur OSPF neighbour gir gaya. Kyun?"</p><p>Strong answer: inbound ACLs interface mein ghusne wala sab kuch filter karti hain, router ko address kiye packets jaise OSPF hellos samet. OSPF IP protocol 89 hai; agar koi line use permit nahi karti, to implicit deny hellos drop karta hai aur neighbour dead interval ke baad time out ho jaata hai. OSPF (aur jahan use ho wahan EIGRP 88 ya BGP TCP 179) ko upar permit karo. Batao ki outbound ACLs router ke generate kiye packets filter nahi karti.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ACLs upar se neeche padhi jaati hain, pehla match jeet-ta hai, aur har list implicit deny par khatam hoti hai.</li>
<li>Inbound ACLs router ki taraf ka traffic bhi filter karti hain: routing protocols aur management.</li>
<li>Outbound ACLs router ke khud generate kiye packets filter nahi karti.</li>
<li>Wildcard ki jagah likha subnet mask accept aur normalise hota hai; running config padho.</li>
<li>Exceptions insert karne ke liye sequence numbers aur matches sabit karne ke liye <code>show ip access-lists</code> counters use karo.</li>
</ul></div>
`}};export{e as default};