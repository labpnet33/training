var e={id:`l3vni`,h:{en:`Tenant VRF and L3VNI: making symmetric IRB work`,hi:`Tenant VRF aur L3VNI: symmetric IRB ko chalana`},body:{en:`
<p>A shopping mall has many shops (subnets). Goods move inside a shop on trolleys (bridging), but between shops everything goes through the mall's own service corridor, which only mall staff can use and which each mall company has separately. The corridor is not a shop and has no shop counter; it only connects them. The <b>L3VNI</b> is that service corridor for one tenant: a VNI that belongs to a VRF rather than to a VLAN of hosts, used only to carry routed traffic between leaves. In this chapter you will build it exactly as lab 3 requires, and add type-5 prefix routes.</p>

<h3>The pieces and why each exists</h3>
<table class="cmp"><tr><th>Piece</th><th>Command</th><th>Purpose</th></tr>
<tr><td>Tenant VRF</td><td><code>vrf context TENANT-A</code></td><td>separate routing table for tenant A</td></tr>
<tr><td>L3VNI binding</td><td><code>vni 50001</code> under the VRF</td><td>VRF's routed traffic uses VNI 50001</td></tr>
<tr><td>RD and RTs</td><td><code>rd auto</code>, <code>route-target both auto</code>, <code>route-target both auto evpn</code></td><td>unique routes; import/export of EVPN host routes and prefixes</td></tr>
<tr><td>L3VNI VLAN</td><td><code>vlan 3001</code> + <code>vn-segment 50001</code></td><td>internal bridge domain for the L3VNI (no hosts)</td></tr>
<tr><td>L3VNI SVI</td><td><code>interface Vlan3001</code>, <code>vrf member</code>, <code>ip forward</code></td><td>routing hook for decapsulated L3VNI traffic; no IP address</td></tr>
<tr><td>NVE membership</td><td><code>member vni 50001 associate-vrf</code></td><td>tells NVE this VNI is Layer 3 for a VRF</td></tr>
<tr><td>BGP VRF</td><td><code>router bgp 65001</code> / <code>vrf TENANT-A</code> / <code>address-family ipv4 unicast</code></td><td>tenant routes in BGP; exported to EVPN</td></tr>
</table>

<h3>Configuration (lab 3, task 2): identical on LEAF1 and LEAF2</h3>
<pre class="code">vrf context TENANT-A
  vni 50001
  rd auto
  address-family ipv4 unicast
    route-target both auto
    route-target both auto evpn
vlan 3001
  name L3VNI-TENANT-A
  vn-segment 50001
interface Vlan3001
  no shutdown
  vrf member TENANT-A
  ip forward                          <span class="c">! no IP address on the L3VNI SVI</span>
interface nve1
  member vni 50001 associate-vrf
router bgp 65001
  vrf TENANT-A
    address-family ipv4 unicast
      advertise l2vpn evpn</pre>
<p><code>advertise l2vpn evpn</code> is required on older NX-OS releases to export the VRF's BGP routes into EVPN; newer releases do it automatically and accept the line harmlessly. The lab expects it. Some recent releases and platforms also allow a VLAN-less L3VNI (<code>vni 50001 l3</code> under the VRF), but the VLAN-based method shown here is the classic one you must know.</p>

<h3>The Router MAC</h3>
<p>Once VNI 50001 is up, every leaf attaches a <b>Router MAC</b> extended community to its type-2 MAC/IP routes and type-5 routes in that VRF. By default it is the switch's system MAC. In symmetric IRB, the ingress leaf uses the egress leaf's Router MAC as the inner destination MAC of the routed packet, so the egress leaf knows the frame is for its routing engine. <code>show nve peers</code> now fills the Router-Mac column.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="L2VNIs and L3VNI in one VRF">
<rect x="170" y="15" width="300" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">VRF TENANT-A = L3VNI 50001 (VLAN 3001)</text>
<rect x="40" y="110" width="220" height="44" rx="8" fill="#bae6fd"/><text x="150" y="130" text-anchor="middle" class="svg-ink" font-size="12">VLAN 10 = L2VNI 10010</text><text x="150" y="147" text-anchor="middle" class="svg-muted" font-size="12">SVI 172.16.10.1 (LEAF1)</text>
<rect x="380" y="110" width="220" height="44" rx="8" fill="#bae6fd"/><text x="490" y="130" text-anchor="middle" class="svg-ink" font-size="12">VLAN 20 = L2VNI 10020</text><text x="490" y="147" text-anchor="middle" class="svg-muted" font-size="12">SVI 172.16.20.1 (LEAF2)</text>
<line x1="150" y1="110" x2="260" y2="55" stroke="#64748b" stroke-width="2"/><line x1="490" y1="110" x2="380" y2="55" stroke="#64748b" stroke-width="2"/>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">Bridged traffic: L2VNI. Routed traffic between leaves: L3VNI.</text>
</svg><p class="cap">Many L2VNIs (one per subnet) belong to one VRF, which has exactly one L3VNI.</p></div>

<h3>Type-5 routes for the subnets</h3>
<p>Host routes (type 2) only exist for hosts that have spoken. To reach silent hosts and to summarise, advertise each tenant subnet as a type-5 route. A tidy way is to tag the SVI addresses and redistribute only tagged connected routes:</p>
<pre class="code">interface Vlan10
  ip address 172.16.10.1/24 tag 12345
route-map RM-TENANT-SUBNETS permit 10
  match tag 12345
router bgp 65001
  vrf TENANT-A
    address-family ipv4 unicast
      redistribute direct route-map RM-TENANT-SUBNETS</pre>
<p>NX-OS always requires a route-map on <code>redistribute</code>. The remote leaf installs 172.16.10.0/24 via the advertising VTEP; when a packet for a silent host arrives, that leaf routes it over the L3VNI to a leaf hosting the subnet, which ARPs for the host locally.</p>

<h3>Verification</h3>
<pre class="out">LEAF2# show nve vni
Interface VNI      Multicast-group   State Mode Type [BD/VRF]      Flags
--------- -------- ----------------- ----- ---- ------------------ -----
nve1      10020    UnicastBGP        Up    CP   L2 [20]            SA
<span class="hl">nve1      50001    n/a               Up    CP   L3 [TENANT-A]</span>
LEAF1# show nve peers
Interface Peer-IP          State LearnType Uptime   Router-Mac
--------- ---------------  ----- --------- -------- -----------------
<span class="hl">nve1      10.254.0.2       Up    CP        00:12:31 5254.0012.3402</span>
LEAF1# show bgp l2vpn evpn route-type 5
BGP routing table entry for [5]:[0]:[0]:[24]:[172.16.20.0]/224, version 88
    10.254.0.2 (metric 81) from 10.255.0.11 (10.255.0.11)
      Origin incomplete, MED 0, localpref 100, weight 0
<span class="hl">      Received label 50001</span>
      Extcommunity: RT:65001:50001 ENCAP:8 Router MAC:5254.0012.3402
LEAF1# show ip route vrf TENANT-A 172.16.20.12
172.16.20.12/32, ubest/mbest: 1/0
<span class="hl">    *via 10.254.0.2%default, [200/0], 00:03:12, bgp-65001, internal, tag 65001, segid: 50001 tunnelid: 0xafe0002 encap: VXLAN</span></pre>
<p>Lab 3's final question asks for the next hop of 172.16.20.12/32 on LEAF1: it is <b>10.254.0.2</b>, LEAF2's VTEP, in the default VRF.</p>

<div class="eg"><p><b>Worked example.</b> Tenant A grows to 12 subnets on 16 leaves. It still uses exactly one L3VNI (50001) and one L3VNI VLAN (3001) on every leaf that hosts any of its subnets. Tenant B gets its own VRF with L3VNI 50002 and VLAN 3002. Each tenant's routes carry only its own RT (65001:50001 or 65001:50002), so the tenants never see each other's prefixes.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Giving the L3VNI SVI an IP address; forgetting <code>ip forward</code> or <code>no shutdown</code> on Vlan3001; different L3VNI numbers for the same VRF on different leaves; missing <code>route-target both auto evpn</code> (the VRF imports no EVPN routes); missing <code>associate-vrf</code> (the VNI never appears as L3).</p></div>
<div class="exam"><p><b>Exam trap.</b> One L3VNI per VRF, not per VLAN. The L3VNI needs a VLAN and an SVI with <code>ip forward</code> but no IP address, and the NVE uses <code>member vni 50001 associate-vrf</code>, not a replication method.</p></div>

<div class="scn"><h4>Tenant routes that never arrived</h4><p>After a "VRF template cleanup", hosts on LEAF1 could no longer reach other racks, though both servers still reached their local gateways. <code>show nve vni</code> looked healthy on LEAF1 with 50001 Up as L3. But <code>show ip route vrf TENANT-A</code> on LEAF1 contained only local routes; no BGP-learned /32s from LEAF2. The engineer compared <code>show running-config vrf TENANT-A</code> on both leaves: LEAF1 had <code>route-target both auto</code> but the cleanup had removed <code>route-target both auto evpn</code>. LEAF1 exported and imported nothing through EVPN. Adding the line back restored the routes within seconds. This is fault two of lab 5.</p><p><b>Lesson:</b> in a VRF, the RT with the evpn keyword is the one EVPN uses.</p></div>

<div class="iv"><p class="q">"Walk me through configuring an L3VNI for a tenant on NX-OS."</p><p>Strong answer: create the VRF with vni 50001, rd auto and route-target both auto evpn; create a VLAN mapped to vn-segment 50001; create its SVI in the VRF with ip forward and no IP; add member vni 50001 associate-vrf under nve1; and under router bgp create vrf TENANT-A with address-family ipv4 unicast and advertise l2vpn evpn, plus redistribute direct with a route-map for type-5 subnets. Verify show nve vni (L3 [TENANT-A] Up), Router-Mac in show nve peers, and show ip route vrf with segid 50001.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>L3VNI = one per tenant VRF; it carries routed traffic between leaves.</li>
<li>Needs VRF vni + RTs with evpn, a VLAN with vn-segment, an SVI with ip forward (no IP), and associate-vrf on nve1.</li>
<li>The Router MAC extended community appears once the L3VNI is up.</li>
<li>Type-5 routes advertise tenant subnets for silent hosts; redistribute needs a route-map on NX-OS.</li>
<li>Verify: L3 [TENANT-A] Up, Router-Mac in peers, segid 50001 in the VRF route table.</li>
</ul></div>
`,hi:`
<p>Ek shopping mall mein bahut saari dukaanein (subnets) hain. Dukaan ke andar saaman trolley par chalta hai (bridging), lekin dukaanon ke beech sab kuch mall ke apne service corridor se jaata hai, jise sirf mall staff use kar sakta hai aur jo har mall company ka alag hota hai. Corridor dukaan nahi hai aur uska koi counter nahi; woh sirf dukaanon ko jodta hai. <b>L3VNI</b> ek tenant ke liye wahi service corridor hai: ek VNI jo hosts ke VLAN ka nahi balki VRF ka hota hai, aur sirf leaves ke beech routed traffic le jaane ke liye use hota hai. Is chapter mein aap ise bilkul waise banaoge jaise lab 3 maangta hai, aur type-5 prefix routes jodoge.</p>

<h3>Hisse aur har ek kyun hai</h3>
<table class="cmp"><tr><th>Hissa</th><th>Command</th><th>Purpose</th></tr>
<tr><td>Tenant VRF</td><td><code>vrf context TENANT-A</code></td><td>tenant A ki alag routing table</td></tr>
<tr><td>L3VNI binding</td><td>VRF ke neeche <code>vni 50001</code></td><td>VRF ka routed traffic VNI 50001 use karta hai</td></tr>
<tr><td>RD aur RTs</td><td><code>rd auto</code>, <code>route-target both auto</code>, <code>route-target both auto evpn</code></td><td>unique routes; EVPN host routes aur prefixes ka import/export</td></tr>
<tr><td>L3VNI VLAN</td><td><code>vlan 3001</code> + <code>vn-segment 50001</code></td><td>L3VNI ka internal bridge domain (koi hosts nahi)</td></tr>
<tr><td>L3VNI SVI</td><td><code>interface Vlan3001</code>, <code>vrf member</code>, <code>ip forward</code></td><td>decapsulated L3VNI traffic ka routing hook; koi IP address nahi</td></tr>
<tr><td>NVE membership</td><td><code>member vni 50001 associate-vrf</code></td><td>NVE ko batata hai ki yeh VNI ek VRF ka Layer 3 hai</td></tr>
<tr><td>BGP VRF</td><td><code>router bgp 65001</code> / <code>vrf TENANT-A</code> / <code>address-family ipv4 unicast</code></td><td>BGP mein tenant routes; EVPN mein export</td></tr>
</table>

<h3>Configuration (lab 3, task 2): LEAF1 aur LEAF2 par same</h3>
<pre class="code">vrf context TENANT-A
  vni 50001
  rd auto
  address-family ipv4 unicast
    route-target both auto
    route-target both auto evpn
vlan 3001
  name L3VNI-TENANT-A
  vn-segment 50001
interface Vlan3001
  no shutdown
  vrf member TENANT-A
  ip forward                          <span class="c">! L3VNI SVI par koi IP address nahi</span>
interface nve1
  member vni 50001 associate-vrf
router bgp 65001
  vrf TENANT-A
    address-family ipv4 unicast
      advertise l2vpn evpn</pre>
<p><code>advertise l2vpn evpn</code> purane NX-OS releases par VRF ke BGP routes ko EVPN mein export karne ke liye zaroori hai; naye releases yeh apne aap karte hain aur line ko bina nuksaan accept karte hain. Lab ise expect karta hai. Kuch recent releases aur platforms bina VLAN ke L3VNI bhi allow karte hain (VRF ke neeche <code>vni 50001 l3</code>), lekin yahan dikhaya VLAN-based method classic hai jo aapko aana chahiye.</p>

<h3>Router MAC</h3>
<p>Jaise hi VNI 50001 up hota hai, har leaf us VRF ke apne type-2 MAC/IP routes aur type-5 routes par <b>Router MAC</b> extended community lagata hai. Default mein yeh switch ka system MAC hota hai. Symmetric IRB mein ingress leaf egress leaf ke Router MAC ko routed packet ka inner destination MAC banata hai, taaki egress leaf jaane ki frame uske routing engine ke liye hai. <code>show nve peers</code> ab Router-Mac column bharta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Ek VRF mein L2VNIs aur L3VNI">
<rect x="170" y="15" width="300" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">VRF TENANT-A = L3VNI 50001 (VLAN 3001)</text>
<rect x="40" y="110" width="220" height="44" rx="8" fill="#bae6fd"/><text x="150" y="130" text-anchor="middle" class="svg-ink" font-size="12">VLAN 10 = L2VNI 10010</text><text x="150" y="147" text-anchor="middle" class="svg-muted" font-size="12">SVI 172.16.10.1 (LEAF1)</text>
<rect x="380" y="110" width="220" height="44" rx="8" fill="#bae6fd"/><text x="490" y="130" text-anchor="middle" class="svg-ink" font-size="12">VLAN 20 = L2VNI 10020</text><text x="490" y="147" text-anchor="middle" class="svg-muted" font-size="12">SVI 172.16.20.1 (LEAF2)</text>
<line x1="150" y1="110" x2="260" y2="55" stroke="#64748b" stroke-width="2"/><line x1="490" y1="110" x2="380" y2="55" stroke="#64748b" stroke-width="2"/>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">Bridged traffic: L2VNI. Leaves ke beech routed traffic: L3VNI.</text>
</svg><p class="cap">Kai L2VNIs (har subnet ka ek) ek VRF ke hote hain, jiska bilkul ek L3VNI hota hai.</p></div>

<h3>Subnets ke liye type-5 routes</h3>
<p>Host routes (type 2) sirf un hosts ke hote hain jo bol chuke hain. Silent hosts tak pahunchne aur summarise karne ke liye har tenant subnet ko type-5 route ki tarah advertise karo. Ek saaf tareeka hai SVI addresses ko tag karna aur sirf tagged connected routes redistribute karna:</p>
<pre class="code">interface Vlan10
  ip address 172.16.10.1/24 tag 12345
route-map RM-TENANT-SUBNETS permit 10
  match tag 12345
router bgp 65001
  vrf TENANT-A
    address-family ipv4 unicast
      redistribute direct route-map RM-TENANT-SUBNETS</pre>
<p>NX-OS <code>redistribute</code> par hamesha route-map maangta hai. Remote leaf 172.16.10.0/24 ko advertise karne wale VTEP ke through install karta hai; jab silent host ka packet aata hai, woh leaf use L3VNI par subnet host karne wale leaf tak route karta hai, jo host ke liye locally ARP karta hai.</p>

<h3>Verification</h3>
<pre class="out">LEAF2# show nve vni
Interface VNI      Multicast-group   State Mode Type [BD/VRF]      Flags
--------- -------- ----------------- ----- ---- ------------------ -----
nve1      10020    UnicastBGP        Up    CP   L2 [20]            SA
<span class="hl">nve1      50001    n/a               Up    CP   L3 [TENANT-A]</span>
LEAF1# show nve peers
Interface Peer-IP          State LearnType Uptime   Router-Mac
--------- ---------------  ----- --------- -------- -----------------
<span class="hl">nve1      10.254.0.2       Up    CP        00:12:31 5254.0012.3402</span>
LEAF1# show bgp l2vpn evpn route-type 5
BGP routing table entry for [5]:[0]:[0]:[24]:[172.16.20.0]/224, version 88
    10.254.0.2 (metric 81) from 10.255.0.11 (10.255.0.11)
      Origin incomplete, MED 0, localpref 100, weight 0
<span class="hl">      Received label 50001</span>
      Extcommunity: RT:65001:50001 ENCAP:8 Router MAC:5254.0012.3402
LEAF1# show ip route vrf TENANT-A 172.16.20.12
172.16.20.12/32, ubest/mbest: 1/0
<span class="hl">    *via 10.254.0.2%default, [200/0], 00:03:12, bgp-65001, internal, tag 65001, segid: 50001 tunnelid: 0xafe0002 encap: VXLAN</span></pre>
<p>Lab 3 ka aakhri sawaal LEAF1 par 172.16.20.12/32 ka next hop poochta hai: yeh <b>10.254.0.2</b> hai, LEAF2 ka VTEP, default VRF mein.</p>

<div class="eg"><p><b>Worked example.</b> Tenant A 16 leaves par 12 subnets tak badhta hai. Phir bhi woh har us leaf par bilkul ek L3VNI (50001) aur ek L3VNI VLAN (3001) use karta hai jo uska koi bhi subnet host karta hai. Tenant B ko L3VNI 50002 aur VLAN 3002 ke saath apna VRF milta hai. Har tenant ke routes par sirf uska apna RT (65001:50001 ya 65001:50002) hota hai, isliye tenants ek doosre ke prefixes kabhi nahi dekhte.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> L3VNI SVI ko IP address dena; Vlan3001 par <code>ip forward</code> ya <code>no shutdown</code> bhoolna; alag leaves par same VRF ke alag L3VNI numbers; <code>route-target both auto evpn</code> missing (VRF koi EVPN route import nahi karta); <code>associate-vrf</code> missing (VNI kabhi L3 ki tarah nahi dikhta).</p></div>
<div class="exam"><p><b>Exam trap.</b> Har VRF ka ek L3VNI, har VLAN ka nahi. L3VNI ko VLAN aur <code>ip forward</code> wala SVI chahiye par IP address nahi, aur NVE <code>member vni 50001 associate-vrf</code> use karta hai, koi replication method nahi.</p></div>

<div class="scn"><h4>Tenant routes jo kabhi pahunche hi nahi</h4><p>Ek "VRF template cleanup" ke baad LEAF1 ke hosts doosre racks tak nahi pahunch paa rahe the, jabki dono servers apne local gateways tak pahunch rahe the. LEAF1 par <code>show nve vni</code> healthy dikh raha tha, 50001 L3 ki tarah Up. Lekin LEAF1 par <code>show ip route vrf TENANT-A</code> mein sirf local routes the; LEAF2 se BGP se seekhe koi /32 nahi. Engineer ne dono leaves par <code>show running-config vrf TENANT-A</code> milaya: LEAF1 par <code>route-target both auto</code> tha lekin cleanup ne <code>route-target both auto evpn</code> hata diya tha. LEAF1 EVPN se kuch export ya import nahi kar raha tha. Line wapas jodne se kuch second mein routes wapas aa gaye. Yeh lab 5 ka doosra fault hai.</p><p><b>Seekh:</b> VRF mein evpn keyword wala RT hi woh hai jo EVPN use karta hai.</p></div>

<div class="iv"><p class="q">"NX-OS par ek tenant ke liye L3VNI configure karna step by step batao."</p><p>Strong answer: vni 50001, rd auto aur route-target both auto evpn ke saath VRF banao; vn-segment 50001 se mapped VLAN banao; uska SVI VRF mein ip forward ke saath aur bina IP ke banao; nve1 ke neeche member vni 50001 associate-vrf jodo; aur router bgp ke neeche address-family ipv4 unicast aur advertise l2vpn evpn ke saath vrf TENANT-A banao, plus type-5 subnets ke liye route-map ke saath redistribute direct. Verify: show nve vni (L3 [TENANT-A] Up), show nve peers mein Router-Mac, aur show ip route vrf mein segid 50001.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>L3VNI = har tenant VRF ka ek; yeh leaves ke beech routed traffic le jaata hai.</li>
<li>Chahiye: VRF vni + evpn wale RTs, vn-segment wala VLAN, ip forward wala SVI (IP nahi), aur nve1 par associate-vrf.</li>
<li>Router MAC extended community L3VNI up hone par dikhti hai.</li>
<li>Type-5 routes silent hosts ke liye tenant subnets advertise karte hain; NX-OS par redistribute ko route-map chahiye.</li>
<li>Verify: L3 [TENANT-A] Up, peers mein Router-Mac, VRF route table mein segid 50001.</li>
</ul></div>
`}};export{e as default};