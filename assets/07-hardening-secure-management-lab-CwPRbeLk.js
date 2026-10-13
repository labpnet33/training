var e={id:`hardening-lab`,h:{en:`Device hardening and Lab 1: secure management access`,hi:`Device hardening aur Lab 1: secure management access`},body:{en:`
<p>When you move into a rented flat, the first things you do are change the locks (the previous tenant may still have a key), close the windows you never use, and give keys only to family. Hardening a network device is the same job: change default credentials, disable unused ports and services, use secure protocols, and let only the right people manage it from the right place.</p>

<h3>The hardening checklist</h3>
<table class="cmp"><tr><th>Area</th><th>What to do</th><th>Example on a Cisco-style CLI</th></tr>
<tr><td>Default passwords</td><td>Change every default account and password; use hashed secrets</td><td><code>enable secret</code>, <code>username ... secret</code></td></tr>
<tr><td>Secure protocols</td><td>SSH not Telnet, HTTPS not HTTP, SNMPv3 not v1/v2c, SFTP/SCP not FTP/TFTP</td><td><code>transport input ssh</code></td></tr>
<tr><td>Unused services</td><td>Turn off what you do not use</td><td><code>no ip h&#116;tp server</code>, <code>no cdp enable</code> on internet-facing interfaces</td></tr>
<tr><td>Unused ports</td><td>Shut them and park them in an unused VLAN</td><td><code>shutdown</code>, <code>switchport access vlan 999</code></td></tr>
<tr><td>Management access</td><td>Restrict to an admin subnet or jump host; idle timeouts; banners</td><td><code>access-class 10 in</code>, <code>exec-timeout 10 0</code></td></tr>
<tr><td>Maintenance</td><td>Patch firmware, back up configs, send logs to syslog, sync time with NTP</td><td><code>logging host</code>, <code>ntp server</code></td></tr>
</table>
<p>Two more lines worth knowing: <code>service password-encryption</code> obscures older type 7 passwords in the config (weak, but better than plain text), and <code>ip ssh version 2</code> disables the old SSH version 1 in production. Neither is required in Lab 1.</p>

<h3>Lab 1: the audit finding</h3>
<p>The edge router EDGE accepts Telnet from anywhere with the shared password cisco. Your job: enable SSH with a local admin account, disable Telnet, and allow management only from the admin network 10.0.99.0/24 where PC-ADMIN lives. Users on 10.0.10.0/24 (PC-USER) must not be able to log in.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Lab 1 topology">
<rect x="10" y="25" width="150" height="50" rx="10" fill="#bbf7d0"/><text x="85" y="48" text-anchor="middle" class="svg-ink" font-size="13">PC-ADMIN</text><text x="85" y="66" text-anchor="middle" class="svg-muted" font-size="12">10.0.99.10/24</text>
<rect x="10" y="125" width="150" height="50" rx="10" fill="#fed7aa"/><text x="85" y="148" text-anchor="middle" class="svg-ink" font-size="13">PC-USER</text><text x="85" y="166" text-anchor="middle" class="svg-muted" font-size="12">10.0.10.10/24</text>
<rect x="400" y="70" width="150" height="60" rx="10" fill="#bae6fd"/><text x="475" y="97" text-anchor="middle" class="svg-ink" font-size="14">EDGE</text><text x="475" y="116" text-anchor="middle" class="svg-muted" font-size="12">VTY: SSH + ACL 10</text>
<line x1="160" y1="50" x2="400" y2="90" stroke="#64748b" stroke-width="2"/><line x1="160" y1="150" x2="400" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="290" y="55" text-anchor="middle" class="svg-accent" font-size="12">Gi0/0 10.0.99.1 SSH allowed</text>
<text x="290" y="155" text-anchor="middle" class="svg-accent" font-size="12">Gi0/1 10.0.10.1 refused</text>
</svg><p class="cap">Management is allowed by source subnet, whichever router address the user targets.</p></div>

<h3>Step 1: identity and keys</h3>
<pre class="code">Router&gt; enable
Router# configure terminal
Router(config)# hostname EDGE
EDGE(config)# ip domain name nwk.lab
EDGE(config)# crypto key generate rsa modulus 2048</pre>
<p>The RSA key is named EDGE.nwk.lab, so hostname and domain must exist first. When the key is created, SSH is enabled automatically.</p>

<h3>Step 2: local account and SSH-only VTY lines</h3>
<pre class="code">EDGE(config)# username admin privilege 15 secret Adm1n!2026
EDGE(config)# line vty 0 4
EDGE(config-line)# login local          <span class="c">! use the local user database, not the line password</span>
EDGE(config-line)# transport input ssh  <span class="c">! Telnet is no longer accepted</span></pre>
<p><code>secret</code> stores a strong hash; <code>password</code> would store weak or plain text. <code>privilege 15</code> puts admin straight into privileged EXEC. The old line password cisco is now ignored, because <code>login local</code> replaced <code>login</code>.</p>

<h3>Step 3: restrict who may connect</h3>
<pre class="code">EDGE(config-line)# exit
EDGE(config)# access-list 10 permit 10.0.99.0 0.0.0.255
EDGE(config)# line vty 0 4
EDGE(config-line)# access-class 10 in
EDGE(config-line)# end</pre>
<p>A <b>standard ACL</b> matches only the source address, which is exactly what we need: "who is allowed to open a session". <code>access-class</code> applies it to the VTY lines, so it filters management sessions to the router itself, no matter which router interface address the user targets. Everything else hits the implicit deny.</p>

<h3>Step 4: verify</h3>
<pre class="out">EDGE# show ip ssh
<span class="hl">SSH Enabled - version 1.99</span>
Authentication methods:publickey,keyboard-interactive,password
Authentication timeout: 120 secs; Authentication retries: 3

EDGE# show running-config | section line vty
line vty 0 4
<span class="hl"> access-class 10 in</span>
 password cisco
<span class="hl"> login local</span>
<span class="hl"> transport input ssh</span>

EDGE# show access-lists 10
Standard IP access list 10
<span class="hl">    10 permit 10.0.99.0, wildcard bits 0.0.0.255 (2 matches)</span></pre>
<p>Now test from both PCs:</p>
<pre class="out">PC-ADMIN&gt; ssh -l admin 10.0.99.1
Password:
<span class="hl">EDGE#</span> exit

PC-USER&gt; ssh -l admin 10.0.10.1
<span class="hl">% Connection refused by remote host</span></pre>
<p>PC-USER is refused even though it targets the router's own gateway address on its subnet: <code>access-class</code> checks the source, 10.0.10.10, which is not in 10.0.99.0/24. A Telnet attempt fails too, because Telnet is no longer an allowed transport and the source is denied anyway.</p>

<div class="warn"><p><b>Common mistakes.</b> Using <code>ip access-group 10 in</code> on an interface instead of <code>access-class</code> on the lines; that would filter all traffic through the interface, not just management. Typing <code>login</code> instead of <code>login local</code>, so the router still asks for the line password. Configuring SSH on a remote device before creating the local user, and locking yourself out. Forgetting to apply the ACL to all VTY lines on devices with lines 0 15.</p></div>

<div class="exam"><p><b>Exam trap.</b> SSH is TCP 22 and encrypted; Telnet is TCP 23 and clear text. On the exam, "prevent credentials being captured when administering a switch" means replace Telnet with SSH. "Restrict management to one subnet" means an ACL on the VTY lines. An ACL with only permit lines still denies everything else through the implicit deny.</p></div>

<div class="scn"><h4>The pen-test report</h4><p>A penetration tester connected to a guest port and captured a Telnet session from a helpdesk PC to a core switch; the enable password was visible in the capture. The network team applied this lab's template to every device: SSH with local users (later TACACS+), <code>transport input ssh</code>, a VTY ACL permitting only the admin subnet and the jump host, and unused ports shut. The re-test showed no management service reachable from any user or guest VLAN.</p><p><b>Lesson:</b> a short, repeatable hardening template applied everywhere beats a perfect configuration on one device.</p></div>

<div class="iv"><p class="q">"Walk me through securing remote access to a new router."</p><p>Hostname and domain, RSA 2048 keys, a local user with a secret at privilege 15, VTY lines with <code>login local</code> and <code>transport input ssh</code>, a standard ACL of the admin subnet applied with <code>access-class in</code>, then verify with <code>show ip ssh</code>, a test from an allowed host and a refused test from a user host. Mention exec-timeout, disabling the web server, AAA for scale, and keeping a console path open while you change it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hardening = change defaults, secure protocols, disable unused services and ports, restrict management, patch and log.</li>
<li>SSH needs hostname, domain, RSA keys and a local user; <code>transport input ssh</code> blocks Telnet.</li>
<li><code>login local</code> uses the username database; <code>secret</code> stores a strong hash.</li>
<li><code>access-class 10 in</code> filters VTY sessions by source; <code>ip access-group</code> is for interfaces.</li>
<li>Always prove it: allowed host succeeds, other hosts are refused.</li>
</ul></div>
`,hi:`
<p>Jab aap kiraye ke flat mein shift hote ho, sabse pehle taale badalte ho (pichhle kirayedaar ke paas chaabi ho sakti hai), jo khidkiyan kabhi use nahi karte unhe band karte ho, aur chaabiyan sirf family ko dete ho. Network device ko harden karna bhi yahi kaam hai: default credentials badlo, unused ports aur services band karo, secure protocols use karo, aur sirf sahi logon ko sahi jagah se manage karne do.</p>

<h3>Hardening checklist</h3>
<table class="cmp"><tr><th>Area</th><th>Kya karna hai</th><th>Cisco-style CLI par example</th></tr>
<tr><td>Default passwords</td><td>Har default account aur password badlo; hashed secrets use karo</td><td><code>enable secret</code>, <code>username ... secret</code></td></tr>
<tr><td>Secure protocols</td><td>Telnet nahi SSH, HTTP nahi HTTPS, v1/v2c nahi SNMPv3, FTP/TFTP nahi SFTP/SCP</td><td><code>transport input ssh</code></td></tr>
<tr><td>Unused services</td><td>Jo use nahi karte use band karo</td><td><code>no ip h&#116;tp server</code>, internet-facing interfaces par <code>no cdp enable</code></td></tr>
<tr><td>Unused ports</td><td>Unhe shut karo aur unused VLAN mein park karo</td><td><code>shutdown</code>, <code>switchport access vlan 999</code></td></tr>
<tr><td>Management access</td><td>Admin subnet ya jump host tak seemit; idle timeouts; banners</td><td><code>access-class 10 in</code>, <code>exec-timeout 10 0</code></td></tr>
<tr><td>Maintenance</td><td>Firmware patch karo, configs backup karo, logs syslog ko bhejo, NTP se time sync karo</td><td><code>logging host</code>, <code>ntp server</code></td></tr>
</table>
<p>Do aur lines jaanne layak: <code>service password-encryption</code> config mein purane type 7 passwords ko chhupata hai (kamzor, lekin plain text se behtar), aur <code>ip ssh version 2</code> production mein purana SSH version 1 disable karta hai. Lab 1 mein dono zaroori nahi hain.</p>

<h3>Lab 1: audit finding</h3>
<p>Edge router EDGE shared password cisco ke saath kahin se bhi Telnet accept karta hai. Aapka kaam: local admin account ke saath SSH enable karo, Telnet band karo, aur management sirf admin network 10.0.99.0/24 se allow karo jahan PC-ADMIN hai. 10.0.10.0/24 (PC-USER) ke users login na kar sakein.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Lab 1 topology">
<rect x="10" y="25" width="150" height="50" rx="10" fill="#bbf7d0"/><text x="85" y="48" text-anchor="middle" class="svg-ink" font-size="13">PC-ADMIN</text><text x="85" y="66" text-anchor="middle" class="svg-muted" font-size="12">10.0.99.10/24</text>
<rect x="10" y="125" width="150" height="50" rx="10" fill="#fed7aa"/><text x="85" y="148" text-anchor="middle" class="svg-ink" font-size="13">PC-USER</text><text x="85" y="166" text-anchor="middle" class="svg-muted" font-size="12">10.0.10.10/24</text>
<rect x="400" y="70" width="150" height="60" rx="10" fill="#bae6fd"/><text x="475" y="97" text-anchor="middle" class="svg-ink" font-size="14">EDGE</text><text x="475" y="116" text-anchor="middle" class="svg-muted" font-size="12">VTY: SSH + ACL 10</text>
<line x1="160" y1="50" x2="400" y2="90" stroke="#64748b" stroke-width="2"/><line x1="160" y1="150" x2="400" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="290" y="55" text-anchor="middle" class="svg-accent" font-size="12">Gi0/0 10.0.99.1 SSH allowed</text>
<text x="290" y="155" text-anchor="middle" class="svg-accent" font-size="12">Gi0/1 10.0.10.1 refused</text>
</svg><p class="cap">Management source subnet ke hisaab se allow hota hai, user router ka koi bhi address target kare.</p></div>

<h3>Step 1: identity aur keys</h3>
<pre class="code">Router&gt; enable
Router# configure terminal
Router(config)# hostname EDGE
EDGE(config)# ip domain name nwk.lab
EDGE(config)# crypto key generate rsa modulus 2048</pre>
<p>RSA key ka naam EDGE.nwk.lab hota hai, isliye hostname aur domain pehle hone chahiye. Key bante hi SSH apne aap enable ho jaata hai.</p>

<h3>Step 2: local account aur sirf-SSH VTY lines</h3>
<pre class="code">EDGE(config)# username admin privilege 15 secret Adm1n!2026
EDGE(config)# line vty 0 4
EDGE(config-line)# login local          <span class="c">! use the local user database, not the line password</span>
EDGE(config-line)# transport input ssh  <span class="c">! Telnet is no longer accepted</span></pre>
<p><code>secret</code> ek strong hash store karta hai; <code>password</code> kamzor ya plain text store karta. <code>privilege 15</code> admin ko seedha privileged EXEC mein le jaata hai. Purana line password cisco ab ignore hota hai, kyunki <code>login local</code> ne <code>login</code> ki jagah le li.</p>

<h3>Step 3: kaun connect kar sakta hai, seemit karo</h3>
<pre class="code">EDGE(config-line)# exit
EDGE(config)# access-list 10 permit 10.0.99.0 0.0.0.255
EDGE(config)# line vty 0 4
EDGE(config-line)# access-class 10 in
EDGE(config-line)# end</pre>
<p><b>Standard ACL</b> sirf source address match karti hai, jo bilkul wahi hai jo humein chahiye: "session kholne ki permission kise hai". <code>access-class</code> ise VTY lines par lagata hai, isliye yeh router ke apne management sessions filter karta hai, user router ka koi bhi interface address target kare. Baaki sab implicit deny se takrata hai.</p>

<h3>Step 4: verify karo</h3>
<pre class="out">EDGE# show ip ssh
<span class="hl">SSH Enabled - version 1.99</span>
Authentication methods:publickey,keyboard-interactive,password
Authentication timeout: 120 secs; Authentication retries: 3

EDGE# show running-config | section line vty
line vty 0 4
<span class="hl"> access-class 10 in</span>
 password cisco
<span class="hl"> login local</span>
<span class="hl"> transport input ssh</span>

EDGE# show access-lists 10
Standard IP access list 10
<span class="hl">    10 permit 10.0.99.0, wildcard bits 0.0.0.255 (2 matches)</span></pre>
<p>Ab dono PCs se test karo:</p>
<pre class="out">PC-ADMIN&gt; ssh -l admin 10.0.99.1
Password:
<span class="hl">EDGE#</span> exit

PC-USER&gt; ssh -l admin 10.0.10.1
<span class="hl">% Connection refused by remote host</span></pre>
<p>PC-USER refuse hota hai jabki woh apne subnet par router ka apna gateway address target kar raha hai: <code>access-class</code> source check karta hai, 10.0.10.10, jo 10.0.99.0/24 mein nahi hai. Telnet attempt bhi fail hota hai, kyunki Telnet ab allowed transport nahi hai aur source waise bhi deny hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Lines par <code>access-class</code> ki jagah interface par <code>ip access-group 10 in</code> use karna; yeh interface se jaane wala saara traffic filter karega, sirf management nahi. <code>login local</code> ki jagah <code>login</code> type karna, jisse router ab bhi line password maangta hai. Local user banane se pehle remote device par SSH configure karke khud ko lock out kar lena. Lines 0 15 wale devices par ACL ko saari VTY lines par lagana bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> SSH TCP 22 aur encrypted hai; Telnet TCP 23 aur clear text. Exam mein "switch administer karte waqt credentials capture hone se roko" ka matlab hai Telnet ko SSH se badlo. "Management ko ek subnet tak seemit karo" ka matlab hai VTY lines par ACL. Sirf permit lines wali ACL bhi implicit deny se baaki sab deny karti hai.</p></div>

<div class="scn"><h4>Pen-test report</h4><p>Ek penetration tester ne guest port se connect karke helpdesk PC se core switch tak ka Telnet session capture kiya; enable password capture mein dikh raha tha. Network team ne is lab ka template har device par lagaya: local users ke saath SSH (baad mein TACACS+), <code>transport input ssh</code>, sirf admin subnet aur jump host ko permit karne wala VTY ACL, aur unused ports shut. Re-test mein kisi bhi user ya guest VLAN se koi management service reachable nahi thi.</p><p><b>Seekh:</b> har jagah laga chhota, repeatable hardening template ek device par perfect configuration se behtar hai.</p></div>

<div class="iv"><p class="q">"Naye router par remote access secure karne ke steps batao."</p><p>Hostname aur domain, RSA 2048 keys, privilege 15 par secret wala local user, <code>login local</code> aur <code>transport input ssh</code> wali VTY lines, admin subnet ki standard ACL jo <code>access-class in</code> se lagi ho, phir <code>show ip ssh</code>, allowed host se test aur user host se refused test se verify karo. Exec-timeout, web server disable karna, scale ke liye AAA, aur change karte waqt console path khula rakhne ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hardening = defaults badlo, secure protocols, unused services aur ports band, management seemit, patch aur log.</li>
<li>SSH ko hostname, domain, RSA keys aur local user chahiye; <code>transport input ssh</code> Telnet block karta hai.</li>
<li><code>login local</code> username database use karta hai; <code>secret</code> strong hash store karta hai.</li>
<li><code>access-class 10 in</code> VTY sessions ko source se filter karta hai; <code>ip access-group</code> interfaces ke liye hai.</li>
<li>Hamesha prove karo: allowed host succeed kare, baaki hosts refuse hon.</li>
</ul></div>
`}};export{e as default};