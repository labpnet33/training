var e=e=>`<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="TFTP versus SSH transfer">
<rect x="10" y="15" width="300" height="60" rx="10" fill="#fecaca"/><text x="160" y="42" text-anchor="middle" class="svg-ink" font-size="13">TFTP: UDP 69</text><text x="160" y="62" text-anchor="middle" class="svg-muted" font-size="12">clear text, no login, anyone can sniff</text>
<rect x="330" y="15" width="300" height="60" rx="10" fill="#bbf7d0"/><text x="480" y="42" text-anchor="middle" class="svg-ink" font-size="13">SCP / SFTP: TCP 22 inside SSH</text><text x="480" y="62" text-anchor="middle" class="svg-muted" font-size="12">encrypted, host key, user login</text>
<rect x="10" y="100" width="130" height="50" rx="8" fill="#bae6fd"/><text x="75" y="130" text-anchor="middle" class="svg-ink" font-size="13">ADMIN01</text>
<rect x="500" y="100" width="130" height="50" rx="8" fill="#bae6fd"/><text x="565" y="130" text-anchor="middle" class="svg-ink" font-size="13">TFTP01</text>
<line x1="140" y1="125" x2="500" y2="125" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="320" y="118" text-anchor="middle" class="svg-accent" font-size="12">same file, a very different tunnel</text>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code">priya@admin01:~$ scp netadmin@10.99.0.40:/srv/tftp/BLR-EDGE-R2.cfg /tmp/
<span class="c">(first time: the host key is shown and you answer yes; then the password prompt)</span>
priya@admin01:~$ ls -l /tmp</pre>
<pre class="out">Warning: Permanently added '10.99.0.40' (ED25519) to the list of known hosts.
BLR-EDGE-R2.cfg                               <span class="hl">100%</span>   624   0.6KB/s   00:00
total 4
-rw-rw-r--  1 priya    priya       624 Sep 29 09:00 BLR-EDGE-R2.cfg</pre>`,n=`<pre class="code">priya@admin01:~$ scp /tmp/BLR-EDGE-R2.cfg netadmin@10.99.0.40:/tmp/copy.cfg
netadmin@tftp01:~$ ls -l /tmp</pre>
<pre class="out">BLR-EDGE-R2.cfg                               100%   624   0.6KB/s   00:00
total 4
-rw-rw-r--  1 netadmin netadmin    624 Sep 29 09:00 copy.cfg</pre>`,r=`<pre class="code">priya@admin01:~$ ssh netadmin@10.99.0.40
netadmin@tftp01:~$ sudo journalctl -u ssh -n 2</pre>
<pre class="out">Sep 29 09:00:50 tftp01 sshd[707]: <span class="hl">Accepted password for netadmin from 10.99.0.50</span> port 58140 ssh2
Sep 29 09:00:50 tftp01 sshd[707]: pam_unix(sshd:session): session opened for user netadmin(uid=1001) by netadmin(uid=0)</pre>`,i=`<pre class="code">priya@admin01:~$ ssh-keygen -t ed25519 -N '' -f /tmp/k</pre>
<pre class="out">Generating public/private ed25519 key pair.
Your identification has been saved in /tmp/k
Your public key has been saved in /tmp/k.pub
...</pre>`,a=`<pre class="code"><span class="c"># Reference commands (not run in the simulator)</span>
<span class="c"># Linux: interactive secure transfer</span>
sftp netadmin@10.99.0.40
sftp&gt; put PUN-CORE-R1.cfg
sftp&gt; ls
sftp&gt; get BLR-EDGE-R2.cfg
<span class="c"># Cisco IOS as an SCP server and client (SSH and local login must already work)</span>
ip scp server enable
copy running-config scp://netadmin@10.99.0.40/PUN-CORE-R1.cfg
<span class="c"># Junos: copy a file with SCP syntax</span>
file copy /config/juniper.conf.gz netadmin@10.99.0.40:/srv/backups/
<span class="c"># check a downloaded image against the hash published by the vendor</span>
sha256sum image.bin</pre>`,o={id:`secure-alternatives`,h:{en:`Why TFTP is insecure, and SCP and SFTP as the safe alternatives`,hi:`TFTP insecure kyun hai, aur SCP aur SFTP surakshit vikalp`},body:{en:`
<p>You have a working TFTP backup system. Now ask the question an auditor will ask: "Who can read these files, and who can change them?" The honest answer for TFTP is "anyone who can reach UDP 69". This chapter shows exactly why that matters and introduces the tools that fix it.</p>

<h3>The five weaknesses of TFTP</h3>
<ol>
<li><b>No authentication.</b> The server cannot tell the router from an attacker's laptop. Any host that reaches port 69 can request a file, and can upload one if creation or overwrite is allowed.</li>
<li><b>No encryption.</b> Configurations travel in clear text. They can contain SNMP community strings, routing keys, VPN secrets and password hashes. A person capturing packets on the path reads them all.</li>
<li><b>No integrity protection.</b> A corrupted or modified file is not detected beyond the weak UDP checksum. A tampered backup or software image would be accepted.</li>
<li><b>Overwrite risk.</b> With write access enabled, one wrong or hostile upload replaces your good backup. Versioned file names reduce this risk.</li>
<li><b>Firewall awkwardness.</b> The data moves over random UDP ports, which makes it hard to filter precisely.</li>
</ol>
`+e(`The same file, sent two ways. TFTP is open; SSH-based copy authenticates both ends and encrypts the data.`)+`
<p>When is TFTP still acceptable? On an isolated out-of-band management network, restricted by a firewall to a few device addresses, for short-lived tasks such as loading a boot image on a device whose boot loader speaks nothing else, and in labs. Outside those cases, use an SSH-based transfer.</p>

<h3>SCP: copy over SSH</h3>
<p><b>SCP</b> (Secure Copy) copies files through an SSH connection on <b>TCP port 22</b>. If you can ssh to a machine, you can scp to it. The syntax is <code>scp SOURCE DESTINATION</code>, where a remote place is written <code>user@host:path</code>. In the lab we add a second Ubuntu workstation, ADMIN01, to act as an engineer's laptop, and pull a backup from the server:</p>
`+t+`
<p>What happened that TFTP never does:</p>
<ul>
<li>The client was shown the server's <b>host key</b> and asked to trust it. After yes, it is saved in <code>~/.ssh/known_hosts</code>. On later connections a changed key triggers a loud warning, which is how SSH detects a man-in-the-middle.</li>
<li>The server asked for the <b>password</b> of the user <code>netadmin</code>. It is typed without echo. Access to the file depends on that user's permissions, not on the daemon's.</li>
<li>The progress line shows 100 percent and the byte count, so you can compare it with the original size.</li>
</ul>
<p>Uploading is the same command with the arguments reversed. Note that the new file belongs to <code>netadmin</code>, a real person's account, instead of a shared daemon user:</p>
`+n+`
<p>SSH based access also leaves an <b>audit trail</b> in the server's authentication log. After an SSH login the journal says who came, from which address, and when:</p>
`+r+`
<p>The line <code>Accepted password for netadmin from 10.99.0.50</code> answers the auditor's question. TFTP leaves only "a request from this address".</p>

<h3>SFTP, keys and automation</h3>
<p><b>SFTP</b> (SSH File Transfer Protocol) also uses TCP 22 and gives an interactive session with <code>ls</code>, <code>get</code> and <code>put</code>. It is not FTP with security added; it is a separate protocol inside SSH. For unattended jobs, such as the nightly backup script, use <b>key-based login</b> instead of a typed password. You create a key pair once, and the server stores the public half:</p>
`+i+`
<p>The private key (<code>/tmp/k</code>) never leaves the client; the public key (<code>/tmp/k.pub</code>) is installed on the server. Protect the private key with file mode 600 and, where possible, give the backup user only the rights it needs. The lab does not simulate <code>sftp</code> or <code>ssh-copy-id</code>, so these appear as reference commands:</p>
`+a+`
<p>Network devices vary. Many Cisco IOS releases can act as an SCP server with <code>ip scp server enable</code> and copy with <code>scp:</code> URLs, but it requires working SSH and local or AAA login first. Junos uses SCP syntax in <code>file copy</code>. Check the feature in the documentation of your release before you plan a migration.</p>

<div class="eg"><p><b>Worked example.</b> Migration plan for Deccan Net. Phase 1: keep TFTP but restrict UDP 69 to the 10.99.0.0/24 management network (chapter 8). Phase 2: configure SSH and SCP on devices that support it, create a backup user with a key, and switch the nightly job to <code>scp</code>. Phase 3: after a month of successful SCP backups, remove the ufw rule for UDP 69 and stop the TFTP daemon. The firewall then has one fewer open port.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Answering yes to a changed-host-key warning without investigating; leaving private keys with loose permissions; sharing one account and one password among all engineers; concluding "SCP is secure so the file is safe" even though the file itself sits unprotected on a shared disk.</p></div>
<div class="exam"><p><b>Exam trap.</b> SCP and SFTP both run on <b>TCP 22</b>. FTP is TCP 21 plus data, TFTP is UDP 69. FTPS is FTP with TLS, a different thing from SFTP.</p></div>

<div class="scn"><h4>The configuration that was sniffed</h4><p>During a penetration test, the testers placed a laptop on the management VLAN and captured a nightly TFTP backup. The file contained SNMP community strings and a pre-shared VPN key, which they used to read device data. The remediation was threefold: SCP for backups, ACLs limiting management access, and rotating every secret that had crossed the wire.</p><p><b>Lesson:</b> assume anything sent in clear text has been read, and change the secrets.</p></div>

<div class="iv"><p class="q">"Why is TFTP considered insecure and what would you use instead?"</p><p>TFTP has no authentication, no encryption and no integrity checks, so anyone who reaches UDP 69 can read or overwrite files and anyone on the path can read them. Use SCP or SFTP over SSH, with key-based login for automation, on TCP 22. If TFTP is unavoidable, confine it to an isolated management network behind a firewall that allows only specific device addresses.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>TFTP has no login, no encryption and no integrity protection.</li>
<li>SCP and SFTP run inside SSH on TCP 22 with host keys and user authentication.</li>
<li><code>scp user@host:path local</code> downloads; reverse the arguments to upload.</li>
<li>Use SSH keys for automated jobs and protect the private key.</li>
<li>If you must keep TFTP, isolate and filter it, and treat any secret sent that way as exposed.</li>
</ul></div>
`,hi:`
<p>Aapke paas ek chalta hua TFTP backup system hai. Ab woh sawaal poochho jo auditor poochhega: "Yeh files kaun padh sakta hai, aur kaun badal sakta hai?" TFTP ka imaandaar jawab hai "jo bhi UDP 69 tak pahunch sake". Yeh chapter dikhata hai ki yeh kyun matter karta hai aur woh tools batata hai jo ise theek karte hain.</p>

<h3>TFTP ki paanch kamzoriyan</h3>
<ol>
<li><b>Authentication nahi.</b> Server router ko attacker ke laptop se alag nahi kar sakta. Port 69 tak pahunchne wala koi bhi host file maang sakta hai, aur creation ya overwrite allowed ho to upload bhi kar sakta hai.</li>
<li><b>Encryption nahi.</b> Configurations clear text mein safar karti hain. Unme SNMP community strings, routing keys, VPN secrets aur password hashes ho sakte hain. Path par packets capture karne wala sab padh leta hai.</li>
<li><b>Integrity protection nahi.</b> Kamzor UDP checksum ke alawa corrupted ya modified file pakdi nahi jaati. Chhedi hui backup ya software image accept ho jaati.</li>
<li><b>Overwrite ka khatra.</b> Write access on ho to ek galat ya dushmani upload aapke achhe backup ko replace kar deta hai. Versioned file naam is khatre ko kam karte hain.</li>
<li><b>Firewall ki mushkil.</b> Data random UDP ports par chalta hai, jisse ise precisely filter karna mushkil hai.</li>
</ol>
`+e(`Ek hi file, do tareeke se. TFTP khula hai; SSH-based copy dono taraf authenticate karta hai aur data encrypt karta hai.`)+`
<p>TFTP kab bhi theek hai? Isolated out-of-band management network par, firewall se kuch device addresses tak restricted, chhote kaamon ke liye jaise aise device par boot image load karna jiska boot loader aur kuch nahi bolta, aur labs mein. Inke bahar SSH-based transfer use karo.</p>

<h3>SCP: SSH par copy</h3>
<p><b>SCP</b> (Secure Copy) files ko SSH connection se <b>TCP port 22</b> par copy karta hai. Agar aap kisi machine par ssh kar sakte ho, to scp bhi kar sakte ho. Syntax <code>scp SOURCE DESTINATION</code> hai, jahan remote jagah <code>user@host:path</code> likhi jaati hai. Lab mein hum ek doosri Ubuntu workstation, ADMIN01, jodte hain jo engineer ke laptop ka kaam kare, aur server se backup khinchte hain:</p>
`+t+`
<p>Jo hua woh TFTP kabhi nahi karta:</p>
<ul>
<li>Client ko server ki <b>host key</b> dikhayi gayi aur use trust karne ko kaha gaya. Yes ke baad woh <code>~/.ssh/known_hosts</code> mein save hoti hai. Baad ke connections par badli hui key zor ki warning deti hai, isi tarah SSH man-in-the-middle pakadta hai.</li>
<li>Server ne user <code>netadmin</code> ka <b>password</b> maanga. Woh bina echo ke type hota hai. File tak access us user ki permissions par nirbhar hai, daemon ki par nahi.</li>
<li>Progress line 100 percent aur byte count dikhati hai, isliye aap use original size se compare kar sakte ho.</li>
</ul>
<p>Upload wahi command hai jisme arguments ulte hain. Dhyan do ki nayi file <code>netadmin</code> ki hai, kisi asli insaan ke account ki, shared daemon user ki nahi:</p>
`+n+`
<p>SSH-based access server ke authentication log mein ek <b>audit trail</b> bhi chhodta hai. SSH login ke baad journal batata hai kaun aaya, kis address se, aur kab:</p>
`+r+`
<p>Line <code>Accepted password for netadmin from 10.99.0.50</code> auditor ke sawaal ka jawab deti hai. TFTP sirf "is address se ek request" chhodta hai.</p>

<h3>SFTP, keys aur automation</h3>
<p><b>SFTP</b> (SSH File Transfer Protocol) bhi TCP 22 use karta hai aur <code>ls</code>, <code>get</code> aur <code>put</code> ke saath interactive session deta hai. Yeh security jodi hui FTP nahi hai; yeh SSH ke andar alag protocol hai. Unattended jobs ke liye, jaise nightly backup script, type kiye password ki jagah <b>key-based login</b> use karo. Aap ek baar key pair banate ho, aur server public hissa store karta hai:</p>
`+i+`
<p>Private key (<code>/tmp/k</code>) kabhi client se bahar nahi jaati; public key (<code>/tmp/k.pub</code>) server par install hoti hai. Private key ko file mode 600 se protect karo aur jahan ho sake backup user ko sirf wahi rights do jo chahiye. Lab <code>sftp</code> ya <code>ssh-copy-id</code> simulate nahi karta, isliye yeh reference commands hain:</p>
`+a+`
<p>Network devices alag hote hain. Bahut se Cisco IOS releases <code>ip scp server enable</code> se SCP server ban sakte hain aur <code>scp:</code> URLs se copy kar sakte hain, par pehle SSH aur local ya AAA login kaam karna chahiye. Junos <code>file copy</code> mein SCP syntax use karta hai. Migration plan karne se pehle apne release ke documentation mein feature check karo.</p>

<div class="eg"><p><b>Worked example.</b> Deccan Net ka migration plan. Phase 1: TFTP rakho par UDP 69 ko 10.99.0.0/24 management network tak restrict karo (chapter 8). Phase 2: jin devices par support hai wahan SSH aur SCP configure karo, key ke saath backup user banao, aur nightly job ko <code>scp</code> par switch karo. Phase 3: ek mahine ki safal SCP backups ke baad UDP 69 ka ufw rule hatao aur TFTP daemon band karo. Firewall mein ek port kam khula rahega.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Badli hui host key ki warning par bina jaanch ke yes bolna; private keys ko dheeli permissions ke saath chhodna; sab engineers ke beech ek account aur ek password share karna; yeh nateeja nikaalna ki "SCP secure hai isliye file safe hai" jabki file khud shared disk par unprotected padi hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> SCP aur SFTP dono <b>TCP 22</b> par chalte hain. FTP TCP 21 plus data hai, TFTP UDP 69. FTPS TLS ke saath FTP hai, SFTP se alag cheez.</p></div>

<div class="scn"><h4>Woh configuration jo sniff hui</h4><p>Ek penetration test mein testers ne management VLAN par laptop lagaya aur nightly TFTP backup capture kiya. File mein SNMP community strings aur pre-shared VPN key thi, jinse unhone device data padha. Remediation teen hisson mein tha: backups ke liye SCP, management access limit karne wale ACLs, aur har us secret ko badalna jo wire se guzra tha.</p><p><b>Lesson:</b> maan lo ki clear text mein bheji gayi har cheez padhi ja chuki hai, aur secrets badlo.</p></div>

<div class="iv"><p class="q">"TFTP insecure kyun maana jaata hai aur uski jagah kya use karoge?"</p><p>TFTP mein na authentication, na encryption, na integrity checks hain, isliye UDP 69 tak pahunchne wala files padh ya overwrite kar sakta hai aur path par koi bhi unhe padh sakta hai. TCP 22 par SSH ke upar SCP ya SFTP use karo, automation ke liye key-based login ke saath. Agar TFTP se bachna mushkil ho to use isolated management network par aise firewall ke peeche rakho jo sirf specific device addresses allow kare.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>TFTP mein na login, na encryption, na integrity protection.</li>
<li>SCP aur SFTP SSH ke andar TCP 22 par host keys aur user authentication ke saath chalte hain.</li>
<li><code>scp user@host:path local</code> download karta hai; upload ke liye arguments ulte karo.</li>
<li>Automated jobs ke liye SSH keys use karo aur private key ko protect karo.</li>
<li>TFTP rakhna ho to isolate aur filter karo, aur is tareeke se bheji gayi har secret ko exposed maano.</li>
</ul></div>
`}};export{o as default};