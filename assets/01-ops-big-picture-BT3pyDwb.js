var e={id:`ops-big-picture`,h:{en:`What you will learn: running a Catalyst SD-WAN fabric day after day`,hi:`Aap kya seekhoge: Catalyst SD-WAN fabric ko roz chalana`},body:{en:`
<p>Building the fabric is like constructing an airport. Running it is a different job: a control tower watches every aircraft, an alarm panel flashes when a runway light fails, engineers follow a written plan to upgrade the radar without stopping flights, a backup tower stands ready if the main one burns down, and a logbook records who did what. <b>Operations</b> in Catalyst SD-WAN is that control tower. The Manager is the single glass window for it, and this module teaches you to use it.</p>

<h3>What you will learn</h3>
<ul>
<li><b>Monitoring</b>: the Manager dashboards for devices, tunnels, applications, security, VPNs and the health of every WAN edge.</li>
<li><b>Alarms, events, audit logs, syslog and SNMP</b>: what each is, where to find it and how to send notifications.</li>
<li><b>REST API and Python automation</b>: authenticate to the Manager and read a device list with real calls.</li>
<li><b>Backup, restore and disaster recovery</b> of the Manager.</li>
<li>The <b>software upgrade workflow</b>: repository, upgrade, activate, set default, rollback and the order of components.</li>
<li><b>RBAC</b> (users and groups), <b>certificate renewal</b> and Analytics.</li>
<li>The <b>built-in tools</b>: ping, traceroute, nping, speed test, packet capture and real-time commands.</li>
<li><b>Change management and NOC runbooks</b> that make all this safe and repeatable.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should know the architecture (sdw-arch), how controllers and certificates work (sdw-ctrl), how edges onboard (sdw-edge), templates (sdw-templates) and the policy modules. You do not need to be a programmer: the Python example in chapter 4 is short and explained line by line. The next module, sdw-ts, builds on this one and teaches the method for finding faults.</p>

<h3>Day 0, day 1 and day 2</h3>
<p>Network people often split a deployment into three phases:</p>
<ul>
<li><b>Day 0</b>: design and plan: addressing, sizing, roles.</li>
<li><b>Day 1</b>: deploy and configure: install controllers, onboard edges, push templates and policy (modules sdw-ctrl to sdw-sec).</li>
<li><b>Day 2</b>: operate: monitor, alert, upgrade, back up, secure, troubleshoot. This module and the next.</li>
</ul>
<p>Most of the engineer's career is spent in Day 2, and interviewers ask more about it than about the initial build.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="The operations toolbox around the Manager">
<rect x="230" y="95" width="180" height="70" rx="10" fill="#bae6fd"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="14">SD-WAN Manager</text><text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">single pane of glass</text>
<rect x="10" y="20" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="13">Monitor</text><text x="85" y="58" text-anchor="middle" class="svg-muted" font-size="11">dashboards, health</text>
<rect x="245" y="10" width="150" height="50" rx="8" fill="#fde68a"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Alarms and logs</text><text x="320" y="48" text-anchor="middle" class="svg-muted" font-size="11">syslog, SNMP, email</text>
<rect x="480" y="20" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="555" y="42" text-anchor="middle" class="svg-ink" font-size="13">REST API</text><text x="555" y="58" text-anchor="middle" class="svg-muted" font-size="11">Python, automation</text>
<rect x="10" y="190" width="150" height="50" rx="8" fill="#fed7aa"/><text x="85" y="212" text-anchor="middle" class="svg-ink" font-size="13">Backup and DR</text><text x="85" y="228" text-anchor="middle" class="svg-muted" font-size="11">configuration-db</text>
<rect x="245" y="200" width="150" height="50" rx="8" fill="#fed7aa"/><text x="320" y="222" text-anchor="middle" class="svg-ink" font-size="13">Upgrades</text><text x="320" y="238" text-anchor="middle" class="svg-muted" font-size="11">repository, rollback</text>
<rect x="480" y="190" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="555" y="212" text-anchor="middle" class="svg-ink" font-size="13">RBAC, certificates</text><text x="555" y="228" text-anchor="middle" class="svg-muted" font-size="11">Analytics, tools</text>
<line x1="160" y1="55" x2="230" y2="105" stroke="#64748b" stroke-width="2"/><line x1="320" y1="60" x2="320" y2="95" stroke="#64748b" stroke-width="2"/><line x1="480" y1="55" x2="410" y2="105" stroke="#64748b" stroke-width="2"/><line x1="160" y1="205" x2="230" y2="155" stroke="#64748b" stroke-width="2"/><line x1="320" y1="200" x2="320" y2="165" stroke="#64748b" stroke-width="2"/><line x1="480" y1="205" x2="410" y2="155" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Everything in this module is reached through the Manager GUI, its API or its command line.</p></div>

<h3>Where do you click: the Manager menu map</h3>
<table class="cmp"><tr><th>Task</th><th>Manager path</th></tr>
<tr><td>Fabric health at a glance</td><td>Monitor &gt; Overview</td></tr>
<tr><td>One device, tunnels, real-time commands</td><td>Monitor &gt; Devices</td></tr>
<tr><td>All tunnels and their quality</td><td>Monitor &gt; Tunnels</td></tr>
<tr><td>Applications, security, VPN</td><td>Monitor &gt; Applications, Security, VPN</td></tr>
<tr><td>Alarms, events, audit log</td><td>Monitor &gt; Logs</td></tr>
<tr><td>Software images and upgrades</td><td>Maintenance &gt; Software Repository, Software Upgrade</td></tr>
<tr><td>Certificates and WAN edge list</td><td>Configuration &gt; Certificates</td></tr>
<tr><td>Users, groups, settings, DR</td><td>Administration &gt; Manage Users, Settings, Disaster Recovery</td></tr>
<tr><td>Device troubleshooting tools</td><td>Monitor &gt; Devices &gt; (device) &gt; Troubleshooting</td></tr></table>
<p>Menu names change slightly between releases. If a menu is not where this table says, search for the feature name; the functions are the same.</p>

<div class="eg"><p><b>Worked example.</b> A typical Monday for the NOC at Bharat Retail: at 09:00 the Overview dashboard shows 71 of 72 sites with full WAN connectivity, one with partial (a branch lost its MPLS circuit). The alarm list shows a Major alarm for that site since 03:12. The engineer opens Monitor &gt; Devices for that edge, sees one BFD session colour down, runs a ping from the Troubleshooting page toward the MPLS next hop, and raises a ticket with the provider. Total time: six minutes, without touching a CLI.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating the Manager as only a configuration tool. If nobody watches alarms and nobody tests backups, the fabric will fail in the one way the design cannot survive: an unnoticed small problem growing into a large one.</p></div>

<div class="exam"><p><b>Exam trap.</b> The blueprint section "Management and operations" mixes GUI paths, REST API, upgrade order and certificate topics. Learn the <b>order of upgrade</b> (Manager, Validator, Controller, then edges) and the <b>authentication steps of the API</b> (session cookie, then token).</p></div>

<div class="scn"><h4>The silent expiry</h4><p>A retail group noticed on a Monday that new branches could not join. The cause was a controller certificate that had expired over the weekend. Manager had been sending certificate-expiry warnings by email for 60 days to a mailbox that nobody read. After the team set up notifications to a shared channel and added a monthly certificate review to the runbook, the next renewal was done two weeks before expiry.</p><p><b>Lesson:</b> monitoring is only useful if somebody receives and acts on it.</p></div>

<div class="iv"><p class="q">"What does the Day-2 operation of an SD-WAN fabric involve?"</p><p>Monitoring health in the Manager dashboards, handling alarms and events with notifications to the NOC, backing up the Manager and planning disaster recovery, controlled software upgrades in the right order with a rollback plan, certificate and RBAC management, automation through the REST API, and using built-in tools for troubleshooting. I also document it in runbooks and change windows.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Day 2 (operate) is most of an engineer's work; the Manager is the single pane of glass.</li>
<li>Know the menu map: Monitor, Configuration, Maintenance, Administration.</li>
<li>Alarms must reach people; certificates and backups need calendar reminders.</li>
<li>Upgrade order: Manager, Validator, Controller, then WAN edges.</li>
<li>Next chapters: dashboards, alarms, API, backup, upgrades, RBAC, tools, runbooks.</li>
</ul></div>
`,hi:`
<p>Fabric banana airport banane jaisa hai. Use chalana alag kaam hai: control tower har aircraft ko dekhta hai, alarm panel flash karta hai jab runway light fail ho, engineers likhe hue plan se radar upgrade karte hain bina flights roke, ek backup tower taiyaar rehta hai agar main tower jal jaaye, aur ek logbook likhta hai ki kisne kya kiya. Catalyst SD-WAN mein <b>Operations</b> wahi control tower hai. Manager uski ek hi glass window hai, aur yeh module use istemaal karna sikhata hai.</p>

<h3>Aap kya seekhoge</h3>
<ul>
<li><b>Monitoring</b>: devices, tunnels, applications, security, VPNs aur har WAN edge ki health ke Manager dashboards.</li>
<li><b>Alarms, events, audit logs, syslog aur SNMP</b>: har ek kya hai, kahan milta hai aur notifications kaise bhejte hain.</li>
<li><b>REST API aur Python automation</b>: Manager se authenticate karna aur real calls se device list padhna.</li>
<li>Manager ka <b>backup, restore aur disaster recovery</b>.</li>
<li><b>Software upgrade workflow</b>: repository, upgrade, activate, set default, rollback aur components ka order.</li>
<li><b>RBAC</b> (users aur groups), <b>certificate renewal</b> aur Analytics.</li>
<li><b>Built-in tools</b>: ping, traceroute, nping, speed test, packet capture aur real-time commands.</li>
<li><b>Change management aur NOC runbooks</b> jo yeh sab safe aur repeatable banate hain.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapko architecture (sdw-arch), controllers aur certificates kaise kaam karte hain (sdw-ctrl), edges kaise onboard hote hain (sdw-edge), templates (sdw-templates) aur policy modules aane chahiye. Programmer hona zaroori nahi: chapter 4 ka Python example chhota hai aur line-by-line samjhaya gaya hai. Agla module sdw-ts is par banta hai aur faults dhundhne ka method sikhata hai.</p>

<h3>Day 0, day 1 aur day 2</h3>
<p>Network log deployment ko aksar teen phases mein baantte hain:</p>
<ul>
<li><b>Day 0</b>: design aur plan: addressing, sizing, roles.</li>
<li><b>Day 1</b>: deploy aur configure: controllers install karo, edges onboard karo, templates aur policy push karo (modules sdw-ctrl se sdw-sec).</li>
<li><b>Day 2</b>: operate: monitor, alert, upgrade, backup, secure, troubleshoot. Yeh module aur agla.</li>
</ul>
<p>Engineer ka zyadatar career Day 2 mein guzarta hai, aur interviewers shuruaati build se zyada isi ke baare mein poochte hain.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Manager ke aas-paas operations toolbox">
<rect x="230" y="95" width="180" height="70" rx="10" fill="#bae6fd"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="14">SD-WAN Manager</text><text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">single pane of glass</text>
<rect x="10" y="20" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="13">Monitor</text><text x="85" y="58" text-anchor="middle" class="svg-muted" font-size="11">dashboards, health</text>
<rect x="245" y="10" width="150" height="50" rx="8" fill="#fde68a"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Alarms aur logs</text><text x="320" y="48" text-anchor="middle" class="svg-muted" font-size="11">syslog, SNMP, email</text>
<rect x="480" y="20" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="555" y="42" text-anchor="middle" class="svg-ink" font-size="13">REST API</text><text x="555" y="58" text-anchor="middle" class="svg-muted" font-size="11">Python, automation</text>
<rect x="10" y="190" width="150" height="50" rx="8" fill="#fed7aa"/><text x="85" y="212" text-anchor="middle" class="svg-ink" font-size="13">Backup aur DR</text><text x="85" y="228" text-anchor="middle" class="svg-muted" font-size="11">configuration-db</text>
<rect x="245" y="200" width="150" height="50" rx="8" fill="#fed7aa"/><text x="320" y="222" text-anchor="middle" class="svg-ink" font-size="13">Upgrades</text><text x="320" y="238" text-anchor="middle" class="svg-muted" font-size="11">repository, rollback</text>
<rect x="480" y="190" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="555" y="212" text-anchor="middle" class="svg-ink" font-size="13">RBAC, certificates</text><text x="555" y="228" text-anchor="middle" class="svg-muted" font-size="11">Analytics, tools</text>
<line x1="160" y1="55" x2="230" y2="105" stroke="#64748b" stroke-width="2"/><line x1="320" y1="60" x2="320" y2="95" stroke="#64748b" stroke-width="2"/><line x1="480" y1="55" x2="410" y2="105" stroke="#64748b" stroke-width="2"/><line x1="160" y1="205" x2="230" y2="155" stroke="#64748b" stroke-width="2"/><line x1="320" y1="200" x2="320" y2="165" stroke="#64748b" stroke-width="2"/><line x1="480" y1="205" x2="410" y2="155" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Is module ka sab kuch Manager GUI, uske API ya uski command line se milta hai.</p></div>

<h3>Kahan click karna hai: Manager menu map</h3>
<table class="cmp"><tr><th>Kaam</th><th>Manager path</th></tr>
<tr><td>Fabric health ek nazar mein</td><td>Monitor &gt; Overview</td></tr>
<tr><td>Ek device, tunnels, real-time commands</td><td>Monitor &gt; Devices</td></tr>
<tr><td>Saare tunnels aur unki quality</td><td>Monitor &gt; Tunnels</td></tr>
<tr><td>Applications, security, VPN</td><td>Monitor &gt; Applications, Security, VPN</td></tr>
<tr><td>Alarms, events, audit log</td><td>Monitor &gt; Logs</td></tr>
<tr><td>Software images aur upgrades</td><td>Maintenance &gt; Software Repository, Software Upgrade</td></tr>
<tr><td>Certificates aur WAN edge list</td><td>Configuration &gt; Certificates</td></tr>
<tr><td>Users, groups, settings, DR</td><td>Administration &gt; Manage Users, Settings, Disaster Recovery</td></tr>
<tr><td>Device troubleshooting tools</td><td>Monitor &gt; Devices &gt; (device) &gt; Troubleshooting</td></tr></table>
<p>Menu names releases ke beech thode badalte hain. Agar menu is table ki jagah na mile to feature ka naam search karo; functions wahi hain.</p>

<div class="eg"><p><b>Worked example.</b> Bharat Retail ke NOC ka ek typical Monday: 09:00 baje Overview dashboard dikhata hai ki 72 mein se 71 sites ke paas full WAN connectivity hai, ek ke paas partial (ek branch ka MPLS circuit chala gaya). Alarm list us site ke liye 03:12 se Major alarm dikhati hai. Engineer us edge ke liye Monitor &gt; Devices kholta hai, ek BFD session colour down dekhta hai, Troubleshooting page se MPLS next hop ki taraf ping chalata hai, aur provider ke saath ticket raise karta hai. Kul samay: chhe minute, CLI chhue bina.</p></div>

<div class="warn"><p><b>Common mistake.</b> Manager ko sirf configuration tool samajhna. Agar koi alarms nahi dekhta aur koi backups test nahi karta, to fabric us ek tareeke se fail hoga jise design survive nahi kar sakta: ek anjaan chhoti problem jo badi ban jaaye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Blueprint section "Management and operations" mein GUI paths, REST API, upgrade order aur certificate topics milte hain. <b>Upgrade ka order</b> (Manager, Validator, Controller, phir edges) aur <b>API ke authentication steps</b> (session cookie, phir token) seekho.</p></div>

<div class="scn"><h4>Chupchaap expiry</h4><p>Ek retail group ne Monday ko dekha ki nayi branches join nahi ho paa rahi. Wajah ek controller certificate tha jo weekend mein expire ho gaya. Manager 60 din se ek aise mailbox mein certificate-expiry warnings bhej raha tha jise koi padhta nahi tha. Team ne shared channel mein notifications set up kiye aur runbook mein monthly certificate review joda, aur agla renewal expiry se do hafte pehle ho gaya.</p><p><b>Lesson:</b> monitoring tabhi kaam ki hai jab koi use receive kare aur uspar action le.</p></div>

<div class="iv"><p class="q">"SD-WAN fabric ke Day-2 operation mein kya kya hota hai?"</p><p>Manager dashboards mein health monitor karna, NOC ko notifications ke saath alarms aur events handle karna, Manager ka backup aur disaster recovery plan, sahi order mein rollback plan ke saath controlled software upgrades, certificate aur RBAC management, REST API se automation, aur troubleshooting ke liye built-in tools. Main runbooks aur change windows mein bhi document karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Day 2 (operate) engineer ka zyadatar kaam hai; Manager single pane of glass hai.</li>
<li>Menu map jaano: Monitor, Configuration, Maintenance, Administration.</li>
<li>Alarms logon tak pahunchne chahiye; certificates aur backups ko calendar reminders chahiye.</li>
<li>Upgrade order: Manager, Validator, Controller, phir WAN edges.</li>
<li>Agle chapters: dashboards, alarms, API, backup, upgrades, RBAC, tools, runbooks.</li>
</ul></div>
`}};export{e as default};