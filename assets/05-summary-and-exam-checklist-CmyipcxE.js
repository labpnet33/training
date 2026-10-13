var e=`<svg viewBox="0 0 640 160" role="img" aria-label="Syslog build and verify loop">
<rect x="10" y="40" width="140" height="70" rx="10" fill="#bae6fd"/><text x="80" y="70" text-anchor="middle" class="svg-ink" font-size="13">Configure</text><text x="80" y="90" text-anchor="middle" class="svg-muted" font-size="11">host, trap, source</text>
<rect x="175" y="40" width="140" height="70" rx="10" fill="#fde68a"/><text x="245" y="70" text-anchor="middle" class="svg-ink" font-size="13">Time</text><text x="245" y="90" text-anchor="middle" class="svg-muted" font-size="11">NTP, datetime msec</text>
<rect x="340" y="40" width="140" height="70" rx="10" fill="#ddd6fe"/><text x="410" y="70" text-anchor="middle" class="svg-ink" font-size="13">Test</text><text x="410" y="90" text-anchor="middle" class="svg-muted" font-size="11">send log, show logging</text>
<rect x="505" y="40" width="125" height="70" rx="10" fill="#bbf7d0"/><text x="567" y="70" text-anchor="middle" class="svg-ink" font-size="13">Find it</text><text x="567" y="90" text-anchor="middle" class="svg-muted" font-size="11">on the collector</text>
<line x1="150" y1="75" x2="175" y2="75" stroke="#64748b" stroke-width="2"/><line x1="315" y1="75" x2="340" y2="75" stroke="#64748b" stroke-width="2"/><line x1="480" y1="75" x2="505" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">no line on the collector? walk the five-step path from chapter 4</text>
</svg>`,t={id:`summary-exam-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The whole module in one picture</h3>
<p>You started with a router that kept its diary in RAM. You now know how to make every device report to a central collector, how to make the messages trustworthy and how to find a break in the path. This chapter pulls the facts together so you can revise in ten minutes before a lab, an exam or an interview.</p>
<div class="dia">`+e+`<p class="cap">The routine for every new device: configure, fix the time, test on purpose, find the test line.</p></div>

<div class="note"><p><b>Scope of the simulator.</b> Simulated: syslog sending and collection, trap levels, timestamps, NTP and the Linux rsyslog and ufw checks used in the labs. Not simulated: real encryption of syslog over TLS, real throughput, a real time-series or search database, and vendor product screens. Where the text mentions TCP or TLS, treat it as concept and read the exact options in your platform documentation.</p></div>

<h3>Can-do checklist</h3>
<p>Tick each line only if you could do it now without notes.</p>
<ul>
<li>I can explain why a local buffer is not enough and what a collector adds.</li>
<li>I can list severities 0 to 7 by name and say which direction is more urgent.</li>
<li>I can compute PRI from facility and severity, and decode a PRI value such as 190 or 187.</li>
<li>I can read a Cisco message: timestamp, %COMPONENT-SEVERITY-MNEMONIC, text.</li>
<li>I can configure logging host 10.1.50.100, logging trap informational, logging source-interface Loopback0 and service timestamps log datetime msec.</li>
<li>I can set an NTP server, read show ntp status, and recognise the asterisk of an unsynchronised clock.</li>
<li>I can predict which messages a given trap level sends.</li>
<li>I can compare UDP, TCP and TLS transport for syslog.</li>
<li>I can follow a test message from router to file and name the first broken step.</li>
<li>I can read ufw status and ufw.log, and add a narrow allow rule for UDP 514.</li>
<li>I can explain log floods, rate limiting and why a flood hides real events.</li>
</ul>

<h3>rsyslog basics to remember</h3>
<p>On a Linux collector, rsyslog is the usual receiver. Three ideas cover almost every ticket. First, it must <b>load an input</b>: <code>module(load="imudp")</code> and <code>input(type="imudp" port="514")</code>. Second, a <b>rule</b> decides what to do with a message, for example write messages from other hosts into a file named after the sender. Third, <b>files and disk</b>: the daemon runs as the syslog user and needs permission to write. The commands you use daily are <code>sudo rsyslogd -N1</code> to validate, <code>sudo systemctl restart rsyslog</code>, <code>ss -uln</code> to see listeners, and <code>tail -f</code> on the device file. Keep log rotation on so disks do not fill, and keep retention long enough for your audit needs.</p>

<h3>Privacy and good practice</h3>
<p>Logs contain user names, source addresses and sometimes sensitive text. Restrict who can read the collector, keep only what you need for as long as policy says, and prefer encrypted transport when logs leave a trusted network. Do not log passwords. When you share a log snippet in a ticket, mask what the reader does not need.</p>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Syslog</dt><dd>One-way text messages from devices to a collector, UDP 514 by default.</dd>
<dt>Collector</dt><dd>The server that receives and stores syslog messages; here NMS or SYSLOG01.</dd>
<dt>Severity</dt><dd>Urgency from 0 emergencies to 7 debugging; lower is more urgent.</dd>
<dt>Facility</dt><dd>Category number in the packet used for sorting; Cisco default local7.</dd>
<dt>PRI</dt><dd>Facility x 8 + severity, written in angle brackets at the start of the packet.</dd>
<dt>Trap level</dt><dd>Threshold for messages sent to syslog servers; unrelated to SNMP traps.</dd>
<dt>Source interface</dt><dd>The interface whose address the messages carry; Loopback0 is stable.</dd>
<dt>NTP</dt><dd>Protocol on UDP 123 that keeps every device clock the same.</dd>
<dt>Stratum</dt><dd>Distance from a reference clock; lower is closer.</dd>
<dt>Sequence number</dt><dd>Counter added to messages so gaps can be seen.</dd>
<dt>Rate limit</dt><dd>A cap on messages per second from one source, to survive floods.</dd>
<dt>RFC 3164 / 5424</dt><dd>Old and new syslog message formats.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Remember</th></tr>
<tr><td>Default port and transport</td><td>UDP 514, no delivery guarantee</td></tr>
<tr><td>Reliable options</td><td>TCP, and TLS (often 6514) for encryption</td></tr>
<tr><td>Severity names in order</td><td>emergencies, alerts, critical, errors, warnings, notifications, informational, debugging</td></tr>
<tr><td>Trap level informational</td><td>sends 0 to 6, not 7</td></tr>
<tr><td>Cisco default facility</td><td>local7 (23), so informational PRI is 190</td></tr>
<tr><td>Leading asterisk on a timestamp</td><td>clock not synchronised</td></tr>
<tr><td>Missing "interface up" messages</td><td>trap level too low (up is severity 5)</td></tr>
<tr><td>ufw block clue</td><td>UFW BLOCK with DPT=514 in ufw.log</td></tr>
<tr><td>Stable source address</td><td>logging source-interface Loopback0</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! sender (router)</span>
logging host 10.1.50.100
logging trap informational
logging source-interface Loopback0
logging buffered 16384 informational
service timestamps log datetime msec
service sequence-numbers
ntp server 10.1.50.100
send log 5 "NK-TEST-1 syslog path check"
show logging
show ntp status
show clock

<span class="c"># collector (Linux)</span>
ss -uln | grep 514
sudo ufw status verbose
sudo ufw allow from 10.255.0.0/24 to any port 514 proto udp
sudo tail -f /var/log/remote/10.255.0.2.log
sudo rsyslogd -N1 &amp;&amp; sudo systemctl restart rsyslog</pre>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> Do not read severity upside down. Do not forget that buffer, console and trap levels are separate. Do not close a ticket before the test message shows up on the collector. Do not open a firewall wider than UDP 514 from the router range.</p></div>
<div class="exam"><p><b>Exam trap.</b> If a question gives several symptoms (wrong time, missing up messages, nothing at all), map each to its own cause: NTP and timestamps, trap level, path and firewall. One symptom rarely has two unrelated causes, but one ticket can have two faults.</p></div>

<div class="scn"><h4>The Monday checklist that paid for itself</h4><p>After the Kochi incident, Meena Iyer wrote a one-page onboarding checklist: four logging lines, NTP, a test message, and a screenshot of the line on the collector. When Lucknow got a new router, the engineer followed it and finished in ten minutes. Three months later a real fault at Lucknow showed up with complete, correctly ordered logs.</p><p><b>Lesson:</b> a checklist turns knowledge into habit, and habit is what saves the incident.</p></div>

<div class="iv"><p class="q">"Walk me through how you would onboard a new router into central logging."</p><p>Strong answer: set the logging host, a trap level of informational, a loopback source and datetime msec timestamps; point NTP at the internal server; confirm with show logging and show ntp status; send a test message and find it on the collector; make sure the collector firewall allows UDP 514 from the router loopback range. Mention retention, access control and a recurring test.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Central logging needs host, trap level, source interface, timestamps and NTP.</li>
<li>Lower severity numbers are more urgent; a trap level sends everything at or below it.</li>
<li>UDP 514 is unreliable; use TCP or TLS where the loss or privacy risk matters.</li>
<li>Prove delivery with a test message and follow it through the five-step path.</li>
<li>Control floods and protect log privacy with limits, retention and access rules.</li>
</ul></div>
`,hi:`
<h3>Poora module ek picture mein</h3>
<p>Aapne shuru kiya ek router se jo apni diary RAM mein rakhta tha. Ab aap jaante ho ki har device ko central collector ko report karna kaise sikhana hai, messages ko bharosemand kaise banana hai aur path ka toot kaise dhoondhna hai. Yeh chapter saare facts ek jagah laata hai taaki lab, exam ya interview se pehle dus minute mein revise kar sako.</p>
<div class="dia">`+e+`<p class="cap">Har naye device ka routine: configure karo, time theek karo, jaan-boojh kar test karo, test line dhoondho.</p></div>

<div class="note"><p><b>Simulator ka scope.</b> Simulated: syslog sending aur collection, trap levels, timestamps, NTP aur labs mein use hone wale Linux rsyslog aur ufw checks. Simulated nahi: TLS par syslog ki asli encryption, asli throughput, asli time-series ya search database, aur vendor product screens. Jahan text TCP ya TLS ka zikr karta hai, use concept maano aur exact options apne platform ke documentation mein padho.</p></div>

<h3>Can-do checklist</h3>
<p>Har line tabhi tick karo jab aap use abhi bina notes ke kar sako.</p>
<ul>
<li>Main samjha sakta hoon ki local buffer kaafi kyun nahi aur collector kya jodta hai.</li>
<li>Main severities 0 se 7 naam se bata sakta hoon aur kaun si direction zyada urgent hai.</li>
<li>Main facility aur severity se PRI nikal sakta hoon, aur 190 ya 187 jaisi PRI value decode kar sakta hoon.</li>
<li>Main Cisco message padh sakta hoon: timestamp, %COMPONENT-SEVERITY-MNEMONIC, text.</li>
<li>Main logging host 10.1.50.100, logging trap informational, logging source-interface Loopback0 aur service timestamps log datetime msec configure kar sakta hoon.</li>
<li>Main NTP server set kar sakta hoon, show ntp status padh sakta hoon, aur unsynchronised clock ka asterisk pehchan sakta hoon.</li>
<li>Main bata sakta hoon ki diya hua trap level kaun se messages bhejta hai.</li>
<li>Main syslog ke liye UDP, TCP aur TLS transport ki tulna kar sakta hoon.</li>
<li>Main test message ko router se file tak follow kar sakta hoon aur pehla toota step bata sakta hoon.</li>
<li>Main ufw status aur ufw.log padh sakta hoon, aur UDP 514 ke liye narrow allow rule jod sakta hoon.</li>
<li>Main log floods, rate limiting aur yeh samjha sakta hoon ki flood asli events kyun chhupata hai.</li>
</ul>

<h3>rsyslog ki basics jo yaad rakhni hain</h3>
<p>Linux collector par rsyslog aam receiver hai. Teen ideas lagbhag har ticket cover karte hain. Pehla, usse <b>input load</b> karna padta hai: <code>module(load="imudp")</code> aur <code>input(type="imudp" port="514")</code>. Doosra, ek <b>rule</b> tay karta hai message ke saath kya karna hai, jaise doosre hosts ke messages ko sender ke naam wali file mein likhna. Teesra, <b>files aur disk</b>: daemon syslog user ke roop mein chalta hai aur use likhne ki permission chahiye. Roz ke commands hain <code>sudo rsyslogd -N1</code> validate karne ke liye, <code>sudo systemctl restart rsyslog</code>, listeners dekhne ke liye <code>ss -uln</code>, aur device file par <code>tail -f</code>. Log rotation on rakho taaki disks na bharein, aur retention itni rakho jitni aapki audit zaroorat hai.</p>

<h3>Privacy aur achhi practice</h3>
<p>Logs mein user names, source addresses aur kabhi kabhi sensitive text hota hai. Collector ko kaun padh sakta hai use restrict karo, policy jitna kehti hai utna hi rakho, aur jab logs trusted network se bahar jaayein to encrypted transport pasand karo. Passwords log mat karo. Ticket mein log snippet share karte waqt woh mask karo jo padhne wale ko nahi chahiye.</p>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Syslog</dt><dd>Devices se collector ko one-way text messages, default UDP 514.</dd>
<dt>Collector</dt><dd>Woh server jo syslog messages receive aur store karta hai; yahan NMS ya SYSLOG01.</dd>
<dt>Severity</dt><dd>Urgency 0 emergencies se 7 debugging tak; chhota zyada urgent.</dd>
<dt>Facility</dt><dd>Packet mein category number jo sorting ke liye use hota hai; Cisco default local7.</dd>
<dt>PRI</dt><dd>Facility x 8 + severity, packet ki shuruaat mein angle brackets mein likha.</dd>
<dt>Trap level</dt><dd>Syslog servers ko jaane wale messages ka threshold; SNMP traps se alag.</dd>
<dt>Source interface</dt><dd>Woh interface jiska address messages par lagta hai; Loopback0 stable hai.</dd>
<dt>NTP</dt><dd>UDP 123 ka protocol jo har device ki clock ko same rakhta hai.</dd>
<dt>Stratum</dt><dd>Reference clock se doori; chhota kareeb hai.</dd>
<dt>Sequence number</dt><dd>Messages par lagne wala counter taaki gaps dikh sakein.</dd>
<dt>Rate limit</dt><dd>Ek source se per second messages par cap, floods se bachne ke liye.</dd>
<dt>RFC 3164 / 5424</dt><dd>Purane aur naye syslog message formats.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Yaad rakho</th></tr>
<tr><td>Default port aur transport</td><td>UDP 514, delivery guarantee nahi</td></tr>
<tr><td>Reliable options</td><td>TCP, aur encryption ke liye TLS (aksar 6514)</td></tr>
<tr><td>Severity names order mein</td><td>emergencies, alerts, critical, errors, warnings, notifications, informational, debugging</td></tr>
<tr><td>Trap level informational</td><td>0 se 6 bhejta hai, 7 nahi</td></tr>
<tr><td>Cisco default facility</td><td>local7 (23), to informational PRI 190 hai</td></tr>
<tr><td>Timestamp se pehle asterisk</td><td>clock synchronised nahi</td></tr>
<tr><td>"Interface up" messages missing</td><td>trap level bahut kam (up severity 5 hai)</td></tr>
<tr><td>ufw block ka clue</td><td>ufw.log mein UFW BLOCK aur DPT=514</td></tr>
<tr><td>Stable source address</td><td>logging source-interface Loopback0</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! sender (router)</span>
logging host 10.1.50.100
logging trap informational
logging source-interface Loopback0
logging buffered 16384 informational
service timestamps log datetime msec
service sequence-numbers
ntp server 10.1.50.100
send log 5 "NK-TEST-1 syslog path check"
show logging
show ntp status
show clock

<span class="c"># collector (Linux)</span>
ss -uln | grep 514
sudo ufw status verbose
sudo ufw allow from 10.255.0.0/24 to any port 514 proto udp
sudo tail -f /var/log/remote/10.255.0.2.log
sudo rsyslogd -N1 &amp;&amp; sudo systemctl restart rsyslog</pre>

<div class="warn"><p><b>Aakhri minute ki galtiyan jo avoid karni hain.</b> Severity ulti mat padho. Yeh mat bhoolo ki buffer, console aur trap levels alag hain. Test message collector par dikhne se pehle ticket close mat karo. Firewall ko router range se UDP 514 se zyada wide mat kholo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Agar question kai symptoms deta hai (galat time, up messages missing, bilkul kuch nahi), to har symptom ko uske apne cause se map karo: NTP aur timestamps, trap level, path aur firewall. Ek symptom ke do unrelated causes kam hote hain, lekin ek ticket mein do faults ho sakte hain.</p></div>

<div class="scn"><h4>Somvar ki checklist jisne apna kharcha nikaal diya</h4><p>Kochi incident ke baad Meena Iyer ne ek page ki onboarding checklist likhi: chaar logging lines, NTP, ek test message, aur collector par line ka screenshot. Jab Lucknow ko naya router mila, engineer ne use follow kiya aur dus minute mein kaam khatam kiya. Teen mahine baad Lucknow par asli fault aaya to poore, sahi order ke logs ke saath dikha.</p><p><b>Seekh:</b> checklist knowledge ko habit banati hai, aur habit hi incident bachati hai.</p></div>

<div class="iv"><p class="q">"Naye router ko central logging mein onboard kaise karoge, batao."</p><p>Strong answer: logging host, informational trap level, loopback source aur datetime msec timestamps set karo; NTP ko internal server par point karo; show logging aur show ntp status se confirm karo; test message bhejo aur use collector par dhoondho; ensure karo ki collector firewall router loopback range se UDP 514 allow karta hai. Retention, access control aur recurring test ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Central logging ko host, trap level, source interface, timestamps aur NTP chahiye.</li>
<li>Chhote severity numbers zyada urgent hain; trap level apne neeche aur barabar sab bhejta hai.</li>
<li>UDP 514 unreliable hai; jahan loss ya privacy risk ho wahan TCP ya TLS use karo.</li>
<li>Delivery test message se sabit karo aur use paanch-step path se follow karo.</li>
<li>Floods aur log privacy ko limits, retention aur access rules se control karo.</li>
</ul></div>
`}};export{t as default};