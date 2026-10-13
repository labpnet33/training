var e={id:`encryption-tls`,h:{en:`Encryption in storage and transport: TLS, certificates, hashing and salting`,hi:`Storage aur transport mein encryption: TLS, certificates, hashing aur salting`},body:{en:`
<p>Data lives in two states that need protection. <b>Data in transit</b> moves across a network (a browser to a web server, a script to a controller API). <b>Data at rest</b> sits on a disk, in a database, in a backup. Encryption protects both, and the exam also expects you to tell encryption apart from hashing and from encoding.</p>

<h3>Analogy: letters and lockboxes</h3>
<p>Sending a postcard is plain text: every postman can read it. Sending a letter in a sealed, tamper-evident envelope is <b>encryption in transit</b>. Locking the letter in a safe at home is <b>encryption at rest</b>. A wax seal that breaks if the letter is opened is a <b>hash or signature</b>: it does not hide the text, it proves nobody changed it.</p>

<h3>Encoding, encryption, hashing: three different things</h3>
<table class="cmp"><tr><th></th><th>Purpose</th><th>Reversible?</th><th>Needs a key?</th><th>Example</th></tr>
<tr><td><b>Encoding</b></td><td>Change format so systems can carry data</td><td>Yes, by anyone</td><td>No</td><td>Base64, URL encoding</td></tr>
<tr><td><b>Encryption</b></td><td>Keep data confidential</td><td>Yes, with the key</td><td>Yes</td><td>AES for files, TLS for traffic</td></tr>
<tr><td><b>Hashing</b></td><td>Fingerprint data, check integrity, store passwords</td><td>No, one-way</td><td>No (a salt is not a key)</td><td>SHA-256, bcrypt, Argon2</td></tr>
</table>
<p>The classic exam question: "How should a web application store user passwords?" The answer is a <b>salted, slow hash</b> (bcrypt, scrypt or Argon2), never reversible encryption and never plain text. When a user logs in, the app hashes what was typed with the stored salt and compares the two hashes. The app itself never needs to know the original password.</p>

<h3>Salting</h3>
<p>A <b>salt</b> is a random value, different for each user, stored next to the hash and mixed in before hashing. Without a salt, two users with the same password have the same hash, and an attacker who steals the table can use precomputed lists to find common passwords. With a unique salt every hash is different, so each guess must be worked out again per user. A <b>slow</b> algorithm (bcrypt, scrypt, Argon2, PBKDF2) makes each guess expensive on purpose; a fast hash like plain SHA-256 is right for file integrity but wrong for passwords.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
import hashlib, os, hmac

def hash_password(password: str):
    salt = os.urandom(16)                                   <span class="c"># unique random salt</span>
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 600000)
    return salt, digest                                      <span class="c"># store both, never the password</span>

def check_password(password: str, salt: bytes, digest: bytes) -> bool:
    candidate = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 600000)
    return hmac.compare_digest(candidate, digest)            <span class="c"># constant-time compare</span></pre>
<p>In real projects use a maintained library for bcrypt or Argon2 rather than writing your own; the snippet shows the idea of salt plus slow hash plus safe comparison.</p>

<h3>Symmetric and asymmetric encryption</h3>
<p><b>Symmetric</b> encryption uses one shared key to lock and unlock (AES). It is fast, so it protects the bulk of the data, but both sides need the key. <b>Asymmetric</b> encryption uses a key pair: a public key that anyone may have and a private key that stays secret (RSA, elliptic curves). What the public key locks, only the private key unlocks; and what the private key <i>signs</i>, anyone can verify with the public key. It is slower, so it is used to agree on keys and to prove identity. TLS uses both: asymmetric steps to authenticate and agree on a secret, then fast symmetric encryption for the data.</p>

<h3>TLS and certificates: encryption in transit</h3>
<p><b>TLS</b> (Transport Layer Security, the successor of SSL) is what turns HTTP into HTTPS. It gives you three things: <b>confidentiality</b> (nobody on the path can read), <b>integrity</b> (nobody can change it unseen) and <b>authentication</b> of the server (you are really talking to shop.nwk.example). A <b>certificate</b> is the server's identity card: it binds a name to a public key and is signed by a <b>certificate authority (CA)</b> that the client already trusts. The client checks the signature chain, that the name matches, and that the certificate has not expired or been revoked.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Simplified TLS handshake">
<rect x="40" y="20" width="120" height="40" rx="8" fill="#bae6fd"/><text x="100" y="45" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="480" y="20" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="540" y="45" text-anchor="middle" class="svg-ink" font-size="13">Server</text>
<line x1="100" y1="60" x2="100" y2="235" stroke="#64748b" stroke-dasharray="4 4"/><line x1="540" y1="60" x2="540" y2="235" stroke="#64748b" stroke-dasharray="4 4"/>
<line x1="100" y1="90" x2="538" y2="90" stroke="#64748b" stroke-width="2"/><text x="320" y="84" text-anchor="middle" class="svg-ink" font-size="12">1 ClientHello: versions, ciphers</text>
<line x1="538" y1="130" x2="102" y2="130" stroke="#64748b" stroke-width="2"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="12">2 ServerHello + certificate</text>
<line x1="100" y1="170" x2="538" y2="170" stroke="#64748b" stroke-width="2"/><text x="320" y="164" text-anchor="middle" class="svg-ink" font-size="12">3 Client verifies cert, key agreement</text>
<line x1="538" y1="210" x2="102" y2="210" stroke="#64748b" stroke-width="2"/><text x="320" y="204" text-anchor="middle" class="svg-ink" font-size="12">4 Finished: encrypted data flows</text>
</svg><p class="cap">After step 4 both sides share a session key and everything is symmetric-encrypted.</p></div>
<p>A browser warns about a certificate when the name does not match, the certificate is expired, the issuer is not trusted (for example self-signed) or the chain is incomplete. Never train users or scripts to click through that warning: it is the very check that proves you reached the right server.</p>

<h3>Verifying TLS in automation scripts</h3>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
import requests
r = requests.get("h&#116;tps://nms.nwk.example/api/v1/devices", timeout=10)   <span class="c"># verify=True is the default</span>

<span class="c"># private CA inside the company: point at the CA bundle, do not disable checking</span>
r = requests.get("h&#116;tps://nms.nwk.example/api/v1/devices", timeout=10, verify="/etc/ssl/nk-internal-ca.pem")

<span class="c"># WRONG: switches off the identity check, so an impostor server is accepted</span>
<span class="c"># requests.get(url, verify=False)</span></pre>
<pre class="out">$ openssl s_client -connect nms.nwk.example:443 -servername nms.nwk.example
Certificate chain
 0 s:CN = nms.nwk.example
   i:CN = NK Internal Issuing CA
<span class="hl">Verify return code: 0 (ok)</span></pre>
<p>That openssl output is a reference of what a healthy check looks like; the simulator does not run it. A non-zero verify return code (such as 18 self-signed, 10 expired, 20 unable to get local issuer) tells you which check failed.</p>

<h3>Encryption at rest</h3>
<p>Disks, database volumes, object storage and backups should be encrypted so a stolen drive or a leaked backup is unreadable. The hard part is the <b>key</b>: keep it away from the data (a key-management service or secret manager), restrict who may use it, and rotate it. Encrypt especially the data that is regulated or personal (customer records, payment data). Encryption at rest does not protect you from an authorised application that is tricked into reading the data, which is why access control and input validation still matter.</p>
<div class="warn"><p><b>Common mistakes.</b> Using <code>verify=False</code> or <code>curl -k</code> "just to make it work"; storing passwords with a fast hash or reversible encryption; hard-coding the encryption key next to the encrypted data; and forgetting to renew a certificate until the service breaks.</p></div>
<div class="exam"><p><b>Exam traps.</b> Hashing is not encryption (no key, cannot be reversed). A salt is not secret and is not a key. Public key encrypts, private key decrypts; for signatures it is the reverse. HTTPS is HTTP carried inside TLS, usually on TCP 443.</p></div>

<div class="scn"><h4>The expired certificate at midnight</h4><p>At 00:05 every monitoring script that polled the controller began to fail with "certificate verify failed". A junior engineer's first idea was to add <code>verify=False</code> to the shared library. The senior on call refused: the failure was the check working correctly, because the controller's certificate had expired at midnight. They renewed the certificate, added an expiry alert thirty days ahead, and the scripts recovered without any code change.</p><p><b>Lesson:</b> a TLS error is information. Fix the certificate, never the check.</p></div>

<div class="iv"><p class="q">"What is the difference between hashing and encryption, and which do you use for passwords?"</p><p>Encryption is two-way with a key and protects confidentiality; hashing is one-way and gives a fixed fingerprint used for integrity and password storage. For passwords use a salted, deliberately slow hash such as bcrypt or Argon2, so a stolen database cannot be turned back into passwords and identical passwords do not look identical.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Protect data in transit (TLS) and at rest (disk, database and backup encryption).</li>
<li>Encoding is reversible by anyone, encryption needs a key, hashing is one-way.</li>
<li>Passwords: salted, slow hash (bcrypt, scrypt, Argon2); salt is unique per user and not secret.</li>
<li>A certificate binds a name to a public key and is signed by a trusted CA; TLS gives confidentiality, integrity and server authentication.</li>
<li>Never disable certificate verification; fix the certificate or add the internal CA to the trust store.</li>
</ul></div>
`,hi:`
<p>Data do states mein hota hai jinhe protection chahiye. <b>Data in transit</b> network par chalta hai (browser se web server, script se controller API). <b>Data at rest</b> disk, database ya backup mein padha rehta hai. Encryption dono ko protect karta hai, aur exam yeh bhi chahta hai ki aap encryption ko hashing aur encoding se alag pehchano.</p>

<h3>Analogy: letters aur lockboxes</h3>
<p>Postcard bhejna plain text hai: har postman padh sakta hai. Sealed, tamper-evident envelope mein letter bhejna <b>encryption in transit</b> hai. Letter ko ghar ki safe mein band karna <b>encryption at rest</b> hai. Wax seal jo letter kholne par tut jaye woh <b>hash ya signature</b> hai: woh text chhupata nahi, sabit karta hai ki kisi ne badla nahi.</p>

<h3>Encoding, encryption, hashing: teen alag cheezein</h3>
<table class="cmp"><tr><th></th><th>Maksad</th><th>Reversible?</th><th>Key chahiye?</th><th>Example</th></tr>
<tr><td><b>Encoding</b></td><td>Format badalna taaki systems data le ja sakein</td><td>Haan, kisi se bhi</td><td>Nahi</td><td>Base64, URL encoding</td></tr>
<tr><td><b>Encryption</b></td><td>Data confidential rakhna</td><td>Haan, key ke saath</td><td>Haan</td><td>Files ke liye AES, traffic ke liye TLS</td></tr>
<tr><td><b>Hashing</b></td><td>Data ka fingerprint, integrity check, password storage</td><td>Nahi, one-way</td><td>Nahi (salt key nahi hota)</td><td>SHA-256, bcrypt, Argon2</td></tr>
</table>
<p>Classic exam question: "Web application user passwords kaise store kare?" Jawab hai <b>salted, slow hash</b> (bcrypt, scrypt ya Argon2), kabhi reversible encryption nahi aur kabhi plain text nahi. User login kare to app jo type hua usse stored salt ke saath hash karti hai aur dono hashes compare karti hai. App ko original password kabhi jaanne ki zaroorat nahi.</p>

<h3>Salting</h3>
<p><b>Salt</b> ek random value hai, har user ke liye alag, hash ke saath stored aur hash se pehle mix ki jati hai. Salt ke bina do users ka same password same hash deta hai, aur table chura lene wala attacker precomputed lists se common passwords dhoondh sakta hai. Unique salt ke saath har hash alag hota hai, isliye har guess har user ke liye dobara karna padta hai. <b>Slow</b> algorithm (bcrypt, scrypt, Argon2, PBKDF2) har guess ko jaan-boojhkar mehnga banata hai; plain SHA-256 jaisa fast hash file integrity ke liye sahi hai par passwords ke liye galat.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
import hashlib, os, hmac

def hash_password(password: str):
    salt = os.urandom(16)                                   <span class="c"># unique random salt</span>
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 600000)
    return salt, digest                                      <span class="c"># dono store karo, password nahi</span>

def check_password(password: str, salt: bytes, digest: bytes) -> bool:
    candidate = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 600000)
    return hmac.compare_digest(candidate, digest)            <span class="c"># constant-time compare</span></pre>
<p>Real projects mein bcrypt ya Argon2 ke liye maintained library use karo, khud mat likho; snippet salt plus slow hash plus safe comparison ka idea dikhata hai.</p>

<h3>Symmetric aur asymmetric encryption</h3>
<p><b>Symmetric</b> encryption lock aur unlock ke liye ek shared key use karta hai (AES). Yeh fast hai, isliye zyadatar data ko protect karta hai, par dono sides ko key chahiye. <b>Asymmetric</b> encryption key pair use karta hai: public key jo sab ke paas ho sakti hai aur private key jo secret rehti hai (RSA, elliptic curves). Public key jo lock kare use sirf private key kholti hai; aur private key jo <i>sign</i> kare use public key se koi bhi verify kar sakta hai. Yeh slow hai, isliye keys agree karne aur identity prove karne ke liye use hota hai. TLS dono use karta hai: authenticate aur secret agree karne ke liye asymmetric steps, phir data ke liye fast symmetric encryption.</p>

<h3>TLS aur certificates: encryption in transit</h3>
<p><b>TLS</b> (Transport Layer Security, SSL ka successor) woh hai jo HTTP ko HTTPS banata hai. Yeh teen cheezein deta hai: <b>confidentiality</b> (raaste mein koi padh nahi sakta), <b>integrity</b> (koi bina dikhe badal nahi sakta) aur server ki <b>authentication</b> (aap sach mein shop.nwk.example se baat kar rahe ho). <b>Certificate</b> server ka identity card hai: yeh naam ko public key se bind karta hai aur <b>certificate authority (CA)</b> se signed hota hai jis par client pehle se bharosa karta hai. Client signature chain check karta hai, naam match karta hai, aur dekhta hai ki certificate expire ya revoke nahi hua.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Simplified TLS handshake">
<rect x="40" y="20" width="120" height="40" rx="8" fill="#bae6fd"/><text x="100" y="45" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="480" y="20" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="540" y="45" text-anchor="middle" class="svg-ink" font-size="13">Server</text>
<line x1="100" y1="60" x2="100" y2="235" stroke="#64748b" stroke-dasharray="4 4"/><line x1="540" y1="60" x2="540" y2="235" stroke="#64748b" stroke-dasharray="4 4"/>
<line x1="100" y1="90" x2="538" y2="90" stroke="#64748b" stroke-width="2"/><text x="320" y="84" text-anchor="middle" class="svg-ink" font-size="12">1 ClientHello: versions, ciphers</text>
<line x1="538" y1="130" x2="102" y2="130" stroke="#64748b" stroke-width="2"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="12">2 ServerHello + certificate</text>
<line x1="100" y1="170" x2="538" y2="170" stroke="#64748b" stroke-width="2"/><text x="320" y="164" text-anchor="middle" class="svg-ink" font-size="12">3 Client cert verify, key agreement</text>
<line x1="538" y1="210" x2="102" y2="210" stroke="#64748b" stroke-width="2"/><text x="320" y="204" text-anchor="middle" class="svg-ink" font-size="12">4 Finished: encrypted data flows</text>
</svg><p class="cap">Step 4 ke baad dono sides ke paas session key hai aur sab kuch symmetric-encrypted hai.</p></div>
<p>Browser certificate par tab warn karta hai jab naam match na kare, certificate expired ho, issuer trusted na ho (jaise self-signed) ya chain adhoori ho. Users ya scripts ko is warning par click-through karna kabhi mat sikhao: yehi woh check hai jo sabit karta hai ki aap sahi server tak pahunche.</p>

<h3>Automation scripts mein TLS verify karna</h3>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
import requests
r = requests.get("h&#116;tps://nms.nwk.example/api/v1/devices", timeout=10)   <span class="c"># verify=True default hai</span>

<span class="c"># company ka private CA: CA bundle par point karo, checking band mat karo</span>
r = requests.get("h&#116;tps://nms.nwk.example/api/v1/devices", timeout=10, verify="/etc/ssl/nk-internal-ca.pem")

<span class="c"># GALAT: identity check band, isliye nakli server bhi accept ho jata hai</span>
<span class="c"># requests.get(url, verify=False)</span></pre>
<pre class="out">$ openssl s_client -connect nms.nwk.example:443 -servername nms.nwk.example
Certificate chain
 0 s:CN = nms.nwk.example
   i:CN = NK Internal Issuing CA
<span class="hl">Verify return code: 0 (ok)</span></pre>
<p>Yeh openssl output ek reference hai ki healthy check kaisa dikhta hai; simulator ise nahi chalata. Non-zero verify return code (jaise 18 self-signed, 10 expired, 20 unable to get local issuer) batata hai kaunsa check fail hua.</p>

<h3>Encryption at rest</h3>
<p>Disks, database volumes, object storage aur backups encrypted hone chahiye taaki chori hui drive ya leaked backup unreadable ho. Mushkil hissa <b>key</b> hai: use data se door rakho (key-management service ya secret manager), kaun use kar sakta hai restrict karo, aur rotate karo. Khaas kar regulated ya personal data (customer records, payment data) encrypt karo. Encryption at rest us authorised application se nahi bachata jise data padhne ke liye bevakoof banaya jaye, isliye access control aur input validation ab bhi zaroori hain.</p>
<div class="warn"><p><b>Common mistakes.</b> "Bas chala do" ke liye <code>verify=False</code> ya <code>curl -k</code> use karna; passwords ko fast hash ya reversible encryption se store karna; encryption key ko encrypted data ke bagal mein hard-code karna; aur certificate renew karna tab tak bhoolna jab tak service tut na jaye.</p></div>
<div class="exam"><p><b>Exam traps.</b> Hashing encryption nahi hai (key nahi, reverse nahi hota). Salt secret nahi hota aur key nahi hota. Public key encrypt karti hai, private key decrypt karti hai; signatures ke liye ulta. HTTPS matlab TLS ke andar HTTP, aam taur par TCP 443 par.</p></div>

<div class="scn"><h4>Raat ko expired certificate</h4><p>00:05 par har monitoring script jo controller poll karti thi "certificate verify failed" se fail hone lagi. Junior engineer ka pehla idea tha shared library mein <code>verify=False</code> daalna. On-call senior ne mana kiya: failure check ka sahi kaam karna tha, kyunki controller ka certificate raat 12 baje expire ho gaya tha. Unhone certificate renew kiya, tees din pehle expiry alert lagaya, aur scripts bina kisi code change ke wapas chalne lagi.</p><p><b>Lesson:</b> TLS error ek jaankari hai. Certificate theek karo, check nahi.</p></div>

<div class="iv"><p class="q">"Hashing aur encryption mein kya farak hai, aur passwords ke liye kaunsa use karoge?"</p><p>Encryption key ke saath do-tarfa hai aur confidentiality protect karta hai; hashing one-way hai aur fixed fingerprint deta hai jo integrity aur password storage ke liye use hota hai. Passwords ke liye salted, jaan-boojhkar slow hash jaise bcrypt ya Argon2 use karo, taaki chori hui database se passwords wapas na bane aur identical passwords identical na dikhein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Data in transit (TLS) aur at rest (disk, database aur backup encryption) dono protect karo.</li>
<li>Encoding kisi se bhi reversible hai, encryption ko key chahiye, hashing one-way hai.</li>
<li>Passwords: salted, slow hash (bcrypt, scrypt, Argon2); salt har user ke liye unique aur secret nahi.</li>
<li>Certificate naam ko public key se bind karta hai aur trusted CA se signed hota hai; TLS confidentiality, integrity aur server authentication deta hai.</li>
<li>Certificate verification kabhi band mat karo; certificate theek karo ya internal CA trust store mein daalo.</li>
</ul></div>
`}};export{e as default};