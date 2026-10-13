var e=e=>`<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Recap">
<rect x="10" y="25" width="140" height="60" rx="8" fill="#bae6fd"/><text x="80" y="52" text-anchor="middle" class="svg-ink" font-size="13">Router</text><text x="80" y="70" text-anchor="middle" class="svg-muted" font-size="11">copy ... tftp:</text>
<rect x="180" y="25" width="140" height="60" rx="8" fill="#fed7aa"/><text x="250" y="52" text-anchor="middle" class="svg-ink" font-size="13">ufw</text><text x="250" y="70" text-anchor="middle" class="svg-muted" font-size="11">69/udp from mgmt only</text>
<rect x="350" y="25" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="420" y="52" text-anchor="middle" class="svg-ink" font-size="13">tftpd-hpa</text><text x="420" y="70" text-anchor="middle" class="svg-muted" font-size="11">user tftp, --create</text>
<rect x="520" y="25" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="575" y="52" text-anchor="middle" class="svg-ink" font-size="13">/srv/tftp</text><text x="575" y="70" text-anchor="middle" class="svg-muted" font-size="11">644, dated</text>
<line x1="150" y1="55" x2="180" y2="55" stroke="#64748b" stroke-width="2"/><line x1="320" y1="55" x2="350" y2="55" stroke="#64748b" stroke-width="2"/><line x1="490" y1="55" x2="520" y2="55" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code"><span class="c"># Linux server</span>
sudo apt install -y tftpd-hpa
systemctl status tftpd-hpa
cat /etc/default/tftpd-hpa             <span class="c"># TFTP_USERNAME, TFTP_DIRECTORY, TFTP_OPTIONS</span>
sudo sed -i 's/--secure/--secure --create/' /etc/default/tftpd-hpa
sudo systemctl restart tftpd-hpa
ss -uln                                <span class="c"># UDP 69 listening?</span>
ls -l /srv/tftp
sudo chmod 644 /srv/tftp/FILE          <span class="c"># or: sudo chown tftp:tftp /srv/tftp/FILE</span>
sudo journalctl -u tftpd-hpa -n 5
diff OLD NEW                           <span class="c"># what changed?</span>
sudo ufw allow from 10.99.0.0/24 to any port 69 proto udp
scp user@10.99.0.40:/path/file /tmp/   <span class="c"># secure download</span>
<span class="c"># Cisco IOS</span>
copy running-config tftp://10.99.0.40/NAME.cfg
copy tftp://10.99.0.40/NAME.cfg running-config
copy running-config startup-config</pre>`,n={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You can now build a backup server, back up and restore routers, find what changed, explain why TFTP is risky, and reach for SCP when it matters. This chapter is your revision sheet.</p>
`+e(`The whole module in one line: router, firewall, daemon, folder.`)+`

<h3>Can-do checklist</h3>
<ul>
<li>Explain TFTP: UDP 69, RRQ and WRQ, 512-byte lock-step blocks, no login, no encryption.</li>
<li>Install tftpd-hpa and read <code>/etc/default/tftpd-hpa</code>: user, directory, address, options.</li>
<li>Back up a router with <code>copy running-config tftp://...</code> and explain why a first upload needs <code>--create</code>.</li>
<li>Read the journal lines WRQ, RRQ and NAK, and tell "file not found" from "permission denied".</li>
<li>Read <code>ls -l</code> modes and fix them with <code>chmod 644</code> or <code>chown tftp:tftp</code>.</li>
<li>Compare two backups with <code>diff</code>, and explain merge (copy to running-config) versus <code>configure replace</code>.</li>
<li>Restore a wiped router, verify it and save with <code>copy running-config startup-config</code>.</li>
<li>Lock UDP 69 to the management network with ufw, SSH first.</li>
<li>Use <code>scp</code> for a secure copy and explain host keys and key-based login.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>TFTP</dt><dd>Trivial File Transfer Protocol: UDP 69, no authentication.</dd>
<dt>RRQ / WRQ</dt><dd>Read request (download) and write request (upload).</dd>
<dt>NAK</dt><dd>The error reply of the server, with a code and text, shown in the journal.</dd>
<dt>--secure</dt><dd>tftpd-hpa option that confines file names to the served directory.</dd>
<dt>--create</dt><dd>tftpd-hpa option that allows uploading new files.</dd>
<dt>Merge</dt><dd>Applying a file line by line to the running configuration without removing other lines.</dd>
<dt>SCP / SFTP</dt><dd>File copy over SSH on TCP 22; encrypted and authenticated.</dd>
<dt>Host key</dt><dd>The server's SSH identity, stored in known_hosts on first contact.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Protocol</th><th>Transport / port</th><th>Authentication</th><th>Encryption</th></tr>
<tr><td>TFTP</td><td>UDP 69</td><td>None</td><td>None</td></tr>
<tr><td>FTP</td><td>TCP 21 plus data</td><td>Username and password</td><td>None</td></tr>
<tr><td>SCP</td><td>TCP 22</td><td>SSH</td><td>Yes</td></tr>
<tr><td>SFTP</td><td>TCP 22</td><td>SSH</td><td>Yes</td></tr></table>
<ul>
<li>tftpd-hpa overwrites existing files only, unless <code>--create</code> is set.</li>
<li>The daemon runs as the user <code>tftp</code>; its permissions on the file decide the outcome.</li>
<li>Copy to <code>running-config</code> merges; the running configuration is lost at reload unless saved.</li>
<li>A timeout with no journal entry means the request never arrived.</li>
<li>Allow SSH before enabling ufw on a remote server.</li>
</ul>

<h3>Command cheat sheet</h3>
`+t+`

<div class="eg"><p><b>Worked example.</b> Final self-test. Without notes: a restore says Permission denied. Name the three things you check and the fix. Answer: the journal (NAK code 0), <code>ls -l</code> on the file, and the daemon user in the settings file; fix with <code>chmod 644</code> or <code>chown tftp:tftp</code>. Then say what you do after the restore: verify addresses, then <code>copy running-config startup-config</code>.</p></div>

<div class="warn"><p><b>Common mistakes to avoid.</b> No offsite backup, 0-byte backups, <code>chmod 777</code>, UDP 69 open to the world, restoring without saving, and never testing a restore.</p></div>
<div class="exam"><p><b>Exam trap.</b> If asked how to guarantee confidentiality of a config transfer, TFTP and FTP are wrong answers. SCP or SFTP is right.</p></div>

<div class="scn"><h4>The quarterly restore drill</h4><p>A team scheduled a quarterly drill: wipe a lab router, then restore it from the TFTP backup within 15 minutes. The first drill failed on a permissions error that nobody had noticed for months. The second drill took seven minutes. When a real router died at a branch the following quarter, the restore took six.</p><p><b>Lesson:</b> a tested backup is a tool; an untested backup is a hope.</p></div>

<div class="iv"><p class="q">"Describe your backup design for 100 routers."</p><p>Nightly job copies running-config of each device to a server over SCP where supported, TFTP restricted to the management network elsewhere. Files are named by device and date, kept for months, compared with diff to detect unplanned changes, and mirrored off the server. The server runs a default-deny firewall, files are owned and permissioned minimally, and a periodic restore test proves the process.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>TFTP: simple, UDP 69, unauthenticated; confine it with a firewall and a dedicated folder.</li>
<li>Journal NAK codes and <code>ls -l</code> explain most failures.</li>
<li>Backup and restore are the same copy command in two directions.</li>
<li><code>diff</code> answers "what changed?"; merge versus replace answers "what will the restore do?".</li>
<li>Next in the track: the ufw host firewall in depth.</li>
</ul></div>
`,hi:`
<p>Ab aap backup server bana sakte ho, routers ka backup aur restore kar sakte ho, dhoondh sakte ho ki kya badla, samjha sakte ho ki TFTP risky kyun hai, aur zaroorat par SCP tak pahunch sakte ho. Yeh chapter aapki revision sheet hai.</p>
`+e(`Poora module ek line mein: router, firewall, daemon, folder.`)+`

<h3>Can-do checklist</h3>
<ul>
<li>TFTP samjhao: UDP 69, RRQ aur WRQ, 512-byte lock-step blocks, na login, na encryption.</li>
<li>tftpd-hpa install karo aur <code>/etc/default/tftpd-hpa</code> padho: user, directory, address, options.</li>
<li><code>copy running-config tftp://...</code> se router ka backup lo aur samjhao ki pehle upload ko <code>--create</code> kyun chahiye.</li>
<li>Journal lines WRQ, RRQ aur NAK padho, aur "file not found" ko "permission denied" se alag batao.</li>
<li><code>ls -l</code> modes padho aur <code>chmod 644</code> ya <code>chown tftp:tftp</code> se theek karo.</li>
<li>Do backups ko <code>diff</code> se compare karo, aur merge (running-config mein copy) aur <code>configure replace</code> ka farak samjhao.</li>
<li>Mite hue router ko restore karo, verify karo aur <code>copy running-config startup-config</code> se save karo.</li>
<li>ufw se UDP 69 ko management network tak lock karo, pehle SSH.</li>
<li>Secure copy ke liye <code>scp</code> use karo aur host keys aur key-based login samjhao.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>TFTP</dt><dd>Trivial File Transfer Protocol: UDP 69, authentication nahi.</dd>
<dt>RRQ / WRQ</dt><dd>Read request (download) aur write request (upload).</dd>
<dt>NAK</dt><dd>Server ka error reply, code aur text ke saath, journal mein dikhta hai.</dd>
<dt>--secure</dt><dd>tftpd-hpa option jo file naam ko served directory tak seemit karta hai.</dd>
<dt>--create</dt><dd>tftpd-hpa option jo nayi files upload karne deta hai.</dd>
<dt>Merge</dt><dd>File ko running configuration par line by line apply karna bina doosri lines hataye.</dd>
<dt>SCP / SFTP</dt><dd>SSH par TCP 22 par file copy; encrypted aur authenticated.</dd>
<dt>Host key</dt><dd>Server ki SSH identity, pehli mulaqat par known_hosts mein store hoti hai.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Protocol</th><th>Transport / port</th><th>Authentication</th><th>Encryption</th></tr>
<tr><td>TFTP</td><td>UDP 69</td><td>Nahi</td><td>Nahi</td></tr>
<tr><td>FTP</td><td>TCP 21 plus data</td><td>Username aur password</td><td>Nahi</td></tr>
<tr><td>SCP</td><td>TCP 22</td><td>SSH</td><td>Haan</td></tr>
<tr><td>SFTP</td><td>TCP 22</td><td>SSH</td><td>Haan</td></tr></table>
<ul>
<li>tftpd-hpa sirf maujood files overwrite karta hai, jab tak <code>--create</code> set na ho.</li>
<li>Daemon user <code>tftp</code> ki tarah chalta hai; file par uski permissions nateeja tay karti hain.</li>
<li><code>running-config</code> mein copy merge karta hai; save na ho to running configuration reload par kho jaati hai.</li>
<li>Journal entry ke bina timeout ka matlab request kabhi pahunchi hi nahi.</li>
<li>Remote server par ufw enable karne se pehle SSH allow karo.</li>
</ul>

<h3>Command cheat sheet</h3>
`+t+`

<div class="eg"><p><b>Worked example.</b> Final self-test. Bina notes ke: restore Permission denied kehta hai. Woh teen cheezein batao jo aap check karte ho aur fix. Jawab: journal (NAK code 0), file par <code>ls -l</code>, aur settings file mein daemon user; <code>chmod 644</code> ya <code>chown tftp:tftp</code> se fix. Phir batao restore ke baad kya karte ho: addresses verify karo, phir <code>copy running-config startup-config</code>.</p></div>

<div class="warn"><p><b>Bachne wali galtiyan.</b> Offsite backup na hona, 0-byte backups, <code>chmod 777</code>, UDP 69 poori duniya ke liye khula, save kiye bina restore, aur restore ko kabhi test na karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Config transfer ki confidentiality guarantee karne ka tareeka poochha jaaye to TFTP aur FTP galat jawab hain. SCP ya SFTP sahi hai.</p></div>

<div class="scn"><h4>Quarterly restore drill</h4><p>Ek team ne quarterly drill schedule ki: lab router ko wipe karo, phir TFTP backup se 15 minute mein restore karo. Pehli drill ek permissions error par fail hui jise mahino se kisi ne notice nahi kiya tha. Doosri drill mein saat minute lage. Agli quarter jab branch par asli router mara, restore mein chhe minute lage.</p><p><b>Lesson:</b> tested backup ek tool hai; untested backup ek umeed hai.</p></div>

<div class="iv"><p class="q">"100 routers ke liye apna backup design batao."</p><p>Nightly job har device ka running-config server par copy karta hai, jahan support ho wahan SCP se, baaki jagah management network tak restricted TFTP se. Files device aur date se naam ki jaati hain, mahino rakhi jaati hain, unplanned changes pakadne ke liye diff se compare hoti hain, aur server ke bahar mirror hoti hain. Server default-deny firewall chalata hai, files minimal owner aur permissions ke saath hain, aur periodic restore test process ko sabit karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>TFTP: simple, UDP 69, unauthenticated; firewall aur dedicated folder se confine karo.</li>
<li>Journal NAK codes aur <code>ls -l</code> zyadatar failures samjhate hain.</li>
<li>Backup aur restore do dishaon mein wahi copy command hain.</li>
<li><code>diff</code> "kya badla?" ka jawab hai; merge versus replace "restore kya karega?" ka jawab hai.</li>
<li>Track mein aage: ufw host firewall gehrai se.</li>
</ul></div>
`}};export{n as default};