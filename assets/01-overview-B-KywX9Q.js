var e={id:`overview`,h:{en:`Why logs matter: what you will learn and the big picture`,hi:`Logs kyun zaroori hain: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn to answer questions from log files in seconds: view the start and end of a file, search it with <code>grep</code>, join small tools with pipes, save results with redirection, count and rank with <code>sort</code> and <code>uniq</code>, and pick columns with <code>cut</code> and <code>awk</code>. By the end you can turn "the network keeps dropping" into "interface Gi0/2 on BLR-EDGE-R2 flapped seven times, here is the proof".</p>
<p><b>Prerequisites.</b> The previous module, <b>lx-shell</b>: prompt, paths, <code>ls</code>, <code>cd</code>, <code>cat</code>, <code>cp</code>, wildcards and quotes. No programming is needed. Every command is explained step by step.</p>

<h3>Analogy: a diary and an assembly line</h3>
<p>A log file is a <b>diary kept by a machine</b>. Every router writes a line whenever something happens: an interface goes down, someone logs in, a neighbour is lost. A busy network writes thousands of lines a day, far too many to read. The Linux text tools are like an <b>assembly line</b>. One station picks only the lines you want, the next station cuts out one column, the next sorts them, the next counts duplicates. The conveyor belt between the stations is the <b>pipe</b>, written <code>|</code>. Each tool is small and does one job; the power is in joining them.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Pipeline of tools">
<rect x="10" y="50" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="55" y="72" text-anchor="middle" class="svg-ink" font-size="13">log file</text><text x="55" y="90" text-anchor="middle" class="svg-muted" font-size="11">30 lines</text>
<rect x="130" y="50" width="90" height="50" rx="8" fill="#bae6fd"/><text x="175" y="72" text-anchor="middle" class="svg-ink" font-size="13">grep</text><text x="175" y="90" text-anchor="middle" class="svg-muted" font-size="11">pick lines</text>
<rect x="250" y="50" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="295" y="72" text-anchor="middle" class="svg-ink" font-size="13">awk</text><text x="295" y="90" text-anchor="middle" class="svg-muted" font-size="11">pick column</text>
<rect x="370" y="50" width="90" height="50" rx="8" fill="#fde68a"/><text x="415" y="72" text-anchor="middle" class="svg-ink" font-size="13">sort | uniq</text><text x="415" y="90" text-anchor="middle" class="svg-muted" font-size="11">count</text>
<rect x="490" y="50" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="555" y="72" text-anchor="middle" class="svg-ink" font-size="13">answer</text><text x="555" y="90" text-anchor="middle" class="svg-muted" font-size="11">8  10.20.0.1</text>
<line x1="100" y1="75" x2="130" y2="75" stroke="#64748b" stroke-width="2"/><line x1="220" y1="75" x2="250" y2="75" stroke="#64748b" stroke-width="2"/><line x1="340" y1="75" x2="370" y2="75" stroke="#64748b" stroke-width="2"/><line x1="460" y1="75" x2="490" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="115" y="40" text-anchor="middle" class="svg-accent" font-size="14">|</text><text x="235" y="40" text-anchor="middle" class="svg-accent" font-size="14">|</text><text x="355" y="40" text-anchor="middle" class="svg-accent" font-size="14">|</text><text x="475" y="40" text-anchor="middle" class="svg-accent" font-size="14">|</text>
</svg><p class="cap">A pipeline: each tool passes its output to the next.</p></div>

<h3>Where the logs come from</h3>
<p>Routers and switches send messages to a central <b>syslog server</b>, usually a Linux box running <b>rsyslog</b>. The server writes them into files under <code>/var/log</code>. Your lab server NMS01 collects every router's log in one file, <code>/var/log/remote/routers.log</code>. The jump host keeps its own login records in <code>/var/log/auth.log</code>. Both are plain text, so the same tools read both. Here is the real start and end of the router log:</p>
<pre class="out">netadmin@nms01:~$ head -n 3 /var/log/remote/routers.log
Sep 29 06:02:37 10.10.0.1 121: *Sep 29 06:02:37.809: %SYS-5-CONFIG_I: Configured from console by ravi on vty0 (10.99.0.50)
Sep 29 06:06:08 10.20.0.1 411: *Sep 29 06:06:08.616: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/2, changed state to down
Sep 29 06:06:17 10.20.0.1 412: *Sep 29 06:06:17.949: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/2, changed state to up
netadmin@nms01:~$ tail -n 3 /var/log/remote/routers.log
Sep 29 06:52:30 10.20.0.1 426: *Sep 29 06:52:30.550: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/2, changed state to down
Sep 29 06:52:39 10.20.0.1 427: *Sep 29 06:52:39.883: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/2, changed state to up
Sep 29 06:53:29 10.40.3.1 40: *Sep 29 06:53:29.733: %LINK-3-UPDOWN: Interface GigabitEthernet0/3, changed state to down
netadmin@nms01:~$ wc -l /var/log/remote/routers.log
30 /var/log/remote/routers.log</pre>
<p>Thirty lines here, but a production file has millions. Read one line carefully, left to right:</p>
<table class="cmp"><tr><th>Field</th><th>Example</th><th>Meaning</th></tr>
<tr><td>1-3</td><td><code>Sep 29 06:06:08</code></td><td>time the syslog server received it</td></tr>
<tr><td>4</td><td><code>10.20.0.1</code></td><td>source: the router that sent it</td></tr>
<tr><td>5</td><td><code>411:</code></td><td>sequence number added by the router</td></tr>
<tr><td>6</td><td><code>*Sep 29 06:06:08.616:</code></td><td>the router's own time stamp</td></tr>
<tr><td>7</td><td><code>%LINEPROTO-5-UPDOWN:</code></td><td>facility LINEPROTO, severity 5, mnemonic UPDOWN</td></tr>
<tr><td>rest</td><td><code>Line protocol on Interface ...</code></td><td>the human-readable message</td></tr></table>
<p>The digit inside <code>%FACILITY-SEVERITY-MNEMONIC</code> is the <b>severity</b>: 0 emergency, 1 alert, 2 critical, 3 error, 4 warning, 5 notice, 6 informational, 7 debug. A <code>%LINK-3-UPDOWN</code> is an error-level message, <code>%LINEPROTO-5-UPDOWN</code> is a notice. The second file in the lab is <code>~/devices.csv</code>, which maps IP addresses to host names so that you can turn <code>10.20.0.1</code> into <code>BLR-EDGE-R2</code>.</p>

<div class="eg"><p><b>Worked example.</b> Which router sent the most messages? Without any tool you would count 30 lines by eye. With tools it is one line, which you will understand by chapter 4: <code>awk '{print $4}' /var/log/remote/routers.log | sort | uniq -c | sort -rn</code>. The simulator answers: <code>17 10.20.0.1</code>, <code>7 10.40.3.1</code>, <code>4 10.10.0.1</code>, <code>2 10.50.0.1</code>. BLR-EDGE-R2 is the noisiest router, and that is where the investigation begins.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Scrolling through a log instead of searching it. (2) Opening a huge log with an editor; use viewers like <code>less</code>. (3) Trusting one match: the router and the syslog server both have time stamps and they can differ by seconds, so always note which clock you are reading. (4) Forgetting that logs may contain passwords or user names: share only what you must.</p></div>
<div class="exam"><p><b>Exam trap.</b> The number inside <code>%FACILITY-N-MNEMONIC</code> is the severity, and a LOWER number means MORE severe. Severity 0 is an emergency; severity 7 is debug.</p></div>

<div class="scn"><h4>"The network keeps dropping"</h4><p>Users in Bengaluru complained all morning. Nobody could say what was dropping. An engineer opened the syslog file on NMS01 and used three commands: <code>grep</code> to keep only the "state to down" lines, <code>awk</code> to take the router address, and <code>sort | uniq -c</code> to count. The answer took thirty seconds: the Bengaluru router had lost an interface eight times in an hour, seven of them on the same port. A cable was replaced, and the complaints stopped.</p><p><b>Lesson:</b> a vague complaint becomes a precise fact when you count log lines.</p></div>

<div class="iv"><p class="q">"How do you find out which device is causing problems from a large syslog file?"</p><p>I filter the file with <code>grep</code> for the event type, extract the device column with <code>awk</code> or <code>cut</code>, then <code>sort | uniq -c | sort -rn</code> to count and rank. It is a pipeline of small tools. I then check the top device in detail, and keep the commands in the ticket.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Logs are plain text files under <code>/var/log</code>; routers send theirs to a syslog server.</li>
<li>Small tools joined by pipes beat scrolling.</li>
<li>A syslog line has time, source, sequence, facility-severity-mnemonic and message.</li>
<li>Severity 0 is the worst (emergency); 7 is debug.</li>
<li>Lab files: <code>/var/log/remote/routers.log</code>, <code>~/devices.csv</code>, <code>/var/log/auth.log</code>.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap log files se sawaalon ke jawab seconds mein dena seekhoge: file ki shuruaat aur end dekhna, <code>grep</code> se search karna, pipes se chhote tools jodna, redirection se results save karna, <code>sort</code> aur <code>uniq</code> se ginna aur rank karna, aur <code>cut</code> aur <code>awk</code> se columns chunna. Ant tak aap "network baar-baar girta hai" ko "BLR-EDGE-R2 ka interface Gi0/2 saat baar flap hua, yeh saboot hai" mein badal sakoge.</p>
<p><b>Prerequisites.</b> Pichhla module, <b>lx-shell</b>: prompt, paths, <code>ls</code>, <code>cd</code>, <code>cat</code>, <code>cp</code>, wildcards aur quotes. Programming zaroori nahi. Har command step by step samjhaya hai.</p>

<h3>Analogy: ek diary aur ek assembly line</h3>
<p>Log file ek <b>machine ki likhi diary</b> hai. Jab bhi kuch hota hai, har router ek line likhta hai: interface down hua, kisi ne login kiya, neighbour kho gaya. Busy network din mein hazaaron lines likhta hai, padhne ke liye bahut zyada. Linux ke text tools ek <b>assembly line</b> jaise hain. Ek station aapki chahi lines chunta hai, agla ek column kaat leta hai, agla sort karta hai, agla duplicates ginta hai. Stations ke beech ka conveyor belt <b>pipe</b> hai, jo <code>|</code> likha jaata hai. Har tool chhota hai aur ek hi kaam karta hai; taakat unhe jodne mein hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Tools ki pipeline">
<rect x="10" y="50" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="55" y="72" text-anchor="middle" class="svg-ink" font-size="13">log file</text><text x="55" y="90" text-anchor="middle" class="svg-muted" font-size="11">30 lines</text>
<rect x="130" y="50" width="90" height="50" rx="8" fill="#bae6fd"/><text x="175" y="72" text-anchor="middle" class="svg-ink" font-size="13">grep</text><text x="175" y="90" text-anchor="middle" class="svg-muted" font-size="11">lines chuno</text>
<rect x="250" y="50" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="295" y="72" text-anchor="middle" class="svg-ink" font-size="13">awk</text><text x="295" y="90" text-anchor="middle" class="svg-muted" font-size="11">column chuno</text>
<rect x="370" y="50" width="90" height="50" rx="8" fill="#fde68a"/><text x="415" y="72" text-anchor="middle" class="svg-ink" font-size="13">sort | uniq</text><text x="415" y="90" text-anchor="middle" class="svg-muted" font-size="11">ginti</text>
<rect x="490" y="50" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="555" y="72" text-anchor="middle" class="svg-ink" font-size="13">jawab</text><text x="555" y="90" text-anchor="middle" class="svg-muted" font-size="11">8  10.20.0.1</text>
<line x1="100" y1="75" x2="130" y2="75" stroke="#64748b" stroke-width="2"/><line x1="220" y1="75" x2="250" y2="75" stroke="#64748b" stroke-width="2"/><line x1="340" y1="75" x2="370" y2="75" stroke="#64748b" stroke-width="2"/><line x1="460" y1="75" x2="490" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="115" y="40" text-anchor="middle" class="svg-accent" font-size="14">|</text><text x="235" y="40" text-anchor="middle" class="svg-accent" font-size="14">|</text><text x="355" y="40" text-anchor="middle" class="svg-accent" font-size="14">|</text><text x="475" y="40" text-anchor="middle" class="svg-accent" font-size="14">|</text>
</svg><p class="cap">Ek pipeline: har tool apna output agle ko deta hai.</p></div>

<h3>Logs aate kahan se hain</h3>
<p>Routers aur switches ek central <b>syslog server</b> ko messages bhejte hain, jo aksar <b>rsyslog</b> chalane wala Linux box hota hai. Server unhe <code>/var/log</code> ke neeche files mein likhta hai. Aapka lab server NMS01 har router ka log ek file mein collect karta hai, <code>/var/log/remote/routers.log</code>. Jump host apne login records <code>/var/log/auth.log</code> mein rakhta hai. Dono plain text hain, isliye wahi tools dono padhte hain. Router log ki real shuruaat aur end:</p>
<pre class="out">netadmin@nms01:~$ head -n 3 /var/log/remote/routers.log
Sep 29 06:02:37 10.10.0.1 121: *Sep 29 06:02:37.809: %SYS-5-CONFIG_I: Configured from console by ravi on vty0 (10.99.0.50)
Sep 29 06:06:08 10.20.0.1 411: *Sep 29 06:06:08.616: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/2, changed state to down
Sep 29 06:06:17 10.20.0.1 412: *Sep 29 06:06:17.949: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/2, changed state to up
netadmin@nms01:~$ tail -n 3 /var/log/remote/routers.log
Sep 29 06:52:30 10.20.0.1 426: *Sep 29 06:52:30.550: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/2, changed state to down
Sep 29 06:52:39 10.20.0.1 427: *Sep 29 06:52:39.883: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/2, changed state to up
Sep 29 06:53:29 10.40.3.1 40: *Sep 29 06:53:29.733: %LINK-3-UPDOWN: Interface GigabitEthernet0/3, changed state to down
netadmin@nms01:~$ wc -l /var/log/remote/routers.log
30 /var/log/remote/routers.log</pre>
<p>Yahan tees lines hain, par production file mein lakhon hoti hain. Ek line ko left se right dhyan se padho:</p>
<table class="cmp"><tr><th>Field</th><th>Example</th><th>Matlab</th></tr>
<tr><td>1-3</td><td><code>Sep 29 06:06:08</code></td><td>syslog server ko jab mila woh time</td></tr>
<tr><td>4</td><td><code>10.20.0.1</code></td><td>source: jis router ne bheja</td></tr>
<tr><td>5</td><td><code>411:</code></td><td>router ka jodha hua sequence number</td></tr>
<tr><td>6</td><td><code>*Sep 29 06:06:08.616:</code></td><td>router ka apna time stamp</td></tr>
<tr><td>7</td><td><code>%LINEPROTO-5-UPDOWN:</code></td><td>facility LINEPROTO, severity 5, mnemonic UPDOWN</td></tr>
<tr><td>baaki</td><td><code>Line protocol on Interface ...</code></td><td>insaan ke padhne wala message</td></tr></table>
<p><code>%FACILITY-SEVERITY-MNEMONIC</code> ke andar ka digit <b>severity</b> hai: 0 emergency, 1 alert, 2 critical, 3 error, 4 warning, 5 notice, 6 informational, 7 debug. <code>%LINK-3-UPDOWN</code> error-level message hai, <code>%LINEPROTO-5-UPDOWN</code> notice hai. Lab ki doosri file <code>~/devices.csv</code> hai, jo IP addresses ko host names se map karti hai taaki <code>10.20.0.1</code> ko <code>BLR-EDGE-R2</code> mein badal sako.</p>

<div class="eg"><p><b>Worked example.</b> Kaunse router ne sabse zyada messages bheje? Bina tool ke aap 30 lines aankh se ginte. Tools ke saath yeh ek line hai, jo aap chapter 4 tak samajh loge: <code>awk '{print $4}' /var/log/remote/routers.log | sort | uniq -c | sort -rn</code>. Simulator jawab deta hai: <code>17 10.20.0.1</code>, <code>7 10.40.3.1</code>, <code>4 10.10.0.1</code>, <code>2 10.50.0.1</code>. BLR-EDGE-R2 sabse noisy router hai, aur investigation wahin se shuru hoti hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Log ko search karne ke bajaye scroll karna. (2) Bade log ko editor mein kholna; <code>less</code> jaise viewers use karo. (3) Ek match par bharosa: router aur syslog server dono ke time stamps hote hain aur seconds se alag ho sakte hain, isliye hamesha note karo kaunsi clock padh rahe ho. (4) Yeh bhoolna ki logs mein passwords ya user names ho sakte hain: sirf wahi share karo jo zaroori ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>%FACILITY-N-MNEMONIC</code> ke andar ka number severity hai, aur KAM number matlab ZYADA severe. Severity 0 emergency hai; severity 7 debug.</p></div>

<div class="scn"><h4>"Network baar-baar girta hai"</h4><p>Bengaluru ke users subah se shikayat kar rahe the. Kisi ko pata nahi tha kya gir raha hai. Engineer ne NMS01 par syslog file kholi aur teen commands use kiye: sirf "state to down" lines rakhne ke liye <code>grep</code>, router address lene ke liye <code>awk</code>, aur ginne ke liye <code>sort | uniq -c</code>. Jawab tees second mein aaya: Bengaluru router ka interface ek ghante mein aath baar down hua tha, saat baar usi port par. Ek cable badli gayi, aur shikayatein band ho gayi.</p><p><b>Lesson:</b> log lines ginne par vague shikayat ek precise fact ban jaati hai.</p></div>

<div class="iv"><p class="q">"Bade syslog file se kaise pata karte ho ki kaunsa device problem kar raha hai?"</p><p>File ko event type ke liye <code>grep</code> se filter karta hoon, device column <code>awk</code> ya <code>cut</code> se nikalta hoon, phir ginne aur rank karne ke liye <code>sort | uniq -c | sort -rn</code>. Yeh chhote tools ki pipeline hai. Phir top device ko detail mein check karta hoon, aur commands ticket mein rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Logs <code>/var/log</code> ke neeche plain text files hain; routers apne logs syslog server ko bhejte hain.</li>
<li>Pipes se jude chhote tools scroll karne se behtar hain.</li>
<li>Syslog line mein time, source, sequence, facility-severity-mnemonic aur message hota hai.</li>
<li>Severity 0 sabse bura (emergency); 7 debug.</li>
<li>Lab files: <code>/var/log/remote/routers.log</code>, <code>~/devices.csv</code>, <code>/var/log/auth.log</code>.</li>
</ul></div>
`}};export{e as default};