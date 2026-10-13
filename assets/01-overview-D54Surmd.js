var e=e=>`<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Backup server">
<rect x="20" y="25" width="150" height="55" rx="10" fill="#bae6fd"/><text x="95" y="50" text-anchor="middle" class="svg-ink" font-size="14">PUN-CORE-R1</text><text x="95" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.1</text>
<rect x="20" y="130" width="150" height="55" rx="10" fill="#bae6fd"/><text x="95" y="155" text-anchor="middle" class="svg-ink" font-size="14">BLR-EDGE-R2</text><text x="95" y="173" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.2</text>
<rect x="250" y="80" width="110" height="55" rx="10" fill="#e2e8f0"/><text x="305" y="112" text-anchor="middle" class="svg-ink" font-size="14">MGMT-SW</text>
<rect x="440" y="55" width="180" height="105" rx="10" fill="#bbf7d0"/><text x="530" y="82" text-anchor="middle" class="svg-ink" font-size="14">TFTP01</text><text x="530" y="102" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.40 - tftpd-hpa</text><text x="530" y="124" text-anchor="middle" class="svg-accent" font-size="12">/srv/tftp/*.cfg</text><text x="530" y="144" text-anchor="middle" class="svg-muted" font-size="12">UDP 69</text>
<line x1="170" y1="52" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="170" y1="157" x2="250" y2="118" stroke="#64748b" stroke-width="2"/><line x1="360" y1="107" x2="440" y2="107" stroke="#64748b" stroke-width="2"/>
<text x="305" y="30" text-anchor="middle" class="svg-accent" font-size="12">backup: router to server</text>
<text x="305" y="205" text-anchor="middle" class="svg-accent" font-size="12">restore: server to router</text>
</svg><p class="cap">`+e+`</p></div>`,t={id:`overview`,h:{en:`Moving files in a network: what you will learn and the big picture`,hi:`Network mein files move karna: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> Network devices are full of files that matter: configuration backups, operating system images, certificates, logs. In this module you will turn an Ubuntu server into a <b>TFTP server</b>, back up two routers to it, restore a wiped router from a backup, compare backups to see what changed, and understand why TFTP is insecure and what to use instead (SCP and SFTP). You will also lock the server down with a firewall and learn a fixed method for the day a transfer fails.</p>
<p><b>Prerequisites.</b> You should be comfortable with the Linux shell, file permissions, <code>sudo</code>, services and logs from the earlier modules of this track, and with the basic IOS commands <code>enable</code> and <code>configure terminal</code>. Every new command is explained as it appears.</p>

<h3>Analogy: the courier and the locked vault</h3>
<p>Imagine you must move an important document between two offices. You could hand it to a <b>courier who asks no questions</b>: fast and simple, but anybody can wave down the courier, read the parcel and swap it. Or you could use a <b>bank vault service</b> that checks ID at both ends and seals the parcel. TFTP is the courier: tiny, quick, built into almost every device, with no login and no secrecy. SCP and SFTP are the vault service, running inside SSH.</p>
`+e(`Backup sends the running configuration to the server; restore pulls it back to the router.`)+`

<h3>Why files matter to a network engineer</h3>
<ul>
<li><b>Configuration backup.</b> If a router dies or is erased, the backup file rebuilds it in minutes instead of hours.</li>
<li><b>Change history.</b> Two backups of the same router, compared, show exactly what changed overnight.</li>
<li><b>Software images.</b> Upgrading a switch or firewall means copying a large operating system file onto it.</li>
<li><b>Evidence and audit.</b> Dated configurations prove what was running on a given day.</li>
</ul>

<h3>The protocols at a glance</h3>
<table class="cmp"><tr><th>Protocol</th><th>Port</th><th>Login</th><th>Encrypted</th><th>Typical use</th></tr>
<tr><td>TFTP</td><td>UDP 69</td><td>None</td><td>No</td><td>Lab and management network backups, image loading by boot loaders</td></tr>
<tr><td>FTP</td><td>TCP 21 (+ data)</td><td>Yes, plain text</td><td>No</td><td>Legacy transfers</td></tr>
<tr><td>SCP</td><td>TCP 22</td><td>Yes (SSH)</td><td>Yes</td><td>Copy one file, scripts, secure backups</td></tr>
<tr><td>SFTP</td><td>TCP 22</td><td>Yes (SSH)</td><td>Yes</td><td>Interactive and automated secure transfers</td></tr></table>
<p>Do not worry about memorising the table now. Each row gets its own explanation in later chapters, and the table returns in the summary.</p>

<h3>The lab devices you will use</h3>
<p>Deccan Net's management network is 10.99.0.0/24. The routers are PUN-CORE-R1 (10.99.0.1) and BLR-EDGE-R2 (10.99.0.2), connected through a switch to the Ubuntu server TFTP01 (10.99.0.40), where you log in as <code>netadmin</code>. The files will live in the directory <code>/srv/tftp</code>.</p>

<div class="eg"><p><b>Worked example.</b> It is 23:50. A colleague runs <code>write erase</code> and <code>reload</code> on BLR-EDGE-R2 by mistake. The router boots with the name "Router" and no WAN configuration. Because a nightly job saved <code>BLR-EDGE-R2.cfg</code> on TFTP01, you give the router a management address, run one copy command from the server, and the WAN is back before midnight. Without that file you would rebuild from memory and an old spreadsheet.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking "the router saves its own config, so I do not need a backup." The startup configuration lives inside the same device. If the device fails or is erased, the copy goes with it. A backup must live somewhere else.</p></div>
<div class="exam"><p><b>Exam trap.</b> TFTP uses <b>UDP port 69</b> and has <b>no authentication and no encryption</b>. FTP and TFTP are different protocols: FTP uses TCP and logs in; TFTP does neither.</p></div>

<div class="scn"><h4>The backup that lived on the router</h4><p>A branch switch failed and was replaced. The engineer opened the old switch's flash for the configuration, but the flash chip was dead. The only backup was a screenshot in an email from two years earlier, missing eleven VLANs. After that incident the team scheduled a nightly copy to a server and kept thirty days of files.</p><p><b>Lesson:</b> a backup that shares a failure with the original is not a backup.</p></div>

<div class="iv"><p class="q">"How do you back up network device configurations?"</p><p>Copy the running configuration to a server off the device, for example with <code>copy running-config tftp://10.99.0.40/name.cfg</code> on a management network, or better with SCP or SFTP when the path is not trusted. Name files by device and date, keep several versions, compare them with <code>diff</code>, and restrict who can reach the server.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Network devices hold files that must be backed up off the device: configs, images, certificates.</li>
<li>TFTP is UDP 69, simple, with no login and no encryption.</li>
<li>SCP and SFTP run over SSH (TCP 22) and are the secure alternatives.</li>
<li>Two backups compared with <code>diff</code> show exactly what changed.</li>
<li>This module builds the server, the backup, the restore, the hardening and the troubleshooting method.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Network devices mein aisi files bhari hoti hain jo matter karti hain: configuration backups, operating system images, certificates, logs. Is module mein aap ek Ubuntu server ko <b>TFTP server</b> banaoge, do routers ka uspar backup loge, mite hue router ko backup se restore karoge, backups compare karke dekhoge ki kya badla, aur samjhoge ki TFTP insecure kyun hai aur uski jagah kya use karna hai (SCP aur SFTP). Aap server ko firewall se lock bhi karoge aur transfer fail hone wale din ke liye ek fixed method seekhoge.</p>
<p><b>Prerequisites.</b> Aapko pichhle modules se Linux shell, file permissions, <code>sudo</code>, services aur logs mein comfortable hona chahiye, aur basic IOS commands <code>enable</code> aur <code>configure terminal</code> aane chahiye. Har naya command aate hi samjhaya gaya hai.</p>

<h3>Analogy: courier aur locked vault</h3>
<p>Socho aapko do offices ke beech ek zaroori document bhejna hai. Aap use <b>aise courier ko de sakte ho jo koi sawaal nahi poochhta</b>: tez aur simple, par koi bhi courier ko rok kar parcel padh aur badal sakta hai. Ya aap <b>bank vault service</b> use kar sakte ho jo dono taraf ID check karti hai aur parcel seal karti hai. TFTP courier hai: chhota, tez, lagbhag har device mein built-in, na login na gopniyata. SCP aur SFTP vault service hain, jo SSH ke andar chalti hain.</p>
`+e(`Backup running configuration ko server par bhejta hai; restore use router par wapas khinchta hai.`)+`

<h3>Network engineer ke liye files kyun matter karti hain</h3>
<ul>
<li><b>Configuration backup.</b> Router mar jaaye ya erase ho jaaye to backup file ghanton ki jagah minutes mein rebuild kar deti hai.</li>
<li><b>Change history.</b> Ek hi router ke do backups compare karne se bilkul dikhta hai ki raat bhar mein kya badla.</li>
<li><b>Software images.</b> Switch ya firewall upgrade karne ka matlab ek bada operating system file us par copy karna.</li>
<li><b>Evidence aur audit.</b> Dated configurations sabit karti hain ki kisi din kya chal raha tha.</li>
</ul>

<h3>Protocols ek nazar mein</h3>
<table class="cmp"><tr><th>Protocol</th><th>Port</th><th>Login</th><th>Encrypted</th><th>Typical use</th></tr>
<tr><td>TFTP</td><td>UDP 69</td><td>Nahi</td><td>Nahi</td><td>Lab aur management network backups, boot loaders se image loading</td></tr>
<tr><td>FTP</td><td>TCP 21 (+ data)</td><td>Haan, plain text</td><td>Nahi</td><td>Legacy transfers</td></tr>
<tr><td>SCP</td><td>TCP 22</td><td>Haan (SSH)</td><td>Haan</td><td>Ek file copy, scripts, secure backups</td></tr>
<tr><td>SFTP</td><td>TCP 22</td><td>Haan (SSH)</td><td>Haan</td><td>Interactive aur automated secure transfers</td></tr></table>
<p>Table abhi yaad karne ki chinta mat karo. Har row ko aage ke chapters mein alag se samjhaya hai, aur table summary mein wapas aati hai.</p>

<h3>Lab devices jo aap use karoge</h3>
<p>Deccan Net ka management network 10.99.0.0/24 hai. Routers PUN-CORE-R1 (10.99.0.1) aur BLR-EDGE-R2 (10.99.0.2) hain, switch ke zariye Ubuntu server TFTP01 (10.99.0.40) se jude hue, jahan aap <code>netadmin</code> ban kar login karte ho. Files directory <code>/srv/tftp</code> mein rahengi.</p>

<div class="eg"><p><b>Worked example.</b> Raat ke 23:50 hain. Ek colleague galti se BLR-EDGE-R2 par <code>write erase</code> aur <code>reload</code> chala deta hai. Router "Router" naam aur bina WAN configuration ke boot hota hai. Kyunki nightly job ne TFTP01 par <code>BLR-EDGE-R2.cfg</code> save ki thi, aap router ko management address dete ho, router se ek copy command chalate ho, aur WAN aadhi raat se pehle wapas aa jaata hai. Us file ke bina aap yaadasht aur purani spreadsheet se rebuild karte.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Yeh sochna ki "router apni config khud save karta hai, to backup nahi chahiye." Startup configuration usi device ke andar hai. Device fail ya erase ho to copy bhi saath jaati hai. Backup kahin aur rehna chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> TFTP <b>UDP port 69</b> use karta hai aur uska <b>na authentication na encryption</b> hai. FTP aur TFTP alag protocols hain: FTP TCP use karta hai aur login karta hai; TFTP dono nahi.</p></div>

<div class="scn"><h4>Woh backup jo router par hi tha</h4><p>Ek branch switch fail hua aur badla gaya. Engineer ne configuration ke liye purane switch ka flash kholna chaha, par flash chip mar chuka tha. Ekmatra backup do saal purani email mein ek screenshot tha, jisme gyarah VLANs missing the. Is incident ke baad team ne server par nightly copy schedule ki aur tees din ki files rakhi.</p><p><b>Lesson:</b> jo backup original ke saath hi fail ho woh backup nahi hai.</p></div>

<div class="iv"><p class="q">"Network device configurations ka backup kaise lete ho?"</p><p>Running configuration ko device ke bahar server par copy karo, jaise management network par <code>copy running-config tftp://10.99.0.40/name.cfg</code>, ya jahan path par bharosa na ho wahan SCP ya SFTP se. Files ko device aur date se naam do, kai versions rakho, <code>diff</code> se compare karo, aur server tak kaun pahunch sake yeh restrict karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Network devices ki files ka backup device ke bahar hona chahiye: configs, images, certificates.</li>
<li>TFTP UDP 69 hai, simple, na login na encryption.</li>
<li>SCP aur SFTP SSH (TCP 22) par chalte hain aur secure alternatives hain.</li>
<li>Do backups <code>diff</code> se compare karke bilkul dikhta hai ki kya badla.</li>
<li>Yeh module server, backup, restore, hardening aur troubleshooting method banata hai.</li>
</ul></div>
`}};export{t as default};