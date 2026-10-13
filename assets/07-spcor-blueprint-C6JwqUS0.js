var e={id:`spcor-blueprint`,h:{en:`The SPCOR 350-501 exam: how the domains fit together`,hi:`SPCOR 350-501 exam: domains aapas mein kaise jude hain`},body:{en:`
<p><b>SPCOR 350-501</b>, "Implementing and Operating Cisco Service Provider Network Core Technologies", is the core exam of the <b>CCNP Service Provider</b> track. A CCNP Service Provider certification needs this core exam plus one concentration exam of your choice (for example SPRI 300-510 for advanced routing, SPVI 300-515 for VPN services, or SPAUTO 300-535 for automation). Passing the core exam alone also earns the Cisco Certified Specialist - Service Provider Core certificate. The core exam is a timed test of about two hours, with multiple choice, drag-and-drop and simulation-style questions.</p>
<div class="note"><p><b>Always check the official blueprint.</b> Cisco revises the exam topics and the percentage weight of each domain from time to time. Treat the table below as a map of ideas, not as a copy of the weights. Download the current exam topics document from Cisco before you book.</p></div>

<h3>One picture: how the topics connect</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="SPCOR topic map">
<rect x="20" y="20" width="600" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Architecture and operations: design, IOS XE and XR, NFV, automation, telemetry, security</text>
<rect x="20" y="75" width="600" height="40" rx="8" fill="#fde68a"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">Services: L3VPN, L2VPN (pseudowire, VPLS, EVPN), IPv6 transition, QoS</text>
<rect x="20" y="130" width="600" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">Transport: MPLS and LDP, RSVP-TE, segment routing, fast reroute, BFD</text>
<rect x="20" y="185" width="290" height="40" rx="8" fill="#bae6fd"/><text x="165" y="210" text-anchor="middle" class="svg-ink" font-size="13">BGP: iBGP, RR, policy, scaling</text>
<rect x="330" y="185" width="290" height="40" rx="8" fill="#bae6fd"/><text x="475" y="210" text-anchor="middle" class="svg-ink" font-size="13">IGP: IS-IS and OSPF</text>
<text x="320" y="248" text-anchor="middle" class="svg-muted" font-size="12">Each layer stands on the one below it: no IGP, no LDP; no LSP, no VPN</text>
</svg><p class="cap">Layers of the exam. A fault in the lower layers shows up as a service symptom above.</p></div>

<h3>Topic areas and where you study them in this course</h3>
<table class="cmp"><tr><th>Topic area</th><th>What it asks you to do</th><th>Module</th></tr>
<tr><td>Architecture</td><td>Describe access, aggregation and core; IOS, IOS XE, IOS XR differences; NFV</td><td>spcor-arch</td></tr>
<tr><td>IS-IS</td><td>Configure and troubleshoot levels, areas, metrics, leaking, redistribution</td><td>spcor-isis, spcor-isis-design</td></tr>
<tr><td>MPLS and LDP</td><td>Configure LDP, read label tables, IGP-LDP sync</td><td>spcor-mpls-ldp</td></tr>
<tr><td>BGP</td><td>iBGP, route reflectors, attributes, policy, scaling features</td><td>spcor-bgp</td></tr>
<tr><td>Traffic engineering and segment routing</td><td>RSVP-TE, SR-MPLS, TI-LFA, SR-TE, intro to SRv6</td><td>spcor-te, spcor-sr</td></tr>
<tr><td>VPN services</td><td>L3VPN, L2VPN, EVPN</td><td>spcor-l3vpn, spcor-l2vpn</td></tr>
<tr><td>High availability</td><td>BFD, NSF, NSR, link aggregation</td><td>spcor-ha</td></tr>
<tr><td>IPv6 transition</td><td>NAT64, CGNAT, MAP-T, DS-Lite</td><td>spcor-ipv6-transition</td></tr>
<tr><td>Security</td><td>GTSM, routing authentication, RTBH, flowspec</td><td>spcor-sp-security</td></tr>
<tr><td>Automation and assurance</td><td>Model-driven telemetry, NSO, zero-touch provisioning</td><td>spcor-telemetry</td></tr></table>

<h3>A sensible study order</h3>
<ol>
<li><b>This module</b> (the whole picture, free).</li>
<li><b>spcor-arch</b> to fix the vocabulary.</li>
<li><b>spcor-isis</b>, then <b>spcor-isis-design</b>: the IGP, because everything else depends on loopback reachability.</li>
<li><b>spcor-mpls-ldp</b> and <b>spcor-bgp</b>: labels and customer routes.</li>
<li><b>spcor-l3vpn</b> and <b>spcor-l2vpn</b>: services built from the first four.</li>
<li><b>spcor-te</b>, <b>spcor-sr</b> and <b>spcor-ha</b>: steering and protection.</li>
<li>The rest (security, IPv6 transition, telemetry), then mock questions and the labs again.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> A question says: "A PE shows a VPNv4 route in its VRF but pings across the VPN fail." Three layers could be at fault. Services: route targets are right because the route is there. BGP: the next hop is the remote PE loopback. Transport: is there an LSP to that loopback? The fault is almost always in the layer below the symptom, so you check LDP and the IGP route to the loopback next. Knowing the dependency order lets you answer without remembering the exact scenario.</p></div>

<div class="warn"><p><b>Common mistake.</b> Studying topics as isolated lists. SPCOR rewards understanding of dependencies: IGP, then LDP, then BGP/VPN. Candidates who memorise commands but cannot trace a failure down the layers struggle with the scenario questions.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam covers IOS XE, IOS XR and sometimes Junos-style concepts at the level of "what is different". Know the key differences, for example XR uses commit and a two-stage configuration, and IS-IS is configured inside <code>router isis</code> with <code>address-family</code> sections.</p></div>

<div class="scn"><h4>Studying in the wrong order</h4><p>A candidate spent three weeks on EVPN and segment routing and then failed a question about why an IS-IS adjacency did not form. He had never practised the IGP. After redoing IS-IS and LDP labs in order, the VPN and SR topics became easier because he could see what they were built on.</p><p><b>Lesson:</b> study bottom-up, practise every layer in the lab, and revisit the foundation often.</p></div>

<div class="iv"><p class="q">"Which SP technologies have you worked with, and how do they depend on each other?"</p><p>Answer in layers: IGP for loopback reachability, LDP or SR for the label path, BGP for customer and VPN routes, VPN services on top. Then give one failure example, such as "if LDP does not form, VPN routes exist but traffic fails". This shows you understand the system rather than isolated commands.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SPCOR 350-501 is the core exam of CCNP Service Provider; one concentration exam completes it.</li>
<li>Check Cisco's current blueprint for exact domains and weights.</li>
<li>Topics are layered: IGP, MPLS or SR, BGP, then VPN services.</li>
<li>Study bottom-up and practise each layer in the labs.</li>
<li>Operations topics: security, automation, telemetry and high availability.</li>
</ul></div>
`,hi:`
<p><b>SPCOR 350-501</b>, "Implementing and Operating Cisco Service Provider Network Core Technologies", <b>CCNP Service Provider</b> track ka core exam hai. CCNP Service Provider certification ke liye yeh core exam aur apni pasand ka ek concentration exam chahiye (jaise advanced routing ke liye SPRI 300-510, VPN services ke liye SPVI 300-515, ya automation ke liye SPAUTO 300-535). Sirf core exam pass karne par bhi Cisco Certified Specialist - Service Provider Core certificate milta hai. Core exam lagbhag do ghante ka timed test hai, jisme multiple choice, drag-and-drop aur simulation-style questions hote hain.</p>
<div class="note"><p><b>Hamesha official blueprint check karo.</b> Cisco waqt-waqt par exam topics aur har domain ka percentage weight badalta rehta hai. Neeche ki table ko ideas ka map samjho, weights ki copy nahi. Book karne se pehle Cisco se current exam topics document download karo.</p></div>

<h3>Ek picture: topics kaise jude hain</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="SPCOR topic map">
<rect x="20" y="20" width="600" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Architecture aur operations: design, IOS XE aur XR, NFV, automation, telemetry, security</text>
<rect x="20" y="75" width="600" height="40" rx="8" fill="#fde68a"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">Services: L3VPN, L2VPN (pseudowire, VPLS, EVPN), IPv6 transition, QoS</text>
<rect x="20" y="130" width="600" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">Transport: MPLS aur LDP, RSVP-TE, segment routing, fast reroute, BFD</text>
<rect x="20" y="185" width="290" height="40" rx="8" fill="#bae6fd"/><text x="165" y="210" text-anchor="middle" class="svg-ink" font-size="13">BGP: iBGP, RR, policy, scaling</text>
<rect x="330" y="185" width="290" height="40" rx="8" fill="#bae6fd"/><text x="475" y="210" text-anchor="middle" class="svg-ink" font-size="13">IGP: IS-IS aur OSPF</text>
<text x="320" y="248" text-anchor="middle" class="svg-muted" font-size="12">Har layer neeche wali par khadi hai: IGP nahi to LDP nahi; LSP nahi to VPN nahi</text>
</svg><p class="cap">Exam ki layers. Neeche ki layers ka fault upar service symptom ki tarah dikhta hai.</p></div>

<h3>Topic areas aur is course mein kahan padhoge</h3>
<table class="cmp"><tr><th>Topic area</th><th>Aapse kya karne ko kehta hai</th><th>Module</th></tr>
<tr><td>Architecture</td><td>Access, aggregation, core; IOS, IOS XE, IOS XR differences; NFV describe karna</td><td>spcor-arch</td></tr>
<tr><td>IS-IS</td><td>Levels, areas, metrics, leaking, redistribution configure aur troubleshoot karna</td><td>spcor-isis, spcor-isis-design</td></tr>
<tr><td>MPLS aur LDP</td><td>LDP configure karna, label tables padhna, IGP-LDP sync</td><td>spcor-mpls-ldp</td></tr>
<tr><td>BGP</td><td>iBGP, route reflectors, attributes, policy, scaling features</td><td>spcor-bgp</td></tr>
<tr><td>Traffic engineering aur segment routing</td><td>RSVP-TE, SR-MPLS, TI-LFA, SR-TE, SRv6 ka parichay</td><td>spcor-te, spcor-sr</td></tr>
<tr><td>VPN services</td><td>L3VPN, L2VPN, EVPN</td><td>spcor-l3vpn, spcor-l2vpn</td></tr>
<tr><td>High availability</td><td>BFD, NSF, NSR, link aggregation</td><td>spcor-ha</td></tr>
<tr><td>IPv6 transition</td><td>NAT64, CGNAT, MAP-T, DS-Lite</td><td>spcor-ipv6-transition</td></tr>
<tr><td>Security</td><td>GTSM, routing authentication, RTBH, flowspec</td><td>spcor-sp-security</td></tr>
<tr><td>Automation aur assurance</td><td>Model-driven telemetry, NSO, zero-touch provisioning</td><td>spcor-telemetry</td></tr></table>

<h3>Sahi study order</h3>
<ol>
<li><b>Yeh module</b> (poori picture, free).</li>
<li><b>spcor-arch</b> vocabulary pakki karne ke liye.</li>
<li><b>spcor-isis</b>, phir <b>spcor-isis-design</b>: IGP, kyunki baaki sab loopback reachability par depend karta hai.</li>
<li><b>spcor-mpls-ldp</b> aur <b>spcor-bgp</b>: labels aur customer routes.</li>
<li><b>spcor-l3vpn</b> aur <b>spcor-l2vpn</b>: pehle chaar se bani services.</li>
<li><b>spcor-te</b>, <b>spcor-sr</b> aur <b>spcor-ha</b>: steering aur protection.</li>
<li>Baaki (security, IPv6 transition, telemetry), phir mock questions aur labs dobara.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Sawal kehta hai: "PE ke VRF mein VPNv4 route dikhta hai par VPN ke across ping fail hota hai." Teen layers fault ho sakti hain. Services: route targets sahi hain kyunki route hai. BGP: next hop remote PE loopback hai. Transport: kya us loopback tak LSP hai? Fault lagbhag hamesha symptom se neeche ki layer mein hota hai, isliye agla check LDP aur loopback ka IGP route hai. Dependency order jaanne se aap exact scenario yaad kiye bina jawab de sakte ho.</p></div>

<div class="warn"><p><b>Common mistake.</b> Topics ko alag-alag lists ki tarah padhna. SPCOR dependencies samajhne ko reward karta hai: IGP, phir LDP, phir BGP/VPN. Jo candidates commands ratte hain par failure ko layers mein neeche trace nahi kar paate, unhe scenario questions mushkil lagte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam IOS XE, IOS XR aur kabhi-kabhi Junos-style concepts ko "kya alag hai" ke level par cover karta hai. Key differences jaano, jaise XR commit aur two-stage configuration use karta hai, aur IS-IS <code>router isis</code> ke andar <code>address-family</code> sections ke saath configure hota hai.</p></div>

<div class="scn"><h4>Galat order mein padhai</h4><p>Ek candidate ne teen hafte EVPN aur segment routing par lagaye aur phir IS-IS adjacency kyun nahi bani, is sawal par fail ho gaya. Usne IGP kabhi practise hi nahi kiya tha. IS-IS aur LDP labs order mein dobara karne ke baad VPN aur SR topics aasaan lage kyunki ab use dikhta tha ki woh kis par bane hain.</p><p><b>Lesson:</b> bottom-up padho, har layer lab mein practise karo, aur foundation baar-baar revisit karo.</p></div>

<div class="iv"><p class="q">"Aapne kaunsi SP technologies par kaam kiya hai, aur woh ek doosre par kaise depend karti hain?"</p><p>Layers mein jawab do: loopback reachability ke liye IGP, label path ke liye LDP ya SR, customer aur VPN routes ke liye BGP, upar VPN services. Phir ek failure example do, jaise "LDP na bane to VPN routes hote hain par traffic fail hota hai". Isse dikhta hai ki aap system samajhte ho, alag-alag commands nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SPCOR 350-501 CCNP Service Provider ka core exam hai; ek concentration exam use poora karta hai.</li>
<li>Exact domains aur weights ke liye Cisco ka current blueprint check karo.</li>
<li>Topics layered hain: IGP, MPLS ya SR, BGP, phir VPN services.</li>
<li>Bottom-up padho aur har layer labs mein practise karo.</li>
<li>Operations topics: security, automation, telemetry aur high availability.</li>
</ul></div>
`}};export{e as default};