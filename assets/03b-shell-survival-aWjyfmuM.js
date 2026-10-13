var e={id:`shell-survival`,h:{en:`Shell survival kit: shortcuts, help and pipes in one page`,hi:`Shell survival kit: shortcuts, help aur pipes ek page mein`},body:{en:`
<p>Before the next chapters use pipes and long commands, you need five habits that make the terminal fast and safe: <b>Tab completion, history, stopping a command, asking for help, and the pipe</b>. Each takes a minute to learn and saves hours.</p>

<h3>Analogy: the terminal is a chat with a very literal assistant</h3>
<p>The shell does exactly what you type. It will not guess, and it will not warn you. So the skill is not memorising commands; it is typing less, correcting faster and knowing how to stop.</p>

<h3>The keyboard shortcuts that matter</h3>
<table class="cmp">
<tr><th>Keys</th><th>What it does</th><th>Router twin</th></tr>
<tr><td><b>Tab</b></td><td>Completes a file or command name. Press twice to list the choices.</td><td>Tab or <code>?</code> in IOS</td></tr>
<tr><td><b>Up / Down arrow</b></td><td>Walks through your earlier commands.</td><td>Ctrl+P / Ctrl+N</td></tr>
<tr><td><b>Ctrl+R</b></td><td>Searches your history: type a few letters of an old command.</td><td>none</td></tr>
<tr><td><b>Ctrl+C</b></td><td><b>Stops</b> the running command.</td><td>Ctrl+Shift+6</td></tr>
<tr><td><b>Ctrl+L</b> or <code>clear</code></td><td>Clears the screen.</td><td>Ctrl+L</td></tr>
<tr><td><b>Ctrl+D</b></td><td>Logs out of the session.</td><td><code>exit</code></td></tr>
<tr><td><b>Ctrl+A / Ctrl+E</b></td><td>Jump to the start or end of the line.</td><td>same in IOS</td></tr>
</table>
<p>If a command seems frozen, for example a <code>ping</code> that never ends, press <b>Ctrl+C</b>. Linux <code>ping</code> runs forever by default, unlike a router's five pings.</p>

<h3>The prompt tells you who you are</h3>
<pre class="code">netadmin@nms01:~$     <span class="c"># normal user: the symbol is $</span>
root@nms01:~#         <span class="c"># root, the super-user: the symbol is #</span></pre>
<p>A <code>$</code> means ordinary user. A <code>#</code> means you are root and can delete anything. Be slower when you see <code>#</code>.</p>

<h3>Help is built in</h3>
<pre class="code">netadmin@nms01:~$ ls --help
netadmin@nms01:~$ man ls</pre>
<p><code>--help</code> prints a short summary. <code>man</code> opens the full manual page; press <b>q</b> to quit and <b>/word</b> then Enter to search inside it. This is the Linux version of <code>?</code>.</p>

<h3>Pipes in one page</h3>
<p>You already know the idea from IOS: <code>show running-config | include ntp</code> sends the long output through a filter. In Linux the same symbol, <b>the pipe <code>|</code></b>, sends the output of one command into the next one. Think of a conveyor belt: each machine does one small job and passes the result on.</p>
<pre class="out">netadmin@nms01:~$ ls incoming
r1-backup.cfg  r2-backup.cfg  sw1-backup.cfg
netadmin@nms01:~$ ls incoming | wc -l
3
netadmin@nms01:~$ ls incoming | grep r1
r1-backup.cfg</pre>
<p><code>wc -l</code> counts lines, so the answer is the number of files. <code>grep r1</code> keeps only the lines that contain <code>r1</code>. You can chain as many as you like.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="ls pipe grep pipe wc">
<rect x="15" y="30" width="150" height="60" rx="10" fill="#bae6fd"/><text x="90" y="55" text-anchor="middle" class="svg-ink" font-size="13">ls incoming</text><text x="90" y="73" text-anchor="middle" class="svg-muted" font-size="12">3 file names</text>
<rect x="245" y="30" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">grep r</text><text x="320" y="73" text-anchor="middle" class="svg-muted" font-size="12">keeps matching lines</text>
<rect x="475" y="30" width="150" height="60" rx="10" fill="#fde68a"/><text x="550" y="55" text-anchor="middle" class="svg-ink" font-size="13">wc -l</text><text x="550" y="73" text-anchor="middle" class="svg-muted" font-size="12">counts the lines</text>
<line x1="165" y1="60" x2="245" y2="60" stroke="#64748b" stroke-width="2"/><text x="205" y="52" text-anchor="middle" class="svg-accent" font-size="14">|</text>
<line x1="395" y1="60" x2="475" y2="60" stroke="#64748b" stroke-width="2"/><text x="435" y="52" text-anchor="middle" class="svg-accent" font-size="14">|</text>
</svg><p class="cap">Each command does one small job; the pipe hands the result to the next.</p></div>

<h3>Saving output: > and >></h3>
<pre class="out">netadmin@nms01:~$ ls incoming &gt; list.txt
netadmin@nms01:~$ cat list.txt
r1-backup.cfg
r2-backup.cfg
sw1-backup.cfg</pre>
<p><code>&gt;</code> sends output into a file and <b>replaces</b> what was there. <code>&gt;&gt;</code> <b>adds to the end</b>. Pipe sends output to another command; <code>&gt;</code> sends it to a file.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Using <code>&gt;</code> when you meant <code>&gt;&gt;</code>: the old file content is gone with no undo. (2) Pressing Ctrl+Z instead of Ctrl+C: it pauses the command instead of stopping it. (3) Running commands as root (<code>#</code>) when your normal user was enough. (4) Pasting a command from a web page without reading it first.</p></div>
<div class="exam"><p><b>Interview trap.</b> "What is the difference between <code>|</code> and <code>&gt;</code>?" The pipe connects two commands; the redirect writes into a file.</p></div>

<div class="scn"><h4>The log that was overwritten</h4><p>An engineer saved a day's alerts with <code>grep ERROR syslog &gt; alerts.txt</code>. The next day he ran the same line again for the new day and lost yesterday's list. Using <code>&gt;&gt;</code> would have appended it. A colleague restored the information from the log archive, but it took an hour.</p><p><b>Lesson:</b> think before you press Enter: do I want to replace or to add?</p></div>

<div class="iv"><p class="q">"What does the pipe do in Linux?"</p><p>It feeds the output of the command on the left into the command on the right as input. Give a router-flavoured example: <code>ls incoming | grep r1</code>, like <code>| include</code> on a Cisco box. Add that redirection to a file uses <code>&gt;</code> or <code>&gt;&gt;</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tab completes, the up arrow repeats, Ctrl+R searches history.</li>
<li>Ctrl+C stops a running command; Ctrl+D logs out.</li>
<li>$ is a normal user, # is root: slow down at #.</li>
<li>--help and man are your built-in manual.</li>
<li>Pipe sends output to a command; > replaces a file; >> appends.</li>
</ul></div>
`,hi:`
<p>Agle chapters pipes aur lambe commands use karein, usse pehle aapko paanch aadatein chahiye jo terminal ko tez aur safe banati hain: <b>Tab completion, history, command rokna, help maangna, aur pipe</b>. Har ek ek minute mein seekhi jaati hai aur ghante bachati hai.</p>

<h3>Analogy: terminal ek bahut literal assistant se chat hai</h3>
<p>Shell bilkul wahi karta hai jo aap type karte ho. Woh andaza nahi lagata, aur warn nahi karta. Isliye skill commands ratna nahi hai; kam type karna, jaldi sudhaarna aur rokna aana hai.</p>

<h3>Zaroori keyboard shortcuts</h3>
<table class="cmp">
<tr><th>Keys</th><th>Kya karta hai</th><th>Router ka jodidaar</th></tr>
<tr><td><b>Tab</b></td><td>File ya command ka naam poora karta hai. Do baar dabao to choices ki list.</td><td>IOS mein Tab ya <code>?</code></td></tr>
<tr><td><b>Up / Down arrow</b></td><td>Pehle ke commands par chalta hai.</td><td>Ctrl+P / Ctrl+N</td></tr>
<tr><td><b>Ctrl+R</b></td><td>History search karta hai: purane command ke kuch letters type karo.</td><td>koi nahi</td></tr>
<tr><td><b>Ctrl+C</b></td><td>Chal raha command <b>rokta</b> hai.</td><td>Ctrl+Shift+6</td></tr>
<tr><td><b>Ctrl+L</b> ya <code>clear</code></td><td>Screen saaf karta hai.</td><td>Ctrl+L</td></tr>
<tr><td><b>Ctrl+D</b></td><td>Session se logout.</td><td><code>exit</code></td></tr>
<tr><td><b>Ctrl+A / Ctrl+E</b></td><td>Line ke shuru ya end par jao.</td><td>IOS mein bhi wahi</td></tr>
</table>
<p>Command atka hua lage, jaise <code>ping</code> jo khatam nahi hota, to <b>Ctrl+C</b> dabao. Linux ka <code>ping</code> default mein hamesha chalta rehta hai, router ke paanch pings ki tarah nahi.</p>

<h3>Prompt batata hai aap kaun ho</h3>
<pre class="code">netadmin@nms01:~$     <span class="c"># normal user: symbol $</span>
root@nms01:~#         <span class="c"># root, super-user: symbol #</span></pre>
<p><code>$</code> ka matlab aam user. <code>#</code> ka matlab aap root ho aur kuch bhi delete kar sakte ho. <code>#</code> dikhe to dheere chalo.</p>

<h3>Help built-in hai</h3>
<pre class="code">netadmin@nms01:~$ ls --help
netadmin@nms01:~$ man ls</pre>
<p><code>--help</code> chhota summary print karta hai. <code>man</code> poora manual page kholta hai; <b>q</b> se bahar aao aur andar search ke liye <b>/word</b> phir Enter. Yeh <code>?</code> ka Linux version hai.</p>

<h3>Pipes ek page mein</h3>
<p>Idea aap IOS se jaante ho: <code>show running-config | include ntp</code> lambe output ko filter se guzaarta hai. Linux mein wahi symbol, <b>pipe <code>|</code></b>, ek command ka output agle command mein bhejta hai. Conveyor belt socho: har machine ek chhota kaam karti hai aur result aage deti hai.</p>
<pre class="out">netadmin@nms01:~$ ls incoming
r1-backup.cfg  r2-backup.cfg  sw1-backup.cfg
netadmin@nms01:~$ ls incoming | wc -l
3
netadmin@nms01:~$ ls incoming | grep r1
r1-backup.cfg</pre>
<p><code>wc -l</code> lines ginta hai, isliye jawab files ki ginti hai. <code>grep r1</code> sirf woh lines rakhta hai jinme <code>r1</code> hai. Aap jitne chahe chain kar sakte ho.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="ls pipe grep pipe wc">
<rect x="15" y="30" width="150" height="60" rx="10" fill="#bae6fd"/><text x="90" y="55" text-anchor="middle" class="svg-ink" font-size="13">ls incoming</text><text x="90" y="73" text-anchor="middle" class="svg-muted" font-size="12">3 file names</text>
<rect x="245" y="30" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">grep r</text><text x="320" y="73" text-anchor="middle" class="svg-muted" font-size="12">matching lines rakho</text>
<rect x="475" y="30" width="150" height="60" rx="10" fill="#fde68a"/><text x="550" y="55" text-anchor="middle" class="svg-ink" font-size="13">wc -l</text><text x="550" y="73" text-anchor="middle" class="svg-muted" font-size="12">lines gino</text>
<line x1="165" y1="60" x2="245" y2="60" stroke="#64748b" stroke-width="2"/><text x="205" y="52" text-anchor="middle" class="svg-accent" font-size="14">|</text>
<line x1="395" y1="60" x2="475" y2="60" stroke="#64748b" stroke-width="2"/><text x="435" y="52" text-anchor="middle" class="svg-accent" font-size="14">|</text>
</svg><p class="cap">Har command ek chhota kaam karta hai; pipe result agle ko deta hai.</p></div>

<h3>Output save karna: > aur >></h3>
<pre class="out">netadmin@nms01:~$ ls incoming &gt; list.txt
netadmin@nms01:~$ cat list.txt
r1-backup.cfg
r2-backup.cfg
sw1-backup.cfg</pre>
<p><code>&gt;</code> output ko file mein bhejta hai aur jo pehle tha use <b>badal deta hai</b>. <code>&gt;&gt;</code> <b>end mein jod deta hai</b>. Pipe output doosre command ko bhejta hai; <code>&gt;</code> file ko.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) <code>&gt;&gt;</code> ki jagah <code>&gt;</code> use karna: purana content chala gaya, undo nahi. (2) Ctrl+C ki jagah Ctrl+Z dabana: command ruk nahi, pause ho jaata hai. (3) Normal user kaafi tha phir bhi root (<code>#</code>) se commands chalana. (4) Web page se command bina padhe paste karna.</p></div>
<div class="exam"><p><b>Interview trap.</b> "<code>|</code> aur <code>&gt;</code> mein kya fark hai?" Pipe do commands jodta hai; redirect file mein likhta hai.</p></div>

<div class="scn"><h4>Woh log jo overwrite ho gaya</h4><p>Ek engineer ne din ke alerts <code>grep ERROR syslog &gt; alerts.txt</code> se save kiye. Agle din naye din ke liye wahi line dobara chalayi aur kal ki list kho di. <code>&gt;&gt;</code> use hota to woh jud jaati. Ek colleague ne log archive se information wapas nikali, par ek ghanta laga.</p><p><b>Lesson:</b> Enter dabane se pehle socho: replace karna hai ya add?</p></div>

<div class="iv"><p class="q">"Linux mein pipe kya karta hai?"</p><p>Yeh left wale command ka output right wale command ko input ki tarah deta hai. Router jaisa example do: <code>ls incoming | grep r1</code>, jaise Cisco box par <code>| include</code>. Yeh bhi jodo ki file mein redirection <code>&gt;</code> ya <code>&gt;&gt;</code> se hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tab poora karta hai, up arrow repeat, Ctrl+R history search.</li>
<li>Ctrl+C chal raha command rokta hai; Ctrl+D logout.</li>
<li>$ normal user, # root: # par dheere chalo.</li>
<li>--help aur man aapka built-in manual hain.</li>
<li>Pipe output command ko bhejta hai; > file replace; >> append.</li>
</ul></div>
`}};export{e as default};