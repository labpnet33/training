var e={id:`files-recovery`,h:{en:`IOS files, backups and password recovery`,hi:`IOS files, backups aur password recovery`},body:{en:`
<p>Every good household keeps copies of important documents in a safe, and knows where the spare key is hidden in case someone is locked out. A network device is the same. Its IOS image and configuration are files that should be backed up, and there is a documented way back in if the password is lost. This chapter gives you the concepts; the labs run on a simulator without a file server, so read the outputs carefully.</p>

<h3>Files on the device: flash and NVRAM</h3>
<p>IOS treats storage as <b>file systems</b> with names ending in a colon: <code>flash:</code> (or <code>bootflash:</code>, <code>flash0:</code>), <code>nvram:</code>, and network ones such as <code>tftp:</code>, <code>ftp:</code> and <code>scp:</code>. <code>dir flash:</code> (or <code>show flash:</code>) lists what is stored:</p>
<pre class="out">R1# dir flash:
Directory of flash0:/

    1  -rw-   107430700  Jun 12 2026 09:14:22 +00:00  <span class="hl">c2900-universalk9-mz.SPA.157-3.M8.bin</span>
    2  -rw-        2903  Sep 28 2026 17:02:10 +00:00  pre-change-backup.cfg

256487424 bytes total (148893696 bytes free)</pre>
<p>The image name tells you the platform (c2900), the feature set (universalk9 = all features, licence-controlled), the format (mz = compressed, runs from RAM), and the version (157-3.M8 = 15.7(3)M8). On IOS XE switches you will see a <code>.bin</code> bundle or <code>packages.conf</code> in install mode.</p>

<h3>Backing up the configuration</h3>
<p>The simplest backup is a copy on the device itself: <code>copy running-config flash:pre-change-backup.cfg</code>. A real backup lives off the device, on a <b>TFTP</b>, FTP or SCP server:</p>
<pre class="code">R1# copy running-config tftp:
Address or name of remote host []? 192.168.10.50
Destination filename [r1-confg]?
!!
1482 bytes copied in 0.084 secs (17643 bytes/sec)</pre>
<p><b>TFTP</b> (UDP 69) has no authentication and no encryption, so it belongs only on a trusted management network; <b>SCP</b> (over SSH) is the secure choice. Restoring works in the other direction: <code>copy tftp: running-config</code>. Remember from chapter 5 that copying <i>into</i> the running-config <b>merges</b>: commands in the file are added or changed, but lines that are missing from the file are not removed. To restore a clean configuration, copy the file to the startup-config and reload.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Where configuration copies go">
<rect x="20" y="60" width="150" height="60" rx="8" fill="#bae6fd"/><text x="95" y="86" text-anchor="middle" class="svg-ink" font-size="13">running-config</text><text x="95" y="104" text-anchor="middle" class="svg-muted" font-size="12">RAM</text>
<rect x="245" y="10" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">startup-config (NVRAM)</text>
<rect x="245" y="75" width="150" height="50" rx="8" fill="#fde68a"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="13">flash: backup file</text>
<rect x="245" y="140" width="150" height="45" rx="8" fill="#ddd6fe"/><text x="320" y="167" text-anchor="middle" class="svg-ink" font-size="13">tftp: / scp: server</text>
<line x1="170" y1="80" x2="245" y2="35" stroke="#64748b" stroke-width="2"/><line x1="170" y1="90" x2="245" y2="100" stroke="#64748b" stroke-width="2"/><line x1="170" y1="100" x2="245" y2="162" stroke="#64748b" stroke-width="2"/>
<text x="520" y="70" text-anchor="middle" class="svg-ink" font-size="13">copy SOURCE DESTINATION</text>
<text x="520" y="95" text-anchor="middle" class="svg-muted" font-size="12">into running-config = merge</text>
<text x="520" y="115" text-anchor="middle" class="svg-muted" font-size="12">into startup-config = replace</text>
</svg><p class="cap">Keep at least one copy off the device. Know which direction merges and which replaces.</p></div>

<h3>Upgrading IOS, in outline</h3>
<ol>
<li>Check <code>show version</code> and <code>dir flash:</code> for the current image and free space.</li>
<li>Copy the new image: <code>copy tftp: flash:</code> (or scp), then verify it with <code>verify /md5 flash:filename</code>.</li>
<li>Point the boot at it: <code>boot system flash:new-image.bin</code>, save, and <code>reload</code> in a maintenance window.</li>
<li>Confirm the new version with <code>show version</code>. Keep the old image until you are sure.</li>
</ol>

<h3>The configuration register</h3>
<p>The 16-bit <b>configuration register</b>, read by the bootstrap, controls how a router boots. Three values matter for the CCNA:</p>
<table class="cmp"><tr><th>Value</th><th>Effect</th></tr>
<tr><td><b>0x2102</b></td><td>Normal: boot IOS from flash, load startup-config, console at 9600</td></tr>
<tr><td><b>0x2142</b></td><td>Boot IOS but <b>ignore the startup-config</b> in NVRAM (used for password recovery)</td></tr>
<tr><td><b>0x2100</b></td><td>Stop in ROMMON at boot</td></tr>
</table>
<p>You change it with <code>config-register 0x2102</code> in global configuration (takes effect at next reload) or <code>confreg</code> in ROMMON. <code>show version</code> shows it on the last line, and warns when a change is pending: <code>Configuration register is 0x2142 (will be 0x2102 at next reload)</code>.</p>

<h3>Password recovery on a router, conceptually</h3>
<p>If nobody knows the enable secret, you need <b>physical console access</b>; that requirement is the security control.</p>
<ol>
<li>Connect to the console and power-cycle the router. Send a <b>Break</b> during the first 60 seconds to enter ROMMON (<code>rommon 1 &gt;</code>).</li>
<li><code>confreg 0x2142</code>, then <code>reset</code>. The router boots and ignores NVRAM, so there is no password. Answer <b>no</b> to the setup dialog.</li>
<li><code>enable</code>, then <code>copy startup-config running-config</code>. Here the merge is exactly what you want: the old configuration loads into RAM, and you are already in privileged EXEC.</li>
<li><code>configure terminal</code>, <code>enable secret NewStrongPass</code>, and <code>no shutdown</code> on the interfaces that should be up (the merge leaves them shut).</li>
<li><code>config-register 0x2102</code>, <code>copy running-config startup-config</code>, and reload to check a normal boot.</li>
</ol>
<p>Catalyst switches use a different path (hold the MODE button while powering on, then rename the configuration file), but the idea is the same: console access plus skipping the saved configuration. <code>no service password-recovery</code> disables this path for high-security sites; recovery is then only possible by erasing the configuration.</p>

<div class="eg"><p><b>Worked example.</b> After a recovery a colleague forgets step 5. Weeks later a routine reload brings the router up with an empty configuration and the setup dialog; the branch is down. <code>show version</code> shows <code>Configuration register is 0x2142</code>. Setting 0x2102, and restoring the configuration from the TFTP backup into the startup-config, fixes it.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting to set the register back to 0x2102. Forgetting <code>no shutdown</code> after the merge. Using <code>copy tftp: running-config</code> as a clean restore (it merges). Keeping backups only on the device's own flash. Leaving TFTP open on an untrusted network.</p></div>

<div class="exam"><p><b>Exam traps.</b> 0x2102 normal boot; 0x2142 ignore startup-config. Password recovery needs console access and a Break in ROMMON. Copying into the running-config merges. The IOS image lives in flash; configuration backups can go to flash, TFTP, FTP or SCP. <code>show version</code> displays the configuration register.</p></div>

<div class="scn"><h4>The router that forgot its configuration every time</h4><p>A training lab router came up with no configuration after every reload, even though <code>copy run start</code> reported <code>[OK]</code>. The engineer checked <code>show startup-config</code>: the configuration was there. Then <code>show version</code>: <code>Configuration register is 0x2142</code>, left over from a password-recovery exercise. The router was ignoring its perfectly good startup-config. <code>config-register 0x2102</code> and one reload fixed it.</p><p><b>Lesson:</b> if a saved configuration never loads, check the configuration register before anything else.</p></div>

<div class="iv"><p class="q">"How would you recover a lost enable secret on a Cisco router?"</p><p>Strong answer: with console access, break into ROMMON during boot, set <code>confreg 0x2142</code> and reset so the router ignores the startup-config. Enter privileged mode, <code>copy startup-config running-config</code>, set a new enable secret, <code>no shutdown</code> the interfaces, set <code>config-register 0x2102</code>, save and reload. Mention that physical access is the security boundary and that <code>no service password-recovery</code> can disable the procedure.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>dir flash:</code> lists the IOS image and files; the image name encodes platform, features and version.</li>
<li>Back up configurations off the device (TFTP in a lab, SCP in production); <code>copy</code> is source then destination.</li>
<li>Copying into the running-config merges; copying into the startup-config and reloading replaces.</li>
<li>Configuration register: 0x2102 normal, 0x2142 skip NVRAM, 0x2100 ROMMON.</li>
<li>Password recovery: console, Break, 0x2142, copy start run, new secret, no shut, back to 0x2102, save.</li>
</ul></div>
`,hi:`
<p>Har achha ghar zaroori documents ki copies safe mein rakhta hai, aur jaanta hai ki spare key kahan chhupi hai agar koi bahar lock ho jaaye. Network device bhi aisa hi hai. Uski IOS image aur configuration files hain jinka backup hona chahiye, aur password kho jaaye to andar wapas aane ka ek documented tareeka hai. Yeh chapter aapko concepts deta hai; labs bina file server wale simulator par chalte hain, isliye outputs dhyan se padho.</p>

<h3>Device par files: flash aur NVRAM</h3>
<p>IOS storage ko <b>file systems</b> ki tarah treat karta hai jinke naam colon par khatam hote hain: <code>flash:</code> (ya <code>bootflash:</code>, <code>flash0:</code>), <code>nvram:</code>, aur network wale jaise <code>tftp:</code>, <code>ftp:</code> aur <code>scp:</code>. <code>dir flash:</code> (ya <code>show flash:</code>) dikhata hai kya stored hai:</p>
<pre class="out">R1# dir flash:
Directory of flash0:/

    1  -rw-   107430700  Jun 12 2026 09:14:22 +00:00  <span class="hl">c2900-universalk9-mz.SPA.157-3.M8.bin</span>
    2  -rw-        2903  Sep 28 2026 17:02:10 +00:00  pre-change-backup.cfg

256487424 bytes total (148893696 bytes free)</pre>
<p>Image ka naam platform (c2900), feature set (universalk9 = saare features, licence se controlled), format (mz = compressed, RAM se chalta hai), aur version (157-3.M8 = 15.7(3)M8) batata hai. IOS XE switches par aapko <code>.bin</code> bundle ya install mode mein <code>packages.conf</code> dikhega.</p>

<h3>Configuration ka backup</h3>
<p>Sabse simple backup device par hi ek copy hai: <code>copy running-config flash:pre-change-backup.cfg</code>. Asli backup device se bahar rehta hai, <b>TFTP</b>, FTP ya SCP server par:</p>
<pre class="code">R1# copy running-config tftp:
Address or name of remote host []? 192.168.10.50
Destination filename [r1-confg]?
!!
1482 bytes copied in 0.084 secs (17643 bytes/sec)</pre>
<p><b>TFTP</b> (UDP 69) mein na authentication hai na encryption, isliye yeh sirf trusted management network par hona chahiye; <b>SCP</b> (SSH ke upar) secure choice hai. Restore ulti direction mein hota hai: <code>copy tftp: running-config</code>. Chapter 5 se yaad rakho ki running-config <i>mein</i> copy karna <b>merge</b> karta hai: file ki commands add ya change hoti hain, lekin jo lines file mein nahi hain woh hatayi nahi jaati. Clean configuration restore karne ke liye file ko startup-config mein copy karo aur reload karo.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Configuration copies kahan jaati hain">
<rect x="20" y="60" width="150" height="60" rx="8" fill="#bae6fd"/><text x="95" y="86" text-anchor="middle" class="svg-ink" font-size="13">running-config</text><text x="95" y="104" text-anchor="middle" class="svg-muted" font-size="12">RAM</text>
<rect x="245" y="10" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">startup-config (NVRAM)</text>
<rect x="245" y="75" width="150" height="50" rx="8" fill="#fde68a"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="13">flash: backup file</text>
<rect x="245" y="140" width="150" height="45" rx="8" fill="#ddd6fe"/><text x="320" y="167" text-anchor="middle" class="svg-ink" font-size="13">tftp: / scp: server</text>
<line x1="170" y1="80" x2="245" y2="35" stroke="#64748b" stroke-width="2"/><line x1="170" y1="90" x2="245" y2="100" stroke="#64748b" stroke-width="2"/><line x1="170" y1="100" x2="245" y2="162" stroke="#64748b" stroke-width="2"/>
<text x="520" y="70" text-anchor="middle" class="svg-ink" font-size="13">copy SOURCE DESTINATION</text>
<text x="520" y="95" text-anchor="middle" class="svg-muted" font-size="12">running-config mein = merge</text>
<text x="520" y="115" text-anchor="middle" class="svg-muted" font-size="12">startup-config mein = replace</text>
</svg><p class="cap">Kam se kam ek copy device se bahar rakho. Yaad rakho kaunsi direction merge karti hai aur kaunsi replace.</p></div>

<h3>IOS upgrade, outline mein</h3>
<ol>
<li>Current image aur free space ke liye <code>show version</code> aur <code>dir flash:</code> check karo.</li>
<li>Nayi image copy karo: <code>copy tftp: flash:</code> (ya scp), phir <code>verify /md5 flash:filename</code> se verify karo.</li>
<li>Boot ko uski taraf point karo: <code>boot system flash:new-image.bin</code>, save karo, aur maintenance window mein <code>reload</code> karo.</li>
<li><code>show version</code> se naya version confirm karo. Jab tak pakka na ho, purani image rakho.</li>
</ol>

<h3>Configuration register</h3>
<p>16-bit <b>configuration register</b>, jise bootstrap padhta hai, control karta hai ki router kaise boot hoga. CCNA ke liye teen values matter karti hain:</p>
<table class="cmp"><tr><th>Value</th><th>Effect</th></tr>
<tr><td><b>0x2102</b></td><td>Normal: flash se IOS boot karo, startup-config load karo, console 9600 par</td></tr>
<tr><td><b>0x2142</b></td><td>IOS boot karo lekin NVRAM ki <b>startup-config ignore karo</b> (password recovery ke liye)</td></tr>
<tr><td><b>0x2100</b></td><td>Boot par ROMMON mein ruko</td></tr>
</table>
<p>Aap ise global configuration mein <code>config-register 0x2102</code> se (agle reload par lagu hota hai) ya ROMMON mein <code>confreg</code> se badalte ho. <code>show version</code> ise aakhri line par dikhata hai, aur change pending ho to warning deta hai: <code>Configuration register is 0x2142 (will be 0x2102 at next reload)</code>.</p>

<h3>Router par password recovery, conceptually</h3>
<p>Agar kisi ko enable secret nahi pata, to aapko <b>physical console access</b> chahiye; yahi requirement security control hai.</p>
<ol>
<li>Console se connect karo aur router power-cycle karo. Pehle 60 second mein <b>Break</b> bhejo taaki ROMMON mein aa jao (<code>rommon 1 &gt;</code>).</li>
<li><code>confreg 0x2142</code>, phir <code>reset</code>. Router boot hota hai aur NVRAM ignore karta hai, isliye koi password nahi. Setup dialog ko <b>no</b> bolo.</li>
<li><code>enable</code>, phir <code>copy startup-config running-config</code>. Yahan merge bilkul wahi hai jo aapko chahiye: purani configuration RAM mein load hoti hai, aur aap pehle se privileged EXEC mein ho.</li>
<li><code>configure terminal</code>, <code>enable secret NewStrongPass</code>, aur jo interfaces up hone chahiye un par <code>no shutdown</code> (merge unhe shut chhod deta hai).</li>
<li><code>config-register 0x2102</code>, <code>copy running-config startup-config</code>, aur normal boot check karne ke liye reload.</li>
</ol>
<p>Catalyst switches alag raasta use karte hain (power on karte waqt MODE button dabaye rakho, phir configuration file ka naam badlo), lekin idea wahi hai: console access plus saved configuration skip karna. <code>no service password-recovery</code> high-security sites ke liye yeh raasta band kar deta hai; tab recovery sirf configuration erase karke hi possible hai.</p>

<div class="eg"><p><b>Worked example.</b> Recovery ke baad ek colleague step 5 bhool jaata hai. Hafton baad ek routine reload router ko khaali configuration aur setup dialog ke saath up karta hai; branch down ho jaati hai. <code>show version</code> dikhata hai <code>Configuration register is 0x2142</code>. 0x2102 set karna, aur TFTP backup se configuration startup-config mein restore karna, ise theek kar deta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Register ko wapas 0x2102 par set karna bhool jaana. Merge ke baad <code>no shutdown</code> bhool jaana. <code>copy tftp: running-config</code> ko clean restore samajhna (yeh merge karta hai). Backups sirf device ki apni flash par rakhna. Untrusted network par TFTP khula chhodna.</p></div>

<div class="exam"><p><b>Exam traps.</b> 0x2102 normal boot; 0x2142 startup-config ignore. Password recovery ke liye console access aur ROMMON mein Break chahiye. Running-config mein copy karna merge karta hai. IOS image flash mein rehti hai; configuration backups flash, TFTP, FTP ya SCP par jaa sakte hain. <code>show version</code> configuration register dikhata hai.</p></div>

<div class="scn"><h4>Woh router jo har baar apni configuration bhool jaata tha</h4><p>Ek training lab router har reload ke baad bina configuration ke up hota tha, jabki <code>copy run start</code> <code>[OK]</code> report karta tha. Engineer ne <code>show startup-config</code> check kiya: configuration wahan thi. Phir <code>show version</code>: <code>Configuration register is 0x2142</code>, jo ek password-recovery exercise se reh gaya tha. Router apni bilkul theek startup-config ko ignore kar raha tha. <code>config-register 0x2102</code> aur ek reload ne ise theek kar diya.</p><p><b>Seekh:</b> agar saved configuration kabhi load nahi hoti, to sabse pehle configuration register check karo.</p></div>

<div class="iv"><p class="q">"Cisco router par khoya hua enable secret kaise recover karoge?"</p><p>Strong answer: console access ke saath, boot ke dauraan ROMMON mein break karo, <code>confreg 0x2142</code> set karke reset karo taaki router startup-config ignore kare. Privileged mode mein jao, <code>copy startup-config running-config</code>, naya enable secret set karo, interfaces par <code>no shutdown</code>, <code>config-register 0x2102</code> set karo, save karke reload karo. Yeh bolo ki physical access hi security boundary hai aur <code>no service password-recovery</code> is procedure ko disable kar sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>dir flash:</code> IOS image aur files list karta hai; image ka naam platform, features aur version batata hai.</li>
<li>Configurations ka backup device se bahar lo (lab mein TFTP, production mein SCP); <code>copy</code> source phir destination.</li>
<li>Running-config mein copy karna merge karta hai; startup-config mein copy karke reload karna replace karta hai.</li>
<li>Configuration register: 0x2102 normal, 0x2142 NVRAM skip, 0x2100 ROMMON.</li>
<li>Password recovery: console, Break, 0x2142, copy start run, naya secret, no shut, wapas 0x2102, save.</li>
</ul></div>
`}};export{e as default};