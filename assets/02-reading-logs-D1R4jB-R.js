var e=e=>`<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Anatomy of a log line">
<rect x="10" y="30" width="130" height="50" rx="8" fill="#fde68a"/><text x="75" y="52" text-anchor="middle" class="svg-ink" font-size="13">Sep 29 09:00:00</text><text x="75" y="70" text-anchor="middle" class="svg-muted" font-size="11">time</text>
<rect x="150" y="30" width="90" height="50" rx="8" fill="#bae6fd"/><text x="195" y="52" text-anchor="middle" class="svg-ink" font-size="13">syslog01</text><text x="195" y="70" text-anchor="middle" class="svg-muted" font-size="11">host</text>
<rect x="250" y="30" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="315" y="52" text-anchor="middle" class="svg-ink" font-size="13">sshd[701]</text><text x="315" y="70" text-anchor="middle" class="svg-muted" font-size="11">program[pid]</text>
<rect x="390" y="30" width="240" height="50" rx="8" fill="#bbf7d0"/><text x="510" y="52" text-anchor="middle" class="svg-ink" font-size="13">Server listening on 0.0.0.0 port 22.</text><text x="510" y="70" text-anchor="middle" class="svg-muted" font-size="11">message</text>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code">netadmin@syslog01:~$ head -3 /var/log/syslog</pre>
<pre class="out">Sep 29 09:00:00 syslog01 systemd[1]: Starting rsyslog.service - System Logging Service...
Sep 29 09:00:00 syslog01 rsyslogd[612]: imuxsock: Acquired UNIX socket '/run/systemd/journal/syslog' (fd 3) from systemd.  [v8.2312.0]
Sep 29 09:00:00 syslog01 rsyslogd[612]: [origin software="rsyslogd" swVersion="8.2312.0" x-pid="612" x-info="<span class="hl">...</span>"] start</pre>`,n=`<pre class="code">netadmin@syslog01:~$ tail -3 /var/log/auth.log
netadmin@syslog01:~$ grep -c sshd /var/log/auth.log
netadmin@syslog01:~$ wc -l /var/log/syslog</pre>
<pre class="out">Sep 29 09:00:00 syslog01 systemd[1]: Starting ssh.service - OpenBSD Secure Shell server...
Sep 29 09:00:00 syslog01 sshd[701]: <span class="hl">Server listening on 0.0.0.0 port 22.</span>
Sep 29 09:00:00 syslog01 systemd[1]: Started ssh.service - OpenBSD Secure Shell server.
1
7 /var/log/syslog</pre>`,r=`<pre class="code"><span class="c"># Reference commands (not run in the simulator)</span>
tail -f /var/log/syslog          <span class="c"># follow new lines live; stop with Ctrl+C</span>
less /var/log/syslog             <span class="c"># pager: Space = next page, /text = search, q = quit</span>
grep -i error /var/log/syslog    <span class="c"># -i ignores upper/lower case</span>
sudo zcat /var/log/syslog.2.gz   <span class="c"># read a rotated, compressed log</span></pre>`,i={id:`reading-logs`,h:{en:`Reading log files: tail, head, grep and wc`,hi:`Log files padhna: tail, head, grep aur wc`},body:{en:`
<p>A log file is just a text file, so you read it with the same tools you use for any text. The skill is not the command; it is reading a line quickly and knowing which five lines out of fifty thousand matter. This chapter teaches both.</p>

<h3>Anatomy of one log line</h3>
<p>Classic syslog lines on Ubuntu have four parts: the <b>time</b> the line was received, the <b>host</b> name of the machine, the <b>program</b> that wrote it (with its process id, or PID, in square brackets), and the free-text <b>message</b>.</p>
`+e(`Time, host, program[pid], then the message. Every syslog line follows this pattern.`)+`
<p>The PID is useful: <code>sshd[701]</code> is the SSH server process number 701. If the same PID appears in ten lines, they belong to one process.</p>

<h3>Four reading commands</h3>
<dl class="terms">
<dt>cat FILE</dt><dd>Prints the whole file. Fine for 10 lines, a bad idea for 100,000.</dd>
<dt>head -n N FILE</dt><dd>Prints the first N lines. <code>head -3</code> is short for <code>head -n 3</code>. Use it to see when a log starts.</dd>
<dt>tail -n N FILE</dt><dd>Prints the last N lines, the newest events. The most used log command.</dd>
<dt>grep WORD FILE</dt><dd>Prints only lines that contain WORD. <code>grep -c</code> counts matching lines instead of printing them; <code>grep -n</code> adds line numbers.</dd>
</dl>
<p>Start with <code>head</code> to see the oldest lines of the main log:</p>
`+t+`
<p>This is the boot of the logging service itself. Notice <code>rsyslogd[612]</code>: the logger writes its own start-up into the log. The line mentions the program version (the web address inside x-info is shortened to dots here), which is handy when a bug is version-specific.</p>
<p>Now the newest lines of the authentication log, a count, and a line count:</p>
`+n+`
<ul>
<li><code>tail -3</code> showed the last three events: SSH starting, listening on port 22, started.</li>
<li><code>grep -c sshd</code> printed <code>1</code>: exactly one line contains the word sshd.</li>
<li><code>wc -l</code> counts lines (<b>w</b>ord <b>c</b>ount, <code>-l</code> for lines): the file has 7 lines.</li>
</ul>

<h3>Combining commands with a pipe</h3>
<p>The pipe character <code>|</code> sends the output of one command into the next. <code>grep ERROR /var/log/syslog | tail -5</code> means: find all lines with ERROR, then show only the last five. Chains like this answer almost every question: "what happened to interface Gi0/1 in the last hour?" becomes <code>grep Gi0/1 file | tail</code>.</p>
`+r+`

<div class="eg"><p><b>Worked example.</b> A colleague says "SSH was down at 09:00." You run <code>sudo grep sshd /var/log/auth.log | tail -5</code>. The lines show <code>Server listening on 0.0.0.0 port 22</code> at 09:00:00, so SSH was just starting then. You answer with evidence, not memory. If the file were huge, <code>grep -c</code> first tells you how many lines to expect.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Running <code>cat</code> on a huge log and flooding the screen, or forgetting <code>sudo</code> and reading <i>Permission denied</i> as "the log is empty". Also: <code>grep</code> is case sensitive, so <code>error</code> will not match <code>ERROR</code> unless you add <code>-i</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>head</code> shows the oldest lines, <code>tail</code> the newest. New events are appended to the end of a log file, so the answer to "what just happened?" is always <code>tail</code>.</p></div>

<div class="scn"><h4>The ten-second answer</h4><p>During a call, a manager asked how many times the sales switch had restarted that month. The engineer ran <code>grep -c "restart" file</code> on the server log and answered "four" before the manager finished the question. On the router itself the buffer only held the last day.</p><p><b>Lesson:</b> a searchable text file is a database you already own.</p></div>

<div class="iv"><p class="q">"How do you find the latest errors in a large log file?"</p><p>Use <code>grep</code> to filter and <code>tail</code> to limit, for example <code>grep -i error /var/log/syslog | tail -20</code>, and <code>tail -f</code> to watch live. Say that you check the time range first, use <code>sudo</code> for private logs, and use <code>zcat</code> for rotated .gz files.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A syslog line is time, host, program[pid], message.</li>
<li><code>head</code> reads the beginning, <code>tail</code> the end, <code>grep</code> filters, <code>wc -l</code> counts lines.</li>
<li>The pipe <code>|</code> chains commands: filter first, then limit.</li>
<li><code>grep -i</code> ignores case, <code>-c</code> counts, <code>-n</code> shows line numbers.</li>
<li>Permission denied on a log usually means you need <code>sudo</code>.</li>
</ul></div>
`,hi:`
<p>Log file bas ek text file hai, isliye use aap wahi tools se padhte ho jo kisi bhi text ke liye use karte ho. Skill command nahi hai; skill hai ek line ko jaldi padhna aur jaan-na ki pachaas hazaar lines mein se kaunsi paanch matter karti hain. Yeh chapter dono sikhata hai.</p>

<h3>Ek log line ki anatomy</h3>
<p>Ubuntu par classic syslog lines ke chaar hisse hote hain: line kab receive hui woh <b>time</b>, machine ka <b>host</b> naam, jis <b>program</b> ne likhi (square brackets mein process id, yaani PID, ke saath), aur free-text <b>message</b>.</p>
`+e(`Time, host, program[pid], phir message. Har syslog line isi pattern par chalti hai.`)+`
<p>PID kaam ki cheez hai: <code>sshd[701]</code> SSH server process number 701 hai. Agar wahi PID das lines mein aaye, to woh ek hi process ki hain.</p>

<h3>Padhne ke chaar commands</h3>
<dl class="terms">
<dt>cat FILE</dt><dd>Poori file print karta hai. 10 lines ke liye theek, 100,000 ke liye buri idea.</dd>
<dt>head -n N FILE</dt><dd>Pehli N lines print karta hai. <code>head -3</code>, <code>head -n 3</code> ka short hai. Log kab shuru hua yeh dekhne ke liye.</dd>
<dt>tail -n N FILE</dt><dd>Aakhri N lines print karta hai, sabse naye events. Sabse zyada use hone wala log command.</dd>
<dt>grep WORD FILE</dt><dd>Sirf woh lines print karta hai jinme WORD hai. <code>grep -c</code> lines print karne ki jagah matching lines gintata hai; <code>grep -n</code> line numbers jodta hai.</dd>
</dl>
<p>Main log ki sabse purani lines dekhne ke liye <code>head</code> se shuru karo:</p>
`+t+`
<p>Yeh logging service ka apna boot hai. <code>rsyslogd[612]</code> dekho: logger apna start-up khud log mein likhta hai. Line mein program ka version bhi hai (x-info ke andar ka web address yahan dots se chhota kiya gaya hai), jo tab kaam aata hai jab bug version-specific ho.</p>
<p>Ab authentication log ki sabse nayi lines, ek count, aur line count:</p>
`+n+`
<ul>
<li><code>tail -3</code> ne aakhri teen events dikhaye: SSH start ho raha hai, port 22 par sun raha hai, started.</li>
<li><code>grep -c sshd</code> ne <code>1</code> print kiya: sirf ek line mein sshd shabd hai.</li>
<li><code>wc -l</code> lines gintata hai (<b>w</b>ord <b>c</b>ount, lines ke liye <code>-l</code>): file mein 7 lines hain.</li>
</ul>

<h3>Pipe se commands jodna</h3>
<p>Pipe character <code>|</code> ek command ka output agle command mein bhejta hai. <code>grep ERROR /var/log/syslog | tail -5</code> ka matlab: ERROR wali saari lines dhoondho, phir sirf aakhri paanch dikhao. Aise chains lagbhag har sawaal ka jawab dete hain: "pichhle ghante mein interface Gi0/1 ka kya hua?" ban jaata hai <code>grep Gi0/1 file | tail</code>.</p>
`+r+`

<div class="eg"><p><b>Worked example.</b> Ek colleague kehta hai "09:00 par SSH down tha." Aap <code>sudo grep sshd /var/log/auth.log | tail -5</code> chalate ho. Lines 09:00:00 par <code>Server listening on 0.0.0.0 port 22</code> dikhati hain, yaani tab SSH abhi start ho raha tha. Aap yaadasht se nahi, saboot se jawab dete ho. File badi ho to <code>grep -c</code> pehle batata hai kitni lines expect karni hain.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Badi log par <code>cat</code> chala kar screen bhar dena, ya <code>sudo</code> bhool kar <i>Permission denied</i> ko "log khali hai" samajhna. Aur: <code>grep</code> case sensitive hai, isliye <code>error</code>, <code>ERROR</code> se match nahi karega jab tak <code>-i</code> na lagao.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>head</code> sabse purani lines dikhata hai, <code>tail</code> sabse nayi. Naye events log file ke end mein append hote hain, isliye "abhi kya hua?" ka jawab hamesha <code>tail</code> hai.</p></div>

<div class="scn"><h4>Das second ka jawab</h4><p>Ek call ke dauraan manager ne poochha ki sales switch is mahine kitni baar restart hua. Engineer ne server log par <code>grep -c "restart" file</code> chalaya aur manager ka sawaal khatam hone se pehle "chaar" bol diya. Router par buffer mein sirf pichhla ek din tha.</p><p><b>Lesson:</b> searchable text file ek database hai jo aapke paas pehle se hai.</p></div>

<div class="iv"><p class="q">"Badi log file mein latest errors kaise dhoondhte ho?"</p><p><code>grep</code> se filter karo aur <code>tail</code> se limit karo, jaise <code>grep -i error /var/log/syslog | tail -20</code>, aur live dekhne ke liye <code>tail -f</code>. Kaho ki pehle time range dekhte ho, private logs ke liye <code>sudo</code> use karte ho, aur rotated .gz files ke liye <code>zcat</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Syslog line matlab time, host, program[pid], message.</li>
<li><code>head</code> shuruaat padhta hai, <code>tail</code> end, <code>grep</code> filter karta hai, <code>wc -l</code> lines gintata hai.</li>
<li>Pipe <code>|</code> commands jodta hai: pehle filter, phir limit.</li>
<li><code>grep -i</code> case ignore karta hai, <code>-c</code> gintata hai, <code>-n</code> line numbers dikhata hai.</li>
<li>Log par Permission denied ka matlab aksar <code>sudo</code> chahiye.</li>
</ul></div>
`}};export{i as default};