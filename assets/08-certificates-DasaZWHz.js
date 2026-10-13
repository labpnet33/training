var e={id:`certificates`,h:{en:`Certificates, EAP-TLS, PKI and Onboard (concept)`,hi:`Certificates, EAP-TLS, PKI aur Onboard (concept)`},body:{en:`
<div class="note"><p><b>Not simulated in the lab.</b> The lab uses password-style 802.1X and MAC authentication with a simplified shared engine. Certificate stores, EAP-TLS, ClearPass Onboard and a PKI are real features that you must be able to explain, but you cannot configure them in the lab.</p></div>

<p>A passport has a photo, a stamp from a trusted government and an expiry date. A border officer does not know you; the officer trusts the <b>government that issued the passport</b>. A <b>digital certificate</b> is a passport for a device or a server: it carries an identity, a public key, a validity period and the signature of the <b>Certificate Authority (CA)</b> that issued it. Everything about certificates reduces to one question: <i>who does the verifier trust, and is this certificate still valid?</i></p>

<h3>Three different certificate jobs</h3>
<p>Beginners mix these up. They are separate certificates with separate owners:</p>
<dl class="terms">
<dt>GUI (HTTPS) certificate</dt><dd>Shown to an administrator browser, and to guests on the captive portal. If it is untrusted, people see a browser warning.</dd>
<dt>RADIUS/EAP server certificate</dt><dd>Presented by ClearPass to the <b>supplicant</b> inside the 802.1X TLS tunnel (PEAP or EAP-TLS). The supplicant must trust the issuing CA. If not, secure clients refuse to continue, or users are asked to accept it, which teaches bad habits.</dd>
<dt>Client certificate</dt><dd>Presented by the user or device to ClearPass for EAP-TLS. ClearPass must trust the CA that issued it.</dd>
</dl>
<p>In the real product the server certificates are managed under Administration &gt; Certificates &gt; Certificate Store, where each use (RADIUS/EAP, HTTPS, database and others) has its own certificate per node, and a Certificate Trust List holds the CAs ClearPass trusts for client and directory certificates. In a cluster every node needs its own certificate whose name matches that node.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="EAP-TLS trust both ways">
<rect x="20" y="70" width="170" height="90" rx="10" fill="#bae6fd"/><text x="105" y="95" text-anchor="middle" class="svg-ink" font-size="14">Client / supplicant</text><text x="105" y="117" text-anchor="middle" class="svg-muted" font-size="12">trusts: Corp Root CA</text><text x="105" y="137" text-anchor="middle" class="svg-muted" font-size="12">has: client certificate</text>
<rect x="450" y="70" width="170" height="90" rx="10" fill="#bbf7d0"/><text x="535" y="95" text-anchor="middle" class="svg-ink" font-size="14">ClearPass</text><text x="535" y="117" text-anchor="middle" class="svg-muted" font-size="12">trusts: Corp Root CA</text><text x="535" y="137" text-anchor="middle" class="svg-muted" font-size="12">has: server certificate</text>
<line x1="190" y1="95" x2="450" y2="95" stroke="#64748b" stroke-width="2"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="12">client certificate</text>
<line x1="450" y1="135" x2="190" y2="135" stroke="#64748b" stroke-width="2"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="12">server certificate</text>
<rect x="250" y="190" width="140" height="40" rx="8" fill="#fde68a"/><text x="320" y="215" text-anchor="middle" class="svg-ink" font-size="13">Corp Root CA</text>
<line x1="290" y1="190" x2="150" y2="160" stroke="#64748b" stroke-dasharray="4 3"/><line x1="350" y1="190" x2="490" y2="160" stroke="#64748b" stroke-dasharray="4 3"/>
</svg><p class="cap">In EAP-TLS both sides present certificates and both trust the same CA. Mutual trust replaces the password.</p></div>

<h3>PEAP versus EAP-TLS</h3>
<table class="cmp"><tr><th>Item</th><th>PEAP (MSCHAPv2)</th><th>EAP-TLS</th></tr>
<tr><td>Client credential</td><td>User name and password</td><td>Client certificate with private key</td></tr>
<tr><td>Server certificate</td><td>Required</td><td>Required</td></tr>
<tr><td>Client certificate</td><td>Not needed</td><td>Required</td></tr>
<tr><td>Main weakness</td><td>Password theft, fake servers if clients do not validate</td><td>Needs a PKI and a rollout process</td></tr>
<tr><td>Identity source</td><td>Directory or local user</td><td>Certificate attributes (CN, SAN), optionally the directory</td></tr></table>
<p>EAP-TLS is considered the strongest common 802.1X method because there is no password to phish, and a lost laptop can be blocked by revoking its certificate.</p>

<h3>PKI and ClearPass Onboard</h3>
<p>A <b>PKI</b> (public key infrastructure) is the whole system around certificates: a root CA (kept offline and protected), an issuing CA, enrolment, renewal and revocation. Many companies use a Microsoft CA with auto-enrolment for domain laptops. <b>ClearPass Onboard</b> is the ClearPass module that provisions BYOD devices: the user logs in through a portal, the device receives a profile with network settings and its own certificate, and from then on connects with EAP-TLS. Onboard can act as an internal CA or work with an external one. It needs its own licence and a captive portal, which are outside the lab.</p>

<h3>What ClearPass checks on a client certificate</h3>
<ol>
<li>The certificate chain leads to a CA in the trust list.</li>
<li>Dates: the certificate is within its validity period (this uses the clock of ClearPass).</li>
<li>Revocation: ClearPass can check a CRL or ask an OCSP responder, if configured.</li>
<li>Identity: the user or device name taken from a field such as the subject common name or the SAN, which becomes an attribute for the role mapping.</li>
</ol>
<p>Then authorization and enforcement continue exactly as before: role mapping and enforcement policy produce Aruba-User-Role. Only the identity proof changed.</p>
<pre class="out">Access Tracker - Summary (representative, not lab output)
Auth method        : EAP-TLS
Certificate subject: CN=laptop-0412.corp.example
Chain / validity   : trusted / valid until 2027-03-31
<span class="hl">Role             : ENGINEER</span>
Enforcement profile: EP-EMPLOYEE</pre>

<h3>The four classic certificate failures</h3>
<ul>
<li><b>Untrusted server certificate.</b> The supplicant does not trust the issuer of the ClearPass EAP certificate. Fix: distribute the CA to clients; do not tell users to click Accept.</li>
<li><b>Expired certificate.</b> Server or client. Track expiry dates with a calendar or monitoring.</li>
<li><b>Wrong clock.</b> A node with a clock in the past makes valid certificates look "not yet valid", and one in the future makes them look expired. Always check NTP before replacing certificates.</li>
<li><b>Name mismatch.</b> The name inside the certificate does not match the name the client expects for the server.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> The ClearPass RADIUS certificate expires on 31 March. On 1 April all laptops that validate the server show "certificate expired" and refuse to connect. The team installs the renewed certificate on every node in the cluster, and clients reconnect without any change. If the new certificate had been issued by a different CA, every client would also have needed the new CA in its trust store.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Replacing a certificate without checking which CA the clients trust. (2) Renewing on the publisher only and forgetting subscribers. (3) Using a self-signed certificate in production and teaching users to ignore warnings. (4) Mixing up the HTTPS certificate with the RADIUS/EAP certificate: renewing one does not fix the other.</p></div>

<div class="exam"><p><b>Exam trap.</b> EAP-TLS needs certificates on <b>both</b> sides; PEAP needs one on the server only. Revocation checking is not automatic: it needs a CRL or OCSP configuration.</p></div>

<div class="scn"><h4>The laptop fleet that stopped on 1 April</h4><p>A bank used PEAP with a server certificate from a private CA. The certificate had a one-year lifetime, and the reminder email went to an engineer who had left. On expiry day 1,800 laptops failed 802.1X. The Event Viewer and Access Tracker showed TLS errors. A new certificate was imported into every node under the same CA, and the issue disappeared within the hour. The team added an expiry dashboard and a shared mailbox for alerts.</p><p><b>Lesson:</b> certificates are an operational process, not a one-time task.</p></div>

<div class="iv"><p class="q">"Explain the difference between PEAP and EAP-TLS."</p><p>Strong answer: both build a TLS tunnel and both need a server certificate trusted by the client. PEAP then authenticates the user with a password (MSCHAPv2), so it needs a directory and is exposed to credential theft. EAP-TLS authenticates with a client certificate, so both ends use certificates and trust the same CA. It needs PKI and onboarding, but removes passwords and allows revocation. ClearPass role mapping and enforcement work the same afterwards.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A certificate proves identity through a CA signature; the verifier decides which CAs it trusts.</li>
<li>Keep the HTTPS, RADIUS/EAP and client certificates separate in your mind and in the process.</li>
<li>EAP-TLS uses certificates on both sides; PEAP uses a server certificate and a password.</li>
<li>ClearPass Onboard provisions BYOD devices with a certificate and profile; it is a licensed module.</li>
<li>Check clock, expiry, trust chain and names first when certificates fail. Not simulated in the lab.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Lab mein simulate nahi hota.</b> Lab simplified shared engine ke saath password-style 802.1X aur MAC authentication use karta hai. Certificate stores, EAP-TLS, ClearPass Onboard aur PKI real features hain jo aapko explain karne aane chahiye, par lab mein configure nahi kar sakte.</p></div>

<p>Passport par photo, kisi trusted government ki stamp aur expiry date hoti hai. Border officer aapko nahi jaanta; officer us <b>government par trust karta hai jisne passport issue kiya</b>. <b>Digital certificate</b> device ya server ka passport hai: usme identity, public key, validity period aur issue karne wali <b>Certificate Authority (CA)</b> ka signature hota hai. Certificates ki har baat ek sawaal par aati hai: <i>verifier kis par trust karta hai, aur kya yeh certificate abhi valid hai?</i></p>

<h3>Certificate ke teen alag kaam</h3>
<p>Beginners inhe mila dete hain. Yeh alag certificates hain jinke owners alag hain:</p>
<dl class="terms">
<dt>GUI (HTTPS) certificate</dt><dd>Administrator browser ko dikhaya jaata hai, aur captive portal par guests ko. Agar untrusted ho, to log browser warning dekhte hain.</dd>
<dt>RADIUS/EAP server certificate</dt><dd>ClearPass 802.1X TLS tunnel ke andar <b>supplicant</b> ko present karta hai (PEAP ya EAP-TLS). Supplicant ko issuing CA par trust karna chahiye. Nahi to secure clients aage badhne se mana kar dete hain, ya users se accept karne ko kaha jaata hai, jo buri aadat sikhata hai.</dd>
<dt>Client certificate</dt><dd>User ya device EAP-TLS ke liye ClearPass ko present karta hai. ClearPass ko us CA par trust hona chahiye jisne ise issue kiya.</dd>
</dl>
<p>Real product mein server certificates Administration &gt; Certificates &gt; Certificate Store mein manage hote hain, jahan har use (RADIUS/EAP, HTTPS, database aur doosre) ka har node par apna certificate hota hai, aur Certificate Trust List un CAs ko rakhti hai jin par ClearPass client aur directory certificates ke liye trust karta hai. Cluster mein har node ko apna certificate chahiye jiska naam us node se match kare.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="EAP-TLS dono taraf trust">
<rect x="20" y="70" width="170" height="90" rx="10" fill="#bae6fd"/><text x="105" y="95" text-anchor="middle" class="svg-ink" font-size="14">Client / supplicant</text><text x="105" y="117" text-anchor="middle" class="svg-muted" font-size="12">trust: Corp Root CA</text><text x="105" y="137" text-anchor="middle" class="svg-muted" font-size="12">paas: client certificate</text>
<rect x="450" y="70" width="170" height="90" rx="10" fill="#bbf7d0"/><text x="535" y="95" text-anchor="middle" class="svg-ink" font-size="14">ClearPass</text><text x="535" y="117" text-anchor="middle" class="svg-muted" font-size="12">trust: Corp Root CA</text><text x="535" y="137" text-anchor="middle" class="svg-muted" font-size="12">paas: server certificate</text>
<line x1="190" y1="95" x2="450" y2="95" stroke="#64748b" stroke-width="2"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="12">client certificate</text>
<line x1="450" y1="135" x2="190" y2="135" stroke="#64748b" stroke-width="2"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="12">server certificate</text>
<rect x="250" y="190" width="140" height="40" rx="8" fill="#fde68a"/><text x="320" y="215" text-anchor="middle" class="svg-ink" font-size="13">Corp Root CA</text>
<line x1="290" y1="190" x2="150" y2="160" stroke="#64748b" stroke-dasharray="4 3"/><line x1="350" y1="190" x2="490" y2="160" stroke="#64748b" stroke-dasharray="4 3"/>
</svg><p class="cap">EAP-TLS mein dono sides certificates present karte hain aur dono same CA par trust karte hain. Mutual trust password ki jagah leta hai.</p></div>

<h3>PEAP versus EAP-TLS</h3>
<table class="cmp"><tr><th>Item</th><th>PEAP (MSCHAPv2)</th><th>EAP-TLS</th></tr>
<tr><td>Client credential</td><td>User name aur password</td><td>Private key ke saath client certificate</td></tr>
<tr><td>Server certificate</td><td>Zaroori</td><td>Zaroori</td></tr>
<tr><td>Client certificate</td><td>Nahi chahiye</td><td>Zaroori</td></tr>
<tr><td>Main weakness</td><td>Password chori, clients validate na karein to fake servers</td><td>PKI aur rollout process chahiye</td></tr>
<tr><td>Identity source</td><td>Directory ya local user</td><td>Certificate attributes (CN, SAN), optionally directory</td></tr></table>
<p>EAP-TLS ko sabse strong common 802.1X method maana jaata hai kyunki phish karne ke liye koi password nahi hota, aur khoya hua laptop uska certificate revoke karke block kiya ja sakta hai.</p>

<h3>PKI aur ClearPass Onboard</h3>
<p><b>PKI</b> (public key infrastructure) certificates ke aas-paas ka poora system hai: root CA (offline aur protected), issuing CA, enrolment, renewal aur revocation. Bahut companies domain laptops ke liye auto-enrolment wala Microsoft CA use karti hain. <b>ClearPass Onboard</b> ClearPass ka module hai jo BYOD devices provision karta hai: user portal se login karta hai, device ko network settings wala profile aur apna certificate milta hai, aur uske baad EAP-TLS se connect hota hai. Onboard internal CA ki tarah kaam kar sakta hai ya external CA ke saath. Ise apna licence aur captive portal chahiye, jo lab ke bahar hain.</p>

<h3>ClearPass client certificate par kya check karta hai</h3>
<ol>
<li>Certificate chain trust list ke kisi CA tak jaati hai.</li>
<li>Dates: certificate validity period ke andar hai (yeh ClearPass ki clock use karta hai).</li>
<li>Revocation: ClearPass CRL check kar sakta hai ya OCSP responder se pooch sakta hai, agar configure ho.</li>
<li>Identity: user ya device ka naam subject common name ya SAN jaise field se liya jaata hai, jo role mapping ke liye attribute ban jaata hai.</li>
</ol>
<p>Uske baad authorization aur enforcement bilkul pehle jaise chalte hain: role mapping aur enforcement policy Aruba-User-Role banate hain. Sirf identity proof badla.</p>
<pre class="out">Access Tracker - Summary (representative, lab output nahi)
Auth method        : EAP-TLS
Certificate subject: CN=laptop-0412.corp.example
Chain / validity   : trusted / valid until 2027-03-31
<span class="hl">Role             : ENGINEER</span>
Enforcement profile: EP-EMPLOYEE</pre>

<h3>Chaar classic certificate failures</h3>
<ul>
<li><b>Untrusted server certificate.</b> Supplicant ClearPass EAP certificate ke issuer par trust nahi karta. Fix: CA clients tak distribute karo; users ko Accept click karne ko mat kaho.</li>
<li><b>Expired certificate.</b> Server ya client. Expiry dates ko calendar ya monitoring se track karo.</li>
<li><b>Galat clock.</b> Past ki clock wala node valid certificates ko "not yet valid" dikhata hai, aur future ki clock expired. Certificates badalne se pehle hamesha NTP check karo.</li>
<li><b>Name mismatch.</b> Certificate ke andar ka naam us naam se match nahi karta jo client server ke liye expect karta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> ClearPass RADIUS certificate 31 March ko expire hota hai. 1 April ko server validate karne wale saare laptops "certificate expired" dikhate hain aur connect hone se mana karte hain. Team renewed certificate cluster ke har node par install karti hai, aur clients bina kisi change ke reconnect ho jaate hain. Agar naya certificate kisi aur CA se issue hota, to har client ko apne trust store mein naya CA bhi chahiye hota.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Certificate badalna bina yeh check kiye ki clients kaunse CA par trust karte hain. (2) Sirf publisher par renew karna aur subscribers bhool jaana. (3) Production mein self-signed certificate use karna aur users ko warnings ignore karna sikhana. (4) HTTPS certificate ko RADIUS/EAP certificate se mila dena: ek renew karne se doosra theek nahi hota.</p></div>

<div class="exam"><p><b>Exam trap.</b> EAP-TLS ko <b>dono</b> sides par certificates chahiye; PEAP ko sirf server par. Revocation checking automatic nahi hai: iske liye CRL ya OCSP configuration chahiye.</p></div>

<div class="scn"><h4>1 April ko ruka laptop fleet</h4><p>Ek bank private CA ke server certificate ke saath PEAP use karti thi. Certificate ki lifetime ek saal thi, aur reminder email us engineer ko gaya jo company chhod chuka tha. Expiry ke din 1,800 laptops 802.1X mein fail hue. Event Viewer aur Access Tracker ne TLS errors dikhaye. Same CA ke neeche naya certificate har node mein import kiya gaya, aur problem ek ghante mein chali gayi. Team ne expiry dashboard aur alerts ke liye shared mailbox joda.</p><p><b>Seekh:</b> certificates ek operational process hain, one-time task nahi.</p></div>

<div class="iv"><p class="q">"PEAP aur EAP-TLS ka difference samjhao."</p><p>Strong answer: dono TLS tunnel banate hain aur dono ko client ke trusted server certificate chahiye. PEAP phir user ko password (MSCHAPv2) se authenticate karta hai, isliye directory chahiye aur credential theft ka risk hai. EAP-TLS client certificate se authenticate karta hai, isliye dono ends certificates use karte hain aur same CA par trust karte hain. Ise PKI aur onboarding chahiye, par passwords hata deta hai aur revocation deta hai. Uske baad ClearPass role mapping aur enforcement same kaam karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Certificate CA signature se identity prove karta hai; verifier decide karta hai ki kaunse CAs par trust karna hai.</li>
<li>HTTPS, RADIUS/EAP aur client certificates ko apne dimaag aur process mein alag rakho.</li>
<li>EAP-TLS dono sides par certificates use karta hai; PEAP server certificate aur password.</li>
<li>ClearPass Onboard BYOD devices ko certificate aur profile se provision karta hai; yeh licensed module hai.</li>
<li>Certificates fail hon to pehle clock, expiry, trust chain aur names check karo. Lab mein simulate nahi hota.</li>
</ul></div>
`}};export{e as default};