var e={id:`vxlan-evpn-fabric`,h:{en:`VXLAN BGP EVPN fabric design: underlay, overlay, anycast gateway, multihoming and growth`,hi:`VXLAN BGP EVPN fabric design: underlay, overlay, anycast gateway, multihoming aur growth`},body:{en:`

<p>Think of a courier company. The roads (the underlay) just carry any parcel from depot to depot. The address book (the overlay control plane) tells each depot which customer lives behind which depot. VXLAN EVPN works the same way: a simple routed network moves tunnelled packets, and BGP shares the address book. This chapter designs that fabric from a customer brief.</p>

<h3>The case: Kestrel Online Retail</h3>
<div class="eg"><p><b>Customer.</b> Kestrel Online Retail runs shop, payment and warehouse systems in a new hall: 60 leaf switches, 4 spines, around 3,000 virtual machines and six business units.</p><p><b>Requirements.</b> Move a VM to any rack without changing its IP. Each business unit isolated. The same default gateway everywhere. Add a second hall in two years. No single spine as a bottleneck.</p><p><b>Constraints.</b> The network team does not allow multicast routing in the data center. Underlay MTU can be 9216. Nexus 9000 on NX-OS. The team knows OSPF and iBGP well.</p></div>

<h3>Design decisions</h3>
<h4>1. Underlay</h4>
<p>The underlay is a plain Layer 3 network that only carries loopback reachability: each leaf has a loopback for BGP and a loopback for the <b>VTEP</b> (VXLAN tunnel endpoint, the device that adds and removes the VXLAN header). All links are routed point-to-point with ECMP.</p>
<table class="cmp"><tr><th>Underlay</th><th>Good for</th><th>Watch out for</th></tr>
<tr><td>OSPF</td><td>Familiar, fast, simple; common in single-fabric designs</td><td>Area design at large scale, LSA flooding</td></tr>
<tr><td>IS-IS</td><td>Scales well, simple area model, no IP in adjacency</td><td>Less known to some teams</td></tr>
<tr><td>eBGP (leaf AS per rack or pair)</td><td>Very large scale, policy, fast failure handling, one protocol</td><td>AS-number plan, as-path relax on spines</td></tr></table>
<p>Kestrel chooses OSPF with unnumbered point-to-point links, because the team knows it and 60 leaves is moderate.</p>
<h4>2. Overlay control plane</h4>
<p>MP-BGP with the L2VPN EVPN address family. Spines are <b>route reflectors (RR)</b> for iBGP in one AS, so leaves peer only with the two spines instead of with each other. Put the RRs on the spines, use two for redundancy, and keep border leaves as normal clients. In an eBGP overlay design the spines instead use a different AS than leaves and do not reflect.</p>
<h4>3. BUM traffic</h4>
<p>Broadcast, unknown unicast and multicast (BUM) can be sent two ways: underlay multicast (PIM) or <b>ingress replication</b>, where the sending VTEP unicasts a copy to each peer. Kestrel forbids multicast, so it uses ingress replication.</p>
<h4>4. Gateway and tenancy</h4>
<p>Every leaf holds the same <b>distributed anycast gateway</b> (same virtual IP and MAC) so a VM keeps its gateway after a move. Each business unit is a VRF with one <b>L3VNI</b>; each VLAN is mapped to an <b>L2VNI</b>. The VNI field is 24 bits, giving about 16 million segments.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="VXLAN EVPN fabric with route-reflector spines and leaf VTEPs">
<line x1="200" y1="35" x2="80" y2="105" stroke="#64748b" stroke-width="1.6"/>
<line x1="200" y1="35" x2="230" y2="105" stroke="#64748b" stroke-width="1.6"/>
<line x1="200" y1="35" x2="380" y2="105" stroke="#64748b" stroke-width="1.6"/>
<line x1="200" y1="35" x2="545" y2="105" stroke="#64748b" stroke-width="1.6"/>
<line x1="440" y1="35" x2="80" y2="105" stroke="#64748b" stroke-width="1.6"/>
<line x1="440" y1="35" x2="230" y2="105" stroke="#64748b" stroke-width="1.6"/>
<line x1="440" y1="35" x2="380" y2="105" stroke="#64748b" stroke-width="1.6"/>
<line x1="440" y1="35" x2="545" y2="105" stroke="#64748b" stroke-width="1.6"/>
<line x1="80" y1="122" x2="80" y2="195" stroke="#64748b" stroke-width="1.6"/>
<line x1="380" y1="122" x2="380" y2="195" stroke="#64748b" stroke-width="1.6"/>
<line x1="545" y1="122" x2="545" y2="195" stroke="#64748b" stroke-width="1.6"/>
<line x1="80" y1="150" x2="380" y2="150" stroke="#64748b" stroke-width="3" stroke-dasharray="5 4"/>
<rect x="140" y="18" width="120" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="146" y1="23" x2="254" y2="23" stroke="#16a34a" stroke-width="2"/><text x="200" y="39" text-anchor="middle" class="svg-ink" font-size="12">Spine 1 (RR)</text>
<rect x="380" y="18" width="120" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="386" y1="23" x2="494" y2="23" stroke="#16a34a" stroke-width="2"/><text x="440" y="39" text-anchor="middle" class="svg-ink" font-size="12">Spine 2 (RR)</text>
<rect x="25" y="88" width="110" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="31" y1="117" x2="129" y2="117" stroke="#0284c7" stroke-width="2"/><text x="80" y="109" text-anchor="middle" class="svg-ink" font-size="12">Leaf 1 VTEP</text>
<rect x="175" y="88" width="110" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="181" y1="117" x2="279" y2="117" stroke="#0284c7" stroke-width="2"/><text x="230" y="109" text-anchor="middle" class="svg-ink" font-size="12">Leaf 2 VTEP</text>
<rect x="325" y="88" width="110" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="331" y1="117" x2="429" y2="117" stroke="#0284c7" stroke-width="2"/><text x="380" y="109" text-anchor="middle" class="svg-ink" font-size="12">Leaf 3 VTEP</text>
<rect x="495" y="88" width="100" height="34" rx="7" fill="#fed7aa" stroke="#64748b"/><text x="545" y="109" text-anchor="middle" class="svg-ink" font-size="12">Border leaf</text>
<rect x="20" y="178" width="120" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="24" y="182" width="6" height="26" fill="#94a3b8"/><text x="80" y="199" text-anchor="middle" class="svg-ink" font-size="12">VM, VNI 30100</text>
<rect x="320" y="178" width="120" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="324" y="182" width="6" height="26" fill="#94a3b8"/><text x="380" y="199" text-anchor="middle" class="svg-ink" font-size="12">VM, VNI 30100</text>
<ellipse cx="545" cy="195" rx="40" ry="21" fill="#fde68a" stroke="#64748b"/><text x="545" y="199" text-anchor="middle" class="svg-ink" font-size="12">WAN</text>
<text x="230" y="144" text-anchor="middle" class="svg-muted" font-size="12">VXLAN tunnel (VNI 30100)</text>
<line x1="16" y1="216" x2="624" y2="216" stroke="#e2e8f0"/><rect x="16" y="226" width="14" height="12" rx="2" fill="#bbf7d0" stroke="#64748b"/><text x="35" y="236" class="svg-muted" font-size="11">Spine</text><rect x="137.6" y="226" width="14" height="12" rx="2" fill="#bae6fd" stroke="#64748b"/><text x="156.6" y="236" class="svg-muted" font-size="11">Leaf / access</text><rect x="259.2" y="226" width="14" height="12" rx="2" fill="#fed7aa" stroke="#64748b"/><text x="278.2" y="236" class="svg-muted" font-size="11">Border / gateway</text><rect x="380.79999999999995" y="226" width="14" height="12" rx="2" fill="#e2e8f0" stroke="#64748b"/><text x="399.79999999999995" y="236" class="svg-muted" font-size="11">Server / host</text><rect x="502.4" y="226" width="14" height="12" rx="2" fill="#fde68a" stroke="#64748b"/><text x="521.4" y="236" class="svg-muted" font-size="11">WAN / cloud</text>
</svg><p class="cap">Leaf VTEPs build tunnels automatically from BGP routes. The spines reflect EVPN routes but do not carry servers.</p></div>

<pre class="code"><span class="c">! Leaf VTEP, abridged</span>
nv overlay evpn
feature ospf
feature bgp
feature vn-segment-vlan-based
feature nv overlay
feature interface-vlan
feature fabric forwarding
fabric forwarding anycast-gateway-mac 0000.2222.3333
vlan 100
  vn-segment 30100
interface Vlan100
  vrf member TENANT-A
  ip address 10.100.0.1/24
  fabric forwarding mode anycast-gateway
  no shutdown
interface nve1
  no shutdown
  host-reachability protocol bgp
  source-interface loopback1
  member vni 30100
    ingress-replication protocol bgp
  member vni 50001 associate-vrf</pre>
<pre class="out">leaf-101# show nve peers
Interface Peer-IP       State LearnType Uptime   Router-Mac
nve1      10.255.1.3    <span class="hl">Up</span>    CP        01:12:44 n/a
leaf-101# show bgp l2vpn evpn summary
Neighbor     V    AS MsgRcvd MsgSent  State/PfxRcd
10.255.0.1   4 65001   10234   10101  <span class="hl">412</span></pre>
<p><code>LearnType CP</code> means the peer was learned from the control plane (BGP), which is what you want.</p>

<h3>Host and prefix routes in plain words</h3>
<p>EVPN uses route types. <b>Type 2</b> carries a host MAC (and optionally its IP). <b>Type 3</b> announces which VTEPs belong to a VNI, so BUM traffic knows where to go. <b>Type 5</b> carries IP prefixes (for example from the border leaf). <b>Type 1 and 4</b> support ESI multihoming. <b>ARP suppression</b> lets a leaf answer ARP locally from the EVPN table instead of flooding it.</p>

<h3>Multihoming: vPC or ESI?</h3>
<p>Servers can be dual-homed to a leaf pair with vPC (the pair shares an anycast VTEP IP) or with <b>EVPN ESI multihoming</b>, a standards-based method with no peer-link. vPC is mature and the team knows it; ESI avoids the pair limit but depends on platform and release support. Kestrel keeps vPC pairs for servers and puts the border leaves in their own pair.</p>

<h3>Growing: Multi-Pod and Multi-Site</h3>
<p>For the second hall in the same metro area, <b>VXLAN EVPN Multi-Pod</b> stretches one fabric (one BGP AS and one underlay) across pods linked by a routed core between spines; it behaves as a single failure domain. <b>Multi-Site</b> instead joins independent fabrics through <b>border gateways (BGWs)</b> with separate underlays; it limits the blast radius (chapter 5).</p>
<p>Controllers: day-0 build, templates and compliance for this kind of fabric are what Nexus Dashboard Fabric Controller (NDFC) automates (chapter 7).</p>

<h3>Chosen design</h3>
<p>OSPF underlay, MTU 9216, iBGP EVPN with two spine RRs, ingress replication, anycast gateway, vPC leaf pairs, one VRF per business unit, a border-leaf pair with VRF-lite to the firewalls. The second hall is planned as a pod only if its latency and failure-domain risk are acceptable; otherwise a separate fabric with Multi-Site.</p>

<div class="warn"><p><b>Common mistakes.</b> Underlay MTU left at 1500 (VXLAN adds about 50 bytes, large frames drop). Using one RR only. Forgetting <code>send-community extended</code>, so route targets never arrive.</p></div>
<div class="exam"><p><b>Exam trap.</b> The underlay carries no tenant routes. And the VTEP loopback must be reachable by the underlay protocol or no tunnels form.</p></div>

<div class="scn"><h4>What went wrong at Kestrel</h4><p>At go-live, large file transfers between racks stalled while pings worked. The underlay links were 9216 but the border-leaf uplinks to the firewalls were 1500, and one spine port had been left at the default. VXLAN-encapsulated full-size frames were dropped silently. Engineers found it with a don't-fragment ping sized above 1450 along the path. They set MTU everywhere and added an MTU check to the build template.</p><p><b>Lesson:</b> pings prove reachability, not MTU; test with a large DF-bit packet.</p></div>

<div class="iv"><p class="q">"Why use BGP EVPN instead of flood-and-learn VXLAN?"</p><p>EVPN learns MACs and IPs through the control plane, so there is less flooding, ARP suppression, multitenancy with route targets, and a clean path to multihoming and multi-site. Flood-and-learn relies on multicast and data-plane learning and does not scale as well.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay = routed loopback reachability (OSPF, IS-IS or eBGP); overlay = BGP EVPN.</li>
<li>Spines as route reflectors; two for redundancy.</li>
<li>Choose ingress replication when multicast is not allowed.</li>
<li>Anycast gateway keeps the same gateway on every leaf.</li>
<li>Multi-Pod is one fabric; Multi-Site joins separate fabrics.</li>
</ul></div>

`,hi:`

<p>Ek courier company socho. Roads (underlay) bas koi bhi parcel depot se depot tak le jaati hain. Address book (overlay control plane) har depot ko batati hai ki kaunsa customer kis depot ke peeche rehta hai. VXLAN EVPN bhi aise hi kaam karta hai: ek simple routed network tunnelled packets move karta hai, aur BGP address book share karta hai. Yeh chapter customer brief se woh fabric design karta hai.</p>

<h3>Case: Kestrel Online Retail</h3>
<div class="eg"><p><b>Customer.</b> Kestrel Online Retail naye hall mein shop, payment aur warehouse systems chalata hai: 60 leaf switches, 4 spines, lagbhag 3,000 virtual machines aur chhe business units.</p><p><b>Requirements.</b> VM ko IP badle bina kisi bhi rack mein move karna. Har business unit isolated. Har jagah same default gateway. Do saal mein doosra hall jodna. Koi ek spine bottleneck nahi.</p><p><b>Constraints.</b> Network team data center mein multicast routing allow nahi karti. Underlay MTU 9216 ho sakta hai. NX-OS par Nexus 9000. Team OSPF aur iBGP achhe se jaanti hai.</p></div>

<h3>Design decisions</h3>
<h4>1. Underlay</h4>
<p>Underlay ek plain Layer 3 network hai jo sirf loopback reachability carry karta hai: har leaf par BGP ke liye ek loopback aur <b>VTEP</b> (VXLAN tunnel endpoint, woh device jo VXLAN header lagata aur hataata hai) ke liye ek loopback. Saare links routed point-to-point hain, ECMP ke saath.</p>
<table class="cmp"><tr><th>Underlay</th><th>Kiske liye achha</th><th>Dhyan rakho</th></tr>
<tr><td>OSPF</td><td>Familiar, fast, simple; single-fabric designs mein common</td><td>Bade scale par area design, LSA flooding</td></tr>
<tr><td>IS-IS</td><td>Achha scale, simple area model, adjacency mein IP nahi</td><td>Kuch teams ko kam pata</td></tr>
<tr><td>eBGP (har rack ya pair ka leaf AS)</td><td>Bahut bada scale, policy, fast failure handling, ek hi protocol</td><td>AS-number plan, spines par as-path relax</td></tr></table>
<p>Kestrel unnumbered point-to-point links ke saath OSPF chunta hai, kyunki team jaanti hai aur 60 leaves moderate hain.</p>
<h4>2. Overlay control plane</h4>
<p>L2VPN EVPN address family ke saath MP-BGP. Spines ek AS mein iBGP ke <b>route reflectors (RR)</b> hain, isliye leaves ek doosre se nahi, sirf do spines se peer karte hain. RRs spines par rakho, redundancy ke liye do, aur border leaves ko normal clients rakho. eBGP overlay design mein spines leaves se alag AS use karte hain aur reflect nahi karte.</p>
<h4>3. BUM traffic</h4>
<p>Broadcast, unknown unicast aur multicast (BUM) do tareeke se bheja ja sakta hai: underlay multicast (PIM) ya <b>ingress replication</b>, jahan sending VTEP har peer ko ek unicast copy bhejta hai. Kestrel multicast mana karta hai, isliye ingress replication use hota hai.</p>
<h4>4. Gateway aur tenancy</h4>
<p>Har leaf par same <b>distributed anycast gateway</b> (same virtual IP aur MAC) hota hai taaki VM move ke baad bhi apna gateway rakhe. Har business unit ek VRF hai jiska ek <b>L3VNI</b> hai; har VLAN ek <b>L2VNI</b> se map hota hai. VNI field 24 bits ki hai, yaani lagbhag 16 million segments.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="VXLAN EVPN fabric: route-reflector spines aur leaf VTEPs">
<line x1="200" y1="35" x2="80" y2="105" stroke="#64748b" stroke-width="1.6"/>
<line x1="200" y1="35" x2="230" y2="105" stroke="#64748b" stroke-width="1.6"/>
<line x1="200" y1="35" x2="380" y2="105" stroke="#64748b" stroke-width="1.6"/>
<line x1="200" y1="35" x2="545" y2="105" stroke="#64748b" stroke-width="1.6"/>
<line x1="440" y1="35" x2="80" y2="105" stroke="#64748b" stroke-width="1.6"/>
<line x1="440" y1="35" x2="230" y2="105" stroke="#64748b" stroke-width="1.6"/>
<line x1="440" y1="35" x2="380" y2="105" stroke="#64748b" stroke-width="1.6"/>
<line x1="440" y1="35" x2="545" y2="105" stroke="#64748b" stroke-width="1.6"/>
<line x1="80" y1="122" x2="80" y2="195" stroke="#64748b" stroke-width="1.6"/>
<line x1="380" y1="122" x2="380" y2="195" stroke="#64748b" stroke-width="1.6"/>
<line x1="545" y1="122" x2="545" y2="195" stroke="#64748b" stroke-width="1.6"/>
<line x1="80" y1="150" x2="380" y2="150" stroke="#64748b" stroke-width="3" stroke-dasharray="5 4"/>
<rect x="140" y="18" width="120" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="146" y1="23" x2="254" y2="23" stroke="#16a34a" stroke-width="2"/><text x="200" y="39" text-anchor="middle" class="svg-ink" font-size="12">Spine 1 (RR)</text>
<rect x="380" y="18" width="120" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="386" y1="23" x2="494" y2="23" stroke="#16a34a" stroke-width="2"/><text x="440" y="39" text-anchor="middle" class="svg-ink" font-size="12">Spine 2 (RR)</text>
<rect x="25" y="88" width="110" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="31" y1="117" x2="129" y2="117" stroke="#0284c7" stroke-width="2"/><text x="80" y="109" text-anchor="middle" class="svg-ink" font-size="12">Leaf 1 VTEP</text>
<rect x="175" y="88" width="110" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="181" y1="117" x2="279" y2="117" stroke="#0284c7" stroke-width="2"/><text x="230" y="109" text-anchor="middle" class="svg-ink" font-size="12">Leaf 2 VTEP</text>
<rect x="325" y="88" width="110" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="331" y1="117" x2="429" y2="117" stroke="#0284c7" stroke-width="2"/><text x="380" y="109" text-anchor="middle" class="svg-ink" font-size="12">Leaf 3 VTEP</text>
<rect x="495" y="88" width="100" height="34" rx="7" fill="#fed7aa" stroke="#64748b"/><text x="545" y="109" text-anchor="middle" class="svg-ink" font-size="12">Border leaf</text>
<rect x="20" y="178" width="120" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="24" y="182" width="6" height="26" fill="#94a3b8"/><text x="80" y="199" text-anchor="middle" class="svg-ink" font-size="12">VM, VNI 30100</text>
<rect x="320" y="178" width="120" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="324" y="182" width="6" height="26" fill="#94a3b8"/><text x="380" y="199" text-anchor="middle" class="svg-ink" font-size="12">VM, VNI 30100</text>
<ellipse cx="545" cy="195" rx="40" ry="21" fill="#fde68a" stroke="#64748b"/><text x="545" y="199" text-anchor="middle" class="svg-ink" font-size="12">WAN</text>
<text x="230" y="144" text-anchor="middle" class="svg-muted" font-size="12">VXLAN tunnel (VNI 30100)</text>
<line x1="16" y1="216" x2="624" y2="216" stroke="#e2e8f0"/><rect x="16" y="226" width="14" height="12" rx="2" fill="#bbf7d0" stroke="#64748b"/><text x="35" y="236" class="svg-muted" font-size="11">Spine</text><rect x="137.6" y="226" width="14" height="12" rx="2" fill="#bae6fd" stroke="#64748b"/><text x="156.6" y="236" class="svg-muted" font-size="11">Leaf / access</text><rect x="259.2" y="226" width="14" height="12" rx="2" fill="#fed7aa" stroke="#64748b"/><text x="278.2" y="236" class="svg-muted" font-size="11">Border / gateway</text><rect x="380.79999999999995" y="226" width="14" height="12" rx="2" fill="#e2e8f0" stroke="#64748b"/><text x="399.79999999999995" y="236" class="svg-muted" font-size="11">Server / host</text><rect x="502.4" y="226" width="14" height="12" rx="2" fill="#fde68a" stroke="#64748b"/><text x="521.4" y="236" class="svg-muted" font-size="11">WAN / cloud</text>
</svg><p class="cap">Leaf VTEPs BGP routes se tunnels khud banate hain. Spines EVPN routes reflect karte hain par servers carry nahi karte.</p></div>

<pre class="code"><span class="c">! Leaf VTEP, abridged</span>
nv overlay evpn
feature ospf
feature bgp
feature vn-segment-vlan-based
feature nv overlay
feature interface-vlan
feature fabric forwarding
fabric forwarding anycast-gateway-mac 0000.2222.3333
vlan 100
  vn-segment 30100
interface Vlan100
  vrf member TENANT-A
  ip address 10.100.0.1/24
  fabric forwarding mode anycast-gateway
  no shutdown
interface nve1
  no shutdown
  host-reachability protocol bgp
  source-interface loopback1
  member vni 30100
    ingress-replication protocol bgp
  member vni 50001 associate-vrf</pre>
<pre class="out">leaf-101# show nve peers
Interface Peer-IP       State LearnType Uptime   Router-Mac
nve1      10.255.1.3    <span class="hl">Up</span>    CP        01:12:44 n/a
leaf-101# show bgp l2vpn evpn summary
Neighbor     V    AS MsgRcvd MsgSent  State/PfxRcd
10.255.0.1   4 65001   10234   10101  <span class="hl">412</span></pre>
<p><code>LearnType CP</code> ka matlab peer control plane (BGP) se seekha gaya, aur yahi chahiye.</p>

<h3>Host aur prefix routes saral shabdon mein</h3>
<p>EVPN route types use karta hai. <b>Type 2</b> host MAC (aur optionally uska IP) carry karta hai. <b>Type 3</b> batata hai ki kaunse VTEPs ek VNI ke member hain, taaki BUM traffic ko pata ho kahan jaana hai. <b>Type 5</b> IP prefixes carry karta hai (jaise border leaf se). <b>Type 1 aur 4</b> ESI multihoming ko support karte hain. <b>ARP suppression</b> leaf ko ARP flood karne ki jagah EVPN table se local jawab dene deta hai.</p>

<h3>Multihoming: vPC ya ESI?</h3>
<p>Servers ko leaf pair se vPC ke saath dual-home kar sakte hain (pair ek anycast VTEP IP share karta hai) ya <b>EVPN ESI multihoming</b> se, jo bina peer-link ka standards-based method hai. vPC mature hai aur team jaanti hai; ESI pair limit hatata hai par platform aur release support par nirbhar hai. Kestrel servers ke liye vPC pairs rakhta hai aur border leaves ko alag pair mein.</p>

<h3>Growth: Multi-Pod aur Multi-Site</h3>
<p>Same metro area ke doosre hall ke liye <b>VXLAN EVPN Multi-Pod</b> ek fabric (ek BGP AS aur ek underlay) ko spines ke beech routed core se jode pods mein stretch karta hai; yeh ek hi failure domain ki tarah behave karta hai. <b>Multi-Site</b> alag underlays wale independent fabrics ko <b>border gateways (BGWs)</b> se jodta hai; yeh blast radius ko limit karta hai (chapter 5).</p>
<p>Controllers: is tarah ke fabric ka day-0 build, templates aur compliance Nexus Dashboard Fabric Controller (NDFC) automate karta hai (chapter 7).</p>

<h3>Chosen design</h3>
<p>OSPF underlay, MTU 9216, do spine RRs ke saath iBGP EVPN, ingress replication, anycast gateway, vPC leaf pairs, har business unit ke liye ek VRF, firewalls ke liye VRF-lite wala border-leaf pair. Doosra hall tabhi pod banega jab uski latency aur failure-domain risk acceptable ho; warna alag fabric Multi-Site ke saath.</p>

<div class="warn"><p><b>Common mistakes.</b> Underlay MTU 1500 chhod dena (VXLAN lagbhag 50 bytes jodta hai, bade frames drop hote hain). Sirf ek RR use karna. <code>send-community extended</code> bhool jaana, jisse route targets kabhi nahi pahunchte.</p></div>
<div class="exam"><p><b>Exam trap.</b> Underlay tenant routes carry nahi karta. Aur VTEP loopback underlay protocol se reachable hona chahiye warna tunnels nahi bante.</p></div>

<div class="scn"><h4>Kestrel mein kya galat hua</h4><p>Go-live par racks ke beech bade file transfers ruk gaye jabki pings chal rahi thi. Underlay links 9216 the lekin firewalls ke border-leaf uplinks 1500 the, aur ek spine port default par chhoot gaya tha. VXLAN-encapsulated full-size frames chupchaap drop ho rahe the. Engineers ne path par 1450 se bada don't-fragment ping chalakar pakda. Unhone har jagah MTU set kiya aur build template mein MTU check joda.</p><p><b>Lesson:</b> ping reachability prove karta hai, MTU nahi; bade DF-bit packet se test karo.</p></div>

<div class="iv"><p class="q">"Flood-and-learn VXLAN ki jagah BGP EVPN kyun?"</p><p>EVPN MACs aur IPs ko control plane se seekhta hai, isliye flooding kam, ARP suppression, route targets ke saath multitenancy, aur multihoming aur multi-site ka saaf raasta. Flood-and-learn multicast aur data-plane learning par chalta hai aur utna scale nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay = routed loopback reachability (OSPF, IS-IS ya eBGP); overlay = BGP EVPN.</li>
<li>Spines route reflectors; redundancy ke liye do.</li>
<li>Multicast allowed na ho to ingress replication chuno.</li>
<li>Anycast gateway har leaf par same gateway rakhta hai.</li>
<li>Multi-Pod ek fabric hai; Multi-Site alag fabrics jodta hai.</li>
</ul></div>

`}};export{e as default};