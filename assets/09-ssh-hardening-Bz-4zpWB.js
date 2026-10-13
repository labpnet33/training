var e={id:`ssh-hardening`,h:{en:`SSH hardening: version 2, key size, ciphers, timeouts and access-class`,hi:`SSH hardening: version 2, key size, ciphers, timeouts aur access-class`},body:{en:`
<p>Turning on SSH is like fitting a strong front door. Hardening SSH is everything else a locksmith would check: is the lock a modern design (version 2, strong ciphers), is the key long enough (RSA size), does the door close by itself (timeouts), does it only open for residents (access-class), and does the building lock down after someone tries ten wrong keys (login block-for)?</p>

<h3>Step 1: the prerequisites</h3>
<p>SSH needs a hostname that is not the default, a domain name, and an RSA key pair. The key size matters: 1024-bit RSA is considered weak today, and many hardening baselines require at least 2048 bits. Lab 1 deliberately starts R1 with a 1024-bit key so you can spot it; in production generate 2048 or 3072 bits.</p>
<pre class="code">hostname R1
ip domain name nk.example
<span class="c">! named key pair, 3072 bits (2048 is the common minimum)</span>
crypto key generate rsa general-keys label SSH-KEY modulus 3072
ip ssh rsa keypair-name SSH-KEY
ip ssh version 2</pre>

<h3>Step 2: tighten the SSH server</h3>
<pre class="code"><span class="c">! seconds allowed to finish authentication, and attempts per connection</span>
ip ssh time-out 60
ip ssh authentication-retries 2
<span class="c">! modern algorithms only</span>
ip ssh server algorithm encryption aes256-ctr aes192-ctr aes128-ctr
ip ssh server algorithm mac hmac-sha2-256 hmac-sha2-512
ip ssh server algorithm kex ecdh-sha2-nistp384 ecdh-sha2-nistp256
ip ssh dh min size 2048
ip ssh source-interface GigabitEthernet0/0</pre>
<p>Removing CBC ciphers, HMAC-SHA1 and small Diffie-Hellman groups clears the most common findings of vulnerability scanners. The exact algorithm list depends on the software release; newer releases also offer GCM ciphers. For admins who log in often, <b>public-key authentication</b> (<code>ip ssh pubkey-chain</code>, one key per user) avoids passwords entirely, while AAA still authorizes and accounts for the session.</p>

<h3>Step 3: lock down the lines</h3>
<pre class="code">ip access-list standard MGMT-ONLY
 permit 10.10.10.0 0.0.0.255
 permit 10.10.11.0 0.0.0.255
 deny   any log
<span class="c">! all VTY lines, not only 0 4</span>
line vty 0 15
 access-class MGMT-ONLY in
 transport input ssh
 exec-timeout 10 0
 login authentication default
line aux 0
 transport input none
 no exec
<span class="c">! brute-force protection</span>
login block-for 60 attempts 3 within 30
login quiet-mode access-class MGMT-ONLY
login delay 2
banner login ^C Authorised access only. Activity is logged. ^C</pre>
<p><b>access-class</b> on the VTY lines is the single most effective control: SSH from anywhere outside the management subnets is refused before a password prompt appears. Apply it to <b>all</b> VTY lines; many platforms have 0 to 15 or more, and an attacker simply uses a line you forgot. <code>exec-timeout 10 0</code> closes idle sessions after 10 minutes. <b>login block-for 60 attempts 3 within 30</b> starts a 60-second <b>quiet period</b> after 3 failures in 30 seconds; <code>login quiet-mode access-class</code> lets the management subnet in even during quiet mode, so an attack cannot lock out the real admins.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="SSH hardening layers">
<rect x="20" y="20" width="600" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">CoPP and iACL: is TCP 22 even allowed to reach the CPU?</text>
<rect x="50" y="64" width="540" height="36" rx="8" fill="#bae6fd"/><text x="320" y="87" text-anchor="middle" class="svg-ink" font-size="13">access-class MGMT-ONLY: is the source a management subnet?</text>
<rect x="80" y="108" width="480" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="131" text-anchor="middle" class="svg-ink" font-size="13">SSHv2 with strong ciphers, 3072-bit host key</text>
<rect x="110" y="152" width="420" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">AAA login + login block-for + time-out</text>
<rect x="140" y="196" width="360" height="36" rx="8" fill="#fde68a"/><text x="320" y="219" text-anchor="middle" class="svg-ink" font-size="13">authorization, accounting, exec-timeout</text>
</svg><p class="cap">Defence in depth for remote access: each layer stops attempts the previous one let through.</p></div>

<h3>Step 4: close the other doors</h3>
<ul>
<li><code>no ip h&#116;tp server</code>: disable the clear-text web server. If you need the web UI or RESTCONF, use <code>ip h&#116;tp secure-server</code> with <code>ip h&#116;tp authentication aaa</code> and an access-class.</li>
<li>No Telnet anywhere: <code>transport input ssh</code> on every VTY line, and never <code>transport input all</code>.</li>
<li>Unused services off: <code>no service pad</code>, <code>no ip bootp server</code>, <code>no cdp run</code> or per-interface <code>no cdp enable</code> on untrusted edges.</li>
</ul>

<h3>Verification</h3>
<pre class="out">R1# show ip ssh
<span class="hl">SSH Enabled - version 2.0</span>
Authentication methods:publickey,keyboard-interactive,password
Encryption Algorithms:aes256-ctr,aes192-ctr,aes128-ctr
MAC Algorithms:hmac-sha2-256,hmac-sha2-512
KEX Algorithms:ecdh-sha2-nistp384,ecdh-sha2-nistp256
<span class="hl">Authentication timeout: 60 secs; Authentication retries: 2</span>
Minimum expected Diffie Hellman key size : 2048 bits

R1# show login
     A login delay of 2 seconds is applied.
     Quiet-Mode access list MGMT-ONLY is applied.
     Router enabled to watch for login Attacks.
<span class="hl">     If more than 3 login failures occur in 30 seconds or less,</span>
<span class="hl">     logins will be disabled for 60 seconds.</span>
     Router presently in Normal-Mode.</pre>
<p>During an attack, syslog shows <code>%SEC_LOGIN-1-QUIET_MODE_ON</code> with the source address, and <code>show login</code> reports Quiet-Mode.</p>

<div class="eg"><p><b>Worked example (Lab 4, task 2).</b> R1 arrives with no SSH at all. You set <code>ip domain-name nk.local</code>, generate a 2048-bit RSA key, enter <code>ip ssh version 2</code>, set <code>transport input ssh</code> under <code>line vty 0 4</code>, and add <code>login block-for 60 attempts 3 within 30</code> and <code>no ip h&#116;tp server</code>. The lab checks the three SSH lines; the audit in chapter 11 checks the HTTP line. In production you would also add the access-class, the timeouts and the cipher list above.</p></div>

<div class="warn"><p><b>Common mistake.</b> Hardening <code>line vty 0 4</code> but leaving <code>line vty 5 15</code> with <code>transport input telnet</code> and no access-class. Scanners and attackers find the weak lines quickly. Configure the full range the platform has.</p></div>

<div class="exam"><p><b>Exam trap.</b> SSH needs a hostname, a domain name and an RSA key; <code>ip ssh version 2</code> requires a key of at least 768 bits, but best practice is 2048 or more. <code>access-class</code> filters lines; <code>access-group</code> filters interfaces. <code>login block-for</code> blocks all logins during quiet mode unless a quiet-mode access-class exempts trusted sources.</p></div>

<div class="scn"><h4>The scanner report with 40 findings</h4><p>An internal vulnerability scan flagged every access switch for "SSH weak algorithms supported" (CBC ciphers, hmac-sha1, diffie-hellman-group1) and "SSH host key smaller than 2048 bits". The team pushed a template that regenerated 3072-bit keys, restricted encryption, MAC and key-exchange algorithms, set <code>ip ssh dh min size 2048</code>, and added access-class to all 16 VTY lines. The next scan was clean, and one old jump host that only supported CBC had to be upgraded.</p><p><b>Lesson:</b> enabling SSHv2 is not the end; key size, algorithms and line restrictions are what auditors actually test.</p></div>

<div class="iv"><p class="q">"You have enabled SSH on a router. What else would you do to harden remote management?"</p><p>List: 2048+ bit RSA key, SSHv2 only, restricted ciphers, MACs and KEX, authentication timeout and retries, access-class with a management ACL on all VTY lines, exec-timeout, login block-for with a quiet-mode exception, AAA with TACACS+, HTTP server disabled, and CoPP or iACLs so only the management network can reach TCP 22.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSH needs hostname, domain name and an RSA key; use 2048 bits minimum, 3072 preferred.</li>
<li>Force version 2, restrict encryption, MAC and KEX algorithms, and set time-out and retries.</li>
<li>Apply <code>access-class</code>, <code>transport input ssh</code> and <code>exec-timeout</code> to every VTY line.</li>
<li><code>login block-for</code> slows brute force; a quiet-mode access-class keeps admins able to log in.</li>
<li>Disable the clear-text web server and other unused services.</li>
</ul></div>
`,hi:`
<p>SSH on karna ek mazboot front door lagane jaisa hai. SSH ko harden karna woh sab kuch hai jo ek locksmith check karega: kya lock modern design ka hai (version 2, strong ciphers), kya key kaafi lambi hai (RSA size), kya darwaza khud band hota hai (timeouts), kya woh sirf residents ke liye khulta hai (access-class), aur kya das galat keys try hone ke baad building lock ho jaati hai (login block-for)?</p>

<h3>Step 1: prerequisites</h3>
<p>SSH ko ek aisa hostname chahiye jo default na ho, ek domain name, aur ek RSA key pair. Key size matter karta hai: 1024-bit RSA aaj kamzor maana jaata hai, aur kai hardening baselines kam se kam 2048 bits maangti hain. Lab 1 jaan-boojh kar R1 ko 1024-bit key ke saath shuru karta hai taaki aap use pakad sako; production mein 2048 ya 3072 bits generate karo.</p>
<pre class="code">hostname R1
ip domain name nk.example
<span class="c">! named key pair, 3072 bits (2048 common minimum hai)</span>
crypto key generate rsa general-keys label SSH-KEY modulus 3072
ip ssh rsa keypair-name SSH-KEY
ip ssh version 2</pre>

<h3>Step 2: SSH server ko tight karo</h3>
<pre class="code"><span class="c">! authentication poora karne ke seconds, aur har connection par attempts</span>
ip ssh time-out 60
ip ssh authentication-retries 2
<span class="c">! sirf modern algorithms</span>
ip ssh server algorithm encryption aes256-ctr aes192-ctr aes128-ctr
ip ssh server algorithm mac hmac-sha2-256 hmac-sha2-512
ip ssh server algorithm kex ecdh-sha2-nistp384 ecdh-sha2-nistp256
ip ssh dh min size 2048
ip ssh source-interface GigabitEthernet0/0</pre>
<p>CBC ciphers, HMAC-SHA1 aur chhote Diffie-Hellman groups hatane se vulnerability scanners ke sabse common findings saaf ho jaate hain. Exact algorithm list software release par depend karti hai; naye releases GCM ciphers bhi dete hain. Jo admins aksar login karte hain unke liye <b>public-key authentication</b> (<code>ip ssh pubkey-chain</code>, har user ki ek key) passwords se poori tarah bachata hai, jabki AAA abhi bhi session authorize aur account karta hai.</p>

<h3>Step 3: lines lock karo</h3>
<pre class="code">ip access-list standard MGMT-ONLY
 permit 10.10.10.0 0.0.0.255
 permit 10.10.11.0 0.0.0.255
 deny   any log
<span class="c">! saari VTY lines, sirf 0 4 nahi</span>
line vty 0 15
 access-class MGMT-ONLY in
 transport input ssh
 exec-timeout 10 0
 login authentication default
line aux 0
 transport input none
 no exec
<span class="c">! brute-force protection</span>
login block-for 60 attempts 3 within 30
login quiet-mode access-class MGMT-ONLY
login delay 2
banner login ^C Authorised access only. Activity is logged. ^C</pre>
<p>VTY lines par <b>access-class</b> sabse asardaar single control hai: management subnets ke bahar kahin se bhi SSH password prompt aane se pehle hi refuse ho jaata hai. Ise <b>saari</b> VTY lines par lagao; kai platforms par 0 se 15 ya zyada hoti hain, aur attacker bas woh line use karta hai jo aap bhool gaye. <code>exec-timeout 10 0</code> idle sessions ko 10 minute baad band karta hai. <b>login block-for 60 attempts 3 within 30</b> 30 seconds mein 3 failures ke baad 60-second ka <b>quiet period</b> shuru karta hai; <code>login quiet-mode access-class</code> quiet mode ke dauraan bhi management subnet ko andar aane deta hai, taaki attack asli admins ko lock out na kar sake.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="SSH hardening layers">
<rect x="20" y="20" width="600" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">CoPP aur iACL: kya TCP 22 CPU tak pahunch bhi sakta hai?</text>
<rect x="50" y="64" width="540" height="36" rx="8" fill="#bae6fd"/><text x="320" y="87" text-anchor="middle" class="svg-ink" font-size="13">access-class MGMT-ONLY: kya source management subnet hai?</text>
<rect x="80" y="108" width="480" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="131" text-anchor="middle" class="svg-ink" font-size="13">Strong ciphers ke saath SSHv2, 3072-bit host key</text>
<rect x="110" y="152" width="420" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">AAA login + login block-for + time-out</text>
<rect x="140" y="196" width="360" height="36" rx="8" fill="#fde68a"/><text x="320" y="219" text-anchor="middle" class="svg-ink" font-size="13">authorization, accounting, exec-timeout</text>
</svg><p class="cap">Remote access ke liye defence in depth: har layer woh attempts rokti hai jo pichhli ne jaane diye.</p></div>

<h3>Step 4: baaki darwaze band karo</h3>
<ul>
<li><code>no ip h&#116;tp server</code>: clear-text web server band karo. Agar web UI ya RESTCONF chahiye, to <code>ip h&#116;tp authentication aaa</code> aur access-class ke saath <code>ip h&#116;tp secure-server</code> use karo.</li>
<li>Kahin bhi Telnet nahi: har VTY line par <code>transport input ssh</code>, aur kabhi <code>transport input all</code> nahi.</li>
<li>Unused services off: <code>no service pad</code>, <code>no ip bootp server</code>, untrusted edges par <code>no cdp run</code> ya per-interface <code>no cdp enable</code>.</li>
</ul>

<h3>Verification</h3>
<pre class="out">R1# show ip ssh
<span class="hl">SSH Enabled - version 2.0</span>
Authentication methods:publickey,keyboard-interactive,password
Encryption Algorithms:aes256-ctr,aes192-ctr,aes128-ctr
MAC Algorithms:hmac-sha2-256,hmac-sha2-512
KEX Algorithms:ecdh-sha2-nistp384,ecdh-sha2-nistp256
<span class="hl">Authentication timeout: 60 secs; Authentication retries: 2</span>
Minimum expected Diffie Hellman key size : 2048 bits

R1# show login
     A login delay of 2 seconds is applied.
     Quiet-Mode access list MGMT-ONLY is applied.
     Router enabled to watch for login Attacks.
<span class="hl">     If more than 3 login failures occur in 30 seconds or less,</span>
<span class="hl">     logins will be disabled for 60 seconds.</span>
     Router presently in Normal-Mode.</pre>
<p>Attack ke dauraan syslog source address ke saath <code>%SEC_LOGIN-1-QUIET_MODE_ON</code> dikhata hai, aur <code>show login</code> Quiet-Mode report karta hai.</p>

<div class="eg"><p><b>Worked example (Lab 4, task 2).</b> R1 bina kisi SSH ke aata hai. Aap <code>ip domain-name nk.local</code> set karte ho, 2048-bit RSA key generate karte ho, <code>ip ssh version 2</code> daalte ho, <code>line vty 0 4</code> ke neeche <code>transport input ssh</code> set karte ho, aur <code>login block-for 60 attempts 3 within 30</code> aur <code>no ip h&#116;tp server</code> jodte ho. Lab teen SSH lines check karta hai; chapter 11 ka audit HTTP line check karta hai. Production mein aap upar wale access-class, timeouts aur cipher list bhi jodoge.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>line vty 0 4</code> harden karna par <code>line vty 5 15</code> ko <code>transport input telnet</code> aur bina access-class ke chhod dena. Scanners aur attackers kamzor lines jaldi dhoondh lete hain. Platform ki poori range configure karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> SSH ko hostname, domain name aur RSA key chahiye; <code>ip ssh version 2</code> ko kam se kam 768 bits ki key chahiye, par best practice 2048 ya zyada hai. <code>access-class</code> lines filter karta hai; <code>access-group</code> interfaces filter karta hai. <code>login block-for</code> quiet mode mein saare logins block karta hai jab tak quiet-mode access-class trusted sources ko chhoot na de.</p></div>

<div class="scn"><h4>40 findings wali scanner report</h4><p>Ek internal vulnerability scan ne har access switch ko "SSH weak algorithms supported" (CBC ciphers, hmac-sha1, diffie-hellman-group1) aur "SSH host key 2048 bits se chhoti" ke liye flag kiya. Team ne ek template push kiya jisne 3072-bit keys dobara banayi, encryption, MAC aur key-exchange algorithms restrict kiye, <code>ip ssh dh min size 2048</code> set kiya, aur saari 16 VTY lines par access-class joda. Agla scan clean tha, aur ek purana jump host jo sirf CBC support karta tha use upgrade karna pada.</p><p><b>Seekh:</b> SSHv2 enable karna ant nahi hai; key size, algorithms aur line restrictions hi woh cheezein hain jo auditors sach mein test karte hain.</p></div>

<div class="iv"><p class="q">"Aapne router par SSH enable kar diya. Remote management harden karne ke liye aur kya karoge?"</p><p>List karo: 2048+ bit RSA key, sirf SSHv2, restricted ciphers, MACs aur KEX, authentication timeout aur retries, saari VTY lines par management ACL ke saath access-class, exec-timeout, quiet-mode exception ke saath login block-for, TACACS+ ke saath AAA, HTTP server disabled, aur CoPP ya iACLs taaki sirf management network TCP 22 tak pahunch sake.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSH ko hostname, domain name aur RSA key chahiye; minimum 2048 bits use karo, 3072 preferred.</li>
<li>Version 2 force karo, encryption, MAC aur KEX algorithms restrict karo, aur time-out aur retries set karo.</li>
<li>Har VTY line par <code>access-class</code>, <code>transport input ssh</code> aur <code>exec-timeout</code> lagao.</li>
<li><code>login block-for</code> brute force slow karta hai; quiet-mode access-class admins ko login karne deta hai.</li>
<li>Clear-text web server aur doosri unused services band karo.</li>
</ul></div>
`}};export{e as default};