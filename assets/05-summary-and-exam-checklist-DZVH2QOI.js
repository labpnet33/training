var e={id:`summary-and-exam-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The module in one page</h3>
<p>Operations is where all the earlier skills meet. An incident is handled with a workflow (detect, triage, communicate, mitigate, fix, verify, review), investigated with evidence from every signal (SNMP, flows, logs, probes, captures), traced end to end by halving the path, changed under control and reviewed without blame. Click-ops, but you understand what each click does: Live tools only read or copy, Apply is the only click that changes configuration, and the audit log remembers both.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Operations map">
<rect x="10" y="20" width="190" height="60" rx="10" fill="#bae6fd"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="13">Workflow</text><text x="105" y="66" text-anchor="middle" class="svg-muted" font-size="12">7 steps, 4 roles</text>
<rect x="225" y="20" width="190" height="60" rx="10" fill="#fde68a"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">Evidence</text><text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="12">5 signals, 1 window</text>
<rect x="440" y="20" width="190" height="60" rx="10" fill="#ddd6fe"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="13">Method</text><text x="535" y="66" text-anchor="middle" class="svg-muted" font-size="12">halve the path</text>
<rect x="120" y="115" width="190" height="60" rx="10" fill="#fed7aa"/><text x="215" y="143" text-anchor="middle" class="svg-ink" font-size="13">Change control</text><text x="215" y="161" text-anchor="middle" class="svg-muted" font-size="12">plan, checks, rollback</text>
<rect x="335" y="115" width="190" height="60" rx="10" fill="#bbf7d0"/><text x="430" y="143" text-anchor="middle" class="svg-ink" font-size="13">Postmortem</text><text x="430" y="161" text-anchor="middle" class="svg-muted" font-size="12">blameless, actions</text>
<g stroke="#64748b" stroke-width="2"><line x1="200" y1="50" x2="225" y2="50"/><line x1="415" y1="50" x2="440" y2="50"/><line x1="310" y1="145" x2="335" y2="145"/></g>
</svg><p class="cap">Five parts of one operating practice.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>List the seven incident steps in order and say what each one produces.</li>
<li>Name the four roles and what the commander does not do.</li>
<li>Write a four-line stakeholder update: impact, status, action, next update.</li>
<li>Run ping, traceroute and a filtered capture from Live tools and find them in the audit log (lab obs-ops-1).</li>
<li>Correlate SNMP, flows, logs, probes and capture on one window and place.</li>
<li>Write capture filters with host, src, dst, port, tcp, udp and and.</li>
<li>Read a capture: SYN with retransmissions and no reply means the answer never came back.</li>
<li>Prove loss at a handoff with counts at both ends plus a probe.</li>
<li>Apply the seven-move troubleshooting method and halve the path.</li>
<li>Find and fix three monitoring faults after a change: SNMP community, syslog destination and collector, flow export source (lab obs-ops-2).</li>
<li>Write a change request with pre-checks, post-checks and rollback.</li>
<li>Write a blameless postmortem with owned action items.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Incident</dt><dd>An unplanned event that hurts or threatens a service.</dd>
<dt>Incident commander</dt><dd>The person who owns and coordinates the response.</dd>
<dt>Triage</dt><dd>Sizing the problem and setting severity.</dd>
<dt>Mitigate</dt><dd>Reduce the pain quickly, usually reversibly, before the root cause is known.</dd>
<dt>Correlation</dt><dd>Lining up several signals on the same time window and place.</dd>
<dt>Packet capture</dt><dd>A recording of actual packets on a link, narrowed with a filter.</dd>
<dt>Handoff</dt><dd>The point where your network meets a provider's circuit.</dd>
<dt>Rollback</dt><dd>The prepared steps to undo a change.</dd>
<dt>Pre-check, post-check</dt><dd>The same measurements taken before and after a change.</dd>
<dt>Postmortem</dt><dd>A written review of an incident; blameless means it targets the system, not a person.</dd>
<dt>Audit log</dt><dd>The record of tool runs and applied changes in the console.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>What comes first when users are hurting?</td><td>Mitigate, then understand</td></tr>
<tr><td>Which signal shows who talks to whom?</td><td>Flows</td></tr>
<tr><td>Which signal shows retransmissions?</td><td>Packet capture</td></tr>
<tr><td>Which signal is blind to who is using a link?</td><td>SNMP counters</td></tr>
<tr><td>Why does a flow exporter show nothing though it is on?</td><td>Export source is not Loopback0, so the collector rejects it (also check destination, port, version)</td></tr>
<tr><td>Which SNMP reason code means a community typo?</td><td>wrong-community</td></tr>
<tr><td>Proof of loss at a provider handoff?</td><td>Captures at both ends for the same window plus a probe</td></tr>
<tr><td>What must every change request include?</td><td>Rollback and post-checks</td></tr>
</table>

<h3>Quick reference</h3>
<pre class="out">Live tools        ping  traceroute  capture  query   (each run is audited)
Capture filter    host x | src x | dst x | port n | tcp | udp   joined with and
Reason codes      SNMP: wrong-community, auth-failure, timeout
                  Syslog: dest, port, proto, collector-off
                  Flow: dest, port, version, source
Collector         syslog UDP 514   flows UDP 9995   v9 and ipfix   OBSERVER 10.1.50.100
<span class="hl">Apply</span> is the only step that changes configuration; it is written to the audit log</pre>

<div class="note"><p><b>What does this change on the wire/policy?</b> In operations, most clicks are reads: they change nothing. Probes, ping and traceroute add small test packets. Capture copies packets. Applied configuration changes alter polling strings, log destinations, export sources, probe settings or alert delivery, and each one is a change that needs checks and a rollback.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Declaring victory when the alert clears; capturing on the wrong side; skipping the timeline; changing several things at once; writing a postmortem that blames a person.</p></div>
<div class="exam"><p><b>Exam trap.</b> If a question lists verification choices, choose user-level evidence (probe back to normal, application works) over "no more alerts".</p></div>

<div class="scn"><h4>A major outage, run properly</h4><p>When the Hyderabad ILL circuit failed, Priya Nair took command, Ravi investigated with probes and captures, Meena posted updates every 15 minutes and Kabir kept the timeline. Traffic moved to BB-HYD-02 within 12 minutes, the provider repaired the circuit later, and the probe confirmed normal latency. The blameless review added a probe on the backup path and a runbook.</p><p><b>Lesson:</b> roles, evidence and order made a major outage calm.</p></div>

<div class="iv"><p class="q">"Tell me about a time you handled an incident, or how you would."</p><p>Use the workflow: how you detected it, who held which role, which evidence you gathered, what you mitigated and fixed, how you verified, and what the review changed. Give numbers such as time to detect and time to mitigate.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Incidents follow seven steps with four roles; evidence is written down throughout.</li>
<li>Correlate five signals; each has blind spots.</li>
<li>Halve the path; read reason codes; fix one thing at a time.</li>
<li>Every change has a rollback and post-checks that include monitoring.</li>
<li>Postmortems are blameless and end in owned actions.</li>
</ul></div>
`,hi:`
<h3>Module ek page par</h3>
<p>Operations woh jagah hai jahan pehle ke saare skills milte hain. Incident workflow se handle hota hai (detect, triage, communicate, mitigate, fix, verify, review), har signal ke evidence se investigate hota hai (SNMP, flows, logs, probes, captures), path aadha karke end to end trace hota hai, control mein change hota hai aur bina blame ke review hota hai. Click-ops, but you understand what each click does: Live tools sirf padhte ya copy karte hain, Apply akela click hai jo configuration badalta hai, aur audit log dono yaad rakhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Operations map">
<rect x="10" y="20" width="190" height="60" rx="10" fill="#bae6fd"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="13">Workflow</text><text x="105" y="66" text-anchor="middle" class="svg-muted" font-size="12">7 steps, 4 roles</text>
<rect x="225" y="20" width="190" height="60" rx="10" fill="#fde68a"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">Evidence</text><text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="12">5 signals, 1 window</text>
<rect x="440" y="20" width="190" height="60" rx="10" fill="#ddd6fe"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="13">Method</text><text x="535" y="66" text-anchor="middle" class="svg-muted" font-size="12">path aadha karo</text>
<rect x="120" y="115" width="190" height="60" rx="10" fill="#fed7aa"/><text x="215" y="143" text-anchor="middle" class="svg-ink" font-size="13">Change control</text><text x="215" y="161" text-anchor="middle" class="svg-muted" font-size="12">plan, checks, rollback</text>
<rect x="335" y="115" width="190" height="60" rx="10" fill="#bbf7d0"/><text x="430" y="143" text-anchor="middle" class="svg-ink" font-size="13">Postmortem</text><text x="430" y="161" text-anchor="middle" class="svg-muted" font-size="12">blameless, actions</text>
<g stroke="#64748b" stroke-width="2"><line x1="200" y1="50" x2="225" y2="50"/><line x1="415" y1="50" x2="440" y2="50"/><line x1="310" y1="145" x2="335" y2="145"/></g>
</svg><p class="cap">Ek operating practice ke paanch hisse.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Saat incident steps order mein ginao aur batao har ek kya produce karta hai.</li>
<li>Chaar roles ke naam batao aur commander kya nahi karta.</li>
<li>Chaar line ka stakeholder update likho: impact, status, action, next update.</li>
<li>Live tools se ping, traceroute aur filtered capture chalao aur audit log mein dhundo (lab obs-ops-1).</li>
<li>SNMP, flows, logs, probes aur capture ko ek window aur jagah par correlate karo.</li>
<li>host, src, dst, port, tcp, udp aur and ke saath capture filters likho.</li>
<li>Capture padho: retransmissions ke saath SYN aur koi reply nahi matlab jawab wapas nahi aaya.</li>
<li>Handoff par loss dono ends ke counts plus probe se saabit karo.</li>
<li>Saat-move troubleshooting method lagao aur path aadha karo.</li>
<li>Change ke baad teen monitoring faults dhundo aur fix karo: SNMP community, syslog destination aur collector, flow export source (lab obs-ops-2).</li>
<li>Pre-checks, post-checks aur rollback ke saath change request likho.</li>
<li>Owned action items ke saath blameless postmortem likho.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Incident</dt><dd>Unplanned event jo service ko hurt ya khatre mein daalta hai.</dd>
<dt>Incident commander</dt><dd>Woh insaan jo response ka owner aur coordinator hai.</dd>
<dt>Triage</dt><dd>Problem ka size dekhna aur severity set karna.</dd>
<dt>Mitigate</dt><dd>Root cause pata hone se pehle dard jaldi kam karna, aam taur par reversible tareeke se.</dd>
<dt>Correlation</dt><dd>Kai signals ko ek hi time window aur jagah par line up karna.</dd>
<dt>Packet capture</dt><dd>Link par asli packets ki recording, filter se narrow.</dd>
<dt>Handoff</dt><dd>Woh point jahan aapka network provider ke circuit se milta hai.</dd>
<dt>Rollback</dt><dd>Change ko undo karne ke taiyaar steps.</dd>
<dt>Pre-check, post-check</dt><dd>Change se pehle aur baad ke wahi measurements.</dd>
<dt>Postmortem</dt><dd>Incident ka likha hua review; blameless matlab system ko target karta hai, insaan ko nahi.</dd>
<dt>Audit log</dt><dd>Console mein tool runs aur applied changes ka record.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Sawal</th><th>Jawab</th></tr>
<tr><td>Users hurt hon to pehle kya?</td><td>Mitigate, phir samjho</td></tr>
<tr><td>Kaun sa signal batata hai kaun kis se baat karta hai?</td><td>Flows</td></tr>
<tr><td>Kaun sa signal retransmissions dikhata hai?</td><td>Packet capture</td></tr>
<tr><td>Kaun sa signal andha hai ki link kaun use kar raha hai?</td><td>SNMP counters</td></tr>
<tr><td>Flow exporter on hai phir bhi kuch nahi dikhta, kyun?</td><td>Export source Loopback0 nahi, to collector reject karta hai (destination, port, version bhi check karo)</td></tr>
<tr><td>Community typo ka SNMP reason code?</td><td>wrong-community</td></tr>
<tr><td>Provider handoff par loss ka saboot?</td><td>Same window ke dono ends ke captures plus probe</td></tr>
<tr><td>Har change request mein kya hona chahiye?</td><td>Rollback aur post-checks</td></tr>
</table>

<h3>Quick reference</h3>
<pre class="out">Live tools        ping  traceroute  capture  query   (har run audit hota hai)
Capture filter    host x | src x | dst x | port n | tcp | udp   and se jode hue
Reason codes      SNMP: wrong-community, auth-failure, timeout
                  Syslog: dest, port, proto, collector-off
                  Flow: dest, port, version, source
Collector         syslog UDP 514   flows UDP 9995   v9 aur ipfix   OBSERVER 10.1.50.100
<span class="hl">Apply</span> akela step hai jo configuration badalta hai; woh audit log mein likha jaata hai</pre>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Operations mein zyadatar clicks reads hain: kuch nahi badalte. Probes, ping aur traceroute chhote test packets jodte hain. Capture packets copy karta hai. Applied configuration changes polling strings, log destinations, export sources, probe settings ya alert delivery badalte hain, aur har ek change hai jise checks aur rollback chahiye.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Alert clear hone par jeet ghoshit karna; galat side par capture; timeline skip; kai cheezein ek saath badalna; aisa postmortem likhna jo insaan ko blame kare.</p></div>
<div class="exam"><p><b>Exam trap.</b> Agar question verification ke options deta hai, to user-level evidence (probe normal par, application kaam karti hai) chuno, "ab alerts nahi" nahi.</p></div>

<div class="scn"><h4>Major outage, sahi tareeke se</h4><p>Jab Hyderabad ILL circuit fail hua, Priya Nair ne command li, Ravi ne probes aur captures se investigate kiya, Meena ne har 15 minute update post kiya aur Kabir ne timeline rakhi. Traffic 12 minute mein BB-HYD-02 par chala gaya, provider ne baad mein circuit theek kiya, aur probe ne normal latency confirm ki. Blameless review ne backup path par probe aur runbook jode.</p><p><b>Seekh:</b> roles, evidence aur order ne major outage ko shaant bana diya.</p></div>

<div class="iv"><p class="q">"Koi incident jo aapne handle kiya ya kaise karoge, batao."</p><p>Workflow use karo: kaise detect kiya, kisne kaun sa role liya, kaun sa evidence jama kiya, kya mitigate aur fix kiya, kaise verify kiya, aur review ne kya badla. Time to detect aur time to mitigate jaise numbers do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Incidents saat steps aur chaar roles follow karte hain; evidence poore waqt likha jaata hai.</li>
<li>Paanch signals correlate karo; har ek ke blind spots hain.</li>
<li>Path aadha karo; reason codes padho; ek baar mein ek cheez fix karo.</li>
<li>Har change ka rollback aur post-checks hote hain jinme monitoring shamil hai.</li>
<li>Postmortems blameless hote hain aur owned actions par khatam hote hain.</li>
</ul></div>
`}};export{e as default};