var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p><b>How to use this chapter.</b> Read it the night before the exam, and again before a design interview. It turns the five customer cases (Harborline, Kestrel, Tandoor Pay, Sahyadri, Deccan Air) into a checklist, a glossary and a set of rules that answer most design questions.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Design decision map">
<rect x="10" y="10" width="200" height="70" rx="10" fill="#ddd6fe"/><text x="110" y="38" text-anchor="middle" class="svg-ink" font-size="14">Automate</text><text x="110" y="58" text-anchor="middle" class="svg-muted" font-size="12">controller + Git + pipeline</text>
<rect x="220" y="10" width="200" height="70" rx="10" fill="#bae6fd"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">See</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">telemetry + Insights</text>
<rect x="430" y="10" width="200" height="70" rx="10" fill="#fed7aa"/><text x="530" y="38" text-anchor="middle" class="svg-ink" font-size="14">Protect</text><text x="530" y="58" text-anchor="middle" class="svg-muted" font-size="12">segment, AAA, CoPP, MACsec</text>
<rect x="10" y="100" width="300" height="70" rx="10" fill="#bbf7d0"/><text x="160" y="128" text-anchor="middle" class="svg-ink" font-size="14">Recover</text><text x="160" y="148" text-anchor="middle" class="svg-muted" font-size="12">RPO, RTO, Multi-Site, rehearsal</text>
<rect x="330" y="100" width="300" height="70" rx="10" fill="#fde68a"/><text x="480" y="128" text-anchor="middle" class="svg-ink" font-size="14">Fit the facility</text><text x="480" y="148" text-anchor="middle" class="svg-muted" font-size="12">kW per rack, airflow, feeds</text>
<rect x="10" y="190" width="620" height="44" rx="10" fill="#e2e8f0"/><text x="320" y="217" text-anchor="middle" class="svg-ink" font-size="14">Always: one source of truth, one writer, tested change, evidence</text>
</svg><p class="cap">Five questions to ask in every design: how is it automated, seen, protected, recovered, and powered?</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Choose between direct device automation and controller-led automation, and justify with ownership and drift.</li>
<li>Match NDFC, APIC, Nexus Dashboard and Intersight to the domain each one manages.</li>
<li>Explain day-0, day-1 and day-2 with an example task for each.</li>
<li>Choose Ansible or Terraform for a given task and explain idempotence and state.</li>
<li>Design telemetry from questions: streaming telemetry, flow telemetry, NetFlow or sFlow, and Insights.</li>
<li>Design segmentation: VRFs, contracts or ESGs, Secure Workload, firewall insertion.</li>
<li>Design device protection: AAA with local fallback, CoPP, MACsec.</li>
<li>Design change control with pre-change analysis, validation, rollback and evidence.</li>
<li>Choose hybrid transport and keep operational consistency across sites and clouds.</li>
<li>Pick a DR model from RTO, RPO and distance.</li>
<li>Check power, cooling and airflow against a rack plan.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>NDFC</dt><dd>Controller for NX-OS and VXLAN EVPN fabrics, hosted on Nexus Dashboard.</dd>
<dt>Nexus Dashboard Insights</dt><dd>Analytics service using software and flow telemetry; anomalies, correlation, pre-change analysis.</dd>
<dt>Intersight</dt><dd>Cisco SaaS operations platform for compute and infrastructure with an API.</dd>
<dt>IaC</dt><dd>Infrastructure as code: desired state stored as reviewed, versioned files.</dd>
<dt>Idempotent</dt><dd>Safe to run repeatedly; only differences are changed.</dd>
<dt>Drift</dt><dd>Running configuration that no longer matches the source of truth.</dd>
<dt>Microsegmentation</dt><dd>Fine-grained filtering between workloads inside a zone.</dd>
<dt>CoPP</dt><dd>Control Plane Policing to protect the supervisor CPU.</dd>
<dt>MACsec</dt><dd>Hop-by-hop Layer 2 encryption, 802.1AE with MKA keys.</dd>
<dt>RTO and RPO</dt><dd>Time to recover and amount of data loss allowed.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Question pattern</th><th>Best answer</th></tr>
<tr><td>Customer already has a controller</td><td>Use its API and its Ansible or Terraform modules; one writer per object</td></tr>
<tr><td>Long-lived declared objects with a preview of changes</td><td>Terraform</td></tr>
<tr><td>Ordered operational tasks</td><td>Ansible</td></tr>
<tr><td>Need correlation with config changes and advisories</td><td>Nexus Dashboard Insights</td></tr>
<tr><td>Need to see drops per flow</td><td>Flow telemetry</td></tr>
<tr><td>Agentless workloads need filtering</td><td>Fabric contracts or ESGs</td></tr>
<tr><td>Application-aware policy learned from behaviour</td><td>Secure Workload, observe first</td></tr>
<tr><td>Encrypt a direct link at line rate</td><td>MACsec</td></tr>
<tr><td>Zero data loss across 500 km</td><td>Not synchronous replication; revisit the requirement or the design</td></tr>
<tr><td>Limit blast radius between sites</td><td>Separate fabrics with Multi-Site</td></tr>
</table>

<h3>Rules that solve most questions</h3>
<ol>
<li>Start from requirements and constraints; name the number that decides (RTO, kW, budget).</li>
<li>Prefer the platform the customer already runs, then extend it.</li>
<li>Remove single points of failure, including the AAA server, collector and pipeline.</li>
<li>Observe before you enforce; rehearse before you rely.</li>
<li>If two answers both work, pick the one with the smaller failure domain and the clearer audit trail.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Question: a customer with ACI wants a repeatable way to create tenants and EPGs and see a plan before changes. Reasoning: they have a controller, so use its API; declared long-lived objects with preview point to Terraform; Git review and pipeline add audit. Answer: Terraform with the ACI provider through the APIC API, in a Git-driven pipeline.</p></div>

<div class="scn"><h4>The exam-day trade-off</h4><p>A candidate faced a question with four reasonable answers about connecting two sites. She listed the constraints in the margin: 4 ms latency, a requirement to limit failure domains, and a need for tenant policy consistency. Two answers stretched Layer 2 and were removed. Of the other two, only one offered consistent policy across sites. She chose it and was correct.</p><p><b>Lesson:</b> write the constraints first; they eliminate options faster than recalling facts.</p></div>

<div class="exam"><p><b>Exam trap.</b> Words such as "most scalable", "least operational effort" and "lowest risk" decide between two technically valid answers. Controller-led, template-driven, small failure domain and staged rollout usually win those.</p></div>

<div class="warn"><p><b>Common mistake.</b> Memorising product names without the reason to choose them. The exam asks for design justification.</p></div>

<div class="iv"><p class="q">"Walk me through a design you would be proud of."</p><p>Pick one case from this module. State the customer, the constraint that mattered, the options you rejected and why, the chosen design, and one failure you planned for. Finish with how you would prove it works: tests, telemetry and a rehearsal.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every design answer should cover automate, see, protect, recover and power.</li>
<li>Controller-led, Git-driven, single-writer automation is the default.</li>
<li>Telemetry, segmentation and DR are staged processes: discover, simulate, enforce, rehearse.</li>
<li>Match technique to requirement numbers: RTO, RPO, kW, latency.</li>
<li>Justify with constraints; the exam rewards reasoning.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ko kaise use karein.</b> Ise exam se pehli raat padho, aur design interview se pehle bhi. Yeh paanch customer cases (Harborline, Kestrel, Tandoor Pay, Sahyadri, Deccan Air) ko checklist, glossary aur un rules mein badalta hai jo zyadatar design questions ka jawab dete hain.</p>

<svg viewBox="0 0 640 250" role="img" aria-label="Design decision map">
<rect x="10" y="10" width="200" height="70" rx="10" fill="#ddd6fe"/><text x="110" y="38" text-anchor="middle" class="svg-ink" font-size="14">Automate</text><text x="110" y="58" text-anchor="middle" class="svg-muted" font-size="12">controller + Git + pipeline</text>
<rect x="220" y="10" width="200" height="70" rx="10" fill="#bae6fd"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">See</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">telemetry + Insights</text>
<rect x="430" y="10" width="200" height="70" rx="10" fill="#fed7aa"/><text x="530" y="38" text-anchor="middle" class="svg-ink" font-size="14">Protect</text><text x="530" y="58" text-anchor="middle" class="svg-muted" font-size="12">segment, AAA, CoPP, MACsec</text>
<rect x="10" y="100" width="300" height="70" rx="10" fill="#bbf7d0"/><text x="160" y="128" text-anchor="middle" class="svg-ink" font-size="14">Recover</text><text x="160" y="148" text-anchor="middle" class="svg-muted" font-size="12">RPO, RTO, Multi-Site, rehearsal</text>
<rect x="330" y="100" width="300" height="70" rx="10" fill="#fde68a"/><text x="480" y="128" text-anchor="middle" class="svg-ink" font-size="14">Fit the facility</text><text x="480" y="148" text-anchor="middle" class="svg-muted" font-size="12">kW per rack, airflow, feeds</text>
<rect x="10" y="190" width="620" height="44" rx="10" fill="#e2e8f0"/><text x="320" y="217" text-anchor="middle" class="svg-ink" font-size="14">Always: one source of truth, one writer, tested change, evidence</text>
</svg>

<h3>Can-do checklist</h3>
<ul>
<li>Direct device automation aur controller-led automation mein se chuno, aur ownership aur drift se justify karo.</li>
<li>NDFC, APIC, Nexus Dashboard aur Intersight ko us domain se match karo jo wo manage karte hain.</li>
<li>Day-0, day-1 aur day-2 ko har ek ke example task ke saath samjhao.</li>
<li>Kisi task ke liye Ansible ya Terraform chuno aur idempotence aur state samjhao.</li>
<li>Sawalon se telemetry design karo: streaming telemetry, flow telemetry, NetFlow ya sFlow, aur Insights.</li>
<li>Segmentation design karo: VRFs, contracts ya ESGs, Secure Workload, firewall insertion.</li>
<li>Device protection design karo: local fallback ke saath AAA, CoPP, MACsec.</li>
<li>Pre-change analysis, validation, rollback aur evidence ke saath change control design karo.</li>
<li>Hybrid transport chuno aur sites aur clouds ke across operational consistency rakho.</li>
<li>RTO, RPO aur distance se DR model chuno.</li>
<li>Rack plan ke against power, cooling aur airflow check karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>NDFC</dt><dd>NX-OS aur VXLAN EVPN fabrics ka controller, Nexus Dashboard par hosted.</dd>
<dt>Nexus Dashboard Insights</dt><dd>Software aur flow telemetry use karne wali analytics service; anomalies, correlation, pre-change analysis.</dd>
<dt>Intersight</dt><dd>Compute aur infrastructure ke liye Cisco SaaS operations platform, API ke saath.</dd>
<dt>IaC</dt><dd>Infrastructure as code: desired state reviewed, versioned files mein.</dd>
<dt>Idempotent</dt><dd>Baar baar chalana safe; sirf differences badalte hain.</dd>
<dt>Drift</dt><dd>Running configuration jo ab source of truth se match nahi karti.</dd>
<dt>Microsegmentation</dt><dd>Zone ke andar workloads ke beech fine-grained filtering.</dd>
<dt>CoPP</dt><dd>Supervisor CPU ko protect karne wala Control Plane Policing.</dd>
<dt>MACsec</dt><dd>Hop-by-hop Layer 2 encryption, 802.1AE aur MKA keys.</dd>
<dt>RTO aur RPO</dt><dd>Recover hone ka time aur allowed data loss ki matra.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Question pattern</th><th>Best answer</th></tr>
<tr><td>Customer ke paas pehle se controller hai</td><td>Uski API aur uske Ansible ya Terraform modules use karo; har object ka ek writer</td></tr>
<tr><td>Changes ke preview ke saath long-lived declared objects</td><td>Terraform</td></tr>
<tr><td>Ordered operational tasks</td><td>Ansible</td></tr>
<tr><td>Config changes aur advisories se correlation chahiye</td><td>Nexus Dashboard Insights</td></tr>
<tr><td>Per flow drops dekhne hain</td><td>Flow telemetry</td></tr>
<tr><td>Agentless workloads ko filtering chahiye</td><td>Fabric contracts ya ESGs</td></tr>
<tr><td>Behaviour se seekhi application-aware policy</td><td>Secure Workload, pehle observe</td></tr>
<tr><td>Direct link line rate par encrypt karna</td><td>MACsec</td></tr>
<tr><td>500 km par zero data loss</td><td>Synchronous replication nahi; requirement ya design dobara dekho</td></tr>
<tr><td>Sites ke beech blast radius limit karna</td><td>Multi-Site ke saath alag fabrics</td></tr>
</table>

<h3>Wo rules jo zyadatar questions solve karte hain</h3>
<ol>
<li>Requirements aur constraints se shuru karo; wo number batao jo decide karta hai (RTO, kW, budget).</li>
<li>Customer jo platform pehle se chalata hai use prefer karo, phir extend karo.</li>
<li>Single points of failure hatao, AAA server, collector aur pipeline samet.</li>
<li>Enforce se pehle observe; rely se pehle rehearse.</li>
<li>Agar do answers kaam karte hain, chhota failure domain aur saaf audit trail wala chuno.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Question: ACI wale customer ko tenants aur EPGs banane ka repeatable tareeka chahiye aur changes se pehle plan dekhna hai. Reasoning: controller hai, to uski API use karo; preview ke saath declared long-lived objects Terraform ki taraf ishara karte hain; Git review aur pipeline audit jodte hain. Answer: Git-driven pipeline mein APIC API ke through ACI provider ke saath Terraform.</p></div>

<div class="scn"><h4>Exam-day ka trade-off</h4><p>Ek candidate ke saamne do sites jodne ke baare mein chaar reasonable answers wala question aaya. Usne margin mein constraints likhe: 4 ms latency, failure domains limit karne ki requirement, aur tenant policy consistency ki zaroorat. Do answers Layer 2 stretch karte the, wo hata diye. Baaki do mein se sirf ek sites ke across consistent policy deta tha. Usne wahi chuna aur sahi nikla.</p><p><b>Lesson:</b> pehle constraints likho; wo facts yaad karne se tezi se options eliminate karte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Most scalable", "least operational effort" aur "lowest risk" jaise words do technically valid answers ke beech decide karte hain. Controller-led, template-driven, chhota failure domain aur staged rollout aksar jeet te hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Product names ratna bina yeh jaane ki unhe kyun chunna hai. Exam design justification maangta hai.</p></div>

<div class="iv"><p class="q">"Mujhe ek aisa design batao jis par tumhe garv ho."</p><p>Is module ka ek case chuno. Customer, wo constraint jo matter karta tha, reject kiye options aur kyun, chosen design, aur ek failure jiske liye plan kiya, batao. End mein batao ki kaise prove karoge ki kaam karta hai: tests, telemetry aur rehearsal.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har design answer mein automate, see, protect, recover aur power cover hone chahiye.</li>
<li>Controller-led, Git-driven, single-writer automation default hai.</li>
<li>Telemetry, segmentation aur DR staged processes hain: discover, simulate, enforce, rehearse.</li>
<li>Technique ko requirement numbers se match karo: RTO, RPO, kW, latency.</li>
<li>Constraints se justify karo; exam reasoning ko reward karta hai.</li>
</ul></div>
`}};export{e as default};