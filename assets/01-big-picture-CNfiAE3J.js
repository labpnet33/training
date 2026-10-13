var e={id:`big-picture`,h:{en:`The big picture: VPNs on Secure Firewall Threat Defense`,hi:`Big picture: Secure Firewall Threat Defense par VPN`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to build, verify and troubleshoot every kind of VPN that a Cisco Secure Firewall Threat Defense (FTD) runs, using the Secure Firewall Management Center (FMC): a site-to-site tunnel to a branch router, a tunnel between two managed Threat Defense devices with AES-GCM and PFS, a route-based (VTI) design, and remote access for employees with Cisco Secure Client and split tunnelling. You will also learn to read the IKEv2 errors, the IPsec counters and packet-tracer, and to explain all of it in an interview.</p>
<p><b>Prerequisites.</b> You should already know IP addressing, routing and NAT, and the basic Threat Defense workflow from the earlier modules: security zones, the access control policy, NAT rules and <b>Deploy</b> (module <i>Threat Defense &amp; Management Center</i>). The IPsec and IKEv2 theory was built step by step in <i>Site-to-site IPsec VPN</i> on the ASA and in the cryptography module; chapter 2 refreshes it, but does not start from zero again.</p>

<h3>An analogy: the armoured courier between two offices</h3>
<p>Imagine your company has a head office and a branch in another city. Sending documents by normal post (the internet) is cheap, but anybody along the way can open the envelope, read it or change it. So you hire an <b>armoured courier service</b>. Before the first delivery, the two office managers meet and agree on three things: which lock and safe type to use, how to prove who they are, and which departments are allowed to send documents this way. After that, every document from those departments is locked in a box at one office, carried across the public roads, and unlocked only at the other office.</p>
<p>That is a <b>site-to-site VPN</b>. The office managers are the two VPN gateways (here a Threat Defense and a router). The meeting is <b>IKE</b> (Internet Key Exchange). The locked box is <b>ESP</b> (Encapsulating Security Payload). The list of departments is the set of <b>protected networks</b>. A <b>remote access VPN</b> is the same courier service for one employee working from home: the employee carries a personal key card (Secure Client plus a username, password or certificate) and gets a temporary desk number inside the office (an address from a VPN pool).</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Module topology">
<rect x="10" y="20" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="12">PC1 10.0.1.10</text>
<rect x="10" y="80" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="65" y="105" text-anchor="middle" class="svg-ink" font-size="12">SRV1 10.0.1.20</text>
<rect x="160" y="50" width="110" height="50" rx="8" fill="#fed7aa"/><text x="215" y="72" text-anchor="middle" class="svg-ink" font-size="13">NK-FTD</text><text x="215" y="90" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.2</text>
<rect x="310" y="50" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="355" y="80" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<rect x="440" y="20" width="100" height="50" rx="8" fill="#bae6fd"/><text x="490" y="42" text-anchor="middle" class="svg-ink" font-size="13">BR1</text><text x="490" y="60" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.2</text>
<rect x="560" y="25" width="74" height="40" rx="8" fill="#bbf7d0"/><text x="597" y="50" text-anchor="middle" class="svg-ink" font-size="12">PC-BR</text>
<rect x="440" y="100" width="120" height="40" rx="8" fill="#ddd6fe"/><text x="500" y="125" text-anchor="middle" class="svg-ink" font-size="12">HOME-PC</text>
<line x1="120" y1="40" x2="160" y2="70" stroke="#64748b"/><line x1="120" y1="100" x2="160" y2="85" stroke="#64748b"/>
<line x1="270" y1="75" x2="310" y2="75" stroke="#64748b"/><line x1="400" y1="65" x2="440" y2="45" stroke="#64748b"/><line x1="400" y1="85" x2="440" y2="120" stroke="#64748b"/><line x1="540" y1="45" x2="560" y2="45" stroke="#64748b"/>
<path d="M215 160 Q355 215 490 160" fill="none" stroke="#0284c7" stroke-width="2" stroke-dasharray="6 4"/><text x="355" y="232" text-anchor="middle" class="svg-accent" font-size="13">site-to-site IPsec: 10.0.1.0/24 to 10.20.0.0/24</text>
<path d="M215 110 Q330 160 445 125" fill="none" stroke="#7c3aed" stroke-width="2" stroke-dasharray="3 3"/><text x="330" y="175" text-anchor="middle" class="svg-muted" font-size="12">Secure Client (TLS/DTLS 443)</text>
</svg><p class="cap">The lab network used throughout the module: HQ behind NK-FTD, the branch behind BR1, and a remote employee on HOME-PC.</p></div>

<h3>Why companies use the firewall as the VPN gateway</h3>
<p>The firewall already sits at the edge, already owns the public address and already inspects everything that crosses the boundary. Making it the VPN headend means one device decides <b>who</b> may enter (authentication), <b>what</b> they may reach (access control) and <b>how</b> the traffic is protected (encryption), and one set of logs records it all. On a Threat Defense the extra benefit is that decrypted traffic can still pass through Snort: intrusion prevention, file and malware policy and URL filtering apply to VPN users exactly as they apply to the office LAN, unless you deliberately bypass them.</p>

<h3>The two families and where they live in the Management Center</h3>
<table class="cmp"><tr><th></th><th>Site-to-site</th><th>Remote access</th></tr>
<tr><td>Connects</td><td>two or more networks</td><td>one user device to the company</td></tr>
<tr><td>Protocol</td><td>IPsec with IKEv2 (IKEv1 for old peers)</td><td>SSL/TLS with DTLS, or IPsec-IKEv2</td></tr>
<tr><td>Built in</td><td>Devices → VPN · Site To Site</td><td>Devices → VPN · Remote Access</td></tr>
<tr><td>Building blocks</td><td>topology, endpoints, IKE and IPsec policies</td><td>connection profile, group policy, pool, certificate, Secure Client image</td></tr>
<tr><td>Inside hosts see</td><td>the real LAN addresses of the other site</td><td>the client's address from the VPN pool</td></tr></table>
<p>The shared objects (IKEv2 policies, IPsec proposals, address pools, certificates and Secure Client files) are under <b>Objects → VPN Objects</b>, and the live state of tunnels and Secure Client sessions is under <b>Analysis → VPN Monitoring</b>. Nothing reaches the device until you click <b>Deploy</b>: the Management Center edits a candidate policy, then pushes it.</p>

<h3>The module map</h3>
<ol><li>Chapters 2 to 8: IPsec and IKEv2 on the Threat Defense, topologies, IKE and IPsec policies, endpoints and protected networks, NAT exemption, access control versus <code>sysopt permit-vpn</code>, and route-based VTI.</li>
<li>Chapters 9 to 11: remote access with the wizard, AAA, certificates and pools, then group policies, split tunnelling, DNS and the Secure Client modules.</li>
<li>Chapter 12: a troubleshooting workflow that walks the two ticket labs. Chapter 13: summary and exam checklist.</li></ol>

<div class="eg"><p><b>Worked example.</b> HQ uses 10.0.1.0/24 behind NK-FTD (outside 203.0.113.2). The branch uses 10.20.0.0/24 behind BR1 (outside 198.51.100.2). When PC1 (10.0.1.10) pings PC-BR (10.20.0.10), the packet that leaves NK-FTD has an outer header 203.0.113.2 → 198.51.100.2, IP protocol 50 (ESP). The ISP sees only that outer header and encrypted bytes. BR1 decrypts it and delivers the original 10.0.1.10 → 10.20.0.10 packet. Remote employee ravi on HOME-PC (198.51.100.20) gets 10.50.0.10 from the pool, so SRV1 sees requests from 10.50.0.10.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking that a VPN tunnel "is up" means the job is done. On a Threat Defense three more things must be right before users are happy: the traffic must be exempt from NAT, decrypted traffic must be allowed by access control (or bypass it), and routing must point the remote networks out of the right interface. Most VPN tickets are about these three, not about encryption.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions often mix up the objects: the <b>connection profile</b> (tunnel group) decides how a user authenticates and which pool and group policy they get; the <b>group policy</b> decides what they receive (split tunnel, DNS, banner, timeouts). Remember "profile = how you get in, policy = what you get".</p></div>

<div class="scn"><h4>The branch that went back to MPLS</h4><p>A retail chain paid for an expensive MPLS circuit to each store because "internet VPNs are unreliable". When the contract came up for renewal the network team tested a site-to-site VPN from the store routers to the HQ Threat Defense. The first pilot failed: the tunnel came up but the point-of-sale system could not reach the HQ server. The engineer found that HQ traffic was being translated by the normal internet PAT rule before it reached the crypto map, so it never entered the tunnel. One NAT exemption checkbox in the topology fixed it, and 40 stores moved to broadband plus VPN within a quarter.</p><p><b>Lesson:</b> the VPN itself is rarely the problem; its interaction with NAT, access control and routing usually is.</p></div>

<div class="iv"><p class="q">"What is the difference between a site-to-site and a remote access VPN, and how would you build each on a Threat Defense?"</p><p>A strong answer: site-to-site joins networks through gateways using IPsec with IKEv2, built in the Management Center as a topology with endpoints, protected networks, IKE and IPsec policies. Remote access joins one user to the company with Cisco Secure Client over TLS/DTLS or IKEv2, built with the remote access wizard: connection profile, authentication, address pool, group policy, certificate and client image. Then mention NAT exemption, access control for decrypted traffic and verification commands such as <code>show crypto ipsec sa</code> and <code>show vpn-sessiondb anyconnect</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VPN gives confidentiality, integrity and peer authentication across an untrusted network.</li>
<li>Site-to-site = network to network with IPsec/IKEv2; remote access = user to network with Secure Client.</li>
<li>Build site-to-site in Devices → VPN · Site To Site, remote access in Devices → VPN · Remote Access, shared objects in Objects → VPN Objects.</li>
<li>Monitor in Analysis → VPN Monitoring; nothing is active until you Deploy.</li>
<li>Most VPN problems are NAT, access control or routing, not cryptography.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap Cisco Secure Firewall Threat Defense (FTD) par chalne wala har tarah ka VPN Secure Firewall Management Center (FMC) se build, verify aur troubleshoot kar paoge: branch router tak site-to-site tunnel, do managed Threat Defense devices ke beech AES-GCM aur PFS wala tunnel, route-based (VTI) design, aur employees ke liye Cisco Secure Client aur split tunnelling ke saath remote access. Aap IKEv2 errors, IPsec counters aur packet-tracer padhna bhi seekhoge, aur yeh sab interview mein samjhana bhi.</p>
<p><b>Prerequisites.</b> Aapko IP addressing, routing aur NAT pehle se aane chahiye, aur pichhle modules ka basic Threat Defense workflow: security zones, access control policy, NAT rules aur <b>Deploy</b> (module <i>Threat Defense &amp; Management Center</i>). IPsec aur IKEv2 ki theory ASA par <i>Site-to-site IPsec VPN</i> aur cryptography module mein step by step bani thi; chapter 2 use refresh karta hai, par zero se dobara shuru nahi karta.</p>

<h3>Ek analogy: do offices ke beech armoured courier</h3>
<p>Socho aapki company ka ek head office hai aur doosre shehar mein ek branch. Normal post (internet) se documents bhejna sasta hai, par raste mein koi bhi envelope khol sakta hai, padh sakta hai ya badal sakta hai. Isliye aap ek <b>armoured courier service</b> hire karte ho. Pehli delivery se pehle dono office managers milte hain aur teen cheezein tay karte hain: kaunsa lock aur safe use hoga, apni pehchaan kaise prove karenge, aur kaunse departments is tarah documents bhej sakte hain. Uske baad un departments ka har document ek office mein box mein lock hota hai, public roads se le jaaya jaata hai, aur sirf doosre office mein unlock hota hai.</p>
<p>Yahi <b>site-to-site VPN</b> hai. Office managers do VPN gateways hain (yahan ek Threat Defense aur ek router). Meeting <b>IKE</b> (Internet Key Exchange) hai. Locked box <b>ESP</b> (Encapsulating Security Payload) hai. Departments ki list <b>protected networks</b> ka set hai. <b>Remote access VPN</b> ghar se kaam karne wale ek employee ke liye wahi courier service hai: employee ek personal key card rakhta hai (Secure Client plus username, password ya certificate) aur office ke andar ek temporary desk number paata hai (VPN pool se ek address).</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Module topology">
<rect x="10" y="20" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="12">PC1 10.0.1.10</text>
<rect x="10" y="80" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="65" y="105" text-anchor="middle" class="svg-ink" font-size="12">SRV1 10.0.1.20</text>
<rect x="160" y="50" width="110" height="50" rx="8" fill="#fed7aa"/><text x="215" y="72" text-anchor="middle" class="svg-ink" font-size="13">NK-FTD</text><text x="215" y="90" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.2</text>
<rect x="310" y="50" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="355" y="80" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<rect x="440" y="20" width="100" height="50" rx="8" fill="#bae6fd"/><text x="490" y="42" text-anchor="middle" class="svg-ink" font-size="13">BR1</text><text x="490" y="60" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.2</text>
<rect x="560" y="25" width="74" height="40" rx="8" fill="#bbf7d0"/><text x="597" y="50" text-anchor="middle" class="svg-ink" font-size="12">PC-BR</text>
<rect x="440" y="100" width="120" height="40" rx="8" fill="#ddd6fe"/><text x="500" y="125" text-anchor="middle" class="svg-ink" font-size="12">HOME-PC</text>
<line x1="120" y1="40" x2="160" y2="70" stroke="#64748b"/><line x1="120" y1="100" x2="160" y2="85" stroke="#64748b"/>
<line x1="270" y1="75" x2="310" y2="75" stroke="#64748b"/><line x1="400" y1="65" x2="440" y2="45" stroke="#64748b"/><line x1="400" y1="85" x2="440" y2="120" stroke="#64748b"/><line x1="540" y1="45" x2="560" y2="45" stroke="#64748b"/>
<path d="M215 160 Q355 215 490 160" fill="none" stroke="#0284c7" stroke-width="2" stroke-dasharray="6 4"/><text x="355" y="232" text-anchor="middle" class="svg-accent" font-size="13">site-to-site IPsec: 10.0.1.0/24 se 10.20.0.0/24</text>
<path d="M215 110 Q330 160 445 125" fill="none" stroke="#7c3aed" stroke-width="2" stroke-dasharray="3 3"/><text x="330" y="175" text-anchor="middle" class="svg-muted" font-size="12">Secure Client (TLS/DTLS 443)</text>
</svg><p class="cap">Poore module mein use hone wala lab network: NK-FTD ke peeche HQ, BR1 ke peeche branch, aur HOME-PC par ek remote employee.</p></div>

<h3>Companies firewall ko hi VPN gateway kyun banati hain</h3>
<p>Firewall pehle se edge par baitha hai, public address pehle se uska hai aur boundary cross karne wali har cheez woh pehle se inspect karta hai. Use VPN headend banane ka matlab hai ek hi device tay karta hai <b>kaun</b> andar aa sakta hai (authentication), <b>kya</b> access kar sakta hai (access control) aur traffic <b>kaise</b> protect hoga (encryption), aur logs ka ek hi set sab record karta hai. Threat Defense par extra fayda yeh hai ki decrypted traffic phir bhi Snort se guzar sakta hai: intrusion prevention, file aur malware policy aur URL filtering VPN users par bilkul waise hi lagti hain jaise office LAN par, jab tak aap jaan-boojhkar unhe bypass na karo.</p>

<h3>Do families aur Management Center mein unki jagah</h3>
<table class="cmp"><tr><th></th><th>Site-to-site</th><th>Remote access</th></tr>
<tr><td>Jodta hai</td><td>do ya zyada networks</td><td>ek user device ko company se</td></tr>
<tr><td>Protocol</td><td>IKEv2 ke saath IPsec (purane peers ke liye IKEv1)</td><td>DTLS ke saath SSL/TLS, ya IPsec-IKEv2</td></tr>
<tr><td>Kahan banta hai</td><td>Devices → VPN · Site To Site</td><td>Devices → VPN · Remote Access</td></tr>
<tr><td>Building blocks</td><td>topology, endpoints, IKE aur IPsec policies</td><td>connection profile, group policy, pool, certificate, Secure Client image</td></tr>
<tr><td>Inside hosts dekhte hain</td><td>doosri site ke real LAN addresses</td><td>VPN pool se client ka address</td></tr></table>
<p>Shared objects (IKEv2 policies, IPsec proposals, address pools, certificates aur Secure Client files) <b>Objects → VPN Objects</b> mein hain, aur tunnels aur Secure Client sessions ki live state <b>Analysis → VPN Monitoring</b> mein. Jab tak aap <b>Deploy</b> click nahi karte, device tak kuch nahi pahunchta: Management Center ek candidate policy edit karta hai, phir use push karta hai.</p>

<h3>Module ka map</h3>
<ol><li>Chapters 2 se 8: Threat Defense par IPsec aur IKEv2, topologies, IKE aur IPsec policies, endpoints aur protected networks, NAT exemption, access control vs <code>sysopt permit-vpn</code>, aur route-based VTI.</li>
<li>Chapters 9 se 11: wizard ke saath remote access, AAA, certificates aur pools, phir group policies, split tunnelling, DNS aur Secure Client modules.</li>
<li>Chapter 12: ek troubleshooting workflow jo dono ticket labs walk karta hai. Chapter 13: summary aur exam checklist.</li></ol>

<div class="eg"><p><b>Worked example.</b> HQ NK-FTD (outside 203.0.113.2) ke peeche 10.0.1.0/24 use karta hai. Branch BR1 (outside 198.51.100.2) ke peeche 10.20.0.0/24 use karti hai. Jab PC1 (10.0.1.10) PC-BR (10.20.0.10) ko ping karta hai, NK-FTD se nikalne wale packet ka outer header 203.0.113.2 → 198.51.100.2 hota hai, IP protocol 50 (ESP). ISP sirf woh outer header aur encrypted bytes dekhta hai. BR1 use decrypt karke original 10.0.1.10 → 10.20.0.10 packet deliver karta hai. HOME-PC (198.51.100.20) par remote employee ravi ko pool se 10.50.0.10 milta hai, isliye SRV1 requests 10.50.0.10 se aati dekhta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Yeh sochna ki VPN tunnel "up hai" matlab kaam khatam. Threat Defense par users khush hone se pehle teen aur cheezein sahi honi chahiye: traffic NAT se exempt ho, decrypted traffic access control se allow ho (ya use bypass kare), aur routing remote networks ko sahi interface se bahar bheje. Zyadatar VPN tickets inhi teen ke baare mein hote hain, encryption ke baare mein nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions aksar objects mix kar dete hain: <b>connection profile</b> (tunnel group) tay karta hai user kaise authenticate karega aur use kaunsa pool aur group policy milegi; <b>group policy</b> tay karti hai use kya milta hai (split tunnel, DNS, banner, timeouts). Yaad rakho "profile = andar kaise aaoge, policy = kya milega".</p></div>

<div class="scn"><h4>Woh branch jo wapas MPLS par gayi</h4><p>Ek retail chain har store ke liye mehenga MPLS circuit pay karti thi kyunki "internet VPN unreliable hote hain". Contract renewal par network team ne store routers se HQ Threat Defense tak site-to-site VPN test kiya. Pehla pilot fail hua: tunnel up aaya par point-of-sale system HQ server tak nahi pahunch paaya. Engineer ne paaya ki HQ traffic crypto map tak pahunchne se pehle normal internet PAT rule se translate ho raha tha, isliye tunnel mein kabhi gaya hi nahi. Topology ke ek NAT exemption checkbox ne ise theek kiya, aur ek quarter mein 40 stores broadband plus VPN par shift ho gaye.</p><p><b>Lesson:</b> VPN khud shayad hi problem hota hai; NAT, access control aur routing ke saath uska interaction aksar hota hai.</p></div>

<div class="iv"><p class="q">"Site-to-site aur remote access VPN mein kya fark hai, aur Threat Defense par dono kaise banaoge?"</p><p>Strong answer: site-to-site gateways ke through networks ko IKEv2 wale IPsec se jodta hai, jo Management Center mein endpoints, protected networks, IKE aur IPsec policies wali topology ki tarah banta hai. Remote access ek user ko Cisco Secure Client se TLS/DTLS ya IKEv2 par company se jodta hai, jo remote access wizard se banta hai: connection profile, authentication, address pool, group policy, certificate aur client image. Phir NAT exemption, decrypted traffic ke liye access control aur verification commands jaise <code>show crypto ipsec sa</code> aur <code>show vpn-sessiondb anyconnect</code> mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPN untrusted network ke paar confidentiality, integrity aur peer authentication deta hai.</li>
<li>Site-to-site = network se network IPsec/IKEv2 ke saath; remote access = user se network Secure Client ke saath.</li>
<li>Site-to-site Devices → VPN · Site To Site mein, remote access Devices → VPN · Remote Access mein, shared objects Objects → VPN Objects mein banao.</li>
<li>Analysis → VPN Monitoring mein monitor karo; Deploy ke bina kuch active nahi hota.</li>
<li>Zyadatar VPN problems NAT, access control ya routing hoti hain, cryptography nahi.</li>
</ul></div>
`}};export{e as default};