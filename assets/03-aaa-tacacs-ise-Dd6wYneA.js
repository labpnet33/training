var e={id:`aaa-tacacs-ise`,h:{en:`AAA for device administration: TACACS+, RADIUS and Cisco ISE`,hi:`Device administration ke liye AAA: TACACS+, RADIUS aur Cisco ISE`},body:{en:`
<p>At an airport you pass three separate checks. At check-in they confirm your identity with your passport (<b>authentication</b>). At the gate your boarding pass decides which plane and which seat you may use (<b>authorization</b>). And the airline keeps a record of who boarded which flight and when (<b>accounting</b>). AAA on a network device is exactly this, with the router as the gate and an AAA server as the airline's central system.</p>

<h3>Two jobs, two protocols</h3>
<p>AAA serves two very different customers. <b>Network access</b> means users and endpoints joining the network through 802.1X, MAB or VPN; that is RADIUS territory and belongs to the ISE module later in this track. <b>Device administration</b> means engineers logging in to the CLI of routers, switches and firewalls; that is where TACACS+ shines.</p>
<table class="cmp">
<tr><th></th><th>TACACS+</th><th>RADIUS</th></tr>
<tr><td>Transport</td><td>TCP port 49 (reliable, connection-oriented)</td><td>UDP 1812 auth, 1813 accounting (legacy 1645/1646)</td></tr>
<tr><td>Protection</td><td>whole packet body obfuscated with the shared key; only the 12-byte header is clear</td><td>only the User-Password attribute is hidden</td></tr>
<tr><td>AAA split</td><td>authentication, authorization and accounting are separate exchanges</td><td>authentication and authorization combined in Access-Accept</td></tr>
<tr><td>Per-command authorization</td><td>yes, every command can be checked</td><td>no</td></tr>
<tr><td>Typical use</td><td>device administration</td><td>network access (802.1X, VPN)</td></tr>
<tr><td>Origin</td><td>Cisco, published as an informational RFC</td><td>IETF standard</td></tr>
</table>

<h3>How a TACACS+ login flows</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="TACACS+ exchanges">
<rect x="20" y="20" width="120" height="40" rx="8" fill="#e2e8f0"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="13">PC-ADMIN</text>
<rect x="260" y="20" width="120" height="40" rx="8" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">R1 (NAS)</text>
<rect x="500" y="20" width="120" height="40" rx="8" fill="#ddd6fe"/><text x="560" y="45" text-anchor="middle" class="svg-ink" font-size="13">ISE</text>
<line x1="80" y1="60" x2="80" y2="290" stroke="#64748b" stroke-dasharray="4 4"/><line x1="320" y1="60" x2="320" y2="290" stroke="#64748b" stroke-dasharray="4 4"/><line x1="560" y1="60" x2="560" y2="290" stroke="#64748b" stroke-dasharray="4 4"/>
<line x1="80" y1="85" x2="320" y2="85" stroke="#64748b" stroke-width="2"/><text x="200" y="80" text-anchor="middle" class="svg-muted" font-size="12">SSH: netadmin</text>
<line x1="320" y1="115" x2="560" y2="115" stroke="#64748b" stroke-width="2"/><text x="440" y="110" text-anchor="middle" class="svg-accent" font-size="12">AUTHEN START / CONTINUE</text>
<line x1="560" y1="140" x2="320" y2="140" stroke="#64748b" stroke-width="2"/><text x="440" y="135" text-anchor="middle" class="svg-muted" font-size="12">REPLY: PASS</text>
<line x1="320" y1="170" x2="560" y2="170" stroke="#64748b" stroke-width="2"/><text x="440" y="165" text-anchor="middle" class="svg-accent" font-size="12">AUTHOR REQUEST (shell)</text>
<line x1="560" y1="195" x2="320" y2="195" stroke="#64748b" stroke-width="2"/><text x="440" y="190" text-anchor="middle" class="svg-muted" font-size="12">PASS_ADD priv-lvl=15</text>
<line x1="320" y1="225" x2="560" y2="225" stroke="#64748b" stroke-width="2"/><text x="440" y="220" text-anchor="middle" class="svg-accent" font-size="12">AUTHOR: cmd=configure</text>
<line x1="320" y1="260" x2="560" y2="260" stroke="#64748b" stroke-width="2"/><text x="440" y="255" text-anchor="middle" class="svg-accent" font-size="12">ACCT START / STOP</text>
</svg><p class="cap">Separate authentication, authorization and accounting exchanges over TCP 49 between R1 and ISE.</p></div>
<p>The router (the <b>NAS</b>, network access server) opens TCP 49 to ISE. First comes an <b>authentication</b> exchange (START, REPLY asking for the password, CONTINUE with the password, final REPLY PASS or FAIL). Then an <b>authorization</b> request for the shell service, which returns attributes such as <code>priv-lvl=15</code>. After that, if command authorization is on, every command becomes its own small authorization request. Finally <b>accounting</b> records START and STOP for the session and for each command.</p>

<h3>Cisco ISE as a TACACS+ server</h3>
<p>ISE handles device administration in the <b>Work Centers &gt; Device Administration</b> area. The building blocks you configure are:</p>
<dl class="terms">
<dt>Device Admin service</dt><dd>Enabled per Policy Service Node in the deployment settings; it needs a Device Admin licence. Without it ISE simply does not listen on TCP 49.</dd>
<dt>Network device</dt><dd>R1 defined by its IP address (10.10.10.1) with <b>TACACS+ Authentication Settings</b> and the shared secret <code>NK-t4c-26</code>. ISE silently ignores requests from an address it does not know.</dd>
<dt>Identity source</dt><dd>Internal users or, more commonly, Active Directory groups such as NetAdmins and Helpdesk.</dd>
<dt>Device Admin policy set</dt><dd>Matches requests (for example, Device Type equals Routers) and holds an authentication policy and an authorization policy.</dd>
<dt>TACACS+ profile (shell profile)</dt><dd>Returns the default and maximum privilege level, for example 15 for netadmin and 1 for helpdesk.</dd>
<dt>Command set</dt><dd>A list of permit or deny rules on commands and arguments, for example permit <code>show</code> with any arguments and deny <code>configure</code>. Used when the router asks per-command authorization.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> The lab's ISE has two users. <code>netadmin</code> (password Adm!n-26) is in the NetAdmins group; the authorization rule returns shell profile "Priv15" and command set "PermitAll". <code>helpdesk</code> (password Help-26) is in Helpdesk; the rule returns shell profile "Priv1" and command set "ShowOnly" (permit show, permit ping, permit traceroute, deny everything else). When helpdesk types <code>show ip interface brief</code> the command set permits it; when helpdesk tries <code>configure terminal</code> ISE answers FAIL and R1 prints <code>Command authorization failed.</code></p></div>

<h3>Can RADIUS do device administration?</h3>
<p>Yes, and some shops do it to keep one protocol. ISE returns <code>Service-Type = Administrative</code> or the Cisco AV-pair <code>shell:priv-lvl=15</code>, and the router places the user at that level. What RADIUS cannot do is authorize each command, so fine-grained control and per-command audit are lost. That is why SCOR and real designs pair <b>TACACS+ for device admin</b> with <b>RADIUS for network access</b>. Where RADIUS is used, current guidance is to require the Message-Authenticator attribute on every packet and to consider RADIUS over TLS (RadSec) toward the server.</p>

<div class="warn"><p><b>Common mistake.</b> Assuming TACACS+ is "encrypted like TLS". The body obfuscation uses an MD5-based pad derived from the shared key, which is weak by modern standards. Use long random keys, keep AAA traffic on a management network, and treat the shared secret like a password.</p></div>

<div class="exam"><p><b>Exam trap.</b> TACACS+ = TCP 49, full body protected, separate AAA, per-command authorization. RADIUS = UDP 1812/1813, only the password hidden, authentication and authorization combined. If a question mentions "command authorization", the answer is TACACS+.</p></div>

<div class="scn"><h4>The firewall team that used RADIUS</h4><p>An auditor asked a bank for a list of every configuration command run on its firewalls in March. The firewall team authenticated admins with RADIUS, so logins were recorded but individual commands were not. The network team, using TACACS+ command accounting, produced the report in minutes. The firewalls were moved to TACACS+ with a command-accounting policy on ISE.</p><p><b>Lesson:</b> RADIUS can place admins at a privilege level, but only TACACS+ gives per-command authorization and accounting.</p></div>

<div class="iv"><p class="q">"Why would you choose TACACS+ over RADIUS for device administration?"</p><p>Give three reasons: TACACS+ separates authentication, authorization and accounting, so each command can be authorized and logged; it protects the whole packet body, not just the password; and it runs over TCP 49, so the router knows immediately when the server is down. Add that RADIUS stays the right choice for 802.1X and VPN network access.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AAA = authentication (who), authorization (what) and accounting (what was done).</li>
<li>TACACS+ (TCP 49, full body, separate AAA, per-command) for device admin; RADIUS (UDP 1812/1813) for network access.</li>
<li>ISE needs the Device Admin service enabled, the NAS defined with its IP and shared secret, and a Device Admin policy set.</li>
<li>Shell profiles return privilege levels; command sets permit or deny individual commands.</li>
<li>TACACS+ obfuscation is not strong crypto; protect the path and use long keys.</li>
</ul></div>
`,hi:`
<p>Airport par aap teen alag checks se guzarte ho. Check-in par woh passport se aapki pehchaan confirm karte hain (<b>authentication</b>). Gate par aapka boarding pass tay karta hai ki aap kaunsa plane aur kaunsi seat use kar sakte ho (<b>authorization</b>). Aur airline record rakhti hai ki kaun kis flight mein kab chadha (<b>accounting</b>). Network device par AAA bilkul yahi hai, jahan router gate hai aur AAA server airline ka central system.</p>

<h3>Do kaam, do protocols</h3>
<p>AAA do bilkul alag customers ko serve karta hai. <b>Network access</b> ka matlab hai users aur endpoints ka 802.1X, MAB ya VPN se network join karna; yeh RADIUS ka ilaaka hai aur is track mein baad ke ISE module ka hissa hai. <b>Device administration</b> ka matlab hai engineers ka routers, switches aur firewalls ke CLI mein login karna; yahan TACACS+ chamakta hai.</p>
<table class="cmp">
<tr><th></th><th>TACACS+</th><th>RADIUS</th></tr>
<tr><td>Transport</td><td>TCP port 49 (reliable, connection-oriented)</td><td>UDP 1812 auth, 1813 accounting (legacy 1645/1646)</td></tr>
<tr><td>Protection</td><td>poora packet body shared key se obfuscate; sirf 12-byte header clear</td><td>sirf User-Password attribute chhupa</td></tr>
<tr><td>AAA split</td><td>authentication, authorization aur accounting alag exchanges</td><td>authentication aur authorization Access-Accept mein combined</td></tr>
<tr><td>Per-command authorization</td><td>haan, har command check ho sakta hai</td><td>nahi</td></tr>
<tr><td>Typical use</td><td>device administration</td><td>network access (802.1X, VPN)</td></tr>
<tr><td>Origin</td><td>Cisco, informational RFC ke roop mein published</td><td>IETF standard</td></tr>
</table>

<h3>TACACS+ login kaise flow hota hai</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="TACACS+ exchanges">
<rect x="20" y="20" width="120" height="40" rx="8" fill="#e2e8f0"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="13">PC-ADMIN</text>
<rect x="260" y="20" width="120" height="40" rx="8" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">R1 (NAS)</text>
<rect x="500" y="20" width="120" height="40" rx="8" fill="#ddd6fe"/><text x="560" y="45" text-anchor="middle" class="svg-ink" font-size="13">ISE</text>
<line x1="80" y1="60" x2="80" y2="290" stroke="#64748b" stroke-dasharray="4 4"/><line x1="320" y1="60" x2="320" y2="290" stroke="#64748b" stroke-dasharray="4 4"/><line x1="560" y1="60" x2="560" y2="290" stroke="#64748b" stroke-dasharray="4 4"/>
<line x1="80" y1="85" x2="320" y2="85" stroke="#64748b" stroke-width="2"/><text x="200" y="80" text-anchor="middle" class="svg-muted" font-size="12">SSH: netadmin</text>
<line x1="320" y1="115" x2="560" y2="115" stroke="#64748b" stroke-width="2"/><text x="440" y="110" text-anchor="middle" class="svg-accent" font-size="12">AUTHEN START / CONTINUE</text>
<line x1="560" y1="140" x2="320" y2="140" stroke="#64748b" stroke-width="2"/><text x="440" y="135" text-anchor="middle" class="svg-muted" font-size="12">REPLY: PASS</text>
<line x1="320" y1="170" x2="560" y2="170" stroke="#64748b" stroke-width="2"/><text x="440" y="165" text-anchor="middle" class="svg-accent" font-size="12">AUTHOR REQUEST (shell)</text>
<line x1="560" y1="195" x2="320" y2="195" stroke="#64748b" stroke-width="2"/><text x="440" y="190" text-anchor="middle" class="svg-muted" font-size="12">PASS_ADD priv-lvl=15</text>
<line x1="320" y1="225" x2="560" y2="225" stroke="#64748b" stroke-width="2"/><text x="440" y="220" text-anchor="middle" class="svg-accent" font-size="12">AUTHOR: cmd=configure</text>
<line x1="320" y1="260" x2="560" y2="260" stroke="#64748b" stroke-width="2"/><text x="440" y="255" text-anchor="middle" class="svg-accent" font-size="12">ACCT START / STOP</text>
</svg><p class="cap">R1 aur ISE ke beech TCP 49 par alag authentication, authorization aur accounting exchanges.</p></div>
<p>Router (<b>NAS</b>, network access server) ISE ki taraf TCP 49 kholta hai. Pehle ek <b>authentication</b> exchange aata hai (START, password maangne wala REPLY, password ke saath CONTINUE, final REPLY PASS ya FAIL). Phir shell service ke liye ek <b>authorization</b> request, jo <code>priv-lvl=15</code> jaise attributes lautata hai. Uske baad, agar command authorization on hai, to har command apni chhoti authorization request ban jaata hai. Aakhir mein <b>accounting</b> session aur har command ke liye START aur STOP record karta hai.</p>

<h3>TACACS+ server ke roop mein Cisco ISE</h3>
<p>ISE device administration ko <b>Work Centers &gt; Device Administration</b> area mein handle karta hai. Jo building blocks aap configure karte ho:</p>
<dl class="terms">
<dt>Device Admin service</dt><dd>Deployment settings mein har Policy Service Node par enable hoti hai; ise Device Admin licence chahiye. Iske bina ISE TCP 49 par sunta hi nahi.</dd>
<dt>Network device</dt><dd>R1 apne IP address (10.10.10.1) ke saath define, <b>TACACS+ Authentication Settings</b> aur shared secret <code>NK-t4c-26</code> ke saath. ISE us address ki requests chupchaap ignore karta hai jise woh nahi jaanta.</dd>
<dt>Identity source</dt><dd>Internal users ya, zyada common, Active Directory groups jaise NetAdmins aur Helpdesk.</dd>
<dt>Device Admin policy set</dt><dd>Requests match karta hai (jaise Device Type equals Routers) aur ek authentication policy aur ek authorization policy rakhta hai.</dd>
<dt>TACACS+ profile (shell profile)</dt><dd>Default aur maximum privilege level lautata hai, jaise netadmin ke liye 15 aur helpdesk ke liye 1.</dd>
<dt>Command set</dt><dd>Commands aur arguments par permit ya deny rules ki list, jaise kisi bhi arguments ke saath <code>show</code> permit aur <code>configure</code> deny. Tab use hota hai jab router per-command authorization maangta hai.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> Lab ke ISE mein do users hain. <code>netadmin</code> (password Adm!n-26) NetAdmins group mein hai; authorization rule shell profile "Priv15" aur command set "PermitAll" lautata hai. <code>helpdesk</code> (password Help-26) Helpdesk mein hai; rule shell profile "Priv1" aur command set "ShowOnly" (show permit, ping permit, traceroute permit, baaki sab deny) lautata hai. Jab helpdesk <code>show ip interface brief</code> type karta hai to command set use permit karta hai; jab helpdesk <code>configure terminal</code> try karta hai to ISE FAIL jawab deta hai aur R1 <code>Command authorization failed.</code> print karta hai.</p></div>

<h3>Kya RADIUS device administration kar sakta hai?</h3>
<p>Haan, aur kuch shops ek protocol rakhne ke liye aisa karti hain. ISE <code>Service-Type = Administrative</code> ya Cisco AV-pair <code>shell:priv-lvl=15</code> lautata hai, aur router user ko us level par rakhta hai. RADIUS jo nahi kar sakta woh hai har command authorize karna, isliye fine-grained control aur per-command audit kho jaate hain. Isiliye SCOR aur real designs <b>device admin ke liye TACACS+</b> ko <b>network access ke liye RADIUS</b> ke saath jodte hain. Jahan RADIUS use hota hai, wahan current guidance hai ki har packet par Message-Authenticator attribute zaroori karo aur server ki taraf RADIUS over TLS (RadSec) par vichaar karo.</p>

<div class="warn"><p><b>Common galti.</b> Yeh maan lena ki TACACS+ "TLS jaisa encrypted" hai. Body obfuscation shared key se bane MD5-based pad ka use karta hai, jo aaj ke standards se kamzor hai. Lambi random keys use karo, AAA traffic ko management network par rakho, aur shared secret ko password ki tarah treat karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> TACACS+ = TCP 49, poora body protected, alag AAA, per-command authorization. RADIUS = UDP 1812/1813, sirf password chhupa, authentication aur authorization combined. Agar question mein "command authorization" ka zikr hai, to jawab TACACS+ hai.</p></div>

<div class="scn"><h4>Firewall team jo RADIUS use karti thi</h4><p>Ek auditor ne bank se March mein uske firewalls par chale har configuration command ki list maangi. Firewall team admins ko RADIUS se authenticate karti thi, isliye logins record the par individual commands nahi. Network team ne, TACACS+ command accounting use karte hue, minutes mein report bana di. Firewalls ko ISE par command-accounting policy ke saath TACACS+ par shift kiya gaya.</p><p><b>Seekh:</b> RADIUS admins ko ek privilege level par rakh sakta hai, par sirf TACACS+ per-command authorization aur accounting deta hai.</p></div>

<div class="iv"><p class="q">"Device administration ke liye aap RADIUS ki jagah TACACS+ kyun chunoge?"</p><p>Teen wajah do: TACACS+ authentication, authorization aur accounting ko alag karta hai, isliye har command authorize aur log ho sakta hai; yeh sirf password nahi, poora packet body protect karta hai; aur yeh TCP 49 par chalta hai, isliye router ko turant pata chal jaata hai jab server down ho. Jodo ki 802.1X aur VPN network access ke liye RADIUS hi sahi choice rehta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AAA = authentication (kaun), authorization (kya) aur accounting (kya kiya gaya).</li>
<li>Device admin ke liye TACACS+ (TCP 49, poora body, alag AAA, per-command); network access ke liye RADIUS (UDP 1812/1813).</li>
<li>ISE ko Device Admin service enabled, NAS apne IP aur shared secret ke saath defined, aur ek Device Admin policy set chahiye.</li>
<li>Shell profiles privilege levels lautate hain; command sets individual commands permit ya deny karte hain.</li>
<li>TACACS+ obfuscation strong crypto nahi hai; path protect karo aur lambi keys use karo.</li>
</ul></div>
`}};export{e as default};