var e={id:`tools-runbooks`,h:{en:`Built-in tools, change management and NOC runbooks`,hi:`Built-in tools, change management aur NOC runbooks`},body:{en:`
<p>A good mechanic does not start by taking the engine apart. She plugs in the diagnostic reader, listens, checks the oil, and follows a written checklist. A NOC works the same way. The Manager gives you a built-in toolbox, and a runbook tells you which tool to use first, what a normal answer looks like and when to escalate. This chapter ties the module together with the tools and the habits around them.</p>

<h3>The toolbox in the Manager</h3>
<p>Open <b>Monitor &gt; Devices</b> (named Monitor &gt; Network in some releases), pick a device and look at its <b>Troubleshooting</b> section. The names vary by release, but the functions are these:</p>
<table class="cmp"><tr><th>Tool</th><th>What it answers</th><th>Typical use</th></tr>
<tr><td>Ping</td><td>Is the destination reachable from this device, in this VPN?</td><td>E-MUM-1 to the DC server in VPN 10, or to a provider gateway in VPN 0</td></tr>
<tr><td>Trace route</td><td>Where does the path stop or slow down?</td><td>Find the failing hop toward the ISP</td></tr>
<tr><td>Speed test</td><td>What throughput can the circuit give between two devices?</td><td>Before and after a provider change</td></tr>
<tr><td>Packet capture</td><td>What is really on the wire at this interface?</td><td>Prove DSCP markings (qos module) or see a NAT problem</td></tr>
<tr><td>Real-time view</td><td>What do the tables on the device say now?</td><td>Control connections, OMP routes, BFD sessions without opening SSH</td></tr>
<tr><td>Device CLI session</td><td>The full command line, with audit trail</td><td>Anything not covered above</td></tr></table>
<p>Every tool runs on the device itself and the Manager shows the result, so the reading is the <b>device's own view</b>, which is exactly what you want when asking "can E-MUM-1 reach the hub?". From the CLI, the same questions use <code>ping vrf 10 10.10.1.1</code> style commands and <code>show sdwan ...</code> commands; they are collected per layer in the sdw-ts module that follows.</p>

<pre class="out">E-MUM-1# ping vrf 10 10.10.1.10
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.10.1.10, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 38/41/47 ms</pre>
<p class="note">Tip: always state the VPN (VRF) when you ping from a WAN edge. Without it the router tests the transport (VPN 0) and you may "prove" the wrong thing.</p>

<h3>Change management: how changes stay safe</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Change workflow">
<rect x="6" y="50" width="96" height="60" rx="8" fill="#bae6fd"/><text x="54" y="78" text-anchor="middle" class="svg-ink" font-size="12">Request</text><text x="54" y="95" text-anchor="middle" class="svg-muted" font-size="11">ticket, reason</text>
<rect x="116" y="50" width="96" height="60" rx="8" fill="#ddd6fe"/><text x="164" y="78" text-anchor="middle" class="svg-ink" font-size="12">Plan</text><text x="164" y="95" text-anchor="middle" class="svg-muted" font-size="11">steps, rollback</text>
<rect x="226" y="50" width="96" height="60" rx="8" fill="#fde68a"/><text x="274" y="78" text-anchor="middle" class="svg-ink" font-size="12">Backup</text><text x="274" y="95" text-anchor="middle" class="svg-muted" font-size="11">Manager and edge</text>
<rect x="336" y="50" width="96" height="60" rx="8" fill="#bbf7d0"/><text x="384" y="78" text-anchor="middle" class="svg-ink" font-size="12">Pilot</text><text x="384" y="95" text-anchor="middle" class="svg-muted" font-size="11">one site first</text>
<rect x="446" y="50" width="96" height="60" rx="8" fill="#fed7aa"/><text x="494" y="78" text-anchor="middle" class="svg-ink" font-size="12">Roll out</text><text x="494" y="95" text-anchor="middle" class="svg-muted" font-size="11">in waves</text>
<rect x="556" y="50" width="80" height="60" rx="8" fill="#fbcfe8"/><text x="596" y="78" text-anchor="middle" class="svg-ink" font-size="12">Verify</text><text x="596" y="95" text-anchor="middle" class="svg-muted" font-size="11">and record</text>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="13">Every step has an owner and an exit: if the check fails, roll back.</text>
</svg><p class="cap">The same six steps cover a template change, a policy activation and an upgrade.</p></div>
<ul>
<li><b>Before</b>: capture the baseline (control connections, BFD sessions, alarm count, key application numbers) so that "after" can be compared.</li>
<li><b>During</b>: one change at a time, in a window; use the pilot site (a small branch) first; watch the dashboards you looked at before.</li>
<li><b>After</b>: re-collect the same baseline; close alarms that were expected; note the result in the ticket.</li>
<li><b>Rollback</b>: decide it before starting. For an upgrade it is the rollback timer, for a template it is the previous template version, for a policy it is deactivating the activated policy.</li>
</ul>

<h3>Writing a NOC runbook</h3>
<p>A runbook is a short page per alarm or symptom. Keep the same layout everywhere:</p>
<ol>
<li><b>Trigger</b>: the alarm or user complaint, in the words the NOC sees.</li>
<li><b>Impact</b>: which sites, services and users; who must be told.</li>
<li><b>First checks</b>: three or four exact checks with the normal result, for example "Monitor &gt; Devices: is the site reachable? Real time: control connections show 3 up".</li>
<li><b>Decision table</b>: if A then do X, if B then do Y.</li>
<li><b>Escalate</b>: to whom, after how many minutes, with which evidence (screenshots, command output, times).</li>
<li><b>Close</b>: what to record, and the follow-up to prevent a repeat.</li>
</ol>
<p>Example row from the Bharat Retail runbook: <i>Alarm "Control Connection down" on E-BLR-1. Check 1: is the site's circuit up (device reachable by the second transport)? Check 2: certificate valid and clock correct? Check 3: did a template or policy change happen in the last hour (audit log)? If only one transport is down, raise a provider ticket; if all are down, call the branch.</i> This is the entry point to the troubleshooting method of the next module.</p>

<div class="eg"><p><b>Worked example.</b> The NOC measures its process. Last month: 120 alarms, 18 became tickets, 6 were repeats of the same expired-certificate warning. Fix 1: send certificate warnings to the platform owner's mailbox (6 repeats removed). Fix 2: raise the alarm-email threshold for the lowest severity (a noise reduction, chapter 3). Next month: 70 alarms, 11 tickets. A runbook plus measurement turns "we are always busy" into a number that falls.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Running diagnostics from the wrong VPN. (2) Capturing packets on a busy edge for too long. Capture briefly, with a filter, and then stop. (3) Changing several things at once, so nobody knows which fixed or broke it. (4) A runbook that only says "check the logs". (5) No baseline, so nobody can say what changed.</p></div>

<div class="exam"><p><b>Exam trap.</b> Know where the tools live: device troubleshooting in Monitor, real-time commands, packet capture and speed test; and know that a change needs a backup and a rollback path before it begins.</p></div>

<div class="scn"><h4>"The network is slow"</h4><p>A ticket arrives: Hyderabad (E-HYD-1) is slow since 10:00. The engineer opens Monitor &gt; Devices, sees both tunnels up, then the Tunnels view shows loss on the MPLS tunnel to the data centre. A speed test confirms the circuit, a trace route shows the delay starts at the provider gateway. She opens a provider ticket with the times and measurements, and AAR (sdw-aar) moves the voice traffic to the Internet tunnel meanwhile. The runbook gave the order; the tools gave the proof.</p><p><b>Lesson:</b> prove where the problem is before you call anyone.</p></div>

<div class="iv"><p class="q">"A branch reports problems. What is your first ten minutes?"</p><p>I check the ticket's scope and open the device in the Manager: is it reachable, are control connections and tunnels up, which alarms are open, and was anything changed recently according to the audit log. Then I use ping and trace route in the right VPN, the tunnel view for loss, latency and jitter, and a speed test or short packet capture if needed. I compare with the baseline, apply the runbook's decision table, and escalate with evidence if it is the provider or a vendor issue.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The Manager runs ping, trace route, speed test, packet capture and real-time commands on the device.</li>
<li>Always state the VPN when testing from an edge.</li>
<li>Change: request, plan, backup, pilot, waves, verify; rollback decided in advance.</li>
<li>A runbook per symptom: trigger, impact, checks, decisions, escalation, close.</li>
<li>Measure alarms and tickets to improve operations month by month.</li>
</ul></div>
`,hi:`
<p>Achha mechanic engine kholne se shuru nahi karta. Woh diagnostic reader lagata hai, sunta hai, oil check karta hai aur likhi hui checklist follow karta hai. NOC bhi aise hi kaam karta hai. Manager ek built-in toolbox deta hai, aur runbook batata hai pehle kaunsa tool use karna hai, normal jawab kaisa dikhta hai aur kab escalate karna hai. Yeh chapter module ko tools aur unke aas-paas ki aadaton se jodta hai.</p>

<h3>Manager ka toolbox</h3>
<p><b>Monitor &gt; Devices</b> kholo (kuch releases mein Monitor &gt; Network), device chuno aur uska <b>Troubleshooting</b> section dekho. Naam release ke hisaab se badalte hain, lekin functions yeh hain:</p>
<table class="cmp"><tr><th>Tool</th><th>Kya jawab deta hai</th><th>Aam use</th></tr>
<tr><td>Ping</td><td>Is device se, is VPN mein, destination reachable hai?</td><td>E-MUM-1 se VPN 10 mein DC server tak, ya VPN 0 mein provider gateway tak</td></tr>
<tr><td>Trace route</td><td>Path kahan ruka ya slow hua?</td><td>ISP ki taraf failing hop dhoondhna</td></tr>
<tr><td>Speed test</td><td>Do devices ke beech circuit kitna throughput de sakta hai?</td><td>Provider change se pehle aur baad</td></tr>
<tr><td>Packet capture</td><td>Is interface par wire par asal mein kya hai?</td><td>DSCP markings sabit karna (qos module) ya NAT problem dekhna</td></tr>
<tr><td>Real-time view</td><td>Device ki tables abhi kya kehti hain?</td><td>SSH kholne ke bina control connections, OMP routes, BFD sessions</td></tr>
<tr><td>Device CLI session</td><td>Poori command line, audit trail ke saath</td><td>Jo upar cover nahi hai woh sab</td></tr></table>
<p>Har tool device par hi chalta hai aur Manager result dikhata hai, isliye reading <b>device ka apna view</b> hota hai, jo "kya E-MUM-1 hub tak pahunch sakta hai?" poochte waqt chahiye. CLI se wahi sawal <code>ping vrf 10 10.10.1.1</code> jaise commands aur <code>show sdwan ...</code> commands se poochhe jaate hain; woh agle module sdw-ts mein layer-wise ikatthe hain.</p>

<pre class="out">E-MUM-1# ping vrf 10 10.10.1.10
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.10.1.10, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 38/41/47 ms</pre>
<p class="note">Tip: WAN edge se ping karte waqt hamesha VPN (VRF) batao. Uske bina router transport (VPN 0) test karta hai aur aap galat cheez "sabit" kar sakte ho.</p>

<h3>Change management: changes safe kaise rehte hain</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Change workflow">
<rect x="6" y="50" width="96" height="60" rx="8" fill="#bae6fd"/><text x="54" y="78" text-anchor="middle" class="svg-ink" font-size="12">Request</text><text x="54" y="95" text-anchor="middle" class="svg-muted" font-size="11">ticket, wajah</text>
<rect x="116" y="50" width="96" height="60" rx="8" fill="#ddd6fe"/><text x="164" y="78" text-anchor="middle" class="svg-ink" font-size="12">Plan</text><text x="164" y="95" text-anchor="middle" class="svg-muted" font-size="11">steps, rollback</text>
<rect x="226" y="50" width="96" height="60" rx="8" fill="#fde68a"/><text x="274" y="78" text-anchor="middle" class="svg-ink" font-size="12">Backup</text><text x="274" y="95" text-anchor="middle" class="svg-muted" font-size="11">Manager aur edge</text>
<rect x="336" y="50" width="96" height="60" rx="8" fill="#bbf7d0"/><text x="384" y="78" text-anchor="middle" class="svg-ink" font-size="12">Pilot</text><text x="384" y="95" text-anchor="middle" class="svg-muted" font-size="11">pehle ek site</text>
<rect x="446" y="50" width="96" height="60" rx="8" fill="#fed7aa"/><text x="494" y="78" text-anchor="middle" class="svg-ink" font-size="12">Roll out</text><text x="494" y="95" text-anchor="middle" class="svg-muted" font-size="11">waves mein</text>
<rect x="556" y="50" width="80" height="60" rx="8" fill="#fbcfe8"/><text x="596" y="78" text-anchor="middle" class="svg-ink" font-size="12">Verify</text><text x="596" y="95" text-anchor="middle" class="svg-muted" font-size="11">aur record</text>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="13">Har step ka owner aur exit hai: check fail ho to rollback.</text>
</svg><p class="cap">Wahi chhe steps template change, policy activation aur upgrade teeno ko cover karte hain.</p></div>
<ul>
<li><b>Pehle</b>: baseline lo (control connections, BFD sessions, alarm count, key application numbers) taaki "baad" ka compare ho sake.</li>
<li><b>Dauran</b>: ek waqt mein ek change, window mein; pehle pilot site (chhoti branch); jo dashboards pehle dekhe the unhe dekhte raho.</li>
<li><b>Baad</b>: wahi baseline dobara lo; expected alarms close karo; result ticket mein likho.</li>
<li><b>Rollback</b>: shuru karne se pehle tay karo. Upgrade ke liye rollback timer, template ke liye pichhla template version, policy ke liye activated policy ko deactivate karna.</li>
</ul>

<h3>NOC runbook likhna</h3>
<p>Runbook har alarm ya symptom ke liye ek chhota page hota hai. Sab jagah same layout rakho:</p>
<ol>
<li><b>Trigger</b>: alarm ya user complaint, un shabdon mein jo NOC dekhta hai.</li>
<li><b>Impact</b>: kaunsi sites, services aur users; kise batana hai.</li>
<li><b>First checks</b>: teen-chaar exact checks normal result ke saath, jaise "Monitor &gt; Devices: site reachable hai? Real time: control connections mein 3 up".</li>
<li><b>Decision table</b>: agar A to X karo, agar B to Y karo.</li>
<li><b>Escalate</b>: kise, kitne minute baad, kaunse evidence ke saath (screenshots, command output, times).</li>
<li><b>Close</b>: kya record karna hai, aur dobara na ho iske liye follow-up.</li>
</ol>
<p>Bharat Retail runbook ki ek row: <i>E-BLR-1 par alarm "Control Connection down". Check 1: site ka circuit up hai (device doosre transport se reachable)? Check 2: certificate valid aur clock sahi? Check 3: pichhle ghante mein koi template ya policy change hua (audit log)? Agar sirf ek transport down hai to provider ticket, agar sab down hain to branch ko call.</i> Yeh agle module ke troubleshooting method ka entry point hai.</p>

<div class="eg"><p><b>Worked example.</b> NOC apni process naapta hai. Pichhle mahine: 120 alarms, 18 tickets bane, 6 ek hi expired-certificate warning ke repeats the. Fix 1: certificate warnings platform owner ke mailbox mein bhejo (6 repeats gaye). Fix 2: sabse kam severity ke liye alarm-email threshold badhao (noise reduction, chapter 3). Agle mahine: 70 alarms, 11 tickets. Runbook plus measurement "hum hamesha busy hain" ko ek ghatte hue number mein badal deta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Galat VPN se diagnostics chalana. (2) Busy edge par bahut der packet capture karna. Chhota capture, filter ke saath, phir band. (3) Ek saath kai cheezein badalna, to pata nahi kisne theek ya kharab kiya. (4) Aisa runbook jo sirf "logs check karo" kehta hai. (5) Baseline nahi, isliye koi nahi bata sakta kya badla.</p></div>

<div class="exam"><p><b>Exam trap.</b> Tools kahan hain yeh jaano: Monitor mein device troubleshooting, real-time commands, packet capture aur speed test; aur yeh bhi ki change shuru hone se pehle backup aur rollback path chahiye.</p></div>

<div class="scn"><h4>"Network slow hai"</h4><p>Ticket aata hai: Hyderabad (E-HYD-1) 10:00 se slow hai. Engineer Monitor &gt; Devices kholti hai, dono tunnels up dikhte hain, phir Tunnels view data centre ke MPLS tunnel par loss dikhata hai. Speed test circuit confirm karta hai, trace route dikhata hai ki delay provider gateway se shuru hota hai. Woh time aur measurements ke saath provider ticket kholti hai, aur tab tak AAR (sdw-aar) voice traffic ko Internet tunnel par le jaata hai. Runbook ne order diya; tools ne saboot diya.</p><p><b>Lesson:</b> kisi ko call karne se pehle sabit karo problem kahan hai.</p></div>

<div class="iv"><p class="q">"Branch problem report karti hai. Tumhare pehle das minute kya hain?"</p><p>Main ticket ka scope dekhta hoon aur device Manager mein kholta hoon: reachable hai, control connections aur tunnels up hain, kaunse alarms open hain, aur audit log ke hisaab se haal mein kuch badla ya nahi. Phir sahi VPN mein ping aur trace route, loss, latency aur jitter ke liye tunnel view, aur zaroorat ho to speed test ya chhota packet capture. Baseline se compare karta hoon, runbook ki decision table lagata hoon, aur provider ya vendor issue ho to evidence ke saath escalate karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Manager device par ping, trace route, speed test, packet capture aur real-time commands chalata hai.</li>
<li>Edge se test karte waqt hamesha VPN batao.</li>
<li>Change: request, plan, backup, pilot, waves, verify; rollback pehle tay.</li>
<li>Har symptom ke liye runbook: trigger, impact, checks, decisions, escalation, close.</li>
<li>Operations mahine-dar-mahine sudharne ke liye alarms aur tickets naapo.</li>
</ul></div>
`}};export{e as default};