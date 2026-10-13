var e={id:`tools-escalation`,h:{en:`The troubleshooting toolbox and what to gather before you escalate`,hi:`Troubleshooting toolbox aur escalate karne se pehle kya jama karein`},body:{en:`
<p>A mechanic has a stethoscope for the engine, a scanner for the computer and a torch for the dark corners. A good one also keeps a notebook so the next mechanic does not start from zero. This chapter puts the Prisma SD-WAN tools in one place, tells you what each one can and cannot prove, and gives you the escalation package: what to gather so that your manager, the carrier or Palo Alto Networks support can act at once.</p>
<h3>The toolbox</h3>
<table class="cmp"><tr><th>Tool</th><th>Best for</th><th>Cannot tell you</th></tr><tr><td>Dashboard and device status</td><td>Scope: which sites, online or offline, software version</td><td>Why</td></tr><tr><td>Incidents and alerts</td><td>What the controller raised, when, how long, and its category</td><td>Faults that nothing is configured to detect</td></tr><tr><td>Audit log</td><td>What changed, who changed it and when; compare versions</td><td>Faults not caused by a change</td></tr><tr><td>Flow view (advanced information)</td><td>Which rule and path a flow got and why paths were dropped</td><td>The quality of the path</td></tr><tr><td>Link and path quality, WAN Clarity</td><td>Latency, jitter, loss, utilisation, top applications over time</td><td>Which user segment is bad</td></tr><tr><td>ADEM</td><td>Experience per segment from device to application</td><td>The configuration cause</td></tr><tr><td>Remote session and ION CLI</td><td>Current device state: controller, interfaces, tunnels, routing, policy</td><td>History (use the portal for that)</td></tr><tr><td>Standing alarms on the device</td><td>Alarms active on the ION now, with code, severity and peer</td><td>Past alarms</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="diagram">
<rect x="10" y="20" width="140" height="60" rx="10" fill="#fecaca"/><text x="80" y="46" text-anchor="middle" class="svg-ink" font-size="12">Dashboard</text><text x="80" y="63" text-anchor="middle" class="svg-muted" font-size="11">scope</text>
<rect x="170" y="20" width="140" height="60" rx="10" fill="#fed7aa"/><text x="240" y="46" text-anchor="middle" class="svg-ink" font-size="12">Incidents</text><text x="240" y="63" text-anchor="middle" class="svg-muted" font-size="11">what and when</text>
<rect x="330" y="20" width="140" height="60" rx="10" fill="#fde68a"/><text x="400" y="46" text-anchor="middle" class="svg-ink" font-size="12">Audit log</text><text x="400" y="63" text-anchor="middle" class="svg-muted" font-size="11">what changed</text>
<rect x="490" y="20" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="560" y="46" text-anchor="middle" class="svg-ink" font-size="12">Flow view</text><text x="560" y="63" text-anchor="middle" class="svg-muted" font-size="11">rule and path</text>
<rect x="10" y="120" width="190" height="60" rx="10" fill="#bae6fd"/><text x="105" y="146" text-anchor="middle" class="svg-ink" font-size="12">WAN Clarity, path quality</text><text x="105" y="163" text-anchor="middle" class="svg-muted" font-size="11">trends, saturation</text>
<rect x="225" y="120" width="190" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="12">ADEM</text><text x="320" y="163" text-anchor="middle" class="svg-muted" font-size="11">segment scores</text>
<rect x="440" y="120" width="190" height="60" rx="10" fill="#e2e8f0"/><text x="535" y="146" text-anchor="middle" class="svg-ink" font-size="12">Remote session, CLI</text><text x="535" y="163" text-anchor="middle" class="svg-muted" font-size="11">device state now</text>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">Top row: who, what, when, why. Bottom row: how bad, where, and the device itself.</text>
</svg><p class="cap">Seven tools, two rows. Start at the top for scope and change; go to the bottom for depth.</p></div>
<h3>Using the CLI safely</h3>
<ul>
<li>Open sessions from the portal (they are logged); limits are 10 per device and 30 per account. Close them when done.</li>
<li>Run read-only <code>dump</code> and <code>inspect</code> first. Use <code>ping</code>, <code>tcpping</code>, <code>nslookup</code> and <code>traceroute</code> from the right interface.</li>
<li>Keep <code>tcpdump</code> short and filtered. Use <code>debug</code> and <code>clear</code> only with a reason and a plan to stop or undo; do not use <code>clear</code> on a production routing peer in business hours.</li>
<li>Prefer the portal for configuration changes, because it is audited. Direct console or SSH is for a device that is offline; the best practices article says public circuit SSH access is blocked by default and that a one-time password feature exists for offline recovery.</li>
</ul>
<h4>Reference configuration (not run in the simulator)</h4>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! A first-pass evidence collection from a remote session (read-only)</span>
dump device info
dump software status
dump time status
dump controller status
dump interface status
dump waninterface summary
dump vpn summary all
dump routing summary
dump standingalarms</pre>
<p>The commands come from the ION CLI reference list of dump commands. Save the output into the ticket; do not retype it.</p>
<h3>The escalation package</h3>
<p>Before you open a carrier ticket or contact Palo Alto Networks support, gather this. A complete package avoids a day of questions.</p>
<table class="cmp"><tr><th>Item</th><th>Example</th></tr><tr><td>Impact and scope</td><td>"br-pune-01, 40 users, ERP unreachable, since 09:30 IST, two other sites fine"</td></tr><tr><td>Timeline</td><td>First symptom time, incident times with time zone, last known good time</td></tr><tr><td>What changed</td><td>Audit log entries before the start; any carrier or site change</td></tr><tr><td>Identity</td><td>Tenant or TSG, site name, element name, model, serial number, software version</td></tr><tr><td>Evidence</td><td>Incident codes, standing alarms, flow view of an affected flow, ADEM or path quality screenshot of the window</td></tr><tr><td>CLI output</td><td>The first-pass listing above, plus the specific checks for the layer</td></tr><tr><td>Circuit details</td><td>Carrier, circuit ID, label, bandwidth, ISP ticket number if any</td></tr><tr><td>What you tried</td><td>Each step with result and time; what you reverted</td></tr></table>
<h3>Closing a ticket well</h3>
<ol>
<li>Confirm the fix with the same measurement that showed the fault (the flow view, ADEM score, tunnel state).</li>
<li>Record the cause and the layer in the ticket.</li>
<li>Update the runbook if it did not match reality (psd-ops chapter 8).</li>
<li>If a setting was wrong in a template or a policy set, fix it at the source so the next site does not repeat it.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> At 11:00 br-delhi-02 loses its ISP-A tunnel to dc-central. The NOC engineer opens the escalation note: scope one circuit; time 10:42 IST first incident; audit log empty; ION model and software from <code>dump device info</code> and <code>dump software status</code>; <code>dump vpn summary Status=Down</code> shows the ISP-A tunnel down and ISP-B up; the carrier ticket number is CAR-48211 (story value); steps tried: interface bounce at 10:55 without effect. The carrier replies in ten minutes with a known fibre fault.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Escalating with "it is down" and nothing else. Times without a time zone. Screenshots of the wrong window. Running clear or debug before capturing the evidence. Forgetting to close remote sessions. Writing the cause in a chat message instead of the ticket.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know which tool answers which question: audit log for who changed, incidents for what the controller raised, flow view for rule and path, ADEM for the segment, WAN Clarity for trends and utilisation, remote session for the device now. Know the session limits (10 per device, 30 per account) and that debug and clear carry risk.</p></div>
<div class="scn"><h4>The ticket that took four minutes</h4><p>A carrier engineer received a Harbor Retail ticket with the circuit ID, the exact start time with zone, the ION model and software, the tunnel state, and a note that the ISP-B interface had no CRC errors. They found a provisioning error on their side in four minutes. The week before, a ticket that said only "your link is bad" had taken three days.</p><p><b>Lesson:</b> a good package is the fastest fix.</p></div>
<div class="iv"><p class="q">"What do you send to support when you escalate a Prisma SD-WAN case?"</p><p>Impact and scope, the timeline with time zone, what changed from the audit log, tenant, site, element, model, serial and software version, incident codes and standing alarms, a flow view or ADEM capture of an affected flow, the CLI output for the layer I think is faulty, the carrier and circuit details, and everything I already tried with results.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Seven tools: dashboard, incidents, audit log, flow view, WAN Clarity, ADEM, remote session and CLI.</li><li>Use read-only commands first; sessions are limited (10 per device, 30 per account); debug and clear are risky.</li><li>Escalation package: impact, timeline, change, identity, evidence, CLI output, circuit details, steps tried.</li><li>Confirm a fix with the same measurement that showed the fault.</li><li>Fix the source (template, policy set) and update the runbook.</li></ul></div>
`,hi:`
<p>Mechanic ke paas engine ke liye stethoscope hota hai, computer ke liye scanner aur andhere kono ke liye torch. Achha mechanic notebook bhi rakhta hai taaki agla mechanic zero se shuru na kare. Yeh chapter Prisma SD-WAN tools ek jagah rakhta hai, batata hai ki har ek kya prove kar sakta hai aur kya nahi, aur escalation package deta hai: kya jama karein taaki aapka manager, carrier ya Palo Alto Networks support turant action le saken.</p>
<h3>Toolbox</h3>
<table class="cmp"><tr><th>Tool</th><th>Kis liye best</th><th>Kya nahi bata sakta</th></tr><tr><td>Dashboard aur device status</td><td>Scope: kaun si sites, online ya offline, software version</td><td>Kyun</td></tr><tr><td>Incidents aur alerts</td><td>Controller ne kya raise kiya, kab, kitni der, aur uski category</td><td>Aise faults jinhe detect karne ke liye kuch configure nahi</td></tr><tr><td>Audit log</td><td>Kya badla, kisne badla aur kab; versions compare</td><td>Aise faults jo change se nahi aaye</td></tr><tr><td>Flow view (advanced information)</td><td>Flow ko kaun si rule aur path mila aur paths kyun gire</td><td>Path ki quality</td></tr><tr><td>Link aur path quality, WAN Clarity</td><td>Latency, jitter, loss, utilisation, top applications time ke saath</td><td>User ka kaun sa segment kharab hai</td></tr><tr><td>ADEM</td><td>Device se application tak segment ke hisaab se experience</td><td>Configuration wajah</td></tr><tr><td>Remote session aur ION CLI</td><td>Device ki abhi ki state: controller, interfaces, tunnels, routing, policy</td><td>History (uske liye portal)</td></tr><tr><td>Device par standing alarms</td><td>ION par abhi active alarms, code, severity aur peer ke saath</td><td>Purane alarms</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="diagram">
<rect x="10" y="20" width="140" height="60" rx="10" fill="#fecaca"/><text x="80" y="46" text-anchor="middle" class="svg-ink" font-size="12">Dashboard</text><text x="80" y="63" text-anchor="middle" class="svg-muted" font-size="11">scope</text>
<rect x="170" y="20" width="140" height="60" rx="10" fill="#fed7aa"/><text x="240" y="46" text-anchor="middle" class="svg-ink" font-size="12">Incidents</text><text x="240" y="63" text-anchor="middle" class="svg-muted" font-size="11">kya aur kab</text>
<rect x="330" y="20" width="140" height="60" rx="10" fill="#fde68a"/><text x="400" y="46" text-anchor="middle" class="svg-ink" font-size="12">Audit log</text><text x="400" y="63" text-anchor="middle" class="svg-muted" font-size="11">kya badla</text>
<rect x="490" y="20" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="560" y="46" text-anchor="middle" class="svg-ink" font-size="12">Flow view</text><text x="560" y="63" text-anchor="middle" class="svg-muted" font-size="11">rule aur path</text>
<rect x="10" y="120" width="190" height="60" rx="10" fill="#bae6fd"/><text x="105" y="146" text-anchor="middle" class="svg-ink" font-size="12">WAN Clarity, path quality</text><text x="105" y="163" text-anchor="middle" class="svg-muted" font-size="11">trends, saturation</text>
<rect x="225" y="120" width="190" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="12">ADEM</text><text x="320" y="163" text-anchor="middle" class="svg-muted" font-size="11">segment scores</text>
<rect x="440" y="120" width="190" height="60" rx="10" fill="#e2e8f0"/><text x="535" y="146" text-anchor="middle" class="svg-ink" font-size="12">Remote session, CLI</text><text x="535" y="163" text-anchor="middle" class="svg-muted" font-size="11">device ki abhi ki state</text>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">Upar ki row: kaun, kya, kab, kyun. Neeche ki row: kitna kharab, kahan, aur device khud.</text>
</svg><p class="cap">Saat tools, do rows. Scope aur change ke liye upar se shuru karo; depth ke liye neeche jao.</p></div>
<h3>CLI ko safely use karna</h3>
<ul>
<li>Sessions portal se kholo (woh logged hote hain); limits hain 10 per device aur 30 per account. Kaam khatam hone par band karo.</li>
<li>Pehle read-only <code>dump</code> aur <code>inspect</code> chalao. <code>ping</code>, <code>tcpping</code>, <code>nslookup</code> aur <code>traceroute</code> sahi interface se use karo.</li>
<li><code>tcpdump</code> ko chhota aur filtered rakho. <code>debug</code> aur <code>clear</code> sirf kisi wajah aur rokne ya undo karne ke plan ke saath use karo; business hours mein production routing peer par <code>clear</code> mat karo.</li>
<li>Configuration changes ke liye portal prefer karo, kyunki woh audited hai. Direct console ya SSH offline device ke liye hai; best practices article kehta hai ki public circuit par SSH access default se blocked hai aur offline recovery ke liye one-time password feature hai.</li>
</ul>
<h4>Reference configuration (not run in the simulator)</h4>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! A first-pass evidence collection from a remote session (read-only)</span>
dump device info
dump software status
dump time status
dump controller status
dump interface status
dump waninterface summary
dump vpn summary all
dump routing summary
dump standingalarms</pre>
<p>Commands ION CLI reference ki dump commands list se hain. Output ko ticket mein save karo; dobara type mat karo.</p>
<h3>Escalation package</h3>
<p>Carrier ticket kholne ya Palo Alto Networks support se contact karne se pehle yeh jama karo. Poora package ek din ke sawalon se bachata hai.</p>
<table class="cmp"><tr><th>Item</th><th>Example</th></tr><tr><td>Impact aur scope</td><td>"br-pune-01, 40 users, ERP unreachable, 09:30 IST se, do aur sites theek"</td></tr><tr><td>Timeline</td><td>Pehle symptom ka time, time zone ke saath incident times, last known good time</td></tr><tr><td>Kya badla</td><td>Start se pehle audit log entries; koi carrier ya site change</td></tr><tr><td>Identity</td><td>Tenant ya TSG, site name, element name, model, serial number, software version</td></tr><tr><td>Evidence</td><td>Incident codes, standing alarms, affected flow ka flow view, window ka ADEM ya path quality screenshot</td></tr><tr><td>CLI output</td><td>Upar ki first-pass listing, plus layer ke specific checks</td></tr><tr><td>Circuit details</td><td>Carrier, circuit ID, label, bandwidth, ISP ticket number agar ho</td></tr><tr><td>Kya try kiya</td><td>Har step result aur time ke saath; kya revert kiya</td></tr></table>
<h3>Ticket achhe se close karna</h3>
<ol>
<li>Fix ko wahi measurement se confirm karo jisne fault dikhaya tha (flow view, ADEM score, tunnel state).</li>
<li>Ticket mein cause aur layer record karo.</li>
<li>Agar runbook asliyat se match nahi karta to update karo (psd-ops chapter 8).</li>
<li>Agar template ya policy set mein setting galat thi to use source par theek karo taaki agli site wahi galti na dohraye.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> 11:00 par br-delhi-02 dc-central tak apna ISP-A tunnel kho deta hai. NOC engineer escalation note kholta hai: scope ek circuit; time 10:42 IST pehla incident; audit log khaali; ION model aur software <code>dump device info</code> aur <code>dump software status</code> se; <code>dump vpn summary Status=Down</code> ISP-A tunnel down aur ISP-B up dikhata hai; carrier ticket number CAR-48211 hai (story value); try kiye steps: 10:55 par interface bounce, koi asar nahi. Carrier das minute mein known fibre fault ke saath jawab deta hai.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> "Down hai" aur kuch nahi ke saath escalate karna. Time zone ke bina times. Galat window ke screenshots. Evidence capture karne se pehle clear ya debug chalana. Remote sessions band karna bhool jaana. Cause ko ticket ke bajay chat message mein likhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jaano kaun sa tool kaun sa sawal solve karta hai: kisne badla ke liye audit log, controller ne kya raise kiya ke liye incidents, rule aur path ke liye flow view, segment ke liye ADEM, trends aur utilisation ke liye WAN Clarity, device abhi ke liye remote session. Session limits (10 per device, 30 per account) jaano aur yeh bhi ki debug aur clear mein risk hai.</p></div>
<div class="scn"><h4>Woh ticket jo chaar minute mein hua</h4><p>Carrier engineer ko Harbor Retail ka ticket mila jisme circuit ID, zone ke saath exact start time, ION model aur software, tunnel state, aur note tha ki ISP-B interface par koi CRC errors nahi. Unhone chaar minute mein apni taraf ki provisioning error dhoondh li. Pichhle hafte jis ticket mein sirf "aapki link kharab hai" likha tha usme teen din lage the.</p><p><b>Seekh:</b> achha package sabse tez fix hai.</p></div>
<div class="iv"><p class="q">"Prisma SD-WAN case escalate karte waqt support ko kya bhejte ho?"</p><p>Impact aur scope, time zone ke saath timeline, audit log se kya badla, tenant, site, element, model, serial aur software version, incident codes aur standing alarms, affected flow ka flow view ya ADEM capture, jis layer par fault lagta hai uska CLI output, carrier aur circuit details, aur jo kuch pehle try kiya result ke saath.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Saat tools: dashboard, incidents, audit log, flow view, WAN Clarity, ADEM, remote session aur CLI.</li><li>Pehle read-only commands; sessions limited hain (10 per device, 30 per account); debug aur clear risky hain.</li><li>Escalation package: impact, timeline, change, identity, evidence, CLI output, circuit details, steps tried.</li><li>Fix ko usi measurement se confirm karo jisne fault dikhaya tha.</li><li>Source theek karo (template, policy set) aur runbook update karo.</li></ul></div>
`}};export{e as default};