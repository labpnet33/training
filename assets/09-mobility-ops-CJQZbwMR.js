var e={id:`mobility-ops`,h:{en:`Day-2 operations: blade replacement, firmware, backups and Call Home`,hi:`Day-2 operations: blade replacement, firmware, backups aur Call Home`},body:{en:`
<p>Buying a car is day 1. Servicing it, changing a flat tyre on the highway and keeping the papers safe is day 2, and day 2 lasts for years. This chapter covers the four day-2 jobs every UCS engineer does: replacing a failed blade without touching the SAN or the LAN, upgrading firmware without an outage, backing up the domain, and letting the system call for help on its own.</p>

<h3>Moving a service profile to a spare blade (Lab 4)</h3>
<p>Ticket INC-7402 at 02:14: ESX-01 is down, blade 1/1 shows an uncorrectable hardware error. Blade 1/3 is an unused spare in server pool SPARES.</p>
<ol>
<li><b>Confirm the failure.</b> Equipment ▸ Chassis 1 ▸ Server 1/1 shows Overall Status <b>Inoperable</b>, and Admin ▸ Faults shows the health fault for that server.</li>
<li><b>Record the identity</b> before you touch anything: ESX-01 ▸ Network shows eth0 = 00:25:B5:0A:00:00; ESX-01 ▸ Storage shows fc0 = 20:00:00:25:B5:0A:00:00. You will prove later that nothing changed.</li>
<li><b>Check the spare.</b> Same model and adapter family as the failed blade, healthy, unassociated, and discovered with no faults. Its firmware does not matter much: the host firmware package in the profile will bring it to the right version during association.</li>
<li><b>Disassociate</b> ESX-01 from 1/1 (ESX-01 ▸ Disassociate Service Profile) and wait for the FSM to finish.</li>
<li><b>Associate</b> ESX-01 with 1/3, either directly (Change Service Profile Association ▸ Select existing Server ▸ 1/3) or through server pool SPARES.</li>
<li><b>Verify.</b> The KVM console shows the SAN boot; ESX-01 still has the same MAC, UUID and WWPNs, so the array's LUN masking matches without any storage change.</li>
</ol>
<pre class="out">UCS-A# show fault severity major
Severity  Code   Last Transition Time     ID       Description
<span class="hl">Major     F0174  2026-09-29T02:13:41.512  2458311  Server 1/1 (service profile: org-root/ls-ESX-01) health: inoperable</span></pre>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Blade replacement timeline">
<line x1="30" y1="95" x2="610" y2="95" stroke="#64748b" stroke-width="2"/>
<circle cx="60" cy="95" r="8" fill="#fed7aa"/><text x="60" y="70" text-anchor="middle" class="svg-ink" font-size="12">02:14</text><text x="60" y="125" text-anchor="middle" class="svg-muted" font-size="12">fault</text>
<circle cx="190" cy="95" r="8" fill="#fde68a"/><text x="190" y="70" text-anchor="middle" class="svg-ink" font-size="12">02:18</text><text x="190" y="125" text-anchor="middle" class="svg-muted" font-size="12">note identity</text>
<circle cx="320" cy="95" r="8" fill="#bae6fd"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="12">02:20</text><text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">disassociate</text>
<circle cx="450" cy="95" r="8" fill="#ddd6fe"/><text x="450" y="70" text-anchor="middle" class="svg-ink" font-size="12">02:22</text><text x="450" y="125" text-anchor="middle" class="svg-muted" font-size="12">associate 1/3</text>
<circle cx="580" cy="95" r="8" fill="#bbf7d0"/><text x="580" y="70" text-anchor="middle" class="svg-ink" font-size="12">02:31</text><text x="580" y="125" text-anchor="middle" class="svg-muted" font-size="12">ESXi back</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">No rezoning, no remasking, no DHCP change</text>
</svg><p class="cap">The whole recovery is UCS-only because the identity travels with the profile.</p></div>

<p>Later, when the RMA blade arrives, slide it into slot 1/1. It is discovered, lands in the right server pool through the pool policy, and becomes the new spare.</p>

<h3>Firmware management</h3>
<p>UCS firmware comes in three bundles: the <b>A bundle</b> (infrastructure: UCS Manager, FIs, IOMs), the <b>B bundle</b> (B-Series and X-Series server components) and the <b>C bundle</b> (C-Series rack servers). You download them to the FIs under Firmware Management and then install them in two separate stages:</p>
<ul>
<li><b>Infrastructure firmware</b> (Auto Install ▸ Install Infrastructure Firmware). Order: 1) <b>UCS Manager</b> itself, management plane only, no data impact; 2) <b>IOMs</b> are updated and set to activate with their FI; 3) the <b>subordinate FI</b> reboots, while all traffic runs on the other fabric; 4) after it is back and HA READY, UCSM asks you to <b>acknowledge</b> the reboot of the <b>primary FI</b> in Pending Activities; the cluster fails over and the old primary upgrades.</li>
<li><b>Server firmware</b> through <b>host firmware packages</b> (Auto Install ▸ Install Server Firmware, or by changing the package in the template). Each server reboots, so the maintenance policy (User Ack or a scheduled window) controls the rollout.</li>
</ul>
<div class="eg"><p><b>Worked example: planning the window.</b> 32 ESXi hosts, 2 FIs. Infrastructure: UCSM about 20 minutes, subordinate FI about 40 minutes including reboot and re-sync, primary FI another 40 minutes, so plan roughly 2 hours with no host reboots. Servers: each host takes about 15 minutes (maintenance mode, reboot with firmware flash, exit). With 4 hosts in parallel, 32 ÷ 4 = 8 batches × 15 minutes = 2 hours. Plan two windows or one long night, not "30 minutes".</p></div>
<p>Before any infrastructure upgrade: check <b>HA READY</b>, take a full-state and an all-configuration backup, confirm every host really survives the loss of one fabric (ESXi teaming on both vmnics, SAN multipathing active on both paths), and check the <b>HCL</b> so the new firmware matches the OS driver versions.</p>

<h3>Backups (Admin ▸ Backup and Restore)</h3>
<table class="cmp"><tr><th>Type</th><th>Content</th><th>Use</th></tr>
<tr><td><b>Full state</b></td><td>Binary snapshot of the whole system</td><td>Disaster recovery; restored during the initial setup of a replacement FI</td></tr>
<tr><td><b>All configuration</b></td><td>XML: system + logical configuration</td><td>Restore or clone configuration to another domain</td></tr>
<tr><td><b>System configuration</b></td><td>XML: users, roles, management settings</td><td>Restore admin settings</td></tr>
<tr><td><b>Logical configuration</b></td><td>XML: orgs, pools, policies, templates, profiles, VLANs, VSANs</td><td>Restore or copy the logical design</td></tr>
</table>
<p>Backups go to a remote server using SCP, SFTP, FTP or TFTP. Use the <b>Full State Backup Policy</b> and the <b>All Configuration Export Policy</b> to schedule them daily or weekly. XML backups are restored with <b>Import</b>, choosing <b>merge</b> or <b>replace</b>. Keep copies off the FIs: a backup stored only on the failed system is not a backup.</p>

<h3>Call Home</h3>
<p><b>Smart Call Home</b> sends fault notifications and periodic inventory to Cisco TAC and to your own mailbox, filtered by severity. A failed DIMM can open a TAC case automatically with the serial number and logs attached. Pair it with SNMP traps and syslog to your monitoring system so the NOC sees the same faults.</p>

<div class="warn"><p><b>Common mistakes.</b> Replacing a blade by building a new profile instead of moving the old one. Upgrading while one host has a broken path on fabric B (it goes down when the FI reboots). Upgrading servers with an Immediate maintenance policy. Keeping backups only on the FI. Forgetting that full-state restore happens at FI setup time, not from the normal import menu.</p></div>
<div class="exam"><p><b>Exam tip.</b> Infrastructure upgrade order: UCSM → IOMs → subordinate FI → primary FI (after acknowledgement). Servers use host firmware packages. Backup types: full state (binary), all configuration, system configuration, logical configuration (XML).</p></div>

<div class="scn"><h4>The FI reboot that took down three hosts</h4><p>During an infrastructure upgrade the subordinate FI-B rebooted as planned, and three ESXi hosts lost their datastores and network. The other 29 were fine. Investigation showed that months earlier someone had removed vmnic0 from the vSwitch on those three hosts during a test and never added it back, and their fc0 paths were dead because of an old zoning change on fabric A. They were running on fabric B only. A pre-check script now runs before every FI reboot: <code>esxcli network vswitch standard list</code> and <code>esxcli storage core path list</code> on every host must show both fabrics active.</p><p><b>Lesson:</b> "the FI upgrade is non-disruptive" is only true if every host is truly dual-fabric; verify it first.</p></div>

<div class="iv"><p class="q">"How do you upgrade firmware in a UCS domain without downtime?"</p><p>Strong answer: take backups, check HA READY and the HCL, verify dual-fabric redundancy on every host. Upgrade infrastructure with Auto Install: UCSM first, then IOMs, then the subordinate FI while traffic runs on the other fabric, then acknowledge the primary FI reboot so the cluster fails over. Upgrade servers through host firmware packages with a user-ack maintenance policy, putting hosts in maintenance mode in batches. Mention the A, B and C bundles.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Blade replacement: confirm, record identity, disassociate, associate to spare (directly or via pool), verify.</li>
<li>Firmware bundles: A (infrastructure), B (blade/X-Series), C (rack).</li>
<li>Infrastructure order: UCSM → IOMs → subordinate FI → primary FI after acknowledgement.</li>
<li>Four backup types; schedule them and keep copies off the FIs.</li>
<li>Smart Call Home, SNMP and syslog make faults visible outside UCS Manager.</li>
</ul></div>
`,hi:`
<p>Car khareedna day 1 hai. Uski servicing, highway par flat tyre badalna aur papers safe rakhna day 2 hai, aur day 2 saalon chalta hai. Yeh chapter chaar day-2 kaam cover karta hai jo har UCS engineer karta hai: SAN ya LAN ko chhue bina fail blade replace karna, bina outage firmware upgrade karna, domain ka backup lena, aur system ko khud madad bulane dena.</p>

<h3>Service profile ko spare blade par le jaana (Lab 4)</h3>
<p>Ticket INC-7402, 02:14: ESX-01 down hai, blade 1/1 uncorrectable hardware error dikhata hai. Blade 1/3 server pool SPARES mein ek unused spare hai.</p>
<ol>
<li><b>Failure confirm karo.</b> Equipment ▸ Chassis 1 ▸ Server 1/1 Overall Status <b>Inoperable</b> dikhata hai, aur Admin ▸ Faults us server ka health fault dikhata hai.</li>
<li>Kuch bhi chhoone se pehle <b>identity record karo</b>: ESX-01 ▸ Network dikhata hai eth0 = 00:25:B5:0A:00:00; ESX-01 ▸ Storage dikhata hai fc0 = 20:00:00:25:B5:0A:00:00. Baad mein aap saabit karoge ki kuch nahi badla.</li>
<li><b>Spare check karo.</b> Fail blade jaisa model aur adapter family, healthy, unassociated, aur bina faults ke discovered. Uske firmware se zyada farak nahi padta: profile ka host firmware package association ke dauraan use sahi version par le aayega.</li>
<li>ESX-01 ko 1/1 se <b>disassociate</b> karo (ESX-01 ▸ Disassociate Service Profile) aur FSM khatam hone ka wait karo.</li>
<li>ESX-01 ko 1/3 se <b>associate</b> karo, ya to seedhe (Change Service Profile Association ▸ Select existing Server ▸ 1/3) ya server pool SPARES ke through.</li>
<li><b>Verify karo.</b> KVM console SAN boot dikhata hai; ESX-01 ke paas ab bhi wahi MAC, UUID aur WWPNs hain, isliye array ki LUN masking bina kisi storage change ke match karti hai.</li>
</ol>
<pre class="out">UCS-A# show fault severity major
Severity  Code   Last Transition Time     ID       Description
<span class="hl">Major     F0174  2026-09-29T02:13:41.512  2458311  Server 1/1 (service profile: org-root/ls-ESX-01) health: inoperable</span></pre>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Blade replacement timeline">
<line x1="30" y1="95" x2="610" y2="95" stroke="#64748b" stroke-width="2"/>
<circle cx="60" cy="95" r="8" fill="#fed7aa"/><text x="60" y="70" text-anchor="middle" class="svg-ink" font-size="12">02:14</text><text x="60" y="125" text-anchor="middle" class="svg-muted" font-size="12">fault</text>
<circle cx="190" cy="95" r="8" fill="#fde68a"/><text x="190" y="70" text-anchor="middle" class="svg-ink" font-size="12">02:18</text><text x="190" y="125" text-anchor="middle" class="svg-muted" font-size="12">identity note</text>
<circle cx="320" cy="95" r="8" fill="#bae6fd"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="12">02:20</text><text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">disassociate</text>
<circle cx="450" cy="95" r="8" fill="#ddd6fe"/><text x="450" y="70" text-anchor="middle" class="svg-ink" font-size="12">02:22</text><text x="450" y="125" text-anchor="middle" class="svg-muted" font-size="12">1/3 associate</text>
<circle cx="580" cy="95" r="8" fill="#bbf7d0"/><text x="580" y="70" text-anchor="middle" class="svg-ink" font-size="12">02:31</text><text x="580" y="125" text-anchor="middle" class="svg-muted" font-size="12">ESXi wapas</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">Na rezoning, na remasking, na DHCP change</text>
</svg><p class="cap">Poori recovery sirf UCS mein hoti hai kyunki identity profile ke saath chalti hai.</p></div>

<p>Baad mein jab RMA blade aaye, use slot 1/1 mein lagao. Woh discover hota hai, pool policy ke through sahi server pool mein pahunchta hai, aur naya spare ban jaata hai.</p>

<h3>Firmware management</h3>
<p>UCS firmware teen bundles mein aata hai: <b>A bundle</b> (infrastructure: UCS Manager, FIs, IOMs), <b>B bundle</b> (B-Series aur X-Series server components) aur <b>C bundle</b> (C-Series rack servers). Aap inhe Firmware Management ke neeche FIs par download karte ho aur phir do alag stages mein install karte ho:</p>
<ul>
<li><b>Infrastructure firmware</b> (Auto Install ▸ Install Infrastructure Firmware). Order: 1) <b>UCS Manager</b> khud, sirf management plane, data par asar nahi; 2) <b>IOMs</b> update hote hain aur apne FI ke saath activate hone ke liye set hote hain; 3) <b>subordinate FI</b> reboot hota hai, jabki saara traffic doosre fabric par chalta hai; 4) uske wapas aane aur HA READY hone ke baad UCSM aapse Pending Activities mein <b>primary FI</b> ke reboot ko <b>acknowledge</b> karne ko kehta hai; cluster failover hota hai aur purana primary upgrade hota hai.</li>
<li><b>Server firmware</b> <b>host firmware packages</b> ke through (Auto Install ▸ Install Server Firmware, ya template mein package badal kar). Har server reboot hota hai, isliye maintenance policy (User Ack ya scheduled window) rollout control karti hai.</li>
</ul>
<div class="eg"><p><b>Worked example: window plan karna.</b> 32 ESXi hosts, 2 FIs. Infrastructure: UCSM lagbhag 20 minute, subordinate FI reboot aur re-sync milakar lagbhag 40 minute, primary FI aur 40 minute, yaani bina host reboots ke lagbhag 2 ghante plan karo. Servers: har host lagbhag 15 minute leta hai (maintenance mode, firmware flash ke saath reboot, exit). 4 hosts parallel mein, 32 ÷ 4 = 8 batches × 15 minute = 2 ghante. Do windows ya ek lambi raat plan karo, "30 minute" nahi.</p></div>
<p>Kisi bhi infrastructure upgrade se pehle: <b>HA READY</b> check karo, full-state aur all-configuration backup lo, confirm karo ki har host sach mein ek fabric ke jaane par bhi bachta hai (dono vmnics par ESXi teaming, dono paths par SAN multipathing active), aur <b>HCL</b> check karo taaki naya firmware OS driver versions se match kare.</p>

<h3>Backups (Admin ▸ Backup and Restore)</h3>
<table class="cmp"><tr><th>Type</th><th>Content</th><th>Use</th></tr>
<tr><td><b>Full state</b></td><td>Poore system ka binary snapshot</td><td>Disaster recovery; replacement FI ke initial setup ke dauraan restore hota hai</td></tr>
<tr><td><b>All configuration</b></td><td>XML: system + logical configuration</td><td>Configuration restore karna ya doosre domain mein clone karna</td></tr>
<tr><td><b>System configuration</b></td><td>XML: users, roles, management settings</td><td>Admin settings restore karna</td></tr>
<tr><td><b>Logical configuration</b></td><td>XML: orgs, pools, policies, templates, profiles, VLANs, VSANs</td><td>Logical design restore ya copy karna</td></tr>
</table>
<p>Backups SCP, SFTP, FTP ya TFTP se remote server par jaate hain. Inhe daily ya weekly schedule karne ke liye <b>Full State Backup Policy</b> aur <b>All Configuration Export Policy</b> use karo. XML backups <b>Import</b> se restore hote hain, <b>merge</b> ya <b>replace</b> chun kar. Copies FIs se bahar rakho: sirf fail hue system par rakha backup, backup nahi hai.</p>

<h3>Call Home</h3>
<p><b>Smart Call Home</b> fault notifications aur periodic inventory Cisco TAC aur aapke apne mailbox ko bhejta hai, severity ke hisaab se filter karke. Fail hua DIMM serial number aur logs ke saath automatically TAC case khol sakta hai. Ise apne monitoring system tak SNMP traps aur syslog ke saath jodo taaki NOC ko bhi same faults dikhein.</p>

<div class="warn"><p><b>Common galtiyan.</b> Purana profile move karne ki jagah naya profile bana kar blade replace karna. Tab upgrade karna jab kisi host ka fabric B par path toota ho (FI reboot par woh down ho jaata hai). Immediate maintenance policy ke saath servers upgrade karna. Backups sirf FI par rakhna. Bhool jaana ki full-state restore normal import menu se nahi, FI setup ke waqt hota hai.</p></div>
<div class="exam"><p><b>Exam tip.</b> Infrastructure upgrade order: UCSM → IOMs → subordinate FI → primary FI (acknowledgement ke baad). Servers host firmware packages use karte hain. Backup types: full state (binary), all configuration, system configuration, logical configuration (XML).</p></div>

<div class="scn"><h4>FI reboot jisne teen hosts gira diye</h4><p>Infrastructure upgrade ke dauraan subordinate FI-B plan ke mutabik reboot hua, aur teen ESXi hosts ke datastores aur network chale gaye. Baaki 29 theek the. Investigation mein pata chala ki mahino pehle kisi ne test ke dauraan un teen hosts ke vSwitch se vmnic0 hata diya tha aur kabhi wapas nahi joda, aur fabric A par ek purane zoning change ki wajah se unke fc0 paths dead the. Woh sirf fabric B par chal rahe the. Ab har FI reboot se pehle ek pre-check script chalti hai: har host par <code>esxcli network vswitch standard list</code> aur <code>esxcli storage core path list</code> dono fabrics active dikhane chahiye.</p><p><b>Seekh:</b> "FI upgrade non-disruptive hai" tabhi sach hai jab har host sach mein dual-fabric ho; pehle verify karo.</p></div>

<div class="iv"><p class="q">"UCS domain mein bina downtime firmware kaise upgrade karte ho?"</p><p>Strong answer: backups lo, HA READY aur HCL check karo, har host par dual-fabric redundancy verify karo. Infrastructure ko Auto Install se upgrade karo: pehle UCSM, phir IOMs, phir subordinate FI jabki traffic doosre fabric par chalta hai, phir primary FI reboot acknowledge karo taaki cluster failover ho. Servers ko host firmware packages se user-ack maintenance policy ke saath upgrade karo, hosts ko batches mein maintenance mode mein daal kar. A, B aur C bundles mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Blade replacement: confirm, identity record, disassociate, spare se associate (seedhe ya pool se), verify.</li>
<li>Firmware bundles: A (infrastructure), B (blade/X-Series), C (rack).</li>
<li>Infrastructure order: UCSM → IOMs → subordinate FI → acknowledgement ke baad primary FI.</li>
<li>Chaar backup types; unhe schedule karo aur copies FIs se bahar rakho.</li>
<li>Smart Call Home, SNMP aur syslog faults ko UCS Manager ke bahar bhi visible banate hain.</li>
</ul></div>
`}};export{e as default};