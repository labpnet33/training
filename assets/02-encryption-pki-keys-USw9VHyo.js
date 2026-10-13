var e={id:`crypto`,h:{en:`Encryption, PKI and key management`,hi:`Encryption, PKI aur key management`},body:{en:`
<p>Imagine sending a school certificate by courier. You put it in a sealed envelope so nobody can read it on the way (encryption in transit). At home you keep the original in a locked cupboard (encryption at rest). The receiver trusts the certificate because the board's seal is on it, and everyone knows what that seal looks like (a digital certificate signed by a trusted authority). And whoever holds the cupboard key controls everything, so you guard that key carefully (key management). That is the whole of this chapter in one story.</p>

<h3>Encryption in transit and at rest</h3>
<p><b>Encryption</b> turns readable data (plaintext) into unreadable data (ciphertext) using an algorithm and a key. Only someone with the right key can reverse it.</p>
<ul>
<li><b>In transit</b> protects data moving across a network: SSH for device management, TLS for HTTPS, SFTP and LDAPS, IPsec for VPN tunnels, WPA3 on Wi-Fi, SNMPv3 with privacy for monitoring.</li>
<li><b>At rest</b> protects stored data: full-disk encryption on laptops, encrypted databases and backups, encrypted configuration archives. If a laptop or backup tape is stolen, the thief gets ciphertext.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Encryption in transit and at rest">
<rect x="10" y="50" width="130" height="60" rx="10" fill="#bae6fd"/><text x="75" y="85" text-anchor="middle" class="svg-ink" font-size="13">Admin laptop</text>
<rect x="250" y="50" width="140" height="60" rx="10" fill="#e2e8f0"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="13">Network</text>
<rect x="500" y="50" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="565" y="85" text-anchor="middle" class="svg-ink" font-size="13">Server + disk</text>
<line x1="140" y1="80" x2="250" y2="80" stroke="#64748b" stroke-width="2"/><line x1="390" y1="80" x2="500" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="35" text-anchor="middle" class="svg-accent" font-size="13">In transit: SSH, TLS, IPsec</text>
<text x="565" y="140" text-anchor="middle" class="svg-accent" font-size="13">At rest: disk, DB, backups</text>
<text x="75" y="140" text-anchor="middle" class="svg-accent" font-size="13">At rest: full-disk</text>
</svg><p class="cap">Protect the data while it moves and while it sits.</p></div>

<h3>Symmetric, asymmetric and hashing</h3>
<table class="cmp"><tr><th>Type</th><th>Keys</th><th>Speed</th><th>Examples and use</th></tr>
<tr><td><b>Symmetric</b></td><td>One shared secret key encrypts and decrypts</td><td>Fast</td><td>AES; bulk data in TLS, IPsec, disk encryption</td></tr>
<tr><td><b>Asymmetric</b></td><td>Key pair: public key (shared) and private key (secret)</td><td>Slow</td><td>RSA, ECC; key exchange, digital signatures, certificates</td></tr>
<tr><td><b>Hashing</b></td><td>No key; one-way fingerprint</td><td>Fast</td><td>SHA-256; integrity checks, password storage</td></tr>
</table>
<p>Real protocols combine them. When you open an HTTPS site, asymmetric cryptography proves the server's identity and agrees a fresh symmetric <b>session key</b>; AES then encrypts the actual data quickly. SSH to a router works the same way: the router's RSA key pair proves who it is, and a symmetric cipher protects the session.</p>

<h3>PKI: how strangers trust each other</h3>
<p>A public key alone does not prove identity; anybody can generate a key pair and claim to be your bank. <b>Public key infrastructure (PKI)</b> solves this with <b>certificates</b>. A certificate binds a name (such as vpn.corp.example) to a public key, and it is digitally signed by a <b>certificate authority (CA)</b>. Your device already trusts a set of root CAs. If the certificate chain leads back to one of them, is within its validity dates, matches the name you typed and has not been revoked, your device trusts it.</p>
<ul>
<li><b>CSR (certificate signing request)</b>: the server creates a key pair and sends the public part plus its name to the CA.</li>
<li><b>Self-signed certificate</b>: signed by its own key, not a CA. Fine for a lab or internal device, but browsers warn because nothing vouches for it.</li>
<li><b>Revocation</b>: a compromised certificate is listed on a <b>CRL</b> or reported through <b>OCSP</b> so clients stop trusting it before it expires.</li>
</ul>

<h3>Key management</h3>
<p>Encryption is only as strong as the protection of the keys. N10-009 lists <b>key management</b> as a defence technique, and it covers the full life cycle: <b>generate</b> keys of adequate length (RSA 2048 or more), <b>store</b> private keys safely (a hardware security module or TPM, never in an email), <b>distribute</b> public keys and certificates, <b>rotate</b> keys and renew certificates on a schedule, <b>revoke</b> keys that leak, and <b>destroy</b> old keys. Some organisations also use <b>key escrow</b>, where a trusted party holds a copy for recovery.</p>

<div class="eg"><p><b>Worked example: the key in Lab 1.</b> SSH on the router EDGE needs an RSA key pair. The key is named after the hostname and domain, which is why the lab sets both first.</p>
<pre class="code">Router(config)# hostname EDGE
EDGE(config)# ip domain name nwk.lab
EDGE(config)# crypto key generate rsa modulus 2048</pre>
<pre class="out">The name for the keys will be: EDGE.nwk.lab

% The key modulus size is 2048 bits
% Generating 2048 bit RSA keys, keys will be non-exportable...
[OK] (elapsed time was 2 seconds)
<span class="hl">%SSH-5-ENABLED: SSH 1.99 has been enabled</span></pre>
<p>The private key never leaves the router (non-exportable). A 1024-bit key would still enable SSH, but 2048 is the minimum modern policy asks for.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Calling hashing "encryption" (a hash cannot be reversed to get the data back). Emailing private keys or storing them in a shared folder. Forgetting certificate expiry dates, so a VPN or web portal breaks on a Monday morning. Leaving 1024-bit or older keys in place after an audit.</p></div>

<div class="exam"><p><b>Exam trap.</b> Symmetric = one shared key, fast, used for bulk data. Asymmetric = public/private pair, slower, used for key exchange and signatures. Data "on a stolen laptop" is at rest; data "crossing the WAN" is in transit. A browser warning about a certificate not trusted usually means self-signed or an unknown CA.</p></div>

<div class="scn"><h4>The Monday VPN outage</h4><p>On a Monday morning every remote employee got a certificate error on the company's VPN portal. The engineer checked the certificate and found it had expired on Sunday at midnight. Nobody owned the renewal date. The fix was a new CSR, a signed certificate from the CA and a reload of the portal service. Afterwards the team added certificate expiry to the monitoring system with a 30-day warning and documented who owns each key.</p><p><b>Lesson:</b> key management is a process, not a one-time command. Rotation and renewal dates must have an owner.</p></div>

<div class="iv"><p class="q">"How does a browser decide to trust a website's certificate?"</p><p>Explain the chain: the server presents its certificate and intermediates; the browser checks each signature up to a root CA in its trust store, checks the validity dates, checks that the name matches the URL host, and checks revocation (CRL or OCSP). Then mention that asymmetric crypto sets up a symmetric session key for speed. Bonus: mention that a self-signed certificate fails the chain check, which is why it warns.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Encrypt in transit (SSH, TLS, IPsec, SNMPv3) and at rest (disk, database, backups).</li>
<li>Symmetric is fast for bulk data; asymmetric proves identity and exchanges keys; hashing proves integrity.</li>
<li>PKI uses CA-signed certificates to bind names to public keys; CRL and OCSP handle revocation.</li>
<li>Key management = generate, store, distribute, rotate, revoke, destroy, with clear ownership.</li>
<li>SSH on a router needs a hostname, a domain name and an RSA key pair (2048 bits recommended).</li>
</ul></div>
`,hi:`
<p>Socho aap courier se ek school certificate bhej rahe ho. Aap use sealed envelope mein daalte ho taaki raaste mein koi padh na sake (encryption in transit). Ghar par original ek locked almari mein rakhte ho (encryption at rest). Receiver certificate par bharosa karta hai kyunki us par board ki seal hai, aur sabko pata hai woh seal kaisi dikhti hai (trusted authority se signed digital certificate). Aur jiske paas almari ki chaabi hai woh sab control karta hai, isliye aap us chaabi ki dhyaan se hifaazat karte ho (key management). Yeh poora chapter isi ek kahani mein hai.</p>

<h3>Encryption in transit aur at rest</h3>
<p><b>Encryption</b> readable data (plaintext) ko ek algorithm aur key ki madad se unreadable data (ciphertext) mein badalta hai. Sirf sahi key wala hi ise wapas palat sakta hai.</p>
<ul>
<li><b>In transit</b> network par chal rahe data ko bachata hai: device management ke liye SSH, HTTPS, SFTP aur LDAPS ke liye TLS, VPN tunnels ke liye IPsec, Wi-Fi par WPA3, monitoring ke liye privacy wala SNMPv3.</li>
<li><b>At rest</b> stored data ko bachata hai: laptops par full-disk encryption, encrypted databases aur backups, encrypted configuration archives. Agar laptop ya backup tape chori ho jaaye, to chor ke haath sirf ciphertext aata hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Encryption in transit aur at rest">
<rect x="10" y="50" width="130" height="60" rx="10" fill="#bae6fd"/><text x="75" y="85" text-anchor="middle" class="svg-ink" font-size="13">Admin laptop</text>
<rect x="250" y="50" width="140" height="60" rx="10" fill="#e2e8f0"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="13">Network</text>
<rect x="500" y="50" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="565" y="85" text-anchor="middle" class="svg-ink" font-size="13">Server + disk</text>
<line x1="140" y1="80" x2="250" y2="80" stroke="#64748b" stroke-width="2"/><line x1="390" y1="80" x2="500" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="35" text-anchor="middle" class="svg-accent" font-size="13">In transit: SSH, TLS, IPsec</text>
<text x="565" y="140" text-anchor="middle" class="svg-accent" font-size="13">At rest: disk, DB, backups</text>
<text x="75" y="140" text-anchor="middle" class="svg-accent" font-size="13">At rest: full-disk</text>
</svg><p class="cap">Data ko chalte waqt bhi bachao aur rakhe hue bhi.</p></div>

<h3>Symmetric, asymmetric aur hashing</h3>
<table class="cmp"><tr><th>Type</th><th>Keys</th><th>Speed</th><th>Examples aur use</th></tr>
<tr><td><b>Symmetric</b></td><td>Ek shared secret key encrypt aur decrypt dono karti hai</td><td>Fast</td><td>AES; TLS, IPsec, disk encryption mein bulk data</td></tr>
<tr><td><b>Asymmetric</b></td><td>Key pair: public key (share hoti hai) aur private key (secret)</td><td>Slow</td><td>RSA, ECC; key exchange, digital signatures, certificates</td></tr>
<tr><td><b>Hashing</b></td><td>Koi key nahi; one-way fingerprint</td><td>Fast</td><td>SHA-256; integrity checks, password storage</td></tr>
</table>
<p>Real protocols inhe milakar use karte hain. Jab aap HTTPS site kholte ho, asymmetric cryptography server ki identity prove karti hai aur ek naya symmetric <b>session key</b> tay karti hai; phir AES asli data ko tezi se encrypt karta hai. Router par SSH bhi aise hi kaam karta hai: router ka RSA key pair prove karta hai ki woh kaun hai, aur ek symmetric cipher session ko bachata hai.</p>

<h3>PKI: ajnabi ek dusre par bharosa kaise karte hain</h3>
<p>Sirf public key identity prove nahi karti; koi bhi key pair bana kar khud ko aapka bank bata sakta hai. <b>Public key infrastructure (PKI)</b> is problem ko <b>certificates</b> se solve karta hai. Certificate ek naam (jaise vpn.corp.example) ko ek public key se jodta hai, aur ise ek <b>certificate authority (CA)</b> digitally sign karti hai. Aapka device pehle se kuch root CAs par bharosa karta hai. Agar certificate chain unmein se kisi tak wapas jaati hai, validity dates ke andar hai, aapke type kiye naam se match karti hai aur revoke nahi hui hai, to aapka device us par bharosa karta hai.</p>
<ul>
<li><b>CSR (certificate signing request)</b>: server ek key pair banata hai aur public hissa apne naam ke saath CA ko bhejta hai.</li>
<li><b>Self-signed certificate</b>: CA nahi, apni hi key se signed. Lab ya internal device ke liye theek hai, lekin browsers warning dete hain kyunki koi uski guarantee nahi deta.</li>
<li><b>Revocation</b>: compromise hua certificate <b>CRL</b> par list hota hai ya <b>OCSP</b> se report hota hai taaki clients expiry se pehle hi us par bharosa band kar dein.</li>
</ul>

<h3>Key management</h3>
<p>Encryption utna hi strong hai jitni keys ki hifaazat. N10-009 <b>key management</b> ko ek defence technique ki tarah list karta hai, aur yeh poora life cycle cover karta hai: sahi length ki keys <b>generate</b> karo (RSA 2048 ya zyada), private keys safe <b>store</b> karo (hardware security module ya TPM, email mein kabhi nahi), public keys aur certificates <b>distribute</b> karo, schedule par keys <b>rotate</b> karo aur certificates renew karo, leak hui keys <b>revoke</b> karo, aur purani keys <b>destroy</b> karo. Kuch organisations <b>key escrow</b> bhi use karti hain, jismein ek trusted party recovery ke liye copy rakhti hai.</p>

<div class="eg"><p><b>Worked example: Lab 1 ki key.</b> Router EDGE par SSH ko ek RSA key pair chahiye. Key ka naam hostname aur domain se banta hai, isiliye lab pehle dono set karwata hai.</p>
<pre class="code">Router(config)# hostname EDGE
EDGE(config)# ip domain name nwk.lab
EDGE(config)# crypto key generate rsa modulus 2048</pre>
<pre class="out">The name for the keys will be: EDGE.nwk.lab

% The key modulus size is 2048 bits
% Generating 2048 bit RSA keys, keys will be non-exportable...
[OK] (elapsed time was 2 seconds)
<span class="hl">%SSH-5-ENABLED: SSH 1.99 has been enabled</span></pre>
<p>Private key kabhi router se bahar nahi jaati (non-exportable). 1024-bit key se bhi SSH enable ho jaayega, lekin modern policy kam se kam 2048 maangti hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Hashing ko "encryption" kehna (hash ko palat kar data wapas nahi milta). Private keys email karna ya shared folder mein rakhna. Certificate expiry dates bhool jaana, jisse VPN ya web portal Monday subah toot jaata hai. Audit ke baad bhi 1024-bit ya purani keys chhod dena.</p></div>

<div class="exam"><p><b>Exam trap.</b> Symmetric = ek shared key, fast, bulk data ke liye. Asymmetric = public/private pair, slower, key exchange aur signatures ke liye. "Chori hue laptop par" data at rest hai; "WAN cross kar raha" data in transit hai. Certificate not trusted wali browser warning ka matlab aam taur par self-signed ya unknown CA hota hai.</p></div>

<div class="scn"><h4>Monday ka VPN outage</h4><p>Ek Monday subah har remote employee ko company ke VPN portal par certificate error mila. Engineer ne certificate check kiya aur paaya ki woh Sunday aadhi raat expire ho gaya tha. Renewal date ka koi owner nahi tha. Fix tha ek naya CSR, CA se signed certificate aur portal service ka reload. Uske baad team ne monitoring system mein 30 din pehle warning ke saath certificate expiry jodi aur document kiya ki har key ka owner kaun hai.</p><p><b>Seekh:</b> key management ek process hai, ek baar ka command nahi. Rotation aur renewal dates ka owner hona chahiye.</p></div>

<div class="iv"><p class="q">"Browser kaise tay karta hai ki website ke certificate par bharosa kare?"</p><p>Chain samjhao: server apna certificate aur intermediates dikhata hai; browser har signature ko trust store ke root CA tak check karta hai, validity dates check karta hai, check karta hai ki naam URL host se match karta hai, aur revocation (CRL ya OCSP) check karta hai. Phir batao ki speed ke liye asymmetric crypto ek symmetric session key set up karti hai. Bonus: batao ki self-signed certificate chain check mein fail hota hai, isiliye warning aati hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>In transit (SSH, TLS, IPsec, SNMPv3) aur at rest (disk, database, backups) encrypt karo.</li>
<li>Symmetric bulk data ke liye fast hai; asymmetric identity prove karta hai aur keys exchange karta hai; hashing integrity prove karta hai.</li>
<li>PKI CA-signed certificates se naamon ko public keys se jodta hai; CRL aur OCSP revocation sambhalte hain.</li>
<li>Key management = generate, store, distribute, rotate, revoke, destroy, saaf ownership ke saath.</li>
<li>Router par SSH ko hostname, domain name aur RSA key pair chahiye (2048 bits recommended).</li>
</ul></div>
`}};export{e as default};