var e={id:`run-for-real`,h:{en:`Running it for real: cron, logs, secrets and hand-over`,hi:`Asli duniya mein chalana: cron, logs, secrets aur handover`},body:{en:`
<p><b>The idea of this chapter:</b> a tool that nobody runs is a hobby, and a tool that is run by hand is only as reliable as the person's memory. This chapter turns the toolkit into something that runs every night, leaves evidence, keeps its secrets and can be handed to a colleague. The pieces are all from <code>py-tools</code> and <code>py-secrets</code>; the work is putting them in the right order.</p>

<h3>Analogy: the night watchman's rounds</h3>
<p>A watchman walks the same route at the same time, writes in the same logbook, and carries one key that is not hung on the wall. Cron is the clock, the log file is the logbook, and <code>.env</code> is the key.</p>

<h3>The cron job</h3>
<pre class="code">echo "0 2 * * * cd /home/netadmin/netkit &amp;&amp; python3 nettool.py backup &gt;&gt; /home/netadmin/netkit.log 2&gt;&amp;1" | crontab -</pre>
<pre class="out">AUTO01$ crontab -l
0 2 * * * cd /home/netadmin/netkit &amp;&amp; python3 nettool.py backup &gt;&gt; /home/netadmin/netkit.log 2&gt;&amp;1</pre>
<ul>
<li><code>0 2 * * *</code> means minute 0, hour 2, every day, every month, every weekday: 02:00 each night.</li>
<li><code>cd /home/netadmin/netkit &amp;&amp;</code> comes first and is the most important part. <b>Cron starts jobs in the home folder.</b> The tool keeps <code>inventory.db</code>, <code>backups/</code>, <code>golden/</code> and <code>status.json</code> in the <i>current</i> folder (chapter 2, rule 2), so without the <code>cd</code> it would work on a different, empty set of files. The <code>&amp;&amp;</code> means: run the next command only if the <code>cd</code> worked.</li>
<li><code>&gt;&gt; /home/netadmin/netkit.log</code> appends the output to a log with an absolute path.</li>
<li><code>2&gt;&amp;1</code> sends error messages to the same place, so a crash is in the log too.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="At 02:00 cron moves into the project folder, runs the backup, which writes backups, status.json and the log">
<rect x="10" y="30" width="110" height="50" rx="8" fill="#fde68a"/><text x="65" y="52" text-anchor="middle" class="svg-ink" font-size="12">cron 02:00</text><text x="65" y="68" text-anchor="middle" class="svg-muted" font-size="10">starts in home</text>
<rect x="150" y="30" width="110" height="50" rx="8" fill="#bae6fd"/><text x="205" y="52" text-anchor="middle" class="svg-ink" font-size="12">cd netkit</text><text x="205" y="68" text-anchor="middle" class="svg-muted" font-size="10">right folder</text>
<rect x="290" y="30" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="350" y="52" text-anchor="middle" class="svg-ink" font-size="12">nettool backup</text><text x="350" y="68" text-anchor="middle" class="svg-muted" font-size="10">reads .env</text>
<rect x="440" y="12" width="190" height="40" rx="8" fill="#ddd6fe"/><text x="535" y="36" text-anchor="middle" class="svg-ink" font-size="12">backups/ + status.json</text>
<rect x="440" y="62" width="190" height="40" rx="8" fill="#e2e8f0"/><text x="535" y="86" text-anchor="middle" class="svg-ink" font-size="12">netkit.log (append)</text>
<line x1="120" y1="55" x2="150" y2="55" stroke="#64748b" stroke-width="2"/><line x1="260" y1="55" x2="290" y2="55" stroke="#64748b" stroke-width="2"/><line x1="410" y1="45" x2="440" y2="32" stroke="#64748b" stroke-width="2"/><line x1="410" y1="65" x2="440" y2="82" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The cd is the step that makes the rest of the job find its files.</p></div>
<p>In the morning the logbook is the first thing to read. Each night appends the same four-line block:</p>
<pre class="out">AUTO01$ tail -4 /home/netadmin/netkit.log
R1: ok
R2: ok
R3: unreachable
ok: 2, unreachable: 1</pre>

<h3>Secrets: .env, permissions and .gitignore</h3>
<p>The router user and password live in <code>.env</code>, never in code, never in the log. Two things protect that file: permissions and version control. First make the file readable by its owner only, then tell Git to ignore it. A new file is usually world-readable:</p>
<pre class="out">AUTO01$ ls -l .env
-rw-r--r--  1 netadmin netadmin     31 Sep 29 09:00 .env
AUTO01$ chmod 600 .env
AUTO01$ ls -l .env
<span class="hl">-rw-------  1 netadmin netadmin     31 Sep 29 09:00 .env</span></pre>
<p><code>600</code> means read and write for the owner, nothing for group and others. The listing now shows <code>-rw-------</code>. Next, the <code>.gitignore</code> lists what must never be committed. Create it <b>before</b> the project goes into Git, because a file committed once stays in the history:</p>
<pre class="out">AUTO01$ printf '.env\\nbackups/\\ngolden/\\ninventory.db\\nstatus.json\\n*.log\\n__pycache__/\\n.pytest_cache/\\n' &gt; .gitignore
AUTO01$ cat .gitignore
.env
backups/
golden/
inventory.db
status.json
*.log
__pycache__/
.pytest_cache/</pre>
<p>The ignored items are the secret (<code>.env</code>), the data the tool produces (<code>backups/</code>, <code>golden/</code>, <code>status.json</code>, the logs) and the clutter of Python and pytest. The code and tests go into Git; the configs do not, because a running config contains password hashes and addresses (auto-git explains how a separate, access-controlled repository can hold approved configs). Finally prove that the password lives in exactly one place:</p>
<pre class="out">AUTO01$ grep -rl 'NK@2026' .
<span class="hl">.env</span></pre>
<p>If this command lists any other file, you have found a leak. The lab password <code>NK@2026</code> is a lab value only; real passwords never appear in lessons, tickets or chat.</p>

<h3>The hand-over checklist</h3>
<table class="cmp"><tr><th>Item</th><th>Done when</th></tr>
<tr><td>Usage</td><td><code>python3 nettool.py --help</code> explains the actions</td></tr>
<tr><td>Packages</td><td>A list of what must be installed: <code>nkmiko</code>, <code>python-dotenv</code>, <code>tabulate</code></td></tr>
<tr><td>Tests</td><td><code>pytest -q</code> is green</td></tr>
<tr><td>Schedule</td><td><code>crontab -l</code> shows the job with <code>cd</code> and a log</td></tr>
<tr><td>Secrets</td><td><code>.env</code> is <code>600</code>, ignored by Git, found by grep in one place only</td></tr>
<tr><td>Rules</td><td>Who approves a golden copy, who reads the log, how the password is rotated</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Priya leaves Kaveri Foods on Friday. Her replacement gets the folder, runs <code>--help</code>, runs <code>pytest -q</code> (green), reads <code>crontab -l</code> and <code>tail -4 netkit.log</code>, and asks the security team for a new <code>.env</code>. On Monday morning she is operating the tool, not reverse-engineering it.</p></div>

<div class="note"><p><b>Reference code.</b> <code>crontab -</code> <i>replaces</i> the whole crontab with its input; on a real server with other jobs you would use <code>crontab -e</code> to add a line. The configs in <code>backups/</code> are sensitive too: <code>chmod 700 backups</code> keeps other users out. A log that grows forever needs rotation, and a log with timestamps comes from the <code>logging</code> module (py-tools). Git is described here in words only; the simulated git command in this course does not manage the Linux home folder.</p></div>

<div class="warn"><p><b>Common mistakes.</b> A cron line without <code>cd</code> or with relative paths. Redirecting output to <code>/dev/null</code> so failures vanish. Committing <code>.env</code> "just once". Leaving the password in a script "for now". Handing over a tool with no way to run its tests.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>&gt;</code> overwrites the log each night; <code>&gt;&gt;</code> appends. <code>2&gt;&amp;1</code> must come <i>after</i> the file redirect. And cron does not use your interactive shell settings, so use full paths.</p></div>

<div class="scn"><h4>The job that ran every night and did nothing</h4><p>A cron line called the script by its full path but without <code>cd</code>. Every night it ran from the home folder, created a new empty inventory there and printed "inventory is empty - nothing to back up". The log looked busy; the backups were weeks old. Adding <code>cd /home/netadmin/netkit &amp;&amp;</code> fixed it in one edit. Chapter 10 reproduces this.</p><p><b>Lesson:</b> a job that runs is not a job that works; read the log.</p></div>

<div class="iv"><p class="q">"How do you run a Python tool safely from cron?"</p><p>I <code>cd</code> into the project first, use absolute paths for the log, redirect both output and errors with <code>&gt;&gt; log 2&gt;&amp;1</code>, and read the log the next morning. Secrets come from a <code>.env</code> with mode 600 that is in <code>.gitignore</code>, and I check with grep that the password appears in one file only.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cron starts in the home folder: <code>cd project &amp;&amp; python3 nettool.py backup</code>.</li>
<li>Append output and errors to a log with an absolute path; read it each morning.</li>
<li><code>chmod 600 .env</code> and a <code>.gitignore</code> created before the first commit.</li>
<li><code>grep -rl</code> proves the password lives in one place.</li>
<li>Hand-over means usage, packages, tests, schedule, secrets and rules.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> jis tool ko koi chalata nahi woh shauk hai, aur jo haath se chalta hai woh insaan ki yaaddasht jitna hi bharosemand hai. Yeh chapter toolkit ko aisi cheez banata hai jo har raat chale, saboot chhode, apne secrets sambhale aur colleague ko saunpi ja sake. Saare tukde <code>py-tools</code> aur <code>py-secrets</code> ke hain; kaam unhe sahi order mein lagana hai.</p>

<h3>Analogy: raat ke chowkidaar ka round</h3>
<p>Chowkidaar usi raaste par usi samay chalta hai, usi register mein likhta hai, aur ek chaabi rakhta hai jo deewar par tangi nahi hoti. Cron ghadi hai, log file register hai, aur <code>.env</code> chaabi hai.</p>

<h3>Cron job</h3>
<pre class="code">echo "0 2 * * * cd /home/netadmin/netkit &amp;&amp; python3 nettool.py backup &gt;&gt; /home/netadmin/netkit.log 2&gt;&amp;1" | crontab -</pre>
<pre class="out">AUTO01$ crontab -l
0 2 * * * cd /home/netadmin/netkit &amp;&amp; python3 nettool.py backup &gt;&gt; /home/netadmin/netkit.log 2&gt;&amp;1</pre>
<ul>
<li><code>0 2 * * *</code> matlab minute 0, ghanta 2, har din, har mahina, har weekday: har raat 02:00.</li>
<li><code>cd /home/netadmin/netkit &amp;&amp;</code> pehle aata hai aur sabse zaroori hissa hai. <b>Cron jobs ko home folder mein start karta hai.</b> Tool <code>inventory.db</code>, <code>backups/</code>, <code>golden/</code> aur <code>status.json</code> ko <i>current</i> folder mein rakhta hai (chapter 2, rule 2), isliye <code>cd</code> ke bina woh files ke ek alag, khaali set par kaam karta. <code>&amp;&amp;</code> ka matlab: agli command tabhi chalao jab <code>cd</code> chal gaya ho.</li>
<li><code>&gt;&gt; /home/netadmin/netkit.log</code> output ko absolute path wale log mein append karta hai.</li>
<li><code>2&gt;&amp;1</code> error messages ko usi jagah bhejta hai, isliye crash bhi log mein hota hai.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="02:00 par cron project folder mein jaata hai, backup chalata hai, jo backups, status.json aur log likhta hai">
<rect x="10" y="30" width="110" height="50" rx="8" fill="#fde68a"/><text x="65" y="52" text-anchor="middle" class="svg-ink" font-size="12">cron 02:00</text><text x="65" y="68" text-anchor="middle" class="svg-muted" font-size="10">home mein start</text>
<rect x="150" y="30" width="110" height="50" rx="8" fill="#bae6fd"/><text x="205" y="52" text-anchor="middle" class="svg-ink" font-size="12">cd netkit</text><text x="205" y="68" text-anchor="middle" class="svg-muted" font-size="10">sahi folder</text>
<rect x="290" y="30" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="350" y="52" text-anchor="middle" class="svg-ink" font-size="12">nettool backup</text><text x="350" y="68" text-anchor="middle" class="svg-muted" font-size="10">.env padhta hai</text>
<rect x="440" y="12" width="190" height="40" rx="8" fill="#ddd6fe"/><text x="535" y="36" text-anchor="middle" class="svg-ink" font-size="12">backups/ + status.json</text>
<rect x="440" y="62" width="190" height="40" rx="8" fill="#e2e8f0"/><text x="535" y="86" text-anchor="middle" class="svg-ink" font-size="12">netkit.log (append)</text>
<line x1="120" y1="55" x2="150" y2="55" stroke="#64748b" stroke-width="2"/><line x1="260" y1="55" x2="290" y2="55" stroke="#64748b" stroke-width="2"/><line x1="410" y1="45" x2="440" y2="32" stroke="#64748b" stroke-width="2"/><line x1="410" y1="65" x2="440" y2="82" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">cd woh step hai jisse baaki job apni files dhoondh pata hai.</p></div>
<p>Subah register sabse pehle padhne ki cheez hai. Har raat wahi chaar-line ka block append hota hai:</p>
<pre class="out">AUTO01$ tail -4 /home/netadmin/netkit.log
R1: ok
R2: ok
R3: unreachable
ok: 2, unreachable: 1</pre>

<h3>Secrets: .env, permissions aur .gitignore</h3>
<p>Router user aur password <code>.env</code> mein rehte hain, code mein kabhi nahi, log mein kabhi nahi. Is file ko do cheezein bachati hain: permissions aur version control. Pehle file ko sirf owner ke liye readable banao, phir Git ko use ignore karne ko kaho. Nayi file aam taur par sabke liye readable hoti hai:</p>
<pre class="out">AUTO01$ ls -l .env
-rw-r--r--  1 netadmin netadmin     31 Sep 29 09:00 .env
AUTO01$ chmod 600 .env
AUTO01$ ls -l .env
<span class="hl">-rw-------  1 netadmin netadmin     31 Sep 29 09:00 .env</span></pre>
<p><code>600</code> matlab owner ke liye read aur write, group aur others ke liye kuch nahi. Listing ab <code>-rw-------</code> dikhati hai. Phir <code>.gitignore</code> woh list hai jo kabhi commit nahi hona chahiye. Ise project Git mein jaane se <b>pehle</b> banao, kyunki ek baar commit hui file history mein reh jaati hai:</p>
<pre class="out">AUTO01$ printf '.env\\nbackups/\\ngolden/\\ninventory.db\\nstatus.json\\n*.log\\n__pycache__/\\n.pytest_cache/\\n' &gt; .gitignore
AUTO01$ cat .gitignore
.env
backups/
golden/
inventory.db
status.json
*.log
__pycache__/
.pytest_cache/</pre>
<p>Ignore hone wali cheezein hain secret (<code>.env</code>), tool ka banaya data (<code>backups/</code>, <code>golden/</code>, <code>status.json</code>, logs) aur Python aur pytest ka kachra. Code aur tests Git mein jaate hain; configs nahi, kyunki running config mein password hashes aur addresses hote hain (auto-git samjhata hai ki alag, access-controlled repository approved configs kaise rakh sakti hai). Aakhir mein saabit karo ki password bilkul ek hi jagah hai:</p>
<pre class="out">AUTO01$ grep -rl 'NK@2026' .
<span class="hl">.env</span></pre>
<p>Agar yeh command koi aur file list kare, to aapko leak mil gaya. Lab ka password <code>NK@2026</code> sirf lab value hai; asli passwords lessons, tickets ya chat mein kabhi nahi aate.</p>

<h3>Handover checklist</h3>
<table class="cmp"><tr><th>Cheez</th><th>Done tab jab</th></tr>
<tr><td>Usage</td><td><code>python3 nettool.py --help</code> actions samjhata hai</td></tr>
<tr><td>Packages</td><td>Install hone wali cheezon ki list: <code>nkmiko</code>, <code>python-dotenv</code>, <code>tabulate</code></td></tr>
<tr><td>Tests</td><td><code>pytest -q</code> green hai</td></tr>
<tr><td>Schedule</td><td><code>crontab -l</code> job ko <code>cd</code> aur log ke saath dikhata hai</td></tr>
<tr><td>Secrets</td><td><code>.env</code> <code>600</code> hai, Git se ignored hai, grep se sirf ek jagah milta hai</td></tr>
<tr><td>Rules</td><td>Golden copy kaun approve karta hai, log kaun padhta hai, password kaise rotate hota hai</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Priya Shukravar ko Kaveri Foods chhodti hai. Uski replacement folder leti hai, <code>--help</code> chalati hai, <code>pytest -q</code> chalati hai (green), <code>crontab -l</code> aur <code>tail -4 netkit.log</code> padhti hai, aur security team se naya <code>.env</code> maangti hai. Somvaar subah woh tool chala rahi hoti hai, reverse-engineer nahi kar rahi.</p></div>

<div class="note"><p><b>Reference code.</b> <code>crontab -</code> poore crontab ko apne input se <i>replace</i> kar deta hai; doosre jobs wale asli server par aap line jodne ke liye <code>crontab -e</code> use karoge. <code>backups/</code> ki configs bhi sensitive hain: <code>chmod 700 backups</code> doosre users ko door rakhta hai. Jo log hamesha badhta hai use rotation chahiye, aur timestamps wala log <code>logging</code> module se aata hai (py-tools). Git yahan sirf shabdon mein bataya gaya hai; is course ka simulated git command Linux home folder ko manage nahi karta.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Cron line bina <code>cd</code> ke ya relative paths ke saath. Output ko <code>/dev/null</code> mein bhejna taaki failures gayab ho jayein. <code>.env</code> ko "bas ek baar" commit karna. Password ko "abhi ke liye" script mein chhod dena. Aisa tool handover karna jiske tests chalane ka tareeka nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>&gt;</code> har raat log ko overwrite karta hai; <code>&gt;&gt;</code> append karta hai. <code>2&gt;&amp;1</code> file redirect ke <i>baad</i> aana chahiye. Aur cron aapki interactive shell settings use nahi karta, isliye poore paths use karo.</p></div>

<div class="scn"><h4>Woh job jo har raat chali aur kuch nahi kiya</h4><p>Ek cron line ne script ko poore path se call kiya par <code>cd</code> ke bina. Har raat woh home folder se chali, wahan nayi khaali inventory banayi aur "inventory is empty - nothing to back up" print kiya. Log busy dikha; backups hafton purane the. <code>cd /home/netadmin/netkit &amp;&amp;</code> jodna ek edit mein theek ho gaya. Chapter 10 ise reproduce karta hai.</p><p><b>Lesson:</b> job chalna aur job kaam karna alag baat hai; log padho.</p></div>

<div class="iv"><p class="q">"Python tool ko cron se safely kaise chalate ho?"</p><p>Pehle project mein <code>cd</code> karta hoon, log ke liye absolute path use karta hoon, output aur errors dono ko <code>&gt;&gt; log 2&gt;&amp;1</code> se redirect karta hoon, aur agli subah log padhta hoon. Secrets mode 600 wali <code>.env</code> se aate hain jo <code>.gitignore</code> mein hai, aur grep se check karta hoon ki password sirf ek file mein hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cron home folder mein start hota hai: <code>cd project &amp;&amp; python3 nettool.py backup</code>.</li>
<li>Output aur errors ko absolute path wale log mein append karo; har subah padho.</li>
<li><code>chmod 600 .env</code> aur pehle commit se pehle banaya <code>.gitignore</code>.</li>
<li><code>grep -rl</code> saabit karta hai ki password ek hi jagah hai.</li>
<li>Handover matlab usage, packages, tests, schedule, secrets aur rules.</li>
</ul></div>
`}};export{e as default};