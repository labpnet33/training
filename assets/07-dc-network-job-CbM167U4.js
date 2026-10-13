var e={id:`dc-network-job`,h:{en:`The job of the data center network`,hi:`Data center network ka kaam`},body:{en:`
<p>Picture a city's road system. Houses (servers) need streets to reach each other, a highway to the airport (the internet), a special armoured route to the bank vault (storage), and a separate service road that ambulances can use even when the main roads are jammed (the management network). The data center network is that road system. In this chapter you will see what it must deliver, why the old design struggled, and the shape of the modern answer that the rest of this track teaches in depth.</p>

<h3>What the DC network must do</h3>
<ul>
<li><b>Connect servers to each other</b> (east-west) with high bandwidth and low, predictable latency.</li>
<li><b>Connect servers to storage</b> reliably (iSCSI, NFS over Ethernet, or a separate FC SAN).</li>
<li><b>Connect the DC to the outside world</b> (north-south): internet, WAN to branches, other data centers and the public cloud.</li>
<li><b>Survive failures</b> of any link or switch without users noticing.</li>
<li><b>Scale</b> from a few racks to hundreds without redesign.</li>
<li><b>Separate</b> applications, environments and customers from each other, and allow workloads to move.</li>
</ul>

<h3>The old way: three-tier with spanning tree</h3>
<p>Campus networks, and older data centers, use three layers: <b>access</b> (servers plug in), <b>aggregation</b> or distribution (gateways, services) and <b>core</b> (fast transport between aggregation blocks). Each access switch has two uplinks for redundancy. But Layer-2 networks cannot tolerate loops, so <b>Spanning Tree Protocol (STP)</b> <b>blocks</b> one of the two uplinks.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Three-tier with a blocked uplink">
<rect x="250" y="10" width="140" height="36" rx="6" fill="#fed7aa"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Core</text>
<rect x="120" y="85" width="140" height="36" rx="6" fill="#ddd6fe"/><text x="190" y="108" text-anchor="middle" class="svg-ink" font-size="13">Aggregation 1</text>
<rect x="380" y="85" width="140" height="36" rx="6" fill="#ddd6fe"/><text x="450" y="108" text-anchor="middle" class="svg-ink" font-size="13">Aggregation 2</text>
<line x1="300" y1="46" x2="200" y2="85" stroke="#64748b" stroke-width="2"/><line x1="340" y1="46" x2="440" y2="85" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="165" width="140" height="36" rx="6" fill="#bae6fd"/><text x="320" y="188" text-anchor="middle" class="svg-ink" font-size="13">Access switch</text>
<line x1="190" y1="121" x2="290" y2="165" stroke="#64748b" stroke-width="3"/><text x="215" y="160" class="svg-muted" font-size="12">forwarding</text>
<line x1="450" y1="121" x2="350" y2="165" stroke="#64748b" stroke-width="3" stroke-dasharray="6 5"/><text x="400" y="160" class="svg-accent" font-size="12">STP blocked</text>
</svg><p class="cap">Two uplinks are bought and cabled, but spanning tree lets only one carry traffic.</p></div>

<pre class="out">ACCESS-01# show spanning-tree vlan 10
Interface        Role Sts Cost      Prio.Nbr Type
---------------- ---- --- --------- -------- --------------------------------
Eth1/49          Root FWD 2         128.49   P2p
<span class="hl">Eth1/50          Altn BLK 2         128.50   P2p</span></pre>
<p>Problems with this design for a modern DC:</p>
<ul>
<li><b>Half the uplink bandwidth sits idle</b> because of blocked ports.</li>
<li><b>Big Layer-2 domains</b> stretched for VM mobility mean a single loop or broadcast storm can take down many racks.</li>
<li><b>Unequal paths</b>: east-west traffic between two racks may climb to the core and back, adding hops and latency.</li>
<li><b>Scaling up</b> means buying bigger aggregation boxes, not simply adding more.</li>
</ul>
<p>Technologies such as vPC (which you will study) let both uplinks forward by making two switches look like one, and they are still widely used at the edge of the fabric. But the core design changed.</p>

<h3>The modern idea: spine-leaf (preview)</h3>
<p>In a <b>spine-leaf</b> (Clos) fabric there are just two layers. <b>Leaf</b> switches connect servers, storage and services. <b>Spine</b> switches connect only to leaves. Rules: every leaf connects to every spine; leaves never connect to other leaves for transport; spines never connect to each other.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Spine-leaf fabric">
<rect x="170" y="15" width="120" height="36" rx="6" fill="#ddd6fe"/><text x="230" y="38" text-anchor="middle" class="svg-ink" font-size="13">Spine 1</text>
<rect x="350" y="15" width="120" height="36" rx="6" fill="#ddd6fe"/><text x="410" y="38" text-anchor="middle" class="svg-ink" font-size="13">Spine 2</text>
<rect x="20" y="140" width="110" height="36" rx="6" fill="#bae6fd"/><text x="75" y="163" text-anchor="middle" class="svg-ink" font-size="12">Leaf 1</text>
<rect x="180" y="140" width="110" height="36" rx="6" fill="#bae6fd"/><text x="235" y="163" text-anchor="middle" class="svg-ink" font-size="12">Leaf 2</text>
<rect x="350" y="140" width="110" height="36" rx="6" fill="#bae6fd"/><text x="405" y="163" text-anchor="middle" class="svg-ink" font-size="12">Leaf 3</text>
<rect x="510" y="140" width="120" height="36" rx="6" fill="#fde68a"/><text x="570" y="163" text-anchor="middle" class="svg-ink" font-size="12">Border leaf</text>
<line x1="230" y1="51" x2="75" y2="140" stroke="#64748b" stroke-width="2"/><line x1="230" y1="51" x2="235" y2="140" stroke="#64748b" stroke-width="2"/><line x1="230" y1="51" x2="405" y2="140" stroke="#64748b" stroke-width="2"/><line x1="230" y1="51" x2="570" y2="140" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="51" x2="75" y2="140" stroke="#64748b" stroke-width="2"/><line x1="410" y1="51" x2="235" y2="140" stroke="#64748b" stroke-width="2"/><line x1="410" y1="51" x2="405" y2="140" stroke="#64748b" stroke-width="2"/><line x1="410" y1="51" x2="570" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="12">Any leaf to any leaf: leaf, spine, leaf</text>
</svg><p class="cap">Every leaf links to every spine, so all paths are equal and all links forward.</p></div>

<p>The links between leaves and spines are usually <b>routed</b> (Layer 3), so there is no spanning tree to block them. The routing protocol installs several equal-cost paths, and <b>ECMP</b> (equal-cost multipath) spreads flows across all of them:</p>
<pre class="out">LEAF-01# show ip route 10.0.0.13
10.0.0.13/32, ubest/mbest: 2/0
<span class="hl">    *via 10.1.1.0, Eth1/49, [110/41], 2d03h, ospf-UNDERLAY, intra
    *via 10.1.2.0, Eth1/50, [110/41], 2d03h, ospf-UNDERLAY, intra</span></pre>
<p>Benefits: every server is the same distance from every other (predictable latency), all links carry traffic, and you scale by adding: <b>more spines for more bandwidth, more leaves for more ports</b>.</p>

<div class="eg"><p><b>Worked example: oversubscription.</b> A leaf has 48 × 25G server ports and 6 × 100G uplinks. Downstream capacity = 48 × 25 = 1,200 Gbit/s. Upstream = 6 × 100 = 600 Gbit/s. Oversubscription = 1200 ÷ 600 = <b>2:1</b>. That is fine for most server racks, because servers rarely all send at full rate at once. For storage or AI clusters, designers aim for 1:1 (non-blocking).</p></div>

<h3>Border leaf, services and the internet edge</h3>
<p>Traffic leaves the fabric through a <b>border leaf</b>, which peers (usually with BGP or OSPF) with WAN routers, the internet edge and other data centers. <b>Firewalls</b> and <b>load balancers</b> often attach to a border or <b>service leaf</b>. A load balancer publishes a <b>virtual IP (VIP)</b> and spreads client connections across a pool of servers, checking their health. At the <b>internet edge</b>, edge routers talk BGP to one or more ISPs, and firewalls protect the DMZ where public-facing servers live.</p>

<h3>The out-of-band management network</h3>
<p>Every switch has a <b>mgmt0</b> port, every server a BMC port, every PDU a network port. These connect to a <b>separate, simple management network</b> with its own switches, plus <b>console servers</b> wired to each device's serial console. If a bad change breaks the production fabric, you can still log in through this path and fix it. On Nexus, mgmt0 lives in its own <b>management VRF</b>, separate from the data-plane routing table.</p>

<h3>Overlays and multitenancy (preview)</h3>
<p>Routed spine-leaf solved bandwidth, but VMs still need Layer-2 mobility, and different customers or environments need isolation. The answer is an <b>overlay</b>: <b>VXLAN</b> wraps Layer-2 frames inside UDP (port 4789) packets that cross the routed fabric between <b>VTEPs</b> on the leaves. VXLAN uses a 24-bit <b>VNI</b>, about 16 million segments, compared with only 4,094 usable VLANs. <b>BGP EVPN</b> acts as the control plane that tells every leaf where each MAC and IP lives. <b>Cisco ACI</b> builds on the same VXLAN fabric but is driven by policy from the <b>APIC</b> controller. <b>Multitenancy</b> uses VRFs and VNIs so tenant A and tenant B can even use the same IP addresses without seeing each other.</p>

<div class="warn"><p><b>Common mistakes.</b> Cabling leaf to leaf "for extra redundancy" in a spine-leaf fabric (apart from vPC peer links). Putting management interfaces in a production VLAN. Forgetting that a border leaf pair is a critical exit point and must itself be redundant.</p></div>
<div class="exam"><p><b>Exam tip.</b> Spine-leaf: every leaf to every spine, spines not interconnected, ECMP across routed links, scale spines for bandwidth and leaves for ports. VXLAN VNI = 24 bits (about 16M); VLAN ID = 12 bits. VXLAN uses UDP 4789.</p></div>

<div class="scn"><h4>The broadcast storm that crossed the whole DC</h4><p>An older data center had stretched VLAN 100 across 40 racks for VM mobility. A technician looped two ports on an unmanaged switch left in one rack. Spanning tree was misconfigured on a few access switches, the storm spread across every rack in VLAN 100, CPU on the aggregation switches hit 100%, and routing adjacencies dropped. Recovery took two hours through console cables because management was in-band. The redesign moved to a routed spine-leaf with VXLAN EVPN (mobility without a giant STP domain) and a proper out-of-band network.</p><p><b>Lesson:</b> small failure domains and a separate management path are design requirements, not luxuries.</p></div>

<div class="iv"><p class="q">"Why did data centers move from three-tier to spine-leaf?"</p><p>Strong answer: east-west traffic now dominates; three-tier with STP blocks half the uplinks, gives unequal paths and large Layer-2 failure domains. Spine-leaf gives every server the same hop count, uses all links with routed ECMP, and scales out by adding spines (bandwidth) or leaves (ports). Layer-2 mobility is then delivered by an overlay such as VXLAN EVPN or ACI. Mention oversubscription as the design number you calculate per leaf.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The DC network connects servers, storage and the outside world, survives failures, scales and separates tenants.</li>
<li>Three-tier with STP wastes blocked links and creates big failure domains.</li>
<li>Spine-leaf: every leaf to every spine, routed links, ECMP, predictable latency, scale out.</li>
<li>Border leaves connect the fabric to WAN, internet edge, firewalls and load balancers.</li>
<li>A separate out-of-band management network and console access let you fix the fabric when it is broken; overlays (VXLAN EVPN, ACI) add mobility and multitenancy.</li>
</ul></div>
`,hi:`
<p>Ek shehar ka road system socho. Gharon (servers) ko ek dusre tak pahunchne ke liye galiyan chahiye, airport (internet) tak highway, bank vault (storage) tak ek special armoured raasta, aur ek alag service road jise ambulance tab bhi use kar sake jab main roads jam hon (management network). Data center network wahi road system hai. Is chapter mein aap dekhoge ki ise kya deliver karna hai, purana design kyun struggle karta tha, aur modern jawab ka shape kya hai jo is track ka baaki hissa gehraai se sikhata hai.</p>

<h3>DC network ko kya karna hai</h3>
<ul>
<li><b>Servers ko aapas mein jodna</b> (east-west), high bandwidth aur kam, predictable latency ke saath.</li>
<li><b>Servers ko storage se jodna</b>, reliably (Ethernet par iSCSI, NFS, ya alag FC SAN).</li>
<li><b>DC ko bahar ki duniya se jodna</b> (north-south): internet, branches tak WAN, dusre data centers aur public cloud.</li>
<li>Kisi bhi link ya switch ke <b>failure ko jhelna</b> bina users ko pata chale.</li>
<li>Kuch racks se sainkdon tak bina redesign <b>scale</b> karna.</li>
<li>Applications, environments aur customers ko ek dusre se <b>alag</b> rakhna, aur workloads ko move hone dena.</li>
</ul>

<h3>Purana tareeka: spanning tree ke saath three-tier</h3>
<p>Campus networks, aur purane data centers, teen layers use karte hain: <b>access</b> (servers yahan lagte hain), <b>aggregation</b> ya distribution (gateways, services) aur <b>core</b> (aggregation blocks ke beech fast transport). Har access switch ke redundancy ke liye do uplinks hote hain. Lekin Layer-2 networks loops bardaasht nahi kar sakte, isliye <b>Spanning Tree Protocol (STP)</b> do mein se ek uplink ko <b>block</b> kar deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Blocked uplink ke saath three-tier">
<rect x="250" y="10" width="140" height="36" rx="6" fill="#fed7aa"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Core</text>
<rect x="120" y="85" width="140" height="36" rx="6" fill="#ddd6fe"/><text x="190" y="108" text-anchor="middle" class="svg-ink" font-size="13">Aggregation 1</text>
<rect x="380" y="85" width="140" height="36" rx="6" fill="#ddd6fe"/><text x="450" y="108" text-anchor="middle" class="svg-ink" font-size="13">Aggregation 2</text>
<line x1="300" y1="46" x2="200" y2="85" stroke="#64748b" stroke-width="2"/><line x1="340" y1="46" x2="440" y2="85" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="165" width="140" height="36" rx="6" fill="#bae6fd"/><text x="320" y="188" text-anchor="middle" class="svg-ink" font-size="13">Access switch</text>
<line x1="190" y1="121" x2="290" y2="165" stroke="#64748b" stroke-width="3"/><text x="215" y="160" class="svg-muted" font-size="12">forwarding</text>
<line x1="450" y1="121" x2="350" y2="165" stroke="#64748b" stroke-width="3" stroke-dasharray="6 5"/><text x="400" y="160" class="svg-accent" font-size="12">STP blocked</text>
</svg><p class="cap">Do uplinks khareede aur cable kiye jaate hain, lekin spanning tree sirf ek ko traffic le jaane deta hai.</p></div>

<pre class="out">ACCESS-01# show spanning-tree vlan 10
Interface        Role Sts Cost      Prio.Nbr Type
---------------- ---- --- --------- -------- --------------------------------
Eth1/49          Root FWD 2         128.49   P2p
<span class="hl">Eth1/50          Altn BLK 2         128.50   P2p</span></pre>
<p>Modern DC ke liye is design ki problems:</p>
<ul>
<li>Blocked ports ki wajah se <b>aadhi uplink bandwidth bekaar padi rehti hai</b>.</li>
<li>VM mobility ke liye stretch kiye gaye <b>bade Layer-2 domains</b> ka matlab hai ki ek loop ya broadcast storm kai racks ko gira sakta hai.</li>
<li><b>Unequal paths</b>: do racks ke beech east-west traffic core tak chadh kar wapas aa sakta hai, jisse hops aur latency badhte hain.</li>
<li><b>Scale up</b> karne ka matlab bade aggregation boxes khareedna hai, sirf aur jodna nahi.</li>
</ul>
<p>vPC jaisi technologies (jo aap padhoge) do switches ko ek jaisa dikha kar dono uplinks ko forward karne deti hain, aur fabric ke edge par aaj bhi khoob use hoti hain. Lekin core design badal gaya.</p>

<h3>Modern idea: spine-leaf (preview)</h3>
<p><b>Spine-leaf</b> (Clos) fabric mein sirf do layers hoti hain. <b>Leaf</b> switches servers, storage aur services ko jodte hain. <b>Spine</b> switches sirf leaves se judte hain. Rules: har leaf har spine se judta hai; leaves transport ke liye kabhi dusre leaves se nahi judte; spines kabhi aapas mein nahi judte.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Spine-leaf fabric">
<rect x="170" y="15" width="120" height="36" rx="6" fill="#ddd6fe"/><text x="230" y="38" text-anchor="middle" class="svg-ink" font-size="13">Spine 1</text>
<rect x="350" y="15" width="120" height="36" rx="6" fill="#ddd6fe"/><text x="410" y="38" text-anchor="middle" class="svg-ink" font-size="13">Spine 2</text>
<rect x="20" y="140" width="110" height="36" rx="6" fill="#bae6fd"/><text x="75" y="163" text-anchor="middle" class="svg-ink" font-size="12">Leaf 1</text>
<rect x="180" y="140" width="110" height="36" rx="6" fill="#bae6fd"/><text x="235" y="163" text-anchor="middle" class="svg-ink" font-size="12">Leaf 2</text>
<rect x="350" y="140" width="110" height="36" rx="6" fill="#bae6fd"/><text x="405" y="163" text-anchor="middle" class="svg-ink" font-size="12">Leaf 3</text>
<rect x="510" y="140" width="120" height="36" rx="6" fill="#fde68a"/><text x="570" y="163" text-anchor="middle" class="svg-ink" font-size="12">Border leaf</text>
<line x1="230" y1="51" x2="75" y2="140" stroke="#64748b" stroke-width="2"/><line x1="230" y1="51" x2="235" y2="140" stroke="#64748b" stroke-width="2"/><line x1="230" y1="51" x2="405" y2="140" stroke="#64748b" stroke-width="2"/><line x1="230" y1="51" x2="570" y2="140" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="51" x2="75" y2="140" stroke="#64748b" stroke-width="2"/><line x1="410" y1="51" x2="235" y2="140" stroke="#64748b" stroke-width="2"/><line x1="410" y1="51" x2="405" y2="140" stroke="#64748b" stroke-width="2"/><line x1="410" y1="51" x2="570" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="12">Koi bhi leaf se koi bhi leaf: leaf, spine, leaf</text>
</svg><p class="cap">Har leaf har spine se juda hai, isliye saare paths barabar hain aur saare links forward karte hain.</p></div>

<p>Leaves aur spines ke beech ke links aam taur par <b>routed</b> (Layer 3) hote hain, isliye unhe block karne ke liye koi spanning tree nahi hota. Routing protocol kai equal-cost paths install karta hai, aur <b>ECMP</b> (equal-cost multipath) flows ko un sab par baant deta hai:</p>
<pre class="out">LEAF-01# show ip route 10.0.0.13
10.0.0.13/32, ubest/mbest: 2/0
<span class="hl">    *via 10.1.1.0, Eth1/49, [110/41], 2d03h, ospf-UNDERLAY, intra
    *via 10.1.2.0, Eth1/50, [110/41], 2d03h, ospf-UNDERLAY, intra</span></pre>
<p>Fayde: har server har dusre server se same doori par hai (predictable latency), saare links traffic le jaate hain, aur aap jod kar scale karte ho: <b>zyada bandwidth ke liye zyada spines, zyada ports ke liye zyada leaves</b>.</p>

<div class="eg"><p><b>Worked example: oversubscription.</b> Ek leaf mein 48 × 25G server ports aur 6 × 100G uplinks hain. Downstream capacity = 48 × 25 = 1,200 Gbit/s. Upstream = 6 × 100 = 600 Gbit/s. Oversubscription = 1200 ÷ 600 = <b>2:1</b>. Zyada tar server racks ke liye yeh theek hai, kyunki saare servers shayad hi kabhi ek saath full rate par bhejte hain. Storage ya AI clusters ke liye designers 1:1 (non-blocking) target karte hain.</p></div>

<h3>Border leaf, services aur internet edge</h3>
<p>Traffic fabric se <b>border leaf</b> ke through bahar jaata hai, jo WAN routers, internet edge aur dusre data centers ke saath peer karta hai (aam taur par BGP ya OSPF se). <b>Firewalls</b> aur <b>load balancers</b> aksar border ya <b>service leaf</b> se jude hote hain. Load balancer ek <b>virtual IP (VIP)</b> publish karta hai aur client connections ko servers ke pool mein baant-ta hai, unki health check karte hue. <b>Internet edge</b> par edge routers ek ya zyada ISPs se BGP bolte hain, aur firewalls us DMZ ko protect karte hain jahan public-facing servers rehte hain.</p>

<h3>Out-of-band management network</h3>
<p>Har switch ka ek <b>mgmt0</b> port hota hai, har server ka BMC port, har PDU ka network port. Yeh sab ek <b>alag, simple management network</b> se judte hain jiske apne switches hote hain, plus <b>console servers</b> jo har device ke serial console se wired hote hain. Agar koi galat change production fabric tod de, to bhi aap is raaste se login karke use theek kar sakte ho. Nexus par mgmt0 apne alag <b>management VRF</b> mein rehta hai, data-plane routing table se alag.</p>

<h3>Overlays aur multitenancy (preview)</h3>
<p>Routed spine-leaf ne bandwidth solve kar di, lekin VMs ko abhi bhi Layer-2 mobility chahiye, aur alag customers ya environments ko isolation chahiye. Jawab hai <b>overlay</b>: <b>VXLAN</b> Layer-2 frames ko UDP (port 4789) packets mein lapet-ta hai jo leaves par <b>VTEPs</b> ke beech routed fabric paar karte hain. VXLAN 24-bit <b>VNI</b> use karta hai, lagbhag 1.6 crore segments, jabki VLANs sirf 4,094 usable hote hain. <b>BGP EVPN</b> control plane ka kaam karta hai jo har leaf ko batata hai ki har MAC aur IP kahan hai. <b>Cisco ACI</b> usi VXLAN fabric par banta hai lekin <b>APIC</b> controller se policy ke through chalta hai. <b>Multitenancy</b> VRFs aur VNIs use karti hai taaki tenant A aur tenant B ek hi IP addresses use karke bhi ek dusre ko na dekhein.</p>

<div class="warn"><p><b>Common galtiyan.</b> Spine-leaf fabric mein "extra redundancy ke liye" leaf ko leaf se cable karna (vPC peer links ke alawa). Management interfaces ko production VLAN mein daalna. Yeh bhool jaana ki border leaf pair ek critical exit point hai aur khud redundant hona chahiye.</p></div>
<div class="exam"><p><b>Exam tip.</b> Spine-leaf: har leaf har spine se, spines aapas mein nahi jude, routed links par ECMP, bandwidth ke liye spines aur ports ke liye leaves scale karo. VXLAN VNI = 24 bits (lagbhag 16M); VLAN ID = 12 bits. VXLAN UDP 4789 use karta hai.</p></div>

<div class="scn"><h4>Broadcast storm jo poore DC mein fail gaya</h4><p>Ek purane data center ne VM mobility ke liye VLAN 100 ko 40 racks tak stretch kiya tha. Ek technician ne ek rack mein chhode gaye unmanaged switch par do ports loop kar diye. Kuch access switches par spanning tree galat configured tha, storm VLAN 100 ke har rack mein fail gaya, aggregation switches ka CPU 100% par pahunch gaya, aur routing adjacencies gir gayi. Recovery mein console cables ke through do ghante lage kyunki management in-band tha. Redesign mein VXLAN EVPN ke saath routed spine-leaf (bina bade STP domain ke mobility) aur ek proper out-of-band network aaya.</p><p><b>Seekh:</b> chhote failure domains aur alag management path design requirements hain, luxury nahi.</p></div>

<div class="iv"><p class="q">"Data centers three-tier se spine-leaf par kyun shift hue?"</p><p>Strong answer: ab east-west traffic dominate karta hai; STP wala three-tier aadhe uplinks block karta hai, unequal paths deta hai aur bade Layer-2 failure domains banata hai. Spine-leaf har server ko same hop count deta hai, routed ECMP se saare links use karta hai, aur spines (bandwidth) ya leaves (ports) jod kar scale out karta hai. Phir Layer-2 mobility VXLAN EVPN ya ACI jaisa overlay deta hai. Oversubscription ka zikr karo, woh design number jo aap har leaf ke liye calculate karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DC network servers, storage aur bahar ki duniya ko jodta hai, failures jhelta hai, scale karta hai aur tenants ko alag rakhta hai.</li>
<li>STP wala three-tier blocked links waste karta hai aur bade failure domains banata hai.</li>
<li>Spine-leaf: har leaf har spine se, routed links, ECMP, predictable latency, scale out.</li>
<li>Border leaves fabric ko WAN, internet edge, firewalls aur load balancers se jodte hain.</li>
<li>Alag out-of-band management network aur console access se fabric toot-ne par bhi aap use theek kar sakte ho; overlays (VXLAN EVPN, ACI) mobility aur multitenancy jodte hain.</li>
</ul></div>
`}};export{e as default};