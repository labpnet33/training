var e={id:`file-transfer-firewalls`,h:{en:`Secure file transfer, image integrity and managing firewalls securely`,hi:`Secure file transfer, image integrity aur firewalls ko securely manage karna`},body:{en:`
<p>A pharmacy does not accept medicine delivered in an open cardboard box by an unknown driver. It wants a sealed package, from a known supplier, with a batch number it can check. Software images and configuration files are the medicine of a network: they must arrive over an encrypted channel (SCP, SFTP, HTTPS), from an authenticated person, and with a hash or signature you can verify before you install them.</p>

<h3>Clear-text transfer protocols to retire</h3>
<p><b>TFTP</b> (UDP 69) has no authentication at all, and <b>FTP</b> (TCP 21) sends the password in clear text. Both leak configurations, which contain keys and hashes, to anyone on the path. The secure replacements reuse the SSH you already hardened:</p>
<table class="cmp">
<tr><th>Protocol</th><th>Runs over</th><th>Typical IOS use</th></tr>
<tr><td>SCP</td><td>SSH (TCP 22)</td><td>device as server: push an image to the router from a laptop; or as client with <code>copy scp:</code></td></tr>
<tr><td>SFTP</td><td>SSH (TCP 22)</td><td>device as client: <code>copy sftp:</code> to fetch an image or save a backup</td></tr>
<tr><td>HTTPS</td><td>TLS (TCP 443)</td><td>controllers and managers (Catalyst Center, FMC) distributing images</td></tr>
</table>

<h3>SCP server on the router</h3>
<pre class="code"><span class="c">! SCP rides on SSH and uses AAA for login and exec authorization</span>
aaa new-model
aaa authentication login default group tacacs+ local
aaa authorization exec default group tacacs+ local
ip scp server enable
<span class="c">! the router can also pull a file as an SCP or SFTP client</span>
ip ssh source-interface GigabitEthernet0/0</pre>
<pre class="out">R1# copy scp://netadmin@10.10.10.50/images/c8000v-17.12.04.SPA.bin bootflash:
Destination filename [c8000v-17.12.04.SPA.bin]?
Password:
 Sending file modes: C0644 ...
<span class="hl">!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!</span>
<span class="hl">734003200 bytes copied in 212.4 secs</span></pre>
<p>The SCP server requires <b>exec authorization</b>: a user who cannot get a shell cannot copy files either. That is a useful safety property, since the same TACACS+ policy that controls CLI access controls file access.</p>

<h3>Image integrity and boot protection</h3>
<pre class="code">R1# verify /md5 bootflash:c8000v-17.12.04.SPA.bin
<span class="c">! compare with the checksum published by the vendor for that release</span>
R1# show software authenticity running
<span class="c">! IOS XE: confirms the running image carries a valid Cisco signature</span>
<span class="c">! resilient configuration: keep a hidden, secured copy of image and config</span>
secure boot-image
secure boot-config</pre>
<p><code>verify</code> computes the hash of the file so you can compare it with the published value, which catches corruption and tampering. Modern platforms go further with <b>signed images</b> and hardware <b>secure boot</b> (a trust anchor checks the signature of the bootloader and the image before running them). The Cisco IOS Resilient Configuration feature (<code>secure boot-image</code>, <code>secure boot-config</code>) keeps a protected working copy that a <code>format</code> or <code>erase</code> cannot remove, useful against a malicious wipe.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Management network for routers and firewalls">
<rect x="20" y="95" width="130" height="56" rx="8" fill="#fde68a"/><text x="85" y="118" text-anchor="middle" class="svg-ink" font-size="13">Admin laptop</text><text x="85" y="136" text-anchor="middle" class="svg-muted" font-size="12">MFA + VPN</text>
<rect x="190" y="95" width="120" height="56" rx="8" fill="#ddd6fe"/><text x="250" y="118" text-anchor="middle" class="svg-ink" font-size="13">Jump host</text><text x="250" y="136" text-anchor="middle" class="svg-muted" font-size="12">logged</text>
<line x1="150" y1="123" x2="190" y2="123" stroke="#64748b" stroke-width="2"/>
<line x1="310" y1="123" x2="360" y2="123" stroke="#64748b" stroke-width="3"/>
<rect x="360" y="20" width="260" height="210" rx="10" fill="#e2e8f0"/><text x="490" y="42" text-anchor="middle" class="svg-ink" font-size="13">Management network</text>
<rect x="380" y="55" width="100" height="40" rx="6" fill="#bae6fd"/><text x="430" y="80" text-anchor="middle" class="svg-ink" font-size="12">R1 / CORE</text>
<rect x="500" y="55" width="100" height="40" rx="6" fill="#fed7aa"/><text x="550" y="80" text-anchor="middle" class="svg-ink" font-size="12">ASA</text>
<rect x="380" y="110" width="100" height="40" rx="6" fill="#fed7aa"/><text x="430" y="135" text-anchor="middle" class="svg-ink" font-size="12">FTD / FMC</text>
<rect x="500" y="110" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="550" y="135" text-anchor="middle" class="svg-ink" font-size="12">ISE</text>
<rect x="380" y="165" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="430" y="190" text-anchor="middle" class="svg-ink" font-size="12">LOG / SIEM</text>
<rect x="500" y="165" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="550" y="190" text-anchor="middle" class="svg-ink" font-size="12">TIME / NMS</text>
</svg><p class="cap">Routers and firewalls are managed from one protected network through a logged jump host; users never reach it directly.</p></div>

<h3>Managing Cisco ASA securely</h3>
<p>Everything in this module applies to firewalls too, with ASA syntax. The ASA modules later in the track build on this:</p>
<pre class="code"><span class="c">! TACACS+ for admins, local fallback</span>
aaa-server ISE-TAC protocol tacacs+
aaa-server ISE-TAC (inside) host 10.10.10.100
 key NK-t4c-26
aaa authentication ssh console ISE-TAC LOCAL
aaa authentication enable console ISE-TAC LOCAL
aaa authorization exec authentication-server
aaa authorization command ISE-TAC LOCAL
aaa accounting command ISE-TAC
<span class="c">! who may manage, and how</span>
ssh 10.10.11.0 255.255.255.0 inside
ssh timeout 10
ssh key-exchange group dh-group14-sha256
ssh cipher encryption high
h&#116;tp server enable
h&#116;tp 10.10.11.0 255.255.255.0 inside
<span class="c">! SNMPv3, authenticated NTP</span>
snmp-server group NKADMIN v3 priv
snmp-server user nkadmin NKADMIN v3 auth sha AuthPass!26 priv aes 128 PrivPass!26
ntp authenticate
ntp authentication-key 1 md5 NK-Ntp-26
ntp trusted-key 1
ntp server 10.10.10.200 key 1 source inside</pre>
<p>On the ASA, SSH and ASDM access are denied by default until you list permitted source networks with <code>ssh</code> and <code>h&#116;tp</code> per interface; nothing is open "to any" unless you type it.</p>

<h3>Secure Firewall Threat Defense and Management Center</h3>
<p>Threat Defense (FTD) devices are managed from the Management Center (FMC), so hardening happens in two places. On <b>FMC</b>: role-based access control (Administrator, Network Admin, Security Analyst, read-only roles and custom roles), external authentication objects for LDAP or RADIUS so admins use central accounts, session timeouts, and the audit log exported to syslog or a SIEM. On each <b>FTD</b>, the <b>platform settings</b> policy pushes SSH access lists, SNMPv3, syslog destinations and NTP time synchronisation. The management interface belongs on the same protected management network as everything else.</p>

<div class="eg"><p><b>Worked example.</b> A quarterly upgrade of 20 routers: the engineer copies the image once to the jump host and checks its hash against the vendor value. Each router pulls it with <code>copy scp://netadmin@10.10.10.50/... bootflash:</code> using his TACACS+ account, runs <code>verify /md5</code>, and only then changes the boot variable. ISE accounting records every copy command with his username; syslog records the %SYS-5-CONFIG_I for the boot change. No TFTP server is ever started.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling <code>ip scp server enable</code> without <code>aaa authorization exec</code>. The copy fails with an authorization error even though SSH login works. The second classic: leaving a TFTP server running on the admin laptop "just for the upgrade", then forgetting it for months.</p></div>

<div class="exam"><p><b>Exam trap.</b> SCP and SFTP run over SSH on TCP 22; TFTP is UDP 69 with no authentication; FTP is TCP 21 with clear-text credentials. On ASA, management access is permitted per interface with <code>ssh</code> and <code>h&#116;tp</code> source statements.</p></div>

<div class="scn"><h4>The image that was not what it said</h4><p>A contractor downloaded an image for a branch router from an unofficial mirror because the vendor portal was slow. Before booting it, the engineer ran <code>verify /md5</code> and compared it with the vendor's published checksum: they did not match. The file was discarded and fetched from the official portal; the new hash matched and <code>show software authenticity running</code> confirmed a valid signature after the reload.</p><p><b>Lesson:</b> always verify the hash or signature of an image before installing it, whatever channel it came from.</p></div>

<div class="iv"><p class="q">"How do you upgrade a router's software securely?"</p><p>Get the image from the official vendor source, verify its hash on a jump host, transfer it with SCP or SFTP (never TFTP or FTP) using a personal AAA account, verify it again on the device with <code>verify</code>, check signature and secure boot status after reload, and make sure accounting and syslog recorded the change. Mention Resilient Configuration as protection against a wipe.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Replace TFTP and FTP with SCP, SFTP or HTTPS; the SCP server needs AAA exec authorization.</li>
<li>Verify image hashes against the vendor value and rely on signed images and secure boot.</li>
<li><code>secure boot-image</code> and <code>secure boot-config</code> protect against a malicious erase.</li>
<li>ASA: TACACS+ with LOCAL fallback, per-interface <code>ssh</code>/web access lists, SNMPv3 and authenticated NTP.</li>
<li>FMC/FTD: RBAC roles, external LDAP or RADIUS authentication, audit log export, platform settings for SSH, SNMP, syslog and NTP.</li>
</ul></div>
`,hi:`
<p>Pharmacy kisi anjaan driver ke laaye khule cardboard box mein dawai accept nahi karti. Use sealed package chahiye, jaane-pehchane supplier se, batch number ke saath jise woh check kar sake. Software images aur configuration files network ki dawai hain: unhe encrypted channel (SCP, SFTP, HTTPS) par, authenticated insaan se, aur aise hash ya signature ke saath aana chahiye jise install karne se pehle aap verify kar sako.</p>

<h3>Clear-text transfer protocols jinhe retire karna hai</h3>
<p><b>TFTP</b> (UDP 69) mein koi authentication hi nahi hai, aur <b>FTP</b> (TCP 21) password clear text mein bhejta hai. Dono configurations, jinmein keys aur hashes hote hain, path par kisi ko bhi leak karte hain. Secure replacements wahi SSH dobara use karte hain jo aap pehle harden kar chuke ho:</p>
<table class="cmp">
<tr><th>Protocol</th><th>Kis par chalta hai</th><th>Typical IOS use</th></tr>
<tr><td>SCP</td><td>SSH (TCP 22)</td><td>device server ke roop mein: laptop se router par image push; ya <code>copy scp:</code> ke saath client</td></tr>
<tr><td>SFTP</td><td>SSH (TCP 22)</td><td>device client ke roop mein: image laane ya backup save karne ke liye <code>copy sftp:</code></td></tr>
<tr><td>HTTPS</td><td>TLS (TCP 443)</td><td>controllers aur managers (Catalyst Center, FMC) jo images distribute karte hain</td></tr>
</table>

<h3>Router par SCP server</h3>
<pre class="code"><span class="c">! SCP SSH par chalta hai aur login aur exec authorization ke liye AAA use karta hai</span>
aaa new-model
aaa authentication login default group tacacs+ local
aaa authorization exec default group tacacs+ local
ip scp server enable
<span class="c">! router SCP ya SFTP client ke roop mein file kheench bhi sakta hai</span>
ip ssh source-interface GigabitEthernet0/0</pre>
<pre class="out">R1# copy scp://netadmin@10.10.10.50/images/c8000v-17.12.04.SPA.bin bootflash:
Destination filename [c8000v-17.12.04.SPA.bin]?
Password:
 Sending file modes: C0644 ...
<span class="hl">!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!</span>
<span class="hl">734003200 bytes copied in 212.4 secs</span></pre>
<p>SCP server ko <b>exec authorization</b> chahiye: jo user shell nahi le sakta woh files bhi copy nahi kar sakta. Yeh useful safety property hai, kyunki wahi TACACS+ policy jo CLI access control karti hai, file access bhi control karti hai.</p>

<h3>Image integrity aur boot protection</h3>
<pre class="code">R1# verify /md5 bootflash:c8000v-17.12.04.SPA.bin
<span class="c">! us release ke liye vendor ke published checksum se compare karo</span>
R1# show software authenticity running
<span class="c">! IOS XE: confirm karta hai ki running image par valid Cisco signature hai</span>
<span class="c">! resilient configuration: image aur config ki ek chhupi, secured copy rakho</span>
secure boot-image
secure boot-config</pre>
<p><code>verify</code> file ka hash calculate karta hai taaki aap use published value se compare kar sako, jo corruption aur tampering pakadta hai. Modern platforms aur aage jaate hain <b>signed images</b> aur hardware <b>secure boot</b> ke saath (ek trust anchor bootloader aur image ka signature chalane se pehle check karta hai). Cisco IOS Resilient Configuration feature (<code>secure boot-image</code>, <code>secure boot-config</code>) ek protected working copy rakhta hai jise <code>format</code> ya <code>erase</code> nahi hata sakta, jo malicious wipe ke khilaf useful hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Routers aur firewalls ke liye management network">
<rect x="20" y="95" width="130" height="56" rx="8" fill="#fde68a"/><text x="85" y="118" text-anchor="middle" class="svg-ink" font-size="13">Admin laptop</text><text x="85" y="136" text-anchor="middle" class="svg-muted" font-size="12">MFA + VPN</text>
<rect x="190" y="95" width="120" height="56" rx="8" fill="#ddd6fe"/><text x="250" y="118" text-anchor="middle" class="svg-ink" font-size="13">Jump host</text><text x="250" y="136" text-anchor="middle" class="svg-muted" font-size="12">logged</text>
<line x1="150" y1="123" x2="190" y2="123" stroke="#64748b" stroke-width="2"/>
<line x1="310" y1="123" x2="360" y2="123" stroke="#64748b" stroke-width="3"/>
<rect x="360" y="20" width="260" height="210" rx="10" fill="#e2e8f0"/><text x="490" y="42" text-anchor="middle" class="svg-ink" font-size="13">Management network</text>
<rect x="380" y="55" width="100" height="40" rx="6" fill="#bae6fd"/><text x="430" y="80" text-anchor="middle" class="svg-ink" font-size="12">R1 / CORE</text>
<rect x="500" y="55" width="100" height="40" rx="6" fill="#fed7aa"/><text x="550" y="80" text-anchor="middle" class="svg-ink" font-size="12">ASA</text>
<rect x="380" y="110" width="100" height="40" rx="6" fill="#fed7aa"/><text x="430" y="135" text-anchor="middle" class="svg-ink" font-size="12">FTD / FMC</text>
<rect x="500" y="110" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="550" y="135" text-anchor="middle" class="svg-ink" font-size="12">ISE</text>
<rect x="380" y="165" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="430" y="190" text-anchor="middle" class="svg-ink" font-size="12">LOG / SIEM</text>
<rect x="500" y="165" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="550" y="190" text-anchor="middle" class="svg-ink" font-size="12">TIME / NMS</text>
</svg><p class="cap">Routers aur firewalls ek protected network se logged jump host ke through manage hote hain; users seedhe wahan kabhi nahi pahunchte.</p></div>

<h3>Cisco ASA ko securely manage karna</h3>
<p>Is module ki har cheez firewalls par bhi lagti hai, ASA syntax ke saath. Track ke baad ke ASA modules isi par build karte hain:</p>
<pre class="code"><span class="c">! admins ke liye TACACS+, local fallback</span>
aaa-server ISE-TAC protocol tacacs+
aaa-server ISE-TAC (inside) host 10.10.10.100
 key NK-t4c-26
aaa authentication ssh console ISE-TAC LOCAL
aaa authentication enable console ISE-TAC LOCAL
aaa authorization exec authentication-server
aaa authorization command ISE-TAC LOCAL
aaa accounting command ISE-TAC
<span class="c">! kaun manage kar sakta hai, aur kaise</span>
ssh 10.10.11.0 255.255.255.0 inside
ssh timeout 10
ssh key-exchange group dh-group14-sha256
ssh cipher encryption high
h&#116;tp server enable
h&#116;tp 10.10.11.0 255.255.255.0 inside
<span class="c">! SNMPv3, authenticated NTP</span>
snmp-server group NKADMIN v3 priv
snmp-server user nkadmin NKADMIN v3 auth sha AuthPass!26 priv aes 128 PrivPass!26
ntp authenticate
ntp authentication-key 1 md5 NK-Ntp-26
ntp trusted-key 1
ntp server 10.10.10.200 key 1 source inside</pre>
<p>ASA par SSH aur ASDM access default mein deny hota hai jab tak aap har interface ke liye <code>ssh</code> aur <code>h&#116;tp</code> se permitted source networks list na karo; kuch bhi "any" ke liye khula nahi hota jab tak aap khud type na karo.</p>

<h3>Secure Firewall Threat Defense aur Management Center</h3>
<p>Threat Defense (FTD) devices Management Center (FMC) se manage hote hain, isliye hardening do jagah hoti hai. <b>FMC</b> par: role-based access control (Administrator, Network Admin, Security Analyst, read-only roles aur custom roles), LDAP ya RADIUS ke liye external authentication objects taaki admins central accounts use karein, session timeouts, aur syslog ya SIEM ko export hone wala audit log. Har <b>FTD</b> par <b>platform settings</b> policy SSH access lists, SNMPv3, syslog destinations aur NTP time synchronisation push karti hai. Management interface baaki sab ki tarah usi protected management network par hona chahiye.</p>

<div class="eg"><p><b>Worked example.</b> 20 routers ka quarterly upgrade: engineer image ek baar jump host par copy karta hai aur uska hash vendor value se check karta hai. Har router apne TACACS+ account se <code>copy scp://netadmin@10.10.10.50/... bootflash:</code> se use kheenchta hai, <code>verify /md5</code> chalata hai, aur tab hi boot variable badalta hai. ISE accounting har copy command uske username ke saath record karta hai; syslog boot change ke liye %SYS-5-CONFIG_I record karta hai. Koi TFTP server kabhi start nahi hota.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>aaa authorization exec</code> ke bina <code>ip scp server enable</code> enable karna. SSH login chalne ke bawajood copy authorization error ke saath fail hota hai. Doosri classic: admin laptop par "sirf upgrade ke liye" TFTP server chalta chhodna, phir mahino tak bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> SCP aur SFTP TCP 22 par SSH ke upar chalte hain; TFTP UDP 69 hai bina authentication; FTP TCP 21 hai clear-text credentials ke saath. ASA par management access har interface ke liye <code>ssh</code> aur <code>h&#116;tp</code> source statements se permit hota hai.</p></div>

<div class="scn"><h4>Woh image jo woh nahi thi jo keh rahi thi</h4><p>Ek contractor ne branch router ke liye image ek unofficial mirror se download ki kyunki vendor portal slow tha. Boot karne se pehle engineer ne <code>verify /md5</code> chalaya aur vendor ke published checksum se compare kiya: match nahi hua. File discard ki gayi aur official portal se laayi gayi; naya hash match hua aur reload ke baad <code>show software authenticity running</code> ne valid signature confirm kiya.</p><p><b>Seekh:</b> image install karne se pehle hamesha uska hash ya signature verify karo, chahe woh kisi bhi channel se aayi ho.</p></div>

<div class="iv"><p class="q">"Router ka software securely kaise upgrade karte ho?"</p><p>Image official vendor source se lo, jump host par uska hash verify karo, personal AAA account se SCP ya SFTP (kabhi TFTP ya FTP nahi) se transfer karo, device par <code>verify</code> se dobara verify karo, reload ke baad signature aur secure boot status check karo, aur pakka karo ki accounting aur syslog ne change record kiya. Wipe ke khilaf protection ke roop mein Resilient Configuration ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>TFTP aur FTP ko SCP, SFTP ya HTTPS se replace karo; SCP server ko AAA exec authorization chahiye.</li>
<li>Image hashes ko vendor value se verify karo aur signed images aur secure boot par bharosa karo.</li>
<li><code>secure boot-image</code> aur <code>secure boot-config</code> malicious erase se bachate hain.</li>
<li>ASA: LOCAL fallback ke saath TACACS+, per-interface <code>ssh</code>/web access lists, SNMPv3 aur authenticated NTP.</li>
<li>FMC/FTD: RBAC roles, external LDAP ya RADIUS authentication, audit log export, SSH, SNMP, syslog aur NTP ke liye platform settings.</li>
</ul></div>
`}};export{e as default};