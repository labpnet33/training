var e={id:`from-scripts-to-toolkit`,h:{en:`What you will learn: from loose scripts to one supported tool`,hi:`Aap kya seekhoge: bikhri scripts se ek supported tool tak`},body:{en:`
<p><b>The idea of this chapter:</b> you already own the parts. You can keep an inventory in SQLite, collect configs over SSH, push a change with a safety net, write tests and run a script from cron. The capstone joins those parts into <i>one tool</i> that a whole team can run, trust and hand over. Joining is a skill of its own, and it is where most real automation projects either become useful or quietly die.</p>

<h3>What you will learn in this module</h3>
<ul>
<li>Organise a project as a <b>package</b> with one command-line entry point and one job per module.</li>
<li>Keep the inventory in SQLite and load it from a CSV file.</li>
<li>Back up many routers so that one dead router never stops the run, and record what happened to each.</li>
<li>Promote a <b>golden configuration</b> and detect <b>drift</b> with <code>difflib</code>, in both directions: added and removed lines.</li>
<li>Push a baseline with a dry run, a check and a roll back.</li>
<li>Print one report from the recorded run, test the logic with pytest, schedule it with cron and hand it over with the secrets in order.</li>
<li>Run an incident drill and fix four problems that only appear in real operations.</li>
</ul>

<h3>Prerequisites</h3>
<p>This is the last module of the track, so it leans on the earlier ones. It refers back to them and does not teach them again. Linux shell basics (files, pipes, <code>chmod</code>) are assumed too.</p>
<table class="cmp"><tr><th>Module id</th><th>What the toolkit uses from it</th></tr>
<tr><td>auto-py-basics, auto-py-data, auto-py-func</td><td>Dictionaries, loops, functions, reading and writing files, try and except</td></tr>
<tr><td>py-sqlite</td><td>An inventory in one file; parameters; <code>INSERT OR REPLACE</code></td></tr>
<tr><td>auto-git</td><td>Why code and approved configs live under version control</td></tr>
<tr><td>auto-ssh</td><td><code>nkmiko</code>: <code>ConnectHandler</code>, <code>send_command</code>, <code>send_config_set</code></td></tr>
<tr><td>py-concurrency</td><td>Optional: the toolkit loops one router at a time on purpose</td></tr>
<tr><td>py-safepush</td><td>Dry run, verify, roll back</td></tr>
<tr><td>py-tools</td><td><code>argparse</code>, logging, exit codes, cron</td></tr>
<tr><td>py-secrets</td><td><code>.env</code>, environment variables, file permissions</td></tr>
<tr><td>auto-testing, py-pytest</td><td><code>assert</code>, test files, reading a red test</td></tr>
</table>

<h3>Analogy: a workshop with labelled drawers</h3>
<p>Picture a workshop where every spanner lies loose on the bench. Each job starts with a search, and when the owner leaves nobody knows where anything is. A good workshop has <b>labelled drawers</b> and <b>one front desk</b>. You ask the desk for "backup" and the right tools come out of the right drawer. In this module <code>nettool.py</code> is the front desk and the folder <code>toolkit/</code> holds the drawers.</p>

<div class="dia"><svg viewBox="0 0 640 215" role="img" aria-label="nettool.py is the front desk; five modules are the drawers; tests, cron and secrets sit underneath">
<rect x="210" y="12" width="220" height="48" rx="10" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">nettool.py</text><text x="320" y="50" text-anchor="middle" class="svg-muted" font-size="11">front desk: one command line</text>
<rect x="10" y="100" width="120" height="52" rx="8" fill="#bae6fd"/><text x="70" y="122" text-anchor="middle" class="svg-ink" font-size="12">inventory.py</text><text x="70" y="140" text-anchor="middle" class="svg-muted" font-size="10">SQLite</text>
<rect x="135" y="100" width="120" height="52" rx="8" fill="#bbf7d0"/><text x="195" y="122" text-anchor="middle" class="svg-ink" font-size="12">collect.py</text><text x="195" y="140" text-anchor="middle" class="svg-muted" font-size="10">SSH backup</text>
<rect x="260" y="100" width="120" height="52" rx="8" fill="#ddd6fe"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="12">drift.py</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="10">difflib</text>
<rect x="385" y="100" width="120" height="52" rx="8" fill="#fed7aa"/><text x="445" y="122" text-anchor="middle" class="svg-ink" font-size="12">push.py</text><text x="445" y="140" text-anchor="middle" class="svg-muted" font-size="10">safe push</text>
<rect x="510" y="100" width="120" height="52" rx="8" fill="#bae6fd"/><text x="570" y="122" text-anchor="middle" class="svg-ink" font-size="12">report.py</text><text x="570" y="140" text-anchor="middle" class="svg-muted" font-size="10">one table</text>
<line x1="320" y1="60" x2="70" y2="100" stroke="#64748b" stroke-width="2"/><line x1="320" y1="60" x2="195" y2="100" stroke="#64748b" stroke-width="2"/><line x1="320" y1="60" x2="320" y2="100" stroke="#64748b" stroke-width="2"/><line x1="320" y1="60" x2="445" y2="100" stroke="#64748b" stroke-width="2"/><line x1="320" y1="60" x2="570" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="172" width="620" height="30" rx="8" fill="#e2e8f0"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="12">pytest tests · cron + log file · .env with chmod 600</text>
</svg><p class="cap">One front desk, five drawers, and the habits that keep it trustworthy.</p></div>

<h3>The big picture: nine actions, five drawers</h3>
<table class="cmp"><tr><th>Action</th><th>Drawer</th><th>Comes from</th></tr>
<tr><td><code>init</code>, <code>add</code>, <code>load</code>, <code>list</code></td><td>inventory.py</td><td>py-sqlite</td></tr>
<tr><td><code>backup</code></td><td>collect.py</td><td>auto-ssh, py-tools</td></tr>
<tr><td><code>golden</code>, <code>drift</code></td><td>drift.py</td><td>new: <code>difflib</code></td></tr>
<tr><td><code>push</code></td><td>push.py</td><td>py-safepush</td></tr>
<tr><td><code>report</code></td><td>report.py</td><td>new: <code>tabulate</code></td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Kaveri Foods runs ten loose scripts written by four people. On Monday a router is replaced and nobody knows whether last night's backup worked, which script to run, or which password file to use. The capstone turns this into one command, <code>python3 nettool.py report</code>, that prints every router, its backup state and its drift, and one place, <code>~/netkit</code>, that holds everything.</p></div>

<h3>The two labs</h3>
<p><b>Lab 1</b> assembles the toolkit on <code>AUTO01</code> (user <code>netadmin</code>) in the folder <code>~/netkit</code>. One piece, the drift logic, is missing; you write it, then back up <code>R1</code>, <code>R2</code> and <code>R3</code> (R3 is down on purpose), change R2 and catch the change. <b>Lab 2</b> is an incident drill on a toolkit that someone handed over: it looks fine and has four hidden problems.</p>

<h3>Three rules that return in every chapter</h3>
<ul>
<li><b>One job per module.</b> You can test drift.py without a router.</li>
<li><b>One failure never stops the run, and is never hidden.</b> Catch it, record it, carry on.</li>
<li><b>Truth comes from a recorded run</b>, not from files that happen to be lying around.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Treating the capstone as new theory instead of joining known parts. Adding features before backup and drift work. Skipping the tests because "it runs". Testing only on the happy path, where every router answers.</p></div>
<div class="exam"><p><b>Exam trap.</b> Interviewers often ask "what did you build?" A list of libraries is a weak answer. A strong one names the problem, the actions, the failure handling and how it is run and handed over.</p></div>

<div class="scn"><h4>The script that only its author could run</h4><p>A team inherited a backup script with a hard-coded folder, a password inside the code and no list of routers. It worked for its author and for nobody else. Rebuilding it as a small tool with an inventory, a <code>--help</code>, a log and tests took one sprint, and the next engineer ran it on day one.</p><p><b>Lesson:</b> a tool is a script plus an inventory, tests, a schedule and a hand-over.</p></div>

<div class="iv"><p class="q">"Tell me about a project you built."</p><p>I built a network toolkit: an SQLite inventory, a backup that records unreachable routers and keeps going, a golden configuration with drift detection in both directions, a safe push with dry run and roll back, one report, pytest tests, a cron job and a hand-over check for secrets. I can explain each failure it was designed to survive.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The capstone joins parts you know into one tool: front desk plus drawers.</li>
<li>Prerequisites are the earlier modules, from py-sqlite and auto-ssh to py-tools and py-pytest.</li>
<li>Nine actions are served by five small modules.</li>
<li>Rules: one job per module, record every failure, trust only recorded runs.</li>
<li>Lab 1 assembles the toolkit; Lab 2 is the incident drill.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> parts aapke paas pehle se hain. Aap SQLite mein inventory rakh sakte ho, SSH se configs collect kar sakte ho, safety net ke saath change push kar sakte ho, tests likh sakte ho aur cron se script chala sakte ho. Capstone in parts ko <i>ek tool</i> mein jodta hai jise poori team chala sake, us par bharosa kar sake aur handover kar sake. Jodna khud ek skill hai, aur yahin zyadatar real automation projects ya to kaam ke ban jaate hain ya chupchaap mar jaate hain.</p>

<h3>Is module mein aap kya seekhoge</h3>
<ul>
<li>Project ko <b>package</b> ki tarah sajaana: ek command-line entry point aur har module ka ek kaam.</li>
<li>Inventory SQLite mein rakhna aur CSV file se load karna.</li>
<li>Kai routers ka backup aise lena ki ek dead router run na roke, aur har router ka kya hua yeh record ho.</li>
<li><b>Golden configuration</b> promote karna aur <code>difflib</code> se <b>drift</b> pakadna, dono directions mein: jodi gayi aur hatayi gayi lines.</li>
<li>Baseline ko dry run, check aur roll back ke saath push karna.</li>
<li>Recorded run se ek report banana, pytest se logic test karna, cron se schedule karna aur secrets theek rakhkar handover karna.</li>
<li>Incident drill karna aur chaar aisi problems theek karna jo sirf real operations mein dikhti hain.</li>
</ul>

<h3>Prerequisites</h3>
<p>Yeh track ka aakhri module hai, isliye pichhle modules par tika hai. Yeh unhe wapas refer karta hai, dobara nahi sikhata. Linux shell basics (files, pipes, <code>chmod</code>) bhi maan liye gaye hain.</p>
<table class="cmp"><tr><th>Module id</th><th>Toolkit isse kya use karta hai</th></tr>
<tr><td>auto-py-basics, auto-py-data, auto-py-func</td><td>Dictionaries, loops, functions, files padhna-likhna, try aur except</td></tr>
<tr><td>py-sqlite</td><td>Ek file mein inventory; parameters; <code>INSERT OR REPLACE</code></td></tr>
<tr><td>auto-git</td><td>Code aur approved configs version control mein kyon rehte hain</td></tr>
<tr><td>auto-ssh</td><td><code>nkmiko</code>: <code>ConnectHandler</code>, <code>send_command</code>, <code>send_config_set</code></td></tr>
<tr><td>py-concurrency</td><td>Optional: toolkit jaan-boojhkar ek router ek baar mein chalata hai</td></tr>
<tr><td>py-safepush</td><td>Dry run, verify, roll back</td></tr>
<tr><td>py-tools</td><td><code>argparse</code>, logging, exit codes, cron</td></tr>
<tr><td>py-secrets</td><td><code>.env</code>, environment variables, file permissions</td></tr>
<tr><td>auto-testing, py-pytest</td><td><code>assert</code>, test files, red test padhna</td></tr>
</table>

<h3>Analogy: labelled drawers wali workshop</h3>
<p>Ek workshop sochiye jisme har spanner bench par khula padha hai. Har kaam dhoondhne se shuru hota hai, aur malik chala jaye to kisi ko pata nahi kya kahan hai. Achhi workshop mein <b>labelled drawers</b> aur <b>ek front desk</b> hota hai. Aap desk se "backup" maangte ho aur sahi drawer se sahi tool nikalta hai. Is module mein <code>nettool.py</code> front desk hai aur <code>toolkit/</code> folder mein drawers hain.</p>

<div class="dia"><svg viewBox="0 0 640 215" role="img" aria-label="nettool.py front desk hai; paanch modules drawers hain; tests, cron aur secrets neeche hain">
<rect x="210" y="12" width="220" height="48" rx="10" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">nettool.py</text><text x="320" y="50" text-anchor="middle" class="svg-muted" font-size="11">front desk: ek command line</text>
<rect x="10" y="100" width="120" height="52" rx="8" fill="#bae6fd"/><text x="70" y="122" text-anchor="middle" class="svg-ink" font-size="12">inventory.py</text><text x="70" y="140" text-anchor="middle" class="svg-muted" font-size="10">SQLite</text>
<rect x="135" y="100" width="120" height="52" rx="8" fill="#bbf7d0"/><text x="195" y="122" text-anchor="middle" class="svg-ink" font-size="12">collect.py</text><text x="195" y="140" text-anchor="middle" class="svg-muted" font-size="10">SSH backup</text>
<rect x="260" y="100" width="120" height="52" rx="8" fill="#ddd6fe"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="12">drift.py</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="10">difflib</text>
<rect x="385" y="100" width="120" height="52" rx="8" fill="#fed7aa"/><text x="445" y="122" text-anchor="middle" class="svg-ink" font-size="12">push.py</text><text x="445" y="140" text-anchor="middle" class="svg-muted" font-size="10">safe push</text>
<rect x="510" y="100" width="120" height="52" rx="8" fill="#bae6fd"/><text x="570" y="122" text-anchor="middle" class="svg-ink" font-size="12">report.py</text><text x="570" y="140" text-anchor="middle" class="svg-muted" font-size="10">ek table</text>
<line x1="320" y1="60" x2="70" y2="100" stroke="#64748b" stroke-width="2"/><line x1="320" y1="60" x2="195" y2="100" stroke="#64748b" stroke-width="2"/><line x1="320" y1="60" x2="320" y2="100" stroke="#64748b" stroke-width="2"/><line x1="320" y1="60" x2="445" y2="100" stroke="#64748b" stroke-width="2"/><line x1="320" y1="60" x2="570" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="172" width="620" height="30" rx="8" fill="#e2e8f0"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="12">pytest tests · cron + log file · .env with chmod 600</text>
</svg><p class="cap">Ek front desk, paanch drawers, aur woh aadatein jo tool ko bharosemand rakhti hain.</p></div>

<h3>Big picture: nau actions, paanch drawers</h3>
<table class="cmp"><tr><th>Action</th><th>Drawer</th><th>Kahan se aaya</th></tr>
<tr><td><code>init</code>, <code>add</code>, <code>load</code>, <code>list</code></td><td>inventory.py</td><td>py-sqlite</td></tr>
<tr><td><code>backup</code></td><td>collect.py</td><td>auto-ssh, py-tools</td></tr>
<tr><td><code>golden</code>, <code>drift</code></td><td>drift.py</td><td>naya: <code>difflib</code></td></tr>
<tr><td><code>push</code></td><td>push.py</td><td>py-safepush</td></tr>
<tr><td><code>report</code></td><td>report.py</td><td>naya: <code>tabulate</code></td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Kaveri Foods mein chaar logon ki likhi dus alag scripts chalti hain. Somvaar ko ek router badla jaata hai aur kisi ko nahi pata ki kal raat ka backup chala ya nahi, kaunsi script chalani hai, ya kaunsi password file use karni hai. Capstone ise ek command, <code>python3 nettool.py report</code>, mein badal deta hai jo har router, uska backup state aur drift print karti hai, aur ek jagah, <code>~/netkit</code>, jahan sab kuch rehta hai.</p></div>

<h3>Do labs</h3>
<p><b>Lab 1</b> <code>AUTO01</code> (user <code>netadmin</code>) par <code>~/netkit</code> folder mein toolkit assemble karta hai. Ek hissa, drift logic, missing hai; use aap likhte ho, phir <code>R1</code>, <code>R2</code> aur <code>R3</code> ka backup lete ho (R3 jaan-boojhkar down hai), R2 badalte ho aur change pakadte ho. <b>Lab 2</b> ek handover hue toolkit par incident drill hai: woh theek dikhta hai aur usme chaar chhipi problems hain.</p>

<h3>Teen rules jo har chapter mein wapas aate hain</h3>
<ul>
<li><b>Ek module, ek kaam.</b> Aap drift.py ko router ke bina test kar sakte ho.</li>
<li><b>Ek failure run nahi rokti, aur kabhi chhupti nahi.</b> Pakdo, record karo, aage badho.</li>
<li><b>Sach recorded run se aata hai</b>, un files se nahi jo yunhi padi hain.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Capstone ko naya theory samajhna, jabki yeh jaane-pehchane parts ko jodna hai. Backup aur drift chalne se pehle features jodna. "Chalta to hai" keh kar tests skip karna. Sirf happy path test karna jahan har router jawab deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Interviewer aksar poochte hain "aapne kya banaya?". Libraries ki list kamzor jawab hai. Mazboot jawab problem, actions, failure handling aur yeh kaise chalta aur handover hota hai, yeh batata hai.</p></div>

<div class="scn"><h4>Woh script jo sirf uska author chala sakta tha</h4><p>Ek team ko ek backup script mili jisme folder hard-coded tha, password code ke andar tha aur routers ki koi list nahi thi. Woh author ke liye chalti thi, kisi aur ke liye nahi. Ise inventory, <code>--help</code>, log aur tests wale chhote tool mein dobara banane mein ek sprint laga, aur agla engineer pehle din hi ise chala paya.</p><p><b>Lesson:</b> tool matlab script plus inventory, tests, schedule aur handover.</p></div>

<div class="iv"><p class="q">"Mujhe apne ek project ke baare mein batao."</p><p>Maine ek network toolkit banaya: SQLite inventory, aisa backup jo unreachable routers record karke aage badhta hai, dono directions mein drift detection wali golden configuration, dry run aur roll back wala safe push, ek report, pytest tests, ek cron job aur secrets ke liye handover check. Main har us failure ko explain kar sakta hoon jise survive karne ke liye yeh design hua.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Capstone jaane-pehchane parts ko ek tool mein jodta hai: front desk plus drawers.</li>
<li>Prerequisites pichhle modules hain, py-sqlite aur auto-ssh se py-tools aur py-pytest tak.</li>
<li>Nau actions paanch chhote modules se chalte hain.</li>
<li>Rules: ek module ek kaam, har failure record karo, sirf recorded runs par bharosa karo.</li>
<li>Lab 1 toolkit assemble karta hai; Lab 2 incident drill hai.</li>
</ul></div>
`}};export{e as default};