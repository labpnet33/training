var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`

<p>A pilot does not memorise every dial; they carry a checklist and know the failure stories. This final chapter pulls the course together as a checklist you can use on the exam and in a real design meeting. Each earlier chapter began with a customer; here the customers are the evidence for each rule.</p>

<h3>Decision map</h3>
<div class="dia"><svg viewBox="0 0 640 262" role="img" aria-label="Decision map from requirement to extension model">
<line x1="320" y1="28" x2="85" y2="95" stroke="#64748b" stroke-width="1.6"/>
<line x1="320" y1="28" x2="245" y2="95" stroke="#64748b" stroke-width="1.6"/>
<line x1="320" y1="28" x2="405" y2="95" stroke="#64748b" stroke-width="1.6"/>
<line x1="320" y1="28" x2="565" y2="95" stroke="#64748b" stroke-width="1.6"/>
<line x1="85" y1="95" x2="85" y2="160" stroke="#64748b" stroke-width="1.6"/>
<line x1="245" y1="95" x2="245" y2="160" stroke="#64748b" stroke-width="1.6"/>
<line x1="405" y1="95" x2="405" y2="160" stroke="#64748b" stroke-width="1.6"/>
<line x1="565" y1="95" x2="565" y2="160" stroke="#64748b" stroke-width="1.6"/>
<rect x="225" y="11" width="190" height="34" rx="7" fill="#fde68a" stroke="#64748b"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="12">Customer requirements</text>
<rect x="25" y="78" width="120" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="31" y1="107" x2="139" y2="107" stroke="#0284c7" stroke-width="2"/><text x="85" y="99" text-anchor="middle" class="svg-ink" font-size="12">One hall</text>
<rect x="185" y="78" width="120" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="191" y1="107" x2="299" y2="107" stroke="#0284c7" stroke-width="2"/><text x="245" y="99" text-anchor="middle" class="svg-ink" font-size="12">Campus halls</text>
<rect x="345" y="78" width="120" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="351" y1="107" x2="459" y2="107" stroke="#0284c7" stroke-width="2"/><text x="405" y="99" text-anchor="middle" class="svg-ink" font-size="12">Distant or DR</text>
<rect x="505" y="78" width="120" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="511" y1="107" x2="619" y2="107" stroke="#0284c7" stroke-width="2"/><text x="565" y="99" text-anchor="middle" class="svg-ink" font-size="12">Small site</text>
<rect x="25" y="143" width="120" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="31" y1="148" x2="139" y2="148" stroke="#16a34a" stroke-width="2"/><text x="85" y="164" text-anchor="middle" class="svg-ink" font-size="12">One fabric</text>
<rect x="185" y="143" width="120" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="191" y1="148" x2="299" y2="148" stroke="#16a34a" stroke-width="2"/><text x="245" y="164" text-anchor="middle" class="svg-ink" font-size="12">Multi-Pod</text>
<rect x="345" y="143" width="120" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="351" y1="148" x2="459" y2="148" stroke="#16a34a" stroke-width="2"/><text x="405" y="164" text-anchor="middle" class="svg-ink" font-size="12">Multi-Site</text>
<rect x="505" y="143" width="120" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="511" y1="148" x2="619" y2="148" stroke="#16a34a" stroke-width="2"/><text x="565" y="164" text-anchor="middle" class="svg-ink" font-size="12">Remote leaf</text>
<text x="320" y="208" text-anchor="middle" class="svg-muted" font-size="12">Always: dual-home, anycast gateway, VRF per tenant, N-1 capacity</text>
<line x1="16" y1="228" x2="624" y2="228" stroke="#e2e8f0"/><rect x="16" y="238" width="14" height="12" rx="2" fill="#fde68a" stroke="#64748b"/><text x="35" y="248" class="svg-muted" font-size="11">Controller</text><rect x="218.66666666666666" y="238" width="14" height="12" rx="2" fill="#bae6fd" stroke="#64748b"/><text x="237.66666666666666" y="248" class="svg-muted" font-size="11">Leaf / access</text><rect x="421.3333333333333" y="238" width="14" height="12" rx="2" fill="#bbf7d0" stroke="#64748b"/><text x="440.3333333333333" y="248" class="svg-muted" font-size="11">Spine</text>
</svg><p class="cap">Pick the extension model from latency, distance and the failure domain the business can accept. A remote leaf extends ACI to a small site.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain why spine-leaf replaced three-tier, and compute oversubscription and spine count from a server count (chapter 1, Ashford).</li>
<li>Choose ToR, EoR or MoR and pick optics by distance and fibre (chapter 1).</li>
<li>Design a vPC pair with peer-link, separate keepalive and an orphan-port review (chapter 2, Meridian).</li>
<li>Choose an underlay (OSPF, IS-IS, eBGP), route-reflector placement, BUM method, anycast gateway and multihoming for a VXLAN EVPN fabric (chapter 3, Kestrel).</li>
<li>Choose between ACI Multi-Pod, Multi-Site and remote leaf, and explain tenant, VRF, BD, EPG and contract (chapter 4, Lakeside).</li>
<li>Compare OTV with EVPN Multi-Site and list the risks of Layer 2 extension (chapter 5, Pinnacle).</li>
<li>Insert a firewall and load balancer with VRF sandwich, PBR or a service graph while keeping symmetry (chapter 6, Brightwave).</li>
<li>Segment tenants with VRFs and VNIs, plan for N-1, and explain what NDFC and APIC do and do not do (chapter 7, Orbit).</li>
</ul>

<h3>Requirement to design: quick table</h3>
<table class="cmp"><tr><th>If the brief says</th><th>Think</th></tr>
<tr><td>Heavy east-west, many racks</td><td>Spine-leaf, ToR leaves, ECMP</td></tr>
<tr><td>Dual-homed servers, mature team</td><td>vPC pairs; consider ESI at scale or on newer platforms</td></tr>
<tr><td>Same IP after VM move</td><td>VXLAN EVPN with anycast gateway</td></tr>
<tr><td>No multicast allowed</td><td>Ingress replication in the overlay</td></tr>
<tr><td>Two nearby halls, one operations team</td><td>Multi-Pod (EVPN or ACI)</td></tr>
<tr><td>Remote DR, contain failures</td><td>Multi-Site</td></tr>
<tr><td>Small branch needs central policy</td><td>ACI remote leaf</td></tr>
<tr><td>Temporary VM migration</td><td>Selective L2 stretch, with a removal date</td></tr>
<tr><td>Inspect only some flows</td><td>PBR or service graph</td></tr>
<tr><td>Tenant isolation</td><td>VRF per tenant, controlled route targets</td></tr></table>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>VTEP</dt><dd>Tunnel endpoint that adds or removes the VXLAN header.</dd>
<dt>VNI</dt><dd>24-bit VXLAN segment ID; L2VNI for a VLAN, L3VNI for a VRF.</dd>
<dt>RR</dt><dd>BGP route reflector, usually on the spines.</dd>
<dt>BGW</dt><dd>Border gateway that joins fabrics in EVPN Multi-Site.</dd>
<dt>ESI</dt><dd>Ethernet segment identifier for EVPN multihoming.</dd>
<dt>APIC</dt><dd>ACI controller cluster holding policy.</dd>
<dt>EPG</dt><dd>Group of endpoints with the same policy.</dd>
<dt>IPN / ISN</dt><dd>Inter-pod network / inter-site network between ACI pods or sites.</dd>
<dt>PBR</dt><dd>Policy-based redirect to a service node.</dd>
<dt>NDFC</dt><dd>Nexus Dashboard Fabric Controller for NX-OS fabrics.</dd>
<dt>N-1</dt><dd>Capacity design that survives the loss of one element.</dd></dl>

<h3>Most tested facts</h3>
<ul>
<li>Oversubscription = downlink bandwidth / uplink bandwidth.</li>
<li>Leaf count is limited by spine ports; add spines for bandwidth.</li>
<li>vPC has two peers; keepalive never uses the peer-link.</li>
<li>Underlay MTU must carry the VXLAN overhead (about 50 bytes).</li>
<li>EVPN route types: 2 MAC/IP, 3 inclusive multicast, 5 IP prefix; 1 and 4 for multihoming.</li>
<li>Multi-Pod = one APIC cluster; Multi-Site = several clusters plus Orchestrator.</li>
<li>OTV does not extend STP; EVPN Multi-Site isolates site underlays.</li>
<li>Stateful services need symmetric paths.</li>
<li>Controllers are management planes; the fabric forwards without them.</li>
</ul>

<h3>Useful verification commands</h3>
<pre class="out">show vpc
show nve peers
show nve vni
show bgp l2vpn evpn summary
show nve multisite dci-links
show port-channel summary</pre>

<h3>A repeating pattern in the post-mortems</h3>
<p>Every "what went wrong" in this course came from one of five causes: a physical limit ignored (reach, MTU, airflow), a single-homed device, a missing control (storm control, route-target policy), asymmetric traffic, or a failure domain larger than intended. When you answer an exam scenario, check those five first.</p>

<div class="warn"><p><b>Common mistake.</b> Answering with a product when the question asks for a design reason. Name the requirement, the constraint, the trade-off and then the choice.</p></div>
<div class="exam"><p><b>Exam trap.</b> Several answers are technically possible. The right one satisfies the stated requirement with the smallest failure domain and the least operational risk.</p></div>

<div class="scn"><h4>Putting it together: a one-page answer</h4><p>A candidate was asked to design for two sites 300 km apart, 800 VMs, six tenants, one firewall pair. The strong answer: VXLAN EVPN fabric per site (spine-leaf, OSPF underlay, spine RRs, anycast gateway, vPC leaf pairs), EVPN Multi-Site for DR with only the migration VNIs stretched, VRF per tenant, PBR for the firewall, N-1 spines, and NDFC for templates. It named the failure domain of each choice.</p><p><b>Lesson:</b> a good design answer is a short chain: requirement, option, trade-off, decision.</p></div>

<div class="iv"><p class="q">"Walk me through how you would design a new data center network."</p><p>Start with requirements and constraints, then physical shape (spine-leaf, sizing, oversubscription), Layer 2 and multihoming, overlay and tenancy, extensions (pods, sites), services, then failure domains, capacity, and the controller. Finish by naming what would go wrong.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design from requirement and constraint, not from product.</li>
<li>Name the failure domain of every choice.</li>
<li>Selective, temporary Layer 2 extension only.</li>
<li>Check scale, MTU, symmetry and orphan devices before go-live.</li>
<li>Use the five-cause list on every scenario question.</li>
</ul></div>

`,hi:`

<p>Pilot har dial yaad nahi rakhta; woh checklist rakhta hai aur failure stories jaanta hai. Yeh aakhri chapter poore course ko ek checklist mein sametta hai jo aap exam mein aur real design meeting mein use kar sakte ho. Har pichhla chapter ek customer se shuru hua; yahan woh customers har rule ka saboot hain.</p>

<h3>Decision map</h3>
<div class="dia"><svg viewBox="0 0 640 262" role="img" aria-label="Requirement se extension model tak decision map">
<line x1="320" y1="28" x2="85" y2="95" stroke="#64748b" stroke-width="1.6"/>
<line x1="320" y1="28" x2="245" y2="95" stroke="#64748b" stroke-width="1.6"/>
<line x1="320" y1="28" x2="405" y2="95" stroke="#64748b" stroke-width="1.6"/>
<line x1="320" y1="28" x2="565" y2="95" stroke="#64748b" stroke-width="1.6"/>
<line x1="85" y1="95" x2="85" y2="160" stroke="#64748b" stroke-width="1.6"/>
<line x1="245" y1="95" x2="245" y2="160" stroke="#64748b" stroke-width="1.6"/>
<line x1="405" y1="95" x2="405" y2="160" stroke="#64748b" stroke-width="1.6"/>
<line x1="565" y1="95" x2="565" y2="160" stroke="#64748b" stroke-width="1.6"/>
<rect x="225" y="11" width="190" height="34" rx="7" fill="#fde68a" stroke="#64748b"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="12">Customer requirements</text>
<rect x="25" y="78" width="120" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="31" y1="107" x2="139" y2="107" stroke="#0284c7" stroke-width="2"/><text x="85" y="99" text-anchor="middle" class="svg-ink" font-size="12">One hall</text>
<rect x="185" y="78" width="120" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="191" y1="107" x2="299" y2="107" stroke="#0284c7" stroke-width="2"/><text x="245" y="99" text-anchor="middle" class="svg-ink" font-size="12">Campus halls</text>
<rect x="345" y="78" width="120" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="351" y1="107" x2="459" y2="107" stroke="#0284c7" stroke-width="2"/><text x="405" y="99" text-anchor="middle" class="svg-ink" font-size="12">Distant ya DR</text>
<rect x="505" y="78" width="120" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="511" y1="107" x2="619" y2="107" stroke="#0284c7" stroke-width="2"/><text x="565" y="99" text-anchor="middle" class="svg-ink" font-size="12">Chhoti site</text>
<rect x="25" y="143" width="120" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="31" y1="148" x2="139" y2="148" stroke="#16a34a" stroke-width="2"/><text x="85" y="164" text-anchor="middle" class="svg-ink" font-size="12">One fabric</text>
<rect x="185" y="143" width="120" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="191" y1="148" x2="299" y2="148" stroke="#16a34a" stroke-width="2"/><text x="245" y="164" text-anchor="middle" class="svg-ink" font-size="12">Multi-Pod</text>
<rect x="345" y="143" width="120" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="351" y1="148" x2="459" y2="148" stroke="#16a34a" stroke-width="2"/><text x="405" y="164" text-anchor="middle" class="svg-ink" font-size="12">Multi-Site</text>
<rect x="505" y="143" width="120" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="511" y1="148" x2="619" y2="148" stroke="#16a34a" stroke-width="2"/><text x="565" y="164" text-anchor="middle" class="svg-ink" font-size="12">Remote leaf</text>
<text x="320" y="208" text-anchor="middle" class="svg-muted" font-size="12">Hamesha: dual-home, anycast gateway, VRF per tenant, N-1 capacity</text>
<line x1="16" y1="228" x2="624" y2="228" stroke="#e2e8f0"/><rect x="16" y="238" width="14" height="12" rx="2" fill="#fde68a" stroke="#64748b"/><text x="35" y="248" class="svg-muted" font-size="11">Controller</text><rect x="218.66666666666666" y="238" width="14" height="12" rx="2" fill="#bae6fd" stroke="#64748b"/><text x="237.66666666666666" y="248" class="svg-muted" font-size="11">Leaf / access</text><rect x="421.3333333333333" y="238" width="14" height="12" rx="2" fill="#bbf7d0" stroke="#64748b"/><text x="440.3333333333333" y="248" class="svg-muted" font-size="11">Spine</text>
</svg><p class="cap">Latency, distance aur business jo failure domain accept kare, usse extension model chuno. Remote leaf ACI ko chhoti site tak extend karta hai.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Batao ki spine-leaf ne three-tier ki jagah kyun li, aur server count se oversubscription aur spine count calculate karo (chapter 1, Ashford).</li>
<li>ToR, EoR ya MoR chuno aur distance aur fibre se optics pick karo (chapter 1).</li>
<li>Peer-link, alag keepalive aur orphan-port review ke saath vPC pair design karo (chapter 2, Meridian).</li>
<li>VXLAN EVPN fabric ke liye underlay (OSPF, IS-IS, eBGP), route-reflector placement, BUM method, anycast gateway aur multihoming chuno (chapter 3, Kestrel).</li>
<li>ACI Multi-Pod, Multi-Site aur remote leaf mein se chuno, aur tenant, VRF, BD, EPG aur contract samjhao (chapter 4, Lakeside).</li>
<li>OTV ko EVPN Multi-Site se compare karo aur Layer 2 extension ke risks list karo (chapter 5, Pinnacle).</li>
<li>VRF sandwich, PBR ya service graph se firewall aur load balancer insert karo, symmetry rakhte hue (chapter 6, Brightwave).</li>
<li>VRFs aur VNIs se tenants segment karo, N-1 plan karo, aur batao ki NDFC aur APIC kya karte hain aur kya nahi (chapter 7, Orbit).</li>
</ul>

<h3>Requirement se design: quick table</h3>
<table class="cmp"><tr><th>Brief kehta hai</th><th>Socho</th></tr>
<tr><td>Heavy east-west, kai racks</td><td>Spine-leaf, ToR leaves, ECMP</td></tr>
<tr><td>Dual-homed servers, mature team</td><td>vPC pairs; scale par ya naye platforms par ESI consider karo</td></tr>
<tr><td>VM move ke baad same IP</td><td>Anycast gateway ke saath VXLAN EVPN</td></tr>
<tr><td>Multicast allowed nahi</td><td>Overlay mein ingress replication</td></tr>
<tr><td>Do paas ke halls, ek operations team</td><td>Multi-Pod (EVPN ya ACI)</td></tr>
<tr><td>Remote DR, failures contain karna</td><td>Multi-Site</td></tr>
<tr><td>Chhoti branch ko central policy chahiye</td><td>ACI remote leaf</td></tr>
<tr><td>Temporary VM migration</td><td>Removal date ke saath selective L2 stretch</td></tr>
<tr><td>Sirf kuch flows inspect karne hain</td><td>PBR ya service graph</td></tr>
<tr><td>Tenant isolation</td><td>Har tenant ka VRF, controlled route targets</td></tr></table>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>VTEP</dt><dd>Tunnel endpoint jo VXLAN header lagata ya hataata hai.</dd>
<dt>VNI</dt><dd>24-bit VXLAN segment ID; VLAN ke liye L2VNI, VRF ke liye L3VNI.</dd>
<dt>RR</dt><dd>BGP route reflector, aksar spines par.</dd>
<dt>BGW</dt><dd>Border gateway jo EVPN Multi-Site mein fabrics jodta hai.</dd>
<dt>ESI</dt><dd>EVPN multihoming ke liye Ethernet segment identifier.</dd>
<dt>APIC</dt><dd>Policy hold karne wala ACI controller cluster.</dd>
<dt>EPG</dt><dd>Same policy wale endpoints ka group.</dd>
<dt>IPN / ISN</dt><dd>ACI pods ya sites ke beech inter-pod network / inter-site network.</dd>
<dt>PBR</dt><dd>Service node tak policy-based redirect.</dd>
<dt>NDFC</dt><dd>NX-OS fabrics ke liye Nexus Dashboard Fabric Controller.</dd>
<dt>N-1</dt><dd>Capacity design jo ek element ke jaane ko survive kare.</dd></dl>

<h3>Sabse zyada tested facts</h3>
<ul>
<li>Oversubscription = downlink bandwidth / uplink bandwidth.</li>
<li>Leaf count spine ports se limited hai; bandwidth ke liye spines jodo.</li>
<li>vPC mein do peers; keepalive kabhi peer-link use nahi karta.</li>
<li>Underlay MTU ko VXLAN overhead (lagbhag 50 bytes) carry karna chahiye.</li>
<li>EVPN route types: 2 MAC/IP, 3 inclusive multicast, 5 IP prefix; 1 aur 4 multihoming ke liye.</li>
<li>Multi-Pod = ek APIC cluster; Multi-Site = kai clusters plus Orchestrator.</li>
<li>OTV STP extend nahi karta; EVPN Multi-Site site underlays isolate karta hai.</li>
<li>Stateful services ko symmetric paths chahiye.</li>
<li>Controllers management plane hain; fabric unke bina forward karta hai.</li>
</ul>

<h3>Useful verification commands</h3>
<pre class="out">show vpc
show nve peers
show nve vni
show bgp l2vpn evpn summary
show nve multisite dci-links
show port-channel summary</pre>

<h3>Post-mortems mein repeat hone wala pattern</h3>
<p>Is course ka har "kya galat hua" paanch kaaranon mein se ek se aaya: ignore ki gayi physical limit (reach, MTU, airflow), single-homed device, missing control (storm control, route-target policy), asymmetric traffic, ya iraade se bada failure domain. Exam scenario ka jawab dete waqt pehle yeh paanch check karo.</p>

<div class="warn"><p><b>Common mistake.</b> Jab sawaal design reason maangta hai tab product se jawab dena. Requirement, constraint, trade-off batao, phir choice.</p></div>
<div class="exam"><p><b>Exam trap.</b> Kai answers technically possible hote hain. Sahi woh hai jo stated requirement ko sabse chhote failure domain aur sabse kam operational risk ke saath poora kare.</p></div>

<div class="scn"><h4>Sab jodkar: one-page answer</h4><p>Ek candidate se 300 km door do sites, 800 VMs, chhe tenants, ek firewall pair ka design maanga gaya. Strong answer: har site par VXLAN EVPN fabric (spine-leaf, OSPF underlay, spine RRs, anycast gateway, vPC leaf pairs), DR ke liye EVPN Multi-Site jisme sirf migration VNIs stretch hon, har tenant ka VRF, firewall ke liye PBR, N-1 spines, aur templates ke liye NDFC. Usne har choice ka failure domain bataya.</p><p><b>Lesson:</b> achha design answer chhoti chain hota hai: requirement, option, trade-off, decision.</p></div>

<div class="iv"><p class="q">"Naye data center network ka design kaise karoge, step by step batao."</p><p>Requirements aur constraints se shuru karo, phir physical shape (spine-leaf, sizing, oversubscription), Layer 2 aur multihoming, overlay aur tenancy, extensions (pods, sites), services, phir failure domains, capacity, aur controller. End mein batao ki kya galat ho sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Requirement aur constraint se design karo, product se nahi.</li>
<li>Har choice ka failure domain batao.</li>
<li>Sirf selective, temporary Layer 2 extension.</li>
<li>Go-live se pehle scale, MTU, symmetry aur orphan devices check karo.</li>
<li>Har scenario question par paanch-kaaran list use karo.</li>
</ul></div>

`}};export{e as default};