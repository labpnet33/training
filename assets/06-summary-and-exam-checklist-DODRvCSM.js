var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You now have the building blocks of the automation and assurance part of ENSLD 300-420. This last chapter joins them in one capstone case, then gives a can-do checklist, a mini glossary and the facts that appear most often in exam questions.</p>

<h3>Capstone case: Harbor Lane Retail Bank</h3>
<p>Harbor Lane has 90 branches, 2 data centers, a head office of 3,000 staff and 700 network devices: Catalyst 9000 switches, ISR routers, Nexus in the data centers and some end-of-support access switches. The board wants "faster change with fewer outages" within USD 500,000, and a design reviewer asks you to justify every layer.</p>
<table class="cmp"><tr><th>Need</th><th>Design decision</th><th>Why</th></tr>
<tr><td>Branch onboarding</td><td>Catalyst Center PnP: option 43 at head office, cloud redirect at branches</td><td>Zero-touch, golden image, Day-0 templates</td></tr>
<tr><td>Data center and legacy</td><td>Ansible with NETCONF where supported, CLI exception otherwise</td><td>Controller cannot manage end-of-support gear</td></tr>
<tr><td>Intent record</td><td>NetBox as source of truth, Git for templates</td><td>Detect drift, audit trail</td></tr>
<tr><td>Visibility</td><td>gNMI dial-out for DC uplinks, SNMP for inventory, IPFIX at WAN edge, syslog relays, ThousandEyes agents</td><td>Right resolution for each question</td></tr>
<tr><td>Resilience</td><td>OOB switches, LTE, console servers; 3-node cluster plus DR site</td><td>Fix the network when it is broken</td></tr>
<tr><td>Safety</td><td>Pipeline with lab test, canary and post-checks</td><td>Evidence for the change board</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Automation and assurance architecture">
<rect x="10" y="10" width="190" height="50" rx="10" fill="#ddd6fe"/><text x="105" y="40" text-anchor="middle" class="svg-ink" font-size="13">Git + CI pipeline</text>
<rect x="225" y="10" width="190" height="50" rx="10" fill="#fde68a"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Source of truth</text>
<rect x="440" y="10" width="190" height="50" rx="10" fill="#bae6fd"/><text x="535" y="40" text-anchor="middle" class="svg-ink" font-size="13">Catalyst Center</text>
<line x1="200" y1="35" x2="225" y2="35" stroke="#64748b" stroke-width="2"/><line x1="415" y1="35" x2="440" y2="35" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="100" width="300" height="50" rx="10" fill="#bbf7d0"/><text x="160" y="130" text-anchor="middle" class="svg-ink" font-size="13">Devices: IOS XE, NX-OS, legacy</text>
<rect x="340" y="100" width="290" height="50" rx="10" fill="#fed7aa"/><text x="485" y="130" text-anchor="middle" class="svg-ink" font-size="13">Telemetry, flows, logs, agents</text>
<line x1="105" y1="60" x2="105" y2="100" stroke="#64748b" stroke-width="2"/><line x1="535" y1="60" x2="400" y2="100" stroke="#64748b" stroke-width="2"/><line x1="310" y1="125" x2="340" y2="125" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<rect x="150" y="190" width="340" height="40" rx="10" fill="#e2e8f0"/><text x="320" y="215" text-anchor="middle" class="svg-ink" font-size="13">Out-of-band management network</text>
<line x1="160" y1="150" x2="230" y2="190" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Purple: change. Yellow: intent. Blue: controller. Green: devices. Orange: observation. Grey: OOB path.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain what YANG, NETCONF, RESTCONF and gNMI each do, and pick one for a requirement.</li>
<li>Choose Python, Ansible or Terraform for a given team and task.</li>
<li>Name the four Catalyst Center workflow stages and the three PnP discovery methods.</li>
<li>Explain SWIM golden images and why distribute and activate are separate.</li>
<li>Decide between controller-based, device-based and hybrid management.</li>
<li>Define source of truth, golden config, intended config and drift.</li>
<li>Choose SNMP, streaming, IPFIX, syslog or active testing for a question.</li>
<li>Design OOB management and a safe CI/CD change pipeline.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Candidate datastore</dt><dd>A staging copy of configuration in NETCONF that is validated and then committed.</dd>
<dt>Dial-out</dt><dd>Telemetry connection opened by the device towards the collector.</dd>
<dt>IPFIX</dt><dd>IETF standard flow export format derived from NetFlow v9.</dd>
<dt>Idempotent</dt><dd>An operation that gives the same result when repeated.</dd>
<dt>OOB</dt><dd>Out-of-band: a management path independent from production.</dd>
<dt>SWIM</dt><dd>Software Image Management in Catalyst Center.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>NETCONF</td><td>SSH, XML, port 830, candidate datastore, commit</td></tr>
<tr><td>RESTCONF</td><td>HTTPS, JSON or XML, GET POST PUT PATCH DELETE, no candidate datastore</td></tr>
<tr><td>gNMI</td><td>gRPC; Capabilities, Get, Set, Subscribe</td></tr>
<tr><td>PnP discovery</td><td>DHCP option 43, DNS, cloud redirection</td></tr>
<tr><td>Cluster</td><td>Three nodes for HA; separate site for DR</td></tr>
<tr><td>Syslog levels</td><td>0 emergency to 7 debug</td></tr>
</table>

<div class="warn"><p><b>Common mistake in exams.</b> Picking the most modern technology without checking the customer's constraints: legacy devices, small team, no second ISP, budget. The best answer fits both the requirement and the constraints.</p></div>
<div class="exam"><p><b>Exam trap.</b> Read the last sentence first. If it asks for the "most cost-effective" or "lowest operational risk" option, eliminate answers that need skills or hardware the case rules out.</p></div>

<div class="scn"><h4>Post-mortem: the automation that automated a mistake</h4><p>Harbor Lane pushed a template with a wrong NTP address to 90 branches in one wave. Certificates started failing and branch logins broke. A post-check existed but was set to warn, not to stop. Afterwards they made post-checks blocking, introduced canary branches and required every template variable to come from the source of truth.</p><p><b>Lesson:</b> automation multiplies good and bad changes alike, so staging and verification are part of the design.</p></div>

<div class="iv"><p class="q">"Walk me through how you would design automation for a mixed estate."</p><p>Start with requirements and constraints, then split the estate: a controller for supported platforms, API-driven tooling for the rest, one source of truth for both. Add telemetry sized to the questions, OOB management for resilience, and a pipeline with tests, canary and rollback. Close with how success is measured: change failure rate and time to recover.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design starts from requirements and constraints, not from technology.</li>
<li>Hybrid controller plus API tooling is often right for mixed estates.</li>
<li>Source of truth and golden config make automation auditable.</li>
<li>Choose telemetry by the question and the resolution needed.</li>
<li>Out-of-band access and staged change make failures survivable.</li>
</ul></div>
`,hi:`
<p>Ab aapke paas ENSLD 300-420 ke automation aur assurance hisse ke building blocks hain. Yeh aakhri chapter unhe ek capstone case mein jodta hai, phir can-do checklist, mini glossary aur woh facts deta hai jo exam questions mein sabse zyada aate hain.</p>

<h3>Capstone case: Harbor Lane Retail Bank</h3>
<p>Harbor Lane ke 90 branches, 2 data centers, 3,000 staff ka head office aur 700 network devices hain: Catalyst 9000 switches, ISR routers, data centers mein Nexus aur kuch end-of-support access switches. Board USD 500,000 ke andar "kam outages ke saath faster change" chahta hai, aur design reviewer aapse har layer ko justify karne ko kehta hai.</p>
<table class="cmp"><tr><th>Need</th><th>Design decision</th><th>Why</th></tr>
<tr><td>Branch onboarding</td><td>Catalyst Center PnP: head office mein option 43, branches mein cloud redirect</td><td>Zero-touch, golden image, Day-0 templates</td></tr>
<tr><td>Data center aur legacy</td><td>Jahan supported wahan NETCONF ke saath Ansible, warna CLI exception</td><td>Controller end-of-support gear manage nahi kar sakta</td></tr>
<tr><td>Intent record</td><td>Source of truth ke roop mein NetBox, templates ke liye Git</td><td>Drift detect karo, audit trail</td></tr>
<tr><td>Visibility</td><td>DC uplinks ke liye gNMI dial-out, inventory ke liye SNMP, WAN edge par IPFIX, syslog relays, ThousandEyes agents</td><td>Har sawal ke liye sahi resolution</td></tr>
<tr><td>Resilience</td><td>OOB switches, LTE, console servers; 3-node cluster plus DR site</td><td>Toote network ko theek karo</td></tr>
<tr><td>Safety</td><td>Lab test, canary aur post-checks wala pipeline</td><td>Change board ke liye evidence</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Automation and assurance architecture">
<rect x="10" y="10" width="190" height="50" rx="10" fill="#ddd6fe"/><text x="105" y="40" text-anchor="middle" class="svg-ink" font-size="13">Git + CI pipeline</text>
<rect x="225" y="10" width="190" height="50" rx="10" fill="#fde68a"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Source of truth</text>
<rect x="440" y="10" width="190" height="50" rx="10" fill="#bae6fd"/><text x="535" y="40" text-anchor="middle" class="svg-ink" font-size="13">Catalyst Center</text>
<line x1="200" y1="35" x2="225" y2="35" stroke="#64748b" stroke-width="2"/><line x1="415" y1="35" x2="440" y2="35" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="100" width="300" height="50" rx="10" fill="#bbf7d0"/><text x="160" y="130" text-anchor="middle" class="svg-ink" font-size="13">Devices: IOS XE, NX-OS, legacy</text>
<rect x="340" y="100" width="290" height="50" rx="10" fill="#fed7aa"/><text x="485" y="130" text-anchor="middle" class="svg-ink" font-size="13">Telemetry, flows, logs, agents</text>
<line x1="105" y1="60" x2="105" y2="100" stroke="#64748b" stroke-width="2"/><line x1="535" y1="60" x2="400" y2="100" stroke="#64748b" stroke-width="2"/><line x1="310" y1="125" x2="340" y2="125" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<rect x="150" y="190" width="340" height="40" rx="10" fill="#e2e8f0"/><text x="320" y="215" text-anchor="middle" class="svg-ink" font-size="13">Out-of-band management network</text>
<line x1="160" y1="150" x2="230" y2="190" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Purple: change. Yellow: intent. Blue: controller. Green: devices. Orange: observation. Grey: OOB path.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Samjha sako ki YANG, NETCONF, RESTCONF aur gNMI har ek kya karta hai, aur requirement ke liye ek chun sako.</li>
<li>Diye gaye team aur task ke liye Python, Ansible ya Terraform chun sako.</li>
<li>Catalyst Center ke chaar workflow stages aur teen PnP discovery methods bata sako.</li>
<li>SWIM golden images samjha sako aur yeh ki distribute aur activate alag kyun hain.</li>
<li>Controller-based, device-based aur hybrid management mein se decide kar sako.</li>
<li>Source of truth, golden config, intended config aur drift define kar sako.</li>
<li>Kisi sawal ke liye SNMP, streaming, IPFIX, syslog ya active testing chun sako.</li>
<li>OOB management aur safe CI/CD change pipeline design kar sako.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Candidate datastore</dt><dd>NETCONF mein configuration ki staging copy jo validate hoke commit hoti hai.</dd>
<dt>Dial-out</dt><dd>Device ki taraf se collector ki taraf khola gaya telemetry connection.</dd>
<dt>IPFIX</dt><dd>NetFlow v9 se bana IETF standard flow export format.</dd>
<dt>Idempotent</dt><dd>Aisa operation jo dohrane par bhi same result deta hai.</dd>
<dt>OOB</dt><dd>Out-of-band: production se independent management path.</dd>
<dt>SWIM</dt><dd>Catalyst Center mein Software Image Management.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>NETCONF</td><td>SSH, XML, port 830, candidate datastore, commit</td></tr>
<tr><td>RESTCONF</td><td>HTTPS, JSON ya XML, GET POST PUT PATCH DELETE, candidate datastore nahi</td></tr>
<tr><td>gNMI</td><td>gRPC; Capabilities, Get, Set, Subscribe</td></tr>
<tr><td>PnP discovery</td><td>DHCP option 43, DNS, cloud redirection</td></tr>
<tr><td>Cluster</td><td>HA ke liye teen nodes; DR ke liye alag site</td></tr>
<tr><td>Syslog levels</td><td>0 emergency se 7 debug</td></tr>
</table>

<div class="warn"><p><b>Exam mein common mistake.</b> Customer ke constraints dekhe bina sabse modern technology chun lena: legacy devices, chhoti team, doosra ISP nahi, budget. Best answer requirement aur constraints dono se fit hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Pehle aakhri line padho. Agar "most cost-effective" ya "lowest operational risk" option maanga hai, to woh answers hatao jinhe aise skills ya hardware chahiye jo case mein mana hai.</p></div>

<div class="scn"><h4>Post-mortem: automation jisne galti ko automate kar diya</h4><p>Harbor Lane ne ek hi wave mein 90 branches par galat NTP address wala template push kiya. Certificates fail hone lage aur branch logins toot gaye. Post-check tha, lekin woh stop karne ki jagah sirf warn karta tha. Baad mein unhone post-checks ko blocking banaya, canary branches shuru kiye aur har template variable ko source of truth se lena zaroori kiya.</p><p><b>Seekh:</b> automation achhe aur bure dono changes ko multiply karta hai, isliye staging aur verification design ka hissa hain.</p></div>

<div class="iv"><p class="q">"Mixed estate ke liye automation design kaise karoge, samjhao."</p><p>Requirements aur constraints se shuru karo, phir estate ko baanto: supported platforms ke liye controller, baaki ke liye API-driven tooling, dono ke liye ek source of truth. Sawalon ke hisaab se sized telemetry, resilience ke liye OOB management, aur tests, canary aur rollback wala pipeline jodo. Success kaise naapi jaayegi (change failure rate aur time to recover) us par khatam karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design requirements aur constraints se shuru hota hai, technology se nahi.</li>
<li>Mixed estates ke liye hybrid controller plus API tooling aksar sahi hota hai.</li>
<li>Source of truth aur golden config automation ko auditable banate hain.</li>
<li>Telemetry sawal aur zaroori resolution ke hisaab se chuno.</li>
<li>Out-of-band access aur staged change failures ko survivable banate hain.</li>
</ul></div>
`}};export{e as default};