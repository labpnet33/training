var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a flight, pilots do not rely on memory; they run a checklist. This chapter is your checklist for NTP, syslog, SNMP, QoS and file transfer. Read it the night before the exam, and use it at work when you build a new device: if you can tick every line, you are ready.</p>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain why logs, certificates, AAA and forensics need synchronised time.</li>
<li>I can explain stratum 0 to 16, and why stratum 16 means unsynchronised.</li>
<li>I can configure <code>ntp server</code>, <code>ntp peer</code>, <code>ntp master</code>, <code>ntp source</code> and NTP authentication.</li>
<li>I can set <code>clock timezone</code> and <code>clock summer-time</code>, and I know NTP always carries UTC.</li>
<li>I can read <code>show ntp status</code>, <code>show ntp associations</code> (*, ~, +, x, reach, st) and <code>show clock detail</code> (* and .).</li>
<li>I can recite syslog levels 0 to 7 and decode <code>%FACILITY-SEVERITY-MNEMONIC</code>.</li>
<li>I can send logs to console, VTY (with <code>terminal monitor</code>), buffer and a server with <code>logging trap</code>.</li>
<li>I can make logs show local time with the zone: <code>service timestamps log datetime msec localtime show-timezone</code>.</li>
<li>I can explain SNMP manager, agent, MIB, OID and Get/GetNext/GetBulk/Set/Trap/Inform with ports 161/162.</li>
<li>I can configure a v2c RO community with an ACL, traps, and an SNMPv3 authPriv group and user.</li>
<li>I can explain classification, marking (CoS, DSCP, EF 46), queuing (CBWFQ, LLQ), WRED, policing vs shaping, and voice requirements.</li>
<li>I can compare TFTP, FTP and SCP and back up a configuration or upgrade IOS.</li>
<li>I can troubleshoot "logs have the wrong time" from the associations table to the syslog collector.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Port summary">
<rect x="10" y="20" width="145" height="60" rx="8" fill="#bbf7d0"/><text x="82" y="45" text-anchor="middle" class="svg-ink" font-size="14">NTP</text><text x="82" y="65" text-anchor="middle" class="svg-muted" font-size="12">UDP 123</text>
<rect x="165" y="20" width="145" height="60" rx="8" fill="#fde68a"/><text x="237" y="45" text-anchor="middle" class="svg-ink" font-size="14">Syslog</text><text x="237" y="65" text-anchor="middle" class="svg-muted" font-size="12">UDP 514</text>
<rect x="320" y="20" width="145" height="60" rx="8" fill="#ddd6fe"/><text x="392" y="45" text-anchor="middle" class="svg-ink" font-size="14">SNMP</text><text x="392" y="65" text-anchor="middle" class="svg-muted" font-size="12">UDP 161 / 162</text>
<rect x="475" y="20" width="145" height="60" rx="8" fill="#fed7aa"/><text x="547" y="45" text-anchor="middle" class="svg-ink" font-size="14">TFTP</text><text x="547" y="65" text-anchor="middle" class="svg-muted" font-size="12">UDP 69</text>
<rect x="165" y="110" width="145" height="60" rx="8" fill="#e2e8f0"/><text x="237" y="135" text-anchor="middle" class="svg-ink" font-size="14">FTP</text><text x="237" y="155" text-anchor="middle" class="svg-muted" font-size="12">TCP 20 / 21</text>
<rect x="320" y="110" width="145" height="60" rx="8" fill="#bae6fd"/><text x="392" y="135" text-anchor="middle" class="svg-ink" font-size="14">SCP (SSH)</text><text x="392" y="155" text-anchor="middle" class="svg-muted" font-size="12">TCP 22</text>
</svg><p class="cap">The six port numbers from this module that the exam asks most.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Stratum</dt><dd>NTP distance from a reference clock; 16 = unsynchronised.</dd>
<dt>sys.peer (*)</dt><dd>The NTP server a device is currently synchronised to.</dd>
<dt>Reach</dt><dd>Octal register of the last eight NTP polls; 377 = all answered.</dd>
<dt>Severity</dt><dd>Syslog importance 0 (emergencies) to 7 (debugging).</dd>
<dt>Facility</dt><dd>In Cisco messages, the feature (LINK, OSPF); in the protocol, the source category (local7).</dd>
<dt>MIB / OID</dt><dd>The catalogue of manageable objects / the dotted number that names one.</dd>
<dt>Community</dt><dd>SNMPv1/v2c clear-text shared password, RO or RW.</dd>
<dt>authPriv</dt><dd>SNMPv3 level with authentication and encryption.</dd>
<dt>Trap / Inform</dt><dd>Unacknowledged / acknowledged SNMP notification.</dd>
<dt>DSCP / CoS</dt><dd>Layer 3 six-bit marking / Layer 2 three-bit marking.</dd>
<dt>LLQ</dt><dd>Queuing with a strict-priority queue for voice.</dd>
<dt>Policing / Shaping</dt><dd>Drop or re-mark excess / buffer and delay excess.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>NTP</td><td>UDP 123; stratum 16 = unsynchronised; <code>ntp master</code> default stratum 8; NTP carries UTC.</td></tr>
<tr><td>NTP output</td><td><code>*</code> = sys.peer, <code>~</code> = configured, <code>x</code> = falseticker; reach 377 = eight good polls.</td></tr>
<tr><td>Clock</td><td><code>*</code> before time = not authoritative; <code>.</code> = was synchronised, lost server.</td></tr>
<tr><td>Syslog levels</td><td>0 emergencies, 1 alerts, 2 critical, 3 errors, 4 warnings, 5 notifications, 6 informational, 7 debugging.</td></tr>
<tr><td>Syslog rule</td><td>A level includes itself and all more severe (lower) levels. Default trap level informational; default console debugging.</td></tr>
<tr><td>SNMP</td><td>Agent UDP 161, manager (traps/informs) UDP 162; GetBulk and Inform from v2c; only v3 encrypts.</td></tr>
<tr><td>QoS</td><td>EF = 46; AFxy = 8x + 2y; CoS 3 bits; voice ≤ 150 ms, ≤ 30 ms jitter, ≤ 1 % loss; policer drops, shaper delays.</td></tr>
<tr><td>Files</td><td>TFTP UDP 69 no auth; FTP TCP 20/21 clear text; SCP TCP 22 encrypted.</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! NTP</span>
ntp server 10.1.1.100 [prefer] [key 1]
ntp peer 10.1.12.2
ntp master [stratum]
ntp source Loopback0
ntp authenticate
ntp authentication-key 1 md5 &lt;string&gt;
ntp trusted-key 1
ntp update-calendar
clock timezone IST 5 30
clock summer-time CEST recurring last Sun Mar 2:00 last Sun Oct 3:00
<span class="c">! syslog</span>
logging host 10.1.1.100
logging trap informational
logging buffered 16384 informational
logging console warnings
logging monitor informational
logging source-interface Loopback0
service timestamps log datetime msec localtime show-timezone
service sequence-numbers
<span class="c">! SNMP</span>
access-list 10 permit host 10.1.1.100
snmp-server community NKRO RO 10
snmp-server location Pune-HQ
snmp-server enable traps snmp linkdown linkup
snmp-server host 10.1.1.100 [informs] version 2c NKTRAP
snmp-server group NKGRP v3 priv access 10
snmp-server user nkmon NKGRP v3 auth sha &lt;pw&gt; priv aes 128 &lt;pw&gt;
<span class="c">! files</span>
copy running-config tftp:
copy scp://nkadmin@10.1.1.100/&lt;file&gt; flash:
verify /md5 flash:&lt;image&gt;</pre>
<pre class="out">show clock detail          show ntp status          show ntp associations
show logging               terminal monitor         show snmp
show snmp community        show snmp user           show flash:</pre>

<div class="eg"><p><b>Worked example: exam-style reasoning.</b> "A router logs <code>*Sep 29 03:08:15.221: %OSPF-5-ADJCHG</code> but the syslog server configured with <code>logging trap warnings</code> never receives it. Why?" Two separate facts: the star says the clock is not synchronised (fix NTP), and severity 5 is less severe than warnings (4), so it is filtered (change to notifications or informational). Always look for every clue in one line.</p></div>

<div class="warn"><p><b>Common mistake.</b> Memorising commands without the order of operations. On a new device the order is: NTP first (so every later log has good time), then time zone and timestamps, then syslog, then SNMP, then backup with SCP.</p></div>

<div class="exam"><p><b>Exam trap.</b> Watch for distractors that swap 161 and 162, call stratum 16 "best", say v2c encrypts, say shaping drops, or claim <code>clock timezone</code> changes NTP itself.</p></div>

<div class="scn"><h4>The day-one template</h4><p>A managed-services team built a "day-one" template for every new branch router: three NTP servers with authentication and a loopback source, IST time zone, local timestamps with the zone and sequence numbers, logging to two collectors at informational, SNMPv3 authPriv limited to the NMS subnet, and a nightly SCP backup. Tickets about "cannot correlate logs" or "router not monitored" dropped to almost zero within a quarter.</p><p><b>Lesson:</b> these services are not optional extras; they are the foundation that makes every other troubleshooting task possible.</p></div>

<div class="iv"><p class="q">"You are handed a new router. What operational services do you configure before it goes live?"</p><p>Strong answer walks the template: NTP to several authenticated internal servers with a loopback source and the correct time zone; syslog to central collectors at informational with local timestamps, the zone, sequence numbers and a loopback source; SNMPv3 authPriv restricted by ACL, plus traps or informs for link and config events; QoS policy on WAN interfaces if voice is carried; and a configuration backup over SCP. Then say how you verify each one.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NTP first, then time zone and timestamps, then syslog, then SNMP, then backups.</li>
<li>Ports: 123, 514, 161/162, 69, 20/21, 22.</li>
<li>Syslog levels 0 to 7 and the "this level and lower" rule are guaranteed exam material.</li>
<li>SNMPv3 authPriv is the secure choice; v1/v2c communities are clear text.</li>
<li>QoS: mark EF for voice, LLQ for priority, shape to the CIR; policers drop, shapers delay.</li>
</ul></div>
`,hi:`
<p>Flight se pehle pilots yaaddasht par bharosa nahi karte; woh checklist chalate hain. Yeh chapter NTP, syslog, SNMP, QoS aur file transfer ke liye aapki checklist hai. Exam se pehli raat ise padho, aur kaam par naya device banate waqt use karo: agar aap har line tick kar sakte ho, to aap ready ho.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Main samjha sakta hoon ki logs, certificates, AAA aur forensics ko synchronised time kyun chahiye.</li>
<li>Main stratum 0 se 16 samjha sakta hoon, aur kyun stratum 16 ka matlab unsynchronised hai.</li>
<li>Main <code>ntp server</code>, <code>ntp peer</code>, <code>ntp master</code>, <code>ntp source</code> aur NTP authentication configure kar sakta hoon.</li>
<li>Main <code>clock timezone</code> aur <code>clock summer-time</code> set kar sakta hoon, aur jaanta hoon ki NTP hamesha UTC le jaata hai.</li>
<li>Main <code>show ntp status</code>, <code>show ntp associations</code> (*, ~, +, x, reach, st) aur <code>show clock detail</code> (* aur .) padh sakta hoon.</li>
<li>Main syslog levels 0 se 7 bol sakta hoon aur <code>%FACILITY-SEVERITY-MNEMONIC</code> decode kar sakta hoon.</li>
<li>Main logs ko console, VTY (<code>terminal monitor</code> ke saath), buffer aur <code>logging trap</code> ke saath server par bhej sakta hoon.</li>
<li>Main logs ko zone ke saath local time dikhwa sakta hoon: <code>service timestamps log datetime msec localtime show-timezone</code>.</li>
<li>Main SNMP manager, agent, MIB, OID aur Get/GetNext/GetBulk/Set/Trap/Inform ko ports 161/162 ke saath samjha sakta hoon.</li>
<li>Main ACL ke saath v2c RO community, traps, aur SNMPv3 authPriv group aur user configure kar sakta hoon.</li>
<li>Main classification, marking (CoS, DSCP, EF 46), queuing (CBWFQ, LLQ), WRED, policing vs shaping, aur voice requirements samjha sakta hoon.</li>
<li>Main TFTP, FTP aur SCP ki tulna kar sakta hoon aur configuration backup ya IOS upgrade kar sakta hoon.</li>
<li>Main "logs have the wrong time" ko associations table se syslog collector tak troubleshoot kar sakta hoon.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Port summary">
<rect x="10" y="20" width="145" height="60" rx="8" fill="#bbf7d0"/><text x="82" y="45" text-anchor="middle" class="svg-ink" font-size="14">NTP</text><text x="82" y="65" text-anchor="middle" class="svg-muted" font-size="12">UDP 123</text>
<rect x="165" y="20" width="145" height="60" rx="8" fill="#fde68a"/><text x="237" y="45" text-anchor="middle" class="svg-ink" font-size="14">Syslog</text><text x="237" y="65" text-anchor="middle" class="svg-muted" font-size="12">UDP 514</text>
<rect x="320" y="20" width="145" height="60" rx="8" fill="#ddd6fe"/><text x="392" y="45" text-anchor="middle" class="svg-ink" font-size="14">SNMP</text><text x="392" y="65" text-anchor="middle" class="svg-muted" font-size="12">UDP 161 / 162</text>
<rect x="475" y="20" width="145" height="60" rx="8" fill="#fed7aa"/><text x="547" y="45" text-anchor="middle" class="svg-ink" font-size="14">TFTP</text><text x="547" y="65" text-anchor="middle" class="svg-muted" font-size="12">UDP 69</text>
<rect x="165" y="110" width="145" height="60" rx="8" fill="#e2e8f0"/><text x="237" y="135" text-anchor="middle" class="svg-ink" font-size="14">FTP</text><text x="237" y="155" text-anchor="middle" class="svg-muted" font-size="12">TCP 20 / 21</text>
<rect x="320" y="110" width="145" height="60" rx="8" fill="#bae6fd"/><text x="392" y="135" text-anchor="middle" class="svg-ink" font-size="14">SCP (SSH)</text><text x="392" y="155" text-anchor="middle" class="svg-muted" font-size="12">TCP 22</text>
</svg><p class="cap">Is module ke chhe port numbers jo exam sabse zyada poochta hai.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Stratum</dt><dd>Reference clock se NTP doori; 16 = unsynchronised.</dd>
<dt>sys.peer (*)</dt><dd>Woh NTP server jisse device abhi synchronised hai.</dd>
<dt>Reach</dt><dd>Pichhle aath NTP polls ka octal register; 377 = sabka jawab aaya.</dd>
<dt>Severity</dt><dd>Syslog importance 0 (emergencies) se 7 (debugging).</dd>
<dt>Facility</dt><dd>Cisco messages mein feature (LINK, OSPF); protocol mein source category (local7).</dd>
<dt>MIB / OID</dt><dd>Manage kiye ja sakne wale objects ka catalogue / ek object ka naam dene wala dotted number.</dd>
<dt>Community</dt><dd>SNMPv1/v2c ka clear-text shared password, RO ya RW.</dd>
<dt>authPriv</dt><dd>Authentication aur encryption wala SNMPv3 level.</dd>
<dt>Trap / Inform</dt><dd>Bina acknowledgement / acknowledgement wali SNMP notification.</dd>
<dt>DSCP / CoS</dt><dd>Layer 3 chhe-bit marking / Layer 2 teen-bit marking.</dd>
<dt>LLQ</dt><dd>Voice ke liye strict-priority queue wali queuing.</dd>
<dt>Policing / Shaping</dt><dd>Extra ko drop ya re-mark / extra ko buffer karke delay.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>NTP</td><td>UDP 123; stratum 16 = unsynchronised; <code>ntp master</code> default stratum 8; NTP UTC le jaata hai.</td></tr>
<tr><td>NTP output</td><td><code>*</code> = sys.peer, <code>~</code> = configured, <code>x</code> = falseticker; reach 377 = aath achhe polls.</td></tr>
<tr><td>Clock</td><td>Time se pehle <code>*</code> = authoritative nahi; <code>.</code> = sync tha, server kho gaya.</td></tr>
<tr><td>Syslog levels</td><td>0 emergencies, 1 alerts, 2 critical, 3 errors, 4 warnings, 5 notifications, 6 informational, 7 debugging.</td></tr>
<tr><td>Syslog rule</td><td>Level khud ko aur saare zyada serious (chhote) levels ko include karta hai. Default trap level informational; default console debugging.</td></tr>
<tr><td>SNMP</td><td>Agent UDP 161, manager (traps/informs) UDP 162; GetBulk aur Inform v2c se; sirf v3 encrypt karta hai.</td></tr>
<tr><td>QoS</td><td>EF = 46; AFxy = 8x + 2y; CoS 3 bits; voice ≤ 150 ms, ≤ 30 ms jitter, ≤ 1 % loss; policer drop karta hai, shaper delay.</td></tr>
<tr><td>Files</td><td>TFTP UDP 69 bina auth; FTP TCP 20/21 clear text; SCP TCP 22 encrypted.</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! NTP</span>
ntp server 10.1.1.100 [prefer] [key 1]
ntp peer 10.1.12.2
ntp master [stratum]
ntp source Loopback0
ntp authenticate
ntp authentication-key 1 md5 &lt;string&gt;
ntp trusted-key 1
ntp update-calendar
clock timezone IST 5 30
clock summer-time CEST recurring last Sun Mar 2:00 last Sun Oct 3:00
<span class="c">! syslog</span>
logging host 10.1.1.100
logging trap informational
logging buffered 16384 informational
logging console warnings
logging monitor informational
logging source-interface Loopback0
service timestamps log datetime msec localtime show-timezone
service sequence-numbers
<span class="c">! SNMP</span>
access-list 10 permit host 10.1.1.100
snmp-server community NKRO RO 10
snmp-server location Pune-HQ
snmp-server enable traps snmp linkdown linkup
snmp-server host 10.1.1.100 [informs] version 2c NKTRAP
snmp-server group NKGRP v3 priv access 10
snmp-server user nkmon NKGRP v3 auth sha &lt;pw&gt; priv aes 128 &lt;pw&gt;
<span class="c">! files</span>
copy running-config tftp:
copy scp://nkadmin@10.1.1.100/&lt;file&gt; flash:
verify /md5 flash:&lt;image&gt;</pre>
<pre class="out">show clock detail          show ntp status          show ntp associations
show logging               terminal monitor         show snmp
show snmp community        show snmp user           show flash:</pre>

<div class="eg"><p><b>Worked example: exam-style soch.</b> "Ek router <code>*Sep 29 03:08:15.221: %OSPF-5-ADJCHG</code> log karta hai lekin <code>logging trap warnings</code> ke saath configured syslog server ko yeh kabhi nahi milta. Kyun?" Do alag facts: star kehta hai clock synchronised nahi hai (NTP theek karo), aur severity 5 warnings (4) se kam serious hai, isliye filter ho jaata hai (notifications ya informational par badlo). Hamesha ek line mein har clue dhoondho.</p></div>

<div class="warn"><p><b>Common galti.</b> Order of operations samjhe bina commands ratna. Naye device par order hai: pehle NTP (taaki baad ke har log ka time achha ho), phir time zone aur timestamps, phir syslog, phir SNMP, phir SCP se backup.</p></div>

<div class="exam"><p><b>Exam trap.</b> Aise distractors se bacho jo 161 aur 162 ulat dete hain, stratum 16 ko "best" kehte hain, kehte hain v2c encrypt karta hai, kehte hain shaping drop karta hai, ya daawa karte hain ki <code>clock timezone</code> khud NTP ko badalta hai.</p></div>

<div class="scn"><h4>Day-one template</h4><p>Ek managed-services team ne har naye branch router ke liye "day-one" template banaya: authentication aur loopback source ke saath teen NTP servers, IST time zone, zone aur sequence numbers ke saath local timestamps, informational par do collectors ko logging, NMS subnet tak limited SNMPv3 authPriv, aur nightly SCP backup. Ek quarter ke andar "logs correlate nahi ho rahe" ya "router monitor nahi ho raha" wale tickets lagbhag zero ho gaye.</p><p><b>Seekh:</b> yeh services optional extras nahi hain; yeh woh foundation hain jo har doosre troubleshooting kaam ko mumkin banati hai.</p></div>

<div class="iv"><p class="q">"Aapko naya router diya gaya hai. Live jaane se pehle kaunsi operational services configure karoge?"</p><p>Strong answer template walk karta hai: loopback source aur sahi time zone ke saath kai authenticated internal servers ko NTP; local timestamps, zone, sequence numbers aur loopback source ke saath informational par central collectors ko syslog; ACL se restricted SNMPv3 authPriv, plus link aur config events ke liye traps ya informs; agar voice jaati hai to WAN interfaces par QoS policy; aur SCP par configuration backup. Phir batao ki har ek ko kaise verify karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle NTP, phir time zone aur timestamps, phir syslog, phir SNMP, phir backups.</li>
<li>Ports: 123, 514, 161/162, 69, 20/21, 22.</li>
<li>Syslog levels 0 se 7 aur "yeh level aur chhote" rule pakka exam material hai.</li>
<li>SNMPv3 authPriv secure choice hai; v1/v2c communities clear text hain.</li>
<li>QoS: voice ko EF mark karo, priority ke liye LLQ, CIR tak shape karo; policers drop karte hain, shapers delay.</li>
</ul></div>
`}};export{e as default};