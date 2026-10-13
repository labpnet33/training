var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a long drive you do a quick walk around the car: tyres, lights, fuel, mirrors. It takes two minutes and prevents most problems on the road. This chapter is that walk-around for OSPFv3. Read it the evening before an exam or an interview, tick every item you can do without notes, and go back to the chapter for anything you cannot.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Explain in two sentences why OSPFv3 exists and what stays the same as OSPFv2.</li>
<li>List the differences: per-link operation, link-local sources and next hops, FF02::5 and FF02::6, no network command, no mask in Hellos, new LSA types 8 and 9, IPsec authentication, Instance ID.</li>
<li>State the router ID rules and fix NORTRID on an IPv6-only router.</li>
<li>Configure the module lab in classic style: <code>ipv6 unicast-routing</code>, <code>ipv6 router ospf 10</code>, <code>router-id</code>, <code>ipv6 ospf 10 area 0</code> per interface.</li>
<li>Configure the same in address-family style with <code>router ospfv3</code> and <code>ospfv3 10 ipv6 area 0</code>.</li>
<li>Make LAN interfaces passive and originate a default route, and predict the <code>OE2 ::/0</code> entry.</li>
<li>Read <code>show ipv6 ospf neighbor</code>, <code>interface brief</code>, <code>database</code> and <code>show ipv6 route ospf</code> line by line.</li>
<li>Run OSPFv2 and OSPFv3 side by side and explain why failures can be protocol-specific.</li>
<li>Follow the troubleshooting workflow and map a stuck state to its cause.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="OSPFv3 at a glance">
<rect x="10" y="10" width="200" height="88" rx="8" fill="#bae6fd"/><text x="110" y="35" text-anchor="middle" class="svg-ink" font-size="13">Same as OSPFv2</text><text x="110" y="57" text-anchor="middle" class="svg-muted" font-size="12">SPF, areas, DR/BDR</text><text x="110" y="77" text-anchor="middle" class="svg-muted" font-size="12">cost, AD 110, 32-bit RID</text>
<rect x="220" y="10" width="200" height="88" rx="8" fill="#bbf7d0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">New in OSPFv3</text><text x="320" y="57" text-anchor="middle" class="svg-muted" font-size="12">link-local, FF02::5/6</text><text x="320" y="77" text-anchor="middle" class="svg-muted" font-size="12">LSA 8 and 9, IPsec</text>
<rect x="430" y="10" width="200" height="88" rx="8" fill="#fde68a"/><text x="530" y="35" text-anchor="middle" class="svg-ink" font-size="13">Must configure</text><text x="530" y="57" text-anchor="middle" class="svg-muted" font-size="12">unicast-routing</text><text x="530" y="77" text-anchor="middle" class="svg-muted" font-size="12">router-id, per-int enable</text>
<rect x="10" y="112" width="305" height="88" rx="8" fill="#ddd6fe"/><text x="162" y="137" text-anchor="middle" class="svg-ink" font-size="13">Classic</text><text x="162" y="159" text-anchor="middle" class="svg-muted" font-size="12">ipv6 router ospf 10</text><text x="162" y="179" text-anchor="middle" class="svg-muted" font-size="12">int: ipv6 ospf 10 area 0</text>
<rect x="325" y="112" width="305" height="88" rx="8" fill="#fed7aa"/><text x="477" y="137" text-anchor="middle" class="svg-ink" font-size="13">Address family</text><text x="477" y="159" text-anchor="middle" class="svg-muted" font-size="12">router ospfv3 10 + af ipv6</text><text x="477" y="179" text-anchor="middle" class="svg-muted" font-size="12">int: ospfv3 10 ipv6 area 0</text>
</svg><p class="cap">The whole module on one page.</p></div>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Standard</td><td>RFC 5340 (OSPFv3); RFC 5838 for address families</td></tr>
<tr><td>Transport</td><td>Directly over IPv6, Next Header 89</td></tr>
<tr><td>AllSPFRouters / AllDRouters</td><td>FF02::5 / FF02::6</td></tr>
<tr><td>Source address of OSPF packets</td><td>Link-local (FE80::/10)</td></tr>
<tr><td>Next hop in IPv6 routing table</td><td>Neighbour's link-local plus exit interface</td></tr>
<tr><td>Router ID</td><td>32-bit; <code>router-id</code>, else highest IPv4 loopback, else highest IPv4 interface</td></tr>
<tr><td>IPv6-only router, no RID</td><td>%OSPFv3-4-NORTRID, no neighbours</td></tr>
<tr><td>Administrative distance</td><td>110</td></tr>
<tr><td>Default timers (broadcast, P2P)</td><td>Hello 10 s, dead 40 s</td></tr>
<tr><td>Route codes</td><td>O, OI, OE1, OE2, ON1, ON2</td></tr>
<tr><td>New LSAs</td><td>Type 8 Link (link scope), Type 9 Intra-Area Prefix (area scope)</td></tr>
<tr><td>Authentication</td><td>IPsec AH/ESP (classic); authentication trailer on newer releases</td></tr>
<tr><td>Must match for adjacency</td><td>Area, hello/dead, stub flags, Instance ID, authentication; MTU for FULL</td></tr>
<tr><td>Need not match</td><td>Global prefixes, process ID</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Classic</span>
ipv6 unicast-routing
ipv6 router ospf 10
 router-id 1.1.1.1
 passive-interface GigabitEthernet0/1
 default-information originate
 auto-cost reference-bandwidth 10000
interface GigabitEthernet0/0
 ipv6 ospf 10 area 0
 ipv6 ospf cost 10
 ipv6 ospf priority 0
 ipv6 ospf network point-to-point
<span class="c">! Address family</span>
router ospfv3 10
 router-id 1.1.1.1
 address-family ipv6 unicast
  passive-interface GigabitEthernet0/1
  default-information originate
 exit-address-family
interface GigabitEthernet0/0
 ospfv3 10 ipv6 area 0
<span class="c">! Verify</span>
show ipv6 protocols
show ipv6 ospf interface brief
show ipv6 ospf neighbor [detail]
show ipv6 ospf database
show ipv6 route ospf
show ospfv3 neighbor
clear ipv6 ospf process
debug ipv6 ospf hello   <span class="c">! then undebug all</span></pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>OSPFv3</dt><dd>OSPF version 3, the link-state IGP for IPv6 (RFC 5340).</dd>
<dt>Link-local address</dt><dd>FE80::/10 address valid only on one link; OSPFv3 sources packets from it and uses it as next hop.</dd>
<dt>FF02::5 / FF02::6</dt><dd>AllSPFRouters and AllDRouters multicast groups.</dd>
<dt>Router ID</dt><dd>32-bit identifier of an OSPF router, written in dotted decimal.</dd>
<dt>Interface ID</dt><dd>Number a router assigns to its interface; carried in Hellos and LSAs instead of an address.</dd>
<dt>Instance ID</dt><dd>Field allowing several OSPFv3 instances on one link; IPv6 AF uses 0 by default.</dd>
<dt>Link LSA (type 8)</dt><dd>Link-scope LSA with the router's link-local address and link prefixes.</dd>
<dt>Intra-Area Prefix LSA (type 9)</dt><dd>Area-scope LSA carrying IPv6 prefixes, separated from topology.</dd>
<dt>Address family</dt><dd>The <code>router ospfv3</code> model where one process can carry IPv6 and IPv4.</dd>
<dt>Passive interface</dt><dd>Interface that advertises its prefix but sends no Hellos.</dd>
<dt>NORTRID</dt><dd>Log message when OSPFv3 cannot choose a router ID.</dd>
</dl>

<div class="eg"><p><b>Worked example: final self-test.</b> Without notes, write the complete configuration for R2 in the lab (RID 2.2.2.2, both interfaces in area 0, process 10), then write the output line you expect on R2 for R3 in <code>show ipv6 ospf neighbor</code>. Answer: <code>ipv6 router ospf 10</code>, <code>router-id 2.2.2.2</code>, <code>ipv6 ospf 10 area 0</code> on Gi0/0 and Gi0/1; <code>3.3.3.3  1  FULL/DR  00:00:3x  3  GigabitEthernet0/1</code>. If you got both, you are ready for the lab.</p></div>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> Writing FF02::1 instead of FF02::5; saying the router ID comes from an IPv6 address; typing <code>ip ospf</code> instead of <code>ipv6 ospf</code>; forgetting that passive interfaces still advertise; expecting global prefixes to be checked in Hellos.</p></div>
<div class="exam"><p><b>Exam trap summary.</b> Read each option for the exact keyword: <code>ipv6 ospf 10 area 0</code> (interface, classic), <code>ospfv3 10 ipv6 area 0</code> (interface, AF), <code>ipv6 router ospf 10</code> (global, classic), <code>router ospfv3 10</code> (global, AF). Options that mix them, such as <code>ipv6 router ospf 10 area 0</code>, are invalid.</p></div>

<div class="scn"><h4>The interview that turned on one detail</h4><p>A fresher interviewing at a managed-services company was asked to configure OSPFv3 on a whiteboard for two IPv6-only routers. She wrote <code>ipv6 unicast-routing</code>, the process, the interface lines, then paused and added <code>router-id</code> to both, explaining that with no IPv4 address the routers could not choose an ID. The interviewer said most candidates missed that line and then could not explain why the neighbours never came up. She also mentioned that the next hops would be link-local. She got the offer.</p><p><b>Lesson:</b> the small OSPFv3-specific details are exactly what interviewers use to separate memorisers from engineers.</p></div>

<div class="iv"><p class="q">"Give me a two-minute summary of OSPFv3."</p><p>Strong answer: OSPFv3 is OSPF for IPv6. It keeps OSPFv2's link-state engine: areas, SPF, DR/BDR, cost, AD 110 and a 32-bit router ID. It runs per link using link-local addresses and FF02::5/FF02::6, is enabled per interface with no network command, separates topology from prefixes with new LSAs such as types 8 and 9, and relies on IPsec for authentication. Configure it with <code>ipv6 router ospf</code> or <code>router ospfv3</code>, set the router ID on IPv6-only routers, and verify with <code>show ipv6 ospf neighbor</code> and <code>show ipv6 route ospf</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPFv3 equals the OSPFv2 engine plus IPv6-specific packets and addressing.</li>
<li>Prerequisites: <code>ipv6 unicast-routing</code> and a router ID on IPv6-only routers.</li>
<li>Two configuration styles, one protocol; both enable per interface.</li>
<li>Verification and troubleshooting follow a fixed order from process to ping.</li>
<li>Memorise the most-tested facts table; it covers nearly every exam question on OSPFv3.</li>
</ul></div>
`,hi:`
<p>Lambi drive se pehle aap car ke chaaron taraf ek chakkar lagate ho: tyres, lights, fuel, mirrors. Do minute lagte hain aur road par zyada tar problems bach jaati hain. Yeh chapter OSPFv3 ke liye wahi chakkar hai. Ise exam ya interview se pehle ki shaam padho, har woh item tick karo jo bina notes ke kar sakte ho, aur jo nahi kar sakte uske liye chapter par wapas jao.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Do sentences mein samjhao ki OSPFv3 kyun hai aur OSPFv2 jaisa kya same rehta hai.</li>
<li>Differences list karo: per-link operation, link-local sources aur next hops, FF02::5 aur FF02::6, network command nahi, Hellos mein mask nahi, naye LSA types 8 aur 9, IPsec authentication, Instance ID.</li>
<li>Router ID rules batao aur IPv6-only router par NORTRID fix karo.</li>
<li>Module lab ko classic style mein configure karo: <code>ipv6 unicast-routing</code>, <code>ipv6 router ospf 10</code>, <code>router-id</code>, har interface par <code>ipv6 ospf 10 area 0</code>.</li>
<li>Yahi <code>router ospfv3</code> aur <code>ospfv3 10 ipv6 area 0</code> ke saath address-family style mein configure karo.</li>
<li>LAN interfaces passive banao aur default route originate karo, aur <code>OE2 ::/0</code> entry predict karo.</li>
<li><code>show ipv6 ospf neighbor</code>, <code>interface brief</code>, <code>database</code> aur <code>show ipv6 route ospf</code> ko line by line padho.</li>
<li>OSPFv2 aur OSPFv3 saath saath chalao aur samjhao ki failures protocol-specific kyun ho sakte hain.</li>
<li>Troubleshooting workflow follow karo aur atki state ko uske cause se map karo.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="OSPFv3 ek nazar mein">
<rect x="10" y="10" width="200" height="88" rx="8" fill="#bae6fd"/><text x="110" y="35" text-anchor="middle" class="svg-ink" font-size="13">OSPFv2 jaisa same</text><text x="110" y="57" text-anchor="middle" class="svg-muted" font-size="12">SPF, areas, DR/BDR</text><text x="110" y="77" text-anchor="middle" class="svg-muted" font-size="12">cost, AD 110, 32-bit RID</text>
<rect x="220" y="10" width="200" height="88" rx="8" fill="#bbf7d0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">OSPFv3 mein naya</text><text x="320" y="57" text-anchor="middle" class="svg-muted" font-size="12">link-local, FF02::5/6</text><text x="320" y="77" text-anchor="middle" class="svg-muted" font-size="12">LSA 8 aur 9, IPsec</text>
<rect x="430" y="10" width="200" height="88" rx="8" fill="#fde68a"/><text x="530" y="35" text-anchor="middle" class="svg-ink" font-size="13">Configure karna hi hai</text><text x="530" y="57" text-anchor="middle" class="svg-muted" font-size="12">unicast-routing</text><text x="530" y="77" text-anchor="middle" class="svg-muted" font-size="12">router-id, har int enable</text>
<rect x="10" y="112" width="305" height="88" rx="8" fill="#ddd6fe"/><text x="162" y="137" text-anchor="middle" class="svg-ink" font-size="13">Classic</text><text x="162" y="159" text-anchor="middle" class="svg-muted" font-size="12">ipv6 router ospf 10</text><text x="162" y="179" text-anchor="middle" class="svg-muted" font-size="12">int: ipv6 ospf 10 area 0</text>
<rect x="325" y="112" width="305" height="88" rx="8" fill="#fed7aa"/><text x="477" y="137" text-anchor="middle" class="svg-ink" font-size="13">Address family</text><text x="477" y="159" text-anchor="middle" class="svg-muted" font-size="12">router ospfv3 10 + af ipv6</text><text x="477" y="179" text-anchor="middle" class="svg-muted" font-size="12">int: ospfv3 10 ipv6 area 0</text>
</svg><p class="cap">Poora module ek page par.</p></div>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Standard</td><td>RFC 5340 (OSPFv3); address families ke liye RFC 5838</td></tr>
<tr><td>Transport</td><td>Seedha IPv6 par, Next Header 89</td></tr>
<tr><td>AllSPFRouters / AllDRouters</td><td>FF02::5 / FF02::6</td></tr>
<tr><td>OSPF packets ka source address</td><td>Link-local (FE80::/10)</td></tr>
<tr><td>IPv6 routing table mein next hop</td><td>Neighbour ka link-local plus exit interface</td></tr>
<tr><td>Router ID</td><td>32-bit; <code>router-id</code>, warna highest IPv4 loopback, warna highest IPv4 interface</td></tr>
<tr><td>IPv6-only router, RID nahi</td><td>%OSPFv3-4-NORTRID, koi neighbour nahi</td></tr>
<tr><td>Administrative distance</td><td>110</td></tr>
<tr><td>Default timers (broadcast, P2P)</td><td>Hello 10 s, dead 40 s</td></tr>
<tr><td>Route codes</td><td>O, OI, OE1, OE2, ON1, ON2</td></tr>
<tr><td>Naye LSAs</td><td>Type 8 Link (link scope), Type 9 Intra-Area Prefix (area scope)</td></tr>
<tr><td>Authentication</td><td>IPsec AH/ESP (classic); naye releases par authentication trailer</td></tr>
<tr><td>Adjacency ke liye match hona chahiye</td><td>Area, hello/dead, stub flags, Instance ID, authentication; FULL ke liye MTU</td></tr>
<tr><td>Match hona zaroori nahi</td><td>Global prefixes, process ID</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Classic</span>
ipv6 unicast-routing
ipv6 router ospf 10
 router-id 1.1.1.1
 passive-interface GigabitEthernet0/1
 default-information originate
 auto-cost reference-bandwidth 10000
interface GigabitEthernet0/0
 ipv6 ospf 10 area 0
 ipv6 ospf cost 10
 ipv6 ospf priority 0
 ipv6 ospf network point-to-point
<span class="c">! Address family</span>
router ospfv3 10
 router-id 1.1.1.1
 address-family ipv6 unicast
  passive-interface GigabitEthernet0/1
  default-information originate
 exit-address-family
interface GigabitEthernet0/0
 ospfv3 10 ipv6 area 0
<span class="c">! Verify</span>
show ipv6 protocols
show ipv6 ospf interface brief
show ipv6 ospf neighbor [detail]
show ipv6 ospf database
show ipv6 route ospf
show ospfv3 neighbor
clear ipv6 ospf process
debug ipv6 ospf hello   <span class="c">! phir undebug all</span></pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>OSPFv3</dt><dd>OSPF version 3, IPv6 ke liye link-state IGP (RFC 5340).</dd>
<dt>Link-local address</dt><dd>FE80::/10 address jo sirf ek link par valid hai; OSPFv3 packets isi se source karta hai aur ise next hop ki tarah use karta hai.</dd>
<dt>FF02::5 / FF02::6</dt><dd>AllSPFRouters aur AllDRouters multicast groups.</dd>
<dt>Router ID</dt><dd>OSPF router ka 32-bit identifier, dotted decimal mein likha jaata hai.</dd>
<dt>Interface ID</dt><dd>Number jo router apne interface ko deta hai; address ki jagah Hellos aur LSAs mein jaata hai.</dd>
<dt>Instance ID</dt><dd>Field jo ek link par kai OSPFv3 instances allow karti hai; IPv6 AF default mein 0 use karta hai.</dd>
<dt>Link LSA (type 8)</dt><dd>Link-scope LSA jismein router ka link-local address aur link prefixes hote hain.</dd>
<dt>Intra-Area Prefix LSA (type 9)</dt><dd>Area-scope LSA jo IPv6 prefixes le jaata hai, topology se alag.</dd>
<dt>Address family</dt><dd><code>router ospfv3</code> model jahan ek process IPv6 aur IPv4 dono le ja sakta hai.</dd>
<dt>Passive interface</dt><dd>Interface jo apna prefix advertise karta hai lekin Hellos nahi bhejta.</dd>
<dt>NORTRID</dt><dd>Log message jab OSPFv3 router ID nahi chun paata.</dd>
</dl>

<div class="eg"><p><b>Worked example: final self-test.</b> Bina notes ke lab mein R2 ki poori configuration likho (RID 2.2.2.2, dono interfaces area 0 mein, process 10), phir woh output line likho jo aap R2 par <code>show ipv6 ospf neighbor</code> mein R3 ke liye expect karte ho. Jawab: <code>ipv6 router ospf 10</code>, <code>router-id 2.2.2.2</code>, Gi0/0 aur Gi0/1 par <code>ipv6 ospf 10 area 0</code>; <code>3.3.3.3  1  FULL/DR  00:00:3x  3  GigabitEthernet0/1</code>. Agar dono sahi aaye, to aap lab ke liye ready ho.</p></div>

<div class="warn"><p><b>Last-minute galtiyan jo avoid karni hain.</b> FF02::5 ki jagah FF02::1 likhna; kehna ki router ID IPv6 address se aata hai; <code>ipv6 ospf</code> ki jagah <code>ip ospf</code> type karna; bhoolna ki passive interfaces phir bhi advertise karte hain; expect karna ki Hellos mein global prefixes check hote hain.</p></div>
<div class="exam"><p><b>Exam trap summary.</b> Har option mein exact keyword padho: <code>ipv6 ospf 10 area 0</code> (interface, classic), <code>ospfv3 10 ipv6 area 0</code> (interface, AF), <code>ipv6 router ospf 10</code> (global, classic), <code>router ospfv3 10</code> (global, AF). Jo options inhe mix karte hain, jaise <code>ipv6 router ospf 10 area 0</code>, woh invalid hain.</p></div>

<div class="scn"><h4>Interview jo ek detail par palat gaya</h4><p>Ek managed-services company mein interview de rahi ek fresher se whiteboard par do IPv6-only routers ke liye OSPFv3 configure karne ko kaha gaya. Usne <code>ipv6 unicast-routing</code>, process, interface lines likhi, phir ruki aur dono par <code>router-id</code> joda, yeh samjhate hue ki koi IPv4 address na hone se routers ID nahi chun paayenge. Interviewer ne kaha ki zyada tar candidates woh line miss karte hain aur phir samjha nahi paate ki neighbours kabhi up kyun nahi hue. Usne yeh bhi bataya ki next hops link-local honge. Use offer mil gaya.</p><p><b>Seekh:</b> chhoti OSPFv3-specific details hi woh cheez hain jinse interviewers ratne walon ko engineers se alag karte hain.</p></div>

<div class="iv"><p class="q">"Mujhe OSPFv3 ka do minute ka summary do."</p><p>Strong answer: OSPFv3 IPv6 ke liye OSPF hai. Yeh OSPFv2 ka link-state engine rakhta hai: areas, SPF, DR/BDR, cost, AD 110 aur 32-bit router ID. Yeh link-local addresses aur FF02::5/FF02::6 use karke per link chalta hai, bina network command ke per interface enable hota hai, naye LSAs jaise types 8 aur 9 se topology ko prefixes se alag karta hai, aur authentication ke liye IPsec par depend karta hai. Ise <code>ipv6 router ospf</code> ya <code>router ospfv3</code> se configure karo, IPv6-only routers par router ID set karo, aur <code>show ipv6 ospf neighbor</code> aur <code>show ipv6 route ospf</code> se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPFv3 = OSPFv2 engine plus IPv6-specific packets aur addressing.</li>
<li>Prerequisites: <code>ipv6 unicast-routing</code> aur IPv6-only routers par router ID.</li>
<li>Do configuration styles, ek protocol; dono per interface enable karte hain.</li>
<li>Verification aur troubleshooting process se ping tak fixed order follow karte hain.</li>
<li>Most-tested facts table yaad karo; yeh OSPFv3 ke lagbhag har exam question ko cover karti hai.</li>
</ul></div>
`}};export{e as default};