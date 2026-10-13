var e=`<svg viewBox="0 0 640 200" role="img" aria-label="Module summary: confirm the symptom, check DNS, route, filters, service, then monitor over time with flow logs and Connection Monitor">
<rect x="15" y="20" width="95" height="60" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="62" y="46" text-anchor="middle" class="svg-ink" font-size="12">1 Symptom</text><text x="62" y="64" text-anchor="middle" class="svg-muted" font-size="10">reproduce</text>
<rect x="125" y="20" width="95" height="60" rx="10" fill="#bbf7d0" stroke="#64748b"/><text x="172" y="46" text-anchor="middle" class="svg-ink" font-size="12">2 DNS</text><text x="172" y="64" text-anchor="middle" class="svg-muted" font-size="10">nslookup</text>
<rect x="235" y="20" width="95" height="60" rx="10" fill="#fed7aa" stroke="#64748b"/><text x="282" y="46" text-anchor="middle" class="svg-ink" font-size="12">3 Route</text><text x="282" y="64" text-anchor="middle" class="svg-muted" font-size="10">next hop</text>
<rect x="345" y="20" width="95" height="60" rx="10" fill="#ddd6fe" stroke="#64748b"/><text x="392" y="46" text-anchor="middle" class="svg-ink" font-size="12">4 Filter</text><text x="392" y="64" text-anchor="middle" class="svg-muted" font-size="10">IP flow verify</text>
<rect x="455" y="20" width="80" height="60" rx="10" fill="#fde68a" stroke="#64748b"/><text x="495" y="46" text-anchor="middle" class="svg-ink" font-size="12">5 Service</text><text x="495" y="64" text-anchor="middle" class="svg-muted" font-size="10">capture</text>
<rect x="550" y="20" width="80" height="60" rx="10" fill="#fecaca" stroke="#64748b"/><text x="590" y="46" text-anchor="middle" class="svg-ink" font-size="12">6 Over time</text><text x="590" y="64" text-anchor="middle" class="svg-muted" font-size="10">monitor</text>
<rect x="125" y="120" width="410" height="55" rx="10" fill="#e2e8f0" stroke="#64748b"/><text x="330" y="144" text-anchor="middle" class="svg-ink" font-size="13">Evidence: flow logs, Traffic Analytics, Connection Monitor</text><text x="330" y="162" text-anchor="middle" class="svg-muted" font-size="11">and a change note for every fix</text>
<g stroke="#64748b" stroke-width="2"><line x1="110" y1="50" x2="125" y2="50"/><line x1="220" y1="50" x2="235" y2="50"/><line x1="330" y1="50" x2="345" y2="50"/><line x1="440" y1="50" x2="455" y2="50"/><line x1="535" y1="50" x2="550" y2="50"/><line x1="330" y1="80" x2="330" y2="120"/></g>
</svg>`,t={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The module in one picture</h3>
<div class="dia">`+e+`<p class="cap">Climb the ladder one rung at a time, use the right Network Watcher tool at each rung, and keep evidence and notes.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Apply the six-rung troubleshooting ladder and name the layer before touching anything.</li>
<li>Explain what Network Watcher is, that it is enabled per region, and where its resources live (NetworkWatcherRG).</li>
<li>Use next hop to prove a route, and read effective routes on a NIC.</li>
<li>Use IP flow verify to get Allow or Deny and the rule name; read effective security rules.</li>
<li>Explain NSG evaluation: subnet and NIC NSGs both apply, lower priority number first, default rules at 65000 and above.</li>
<li>Run connection troubleshoot and know it needs the agent extension on the source VM.</li>
<li>Take a short, filtered packet capture and recognise repeated SYNs, resets and retransmissions.</li>
<li>Explain flow logs, the retirement of NSG flow logs in favour of VNet flow logs (verify dates), and Traffic Analytics.</li>
<li>Set up Connection Monitor and Azure Monitor alerts for the path over time.</li>
<li>Work three faults in one hub-and-spoke: wrong next hop, NSG priority, wrong DNS.</li>
<li>Run the guided labs safely and delete flow logs, captures and the resource group the same day.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Network Watcher</dt><dd>Regional Azure service with diagnostic and monitoring tools for IaaS networking.</dd>
<dt>Next hop</dt><dd>Tool that shows where Azure sends a packet from a VM to a destination.</dd>
<dt>IP flow verify</dt><dd>Tool that tests one packet five-tuple against effective NSG rules and names the rule.</dd>
<dt>Effective security rules</dt><dd>The merged NSG rules that apply to a NIC.</dd>
<dt>Connection troubleshoot</dt><dd>End-to-end test with hop-by-hop result; needs the agent on the source VM.</dd>
<dt>Packet capture</dt><dd>Short, filtered capture on a VM, saved to storage or a local file.</dd>
<dt>Flow log</dt><dd>Record of IP flows with allow or deny status; use VNet flow logs going forward.</dd>
<dt>Traffic Analytics</dt><dd>Processing of flow logs in Log Analytics into readable insights.</dd>
<dt>Connection Monitor</dt><dd>Scheduled tests that track reachability and latency over time.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Ladder</td><td>Symptom, DNS, route, filter, service, over time</td></tr>
<tr><td>NSG</td><td>Lower number wins; subnet and NIC NSGs both evaluated; Deny stops evaluation</td></tr>
<tr><td>Timeout vs refused</td><td>Timeout suggests a drop; refused means the host answered with a reset</td></tr>
<tr><td>Agent</td><td>Connection troubleshoot and capture need the Network Watcher agent extension (verify per tool)</td></tr>
<tr><td>Flow logs</td><td>NSG flow logs retiring, VNet flow logs are the successor (verify dates)</td></tr>
<tr><td>Cleanup</td><td>Flow logs, captures and monitors live under Network Watcher and need explicit deletion</td></tr>
<tr><td>168.63.129.16</td><td>Azure virtual public IP for platform services such as DNS and health probes</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">az network watcher show-next-hop -g RG --vm VM --source-ip SRC --dest-ip DST
az network watcher test-ip-flow -g RG --vm VM --direction Inbound --protocol TCP --local DST:PORT --remote SRC:SPORT
az network nic list-effective-nsg -g RG -n NIC -o table
az network nic show-effective-route-table -g RG -n NIC -o table
az network watcher test-connectivity -g RG --source-resource VM1 --dest-resource VM2 --dest-port PORT
az network watcher packet-capture create -g RG -n CAP --vm VM --storage-account SA --time-limit 60
az network watcher flow-log list -l centralindia -o table
az group delete -n RG --yes --no-wait</pre>

<div class="exam"><p><b>Last-minute exam traps:</b> IP flow verify tests one packet, not your whole policy; test on the destination NIC for inbound; an Allow at a higher priority number loses to a Deny at a lower one; flow logs do not show packet contents; deleting a resource group does not delete Network Watcher child resources.</p></div>

<div class="scn"><h4>Interview day, a live fault</h4><p>An interviewer described a spoke VM that could not reach a database and asked for a first move. The candidate asked to reproduce the test and see whether it was a timeout or a refusal, then said they would check next hop, then IP flow verify on the destination, and read the effective rules to see the whole picture. They ended by proposing Connection Monitor to catch recurrences.</p><p><b>Lesson:</b> interviewers reward method, tool choice and evidence.</p></div>

<div class="iv"><p class="q">"Give me a two-minute summary of Azure network troubleshooting."</p><p>I climb a ladder: confirm the symptom, check DNS, check the route with next hop and effective routes, check filters with IP flow verify and effective NSG rules, check the service with a capture, and monitor the path over time with flow logs and Connection Monitor. I fix one thing, re-test end to end, and write a change note.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method first: ladder, tool, evidence, fix, re-verify.</li>
<li>Each Network Watcher tool answers one rung.</li>
<li>History needs flow logs; live checks need the tools.</li>
<li>Volume and retention drive monitoring cost.</li>
<li>Delete Network Watcher child resources explicitly after labs.</li>
</ul></div>
`,hi:`
<h3>Module ek picture mein</h3>
<div class="dia">`+e+`<p class="cap">Ladder ek rung ek baar chadho, har rung par sahi Network Watcher tool use karo, aur evidence aur notes rakho.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Chhe-rung troubleshooting ladder lagao aur kuch chhoone se pehle layer ka naam batao.</li>
<li>Samjhao Network Watcher kya hai, ki yeh per region enable hota hai, aur uske resources kahan rehte hain (NetworkWatcherRG).</li>
<li>Next hop se route saabit karo, aur NIC ki effective routes padho.</li>
<li>IP flow verify se Allow ya Deny aur rule ka naam lo; effective security rules padho.</li>
<li>NSG evaluation samjhao: subnet aur NIC dono NSGs lagte hain, chhota priority number pehle, default rules 65000 aur upar.</li>
<li>Connection troubleshoot chalao aur jaano ki source VM par agent extension chahiye.</li>
<li>Chhota, filtered packet capture lo aur repeated SYNs, resets aur retransmissions pehchano.</li>
<li>Flow logs samjhao, NSG flow logs ki retirement aur VNet flow logs (dates verify karo), aur Traffic Analytics.</li>
<li>Waqt ke saath path ke liye Connection Monitor aur Azure Monitor alerts set karo.</li>
<li>Ek hub-and-spoke mein teen faults solve karo: galat next hop, NSG priority, galat DNS.</li>
<li>Guided labs safely chalao aur flow logs, captures aur resource group usi din delete karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Network Watcher</dt><dd>Regional Azure service jisme IaaS networking ke diagnostic aur monitoring tools hain.</dd>
<dt>Next hop</dt><dd>Tool jo dikhata hai Azure VM se destination tak packet kahan bhejta hai.</dd>
<dt>IP flow verify</dt><dd>Tool jo ek packet five-tuple ko effective NSG rules se test karke rule ka naam batata hai.</dd>
<dt>Effective security rules</dt><dd>NIC par lagne wale merged NSG rules.</dd>
<dt>Connection troubleshoot</dt><dd>Hop-by-hop result wala end-to-end test; source VM par agent chahiye.</dd>
<dt>Packet capture</dt><dd>VM par chhota, filtered capture, storage ya local file mein save.</dd>
<dt>Flow log</dt><dd>Allow ya deny status ke saath IP flows ka record; aage VNet flow logs use karo.</dd>
<dt>Traffic Analytics</dt><dd>Log Analytics mein flow logs ko padhne layak insights mein badalna.</dd>
<dt>Connection Monitor</dt><dd>Scheduled tests jo reachability aur latency waqt ke saath track karte hain.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Ladder</td><td>Symptom, DNS, route, filter, service, over time</td></tr>
<tr><td>NSG</td><td>Chhota number jeetta hai; subnet aur NIC dono NSGs evaluate; Deny par evaluation ruk jaata hai</td></tr>
<tr><td>Timeout vs refused</td><td>Timeout drop ka ishara; refused matlab host ne reset se jawab diya</td></tr>
<tr><td>Agent</td><td>Connection troubleshoot aur capture ko Network Watcher agent extension chahiye (har tool ke liye verify)</td></tr>
<tr><td>Flow logs</td><td>NSG flow logs retire ho rahe hain, VNet flow logs successor (dates verify karo)</td></tr>
<tr><td>Cleanup</td><td>Flow logs, captures aur monitors Network Watcher ke neeche rehte hain, explicit delete chahiye</td></tr>
<tr><td>168.63.129.16</td><td>DNS aur health probes jaise platform services ka Azure virtual public IP</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">az network watcher show-next-hop -g RG --vm VM --source-ip SRC --dest-ip DST
az network watcher test-ip-flow -g RG --vm VM --direction Inbound --protocol TCP --local DST:PORT --remote SRC:SPORT
az network nic list-effective-nsg -g RG -n NIC -o table
az network nic show-effective-route-table -g RG -n NIC -o table
az network watcher test-connectivity -g RG --source-resource VM1 --dest-resource VM2 --dest-port PORT
az network watcher packet-capture create -g RG -n CAP --vm VM --storage-account SA --time-limit 60
az network watcher flow-log list -l centralindia -o table
az group delete -n RG --yes --no-wait</pre>

<div class="exam"><p><b>Aakhri minute ke exam traps:</b> IP flow verify ek packet test karta hai, poori policy nahi; inbound ke liye destination NIC par test karo; zyada priority number ka Allow chhote number ke Deny se haarta hai; flow logs packet contents nahi dikhate; resource group delete karne se Network Watcher ke child resources delete nahi hote.</p></div>

<div class="scn"><h4>Interview day, live fault</h4><p>Interviewer ne ek spoke VM bataya jo database tak nahi pahunch pa rahi aur pehla move poochha. Candidate ne pehle test reproduce karne aur timeout ya refusal dekhne ko kaha, phir next hop, phir destination par IP flow verify, aur poori tasveer ke liye effective rules padhne ko kaha. Ant mein recurrence pakadne ke liye Connection Monitor suggest kiya.</p><p><b>Lesson:</b> interviewers method, tool choice aur evidence ko inaam dete hain.</p></div>

<div class="iv"><p class="q">"Azure network troubleshooting ka do minute ka summary do."</p><p>Main ladder chadhta hoon: symptom confirm, DNS check, next hop aur effective routes se route check, IP flow verify aur effective NSG rules se filters check, capture se service check, aur flow logs aur Connection Monitor se path ko waqt ke saath monitor. Ek cheez fix karta hoon, end to end retest karta hoon, aur change note likhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle method: ladder, tool, evidence, fix, re-verify.</li>
<li>Har Network Watcher tool ek rung ka jawab deta hai.</li>
<li>History ke liye flow logs; live checks ke liye tools.</li>
<li>Volume aur retention monitoring cost chalate hain.</li>
<li>Labs ke baad Network Watcher child resources explicitly delete karo.</li>
</ul></div>
`}};export{t as default};