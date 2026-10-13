var e={id:`identity`,h:{en:`Identity and access from zero: AAA, RADIUS, TACACS+, MFA, SSO and zero trust`,hi:`Identity aur access zero se: AAA, RADIUS, TACACS+, MFA, SSO aur zero trust`},body:{en:`
<p>At a hotel, the reception checks your ID (who are you?), gives you a key card that opens only your room, the gym and the lift (what may you do?), and the card system records every door you open (what did you do?). If you lose the card, they cancel it and issue a new one. That is identity and access management. Attackers today prefer logging in to breaking in, which is why identity is often called the new perimeter.</p>

<h3>AAA: three separate questions</h3>
<dl class="terms">
<dt>Authentication</dt><dd>Who are you? Proven with a password, certificate, token or biometric.</dd>
<dt>Authorisation</dt><dd>What are you allowed to do? A VLAN, an ACL, a privilege level, a list of permitted commands, an application.</dd>
<dt>Accounting</dt><dd>What did you do and when? Session start and stop, commands typed, bytes used. Essential for investigations and audits.</dd>
</dl>
<p>Authentication factors come in three kinds: something you <b>know</b> (password, PIN), something you <b>have</b> (phone app, hardware key, smart card), something you <b>are</b> (fingerprint, face). <b>Multi-factor authentication (MFA)</b> needs two or more different kinds; two passwords are still one factor.</p>

<h3>RADIUS and TACACS+</h3>
<p>Network devices do not keep thousands of user accounts. They ask a central <b>AAA server</b>, such as Cisco <b>ISE</b>, using one of two protocols:</p>
<table class="cmp"><tr><th></th><th>RADIUS</th><th>TACACS+</th></tr>
<tr><td>Transport</td><td>UDP 1812 (auth), 1813 (accounting)</td><td>TCP 49</td></tr>
<tr><td>Encryption</td><td>Only the password attribute is hidden</td><td>The whole packet body is encrypted</td></tr>
<tr><td>AAA functions</td><td>Authentication and authorisation combined</td><td>All three separated</td></tr>
<tr><td>Per-command authorisation</td><td>No</td><td>Yes</td></tr>
<tr><td>Main use</td><td>Network access: 802.1X, MAB, VPN, wireless</td><td>Device administration: who may log in to routers, switches, firewalls and which commands they may run</td></tr>
</table>
<p>Remember the pair: <b>RADIUS for users onto the network, TACACS+ for admins onto the devices.</b></p>

<pre class="code"><span class="c">! Preview: device administration with TACACS+ (full lab in the AAA module)</span>
aaa new-model
tacacs server ISE-1
 address ipv4 10.1.99.20
 key NkSim-Tacacs-Key
aaa group server tacacs+ ISE-GRP
 server name ISE-1
<span class="c">! Try ISE first, fall back to the local account only if ISE is unreachable</span>
aaa authentication login VTY-AUTH group ISE-GRP local
aaa authorization exec VTY-AUTH group ISE-GRP local
aaa authorization commands 15 VTY-AUTH group ISE-GRP local
aaa accounting commands 15 VTY-AUTH start-stop group ISE-GRP
username breakglass privilege 15 algorithm-type scrypt secret NkSim-Local-Only
line vty 0 4
 login authentication VTY-AUTH
 authorization exec VTY-AUTH
 authorization commands 15 VTY-AUTH
 accounting commands 15 VTY-AUTH
 transport input ssh</pre>

<h3>802.1X and MAB: who is plugged into this port?</h3>
<p><b>802.1X</b> controls access at the switch port or Wi-Fi SSID. Three roles: the <b>supplicant</b> (software on the laptop), the <b>authenticator</b> (the switch or wireless controller) and the <b>authentication server</b> (ISE, via RADIUS). Until authentication succeeds, the port passes only EAP traffic. Devices without a supplicant, such as printers and cameras, use <b>MAB</b> (MAC Authentication Bypass), which is weaker because MAC addresses can be copied. ISE then returns an authorisation: a VLAN, a downloadable ACL or a Security Group Tag.</p>

<pre class="out">SW1# show authentication sessions interface GigabitEthernet1/0/5 details
            Interface:  GigabitEthernet1/0/5
          MAC Address:  0050.56aa.1b2c
         IPv4 Address:  10.1.10.55
            User-Name:  priya@corp.example
               Status:  Authorized
               Domain:  DATA
       Oper host mode:  multi-auth
<span class="hl">Server Policies:
              Vlan Group:  Vlan: 10</span>
Method status list:
       Method           State
          dot1x          Authc Success</pre>
<p>This port shows a user authenticated by 802.1X and placed in VLAN 10 by the policy ISE returned.</p>

<h3>MFA done well</h3>
<p>Not all MFA is equal. SMS codes can be intercepted or SIM-swapped. Simple push approvals invite <b>MFA fatigue</b>: the attacker who already has the password sends push after push until the tired user taps Approve. Better: <b>verified push</b> (the user types a number shown on the login screen), device health checks, and <b>phishing-resistant</b> methods such as <b>FIDO2/WebAuthn</b> security keys or platform passkeys, which are bound to the real website and cannot be replayed on a fake one. Cisco <b>Duo</b> provides these and can block logins from unhealthy or unknown devices.</p>

<h3>Single sign-on</h3>
<p><b>SSO</b> lets a user authenticate once to an <b>identity provider (IdP)</b> and then reach many applications (<b>service providers</b>) without new passwords. <b>SAML 2.0</b> passes signed XML assertions and is common for enterprise web apps; <b>OpenID Connect</b>, built on OAuth 2.0, is common for modern and mobile apps. SSO reduces password reuse and gives one place to enforce MFA and to disable a leaver's access, but the IdP becomes a high-value target that must be protected very carefully.</p>

<h3>Zero trust</h3>
<p>The old model trusted anything inside the network. <b>Zero trust</b> (SCOR topic 1.8) removes implicit trust based on location. Its principles: <b>verify explicitly</b> (user, device and context for every request), <b>least privilege</b> access, and <b>assume breach</b> (segment and monitor everything). In practice that means strong identity with MFA, device posture checks, micro-segmentation, continuous monitoring and <b>ZTNA</b>, which gives a user access to one application rather than a whole network through a VPN.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Zero trust access decision">
<rect x="10" y="20" width="150" height="40" rx="8" fill="#bae6fd"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="13">User + MFA</text>
<rect x="10" y="75" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="85" y="100" text-anchor="middle" class="svg-ink" font-size="13">Device posture</text>
<rect x="10" y="130" width="150" height="40" rx="8" fill="#fde68a"/><text x="85" y="155" text-anchor="middle" class="svg-ink" font-size="13">Context: place, time</text>
<rect x="240" y="65" width="160" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">Policy decision</text><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">every request</text>
<line x1="160" y1="40" x2="240" y2="85" stroke="#64748b" stroke-width="2"/><line x1="160" y1="95" x2="240" y2="95" stroke="#64748b" stroke-width="2"/><line x1="160" y1="150" x2="240" y2="105" stroke="#64748b" stroke-width="2"/>
<rect x="480" y="45" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="555" y="70" text-anchor="middle" class="svg-ink" font-size="13">allow: one app</text>
<rect x="480" y="105" width="150" height="40" rx="8" fill="#fed7aa"/><text x="555" y="130" text-anchor="middle" class="svg-ink" font-size="13">deny or step-up</text>
<line x1="400" y1="85" x2="480" y2="65" stroke="#64748b" stroke-width="2"/><line x1="400" y1="105" x2="480" y2="125" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Zero trust: identity, device and context feed a decision for every request, and access is granted per application.</p></div>

<div class="eg"><p><b>Worked example.</b> A finance user opens the ERP from home. Duo checks the password plus a verified push, then checks the laptop: disk encrypted, OS patched, EDR running. The request comes from India at 10 a.m., which is normal. Access is granted to the ERP application only, through ZTNA. The same user on an unpatched personal tablet is asked to update first, and never sees the rest of the network.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using RADIUS for device administration and losing per-command authorisation and command accounting. No local fallback account, so an ISE outage locks every admin out; or the opposite, a fallback so broad that it is always used. Leaving a switch port in open mode after an 802.1X pilot and forgetting it.</p></div>

<div class="exam"><p><b>Exam trap.</b> TACACS+ = TCP 49, full-body encryption, separate AAA, per-command authorisation. RADIUS = UDP 1812/1813, password-only hiding, combined authN/authZ. Supplicant, authenticator, authentication server: know which device plays which role.</p></div>

<div class="scn"><h4>Twenty-three push notifications at midnight</h4><p>A developer's password was leaked from another site. At midnight the attacker tried to log in to the company VPN and the developer's phone received twenty-three push requests. On the twenty-fourth, half asleep, the developer approved. The SIEM flagged a VPN session from an unusual country right after a burst of denied pushes; the SOC killed the session and reset the password. The company then enabled verified push with number matching and a rule that locks the account after repeated denied pushes.</p><p><b>Lesson:</b> MFA must resist fatigue and phishing; detection of MFA abuse is a control too.</p></div>

<div class="iv"><p class="q">"When would you use TACACS+ instead of RADIUS?"</p><p>Strong answer: TACACS+ for device administration because it runs over TCP 49, encrypts the whole body, separates authentication, authorisation and accounting and supports per-command authorisation and command accounting. RADIUS for network access (802.1X, MAB, VPN, wireless) because it is the standard those protocols use and supports CoA. Mention ISE can do both, and always keep a controlled local fallback account.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AAA: authentication (who), authorisation (what), accounting (record).</li>
<li>RADIUS for network access, TACACS+ for device administration.</li>
<li>802.1X roles: supplicant, authenticator, authentication server; MAB for devices without a supplicant.</li>
<li>Prefer verified push and phishing-resistant MFA (FIDO2); SSO via SAML or OIDC.</li>
<li>Zero trust: verify explicitly, least privilege, assume breach; ZTNA gives per-application access.</li>
</ul></div>
`,hi:`
<p>Hotel mein reception aapka ID check karta hai (aap kaun ho?), aapko ek key card deta hai jo sirf aapka room, gym aur lift kholta hai (aap kya kar sakte ho?), aur card system har us darwaze ko record karta hai jo aap kholte ho (aapne kya kiya?). Card kho jaaye to woh use cancel karke naya dete hain. Yahi identity aur access management hai. Aaj attackers todne ki jagah login karna pasand karte hain, isiliye identity ko aksar naya perimeter kaha jaata hai.</p>

<h3>AAA: teen alag sawaal</h3>
<dl class="terms">
<dt>Authentication</dt><dd>Aap kaun ho? Password, certificate, token ya biometric se prove hota hai.</dd>
<dt>Authorisation</dt><dd>Aapko kya karne ki ijaazat hai? VLAN, ACL, privilege level, permitted commands ki list, ek application.</dd>
<dt>Accounting</dt><dd>Aapne kya kiya aur kab? Session start aur stop, type kiye commands, use hue bytes. Investigations aur audits ke liye zaroori.</dd>
</dl>
<p>Authentication factors teen kism ke hote hain: kuch jo aap <b>jaante</b> ho (password, PIN), kuch jo aapke <b>paas hai</b> (phone app, hardware key, smart card), kuch jo aap <b>ho</b> (fingerprint, face). <b>Multi-factor authentication (MFA)</b> ko do ya zyada alag kism chahiye; do passwords phir bhi ek hi factor hain.</p>

<h3>RADIUS aur TACACS+</h3>
<p>Network devices hazaaron user accounts nahi rakhte. Woh ek central <b>AAA server</b>, jaise Cisco <b>ISE</b>, se do mein se ek protocol use karke poochte hain:</p>
<table class="cmp"><tr><th></th><th>RADIUS</th><th>TACACS+</th></tr>
<tr><td>Transport</td><td>UDP 1812 (auth), 1813 (accounting)</td><td>TCP 49</td></tr>
<tr><td>Encryption</td><td>Sirf password attribute chhupta hai</td><td>Poora packet body encrypted hota hai</td></tr>
<tr><td>AAA functions</td><td>Authentication aur authorisation combined</td><td>Teeno alag</td></tr>
<tr><td>Per-command authorisation</td><td>Nahi</td><td>Haan</td></tr>
<tr><td>Main use</td><td>Network access: 802.1X, MAB, VPN, wireless</td><td>Device administration: kaun routers, switches, firewalls mein login kar sakta hai aur kaunse commands chala sakta hai</td></tr>
</table>
<p>Pair yaad rakho: <b>users ko network par laane ke liye RADIUS, admins ko devices par laane ke liye TACACS+.</b></p>

<pre class="code"><span class="c">! Preview: TACACS+ ke saath device administration (poora lab AAA module mein)</span>
aaa new-model
tacacs server ISE-1
 address ipv4 10.1.99.20
 key NkSim-Tacacs-Key
aaa group server tacacs+ ISE-GRP
 server name ISE-1
<span class="c">! Pehle ISE try karo, local account par sirf tab jao jab ISE unreachable ho</span>
aaa authentication login VTY-AUTH group ISE-GRP local
aaa authorization exec VTY-AUTH group ISE-GRP local
aaa authorization commands 15 VTY-AUTH group ISE-GRP local
aaa accounting commands 15 VTY-AUTH start-stop group ISE-GRP
username breakglass privilege 15 algorithm-type scrypt secret NkSim-Local-Only
line vty 0 4
 login authentication VTY-AUTH
 authorization exec VTY-AUTH
 authorization commands 15 VTY-AUTH
 accounting commands 15 VTY-AUTH
 transport input ssh</pre>

<h3>802.1X aur MAB: is port mein kaun plugged hai?</h3>
<p><b>802.1X</b> switch port ya Wi-Fi SSID par access control karta hai. Teen roles: <b>supplicant</b> (laptop par software), <b>authenticator</b> (switch ya wireless controller) aur <b>authentication server</b> (ISE, RADIUS ke through). Authentication successful hone tak port sirf EAP traffic pass karta hai. Bina supplicant wale devices, jaise printers aur cameras, <b>MAB</b> (MAC Authentication Bypass) use karte hain, jo kamzor hai kyunki MAC addresses copy kiye ja sakte hain. Phir ISE ek authorisation lautata hai: VLAN, downloadable ACL ya Security Group Tag.</p>

<pre class="out">SW1# show authentication sessions interface GigabitEthernet1/0/5 details
            Interface:  GigabitEthernet1/0/5
          MAC Address:  0050.56aa.1b2c
         IPv4 Address:  10.1.10.55
            User-Name:  priya@corp.example
               Status:  Authorized
               Domain:  DATA
       Oper host mode:  multi-auth
<span class="hl">Server Policies:
              Vlan Group:  Vlan: 10</span>
Method status list:
       Method           State
          dot1x          Authc Success</pre>
<p>Yeh port 802.1X se authenticated ek user dikhata hai jise ISE ki lautayi policy ne VLAN 10 mein rakha.</p>

<h3>MFA sahi tarah se</h3>
<p>Har MFA barabar nahi hota. SMS codes intercept ya SIM-swap ho sakte hain. Simple push approvals <b>MFA fatigue</b> ko nyota dete hain: jis attacker ke paas password pehle se hai woh push par push bhejta hai jab tak thaka hua user Approve na daba de. Behtar: <b>verified push</b> (user login screen par dikhaya number type karta hai), device health checks, aur <b>phishing-resistant</b> methods jaise <b>FIDO2/WebAuthn</b> security keys ya platform passkeys, jo asli website se bound hote hain aur fake par replay nahi ho sakte. Cisco <b>Duo</b> yeh deta hai aur unhealthy ya unknown devices se logins block kar sakta hai.</p>

<h3>Single sign-on</h3>
<p><b>SSO</b> user ko ek baar <b>identity provider (IdP)</b> par authenticate karke bina naye passwords ke bahut saari applications (<b>service providers</b>) tak pahunchne deta hai. <b>SAML 2.0</b> signed XML assertions bhejta hai aur enterprise web apps mein common hai; OAuth 2.0 par bana <b>OpenID Connect</b> modern aur mobile apps mein common hai. SSO password reuse kam karta hai aur MFA enforce karne aur company chhodne wale ka access band karne ki ek jagah deta hai, lekin IdP ek high-value target ban jaata hai jise bahut dhyan se protect karna padta hai.</p>

<h3>Zero trust</h3>
<p>Purana model network ke andar ki har cheez par trust karta tha. <b>Zero trust</b> (SCOR topic 1.8) location par based implicit trust hata deta hai. Iske principles: <b>verify explicitly</b> (har request ke liye user, device aur context), <b>least privilege</b> access, aur <b>assume breach</b> (sab kuch segment aur monitor karo). Practice mein iska matlab hai MFA ke saath strong identity, device posture checks, micro-segmentation, continuous monitoring aur <b>ZTNA</b>, jo user ko VPN ke through poore network ki jagah ek application ka access deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Zero trust access decision">
<rect x="10" y="20" width="150" height="40" rx="8" fill="#bae6fd"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="13">User + MFA</text>
<rect x="10" y="75" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="85" y="100" text-anchor="middle" class="svg-ink" font-size="13">Device posture</text>
<rect x="10" y="130" width="150" height="40" rx="8" fill="#fde68a"/><text x="85" y="155" text-anchor="middle" class="svg-ink" font-size="13">Context: jagah, time</text>
<rect x="240" y="65" width="160" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">Policy decision</text><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">har request par</text>
<line x1="160" y1="40" x2="240" y2="85" stroke="#64748b" stroke-width="2"/><line x1="160" y1="95" x2="240" y2="95" stroke="#64748b" stroke-width="2"/><line x1="160" y1="150" x2="240" y2="105" stroke="#64748b" stroke-width="2"/>
<rect x="480" y="45" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="555" y="70" text-anchor="middle" class="svg-ink" font-size="13">allow: ek app</text>
<rect x="480" y="105" width="150" height="40" rx="8" fill="#fed7aa"/><text x="555" y="130" text-anchor="middle" class="svg-ink" font-size="13">deny ya step-up</text>
<line x1="400" y1="85" x2="480" y2="65" stroke="#64748b" stroke-width="2"/><line x1="400" y1="105" x2="480" y2="125" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Zero trust: identity, device aur context har request ke decision ko feed karte hain, aur access per application diya jaata hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Ek finance user ghar se ERP kholta hai. Duo password plus verified push check karta hai, phir laptop check karta hai: disk encrypted, OS patched, EDR chal raha hai. Request India se subah 10 baje aati hai, jo normal hai. Access sirf ERP application ka diya jaata hai, ZTNA ke through. Wahi user unpatched personal tablet par pehle update karne ko kaha jaata hai, aur use baaki network kabhi nahi dikhta.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Device administration ke liye RADIUS use karna aur per-command authorisation aur command accounting kho dena. Koi local fallback account nahi, jisse ISE outage har admin ko lock out kar deta hai; ya ulta, itna broad fallback ki woh hamesha use hota hai. 802.1X pilot ke baad switch port ko open mode mein chhod kar bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> TACACS+ = TCP 49, full-body encryption, alag AAA, per-command authorisation. RADIUS = UDP 1812/1813, sirf password hiding, combined authN/authZ. Supplicant, authenticator, authentication server: jaano kaunsa device kaunsa role nibhata hai.</p></div>

<div class="scn"><h4>Aadhi raat ko teis push notifications</h4><p>Ek developer ka password doosri site se leak hua. Aadhi raat ko attacker ne company VPN mein login try kiya aur developer ke phone par teis push requests aayi. Chaubisvi par, aadhi neend mein, developer ne approve kar diya. SIEM ne denied pushes ke burst ke turant baad unusual country se VPN session flag kiya; SOC ne session khatam kiya aur password reset kiya. Phir company ne number matching ke saath verified push enable kiya aur ek rule jo baar baar denied pushes ke baad account lock kar de.</p><p><b>Seekh:</b> MFA ko fatigue aur phishing jhelni chahiye; MFA abuse ka detection bhi ek control hai.</p></div>

<div class="iv"><p class="q">"Aap RADIUS ki jagah TACACS+ kab use karoge?"</p><p>Strong answer: device administration ke liye TACACS+ kyunki yeh TCP 49 par chalta hai, poora body encrypt karta hai, authentication, authorisation aur accounting ko alag karta hai aur per-command authorisation aur command accounting support karta hai. Network access (802.1X, MAB, VPN, wireless) ke liye RADIUS kyunki un protocols ka standard yahi hai aur yeh CoA support karta hai. Batao ki ISE dono kar sakta hai, aur hamesha ek controlled local fallback account rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AAA: authentication (kaun), authorisation (kya), accounting (record).</li>
<li>Network access ke liye RADIUS, device administration ke liye TACACS+.</li>
<li>802.1X roles: supplicant, authenticator, authentication server; bina supplicant wale devices ke liye MAB.</li>
<li>Verified push aur phishing-resistant MFA (FIDO2) prefer karo; SAML ya OIDC se SSO.</li>
<li>Zero trust: verify explicitly, least privilege, assume breach; ZTNA per-application access deta hai.</li>
</ul></div>
`}};export{e as default};