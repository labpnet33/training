var e={id:`iam`,h:{en:`Identity and access: MFA, SSO, RADIUS, TACACS+, LDAP, SAML`,hi:`Identity aur access: MFA, SSO, RADIUS, TACACS+, LDAP, SAML`},body:{en:`
<p>At an airport you show your passport at the entrance (who are you?), your boarding pass decides which gate and seat you get (what may you do?), and every scan is recorded (what did you do?). Networks use the same three questions, called <b>AAA</b>: <b>authentication</b>, <b>authorization</b> and <b>accounting</b>. Together with the directories and protocols that support them, this is <b>identity and access management (IAM)</b>.</p>

<h3>Authentication: proving who you are</h3>
<p>Authentication checks a claimed identity (the username) against something the user presents. The evidence falls into <b>factor categories</b>:</p>
<ul>
<li><b>Something you know</b>: password, PIN.</li>
<li><b>Something you have</b>: phone authenticator app, hardware token, smart card.</li>
<li><b>Something you are</b>: fingerprint, face.</li>
<li><b>Somewhere you are</b>: location, such as a corporate network or country.</li>
</ul>
<p><b>Multifactor authentication (MFA)</b> requires factors from at least two <b>different</b> categories. A password plus a phone code is MFA; a password plus a PIN is not, because both are something you know.</p>
<p><b>Time-based authentication</b> appears on the blueprint in two forms. The first is the <b>time-based one-time password (TOTP)</b>: an app and the server share a secret and the current time, and produce a six-digit code that changes every 30 seconds, so a stolen code is useless a minute later. The second is <b>time-of-day restriction</b>: an account may log in only during working hours, so a contractor account used at 3 a.m. is refused.</p>
<p><b>Single sign-on (SSO)</b> lets a user authenticate once and then reach many applications without logging in again. It improves user experience and lets the security team enforce MFA in one place, but it also makes that one login very valuable, so SSO is almost always combined with MFA.</p>

<h3>The protocols behind the scenes</h3>
<table class="cmp"><tr><th>Protocol</th><th>Transport</th><th>What it is for</th><th>Key facts</th></tr>
<tr><td><b>RADIUS</b></td><td>UDP 1812 (auth), 1813 (accounting)</td><td>Network access: Wi-Fi 802.1X, wired 802.1X, VPN users</td><td>Encrypts only the password; combines authentication and authorization; open standard</td></tr>
<tr><td><b>TACACS+</b></td><td>TCP 49</td><td>Device administration: who may log in to routers and switches, and which commands they may run</td><td>Encrypts the whole payload; separates the three A's; per-command authorization</td></tr>
<tr><td><b>LDAP</b></td><td>TCP/UDP 389; LDAPS on TCP 636</td><td>Querying a directory (such as Active Directory) for users and groups</td><td>A directory access protocol, not a login protocol by itself; use LDAPS to encrypt</td></tr>
<tr><td><b>SAML</b></td><td>XML over HTTPS</td><td>Web SSO and federation between organisations</td><td>An identity provider (IdP) sends a signed assertion to a service provider (SP)</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="AAA flow">
<rect x="10" y="70" width="110" height="50" rx="10" fill="#bae6fd"/><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="13">Admin</text>
<rect x="180" y="70" width="120" height="50" rx="10" fill="#e2e8f0"/><text x="240" y="100" text-anchor="middle" class="svg-ink" font-size="13">Router / AP</text>
<rect x="360" y="70" width="120" height="50" rx="10" fill="#ddd6fe"/><text x="420" y="100" text-anchor="middle" class="svg-ink" font-size="13">AAA server</text>
<rect x="530" y="70" width="100" height="50" rx="10" fill="#bbf7d0"/><text x="580" y="100" text-anchor="middle" class="svg-ink" font-size="13">Directory</text>
<line x1="120" y1="95" x2="180" y2="95" stroke="#64748b" stroke-width="2"/><line x1="300" y1="95" x2="360" y2="95" stroke="#64748b" stroke-width="2"/><line x1="480" y1="95" x2="530" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="150" y="60" text-anchor="middle" class="svg-muted" font-size="12">SSH login</text>
<text x="330" y="60" text-anchor="middle" class="svg-accent" font-size="12">TACACS+ / RADIUS</text>
<text x="505" y="60" text-anchor="middle" class="svg-muted" font-size="12">LDAP</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Accounting records flow back to the AAA server and syslog</text>
</svg><p class="cap">The device asks the AAA server; the AAA server checks the directory.</p></div>

<h3>Authorization: what you may do</h3>
<p>After authentication, <b>authorization</b> decides what the user may access. Two principles appear on the exam:</p>
<ul>
<li><b>Least privilege</b>: give each account only the rights it needs for its job, nothing more. A helpdesk engineer who only reads interface status does not need configuration rights.</li>
<li><b>Role-based access control (RBAC)</b>: permissions attach to roles (helpdesk, network admin, auditor), and users are placed in roles. When someone changes job, you change their role, not fifty individual permissions.</li>
</ul>
<p><b>Geofencing</b> uses location as an authorization condition: for example, the admin portal accepts logins only from inside the country, or a company tablet disables the camera inside the data centre. Location comes from GPS on mobile devices or IP geolocation for remote users.</p>
<p><b>Accounting</b> records what happened: who logged in, when, from where and which commands they ran. It is the evidence auditors ask for and the first thing you check after an incident.</p>

<div class="eg"><p><b>Worked example: local and central AAA.</b> Lab 1 uses the router's <b>local user database</b>, which is the right first step and the fallback everyone keeps. In a larger network the same router would ask a TACACS+ server first and use the local account only if the server is unreachable. Read this for understanding; do not type it into Lab 1, because <code>aaa new-model</code> changes how the VTY lines authenticate.</p>
<pre class="code">username admin privilege 15 secret Adm1n!2026   <span class="c">! local fallback (Lab 1)</span>
aaa new-model
tacacs server ISE1
 address ipv4 10.0.99.20
 key Tac+Key!2026
aaa authentication login default group tacacs+ local
aaa authorization exec default group tacacs+ local
aaa accounting commands 15 default start-stop group tacacs+</pre>
<p>Privilege level 15 is full control; level 1 is user EXEC. RBAC on the TACACS+ server maps "helpdesk" to read-only commands and "netadmin" to level 15.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using shared accounts such as "admin" for the whole team, which destroys accounting. Relying only on the AAA server without a local fallback account, so a server outage locks everyone out. Counting two passwords as MFA. Using plain LDAP on 389 across untrusted networks, which exposes credentials.</p></div>

<div class="exam"><p><b>Exam trap.</b> TACACS+ = TCP 49, full-payload encryption, separates AAA, best for device administration. RADIUS = UDP 1812/1813, password-only encryption, combines authentication and authorization, best for network access (802.1X, VPN). SAML = web SSO with XML assertions. LDAP = directory queries.</p></div>

<div class="scn"><h4>The contractor who left</h4><p>A contractor finished a project but his personal account on twenty switches was never removed. Months later the accounting logs showed a login from his account at 02:40. The team moved device logins to TACACS+ with RBAC and MFA through SSO, disabled local accounts except one break-glass admin stored in a safe, and added time-of-day restrictions for contractor roles. Removing a leaver now means disabling one directory account.</p><p><b>Lesson:</b> central AAA with roles, MFA and accounting turns "who can log in where" from fifty scattered lists into one controlled place.</p></div>

<div class="iv"><p class="q">"When would you choose TACACS+ over RADIUS?"</p><p>For administering network devices: TACACS+ runs on TCP 49, encrypts the whole payload and separates authentication, authorization and accounting, so you can authorise and log individual commands. Choose RADIUS for network access such as 802.1X Wi-Fi, wired NAC and VPN users, because every access device and supplicant supports it. Many companies run both from the same policy server.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AAA = authentication (who), authorization (what), accounting (record).</li>
<li>MFA needs two different factor categories; TOTP codes and time-of-day limits are time-based authentication.</li>
<li>SSO means one login for many apps; SAML carries signed assertions from IdP to SP.</li>
<li>RADIUS (UDP 1812/1813) for network access; TACACS+ (TCP 49) for device admin; LDAP (389/636) for directory lookups.</li>
<li>Authorise with least privilege and RBAC; geofencing adds location as a condition.</li>
</ul></div>
`,hi:`
<p>Airport par aap entrance par passport dikhate ho (aap kaun ho?), boarding pass tay karta hai ki aapko kaunsa gate aur seat milegi (aap kya kar sakte ho?), aur har scan record hota hai (aapne kya kiya?). Networks yahi teen sawaal use karte hain, jinhe <b>AAA</b> kehte hain: <b>authentication</b>, <b>authorization</b> aur <b>accounting</b>. Inhe support karne wali directories aur protocols ke saath, yahi <b>identity and access management (IAM)</b> hai.</p>

<h3>Authentication: prove karna ki aap kaun ho</h3>
<p>Authentication claim ki gayi identity (username) ko user ki di hui cheez se check karta hai. Saboot <b>factor categories</b> mein aata hai:</p>
<ul>
<li><b>Something you know</b>: password, PIN.</li>
<li><b>Something you have</b>: phone authenticator app, hardware token, smart card.</li>
<li><b>Something you are</b>: fingerprint, face.</li>
<li><b>Somewhere you are</b>: location, jaise corporate network ya desh.</li>
</ul>
<p><b>Multifactor authentication (MFA)</b> kam se kam do <b>alag</b> categories ke factors maangta hai. Password plus phone code MFA hai; password plus PIN nahi, kyunki dono something you know hain.</p>
<p><b>Time-based authentication</b> blueprint par do roop mein aata hai. Pehla hai <b>time-based one-time password (TOTP)</b>: app aur server ek secret aur current time share karte hain, aur ek six-digit code banate hain jo har 30 second badalta hai, isliye chori hua code ek minute baad bekaar hai. Doosra hai <b>time-of-day restriction</b>: account sirf working hours mein login kar sakta hai, isliye raat 3 baje use hua contractor account refuse hota hai.</p>
<p><b>Single sign-on (SSO)</b> user ko ek baar authenticate karke bina dobara login kiye bahut saari applications tak pahunchne deta hai. Isse user experience behtar hota hai aur security team ek hi jagah MFA enforce kar sakti hai, lekin woh ek login bahut keemti ban jaata hai, isliye SSO lagbhag hamesha MFA ke saath hota hai.</p>

<h3>Peeche kaam karne wale protocols</h3>
<table class="cmp"><tr><th>Protocol</th><th>Transport</th><th>Kis kaam ke liye</th><th>Key facts</th></tr>
<tr><td><b>RADIUS</b></td><td>UDP 1812 (auth), 1813 (accounting)</td><td>Network access: Wi-Fi 802.1X, wired 802.1X, VPN users</td><td>Sirf password encrypt karta hai; authentication aur authorization ko combine karta hai; open standard</td></tr>
<tr><td><b>TACACS+</b></td><td>TCP 49</td><td>Device administration: routers aur switches par kaun login kare, aur kaunse commands chalaye</td><td>Poora payload encrypt karta hai; teeno A alag karta hai; per-command authorization</td></tr>
<tr><td><b>LDAP</b></td><td>TCP/UDP 389; LDAPS TCP 636 par</td><td>Directory (jaise Active Directory) se users aur groups query karna</td><td>Directory access protocol, apne aap mein login protocol nahi; encrypt karne ke liye LDAPS use karo</td></tr>
<tr><td><b>SAML</b></td><td>HTTPS par XML</td><td>Web SSO aur organisations ke beech federation</td><td>Identity provider (IdP) service provider (SP) ko signed assertion bhejta hai</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="AAA flow">
<rect x="10" y="70" width="110" height="50" rx="10" fill="#bae6fd"/><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="13">Admin</text>
<rect x="180" y="70" width="120" height="50" rx="10" fill="#e2e8f0"/><text x="240" y="100" text-anchor="middle" class="svg-ink" font-size="13">Router / AP</text>
<rect x="360" y="70" width="120" height="50" rx="10" fill="#ddd6fe"/><text x="420" y="100" text-anchor="middle" class="svg-ink" font-size="13">AAA server</text>
<rect x="530" y="70" width="100" height="50" rx="10" fill="#bbf7d0"/><text x="580" y="100" text-anchor="middle" class="svg-ink" font-size="13">Directory</text>
<line x1="120" y1="95" x2="180" y2="95" stroke="#64748b" stroke-width="2"/><line x1="300" y1="95" x2="360" y2="95" stroke="#64748b" stroke-width="2"/><line x1="480" y1="95" x2="530" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="150" y="60" text-anchor="middle" class="svg-muted" font-size="12">SSH login</text>
<text x="330" y="60" text-anchor="middle" class="svg-accent" font-size="12">TACACS+ / RADIUS</text>
<text x="505" y="60" text-anchor="middle" class="svg-muted" font-size="12">LDAP</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Accounting records AAA server aur syslog tak wapas jaate hain</text>
</svg><p class="cap">Device AAA server se poochta hai; AAA server directory check karta hai.</p></div>

<h3>Authorization: aap kya kar sakte ho</h3>
<p>Authentication ke baad <b>authorization</b> tay karta hai ki user kya access kar sakta hai. Exam mein do principles aate hain:</p>
<ul>
<li><b>Least privilege</b>: har account ko sirf utne rights do jitne uske kaam ke liye chahiye, usse zyada nahi. Jo helpdesk engineer sirf interface status padhta hai use configuration rights nahi chahiye.</li>
<li><b>Role-based access control (RBAC)</b>: permissions roles (helpdesk, network admin, auditor) se judti hain, aur users ko roles mein daala jaata hai. Jab koi job badalta hai, aap uska role badalte ho, pachaas alag permissions nahi.</li>
</ul>
<p><b>Geofencing</b> location ko authorization condition ki tarah use karta hai: jaise admin portal sirf desh ke andar se login accept kare, ya company tablet data centre ke andar camera disable kar de. Location mobile devices par GPS se ya remote users ke liye IP geolocation se aati hai.</p>
<p><b>Accounting</b> record karta hai ki kya hua: kisne login kiya, kab, kahan se aur kaunse commands chalaye. Yahi saboot auditors maangte hain aur incident ke baad sabse pehle yahi check hota hai.</p>

<div class="eg"><p><b>Worked example: local aur central AAA.</b> Lab 1 router ka <b>local user database</b> use karta hai, jo sahi pehla kadam hai aur har koi ise fallback ki tarah rakhta hai. Bade network mein wahi router pehle TACACS+ server se poochega aur local account sirf tab use karega jab server reachable na ho. Ise samajhne ke liye padho; Lab 1 mein type mat karna, kyunki <code>aaa new-model</code> VTY lines ke authenticate karne ka tareeka badal deta hai.</p>
<pre class="code">username admin privilege 15 secret Adm1n!2026   <span class="c">! local fallback (Lab 1)</span>
aaa new-model
tacacs server ISE1
 address ipv4 10.0.99.20
 key Tac+Key!2026
aaa authentication login default group tacacs+ local
aaa authorization exec default group tacacs+ local
aaa accounting commands 15 default start-stop group tacacs+</pre>
<p>Privilege level 15 poora control hai; level 1 user EXEC hai. TACACS+ server par RBAC "helpdesk" ko read-only commands se aur "netadmin" ko level 15 se map karta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Poori team ke liye "admin" jaise shared accounts use karna, jisse accounting khatam ho jaati hai. Bina local fallback account ke sirf AAA server par nirbhar rehna, jisse server outage mein sab lock out ho jaate hain. Do passwords ko MFA ginna. Untrusted networks par 389 wala plain LDAP use karna, jisse credentials expose hote hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> TACACS+ = TCP 49, full-payload encryption, AAA ko alag karta hai, device administration ke liye best. RADIUS = UDP 1812/1813, sirf password encryption, authentication aur authorization combine karta hai, network access (802.1X, VPN) ke liye best. SAML = XML assertions wala web SSO. LDAP = directory queries.</p></div>

<div class="scn"><h4>Woh contractor jo chala gaya</h4><p>Ek contractor ne project khatam kiya lekin bees switches par uska personal account kabhi hataya nahi gaya. Mahino baad accounting logs mein uske account se 02:40 par login dikha. Team ne device logins ko RBAC ke saath TACACS+ par shift kiya aur SSO ke through MFA lagaya, safe mein rakhe ek break-glass admin ke alawa local accounts disable kiye, aur contractor roles ke liye time-of-day restrictions jodi. Ab kisi leaver ko hatane ka matlab ek directory account disable karna hai.</p><p><b>Seekh:</b> roles, MFA aur accounting wala central AAA "kaun kahan login kar sakta hai" ko pachaas bikhri lists se ek controlled jagah mein badal deta hai.</p></div>

<div class="iv"><p class="q">"Aap RADIUS ki jagah TACACS+ kab choose karoge?"</p><p>Network devices administer karne ke liye: TACACS+ TCP 49 par chalta hai, poora payload encrypt karta hai aur authentication, authorization aur accounting ko alag karta hai, isliye aap individual commands authorise aur log kar sakte ho. Network access jaise 802.1X Wi-Fi, wired NAC aur VPN users ke liye RADIUS choose karo, kyunki har access device aur supplicant use support karta hai. Kai companies dono ek hi policy server se chalati hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AAA = authentication (kaun), authorization (kya), accounting (record).</li>
<li>MFA ko do alag factor categories chahiye; TOTP codes aur time-of-day limits time-based authentication hain.</li>
<li>SSO matlab bahut saari apps ke liye ek login; SAML IdP se SP tak signed assertions le jaata hai.</li>
<li>RADIUS (UDP 1812/1813) network access ke liye; TACACS+ (TCP 49) device admin ke liye; LDAP (389/636) directory lookups ke liye.</li>
<li>Least privilege aur RBAC se authorise karo; geofencing location ko condition ki tarah jodta hai.</li>
</ul></div>
`}};export{e as default};