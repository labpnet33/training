var e={id:`tls-handshakes`,h:{en:`SSL/TLS: the TLS 1.2 and TLS 1.3 handshakes step by step`,hi:`SSL/TLS: TLS 1.2 aur TLS 1.3 handshakes step by step`},body:{en:`
<p>A TLS handshake is like two strangers meeting at a bank counter. The customer says which languages she speaks (cipher suites). The clerk picks one, shows an ID card issued by head office (certificate), and together they agree on a code word for the rest of the conversation (key exchange). Only then does business start (encrypted application data). TLS 1.3 is the same meeting with fewer steps and with the ID card shown privately.</p>

<h3>SSL vs TLS</h3>
<p><b>SSL</b> 2.0 and 3.0 are broken and disabled everywhere. <b>TLS</b> 1.0 and 1.1 are deprecated. Today you run <b>TLS 1.2</b> (RFC 5246) and <b>TLS 1.3</b> (RFC 8446). People still say "SSL VPN" and "SSL certificate" out of habit; the protocol underneath is TLS. <b>DTLS</b> is TLS adapted for UDP, used by Secure Client for its fast data channel.</p>

<h3>TLS 1.2 full handshake (ECDHE)</h3>
<ol>
<li><b>ClientHello</b>: highest version, client random, list of cipher suites, extensions such as <b>SNI</b> (the server name) and supported curves.</li>
<li><b>ServerHello</b>: chosen version and cipher suite, server random.</li>
<li><b>Certificate</b>: the server's chain, sent in clear text.</li>
<li><b>ServerKeyExchange</b>: the server's ephemeral ECDHE public value, <b>signed</b> with the certificate's private key, which proves the server owns the certificate.</li>
<li><b>ServerHelloDone</b>.</li>
<li><b>ClientKeyExchange</b>: the client's ECDHE public value. Both sides now compute the pre-master secret, then the master secret and session keys from both randoms.</li>
<li><b>ChangeCipherSpec + Finished</b> from the client, then from the server. Finished is a MAC over the whole handshake, so any tampering is detected.</li>
</ol>
<p>That is <b>two round trips</b> before application data. A TLS 1.2 cipher suite name lists every choice: <code>TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256</code> = ECDHE key exchange, RSA certificate signature, AES-128-GCM bulk cipher, SHA-256 for the PRF. Older suites like <code>TLS_RSA_WITH_AES_128_CBC_SHA</code> used <b>RSA key transport</b>: the client encrypted the secret with the server's public key, so there was <b>no forward secrecy</b>.</p>

<h3>TLS 1.3 handshake</h3>
<ol>
<li><b>ClientHello</b> already carries a <b>key_share</b> (the client's ECDHE value for its preferred group, for example X25519) and supported_versions.</li>
<li><b>ServerHello</b> carries the server's key_share. Both compute the handshake keys immediately; <b>everything after this is encrypted</b>.</li>
<li>Encrypted: <b>EncryptedExtensions</b>, <b>Certificate</b>, <b>CertificateVerify</b> (a signature over the handshake), <b>Finished</b>.</li>
<li>Client sends <b>Finished</b> and can send application data: <b>one round trip</b>.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="TLS 1.2 versus TLS 1.3 message flow">
<text x="160" y="18" text-anchor="middle" class="svg-ink" font-size="14">TLS 1.2: 2 RTT</text>
<text x="480" y="18" text-anchor="middle" class="svg-ink" font-size="14">TLS 1.3: 1 RTT</text>
<text x="40" y="36" class="svg-muted" font-size="12">Client</text><text x="250" y="36" class="svg-muted" font-size="12">Server</text>
<text x="360" y="36" class="svg-muted" font-size="12">Client</text><text x="570" y="36" class="svg-muted" font-size="12">Server</text>
<line x1="60" y1="42" x2="60" y2="290" stroke="#64748b"/><line x1="270" y1="42" x2="270" y2="290" stroke="#64748b"/>
<line x1="380" y1="42" x2="380" y2="290" stroke="#64748b"/><line x1="590" y1="42" x2="590" y2="290" stroke="#64748b"/>
<line x1="60" y1="60" x2="270" y2="75" stroke="#64748b"/><text x="165" y="60" text-anchor="middle" class="svg-ink" font-size="12">ClientHello</text>
<line x1="270" y1="95" x2="60" y2="125" stroke="#64748b"/><text x="165" y="100" text-anchor="middle" class="svg-ink" font-size="12">ServerHello, Certificate,</text><text x="165" y="114" text-anchor="middle" class="svg-ink" font-size="12">ServerKeyExchange, Done</text>
<line x1="60" y1="150" x2="270" y2="170" stroke="#64748b"/><text x="165" y="150" text-anchor="middle" class="svg-ink" font-size="12">ClientKeyExchange, CCS, Fin</text>
<line x1="270" y1="190" x2="60" y2="210" stroke="#64748b"/><text x="165" y="193" text-anchor="middle" class="svg-ink" font-size="12">CCS, Finished</text>
<rect x="70" y="230" width="190" height="28" rx="6" fill="#bbf7d0"/><text x="165" y="249" text-anchor="middle" class="svg-ink" font-size="12">application data</text>
<line x1="380" y1="60" x2="590" y2="75" stroke="#64748b"/><text x="485" y="58" text-anchor="middle" class="svg-ink" font-size="12">ClientHello + key_share</text>
<line x1="590" y1="95" x2="380" y2="125" stroke="#64748b"/><text x="485" y="97" text-anchor="middle" class="svg-ink" font-size="12">ServerHello + key_share</text>
<rect x="400" y="115" width="170" height="30" rx="6" fill="#ddd6fe"/><text x="485" y="134" text-anchor="middle" class="svg-ink" font-size="12">{Cert, CertVerify, Fin}</text>
<line x1="380" y1="160" x2="590" y2="175" stroke="#64748b"/><text x="485" y="160" text-anchor="middle" class="svg-ink" font-size="12">{Finished} + data</text>
<rect x="390" y="190" width="190" height="28" rx="6" fill="#bbf7d0"/><text x="485" y="209" text-anchor="middle" class="svg-ink" font-size="12">application data</text>
<text x="485" y="250" text-anchor="middle" class="svg-accent" font-size="12">{ } = encrypted; certificate hidden</text>
</svg><p class="cap">TLS 1.3 sends the key share in the first message, saving a round trip and encrypting the certificate.</p></div>

<h3>What TLS 1.3 removed and why it matters</h3>
<table class="cmp"><tr><th></th><th>TLS 1.2</th><th>TLS 1.3</th></tr>
<tr><td>Round trips</td><td>2 (1 with resumption)</td><td>1 (0-RTT resumption possible)</td></tr>
<tr><td>Key exchange</td><td>RSA transport, DHE or ECDHE</td><td>Only (EC)DHE, so forward secrecy always</td></tr>
<tr><td>Ciphers</td><td>Many, including CBC and RC4 in old configs</td><td>Only AEAD: AES-128-GCM, AES-256-GCM, ChaCha20-Poly1305</td></tr>
<tr><td>Cipher suite names</td><td>TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256</td><td>TLS_AES_128_GCM_SHA256 (key exchange and signature negotiated separately)</td></tr>
<tr><td>Certificate</td><td>Visible to middleboxes</td><td>Encrypted</td></tr>
<tr><td>Removed</td><td></td><td>compression, renegotiation, static RSA/DH, SHA-1, MD5</td></tr>
</table>
<p>For security teams, the encrypted certificate means a firewall can no longer read the server certificate from a passing TLS 1.3 session. It can still see the <b>SNI</b> in the ClientHello, unless Encrypted Client Hello (ECH) is used. Full visibility requires <b>TLS decryption</b> (preview of the NGFW decryption policies later in this track). <b>0-RTT</b> data can be replayed, so servers accept it only for safe, idempotent requests.</p>
<p><b>QUIC</b> (HTTP/3) runs TLS 1.3 inside UDP 443 and combines the transport and crypto handshakes into one round trip. Many firewalls cannot inspect QUIC, so a common policy blocks UDP 443 to force browsers back to TCP-based TLS that the firewall can decrypt.</p>

<div class="eg"><p><b>Worked example.</b> A user in Mumbai opens a portal in Singapore with a 60 ms round trip. TLS 1.2 over TCP: TCP handshake 1 RTT + TLS 2 RTT = 180 ms before the first request. TLS 1.3: 1 + 1 = 120 ms. QUIC with TLS 1.3: combined 1 RTT = 60 ms. For a remote-access VPN that reconnects often on mobile networks, these savings are noticeable.</p></div>

<h3>Configuring and verifying TLS on the ASA (Secure Client headend)</h3>
<pre class="code"><span class="c">! identity certificate for TLS on the outside interface</span>
ASA1(config)# ssl trust-point NK-CA outside
<span class="c">! refuse anything older than TLS 1.2 and allow only strong ciphers</span>
ASA1(config)# ssl server-version tlsv1.2
ASA1(config)# ssl cipher tlsv1.2 high</pre>
<pre class="out">$ openssl s_client -connect vpn.nk.example:443 -brief
CONNECTION ESTABLISHED
<span class="hl">Protocol version: TLSv1.3</span>
<span class="hl">Ciphersuite: TLS_AES_256_GCM_SHA384</span>
Peer certificate: CN = vpn.nk.example, O = Network Kings Lab
Hash used: SHA256
Signature type: RSA-PSS
<span class="hl">Verification: OK</span>
Server Temp Key: X25519, 253 bits</pre>

<div class="warn"><p><b>Common mistake.</b> Installing only the server certificate on the headend and not the intermediate CA. Browsers sometimes fetch the missing intermediate on their own, but VPN clients and IoT devices do not, so "it works in Chrome but Secure Client says untrusted". Always send the full chain.</p></div>

<div class="exam"><p><b>Exam trap.</b> TLS 1.3 has no RSA key exchange and no CBC suites. If an option says "TLS 1.3 uses RSA to encrypt the pre-master secret", it is wrong. Also, the TLS 1.3 suite name does not include the key exchange or signature algorithm.</p></div>

<div class="scn"><h4>The payment terminal that stopped connecting</h4><p>After the security team set <code>ssl server-version tlsv1.2</code> and removed CBC ciphers on a web portal, an old card-payment terminal could no longer connect. A packet capture showed its ClientHello offered only TLS 1.0 with CBC suites, so the server replied with a handshake_failure alert. The fix was not to weaken the server; the team isolated the terminal behind a dedicated proxy for 30 days while the vendor shipped a firmware update with TLS 1.2 and GCM.</p><p><b>Lesson:</b> read the ClientHello in a capture to see what a client offers. Fix old clients, do not downgrade servers.</p></div>

<div class="iv"><p class="q">"What are the main differences between the TLS 1.2 and TLS 1.3 handshakes?"</p><p>Strong answer: TLS 1.3 completes in one round trip because the client sends its key share in the ClientHello; everything after ServerHello, including the certificate, is encrypted; only ephemeral (EC)DHE is allowed, so forward secrecy is mandatory; only AEAD ciphers remain; RSA key transport, CBC, compression and renegotiation are gone; and 0-RTT resumption exists with replay caveats. Mention the impact on inspection: certificates are hidden, SNI is still visible without ECH.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSL is dead; run TLS 1.2 and 1.3. DTLS is TLS over UDP for Secure Client data.</li>
<li>TLS 1.2 ECDHE handshake: 2 RTT; the server signs its ECDHE value to prove it owns the certificate.</li>
<li>TLS 1.3: key share in ClientHello, 1 RTT, encrypted certificate, only (EC)DHE and AEAD.</li>
<li>RSA key transport has no forward secrecy and is removed in TLS 1.3.</li>
<li>Always install the full certificate chain on TLS headends.</li>
</ul></div>
`,hi:`
<p>TLS handshake bank counter par milne wale do ajnabiyon jaisa hai. Customer batati hai ki woh kaunsi bhashayein bolti hai (cipher suites). Clerk ek chunta hai, head office ka issue kiya ID card dikhata hai (certificate), aur dono baaki baatcheet ke liye ek code word par agree karte hain (key exchange). Tabhi kaam shuru hota hai (encrypted application data). TLS 1.3 wahi mulaqat hai, kam steps ke saath aur ID card private mein dikhaya jaata hai.</p>

<h3>SSL vs TLS</h3>
<p><b>SSL</b> 2.0 aur 3.0 broken hain aur har jagah disabled hain. <b>TLS</b> 1.0 aur 1.1 deprecated hain. Aaj aap <b>TLS 1.2</b> (RFC 5246) aur <b>TLS 1.3</b> (RFC 8446) chalate ho. Log aadat se ab bhi "SSL VPN" aur "SSL certificate" kehte hain; neeche protocol TLS hai. <b>DTLS</b> UDP ke liye adapt kiya TLS hai, jise Secure Client apne tez data channel ke liye use karta hai.</p>

<h3>TLS 1.2 full handshake (ECDHE)</h3>
<ol>
<li><b>ClientHello</b>: sabse oonchi version, client random, cipher suites ki list, <b>SNI</b> (server ka naam) aur supported curves jaise extensions.</li>
<li><b>ServerHello</b>: chuni hui version aur cipher suite, server random.</li>
<li><b>Certificate</b>: server ki chain, clear text mein bheji jaati hai.</li>
<li><b>ServerKeyExchange</b>: server ki ephemeral ECDHE public value, certificate ki private key se <b>signed</b>, jo saabit karta hai ki certificate server ka hai.</li>
<li><b>ServerHelloDone</b>.</li>
<li><b>ClientKeyExchange</b>: client ki ECDHE public value. Ab dono sides pre-master secret nikaalti hain, phir dono randoms se master secret aur session keys.</li>
<li>Client se <b>ChangeCipherSpec + Finished</b>, phir server se. Finished poore handshake par ek MAC hai, isliye koi bhi tampering pakdi jaati hai.</li>
</ol>
<p>Application data se pehle yeh <b>do round trips</b> hain. TLS 1.2 cipher suite ka naam har choice list karta hai: <code>TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256</code> = ECDHE key exchange, RSA certificate signature, AES-128-GCM bulk cipher, PRF ke liye SHA-256. <code>TLS_RSA_WITH_AES_128_CBC_SHA</code> jaise purane suites <b>RSA key transport</b> use karte the: client secret ko server ki public key se encrypt karta tha, isliye <b>koi forward secrecy nahi</b> thi.</p>

<h3>TLS 1.3 handshake</h3>
<ol>
<li><b>ClientHello</b> pehle se hi <b>key_share</b> (apne preferred group, jaise X25519, ke liye client ki ECDHE value) aur supported_versions le jaata hai.</li>
<li><b>ServerHello</b> server ka key_share le jaata hai. Dono turant handshake keys nikaal lete hain; <b>iske baad sab kuch encrypted hai</b>.</li>
<li>Encrypted: <b>EncryptedExtensions</b>, <b>Certificate</b>, <b>CertificateVerify</b> (handshake par signature), <b>Finished</b>.</li>
<li>Client <b>Finished</b> bhejta hai aur application data bhej sakta hai: <b>ek round trip</b>.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="TLS 1.2 vs TLS 1.3 message flow">
<text x="160" y="18" text-anchor="middle" class="svg-ink" font-size="14">TLS 1.2: 2 RTT</text>
<text x="480" y="18" text-anchor="middle" class="svg-ink" font-size="14">TLS 1.3: 1 RTT</text>
<text x="40" y="36" class="svg-muted" font-size="12">Client</text><text x="250" y="36" class="svg-muted" font-size="12">Server</text>
<text x="360" y="36" class="svg-muted" font-size="12">Client</text><text x="570" y="36" class="svg-muted" font-size="12">Server</text>
<line x1="60" y1="42" x2="60" y2="290" stroke="#64748b"/><line x1="270" y1="42" x2="270" y2="290" stroke="#64748b"/>
<line x1="380" y1="42" x2="380" y2="290" stroke="#64748b"/><line x1="590" y1="42" x2="590" y2="290" stroke="#64748b"/>
<line x1="60" y1="60" x2="270" y2="75" stroke="#64748b"/><text x="165" y="60" text-anchor="middle" class="svg-ink" font-size="12">ClientHello</text>
<line x1="270" y1="95" x2="60" y2="125" stroke="#64748b"/><text x="165" y="100" text-anchor="middle" class="svg-ink" font-size="12">ServerHello, Certificate,</text><text x="165" y="114" text-anchor="middle" class="svg-ink" font-size="12">ServerKeyExchange, Done</text>
<line x1="60" y1="150" x2="270" y2="170" stroke="#64748b"/><text x="165" y="150" text-anchor="middle" class="svg-ink" font-size="12">ClientKeyExchange, CCS, Fin</text>
<line x1="270" y1="190" x2="60" y2="210" stroke="#64748b"/><text x="165" y="193" text-anchor="middle" class="svg-ink" font-size="12">CCS, Finished</text>
<rect x="70" y="230" width="190" height="28" rx="6" fill="#bbf7d0"/><text x="165" y="249" text-anchor="middle" class="svg-ink" font-size="12">application data</text>
<line x1="380" y1="60" x2="590" y2="75" stroke="#64748b"/><text x="485" y="58" text-anchor="middle" class="svg-ink" font-size="12">ClientHello + key_share</text>
<line x1="590" y1="95" x2="380" y2="125" stroke="#64748b"/><text x="485" y="97" text-anchor="middle" class="svg-ink" font-size="12">ServerHello + key_share</text>
<rect x="400" y="115" width="170" height="30" rx="6" fill="#ddd6fe"/><text x="485" y="134" text-anchor="middle" class="svg-ink" font-size="12">{Cert, CertVerify, Fin}</text>
<line x1="380" y1="160" x2="590" y2="175" stroke="#64748b"/><text x="485" y="160" text-anchor="middle" class="svg-ink" font-size="12">{Finished} + data</text>
<rect x="390" y="190" width="190" height="28" rx="6" fill="#bbf7d0"/><text x="485" y="209" text-anchor="middle" class="svg-ink" font-size="12">application data</text>
<text x="485" y="250" text-anchor="middle" class="svg-accent" font-size="12">{ } = encrypted; certificate chhupa</text>
</svg><p class="cap">TLS 1.3 pehle message mein hi key share bhejta hai, ek round trip bachata hai aur certificate encrypt karta hai.</p></div>

<h3>TLS 1.3 ne kya hataya aur yeh kyun matter karta hai</h3>
<table class="cmp"><tr><th></th><th>TLS 1.2</th><th>TLS 1.3</th></tr>
<tr><td>Round trips</td><td>2 (resumption ke saath 1)</td><td>1 (0-RTT resumption possible)</td></tr>
<tr><td>Key exchange</td><td>RSA transport, DHE ya ECDHE</td><td>Sirf (EC)DHE, isliye forward secrecy hamesha</td></tr>
<tr><td>Ciphers</td><td>Bahut saare, purane configs mein CBC aur RC4 bhi</td><td>Sirf AEAD: AES-128-GCM, AES-256-GCM, ChaCha20-Poly1305</td></tr>
<tr><td>Cipher suite names</td><td>TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256</td><td>TLS_AES_128_GCM_SHA256 (key exchange aur signature alag negotiate hote hain)</td></tr>
<tr><td>Certificate</td><td>Middleboxes ko dikhta hai</td><td>Encrypted</td></tr>
<tr><td>Hataya gaya</td><td></td><td>compression, renegotiation, static RSA/DH, SHA-1, MD5</td></tr>
</table>
<p>Security teams ke liye encrypted certificate ka matlab hai ki firewall ab guzarte TLS 1.3 session se server certificate nahi padh sakta. Woh ClientHello mein <b>SNI</b> ab bhi dekh sakta hai, jab tak Encrypted Client Hello (ECH) use na ho. Poori visibility ke liye <b>TLS decryption</b> chahiye (is track mein aage NGFW decryption policies ka preview). <b>0-RTT</b> data replay ho sakta hai, isliye servers ise sirf safe, idempotent requests ke liye accept karte hain.</p>
<p><b>QUIC</b> (HTTP/3) UDP 443 ke andar TLS 1.3 chalata hai aur transport aur crypto handshakes ko ek round trip mein jod deta hai. Kai firewalls QUIC inspect nahi kar paate, isliye common policy UDP 443 block karti hai taaki browsers TCP-based TLS par wapas aayein jise firewall decrypt kar sake.</p>

<div class="eg"><p><b>Worked example.</b> Mumbai ka user 60 ms round trip ke saath Singapore ka portal kholta hai. TCP par TLS 1.2: TCP handshake 1 RTT + TLS 2 RTT = pehli request se pehle 180 ms. TLS 1.3: 1 + 1 = 120 ms. TLS 1.3 ke saath QUIC: combined 1 RTT = 60 ms. Mobile networks par baar baar reconnect hone wale remote-access VPN ke liye yeh bachat mehsoos hoti hai.</p></div>

<h3>ASA par TLS configure aur verify karna (Secure Client headend)</h3>
<pre class="code"><span class="c">! outside interface par TLS ke liye identity certificate</span>
ASA1(config)# ssl trust-point NK-CA outside
<span class="c">! TLS 1.2 se purana kuch bhi mana karo aur sirf strong ciphers allow karo</span>
ASA1(config)# ssl server-version tlsv1.2
ASA1(config)# ssl cipher tlsv1.2 high</pre>
<pre class="out">$ openssl s_client -connect vpn.nk.example:443 -brief
CONNECTION ESTABLISHED
<span class="hl">Protocol version: TLSv1.3</span>
<span class="hl">Ciphersuite: TLS_AES_256_GCM_SHA384</span>
Peer certificate: CN = vpn.nk.example, O = Network Kings Lab
Hash used: SHA256
Signature type: RSA-PSS
<span class="hl">Verification: OK</span>
Server Temp Key: X25519, 253 bits</pre>

<div class="warn"><p><b>Common galti.</b> Headend par sirf server certificate install karna aur intermediate CA nahi. Browsers kabhi kabhi missing intermediate khud le aate hain, par VPN clients aur IoT devices nahi, isliye "Chrome mein chalta hai par Secure Client untrusted bolta hai". Hamesha poori chain bhejo.</p></div>

<div class="exam"><p><b>Exam trap.</b> TLS 1.3 mein na RSA key exchange hai na CBC suites. Agar option kahe "TLS 1.3 pre-master secret encrypt karne ke liye RSA use karta hai", to woh galat hai. Aur TLS 1.3 suite name mein key exchange ya signature algorithm nahi hota.</p></div>

<div class="scn"><h4>Woh payment terminal jo connect hona band ho gaya</h4><p>Security team ne web portal par <code>ssl server-version tlsv1.2</code> set kiya aur CBC ciphers hataye, uske baad ek purana card-payment terminal connect nahi kar pa raha tha. Packet capture ne dikhaya ki uska ClientHello sirf CBC suites ke saath TLS 1.0 offer karta tha, isliye server ne handshake_failure alert bheja. Fix server ko kamzor karna nahi tha; team ne terminal ko 30 din ke liye ek dedicated proxy ke peeche isolate kiya jab tak vendor ne TLS 1.2 aur GCM wala firmware update nahi bheja.</p><p><b>Seekh:</b> client kya offer karta hai yeh dekhne ke liye capture mein ClientHello padho. Purane clients theek karo, servers downgrade mat karo.</p></div>

<div class="iv"><p class="q">"TLS 1.2 aur TLS 1.3 handshakes mein main differences kya hain?"</p><p>Strong answer: TLS 1.3 ek round trip mein poora hota hai kyunki client ClientHello mein apna key share bhejta hai; ServerHello ke baad sab kuch, certificate samet, encrypted hai; sirf ephemeral (EC)DHE allowed hai, isliye forward secrecy mandatory hai; sirf AEAD ciphers bache hain; RSA key transport, CBC, compression aur renegotiation hat gaye; aur replay caveats ke saath 0-RTT resumption hai. Inspection par asar mention karo: certificates chhupe hain, ECH ke bina SNI ab bhi dikhta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSL khatam hai; TLS 1.2 aur 1.3 chalao. DTLS Secure Client data ke liye UDP par TLS hai.</li>
<li>TLS 1.2 ECDHE handshake: 2 RTT; server certificate ka owner hone ke saboot mein apni ECDHE value sign karta hai.</li>
<li>TLS 1.3: ClientHello mein key share, 1 RTT, encrypted certificate, sirf (EC)DHE aur AEAD.</li>
<li>RSA key transport mein forward secrecy nahi hai aur TLS 1.3 mein hata diya gaya hai.</li>
<li>TLS headends par hamesha poori certificate chain install karo.</li>
</ul></div>
`}};export{e as default};