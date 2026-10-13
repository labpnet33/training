var e={id:`irb`,h:{en:`Symmetric IRB: anycast gateway, L3VNI and type-5 routes`,hi:`Symmetric IRB: anycast gateway, L3VNI aur type-5 routes`},body:{en:`
<p>So far hosts talk inside one VLAN. But H1 (VLAN 10) must also reach H3 (VLAN 20), which means routing. Think of a hotel with three floors. If every guest had to walk to a single reception desk on floor 1 to be told "go to room 205", that desk would be the bottleneck. Better: every floor has its own reception, all identical, all with the same hotel map. This is the <b>distributed anycast gateway</b>: every leaf owns the same gateway IP and MAC for each VLAN, so a host always finds its default gateway on the leaf it is plugged into.</p>

<h3>Symmetric IRB in one sentence</h3>
<p>Integrated Routing and Bridging (IRB) is "bridge inside a VLAN, route between VLANs, on the same switch". In the <b>symmetric</b> model, routed traffic crosses the fabric inside a dedicated per-VRF segment, the <b>L3VNI</b> (here 50901). Both leaves route: the ingress leaf routes from VLAN 10 into the L3VNI, the egress leaf routes from the L3VNI into VLAN 20. Neither leaf needs to know every remote VLAN; it only needs the remote host's IP route.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Symmetric IRB path">
<rect x="10" y="60" width="80" height="40" rx="6" fill="#fed7aa"/><text x="50" y="84" text-anchor="middle" class="svg-ink" font-size="12">H1 .10.11</text>
<rect x="115" y="40" width="150" height="80" rx="8" fill="#bae6fd"/><text x="190" y="62" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="190" y="80" text-anchor="middle" class="svg-muted" font-size="12">Vlan10 gw .1 (anycast)</text><text x="190" y="98" text-anchor="middle" class="svg-muted" font-size="12">route 1: into L3VNI</text>
<rect x="290" y="70" width="110" height="40" rx="8" fill="#fde68a"/><text x="345" y="88" text-anchor="middle" class="svg-ink" font-size="12">VNI 50901</text><text x="345" y="102" text-anchor="middle" class="svg-muted" font-size="12">VRF TENANT-A</text>
<rect x="425" y="40" width="150" height="80" rx="8" fill="#bae6fd"/><text x="500" y="62" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text><text x="500" y="80" text-anchor="middle" class="svg-muted" font-size="12">Vlan20 gw .1 (anycast)</text><text x="500" y="98" text-anchor="middle" class="svg-muted" font-size="12">route 2: out to VLAN 20</text>
<rect x="590" y="60" width="45" height="40" rx="6" fill="#fed7aa"/><text x="612" y="84" text-anchor="middle" class="svg-ink" font-size="12">H3</text>
<g stroke="#64748b" stroke-width="2"><line x1="90" y1="80" x2="115" y2="80"/><line x1="265" y1="90" x2="290" y2="90"/><line x1="400" y1="90" x2="425" y2="90"/><line x1="575" y1="80" x2="590" y2="80"/></g>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">two routing hops, one VNI in the middle: that is what "symmetric" means</text>
</svg><p class="cap">The L3VNI carries all inter-subnet traffic of the VRF; the outer destination is the remote leaf's VTEP.</p></div>

<h3>Configuration on LEAF1</h3>
<pre class="code"><span class="c">! Global: advertise the anycast gateway through EVPN</span>
l2vpn evpn
 replication-type ingress
 router-id Loopback0
 default-gateway advertise enable
<span class="c">! The tenant VRF</span>
vrf definition TENANT-A
 rd 65001:1
 address-family ipv4
  route-target export 65001:50901
  route-target import 65001:50901
  route-target export 65001:50901 stitching
  route-target import 65001:50901 stitching
 exit-address-family
<span class="c">! L3VNI carrier VLAN</span>
vlan 901
vlan configuration 901
 member vni 50901
interface Vlan901
 vrf forwarding TENANT-A
 ip unnumbered Loopback0
 no autostate
<span class="c">! Gateway SVI for VLAN 10, same IP on every leaf</span>
interface Vlan10
 vrf forwarding TENANT-A
 ip address 10.10.10.1 255.255.255.0
<span class="c">! VTEP</span>
interface nve1
 source-interface Loopback1
 host-reachability protocol bgp
 member vni 10010 ingress-replication
 member vni 50901 vrf TENANT-A
<span class="c">! BGP: leak VRF routes into EVPN as type 5</span>
router bgp 65001
 address-family ipv4 vrf TENANT-A
  advertise l2vpn evpn
  redistribute connected</pre>

<h3>Verification</h3>
<pre class="out">LEAF1# show nve vni
Interface  VNI        Multicast-group  VNI state  Mode  VLAN  cfg vrf
nve1       10010      N/A              Up         L2CP  10    CLI   N/A
nve1       10020      N/A              Up         L2CP  20    CLI   N/A
nve1       50901      N/A              Up         L3CP  901   CLI   <span class="hl">TENANT-A</span>

LEAF1# show ip route vrf TENANT-A
C        10.10.10.0/24 is directly connected, Vlan10
L        10.10.10.1/32 is directly connected, Vlan10
B        10.10.20.13/32 [200/0] via 10.255.1.12, 00:03:41, Vlan901
B        10.10.20.14/32 [200/0] via 10.255.1.13, 00:03:41, Vlan901</pre>
<p>Mode <b>L3CP</b> and the VRF name on VNI 50901 prove the L3VNI is bound. The remote host routes (/32) arrive from type-2 (with IP) and are installed in the VRF with the remote leaf as next hop, over VLAN 901 (the L3VNI).</p>

<div class="eg"><p><b>Worked example: H1 pings H3.</b> H1 sends to its gateway 10.10.10.1 (LEAF1, local). LEAF1 looks up 10.10.20.13 in VRF TENANT-A, finds next hop 10.255.1.12 via VNI 50901, and sends one VXLAN packet to LEAF2 with VNI 50901 (not 10020). LEAF2 sees VNI 50901, routes inside TENANT-A, finds 10.10.20.13 connected on Vlan20, and bridges to H3. The return path is the mirror image.</p></div>

<h3>Anycast gateway: why it works</h3>
<p>Every leaf has the same SVI IP (10.10.10.1) and the same gateway MAC for each VLAN. A VM can move from LEAF1 to LEAF2 and keep its default gateway and ARP entry; nothing needs to change on the host. <code>default-gateway advertise enable</code> lets the fabric know the gateway is shared, so the gateway MAC is not treated as a moving host.</p>

<div class="warn"><p><b>Common mistake.</b> Giving each leaf a unique SVI IP in the same VLAN. The hosts see different gateways depending on location, and a VM move breaks connectivity until its ARP cache times out. Keep the gateway IP identical on every leaf.</p></div>

<div class="exam"><p><b>Exam trap.</b> In symmetric IRB the L3VNI is the same on both leaves and is <b>per VRF</b>, not per VLAN. In asymmetric IRB the ingress leaf routes and bridges into the destination L2VNI, so every leaf needs every VLAN. Symmetric avoids that.</p></div>

<div class="scn"><h4>Routed pings failing on one leaf only</h4><p>H1 reached H3 and H4 but not from LEAF3. LEAF3's <code>show nve vni</code> listed 10020 but no row for 50901. The change ticket for LEAF3 had skipped <code>member vni 50901 vrf TENANT-A</code> under nve1. LEAF3 could still bridge but had no L3VNI to send or receive routed traffic. After adding the line, the row appeared with Mode L3CP.</p><p><b>Lesson:</b> the L3VNI needs a VRF binding on nve1 on <b>every</b> leaf of the tenant.</p></div>

<div class="iv"><p class="q">"Explain symmetric IRB and why we use it."</p><p>Strong answer: both ingress and egress leaves perform a routing lookup; traffic between subnets travels in a per-VRF L3VNI, not in the destination L2VNI. Leaves only need the VLANs they host plus the VRF routes, which scales better than asymmetric IRB. Combine it with an anycast gateway so mobility does not break the default gateway.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Anycast gateway: same SVI IP and MAC on every leaf; default-gateway advertise enable.</li>
<li>L3VNI 50901 on VLAN 901 carries routed traffic of VRF TENANT-A.</li>
<li>nve1 needs member vni 50901 vrf TENANT-A on every leaf.</li>
<li>BGP VRF address family: advertise l2vpn evpn and redistribute connected.</li>
</ul></div>
`,hi:`
<p>Ab tak hosts ek VLAN ke andar baat karte hain. Lekin H1 (VLAN 10) ko H3 (VLAN 20) tak bhi pahunchna hai, matlab routing. Teen floors wala hotel socho. Agar har guest ko floor 1 ki ek hi reception par jaakar "room 205 jao" sunna pade to wahi desk bottleneck ban jaayegi. Behtar: har floor ki apni reception, sab identical, sab ke paas wahi hotel map. Yeh <b>distributed anycast gateway</b> hai: har leaf har VLAN ke liye wahi gateway IP aur MAC rakhta hai, isliye host ko default gateway hamesha usi leaf par milta hai jis par woh plugged hai.</p>

<h3>Symmetric IRB ek line mein</h3>
<p>Integrated Routing and Bridging (IRB) matlab "VLAN ke andar bridge, VLANs ke beech route, ek hi switch par". <b>Symmetric</b> model mein routed traffic fabric mein ek dedicated per-VRF segment mein jaata hai, <b>L3VNI</b> (yahan 50901). Dono leaves route karte hain: ingress leaf VLAN 10 se L3VNI mein route karta hai, egress leaf L3VNI se VLAN 20 mein. Kisi leaf ko har remote VLAN jaanna zaroori nahi; use sirf remote host ka IP route chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Symmetric IRB path">
<rect x="10" y="60" width="80" height="40" rx="6" fill="#fed7aa"/><text x="50" y="84" text-anchor="middle" class="svg-ink" font-size="12">H1 .10.11</text>
<rect x="115" y="40" width="150" height="80" rx="8" fill="#bae6fd"/><text x="190" y="62" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="190" y="80" text-anchor="middle" class="svg-muted" font-size="12">Vlan10 gw .1 (anycast)</text><text x="190" y="98" text-anchor="middle" class="svg-muted" font-size="12">route 1: L3VNI mein</text>
<rect x="290" y="70" width="110" height="40" rx="8" fill="#fde68a"/><text x="345" y="88" text-anchor="middle" class="svg-ink" font-size="12">VNI 50901</text><text x="345" y="102" text-anchor="middle" class="svg-muted" font-size="12">VRF TENANT-A</text>
<rect x="425" y="40" width="150" height="80" rx="8" fill="#bae6fd"/><text x="500" y="62" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text><text x="500" y="80" text-anchor="middle" class="svg-muted" font-size="12">Vlan20 gw .1 (anycast)</text><text x="500" y="98" text-anchor="middle" class="svg-muted" font-size="12">route 2: VLAN 20 mein</text>
<rect x="590" y="60" width="45" height="40" rx="6" fill="#fed7aa"/><text x="612" y="84" text-anchor="middle" class="svg-ink" font-size="12">H3</text>
<g stroke="#64748b" stroke-width="2"><line x1="90" y1="80" x2="115" y2="80"/><line x1="265" y1="90" x2="290" y2="90"/><line x1="400" y1="90" x2="425" y2="90"/><line x1="575" y1="80" x2="590" y2="80"/></g>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">do routing hops, beech mein ek VNI: yahi "symmetric" hai</text>
</svg><p class="cap">L3VNI VRF ka saara inter-subnet traffic carry karta hai; outer destination remote leaf ka VTEP hai.</p></div>

<h3>LEAF1 par configuration</h3>
<pre class="code"><span class="c">! Global: anycast gateway ko EVPN se advertise karo</span>
l2vpn evpn
 replication-type ingress
 router-id Loopback0
 default-gateway advertise enable
<span class="c">! Tenant VRF</span>
vrf definition TENANT-A
 rd 65001:1
 address-family ipv4
  route-target export 65001:50901
  route-target import 65001:50901
  route-target export 65001:50901 stitching
  route-target import 65001:50901 stitching
 exit-address-family
<span class="c">! L3VNI carrier VLAN</span>
vlan 901
vlan configuration 901
 member vni 50901
interface Vlan901
 vrf forwarding TENANT-A
 ip unnumbered Loopback0
 no autostate
<span class="c">! VLAN 10 ka gateway SVI, har leaf par same IP</span>
interface Vlan10
 vrf forwarding TENANT-A
 ip address 10.10.10.1 255.255.255.0
<span class="c">! VTEP</span>
interface nve1
 source-interface Loopback1
 host-reachability protocol bgp
 member vni 10010 ingress-replication
 member vni 50901 vrf TENANT-A
<span class="c">! BGP: VRF routes ko type 5 ke roop mein EVPN mein daalo</span>
router bgp 65001
 address-family ipv4 vrf TENANT-A
  advertise l2vpn evpn
  redistribute connected</pre>

<h3>Verification</h3>
<pre class="out">LEAF1# show nve vni
Interface  VNI        Multicast-group  VNI state  Mode  VLAN  cfg vrf
nve1       10010      N/A              Up         L2CP  10    CLI   N/A
nve1       10020      N/A              Up         L2CP  20    CLI   N/A
nve1       50901      N/A              Up         L3CP  901   CLI   <span class="hl">TENANT-A</span>

LEAF1# show ip route vrf TENANT-A
C        10.10.10.0/24 is directly connected, Vlan10
L        10.10.10.1/32 is directly connected, Vlan10
B        10.10.20.13/32 [200/0] via 10.255.1.12, 00:03:41, Vlan901
B        10.10.20.14/32 [200/0] via 10.255.1.13, 00:03:41, Vlan901</pre>
<p>VNI 50901 par Mode <b>L3CP</b> aur VRF name prove karte hain ki L3VNI bound hai. Remote host routes (/32) type-2 (IP ke saath) se aate hain aur VRF mein remote leaf ko next hop ke saath, VLAN 901 (L3VNI) par install hote hain.</p>

<div class="eg"><p><b>Worked example: H1 H3 ko ping karta hai.</b> H1 apne gateway 10.10.10.1 (LEAF1, local) ko bhejta hai. LEAF1 VRF TENANT-A mein 10.10.20.13 lookup karta hai, VNI 50901 ke through next hop 10.255.1.12 paata hai, aur LEAF2 ko VNI 50901 (10020 nahi) ke saath ek VXLAN packet bhejta hai. LEAF2 VNI 50901 dekhta hai, TENANT-A ke andar route karta hai, 10.10.20.13 ko Vlan20 par connected paata hai, aur H3 ko bridge karta hai. Return path ulta image hai.</p></div>

<h3>Anycast gateway kyun kaam karta hai</h3>
<p>Har leaf par same SVI IP (10.10.10.1) aur har VLAN ke liye same gateway MAC hota hai. VM LEAF1 se LEAF2 move kar sakta hai aur apna default gateway aur ARP entry rakh sakta hai; host par kuch badalna nahi padta. <code>default-gateway advertise enable</code> fabric ko batata hai ki gateway shared hai, isliye gateway MAC ko moving host nahi maana jaata.</p>

<div class="warn"><p><b>Common galti.</b> Same VLAN mein har leaf ko unique SVI IP dena. Hosts location ke hisaab se alag gateways dekhte hain, aur VM move connectivity tod deta hai jab tak uska ARP cache time out na ho. Gateway IP har leaf par identical rakho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Symmetric IRB mein L3VNI dono leaves par same aur <b>per VRF</b> hota hai, per VLAN nahi. Asymmetric IRB mein ingress leaf route karke destination L2VNI mein bridge karta hai, isliye har leaf ko har VLAN chahiye. Symmetric isse bachata hai.</p></div>

<div class="scn"><h4>Sirf ek leaf par routed pings fail</h4><p>H1 H3 aur H4 tak pahuncha lekin LEAF3 se nahi. LEAF3 ke <code>show nve vni</code> mein 10020 tha lekin 50901 ki row nahi. LEAF3 ke change ticket mein nve1 ke neeche <code>member vni 50901 vrf TENANT-A</code> chhoot gaya tha. LEAF3 bridge kar sakta tha lekin routed traffic bhejne ya lene ke liye L3VNI nahi tha. Line jodne ke baad row Mode L3CP ke saath aa gayi.</p><p><b>Seekh:</b> L3VNI ko tenant ke <b>har</b> leaf par nve1 par VRF binding chahiye.</p></div>

<div class="iv"><p class="q">"Symmetric IRB samjhao aur hum ise kyun use karte hain."</p><p>Strong answer: ingress aur egress dono leaves routing lookup karte hain; subnets ke beech traffic destination L2VNI mein nahi, per-VRF L3VNI mein travel karta hai. Leaves ko sirf apne hosted VLANs plus VRF routes chahiye, jo asymmetric IRB se behtar scale karta hai. Ise anycast gateway ke saath milao taaki mobility default gateway ko na tode.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Anycast gateway: har leaf par same SVI IP aur MAC; default-gateway advertise enable.</li>
<li>VLAN 901 par L3VNI 50901 VRF TENANT-A ka routed traffic carry karta hai.</li>
<li>nve1 ko har leaf par member vni 50901 vrf TENANT-A chahiye.</li>
<li>BGP VRF address family: advertise l2vpn evpn aur redistribute connected.</li>
</ul></div>
`}};export{e as default};