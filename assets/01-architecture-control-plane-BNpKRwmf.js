var e={id:`security-architecture`,h:{en:`SD-WAN security architecture and the secure control plane`,hi:`SD-WAN security architecture aur secure control plane`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how Catalyst SD-WAN protects itself and the traffic it carries. You will see how the control plane is secured with DTLS or TLS, how identity and certificates decide which devices may join the fabric, how the data plane is encrypted with IPsec and AES-256-GCM, and how keys are rotated. Then you will build the protections on top: segmentation with VPNs, per-VPN access lists, the enterprise firewall with application awareness, IPS, URL filtering and AMP through the UTD container, DNS security with Umbrella, and SIG tunnels. Finally you will secure SD-WAN Manager with role-based access and AAA, and troubleshoot security problems. The voice of this module is <b>defensive</b>: we learn how to protect, verify and monitor. <b>Prerequisites:</b> the SD-WAN components (Manager, Controller, Validator, WAN Edge), VPN 0 versus service VPNs, TLOCs and colors, and basic IPsec ideas (encryption, integrity, keys).</p>

<h3>Analogy: a secure office campus</h3>
<p>Think of a large office campus. A guard at the gate checks your ID card before you enter (<b>authentication and authorization</b> of devices). The ID cards are printed by a trusted office and expire after some time (<b>certificates</b>). Inside, staff move through corridors in sealed bags that only the destination can open (<b>IPsec encryption</b>). Departments have separate floors with locked doors (<b>segmentation</b>). At the main door a security desk checks bags and visitors (<b>firewall, IPS, URL filtering</b>). A reception manager decides who may change the building rules (<b>RBAC</b>). Security is layers, and each layer assumes the other one may fail.</p>

<h3>The three layers to protect</h3>
<table class="cmp"><tr><th>Layer</th><th>What it carries</th><th>Main protection</th></tr>
<tr><td><b>Management and orchestration</b></td><td>Manager sessions, templates, NETCONF, Validator introductions</td><td>HTTPS, RBAC, AAA, certificates</td></tr>
<tr><td><b>Control plane</b></td><td>OMP routes, policies and keys between WAN Edges and Controllers</td><td>DTLS or TLS with mutual certificate authentication</td></tr>
<tr><td><b>Data plane</b></td><td>User traffic between WAN Edges</td><td>IPsec ESP with AES-256-GCM, key rotation, anti-replay</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Security layers of Catalyst SD-WAN">
<rect x="10" y="10" width="620" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="14">Management: Manager (HTTPS, RBAC, AAA) and Validator</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">who may configure and who may join</text>
<rect x="10" y="85" width="620" height="60" rx="10" fill="#bae6fd"/><text x="320" y="111" text-anchor="middle" class="svg-ink" font-size="14">Control plane: WAN Edge to Controller over DTLS or TLS</text><text x="320" y="131" text-anchor="middle" class="svg-muted" font-size="12">OMP routes, policies, encryption keys</text>
<rect x="10" y="160" width="620" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="186" text-anchor="middle" class="svg-ink" font-size="14">Data plane: WAN Edge to WAN Edge over IPsec (AES-256-GCM)</text><text x="320" y="206" text-anchor="middle" class="svg-muted" font-size="12">segmented by VPN, inspected by firewall, IPS and DNS security</text>
<text x="320" y="242" text-anchor="middle" class="svg-accent" font-size="12">Each layer has its own identity, keys and failure modes</text>
</svg><p class="cap">Three layers, three sets of controls. The rest of this module walks through them one by one.</p></div>

<h3>Secure control plane: DTLS and TLS</h3>
<p>Every WAN Edge builds a permanent control connection to the Controller (and a short one to the Validator, which introduces it). These connections use <b>DTLS</b> by default, which runs over UDP, or <b>TLS</b> over TCP. Both authenticate the two ends with certificates and encrypt everything: routes, policies and the keys that the data plane will use. You can change the protocol on a device:</p>
<pre class="code">security control protocol tls
security control tls-port 23456</pre>
<p>The default is DTLS. For TLS the default TCP port is 23456 and it can be changed (range 1025 to 65535). Choose TLS when a firewall or provider treats long-lived UDP badly, or when you must pass the connection through a TCP-only path. Controllers should accept what the edges use, so plan the change for the whole domain. Verify the result with <code>show sdwan control connections</code>: the <i>PEER PROT</i> column shows <code>dtls</code> or <code>tls</code>, and the state must be <code>up</code>.</p>

<h3>Why the control plane is the crown jewel</h3>
<p>If an attacker could inject routes or policies into OMP, he could redirect traffic. That is why the Controllers verify each device identity before accepting any OMP update, why the Validator only introduces devices that are authorized, and why transport firewalls should allow only the required control ports to the Controllers. In Chapter 2 you will see how identity works.</p>

<div class="eg"><p><b>Worked example.</b> Bharat Retail's Pune branch E-BR1 (site 200) has two transports. After boot, E-BR1 contacts VBOND, receives the addresses of VSMART and VMANAGE, and opens a DTLS control connection to each on every transport. <code>show sdwan control connections</code> shows two rows for VSMART (one per color) with state <code>up</code>. The branch firewall at the ISP edge allows UDP 12346 outbound and nothing else inbound; the control connection works because E-BR1 initiates it.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Treating the control plane as "internal, so no protection needed": it crosses the internet. (2) Changing to TLS on edges but not on Controllers, so the connections stay down. (3) Opening management ports on Controllers to the whole internet. (4) Assuming IPsec protects the control connection; it is DTLS or TLS.</p></div>

<div class="exam"><p><b>Exam trap.</b> The control plane uses <b>DTLS or TLS</b>; the data plane uses <b>IPsec</b>. DTLS (UDP) is the default; TLS uses TCP port 23456 by default. BFD runs inside the IPsec tunnels, not in the control connection.</p></div>

<div class="scn"><h4>Control connections flap after a firewall change</h4><p>After the provider changed its edge firewall, Pune users lost the overlay twice a day. Logs showed the DTLS connection to VSMART restarting. The UDP session timeout on the new firewall was short. The team moved the edges to TLS on port 23456 and the firewall treated the long TCP session correctly. The connections stayed up.</p><p><b>Lesson:</b> pick DTLS or TLS to suit the path, and change it for the whole domain.</p></div>

<div class="iv"><p class="q">"How is the Catalyst SD-WAN control plane secured?"</p><p>Each WAN Edge opens DTLS (default, UDP) or TLS (TCP, default port 23456) connections to the Controller and the Validator. Both ends authenticate each other with certificates and all control traffic, including OMP routes, policies and keys, is encrypted. The protocol is selected with security control protocol and the TLS port can be changed. I verify with show sdwan control connections.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three layers: management, control plane (DTLS or TLS), data plane (IPsec).</li>
<li>DTLS is the default; TLS uses TCP 23456 by default and the port is configurable.</li>
<li>Mutual certificate authentication guards the control plane.</li>
<li>Verify with <code>show sdwan control connections</code>.</li>
<li>Defensive design: allow only required ports and assume each layer may fail.</li>
</ul></div>
`,hi:`
<p><b>Is module mein tum kya seekhoge.</b> Tum seekhoge ki Catalyst SD-WAN khud ko aur apne traffic ko kaise protect karta hai. Dekhoge ki control plane DTLS ya TLS se kaise secure hota hai, identity aur certificates kaise tay karte hain ki kaunse devices fabric mein judein, data plane IPsec aur AES-256-GCM se kaise encrypt hota hai, aur keys kaise rotate hoti hain. Phir uske upar ki protections banaoge: VPNs se segmentation, per-VPN access lists, application awareness wala enterprise firewall, UTD container ke through IPS, URL filtering aur AMP, Umbrella se DNS security, aur SIG tunnels. Aakhir mein SD-WAN Manager ko role-based access aur AAA se secure karoge, aur security problems troubleshoot karoge. Is module ki awaaz <b>defensive</b> hai: hum protect, verify aur monitor karna seekhte hain. <b>Prerequisites:</b> SD-WAN components (Manager, Controller, Validator, WAN Edge), VPN 0 versus service VPNs, TLOCs aur colors, aur basic IPsec ideas (encryption, integrity, keys).</p>

<h3>Analogy: secure office campus</h3>
<p>Ek bade office campus ki kalpana karo. Gate par guard entry se pehle tumhara ID card check karta hai (devices ki <b>authentication aur authorization</b>). ID cards ek trusted office chhapta hai aur kuch time baad expire ho jaate hain (<b>certificates</b>). Andar staff sealed bags mein corridors se jaata hai jinhe sirf destination khol sakta hai (<b>IPsec encryption</b>). Departments ki alag floors hain jinke darwaze locked hain (<b>segmentation</b>). Main darwaze par security desk bags aur visitors check karta hai (<b>firewall, IPS, URL filtering</b>). Reception manager tay karta hai ki building ke rules kaun badal sakta hai (<b>RBAC</b>). Security layers ka naam hai, aur har layer maanti hai ki doosri fail ho sakti hai.</p>

<h3>Protect karne ki teen layers</h3>
<table class="cmp"><tr><th>Layer</th><th>Kya le jaati hai</th><th>Main protection</th></tr>
<tr><td><b>Management aur orchestration</b></td><td>Manager sessions, templates, NETCONF, Validator introductions</td><td>HTTPS, RBAC, AAA, certificates</td></tr>
<tr><td><b>Control plane</b></td><td>WAN Edges aur Controllers ke beech OMP routes, policies aur keys</td><td>Mutual certificate authentication ke saath DTLS ya TLS</td></tr>
<tr><td><b>Data plane</b></td><td>WAN Edges ke beech user traffic</td><td>AES-256-GCM ke saath IPsec ESP, key rotation, anti-replay</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Catalyst SD-WAN ki security layers">
<rect x="10" y="10" width="620" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="14">Management: Manager (HTTPS, RBAC, AAA) aur Validator</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">kaun configure kare aur kaun jude</text>
<rect x="10" y="85" width="620" height="60" rx="10" fill="#bae6fd"/><text x="320" y="111" text-anchor="middle" class="svg-ink" font-size="14">Control plane: WAN Edge se Controller, DTLS ya TLS par</text><text x="320" y="131" text-anchor="middle" class="svg-muted" font-size="12">OMP routes, policies, encryption keys</text>
<rect x="10" y="160" width="620" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="186" text-anchor="middle" class="svg-ink" font-size="14">Data plane: WAN Edge se WAN Edge, IPsec (AES-256-GCM)</text><text x="320" y="206" text-anchor="middle" class="svg-muted" font-size="12">VPN se segmented, firewall, IPS aur DNS security se inspected</text>
<text x="320" y="242" text-anchor="middle" class="svg-accent" font-size="12">Har layer ki apni identity, keys aur failure modes hain</text>
</svg><p class="cap">Teen layers, teen controls ke set. Module ke baaki chapters inhe ek ek karke dekhte hain.</p></div>

<h3>Secure control plane: DTLS aur TLS</h3>
<p>Har WAN Edge Controller se permanent control connection banata hai (aur Validator se chhota connection jo use introduce karta hai). Yeh connections by default <b>DTLS</b> (UDP par) ya <b>TLS</b> (TCP par) use karte hain. Dono taraf certificates se authenticate hote hain aur sab kuch encrypt hota hai: routes, policies aur woh keys jo data plane use karega. Device par protocol badal sakte ho:</p>
<pre class="code">security control protocol tls
security control tls-port 23456</pre>
<p>Default DTLS hai. TLS ke liye default TCP port 23456 hai aur badla ja sakta hai (range 1025 se 65535). TLS tab chuno jab firewall ya provider long-lived UDP ko achchi tarah handle na kare, ya connection TCP-only path se guzarna ho. Controllers wahi accept karein jo edges use karte hain, isliye change poore domain ke liye plan karo. Result <code>show sdwan control connections</code> se verify karo: <i>PEER PROT</i> column <code>dtls</code> ya <code>tls</code> dikhata hai, aur state <code>up</code> honi chahiye.</p>

<h3>Control plane crown jewel kyun hai</h3>
<p>Agar koi attacker OMP mein routes ya policies daal sake to woh traffic redirect kar sakta hai. Isliye Controllers har OMP update se pehle device identity verify karte hain, Validator sirf authorized devices ko introduce karta hai, aur transport firewalls Controllers tak sirf zaroori control ports allow karein. Chapter 2 mein dekhoge ki identity kaise kaam karti hai.</p>

<div class="eg"><p><b>Worked example.</b> Bharat Retail ki Pune branch E-BR1 (site 200) ke paas do transports hain. Boot ke baad E-BR1 VBOND se milta hai, VSMART aur VMANAGE ke addresses paata hai, aur har transport par dono ke saath DTLS control connection kholta hai. <code>show sdwan control connections</code> VSMART ke liye do rows (har color ki ek) state <code>up</code> ke saath dikhata hai. ISP edge par branch firewall UDP 12346 outbound allow karta hai aur inbound kuch nahi; connection isliye chalta hai kyunki E-BR1 initiate karta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Control plane ko "internal, isliye protection nahi chahiye" samjhna: yeh internet se guzarta hai. (2) Edges par TLS karna lekin Controllers par nahi, isliye connections down rehte hain. (3) Controllers ke management ports poore internet ke liye kholna. (4) Maan lena ki IPsec control connection ko protect karta hai; woh DTLS ya TLS hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Control plane <b>DTLS ya TLS</b> use karta hai; data plane <b>IPsec</b>. DTLS (UDP) default hai; TLS by default TCP port 23456 use karta hai. BFD IPsec tunnels ke andar chalta hai, control connection mein nahi.</p></div>

<div class="scn"><h4>Firewall change ke baad control connections flap</h4><p>Provider ne apna edge firewall badla to Pune users ka overlay din mein do baar toot gaya. Logs mein VSMART ka DTLS connection restart hota dikha. Naye firewall par UDP session timeout chhota tha. Team ne edges ko TLS port 23456 par move kiya aur firewall ne long TCP session sahi tarah handle kiya. Connections up rahe.</p><p><b>Lesson:</b> path ke hisaab se DTLS ya TLS chuno, aur poore domain ke liye badlo.</p></div>

<div class="iv"><p class="q">"Catalyst SD-WAN control plane kaise secure hota hai?"</p><p>Har WAN Edge Controller aur Validator ke saath DTLS (default, UDP) ya TLS (TCP, default port 23456) connections kholta hai. Dono ends certificates se ek doosre ko authenticate karte hain aur saara control traffic, OMP routes, policies aur keys sahit, encrypt hota hai. Protocol security control protocol se chuna jaata hai aur TLS port badla ja sakta hai. Main show sdwan control connections se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen layers: management, control plane (DTLS ya TLS), data plane (IPsec).</li>
<li>DTLS default hai; TLS by default TCP 23456 use karta hai aur port configurable hai.</li>
<li>Mutual certificate authentication control plane ki raksha karta hai.</li>
<li><code>show sdwan control connections</code> se verify karo.</li>
<li>Defensive design: sirf zaroori ports allow karo aur maano ki har layer fail ho sakti hai.</li>
</ul></div>
`}};export{e as default};