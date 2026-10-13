var e={id:`irb`,h:{en:`Integrated routing and bridging: asymmetric vs symmetric IRB`,hi:`Integrated routing and bridging: asymmetric vs symmetric IRB`},body:{en:`
<p>So far every packet stayed in one VLAN: bridging. Real applications live in several subnets: web servers in 172.16.10.0/24, databases in 172.16.20.0/24. Traffic between them must be <b>routed</b>. In the old world a pair of core routers did that, and every inter-subnet packet travelled up to the core and back down (hair-pinning). EVPN lets every leaf route locally. <b>IRB</b> (integrated routing and bridging) is the name for a device that both bridges inside a subnet and routes between subnets. The question is <i>where</i> the routing happens and <i>which VNI</i> carries the routed packet across the fabric. There are two answers: asymmetric and symmetric.</p>

<h3>An analogy: two ways to deliver a parcel between cities</h3>
<p>In the <b>asymmetric</b> model the sending post office does all the work: it sorts the parcel, writes the final street address, and puts it straight into the destination city's local delivery van, so the destination office only hands it over. That sending office therefore needs a delivery van for <i>every</i> city. In the <b>symmetric</b> model each office does half: the sending office puts the parcel on the inter-city truck (one shared truck per company), and the receiving office sorts it into its own local van. Each office needs only its own vans plus the shared truck.</p>

<h3>The topology used below</h3>
<p>Tenant A: SRV1 172.16.10.11 in VLAN 10 / VNI 10010 on LEAF1; SRV2 172.16.20.12 in VLAN 20 / VNI 10020 on LEAF2. Gateways 172.16.10.1 and 172.16.20.1 exist on the leaves (the anycast gateway, chapter 8). VRF TENANT-A has L3VNI 50001 (chapter 9).</p>

<h3>Asymmetric IRB: route at ingress, bridge at egress</h3>
<ol>
<li>SRV1 sends to its gateway MAC. LEAF1 routes from VLAN 10 into VLAN 20.</li>
<li>LEAF1 looks up SRV2's MAC in VLAN 20 (learned via type 2) and encapsulates the packet with <b>VNI 10020</b>, the destination's L2VNI.</li>
<li>LEAF2 decapsulates and simply bridges it to SRV2 in VLAN 20.</li>
</ol>
<p>Routing happens only at the ingress leaf, so the return path is routed at LEAF2 and bridged at LEAF1: the two directions are handled differently, hence "asymmetric". The catch: the ingress leaf must have <b>every VLAN, SVI and L2VNI of the tenant</b> configured, even VLANs it has no hosts in, and must hold ARP/MAC state for every host in them. That scales badly.</p>

<h3>Symmetric IRB: route at ingress and at egress</h3>
<ol>
<li>SRV1 sends to its gateway. LEAF1 routes in VRF TENANT-A and finds 172.16.20.12/32 via VTEP 10.254.0.2 (learned from LEAF2's type-2 MAC/IP route, label 50001).</li>
<li>LEAF1 encapsulates with <b>VNI 50001</b>, the tenant's <b>L3VNI</b>. The inner destination MAC is LEAF2's <b>Router MAC</b> (carried in the route as an extended community); the inner source MAC is LEAF1's Router MAC.</li>
<li>LEAF2 decapsulates, sees VNI 50001, looks up 172.16.20.12 in VRF TENANT-A and routes it into VLAN 20 to SRV2.</li>
</ol>
<p>Both leaves route, in both directions: "symmetric". Each leaf needs only the VLANs it really hosts plus <b>one L3VNI per VRF</b>. The TTL is decremented twice. This is the model Cisco NX-OS uses, and the one lab 3 builds.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Symmetric IRB packet walk">
<rect x="10" y="100" width="90" height="36" rx="6" fill="#fde68a"/><text x="55" y="123" text-anchor="middle" class="svg-ink" font-size="12">SRV1 VLAN 10</text>
<rect x="130" y="90" width="130" height="56" rx="6" fill="#bae6fd"/><text x="195" y="113" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="195" y="131" text-anchor="middle" class="svg-muted" font-size="12">route in TENANT-A</text>
<rect x="380" y="90" width="130" height="56" rx="6" fill="#bae6fd"/><text x="445" y="113" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text><text x="445" y="131" text-anchor="middle" class="svg-muted" font-size="12">route to VLAN 20</text>
<rect x="540" y="100" width="90" height="36" rx="6" fill="#fde68a"/><text x="585" y="123" text-anchor="middle" class="svg-ink" font-size="12">SRV2 VLAN 20</text>
<line x1="100" y1="118" x2="130" y2="118" stroke="#64748b" stroke-width="2"/><line x1="260" y1="118" x2="380" y2="118" stroke="#64748b" stroke-width="3"/><line x1="510" y1="118" x2="540" y2="118" stroke="#64748b" stroke-width="2"/>
<rect x="245" y="20" width="150" height="50" rx="6" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="12">VXLAN VNI 50001</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">inner dMAC = LEAF2 RMAC</text>
<text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="12">Asymmetric would use VNI 10020 and need VLAN 20 on LEAF1</text>
<text x="195" y="220" text-anchor="middle" class="svg-muted" font-size="12">routed hop 1</text><text x="445" y="220" text-anchor="middle" class="svg-muted" font-size="12">routed hop 2</text>
</svg><p class="cap">Symmetric IRB: routed on both leaves, carried between them in the tenant's L3VNI.</p></div>

<h3>Side by side</h3>
<table class="cmp"><tr><th></th><th>Asymmetric IRB</th><th>Symmetric IRB</th></tr>
<tr><td>Where routing happens</td><td>ingress leaf only</td><td>ingress and egress leaf</td></tr>
<tr><td>VNI on the wire</td><td>destination L2VNI</td><td>tenant L3VNI</td></tr>
<tr><td>VLANs/SVIs per leaf</td><td>all VLANs of the tenant everywhere</td><td>only local VLANs + one L3VNI per VRF</td></tr>
<tr><td>State per leaf</td><td>ARP/MAC for every host of the tenant</td><td>host routes; MACs only for local VLANs</td></tr>
<tr><td>Extra config</td><td>none beyond SVIs</td><td>VRF with L3VNI, L3VNI VLAN/SVI, Router MAC</td></tr>
<tr><td>TTL decrements</td><td>1</td><td>2</td></tr>
<tr><td>Type-5 routes and external prefixes</td><td>not naturally supported</td><td>yes, carried on the L3VNI</td></tr>
</table>

<h3>What you will see</h3>
<pre class="out">LEAF1# show ip route vrf TENANT-A 172.16.20.12
172.16.20.12/32, ubest/mbest: 1/0
<span class="hl">    *via 10.254.0.2%default, [200/0], 00:03:12, bgp-65001, internal, tag 65001, segid: 50001 tunnelid: 0xafe0002 encap: VXLAN</span></pre>
<p>Read it: the host route is learned by BGP (<code>bgp-65001, internal</code>, administrative distance 200), the next hop is LEAF2's VTEP in the <b>default</b> VRF (the underlay), and <b>segid 50001</b> is the L3VNI used for the encapsulation. A traceroute from SRV1 to SRV2 shows two routed hops, both answering from the anycast gateway addresses.</p>

<div class="eg"><p><b>Worked example.</b> A tenant has 60 VLANs spread over 20 leaves; on average each leaf hosts 6 of them. Asymmetric IRB needs 60 VLANs and 60 SVIs on every leaf: 1,200 SVIs fabric-wide. Symmetric IRB needs 6 VLANs/SVIs plus 1 L3VNI VLAN/SVI per leaf: 140 in total.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Configuring the L3VNI on only one leaf (one direction is routed into a VNI the other side does not know); expecting the L3VNI SVI to have an IP address (it has none, only <code>ip forward</code>); forgetting that symmetric IRB relies on the Router MAC in the routes, which appears only once the L3VNI is up.</p></div>
<div class="exam"><p><b>Exam trap.</b> In symmetric IRB the VNI in the VXLAN header of an inter-subnet packet is the <b>L3VNI of the VRF</b>, not the source or destination L2VNI. The inner destination MAC is the egress leaf's Router MAC.</p></div>

<div class="scn"><h4>Half the flows worked</h4><p>After adding a new leaf pair for a database cluster, web servers could open connections to the databases, but some replies were lost, and only for traffic that crossed subnets. Bridged traffic was fine. <code>show nve vni</code> on the new leaves listed the L2VNIs but no L3 VNI, because the provisioning script had skipped <code>member vni 50001 associate-vrf</code>. The old leaves routed toward the new ones using VNI 50001, which the new leaves silently dropped. Adding the L3VNI to the NVE interface fixed it; this is exactly the first fault in lab 5.</p><p><b>Lesson:</b> symmetric IRB needs the same L3VNI, up, on every leaf that hosts the tenant.</p></div>

<div class="iv"><p class="q">"Compare asymmetric and symmetric IRB. Which does Cisco NX-OS use and why?"</p><p>Strong answer: asymmetric routes only at ingress and sends the packet in the destination L2VNI, so every leaf must carry every VLAN, SVI and host of the tenant. Symmetric routes at ingress and egress and carries the packet in a per-VRF L3VNI, with the egress leaf's Router MAC as inner destination, so each leaf needs only its local VLANs plus the L3VNI. NX-OS uses symmetric IRB because it scales and supports type-5 prefixes and external routes. Mention the double TTL decrement and the show ip route output with segid.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IRB = bridging inside a subnet plus routing between subnets on the same leaf.</li>
<li>Asymmetric: route at ingress, bridge at egress, destination L2VNI on the wire, all VLANs everywhere.</li>
<li>Symmetric: route at both leaves, L3VNI on the wire, Router MAC as inner destination.</li>
<li>Symmetric IRB scales better and supports type-5 and external prefixes; NX-OS uses it.</li>
<li>Look for segid: L3VNI and encap: VXLAN in show ip route vrf.</li>
</ul></div>
`,hi:`
<p>Ab tak har packet ek hi VLAN mein raha: bridging. Real applications kai subnets mein hoti hain: web servers 172.16.10.0/24 mein, databases 172.16.20.0/24 mein. Inke beech traffic <b>route</b> hona chahiye. Purani duniya mein core routers ki ek jodi yeh karti thi, aur har inter-subnet packet core tak jaata aur wapas neeche aata (hair-pinning). EVPN har leaf ko locally route karne deta hai. <b>IRB</b> (integrated routing and bridging) us device ka naam hai jo subnet ke andar bridge bhi karta hai aur subnets ke beech route bhi. Sawaal yeh hai ki routing <i>kahan</i> hoti hai aur routed packet ko fabric ke paar <i>kaunsa VNI</i> le jaata hai. Do jawab hain: asymmetric aur symmetric.</p>

<h3>Ek analogy: shehron ke beech parcel pahunchane ke do tareeke</h3>
<p><b>Asymmetric</b> model mein bhejne wala post office saara kaam karta hai: parcel sort karta hai, final street address likhta hai, aur use seedha destination shehar ki local delivery van mein daal deta hai, to destination office sirf haath mein deta hai. Isliye bhejne wale office ko <i>har</i> shehar ki delivery van chahiye. <b>Symmetric</b> model mein har office aadha kaam karta hai: bhejne wala office parcel inter-city truck par daalta hai (company ka ek shared truck), aur receive karne wala office use apni local van mein sort karta hai. Har office ko sirf apni vans aur shared truck chahiye.</p>

<h3>Neeche use hone wali topology</h3>
<p>Tenant A: SRV1 172.16.10.11 VLAN 10 / VNI 10010 mein LEAF1 par; SRV2 172.16.20.12 VLAN 20 / VNI 10020 mein LEAF2 par. Gateways 172.16.10.1 aur 172.16.20.1 leaves par hain (anycast gateway, chapter 8). VRF TENANT-A ka L3VNI 50001 hai (chapter 9).</p>

<h3>Asymmetric IRB: ingress par route, egress par bridge</h3>
<ol>
<li>SRV1 apne gateway MAC ko bhejta hai. LEAF1 VLAN 10 se VLAN 20 mein route karta hai.</li>
<li>LEAF1 VLAN 20 mein SRV2 ka MAC dhoondhta hai (type 2 se seekha) aur packet ko <b>VNI 10020</b>, yaani destination ke L2VNI, ke saath encapsulate karta hai.</li>
<li>LEAF2 decapsulate karta hai aur bas VLAN 20 mein SRV2 tak bridge karta hai.</li>
</ol>
<p>Routing sirf ingress leaf par hoti hai, isliye return path LEAF2 par route aur LEAF1 par bridge hota hai: dono directions alag tarah handle hoti hain, isliye "asymmetric". Pech yeh hai: ingress leaf par tenant ka <b>har VLAN, SVI aur L2VNI</b> configured hona chahiye, un VLANs ka bhi jinmein uske paas koi host nahi, aur unke har host ki ARP/MAC state rakhni padti hai. Yeh bura scale karta hai.</p>

<h3>Symmetric IRB: ingress aur egress dono par route</h3>
<ol>
<li>SRV1 apne gateway ko bhejta hai. LEAF1 VRF TENANT-A mein route karta hai aur 172.16.20.12/32 ko VTEP 10.254.0.2 ke through paata hai (LEAF2 ke type-2 MAC/IP route se seekha, label 50001).</li>
<li>LEAF1 tenant ke <b>L3VNI</b>, yaani <b>VNI 50001</b>, ke saath encapsulate karta hai. Inner destination MAC LEAF2 ka <b>Router MAC</b> hai (route mein extended community ki tarah aata hai); inner source MAC LEAF1 ka Router MAC hai.</li>
<li>LEAF2 decapsulate karta hai, VNI 50001 dekhta hai, VRF TENANT-A mein 172.16.20.12 dhoondhta hai aur VLAN 20 mein SRV2 tak route karta hai.</li>
</ol>
<p>Dono leaves route karte hain, dono directions mein: "symmetric". Har leaf ko sirf woh VLANs chahiye jo woh sach mein host karta hai plus <b>har VRF ka ek L3VNI</b>. TTL do baar ghatta hai. Cisco NX-OS yahi model use karta hai, aur lab 3 yahi banata hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Symmetric IRB packet walk">
<rect x="10" y="100" width="90" height="36" rx="6" fill="#fde68a"/><text x="55" y="123" text-anchor="middle" class="svg-ink" font-size="12">SRV1 VLAN 10</text>
<rect x="130" y="90" width="130" height="56" rx="6" fill="#bae6fd"/><text x="195" y="113" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="195" y="131" text-anchor="middle" class="svg-muted" font-size="12">TENANT-A mein route</text>
<rect x="380" y="90" width="130" height="56" rx="6" fill="#bae6fd"/><text x="445" y="113" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text><text x="445" y="131" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20 tak route</text>
<rect x="540" y="100" width="90" height="36" rx="6" fill="#fde68a"/><text x="585" y="123" text-anchor="middle" class="svg-ink" font-size="12">SRV2 VLAN 20</text>
<line x1="100" y1="118" x2="130" y2="118" stroke="#64748b" stroke-width="2"/><line x1="260" y1="118" x2="380" y2="118" stroke="#64748b" stroke-width="3"/><line x1="510" y1="118" x2="540" y2="118" stroke="#64748b" stroke-width="2"/>
<rect x="245" y="20" width="150" height="50" rx="6" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="12">VXLAN VNI 50001</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">inner dMAC = LEAF2 RMAC</text>
<text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="12">Asymmetric VNI 10020 use karta aur LEAF1 par VLAN 20 chahiye hota</text>
<text x="195" y="220" text-anchor="middle" class="svg-muted" font-size="12">routed hop 1</text><text x="445" y="220" text-anchor="middle" class="svg-muted" font-size="12">routed hop 2</text>
</svg><p class="cap">Symmetric IRB: dono leaves par route, beech mein tenant ke L3VNI mein.</p></div>

<h3>Aamne-saamne</h3>
<table class="cmp"><tr><th></th><th>Asymmetric IRB</th><th>Symmetric IRB</th></tr>
<tr><td>Routing kahan</td><td>sirf ingress leaf</td><td>ingress aur egress leaf</td></tr>
<tr><td>Wire par VNI</td><td>destination L2VNI</td><td>tenant L3VNI</td></tr>
<tr><td>Har leaf par VLANs/SVIs</td><td>tenant ke saare VLANs har jagah</td><td>sirf local VLANs + har VRF ka ek L3VNI</td></tr>
<tr><td>Har leaf par state</td><td>tenant ke har host ka ARP/MAC</td><td>host routes; MACs sirf local VLANs ke</td></tr>
<tr><td>Extra config</td><td>SVIs ke alawa kuch nahi</td><td>L3VNI wala VRF, L3VNI VLAN/SVI, Router MAC</td></tr>
<tr><td>TTL decrements</td><td>1</td><td>2</td></tr>
<tr><td>Type-5 routes aur external prefixes</td><td>naturally support nahi</td><td>haan, L3VNI par</td></tr>
</table>

<h3>Aap kya dekhoge</h3>
<pre class="out">LEAF1# show ip route vrf TENANT-A 172.16.20.12
172.16.20.12/32, ubest/mbest: 1/0
<span class="hl">    *via 10.254.0.2%default, [200/0], 00:03:12, bgp-65001, internal, tag 65001, segid: 50001 tunnelid: 0xafe0002 encap: VXLAN</span></pre>
<p>Aise padho: host route BGP ne seekha (<code>bgp-65001, internal</code>, administrative distance 200), next hop <b>default</b> VRF (underlay) mein LEAF2 ka VTEP hai, aur <b>segid 50001</b> woh L3VNI hai jo encapsulation mein use hota hai. SRV1 se SRV2 tak traceroute do routed hops dikhata hai, dono anycast gateway addresses se jawab dete hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek tenant ke 60 VLANs 20 leaves par faile hain; average mein har leaf unmein se 6 host karta hai. Asymmetric IRB ko har leaf par 60 VLANs aur 60 SVIs chahiye: poore fabric mein 1,200 SVIs. Symmetric IRB ko har leaf par 6 VLANs/SVIs plus 1 L3VNI VLAN/SVI chahiye: kul 140.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> L3VNI sirf ek leaf par configure karna (ek direction aise VNI mein route hoti hai jo doosri side jaanti hi nahi); L3VNI SVI par IP address expect karna (koi nahi hota, sirf <code>ip forward</code>); bhoolna ki symmetric IRB routes ke Router MAC par depend karta hai, jo L3VNI up hone ke baad hi dikhta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Symmetric IRB mein inter-subnet packet ke VXLAN header ka VNI <b>VRF ka L3VNI</b> hota hai, source ya destination L2VNI nahi. Inner destination MAC egress leaf ka Router MAC hota hai.</p></div>

<div class="scn"><h4>Aadhe flows chal rahe the</h4><p>Database cluster ke liye nayi leaf pair jodne ke baad web servers databases tak connections khol paate the, lekin kuch replies kho jaate the, aur sirf us traffic ke jo subnets cross karta tha. Bridged traffic theek tha. Naye leaves par <code>show nve vni</code> L2VNIs dikhata tha par koi L3 VNI nahi, kyunki provisioning script ne <code>member vni 50001 associate-vrf</code> chhod diya tha. Purane leaves naye leaves ki taraf VNI 50001 se route karte the, jise naye leaves chup-chaap drop kar dete the. NVE interface mein L3VNI jodne se theek ho gaya; yeh bilkul lab 5 ka pehla fault hai.</p><p><b>Seekh:</b> symmetric IRB ko har us leaf par same L3VNI, up state mein, chahiye jo tenant host karta hai.</p></div>

<div class="iv"><p class="q">"Asymmetric aur symmetric IRB compare karo. Cisco NX-OS kaunsa use karta hai aur kyun?"</p><p>Strong answer: asymmetric sirf ingress par route karta hai aur packet destination L2VNI mein bhejta hai, isliye har leaf par tenant ka har VLAN, SVI aur host chahiye. Symmetric ingress aur egress dono par route karta hai aur packet har VRF ke L3VNI mein le jaata hai, egress leaf ke Router MAC ko inner destination bana kar, isliye har leaf ko sirf local VLANs plus L3VNI chahiye. NX-OS symmetric IRB use karta hai kyunki yeh scale karta hai aur type-5 prefixes aur external routes support karta hai. Double TTL decrement aur segid wala show ip route output mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IRB = same leaf par subnet ke andar bridging plus subnets ke beech routing.</li>
<li>Asymmetric: ingress par route, egress par bridge, wire par destination L2VNI, har jagah saare VLANs.</li>
<li>Symmetric: dono leaves par route, wire par L3VNI, Router MAC inner destination.</li>
<li>Symmetric IRB behtar scale karta hai aur type-5 aur external prefixes support karta hai; NX-OS yahi use karta hai.</li>
<li>show ip route vrf mein segid: L3VNI aur encap: VXLAN dekho.</li>
</ul></div>
`}};export{e as default};