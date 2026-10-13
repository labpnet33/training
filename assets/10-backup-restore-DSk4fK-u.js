var e={id:`backup-restore`,h:{en:`Backup and restore: protecting the configuration and the trust`,hi:`Backup aur restore: configuration aur trust ko surakshit rakhna`},body:{en:`
<p>Every office has one cabinet that contains the originals: the deeds, the licences, the seal. When a fire destroys the office, the company survives if copies of that cabinet exist in another building. In Catalyst SD-WAN the "cabinet" is the Manager's configuration database (templates, policies, device list, users) together with the certificates and settings that tie the controllers to the fabric. Without a recent copy, a failed Manager means rebuilding every template and policy by hand, and re-establishing trust with every device.</p>

<h3>What to protect</h3>
<table class="cmp"><tr><th>Item</th><th>Why it matters</th><th>How to protect it</th></tr>
<tr><td>Manager configuration database</td><td>Templates, configuration groups, policies, users, device inventory</td><td>Scheduled database backups copied off the box</td></tr>
<tr><td>Controller and Validator configuration</td><td>The bootstrap block and local settings</td><td>Keep a copy of the running configuration in the change system</td></tr>
<tr><td>Certificates and root CA files</td><td>Without them, devices cannot be trusted again</td><td>Store securely, record expiry dates, keep the enterprise CA safe</td></tr>
<tr><td>Manager settings</td><td>Organization name, Validator address, certificate method, Smart Account link</td><td>Document them; they are part of the runbook</td></tr>
<tr><td>VM images or snapshots</td><td>Quick rollback around an upgrade</td><td>Take before upgrades, keep only for a short time</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Backup flow">
<rect x="10" y="20" width="150" height="75" rx="10" fill="#fde68a"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="13">Manager</text><text x="85" y="63" text-anchor="middle" class="svg-muted" font-size="10">configuration</text><text x="85" y="78" text-anchor="middle" class="svg-muted" font-size="10">database</text>
<rect x="195" y="20" width="150" height="75" rx="10" fill="#bae6fd"/><text x="270" y="45" text-anchor="middle" class="svg-ink" font-size="13">Backup file</text><text x="270" y="63" text-anchor="middle" class="svg-muted" font-size="10">on the Manager,</text><text x="270" y="78" text-anchor="middle" class="svg-muted" font-size="10">dated name</text>
<rect x="380" y="20" width="120" height="75" rx="10" fill="#bbf7d0"/><text x="440" y="45" text-anchor="middle" class="svg-ink" font-size="13">Off-box copy</text><text x="440" y="63" text-anchor="middle" class="svg-muted" font-size="10">server or</text><text x="440" y="78" text-anchor="middle" class="svg-muted" font-size="10">storage</text>
<rect x="525" y="20" width="105" height="75" rx="10" fill="#ddd6fe"/><text x="577" y="45" text-anchor="middle" class="svg-ink" font-size="13">Test restore</text><text x="577" y="63" text-anchor="middle" class="svg-muted" font-size="10">on a lab</text><text x="577" y="78" text-anchor="middle" class="svg-muted" font-size="10">copy</text>
<path d="M160 57 L195 57 M345 57 L380 57 M500 57 L525 57" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="120" width="580" height="75" rx="10" fill="#f1f5f9"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="12">A backup that has never been restored is only a hope.</text><text x="320" y="168" text-anchor="middle" class="svg-muted" font-size="11">Schedule it, copy it out, test it, and keep several generations.</text>
</svg><p class="cap">Backup, copy away, then prove that it can be restored.</p></div>

<h3>Backing up the Manager database</h3>
<p>The Manager has a built-in command to create a backup of its configuration database. The file is created on the Manager and must then be copied to another system, because a backup that lives only on the failed disk is useless.</p>
<pre class="code"><span class="c">! Reference configuration: configuration database backup (exact syntax by release)</span>
request nms configuration-db backup path /home/admin/db_backup_2026-09-01</pre>
<pre class="out">VMANAGE# request nms configuration-db backup path /home/admin/db_backup_2026-09-01
Starting backup of configuration database
<span class="hl">Successfully saved database to /home/admin/db_backup_2026-09-01.tar.gz</span></pre>
<p>Automate this with a schedule, copy the file with a secure copy to a backup server and keep, for example, daily copies for a week and weekly copies for a quarter. Always take one before any upgrade or large policy change.</p>

<h3>Restoring</h3>
<p>Restoring is the reverse and needs more care because it replaces the current database. The usual sequence on a rebuilt Manager:</p>
<ol>
<li>Install a Manager at the same software version as the backup, or as the release notes allow.</li>
<li>Bootstrap it with the same identity: same organization name, VPN 0 address and Validator address.</li>
<li>Copy the backup file to the Manager.</li>
<li>Run the restore command with the path of the file.</li>
<li>Reinstall the Manager certificate if needed, then check that the Validator and the Controllers connect.</li>
<li>Check that templates, policies and the device list are present, and that edges show as connected.</li>
</ol>
<pre class="code"><span class="c">! Reference configuration: restore the configuration database</span>
request nms configuration-db restore path /home/admin/db_backup_2026-09-01.tar.gz</pre>
<p>While the Manager is down, the edges continue to forward traffic and the Controllers continue to run OMP. You lose visibility and the ability to change, not the network. This is the reason for the calm that a good backup gives during an incident.</p>

<h3>Controllers and the Validator</h3>
<p>These devices are simpler. Most of their running configuration, apart from the bootstrap, can be rebuilt from the Manager. Keep the bootstrap block, the certificate files and the root CA in the change system. To replace a Controller, build a new VM, apply the bootstrap block, install the certificate through the Manager and let the edges reconnect. If the system IP and certificate are reused, the edges treat it as the same device.</p>

<h3>Snapshots, with care</h3>
<p>A hypervisor snapshot is a quick way to roll back a failed upgrade. It is not a backup. It lives on the same storage, grows over time and slows the VM. For a Manager cluster, snapshots of the nodes must be taken together or not at all, because nodes that come back at different points in time disagree about the data. Delete a snapshot once the upgrade is confirmed.</p>

<div class="eg"><p><b>Recovery time in numbers.</b> A Manager disk fails at 14:00. The last backup is from 02:00 and was copied to the backup server. The engineer builds a new VM from the same image (40 minutes), bootstraps it (10 minutes), restores the database (20 minutes) and verifies the controllers and edges (15 minutes). Service is back at about 16:05. Changes made between 02:00 and 14:00 are lost, which is why changes are logged in a separate change system.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Leaving backups only on the Manager; never testing a restore; restoring to a different software version; losing the certificate files and root CA; relying on snapshots as backups; forgetting that the restored Manager needs the same identity.</p></div>

<div class="exam"><p><b>Exam traps.</b> Backup and restore of the configuration database is done with the nms configuration-db commands on the Manager. Edges keep working while the Manager is down. A snapshot is not a backup. A cluster is not disaster recovery, and neither replaces a backup.</p></div>

<div class="scn"><h4>The upgrade that went wrong</h4><p>An engineer upgraded a Manager on a Saturday and the new version failed to start. He had taken a database backup and a VM snapshot an hour before. He rolled back to the snapshot in ten minutes and the next day repeated the upgrade after checking the release notes. Edges kept forwarding traffic the whole time, and no user noticed.</p><p><b>Lesson:</b> a backup and a rollback plan turn an incident into a delay.</p></div>

<div class="iv"><p class="q">"What do you back up for the SD-WAN controllers, and how often?"</p><p>Strong answer: the Manager configuration database on a schedule (daily, plus before every change window), copied off the box; the controllers' bootstrap configuration; the certificates and root CA; and the Manager settings in the runbook. Say you test a restore regularly and that VM snapshots are only for upgrade rollbacks.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Protect the database, bootstrap configs, certificates and settings.</li>
<li>Use the nms configuration-db backup and restore commands on the Manager.</li>
<li>Copy backups off the box and test the restore.</li>
<li>Edges and Controllers keep working while the Manager is down.</li>
<li>Snapshots are for short rollbacks, not backups.</li>
</ul></div>
`,hi:`
<p>Har office mein ek almari hoti hai jisme originals rehte hain: deeds, licences, seal. Jab aag office jala deti hai to company tabhi bachti hai jab us almari ki copies doosri building mein hon. Catalyst SD-WAN mein "almari" Manager ka configuration database hai (templates, policies, device list, users), un certificates aur settings ke saath jo controllers ko fabric se bandhte hain. Taaza copy ke bina, failed Manager ka matlab hai har template aur policy haath se dobara banana, aur har device ke saath trust dobara kayam karna.</p>

<h3>Kya surakshit rakhna hai</h3>
<table class="cmp"><tr><th>Item</th><th>Kyun maayne rakhta hai</th><th>Kaise protect karein</th></tr>
<tr><td>Manager configuration database</td><td>Templates, configuration groups, policies, users, device inventory</td><td>Scheduled database backups jo box ke bahar copy hon</td></tr>
<tr><td>Controller aur Validator configuration</td><td>Bootstrap block aur local settings</td><td>Running configuration ki copy change system mein rakho</td></tr>
<tr><td>Certificates aur root CA files</td><td>Inke bina devices par dobara trust nahi ho sakta</td><td>Surakshit store karo, expiry dates note karo, enterprise CA ko safe rakho</td></tr>
<tr><td>Manager settings</td><td>Organization name, Validator address, certificate method, Smart Account link</td><td>Unhe document karo; woh runbook ka hissa hain</td></tr>
<tr><td>VM images ya snapshots</td><td>Upgrade ke aas-paas jaldi rollback</td><td>Upgrade se pehle lo, sirf kuch der rakho</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Backup flow">
<rect x="10" y="20" width="150" height="75" rx="10" fill="#fde68a"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="13">Manager</text><text x="85" y="63" text-anchor="middle" class="svg-muted" font-size="10">configuration</text><text x="85" y="78" text-anchor="middle" class="svg-muted" font-size="10">database</text>
<rect x="195" y="20" width="150" height="75" rx="10" fill="#bae6fd"/><text x="270" y="45" text-anchor="middle" class="svg-ink" font-size="13">Backup file</text><text x="270" y="63" text-anchor="middle" class="svg-muted" font-size="10">Manager par,</text><text x="270" y="78" text-anchor="middle" class="svg-muted" font-size="10">tareekh wala naam</text>
<rect x="380" y="20" width="120" height="75" rx="10" fill="#bbf7d0"/><text x="440" y="45" text-anchor="middle" class="svg-ink" font-size="13">Off-box copy</text><text x="440" y="63" text-anchor="middle" class="svg-muted" font-size="10">server ya</text><text x="440" y="78" text-anchor="middle" class="svg-muted" font-size="10">storage</text>
<rect x="525" y="20" width="105" height="75" rx="10" fill="#ddd6fe"/><text x="577" y="45" text-anchor="middle" class="svg-ink" font-size="13">Test restore</text><text x="577" y="63" text-anchor="middle" class="svg-muted" font-size="10">lab copy</text><text x="577" y="78" text-anchor="middle" class="svg-muted" font-size="10">par</text>
<path d="M160 57 L195 57 M345 57 L380 57 M500 57 L525 57" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="120" width="580" height="75" rx="10" fill="#f1f5f9"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="12">Jis backup ko kabhi restore nahi kiya gaya woh sirf ek umeed hai.</text><text x="320" y="168" text-anchor="middle" class="svg-muted" font-size="11">Schedule karo, bahar copy karo, test karo, aur kai generations rakho.</text>
</svg><p class="cap">Backup, door copy, phir saabit karo ki restore ho sakta hai.</p></div>

<h3>Manager database ka backup</h3>
<p>Manager ke paas apne configuration database ka backup banane ka built-in command hai. File Manager par banti hai aur use doosre system par copy karna hoga, kyunki sirf failed disk par rehne wala backup bekaar hai.</p>
<pre class="code"><span class="c">! Reference configuration: configuration database backup (exact syntax by release)</span>
request nms configuration-db backup path /home/admin/db_backup_2026-09-01</pre>
<pre class="out">VMANAGE# request nms configuration-db backup path /home/admin/db_backup_2026-09-01
Starting backup of configuration database
<span class="hl">Successfully saved database to /home/admin/db_backup_2026-09-01.tar.gz</span></pre>
<p>Ise schedule se automate karo, file ko secure copy se backup server par copy karo aur, maslan, ek hafte ke daily aur ek quarter ke weekly copies rakho. Kisi bhi upgrade ya bade policy change se pehle hamesha ek lo.</p>

<h3>Restore karna</h3>
<p>Restore ulta hai aur zyada dhyan maangta hai kyunki woh maujooda database ko badal deta hai. Rebuild kiye gaye Manager par aam sequence:</p>
<ol>
<li>Backup wale software version ka Manager install karo, ya jo release notes allow karein.</li>
<li>Use wahi identity ke saath bootstrap karo: same organization name, VPN 0 address aur Validator address.</li>
<li>Backup file Manager par copy karo.</li>
<li>File ke path ke saath restore command chalao.</li>
<li>Zaroorat ho to Manager certificate dobara install karo, phir check karo ki Validator aur Controllers connect hote hain.</li>
<li>Check karo ki templates, policies aur device list maujood hain, aur edges connected dikhte hain.</li>
</ol>
<pre class="code"><span class="c">! Reference configuration: restore the configuration database</span>
request nms configuration-db restore path /home/admin/db_backup_2026-09-01.tar.gz</pre>
<p>Manager ke down rehte edges traffic forward karte rehte hain aur Controllers OMP chalate rehte hain. Aap visibility aur badalne ki kshamta khote ho, network nahi. Isi wajah se achha backup incident ke dauran shanti deta hai.</p>

<h3>Controllers aur Validator</h3>
<p>Yeh devices saral hain. Bootstrap ko chhodkar unki zyada tar running configuration Manager se dobara banayi ja sakti hai. Bootstrap block, certificate files aur root CA ko change system mein rakho. Controller badalne ke liye naya VM banao, bootstrap block lagao, Manager ke zariye certificate install karo aur edges ko reconnect hone do. Agar system IP aur certificate reuse hote hain, to edges use wahi device maante hain.</p>

<h3>Snapshots, dhyan se</h3>
<p>Hypervisor snapshot failed upgrade ko rollback karne ka tez tareeka hai. Yeh backup nahi hai. Woh usi storage par rehta hai, samay ke saath badhta hai aur VM ko dheema karta hai. Manager cluster ke liye nodes ke snapshots saath mein lene hote hain ya bilkul nahi, kyunki alag samay par wapas aane wale nodes data par asahmat hote hain. Upgrade confirm hone ke baad snapshot delete karo.</p>

<div class="eg"><p><b>Recovery time numbers mein.</b> Manager ka disk 14:00 par fail hota hai. Aakhri backup 02:00 ka hai aur backup server par copy hua tha. Engineer same image se naya VM banata hai (40 minute), bootstrap karta hai (10 minute), database restore karta hai (20 minute) aur controllers aur edges verify karta hai (15 minute). Service lagbhag 16:05 par wapas aati hai. 02:00 aur 14:00 ke beech ke changes kho jaate hain, isliye changes alag change system mein log kiye jaate hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Backups sirf Manager par chhodna; restore kabhi test na karna; alag software version par restore karna; certificate files aur root CA kho dena; snapshots ko backup samajhna; yeh bhoolna ki restored Manager ko same identity chahiye.</p></div>

<div class="exam"><p><b>Exam traps.</b> Configuration database ka backup aur restore Manager par nms configuration-db commands se hota hai. Manager ke down rehte edges chalte rehte hain. Snapshot backup nahi hai. Cluster disaster recovery nahi hai, aur dono backup ki jagah nahi lete.</p></div>

<div class="scn"><h4>Upgrade jo galat gaya</h4><p>Ek engineer ne Saturday ko Manager upgrade kiya aur naya version start nahi hua. Usne ek ghanta pehle database backup aur VM snapshot liya tha. Usne das minute mein snapshot par rollback kiya aur agle din release notes dekhkar upgrade dohraya. Edges poore samay traffic forward karte rahe, aur kisi user ko pata nahi chala.</p><p><b>Seekh:</b> backup aur rollback plan incident ko delay mein badal dete hain.</p></div>

<div class="iv"><p class="q">"SD-WAN controllers ke liye kya backup karte ho, aur kitni baar?"</p><p>Strong answer: Manager configuration database schedule par (daily, aur har change window se pehle), box ke bahar copy; controllers ki bootstrap configuration; certificates aur root CA; aur Manager settings runbook mein. Kaho ki restore regularly test karte ho aur VM snapshots sirf upgrade rollback ke liye hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Database, bootstrap configs, certificates aur settings ko protect karo.</li>
<li>Manager par nms configuration-db backup aur restore commands use karo.</li>
<li>Backups box ke bahar copy karo aur restore test karo.</li>
<li>Manager ke down rehte edges aur Controllers chalte rehte hain.</li>
<li>Snapshots chhote rollbacks ke liye hain, backup ke liye nahi.</li>
</ul></div>
`}};export{e as default};