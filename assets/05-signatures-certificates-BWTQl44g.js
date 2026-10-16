var e={id:`signatures-certs`,h:{en:`Digital signatures and what is inside an X.509 certificate`,hi:`Digital signatures aur X.509 certificate ke andar kya hota hai`},body:{en:`
<p>In old India, a king sealed a royal order by pressing his personal signet ring into hot wax. Anyone could look at the seal and compare it with the known pattern of the king's ring, but only the king could make it. If the paper was altered after sealing, the broken wax showed it. A <b>digital signature</b> is that signet ring for data: only the private-key holder can create it, and anyone with the public key can check it.</p>

<h3>How signing and verifying work</h3>
<ol>
<li>The signer hashes the message, for example with SHA-256, to get a short digest.</li>
<li>The signer applies its <b>private key</b> to the digest. The result is the <b>signature</b>, which is attached to the message.</li>
<li>The verifier hashes the received message itself.</li>
<li>The verifier applies the signer's <b>public key</b> to the signature. If the result matches its own digest, the message is intact and came from the private-key holder.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Digital signature sign and verify">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">Signer (R2)</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">Verifier (R1)</text>
<rect x="30" y="35" width="120" height="36" rx="8" fill="#bbf7d0"/><text x="90" y="58" text-anchor="middle" class="svg-ink" font-size="13">Message</text>
<rect x="30" y="95" width="120" height="36" rx="8" fill="#ddd6fe"/><text x="90" y="118" text-anchor="middle" class="svg-ink" font-size="13">SHA-256</text>
<rect x="30" y="155" width="120" height="36" rx="8" fill="#fed7aa"/><text x="90" y="178" text-anchor="middle" class="svg-ink" font-size="13">private key</text>
<rect x="180" y="155" width="110" height="36" rx="8" fill="#fde68a"/><text x="235" y="178" text-anchor="middle" class="svg-ink" font-size="13">signature</text>
<line x1="90" y1="71" x2="90" y2="95" stroke="#64748b"/><line x1="90" y1="131" x2="90" y2="155" stroke="#64748b"/><line x1="150" y1="173" x2="180" y2="173" stroke="#64748b"/>
<line x1="150" y1="53" x2="350" y2="53" stroke="#64748b" stroke-dasharray="5 4"/><line x1="290" y1="173" x2="350" y2="173" stroke="#64748b" stroke-dasharray="5 4"/>
<rect x="350" y="35" width="120" height="36" rx="8" fill="#bbf7d0"/><text x="410" y="58" text-anchor="middle" class="svg-ink" font-size="13">Message</text>
<rect x="350" y="95" width="120" height="36" rx="8" fill="#ddd6fe"/><text x="410" y="118" text-anchor="middle" class="svg-ink" font-size="13">SHA-256</text>
<rect x="350" y="155" width="120" height="36" rx="8" fill="#bae6fd"/><text x="410" y="178" text-anchor="middle" class="svg-ink" font-size="13">public key</text>
<line x1="410" y1="71" x2="410" y2="95" stroke="#64748b"/>
<rect x="500" y="120" width="120" height="44" rx="8" fill="#e2e8f0"/><text x="560" y="140" text-anchor="middle" class="svg-ink" font-size="13">digests equal?</text><text x="560" y="156" text-anchor="middle" class="svg-muted" font-size="12">yes = valid</text>
<line x1="470" y1="113" x2="500" y2="135" stroke="#64748b"/><line x1="470" y1="173" x2="500" y2="150" stroke="#64748b"/>
<text x="320" y="225" text-anchor="middle" class="svg-accent" font-size="12">Only the private key signs; anyone with the public key verifies</text>
</svg><p class="cap">A signature is the hash of the data transformed with the private key. Verification needs only the public key.</p></div>

<h3>What a signature gives, compared with HMAC</h3>
<table class="cmp"><tr><th>Property</th><th>HMAC</th><th>Digital signature</th></tr>
<tr><td>Integrity</td><td>Yes</td><td>Yes</td></tr>
<tr><td>Origin authentication</td><td>Yes, "someone with the shared key"</td><td>Yes, "the one private-key holder"</td></tr>
<tr><td>Non-repudiation</td><td>No, both sides hold the key</td><td>Yes, only the signer holds the private key</td></tr>
<tr><td>Speed</td><td>Very fast, used per packet</td><td>Slow, used once per handshake</td></tr>
</table>

<h3>Signature algorithms</h3>
<ul>
<li><b>RSA signatures</b> (PKCS#1 v1.5 and the newer RSA-PSS). A 2048-bit signature is 256 bytes. IKEv2 calls this <code>rsa-sig</code>.</li>
<li><b>ECDSA</b> on P-256 or P-384. Much smaller signatures (about 64 to 104 bytes). IKEv2 calls this <code>ecdsa-sig</code>. Part of Cisco NGE.</li>
<li><b>EdDSA (Ed25519)</b>. Fast and simple; common in SSH keys and TLS 1.3.</li>
</ul>
<p>Where you meet signatures daily: the certificate chain in every HTTPS connection, the IKE_AUTH exchange of certificate-based VPNs, SSH host keys (the fingerprint prompt on first login), TLS 1.3 CertificateVerify, signed software images checked by Secure Boot, and DNSSEC.</p>

<h3>The missing piece: whose public key is this?</h3>
<p>Verification is only as good as the public key you use. If an attacker hands you <i>his</i> public key while claiming to be R2, his signature will verify perfectly. We need a trusted statement that says "this public key belongs to R2.nk.example". That statement is a <b>certificate</b>: a small document containing a name and a public key, <b>signed by a certificate authority</b> you already trust.</p>

<h3>Anatomy of an X.509 v3 certificate</h3>
<dl class="terms">
<dt>Version, serial number</dt><dd>Version 3 supports extensions; the serial is unique per CA and is what a CRL lists when revoking.</dd>
<dt>Signature algorithm, issuer</dt><dd>How the CA signed (for example sha256WithRSAEncryption) and the CA's name.</dd>
<dt>Validity</dt><dd>Not Before and Not After dates. Wrong device clocks break certificate authentication.</dd>
<dt>Subject and Subject Public Key Info</dt><dd>The owner's name and public key. Modern clients check the name in the <b>Subject Alternative Name (SAN)</b> extension, not the CN.</dd>
<dt>Key Usage, Extended Key Usage</dt><dd>What the key may do: digitalSignature, keyEncipherment, keyCertSign; EKU such as serverAuth, clientAuth.</dd>
<dt>Basic Constraints</dt><dd>CA:TRUE for CA certificates, CA:FALSE for devices and users.</dd>
<dt>CRL distribution point, AIA</dt><dd>Where to fetch the revocation list and the OCSP responder (chapter 6).</dd>
</dl>

<pre class="out">$ openssl x509 -in R1.pem -noout -text
Certificate:
    Data:
        Version: 3 (0x2)
<span class="hl">        Serial Number: 1a:2b:3c</span>
        Signature Algorithm: sha256WithRSAEncryption
<span class="hl">        Issuer: CN = NK-Issuing-CA, O = MyPnetLab Lab</span>
        Validity
            Not Before: Sep  1 09:15:02 2026 GMT
<span class="hl">            Not After : Sep  1 09:15:02 2027 GMT</span>
        Subject: CN = R1.nk.example
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                Public-Key: (2048 bit)
        X509v3 extensions:
            X509v3 Key Usage: critical
                Digital Signature, Key Encipherment
            X509v3 Extended Key Usage:
                TLS Web Server Authentication, TLS Web Client Authentication
<span class="hl">            X509v3 Subject Alternative Name:
                DNS:R1.nk.example</span>
            X509v3 Basic Constraints: critical
                CA:FALSE</pre>

<div class="eg"><p><b>Worked example.</b> R1 receives R2's certificate during IKE_AUTH. R1 checks: (1) the issuer NK-Issuing-CA is in its trustpoint; (2) the CA's signature on the certificate verifies with the CA public key; (3) today's date, 30 September 2026, is between Not Before and Not After; (4) the serial is not on the CRL; (5) the identity R2.nk.example matches what the IKEv2 profile expects. Only then does R1 verify R2's AUTH payload, which is a signature over the handshake made with R2's private key. Five checks on the certificate, one signature check on the handshake.</p></div>

<p>File formats you will handle: <b>PEM</b> (Base64 text between BEGIN CERTIFICATE and END CERTIFICATE lines, pasted into terminals), <b>DER</b> (binary), <b>PKCS#10</b> (a CSR), <b>PKCS#7</b> (a chain of certificates) and <b>PKCS#12</b> (.p12 or .pfx, a certificate <i>with</i> its private key, protected by a password).</p>

<div class="warn"><p><b>Common mistake.</b> Emailing a PKCS#12 file with a weak password to import a VPN certificate. It contains the private key, so anyone who opens it can impersonate the device. Generate keys on the device and send only the CSR.</p></div>

<div class="exam"><p><b>Exam trap.</b> The sender signs with its <b>own private key</b>; the receiver verifies with the <b>sender's public key</b>. Encrypting for someone uses <b>their public key</b>. Questions love to swap "own" and "their".</p></div>

<div class="scn"><h4>The SSH warning everybody clicked through</h4><p>After a router was replaced under RMA, every engineer's SSH client warned that the host key had changed. The team had been told to "just accept it". A security review showed that one jump host accepted a changed key for a different router too, where no hardware had been replaced. Investigation traced it to a misconfigured lab device using a duplicate IP address. Nothing malicious this time, but the same warning is exactly what a man-in-the-middle would cause.</p><p><b>Lesson:</b> a changed signature key is a security event. Verify fingerprints out of band, or use certificate-based SSH host keys.</p></div>

<div class="iv"><p class="q">"How does a digital signature provide non-repudiation, and why doesn't HMAC?"</p><p>Strong answer: the signature is created with a private key that only the signer holds, and anyone can verify it with the public key, so the signer cannot plausibly deny creating it. With HMAC both parties share the same key, so either could have produced the tag. Then explain the flow: hash, sign the hash with the private key, verifier hashes and checks with the public key, and a certificate binds that public key to an identity.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sign the hash with your private key; others verify with your public key.</li>
<li>Signatures give integrity, authentication and non-repudiation; HMAC cannot give non-repudiation.</li>
<li>RSA, ECDSA and EdDSA are the common signature algorithms; IKEv2 uses rsa-sig and ecdsa-sig.</li>
<li>A certificate is a CA-signed binding of a name (SAN) to a public key, with validity and usage limits.</li>
<li>PKCS#12 contains the private key; a CSR does not.</li>
</ul></div>
`,hi:`
<p>Purane Bharat mein raja shahi hukm ko garam lakh (wax) mein apni personal mohar wali anguthi dabaa kar seal karta tha. Koi bhi seal dekh kar use raja ki anguthi ke jaane-pehchane pattern se compare kar sakta tha, par sirf raja hi use bana sakta tha. Agar seal ke baad kaagaz badla jaata, to tooti lakh dikha deti. <b>Digital signature</b> data ke liye wahi mohar hai: sirf private-key holder use bana sakta hai, aur public key wala koi bhi use check kar sakta hai.</p>

<h3>Signing aur verifying kaise kaam karte hain</h3>
<ol>
<li>Signer message ko hash karta hai, jaise SHA-256 se, taaki chhota digest mile.</li>
<li>Signer digest par apni <b>private key</b> apply karta hai. Result <b>signature</b> hai, jo message ke saath attach hota hai.</li>
<li>Verifier mile hue message ko khud hash karta hai.</li>
<li>Verifier signature par signer ki <b>public key</b> apply karta hai. Agar result uske apne digest se match kare, to message sahi-salamat hai aur private-key holder se aaya.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Digital signature sign aur verify">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">Signer (R2)</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">Verifier (R1)</text>
<rect x="30" y="35" width="120" height="36" rx="8" fill="#bbf7d0"/><text x="90" y="58" text-anchor="middle" class="svg-ink" font-size="13">Message</text>
<rect x="30" y="95" width="120" height="36" rx="8" fill="#ddd6fe"/><text x="90" y="118" text-anchor="middle" class="svg-ink" font-size="13">SHA-256</text>
<rect x="30" y="155" width="120" height="36" rx="8" fill="#fed7aa"/><text x="90" y="178" text-anchor="middle" class="svg-ink" font-size="13">private key</text>
<rect x="180" y="155" width="110" height="36" rx="8" fill="#fde68a"/><text x="235" y="178" text-anchor="middle" class="svg-ink" font-size="13">signature</text>
<line x1="90" y1="71" x2="90" y2="95" stroke="#64748b"/><line x1="90" y1="131" x2="90" y2="155" stroke="#64748b"/><line x1="150" y1="173" x2="180" y2="173" stroke="#64748b"/>
<line x1="150" y1="53" x2="350" y2="53" stroke="#64748b" stroke-dasharray="5 4"/><line x1="290" y1="173" x2="350" y2="173" stroke="#64748b" stroke-dasharray="5 4"/>
<rect x="350" y="35" width="120" height="36" rx="8" fill="#bbf7d0"/><text x="410" y="58" text-anchor="middle" class="svg-ink" font-size="13">Message</text>
<rect x="350" y="95" width="120" height="36" rx="8" fill="#ddd6fe"/><text x="410" y="118" text-anchor="middle" class="svg-ink" font-size="13">SHA-256</text>
<rect x="350" y="155" width="120" height="36" rx="8" fill="#bae6fd"/><text x="410" y="178" text-anchor="middle" class="svg-ink" font-size="13">public key</text>
<line x1="410" y1="71" x2="410" y2="95" stroke="#64748b"/>
<rect x="500" y="120" width="120" height="44" rx="8" fill="#e2e8f0"/><text x="560" y="140" text-anchor="middle" class="svg-ink" font-size="13">digests barabar?</text><text x="560" y="156" text-anchor="middle" class="svg-muted" font-size="12">haan = valid</text>
<line x1="470" y1="113" x2="500" y2="135" stroke="#64748b"/><line x1="470" y1="173" x2="500" y2="150" stroke="#64748b"/>
<text x="320" y="225" text-anchor="middle" class="svg-accent" font-size="12">Sirf private key sign karti hai; public key wala koi bhi verify karta hai</text>
</svg><p class="cap">Signature data ka hash hai jo private key se transform hua. Verification ke liye sirf public key chahiye.</p></div>

<h3>Signature kya deta hai, HMAC ke mukable</h3>
<table class="cmp"><tr><th>Property</th><th>HMAC</th><th>Digital signature</th></tr>
<tr><td>Integrity</td><td>Haan</td><td>Haan</td></tr>
<tr><td>Origin authentication</td><td>Haan, "shared key wala koi"</td><td>Haan, "wahi ek private-key holder"</td></tr>
<tr><td>Non-repudiation</td><td>Nahi, dono sides ke paas key hai</td><td>Haan, private key sirf signer ke paas hai</td></tr>
<tr><td>Speed</td><td>Bahut tez, har packet par use</td><td>Slow, har handshake mein ek baar use</td></tr>
</table>

<h3>Signature algorithms</h3>
<ul>
<li><b>RSA signatures</b> (PKCS#1 v1.5 aur naya RSA-PSS). 2048-bit signature 256 bytes ka hota hai. IKEv2 ise <code>rsa-sig</code> kehta hai.</li>
<li>P-256 ya P-384 par <b>ECDSA</b>. Bahut chhote signatures (lagbhag 64 se 104 bytes). IKEv2 ise <code>ecdsa-sig</code> kehta hai. Cisco NGE ka hissa.</li>
<li><b>EdDSA (Ed25519)</b>. Tez aur simple; SSH keys aur TLS 1.3 mein common.</li>
</ul>
<p>Signatures roz kahan milte hain: har HTTPS connection ki certificate chain mein, certificate-based VPNs ke IKE_AUTH exchange mein, SSH host keys mein (pehle login par fingerprint prompt), TLS 1.3 CertificateVerify mein, Secure Boot se check hone wali signed software images mein, aur DNSSEC mein.</p>

<h3>Missing piece: yeh public key kiski hai?</h3>
<p>Verification utna hi achha hai jitni public key aap use karte ho. Agar attacker R2 hone ka daava karke aapko <i>apni</i> public key de de, to uska signature perfectly verify hoga. Humein ek trusted statement chahiye jo kahe "yeh public key R2.nk.example ki hai". Woh statement <b>certificate</b> hai: ek chhota document jisme naam aur public key hai, aur jise aisi <b>certificate authority ne sign kiya</b> jis par aap pehle se trust karte ho.</p>

<h3>X.509 v3 certificate ki anatomy</h3>
<dl class="terms">
<dt>Version, serial number</dt><dd>Version 3 extensions support karta hai; serial har CA ke liye unique hai aur revoke karte samay CRL isi ko list karti hai.</dd>
<dt>Signature algorithm, issuer</dt><dd>CA ne kaise sign kiya (jaise sha256WithRSAEncryption) aur CA ka naam.</dd>
<dt>Validity</dt><dd>Not Before aur Not After dates. Galat device clocks certificate authentication tod dete hain.</dd>
<dt>Subject aur Subject Public Key Info</dt><dd>Owner ka naam aur public key. Modern clients naam <b>Subject Alternative Name (SAN)</b> extension mein check karte hain, CN mein nahi.</dd>
<dt>Key Usage, Extended Key Usage</dt><dd>Key kya kar sakti hai: digitalSignature, keyEncipherment, keyCertSign; EKU jaise serverAuth, clientAuth.</dd>
<dt>Basic Constraints</dt><dd>CA certificates ke liye CA:TRUE, devices aur users ke liye CA:FALSE.</dd>
<dt>CRL distribution point, AIA</dt><dd>Revocation list aur OCSP responder kahan se laana hai (chapter 6).</dd>
</dl>

<pre class="out">$ openssl x509 -in R1.pem -noout -text
Certificate:
    Data:
        Version: 3 (0x2)
<span class="hl">        Serial Number: 1a:2b:3c</span>
        Signature Algorithm: sha256WithRSAEncryption
<span class="hl">        Issuer: CN = NK-Issuing-CA, O = MyPnetLab Lab</span>
        Validity
            Not Before: Sep  1 09:15:02 2026 GMT
<span class="hl">            Not After : Sep  1 09:15:02 2027 GMT</span>
        Subject: CN = R1.nk.example
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                Public-Key: (2048 bit)
        X509v3 extensions:
            X509v3 Key Usage: critical
                Digital Signature, Key Encipherment
            X509v3 Extended Key Usage:
                TLS Web Server Authentication, TLS Web Client Authentication
<span class="hl">            X509v3 Subject Alternative Name:
                DNS:R1.nk.example</span>
            X509v3 Basic Constraints: critical
                CA:FALSE</pre>

<div class="eg"><p><b>Worked example.</b> IKE_AUTH ke dauran R1 ko R2 ka certificate milta hai. R1 check karta hai: (1) issuer NK-Issuing-CA uske trustpoint mein hai; (2) certificate par CA ka signature CA public key se verify hota hai; (3) aaj ki date, 30 September 2026, Not Before aur Not After ke beech hai; (4) serial CRL par nahi hai; (5) identity R2.nk.example wahi hai jo IKEv2 profile expect karta hai. Tabhi R1 R2 ka AUTH payload verify karta hai, jo R2 ki private key se handshake par bana signature hai. Certificate par paanch checks, handshake par ek signature check.</p></div>

<p>File formats jo aap handle karoge: <b>PEM</b> (BEGIN CERTIFICATE aur END CERTIFICATE lines ke beech Base64 text, terminals mein paste hota hai), <b>DER</b> (binary), <b>PKCS#10</b> (CSR), <b>PKCS#7</b> (certificates ki chain) aur <b>PKCS#12</b> (.p12 ya .pfx, certificate <i>apni</i> private key ke saath, password se protected).</p>

<div class="warn"><p><b>Common galti.</b> VPN certificate import karne ke liye kamzor password wali PKCS#12 file email karna. Isme private key hoti hai, isliye jo bhi ise khole woh device ka roop dhar sakta hai. Keys device par generate karo aur sirf CSR bhejo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Sender apni <b>khud ki private key</b> se sign karta hai; receiver <b>sender ki public key</b> se verify karta hai. Kisi ke liye encrypt karna <b>unki public key</b> use karta hai. Questions "apni" aur "unki" ko ulatna pasand karte hain.</p></div>

<div class="scn"><h4>SSH warning jise sab click karke aage badh gaye</h4><p>RMA mein router replace hone ke baad har engineer ke SSH client ne warn kiya ki host key badal gayi hai. Team ko "bas accept kar lo" bola gaya tha. Security review mein pata chala ki ek jump host ne ek alag router ke liye bhi badli key accept ki thi, jahan koi hardware replace nahi hua tha. Investigation se pata chala ki ek misconfigured lab device duplicate IP address use kar raha tha. Is baar kuch malicious nahi tha, par bilkul yahi warning man-in-the-middle se aati.</p><p><b>Seekh:</b> badli hui signature key ek security event hai. Fingerprints out of band verify karo, ya certificate-based SSH host keys use karo.</p></div>

<div class="iv"><p class="q">"Digital signature non-repudiation kaise deta hai, aur HMAC kyun nahi deta?"</p><p>Strong answer: signature aisi private key se banta hai jo sirf signer ke paas hai, aur koi bhi use public key se verify kar sakta hai, isliye signer banane se mukar nahi sakta. HMAC mein dono parties same key share karti hain, isliye dono mein se koi bhi tag bana sakta tha. Phir flow explain karo: hash, private key se hash sign, verifier hash karke public key se check karta hai, aur certificate us public key ko identity se baandhta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Apni private key se hash sign karo; doosre aapki public key se verify karte hain.</li>
<li>Signatures integrity, authentication aur non-repudiation dete hain; HMAC non-repudiation nahi de sakta.</li>
<li>RSA, ECDSA aur EdDSA common signature algorithms hain; IKEv2 rsa-sig aur ecdsa-sig use karta hai.</li>
<li>Certificate naam (SAN) aur public key ka CA-signed bandhan hai, validity aur usage limits ke saath.</li>
<li>PKCS#12 mein private key hoti hai; CSR mein nahi.</li>
</ul></div>
`}};export{e as default};