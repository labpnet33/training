var e={id:`sdwan-architecture`,h:{en:`Catalyst SD-WAN architecture: planes, components, benefits and limits`,hi:`Catalyst SD-WAN architecture: planes, components, fayde aur seemayein`},body:{en:`
<p>Think of an airport. The <b>security gate</b> checks your passport before you may enter. The <b>control tower</b> tells every aircraft where the others are and which runway to use. The <b>airport authority office</b> writes the rules, schedules and maintenance plans. And the <b>aircraft</b> carry the passengers. Catalyst SD-WAN splits the WAN into exactly these four jobs, called <b>planes</b>.</p>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Four planes of Catalyst SD-WAN">
<rect x="10" y="10" width="200" height="60" rx="8" fill="#ddd6fe"/><text x="110" y="35" text-anchor="middle" class="svg-ink" font-size="14">SD-WAN Manager</text><text x="110" y="55" text-anchor="middle" class="svg-muted" font-size="12">management plane</text>
<rect x="220" y="10" width="200" height="60" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">SD-WAN Controller</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="12">control plane (OMP)</text>
<rect x="430" y="10" width="200" height="60" rx="8" fill="#fde68a"/><text x="530" y="35" text-anchor="middle" class="svg-ink" font-size="14">SD-WAN Validator</text><text x="530" y="55" text-anchor="middle" class="svg-muted" font-size="12">orchestration plane</text>
<rect x="60" y="200" width="200" height="50" rx="8" fill="#bbf7d0"/><text x="160" y="222" text-anchor="middle" class="svg-ink" font-size="14">WAN edge (site 100)</text><text x="160" y="240" text-anchor="middle" class="svg-muted" font-size="12">data plane</text>
<rect x="380" y="200" width="200" height="50" rx="8" fill="#bbf7d0"/><text x="480" y="222" text-anchor="middle" class="svg-ink" font-size="14">WAN edge (site 200)</text><text x="480" y="240" text-anchor="middle" class="svg-muted" font-size="12">data plane</text>
<line x1="110" y1="70" x2="160" y2="200" stroke="#64748b" stroke-dasharray="4 3"/><line x1="320" y1="70" x2="160" y2="200" stroke="#64748b" stroke-dasharray="4 3"/><line x1="320" y1="70" x2="480" y2="200" stroke="#64748b" stroke-dasharray="4 3"/><line x1="530" y1="70" x2="480" y2="200" stroke="#64748b" stroke-dasharray="2 4"/>
<line x1="260" y1="225" x2="380" y2="225" stroke="#64748b" stroke-width="4"/><text x="320" y="215" text-anchor="middle" class="svg-accent" font-size="12">IPsec + BFD</text>
<text x="320" y="272" text-anchor="middle" class="svg-muted" font-size="12">DTLS/TLS control connections carry NETCONF (Manager) and OMP (Controller)</text>
</svg><p class="cap">Management, control and orchestration live in controllers; only the edges touch user traffic.</p></div>

<h3>The four components, one by one</h3>
<dl class="terms">
<dt>SD-WAN Validator (formerly vBond) — orchestration plane</dt>
<dd>The <b>first point of contact</b> for every device. It authenticates a joining edge (certificate plus an authorised serial list), tells it the addresses of the Controllers and Managers, helps with <b>NAT traversal</b> (it sees the public IP and port the edge really arrives from, similar to STUN) and spreads edges across Controllers. It must have a public (or 1:1 NAT) address. The edge's connection to it is short-lived.</dd>
<dt>SD-WAN Manager (formerly vManage) — management plane</dt>
<dd>The GUI and REST API: device onboarding lists, <b>templates and configuration groups</b>, policy authoring, monitoring, alarms, software upgrades, certificates. It pushes configuration to edges with <b>NETCONF</b> over the control connection. Usually a cluster for scale and resilience.</dd>
<dt>SD-WAN Controller (formerly vSmart) — control plane</dt>
<dd>Runs <b>OMP</b> with every edge and acts like a <b>BGP route reflector</b>: it receives routes and TLOCs, applies centralised control policy, and reflects the result. It also distributes <b>data policy</b> and relays the IPsec keys each edge generates. It never forwards user traffic. Deploy at least two.</dd>
<dt>WAN edge — data plane</dt>
<dd>Physical or virtual routers (Catalyst 8000 family, ISR 1000/4000 in controller mode, Catalyst 8000V in the cloud, legacy vEdge). They build <b>IPsec tunnels</b> to each other, run <b>BFD</b> in each tunnel, and on the LAN side run normal protocols (OSPF, BGP, EIGRP, static) in <b>service VPNs</b>.</dd>
</dl>

<h3>How they talk</h3>
<ul>
<li><b>Control connections</b>: DTLS (UDP, base port 12346) by default, TLS (TCP) as an option towards Controllers and Managers. The Validator always uses DTLS. Each edge keeps one Manager connection and, by default, up to two Controller connections per transport.</li>
<li><b>Data plane</b>: IPsec ESP (AES-256-GCM) encapsulated in UDP so it passes NAT. There is no IKE between edges: each edge generates its own keys and the Controller distributes them over OMP, which scales to thousands of sites.</li>
<li><b>Hosting</b>: controllers can be Cisco cloud-hosted (the most common), on-premises, or run by a service provider.</li>
</ul>

<div class="eg"><p><b>Worked example: the lab.</b> In <i>Bring two sites into the SD-WAN fabric</i> one box called <b>CTRL</b> (system-ip 10.255.0.1, site 1, organization NK-FABRIC, reachable at 203.0.113.2) plays Validator, Manager and Controller together, and its web GUI gives you the dashboard, templates and policy pages. <b>EDGE1</b> (Mumbai, site 100, system-ip 10.255.0.11) and <b>EDGE2</b> (Pune, site 200) are the WAN edges, each with an <b>INET</b> circuit (colour biz-internet) and an <b>MPLS</b> circuit (colour mpls). Only INET can reach CTRL. In production those three controller roles would be separate, redundant virtual machines.</p></div>

<h3>Benefits and limitations (blueprint 1.4)</h3>
<table class="cmp"><tr><th>Benefits</th><th>Limitations and trade-offs</th></tr>
<tr><td>Transport independence: MPLS, broadband, LTE/5G all used actively</td><td>Internet circuits carry no SLA; SD-WAN can only choose the best of the paths you bought</td></tr>
<tr><td>Central management, templates, zero-touch onboarding</td><td>New dependency on controllers, certificates and correct time (NTP)</td></tr>
<tr><td>Application-aware routing using live loss, latency and jitter</td><td>Full-mesh BFD tunnels grow as n(n-1)/2; big fabrics need topology policy</td></tr>
<tr><td>Encryption everywhere and segmentation with service VPNs</td><td>IPsec and UDP headers reduce MTU; fragmentation must be planned</td></tr>
<tr><td>Direct cloud and SaaS access (Cloud OnRamp)</td><td>Licensing cost, new skills and new troubleshooting tools</td></tr>
<tr><td>Separated planes: edges keep forwarding if controllers fail</td><td>Without controllers you cannot change configuration or policy, and after the OMP graceful-restart timer (default 12 hours) routes age out</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Putting the Validator behind a dynamic NAT (edges cannot find it). Deploying a single Controller (it becomes a single point of failure for new routes and policy). Forgetting that every component validates certificates, so a controller with the wrong clock rejects everyone.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Which component performs NAT traversal and initial authentication?" is the <b>Validator</b>, not the Controller. "Which component runs OMP and distributes policy?" is the <b>Controller</b>. "Which pushes configuration?" is the <b>Manager</b>. The data plane is the <b>WAN edge</b>. If an answer says the Controller forwards data traffic, it is wrong.</p></div>

<div class="scn"><h4>The controllers went away, the branches did not</h4><p>A logistics company lost connectivity to its cloud-hosted controllers for 40 minutes because of a DNS change at its internet edge. The help desk expected all 220 branches to go down. Nothing happened to users: every edge kept its OMP routes, IPsec keys and BFD sessions. The only symptoms were a red dashboard and a planned template push that failed. Once DNS was fixed the control connections re-formed within seconds.</p><p><b>Lesson:</b> separating control and data planes means a controller outage is a management problem first, not an instant traffic outage. It becomes a traffic problem only if it lasts beyond the graceful-restart and rekey windows.</p></div>

<div class="iv"><p class="q">"Name the Catalyst SD-WAN components and what each does."</p><p>Strong answer: Validator (vBond) for orchestration: first authentication, controller discovery, NAT traversal. Manager (vManage) for management: GUI, API, templates, monitoring, pushes config with NETCONF. Controller (vSmart) for control: OMP route reflector, policy and key distribution. WAN edges for the data plane: IPsec tunnels, BFD, service-side routing. Then add that the controllers never forward user data and that there is no IKE between edges.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four planes: orchestration (Validator), management (Manager), control (Controller), data (WAN edges).</li>
<li>Control connections use DTLS (UDP 12346) or TLS; OMP and NETCONF ride inside them.</li>
<li>Edges generate IPsec keys; the Controller distributes them via OMP, so no IKE mesh is needed.</li>
<li>Benefits: transport independence, central management, app-aware routing, security, cloud access.</li>
<li>Limits: controller and certificate dependency, internet has no SLA, tunnel scale, MTU, cost and skills.</li>
</ul></div>
`,hi:`
<p>Ek airport socho. <b>Security gate</b> andar jaane se pehle aapka passport check karta hai. <b>Control tower</b> har aircraft ko batata hai ki baaki kahan hain aur kaunsa runway use karna hai. <b>Airport authority office</b> rules, schedules aur maintenance plans likhta hai. Aur <b>aircraft</b> passengers le jaate hain. Catalyst SD-WAN WAN ko bilkul inhi chaar kaamon mein baant-ta hai, jinhe <b>planes</b> kehte hain.</p>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Catalyst SD-WAN ke chaar planes">
<rect x="10" y="10" width="200" height="60" rx="8" fill="#ddd6fe"/><text x="110" y="35" text-anchor="middle" class="svg-ink" font-size="14">SD-WAN Manager</text><text x="110" y="55" text-anchor="middle" class="svg-muted" font-size="12">management plane</text>
<rect x="220" y="10" width="200" height="60" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">SD-WAN Controller</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="12">control plane (OMP)</text>
<rect x="430" y="10" width="200" height="60" rx="8" fill="#fde68a"/><text x="530" y="35" text-anchor="middle" class="svg-ink" font-size="14">SD-WAN Validator</text><text x="530" y="55" text-anchor="middle" class="svg-muted" font-size="12">orchestration plane</text>
<rect x="60" y="200" width="200" height="50" rx="8" fill="#bbf7d0"/><text x="160" y="222" text-anchor="middle" class="svg-ink" font-size="14">WAN edge (site 100)</text><text x="160" y="240" text-anchor="middle" class="svg-muted" font-size="12">data plane</text>
<rect x="380" y="200" width="200" height="50" rx="8" fill="#bbf7d0"/><text x="480" y="222" text-anchor="middle" class="svg-ink" font-size="14">WAN edge (site 200)</text><text x="480" y="240" text-anchor="middle" class="svg-muted" font-size="12">data plane</text>
<line x1="110" y1="70" x2="160" y2="200" stroke="#64748b" stroke-dasharray="4 3"/><line x1="320" y1="70" x2="160" y2="200" stroke="#64748b" stroke-dasharray="4 3"/><line x1="320" y1="70" x2="480" y2="200" stroke="#64748b" stroke-dasharray="4 3"/><line x1="530" y1="70" x2="480" y2="200" stroke="#64748b" stroke-dasharray="2 4"/>
<line x1="260" y1="225" x2="380" y2="225" stroke="#64748b" stroke-width="4"/><text x="320" y="215" text-anchor="middle" class="svg-accent" font-size="12">IPsec + BFD</text>
<text x="320" y="272" text-anchor="middle" class="svg-muted" font-size="12">DTLS/TLS control connections NETCONF (Manager) aur OMP (Controller) le jaate hain</text>
</svg><p class="cap">Management, control aur orchestration controllers mein rehte hain; sirf edges user traffic ko chhoote hain.</p></div>

<h3>Chaar components, ek-ek karke</h3>
<dl class="terms">
<dt>SD-WAN Validator (pehle vBond) — orchestration plane</dt>
<dd>Har device ka <b>pehla point of contact</b>. Yeh join karne wale edge ko authenticate karta hai (certificate aur authorised serial list), use Controllers aur Managers ke addresses batata hai, <b>NAT traversal</b> mein madad karta hai (yeh dekhta hai ki edge asal mein kis public IP aur port se aa raha hai, STUN jaisa) aur edges ko Controllers mein baant-ta hai. Iska public (ya 1:1 NAT) address hona chahiye. Edge ka isse connection thodi der ka hota hai.</dd>
<dt>SD-WAN Manager (pehle vManage) — management plane</dt>
<dd>GUI aur REST API: device onboarding lists, <b>templates aur configuration groups</b>, policy likhna, monitoring, alarms, software upgrades, certificates. Yeh control connection par <b>NETCONF</b> se edges ko configuration push karta hai. Scale aur resilience ke liye aksar cluster hota hai.</dd>
<dt>SD-WAN Controller (pehle vSmart) — control plane</dt>
<dd>Har edge ke saath <b>OMP</b> chalata hai aur <b>BGP route reflector</b> jaisa kaam karta hai: routes aur TLOCs receive karta hai, centralised control policy lagata hai, aur result reflect karta hai. Yeh <b>data policy</b> bhi baant-ta hai aur har edge ki banayi IPsec keys aage pahunchata hai. Yeh kabhi user traffic forward nahi karta. Kam se kam do deploy karo.</dd>
<dt>WAN edge — data plane</dt>
<dd>Physical ya virtual routers (Catalyst 8000 family, controller mode mein ISR 1000/4000, cloud mein Catalyst 8000V, purane vEdge). Yeh aapas mein <b>IPsec tunnels</b> banate hain, har tunnel mein <b>BFD</b> chalate hain, aur LAN side par <b>service VPNs</b> mein normal protocols (OSPF, BGP, EIGRP, static) chalate hain.</dd>
</dl>

<h3>Yeh aapas mein kaise baat karte hain</h3>
<ul>
<li><b>Control connections</b>: default mein DTLS (UDP, base port 12346), Controllers aur Managers ki taraf option ke roop mein TLS (TCP). Validator hamesha DTLS use karta hai. Har edge ek Manager connection aur default mein har transport par do tak Controller connections rakhta hai.</li>
<li><b>Data plane</b>: IPsec ESP (AES-256-GCM) UDP mein encapsulated taaki NAT paar kar sake. Edges ke beech IKE nahi hota: har edge apni keys khud banata hai aur Controller unhe OMP se baant-ta hai, jo hazaaron sites tak scale karta hai.</li>
<li><b>Hosting</b>: controllers Cisco cloud-hosted (sabse common), on-premises, ya service provider dwara chalaye ja sakte hain.</li>
</ul>

<div class="eg"><p><b>Worked example: lab.</b> <i>Bring two sites into the SD-WAN fabric</i> mein <b>CTRL</b> naam ka ek box (system-ip 10.255.0.1, site 1, organization NK-FABRIC, 203.0.113.2 par reachable) Validator, Manager aur Controller teeno ka kaam karta hai, aur uska web GUI aapko dashboard, templates aur policy pages deta hai. <b>EDGE1</b> (Mumbai, site 100, system-ip 10.255.0.11) aur <b>EDGE2</b> (Pune, site 200) WAN edges hain, har ek ke paas ek <b>INET</b> circuit (colour biz-internet) aur ek <b>MPLS</b> circuit (colour mpls) hai. Sirf INET se CTRL tak pahuncha ja sakta hai. Production mein yeh teen controller roles alag, redundant virtual machines hote.</p></div>

<h3>Fayde aur seemayein (blueprint 1.4)</h3>
<table class="cmp"><tr><th>Fayde</th><th>Seemayein aur trade-offs</th></tr>
<tr><td>Transport independence: MPLS, broadband, LTE/5G sab actively use hote hain</td><td>Internet circuits ka koi SLA nahi; SD-WAN sirf kharide gaye paths mein se best chun sakta hai</td></tr>
<tr><td>Central management, templates, zero-touch onboarding</td><td>Controllers, certificates aur sahi time (NTP) par nayi dependency</td></tr>
<tr><td>Live loss, latency aur jitter se application-aware routing</td><td>Full-mesh BFD tunnels n(n-1)/2 ki tarah badhte hain; bade fabrics ko topology policy chahiye</td></tr>
<tr><td>Har jagah encryption aur service VPNs se segmentation</td><td>IPsec aur UDP headers MTU kam karte hain; fragmentation plan karni padti hai</td></tr>
<tr><td>Direct cloud aur SaaS access (Cloud OnRamp)</td><td>Licensing cost, nayi skills aur naye troubleshooting tools</td></tr>
<tr><td>Alag planes: controllers fail hon to bhi edges forward karte rehte hain</td><td>Controllers ke bina aap configuration ya policy nahi badal sakte, aur OMP graceful-restart timer (default 12 ghante) ke baad routes age out ho jaate hain</td></tr>
</table>

<div class="warn"><p><b>Common galtiyan.</b> Validator ko dynamic NAT ke peeche rakhna (edges use dhoondh nahi paate). Sirf ek Controller deploy karna (naye routes aur policy ke liye single point of failure ban jaata hai). Yeh bhoolna ki har component certificates validate karta hai, isliye galat clock wala controller sabko reject kar deta hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Kaunsa component NAT traversal aur initial authentication karta hai?" jawab <b>Validator</b> hai, Controller nahi. "Kaunsa OMP chalata hai aur policy baant-ta hai?" jawab <b>Controller</b>. "Kaunsa configuration push karta hai?" jawab <b>Manager</b>. Data plane <b>WAN edge</b> hai. Agar koi answer kahe ki Controller data traffic forward karta hai, to woh galat hai.</p></div>

<div class="scn"><h4>Controllers chale gaye, branches nahi</h4><p>Ek logistics company ka internet edge par DNS change ki wajah se 40 minute tak apne cloud-hosted controllers se connection toot gaya. Help desk ko laga ki saari 220 branches down ho jaayengi. Users ke saath kuch nahi hua: har edge ne apne OMP routes, IPsec keys aur BFD sessions rakhe. Sirf symptoms the laal dashboard aur ek planned template push jo fail ho gaya. DNS theek hote hi control connections seconds mein wapas ban gaye.</p><p><b>Seekh:</b> control aur data planes alag hone ka matlab hai ki controller outage pehle management problem hai, turant traffic outage nahi. Yeh traffic problem tabhi banta hai jab graceful-restart aur rekey windows se zyada chale.</p></div>

<div class="iv"><p class="q">"Catalyst SD-WAN components ke naam batao aur har ek kya karta hai."</p><p>Strong answer: Validator (vBond) orchestration ke liye: pehla authentication, controller discovery, NAT traversal. Manager (vManage) management ke liye: GUI, API, templates, monitoring, NETCONF se config push. Controller (vSmart) control ke liye: OMP route reflector, policy aur key distribution. WAN edges data plane ke liye: IPsec tunnels, BFD, service-side routing. Phir jodo ki controllers kabhi user data forward nahi karte aur edges ke beech IKE nahi hota.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar planes: orchestration (Validator), management (Manager), control (Controller), data (WAN edges).</li>
<li>Control connections DTLS (UDP 12346) ya TLS use karte hain; OMP aur NETCONF unke andar chalte hain.</li>
<li>Edges IPsec keys banate hain; Controller unhe OMP se baant-ta hai, isliye IKE mesh ki zaroorat nahi.</li>
<li>Fayde: transport independence, central management, app-aware routing, security, cloud access.</li>
<li>Seemayein: controller aur certificate dependency, internet ka SLA nahi, tunnel scale, MTU, cost aur skills.</li>
</ul></div>
`}};export{e as default};