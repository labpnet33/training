var e={id:`iac-day012`,h:{en:`Infrastructure as code, source of truth and day-0/1/2 operations`,hi:`Infrastructure as code, source of truth aur day-0/1/2 operations`},body:{en:`
<p><b>Analogy.</b> A restaurant chain does not let each branch invent its own recipe. A master recipe book (the source of truth) defines every dish, a kitchen manual explains how to open a new branch, and daily checklists keep every branch consistent. Infrastructure as code (IaC) is the same idea for the network: the desired state is written down in files, reviewed, versioned, and applied by tools.</p>

<h3>The customer case: Kestrel Retail</h3>
<p>Kestrel Retail is an online retailer in Bengaluru with one main data center, a colocation cage and a plan to open a third site in 9 months. It has 24 leaf switches, 6 spines and a 5-person infrastructure team with a change budget: no more than 2 hours of change-related downtime per year. Peak season is November to January, and a change freeze applies in that window. In the last year, three outages were caused by configuration differences between the two spine switches, and the new site must be built identically to the first. The CTO's goal: build the new site from the same code, in days, not months.</p>

<h3>Requirements and constraints</h3>
<ul>
<li>Identical configuration across sites, with drift detected within a day.</li>
<li>Peer review before any change, and a rollback path.</li>
<li>Three phases of work clearly separated: initial build, tenant onboarding, and ongoing changes.</li>
<li>Budget allows one controller and one pipeline server, with no extra licences for a separate database product.</li>
</ul>

<h3>Day-0, day-1 and day-2</h3>
<table class="cmp"><tr><th>Phase</th><th>Goal</th><th>Typical content</th><th>Typical tool</th></tr>
<tr><td><b>Day-0</b></td><td>Make the device reachable and part of the fabric</td><td>Software image, management IP, fabric underlay, bootstrap, zero-touch provisioning</td><td>Power On Auto Provisioning (POAP) with NDFC, APIC fabric discovery</td></tr>
<tr><td><b>Day-1</b></td><td>Make the fabric useful for applications</td><td>VRFs, networks, tenants, EPGs, policies, server profiles</td><td>Controller templates, Ansible, Terraform</td></tr>
<tr><td><b>Day-2</b></td><td>Keep it healthy and change it safely</td><td>Add networks, upgrade, monitor, detect drift, troubleshoot</td><td>Pipeline, telemetry, Nexus Dashboard Insights</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="IaC workflow">
<rect x="10" y="20" width="110" height="60" rx="10" fill="#fde68a"/><text x="65" y="48" text-anchor="middle" class="svg-ink" font-size="13">Git repo</text><text x="65" y="66" text-anchor="middle" class="svg-muted" font-size="12">desired state</text>
<rect x="150" y="20" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="205" y="48" text-anchor="middle" class="svg-ink" font-size="13">Review</text><text x="205" y="66" text-anchor="middle" class="svg-muted" font-size="12">pull request</text>
<rect x="290" y="20" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="345" y="48" text-anchor="middle" class="svg-ink" font-size="13">Validate</text><text x="345" y="66" text-anchor="middle" class="svg-muted" font-size="12">lint + plan</text>
<rect x="430" y="20" width="110" height="60" rx="10" fill="#bae6fd"/><text x="485" y="48" text-anchor="middle" class="svg-ink" font-size="13">Apply</text><text x="485" y="66" text-anchor="middle" class="svg-muted" font-size="12">controller API</text>
<rect x="430" y="130" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="485" y="158" text-anchor="middle" class="svg-ink" font-size="13">Fabric</text><text x="485" y="176" text-anchor="middle" class="svg-muted" font-size="12">running state</text>
<rect x="150" y="130" width="250" height="60" rx="10" fill="#fed7aa"/><text x="275" y="158" text-anchor="middle" class="svg-ink" font-size="13">Drift check</text><text x="275" y="176" text-anchor="middle" class="svg-muted" font-size="12">running vs desired, daily</text>
<g stroke="#64748b" stroke-width="1.5" fill="none"><line x1="120" y1="50" x2="150" y2="50"/><line x1="260" y1="50" x2="290" y2="50"/><line x1="400" y1="50" x2="430" y2="50"/><line x1="485" y1="80" x2="485" y2="130"/><line x1="430" y1="160" x2="400" y2="160"/><path d="M150 160 L65 160 L65 80"/></g>
<rect x="10" y="222" width="14" height="14" fill="#fde68a"/><text x="30" y="234" class="svg-muted" font-size="12">source of truth</text>
<rect x="150" y="222" width="14" height="14" fill="#ddd6fe"/><text x="170" y="234" class="svg-muted" font-size="12">gate</text>
<rect x="220" y="222" width="14" height="14" fill="#bae6fd"/><text x="240" y="234" class="svg-muted" font-size="12">change</text>
<rect x="300" y="222" width="14" height="14" fill="#fed7aa"/><text x="320" y="234" class="svg-muted" font-size="12">control loop</text>
</svg><p class="cap">The loop: Git holds the desired state, gates protect it, the controller applies it, and a drift check compares reality back to Git.</p></div>

<h3>What is a source of truth?</h3>
<p>The <b>source of truth</b> is the one place that defines what the network should look like. Options include a Git repository of YAML files, an IP address management and data center infrastructure tool, or the controller database itself. For Kestrel the design uses Git for intent (VRFs, networks, tenant attachments) and the controller as the system that holds the deployed state. <b>Idempotent</b> tools, which can be run many times and only change what is different, make this safe: running the same playbook twice must not break anything.</p>

<h3>Options compared</h3>
<table class="cmp"><tr><th>Approach</th><th>Pro</th><th>Con</th></tr>
<tr><td>Controller GUI only</td><td>Fast to learn</td><td>No review, no repeatability, hard to clone a site</td></tr>
<tr><td>Ansible playbooks in Git</td><td>Readable, good for tasks and ordering</td><td>No built-in state file; you must design drift checks</td></tr>
<tr><td>Terraform in Git</td><td>State and plan before apply, clean for long-lived objects</td><td>State file must be protected and shared safely</td></tr>
<tr><td>Both: Terraform for objects, Ansible for operational tasks</td><td>Right tool per job</td><td>Two skill sets</td></tr>
</table>

<h3>Chosen design</h3>
<p>Kestrel uses Terraform for tenants, VRFs and policies, Ansible for day-2 tasks such as attaching networks and gathering facts, and the controller template engine for the underlay. Pipeline stages: lint, plan, human approval, apply inside the change window, then a post-check. The change freeze is encoded in the pipeline: from 1 November the apply stage refuses everything except an emergency tag that needs two approvers.</p>

<div class="eg"><p><b>Worked example.</b> The third site needs 40 networks. In the old model that is 40 manual GUI sessions, about 20 hours. With IaC, the engineer copies a site folder, changes the site name and the IP ranges (for example 198.51.100.0/24 documentation addressing for the transit), runs plan and sees 40 additions, and apply finishes in 15 minutes. Review of the plan takes longer than the apply, which is the point.</p></div>

<pre class="code"><span class="c"># Ansible: ensure a fabric network exists (idempotent), using the NDFC collection</span>
- name: Create network claims-web
  cisco.dcnm.dcnm_network:
    fabric: Kestrel-DC1
    state: merged
    config:
      - net_name: claims-web
        vrf_name: Prod
        net_id: 30001
        vlan_id: 2300
</pre>

<div class="note"><p>The collection and module names above are real Cisco collection names; check the argument list for your release before use.</p></div>

<h3>What went wrong</h3>
<div class="scn"><h4>The manual fix that came back</h4><p>During a Sunday incident an engineer fixed a routing policy directly on one spine through the CLI. Everything recovered. Two weeks later the pipeline re-applied the old policy from Git and the outage returned. The team had no drift check and no rule that emergency fixes must be copied back to Git. After the incident they added a daily drift report, a break-glass procedure that allows CLI access but opens a ticket that must be closed by a pull request, and a rule that the on-call engineer owns the back-port.</p><p><b>Lesson:</b> a source of truth is only true if every change, including emergencies, ends up in it.</p></div>

<div class="exam"><p><b>Exam trap.</b> Day-0 is about reachability and fabric bring-up, not tenant policy. Tenant and application objects are day-1. Upgrades, monitoring and drift handling are day-2.</p></div>

<div class="warn"><p><b>Common mistake.</b> Storing secrets (passwords, API keys) in the Git repository. Use a vault or the pipeline's secret store and reference variables only.</p></div>

<div class="iv"><p class="q">"What is the difference between day-0, day-1 and day-2 automation, and where would you use Terraform versus Ansible?"</p><p>Strong answer: day-0 brings devices into the fabric, day-1 delivers the services and policies, day-2 operates and changes safely. Terraform fits declared long-lived objects with plan and state; Ansible fits ordered tasks and operational jobs. Mention Git review, idempotence and drift detection.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IaC keeps desired state in versioned files that are reviewed and applied by tools.</li>
<li>Day-0 bootstrap, day-1 services, day-2 operations.</li>
<li>Idempotent tools allow safe re-runs; plan shows the effect before apply.</li>
<li>Drift detection and back-porting emergency changes keep the source of truth honest.</li>
<li>Encode change freezes and approvals in the pipeline.</li>
</ul></div>
`,hi:`
<p><b>Analogy.</b> Ek restaurant chain har branch ko apni recipe banane nahi deti. Master recipe book (source of truth) har dish define karti hai, kitchen manual naya branch kholna sikhata hai, aur daily checklists har branch ko consistent rakhti hain. Infrastructure as code (IaC) network ke liye wahi idea hai: desired state files mein likhi jaati hai, review hoti hai, version hoti hai aur tools se apply hoti hai.</p>

<h3>Customer case: Kestrel Retail</h3>
<p>Kestrel Retail Bengaluru ki ek online retailer hai jiske paas ek main data center, ek colocation cage aur 9 mahine mein teesri site kholne ka plan hai. Uske paas 24 leaf switches, 6 spines aur 5 logon ki infrastructure team hai, aur change budget hai: saal mein change-related downtime 2 ghante se zyada nahi. Peak season November se January hai aur us window mein change freeze lagta hai. Pichle saal teen outages do spine switches ki configuration differences se hue, aur nayi site pehli site jaisi identical banani hai. CTO ka goal: nayi site usi code se, mahino mein nahi, dino mein banana.</p>

<h3>Requirements aur constraints</h3>
<ul>
<li>Sites ke across identical configuration, drift ek din ke andar detect ho.</li>
<li>Kisi bhi change se pehle peer review, aur rollback path.</li>
<li>Kaam ke teen phases alag hon: initial build, tenant onboarding, aur ongoing changes.</li>
<li>Budget mein ek controller aur ek pipeline server hai, alag database product ka extra licence nahi.</li>
</ul>

<h3>Day-0, day-1 aur day-2</h3>
<table class="cmp"><tr><th>Phase</th><th>Goal</th><th>Typical content</th><th>Typical tool</th></tr>
<tr><td><b>Day-0</b></td><td>Device reachable ho aur fabric ka hissa bane</td><td>Software image, management IP, fabric underlay, bootstrap, zero-touch provisioning</td><td>NDFC ke saath Power On Auto Provisioning (POAP), APIC fabric discovery</td></tr>
<tr><td><b>Day-1</b></td><td>Fabric applications ke liye useful bane</td><td>VRFs, networks, tenants, EPGs, policies, server profiles</td><td>Controller templates, Ansible, Terraform</td></tr>
<tr><td><b>Day-2</b></td><td>Healthy rakhna aur safely change karna</td><td>Networks add karna, upgrade, monitor, drift detect, troubleshoot</td><td>Pipeline, telemetry, Nexus Dashboard Insights</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="IaC workflow">
<rect x="10" y="20" width="110" height="60" rx="10" fill="#fde68a"/><text x="65" y="48" text-anchor="middle" class="svg-ink" font-size="13">Git repo</text><text x="65" y="66" text-anchor="middle" class="svg-muted" font-size="12">desired state</text>
<rect x="150" y="20" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="205" y="48" text-anchor="middle" class="svg-ink" font-size="13">Review</text><text x="205" y="66" text-anchor="middle" class="svg-muted" font-size="12">pull request</text>
<rect x="290" y="20" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="345" y="48" text-anchor="middle" class="svg-ink" font-size="13">Validate</text><text x="345" y="66" text-anchor="middle" class="svg-muted" font-size="12">lint + plan</text>
<rect x="430" y="20" width="110" height="60" rx="10" fill="#bae6fd"/><text x="485" y="48" text-anchor="middle" class="svg-ink" font-size="13">Apply</text><text x="485" y="66" text-anchor="middle" class="svg-muted" font-size="12">controller API</text>
<rect x="430" y="130" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="485" y="158" text-anchor="middle" class="svg-ink" font-size="13">Fabric</text><text x="485" y="176" text-anchor="middle" class="svg-muted" font-size="12">running state</text>
<rect x="150" y="130" width="250" height="60" rx="10" fill="#fed7aa"/><text x="275" y="158" text-anchor="middle" class="svg-ink" font-size="13">Drift check</text><text x="275" y="176" text-anchor="middle" class="svg-muted" font-size="12">running vs desired, daily</text>
<g stroke="#64748b" stroke-width="1.5" fill="none"><line x1="120" y1="50" x2="150" y2="50"/><line x1="260" y1="50" x2="290" y2="50"/><line x1="400" y1="50" x2="430" y2="50"/><line x1="485" y1="80" x2="485" y2="130"/><line x1="430" y1="160" x2="400" y2="160"/><path d="M150 160 L65 160 L65 80"/></g>
<rect x="10" y="222" width="14" height="14" fill="#fde68a"/><text x="30" y="234" class="svg-muted" font-size="12">source of truth</text>
<rect x="150" y="222" width="14" height="14" fill="#ddd6fe"/><text x="170" y="234" class="svg-muted" font-size="12">gate</text>
<rect x="220" y="222" width="14" height="14" fill="#bae6fd"/><text x="240" y="234" class="svg-muted" font-size="12">change</text>
<rect x="300" y="222" width="14" height="14" fill="#fed7aa"/><text x="320" y="234" class="svg-muted" font-size="12">control loop</text>
</svg><p class="cap">Loop: Git desired state rakhta hai, gates usse protect karte hain, controller apply karta hai, aur drift check reality ko wapas Git se compare karta hai.</p></div>

<h3>Source of truth kya hota hai?</h3>
<p><b>Source of truth</b> wo ek jagah hai jo define karti hai ki network kaisa dikhna chahiye. Options: YAML files ka Git repository, IP address management aur data center infrastructure tool, ya controller database khud. Kestrel ke design mein intent (VRFs, networks, tenant attachments) Git mein rehta hai aur deployed state controller rakhta hai. <b>Idempotent</b> tools, jo kai baar chalaye ja sakte hain aur sirf wahi badalte hain jo alag hai, isse safe banate hain: wahi playbook do baar chalane se kuch nahi tootna chahiye.</p>

<h3>Options ki tulna</h3>
<table class="cmp"><tr><th>Approach</th><th>Pro</th><th>Con</th></tr>
<tr><td>Sirf controller GUI</td><td>Seekhna aasan</td><td>Review nahi, repeatability nahi, site clone karna mushkil</td></tr>
<tr><td>Git mein Ansible playbooks</td><td>Readable, tasks aur ordering ke liye achha</td><td>Built-in state file nahi; drift checks aapko design karne padte hain</td></tr>
<tr><td>Git mein Terraform</td><td>Apply se pehle state aur plan, long-lived objects ke liye clean</td><td>State file ko protect aur safely share karna padta hai</td></tr>
<tr><td>Dono: objects ke liye Terraform, operational tasks ke liye Ansible</td><td>Har kaam ke liye sahi tool</td><td>Do skill sets</td></tr>
</table>

<h3>Chosen design</h3>
<p>Kestrel tenants, VRFs aur policies ke liye Terraform, day-2 tasks (networks attach karna, facts gather karna) ke liye Ansible, aur underlay ke liye controller template engine use karta hai. Pipeline stages: lint, plan, human approval, change window mein apply, phir post-check. Change freeze pipeline mein hi encode hai: 1 November se apply stage emergency tag ke bina sab refuse karta hai, aur emergency tag ke liye do approvers chahiye.</p>

<div class="eg"><p><b>Worked example.</b> Teesri site ko 40 networks chahiye. Purane model mein yeh 40 manual GUI sessions hain, lagbhag 20 ghante. IaC mein engineer site folder copy karta hai, site name aur IP ranges badalta hai (jaise transit ke liye documentation addressing 198.51.100.0/24), plan chalata hai aur 40 additions dekhta hai, aur apply 15 minute mein khatam. Plan ka review apply se zyada time leta hai, aur yahi point hai.</p></div>

<pre class="code"><span class="c"># Ansible: fabric network ensure karna (idempotent), NDFC collection ke saath</span>
- name: Create network claims-web
  cisco.dcnm.dcnm_network:
    fabric: Kestrel-DC1
    state: merged
    config:
      - net_name: claims-web
        vrf_name: Prod
        net_id: 30001
        vlan_id: 2300
</pre>

<div class="note"><p>Upar ke collection aur module names real Cisco collection names hain; use karne se pehle apni release ki argument list check karo.</p></div>

<h3>Kya galat hua</h3>
<div class="scn"><h4>Wo manual fix jo wapas aa gaya</h4><p>Ek Sunday incident mein engineer ne ek spine par CLI se seedha routing policy fix ki. Sab recover ho gaya. Do hafte baad pipeline ne Git se purani policy dobara apply kar di aur outage wapas aa gaya. Team ke paas drift check nahi tha aur koi rule nahi tha ki emergency fixes Git mein wapas copy hon. Incident ke baad unhone daily drift report, break-glass procedure (CLI access allowed lekin ticket khulta hai jo pull request se close hota hai) aur rule joda ki on-call engineer back-port ka owner hai.</p><p><b>Lesson:</b> source of truth tabhi true hai jab har change, emergency samet, usme pahunche.</p></div>

<div class="exam"><p><b>Exam trap.</b> Day-0 reachability aur fabric bring-up hai, tenant policy nahi. Tenant aur application objects day-1 hain. Upgrades, monitoring aur drift handling day-2 hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Secrets (passwords, API keys) Git repository mein rakhna. Vault ya pipeline ka secret store use karo aur sirf variables reference karo.</p></div>

<div class="iv"><p class="q">"Day-0, day-1 aur day-2 automation mein kya fark hai, aur Terraform vs Ansible kahan use karoge?"</p><p>Strong answer: day-0 devices ko fabric mein laata hai, day-1 services aur policies deta hai, day-2 operate aur safely change karta hai. Terraform declared long-lived objects ke liye (plan aur state ke saath); Ansible ordered tasks aur operational jobs ke liye. Git review, idempotence aur drift detection zaroor batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IaC desired state ko versioned files mein rakhta hai jo review hoti hain aur tools se apply hoti hain.</li>
<li>Day-0 bootstrap, day-1 services, day-2 operations.</li>
<li>Idempotent tools safe re-run dete hain; plan apply se pehle effect dikhata hai.</li>
<li>Drift detection aur emergency changes ka back-port source of truth ko imaandar rakhte hain.</li>
<li>Change freeze aur approvals pipeline mein encode karo.</li>
</ul></div>
`}};export{e as default};