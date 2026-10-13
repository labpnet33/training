var e={id:`backup-restore-dr`,h:{en:`Backup, restore and disaster recovery of the Manager`,hi:`Manager ka backup, restore aur disaster recovery`},body:{en:`
<p>A family keeps a photocopy of its important papers (passport, property deeds) in a locker at the bank, and a second set at a relative's house in another city. A copy at home is not enough, because a fire or a flood takes the original and the copy together. For a Catalyst SD-WAN fabric the important papers are the <b>Manager's configuration database</b>: every template, policy, user and setting. Without it you can still forward packets (the edges keep working), but you cannot change anything, and rebuilding it by hand takes days.</p>

<h3>What is at risk, and what keeps working</h3>
<p>The data plane does not depend on the Manager. If the Manager is lost, the WAN edges keep their last configuration and the Controllers keep their policy, so traffic continues. What you lose is the management plane: no template pushes, no monitoring, no new onboarding, no policy changes. That is why the Manager needs a recovery plan even though users do not notice an outage at once.</p>
<table class="cmp"><tr><th>Item</th><th>Where it lives</th><th>How it is protected</th></tr>
<tr><td>Templates, feature templates, policies, device attachments</td><td>Manager configuration database</td><td>Configuration database backup; DR replication</td></tr>
<tr><td>Controller and edge running configuration</td><td>On each device</td><td>Manager keeps what it pushed; export regularly</td></tr>
<tr><td>Users, groups, settings</td><td>Manager</td><td>Documented and re-created (the backup may not hold them, see below)</td></tr>
<tr><td>Software images</td><td>Manager software repository</td><td>Keep the originals on a file server</td></tr>
<tr><td>Certificates and the WAN edge list</td><td>Manager and controllers</td><td>Keep the root CA and the authorized serial file safe</td></tr></table>

<h3>Configuration database backup and restore</h3>
<p>The basic backup is a CLI command on the Manager that writes the configuration database to a compressed file:</p>
<pre class="code">VMANAGE# request nms configuration-db backup path /home/admin/db_backup
<span class="c">! produces /home/admin/db_backup.tar.gz</span>

<span class="c">! copy the file OFF the Manager (scp to a backup server), then on a rebuilt Manager:</span>
VMANAGE# request nms configuration-db restore path /home/admin/db_backup.tar.gz
VMANAGE# request nms all status</pre>
<p>Cisco's recovery note adds important cautions. The restore is <b>irreversible</b>. A restore on a new Manager does <b>not</b> bring back user accounts or the software repository, so recreate users and re-upload images. After the restore you must bring up the transport interface in VPN 0, re-synchronise the root certificates and the Manager's UUID with the Validators, and send the device lists to the controllers (Configuration &gt; Certificates). A new Manager must run the <b>same software version</b> as the one that made the backup.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Backup path">
<rect x="20" y="70" width="140" height="70" rx="8" fill="#bae6fd"/><text x="90" y="98" text-anchor="middle" class="svg-ink" font-size="13">VMANAGE</text><text x="90" y="118" text-anchor="middle" class="svg-muted" font-size="12">configuration-db</text>
<rect x="210" y="70" width="140" height="70" rx="8" fill="#fde68a"/><text x="280" y="98" text-anchor="middle" class="svg-ink" font-size="13">db_backup.tar.gz</text><text x="280" y="118" text-anchor="middle" class="svg-muted" font-size="12">on the Manager</text>
<rect x="400" y="20" width="220" height="70" rx="8" fill="#bbf7d0"/><text x="510" y="48" text-anchor="middle" class="svg-ink" font-size="13">Backup server (off-box)</text><text x="510" y="68" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.50, scp, retention</text>
<rect x="400" y="120" width="220" height="70" rx="8" fill="#ddd6fe"/><text x="510" y="148" text-anchor="middle" class="svg-ink" font-size="13">Second site / cloud copy</text><text x="510" y="168" text-anchor="middle" class="svg-muted" font-size="12">protects against site loss</text>
<line x1="160" y1="105" x2="210" y2="105" stroke="#64748b" stroke-width="2"/><line x1="350" y1="95" x2="400" y2="55" stroke="#64748b" stroke-width="2"/><line x1="350" y1="115" x2="400" y2="155" stroke="#64748b" stroke-width="2"/>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="12">A backup that stays on the same server is not a backup</text>
</svg><p class="cap">Create the backup, copy it off the Manager, and keep a second copy at another site.</p></div>

<h3>When to back up</h3>
<ul>
<li><b>Before every upgrade and every large change</b> (new policy, template migration). Cisco also advises checking the database before upgrading a 20.11.1 or later Manager with <code>request nms configuration-db diagnostics</code>.</li>
<li><b>On a schedule</b> (for example daily), automated and sent off-box, with a retention policy (7 daily, 4 weekly, 12 monthly).</li>
<li>Also take a <b>virtual machine snapshot</b> before an upgrade on a hypervisor, as a second layer.</li>
<li><b>Test the restore</b> at least once or twice a year on a spare VM. An untested backup is a hope, not a backup.</li>
</ul>

<h3>Disaster recovery (DR) between two Manager clusters</h3>
<p>A backup restores slowly. For fast recovery, Catalyst SD-WAN offers <b>disaster recovery</b>: a second Manager cluster in another data centre that receives regular copies of the primary's data. Cisco describes it as <b>administrator-triggered</b>: failover is not automatic, a person decides to promote the standby.</p>
<ul>
<li>Two clusters, <b>active (primary)</b> and <b>standby (secondary)</b>, of the same software version and with the same number of nodes (3-node and 6-node layouts are validated).</li>
<li><b>Replication</b> runs on a schedule; the default interval is <b>15 minutes</b>, so you lose at most about that much recent data in a failover (your <b>RPO</b>). The default delay threshold is 30 minutes, and replication history is kept for a year.</li>
<li>The clusters must reach each other over HTTPS on the transport VPN; the data-centre firewalls must allow <b>TCP 8443</b> and <b>830</b> (NETCONF, used when devices switch over).</li>
<li>A <b>dedicated local netadmin user</b>, identical on both clusters, is used for DR. Remote authentication (RADIUS, TACACS+) is not supported for this account.</li>
<li>Set it up under <b>Administration &gt; Disaster Recovery</b>. No upgrades or template pushes should be running during registration.</li>
<li>To fail over, go to the standby cluster, <b>Administration &gt; Disaster Recovery</b>, and choose <b>Make Primary</b>. Devices and controllers then converge on the new primary.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Bharat Retail runs a 3-node Manager cluster in Mumbai and a standby cluster in Chennai with a 15-minute replication interval. A flood takes the Mumbai data centre at 10:00. The last replication completed at 09:50, so up to 10 minutes of changes (for example a template edited at 09:55) are lost. The network team confirms the outage, opens Administration &gt; Disaster Recovery on the Chennai cluster and chooses Make Primary. By 10:25 the edges and controllers report to Chennai, and the monitoring and template functions are back. Meanwhile branch traffic was never interrupted, because the data plane does not need the Manager. RTO about 25 minutes, RPO about 10 minutes.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Keeping the backup file only on the Manager. (2) Restoring onto a different software version. (3) Forgetting that users and the repository are not in the backup and then discovering nobody can log in. (4) Treating DR as automatic: a person must trigger the failover. (5) Never testing.</p></div>

<div class="exam"><p><b>Exam trap.</b> The backup command is <code>request nms configuration-db backup path</code> and the restore uses <code>restore path</code> on the .tar.gz file. DR is a pair of clusters with <b>administrator-triggered</b> failover, replication every 15 minutes by default, TCP 8443 and 830 and a dedicated local netadmin user. Losing the Manager does not stop the data plane.</p></div>

<div class="scn"><h4>The restore that nobody had tried</h4><p>A bank's Manager VM disk failed. The team had a nightly backup, but the restore was never practised. The restored Manager started, yet nobody could log in (users are not in the backup), the software repository was empty, and the controllers refused the new Manager because the root certificates and UUID had not been re-synchronised. It took a day. After the incident the team wrote a restore runbook with every step, and rehearsed it twice a year.</p><p><b>Lesson:</b> a backup plan includes the restore steps and a rehearsal.</p></div>

<div class="iv"><p class="q">"What happens to the network if the Manager is lost, and how do you recover?"</p><p>Traffic keeps flowing because the edges keep their configuration and the Controllers keep their policy; I lose management functions: monitoring, template pushes and changes. For recovery I use a database backup (request nms configuration-db backup) copied off-box, restored on a new Manager of the same version, then recreate users, re-upload images, re-sync certificates with the Validators and send the device lists. For faster recovery I use disaster recovery with a standby cluster and a manual Make Primary.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Losing the Manager leaves the data plane running but removes management.</li>
<li><code>request nms configuration-db backup path</code> and <code>restore path</code>; copy the backup off-box.</li>
<li>A restore does not bring back users or the repository, and needs the same software version.</li>
<li>DR is two clusters, administrator-triggered, 15-minute replication by default, TCP 8443 and 830.</li>
<li>Back up before every upgrade, and rehearse the restore.</li>
</ul></div>
`,hi:`
<p>Ek parivaar apne zaroori kagzaat (passport, property deeds) ki photocopy bank ke locker mein rakhta hai, aur doosra set kisi doosre shehar ke rishtedaar ke ghar. Ghar par ek copy kaafi nahi, kyunki aag ya baadh original aur copy dono le jaati hai. Catalyst SD-WAN fabric ke liye zaroori kagzaat <b>Manager ka configuration database</b> hai: har template, policy, user aur setting. Uske bina bhi aap packets forward kar sakte ho (edges kaam karte rehte hain), lekin kuch badal nahi sakte, aur use haath se dobara banane mein din lagte hain.</p>

<h3>Kya khatre mein hai, aur kya chalta rehta hai</h3>
<p>Data plane Manager par depend nahi karta. Agar Manager kho jaaye to WAN edges apni aakhri configuration rakhte hain aur Controllers apni policy, isliye traffic chalta rehta hai. Jo khota hai woh management plane hai: koi template push nahi, monitoring nahi, naya onboarding nahi, policy changes nahi. Isliye Manager ko recovery plan chahiye bhale users ko outage turant na dikhe.</p>
<table class="cmp"><tr><th>Cheez</th><th>Kahan rehti hai</th><th>Kaise protect hoti hai</th></tr>
<tr><td>Templates, feature templates, policies, device attachments</td><td>Manager configuration database</td><td>Configuration database backup; DR replication</td></tr>
<tr><td>Controller aur edge running configuration</td><td>Har device par</td><td>Manager jo push kare woh rakhta hai; regularly export karo</td></tr>
<tr><td>Users, groups, settings</td><td>Manager</td><td>Document aur dobara banaye jaate hain (backup mein shayad nahi, neeche dekho)</td></tr>
<tr><td>Software images</td><td>Manager software repository</td><td>Originals file server par rakho</td></tr>
<tr><td>Certificates aur WAN edge list</td><td>Manager aur controllers</td><td>Root CA aur authorized serial file surakshit rakho</td></tr></table>

<h3>Configuration database backup aur restore</h3>
<p>Basic backup Manager par ek CLI command hai jo configuration database ko compressed file mein likhti hai:</p>
<pre class="code">VMANAGE# request nms configuration-db backup path /home/admin/db_backup
<span class="c">! /home/admin/db_backup.tar.gz banata hai</span>

<span class="c">! file ko Manager se BAHAR copy karo (backup server par scp), phir rebuilt Manager par:</span>
VMANAGE# request nms configuration-db restore path /home/admin/db_backup.tar.gz
VMANAGE# request nms all status</pre>
<p>Cisco ka recovery note zaroori savdhaniyan jodta hai. Restore <b>irreversible</b> hai. Naye Manager par restore user accounts ya software repository ko <b>wapas nahi</b> laata, isliye users dobara banao aur images dobara upload karo. Restore ke baad VPN 0 mein transport interface up karna padta hai, root certificates aur Manager ka UUID Validators ke saath re-synchronise karna padta hai, aur device lists controllers ko bhejni padti hain (Configuration &gt; Certificates). Naye Manager ka <b>same software version</b> hona chahiye jisne backup banaya tha.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Backup path">
<rect x="20" y="70" width="140" height="70" rx="8" fill="#bae6fd"/><text x="90" y="98" text-anchor="middle" class="svg-ink" font-size="13">VMANAGE</text><text x="90" y="118" text-anchor="middle" class="svg-muted" font-size="12">configuration-db</text>
<rect x="210" y="70" width="140" height="70" rx="8" fill="#fde68a"/><text x="280" y="98" text-anchor="middle" class="svg-ink" font-size="13">db_backup.tar.gz</text><text x="280" y="118" text-anchor="middle" class="svg-muted" font-size="12">Manager par</text>
<rect x="400" y="20" width="220" height="70" rx="8" fill="#bbf7d0"/><text x="510" y="48" text-anchor="middle" class="svg-ink" font-size="13">Backup server (off-box)</text><text x="510" y="68" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.50, scp, retention</text>
<rect x="400" y="120" width="220" height="70" rx="8" fill="#ddd6fe"/><text x="510" y="148" text-anchor="middle" class="svg-ink" font-size="13">Doosri site / cloud copy</text><text x="510" y="168" text-anchor="middle" class="svg-muted" font-size="12">site loss se bachata hai</text>
<line x1="160" y1="105" x2="210" y2="105" stroke="#64748b" stroke-width="2"/><line x1="350" y1="95" x2="400" y2="55" stroke="#64748b" stroke-width="2"/><line x1="350" y1="115" x2="400" y2="155" stroke="#64748b" stroke-width="2"/>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="12">Jo backup usi server par rahe woh backup nahi hai</text>
</svg><p class="cap">Backup banao, use Manager se bahar copy karo, aur doosri site par ek aur copy rakho.</p></div>

<h3>Backup kab lein</h3>
<ul>
<li><b>Har upgrade aur har bade change se pehle</b> (nayi policy, template migration). Cisco 20.11.1 ya baad ke Manager ko upgrade karne se pehle <code>request nms configuration-db diagnostics</code> se database check karne ki bhi salah deta hai.</li>
<li><b>Schedule par</b> (jaise roz), automated aur off-box bheja hua, retention policy ke saath (7 daily, 4 weekly, 12 monthly).</li>
<li>Hypervisor par upgrade se pehle <b>virtual machine snapshot</b> bhi lo, doosri layer ke roop mein.</li>
<li>Saal mein kam se kam ek ya do baar kisi spare VM par <b>restore test karo</b>. Bina test ka backup ummeed hai, backup nahi.</li>
</ul>

<h3>Do Manager clusters ke beech disaster recovery (DR)</h3>
<p>Backup dheere restore hota hai. Tez recovery ke liye Catalyst SD-WAN <b>disaster recovery</b> deta hai: doosre data centre mein doosra Manager cluster jo primary ke data ki regular copies receive karta hai. Cisco ise <b>administrator-triggered</b> describe karta hai: failover automatic nahi hai, ek insaan standby ko promote karne ka faisla karta hai.</p>
<ul>
<li>Do clusters, <b>active (primary)</b> aur <b>standby (secondary)</b>, same software version aur same number of nodes ke saath (3-node aur 6-node layouts validated hain).</li>
<li><b>Replication</b> schedule par chalti hai; default interval <b>15 minutes</b> hai, isliye failover mein aap adhiktam lagbhag utna recent data khote ho (aapka <b>RPO</b>). Default delay threshold 30 minutes hai, aur replication history ek saal rakhi jaati hai.</li>
<li>Clusters transport VPN par HTTPS se ek dusre tak pahunchne chahiye; data-centre firewalls ko <b>TCP 8443</b> aur <b>830</b> (NETCONF, jab devices switchover karte hain) allow karna chahiye.</li>
<li>DR ke liye ek <b>dedicated local netadmin user</b>, dono clusters par identical, use hota hai. Is account ke liye remote authentication (RADIUS, TACACS+) supported nahi hai.</li>
<li>Ise <b>Administration &gt; Disaster Recovery</b> mein set up karo. Registration ke dauran koi upgrade ya template push nahi chalna chahiye.</li>
<li>Failover ke liye standby cluster par jaao, <b>Administration &gt; Disaster Recovery</b>, aur <b>Make Primary</b> chuno. Devices aur controllers phir naye primary par converge karte hain.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Bharat Retail Mumbai mein 3-node Manager cluster aur Chennai mein 15-minute replication interval wala standby cluster chalata hai. 10:00 baje baadh Mumbai data centre le jaati hai. Aakhri replication 09:50 par poori hui thi, isliye 10 minute tak ke changes (jaise 09:55 par edit hua template) kho jaate hain. Network team outage confirm karti hai, Chennai cluster par Administration &gt; Disaster Recovery kholti hai aur Make Primary chunti hai. 10:25 tak edges aur controllers Chennai ko report karte hain, aur monitoring aur template functions wapas aa jaate hain. Is dauran branch traffic kabhi interrupt nahi hua, kyunki data plane ko Manager nahi chahiye. RTO lagbhag 25 minute, RPO lagbhag 10 minute.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Backup file sirf Manager par rakhna. (2) Alag software version par restore karna. (3) Bhool jaana ki users aur repository backup mein nahi hain aur phir pata chalna ki koi login nahi kar sakta. (4) DR ko automatic maan lena: failover insaan ko trigger karna padta hai. (5) Kabhi test na karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Backup command <code>request nms configuration-db backup path</code> hai aur restore .tar.gz file par <code>restore path</code> use karta hai. DR clusters ki jodi hai jisme <b>administrator-triggered</b> failover, default par har 15 minute replication, TCP 8443 aur 830 aur dedicated local netadmin user hota hai. Manager khone se data plane nahi rukta.</p></div>

<div class="scn"><h4>Woh restore jo kisi ne try nahi kiya tha</h4><p>Ek bank ke Manager VM ka disk fail ho gaya. Team ke paas nightly backup tha, lekin restore kabhi practise nahi hua tha. Restored Manager start hua, phir bhi koi login nahi kar paya (users backup mein nahi hote), software repository khaali thi, aur controllers ne naya Manager reject kiya kyunki root certificates aur UUID re-synchronise nahi hue the. Ek din lag gaya. Incident ke baad team ne har step ke saath restore runbook likha, aur saal mein do baar rehearse kiya.</p><p><b>Lesson:</b> backup plan mein restore steps aur rehearsal shamil hote hain.</p></div>

<div class="iv"><p class="q">"Manager kho jaaye to network ka kya hota hai, aur recover kaise karte ho?"</p><p>Traffic chalta rehta hai kyunki edges apni configuration aur Controllers apni policy rakhte hain; main management functions khota hoon: monitoring, template pushes aur changes. Recovery ke liye main database backup (request nms configuration-db backup) off-box copy karke, same version ke naye Manager par restore karta hoon, phir users dobara banata hoon, images dobara upload karta hoon, Validators ke saath certificates re-sync karta hoon aur device lists bhejta hoon. Tez recovery ke liye main standby cluster aur manual Make Primary ke saath disaster recovery use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Manager khone se data plane chalta rehta hai lekin management hat jaata hai.</li>
<li><code>request nms configuration-db backup path</code> aur <code>restore path</code>; backup ko off-box copy karo.</li>
<li>Restore users ya repository wapas nahi laata, aur same software version chahiye.</li>
<li>DR do clusters hain, administrator-triggered, default 15-minute replication, TCP 8443 aur 830.</li>
<li>Har upgrade se pehle backup lo, aur restore rehearse karo.</li>
</ul></div>
`}};export{e as default};