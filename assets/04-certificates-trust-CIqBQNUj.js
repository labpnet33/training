var e={id:`certificates-trust`,h:{en:`Certificates and trust: the CA behind decryption, and how to protect it`,hi:`Certificates aur trust: decryption ke peeche ki CA, aur use kaise protect karein`},body:{en:`

<p><b>Decryption is a trust project.</b> Every decrypted session depends on one question: do the clients trust the certificate the firewall presents? This chapter covers the certificates, where they come from, how clients learn to trust them, and how to protect the single most sensitive item in the whole project: the private key of the decryption CA.</p>

<h3>Analogy: the office that prints its own ID cards</h3>
<p>If your company prints its own staff ID cards, every door in the company must be told "cards signed by our HR stamp are valid". If the HR stamp is stolen, anyone can print a card for any person and walk in anywhere. The decryption CA is the HR stamp: it lets the firewall issue a "valid" certificate for any website to your own devices. Guard the stamp.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Certificate hierarchy"><rect x="60" y="10" width="520" height="44" rx="9" fill="#bae6fd"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">Enterprise root CA</text><text x="320" y="45" text-anchor="middle" class="svg-muted" font-size="11">already trusted by managed devices</text><line x1="320" y1="54" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><rect x="60" y="70" width="520" height="44" rx="9" fill="#bbf7d0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">Firewall subordinate CA (Forward Trust)</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="11">signed by the enterprise root; the firewall signs site certificates with it</text><line x1="320" y1="114" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><rect x="60" y="130" width="520" height="44" rx="9" fill="#ddd6fe"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">Generated site certificate</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="11">created on the fly for each decrypted site</text></svg><p class="cap">Preferred design: the firewall CA is a subordinate of a CA that clients already trust.</p></div>

<h3>The certificates involved</h3>
<dl class="terms">
<dt>Forward Trust certificate</dt><dd>A CA certificate (CA flag set) with a private key on the firewall. Signs the certificates the firewall makes for sites with trusted real certificates. Clients must trust it.</dd>
<dt>Forward Untrust certificate</dt><dd>A separate CA certificate, also on the firewall. Signs the certificates for sites with untrustworthy real certificates. Clients must not trust it, so users see a warning.</dd>
<dt>Server certificate and key (inbound)</dt><dd>The real certificate and key of your own published server, imported for SSL Inbound Inspection (chapter 5).</dd>
<dt>Trusted root CAs on the firewall</dt><dd>The list the firewall uses to validate real servers. A default list is maintained with content updates; you can add your own enterprise roots for internal servers.</dd>
<dt>Certificate profile</dt><dd>Settings for validating certificates (OCSP, CRL checks) used by authentication and other features.</dd>
</dl>

<h3>Where does the Forward Trust CA come from?</h3>
<table class="cmp"><tr><th>Option</th><th>How</th><th>Pros and cons</th></tr>
<tr><td>Subordinate CA of the enterprise CA</td><td>Generate a certificate request on the firewall; the enterprise CA signs it; import the signed certificate</td><td>Best: clients already trust the enterprise root. Needs a CA team and a signing process.</td></tr>
<tr><td>Self-signed root CA on the firewall</td><td>Generate a CA certificate on the firewall</td><td>Simple, but you must distribute the root to every client and it becomes its own root of trust.</td></tr>
<tr><td>Imported from a CA with the key</td><td>Import certificate and key (for example for HA pairs or after a rebuild)</td><td>Needed for consistency across firewalls; protect the exported file.</td></tr>
</table>
<p>For high availability, both firewalls need the same CA certificate and key, so that clients see one consistent issuer after a failover.</p>
<p>Reference only: all of this is done under <b>Device &gt; Certificate Management &gt; Certificates</b> in the GUI. In the certificate, tick the usage <b>Forward Trust Certificate</b> or <b>Forward Untrust Certificate</b>. The simulator has no certificate store, so there is nothing to run here. Key lengths, CA flags and validity are discussed in sec-crypto.</p>

<h3>Key choices</h3>
<ul>
<li><b>Algorithm and size:</b> RSA 2048 bits at least, or an elliptic curve key (for example P-256). The firewall generates site certificates with the same type. Check what your applications support.</li>
<li><b>Validity:</b> a CA is valid for years but plan the rotation date; an expired CA breaks all decryption at once.</li>
<li><b>Name and constraints:</b> use a clear name such as "Acme Decryption CA 2026" so that users and auditors recognise it.</li>
</ul>

<h3>Distributing trust to clients</h3>
<p>Every device that passes through the firewall must trust the Forward Trust CA, otherwise it shows errors:</p>
<table class="cmp"><tr><th>Client type</th><th>Typical method</th></tr>
<tr><td>Windows domain PCs</td><td>Group policy to the trusted root store</td></tr>
<tr><td>Managed Mac, mobile</td><td>Device management profile</td></tr>
<tr><td>Linux servers and tools</td><td>Add to the system trust store, and separately to tools with their own store (some language runtimes and containers)</td></tr>
<tr><td>Unmanaged and BYOD devices</td><td>Do not decrypt them; or require enrolment first</td></tr>
</table>
<p>Where you cannot install the CA (guest devices, devices you do not own), do not decrypt. It is both a technical and an ethical line.</p>

<h3>Protecting the private key</h3>
<ul>
<li>The key stays on the firewall. Disable key export where you can, or store it in a hardware security module (HSM) where supported.</li>
<li>Restrict who can export or view certificate material using administrator roles (see sec-aaa-mgmt) and log all access.</li>
<li>Keep any backup file encrypted with a long passphrase stored in a vault. In this course every passphrase is a placeholder, never a real one.</li>
<li>Have a response plan: if the key might be exposed, remove trust from clients, issue a new CA and rotate.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> The security team plans for the CA to be valid five years. They create "Acme Decryption CA 2026" as a subordinate of the enterprise root, import it to both firewalls in the HA pair, push nothing to clients because they already trust the enterprise root, and add a calendar reminder for the CA renewal eleven months before the end. Auditors see the key is non-exportable.</p></div>

<div class="note"><p><b>Note.</b> Never put a real private key, real certificate or password in a ticket, chat or lesson. Examples use placeholders and the .example domain. If a key is exposed, treat it as a security incident.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using a self-signed decryption CA without a distribution plan, or leaving the key exportable for many administrators. A leaked decryption CA key lets an attacker impersonate any website to every device that trusts it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Forward Trust CA must be trusted by clients; Forward Untrust must not. A subordinate CA of the enterprise CA avoids client distribution. In HA, both peers need the same CA certificate and key. Protect the key; consider an HSM.</p></div>

<div class="scn"><h4>The expired decryption CA</h4><p>On a Monday morning the whole company saw certificate errors on every HTTPS site. The decryption CA had reached its end date during the weekend. The team issued a new CA, pushed it through device management, and swapped the Forward Trust certificate. They then added a renewal reminder one year before expiry to the change calendar.</p><p><b>Lesson:</b> The decryption CA is critical infrastructure with an expiry date. Track it like a domain name.</p></div>

<div class="iv"><p class="q">"How do you handle certificates for SSL Forward Proxy?"</p><p>I create a Forward Trust CA, preferably as a subordinate of the enterprise CA so clients already trust it, and a separate Forward Untrust certificate that clients do not trust. I distribute the trust to managed devices before enabling the rule, import the same CA to both HA peers, protect the private key with non-export and role restrictions or an HSM, and plan renewal before the end date.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Forward Trust CA signs for trusted sites; clients must trust it. Forward Untrust must not be trusted.</li>
<li>A subordinate of the enterprise CA is the easiest to roll out.</li>
<li>HA peers need the same CA certificate and key.</li>
<li>Protect the CA key: non-export, HSM, role limits, encrypted backups.</li>
<li>Track the CA expiry; plan rotation.</li>
</ul></div>

`,hi:`

<p><b>Decryption ek trust project hai.</b> Har decrypted session ek sawaal par depend karta hai: kya clients us certificate par trust karte hain jo firewall dikhata hai? Yeh chapter certificates, woh kahan se aate hain, clients ko trust kaise seekhna hai, aur poore project ki sabse sensitive cheez, decryption CA ki private key, ko kaise protect karna hai, yeh cover karta hai.</p>

<h3>Analogy: office jo apne ID cards khud print karta hai</h3>
<p>Aapki company apne staff ID cards khud print karti hai to company ke har darwaze ko bataya jaata hai "hamare HR stamp se sign kiye cards valid hain". HR stamp chori ho jaye to koi bhi kisi ke naam ka card print karke kahin bhi ghus sakta hai. Decryption CA HR stamp hai: yeh firewall ko aapke apne devices ke liye kisi bhi website ka "valid" certificate jaari karne deta hai. Stamp ki hifazat karo.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Certificate hierarchy"><rect x="60" y="10" width="520" height="44" rx="9" fill="#bae6fd"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">Enterprise root CA</text><text x="320" y="45" text-anchor="middle" class="svg-muted" font-size="11">managed devices par pehle se trusted</text><line x1="320" y1="54" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><rect x="60" y="70" width="520" height="44" rx="9" fill="#bbf7d0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">Firewall subordinate CA (Forward Trust)</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="11">enterprise root se signed; firewall isse site certificates sign karta hai</text><line x1="320" y1="114" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><rect x="60" y="130" width="520" height="44" rx="9" fill="#ddd6fe"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">Generated site certificate</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="11">har decrypted site ke liye on the fly banta hai</text></svg><p class="cap">Preferred design: firewall CA us CA ka subordinate ho jise clients pehle se trust karte hain.</p></div>

<h3>Shamil certificates</h3>
<dl class="terms">
<dt>Forward Trust certificate</dt><dd>CA certificate (CA flag set) jiski private key firewall par hai. Un sites ke certificates sign karta hai jinke asli certificates trusted hain. Clients ko trust karna hai.</dd>
<dt>Forward Untrust certificate</dt><dd>Alag CA certificate, woh bhi firewall par. Un sites ke certificates sign karta hai jinke asli certificates bharose ke layak nahi. Clients ko trust nahi karna, taaki users ko warning dikhe.</dd>
<dt>Server certificate aur key (inbound)</dt><dd>Aapke apne published server ka asli certificate aur key, SSL Inbound Inspection ke liye import (chapter 5).</dd>
<dt>Firewall par trusted root CAs</dt><dd>Woh list jo firewall asli servers validate karne mein use karta hai. Default list content updates ke saath maintain hoti hai; internal servers ke liye apne enterprise roots jod sakte ho.</dd>
<dt>Certificate profile</dt><dd>Certificates validate karne ki settings (OCSP, CRL checks), authentication aur doosre features mein use hoti hain.</dd>
</dl>

<h3>Forward Trust CA kahan se aata hai?</h3>
<table class="cmp"><tr><th>Option</th><th>Kaise</th><th>Fayde aur nuksaan</th></tr>
<tr><td>Enterprise CA ka subordinate CA</td><td>Firewall par certificate request banao; enterprise CA sign kare; signed certificate import karo</td><td>Best: clients enterprise root par pehle se trust karte hain. CA team aur signing process chahiye.</td></tr>
<tr><td>Firewall par self-signed root CA</td><td>Firewall par CA certificate generate karo</td><td>Simple, lekin root har client ko distribute karna padega aur yeh apna root of trust ban jaata hai.</td></tr>
<tr><td>Key ke saath CA se imported</td><td>Certificate aur key import karo (jaise HA pairs ke liye ya rebuild ke baad)</td><td>Firewalls mein consistency ke liye zaroori; exported file protect karo.</td></tr>
</table>
<p>High availability mein dono firewalls ko same CA certificate aur key chahiye, taaki failover ke baad clients ko ek hi issuer dikhe.</p>
<p>Sirf reference: yeh sab GUI mein <b>Device &gt; Certificate Management &gt; Certificates</b> ke neeche hota hai. Certificate mein usage <b>Forward Trust Certificate</b> ya <b>Forward Untrust Certificate</b> tick karo. Simulator mein certificate store nahi hai, isliye yahan chalane ko kuch nahi. Key lengths, CA flags aur validity sec-crypto mein hain.</p>

<h3>Key choices</h3>
<ul>
<li><b>Algorithm aur size:</b> kam se kam RSA 2048 bits, ya elliptic curve key (jaise P-256). Firewall site certificates usi type ke banata hai. Check karo aapki applications kya support karti hain.</li>
<li><b>Validity:</b> CA saalon ke liye valid hoti hai lekin rotation date plan karo; expired CA saari decryption ek saath tod deti hai.</li>
<li><b>Naam aur constraints:</b> "Acme Decryption CA 2026" jaisa saaf naam rakho taaki users aur auditors pehchan sakein.</li>
</ul>

<h3>Clients ko trust distribute karna</h3>
<p>Firewall se guzarne waale har device ko Forward Trust CA par trust karna chahiye, warna errors dikhte hain:</p>
<table class="cmp"><tr><th>Client type</th><th>Aam method</th></tr>
<tr><td>Windows domain PCs</td><td>Trusted root store ke liye group policy</td></tr>
<tr><td>Managed Mac, mobile</td><td>Device management profile</td></tr>
<tr><td>Linux servers aur tools</td><td>System trust store mein jodo, aur alag se un tools mein jinka apna store hota hai (kuch language runtimes aur containers)</td></tr>
<tr><td>Unmanaged aur BYOD devices</td><td>Unhe decrypt mat karo; ya pehle enrolment mango</td></tr>
</table>
<p>Jahan CA install nahi kar sakte (guest devices, jo devices aapke nahi), decrypt mat karo. Yeh technical aur ethical dono line hai.</p>

<h3>Private key ki hifazat</h3>
<ul>
<li>Key firewall par rehti hai. Jahan ho sake key export disable karo, ya jahan supported ho hardware security module (HSM) mein rakho.</li>
<li>Certificate material kaun export ya dekh sakta hai, administrator roles se restrict karo (sec-aaa-mgmt dekho) aur saara access log karo.</li>
<li>Koi bhi backup file lambe passphrase se encrypted rakho jo vault mein ho. Is course mein har passphrase placeholder hai, asli kabhi nahi.</li>
<li>Response plan rakho: key expose hone ka shak ho to clients se trust hatao, nayi CA jaari karo aur rotate karo.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Security team CA ko paanch saal valid rakhne ka plan banati hai. Woh "Acme Decryption CA 2026" ko enterprise root ke subordinate ke roop mein banati hai, HA pair ke dono firewalls par import karti hai, clients par kuch push nahi karti kyunki woh enterprise root par pehle se trust karte hain, aur CA renewal ke liye end se gyarah mahine pehle calendar reminder lagati hai. Auditors dekhte hain ki key non-exportable hai.</p></div>

<div class="note"><p><b>Note.</b> Ticket, chat ya lesson mein kabhi asli private key, asli certificate ya password mat daalo. Examples placeholders aur .example domain use karte hain. Key expose ho jaye to use security incident maano.</p></div>

<div class="warn"><p><b>Common mistake.</b> Distribution plan ke bina self-signed decryption CA use karna, ya key ko kai administrators ke liye exportable chhodna. Leaked decryption CA key attacker ko har us device ko jo use trust karta hai kisi bhi website ka impersonation karne deti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Forward Trust CA clients ko trust karni hai; Forward Untrust nahi. Enterprise CA ka subordinate CA client distribution bachata hai. HA mein dono peers ko same CA certificate aur key chahiye. Key protect karo; HSM par vichar karo.</p></div>

<div class="scn"><h4>Expired decryption CA</h4><p>Monday subah poori company ko har HTTPS site par certificate errors dikhe. Decryption CA weekend mein end date par pahunch gayi thi. Team ne nayi CA jaari ki, device management se push ki, aur Forward Trust certificate badla. Phir change calendar mein expiry se ek saal pehle renewal reminder jodaa.</p><p><b>Lesson:</b> Decryption CA critical infrastructure hai jiski expiry date hai. Ise domain name ki tarah track karo.</p></div>

<div class="iv"><p class="q">"SSL Forward Proxy ke liye certificates kaise handle karte ho?"</p><p>Main Forward Trust CA banata hoon, behtar hai enterprise CA ke subordinate ke roop mein taaki clients use pehle se trust karein, aur alag Forward Untrust certificate jise clients trust nahi karte. Rule enable karne se pehle managed devices par trust distribute karta hoon, dono HA peers par same CA import karta hoon, private key ko non-export aur role restrictions ya HSM se protect karta hoon, aur end date se pehle renewal plan karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Forward Trust CA trusted sites ke liye sign karti hai; clients ko trust karna hai. Forward Untrust trust nahi hona chahiye.</li>
<li>Enterprise CA ka subordinate roll out karna sabse aasan hai.</li>
<li>HA peers ko same CA certificate aur key chahiye.</li>
<li>CA key protect karo: non-export, HSM, role limits, encrypted backups.</li>
<li>CA expiry track karo; rotation plan karo.</li>
</ul></div>

`}};export{e as default};