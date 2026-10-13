var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>This chapter closes the ClearPass track. Think of it as the pocket card a pilot keeps on the dashboard: short, ordered, and used under pressure. Read it before every lab and before every interview.</p>

<h3>Can-do checklist</h3>
<p>You are ready when you can do each of these without notes:</p>
<ul>
<li>Name the six ClearPass stages in order (NAD, service, authentication, role mapping, enforcement, response) and the seventh place, the switch.</li>
<li>Open an Access Tracker record and say what Summary, Input, Output and Alerts show.</li>
<li>Explain 215, 216, 217 and 9002 in one sentence each, and say where silent drops are logged (Event Viewer).</li>
<li>Run the seven-step triage and name the owning layer for each symptom.</li>
<li>Solve cp-vlan-missing: role incomplete, recreate VLAN 20, allow it on 1/1/1, prove with address and ping.</li>
<li>Solve cp-tracker-triage: reset alice, enable bob, add PRN1 as a known printer.</li>
<li>Roll out CAM1: endpoint, role mapping rule, enforcement rule, port 1/1/6 mac-auth, prove IOT VLAN 30, <code>write memory</code>.</li>
<li>Write a pre-change checklist with proof and rollback.</li>
<li>Describe backup, upgrade, licensing and Insight as concepts and say they are not simulated in the lab.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Pocket card">
<rect x="10" y="15" width="300" height="70" rx="8" fill="#bae6fd"/><text x="160" y="40" text-anchor="middle" class="svg-ink" font-size="13">No row, switch says dead</text><text x="160" y="62" text-anchor="middle" class="svg-muted" font-size="12">Event Viewer: NAD IP, secret, path</text>
<rect x="330" y="15" width="300" height="70" rx="8" fill="#fde68a"/><text x="480" y="40" text-anchor="middle" class="svg-ink" font-size="13">REJECT with code</text><text x="480" y="62" text-anchor="middle" class="svg-muted" font-size="12">9002 service; 215/216/217 identity</text>
<rect x="10" y="100" width="300" height="70" rx="8" fill="#bbf7d0"/><text x="160" y="125" text-anchor="middle" class="svg-ink" font-size="13">ACCEPT, wrong role</text><text x="160" y="147" text-anchor="middle" class="svg-muted" font-size="12">role mapping, rule order, service order</text>
<rect x="330" y="100" width="300" height="70" rx="8" fill="#fed7aa"/><text x="480" y="125" text-anchor="middle" class="svg-ink" font-size="13">ACCEPT, no network</text><text x="480" y="147" text-anchor="middle" class="svg-muted" font-size="12">switch: role name, VLAN, trunk, DHCP</text>
</svg><p class="cap">Four boxes that cover most tickets.</p></div>

<h3>Most tested facts</h3>
<ul>
<li>RADIUS source IP must match a NAD and the shared secret must match; otherwise a <b>silent drop</b> (Event Viewer, switch shows the server dead).</li>
<li>Services are evaluated top to bottom, <b>first match wins</b>. Wired requests have NAS-Port-Type 15 (Ethernet); wireless is 19. No match is <b>9002</b>.</li>
<li>215 password mismatch, 216 user or endpoint not found or not known, 217 account disabled. In the lab 9003 to 9011 mark service, policy and VLAN-attribute faults; 9011 means Tunnel-Private-Group-Id without Tunnel-Type 13 and Tunnel-Medium-Type 6.</li>
<li>Aruba-User-Role must equal a role on the switch exactly (case-sensitive). A role whose VLAN does not exist is incomplete and cannot be applied.</li>
<li>Enforcement runs at login. A policy change needs reauthentication, a port bounce or CoA (UDP 3799, NAD CoA on ClearPass and <code>radius dyn-authorization</code> on the switch).</li>
<li>VLANs used by roles must be allowed on the uplink trunk for DHCP.</li>
<li>Failed clients retry after the quiet period (20 s in the lab model); 802.1X timeout (about 10 s) falls over to MAC authentication.</li>
<li>Running config is lost at reload; <code>write memory</code> saves it.</li>
<li>Insight, backup, upgrade, licensing, cluster: concepts, not simulated.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Access Tracker</dt><dd>Live record of each request with Summary, Input, Output, Alerts.</dd>
<dt>Event Viewer</dt><dd>System event log; shows dropped requests and system events.</dd>
<dt>NAD</dt><dd>Network access device, here the switch ACCESS at 10.20.99.2.</dd>
<dt>Service</dt><dd>Classification rules plus methods, sources, role mapping and policy.</dd>
<dt>Role mapping</dt><dd>Turns attributes into ClearPass roles.</dd>
<dt>Enforcement profile</dt><dd>The set of attributes returned to the NAD.</dd>
<dt>CoA</dt><dd>Change of Authorization (RFC 5176) to disconnect or reauthorize a live session.</dd>
<dt>Critical role</dt><dd>Switch role used when the RADIUS server is dead.</dd>
<dt>Insight</dt><dd>Reporting and history component (concept only here).</dd>
</dl>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! ClearPass lab shell (mirrors Monitoring and Configuration menus)</span>
monitoring access-tracker
monitoring access-tracker detail latest summary|input|output|alerts
monitoring access-tracker detail alice alerts
monitoring access-tracker disconnect 00:50:2f:e9:9a:01
monitoring event-viewer
configuration service show
configuration service "Wired 802.1X" order 1
configuration identity local-user bob enable
configuration identity endpoint add MAC status known attr Category=Printer
<span class="c">! AOS-CX style switch</span>
show port-access clients detail
show port-access role CONTRACTOR
show radius-server
show vlan
show ip interface brief
interface 1/1/1 / vlan trunk allowed 10,20,30,40,50,99
write memory</pre>

<div class="eg"><p><b>Worked example.</b> One-minute drill. Ticket: "bob has no network." (1) Switch: no client on 1/1/4. (2) Tracker: row for bob, REJECT 217. (3) Cause: account disabled. (4) Check why. (5) Enable. (6) Bounce the port. (7) Prove: Authorized, CONTRACTOR, VLAN 20, ping APP1.</p></div>

<div class="warn"><p><b>Common mistake.</b> Memorising codes without the stage. If you forget a code, the message text and the stage still lead you to the cause.</p></div>

<div class="exam"><p><b>Exam trap.</b> Watch for questions that mix layers: "ACCEPT in ClearPass but no network" is a switch question, and "request never reaches ClearPass" is a NAD, secret or path question.</p></div>

<div class="scn"><h4>The calm Monday</h4><p>A new engineer inherited the pocket card. When twelve tickets arrived she grouped them by code: nine were the same 9002 after a service edit, two were 217, one was a missing VLAN. Three fixes closed twelve tickets in twenty minutes.</p><p><b>Lesson:</b> group by evidence, not by complaint.</p></div>

<div class="iv"><p class="q">"What makes you a good operator of an access control system?"</p><p>Evidence before action: one identifiable attempt, the Access Tracker and switch status, a named stage and cause, the smallest fix on the right layer, proof, saving and documentation, and never widening access to hide a problem.</p></div>

<div class="kt"><p><b>Key takeaways</b></p>
<ul>
<li>Pipeline of six stages plus the switch; each leaves evidence in a known place.</li>
<li>Codes point to families: 9002 service, 215 to 217 identity, 9011 VLAN attributes.</li>
<li>Seven-step triage and a pre-change checklist keep you safe.</li>
<li>Prove end to end, then <code>write memory</code>.</li>
<li>Concept-only topics: Insight, backup, upgrade, licensing.</li>
</ul></div>
`,hi:`
<p>Yeh chapter ClearPass track ko close karta hai. Ise us pocket card ki tarah socho jo pilot dashboard par rakhta hai: chhota, ordered, aur pressure mein use hone wala. Har lab aur har interview se pehle ise padho.</p>

<h3>Can-do checklist</h3>
<p>Aap tab ready ho jab bina notes ke yeh sab kar sako:</p>
<ul>
<li>ClearPass ke six stages order mein batao (NAD, service, authentication, role mapping, enforcement, response) aur saatvi jagah, switch.</li>
<li>Access Tracker record kholo aur batao ki Summary, Input, Output aur Alerts kya dikhate hain.</li>
<li>215, 216, 217 aur 9002 har ek ek sentence mein explain karo, aur batao silent drops kahan log hote hain (Event Viewer).</li>
<li>Seven-step triage chalao aur har symptom ke liye owning layer ka naam lo.</li>
<li>cp-vlan-missing solve karo: role incomplete, VLAN 20 dobara banao, use 1/1/1 par allow karo, address aur ping se prove karo.</li>
<li>cp-tracker-triage solve karo: alice reset, bob enable, PRN1 ko known printer add karo.</li>
<li>CAM1 rollout karo: endpoint, role mapping rule, enforcement rule, port 1/1/6 mac-auth, IOT VLAN 30 prove karo, <code>write memory</code>.</li>
<li>Proof aur rollback ke saath pre-change checklist likho.</li>
<li>Backup, upgrade, licensing aur Insight ko concepts ke roop mein describe karo aur batao ki lab mein simulated nahi.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Pocket card">
<rect x="10" y="15" width="300" height="70" rx="8" fill="#bae6fd"/><text x="160" y="40" text-anchor="middle" class="svg-ink" font-size="13">Row nahi, switch dead kehta</text><text x="160" y="62" text-anchor="middle" class="svg-muted" font-size="12">Event Viewer: NAD IP, secret, path</text>
<rect x="330" y="15" width="300" height="70" rx="8" fill="#fde68a"/><text x="480" y="40" text-anchor="middle" class="svg-ink" font-size="13">Code ke saath REJECT</text><text x="480" y="62" text-anchor="middle" class="svg-muted" font-size="12">9002 service; 215/216/217 identity</text>
<rect x="10" y="100" width="300" height="70" rx="8" fill="#bbf7d0"/><text x="160" y="125" text-anchor="middle" class="svg-ink" font-size="13">ACCEPT, galat role</text><text x="160" y="147" text-anchor="middle" class="svg-muted" font-size="12">role mapping, rule order, service order</text>
<rect x="330" y="100" width="300" height="70" rx="8" fill="#fed7aa"/><text x="480" y="125" text-anchor="middle" class="svg-ink" font-size="13">ACCEPT, network nahi</text><text x="480" y="147" text-anchor="middle" class="svg-muted" font-size="12">switch: role name, VLAN, trunk, DHCP</text>
</svg><p class="cap">Chaar boxes jo zyadatar tickets cover karte hain.</p></div>

<h3>Sabse zyada tested facts</h3>
<ul>
<li>RADIUS source IP kisi NAD se match hona chahiye aur shared secret match hona chahiye; warna <b>silent drop</b> (Event Viewer, switch server ko dead dikhata hai).</li>
<li>Services top se bottom evaluate hoti hain, <b>first match jeetta hai</b>. Wired requests ka NAS-Port-Type 15 (Ethernet) hota hai; wireless 19. Koi match nahi to <b>9002</b>.</li>
<li>215 password mismatch, 216 user ya endpoint not found ya not known, 217 account disabled. Lab mein 9003 se 9011 service, policy aur VLAN-attribute faults mark karte hain; 9011 matlab Tunnel-Private-Group-Id bina Tunnel-Type 13 aur Tunnel-Medium-Type 6 ke.</li>
<li>Aruba-User-Role switch par ek role ke exactly barabar hona chahiye (case-sensitive). Jis role ka VLAN exist nahi karta woh incomplete hai aur apply nahi ho sakta.</li>
<li>Enforcement login par chalta hai. Policy change ke liye reauthentication, port bounce ya CoA chahiye (UDP 3799, ClearPass par NAD CoA aur switch par <code>radius dyn-authorization</code>).</li>
<li>Roles ke VLANs ko DHCP ke liye uplink trunk par allowed hona chahiye.</li>
<li>Failed clients quiet period ke baad retry karte hain (lab model mein 20 s); 802.1X timeout (lagbhag 10 s) MAC authentication par fall over karta hai.</li>
<li>Running config reload par kho jaati hai; <code>write memory</code> use save karta hai.</li>
<li>Insight, backup, upgrade, licensing, cluster: concepts, simulated nahi.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Access Tracker</dt><dd>Har request ka live record: Summary, Input, Output, Alerts.</dd>
<dt>Event Viewer</dt><dd>System event log; dropped requests aur system events dikhata hai.</dd>
<dt>NAD</dt><dd>Network access device, yahan switch ACCESS 10.20.99.2 par.</dd>
<dt>Service</dt><dd>Classification rules plus methods, sources, role mapping aur policy.</dd>
<dt>Role mapping</dt><dd>Attributes ko ClearPass roles mein badalti hai.</dd>
<dt>Enforcement profile</dt><dd>NAD ko return hone wale attributes ka set.</dd>
<dt>CoA</dt><dd>Change of Authorization (RFC 5176) jo live session ko disconnect ya reauthorize karta hai.</dd>
<dt>Critical role</dt><dd>Switch role jo RADIUS server dead hone par use hota hai.</dd>
<dt>Insight</dt><dd>Reporting aur history component (yahan sirf concept).</dd>
</dl>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! ClearPass lab shell (Monitoring aur Configuration menus ko mirror karta hai)</span>
monitoring access-tracker
monitoring access-tracker detail latest summary|input|output|alerts
monitoring access-tracker detail alice alerts
monitoring access-tracker disconnect 00:50:2f:e9:9a:01
monitoring event-viewer
configuration service show
configuration service "Wired 802.1X" order 1
configuration identity local-user bob enable
configuration identity endpoint add MAC status known attr Category=Printer
<span class="c">! AOS-CX style switch</span>
show port-access clients detail
show port-access role CONTRACTOR
show radius-server
show vlan
show ip interface brief
interface 1/1/1 / vlan trunk allowed 10,20,30,40,50,99
write memory</pre>

<div class="eg"><p><b>Worked example.</b> Ek minute ki drill. Ticket: "bob ko network nahi." (1) Switch: 1/1/4 par koi client nahi. (2) Tracker: bob ki row, REJECT 217. (3) Cause: account disabled. (4) Check karo kyon. (5) Enable karo. (6) Port bounce karo. (7) Prove: Authorized, CONTRACTOR, VLAN 20, APP1 ping.</p></div>

<div class="warn"><p><b>Common mistake.</b> Stage ke bina codes ratna. Code bhool jaao to message text aur stage phir bhi cause tak le jaate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Aise questions se savdhan raho jo layers mix karte hain: "ClearPass mein ACCEPT par network nahi" switch question hai, aur "request ClearPass tak pahunchti hi nahi" NAD, secret ya path question hai.</p></div>

<div class="scn"><h4>Shaant Monday</h4><p>Ek nayi engineer ko pocket card mila. Barah tickets aaye to usne unhe code se group kiya: nau ek hi 9002 the jo service edit ke baad aaye, do 217 the, ek missing VLAN. Teen fixes ne bees minute mein baarah tickets band kar diye.</p><p><b>Lesson:</b> complaint se nahi, evidence se group karo.</p></div>

<div class="iv"><p class="q">"Access control system ka achha operator kya banata hai?"</p><p>Action se pehle evidence: ek identifiable attempt, Access Tracker aur switch status, naam diya gaya stage aur cause, sahi layer par sabse chhota fix, proof, saving aur documentation, aur problem chhupane ke liye access kabhi widen nahi karna.</p></div>

<div class="kt"><p><b>Key takeaways</b></p>
<ul>
<li>Six stages ki pipeline plus switch; har ek known jagah evidence chhodta hai.</li>
<li>Codes families ki taraf ishara karte hain: 9002 service, 215 se 217 identity, 9011 VLAN attributes.</li>
<li>Seven-step triage aur pre-change checklist aapko safe rakhte hain.</li>
<li>End to end prove karo, phir <code>write memory</code>.</li>
<li>Concept-only topics: Insight, backup, upgrade, licensing.</li>
</ul></div>
`}};export{e as default};