var e={id:`ztna-client`,h:{en:`Zero trust network access: resource connectors, private resources and client-based ZTNA`,hi:`Zero trust network access: resource connectors, private resources aur client-based ZTNA`},body:{en:`
<p>A VPN is like giving a visitor a key to the whole office building: once inside, they can try every door. <b>Zero trust network access (ZTNA)</b> is like a hotel key card programmed for one room, checked every time it is used, and cancelled the moment the guest checks out or the card is reported lost. The visitor never even learns where the other rooms are.</p>

<h3>VPN versus ZTNA</h3>
<table class="cmp"><tr><th></th><th>Remote access VPN</th><th>ZTNA</th></tr>
<tr><td>What the user gets</td><td>An IP address on the corporate network; can reach (and scan) everything the ACLs allow</td><td>One application at a time; other apps are not even resolvable</td></tr>
<tr><td>When access is decided</td><td>Once, at login</td><td>Per session and per request, with identity and device posture</td></tr>
<tr><td>Exposure</td><td>A VPN head-end listening on the internet</td><td>No inbound ports; connectors dial out</td></tr>
<tr><td>After a laptop is compromised</td><td>Lateral movement is easy</td><td>Limited to the allowed apps</td></tr>
</table>

<h3>The three objects you configure</h3>
<dl class="terms">
<dt>Connector group</dt><dd>A set of resource connectors in one location, with a <b>provisioning key</b> used to enrol each connector VM. Deploy at least two connectors per group so one can be patched while the other serves users.</dd>
<dt>Private resource</dt><dd>An internally reachable <b>address</b> and/or <b>FQDN</b>, the protocol and <b>ports</b>, and the <b>connector group</b> that can reach it. Optionally, browser-based access (chapter 10).</dd>
<dt>Private access rule</dt><dd>Users or groups, to private resources, with the <b>access methods</b> (client-based, browser-based) and <b>endpoint posture</b> required. Rules are top-down; below them <b>Default Private Access</b> always blocks.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Client-based ZTNA path">
<rect x="10" y="90" width="120" height="54" rx="8" fill="#bae6fd"/><text x="70" y="112" text-anchor="middle" class="svg-ink" font-size="12">ROAM1 (Asha)</text><text x="70" y="130" text-anchor="middle" class="svg-muted" font-size="11">ZTA module</text>
<rect x="210" y="80" width="170" height="74" rx="10" fill="#ddd6fe"/><text x="295" y="104" text-anchor="middle" class="svg-ink" font-size="12">Secure Access</text><text x="295" y="124" text-anchor="middle" class="svg-muted" font-size="11">rule: Finance to ERP</text><text x="295" y="142" text-anchor="middle" class="svg-muted" font-size="11">posture: Compliant</text>
<rect x="460" y="40" width="160" height="44" rx="8" fill="#fde68a"/><text x="540" y="60" text-anchor="middle" class="svg-ink" font-size="12">RC1 10.20.1.20</text><text x="540" y="76" text-anchor="middle" class="svg-muted" font-size="11">DC1-CONNECTORS</text>
<rect x="460" y="150" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="540" y="170" text-anchor="middle" class="svg-ink" font-size="12">ERP 10.20.1.50</text><text x="540" y="186" text-anchor="middle" class="svg-muted" font-size="11">erp.nwk.internal</text>
<line x1="130" y1="117" x2="210" y2="117" stroke="#64748b" stroke-width="2"/><text x="170" y="108" text-anchor="middle" class="svg-muted" font-size="11">QUIC</text>
<line x1="460" y1="62" x2="380" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="430" y="66" text-anchor="middle" class="svg-muted" font-size="11">outbound</text>
<line x1="540" y1="84" x2="540" y2="150" stroke="#64748b" stroke-width="2"/><text x="580" y="122" text-anchor="middle" class="svg-muted" font-size="11">TCP 80/443</text>
</svg><p class="cap">The user's session and the connector's outbound session meet inside Secure Access. The ERP sees traffic from RC1, never from the laptop.</p></div>

<h3>Client-based ZTNA on the laptop</h3>
<p>The <b>Zero Trust Access module</b> of Secure Client enrols the device: the user signs in with SAML, and the device receives a certificate (in the lab, ECDSA P-256 valid 7 days). After that the module intercepts traffic to private resources only, and carries it to Secure Access in modern QUIC-based (MASQUE) tunnels, falling back to TLS when UDP is blocked. Because it is a full client, it reports <b>full posture</b>: OS version, firewall, disk encryption and anti-malware. Enrollment needs <b>Zero Trust Access (client-based)</b> enabled in <b>Connect, End User Connectivity</b>.</p>
<pre class="out">ROAM1&gt; secure-access login asha.verma@nwkings.example
Opening browser for SAML sign-in ... signed in as asha.verma@nwkings.example (Asha Verma).
Zero Trust Access enrollment complete: <span class="hl">device certificate issued</span> (ECDSA P-256, valid 7 days).</pre>

<h3>Lab walk-through: publish the finance ERP</h3>
<p>The ERP (10.20.1.50, erp.nwk.internal, HTTP and HTTPS) sits behind DC-EDGE. Asha (Finance, ROAM1) and Rohit (Engineering, ROAM2) are already enrolled.</p>
<ol>
<li><b>Resources, Private Resources, Connector Groups, Add connector group</b>: DC1-CONNECTORS. Its row shows the provisioning key. On RC1:</li>
</ol>
<pre class="code">RC1&gt; sse-connector provision rck-b07a12-703dfc
RC1&gt; sse-connector status</pre>
<pre class="out">Connector provisioned in group DC1-CONNECTORS. Connected to Secure Access (146.112.0.10).
Secure Access Resource Connector 2026.08.1
  Provisioning : provisioned (group DC1-CONNECTORS)
  Tunnel       : <span class="hl">connected to 146.112.0.10:443 (DTLS)</span></pre>
<ol start="2">
<li><b>Add resource</b> Finance-ERP: address 10.20.1.50, FQDN erp.nwk.internal, ports 80,443, connector group DC1-CONNECTORS.</li>
<li><b>Secure, Access Policy, Private access, Add rule</b>: Finance to ERP, From group Finance, To Finance-ERP, Access methods Client-based, Endpoint posture Compliant, Action Allow.</li>
</ol>
<pre class="out">ROAM1&gt; curl erp.nwk.internal
&lt;h1&gt;Finance-ERP · ERP&lt;/h1&gt;&lt;p&gt;Private application reached through Cisco Secure Access (client-based ZTNA) <span class="hl">via resource connector RC1</span>.&lt;/p&gt;&lt;p&gt;Signed in as asha.verma@nwkings.example&lt;/p&gt;

ROAM2&gt; curl erp.nwk.internal
curl: (7) Failed to connect to erp.nwk.internal port 80: Connection refused
[Cisco Secure Client] Secure Access blocked this connection: <span class="hl">Blocked by private access rule Default Private Access</span></pre>
<p>Rohit is in Engineering, so no private rule matches him, and the bottom rule <b>Default Private Access</b> blocks. That is the answer to the lab question. Activity Search shows both events with type <b>Private App</b>: Allowed for asha.verma@nwkings.example, Blocked for rohit.mehra@nwkings.example.</p>

<div class="eg"><p><b>Worked example: what the data center sees.</b> Asha's laptop is 198.51.100.20 at home. The ERP's access log shows the request from 10.20.1.20, the connector, not from her home address. The DC firewall needs one rule: RC1 to 10.20.1.50 on TCP 80 and 443, plus RC1 outbound HTTPS to Secure Access. No inbound rule from the internet exists at all.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting that the data-center firewall must allow the connector to reach the app (the request leaves from the connector's IP). Deploying a single connector and calling it production. Writing an Allow rule for "Any user" to "All private resources" during a pilot and never tightening it.</p></div>

<div class="exam"><p><b>Exam traps.</b> Default private rule = <b>block</b>; default internet rule = allow (in this lab). Connectors need <b>outbound</b> connectivity only. Client-based ZTNA supports full posture; browser-based has limited posture. ZTNA grants access to an application, not to a network.</p></div>

<div class="scn"><h4>Every engineer could see the payroll server</h4><p>After a ransomware scare, an audit found that the remote access VPN gave every employee a route to the whole 10.20.0.0/16 data-center range, including the payroll database. The company moved the ERP and payroll front-end to ZTNA: one connector group, two private resources, and rules by group with Compliant posture. A later penetration test from a compromised Engineering laptop could not even resolve erp.nwk.internal.</p><p><b>Lesson:</b> least privilege is a property of the access method; ZTNA enforces it by design, a flat VPN does not.</p></div>

<div class="iv"><p class="q">"Explain how client-based ZTNA reaches an app in the data center without any inbound firewall rule."</p><p>Strong answer: resource connectors deployed next to the app enrol with a provisioning key and keep an outbound session to Secure Access. The enrolled Secure Client Zero Trust Access module intercepts traffic for the private resource and sends it to Secure Access, which checks identity, group and posture against the private access rules, then stitches the session to a healthy connector, which opens TCP to the app. Mention the default private rule blocks and that connectors should be deployed in pairs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ZTNA gives per-application access, decided per session with identity and posture.</li>
<li>Objects: connector group (provisioning key), private resource (address, FQDN, ports, group), private access rule.</li>
<li>Connectors dial out; the app sees the connector's IP.</li>
<li>Client-based ZTNA uses Secure Client's Zero Trust Access module and full posture.</li>
<li>Default Private Access blocks anything no rule allows.</li>
</ul></div>
`,hi:`
<p>VPN aisa hai jaise visitor ko poori office building ki chaabi de dena: andar aane ke baad woh har darwaza try kar sakta hai. <b>Zero trust network access (ZTNA)</b> hotel ke key card jaisa hai jo ek room ke liye programmed hai, har use par check hota hai, aur guest ke check out karte hi ya card khone ki report aate hi cancel ho jaata hai. Visitor ko yeh bhi pata nahi chalta ki baaki rooms kahan hain.</p>

<h3>VPN versus ZTNA</h3>
<table class="cmp"><tr><th></th><th>Remote access VPN</th><th>ZTNA</th></tr>
<tr><td>User ko kya milta hai</td><td>Corporate network par ek IP address; ACLs jo allow karein sab tak pahunch (aur scan) sakta hai</td><td>Ek baar mein ek application; baaki apps resolve bhi nahi hote</td></tr>
<tr><td>Access kab decide hota hai</td><td>Ek baar, login par</td><td>Har session aur har request par, identity aur device posture ke saath</td></tr>
<tr><td>Exposure</td><td>Internet par listen karta VPN head-end</td><td>Koi inbound port nahi; connectors dial out karte hain</td></tr>
<tr><td>Laptop compromise hone ke baad</td><td>Lateral movement aasaan</td><td>Sirf allowed apps tak simit</td></tr>
</table>

<h3>Teen objects jo aap configure karte ho</h3>
<dl class="terms">
<dt>Connector group</dt><dd>Ek location ke resource connectors ka set, ek <b>provisioning key</b> ke saath jo har connector VM enrol karne mein use hoti hai. Har group mein kam se kam do connectors deploy karo taaki ek patch ho sake jab dusra users ko serve kare.</dd>
<dt>Private resource</dt><dd>Internally reachable <b>address</b> aur/ya <b>FQDN</b>, protocol aur <b>ports</b>, aur woh <b>connector group</b> jo ise reach kar sake. Optionally, browser-based access (chapter 10).</dd>
<dt>Private access rule</dt><dd>Users ya groups, private resources tak, required <b>access methods</b> (client-based, browser-based) aur <b>endpoint posture</b> ke saath. Rules top-down hain; unke neeche <b>Default Private Access</b> hamesha block karta hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Client-based ZTNA path">
<rect x="10" y="90" width="120" height="54" rx="8" fill="#bae6fd"/><text x="70" y="112" text-anchor="middle" class="svg-ink" font-size="12">ROAM1 (Asha)</text><text x="70" y="130" text-anchor="middle" class="svg-muted" font-size="11">ZTA module</text>
<rect x="210" y="80" width="170" height="74" rx="10" fill="#ddd6fe"/><text x="295" y="104" text-anchor="middle" class="svg-ink" font-size="12">Secure Access</text><text x="295" y="124" text-anchor="middle" class="svg-muted" font-size="11">rule: Finance to ERP</text><text x="295" y="142" text-anchor="middle" class="svg-muted" font-size="11">posture: Compliant</text>
<rect x="460" y="40" width="160" height="44" rx="8" fill="#fde68a"/><text x="540" y="60" text-anchor="middle" class="svg-ink" font-size="12">RC1 10.20.1.20</text><text x="540" y="76" text-anchor="middle" class="svg-muted" font-size="11">DC1-CONNECTORS</text>
<rect x="460" y="150" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="540" y="170" text-anchor="middle" class="svg-ink" font-size="12">ERP 10.20.1.50</text><text x="540" y="186" text-anchor="middle" class="svg-muted" font-size="11">erp.nwk.internal</text>
<line x1="130" y1="117" x2="210" y2="117" stroke="#64748b" stroke-width="2"/><text x="170" y="108" text-anchor="middle" class="svg-muted" font-size="11">QUIC</text>
<line x1="460" y1="62" x2="380" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="430" y="66" text-anchor="middle" class="svg-muted" font-size="11">outbound</text>
<line x1="540" y1="84" x2="540" y2="150" stroke="#64748b" stroke-width="2"/><text x="580" y="122" text-anchor="middle" class="svg-muted" font-size="11">TCP 80/443</text>
</svg><p class="cap">User ka session aur connector ka outbound session Secure Access ke andar milte hain. ERP ko traffic RC1 se dikhta hai, laptop se kabhi nahi.</p></div>

<h3>Laptop par client-based ZTNA</h3>
<p>Secure Client ka <b>Zero Trust Access module</b> device enrol karta hai: user SAML se sign in karta hai, aur device ko certificate milta hai (lab mein ECDSA P-256, 7 din valid). Uske baad module sirf private resources ka traffic intercept karta hai, aur use modern QUIC-based (MASQUE) tunnels mein Secure Access tak le jaata hai, UDP block ho to TLS par fall back karta hai. Kyunki yeh full client hai, yeh <b>full posture</b> report karta hai: OS version, firewall, disk encryption aur anti-malware. Enrollment ke liye <b>Connect, End User Connectivity</b> mein <b>Zero Trust Access (client-based)</b> enabled hona chahiye.</p>
<pre class="out">ROAM1&gt; secure-access login asha.verma@nwkings.example
Opening browser for SAML sign-in ... signed in as asha.verma@nwkings.example (Asha Verma).
Zero Trust Access enrollment complete: <span class="hl">device certificate issued</span> (ECDSA P-256, valid 7 days).</pre>

<h3>Lab walk-through: finance ERP publish karo</h3>
<p>ERP (10.20.1.50, erp.nwk.internal, HTTP aur HTTPS) DC-EDGE ke peeche hai. Asha (Finance, ROAM1) aur Rohit (Engineering, ROAM2) pehle se enrolled hain.</p>
<ol>
<li><b>Resources, Private Resources, Connector Groups, Add connector group</b>: DC1-CONNECTORS. Uski row provisioning key dikhati hai. RC1 par:</li>
</ol>
<pre class="code">RC1&gt; sse-connector provision rck-b07a12-703dfc
RC1&gt; sse-connector status</pre>
<pre class="out">Connector provisioned in group DC1-CONNECTORS. Connected to Secure Access (146.112.0.10).
Secure Access Resource Connector 2026.08.1
  Provisioning : provisioned (group DC1-CONNECTORS)
  Tunnel       : <span class="hl">connected to 146.112.0.10:443 (DTLS)</span></pre>
<ol start="2">
<li><b>Add resource</b> Finance-ERP: address 10.20.1.50, FQDN erp.nwk.internal, ports 80,443, connector group DC1-CONNECTORS.</li>
<li><b>Secure, Access Policy, Private access, Add rule</b>: Finance to ERP, From group Finance, To Finance-ERP, Access methods Client-based, Endpoint posture Compliant, Action Allow.</li>
</ol>
<pre class="out">ROAM1&gt; curl erp.nwk.internal
&lt;h1&gt;Finance-ERP · ERP&lt;/h1&gt;&lt;p&gt;Private application reached through Cisco Secure Access (client-based ZTNA) <span class="hl">via resource connector RC1</span>.&lt;/p&gt;&lt;p&gt;Signed in as asha.verma@nwkings.example&lt;/p&gt;

ROAM2&gt; curl erp.nwk.internal
curl: (7) Failed to connect to erp.nwk.internal port 80: Connection refused
[Cisco Secure Client] Secure Access blocked this connection: <span class="hl">Blocked by private access rule Default Private Access</span></pre>
<p>Rohit Engineering mein hai, isliye koi private rule unse match nahi karta, aur bottom rule <b>Default Private Access</b> block karta hai. Yahi lab question ka jawab hai. Activity Search dono events type <b>Private App</b> ke saath dikhata hai: asha.verma@nwkings.example ke liye Allowed, rohit.mehra@nwkings.example ke liye Blocked.</p>

<div class="eg"><p><b>Worked example: data center kya dekhta hai.</b> Asha ka laptop ghar par 198.51.100.20 hai. ERP ka access log request 10.20.1.20 se dikhata hai, yaani connector se, uske ghar ke address se nahi. DC firewall ko ek rule chahiye: RC1 se 10.20.1.50 tak TCP 80 aur 443, plus RC1 ka Secure Access tak outbound HTTPS. Internet se koi inbound rule hai hi nahi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Bhool jaana ki data-center firewall ko connector ko app tak pahunchne dena hai (request connector ke IP se nikalti hai). Ek hi connector deploy karke use production kehna. Pilot ke dauraan "Any user" se "All private resources" ka Allow rule likhna aur kabhi tight na karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Default private rule = <b>block</b>; default internet rule = allow (is lab mein). Connectors ko sirf <b>outbound</b> connectivity chahiye. Client-based ZTNA full posture support karta hai; browser-based mein limited posture hai. ZTNA application ka access deta hai, network ka nahi.</p></div>

<div class="scn"><h4>Har engineer payroll server dekh sakta tha</h4><p>Ek ransomware scare ke baad audit mein pata chala ki remote access VPN har employee ko poore 10.20.0.0/16 data-center range ka route deta tha, payroll database samet. Company ne ERP aur payroll front-end ko ZTNA par shift kiya: ek connector group, do private resources, aur Compliant posture ke saath group wale rules. Baad mein compromised Engineering laptop se penetration test erp.nwk.internal resolve bhi nahi kar paaya.</p><p><b>Seekh:</b> least privilege access method ki property hai; ZTNA ise design se enforce karta hai, flat VPN nahi.</p></div>

<div class="iv"><p class="q">"Samjhao client-based ZTNA bina kisi inbound firewall rule ke data center ke app tak kaise pahunchta hai."</p><p>Strong answer: app ke paas deploy hue resource connectors provisioning key se enrol hote hain aur Secure Access tak outbound session rakhte hain. Enrolled Secure Client ka Zero Trust Access module private resource ka traffic intercept karke Secure Access bhejta hai, jo private access rules ke against identity, group aur posture check karta hai, phir session ko healthy connector se jodta hai, jo app tak TCP kholta hai. Mention karo ki default private rule block karta hai aur connectors pairs mein deploy hone chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ZTNA per-application access deta hai, har session identity aur posture se decide hota hai.</li>
<li>Objects: connector group (provisioning key), private resource (address, FQDN, ports, group), private access rule.</li>
<li>Connectors dial out karte hain; app ko connector ka IP dikhta hai.</li>
<li>Client-based ZTNA Secure Client ka Zero Trust Access module aur full posture use karta hai.</li>
<li>Default Private Access woh sab block karta hai jo koi rule allow nahi karta.</li>
</ul></div>
`}};export{e as default};