var e={id:`pki-trustpoints`,h:{en:`PKI: CA hierarchy, CSR, enrollment, revocation and trustpoints`,hi:`PKI: CA hierarchy, CSR, enrollment, revocation aur trustpoints`},body:{en:`
<p>Think of how India issues passports. The Ministry (the root of trust) does not print every passport itself; it authorises regional passport offices, which issue passports to citizens. Airports around the world trust the Ministry, so they trust any passport from its regional offices. When a passport is lost or cancelled, it goes on a list that immigration checks. That whole system of authorities, documents, rules and cancellation lists is what a <b>public key infrastructure (PKI)</b> is for certificates.</p>

<h3>The CA hierarchy</h3>
<dl class="terms">
<dt>Root CA</dt><dd>The top of trust. Its certificate is <b>self-signed</b> (issuer equals subject) and is installed on devices as a <b>trust anchor</b>. Best practice keeps the root <b>offline</b>, powered on only to sign intermediate CAs or publish its CRL.</dd>
<dt>Intermediate (subordinate, issuing) CA</dt><dd>Signed by the root, and does the daily work of signing device and user certificates. If it is compromised, you revoke it at the root without replacing the root on every device.</dd>
<dt>End-entity certificate</dt><dd>A router, firewall, server or user certificate with Basic Constraints CA:FALSE.</dd>
<dt>Registration authority (RA)</dt><dd>An optional front end that checks requests before the CA signs them, for example ISE acting as a SCEP RA for BYOD phones.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="CA hierarchy and chain of trust">
<rect x="230" y="10" width="180" height="44" rx="8" fill="#fde68a"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">NK-Root-CA</text><text x="320" y="46" text-anchor="middle" class="svg-muted" font-size="12">self-signed, offline</text>
<rect x="230" y="100" width="180" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">NK-Issuing-CA</text><text x="320" y="136" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.50, online</text>
<line x1="320" y1="54" x2="320" y2="100" stroke="#64748b" stroke-width="2"/><text x="330" y="82" class="svg-accent" font-size="12">signs</text>
<rect x="30" y="200" width="140" height="44" rx="8" fill="#bae6fd"/><text x="100" y="220" text-anchor="middle" class="svg-ink" font-size="13">R1.nk.example</text><text x="100" y="236" text-anchor="middle" class="svg-muted" font-size="12">CA:FALSE</text>
<rect x="250" y="200" width="140" height="44" rx="8" fill="#bae6fd"/><text x="320" y="220" text-anchor="middle" class="svg-ink" font-size="13">R2.nk.example</text><text x="320" y="236" text-anchor="middle" class="svg-muted" font-size="12">CA:FALSE</text>
<rect x="470" y="200" width="140" height="44" rx="8" fill="#bae6fd"/><text x="540" y="220" text-anchor="middle" class="svg-ink" font-size="13">vpn.nk.example</text><text x="540" y="236" text-anchor="middle" class="svg-muted" font-size="12">ASA1 identity</text>
<line x1="280" y1="144" x2="100" y2="200" stroke="#64748b"/><line x1="320" y1="144" x2="320" y2="200" stroke="#64748b"/><line x1="360" y1="144" x2="540" y2="200" stroke="#64748b"/>
<text x="320" y="264" text-anchor="middle" class="svg-accent" font-size="12">Validation walks upward: device cert, issuing CA, trusted root</text>
</svg><p class="cap">Two-tier PKI used in this module. Devices trust the root; the issuing CA signs their certificates.</p></div>

<h3>Getting a certificate: the CSR and enrollment</h3>
<ol>
<li>The device generates its own key pair. The private key never leaves it.</li>
<li>It builds a <b>CSR</b> (certificate signing request, PKCS#10) containing its subject name, SAN and public key, and signs the CSR with its private key to prove it owns the key.</li>
<li>The CA checks the request, adds validity dates, serial number and extensions, and signs the certificate.</li>
<li>The device installs its certificate and the CA chain.</li>
</ol>
<table class="cmp"><tr><th>Enrollment method</th><th>How</th><th>Use it when</th></tr>
<tr><td><b>Manual (terminal / copy-paste)</b></td><td>Device prints a PEM CSR; admin submits it; admin pastes the returned certificate</td><td>Few devices, public CA, no network path to the CA</td></tr>
<tr><td><b>SCEP</b> (simple certificate enrollment protocol)</td><td>Device talks to the CA or RA over HTTP with a one-time challenge password</td><td>Routers, firewalls, MDM and ISE BYOD at scale; widely supported</td></tr>
<tr><td><b>EST</b> (enrollment over secure transport)</td><td>Enrollment over TLS with mutual authentication; supports re-enrollment</td><td>Modern replacement for SCEP; IoT, automation</td></tr>
</table>

<h3>Revocation: CRL and OCSP</h3>
<table class="cmp"><tr><th></th><th>CRL</th><th>OCSP</th></tr>
<tr><td>What</td><td>A signed list of revoked serial numbers published by the CA</td><td>A real-time query "is serial X good?" to an OCSP responder</td></tr>
<tr><td>Freshness</td><td>As fresh as the last download (hours or days)</td><td>Near real time</td></tr>
<tr><td>Load</td><td>Large lists, cached on the device</td><td>Small queries, responder must be highly available</td></tr>
<tr><td>Extra</td><td>Location in the CRL distribution point extension</td><td>Location in AIA; TLS "OCSP stapling" lets the server attach the answer</td></tr>
</table>

<h3>Trustpoints on IOS</h3>
<p>A <b>trustpoint</b> is the IOS or ASA container for one CA relationship: the CA certificate, how to enroll, which key pair to use, what subject to request and how to check revocation.</p>
<pre class="code"><span class="c">! certificates need correct time: configure NTP first</span>
R1(config)# ntp server 192.0.2.123
R1(config)# crypto key generate rsa modulus 2048 label R1-KEY
R1(config)# crypto pki trustpoint NK-CA
R1(ca-trustpoint)#  enrollment url h&#116;tp://192.0.2.50:80
R1(ca-trustpoint)#  subject-name CN=R1.nk.example,O=MyPnetLab Lab
R1(ca-trustpoint)#  subject-alt-name R1.nk.example
R1(ca-trustpoint)#  rsakeypair R1-KEY
R1(ca-trustpoint)#  revocation-check crl
R1(ca-trustpoint)#  auto-enroll 80 regenerate
R1(config)# crypto pki authenticate NK-CA
R1(config)# crypto pki enroll NK-CA</pre>
<pre class="out">R1(config)# crypto pki authenticate NK-CA
Certificate has the following attributes:
       Fingerprint MD5: 7C1A0E4B 9D2F6A31 C4E8B0D2 5F3A9E17
<span class="hl">      Fingerprint SHA1: 2B4D6F81 A3C5E7F9 1B3D5F7A 9C1E3A5B 7D9F1B3D</span>
% Do you accept this certificate? [yes/no]: yes
Trustpoint CA certificate accepted.
...
%PKI-6-CERTRET: Certificate received from Certificate Authority

R1# show crypto pki certificates NK-CA
Certificate
<span class="hl">  Status: Available</span>
  Certificate Serial Number (hex): 1A2B3C
  Certificate Usage: General Purpose
  Issuer:
    cn=NK-Issuing-CA
    o=MyPnetLab Lab
  Subject:
    Name: R1.nk.example
    cn=R1.nk.example
  Validity Date:
    start date: 09:15:02 UTC Sep 1 2026
<span class="hl">    end   date: 09:15:02 UTC Sep 1 2027</span>
  Associated Trustpoints: NK-CA</pre>
<p><code>authenticate</code> installs the CA certificate: always compare the fingerprint with one obtained from the CA admin by phone or a trusted portal. <code>enroll</code> sends the CSR. <code>auto-enroll 80 regenerate</code> renews at 80 percent of the lifetime with a fresh key. With <code>enrollment terminal</code> instead of a URL, <code>crypto pki enroll</code> prints the CSR and <code>crypto pki import NK-CA certificate</code> accepts the pasted result.</p>

<h3>Trustpoints on ASA</h3>
<pre class="code">ASA1(config)# crypto key generate rsa label ASA-KEY modulus 2048
ASA1(config)# crypto ca trustpoint NK-CA
ASA1(config-ca-trustpoint)# enrollment terminal
ASA1(config-ca-trustpoint)# subject-name CN=vpn.nk.example,O=MyPnetLab Lab
ASA1(config-ca-trustpoint)# keypair ASA-KEY
ASA1(config-ca-trustpoint)# revocation-check ocsp
ASA1(config)# crypto ca authenticate NK-CA
ASA1(config)# crypto ca enroll NK-CA
ASA1(config)# crypto ca import NK-CA certificate</pre>
<p>The ASA uses <code>crypto ca</code> where IOS uses <code>crypto pki</code>; the ideas are identical. Threat Defense does the same through Management Center under certificate enrollment objects.</p>

<div class="eg"><p><b>Worked example.</b> ASA1's certificate was issued on 1 September 2026 with a one-year life. With <code>auto-enroll 80</code> on an IOS router, renewal starts at 80 percent of 365 days, about day 292, which is around 20 June 2027, leaving ten weeks to fix any renewal problem before expiry.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling <code>revocation-check crl</code> when the device cannot reach the CRL location. Certificate validation then fails and tunnels drop. Either make the CRL reachable, use <code>revocation-check crl none</code> to fall back when it is unreachable, or use OCSP with a redundant responder.</p></div>

<div class="exam"><p><b>Exam trap.</b> The CSR contains the <b>public</b> key only. SCEP runs over HTTP (its messages are protected by PKCS#7 inside), while EST runs over TLS. OCSP is real time; a CRL is a periodically published list.</p></div>

<div class="scn"><h4>Fifty tunnels down on a Monday</h4><p>On a Monday morning 50 branch tunnels using certificates failed at IKE_AUTH. The hub debug showed certificate validation failing with "CRL fetch failed". Over the weekend the web server hosting the CRL had been migrated to a new IP address, and the hub's cached CRL had expired. The team restored the CRL location, then added a second CRL distribution point and planned OCSP for the future.</p><p><b>Lesson:</b> revocation infrastructure is part of the VPN's availability. Monitor CRL validity and publish it redundantly.</p></div>

<div class="iv"><p class="q">"Walk me through enrolling a router certificate and how a peer validates it."</p><p>Strong answer: generate a key pair, configure a trustpoint with subject, SAN, key pair and revocation method, authenticate the CA by checking its fingerprint out of band, then enroll with SCEP, EST or manual CSR. The peer validates by building the chain to a trusted root, checking each signature, validity dates, usage extensions, the name against the expected identity, and revocation by CRL or OCSP. Mention NTP and renewal automation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PKI = root CA (offline, self-signed) plus issuing CAs plus end-entity certificates plus revocation.</li>
<li>The device keeps its private key and sends only a CSR; enrollment is manual, SCEP or EST.</li>
<li>CRL is a periodic list; OCSP is a real-time check; both must be reachable and redundant.</li>
<li>A trustpoint holds the CA certificate, enrollment method, key pair, subject and revocation settings.</li>
<li>IOS uses crypto pki commands; ASA uses crypto ca; always configure NTP first.</li>
</ul></div>
`,hi:`
<p>Socho Bharat passports kaise issue karta hai. Ministry (root of trust) har passport khud nahi chhaapti; woh regional passport offices ko authorise karti hai, jo citizens ko passports issue karte hain. Duniya bhar ke airports Ministry par trust karte hain, isliye uske regional offices ke kisi bhi passport par trust karte hain. Jab passport kho jaata hai ya cancel hota hai, woh ek list par chala jaata hai jise immigration check karta hai. Authorities, documents, rules aur cancellation lists ka yeh poora system hi certificates ke liye <b>public key infrastructure (PKI)</b> hai.</p>

<h3>CA hierarchy</h3>
<dl class="terms">
<dt>Root CA</dt><dd>Trust ka sabse upar ka hissa. Iska certificate <b>self-signed</b> hota hai (issuer aur subject same) aur devices par <b>trust anchor</b> ki tarah install hota hai. Best practice root ko <b>offline</b> rakhti hai, sirf intermediate CAs sign karne ya CRL publish karne ke liye on hota hai.</dd>
<dt>Intermediate (subordinate, issuing) CA</dt><dd>Root se signed, aur device aur user certificates sign karne ka roz ka kaam karti hai. Agar yeh compromise ho, to aap ise root par revoke karte ho, bina har device par root badle.</dd>
<dt>End-entity certificate</dt><dd>Router, firewall, server ya user certificate jisme Basic Constraints CA:FALSE hota hai.</dd>
<dt>Registration authority (RA)</dt><dd>Optional front end jo CA ke sign karne se pehle requests check karta hai, jaise BYOD phones ke liye SCEP RA ki tarah kaam karne wala ISE.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="CA hierarchy aur chain of trust">
<rect x="230" y="10" width="180" height="44" rx="8" fill="#fde68a"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">NK-Root-CA</text><text x="320" y="46" text-anchor="middle" class="svg-muted" font-size="12">self-signed, offline</text>
<rect x="230" y="100" width="180" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">NK-Issuing-CA</text><text x="320" y="136" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.50, online</text>
<line x1="320" y1="54" x2="320" y2="100" stroke="#64748b" stroke-width="2"/><text x="330" y="82" class="svg-accent" font-size="12">sign karti hai</text>
<rect x="30" y="200" width="140" height="44" rx="8" fill="#bae6fd"/><text x="100" y="220" text-anchor="middle" class="svg-ink" font-size="13">R1.nk.example</text><text x="100" y="236" text-anchor="middle" class="svg-muted" font-size="12">CA:FALSE</text>
<rect x="250" y="200" width="140" height="44" rx="8" fill="#bae6fd"/><text x="320" y="220" text-anchor="middle" class="svg-ink" font-size="13">R2.nk.example</text><text x="320" y="236" text-anchor="middle" class="svg-muted" font-size="12">CA:FALSE</text>
<rect x="470" y="200" width="140" height="44" rx="8" fill="#bae6fd"/><text x="540" y="220" text-anchor="middle" class="svg-ink" font-size="13">vpn.nk.example</text><text x="540" y="236" text-anchor="middle" class="svg-muted" font-size="12">ASA1 identity</text>
<line x1="280" y1="144" x2="100" y2="200" stroke="#64748b"/><line x1="320" y1="144" x2="320" y2="200" stroke="#64748b"/><line x1="360" y1="144" x2="540" y2="200" stroke="#64748b"/>
<text x="320" y="264" text-anchor="middle" class="svg-accent" font-size="12">Validation upar chalti hai: device cert, issuing CA, trusted root</text>
</svg><p class="cap">Is module mein use hone wali two-tier PKI. Devices root par trust karte hain; issuing CA unke certificates sign karti hai.</p></div>

<h3>Certificate lena: CSR aur enrollment</h3>
<ol>
<li>Device apna key pair khud generate karta hai. Private key kabhi use nahi chhodti.</li>
<li>Woh ek <b>CSR</b> (certificate signing request, PKCS#10) banata hai jisme uska subject name, SAN aur public key hoti hai, aur key ka owner hone ka saboot dene ke liye CSR ko apni private key se sign karta hai.</li>
<li>CA request check karti hai, validity dates, serial number aur extensions jodti hai, aur certificate sign karti hai.</li>
<li>Device apna certificate aur CA chain install karta hai.</li>
</ol>
<table class="cmp"><tr><th>Enrollment method</th><th>Kaise</th><th>Kab use karein</th></tr>
<tr><td><b>Manual (terminal / copy-paste)</b></td><td>Device PEM CSR print karta hai; admin submit karta hai; admin wapas aaya certificate paste karta hai</td><td>Kam devices, public CA, CA tak network path nahi</td></tr>
<tr><td><b>SCEP</b> (simple certificate enrollment protocol)</td><td>Device one-time challenge password ke saath HTTP par CA ya RA se baat karta hai</td><td>Scale par routers, firewalls, MDM aur ISE BYOD; bahut supported</td></tr>
<tr><td><b>EST</b> (enrollment over secure transport)</td><td>Mutual authentication ke saath TLS par enrollment; re-enrollment support karta hai</td><td>SCEP ka modern replacement; IoT, automation</td></tr>
</table>

<h3>Revocation: CRL aur OCSP</h3>
<table class="cmp"><tr><th></th><th>CRL</th><th>OCSP</th></tr>
<tr><td>Kya</td><td>CA ki publish ki hui revoked serial numbers ki signed list</td><td>OCSP responder se real-time sawaal "kya serial X theek hai?"</td></tr>
<tr><td>Freshness</td><td>Utni fresh jitna aakhri download (ghante ya din)</td><td>Lagbhag real time</td></tr>
<tr><td>Load</td><td>Badi lists, device par cache</td><td>Chhote queries, responder highly available hona chahiye</td></tr>
<tr><td>Extra</td><td>Location CRL distribution point extension mein</td><td>Location AIA mein; TLS "OCSP stapling" server ko jawab attach karne deta hai</td></tr>
</table>

<h3>IOS par trustpoints</h3>
<p><b>Trustpoint</b> ek CA relationship ke liye IOS ya ASA ka container hai: CA certificate, enroll kaise karein, kaunsa key pair use karein, kaunsa subject maangein aur revocation kaise check karein.</p>
<pre class="code"><span class="c">! certificates ko sahi time chahiye: pehle NTP configure karo</span>
R1(config)# ntp server 192.0.2.123
R1(config)# crypto key generate rsa modulus 2048 label R1-KEY
R1(config)# crypto pki trustpoint NK-CA
R1(ca-trustpoint)#  enrollment url h&#116;tp://192.0.2.50:80
R1(ca-trustpoint)#  subject-name CN=R1.nk.example,O=MyPnetLab Lab
R1(ca-trustpoint)#  subject-alt-name R1.nk.example
R1(ca-trustpoint)#  rsakeypair R1-KEY
R1(ca-trustpoint)#  revocation-check crl
R1(ca-trustpoint)#  auto-enroll 80 regenerate
R1(config)# crypto pki authenticate NK-CA
R1(config)# crypto pki enroll NK-CA</pre>
<pre class="out">R1(config)# crypto pki authenticate NK-CA
Certificate has the following attributes:
       Fingerprint MD5: 7C1A0E4B 9D2F6A31 C4E8B0D2 5F3A9E17
<span class="hl">      Fingerprint SHA1: 2B4D6F81 A3C5E7F9 1B3D5F7A 9C1E3A5B 7D9F1B3D</span>
% Do you accept this certificate? [yes/no]: yes
Trustpoint CA certificate accepted.
...
%PKI-6-CERTRET: Certificate received from Certificate Authority

R1# show crypto pki certificates NK-CA
Certificate
<span class="hl">  Status: Available</span>
  Certificate Serial Number (hex): 1A2B3C
  Certificate Usage: General Purpose
  Issuer:
    cn=NK-Issuing-CA
    o=MyPnetLab Lab
  Subject:
    Name: R1.nk.example
    cn=R1.nk.example
  Validity Date:
    start date: 09:15:02 UTC Sep 1 2026
<span class="hl">    end   date: 09:15:02 UTC Sep 1 2027</span>
  Associated Trustpoints: NK-CA</pre>
<p><code>authenticate</code> CA certificate install karta hai: fingerprint ko hamesha CA admin se phone ya trusted portal se mile fingerprint se compare karo. <code>enroll</code> CSR bhejta hai. <code>auto-enroll 80 regenerate</code> lifetime ke 80 percent par fresh key ke saath renew karta hai. URL ki jagah <code>enrollment terminal</code> ke saath, <code>crypto pki enroll</code> CSR print karta hai aur <code>crypto pki import NK-CA certificate</code> paste kiya result accept karta hai.</p>

<h3>ASA par trustpoints</h3>
<pre class="code">ASA1(config)# crypto key generate rsa label ASA-KEY modulus 2048
ASA1(config)# crypto ca trustpoint NK-CA
ASA1(config-ca-trustpoint)# enrollment terminal
ASA1(config-ca-trustpoint)# subject-name CN=vpn.nk.example,O=MyPnetLab Lab
ASA1(config-ca-trustpoint)# keypair ASA-KEY
ASA1(config-ca-trustpoint)# revocation-check ocsp
ASA1(config)# crypto ca authenticate NK-CA
ASA1(config)# crypto ca enroll NK-CA
ASA1(config)# crypto ca import NK-CA certificate</pre>
<p>ASA <code>crypto ca</code> use karta hai jahan IOS <code>crypto pki</code> use karta hai; ideas bilkul same hain. Threat Defense yahi kaam Management Center mein certificate enrollment objects ke through karta hai.</p>

<div class="eg"><p><b>Worked example.</b> ASA1 ka certificate 1 September 2026 ko ek saal ki life ke saath issue hua. IOS router par <code>auto-enroll 80</code> ke saath renewal 365 din ke 80 percent par shuru hota hai, lagbhag din 292, yaani 20 June 2027 ke aas-paas, jisse expiry se pehle renewal ki kisi bhi problem ko theek karne ke liye das hafte milte hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Jab device CRL location tak pahunch hi nahi sakta tab <code>revocation-check crl</code> enable karna. Tab certificate validation fail hota hai aur tunnels girte hain. Ya to CRL reachable banao, ya unreachable hone par fall back ke liye <code>revocation-check crl none</code> use karo, ya redundant responder ke saath OCSP use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> CSR mein sirf <b>public</b> key hoti hai. SCEP HTTP par chalta hai (iske messages andar PKCS#7 se protected hote hain), jabki EST TLS par chalta hai. OCSP real time hai; CRL periodically publish hone wali list hai.</p></div>

<div class="scn"><h4>Somvaar ko pachaas tunnels down</h4><p>Somvaar subah certificates use karne wale 50 branch tunnels IKE_AUTH par fail ho gaye. Hub debug ne dikhaya ki certificate validation "CRL fetch failed" ke saath fail ho rahi thi. Weekend mein CRL host karne wala web server naye IP address par migrate hua tha, aur hub ki cached CRL expire ho chuki thi. Team ne CRL location restore ki, phir doosra CRL distribution point joda aur future ke liye OCSP plan kiya.</p><p><b>Seekh:</b> revocation infrastructure VPN ki availability ka hissa hai. CRL validity monitor karo aur ise redundantly publish karo.</p></div>

<div class="iv"><p class="q">"Router certificate enroll karna aur peer use kaise validate karta hai, samjhao."</p><p>Strong answer: key pair generate karo, subject, SAN, key pair aur revocation method ke saath trustpoint configure karo, CA ka fingerprint out of band check karke use authenticate karo, phir SCEP, EST ya manual CSR se enroll karo. Peer trusted root tak chain banakar, har signature, validity dates, usage extensions, expected identity ke against naam, aur CRL ya OCSP se revocation check karke validate karta hai. NTP aur renewal automation mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PKI = root CA (offline, self-signed) plus issuing CAs plus end-entity certificates plus revocation.</li>
<li>Device apni private key rakhta hai aur sirf CSR bhejta hai; enrollment manual, SCEP ya EST hai.</li>
<li>CRL periodic list hai; OCSP real-time check hai; dono reachable aur redundant hone chahiye.</li>
<li>Trustpoint CA certificate, enrollment method, key pair, subject aur revocation settings rakhta hai.</li>
<li>IOS crypto pki commands use karta hai; ASA crypto ca; hamesha pehle NTP configure karo.</li>
</ul></div>
`}};export{e as default};