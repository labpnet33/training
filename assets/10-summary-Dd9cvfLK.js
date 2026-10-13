var e={id:`security-summary`,h:{en:`Summary, cheat sheet and exam checklist`,hi:`Summary, cheat sheet aur exam checklist`},body:{en:`
<p>You now have the whole security picture of Catalyst SD-WAN: protected management, a secured control plane, a verified identity for every device, an encrypted data plane, isolated segments, and layered inspection at the edge or in the cloud. This chapter condenses the module so you can revise it in one sitting.</p>

<h3>The layers in one table</h3>
<table class="cmp"><tr><th>Layer</th><th>Mechanism</th><th>Remember</th></tr>
<tr><td>Management</td><td>RBAC, AAA, SAML, audit log</td><td>Least privilege; break-glass account; logs to SIEM</td></tr>
<tr><td>Control plane</td><td>DTLS (default) or TLS</td><td>TLS default port 23456; mutual certificates</td></tr>
<tr><td>Identity</td><td>Certificates plus WAN Edge list</td><td>Authentication is not authorization; states valid, staging, invalid</td></tr>
<tr><td>Data plane</td><td>IPsec ESP, AES-256-GCM</td><td>Rekey 86400 s; replay window 512; keys via the Controller</td></tr>
<tr><td>Segmentation</td><td>VPNs (VRFs), ACLs</td><td>VPN 0 transport, VPN 512 management, label in OMP</td></tr>
<tr><td>Firewall</td><td>Zone-based, application aware</td><td>Inspect, pass, drop; different zones drop by default</td></tr>
<tr><td>Threat defense</td><td>UTD: IPS or IDS, URL filtering, AMP</td><td>Container; minimum 8 GB DRAM; IDS alerts, IPS blocks</td></tr>
<tr><td>Cloud security</td><td>Umbrella DNS, SIG tunnels</td><td>DNSCrypt, bypass list up to 64 domains; IPsec or GRE</td></tr></table>

<h3>Cheat sheet: commands</h3>
<pre class="code">security control protocol tls
security control tls-port 23456
security ipsec rekey 86400
security ipsec replay-window 512
security ipsec integrity-type esp
request platform software sdwan security ipsec-rekey

show sdwan control connections
show sdwan control connection-history
show sdwan control local-properties
show sdwan certificate validity
show sdwan bfd sessions
show zone-pair security
show sdwan zbfw zonepair-statistics
show sdwan zbfw drop-statistics
show utd engine standard status</pre>

<h3>Glossary</h3>
<ul>
<li><b>DTLS / TLS:</b> the protocols that secure control connections; DTLS over UDP is the default.</li>
<li><b>Organization name:</b> domain-wide name that must match on all devices.</li>
<li><b>WAN Edge list:</b> the list of authorized devices and their states.</li>
<li><b>ESP / AES-256-GCM:</b> the IPsec encapsulation and the default authenticated cipher.</li>
<li><b>Rekey:</b> replacing the data plane keys; default every 86400 seconds.</li>
<li><b>Anti-replay window:</b> sliding window that rejects duplicate or old packets; default 512.</li>
<li><b>Zone pair:</b> a directional pair of zones carrying a firewall policy.</li>
<li><b>Self zone:</b> the zone for traffic to or from the router itself.</li>
<li><b>UTD:</b> Unified Threat Defense container on the edge.</li>
<li><b>SIG:</b> Secure Internet Gateway reached over IPsec or GRE tunnels.</li>
<li><b>RBAC:</b> role-based access control through user groups.</li>
</ul>

<h3>Most tested facts</h3>
<ol>
<li>Control plane uses DTLS or TLS; data plane uses IPsec.</li>
<li>Authentication verifies the certificate; authorization checks the WAN Edge list.</li>
<li>Defaults: AES-256-GCM, rekey 86400, replay window 512, TLS port 23456, DTLS first.</li>
<li>Different zones drop by default; the zone-pair policy decides.</li>
<li>IDS alerts and IPS blocks; UTD needs memory.</li>
<li>DNS security checks names; SIG inspects traffic.</li>
<li>Management hardening: RBAC groups, AAA, audit logs.</li>
</ol>

<div class="eg"><p><b>Worked example for revision.</b> Design the security of the Pune branch for Bharat Retail: staff on VPN 10 through the DC firewall, guests on VPN 20 with DIA. Answer: control connections over DTLS or TLS with certificates and an authorized serial on the list; IPsec with default parameters and monitored rekey; VPN 20 with no route to the DC; zone-based firewall for GUEST to INTERNET with inspect and a final drop with log; UTD IDS then IPS if the platform has 8 GB of memory, or DNS security with the local bypass list and a SIG tunnel pair; named admin accounts with least privilege.</p></div>

<div class="warn"><p><b>Top five mistakes to avoid.</b> Forgetting certificate expiry; confusing authentication with authorization; disabling a control to test and not restoring it; DIA without any inspection; leaving default or shared admin accounts.</p></div>

<div class="exam"><p><b>Exam checklist.</b> Tick before the exam:</p><ul>
<li>I can explain DTLS and TLS for the control plane and configure the protocol and port.</li>
<li>I can describe certificate authentication, the organization name and the WAN Edge list states.</li>
<li>I can list the certificate lifecycle steps.</li>
<li>I can explain IPsec key distribution, AES-256-GCM, rekey, replay window and pairwise keying.</li>
<li>I can explain VPN 0, VPN 512 and service VPN segmentation and ACLs.</li>
<li>I can build and read a zone-based firewall policy and its verification commands.</li>
<li>I can compare IPS, IDS, URL filtering and AMP and the UTD requirements.</li>
<li>I can compare Umbrella DNS security with SIG tunnels.</li>
<li>I can design RBAC and AAA for Manager.</li>
<li>I can run the six-step security troubleshooting workflow.</li>
</ul></div>

<div class="scn"><h4>The pre-audit review</h4><p>Before an audit you walk through the fabric: certificates expiring in 40 days (renew now), two netadmin users without multi-factor authentication (fix), guest VPN with no inspection (add firewall and DNS security), and a test device still valid on the WAN Edge list (remove). Each item maps to a layer of this module.</p><p><b>Lesson:</b> security is a checklist of layers, reviewed regularly.</p></div>

<div class="iv"><p class="q">"Give me a one-minute overview of Catalyst SD-WAN security."</p><p>Management is protected by RBAC, AAA and audit logs. Control connections use DTLS or TLS with mutual certificates, and devices must be on the WAN Edge list to join. The data plane is IPsec with AES-256-GCM, with keys distributed through the Controller, rekeyed every 24 hours by default and protected by anti-replay. VPNs and ACLs segment traffic, and at the edge a zone firewall, UTD (IPS, URL filtering, AMP), Umbrella DNS security or SIG tunnels inspect it. I monitor certificates, logs and counters and troubleshoot outside in.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Protect in layers: management, control, identity, data, segments, inspection.</li>
<li>Know the defaults and the verification commands.</li>
<li>Authentication and authorization are separate checks.</li>
<li>DIA needs inspection: firewall plus UTD, DNS security or SIG.</li>
<li>Monitor certificates and logs, and never weaken controls permanently.</li>
</ul></div>
`,hi:`
<p>Ab tumhare paas Catalyst SD-WAN ki poori security tasveer hai: protected management, secured control plane, har device ki verified identity, encrypted data plane, isolated segments, aur edge par ya cloud mein layered inspection. Yeh chapter module ko sankshep mein deta hai taaki ek baithak mein revise kar sako.</p>

<h3>Layers ek table mein</h3>
<table class="cmp"><tr><th>Layer</th><th>Mechanism</th><th>Yaad rakho</th></tr>
<tr><td>Management</td><td>RBAC, AAA, SAML, audit log</td><td>Least privilege; break-glass account; logs SIEM ko</td></tr>
<tr><td>Control plane</td><td>DTLS (default) ya TLS</td><td>TLS default port 23456; mutual certificates</td></tr>
<tr><td>Identity</td><td>Certificates plus WAN Edge list</td><td>Authentication authorization nahi hai; states valid, staging, invalid</td></tr>
<tr><td>Data plane</td><td>IPsec ESP, AES-256-GCM</td><td>Rekey 86400 s; replay window 512; keys Controller se</td></tr>
<tr><td>Segmentation</td><td>VPNs (VRFs), ACLs</td><td>VPN 0 transport, VPN 512 management, OMP mein label</td></tr>
<tr><td>Firewall</td><td>Zone-based, application aware</td><td>Inspect, pass, drop; alag zones default drop</td></tr>
<tr><td>Threat defense</td><td>UTD: IPS ya IDS, URL filtering, AMP</td><td>Container; minimum 8 GB DRAM; IDS alert, IPS block</td></tr>
<tr><td>Cloud security</td><td>Umbrella DNS, SIG tunnels</td><td>DNSCrypt, 64 domains tak bypass list; IPsec ya GRE</td></tr></table>

<h3>Cheat sheet: commands</h3>
<pre class="code">security control protocol tls
security control tls-port 23456
security ipsec rekey 86400
security ipsec replay-window 512
security ipsec integrity-type esp
request platform software sdwan security ipsec-rekey

show sdwan control connections
show sdwan control connection-history
show sdwan control local-properties
show sdwan certificate validity
show sdwan bfd sessions
show zone-pair security
show sdwan zbfw zonepair-statistics
show sdwan zbfw drop-statistics
show utd engine standard status</pre>

<h3>Glossary</h3>
<ul>
<li><b>DTLS / TLS:</b> control connections ko secure karne wale protocols; UDP par DTLS default hai.</li>
<li><b>Organization name:</b> domain-wide naam jo saare devices par match karna chahiye.</li>
<li><b>WAN Edge list:</b> authorized devices aur unki states ki list.</li>
<li><b>ESP / AES-256-GCM:</b> IPsec encapsulation aur default authenticated cipher.</li>
<li><b>Rekey:</b> data plane keys badalna; default har 86400 seconds.</li>
<li><b>Anti-replay window:</b> sliding window jo duplicate ya purane packets reject karta hai; default 512.</li>
<li><b>Zone pair:</b> firewall policy wali zones ki directional jodi.</li>
<li><b>Self zone:</b> router ke apne traffic ki zone.</li>
<li><b>UTD:</b> edge par Unified Threat Defense container.</li>
<li><b>SIG:</b> IPsec ya GRE tunnels se pahunchi Secure Internet Gateway.</li>
<li><b>RBAC:</b> user groups ke through role-based access control.</li>
</ul>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<ol>
<li>Control plane DTLS ya TLS use karta hai; data plane IPsec.</li>
<li>Authentication certificate verify karta hai; authorization WAN Edge list check karta hai.</li>
<li>Defaults: AES-256-GCM, rekey 86400, replay window 512, TLS port 23456, pehle DTLS.</li>
<li>Alag zones default drop; zone-pair policy tay karti hai.</li>
<li>IDS alert karta hai aur IPS block; UTD ko memory chahiye.</li>
<li>DNS security naam check karta hai; SIG traffic inspect karta hai.</li>
<li>Management hardening: RBAC groups, AAA, audit logs.</li>
</ol>

<div class="eg"><p><b>Revision ke liye worked example.</b> Bharat Retail ki Pune branch ki security design karo: staff VPN 10 par DC firewall ke through, guests VPN 20 par DIA ke saath. Jawab: certificates aur list par authorized serial ke saath DTLS ya TLS par control connections; default parameters aur monitored rekey ke saath IPsec; VPN 20 ka DC tak route nahi; GUEST se INTERNET ke liye inspect aur aakhir mein log ke saath drop wala zone-based firewall; platform ke paas 8 GB memory ho to UTD pehle IDS phir IPS, nahi to local bypass list ke saath DNS security aur SIG tunnel pair; least privilege ke saath named admin accounts.</p></div>

<div class="warn"><p><b>Bachne wali top paanch galtiyan.</b> Certificate expiry bhoolna; authentication ko authorization se confuse karna; test ke liye control disable karke restore na karna; inspection ke bina DIA; default ya shared admin accounts chhodna.</p></div>

<div class="exam"><p><b>Exam checklist.</b> Exam se pehle tick karo:</p><ul>
<li>Main control plane ke liye DTLS aur TLS samjha sakta hoon aur protocol aur port configure kar sakta hoon.</li>
<li>Main certificate authentication, organization name aur WAN Edge list states bata sakta hoon.</li>
<li>Main certificate lifecycle steps gina sakta hoon.</li>
<li>Main IPsec key distribution, AES-256-GCM, rekey, replay window aur pairwise keying samjha sakta hoon.</li>
<li>Main VPN 0, VPN 512 aur service VPN segmentation aur ACLs samjha sakta hoon.</li>
<li>Main zone-based firewall policy bana aur padh sakta hoon aur uske verification commands jaanta hoon.</li>
<li>Main IPS, IDS, URL filtering aur AMP aur UTD requirements compare kar sakta hoon.</li>
<li>Main Umbrella DNS security aur SIG tunnels compare kar sakta hoon.</li>
<li>Main Manager ke liye RBAC aur AAA design kar sakta hoon.</li>
<li>Main six-step security troubleshooting workflow chala sakta hoon.</li>
</ul></div>

<div class="scn"><h4>Audit se pehle review</h4><p>Audit se pehle tum fabric ka review karte ho: certificates 40 din mein expire (abhi renew), do netadmin users bina multi-factor authentication ke (fix), inspection ke bina guest VPN (firewall aur DNS security jodo), aur WAN Edge list par abhi bhi valid ek test device (hatao). Har item is module ki ek layer se map hota hai.</p><p><b>Lesson:</b> security layers ki checklist hai, jise regularly review karte hain.</p></div>

<div class="iv"><p class="q">"Catalyst SD-WAN security ka ek minute ka overview do."</p><p>Management RBAC, AAA aur audit logs se protected hai. Control connections mutual certificates ke saath DTLS ya TLS use karte hain, aur jodne ke liye device ko WAN Edge list mein hona zaroori hai. Data plane AES-256-GCM ke saath IPsec hai, keys Controller se distribute hoti hain, default 24 ghante mein rekey hoti hain aur anti-replay se protected hain. VPNs aur ACLs traffic segment karte hain, aur edge par zone firewall, UTD (IPS, URL filtering, AMP), Umbrella DNS security ya SIG tunnels use inspect karte hain. Main certificates, logs aur counters monitor karta hoon aur bahar se andar troubleshoot karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layers mein protect karo: management, control, identity, data, segments, inspection.</li>
<li>Defaults aur verification commands jaano.</li>
<li>Authentication aur authorization alag checks hain.</li>
<li>DIA ko inspection chahiye: firewall plus UTD, DNS security ya SIG.</li>
<li>Certificates aur logs monitor karo, aur controls ko kabhi permanently kamzor mat karo.</li>
</ul></div>
`}};export{e as default};