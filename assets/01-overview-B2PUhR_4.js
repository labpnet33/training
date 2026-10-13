var e=e=>`<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Central syslog">
<rect x="20" y="30" width="150" height="55" rx="10" fill="#bae6fd"/><text x="95" y="55" text-anchor="middle" class="svg-ink" font-size="14">PUN-CORE-R1</text><text x="95" y="73" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.1</text>
<rect x="20" y="125" width="150" height="55" rx="10" fill="#bae6fd"/><text x="95" y="150" text-anchor="middle" class="svg-ink" font-size="14">BLR-EDGE-R2</text><text x="95" y="168" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.2</text>
<rect x="250" y="75" width="110" height="55" rx="10" fill="#e2e8f0"/><text x="305" y="107" text-anchor="middle" class="svg-ink" font-size="14">MGMT-SW</text>
<rect x="450" y="55" width="170" height="95" rx="10" fill="#bbf7d0"/><text x="535" y="82" text-anchor="middle" class="svg-ink" font-size="14">SYSLOG01</text><text x="535" y="102" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.30 - rsyslog</text><text x="535" y="124" text-anchor="middle" class="svg-accent" font-size="12">/var/log/remote/*.log</text>
<line x1="170" y1="58" x2="250" y2="95" stroke="#64748b" stroke-width="2"/><line x1="170" y1="152" x2="250" y2="112" stroke="#64748b" stroke-width="2"/><line x1="360" y1="103" x2="450" y2="103" stroke="#64748b" stroke-width="2"/>
<text x="405" y="92" text-anchor="middle" class="svg-accent" font-size="12">UDP 514</text>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code">netadmin@syslog01:~$ ls -l /var/log</pre>
<pre class="out">total 16
-rw-r-----  1 syslog   adm         252 Sep 29 09:00 auth.log
-rw-r--r--  1 root     root          0 Sep 29 09:00 dpkg.log
-rw-r-----  1 syslog   adm           0 Sep 29 09:00 kern.log
-rw-r-----  1 syslog   adm         668 Sep 29 09:00 <span class="hl">syslog</span></pre>`,n={id:`overview`,h:{en:`Why logs matter: what you will learn and the big picture`,hi:`Logs kyun zaroori hain: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how Linux records what happens on a machine, how to read those records quickly, and how to turn one Ubuntu server into a <b>central syslog server</b> that collects the messages of every router and switch in your network. You will read logs with <code>tail</code>, <code>grep</code> and <code>journalctl</code>, understand facility and severity, configure <code>rsyslog</code> to receive UDP 514, point Cisco routers at it, and troubleshoot the day the logs stop arriving.</p>
<p><b>Prerequisites.</b> You should be able to log in to a Linux server, move around the file system and run <code>sudo</code> (earlier modules of this track). You do not need to know anything about logging. Every command is explained the first time it appears.</p>

<h3>Analogy: the ship's logbook and the CCTV recorder</h3>
<p>Every ship keeps a logbook. The captain writes the time and what happened: "09:00 engine started", "11:40 storm warning". When something goes wrong, investigators open the logbook. A <b>log</b> on a computer is the same thing: one line of text per event, with a time. Now imagine each crew member keeps a private notebook in a pocket, and the notebook is wiped at every shift change. That is a router: it keeps a small log <b>buffer in RAM</b>, and a reload erases it, exactly when you need it most. <b>Central logging</b> is the CCTV recorder in the control room: every device sends its events to one safe place that keeps them for months.</p>
`+e(`Routers send log messages over UDP 514 to one server, which files them per device.`)+`
<h3>The vocabulary</h3>
<dl class="terms">
<dt>Log</dt><dd>A text record of an event: a time, who or what produced it, and a message.</dd>
<dt>Syslog</dt><dd>Both a message format and a network protocol for sending log lines to a server. Almost every network device speaks it.</dd>
<dt>Daemon</dt><dd>A program that runs in the background. The logging daemon on Ubuntu is <code>rsyslogd</code>.</dd>
<dt>/var/log</dt><dd>The directory where Linux keeps its log files. "var" means variable data: files that grow while the system runs.</dd>
</dl>

<h3>Where Linux logs live</h3>
<p>List the directory with <code>ls -l</code>. The <code>-l</code> flag means long format: permissions, owner, group, size and date.</p>
`+t+`
<p>Read the columns left to right. <code>-rw-r-----</code> means the owner (syslog) can read and write, the group (adm) can read, everyone else gets nothing. That is why a normal user sometimes sees <i>Permission denied</i> on a log: the file is private on purpose, because logs contain usernames, addresses and sometimes secrets. Members of the <code>adm</code> group, and <code>root</code> through <code>sudo</code>, can read them. <code>syslog</code> is the general log of the machine, <code>auth.log</code> records logins and <code>sudo</code> use, <code>kern.log</code> holds kernel messages.</p>

<h3>Why this matters to a network engineer</h3>
<ul>
<li>A router buffer is small and volatile. After a crash or reload the evidence is gone.</li>
<li>A flapping link at 02:00 has to be proven at 10:00. The server file shows the exact second.</li>
<li>Security teams, auditors and the exam all ask: who logged in, who changed the config, when?</li>
<li>One place to search beats logging in to forty devices one by one.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Deccan Net has PUN-CORE-R1 (10.99.0.1) and BLR-EDGE-R2 (10.99.0.2). Each keeps about 8 KB of log in RAM. At 02:10 R2 reloads on its own. In the morning the R2 buffer starts at 02:11 and says nothing about why. On SYSLOG01 (10.99.0.30) the file <code>/var/log/remote/10.99.0.2.log</code> still holds every line up to 02:09, including the warning that explains the reload. The cost of that safety: one small Ubuntu VM and a few configuration lines you will write in this module.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Treating <code>show logging</code> on the router as the log. It is a short-term buffer, not a record. If you need history, it must already be on a server before the incident.</p></div>
<div class="exam"><p><b>Exam trap.</b> Syslog uses <b>UDP port 514</b> by default. UDP has no acknowledgment, so the sender never learns that a message was lost. Remember this when a question asks why messages are missing.</p></div>

<div class="scn"><h4>The reload nobody could explain</h4><p>A branch router restarted twice in one week. The engineer logged in and ran <code>show logging</code>: the buffer began after the reboot. Management asked for the cause and there was none. The team then built a syslog server. Three weeks later the router restarted again, and the server file showed a line about a memory warning two minutes earlier. The fix was a software upgrade, found in ten minutes instead of weeks.</p><p><b>Lesson:</b> collect logs before you need them. You cannot set up evidence after the incident.</p></div>

<div class="iv"><p class="q">"Why do we send router logs to a central syslog server?"</p><p>Routers keep only a small RAM buffer that is erased on reload, so history is lost exactly when it matters. A central server keeps a long, searchable, time-ordered record of all devices in one place, which helps troubleshooting, security investigations and audits. Mention that classic syslog is UDP 514 and unacknowledged, so you also protect the path and test it on purpose.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A log is one timestamped line per event; Linux keeps them under <code>/var/log</code>.</li>
<li>Log files are private (mode 640, group adm), so you often need <code>sudo</code>.</li>
<li>Routers keep a small RAM buffer; central syslog keeps the history.</li>
<li>Syslog defaults to UDP 514 with no delivery guarantee.</li>
<li>This module builds the server (rsyslog), the senders (routers) and the troubleshooting habit.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki Linux machine par jo hota hai use kaise record karta hai, un records ko jaldi kaise padhein, aur ek Ubuntu server ko <b>central syslog server</b> kaise banayein jo network ke har router aur switch ke messages jama kare. Aap <code>tail</code>, <code>grep</code> aur <code>journalctl</code> se logs padhoge, facility aur severity samjhoge, <code>rsyslog</code> ko UDP 514 receive karne ke liye configure karoge, Cisco routers ko uski taraf point karoge, aur us din ka troubleshooting karoge jab logs aana band ho jaate hain.</p>
<p><b>Prerequisites.</b> Aapko Linux server mein login karna, file system mein ghoomna aur <code>sudo</code> chalana aana chahiye (is track ke pehle modules). Logging ke baare mein kuch jaanna zaroori nahi. Har command pehli baar aate hi samjhayi gayi hai.</p>

<h3>Analogy: jahaz ki logbook aur CCTV recorder</h3>
<p>Har jahaz logbook rakhta hai. Captain time aur jo hua woh likhta hai: "09:00 engine start hua", "11:40 storm warning". Kuch galat ho to investigators logbook kholte hain. Computer par <b>log</b> bhi wahi hai: har event ki ek line text, time ke saath. Ab socho har crew member ki jeb mein apni private notebook hai aur har shift change par woh mita di jaati hai. Router waisa hi hai: woh chhota log <b>buffer RAM mein</b> rakhta hai, aur reload use mita deta hai, theek tab jab sabse zyada zaroorat hoti hai. <b>Central logging</b> control room ka CCTV recorder hai: har device apne events ek surakshit jagah bhejta hai jo unhe mahino tak rakhti hai.</p>
`+e(`Routers UDP 514 par log messages ek server ko bhejte hain, jo har device ki alag file banata hai.`)+`
<h3>Vocabulary</h3>
<dl class="terms">
<dt>Log</dt><dd>Event ka text record: ek time, kisne ya kisne banaya, aur ek message.</dd>
<dt>Syslog</dt><dd>Message format bhi aur log lines server ko bhejne ka network protocol bhi. Lagbhag har network device ise samajhta hai.</dd>
<dt>Daemon</dt><dd>Background mein chalne wala program. Ubuntu par logging daemon <code>rsyslogd</code> hai.</dd>
<dt>/var/log</dt><dd>Woh directory jahan Linux apni log files rakhta hai. "var" ka matlab variable data: system chalte waqt badhne wali files.</dd>
</dl>

<h3>Linux logs kahan rehte hain</h3>
<p>Directory ko <code>ls -l</code> se list karo. <code>-l</code> flag ka matlab long format: permissions, owner, group, size aur date.</p>
`+t+`
<p>Columns ko left se right padho. <code>-rw-r-----</code> ka matlab owner (syslog) padh aur likh sakta hai, group (adm) padh sakta hai, baaki sabko kuch nahi. Isiliye normal user ko kabhi-kabhi log par <i>Permission denied</i> milta hai: file jaan-boojh kar private hai, kyunki logs mein usernames, addresses aur kabhi secrets hote hain. <code>adm</code> group ke members aur <code>sudo</code> se <code>root</code> unhe padh sakte hain. <code>syslog</code> machine ka general log hai, <code>auth.log</code> logins aur <code>sudo</code> use record karta hai, <code>kern.log</code> mein kernel messages hote hain.</p>

<h3>Network engineer ke liye yeh kyun zaroori hai</h3>
<ul>
<li>Router ka buffer chhota aur volatile hai. Crash ya reload ke baad saboot gayab.</li>
<li>02:00 par flap hui link ko 10:00 par sabit karna padta hai. Server ki file exact second batati hai.</li>
<li>Security teams, auditors aur exam sab poochte hain: kisne login kiya, kisne config badli, kab?</li>
<li>Chalis devices mein ek-ek karke login karne se behtar hai ek jagah search karna.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Deccan Net ke paas PUN-CORE-R1 (10.99.0.1) aur BLR-EDGE-R2 (10.99.0.2) hain. Har ek RAM mein lagbhag 8 KB log rakhta hai. 02:10 par R2 apne aap reload hota hai. Subah R2 ka buffer 02:11 se shuru hota hai aur kaaran ke baare mein kuch nahi batata. SYSLOG01 (10.99.0.30) par <code>/var/log/remote/10.99.0.2.log</code> file mein 02:09 tak ki har line hai, us warning samet jo reload samjhati hai. Is surakshaa ki keemat: ek chhoti Ubuntu VM aur kuch configuration lines jo aap is module mein likhoge.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Router ke <code>show logging</code> ko hi log samajhna. Woh short-term buffer hai, record nahi. History chahiye to incident se pehle hi server par honi chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Syslog default mein <b>UDP port 514</b> use karta hai. UDP mein acknowledgment nahi hota, isliye sender ko kabhi pata nahi chalta ki message kho gaya. Jab sawaal poochhe ki messages kyun missing hain, yeh yaad rakho.</p></div>

<div class="scn"><h4>Woh reload jo koi samjha nahi paya</h4><p>Ek branch router ek hafte mein do baar restart hua. Engineer ne login karke <code>show logging</code> chalaya: buffer reboot ke baad se shuru tha. Management ne kaaran poochha aur koi nahi tha. Team ne tab syslog server banaya. Teen hafte baad router phir restart hua, aur server file mein do minute pehle ek memory warning ki line thi. Fix ek software upgrade tha, jo hafton ki jagah das minute mein mil gaya.</p><p><b>Lesson:</b> logs zaroorat se pehle collect karo. Incident ke baad saboot set up nahi kiya ja sakta.</p></div>

<div class="iv"><p class="q">"Router logs ko central syslog server par kyun bhejte hain?"</p><p>Routers sirf chhota RAM buffer rakhte hain jo reload par mit jaata hai, isliye history theek tab kho jaati hai jab zaroori hoti hai. Central server saare devices ka lamba, searchable, time-ordered record ek jagah rakhta hai, jo troubleshooting, security investigation aur audit mein madad karta hai. Yeh bhi kaho ki classic syslog UDP 514 hai aur unacknowledged hai, isliye path ko protect karte hain aur jaan-boojh kar test karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Log matlab har event ki ek timestamped line; Linux unhe <code>/var/log</code> ke neeche rakhta hai.</li>
<li>Log files private hoti hain (mode 640, group adm), isliye aksar <code>sudo</code> chahiye.</li>
<li>Routers chhota RAM buffer rakhte hain; central syslog history rakhta hai.</li>
<li>Syslog default mein UDP 514 hai, delivery ki guarantee nahi.</li>
<li>Yeh module server (rsyslog), senders (routers) aur troubleshooting ki aadat banata hai.</li>
</ul></div>
`}};export{n as default};