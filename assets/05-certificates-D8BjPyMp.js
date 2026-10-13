var e={id:`certificates`,h:{en:`Certificates and PKI: Cisco PKI and an enterprise root CA`,hi:`Certificates aur PKI: Cisco PKI aur enterprise root CA`},body:{en:`
<p>Passport control at an airport does not know you personally. It trusts the passport because a government that it trusts printed and signed it, and it can check the signature and the expiry date. Certificates work in the same way. Two SD-WAN devices that have never met can trust each other because each holds a certificate signed by an authority that both of them trust. If the authority is not trusted, the signature is bad or the date has passed, the officer says no and the control connection does not form.</p>

<h3>Four words you must own</h3>
<dl class="terms">
<dt>CA (certificate authority)</dt><dd>The trusted signer. It issues and signs certificates.</dd>
<dt>Root certificate</dt><dd>The CA's own certificate. Devices keep it as the anchor of trust. A chain may include intermediate CAs.</dd>
<dt>CSR (certificate signing request)</dt><dd>A request a device creates with its public key and identity, sent to a CA to be signed.</dd>
<dt>Device certificate</dt><dd>The signed result installed on the device. It carries the organization name and, for edges, the serial number.</dd>
</dl>

<h3>The signing flow</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Certificate signing flow">
<rect x="10" y="20" width="130" height="60" rx="10" fill="#bae6fd"/><text x="75" y="45" text-anchor="middle" class="svg-ink" font-size="12">1 Device makes</text><text x="75" y="62" text-anchor="middle" class="svg-ink" font-size="12">a CSR</text>
<rect x="165" y="20" width="130" height="60" rx="10" fill="#fde68a"/><text x="230" y="45" text-anchor="middle" class="svg-ink" font-size="12">2 CA checks</text><text x="230" y="62" text-anchor="middle" class="svg-ink" font-size="12">and signs</text>
<rect x="320" y="20" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="395" y="45" text-anchor="middle" class="svg-ink" font-size="12">3 Certificate is</text><text x="395" y="62" text-anchor="middle" class="svg-ink" font-size="12">installed</text>
<rect x="495" y="20" width="135" height="60" rx="10" fill="#ddd6fe"/><text x="562" y="45" text-anchor="middle" class="svg-ink" font-size="12">4 Root CA on</text><text x="562" y="62" text-anchor="middle" class="svg-ink" font-size="12">every device</text>
<path d="M140 50 L165 50 M295 50 L320 50 M470 50 L495 50" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="110" width="285" height="120" rx="12" fill="#f1f5f9"/><text x="172" y="134" text-anchor="middle" class="svg-ink" font-size="13">Cisco PKI</text><text x="172" y="156" text-anchor="middle" class="svg-muted" font-size="11">Cisco is the CA</text><text x="172" y="174" text-anchor="middle" class="svg-muted" font-size="11">Manager can request automatically</text><text x="172" y="192" text-anchor="middle" class="svg-muted" font-size="11">with the Smart Account</text><text x="172" y="214" text-anchor="middle" class="svg-ink" font-size="11">Least effort</text>
<rect x="335" y="110" width="285" height="120" rx="12" fill="#f1f5f9"/><text x="477" y="134" text-anchor="middle" class="svg-ink" font-size="13">Enterprise root CA</text><text x="477" y="156" text-anchor="middle" class="svg-muted" font-size="11">Your own CA signs the CSRs</text><text x="477" y="174" text-anchor="middle" class="svg-muted" font-size="11">Root certificate uploaded to the</text><text x="477" y="192" text-anchor="middle" class="svg-muted" font-size="11">Manager and installed everywhere</text><text x="477" y="214" text-anchor="middle" class="svg-ink" font-size="11">Full control of trust</text>
</svg><p class="cap">Whichever CA is used, the flow is the same: request, sign, install, and make the root trusted.</p></div>

<h3>Two ways to get controller certificates</h3>
<table class="cmp"><tr><th>Method</th><th>How it works</th><th>When to choose it</th></tr>
<tr><td>Cisco PKI</td><td>The Manager sends the CSRs to Cisco's CA using the Smart Account and Virtual Account credentials and installs what it receives. It can be automatic or manual.</td><td>Default choice; fastest; Cisco-hosted fabrics</td></tr>
<tr><td>Enterprise root CA</td><td>You create a CSR for each controller in the Manager, sign it with your own CA, then install the signed certificate. The root certificate chain must be installed on every controller and set in the Manager's settings.</td><td>Security policy requires the company to control trust; isolated networks</td></tr></table>

<h3>The steps for the Manager, Validator and Controller</h3>
<ol>
<li>In the Manager's administration settings, set the organization name and the Validator address, and choose the certificate authorisation method.</li>
<li>If you use an enterprise CA, upload its root certificate to the Manager in the same settings.</li>
<li>Add the Validator and the Controller to the Manager as controllers, giving their IP addresses and login details. The Manager can generate their CSRs.</li>
<li>Get each CSR signed: automatically by Cisco PKI, or by your CA for the enterprise method.</li>
<li>Install each signed certificate on its controller through the Manager.</li>
<li>For the enterprise method, install the root certificate chain on each controller, as the controllers must trust the CA that signed their peers.</li>
</ol>
<pre class="code"><span class="c">! Reference configuration: installing the root chain on a controller (enterprise CA)</span>
<span class="c">! The root file was copied to the controller beforehand</span>
request root-cert-chain install /home/admin/rootca.pem</pre>

<h3>Verifying certificates</h3>
<pre class="out">VSMART# show certificate installed
Certificate:
  <span class="hl">Subject: ... O=NK-LAB ...</span>
  Issuer:  ... CN=NK-LAB Root CA ...
  Validity:
    Not Before: Sep  1 08:00:00 2026 GMT
    <span class="hl">Not After : Sep  1 08:00:00 2027 GMT</span>
VSMART# show certificate root-ca-cert
VSMART# show control local-properties
organization-name            NK-LAB
certificate-status           <span class="hl">Installed</span>
root-ca-chain-status         <span class="hl">Installed</span>
certificate-validity         <span class="hl">Valid</span></pre>
<p>Three things matter in this output: the organization name inside the certificate subject, the validity dates, and the statuses of the certificate and of the root chain.</p>

<h3>Certificates on WAN edges</h3>
<p>Physical Cisco edges carry a certificate installed in manufacturing, which chains up to a Cisco root that the controllers already trust, so an edge arrives with a verifiable identity. Virtual edges do not have this, so they receive a certificate through Cisco PKI or from the enterprise CA, and they use a one-time token during onboarding. Chapter 6 explains how the authorised list uses the serial number from the certificate.</p>

<div class="eg"><p><b>Reading validity.</b> A Controller certificate has Not After of 1 September 2027. The team puts a reminder 60 days earlier to renew. Another controller was installed with the system clock on 1 January 2020 by mistake, so its certificate appeared not yet valid, and the peers rejected it. Fixing the clock fixed the connection without any change to certificates.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Signing controller CSRs with a CA but forgetting to install its root on the controllers; mixing certificates from two CAs without trusting both roots; letting certificates expire without a renewal reminder; wrong time on a controller; assuming that a valid certificate alone lets a device join.</p></div>

<div class="exam"><p><b>Exam traps.</b> Both sides verify certificates, so each must trust the other's CA. The enterprise method needs the root chain installed on controllers. Cisco PKI is the default and can be automatic. The certificate carries the organization name, and the organization name is checked too.</p></div>

<div class="scn"><h4>Renewal Friday</h4><p>The Validator certificate expired on a Friday evening. Existing control connections stayed up for a while, but each edge that restarted could not reconnect and branches began to drop one by one overnight. On Saturday morning the on-call engineer saw an expired date in the Validator certificate output, generated a new CSR, had it signed, installed it, and the edges recovered. The change plan added expiry alarms 90 days ahead.</p><p><b>Lesson:</b> certificates have a life. Track expiry like you track a licence.</p></div>

<div class="iv"><p class="q">"Explain how certificates are used in Catalyst SD-WAN."</p><p>Strong answer: each controller and each edge has a certificate signed by a CA that the others trust, either Cisco PKI or an enterprise CA. During the control connection each side checks the chain, the dates and the organization name. Mention the CSR flow, installing the root chain, and that edges additionally need to be on the authorised list. Add that expiry and clock errors are a common cause of failures.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Certificates let strangers trust each other through a common CA.</li>
<li>Choose Cisco PKI (easy, default) or an enterprise root CA (full control).</li>
<li>Flow: CSR, signing, installing, and a trusted root on every device.</li>
<li>Check subject, validity dates and the certificate and root-chain status.</li>
<li>A wrong clock or expired date breaks control connections.</li>
</ul></div>
`,hi:`
<p>Airport par passport control aapko vyaktigat roop se nahi jaanta. Woh passport par isliye bharosa karta hai kyunki jis sarkar par woh bharosa karta hai usne use chhapa aur sign kiya hai, aur woh signature aur expiry date check kar sakta hai. Certificates isi tarah kaam karte hain. Do SD-WAN devices jo kabhi mile nahi ek doosre par bharosa kar sakte hain kyunki dono ke paas aise authority ka signed certificate hai jis par dono bharosa karte hain. Agar authority trusted nahi hai, signature kharab hai ya date nikal chuki hai, to officer na kehta hai aur control connection nahi banta.</p>

<h3>Chaar shabd jo aapko aane chahiye</h3>
<dl class="terms">
<dt>CA (certificate authority)</dt><dd>Trusted signer. Woh certificates issue aur sign karta hai.</dd>
<dt>Root certificate</dt><dd>CA ka apna certificate. Devices ise trust ke anchor ke roop mein rakhte hain. Chain mein intermediate CAs bhi ho sakte hain.</dd>
<dt>CSR (certificate signing request)</dt><dd>Device apni public key aur identity ke saath jo request banata hai, sign hone ke liye CA ko bheji jaati hai.</dd>
<dt>Device certificate</dt><dd>Signed result jo device par install hota hai. Isme organization name aur edges ke liye serial number hota hai.</dd>
</dl>

<h3>Signing flow</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Certificate signing flow">
<rect x="10" y="20" width="130" height="60" rx="10" fill="#bae6fd"/><text x="75" y="45" text-anchor="middle" class="svg-ink" font-size="12">1 Device CSR</text><text x="75" y="62" text-anchor="middle" class="svg-ink" font-size="12">banata hai</text>
<rect x="165" y="20" width="130" height="60" rx="10" fill="#fde68a"/><text x="230" y="45" text-anchor="middle" class="svg-ink" font-size="12">2 CA check karke</text><text x="230" y="62" text-anchor="middle" class="svg-ink" font-size="12">sign karta hai</text>
<rect x="320" y="20" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="395" y="45" text-anchor="middle" class="svg-ink" font-size="12">3 Certificate</text><text x="395" y="62" text-anchor="middle" class="svg-ink" font-size="12">install hota hai</text>
<rect x="495" y="20" width="135" height="60" rx="10" fill="#ddd6fe"/><text x="562" y="45" text-anchor="middle" class="svg-ink" font-size="12">4 Har device par</text><text x="562" y="62" text-anchor="middle" class="svg-ink" font-size="12">root CA</text>
<path d="M140 50 L165 50 M295 50 L320 50 M470 50 L495 50" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="110" width="285" height="120" rx="12" fill="#f1f5f9"/><text x="172" y="134" text-anchor="middle" class="svg-ink" font-size="13">Cisco PKI</text><text x="172" y="156" text-anchor="middle" class="svg-muted" font-size="11">Cisco CA hai</text><text x="172" y="174" text-anchor="middle" class="svg-muted" font-size="11">Manager Smart Account se</text><text x="172" y="192" text-anchor="middle" class="svg-muted" font-size="11">automatically request kar sakta hai</text><text x="172" y="214" text-anchor="middle" class="svg-ink" font-size="11">Sabse kam mehnat</text>
<rect x="335" y="110" width="285" height="120" rx="12" fill="#f1f5f9"/><text x="477" y="134" text-anchor="middle" class="svg-ink" font-size="13">Enterprise root CA</text><text x="477" y="156" text-anchor="middle" class="svg-muted" font-size="11">Aapka apna CA CSRs sign karta hai</text><text x="477" y="174" text-anchor="middle" class="svg-muted" font-size="11">Root certificate Manager mein upload aur</text><text x="477" y="192" text-anchor="middle" class="svg-muted" font-size="11">har jagah install hota hai</text><text x="477" y="214" text-anchor="middle" class="svg-ink" font-size="11">Trust par poora control</text>
</svg><p class="cap">Chahe koi bhi CA ho, flow wahi hai: request, sign, install, aur root ko trusted banao.</p></div>

<h3>Controller certificates ke do tareeke</h3>
<table class="cmp"><tr><th>Method</th><th>Kaise kaam karta hai</th><th>Kab chunein</th></tr>
<tr><td>Cisco PKI</td><td>Manager CSRs ko Smart Account aur Virtual Account credentials se Cisco ke CA ko bhejta hai aur jo milta hai install karta hai. Automatic ya manual ho sakta hai.</td><td>Default choice; sabse tez; Cisco-hosted fabrics</td></tr>
<tr><td>Enterprise root CA</td><td>Aap Manager mein har controller ka CSR banate ho, apne CA se sign karate ho, phir signed certificate install karte ho. Root certificate chain har controller par install honi chahiye aur Manager ki settings mein set honi chahiye.</td><td>Security policy ke hisaab se company ko trust control karna ho; isolated networks</td></tr></table>

<h3>Manager, Validator aur Controller ke steps</h3>
<ol>
<li>Manager ki administration settings mein organization name aur Validator address set karo, aur certificate authorisation method chuno.</li>
<li>Agar enterprise CA use kar rahe ho to uska root certificate usi settings mein Manager par upload karo.</li>
<li>Validator aur Controller ko Manager mein controllers ke roop mein jodo, unke IP addresses aur login details dekar. Manager unke CSRs bana sakta hai.</li>
<li>Har CSR sign karao: Cisco PKI se automatically, ya enterprise method mein apne CA se.</li>
<li>Har signed certificate Manager ke through uske controller par install karo.</li>
<li>Enterprise method ke liye har controller par root certificate chain install karo, kyunki controllers ko us CA par bharosa karna hota hai jisne unke peers ko sign kiya.</li>
</ol>
<pre class="code"><span class="c">! Reference configuration: installing the root chain on a controller (enterprise CA)</span>
<span class="c">! The root file was copied to the controller beforehand</span>
request root-cert-chain install /home/admin/rootca.pem</pre>

<h3>Certificates verify karna</h3>
<pre class="out">VSMART# show certificate installed
Certificate:
  <span class="hl">Subject: ... O=NK-LAB ...</span>
  Issuer:  ... CN=NK-LAB Root CA ...
  Validity:
    Not Before: Sep  1 08:00:00 2026 GMT
    <span class="hl">Not After : Sep  1 08:00:00 2027 GMT</span>
VSMART# show certificate root-ca-cert
VSMART# show control local-properties
organization-name            NK-LAB
certificate-status           <span class="hl">Installed</span>
root-ca-chain-status         <span class="hl">Installed</span>
certificate-validity         <span class="hl">Valid</span></pre>
<p>Is output mein teen cheezein maayne rakhti hain: certificate subject ke andar organization name, validity dates, aur certificate aur root chain ke statuses.</p>

<h3>WAN edges par certificates</h3>
<p>Physical Cisco edges par manufacturing mein install kiya hua certificate hota hai, jo Cisco root tak chain banata hai jise controllers pehle se trust karte hain, isliye edge verifiable identity ke saath aata hai. Virtual edges ke paas yeh nahi hota, isliye unhe Cisco PKI ya enterprise CA se certificate milta hai, aur onboarding ke dauran woh one-time token use karte hain. Chapter 6 samjhata hai ki authorised list certificate ke serial number ko kaise use karti hai.</p>

<div class="eg"><p><b>Validity padhna.</b> Ek Controller certificate ka Not After 1 September 2027 hai. Team renew karne ke liye 60 din pehle ka reminder lagati hai. Ek aur controller galti se system clock 1 January 2020 par install hua, isliye uska certificate abhi valid nahi dikha aur peers ne use reject kar diya. Clock theek karne se certificates mein koi badlav kiye bina connection theek ho gaya.</p></div>

<div class="warn"><p><b>Common mistakes.</b> CA se controller CSRs sign karana par controllers par uska root install karna bhoolna; do CAs ke certificates mix karna bina dono roots ko trust kiye; renewal reminder ke bina certificates expire hone dena; controller par galat time; yeh maan lena ki sirf valid certificate se device join kar leta hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Dono sides certificates verify karte hain, isliye har ek ko doosre ke CA par trust karna hoga. Enterprise method mein controllers par root chain install chahiye. Cisco PKI default hai aur automatic ho sakta hai. Certificate organization name carry karta hai, aur organization name bhi check hota hai.</p></div>

<div class="scn"><h4>Renewal Friday</h4><p>Validator certificate Friday shaam ko expire ho gaya. Maujooda control connections kuch der chalte rahe, par jo bhi edge restart hua woh reconnect nahi kar saka aur raat bhar branches ek ek karke girne lagin. Saturday subah on-call engineer ne Validator certificate output mein expired date dekhi, naya CSR banaya, sign karaya, install kiya, aur edges recover ho gaye. Change plan mein 90 din pehle expiry alarms jode gaye.</p><p><b>Seekh:</b> certificates ki umar hoti hai. Expiry ko licence ki tarah track karo.</p></div>

<div class="iv"><p class="q">"Catalyst SD-WAN mein certificates ka use samjhao."</p><p>Strong answer: har controller aur har edge ke paas aise CA ka signed certificate hota hai jise baaki trust karte hain, Cisco PKI ya enterprise CA. Control connection ke dauran har side chain, dates aur organization name check karti hai. CSR flow, root chain install karna, aur yeh ki edges ko authorised list mein bhi hona zaroori hai, yeh batao. Jodo ki expiry aur clock errors failures ki aam wajah hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Certificates common CA ke zariye ajnabiyon ko ek doosre par trust karne dete hain.</li>
<li>Cisco PKI (aasan, default) ya enterprise root CA (poora control) chuno.</li>
<li>Flow: CSR, signing, installing, aur har device par trusted root.</li>
<li>Subject, validity dates aur certificate aur root-chain ka status check karo.</li>
<li>Galat clock ya expired date control connections tod deta hai.</li>
</ul></div>
`}};export{e as default};