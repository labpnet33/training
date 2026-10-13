var e={id:`big-picture`,h:{en:`The big picture: what cryptography does for a network`,hi:`Big picture: cryptography network ke liye kya karti hai`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these 13 chapters you will be able to explain, draw and troubleshoot the cryptography that sits under every SSH session, every HTTPS page and every VPN tunnel you will ever build. You will know how hashing, HMAC, AES, RSA, elliptic curves and Diffie-Hellman fit together; how a certificate is issued, trusted and revoked; how TLS 1.2 and TLS 1.3 handshakes differ; how IKEv1, IKEv2, ESP and NAT-T build an IPsec tunnel; which VPN type (crypto map, sVTI, DMVPN, GETVPN, FlexVPN, remote access with Secure Client) fits which job and how to make it highly available; why pre-shared keys stop scaling; what post-quantum cryptography changes; and how to read a failed negotiation in a debug. This covers SCOR 350-701 v2.0 objectives <b>1.3</b> (functions of the cryptography components) and <b>1.4</b> (site-to-site and remote access VPN deployment types).</p>

<p><b>Prerequisites.</b> You should know IP addressing, TCP and UDP ports, basic routing and the IOS CLI (CCNA level). From the earlier modules of this track you should be comfortable with the CIA triad and threat vocabulary (sec-start, sec-foundations, sec-concepts). No mathematics is needed beyond "multiply and take the remainder", and we will do that with small numbers.</p>

<h3>An analogy: sending a valuable parcel</h3>
<p>Imagine you must send a jewellery box from Delhi to a branch in Pune through a courier you do not fully trust. You want four guarantees:</p>
<ul>
<li><b>Nobody can look inside.</b> You lock the box. That is <b>encryption</b>, and it gives <b>confidentiality</b>.</li>
<li><b>Nobody can swap the contents without you noticing.</b> You put a numbered tamper seal on the lid. That is a <b>hash</b> or an <b>HMAC</b>, and it gives <b>integrity</b>.</li>
<li><b>The box really came from you.</b> The receiver checks your government ID card, issued by an authority both of you trust. That is a <b>certificate</b> issued by a <b>certificate authority (CA)</b>, and it gives <b>authentication</b>.</li>
<li><b>You cannot later deny sending it.</b> You sign the delivery slip in a way only you can. That is a <b>digital signature</b>, and it gives <b>non-repudiation</b>.</li>
</ul>
<p>There is one more puzzle. The receiver needs the key to the lock, but you cannot post the key through the same courier. Cryptography solves this with <b>Diffie-Hellman</b>: both sides exchange public values and each calculates the same secret key, which never travels over the wire.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Crypto tools mapped to security goals">
<text x="110" y="22" text-anchor="middle" class="svg-ink" font-size="14">Tool</text>
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="14">Promise</text>
<text x="530" y="22" text-anchor="middle" class="svg-ink" font-size="14">Where you meet it</text>
<rect x="20" y="36" width="180" height="38" rx="8" fill="#bae6fd"/><text x="110" y="60" text-anchor="middle" class="svg-ink" font-size="13">AES (symmetric)</text>
<rect x="230" y="36" width="180" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="13">confidentiality</text>
<rect x="440" y="36" width="180" height="38" rx="8" fill="#bbf7d0"/><text x="530" y="60" text-anchor="middle" class="svg-ink" font-size="13">ESP payload, TLS records</text>
<rect x="20" y="86" width="180" height="38" rx="8" fill="#ddd6fe"/><text x="110" y="110" text-anchor="middle" class="svg-ink" font-size="13">SHA-2, HMAC</text>
<rect x="230" y="86" width="180" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">integrity</text>
<rect x="440" y="86" width="180" height="38" rx="8" fill="#bbf7d0"/><text x="530" y="110" text-anchor="middle" class="svg-ink" font-size="13">ESP ICV, image verify</text>
<rect x="20" y="136" width="180" height="38" rx="8" fill="#fde68a"/><text x="110" y="160" text-anchor="middle" class="svg-ink" font-size="13">Diffie-Hellman</text>
<rect x="230" y="136" width="180" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">shared secret key</text>
<rect x="440" y="136" width="180" height="38" rx="8" fill="#bbf7d0"/><text x="530" y="160" text-anchor="middle" class="svg-ink" font-size="13">IKE, TLS key share</text>
<rect x="20" y="186" width="180" height="38" rx="8" fill="#fed7aa"/><text x="110" y="210" text-anchor="middle" class="svg-ink" font-size="13">RSA / ECDSA signature</text>
<rect x="230" y="186" width="180" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">authentication</text>
<rect x="440" y="186" width="180" height="38" rx="8" fill="#bbf7d0"/><text x="530" y="210" text-anchor="middle" class="svg-ink" font-size="13">IKE AUTH, SSH host key</text>
<rect x="20" y="236" width="180" height="38" rx="8" fill="#bae6fd"/><text x="110" y="260" text-anchor="middle" class="svg-ink" font-size="13">PKI certificates</text>
<rect x="230" y="236" width="180" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="260" text-anchor="middle" class="svg-ink" font-size="13">trust at scale</text>
<rect x="440" y="236" width="180" height="38" rx="8" fill="#bbf7d0"/><text x="530" y="260" text-anchor="middle" class="svg-ink" font-size="13">HTTPS, VPN, EAP-TLS</text>
<line x1="200" y1="55" x2="230" y2="55" stroke="#64748b"/><line x1="410" y1="55" x2="440" y2="55" stroke="#64748b"/>
<line x1="200" y1="105" x2="230" y2="105" stroke="#64748b"/><line x1="410" y1="105" x2="440" y2="105" stroke="#64748b"/>
<line x1="200" y1="155" x2="230" y2="155" stroke="#64748b"/><line x1="410" y1="155" x2="440" y2="155" stroke="#64748b"/>
<line x1="200" y1="205" x2="230" y2="205" stroke="#64748b"/><line x1="410" y1="205" x2="440" y2="205" stroke="#64748b"/>
<line x1="200" y1="255" x2="230" y2="255" stroke="#64748b"/><line x1="410" y1="255" x2="440" y2="255" stroke="#64748b"/>
<text x="320" y="292" text-anchor="middle" class="svg-accent" font-size="12">Real protocols (TLS, IKE, ESP) combine all five</text>
</svg><p class="cap">Each crypto tool delivers one promise. A VPN or HTTPS session is simply these tools used together in a fixed order.</p></div>

<h3>Why a network engineer must know this</h3>
<p>You do not need to invent ciphers, but you will configure them every week. When a tunnel does not come up, the debug speaks in crypto words: <i>no proposal chosen</i>, <i>authentication failed</i>, <i>traffic selectors unacceptable</i>, <i>certificate expired</i>. When an auditor asks why DH group 2 is still enabled, or a manager asks whether "quantum" is a real threat to the VPN, you are expected to answer. Most VPN outages are not bugs; they are two sides that disagree about one crypto parameter.</p>

<h3>The lab topology used in this module</h3>
<p>We use one small network throughout. <b>R1</b> is the HQ router with public address 203.0.113.1 and LAN 10.1.1.0/24. <b>R2</b> is the Pune branch router with public address 198.51.100.2 and LAN 10.2.2.0/24. A tunnel interface joins them on 172.16.12.0/30. <b>ASA1</b> (203.0.113.10) terminates remote access VPNs for staff using Secure Client. The enterprise CA, <b>NK-CA</b>, lives at 192.0.2.50 (ca.nk.example).</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module lab topology">
<rect x="20" y="70" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="92" text-anchor="middle" class="svg-ink" font-size="13">HQ LAN</text><text x="80" y="110" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.0/24</text>
<rect x="170" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="225" y="92" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="225" y="110" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.1</text>
<rect x="360" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="415" y="92" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="415" y="110" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.2</text>
<rect x="500" y="70" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="92" text-anchor="middle" class="svg-ink" font-size="13">Pune LAN</text><text x="560" y="110" text-anchor="middle" class="svg-muted" font-size="12">10.2.2.0/24</text>
<line x1="140" y1="95" x2="170" y2="95" stroke="#64748b" stroke-width="2"/><line x1="470" y1="95" x2="500" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="280" y1="95" x2="360" y2="95" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/><text x="320" y="85" text-anchor="middle" class="svg-accent" font-size="12">IPsec Tunnel0</text>
<rect x="170" y="150" width="110" height="40" rx="8" fill="#fed7aa"/><text x="225" y="175" text-anchor="middle" class="svg-ink" font-size="13">ASA1 .10</text>
<rect x="20" y="10" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="95" y="35" text-anchor="middle" class="svg-ink" font-size="13">NK-CA 192.0.2.50</text>
<rect x="400" y="150" width="200" height="40" rx="8" fill="#fde68a"/><text x="500" y="175" text-anchor="middle" class="svg-ink" font-size="13">Remote user, Secure Client</text>
<line x1="280" y1="170" x2="400" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
</svg><p class="cap">R1 and R2 build the site-to-site tunnel; ASA1 serves remote users; NK-CA issues every certificate.</p></div>

<h3>How this module is organised</h3>
<table class="cmp"><tr><th>Chapters</th><th>Topic</th></tr>
<tr><td>2 to 5</td><td>The primitives: hashing and HMAC, symmetric AES, asymmetric RSA/ECC with Diffie-Hellman, digital signatures and X.509 certificates</td></tr>
<tr><td>6</td><td>PKI: CA hierarchy, CSR, SCEP/EST/manual enrollment, CRL/OCSP, trustpoints on IOS and ASA</td></tr>
<tr><td>7 to 9</td><td>Protocols: TLS 1.2 vs 1.3, IPsec with IKEv1/IKEv2 and NAT-T, PSK vs certificate authentication</td></tr>
<tr><td>10</td><td>VPN types compared, remote access with Secure Client, high availability</td></tr>
<tr><td>11 to 13</td><td>Post-quantum cryptography, troubleshooting negotiation mismatches, summary and exam checklist</td></tr>
</table>
<p>Later modules in this track (sec-asa-vpn and sec-ftd-vpn) build these tunnels hands-on. Here you learn the theory and the reasons, so that the lab commands make sense.</p>

<div class="eg"><p><b>Worked example.</b> Open any HTTPS site and a VPN at the same time and list what each uses. The browser: ECDHE (Diffie-Hellman on an elliptic curve) for the key, RSA or ECDSA signature inside a certificate for authentication, AES-128-GCM for data, SHA-256 inside the handshake. The IPsec tunnel between R1 and R2: DH group 19 for the key, a pre-shared key or certificate for authentication, AES-256-GCM for data, SHA-384 as the PRF. Same five tools, different packaging.</p></div>

<div class="warn"><p><b>Common mistake.</b> Saying "the VPN is encrypted, so it is secure". Encryption without authentication lets an attacker in the middle build two encrypted tunnels, one to each side. Always ask four questions: who holds the key, how was the peer authenticated, how is integrity protected, and how fresh is the key?</p></div>

<div class="exam"><p><b>Exam trap.</b> Hashing is not encryption. A hash cannot be reversed to get the data back, so it never provides confidentiality. If an option says "SHA-256 encrypts the payload", it is wrong.</p></div>

<div class="scn"><h4>The "secure" tunnel that used DES</h4><p>During an audit of an older branch, the security team found a site-to-site tunnel still negotiating DES with MD5 and DH group 1. It had been "working" for twelve years, so nobody touched it. The auditor pointed out that 56-bit DES can be brute-forced in hours with modern hardware and that group 1 is a 768-bit prime. The engineer moved both peers to AES-256-GCM with DH group 19 in a maintenance window, then removed the old proposal so no peer could fall back.</p><p><b>Lesson:</b> a tunnel that is "up" is not proof of good crypto. Review proposals regularly and delete legacy options.</p></div>

<div class="iv"><p class="q">"What does cryptography give us in a network, and which tool provides each property?"</p><p>Strong answer: confidentiality through symmetric encryption such as AES; integrity through hashing and HMAC such as SHA-256; authentication through pre-shared keys, digital signatures and certificates; non-repudiation through digital signatures; and secure key agreement through Diffie-Hellman. Then add one real example, for instance an IKEv2 tunnel using DH group 19, certificate authentication and AES-GCM.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cryptography delivers confidentiality, integrity, authentication, non-repudiation and key agreement.</li>
<li>Encryption hides data; hashes and HMACs detect change; signatures and certificates prove identity.</li>
<li>Diffie-Hellman lets two peers derive the same key without sending it.</li>
<li>TLS and IPsec are packages of the same primitives, negotiated in a fixed order.</li>
<li>Most VPN failures are a mismatch in one crypto parameter, which this module teaches you to spot.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In 13 chapters ke end tak aap us cryptography ko explain, draw aur troubleshoot kar paoge jo har SSH session, har HTTPS page aur har VPN tunnel ke neeche baithi hai jo aap kabhi banaoge. Aap jaanoge ki hashing, HMAC, AES, RSA, elliptic curves aur Diffie-Hellman kaise ek saath fit hote hain; certificate kaise issue, trust aur revoke hota hai; TLS 1.2 aur TLS 1.3 handshakes mein kya fark hai; IKEv1, IKEv2, ESP aur NAT-T kaise IPsec tunnel banate hain; kaunsa VPN type (crypto map, sVTI, DMVPN, GETVPN, FlexVPN, Secure Client ke saath remote access) kis kaam ke liye fit hai aur use highly available kaise banate hain; pre-shared keys scale karna kyun band kar deti hain; post-quantum cryptography kya badalti hai; aur debug mein failed negotiation kaise padhein. Yeh SCOR 350-701 v2.0 ke objectives <b>1.3</b> (cryptography components ke functions) aur <b>1.4</b> (site-to-site aur remote access VPN deployment types) cover karta hai.</p>

<p><b>Prerequisites.</b> Aapko IP addressing, TCP aur UDP ports, basic routing aur IOS CLI (CCNA level) aana chahiye. Is track ke pehle modules (sec-start, sec-foundations, sec-concepts) se aap CIA triad aur threat vocabulary ke saath comfortable hone chahiye. "Multiply karo aur remainder lo" se zyada koi maths nahi chahiye, aur woh bhi hum chhote numbers ke saath karenge.</p>

<h3>Ek analogy: keemti parcel bhejna</h3>
<p>Socho aapko Delhi se Pune branch tak ek jewellery box aise courier se bhejna hai jis par aap poora bharosa nahi karte. Aapko chaar guarantees chahiye:</p>
<ul>
<li><b>Koi andar nahi dekh sake.</b> Aap box ko lock karte ho. Yeh <b>encryption</b> hai, aur yeh <b>confidentiality</b> deta hai.</li>
<li><b>Koi bina pata chale saaman badal na sake.</b> Aap lid par numbered tamper seal lagate ho. Yeh <b>hash</b> ya <b>HMAC</b> hai, aur yeh <b>integrity</b> deta hai.</li>
<li><b>Box sach mein aapse aaya.</b> Receiver aapka government ID card check karta hai, jo aisi authority ne issue kiya jis par dono bharosa karte ho. Yeh <b>certificate authority (CA)</b> ka issue kiya <b>certificate</b> hai, aur yeh <b>authentication</b> deta hai.</li>
<li><b>Aap baad mein bhejne se mukar nahi sakte.</b> Aap delivery slip par aise sign karte ho jaise sirf aap kar sakte ho. Yeh <b>digital signature</b> hai, aur yeh <b>non-repudiation</b> deta hai.</li>
</ul>
<p>Ek aur paheli hai. Receiver ko lock ki chaabi chahiye, par aap chaabi usi courier se post nahi kar sakte. Cryptography ise <b>Diffie-Hellman</b> se solve karti hai: dono sides public values exchange karte hain aur har ek same secret key calculate karta hai, jo kabhi wire par travel nahi karti.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Crypto tools aur security goals">
<text x="110" y="22" text-anchor="middle" class="svg-ink" font-size="14">Tool</text>
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="14">Vaada</text>
<text x="530" y="22" text-anchor="middle" class="svg-ink" font-size="14">Kahan milta hai</text>
<rect x="20" y="36" width="180" height="38" rx="8" fill="#bae6fd"/><text x="110" y="60" text-anchor="middle" class="svg-ink" font-size="13">AES (symmetric)</text>
<rect x="230" y="36" width="180" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="13">confidentiality</text>
<rect x="440" y="36" width="180" height="38" rx="8" fill="#bbf7d0"/><text x="530" y="60" text-anchor="middle" class="svg-ink" font-size="13">ESP payload, TLS records</text>
<rect x="20" y="86" width="180" height="38" rx="8" fill="#ddd6fe"/><text x="110" y="110" text-anchor="middle" class="svg-ink" font-size="13">SHA-2, HMAC</text>
<rect x="230" y="86" width="180" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">integrity</text>
<rect x="440" y="86" width="180" height="38" rx="8" fill="#bbf7d0"/><text x="530" y="110" text-anchor="middle" class="svg-ink" font-size="13">ESP ICV, image verify</text>
<rect x="20" y="136" width="180" height="38" rx="8" fill="#fde68a"/><text x="110" y="160" text-anchor="middle" class="svg-ink" font-size="13">Diffie-Hellman</text>
<rect x="230" y="136" width="180" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">shared secret key</text>
<rect x="440" y="136" width="180" height="38" rx="8" fill="#bbf7d0"/><text x="530" y="160" text-anchor="middle" class="svg-ink" font-size="13">IKE, TLS key share</text>
<rect x="20" y="186" width="180" height="38" rx="8" fill="#fed7aa"/><text x="110" y="210" text-anchor="middle" class="svg-ink" font-size="13">RSA / ECDSA signature</text>
<rect x="230" y="186" width="180" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">authentication</text>
<rect x="440" y="186" width="180" height="38" rx="8" fill="#bbf7d0"/><text x="530" y="210" text-anchor="middle" class="svg-ink" font-size="13">IKE AUTH, SSH host key</text>
<rect x="20" y="236" width="180" height="38" rx="8" fill="#bae6fd"/><text x="110" y="260" text-anchor="middle" class="svg-ink" font-size="13">PKI certificates</text>
<rect x="230" y="236" width="180" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="260" text-anchor="middle" class="svg-ink" font-size="13">scale par trust</text>
<rect x="440" y="236" width="180" height="38" rx="8" fill="#bbf7d0"/><text x="530" y="260" text-anchor="middle" class="svg-ink" font-size="13">HTTPS, VPN, EAP-TLS</text>
<line x1="200" y1="55" x2="230" y2="55" stroke="#64748b"/><line x1="410" y1="55" x2="440" y2="55" stroke="#64748b"/>
<line x1="200" y1="105" x2="230" y2="105" stroke="#64748b"/><line x1="410" y1="105" x2="440" y2="105" stroke="#64748b"/>
<line x1="200" y1="155" x2="230" y2="155" stroke="#64748b"/><line x1="410" y1="155" x2="440" y2="155" stroke="#64748b"/>
<line x1="200" y1="205" x2="230" y2="205" stroke="#64748b"/><line x1="410" y1="205" x2="440" y2="205" stroke="#64748b"/>
<line x1="200" y1="255" x2="230" y2="255" stroke="#64748b"/><line x1="410" y1="255" x2="440" y2="255" stroke="#64748b"/>
<text x="320" y="292" text-anchor="middle" class="svg-accent" font-size="12">Asli protocols (TLS, IKE, ESP) paanchon ko jodte hain</text>
</svg><p class="cap">Har crypto tool ek vaada poora karta hai. VPN ya HTTPS session bas in tools ka ek fixed order mein saath use hai.</p></div>

<h3>Network engineer ko yeh kyun aana chahiye</h3>
<p>Aapko ciphers invent nahi karne, par aap unhe har hafte configure karoge. Jab tunnel up nahi hota, debug crypto ki bhasha bolta hai: <i>no proposal chosen</i>, <i>authentication failed</i>, <i>traffic selectors unacceptable</i>, <i>certificate expired</i>. Jab auditor pooche ki DH group 2 abhi bhi enabled kyun hai, ya manager pooche ki kya "quantum" VPN ke liye asli khatra hai, to aapse jawab ki umeed hoti hai. Zyada tar VPN outages bugs nahi hote; woh do sides hain jo ek crypto parameter par agree nahi karti.</p>

<h3>Is module mein use hone wali lab topology</h3>
<p>Hum poore module mein ek chhota network use karenge. <b>R1</b> HQ router hai, public address 203.0.113.1 aur LAN 10.1.1.0/24. <b>R2</b> Pune branch router hai, public address 198.51.100.2 aur LAN 10.2.2.0/24. Ek tunnel interface dono ko 172.16.12.0/30 par jodta hai. <b>ASA1</b> (203.0.113.10) Secure Client use karne wale staff ke remote access VPNs terminate karta hai. Enterprise CA, <b>NK-CA</b>, 192.0.2.50 (ca.nk.example) par hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module lab topology">
<rect x="20" y="70" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="92" text-anchor="middle" class="svg-ink" font-size="13">HQ LAN</text><text x="80" y="110" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.0/24</text>
<rect x="170" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="225" y="92" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="225" y="110" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.1</text>
<rect x="360" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="415" y="92" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="415" y="110" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.2</text>
<rect x="500" y="70" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="92" text-anchor="middle" class="svg-ink" font-size="13">Pune LAN</text><text x="560" y="110" text-anchor="middle" class="svg-muted" font-size="12">10.2.2.0/24</text>
<line x1="140" y1="95" x2="170" y2="95" stroke="#64748b" stroke-width="2"/><line x1="470" y1="95" x2="500" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="280" y1="95" x2="360" y2="95" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/><text x="320" y="85" text-anchor="middle" class="svg-accent" font-size="12">IPsec Tunnel0</text>
<rect x="170" y="150" width="110" height="40" rx="8" fill="#fed7aa"/><text x="225" y="175" text-anchor="middle" class="svg-ink" font-size="13">ASA1 .10</text>
<rect x="20" y="10" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="95" y="35" text-anchor="middle" class="svg-ink" font-size="13">NK-CA 192.0.2.50</text>
<rect x="400" y="150" width="200" height="40" rx="8" fill="#fde68a"/><text x="500" y="175" text-anchor="middle" class="svg-ink" font-size="13">Remote user, Secure Client</text>
<line x1="280" y1="170" x2="400" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
</svg><p class="cap">R1 aur R2 site-to-site tunnel banate hain; ASA1 remote users ko serve karta hai; NK-CA har certificate issue karti hai.</p></div>

<h3>Yeh module kaise organise hai</h3>
<table class="cmp"><tr><th>Chapters</th><th>Topic</th></tr>
<tr><td>2 se 5</td><td>Primitives: hashing aur HMAC, symmetric AES, Diffie-Hellman ke saath asymmetric RSA/ECC, digital signatures aur X.509 certificates</td></tr>
<tr><td>6</td><td>PKI: CA hierarchy, CSR, SCEP/EST/manual enrollment, CRL/OCSP, IOS aur ASA par trustpoints</td></tr>
<tr><td>7 se 9</td><td>Protocols: TLS 1.2 vs 1.3, IKEv1/IKEv2 aur NAT-T ke saath IPsec, PSK vs certificate authentication</td></tr>
<tr><td>10</td><td>VPN types ki tulna, Secure Client ke saath remote access, high availability</td></tr>
<tr><td>11 se 13</td><td>Post-quantum cryptography, negotiation mismatches ka troubleshooting, summary aur exam checklist</td></tr>
</table>
<p>Is track ke baad ke modules (sec-asa-vpn aur sec-ftd-vpn) yeh tunnels hands-on banate hain. Yahan aap theory aur wajah seekhte ho, taaki lab commands samajh aayein.</p>

<div class="eg"><p><b>Worked example.</b> Koi bhi HTTPS site aur ek VPN ek saath kholo aur list karo ki har ek kya use karta hai. Browser: key ke liye ECDHE (elliptic curve par Diffie-Hellman), authentication ke liye certificate ke andar RSA ya ECDSA signature, data ke liye AES-128-GCM, handshake ke andar SHA-256. R1 aur R2 ke beech IPsec tunnel: key ke liye DH group 19, authentication ke liye pre-shared key ya certificate, data ke liye AES-256-GCM, PRF ke roop mein SHA-384. Wahi paanch tools, alag packaging.</p></div>

<div class="warn"><p><b>Common galti.</b> Kehna "VPN encrypted hai, isliye secure hai". Authentication ke bina encryption beech mein baithe attacker ko do encrypted tunnels banane deta hai, har side se ek. Hamesha chaar sawaal poocho: key kiske paas hai, peer ko kaise authenticate kiya, integrity kaise protect hoti hai, aur key kitni fresh hai?</p></div>

<div class="exam"><p><b>Exam trap.</b> Hashing encryption nahi hai. Hash ko reverse karke data wapas nahi milta, isliye yeh kabhi confidentiality nahi deta. Agar option kahe "SHA-256 payload encrypt karta hai", to woh galat hai.</p></div>

<div class="scn"><h4>"Secure" tunnel jo DES use karta tha</h4><p>Ek purani branch ke audit mein security team ko ek site-to-site tunnel mila jo abhi bhi MD5 aur DH group 1 ke saath DES negotiate kar raha tha. Yeh baarah saal se "chal" raha tha, isliye kisi ne haath nahi lagaya. Auditor ne bataya ki 56-bit DES modern hardware se ghanton mein brute-force ho sakta hai aur group 1 ek 768-bit prime hai. Engineer ne maintenance window mein dono peers ko DH group 19 ke saath AES-256-GCM par move kiya, phir purana proposal hata diya taaki koi peer wapas fall back na kar sake.</p><p><b>Seekh:</b> "up" tunnel achhi crypto ka saboot nahi hai. Proposals regularly review karo aur legacy options delete karo.</p></div>

<div class="iv"><p class="q">"Network mein cryptography humein kya deti hai, aur har property kaunsa tool deta hai?"</p><p>Strong answer: AES jaise symmetric encryption se confidentiality; SHA-256 jaise hashing aur HMAC se integrity; pre-shared keys, digital signatures aur certificates se authentication; digital signatures se non-repudiation; aur Diffie-Hellman se secure key agreement. Phir ek asli example jodo, jaise DH group 19, certificate authentication aur AES-GCM use karne wala IKEv2 tunnel.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cryptography confidentiality, integrity, authentication, non-repudiation aur key agreement deti hai.</li>
<li>Encryption data chhupata hai; hashes aur HMACs badlav pakadte hain; signatures aur certificates identity saabit karte hain.</li>
<li>Diffie-Hellman do peers ko bina bheje same key nikaalne deta hai.</li>
<li>TLS aur IPsec same primitives ke packages hain, jo fixed order mein negotiate hote hain.</li>
<li>Zyada tar VPN failures ek crypto parameter ka mismatch hote hain, jise pakadna yeh module sikhata hai.</li>
</ul></div>
`}};export{e as default};