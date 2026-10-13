var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You can now make a Junos device observable, time-correct, monitored, safely reachable and recoverable. This chapter is your revision sheet for the system services and monitoring objectives of JNCIA-Junos (JN0-106).</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Services summary">
<rect x="10" y="30" width="120" height="70" rx="8" fill="#bae6fd"/><text x="70" y="58" text-anchor="middle" class="svg-ink" font-size="13">syslog</text><text x="70" y="78" text-anchor="middle" class="svg-muted" font-size="11">UDP 514</text>
<rect x="140" y="30" width="120" height="70" rx="8" fill="#bbf7d0"/><text x="200" y="58" text-anchor="middle" class="svg-ink" font-size="13">NTP</text><text x="200" y="78" text-anchor="middle" class="svg-muted" font-size="11">UDP 123</text>
<rect x="270" y="30" width="120" height="70" rx="8" fill="#ddd6fe"/><text x="330" y="58" text-anchor="middle" class="svg-ink" font-size="13">SNMP</text><text x="330" y="78" text-anchor="middle" class="svg-muted" font-size="11">UDP 161 / 162</text>
<rect x="400" y="30" width="120" height="70" rx="8" fill="#fde68a"/><text x="460" y="58" text-anchor="middle" class="svg-ink" font-size="13">SSH / J-Web</text><text x="460" y="78" text-anchor="middle" class="svg-muted" font-size="11">22 / 443 / 830</text>
<rect x="530" y="30" width="100" height="70" rx="8" fill="#fed7aa"/><text x="580" y="58" text-anchor="middle" class="svg-ink" font-size="13">Rescue</text><text x="580" y="78" text-anchor="middle" class="svg-muted" font-size="11">rescue.conf.gz</text>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">Log it, time it, watch it, reach it, restore it</text>
</svg><p class="cap">The five system services and their ports.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Configure syslog to a file, a remote host and user terminals; explain facility and severity.</li>
<li>Read logs with <code>show log</code>, filter with pipes and stream with <code>monitor start</code>.</li>
<li>Enable and limit trace options for a protocol and switch them off.</li>
<li>Configure NTP servers and the time zone; read <code>show ntp associations</code> and <code>status</code>.</li>
<li>Configure an SNMP community with <code>clients</code>, trap groups, and read <code>show snmp statistics</code>.</li>
<li>Choose management services (SSH, NETCONF, HTTPS J-Web) and avoid telnet; read <code>show system connections</code>.</li>
<li>Save, view, load and delete the rescue configuration and explain when to use it.</li>
<li>Troubleshoot using the five-step service path.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Facility</dt><dd>Category of a syslog message (authorization, change-log, any).</dd>
<dt>Severity</dt><dd>Seriousness: emergency, alert, critical, error, warning, notice, info.</dd>
<dt>Traceoptions</dt><dd>Protocol-level debugging written to a file.</dd>
<dt>Stratum</dt><dd>Hop distance from a reference clock; 16 means unsynchronised.</dd>
<dt>Community</dt><dd>SNMP v1/v2c shared secret, in clear text.</dd>
<dt>Trap</dt><dd>Unsolicited SNMP alert sent to UDP 162.</dd>
<dt>NETCONF</dt><dd>XML-over-SSH management protocol on TCP 830.</dd>
<dt>J-Web</dt><dd>Browser GUI for Junos.</dd>
<dt>Rescue configuration</dt><dd>Deliberately saved known-good configuration that does not age out.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>Syslog transport and port</td><td>UDP 514</td></tr>
<tr><td>Severity order (high to low)</td><td>emergency, alert, critical, error, warning, notice, info</td></tr>
<tr><td>Configured severity means</td><td>that level and more serious</td></tr>
<tr><td>Read a local log file</td><td><code>show log NAME</code></td></tr>
<tr><td>NTP port</td><td>UDP 123</td></tr>
<tr><td>* in show ntp associations</td><td>synchronised system peer</td></tr>
<tr><td>Client stratum</td><td>server stratum + 1</td></tr>
<tr><td>SNMP poll / trap ports</td><td>UDP 161 / UDP 162</td></tr>
<tr><td>Limit who can use a community</td><td><code>clients</code> list</td></tr>
<tr><td>Secure SNMP version</td><td>v3</td></tr>
<tr><td>NETCONF port</td><td>TCP 830 (over SSH)</td></tr>
<tr><td>J-Web service</td><td><code>system services web-management</code></td></tr>
<tr><td>Save rescue</td><td><code>request system configuration rescue save</code></td></tr>
<tr><td>Load rescue</td><td><code>rollback rescue</code> then commit</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">set system syslog host 10.70.1.50 any notice
set system syslog file config-changes change-log info
show log messages | last 20      monitor start messages
set protocols ospf traceoptions file ospf-trace size 1m files 3
set protocols ospf traceoptions flag hello
set system time-zone Asia/Kolkata
set system ntp server 10.70.1.50
show ntp associations            show ntp status
set snmp community nk-mon authorization read-only
set snmp community nk-mon clients 10.80.1.20/32
set snmp trap-group NK-TRAPS targets 10.80.1.20
show snmp statistics             show system connections
set system services ssh root-login deny
request system configuration rescue save
rollback rescue</pre>

<div class="warn"><p><b>Last reminders.</b> Prove every service on the destination, not only on the router. Avoid telnet and default communities. Refresh the rescue configuration after each approved change.</p></div>
<div class="exam"><p><b>Exam traps recap.</b> Severity is a minimum; NTP asterisk means synchronised; SNMP clients is an allow-list; rescue needs a commit after rollback rescue; trace options are not syslog.</p></div>

<div class="scn"><h4>A boring audit</h4><p>An auditor asked for evidence that NK's routers were monitored and recoverable. The team showed a router: syslog lines on the server, <code>show ntp associations</code> with an asterisk, an SNMP walk from the NMS plus a rejected guest probe, <code>show system connections</code> with only SSH, NETCONF and HTTPS, and a dated rescue file. The audit took ten minutes and had no findings.</p><p><b>Lesson:</b> services you can demonstrate are services you have.</p></div>

<div class="iv"><p class="q">"Give me a baseline services template for a Junos router."</p><p>Remote and local syslog with a change-log file, two NTP servers plus time zone, SNMP v3 (or restricted v2c with clients and a trap group), SSH with root-login deny and rate limits, NETCONF if automation needs it, HTTPS J-Web only if used, a loopback firewall filter limiting management to the NOC subnet, and a rescue configuration saved after the build.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Log, time, monitor, reach, restore: five services every router needs.</li>
<li>Know ports: 514, 123, 161/162, 22, 830, 443.</li>
<li>Restrict SNMP with clients; prefer SNMPv3; avoid telnet.</li>
<li>Rescue configuration is the last line of defence; keep it current.</li>
<li>Next: Junos OS fundamentals and routing modules build on these skills.</li>
</ul></div>
`,hi:`
<p>Ab aap Junos device ko observable, time-correct, monitored, safely reachable aur recoverable bana sakte ho. Yeh chapter JNCIA-Junos (JN0-106) ke system services aur monitoring objectives ki revision sheet hai.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Services summary">
<rect x="10" y="30" width="120" height="70" rx="8" fill="#bae6fd"/><text x="70" y="58" text-anchor="middle" class="svg-ink" font-size="13">syslog</text><text x="70" y="78" text-anchor="middle" class="svg-muted" font-size="11">UDP 514</text>
<rect x="140" y="30" width="120" height="70" rx="8" fill="#bbf7d0"/><text x="200" y="58" text-anchor="middle" class="svg-ink" font-size="13">NTP</text><text x="200" y="78" text-anchor="middle" class="svg-muted" font-size="11">UDP 123</text>
<rect x="270" y="30" width="120" height="70" rx="8" fill="#ddd6fe"/><text x="330" y="58" text-anchor="middle" class="svg-ink" font-size="13">SNMP</text><text x="330" y="78" text-anchor="middle" class="svg-muted" font-size="11">UDP 161 / 162</text>
<rect x="400" y="30" width="120" height="70" rx="8" fill="#fde68a"/><text x="460" y="58" text-anchor="middle" class="svg-ink" font-size="13">SSH / J-Web</text><text x="460" y="78" text-anchor="middle" class="svg-muted" font-size="11">22 / 443 / 830</text>
<rect x="530" y="30" width="100" height="70" rx="8" fill="#fed7aa"/><text x="580" y="58" text-anchor="middle" class="svg-ink" font-size="13">Rescue</text><text x="580" y="78" text-anchor="middle" class="svg-muted" font-size="11">rescue.conf.gz</text>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">Log karo, time sahi rakho, dekho, pahuncho, restore karo</text>
</svg><p class="cap">Paanch system services aur unke ports.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Syslog ko file, remote host aur user terminals par configure karo; facility aur severity samjhao.</li>
<li>Logs ko <code>show log</code> se padho, pipes se filter karo aur <code>monitor start</code> se stream karo.</li>
<li>Protocol ke liye trace options enable aur limit karo aur band karo.</li>
<li>NTP servers aur time zone configure karo; <code>show ntp associations</code> aur <code>status</code> padho.</li>
<li><code>clients</code> ke saath SNMP community, trap groups configure karo aur <code>show snmp statistics</code> padho.</li>
<li>Management services (SSH, NETCONF, HTTPS J-Web) chuno aur telnet avoid karo; <code>show system connections</code> padho.</li>
<li>Rescue configuration save, view, load aur delete karo aur kab use karni hai samjhao.</li>
<li>Paanch-step service path se troubleshoot karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Facility</dt><dd>Syslog message ki category (authorization, change-log, any).</dd>
<dt>Severity</dt><dd>Seriousness: emergency, alert, critical, error, warning, notice, info.</dd>
<dt>Traceoptions</dt><dd>Protocol-level debugging jo file mein likhi jaati hai.</dd>
<dt>Stratum</dt><dd>Reference clock se hop distance; 16 matlab unsynchronised.</dd>
<dt>Community</dt><dd>SNMP v1/v2c ka shared secret, clear text mein.</dd>
<dt>Trap</dt><dd>UDP 162 par bheja unsolicited SNMP alert.</dd>
<dt>NETCONF</dt><dd>TCP 830 par XML-over-SSH management protocol.</dd>
<dt>J-Web</dt><dd>Junos ka browser GUI.</dd>
<dt>Rescue configuration</dt><dd>Jaan-boojh kar save ki known-good configuration jo purani nahi hoti.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Jawab</th></tr>
<tr><td>Syslog transport aur port</td><td>UDP 514</td></tr>
<tr><td>Severity order (high se low)</td><td>emergency, alert, critical, error, warning, notice, info</td></tr>
<tr><td>Configured severity ka matlab</td><td>woh level aur usse serious</td></tr>
<tr><td>Local log file padhna</td><td><code>show log NAME</code></td></tr>
<tr><td>NTP port</td><td>UDP 123</td></tr>
<tr><td>show ntp associations mein *</td><td>synchronised system peer</td></tr>
<tr><td>Client stratum</td><td>server stratum + 1</td></tr>
<tr><td>SNMP poll / trap ports</td><td>UDP 161 / UDP 162</td></tr>
<tr><td>Community kaun use kare limit karna</td><td><code>clients</code> list</td></tr>
<tr><td>Secure SNMP version</td><td>v3</td></tr>
<tr><td>NETCONF port</td><td>TCP 830 (SSH par)</td></tr>
<tr><td>J-Web service</td><td><code>system services web-management</code></td></tr>
<tr><td>Rescue save</td><td><code>request system configuration rescue save</code></td></tr>
<tr><td>Rescue load</td><td><code>rollback rescue</code> phir commit</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">set system syslog host 10.70.1.50 any notice
set system syslog file config-changes change-log info
show log messages | last 20      monitor start messages
set protocols ospf traceoptions file ospf-trace size 1m files 3
set protocols ospf traceoptions flag hello
set system time-zone Asia/Kolkata
set system ntp server 10.70.1.50
show ntp associations            show ntp status
set snmp community nk-mon authorization read-only
set snmp community nk-mon clients 10.80.1.20/32
set snmp trap-group NK-TRAPS targets 10.80.1.20
show snmp statistics             show system connections
set system services ssh root-login deny
request system configuration rescue save
rollback rescue</pre>

<div class="warn"><p><b>Aakhri reminders.</b> Har service ko destination par saabit karo, sirf router par nahi. Telnet aur default communities avoid karo. Har approved change ke baad rescue configuration refresh karo.</p></div>
<div class="exam"><p><b>Exam traps recap.</b> Severity minimum hai; NTP asterisk matlab synchronised; SNMP clients allow-list hai; rollback rescue ke baad commit chahiye; trace options syslog nahi hain.</p></div>

<div class="scn"><h4>Ek boring audit</h4><p>Auditor ne saboot maanga ki NK ke routers monitored aur recoverable hain. Team ne ek router dikhaya: server par syslog lines, asterisk ke saath <code>show ntp associations</code>, NMS se SNMP walk aur reject hui guest probe, sirf SSH, NETCONF aur HTTPS dikhata <code>show system connections</code>, aur dated rescue file. Audit das minute mein khatam hua aur koi finding nahi thi.</p><p><b>Lesson:</b> jo services aap demonstrate kar sako wahi aapke paas hain.</p></div>

<div class="iv"><p class="q">"Junos router ke liye baseline services template batao."</p><p>Change-log file ke saath remote aur local syslog, time zone ke saath do NTP servers, SNMP v3 (ya clients aur trap group ke saath restricted v2c), root-login deny aur rate limits ke saath SSH, automation ko zaroorat ho to NETCONF, HTTPS J-Web sirf agar use ho, management ko NOC subnet tak limit karne wala loopback firewall filter, aur build ke baad saved rescue configuration.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Log, time, monitor, reach, restore: har router ko paanch services chahiye.</li>
<li>Ports jaano: 514, 123, 161/162, 22, 830, 443.</li>
<li>SNMP ko clients se restrict karo; SNMPv3 prefer karo; telnet avoid karo.</li>
<li>Rescue configuration aakhri line of defence hai; ise current rakho.</li>
<li>Aage: Junos OS fundamentals aur routing modules in skills par bane hain.</li>
</ul></div>
`}};export{e as default};