var e={id:`controllers-apis`,h:{en:`Automation design: choosing controllers and APIs`,hi:`Automation design: controllers aur APIs ka chunav`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how a designer chooses and combines the automation, visibility, security and resilience building blocks that the Cisco 300-610 DCID blueprint lists under automation, management and security design. Each chapter starts with a realistic customer case, then requirements, constraints, options, a trade-off table, the chosen design and, where useful, a post-mortem of what went wrong. <b>Prerequisites:</b> you know what a spine-leaf fabric is, the difference between ACI and a VXLAN EVPN NX-OS fabric, and what a REST API is at a basic level. You do not need to be a programmer.</p>

<h3>The customer case: Harborline Insurance</h3>
<p>Harborline Insurance is a mid-size insurer in Pune. It runs two data centers (DC-A and DC-B) 40 km apart, 18 leaf switches in each, about 900 virtual machines and 60 Cisco UCS servers. Today every change is a ticket: a network engineer logs in to switches by hand. A new application VLAN takes five days and two outages were caused by typing errors. The CIO has a budget for one platform team of four people, wants changes done in under one day, and an auditor requires proof of who changed what. The estate is mixed: DC-A is a VXLAN EVPN fabric on Nexus 9000 switches, DC-B was built later on ACI. Servers are managed through Cisco Intersight.</p>

<h3>Requirements and constraints</h3>
<ul>
<li>One request process for both sites even though the fabric technology differs.</li>
<li>Repeatable, reviewed changes with an audit trail.</li>
<li>No big-bang rewrite: the four-person team must deliver in two quarters.</li>
<li>Skills: the team knows YAML and a little Python, not deep software engineering.</li>
</ul>

<h3>The building blocks you can choose from</h3>
<dl class="terms">
<dt>Nexus Dashboard Fabric Controller (NDFC)</dt><dd>Controller for NX-OS fabrics, including VXLAN EVPN, running as a service on Nexus Dashboard. It builds the fabric from templates and policies and exposes a REST API.</dd>
<dt>Nexus Dashboard (ND)</dt><dd>The common platform that hosts services such as NDFC, Insights and Orchestrator, and gives a single place to onboard sites.</dd>
<dt>APIC</dt><dd>The ACI controller. Everything in ACI is an object in the management information tree and is reachable through the REST API.</dd>
<dt>Intersight</dt><dd>Cisco's SaaS operations platform for UCS and other infrastructure, with an API, server profiles and policies, and workflow orchestration.</dd>
<dt>Ansible and Terraform</dt><dd>External tools. Ansible runs tasks from playbooks; Terraform keeps a declared desired state and plans changes. Cisco publishes collections and providers for ACI, NDFC and Intersight.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Automation layers for Harborline">
<rect x="10" y="10" width="620" height="44" rx="8" fill="#fde68a"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">Source of truth: Git repository + request portal</text>
<rect x="10" y="70" width="620" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="98" text-anchor="middle" class="svg-ink" font-size="14">Automation engine: Ansible, Terraform, pipeline</text>
<rect x="10" y="130" width="200" height="50" rx="8" fill="#bae6fd"/><text x="110" y="160" text-anchor="middle" class="svg-ink" font-size="13">NDFC (DC-A fabric)</text>
<rect x="220" y="130" width="200" height="50" rx="8" fill="#bae6fd"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">APIC (DC-B fabric)</text>
<rect x="430" y="130" width="200" height="50" rx="8" fill="#bbf7d0"/><text x="530" y="160" text-anchor="middle" class="svg-ink" font-size="13">Intersight (UCS)</text>
<rect x="10" y="200" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="110" y="225" text-anchor="middle" class="svg-ink" font-size="13">Nexus 9000 leaf/spine</text>
<rect x="220" y="200" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="225" text-anchor="middle" class="svg-ink" font-size="13">ACI leaf/spine</text>
<rect x="430" y="200" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="530" y="225" text-anchor="middle" class="svg-ink" font-size="13">UCS servers</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="320" y1="54" x2="320" y2="70"/><line x1="110" y1="114" x2="110" y2="130"/><line x1="320" y1="114" x2="320" y2="130"/><line x1="530" y1="114" x2="530" y2="130"/><line x1="110" y1="180" x2="110" y2="200"/><line x1="320" y1="180" x2="320" y2="200"/><line x1="530" y1="180" x2="530" y2="200"/></g>
<rect x="10" y="256" width="14" height="14" fill="#fde68a"/><text x="30" y="268" class="svg-muted" font-size="12">intent</text>
<rect x="100" y="256" width="14" height="14" fill="#ddd6fe"/><text x="120" y="268" class="svg-muted" font-size="12">engine</text>
<rect x="190" y="256" width="14" height="14" fill="#bae6fd"/><text x="210" y="268" class="svg-muted" font-size="12">network controller</text>
<rect x="340" y="256" width="14" height="14" fill="#bbf7d0"/><text x="360" y="268" class="svg-muted" font-size="12">compute controller</text>
<rect x="500" y="256" width="14" height="14" fill="#e2e8f0"/><text x="520" y="268" class="svg-muted" font-size="12">devices</text>
</svg><p class="cap">Chosen design: one intent layer, one engine, controllers per domain. Devices are touched only by controllers.</p></div>

<h3>Options and trade-offs</h3>
<table class="cmp"><tr><th>Option</th><th>Strength</th><th>Weakness</th><th>Verdict for Harborline</th></tr>
<tr><td>Direct device automation (scripts to each switch, NX-API)</td><td>Maximum control, no controller licence</td><td>You own state, rollback and drift detection; 36 devices to script</td><td>Rejected as the main model</td></tr>
<tr><td>Controller-led (NDFC, APIC, Intersight) with scripts on top</td><td>Controller holds fabric state, validates, gives one API per domain</td><td>Two network controllers means two APIs</td><td>Chosen</td></tr>
<tr><td>Single pane through Nexus Dashboard Orchestrator-style multi-site policy</td><td>One policy across sites</td><td>Needs both sites onboarded and same release levels</td><td>Phase 2</td></tr>
</table>

<h3>The chosen design and why</h3>
<p>The design keeps each controller as the owner of its domain. The automation engine talks only to controller APIs: the NDFC REST API for DC-A, the APIC REST API for DC-B, and the Intersight API for servers. Ansible playbooks hold the day-to-day tasks (create a network, attach it to leaf ports), while Terraform manages longer-lived objects such as ACI tenants and Intersight policies, because Terraform records state and shows a plan before it acts. The request portal only writes a file into Git; nothing changes until the pipeline runs. This matches how the team works (YAML), keeps an audit trail (Git history), and avoids touching 36 switches directly.</p>

<div class="eg"><p><b>Worked example.</b> A developer asks for application "claims-web". The portal creates a pull request adding one YAML entry: VRF Prod, network 10.20.30.0/24, gateway 10.20.30.1, attach to leaf pair 1 and 2. A second engineer approves. The pipeline calls the NDFC API to create and deploy the network in DC-A and the APIC API to create the bridge domain and EPG in DC-B. Result: 25 minutes, zero logins to switches.</p></div>

<pre class="code"><span class="c">! Enable the NX-API REST/JSON interface on a standalone Nexus switch (used for direct API automation)</span>
feature nxapi
</pre>

<div class="note"><p>On a controller-managed fabric you normally do <b>not</b> enable direct access for engineers. Direct NX-API is for standalone devices or tightly controlled tooling.</p></div>

<h3>What went wrong at a similar site</h3>
<div class="scn"><h4>Two sources of truth</h4><p>Another insurer automated VLAN creation with a script that logged in to leaf switches, while the NDFC controller also pushed configuration. A script created a VLAN that NDFC did not know. At the next deploy, NDFC reported out-of-sync configuration and, on remediation, removed the VLAN, dropping a production application for 12 minutes. The post-mortem rule: one writer per object. Either the controller owns it, or the device does, never both.</p><p><b>Lesson:</b> automation design starts by deciding who owns each object and routing every change through that owner.</p></div>

<div class="exam"><p><b>Exam trap.</b> When the question says the customer already has a controller (NDFC, APIC, Intersight), the best answer uses the controller API or its Ansible/Terraform modules, not per-device scripts.</p></div>

<div class="warn"><p><b>Common mistake.</b> Choosing a tool first. Choose ownership, then workflow, then tool.</p></div>

<div class="iv"><p class="q">"How would you automate a mixed ACI and VXLAN EVPN estate?"</p><p>Strong answer: keep each controller authoritative for its domain, put intent in Git, use an automation engine that calls the controller APIs, and give one request process on top. Mention single writer per object and a phased rollout.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design automation as layers: intent, engine, controllers, devices.</li>
<li>NDFC serves NX-OS fabrics, APIC serves ACI, Intersight serves compute.</li>
<li>Controller-led automation beats per-device scripting when controllers exist.</li>
<li>Ansible suits tasks, Terraform suits declared long-lived state.</li>
<li>One writer per object avoids drift and surprise rollbacks.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki ek designer automation, visibility, security aur resilience ke building blocks ko kaise chunta aur jodta hai, jo Cisco 300-610 DCID blueprint mein automation, management aur security design ke neeche listed hain. Har chapter ek realistic customer case se shuru hota hai, phir requirements, constraints, options, trade-off table, chosen design aur zaroorat ho to post-mortem. <b>Prerequisites:</b> aapko spine-leaf fabric pata ho, ACI aur VXLAN EVPN NX-OS fabric ka difference pata ho, aur REST API basic level par samajh aati ho. Programmer hona zaroori nahi.</p>

<h3>Customer case: Harborline Insurance</h3>
<p>Harborline Insurance Pune ki ek mid-size insurer hai. Uske do data centers (DC-A aur DC-B) 40 km door hain, har ek mein 18 leaf switches, lagbhag 900 virtual machines aur 60 Cisco UCS servers. Aaj har change ek ticket hai: network engineer switches mein haath se login karta hai. Naya application VLAN banne mein paanch din lagte hain aur typing errors se do outages hue. CIO ke paas ek platform team (chaar log) ka budget hai, change ek din se kam mein chahiye, aur auditor ko proof chahiye ki kisne kya badla. Estate mixed hai: DC-A VXLAN EVPN fabric hai (Nexus 9000), DC-B baad mein ACI par bana. Servers Cisco Intersight se manage hote hain.</p>

<h3>Requirements aur constraints</h3>
<ul>
<li>Dono sites ke liye ek request process, chahe fabric technology alag ho.</li>
<li>Repeatable, reviewed changes with audit trail.</li>
<li>Big-bang rewrite nahi: chaar logon ki team ko do quarters mein deliver karna hai.</li>
<li>Skills: team YAML jaanti hai aur thoda Python, deep software engineering nahi.</li>
</ul>

<h3>Building blocks jinmein se chunna hai</h3>
<dl class="terms">
<dt>Nexus Dashboard Fabric Controller (NDFC)</dt><dd>NX-OS fabrics (VXLAN EVPN samet) ka controller, jo Nexus Dashboard par service ki tarah chalta hai. Yeh templates aur policies se fabric banata hai aur REST API deta hai.</dd>
<dt>Nexus Dashboard (ND)</dt><dd>Common platform jo NDFC, Insights, Orchestrator jaisi services host karta hai aur sites onboard karne ki ek jagah deta hai.</dd>
<dt>APIC</dt><dd>ACI ka controller. ACI mein sab kuch management information tree ka object hai aur REST API se reachable hai.</dd>
<dt>Intersight</dt><dd>Cisco ka SaaS operations platform UCS aur dusre infrastructure ke liye, API, server profiles, policies aur workflow orchestration ke saath.</dd>
<dt>Ansible aur Terraform</dt><dd>External tools. Ansible playbooks se tasks chalata hai; Terraform desired state declare karke changes ka plan banata hai. Cisco ACI, NDFC aur Intersight ke liye collections aur providers deta hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Harborline ke automation layers">
<rect x="10" y="10" width="620" height="44" rx="8" fill="#fde68a"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">Source of truth: Git repository + request portal</text>
<rect x="10" y="70" width="620" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="98" text-anchor="middle" class="svg-ink" font-size="14">Automation engine: Ansible, Terraform, pipeline</text>
<rect x="10" y="130" width="200" height="50" rx="8" fill="#bae6fd"/><text x="110" y="160" text-anchor="middle" class="svg-ink" font-size="13">NDFC (DC-A fabric)</text>
<rect x="220" y="130" width="200" height="50" rx="8" fill="#bae6fd"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">APIC (DC-B fabric)</text>
<rect x="430" y="130" width="200" height="50" rx="8" fill="#bbf7d0"/><text x="530" y="160" text-anchor="middle" class="svg-ink" font-size="13">Intersight (UCS)</text>
<rect x="10" y="200" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="110" y="225" text-anchor="middle" class="svg-ink" font-size="13">Nexus 9000 leaf/spine</text>
<rect x="220" y="200" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="225" text-anchor="middle" class="svg-ink" font-size="13">ACI leaf/spine</text>
<rect x="430" y="200" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="530" y="225" text-anchor="middle" class="svg-ink" font-size="13">UCS servers</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="320" y1="54" x2="320" y2="70"/><line x1="110" y1="114" x2="110" y2="130"/><line x1="320" y1="114" x2="320" y2="130"/><line x1="530" y1="114" x2="530" y2="130"/><line x1="110" y1="180" x2="110" y2="200"/><line x1="320" y1="180" x2="320" y2="200"/><line x1="530" y1="180" x2="530" y2="200"/></g>
<rect x="10" y="256" width="14" height="14" fill="#fde68a"/><text x="30" y="268" class="svg-muted" font-size="12">intent</text>
<rect x="100" y="256" width="14" height="14" fill="#ddd6fe"/><text x="120" y="268" class="svg-muted" font-size="12">engine</text>
<rect x="190" y="256" width="14" height="14" fill="#bae6fd"/><text x="210" y="268" class="svg-muted" font-size="12">network controller</text>
<rect x="340" y="256" width="14" height="14" fill="#bbf7d0"/><text x="360" y="268" class="svg-muted" font-size="12">compute controller</text>
<rect x="500" y="256" width="14" height="14" fill="#e2e8f0"/><text x="520" y="268" class="svg-muted" font-size="12">devices</text>
</svg><p class="cap">Chosen design: ek intent layer, ek engine, har domain ka apna controller. Devices ko sirf controllers chhute hain.</p></div>

<h3>Options aur trade-offs</h3>
<table class="cmp"><tr><th>Option</th><th>Strength</th><th>Weakness</th><th>Harborline ke liye verdict</th></tr>
<tr><td>Direct device automation (har switch par scripts, NX-API)</td><td>Maximum control, controller licence nahi</td><td>State, rollback aur drift detection aapki zimmedari; 36 devices script karne</td><td>Main model ke roop mein reject</td></tr>
<tr><td>Controller-led (NDFC, APIC, Intersight) aur upar scripts</td><td>Controller fabric state rakhta hai, validate karta hai, har domain ki ek API</td><td>Do network controllers matlab do APIs</td><td>Chosen</td></tr>
<tr><td>Nexus Dashboard Orchestrator-style multi-site policy se single pane</td><td>Sites ke across ek policy</td><td>Dono sites onboard aur same release levels chahiye</td><td>Phase 2</td></tr>
</table>

<h3>Chosen design aur kyun</h3>
<p>Design mein har controller apne domain ka owner rehta hai. Automation engine sirf controller APIs se baat karta hai: DC-A ke liye NDFC REST API, DC-B ke liye APIC REST API aur servers ke liye Intersight API. Ansible playbooks roz ke tasks sambhalte hain (network banao, leaf ports par attach karo), jabki Terraform lambe time ke objects jaise ACI tenants aur Intersight policies manage karta hai, kyunki Terraform state rakhta hai aur action se pehle plan dikhata hai. Request portal sirf Git mein ek file likhta hai; pipeline chalne tak kuch nahi badalta. Yeh team ke kaam karne ke tareeke (YAML) se match karta hai, audit trail deta hai (Git history) aur 36 switches ko seedha chhune se bachata hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek developer application "claims-web" maangta hai. Portal ek pull request banata hai jisme ek YAML entry hai: VRF Prod, network 10.20.30.0/24, gateway 10.20.30.1, leaf pair 1 aur 2 par attach. Dusra engineer approve karta hai. Pipeline DC-A mein NDFC API se network create aur deploy karta hai, aur DC-B mein APIC API se bridge domain aur EPG banata hai. Result: 25 minute, switches mein zero login.</p></div>

<pre class="code"><span class="c">! Standalone Nexus switch par NX-API REST/JSON interface enable karna (direct API automation ke liye)</span>
feature nxapi
</pre>

<div class="note"><p>Controller-managed fabric mein engineers ko normally direct access <b>nahi</b> diya jaata. Direct NX-API standalone devices ya tightly controlled tooling ke liye hai.</p></div>

<h3>Similar site par kya galat hua</h3>
<div class="scn"><h4>Do sources of truth</h4><p>Ek aur insurer ne VLAN creation ko script se automate kiya jo leaf switches mein login karti thi, jabki NDFC controller bhi configuration push karta tha. Script ne ek VLAN banaya jo NDFC ko pata nahi tha. Agle deploy par NDFC ne out-of-sync configuration report kiya aur remediation mein VLAN hata diya, jisse ek production application 12 minute ke liye gir gayi. Post-mortem ka rule: har object ka ek hi writer. Ya controller owner ho, ya device, dono kabhi nahi.</p><p><b>Lesson:</b> automation design ki shuruaat yeh tay karne se hoti hai ki har object ka owner kaun hai, aur har change usi owner ke through jaye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Jab question kahe ki customer ke paas pehle se controller hai (NDFC, APIC, Intersight), best answer controller API ya uske Ansible/Terraform modules use karta hai, per-device scripts nahi.</p></div>

<div class="warn"><p><b>Common mistake.</b> Pehle tool chun lena. Pehle ownership chuno, phir workflow, phir tool.</p></div>

<div class="iv"><p class="q">"Mixed ACI aur VXLAN EVPN estate ko aap kaise automate karoge?"</p><p>Strong answer: har controller ko apne domain ka authoritative rakho, intent Git mein rakho, aisa automation engine use karo jo controller APIs call kare, aur upar ek request process do. Single writer per object aur phased rollout zaroor batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Automation ko layers mein design karo: intent, engine, controllers, devices.</li>
<li>NDFC NX-OS fabrics ke liye, APIC ACI ke liye, Intersight compute ke liye.</li>
<li>Controllers hon to controller-led automation per-device scripting se behtar hai.</li>
<li>Ansible tasks ke liye, Terraform declared long-lived state ke liye.</li>
<li>Har object ka ek writer drift aur surprise rollbacks se bachata hai.</li>
</ul></div>
`}};export{e as default};