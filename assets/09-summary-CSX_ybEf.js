var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p><b>You made it.</b> You started with a text file and ended with a reachability checker and a nightly backup that runs by itself. This chapter is your checklist, your glossary and your cheat sheet.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module recap pipeline">
<rect x="10" y="40" width="96" height="60" rx="10" fill="#fde68a"/><text x="58" y="68" text-anchor="middle" class="svg-ink" font-size="12">script file</text><text x="58" y="86" text-anchor="middle" class="svg-muted" font-size="11">#!/bin/bash</text>
<rect x="124" y="40" width="96" height="60" rx="10" fill="#bae6fd"/><text x="172" y="68" text-anchor="middle" class="svg-ink" font-size="12">variables</text><text x="172" y="86" text-anchor="middle" class="svg-muted" font-size="11">args, quotes</text>
<rect x="238" y="40" width="96" height="60" rx="10" fill="#bbf7d0"/><text x="286" y="68" text-anchor="middle" class="svg-ink" font-size="12">if and loops</text><text x="286" y="86" text-anchor="middle" class="svg-muted" font-size="11">device list</text>
<rect x="352" y="40" width="96" height="60" rx="10" fill="#ddd6fe"/><text x="400" y="68" text-anchor="middle" class="svg-ink" font-size="12">exit codes</text><text x="400" y="86" text-anchor="middle" class="svg-muted" font-size="11">0 or not 0</text>
<rect x="466" y="40" width="164" height="60" rx="10" fill="#fed7aa"/><text x="548" y="68" text-anchor="middle" class="svg-ink" font-size="12">cron + logs</text><text x="548" y="86" text-anchor="middle" class="svg-muted" font-size="11">nightly, verified</text>
<line x1="106" y1="70" x2="124" y2="70" stroke="#64748b" stroke-width="2"/><line x1="220" y1="70" x2="238" y2="70" stroke="#64748b" stroke-width="2"/><line x1="334" y1="70" x2="352" y2="70" stroke="#64748b" stroke-width="2"/><line x1="448" y1="70" x2="466" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The whole module in one line.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can write a script with a shebang, make it executable and run it with <code>./</code>.</li>
<li>I can set variables, quote them, capture a command with <code>$(...)</code> and count with <code>$((...))</code>.</li>
<li>I can read <code>$1</code>, <code>$#</code> and <code>$0</code>, check for missing input and exit with a usage message.</li>
<li>I can write <code>if</code>/<code>elif</code>/<code>else</code> with <code>[ ]</code> tests and use ping as a test.</li>
<li>I can loop over a short list with <code>for</code> and over a device file with <code>while read -r</code>.</li>
<li>I can use <code>$?</code>, <code>&amp;&amp;</code>, <code>||</code> and give my own script an exit code.</li>
<li>I can write a cron line, test it every minute, prove it ran and set the real schedule.</li>
<li>I can follow the troubleshooting routine and fix permission, path, typo and cron-environment problems.</li>
<li>I know what is reference code (functions, <code>shift</code>, <code>set -e</code>, <code>bash -x</code>) and run it on a real Linux host.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>shebang</dt><dd>The first line <code>#!/bin/bash</code> that names the interpreter.</dd>
<dt>argument</dt><dd>A value typed after the script name; arrives in <code>$1</code>, <code>$2</code>.</dd>
<dt>expansion</dt><dd>Bash replacing <code>$name</code>, <code>$(cmd)</code> or <code>$((maths))</code> with a value before running.</dd>
<dt>exit code</dt><dd>The number a command leaves behind: 0 success, non-zero failure; read with <code>$?</code>.</dd>
<dt>crontab</dt><dd>A user's table of scheduled jobs: minute hour day-of-month month day-of-week command.</dd>
<dt>stdout / stderr</dt><dd>Normal output and error output; <code>&gt;</code> redirects the first, <code>2&gt;&amp;1</code> joins the second to it.</dd>
<dt>PATH</dt><dd>The list of folders searched for commands; the current folder is not in it.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Assignment</td><td><code>name=value</code> with no spaces; read with <code>$name</code></td></tr>
<tr><td>Quotes</td><td>Double expand, single do not; quote variables</td></tr>
<tr><td>Success</td><td>Exit code 0; anything else is failure</td></tr>
<tr><td>Numbers vs text in tests</td><td><code>-eq -lt -gt</code> for numbers; <code>=</code> and <code>!=</code> for text</td></tr>
<tr><td>Loop a file</td><td><code>while read -r a b; do ...; done &lt; file</code></td></tr>
<tr><td>cron field order</td><td>minute hour day-of-month month day-of-week</td></tr>
<tr><td>Under cron</td><td>Home folder, minimal PATH, no terminal: use full paths</td></tr>
<tr><td>Secrets</td><td>Not in scripts; keys or environment; <code>chmod 700</code></td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code">chmod +x script.sh          # allow ./script.sh
./script.sh arg1 arg2       # run with arguments
echo $?                     # exit code of the last command
ping -c 1 "$ip" &gt; /dev/null 2&gt;&amp;1 &amp;&amp; echo UP || echo DOWN
crontab -l                  # list scheduled jobs
echo "0 2 * * * /home/netadmin/backup.sh" | crontab -
grep CRON /var/log/syslog   # did cron run it?</pre>

<div class="warn"><p><b>Last reminders.</b> A script that prints "OK" without checking is worse than no script. Quote every variable. End every list file with a newline. Never keep a real password in a script you share.</p></div>
<div class="exam"><p><b>Exam trap.</b> Do not confuse <code>$(cmd)</code> (run a command) with <code>$((expr))</code> (maths), <code>&gt;</code> (replace file) with <code>&gt;&gt;</code> (append), or <code>&amp;&amp;</code> (on success) with <code>||</code> (on failure).</p></div>

<div class="scn"><h4>From manual Monday to a ten-second report</h4><p>A Pune NOC spent 25 minutes every Monday pinging branches by hand. Using what this module taught, one engineer wrote <code>checknet.sh</code> with a device file, a UP/DOWN counter, a dated report and an exit code, then scheduled it with cron every 15 minutes with an alert on failure. Monday's check became a glance at one file, and outages were noticed within minutes.</p><p><b>Lesson:</b> small, verified scripts plus a scheduler turn routine checks into a quiet background service.</p></div>

<div class="iv"><p class="q">"Walk me through a script you would write to check 50 devices every morning."</p><p>Keep the devices in a text file, one <code>name ip</code> per line. A <code>while read -r</code> loop pings each with <code>ping -c 1</code>, prints UP or DOWN, counts both, writes a dated report, and exits 1 if anything is down. Cron runs it with full paths, output is appended to a log, and I verify with the report, <code>crontab -l</code> and the syslog CRON line. No passwords in the script.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Script = shebang + commands; make it executable and run it with <code>./</code>.</li>
<li>Variables, arguments, <code>if</code> and loops let one script serve every device in a file.</li>
<li>Exit codes are how scripts talk to cron and monitoring: 0 means success.</li>
<li>cron runs the job; you prove it with the crontab, syslog, logs and output files.</li>
<li>Read the error, change one thing, run again.</li>
</ul></div>
`,hi:`
<p><b>Aap pahunch gaye.</b> Aapne ek text file se shuru kiya aur reachability checker aur nightly backup tak pahunche jo khud chalta hai. Yeh chapter aapki checklist, glossary aur cheat sheet hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module recap pipeline">
<rect x="10" y="40" width="96" height="60" rx="10" fill="#fde68a"/><text x="58" y="68" text-anchor="middle" class="svg-ink" font-size="12">script file</text><text x="58" y="86" text-anchor="middle" class="svg-muted" font-size="11">#!/bin/bash</text>
<rect x="124" y="40" width="96" height="60" rx="10" fill="#bae6fd"/><text x="172" y="68" text-anchor="middle" class="svg-ink" font-size="12">variables</text><text x="172" y="86" text-anchor="middle" class="svg-muted" font-size="11">args, quotes</text>
<rect x="238" y="40" width="96" height="60" rx="10" fill="#bbf7d0"/><text x="286" y="68" text-anchor="middle" class="svg-ink" font-size="12">if aur loops</text><text x="286" y="86" text-anchor="middle" class="svg-muted" font-size="11">device list</text>
<rect x="352" y="40" width="96" height="60" rx="10" fill="#ddd6fe"/><text x="400" y="68" text-anchor="middle" class="svg-ink" font-size="12">exit codes</text><text x="400" y="86" text-anchor="middle" class="svg-muted" font-size="11">0 ya 0 nahi</text>
<rect x="466" y="40" width="164" height="60" rx="10" fill="#fed7aa"/><text x="548" y="68" text-anchor="middle" class="svg-ink" font-size="12">cron + logs</text><text x="548" y="86" text-anchor="middle" class="svg-muted" font-size="11">nightly, verified</text>
<line x1="106" y1="70" x2="124" y2="70" stroke="#64748b" stroke-width="2"/><line x1="220" y1="70" x2="238" y2="70" stroke="#64748b" stroke-width="2"/><line x1="334" y1="70" x2="352" y2="70" stroke="#64748b" stroke-width="2"/><line x1="448" y1="70" x2="466" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Poora module ek line mein.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main shebang ke saath script likh sakta hoon, use executable bana kar <code>./</code> se chala sakta hoon.</li>
<li>Main variables set, quote, <code>$(...)</code> se command capture aur <code>$((...))</code> se ginti kar sakta hoon.</li>
<li>Main <code>$1</code>, <code>$#</code> aur <code>$0</code> padh sakta hoon, missing input check karke usage message ke saath exit kar sakta hoon.</li>
<li>Main <code>[ ]</code> tests ke saath <code>if</code>/<code>elif</code>/<code>else</code> likh sakta hoon aur ping ko test ki tarah use kar sakta hoon.</li>
<li>Main chhoti list par <code>for</code> aur device file par <code>while read -r</code> se loop kar sakta hoon.</li>
<li>Main <code>$?</code>, <code>&amp;&amp;</code>, <code>||</code> use kar sakta hoon aur apni script ko exit code de sakta hoon.</li>
<li>Main cron line likh sakta hoon, har minute test kar sakta hoon, sabit kar sakta hoon ki chali aur asli schedule laga sakta hoon.</li>
<li>Main troubleshooting routine follow karke permission, path, typo aur cron-environment problems theek kar sakta hoon.</li>
<li>Mujhe pata hai reference code kya hai (functions, <code>shift</code>, <code>set -e</code>, <code>bash -x</code>) aur use asli Linux host par chalata hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>shebang</dt><dd>Pehli line <code>#!/bin/bash</code> jo interpreter ka naam batati hai.</dd>
<dt>argument</dt><dd>Script ke naam ke baad type ki gayi value; <code>$1</code>, <code>$2</code> mein aati hai.</dd>
<dt>expansion</dt><dd>Bash ka chalane se pehle <code>$name</code>, <code>$(cmd)</code> ya <code>$((maths))</code> ko value se badalna.</dd>
<dt>exit code</dt><dd>Command ka chhoda hua number: 0 success, non-zero failure; <code>$?</code> se padhte hain.</dd>
<dt>crontab</dt><dd>User ki scheduled jobs ki table: minute hour day-of-month month day-of-week command.</dd>
<dt>stdout / stderr</dt><dd>Normal output aur error output; <code>&gt;</code> pehle ko redirect karta hai, <code>2&gt;&amp;1</code> doosre ko usse jodta hai.</dd>
<dt>PATH</dt><dd>Commands dhoondne wale folders ki list; current folder usme nahi hota.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>Assignment</td><td><code>name=value</code> bina spaces ke; <code>$name</code> se padho</td></tr>
<tr><td>Quotes</td><td>Double expand karte hain, single nahi; variables quote karo</td></tr>
<tr><td>Success</td><td>Exit code 0; baaki sab failure</td></tr>
<tr><td>Tests mein numbers vs text</td><td>Numbers ke liye <code>-eq -lt -gt</code>; text ke liye <code>=</code> aur <code>!=</code></td></tr>
<tr><td>File par loop</td><td><code>while read -r a b; do ...; done &lt; file</code></td></tr>
<tr><td>cron field order</td><td>minute hour day-of-month month day-of-week</td></tr>
<tr><td>Cron ke neeche</td><td>Home folder, minimal PATH, terminal nahi: full paths use karo</td></tr>
<tr><td>Secrets</td><td>Scripts mein nahi; keys ya environment; <code>chmod 700</code></td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code">chmod +x script.sh          # allow ./script.sh
./script.sh arg1 arg2       # run with arguments
echo $?                     # exit code of the last command
ping -c 1 "$ip" &gt; /dev/null 2&gt;&amp;1 &amp;&amp; echo UP || echo DOWN
crontab -l                  # list scheduled jobs
echo "0 2 * * * /home/netadmin/backup.sh" | crontab -
grep CRON /var/log/syslog   # did cron run it?</pre>

<div class="warn"><p><b>Aakhri reminders.</b> Jo script bina check kiye "OK" print kare woh bina script se bhi buri hai. Har variable quote karo. Har list file newline par khatam karo. Share ki jaane wali script mein asli password kabhi mat rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>$(cmd)</code> (command chalao) ko <code>$((expr))</code> (maths) se, <code>&gt;</code> (file replace) ko <code>&gt;&gt;</code> (append) se, aur <code>&amp;&amp;</code> (success par) ko <code>||</code> (failure par) se confuse mat karo.</p></div>

<div class="scn"><h4>Haath ke Monday se das second ki report tak</h4><p>Pune NOC har Monday 25 minute branches ko haath se ping karne mein lagata tha. Is module ki seekh se ek engineer ne device file, UP/DOWN counter, dated report aur exit code wali <code>checknet.sh</code> likhi, phir use cron se har 15 minute schedule kiya aur failure par alert lagaya. Monday ka check ek file par nazar ban gaya, aur outages minutes mein dikhne lage.</p><p><b>Lesson:</b> chhoti, verify ki hui scripts aur scheduler routine checks ko shaant background service bana dete hain.</p></div>

<div class="iv"><p class="q">"Mujhe aisi script batao jo roz subah 50 devices check kare."</p><p>Devices ek text file mein rakhunga, har line mein ek <code>name ip</code>. <code>while read -r</code> loop har ek ko <code>ping -c 1</code> se check karega, UP ya DOWN print karega, dono ginega, dated report likhega, aur kuch down ho to exit 1 karega. Cron use full paths ke saath chalayega, output log mein append hoga, aur main report, <code>crontab -l</code> aur syslog ki CRON line se verify karunga. Script mein password nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Script = shebang + commands; executable banao aur <code>./</code> se chalao.</li>
<li>Variables, arguments, <code>if</code> aur loops ek script ko file ke har device ke liye kaam karwate hain.</li>
<li>Exit codes scripts ke cron aur monitoring se baat karne ka tareeka hain: 0 matlab success.</li>
<li>cron job chalata hai; aap crontab, syslog, logs aur output files se sabit karte ho.</li>
<li>Error padho, ek cheez badlo, dobara chalao.</li>
</ul></div>
`}};export{e as default};