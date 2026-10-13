var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow for reject, critical and CoA problems`,hi:`Reject, critical aur CoA problems ka troubleshooting workflow`},body:{en:`
<h3>Start with an analogy: a doctor, not a guesser</h3>
<p>A good doctor does not prescribe before taking the history, checking the vital signs and ordering the right test. Network access problems need the same discipline. Two instruments give you the history: the <b>switch</b> (what happened to the port and the client) and the <b>ClearPass Access Tracker and Event Viewer</b> (what the policy server saw and decided). Always read both before you change anything.</p>

<h3>The four-question workflow</h3>
<ol>
<li><b>Did the request reach ClearPass?</b> On the switch, <code>show radius-server</code>. Reachable with counters rising means yes. Unreachable with Timeouts rising and no Accept or Reject means no. If no, look at the path (links, ACLs, the NAD address, the shared secret) and the ClearPass Event Viewer.</li>
<li><b>What did ClearPass decide?</b> In the Access Tracker open the newest record for the user or MAC and read Summary (which service ran), Output (which role or attributes came back) and Alerts (the error code). No record at all means the request never arrived or was dropped.</li>
<li><b>What did the switch do with the answer?</b> <code>show port-access clients detail</code> shows Authentication status, the Role, whether authorization was applied, and the VLAN with its source (role, reject-role, Tunnel attribute or port VLAN).</li>
<li><b>Can the client use the result?</b> Check the VLAN exists and is allowed on the trunk, then DHCP (<code>ip dhcp</code> on the client) and a ping to the target.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Troubleshooting decision flow">
<rect x="220" y="6" width="200" height="34" rx="8" fill="#bae6fd"/><text x="320" y="28" text-anchor="middle" class="svg-ink" font-size="13">show radius-server</text>
<line x1="270" y1="40" x2="130" y2="76" stroke="#64748b"/><line x1="370" y1="40" x2="510" y2="76" stroke="#64748b"/>
<text x="150" y="62" text-anchor="middle" class="svg-muted" font-size="12">unreachable</text><text x="500" y="62" text-anchor="middle" class="svg-muted" font-size="12">reachable</text>
<rect x="20" y="76" width="220" height="64" rx="8" fill="#fed7aa"/><text x="130" y="98" text-anchor="middle" class="svg-ink" font-size="13">Path or secret problem</text><text x="130" y="118" text-anchor="middle" class="svg-muted" font-size="12">links, NAD IP, secret, Event Viewer</text>
<rect x="400" y="76" width="220" height="64" rx="8" fill="#bbf7d0"/><text x="510" y="98" text-anchor="middle" class="svg-ink" font-size="13">Read Access Tracker</text><text x="510" y="118" text-anchor="middle" class="svg-muted" font-size="12">Summary, Output, Alerts</text>
<line x1="510" y1="140" x2="510" y2="166" stroke="#64748b"/>
<rect x="400" y="166" width="220" height="44" rx="8" fill="#ddd6fe"/><text x="510" y="186" text-anchor="middle" class="svg-ink" font-size="13">Switch: role, VLAN, trunk</text><text x="510" y="203" text-anchor="middle" class="svg-muted" font-size="12">then DHCP and ping</text>
</svg><p class="cap">Server side first (did it arrive and what was decided), then switch side (what was applied), then the client.</p></div>

<h3>Symptom table for this module</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Evidence and fix</th></tr>
<tr><td>Rejected client stays dead</td><td>No reject-role on the port, or not attached</td><td><code>show aaa authentication port-access interface all configuration</code>; attach the role.</td></tr>
<tr><td>Reject-role set but client has no address</td><td>Role Incomplete, or VLAN not allowed on the trunk</td><td><code>show port-access role GUEST</code>; recreate VLAN, allow on 1/1/1.</td></tr>
<tr><td>Everyone lands in GUEST</td><td>Platform fault: alert 9002 or 9010</td><td>Access Tracker Alerts; fix the service or policy, not the users.</td></tr>
<tr><td>Nobody can authenticate, ClearPass is up</td><td>Secret mismatch or NAD IP wrong; requests dropped</td><td>Event Viewer; correct the network device.</td></tr>
<tr><td>Users stay in CRITICAL after recovery</td><td>Sessions not re-evaluated</td><td>Bounce the port or reauthenticate; confirm role EMPLOYEE.</td></tr>
<tr><td>CoA does nothing</td><td>One side not configured</td><td>Read the CoA result message; fix the named piece.</td></tr>
<tr><td>CoA ACK but old role returns</td><td>Policy not changed first, or wrong rule order</td><td>Read the policy; Disconnect again.</td></tr></table>

<h3>A worked triage: three tickets, three layers</h3>
<p><b>Ticket A, "Bob has no network".</b> The switch shows LAPTOP2 as Rejected with no role. The Access Tracker alert is 215. The cause is the password; the fix for the user is the password. The design fix is a reject-role on port 1/1/4, so that the next failure does not strand him.</p>
<pre class="out">ACCESS# show port-access clients
Port   MAC-Address        User   Method  Status    Role   VLAN
1/1/4  00:50:2f:e9:9a:02  bob    dot1x   Failed    -      -

<span class="hl">Alert: 215  Authentication failed: password mismatch (MSCHAPv2)</span></pre>
<p><b>Ticket B, "Floor 1 is dead".</b> Every port is unauthorized. <code>show radius-server</code> shows Status unreachable, Timeouts rising, no Accepts or Rejects. A ping to 10.20.60.10 fails. The cause is the path, not the users. In the lab the R1 interface GigabitEthernet0/1 is shut down. Fix the link, bounce the ports, and confirm the RADIUS roles return. A permanent fix is the critical-role.</p>
<p><b>Ticket C, "Block him now".</b> The analyst changed the policy and sent a Disconnect, but nothing moved. The result line said <code>ACCESS rejected the request: shared-secret mismatch</code>. Correct the dyn-authorization secret on the switch (or the device secret on ClearPass) so that they are identical, send the Disconnect again and confirm the new role.</p>

<h3>Common traps that waste time</h3>
<ul>
<li><b>Testing the wrong state.</b> After you change role or policy, the client may wait out the quiet period (20 seconds in the lab). Bounce the port with <code>shutdown</code> and <code>no shutdown</code> to force a fresh attempt.</li>
<li><b>Reading only one side.</b> The switch may say "Rejected" while ClearPass says "Accept" with a role that the switch does not know. Role names are case-sensitive, so compare them exactly.</li>
<li><b>Forgetting the layers below.</b> A role can be correct and the VLAN can exist, yet DHCP fails because the VLAN is not allowed on the uplink trunk.</li>
<li><b>Confusing silence and refusal.</b> A refusal is a reject and uses the reject-role. Silence is a dead or dropping server and uses the critical-role.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Fixing the symptom at the switch (adding a reject-role) when the cause is a platform fault at ClearPass. If the Access Tracker shows 9002 for everybody, adding roles to ports only hides the outage.</p></div>

<div class="exam"><p><b>Exam trap.</b> The order of evidence matters. Questions often give you only the switch output or only the alert and ask for the next step. Ask yourself which side you have not read yet, and read that before choosing a fix.</p></div>

<div class="scn"><h4>Monday 08:45, three symptoms at once</h4><p>Alice cannot connect, a floor lost authentication, and the SOC cannot disconnect a device. The engineer applied the workflow. Alice: alert 215, a stale saved password. The floor: <code>show radius-server</code> unreachable and the Event Viewer showing a drop because of a secret typed differently on a new network device entry. The SOC: CoA failed with "not a configured dyn-authorization client" because the switch had been replaced and had lost that line. Three separate causes were fixed in 20 minutes because each was read from evidence.</p><p><b>Lesson:</b> same symptom area, different layers; the evidence names the layer.</p></div>

<div class="iv"><p class="q">"A user says the network is not working. What is your first step on a 802.1X port?"</p><p>Strong answer: look at the port state on the switch and the matching record in the ClearPass Access Tracker. Decide whether the request arrived, what ClearPass decided, and what the switch applied. Then verify VLAN, trunk, DHCP and reachability. Give the example that Rejected with alert 215 is a credential problem, but unreachable server with timeouts is a path or secret problem.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use four questions: did it arrive, what was decided, what was applied, can the client use it.</li>
<li>Read both the switch and the ClearPass evidence before changing anything.</li>
<li>Silence means critical-role territory; refusal means reject-role territory.</li>
<li>CoA failure messages name the missing piece; read them literally.</li>
<li>After a fix, bounce the port or reauthenticate to test the new state.</li>
</ul></div>
`,hi:`
<h3>Ek analogy se shuru karo: doctor bano, andaaza lagane wale nahi</h3>
<p>Achha doctor history leke, vital signs check karke aur sahi test karwa ke hi dawai likhta hai. Network access problems mein bhi wahi discipline chahiye. Do instruments history dete hain: <b>switch</b> (port aur client ke saath kya hua) aur <b>ClearPass Access Tracker aur Event Viewer</b> (policy server ne kya dekha aur kya decide kiya). Kuch badalne se pehle hamesha dono padho.</p>

<h3>Chaar sawaal ka workflow</h3>
<ol>
<li><b>Request ClearPass tak pahunchi?</b> Switch par <code>show radius-server</code>. Reachable aur counters badh rahe hain to haan. Unreachable, Timeouts badhte hue aur na Accept na Reject, to nahi. Agar nahi, to path (links, ACLs, NAD address, shared secret) aur ClearPass Event Viewer dekho.</li>
<li><b>ClearPass ne kya decide kiya?</b> Access Tracker mein user ya MAC ka sabse naya record kholo aur Summary (kaun si service chali), Output (kaun sa role ya attributes wapas aaye) aur Alerts (error code) padho. Record hi nahi hai to request pahunchi nahi ya drop hui.</li>
<li><b>Switch ne jawab ka kya kiya?</b> <code>show port-access clients detail</code> Authentication status, Role, authorization applied hui ya nahi, aur VLAN uske source ke saath (role, reject-role, Tunnel attribute ya port VLAN) dikhata hai.</li>
<li><b>Kya client result use kar sakta hai?</b> Check karo VLAN exist karti hai aur trunk par allowed hai, phir DHCP (client par <code>ip dhcp</code>) aur target ko ping.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Troubleshooting decision flow">
<rect x="220" y="6" width="200" height="34" rx="8" fill="#bae6fd"/><text x="320" y="28" text-anchor="middle" class="svg-ink" font-size="13">show radius-server</text>
<line x1="270" y1="40" x2="130" y2="76" stroke="#64748b"/><line x1="370" y1="40" x2="510" y2="76" stroke="#64748b"/>
<text x="150" y="62" text-anchor="middle" class="svg-muted" font-size="12">unreachable</text><text x="500" y="62" text-anchor="middle" class="svg-muted" font-size="12">reachable</text>
<rect x="20" y="76" width="220" height="64" rx="8" fill="#fed7aa"/><text x="130" y="98" text-anchor="middle" class="svg-ink" font-size="13">Path ya secret problem</text><text x="130" y="118" text-anchor="middle" class="svg-muted" font-size="12">links, NAD IP, secret, Event Viewer</text>
<rect x="400" y="76" width="220" height="64" rx="8" fill="#bbf7d0"/><text x="510" y="98" text-anchor="middle" class="svg-ink" font-size="13">Access Tracker padho</text><text x="510" y="118" text-anchor="middle" class="svg-muted" font-size="12">Summary, Output, Alerts</text>
<line x1="510" y1="140" x2="510" y2="166" stroke="#64748b"/>
<rect x="400" y="166" width="220" height="44" rx="8" fill="#ddd6fe"/><text x="510" y="186" text-anchor="middle" class="svg-ink" font-size="13">Switch: role, VLAN, trunk</text><text x="510" y="203" text-anchor="middle" class="svg-muted" font-size="12">phir DHCP aur ping</text>
</svg><p class="cap">Pehle server side (pahuncha aur kya decide hua), phir switch side (kya apply hua), phir client.</p></div>

<h3>Is module ka symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Evidence aur fix</th></tr>
<tr><td>Rejected client dead rehta hai</td><td>Port par reject-role nahi, ya attach nahi</td><td><code>show aaa authentication port-access interface all configuration</code>; role attach karo.</td></tr>
<tr><td>Reject-role set hai lekin client ke paas address nahi</td><td>Role Incomplete, ya VLAN trunk par allowed nahi</td><td><code>show port-access role GUEST</code>; VLAN dobara banao, 1/1/1 par allow karo.</td></tr>
<tr><td>Sab GUEST mein land ho rahe hain</td><td>Platform fault: alert 9002 ya 9010</td><td>Access Tracker Alerts; service ya policy fix karo, users nahi.</td></tr>
<tr><td>Koi authenticate nahi kar pa raha, ClearPass up hai</td><td>Secret mismatch ya NAD IP galat; requests drop</td><td>Event Viewer; network device correct karo.</td></tr>
<tr><td>Recovery ke baad users CRITICAL mein rehte hain</td><td>Sessions re-evaluate nahi hue</td><td>Port bounce ya reauthenticate; role EMPLOYEE confirm karo.</td></tr>
<tr><td>CoA kuch nahi karta</td><td>Ek side configured nahi</td><td>CoA result message padho; named piece fix karo.</td></tr>
<tr><td>CoA ACK lekin purana role wapas</td><td>Policy pehle nahi badli, ya rule order galat</td><td>Policy padho; Disconnect dobara bhejo.</td></tr></table>

<h3>Worked triage: teen tickets, teen layers</h3>
<p><b>Ticket A, "Bob ke paas network nahi".</b> Switch LAPTOP2 ko Rejected, bina role ke dikhata hai. Access Tracker alert 215 hai. Cause password hai; user ka fix password hai. Design fix port 1/1/4 par reject-role hai, taaki agla failure use phansa na de.</p>
<pre class="out">ACCESS# show port-access clients
Port   MAC-Address        User   Method  Status    Role   VLAN
1/1/4  00:50:2f:e9:9a:02  bob    dot1x   Failed    -      -

<span class="hl">Alert: 215  Authentication failed: password mismatch (MSCHAPv2)</span></pre>
<p><b>Ticket B, "Floor 1 dead hai".</b> Har port unauthorized hai. <code>show radius-server</code> Status unreachable, Timeouts badhte hue, na Accept na Reject dikhata hai. 10.20.60.10 ko ping fail hota hai. Cause path hai, users nahi. Lab mein R1 ka interface GigabitEthernet0/1 shut down hai. Link fix karo, ports bounce karo, aur confirm karo RADIUS roles wapas aaye. Permanent fix critical-role hai.</p>
<p><b>Ticket C, "Use abhi block karo".</b> Analyst ne policy badli aur Disconnect bheja, lekin kuch move nahi hua. Result line thi <code>ACCESS rejected the request: shared-secret mismatch</code>. Switch par dyn-authorization secret (ya ClearPass par device secret) correct karo taaki identical ho, Disconnect dobara bhejo aur naya role confirm karo.</p>

<h3>Common traps jo time waste karte hain</h3>
<ul>
<li><b>Galat state test karna.</b> Role ya policy badalne ke baad client quiet period (lab mein 20 second) wait kar sakta hai. Fresh attempt force karne ke liye <code>shutdown</code> aur <code>no shutdown</code> se port bounce karo.</li>
<li><b>Sirf ek side padhna.</b> Switch "Rejected" bol sakta hai jabki ClearPass "Accept" bolta hai aur aisa role return karta hai jo switch nahi jaanta. Role names case-sensitive hain, exactly compare karo.</li>
<li><b>Neeche ki layers bhool jaana.</b> Role sahi ho sakta hai aur VLAN exist kar sakti hai, phir bhi DHCP fail ho kyunki VLAN uplink trunk par allowed nahi.</li>
<li><b>Silence aur refusal mein confusion.</b> Refusal reject hai aur reject-role use karta hai. Silence dead ya dropping server hai aur critical-role use karta hai.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Symptom ko switch par fix karna (reject-role add karna) jabki cause ClearPass ka platform fault hai. Agar Access Tracker sabke liye 9002 dikhata hai, to ports par roles add karna sirf outage chhupata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Evidence ka order matter karta hai. Questions aksar sirf switch output ya sirf alert dete hain aur next step poochte hain. Khud se poochho ki kaun si side abhi nahi padhi, aur fix choose karne se pehle woh padho.</p></div>

<div class="scn"><h4>Monday 08:45, ek saath teen symptoms</h4><p>Alice connect nahi kar pa rahi, ek floor ki authentication gayi, aur SOC ek device ko disconnect nahi kar pa raha. Engineer ne workflow lagaya. Alice: alert 215, purana saved password. Floor: <code>show radius-server</code> unreachable aur Event Viewer ne drop dikhaya kyunki naye network device entry par secret alag type hua tha. SOC: CoA "not a configured dyn-authorization client" ke saath fail hua kyunki switch replace hua tha aur woh line kho gayi thi. Teen alag causes 20 minute mein fix hue kyunki har ek evidence se padha gaya.</p><p><b>Seekh:</b> symptom area same, layers alag; evidence layer ka naam batata hai.</p></div>

<div class="iv"><p class="q">"User kehta hai network kaam nahi kar raha. 802.1X port par tumhara pehla step kya hai?"</p><p>Strong answer: switch par port state aur ClearPass Access Tracker mein matching record dekho. Decide karo ki request pahunchi, ClearPass ne kya decide kiya, aur switch ne kya apply kiya. Phir VLAN, trunk, DHCP aur reachability verify karo. Example do: alert 215 ke saath Rejected credential problem hai, lekin timeouts ke saath unreachable server path ya secret problem hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar sawaal use karo: pahuncha, kya decide hua, kya apply hua, kya client use kar sakta hai.</li>
<li>Kuch badalne se pehle switch aur ClearPass dono ka evidence padho.</li>
<li>Silence ka matlab critical-role territory; refusal ka matlab reject-role territory.</li>
<li>CoA failure messages missing piece ka naam batate hain; unhe literally padho.</li>
<li>Fix ke baad naya state test karne ke liye port bounce ya reauthenticate karo.</li>
</ul></div>
`}};export{e as default};