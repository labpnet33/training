var e={id:`dynamic`,h:{en:`OSPF and BGP refresher for the fabric underlay and overlay`,hi:`Fabric underlay aur overlay ke liye OSPF aur BGP refresher`},body:{en:`
<p>Static routes are like handing every driver a printed map: fine for a village, hopeless for a city where roads close every day. A <b>routing protocol</b> is like a live navigation app that every car shares: when a road closes, everybody learns within seconds and picks another way. In a data center fabric two protocols dominate. <b>OSPF</b> (or its cousin IS-IS) often builds the <b>underlay</b>, the plain IP reachability between switch loopbacks. <b>BGP</b> carries the <b>overlay</b> information (EVPN) and, in large fabrics, the underlay too. This chapter gives you exactly the level you need before spine-leaf and VXLAN.</p>

<h3>OSPF in the data center</h3>
<p>OSPF is a <b>link-state</b> protocol: every router describes its links in <b>LSAs</b> (link-state advertisements), floods them to all routers in the area, and each router runs the SPF (Dijkstra) algorithm on the same database to compute shortest paths. Key terms:</p>
<ul>
<li><b>Router ID</b>: a 32-bit ID, set it to the loopback0 address so it is stable and readable.</li>
<li><b>Area</b>: a group of routers sharing one database. <b>Area 0</b> (0.0.0.0) is the backbone. A typical fabric underlay is a single area 0.</li>
<li><b>Neighbours</b>: routers on a shared link exchange hellos (every 10 s, dead after 40 s by default) and move through states Down, Init, 2-Way, ExStart, Exchange, Loading, <b>Full</b>. Hello and dead timers, area, subnet, authentication and MTU must match.</li>
<li><b>LSAs you should recognise</b>: type 1 router, type 2 network (made by the DR on broadcast segments), type 3 summary between areas, type 5 external (redistributed routes).</li>
<li><b>Network type</b>: on Ethernet the default is <b>broadcast</b>, which elects a DR and BDR and adds a type 2 LSA. A leaf-to-spine /31 has only two routers, so we set <b>point-to-point</b>: no DR election, faster adjacency, a smaller database.</li>
</ul>

<pre class="code"><span class="c">! OSPF underlay on a leaf (NX-OS uses a process tag and interface-level config)</span>
LEAF1(config)# feature ospf
LEAF1(config)# router ospf UNDERLAY
LEAF1(config-router)# router-id 10.255.0.1
LEAF1(config)# interface loopback0
LEAF1(config-if)# ip router ospf UNDERLAY area 0.0.0.0
LEAF1(config)# interface Ethernet1/49
LEAF1(config-if)# ip ospf network point-to-point
LEAF1(config-if)# ip router ospf UNDERLAY area 0.0.0.0</pre>
<pre class="out">LEAF1# show ip ospf neighbors
 OSPF Process ID UNDERLAY VRF default
 Total number of neighbors: 2
 Neighbor ID     Pri State            Up Time  Address         Interface
<span class="hl"> 10.255.0.11       1 FULL/ -          3d01h    10.1.0.0        Eth1/49
 10.255.0.12       1 FULL/ -          3d01h    10.1.1.0        Eth1/50</span></pre>
<p><code>FULL/ -</code> means the adjacency is complete and there is no DR role, as expected on point-to-point links. Notice that on NX-OS there is no <code>network</code> statement: you enable OSPF on each interface.</p>

<h3>BGP in the data center</h3>
<p>BGP is a <b>path-vector</b> protocol built to carry very large numbers of routes with rich policy. It runs over <b>TCP port 179</b>, and neighbours are configured explicitly (no automatic discovery). Each routing domain has an <b>AS number</b>: private 2-byte ASNs are 64512 to 65534, and 4-byte private ASNs are 4200000000 to 4294967294.</p>
<table class="cmp"><tr><th></th><th>eBGP</th><th>iBGP</th></tr>
<tr><td>Neighbours in</td><td>Different AS</td><td>Same AS</td></tr>
<tr><td>AD on NX-OS</td><td>20</td><td>200</td></tr>
<tr><td>Loop prevention</td><td>AS_PATH (reject routes containing own AS)</td><td>Do not re-advertise iBGP routes to iBGP peers: needs full mesh or <b>route reflectors</b></td></tr>
<tr><td>Next hop</td><td>Changed to self</td><td>Unchanged by default</td></tr>
<tr><td>Typical peering address</td><td>Directly connected link IP</td><td>Loopback (with <code>update-source loopback0</code>)</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Two BGP fabric designs">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="13">OSPF underlay + iBGP EVPN</text>
<rect x="100" y="35" width="120" height="34" rx="6" fill="#ddd6fe"/><text x="160" y="57" text-anchor="middle" class="svg-ink" font-size="12">Spine = RR, AS 65001</text>
<rect x="30" y="150" width="110" height="34" rx="6" fill="#bae6fd"/><text x="85" y="172" text-anchor="middle" class="svg-ink" font-size="12">Leaf AS 65001</text>
<rect x="180" y="150" width="110" height="34" rx="6" fill="#bae6fd"/><text x="235" y="172" text-anchor="middle" class="svg-ink" font-size="12">Leaf AS 65001</text>
<line x1="140" y1="69" x2="85" y2="150" stroke="#64748b" stroke-width="2"/><line x1="180" y1="69" x2="235" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="13">eBGP underlay + overlay</text>
<rect x="420" y="35" width="120" height="34" rx="6" fill="#ddd6fe"/><text x="480" y="57" text-anchor="middle" class="svg-ink" font-size="12">Spines AS 65000</text>
<rect x="350" y="150" width="110" height="34" rx="6" fill="#bae6fd"/><text x="405" y="172" text-anchor="middle" class="svg-ink" font-size="12">Leaf AS 65011</text>
<rect x="500" y="150" width="110" height="34" rx="6" fill="#bae6fd"/><text x="555" y="172" text-anchor="middle" class="svg-ink" font-size="12">Leaf AS 65012</text>
<line x1="460" y1="69" x2="405" y2="150" stroke="#64748b" stroke-width="2"/><line x1="500" y1="69" x2="555" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="12">Both designs are common; the exam expects you to know both</text>
</svg><p class="cap">Left: spines as iBGP route reflectors for EVPN over an OSPF underlay. Right: one AS per leaf, eBGP everywhere.</p></div>

<pre class="code"><span class="c">! eBGP from a leaf to one spine, advertising its loopback</span>
LEAF1(config)# feature bgp
LEAF1(config)# router bgp 65011
LEAF1(config-router)# router-id 10.255.0.1
LEAF1(config-router)# address-family ipv4 unicast
LEAF1(config-router-af)# network 10.255.0.1/32
LEAF1(config-router-af)# maximum-paths 4
LEAF1(config-router)# neighbor 10.1.0.0
LEAF1(config-router-neighbor)# remote-as 65000
LEAF1(config-router-neighbor)# address-family ipv4 unicast</pre>
<pre class="out">LEAF1# show bgp ipv4 unicast summary
BGP router identifier 10.255.0.1, local AS number 65011
Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">10.1.0.0        4 65000    4521    4519       42    0    0    3d01h 24</span>
10.1.1.0        4 65000    4518    4520       42    0    0    3d01h 24</pre>
<p>A number in the last column means the session is <b>Established</b> and shows how many prefixes were received. A word such as <code>Idle</code> or <code>Active</code> means it is not up: check reachability, AS numbers and <code>update-source</code>. Note also that on NX-OS a neighbour must be activated in each address family, and BGP uses only one path unless you set <code>maximum-paths</code>.</p>

<h3>Why BGP carries EVPN later</h3>
<p>BGP can carry many kinds of reachability through <b>address families</b>: IPv4 unicast, IPv6 unicast, VPNv4 and <b>L2VPN EVPN</b>. EVPN uses BGP to advertise MAC addresses, host IP addresses and VTEP locations, with extended communities (route targets) to keep tenants apart. That is why every VXLAN EVPN fabric runs BGP, even if the underlay is OSPF. You will see <code>address-family l2vpn evpn</code> and <code>send-community extended</code> on every leaf in the EVPN module.</p>

<div class="eg"><p><b>Worked example: how many sessions?</b> 4 spines, 32 leaves. With spines as iBGP route reflectors each leaf peers only with 4 spines: 32 × 4 = <b>128</b> sessions. A full iBGP mesh among 36 switches would need 36 × 35 ÷ 2 = <b>630</b> sessions. Route reflectors (or eBGP per leaf) are what make BGP practical in a fabric.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Leaving OSPF on broadcast network type on /31 links (a pointless DR election). OSPF MTU mismatch leaving neighbours stuck in ExStart. iBGP between loopbacks without <code>update-source loopback0</code>. Forgetting <code>feature ospf</code> or <code>feature bgp</code>, so the commands are rejected.</p></div>
<div class="exam"><p><b>Exam tip.</b> OSPF: link-state, area 0 backbone, hellos 10/40, neighbour states up to FULL, LSA types 1, 2, 3, 5, point-to-point avoids DR. BGP: TCP 179, eBGP AD 20, iBGP AD 200, iBGP needs full mesh or route reflectors, private ASNs 64512 to 65534, EVPN is a BGP address family.</p></div>

<div class="scn"><h4>New leaf never gets its BGP session up</h4><p>LEAF9 was added to an iBGP EVPN fabric. <code>show bgp l2vpn evpn summary</code> showed both spines in state <code>Active</code>. The underlay was fine: <code>ping 10.255.0.11 source 10.255.0.9</code> succeeded. <code>show running-config bgp</code> revealed the neighbour statements lacked <code>update-source loopback0</code>, so LEAF9 sourced TCP from its physical interface address, which the spines did not recognise as a configured neighbour. Adding the update-source brought both sessions to Established within seconds.</p><p><b>Lesson:</b> loopback-to-loopback BGP needs the source to match what the peer expects.</p></div>

<div class="iv"><p class="q">"Why do data center fabrics use BGP when OSPF already works?"</p><p>Strong answer: OSPF (or IS-IS) is excellent for a simple underlay, but BGP scales to huge route counts, has rich policy, and through address families carries L2VPN EVPN (MACs, IPs, VTEPs, route targets) that OSPF cannot. Designs are either OSPF underlay with iBGP EVPN using spines as route reflectors, or eBGP for both with an ASN per leaf. Mention ECMP with <code>maximum-paths</code> and point-to-point OSPF network type.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPF: link-state, LSAs, SPF; single area 0 underlay with point-to-point links and loopback router IDs.</li>
<li>OSPF neighbours need matching area, timers, subnet, authentication and MTU to reach FULL.</li>
<li>BGP: TCP 179, eBGP (different AS, AD 20) and iBGP (same AS, AD 200, needs RR or full mesh).</li>
<li>NX-OS: <code>feature ospf</code> / <code>feature bgp</code>, interface-level OSPF, per-neighbour address families.</li>
<li>EVPN is a BGP address family: that is why every VXLAN fabric runs BGP.</li>
</ul></div>
`,hi:`
<p>Static routes har driver ko printed map dene jaise hain: gaon ke liye theek, lekin us shehar ke liye bekaar jahan roz roads band hoti hain. <b>Routing protocol</b> ek live navigation app jaisa hai jo har car share karti hai: jab road band hoti hai, sabko seconds mein pata chal jaata hai aur woh dusra raasta chunte hain. Data center fabric mein do protocols chhaaye rehte hain. <b>OSPF</b> (ya uska cousin IS-IS) aksar <b>underlay</b> banata hai, yaani switch loopbacks ke beech plain IP reachability. <b>BGP</b> <b>overlay</b> information (EVPN) le jaata hai aur, bade fabrics mein, underlay bhi. Yeh chapter aapko bilkul utna level deta hai jitna spine-leaf aur VXLAN se pehle chahiye.</p>

<h3>Data center mein OSPF</h3>
<p>OSPF ek <b>link-state</b> protocol hai: har router apne links ko <b>LSAs</b> (link-state advertisements) mein describe karta hai, unhe area ke saare routers tak flood karta hai, aur har router same database par SPF (Dijkstra) algorithm chala kar shortest paths nikalta hai. Key terms:</p>
<ul>
<li><b>Router ID</b>: 32-bit ID, ise loopback0 address par set karo taaki stable aur readable rahe.</li>
<li><b>Area</b>: ek database share karne wale routers ka group. <b>Area 0</b> (0.0.0.0) backbone hai. Typical fabric underlay ek single area 0 hota hai.</li>
<li><b>Neighbours</b>: shared link par routers hellos exchange karte hain (default mein har 10 s, 40 s baad dead) aur states Down, Init, 2-Way, ExStart, Exchange, Loading, <b>Full</b> se guzarte hain. Hello aur dead timers, area, subnet, authentication aur MTU match hone chahiye.</li>
<li><b>LSAs jo pehchaanne chahiye</b>: type 1 router, type 2 network (broadcast segments par DR banata hai), type 3 areas ke beech summary, type 5 external (redistributed routes).</li>
<li><b>Network type</b>: Ethernet par default <b>broadcast</b> hai, jo DR aur BDR elect karta hai aur type 2 LSA jodta hai. Leaf-to-spine /31 par sirf do routers hote hain, isliye hum <b>point-to-point</b> set karte hain: koi DR election nahi, tez adjacency, chhota database.</li>
</ul>

<pre class="code"><span class="c">! leaf par OSPF underlay (NX-OS process tag aur interface-level config use karta hai)</span>
LEAF1(config)# feature ospf
LEAF1(config)# router ospf UNDERLAY
LEAF1(config-router)# router-id 10.255.0.1
LEAF1(config)# interface loopback0
LEAF1(config-if)# ip router ospf UNDERLAY area 0.0.0.0
LEAF1(config)# interface Ethernet1/49
LEAF1(config-if)# ip ospf network point-to-point
LEAF1(config-if)# ip router ospf UNDERLAY area 0.0.0.0</pre>
<pre class="out">LEAF1# show ip ospf neighbors
 OSPF Process ID UNDERLAY VRF default
 Total number of neighbors: 2
 Neighbor ID     Pri State            Up Time  Address         Interface
<span class="hl"> 10.255.0.11       1 FULL/ -          3d01h    10.1.0.0        Eth1/49
 10.255.0.12       1 FULL/ -          3d01h    10.1.1.0        Eth1/50</span></pre>
<p><code>FULL/ -</code> ka matlab adjacency complete hai aur koi DR role nahi hai, jaisa point-to-point links par expected hai. Dhyaan do ki NX-OS par koi <code>network</code> statement nahi hota: aap har interface par OSPF enable karte ho.</p>

<h3>Data center mein BGP</h3>
<p>BGP ek <b>path-vector</b> protocol hai jo bahut zyada routes ko rich policy ke saath le jaane ke liye bana hai. Yeh <b>TCP port 179</b> par chalta hai, aur neighbours explicitly configure kiye jaate hain (koi automatic discovery nahi). Har routing domain ka ek <b>AS number</b> hota hai: private 2-byte ASNs 64512 se 65534 hain, aur 4-byte private ASNs 4200000000 se 4294967294.</p>
<table class="cmp"><tr><th></th><th>eBGP</th><th>iBGP</th></tr>
<tr><td>Neighbours kahan</td><td>Alag AS</td><td>Same AS</td></tr>
<tr><td>NX-OS par AD</td><td>20</td><td>200</td></tr>
<tr><td>Loop prevention</td><td>AS_PATH (apna AS wale routes reject)</td><td>iBGP routes ko iBGP peers ko dobara advertise nahi karte: full mesh ya <b>route reflectors</b> chahiye</td></tr>
<tr><td>Next hop</td><td>Self par badal jaata hai</td><td>Default mein unchanged</td></tr>
<tr><td>Typical peering address</td><td>Directly connected link IP</td><td>Loopback (<code>update-source loopback0</code> ke saath)</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Do BGP fabric designs">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="13">OSPF underlay + iBGP EVPN</text>
<rect x="100" y="35" width="120" height="34" rx="6" fill="#ddd6fe"/><text x="160" y="57" text-anchor="middle" class="svg-ink" font-size="12">Spine = RR, AS 65001</text>
<rect x="30" y="150" width="110" height="34" rx="6" fill="#bae6fd"/><text x="85" y="172" text-anchor="middle" class="svg-ink" font-size="12">Leaf AS 65001</text>
<rect x="180" y="150" width="110" height="34" rx="6" fill="#bae6fd"/><text x="235" y="172" text-anchor="middle" class="svg-ink" font-size="12">Leaf AS 65001</text>
<line x1="140" y1="69" x2="85" y2="150" stroke="#64748b" stroke-width="2"/><line x1="180" y1="69" x2="235" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="13">eBGP underlay + overlay</text>
<rect x="420" y="35" width="120" height="34" rx="6" fill="#ddd6fe"/><text x="480" y="57" text-anchor="middle" class="svg-ink" font-size="12">Spines AS 65000</text>
<rect x="350" y="150" width="110" height="34" rx="6" fill="#bae6fd"/><text x="405" y="172" text-anchor="middle" class="svg-ink" font-size="12">Leaf AS 65011</text>
<rect x="500" y="150" width="110" height="34" rx="6" fill="#bae6fd"/><text x="555" y="172" text-anchor="middle" class="svg-ink" font-size="12">Leaf AS 65012</text>
<line x1="460" y1="69" x2="405" y2="150" stroke="#64748b" stroke-width="2"/><line x1="500" y1="69" x2="555" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="12">Dono designs common hain; exam dono jaanne ki umeed karta hai</text>
</svg><p class="cap">Left: OSPF underlay par EVPN ke liye spines iBGP route reflectors. Right: har leaf ka ek AS, har jagah eBGP.</p></div>

<pre class="code"><span class="c">! leaf se ek spine tak eBGP, apna loopback advertise karte hue</span>
LEAF1(config)# feature bgp
LEAF1(config)# router bgp 65011
LEAF1(config-router)# router-id 10.255.0.1
LEAF1(config-router)# address-family ipv4 unicast
LEAF1(config-router-af)# network 10.255.0.1/32
LEAF1(config-router-af)# maximum-paths 4
LEAF1(config-router)# neighbor 10.1.0.0
LEAF1(config-router-neighbor)# remote-as 65000
LEAF1(config-router-neighbor)# address-family ipv4 unicast</pre>
<pre class="out">LEAF1# show bgp ipv4 unicast summary
BGP router identifier 10.255.0.1, local AS number 65011
Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">10.1.0.0        4 65000    4521    4519       42    0    0    3d01h 24</span>
10.1.1.0        4 65000    4518    4520       42    0    0    3d01h 24</pre>
<p>Aakhri column mein number ka matlab session <b>Established</b> hai aur batata hai kitne prefixes receive hue. <code>Idle</code> ya <code>Active</code> jaisa word matlab session up nahi hai: reachability, AS numbers aur <code>update-source</code> check karo. Yeh bhi dhyaan do ki NX-OS par neighbour ko har address family mein activate karna padta hai, aur BGP sirf ek path use karta hai jab tak aap <code>maximum-paths</code> set na karo.</p>

<h3>BGP baad mein EVPN kyun le jaata hai</h3>
<p>BGP <b>address families</b> ke through kai tarah ki reachability le ja sakta hai: IPv4 unicast, IPv6 unicast, VPNv4 aur <b>L2VPN EVPN</b>. EVPN BGP ka use MAC addresses, host IP addresses aur VTEP locations advertise karne ke liye karta hai, tenants ko alag rakhne ke liye extended communities (route targets) ke saath. Isiliye har VXLAN EVPN fabric BGP chalata hai, chahe underlay OSPF ho. EVPN module mein aap har leaf par <code>address-family l2vpn evpn</code> aur <code>send-community extended</code> dekhoge.</p>

<div class="eg"><p><b>Worked example: kitne sessions?</b> 4 spines, 32 leaves. Spines iBGP route reflectors hon to har leaf sirf 4 spines se peer karta hai: 32 × 4 = <b>128</b> sessions. 36 switches ke beech full iBGP mesh ko 36 × 35 ÷ 2 = <b>630</b> sessions chahiye. Route reflectors (ya har leaf par eBGP) hi fabric mein BGP ko practical banate hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> /31 links par OSPF ko broadcast network type par chhodna (bekaar DR election). OSPF MTU mismatch jisse neighbours ExStart mein atak jaate hain. Loopbacks ke beech iBGP bina <code>update-source loopback0</code> ke. <code>feature ospf</code> ya <code>feature bgp</code> bhoolna, jisse commands reject ho jaate hain.</p></div>
<div class="exam"><p><b>Exam tip.</b> OSPF: link-state, area 0 backbone, hellos 10/40, neighbour states FULL tak, LSA types 1, 2, 3, 5, point-to-point DR avoid karta hai. BGP: TCP 179, eBGP AD 20, iBGP AD 200, iBGP ko full mesh ya route reflectors chahiye, private ASNs 64512 se 65534, EVPN ek BGP address family hai.</p></div>

<div class="scn"><h4>Naye leaf ka BGP session kabhi up nahi hota</h4><p>LEAF9 ko ek iBGP EVPN fabric mein joda gaya. <code>show bgp l2vpn evpn summary</code> ne dono spines ko state <code>Active</code> mein dikhaya. Underlay theek tha: <code>ping 10.255.0.11 source 10.255.0.9</code> successful tha. <code>show running-config bgp</code> ne dikhaya ki neighbour statements mein <code>update-source loopback0</code> missing tha, isliye LEAF9 TCP apne physical interface address se source kar raha tha, jise spines configured neighbour ki tarah nahi pehchaante the. Update-source jodne se dono sessions seconds mein Established ho gaye.</p><p><b>Seekh:</b> loopback-to-loopback BGP mein source wahi hona chahiye jo peer expect karta hai.</p></div>

<div class="iv"><p class="q">"Jab OSPF pehle se kaam karta hai to data center fabrics BGP kyun use karte hain?"</p><p>Strong answer: OSPF (ya IS-IS) simple underlay ke liye excellent hai, lekin BGP bahut bade route counts tak scale karta hai, rich policy rakhta hai, aur address families ke through L2VPN EVPN (MACs, IPs, VTEPs, route targets) le jaata hai jo OSPF nahi kar sakta. Designs ya to OSPF underlay ke saath iBGP EVPN hote hain jisme spines route reflectors hain, ya dono ke liye eBGP jisme har leaf ka ASN. <code>maximum-paths</code> ke saath ECMP aur point-to-point OSPF network type ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPF: link-state, LSAs, SPF; point-to-point links aur loopback router IDs ke saath single area 0 underlay.</li>
<li>FULL tak pahunchne ke liye OSPF neighbours ka area, timers, subnet, authentication aur MTU match hona chahiye.</li>
<li>BGP: TCP 179, eBGP (alag AS, AD 20) aur iBGP (same AS, AD 200, RR ya full mesh chahiye).</li>
<li>NX-OS: <code>feature ospf</code> / <code>feature bgp</code>, interface-level OSPF, har neighbour ki address families.</li>
<li>EVPN ek BGP address family hai: isiliye har VXLAN fabric BGP chalata hai.</li>
</ul></div>
`}};export{e as default};