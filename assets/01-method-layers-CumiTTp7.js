var e={id:`method-layers`,h:{en:`The troubleshooting method: eight layers, scope and evidence`,hi:`Troubleshooting method: aath layers, scope aur evidence`},body:{en:`
<p>Imagine a tap in your kitchen gives no water. A good plumber does not start by replacing the tap. She asks: is it only this tap or every tap? Is the street supply on? Is the main valve open? Is the pipe blocked? She works from the source toward the tap and stops at the first thing that is broken. Troubleshooting Catalyst SD-WAN is the same. A site is "down" and a dozen things could be wrong, but they sit in a fixed order, and the order saves hours.</p>

<h3>What you will learn in this module</h3>
<ul>
<li>A layered method that works for any SD-WAN fault, and the first three questions to ask.</li>
<li>The exact <code>show</code> commands for each layer, on the edge and on the controllers.</li>
<li>How to read connection-history error codes, certificate and clock faults, NAT and colour problems.</li>
<li>How to find OMP, BFD, template, policy, DIA and application faults, and how to use packet trace and captures.</li>
<li>Seven realistic tickets to practise. The hands-on troubleshooting labs of this track use the same method; this module gives you the thinking and the commands, not a lab walk-through.</li>
</ul>
<p>It builds on the six-step order introduced in the sdw-edge module and the operations toolbox of sdw-ops. Here we extend that order to the whole network and add depth for each step.</p>

<h3>The eight layers</h3>
<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="Eight troubleshooting layers">
<rect x="150" y="10" width="340" height="30" rx="6" fill="#fbcfe8"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">8 Application and user experience</text>
<rect x="150" y="46" width="340" height="30" rx="6" fill="#fed7aa"/><text x="320" y="66" text-anchor="middle" class="svg-ink" font-size="13">7 NAT, DIA and service-side routing</text>
<rect x="150" y="82" width="340" height="30" rx="6" fill="#fde68a"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">6 Policy: centralized and localized</text>
<rect x="150" y="118" width="340" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="13">5 Templates and configuration</text>
<rect x="150" y="154" width="340" height="30" rx="6" fill="#a7f3d0"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="13">4 BFD and the data plane tunnels</text>
<rect x="150" y="190" width="340" height="30" rx="6" fill="#bae6fd"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">3 OMP routes and TLOCs</text>
<rect x="150" y="226" width="340" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="246" text-anchor="middle" class="svg-ink" font-size="13">2 Control connections, certificates, clock</text>
<rect x="150" y="262" width="340" height="30" rx="6" fill="#e9d5ff"/><text x="320" y="282" text-anchor="middle" class="svg-ink" font-size="13">1 Underlay: link, address, route, firewall</text>
<text x="320" y="318" text-anchor="middle" class="svg-accent" font-size="13">Start at the bottom. Do not go up until the layer below is healthy.</text>
<text x="60" y="160" text-anchor="middle" class="svg-muted" font-size="11">upper layers</text><text x="60" y="176" text-anchor="middle" class="svg-muted" font-size="11">depend on</text><text x="60" y="192" text-anchor="middle" class="svg-muted" font-size="11">lower ones</text>
</svg><p class="cap">Layers 1 to 3 are the control plane, 4 is the data plane, 5 and 6 are what the Manager and policy put on top, 7 and 8 are what the user feels.</p></div>

<p>Why this order? A tunnel (layer 4) cannot be built without OMP routes and TLOCs (layer 3), which need a control connection (layer 2), which needs an underlay path (layer 1). If you check policy first while the control connection is down, you waste time on something that cannot work yet.</p>

<h3>The three scope questions</h3>
<p>Before touching any device, narrow the problem with three questions. They usually point to the layer.</p>
<table class="cmp"><tr><th>Question</th><th>If the answer is</th><th>Then suspect</th></tr>
<tr><td>How many sites?</td><td>One site only</td><td>That site's circuit, device, template or certificate</td></tr>
<tr><td></td><td>Many sites at once</td><td>A shared thing: a Controller, a policy, the Manager, a provider, a change</td></tr>
<tr><td>How many applications or VPNs?</td><td>One application</td><td>Policy, application classification, the server, DNS</td></tr>
<tr><td></td><td>Everything in a VPN</td><td>Routes, tunnels, VPN mapping</td></tr>
<tr><td>Since when and what changed?</td><td>Right after a change</td><td>Audit log, last template push, last policy activation, upgrade</td></tr>
<tr><td></td><td>Slowly worse, intermittent</td><td>Circuit quality, MTU, BFD flaps, capacity</td></tr></table>

<h3>The ten-minute triage</h3>
<ol>
<li><b>Define the symptom in one sentence</b>: "Users at Pune (E-BLR-1, site 300) cannot reach the ERP at 10.1.10.50 since 09:15".</li>
<li><b>Scope it</b> with the three questions above. Look at the Manager overview and the device's page (sdw-ops chapter 2).</li>
<li><b>Check recent changes</b> in the audit log and the task history. A change in the last hour is a prime suspect.</li>
<li><b>Walk up the layers</b> on the affected edge: reachability, control connections, OMP, BFD, then the service VPN.</li>
<li><b>Compare with a healthy site</b> doing the same job (for example E-MUM-1 with E-BLR-1). The difference is often the answer.</li>
<li><b>Change one thing</b>, then re-read the same output, and write down what you did.</li>
</ol>

<h3>The commands on one page</h3>
<table class="cmp"><tr><th>Layer</th><th>Edge command</th><th>What a good answer looks like</th></tr>
<tr><td>1 Underlay</td><td><code>show ip interface brief</code>, <code>show ip route</code>, <code>ping 198.51.100.30</code></td><td>WAN interface up/up, default route, Validator reachable</td></tr>
<tr><td>2 Control</td><td><code>show sdwan control connections</code>, <code>show sdwan control local-properties</code>, <code>show sdwan control connection-history</code></td><td>Validator, Controller and Manager in state up on each transport</td></tr>
<tr><td>3 OMP</td><td><code>show sdwan omp summary</code>, <code>show sdwan omp routes</code>, <code>show sdwan omp tlocs</code></td><td>oper-state UP; routes received and installed; TLOCs of every remote site</td></tr>
<tr><td>4 Data plane</td><td><code>show sdwan bfd sessions</code>, <code>show sdwan bfd summary</code></td><td>The number of sessions you expect, state up, few transitions</td></tr>
<tr><td>5 Template</td><td>Manager task and config diff; <code>show sdwan running-config</code></td><td>Device in sync, push succeeded</td></tr>
<tr><td>6 Policy</td><td><code>show sdwan policy from-vsmart</code></td><td>The policy you expect is present with the right sites and direction</td></tr>
<tr><td>7 NAT and DIA</td><td><code>show ip route vrf 10</code>, <code>show ip nat translations</code></td><td>Default route in the service VPN, translations created</td></tr>
<tr><td>8 Application</td><td><code>show sdwan app-route stats</code>, <code>show policy-map interface</code></td><td>Loss, latency and jitter inside the SLA; no drops in the voice queue</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ticket: "Mumbai cannot reach the ERP." Scope: only E-MUM-1 (site 200); Delhi and Bengaluru are fine; so it is Mumbai-specific. Changes: none in the audit log. Layer 1: ping to the Validator works. Layer 2: both transports show up. Layer 3: <code>show sdwan omp summary</code> shows routes-received 0. The edge is connected but receives no routes, so the fault is at layer 3 or at the policy that filters routes (layer 6): the next chapters show exactly how to tell which. We found the layer in four commands and 90 seconds.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Jumping to the layer you know best, often policy. (2) Rebooting before reading the error. (3) Testing from the wrong VPN. (4) Changing several settings at once. (5) Never comparing with a healthy site. (6) Fixing the symptom and not recording the cause.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions give one symptom and one output and ask for the next step or the layer. "No control connection" is layers 1 and 2. "Control up, no routes" is layer 3 or policy. "Routes present, tunnel down" is layer 4. Match the symptom to the lowest failing layer.</p></div>

<div class="scn"><h4>The "everything is down" call</h4><p>At 08:05, 40 branches of Bharat Retail reported problems at once. The junior engineer started opening branches one by one. The senior engineer asked the first scope question: many sites, so something shared. The audit log showed that a centralized policy had been activated at 08:01. Deactivating it at 08:12 restored the sites. One question saved 40 investigations.</p><p><b>Lesson:</b> many sites at once means a shared cause; check changes first.</p></div>

<div class="iv"><p class="q">"Where do you start when a branch is down?"</p><p>I scope it first: one site or many, one application or all, and what changed. Then I walk the layers from the bottom: underlay reachability, control connections and their error codes, OMP routes and TLOCs, BFD sessions, then template, policy, NAT and the application. I compare with a healthy site, change one thing at a time and document the cause.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work from the bottom layer up; stop at the first failure.</li>
<li>Scope with three questions: how many sites, how many applications, what changed.</li>
<li>Compare with a healthy site and read the exact output before changing anything.</li>
<li>Many sites at once means a shared cause such as a policy, Controller or provider.</li>
<li>Change one thing at a time and record it.</li>
</ul></div>
`,hi:`
<p>Socho aapke kitchen ka nal paani nahi de raha. Achha plumber nal badalne se shuru nahi karta. Woh poochhti hai: sirf yahi nal ya sab nal? Street ki supply on hai? Main valve khula hai? Pipe block hai? Woh source se nal ki taraf kaam karti hai aur pehli toot-ti cheez par ruk jaati hai. Catalyst SD-WAN troubleshooting bhi waisa hi hai. Ek site "down" hai aur dozen cheezein galat ho sakti hain, lekin woh ek fixed order mein hain, aur order se ghante bachte hain.</p>

<h3>Is module mein aap kya seekhoge</h3>
<ul>
<li>Layered method jo kisi bhi SD-WAN fault par chalta hai, aur pehle teen sawal.</li>
<li>Har layer ke exact <code>show</code> commands, edge aur controllers par.</li>
<li>Connection-history error codes, certificate aur clock faults, NAT aur colour problems kaise padhein.</li>
<li>OMP, BFD, template, policy, DIA aur application faults kaise dhoondhein, aur packet trace aur captures kaise use karein.</li>
<li>Practice ke liye saat realistic tickets. Is track ke hands-on troubleshooting labs yahi method use karte hain; yeh module aapko soch aur commands deta hai, lab walk-through nahi.</li>
</ul>
<p>Yeh sdw-edge module ke chhe-step order aur sdw-ops ke operations toolbox par bana hai. Yahan hum us order ko poore network tak badhate hain aur har step mein gehrai jodte hain.</p>

<h3>Aath layers</h3>
<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="Eight troubleshooting layers">
<rect x="150" y="10" width="340" height="30" rx="6" fill="#fbcfe8"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">8 Application aur user experience</text>
<rect x="150" y="46" width="340" height="30" rx="6" fill="#fed7aa"/><text x="320" y="66" text-anchor="middle" class="svg-ink" font-size="13">7 NAT, DIA aur service-side routing</text>
<rect x="150" y="82" width="340" height="30" rx="6" fill="#fde68a"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">6 Policy: centralized aur localized</text>
<rect x="150" y="118" width="340" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="13">5 Templates aur configuration</text>
<rect x="150" y="154" width="340" height="30" rx="6" fill="#a7f3d0"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="13">4 BFD aur data plane tunnels</text>
<rect x="150" y="190" width="340" height="30" rx="6" fill="#bae6fd"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">3 OMP routes aur TLOCs</text>
<rect x="150" y="226" width="340" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="246" text-anchor="middle" class="svg-ink" font-size="13">2 Control connections, certificates, clock</text>
<rect x="150" y="262" width="340" height="30" rx="6" fill="#e9d5ff"/><text x="320" y="282" text-anchor="middle" class="svg-ink" font-size="13">1 Underlay: link, address, route, firewall</text>
<text x="320" y="318" text-anchor="middle" class="svg-accent" font-size="13">Neeche se shuru karo. Neeche wali layer theek hone tak upar mat jao.</text>
<text x="60" y="160" text-anchor="middle" class="svg-muted" font-size="11">upar ki layers</text><text x="60" y="176" text-anchor="middle" class="svg-muted" font-size="11">neeche wali</text><text x="60" y="192" text-anchor="middle" class="svg-muted" font-size="11">par nirbhar</text>
</svg><p class="cap">Layers 1 se 3 control plane hain, 4 data plane hai, 5 aur 6 Manager aur policy upar se lagate hain, 7 aur 8 woh hain jo user mehsoos karta hai.</p></div>

<p>Yeh order kyun? Tunnel (layer 4) OMP routes aur TLOCs (layer 3) ke bina nahi bante, jinhe control connection (layer 2) chahiye, jise underlay path (layer 1) chahiye. Agar control connection down hai aur aap pehle policy dekhte ho to aap aisi cheez par samay bigaadte ho jo abhi kaam hi nahi kar sakti.</p>

<h3>Teen scope sawal</h3>
<p>Kisi device ko chhune se pehle teen sawalon se problem chhoti karo. Yeh aksar layer batate hain.</p>
<table class="cmp"><tr><th>Sawal</th><th>Jawab agar</th><th>To shak karo</th></tr>
<tr><td>Kitni sites?</td><td>Sirf ek site</td><td>Us site ka circuit, device, template ya certificate</td></tr>
<tr><td></td><td>Ek saath bahut sites</td><td>Shared cheez: Controller, policy, Manager, provider, change</td></tr>
<tr><td>Kitni applications ya VPNs?</td><td>Ek application</td><td>Policy, application classification, server, DNS</td></tr>
<tr><td></td><td>VPN ki sab cheezein</td><td>Routes, tunnels, VPN mapping</td></tr>
<tr><td>Kab se aur kya badla?</td><td>Change ke turant baad</td><td>Audit log, aakhri template push, aakhri policy activation, upgrade</td></tr>
<tr><td></td><td>Dheere-dheere kharab, kabhi-kabhi</td><td>Circuit quality, MTU, BFD flaps, capacity</td></tr></table>

<h3>Das-minute triage</h3>
<ol>
<li><b>Symptom ek line mein likho</b>: "Pune (E-BLR-1, site 300) ke users 09:15 se ERP 10.1.10.50 tak nahi pahunch pa rahe".</li>
<li>Upar ke teen sawalon se <b>scope karo</b>. Manager overview aur device ka page dekho (sdw-ops chapter 2).</li>
<li>Audit log aur task history mein <b>haal ke changes</b> dekho. Pichhle ghante ka change sabse bada shak hai.</li>
<li>Affected edge par <b>layers upar chadho</b>: reachability, control connections, OMP, BFD, phir service VPN.</li>
<li>Wahi kaam karne wali <b>healthy site se compare karo</b> (jaise E-MUM-1 ko E-BLR-1 se). Fark aksar jawab hota hai.</li>
<li><b>Ek cheez badlo</b>, wahi output dobara padho, aur jo kiya likh lo.</li>
</ol>

<h3>Ek page par commands</h3>
<table class="cmp"><tr><th>Layer</th><th>Edge command</th><th>Achha jawab kaisa dikhta hai</th></tr>
<tr><td>1 Underlay</td><td><code>show ip interface brief</code>, <code>show ip route</code>, <code>ping 198.51.100.30</code></td><td>WAN interface up/up, default route, Validator reachable</td></tr>
<tr><td>2 Control</td><td><code>show sdwan control connections</code>, <code>show sdwan control local-properties</code>, <code>show sdwan control connection-history</code></td><td>Har transport par Validator, Controller aur Manager state up</td></tr>
<tr><td>3 OMP</td><td><code>show sdwan omp summary</code>, <code>show sdwan omp routes</code>, <code>show sdwan omp tlocs</code></td><td>oper-state UP; routes received aur installed; har remote site ke TLOCs</td></tr>
<tr><td>4 Data plane</td><td><code>show sdwan bfd sessions</code>, <code>show sdwan bfd summary</code></td><td>Jitne sessions expected, state up, kam transitions</td></tr>
<tr><td>5 Template</td><td>Manager task aur config diff; <code>show sdwan running-config</code></td><td>Device in sync, push successful</td></tr>
<tr><td>6 Policy</td><td><code>show sdwan policy from-vsmart</code></td><td>Expected policy sahi sites aur direction ke saath maujood</td></tr>
<tr><td>7 NAT aur DIA</td><td><code>show ip route vrf 10</code>, <code>show ip nat translations</code></td><td>Service VPN mein default route, translations ban rahe</td></tr>
<tr><td>8 Application</td><td><code>show sdwan app-route stats</code>, <code>show policy-map interface</code></td><td>Loss, latency, jitter SLA ke andar; voice queue mein drops nahi</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ticket: "Mumbai ERP tak nahi pahunch pa raha." Scope: sirf E-MUM-1 (site 200); Delhi aur Bengaluru theek; yaani Mumbai-specific. Changes: audit log mein koi nahi. Layer 1: Validator tak ping chalta hai. Layer 2: dono transports up. Layer 3: <code>show sdwan omp summary</code> routes-received 0 dikhata hai. Edge connected hai lekin routes nahi mil rahe, isliye fault layer 3 ya routes filter karne wali policy (layer 6) mein hai: agle chapters exactly batate hain ki kaise pata chalega. Layer chaar commands aur 90 second mein mil gayi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Us layer par kood jaana jo aap behtar jaante ho, aksar policy. (2) Error padhne se pehle reboot. (3) Galat VPN se test. (4) Kai settings ek saath badalna. (5) Healthy site se kabhi compare nahi karna. (6) Symptom theek karna aur wajah record nahi karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Sawal ek symptom aur ek output dete hain aur agla step ya layer poochte hain. "Control connection nahi" matlab layers 1 aur 2. "Control up, routes nahi" matlab layer 3 ya policy. "Routes hain, tunnel down" matlab layer 4. Symptom ko sabse neeche ki failing layer se milao.</p></div>

<div class="scn"><h4>"Sab kuch down hai" wala call</h4><p>08:05 par Bharat Retail ki 40 branches ne ek saath problem batayi. Junior engineer ek-ek branch kholne lagi. Senior engineer ne pehla scope sawal poochha: bahut sites, yaani kuch shared. Audit log ne dikhaya ki 08:01 par ek centralized policy activate hui thi. 08:12 par use deactivate karne se sites theek ho gayi. Ek sawal ne 40 investigations bacha liye.</p><p><b>Lesson:</b> ek saath bahut sites matlab shared wajah; pehle changes dekho.</p></div>

<div class="iv"><p class="q">"Branch down ho to kahan se shuru karoge?"</p><p>Pehle scope: ek site ya bahut, ek application ya sab, aur kya badla. Phir neeche se layers: underlay reachability, control connections aur unke error codes, OMP routes aur TLOCs, BFD sessions, phir template, policy, NAT aur application. Healthy site se compare karta hoon, ek waqt mein ek cheez badalta hoon aur wajah document karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Neeche ki layer se upar jao; pehli failure par ruko.</li>
<li>Teen sawal se scope: kitni sites, kitni applications, kya badla.</li>
<li>Kuch badalne se pehle healthy site se compare karo aur exact output padho.</li>
<li>Ek saath bahut sites matlab shared wajah jaise policy, Controller ya provider.</li>
<li>Ek waqt mein ek cheez badlo aur record karo.</li>
</ul></div>
`}};export{e as default};