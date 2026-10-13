var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Back at the bank branch from chapter 1. The staff entrance now checks a personal badge against head office (AAA with TACACS+), the badge decides which rooms open (exec and command authorization), every door logs who passed (accounting), the doors between rooms have precise lists (ACLs), a receptionist protects the manager from crowds (CoPP), the programs at the back window must show a valid, short-lived pass (REST API tokens over HTTPS), and the sealed master key is used only when head office cannot be reached (break-glass fallback on ERROR).</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Layers of device protection">
<rect x="10" y="20" width="150" height="60" rx="8" fill="#e2e8f0"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="13">VTY / lines</text><text x="85" y="64" text-anchor="middle" class="svg-muted" font-size="12">SSH, access-class</text>
<rect x="170" y="20" width="150" height="60" rx="8" fill="#bae6fd"/><text x="245" y="45" text-anchor="middle" class="svg-ink" font-size="13">AAA</text><text x="245" y="64" text-anchor="middle" class="svg-muted" font-size="12">TACACS+, RADIUS</text>
<rect x="330" y="20" width="150" height="60" rx="8" fill="#ddd6fe"/><text x="405" y="45" text-anchor="middle" class="svg-ink" font-size="13">ACLs</text><text x="405" y="64" text-anchor="middle" class="svg-muted" font-size="12">filters, selectors</text>
<rect x="490" y="20" width="140" height="60" rx="8" fill="#fed7aa"/><text x="560" y="45" text-anchor="middle" class="svg-ink" font-size="13">CoPP</text><text x="560" y="64" text-anchor="middle" class="svg-muted" font-size="12">police the CPU</text>
<rect x="170" y="110" width="310" height="50" rx="8" fill="#bbf7d0"/><text x="325" y="133" text-anchor="middle" class="svg-ink" font-size="13">REST APIs: HTTPS, tokens, RBAC</text><text x="325" y="150" text-anchor="middle" class="svg-muted" font-size="12">the same AAA ideas for programs</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">Who (AAA), what (ACLs), how much (CoPP)</text>
</svg><p class="cap">The whole module on one page.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Name the data, control and management planes and the protection for each.</li>
<li>Configure SSH version 2 (hostname, domain, 2048-bit RSA key), <code>transport input ssh</code>, exec-timeout, login block-for and a VTY access-class on all lines.</li>
<li>Explain privilege levels 0, 1 and 15 and move commands to a custom level.</li>
<li>Create local users with <code>algorithm-type scrypt secret</code>; explain types 0, 5, 6, 7, 8 and 9.</li>
<li>Enable <code>aaa new-model</code> safely and predict its effect on lines.</li>
<li>Write default and named method lists for login, enable, exec and commands, and apply named lists to lines.</li>
<li>Compare TACACS+ and RADIUS: ports, protection, separation, command authorization, use cases.</li>
<li>Define servers and server groups with source interface and VRF, and test with <code>test aaa</code>.</li>
<li>Explain fallback on ERROR only, and run a break-glass account correctly.</li>
<li>Configure exec and command authorization and exec/command accounting, with sensible fallbacks.</li>
<li>Write named, object-group, time-based and IPv6 ACLs; explain reflexive ACLs; apply VTY ACLs.</li>
<li>Build, attach, verify and safely roll out a CoPP policy.</li>
<li>Describe REST API security: HTTPS/TLS, Basic authentication risk, tokens, API keys, RBAC, 401 versus 403.</li>
<li>Troubleshoot AAA using rejects versus timeouts, and CoPP using per-class counters.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>AAA</dt><dd>Authentication, authorization, accounting.</dd>
<dt>NAS</dt><dd>Network access server: the router or switch acting as AAA client.</dd>
<dt>Method list</dt><dd>Ordered methods for one AAA service; next method only on ERROR.</dd>
<dt>ERROR vs FAIL</dt><dd>No answer from the servers versus an authoritative reject.</dd>
<dt>Break-glass account</dt><dd>A single local emergency account, used only when AAA servers are unreachable.</dd>
<dt>Type 9</dt><dd>scrypt one-way hash for local secrets; type 7 is reversible.</dd>
<dt>Punt</dt><dd>Hand a packet from the forwarding path to the CPU.</dd>
<dt>CoPP</dt><dd>MQC policy on the control-plane that polices punted traffic.</dd>
<dt>Object group</dt><dd>Named set of addresses or services used in ACL entries.</dd>
<dt>Bearer token</dt><dd>Short-lived credential sent in a header instead of a password.</dd>
<dt>RBAC</dt><dd>Role-based access control: permissions by role, least privilege.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>TACACS+</td><td>TCP 49, whole body protected, separate A's, per-command authorization</td></tr>
<tr><td>RADIUS</td><td>UDP 1812/1813 (legacy 1645/1646), only password hidden, authen + author combined</td></tr>
<tr><td>Fallback</td><td>Next method only on ERROR; a FAIL ends the login</td></tr>
<tr><td>Privilege from server</td><td>Needs <code>aaa authorization exec</code>; console needs <code>aaa authorization console</code></td></tr>
<tr><td>aaa new-model</td><td>No default list means the local database; line passwords ignored</td></tr>
<tr><td>Password types</td><td>7 reversible, 5 MD5, 8 PBKDF2, 9 scrypt, 6 AES reversible with master key</td></tr>
<tr><td>IPv6 ACL</td><td><code>ipv6 traffic-filter</code>; implicit ND permits before implicit deny</td></tr>
<tr><td>CoPP</td><td><code>control-plane</code> + <code>service-policy input</code>; verify <code>show policy-map control-plane</code></td></tr>
<tr><td>REST</td><td>HTTPS 443; 401 not authenticated, 403 not authorized; base64 is not encryption</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">ip ssh version 2 / crypto key generate rsa modulus 2048
line vty 0 15 / transport input ssh / access-class VTY-MGMT in / exec-timeout 10 0
username backup privilege 15 algorithm-type scrypt secret Backup#26
aaa new-model
tacacs server ISE1 / address ipv4 10.10.10.100 / key NK-t4c-26
aaa group server tacacs+ ADMIN-TAC / server name ISE1 / ip tacacs source-interface Gi0/1
aaa authentication login default group tacacs+ local
aaa authorization exec default group tacacs+ local
aaa authorization commands 15 default group tacacs+ if-authenticated
aaa accounting exec default start-stop group tacacs+
aaa accounting commands 15 default start-stop group tacacs+
test aaa group tacacs+ netadmin Adm!n-26 legacy
show aaa servers / show tacacs / debug aaa authentication / debug radius
ipv6 traffic-filter NAME in / ipv6 access-class NAME in
control-plane / service-policy input COPP
show policy-map control-plane
ip h&#116;tp secure-server / no ip h&#116;tp server / restconf</pre>

<div class="eg"><p><b>Worked example.</b> Exam-style reasoning. "Users authenticate via RADIUS, the server returns cisco-av-pair shell:priv-lvl=15, users land at level 1, and when the server is down the local admin can log in but gets level 1 too." One missing command explains both: <code>aaa authorization exec default group radius local</code>.</p></div>

<div class="warn"><p><b>Common mistake.</b> Studying only configuration. Many questions give output (<code>show aaa servers</code>, <code>show policy-map control-plane</code>, <code>show ip access-lists</code>) and ask what is wrong. Practise reading counters.</p></div>

<div class="exam"><p><b>Exam trap.</b> Watch for "the server rejected the user, so the router tried local" in answer options: always wrong. Also "CoPP applied outbound on an interface": wrong; CoPP is input on the control-plane.</p></div>

<div class="scn"><h4>The hardening sprint</h4><p>A mid-sized company gave its network team two weeks to pass a security audit. They followed this module in order: SSH only with VTY ACLs on every device, type 9 local secrets with one break-glass account per device, AAA with TACACS+ for administrators and command accounting, RADIUS kept for 802.1X, CoPP rolled out in monitor mode and then enforcing, and the controller API moved to tokens over HTTPS with per-tool accounts. The audit passed with one finding: the break-glass password had not been rotated after a test. They added rotation to the runbook.</p><p><b>Lesson:</b> device security is a set of small, well-understood controls, applied consistently and verified.</p></div>

<div class="iv"><p class="q">"You join a company where every router uses one shared enable password. What do you change first?"</p><p>A strong answer prioritises: SSH only and VTY ACLs immediately, then personal accounts through AAA (TACACS+ for device admin, with exec and command authorization and accounting), a single type 9 break-glass account per device with a correct <code>group tacacs+ local</code> list, CoPP in monitor mode then enforcing, and API access via HTTPS with tokens and RBAC. Mention rolling out safely with a second session open.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Lines: SSH only, all VTYs, access-class, timeouts; privilege levels 0, 1, 15 plus custom.</li>
<li>Local secrets as type 9; one break-glass account that works only when servers do not answer.</li>
<li>AAA: method lists, TACACS+ for admin with command authorization and accounting, RADIUS for network access.</li>
<li>ACLs: named, object groups, time-ranges, IPv6 specifics, VTY access-class; CoPP polices punted traffic.</li>
<li>REST APIs: HTTPS, tokens over Basic authentication, RBAC, secrets in a vault.</li>
</ul></div>
`,hi:`
<p>Chapter 1 ki bank branch par wapas. Staff entrance ab personal badge ko head office se check karta hai (TACACS+ ke saath AAA), badge tay karta hai kaunse kamre khulenge (exec aur command authorization), har darwaza log karta hai kaun guzra (accounting), kamron ke beech ke darwazon par sateek lists hain (ACLs), ek receptionist manager ko bheed se bachata hai (CoPP), peeche ki khidki par programs ko valid, chhoti umar ka pass dikhana padta hai (HTTPS par REST API tokens), aur sealed master key sirf tab use hoti hai jab head office tak pahuncha na jaa sake (ERROR par break-glass fallback).</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Device protection ki layers">
<rect x="10" y="20" width="150" height="60" rx="8" fill="#e2e8f0"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="13">VTY / lines</text><text x="85" y="64" text-anchor="middle" class="svg-muted" font-size="12">SSH, access-class</text>
<rect x="170" y="20" width="150" height="60" rx="8" fill="#bae6fd"/><text x="245" y="45" text-anchor="middle" class="svg-ink" font-size="13">AAA</text><text x="245" y="64" text-anchor="middle" class="svg-muted" font-size="12">TACACS+, RADIUS</text>
<rect x="330" y="20" width="150" height="60" rx="8" fill="#ddd6fe"/><text x="405" y="45" text-anchor="middle" class="svg-ink" font-size="13">ACLs</text><text x="405" y="64" text-anchor="middle" class="svg-muted" font-size="12">filters, selectors</text>
<rect x="490" y="20" width="140" height="60" rx="8" fill="#fed7aa"/><text x="560" y="45" text-anchor="middle" class="svg-ink" font-size="13">CoPP</text><text x="560" y="64" text-anchor="middle" class="svg-muted" font-size="12">CPU ko police karo</text>
<rect x="170" y="110" width="310" height="50" rx="8" fill="#bbf7d0"/><text x="325" y="133" text-anchor="middle" class="svg-ink" font-size="13">REST APIs: HTTPS, tokens, RBAC</text><text x="325" y="150" text-anchor="middle" class="svg-muted" font-size="12">programs ke liye wahi AAA ideas</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">Kaun (AAA), kya (ACLs), kitna (CoPP)</text>
</svg><p class="cap">Poora module ek page par.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Data, control aur management planes aur har ek ki suraksha ka naam lo.</li>
<li>SSH version 2 (hostname, domain, 2048-bit RSA key), <code>transport input ssh</code>, exec-timeout, login block-for aur saari lines par VTY access-class configure karo.</li>
<li>Privilege levels 0, 1 aur 15 samjhao aur commands ko custom level par move karo.</li>
<li><code>algorithm-type scrypt secret</code> ke saath local users banao; types 0, 5, 6, 7, 8 aur 9 samjhao.</li>
<li><code>aaa new-model</code> safely chalu karo aur lines par uska asar predict karo.</li>
<li>Login, enable, exec aur commands ke liye default aur named method lists likho, aur named lists ko lines par lagao.</li>
<li>TACACS+ aur RADIUS compare karo: ports, protection, separation, command authorization, use cases.</li>
<li>Source interface aur VRF ke saath servers aur server groups define karo, aur <code>test aaa</code> se test karo.</li>
<li>Sirf ERROR par fallback samjhao, aur break-glass account sahi tarike se chalao.</li>
<li>Samajhdaar fallbacks ke saath exec aur command authorization aur exec/command accounting configure karo.</li>
<li>Named, object-group, time-based aur IPv6 ACLs likho; reflexive ACLs samjhao; VTY ACLs lagao.</li>
<li>CoPP policy banao, lagao, verify karo aur safely roll out karo.</li>
<li>REST API security describe karo: HTTPS/TLS, Basic authentication ka risk, tokens, API keys, RBAC, 401 vs 403.</li>
<li>Rejects vs timeouts se AAA, aur per-class counters se CoPP troubleshoot karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>AAA</dt><dd>Authentication, authorization, accounting.</dd>
<dt>NAS</dt><dd>Network access server: AAA client ki tarah kaam karne wala router ya switch.</dd>
<dt>Method list</dt><dd>Ek AAA service ke ordered methods; agla method sirf ERROR par.</dd>
<dt>ERROR vs FAIL</dt><dd>Servers se koi jawab nahi vs pakka reject.</dd>
<dt>Break-glass account</dt><dd>Ek akela local emergency account, sirf tab use jab AAA servers unreachable hon.</dd>
<dt>Type 9</dt><dd>Local secrets ke liye scrypt one-way hash; type 7 ulta ho sakta hai.</dd>
<dt>Punt</dt><dd>Packet ko forwarding path se CPU ko saunpna.</dd>
<dt>CoPP</dt><dd>Control-plane par MQC policy jo punted traffic police karti hai.</dd>
<dt>Object group</dt><dd>ACL entries mein use hone wala addresses ya services ka named set.</dd>
<dt>Bearer token</dt><dd>Password ki jagah header mein bheja jaane wala chhoti umar ka credential.</dd>
<dt>RBAC</dt><dd>Role-based access control: role ke hisaab se permissions, least privilege.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>TACACS+</td><td>TCP 49, poori body protected, alag A's, per-command authorization</td></tr>
<tr><td>RADIUS</td><td>UDP 1812/1813 (purane 1645/1646), sirf password chhupa, authen + author saath</td></tr>
<tr><td>Fallback</td><td>Agla method sirf ERROR par; FAIL login khatam karta hai</td></tr>
<tr><td>Server se privilege</td><td><code>aaa authorization exec</code> chahiye; console ko <code>aaa authorization console</code> chahiye</td></tr>
<tr><td>aaa new-model</td><td>Default list nahi to local database; line passwords ignore</td></tr>
<tr><td>Password types</td><td>7 reversible, 5 MD5, 8 PBKDF2, 9 scrypt, 6 master key ke saath AES reversible</td></tr>
<tr><td>IPv6 ACL</td><td><code>ipv6 traffic-filter</code>; implicit deny se pehle implicit ND permits</td></tr>
<tr><td>CoPP</td><td><code>control-plane</code> + <code>service-policy input</code>; verify <code>show policy-map control-plane</code></td></tr>
<tr><td>REST</td><td>HTTPS 443; 401 authenticated nahi, 403 authorized nahi; base64 encryption nahi hai</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">ip ssh version 2 / crypto key generate rsa modulus 2048
line vty 0 15 / transport input ssh / access-class VTY-MGMT in / exec-timeout 10 0
username backup privilege 15 algorithm-type scrypt secret Backup#26
aaa new-model
tacacs server ISE1 / address ipv4 10.10.10.100 / key NK-t4c-26
aaa group server tacacs+ ADMIN-TAC / server name ISE1 / ip tacacs source-interface Gi0/1
aaa authentication login default group tacacs+ local
aaa authorization exec default group tacacs+ local
aaa authorization commands 15 default group tacacs+ if-authenticated
aaa accounting exec default start-stop group tacacs+
aaa accounting commands 15 default start-stop group tacacs+
test aaa group tacacs+ netadmin Adm!n-26 legacy
show aaa servers / show tacacs / debug aaa authentication / debug radius
ipv6 traffic-filter NAME in / ipv6 access-class NAME in
control-plane / service-policy input COPP
show policy-map control-plane
ip h&#116;tp secure-server / no ip h&#116;tp server / restconf</pre>

<div class="eg"><p><b>Worked example.</b> Exam jaisi soch. "Users RADIUS se authenticate karte hain, server cisco-av-pair shell:priv-lvl=15 lautata hai, users level 1 par aate hain, aur server down hone par local admin login to kar leta hai lekin use bhi level 1 milta hai." Ek missing command dono ko samjhata hai: <code>aaa authorization exec default group radius local</code>.</p></div>

<div class="warn"><p><b>Common galti.</b> Sirf configuration padhna. Kai questions output dete hain (<code>show aaa servers</code>, <code>show policy-map control-plane</code>, <code>show ip access-lists</code>) aur poochhte hain kya galat hai. Counters padhne ki practice karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Answer options mein "server ne user reject kiya, isliye router ne local try kiya" se saavdhaan: hamesha galat. Aur "CoPP interface par outbound laga": galat; CoPP control-plane par input hai.</p></div>

<div class="scn"><h4>Hardening sprint</h4><p>Ek mid-sized company ne apni network team ko security audit paas karne ke liye do hafte diye. Unhone yeh module kram se follow kiya: har device par VTY ACLs ke saath sirf SSH, har device par ek break-glass account ke saath type 9 local secrets, administrators ke liye TACACS+ ke saath AAA aur command accounting, 802.1X ke liye RADIUS rakha, CoPP pehle monitor mode mein phir enforcing, aur controller API ko har tool ke alag accounts ke saath HTTPS par tokens par le gaye. Audit ek finding ke saath paas hua: ek test ke baad break-glass password rotate nahi hua tha. Unhone runbook mein rotation joda.</p><p><b>Seekh:</b> device security chhote, achhe se samjhe gaye controls ka set hai, jo lagataar lagaye aur verify kiye jaate hain.</p></div>

<div class="iv"><p class="q">"Aap aisi company join karte ho jahan har router ek shared enable password use karta hai. Pehle kya badloge?"</p><p>Strong answer priorities rakhta hai: turant sirf SSH aur VTY ACLs, phir AAA se personal accounts (device admin ke liye TACACS+, exec aur command authorization aur accounting ke saath), har device par sahi <code>group tacacs+ local</code> list ke saath ek type 9 break-glass account, CoPP pehle monitor mode phir enforcing, aur HTTPS par tokens aur RBAC ke saath API access. Doosra session khula rakh kar safely roll out karne ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Lines: sirf SSH, saari VTYs, access-class, timeouts; privilege levels 0, 1, 15 plus custom.</li>
<li>Local secrets type 9; ek break-glass account jo sirf tab chale jab servers jawab na dein.</li>
<li>AAA: method lists, admin ke liye command authorization aur accounting ke saath TACACS+, network access ke liye RADIUS.</li>
<li>ACLs: named, object groups, time-ranges, IPv6 ki khaas baatein, VTY access-class; CoPP punted traffic police karta hai.</li>
<li>REST APIs: HTTPS, Basic authentication ki jagah tokens, RBAC, secrets vault mein.</li>
</ul></div>
`}};export{e as default};