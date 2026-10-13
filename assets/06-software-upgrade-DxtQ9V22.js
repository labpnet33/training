var e={id:`software-upgrade`,h:{en:`The software upgrade workflow: repository, upgrade, activate, default and rollback`,hi:`Software upgrade workflow: repository, upgrade, activate, default aur rollback`},body:{en:`
<p>Changing the engines of an aircraft while it is in service is dangerous, so airlines follow a strict routine: the new engine is delivered to the hangar first (<b>download</b>), it is fitted and tested on the ground (<b>install</b>), the pilot switches to it only when ready (<b>activate</b>), and if the instruments show a problem within the test window, the old engine comes back automatically (<b>rollback</b>). Only when the flight is stable does the airline mark the new engine as the standard one (<b>set default</b>). Catalyst SD-WAN software upgrades follow the same rhythm, and an upgrade done in the wrong <i>order</i> can disconnect the whole fabric.</p>

<h3>The order of components</h3>
<p>Upgrade the control side first and the edges last. The usual order, which Cisco documents for a group upgrade, is:</p>
<ol>
<li><b>SD-WAN Manager</b> first. The Manager must run the same or a newer release than the Controllers, Validators and edges it manages (check the compatibility matrix in the release notes).</li>
<li><b>SD-WAN Validator</b>.</li>
<li><b>SD-WAN Controller</b>(s). With two Controllers, upgrade them one at a time so edges always keep a control connection.</li>
<li><b>WAN edges</b>, in waves: a pilot site, then small groups, then the rest. Cisco notes that the Manager can upgrade up to 40 edges in parallel.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Upgrade order">
<rect x="10" y="40" width="130" height="70" rx="8" fill="#bae6fd"/><text x="75" y="70" text-anchor="middle" class="svg-ink" font-size="13">1 Manager</text><text x="75" y="90" text-anchor="middle" class="svg-muted" font-size="12">VMANAGE</text>
<rect x="170" y="40" width="130" height="70" rx="8" fill="#ddd6fe"/><text x="235" y="70" text-anchor="middle" class="svg-ink" font-size="13">2 Validator</text><text x="235" y="90" text-anchor="middle" class="svg-muted" font-size="12">VBOND</text>
<rect x="330" y="40" width="130" height="70" rx="8" fill="#ddd6fe"/><text x="395" y="70" text-anchor="middle" class="svg-ink" font-size="13">3 Controller</text><text x="395" y="90" text-anchor="middle" class="svg-muted" font-size="12">VSMART</text>
<rect x="490" y="40" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="560" y="70" text-anchor="middle" class="svg-ink" font-size="13">4 WAN edges</text><text x="560" y="90" text-anchor="middle" class="svg-muted" font-size="12">pilot, then waves</text>
<line x1="140" y1="75" x2="170" y2="75" stroke="#64748b" stroke-width="2"/><line x1="300" y1="75" x2="330" y2="75" stroke="#64748b" stroke-width="2"/><line x1="460" y1="75" x2="490" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">Manager, Validator, Controller, then edges</text>
</svg><p class="cap">Management and control components first, WAN edges last.</p></div>

<h3>The software repository</h3>
<p>Before upgrading, the images must be in the <b>software repository</b>: <b>Maintenance &gt; Software Repository</b>. Cisco describes three storage choices: images <b>stored on the Manager</b> and downloaded to devices over the control connection; images on a <b>remote server</b> that the Manager registers and tells devices to use (download over the out-of-band path through the Manager); and, from release 20.7.1, a remote server from which devices download <b>directly</b>. Direct download spares the Manager and the control tunnels from carrying big images to many branches.</p>

<h3>The four verbs: upgrade, activate, set default, confirm</h3>
<table class="cmp"><tr><th>Step</th><th>What it does</th><th>Where</th></tr>
<tr><td>Upgrade (download and install)</td><td>Copies the image to the device and installs it, but the device keeps running the old version</td><td>Maintenance &gt; Software Upgrade</td></tr>
<tr><td>Activate</td><td>Reboots into the new version</td><td>Same page; or tick "Activate and Reboot" to do both</td></tr>
<tr><td>Set default</td><td>Makes the version the one the device boots after a later reload</td><td>Same page, Set Default Version</td></tr>
<tr><td>Confirm</td><td>Accepts the activated version so it is not rolled back</td><td>Automatic when the control connection returns (GUI); a command on the CLI</td></tr></table>
<p>The upgrade pages are separate for the three groups: the <b>WAN Edge</b> tab, the <b>Control Components</b> tab (Validators and Controllers) and the <b>Manager</b> tab. For a Manager cluster, select all nodes of the cluster together. Separating "upgrade" from "activate" is the key trick: <b>download during the day, activate in the maintenance window</b>.</p>

<h3>The rollback timer: your safety net</h3>
<p>When the Manager activates a new version, it expects the device to reconnect. If the control connection to the Manager does not come back within the configured time limit, the Manager <b>automatically reverts the device to the previous version</b>. Cisco states the time limit as 5 minutes for most devices and 12 minutes for vEdge. This protects a remote branch with no engineer on site: a bad image or a broken configuration for the new version does not leave it stranded.</p>

<h3>The same job on the CLI of an IOS XE edge</h3>
<pre class="code">E-BLR-1# request platform software sdwan software install bootflash:c8000v-universalk9.17.08.01a.SPA.bin
E-BLR-1# request platform software sdwan software activate 17.08.01.0.1526
<span class="c">! after the router reloads and reconnects:</span>
E-BLR-1# request platform software sdwan software upgrade-confirm
E-BLR-1# request platform software sdwan software set-default 17.08.01.0.1526</pre>
<pre class="out">E-BLR-1# show sdwan software
VERSION           ACTIVE  DEFAULT  PREVIOUS  CONFIRMED  TIMESTAMP
17.06.03.0.1022   false   false    true      user       2026-03-04T21:10:44-00:00
<span class="hl">17.08.01.0.1526   true    true     false     user       2026-10-02T22:50:12-00:00</span></pre>
<p>The upgrade-confirm step is <b>mandatory</b> on the CLI: if you do not confirm, the router can roll back to the old release. The image name and version above are examples; use the versions from your release notes. <code>request platform software sdwan software remove</code> deletes an old version to free disk space.</p>

<h3>The upgrade checklist</h3>
<ol>
<li><b>Plan</b>: read the release notes and the compatibility matrix; choose the target version.</li>
<li><b>Pre-check</b>: all control connections up, no critical alarms, enough disk space, configuration backed up (chapter 5). For a 20.11.1 or later Manager, run <code>request nms configuration-db diagnostics</code>.</li>
<li><b>Upload</b> images to the repository.</li>
<li><b>Upgrade the Manager</b> (and cluster nodes), check the GUI and the controllers.</li>
<li><b>Upgrade the Validator, then Controllers</b>, one at a time.</li>
<li><b>Download to edges</b> in the day. <b>Activate</b> a pilot site first, then waves in the maintenance window.</li>
<li><b>Post-check</b>: current version column, control and BFD status, alarms, a user-level test.</li>
<li><b>Set default</b> and <b>record</b> the result; remove the old image later.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Bharat Retail has 72 branches and wants release X on all edges. Each image is about 600 MB. Pushing it from the Manager to all 72 over their control tunnels would move 72 x 600 MB = 43.2 GB. Direct download from a remote repository (20.7.1 and later) avoids that. The plan: Thursday daytime, download only; Saturday 01:00 to 03:00, activate pilot site E-BLR-1 and verify; at 01:30 activate 10 more; at 02:00 the next 30 (within the 40 parallel limit); at 02:30 the rest. If any edge does not reconnect in 5 minutes, it reverts by itself and goes on the "retry later" list. On Monday, set default on all edges and remove the old image.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Upgrading edges before the controllers, so they run a newer version than the Controllers support. (2) Activating all sites at once, with no pilot. (3) Forgetting upgrade-confirm on the CLI. (4) No backup before the Manager upgrade. (5) Reaching the maintenance window before the images are downloaded.</p></div>

<div class="exam"><p><b>Exam trap.</b> Order: Manager, Validator, Controller, then edges. <b>Activate</b> reboots into the new version; <b>set default</b> makes it permanent; <b>auto-rollback</b> reverts if the control connection to the Manager does not return in the time limit. CLI: install, activate, upgrade-confirm, set-default.</p></div>

<div class="scn"><h4>The branch that came back by itself</h4><p>During a Saturday upgrade, the Surat branch edge loaded the new version, but a firewall rule at the branch blocked the control connection. The Manager waited the rollback time, saw no control connection and reverted the router to the old version. At 03:10 the branch was back on the old software and working, with an alarm that explained what happened. On Monday the firewall was fixed and the upgrade was repeated successfully.</p><p><b>Lesson:</b> the rollback timer turns a possible site outage into a retry.</p></div>

<div class="iv"><p class="q">"Describe how you upgrade an SD-WAN fabric with minimal risk."</p><p>I back up the Manager, check compatibility and health, upload images to the repository, and upgrade in order: Manager, Validator, Controllers one at a time, then edges in waves starting with a pilot. I download in the day and activate in the maintenance window; the auto-rollback timer reverts an edge that cannot reconnect. After checks I set the default version and confirm on the CLI where needed, and document the result.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: Manager, Validator, Controller, then WAN edges in waves.</li>
<li>Maintenance &gt; Software Repository to store images; Software Upgrade to apply them.</li>
<li>Upgrade, Activate, Set Default; upgrade-confirm on the CLI.</li>
<li>Auto-rollback reverts a device that does not reconnect (5 minutes for most devices, 12 for vEdge).</li>
<li>Back up before upgrading; download early, activate in the window.</li>
</ul></div>
`,hi:`
<p>Service mein chalte aircraft ke engines badalna khatarnak hai, isliye airlines sakht routine follow karti hain: naya engine pehle hangar mein deliver hota hai (<b>download</b>), zameen par fit aur test hota hai (<b>install</b>), pilot tabhi usse switch karta hai jab taiyaar ho (<b>activate</b>), aur agar test window mein instruments koi problem dikhayein to purana engine apne aap wapas aa jaata hai (<b>rollback</b>). Flight stable hone par hi airline naye engine ko standard mark karti hai (<b>set default</b>). Catalyst SD-WAN software upgrades isi rhythm mein chalte hain, aur galat <i>order</i> mein kiya upgrade poore fabric ko disconnect kar sakta hai.</p>

<h3>Components ka order</h3>
<p>Control side pehle upgrade karo aur edges aakhir mein. Group upgrade ke liye Cisco jo usual order document karta hai:</p>
<ol>
<li><b>SD-WAN Manager</b> sabse pehle. Manager ko Controllers, Validators aur edges jinhe woh manage karta hai unke same ya naye release par chalna chahiye (release notes ka compatibility matrix check karo).</li>
<li><b>SD-WAN Validator</b>.</li>
<li><b>SD-WAN Controller</b>(s). Do Controllers hon to ek-ek karke upgrade karo taaki edges ke paas hamesha control connection rahe.</li>
<li><b>WAN edges</b>, waves mein: ek pilot site, phir chhote groups, phir baaki. Cisco batata hai ki Manager ek saath 40 edges tak upgrade kar sakta hai.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Upgrade order">
<rect x="10" y="40" width="130" height="70" rx="8" fill="#bae6fd"/><text x="75" y="70" text-anchor="middle" class="svg-ink" font-size="13">1 Manager</text><text x="75" y="90" text-anchor="middle" class="svg-muted" font-size="12">VMANAGE</text>
<rect x="170" y="40" width="130" height="70" rx="8" fill="#ddd6fe"/><text x="235" y="70" text-anchor="middle" class="svg-ink" font-size="13">2 Validator</text><text x="235" y="90" text-anchor="middle" class="svg-muted" font-size="12">VBOND</text>
<rect x="330" y="40" width="130" height="70" rx="8" fill="#ddd6fe"/><text x="395" y="70" text-anchor="middle" class="svg-ink" font-size="13">3 Controller</text><text x="395" y="90" text-anchor="middle" class="svg-muted" font-size="12">VSMART</text>
<rect x="490" y="40" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="560" y="70" text-anchor="middle" class="svg-ink" font-size="13">4 WAN edges</text><text x="560" y="90" text-anchor="middle" class="svg-muted" font-size="12">pilot, phir waves</text>
<line x1="140" y1="75" x2="170" y2="75" stroke="#64748b" stroke-width="2"/><line x1="300" y1="75" x2="330" y2="75" stroke="#64748b" stroke-width="2"/><line x1="460" y1="75" x2="490" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">Manager, Validator, Controller, phir edges</text>
</svg><p class="cap">Management aur control components pehle, WAN edges aakhir mein.</p></div>

<h3>Software repository</h3>
<p>Upgrade se pehle images <b>software repository</b> mein honi chahiye: <b>Maintenance &gt; Software Repository</b>. Cisco teen storage choices batata hai: images <b>Manager par stored</b> aur control connection se devices ko download; <b>remote server</b> par images jo Manager register karta hai aur devices ko use karne ko kehta hai (Manager ke through out-of-band path se download); aur release 20.7.1 se, ek remote server jahan se devices <b>seedhe</b> download karte hain. Direct download Manager aur control tunnels ko bahut saari branches tak badi images le jaane se bachata hai.</p>

<h3>Chaar verbs: upgrade, activate, set default, confirm</h3>
<table class="cmp"><tr><th>Step</th><th>Kya karta hai</th><th>Kahan</th></tr>
<tr><td>Upgrade (download aur install)</td><td>Image device par copy aur install karta hai, lekin device purana version chalata rehta hai</td><td>Maintenance &gt; Software Upgrade</td></tr>
<tr><td>Activate</td><td>Naye version mein reboot karta hai</td><td>Wahi page; ya dono ke liye "Activate and Reboot" tick karo</td></tr>
<tr><td>Set default</td><td>Version ko woh banata hai jis par device baad ke reload ke baad boot hota hai</td><td>Wahi page, Set Default Version</td></tr>
<tr><td>Confirm</td><td>Activated version ko accept karta hai taaki rollback na ho</td><td>Control connection wapas aane par automatic (GUI); CLI par command</td></tr></table>
<p>Upgrade pages teen groups ke liye alag hain: <b>WAN Edge</b> tab, <b>Control Components</b> tab (Validators aur Controllers) aur <b>Manager</b> tab. Manager cluster ke liye cluster ke saare nodes ek saath select karo. "Upgrade" ko "activate" se alag karna asli trick hai: <b>din mein download, maintenance window mein activate</b>.</p>

<h3>Rollback timer: aapka safety net</h3>
<p>Manager jab naya version activate karta hai to woh device ke dobara connect hone ki ummeed karta hai. Agar Manager se control connection configured time limit ke andar wapas na aaye, to Manager device ko <b>automatically pichle version par revert</b> kar deta hai. Cisco time limit ko zyadatar devices ke liye 5 minute aur vEdge ke liye 12 minute batata hai. Yeh aise remote branch ko bachata hai jahan koi engineer nahi: kharab image ya naye version ke liye toota configuration use phansa nahi chhodta.</p>

<h3>IOS XE edge ke CLI par wahi kaam</h3>
<pre class="code">E-BLR-1# request platform software sdwan software install bootflash:c8000v-universalk9.17.08.01a.SPA.bin
E-BLR-1# request platform software sdwan software activate 17.08.01.0.1526
<span class="c">! router reload hokar reconnect hone ke baad:</span>
E-BLR-1# request platform software sdwan software upgrade-confirm
E-BLR-1# request platform software sdwan software set-default 17.08.01.0.1526</pre>
<pre class="out">E-BLR-1# show sdwan software
VERSION           ACTIVE  DEFAULT  PREVIOUS  CONFIRMED  TIMESTAMP
17.06.03.0.1022   false   false    true      user       2026-03-04T21:10:44-00:00
<span class="hl">17.08.01.0.1526   true    true     false     user       2026-10-02T22:50:12-00:00</span></pre>
<p>CLI par upgrade-confirm step <b>mandatory</b> hai: confirm na karo to router purane release par rollback kar sakta hai. Upar ka image naam aur version examples hain; apne release notes ke versions use karo. <code>request platform software sdwan software remove</code> disk space free karne ke liye purana version delete karta hai.</p>

<h3>Upgrade checklist</h3>
<ol>
<li><b>Plan</b>: release notes aur compatibility matrix padho; target version chuno.</li>
<li><b>Pre-check</b>: saare control connections up, koi critical alarm nahi, kaafi disk space, configuration ka backup (chapter 5). 20.11.1 ya baad ke Manager ke liye <code>request nms configuration-db diagnostics</code> chalao.</li>
<li>Images repository mein <b>upload</b> karo.</li>
<li><b>Manager upgrade karo</b> (aur cluster nodes), GUI aur controllers check karo.</li>
<li><b>Validator, phir Controllers</b> upgrade karo, ek-ek karke.</li>
<li>Din mein edges par <b>download</b>. Pehle pilot site <b>activate</b> karo, phir maintenance window mein waves.</li>
<li><b>Post-check</b>: current version column, control aur BFD status, alarms, user-level test.</li>
<li><b>Set default</b> karo aur result <b>record</b> karo; purani image baad mein hatao.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Bharat Retail ki 72 branches hain aur woh saare edges par release X chahta hai. Har image lagbhag 600 MB hai. Use Manager se saare 72 ko control tunnels se push karne par 72 x 600 MB = 43.2 GB jaayega. Remote repository se direct download (20.7.1 aur baad) isse bachata hai. Plan: Thursday din mein sirf download; Saturday 01:00 se 03:00, pilot site E-BLR-1 activate karke verify; 01:30 par 10 aur activate; 02:00 par agle 30 (40 parallel limit ke andar); 02:30 par baaki. Agar koi edge 5 minute mein reconnect na kare to woh apne aap revert hota hai aur "baad mein retry" list mein jaata hai. Monday ko saare edges par set default karo aur purani image hatao.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Controllers se pehle edges upgrade karna, jisse woh Controllers ke support se naye version par chalte hain. (2) Pilot ke bina saari sites ek saath activate karna. (3) CLI par upgrade-confirm bhool jaana. (4) Manager upgrade se pehle backup nahi. (5) Images download hone se pehle maintenance window aa jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> Order: Manager, Validator, Controller, phir edges. <b>Activate</b> naye version mein reboot karta hai; <b>set default</b> use permanent banata hai; <b>auto-rollback</b> revert karta hai agar Manager se control connection time limit mein wapas na aaye. CLI: install, activate, upgrade-confirm, set-default.</p></div>

<div class="scn"><h4>Branch jo apne aap wapas aa gayi</h4><p>Saturday upgrade ke dauran Surat branch ke edge ne naya version load kiya, lekin branch ke ek firewall rule ne control connection block kar diya. Manager ne rollback time intezaar kiya, control connection nahi dekha aur router ko purane version par revert kar diya. 03:10 par branch purane software par wapas kaam kar rahi thi, ek alarm ke saath jo batata tha ki kya hua. Monday ko firewall theek hua aur upgrade dobara safaltapurvak hua.</p><p><b>Lesson:</b> rollback timer sambhavit site outage ko retry mein badal deta hai.</p></div>

<div class="iv"><p class="q">"Kam se kam risk ke saath SD-WAN fabric ko upgrade kaise karte ho?"</p><p>Main Manager ka backup leta hoon, compatibility aur health check karta hoon, images repository mein upload karta hoon, aur order mein upgrade karta hoon: Manager, Validator, Controllers ek-ek karke, phir edges waves mein pilot se shuru karke. Din mein download aur maintenance window mein activate karta hoon; auto-rollback timer us edge ko revert karta hai jo reconnect nahi kar paata. Checks ke baad main default version set karta hoon aur jahan zaroori ho CLI par confirm karta hoon, aur result document karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: Manager, Validator, Controller, phir WAN edges waves mein.</li>
<li>Images ke liye Maintenance &gt; Software Repository; apply karne ke liye Software Upgrade.</li>
<li>Upgrade, Activate, Set Default; CLI par upgrade-confirm.</li>
<li>Auto-rollback reconnect na karne wale device ko revert karta hai (zyadatar devices ke liye 5 minute, vEdge ke liye 12).</li>
<li>Upgrade se pehle backup; pehle download, window mein activate.</li>
</ul></div>
`}};export{e as default};