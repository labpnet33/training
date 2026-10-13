var e={id:`the-incident-workflow`,h:{en:`The incident workflow`,hi:`Incident workflow`},body:{en:`
<h3>What you will learn</h3>
<p>Click-ops, but you understand what each click does. In this module you stop being a person who watches graphs and become a person who runs an incident: you will follow a fixed workflow, collect evidence from every signal, troubleshoot end to end, change things safely and write a blameless review. <b>Prerequisites:</b> obs-start, obs-snmp, obs-syslog, obs-flow, obs-dash and obs-alert, or equal experience. The console is the one used before (OBSERVER at 10.1.50.100, company Godavari Foods with Hyderabad, Kochi and Lucknow); some labs also open router consoles for CLI checks.</p>
<p><b>Scope:</b> all of it is simulated, with teaching-model numbers. No vendor product is named and real tools will look different.</p>

<h3>An incident is a fire drill with a method</h3>
<p>An <b>incident</b> is an unplanned event that hurts or threatens a service people depend on. Think of a fire in a building. The fire brigade does not run in and improvise. Someone raises the alarm, someone takes charge, someone talks to the residents, firefighters tackle the fire, and afterwards the team asks how it started. Network incidents work the same way. Panic is the enemy; a workflow is the cure.</p>

<h3>The seven steps</h3>
<ol>
<li><b>Detect:</b> an alert, a probe failure, a user call. Note the time, because everything else is measured from it.</li>
<li><b>Triage:</b> how big is it? Which sites, which users, which service? Assign a severity.</li>
<li><b>Communicate:</b> tell stakeholders what you know, what you do not know and when you will update next.</li>
<li><b>Mitigate:</b> stop the pain first (reroute, fail over, roll back a change), even before you understand the cause.</li>
<li><b>Fix:</b> remove the cause properly, under change control.</li>
<li><b>Verify:</b> prove with data that users and signals are back to normal.</li>
<li><b>Review:</b> a blameless postmortem and follow-up actions.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Incident workflow">
<rect x="5" y="40" width="80" height="50" rx="8" fill="#bae6fd"/><text x="45" y="70" text-anchor="middle" class="svg-ink" font-size="12">Detect</text>
<rect x="95" y="40" width="80" height="50" rx="8" fill="#bae6fd"/><text x="135" y="70" text-anchor="middle" class="svg-ink" font-size="12">Triage</text>
<rect x="185" y="40" width="90" height="50" rx="8" fill="#fde68a"/><text x="230" y="70" text-anchor="middle" class="svg-ink" font-size="12">Communicate</text>
<rect x="285" y="40" width="80" height="50" rx="8" fill="#fed7aa"/><text x="325" y="70" text-anchor="middle" class="svg-ink" font-size="12">Mitigate</text>
<rect x="375" y="40" width="70" height="50" rx="8" fill="#fed7aa"/><text x="410" y="70" text-anchor="middle" class="svg-ink" font-size="12">Fix</text>
<rect x="455" y="40" width="80" height="50" rx="8" fill="#bbf7d0"/><text x="495" y="70" text-anchor="middle" class="svg-ink" font-size="12">Verify</text>
<rect x="545" y="40" width="85" height="50" rx="8" fill="#ddd6fe"/><text x="587" y="70" text-anchor="middle" class="svg-ink" font-size="12">Review</text>
<path d="M45 90 L45 130 L587 130 L587 90" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">evidence is written down at every step</text>
</svg><p class="cap">Seven steps; evidence is collected throughout.</p></div>

<h3>Roles: who does what</h3>
<table class="cmp"><tr><th>Role</th><th>Job</th><th>Example</th></tr>
<tr><td>Incident commander</td><td>Owns the incident, decides, keeps order; does not type commands</td><td>Priya Nair</td></tr>
<tr><td>Technical lead</td><td>Investigates and proposes mitigation</td><td>Ravi Menon</td></tr>
<tr><td>Communications lead</td><td>Updates stakeholders on a schedule</td><td>Meena Iyer</td></tr>
<tr><td>Scribe</td><td>Writes the timeline and evidence as it happens</td><td>Kabir Shah</td></tr>
</table>
<p>In a small team one person may hold two roles, but the commander and the hands-on investigator should be different people for any serious incident. Otherwise nobody watches the whole picture.</p>

<h3>Evidence from the console: Live tools and the audit log</h3>
<p>The Live tools page offers <b>ping</b>, <b>traceroute</b> and <b>packet capture</b> and a data <b>query</b>. Every run is written to the audit log with who, what and when. That makes the audit log your incident notebook: later you can show exactly which checks you ran and what you saw. In lab <b>obs-ops-1</b> (incident workflow with evidence) you will walk the steps: open Overview and find the firing alert, open the target's dashboard, run a ping and a traceroute from the affected router, run a capture with a filter, then answer the "what does this change?" questions and record your conclusion.</p>
<pre class="out">Alerts and audit (excerpt)
When      Who      Action
10:02     admin    tool:ping R-KCH SRV-HYD
10:03     admin    tool:traceroute R-KCH SRV-HYD
10:05     admin    tool:capture R-KCH host 10.1.20.10 and tcp
10:11     admin    <span class="hl">apply: probes.items.0.timeoutMs = 2000</span></pre>

<div class="note"><p><b>What does this change on the wire/policy?</b> Ping and traceroute send a few small test packets from the chosen source, which you will see in flows. A capture copies packets that already flow; it does not alter them. Opening the audit log changes nothing. Only Apply changes configuration, and it is recorded.</p></div>

<h3>Communicate in a fixed shape</h3>
<p>A good update has four lines: <i>impact</i> (who is affected), <i>status</i> (what we know), <i>action</i> (what we are doing) and <i>next update</i> (a clock time). Example: "Kochi ERP is slow for about 40 users. Probe latency is 310 ms against a normal 41. We are checking the provider handoff. Next update at 10:30." Silence creates worse problems than bad news.</p>

<h3>Mitigate before you understand</h3>
<p>If a new route broke a branch, roll it back first and investigate afterwards. Mitigation should be reversible and low risk. Record what you changed, because a mitigation can itself become the next incident.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Everyone investigates and nobody communicates. (2) Changing several things at once so the cause is unknowable. (3) Declaring it fixed because the alert cleared, without verifying user experience. (4) Skipping the timeline because "we will remember".</p></div>
<div class="exam"><p><b>Exam trap.</b> Order matters: mitigate and verify come before the review. And the commander coordinates; the commander is not the person typing every command.</p></div>

<div class="scn"><h4>Kochi ERP crawls at 10 a.m.</h4><p>The latency rule paged Priya Nair. She became commander, asked Ravi to investigate, Meena to message the Kochi managers and Kabir to keep the timeline. Ravi's ping showed 310 ms, traceroute showed the delay beyond the provider handoff, and the capture showed retransmissions. They switched the ERP traffic to the backup circuit (mitigate), the provider repaired the fault later (fix), and the probe returned to 41 ms (verify).</p><p><b>Lesson:</b> roles and order turned a scramble into twenty calm minutes.</p></div>

<div class="iv"><p class="q">"Walk me through how you handle a major network incident."</p><p>Detect and note the time, triage scope and severity, name an incident commander, communicate on a schedule, mitigate first (reroute or roll back), fix under change control, verify with data and review blamelessly. Mention that you record evidence as you go.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Seven steps: detect, triage, communicate, mitigate, fix, verify, review.</li>
<li>Roles: commander, technical lead, communications lead, scribe.</li>
<li>Live tools runs go to the audit log, which is your evidence notebook.</li>
<li>Updates have impact, status, action and next-update time.</li>
<li>Stop the pain first; understand the cause second.</li>
</ul></div>
`,hi:`
<h3>Is module mein aap kya seekhoge</h3>
<p>Click-ops, but you understand what each click does. Is module mein aap graphs dekhne wale insaan se incident chalane wale insaan bante ho: aap fixed workflow follow karoge, har signal se evidence collect karoge, end to end troubleshooting karoge, changes safely karoge aur blameless review likhoge. <b>Prerequisites:</b> obs-start, obs-snmp, obs-syslog, obs-flow, obs-dash aur obs-alert, ya barabar experience. Console wahi hai jo pehle use kiya (OBSERVER 10.1.50.100 par, company Godavari Foods jiske Hyderabad, Kochi aur Lucknow hain); kuch labs CLI checks ke liye router consoles bhi kholte hain.</p>
<p><b>Scope:</b> sab simulated hai, teaching-model numbers ke saath. Kisi vendor product ka naam nahi liya, aur asli tools alag dikhenge.</p>

<h3>Incident method wala fire drill hai</h3>
<p><b>Incident</b> ek unplanned event hai jo aisi service ko hurt ya khatre mein daalta hai jis par log nirbhar hain. Building mein aag socho. Fire brigade andar ghus ke improvise nahi karti. Koi alarm bajata hai, koi charge leta hai, koi residents se baat karta hai, firefighters aag bujhate hain, aur baad mein team poochti hai ki shuru kaise hui. Network incidents bhi aise hi chalte hain. Ghabrahat dushman hai; workflow ilaaj hai.</p>

<h3>Saat steps</h3>
<ol>
<li><b>Detect:</b> alert, probe failure, user ka call. Time note karo, kyunki baaki sab usi se naapa jaata hai.</li>
<li><b>Triage:</b> kitna bada hai? Kaun se sites, kaun se users, kaun si service? Severity do.</li>
<li><b>Communicate:</b> stakeholders ko batao ki kya pata hai, kya nahi pata aur agla update kab.</li>
<li><b>Mitigate:</b> pehle dard rokho (reroute, failover, change rollback), cause samajhne se pehle bhi.</li>
<li><b>Fix:</b> cause ko sahi tareeke se hatao, change control ke tahat.</li>
<li><b>Verify:</b> data se saabit karo ki users aur signals normal hain.</li>
<li><b>Review:</b> blameless postmortem aur follow-up actions.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Incident workflow">
<rect x="5" y="40" width="80" height="50" rx="8" fill="#bae6fd"/><text x="45" y="70" text-anchor="middle" class="svg-ink" font-size="12">Detect</text>
<rect x="95" y="40" width="80" height="50" rx="8" fill="#bae6fd"/><text x="135" y="70" text-anchor="middle" class="svg-ink" font-size="12">Triage</text>
<rect x="185" y="40" width="90" height="50" rx="8" fill="#fde68a"/><text x="230" y="70" text-anchor="middle" class="svg-ink" font-size="12">Communicate</text>
<rect x="285" y="40" width="80" height="50" rx="8" fill="#fed7aa"/><text x="325" y="70" text-anchor="middle" class="svg-ink" font-size="12">Mitigate</text>
<rect x="375" y="40" width="70" height="50" rx="8" fill="#fed7aa"/><text x="410" y="70" text-anchor="middle" class="svg-ink" font-size="12">Fix</text>
<rect x="455" y="40" width="80" height="50" rx="8" fill="#bbf7d0"/><text x="495" y="70" text-anchor="middle" class="svg-ink" font-size="12">Verify</text>
<rect x="545" y="40" width="85" height="50" rx="8" fill="#ddd6fe"/><text x="587" y="70" text-anchor="middle" class="svg-ink" font-size="12">Review</text>
<path d="M45 90 L45 130 L587 130 L587 90" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">har step par evidence likha jaata hai</text>
</svg><p class="cap">Saat steps; evidence poore waqt collect hota hai.</p></div>

<h3>Roles: kaun kya karta hai</h3>
<table class="cmp"><tr><th>Role</th><th>Kaam</th><th>Example</th></tr>
<tr><td>Incident commander</td><td>Incident ka owner, decide karta hai, order rakhta hai; commands type nahi karta</td><td>Priya Nair</td></tr>
<tr><td>Technical lead</td><td>Investigate karta hai aur mitigation propose karta hai</td><td>Ravi Menon</td></tr>
<tr><td>Communications lead</td><td>Schedule par stakeholders ko update deta hai</td><td>Meena Iyer</td></tr>
<tr><td>Scribe</td><td>Timeline aur evidence tabhi likhta hai jab hota hai</td><td>Kabir Shah</td></tr>
</table>
<p>Chhoti team mein ek insaan do roles le sakta hai, lekin kisi serious incident mein commander aur hands-on investigator alag hone chahiye. Warna poori tasveer koi nahi dekhta.</p>

<h3>Console se evidence: Live tools aur audit log</h3>
<p>Live tools page <b>ping</b>, <b>traceroute</b>, <b>packet capture</b> aur data <b>query</b> deta hai. Har run audit log mein kaun, kya aur kab ke saath likha jaata hai. Isse audit log aapka incident notebook ban jaata hai: baad mein aap dikha sakte ho ki kaun se checks chalaye aur kya dekha. Lab <b>obs-ops-1</b> (evidence ke saath incident workflow) mein aap steps chalte ho: Overview kholo aur firing alert dhundo, target ka dashboard kholo, affected router se ping aur traceroute chalao, filter ke saath capture chalao, phir "yeh kya badalta hai?" sawalon ke jawab do aur apna conclusion record karo.</p>
<pre class="out">Alerts and audit (excerpt)
When      Who      Action
10:02     admin    tool:ping R-KCH SRV-HYD
10:03     admin    tool:traceroute R-KCH SRV-HYD
10:05     admin    tool:capture R-KCH host 10.1.20.10 and tcp
10:11     admin    <span class="hl">apply: probes.items.0.timeoutMs = 2000</span></pre>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Ping aur traceroute chune hue source se kuch chhote test packets bhejte hain, jo aap flows mein dekhoge. Capture un packets ki copy leta hai jo pehle se behte hain; unhe badalta nahi. Audit log kholne se kuch nahi badalta. Sirf Apply configuration badalta hai, aur woh record hota hai.</p></div>

<h3>Fixed shape mein communicate karo</h3>
<p>Achhe update mein chaar lines hoti hain: <i>impact</i> (kaun affected), <i>status</i> (kya pata hai), <i>action</i> (kya kar rahe hain) aur <i>next update</i> (clock time). Example: "Kochi ERP lagbhag 40 users ke liye slow hai. Probe latency 310 ms hai jabki normal 41. Hum provider handoff check kar rahe hain. Agla update 10:30 par." Chuppi buri khabar se zyada bigaadti hai.</p>

<h3>Samajhne se pehle mitigate karo</h3>
<p>Agar naye route ne branch tod diya, to pehle rollback karo aur baad mein investigate karo. Mitigation reversible aur kam risk wali honi chahiye. Jo badla woh record karo, kyunki mitigation khud agla incident ban sakta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Sab investigate karte hain aur koi communicate nahi karta. (2) Kai cheezein ek saath badalna ki cause pata hi na chale. (3) Alert clear hone par fixed bol dena, user experience verify kiye bina. (4) Timeline skip karna kyunki "yaad rahega".</p></div>
<div class="exam"><p><b>Exam trap.</b> Order important hai: mitigate aur verify review se pehle aate hain. Aur commander coordinate karta hai; woh har command type karne wala insaan nahi hai.</p></div>

<div class="scn"><h4>Subah 10 baje Kochi ERP rengta hai</h4><p>Latency rule ne Priya Nair ko page kiya. Woh commander bani, Ravi ko investigate karne, Meena ko Kochi managers ko message karne aur Kabir ko timeline rakhne ko kaha. Ravi ke ping ne 310 ms dikhaya, traceroute ne delay provider handoff ke baad dikhaya, aur capture ne retransmissions dikhaye. Unhone ERP traffic backup circuit par daala (mitigate), provider ne baad mein fault theek kiya (fix), aur probe 41 ms par wapas aaya (verify).</p><p><b>Seekh:</b> roles aur order ne afra-tafri ko bees shaant minute bana diya.</p></div>

<div class="iv"><p class="q">"Major network incident kaise handle karte ho?"</p><p>Detect karke time note karo, scope aur severity triage karo, incident commander naam do, schedule par communicate karo, pehle mitigate karo (reroute ya rollback), change control mein fix karo, data se verify karo aur blameless review karo. Batao ki evidence saath saath record karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Saat steps: detect, triage, communicate, mitigate, fix, verify, review.</li>
<li>Roles: commander, technical lead, communications lead, scribe.</li>
<li>Live tools runs audit log mein jaate hain, jo aapka evidence notebook hai.</li>
<li>Updates mein impact, status, action aur next-update time hota hai.</li>
<li>Pehle dard rokho; cause baad mein samjho.</li>
</ul></div>
`}};export{e as default};