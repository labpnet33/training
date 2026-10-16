var e={id:`overview`,h:{en:`SSL/SSH inspection: what you will learn and the big picture`,hi:`SSL/SSH inspection: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> Most internet traffic today is encrypted with TLS (still commonly called SSL). Encryption protects users, but it also blinds the security engines you met in the previous module. In this module you learn how a FortiGate can look inside encrypted sessions: the difference between <b>certificate inspection</b> and <b>deep inspection</b>, how the FortiGate acts as a trusted intermediary using a <b>CA certificate</b>, how to configure <b>exemptions</b>, and, just as important, the <b>privacy, legal and performance</b> trade-offs. You will also learn the troubleshooting workflow for certificate warnings and broken applications. This maps to the SSL/SSH inspection objectives of the Fortinet NSE 4 / FortiOS Administrator 7.6 exam.</p>
<p><b>Prerequisites.</b> You should know the basics of security profiles (previous module <b>nse4-profiles</b>), and have a rough idea of what a certificate is. We refresh TLS from scratch in chapter 2.</p>

<div class="warn"><p><b>How this module is practised.</b> The simulator in this course does not run the SSL inspection engine. All configuration here is labelled <b>Reference configuration (not run in the simulator)</b>: real FortiOS syntax to study and to try on a lab FortiGate or evaluation VM. The packet-path and policy tools that the simulator does run are practised in <b>nse4-policy</b> and <b>nse4-diag</b>, and related inspection ideas on other platforms are in <b>sec-ftd-ips</b> (decryption) and <b>sec-visibility</b>.</p></div>

<h3>Analogy: the sealed parcel at customs</h3>
<p>Imagine a courier company delivering sealed parcels to your office. The courier writes the destination on the outside, and a customs officer can read the label (<b>certificate inspection</b>: who is the sender and receiver, is the label genuine?). But if customs must check what is inside, it must open the parcel, inspect it, and reseal it with its own tape (<b>deep inspection</b>). That raises serious questions. Who gave customs permission to open private parcels? Should a parcel from your bank or doctor ever be opened? What if the recipient only accepts parcels sealed by the original sender (<b>certificate pinning</b>)? Opening and resealing also takes time (<b>performance</b>). The same questions, in the same order, run through this module.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Deep inspection path">
<rect x="20" y="25" width="185" height="70" rx="10" fill="#bae6fd"/><text x="112.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Client</text><text x="112.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">browser or app</text><line x1="205" y1="60" x2="227" y2="60" stroke="#64748b" stroke-width="2"/><path d="M221 55 L227 60 L221 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="227" y="25" width="185" height="70" rx="10" fill="#bbf7d0"/><text x="319.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">FortiGate</text><text x="319.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">inspects, re-signs</text><line x1="412" y1="60" x2="434" y2="60" stroke="#64748b" stroke-width="2"/><path d="M428 55 L434 60 L428 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="434" y="25" width="185" height="70" rx="10" fill="#ddd6fe"/><text x="526.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Server</text><text x="526.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">the real website</text>
</svg><p class="cap">With deep inspection the FortiGate holds two TLS sessions: one to the client, one to the server.</p></div>

<h3>Why this matters now</h3>
<ul>
<li>The majority of web traffic is encrypted, and threats hide in encrypted downloads and command channels just as easily as legitimate content does.</li>
<li>Without inspection, the web filter sees only the host name, antivirus sees no files, IPS sees no payload, and application control relies on handshake hints.</li>
<li>With inspection, you gain visibility but you also take on responsibility: for user privacy, for law and policy, for key security of the inspection CA, and for CPU capacity.</li>
</ul>

<h3>The three inspection levels you will meet</h3>
<table class="cmp"><tr><th>Profile</th><th>What it does</th><th>User impact</th></tr>
<tr><td>no-inspection</td><td>Does not look at TLS at all; traffic passes</td><td>None, but engines are blind</td></tr>
<tr><td>certificate-inspection</td><td>Reads the handshake: server name and certificate</td><td>Almost none, no CA needed on clients</td></tr>
<tr><td>deep-inspection</td><td>Decrypts and re-encrypts the session</td><td>Clients must trust the FortiGate CA; some apps break</td></tr></table>

<div class="eg"><p><b>Worked example.</b> MyPnetLab Pune staff browse from 10.0.1.0/24 through <code>port2</code>. With certificate inspection the web filter can block <code>royal-casino.example</code> by its server name, but it cannot see which page on a legitimate site is requested and it cannot scan downloads. With deep inspection, antivirus can scan a download from a business site, and the web filter can apply path rules. For the staff banking portal <code>bank.example</code> the team will exempt the site, so the FortiGate never decrypts it.</p></div>

<div class="warn"><p><b>Common mistake.</b> Turning on deep inspection everywhere on day one. The result is a flood of certificate warnings on unmanaged devices, broken mobile applications that pin their certificates, a CPU spike, and an unhappy legal department. Plan scope, consent, CA distribution and exemptions first.</p></div>
<div class="exam"><p><b>Exam trap.</b> Certificate inspection does <b>not</b> decrypt traffic and does not require the FortiGate CA on clients. Deep inspection does decrypt and does require clients to trust the CA that signs the re-signed certificates.</p></div>

<div class="scn"><h4>The CEO's browser warning</h4><p>Within an hour of enabling deep inspection, the CEO's laptop showed a full-page certificate warning on every website. The laptop was personal and unmanaged: the FortiGate CA had never been installed. The helpdesk had to explain that the company must not bypass the warning silently. The team moved unmanaged devices to a guest policy with certificate inspection only, and rolled the CA out to managed devices through central management.</p><p><b>Lesson:</b> deep inspection is a program (policy, CA distribution, exemptions), not only a checkbox.</p></div>

<div class="iv"><p class="q">"What is the difference between certificate inspection and deep inspection?"</p><p>Certificate inspection reads only the TLS handshake (server name and certificate) without decrypting, so no CA is needed on clients, but content engines stay blind. Deep inspection acts as a man-in-the-middle by agreement: it terminates the session, inspects the plaintext with antivirus, IPS, web filter and application control, and re-encrypts with a certificate signed by the FortiGate CA, which clients must trust. It adds CPU cost and privacy and legal obligations.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Encryption blinds security profiles; SSL/SSH inspection restores visibility.</li>
<li>Three levels: no-inspection, certificate-inspection, deep-inspection.</li>
<li>Deep inspection needs the FortiGate CA trusted by clients.</li>
<li>Privacy, legal consent, exemptions and performance are part of the design.</li>
<li>Configuration in this module is reference only (not run in the simulator).</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aaj ka zyadatar internet traffic TLS se encrypted hota hai (jise abhi bhi aam taur par SSL kehte hain). Encryption users ko protect karta hai, lekin pichhle module ke security engines ko andha bhi kar deta hai. Is module mein aap seekhoge ki FortiGate encrypted sessions ke andar kaise dekh sakta hai: <b>certificate inspection</b> aur <b>deep inspection</b> ka difference, FortiGate <b>CA certificate</b> ke zariye trusted intermediary kaise banta hai, <b>exemptions</b> kaise configure hote hain, aur utna hi zaroori, <b>privacy, legal aur performance</b> trade-offs. Certificate warnings aur toote applications ka troubleshooting workflow bhi seekhoge. Yeh Fortinet NSE 4 / FortiOS Administrator 7.6 exam ke SSL/SSH inspection objectives se match karta hai.</p>
<p><b>Prerequisites.</b> Aapko security profiles ke basics aane chahiye (pichhla module <b>nse4-profiles</b>), aur certificate kya hota hai uska rough idea. TLS ko chapter 2 mein scratch se refresh karte hain.</p>

<div class="warn"><p><b>Yeh module practice kaise hota hai.</b> Is course ka simulator SSL inspection engine nahi chalata. Yahan ki saari configuration par <b>Reference configuration (not run in the simulator)</b> likha hai: real FortiOS syntax jise aap lab FortiGate ya evaluation VM par try karo. Jo packet-path aur policy tools simulator chalata hai unki practice <b>nse4-policy</b> aur <b>nse4-diag</b> mein hai, aur doosre platforms par related inspection ideas <b>sec-ftd-ips</b> (decryption) aur <b>sec-visibility</b> mein hain.</p></div>

<h3>Analogy: customs par sealed parcel</h3>
<p>Socho ek courier company aapke office ko sealed parcels deliver karti hai. Courier bahar destination likhta hai, aur customs officer label padh sakta hai (<b>certificate inspection</b>: sender aur receiver kaun hai, label asli hai?). Lekin customs ko andar check karna ho to parcel kholna padega, inspect karna padega, aur apni tape se wapas seal karna padega (<b>deep inspection</b>). Isse gambhir sawaal uthte hain. Customs ko private parcels kholne ki permission kisne di? Kya aapke bank ya doctor ka parcel kabhi kholna chahiye? Agar receiver sirf original sender ka seal kiya parcel accept kare (<b>certificate pinning</b>) to? Kholne aur wapas seal karne mein time bhi lagta hai (<b>performance</b>). Wahi sawaal, usi order mein, is module mein chalte hain.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Deep inspection path">
<rect x="20" y="25" width="185" height="70" rx="10" fill="#bae6fd"/><text x="112.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Client</text><text x="112.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">browser ya app</text><line x1="205" y1="60" x2="227" y2="60" stroke="#64748b" stroke-width="2"/><path d="M221 55 L227 60 L221 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="227" y="25" width="185" height="70" rx="10" fill="#bbf7d0"/><text x="319.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">FortiGate</text><text x="319.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">inspect, re-sign</text><line x1="412" y1="60" x2="434" y2="60" stroke="#64748b" stroke-width="2"/><path d="M428 55 L434 60 L428 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="434" y="25" width="185" height="70" rx="10" fill="#ddd6fe"/><text x="526.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Server</text><text x="526.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">asli website</text>
</svg><p class="cap">Deep inspection mein FortiGate do TLS sessions rakhta hai: ek client ke saath, ek server ke saath.</p></div>

<h3>Yeh abhi kyun zaroori hai</h3>
<ul>
<li>Web traffic ka zyadatar hissa encrypted hai, aur threats encrypted downloads aur command channels mein utni hi aasani se chhup sakte hain jitna legitimate content.</li>
<li>Inspection ke bina web filter sirf host name dekhta hai, antivirus ko files nahi dikhti, IPS ko payload nahi dikhta, aur application control handshake hints par depend karta hai.</li>
<li>Inspection ke saath visibility milti hai lekin zimmedari bhi: user privacy, law aur policy, inspection CA ki key security, aur CPU capacity ki.</li>
</ul>

<h3>Teen inspection levels jo milenge</h3>
<table class="cmp"><tr><th>Profile</th><th>Kya karta hai</th><th>User impact</th></tr>
<tr><td>no-inspection</td><td>TLS ko bilkul nahi dekhta; traffic pass</td><td>Koi nahi, par engines andhe</td></tr>
<tr><td>certificate-inspection</td><td>Handshake padhta hai: server name aur certificate</td><td>Lagbhag koi nahi, clients par CA nahi chahiye</td></tr>
<tr><td>deep-inspection</td><td>Session decrypt aur re-encrypt karta hai</td><td>Clients ko FortiGate CA trust karna hoga; kuch apps tootti hain</td></tr></table>

<div class="eg"><p><b>Worked example.</b> MyPnetLab Pune staff 10.0.1.0/24 se <code>port2</code> ke through browse karta hai. Certificate inspection ke saath web filter <code>royal-casino.example</code> ko server name se block kar sakta hai, lekin legitimate site par kaunsa page maanga gaya yeh nahi dekh sakta aur downloads scan nahi kar sakta. Deep inspection mein antivirus business site ki download scan kar sakta hai, aur web filter path rules laga sakta hai. Staff banking portal <code>bank.example</code> ke liye team site ko exempt karegi, taaki FortiGate use kabhi decrypt na kare.</p></div>

<div class="warn"><p><b>Common mistake.</b> Pehle din hi har jagah deep inspection on kar dena. Natija: unmanaged devices par certificate warnings ki baadh, certificates pin karne wali mobile applications ka tootna, CPU spike, aur naraaz legal department. Pehle scope, consent, CA distribution aur exemptions plan karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Certificate inspection traffic ko decrypt <b>nahi</b> karta aur clients par FortiGate CA ki zaroorat nahi hoti. Deep inspection decrypt karta hai aur clients ko woh CA trust karna padta hai jo re-signed certificates sign karta hai.</p></div>

<div class="scn"><h4>CEO ka browser warning</h4><p>Deep inspection enable karne ke ek ghante ke andar CEO ke laptop par har website par full-page certificate warning aane lagi. Laptop personal aur unmanaged tha: FortiGate CA kabhi install hi nahi hua tha. Helpdesk ko samjhana pada ki company warning ko chupchaap bypass nahi kar sakti. Team ne unmanaged devices ko sirf certificate inspection wali guest policy par move kiya, aur managed devices par central management se CA rollout kiya.</p><p><b>Lesson:</b> deep inspection ek program hai (policy, CA distribution, exemptions), sirf checkbox nahi.</p></div>

<div class="iv"><p class="q">"Certificate inspection aur deep inspection mein kya difference hai?"</p><p>Certificate inspection sirf TLS handshake (server name aur certificate) padhta hai, decrypt nahi karta, isliye clients par CA nahi chahiye, lekin content engines andhe rehte hain. Deep inspection agreement ke saath man-in-the-middle ki tarah kaam karta hai: session terminate karta hai, antivirus, IPS, web filter aur application control se plaintext inspect karta hai, aur FortiGate CA se sign kiye certificate se re-encrypt karta hai, jise clients ko trust karna hota hai. CPU cost aur privacy tatha legal obligations badhte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Encryption security profiles ko andha karta hai; SSL/SSH inspection visibility wapas deta hai.</li>
<li>Teen levels: no-inspection, certificate-inspection, deep-inspection.</li>
<li>Deep inspection ko clients dwara trusted FortiGate CA chahiye.</li>
<li>Privacy, legal consent, exemptions aur performance design ka hissa hain.</li>
<li>Is module ki configuration reference only hai (not run in the simulator).</li>
</ul></div>
`}};export{e as default};