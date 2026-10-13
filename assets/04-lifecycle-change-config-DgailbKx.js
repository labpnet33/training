var e={id:`lifecycle`,h:{en:`Life-cycle, change and configuration management`,hi:`Life-cycle, change aur configuration management`},body:{en:`
<p>Think about a car. You buy it, service it on schedule, fix recalls, and one day the manufacturer stops making spare parts, so you sell it and wipe your phone from its entertainment system. Along the way, nobody changes the brakes without a record, and the owner's manual describes the car as it left the factory. Network devices live the same life: <b>life-cycle management</b>, <b>change management</b> and <b>configuration management</b>.</p>

<h3>Life-cycle management</h3>
<p>Every product moves through procurement, deployment, operation, maintenance and retirement. Two vendor milestones drive planning:</p>
<dl class="terms">
<dt>End of life (EOL)</dt><dd>The vendor announces the product is being retired: it will stop being sold and developed. Support usually continues for a period after the announcement.</dd>
<dt>End of support (EOS)</dt><dd>The date after which the vendor provides no more patches, bug fixes, security updates or hardware replacement. Running a device past EOS is a security and availability risk.</dd>
</dl>
<p>The inventory from chapter 3 should record these dates so replacements are budgeted a year ahead, not discovered during an outage.</p>

<h3>Software management</h3>
<ul>
<li><b>Patches and bug fixes</b>: small updates that fix a specific flaw, often security-related. Apply them on a regular schedule, faster for critical vulnerabilities.</li>
<li><b>Operating system</b> upgrades: new versions with new features; test in a lab first, check compatibility and release notes.</li>
<li><b>Firmware</b>: low-level code on hardware such as switches, access points, NICs and power supplies. Firmware updates can reboot devices, so they need a maintenance window.</li>
</ul>
<p>Always verify the image checksum (hash) before installing, keep the previous version available for rollback, and confirm the device has enough flash and memory.</p>

<h3>Decommissioning</h3>
<p>Retiring a device is a process, not unplugging it. Remove it from monitoring (or you will get false alarms), from DNS, IPAM and the inventory; reclaim its licences; update diagrams and the cable map; and <b>sanitise</b> it: erase configurations, keys and stored data so the next owner cannot read your passwords, community strings or VPN keys. Record who disposed of it and how.</p>

<h3>Change management</h3>
<p><b>Change management</b> is the formal process for making changes with controlled risk. N10-009 highlights the <b>request process tracking</b> (the <b>service request</b> or change ticket). A typical flow:</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Change management flow">
<rect x="5" y="40" width="95" height="50" rx="8" fill="#bae6fd"/><text x="52" y="62" text-anchor="middle" class="svg-ink" font-size="12">Request</text><text x="52" y="78" text-anchor="middle" class="svg-muted" font-size="12">ticket</text>
<rect x="110" y="40" width="95" height="50" rx="8" fill="#bae6fd"/><text x="157" y="62" text-anchor="middle" class="svg-ink" font-size="12">Assess</text><text x="157" y="78" text-anchor="middle" class="svg-muted" font-size="12">risk, impact</text>
<rect x="215" y="40" width="95" height="50" rx="8" fill="#fde68a"/><text x="262" y="62" text-anchor="middle" class="svg-ink" font-size="12">Approve</text><text x="262" y="78" text-anchor="middle" class="svg-muted" font-size="12">CAB</text>
<rect x="320" y="40" width="95" height="50" rx="8" fill="#bbf7d0"/><text x="367" y="62" text-anchor="middle" class="svg-ink" font-size="12">Implement</text><text x="367" y="78" text-anchor="middle" class="svg-muted" font-size="12">window</text>
<rect x="425" y="40" width="95" height="50" rx="8" fill="#bbf7d0"/><text x="472" y="62" text-anchor="middle" class="svg-ink" font-size="12">Verify</text><text x="472" y="78" text-anchor="middle" class="svg-muted" font-size="12">or roll back</text>
<rect x="530" y="40" width="105" height="50" rx="8" fill="#ddd6fe"/><text x="582" y="62" text-anchor="middle" class="svg-ink" font-size="12">Document</text><text x="582" y="78" text-anchor="middle" class="svg-muted" font-size="12">close ticket</text>
<line x1="100" y1="65" x2="110" y2="65" stroke="#64748b" stroke-width="2"/><line x1="205" y1="65" x2="215" y2="65" stroke="#64748b" stroke-width="2"/><line x1="310" y1="65" x2="320" y2="65" stroke="#64748b" stroke-width="2"/><line x1="415" y1="65" x2="425" y2="65" stroke="#64748b" stroke-width="2"/><line x1="520" y1="65" x2="530" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">Every step is tracked in the change ticket</text>
</svg><p class="cap">A change moves from request to closure, with a rollback plan ready before implementation starts.</p></div>
<p>The request states what will change, why, the risk, the <b>implementation plan</b>, the <b>test plan</b>, the <b>rollback (back-out) plan</b> and the <b>maintenance window</b>. A change advisory board (CAB) approves normal changes; <b>standard</b> changes are pre-approved low-risk tasks; <b>emergency</b> changes are approved quickly and documented afterwards.</p>

<h3>Configuration management</h3>
<p>Configuration management keeps device configurations known, backed up and consistent. N10-009 names three kinds of configuration:</p>
<table class="cmp"><tr><th>Term</th><th>Meaning</th></tr>
<tr><td><b>Production configuration</b></td><td>What the device is running right now, in service</td></tr>
<tr><td><b>Backup configuration</b></td><td>A saved copy (on the device and off-box) used to restore after a failure or a bad change</td></tr>
<tr><td><b>Baseline / golden configuration</b></td><td>The approved standard template every device of that role should match: AAA, logging, SNMP, NTP, banners, hardening</td></tr>
</table>
<p>On the lab CLI the running configuration is the production configuration, the startup configuration is the local backup that survives a reboot, and a copy is sent off the device:</p>
<pre class="code"><span class="c">! save the production configuration so it survives a reboot</span>
R1# copy running-config startup-config
<span class="c">! send a backup copy to a server (SCP is encrypted; TFTP is not)</span>
R1# copy running-config scp:
<span class="c">! compare what is running with the golden template during an audit</span>
R1# show running-config | include logging|snmp-server</pre>
<pre class="out">logging trap informational
<span class="hl">logging host 192.168.50.100</span>
snmp-server community NP-RO RO 20
snmp-server location Rack-A3</pre>
<p>Configuration monitoring tools (chapter 8) back up every device nightly and alert when a device drifts from its golden configuration.</p>

<div class="warn"><p><b>Common mistakes.</b> Making a "quick" change without a ticket or rollback plan. Forgetting to save the running configuration, so a reboot silently undoes the change. Keeping backups only on the device that may fail. Throwing away old switches without erasing their configurations.</p></div>

<div class="exam"><p><b>Exam trap.</b> EOL is the retirement announcement; <b>EOS</b> is when patches and support stop. The <b>golden configuration</b> is the approved standard, not simply the latest backup. A rollback plan belongs in the change request <b>before</b> approval.</p></div>

<div class="scn"><h4>The Friday firewall rule</h4><p>An engineer added an ACL line on the edge router late on Friday to block a suspicious address, without a change ticket. He typed the wrong mask and blocked the whole partner network. Weekend orders from partners failed. On Monday the team found the change only by comparing the running configuration with Thursday's nightly backup. They restored the correct line, then made every edge change go through a ticket with a peer-reviewed command list and rollback plan.</p><p><b>Lesson:</b> change management and configuration backups exist to catch exactly this kind of well-meant mistake.</p></div>

<div class="iv"><p class="q">"Walk me through how you would make a change to a production router."</p><p>Strong answer: raise a change request with purpose, risk and impact; write the exact commands, a test plan and a rollback plan; back up the current configuration; get approval and a maintenance window; implement, verify with specific show commands and monitoring; roll back if verification fails; save the configuration, update diagrams and close the ticket. Mention standard and emergency changes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EOL announces retirement; EOS ends patches and support. Plan replacements before EOS.</li>
<li>Software management covers patches and bug fixes, OS upgrades and firmware, with checksums and rollback.</li>
<li>Decommissioning means removing the device from every system and sanitising its data.</li>
<li>Change management: request, assess, approve, implement in a window, verify or roll back, document.</li>
<li>Configuration management: production, backup and baseline/golden configurations, with off-box backups.</li>
</ul></div>
`,hi:`
<p>Ek car ke baare mein socho. Aap use khareedte ho, schedule par service karwate ho, recalls fix karwate ho, aur ek din manufacturer spare parts banana band kar deta hai, to aap use bech dete ho aur uske entertainment system se apna phone mita dete ho. Is beech koi bhi bina record ke brakes nahi badalta, aur owner's manual car ko waise describe karta hai jaise woh factory se nikli thi. Network devices bhi yahi life jeete hain: <b>life-cycle management</b>, <b>change management</b> aur <b>configuration management</b>.</p>

<h3>Life-cycle management</h3>
<p>Har product procurement, deployment, operation, maintenance aur retirement se guzarta hai. Do vendor milestones planning chalate hain:</p>
<dl class="terms">
<dt>End of life (EOL)</dt><dd>Vendor announce karta hai ki product retire ho raha hai: woh bechna aur develop karna band hoga. Announcement ke baad aam taur par kuch samay tak support chalta rehta hai.</dd>
<dt>End of support (EOS)</dt><dd>Woh date jiske baad vendor koi patches, bug fixes, security updates ya hardware replacement nahi deta. EOS ke baad device chalana security aur availability risk hai.</dd>
</dl>
<p>Chapter 3 ki inventory mein yeh dates record honi chahiye taaki replacements ka budget ek saal pehle bane, outage ke dauraan pata na chale.</p>

<h3>Software management</h3>
<ul>
<li><b>Patches aur bug fixes</b>: chhote updates jo ek specific flaw fix karte hain, aksar security se jude. Inhe regular schedule par lagao, critical vulnerabilities ke liye aur jaldi.</li>
<li><b>Operating system</b> upgrades: naye features wale naye versions; pehle lab mein test karo, compatibility aur release notes check karo.</li>
<li><b>Firmware</b>: switches, access points, NICs aur power supplies jaise hardware par low-level code. Firmware updates devices reboot kar sakte hain, isliye unhe maintenance window chahiye.</li>
</ul>
<p>Install karne se pehle hamesha image ka checksum (hash) verify karo, rollback ke liye pichhla version available rakho, aur confirm karo ki device mein kaafi flash aur memory hai.</p>

<h3>Decommissioning</h3>
<p>Device retire karna ek process hai, sirf unplug karna nahi. Use monitoring se hatao (warna false alarms aayenge), DNS, IPAM aur inventory se hatao; uske licences wapas lo; diagrams aur cable map update karo; aur use <b>sanitise</b> karo: configurations, keys aur stored data erase karo taaki agla owner aapke passwords, community strings ya VPN keys na padh sake. Record karo ki kisne aur kaise dispose kiya.</p>

<h3>Change management</h3>
<p><b>Change management</b> controlled risk ke saath changes karne ka formal process hai. N10-009 <b>request process tracking</b> (<b>service request</b> ya change ticket) par zor deta hai. Typical flow:</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Change management flow">
<rect x="5" y="40" width="95" height="50" rx="8" fill="#bae6fd"/><text x="52" y="62" text-anchor="middle" class="svg-ink" font-size="12">Request</text><text x="52" y="78" text-anchor="middle" class="svg-muted" font-size="12">ticket</text>
<rect x="110" y="40" width="95" height="50" rx="8" fill="#bae6fd"/><text x="157" y="62" text-anchor="middle" class="svg-ink" font-size="12">Assess</text><text x="157" y="78" text-anchor="middle" class="svg-muted" font-size="12">risk, impact</text>
<rect x="215" y="40" width="95" height="50" rx="8" fill="#fde68a"/><text x="262" y="62" text-anchor="middle" class="svg-ink" font-size="12">Approve</text><text x="262" y="78" text-anchor="middle" class="svg-muted" font-size="12">CAB</text>
<rect x="320" y="40" width="95" height="50" rx="8" fill="#bbf7d0"/><text x="367" y="62" text-anchor="middle" class="svg-ink" font-size="12">Implement</text><text x="367" y="78" text-anchor="middle" class="svg-muted" font-size="12">window</text>
<rect x="425" y="40" width="95" height="50" rx="8" fill="#bbf7d0"/><text x="472" y="62" text-anchor="middle" class="svg-ink" font-size="12">Verify</text><text x="472" y="78" text-anchor="middle" class="svg-muted" font-size="12">ya roll back</text>
<rect x="530" y="40" width="105" height="50" rx="8" fill="#ddd6fe"/><text x="582" y="62" text-anchor="middle" class="svg-ink" font-size="12">Document</text><text x="582" y="78" text-anchor="middle" class="svg-muted" font-size="12">ticket close</text>
<line x1="100" y1="65" x2="110" y2="65" stroke="#64748b" stroke-width="2"/><line x1="205" y1="65" x2="215" y2="65" stroke="#64748b" stroke-width="2"/><line x1="310" y1="65" x2="320" y2="65" stroke="#64748b" stroke-width="2"/><line x1="415" y1="65" x2="425" y2="65" stroke="#64748b" stroke-width="2"/><line x1="520" y1="65" x2="530" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">Har step change ticket mein track hota hai</text>
</svg><p class="cap">Change request se closure tak jaata hai, aur implementation shuru hone se pehle rollback plan tayyar hota hai.</p></div>
<p>Request batata hai ki kya badlega, kyun, risk kya hai, <b>implementation plan</b>, <b>test plan</b>, <b>rollback (back-out) plan</b> aur <b>maintenance window</b>. Change advisory board (CAB) normal changes approve karta hai; <b>standard</b> changes pehle se approved low-risk tasks hain; <b>emergency</b> changes jaldi approve hote hain aur baad mein document hote hain.</p>

<h3>Configuration management</h3>
<p>Configuration management device configurations ko known, backed up aur consistent rakhta hai. N10-009 teen tarah ki configuration batata hai:</p>
<table class="cmp"><tr><th>Term</th><th>Matlab</th></tr>
<tr><td><b>Production configuration</b></td><td>Jo device abhi service mein chala raha hai</td></tr>
<tr><td><b>Backup configuration</b></td><td>Saved copy (device par aur off-box) jo failure ya kharab change ke baad restore karne ke kaam aati hai</td></tr>
<tr><td><b>Baseline / golden configuration</b></td><td>Approved standard template jisse us role ka har device match hona chahiye: AAA, logging, SNMP, NTP, banners, hardening</td></tr>
</table>
<p>Lab CLI par running configuration production configuration hai, startup configuration local backup hai jo reboot ke baad bhi rehta hai, aur ek copy device se bahar bheji jaati hai:</p>
<pre class="code"><span class="c">! production configuration save karo taaki reboot ke baad bhi rahe</span>
R1# copy running-config startup-config
<span class="c">! backup copy server par bhejo (SCP encrypted hai; TFTP nahi)</span>
R1# copy running-config scp:
<span class="c">! audit ke dauraan running config ko golden template se compare karo</span>
R1# show running-config | include logging|snmp-server</pre>
<pre class="out">logging trap informational
<span class="hl">logging host 192.168.50.100</span>
snmp-server community NP-RO RO 20
snmp-server location Rack-A3</pre>
<p>Configuration monitoring tools (chapter 8) har raat har device ka backup lete hain aur jab koi device apni golden configuration se drift karta hai to alert karte hain.</p>

<div class="warn"><p><b>Common galtiyan.</b> Bina ticket ya rollback plan ke "quick" change karna. Running configuration save karna bhoolna, taaki reboot chup chaap change undo kar de. Backups sirf usi device par rakhna jo fail ho sakta hai. Purane switches ki configurations erase kiye bina unhe phenk dena.</p></div>

<div class="exam"><p><b>Exam trap.</b> EOL retirement ka announcement hai; <b>EOS</b> tab hai jab patches aur support band hote hain. <b>Golden configuration</b> approved standard hai, sirf latest backup nahi. Rollback plan approval se <b>pehle</b> change request mein hona chahiye.</p></div>

<div class="scn"><h4>Friday wala firewall rule</h4><p>Ek engineer ne Friday der shaam edge router par ek suspicious address block karne ke liye ek ACL line jodi, bina change ticket ke. Usne galat mask type kiya aur poora partner network block ho gaya. Weekend par partners ke orders fail hue. Monday ko team ko change tab mila jab unhone running configuration ko Thursday ke nightly backup se compare kiya. Unhone sahi line restore ki, phir har edge change ko peer-reviewed command list aur rollback plan wale ticket se guzarna zaroori kar diya.</p><p><b>Seekh:</b> change management aur configuration backups isi tarah ki achhi niyat wali galti pakadne ke liye hi hote hain.</p></div>

<div class="iv"><p class="q">"Mujhe batao ki aap production router par change kaise karoge."</p><p>Strong answer: purpose, risk aur impact ke saath change request raise karo; exact commands, test plan aur rollback plan likho; current configuration ka backup lo; approval aur maintenance window lo; implement karo, specific show commands aur monitoring se verify karo; verification fail ho to roll back karo; configuration save karo, diagrams update karo aur ticket close karo. Standard aur emergency changes ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EOL retirement announce karta hai; EOS patches aur support khatam karta hai. EOS se pehle replacements plan karo.</li>
<li>Software management patches aur bug fixes, OS upgrades aur firmware cover karta hai, checksums aur rollback ke saath.</li>
<li>Decommissioning ka matlab device ko har system se hatana aur uska data sanitise karna.</li>
<li>Change management: request, assess, approve, window mein implement, verify ya roll back, document.</li>
<li>Configuration management: production, backup aur baseline/golden configurations, off-box backups ke saath.</li>
</ul></div>
`}};export{e as default};