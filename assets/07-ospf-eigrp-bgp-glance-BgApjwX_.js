var e={id:`ospf-eigrp-bgp-glance`,h:{en:`OSPF, EIGRP and BGP at a glance: what ENCOR expects`,hi:`OSPF, EIGRP aur BGP ek nazar mein: ENCOR kya expect karta hai`},body:{en:`
<p>Three ways to find your way around. <b>OSPF</b> gives every driver the same printed city map, so each one calculates the best route independently. <b>EIGRP</b> is like asking your neighbours for directions, but with a clever rule: you also remember a safe backup route in advance, so when a road closes you switch instantly. <b>BGP</b> is diplomacy between countries: each country (autonomous system) announces which cities it can reach, and every other country applies its own policies about which announcement to trust. ENCOR tests OSPF deeply, BGP at an eBGP level, and EIGRP mainly by comparison with OSPF.</p>

<h3>OSPF recap</h3>
<p>OSPF is a link-state protocol (IP protocol 89). Each router has a <b>router ID</b> (set it manually; otherwise the highest loopback IP, then the highest interface IP). Routers send hellos (every 10 s on broadcast and point-to-point links, dead interval 40 s) and progress through the neighbour states <b>Down, Init, 2-Way, ExStart, Exchange, Loading, Full</b>. On broadcast segments they elect a <b>DR</b> and <b>BDR</b> (highest priority, then highest router ID, non-preemptive); on <b>point-to-point</b> links there is no election.</p>
<p>To become neighbours, two routers must match: area ID, subnet and mask, hello and dead timers, authentication, stub-area flags and compatible network types; they need unique router IDs; and a different <b>MTU</b> leaves them stuck in ExStart/Exchange. Areas limit flooding: <b>ABRs</b> connect areas to area 0 and summarise with type 3 LSAs. The LSA types you must recognise: 1 (router), 2 (network, from the DR), 3 (summary, from ABRs), 4 (ASBR summary), 5 (external), 7 (NSSA external).</p>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="NK Corp OSPF areas and eBGP">
<rect x="160" y="15" width="465" height="140" rx="12" fill="#bbf7d0"/><text x="175" y="36" class="svg-ink" font-size="13">Area 0 (backbone)</text>
<rect x="180" y="50" width="100" height="36" rx="6" fill="#bae6fd"/><text x="230" y="73" text-anchor="middle" class="svg-ink" font-size="12">WAN1</text>
<rect x="300" y="50" width="100" height="36" rx="6" fill="#bae6fd"/><text x="350" y="73" text-anchor="middle" class="svg-ink" font-size="12">WAN2</text>
<rect x="180" y="105" width="100" height="36" rx="6" fill="#fde68a"/><text x="230" y="128" text-anchor="middle" class="svg-ink" font-size="12">CORE1 ABR</text>
<rect x="300" y="105" width="100" height="36" rx="6" fill="#fde68a"/><text x="350" y="128" text-anchor="middle" class="svg-ink" font-size="12">CORE2 ABR</text>
<rect x="480" y="105" width="120" height="36" rx="6" fill="#ddd6fe"/><text x="540" y="128" text-anchor="middle" class="svg-ink" font-size="12">DC-SW1</text>
<rect x="160" y="185" width="260" height="90" rx="12" fill="#e2e8f0"/><text x="175" y="205" class="svg-ink" font-size="13">Area 10 (HQ campus)</text>
<rect x="180" y="220" width="100" height="36" rx="6" fill="#bae6fd"/><text x="230" y="243" text-anchor="middle" class="svg-ink" font-size="12">DIST1</text>
<rect x="300" y="220" width="100" height="36" rx="6" fill="#bae6fd"/><text x="350" y="243" text-anchor="middle" class="svg-ink" font-size="12">DIST2</text>
<line x1="230" y1="141" x2="230" y2="220" stroke="#64748b" stroke-width="2"/><line x1="350" y1="141" x2="350" y2="220" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="50" width="120" height="36" rx="6" fill="#fed7aa"/><text x="70" y="73" text-anchor="middle" class="svg-ink" font-size="12">ISP AS 64496</text>
<line x1="130" y1="68" x2="180" y2="68" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="70" y="108" text-anchor="middle" class="svg-accent" font-size="12">eBGP, AS 65001</text>
<text x="520" y="230" class="svg-muted" font-size="12">ABRs summarise</text><text x="520" y="248" class="svg-muted" font-size="12">10.1.0.0/16</text>
</svg><p class="cap">NK Corp routing: OSPF area 0 in the core, WAN and DC; area 10 for the HQ campus; eBGP from WAN1 and WAN2 to the ISP.</p></div>

<pre class="code"><span class="c">! CORE1: OSPF with a manual router ID and point-to-point core links</span>
CORE1(config)# router ospf 1
CORE1(config-router)# router-id 10.255.0.1
CORE1(config-router)# auto-cost reference-bandwidth 100000
CORE1(config-router)# passive-interface Loopback0
CORE1(config-router)# area 10 range 10.1.0.0 255.255.0.0
CORE1(config-router)# exit
CORE1(config)# interface TenGigabitEthernet1/0/3
CORE1(config-if)# ip ospf network point-to-point
CORE1(config-if)# ip ospf 1 area 10</pre>
<pre class="out">CORE1# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
10.255.0.2        0   FULL/  -        00:00:36    10.0.0.2        TenGigabitEthernet1/0/2
<span class="hl">10.255.0.11       0   FULL/  -        00:00:33    10.0.0.18       TenGigabitEthernet1/0/3</span>
10.255.0.21       0   FULL/  -        00:00:38    10.0.0.14       TenGigabitEthernet1/0/4
10.255.0.10       0   FULL/  -        00:00:31    10.0.0.9        TenGigabitEthernet1/0/5</pre>
<p><code>FULL/  -</code> means a full adjacency with no DR role, which is what you expect on point-to-point links.</p>

<h3>EIGRP versus OSPF</h3>
<p>EIGRP is an <b>advanced distance vector</b> protocol (IP protocol 88, multicast 224.0.0.10). Its <b>DUAL</b> algorithm keeps a <b>successor</b> (best path) and, where possible, a <b>feasible successor</b>: a backup whose reported distance is lower than the current feasible distance (the <b>feasibility condition</b>), which guarantees it is loop-free and allows instant failover. EIGRP can also do <b>unequal-cost</b> load balancing with <code>variance</code>.</p>
<table class="cmp"><tr><th></th><th>OSPF</th><th>EIGRP</th></tr>
<tr><td>Type</td><td>Link state, SPF</td><td>Advanced distance vector, DUAL</td></tr>
<tr><td>Metric</td><td>Cost from bandwidth</td><td>Composite: bandwidth and delay by default</td></tr>
<tr><td>Hierarchy</td><td>Areas, area 0 required</td><td>No areas; summarise on any interface</td></tr>
<tr><td>Load balancing</td><td>Equal cost only</td><td>Equal and unequal cost (variance)</td></tr>
<tr><td>AD</td><td>110</td><td>90 internal, 170 external</td></tr>
<tr><td>Standard</td><td>Open (RFC 2328, RFC 5340)</td><td>Cisco, published as informational RFC 7868</td></tr>
</table>

<h3>BGP at a glance</h3>
<p>BGP runs over <b>TCP port 179</b>. <b>eBGP</b> peers are in different ASes (AD 20, TTL 1 by default so they are normally directly connected); <b>iBGP</b> peers share an AS (AD 200). Private AS numbers are 64512 to 65534 (and a 4-byte private range). Neighbour states: <b>Idle, Connect, Active, OpenSent, OpenConfirm, Established</b>. A session stuck in <b>Active</b> means the TCP session is not coming up: wrong neighbour IP, wrong AS, no route, or an ACL blocking port 179. Best path is chosen by comparing attributes in order: highest <b>weight</b> (Cisco, local), highest <b>local preference</b>, locally originated, shortest <b>AS path</b>, lowest <b>origin</b> (IGP before incomplete), lowest <b>MED</b>, eBGP over iBGP, lowest IGP metric to the next hop, then tie-breakers such as oldest path and lowest router ID.</p>
<pre class="code"><span class="c">! WAN1: eBGP to the ISP and advertise NK Corp's public /24</span>
WAN1(config)# ip route 203.0.113.0 255.255.255.0 Null0
WAN1(config)# router bgp 65001
WAN1(config-router)# neighbor 198.51.100.1 remote-as 64496
WAN1(config-router)# address-family ipv4
WAN1(config-router-af)# neighbor 198.51.100.1 activate
WAN1(config-router-af)# network 203.0.113.0 mask 255.255.255.0</pre>
<pre class="out">WAN1# show ip bgp summary | begin Neighbor
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">198.51.100.1    4        64496    1450    1439        5    0    0 21:47:12        1</span></pre>
<p>A number in the last column means Established and shows how many prefixes were received. A word (Idle, Active) means the session is down.</p>

<h3>What ENCOR v1.2 expects</h3>
<ul>
<li><b>Compare</b> EIGRP and OSPF: path selection, metrics, load balancing, areas.</li>
<li><b>Configure and verify</b> OSPFv2 and OSPFv3 with multiple normal areas, summarisation, filtering, point-to-point and broadcast network types, passive interfaces and neighbour adjacency.</li>
<li><b>Configure and verify</b> eBGP between directly connected neighbours, including best path selection and neighbour relationships.</li>
<li><b>Describe</b> policy-based routing: a route map applied inbound with <code>ip policy route-map</code> that forwards matched traffic differently from the routing table.</li>
</ul>
<p>The OSPF, EIGRP and eBGP modules of this track build each of these with labs.</p>

<div class="eg"><p><b>Worked example.</b> An EIGRP router has two paths to 10.10.20.0/24: via A with feasible distance 3072 (successor), and via B whose neighbour reports a distance of 2816 and total distance 5120. Is B a feasible successor? Yes: its reported distance 2816 is less than the current feasible distance 3072. With <code>variance 2</code>, B (5120) is also less than 2 × 3072 = 6144, so traffic is shared unequally across both.</p></div>

<div class="warn"><p><b>Common mistake.</b> Leaving OSPF on the default reference bandwidth with 1G and 10G links. Both cost 1, so OSPF load-shares across a 1G and a 10G path or even prefers the slower one by hop count. Set the same reference bandwidth on every router.</p></div>

<div class="exam"><p><b>Exam trap.</b> OSPF stuck in <b>ExStart/Exchange</b> points to an MTU mismatch; stuck in <b>2-Way</b> between two DROTHERs is normal. BGP in <b>Active</b> is not "active and fine": it is actively trying and failing to connect. Weight is Cisco-only and local to the router; local preference is shared inside the AS.</p></div>

<div class="scn"><h4>The new core switch that became an island</h4><p>After replacing CORE2, OSPF showed CORE1 and CORE2 stuck in EXSTART. Hellos matched, so the neighbour appeared, but database exchange never finished. <code>show interfaces</code> showed MTU 9198 on the new CORE2 link and 1500 on CORE1. OSPF puts the interface MTU in its database description packets and, by default, refuses a neighbour whose MTU differs. Setting the same MTU on both ends brought the adjacency to FULL within seconds.</p><p><b>Lesson:</b> when a hardware swap breaks OSPF, compare interface parameters, not just the OSPF configuration.</p></div>

<div class="iv"><p class="q">"Why would you choose OSPF over EIGRP in a new enterprise design?"</p><p>Strong answer: OSPF is an open standard, so it works in multi-vendor networks and with firewalls and cloud routers; its area hierarchy gives clear failure domains and summarisation points; and it is the IGP most engineers and tools know. EIGRP converges very fast with feasible successors and supports unequal-cost load balancing, and is simple to run in all-Cisco networks. Then justify with the environment: vendor mix, team skills, and scale.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPF: manual router ID, states Down to Full, DR/BDR only on broadcast, MTU mismatch = ExStart/Exchange.</li>
<li>OSPF areas: ABRs join areas to area 0 and summarise with <code>area range</code>; know LSA types 1, 2, 3, 4, 5, 7.</li>
<li>EIGRP: DUAL, successor and feasible successor (RD &lt; FD), variance for unequal-cost load balancing.</li>
<li>BGP: TCP 179, eBGP AD 20, iBGP AD 200, Active = TCP failing, best path by attributes in order.</li>
<li>ENCOR: compare EIGRP and OSPF, configure multi-area OSPFv2/v3 and eBGP, describe PBR.</li>
</ul></div>
`,hi:`
<p>Raasta dhoondhne ke teen tareeke. <b>OSPF</b> har driver ko same printed city map deta hai, isliye har ek best route khud calculate karta hai. <b>EIGRP</b> padosiyon se raasta poochne jaisa hai, par ek smart rule ke saath: aap pehle se ek safe backup route bhi yaad rakhte ho, taaki road band hone par turant switch kar sako. <b>BGP</b> deshon ke beech diplomacy hai: har desh (autonomous system) batata hai ki woh kaunse shehron tak pahunch sakta hai, aur har doosra desh apni policies lagata hai ki kis announcement par bharosa kare. ENCOR OSPF ko deep test karta hai, BGP ko eBGP level par, aur EIGRP ko mainly OSPF se comparison ke through.</p>

<h3>OSPF recap</h3>
<p>OSPF ek link-state protocol hai (IP protocol 89). Har router ka ek <b>router ID</b> hota hai (ise manually set karo; warna sabse bada loopback IP, phir sabse bada interface IP). Routers hellos bhejte hain (broadcast aur point-to-point links par har 10 s, dead interval 40 s) aur neighbour states <b>Down, Init, 2-Way, ExStart, Exchange, Loading, Full</b> se guzarte hain. Broadcast segments par woh ek <b>DR</b> aur <b>BDR</b> elect karte hain (sabse zyada priority, phir sabse bada router ID, non-preemptive); <b>point-to-point</b> links par koi election nahi hota.</p>
<p>Neighbours banne ke liye do routers mein match hona chahiye: area ID, subnet aur mask, hello aur dead timers, authentication, stub-area flags aur compatible network types; unke unique router IDs chahiye; aur alag <b>MTU</b> unhe ExStart/Exchange mein atka deta hai. Areas flooding limit karte hain: <b>ABRs</b> areas ko area 0 se jodte hain aur type 3 LSAs se summarise karte hain. LSA types jo aapko pehchanne chahiye: 1 (router), 2 (network, DR se), 3 (summary, ABRs se), 4 (ASBR summary), 5 (external), 7 (NSSA external).</p>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="NK Corp OSPF areas and eBGP">
<rect x="160" y="15" width="465" height="140" rx="12" fill="#bbf7d0"/><text x="175" y="36" class="svg-ink" font-size="13">Area 0 (backbone)</text>
<rect x="180" y="50" width="100" height="36" rx="6" fill="#bae6fd"/><text x="230" y="73" text-anchor="middle" class="svg-ink" font-size="12">WAN1</text>
<rect x="300" y="50" width="100" height="36" rx="6" fill="#bae6fd"/><text x="350" y="73" text-anchor="middle" class="svg-ink" font-size="12">WAN2</text>
<rect x="180" y="105" width="100" height="36" rx="6" fill="#fde68a"/><text x="230" y="128" text-anchor="middle" class="svg-ink" font-size="12">CORE1 ABR</text>
<rect x="300" y="105" width="100" height="36" rx="6" fill="#fde68a"/><text x="350" y="128" text-anchor="middle" class="svg-ink" font-size="12">CORE2 ABR</text>
<rect x="480" y="105" width="120" height="36" rx="6" fill="#ddd6fe"/><text x="540" y="128" text-anchor="middle" class="svg-ink" font-size="12">DC-SW1</text>
<rect x="160" y="185" width="260" height="90" rx="12" fill="#e2e8f0"/><text x="175" y="205" class="svg-ink" font-size="13">Area 10 (HQ campus)</text>
<rect x="180" y="220" width="100" height="36" rx="6" fill="#bae6fd"/><text x="230" y="243" text-anchor="middle" class="svg-ink" font-size="12">DIST1</text>
<rect x="300" y="220" width="100" height="36" rx="6" fill="#bae6fd"/><text x="350" y="243" text-anchor="middle" class="svg-ink" font-size="12">DIST2</text>
<line x1="230" y1="141" x2="230" y2="220" stroke="#64748b" stroke-width="2"/><line x1="350" y1="141" x2="350" y2="220" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="50" width="120" height="36" rx="6" fill="#fed7aa"/><text x="70" y="73" text-anchor="middle" class="svg-ink" font-size="12">ISP AS 64496</text>
<line x1="130" y1="68" x2="180" y2="68" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="70" y="108" text-anchor="middle" class="svg-accent" font-size="12">eBGP, AS 65001</text>
<text x="520" y="230" class="svg-muted" font-size="12">ABRs summarise</text><text x="520" y="248" class="svg-muted" font-size="12">10.1.0.0/16</text>
</svg><p class="cap">NK Corp routing: core, WAN aur DC mein OSPF area 0; HQ campus ke liye area 10; WAN1 aur WAN2 se ISP tak eBGP.</p></div>

<pre class="code"><span class="c">! CORE1: manual router ID aur point-to-point core links ke saath OSPF</span>
CORE1(config)# router ospf 1
CORE1(config-router)# router-id 10.255.0.1
CORE1(config-router)# auto-cost reference-bandwidth 100000
CORE1(config-router)# passive-interface Loopback0
CORE1(config-router)# area 10 range 10.1.0.0 255.255.0.0
CORE1(config-router)# exit
CORE1(config)# interface TenGigabitEthernet1/0/3
CORE1(config-if)# ip ospf network point-to-point
CORE1(config-if)# ip ospf 1 area 10</pre>
<pre class="out">CORE1# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
10.255.0.2        0   FULL/  -        00:00:36    10.0.0.2        TenGigabitEthernet1/0/2
<span class="hl">10.255.0.11       0   FULL/  -        00:00:33    10.0.0.18       TenGigabitEthernet1/0/3</span>
10.255.0.21       0   FULL/  -        00:00:38    10.0.0.14       TenGigabitEthernet1/0/4
10.255.0.10       0   FULL/  -        00:00:31    10.0.0.9        TenGigabitEthernet1/0/5</pre>
<p><code>FULL/  -</code> ka matlab hai full adjacency bina DR role ke, jo point-to-point links par expected hai.</p>

<h3>EIGRP versus OSPF</h3>
<p>EIGRP ek <b>advanced distance vector</b> protocol hai (IP protocol 88, multicast 224.0.0.10). Iska <b>DUAL</b> algorithm ek <b>successor</b> (best path) rakhta hai aur, jahan possible ho, ek <b>feasible successor</b>: ek backup jiska reported distance current feasible distance se kam ho (<b>feasibility condition</b>), jo guarantee karta hai ki woh loop-free hai aur instant failover deta hai. EIGRP <code>variance</code> se <b>unequal-cost</b> load balancing bhi kar sakta hai.</p>
<table class="cmp"><tr><th></th><th>OSPF</th><th>EIGRP</th></tr>
<tr><td>Type</td><td>Link state, SPF</td><td>Advanced distance vector, DUAL</td></tr>
<tr><td>Metric</td><td>Bandwidth se cost</td><td>Composite: default mein bandwidth aur delay</td></tr>
<tr><td>Hierarchy</td><td>Areas, area 0 zaroori</td><td>Koi areas nahi; kisi bhi interface par summarise</td></tr>
<tr><td>Load balancing</td><td>Sirf equal cost</td><td>Equal aur unequal cost (variance)</td></tr>
<tr><td>AD</td><td>110</td><td>90 internal, 170 external</td></tr>
<tr><td>Standard</td><td>Open (RFC 2328, RFC 5340)</td><td>Cisco, informational RFC 7868 ki tarah published</td></tr>
</table>

<h3>BGP ek nazar mein</h3>
<p>BGP <b>TCP port 179</b> par chalta hai. <b>eBGP</b> peers alag ASes mein hote hain (AD 20, default mein TTL 1 isliye normally directly connected); <b>iBGP</b> peers ek AS share karte hain (AD 200). Private AS numbers 64512 se 65534 hain (aur ek 4-byte private range). Neighbour states: <b>Idle, Connect, Active, OpenSent, OpenConfirm, Established</b>. <b>Active</b> mein atka session matlab TCP session nahi ban raha: galat neighbour IP, galat AS, route nahi, ya port 179 block karta ACL. Best path attributes ko order mein compare karke chuna jaata hai: sabse zyada <b>weight</b> (Cisco, local), sabse zyada <b>local preference</b>, locally originated, sabse chhota <b>AS path</b>, sabse kam <b>origin</b> (IGP incomplete se pehle), sabse kam <b>MED</b>, iBGP par eBGP, next hop tak sabse kam IGP metric, phir tie-breakers jaise sabse purana path aur sabse kam router ID.</p>
<pre class="code"><span class="c">! WAN1: ISP tak eBGP aur NK Corp ka public /24 advertise karo</span>
WAN1(config)# ip route 203.0.113.0 255.255.255.0 Null0
WAN1(config)# router bgp 65001
WAN1(config-router)# neighbor 198.51.100.1 remote-as 64496
WAN1(config-router)# address-family ipv4
WAN1(config-router-af)# neighbor 198.51.100.1 activate
WAN1(config-router-af)# network 203.0.113.0 mask 255.255.255.0</pre>
<pre class="out">WAN1# show ip bgp summary | begin Neighbor
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">198.51.100.1    4        64496    1450    1439        5    0    0 21:47:12        1</span></pre>
<p>Aakhri column mein number ka matlab Established hai aur dikhata hai kitne prefixes receive hue. Word (Idle, Active) ka matlab session down hai.</p>

<h3>ENCOR v1.2 kya expect karta hai</h3>
<ul>
<li>EIGRP aur OSPF ko <b>compare</b> karo: path selection, metrics, load balancing, areas.</li>
<li>OSPFv2 aur OSPFv3 ko multiple normal areas, summarisation, filtering, point-to-point aur broadcast network types, passive interfaces aur neighbour adjacency ke saath <b>configure aur verify</b> karo.</li>
<li>Directly connected neighbours ke beech eBGP <b>configure aur verify</b> karo, best path selection aur neighbour relationships samet.</li>
<li>Policy-based routing <b>describe</b> karo: <code>ip policy route-map</code> se inbound lagaya route map jo matched traffic ko routing table se alag forward karta hai.</li>
</ul>
<p>Is track ke OSPF, EIGRP aur eBGP modules inme se har ek ko labs ke saath banate hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek EIGRP router ke paas 10.10.20.0/24 tak do paths hain: A ke through feasible distance 3072 (successor), aur B ke through jiska neighbour 2816 reported distance aur 5120 total distance batata hai. Kya B feasible successor hai? Haan: uska reported distance 2816 current feasible distance 3072 se kam hai. <code>variance 2</code> ke saath, B (5120) bhi 2 × 3072 = 6144 se kam hai, isliye traffic dono par unequally baanta jaata hai.</p></div>

<div class="warn"><p><b>Common galti.</b> 1G aur 10G links ke saath OSPF ko default reference bandwidth par chhodna. Dono ka cost 1 hai, isliye OSPF 1G aur 10G path par load-share karta hai ya hop count ki wajah se slower wala bhi prefer kar leta hai. Har router par same reference bandwidth set karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> <b>ExStart/Exchange</b> mein atka OSPF MTU mismatch ki taraf ishara karta hai; do DROTHERs ke beech <b>2-Way</b> mein rehna normal hai. BGP ka <b>Active</b> "active aur theek" nahi hai: yeh connect karne ki actively koshish kar raha hai aur fail ho raha hai. Weight sirf Cisco hai aur router ke liye local hai; local preference AS ke andar share hoti hai.</p></div>

<div class="scn"><h4>Naya core switch jo island ban gaya</h4><p>CORE2 replace karne ke baad, OSPF ne CORE1 aur CORE2 ko EXSTART mein atka dikhaya. Hellos match the, isliye neighbour dikha, par database exchange kabhi khatam nahi hua. <code>show interfaces</code> ne naye CORE2 link par MTU 9198 aur CORE1 par 1500 dikhaya. OSPF interface MTU ko apne database description packets mein daalta hai aur, default mein, alag MTU wale neighbour ko mana kar deta hai. Dono ends par same MTU set karne se adjacency seconds mein FULL ho gayi.</p><p><b>Seekh:</b> jab hardware swap OSPF tod de, to sirf OSPF configuration nahi, interface parameters compare karo.</p></div>

<div class="iv"><p class="q">"Naye enterprise design mein aap EIGRP ki jagah OSPF kyun choose karoge?"</p><p>Strong answer: OSPF open standard hai, isliye multi-vendor networks mein aur firewalls aur cloud routers ke saath kaam karta hai; iski area hierarchy clear failure domains aur summarisation points deti hai; aur yeh woh IGP hai jo zyada tar engineers aur tools jaante hain. EIGRP feasible successors ke saath bahut fast converge karta hai aur unequal-cost load balancing support karta hai, aur all-Cisco networks mein chalana simple hai. Phir environment se justify karo: vendor mix, team skills, aur scale.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPF: manual router ID, states Down se Full, DR/BDR sirf broadcast par, MTU mismatch = ExStart/Exchange.</li>
<li>OSPF areas: ABRs areas ko area 0 se jodte hain aur <code>area range</code> se summarise karte hain; LSA types 1, 2, 3, 4, 5, 7 jaano.</li>
<li>EIGRP: DUAL, successor aur feasible successor (RD &lt; FD), unequal-cost load balancing ke liye variance.</li>
<li>BGP: TCP 179, eBGP AD 20, iBGP AD 200, Active = TCP fail ho raha hai, best path attributes ke order se.</li>
<li>ENCOR: EIGRP aur OSPF compare karo, multi-area OSPFv2/v3 aur eBGP configure karo, PBR describe karo.</li>
</ul></div>
`}};export{e as default};