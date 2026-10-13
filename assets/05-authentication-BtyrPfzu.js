var e={id:`authentication`,h:{en:`Authentication: local, RADIUS and TACACS+`,hi:`Authentication: local, RADIUS aur TACACS+`},body:{en:`
<p>A company with a hundred routers cannot create fifty accounts on each of them. When an engineer leaves, someone must delete that account on every box, and one will be forgotten. The answer is a <b>central directory</b>: routers ask a server, "is this person allowed in?". The server answers. Junos supports three methods: <b>local passwords</b>, <b>RADIUS</b> and <b>TACACS+</b>.</p>

<h3>The three methods</h3>
<table class="cmp"><tr><th></th><th>Local password</th><th>RADIUS</th><th>TACACS+</th></tr>
<tr><td>Where accounts live</td><td>on each router</td><td>central server</td><td>central server</td></tr>
<tr><td>Transport</td><td>none</td><td>UDP 1812 (auth) / 1813 (accounting)</td><td>TCP 49</td></tr>
<tr><td>Encryption</td><td>hashed in file</td><td>password field only</td><td>entire payload</td></tr>
<tr><td>Authorization</td><td>login class</td><td>combined with authentication</td><td>separate; per-command possible</td></tr>
<tr><td>Junos statement</td><td><code>login user</code></td><td><code>radius-server</code></td><td><code>tacplus-server</code></td></tr>
<tr><td>Typical use</td><td>emergency account</td><td>network access, VPN, Wi-Fi</td><td>device administration</td></tr></table>
<p><b>AAA</b> stands for authentication (who are you), authorization (what may you do) and accounting (what did you do). TACACS+ separates the three; RADIUS combines authentication and authorization.</p>

<h3>Configuration</h3>
<pre class="code">set system radius-server 10.99.0.10 secret "Nk-Radius-Key"
set system radius-server 10.99.0.10 timeout 5
set system radius-server 10.99.0.10 retry 2
set system tacplus-server 10.99.0.11 secret "Nk-Tacacs-Key"
set system authentication-order [ radius password ]</pre>
<p>The <b>secret</b> is a shared key known by the router and the server; Junos stores it encrypted (it displays as <code>$9$...</code>). <code>authentication-order</code> lists the methods to try in sequence. Without it, only local passwords are used.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Authentication order flow">
<rect x="10" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="13">User login</text>
<rect x="170" y="70" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="235" y="92" text-anchor="middle" class="svg-ink" font-size="13">1. RADIUS</text><text x="235" y="108" text-anchor="middle" class="svg-muted" font-size="11">10.99.0.10</text>
<rect x="350" y="70" width="130" height="50" rx="8" fill="#fde68a"/><text x="415" y="92" text-anchor="middle" class="svg-ink" font-size="13">2. password</text><text x="415" y="108" text-anchor="middle" class="svg-muted" font-size="11">local database</text>
<rect x="520" y="70" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="575" y="100" text-anchor="middle" class="svg-ink" font-size="13">Access</text>
<g stroke="#64748b" stroke-width="2"><line x1="120" y1="95" x2="170" y2="95"/><line x1="300" y1="95" x2="350" y2="95"/><line x1="480" y1="95" x2="520" y2="95"/></g>
<text x="325" y="60" text-anchor="middle" class="svg-accent" font-size="11">only if no answer (or reject, when "password" is listed)</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">authentication-order [ radius password ]</text>
</svg><p class="cap">Methods are tried left to right.</p></div>

<h3>What happens when a server rejects or does not answer</h3>
<ul>
<li><b>Server answers "accept"</b>: login succeeds.</li>
<li><b>Server answers "reject"</b>: the login attempt ends in failure, even if the local database has the user, <i>unless</i> a following method is in the order and the platform tries it. In the exam, treat a reject as authoritative.</li>
<li><b>No answer (server unreachable or timeout)</b>: Junos moves to the next method in the order, ending in the local password database. This is why you keep a local emergency account.</li>
</ul>
<p>Put <code>password</code> in the order after the servers. A local account such as <code>admin</code> then lets you in when the RADIUS server is down.</p>

<h3>Remote users and template accounts</h3>
<p>The server only says "yes" and may send an attribute naming a class. A person who is not defined locally maps to a <b>template user</b>:</p>
<pre class="code">set system login user remote class operator       <span class="c">! default template for remote users</span>
set system login user netadmin class super-user   <span class="c">! shared template named by the server</span></pre>
<p>If the server returns a template name (for example with a vendor-specific attribute), the user receives that class. If it returns nothing, the user maps to the template named <code>remote</code>. With no <code>remote</code> template, the login fails with an access error.</p>

<h3>Checking authentication</h3>
<pre class="code">lab@R1&gt; show system users
 9:15AM  up 12 days,  3 users, load averages: 0.10, 0.08, 0.05
USER     TTY      FROM              LOGIN@  IDLE WHAT
asha     p0       10.40.0.2         9:10AM     - -cli (cli)
lab@R1&gt; show log messages | match "RADIUS|TACPLUS|sshd"
lab@R1&gt; show log interactive-commands</pre>
<p>Failed logins appear in <code>messages</code> (<code>authorization</code> facility). A RADIUS timeout line followed by a successful login means the server was unreachable and the local password was used.</p>

<h3>SSH keys</h3>
<p>For automation and for stronger security, give a user a public key: <code>set system login user asha authentication ssh-ed25519 "ssh-ed25519 AAAA... asha@nk.example"</code>. The private key stays on the engineer's laptop and no password crosses the network.</p>

<div class="eg"><p><b>Worked example.</b> NK has 80 routers. Instead of 80 local lists, each router has <code>radius-server 10.99.0.10</code> and <code>authentication-order [ radius password ]</code>, plus one local emergency account <code>breakglass</code> with a long unique password stored in a vault. When Asha leaves, the RADIUS administrator disables her once and she is out of all 80 routers.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Removing all local accounts so nobody can log in during a RADIUS outage; a wrong shared secret (the server logs a bad authenticator and every login times out); a firewall that blocks UDP 1812 or TCP 49 between the router and the server; forgetting that the source address the router uses must be known to the server.</p></div>
<div class="exam"><p><b>Exam trap.</b> RADIUS = UDP, encrypts only the password. TACACS+ = TCP 49, encrypts the whole payload and separates authorization. If no server answers, Junos falls back to local passwords.</p></div>

<div class="scn"><h4>The RADIUS outage that did not matter</h4><p>One Monday the RADIUS server in Mumbai crashed. Engineers noticed that logins took about 15 seconds longer but still worked, because <code>authentication-order [ radius password ]</code> made each router wait for the timeout and then try the local password. The team spent the morning fixing the server instead of driving to sites.</p><p><b>Lesson:</b> a local fallback account is your insurance policy; so is a short RADIUS timeout.</p></div>

<div class="iv"><p class="q">"What is the difference between RADIUS and TACACS+?"</p><p>RADIUS runs over UDP and encrypts only the password; it combines authentication and authorization and is common for network access. TACACS+ runs over TCP port 49, encrypts the whole body and separates authentication, authorization and accounting, so it is preferred for device administration with command-level control.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Junos can authenticate locally, with RADIUS (UDP 1812) or with TACACS+ (TCP 49).</li>
<li><code>authentication-order</code> sets the sequence; without it only local passwords are used.</li>
<li>No server answer means fallback to the next method, finally local.</li>
<li>Remote users map to a template user such as <code>remote</code> that supplies the class.</li>
<li>Always keep a local emergency account and use SSH keys for automation.</li>
</ul></div>
`,hi:`
<p>Sau routers wali company har router par pachaas accounts nahi bana sakti. Engineer jaaye to kisi ko har box par woh account delete karna padta hai, aur ek zaroor chhoot jaata hai. Jawab hai <b>central directory</b>: routers server se poochte hain, "kya yeh insaan andar aa sakta hai?". Server jawab deta hai. Junos teen methods support karta hai: <b>local passwords</b>, <b>RADIUS</b> aur <b>TACACS+</b>.</p>

<h3>Teen methods</h3>
<table class="cmp"><tr><th></th><th>Local password</th><th>RADIUS</th><th>TACACS+</th></tr>
<tr><td>Accounts kahan</td><td>har router par</td><td>central server</td><td>central server</td></tr>
<tr><td>Transport</td><td>koi nahi</td><td>UDP 1812 (auth) / 1813 (accounting)</td><td>TCP 49</td></tr>
<tr><td>Encryption</td><td>file mein hashed</td><td>sirf password field</td><td>poora payload</td></tr>
<tr><td>Authorization</td><td>login class</td><td>authentication ke saath combined</td><td>alag; per-command possible</td></tr>
<tr><td>Junos statement</td><td><code>login user</code></td><td><code>radius-server</code></td><td><code>tacplus-server</code></td></tr>
<tr><td>Aam use</td><td>emergency account</td><td>network access, VPN, Wi-Fi</td><td>device administration</td></tr></table>
<p><b>AAA</b> ka matlab authentication (aap kaun ho), authorization (aap kya kar sakte ho) aur accounting (aapne kya kiya). TACACS+ teeno ko alag karta hai; RADIUS authentication aur authorization ko jodta hai.</p>

<h3>Configuration</h3>
<pre class="code">set system radius-server 10.99.0.10 secret "Nk-Radius-Key"
set system radius-server 10.99.0.10 timeout 5
set system radius-server 10.99.0.10 retry 2
set system tacplus-server 10.99.0.11 secret "Nk-Tacacs-Key"
set system authentication-order [ radius password ]</pre>
<p><b>Secret</b> router aur server ki shared key hai; Junos use encrypted store karta hai (<code>$9$...</code> ke roop mein dikhta hai). <code>authentication-order</code> methods ko sequence mein try karne ki list deta hai. Iske bina sirf local passwords use hote hain.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Authentication order flow">
<rect x="10" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="13">User login</text>
<rect x="170" y="70" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="235" y="92" text-anchor="middle" class="svg-ink" font-size="13">1. RADIUS</text><text x="235" y="108" text-anchor="middle" class="svg-muted" font-size="11">10.99.0.10</text>
<rect x="350" y="70" width="130" height="50" rx="8" fill="#fde68a"/><text x="415" y="92" text-anchor="middle" class="svg-ink" font-size="13">2. password</text><text x="415" y="108" text-anchor="middle" class="svg-muted" font-size="11">local database</text>
<rect x="520" y="70" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="575" y="100" text-anchor="middle" class="svg-ink" font-size="13">Access</text>
<g stroke="#64748b" stroke-width="2"><line x1="120" y1="95" x2="170" y2="95"/><line x1="300" y1="95" x2="350" y2="95"/><line x1="480" y1="95" x2="520" y2="95"/></g>
<text x="325" y="60" text-anchor="middle" class="svg-accent" font-size="11">sirf jab jawab na aaye (ya reject, jab "password" listed ho)</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">authentication-order [ radius password ]</text>
</svg><p class="cap">Methods left se right try hote hain.</p></div>

<h3>Server reject kare ya jawab na de to kya hota hai</h3>
<ul>
<li><b>Server "accept" bole</b>: login succeed.</li>
<li><b>Server "reject" bole</b>: login attempt fail hota hai, chahe local database mein user ho, <i>jab tak</i> order mein agla method ho aur platform use try kare. Exam mein reject ko authoritative maano.</li>
<li><b>Jawab nahi (server unreachable ya timeout)</b>: Junos order ke agle method par jaata hai, aakhir mein local password database. Isiliye local emergency account rakhte hain.</li>
</ul>
<p>Order mein <code>password</code> ko servers ke baad rakho. Tab <code>admin</code> jaisa local account RADIUS server down hone par andar aane deta hai.</p>

<h3>Remote users aur template accounts</h3>
<p>Server sirf "haan" bolta hai aur class ka naam batane wala attribute bhej sakta hai. Jo insaan locally define nahi hai woh <b>template user</b> se map hota hai:</p>
<pre class="code">set system login user remote class operator       <span class="c">! remote users ka default template</span>
set system login user netadmin class super-user   <span class="c">! server dwara bataya shared template</span></pre>
<p>Server template ka naam lauta de (jaise vendor-specific attribute se) to user ko wahi class milti hai. Kuch na lautaye to user <code>remote</code> naam ke template se map hota hai. <code>remote</code> template na ho to login access error se fail hota hai.</p>

<h3>Authentication check karna</h3>
<pre class="code">lab@R1&gt; show system users
 9:15AM  up 12 days,  3 users, load averages: 0.10, 0.08, 0.05
USER     TTY      FROM              LOGIN@  IDLE WHAT
asha     p0       10.40.0.2         9:10AM     - -cli (cli)
lab@R1&gt; show log messages | match "RADIUS|TACPLUS|sshd"
lab@R1&gt; show log interactive-commands</pre>
<p>Failed logins <code>messages</code> mein (<code>authorization</code> facility) dikhte hain. RADIUS timeout line ke baad successful login ka matlab server unreachable tha aur local password use hua.</p>

<h3>SSH keys</h3>
<p>Automation aur zyada security ke liye user ko public key do: <code>set system login user asha authentication ssh-ed25519 "ssh-ed25519 AAAA... asha@nk.example"</code>. Private key engineer ke laptop par rehti hai aur network par koi password nahi jaata.</p>

<div class="eg"><p><b>Worked example.</b> NK ke 80 routers hain. 80 local lists ki jagah har router par <code>radius-server 10.99.0.10</code> aur <code>authentication-order [ radius password ]</code> hai, saath mein ek local emergency account <code>breakglass</code> jiska lamba unique password vault mein rakha hai. Asha chali jaaye to RADIUS administrator use ek baar disable karta hai aur woh saare 80 routers se bahar.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Saare local accounts hata dena taaki RADIUS outage mein koi login na kar sake; galat shared secret (server bad authenticator log karta hai aur har login timeout hota hai); router aur server ke beech UDP 1812 ya TCP 49 block karne wala firewall; yeh bhool jaana ki router jo source address use karta hai woh server ko pata hona chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> RADIUS = UDP, sirf password encrypt karta hai. TACACS+ = TCP 49, poora payload encrypt karta hai aur authorization alag karta hai. Koi server jawab na de to Junos local passwords par fall back karta hai.</p></div>

<div class="scn"><h4>RADIUS outage jisse farak nahi pada</h4><p>Ek Monday Mumbai ka RADIUS server crash ho gaya. Engineers ne dekha ki logins mein lagbhag 15 second zyada lage lekin chalte rahe, kyunki <code>authentication-order [ radius password ]</code> ne har router ko timeout ka intezaar karke local password try karne diya. Team ne subah sites par jaane ki jagah server theek karne mein lagayi.</p><p><b>Lesson:</b> local fallback account aapki insurance policy hai; chhota RADIUS timeout bhi.</p></div>

<div class="iv"><p class="q">"RADIUS aur TACACS+ mein kya difference hai?"</p><p>RADIUS UDP par chalta hai aur sirf password encrypt karta hai; authentication aur authorization combine karta hai aur network access mein common hai. TACACS+ TCP port 49 par chalta hai, poori body encrypt karta hai aur authentication, authorization aur accounting alag karta hai, isliye command-level control wale device administration ke liye preferred hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Junos locally, RADIUS (UDP 1812) ya TACACS+ (TCP 49) se authenticate kar sakta hai.</li>
<li><code>authentication-order</code> sequence tay karta hai; iske bina sirf local passwords.</li>
<li>Server jawab na de to agle method par fallback, aakhir mein local.</li>
<li>Remote users <code>remote</code> jaise template user se map hote hain jo class deta hai.</li>
<li>Hamesha local emergency account rakho aur automation ke liye SSH keys use karo.</li>
</ul></div>
`}};export{e as default};