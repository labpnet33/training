var e={id:`scp-sftp`,h:{en:`Secure file transfer (SCP, SFTP) and IOS image verification`,hi:`Secure file transfer (SCP, SFTP) aur IOS image verification`},body:{en:`
<p>Imagine sending the company's jewellery to another branch. You could hand it to any passing courier in an open box (TFTP), or give it to a bonded courier who checks your ID, locks it in an armoured van and brings back a signature (SCP/SFTP). At the other end the receiver also checks that the numbered seal on the box matches the number you phoned ahead (a <b>hash</b>). Device images and configurations deserve the same care: they control the whole network.</p>

<h3>The file transfer protocols you must know</h3>
<p>In ccna-ios you copied a configuration to a TFTP server and learned that <code>flash:</code>, <code>tftp:</code> and <code>scp:</code> are IOS file systems. Here is the full comparison the exam expects:</p>
<table class="cmp"><tr><th>Protocol</th><th>Transport</th><th>Authentication</th><th>Encryption</th><th>Typical use</th></tr>
<tr><td>TFTP</td><td>UDP 69</td><td>None</td><td>None</td><td>Simple, small: IP phone configs, PXE boot, lab backups on a trusted network</td></tr>
<tr><td>FTP</td><td>TCP 21 (control), 20 or dynamic (data)</td><td>Username and password, in clear text</td><td>None</td><td>Larger files, reliable over TCP, legacy servers</td></tr>
<tr><td>SCP</td><td>TCP 22 (inside SSH)</td><td>SSH login</td><td>Yes</td><td>Secure copy of images and configs</td></tr>
<tr><td>SFTP</td><td>TCP 22 (inside SSH)</td><td>SSH login</td><td>Yes</td><td>Secure file transfer with directory listing, resume</td></tr>
</table>
<p>TFTP is tiny and has no login, which is why phones and PXE boot use it, and also why it belongs only on a trusted, isolated management network. FTP adds a login and reliability (TCP), but sends the password in clear text. <b>SCP</b> and <b>SFTP</b> both run inside an SSH session, so they inherit its authentication and encryption.</p>

<h3>The router as SCP/SFTP client</h3>
<p>The simplest case: the router pulls a file from a server (or pushes one to it). You only need a working IP path and an account on the server.</p>
<pre class="out">EDGE# copy scp: flash:
Address or name of remote host []? 10.99.99.30
Source username [netadmin]?
Source filename []? images/c2900-universalk9-mz.SPA.157-3.M9.bin
Destination filename [c2900-universalk9-mz.SPA.157-3.M9.bin]?
Password:
 Sending file modes: C0644 110549300 c2900-universalk9-mz.SPA.157-3.M9.bin
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
<span class="hl">110549300 bytes copied in 412.332 secs (268108 bytes/sec)</span></pre>
<p>SFTP works the same way: <code>copy sftp: flash:</code> to pull, <code>copy running-config sftp:</code> to push a backup. Before copying an image, check free space with <code>dir flash:</code>.</p>

<h3>The router as SCP server</h3>
<p>Sometimes you want to push a file from your laptop to the router. IOS can act as an SCP server, but only when SSH works and AAA is enabled, because the SCP server uses AAA to authenticate and authorise the user:</p>
<pre class="code">EDGE(config)# aaa new-model
EDGE(config)# aaa authentication login default group NK-TACS local
EDGE(config)# aaa authorization exec default group NK-TACS local   <span class="c">! required for SCP</span>
EDGE(config)# ip scp server enable</pre>
<p>The user must reach privilege 15. From the admin workstation the command looks like this (a Linux or Windows OpenSSH client):</p>
<pre class="code">admin@noc:~$ scp c2900-universalk9-mz.SPA.157-3.M9.bin netadmin@10.0.12.2:flash:c2900-universalk9-mz.SPA.157-3.M9.bin</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Secure image upgrade flow">
<rect x="10" y="70" width="120" height="56" rx="8" fill="#bbf7d0"/><text x="70" y="94" text-anchor="middle" class="svg-ink" font-size="13">Vendor site</text><text x="70" y="112" text-anchor="middle" class="svg-muted" font-size="12">image + hash</text>
<rect x="170" y="70" width="120" height="56" rx="8" fill="#ddd6fe"/><text x="230" y="94" text-anchor="middle" class="svg-ink" font-size="13">NOC server</text><text x="230" y="112" text-anchor="middle" class="svg-muted" font-size="12">10.99.99.30</text>
<rect x="330" y="70" width="120" height="56" rx="8" fill="#fde68a"/><text x="390" y="94" text-anchor="middle" class="svg-ink" font-size="13">EDGE flash:</text><text x="390" y="112" text-anchor="middle" class="svg-muted" font-size="12">copy scp:</text>
<rect x="490" y="70" width="140" height="56" rx="8" fill="#bae6fd"/><text x="560" y="94" text-anchor="middle" class="svg-ink" font-size="13">verify /md5</text><text x="560" y="112" text-anchor="middle" class="svg-muted" font-size="12">then boot system</text>
<line x1="130" y1="98" x2="170" y2="98" stroke="#64748b" stroke-width="2"/><line x1="290" y1="98" x2="330" y2="98" stroke="#64748b" stroke-width="2"/><line x1="450" y1="98" x2="490" y2="98" stroke="#64748b" stroke-width="2"/>
<text x="310" y="160" text-anchor="middle" class="svg-accent" font-size="13">Encrypted copy + matching hash = the file is genuine and complete</text>
</svg><p class="cap">Encryption protects the file in transit; the hash proves nothing changed from the vendor's original.</p></div>

<h3>Verifying the image: MD5 and SHA</h3>
<p>A <b>hash</b> such as MD5 or SHA-512 is a fingerprint of a file: change a single bit and the fingerprint changes completely. The vendor publishes the hash of every image on its download page. After copying, you compute the hash on the device and compare.</p>
<pre class="out">EDGE# verify /md5 flash:c2900-universalk9-mz.SPA.157-3.M9.bin
......................................................Done!
<span class="hl">verify /md5 (flash:c2900-universalk9-mz.SPA.157-3.M9.bin) = 2f4b9c0e6d1a7b83c5e90f12a4d6b7c8</span></pre>
<p>You can also give IOS the expected value and let it compare: <code>verify /md5 flash:filename 2f4b9c0e6d1a7b83c5e90f12a4d6b7c8</code> prints <code>Verified</code> on a match, or an error with the computed and submitted values on a mismatch. Current IOS XE releases also support <code>verify /sha512</code>, which is stronger than MD5. Signed Cisco images additionally carry a digital signature that IOS checks at boot and with <code>verify flash:filename</code>.</p>
<p>Only when the hash matches do you point the router at the new image and reload in a maintenance window:</p>
<pre class="code">EDGE(config)# boot system flash:c2900-universalk9-mz.SPA.157-3.M9.bin
EDGE(config)# end
EDGE# copy running-config startup-config
EDGE# reload</pre>

<div class="eg"><p><b>Worked example.</b> A 110 MB image copied over a flaky WAN link finishes without an error message. <code>verify /md5</code> prints <code>9a1c...</code> but the vendor's page says <code>2f4b9c0e...</code>. The file is corrupted (or tampered). Instead of rebooting into a broken image and needing ROMMON recovery at a remote site, the engineer deletes it, copies again over SCP, gets a matching hash and schedules the reload.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using TFTP across an untrusted network. Enabling <code>ip scp server enable</code> without <code>aaa authorization exec</code>, then getting "Permission denied" from the client. Reloading after a copy without checking the hash. Forgetting <code>boot system</code>, so the router keeps booting the old image. Not checking flash space before a large copy.</p></div>

<div class="exam"><p><b>Exam traps.</b> TFTP: UDP 69, no authentication, no encryption. FTP: TCP 20/21, login in clear text. SCP and SFTP: TCP 22 over SSH, encrypted. The IOS SCP server needs SSH plus AAA (<code>aaa new-model</code> and exec authorization). <code>verify /md5</code> checks integrity against the published value.</p></div>

<div class="scn"><h4>The image from a forum link</h4><p>A junior engineer needed a newer IOS for a branch router and downloaded an image shared on a public forum because it was faster than finding the right one on the vendor portal. The senior engineer asked for the hash before approving the change. <code>verify /md5</code> did not match any hash published by the vendor for that file name. The image was deleted, the correct one was downloaded from the vendor with a valid support contract, copied over SCP, verified, and installed.</p><p><b>Lesson:</b> an image is code that runs your network. Get it from the vendor, move it securely, and prove it with a hash.</p></div>

<div class="iv"><p class="q">"How do you securely upgrade the IOS image on a remote router?"</p><p>Strong answer: download the image and its published hash from the vendor; check flash space; copy it with SCP or SFTP (the router as client, or as SCP server with SSH, AAA exec authorization and <code>ip scp server enable</code>); run <code>verify /md5</code> or <code>/sha512</code> and compare; set <code>boot system</code>, save, and reload in a maintenance window with console or OOB access available, keeping the old image as a fallback. Mention why not TFTP: no authentication or encryption.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>TFTP (UDP 69) and FTP (TCP 20/21) are not encrypted; SCP and SFTP run inside SSH on TCP 22.</li>
<li>Router as client: <code>copy scp: flash:</code>, <code>copy running-config sftp:</code>.</li>
<li>Router as SCP server: SSH working, <code>aaa new-model</code>, exec authorization, <code>ip scp server enable</code>, privilege 15 user.</li>
<li>Always <code>verify /md5</code> (or /sha512) against the vendor's published hash before booting a new image.</li>
<li>Then <code>boot system</code>, save and reload in a window with console or OOB access.</li>
</ul></div>
`,hi:`
<p>Socho aap company ki jewellery doosri branch bhej rahe ho. Aap use khule dabbe mein kisi bhi guzarte courier ko de sakte ho (TFTP), ya ek bonded courier ko jo aapki ID check kare, use armoured van mein lock kare aur signature wapas laaye (SCP/SFTP). Doosri taraf receiver yeh bhi check karta hai ki dabbe par laga numbered seal us number se match karta hai jo aapne pehle phone par bataya (<b>hash</b>). Device images aur configurations ko bhi yahi care chahiye: woh poora network control karti hain.</p>

<h3>File transfer protocols jo aapko aane chahiye</h3>
<p>ccna-ios mein aapne configuration TFTP server par copy ki thi aur seekha tha ki <code>flash:</code>, <code>tftp:</code> aur <code>scp:</code> IOS file systems hain. Yeh raha poora comparison jo exam expect karta hai:</p>
<table class="cmp"><tr><th>Protocol</th><th>Transport</th><th>Authentication</th><th>Encryption</th><th>Typical use</th></tr>
<tr><td>TFTP</td><td>UDP 69</td><td>Kuch nahi</td><td>Kuch nahi</td><td>Simple, chhota: IP phone configs, PXE boot, trusted network par lab backups</td></tr>
<tr><td>FTP</td><td>TCP 21 (control), 20 ya dynamic (data)</td><td>Username aur password, clear text mein</td><td>Kuch nahi</td><td>Badi files, TCP par reliable, legacy servers</td></tr>
<tr><td>SCP</td><td>TCP 22 (SSH ke andar)</td><td>SSH login</td><td>Haan</td><td>Images aur configs ki secure copy</td></tr>
<tr><td>SFTP</td><td>TCP 22 (SSH ke andar)</td><td>SSH login</td><td>Haan</td><td>Directory listing, resume ke saath secure file transfer</td></tr>
</table>
<p>TFTP chhota hai aur isme login nahi hota, isiliye phones aur PXE boot ise use karte hain, aur isiliye yeh sirf trusted, isolated management network par hona chahiye. FTP login aur reliability (TCP) jodta hai, lekin password clear text mein bhejta hai. <b>SCP</b> aur <b>SFTP</b> dono SSH session ke andar chalte hain, isliye uska authentication aur encryption inherit karte hain.</p>

<h3>Router SCP/SFTP client ke roop mein</h3>
<p>Sabse simple case: router server se file kheenchta hai (ya use push karta hai). Aapko bas ek chalta IP path aur server par ek account chahiye.</p>
<pre class="out">EDGE# copy scp: flash:
Address or name of remote host []? 10.99.99.30
Source username [netadmin]?
Source filename []? images/c2900-universalk9-mz.SPA.157-3.M9.bin
Destination filename [c2900-universalk9-mz.SPA.157-3.M9.bin]?
Password:
 Sending file modes: C0644 110549300 c2900-universalk9-mz.SPA.157-3.M9.bin
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
<span class="hl">110549300 bytes copied in 412.332 secs (268108 bytes/sec)</span></pre>
<p>SFTP bhi aise hi chalta hai: kheenchne ke liye <code>copy sftp: flash:</code>, backup push karne ke liye <code>copy running-config sftp:</code>. Image copy karne se pehle <code>dir flash:</code> se free space check karo.</p>

<h3>Router SCP server ke roop mein</h3>
<p>Kabhi kabhi aap apne laptop se router par file push karna chahte ho. IOS SCP server ban sakta hai, lekin sirf tab jab SSH chal raha ho aur AAA enabled ho, kyunki SCP server user ko authenticate aur authorise karne ke liye AAA use karta hai:</p>
<pre class="code">EDGE(config)# aaa new-model
EDGE(config)# aaa authentication login default group NK-TACS local
EDGE(config)# aaa authorization exec default group NK-TACS local   <span class="c">! SCP ke liye zaroori</span>
EDGE(config)# ip scp server enable</pre>
<p>User ko privilege 15 tak pahunchna chahiye. Admin workstation se command aisi dikhti hai (Linux ya Windows OpenSSH client):</p>
<pre class="code">admin@noc:~$ scp c2900-universalk9-mz.SPA.157-3.M9.bin netadmin@10.0.12.2:flash:c2900-universalk9-mz.SPA.157-3.M9.bin</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Secure image upgrade flow">
<rect x="10" y="70" width="120" height="56" rx="8" fill="#bbf7d0"/><text x="70" y="94" text-anchor="middle" class="svg-ink" font-size="13">Vendor site</text><text x="70" y="112" text-anchor="middle" class="svg-muted" font-size="12">image + hash</text>
<rect x="170" y="70" width="120" height="56" rx="8" fill="#ddd6fe"/><text x="230" y="94" text-anchor="middle" class="svg-ink" font-size="13">NOC server</text><text x="230" y="112" text-anchor="middle" class="svg-muted" font-size="12">10.99.99.30</text>
<rect x="330" y="70" width="120" height="56" rx="8" fill="#fde68a"/><text x="390" y="94" text-anchor="middle" class="svg-ink" font-size="13">EDGE flash:</text><text x="390" y="112" text-anchor="middle" class="svg-muted" font-size="12">copy scp:</text>
<rect x="490" y="70" width="140" height="56" rx="8" fill="#bae6fd"/><text x="560" y="94" text-anchor="middle" class="svg-ink" font-size="13">verify /md5</text><text x="560" y="112" text-anchor="middle" class="svg-muted" font-size="12">phir boot system</text>
<line x1="130" y1="98" x2="170" y2="98" stroke="#64748b" stroke-width="2"/><line x1="290" y1="98" x2="330" y2="98" stroke="#64748b" stroke-width="2"/><line x1="450" y1="98" x2="490" y2="98" stroke="#64748b" stroke-width="2"/>
<text x="310" y="160" text-anchor="middle" class="svg-accent" font-size="13">Encrypted copy + matching hash = file asli aur poori hai</text>
</svg><p class="cap">Encryption raaste mein file ko bachata hai; hash prove karta hai ki vendor ke original se kuch nahi badla.</p></div>

<h3>Image verify karna: MD5 aur SHA</h3>
<p>MD5 ya SHA-512 jaisa <b>hash</b> file ka fingerprint hai: ek bit bhi badlo to fingerprint poori tarah badal jaata hai. Vendor apne download page par har image ka hash publish karta hai. Copy ke baad aap device par hash compute karke compare karte ho.</p>
<pre class="out">EDGE# verify /md5 flash:c2900-universalk9-mz.SPA.157-3.M9.bin
......................................................Done!
<span class="hl">verify /md5 (flash:c2900-universalk9-mz.SPA.157-3.M9.bin) = 2f4b9c0e6d1a7b83c5e90f12a4d6b7c8</span></pre>
<p>Aap IOS ko expected value dekar use compare karne bhi de sakte ho: <code>verify /md5 flash:filename 2f4b9c0e6d1a7b83c5e90f12a4d6b7c8</code> match par <code>Verified</code> print karta hai, ya mismatch par computed aur submitted values ke saath error. Current IOS XE releases <code>verify /sha512</code> bhi support karte hain, jo MD5 se strong hai. Signed Cisco images mein ek digital signature bhi hota hai jise IOS boot par aur <code>verify flash:filename</code> se check karta hai.</p>
<p>Sirf jab hash match kare tabhi router ko nayi image par point karo aur maintenance window mein reload karo:</p>
<pre class="code">EDGE(config)# boot system flash:c2900-universalk9-mz.SPA.157-3.M9.bin
EDGE(config)# end
EDGE# copy running-config startup-config
EDGE# reload</pre>

<div class="eg"><p><b>Worked example.</b> Ek flaky WAN link par copy ki gayi 110 MB image bina error message ke poori ho jaati hai. <code>verify /md5</code> <code>9a1c...</code> print karta hai lekin vendor ka page <code>2f4b9c0e...</code> kehta hai. File corrupt (ya tampered) hai. Toot'ti image mein reboot karke remote site par ROMMON recovery ki zaroorat padne ki jagah, engineer use delete karta hai, SCP par dobara copy karta hai, matching hash paata hai aur reload schedule karta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Untrusted network par TFTP use karna. <code>aaa authorization exec</code> ke bina <code>ip scp server enable</code> enable karna, phir client se "Permission denied" milna. Copy ke baad hash check kiye bina reload karna. <code>boot system</code> bhool jaana, jisse router purani image boot karta rehta hai. Badi copy se pehle flash space check na karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> TFTP: UDP 69, koi authentication nahi, koi encryption nahi. FTP: TCP 20/21, login clear text mein. SCP aur SFTP: SSH par TCP 22, encrypted. IOS SCP server ko SSH plus AAA (<code>aaa new-model</code> aur exec authorization) chahiye. <code>verify /md5</code> published value ke against integrity check karta hai.</p></div>

<div class="scn"><h4>Forum link wali image</h4><p>Ek junior engineer ko branch router ke liye naya IOS chahiye tha aur usne public forum par share ki gayi image download kar li kyunki woh vendor portal par sahi image dhoondhne se jaldi thi. Senior engineer ne change approve karne se pehle hash maanga. <code>verify /md5</code> us file naam ke liye vendor ke publish kiye kisi bhi hash se match nahi hua. Image delete ki gayi, sahi image valid support contract ke saath vendor se download hui, SCP par copy hui, verify hui aur install hui.</p><p><b>Seekh:</b> image woh code hai jo aapka network chalata hai. Use vendor se lo, securely move karo, aur hash se prove karo.</p></div>

<div class="iv"><p class="q">"Remote router par IOS image securely upgrade kaise karte ho?"</p><p>Strong answer: vendor se image aur uska published hash download karo; flash space check karo; use SCP ya SFTP se copy karo (router client ke roop mein, ya SSH, AAA exec authorization aur <code>ip scp server enable</code> ke saath SCP server ke roop mein); <code>verify /md5</code> ya <code>/sha512</code> chalao aur compare karo; <code>boot system</code> set karo, save karo, aur console ya OOB access ke saath maintenance window mein reload karo, purani image fallback ke roop mein rakhte hue. Batao TFTP kyun nahi: na authentication na encryption.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>TFTP (UDP 69) aur FTP (TCP 20/21) encrypted nahi hain; SCP aur SFTP TCP 22 par SSH ke andar chalte hain.</li>
<li>Router client ke roop mein: <code>copy scp: flash:</code>, <code>copy running-config sftp:</code>.</li>
<li>Router SCP server ke roop mein: chalta SSH, <code>aaa new-model</code>, exec authorization, <code>ip scp server enable</code>, privilege 15 user.</li>
<li>Nayi image boot karne se pehle hamesha vendor ke published hash ke against <code>verify /md5</code> (ya /sha512) karo.</li>
<li>Phir <code>boot system</code>, save aur console ya OOB access wali window mein reload.</li>
</ul></div>
`}};export{e as default};