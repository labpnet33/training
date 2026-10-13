var e={id:`summary`,h:{en:`Summary, cheat sheet and exam checklist`,hi:`Summary, cheat sheet aur exam checklist`},body:{en:`
<p>You started this module with a network that "just works" on Day 0 and finish with a way to run it on Day 2 and beyond: watching it, being told when it breaks, automating routine reads, protecting the Manager, upgrading without drama, controlling access and keeping certificates alive. This chapter collects the module on one page.</p>

<h3>The whole module in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Operations loop summary">
<rect x="6" y="50" width="100" height="80" rx="8" fill="#bae6fd"/><text x="56" y="80" text-anchor="middle" class="svg-ink" font-size="13">Observe</text><text x="56" y="98" text-anchor="middle" class="svg-muted" font-size="11">dashboards</text><text x="56" y="114" text-anchor="middle" class="svg-muted" font-size="11">real time</text>
<rect x="120" y="50" width="100" height="80" rx="8" fill="#ddd6fe"/><text x="170" y="80" text-anchor="middle" class="svg-ink" font-size="13">Notify</text><text x="170" y="98" text-anchor="middle" class="svg-muted" font-size="11">alarms, syslog</text><text x="170" y="114" text-anchor="middle" class="svg-muted" font-size="11">SNMP, webhook</text>
<rect x="234" y="50" width="100" height="80" rx="8" fill="#fde68a"/><text x="284" y="80" text-anchor="middle" class="svg-ink" font-size="13">Automate</text><text x="284" y="98" text-anchor="middle" class="svg-muted" font-size="11">REST API</text><text x="284" y="114" text-anchor="middle" class="svg-muted" font-size="11">Python</text>
<rect x="348" y="50" width="100" height="80" rx="8" fill="#bbf7d0"/><text x="398" y="80" text-anchor="middle" class="svg-ink" font-size="13">Protect</text><text x="398" y="98" text-anchor="middle" class="svg-muted" font-size="11">backup, DR</text><text x="398" y="114" text-anchor="middle" class="svg-muted" font-size="11">RBAC</text>
<rect x="462" y="50" width="100" height="80" rx="8" fill="#fed7aa"/><text x="512" y="80" text-anchor="middle" class="svg-ink" font-size="13">Change</text><text x="512" y="98" text-anchor="middle" class="svg-muted" font-size="11">upgrade</text><text x="512" y="114" text-anchor="middle" class="svg-muted" font-size="11">certificates</text>
<rect x="576" y="50" width="60" height="80" rx="8" fill="#fbcfe8"/><text x="606" y="80" text-anchor="middle" class="svg-ink" font-size="13">Fix</text><text x="606" y="98" text-anchor="middle" class="svg-muted" font-size="11">tools</text><text x="606" y="114" text-anchor="middle" class="svg-muted" font-size="11">runbook</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="13">Operations is a loop: what you learn from a fault improves the dashboards and runbooks</text>
</svg><p class="cap">Observe, notify, automate, protect, change and fix; then improve the loop.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Read the Manager dashboards top-down: overview, device, tunnel, application.</li>
<li>Tell alarms from events, and send notifications by email, syslog, SNMP or webhook.</li>
<li>Authenticate to the REST API and read the device list with Python.</li>
<li>Back up the Manager, restore it, and explain disaster recovery with a standby cluster.</li>
<li>Upgrade in the right order with a rollback timer and a wave plan.</li>
<li>Design RBAC groups and a certificate renewal calendar.</li>
<li>Use ping, trace route, speed test and capture in the right VPN, and write a runbook.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Alarm</dt><dd>A notification of a condition that needs attention, with a severity.</dd>
<dt>Event</dt><dd>A record that something happened; many events create no alarm.</dd>
<dt>Audit log</dt><dd>Who changed what in the Manager, and when.</dd>
<dt>REST API</dt><dd>HTTP interface of the Manager, under the dataservice path, used by scripts.</dd>
<dt>Disaster recovery</dt><dd>A standby Manager cluster, with data replicated, switched over by an operator.</dd>
<dt>Rollback timer</dt><dd>Time after activation in which a device returns to the old version if not confirmed.</dd>
<dt>RBAC</dt><dd>Role-based access control: users, groups and per-feature read or write.</dd>
<dt>Send to Controllers</dt><dd>Pushes the authorized WAN edge list to Controllers and Validators.</dd>
<dt>Runbook</dt><dd>A short, repeatable page: trigger, checks, decisions, escalation.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Upgrade order</td><td>Manager, then Validators, then Controllers, then WAN edges</td></tr>
<tr><td>Upgrade verbs</td><td>Upload to repository, upgrade (install), activate, set default; rollback timer protects activation</td></tr>
<tr><td>Backup</td><td>Configuration database backup on the Manager, kept off the box</td></tr>
<tr><td>DR</td><td>Standby cluster, switch-over is a manual action</td></tr>
<tr><td>Predefined groups</td><td>basic, operator, netadmin; custom groups add per-feature read and write</td></tr>
<tr><td>API login</td><td>Session cookie, plus a token for write calls on newer releases</td></tr>
<tr><td>Certificates</td><td>Cisco PKI, Enterprise or Manual; states valid, staging, invalid</td></tr>
<tr><td>Alarm severities</td><td>Critical, major, medium, minor</td></tr></table>

<h3>Command and configuration cheat sheet</h3>
<pre class="code"><span class="c"># Manager shell: protect the Manager</span>
request nms configuration-db backup path /home/admin/db_backup
request nms configuration-db restore path /home/admin/db_backup.tar.gz
request nms all status

<span class="c"># WAN edge: software lifecycle (after the image is on the device)</span>
request platform software sdwan software install bootflash:c8000v-universalk9.17.08.01a.SPA.bin
request platform software sdwan software activate 17.08.01.0.1526
request platform software sdwan software upgrade-confirm
request platform software sdwan software set-default 17.08.01.0.1526
show sdwan software

<span class="c"># WAN edge: health in four commands</span>
show sdwan control connections
show sdwan omp summary
show sdwan bfd sessions
show sdwan system status</pre>
<p>REST pattern to remember: log in to the Manager, keep the session cookie, add the token header for changes, then GET the resource under the dataservice path, for example the device list or alarms.</p>

<div class="eg"><p><b>Worked example.</b> Wave planning check: 72 branches, waves of 12 with a 30-minute verification between waves and a pilot of 2 sites first. Time for the waves: 72 / 12 = 6 waves; 6 x 30 minutes = 180 minutes of verification, plus the pilot. If each wave takes 45 minutes to install and activate, total about 6 x 45 + 180 = 450 minutes, roughly 7.5 hours; the window must be planned for two nights or the waves widened.</p></div>

<div class="warn"><p><b>Common mistake.</b> Learning each feature alone. Operations questions mix them: an upgrade fails because of an expired certificate, an API script fails because a user lacks a group, a restore fails because the version differs. Think in the loop of the picture.</p></div>

<div class="exam"><p><b>Exam trap.</b> Watch the words <i>Manager</i>, <i>Validator</i>, <i>Controller</i> and <i>edge</i> in upgrade questions, and <i>activate</i> versus <i>set default</i>. Backup and DR are not the same: DR needs a second cluster.</p></div>

<div class="scn"><h4>The quarterly operations review</h4><p>Bharat Retail reviews operations every quarter: alarms per site, tickets per category, the age of the oldest software, certificate expiry dates, the date of the last tested restore, and the list of users per group. Each item has an owner and a target. In the first review they found one admin account of a person who had left and a Manager backup that was never copied off the box. Both were fixed within a week.</p><p><b>Lesson:</b> the checks you do regularly are the outages you do not have.</p></div>

<div class="iv"><p class="q">"How would you run a Catalyst SD-WAN network day to day?"</p><p>I watch the Manager dashboards and route alarms to email, syslog and SNMP into the monitoring system; I automate reads and reports with the REST API; I back up the Manager and run disaster recovery with a standby cluster; I upgrade in the order Manager, Validators, Controllers, edges with a rollback timer; I use RBAC and central authentication; I keep a certificate calendar; and I follow runbooks that end in the troubleshooting method.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Operations is a loop: observe, notify, automate, protect, change, fix.</li>
<li>Upgrade order: Manager, Validators, Controllers, edges; use the rollback timer.</li>
<li>Back up off the box; DR needs a standby cluster.</li>
<li>RBAC with least privilege; renew certificates early.</li>
<li>Next: the sdw-ts module teaches the troubleshooting method layer by layer.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module aise network se shuru kiya jo Day 0 par "bas chalta hai", aur ab aapke paas use Day 2 aur uske baad chalane ka tareeka hai: use dekhna, kuch tootne par khabar paana, routine reads automate karna, Manager ko bachana, bina drama ke upgrade karna, access control karna aur certificates zinda rakhna. Yeh chapter module ko ek page par ikattha karta hai.</p>

<h3>Poora module ek picture mein</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Operations loop summary">
<rect x="6" y="50" width="100" height="80" rx="8" fill="#bae6fd"/><text x="56" y="80" text-anchor="middle" class="svg-ink" font-size="13">Observe</text><text x="56" y="98" text-anchor="middle" class="svg-muted" font-size="11">dashboards</text><text x="56" y="114" text-anchor="middle" class="svg-muted" font-size="11">real time</text>
<rect x="120" y="50" width="100" height="80" rx="8" fill="#ddd6fe"/><text x="170" y="80" text-anchor="middle" class="svg-ink" font-size="13">Notify</text><text x="170" y="98" text-anchor="middle" class="svg-muted" font-size="11">alarms, syslog</text><text x="170" y="114" text-anchor="middle" class="svg-muted" font-size="11">SNMP, webhook</text>
<rect x="234" y="50" width="100" height="80" rx="8" fill="#fde68a"/><text x="284" y="80" text-anchor="middle" class="svg-ink" font-size="13">Automate</text><text x="284" y="98" text-anchor="middle" class="svg-muted" font-size="11">REST API</text><text x="284" y="114" text-anchor="middle" class="svg-muted" font-size="11">Python</text>
<rect x="348" y="50" width="100" height="80" rx="8" fill="#bbf7d0"/><text x="398" y="80" text-anchor="middle" class="svg-ink" font-size="13">Protect</text><text x="398" y="98" text-anchor="middle" class="svg-muted" font-size="11">backup, DR</text><text x="398" y="114" text-anchor="middle" class="svg-muted" font-size="11">RBAC</text>
<rect x="462" y="50" width="100" height="80" rx="8" fill="#fed7aa"/><text x="512" y="80" text-anchor="middle" class="svg-ink" font-size="13">Change</text><text x="512" y="98" text-anchor="middle" class="svg-muted" font-size="11">upgrade</text><text x="512" y="114" text-anchor="middle" class="svg-muted" font-size="11">certificates</text>
<rect x="576" y="50" width="60" height="80" rx="8" fill="#fbcfe8"/><text x="606" y="80" text-anchor="middle" class="svg-ink" font-size="13">Fix</text><text x="606" y="98" text-anchor="middle" class="svg-muted" font-size="11">tools</text><text x="606" y="114" text-anchor="middle" class="svg-muted" font-size="11">runbook</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="13">Operations ek loop hai: fault se jo seekha woh dashboards aur runbooks sudharta hai</text>
</svg><p class="cap">Observe, notify, automate, protect, change aur fix; phir loop sudharo.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Manager dashboards ko top-down padho: overview, device, tunnel, application.</li>
<li>Alarms aur events mein fark batao, aur email, syslog, SNMP ya webhook se notifications bhejo.</li>
<li>REST API par authenticate karo aur Python se device list padho.</li>
<li>Manager ka backup lo, restore karo, aur standby cluster ke saath disaster recovery samjhao.</li>
<li>Sahi order mein rollback timer aur wave plan ke saath upgrade karo.</li>
<li>RBAC groups aur certificate renewal calendar design karo.</li>
<li>Sahi VPN mein ping, trace route, speed test aur capture use karo, aur runbook likho.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Alarm</dt><dd>Aisi condition ki notification jise dhyan chahiye, severity ke saath.</dd>
<dt>Event</dt><dd>Record ki kuch hua; bahut se events alarm nahi banate.</dd>
<dt>Audit log</dt><dd>Manager mein kisne kya aur kab badla.</dd>
<dt>REST API</dt><dd>Manager ka HTTP interface, dataservice path ke neeche, scripts ke liye.</dd>
<dt>Disaster recovery</dt><dd>Standby Manager cluster, data replicate hota hai, operator switch karta hai.</dd>
<dt>Rollback timer</dt><dd>Activation ke baad ka samay jismein confirm na hone par device purane version par lautta hai.</dd>
<dt>RBAC</dt><dd>Role-based access control: users, groups aur per-feature read ya write.</dd>
<dt>Send to Controllers</dt><dd>Authorized WAN edge list ko Controllers aur Validators tak bhejta hai.</dd>
<dt>Runbook</dt><dd>Chhota, doharaya ja sakne wala page: trigger, checks, decisions, escalation.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Upgrade order</td><td>Manager, phir Validators, phir Controllers, phir WAN edges</td></tr>
<tr><td>Upgrade verbs</td><td>Repository mein upload, upgrade (install), activate, set default; rollback timer activation ko bachata hai</td></tr>
<tr><td>Backup</td><td>Manager par configuration database backup, box ke bahar rakha</td></tr>
<tr><td>DR</td><td>Standby cluster, switch-over manual action hai</td></tr>
<tr><td>Predefined groups</td><td>basic, operator, netadmin; custom groups per-feature read aur write dete hain</td></tr>
<tr><td>API login</td><td>Session cookie, aur naye releases mein write calls ke liye token</td></tr>
<tr><td>Certificates</td><td>Cisco PKI, Enterprise ya Manual; states valid, staging, invalid</td></tr>
<tr><td>Alarm severities</td><td>Critical, major, medium, minor</td></tr></table>

<h3>Command aur configuration cheat sheet</h3>
<pre class="code"><span class="c"># Manager shell: Manager ko bachao</span>
request nms configuration-db backup path /home/admin/db_backup
request nms configuration-db restore path /home/admin/db_backup.tar.gz
request nms all status

<span class="c"># WAN edge: software lifecycle (image device par aane ke baad)</span>
request platform software sdwan software install bootflash:c8000v-universalk9.17.08.01a.SPA.bin
request platform software sdwan software activate 17.08.01.0.1526
request platform software sdwan software upgrade-confirm
request platform software sdwan software set-default 17.08.01.0.1526
show sdwan software

<span class="c"># WAN edge: health chaar commands mein</span>
show sdwan control connections
show sdwan omp summary
show sdwan bfd sessions
show sdwan system status</pre>
<p>REST pattern yaad rakho: Manager mein login, session cookie rakho, changes ke liye token header lagao, phir dataservice path ke neeche resource GET karo, jaise device list ya alarms.</p>

<div class="eg"><p><b>Worked example.</b> Wave planning check: 72 branches, 12 ki waves, waves ke beech 30 minute verification aur pehle 2 sites ka pilot. Waves: 72 / 12 = 6 waves; 6 x 30 minute = 180 minute verification, pilot alag. Agar har wave ko install aur activate mein 45 minute lagein to total lagbhag 6 x 45 + 180 = 450 minute, yaani kareeb 7.5 ghante; window do raaton mein plan karo ya waves badi karo.</p></div>

<div class="warn"><p><b>Common mistake.</b> Har feature ko akela seekhna. Operations ke sawal sab mix karte hain: expired certificate ki wajah se upgrade fail hota hai, group na hone se API script fail hoti hai, version alag hone se restore fail hota hai. Picture ke loop mein socho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Upgrade sawalon mein <i>Manager</i>, <i>Validator</i>, <i>Controller</i> aur <i>edge</i> shabd aur <i>activate</i> versus <i>set default</i> dhyan se dekho. Backup aur DR ek jaise nahi hain: DR ko doosra cluster chahiye.</p></div>

<div class="scn"><h4>Quarterly operations review</h4><p>Bharat Retail har quarter operations review karta hai: har site ke alarms, category ke hisaab se tickets, sabse purane software ki age, certificate expiry dates, aakhri tested restore ki tareekh aur har group ke users. Har item ka owner aur target hai. Pehle review mein ek aise insaan ka admin account mila jo company chhod chuka tha, aur ek Manager backup jo kabhi box ke bahar copy nahi hua. Dono ek hafte mein theek hue.</p><p><b>Lesson:</b> jo checks aap regularly karte ho wahi woh outages hain jo aapko nahi hote.</p></div>

<div class="iv"><p class="q">"Catalyst SD-WAN network ko din-ba-din kaise chalaoge?"</p><p>Main Manager dashboards dekhta hoon aur alarms ko email, syslog aur SNMP se monitoring system mein bhejta hoon; reads aur reports REST API se automate karta hoon; Manager ka backup leta hoon aur standby cluster ke saath disaster recovery chalata hoon; Manager, Validators, Controllers, edges ke order mein rollback timer ke saath upgrade karta hoon; RBAC aur central authentication use karta hoon; certificate calendar rakhta hoon; aur runbooks follow karta hoon jo troubleshooting method par khatam hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Operations ek loop hai: observe, notify, automate, protect, change, fix.</li>
<li>Upgrade order: Manager, Validators, Controllers, edges; rollback timer use karo.</li>
<li>Backup box ke bahar; DR ko standby cluster chahiye.</li>
<li>Least-privilege RBAC; certificates jaldi renew karo.</li>
<li>Aage: sdw-ts module layer-by-layer troubleshooting method sikhata hai.</li>
</ul></div>
`}};export{e as default};