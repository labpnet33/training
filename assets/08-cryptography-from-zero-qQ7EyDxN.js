var e={id:`crypto`,h:{en:`Cryptography from zero: hashes, keys, certificates, TLS and VPNs`,hi:`Cryptography zero se: hashes, keys, certificates, TLS aur VPNs`},body:{en:`
<p>Think about sending a valuable parcel. You want nobody to open it on the way (confidentiality), nobody to swap the contents (integrity) and the receiver to be sure it really came from you (authentication). In the physical world you use a locked box, a tamper seal and a signature. Cryptography gives us digital versions of all three. This chapter builds the vocabulary; the cryptography and VPN modules go deeper into IKE, IPsec, PKI and post-quantum algorithms.</p>

<h3>Hashes: a fingerprint of data</h3>
<p>A <b>hash function</b> turns any input into a fixed-size value, the digest. SHA-256 always produces 256 bits, whether the input is one word or a 4 GB file. Good hashes are <b>one-way</b> (you cannot get the input back) and <b>collision resistant</b> (you cannot find two inputs with the same digest). Change one bit of the file and the digest changes completely. Uses: checking that a downloaded image is intact, storing passwords (with a salt and a slow algorithm), identifying malware by file hash in EDR and threat intelligence. <b>MD5</b> and <b>SHA-1</b> are broken for collision resistance; use the SHA-2 family (SHA-256, SHA-384) or SHA-3.</p>
<p>A hash alone proves nothing about who sent the data, because anybody can compute it. An <b>HMAC</b> mixes a secret key into the hash, so only someone with the key can produce the right value. IPsec and TLS use HMAC or authenticated encryption for integrity.</p>

<h3>Symmetric encryption: one shared key</h3>
<p>In <b>symmetric</b> encryption the same key encrypts and decrypts. It is very fast, so it protects bulk data. The standard is <b>AES</b> with 128 or 256-bit keys, today usually in <b>GCM</b> mode, which encrypts and authenticates in one step. Older algorithms such as DES and 3DES are obsolete. The big problem is <b>key distribution</b>: how do two parties that have never met agree on a secret key over an untrusted network?</p>

<h3>Asymmetric encryption: a key pair</h3>
<p><b>Asymmetric</b> (public key) cryptography gives each party a <b>key pair</b>. The <b>public key</b> can be shared with anyone; the <b>private key</b> never leaves its owner. What one key does, only the other can undo. Algorithms: <b>RSA</b> (2048 bits or more) and <b>elliptic curve</b> cryptography (ECDSA for signatures, ECDH for key agreement), which gives the same strength with much smaller keys. Asymmetric operations are slow, so they are used for two jobs only: agreeing on a symmetric key and creating digital signatures.</p>
<p><b>Diffie-Hellman (DH)</b> lets two parties derive the same secret over a public channel without ever sending it. When fresh DH values are used for every session, stealing a long-term private key later does not reveal old sessions; this is <b>perfect forward secrecy (PFS)</b>.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Hybrid encryption in TLS">
<rect x="10" y="20" width="150" height="50" rx="8" fill="#bae6fd"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="13">Browser</text><text x="85" y="60" text-anchor="middle" class="svg-muted" font-size="12">client</text>
<rect x="480" y="20" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="555" y="42" text-anchor="middle" class="svg-ink" font-size="13">portal server</text><text x="555" y="60" text-anchor="middle" class="svg-muted" font-size="12">certificate + private key</text>
<line x1="160" y1="45" x2="480" y2="45" stroke="#64748b" stroke-width="2"/><text x="320" y="38" text-anchor="middle" class="svg-accent" font-size="12">1 ECDHE key share + certificate (asymmetric)</text>
<rect x="170" y="85" width="300" height="40" rx="8" fill="#fde68a"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">2 both derive the same session key</text>
<line x1="85" y1="70" x2="85" y2="160" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="555" y1="70" x2="555" y2="160" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<rect x="10" y="150" width="620" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">3 all application data encrypted with AES-GCM (symmetric, fast)</text>
</svg><p class="cap">Hybrid cryptography: slow asymmetric maths agrees a key and proves identity, fast symmetric encryption protects the data.</p></div>

<h3>Digital signatures and certificates</h3>
<p>A <b>digital signature</b> is a hash of the data encrypted (signed) with the sender's private key. Anyone with the public key can verify it, proving integrity, origin and <b>non-repudiation</b> (the signer cannot deny it). But how do you know a public key really belongs to portal.nwkings.example? A <b>certificate</b> (X.509) binds a name to a public key, and a <b>certificate authority (CA)</b> signs it. Your device trusts a small set of <b>root CAs</b>; roots sign <b>intermediate CAs</b>; intermediates sign server certificates. This hierarchy is <b>PKI</b> (public key infrastructure). Certificates expire, and they can be revoked early through a <b>CRL</b> (revocation list) or checked live with <b>OCSP</b>.</p>

<pre class="out">$ openssl x509 -in portal.crt -noout -subject -issuer -dates -ext subjectAltName
subject=CN = portal.nwkings.example
issuer=C = IN, O = NK Sim, CN = NK Sim Issuing CA 1
notBefore=Jan 10 00:00:00 2026 GMT
<span class="hl">notAfter=Jan 10 23:59:59 2027 GMT</span>
X509v3 Subject Alternative Name:
    DNS:portal.nwkings.example, DNS:vpn.nwkings.example</pre>
<p>Check the name users type is in the SAN list, the issuer chains to a trusted root and the validity dates include today. Expired certificates are one of the most common causes of VPN and portal outages.</p>

<h3>TLS: how HTTPS and many VPNs protect data</h3>
<p><b>TLS 1.3</b>, the current version, completes its handshake in one round trip: the client and server exchange ECDHE key shares, the server proves its identity with its certificate and a signature, both derive session keys, and the data flows under AES-GCM or ChaCha20-Poly1305. TLS 1.3 always gives forward secrecy. TLS 1.0 and 1.1 are deprecated. Because TLS hides content, an NGFW needs decryption to inspect it, and that has privacy and performance costs.</p>

<h3>VPNs in one view</h3>
<ul>
<li><b>Site-to-site VPN</b>: two gateways (firewalls or routers) build an <b>IPsec</b> tunnel. <b>IKEv2</b> authenticates the peers (pre-shared key or certificates) and negotiates keys; <b>ESP</b> encrypts and authenticates the traffic. AH gives integrity only and does not work through NAT.</li>
<li><b>Remote access VPN</b>: a user's laptop connects with <b>Cisco Secure Client</b> (formerly AnyConnect) to an ASA or Threat Defense, using TLS/DTLS or IKEv2, usually with MFA. Split tunnelling decides which traffic goes into the tunnel.</li>
<li><b>ZTNA</b> is the modern alternative: access per application instead of a full network tunnel (chapter 9).</li>
</ul>

<div class="note"><p><b>Post-quantum preview.</b> A large quantum computer could break RSA and elliptic-curve cryptography. NIST has standardised post-quantum algorithms, including ML-KEM for key establishment and ML-DSA for signatures. Attackers may record encrypted traffic today to decrypt it later ("harvest now, decrypt later"), so long-lived secrets matter first. Symmetric AES-256 remains strong. The cryptography module covers this.</p></div>

<div class="eg"><p><b>Worked example.</b> A branch firewall builds an IPsec tunnel to head office with IKEv2, DH group 19 (ECDH P-256), AES-256-GCM for ESP and SHA-256 for the IKE integrity and PRF. The peers authenticate with certificates from the company CA. Asymmetric maths (ECDH and certificate signatures) runs once per rekey; every data packet uses fast symmetric AES-GCM.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Calling hashing "encryption" (a hash cannot be decrypted). Thinking the public key must be kept secret. Letting certificates expire without monitoring. Keeping 3DES, SHA-1 or DH group 2 in VPN proposals "for compatibility".</p></div>

<div class="exam"><p><b>Exam trap.</b> You encrypt with the receiver's public key for confidentiality, and sign with your own private key for authenticity. ESP provides confidentiality; AH does not. PFS comes from fresh DH per session. AES is symmetric; RSA and ECC are asymmetric.</p></div>

<div class="scn"><h4>Monday morning, nobody can connect</h4><p>At 9 a.m. on a Monday every remote worker got a certificate warning from Secure Client and the connection failed. The helpdesk suspected the ISP. A security engineer checked the VPN gateway's identity certificate: it had expired at midnight on Sunday. A renewed certificate from the CA was installed and bound to the outside interface; users reconnected within minutes. Afterwards the team added certificate expiry monitoring with alerts at 60, 30 and 7 days.</p><p><b>Lesson:</b> PKI is operations, not only maths. Track every certificate and its expiry date.</p></div>

<div class="iv"><p class="q">"Why does TLS use both asymmetric and symmetric encryption?"</p><p>Strong answer: asymmetric cryptography solves key exchange and identity (ECDHE plus the server certificate and signature) but is slow; symmetric AES-GCM is fast enough for bulk data but needs a shared key. TLS uses asymmetric maths once to agree the key and authenticate, then symmetric encryption for everything else. Mention forward secrecy from ephemeral ECDHE.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hashes (SHA-256) give integrity; HMAC adds a key; MD5 and SHA-1 are broken.</li>
<li>Symmetric (AES) is fast but needs key sharing; asymmetric (RSA, ECC) solves key exchange and signatures.</li>
<li>Certificates bind names to public keys; CAs sign them; CRL and OCSP handle revocation.</li>
<li>TLS 1.3 = ECDHE + certificate + AES-GCM, always with forward secrecy.</li>
<li>Site-to-site IPsec (IKEv2 + ESP) and remote access with Secure Client; post-quantum algorithms are coming.</li>
</ul></div>
`,hi:`
<p>Ek keemti parcel bhejne ke baare mein socho. Aap chahte ho ki raste mein koi use khole nahi (confidentiality), koi andar ka saaman badle nahi (integrity) aur receiver ko pakka pata ho ki yeh sach mein aapse aaya (authentication). Physical duniya mein aap locked box, tamper seal aur signature use karte ho. Cryptography hamein teeno ke digital versions deti hai. Yeh chapter vocabulary banata hai; cryptography aur VPN modules IKE, IPsec, PKI aur post-quantum algorithms mein aur gehraai se jaate hain.</p>

<h3>Hashes: data ka fingerprint</h3>
<p><b>Hash function</b> kisi bhi input ko fixed-size value, yaani digest, mein badal deta hai. SHA-256 hamesha 256 bits deta hai, chahe input ek word ho ya 4 GB file. Achhe hashes <b>one-way</b> hote hain (aap input wapas nahi nikal sakte) aur <b>collision resistant</b> (aap same digest wale do inputs nahi dhoondh sakte). File ka ek bit badlo aur digest poori tarah badal jaata hai. Uses: check karna ki download hui image sahi hai, passwords store karna (salt aur slow algorithm ke saath), EDR aur threat intelligence mein file hash se malware pehchaanna. <b>MD5</b> aur <b>SHA-1</b> collision resistance ke liye toot chuke hain; SHA-2 family (SHA-256, SHA-384) ya SHA-3 use karo.</p>
<p>Akela hash yeh prove nahi karta ki data kisne bheja, kyunki koi bhi use compute kar sakta hai. <b>HMAC</b> hash mein ek secret key milata hai, isliye sirf key wala hi sahi value bana sakta hai. IPsec aur TLS integrity ke liye HMAC ya authenticated encryption use karte hain.</p>

<h3>Symmetric encryption: ek shared key</h3>
<p><b>Symmetric</b> encryption mein wahi key encrypt aur decrypt karti hai. Yeh bahut fast hai, isliye bulk data protect karti hai. Standard <b>AES</b> hai 128 ya 256-bit keys ke saath, aaj aam taur par <b>GCM</b> mode mein, jo ek step mein encrypt aur authenticate karta hai. DES aur 3DES jaise purane algorithms obsolete hain. Badi problem <b>key distribution</b> hai: do parties jo kabhi mili nahi, untrusted network par secret key par kaise agree karein?</p>

<h3>Asymmetric encryption: key pair</h3>
<p><b>Asymmetric</b> (public key) cryptography har party ko ek <b>key pair</b> deti hai. <b>Public key</b> kisi ke saath bhi share ki ja sakti hai; <b>private key</b> kabhi apne owner se bahar nahi jaati. Jo ek key karti hai, use sirf doosri undo kar sakti hai. Algorithms: <b>RSA</b> (2048 bits ya zyada) aur <b>elliptic curve</b> cryptography (signatures ke liye ECDSA, key agreement ke liye ECDH), jo bahut chhoti keys ke saath same strength deti hai. Asymmetric operations slow hote hain, isliye sirf do kaamon ke liye use hote hain: symmetric key par agree karna aur digital signatures banana.</p>
<p><b>Diffie-Hellman (DH)</b> do parties ko public channel par bina bheje same secret derive karne deta hai. Jab har session ke liye fresh DH values use hoti hain, to baad mein long-term private key chori hone par bhi purane sessions reveal nahi hote; yeh <b>perfect forward secrecy (PFS)</b> hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="TLS mein hybrid encryption">
<rect x="10" y="20" width="150" height="50" rx="8" fill="#bae6fd"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="13">Browser</text><text x="85" y="60" text-anchor="middle" class="svg-muted" font-size="12">client</text>
<rect x="480" y="20" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="555" y="42" text-anchor="middle" class="svg-ink" font-size="13">portal server</text><text x="555" y="60" text-anchor="middle" class="svg-muted" font-size="12">certificate + private key</text>
<line x1="160" y1="45" x2="480" y2="45" stroke="#64748b" stroke-width="2"/><text x="320" y="38" text-anchor="middle" class="svg-accent" font-size="12">1 ECDHE key share + certificate (asymmetric)</text>
<rect x="170" y="85" width="300" height="40" rx="8" fill="#fde68a"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">2 dono same session key derive karte hain</text>
<line x1="85" y1="70" x2="85" y2="160" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="555" y1="70" x2="555" y2="160" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<rect x="10" y="150" width="620" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">3 saara application data AES-GCM se encrypted (symmetric, fast)</text>
</svg><p class="cap">Hybrid cryptography: slow asymmetric maths key par agree karta hai aur identity prove karta hai, fast symmetric encryption data protect karta hai.</p></div>

<h3>Digital signatures aur certificates</h3>
<p><b>Digital signature</b> data ka hash hai jo sender ki private key se encrypt (sign) kiya gaya hai. Public key wala koi bhi use verify kar sakta hai, jisse integrity, origin aur <b>non-repudiation</b> (signer mana nahi kar sakta) prove hote hain. Lekin aapko kaise pata ki ek public key sach mein portal.nwkings.example ki hai? <b>Certificate</b> (X.509) ek naam ko public key se jodta hai, aur <b>certificate authority (CA)</b> use sign karti hai. Aapka device <b>root CAs</b> ke chhote set par trust karta hai; roots <b>intermediate CAs</b> ko sign karte hain; intermediates server certificates ko sign karte hain. Yeh hierarchy <b>PKI</b> (public key infrastructure) hai. Certificates expire hote hain, aur unhe <b>CRL</b> (revocation list) se jaldi revoke kiya ja sakta hai ya <b>OCSP</b> se live check kiya ja sakta hai.</p>

<pre class="out">$ openssl x509 -in portal.crt -noout -subject -issuer -dates -ext subjectAltName
subject=CN = portal.nwkings.example
issuer=C = IN, O = NK Sim, CN = NK Sim Issuing CA 1
notBefore=Jan 10 00:00:00 2026 GMT
<span class="hl">notAfter=Jan 10 23:59:59 2027 GMT</span>
X509v3 Subject Alternative Name:
    DNS:portal.nwkings.example, DNS:vpn.nwkings.example</pre>
<p>Check karo ki users jo naam type karte hain woh SAN list mein hai, issuer trusted root tak chain karta hai aur validity dates mein aaj ki date aati hai. Expired certificates VPN aur portal outages ki sabse common wajahon mein se ek hain.</p>

<h3>TLS: HTTPS aur kai VPNs data kaise protect karte hain</h3>
<p><b>TLS 1.3</b>, current version, apna handshake ek round trip mein poora karta hai: client aur server ECDHE key shares exchange karte hain, server apne certificate aur signature se identity prove karta hai, dono session keys derive karte hain, aur data AES-GCM ya ChaCha20-Poly1305 ke under chalta hai. TLS 1.3 hamesha forward secrecy deta hai. TLS 1.0 aur 1.1 deprecated hain. Kyunki TLS content chhupata hai, NGFW ko use inspect karne ke liye decryption chahiye, aur uski privacy aur performance cost hoti hai.</p>

<h3>VPNs ek nazar mein</h3>
<ul>
<li><b>Site-to-site VPN</b>: do gateways (firewalls ya routers) <b>IPsec</b> tunnel banate hain. <b>IKEv2</b> peers ko authenticate karta hai (pre-shared key ya certificates) aur keys negotiate karta hai; <b>ESP</b> traffic ko encrypt aur authenticate karta hai. AH sirf integrity deta hai aur NAT ke through kaam nahi karta.</li>
<li><b>Remote access VPN</b>: user ka laptop <b>Cisco Secure Client</b> (pehle AnyConnect) se ASA ya Threat Defense se connect karta hai, TLS/DTLS ya IKEv2 use karke, aam taur par MFA ke saath. Split tunnelling decide karta hai ki kaunsa traffic tunnel mein jaata hai.</li>
<li><b>ZTNA</b> modern alternative hai: poore network tunnel ki jagah per application access (chapter 9).</li>
</ul>

<div class="note"><p><b>Post-quantum preview.</b> Ek bada quantum computer RSA aur elliptic-curve cryptography tod sakta hai. NIST ne post-quantum algorithms standardise kiye hain, jinmein key establishment ke liye ML-KEM aur signatures ke liye ML-DSA shaamil hain. Attackers aaj encrypted traffic record karke baad mein decrypt kar sakte hain ("harvest now, decrypt later"), isliye lambe chalne wale secrets pehle matter karte hain. Symmetric AES-256 mazboot rehta hai. Cryptography module ise cover karta hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Ek branch firewall head office tak IKEv2, DH group 19 (ECDH P-256), ESP ke liye AES-256-GCM aur IKE integrity aur PRF ke liye SHA-256 ke saath IPsec tunnel banata hai. Peers company CA ke certificates se authenticate karte hain. Asymmetric maths (ECDH aur certificate signatures) har rekey par ek baar chalta hai; har data packet fast symmetric AES-GCM use karta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Hashing ko "encryption" kehna (hash decrypt nahi ho sakta). Yeh sochna ki public key secret rakhni chahiye. Bina monitoring ke certificates expire hone dena. VPN proposals mein "compatibility ke liye" 3DES, SHA-1 ya DH group 2 rakhna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Confidentiality ke liye aap receiver ki public key se encrypt karte ho, aur authenticity ke liye apni private key se sign karte ho. ESP confidentiality deta hai; AH nahi. PFS har session ke fresh DH se aata hai. AES symmetric hai; RSA aur ECC asymmetric hain.</p></div>

<div class="scn"><h4>Monday subah, koi connect nahi kar pa raha</h4><p>Monday subah 9 baje har remote worker ko Secure Client se certificate warning mili aur connection fail hua. Helpdesk ko ISP par shak tha. Ek security engineer ne VPN gateway ka identity certificate check kiya: woh Sunday aadhi raat ko expire ho gaya tha. CA se renewed certificate install karke outside interface se bind kiya gaya; users minutes mein reconnect ho gaye. Baad mein team ne 60, 30 aur 7 din par alerts ke saath certificate expiry monitoring jodi.</p><p><b>Seekh:</b> PKI sirf maths nahi, operations hai. Har certificate aur uski expiry date track karo.</p></div>

<div class="iv"><p class="q">"TLS asymmetric aur symmetric dono encryption kyun use karta hai?"</p><p>Strong answer: asymmetric cryptography key exchange aur identity solve karti hai (ECDHE plus server certificate aur signature) lekin slow hai; symmetric AES-GCM bulk data ke liye kaafi fast hai lekin use shared key chahiye. TLS key par agree karne aur authenticate karne ke liye ek baar asymmetric maths use karta hai, phir baaki sab ke liye symmetric encryption. Ephemeral ECDHE se forward secrecy mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hashes (SHA-256) integrity dete hain; HMAC key jodta hai; MD5 aur SHA-1 toot chuke hain.</li>
<li>Symmetric (AES) fast hai lekin key sharing chahiye; asymmetric (RSA, ECC) key exchange aur signatures solve karta hai.</li>
<li>Certificates naamon ko public keys se jodte hain; CAs unhe sign karti hain; CRL aur OCSP revocation sambhalte hain.</li>
<li>TLS 1.3 = ECDHE + certificate + AES-GCM, hamesha forward secrecy ke saath.</li>
<li>Site-to-site IPsec (IKEv2 + ESP) aur Secure Client se remote access; post-quantum algorithms aa rahe hain.</li>
</ul></div>
`}};export{e as default};