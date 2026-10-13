var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: a script that will not run`,hi:`Troubleshooting workflow: script jo chalti nahi`},body:{en:`
<p><b>The idea of this chapter:</b> scripts fail in a small number of ways. If you follow the same short routine every time, you will find the cause in minutes instead of hours. This chapter gives that routine and walks through the two tickets from the labs.</p>

<h3>Analogy: the doctor's routine</h3>
<p>A good doctor does not guess. She asks the same questions in the same order: what exactly hurts, since when, what changed. A script problem is similar. The error message is the symptom, and it nearly always names the file, the line or the command that failed.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Five step script troubleshooting routine">
<rect x="10" y="30" width="112" height="60" rx="10" fill="#fde68a"/><text x="66" y="56" text-anchor="middle" class="svg-ink" font-size="12">1 Read the</text><text x="66" y="74" text-anchor="middle" class="svg-ink" font-size="12">exact error</text>
<rect x="136" y="30" width="112" height="60" rx="10" fill="#bae6fd"/><text x="192" y="56" text-anchor="middle" class="svg-ink" font-size="12">2 Run by</text><text x="192" y="74" text-anchor="middle" class="svg-ink" font-size="12">hand</text>
<rect x="262" y="30" width="112" height="60" rx="10" fill="#bbf7d0"/><text x="318" y="56" text-anchor="middle" class="svg-ink" font-size="12">3 Check the</text><text x="318" y="74" text-anchor="middle" class="svg-ink" font-size="12">exit code</text>
<rect x="388" y="30" width="112" height="60" rx="10" fill="#ddd6fe"/><text x="444" y="56" text-anchor="middle" class="svg-ink" font-size="12">4 Fix one</text><text x="444" y="74" text-anchor="middle" class="svg-ink" font-size="12">thing</text>
<rect x="514" y="30" width="112" height="60" rx="10" fill="#fed7aa"/><text x="570" y="56" text-anchor="middle" class="svg-ink" font-size="12">5 Run again,</text><text x="570" y="74" text-anchor="middle" class="svg-ink" font-size="12">prove it</text>
<line x1="122" y1="60" x2="136" y2="60" stroke="#64748b" stroke-width="2"/><line x1="248" y1="60" x2="262" y2="60" stroke="#64748b" stroke-width="2"/><line x1="374" y1="60" x2="388" y2="60" stroke="#64748b" stroke-width="2"/><line x1="500" y1="60" x2="514" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="12">change only one thing at a time</text>
</svg><p class="cap">Read, run by hand, check the code, fix one thing, prove it.</p></div>

<h3>The common errors and what they mean</h3>
<table class="cmp"><tr><th>Message</th><th>Usual cause and fix</th></tr>
<tr><td><code>Permission denied</code></td><td>No execute bit. <code>chmod u+x script.sh</code>, then <code>ls -l</code> to confirm.</td></tr>
<tr><td><code>command not found</code></td><td>Typo, a tool that is not installed (<code>sshpass</code>), or the script is not on PATH: use <code>./script.sh</code>.</td></tr>
<tr><td><code>No such file or directory</code></td><td>Wrong file name or folder. Read the name in the message; compare with <code>ls</code>.</td></tr>
<tr><td>Variable is empty or odd</td><td>Spaces around <code>=</code>, a misspelt name, or a missing quote.</td></tr>
<tr><td>Works by hand, not from cron</td><td>Relative paths, minimal PATH, a password prompt. Use full paths and non-interactive logins.</td></tr></table>

<h3>Ticket 1: the reachability script that has never run</h3>
<p>The senior's <code>checknet.sh</code> reads a device list and pings each entry. It has never worked. Follow the routine. First, run it and read the message:</p>
<pre class="out">AUTO01$ ./checknet.sh
-bash: ./checknet.sh: <span class="hl">Permission denied</span>
AUTO01$ chmod u+x checknet.sh
AUTO01$ ls -l checknet.sh
-rwxr--r--  1 netadmin netadmin    495 Sep 29 09:00 checknet.sh
AUTO01$ ./checknet.sh
UP: 0 DOWN: 0
./checknet.sh: line 15: <span class="hl">device.txt</span>: No such file or directory</pre>
<p>Two different problems, found one at a time. Fix one (the execute bit), run again, and the next message appears. Now the script runs but the message names <code>device.txt</code> at line 15, and the folder holds <code>devices.txt</code> (with an s). Line 4 sets the default list name and has a typo. (In real Bash the error text appears before the summary line; the lab prints them in a slightly different order.) Fix it with <code>sed</code>, which replaces text in a file:</p>
<pre class="out">AUTO01$ sed -i 's/device\\.txt/devices.txt/' checknet.sh
AUTO01$ ./checknet.sh; echo "exit code: $?"
PUN-CORE-R1 10.99.0.1 UP
BLR-EDGE-R2 10.99.0.2 UP
HYD-EDGE-R3 10.99.0.3 <span class="hl">DOWN</span>
UP: 2 DOWN: 1
exit code: <span class="hl">1</span>
AUTO01$ mkdir -p reports
AUTO01$ ./checknet.sh &gt; reports/check-$(date +%F).txt
AUTO01$ ls reports
check-2026-09-29.txt
AUTO01$ ./checknet.sh branch.txt
BLR-EDGE-R2 10.99.0.2 UP
BLR-SW-01 10.99.0.12 DOWN
BLR-AP-01 10.99.0.13 DOWN
UP: 1 DOWN: 2</pre>
<p>Answers: the broken name was <code>device.txt</code>; HYD-EDGE-R3 is down; the exit code is 1 because at least one device is down; the dated report was saved with <code>$(date +%F)</code> in the name; and the Bengaluru list has two devices down. The dot in the sed pattern is escaped (<code>\\.</code>) because a bare dot matches any character.</p>

<h3>Ticket 2: the backup that "works" but saves nothing</h3>
<p>Walk through the backup lab in the same way. If <code>./backup.sh</code> prints <code>Command 'sshpass' not found</code>, install it. A fresh server has empty package lists, so run <code>sudo apt update</code> first, or the install fails:</p>
<pre class="out">AUTO01$ sudo apt install -y sshpass
E: Unable to locate package sshpass
(hint: the package lists are empty on this fresh server — run sudo apt update first)</pre>
<p>After <code>sudo apt update</code> the install works. Then run by hand and prove the result with <code>ls -lR backups</code> (sizes above 0) and <code>grep hostname backups/*/*.cfg</code>. Only then protect it with <code>chmod 700</code>, and test cron with an every-minute line, proving it with <code>grep CRON /var/log/syslog</code>. The user shown in those lines is <b>netadmin</b>, because the job lives in netadmin's crontab. When satisfied, install the real 02:00 schedule and confirm that <code>crontab -l</code> shows exactly one line.</p>

<div class="eg"><p><b>Worked example.</b> A cron job "does nothing". Run the same command by hand with the exact line from the crontab. If it works, the problem is the environment: change relative paths to absolute, add the full path of every tool, and append output to a log with <code>&gt;&gt; /home/netadmin/job.log 2&gt;&amp;1</code> so you can see the error text that cron would otherwise throw away.</p></div>

<div class="note"><p><b>Reference code (not run in the simulator).</b> Real Bash can trace a script: <code>bash -x script.sh</code> prints every command after expansion, with a leading plus sign, which shows exactly which value a variable had. <code>set -u</code> makes an unset variable an error, and <code>set -e</code> stops at the first failing command. The lab shell ignores these options, so use them on a real Linux host.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing three things at once, so you do not know which fixed it. Reading only the last line of an error. Debugging inside cron instead of running by hand first. Assuming success because the script printed no error: check results, file sizes and exit codes.</p></div>
<div class="exam"><p><b>Exam trap.</b> <i>Permission denied</i> on a script is about the execute bit (<code>chmod</code>), not about the file contents. <i>command not found</i> for a script in the current folder is about PATH: use <code>./script.sh</code>.</p></div>

<div class="scn"><h4>Friday 17:55: the checker that stopped reporting</h4><p>The reachability report did not arrive on Friday. The on-call engineer ran the script by hand: it worked. Cron's log showed the job started on time. The difference was one line: the script opened <code>devices.txt</code> by a relative name, and under cron the working directory was the home folder, not the script's folder. Changing it to a full path fixed it, and appending output to a log file would have shown the error immediately.</p><p><b>Lesson:</b> run by hand first, then compare the cron environment: path, folder, no terminal.</p></div>

<div class="iv"><p class="q">"A script works when you run it but fails from cron. What do you check?"</p><p>I run the exact cron line by hand, then compare the environment. Cron has a minimal PATH, starts in the user's home folder and has no terminal, so I use absolute paths for scripts, files and commands, remove anything that prompts, and redirect output to a log with <code>&gt;&gt; log 2&gt;&amp;1</code>. I also check <code>/var/log/syslog</code> for the CRON entry and the script's exit code.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read the exact error, run by hand, check the exit code, fix one thing, prove it.</li>
<li>Permission denied means execute bit; command not found means PATH or a missing tool.</li>
<li>No such file: compare the name in the message with <code>ls</code>.</li>
<li>Under cron use full paths and capture output in a log.</li>
<li>Verify results (file sizes, report contents), not just "no error".</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> scripts bahut kam tareekon se fail hoti hain. Har baar wahi chhoti routine follow karoge to cause ghanton ki jagah minutes mein milega. Yeh chapter woh routine deta hai aur labs ke do tickets walk-through karta hai.</p>

<h3>Analogy: doctor ki routine</h3>
<p>Achha doctor andaza nahi lagata. Woh wahi sawaal wahi order mein poochti hai: kya dard hai, kab se, kya badla. Script ki problem bhi aisi hi hai. Error message symptom hai, aur woh lagbhag hamesha us file, line ya command ka naam batata hai jo fail hui.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Script troubleshooting ke paanch steps">
<rect x="10" y="30" width="112" height="60" rx="10" fill="#fde68a"/><text x="66" y="56" text-anchor="middle" class="svg-ink" font-size="12">1 Exact error</text><text x="66" y="74" text-anchor="middle" class="svg-ink" font-size="12">padho</text>
<rect x="136" y="30" width="112" height="60" rx="10" fill="#bae6fd"/><text x="192" y="56" text-anchor="middle" class="svg-ink" font-size="12">2 Haath se</text><text x="192" y="74" text-anchor="middle" class="svg-ink" font-size="12">chalao</text>
<rect x="262" y="30" width="112" height="60" rx="10" fill="#bbf7d0"/><text x="318" y="56" text-anchor="middle" class="svg-ink" font-size="12">3 Exit code</text><text x="318" y="74" text-anchor="middle" class="svg-ink" font-size="12">dekho</text>
<rect x="388" y="30" width="112" height="60" rx="10" fill="#ddd6fe"/><text x="444" y="56" text-anchor="middle" class="svg-ink" font-size="12">4 Ek cheez</text><text x="444" y="74" text-anchor="middle" class="svg-ink" font-size="12">theek karo</text>
<rect x="514" y="30" width="112" height="60" rx="10" fill="#fed7aa"/><text x="570" y="56" text-anchor="middle" class="svg-ink" font-size="12">5 Dobara chalao,</text><text x="570" y="74" text-anchor="middle" class="svg-ink" font-size="12">sabit karo</text>
<line x1="122" y1="60" x2="136" y2="60" stroke="#64748b" stroke-width="2"/><line x1="248" y1="60" x2="262" y2="60" stroke="#64748b" stroke-width="2"/><line x1="374" y1="60" x2="388" y2="60" stroke="#64748b" stroke-width="2"/><line x1="500" y1="60" x2="514" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="12">ek baar mein sirf ek cheez badlo</text>
</svg><p class="cap">Padho, haath se chalao, code dekho, ek cheez theek karo, sabit karo.</p></div>

<h3>Aam errors aur unka matlab</h3>
<table class="cmp"><tr><th>Message</th><th>Aam wajah aur fix</th></tr>
<tr><td><code>Permission denied</code></td><td>Execute bit nahi. <code>chmod u+x script.sh</code>, phir <code>ls -l</code> se confirm karo.</td></tr>
<tr><td><code>command not found</code></td><td>Typo, install na hua tool (<code>sshpass</code>), ya script PATH par nahi: <code>./script.sh</code> use karo.</td></tr>
<tr><td><code>No such file or directory</code></td><td>Galat file name ya folder. Message ka naam padho; <code>ls</code> se milao.</td></tr>
<tr><td>Variable khaali ya ajeeb</td><td><code>=</code> ke aas-paas spaces, galat spelling, ya quote missing.</td></tr>
<tr><td>Haath se chalti hai, cron se nahi</td><td>Relative paths, minimal PATH, password prompt. Full paths aur non-interactive logins use karo.</td></tr></table>

<h3>Ticket 1: reachability script jo kabhi chali nahi</h3>
<p>Senior ki <code>checknet.sh</code> device list padhti hai aur har entry ko ping karti hai. Yeh kabhi nahi chali. Routine follow karo. Pehle chalao aur message padho:</p>
<pre class="out">AUTO01$ ./checknet.sh
-bash: ./checknet.sh: <span class="hl">Permission denied</span>
AUTO01$ chmod u+x checknet.sh
AUTO01$ ls -l checknet.sh
-rwxr--r--  1 netadmin netadmin    495 Sep 29 09:00 checknet.sh
AUTO01$ ./checknet.sh
UP: 0 DOWN: 0
./checknet.sh: line 15: <span class="hl">device.txt</span>: No such file or directory</pre>
<p>Do alag problems, ek ek karke mili. Ek fix karo (execute bit), dobara chalao, aur agla message aata hai. Ab script chalti hai par message line 15 par <code>device.txt</code> batata hai, aur folder mein <code>devices.txt</code> (s ke saath) hai. Line 4 default list ka naam set karti hai aur usme typo hai. (Asli Bash mein error text summary line se pehle aata hai; lab thode alag order mein print karta hai.) <code>sed</code> se theek karo, jo file mein text badalta hai:</p>
<pre class="out">AUTO01$ sed -i 's/device\\.txt/devices.txt/' checknet.sh
AUTO01$ ./checknet.sh; echo "exit code: $?"
PUN-CORE-R1 10.99.0.1 UP
BLR-EDGE-R2 10.99.0.2 UP
HYD-EDGE-R3 10.99.0.3 <span class="hl">DOWN</span>
UP: 2 DOWN: 1
exit code: <span class="hl">1</span>
AUTO01$ mkdir -p reports
AUTO01$ ./checknet.sh &gt; reports/check-$(date +%F).txt
AUTO01$ ls reports
check-2026-09-29.txt
AUTO01$ ./checknet.sh branch.txt
BLR-EDGE-R2 10.99.0.2 UP
BLR-SW-01 10.99.0.12 DOWN
BLR-AP-01 10.99.0.13 DOWN
UP: 1 DOWN: 2</pre>
<p>Jawab: galat naam <code>device.txt</code> tha; HYD-EDGE-R3 down hai; exit code 1 hai kyunki kam se kam ek device down hai; dated report naam mein <code>$(date +%F)</code> ke saath save hui; aur Bengaluru list mein do devices down hain. sed pattern mein dot escape kiya hai (<code>\\.</code>) kyunki akela dot kisi bhi character se match karta hai.</p>

<h3>Ticket 2: backup jo "chalta" hai par kuch save nahi karta</h3>
<p>Backup lab ko isi tarah walk-through karo. <code>./backup.sh</code> <code>Command 'sshpass' not found</code> print kare to use install karo. Fresh server ki package lists khaali hoti hain, isliye pehle <code>sudo apt update</code> chalao, warna install fail hota hai:</p>
<pre class="out">AUTO01$ sudo apt install -y sshpass
E: Unable to locate package sshpass
(hint: the package lists are empty on this fresh server — run sudo apt update first)</pre>
<p><code>sudo apt update</code> ke baad install chalta hai. Phir haath se chalao aur <code>ls -lR backups</code> (sizes 0 se upar) aur <code>grep hostname backups/*/*.cfg</code> se result sabit karo. Tabhi <code>chmod 700</code> se protect karo, aur cron ko har-minute line se test karo, <code>grep CRON /var/log/syslog</code> se sabit karte hue. Un lines mein dikha user <b>netadmin</b> hai, kyunki job netadmin ki crontab mein hai. Santusht hone par asli 02:00 schedule lagao aur confirm karo ki <code>crontab -l</code> bilkul ek line dikhata hai.</p>

<div class="eg"><p><b>Worked example.</b> Cron job "kuch nahi karta". Crontab ki exact line ko haath se chalao. Chale to problem environment hai: relative paths ko absolute karo, har tool ka full path do, aur output ko <code>&gt;&gt; /home/netadmin/job.log 2&gt;&amp;1</code> se log mein jodo taaki woh error text dikhe jo cron warna fenk deta.</p></div>

<div class="note"><p><b>Reference code (not run in the simulator).</b> Asli Bash script ko trace kar sakta hai: <code>bash -x script.sh</code> har command ko expansion ke baad plus sign ke saath print karta hai, jisse dikhta hai ki variable ki value kya thi. <code>set -u</code> unset variable ko error banata hai, aur <code>set -e</code> pehli failing command par ruk jaata hai. Lab shell in options ko ignore karta hai, isliye inhe asli Linux host par use karo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Teen cheezein ek saath badalna, jisse pata nahi chalta kisne fix kiya. Error ki sirf aakhri line padhna. Pehle haath se chalane ki jagah cron ke andar debug karna. Error na dikhne par success maan lena: results, file sizes aur exit codes check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Script par <i>Permission denied</i> execute bit (<code>chmod</code>) ke baare mein hai, file ke contents ke baare mein nahi. Current folder ki script ke liye <i>command not found</i> PATH ke baare mein hai: <code>./script.sh</code> use karo.</p></div>

<div class="scn"><h4>Friday 17:55: checker ne report dena band kar diya</h4><p>Friday ko reachability report nahi aayi. On-call engineer ne script haath se chalayi: chal gayi. Cron ke log ne dikhaya ki job time par shuru hua. Fark ek line ka tha: script ne <code>devices.txt</code> relative naam se kholi, aur cron ke neeche working directory home folder thi, script ka folder nahi. Full path karne se fix hua, aur output ko log file mein jodne se error turant dikh jaata.</p><p><b>Lesson:</b> pehle haath se chalao, phir cron environment se compare karo: path, folder, terminal nahi.</p></div>

<div class="iv"><p class="q">"Script haath se chalti hai par cron se fail hoti hai. Kya check karoge?"</p><p>Main crontab ki exact line haath se chalata hoon, phir environment compare karta hoon. Cron ka PATH minimal hota hai, woh user ke home folder mein shuru hota hai aur terminal nahi hota, isliye scripts, files aur commands ke absolute paths use karta hoon, prompt karne wali cheezein hata deta hoon, aur output ko <code>&gt;&gt; log 2&gt;&amp;1</code> se log mein bhejta hoon. Saath mein <code>/var/log/syslog</code> mein CRON entry aur script ka exit code bhi dekhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Exact error padho, haath se chalao, exit code dekho, ek cheez theek karo, sabit karo.</li>
<li>Permission denied matlab execute bit; command not found matlab PATH ya missing tool.</li>
<li>No such file: message ka naam <code>ls</code> se milao.</li>
<li>Cron ke neeche full paths use karo aur output log mein pakdo.</li>
<li>Results verify karo (file sizes, report contents), sirf "error nahi" nahi.</li>
</ul></div>
`}};export{e as default};