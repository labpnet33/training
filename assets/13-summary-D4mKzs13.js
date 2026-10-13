var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a long flight, pilots do not rely on memory; they run a checklist, item by item, even after thousands of flights. This chapter is your pre-flight checklist for the automation, operations and security part of 350-601. Go through it, and for every line you cannot do or explain in your own words, go back to the chapter named in brackets.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module map">
<rect x="10" y="10" width="300" height="40" rx="8" fill="#bae6fd"/><text x="160" y="35" text-anchor="middle" class="svg-ink" font-size="13">Data: JSON, XML, YAML, YANG, | json</text>
<rect x="330" y="10" width="300" height="40" rx="8" fill="#ddd6fe"/><text x="480" y="35" text-anchor="middle" class="svg-ink" font-size="13">APIs: NX-API CLI and REST, APIC REST</text>
<rect x="10" y="60" width="300" height="40" rx="8" fill="#bbf7d0"/><text x="160" y="85" text-anchor="middle" class="svg-ink" font-size="13">Tools: Python, Ansible, Terraform</text>
<rect x="330" y="60" width="300" height="40" rx="8" fill="#fde68a"/><text x="480" y="85" text-anchor="middle" class="svg-ink" font-size="13">Controllers: NDFC, Insights, POAP</text>
<rect x="10" y="110" width="300" height="40" rx="8" fill="#fed7aa"/><text x="160" y="135" text-anchor="middle" class="svg-ink" font-size="13">Operate: telemetry, rollback, SPAN, ISSU</text>
<rect x="330" y="110" width="300" height="40" rx="8" fill="#e2e8f0"/><text x="480" y="135" text-anchor="middle" class="svg-ink" font-size="13">Secure: AAA, RBAC, CoPP, SAN, contracts</text>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="13">Structured data feeds tools; tools and controllers operate and secure the fabric.</text>
</svg><p class="cap">The six blocks of this module and how they build on each other.</p></div>

<h3>Checklist: you should be able to...</h3>
<ul>
<li>Explain why data centers automate, with a before and after example and the word idempotent (ch. 1).</li>
<li>Write the same interface in JSON, XML and YAML, and explain YANG, NETCONF, RESTCONF and gNMI (ch. 2).</li>
<li>Use <code>| json</code>, <code>| json-pretty</code> and <code>| xml</code>, find <code>proc_board_id</code> and read TABLE_ and ROW_ keys (ch. 3).</li>
<li>Enable NX-API, check it with <code>show nxapi</code>, build a cli_show request and read VLAN names from the reply (ch. 4).</li>
<li>Explain NX-API REST with DN and class, and APIC REST with aaaLogin, <code>/api/mo</code> and <code>/api/class</code> (ch. 4, 6).</li>
<li>Read an Ansible inventory and playbook, pick the right resource-module state, and compare Ansible and Terraform (ch. 5).</li>
<li>Describe the NDFC fabric workflow and what Insights and Orchestrator add (ch. 6).</li>
<li>Walk through POAP step by step, including DHCP options 66/150 and 67 (ch. 7).</li>
<li>Configure dial-out telemetry and explain dial-in, NetFlow and sFlow, and what to alert on (ch. 8).</li>
<li>Checkpoint, preview a rollback patch, roll back and verify; use configure replace with commit-timeout (ch. 9).</li>
<li>Build a SPAN session, fix "Dst in wrong mode", and plan an ISSU or disruptive upgrade for a vPC pair (ch. 10).</li>
<li>Configure AAA and custom roles, fix a user with an extra role, and explain CoPP and first-hop security (ch. 11).</li>
<li>Explain UCS roles and locales, secure boot, SAN zoning, port security and fabric binding, and ACI contracts (ch. 12).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Idempotent</dt><dd>Running again changes nothing if the device already matches the intent.</dd>
<dt>NX-API</dt><dd>The NX-OS API: CLI commands in JSON/XML to <code>/ins</code>, or REST on the DME object model.</dd>
<dt>DME / MIT</dt><dd>The object trees behind NX-OS and ACI; every object has a class and a DN.</dd>
<dt>NDFC</dt><dd>Nexus Dashboard Fabric Controller, formerly DCNM; builds fabrics from templates.</dd>
<dt>POAP</dt><dd>Power-On Auto Provisioning; zero-touch first boot for Nexus switches.</dd>
<dt>Dial-out / dial-in</dt><dd>Telemetry session started by the switch / by the collector (gNMI).</dd>
<dt>Checkpoint</dt><dd>A saved copy of the running configuration on the switch, used for rollback.</dd>
<dt>ERSPAN</dt><dd>SPAN copies encapsulated in GRE and routed to a remote analyzer.</dd>
<dt>ISSU</dt><dd>In-Service Software Upgrade without data-plane disruption, where supported.</dd>
<dt>CoPP</dt><dd>Control Plane Policing; rate-limits traffic to the supervisor CPU.</dd>
<dt>Locale</dt><dd>UCS Manager object that limits a user's roles to certain organizations.</dd>
<dt>Contract</dt><dd>ACI policy that allows traffic between a provider EPG and a consumer EPG.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>NX-API</td><td><code>feature nxapi</code>; HTTPS 443 by default; endpoint <code>/ins</code>; cli_show = JSON, cli_show_ascii = text, cli_conf = config; runs with the user's role</td></tr>
<tr><td>Structured output</td><td><code>| json</code>, <code>| json-pretty</code>, <code>| xml</code>; TABLE_x and ROW_x; one row = one object</td></tr>
<tr><td>Ansible</td><td>Agentless, YAML, cisco.nxos and cisco.aci; merged, replaced, overridden, deleted, gathered</td></tr>
<tr><td>Terraform</td><td>Declarative HCL, providers, init/plan/apply, state file</td></tr>
<tr><td>POAP</td><td>No startup-config; DHCP option 66/150 server and 67 script; script has MD5 line</td></tr>
<tr><td>Telemetry</td><td>Push; GPB or JSON; gRPC; sample interval in ms; dial-out vs gNMI dial-in</td></tr>
<tr><td>Rollback</td><td>Checkpoint in exec mode; up to 10 user checkpoints; atomic default; best-effort; stop-at-first-failure</td></tr>
<tr><td>SPAN</td><td>Destination needs <code>switchport monitor</code>; sessions start shut; ERSPAN uses GRE</td></tr>
<tr><td>Upgrades</td><td><code>show install all impact</code>, <code>install all</code>; vPC peers one at a time; EPLD separate and disruptive</td></tr>
<tr><td>AAA and RBAC</td><td>TACACS+ TCP 49, RADIUS UDP 1812/1813; network-admin / network-operator; roles add up; rules highest number first</td></tr>
<tr><td>Storage and ACI</td><td>Zoning on fabric, masking on array; port security and fabric binding; contracts are an allow-list</td></tr>
</table>

<div class="eg"><p><b>Worked example: a mixed exam-style question.</b> "An automation account must read interface data from 200 Nexus switches every minute but must never change configuration. What is the best design?" Answer: use streaming telemetry (dial-out, DME path <code>sys/intf</code>) or NX-API cli_show calls with a service account mapped to network-operator (or a custom read-only role) through TACACS+, over the management VRF. The distractors would be SNMP write communities, the admin account, or screen-scraping over SSH. The reasoning combines four chapters: telemetry, NX-API, RBAC and AAA.</p></div>

<div class="warn"><p><b>Last-minute traps.</b> <code>username X role Y</code> adds, it does not replace. <code>overridden</code> removes what you did not list. A SPAN session that is configured and not shut can still be down. A rollback does not save. POAP only runs without a startup configuration. YANG is a model, not an encoding.</p></div>
<div class="exam"><p><b>Exam strategy.</b> Read every option fully: many distractors are real commands in the wrong mode or with the wrong keyword. When two answers look right, choose the one that is least privilege, verifiable and reversible; that is how Cisco writes its "best practice" answers.</p></div>

<div class="scn"><h4>An automated change with a safety net, end to end</h4><p>A team had to add VRF TENANT-B and three networks to a 40-leaf NDFC fabric. They defined the VRF and networks in YAML, had a colleague review the pull request, and let Insights run a pre-change analysis. On the night, they took checkpoints on the border leaves, pushed the definitions with the cisco.dcnm Ansible collection, reviewed the pending configuration in NDFC, deployed, watched telemetry for drops, and verified with <code>show nve peers</code> and pings. One border leaf rejected a route-map line because of a typo in a freeform policy; NDFC flagged the failed deployment, they previewed the rollback patch on that leaf, rolled back, fixed the YAML and redeployed within the window.</p><p><b>Lesson:</b> the real skill is combining the pieces: source of truth, preview, controller, telemetry and rollback.</p></div>

<div class="iv"><p class="q">"Tell me how you would make changes in a data center fabric safely and at scale."</p><p>Strong answer: keep intent in Git as a source of truth, render and review changes, deploy through a controller or idempotent Ansible modules, check mode or pre-change analysis first, checkpoints before touching devices, streaming telemetry and post-checks to verify, and rollback or configure replace with commit-timeout if verification fails. Secure the pipeline with least-privilege service accounts and AAA accounting. Give one real example.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Structured data and APIs (NX-API, APIC REST) are the foundation of every tool in this module.</li>
<li>Python, Ansible, Terraform and NDFC each fit different jobs; idempotency and a source of truth make them safe.</li>
<li>POAP handles Day 0; telemetry, checkpoints, SPAN and planned upgrades handle Day 2.</li>
<li>Security is layered: AAA and RBAC, CoPP, first-hop security, compute and SAN controls, ACI contracts.</li>
<li>For exam and job alike: least privilege, verify everything, and always have a way back.</li>
</ul></div>
`,hi:`
<p>Lambi flight se pehle pilots yaaddasht par bharosa nahi karte; woh checklist chalate hain, item by item, hazaaron flights ke baad bhi. Yeh chapter 350-601 ke automation, operations aur security hisse ke liye aapki pre-flight checklist hai. Ise poora dekho, aur har line jo aap apne shabdon mein na kar pao ya samjha na pao, uske liye brackets mein diye chapter par wapas jaao.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module map">
<rect x="10" y="10" width="300" height="40" rx="8" fill="#bae6fd"/><text x="160" y="35" text-anchor="middle" class="svg-ink" font-size="13">Data: JSON, XML, YAML, YANG, | json</text>
<rect x="330" y="10" width="300" height="40" rx="8" fill="#ddd6fe"/><text x="480" y="35" text-anchor="middle" class="svg-ink" font-size="13">APIs: NX-API CLI aur REST, APIC REST</text>
<rect x="10" y="60" width="300" height="40" rx="8" fill="#bbf7d0"/><text x="160" y="85" text-anchor="middle" class="svg-ink" font-size="13">Tools: Python, Ansible, Terraform</text>
<rect x="330" y="60" width="300" height="40" rx="8" fill="#fde68a"/><text x="480" y="85" text-anchor="middle" class="svg-ink" font-size="13">Controllers: NDFC, Insights, POAP</text>
<rect x="10" y="110" width="300" height="40" rx="8" fill="#fed7aa"/><text x="160" y="135" text-anchor="middle" class="svg-ink" font-size="13">Operate: telemetry, rollback, SPAN, ISSU</text>
<rect x="330" y="110" width="300" height="40" rx="8" fill="#e2e8f0"/><text x="480" y="135" text-anchor="middle" class="svg-ink" font-size="13">Secure: AAA, RBAC, CoPP, SAN, contracts</text>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="13">Structured data tools ko feed karta hai; tools aur controllers fabric chalate aur bachate hain.</text>
</svg><p class="cap">Is module ke chhe blocks aur woh ek dusre par kaise bante hain.</p></div>

<h3>Checklist: aapko yeh kar paana chahiye...</h3>
<ul>
<li>Pehle aur baad ke example aur idempotent shabd ke saath samjhao ki data centers automate kyun karte hain (ch. 1).</li>
<li>Same interface JSON, XML aur YAML mein likho, aur YANG, NETCONF, RESTCONF aur gNMI samjhao (ch. 2).</li>
<li><code>| json</code>, <code>| json-pretty</code> aur <code>| xml</code> use karo, <code>proc_board_id</code> dhoondho aur TABLE_ aur ROW_ keys padho (ch. 3).</li>
<li>NX-API enable karo, <code>show nxapi</code> se check karo, cli_show request banao aur reply se VLAN names padho (ch. 4).</li>
<li>DN aur class ke saath NX-API REST, aur aaaLogin, <code>/api/mo</code> aur <code>/api/class</code> ke saath APIC REST samjhao (ch. 4, 6).</li>
<li>Ansible inventory aur playbook padho, sahi resource-module state chuno, aur Ansible aur Terraform compare karo (ch. 5).</li>
<li>NDFC fabric workflow aur Insights aur Orchestrator kya jodte hain, describe karo (ch. 6).</li>
<li>POAP step by step samjhao, DHCP options 66/150 aur 67 samet (ch. 7).</li>
<li>Dial-out telemetry configure karo aur dial-in, NetFlow aur sFlow, aur kis par alert karna hai samjhao (ch. 8).</li>
<li>Checkpoint lo, rollback patch preview karo, rollback karo aur verify karo; commit-timeout ke saath configure replace use karo (ch. 9).</li>
<li>SPAN session banao, "Dst in wrong mode" theek karo, aur vPC pair ke liye ISSU ya disruptive upgrade plan karo (ch. 10).</li>
<li>AAA aur custom roles configure karo, extra role wale user ko theek karo, aur CoPP aur first-hop security samjhao (ch. 11).</li>
<li>UCS roles aur locales, secure boot, SAN zoning, port security aur fabric binding, aur ACI contracts samjhao (ch. 12).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Idempotent</dt><dd>Device pehle se intent se match kare to dobara chalane par kuch nahi badalta.</dd>
<dt>NX-API</dt><dd>NX-OS API: <code>/ins</code> par JSON/XML mein CLI commands, ya DME object model par REST.</dd>
<dt>DME / MIT</dt><dd>NX-OS aur ACI ke peeche ke object trees; har object ki class aur DN hoti hai.</dd>
<dt>NDFC</dt><dd>Nexus Dashboard Fabric Controller, pehle DCNM; templates se fabrics banata hai.</dd>
<dt>POAP</dt><dd>Power-On Auto Provisioning; Nexus switches ke liye zero-touch first boot.</dd>
<dt>Dial-out / dial-in</dt><dd>Telemetry session switch shuru kare / collector shuru kare (gNMI).</dd>
<dt>Checkpoint</dt><dd>Switch par running configuration ki saved copy, rollback ke liye.</dd>
<dt>ERSPAN</dt><dd>SPAN copies jo GRE mein encapsulate ho kar remote analyzer tak route hoti hain.</dd>
<dt>ISSU</dt><dd>In-Service Software Upgrade, jahan supported ho data-plane disruption ke bina.</dd>
<dt>CoPP</dt><dd>Control Plane Policing; supervisor CPU tak jaane wale traffic ko rate-limit karta hai.</dd>
<dt>Locale</dt><dd>UCS Manager object jo user ke roles ko kuch organizations tak seemit karta hai.</dd>
<dt>Contract</dt><dd>ACI policy jo provider EPG aur consumer EPG ke beech traffic allow karti hai.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>NX-API</td><td><code>feature nxapi</code>; default HTTPS 443; endpoint <code>/ins</code>; cli_show = JSON, cli_show_ascii = text, cli_conf = config; user ke role se chalta hai</td></tr>
<tr><td>Structured output</td><td><code>| json</code>, <code>| json-pretty</code>, <code>| xml</code>; TABLE_x aur ROW_x; ek row = ek object</td></tr>
<tr><td>Ansible</td><td>Agentless, YAML, cisco.nxos aur cisco.aci; merged, replaced, overridden, deleted, gathered</td></tr>
<tr><td>Terraform</td><td>Declarative HCL, providers, init/plan/apply, state file</td></tr>
<tr><td>POAP</td><td>Startup-config nahi; DHCP option 66/150 server aur 67 script; script mein MD5 line</td></tr>
<tr><td>Telemetry</td><td>Push; GPB ya JSON; gRPC; ms mein sample interval; dial-out vs gNMI dial-in</td></tr>
<tr><td>Rollback</td><td>Exec mode mein checkpoint; 10 tak user checkpoints; atomic default; best-effort; stop-at-first-failure</td></tr>
<tr><td>SPAN</td><td>Destination ko <code>switchport monitor</code> chahiye; sessions shut shuru hote hain; ERSPAN GRE use karta hai</td></tr>
<tr><td>Upgrades</td><td><code>show install all impact</code>, <code>install all</code>; vPC peers ek ek karke; EPLD alag aur disruptive</td></tr>
<tr><td>AAA aur RBAC</td><td>TACACS+ TCP 49, RADIUS UDP 1812/1813; network-admin / network-operator; roles judte hain; rules sabse bada number pehle</td></tr>
<tr><td>Storage aur ACI</td><td>Zoning fabric par, masking array par; port security aur fabric binding; contracts allow-list hain</td></tr>
</table>

<div class="eg"><p><b>Worked example: mixed exam-style sawaal.</b> "Ek automation account ko har minute 200 Nexus switches se interface data padhna hai lekin kabhi configuration nahi badalni. Best design kya hai?" Jawab: streaming telemetry (dial-out, DME path <code>sys/intf</code>) ya NX-API cli_show calls use karo, ek service account ke saath jo TACACS+ ke through network-operator (ya custom read-only role) se mapped ho, management VRF par. Distractors honge SNMP write communities, admin account, ya SSH par screen-scraping. Reasoning chaar chapters ko jodti hai: telemetry, NX-API, RBAC aur AAA.</p></div>

<div class="warn"><p><b>Aakhri minute ke traps.</b> <code>username X role Y</code> jodta hai, replace nahi karta. <code>overridden</code> woh hata deta hai jo aapne list nahi kiya. Configured aur not-shut SPAN session bhi down ho sakta hai. Rollback save nahi karta. POAP sirf startup configuration ke bina chalta hai. YANG model hai, encoding nahi.</p></div>
<div class="exam"><p><b>Exam strategy.</b> Har option poora padho: bahut saare distractors galat mode mein ya galat keyword ke saath asli commands hote hain. Jab do jawab sahi lagein, woh chuno jo least privilege, verifiable aur reversible ho; Cisco apne "best practice" jawab aise hi likhta hai.</p></div>

<div class="scn"><h4>Safety net ke saath automated change, shuru se end tak</h4><p>Ek team ko 40-leaf NDFC fabric mein VRF TENANT-B aur teen networks jodne the. Unhone VRF aur networks YAML mein define kiye, colleague se pull request review karwaya, aur Insights se pre-change analysis chalwaya. Raat ko unhone border leaves par checkpoints liye, cisco.dcnm Ansible collection se definitions push ki, NDFC mein pending configuration review kiya, deploy kiya, drops ke liye telemetry dekhi, aur <code>show nve peers</code> aur pings se verify kiya. Ek border leaf ne freeform policy ke typo ki wajah se ek route-map line reject kar di; NDFC ne failed deployment flag kiya, unhone us leaf par rollback patch preview kiya, rollback kiya, YAML theek kiya aur window ke andar redeploy kiya.</p><p><b>Seekh:</b> asli skill pieces ko jodna hai: source of truth, preview, controller, telemetry aur rollback.</p></div>

<div class="iv"><p class="q">"Batao aap data center fabric mein safely aur scale par changes kaise karoge."</p><p>Strong answer: intent ko Git mein source of truth ki tarah rakho, changes render aur review karo, controller ya idempotent Ansible modules se deploy karo, pehle check mode ya pre-change analysis, devices chhoone se pehle checkpoints, verify karne ke liye streaming telemetry aur post-checks, aur verification fail ho to rollback ya commit-timeout ke saath configure replace. Pipeline ko least-privilege service accounts aur AAA accounting se secure karo. Ek real example do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Structured data aur APIs (NX-API, APIC REST) is module ke har tool ki neev hain.</li>
<li>Python, Ansible, Terraform aur NDFC har ek alag kaam mein fit hote hain; idempotency aur source of truth unhe safe banate hain.</li>
<li>POAP Day 0 sambhalta hai; telemetry, checkpoints, SPAN aur planned upgrades Day 2 sambhalte hain.</li>
<li>Security layered hai: AAA aur RBAC, CoPP, first-hop security, compute aur SAN controls, ACI contracts.</li>
<li>Exam aur job dono ke liye: least privilege, sab kuch verify karo, aur hamesha wapas jaane ka raasta rakho.</li>
</ul></div>
`}};export{e as default};