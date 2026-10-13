var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: no reply, wrong device, rejected device`,hi:`Troubleshooting workflow: reply nahi, galat device, rejected device`},body:{en:`
<p>A doctor does not start with surgery. The doctor asks where it hurts, checks the vital signs, and works from the simplest cause to the rarest. Deployment problems need the same discipline. The trick that saves hours is to ask one question first: <b>is ClearPass answering at all?</b></p>

<h3>The outside-in workflow</h3>
<ol>
<li><b>Symptom on the switch.</b> <code>show radius-server</code>: are there timeouts and no accepts or rejects? That means silence. <code>show port-access clients</code> and <code>show aaa authentication port-access</code>: is the method enabled globally and on the port?</li>
<li><b>Reachability.</b> <code>ping 10.20.60.10</code> from the switch. A failing ping is a routing or link problem, not a NAC problem (see the critical-role lab).</li>
<li><b>Event Viewer on ClearPass.</b> Unknown device or secret failure means a plumbing fault. Nothing there and nothing in the Access Tracker means the packet never arrived.</li>
<li><b>Access Tracker.</b> A record exists, so the packet was trusted. Read Summary (which service), Input, Output (which role and attributes) and Alerts (error code). Now you are in policy territory, which earlier modules covered.</li>
<li><b>Switch role and VLAN.</b> If ClearPass accepted, check the role exists on the switch with the exact name and the VLAN exists and is allowed on the uplink.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Decision flow">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Switch: show radius-server</text>
<rect x="30" y="100" width="190" height="52" rx="8" fill="#fed7aa"/><text x="125" y="122" text-anchor="middle" class="svg-ink" font-size="12">timeouts, no accept/reject</text><text x="125" y="140" text-anchor="middle" class="svg-muted" font-size="12">silence: plumbing</text>
<rect x="420" y="100" width="190" height="52" rx="8" fill="#bbf7d0"/><text x="515" y="122" text-anchor="middle" class="svg-ink" font-size="12">accepts or rejects counted</text><text x="515" y="140" text-anchor="middle" class="svg-muted" font-size="12">answered: policy</text>
<line x1="270" y1="50" x2="150" y2="100" stroke="#64748b" stroke-width="2"/><line x1="370" y1="50" x2="490" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="190" width="190" height="64" rx="8" fill="#fde68a"/><text x="125" y="212" text-anchor="middle" class="svg-ink" font-size="12">Event Viewer:</text><text x="125" y="230" text-anchor="middle" class="svg-ink" font-size="12">unknown device = IP</text><text x="125" y="246" text-anchor="middle" class="svg-ink" font-size="12">secret failure = key</text>
<rect x="420" y="190" width="190" height="64" rx="8" fill="#ddd6fe"/><text x="515" y="212" text-anchor="middle" class="svg-ink" font-size="12">Access Tracker:</text><text x="515" y="230" text-anchor="middle" class="svg-ink" font-size="12">Summary, Input,</text><text x="515" y="246" text-anchor="middle" class="svg-ink" font-size="12">Output, Alerts</text>
<line x1="125" y1="152" x2="125" y2="190" stroke="#64748b" stroke-width="2"/><line x1="515" y1="152" x2="515" y2="190" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The counters on the switch tell you which half of the chain to open next.</p></div>

<h3>Ticket 1: cp-secret-mismatch</h3>
<p><b>Symptom.</b> A new switch authenticates nobody, but all policy objects are right. <b>Evidence.</b> On the switch the server is unreachable and timeouts rise; on ClearPass the Event Viewer lists a secret failure for the device ACCESS. <b>Cause.</b> The shared secret on the network device differs from the key on the switch (the switch key ArubaNK1 is the approved one). <b>Fix.</b> Make the ClearPass secret identical; do not touch policy.</p>
<pre class="code">[ACCESS] show radius-server
[CPPM]   monitoring event-viewer
[CPPM]   configuration network device ACCESS secret ArubaNK1
[LAPTOP1] ip dhcp
[LAPTOP1] ping 10.20.70.20
[ACCESS] show radius-server</pre>
<p><b>Proof.</b> The server status is healthy and LAPTOP1 is authorized as EMPLOYEE in VLAN 10 and reaches APP1.</p>

<h3>Ticket 2: cp-nad-ip</h3>
<p><b>Symptom.</b> The network device ACCESS exists with the correct secret, yet the Event Viewer says requests come from a device that is not registered. <b>Evidence.</b> The address in the log; the switch interface list shows Vlan99 at 10.20.99.2. <b>Cause.</b> The entry carries a different IP. <b>Fix.</b> Correct the IP to the real source address.</p>
<pre class="code">[CPPM]   monitoring event-viewer
[ACCESS] show ip interface brief
[CPPM]   configuration network device ACCESS ip 10.20.99.2
[LAPTOP1] ip dhcp
[LAPTOP1] ping 10.20.70.20
[CPPM]   monitoring access-tracker</pre>
<p><b>Proof.</b> LAPTOP1 is authorized and the Access Tracker record shows the device ACCESS.</p>

<h3>Ticket 3: cp-mixed-port</h3>
<p><b>Symptom.</b> Ports 1/1/3 to 1/1/5 have no port-access configuration; the printer is rejected after being enabled. <b>Steps.</b> (1) Build the port design with one interface range, both methods. (2) Read why the printer fails: the Access Tracker alert for its MAC shows the endpoint status. (3) Set the endpoint to Known. (4) Prove all three devices.</p>
<pre class="code">[ACCESS] interface 1/1/3-1/1/5
         aaa authentication port-access dot1x authenticator
         exit
         aaa authentication port-access mac-auth
         exit
         exit
[CPPM]   monitoring access-tracker detail 00:50:67:fb:67:01 alerts
[CPPM]   configuration identity endpoint 00:50:67:fb:67:01 status known
[PRN1]   ip dhcp
[PRN1]   ping 10.20.70.20
[ACCESS] show port-access clients detail</pre>
<p><b>Proof.</b> LAPTOP1 EMPLOYEE and LAPTOP2 CONTRACTOR by 802.1X; PRN1 IOT by MAC authentication.</p>

<h3>Reading the two silences apart</h3>
<table class="cmp"><tr><th>Clue</th><th>Likely cause</th><th>Fix location</th></tr>
<tr><td>Switch timeouts; ClearPass unknown device</td><td>IP in NAD entry differs from packet source</td><td>ClearPass NAD (or pin source on switch)</td></tr>
<tr><td>Switch timeouts; ClearPass secret failure</td><td>Secrets differ</td><td>Side that disagrees with approved value</td></tr>
<tr><td>Switch timeouts; ping fails</td><td>Routing, link, ACL</td><td>Network path</td></tr>
<tr><td>Rejects counted; Access Tracker alert</td><td>Policy or identity</td><td>Policy objects, identity source</td></tr>
<tr><td>Accepted; port unauthorized</td><td>Role or VLAN missing on switch</td><td>Switch role and VLAN</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Switch counters: sent 30, timeouts 30, accepts 0, rejects 0. Event Viewer: unknown device 10.20.99.2. Ping to 10.20.60.10 works. The pattern (no reply, reachable, unknown device) points to the NAD address. The engineer changes the network device IP, bounces nothing, and the next retry shows an Access Tracker record. Total time: three minutes, because each clue ruled out a layer.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Changing several things at once, so you do not know what fixed it. (2) Fixing the switch when the switch was correct. (3) Skipping the proof: after each fix, force a new authentication (ip dhcp, bounce the port, or wait for the quiet period) and read the result, do not assume. (4) Treating a silent drop as an Access-Reject.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions often give you the switch counters or one log line and ask for the next step. Silence leads to the Event Viewer; a record in the Access Tracker leads to alerts and policy; an accepted user with no access leads to the switch role, VLAN and trunk.</p></div>

<div class="scn"><h4>Three switches, three different silences</h4><p>After a refresh, three switches were dead. Switch A: ping failed (an ACL on the new firewall blocked UDP 1812). Switch B: Event Viewer showed an unknown device (the source was a loopback). Switch C: Event Viewer showed a secret failure (key typo). One symptom, "RADIUS unreachable", had three different causes and three different owners: security, network and NAC.</p><p><b>Lesson:</b> use the evidence to pick the owner, then fix one thing at a time.</p></div>

<div class="iv"><p class="q">"Walk me through troubleshooting when no user can authenticate on a new switch."</p><p>Strong answer: start on the switch with the RADIUS server counters and the port-access configuration; test reachability; then read the ClearPass Event Viewer for unknown device or secret failure; once a request appears in the Access Tracker, read Summary, Output and Alerts; and finally verify the role name, VLAN and trunk on the switch. Change one thing at a time, and prove with a fresh authentication.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work outside in: switch counters, reachability, Event Viewer, Access Tracker, switch role and VLAN.</li>
<li>No reply with an unknown-device log means fix the NAD IP; with a secret failure it means align the secrets.</li>
<li>The mixed-port ticket combines the interface range design with an endpoint status check.</li>
<li>Prove each fix with a fresh authentication and the client list, not by assumption.</li>
<li>One change at a time; the clue decides which team owns the fix.</li>
</ul></div>
`,hi:`
<p>Doctor surgery se shuru nahi karta. Doctor poochta hai ki dard kahan hai, vital signs check karta hai, aur sabse simple cause se rarest cause ki taraf jaata hai. Deployment problems ko bhi wahi discipline chahiye. Ghante bachane wali trick yeh hai ki pehle ek sawaal pucho: <b>kya ClearPass jawab de bhi raha hai?</b></p>

<h3>Outside-in workflow</h3>
<ol>
<li><b>Switch par symptom.</b> <code>show radius-server</code>: kya timeouts hain aur accepts ya rejects nahi? Matlab khamoshi. <code>show port-access clients</code> aur <code>show aaa authentication port-access</code>: kya method globally aur port par enabled hai?</li>
<li><b>Reachability.</b> Switch se <code>ping 10.20.60.10</code>. Ping fail ho to routing ya link problem hai, NAC problem nahi (critical-role lab dekho).</li>
<li><b>ClearPass par Event Viewer.</b> Unknown device ya secret failure matlab plumbing fault. Wahan kuch nahi aur Access Tracker mein bhi kuch nahi, to packet kabhi pahuncha hi nahi.</li>
<li><b>Access Tracker.</b> Record hai, matlab packet trusted tha. Summary (kaunsi service), Input, Output (kaunsa role aur attributes) aur Alerts (error code) padho. Ab aap policy territory mein ho, jo pichhle modules ne cover kiya.</li>
<li><b>Switch role aur VLAN.</b> Agar ClearPass ne accept kiya, to check karo ki role switch par exact naam se exist karta hai aur VLAN exist karta hai aur uplink par allowed hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Decision flow">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Switch: show radius-server</text>
<rect x="30" y="100" width="190" height="52" rx="8" fill="#fed7aa"/><text x="125" y="122" text-anchor="middle" class="svg-ink" font-size="12">timeouts, accept/reject nahi</text><text x="125" y="140" text-anchor="middle" class="svg-muted" font-size="12">khamoshi: plumbing</text>
<rect x="420" y="100" width="190" height="52" rx="8" fill="#bbf7d0"/><text x="515" y="122" text-anchor="middle" class="svg-ink" font-size="12">accepts ya rejects count</text><text x="515" y="140" text-anchor="middle" class="svg-muted" font-size="12">jawab mila: policy</text>
<line x1="270" y1="50" x2="150" y2="100" stroke="#64748b" stroke-width="2"/><line x1="370" y1="50" x2="490" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="190" width="190" height="64" rx="8" fill="#fde68a"/><text x="125" y="212" text-anchor="middle" class="svg-ink" font-size="12">Event Viewer:</text><text x="125" y="230" text-anchor="middle" class="svg-ink" font-size="12">unknown device = IP</text><text x="125" y="246" text-anchor="middle" class="svg-ink" font-size="12">secret failure = key</text>
<rect x="420" y="190" width="190" height="64" rx="8" fill="#ddd6fe"/><text x="515" y="212" text-anchor="middle" class="svg-ink" font-size="12">Access Tracker:</text><text x="515" y="230" text-anchor="middle" class="svg-ink" font-size="12">Summary, Input,</text><text x="515" y="246" text-anchor="middle" class="svg-ink" font-size="12">Output, Alerts</text>
<line x1="125" y1="152" x2="125" y2="190" stroke="#64748b" stroke-width="2"/><line x1="515" y1="152" x2="515" y2="190" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Switch ke counters batate hain ki chain ka kaunsa half agla kholna hai.</p></div>

<h3>Ticket 1: cp-secret-mismatch</h3>
<p><b>Symptom.</b> Naya switch kisi ko authenticate nahi karta, par saare policy objects sahi hain. <b>Evidence.</b> Switch par server unreachable hai aur timeouts badhte hain; ClearPass par Event Viewer device ACCESS ke liye secret failure list karta hai. <b>Cause.</b> Network device ka shared secret switch ki key se alag hai (switch key ArubaNK1 approved hai). <b>Fix.</b> ClearPass ka secret identical karo; policy ko haath mat lagao.</p>
<pre class="code">[ACCESS] show radius-server
[CPPM]   monitoring event-viewer
[CPPM]   configuration network device ACCESS secret ArubaNK1
[LAPTOP1] ip dhcp
[LAPTOP1] ping 10.20.70.20
[ACCESS] show radius-server</pre>
<p><b>Proof.</b> Server status healthy hai aur LAPTOP1 VLAN 10 mein EMPLOYEE ki tarah authorized hai aur APP1 tak pahunchta hai.</p>

<h3>Ticket 2: cp-nad-ip</h3>
<p><b>Symptom.</b> Network device ACCESS sahi secret ke saath exist karta hai, phir bhi Event Viewer kehta hai ki requests aise device se aa rahi hain jo registered nahi hai. <b>Evidence.</b> Log ka address; switch interface list Vlan99 ko 10.20.99.2 par dikhati hai. <b>Cause.</b> Entry ka IP alag hai. <b>Fix.</b> IP ko real source address par sahi karo.</p>
<pre class="code">[CPPM]   monitoring event-viewer
[ACCESS] show ip interface brief
[CPPM]   configuration network device ACCESS ip 10.20.99.2
[LAPTOP1] ip dhcp
[LAPTOP1] ping 10.20.70.20
[CPPM]   monitoring access-tracker</pre>
<p><b>Proof.</b> LAPTOP1 authorized hai aur Access Tracker record device ACCESS dikhata hai.</p>

<h3>Ticket 3: cp-mixed-port</h3>
<p><b>Symptom.</b> Ports 1/1/3 se 1/1/5 par koi port-access configuration nahi hai; enable karne ke baad printer reject hota hai. <b>Steps.</b> (1) Ek interface range se dono methods ke saath port design banao. (2) Padho ki printer kyun fail hota hai: uske MAC ka Access Tracker alert endpoint status dikhata hai. (3) Endpoint ko Known set karo. (4) Teeno devices prove karo.</p>
<pre class="code">[ACCESS] interface 1/1/3-1/1/5
         aaa authentication port-access dot1x authenticator
         exit
         aaa authentication port-access mac-auth
         exit
         exit
[CPPM]   monitoring access-tracker detail 00:50:67:fb:67:01 alerts
[CPPM]   configuration identity endpoint 00:50:67:fb:67:01 status known
[PRN1]   ip dhcp
[PRN1]   ping 10.20.70.20
[ACCESS] show port-access clients detail</pre>
<p><b>Proof.</b> LAPTOP1 EMPLOYEE aur LAPTOP2 CONTRACTOR 802.1X se; PRN1 IOT MAC authentication se.</p>

<h3>Do khamoshiyon ko alag padhna</h3>
<table class="cmp"><tr><th>Clue</th><th>Likely cause</th><th>Fix location</th></tr>
<tr><td>Switch timeouts; ClearPass unknown device</td><td>NAD entry ka IP packet source se alag</td><td>ClearPass NAD (ya switch par source pin)</td></tr>
<tr><td>Switch timeouts; ClearPass secret failure</td><td>Secrets alag</td><td>Jo side approved value se alag hai</td></tr>
<tr><td>Switch timeouts; ping fail</td><td>Routing, link, ACL</td><td>Network path</td></tr>
<tr><td>Rejects count; Access Tracker alert</td><td>Policy ya identity</td><td>Policy objects, identity source</td></tr>
<tr><td>Accepted; port unauthorized</td><td>Switch par role ya VLAN missing</td><td>Switch role aur VLAN</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Switch counters: sent 30, timeouts 30, accepts 0, rejects 0. Event Viewer: unknown device 10.20.99.2. 10.20.60.10 ka ping chalta hai. Pattern (reply nahi, reachable, unknown device) NAD address ki taraf ishara karta hai. Engineer network device ka IP badalta hai, kuch bounce nahi karta, aur agli retry par Access Tracker record dikhta hai. Total time: teen minute, kyunki har clue ne ek layer rule out ki.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Ek saath kai cheezein badalna, jisse pata nahi chalta ki kisne fix kiya. (2) Switch ko fix karna jab switch sahi tha. (3) Proof skip karna: har fix ke baad fresh authentication force karo (ip dhcp, port bounce, ya quiet period ka intezaar) aur result padho, assume mat karo. (4) Silent drop ko Access-Reject samajhna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions aksar switch counters ya ek log line dete hain aur agla step poochte hain. Khamoshi Event Viewer tak le jaati hai; Access Tracker mein record alerts aur policy tak le jaata hai; accepted user jisko access nahi mila woh switch role, VLAN aur trunk tak le jaata hai.</p></div>

<div class="scn"><h4>Teen switches, teen alag khamoshiyan</h4><p>Refresh ke baad teen switches dead the. Switch A: ping fail (naye firewall ke ACL ne UDP 1812 block kiya). Switch B: Event Viewer ne unknown device dikhaya (source loopback tha). Switch C: Event Viewer ne secret failure dikhaya (key typo). Ek symptom, "RADIUS unreachable", ke teen alag causes aur teen alag owners the: security, network aur NAC.</p><p><b>Seekh:</b> evidence se owner chuno, phir ek ek cheez fix karo.</p></div>

<div class="iv"><p class="q">"Naye switch par koi user authenticate nahi kar paa raha, troubleshooting samjhao."</p><p>Strong answer: switch par RADIUS server counters aur port-access configuration se shuru karo; reachability test karo; phir ClearPass Event Viewer mein unknown device ya secret failure padho; jab request Access Tracker mein dikhe to Summary, Output aur Alerts padho; aur aakhir mein switch par role name, VLAN aur trunk verify karo. Ek samay mein ek change karo, aur fresh authentication se prove karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Outside in kaam karo: switch counters, reachability, Event Viewer, Access Tracker, switch role aur VLAN.</li>
<li>Reply nahi aur unknown-device log matlab NAD IP fix karo; secret failure matlab secrets align karo.</li>
<li>Mixed-port ticket interface range design ko endpoint status check ke saath jodta hai.</li>
<li>Har fix ko fresh authentication aur client list se prove karo, assumption se nahi.</li>
<li>Ek samay mein ek change; clue decide karta hai ki fix kis team ka hai.</li>
</ul></div>
`}};export{e as default};