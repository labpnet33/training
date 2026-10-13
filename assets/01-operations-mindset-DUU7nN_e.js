var e={id:`ops-mindset`,h:{en:`The operations mindset: monitor, detect, triage, fix, verify, document`,hi:`Operations mindset: monitor, detect, triage, fix, verify, document`},body:{en:`
<p><b>What you will learn in this module.</b> Building an SD-WAN is the first half of the job. The second half is keeping it healthy every day and calmly fixing it when something breaks. In this module you will learn what to monitor in a Versa SD-WAN, how to read the evidence, how to troubleshoot in layers, how to handle a carrier outage and silent telemetry, how redundancy and change control protect you, and how to close an incident with a proper report. You will finish with three hands-on incidents: <b>vs-circuit-outage</b> (the Delhi Internet carrier is down), <b>vs-log-silence</b> (Delhi logs stopped reaching Analytics) and the capstone <b>vs-capstone-incident</b> (Bengaluru is isolated after a rushed change).</p>
<p><b>Prerequisites.</b> You should have finished the earlier Versa modules: underlay and overlay basics, the headend (Director, Controller, Analytics), onboarding with templates, LAN routing and tenants, and SLA profiles with forwarding profiles. We refer back to them but do not re-teach them.</p>

<h3>Start with an analogy: the hospital emergency ward</h3>
<p>A good hospital does not wait for patients to shout. Monitors beep, nurses triage (who is critical, who can wait), doctors treat, the nurse checks the patient again, and everything goes into the patient file so the next shift knows what happened. Operations in SD-WAN works the same way. Dashboards and alarms are the monitors. The engineer is the triage nurse. The fix is the treatment. The verification is the re-check. The incident report is the file.</p>

<h3>The six steps of an operations loop</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Operations loop">
<rect x="10" y="50" width="88" height="56" rx="8" fill="#bae6fd"/><text x="54" y="82" text-anchor="middle" class="svg-ink" font-size="13">Monitor</text>
<rect x="116" y="50" width="88" height="56" rx="8" fill="#bae6fd"/><text x="160" y="82" text-anchor="middle" class="svg-ink" font-size="13">Detect</text>
<rect x="222" y="50" width="88" height="56" rx="8" fill="#ddd6fe"/><text x="266" y="82" text-anchor="middle" class="svg-ink" font-size="13">Triage</text>
<rect x="328" y="50" width="88" height="56" rx="8" fill="#fde68a"/><text x="372" y="82" text-anchor="middle" class="svg-ink" font-size="13">Fix</text>
<rect x="434" y="50" width="88" height="56" rx="8" fill="#bbf7d0"/><text x="478" y="82" text-anchor="middle" class="svg-ink" font-size="13">Verify</text>
<rect x="540" y="50" width="90" height="56" rx="8" fill="#e2e8f0"/><text x="585" y="82" text-anchor="middle" class="svg-ink" font-size="13">Document</text>
<line x1="98" y1="78" x2="116" y2="78" stroke="#64748b" stroke-width="2"/><line x1="204" y1="78" x2="222" y2="78" stroke="#64748b" stroke-width="2"/><line x1="310" y1="78" x2="328" y2="78" stroke="#64748b" stroke-width="2"/><line x1="416" y1="78" x2="434" y2="78" stroke="#64748b" stroke-width="2"/><line x1="522" y1="78" x2="540" y2="78" stroke="#64748b" stroke-width="2"/>
<path d="M585 106 L585 140 L54 140 L54 106" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="320" y="158" text-anchor="middle" class="svg-muted" font-size="12">lessons learned feed better monitoring</text>
<text x="320" y="28" text-anchor="middle" class="svg-accent" font-size="13">Every incident walks the same loop</text>
</svg><p class="cap">The loop is the same for a fibre cut, a typo or a silent log feed. Skipping Verify or Document is the most common failure.</p></div>
<dl class="terms">
<dt>Monitor</dt><dd>Collect state and measurements continuously: tunnel state, SLA metrics, utilisation, device health, log flow.</dd>
<dt>Detect</dt><dd>An alarm, a dashboard change or a user complaint tells you something is different from normal.</dd>
<dt>Triage</dt><dd>Decide scope and urgency: one site or many, one application or all, revenue-impacting or cosmetic. Triage decides who is woken up.</dd>
<dt>Fix</dt><dd>Apply the <b>smallest change</b> that removes the cause. Do not "improve" other things during an incident.</dd>
<dt>Verify</dt><dd>Prove with a fresh test that the service works, and that nothing else broke, including the things that must stay blocked.</dd>
<dt>Document</dt><dd>Record evidence, cause, fix and follow-ups so the next engineer does not start from zero.</dd>
</dl>

<h3>Evidence beats opinion</h3>
<p>New engineers often start with a guess ("it must be the carrier") and then look for proof. Experienced engineers do the opposite: they collect observations, separate <b>what was recorded</b> from <b>what they infer</b>, and only then name a cause. An observation has a source, a device, a time and a value: "At 10:42 on Branch1, <code>show orgs org Acme sd-wan brief</code> shows Internet tunnel down, reason circuit down (provider fault)". An inference is "so the carrier has a fault". Both are useful, but only the first can be handed to a carrier.</p>

<div class="eg"><p><b>Worked example.</b> A manager says "Delhi is slow". You ask three scoping questions: which application, since when, which users? The answer is "voice calls, since 10:40, all Delhi users". Now the scope is: one site, one application class, started at a known time. You check Branch1 tunnels first (site level), then the voice policy result (application level). In two commands you know whether the transport changed. Without scoping you would have scrolled through twenty screens.</p></div>

<h3>Know your two kinds of tools</h3>
<p>You will use <b>state tools</b> (CLI show commands on the device, which tell you what is true now) and <b>history tools</b> (Analytics dashboards and logs, which tell you what happened over time). State tools answer "is it broken now?". History tools answer "since when, how often, how bad?". A good incident uses both: current state proves the problem exists, history proves when it began and links it to a change or a carrier event.</p>

<div class="note"><p><b>About the course CLI.</b> In this course the branches, Controller, Director and Analytics are simulated with a simplified CLI. The commands look like the public Versa documentation style (<code>show orgs org Acme sd-wan brief</code>, <code>show bgp neighbor brief</code>), but the real Versa Operating System (VOS), the Director GUI and Analytics are much larger. We say so whenever a command is a course helper. Practise the thinking here, then repeat it on real equipment.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing several things at once so you cannot tell which one fixed it; fixing without verifying; closing the ticket without checking what must remain blocked; leaving no notes.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions may offer "restart the device" or "rebuild the template" as the first action. Operations exams reward the evidence-first, smallest-change answer.</p></div>

<div class="scn"><h4>"The WAN is down" at 9 am Monday</h4><p>A branch manager phones: everything is down. The engineer asks which application, and learns email works but a cloud application times out. Instead of rebooting the CPE she opens the tunnel table, sees all tunnels up, then checks the path decision for that application and finds a rule pointing to a transport with high loss. A one-line forwarding profile change fixed it. Rebooting would have cost the site ten minutes of downtime and fixed nothing.</p><p><b>Lesson:</b> scope first, evidence second, smallest change third.</p></div>

<div class="iv"><p class="q">"Walk me through how you handle an incident."</p><p>Name the loop: detect, scope and triage, collect evidence from state and history tools, form one hypothesis per layer, apply the smallest change, verify with a fresh test including what must stay blocked, then document. Mention that you never guess before you have evidence.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Operations is a loop: monitor, detect, triage, fix, verify, document.</li>
<li>Scope the problem before touching anything.</li>
<li>Separate recorded observations from inferred causes.</li>
<li>State tools show now; history tools show over time; use both.</li>
<li>The course CLI is a simplified model of real VOS.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> SD-WAN banana kaam ka pehla half hai. Doosra half hai use roz healthy rakhna aur kuch toot jaye to shaanti se fix karna. Is module mein aap seekhoge ki Versa SD-WAN mein kya monitor karna hai, evidence kaise padhna hai, layers mein troubleshooting kaise karni hai, carrier outage aur silent telemetry ko kaise handle karna hai, redundancy aur change control aapko kaise bachate hain, aur incident ko proper report ke saath kaise close karna hai. Aakhir mein teen hands-on incidents honge: <b>vs-circuit-outage</b> (Delhi Internet carrier down hai), <b>vs-log-silence</b> (Delhi ke logs Analytics tak nahi pahunch rahe) aur capstone <b>vs-capstone-incident</b> (rushed change ke baad Bengaluru isolate hai).</p>
<p><b>Prerequisites.</b> Pichhle Versa modules complete hone chahiye: underlay aur overlay basics, headend (Director, Controller, Analytics), templates ke saath onboarding, LAN routing aur tenants, aur SLA profiles ke saath forwarding profiles. Hum unka reference dete hain, dobara depth mein nahi padhate.</p>

<h3>Analogy se shuru karein: hospital ka emergency ward</h3>
<p>Achha hospital patient ke chillane ka wait nahi karta. Monitors beep karte hain, nurse triage karti hai (kaun critical hai, kaun wait kar sakta hai), doctor treatment karta hai, nurse dobara check karti hai, aur sab kuch patient file mein likha jata hai taaki next shift ko pata ho kya hua. SD-WAN operations bilkul aise hi chalte hain. Dashboards aur alarms monitors hain. Engineer triage nurse hai. Fix treatment hai. Verification re-check hai. Incident report file hai.</p>

<h3>Operations loop ke chhe steps</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Operations loop">
<rect x="10" y="50" width="88" height="56" rx="8" fill="#bae6fd"/><text x="54" y="82" text-anchor="middle" class="svg-ink" font-size="13">Monitor</text>
<rect x="116" y="50" width="88" height="56" rx="8" fill="#bae6fd"/><text x="160" y="82" text-anchor="middle" class="svg-ink" font-size="13">Detect</text>
<rect x="222" y="50" width="88" height="56" rx="8" fill="#ddd6fe"/><text x="266" y="82" text-anchor="middle" class="svg-ink" font-size="13">Triage</text>
<rect x="328" y="50" width="88" height="56" rx="8" fill="#fde68a"/><text x="372" y="82" text-anchor="middle" class="svg-ink" font-size="13">Fix</text>
<rect x="434" y="50" width="88" height="56" rx="8" fill="#bbf7d0"/><text x="478" y="82" text-anchor="middle" class="svg-ink" font-size="13">Verify</text>
<rect x="540" y="50" width="90" height="56" rx="8" fill="#e2e8f0"/><text x="585" y="82" text-anchor="middle" class="svg-ink" font-size="13">Document</text>
<line x1="98" y1="78" x2="116" y2="78" stroke="#64748b" stroke-width="2"/><line x1="204" y1="78" x2="222" y2="78" stroke="#64748b" stroke-width="2"/><line x1="310" y1="78" x2="328" y2="78" stroke="#64748b" stroke-width="2"/><line x1="416" y1="78" x2="434" y2="78" stroke="#64748b" stroke-width="2"/><line x1="522" y1="78" x2="540" y2="78" stroke="#64748b" stroke-width="2"/>
<path d="M585 106 L585 140 L54 140 L54 106" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="320" y="158" text-anchor="middle" class="svg-muted" font-size="12">lessons learned se monitoring behtar hoti hai</text>
<text x="320" y="28" text-anchor="middle" class="svg-accent" font-size="13">Har incident same loop chalta hai</text>
</svg><p class="cap">Fibre cut ho, typo ho ya silent log feed, loop same hai. Verify ya Document skip karna sabse common galti hai.</p></div>
<dl class="terms">
<dt>Monitor</dt><dd>State aur measurements continuously collect karo: tunnel state, SLA metrics, utilisation, device health, log flow.</dd>
<dt>Detect</dt><dd>Koi alarm, dashboard change ya user complaint batata hai ki kuch normal se alag hai.</dd>
<dt>Triage</dt><dd>Scope aur urgency decide karo: ek site ya kai, ek application ya sab, revenue par asar ya sirf cosmetic. Triage decide karta hai kise jagana hai.</dd>
<dt>Fix</dt><dd>Wo <b>sabse chhota change</b> lagao jo cause hata de. Incident ke beech mein doosri cheezon ko "improve" mat karo.</dd>
<dt>Verify</dt><dd>Fresh test se prove karo ki service chal rahi hai aur kuch aur nahi toota, unme bhi jo blocked rehna chahiye.</dd>
<dt>Document</dt><dd>Evidence, cause, fix aur follow-ups likho taaki agla engineer zero se shuru na kare.</dd>
</dl>

<h3>Evidence opinion se bada hai</h3>
<p>Naye engineers aksar guess se shuru karte hain ("carrier ka issue hoga") aur phir proof dhundhte hain. Experienced engineers ulta karte hain: observations collect karte hain, <b>jo record hua</b> aur <b>jo infer kiya</b> use alag rakhte hain, aur tabhi cause ka naam lete hain. Observation ka source, device, time aur value hota hai: "10:42 par Branch1 par <code>show orgs org Acme sd-wan brief</code> mein Internet tunnel down hai, reason circuit down (provider fault)". Inference hai "to carrier mein fault hai". Dono kaam ke hain, lekin carrier ko sirf pehla diya ja sakta hai.</p>

<div class="eg"><p><b>Worked example.</b> Manager kehta hai "Delhi slow hai". Aap teen scoping sawal puchte ho: kaunsi application, kab se, kaun se users? Jawab: "voice calls, 10:40 se, saare Delhi users". Ab scope hai: ek site, ek application class, known start time. Pehle Branch1 tunnels check karo (site level), phir voice policy result (application level). Do commands mein pata chal jata hai ki transport badla ya nahi. Scoping ke bina aap bees screens scroll karte.</p></div>

<h3>Do tarah ke tools pehchano</h3>
<p>Aap <b>state tools</b> use karoge (device par CLI show commands, jo batate hain abhi kya sach hai) aur <b>history tools</b> (Analytics dashboards aur logs, jo time ke saath kya hua batate hain). State tools jawab dete hain "abhi toota hai?". History tools jawab dete hain "kab se, kitni baar, kitna bura?". Achha incident dono use karta hai: current state problem exist karti hai ye prove karti hai, history batati hai kab shuru hui aur use change ya carrier event se jodti hai.</p>

<div class="note"><p><b>Course CLI ke bare mein.</b> Is course mein branches, Controller, Director aur Analytics simplified CLI se simulate hain. Commands public Versa documentation style jaise dikhte hain (<code>show orgs org Acme sd-wan brief</code>, <code>show bgp neighbor brief</code>), lekin real Versa Operating System (VOS), Director GUI aur Analytics bahut bade hain. Jahan command course helper hai wahan hum bata dete hain. Soch yahan practise karo, phir real equipment par repeat karo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Ek saath kai cheezein badalna taaki pata na chale kisne fix kiya; bina verify kiye fix karna; ye check kiye bina ticket close karna ki kya blocked rehna chahiye; koi notes na chhodna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions pehle action ke roop mein "device restart karo" ya "template rebuild karo" offer kar sakte hain. Operations exams evidence-first, smallest-change jawab ko reward karte hain.</p></div>

<div class="scn"><h4>Monday subah 9 baje "WAN down hai"</h4><p>Branch manager phone karta hai: sab kuch down hai. Engineer puchti hai kaunsi application, to pata chalta hai email chal raha hai lekin ek cloud application time out ho rahi hai. CPE reboot karne ke bajay wo tunnel table kholti hai, saare tunnels up dekhti hai, phir us application ka path decision check karti hai aur ek rule ko high-loss transport ki taraf point karta paati hai. Forwarding profile ka ek-line change fix kar gaya. Reboot site ko das minute downtime deta aur kuch fix nahi karta.</p><p><b>Lesson:</b> pehle scope, phir evidence, phir smallest change.</p></div>

<div class="iv"><p class="q">"Incident ko aap kaise handle karte ho, mujhe walk through karao."</p><p>Loop ka naam lo: detect, scope aur triage, state aur history tools se evidence, har layer par ek hypothesis, smallest change, fresh test se verify (jo blocked rehna chahiye wo bhi), phir document. Batao ki evidence se pehle aap kabhi guess nahi karte.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Operations ek loop hai: monitor, detect, triage, fix, verify, document.</li>
<li>Kuch chhedne se pehle problem ka scope nikalo.</li>
<li>Recorded observations ko inferred causes se alag rakho.</li>
<li>State tools abhi dikhate hain; history tools time ke saath; dono use karo.</li>
<li>Course CLI real VOS ka simplified model hai.</li>
</ul></div>
`}};export{e as default};