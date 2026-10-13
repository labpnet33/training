var e=e=>`<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Recap">
<rect x="10" y="25" width="140" height="60" rx="8" fill="#bae6fd"/><text x="80" y="52" text-anchor="middle" class="svg-ink" font-size="13">Router</text><text x="80" y="70" text-anchor="middle" class="svg-muted" font-size="11">host, trap, source</text>
<rect x="180" y="25" width="140" height="60" rx="8" fill="#fed7aa"/><text x="250" y="52" text-anchor="middle" class="svg-ink" font-size="13">ufw</text><text x="250" y="70" text-anchor="middle" class="svg-muted" font-size="11">allow UDP 514 from mgmt</text>
<rect x="350" y="25" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="420" y="52" text-anchor="middle" class="svg-ink" font-size="13">rsyslog</text><text x="420" y="70" text-anchor="middle" class="svg-muted" font-size="11">imudp, template, stop</text>
<rect x="520" y="25" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="575" y="52" text-anchor="middle" class="svg-ink" font-size="13">File</text><text x="575" y="70" text-anchor="middle" class="svg-muted" font-size="11">rotate, 640</text>
<line x1="150" y1="55" x2="180" y2="55" stroke="#64748b" stroke-width="2"/><line x1="320" y1="55" x2="350" y2="55" stroke="#64748b" stroke-width="2"/><line x1="490" y1="55" x2="520" y2="55" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code"><span class="c"># Linux (run in the simulator)</span>
ls -l /var/log                         <span class="c"># list log files with owner and mode</span>
tail -n 20 /var/log/syslog             <span class="c"># newest 20 lines</span>
grep -i error FILE | tail -5           <span class="c"># filter, then limit</span>
journalctl -u rsyslog -n 20            <span class="c"># last lines of one service</span>
logger "NK test"                       <span class="c"># write a test line</span>
sudo rsyslogd -N1                      <span class="c"># validate rsyslog config</span>
sudo systemctl restart rsyslog
ss -uln                                <span class="c"># UDP listeners (look for 514)</span>
sudo ufw allow from 10.99.0.0/24 to any port 514 proto udp
sudo tail -3 /var/log/ufw.log          <span class="c"># [UFW BLOCK] lines</span>
<span class="c"># Cisco IOS</span>
service timestamps log datetime msec
logging host 10.99.0.30
logging trap informational
logging source-interface Loopback9
send log 5 "text"
show logging | include Trap|Logging to</pre>`,n={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with a router whose log vanished on reload. You now know how to build the central place where logs live, how to prove it works, and how to repair it. This chapter is your revision sheet.</p>
`+e(`The whole module in one line: sender, firewall, receiver, file.`)+`

<h3>Can-do checklist</h3>
<ul>
<li>Explain why routers need central logging and why UDP 514 can lose messages.</li>
<li>Find and read <code>/var/log/syslog</code>, <code>auth.log</code> and the remote files with <code>head</code>, <code>tail</code>, <code>grep</code> and <code>wc</code>.</li>
<li>Use <code>journalctl -u</code>, <code>-n</code> and <code>-p</code>, and explain how journald and rsyslog cooperate.</li>
<li>Name the eight severities and compute which messages a threshold sends.</li>
<li>Write the rsyslog receiver: imudp, input 514, template per sender IP, stop.</li>
<li>Configure a Cisco router: timestamps, logging host, trap level, source interface, test with <code>send log</code>.</li>
<li>Troubleshoot in path order using <code>show logging</code>, <code>ufw.log</code> and <code>ss -uln</code>.</li>
<li>Describe rotation, time synchronisation and basic log security.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>rsyslog</dt><dd>The classic syslog daemon on Ubuntu; writes text logs and can receive network syslog.</dd>
<dt>journald</dt><dd>The systemd log collector, queried with journalctl.</dd>
<dt>Facility</dt><dd>The source category of a message (kern, auth, local0 to local7).</dd>
<dt>Severity</dt><dd>Importance, 0 (emergencies) to 7 (debugging).</dd>
<dt>PRI</dt><dd>Facility x 8 + severity, the number at the start of a syslog packet.</dd>
<dt>Trap level</dt><dd>The Cisco threshold for messages sent to a syslog server.</dd>
<dt>Template</dt><dd>An rsyslog pattern that builds a file name from message properties.</dd>
<dt>Rotation</dt><dd>Renaming, compressing and deleting old logs on a schedule.</dd>
<dt>NTP</dt><dd>Network Time Protocol, which keeps clocks synchronised.</dd>
</dl>

<h3>Most tested facts</h3>
<ul>
<li>Syslog is <b>UDP 514</b> by default and has no acknowledgment.</li>
<li>Smaller severity number = more serious. A threshold sends its level and everything smaller.</li>
<li><code>%FACILITY-5-MNEMONIC</code>: the middle number is the severity; Cisco's default syslog facility is local7.</li>
<li><code>logging trap</code> controls the syslog server; console, monitor and buffered have their own levels.</li>
<li>rsyslog needs <code>imudp</code> loaded before it listens; verify with <code>ss -uln</code>.</li>
<li>Run <code>rsyslogd -N1</code> before restarting. Open UDP 514 in the firewall only for the management network.</li>
<li>An asterisk before a Cisco time stamp means the clock is not synchronised.</li>
</ul>

<h3>Command cheat sheet</h3>
`+t+`

<div class="eg"><p><b>Worked example.</b> Final self-test. A new router at 10.99.0.7 is "not logging". Without looking at the chapters, list your first five checks: router <code>show logging</code> (host, level, counter), ping the server, <code>ufw status</code> and <code>ufw.log</code>, <code>ss -uln</code> for 514, and the template and file path. Then send <code>send log 5 "NK-final"</code> and grep for it. If you can do this from memory, you have the module.</p></div>

<div class="warn"><p><b>Common mistakes to avoid.</b> Opening 514 to everyone, disabling the firewall to test, forgetting <code>rsyslogd -N1</code>, ignoring the clock, and never rotating.</p></div>
<div class="exam"><p><b>Exam trap.</b> If a question shows a threshold and a message, compare the numbers before anything else; a missing log is very often a level mismatch.</p></div>

<div class="scn"><h4>The audit that passed</h4><p>An auditor asked for proof of every configuration change on the core router in the last quarter. The team ran <code>grep CONFIG_I /var/log/remote/10.99.0.1.log*</code> and handed over the lines with times and user names within minutes. The device's own buffer would have held only a day.</p><p><b>Lesson:</b> central logging with rotation turns an audit from a panic into a command.</p></div>

<div class="iv"><p class="q">"Describe a complete, secure syslog design for a small network."</p><p>Routers send informational and above with millisecond timestamps and a fixed source address to one Linux server. The server runs rsyslog with a UDP 514 input and a file per device, behind ufw that allows UDP 514 only from the management network. Clocks use NTP, logrotate keeps about eight weeks compressed, files are mode 640, and an end-to-end test message is part of every change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Central syslog = router sender + firewall rule + rsyslog receiver + managed files.</li>
<li>Severity numbers, trap level and UDP 514 are the exam core.</li>
<li>Troubleshoot in path order and prove each fix with a unique test message.</li>
<li>Rotation, NTP and file permissions keep logs trustworthy.</li>
<li>Next in the track: moving files such as configs and images (TFTP and its secure alternatives).</li>
</ul></div>
`,hi:`
<p>Aapne ek aise router se shuru kiya jiska log reload par gayab ho jaata tha. Ab aap jaante ho ki woh central jagah kaise banate hain jahan logs rehte hain, kaise sabit karte hain ki woh kaam kar rahi hai, aur use kaise repair karte hain. Yeh chapter aapki revision sheet hai.</p>
`+e(`Poora module ek line mein: sender, firewall, receiver, file.`)+`

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao ki routers ko central logging kyun chahiye aur UDP 514 messages kho kyun sakta hai.</li>
<li><code>/var/log/syslog</code>, <code>auth.log</code> aur remote files ko <code>head</code>, <code>tail</code>, <code>grep</code> aur <code>wc</code> se dhoondho aur padho.</li>
<li><code>journalctl -u</code>, <code>-n</code> aur <code>-p</code> use karo, aur samjhao ki journald aur rsyslog kaise saath kaam karte hain.</li>
<li>Aath severities ke naam batao aur nikaalo ki threshold kaun se messages bhejta hai.</li>
<li>rsyslog receiver likho: imudp, input 514, har sender IP ke liye template, stop.</li>
<li>Cisco router configure karo: timestamps, logging host, trap level, source interface, <code>send log</code> se test.</li>
<li><code>show logging</code>, <code>ufw.log</code> aur <code>ss -uln</code> se path order mein troubleshoot karo.</li>
<li>Rotation, time synchronisation aur basic log security describe karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>rsyslog</dt><dd>Ubuntu ka classic syslog daemon; text logs likhta hai aur network syslog receive kar sakta hai.</dd>
<dt>journald</dt><dd>systemd ka log collector, jise journalctl se query karte hain.</dd>
<dt>Facility</dt><dd>Message ki source category (kern, auth, local0 se local7).</dd>
<dt>Severity</dt><dd>Importance, 0 (emergencies) se 7 (debugging).</dd>
<dt>PRI</dt><dd>Facility x 8 + severity, syslog packet ke shuru ka number.</dd>
<dt>Trap level</dt><dd>Syslog server ko bheje jaane wale messages ka Cisco threshold.</dd>
<dt>Template</dt><dd>rsyslog pattern jo message properties se file ka naam banata hai.</dd>
<dt>Rotation</dt><dd>Schedule par purane logs ka naam badalna, compress aur delete karna.</dd>
<dt>NTP</dt><dd>Network Time Protocol, jo clocks ko synchronised rakhta hai.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>Syslog default mein <b>UDP 514</b> hai aur acknowledgment nahi hota.</li>
<li>Chhota severity number = zyada serious. Threshold apna level aur har chhota level bhejta hai.</li>
<li><code>%FACILITY-5-MNEMONIC</code>: beech ka number severity hai; Cisco ki default syslog facility local7 hai.</li>
<li><code>logging trap</code> syslog server ko control karta hai; console, monitor aur buffered ke apne levels hain.</li>
<li>rsyslog sunne se pehle <code>imudp</code> load hona chahiye; <code>ss -uln</code> se verify karo.</li>
<li>Restart se pehle <code>rsyslogd -N1</code> chalao. Firewall mein UDP 514 sirf management network ke liye kholo.</li>
<li>Cisco time stamp se pehle asterisk ka matlab clock synchronised nahi hai.</li>
</ul>

<h3>Command cheat sheet</h3>
`+t+`

<div class="eg"><p><b>Worked example.</b> Final self-test. 10.99.0.7 par naya router "log nahi kar raha". Chapters dekhe bina apne pehle paanch checks batao: router par <code>show logging</code> (host, level, counter), server ko ping, <code>ufw status</code> aur <code>ufw.log</code>, 514 ke liye <code>ss -uln</code>, aur template aur file path. Phir <code>send log 5 "NK-final"</code> bhejo aur use grep karo. Agar yeh yaadasht se kar sako, to module aapka hai.</p></div>

<div class="warn"><p><b>Bachne wali galtiyan.</b> 514 ko sabke liye kholna, test ke liye firewall band karna, <code>rsyslogd -N1</code> bhoolna, clock ko ignore karna, aur kabhi rotate na karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Agar sawaal mein threshold aur message dikhe, to kuch bhi karne se pehle numbers compare karo; missing log aksar level mismatch hota hai.</p></div>

<div class="scn"><h4>Woh audit jo pass hua</h4><p>Ek auditor ne pichhli quarter mein core router par har configuration change ka saboot maanga. Team ne <code>grep CONFIG_I /var/log/remote/10.99.0.1.log*</code> chalaya aur kuch minutes mein times aur user names ke saath lines saunp di. Device ka apna buffer sirf ek din rakhta.</p><p><b>Lesson:</b> rotation ke saath central logging audit ko ghabrahat se ek command bana deta hai.</p></div>

<div class="iv"><p class="q">"Chhote network ke liye complete, secure syslog design batao."</p><p>Routers informational aur upar ko millisecond timestamps aur fixed source address ke saath ek Linux server ko bhejte hain. Server par rsyslog UDP 514 input aur har device ki file ke saath chalta hai, ufw ke peeche jo UDP 514 sirf management network se allow karta hai. Clocks NTP use karte hain, logrotate lagbhag aath hafte compressed rakhta hai, files mode 640 hain, aur har change ka hissa end-to-end test message hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Central syslog = router sender + firewall rule + rsyslog receiver + managed files.</li>
<li>Severity numbers, trap level aur UDP 514 exam ka core hain.</li>
<li>Path order mein troubleshoot karo aur har fix ko unique test message se sabit karo.</li>
<li>Rotation, NTP aur file permissions logs ko bharosemand rakhte hain.</li>
<li>Track mein aage: files ka transfer jaise configs aur images (TFTP aur uske secure alternatives).</li>
</ul></div>
`}};export{n as default};