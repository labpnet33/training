var e={id:`msmh`,h:{en:`Multihoming (vPC vs ESI) and EVPN Multi-Site`,hi:`Multihoming (vPC vs ESI) aur EVPN Multi-Site`},body:{en:`
<p>A family doctor works from two clinics in the same area so patients are never stranded if one clinic closes. Patients should see "one doctor", not two, and letters must reach them without being delivered twice. That is <b>multihoming</b>: a server connected to two leaves for redundancy. Separately, a hospital group with hospitals in two cities wants shared patient records, but each city must keep running if the highway between them closes. That is <b>Multi-Site</b>. This chapter covers both at design level, which is what the CCNP Data Center exams expect.</p>

<h3>Why multihoming needs special handling</h3>
<p>A server with a two-port LACP bond to LEAF1 and LEAF2 creates three problems for EVPN: remote leaves see the same MAC behind two VTEPs, BUM traffic could reach the server twice (once from each leaf), and if one leaf loses its link, remote leaves must stop using it quickly. Two solutions exist on Nexus: <b>vPC</b> and <b>EVPN ESI multihoming</b>.</p>

<h3>Option 1: vPC with an anycast VTEP (most common on Nexus)</h3>
<p>The two leaves form a vPC domain with a peer-link and peer-keepalive, and appear as one switch to the server. For VXLAN they also share one <b>anycast VTEP</b> address: a <b>secondary IP</b> on loopback1, identical on both leaves. Remote leaves see the server's MAC behind that single virtual VTEP and ECMP across both.</p>
<pre class="code"><span class="c">! LEAF3 and LEAF4 (vPC pair): same secondary on both</span>
interface loopback1
  ip address 10.254.0.3/32                <span class="c">! LEAF4 uses 10.254.0.4</span>
  ip address 10.254.0.34/32 secondary     <span class="c">! shared anycast VTEP</span>
interface nve1
  advertise virtual-rmac
router bgp 65001
  address-family l2vpn evpn
    advertise-pip</pre>
<p><code>advertise-pip</code> and <code>advertise virtual-rmac</code> make each leaf advertise type-5 and single-attached (orphan) host routes with its own <b>primary IP</b> and system MAC, while dual-attached hosts use the shared virtual address. Without them, traffic to a host attached to only one vPC member may land on the wrong leaf and cross the peer-link.</p>

<h3>Option 2: EVPN ESI multihoming (standards-based)</h3>
<p>Instead of vPC, each leaf is configured with the same <b>Ethernet Segment Identifier</b> (ESI, 10 bytes) on the port-channel facing the server. No peer-link is needed and the leaves keep their own VTEP addresses. EVPN itself coordinates them:</p>
<ul>
<li><b>Type 4</b> (Ethernet Segment) routes let the leaves discover each other and elect a <b>designated forwarder</b> (DF) per VLAN, the only leaf that sends BUM traffic to the segment, so the server never gets duplicates.</li>
<li><b>Type 1</b> (Ethernet A-D) routes provide <b>aliasing</b> (remote leaves can load-balance to both leaves even if a MAC was learned by only one) and <b>mass withdraw</b> (one withdrawal removes every MAC on a failed segment, much faster than withdrawing thousands of type-2 routes).</li>
</ul>
<pre class="code">evpn esi multihoming
interface port-channel10
  ethernet-segment 2011
    system-mac 0000.0000.2011</pre>

<table class="cmp"><tr><th></th><th>vPC</th><th>ESI multihoming</th></tr>
<tr><td>Peer-link</td><td>required</td><td>not required</td></tr>
<tr><td>VTEP address</td><td>shared anycast secondary IP</td><td>each leaf keeps its own</td></tr>
<tr><td>Coordination</td><td>vPC protocol (CFS)</td><td>EVPN route types 1 and 4</td></tr>
<tr><td>Multi-vendor</td><td>Cisco only</td><td>standard (RFC 7432)</td></tr>
<tr><td>Typical use</td><td>most Nexus designs today</td><td>newer designs, multi-vendor fabrics</td></tr>
</table>

<h3>EVPN Multi-Site</h3>
<p>A large company may run two or more fabrics (sites), each with its own spines, leaves and BGP AS. Joining them into one giant fabric (a stretched fabric or <b>Multi-Pod</b>) creates one big failure domain: a broadcast storm or a control-plane problem in one site affects all. <b>VXLAN EVPN Multi-Site</b> instead keeps each site independent and connects them through <b>border gateways (BGWs)</b>:</p>
<ul>
<li>Inside a site, VXLAN tunnels end on the BGW. Between sites, BGWs build tunnels to BGWs of other sites. A leaf never builds a tunnel directly to a leaf in another site.</li>
<li>The BGW <b>re-originates</b> EVPN routes with its own <b>Multi-Site VIP</b> as next hop (a shared loopback per site), so each site sees the other site as a single next hop.</li>
<li>BUM traffic is controlled at the BGW; flooding does not freely cross between sites.</li>
<li>Sites peer with eBGP between BGWs (or through route servers), each site keeping its own AS.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Two sites joined by border gateways">
<rect x="10" y="20" width="250" height="150" rx="10" fill="#e2e8f0"/><text x="135" y="42" text-anchor="middle" class="svg-ink" font-size="13">Site 1 (AS 65001)</text>
<rect x="380" y="20" width="250" height="150" rx="10" fill="#e2e8f0"/><text x="505" y="42" text-anchor="middle" class="svg-ink" font-size="13">Site 2 (AS 65002)</text>
<rect x="30" y="110" width="80" height="34" rx="6" fill="#bae6fd"/><text x="70" y="132" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="160" y="70" width="80" height="74" rx="6" fill="#fde68a"/><text x="200" y="100" text-anchor="middle" class="svg-ink" font-size="12">BGW</text><text x="200" y="118" text-anchor="middle" class="svg-muted" font-size="12">VIP</text>
<rect x="400" y="70" width="80" height="74" rx="6" fill="#fde68a"/><text x="440" y="100" text-anchor="middle" class="svg-ink" font-size="12">BGW</text><text x="440" y="118" text-anchor="middle" class="svg-muted" font-size="12">VIP</text>
<rect x="530" y="110" width="80" height="34" rx="6" fill="#bae6fd"/><text x="570" y="132" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<line x1="110" y1="127" x2="160" y2="115" stroke="#64748b" stroke-width="2"/><line x1="240" y1="107" x2="400" y2="107" stroke="#64748b" stroke-width="3"/><line x1="480" y1="115" x2="530" y2="127" stroke="#64748b" stroke-width="2"/>
<text x="320" y="95" text-anchor="middle" class="svg-accent" font-size="12">DCI: eBGP EVPN + VXLAN</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Tunnels: leaf to BGW, BGW to BGW, BGW to leaf</text>
</svg><p class="cap">Multi-Site splits the path into three tunnel segments. Each site stays its own failure domain.</p></div>

<pre class="code"><span class="c">! BGW key lines (concept level)</span>
evpn multisite border-gateway 100
interface nve1
  multisite border-gateway interface loopback100
  member vni 10010
    multisite ingress-replication
interface Ethernet1/1
  evpn multisite fabric-tracking
interface Ethernet1/53
  evpn multisite dci-tracking
router bgp 65001
  neighbor 192.0.2.2
    remote-as 65002
    peer-type fabric-external
    address-family l2vpn evpn
      send-community extended
      rewrite-evpn-rt-asn</pre>

<h3>DCI options at a glance</h3>
<table class="cmp"><tr><th>Option</th><th>Idea</th><th>Trade-off</th></tr>
<tr><td>Stretched fabric / Multi-Pod</td><td>one EVPN control plane across sites</td><td>simple, but one failure domain</td></tr>
<tr><td>Multi-Site with BGWs</td><td>separate fabrics, controlled handoff</td><td>isolation and scale; more design work</td></tr>
<tr><td>VRF-lite or MPLS L3VPN handoff</td><td>Layer 3 only between sites</td><td>no Layer-2 extension; simplest failure isolation</td></tr>
<tr><td>Legacy L2 extension (for example OTV, back-to-back vPC)</td><td>older Layer-2 DCI</td><td>still found in brownfield networks</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Each of two sites has 300 VTEPs. In a stretched fabric every leaf could have up to 599 remote VTEP peers and a flood list spanning both sites. With Multi-Site, a leaf in site 1 has up to 299 local peers plus the site-1 BGW VIP; everything in site 2 hides behind one next hop.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting the secondary anycast IP on one vPC member (split VTEP); leaving out <code>advertise-pip</code> so orphan hosts are unreachable half the time; assuming Multi-Site extends every VLAN automatically (only VNIs configured on the BGW cross); using different ESIs on the two leaves of one segment.</p></div>
<div class="exam"><p><b>Exam trap.</b> Route types 1 and 4 exist for ESI multihoming: type 4 = DF election, type 1 = aliasing and mass withdraw. vPC with VXLAN uses a shared <b>secondary</b> loopback IP as anycast VTEP. Multi-Site BGWs rewrite the next hop to the site VIP.</p></div>

<div class="scn"><h4>The orphan server that dropped every other packet</h4><p>A backup server was cabled to only one leaf of a vPC pair (an orphan port). Pings to it from other racks lost roughly half the packets. Its type-2 route was advertised with the shared anycast VTEP as next hop, so remote leaves hashed half the flows to the vPC peer that did not have the server. That peer had to send them across the peer-link, where a policy dropped them. The fabric had been built without <code>advertise-pip</code>. After enabling <code>advertise-pip</code> and <code>advertise virtual-rmac</code>, the orphan host's route was advertised with the correct leaf's primary IP and loss stopped.</p><p><b>Lesson:</b> vPC with VXLAN needs both the shared anycast VTEP and advertise-pip for correct forwarding to single-attached hosts.</p></div>

<div class="iv"><p class="q">"How would you dual-home servers in a VXLAN EVPN fabric, and how would you interconnect two data centers?"</p><p>Strong answer: on Nexus, vPC with an anycast VTEP (shared secondary IP on loopback1) plus advertise-pip and advertise virtual-rmac; or standards-based ESI multihoming, where type-4 routes elect a DF and type-1 routes give aliasing and mass withdraw without a peer-link. For two DCs, prefer EVPN Multi-Site with border gateways: separate fabrics and AS numbers, BGWs re-originate routes with a site VIP, control BUM and isolate failures, versus a stretched fabric that is one failure domain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>vPC with VXLAN uses a shared secondary loopback1 IP as the anycast VTEP; add advertise-pip and advertise virtual-rmac.</li>
<li>ESI multihoming is standards-based: type 4 elects the DF, type 1 gives aliasing and mass withdraw.</li>
<li>Multi-Site keeps fabrics independent; BGWs re-originate routes with a site VIP.</li>
<li>Stretched fabrics are simple but form one failure domain.</li>
<li>Layer-3-only DCI (VRF-lite or L3VPN) is the simplest when Layer-2 extension is not needed.</li>
</ul></div>
`,hi:`
<p>Ek family doctor ek hi area ke do clinics se kaam karta hai taaki ek clinic band hone par patients phans na jaayein. Patients ko "ek doctor" dikhna chahiye, do nahi, aur chitthiyan unhe do baar nahi pahunchni chahiye. Yahi <b>multihoming</b> hai: redundancy ke liye do leaves se juda server. Alag se, ek hospital group jiske hospitals do shehron mein hain, shared patient records chahta hai, lekin beech ka highway band hone par bhi har shehar chalta rehna chahiye. Yeh <b>Multi-Site</b> hai. Yeh chapter dono ko design level par cover karta hai, jo CCNP Data Center exams expect karte hain.</p>

<h3>Multihoming ko special handling kyun chahiye</h3>
<p>LEAF1 aur LEAF2 se do-port LACP bond wala server EVPN ke liye teen problems banata hai: remote leaves same MAC ko do VTEPs ke peeche dekhte hain, BUM traffic server tak do baar pahunch sakta hai (har leaf se ek), aur agar ek leaf ka link jaaye to remote leaves ko use jaldi use karna band karna chahiye. Nexus par do solutions hain: <b>vPC</b> aur <b>EVPN ESI multihoming</b>.</p>

<h3>Option 1: anycast VTEP ke saath vPC (Nexus par sabse common)</h3>
<p>Do leaves peer-link aur peer-keepalive ke saath vPC domain banate hain, aur server ko ek switch dikhte hain. VXLAN ke liye woh ek <b>anycast VTEP</b> address bhi share karte hain: loopback1 par ek <b>secondary IP</b>, dono leaves par same. Remote leaves server ka MAC us ek virtual VTEP ke peeche dekhte hain aur dono par ECMP karte hain.</p>
<pre class="code"><span class="c">! LEAF3 aur LEAF4 (vPC pair): dono par same secondary</span>
interface loopback1
  ip address 10.254.0.3/32                <span class="c">! LEAF4 10.254.0.4 use karta hai</span>
  ip address 10.254.0.34/32 secondary     <span class="c">! shared anycast VTEP</span>
interface nve1
  advertise virtual-rmac
router bgp 65001
  address-family l2vpn evpn
    advertise-pip</pre>
<p><code>advertise-pip</code> aur <code>advertise virtual-rmac</code> har leaf ko type-5 aur single-attached (orphan) host routes apne <b>primary IP</b> aur system MAC ke saath advertise karwate hain, jabki dual-attached hosts shared virtual address use karte hain. Inke bina, sirf ek vPC member se jude host ka traffic galat leaf par aa kar peer-link cross kar sakta hai.</p>

<h3>Option 2: EVPN ESI multihoming (standards-based)</h3>
<p>vPC ki jagah har leaf par server ki taraf wale port-channel par same <b>Ethernet Segment Identifier</b> (ESI, 10 bytes) configure hota hai. Peer-link ki zaroorat nahi aur leaves apne VTEP addresses rakhte hain. EVPN khud unhe coordinate karta hai:</p>
<ul>
<li><b>Type 4</b> (Ethernet Segment) routes leaves ko ek doosre ko discover karne aur har VLAN ke liye <b>designated forwarder</b> (DF) chunne dete hain, woh akela leaf jo segment ko BUM traffic bhejta hai, taaki server ko kabhi duplicates na milein.</li>
<li><b>Type 1</b> (Ethernet A-D) routes <b>aliasing</b> dete hain (remote leaves dono leaves par load-balance kar sakte hain chahe MAC sirf ek ne seekha ho) aur <b>mass withdraw</b> (ek withdrawal failed segment ke har MAC ko hata deta hai, hazaaron type-2 routes withdraw karne se kahin tez).</li>
</ul>
<pre class="code">evpn esi multihoming
interface port-channel10
  ethernet-segment 2011
    system-mac 0000.0000.2011</pre>

<table class="cmp"><tr><th></th><th>vPC</th><th>ESI multihoming</th></tr>
<tr><td>Peer-link</td><td>zaroori</td><td>zaroori nahi</td></tr>
<tr><td>VTEP address</td><td>shared anycast secondary IP</td><td>har leaf apna rakhta hai</td></tr>
<tr><td>Coordination</td><td>vPC protocol (CFS)</td><td>EVPN route types 1 aur 4</td></tr>
<tr><td>Multi-vendor</td><td>sirf Cisco</td><td>standard (RFC 7432)</td></tr>
<tr><td>Typical use</td><td>aaj ke zyada tar Nexus designs</td><td>naye designs, multi-vendor fabrics</td></tr>
</table>

<h3>EVPN Multi-Site</h3>
<p>Ek badi company do ya zyada fabrics (sites) chala sakti hai, har ek ke apne spines, leaves aur BGP AS ke saath. Unhe ek bade fabric mein jodna (stretched fabric ya <b>Multi-Pod</b>) ek bada failure domain banata hai: ek site ka broadcast storm ya control-plane problem sabko affect karta hai. <b>VXLAN EVPN Multi-Site</b> iski jagah har site ko independent rakhta hai aur unhe <b>border gateways (BGWs)</b> se jodta hai:</p>
<ul>
<li>Site ke andar VXLAN tunnels BGW par khatam hote hain. Sites ke beech BGWs doosri sites ke BGWs tak tunnels banate hain. Leaf kabhi doosri site ke leaf tak seedha tunnel nahi banata.</li>
<li>BGW EVPN routes ko apne <b>Multi-Site VIP</b> (har site ka ek shared loopback) ko next hop bana kar <b>re-originate</b> karta hai, isliye har site doosri site ko ek hi next hop ki tarah dekhti hai.</li>
<li>BUM traffic BGW par control hota hai; flooding sites ke beech khule aam nahi jaati.</li>
<li>Sites BGWs ke beech eBGP se peer karti hain (ya route servers ke through), har site apna AS rakhti hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Border gateways se judi do sites">
<rect x="10" y="20" width="250" height="150" rx="10" fill="#e2e8f0"/><text x="135" y="42" text-anchor="middle" class="svg-ink" font-size="13">Site 1 (AS 65001)</text>
<rect x="380" y="20" width="250" height="150" rx="10" fill="#e2e8f0"/><text x="505" y="42" text-anchor="middle" class="svg-ink" font-size="13">Site 2 (AS 65002)</text>
<rect x="30" y="110" width="80" height="34" rx="6" fill="#bae6fd"/><text x="70" y="132" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="160" y="70" width="80" height="74" rx="6" fill="#fde68a"/><text x="200" y="100" text-anchor="middle" class="svg-ink" font-size="12">BGW</text><text x="200" y="118" text-anchor="middle" class="svg-muted" font-size="12">VIP</text>
<rect x="400" y="70" width="80" height="74" rx="6" fill="#fde68a"/><text x="440" y="100" text-anchor="middle" class="svg-ink" font-size="12">BGW</text><text x="440" y="118" text-anchor="middle" class="svg-muted" font-size="12">VIP</text>
<rect x="530" y="110" width="80" height="34" rx="6" fill="#bae6fd"/><text x="570" y="132" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<line x1="110" y1="127" x2="160" y2="115" stroke="#64748b" stroke-width="2"/><line x1="240" y1="107" x2="400" y2="107" stroke="#64748b" stroke-width="3"/><line x1="480" y1="115" x2="530" y2="127" stroke="#64748b" stroke-width="2"/>
<text x="320" y="95" text-anchor="middle" class="svg-accent" font-size="12">DCI: eBGP EVPN + VXLAN</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Tunnels: leaf se BGW, BGW se BGW, BGW se leaf</text>
</svg><p class="cap">Multi-Site path ko teen tunnel segments mein baantta hai. Har site apna failure domain rehti hai.</p></div>

<pre class="code"><span class="c">! BGW ki key lines (concept level)</span>
evpn multisite border-gateway 100
interface nve1
  multisite border-gateway interface loopback100
  member vni 10010
    multisite ingress-replication
interface Ethernet1/1
  evpn multisite fabric-tracking
interface Ethernet1/53
  evpn multisite dci-tracking
router bgp 65001
  neighbor 192.0.2.2
    remote-as 65002
    peer-type fabric-external
    address-family l2vpn evpn
      send-community extended
      rewrite-evpn-rt-asn</pre>

<h3>DCI options ek nazar mein</h3>
<table class="cmp"><tr><th>Option</th><th>Idea</th><th>Trade-off</th></tr>
<tr><td>Stretched fabric / Multi-Pod</td><td>sites ke paar ek EVPN control plane</td><td>simple, par ek failure domain</td></tr>
<tr><td>BGWs ke saath Multi-Site</td><td>alag fabrics, controlled handoff</td><td>isolation aur scale; zyada design kaam</td></tr>
<tr><td>VRF-lite ya MPLS L3VPN handoff</td><td>sites ke beech sirf Layer 3</td><td>Layer-2 extension nahi; sabse simple failure isolation</td></tr>
<tr><td>Legacy L2 extension (jaise OTV, back-to-back vPC)</td><td>purana Layer-2 DCI</td><td>brownfield networks mein abhi bhi milta hai</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Do sites mein se har ek mein 300 VTEPs hain. Stretched fabric mein har leaf ke 599 tak remote VTEP peers aur dono sites par faili flood list ho sakti hai. Multi-Site ke saath site 1 ke leaf ke 299 tak local peers plus site-1 BGW VIP hote hain; site 2 ka sab kuch ek next hop ke peeche chhup jaata hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Ek vPC member par secondary anycast IP bhoolna (split VTEP); <code>advertise-pip</code> chhod dena jisse orphan hosts aadhe time unreachable rehte hain; yeh maan lena ki Multi-Site har VLAN apne aap extend karta hai (sirf BGW par configured VNIs cross karte hain); ek segment ke do leaves par alag ESIs use karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Route types 1 aur 4 ESI multihoming ke liye hain: type 4 = DF election, type 1 = aliasing aur mass withdraw. VXLAN ke saath vPC anycast VTEP ki tarah shared <b>secondary</b> loopback IP use karta hai. Multi-Site BGWs next hop ko site VIP se rewrite karte hain.</p></div>

<div class="scn"><h4>Woh orphan server jo har doosra packet drop karta tha</h4><p>Ek backup server vPC pair ke sirf ek leaf se cable hua tha (orphan port). Doosre racks se uski pings lagbhag aadhe packets kho rahi thi. Uska type-2 route shared anycast VTEP ko next hop bana kar advertise hota tha, isliye remote leaves aadhe flows us vPC peer par hash karte the jiske paas server nahi tha. Us peer ko unhe peer-link ke paar bhejna padta tha, jahan ek policy unhe drop kar deti thi. Fabric <code>advertise-pip</code> ke bina bana tha. <code>advertise-pip</code> aur <code>advertise virtual-rmac</code> enable karne ke baad orphan host ka route sahi leaf ke primary IP ke saath advertise hua aur loss ruk gaya.</p><p><b>Seekh:</b> VXLAN ke saath vPC ko single-attached hosts tak sahi forwarding ke liye shared anycast VTEP aur advertise-pip dono chahiye.</p></div>

<div class="iv"><p class="q">"VXLAN EVPN fabric mein servers ko dual-home kaise karoge, aur do data centers ko kaise jodoge?"</p><p>Strong answer: Nexus par anycast VTEP (loopback1 par shared secondary IP) plus advertise-pip aur advertise virtual-rmac ke saath vPC; ya standards-based ESI multihoming, jahan type-4 routes DF chunte hain aur type-1 routes bina peer-link ke aliasing aur mass withdraw dete hain. Do DCs ke liye border gateways wala EVPN Multi-Site prefer karo: alag fabrics aur AS numbers, BGWs site VIP ke saath routes re-originate karte hain, BUM control karte hain aur failures isolate karte hain, jabki stretched fabric ek failure domain hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VXLAN ke saath vPC anycast VTEP ki tarah shared secondary loopback1 IP use karta hai; advertise-pip aur advertise virtual-rmac jodo.</li>
<li>ESI multihoming standards-based hai: type 4 DF chunta hai, type 1 aliasing aur mass withdraw deta hai.</li>
<li>Multi-Site fabrics ko independent rakhta hai; BGWs site VIP ke saath routes re-originate karte hain.</li>
<li>Stretched fabrics simple hain par ek failure domain banate hain.</li>
<li>Jab Layer-2 extension nahi chahiye, to Layer-3-only DCI (VRF-lite ya L3VPN) sabse simple hai.</li>
</ul></div>
`}};export{e as default};