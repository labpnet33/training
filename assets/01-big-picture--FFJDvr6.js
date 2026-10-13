var e={id:`big-picture`,h:{en:`The big picture: time, logs and monitoring`,hi:`Big picture: time, logs aur monitoring`},body:{en:`
<h3>What you will learn</h3>
<p>By the end of this module you will be able to:</p>
<ul>
<li>Explain why every device in a network needs the <b>same, correct time</b>, and configure <b>NTP</b> clients, servers, peers, time zones and authentication on Cisco IOS.</li>
<li>Read <code>show ntp status</code> and <code>show ntp associations</code> and say exactly what <code>*</code>, <code>~</code>, stratum and reach mean.</li>
<li>Decode any <b>syslog</b> message, recite the eight severity levels, and send logs to the console, terminal sessions, the local buffer and a remote syslog server.</li>
<li>Explain <b>SNMP</b> managers, agents, MIBs and OIDs, the message types, and configure SNMPv2c communities and SNMPv3 users securely.</li>
<li>Explain the <b>QoS</b> ideas the CCNA expects: classification, marking, queuing, congestion, policing and shaping, and what voice traffic needs.</li>
<li>Move files with <b>TFTP, FTP and SCP</b> for backups and IOS upgrades.</li>
<li>Follow a troubleshooting workflow and fix the lab ticket "Logs have the wrong time".</li>
</ul>

<h3>Prerequisites</h3>
<p>You should already be comfortable with the IOS CLI and its modes (module <i>Cisco IOS from zero</i>), IPv4 addressing, static routes, and the idea that TCP and UDP use port numbers. Access control lists get their own module later; here you only need to know that a standard ACL can permit or deny a source address. Device hardening with SSH and AAA also comes later, in <i>Device access, SSH, AAA and SFTP/SCP</i>.</p>

<h3>An analogy: the hospital ward</h3>
<p>Think of a busy hospital ward. Every room has a <b>wall clock</b>, and all of them are set from one master clock, because when a patient's heart rate drops, the doctors must know whether the medicine was given before or after. Every nurse writes events in a <b>patient chart</b> with a time and a seriousness level: "routine check", "warning", "emergency". A <b>monitoring desk</b> at the nurses' station can look at any patient's machine at any time, and the machines beep on their own when something goes wrong. Finally, when the corridor is crowded, <b>stretchers with emergency patients go first</b>.</p>
<p>A network works the same way:</p>
<table class="cmp"><tr><th>Hospital</th><th>Network</th><th>Protocol</th></tr>
<tr><td>Master clock and wall clocks</td><td>Every device agrees on the time</td><td>NTP (UDP 123)</td></tr>
<tr><td>Patient chart with severity</td><td>Event messages with severity 0 to 7</td><td>Syslog (UDP 514)</td></tr>
<tr><td>Monitoring desk and beeping machines</td><td>A manager polls devices; devices send alerts</td><td>SNMP (UDP 161/162)</td></tr>
<tr><td>Emergency stretchers first</td><td>Voice and critical traffic first</td><td>QoS (DSCP, queues)</td></tr>
<tr><td>Moving files between wards</td><td>Config backups, IOS images</td><td>TFTP, FTP, SCP</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Operations services around a router">
<rect x="250" y="120" width="140" height="56" rx="8" fill="#bae6fd"/><text x="320" y="144" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="320" y="162" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.1</text>
<rect x="30" y="20" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="115" y="42" text-anchor="middle" class="svg-ink" font-size="13">NTP server</text><text x="115" y="59" text-anchor="middle" class="svg-muted" font-size="12">time, UDP 123</text>
<rect x="440" y="20" width="170" height="50" rx="8" fill="#fde68a"/><text x="525" y="42" text-anchor="middle" class="svg-ink" font-size="13">Syslog server</text><text x="525" y="59" text-anchor="middle" class="svg-muted" font-size="12">logs, UDP 514</text>
<rect x="30" y="230" width="170" height="50" rx="8" fill="#ddd6fe"/><text x="115" y="252" text-anchor="middle" class="svg-ink" font-size="13">SNMP manager</text><text x="115" y="269" text-anchor="middle" class="svg-muted" font-size="12">UDP 161 / 162</text>
<rect x="440" y="230" width="170" height="50" rx="8" fill="#fed7aa"/><text x="525" y="252" text-anchor="middle" class="svg-ink" font-size="13">File server</text><text x="525" y="269" text-anchor="middle" class="svg-muted" font-size="12">TFTP, FTP, SCP</text>
<line x1="190" y1="70" x2="270" y2="120" stroke="#64748b" stroke-width="2"/><line x1="450" y1="70" x2="370" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="190" y1="230" x2="270" y2="176" stroke="#64748b" stroke-width="2"/><line x1="450" y1="230" x2="370" y2="176" stroke="#64748b" stroke-width="2"/>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="12">QoS on every interface</text>
</svg><p class="cap">One router, four supporting services. In the lab, a single server called NMS (10.1.1.100) plays the NTP, syslog and SNMP roles.</p></div>

<h3>Why time matters so much</h3>
<p>Beginners often think the clock on a router is cosmetic. It is not. Correct, shared time is needed for:</p>
<ul>
<li><b>Log correlation.</b> A link flaps at 14:05. Five devices logged something. If R1 thinks it is 09:08 and R2 thinks it is 16:16, you cannot put the events in order, and you cannot prove what caused what.</li>
<li><b>Certificates.</b> Every certificate has a "valid from" and "valid to" date. A router whose clock says 1993 (the IOS default after a reload without a battery-backed calendar) rejects valid certificates, so HTTPS management, IPsec with certificates and secure controller connections fail.</li>
<li><b>AAA and security.</b> Accounting records show who logged in and what they typed, with a time. Kerberos refuses tickets when clocks differ by more than a few minutes. Time-based ACLs and scheduled jobs only work if the clock is right.</li>
<li><b>Forensics and compliance.</b> Auditors ask "who changed the config at what time?" A log with a wrong timestamp is worthless as evidence.</li>
</ul>

<h3>How the module is organised</h3>
<p>Chapters 2 to 4 cover NTP from concepts to verification. Chapters 5 and 6 cover syslog. Chapters 7 and 8 cover SNMP. Chapter 9 is QoS concepts, chapter 10 is file transfer with TFTP, FTP and SCP, chapter 11 is the troubleshooting workflow with the "Logs have the wrong time" lab, and chapter 12 is the exam checklist.</p>
<p>The labs use the same addressing throughout. R1 has <code>10.1.1.1/24</code> on Gi0/0 toward the server LAN and <code>10.1.12.1/30</code> on Gi0/1 toward R2 (<code>10.1.12.2</code>). The monitoring server <b>NMS</b> is <code>10.1.1.100</code> and runs the NTP service, the syslog collector and the SNMP manager. In the troubleshooting lab a separate <b>NTP-SRV</b> sits at <code>10.1.1.123</code>.</p>

<div class="eg"><p><b>Worked example.</b> A link on R2 went down at 14:05:12 IST. R1 logged an OSPF neighbour change at "09:08:15 UTC" with a star, R2 logged the interface down at "10:47:12 UTC". Convert R2 to IST: 10:47 + 5:30 = 16:17 IST, which is two hours after the real event. R1's 09:08 UTC is 14:38 IST, but its star says the clock was never synchronised, so this number is a guess too. Neither log can be trusted until NTP is fixed. That is exactly lab 2.</p></div>

<div class="warn"><p><b>Common mistake.</b> Setting the clock by hand with <code>clock set</code> and calling it done. A manual clock drifts by seconds per day, resets after a reload on many platforms, and is marked as not authoritative. Always use NTP in production.</p></div>

<div class="exam"><p><b>Exam trap.</b> Know the ports cold: NTP UDP 123, syslog UDP 514, SNMP UDP 161 (agent, polls) and UDP 162 (manager, traps and informs), TFTP UDP 69, FTP TCP 20/21, SCP TCP 22. Questions love swapping 161 and 162.</p></div>

<div class="scn"><h4>The outage nobody could explain</h4><p>A retail company lost payments for eight minutes. The firewall log showed a policy push at 11:02, the core switch showed a spanning-tree change at 10:58 and the WAN router showed its link down at 11:31. The team spent a day blaming the spanning-tree change. Then someone noticed the WAN router had no NTP and was 29 minutes fast. Corrected, the link drop happened at 11:02, the same second as the firewall push that had broken the tunnel.</p><p><b>Lesson:</b> without synchronised time you will blame the wrong event. NTP is the first thing to configure on any new device.</p></div>

<div class="iv"><p class="q">"Why do network devices need accurate time?"</p><p>A strong answer lists concrete reasons, not just "it is good practice": log correlation across devices during incidents, certificate validity for PKI, IPsec and secure management, AAA accounting and Kerberos, scheduled tasks, and forensics. Then say how you achieve it: NTP from a reliable internal source, authenticated, with logs stamped in local time and the time zone shown.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NTP keeps time, syslog records events, SNMP monitors, QoS prioritises, TFTP/FTP/SCP move files.</li>
<li>Shared correct time is needed for logs, certificates, AAA and forensics.</li>
<li>Ports: NTP 123, syslog 514, SNMP 161/162 (all UDP); TFTP UDP 69; FTP TCP 20/21; SCP TCP 22.</li>
<li>The lab NMS 10.1.1.100 acts as NTP server, syslog collector and SNMP manager.</li>
<li>A manually set clock is not authoritative; production networks use NTP.</li>
</ul></div>
`,hi:`
<h3>Aap kya seekhoge</h3>
<p>Is module ke end tak aap yeh kar paoge:</p>
<ul>
<li>Samjha paoge ki network ke har device ko <b>same, sahi time</b> kyun chahiye, aur Cisco IOS par <b>NTP</b> clients, servers, peers, time zones aur authentication configure kar paoge.</li>
<li><code>show ntp status</code> aur <code>show ntp associations</code> padh kar exactly bata paoge ki <code>*</code>, <code>~</code>, stratum aur reach ka matlab kya hai.</li>
<li>Koi bhi <b>syslog</b> message decode kar paoge, aath severity levels bol paoge, aur logs ko console, terminal sessions, local buffer aur remote syslog server par bhej paoge.</li>
<li><b>SNMP</b> managers, agents, MIBs aur OIDs, message types samjha paoge, aur SNMPv2c communities aur SNMPv3 users securely configure kar paoge.</li>
<li>CCNA jo <b>QoS</b> ideas expect karta hai woh samjha paoge: classification, marking, queuing, congestion, policing aur shaping, aur voice traffic ko kya chahiye.</li>
<li>Backups aur IOS upgrades ke liye <b>TFTP, FTP aur SCP</b> se files move kar paoge.</li>
<li>Ek troubleshooting workflow follow karke lab ticket "Logs have the wrong time" fix kar paoge.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapko IOS CLI aur uske modes (module <i>Cisco IOS from zero</i>), IPv4 addressing, static routes, aur yeh idea ki TCP aur UDP port numbers use karte hain, pehle se aana chahiye. Access control lists ka apna module baad mein aata hai; yahan bas itna pata hona chahiye ki standard ACL ek source address ko permit ya deny kar sakti hai. SSH aur AAA ke saath device hardening bhi baad mein aata hai, <i>Device access, SSH, AAA and SFTP/SCP</i> mein.</p>

<h3>Ek analogy: hospital ward</h3>
<p>Ek busy hospital ward socho. Har room mein ek <b>wall clock</b> hai, aur sab ek master clock se set hote hain, kyunki jab patient ki heart rate girti hai, doctors ko pata hona chahiye ki dawai pehle di gayi thi ya baad mein. Har nurse events ko <b>patient chart</b> mein time aur seriousness level ke saath likhti hai: "routine check", "warning", "emergency". Nurses' station par ek <b>monitoring desk</b> kisi bhi waqt kisi bhi patient ki machine dekh sakta hai, aur kuch galat hone par machines khud beep karti hain. Aur jab corridor mein bheed ho, to <b>emergency patients wale stretchers pehle jaate hain</b>.</p>
<p>Network bilkul aise hi kaam karta hai:</p>
<table class="cmp"><tr><th>Hospital</th><th>Network</th><th>Protocol</th></tr>
<tr><td>Master clock aur wall clocks</td><td>Har device time par agree karta hai</td><td>NTP (UDP 123)</td></tr>
<tr><td>Severity ke saath patient chart</td><td>Severity 0 se 7 wale event messages</td><td>Syslog (UDP 514)</td></tr>
<tr><td>Monitoring desk aur beep karti machines</td><td>Manager devices ko poll karta hai; devices alerts bhejte hain</td><td>SNMP (UDP 161/162)</td></tr>
<tr><td>Emergency stretchers pehle</td><td>Voice aur critical traffic pehle</td><td>QoS (DSCP, queues)</td></tr>
<tr><td>Wards ke beech files le jaana</td><td>Config backups, IOS images</td><td>TFTP, FTP, SCP</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Router ke aas-paas operations services">
<rect x="250" y="120" width="140" height="56" rx="8" fill="#bae6fd"/><text x="320" y="144" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="320" y="162" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.1</text>
<rect x="30" y="20" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="115" y="42" text-anchor="middle" class="svg-ink" font-size="13">NTP server</text><text x="115" y="59" text-anchor="middle" class="svg-muted" font-size="12">time, UDP 123</text>
<rect x="440" y="20" width="170" height="50" rx="8" fill="#fde68a"/><text x="525" y="42" text-anchor="middle" class="svg-ink" font-size="13">Syslog server</text><text x="525" y="59" text-anchor="middle" class="svg-muted" font-size="12">logs, UDP 514</text>
<rect x="30" y="230" width="170" height="50" rx="8" fill="#ddd6fe"/><text x="115" y="252" text-anchor="middle" class="svg-ink" font-size="13">SNMP manager</text><text x="115" y="269" text-anchor="middle" class="svg-muted" font-size="12">UDP 161 / 162</text>
<rect x="440" y="230" width="170" height="50" rx="8" fill="#fed7aa"/><text x="525" y="252" text-anchor="middle" class="svg-ink" font-size="13">File server</text><text x="525" y="269" text-anchor="middle" class="svg-muted" font-size="12">TFTP, FTP, SCP</text>
<line x1="190" y1="70" x2="270" y2="120" stroke="#64748b" stroke-width="2"/><line x1="450" y1="70" x2="370" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="190" y1="230" x2="270" y2="176" stroke="#64748b" stroke-width="2"/><line x1="450" y1="230" x2="370" y2="176" stroke="#64748b" stroke-width="2"/>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="12">Har interface par QoS</text>
</svg><p class="cap">Ek router, chaar supporting services. Lab mein NMS (10.1.1.100) naam ka ek hi server NTP, syslog aur SNMP teeno roles nibhata hai.</p></div>

<h3>Time itna important kyun hai</h3>
<p>Beginners aksar sochte hain ki router ki clock sirf dikhawe ke liye hai. Aisa nahi hai. Sahi, shared time in cheezon ke liye chahiye:</p>
<ul>
<li><b>Log correlation.</b> 14:05 par ek link flap hota hai. Paanch devices ne kuch log kiya. Agar R1 sochta hai ki 09:08 hai aur R2 sochta hai 16:16, to aap events ko order mein nahi laga sakte, aur sabit nahi kar sakte ki kisne kya cause kiya.</li>
<li><b>Certificates.</b> Har certificate ki "valid from" aur "valid to" date hoti hai. Jis router ki clock 1993 bolti hai (battery-backed calendar ke bina reload ke baad IOS ka default), woh valid certificates reject karta hai, isliye HTTPS management, certificates wala IPsec aur secure controller connections fail hote hain.</li>
<li><b>AAA aur security.</b> Accounting records dikhate hain ki kisne login kiya aur kya type kiya, time ke saath. Kerberos tickets reject karta hai jab clocks mein kuch minute se zyada fark ho. Time-based ACLs aur scheduled jobs tabhi chalte hain jab clock sahi ho.</li>
<li><b>Forensics aur compliance.</b> Auditors poochte hain "config kisne kitne baje badla?" Galat timestamp wala log evidence ke roop mein bekaar hai.</li>
</ul>

<h3>Module kaise organise hai</h3>
<p>Chapters 2 se 4 NTP ko concepts se verification tak cover karte hain. Chapters 5 aur 6 syslog. Chapters 7 aur 8 SNMP. Chapter 9 QoS concepts hai, chapter 10 TFTP, FTP aur SCP se file transfer, chapter 11 "Logs have the wrong time" lab ke saath troubleshooting workflow, aur chapter 12 exam checklist.</p>
<p>Labs poore module mein same addressing use karte hain. R1 ke paas Gi0/0 par server LAN ki taraf <code>10.1.1.1/24</code> aur Gi0/1 par R2 (<code>10.1.12.2</code>) ki taraf <code>10.1.12.1/30</code> hai. Monitoring server <b>NMS</b> <code>10.1.1.100</code> hai aur NTP service, syslog collector aur SNMP manager chalata hai. Troubleshooting lab mein ek alag <b>NTP-SRV</b> <code>10.1.1.123</code> par hai.</p>

<div class="eg"><p><b>Worked example.</b> R2 par ek link 14:05:12 IST par down hua. R1 ne ek OSPF neighbour change "09:08:15 UTC" par star ke saath log kiya, R2 ne interface down "10:47:12 UTC" par log kiya. R2 ko IST mein badlo: 10:47 + 5:30 = 16:17 IST, jo asli event se do ghante baad hai. R1 ka 09:08 UTC 14:38 IST hai, lekin uska star batata hai ki clock kabhi sync nahi hui, isliye yeh number bhi ek andaza hai. NTP fix hone tak dono mein se koi log bharose layak nahi. Yahi exactly lab 2 hai.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>clock set</code> se haath se clock set karke kaam khatam samajhna. Manual clock din mein kuch seconds drift karti hai, kai platforms par reload ke baad reset ho jaati hai, aur not authoritative mark hoti hai. Production mein hamesha NTP use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Ports pakke yaad rakho: NTP UDP 123, syslog UDP 514, SNMP UDP 161 (agent, polls) aur UDP 162 (manager, traps aur informs), TFTP UDP 69, FTP TCP 20/21, SCP TCP 22. Questions 161 aur 162 ko ulatna pasand karte hain.</p></div>

<div class="scn"><h4>Woh outage jise koi samjha nahi paaya</h4><p>Ek retail company ke payments aath minute ke liye ruk gaye. Firewall log mein 11:02 par policy push dikha, core switch mein 10:58 par spanning-tree change dikha aur WAN router mein 11:31 par link down. Team ne poora din spanning-tree change ko blame kiya. Phir kisi ne dekha ki WAN router par NTP nahi tha aur woh 29 minute aage tha. Correct karne par link drop 11:02 par hua tha, bilkul usi second jab firewall push ne tunnel tod diya tha.</p><p><b>Seekh:</b> synchronised time ke bina aap galat event ko blame karoge. Kisi bhi naye device par NTP sabse pehli cheez hai jo configure karni chahiye.</p></div>

<div class="iv"><p class="q">"Network devices ko accurate time kyun chahiye?"</p><p>Strong answer concrete reasons list karta hai, sirf "yeh good practice hai" nahi: incidents ke dauran devices ke beech log correlation, PKI, IPsec aur secure management ke liye certificate validity, AAA accounting aur Kerberos, scheduled tasks, aur forensics. Phir batao ki aap ise kaise achieve karte ho: reliable internal source se NTP, authenticated, aur logs local time mein time zone dikhate hue stamp hon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NTP time rakhta hai, syslog events record karta hai, SNMP monitor karta hai, QoS priority deta hai, TFTP/FTP/SCP files move karte hain.</li>
<li>Logs, certificates, AAA aur forensics ke liye shared sahi time chahiye.</li>
<li>Ports: NTP 123, syslog 514, SNMP 161/162 (sab UDP); TFTP UDP 69; FTP TCP 20/21; SCP TCP 22.</li>
<li>Lab NMS 10.1.1.100 NTP server, syslog collector aur SNMP manager ka kaam karta hai.</li>
<li>Haath se set ki gayi clock authoritative nahi hoti; production networks NTP use karte hain.</li>
</ul></div>
`}};export{e as default};