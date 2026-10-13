var e={id:`big-picture`,h:{en:`The big picture: why a Controller needs policy`,hi:`Big picture: Controller ko policy kyun chahiye`},body:{en:`
<h3>What you will learn</h3>
<ul>
<li>What a policy is in Catalyst SD-WAN and why the overlay behaves as a full mesh when no policy exists.</li>
<li>The policy types (centralized control, centralized data, localized, application-aware routing, plus VPN membership) and where each one runs.</li>
<li>How lists, control policy sequences, topologies, VPN membership and service chaining fit together.</li>
<li>How to activate a policy in the Manager, apply it to sites with a direction, verify it and troubleshoot it.</li>
</ul>
<h3>Prerequisites</h3>
<p>You should know the roles of the Manager, the Controller and the Validator, what a TLOC is (system IP, color, encapsulation), and how OMP carries routes, TLOCs and service routes. These are covered in the architecture and edge modules. Here we use the same lab names: organization BHARAT-RETAIL, Manager 10.255.255.1, Controller 10.255.255.2, Validator 10.255.255.3, and the edges E-DEL-1 (site 100), E-MUM-1 (site 200), E-BLR-1 (site 300) and E-HYD-1 (site 400).</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Controller applies policy to OMP updates">
<rect x="235" y="15" width="170" height="60" rx="10" fill="#bae6fd"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="14">Controller</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">10.255.255.2 (control policy)</text>
<rect x="20" y="170" width="130" height="55" rx="10" fill="#bbf7d0"/><text x="85" y="193" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1</text><text x="85" y="212" text-anchor="middle" class="svg-muted" font-size="12">site 100 (hub)</text>
<rect x="190" y="170" width="130" height="55" rx="10" fill="#bbf7d0"/><text x="255" y="193" text-anchor="middle" class="svg-ink" font-size="13">E-MUM-1</text><text x="255" y="212" text-anchor="middle" class="svg-muted" font-size="12">site 200</text>
<rect x="360" y="170" width="130" height="55" rx="10" fill="#bbf7d0"/><text x="425" y="193" text-anchor="middle" class="svg-ink" font-size="13">E-BLR-1</text><text x="425" y="212" text-anchor="middle" class="svg-muted" font-size="12">site 300</text>
<rect x="520" y="170" width="110" height="55" rx="10" fill="#bbf7d0"/><text x="575" y="193" text-anchor="middle" class="svg-ink" font-size="13">E-HYD-1</text><text x="575" y="212" text-anchor="middle" class="svg-muted" font-size="12">site 400</text>
<path d="M290 75 L100 170 M310 75 L255 170 M335 75 L420 170 M350 75 L560 170" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">OMP routes and TLOCs in, policy decides what goes out</text>
</svg><p class="cap">Edges send OMP updates up. The Controller can change what each edge receives.</p></div>

<h3>An analogy: the airline route desk</h3>
<p>Imagine each branch as an airport that reports which flights it can offer. Without rules, the central route desk tells every airport about every other airport, so passengers can fly anywhere directly. That is the default overlay: every site learns every route and every TLOC, and BFD tunnels form between sites that share a compatible color. A policy is a rule the desk applies before sharing the list: "the Mumbai airport only hears about Delhi", "Bengaluru traffic must stop at the security check first". The desk edits the information; the airports then do the flying.</p>

<h3>What "policy" means here</h3>
<p>In Catalyst SD-WAN a <b>policy</b> is a set of match and action rules built from reusable <b>lists</b>. Policies change one of two things: the <b>control plane</b> (what routes, TLOCs and service routes each edge learns) or the <b>data plane</b> (how packets are forwarded or treated). This module is about the control plane, mainly the <b>centralized control policy</b>, because that is where topology, VPN membership and service chaining live.</p>

<h3>The policy types at a glance</h3>
<table>
<tr><th>Type</th><th>Configured on</th><th>Runs on</th><th>Purpose</th></tr>
<tr><td>Centralized control policy</td><td>Manager, sent to Controller</td><td>Controller only</td><td>Filter or modify routes, TLOCs and service routes (topology, service chaining)</td></tr>
<tr><td>VPN membership policy</td><td>Manager, sent to Controller</td><td>Controller only</td><td>Limit which VPNs a site may receive</td></tr>
<tr><td>Centralized data policy</td><td>Manager, sent to Controller</td><td>Edges (sent over OMP)</td><td>Match packets, then drop, redirect or set a TLOC or service</td></tr>
<tr><td>Application-aware routing policy</td><td>Manager, sent to Controller</td><td>Edges (sent over OMP)</td><td>Choose paths by SLA (loss, latency, jitter)</td></tr>
<tr><td>Localized policy</td><td>Manager, attached to a device</td><td>The edge itself</td><td>Local ACL, QoS, route policy</td></tr>
</table>
<p>The key idea: a <b>control policy never leaves the Controller</b>. It edits OMP updates as the Controller sends them, so the edge only sees the result. Data and application-aware policies are sent to the edges over OMP and enforced in the data path.</p>

<h3>Why the default full mesh is not always wanted</h3>
<p>BHARAT-RETAIL has a data-centre hub at Delhi and three branches. Without policy, Mumbai and Hyderabad build a direct tunnel to each other. If compliance says all inter-branch traffic must be inspected by the hub firewall, the full mesh breaks the rule. A control policy can make branches learn the hub TLOCs only, or can make a branch route point at a firewall service. That is the work of the next chapters.</p>
<pre class="out">E-MUM-1# show sdwan omp tlocs | include 10.255.0
10.255.0.11  mpls          ipsec   C,I,R
10.255.0.11  biz-internet  ipsec   C,I,R
10.255.0.13  biz-internet  ipsec   C,I,R
10.255.0.14  biz-internet  ipsec   C,I,R</pre>
<p>Here, with no policy, Mumbai has learned TLOCs of Delhi, Bengaluru and Hyderabad. After a hub-and-spoke policy only the Delhi lines would remain.</p>

<div class="warn"><p><b>Common mistakes.</b> Thinking a control policy runs on the edge; thinking it affects only one site when it is applied to a list; and forgetting that only one centralized policy can be active at a time.</p></div>
<div class="exam"><p><b>Exam trap.</b> Control policy and VPN membership policy stay on the Controller. Data policy and application-aware routing policy are pushed to the edges. Localized policy is attached to the device by the Manager.</p></div>

<div class="scn"><h4>The compliance audit</h4><p>An auditor at BHARAT-RETAIL asked why Hyderabad store traffic reached Mumbai without passing the data-centre firewall. The network team realised nobody had written a policy: the default mesh let the branches talk directly. They wrote a control policy so that branch routes pointed at the Delhi firewall. The audit passed, and the policy was one file on the Controller, not 80 edge configurations.</p></div>

<div class="iv"><p class="q">"Where does a centralized control policy run, and how does it differ from a data policy?"</p><p>Strong answer: a control policy runs on the Controller and changes the OMP routes, TLOCs and service routes that edges receive; it is never pushed to the edges. A data policy is sent to the edges over OMP and acts on packets in the data path. Mention that both are created in the Manager as a centralized policy and that only one centralized policy can be active.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>With no policy the overlay is a full mesh of routes and TLOCs.</li>
<li>Control policy and VPN membership policy run on the Controller; data and app-route policies run on edges.</li>
<li>Policies are built from lists and match and action sequences.</li>
<li>One centralized policy is active at a time.</li>
</ul></div>
`,hi:`
<h3>Aap kya seekhoge</h3>
<ul>
<li>Catalyst SD-WAN mein policy kya hai aur policy na ho to overlay full mesh jaisa kyun behave karta hai.</li>
<li>Policy types (centralized control, centralized data, localized, application-aware routing, plus VPN membership) aur har ek kahan chalti hai.</li>
<li>Lists, control policy sequences, topologies, VPN membership aur service chaining kaise jude hote hain.</li>
<li>Manager mein policy activate karna, sites par direction ke saath apply karna, verify karna aur troubleshoot karna.</li>
</ul>
<h3>Prerequisites</h3>
<p>Aapko Manager, Controller aur Validator ke roles pata hone chahiye, TLOC kya hai (system IP, color, encapsulation), aur OMP routes, TLOCs aur service routes kaise le jaata hai. Yeh architecture aur edge modules mein cover hai. Yahan wahi lab names use honge: organization BHARAT-RETAIL, Manager 10.255.255.1, Controller 10.255.255.2, Validator 10.255.255.3, aur edges E-DEL-1 (site 100), E-MUM-1 (site 200), E-BLR-1 (site 300) aur E-HYD-1 (site 400).</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Controller OMP updates par policy lagata hai">
<rect x="235" y="15" width="170" height="60" rx="10" fill="#bae6fd"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="14">Controller</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">10.255.255.2 (control policy)</text>
<rect x="20" y="170" width="130" height="55" rx="10" fill="#bbf7d0"/><text x="85" y="193" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1</text><text x="85" y="212" text-anchor="middle" class="svg-muted" font-size="12">site 100 (hub)</text>
<rect x="190" y="170" width="130" height="55" rx="10" fill="#bbf7d0"/><text x="255" y="193" text-anchor="middle" class="svg-ink" font-size="13">E-MUM-1</text><text x="255" y="212" text-anchor="middle" class="svg-muted" font-size="12">site 200</text>
<rect x="360" y="170" width="130" height="55" rx="10" fill="#bbf7d0"/><text x="425" y="193" text-anchor="middle" class="svg-ink" font-size="13">E-BLR-1</text><text x="425" y="212" text-anchor="middle" class="svg-muted" font-size="12">site 300</text>
<rect x="520" y="170" width="110" height="55" rx="10" fill="#bbf7d0"/><text x="575" y="193" text-anchor="middle" class="svg-ink" font-size="13">E-HYD-1</text><text x="575" y="212" text-anchor="middle" class="svg-muted" font-size="12">site 400</text>
<path d="M290 75 L100 170 M310 75 L255 170 M335 75 L420 170 M350 75 L560 170" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">OMP routes aur TLOCs upar, policy tay karti hai kya neeche jaye</text>
</svg><p class="cap">Edges OMP updates upar bhejte hain. Controller badal sakta hai ki har edge ko kya milega.</p></div>

<h3>Ek analogy: airline route desk</h3>
<p>Har branch ko ek airport socho jo batata hai ki woh kaun si flights de sakta hai. Rules ke bina central route desk har airport ko baaki sab airports ke baare mein batata hai, isliye passengers kahin bhi direct ud sakte hain. Yehi default overlay hai: har site har route aur har TLOC seekhti hai, aur compatible color wali sites ke beech BFD tunnels ban jaate hain. Policy ek rule hai jo desk list share karne se pehle lagata hai: "Mumbai airport ko sirf Delhi ke baare mein batao", "Bengaluru traffic pehle security check par rukega". Desk information edit karta hai; udaan airports khud bharte hain.</p>

<h3>Yahan "policy" ka matlab</h3>
<p>Catalyst SD-WAN mein <b>policy</b> match aur action rules ka set hai jo reusable <b>lists</b> se bana hota hai. Policies do cheezein badalti hain: <b>control plane</b> (har edge ko kaun se routes, TLOCs aur service routes milte hain) ya <b>data plane</b> (packets kaise forward ya treat hote hain). Yeh module control plane ke baare mein hai, khaaskar <b>centralized control policy</b>, kyunki topology, VPN membership aur service chaining wahin rehte hain.</p>

<h3>Policy types ek nazar mein</h3>
<table>
<tr><th>Type</th><th>Kahan configure</th><th>Kahan chalti hai</th><th>Maksad</th></tr>
<tr><td>Centralized control policy</td><td>Manager, Controller ko bheji</td><td>Sirf Controller</td><td>Routes, TLOCs aur service routes filter ya modify (topology, service chaining)</td></tr>
<tr><td>VPN membership policy</td><td>Manager, Controller ko bheji</td><td>Sirf Controller</td><td>Limit karo ki site ko kaun se VPNs milein</td></tr>
<tr><td>Centralized data policy</td><td>Manager, Controller ko bheji</td><td>Edges (OMP se bheji)</td><td>Packets match karo, phir drop, redirect ya TLOC ya service set</td></tr>
<tr><td>Application-aware routing policy</td><td>Manager, Controller ko bheji</td><td>Edges (OMP se bheji)</td><td>SLA (loss, latency, jitter) se path chuno</td></tr>
<tr><td>Localized policy</td><td>Manager, device se attach</td><td>Khud edge</td><td>Local ACL, QoS, route policy</td></tr>
</table>
<p>Key idea: <b>control policy kabhi Controller se bahar nahi jaati</b>. Yeh OMP updates ko tab edit karti hai jab Controller unhe bhejta hai, isliye edge ko sirf result dikhta hai. Data aur application-aware policies OMP se edges ko bheji jaati hain aur data path mein enforce hoti hain.</p>

<h3>Default full mesh hamesha kyun nahi chahiye</h3>
<p>BHARAT-RETAIL ka Delhi mein data-centre hub hai aur teen branches. Policy ke bina Mumbai aur Hyderabad ek doosre ke saath direct tunnel banate hain. Agar compliance kehta hai ki saari inter-branch traffic hub firewall se inspect ho, to full mesh rule todta hai. Control policy branches ko sirf hub TLOCs seekhne par majboor kar sakti hai, ya branch route ko firewall service ki taraf point kar sakti hai. Yehi agle chapters ka kaam hai.</p>
<pre class="out">E-MUM-1# show sdwan omp tlocs | include 10.255.0
10.255.0.11  mpls          ipsec   C,I,R
10.255.0.11  biz-internet  ipsec   C,I,R
10.255.0.13  biz-internet  ipsec   C,I,R
10.255.0.14  biz-internet  ipsec   C,I,R</pre>
<p>Yahan, policy ke bina, Mumbai ne Delhi, Bengaluru aur Hyderabad ke TLOCs seekh liye hain. Hub-and-spoke policy ke baad sirf Delhi ki lines bachengi.</p>

<div class="warn"><p><b>Common mistakes.</b> Sochna ki control policy edge par chalti hai; sochna ki list par apply karne se sirf ek site affect hoti hai; aur bhoolna ki ek waqt mein sirf ek centralized policy active ho sakti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Control policy aur VPN membership policy Controller par rehti hain. Data policy aur application-aware routing policy edges ko push hoti hain. Localized policy Manager device se attach karta hai.</p></div>

<div class="scn"><h4>Compliance audit</h4><p>BHARAT-RETAIL ke auditor ne poocha ki Hyderabad store ki traffic data-centre firewall se guzre bina Mumbai kaise pahunchi. Network team ko samajh aaya ki kisi ne policy likhi hi nahi thi: default mesh ne branches ko direct baat karne di. Unhone control policy likhi jisse branch routes Delhi firewall ki taraf point kare. Audit pass hua, aur policy Controller par ek file thi, 80 edge configurations nahi.</p></div>

<div class="iv"><p class="q">"Centralized control policy kahan chalti hai, aur data policy se kaise alag hai?"</p><p>Strong answer: control policy Controller par chalti hai aur woh OMP routes, TLOCs aur service routes badalti hai jo edges ko milte hain; woh edges ko push nahi hoti. Data policy OMP se edges ko bheji jaati hai aur data path mein packets par kaam karti hai. Batao ki dono Manager mein centralized policy ke roop mein banti hain aur ek waqt mein sirf ek centralized policy active hoti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy na ho to overlay routes aur TLOCs ka full mesh hota hai.</li>
<li>Control policy aur VPN membership policy Controller par chalti hain; data aur app-route policies edges par.</li>
<li>Policies lists aur match-action sequences se bani hoti hain.</li>
<li>Ek waqt mein ek centralized policy active hoti hai.</li>
</ul></div>
`}};export{e as default};