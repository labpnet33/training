var e={id:`platform-health`,h:{en:`Platform settings, updates and health monitoring`,hi:`Platform settings, updates aur health monitoring`},body:{en:`
<p>A fleet of delivery trucks needs two kinds of care besides the routes they drive. First, settings that every truck shares: the company radio frequency, the clock, who is allowed to open the cabin. Second, a dashboard back at the depot that shows fuel, engine temperature and warning lights for every truck at once. In the Management Center the shared settings are the <b>platform settings policy</b>, and the dashboard is <b>health monitoring</b>.</p>

<h3>Platform settings: the device's housekeeping</h3>
<p>On a real Management Center: <b>Devices → Platform Settings</b>, create a <i>Threat Defense Settings</i> policy and assign it to devices. One policy can serve many firewalls, so all branches share the same NTP, syslog and access settings. Like everything else, it takes effect on Deploy. The most important sections:</p>
<dl class="terms">
<dt>SSH Access and HTTP Access</dt><dd>Which hosts may manage the device on its <b>data</b> interfaces, for example SSH from 10.0.1.50 on inside. SSH to the dedicated management interface is controlled separately on the device itself.</dd>
<dt>ICMP Access</dt><dd>Which ICMP types the device answers on its own interfaces (pinging the firewall itself, not through it).</dd>
<dt>Syslog</dt><dd>Sends LINA syslog messages (connection builds and teardowns, denies, failover, VPN) to external servers, with levels and facility. Connection events from the access control policy are logged to the Management Center by default and can also be sent to syslog from the policy's logging settings.</dd>
<dt>Time Synchronization and Time Zone</dt><dd>NTP from the Management Center or from your own NTP servers. Correct time matters for registration, certificates, VPN and event correlation.</dd>
<dt>SNMP, DNS, Banner, Timeouts, Fragment settings, External Authentication</dt><dd>Polling and traps, name resolution for FQDN objects, a login banner, connection and translation timeouts, fragment handling, and RADIUS or LDAP login for device administrators.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Policies assigned to a device">
<rect x="245" y="150" width="150" height="56" rx="8" fill="#fed7aa"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="14">NK-FTD</text><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">one of each</text>
<rect x="10" y="20" width="140" height="48" rx="8" fill="#fde68a"/><text x="80" y="49" text-anchor="middle" class="svg-ink" font-size="13">Access control</text>
<rect x="165" y="20" width="140" height="48" rx="8" fill="#ddd6fe"/><text x="235" y="49" text-anchor="middle" class="svg-ink" font-size="13">NAT</text>
<rect x="320" y="20" width="150" height="48" rx="8" fill="#bae6fd"/><text x="395" y="49" text-anchor="middle" class="svg-ink" font-size="13">Platform settings</text>
<rect x="485" y="20" width="145" height="48" rx="8" fill="#bbf7d0"/><text x="557" y="49" text-anchor="middle" class="svg-ink" font-size="13">Health policy</text>
<line x1="80" y1="68" x2="270" y2="150" stroke="#64748b" stroke-width="2"/><line x1="235" y1="68" x2="300" y2="150" stroke="#64748b" stroke-width="2"/><line x1="395" y1="68" x2="340" y2="150" stroke="#64748b" stroke-width="2"/><line x1="557" y1="68" x2="370" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="12">shared, assigned, deployed</text>
</svg><p class="cap">A device carries several policies at once; each can be shared by many devices.</p></div>

<h3>Updates that keep inspection current</h3>
<p>Threat Defense depends on content that changes weekly: the <b>VDB</b> (vulnerability and application detector database used by AppID), the intrusion rules (<b>LSP</b> for Snort 3, formerly SRU), geolocation data, and Security Intelligence feeds. The Management Center downloads and schedules them (real path: <b>System → Updates</b>). <code>show version</code> on the device reports the versions in use:</p>
<pre class="out">&gt; show version
-------------------[ NK-FTD ]--------------------
Model                     : Cisco Secure Firewall Threat Defense for VMware (75) Version 7.6.0
<span class="hl">LSP version               : lsp-rel-20260915-1510</span>
<span class="hl">VDB version               : 395</span>
----------------------------------------------------</pre>

<h3>Health monitoring</h3>
<p>Each device has a <b>health policy</b> (real path: <b>System → Health → Policy</b>) that enables <b>health modules</b> and thresholds: CPU, memory, disk usage, interface status, Snort process status and statistics, the connection rate, threat data and feed updates, and whether the deployed configuration matches the manager. Results appear in the <b>Health Monitor</b> (System → Health → Monitor) as a status per device (normal, warning, critical) with dashboards, and as health events. <b>Health alerts</b> can send email, SNMP traps or syslog when a module goes critical. The device list also shows a health icon next to every device.</p>
<p>The lab GUI does not simulate platform settings or health; its <b>Overview</b> tab shows the device model and version, the policy name, the number of deployments and whether the device is up to date.</p>

<h3>CLI checks that support health</h3>
<pre class="out">&gt; show asp drop

Frame drop:
  Snort requested to drop the frame (snort-drop)                               0
<span class="hl">  Flow is denied by configured rule (acl-drop)                                 1</span>
  Blocked by Security Intelligence (sp-security-failed)                        0</pre>
<p><code>show asp drop</code> counts why LINA dropped packets, including drops requested by Snort. Real devices also offer <code>show cpu usage</code>, <code>show memory</code>, <code>show interface</code> and <code>show snort statistics</code>. The <code>system support diagnostic-cli</code> command enters the LINA diagnostic CLI, and <code>expert</code> opens the Linux shell, which you should use only with Cisco TAC guidance.</p>

<div class="eg"><p><b>Worked example.</b> Forty branches must send syslog to 10.0.1.200, use NTP 10.0.1.123 and allow SSH on inside only from ADMIN 10.0.1.50. One platform settings policy BRANCH-PLATFORM with those three sections, assigned to all forty devices and deployed. When the syslog server moves, one edit and one deploy update every branch.</p></div>

<div class="warn"><p><b>Common mistake.</b> Adding SSH Access in platform settings and then wondering why the management interface ignores it: the platform settings control the data interfaces. Another: no NTP, so logs from the firewall and the manager disagree by minutes and incident timelines become guesswork.</p></div>

<div class="exam"><p><b>Exam trap.</b> Platform settings are a separate shared policy, deployed like the others. Health is configured with a health policy and modules, viewed in the Health Monitor, and alerting is configured separately. LINA syslog and Management Center connection events are different event streams.</p></div>

<div class="scn"><h4>The firewall nobody noticed was full</h4><p>A branch firewall's disk filled up with old troubleshooting files. Event logging to the manager stalled and deployments started failing with a generic error. The health module for disk usage had been disabled in a cloned health policy, so no alert fired. The team re-enabled the module, set an alert to email the NOC on critical, cleaned the files and re-deployed successfully.</p><p><b>Lesson:</b> health monitoring only helps if the right modules are enabled and someone receives the alerts.</p></div>

<div class="iv"><p class="q">"How do you monitor the health of firewalls managed by the Management Center?"</p><p>With a health policy per device that enables modules such as CPU, memory, disk, interface status, Snort status and deployment state; the Health Monitor dashboards and health events; and health alerts to email, SNMP or syslog. Add that platform settings provide NTP and syslog consistently, and that updates for VDB, intrusion rules and feeds must be scheduled and checked.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Platform settings policy: SSH and HTTP access on data interfaces, ICMP, syslog, NTP, SNMP, DNS, banner, timeouts.</li>
<li>One platform settings policy can serve many devices; changes need Deploy.</li>
<li>Keep VDB, intrusion rules (LSP), geolocation and feeds updated; <code>show version</code> shows LSP and VDB.</li>
<li>Health policy and modules, Health Monitor, health alerts.</li>
<li>CLI support: <code>show asp drop</code>, <code>show version</code>, diagnostic CLI.</li>
</ul></div>
`,hi:`
<p>Delivery trucks ke ek fleet ko apne routes ke alawa do tarah ki dekhbhaal chahiye. Pehli, settings jo har truck share karta hai: company radio frequency, ghadi, cabin kholne ki ijaazat kise hai. Doosri, depot par ek dashboard jo har truck ka fuel, engine temperature aur warning lights ek saath dikhata hai. Management Center mein shared settings <b>platform settings policy</b> hain, aur dashboard <b>health monitoring</b> hai.</p>

<h3>Platform settings: device ki housekeeping</h3>
<p>Real Management Center par: <b>Devices → Platform Settings</b>, ek <i>Threat Defense Settings</i> policy banao aur devices ko assign karo. Ek policy kai firewalls ko serve kar sakti hai, isliye saari branches same NTP, syslog aur access settings share karti hain. Baaki sab ki tarah, yeh Deploy par lagti hai. Sabse important sections:</p>
<dl class="terms">
<dt>SSH Access aur HTTP Access</dt><dd>Kaunse hosts device ko uske <b>data</b> interfaces par manage kar sakte hain, jaise inside par 10.0.1.50 se SSH. Dedicated management interface par SSH device par hi alag se control hota hai.</dd>
<dt>ICMP Access</dt><dd>Device apne interfaces par kaunse ICMP types ka jawab deta hai (firewall ko khud ping karna, uske through nahi).</dd>
<dt>Syslog</dt><dd>LINA syslog messages (connection builds aur teardowns, denies, failover, VPN) external servers ko levels aur facility ke saath bhejta hai. Access control policy ke connection events default mein Management Center par log hote hain aur policy ki logging settings se syslog par bhi bheje ja sakte hain.</dd>
<dt>Time Synchronization aur Time Zone</dt><dd>Management Center se ya aapke apne NTP servers se NTP. Sahi time registration, certificates, VPN aur event correlation ke liye matter karta hai.</dd>
<dt>SNMP, DNS, Banner, Timeouts, Fragment settings, External Authentication</dt><dd>Polling aur traps, FQDN objects ke liye name resolution, login banner, connection aur translation timeouts, fragment handling, aur device administrators ke liye RADIUS ya LDAP login.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Policies assigned to a device">
<rect x="245" y="150" width="150" height="56" rx="8" fill="#fed7aa"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="14">NK-FTD</text><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">har ek ki ek</text>
<rect x="10" y="20" width="140" height="48" rx="8" fill="#fde68a"/><text x="80" y="49" text-anchor="middle" class="svg-ink" font-size="13">Access control</text>
<rect x="165" y="20" width="140" height="48" rx="8" fill="#ddd6fe"/><text x="235" y="49" text-anchor="middle" class="svg-ink" font-size="13">NAT</text>
<rect x="320" y="20" width="150" height="48" rx="8" fill="#bae6fd"/><text x="395" y="49" text-anchor="middle" class="svg-ink" font-size="13">Platform settings</text>
<rect x="485" y="20" width="145" height="48" rx="8" fill="#bbf7d0"/><text x="557" y="49" text-anchor="middle" class="svg-ink" font-size="13">Health policy</text>
<line x1="80" y1="68" x2="270" y2="150" stroke="#64748b" stroke-width="2"/><line x1="235" y1="68" x2="300" y2="150" stroke="#64748b" stroke-width="2"/><line x1="395" y1="68" x2="340" y2="150" stroke="#64748b" stroke-width="2"/><line x1="557" y1="68" x2="370" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="12">shared, assigned, deployed</text>
</svg><p class="cap">Ek device ek saath kai policies rakhta hai; har ek ko kai devices share kar sakte hain.</p></div>

<h3>Updates jo inspection ko current rakhte hain</h3>
<p>Threat Defense us content par depend karta hai jo har hafte badalta hai: <b>VDB</b> (AppID ka vulnerability aur application detector database), intrusion rules (Snort 3 ke liye <b>LSP</b>, pehle SRU), geolocation data, aur Security Intelligence feeds. Management Center unhe download aur schedule karta hai (real path: <b>System → Updates</b>). Device par <code>show version</code> use ho rahe versions batata hai:</p>
<pre class="out">&gt; show version
-------------------[ NK-FTD ]--------------------
Model                     : Cisco Secure Firewall Threat Defense for VMware (75) Version 7.6.0
<span class="hl">LSP version               : lsp-rel-20260915-1510</span>
<span class="hl">VDB version               : 395</span>
----------------------------------------------------</pre>

<h3>Health monitoring</h3>
<p>Har device ki ek <b>health policy</b> hoti hai (real path: <b>System → Health → Policy</b>) jo <b>health modules</b> aur thresholds enable karti hai: CPU, memory, disk usage, interface status, Snort process status aur statistics, connection rate, threat data aur feed updates, aur kya deployed configuration manager se match karti hai. Results <b>Health Monitor</b> (System → Health → Monitor) mein har device ke status (normal, warning, critical) ke roop mein dashboards ke saath, aur health events ke roop mein dikhte hain. <b>Health alerts</b> module critical hone par email, SNMP traps ya syslog bhej sakte hain. Device list bhi har device ke saamne health icon dikhati hai.</p>
<p>Lab GUI platform settings ya health simulate nahi karta; uska <b>Overview</b> tab device model aur version, policy name, deployments ki sankhya aur device up to date hai ya nahi, yeh dikhata hai.</p>

<h3>Health ko support karne wale CLI checks</h3>
<pre class="out">&gt; show asp drop

Frame drop:
  Snort requested to drop the frame (snort-drop)                               0
<span class="hl">  Flow is denied by configured rule (acl-drop)                                 1</span>
  Blocked by Security Intelligence (sp-security-failed)                        0</pre>
<p><code>show asp drop</code> ginta hai ki LINA ne packets kyun drop kiye, Snort ke maange drops ko milakar. Real devices <code>show cpu usage</code>, <code>show memory</code>, <code>show interface</code> aur <code>show snort statistics</code> bhi dete hain. <code>system support diagnostic-cli</code> command LINA diagnostic CLI mein le jaata hai, aur <code>expert</code> Linux shell kholta hai, jise sirf Cisco TAC guidance ke saath use karna chahiye.</p>

<div class="eg"><p><b>Worked example.</b> Chaalis branches ko 10.0.1.200 par syslog bhejna hai, NTP 10.0.1.123 use karna hai aur inside par SSH sirf ADMIN 10.0.1.50 se allow karna hai. Un teen sections ke saath ek platform settings policy BRANCH-PLATFORM, saare chaalis devices ko assigned aur deployed. Jab syslog server move hota hai, ek edit aur ek deploy har branch ko update kar dete hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Platform settings mein SSH Access jodna aur phir sochna ki management interface use ignore kyun karta hai: platform settings data interfaces control karti hain. Ek aur: NTP nahi, isliye firewall aur manager ke logs minutes se alag hote hain aur incident timelines andaaza ban jaati hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Platform settings ek alag shared policy hai, baaki ki tarah deployed. Health health policy aur modules se configure hoti hai, Health Monitor mein dikhti hai, aur alerting alag se configure hoti hai. LINA syslog aur Management Center connection events alag event streams hain.</p></div>

<div class="scn"><h4>Woh firewall jiska bhar jaana kisi ne notice nahi kiya</h4><p>Ek branch firewall ki disk purani troubleshooting files se bhar gayi. Manager ko event logging ruk gayi aur deployments ek generic error ke saath fail hone lage. Ek cloned health policy mein disk usage ka health module disabled tha, isliye koi alert nahi aaya. Team ne module dobara enable kiya, critical par NOC ko email karne wala alert set kiya, files saaf ki aur safalta se re-deploy kiya.</p><p><b>Seekh:</b> health monitoring tabhi madad karti hai jab sahi modules enabled hon aur koi alerts receive kare.</p></div>

<div class="iv"><p class="q">"Management Center se managed firewalls ki health kaise monitor karte ho?"</p><p>Har device ki health policy se jo CPU, memory, disk, interface status, Snort status aur deployment state jaise modules enable karti hai; Health Monitor dashboards aur health events se; aur email, SNMP ya syslog ki taraf health alerts se. Jodo ki platform settings NTP aur syslog consistently deti hain, aur VDB, intrusion rules aur feeds ke updates schedule aur check karne chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Platform settings policy: data interfaces par SSH aur HTTP access, ICMP, syslog, NTP, SNMP, DNS, banner, timeouts.</li>
<li>Ek platform settings policy kai devices serve kar sakti hai; changes ko Deploy chahiye.</li>
<li>VDB, intrusion rules (LSP), geolocation aur feeds updated rakho; <code>show version</code> LSP aur VDB dikhata hai.</li>
<li>Health policy aur modules, Health Monitor, health alerts.</li>
<li>CLI support: <code>show asp drop</code>, <code>show version</code>, diagnostic CLI.</li>
</ul></div>
`}};export{e as default};