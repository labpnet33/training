var e={id:`controller-vs-device`,h:{en:`Controller-based or device-based? Source of truth and golden config`,hi:`Controller-based ya device-based? Source of truth aur golden config`},body:{en:`
<p>A frequent design question is not "which tool is best" but "where should the intent live, and who is allowed to change a device?" This chapter compares controller-based and device-by-device management and then introduces the <b>source of truth</b> that keeps either approach honest.</p>

<h3>The customer case: Northgate Manufacturing</h3>
<p>Northgate makes industrial pumps. It has 14 factories, 2 head-office campuses, about 11,000 employees and 620 network devices from three generations of Cisco hardware: Catalyst 9000 switches, older Catalyst 3750-X and 3850 stacks, and Nexus switches in two small server rooms. The network team has 12 people; two of them write Python. The board approved USD 300,000 for "network automation" after an audit found that no two factories had the same SNMP, NTP and AAA settings.</p>
<p><b>Requirements:</b> consistent baseline everywhere, fast change, an audit trail. <b>Constraints:</b> 180 devices are end-of-support and cannot join a controller; factory floors have unreliable WAN links to head office; the OT team wants to keep local control of plant switches during production.</p>

<h3>Analogy: air-traffic control or pilots talking to each other</h3>
<p>Device-based management is pilots coordinating directly: flexible, but every plane needs the full picture. Controller-based management is air-traffic control: one place sees everything and issues instructions, but if the tower loses power the planes still need a safe way to land.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Controller-based versus device-based management">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="14">Controller-based</text>
<rect x="95" y="34" width="130" height="44" rx="10" fill="#bae6fd"/><text x="160" y="61" text-anchor="middle" class="svg-ink" font-size="13">Controller</text>
<rect x="20" y="150" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="65" y="175" text-anchor="middle" class="svg-ink" font-size="12">Switch A</text>
<rect x="115" y="150" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="160" y="175" text-anchor="middle" class="svg-ink" font-size="12">Switch B</text>
<rect x="210" y="150" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="255" y="175" text-anchor="middle" class="svg-ink" font-size="12">Switch C</text>
<line x1="160" y1="78" x2="65" y2="150" stroke="#64748b" stroke-width="2"/><line x1="160" y1="78" x2="160" y2="150" stroke="#64748b" stroke-width="2"/><line x1="160" y1="78" x2="255" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="14">Device-based</text>
<rect x="415" y="34" width="130" height="44" rx="10" fill="#ddd6fe"/><text x="480" y="61" text-anchor="middle" class="svg-ink" font-size="13">Scripts / Git</text>
<rect x="340" y="150" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="385" y="175" text-anchor="middle" class="svg-ink" font-size="12">Switch A</text>
<rect x="435" y="150" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="480" y="175" text-anchor="middle" class="svg-ink" font-size="12">Switch B</text>
<rect x="530" y="150" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="575" y="175" text-anchor="middle" class="svg-ink" font-size="12">Switch C</text>
<line x1="480" y1="78" x2="385" y2="150" stroke="#64748b" stroke-width="2"/><line x1="480" y1="78" x2="480" y2="150" stroke="#64748b" stroke-width="2"/><line x1="480" y1="78" x2="575" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="160" y="125" text-anchor="middle" class="svg-muted" font-size="12">one API, one view</text><text x="480" y="125" text-anchor="middle" class="svg-muted" font-size="12">many sessions, your logic</text>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">Blue: controller. Purple: automation tooling. Green: devices.</text>
</svg><p class="cap">Both reach the same devices. The difference is where state, validation and workflow live.</p></div>

<h3>The trade-off table</h3>
<table class="cmp"><tr><th>Factor</th><th>Controller-based</th><th>Device-based</th></tr>
<tr><td>Consistency</td><td>High: intent modelled once</td><td>Depends on discipline and tests</td></tr>
<tr><td>Hardware support</td><td>Only supported platforms and releases</td><td>Anything with SSH or an API</td></tr>
<tr><td>Failure mode</td><td>Controller outage stops changes, data plane keeps forwarding</td><td>No central point of failure, but no central view</td></tr>
<tr><td>Flexibility</td><td>Constrained to what the controller models</td><td>Unlimited, including unusual features</td></tr>
<tr><td>Skills</td><td>GUI and workflows, quick start</td><td>Coding, testing, Git</td></tr>
<tr><td>Cost</td><td>Appliances, licences</td><td>Staff time, tooling</td></tr>
</table>

<h3>Source of truth and golden configuration</h3>
<p>Neither approach works without an answer to "what should this device look like?". A <b>source of truth (SoT)</b> is the authoritative record of intent: sites, devices, roles, VLANs, IP prefixes, circuits. Tools such as NetBox or Nautobot provide this as a database with an API. The <b>golden configuration</b> is the approved baseline for a role, usually built by merging a Jinja2 template with SoT data, producing an <b>intended config</b>. Automation then compares the intended config with the <b>running config</b> backed up from the device. Any difference is <b>drift</b>.</p>
<div class="eg"><p><b>Worked example.</b> Northgate defines a role "factory-access". The template sets NTP servers 192.0.2.123 and 192.0.2.124, syslog 198.51.100.50, and SNMPv3. The SoT says factory 7 has 38 access switches. The pipeline renders 38 intended configs, compares them with 38 backups, and reports 9 switches with a different NTP server. Without a SoT, nobody can say which of the two NTP values is correct.</p></div>

<h3>Chosen design for Northgate</h3>
<p>A hybrid. Catalyst Center manages the 300 supported Catalyst 9000 devices (templates, SWIM, assurance). The remaining 320 devices, including the end-of-support stacks and Nexus, stay device-based under Ansible, driven from NetBox as source of truth and a Git repository holding the Jinja2 role templates. A nightly job renders intended configs and reports drift for both worlds, so the audit finding is closed with one report. Plant OT keeps local read-write on its production switches; automation runs in report-only mode there until OT approves.</p>

<pre class="out">TASK [compare intended vs running] ***************************
ok: [fac07-sw01]
<span class="hl">changed: [fac07-sw14]  ntp server 203.0.113.10 present, 192.0.2.123 missing</span>
ok: [fac07-sw15]</pre>

<div class="warn"><p><b>Common mistake.</b> Using the device's own running configuration as the "truth". If the last engineer made an error, you faithfully preserve the error. The SoT must be a separate record that humans review.</p></div>
<div class="exam"><p><b>Exam trap.</b> Controllers rely on supported platforms; the data plane keeps forwarding if the controller fails, but you lose provisioning and assurance until it returns. A hybrid design is often the best answer when the customer has mixed generations.</p></div>

<div class="scn"><h4>Post-mortem: the helpful engineer</h4><p>At Northgate factory 3, an engineer fixed a late-night outage by adding a static route directly on a switch managed by the automation pipeline. The next nightly run pushed the golden config and removed the route; the line stopped at 02:00 and production halted for 40 minutes. The route had never been entered in the SoT. Fix: emergency changes are allowed but must be recorded in the SoT within one working day, the pipeline raises drift as a ticket before it overwrites, and production-critical devices use report-only mode.</p><p><b>Lesson:</b> automation without change discipline turns a quick fix into a time bomb.</p></div>

<div class="iv"><p class="q">"What is the difference between a source of truth and a backup?"</p><p>A backup records what a device is running, including mistakes. A source of truth records what the network should be, as reviewed intent. I generate intended configs from the SoT and compare them with backups to find drift.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Controller-based gives consistency and speed on supported platforms; device-based gives reach and flexibility.</li>
<li>Controller loss stops changes, not forwarding.</li>
<li>Source of truth plus templates produce the intended config; drift is the difference from running config.</li>
<li>Mixed estates usually need a hybrid design.</li>
<li>Control emergency changes, or automation will undo them.</li>
</ul></div>
`,hi:`
<p>Ek aam design question yeh nahi hota ki "kaunsa tool best hai" balki "intent kahan rahega, aur device ko kaun badal sakta hai?" Yeh chapter controller-based aur device-by-device management ko compare karta hai aur phir <b>source of truth</b> batata hai jo dono approaches ko imaandaar rakhta hai.</p>

<h3>Customer case: Northgate Manufacturing</h3>
<p>Northgate industrial pumps banata hai. Uske 14 factories, 2 head-office campuses, lagbhag 11,000 employees aur Cisco hardware ki teen generations ke 620 network devices hain: Catalyst 9000 switches, purane Catalyst 3750-X aur 3850 stacks, aur do chhote server rooms mein Nexus switches. Network team mein 12 log hain; unmein se do Python likhte hain. Audit mein pata chalne ke baad ki kisi do factories ki SNMP, NTP aur AAA settings same nahi hain, board ne "network automation" ke liye USD 300,000 approve kiye.</p>
<p><b>Requirements:</b> har jagah consistent baseline, fast change, audit trail. <b>Constraints:</b> 180 devices end-of-support hain aur controller join nahi kar sakte; factory floors ke WAN links head office tak unreliable hain; OT team production ke dauraan plant switches par local control rakhna chahti hai.</p>

<h3>Analogy: air-traffic control ya pilots aapas mein baat karte hue</h3>
<p>Device-based management pilots ka seedha coordination hai: flexible, par har plane ko poori picture chahiye. Controller-based management air-traffic control hai: ek jagah sab dikhta hai aur instructions milte hain, lekin tower ki power chali jaye to planes ko safe landing ka tareeka chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Controller-based versus device-based management">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="14">Controller-based</text>
<rect x="95" y="34" width="130" height="44" rx="10" fill="#bae6fd"/><text x="160" y="61" text-anchor="middle" class="svg-ink" font-size="13">Controller</text>
<rect x="20" y="150" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="65" y="175" text-anchor="middle" class="svg-ink" font-size="12">Switch A</text>
<rect x="115" y="150" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="160" y="175" text-anchor="middle" class="svg-ink" font-size="12">Switch B</text>
<rect x="210" y="150" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="255" y="175" text-anchor="middle" class="svg-ink" font-size="12">Switch C</text>
<line x1="160" y1="78" x2="65" y2="150" stroke="#64748b" stroke-width="2"/><line x1="160" y1="78" x2="160" y2="150" stroke="#64748b" stroke-width="2"/><line x1="160" y1="78" x2="255" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="14">Device-based</text>
<rect x="415" y="34" width="130" height="44" rx="10" fill="#ddd6fe"/><text x="480" y="61" text-anchor="middle" class="svg-ink" font-size="13">Scripts / Git</text>
<rect x="340" y="150" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="385" y="175" text-anchor="middle" class="svg-ink" font-size="12">Switch A</text>
<rect x="435" y="150" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="480" y="175" text-anchor="middle" class="svg-ink" font-size="12">Switch B</text>
<rect x="530" y="150" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="575" y="175" text-anchor="middle" class="svg-ink" font-size="12">Switch C</text>
<line x1="480" y1="78" x2="385" y2="150" stroke="#64748b" stroke-width="2"/><line x1="480" y1="78" x2="480" y2="150" stroke="#64748b" stroke-width="2"/><line x1="480" y1="78" x2="575" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="160" y="125" text-anchor="middle" class="svg-muted" font-size="12">ek API, ek view</text><text x="480" y="125" text-anchor="middle" class="svg-muted" font-size="12">kai sessions, aapka logic</text>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">Blue: controller. Purple: automation tooling. Green: devices.</text>
</svg><p class="cap">Dono same devices tak pahunchte hain. Farak yeh hai ki state, validation aur workflow kahan rehte hain.</p></div>

<h3>Trade-off table</h3>
<table class="cmp"><tr><th>Factor</th><th>Controller-based</th><th>Device-based</th></tr>
<tr><td>Consistency</td><td>High: intent ek baar model hota hai</td><td>Discipline aur tests par depend</td></tr>
<tr><td>Hardware support</td><td>Sirf supported platforms aur releases</td><td>SSH ya API wala koi bhi</td></tr>
<tr><td>Failure mode</td><td>Controller outage se changes ruk jaate hain, data plane forward karta rehta hai</td><td>Koi central point of failure nahi, par central view bhi nahi</td></tr>
<tr><td>Flexibility</td><td>Controller jo model karta hai usi tak seemit</td><td>Unlimited, unusual features sahit</td></tr>
<tr><td>Skills</td><td>GUI aur workflows, quick start</td><td>Coding, testing, Git</td></tr>
<tr><td>Cost</td><td>Appliances, licences</td><td>Staff time, tooling</td></tr>
</table>

<h3>Source of truth aur golden configuration</h3>
<p>Dono approaches ke liye "yeh device kaisa dikhna chahiye?" ka jawab chahiye. <b>Source of truth (SoT)</b> intent ka authoritative record hai: sites, devices, roles, VLANs, IP prefixes, circuits. NetBox ya Nautobot jaise tools ise API wale database ke roop mein dete hain. <b>Golden configuration</b> kisi role ka approved baseline hai, jo aam taur par Jinja2 template ko SoT data se merge karke banta hai aur <b>intended config</b> deta hai. Automation phir intended config ko device se backup ki gayi <b>running config</b> se compare karta hai. Koi bhi farak <b>drift</b> hai.</p>
<div class="eg"><p><b>Worked example.</b> Northgate ek role "factory-access" define karta hai. Template NTP servers 192.0.2.123 aur 192.0.2.124, syslog 198.51.100.50 aur SNMPv3 set karta hai. SoT kehta hai factory 7 mein 38 access switches hain. Pipeline 38 intended configs render karta hai, 38 backups se compare karta hai, aur 9 switches report karta hai jinme alag NTP server hai. SoT ke bina koi nahi bata sakta ki do NTP values mein se sahi kaunsi hai.</p></div>

<h3>Northgate ke liye chosen design</h3>
<p>Hybrid. Catalyst Center 300 supported Catalyst 9000 devices manage karta hai (templates, SWIM, assurance). Baaki 320 devices, end-of-support stacks aur Nexus sahit, device-based rehte hain Ansible ke under, jo NetBox ko source of truth aur Jinja2 role templates wali Git repository se chalta hai. Nightly job intended configs render karta hai aur dono duniya ka drift report karta hai, isliye audit finding ek report se band ho jaati hai. Plant OT apne production switches par local read-write rakhta hai; OT approve karne tak wahan automation report-only mode mein chalta hai.</p>

<pre class="out">TASK [compare intended vs running] ***************************
ok: [fac07-sw01]
<span class="hl">changed: [fac07-sw14]  ntp server 203.0.113.10 present, 192.0.2.123 missing</span>
ok: [fac07-sw15]</pre>

<div class="warn"><p><b>Common mistake.</b> Device ki apni running configuration ko "truth" maan lena. Agar pichhle engineer ne galti ki, to aap us galti ko imaandari se preserve karte ho. SoT alag record hona chahiye jise insaan review karein.</p></div>
<div class="exam"><p><b>Exam trap.</b> Controllers supported platforms par depend karte hain; controller fail ho to data plane forward karta rehta hai, par controller wapas aane tak provisioning aur assurance jaate hain. Mixed generations ho to hybrid design aksar best answer hota hai.</p></div>

<div class="scn"><h4>Post-mortem: madadgaar engineer</h4><p>Northgate factory 3 mein ek engineer ne raat ke outage ko theek karne ke liye automation pipeline se managed switch par seedha static route jod diya. Agli nightly run ne golden config push kiya aur route hata diya; line 02:00 baje ruk gayi aur production 40 minute band rahi. Route SoT mein kabhi enter nahi hua tha. Fix: emergency changes allowed hain par ek working day mein SoT mein record karne honge, pipeline overwrite karne se pehle drift ko ticket ke roop mein raise karta hai, aur production-critical devices report-only mode mein chalte hain.</p><p><b>Seekh:</b> change discipline ke bina automation quick fix ko time bomb bana deta hai.</p></div>

<div class="iv"><p class="q">"Source of truth aur backup mein kya farak hai?"</p><p>Backup record karta hai ki device kya chala raha hai, galtiyon sahit. Source of truth record karta hai ki network kaisa hona chahiye, reviewed intent ke roop mein. Main SoT se intended configs generate karta hoon aur drift dhundhne ke liye unhe backups se compare karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Controller-based supported platforms par consistency aur speed deta hai; device-based reach aur flexibility.</li>
<li>Controller loss changes rokta hai, forwarding nahi.</li>
<li>Source of truth plus templates intended config banate hain; drift running config se farak hai.</li>
<li>Mixed estates ko aam taur par hybrid design chahiye.</li>
<li>Emergency changes control karo, warna automation unhe undo kar dega.</li>
</ul></div>
`}};export{e as default};