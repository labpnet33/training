var e={id:`big-picture`,h:{en:`The endpoint is the battleground: the big picture`,hi:`Endpoint hi battleground hai: big picture`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to explain why endpoint and email security exist, compare antivirus, EPP, EDR and XDR, and run Cisco Secure Endpoint hands-on: read a connector's status, move a group from an Audit to a Protect policy, read a quarantine event, add a Simple Custom Detection and watch retrospection quarantine a file after the fact, isolate an infected host, and use device and file trajectory to find patient zero. You will finish with email: SPF, DKIM and DMARC, the Secure Email gateway pipeline, and Secure Email Threat Defense remediating a phishing campaign that was already delivered. This maps to the CCNP Security SCOR 350-701 domain on endpoint protection and detection, plus the email content security items.</p>

<p><b>Prerequisites.</b> You should already know the threat vocabulary from <i>Modern threats</i> (malware, phishing, ransomware, indicators of compromise, zero trust), hashing from <i>Cryptography and PKI</i> (what a SHA-256 is), and how a next-generation firewall inspects files from the <i>NGFW policies</i> module. No prior Secure Endpoint experience is needed.</p>

<h3>An analogy: the hospital, not the castle</h3>
<p>Old security thinking was a castle: a thick wall (the firewall) and everyone inside is trusted. Today the people inside the castle carry laptops home, open email from strangers and browse encrypted websites the wall cannot read. A better picture is a <b>hospital</b>. Every patient (endpoint) is checked at admission (posture), wears a wristband (inventory), is monitored all the time (EDR telemetry), can be moved to an isolation ward if infectious (host isolation), and the doctors keep a full chart of what happened and when (trajectory). When the lab sends a result two days later saying "that sample was dangerous", the hospital finds every patient who had contact with it (retrospection).</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Where an attack lands">
<rect x="10" y="20" width="130" height="50" rx="8" fill="#fed7aa"/><text x="75" y="42" text-anchor="middle" class="svg-ink" font-size="13">Phishing email</text><text x="75" y="60" text-anchor="middle" class="svg-muted" font-size="12">delivery</text>
<rect x="170" y="20" width="130" height="50" rx="8" fill="#fde68a"/><text x="235" y="42" text-anchor="middle" class="svg-ink" font-size="13">User opens file</text><text x="235" y="60" text-anchor="middle" class="svg-muted" font-size="12">execution</text>
<rect x="330" y="20" width="130" height="50" rx="8" fill="#fde68a"/><text x="395" y="42" text-anchor="middle" class="svg-ink" font-size="13">Persistence</text><text x="395" y="60" text-anchor="middle" class="svg-muted" font-size="12">registry, task</text>
<rect x="490" y="20" width="140" height="50" rx="8" fill="#fed7aa"/><text x="560" y="42" text-anchor="middle" class="svg-ink" font-size="13">C2 and spread</text><text x="560" y="60" text-anchor="middle" class="svg-muted" font-size="12">beacon, lateral</text>
<line x1="140" y1="45" x2="170" y2="45" stroke="#64748b" stroke-width="2"/><line x1="300" y1="45" x2="330" y2="45" stroke="#64748b" stroke-width="2"/><line x1="460" y1="45" x2="490" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="130" width="130" height="50" rx="8" fill="#bae6fd"/><text x="75" y="152" text-anchor="middle" class="svg-ink" font-size="13">Email security</text><text x="75" y="170" text-anchor="middle" class="svg-muted" font-size="12">SPF, DKIM, DMARC, ETD</text>
<rect x="170" y="130" width="290" height="50" rx="8" fill="#bbf7d0"/><text x="315" y="152" text-anchor="middle" class="svg-ink" font-size="13">Secure Endpoint (EPP + EDR)</text><text x="315" y="170" text-anchor="middle" class="svg-muted" font-size="12">engines, quarantine, trajectory, isolation</text>
<rect x="490" y="130" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="560" y="152" text-anchor="middle" class="svg-ink" font-size="13">Network + XDR</text><text x="560" y="170" text-anchor="middle" class="svg-muted" font-size="12">DFC, NGFW, correlation</text>
<line x1="75" y1="70" x2="75" y2="130" stroke="#64748b" stroke-dasharray="4 4"/><line x1="315" y1="70" x2="315" y2="130" stroke="#64748b" stroke-dasharray="4 4"/><line x1="560" y1="70" x2="560" y2="130" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="320" y="225" text-anchor="middle" class="svg-accent" font-size="13">Each stage of the attack has a control that can see it</text>
</svg><p class="cap">The typical attack chain (top) and the control that sees each stage (bottom). This module covers the first two columns in depth and previews the third.</p></div>

<h3>Why the endpoint needs its own protection</h3>
<p>An <b>endpoint</b> is any device a person works on that connects to your network or cloud: laptops, desktops, servers, phones, tablets, kiosks and point-of-sale terminals. Four facts make the endpoint the place where defence must happen:</p>
<ul>
<li><b>Attacks target people.</b> Most intrusions begin with a person opening an attachment or a link. The malicious code first runs on the endpoint, not on the firewall.</li>
<li><b>Encryption hides content from the network.</b> Most web and email traffic is TLS. A firewall that does not decrypt sees only "an HTTPS session". The endpoint sees the file after it is decrypted and written to disk.</li>
<li><b>Users roam.</b> A laptop on hotel Wi-Fi is outside every perimeter control. An agent on the device travels with it.</li>
<li><b>Only the endpoint knows the story.</b> Which process wrote which file, which parent launched it, which registry key it changed. That context is what an investigator needs.</li>
</ul>

<h3>The cast of this module</h3>
<dl class="terms">
<dt>Cisco Secure Endpoint</dt><dd>Cisco's cloud-managed EPP and EDR product, formerly called AMP for Endpoints. A <b>connector</b> on each computer protects locally and reports to the cloud console.</dd>
<dt>Secure Malware Analytics</dt><dd>Cisco's malware sandbox, formerly Threat Grid. It runs a suspicious file in an instrumented virtual machine and reports a threat score and behaviour indicators.</dd>
<dt>Cisco XDR</dt><dd>The platform that correlates endpoint, email, network and cloud telemetry into incidents. You meet it fully in a later module.</dd>
<dt>Secure Email (gateway) and Secure Email Threat Defense</dt><dd>The gateway (formerly ESA) filters mail in the SMTP path. Threat Defense connects to Microsoft 365 through its API and can remediate mail already in inboxes.</dd>
</dl>

<h3>Your lab environment</h3>
<p>Every lab uses the same small topology: one or more PCs (PC1 at 10.10.0.11, or PC-SALES, PC-HR and PC-FIN at .11, .12 and .13) behind switch SW and gateway GW (10.10.0.1), with a simulated internet host INET at 203.0.113.9. The SEC-CLOUD device is the console. On a PC, <code>secure-endpoint status</code> shows the connector, and <code>run &lt;file&gt;</code> executes a simulated sample. All samples are harmless lab markers with fixed SHA-256 values.</p>
<pre class="out">PC1&gt; secure-endpoint status
Cisco Secure Endpoint Connector 8.4.1
  Computer   : PC1
  Group      : Endpoints
<span class="hl">  Policy     : NK-Standard (audit)</span>
  Isolation  : Not isolated
  Quarantined: 0 file(s)</pre>
<p>You will learn to read every line of that output. For now, notice the most important word in it: <b>audit</b>. A policy in audit mode watches and logs, but does not stop anything.</p>

<div class="eg"><p><b>Worked example.</b> A 300-person company has a perimeter NGFW with file inspection. A user downloads a malicious installer over HTTPS from a site the firewall does not decrypt. The firewall sees 2.4 MB of encrypted bytes and allows them. The Secure Endpoint connector sees a new file written to the Downloads folder, computes its SHA-256 in milliseconds, asks the cloud for a verdict, and gets "Malicious". In Protect mode the file is quarantined before it executes. Without the endpoint layer, the first sign would have been encrypted files on a share.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking that an NGFW with file policy makes endpoint protection unnecessary, or the other way round. They see different things: the network sees traffic between hosts, the endpoint sees what runs. Defence in depth needs both, joined by XDR.</p></div>

<div class="exam"><p><b>Exam trap.</b> Expect "justify endpoint-based security" questions. The winning reasons are encrypted traffic, roaming users off the corporate network, and visibility into process and file behaviour. "Firewalls are slow" is never the answer.</p></div>

<div class="scn"><h4>The laptop that never came to the office</h4><p>A sales engineer worked from home for six weeks and only used a split-tunnel VPN for the CRM. Web traffic went straight to the internet, bypassing the office firewall and its file policy. A fake browser update was downloaded and run. The SOC only learned about it because the Secure Endpoint connector raised a Threat Detected event from the home network and the device appeared in the console with its full trajectory.</p><p><b>Lesson:</b> the endpoint agent is the one control that follows the user everywhere.</p></div>

<div class="iv"><p class="q">"Why do we need endpoint security if we already have a next-generation firewall?"</p><p>Strong answer: the firewall sees traffic, the endpoint sees execution. Most traffic is encrypted, users roam outside the perimeter, and only an endpoint agent knows the parent process, the file written and the registry key changed. Mention that the two share intelligence (the same SHA-256 dispositions) and that XDR correlates both.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An endpoint is any user or server device; it is where malicious code actually runs.</li>
<li>Encryption, roaming users and the need for process context justify endpoint security.</li>
<li>Secure Endpoint = connector on the device + cloud console; Secure Malware Analytics = sandbox; XDR = correlation.</li>
<li>Email is the most common delivery path, so email security is part of endpoint defence.</li>
<li>Audit mode logs, Protect mode stops: the first word to check in any endpoint ticket.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap samjha paoge ki endpoint aur email security kyun exist karti hai, antivirus, EPP, EDR aur XDR ko compare kar paoge, aur Cisco Secure Endpoint hands-on chala paoge: connector ka status padhna, ek group ko Audit se Protect policy par le jaana, quarantine event padhna, Simple Custom Detection add karna aur retrospection ko baad mein file quarantine karte dekhna, infected host ko isolate karna, aur device aur file trajectory se patient zero dhoondhna. Aap email ke saath khatam karoge: SPF, DKIM aur DMARC, Secure Email gateway pipeline, aur Secure Email Threat Defense jo pehle se deliver ho chuke phishing campaign ko remediate karta hai. Yeh CCNP Security SCOR 350-701 ke endpoint protection and detection domain aur email content security items se map hota hai.</p>

<p><b>Prerequisites.</b> Aapko <i>Modern threats</i> se threat vocabulary (malware, phishing, ransomware, indicators of compromise, zero trust), <i>Cryptography and PKI</i> se hashing (SHA-256 kya hai), aur <i>NGFW policies</i> module se next-generation firewall files kaise inspect karta hai, yeh pehle se pata hona chahiye. Secure Endpoint ka koi pehle ka experience zaroori nahi.</p>

<h3>Ek analogy: castle nahi, hospital</h3>
<p>Purani security soch ek castle thi: moti deewar (firewall) aur andar sab trusted. Aaj castle ke andar ke log laptop ghar le jaate hain, anjaan logon ki email kholte hain aur encrypted websites browse karte hain jo deewar padh nahi sakti. Behtar tasveer ek <b>hospital</b> hai. Har patient (endpoint) admission par check hota hai (posture), wristband pehenta hai (inventory), har waqt monitor hota hai (EDR telemetry), infectious ho to isolation ward mein bheja ja sakta hai (host isolation), aur doctors poora chart rakhte hain ki kya kab hua (trajectory). Jab do din baad lab result bhejti hai ki "woh sample khatarnak tha", hospital har us patient ko dhoondhta hai jo uske sampark mein aaya (retrospection).</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Attack kahan land hota hai">
<rect x="10" y="20" width="130" height="50" rx="8" fill="#fed7aa"/><text x="75" y="42" text-anchor="middle" class="svg-ink" font-size="13">Phishing email</text><text x="75" y="60" text-anchor="middle" class="svg-muted" font-size="12">delivery</text>
<rect x="170" y="20" width="130" height="50" rx="8" fill="#fde68a"/><text x="235" y="42" text-anchor="middle" class="svg-ink" font-size="13">User file kholta</text><text x="235" y="60" text-anchor="middle" class="svg-muted" font-size="12">execution</text>
<rect x="330" y="20" width="130" height="50" rx="8" fill="#fde68a"/><text x="395" y="42" text-anchor="middle" class="svg-ink" font-size="13">Persistence</text><text x="395" y="60" text-anchor="middle" class="svg-muted" font-size="12">registry, task</text>
<rect x="490" y="20" width="140" height="50" rx="8" fill="#fed7aa"/><text x="560" y="42" text-anchor="middle" class="svg-ink" font-size="13">C2 aur spread</text><text x="560" y="60" text-anchor="middle" class="svg-muted" font-size="12">beacon, lateral</text>
<line x1="140" y1="45" x2="170" y2="45" stroke="#64748b" stroke-width="2"/><line x1="300" y1="45" x2="330" y2="45" stroke="#64748b" stroke-width="2"/><line x1="460" y1="45" x2="490" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="130" width="130" height="50" rx="8" fill="#bae6fd"/><text x="75" y="152" text-anchor="middle" class="svg-ink" font-size="13">Email security</text><text x="75" y="170" text-anchor="middle" class="svg-muted" font-size="12">SPF, DKIM, DMARC, ETD</text>
<rect x="170" y="130" width="290" height="50" rx="8" fill="#bbf7d0"/><text x="315" y="152" text-anchor="middle" class="svg-ink" font-size="13">Secure Endpoint (EPP + EDR)</text><text x="315" y="170" text-anchor="middle" class="svg-muted" font-size="12">engines, quarantine, trajectory, isolation</text>
<rect x="490" y="130" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="560" y="152" text-anchor="middle" class="svg-ink" font-size="13">Network + XDR</text><text x="560" y="170" text-anchor="middle" class="svg-muted" font-size="12">DFC, NGFW, correlation</text>
<line x1="75" y1="70" x2="75" y2="130" stroke="#64748b" stroke-dasharray="4 4"/><line x1="315" y1="70" x2="315" y2="130" stroke="#64748b" stroke-dasharray="4 4"/><line x1="560" y1="70" x2="560" y2="130" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="320" y="225" text-anchor="middle" class="svg-accent" font-size="13">Attack ke har stage ko koi na koi control dekh sakta hai</text>
</svg><p class="cap">Typical attack chain (upar) aur har stage ko dekhne wala control (neeche). Yeh module pehle do columns detail mein cover karta hai aur teesre ka preview deta hai.</p></div>

<h3>Endpoint ko apni protection kyun chahiye</h3>
<p><b>Endpoint</b> koi bhi device hai jispar insaan kaam karta hai aur jo aapke network ya cloud se judta hai: laptops, desktops, servers, phones, tablets, kiosks aur point-of-sale terminals. Chaar facts endpoint ko woh jagah banate hain jahan defence hona hi chahiye:</p>
<ul>
<li><b>Attacks insaanon ko target karte hain.</b> Zyadatar intrusions tab shuru hote hain jab koi attachment ya link kholta hai. Malicious code sabse pehle endpoint par chalta hai, firewall par nahi.</li>
<li><b>Encryption network se content chhupata hai.</b> Zyadatar web aur email traffic TLS hai. Jo firewall decrypt nahi karta use sirf "ek HTTPS session" dikhta hai. Endpoint file ko decrypt hokar disk par likhne ke baad dekhta hai.</li>
<li><b>Users ghoomte hain.</b> Hotel Wi-Fi par laptop har perimeter control ke bahar hai. Device par agent uske saath travel karta hai.</li>
<li><b>Sirf endpoint poori kahani jaanta hai.</b> Kis process ne kaunsi file likhi, kis parent ne use launch kiya, kaunsi registry key badli. Investigator ko yahi context chahiye.</li>
</ul>

<h3>Is module ke kirdaar</h3>
<dl class="terms">
<dt>Cisco Secure Endpoint</dt><dd>Cisco ka cloud-managed EPP aur EDR product, pehle AMP for Endpoints kehlata tha. Har computer par ek <b>connector</b> locally protect karta hai aur cloud console ko report karta hai.</dd>
<dt>Secure Malware Analytics</dt><dd>Cisco ka malware sandbox, pehle Threat Grid. Yeh suspicious file ko instrumented virtual machine mein chalata hai aur threat score aur behaviour indicators report karta hai.</dd>
<dt>Cisco XDR</dt><dd>Woh platform jo endpoint, email, network aur cloud telemetry ko incidents mein correlate karta hai. Ise aap poori tarah ek baad wale module mein miloge.</dd>
<dt>Secure Email (gateway) aur Secure Email Threat Defense</dt><dd>Gateway (pehle ESA) SMTP path mein mail filter karta hai. Threat Defense Microsoft 365 se uske API ke through judta hai aur pehle se inbox mein pade mail ko remediate kar sakta hai.</dd>
</dl>

<h3>Aapka lab environment</h3>
<p>Har lab same chhoti topology use karta hai: ek ya zyada PCs (PC1 10.10.0.11 par, ya PC-SALES, PC-HR aur PC-FIN .11, .12 aur .13 par) switch SW aur gateway GW (10.10.0.1) ke peeche, aur ek simulated internet host INET 203.0.113.9 par. SEC-CLOUD device console hai. PC par <code>secure-endpoint status</code> connector dikhata hai, aur <code>run &lt;file&gt;</code> ek simulated sample execute karta hai. Saare samples harmless lab markers hain jinke fixed SHA-256 values hain.</p>
<pre class="out">PC1&gt; secure-endpoint status
Cisco Secure Endpoint Connector 8.4.1
  Computer   : PC1
  Group      : Endpoints
<span class="hl">  Policy     : NK-Standard (audit)</span>
  Isolation  : Not isolated
  Quarantined: 0 file(s)</pre>
<p>Aap is output ki har line padhna seekhoge. Abhi ke liye, usmein sabse important shabd notice karo: <b>audit</b>. Audit mode wali policy dekhti hai aur log karti hai, par kuch rokti nahi.</p>

<div class="eg"><p><b>Worked example.</b> 300 logon ki company ke paas file inspection wala perimeter NGFW hai. Ek user aisi site se HTTPS par malicious installer download karta hai jise firewall decrypt nahi karta. Firewall ko 2.4 MB encrypted bytes dikhte hain aur woh allow kar deta hai. Secure Endpoint connector Downloads folder mein nayi file likhi jaati dekhta hai, milliseconds mein uska SHA-256 nikaalta hai, cloud se verdict poochta hai, aur "Malicious" milta hai. Protect mode mein file execute hone se pehle quarantine ho jaati hai. Endpoint layer ke bina pehla sign share par encrypted files hota.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki file policy wala NGFW endpoint protection ko bekaar bana deta hai, ya ulta. Dono alag cheezein dekhte hain: network hosts ke beech traffic dekhta hai, endpoint dekhta hai ki kya chalta hai. Defence in depth ko dono chahiye, XDR se jude hue.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Endpoint-based security ko justify karo" wale questions expect karo. Jeetne wale reasons hain encrypted traffic, corporate network ke bahar roaming users, aur process aur file behaviour mein visibility. "Firewalls slow hain" kabhi answer nahi hota.</p></div>

<div class="scn"><h4>Woh laptop jo kabhi office nahi aaya</h4><p>Ek sales engineer ne chhe hafte ghar se kaam kiya aur sirf CRM ke liye split-tunnel VPN use kiya. Web traffic seedha internet gaya, office firewall aur uski file policy ko bypass karke. Ek nakli browser update download hokar chala. SOC ko iske baare mein sirf isliye pata chala kyunki Secure Endpoint connector ne home network se Threat Detected event uthaya aur device console mein apni poori trajectory ke saath dikhi.</p><p><b>Seekh:</b> endpoint agent hi woh ek control hai jo user ke saath har jagah jaata hai.</p></div>

<div class="iv"><p class="q">"Agar hamare paas pehle se next-generation firewall hai to endpoint security kyun chahiye?"</p><p>Strong answer: firewall traffic dekhta hai, endpoint execution dekhta hai. Zyadatar traffic encrypted hai, users perimeter ke bahar ghoomte hain, aur sirf endpoint agent parent process, likhi gayi file aur badli gayi registry key jaanta hai. Mention karo ki dono intelligence share karte hain (same SHA-256 dispositions) aur XDR dono ko correlate karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Endpoint koi bhi user ya server device hai; wahi jagah hai jahan malicious code asal mein chalta hai.</li>
<li>Encryption, roaming users aur process context ki zaroorat endpoint security ko justify karte hain.</li>
<li>Secure Endpoint = device par connector + cloud console; Secure Malware Analytics = sandbox; XDR = correlation.</li>
<li>Email sabse common delivery path hai, isliye email security endpoint defence ka hissa hai.</li>
<li>Audit mode log karta hai, Protect mode rokta hai: kisi bhi endpoint ticket mein check karne wala pehla shabd.</li>
</ul></div>
`}};export{e as default};