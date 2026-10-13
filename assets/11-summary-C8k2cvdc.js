var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with a router that anyone could reach over Telnet with a shared password. You now know how to turn it into a device that only the NOC can manage, over encrypted SSH, with personal accounts, central AAA and verified software. This chapter pulls everything together for revision, the lab and the exam.</p>

<h3>Can you do all of this?</h3>
<ul>
<li>Explain the management, control and data planes and name management-plane threats.</li>
<li>Harden console, AUX and every VTY range; set <code>exec-timeout</code>.</li>
<li>Recognise password types 0, 5, 7, 8, 9 in a configuration and say which are reversible.</li>
<li>Create local users with <code>privilege</code> and <code>secret</code>; apply <code>login local</code> safely.</li>
<li>Enable SSHv2 in the right order and verify it with <code>show ip ssh</code>, <code>show ssh</code>, <code>show users</code>.</li>
<li>Restrict VTY access with a standard ACL and <code>access-class</code>; add <code>login block-for</code> with a quiet-mode exception.</li>
<li>Write a legal banner and disable unused services.</li>
<li>Explain in-band vs out-of-band management and design a management VLAN.</li>
<li>Compare RADIUS and TACACS+; configure <code>aaa new-model</code> with a method list and local fallback.</li>
<li>Copy files with SCP/SFTP and verify an IOS image with <code>verify /md5</code>.</li>
<li>Troubleshoot "cannot SSH" by symptom: timeout, refused, negotiation, login failure.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Hardening layers summary">
<rect x="20" y="10" width="600" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">Verified image and secure file transfer (SCP/SFTP, verify /md5)</text>
<rect x="40" y="46" width="560" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="66" text-anchor="middle" class="svg-ink" font-size="13">AAA: TACACS+ for admins, RADIUS for access, local fallback</text>
<rect x="60" y="82" width="520" height="30" rx="6" fill="#bae6fd"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">Fewer services, OOB or management VLAN</text>
<rect x="80" y="118" width="480" height="30" rx="6" fill="#fde68a"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="13">access-class, login block-for, legal banner</text>
<rect x="100" y="154" width="440" height="30" rx="6" fill="#fed7aa"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="13">SSHv2 only (transport input ssh)</text>
<rect x="120" y="190" width="400" height="30" rx="6" fill="#e2e8f0"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">Personal users, type 9 secrets, timeouts</text>
<text x="320" y="242" text-anchor="middle" class="svg-muted" font-size="12">build from the bottom up; each layer assumes the one below</text>
</svg><p class="cap">Defence in depth for the management plane.</p></div>

<h3>Command cheat-sheet: a fully hardened EDGE</h3>
<pre class="code">hostname EDGE
ip domain name nwk.lab
crypto key generate rsa modulus 2048
ip ssh version 2
ip ssh time-out 60
ip ssh authentication-retries 3
<span class="c">! real IOS: add algorithm-type scrypt to force type 9; the lab accepts the plain form</span>
enable secret En@ble2026
username netadmin privilege 15 secret N0c!Admin26
security passwords min-length 10
service password-encryption
login block-for 120 attempts 3 within 60
login quiet-mode access-class 15
login on-failure log
access-list 15 permit 10.99.99.0 0.0.0.255
banner motd #Authorised access only. Activity is logged.#
no ip h&#116;tp server
no ip h&#116;tp secure-server
line con 0
 login local
 exec-timeout 5 0
line aux 0
 transport input none
 no exec
line vty 0 4
 login local
 transport input ssh
 access-class 15 in
 exec-timeout 5 0
<span class="c">! optional central AAA</span>
aaa new-model
aaa authentication login default group NK-TACS local
aaa authentication login CONSOLE local
aaa authorization exec default group NK-TACS local
aaa accounting commands 15 default start-stop group NK-TACS
line con 0
 login authentication CONSOLE</pre>

<pre class="out">EDGE# show ip ssh
<span class="hl">SSH Enabled - version 2.0</span>
EDGE# show users
    Line       User       Host(s)              Idle       Location
<span class="hl">*  2 vty 0     netadmin   idle                 00:00:00 10.99.99.10</span></pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Management plane</dt><dd>Traffic used to administer a device: console, SSH, SNMP, syslog, NTP, file transfer.</dd>
<dt>VTY</dt><dd>Virtual terminal lines used by Telnet and SSH sessions.</dd>
<dt>Type 7 / type 9</dt><dd>Reversible Cisco encoding / scrypt one-way hash.</dd>
<dt>access-class</dt><dd>Applies a standard ACL to VTY lines to filter sources.</dd>
<dt>Quiet mode</dt><dd>Period after repeated failed logins when new logins are refused.</dd>
<dt>OOB management</dt><dd>A management path separate from the production network.</dd>
<dt>AAA</dt><dd>Authentication, authorization, accounting.</dd>
<dt>Method list</dt><dd>Ordered list of AAA methods; the next is used only if the previous one does not respond.</dd>
<dt>SCP / SFTP</dt><dd>Secure file transfer protocols running inside SSH on TCP 22.</dd>
<dt>Hash (MD5, SHA-512)</dt><dd>File fingerprint used to prove an image is complete and unmodified.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>SSH order</td><td>hostname, ip domain name, crypto key generate rsa, ip ssh version 2</td></tr>
<tr><td>Key size</td><td>At least 768 bits for SSHv2; 2048 recommended</td></tr>
<tr><td>Ports</td><td>SSH/SCP/SFTP TCP 22, Telnet TCP 23, TFTP UDP 69, FTP TCP 20/21, TACACS+ TCP 49, RADIUS UDP 1812/1813</td></tr>
<tr><td>Secrets</td><td>Type 7 reversible; 5, 8, 9 hashed; enable secret beats enable password</td></tr>
<tr><td>Lines</td><td><code>login</code> = line password; <code>login local</code> = local users; <code>transport input ssh</code> = no Telnet</td></tr>
<tr><td>VTY ACL</td><td>Standard ACL with <code>access-class N in</code>, not <code>ip access-group</code></td></tr>
<tr><td>TACACS+ vs RADIUS</td><td>TACACS+: TCP, full encryption, separate AAA, device admin. RADIUS: UDP, password only, combined, network access</td></tr>
<tr><td>Fallback</td><td>Next method only on ERROR (no response), never on FAIL (reject)</td></tr>
<tr><td>Password alternatives</td><td>MFA, certificates, biometrics</td></tr>
</table>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> Applying <code>login local</code> or <code>aaa new-model</code> without a local user; forgetting vty 5 15; subnet mask instead of wildcard in the VTY ACL; AAA list without <code>local</code>; believing type 7 is secure; rebooting into an image whose hash was never checked.</p></div>

<div class="exam"><p><b>Exam traps recap.</b> "Connection refused" with working ping means VTY config, not routing. <code>service password-encryption</code> never touches the enable secret. The default AAA list applies to all lines; named lists only where assigned. The IOS SCP server needs AAA. OOB is a separate path; a management VLAN is still in-band.</p></div>

<div class="scn"><h4>The audit that passed in one afternoon</h4><p>A company facing a compliance audit had 80 routers and switches with mixed configurations. The team wrote one hardening template from this module's cheat-sheet, tested it on two lab devices, rolled it out to a pilot site with <code>reload in 15</code> as a safety net, then pushed it everywhere with automation. The auditor's checklist (SSH only, personal accounts, no type 7, VTY restricted, banners, TACACS+ accounting, verified images) was satisfied by one show-command report per device.</p><p><b>Lesson:</b> hardening is a repeatable template, not a one-off effort. Build it once, test it, apply it everywhere.</p></div>

<div class="iv"><p class="q">"Give me your hardening checklist for a new Cisco switch."</p><p>Strong answer, in order: hostname and domain; RSA 2048 and SSHv2; enable secret and local break-glass user with scrypt; <code>login local</code> or AAA with local fallback; <code>transport input ssh</code>, <code>access-class</code> and exec-timeout on all VTY lines; console timeout and AUX disabled; <code>login block-for</code>; legal banner; disable HTTP server and CDP/LLDP on untrusted ports; management VLAN (not VLAN 1) or OOB; NTP, syslog and SNMPv3; verify image hash; save and back up with SCP. Next up is the ccna-sec-concepts module: threats, mitigation techniques and VPNs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Harden in layers: secrets, users, SSH, source filtering, login protection, fewer services, AAA, verified files.</li>
<li>Always keep a way back in: console or OOB, a local emergency user, <code>reload in</code> during risky changes.</li>
<li>Memorise the ports and the TACACS+ vs RADIUS table.</li>
<li>Troubleshoot SSH by the exact client symptom.</li>
<li>Next module: ccna-sec-concepts, where these controls fit into the wider security picture.</li>
</ul></div>
`,hi:`
<p>Aapne ek aise router se shuru kiya tha jise koi bhi shared password ke saath Telnet par reach kar sakta tha. Ab aap jaante ho ki use aise device mein kaise badlein jise sirf NOC manage kar sake, encrypted SSH par, personal accounts, central AAA aur verified software ke saath. Yeh chapter revision, lab aur exam ke liye sab kuch ek saath laata hai.</p>

<h3>Kya aap yeh sab kar sakte ho?</h3>
<ul>
<li>Management, control aur data planes samjhana aur management-plane threats ke naam batana.</li>
<li>Console, AUX aur har VTY range harden karna; <code>exec-timeout</code> set karna.</li>
<li>Configuration mein password types 0, 5, 7, 8, 9 pehchanna aur batana ki kaunse reversible hain.</li>
<li><code>privilege</code> aur <code>secret</code> ke saath local users banana; <code>login local</code> safely lagana.</li>
<li>SSHv2 sahi order mein enable karna aur <code>show ip ssh</code>, <code>show ssh</code>, <code>show users</code> se verify karna.</li>
<li>Standard ACL aur <code>access-class</code> se VTY access restrict karna; quiet-mode exception ke saath <code>login block-for</code> add karna.</li>
<li>Legal banner likhna aur unused services disable karna.</li>
<li>In-band vs out-of-band management samjhana aur management VLAN design karna.</li>
<li>RADIUS aur TACACS+ compare karna; method list aur local fallback ke saath <code>aaa new-model</code> configure karna.</li>
<li>SCP/SFTP se files copy karna aur <code>verify /md5</code> se IOS image verify karna.</li>
<li>"SSH nahi ho raha" ko symptom se troubleshoot karna: timeout, refused, negotiation, login failure.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Hardening layers summary">
<rect x="20" y="10" width="600" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">Verified image aur secure file transfer (SCP/SFTP, verify /md5)</text>
<rect x="40" y="46" width="560" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="66" text-anchor="middle" class="svg-ink" font-size="13">AAA: admins ke liye TACACS+, access ke liye RADIUS, local fallback</text>
<rect x="60" y="82" width="520" height="30" rx="6" fill="#bae6fd"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">Kam services, OOB ya management VLAN</text>
<rect x="80" y="118" width="480" height="30" rx="6" fill="#fde68a"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="13">access-class, login block-for, legal banner</text>
<rect x="100" y="154" width="440" height="30" rx="6" fill="#fed7aa"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="13">Sirf SSHv2 (transport input ssh)</text>
<rect x="120" y="190" width="400" height="30" rx="6" fill="#e2e8f0"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">Personal users, type 9 secrets, timeouts</text>
<text x="320" y="242" text-anchor="middle" class="svg-muted" font-size="12">neeche se upar banao; har layer neeche wali ko maan kar chalti hai</text>
</svg><p class="cap">Management plane ke liye defence in depth.</p></div>

<h3>Command cheat-sheet: poori tarah hardened EDGE</h3>
<pre class="code">hostname EDGE
ip domain name nwk.lab
crypto key generate rsa modulus 2048
ip ssh version 2
ip ssh time-out 60
ip ssh authentication-retries 3
<span class="c">! real IOS: type 9 force karne ke liye algorithm-type scrypt jodo; lab plain form leta hai</span>
enable secret En@ble2026
username netadmin privilege 15 secret N0c!Admin26
security passwords min-length 10
service password-encryption
login block-for 120 attempts 3 within 60
login quiet-mode access-class 15
login on-failure log
access-list 15 permit 10.99.99.0 0.0.0.255
banner motd #Authorised access only. Activity is logged.#
no ip h&#116;tp server
no ip h&#116;tp secure-server
line con 0
 login local
 exec-timeout 5 0
line aux 0
 transport input none
 no exec
line vty 0 4
 login local
 transport input ssh
 access-class 15 in
 exec-timeout 5 0
<span class="c">! optional central AAA</span>
aaa new-model
aaa authentication login default group NK-TACS local
aaa authentication login CONSOLE local
aaa authorization exec default group NK-TACS local
aaa accounting commands 15 default start-stop group NK-TACS
line con 0
 login authentication CONSOLE</pre>

<pre class="out">EDGE# show ip ssh
<span class="hl">SSH Enabled - version 2.0</span>
EDGE# show users
    Line       User       Host(s)              Idle       Location
<span class="hl">*  2 vty 0     netadmin   idle                 00:00:00 10.99.99.10</span></pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Management plane</dt><dd>Device administer karne wala traffic: console, SSH, SNMP, syslog, NTP, file transfer.</dd>
<dt>VTY</dt><dd>Virtual terminal lines jo Telnet aur SSH sessions use karte hain.</dd>
<dt>Type 7 / type 9</dt><dd>Reversible Cisco encoding / scrypt one-way hash.</dd>
<dt>access-class</dt><dd>Sources filter karne ke liye VTY lines par standard ACL lagata hai.</dd>
<dt>Quiet mode</dt><dd>Baar baar failed logins ke baad ka period jab naye logins refuse hote hain.</dd>
<dt>OOB management</dt><dd>Production network se alag management path.</dd>
<dt>AAA</dt><dd>Authentication, authorization, accounting.</dd>
<dt>Method list</dt><dd>AAA methods ki ordered list; agla sirf tab use hota hai jab pichhla jawab na de.</dd>
<dt>SCP / SFTP</dt><dd>TCP 22 par SSH ke andar chalne wale secure file transfer protocols.</dd>
<dt>Hash (MD5, SHA-512)</dt><dd>File fingerprint jo prove karta hai ki image poori aur bina badlaav ke hai.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>SSH order</td><td>hostname, ip domain name, crypto key generate rsa, ip ssh version 2</td></tr>
<tr><td>Key size</td><td>SSHv2 ke liye kam se kam 768 bits; 2048 recommended</td></tr>
<tr><td>Ports</td><td>SSH/SCP/SFTP TCP 22, Telnet TCP 23, TFTP UDP 69, FTP TCP 20/21, TACACS+ TCP 49, RADIUS UDP 1812/1813</td></tr>
<tr><td>Secrets</td><td>Type 7 reversible; 5, 8, 9 hashed; enable secret enable password par bhaari</td></tr>
<tr><td>Lines</td><td><code>login</code> = line password; <code>login local</code> = local users; <code>transport input ssh</code> = Telnet nahi</td></tr>
<tr><td>VTY ACL</td><td><code>access-class N in</code> ke saath standard ACL, <code>ip access-group</code> nahi</td></tr>
<tr><td>TACACS+ vs RADIUS</td><td>TACACS+: TCP, full encryption, alag AAA, device admin. RADIUS: UDP, sirf password, combined, network access</td></tr>
<tr><td>Fallback</td><td>Agla method sirf ERROR (jawab nahi) par, FAIL (reject) par kabhi nahi</td></tr>
<tr><td>Password alternatives</td><td>MFA, certificates, biometrics</td></tr>
</table>

<div class="warn"><p><b>Aakhri minute ki galtiyan jinse bachna hai.</b> Local user ke bina <code>login local</code> ya <code>aaa new-model</code> lagana; vty 5 15 bhoolna; VTY ACL mein wildcard ki jagah subnet mask; <code>local</code> ke bina AAA list; type 7 ko secure maanna; aisi image mein reboot karna jiska hash kabhi check nahi hua.</p></div>

<div class="exam"><p><b>Exam traps recap.</b> Ping chalte hue "Connection refused" ka matlab VTY config, routing nahi. <code>service password-encryption</code> enable secret ko kabhi nahi chhoota. Default AAA list saari lines par lagti hai; named lists sirf jahan assign hon. IOS SCP server ko AAA chahiye. OOB alag path hai; management VLAN abhi bhi in-band hai.</p></div>

<div class="scn"><h4>Audit jo ek dopahar mein pass hua</h4><p>Compliance audit ka saamna kar rahi ek company ke 80 routers aur switches mixed configurations ke saath the. Team ne is module ki cheat-sheet se ek hardening template likha, do lab devices par test kiya, safety net ke roop mein <code>reload in 15</code> ke saath pilot site par roll out kiya, phir automation se har jagah push kiya. Auditor ki checklist (sirf SSH, personal accounts, type 7 nahi, VTY restricted, banners, TACACS+ accounting, verified images) har device ki ek show-command report se satisfy ho gayi.</p><p><b>Seekh:</b> hardening ek repeatable template hai, ek baar ki koshish nahi. Ek baar banao, test karo, har jagah lagao.</p></div>

<div class="iv"><p class="q">"Naye Cisco switch ke liye apni hardening checklist batao."</p><p>Strong answer, order mein: hostname aur domain; RSA 2048 aur SSHv2; enable secret aur scrypt ke saath local break-glass user; <code>login local</code> ya local fallback ke saath AAA; saari VTY lines par <code>transport input ssh</code>, <code>access-class</code> aur exec-timeout; console timeout aur AUX disabled; <code>login block-for</code>; legal banner; HTTP server aur untrusted ports par CDP/LLDP disable; management VLAN (VLAN 1 nahi) ya OOB; NTP, syslog aur SNMPv3; image hash verify; save aur SCP se backup. Agla module ccna-sec-concepts hai: threats, mitigation techniques aur VPNs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layers mein harden karo: secrets, users, SSH, source filtering, login protection, kam services, AAA, verified files.</li>
<li>Hamesha wapas aane ka raasta rakho: console ya OOB, local emergency user, risky changes ke dauraan <code>reload in</code>.</li>
<li>Ports aur TACACS+ vs RADIUS table yaad karo.</li>
<li>SSH ko client ke exact symptom se troubleshoot karo.</li>
<li>Agla module: ccna-sec-concepts, jahan yeh controls badi security picture mein fit hote hain.</li>
</ul></div>
`}};export{e as default};