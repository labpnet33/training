var e={id:`goals`,h:{en:`What you will learn, and where VXLAN fits`,hi:`Aap kya seekhoge, aur VXLAN kahan fit hota hai`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to stretch a Layer 2 segment (one VLAN, one subnet) across a fully routed spine-leaf fabric using <b>VXLAN on Cisco Nexus</b>. You will map a VLAN to a <b>VNI</b>, build the <b>NVE interface</b> on a loopback, choose how broadcast traffic is replicated, prove the result with <code>show nve peers</code>, <code>show nve vni</code> and <code>show mac address-table</code>, and fix the classic faults: a VNI mismatch, a wrong peer, a loopback that is not advertised, and an MTU that is too small. You will also understand exactly why flood-and-learn VXLAN does not scale and why the next module, <b>BGP EVPN</b>, exists.</p>

<h3>Prerequisites</h3>
<ul>
<li>VLANs, access ports, MAC learning and ARP: how a switch learns a source MAC and floods an unknown destination.</li>
<li>IP routing basics: loopbacks, /31 point-to-point links, a routing table.</li>
<li>The previous module, <b>the underlay</b>: OSPF area 0 between leaves and spines, ECMP, and one loopback per leaf that every other leaf can reach.</li>
</ul>
<p>If you completed the underlay lab, you already have everything the VXLAN labs start from: SPINE1 and SPINE2, LEAF1 and LEAF2, routed /31 uplinks with <code>mtu 9216</code>, <b>loopback0</b> as the router-id (10.255.0.1 and 10.255.0.2) and <b>loopback1</b> as the future VTEP address (10.254.0.1 on LEAF1, 10.254.0.2 on LEAF2), all advertised in OSPF.</p>

<h3>An analogy: a courier service between two office buildings</h3>
<p>Imagine two office buildings of the same company in different parts of the city. Inside each building, people pass paper notes to each other by hand along the corridors. That is Layer 2: simple and fast, but it only works inside one building. Between the buildings there is a city road network with traffic lights and addresses. That is Layer 3, the routed fabric.</p>
<p>Now the company wants the sales team, sitting in both buildings, to feel like one floor. The solution is a courier desk at each reception. When someone hands a note addressed to a colleague in the other building, the courier desk puts the note, untouched, inside an envelope, writes the other building's street address on it and sends it by road. The other reception opens the envelope and hands the original note to the colleague. Nobody on the sales team knows the note travelled by road. The courier desk is the <b>VTEP</b>, the envelope is the <b>VXLAN encapsulation</b>, the street addresses are the <b>loopback IPs</b>, and the label "sales team" on the envelope is the <b>VNI</b>.</p>

<h3>Where VXLAN fits: underlay and overlay</h3>
<p>Modern data center networking has two layers that you must always keep separate in your head:</p>
<ul>
<li><b>Underlay.</b> The physical, routed fabric. Its only job is to deliver IP packets between leaf loopbacks, quickly and over every equal-cost path. It knows nothing about tenants, VLANs or virtual machines.</li>
<li><b>Overlay.</b> Virtual networks built on top of the underlay. Servers see ordinary VLANs and subnets. The leaves hide those frames inside UDP/IP packets addressed from one loopback to another, so the underlay just sees routed traffic.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Underlay and overlay">
<rect x="10" y="10" width="620" height="40" rx="8" fill="#fde68a"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">Overlay: VLAN 10 = VNI 10010 (one L2 segment)</text>
<rect x="60" y="70" width="150" height="40" rx="8" fill="#bae6fd"/><text x="135" y="95" text-anchor="middle" class="svg-ink" font-size="13">LEAF1 VTEP 10.254.0.1</text>
<rect x="430" y="70" width="150" height="40" rx="8" fill="#bae6fd"/><text x="505" y="95" text-anchor="middle" class="svg-ink" font-size="13">LEAF2 VTEP 10.254.0.2</text>
<line x1="210" y1="90" x2="430" y2="90" stroke="#64748b" stroke-width="3" stroke-dasharray="8 6"/><text x="320" y="82" text-anchor="middle" class="svg-accent" font-size="12">VXLAN tunnel, UDP 4789</text>
<rect x="170" y="140" width="120" height="36" rx="6" fill="#ddd6fe"/><text x="230" y="163" text-anchor="middle" class="svg-ink" font-size="13">SPINE1</text>
<rect x="350" y="140" width="120" height="36" rx="6" fill="#ddd6fe"/><text x="410" y="163" text-anchor="middle" class="svg-ink" font-size="13">SPINE2</text>
<line x1="135" y1="110" x2="230" y2="140" stroke="#64748b" stroke-width="2"/><line x1="135" y1="110" x2="410" y2="140" stroke="#64748b" stroke-width="2"/>
<line x1="505" y1="110" x2="230" y2="140" stroke="#64748b" stroke-width="2"/><line x1="505" y1="110" x2="410" y2="140" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="200" width="620" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="225" text-anchor="middle" class="svg-ink" font-size="14">Underlay: OSPF, routed /31 links, ECMP, loopbacks, MTU 9216</text>
</svg><p class="cap">The underlay moves IP packets between loopbacks. VXLAN builds the Layer 2 overlay on top of it.</p></div>

<h3>The module map</h3>
<table class="cmp"><tr><th>Chapter</th><th>You will be able to</th></tr>
<tr><td>2. Why overlays</td><td>Explain the VLAN limit, STP pain, multitenancy and VM mobility problems</td></tr>
<tr><td>3. Encapsulation</td><td>Draw the VXLAN packet byte by byte and compute the 50-byte overhead</td></tr>
<tr><td>4. VTEP and NVE</td><td>Explain VTEPs, the nve1 interface, vn-segment mapping and gateway roles</td></tr>
<tr><td>5. Flood and learn</td><td>Walk an ARP exchange between racks and read remote MACs on nve1</td></tr>
<tr><td>6. BUM traffic</td><td>Compare multicast underlay with ingress replication</td></tr>
<tr><td>7–8. Config and verify</td><td>Build the lab from scratch and prove it works</td></tr>
<tr><td>9–10. Limits and troubleshooting</td><td>Explain why EVPN is needed and fix broken tunnels</td></tr>
<tr><td>11. Summary</td><td>Pass the exam questions on VXLAN data plane</td></tr>
</table>

<div class="eg"><p><b>Worked example: what the lab asks you to do.</b> SRV1 (172.16.10.11/24) sits on LEAF1 port Ethernet1/5 in VLAN 10. SRV2 (172.16.10.12/24) sits on LEAF2 port Ethernet1/5, also in VLAN 10. Both leaves have VLAN 10, but it is local to each leaf: the uplinks are routed, so no VLAN crosses them. SRV1 pings SRV2 and fails. After you map VLAN 10 to VNI 10010 on both leaves and build nve1 with static ingress replication (LEAF1 lists peer 10.254.0.2, LEAF2 lists 10.254.0.1), the ping succeeds, and <code>show nve peers</code> on LEAF1 lists 10.254.0.2 as Up.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Trying to "fix" the stretched VLAN by trunking VLAN 10 over the spine links. That rebuilds the old Layer 2 network with spanning tree, blocked links and one big failure domain, which is exactly what the routed fabric was built to remove. In a VXLAN fabric the uplinks stay routed; only the overlay carries VLAN 10.</p></div>

<div class="exam"><p><b>Exam trap.</b> VXLAN is a <b>data plane</b> encapsulation. On its own it has no control plane. "Flood and learn" means remote MACs are learned from received traffic. BGP EVPN is a separate <b>control plane</b> that can be added on top. Questions often try to confuse the two.</p></div>

<div class="scn"><h4>The migration that nearly re-created spanning tree</h4><p>A hosting company moved from a three-tier network to a new spine-leaf fabric. Two old application servers that talk to each other with Layer 2 heartbeats had to live in different racks, on different leaves, but in the same subnet. The first proposal was to trunk the VLAN over the spine uplinks. The senior engineer rejected it: that would put spanning tree back into the fabric and block half the uplinks. Instead the team mapped the VLAN to a VNI on the two leaves and built nve1 on each leaf's loopback. The underlay stayed fully routed with ECMP, and the servers saw one flat VLAN.</p><p><b>Lesson:</b> keep the underlay routed and simple; stretch Layer 2 only in the overlay.</p></div>

<div class="iv"><p class="q">"What is the difference between the underlay and the overlay in a VXLAN fabric?"</p><p>Strong answer: the underlay is the routed IP network between leaves and spines (OSPF, IS-IS or eBGP, ECMP, loopbacks, jumbo MTU); its job is only to reach every VTEP loopback. The overlay is the set of virtual Layer 2 and Layer 3 networks that tenants see, carried inside VXLAN (UDP 4789) between VTEPs. Mention that the underlay never learns tenant MACs, and that overlay problems are usually debugged by first proving loopback-to-loopback reachability in the underlay.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VXLAN stretches a Layer 2 segment across a routed fabric without trunking VLANs over the uplinks.</li>
<li>The underlay (routed, ECMP, loopbacks) must work before the overlay can work.</li>
<li>The VTEP on each leaf wraps frames in UDP/IP packets addressed loopback to loopback.</li>
<li>This module covers flood-and-learn VXLAN with static ingress replication, exactly as the labs build it.</li>
<li>BGP EVPN, the next module, adds a control plane on top of the same data plane.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap <b>Cisco Nexus par VXLAN</b> use karke ek Layer 2 segment (ek VLAN, ek subnet) ko poore routed spine-leaf fabric ke paar failaa paoge. Aap VLAN ko <b>VNI</b> se map karoge, loopback par <b>NVE interface</b> banaoge, broadcast traffic kaise replicate ho yeh choose karoge, result ko <code>show nve peers</code>, <code>show nve vni</code> aur <code>show mac address-table</code> se prove karoge, aur classic faults theek karoge: VNI mismatch, galat peer, advertise na hua loopback, aur bahut chhota MTU. Aap yeh bhi exactly samjhoge ki flood-and-learn VXLAN scale kyun nahi karta aur agla module, <b>BGP EVPN</b>, kyun exist karta hai.</p>

<h3>Prerequisites</h3>
<ul>
<li>VLANs, access ports, MAC learning aur ARP: switch source MAC kaise seekhta hai aur unknown destination ko kaise flood karta hai.</li>
<li>IP routing basics: loopbacks, /31 point-to-point links, routing table.</li>
<li>Pichhla module, <b>underlay</b>: leaves aur spines ke beech OSPF area 0, ECMP, aur har leaf par ek loopback jise baaki har leaf reach kar sake.</li>
</ul>
<p>Agar aapne underlay lab complete kiya hai, to VXLAN labs jahan se shuru hote hain woh sab aapke paas pehle se hai: SPINE1 aur SPINE2, LEAF1 aur LEAF2, <code>mtu 9216</code> wale routed /31 uplinks, router-id ke roop mein <b>loopback0</b> (10.255.0.1 aur 10.255.0.2) aur future VTEP address ke roop mein <b>loopback1</b> (LEAF1 par 10.254.0.1, LEAF2 par 10.254.0.2), sab OSPF mein advertised.</p>

<h3>Ek analogy: do office buildings ke beech courier service</h3>
<p>Socho ek hi company ki do office buildings shehar ke alag hisson mein hain. Har building ke andar log corridors mein haath se ek doosre ko paper notes dete hain. Yeh Layer 2 hai: simple aur fast, lekin sirf ek building ke andar kaam karta hai. Buildings ke beech shehar ka road network hai jismein traffic lights aur addresses hain. Yeh Layer 3 hai, routed fabric.</p>
<p>Ab company chahti hai ki sales team, jo dono buildings mein baithi hai, ek hi floor jaisa feel kare. Solution hai har reception par ek courier desk. Jab koi doosri building ke colleague ke naam note deta hai, courier desk us note ko bina chhede ek envelope mein daalta hai, us par doosri building ka street address likhta hai aur road se bhej deta hai. Doosri reception envelope kholti hai aur original note colleague ko de deti hai. Sales team mein kisi ko pata nahi chalta ki note road se aaya. Courier desk <b>VTEP</b> hai, envelope <b>VXLAN encapsulation</b> hai, street addresses <b>loopback IPs</b> hain, aur envelope par "sales team" wala label <b>VNI</b> hai.</p>

<h3>VXLAN kahan fit hota hai: underlay aur overlay</h3>
<p>Modern data center networking mein do layers hoti hain jinhe aapko dimaag mein hamesha alag rakhna hai:</p>
<ul>
<li><b>Underlay.</b> Physical, routed fabric. Iska sirf ek kaam hai: leaf loopbacks ke beech IP packets ko jaldi aur har equal-cost path par deliver karna. Ise tenants, VLANs ya virtual machines ke baare mein kuch nahi pata.</li>
<li><b>Overlay.</b> Underlay ke upar bane virtual networks. Servers ko normal VLANs aur subnets dikhte hain. Leaves un frames ko UDP/IP packets ke andar chhupa dete hain jo ek loopback se doosre loopback ko addressed hote hain, isliye underlay ko sirf routed traffic dikhta hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Underlay aur overlay">
<rect x="10" y="10" width="620" height="40" rx="8" fill="#fde68a"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">Overlay: VLAN 10 = VNI 10010 (ek L2 segment)</text>
<rect x="60" y="70" width="150" height="40" rx="8" fill="#bae6fd"/><text x="135" y="95" text-anchor="middle" class="svg-ink" font-size="13">LEAF1 VTEP 10.254.0.1</text>
<rect x="430" y="70" width="150" height="40" rx="8" fill="#bae6fd"/><text x="505" y="95" text-anchor="middle" class="svg-ink" font-size="13">LEAF2 VTEP 10.254.0.2</text>
<line x1="210" y1="90" x2="430" y2="90" stroke="#64748b" stroke-width="3" stroke-dasharray="8 6"/><text x="320" y="82" text-anchor="middle" class="svg-accent" font-size="12">VXLAN tunnel, UDP 4789</text>
<rect x="170" y="140" width="120" height="36" rx="6" fill="#ddd6fe"/><text x="230" y="163" text-anchor="middle" class="svg-ink" font-size="13">SPINE1</text>
<rect x="350" y="140" width="120" height="36" rx="6" fill="#ddd6fe"/><text x="410" y="163" text-anchor="middle" class="svg-ink" font-size="13">SPINE2</text>
<line x1="135" y1="110" x2="230" y2="140" stroke="#64748b" stroke-width="2"/><line x1="135" y1="110" x2="410" y2="140" stroke="#64748b" stroke-width="2"/>
<line x1="505" y1="110" x2="230" y2="140" stroke="#64748b" stroke-width="2"/><line x1="505" y1="110" x2="410" y2="140" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="200" width="620" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="225" text-anchor="middle" class="svg-ink" font-size="14">Underlay: OSPF, routed /31 links, ECMP, loopbacks, MTU 9216</text>
</svg><p class="cap">Underlay loopbacks ke beech IP packets le jaata hai. VXLAN uske upar Layer 2 overlay banata hai.</p></div>

<h3>Module ka map</h3>
<table class="cmp"><tr><th>Chapter</th><th>Aap kya kar paoge</th></tr>
<tr><td>2. Overlays kyun</td><td>VLAN limit, STP ki takleef, multitenancy aur VM mobility ki problems samjha paoge</td></tr>
<tr><td>3. Encapsulation</td><td>VXLAN packet byte by byte draw karoge aur 50-byte overhead calculate karoge</td></tr>
<tr><td>4. VTEP aur NVE</td><td>VTEPs, nve1 interface, vn-segment mapping aur gateway roles samjhaoge</td></tr>
<tr><td>5. Flood and learn</td><td>Racks ke beech ARP exchange walk karoge aur nve1 par remote MACs padhoge</td></tr>
<tr><td>6. BUM traffic</td><td>Multicast underlay aur ingress replication compare karoge</td></tr>
<tr><td>7–8. Config aur verify</td><td>Lab zero se banaoge aur prove karoge ki kaam karta hai</td></tr>
<tr><td>9–10. Limits aur troubleshooting</td><td>Samjhaoge ki EVPN kyun chahiye aur toote tunnels theek karoge</td></tr>
<tr><td>11. Summary</td><td>VXLAN data plane ke exam questions pass karoge</td></tr>
</table>

<div class="eg"><p><b>Worked example: lab aapse kya karwata hai.</b> SRV1 (172.16.10.11/24) LEAF1 ke port Ethernet1/5 par VLAN 10 mein hai. SRV2 (172.16.10.12/24) LEAF2 ke port Ethernet1/5 par hai, woh bhi VLAN 10 mein. Dono leaves par VLAN 10 hai, lekin har leaf par sirf local hai: uplinks routed hain, isliye koi VLAN unke paar nahi jaata. SRV1, SRV2 ko ping karta hai aur fail hota hai. Jab aap dono leaves par VLAN 10 ko VNI 10010 se map karte ho aur static ingress replication ke saath nve1 banate ho (LEAF1 peer 10.254.0.2 list karta hai, LEAF2 10.254.0.1), ping succeed hoti hai, aur LEAF1 par <code>show nve peers</code> 10.254.0.2 ko Up dikhata hai.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> Stretched VLAN ko "theek" karne ke liye VLAN 10 ko spine links par trunk karna. Isse spanning tree, blocked links aur ek bada failure domain wala purana Layer 2 network wapas ban jaata hai, jise hatane ke liye hi routed fabric banaya gaya tha. VXLAN fabric mein uplinks routed rehte hain; sirf overlay VLAN 10 le jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> VXLAN ek <b>data plane</b> encapsulation hai. Akele iska koi control plane nahi hai. "Flood and learn" ka matlab hai remote MACs receive hue traffic se seekhe jaate hain. BGP EVPN ek alag <b>control plane</b> hai jo upar add kiya ja sakta hai. Questions aksar in dono ko confuse karne ki koshish karte hain.</p></div>

<div class="scn"><h4>Woh migration jo lagbhag spanning tree wapas le aayi</h4><p>Ek hosting company three-tier network se naye spine-leaf fabric par shift hui. Do purane application servers jo Layer 2 heartbeats se baat karte hain, alag racks mein, alag leaves par, lekin same subnet mein rehne the. Pehla proposal tha VLAN ko spine uplinks par trunk karna. Senior engineer ne mana kar diya: isse fabric mein spanning tree wapas aa jaata aur aadhe uplinks block ho jaate. Iske bajaye team ne dono leaves par VLAN ko ek VNI se map kiya aur har leaf ke loopback par nve1 banaya. Underlay ECMP ke saath poora routed raha, aur servers ko ek flat VLAN dikha.</p><p><b>Seekh:</b> underlay ko routed aur simple rakho; Layer 2 sirf overlay mein stretch karo.</p></div>

<div class="iv"><p class="q">"VXLAN fabric mein underlay aur overlay mein kya farak hai?"</p><p>Strong answer: underlay leaves aur spines ke beech routed IP network hai (OSPF, IS-IS ya eBGP, ECMP, loopbacks, jumbo MTU); iska kaam sirf har VTEP loopback tak pahunchna hai. Overlay woh virtual Layer 2 aur Layer 3 networks hain jo tenants ko dikhte hain, VTEPs ke beech VXLAN (UDP 4789) ke andar carry hote hain. Bataao ki underlay kabhi tenant MACs nahi seekhta, aur overlay problems ko debug karte waqt pehle underlay mein loopback-to-loopback reachability prove karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VXLAN uplinks par VLANs trunk kiye bina routed fabric ke paar Layer 2 segment stretch karta hai.</li>
<li>Overlay kaam kare usse pehle underlay (routed, ECMP, loopbacks) ka kaam karna zaroori hai.</li>
<li>Har leaf ka VTEP frames ko loopback-to-loopback addressed UDP/IP packets mein wrap karta hai.</li>
<li>Yeh module static ingress replication wala flood-and-learn VXLAN cover karta hai, bilkul waise jaise labs banate hain.</li>
<li>BGP EVPN, agla module, isi data plane ke upar control plane add karta hai.</li>
</ul></div>
`}};export{e as default};