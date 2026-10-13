var e={id:`dot1x-eap`,h:{en:`802.1X and EAP: supplicant, authenticator, server and the EAP methods`,hi:`802.1X aur EAP: supplicant, authenticator, server aur EAP methods`},body:{en:`
<p>A shared passphrase cannot tell you <i>who</i> joined. 802.1X can. It is the standard that lets every user or device prove an individual identity before the network lets them in. In this chapter you learn the three roles, the EAP framework, the common EAP methods and how the keys are produced. The next chapter covers RADIUS, the protocol that carries the answer.</p>

<h3>Analogy: the bank counter</h3>
<p>You walk into a bank. The <b>teller</b> (authenticator) will not open your account himself. He asks you for your ID (you are the <b>supplicant</b>), checks nothing on his own, and passes the ID details to the <b>back-office system</b> (authentication server). The system answers yes or no, and the teller opens or refuses the service window. The teller enforces the decision but does not make it.</p>

<h3>The three roles</h3>
<table class="cmp"><tr><th>Role</th><th>Who it is in our lab</th><th>Job</th></tr>
<tr><td>Supplicant</td><td>LAPTOP1 or LAPTOP2 (Wi-Fi client software)</td><td>Presents the identity and credentials.</td></tr>
<tr><td>Authenticator</td><td>WLC1 with the AP (the AP forwards frames, the controller makes the RADIUS conversation)</td><td>Blocks the client until the server decides; relays EAP.</td></tr>
<tr><td>Authentication server</td><td>RAD1, 10.10.60.20</td><td>Checks credentials and returns Accept or Reject.</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="802.1X roles and protocols">
<rect x="15" y="60" width="130" height="60" rx="10" fill="#bae6fd"/><text x="80" y="88" text-anchor="middle" class="svg-ink" font-size="13">Supplicant</text><text x="80" y="106" text-anchor="middle" class="svg-muted" font-size="11">LAPTOP1</text>
<rect x="255" y="60" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">Authenticator</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="11">AP + WLC1</text>
<rect x="495" y="60" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="560" y="88" text-anchor="middle" class="svg-ink" font-size="13">Auth server</text><text x="560" y="106" text-anchor="middle" class="svg-muted" font-size="11">RAD1 (RADIUS)</text>
<line x1="145" y1="90" x2="255" y2="90" stroke="#64748b"/><line x1="385" y1="90" x2="495" y2="90" stroke="#64748b"/>
<text x="200" y="78" text-anchor="middle" class="svg-accent" font-size="11">EAPOL (EAP over LAN)</text><text x="440" y="78" text-anchor="middle" class="svg-accent" font-size="11">EAP in RADIUS</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">Before success: only EAP passes. After Access-Accept: data is allowed.</text>
<text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">Controlled port opens, 4-way handshake derives session keys</text>
</svg><p class="cap">The authenticator relays; the server decides.</p></div>

<h3>EAP: a framework, not a method</h3>
<p><b>EAP</b> (Extensible Authentication Protocol) is a container that carries many different authentication methods. Between the client and the AP it travels as <b>EAPOL</b> (EAP over LAN). Between the controller and the server it is wrapped inside RADIUS. Because the controller only relays, you can change the EAP method on the server and the clients without touching the controller. That is the power of the model.</p>

<h3>The EAP methods you must know</h3>
<table class="cmp"><tr><th>Method</th><th>Server cert</th><th>Client cred</th><th>Typical use</th></tr>
<tr><td>PEAP (MSCHAPv2)</td><td>Yes, builds a TLS tunnel</td><td>Username and password inside the tunnel</td><td>Staff laptops on a domain. Easy to roll out.</td></tr>
<tr><td>EAP-TLS</td><td>Yes</td><td>Client certificate</td><td>Managed devices; strongest. No passwords to steal.</td></tr>
<tr><td>EAP-TTLS</td><td>Yes</td><td>Inner method of choice</td><td>Mixed or Linux environments.</td></tr>
<tr><td>EAP-FAST</td><td>Optional (PAC)</td><td>Password or certificate</td><td>Cisco legacy designs.</td></tr></table>
<p><b>PEAP-MSCHAPv2</b> first builds a TLS tunnel using the <i>server's</i> certificate, then checks the user's password inside the tunnel. The risk is that a client that does not validate the server certificate may send its credentials to a rogue access point. Always push the CA trust and the server name to clients with your device management. <b>EAP-TLS</b> uses certificates on both sides. A stolen password is useless because there is no password.</p>
<div class="note"><p><b>Not simulated in the lab.</b> Our engine summarises the EAP exchange as a username and password check by RAD1. Coming up: module wl-secure (Advanced security). Certificates, TLS tunnel establishment, certificate trust errors and EAP-TLS are concept only. In a real network the most common PEAP failure is an untrusted or expired server certificate, not a wrong password.</p></div>

<h3>From EAP result to wireless keys</h3>
<p>When EAP succeeds, both the client and the server independently derive a <b>MSK</b> (master session key). The server sends it to the controller inside the Access-Accept. The first part of the MSK becomes the <b>PMK</b>, and then the same <b>4-way handshake</b> from chapter 2 derives the PTK. So 802.1X is simply a different way to produce the PMK: per user and per session, instead of from a shared passphrase. That is why every client has unique keys.</p>
<ol>
<li>Client associates (open system authentication) and the port is <b>uncontrolled for EAP only</b>.</li>
<li>Identity request and response (EAP-Identity).</li>
<li>Method negotiation, TLS tunnel, credentials.</li>
<li>Server sends Access-Accept with MSK and attributes such as a VLAN.</li>
<li>4-way handshake, data forwarding starts.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> alice opens her laptop at Mumbai HQ and selects NK-CORP. Her supplicant is set to PEAP-MSCHAPv2 and trusts the company CA. WLC1 receives the EAP identity "alice" and forwards it to RAD1. RAD1 checks the directory, finds the password hash matches, returns Access-Accept. The 4-way handshake completes and alice receives an address in the corporate VLAN 40.</p></div>
<div class="warn"><p><b>Common mistake.</b> Telling users to "ignore the certificate warning" or to disable server validation. This defeats the purpose of PEAP and enables credential theft by rogue APs.</p></div>
<div class="exam"><p><b>Exam trap.</b> The authenticator is the AP/controller, not the RADIUS server. And the controller never learns the user password; it only sees EAP messages and the final result.</p></div>

<div class="scn"><h4>Everybody fails after the server certificate expired</h4><p>On the first Monday of the month, every PEAP user at a manufacturing site was suddenly disconnected from the corporate SSID. RADIUS logs showed no failed logins at all. The RADIUS server certificate had expired over the weekend. Clients terminated the TLS tunnel before sending any password. Renewing the certificate and restarting the RADIUS service fixed it.</p><p><b>Lesson:</b> when a whole population fails together with no authentication failures in the server log, suspect the certificate and the TLS tunnel.</p></div>
<div class="iv"><p class="q">"Explain 802.1X and the roles in it."</p><p>A supplicant (client) talks EAP over the air to an authenticator (AP and controller), which relays it in RADIUS to an authentication server. The port stays closed to data until Access-Accept. Add that EAP gives per-user keys, which feed the 4-way handshake, and name PEAP and EAP-TLS with one trade-off each.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Supplicant is the client, authenticator is AP/WLC, server is RADIUS.</li>
<li>EAP is a framework: PEAP uses a password in a tunnel, EAP-TLS uses certificates.</li>
<li>The authenticator relays and enforces; the server decides.</li>
<li>EAP success yields a per-session PMK, then the 4-way handshake.</li>
<li>Certificate handling and EAP-TLS are concept only in the lab.</li>
</ul></div>
`,hi:`
<p>Shared passphrase yeh nahi bata sakta ki <i>kaun</i> join hua. 802.1X bata sakta hai. Yeh woh standard hai jo har user ya device ko network mein aane se pehle individual identity prove karne deta hai. Is chapter mein aap teen roles, EAP framework, common EAP methods aur keys kaise bante hain seekhoge. Agla chapter RADIUS cover karta hai, jo jawab carry karta hai.</p>

<h3>Analogy: bank counter</h3>
<p>Aap bank mein jaate ho. <b>Teller</b> (authenticator) khud aapka account nahi kholta. Woh aapse ID maangta hai (aap <b>supplicant</b> ho), khud kuch check nahi karta, aur ID details <b>back-office system</b> (authentication server) ko pass karta hai. System yes ya no bolta hai, aur teller service window kholta ya mana karta hai. Teller decision enforce karta hai lekin decide nahi karta.</p>

<h3>Teen roles</h3>
<table class="cmp"><tr><th>Role</th><th>Hamari lab mein kaun</th><th>Kaam</th></tr>
<tr><td>Supplicant</td><td>LAPTOP1 ya LAPTOP2 (Wi-Fi client software)</td><td>Identity aur credentials present karta hai.</td></tr>
<tr><td>Authenticator</td><td>WLC1 AP ke saath (AP frames forward karta hai, controller RADIUS conversation karta hai)</td><td>Server ke decide karne tak client ko block karta hai; EAP relay karta hai.</td></tr>
<tr><td>Authentication server</td><td>RAD1, 10.10.60.20</td><td>Credentials check karke Accept ya Reject return karta hai.</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="802.1X roles and protocols">
<rect x="15" y="60" width="130" height="60" rx="10" fill="#bae6fd"/><text x="80" y="88" text-anchor="middle" class="svg-ink" font-size="13">Supplicant</text><text x="80" y="106" text-anchor="middle" class="svg-muted" font-size="11">LAPTOP1</text>
<rect x="255" y="60" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">Authenticator</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="11">AP + WLC1</text>
<rect x="495" y="60" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="560" y="88" text-anchor="middle" class="svg-ink" font-size="13">Auth server</text><text x="560" y="106" text-anchor="middle" class="svg-muted" font-size="11">RAD1 (RADIUS)</text>
<line x1="145" y1="90" x2="255" y2="90" stroke="#64748b"/><line x1="385" y1="90" x2="495" y2="90" stroke="#64748b"/>
<text x="200" y="78" text-anchor="middle" class="svg-accent" font-size="11">EAPOL (EAP over LAN)</text><text x="440" y="78" text-anchor="middle" class="svg-accent" font-size="11">RADIUS mein EAP</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">Success se pehle: sirf EAP pass hota hai. Access-Accept ke baad: data allowed.</text>
<text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">Controlled port khulta hai, 4-way handshake session keys derive karta hai</text>
</svg><p class="cap">Authenticator relay karta hai; server decide karta hai.</p></div>

<h3>EAP: framework hai, method nahi</h3>
<p><b>EAP</b> (Extensible Authentication Protocol) ek container hai jo kai alag authentication methods carry karta hai. Client aur AP ke beech yeh <b>EAPOL</b> (EAP over LAN) ki tarah chalta hai. Controller aur server ke beech yeh RADIUS ke andar wrap hota hai. Kyunki controller sirf relay karta hai, aap server aur clients par EAP method badal sakte ho controller ko chhue bina. Yahi is model ki taqat hai.</p>

<h3>EAP methods jo aapko aane chahiye</h3>
<table class="cmp"><tr><th>Method</th><th>Server cert</th><th>Client cred</th><th>Typical use</th></tr>
<tr><td>PEAP (MSCHAPv2)</td><td>Haan, TLS tunnel banata hai</td><td>Tunnel ke andar username aur password</td><td>Domain par staff laptops. Roll out karna aasaan.</td></tr>
<tr><td>EAP-TLS</td><td>Haan</td><td>Client certificate</td><td>Managed devices; sabse strong. Churane ke liye password nahi.</td></tr>
<tr><td>EAP-TTLS</td><td>Haan</td><td>Inner method ki choice</td><td>Mixed ya Linux environments.</td></tr>
<tr><td>EAP-FAST</td><td>Optional (PAC)</td><td>Password ya certificate</td><td>Cisco legacy designs.</td></tr></table>
<p><b>PEAP-MSCHAPv2</b> pehle <i>server ke</i> certificate se TLS tunnel banata hai, phir tunnel ke andar user ka password check karta hai. Risk yeh hai ki jo client server certificate validate nahi karta woh apne credentials rogue access point ko bhej sakta hai. CA trust aur server name hamesha device management se clients par push karo. <b>EAP-TLS</b> dono sides par certificates use karta hai. Churaya hua password bekaar hai kyunki password hai hi nahi.</p>
<div class="note"><p><b>Lab mein simulated nahi.</b> Hamara engine EAP exchange ko RAD1 ke username aur password check ki tarah summarise karta hai. Aage aane wala module: wl-secure (Advanced security). Certificates, TLS tunnel establishment, certificate trust errors aur EAP-TLS sirf concept hain. Real network mein sabse common PEAP failure untrusted ya expired server certificate hota hai, galat password nahi.</p></div>

<h3>EAP result se wireless keys tak</h3>
<p>EAP succeed hone par client aur server dono independently <b>MSK</b> (master session key) derive karte hain. Server use Access-Accept mein controller ko bhejta hai. MSK ka pehla hissa <b>PMK</b> ban jaata hai, aur phir chapter 2 wala wahi <b>4-way handshake</b> PTK derive karta hai. Matlab 802.1X PMK banane ka alag tareeka hai: shared passphrase ki jagah per user aur per session. Isliye har client ki keys unique hoti hain.</p>
<ol>
<li>Client associate hota hai (open system authentication) aur port sirf <b>EAP ke liye uncontrolled</b> hota hai.</li>
<li>Identity request aur response (EAP-Identity).</li>
<li>Method negotiation, TLS tunnel, credentials.</li>
<li>Server Access-Accept bhejta hai MSK aur VLAN jaise attributes ke saath.</li>
<li>4-way handshake, data forwarding shuru.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> alice Mumbai HQ mein laptop kholti hai aur NK-CORP select karti hai. Uska supplicant PEAP-MSCHAPv2 par set hai aur company CA ko trust karta hai. WLC1 ko EAP identity "alice" milti hai aur woh RAD1 ko forward karta hai. RAD1 directory check karta hai, password hash match hota hai, Access-Accept return hota hai. 4-way handshake complete hota hai aur alice ko corporate VLAN 40 mein address milta hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Users ko "certificate warning ignore karo" ya server validation disable karne ko bolna. Yeh PEAP ka maqsad khatam kar deta hai aur rogue APs se credential theft enable karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Authenticator AP/controller hai, RADIUS server nahi. Aur controller ko user ka password kabhi pata nahi chalta; woh sirf EAP messages aur final result dekhta hai.</p></div>

<div class="scn"><h4>Server certificate expire hone par sab fail</h4><p>Mahine ke pehle Monday ko ek manufacturing site ke har PEAP user ko corporate SSID se achanak disconnect kar diya gaya. RADIUS logs mein koi failed login nahi tha. RADIUS server certificate weekend par expire ho chuka tha. Clients ne password bhejne se pehle hi TLS tunnel terminate kar diya. Certificate renew karke RADIUS service restart karne se fix hua.</p><p><b>Lesson:</b> jab poori population ek saath fail ho aur server log mein koi authentication failure na ho, to certificate aur TLS tunnel par shak karo.</p></div>
<div class="iv"><p class="q">"802.1X aur uske roles samjhao."</p><p>Supplicant (client) air par EAP authenticator (AP aur controller) se baat karta hai, jo use RADIUS mein authentication server ko relay karta hai. Access-Accept tak port data ke liye band rehta hai. Yeh jodo ki EAP per-user keys deta hai jo 4-way handshake mein jaati hain, aur PEAP aur EAP-TLS ka ek-ek trade-off batao.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Supplicant client hai, authenticator AP/WLC hai, server RADIUS hai.</li>
<li>EAP framework hai: PEAP tunnel mein password use karta hai, EAP-TLS certificates.</li>
<li>Authenticator relay aur enforce karta hai; server decide karta hai.</li>
<li>EAP success per-session PMK deta hai, phir 4-way handshake.</li>
<li>Certificate handling aur EAP-TLS lab mein sirf concept hain.</li>
</ul></div>
`}};export{e as default};