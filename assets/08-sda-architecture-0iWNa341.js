var e={id:`sda-architecture`,h:{en:`SD-Access architecture: fabric roles, Catalyst Center and ISE`,hi:`SD-Access architecture: fabric roles, Catalyst Center aur ISE`},body:{en:`
<p>Picture a large hotel. Guests (users and devices) can check in at any door. Reception (the <b>edge node</b>) checks their ID and gives them a coloured wristband (their <b>group</b>). A central <b>directory desk</b> (the <b>control plane node</b>) records which room each guest is in right now, so a message can find them even after they change rooms. The main gate (the <b>border node</b>) is where anything leaves or enters the hotel. And head office (<b>Catalyst Center</b> with <b>ISE</b>) decides the rules: who gets which wristband, and which wristbands may enter which areas. That hotel is an <b>SD-Access fabric</b>.</p>

<h3>Why SD-Access</h3>
<p>A traditional campus stretches VLANs across access switches, runs spanning tree, uses one subnet per floor or closet, and writes access lists by IP address. When a user moves floors or connects over Wi-Fi, their IP and therefore their policy changes. Segmenting departments means VRFs configured by hand on every hop. SD-Access fixes this with:</p>
<ul>
<li>a fully <b>routed underlay</b> (no spanning tree, no stretched VLANs, fast ECMP convergence);</li>
<li>an <b>overlay</b> in which any subnet can exist on any edge (anycast gateway), so users keep their IP and policy anywhere;</li>
<li><b>two-level segmentation</b>: <b>virtual networks</b> (VNs, which are VRFs) for macro-segmentation and <b>scalable group tags</b> (SGTs) for micro-segmentation inside a VN;</li>
<li>full <b>automation</b> from Catalyst Center, with identity-based policy from ISE.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="SD-Access fabric roles">
<rect x="10" y="10" width="170" height="44" rx="8" fill="#ddd6fe"/><text x="95" y="37" text-anchor="middle" class="svg-ink" font-size="13">Catalyst Center</text>
<rect x="190" y="10" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="245" y="37" text-anchor="middle" class="svg-ink" font-size="13">ISE</text>
<rect x="330" y="10" width="300" height="44" rx="8" fill="#e2e8f0"/><text x="480" y="37" text-anchor="middle" class="svg-ink" font-size="13">Fusion router / WAN / DC / internet</text>
<rect x="330" y="80" width="140" height="44" rx="8" fill="#fde68a"/><text x="400" y="100" text-anchor="middle" class="svg-ink" font-size="13">Border node</text><text x="400" y="116" text-anchor="middle" class="svg-muted" font-size="11">+ control plane</text>
<rect x="490" y="80" width="140" height="44" rx="8" fill="#bae6fd"/><text x="560" y="100" text-anchor="middle" class="svg-ink" font-size="13">Control plane</text><text x="560" y="116" text-anchor="middle" class="svg-muted" font-size="11">LISP MS/MR</text>
<rect x="250" y="150" width="140" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">Intermediate</text>
<rect x="60" y="215" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="120" y="240" text-anchor="middle" class="svg-ink" font-size="13">Edge node</text>
<rect x="260" y="215" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="240" text-anchor="middle" class="svg-ink" font-size="13">Edge node</text>
<rect x="460" y="215" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="520" y="240" text-anchor="middle" class="svg-ink" font-size="13">Edge node</text>
<rect x="30" y="265" width="90" height="22" rx="5" fill="#fed7aa"/><text x="75" y="281" text-anchor="middle" class="svg-ink" font-size="11">Fabric AP</text>
<rect x="130" y="265" width="100" height="22" rx="5" fill="#fed7aa"/><text x="180" y="281" text-anchor="middle" class="svg-ink" font-size="11">Extended node</text>
<line x1="400" y1="54" x2="400" y2="80" stroke="#64748b"/><line x1="400" y1="124" x2="320" y2="150" stroke="#64748b"/><line x1="560" y1="124" x2="390" y2="165" stroke="#64748b"/>
<line x1="320" y1="190" x2="120" y2="215" stroke="#64748b"/><line x1="320" y1="190" x2="320" y2="215" stroke="#64748b"/><line x1="320" y1="190" x2="520" y2="215" stroke="#64748b"/>
<line x1="100" y1="255" x2="75" y2="265" stroke="#64748b"/><line x1="140" y1="255" x2="180" y2="265" stroke="#64748b"/>
</svg><p class="cap">Every link inside the fabric is routed. Edges register hosts with the control plane; borders connect the fabric to everything else.</p></div>

<h3>Fabric roles</h3>
<table class="cmp"><tr><th>Role</th><th>What it does</th></tr>
<tr><td><b>Control plane node</b></td><td>A <b>LISP map-server / map-resolver</b> holding the host tracking database: which endpoint (EID: IP or MAC) sits behind which edge (RLOC: the edge's loopback). Usually two, often co-located with the borders.</td></tr>
<tr><td><b>Edge node</b></td><td>The access switch. Authenticates endpoints (802.1X, MAB), places them in a VN and SGT, registers them with the control plane, is their <b>anycast default gateway</b>, acts as LISP xTR and <b>VXLAN VTEP</b>, and enforces group policy.</td></tr>
<tr><td><b>Border node</b></td><td>The exit. <b>Internal</b> borders connect to known networks (data centre, shared services) and register those prefixes; <b>external</b> borders are the default exit to unknown destinations (internet, WAN); a border can be both. Hands off each VN to the outside, usually as VRF-lite with BGP.</td></tr>
<tr><td><b>Intermediate node</b></td><td>Underlay-only routers or distribution switches. They route IP between loopbacks and know nothing about the fabric.</td></tr>
<tr><td><b>Extended node</b></td><td>A simpler switch (industrial, compact) hanging off an edge node on a trunk, extending connectivity to IoT and outdoor devices. A <b>policy extended node</b> can also enforce SGTs.</td></tr>
<tr><td><b>Fabric WLC</b></td><td>Keeps CAPWAP control of the APs and registers wireless clients with the control plane node, so wired and wireless share one fabric.</td></tr>
<tr><td><b>Fabric-mode AP</b></td><td>Connected to an edge node; sends client traffic in <b>VXLAN to the edge</b> (not back to the WLC), carrying the VN and SGT.</td></tr>
</table>
<p>Small sites can run <b>Fabric in a Box</b>: one switch stack doing border, control plane and edge.</p>

<h3>The management and policy brains</h3>
<ul>
<li><b>Catalyst Center</b> (formerly DNA Center) is the SD-Access controller. Its workflow is <b>Design</b> (sites, IP pools, settings), <b>Policy</b> (VNs, groups, group-based access contracts), <b>Provision</b> (assign fabric roles, host onboarding, LAN automation) and <b>Assurance</b>. It configures devices through templates, SSH/NETCONF and Plug and Play.</li>
<li><b>ISE</b> (Identity Services Engine) is the policy engine: RADIUS for 802.1X/MAB, assigns the <b>SGT</b> and VN in the authorisation result, and stores the <b>TrustSec policy matrix</b> (which SGT may talk to which SGT) that edges download. Catalyst Center and ISE are integrated, so you define groups and contracts in one GUI.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A hospital has three VNs: CLINICAL, CORP and GUEST. Inside CLINICAL there are SGTs Doctors (17), Nurses (18) and MedDevices (40). A doctor logs in on floor 3 by 802.1X; ISE returns VN CLINICAL and SGT 17; the edge registers her laptop 10.40.3.25 with the control plane. When she walks to floor 7 and reconnects, a different edge registers the same IP and SGT. Her address and permissions follow her.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Calling the control plane node a "controller": the SD-Access controller is Catalyst Center; the control plane node is a LISP map server on a switch or router. Thinking wireless traffic still hairpins through the WLC in fabric mode: it goes AP to edge in VXLAN. Forgetting that intermediate nodes need no fabric configuration at all.</p></div>

<div class="exam"><p><b>Exam traps.</b> Control plane node = LISP MS/MR. Edge node = xTR + VTEP + anycast gateway + authenticator. Border node = handoff to outside, internal vs external. Fabric AP data plane = VXLAN to the edge node. Policy = ISE (SGTs, SGACLs); management = Catalyst Center.</p></div>

<div class="scn"><h4>The roaming nurse and the broken ACL</h4><p>Before SD-Access, a hospital's medical-device ACLs were keyed to the IP subnet of each ward. When nurses moved between wards with carts, their tablets got new subnets and lost access to infusion pumps. After SD-Access, the tablets were assigned SGT Nurses by ISE regardless of location, and a single group policy "Nurses may reach MedDevices on the required ports" replaced 60 per-ward ACLs.</p><p><b>Lesson:</b> SD-Access separates identity and policy from IP location. That is the core value, more than the tunnels.</p></div>

<div class="iv"><p class="q">"Describe the roles in an SD-Access fabric."</p><p>Strong answer: control plane node (LISP MS/MR host database), edge node (access switch: authentication, registration, anycast gateway, VXLAN VTEP, policy enforcement), border node (internal/external handoff to non-fabric networks), intermediate nodes (underlay only), extended nodes for IoT, fabric WLC and fabric APs for wireless. Then the brains: Catalyst Center for automation and assurance, ISE for identity and group policy. Mention Fabric in a Box for small sites.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SD-Access = routed underlay + LISP/VXLAN overlay + group-based policy, automated by Catalyst Center.</li>
<li>Control plane node tracks hosts; edge nodes attach and enforce; border nodes connect to the outside.</li>
<li>Fabric WLC registers wireless clients; fabric APs send VXLAN to the edge node.</li>
<li>Segmentation: VNs (VRFs) for macro, SGTs for micro.</li>
<li>ISE assigns SGTs and holds the policy matrix; Catalyst Center designs, provisions and assures.</li>
</ul></div>
`,hi:`
<p>Ek bada hotel socho. Guests (users aur devices) kisi bhi darwaaze se check in kar sakte hain. Reception (<b>edge node</b>) unki ID check karta hai aur unhe ek rangeen wristband (unka <b>group</b>) deta hai. Ek central <b>directory desk</b> (<b>control plane node</b>) record karta hai ki har guest abhi kis room mein hai, taaki room badalne ke baad bhi message unhe dhoondh sake. Main gate (<b>border node</b>) woh jagah hai jahan se koi bhi cheez hotel se bahar jaati ya andar aati hai. Aur head office (<b>Catalyst Center</b> aur <b>ISE</b>) rules decide karta hai: kise kaunsa wristband milega, aur kaunse wristbands kin areas mein ja sakte hain. Woh hotel ek <b>SD-Access fabric</b> hai.</p>

<h3>SD-Access kyun</h3>
<p>Traditional campus VLANs ko access switches ke paar failata hai, spanning tree chalata hai, har floor ya closet ka ek subnet use karta hai, aur access lists IP address se likhta hai. Jab user floor badalta hai ya Wi-Fi se judta hai, to uska IP aur isliye uski policy badal jaati hai. Departments ko segment karne ka matlab hai har hop par haath se VRFs configure karna. SD-Access ise theek karta hai:</p>
<ul>
<li>poori tarah <b>routed underlay</b> (koi spanning tree nahi, stretched VLANs nahi, fast ECMP convergence);</li>
<li>ek <b>overlay</b> jismein koi bhi subnet kisi bhi edge par ho sakta hai (anycast gateway), isliye users har jagah apna IP aur policy rakhte hain;</li>
<li><b>do-level segmentation</b>: macro-segmentation ke liye <b>virtual networks</b> (VNs, jo VRFs hain) aur VN ke andar micro-segmentation ke liye <b>scalable group tags</b> (SGTs);</li>
<li>Catalyst Center se poora <b>automation</b>, ISE se identity-based policy ke saath.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="SD-Access fabric roles">
<rect x="10" y="10" width="170" height="44" rx="8" fill="#ddd6fe"/><text x="95" y="37" text-anchor="middle" class="svg-ink" font-size="13">Catalyst Center</text>
<rect x="190" y="10" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="245" y="37" text-anchor="middle" class="svg-ink" font-size="13">ISE</text>
<rect x="330" y="10" width="300" height="44" rx="8" fill="#e2e8f0"/><text x="480" y="37" text-anchor="middle" class="svg-ink" font-size="13">Fusion router / WAN / DC / internet</text>
<rect x="330" y="80" width="140" height="44" rx="8" fill="#fde68a"/><text x="400" y="100" text-anchor="middle" class="svg-ink" font-size="13">Border node</text><text x="400" y="116" text-anchor="middle" class="svg-muted" font-size="11">+ control plane</text>
<rect x="490" y="80" width="140" height="44" rx="8" fill="#bae6fd"/><text x="560" y="100" text-anchor="middle" class="svg-ink" font-size="13">Control plane</text><text x="560" y="116" text-anchor="middle" class="svg-muted" font-size="11">LISP MS/MR</text>
<rect x="250" y="150" width="140" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">Intermediate</text>
<rect x="60" y="215" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="120" y="240" text-anchor="middle" class="svg-ink" font-size="13">Edge node</text>
<rect x="260" y="215" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="240" text-anchor="middle" class="svg-ink" font-size="13">Edge node</text>
<rect x="460" y="215" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="520" y="240" text-anchor="middle" class="svg-ink" font-size="13">Edge node</text>
<rect x="30" y="265" width="90" height="22" rx="5" fill="#fed7aa"/><text x="75" y="281" text-anchor="middle" class="svg-ink" font-size="11">Fabric AP</text>
<rect x="130" y="265" width="100" height="22" rx="5" fill="#fed7aa"/><text x="180" y="281" text-anchor="middle" class="svg-ink" font-size="11">Extended node</text>
<line x1="400" y1="54" x2="400" y2="80" stroke="#64748b"/><line x1="400" y1="124" x2="320" y2="150" stroke="#64748b"/><line x1="560" y1="124" x2="390" y2="165" stroke="#64748b"/>
<line x1="320" y1="190" x2="120" y2="215" stroke="#64748b"/><line x1="320" y1="190" x2="320" y2="215" stroke="#64748b"/><line x1="320" y1="190" x2="520" y2="215" stroke="#64748b"/>
<line x1="100" y1="255" x2="75" y2="265" stroke="#64748b"/><line x1="140" y1="255" x2="180" y2="265" stroke="#64748b"/>
</svg><p class="cap">Fabric ke andar har link routed hai. Edges hosts ko control plane ke saath register karte hain; borders fabric ko baaki sab se jodte hain.</p></div>

<h3>Fabric roles</h3>
<table class="cmp"><tr><th>Role</th><th>Kya karta hai</th></tr>
<tr><td><b>Control plane node</b></td><td><b>LISP map-server / map-resolver</b> jo host tracking database rakhta hai: kaunsa endpoint (EID: IP ya MAC) kis edge (RLOC: edge ka loopback) ke peeche hai. Aksar do, aksar borders ke saath co-located.</td></tr>
<tr><td><b>Edge node</b></td><td>Access switch. Endpoints ko authenticate karta hai (802.1X, MAB), unhe VN aur SGT mein rakhta hai, control plane ke saath register karta hai, unka <b>anycast default gateway</b> hai, LISP xTR aur <b>VXLAN VTEP</b> ka kaam karta hai, aur group policy enforce karta hai.</td></tr>
<tr><td><b>Border node</b></td><td>Exit. <b>Internal</b> borders known networks (data centre, shared services) se jodte hain aur un prefixes ko register karte hain; <b>external</b> borders unknown destinations (internet, WAN) ke liye default exit hain; border dono bhi ho sakta hai. Har VN ko bahar handoff karta hai, aksar BGP ke saath VRF-lite ki tarah.</td></tr>
<tr><td><b>Intermediate node</b></td><td>Sirf underlay wale routers ya distribution switches. Yeh loopbacks ke beech IP route karte hain aur fabric ke baare mein kuch nahi jaante.</td></tr>
<tr><td><b>Extended node</b></td><td>Simple switch (industrial, compact) jo trunk par edge node se juda hota hai, IoT aur outdoor devices tak connectivity badhata hai. <b>Policy extended node</b> SGTs enforce bhi kar sakta hai.</td></tr>
<tr><td><b>Fabric WLC</b></td><td>APs ka CAPWAP control rakhta hai aur wireless clients ko control plane node ke saath register karta hai, taaki wired aur wireless ek hi fabric share karein.</td></tr>
<tr><td><b>Fabric-mode AP</b></td><td>Edge node se juda; client traffic <b>VXLAN mein edge tak</b> bhejta hai (WLC tak wapas nahi), VN aur SGT ke saath.</td></tr>
</table>
<p>Chhoti sites <b>Fabric in a Box</b> chala sakti hain: ek switch stack jo border, control plane aur edge sab karta hai.</p>

<h3>Management aur policy ke dimaag</h3>
<ul>
<li><b>Catalyst Center</b> (pehle DNA Center) SD-Access controller hai. Iska workflow hai <b>Design</b> (sites, IP pools, settings), <b>Policy</b> (VNs, groups, group-based access contracts), <b>Provision</b> (fabric roles assign karna, host onboarding, LAN automation) aur <b>Assurance</b>. Yeh templates, SSH/NETCONF aur Plug and Play se devices configure karta hai.</li>
<li><b>ISE</b> (Identity Services Engine) policy engine hai: 802.1X/MAB ke liye RADIUS, authorisation result mein <b>SGT</b> aur VN assign karta hai, aur <b>TrustSec policy matrix</b> (kaunsa SGT kis SGT se baat kar sakta hai) store karta hai jise edges download karte hain. Catalyst Center aur ISE integrated hain, isliye aap groups aur contracts ek hi GUI mein define karte ho.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek hospital ke teen VNs hain: CLINICAL, CORP aur GUEST. CLINICAL ke andar SGTs hain Doctors (17), Nurses (18) aur MedDevices (40). Ek doctor floor 3 par 802.1X se login karti hai; ISE VN CLINICAL aur SGT 17 lautata hai; edge uske laptop 10.40.3.25 ko control plane ke saath register karta hai. Jab woh floor 7 par jaakar reconnect karti hai, ek alag edge wahi IP aur SGT register karta hai. Uska address aur permissions uske saath chalte hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Control plane node ko "controller" kehna: SD-Access controller Catalyst Center hai; control plane node switch ya router par ek LISP map server hai. Yeh sochna ki fabric mode mein wireless traffic ab bhi WLC se hairpin hota hai: yeh VXLAN mein AP se edge jaata hai. Yeh bhoolna ki intermediate nodes ko koi fabric configuration nahi chahiye.</p></div>

<div class="exam"><p><b>Exam traps.</b> Control plane node = LISP MS/MR. Edge node = xTR + VTEP + anycast gateway + authenticator. Border node = bahar handoff, internal vs external. Fabric AP data plane = edge node tak VXLAN. Policy = ISE (SGTs, SGACLs); management = Catalyst Center.</p></div>

<div class="scn"><h4>Ghoomti nurse aur toota ACL</h4><p>SD-Access se pehle ek hospital ke medical-device ACLs har ward ke IP subnet par bane the. Jab nurses carts ke saath wards badalti thi, unke tablets ko naye subnets milte the aur infusion pumps ka access chala jaata tha. SD-Access ke baad ISE ne tablets ko location se independent SGT Nurses diya, aur ek hi group policy "Nurses zaroori ports par MedDevices tak pahunch sakti hain" ne 60 per-ward ACLs replace kar diye.</p><p><b>Seekh:</b> SD-Access identity aur policy ko IP location se alag karta hai. Tunnels se zyada yahi asli value hai.</p></div>

<div class="iv"><p class="q">"SD-Access fabric ke roles describe karo."</p><p>Strong answer: control plane node (LISP MS/MR host database), edge node (access switch: authentication, registration, anycast gateway, VXLAN VTEP, policy enforcement), border node (non-fabric networks tak internal/external handoff), intermediate nodes (sirf underlay), IoT ke liye extended nodes, wireless ke liye fabric WLC aur fabric APs. Phir dimaag: automation aur assurance ke liye Catalyst Center, identity aur group policy ke liye ISE. Chhoti sites ke liye Fabric in a Box ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SD-Access = routed underlay + LISP/VXLAN overlay + group-based policy, Catalyst Center se automated.</li>
<li>Control plane node hosts track karta hai; edge nodes attach aur enforce karte hain; border nodes bahar jodte hain.</li>
<li>Fabric WLC wireless clients register karta hai; fabric APs edge node tak VXLAN bhejte hain.</li>
<li>Segmentation: macro ke liye VNs (VRFs), micro ke liye SGTs.</li>
<li>ISE SGTs assign karta hai aur policy matrix rakhta hai; Catalyst Center design, provision aur assure karta hai.</li>
</ul></div>
`}};export{e as default};