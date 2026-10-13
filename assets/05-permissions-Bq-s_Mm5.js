var e=e=>`<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Permission string">
<text x="320" y="24" text-anchor="middle" class="svg-ink" font-size="16">-rw-------  root  root  BLR-EDGE-R2.cfg</text>
<rect x="20" y="40" width="60" height="38" rx="6" fill="#e2e8f0"/><text x="50" y="64" text-anchor="middle" class="svg-ink" font-size="12">-</text><text x="50" y="96" text-anchor="middle" class="svg-muted" font-size="11">file</text>
<rect x="100" y="40" width="120" height="38" rx="6" fill="#bbf7d0"/><text x="160" y="64" text-anchor="middle" class="svg-ink" font-size="12">rw-</text><text x="160" y="96" text-anchor="middle" class="svg-muted" font-size="11">owner</text>
<rect x="240" y="40" width="120" height="38" rx="6" fill="#fed7aa"/><text x="300" y="64" text-anchor="middle" class="svg-ink" font-size="12">---</text><text x="300" y="96" text-anchor="middle" class="svg-muted" font-size="11">group</text>
<rect x="380" y="40" width="120" height="38" rx="6" fill="#fecaca"/><text x="440" y="64" text-anchor="middle" class="svg-ink" font-size="12">---</text><text x="440" y="96" text-anchor="middle" class="svg-muted" font-size="11">others (tftp is here)</text>
<text x="320" y="134" text-anchor="middle" class="svg-accent" font-size="12">r = read (4)   w = write (2)   x = execute (1)</text>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code">BLR-EDGE-R2# copy tftp://10.99.0.40/BLR-EDGE-R2.cfg running-config
netadmin@tftp01:~$ sudo journalctl -u tftpd-hpa -n 2
netadmin@tftp01:~$ ls -l /srv/tftp
netadmin@tftp01:~$ grep USERNAME /etc/default/tftpd-hpa</pre>
<pre class="out"><span class="hl">%Error opening tftp://10.99.0.40/BLR-EDGE-R2.cfg (Permission denied)</span>
Sep 29 09:00:30 tftp01 in.tftpd[701]: RRQ from ::ffff:10.99.0.2 filename BLR-EDGE-R2.cfg
Sep 29 09:00:30 tftp01 in.tftpd[702]: sending NAK (0, <span class="hl">Permission denied</span>) to ::ffff:10.99.0.2
total 8
<span class="hl">-rw-------  1 root     root        509 Sep 29 09:00 BLR-EDGE-R2.cfg</span>
-rw-rw-r--  1 root     root        107 Sep 29 09:00 PUN-CORE-R1.cfg
TFTP_USERNAME="tftp"</pre>`,n=`<pre class="code">netadmin@tftp01:~$ sudo chmod 644 /srv/tftp/BLR-EDGE-R2.cfg
netadmin@tftp01:~$ ls -l /srv/tftp</pre>
<pre class="out">total 8
-rw-r--r--  1 root     root        509 Sep 29 09:00 <span class="hl">BLR-EDGE-R2.cfg</span>
-rw-rw-r--  1 root     root        107 Sep 29 09:00 PUN-CORE-R1.cfg</pre>`,r=`<pre class="code"><span class="c"># Reference commands: the cleaner long-term fix (change the owner instead)</span>
sudo chown tftp:tftp /srv/tftp/BLR-EDGE-R2.cfg
<span class="c"># never do this on a TFTP folder:</span>
<span class="c"># sudo chmod 777 /srv/tftp/BLR-EDGE-R2.cfg</span></pre>`,i={id:`permissions`,h:{en:`Permissions: why a file exists but the router gets Permission denied`,hi:`Permissions: file maujood hai par router ko Permission denied kyun milta hai`},body:{en:`
<p>Ticket NK-2466 (priority 1): "BLR-EDGE-R2 was erased and reloaded. The branch WAN is down." Last night's backup is on the server. You give the router a management address and try to restore. It fails with <b>Permission denied</b>, although the file is right there. This is the most common TFTP surprise, and understanding it teaches you the Linux permission model that you will use every day.</p>

<h3>Linux permissions in two minutes</h3>
<p>Every file has an <b>owner</b> (a user), a <b>group</b>, and three sets of permission bits. Read the ten characters at the start of <code>ls -l</code>:</p>
`+e(`The first character is the type; then three triples: owner, group, others.`)+`
<ul>
<li>The first character: <code>-</code> is a normal file, <code>d</code> is a directory.</li>
<li>Then three triples of <code>r</code> (read), <code>w</code> (write), <code>x</code> (execute), for the <b>owner</b>, the <b>group</b> and <b>others</b> (everyone else). A dash means "not allowed".</li>
<li>Permissions are often written as numbers: r = 4, w = 2, x = 1, added per triple. So <code>rw-</code> = 6, <code>r--</code> = 4, <code>---</code> = 0. The mode <code>-rw-r--r--</code> is <b>644</b>; <code>-rw-------</code> is <b>600</b>.</li>
</ul>
<p>Linux checks the triples in order: if you are the owner, the owner triple decides; otherwise if you are in the group, the group triple; otherwise the "others" triple. A process has only <b>one identity</b>. The TFTP daemon is the user <code>tftp</code>, so for every file it is either the owner, a group member, or "others".</p>

<h3>The failure, read from both sides</h3>
`+t+`
<p>Walk through the evidence:</p>
<ol>
<li>The router reports <code>Permission denied</code>, which differs from <code>No such file</code>: the file <b>exists</b>.</li>
<li>The journal shows an <b>RRQ</b> (a read request, correct for a restore) and the server's answer <code>NAK (0, Permission denied)</code>. The request arrived and was understood.</li>
<li><code>ls -l</code> shows <code>-rw-------</code> owned by <code>root</code>. Only root may read it. Someone copied the backup in with <code>sudo</code> and a restrictive mode.</li>
<li>The daemon runs as <code>tftp</code> (the last line). The user tftp is neither root nor in root's group, so it falls under "others", which has no permission. It cannot read the file, and the server returns an error.</li>
</ol>
<p>Compare the second file: <code>-rw-rw-r--</code> gives "others" the read permission (<code>r--</code>), so the daemon can serve it. The difference between a working restore and a failed one is one set of three characters.</p>

<h3>The fix: give the daemon the minimum it needs</h3>
<p>The daemon only needs to <b>read</b> this file. <code>chmod 644</code> sets the mode: owner read and write, group and others read only. Nobody except the owner can modify it.</p>
`+n+`
<p>The mode changed to <code>-rw-r--r--</code> and tftp, as "others", may now read it. Alternatively you can change the owner so the file belongs to the daemon:</p>
`+r+`
<p>Which is better? <code>chown tftp:tftp</code> matches what the daemon creates itself when it receives uploads (owner tftp). <code>chmod 644</code> is the smallest change that solves a read problem. Never use <code>chmod 777</code>, which lets every user and process on the server rewrite your backups. In an incident people reach for 777 because it "always works"; it also removes the protection that makes backups trustworthy.</p>

<h3>The same rule for uploads</h3>
<p>For a backup the daemon must <b>write</b>. If it overwrites an existing file, the file (or its owner or group triple) must allow tftp to write: that is why files created by the daemon itself, owned by <code>tftp</code> with <code>rw-</code> for the owner, are safe for repeated backups. A file created by root with mode 644 could be read by the daemon but not overwritten, so the nightly backup would fail with the same error, this time on a WRQ. The directory also matters: to create a new file the daemon needs write permission on <code>/srv/tftp</code>, which tftp owns.</p>

<div class="eg"><p><b>Worked example.</b> Decide for each file whether the daemon (user tftp, not in group root) can read it. (1) <code>-rw-r-----</code> owner root, group root: no, others have no permission. (2) <code>-rw-r--r--</code> owner root: yes, others may read. (3) <code>-rw-------</code> owner tftp: yes, the daemon is the owner. (4) <code>-rw-r-----</code> owner root, group tftp: yes, tftp is in the file's group and the group triple has read. Practising this check turns "Permission denied" into a ten-second diagnosis.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Copying files into /srv/tftp with <code>sudo cp</code> and forgetting that the copy is owned by root; using <code>chmod 777</code>; changing permissions on the wrong file because of a typo in the name (names are case sensitive).</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>chmod 644</code> means rw-r--r--; <code>600</code> means rw-------; <code>755</code> means rwxr-xr-x. And remember: the identity that counts is the one the <i>daemon</i> runs as, not the one you are logged in as.</p></div>

<div class="scn"><h4>The backup that only root could read</h4><p>A script ran from root's cron job and saved nightly backups into the TFTP folder with <code>umask 077</code>, producing mode 600 files owned by root. Backups worked, but every restore test failed with Permission denied. The fix was one line in the script: <code>chown tftp:tftp</code> after each copy. The team also added a monthly restore test to catch the next surprise early.</p><p><b>Lesson:</b> a backup is only proven when a restore works. Test restores on a schedule.</p></div>

<div class="iv"><p class="q">"A TFTP restore says permission denied but the file exists. What do you check?"</p><p>The server journal for the NAK, then <code>ls -l</code> on the file and the folder, and which user the daemon runs as (<code>TFTP_USERNAME</code>). If tftp has no read permission through owner, group or others, fix with <code>chmod 644</code> or <code>chown tftp:tftp</code>. Do not use 777.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Permissions are owner, group and others; r=4, w=2, x=1.</li>
<li>The daemon is the user <code>tftp</code>, so it follows the rule for owner, group or others on each file.</li>
<li><code>Permission denied</code> (file exists) differs from <code>File not found</code> (no such name).</li>
<li>Fix with <code>chmod 644</code> or <code>chown tftp:tftp</code>; never 777.</li>
<li>Uploads need write permission on the file or on the folder.</li>
</ul></div>
`,hi:`
<p>Ticket NK-2466 (priority 1): "BLR-EDGE-R2 erase aur reload ho gaya. Branch WAN down hai." Kal raat ka backup server par hai. Aap router ko management address dete ho aur restore try karte ho. Woh <b>Permission denied</b> se fail hota hai, jabki file wahin maujood hai. Yeh sabse aam TFTP surprise hai, aur ise samajhne se aap Linux permission model seekhte ho jo roz use hoga.</p>

<h3>Do minute mein Linux permissions</h3>
<p>Har file ka ek <b>owner</b> (user), ek <b>group</b>, aur permission bits ke teen set hote hain. <code>ls -l</code> ke shuru ke das characters padho:</p>
`+e(`Pehla character type hai; phir teen triples: owner, group, others.`)+`
<ul>
<li>Pehla character: <code>-</code> normal file hai, <code>d</code> directory hai.</li>
<li>Phir <code>r</code> (read), <code>w</code> (write), <code>x</code> (execute) ke teen triples, <b>owner</b>, <b>group</b> aur <b>others</b> (baaki sab) ke liye. Dash ka matlab "allowed nahi".</li>
<li>Permissions aksar numbers mein likhi jaati hain: r = 4, w = 2, x = 1, har triple mein jode jaate hain. To <code>rw-</code> = 6, <code>r--</code> = 4, <code>---</code> = 0. Mode <code>-rw-r--r--</code> <b>644</b> hai; <code>-rw-------</code> <b>600</b> hai.</li>
</ul>
<p>Linux triples ko order mein check karta hai: agar aap owner ho to owner triple decide karta hai; nahi to agar group mein ho to group triple; nahi to "others" triple. Ek process ki sirf <b>ek identity</b> hoti hai. TFTP daemon user <code>tftp</code> hai, isliye har file ke liye woh ya to owner hai, ya group member, ya "others".</p>

<h3>Failure, dono taraf se padhi hui</h3>
`+t+`
<p>Saboot ko step by step dekho:</p>
<ol>
<li>Router <code>Permission denied</code> report karta hai, jo <code>No such file</code> se alag hai: file <b>maujood</b> hai.</li>
<li>Journal ek <b>RRQ</b> (read request, restore ke liye sahi) aur server ka jawab <code>NAK (0, Permission denied)</code> dikhata hai. Request pahunchi aur samjhi gayi.</li>
<li><code>ls -l</code> <code>root</code> ki <code>-rw-------</code> file dikhata hai. Sirf root ise padh sakta hai. Kisi ne backup ko <code>sudo</code> aur restrictive mode ke saath copy kiya.</li>
<li>Daemon <code>tftp</code> ki tarah chalta hai (aakhri line). User tftp na root hai na root ke group mein, isliye "others" mein aata hai, jiske paas koi permission nahi. Woh file nahi padh sakta, aur server error deta hai.</li>
</ol>
<p>Doosri file se compare karo: <code>-rw-rw-r--</code> "others" ko read permission (<code>r--</code>) deti hai, isliye daemon use serve kar sakta hai. Kaam karte aur fail hote restore ka farak teen characters ke ek set ka hai.</p>

<h3>Fix: daemon ko wahi do jo kam se kam chahiye</h3>
<p>Daemon ko is file ko sirf <b>padhna</b> hai. <code>chmod 644</code> mode set karta hai: owner read aur write, group aur others sirf read. Owner ke alawa koi ise modify nahi kar sakta.</p>
`+n+`
<p>Mode <code>-rw-r--r--</code> ho gaya aur tftp, "others" ki tarah, ab padh sakta hai. Vikalp mein aap owner badal sakte ho taaki file daemon ki ho jaaye:</p>
`+r+`
<p>Kaunsa behtar hai? <code>chown tftp:tftp</code> us se match karta hai jo daemon khud uploads receive karke banata hai (owner tftp). <code>chmod 644</code> read problem solve karne wala sabse chhota change hai. Kabhi <code>chmod 777</code> use mat karo, jo server ke har user aur process ko aapke backups dobara likhne deta hai. Incident mein log 777 par jaate hain kyunki woh "hamesha chalta hai"; woh us suraksha ko bhi hata deta hai jo backups ko bharosemand banati hai.</p>

<h3>Uploads ke liye wahi rule</h3>
<p>Backup ke liye daemon ko <b>likhna</b> padta hai. Agar woh maujood file overwrite karta hai, to file (ya uska owner ya group triple) tftp ko likhne deni chahiye: isiliye daemon ki khud banayi files, jo <code>tftp</code> ki hain aur owner ke liye <code>rw-</code> hai, baar baar backup ke liye surakshit hain. Root ki banayi mode 644 wali file daemon padh sakta par overwrite nahi kar sakta, isliye nightly backup usi error se fail hota, is baar WRQ par. Directory bhi matter karti hai: nayi file banane ke liye daemon ko <code>/srv/tftp</code> par write permission chahiye, jo tftp ke paas hai.</p>

<div class="eg"><p><b>Worked example.</b> Har file ke liye tay karo ki daemon (user tftp, group root mein nahi) use padh sakta hai ya nahi. (1) <code>-rw-r-----</code> owner root, group root: nahi, others ko permission nahi. (2) <code>-rw-r--r--</code> owner root: haan, others padh sakte hain. (3) <code>-rw-------</code> owner tftp: haan, daemon owner hai. (4) <code>-rw-r-----</code> owner root, group tftp: haan, tftp file ke group mein hai aur group triple mein read hai. Is check ki practice "Permission denied" ko das second ka diagnosis bana deti hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> /srv/tftp mein <code>sudo cp</code> se files copy karke bhool jaana ki copy root ki hai; <code>chmod 777</code> use karna; naam mein typo ki wajah se galat file ki permissions badalna (naam case sensitive hain).</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>chmod 644</code> matlab rw-r--r--; <code>600</code> matlab rw-------; <code>755</code> matlab rwxr-xr-x. Aur yaad rakho: jo identity count karti hai woh hai jis ki tarah <i>daemon</i> chalta hai, jis ki tarah aap logged in ho woh nahi.</p></div>

<div class="scn"><h4>Woh backup jo sirf root padh sakta tha</h4><p>Root ke cron job se chalne wali ek script TFTP folder mein <code>umask 077</code> ke saath nightly backups save karti thi, jisse root ki mode 600 files banti thi. Backups kaam karte the, par har restore test Permission denied se fail hota tha. Fix script mein ek line tha: har copy ke baad <code>chown tftp:tftp</code>. Team ne agli surprise jaldi pakadne ke liye monthly restore test bhi jodi.</p><p><b>Lesson:</b> backup tab sabit hota hai jab restore kaam kare. Restores ko schedule par test karo.</p></div>

<div class="iv"><p class="q">"TFTP restore permission denied kehta hai par file maujood hai. Kya check karte ho?"</p><p>NAK ke liye server journal, phir file aur folder par <code>ls -l</code>, aur daemon kis user ki tarah chalta hai (<code>TFTP_USERNAME</code>). Agar tftp ko owner, group ya others ke zariye read permission nahi hai, to <code>chmod 644</code> ya <code>chown tftp:tftp</code> se theek karo. 777 use mat karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Permissions owner, group aur others ki hoti hain; r=4, w=2, x=1.</li>
<li>Daemon user <code>tftp</code> hai, isliye har file par woh owner, group ya others ka rule follow karta hai.</li>
<li><code>Permission denied</code> (file maujood hai) <code>File not found</code> (aisa naam nahi) se alag hai.</li>
<li><code>chmod 644</code> ya <code>chown tftp:tftp</code> se theek karo; kabhi 777 nahi.</li>
<li>Uploads ko file par ya folder par write permission chahiye.</li>
</ul></div>
`}};export{i as default};