var e=e=>`<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="journald and rsyslog">
<rect x="15" y="20" width="130" height="50" rx="8" fill="#fde68a"/><text x="80" y="50" text-anchor="middle" class="svg-ink" font-size="13">Services, sshd</text>
<rect x="15" y="100" width="130" height="50" rx="8" fill="#fde68a"/><text x="80" y="130" text-anchor="middle" class="svg-ink" font-size="13">Kernel, logger</text>
<rect x="210" y="55" width="150" height="60" rx="10" fill="#ddd6fe"/><text x="285" y="82" text-anchor="middle" class="svg-ink" font-size="14">systemd-journald</text><text x="285" y="100" text-anchor="middle" class="svg-muted" font-size="11">journalctl reads this</text>
<rect x="430" y="20" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="525" y="50" text-anchor="middle" class="svg-ink" font-size="13">rsyslogd: /var/log/syslog</text>
<rect x="430" y="100" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="525" y="130" text-anchor="middle" class="svg-ink" font-size="13">rsyslogd: UDP 514 input</text>
<line x1="145" y1="45" x2="210" y2="75" stroke="#64748b" stroke-width="2"/><line x1="145" y1="125" x2="210" y2="95" stroke="#64748b" stroke-width="2"/><line x1="360" y1="75" x2="430" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="525" y1="100" x2="525" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code">netadmin@syslog01:~$ journalctl -u rsyslog -n 4
netadmin@syslog01:~$ journalctl -p err -n 3</pre>
<pre class="out">Sep 29 09:00:30 syslog01 systemd[1]: Starting rsyslog.service - System Logging Service...
Sep 29 09:00:30 syslog01 rsyslogd[700]: imuxsock: Acquired UNIX socket '<span class="hl">/run/systemd/journal/syslog</span>' (fd 3) from systemd.  [v8.2312.0]
Sep 29 09:00:30 syslog01 rsyslogd[700]: [origin software="rsyslogd" swVersion="8.2312.0" x-pid="700" x-info="..."] start
Sep 29 09:00:30 syslog01 systemd[1]: Started rsyslog.service - System Logging Service.
-- No entries --</pre>`,n=`<pre class="code">netadmin@syslog01:~$ logger NK-test-one
netadmin@syslog01:~$ tail -n 1 /var/log/syslog</pre>
<pre class="out">Sep 29 09:00:30 syslog01 netadmin: <span class="hl">NK-test-one</span></pre>`,r=`<pre class="code"><span class="c"># Reference commands (not run in the simulator)</span>
journalctl -f                     <span class="c"># follow live, like tail -f</span>
journalctl -u ssh --since "1 hour ago"
journalctl -b                     <span class="c"># only messages since this boot</span>
journalctl -k                     <span class="c"># kernel messages only</span>
journalctl -p warning             <span class="c"># warning and more serious</span>
journalctl --disk-usage           <span class="c"># how much space the journal uses</span></pre>`,i={id:`journald`,h:{en:`journald and journalctl: the systemd log`,hi:`journald aur journalctl: systemd ka log`},body:{en:`
<p>Until about 2015 every Linux program wrote to text files through one logging daemon. Modern Ubuntu runs <b>systemd</b>, the program that starts and supervises services (you met it in the services module). systemd comes with its own logger, <b>systemd-journald</b>. It collects everything: service output, kernel messages, and anything sent with the <code>logger</code> command. You read it with <code>journalctl</code>.</p>

<h3>Two loggers, one machine: how they cooperate</h3>
<p>It sounds confusing to have two, but they work as a chain. The journal receives messages first and keeps them in a structured, indexed binary store. Ubuntu also runs <code>rsyslog</code>, which gets a copy through a local socket and writes the classic text files such as <code>/var/log/syslog</code>. And rsyslog is the part that can <b>listen on the network</b>, so it is the one we use for the central server.</p>
`+e(`journald collects first; rsyslog gets a copy, writes text files and can also receive UDP 514 from the network.`)+`
<p>You can see the hand-off in the rsyslog start-up lines. Look at the highlighted socket path:</p>
`+t+`
<ul>
<li><code>journalctl -u rsyslog</code>: <code>-u</code> means unit, a systemd service. Only lines from rsyslog.</li>
<li><code>-n 4</code>: only the last four lines, the same idea as <code>tail -n 4</code>.</li>
<li><code>-p err</code>: priority filter. It shows messages of severity <i>err</i> and worse. "No entries" is good news here.</li>
<li>The socket <code>/run/systemd/journal/syslog</code> is the pipe through which the journal passes messages to rsyslog.</li>
</ul>

<h3>Writing your own log line: logger</h3>
<p>The <code>logger</code> command sends a message into the logging system. It is the safest way to test logging without breaking anything, and a nice way to leave a note, for example before a maintenance window.</p>
`+n+`
<p>The message appears in <code>/var/log/syslog</code> with the time, the host name and your user name. The journal has it too. Both stores recorded the same event through the chain above.</p>

<h3>Useful journalctl options</h3>
<p>The simulator supports <code>-u</code>, <code>-n</code>, <code>-p err</code> and <code>-xe</code>. A real server offers many more, and these are the ones you will use in production:</p>
`+r+`
<p>By default, many Ubuntu systems keep the journal in memory-backed storage unless the directory <code>/var/log/journal</code> exists. Without it, journal contents are lost on reboot, which is the same trap as a router buffer. The text files written by rsyslog survive reboots, which is one more reason to keep both.</p>

<div class="eg"><p><b>Worked example.</b> A service will not start after a change. You run <code>systemctl status rsyslog</code>, which shows the last few lines, but you need more. <code>journalctl -u rsyslog -n 30</code> shows thirty lines of that unit only, with its failure reason such as an unknown parameter in the configuration. You fix the file, restart, and confirm with <code>journalctl -u rsyslog -n 4</code> that the last line says Started.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Running <code>journalctl</code> with no filter. It prints everything since boot, which is a screen full of noise. Always add <code>-u</code>, <code>-n</code> or <code>-p</code>. Also: as a normal user without the adm or systemd-journal group, you only see your own messages.</p></div>
<div class="exam"><p><b>Exam trap.</b> journald and rsyslog are not rivals. journald is the collector on a systemd host, rsyslog is the classic syslog daemon that writes text files and does network forwarding. "Which service listens on UDP 514?" is rsyslog, not journald.</p></div>

<div class="scn"><h4>Where did the log go after the reboot?</h4><p>A server rebooted and the engineer ran <code>journalctl -b -1</code> to see the previous boot. It returned nothing, because the journal was volatile. The text file <code>/var/log/syslog.1</code> had the crash lines. The team then created the directory <code>/var/log/journal</code> so the journal persists, and kept rsyslog as the second copy.</p><p><b>Lesson:</b> know where each copy of a log lives and whether it survives a reboot.</p></div>

<div class="iv"><p class="q">"What is the difference between journald and rsyslog?"</p><p>journald is the systemd logging service. It collects messages from services, the kernel and logger in an indexed binary store that you query with <code>journalctl</code>. rsyslog is the traditional syslog daemon: it writes plain text files under /var/log and can receive and forward syslog over the network. On Ubuntu both run, and journald hands messages to rsyslog.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>journalctl -u UNIT -n N</code> shows the last N lines of one service.</li>
<li><code>journalctl -p err</code> filters by severity.</li>
<li>journald collects first and passes a copy to rsyslog, which writes /var/log text files.</li>
<li><code>logger MESSAGE</code> injects a test line into the logs.</li>
<li>rsyslog, not journald, is the network listener on UDP 514.</li>
</ul></div>
`,hi:`
<p>Lagbhag 2015 tak har Linux program ek logging daemon ke zariye text files mein likhta tha. Modern Ubuntu <b>systemd</b> chalata hai, jo services ko start aur supervise karta hai (aap services module mein mile). systemd ka apna logger aata hai, <b>systemd-journald</b>. Woh sab kuch collect karta hai: service output, kernel messages, aur <code>logger</code> command se bheja gaya koi bhi message. Aap use <code>journalctl</code> se padhte ho.</p>

<h3>Do logger, ek machine: woh kaise saath kaam karte hain</h3>
<p>Do hona confusing lagta hai, par woh chain ki tarah kaam karte hain. Journal pehle message receive karta hai aur use structured, indexed binary store mein rakhta hai. Ubuntu <code>rsyslog</code> bhi chalata hai, jo local socket se copy leta hai aur <code>/var/log/syslog</code> jaisi classic text files likhta hai. Aur rsyslog hi woh hissa hai jo <b>network par sun sakta hai</b>, isliye central server ke liye hum wahi use karte hain.</p>
`+e(`journald pehle collect karta hai; rsyslog ko copy milti hai, woh text files likhta hai aur network se UDP 514 bhi receive kar sakta hai.`)+`
<p>Yeh hand-off rsyslog ki start-up lines mein dikh jaata hai. Highlight kiya hua socket path dekho:</p>
`+t+`
<ul>
<li><code>journalctl -u rsyslog</code>: <code>-u</code> ka matlab unit, yaani systemd service. Sirf rsyslog ki lines.</li>
<li><code>-n 4</code>: sirf aakhri chaar lines, <code>tail -n 4</code> jaisi idea.</li>
<li><code>-p err</code>: priority filter. Yeh severity <i>err</i> aur usse buri messages dikhata hai. Yahan "No entries" achhi khabar hai.</li>
<li>Socket <code>/run/systemd/journal/syslog</code> woh pipe hai jisse journal messages rsyslog ko deta hai.</li>
</ul>

<h3>Apni khud ki log line likhna: logger</h3>
<p><code>logger</code> command logging system mein message bhejta hai. Kuch todey bina logging test karne ka yeh sabse surakshit tareeka hai, aur maintenance window se pehle note chhodne ka achha tareeka bhi.</p>
`+n+`
<p>Message <code>/var/log/syslog</code> mein time, host name aur aapke user name ke saath dikhta hai. Journal mein bhi hai. Dono stores ne upar ki chain se wahi event record kiya.</p>

<h3>Kaam ke journalctl options</h3>
<p>Simulator <code>-u</code>, <code>-n</code>, <code>-p err</code> aur <code>-xe</code> support karta hai. Asli server par bahut zyada options hote hain, aur production mein aap yeh use karoge:</p>
`+r+`
<p>Default mein bahut se Ubuntu systems journal ko memory-backed storage mein rakhte hain jab tak directory <code>/var/log/journal</code> maujood na ho. Uske bina reboot par journal ka content kho jaata hai, jo router buffer jaisa hi jaal hai. rsyslog ki likhi text files reboot jhel leti hain, isliye dono rakhna behtar hai.</p>

<div class="eg"><p><b>Worked example.</b> Change ke baad ek service start nahi hoti. Aap <code>systemctl status rsyslog</code> chalate ho, jo aakhri kuch lines dikhata hai, par aapko zyada chahiye. <code>journalctl -u rsyslog -n 30</code> sirf us unit ki tees lines dikhata hai, uski failure wajah ke saath, jaise configuration mein unknown parameter. Aap file theek karte ho, restart karte ho, aur <code>journalctl -u rsyslog -n 4</code> se confirm karte ho ki aakhri line mein Started likha hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Bina filter ke <code>journalctl</code> chalana. Woh boot ke baad se sab print karta hai, jo screen bhar shor hai. Hamesha <code>-u</code>, <code>-n</code> ya <code>-p</code> lagao. Aur: adm ya systemd-journal group ke bina normal user sirf apne messages dekhta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> journald aur rsyslog dushman nahi hain. journald systemd host par collector hai, rsyslog classic syslog daemon hai jo text files likhta hai aur network forwarding karta hai. "UDP 514 par kaun sunta hai?" ka jawab rsyslog hai, journald nahi.</p></div>

<div class="scn"><h4>Reboot ke baad log kahan gaya?</h4><p>Ek server reboot hua aur engineer ne pichhla boot dekhne ke liye <code>journalctl -b -1</code> chalaya. Kuch nahi mila, kyunki journal volatile tha. Text file <code>/var/log/syslog.1</code> mein crash ki lines thi. Team ne tab directory <code>/var/log/journal</code> banayi taaki journal persist kare, aur rsyslog ko doosri copy ki tarah rakha.</p><p><b>Lesson:</b> jaano ki log ki har copy kahan rehti hai aur kya woh reboot jhelti hai.</p></div>

<div class="iv"><p class="q">"journald aur rsyslog mein kya difference hai?"</p><p>journald systemd ki logging service hai. Woh services, kernel aur logger ke messages ko indexed binary store mein collect karta hai jise aap <code>journalctl</code> se query karte ho. rsyslog traditional syslog daemon hai: woh /var/log ke neeche plain text files likhta hai aur network par syslog receive aur forward kar sakta hai. Ubuntu par dono chalte hain, aur journald messages rsyslog ko deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>journalctl -u UNIT -n N</code> ek service ki aakhri N lines dikhata hai.</li>
<li><code>journalctl -p err</code> severity se filter karta hai.</li>
<li>journald pehle collect karta hai aur rsyslog ko copy deta hai, jo /var/log text files likhta hai.</li>
<li><code>logger MESSAGE</code> logs mein test line daalta hai.</li>
<li>UDP 514 par network listener rsyslog hai, journald nahi.</li>
</ul></div>
`}};export{i as default};