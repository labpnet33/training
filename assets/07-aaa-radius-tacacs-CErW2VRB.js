var e={id:`aaa-concepts`,h:{en:`AAA concepts: authentication, authorization, accounting; RADIUS vs TACACS+`,hi:`AAA concepts: authentication, authorization, accounting; RADIUS vs TACACS+`},body:{en:`
<p>Think about an airport. At the entrance an officer checks your passport: are you really who you claim to be? That is <b>authentication</b>. Your boarding pass then decides which gate, which lounge and which seat you may use: that is <b>authorization</b>. Meanwhile the airline records when you checked in, boarded and landed: that is <b>accounting</b>. Networks use the same three As, and together they are called <b>AAA</b>.</p>

<h3>The three As, precisely</h3>
<dl class="terms">
<dt>Authentication</dt><dd>Proving identity: who are you? Username and password, a certificate, a token code, or a combination (MFA).</dd>
<dt>Authorization</dt><dd>Deciding what an authenticated user may do: which privilege level, which commands, which VLAN or ACL on a network port.</dd>
<dt>Accounting</dt><dd>Recording what happened: login and logout times, source address, commands typed, session duration. Used for audits, investigations and billing.</dd>
</dl>
<p>The local user database from chapter 3 already does a simple form of authentication (username and secret) and authorization (privilege level). It does not scale: with 300 routers, one leaving employee means 300 configuration changes, and there is no central log of commands.</p>

<h3>Centralised AAA: the players</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Centralised AAA flow">
<rect x="10" y="80" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="70" y="102" text-anchor="middle" class="svg-ink" font-size="13">Admin</text><text x="70" y="119" text-anchor="middle" class="svg-muted" font-size="12">SSH login</text>
<rect x="180" y="80" width="130" height="50" rx="8" fill="#fde68a"/><text x="245" y="102" text-anchor="middle" class="svg-ink" font-size="13">EDGE</text><text x="245" y="119" text-anchor="middle" class="svg-muted" font-size="12">AAA client (NAD)</text>
<rect x="360" y="80" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="425" y="102" text-anchor="middle" class="svg-ink" font-size="13">AAA server</text><text x="425" y="119" text-anchor="middle" class="svg-muted" font-size="12">for example ISE</text>
<rect x="530" y="80" width="100" height="50" rx="8" fill="#bae6fd"/><text x="580" y="102" text-anchor="middle" class="svg-ink" font-size="13">Directory</text><text x="580" y="119" text-anchor="middle" class="svg-muted" font-size="12">AD / LDAP</text>
<line x1="130" y1="105" x2="180" y2="105" stroke="#64748b" stroke-width="2"/><line x1="310" y1="105" x2="360" y2="105" stroke="#64748b" stroke-width="2"/><line x1="490" y1="105" x2="530" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="335" y="70" text-anchor="middle" class="svg-accent" font-size="12">TACACS+ or RADIUS</text>
<text x="245" y="170" text-anchor="middle" class="svg-muted" font-size="12">local users = fallback only</text>
<text x="425" y="170" text-anchor="middle" class="svg-muted" font-size="12">policies, command sets, logs</text>
</svg><p class="cap">The router does not decide on its own; it asks the AAA server, which checks the company directory and returns the decision.</p></div>
<ul>
<li>The <b>user</b> (an admin, or for network access a laptop or phone).</li>
<li>The <b>AAA client</b>, also called network access device (NAD) or network access server (NAS): the router, switch, firewall or wireless controller that receives the login and asks the server.</li>
<li>The <b>AAA server</b>: Cisco Identity Services Engine (ISE) today, the older Cisco Secure ACS in legacy networks, or any RADIUS server.</li>
<li>The <b>identity store</b> behind the server: Active Directory or LDAP, so staff use their normal company account.</li>
</ul>

<h3>RADIUS versus TACACS+</h3>
<p>The AAA client and server talk using one of two protocols. This comparison is one of the most tested tables in CCNA security.</p>
<table class="cmp"><tr><th></th><th>RADIUS</th><th>TACACS+</th></tr>
<tr><td>Origin</td><td>Open standard (RFC 2865/2866)</td><td>Developed by Cisco, now documented in RFC 8907</td></tr>
<tr><td>Transport</td><td>UDP 1812 (authentication), 1813 (accounting); legacy 1645/1646</td><td>TCP 49</td></tr>
<tr><td>Encryption</td><td>Only the password field is hidden</td><td>The entire payload is encrypted</td></tr>
<tr><td>AAA functions</td><td>Authentication and authorization combined in one exchange</td><td>Authentication, authorization and accounting separated</td></tr>
<tr><td>Command authorization</td><td>Not per command</td><td>Per command (for example "may run show, may not run reload")</td></tr>
<tr><td>Typical use</td><td><b>Network access</b>: 802.1X, Wi-Fi, VPN users</td><td><b>Device administration</b>: admins logging in to routers and switches</td></tr>
</table>
<p>A simple memory hook: <b>TACACS+ is for the people who manage the network, RADIUS is for the people who use it.</b> Most enterprises run both on the same ISE deployment.</p>

<h3>Why the details matter</h3>
<ul>
<li><b>TCP vs UDP.</b> TACACS+ over TCP knows immediately if the server is unreachable (the connection fails). RADIUS over UDP must wait for timeouts and retransmissions.</li>
<li><b>Full vs partial encryption.</b> With RADIUS, an attacker capturing packets can see the username and other attributes; with TACACS+ the whole body is encrypted with the shared key.</li>
<li><b>Separated functions.</b> Because TACACS+ keeps authorization separate, the router can ask "may netadmin run <code>configure terminal</code>?" before every command, and send an accounting record for each one.</li>
</ul>

<h3>Local fallback: ERROR versus FAIL</h3>
<p>Central AAA creates a new risk: if the server is unreachable, nobody can log in, including the engineer trying to fix the problem. So you list more than one <b>method</b>, for example "TACACS+ group, then local". The rule you must remember is:</p>
<ul>
<li>If the server <b>does not answer</b> (an ERROR: timeout, unreachable), IOS moves to the next method, the local database.</li>
<li>If the server <b>answers "reject"</b> (a FAIL: wrong password, disabled account), IOS stops. It does <b>not</b> try the local database.</li>
</ul>
<p>This is deliberate: a user disabled in Active Directory must not get in with an old local password. The local accounts become <b>emergency ("break-glass") accounts</b>, used only when the AAA servers are down.</p>

<div class="eg"><p><b>Worked example.</b> A company has 300 routers and switches, all pointing to ISE over TACACS+. An engineer, priya, leaves on Friday. HR disables her Active Directory account; within seconds she can no longer log in to any device. On Monday the auditor asks who changed an ACL on the data center firewall last month; the TACACS+ accounting log shows <code>user=ravi, source=10.99.99.14, cmd=access-list 110 permit tcp any host 198.51.100.20 eq 443</code> with a timestamp. None of this is possible with local users alone.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Saying RADIUS encrypts the whole packet. Swapping the ports (TACACS+ is TCP 49, RADIUS is UDP 1812/1813). Assuming local fallback kicks in when the server rejects a password. Using TACACS+ for 802.1X (802.1X uses RADIUS with EAP). Forgetting to keep at least one local emergency account.</p></div>

<div class="exam"><p><b>Exam traps.</b> Authentication = who you are; authorization = what you may do; accounting = what you did. TACACS+: TCP 49, full encryption, separates AAA, per-command authorization, device administration. RADIUS: UDP 1812/1813, password-only encryption, combines authentication and authorization, network access and 802.1X. Fallback happens on ERROR, not on FAIL.</p></div>

<div class="scn"><h4>The contractor account that never died</h4><p>A bank's network team created local accounts for a contractor on 120 switches during a project. A year later a security review found the account still active on 37 of them, because nobody removed it everywhere. The team moved all device logins to ISE with TACACS+, tied to Active Directory groups (NetAdmins with privilege 15, NetOps with a restricted command set), and kept one break-glass local account per device, stored in a vault. Contractor access is now an AD group membership that expires automatically.</p><p><b>Lesson:</b> AAA puts the list of who may manage the network in one place, so removing someone happens once and everywhere.</p></div>

<div class="iv"><p class="q">"Compare RADIUS and TACACS+. Which would you use for device administration and why?"</p><p>Strong answer: TACACS+ uses TCP 49, encrypts the entire payload and separates authentication, authorization and accounting, so it supports per-command authorization and per-command accounting; that makes it the choice for admins managing network devices. RADIUS is an open standard on UDP 1812/1813, encrypts only the password, combines authentication and authorization, and is used for network access such as 802.1X, wireless and VPN. Mention ISE as the server and local fallback on ERROR but not FAIL.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AAA = authentication (who), authorization (what allowed), accounting (what done).</li>
<li>Centralised AAA uses an AAA client (the device), an AAA server (ISE) and an identity store (AD).</li>
<li>TACACS+: TCP 49, full encryption, separated AAA, per-command control, for device admin.</li>
<li>RADIUS: UDP 1812/1813, password-only encryption, combined authN/authZ, for network access and 802.1X.</li>
<li>Local fallback is used only when the server is unreachable, never after a reject.</li>
</ul></div>
`,hi:`
<p>Ek airport ke baare mein socho. Entrance par officer aapka passport check karta hai: kya aap sach mein wahi ho jo aap kehte ho? Yeh <b>authentication</b> hai. Phir aapka boarding pass decide karta hai ki aap kaunsa gate, kaunsa lounge aur kaunsi seat use kar sakte ho: yeh <b>authorization</b> hai. Is beech airline record karti hai ki aapne kab check in kiya, kab board kiya aur kab land kiya: yeh <b>accounting</b> hai. Networks bhi yahi teen A use karte hain, aur inhe saath mein <b>AAA</b> kehte hain.</p>

<h3>Teen A, precisely</h3>
<dl class="terms">
<dt>Authentication</dt><dd>Identity prove karna: aap kaun ho? Username aur password, certificate, token code, ya combination (MFA).</dd>
<dt>Authorization</dt><dd>Decide karna ki authenticated user kya kar sakta hai: kaunsa privilege level, kaunsi commands, network port par kaunsa VLAN ya ACL.</dd>
<dt>Accounting</dt><dd>Kya hua record karna: login aur logout time, source address, type ki gayi commands, session duration. Audits, investigations aur billing ke liye use hota hai.</dd>
</dl>
<p>Chapter 3 ka local user database pehle se authentication (username aur secret) aur authorization (privilege level) ka simple roop karta hai. Yeh scale nahi karta: 300 routers ke saath ek employee ke jaane ka matlab 300 configuration changes, aur commands ka koi central log nahi.</p>

<h3>Centralised AAA: players</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Centralised AAA flow">
<rect x="10" y="80" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="70" y="102" text-anchor="middle" class="svg-ink" font-size="13">Admin</text><text x="70" y="119" text-anchor="middle" class="svg-muted" font-size="12">SSH login</text>
<rect x="180" y="80" width="130" height="50" rx="8" fill="#fde68a"/><text x="245" y="102" text-anchor="middle" class="svg-ink" font-size="13">EDGE</text><text x="245" y="119" text-anchor="middle" class="svg-muted" font-size="12">AAA client (NAD)</text>
<rect x="360" y="80" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="425" y="102" text-anchor="middle" class="svg-ink" font-size="13">AAA server</text><text x="425" y="119" text-anchor="middle" class="svg-muted" font-size="12">jaise ISE</text>
<rect x="530" y="80" width="100" height="50" rx="8" fill="#bae6fd"/><text x="580" y="102" text-anchor="middle" class="svg-ink" font-size="13">Directory</text><text x="580" y="119" text-anchor="middle" class="svg-muted" font-size="12">AD / LDAP</text>
<line x1="130" y1="105" x2="180" y2="105" stroke="#64748b" stroke-width="2"/><line x1="310" y1="105" x2="360" y2="105" stroke="#64748b" stroke-width="2"/><line x1="490" y1="105" x2="530" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="335" y="70" text-anchor="middle" class="svg-accent" font-size="12">TACACS+ ya RADIUS</text>
<text x="245" y="170" text-anchor="middle" class="svg-muted" font-size="12">local users = sirf fallback</text>
<text x="425" y="170" text-anchor="middle" class="svg-muted" font-size="12">policies, command sets, logs</text>
</svg><p class="cap">Router khud decide nahi karta; woh AAA server se poochta hai, jo company directory check karke decision lautata hai.</p></div>
<ul>
<li><b>User</b> (admin, ya network access ke liye laptop ya phone).</li>
<li><b>AAA client</b>, jise network access device (NAD) ya network access server (NAS) bhi kehte hain: router, switch, firewall ya wireless controller jo login receive karta hai aur server se poochta hai.</li>
<li><b>AAA server</b>: aaj Cisco Identity Services Engine (ISE), legacy networks mein purana Cisco Secure ACS, ya koi bhi RADIUS server.</li>
<li>Server ke peeche <b>identity store</b>: Active Directory ya LDAP, taaki staff apna normal company account use kare.</li>
</ul>

<h3>RADIUS versus TACACS+</h3>
<p>AAA client aur server do mein se ek protocol se baat karte hain. Yeh comparison CCNA security ki sabse zyada test hone wali tables mein se ek hai.</p>
<table class="cmp"><tr><th></th><th>RADIUS</th><th>TACACS+</th></tr>
<tr><td>Origin</td><td>Open standard (RFC 2865/2866)</td><td>Cisco ne banaya, ab RFC 8907 mein documented</td></tr>
<tr><td>Transport</td><td>UDP 1812 (authentication), 1813 (accounting); legacy 1645/1646</td><td>TCP 49</td></tr>
<tr><td>Encryption</td><td>Sirf password field chhupta hai</td><td>Poora payload encrypted</td></tr>
<tr><td>AAA functions</td><td>Authentication aur authorization ek exchange mein combined</td><td>Authentication, authorization aur accounting alag alag</td></tr>
<tr><td>Command authorization</td><td>Per command nahi</td><td>Per command (jaise "show chala sakta hai, reload nahi")</td></tr>
<tr><td>Typical use</td><td><b>Network access</b>: 802.1X, Wi-Fi, VPN users</td><td><b>Device administration</b>: routers aur switches mein login karne wale admins</td></tr>
</table>
<p>Yaad rakhne ka simple tareeka: <b>TACACS+ un logon ke liye hai jo network manage karte hain, RADIUS un logon ke liye jo use karte hain.</b> Zyada tar enterprises dono ek hi ISE deployment par chalate hain.</p>

<h3>Details kyun matter karti hain</h3>
<ul>
<li><b>TCP vs UDP.</b> TCP par TACACS+ ko turant pata chal jaata hai ki server unreachable hai (connection fail hota hai). UDP par RADIUS ko timeouts aur retransmissions ka intezaar karna padta hai.</li>
<li><b>Full vs partial encryption.</b> RADIUS ke saath packets capture karne wala attacker username aur doosre attributes dekh sakta hai; TACACS+ ke saath poori body shared key se encrypted hoti hai.</li>
<li><b>Alag functions.</b> Kyunki TACACS+ authorization ko alag rakhta hai, router har command se pehle pooch sakta hai "kya netadmin <code>configure terminal</code> chala sakta hai?", aur har ek ke liye accounting record bhej sakta hai.</li>
</ul>

<h3>Local fallback: ERROR versus FAIL</h3>
<p>Central AAA ek naya risk laata hai: agar server unreachable hai, to koi login nahi kar sakta, woh engineer bhi nahi jo problem theek karne ki koshish kar raha hai. Isliye aap ek se zyada <b>method</b> list karte ho, jaise "TACACS+ group, phir local". Jo rule yaad rakhna hai:</p>
<ul>
<li>Agar server <b>jawab nahi deta</b> (ERROR: timeout, unreachable), IOS agle method par jaata hai, local database.</li>
<li>Agar server <b>"reject" jawab deta hai</b> (FAIL: galat password, disabled account), IOS ruk jaata hai. Woh local database <b>try nahi</b> karta.</li>
</ul>
<p>Yeh jaan boojh kar hai: Active Directory mein disabled user purane local password se andar nahi aana chahiye. Local accounts <b>emergency ("break-glass") accounts</b> ban jaate hain, jo sirf tab use hote hain jab AAA servers down hon.</p>

<div class="eg"><p><b>Worked example.</b> Ek company ke 300 routers aur switches hain, sab TACACS+ par ISE ko point karte hain. Ek engineer, priya, Friday ko chhod deti hai. HR uska Active Directory account disable karta hai; seconds mein woh kisi bhi device mein login nahi kar sakti. Monday ko auditor poochta hai ki pichhle mahine data center firewall par ACL kisne badla; TACACS+ accounting log timestamp ke saath <code>user=ravi, source=10.99.99.14, cmd=access-list 110 permit tcp any host 198.51.100.20 eq 443</code> dikhata hai. Sirf local users ke saath inmein se kuch bhi possible nahi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Kehna ki RADIUS poora packet encrypt karta hai. Ports ulta kar dena (TACACS+ TCP 49 hai, RADIUS UDP 1812/1813). Maan lena ki server password reject kare to local fallback chalu hota hai. 802.1X ke liye TACACS+ use karna (802.1X EAP ke saath RADIUS use karta hai). Kam se kam ek local emergency account rakhna bhool jaana.</p></div>

<div class="exam"><p><b>Exam traps.</b> Authentication = aap kaun ho; authorization = aap kya kar sakte ho; accounting = aapne kya kiya. TACACS+: TCP 49, full encryption, AAA alag, per-command authorization, device administration. RADIUS: UDP 1812/1813, sirf password encryption, authentication aur authorization combined, network access aur 802.1X. Fallback ERROR par hota hai, FAIL par nahi.</p></div>

<div class="scn"><h4>Contractor account jo kabhi mara hi nahi</h4><p>Ek bank ki network team ne ek project ke dauraan 120 switches par contractor ke liye local accounts banaye. Ek saal baad security review mein woh account unmein se 37 par abhi bhi active mila, kyunki kisi ne use har jagah se hataya nahi. Team ne saare device logins ko TACACS+ ke saath ISE par shift kiya, Active Directory groups se jode (NetAdmins privilege 15 ke saath, NetOps restricted command set ke saath), aur har device par ek break-glass local account rakha, vault mein stored. Contractor access ab ek AD group membership hai jo apne aap expire ho jaati hai.</p><p><b>Seekh:</b> AAA yeh list ek jagah rakhta hai ki network kaun manage kar sakta hai, isliye kisi ko hatana ek baar aur har jagah hota hai.</p></div>

<div class="iv"><p class="q">"RADIUS aur TACACS+ compare karo. Device administration ke liye kaunsa use karoge aur kyun?"</p><p>Strong answer: TACACS+ TCP 49 use karta hai, poora payload encrypt karta hai aur authentication, authorization aur accounting ko alag rakhta hai, isliye per-command authorization aur per-command accounting support karta hai; isiliye network devices manage karne wale admins ke liye yahi choice hai. RADIUS UDP 1812/1813 par open standard hai, sirf password encrypt karta hai, authentication aur authorization combine karta hai, aur 802.1X, wireless aur VPN jaise network access ke liye use hota hai. ISE ko server ke roop mein aur ERROR par local fallback, FAIL par nahi, ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AAA = authentication (kaun), authorization (kya allowed), accounting (kya kiya).</li>
<li>Centralised AAA mein AAA client (device), AAA server (ISE) aur identity store (AD) hote hain.</li>
<li>TACACS+: TCP 49, full encryption, AAA alag, per-command control, device admin ke liye.</li>
<li>RADIUS: UDP 1812/1813, sirf password encryption, authN/authZ combined, network access aur 802.1X ke liye.</li>
<li>Local fallback sirf tab use hota hai jab server unreachable ho, reject ke baad kabhi nahi.</li>
</ul></div>
`}};export{e as default};