var e={id:`file-transfer`,h:{en:`Moving files: TFTP, FTP and SCP`,hi:`Files move karna: TFTP, FTP aur SCP`},body:{en:`
<p>Sending files to and from a router is like sending parcels. <b>TFTP</b> is a friend who carries small packets by hand, one at a time, waiting for a thumbs-up after each one, and never asks who you are. <b>FTP</b> is a courier company: faster, asks for your name and password, but writes them on the outside of the box where anyone can read them. <b>SCP</b> is an armoured van: it checks your ID and locks the parcel so nobody on the road can open it. All three are used every day to back up configurations and upgrade IOS.</p>

<h3>Why routers need file transfer</h3>
<ul>
<li><b>Configuration backup</b>: copy <code>running-config</code> to a server before and after every change.</li>
<li><b>Restore</b>: copy a known-good configuration back after a failure or RMA replacement.</li>
<li><b>IOS upgrades</b>: copy a new image into <code>flash:</code>, verify it, point the boot variable at it and reload.</li>
<li><b>Licences, certificates, scripts</b> also travel as files.</li>
</ul>

<h3>The three protocols compared</h3>
<table class="cmp"><tr><th></th><th>TFTP</th><th>FTP</th><th>SCP</th></tr>
<tr><td>Transport / port</td><td>UDP 69</td><td>TCP 21 control, TCP 20 data (active) or a negotiated port (passive)</td><td>TCP 22 (runs over SSH)</td></tr>
<tr><td>Authentication</td><td>None</td><td>Username and password, <b>clear text</b></td><td>SSH username and password or keys</td></tr>
<tr><td>Encryption</td><td>None</td><td>None</td><td>Yes, everything</td></tr>
<tr><td>Reliability</td><td>Own simple acknowledgements, lock-step blocks</td><td>TCP</td><td>TCP</td></tr>
<tr><td>Directory listing</td><td>No</td><td>Yes</td><td>No (SFTP does)</td></tr>
<tr><td>Typical use</td><td>Lab, PXE boot, IP phone configs</td><td>Large images inside a trusted network</td><td>Production, anything sensitive</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="TFTP FTP SCP flows">
<rect x="20" y="90" width="140" height="50" rx="8" fill="#bae6fd"/><text x="90" y="113" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="90" y="130" text-anchor="middle" class="svg-muted" font-size="12">flash:</text>
<rect x="480" y="90" width="140" height="50" rx="8" fill="#fed7aa"/><text x="550" y="113" text-anchor="middle" class="svg-ink" font-size="13">File server</text><text x="550" y="130" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.100</text>
<line x1="160" y1="40" x2="480" y2="40" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="320" y="32" text-anchor="middle" class="svg-muted" font-size="12">TFTP UDP 69: no login, no encryption</text>
<line x1="160" y1="115" x2="480" y2="115" stroke="#64748b" stroke-width="2"/><text x="320" y="107" text-anchor="middle" class="svg-muted" font-size="12">FTP TCP 21 + data: login in clear text</text>
<line x1="160" y1="190" x2="480" y2="190" stroke="#64748b" stroke-width="5"/><text x="320" y="182" text-anchor="middle" class="svg-accent" font-size="12">SCP TCP 22: authenticated and encrypted</text>
<line x1="90" y1="90" x2="160" y2="40" stroke="#64748b" stroke-width="1"/><line x1="90" y1="140" x2="160" y2="190" stroke="#64748b" stroke-width="1"/>
<line x1="550" y1="90" x2="480" y2="40" stroke="#64748b" stroke-width="1"/><line x1="550" y1="140" x2="480" y2="190" stroke="#64748b" stroke-width="1"/>
</svg><p class="cap">Same job, three levels of security. Only SCP protects the file and the login on the wire.</p></div>

<h3>The IOS file system in one minute</h3>
<p>IOS names storage with a prefix and a colon: <code>flash:</code> (images and files), <code>nvram:</code> (startup-config), <code>system:</code> (running-config), and remote locations <code>tftp:</code>, <code>ftp:</code>, <code>scp:</code>. The <code>copy</code> command always reads <b>copy source destination</b>.</p>
<pre class="out">R1# show flash:
-#- --length-- -----date/time------ path
1    106278008 Mar 12 2026 10:14:02 +00:00 <span class="hl">c2900-universalk9-mz.SPA.157-3.M8.bin</span>
2         3040 Sep 28 2026 16:40:11 +00:00 R1-before-ntp.cfg

148160512 bytes available (107745280 bytes used)</pre>
<p>The image name tells you the platform (<code>c2900</code>), feature set (<code>universalk9</code>), format (<code>mz</code>, compressed), and version (<code>157-3.M8</code> = 15.7(3)M8).</p>

<h3>TFTP: backup and restore</h3>
<pre class="code">R1# copy running-config tftp:
Address or name of remote host []? 10.1.1.100
Destination filename [r1-confg]? R1-2026-09-29.cfg
!!
3040 bytes copied in 0.188 secs (16170 bytes/sec)

<span class="c">! restore merges into the running config (it does not replace it)</span>
R1# copy tftp: running-config
<span class="c">! use a stable source address</span>
R1(config)# ip tftp source-interface Loopback0</pre>

<h3>FTP: large images</h3>
<pre class="code">R1(config)# ip ftp username nkadmin
R1(config)# ip ftp password NkFtp#2026
R1(config)# end
R1# copy ftp://10.1.1.100/c2900-universalk9-mz.SPA.157-3.M9.bin flash:</pre>
<p>The credentials can also be written in the URL (<code>ftp://user:password@host/file</code>), but then they sit in your command history. Either way they cross the network in clear text.</p>

<h3>SCP: the secure option</h3>
<pre class="code"><span class="c">! router as SCP client: pull a file from a server</span>
R1# copy scp://nkadmin@10.1.1.100/R1-2026-09-29.cfg flash:

<span class="c">! router as SCP server: needs SSH, AAA and a privileged user (preview of the hardening module)</span>
R1(config)# aaa new-model
R1(config)# aaa authentication login default local
R1(config)# aaa authorization exec default local
R1(config)# username nkadmin privilege 15 secret NkScp#2026
R1(config)# ip scp server enable</pre>
<p>The full SSH, AAA and SFTP setup is taught in the module <i>Device access, SSH, AAA and SFTP/SCP</i>. For this module remember: SCP runs over SSH on TCP 22 and encrypts both credentials and data.</p>

<h3>IOS upgrade workflow</h3>
<ol>
<li>Back up the running configuration: <code>copy running-config scp:</code> (or tftp:).</li>
<li>Check free space with <code>show flash:</code>.</li>
<li>Copy the image: <code>copy scp://nkadmin@10.1.1.100/&lt;image&gt; flash:</code>.</li>
<li>Verify integrity: <code>verify /md5 flash:&lt;image&gt;</code> and compare with the vendor's published hash.</li>
<li>Set the boot variable: <code>boot system flash:&lt;image&gt;</code>, then <code>copy running-config startup-config</code>.</li>
<li>Reload in a maintenance window and confirm with <code>show version</code>.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Why is TFTP so slow for images? Classic TFTP sends one 512-byte block and waits for its acknowledgement before sending the next. With a 10 ms round trip that is 512 bytes every 10 ms = about 51 kB/s. A 106 MB image then takes 106,000,000 / 51,200 ≈ 2,070 s, about <b>35 minutes</b>. FTP or SCP over TCP with a sliding window can fill a 100 Mbit/s path and finish in roughly 106 × 8 / 100 ≈ <b>9 seconds</b> plus overhead. (Some TFTP servers negotiate bigger blocks, which helps, but the lock-step design remains.)</p></div>

<div class="warn"><p><b>Common mistake.</b> <code>copy tftp: running-config</code> merges; it does not replace. Lines that exist on the router but not in the file stay. To replace a configuration cleanly use <code>configure replace</code> or copy to <code>startup-config</code> and reload.</p></div>

<div class="exam"><p><b>Exam trap.</b> TFTP = UDP 69, no authentication. FTP = TCP 20/21, authentication in clear text. SCP = TCP 22 via SSH, encrypted. The exam asks you to compare them and pick FTP or TFTP for a scenario; the secure answer is always SCP/SFTP.</p></div>

<div class="scn"><h4>The password in the capture</h4><p>During a penetration test, the tester ran a packet capture on the management VLAN and found the FTP username and password used by the nightly backup script for 300 routers. With it he could log in to the backup server and read every configuration, including SNMP communities and pre-shared keys. The team switched the script to SCP with a dedicated key-based account and removed FTP from the server.</p><p><b>Lesson:</b> FTP and TFTP are fine in an isolated lab; in production, configuration files are sensitive and must travel over SCP or SFTP.</p></div>

<div class="iv"><p class="q">"Compare TFTP, FTP and SCP. Which would you use to back up router configs?"</p><p>Strong answer: TFTP is UDP 69, no authentication or encryption, lock-step and slow, good for labs and PXE; FTP is TCP 20/21, authenticated but in clear text, faster and supports listings; SCP runs over SSH on TCP 22 and encrypts credentials and data. For configs, which contain secrets, use SCP or SFTP. Mention verifying images with <code>verify /md5</code> before changing the boot variable.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>TFTP UDP 69: simple, no login, no encryption, slow for large files.</li>
<li>FTP TCP 20/21: login in clear text; <code>ip ftp username</code> / <code>ip ftp password</code>.</li>
<li>SCP TCP 22 over SSH: authenticated and encrypted; <code>ip scp server enable</code> needs SSH and AAA.</li>
<li><code>copy source destination</code>; <code>copy tftp: running-config</code> merges.</li>
<li>Upgrade: backup, copy image, <code>verify /md5</code>, <code>boot system</code>, save, reload.</li>
</ul></div>
`,hi:`
<p>Router se files bhejna aur lena parcels bhejne jaisa hai. <b>TFTP</b> ek dost hai jo chhote packets haath se, ek ek karke le jaata hai, har ek ke baad thumbs-up ka intezaar karta hai, aur kabhi nahi poochta ki aap kaun ho. <b>FTP</b> ek courier company hai: tez, aapka naam aur password poochti hai, lekin unhe box ke bahar likh deti hai jahan koi bhi padh sakta hai. <b>SCP</b> ek armoured van hai: aapki ID check karti hai aur parcel lock kar deti hai taaki raaste mein koi use khol na sake. Teeno roz configurations backup karne aur IOS upgrade karne ke liye use hote hain.</p>

<h3>Routers ko file transfer kyun chahiye</h3>
<ul>
<li><b>Configuration backup</b>: har change se pehle aur baad <code>running-config</code> ko server par copy karo.</li>
<li><b>Restore</b>: failure ya RMA replacement ke baad known-good configuration wapas copy karo.</li>
<li><b>IOS upgrades</b>: naya image <code>flash:</code> mein copy karo, verify karo, boot variable us par point karo aur reload karo.</li>
<li><b>Licences, certificates, scripts</b> bhi files ki tarah travel karte hain.</li>
</ul>

<h3>Teeno protocols ki tulna</h3>
<table class="cmp"><tr><th></th><th>TFTP</th><th>FTP</th><th>SCP</th></tr>
<tr><td>Transport / port</td><td>UDP 69</td><td>TCP 21 control, TCP 20 data (active) ya negotiated port (passive)</td><td>TCP 22 (SSH par chalta hai)</td></tr>
<tr><td>Authentication</td><td>Koi nahi</td><td>Username aur password, <b>clear text</b></td><td>SSH username aur password ya keys</td></tr>
<tr><td>Encryption</td><td>Koi nahi</td><td>Koi nahi</td><td>Haan, sab kuch</td></tr>
<tr><td>Reliability</td><td>Apne simple acknowledgements, lock-step blocks</td><td>TCP</td><td>TCP</td></tr>
<tr><td>Directory listing</td><td>Nahi</td><td>Haan</td><td>Nahi (SFTP karta hai)</td></tr>
<tr><td>Typical use</td><td>Lab, PXE boot, IP phone configs</td><td>Trusted network ke andar bade images</td><td>Production, kuch bhi sensitive</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="TFTP FTP SCP flows">
<rect x="20" y="90" width="140" height="50" rx="8" fill="#bae6fd"/><text x="90" y="113" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="90" y="130" text-anchor="middle" class="svg-muted" font-size="12">flash:</text>
<rect x="480" y="90" width="140" height="50" rx="8" fill="#fed7aa"/><text x="550" y="113" text-anchor="middle" class="svg-ink" font-size="13">File server</text><text x="550" y="130" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.100</text>
<line x1="160" y1="40" x2="480" y2="40" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="320" y="32" text-anchor="middle" class="svg-muted" font-size="12">TFTP UDP 69: na login, na encryption</text>
<line x1="160" y1="115" x2="480" y2="115" stroke="#64748b" stroke-width="2"/><text x="320" y="107" text-anchor="middle" class="svg-muted" font-size="12">FTP TCP 21 + data: login clear text mein</text>
<line x1="160" y1="190" x2="480" y2="190" stroke="#64748b" stroke-width="5"/><text x="320" y="182" text-anchor="middle" class="svg-accent" font-size="12">SCP TCP 22: authenticated aur encrypted</text>
<line x1="90" y1="90" x2="160" y2="40" stroke="#64748b" stroke-width="1"/><line x1="90" y1="140" x2="160" y2="190" stroke="#64748b" stroke-width="1"/>
<line x1="550" y1="90" x2="480" y2="40" stroke="#64748b" stroke-width="1"/><line x1="550" y1="140" x2="480" y2="190" stroke="#64748b" stroke-width="1"/>
</svg><p class="cap">Same kaam, security ke teen levels. Sirf SCP wire par file aur login dono ko bachata hai.</p></div>

<h3>Ek minute mein IOS file system</h3>
<p>IOS storage ko prefix aur colon se naam deta hai: <code>flash:</code> (images aur files), <code>nvram:</code> (startup-config), <code>system:</code> (running-config), aur remote locations <code>tftp:</code>, <code>ftp:</code>, <code>scp:</code>. <code>copy</code> command hamesha <b>copy source destination</b> padha jaata hai.</p>
<pre class="out">R1# show flash:
-#- --length-- -----date/time------ path
1    106278008 Mar 12 2026 10:14:02 +00:00 <span class="hl">c2900-universalk9-mz.SPA.157-3.M8.bin</span>
2         3040 Sep 28 2026 16:40:11 +00:00 R1-before-ntp.cfg

148160512 bytes available (107745280 bytes used)</pre>
<p>Image ka naam platform (<code>c2900</code>), feature set (<code>universalk9</code>), format (<code>mz</code>, compressed), aur version (<code>157-3.M8</code> = 15.7(3)M8) batata hai.</p>

<h3>TFTP: backup aur restore</h3>
<pre class="code">R1# copy running-config tftp:
Address or name of remote host []? 10.1.1.100
Destination filename [r1-confg]? R1-2026-09-29.cfg
!!
3040 bytes copied in 0.188 secs (16170 bytes/sec)

<span class="c">! restore running config mein merge hota hai (replace nahi karta)</span>
R1# copy tftp: running-config
<span class="c">! stable source address use karo</span>
R1(config)# ip tftp source-interface Loopback0</pre>

<h3>FTP: bade images</h3>
<pre class="code">R1(config)# ip ftp username nkadmin
R1(config)# ip ftp password NkFtp#2026
R1(config)# end
R1# copy ftp://10.1.1.100/c2900-universalk9-mz.SPA.157-3.M9.bin flash:</pre>
<p>Credentials URL mein bhi likhe ja sakte hain (<code>ftp://user:password@host/file</code>), lekin tab woh aapki command history mein baithe rehte hain. Dono tarah woh network par clear text mein jaate hain.</p>

<h3>SCP: secure option</h3>
<pre class="code"><span class="c">! router SCP client ki tarah: server se file kheencho</span>
R1# copy scp://nkadmin@10.1.1.100/R1-2026-09-29.cfg flash:

<span class="c">! router SCP server ki tarah: SSH, AAA aur privileged user chahiye (hardening module ka preview)</span>
R1(config)# aaa new-model
R1(config)# aaa authentication login default local
R1(config)# aaa authorization exec default local
R1(config)# username nkadmin privilege 15 secret NkScp#2026
R1(config)# ip scp server enable</pre>
<p>Poora SSH, AAA aur SFTP setup module <i>Device access, SSH, AAA and SFTP/SCP</i> mein sikhaya jaata hai. Is module ke liye yaad rakho: SCP TCP 22 par SSH ke upar chalta hai aur credentials aur data dono encrypt karta hai.</p>

<h3>IOS upgrade workflow</h3>
<ol>
<li>Running configuration ka backup lo: <code>copy running-config scp:</code> (ya tftp:).</li>
<li><code>show flash:</code> se free space check karo.</li>
<li>Image copy karo: <code>copy scp://nkadmin@10.1.1.100/&lt;image&gt; flash:</code>.</li>
<li>Integrity verify karo: <code>verify /md5 flash:&lt;image&gt;</code> aur vendor ke published hash se compare karo.</li>
<li>Boot variable set karo: <code>boot system flash:&lt;image&gt;</code>, phir <code>copy running-config startup-config</code>.</li>
<li>Maintenance window mein reload karo aur <code>show version</code> se confirm karo.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Images ke liye TFTP itna slow kyun hai? Classic TFTP ek 512-byte block bhejta hai aur agla bhejne se pehle uske acknowledgement ka intezaar karta hai. 10 ms round trip ke saath yeh har 10 ms mein 512 bytes = lagbhag 51 kB/s hai. Tab 106 MB image mein 106,000,000 / 51,200 ≈ 2,070 s lagte hain, lagbhag <b>35 minute</b>. Sliding window wale TCP par FTP ya SCP 100 Mbit/s path bhar sakte hain aur lagbhag 106 × 8 / 100 ≈ <b>9 seconds</b> plus overhead mein khatam karte hain. (Kuch TFTP servers bade blocks negotiate karte hain, jo madad karta hai, lekin lock-step design wahi rehta hai.)</p></div>

<div class="warn"><p><b>Common galti.</b> <code>copy tftp: running-config</code> merge karta hai; replace nahi karta. Jo lines router par hain par file mein nahi, woh reh jaati hain. Configuration ko saaf replace karne ke liye <code>configure replace</code> use karo ya <code>startup-config</code> mein copy karke reload karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> TFTP = UDP 69, koi authentication nahi. FTP = TCP 20/21, authentication clear text mein. SCP = SSH ke through TCP 22, encrypted. Exam aapse inki tulna karwata hai aur scenario ke liye FTP ya TFTP chunwata hai; secure jawab hamesha SCP/SFTP hai.</p></div>

<div class="scn"><h4>Capture mein password</h4><p>Ek penetration test ke dauran tester ne management VLAN par packet capture chalaya aur 300 routers ke nightly backup script ka FTP username aur password dhoondh liya. Isse woh backup server par login karke har configuration padh sakta tha, SNMP communities aur pre-shared keys samet. Team ne script ko dedicated key-based account ke saath SCP par shift kiya aur server se FTP hata diya.</p><p><b>Seekh:</b> FTP aur TFTP isolated lab mein theek hain; production mein configuration files sensitive hain aur SCP ya SFTP par hi travel karni chahiye.</p></div>

<div class="iv"><p class="q">"TFTP, FTP aur SCP ki tulna karo. Router configs backup karne ke liye kaunsa use karoge?"</p><p>Strong answer: TFTP UDP 69 hai, na authentication na encryption, lock-step aur slow, labs aur PXE ke liye achha; FTP TCP 20/21 hai, authenticated lekin clear text mein, tez aur listings support karta hai; SCP TCP 22 par SSH ke upar chalta hai aur credentials aur data encrypt karta hai. Configs mein secrets hote hain, isliye SCP ya SFTP use karo. Boot variable badalne se pehle <code>verify /md5</code> se images verify karna mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>TFTP UDP 69: simple, na login na encryption, bade files ke liye slow.</li>
<li>FTP TCP 20/21: login clear text mein; <code>ip ftp username</code> / <code>ip ftp password</code>.</li>
<li>SSH par SCP TCP 22: authenticated aur encrypted; <code>ip scp server enable</code> ko SSH aur AAA chahiye.</li>
<li><code>copy source destination</code>; <code>copy tftp: running-config</code> merge karta hai.</li>
<li>Upgrade: backup, image copy, <code>verify /md5</code>, <code>boot system</code>, save, reload.</li>
</ul></div>
`}};export{e as default};