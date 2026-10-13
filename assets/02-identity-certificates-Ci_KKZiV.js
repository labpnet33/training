var e={id:`identity-certificates`,h:{en:`Identity: certificates, authentication and authorization of devices`,hi:`Identity: certificates, authentication aur devices ki authorization`},body:{en:`
<p>A fabric is only as trustworthy as the devices inside it. Catalyst SD-WAN answers three questions before it lets a device in: <b>who are you</b> (authentication), <b>are you allowed here</b> (authorization) and <b>is your identity still valid</b> (certificate lifecycle). This chapter explains each, in the order a new WAN Edge experiences them.</p>

<h3>Analogy: a staff ID card and a guest list</h3>
<p>A company gives each employee an ID card printed by a trusted office (a certificate signed by a certificate authority). At the gate the guard does two checks. First, is the card genuine and not expired? That is <b>authentication</b>. Second, is this person on today's list of people who may enter this building? That is <b>authorization</b>. A genuine card of someone who left the company must still be refused, so the guard also keeps a list of valid and revoked staff.</p>

<h3>Authentication: certificates and the organization name</h3>
<p>Every component presents a certificate during the DTLS or TLS handshake. Each side checks that the other certificate is signed by a root certificate it trusts, is within its validity period, and carries the same <b>organization name</b> as its own configuration. The organization name is a domain-wide setting (for example <code>bharat-retail.example</code>) configured on every device, and a mismatch stops the connection. The root certificate chain must be installed on every device so that each side can verify the other.</p>
<table class="cmp"><tr><th>Component</th><th>Where its certificate comes from</th></tr>
<tr><td>Controllers and Manager</td><td>Signed by a certificate authority you choose: Cisco's service for automated signing, or your <b>enterprise root CA</b></td></tr>
<tr><td>Hardware WAN Edge</td><td>Factory-installed device certificate tied to its serial number; optionally an enterprise certificate</td></tr>
<tr><td>Virtual WAN Edge (for example Catalyst 8000V)</td><td>Certificate issued after the device is added and a token or one-time password is used</td></tr></table>

<h3>Authorization: the list of valid devices</h3>
<p>Authentication proves the identity; <b>authorization</b> decides whether that identity may join. The Manager holds the <b>WAN Edge list</b> (Configuration, Devices). Each entry carries a chassis number and serial or token, and a validity state. The Manager sends the list of valid serial numbers to the Validator and the Controllers, and they accept connections only from devices on it.</p>
<table class="cmp"><tr><th>State on the list</th><th>Meaning</th></tr>
<tr><td><b>Valid</b></td><td>Device may establish control connections</td></tr>
<tr><td><b>Staging</b></td><td>Device may connect only to the Validator and Manager for onboarding in a staging area, not to the production Controllers</td></tr>
<tr><td><b>Invalid</b></td><td>Device is blocked; remove it to revoke access (for example a lost router)</td></tr></table>
<p>Controllers also authenticate to each other and to the Manager, so adding a rogue Controller is not possible without a certificate from your CA. This is a <b>zero-trust onboarding</b> model: a device that cannot show a valid identity and a place on the list never receives routes or policy.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Authentication then authorization of a WAN Edge">
<rect x="10" y="70" width="110" height="70" rx="10" fill="#bae6fd"/><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="14">New edge</text><text x="65" y="120" text-anchor="middle" class="svg-muted" font-size="11">certificate + serial</text>
<rect x="190" y="20" width="150" height="60" rx="8" fill="#fde68a"/><text x="265" y="46" text-anchor="middle" class="svg-ink" font-size="13">1 Authentication</text><text x="265" y="64" text-anchor="middle" class="svg-muted" font-size="11">CA chain, expiry, org name</text>
<rect x="190" y="130" width="150" height="60" rx="8" fill="#fde68a"/><text x="265" y="156" text-anchor="middle" class="svg-ink" font-size="13">2 Authorization</text><text x="265" y="174" text-anchor="middle" class="svg-muted" font-size="11">WAN Edge list: valid?</text>
<rect x="420" y="70" width="200" height="70" rx="10" fill="#bbf7d0"/><text x="520" y="100" text-anchor="middle" class="svg-ink" font-size="14">Controller admits edge</text><text x="520" y="120" text-anchor="middle" class="svg-muted" font-size="11">OMP and policy start</text>
<line x1="120" y1="95" x2="190" y2="55" stroke="#64748b" stroke-width="2"/><line x1="120" y1="115" x2="190" y2="160" stroke="#64748b" stroke-width="2"/><line x1="340" y1="55" x2="420" y2="95" stroke="#16a34a" stroke-width="2"/><line x1="340" y1="160" x2="420" y2="115" stroke="#16a34a" stroke-width="2"/>
</svg><p class="cap">Both checks must pass. A genuine certificate that is not on the list, or a listed device with an expired certificate, is refused.</p></div>

<h3>Certificate lifecycle</h3>
<p>Certificates expire. A fabric whose certificates expire silently will lose its control connections, which is a classic outage. Plan the lifecycle:</p>
<ol>
<li><b>Choose the authority</b> for Controllers: an enterprise CA gives you control of issuance and revocation; automated signing by the vendor is simpler.</li>
<li><b>Issue</b>: generate a certificate signing request (CSR) in Manager for each Controller, have it signed, and install it. Install the root chain on all devices.</li>
<li><b>Monitor expiry</b>: Manager shows certificate state and expiry. Set an alert well before the date, for example 90 days.</li>
<li><b>Renew</b> before expiry, in a maintenance window, one Controller at a time so the others keep serving.</li>
<li><b>Revoke</b>: set a lost or retired device to invalid on the WAN Edge list and push the list; revoke Controller certificates at the CA if compromised.</li>
</ol>
<p>On a device, <code>show sdwan control local-properties</code> shows the organization name, certificate validity and the serial. <code>show sdwan certificate installed</code>, <code>show sdwan certificate serial</code> and <code>show sdwan certificate validity</code> show the installed certificate details.</p>

<div class="eg"><p><b>Worked example.</b> Bharat Retail uses an enterprise root CA. A courier loses a spare router bound for the Nashik kiosk. The engineer opens the WAN Edge list in Manager, marks that chassis <b>invalid</b> and sends the list to the Controllers. The lost router, even though its factory certificate is genuine, can no longer join. For the Controllers, an alert 90 days before expiry triggers a planned renewal during the Sunday window.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Forgetting certificate expiry, which breaks the whole fabric on one date. (2) Different organization names on devices. (3) Leaving test devices in the valid state after the pilot. (4) Wrong clock: certificates look expired or not yet valid because the time is wrong; keep NTP healthy. (5) Renewing all Controllers simultaneously.</p></div>

<div class="exam"><p><b>Exam trap.</b> Authentication is certificate verification (chain, validity, organization name); authorization is the WAN Edge list of valid serial numbers pushed to Validator and Controllers. A device can pass one and fail the other.</p></div>

<div class="scn"><h4>New router never connects</h4><p>A new router for the Pune branch stays in the connect state. <code>show sdwan control connection-history</code> shows the reason CRTREJSER (challenge rejected by the peer). The engineer finds that the serial was never added to the WAN Edge list and the list had not been pushed to the Controllers. After adding it as valid and sending the list, the control connection came up.</p><p><b>Lesson:</b> certificate genuine is not enough; the device must also be authorized.</p></div>

<div class="iv"><p class="q">"How does SD-WAN decide whether a WAN Edge may join the fabric?"</p><p>Two steps. Authentication: during the DTLS or TLS handshake both sides verify certificates against the trusted root chain, the validity period and the organization name. Authorization: the Manager's WAN Edge list of valid serial numbers is distributed to the Validator and Controllers, which accept only listed devices. Marking a device invalid revokes it. I also monitor certificate expiry and keep NTP correct.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Authentication = certificate chain, validity, organization name; authorization = WAN Edge list.</li>
<li>States on the list: valid, staging, invalid.</li>
<li>Controller certificates come from vendor automated signing or an enterprise CA.</li>
<li>Plan expiry, renewal and revocation; keep NTP correct.</li>
<li>Check with <code>show sdwan control local-properties</code> and <code>show sdwan certificate ...</code>.</li>
</ul></div>
`,hi:`
<p>Fabric utna hi bharosemand hota hai jitne uske andar ke devices. Catalyst SD-WAN kisi device ko andar aane dene se pehle teen sawaal poochta hai: <b>tum kaun ho</b> (authentication), <b>kya tumhe yahan aane ki ijazat hai</b> (authorization), aur <b>kya tumhari identity ab bhi valid hai</b> (certificate lifecycle). Yeh chapter har ek ko, us order mein samjhata hai jisme ek naya WAN Edge unse guzarta hai.</p>

<h3>Analogy: staff ID card aur guest list</h3>
<p>Company har employee ko ek trusted office se chhapa ID card deti hai (certificate authority se signed certificate). Gate par guard do checks karta hai. Pehla, card asli hai aur expire nahi hua? Yeh <b>authentication</b> hai. Doosra, kya yeh vyakti aaj ki us list mein hai jo is building mein aa sakte hain? Yeh <b>authorization</b> hai. Company chhod chuke vyakti ka asli card bhi refuse hona chahiye, isliye guard valid aur revoked staff ki list bhi rakhta hai.</p>

<h3>Authentication: certificates aur organization name</h3>
<p>Har component DTLS ya TLS handshake mein certificate dikhata hai. Har side check karta hai ki doosra certificate kisi trusted root certificate se signed hai, validity period ke andar hai, aur uski apni configuration jaisa <b>organization name</b> rakhta hai. Organization name domain-wide setting hai (jaise <code>bharat-retail.example</code>) jo har device par configure hoti hai, aur mismatch connection rok deta hai. Root certificate chain har device par installed honi chahiye taaki har side doosre ko verify kar sake.</p>
<table class="cmp"><tr><th>Component</th><th>Certificate kahan se aata hai</th></tr>
<tr><td>Controllers aur Manager</td><td>Aapke chune certificate authority se signed: automated signing ke liye Cisco ki service, ya aapka <b>enterprise root CA</b></td></tr>
<tr><td>Hardware WAN Edge</td><td>Serial number se bandha factory-installed device certificate; optionally enterprise certificate</td></tr>
<tr><td>Virtual WAN Edge (jaise Catalyst 8000V)</td><td>Device add karne aur token ya one-time password use karne ke baad issue hua certificate</td></tr></table>

<h3>Authorization: valid devices ki list</h3>
<p>Authentication identity saabit karta hai; <b>authorization</b> tay karta hai ki woh identity judi ja sakti hai ya nahi. Manager ke paas <b>WAN Edge list</b> hoti hai (Configuration, Devices). Har entry mein chassis number, serial ya token, aur validity state hota hai. Manager valid serial numbers ki list Validator aur Controllers ko bhejta hai, aur woh sirf listed devices ke connections accept karte hain.</p>
<table class="cmp"><tr><th>List par state</th><th>Matlab</th></tr>
<tr><td><b>Valid</b></td><td>Device control connections bana sakta hai</td></tr>
<tr><td><b>Staging</b></td><td>Device sirf Validator aur Manager se staging area mein onboarding ke liye connect ho sakta hai, production Controllers se nahi</td></tr>
<tr><td><b>Invalid</b></td><td>Device block hai; access revoke karne ke liye (jaise khoya hua router) use invalid karo</td></tr></table>
<p>Controllers bhi ek doosre aur Manager ko authenticate karte hain, isliye aapke CA ke certificate ke bina rogue Controller jodna possible nahi. Yeh <b>zero-trust onboarding</b> model hai: jo device valid identity aur list mein jagah nahi dikha sakta use kabhi routes ya policy nahi milti.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="WAN Edge ki authentication phir authorization">
<rect x="10" y="70" width="110" height="70" rx="10" fill="#bae6fd"/><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="14">Naya edge</text><text x="65" y="120" text-anchor="middle" class="svg-muted" font-size="11">certificate + serial</text>
<rect x="190" y="20" width="150" height="60" rx="8" fill="#fde68a"/><text x="265" y="46" text-anchor="middle" class="svg-ink" font-size="13">1 Authentication</text><text x="265" y="64" text-anchor="middle" class="svg-muted" font-size="11">CA chain, expiry, org name</text>
<rect x="190" y="130" width="150" height="60" rx="8" fill="#fde68a"/><text x="265" y="156" text-anchor="middle" class="svg-ink" font-size="13">2 Authorization</text><text x="265" y="174" text-anchor="middle" class="svg-muted" font-size="11">WAN Edge list: valid?</text>
<rect x="420" y="70" width="200" height="70" rx="10" fill="#bbf7d0"/><text x="520" y="100" text-anchor="middle" class="svg-ink" font-size="14">Controller edge ko admit karta hai</text><text x="520" y="120" text-anchor="middle" class="svg-muted" font-size="11">OMP aur policy shuru</text>
<line x1="120" y1="95" x2="190" y2="55" stroke="#64748b" stroke-width="2"/><line x1="120" y1="115" x2="190" y2="160" stroke="#64748b" stroke-width="2"/><line x1="340" y1="55" x2="420" y2="95" stroke="#16a34a" stroke-width="2"/><line x1="340" y1="160" x2="420" y2="115" stroke="#16a34a" stroke-width="2"/>
</svg><p class="cap">Dono checks pass hone chahiye. List mein na hone wala asli certificate, ya expired certificate wala listed device, refuse hota hai.</p></div>

<h3>Certificate lifecycle</h3>
<p>Certificates expire hote hain. Jis fabric ke certificates chupchap expire ho jaayein uske control connections toot jaate hain, jo classic outage hai. Lifecycle plan karo:</p>
<ol>
<li>Controllers ke liye <b>authority chuno</b>: enterprise CA issuance aur revocation par control deta hai; vendor ki automated signing simple hai.</li>
<li><b>Issue</b>: Manager mein har Controller ke liye certificate signing request (CSR) banao, sign karwao aur install karo. Root chain saare devices par install karo.</li>
<li><b>Expiry monitor karo</b>: Manager certificate state aur expiry dikhata hai. Date se kaafi pehle alert lagao, jaise 90 din.</li>
<li>Expiry se pehle, maintenance window mein, ek ek Controller karke <b>renew</b> karo taaki baaki serve karte rahein.</li>
<li><b>Revoke</b>: khoye ya retired device ko WAN Edge list par invalid karo aur list push karo; compromised hone par Controller certificates CA par revoke karo.</li>
</ol>
<p>Device par <code>show sdwan control local-properties</code> organization name, certificate validity aur serial dikhata hai. <code>show sdwan certificate installed</code>, <code>show sdwan certificate serial</code> aur <code>show sdwan certificate validity</code> installed certificate ki details dikhate hain.</p>

<div class="eg"><p><b>Worked example.</b> Bharat Retail enterprise root CA use karta hai. Courier se Nashik kiosk ka ek spare router kho jaata hai. Engineer Manager mein WAN Edge list kholkar us chassis ko <b>invalid</b> mark karta hai aur list Controllers ko bhejta hai. Khoya router, factory certificate asli hone ke bawajood, ab join nahi kar sakta. Controllers ke liye expiry se 90 din pehle ka alert Sunday window mein planned renewal trigger karta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Certificate expiry bhool jaana, jo ek date par poora fabric tod deta hai. (2) Devices par alag organization names. (3) Pilot ke baad test devices ko valid state mein chhod dena. (4) Galat clock: time galat hone se certificates expired ya not yet valid dikhte hain; NTP theek rakho. (5) Saare Controllers ek saath renew karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Authentication certificate verification hai (chain, validity, organization name); authorization Validator aur Controllers ko push ki gayi valid serial numbers ki WAN Edge list hai. Device ek mein pass aur doosre mein fail ho sakta hai.</p></div>

<div class="scn"><h4>Naya router kabhi connect nahi hota</h4><p>Pune branch ka naya router connect state mein atka hai. <code>show sdwan control connection-history</code> reason CRTREJSER (peer ne challenge reject kiya) dikhata hai. Engineer ko pata chalta hai ki serial WAN Edge list mein kabhi add hi nahi hua aur list Controllers ko push nahi hui thi. Valid ke roop mein add karke list bhejne ke baad control connection up aa gaya.</p><p><b>Lesson:</b> certificate asli hona kaafi nahi; device authorized bhi hona chahiye.</p></div>

<div class="iv"><p class="q">"SD-WAN kaise tay karta hai ki WAN Edge fabric mein jud sakta hai ya nahi?"</p><p>Do steps. Authentication: DTLS ya TLS handshake mein dono sides trusted root chain, validity period aur organization name ke against certificates verify karte hain. Authorization: Manager ki valid serial numbers ki WAN Edge list Validator aur Controllers ko distribute hoti hai, jo sirf listed devices accept karte hain. Device ko invalid mark karna use revoke karta hai. Main certificate expiry monitor karta hoon aur NTP sahi rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Authentication = certificate chain, validity, organization name; authorization = WAN Edge list.</li>
<li>List par states: valid, staging, invalid.</li>
<li>Controller certificates vendor ki automated signing ya enterprise CA se aate hain.</li>
<li>Expiry, renewal aur revocation plan karo; NTP sahi rakho.</li>
<li><code>show sdwan control local-properties</code> aur <code>show sdwan certificate ...</code> se check karo.</li>
</ul></div>
`}};export{e as default};