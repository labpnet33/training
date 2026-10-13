var e={id:`summary-and-exam-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The whole module on one page</h3>
<p>An alert is the smoke alarm of operations: it exists to interrupt a person who can act. The craft is in making it fire for real harm, tell the right person, and stay quiet otherwise. Probes extend this by measuring the user's path with synthetic tests. Click-ops, but you understand what each click does: every field you touched changed either what is compared, how long we wait, who is told, or what test traffic is sent. None of them changed a router.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Module map">
<rect x="10" y="30" width="140" height="60" rx="10" fill="#bae6fd"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="13">Metrics + probes</text><text x="80" y="75" text-anchor="middle" class="svg-muted" font-size="12">the evidence</text>
<rect x="175" y="30" width="140" height="60" rx="10" fill="#fde68a"/><text x="245" y="55" text-anchor="middle" class="svg-ink" font-size="13">Rule</text><text x="245" y="75" text-anchor="middle" class="svg-muted" font-size="12">limit, for, dedupe</text>
<rect x="340" y="30" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="410" y="55" text-anchor="middle" class="svg-ink" font-size="13">Severity + route</text><text x="410" y="75" text-anchor="middle" class="svg-muted" font-size="12">pager or chat</text>
<rect x="505" y="30" width="125" height="60" rx="10" fill="#bbf7d0"/><text x="567" y="55" text-anchor="middle" class="svg-ink" font-size="13">Owner</text><text x="567" y="75" text-anchor="middle" class="svg-muted" font-size="12">runbook</text>
<line x1="150" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><line x1="315" y1="60" x2="340" y2="60" stroke="#64748b" stroke-width="2"/><line x1="480" y1="60" x2="505" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">tune weekly: measure, rank, change one thing, preview, Apply</text>
</svg><p class="cap">Evidence, rule, route, owner, then the tuning loop.</p></div>

<h3>Can-do checklist</h3>
<p>You are ready when you can do each of these without notes.</p>
<ul>
<li>State the three tests of a good alert: actionable, urgent, owned.</li>
<li>Explain threshold rules versus baseline rules and when to use each.</li>
<li>Build a rule with metric, target, limit, for-duration, severity, dedupe and route (lab obs-alert-1).</li>
<li>Explain for-duration, hysteresis, dedupe and grouping with one example each.</li>
<li>Explain why a route that does not carry the rule's severity delivers to none.</li>
<li>Describe on-call escalation: primary Priya Nair, secondary Ravi Menon, 15 minutes.</li>
<li>List the symptoms of alert fatigue and measure notifications and pages per week.</li>
<li>Tune the noisy rule: threshold 75, for 6, dedupe 48, severity warning, route chat (lab obs-alert-2).</li>
<li>Write the contents of a runbook.</li>
<li>Define SLI, SLO, SLA and error budget in one sentence each.</li>
<li>Choose probe type, source, destination and path for a given service (lab obs-alert-3).</li>
<li>Diagnose a probe false positive from timeout, retries, source, path and thresholds (lab obs-alert-4).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Alert</dt><dd>A notification that asks a person to act.</dd>
<dt>Severity</dt><dd>critical, warning or info; the key that picks the route.</dd>
<dt>For-duration</dt><dd>Consecutive points a condition must hold before firing; 1 point is 5 minutes in the console.</dd>
<dt>Dedupe window</dt><dd>Quiet period after a notification for the same rule and target.</dd>
<dt>Hysteresis</dt><dd>Different limits for raising and clearing, to stop flapping.</dd>
<dt>Page</dt><dd>A notification on the pager channel.</dd>
<dt>Runbook</dt><dd>Short instructions that come with an alert.</dd>
<dt>SLI, SLO, SLA</dt><dd>Measurement, internal target, external promise.</dd>
<dt>Error budget</dt><dd>The failure allowed by the SLO, for example 1 percent of 30 days.</dd>
<dt>Synthetic probe</dt><dd>A scheduled test request that measures latency, loss and jitter.</dd>
<dt>Jitter</dt><dd>Variation in delay between packets.</dd>
<dt>False positive, false negative</dt><dd>Alarm with no problem; no alarm with a problem.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>What stops repeats of one long problem?</td><td>Dedupe window</td></tr>
<tr><td>What ignores short spikes?</td><td>For-duration</td></tr>
<tr><td>Rule fired but nobody told?</td><td>Route does not carry the severity (delivery none)</td></tr>
<tr><td>First step against fatigue?</td><td>Measure and rank by volume</td></tr>
<tr><td>Probe fails but users happy?</td><td>Probe configuration: timeout, retries, source, path, threshold</td></tr>
<tr><td>Which probe shows voice quality?</td><td>udp-jitter</td></tr>
<tr><td>Should a backup probe page?</td><td>No: separate, lower-severity rule</td></tr>
</table>

<h3>Quick console reference</h3>
<pre class="out">Alert rules      Add rule, Metric, Target, Operator, Threshold, Sigma from baseline,
                 For (points, 12 = 1 hour), Severity, Dedupe window, Route
On-call routing  rota (primary, secondary, escalate after), routes (channel, contact, severities)
SLA probes       Type, Source router, Destination, Path, Interval, Timeout, Retries,
                 Latency / Loss / Jitter thresholds
Alerts and audit Firing now, notifications per week, pages, per-rule bars
<span class="hl">Apply changes</span> in the commit bar makes edits live; checks read the applied state</pre>

<div class="note"><p><b>What does this change on the wire/policy?</b> Alert rules and routing change only the console's own decisions: who is told and when. Probes add small test packets from the source router. Nothing in this module changes forwarding or security policy on a router.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting Apply; setting a critical rule to a chat route; fixing a noisy alert by deleting it; trusting a probe without checking the user path; and probing from a router the users never use.</p></div>
<div class="exam"><p><b>Exam trap.</b> Read the scenario for which part of the chain failed: signal, rule, routing, or owner. Many wrong answers fix the wrong link.</p></div>

<div class="scn"><h4>A calm week at Godavari Foods</h4><p>After tuning, the weekly review at Godavari Foods showed 14 notifications, 2 pages and both pages led to action. The probe from Kochi stayed ok except for one genuine 200 ms slow-down that the latency rule caught within 30 minutes. Kabir Shah added a runbook link to each remaining rule.</p><p><b>Lesson:</b> a quiet pager with real alerts is a sign of good design, not of no monitoring.</p></div>

<div class="iv"><p class="q">"How would you design alerting for a new branch?"</p><p>Start from the user experience: probes for the ERP and DNS from the branch router, SLO-style latency and loss limits, a few critical alerts to the pager with escalation, warnings to chat, a runbook for each, a weekly review of alert counts, and maintenance silences for planned work.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every alert must be actionable, urgent and owned.</li>
<li>For-duration, dedupe, severity and route control who is interrupted and when.</li>
<li>Tune by measuring pages per week and changing one rule at a time.</li>
<li>Probes must stand where users stand; fix probe settings before blaming the network.</li>
<li>Apply makes changes live, and a route must carry the rule's severity.</li>
</ul></div>
`,hi:`
<h3>Poora module ek page par</h3>
<p>Alert operations ka smoke alarm hai: woh us insaan ko interrupt karne ke liye hai jo action le sakta hai. Kala is mein hai ki woh asli nuksaan par fire kare, sahi insaan ko bataye, aur baaki waqt chup rahe. Probes ise aage badhate hain, synthetic tests se user ka path measure karke. Click-ops, but you understand what each click does: aapne jo bhi field chhua usne ya to badla ki kya compare hota hai, kitna wait karte hain, kise bataya jaata hai, ya kaun sa test traffic bheja jaata hai. Kisi ne bhi router nahi badla.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Module map">
<rect x="10" y="30" width="140" height="60" rx="10" fill="#bae6fd"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="13">Metrics + probes</text><text x="80" y="75" text-anchor="middle" class="svg-muted" font-size="12">saboot</text>
<rect x="175" y="30" width="140" height="60" rx="10" fill="#fde68a"/><text x="245" y="55" text-anchor="middle" class="svg-ink" font-size="13">Rule</text><text x="245" y="75" text-anchor="middle" class="svg-muted" font-size="12">limit, for, dedupe</text>
<rect x="340" y="30" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="410" y="55" text-anchor="middle" class="svg-ink" font-size="13">Severity + route</text><text x="410" y="75" text-anchor="middle" class="svg-muted" font-size="12">pager ya chat</text>
<rect x="505" y="30" width="125" height="60" rx="10" fill="#bbf7d0"/><text x="567" y="55" text-anchor="middle" class="svg-ink" font-size="13">Owner</text><text x="567" y="75" text-anchor="middle" class="svg-muted" font-size="12">runbook</text>
<line x1="150" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><line x1="315" y1="60" x2="340" y2="60" stroke="#64748b" stroke-width="2"/><line x1="480" y1="60" x2="505" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">har hafte tune: measure, rank, ek cheez badlo, preview, Apply</text>
</svg><p class="cap">Saboot, rule, route, owner, phir tuning loop.</p></div>

<h3>Can-do checklist</h3>
<p>Aap tab ready ho jab yeh sab bina notes ke kar sako.</p>
<ul>
<li>Achhe alert ke teen tests batao: actionable, urgent, owned.</li>
<li>Threshold rules aur baseline rules ka farak aur kab kaun sa use karna hai samjhao.</li>
<li>Metric, target, limit, for-duration, severity, dedupe aur route ke saath rule banao (lab obs-alert-1).</li>
<li>For-duration, hysteresis, dedupe aur grouping ko ek ek example se samjhao.</li>
<li>Samjhao ki jo route rule ki severity carry nahi karta woh none ko deliver karta hai.</li>
<li>On-call escalation batao: primary Priya Nair, secondary Ravi Menon, 15 minute.</li>
<li>Alert fatigue ke symptoms ginao aur notifications aur pages per week measure karo.</li>
<li>Noisy rule tune karo: threshold 75, for 6, dedupe 48, severity warning, route chat (lab obs-alert-2).</li>
<li>Runbook mein kya hota hai likho.</li>
<li>SLI, SLO, SLA aur error budget ko ek ek sentence mein define karo.</li>
<li>Diye gaye service ke liye probe type, source, destination aur path chuno (lab obs-alert-3).</li>
<li>Probe false positive ko timeout, retries, source, path aur thresholds se diagnose karo (lab obs-alert-4).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Alert</dt><dd>Woh notification jo insaan se action maangti hai.</dd>
<dt>Severity</dt><dd>critical, warning ya info; woh key jo route chunti hai.</dd>
<dt>For-duration</dt><dd>Fire hone se pehle condition ko kitne consecutive points rehna hai; console mein 1 point 5 minute.</dd>
<dt>Dedupe window</dt><dd>Notification ke baad same rule aur target ke liye shaanti ki avadhi.</dd>
<dt>Hysteresis</dt><dd>Raise aur clear ke liye alag limits, flapping rokne ke liye.</dd>
<dt>Page</dt><dd>Pager channel par notification.</dd>
<dt>Runbook</dt><dd>Alert ke saath aane wale chhote instructions.</dd>
<dt>SLI, SLO, SLA</dt><dd>Measurement, internal target, external promise.</dd>
<dt>Error budget</dt><dd>SLO se allowed failure, jaise 30 din ka 1 percent.</dd>
<dt>Synthetic probe</dt><dd>Scheduled test request jo latency, loss aur jitter measure karti hai.</dd>
<dt>Jitter</dt><dd>Packets ke beech delay ka variation.</dd>
<dt>False positive, false negative</dt><dd>Problem ke bina alarm; problem hote hue alarm nahi.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Sawal</th><th>Jawab</th></tr>
<tr><td>Ek lambi problem ke repeats kaun rokta hai?</td><td>Dedupe window</td></tr>
<tr><td>Chhote spikes kaun ignore karta hai?</td><td>For-duration</td></tr>
<tr><td>Rule fire hua lekin kisi ko nahi bataya?</td><td>Route severity carry nahi karta (delivery none)</td></tr>
<tr><td>Fatigue ke khilaf pehla step?</td><td>Measure karo aur volume se rank karo</td></tr>
<tr><td>Probe fail lekin users khush?</td><td>Probe configuration: timeout, retries, source, path, threshold</td></tr>
<tr><td>Voice quality kaun sa probe dikhata hai?</td><td>udp-jitter</td></tr>
<tr><td>Kya backup probe page kare?</td><td>Nahi: alag, kam-severity rule</td></tr>
</table>

<h3>Quick console reference</h3>
<pre class="out">Alert rules      Add rule, Metric, Target, Operator, Threshold, Sigma from baseline,
                 For (points, 12 = 1 hour), Severity, Dedupe window, Route
On-call routing  rota (primary, secondary, escalate after), routes (channel, contact, severities)
SLA probes       Type, Source router, Destination, Path, Interval, Timeout, Retries,
                 Latency / Loss / Jitter thresholds
Alerts and audit Firing now, notifications per week, pages, per-rule bars
<span class="hl">Apply changes</span> in the commit bar makes edits live; checks read the applied state</pre>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Alert rules aur routing sirf console ke apne decisions badalte hain: kise bataya jaata hai aur kab. Probes source router se chhote test packets jodte hain. Is module mein kuch bhi router ki forwarding ya security policy nahi badalta.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Apply bhool jaana; critical rule ko chat route par rakhna; noisy alert ko delete karke fix karna; user path check kiye bina probe par bharosa; aur aise router se probe karna jo users kabhi use nahi karte.</p></div>
<div class="exam"><p><b>Exam trap.</b> Scenario padho ki chain ka kaun sa hissa fail hua: signal, rule, routing ya owner. Kai galat options galat link fix karte hain.</p></div>

<div class="scn"><h4>Godavari Foods mein shaant hafta</h4><p>Tuning ke baad Godavari Foods ki weekly review mein 14 notifications, 2 pages dikhe aur dono pages se action hua. Kochi se probe ok raha, sirf ek asli 200 ms slow-down ko chhodkar jise latency rule ne 30 minute mein pakad liya. Kabir Shah ne baaki har rule mein runbook link joda.</p><p><b>Seekh:</b> asli alerts ke saath shaant pager achhe design ki nishani hai, monitoring na hone ki nahi.</p></div>

<div class="iv"><p class="q">"Naye branch ke liye alerting kaise design karoge?"</p><p>User experience se shuru karo: branch router se ERP aur DNS ke probes, SLO-style latency aur loss limits, pager par kuch critical alerts escalation ke saath, warnings chat par, har ek ka runbook, alert counts ki weekly review, aur planned kaam ke liye maintenance silences.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har alert actionable, urgent aur owned hona chahiye.</li>
<li>For-duration, dedupe, severity aur route control karte hain kise aur kab interrupt kiya jaata hai.</li>
<li>Pages per week measure karke tune karo aur ek baar mein ek rule badlo.</li>
<li>Probes wahan khade hone chahiye jahan users hain; network ko doshi kehne se pehle probe settings fix karo.</li>
<li>Apply changes ko live karta hai, aur route ko rule ki severity carry karni chahiye.</li>
</ul></div>
`}};export{e as default};