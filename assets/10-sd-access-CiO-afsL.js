var e={id:`sd-access`,h:{en:`How SD-Access uses LISP, VXLAN and SGT together`,hi:`SD-Access LISP, VXLAN aur SGT ko saath kaise use karta hai`},body:{en:`
<p>Think of a modern airport. The <b>directory desk</b> knows which gate every passenger is at (LISP control plane). The <b>airport shuttle</b> carries passengers between terminals in sealed buses (VXLAN data plane). Every passenger wears a <b>coloured wristband</b> showing economy, business or crew (SGT), and the gate staff check the wristband before letting anyone board (group policy). SD-Access is that airport for your campus network.</p>

<h3>The SD-Access roles and what protocol each runs</h3>
<table class="cmp"><tr><th>Fabric role</th><th>LISP role</th><th>What it does</th></tr>
<tr><td><b>Control plane node</b></td><td>Map-server / map-resolver</td><td>Holds the host tracking database: every endpoint's IP and MAC (EID) and the edge it sits behind (RLOC).</td></tr>
<tr><td><b>Fabric edge node</b></td><td>xTR (ITR + ETR)</td><td>Access switch where users connect. Detects endpoints, registers them, provides the <b>anycast gateway</b>, encapsulates and decapsulates VXLAN.</td></tr>
<tr><td><b>Fabric border node</b></td><td>PxTR (PITR + PETR)</td><td>Connects the fabric to the outside: data center, WAN, Internet, or another fabric site.</td></tr>
<tr><td><b>Intermediate node</b></td><td>none</td><td>Pure underlay router; forwards VXLAN between loopbacks and knows nothing about endpoints.</td></tr>
<tr><td>Fabric WLC and fabric APs</td><td>WLC registers wireless clients with the CP node</td><td>APs send client traffic in VXLAN to their edge; the wireless data plane joins the wired fabric.</td></tr>
</table>
<p>Around the fabric sit <b>Catalyst Center</b> (formerly DNA Center), which automates the underlay and generates the LISP and VXLAN configuration, and <b>ISE</b>, which authenticates users and assigns their Virtual Network and SGT. The underlay is typically IS-IS built by LAN automation, with a fabric MTU of 9100.</p>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="SD-Access fabric roles">
<rect x="250" y="12" width="140" height="46" rx="8" fill="#ddd6fe"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Control plane node</text><text x="320" y="50" text-anchor="middle" class="svg-muted" font-size="12">LISP MS/MR</text>
<rect x="470" y="12" width="150" height="46" rx="8" fill="#fed7aa"/><text x="545" y="33" text-anchor="middle" class="svg-ink" font-size="13">Border node</text><text x="545" y="50" text-anchor="middle" class="svg-muted" font-size="12">PxTR → WAN, DC</text>
<rect x="250" y="112" width="140" height="42" rx="8" fill="#e2e8f0"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="13">Intermediate</text>
<rect x="40" y="200" width="160" height="46" rx="8" fill="#bae6fd"/><text x="120" y="221" text-anchor="middle" class="svg-ink" font-size="13">Edge 1 (xTR)</text><text x="120" y="238" text-anchor="middle" class="svg-muted" font-size="12">Host A, SGT 10</text>
<rect x="440" y="200" width="160" height="46" rx="8" fill="#bae6fd"/><text x="520" y="221" text-anchor="middle" class="svg-ink" font-size="13">Edge 2 (xTR)</text><text x="520" y="238" text-anchor="middle" class="svg-muted" font-size="12">Host B, SGT 20</text>
<line x1="320" y1="58" x2="320" y2="112" stroke="#64748b" stroke-width="2"/><line x1="390" y1="130" x2="545" y2="58" stroke="#64748b" stroke-width="2"/>
<line x1="250" y1="145" x2="150" y2="200" stroke="#64748b" stroke-width="2"/><line x1="390" y1="145" x2="490" y2="200" stroke="#64748b" stroke-width="2"/>
<text x="320" y="272" text-anchor="middle" class="svg-accent" font-size="12">VXLAN-GPO: VNI = Virtual Network, Group ID = SGT 10</text>
<text x="110" y="90" class="svg-muted" font-size="12">Catalyst Center + ISE</text>
</svg><p class="cap">LISP decides where, VXLAN carries, the SGT in the header decides whether it is allowed.</p></div>

<h3>Mapping the pieces</h3>
<ul>
<li><b>Virtual Network (VN)</b> = a VRF = a LISP <b>instance ID</b> = a Layer 3 VXLAN VNI. This is <b>macro-segmentation</b>: Employees and IoT in separate VNs cannot talk without going through a firewall at the border.</li>
<li><b>IP pool</b> (a subnet inside a VN) = a Layer 2 VNI on the edges, with the same anycast gateway IP and MAC on every edge, so a user roaming between floors keeps the same gateway.</li>
<li><b>SGT</b> (Scalable Group Tag) = a 16-bit group number carried in the <b>Group Policy ID</b> field of the <b>VXLAN-GPO</b> header. This is <b>micro-segmentation</b> inside a VN.</li>
</ul>

<h3>Packet walk: Host A to Host B in the same VN</h3>
<ol>
<li><b>Onboard.</b> Host A connects to Edge 1 and authenticates with 802.1X. ISE returns the VN (Employees) and SGT 10.</li>
<li><b>Register.</b> Edge 1 learns A's MAC and IP (DHCP or ARP) and sends a LISP Map-Register for both EIDs, with Edge 1's loopback as RLOC, to the control plane node. Edge 2 has done the same for Host B (SGT 20).</li>
<li><b>Resolve.</b> A sends to B through the anycast gateway. Edge 1 has no map-cache entry for B, so it sends a Map-Request to the CP node and receives a reply: B is behind Edge 2's RLOC.</li>
<li><b>Encapsulate.</b> Edge 1 wraps the packet in <b>VXLAN-GPO</b>: outer IP Edge1 loopback → Edge2 loopback, UDP 4789, VNI of the Employees VN, Group Policy ID = 10.</li>
<li><b>Enforce.</b> Edge 2 decapsulates, reads source SGT 10, knows destination SGT 20 locally, and applies the SGACL (downloaded from ISE) for 10 → 20. Enforcement happens at the <b>egress</b> edge.</li>
</ol>
<p>Traffic to a destination outside the fabric gets a negative answer from the CP node and is sent in VXLAN to the external border, which acts as PETR and hands it to the WAN or Internet, carrying the SGT inline or via SXP if the next device understands it.</p>

<div class="eg"><p><b>Worked example.</b> A hospital has two VNs: CLINICAL and GUEST. Inside CLINICAL there are SGT 10 (Doctors), SGT 20 (Nurses) and SGT 30 (Medical devices). Policy: 10 and 20 may reach 30 on specific ports; 30 may not initiate to anything except its server. A nurse moves from ward 3 to ward 5: her laptop keeps its IP and anycast gateway, Edge 5 registers it, the CP node updates, and the same SGT 20 policy follows her automatically.</p></div>

<div class="warn"><p><b>Common mistake.</b> Saying "SD-Access uses LISP encapsulation". It uses the <b>LISP control plane</b> but <b>VXLAN-GPO</b> as the data plane, because VXLAN carries full Layer 2 frames and has a field for the SGT. Pure LISP data encapsulation (UDP 4341) is not used inside the fabric.</p></div>

<div class="exam"><p><b>Exam trap.</b> Control plane node = LISP MS/MR. Edge node = LISP xTR. Border node = LISP PxTR. Data plane = VXLAN (UDP 4789). Policy plane = Cisco TrustSec with SGTs. Management plane = Catalyst Center. VN maps to a VRF and a LISP instance ID.</p></div>

<div class="scn"><h4>The camera that could reach the finance server</h4><p>An audit found that IP cameras in a fabric could open connections to a finance server in the same VN. Both groups were in the Corporate VN because a separate VN had been judged too complex. The fix did not need new subnets: the team created SGT Cameras and SGT Finance in ISE and a deny policy between them. The egress edge in front of the finance server started dropping camera traffic immediately, visible in the SGACL counters.</p><p><b>Lesson:</b> VNs separate big blocks; SGTs control who talks to whom inside a block, without readdressing.</p></div>

<div class="iv"><p class="q">"How do LISP, VXLAN and SGT fit together in SD-Access?"</p><p>Strong answer: LISP is the control plane. The control plane node is the map-server/map-resolver holding EID-to-RLOC mappings for every endpoint; edge nodes are xTRs that register endpoints and query on demand; borders are PxTRs. VXLAN-GPO is the data plane: the VNI identifies the Virtual Network (VRF, LISP instance ID) and the Group Policy ID carries the source SGT. TrustSec is the policy plane: SGTs come from ISE and SGACLs are enforced at the egress edge. Catalyst Center automates it all.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CP node = LISP MS/MR; edge = xTR with anycast gateway; border = PxTR; intermediate = underlay only.</li>
<li>Data plane is VXLAN-GPO on UDP 4789, not LISP data encapsulation.</li>
<li>VN = VRF = LISP instance ID = L3 VNI (macro-segmentation).</li>
<li>SGT rides in the 16-bit Group Policy ID; SGACLs are enforced at the egress edge (micro-segmentation).</li>
<li>Catalyst Center automates, ISE authenticates and assigns VN and SGT.</li>
</ul></div>
`,hi:`
<p>Ek modern airport socho. <b>Directory desk</b> jaanta hai har passenger kaunse gate par hai (LISP control plane). <b>Airport shuttle</b> passengers ko sealed buses mein terminals ke beech le jaati hai (VXLAN data plane). Har passenger ek <b>rangeen wristband</b> pehenta hai jo economy, business ya crew dikhata hai (SGT), aur gate staff kisi ko board karne se pehle wristband check karta hai (group policy). SD-Access aapke campus network ke liye wahi airport hai.</p>

<h3>SD-Access roles aur har ek kaunsa protocol chalata hai</h3>
<table class="cmp"><tr><th>Fabric role</th><th>LISP role</th><th>Kya karta hai</th></tr>
<tr><td><b>Control plane node</b></td><td>Map-server / map-resolver</td><td>Host tracking database rakhta hai: har endpoint ka IP aur MAC (EID) aur woh kis edge ke peeche hai (RLOC).</td></tr>
<tr><td><b>Fabric edge node</b></td><td>xTR (ITR + ETR)</td><td>Access switch jahan users judte hain. Endpoints detect karta hai, register karta hai, <b>anycast gateway</b> deta hai, VXLAN encapsulate aur decapsulate karta hai.</td></tr>
<tr><td><b>Fabric border node</b></td><td>PxTR (PITR + PETR)</td><td>Fabric ko bahar se jodta hai: data center, WAN, Internet, ya doosri fabric site.</td></tr>
<tr><td><b>Intermediate node</b></td><td>koi nahi</td><td>Pure underlay router; loopbacks ke beech VXLAN forward karta hai aur endpoints ke baare mein kuch nahi jaanta.</td></tr>
<tr><td>Fabric WLC aur fabric APs</td><td>WLC wireless clients ko CP node par register karta hai</td><td>APs client traffic VXLAN mein apne edge ko bhejte hain; wireless data plane wired fabric se jud jaata hai.</td></tr>
</table>
<p>Fabric ke aas-paas <b>Catalyst Center</b> (pehle DNA Center) hota hai, jo underlay automate karta hai aur LISP aur VXLAN configuration generate karta hai, aur <b>ISE</b>, jo users ko authenticate karta hai aur unka Virtual Network aur SGT assign karta hai. Underlay aam taur par LAN automation se bana IS-IS hota hai, fabric MTU 9100 ke saath.</p>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="SD-Access fabric roles">
<rect x="250" y="12" width="140" height="46" rx="8" fill="#ddd6fe"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Control plane node</text><text x="320" y="50" text-anchor="middle" class="svg-muted" font-size="12">LISP MS/MR</text>
<rect x="470" y="12" width="150" height="46" rx="8" fill="#fed7aa"/><text x="545" y="33" text-anchor="middle" class="svg-ink" font-size="13">Border node</text><text x="545" y="50" text-anchor="middle" class="svg-muted" font-size="12">PxTR → WAN, DC</text>
<rect x="250" y="112" width="140" height="42" rx="8" fill="#e2e8f0"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="13">Intermediate</text>
<rect x="40" y="200" width="160" height="46" rx="8" fill="#bae6fd"/><text x="120" y="221" text-anchor="middle" class="svg-ink" font-size="13">Edge 1 (xTR)</text><text x="120" y="238" text-anchor="middle" class="svg-muted" font-size="12">Host A, SGT 10</text>
<rect x="440" y="200" width="160" height="46" rx="8" fill="#bae6fd"/><text x="520" y="221" text-anchor="middle" class="svg-ink" font-size="13">Edge 2 (xTR)</text><text x="520" y="238" text-anchor="middle" class="svg-muted" font-size="12">Host B, SGT 20</text>
<line x1="320" y1="58" x2="320" y2="112" stroke="#64748b" stroke-width="2"/><line x1="390" y1="130" x2="545" y2="58" stroke="#64748b" stroke-width="2"/>
<line x1="250" y1="145" x2="150" y2="200" stroke="#64748b" stroke-width="2"/><line x1="390" y1="145" x2="490" y2="200" stroke="#64748b" stroke-width="2"/>
<text x="320" y="272" text-anchor="middle" class="svg-accent" font-size="12">VXLAN-GPO: VNI = Virtual Network, Group ID = SGT 10</text>
<text x="110" y="90" class="svg-muted" font-size="12">Catalyst Center + ISE</text>
</svg><p class="cap">LISP tay karta hai kahan, VXLAN le jaata hai, header mein SGT tay karta hai ki allowed hai ya nahi.</p></div>

<h3>Tukdon ko jodna</h3>
<ul>
<li><b>Virtual Network (VN)</b> = ek VRF = ek LISP <b>instance ID</b> = ek Layer 3 VXLAN VNI. Yeh <b>macro-segmentation</b> hai: alag VNs mein Employees aur IoT border ke firewall se guzre bina baat nahi kar sakte.</li>
<li><b>IP pool</b> (VN ke andar ek subnet) = edges par ek Layer 2 VNI, har edge par same anycast gateway IP aur MAC ke saath, taaki floors ke beech ghoomne wala user same gateway rakhe.</li>
<li><b>SGT</b> (Scalable Group Tag) = 16-bit group number jo <b>VXLAN-GPO</b> header ke <b>Group Policy ID</b> field mein jaata hai. Yeh VN ke andar <b>micro-segmentation</b> hai.</li>
</ul>

<h3>Packet walk: same VN mein Host A se Host B</h3>
<ol>
<li><b>Onboard.</b> Host A Edge 1 se judta hai aur 802.1X se authenticate karta hai. ISE VN (Employees) aur SGT 10 lautata hai.</li>
<li><b>Register.</b> Edge 1 A ka MAC aur IP (DHCP ya ARP se) seekhta hai aur dono EIDs ke liye LISP Map-Register control plane node ko bhejta hai, Edge 1 ke loopback ko RLOC bana kar. Edge 2 ne Host B (SGT 20) ke liye yahi kiya hai.</li>
<li><b>Resolve.</b> A anycast gateway ke through B ko bhejta hai. Edge 1 ke paas B ki map-cache entry nahi hai, isliye woh CP node ko Map-Request bhejta hai aur jawab paata hai: B Edge 2 ke RLOC ke peeche hai.</li>
<li><b>Encapsulate.</b> Edge 1 packet ko <b>VXLAN-GPO</b> mein lapet-ta hai: outer IP Edge1 loopback → Edge2 loopback, UDP 4789, Employees VN ka VNI, Group Policy ID = 10.</li>
<li><b>Enforce.</b> Edge 2 decapsulate karta hai, source SGT 10 padhta hai, destination SGT 20 locally jaanta hai, aur 10 → 20 ke liye SGACL (ISE se download kiya) lagata hai. Enforcement <b>egress</b> edge par hota hai.</li>
</ol>
<p>Fabric ke bahar ke destination ke traffic ko CP node se negative jawab milta hai aur woh VXLAN mein external border ko bheja jaata hai, jo PETR ki tarah kaam karke use WAN ya Internet ko de deta hai, SGT ko inline ya SXP ke through le jaate hue agar agla device use samajhta ho.</p>

<div class="eg"><p><b>Worked example.</b> Ek hospital ke do VNs hain: CLINICAL aur GUEST. CLINICAL ke andar SGT 10 (Doctors), SGT 20 (Nurses) aur SGT 30 (Medical devices) hain. Policy: 10 aur 20 specific ports par 30 tak pahunch sakte hain; 30 apne server ke alawa kisi ko connection shuru nahi kar sakta. Ek nurse ward 3 se ward 5 jaati hai: uska laptop apna IP aur anycast gateway rakhta hai, Edge 5 use register karta hai, CP node update hota hai, aur wahi SGT 20 policy apne aap uske saath chalti hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Kehna "SD-Access LISP encapsulation use karta hai". Woh <b>LISP control plane</b> use karta hai lekin data plane ke liye <b>VXLAN-GPO</b>, kyunki VXLAN poore Layer 2 frames le jaata hai aur usme SGT ke liye field hai. Fabric ke andar pure LISP data encapsulation (UDP 4341) use nahi hota.</p></div>

<div class="exam"><p><b>Exam trap.</b> Control plane node = LISP MS/MR. Edge node = LISP xTR. Border node = LISP PxTR. Data plane = VXLAN (UDP 4789). Policy plane = SGTs ke saath Cisco TrustSec. Management plane = Catalyst Center. VN ek VRF aur ek LISP instance ID se map hota hai.</p></div>

<div class="scn"><h4>Camera jo finance server tak pahunch sakta tha</h4><p>Ek audit mein pata chala ki fabric ke IP cameras same VN ke ek finance server se connections khol sakte the. Dono groups Corporate VN mein the kyunki alag VN ko bahut complex maana gaya tha. Fix ke liye naye subnets nahi chahiye the: team ne ISE mein SGT Cameras aur SGT Finance banaye aur unke beech deny policy. Finance server ke saamne wale egress edge ne turant camera traffic drop karna shuru kiya, jo SGACL counters mein dikha.</p><p><b>Seekh:</b> VNs bade blocks alag karte hain; SGTs block ke andar kaun kisse baat kare yeh control karte hain, bina readdressing ke.</p></div>

<div class="iv"><p class="q">"SD-Access mein LISP, VXLAN aur SGT kaise saath fit hote hain?"</p><p>Strong answer: LISP control plane hai. Control plane node map-server/map-resolver hai jo har endpoint ki EID-se-RLOC mappings rakhta hai; edge nodes xTRs hain jo endpoints register karte hain aur zaroorat par query karte hain; borders PxTRs hain. VXLAN-GPO data plane hai: VNI Virtual Network (VRF, LISP instance ID) pehchanta hai aur Group Policy ID source SGT le jaata hai. TrustSec policy plane hai: SGTs ISE se aate hain aur SGACLs egress edge par enforce hote hain. Catalyst Center sab automate karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CP node = LISP MS/MR; edge = anycast gateway wala xTR; border = PxTR; intermediate = sirf underlay.</li>
<li>Data plane UDP 4789 par VXLAN-GPO hai, LISP data encapsulation nahi.</li>
<li>VN = VRF = LISP instance ID = L3 VNI (macro-segmentation).</li>
<li>SGT 16-bit Group Policy ID mein jaata hai; SGACLs egress edge par enforce hote hain (micro-segmentation).</li>
<li>Catalyst Center automate karta hai, ISE authenticate karta hai aur VN aur SGT assign karta hai.</li>
</ul></div>
`}};export{e as default};