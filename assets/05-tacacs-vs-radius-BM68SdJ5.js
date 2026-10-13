var e={id:`tacacs-vs-radius`,h:{en:`TACACS+ versus RADIUS in depth`,hi:`TACACS+ vs RADIUS, gehraai se`},body:{en:`
<p>Picture two ways to check visitors into an office. In the first, the receptionist phones security, has a proper conversation over a private line, first "is this person who they claim to be?", then separately "may they enter the server room?", and later "note that they left at 6 p.m.". In the second, the receptionist sends one quick text message, "Is Priya OK to enter?", and gets back one text: "Yes, she is Priya, and give her the blue badge." The first is <b>TACACS+</b>: connection-oriented and fine-grained. The second is <b>RADIUS</b>: fast, combined and built for many simple requests.</p>

<h3>The roles</h3>
<p>The router or switch that asks is the <b>AAA client</b>, called the <b>NAS</b> (network access server) in RADIUS terms. The server, for example Cisco ISE, holds users, groups and policies. Both sides share a secret <b>key</b>. The server identifies each NAS by its <b>source IP address</b> and looks up the matching key; a request from an unknown address is ignored.</p>

<h3>Side by side</h3>
<table class="cmp"><tr><th></th><th>TACACS+</th><th>RADIUS</th></tr>
<tr><td>Origin</td><td>Cisco, now RFC 8907</td><td>Open standard, RFC 2865 and 2866</td></tr>
<tr><td>Transport</td><td>TCP port 49</td><td>UDP 1812 authentication, 1813 accounting (legacy 1645, 1646)</td></tr>
<tr><td>What is protected</td><td>The whole packet body (header in clear)</td><td>Only the User-Password attribute</td></tr>
<tr><td>AAA separation</td><td>Authentication, authorization and accounting are separate exchanges</td><td>Authentication and authorization combined in one Access-Accept</td></tr>
<tr><td>Command authorization</td><td>Yes, per command, per user</td><td>No practical per-command authorization</td></tr>
<tr><td>Accounting</td><td>Yes, including every command</td><td>Yes, strong for sessions and network usage</td></tr>
<tr><td>Typical use</td><td>Device administration</td><td>Network access: 802.1X, VPN, Wi-Fi; also admin logins</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="TACACS+ and RADIUS exchanges">
<text x="160" y="20" text-anchor="middle" class="svg-accent" font-size="13">TACACS+ (TCP 49)</text>
<text x="480" y="20" text-anchor="middle" class="svg-accent" font-size="13">RADIUS (UDP 1812)</text>
<rect x="30" y="30" width="80" height="30" rx="6" fill="#bae6fd"/><text x="70" y="50" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<rect x="210" y="30" width="80" height="30" rx="6" fill="#bbf7d0"/><text x="250" y="50" text-anchor="middle" class="svg-ink" font-size="12">ISE</text>
<line x1="70" y1="60" x2="70" y2="280" stroke="#64748b" stroke-dasharray="3 3"/><line x1="250" y1="60" x2="250" y2="280" stroke="#64748b" stroke-dasharray="3 3"/>
<line x1="70" y1="85" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><text x="160" y="80" text-anchor="middle" class="svg-muted" font-size="12">authen START</text>
<line x1="250" y1="110" x2="70" y2="110" stroke="#64748b" stroke-width="2"/><text x="160" y="105" text-anchor="middle" class="svg-muted" font-size="12">REPLY: PASS</text>
<line x1="70" y1="150" x2="250" y2="150" stroke="#64748b" stroke-width="2"/><text x="160" y="145" text-anchor="middle" class="svg-muted" font-size="12">author REQUEST (exec)</text>
<line x1="250" y1="175" x2="70" y2="175" stroke="#64748b" stroke-width="2"/><text x="160" y="170" text-anchor="middle" class="svg-muted" font-size="12">RESPONSE: priv-lvl=15</text>
<line x1="70" y1="215" x2="250" y2="215" stroke="#64748b" stroke-width="2"/><text x="160" y="210" text-anchor="middle" class="svg-muted" font-size="12">acct START / STOP</text>
<line x1="70" y1="255" x2="250" y2="255" stroke="#64748b" stroke-width="2"/><text x="160" y="250" text-anchor="middle" class="svg-muted" font-size="12">author per command</text>
<rect x="350" y="30" width="80" height="30" rx="6" fill="#bae6fd"/><text x="390" y="50" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<rect x="530" y="30" width="80" height="30" rx="6" fill="#bbf7d0"/><text x="570" y="50" text-anchor="middle" class="svg-ink" font-size="12">ISE</text>
<line x1="390" y1="60" x2="390" y2="280" stroke="#64748b" stroke-dasharray="3 3"/><line x1="570" y1="60" x2="570" y2="280" stroke="#64748b" stroke-dasharray="3 3"/>
<line x1="390" y1="85" x2="570" y2="85" stroke="#64748b" stroke-width="2"/><text x="480" y="80" text-anchor="middle" class="svg-muted" font-size="12">Access-Request</text>
<line x1="570" y1="120" x2="390" y2="120" stroke="#64748b" stroke-width="2"/><text x="480" y="115" text-anchor="middle" class="svg-muted" font-size="12">Access-Accept + attributes</text>
<line x1="390" y1="215" x2="570" y2="215" stroke="#64748b" stroke-width="2"/><text x="480" y="210" text-anchor="middle" class="svg-muted" font-size="12">Accounting-Request (1813)</text>
</svg><p class="cap">TACACS+ runs separate conversations for each A; RADIUS answers authentication and authorization in one reply.</p></div>

<h3>How each protocol carries the privilege level</h3>
<p>With TACACS+, the server returns the attribute <code>priv-lvl=15</code> in the authorization response for the <code>shell</code> (exec) service. With RADIUS, the server returns it inside the Access-Accept, usually as the Cisco vendor-specific attribute (VSA) <code>cisco-av-pair = shell:priv-lvl=15</code>, or the standard <code>Service-Type = Administrative</code> (Service-Type 6), which IOS maps to level 15. In both cases the router applies the level only if <code>aaa authorization exec</code> is configured (chapter 7).</p>

<h3>About "encryption"</h3>
<p>Be precise in interviews. TACACS+ obfuscates the body with an MD5-based pad generated from the shared key, a session ID and a sequence number. RADIUS hides only the password, also with an MD5-based method; usernames, attributes and accounting data travel in the clear. Neither is modern cryptography, so both should run over a trusted management network. Newer standards add TLS transports for both protocols (TACACS+ over TLS 1.3 and RADIUS over TLS, known as RadSec) where platforms support them.</p>

<h3>RADIUS message types</h3>
<ul>
<li><b>Access-Request</b>: NAS to server, with username and the hidden password.</li>
<li><b>Access-Accept</b>: success, with authorization attributes.</li>
<li><b>Access-Reject</b>: wrong username or password, or policy says no.</li>
<li><b>Access-Challenge</b>: server asks for more, for example a one-time code or an EAP step in 802.1X.</li>
<li><b>Accounting-Request / Accounting-Response</b>: start, interim and stop records on port 1813.</li>
</ul>
<p>TACACS+ uses START, REPLY and CONTINUE for authentication, REQUEST and RESPONSE for authorization and accounting.</p>

<div class="eg"><p><b>Worked example.</b> The lab ISE server holds netadmin with privilege 15 and helpdesk with privilege 1. With TACACS+, helpdesk types <code>configure terminal</code>. If command authorization is on, R1 sends an authorization REQUEST "cmd=configure terminal" and ISE answers FAIL, so the router prints "Command authorization failed." With RADIUS you cannot do that per command; you can only give helpdesk a privilege level and rely on local command levels.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using the old ports. Some servers still listen on 1645/1646, most on 1812/1813. A NAS pointed at the wrong port sees pure timeouts. On IOS XE set them explicitly with <code>auth-port 1812 acct-port 1813</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which protocol separates authentication and authorization?" TACACS+. "Which encrypts only the password?" RADIUS. "Which uses TCP?" TACACS+ on 49. "Which is preferred for 802.1X?" RADIUS, because EAP runs inside RADIUS. "Which supports per-command authorization?" TACACS+.</p></div>

<div class="scn"><h4>An auditor asks for command history</h4><p>After a routing outage an auditor asked, "Who typed <code>no router bgp</code> on the edge router?" The company used RADIUS for admin logins, so accounting showed only session start and stop records: three engineers were logged in at the time, but not what each typed. The team moved device administration to TACACS+ with <code>aaa accounting commands 15 default start-stop group tacacs+</code> and kept RADIUS for 802.1X and VPN.</p><p><b>Lesson:</b> use TACACS+ for device administration when you need per-command authorization and per-command accounting.</p></div>

<div class="iv"><p class="q">"Compare TACACS+ and RADIUS. When would you use each?"</p><p>Hit the five facts: transport (TCP 49 versus UDP 1812/1813), protection (whole body versus password only), separation of AAA (separate versus combined), per-command authorization (TACACS+ only) and typical use (device admin versus network access such as 802.1X and VPN). Close with a design: TACACS+ for engineers logging in to devices, RADIUS for users and endpoints joining the network, often both on the same ISE cluster.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>TACACS+: TCP 49, whole body obfuscated, separate A's, per-command authorization and accounting.</li>
<li>RADIUS: UDP 1812/1813 (legacy 1645/1646), only password hidden, authentication and authorization combined.</li>
<li>Privilege arrives as <code>priv-lvl=15</code> (TACACS+) or <code>shell:priv-lvl=15</code> / Service-Type Administrative (RADIUS).</li>
<li>The server identifies the NAS by source IP and key; unknown sources are ignored.</li>
<li>TACACS+ for device administration, RADIUS for network access such as 802.1X, VPN and Wi-Fi.</li>
</ul></div>
`,hi:`
<p>Office mein visitors ko check-in karne ke do tareeke socho. Pehle mein receptionist security ko phone karta hai, private line par theek se baat karta hai, pehle "kya yeh wahi hai jo kehta hai?", phir alag se "kya yeh server room mein jaa sakta hai?", aur baad mein "note karo ki yeh 6 baje gaya". Doosre mein receptionist ek chhota text bhejta hai, "Kya Priya andar aa sakti hai?", aur ek text wapas aata hai: "Haan, yeh Priya hai, aur ise blue badge do." Pehla <b>TACACS+</b> hai: connection-oriented aur baareek. Doosra <b>RADIUS</b> hai: tez, combined aur bahut saari simple requests ke liye bana.</p>

<h3>Roles</h3>
<p>Jo router ya switch poochhta hai woh <b>AAA client</b> hai, RADIUS ki bhasha mein <b>NAS</b> (network access server). Server, jaise Cisco ISE, users, groups aur policies rakhta hai. Dono taraf ek shared secret <b>key</b> hoti hai. Server har NAS ko uske <b>source IP address</b> se pehchanta hai aur matching key dhoondhta hai; anjaan address se aayi request ignore hoti hai.</p>

<h3>Aamne saamne</h3>
<table class="cmp"><tr><th></th><th>TACACS+</th><th>RADIUS</th></tr>
<tr><td>Origin</td><td>Cisco, ab RFC 8907</td><td>Open standard, RFC 2865 aur 2866</td></tr>
<tr><td>Transport</td><td>TCP port 49</td><td>UDP 1812 authentication, 1813 accounting (purane 1645, 1646)</td></tr>
<tr><td>Kya protected hai</td><td>Poori packet body (header clear mein)</td><td>Sirf User-Password attribute</td></tr>
<tr><td>AAA separation</td><td>Authentication, authorization aur accounting alag exchanges</td><td>Authentication aur authorization ek Access-Accept mein saath</td></tr>
<tr><td>Command authorization</td><td>Haan, har command, har user</td><td>Practical per-command authorization nahi</td></tr>
<tr><td>Accounting</td><td>Haan, har command samet</td><td>Haan, sessions aur network usage ke liye mazboot</td></tr>
<tr><td>Aam use</td><td>Device administration</td><td>Network access: 802.1X, VPN, Wi-Fi; admin logins bhi</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="TACACS+ aur RADIUS exchanges">
<text x="160" y="20" text-anchor="middle" class="svg-accent" font-size="13">TACACS+ (TCP 49)</text>
<text x="480" y="20" text-anchor="middle" class="svg-accent" font-size="13">RADIUS (UDP 1812)</text>
<rect x="30" y="30" width="80" height="30" rx="6" fill="#bae6fd"/><text x="70" y="50" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<rect x="210" y="30" width="80" height="30" rx="6" fill="#bbf7d0"/><text x="250" y="50" text-anchor="middle" class="svg-ink" font-size="12">ISE</text>
<line x1="70" y1="60" x2="70" y2="280" stroke="#64748b" stroke-dasharray="3 3"/><line x1="250" y1="60" x2="250" y2="280" stroke="#64748b" stroke-dasharray="3 3"/>
<line x1="70" y1="85" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><text x="160" y="80" text-anchor="middle" class="svg-muted" font-size="12">authen START</text>
<line x1="250" y1="110" x2="70" y2="110" stroke="#64748b" stroke-width="2"/><text x="160" y="105" text-anchor="middle" class="svg-muted" font-size="12">REPLY: PASS</text>
<line x1="70" y1="150" x2="250" y2="150" stroke="#64748b" stroke-width="2"/><text x="160" y="145" text-anchor="middle" class="svg-muted" font-size="12">author REQUEST (exec)</text>
<line x1="250" y1="175" x2="70" y2="175" stroke="#64748b" stroke-width="2"/><text x="160" y="170" text-anchor="middle" class="svg-muted" font-size="12">RESPONSE: priv-lvl=15</text>
<line x1="70" y1="215" x2="250" y2="215" stroke="#64748b" stroke-width="2"/><text x="160" y="210" text-anchor="middle" class="svg-muted" font-size="12">acct START / STOP</text>
<line x1="70" y1="255" x2="250" y2="255" stroke="#64748b" stroke-width="2"/><text x="160" y="250" text-anchor="middle" class="svg-muted" font-size="12">har command ka author</text>
<rect x="350" y="30" width="80" height="30" rx="6" fill="#bae6fd"/><text x="390" y="50" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<rect x="530" y="30" width="80" height="30" rx="6" fill="#bbf7d0"/><text x="570" y="50" text-anchor="middle" class="svg-ink" font-size="12">ISE</text>
<line x1="390" y1="60" x2="390" y2="280" stroke="#64748b" stroke-dasharray="3 3"/><line x1="570" y1="60" x2="570" y2="280" stroke="#64748b" stroke-dasharray="3 3"/>
<line x1="390" y1="85" x2="570" y2="85" stroke="#64748b" stroke-width="2"/><text x="480" y="80" text-anchor="middle" class="svg-muted" font-size="12">Access-Request</text>
<line x1="570" y1="120" x2="390" y2="120" stroke="#64748b" stroke-width="2"/><text x="480" y="115" text-anchor="middle" class="svg-muted" font-size="12">Access-Accept + attributes</text>
<line x1="390" y1="215" x2="570" y2="215" stroke="#64748b" stroke-width="2"/><text x="480" y="210" text-anchor="middle" class="svg-muted" font-size="12">Accounting-Request (1813)</text>
</svg><p class="cap">TACACS+ har A ke liye alag baatcheet karta hai; RADIUS authentication aur authorization ka jawab ek reply mein deta hai.</p></div>

<h3>Har protocol privilege level kaise le jaata hai</h3>
<p>TACACS+ mein server <code>shell</code> (exec) service ke authorization response mein attribute <code>priv-lvl=15</code> lautata hai. RADIUS mein server ise Access-Accept ke andar lautata hai, aam taur par Cisco vendor-specific attribute (VSA) <code>cisco-av-pair = shell:priv-lvl=15</code> ki tarah, ya standard <code>Service-Type = Administrative</code> (Service-Type 6), jise IOS level 15 par map karta hai. Dono cases mein router level tabhi lagu karta hai jab <code>aaa authorization exec</code> configured ho (chapter 7).</p>

<h3>"Encryption" ke baare mein</h3>
<p>Interviews mein sateek raho. TACACS+ body ko shared key, session ID aur sequence number se bane MD5-based pad se obfuscate karta hai. RADIUS sirf password chhupata hai, woh bhi MD5-based tareeke se; usernames, attributes aur accounting data clear mein jaate hain. Dono mein se koi modern cryptography nahi hai, isliye dono ko trusted management network par chalna chahiye. Naye standards dono protocols ke liye TLS transports jodte hain (TACACS+ over TLS 1.3 aur RADIUS over TLS, jise RadSec kehte hain) jahan platforms support karein.</p>

<h3>RADIUS message types</h3>
<ul>
<li><b>Access-Request</b>: NAS se server, username aur chhupe password ke saath.</li>
<li><b>Access-Accept</b>: safalta, authorization attributes ke saath.</li>
<li><b>Access-Reject</b>: galat username ya password, ya policy mana karti hai.</li>
<li><b>Access-Challenge</b>: server aur maangta hai, jaise one-time code ya 802.1X mein EAP step.</li>
<li><b>Accounting-Request / Accounting-Response</b>: port 1813 par start, interim aur stop records.</li>
</ul>
<p>TACACS+ authentication ke liye START, REPLY aur CONTINUE, aur authorization aur accounting ke liye REQUEST aur RESPONSE use karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Lab ka ISE server netadmin ko privilege 15 aur helpdesk ko privilege 1 ke saath rakhta hai. TACACS+ ke saath helpdesk <code>configure terminal</code> type karta hai. Agar command authorization on hai, to R1 authorization REQUEST "cmd=configure terminal" bhejta hai aur ISE FAIL jawab deta hai, isliye router "Command authorization failed." print karta hai. RADIUS ke saath aap yeh per command nahi kar sakte; aap helpdesk ko sirf privilege level de sakte ho aur local command levels par bharosa kar sakte ho.</p></div>

<div class="warn"><p><b>Common galti.</b> Purane ports use karna. Kuch servers ab bhi 1645/1646 par sunte hain, zyada tar 1812/1813 par. Galat port par point kiya NAS sirf timeouts dekhta hai. IOS XE par inhe <code>auth-port 1812 acct-port 1813</code> se saaf set karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa protocol authentication aur authorization alag karta hai?" TACACS+. "Kaunsa sirf password encrypt karta hai?" RADIUS. "Kaunsa TCP use karta hai?" TACACS+, port 49 par. "802.1X ke liye kaunsa preferred hai?" RADIUS, kyunki EAP RADIUS ke andar chalta hai. "Kaunsa per-command authorization support karta hai?" TACACS+.</p></div>

<div class="scn"><h4>Auditor command history maangta hai</h4><p>Ek routing outage ke baad auditor ne poochha, "Edge router par <code>no router bgp</code> kisne type kiya?" Company admin logins ke liye RADIUS use karti thi, isliye accounting sirf session start aur stop records dikhati thi: us waqt teen engineers logged in the, lekin kisne kya type kiya yeh nahi. Team ne device administration ko <code>aaa accounting commands 15 default start-stop group tacacs+</code> ke saath TACACS+ par shift kiya aur RADIUS ko 802.1X aur VPN ke liye rakha.</p><p><b>Seekh:</b> jab per-command authorization aur per-command accounting chahiye, to device administration ke liye TACACS+ use karo.</p></div>

<div class="iv"><p class="q">"TACACS+ aur RADIUS compare karo. Har ek kab use karoge?"</p><p>Paanch facts bolo: transport (TCP 49 vs UDP 1812/1813), protection (poori body vs sirf password), AAA ka separation (alag vs combined), per-command authorization (sirf TACACS+) aur aam use (device admin vs 802.1X aur VPN jaisa network access). Design ke saath khatam karo: devices mein login karne wale engineers ke liye TACACS+, network join karne wale users aur endpoints ke liye RADIUS, aksar dono same ISE cluster par.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>TACACS+: TCP 49, poori body obfuscated, alag A's, per-command authorization aur accounting.</li>
<li>RADIUS: UDP 1812/1813 (purane 1645/1646), sirf password chhupa, authentication aur authorization saath.</li>
<li>Privilege <code>priv-lvl=15</code> (TACACS+) ya <code>shell:priv-lvl=15</code> / Service-Type Administrative (RADIUS) ki tarah aata hai.</li>
<li>Server NAS ko source IP aur key se pehchanta hai; anjaan sources ignore hote hain.</li>
<li>Device administration ke liye TACACS+, 802.1X, VPN aur Wi-Fi jaise network access ke liye RADIUS.</li>
</ul></div>
`}};export{e as default};