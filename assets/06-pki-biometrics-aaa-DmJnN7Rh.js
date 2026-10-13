var e={id:`pki-aaa`,h:{en:`Certificates, biometrics, AAA and 802.1X`,hi:`Certificates, biometrics, AAA aur 802.1X`},body:{en:`
<p>When you show your passport at an airport, the officer does not know you. They trust the <b>government that issued</b> the passport, check that it has not expired, and check that the photo matches your face. Digital certificates work the same way: a trusted issuer vouches for an identity. Biometrics are the photo check. And AAA is the airport's whole system of checking who you are, where you may go, and recording that you went.</p>

<h3>Public key cryptography in one minute</h3>
<p>Every certificate is built on a <b>key pair</b>: a <b>private key</b> that never leaves its owner, and a <b>public key</b> that anyone may have. Data encrypted with the public key can only be decrypted with the private key. And a <b>digital signature</b> made with the private key can be verified by anyone with the public key, proving who signed and that the data was not changed (integrity plus authenticity).</p>

<h3>Certificates and PKI</h3>
<p>A public key alone does not say whose key it is. A <b>digital certificate</b> (format X.509) binds a public key to an identity, and is signed by a <b>Certificate Authority (CA)</b>. The system of CAs, certificates, policies and revocation is called a <b>Public Key Infrastructure (PKI)</b>.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Certificate chain of trust">
<rect x="10" y="70" width="150" height="56" rx="8" fill="#fde68a"/><text x="85" y="94" text-anchor="middle" class="svg-ink" font-size="13">Root CA</text><text x="85" y="112" text-anchor="middle" class="svg-muted" font-size="12">self-signed, trusted</text>
<rect x="245" y="70" width="150" height="56" rx="8" fill="#bae6fd"/><text x="320" y="94" text-anchor="middle" class="svg-ink" font-size="13">Issuing CA</text><text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="12">signed by root</text>
<rect x="480" y="70" width="150" height="56" rx="8" fill="#bbf7d0"/><text x="555" y="94" text-anchor="middle" class="svg-ink" font-size="13">vpn.corp.example</text><text x="555" y="112" text-anchor="middle" class="svg-muted" font-size="12">device certificate</text>
<line x1="160" y1="98" x2="245" y2="98" stroke="#64748b" stroke-width="2"/><line x1="395" y1="98" x2="480" y2="98" stroke="#64748b" stroke-width="2"/>
<text x="202" y="88" text-anchor="middle" class="svg-accent" font-size="12">signs</text><text x="437" y="88" text-anchor="middle" class="svg-accent" font-size="12">signs</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Clients trust the root, so they trust everything it (indirectly) signed</text>
</svg><p class="cap">The chain of trust: verify each signature up to a root CA already in your trust store.</p></div>
<table class="cmp"><tr><th>Certificate field</th><th>Example</th></tr>
<tr><td>Subject</td><td>CN=vpn.corp.example</td></tr>
<tr><td>Issuer</td><td>CN=Corp Issuing CA 1</td></tr>
<tr><td>Validity</td><td>Not before 2026-04-01, not after 2027-04-01</td></tr>
<tr><td>Public key</td><td>RSA 2048-bit or ECDSA P-256</td></tr>
<tr><td>Key usage</td><td>Digital signature, key encipherment</td></tr>
<tr><td>Signature</td><td>The CA's signature over all the fields above</td></tr></table>
<p>How a device gets a certificate: it generates its own key pair, sends a <b>certificate signing request (CSR)</b> with its public key and name to the CA, and receives the signed certificate. The private key never leaves the device. If a key is stolen, the CA <b>revokes</b> the certificate; clients check revocation with a <b>CRL</b> (certificate revocation list) or <b>OCSP</b>.</p>
<p>Where you will see certificates: HTTPS on device web UIs and portals, SSL/TLS remote-access VPN gateways, IPsec site-to-site peers authenticating with <b>RSA signatures</b> instead of a pre-shared key, <b>EAP-TLS</b> for 802.1X and WPA2/WPA3-Enterprise, and controller-to-AP trust in Cisco wireless. As a password alternative, a certificate on a managed laptop is "something you have".</p>

<h3>Biometrics</h3>
<p><b>Biometrics</b> authenticate by a physical or behavioural trait: fingerprint, face, iris, palm veins, voice. Advantages: nothing to forget, hard to share. Limits: you cannot change your fingerprint if its template leaks, so templates must be stored protected (ideally only on the device); readers have error rates, the <b>false acceptance rate</b> (FAR, letting the wrong person in) and <b>false rejection rate</b> (FRR, locking out the right person), tuned against each other. Biometrics are usually one factor of MFA, such as a fingerprint that unlocks a hardware key or phone.</p>

<h3>AAA recap</h3>
<p><b>Authentication</b> answers who you are, <b>authorization</b> what you may do, <b>accounting</b> what you did. Instead of local usernames on every device, devices ask a central AAA server, so one account change applies everywhere and every command can be logged.</p>
<table class="cmp"><tr><th></th><th>RADIUS</th><th>TACACS+</th></tr>
<tr><td>Transport</td><td>UDP 1812 (auth), 1813 (accounting)</td><td>TCP 49</td></tr>
<tr><td>Encryption</td><td>Only the password attribute</td><td>The entire packet body</td></tr>
<tr><td>AAA functions</td><td>Authentication and authorization combined</td><td>All three separated</td></tr>
<tr><td>Typical use</td><td>Network access: 802.1X, VPN users, Wi-Fi</td><td>Device administration, per-command authorization</td></tr>
<tr><td>Standard</td><td>Open IETF standard</td><td>Developed by Cisco, now openly documented</td></tr></table>
<pre class="code">R1(config)# aaa new-model
R1(config)# tacacs server ISE-1
R1(config-server-tacacs)# address ipv4 10.99.0.10
R1(config-server-tacacs)# key Nk-Tacacs-Key
R1(config)# aaa authentication login default group tacacs+ local   <span class="c">! local = fallback if server is down</span>
R1(config)# aaa authorization exec default group tacacs+ local
R1(config)# aaa accounting commands 15 default start-stop group tacacs+</pre>

<h3>802.1X roles</h3>
<p>802.1X is port-based network access control, covered in depth in the Layer 2 security module. Remember the roles: the <b>supplicant</b> (client software), the <b>authenticator</b> (the switch or wireless AP/controller that relays and enforces), and the <b>authentication server</b> (RADIUS). EAP runs in EAPoL frames between client and switch, and inside RADIUS between switch and server. With <b>EAP-TLS</b>, both sides prove identity with certificates, which is the strongest common method.</p>

<div class="eg"><p><b>Worked example.</b> A bank wants: (1) admins' every configuration command logged with their name: TACACS+ with command accounting; (2) staff laptops allowed onto wired and wireless networks only if they are company devices: 802.1X with EAP-TLS and device certificates from the internal CA, RADIUS on the policy server; (3) data hall doors opened by badge plus fingerprint: MFA with have + are.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Forgetting <code>local</code> as fallback in the AAA method list and locking yourself out when the server is unreachable. (2) Letting certificates expire: VPNs and portals stop working on the expiry date; monitor validity. (3) Mixing up RADIUS and TACACS+ ports and encryption on the exam.</p></div>

<div class="exam"><p><b>Exam trap.</b> The CA signs certificates with its private key; clients verify with the CA's public key. Certificates, biometrics and MFA are the "password alternatives". TACACS+ = TCP 49, full encryption, separates AAA; RADIUS = UDP 1812/1813, password only, combines authN and authZ. 802.1X roles: supplicant, authenticator, authentication server.</p></div>

<div class="scn"><h4>The Monday morning VPN outage</h4><p>At 09:00 on a Monday, 600 remote staff could not connect to the SSL VPN of a manufacturing company. The client showed a certificate warning, and the managed laptops refused to continue. The engineer opened the gateway certificate: the "not after" date was Sunday. Nobody owned the renewal. A new certificate was issued from the same CA, installed, and service returned by 09:40. The team then added certificate expiry to monitoring with alerts 30 days ahead.</p><p><b>Lesson:</b> certificates are strong, but they have a lifetime. Expiry is one of the most common real-world PKI outages.</p></div>

<div class="iv"><p class="q">"Compare RADIUS and TACACS+. Which would you use for device administration and why?"</p><p>Strong answer: RADIUS is UDP 1812/1813, encrypts only the password and combines authentication and authorization; it is the standard for network access like 802.1X, Wi-Fi and VPN users. TACACS+ is TCP 49, encrypts the whole body and separates the three A's, so it can authorize and account each command. For device administration I choose TACACS+ for per-command authorization and full command logging, with local accounts as fallback.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A certificate binds a public key to an identity and is signed by a CA; trust follows the chain to a root CA.</li>
<li>Private keys never leave the owner; CSR to request, CRL or OCSP to check revocation.</li>
<li>Biometrics: something you are; watch FAR and FRR; templates cannot be changed if stolen.</li>
<li>AAA: RADIUS for network access, TACACS+ for device administration; always keep a local fallback.</li>
<li>802.1X: supplicant, authenticator, authentication server; EAP-TLS uses certificates on both sides.</li>
</ul></div>
`,hi:`
<p>Jab aap airport par apna passport dikhate ho, officer aapko nahi jaanta. Woh passport <b>issue karne wali sarkar</b> par bharosa karta hai, check karta hai ki expire nahi hua, aur check karta hai ki photo aapke chehre se match karti hai. Digital certificates bhi aise hi kaam karte hain: ek trusted issuer kisi identity ki guarantee deta hai. Biometrics photo check hai. Aur AAA airport ka poora system hai jo check karta hai aap kaun ho, kahan ja sakte ho, aur record karta hai ki aap gaye.</p>

<h3>Ek minute mein public key cryptography</h3>
<p>Har certificate ek <b>key pair</b> par bana hai: <b>private key</b> jo kabhi apne maalik ko nahi chhodti, aur <b>public key</b> jo kisi ke bhi paas ho sakti hai. Public key se encrypt kiya data sirf private key se decrypt hota hai. Aur private key se banaya <b>digital signature</b> public key wala koi bhi verify kar sakta hai, jisse prove hota hai ki kisne sign kiya aur data badla nahi gaya (integrity plus authenticity).</p>

<h3>Certificates aur PKI</h3>
<p>Sirf public key yeh nahi batati ki key kiski hai. <b>Digital certificate</b> (format X.509) public key ko ek identity se jodta hai, aur <b>Certificate Authority (CA)</b> use sign karti hai. CAs, certificates, policies aur revocation ke poore system ko <b>Public Key Infrastructure (PKI)</b> kehte hain.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Certificate chain of trust">
<rect x="10" y="70" width="150" height="56" rx="8" fill="#fde68a"/><text x="85" y="94" text-anchor="middle" class="svg-ink" font-size="13">Root CA</text><text x="85" y="112" text-anchor="middle" class="svg-muted" font-size="12">self-signed, trusted</text>
<rect x="245" y="70" width="150" height="56" rx="8" fill="#bae6fd"/><text x="320" y="94" text-anchor="middle" class="svg-ink" font-size="13">Issuing CA</text><text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="12">root ne sign kiya</text>
<rect x="480" y="70" width="150" height="56" rx="8" fill="#bbf7d0"/><text x="555" y="94" text-anchor="middle" class="svg-ink" font-size="13">vpn.corp.example</text><text x="555" y="112" text-anchor="middle" class="svg-muted" font-size="12">device certificate</text>
<line x1="160" y1="98" x2="245" y2="98" stroke="#64748b" stroke-width="2"/><line x1="395" y1="98" x2="480" y2="98" stroke="#64748b" stroke-width="2"/>
<text x="202" y="88" text-anchor="middle" class="svg-accent" font-size="12">sign karta</text><text x="437" y="88" text-anchor="middle" class="svg-accent" font-size="12">sign karta</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Clients root par bharosa karte hain, isliye uske (indirectly) sign kiye sab par bhi</text>
</svg><p class="cap">Chain of trust: har signature ko us root CA tak verify karo jo pehle se aapke trust store mein hai.</p></div>
<table class="cmp"><tr><th>Certificate field</th><th>Example</th></tr>
<tr><td>Subject</td><td>CN=vpn.corp.example</td></tr>
<tr><td>Issuer</td><td>CN=Corp Issuing CA 1</td></tr>
<tr><td>Validity</td><td>Not before 2026-04-01, not after 2027-04-01</td></tr>
<tr><td>Public key</td><td>RSA 2048-bit ya ECDSA P-256</td></tr>
<tr><td>Key usage</td><td>Digital signature, key encipherment</td></tr>
<tr><td>Signature</td><td>Upar ke saare fields par CA ka signature</td></tr></table>
<p>Device certificate kaise leta hai: woh apna key pair khud banata hai, apni public key aur naam ke saath CA ko <b>certificate signing request (CSR)</b> bhejta hai, aur signed certificate paata hai. Private key kabhi device nahi chhodti. Agar key chori ho jaaye, CA certificate ko <b>revoke</b> karti hai; clients revocation ko <b>CRL</b> (certificate revocation list) ya <b>OCSP</b> se check karte hain.</p>
<p>Certificates aapko kahan dikhenge: device web UIs aur portals par HTTPS, SSL/TLS remote-access VPN gateways, pre-shared key ki jagah <b>RSA signatures</b> se authenticate karne wale IPsec site-to-site peers, 802.1X aur WPA2/WPA3-Enterprise ke liye <b>EAP-TLS</b>, aur Cisco wireless mein controller-to-AP trust. Password alternative ki tarah, managed laptop par certificate "jo aapke paas hai" hai.</p>

<h3>Biometrics</h3>
<p><b>Biometrics</b> kisi physical ya behavioural trait se authenticate karte hain: fingerprint, face, iris, palm veins, voice. Fayde: bhoolne ko kuch nahi, share karna mushkil. Seemayein: agar template leak ho jaaye to aap apna fingerprint badal nahi sakte, isliye templates protected store hone chahiye (behtar hai sirf device par); readers ke error rates hote hain, <b>false acceptance rate</b> (FAR, galat insaan ko andar aane dena) aur <b>false rejection rate</b> (FRR, sahi insaan ko lock out karna), jo ek doosre ke against tune hote hain. Biometrics aam taur par MFA ka ek factor hote hain, jaise fingerprint jo hardware key ya phone unlock karta hai.</p>

<h3>AAA recap</h3>
<p><b>Authentication</b> batata hai aap kaun ho, <b>authorization</b> aap kya kar sakte ho, <b>accounting</b> aapne kya kiya. Har device par local usernames ki jagah devices central AAA server se poochte hain, taaki ek account change har jagah lagu ho aur har command log ho sake.</p>
<table class="cmp"><tr><th></th><th>RADIUS</th><th>TACACS+</th></tr>
<tr><td>Transport</td><td>UDP 1812 (auth), 1813 (accounting)</td><td>TCP 49</td></tr>
<tr><td>Encryption</td><td>Sirf password attribute</td><td>Poori packet body</td></tr>
<tr><td>AAA functions</td><td>Authentication aur authorization saath</td><td>Teeno alag</td></tr>
<tr><td>Typical use</td><td>Network access: 802.1X, VPN users, Wi-Fi</td><td>Device administration, per-command authorization</td></tr>
<tr><td>Standard</td><td>Open IETF standard</td><td>Cisco ne develop kiya, ab openly documented</td></tr></table>
<pre class="code">R1(config)# aaa new-model
R1(config)# tacacs server ISE-1
R1(config-server-tacacs)# address ipv4 10.99.0.10
R1(config-server-tacacs)# key Nk-Tacacs-Key
R1(config)# aaa authentication login default group tacacs+ local   <span class="c">! server down ho to local fallback</span>
R1(config)# aaa authorization exec default group tacacs+ local
R1(config)# aaa accounting commands 15 default start-stop group tacacs+</pre>

<h3>802.1X roles</h3>
<p>802.1X port-based network access control hai, jo Layer 2 security module mein detail mein cover hua. Roles yaad rakho: <b>supplicant</b> (client software), <b>authenticator</b> (switch ya wireless AP/controller jo relay aur enforce karta hai), aur <b>authentication server</b> (RADIUS). EAP client aur switch ke beech EAPoL frames mein chalta hai, aur switch aur server ke beech RADIUS ke andar. <b>EAP-TLS</b> mein dono sides certificates se identity prove karti hain, jo sabse mazboot common method hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek bank chahta hai: (1) admins ka har configuration command unke naam ke saath log ho: command accounting ke saath TACACS+; (2) staff laptops wired aur wireless networks par tabhi aayein jab woh company devices hon: internal CA ke device certificates ke saath EAP-TLS wala 802.1X, policy server par RADIUS; (3) data hall ke darwaze badge plus fingerprint se khulein: paas hona + hona wala MFA.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) AAA method list mein fallback ke roop mein <code>local</code> bhoolna aur server unreachable hone par khud ko lock out kar lena. (2) Certificates ko expire hone dena: expiry date par VPNs aur portals kaam karna band kar dete hain; validity monitor karo. (3) Exam par RADIUS aur TACACS+ ke ports aur encryption mix kar dena.</p></div>

<div class="exam"><p><b>Exam trap.</b> CA apni private key se certificates sign karti hai; clients CA ki public key se verify karte hain. Certificates, biometrics aur MFA "password alternatives" hain. TACACS+ = TCP 49, poora encryption, AAA alag karta hai; RADIUS = UDP 1812/1813, sirf password, authN aur authZ saath. 802.1X roles: supplicant, authenticator, authentication server.</p></div>

<div class="scn"><h4>Monday subah ka VPN outage</h4><p>Monday subah 09:00 baje ek manufacturing company ke 600 remote staff SSL VPN se connect nahi kar paaye. Client certificate warning dikha raha tha, aur managed laptops aage badhne se mana kar rahe the. Engineer ne gateway certificate khola: "not after" date Sunday thi. Renewal ki zimmedari kisi ki nahi thi. Usi CA se naya certificate issue hua, install hua, aur 09:40 tak service wapas aa gayi. Phir team ne certificate expiry ko monitoring mein joda, 30 din pehle alerts ke saath.</p><p><b>Seekh:</b> certificates mazboot hain, lekin unki ek umar hoti hai. Expiry real world ke sabse common PKI outages mein se ek hai.</p></div>

<div class="iv"><p class="q">"RADIUS aur TACACS+ compare karo. Device administration ke liye kaunsa use karoge aur kyun?"</p><p>Strong answer: RADIUS UDP 1812/1813 hai, sirf password encrypt karta hai aur authentication aur authorization ko saath rakhta hai; yeh 802.1X, Wi-Fi aur VPN users jaise network access ka standard hai. TACACS+ TCP 49 hai, poori body encrypt karta hai aur teeno A alag rakhta hai, isliye har command ko authorize aur account kar sakta hai. Device administration ke liye main per-command authorization aur poore command logging ke liye TACACS+ chunta hoon, local accounts fallback ke saath.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Certificate public key ko identity se jodta hai aur CA use sign karti hai; trust chain ke through root CA tak jaata hai.</li>
<li>Private keys kabhi maalik ko nahi chhodti; request ke liye CSR, revocation check ke liye CRL ya OCSP.</li>
<li>Biometrics: jo aap ho; FAR aur FRR dekho; chori hone par templates badle nahi ja sakte.</li>
<li>AAA: network access ke liye RADIUS, device administration ke liye TACACS+; hamesha local fallback rakho.</li>
<li>802.1X: supplicant, authenticator, authentication server; EAP-TLS dono taraf certificates use karta hai.</li>
</ul></div>
`}};export{e as default};