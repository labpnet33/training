var e={id:`tenancy-ha-ndfc`,h:{en:`Multitenancy, failure domains, capacity planning and the role of NDFC`,hi:`Multitenancy, failure domains, capacity planning aur NDFC ka role`},body:{en:`

<p>A large apartment building has separate fire doors, separate water risers and one building manager. If a pipe bursts, only one riser floods. Network design works the same way: you decide how big a failure may get (the <b>failure domain</b>), how tenants stay apart (<b>segmentation</b>), how much spare capacity exists, and who runs the building (the <b>controller</b>).</p>

<h3>The case: Orbit Hosting</h3>
<div class="eg"><p><b>Customer.</b> Orbit Hosting is a managed-hosting provider with 40 enterprise tenants in one fabric of 80 leaves and 4 spines. Some tenants need shared services (DNS, backup, monitoring); others must never see each other.</p><p><b>Requirements.</b> Hard isolation between tenants. Overlapping IP addresses allowed. A fault in one pod must not take down others. A spine failure must not slow customers. Plan growth for three years. Fast, repeatable onboarding of a new tenant.</p><p><b>Constraints.</b> Two operations engineers per shift. Mixed Nexus 9000 models. Strict maintenance windows once a month.</p></div>

<h3>Segmentation: VRF and VNI</h3>
<p>A <b>VRF</b> is a separate routing table. One VRF per tenant gives Layer 3 isolation and permits overlapping addresses. In VXLAN EVPN each VRF has one <b>L3VNI</b> for routed traffic between leaves, and each VLAN is an <b>L2VNI</b>. <b>Route targets (RT)</b> decide which VRFs import which routes. A tenant's RT stays private, so routes never leak unless you ask.</p>
<pre class="code">vrf context TENANT-A
  vni 50001
  rd auto
  address-family ipv4 unicast
    route-target both auto
    route-target both auto evpn
vlan 100
  vn-segment 30100</pre>
<pre class="out">leaf-101# show nve vni
Interface VNI    Multicast-group State Mode Type [BD/VRF]
nve1      30100  UnicastBGP      Up    CP   L2 [100]
nve1      <span class="hl">50001</span>  n/a             Up    CP   L3 [TENANT-A]</pre>
<table class="cmp"><tr><th>Need</th><th>EVPN fabric</th><th>ACI</th></tr>
<tr><td>Tenant boundary</td><td>VRF plus VNI</td><td>Tenant plus VRF</td></tr>
<tr><td>Segmentation inside a tenant</td><td>Separate VRFs or L2VNIs; firewall via PBR</td><td>EPGs and contracts; microsegmentation (uSeg) EPGs</td></tr>
<tr><td>Shared services</td><td>Shared VRF with controlled route-target import (route leaking)</td><td>Shared-services contract between VRFs or tenants</td></tr>
<tr><td>Exit to WAN or firewall</td><td>VRF-lite on the border leaf (one subinterface and routing session per VRF)</td><td>L3Out per VRF</td></tr></table>
<p>Shared services are the usual trap: leak only the specific prefixes (for example the DNS server /32) and never let the shared VRF re-advertise tenant routes to other tenants.</p>

<h3>High availability and failure domains</h3>
<p>List the domains from small to large: link, node, vPC leaf pair, pod, fabric, site. For each, ask what breaks and how many tenants notice. Rules that help: dual-home every server; spread peer-link and uplink members across modules; keep at least N+1 spines; use BFD for fast detection; use graceful insertion/removal (maintenance mode) before upgrades; avoid designs where a pod, a fabric controller or a DCI is a single point of failure for everything. A smaller fabric per site or a Multi-Site design limits the blast radius of a software or configuration bug.</p>

<h3>Capacity planning</h3>
<p>Plan for the <b>N-1</b> case. With 4 spines, losing one removes 25 percent of fabric bandwidth, so peak utilisation must stay below 75 percent of the total to avoid congestion during a failure. Also plan:</p>
<ul>
<li><b>Ports:</b> leaf count is limited by spine ports (chapter 1).</li>
<li><b>Control-plane and table scale:</b> MAC addresses, host routes (ARP/ND), VRFs, VNIs, BGP routes and ECMP paths. Check the verified scalability guide for the exact platform and release.</li>
<li><b>Power and cooling:</b> kW per rack and per row.</li>
<li><b>Growth:</b> three to five years, with a trigger (for example 70 percent) to order new spines.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Orbit's peak east-west traffic is 1.2 Tbps across 4 spines of 6.4 Tbps total usable fabric bandwidth: 19 percent. Losing one spine leaves 4.8 Tbps, so 25 percent: safe. Host table: 40 tenants x 1,500 endpoints = 60,000 entries; compare with the leaf's host-entry limit before adding more.</p></div>

<h3>The controller: NDFC</h3>
<p><b>Cisco Nexus Dashboard Fabric Controller (NDFC)</b> runs on Nexus Dashboard and manages NX-OS fabrics. It does three kinds of work: <b>Day 0</b> (bootstrap new switches with POAP and fabric templates such as VXLAN EVPN), <b>Day 1</b> (create VRFs and networks as overlay objects and attach them to interfaces), and <b>Day 2</b> (monitoring, configuration compliance, image management, change history). It also manages multi-fabric groups. It is not in the data path: if NDFC is down, the fabric keeps forwarding, but you lose changes and visibility. In ACI the equivalent is APIC, with the Nexus Dashboard Orchestrator across sites.</p>

<div class="dia"><svg viewBox="0 0 640 282" role="img" aria-label="Failure domains and tenants under a controller">
<rect x="15" y="62" width="300" height="142" rx="10" fill="#bbf7d0" fill-opacity="0.35" stroke="#64748b" stroke-dasharray="4 3"/><text x="23" y="78" class="svg-muted" font-size="12">Pod 1 failure domain</text>
<rect x="325" y="62" width="300" height="142" rx="10" fill="#bae6fd" fill-opacity="0.35" stroke="#64748b" stroke-dasharray="4 3"/><text x="333" y="78" class="svg-muted" font-size="12">Pod 2 failure domain</text>
<line x1="320" y1="28" x2="165" y2="112" stroke="#64748b" stroke-width="1.6" stroke-dasharray="5 4"/>
<line x1="320" y1="28" x2="475" y2="112" stroke="#64748b" stroke-width="1.6" stroke-dasharray="5 4"/>
<line x1="165" y1="112" x2="95" y2="165" stroke="#64748b" stroke-width="1.6"/>
<line x1="165" y1="112" x2="235" y2="165" stroke="#64748b" stroke-width="1.6"/>
<line x1="475" y1="112" x2="405" y2="165" stroke="#64748b" stroke-width="1.6"/>
<line x1="475" y1="112" x2="545" y2="165" stroke="#64748b" stroke-width="1.6"/>
<line x1="95" y1="165" x2="95" y2="235" stroke="#64748b" stroke-width="1.6"/>
<line x1="235" y1="165" x2="235" y2="235" stroke="#64748b" stroke-width="1.6"/>
<line x1="405" y1="165" x2="405" y2="235" stroke="#64748b" stroke-width="1.6"/>
<line x1="545" y1="165" x2="545" y2="235" stroke="#64748b" stroke-width="1.6"/>
<rect x="225" y="11" width="190" height="34" rx="7" fill="#fde68a" stroke="#64748b"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="12">NDFC (management plane)</text>
<rect x="122" y="95" width="86" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="128" y1="100" x2="202" y2="100" stroke="#16a34a" stroke-width="2"/><text x="165" y="116" text-anchor="middle" class="svg-ink" font-size="12">Spine</text>
<rect x="60" y="148" width="70" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="66" y1="177" x2="124" y2="177" stroke="#0284c7" stroke-width="2"/><text x="95" y="169" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="200" y="148" width="70" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="206" y1="177" x2="264" y2="177" stroke="#0284c7" stroke-width="2"/><text x="235" y="169" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="432" y="95" width="86" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="438" y1="100" x2="512" y2="100" stroke="#16a34a" stroke-width="2"/><text x="475" y="116" text-anchor="middle" class="svg-ink" font-size="12">Spine</text>
<rect x="370" y="148" width="70" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="376" y1="177" x2="434" y2="177" stroke="#0284c7" stroke-width="2"/><text x="405" y="169" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="510" y="148" width="70" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="516" y1="177" x2="574" y2="177" stroke="#0284c7" stroke-width="2"/><text x="545" y="169" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="53" y="218" width="84" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="57" y="222" width="6" height="26" fill="#94a3b8"/><text x="95" y="239" text-anchor="middle" class="svg-ink" font-size="12">Tenant A</text>
<rect x="193" y="218" width="84" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="197" y="222" width="6" height="26" fill="#94a3b8"/><text x="235" y="239" text-anchor="middle" class="svg-ink" font-size="12">Tenant B</text>
<rect x="363" y="218" width="84" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="367" y="222" width="6" height="26" fill="#94a3b8"/><text x="405" y="239" text-anchor="middle" class="svg-ink" font-size="12">Tenant A</text>
<rect x="503" y="218" width="84" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="507" y="222" width="6" height="26" fill="#94a3b8"/><text x="545" y="239" text-anchor="middle" class="svg-ink" font-size="12">Tenant B</text>
<line x1="16" y1="248" x2="624" y2="248" stroke="#e2e8f0"/><rect x="16" y="258" width="14" height="12" rx="2" fill="#fde68a" stroke="#64748b"/><text x="35" y="268" class="svg-muted" font-size="11">Controller</text><rect x="168" y="258" width="14" height="12" rx="2" fill="#bbf7d0" stroke="#64748b"/><text x="187" y="268" class="svg-muted" font-size="11">Spine</text><rect x="320" y="258" width="14" height="12" rx="2" fill="#bae6fd" stroke="#64748b"/><text x="339" y="268" class="svg-muted" font-size="11">Leaf / access</text><rect x="472" y="258" width="14" height="12" rx="2" fill="#e2e8f0" stroke="#64748b"/><text x="491" y="268" class="svg-muted" font-size="11">Server / host</text>
</svg><p class="cap">Each pod is a failure domain. The controller (dashed) manages but does not forward. Tenants A and B are separate VRFs in both pods.</p></div>

<h3>Chosen design for Orbit</h3>
<p>One VRF and one L3VNI per tenant, a shared-services VRF with /32 route leaking, VRF-lite on a border pair for each tenant's WAN, two fabrics (one per hall) under a Multi-Site domain managed by NDFC, vPC pairs for servers, N-1 capacity at 60 percent peak, and templates in NDFC so a new tenant takes minutes.</p>

<div class="warn"><p><b>Common mistakes.</b> Reusing one route target for all tenants. Leaking whole prefixes into the shared VRF. Sizing for N, not N-1. Checking only bandwidth, not MAC/ARP table limits.</p></div>
<div class="exam"><p><b>Exam trap.</b> A controller is a management plane, not a data plane. Segmentation by VLAN alone is not tenant isolation; VRFs or ACI tenants are.</p></div>

<div class="scn"><h4>What went wrong at Orbit</h4><p>When tenant 12 was onboarded, an engineer copied an older configuration with the shared-services route target set to import-export. Tenant 12 started to receive prefixes from tenant 7 through the shared VRF, and a monitoring probe from tenant 7 appeared in tenant 12's logs. No data was lost, but the incident report was serious. The fix was an import-only policy on the shared VRF and an NDFC template with route targets generated automatically.</p><p><b>Lesson:</b> leaking is a one-way door; use templates, not copy-paste.</p></div>

<div class="iv"><p class="q">"How do you design for a spine failure?"</p><p>Size for N-1: with four spines, peak below 75 percent of total capacity, use ECMP and BFD, and keep maintenance-mode procedures so upgrades do not look like failures.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tenant = VRF plus L3VNI; VLAN = L2VNI; route targets control leaking.</li>
<li>Shared services: leak specific prefixes, import-only.</li>
<li>Map failure domains from link to site and design for N-1.</li>
<li>Check table scale, not only bandwidth.</li>
<li>NDFC and APIC manage and automate; they do not forward.</li>
</ul></div>

`,hi:`

<p>Bade apartment building mein alag fire doors, alag water risers aur ek building manager hota hai. Pipe phat jaye to sirf ek riser mein paani bharta hai. Network design bhi aise hi kaam karta hai: aap tay karte ho ki failure kitna bada ho sakta hai (<b>failure domain</b>), tenants alag kaise rahenge (<b>segmentation</b>), kitni spare capacity hai, aur building kaun chalata hai (<b>controller</b>).</p>

<h3>Case: Orbit Hosting</h3>
<div class="eg"><p><b>Customer.</b> Orbit Hosting ek managed-hosting provider hai jiske 80 leaves aur 4 spines ke ek fabric mein 40 enterprise tenants hain. Kuch tenants ko shared services (DNS, backup, monitoring) chahiye; baaki kabhi ek doosre ko na dekhein.</p><p><b>Requirements.</b> Tenants ke beech hard isolation. Overlapping IP addresses allowed. Ek pod ka fault doosre pods ko na giraye. Spine failure customers ko slow na kare. Teen saal ki growth plan. Naye tenant ka tez, repeatable onboarding.</p><p><b>Constraints.</b> Har shift mein do operations engineers. Mixed Nexus 9000 models. Mahine mein ek baar strict maintenance window.</p></div>

<h3>Segmentation: VRF aur VNI</h3>
<p><b>VRF</b> alag routing table hai. Har tenant ke liye ek VRF Layer 3 isolation deta hai aur overlapping addresses allow karta hai. VXLAN EVPN mein har VRF ka ek <b>L3VNI</b> hota hai (leaves ke beech routed traffic ke liye) aur har VLAN ek <b>L2VNI</b>. <b>Route targets (RT)</b> tay karte hain ki kaunsa VRF kaunse routes import kare. Tenant ka RT private rehta hai, isliye routes tab tak leak nahi hote jab tak aap na kaho.</p>
<pre class="code">vrf context TENANT-A
  vni 50001
  rd auto
  address-family ipv4 unicast
    route-target both auto
    route-target both auto evpn
vlan 100
  vn-segment 30100</pre>
<pre class="out">leaf-101# show nve vni
Interface VNI    Multicast-group State Mode Type [BD/VRF]
nve1      30100  UnicastBGP      Up    CP   L2 [100]
nve1      <span class="hl">50001</span>  n/a             Up    CP   L3 [TENANT-A]</pre>
<table class="cmp"><tr><th>Zaroorat</th><th>EVPN fabric</th><th>ACI</th></tr>
<tr><td>Tenant boundary</td><td>VRF plus VNI</td><td>Tenant plus VRF</td></tr>
<tr><td>Tenant ke andar segmentation</td><td>Alag VRFs ya L2VNIs; PBR se firewall</td><td>EPGs aur contracts; microsegmentation (uSeg) EPGs</td></tr>
<tr><td>Shared services</td><td>Controlled route-target import wala shared VRF (route leaking)</td><td>VRFs ya tenants ke beech shared-services contract</td></tr>
<tr><td>WAN ya firewall ki taraf exit</td><td>Border leaf par VRF-lite (har VRF ka ek subinterface aur routing session)</td><td>Har VRF ka L3Out</td></tr></table>
<p>Shared services usual trap hain: sirf specific prefixes leak karo (jaise DNS server ka /32) aur shared VRF ko kabhi tenant routes doosre tenants ko re-advertise mat karne do.</p>

<h3>High availability aur failure domains</h3>
<p>Domains ko chhote se bade tak likho: link, node, vPC leaf pair, pod, fabric, site. Har ek ke liye poocho ki kya toota aur kitne tenants ko pata chala. Madad karne wale rules: har server dual-home; peer-link aur uplink members modules mein failao; kam se kam N+1 spines; fast detection ke liye BFD; upgrades se pehle graceful insertion/removal (maintenance mode); aise design se bacho jahan pod, fabric controller ya DCI sabke liye single point of failure ho. Har site ka chhota fabric ya Multi-Site design software ya configuration bug ka blast radius limit karta hai.</p>

<h3>Capacity planning</h3>
<p><b>N-1</b> case ke liye plan karo. 4 spines mein ek ke jaane se fabric bandwidth ka 25 percent chala jaata hai, isliye peak utilisation total ke 75 percent se neeche rehni chahiye taaki failure ke dauraan congestion na ho. Yeh bhi plan karo:</p>
<ul>
<li><b>Ports:</b> leaf count spine ports se limited hai (chapter 1).</li>
<li><b>Control-plane aur table scale:</b> MAC addresses, host routes (ARP/ND), VRFs, VNIs, BGP routes aur ECMP paths. Exact platform aur release ke liye verified scalability guide dekho.</li>
<li><b>Power aur cooling:</b> kW per rack aur per row.</li>
<li><b>Growth:</b> teen se paanch saal, trigger ke saath (jaise 70 percent) naye spines order karne ke liye.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Orbit ka peak east-west traffic 4 spines ke 6.4 Tbps total usable fabric bandwidth par 1.2 Tbps hai: 19 percent. Ek spine jaane par 4.8 Tbps bachta hai, yaani 25 percent: safe. Host table: 40 tenants x 1,500 endpoints = 60,000 entries; aur jodne se pehle leaf ke host-entry limit se compare karo.</p></div>

<h3>Controller: NDFC</h3>
<p><b>Cisco Nexus Dashboard Fabric Controller (NDFC)</b> Nexus Dashboard par chalta hai aur NX-OS fabrics manage karta hai. Yeh teen tarah ka kaam karta hai: <b>Day 0</b> (naye switches ko POAP aur VXLAN EVPN jaise fabric templates se bootstrap karna), <b>Day 1</b> (VRFs aur networks ko overlay objects ke roop mein banana aur interfaces par attach karna), aur <b>Day 2</b> (monitoring, configuration compliance, image management, change history). Yeh multi-fabric groups bhi manage karta hai. Yeh data path mein nahi hai: NDFC down ho to fabric forward karta rehta hai, par changes aur visibility chali jaati hai. ACI mein iska equivalent APIC hai, sites ke across Nexus Dashboard Orchestrator ke saath.</p>

<div class="dia"><svg viewBox="0 0 640 282" role="img" aria-label="Controller ke neeche failure domains aur tenants">
<rect x="15" y="62" width="300" height="142" rx="10" fill="#bbf7d0" fill-opacity="0.35" stroke="#64748b" stroke-dasharray="4 3"/><text x="23" y="78" class="svg-muted" font-size="12">Pod 1 failure domain</text>
<rect x="325" y="62" width="300" height="142" rx="10" fill="#bae6fd" fill-opacity="0.35" stroke="#64748b" stroke-dasharray="4 3"/><text x="333" y="78" class="svg-muted" font-size="12">Pod 2 failure domain</text>
<line x1="320" y1="28" x2="165" y2="112" stroke="#64748b" stroke-width="1.6" stroke-dasharray="5 4"/>
<line x1="320" y1="28" x2="475" y2="112" stroke="#64748b" stroke-width="1.6" stroke-dasharray="5 4"/>
<line x1="165" y1="112" x2="95" y2="165" stroke="#64748b" stroke-width="1.6"/>
<line x1="165" y1="112" x2="235" y2="165" stroke="#64748b" stroke-width="1.6"/>
<line x1="475" y1="112" x2="405" y2="165" stroke="#64748b" stroke-width="1.6"/>
<line x1="475" y1="112" x2="545" y2="165" stroke="#64748b" stroke-width="1.6"/>
<line x1="95" y1="165" x2="95" y2="235" stroke="#64748b" stroke-width="1.6"/>
<line x1="235" y1="165" x2="235" y2="235" stroke="#64748b" stroke-width="1.6"/>
<line x1="405" y1="165" x2="405" y2="235" stroke="#64748b" stroke-width="1.6"/>
<line x1="545" y1="165" x2="545" y2="235" stroke="#64748b" stroke-width="1.6"/>
<rect x="225" y="11" width="190" height="34" rx="7" fill="#fde68a" stroke="#64748b"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="12">NDFC (management plane)</text>
<rect x="122" y="95" width="86" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="128" y1="100" x2="202" y2="100" stroke="#16a34a" stroke-width="2"/><text x="165" y="116" text-anchor="middle" class="svg-ink" font-size="12">Spine</text>
<rect x="60" y="148" width="70" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="66" y1="177" x2="124" y2="177" stroke="#0284c7" stroke-width="2"/><text x="95" y="169" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="200" y="148" width="70" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="206" y1="177" x2="264" y2="177" stroke="#0284c7" stroke-width="2"/><text x="235" y="169" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="432" y="95" width="86" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="438" y1="100" x2="512" y2="100" stroke="#16a34a" stroke-width="2"/><text x="475" y="116" text-anchor="middle" class="svg-ink" font-size="12">Spine</text>
<rect x="370" y="148" width="70" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="376" y1="177" x2="434" y2="177" stroke="#0284c7" stroke-width="2"/><text x="405" y="169" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="510" y="148" width="70" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="516" y1="177" x2="574" y2="177" stroke="#0284c7" stroke-width="2"/><text x="545" y="169" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="53" y="218" width="84" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="57" y="222" width="6" height="26" fill="#94a3b8"/><text x="95" y="239" text-anchor="middle" class="svg-ink" font-size="12">Tenant A</text>
<rect x="193" y="218" width="84" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="197" y="222" width="6" height="26" fill="#94a3b8"/><text x="235" y="239" text-anchor="middle" class="svg-ink" font-size="12">Tenant B</text>
<rect x="363" y="218" width="84" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="367" y="222" width="6" height="26" fill="#94a3b8"/><text x="405" y="239" text-anchor="middle" class="svg-ink" font-size="12">Tenant A</text>
<rect x="503" y="218" width="84" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="507" y="222" width="6" height="26" fill="#94a3b8"/><text x="545" y="239" text-anchor="middle" class="svg-ink" font-size="12">Tenant B</text>
<line x1="16" y1="248" x2="624" y2="248" stroke="#e2e8f0"/><rect x="16" y="258" width="14" height="12" rx="2" fill="#fde68a" stroke="#64748b"/><text x="35" y="268" class="svg-muted" font-size="11">Controller</text><rect x="168" y="258" width="14" height="12" rx="2" fill="#bbf7d0" stroke="#64748b"/><text x="187" y="268" class="svg-muted" font-size="11">Spine</text><rect x="320" y="258" width="14" height="12" rx="2" fill="#bae6fd" stroke="#64748b"/><text x="339" y="268" class="svg-muted" font-size="11">Leaf / access</text><rect x="472" y="258" width="14" height="12" rx="2" fill="#e2e8f0" stroke="#64748b"/><text x="491" y="268" class="svg-muted" font-size="11">Server / host</text>
</svg><p class="cap">Har pod ek failure domain hai. Controller (dashed) manage karta hai, forward nahi. Tenants A aur B dono pods mein alag VRFs hain.</p></div>

<h3>Orbit ke liye chosen design</h3>
<p>Har tenant ke liye ek VRF aur ek L3VNI, /32 route leaking wala shared-services VRF, har tenant ke WAN ke liye border pair par VRF-lite, NDFC se manage hone wale Multi-Site domain ke under do fabrics (har hall ka ek), servers ke liye vPC pairs, 60 percent peak par N-1 capacity, aur NDFC mein templates taaki naya tenant minutes mein ho jaye.</p>

<div class="warn"><p><b>Common mistakes.</b> Sab tenants ke liye ek hi route target reuse karna. Poore prefixes shared VRF mein leak karna. N ke liye size karna, N-1 ke liye nahi. Sirf bandwidth check karna, MAC/ARP table limits nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Controller management plane hai, data plane nahi. Sirf VLAN se segmentation tenant isolation nahi hai; VRFs ya ACI tenants hain.</p></div>

<div class="scn"><h4>Orbit mein kya galat hua</h4><p>Tenant 12 onboard karte waqt engineer ne purani configuration copy ki jisme shared-services route target import-export set tha. Tenant 12 ko shared VRF ke through tenant 7 ke prefixes milne lage, aur tenant 7 ka monitoring probe tenant 12 ke logs mein dikha. Data nahi gaya, par incident report serious thi. Fix: shared VRF par import-only policy aur NDFC template jisme route targets automatically generate hote hain.</p><p><b>Lesson:</b> leaking one-way door hai; copy-paste nahi, templates use karo.</p></div>

<div class="iv"><p class="q">"Spine failure ke liye design kaise karte ho?"</p><p>N-1 ke liye size karo: chaar spines mein peak total capacity ke 75 percent se neeche, ECMP aur BFD use karo, aur maintenance-mode procedures rakho taaki upgrades failure jaise na dikhein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tenant = VRF plus L3VNI; VLAN = L2VNI; route targets leaking control karte hain.</li>
<li>Shared services: specific prefixes leak karo, import-only.</li>
<li>Link se site tak failure domains map karo aur N-1 ke liye design karo.</li>
<li>Sirf bandwidth nahi, table scale bhi check karo.</li>
<li>NDFC aur APIC manage aur automate karte hain; forward nahi.</li>
</ul></div>

`}};export{e as default};