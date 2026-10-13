function e(e,t,n,r,i,a){return`<text x="`+e+`" y="`+t+`" text-anchor="`+(a||`middle`)+`" class="`+(r||`svg-ink`)+`" font-size="`+(i||12)+`">`+n+`</text>`}function t(t,n,r){return`<rect x="10" y="`+t+`" width="290" height="38" rx="8" fill="#bae6fd" stroke="#64748b"/>`+e(155,t+24,n,`svg-ink`,12)+`<line x1="300" y1="`+(t+19)+`" x2="338" y2="`+(t+19)+`" stroke="#64748b" stroke-width="2"/><path d="M338 `+(t+13)+`L348 `+(t+19)+`L338 `+(t+25)+`Z" fill="#64748b"/><rect x="350" y="`+t+`" width="280" height="38" rx="8" fill="#bbf7d0" stroke="#64748b"/>`+e(490,t+24,r,`svg-ink`,12)}function n(n){return`<div class="dia"><svg viewBox="0 0 640 275" role="img" aria-label="`+n.alt+`">`+e(155,20,n.h1,`svg-accent`,13)+e(490,20,n.h2,`svg-accent`,13)+t(32,n.a1,n.b1)+t(78,n.a2,n.b2)+t(124,n.a3,n.b3)+t(170,n.a4,n.b4)+t(216,n.a5,n.b5)+`</svg><p class="cap">`+n.cap+`</p></div>`}var r=n({alt:`Requirement to WAN design decision map`,h1:`Requirement`,h2:`Design answer`,a1:`Provider SLA and QoS classes`,b1:`MPLS L3VPN`,a2:`Cheap bandwidth and cloud access`,b2:`DIA + overlay VPN`,a3:`Dynamic spoke-to-spoke over internet`,b3:`DMVPN Phase 3`,a4:`Central policy, many transports`,b4:`Catalyst SD-WAN`,a5:`Tunnel-less encryption on private WAN`,b5:`GETVPN`,cap:`The decision map: read the requirement first, then pick the design that satisfies it.`}),i=n({alt:`Requirement se WAN design decision map`,h1:`Requirement`,h2:`Design answer`,a1:`Provider SLA aur QoS classes`,b1:`MPLS L3VPN`,a2:`Sasta bandwidth aur cloud access`,b2:`DIA + overlay VPN`,a3:`Internet par dynamic spoke-to-spoke`,b3:`DMVPN Phase 3`,a4:`Central policy, kai transports`,b4:`Catalyst SD-WAN`,a5:`Private WAN par tunnel-less encryption`,b5:`GETVPN`,cap:`Decision map: pehle requirement padho, phir woh design chuno jo use satisfy kare.`}),a={id:`wan-summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p><b>Summary of the module.</b> You followed six customers: a grocery chain choosing transports, a credit union building DMVPN, a logistics company designing Catalyst SD-WAN, a clinic network adding policy and cloud security, a pharmacy chain planning resilient branches and routing, and a contact centre protecting voice with QoS and multicast. The method was always the same: requirements, constraints, options, trade-offs, chosen design, and what could go wrong.</p>

@@DIA@@

<h3>Can-do checklist</h3>
<ul>
<li>Compare MPLS L3VPN, L2VPN (VPWS, VPLS), metro Ethernet, DIA, broadband, LTE and 5G against availability, cost, SLA and security needs.</li>
<li>Explain underlay versus overlay and why every internet transport needs an overlay.</li>
<li>Choose between DMVPN Phase 1, 2 and 3, GETVPN, FlexVPN and static IPsec, and justify the choice.</li>
<li>Draw a dual-hub dual-cloud DMVPN and explain tunnel MTU, MSS and NAT traversal.</li>
<li>Name the Catalyst SD-WAN components and planes: Manager, Validator, Controller, WAN Edge, OMP, TLOC, colour, templates.</li>
<li>Design controller placement, a Manager cluster and Multi-Region Fabric with access regions, core region and border routers.</li>
<li>Pick control, data, app-route or localized policy for a requirement and set SLA thresholds from baselines.</li>
<li>Design DIA with SASE-style cloud security, Cloud OnRamp for SaaS and IaaS, and dedicated cloud connectivity with VPN backup.</li>
<li>Classify branches as Bronze, Silver or Gold and design FHRP tracking, BFD and failover.</li>
<li>Design BGP edge filtering, route tagging for redistribution and capacity from the 95th percentile.</li>
<li>Build a WAN QoS policy with LLQ, CBWFQ, a hierarchical shaper and provider class mapping.</li>
<li>Choose a multicast approach: provider mVPN, DMVPN hub replication, GETVPN or SD-WAN replicators.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Underlay / overlay</dt><dd>The carrier IP network / the tunnels you build on top.</dd>
<dt>CE / PE</dt><dd>Customer edge router / provider edge router in an MPLS VPN.</dd>
<dt>NHRP</dt><dd>Next Hop Resolution Protocol, the address-resolution service behind DMVPN.</dd>
<dt>GDOI</dt><dd>Group Domain of Interpretation, the key-distribution protocol of GETVPN.</dd>
<dt>OMP</dt><dd>Overlay Management Protocol, the SD-WAN control-plane protocol.</dd>
<dt>TLOC</dt><dd>Transport locator: system IP, colour and encapsulation of a tunnel endpoint.</dd>
<dt>SLA class</dt><dd>A set of loss, latency and jitter limits used by application-aware routing.</dd>
<dt>DIA</dt><dd>Direct Internet Access, local internet breakout at the site.</dd>
<dt>LLQ</dt><dd>Low-latency queue, strict-priority queue for voice.</dd>
<dt>CIR</dt><dd>Committed information rate, the contracted bandwidth.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact to remember</th></tr>
<tr><td>DMVPN Phase 3</td><td>Hub uses <code>ip nhrp redirect</code>, spokes use <code>ip nhrp shortcut</code>; summarization is allowed</td></tr>
<tr><td>DMVPN Phase 2</td><td>Direct spoke-to-spoke, but no summarization and the spoke must stay as next hop</td></tr>
<tr><td>GETVPN</td><td>Tunnel-less, keeps original IP header, needs a private routable WAN, key servers and group members</td></tr>
<tr><td>SD-WAN planes</td><td>Manager management, Validator orchestration, Controller control (OMP), WAN Edge data</td></tr>
<tr><td>Regions</td><td>Access regions plus a core region joined by border routers</td></tr>
<tr><td>Voice limits</td><td>150 ms one-way delay, 30 ms jitter, 1% loss; priority queue under about one third of the link</td></tr>
<tr><td>Shaping</td><td>Shape to the contracted rate before the provider handoff, with a parent/child policy</td></tr>
<tr><td>Redistribution</td><td>At multiple points, tag on entry and deny the tag on re-entry</td></tr>
<tr><td>Capacity</td><td>Use 95th percentile, growth, overhead and failover headroom</td></tr></table>

<h3>Design exercise: Tidewater Retail merger</h3>
<p>Tidewater Retail buys a rival and inherits 90 stores on a second carrier's MPLS, with a different addressing plan and a 6-month deadline. <b>Requirements:</b> one policy, encrypted traffic, no flag day, and a cost cut. <b>Design:</b> deploy SD-WAN edges alongside the legacy MPLS CE routers, bring stores over in waves, use a gateway site where both networks meet, and keep BGP filters and route tags on the boundary so the two routing domains do not leak into each other. Address overlap is solved with NAT at the boundary until the stores renumber.</p>

<div class="warn"><p><b>Common mistake.</b> Memorising products instead of reasoning. The exam gives you a business case with constraints; the right answer is the design that meets the stated requirement at the stated cost and risk.</p></div>
<div class="exam"><p><b>Exam trap.</b> Words like "lowest cost", "highest availability", "must be encrypted", "provider SLA" and "no tunnels" point to specific answers. Underline them in the question before you look at the options.</p></div>

<div class="scn"><h4>Post-mortem: the design that nobody tested</h4><p>A retailer rolled out a beautiful dual-transport design but never tested a failover. On the first real provider outage, the backup tunnels came up, but the firewall at the data centre only allowed IPsec from the old internet addresses, so branches stayed down for two hours. After this, the team added a failure-test plan to every design: pull each link, power each router, and fail each data centre once a quarter.</p><p><b>Lesson:</b> a design is finished when the failure cases are tested, not when the diagram is drawn.</p></div>

<div class="iv"><p class="q">"Describe a WAN design you would propose for 200 branches, and what you would verify before go-live."</p><p>Start with requirements, tier the sites, pick transports with provider and path diversity, choose an overlay (SD-WAN or DMVPN Phase 3), add DIA with cloud security where it helps, apply QoS and capacity from measurements, then verify failover, MTU, routing filters, SLA thresholds and monitoring in a pilot before the full rollout.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design answers come from requirements, constraints and trade-offs, in that order.</li>
<li>Diverse transports, overlays, tiered branches and tested failover give resilience.</li>
<li>SD-WAN centralises policy, SLA path selection and cloud on-ramps; DMVPN and GETVPN remain valid for specific needs.</li>
<li>QoS, shaping, multicast and routing filters are part of the design, not afterthoughts.</li>
<li>Always plan a pilot and a failure-test plan.</li>
</ul></div>
`.replace(`@@DIA@@`,r),hi:`
<p><b>Module ka summary.</b> Aapne chhe customers follow kiye: transports chunta grocery chain, DMVPN banata credit union, Catalyst SD-WAN design karti logistics company, policy aur cloud security jodta clinic network, resilient branches aur routing plan karti pharmacy chain, aur QoS aur multicast se voice protect karta contact centre. Method hamesha wahi raha: requirements, constraints, options, trade-offs, chosen design, aur kya galat ho sakta hai.</p>

@@DIA@@

<h3>Can-do checklist</h3>
<ul>
<li>MPLS L3VPN, L2VPN (VPWS, VPLS), metro Ethernet, DIA, broadband, LTE aur 5G ko availability, cost, SLA aur security needs ke against compare karo.</li>
<li>Underlay versus overlay samjhao aur batao ki har internet transport ko overlay kyun chahiye.</li>
<li>DMVPN Phase 1, 2 aur 3, GETVPN, FlexVPN aur static IPsec mein se chuno aur choice justify karo.</li>
<li>Dual-hub dual-cloud DMVPN draw karo aur tunnel MTU, MSS aur NAT traversal samjhao.</li>
<li>Catalyst SD-WAN components aur planes ke naam batao: Manager, Validator, Controller, WAN Edge, OMP, TLOC, colour, templates.</li>
<li>Controller placement, Manager cluster aur access regions, core region aur border routers wala Multi-Region Fabric design karo.</li>
<li>Requirement ke liye control, data, app-route ya localized policy chuno aur SLA thresholds baselines se set karo.</li>
<li>SASE-style cloud security ke saath DIA, SaaS aur IaaS ke liye Cloud OnRamp, aur VPN backup ke saath dedicated cloud connectivity design karo.</li>
<li>Branches ko Bronze, Silver ya Gold classify karo aur FHRP tracking, BFD aur failover design karo.</li>
<li>BGP edge filtering, redistribution ke liye route tagging aur 95th percentile se capacity design karo.</li>
<li>LLQ, CBWFQ, hierarchical shaper aur provider class mapping ke saath WAN QoS policy banao.</li>
<li>Multicast approach chuno: provider mVPN, DMVPN hub replication, GETVPN ya SD-WAN replicators.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Underlay / overlay</dt><dd>Carrier ka IP network / jo tunnels aap upar banate ho.</dd>
<dt>CE / PE</dt><dd>MPLS VPN mein customer edge router / provider edge router.</dd>
<dt>NHRP</dt><dd>Next Hop Resolution Protocol, DMVPN ke peeche address-resolution service.</dd>
<dt>GDOI</dt><dd>Group Domain of Interpretation, GETVPN ka key-distribution protocol.</dd>
<dt>OMP</dt><dd>Overlay Management Protocol, SD-WAN ka control-plane protocol.</dd>
<dt>TLOC</dt><dd>Transport locator: tunnel endpoint ka system IP, colour aur encapsulation.</dd>
<dt>SLA class</dt><dd>Application-aware routing ke liye loss, latency aur jitter limits ka set.</dd>
<dt>DIA</dt><dd>Direct Internet Access, site par local internet breakout.</dd>
<dt>LLQ</dt><dd>Low-latency queue, voice ke liye strict-priority queue.</dd>
<dt>CIR</dt><dd>Committed information rate, contracted bandwidth.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakhne wala fact</th></tr>
<tr><td>DMVPN Phase 3</td><td>Hub <code>ip nhrp redirect</code>, spokes <code>ip nhrp shortcut</code> use karte hain; summarization allowed</td></tr>
<tr><td>DMVPN Phase 2</td><td>Direct spoke-to-spoke, par summarization nahi aur spoke next hop rehna chahiye</td></tr>
<tr><td>GETVPN</td><td>Tunnel-less, original IP header rakhta hai, private routable WAN, key servers aur group members chahiye</td></tr>
<tr><td>SD-WAN planes</td><td>Manager management, Validator orchestration, Controller control (OMP), WAN Edge data</td></tr>
<tr><td>Regions</td><td>Access regions plus core region, border routers se jude</td></tr>
<tr><td>Voice limits</td><td>150 ms one-way delay, 30 ms jitter, 1% loss; priority queue link ke lagbhag ek tihaai se kam</td></tr>
<tr><td>Shaping</td><td>Provider handoff se pehle contracted rate par shape karo, parent/child policy ke saath</td></tr>
<tr><td>Redistribution</td><td>Multiple points par entry par tag karo aur re-entry par tag deny karo</td></tr>
<tr><td>Capacity</td><td>95th percentile, growth, overhead aur failover headroom use karo</td></tr></table>

<h3>Design exercise: Tidewater Retail merger</h3>
<p>Tidewater Retail ek rival kharidta hai aur doosre carrier ke MPLS par 90 stores inherit karta hai, alag addressing plan aur 6 mahine ki deadline ke saath. <b>Requirements:</b> ek policy, encrypted traffic, flag day nahi, aur cost mein kami. <b>Design:</b> legacy MPLS CE routers ke saath SD-WAN edges lagao, stores ko waves mein laao, jahan dono networks milte hain wahan gateway site use karo, aur boundary par BGP filters aur route tags rakho taaki dono routing domains ek doosre mein leak na hon. Address overlap ko stores renumber hone tak boundary par NAT se solve karo.</p>

<div class="warn"><p><b>Common mistake.</b> Reasoning ke bajaye products rataana. Exam business case aur constraints deta hai; sahi jawab woh design hai jo stated requirement ko stated cost aur risk par meet kare.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Lowest cost", "highest availability", "must be encrypted", "provider SLA" aur "no tunnels" jaise words specific answers ki taraf ishara karte hain. Options dekhne se pehle question mein unhe underline karo.</p></div>

<div class="scn"><h4>Post-mortem: jis design ko kisi ne test nahi kiya</h4><p>Ek retailer ne khoobsurat dual-transport design roll out kiya par failover kabhi test nahi kiya. Pehle real provider outage par backup tunnels up aaye, par data centre ka firewall sirf purane internet addresses se IPsec allow karta tha, isliye branches do ghante down rahe. Iske baad team ne har design mein failure-test plan joda: har link kheencho, har router power off karo, aur har quarter ek baar har data centre fail karo.</p><p><b>Lesson:</b> design tab poora hota hai jab failure cases test ho jaayein, diagram banne par nahi.</p></div>

<div class="iv"><p class="q">"200 branches ke liye WAN design batao, aur go-live se pehle kya verify karoge."</p><p>Requirements se shuru karo, sites ko tier karo, provider aur path diversity ke saath transports chuno, overlay chuno (SD-WAN ya DMVPN Phase 3), jahan fayda ho wahan cloud security ke saath DIA jodo, measurements se QoS aur capacity lagao, phir full rollout se pehle pilot mein failover, MTU, routing filters, SLA thresholds aur monitoring verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design answers requirements, constraints aur trade-offs se aate hain, isi order mein.</li>
<li>Diverse transports, overlays, tiered branches aur tested failover resilience dete hain.</li>
<li>SD-WAN policy, SLA path selection aur cloud on-ramps centralise karta hai; DMVPN aur GETVPN specific needs ke liye valid rehte hain.</li>
<li>QoS, shaping, multicast aur routing filters design ka hissa hain, baad ka khayal nahi.</li>
<li>Hamesha pilot aur failure-test plan rakho.</li>
</ul></div>
`.replace(`@@DIA@@`,i)}};export{a as default};