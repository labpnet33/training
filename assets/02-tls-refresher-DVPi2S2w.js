var e={id:`tls-refresher`,h:{en:`TLS for firewall engineers: what is visible and what is not`,hi:`Firewall engineers ke liye TLS: kya dikhta hai aur kya nahi`},body:{en:`

<p><b>You cannot decrypt what you do not understand.</b> This chapter is a short TLS refresher aimed at what a firewall needs: the handshake, the certificate chain, the cipher and key exchange, and which parts are visible on the wire. The deeper maths is in sec-crypto.</p>

<h3>Analogy: ordering from a shop that proves its identity</h3>
<p>Before you hand over your card, you check that the shop is who it says it is (a certificate signed by an authority you trust) and you agree on a secret way to talk (a session key). After that, everything you say is in a private code. A firewall in the middle must therefore play two roles: a "shop" for your client, and a "customer" for the real shop.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="TLS handshake"><rect x="60" y="10" width="520" height="44" rx="9" fill="#bae6fd"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">1. ClientHello</text><text x="320" y="45" text-anchor="middle" class="svg-muted" font-size="11">versions, ciphers, server name (SNI) in clear text</text><line x1="320" y1="54" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><rect x="60" y="70" width="520" height="44" rx="9" fill="#bbf7d0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">2. ServerHello and certificate</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="11">chosen cipher; the server proves its identity</text><line x1="320" y1="114" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><rect x="60" y="130" width="520" height="44" rx="9" fill="#ddd6fe"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">3. Key exchange</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="11">client and server derive the same secret key</text><line x1="320" y1="174" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><rect x="60" y="190" width="520" height="44" rx="9" fill="#fde68a"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">4. Finished, then application data</text><text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="11">everything after this is encrypted</text></svg><p class="cap">A simplified TLS handshake (TLS 1.2 order; TLS 1.3 is shorter and encrypts more).</p></div>

<h3>The handshake in plain words</h3>
<ol>
<li>The client sends a <b>ClientHello</b> with the TLS versions and cipher suites it supports and the name of the site it wants, the <b>Server Name Indication (SNI)</b>, in clear text.</li>
<li>The server answers with the chosen version and cipher and sends its <b>certificate</b>.</li>
<li>The client checks the certificate: is it signed by a CA I trust, is the name right, is it within its dates, is it revoked?</li>
<li>They perform a <b>key exchange</b> (usually ephemeral Diffie-Hellman) and both calculate the same session keys. The keys are never sent.</li>
<li>Both sides send Finished messages, and the encrypted application data starts.</li>
</ol>

<h3>The certificate chain</h3>
<p>A server certificate is signed by an <b>intermediate CA</b>, which is signed by a <b>root CA</b>. Clients carry a list of trusted roots. If the chain ends in a root on the list, the certificate is trusted. This is the same trust list the firewall uses when it checks real servers, and the same list your devices use when they check the firewall's forged certificates (next chapters).</p>
<table class="cmp"><tr><th>Item</th><th>Role</th></tr>
<tr><td>Subject / SAN</td><td>The names the certificate is valid for</td></tr>
<tr><td>Issuer</td><td>Who signed it</td></tr>
<tr><td>Validity dates</td><td>Not before / not after</td></tr>
<tr><td>Public key</td><td>Used for the handshake</td></tr>
<tr><td>Key usage and CA flag</td><td>Whether it may sign other certificates</td></tr>
</table>

<h3>Forward secrecy and why a passive tap cannot decrypt</h3>
<p>Modern cipher suites use <b>ephemeral</b> key exchange (ECDHE or DHE), which gives <b>perfect forward secrecy</b>: even if someone steals the server's private key later, past sessions cannot be decrypted, because the session keys were never derived from it. This also means a device that merely copies packets cannot decrypt them. To see inside, the firewall must <b>sit in the path and take part</b> in the handshake. That is why decryption is a proxy and not a sniffer.</p>

<h3>TLS versions</h3>
<ul>
<li><b>TLS 1.2</b> is common. The certificate and handshake details travel in clear text.</li>
<li><b>TLS 1.3</b> is faster and encrypts most of the handshake, including the server certificate. The SNI is still visible unless the client uses Encrypted Client Hello, which hides it where supported.</li>
<li>Old versions (SSL 3.0, TLS 1.0 and 1.1) are weak and should be blocked. PAN-OS 10.x and later can decrypt TLS 1.3; check the release notes for exact cipher support.</li>
</ul>

<h3>What the firewall sees</h3>
<table class="cmp"><tr><th>Information</th><th>Without decryption</th><th>With decryption</th></tr>
<tr><td>IP addresses and ports</td><td>Visible</td><td>Visible</td></tr>
<tr><td>SNI (server name)</td><td>Visible in TLS 1.2 and 1.3 unless hidden by ECH</td><td>Visible</td></tr>
<tr><td>Server certificate details</td><td>Visible in TLS 1.2; encrypted in TLS 1.3</td><td>Visible</td></tr>
<tr><td>Application</td><td>ssl</td><td>Inner application, for example web-browsing</td></tr>
<tr><td>URL path and content</td><td>Hidden</td><td>Visible for inspection</td></tr>
<tr><td>Files and threats</td><td>Hidden</td><td>Scanned by security profiles</td></tr>
</table>
<p>Even without decryption, useful policy is possible from metadata: you can block a site by SNI or category, or reject expired certificates. Decryption adds the content.</p>

<div class="eg"><p><b>Worked example.</b> A user opens a shopping site. The ClientHello shows the name shop.example in clear text, so the firewall can classify the URL category without decrypting. The firewall does not decrypt this site because the company policy excludes shopping payment pages. A different site, an unknown file-sharing host, is decrypted, and a hidden executable download is detected.</p></div>

<h3>Where things go wrong</h3>
<ul>
<li><b>Certificate errors</b> happen when the client does not trust the issuer, the name does not match, or the certificate expired.</li>
<li><b>Mutual TLS</b> (client certificates) cannot be proxied: the client's private key stays on the client, so the firewall cannot authenticate to the server as the client.</li>
<li><b>Certificate pinning</b> makes an application accept only one specific certificate or key, so the firewall's substitute certificate fails. These applications must be excluded from decryption (chapter 7).</li>
<li><b>Unsupported ciphers</b> or versions can fail when the proxy cannot negotiate them.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Assuming "we have the server private key, so we can decrypt anything". With forward secrecy that is false for sniffed traffic. Only a proxy in the path can decrypt, and inbound inspection works because the firewall is the device that terminates the session.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know: SNI is visible in the ClientHello; PFS prevents passive decryption; TLS 1.3 encrypts the server certificate; mutual TLS and pinning break proxy decryption.</p></div>

<div class="scn"><h4>The expired certificate nobody noticed</h4><p>A partner portal started giving "connection reset" after a forward proxy pilot. The decryption profile blocked sessions to servers with expired certificates, and the partner server certificate had expired three days earlier. Before decryption the browser would have shown a warning that users clicked through. The partner renewed the certificate, and the problem ended.</p><p><b>Lesson:</b> Decryption exposes certificate problems that users used to ignore. That is a security gain, but it needs a process.</p></div>

<div class="iv"><p class="q">"Why can a firewall not simply decrypt TLS with a copy of the server private key?"</p><p>Because modern TLS uses ephemeral key exchange with perfect forward secrecy, the session keys are not derived from the server key, so a passive copy cannot decrypt. The firewall must be inline and take part in the handshake as a proxy, creating one TLS session with the client and another with the server. For inbound inspection the firewall terminates the session using the server key.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Handshake: ClientHello with SNI, certificate, key exchange, then encrypted data.</li>
<li>Certificate chain: server, intermediate, root; trust comes from the root list.</li>
<li>PFS means decryption needs an inline proxy, not a sniffer.</li>
<li>TLS 1.3 encrypts the server certificate; SNI is visible unless ECH is used.</li>
<li>Mutual TLS and certificate pinning break proxy decryption.</li>
</ul></div>

`,hi:`

<p><b>Jo samajhte nahi use decrypt nahi kar sakte.</b> Yeh chapter firewall ki zaroorat ke hisaab se chhota TLS refresher hai: handshake, certificate chain, cipher aur key exchange, aur kaunse hisse wire par dikhte hain. Gehri maths sec-crypto mein hai.</p>

<h3>Analogy: aisi dukaan se order karna jo apni pehchaan saabit kare</h3>
<p>Card dene se pehle aap check karte ho ki dukaan wahi hai jo kehti hai (aisi authority ka sign kiya certificate jis par aapko bharosa hai) aur aap baat karne ka secret tareeka tay karte ho (session key). Uske baad jo bhi kehte ho woh private code mein hota hai. Beech mein baitha firewall isliye do roles nibhata hai: aapke client ke liye "dukaan", aur asli dukaan ke liye "customer".</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="TLS handshake"><rect x="60" y="10" width="520" height="44" rx="9" fill="#bae6fd"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">1. ClientHello</text><text x="320" y="45" text-anchor="middle" class="svg-muted" font-size="11">versions, ciphers, server name (SNI) clear text mein</text><line x1="320" y1="54" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><rect x="60" y="70" width="520" height="44" rx="9" fill="#bbf7d0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">2. ServerHello aur certificate</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="11">chuna gaya cipher; server apni pehchaan saabit karta hai</text><line x1="320" y1="114" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><rect x="60" y="130" width="520" height="44" rx="9" fill="#ddd6fe"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">3. Key exchange</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="11">client aur server ek hi secret key nikalte hain</text><line x1="320" y1="174" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><rect x="60" y="190" width="520" height="44" rx="9" fill="#fde68a"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">4. Finished, phir application data</text><text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="11">iske baad sab kuch encrypted</text></svg><p class="cap">Simplified TLS handshake (TLS 1.2 order; TLS 1.3 chhota hai aur zyada encrypt karta hai).</p></div>

<h3>Handshake saaf shabdon mein</h3>
<ol>
<li>Client <b>ClientHello</b> bhejta hai jisme uske supported TLS versions aur cipher suites hote hain aur jis site ko chahta hai uska naam, <b>Server Name Indication (SNI)</b>, clear text mein.</li>
<li>Server chuna hua version aur cipher batata hai aur apna <b>certificate</b> bhejta hai.</li>
<li>Client certificate check karta hai: kya yeh aisi CA ne sign kiya jis par mujhe bharosa hai, naam sahi hai, dates ke andar hai, revoked to nahi?</li>
<li>Dono <b>key exchange</b> karte hain (aam taur par ephemeral Diffie-Hellman) aur dono ek hi session keys calculate karte hain. Keys kabhi bheji nahi jaati.</li>
<li>Dono Finished messages bhejte hain, aur encrypted application data shuru hota hai.</li>
</ol>

<h3>Certificate chain</h3>
<p>Server certificate <b>intermediate CA</b> ne sign kiya hota hai, jo <b>root CA</b> ne sign kiya hota hai. Clients ke paas trusted roots ki list hoti hai. Chain list ke kisi root par khatam ho to certificate trusted hai. Yahi trust list firewall asli servers check karte waqt use karta hai, aur aapke devices firewall ke forged certificates check karte waqt (agle chapters).</p>
<table class="cmp"><tr><th>Item</th><th>Role</th></tr>
<tr><td>Subject / SAN</td><td>Woh naam jinke liye certificate valid hai</td></tr>
<tr><td>Issuer</td><td>Kisne sign kiya</td></tr>
<tr><td>Validity dates</td><td>Not before / not after</td></tr>
<tr><td>Public key</td><td>Handshake mein use hoti hai</td></tr>
<tr><td>Key usage aur CA flag</td><td>Doosre certificates sign kar sakta hai ya nahi</td></tr>
</table>

<h3>Forward secrecy aur passive tap decrypt kyun nahi kar sakta</h3>
<p>Modern cipher suites <b>ephemeral</b> key exchange (ECDHE ya DHE) use karte hain, jo <b>perfect forward secrecy</b> deta hai: baad mein koi server ki private key chura le tab bhi purane sessions decrypt nahi ho sakte, kyunki session keys us se bani hi nahi thi. Iska matlab yeh bhi hai ki sirf packets ki copy lene waala device unhe decrypt nahi kar sakta. Andar dekhne ke liye firewall ko <b>path mein baithkar handshake mein hissa lena</b> padta hai. Isi liye decryption proxy hai, sniffer nahi.</p>

<h3>TLS versions</h3>
<ul>
<li><b>TLS 1.2</b> common hai. Certificate aur handshake details clear text mein jaate hain.</li>
<li><b>TLS 1.3</b> tez hai aur handshake ka zyadatar hissa, server certificate samet, encrypt karta hai. SNI phir bhi dikhta hai jab tak client Encrypted Client Hello use na kare, jo jahan supported hai use chhupa deta hai.</li>
<li>Purane versions (SSL 3.0, TLS 1.0 aur 1.1) kamzor hain aur block hone chahiye. PAN-OS 10.x aur baad ke TLS 1.3 decrypt kar sakte hain; exact cipher support ke liye release notes dekho.</li>
</ul>

<h3>Firewall kya dekhta hai</h3>
<table class="cmp"><tr><th>Information</th><th>Decryption ke bina</th><th>Decryption ke saath</th></tr>
<tr><td>IP addresses aur ports</td><td>Dikhta hai</td><td>Dikhta hai</td></tr>
<tr><td>SNI (server name)</td><td>TLS 1.2 aur 1.3 mein dikhta hai jab tak ECH na chhupaye</td><td>Dikhta hai</td></tr>
<tr><td>Server certificate details</td><td>TLS 1.2 mein dikhte hain; TLS 1.3 mein encrypted</td><td>Dikhte hain</td></tr>
<tr><td>Application</td><td>ssl</td><td>Andar ki application, jaise web-browsing</td></tr>
<tr><td>URL path aur content</td><td>Chhupa</td><td>Inspection ke liye dikhta hai</td></tr>
<tr><td>Files aur threats</td><td>Chhupe</td><td>Security profiles scan karte hain</td></tr>
</table>
<p>Decryption ke bina bhi metadata se kaam ki policy ho sakti hai: SNI ya category se site block kar sakte ho, ya expired certificates reject kar sakte ho. Decryption content jodti hai.</p>

<div class="eg"><p><b>Worked example.</b> User shopping site kholta hai. ClientHello mein naam shop.example clear text mein dikhta hai, isliye firewall decrypt kiye bina URL category classify kar sakta hai. Company policy shopping payment pages exclude karti hai, isliye firewall is site ko decrypt nahi karta. Doosri site, ek unknown file-sharing host, decrypt hoti hai, aur chhupa executable download pakda jaata hai.</p></div>

<h3>Cheezein kahan galat hoti hain</h3>
<ul>
<li><b>Certificate errors</b> tab hote hain jab client issuer par trust nahi karta, naam match nahi karta, ya certificate expire ho gaya.</li>
<li><b>Mutual TLS</b> (client certificates) proxy nahi ho sakta: client ki private key client par rehti hai, isliye firewall server ke saath client ki tarah authenticate nahi kar sakta.</li>
<li><b>Certificate pinning</b> application ko sirf ek specific certificate ya key accept karwata hai, isliye firewall ka substitute certificate fail hota hai. Aisi applications ko decryption se exclude karna padta hai (chapter 7).</li>
<li><b>Unsupported ciphers</b> ya versions fail ho sakte hain jab proxy unhe negotiate nahi kar paata.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Yeh maan lena "hamare paas server private key hai, isliye kuch bhi decrypt kar sakte hain". Forward secrecy ke saath sniffed traffic ke liye yeh galat hai. Sirf path mein baitha proxy decrypt kar sakta hai, aur inbound inspection isliye chalta hai kyunki firewall woh device hai jo session terminate karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Yaad rakho: SNI ClientHello mein dikhta hai; PFS passive decryption rokta hai; TLS 1.3 server certificate encrypt karta hai; mutual TLS aur pinning proxy decryption todte hain.</p></div>

<div class="scn"><h4>Expired certificate jo kisi ne notice nahi kiya</h4><p>Forward proxy pilot ke baad partner portal "connection reset" dene laga. Decryption profile expired certificates waale servers ke sessions block karta tha, aur partner server ka certificate teen din pehle expire hua tha. Decryption se pehle browser warning dikhata jise users click karke nikal jaate. Partner ne certificate renew kiya, aur problem khatam.</p><p><b>Lesson:</b> Decryption woh certificate problems khol deti hai jo users pehle ignore karte the. Yeh security gain hai, lekin process chahiye.</p></div>

<div class="iv"><p class="q">"Firewall server private key ki copy se TLS decrypt kyun nahi kar sakta?"</p><p>Kyunki modern TLS ephemeral key exchange perfect forward secrecy ke saath use karta hai, session keys server key se nahi nikalti, isliye passive copy decrypt nahi kar sakti. Firewall ko inline hona padta hai aur proxy ke roop mein handshake mein hissa lena padta hai, client ke saath ek TLS session aur server ke saath doosra. Inbound inspection mein firewall server key se session terminate karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Handshake: SNI ke saath ClientHello, certificate, key exchange, phir encrypted data.</li>
<li>Certificate chain: server, intermediate, root; trust root list se aata hai.</li>
<li>PFS ka matlab decryption ko inline proxy chahiye, sniffer nahi.</li>
<li>TLS 1.3 server certificate encrypt karta hai; ECH na ho to SNI dikhta hai.</li>
<li>Mutual TLS aur certificate pinning proxy decryption todte hain.</li>
</ul></div>

`}};export{e as default};