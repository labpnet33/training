var e={id:`summary-checklist`,h:{en:`Hyperconverged versus SAN, summary and exam checklist`,hi:`Hyperconverged versus SAN, summary aur exam checklist`},body:{en:`
<p>The last design question in this module is whether to build a SAN at all. Some workloads fit hyperconverged infrastructure (HCI) better. This chapter gives you a way to decide, then closes the module with a checklist, glossary and the most-tested facts.</p>

<h3>The case: Northwind Manufacturing</h3>
<div class="eg"><p><b>Customer.</b> Northwind Manufacturing, 12 factories and one head-office data center. Each factory has 20 to 40 VMs (MES, historian, print servers) and one IT person. The head office runs SAP HANA, Oracle and a 1,200 VM VMware estate on an eight-year-old SAN that is due for refresh.</p><p><b>Requirements.</b> Factories: simple, cheap to support, survive a node loss without calling anyone. Head office: predictable latency for databases, independent scaling of compute and storage, consolidated licences. Budget: the same total as a straight SAN refresh.</p><p><b>Constraints.</b> Factory WAN is 100 Mbps; head-office network team is moving to 100G spine-leaf; Oracle licences are per core.</p></div>

<h3>How HCI changes the storage network</h3>
<p>In <b>HCI</b>, each server node contributes local flash and CPU to a distributed storage layer managed by software. There is no separate SAN: storage traffic between nodes (replica writes, rebuilds, reads from remote nodes) runs over the <b>Ethernet</b> network. That moves the storage design problem into the data center LAN: low-latency spine-leaf, 25/100G links, jumbo MTU, redundant top-of-rack switches, and often a dedicated VLAN for storage traffic.</p>
<table class="cmp"><tr><th>Criterion</th><th>Traditional SAN (FC)</th><th>HCI</th></tr>
<tr><td>Scaling</td><td>Compute and storage scale separately</td><td>Both grow with each node, unless storage-only or compute-only nodes exist</td></tr>
<tr><td>Network</td><td>Dedicated fabric, isolated</td><td>Shared Ethernet; east-west traffic is the storage path</td></tr>
<tr><td>Operations</td><td>Storage, SAN and server teams</td><td>One platform team</td></tr>
<tr><td>Bare-metal servers</td><td>Easily attached</td><td>Often not supported</td></tr>
<tr><td>Large databases</td><td>Proven, predictable</td><td>Possible, needs sizing; rebuild traffic matters</td></tr>
<tr><td>Failure behaviour</td><td>Array controller or fabric failure</td><td>Node loss triggers re-replication across the network</td></tr>
<tr><td>Licensing</td><td>Per array or capacity</td><td>Per node, may couple compute and storage cost</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="SAN versus HCI">
<rect x="10" y="10" width="300" height="200" rx="10" fill="#f8fafc" stroke="#64748b"/><text x="160" y="32" text-anchor="middle" class="svg-ink" font-size="13">Traditional SAN (head office)</text>
<rect x="30" y="50" width="70" height="30" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="65" y="70" text-anchor="middle" class="svg-ink" font-size="12">Hosts</text>
<rect x="125" y="95" width="70" height="30" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="160" y="115" text-anchor="middle" class="svg-ink" font-size="12">FC fabric</text>
<rect x="220" y="140" width="70" height="30" rx="6" fill="#ddd6fe" stroke="#64748b"/><text x="255" y="160" text-anchor="middle" class="svg-ink" font-size="12">Array</text>
<line x1="85" y1="80" x2="140" y2="95" stroke="#64748b" stroke-width="2"/><line x1="185" y1="125" x2="240" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="160" y="196" text-anchor="middle" class="svg-muted" font-size="11">Separate scale of compute and storage</text>
<rect x="330" y="10" width="300" height="200" rx="10" fill="#f8fafc" stroke="#64748b"/><text x="480" y="32" text-anchor="middle" class="svg-ink" font-size="13">HCI (factory sites)</text>
<rect x="350" y="60" width="70" height="46" rx="6" fill="#fed7aa" stroke="#64748b"/><text x="385" y="80" text-anchor="middle" class="svg-ink" font-size="12">Node 1</text><text x="385" y="96" text-anchor="middle" class="svg-muted" font-size="11">CPU+disk</text>
<rect x="445" y="60" width="70" height="46" rx="6" fill="#fed7aa" stroke="#64748b"/><text x="480" y="80" text-anchor="middle" class="svg-ink" font-size="12">Node 2</text><text x="480" y="96" text-anchor="middle" class="svg-muted" font-size="11">CPU+disk</text>
<rect x="540" y="60" width="70" height="46" rx="6" fill="#fed7aa" stroke="#64748b"/><text x="575" y="80" text-anchor="middle" class="svg-ink" font-size="12">Node 3</text><text x="575" y="96" text-anchor="middle" class="svg-muted" font-size="11">CPU+disk</text>
<rect x="350" y="140" width="260" height="30" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="480" y="160" text-anchor="middle" class="svg-ink" font-size="12">Redundant Ethernet (25G, jumbo MTU)</text>
<line x1="385" y1="106" x2="385" y2="140" stroke="#64748b" stroke-width="2"/><line x1="480" y1="106" x2="480" y2="140" stroke="#64748b" stroke-width="2"/><line x1="575" y1="106" x2="575" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="480" y="196" text-anchor="middle" class="svg-muted" font-size="11">Storage traffic shares the LAN fabric</text>
<text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="11">Blue = hosts, green = fabric, purple = array, orange = HCI nodes</text>
</svg><p class="cap">The same business may need both models in different places.</p></div>

<h3>Chosen design for Northwind</h3>
<p>Factories: a three-node HCI cluster per site with two top-of-rack switches, 25G links, a witness at head office; local survivability, remote management. Head office: refresh the SAN with two 32G MDS fabrics and all-flash arrays for SAP HANA and Oracle (per-core licences stay predictable because compute is not tied to storage growth), and run general VMware workloads on a new HCI cluster on the 100G spine-leaf with a storage VLAN and jumbo MTU. Result: two models, each used where it wins.</p>

<div class="warn"><p><b>Common mistake.</b> Sizing the HCI network like a LAN. A node failure makes the cluster rebuild replicas, doubling traffic. Design for the rebuild, not only normal I/O.</p></div>
<div class="exam"><p><b>Exam trap.</b> HCI does not remove the storage network; it moves it onto Ethernet. Dual redundant switches and consistent MTU are still required.</p></div>

<div class="scn"><h4>The rebuild that slowed everything</h4><p>At one Northwind plant a node died and the HCI cluster started copying 6 TB of replicas over 10G links shared with production VMs. User response times doubled for 11 hours. The fix was 25G uplinks, a storage VLAN with its own QoS class, and a rebuild bandwidth limit tuned in the platform.</p><p><b>Lesson:</b> HCI makes the network part of the storage array, so treat it with the same care.</p></div>

<div class="iv"><p class="q">"When would you recommend HCI over a Fibre Channel SAN?"</p><p>Strong answer: for edge, branch and mid-size virtualised estates that value simplicity and linear scale, when the network is modern Ethernet. Choose a SAN for large latency-critical databases, bare-metal hosts, independent scaling or existing FC investment. Mention the rebuild and licence points.</p></div>

<h3>Module summary and exam checklist</h3>
<p><b>You should be able to:</b></p>
<ul>
<li>Pick FC, FCoE, iSCSI or NVMe-oF (FC, RoCEv2, TCP) from requirements, and defend the choice.</li>
<li>Design dual A/B fabrics, choose collapsed core, core-edge or edge-core-edge, and select MDS 9000 fixed versus director.</li>
<li>Design VSANs, smart zoning and device aliases with a safe change process.</li>
<li>Decide NPV versus E-port edge, size port channels and compute oversubscription and fan-in/fan-out.</li>
<li>Design FCoE and multi-hop with PFC, ETS, FIP, VE ports and separate A/B.</li>
<li>Design iSCSI and NVMe/TCP for dedicated VLANs, jumbo MTU and multipathing; know the RoCE PFC and ECN needs.</li>
<li>Choose sync or async from latency, pick DWDM or FCIP, and plan analytics, HA and DR tests.</li>
<li>Compare HCI with SAN and explain the network impact.</li>
</ul>

<dl class="terms">
<dt>WWPN</dt><dd>World Wide Port Name, the unique 64-bit identity of an FC port.</dd>
<dt>FCID</dt><dd>24-bit fabric address assigned at login.</dd>
<dt>FLOGI / FDISC</dt><dd>Fabric login; FDISC adds extra logins (NPIV).</dd>
<dt>VSAN</dt><dd>Virtual SAN, a separate logical fabric inside the same switches.</dd>
<dt>Smart zoning</dt><dd>Zones with init and target roles so only valid pairs are programmed.</dd>
<dt>NPV / NPIV</dt><dd>Proxy edge switch with NP uplinks / multiple logins on one F port.</dd>
<dt>ISL / TE port</dt><dd>Link between switches; trunking E port carries many VSANs.</dd>
<dt>PFC / ETS / DCBX</dt><dd>Per-priority pause / bandwidth sharing / negotiation of both.</dd>
<dt>FCIP</dt><dd>FC frames tunnelled over TCP/IP between sites.</dd>
<dt>RPO / RTO</dt><dd>Data loss tolerated / time to recover.</dd>
</dl>

<div class="exam"><p><b>Most-tested facts.</b> A and B fabrics never connect. Zoning is per VSAN; default policy is deny. Smart zoning needs init or target. NPIV on the core, NPV on the edge, NPV uses no domain ID. SAN port channels hold up to 16 links. FCoE: Ethertype 0x8906, FIP 0x8914, CoS 3 no-drop, MTU 2158, one FCoE VLAN to one VSAN. iSCSI: TCP 3260. RoCEv2: UDP 4791 with PFC and ECN. Sync is limited by distance (about 1 ms RTT per 100 km); async by bandwidth.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Start every storage design from RPO, RTO, latency, scale and skills.</li>
<li>Isolation (fabrics, VSANs, zones, LUN masking) is the main protection against human error.</li>
<li>Size links for peaks and rebuilds, not averages.</li>
<li>HCI moves storage onto Ethernet; the network design still decides success.</li>
<li>Test failover regularly and watch with analytics.</li>
</ul></div>
`,hi:`
<p>Is module ka aakhri design sawal hai: SAN banana bhi chahiye ya nahi. Kuch workloads hyperconverged infrastructure (HCI) par behtar baithte hain. Yeh chapter decide karne ka tareeka deta hai, phir module ko checklist, glossary aur sabse zyada puchhe jaane wale facts ke saath band karta hai.</p>

<h3>Case: Northwind Manufacturing</h3>
<div class="eg"><p><b>Customer.</b> Northwind Manufacturing, 12 factories aur ek head-office data center. Har factory mein 20 se 40 VMs (MES, historian, print servers) aur ek IT person. Head office SAP HANA, Oracle aur 1,200 VM ka VMware estate aath saal purane SAN par chalata hai jo refresh ke liye due hai.</p><p><b>Requirements.</b> Factories: simple, support mein sasti, bina kisi ko bulaye node loss survive kare. Head office: databases ke liye predictable latency, compute aur storage ki alag scaling, consolidated licences. Budget: seedhe SAN refresh jitna hi total.</p><p><b>Constraints.</b> Factory WAN 100 Mbps hai; head-office network team 100G spine-leaf par ja rahi hai; Oracle licences per core hain.</p></div>

<h3>HCI storage network ko kaise badalta hai</h3>
<p><b>HCI</b> mein har server node local flash aur CPU ko software-managed distributed storage layer mein deta hai. Alag SAN nahi hota: nodes ke beech storage traffic (replica writes, rebuilds, remote nodes se reads) <b>Ethernet</b> network par chalta hai. Isse storage design ka problem data center LAN mein aa jaata hai: low-latency spine-leaf, 25/100G links, jumbo MTU, redundant top-of-rack switches, aur aksar storage traffic ke liye dedicated VLAN.</p>
<table class="cmp"><tr><th>Criterion</th><th>Traditional SAN (FC)</th><th>HCI</th></tr>
<tr><td>Scaling</td><td>Compute aur storage alag scale hote hain</td><td>Dono har node ke saath badhte hain, jab tak storage-only ya compute-only nodes na hon</td></tr>
<tr><td>Network</td><td>Dedicated, isolated fabric</td><td>Shared Ethernet; east-west traffic hi storage path hai</td></tr>
<tr><td>Operations</td><td>Storage, SAN aur server teams</td><td>Ek platform team</td></tr>
<tr><td>Bare-metal servers</td><td>Aasani se attach</td><td>Aksar supported nahi</td></tr>
<tr><td>Bade databases</td><td>Proven, predictable</td><td>Possible, sizing chahiye; rebuild traffic matter karta hai</td></tr>
<tr><td>Failure behaviour</td><td>Array controller ya fabric failure</td><td>Node loss network par re-replication chalata hai</td></tr>
<tr><td>Licensing</td><td>Per array ya capacity</td><td>Per node, compute aur storage ki cost jod sakta hai</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="SAN versus HCI">
<rect x="10" y="10" width="300" height="200" rx="10" fill="#f8fafc" stroke="#64748b"/><text x="160" y="32" text-anchor="middle" class="svg-ink" font-size="13">Traditional SAN (head office)</text>
<rect x="30" y="50" width="70" height="30" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="65" y="70" text-anchor="middle" class="svg-ink" font-size="12">Hosts</text>
<rect x="125" y="95" width="70" height="30" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="160" y="115" text-anchor="middle" class="svg-ink" font-size="12">FC fabric</text>
<rect x="220" y="140" width="70" height="30" rx="6" fill="#ddd6fe" stroke="#64748b"/><text x="255" y="160" text-anchor="middle" class="svg-ink" font-size="12">Array</text>
<line x1="85" y1="80" x2="140" y2="95" stroke="#64748b" stroke-width="2"/><line x1="185" y1="125" x2="240" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="160" y="196" text-anchor="middle" class="svg-muted" font-size="11">Compute aur storage alag scale</text>
<rect x="330" y="10" width="300" height="200" rx="10" fill="#f8fafc" stroke="#64748b"/><text x="480" y="32" text-anchor="middle" class="svg-ink" font-size="13">HCI (factory sites)</text>
<rect x="350" y="60" width="70" height="46" rx="6" fill="#fed7aa" stroke="#64748b"/><text x="385" y="80" text-anchor="middle" class="svg-ink" font-size="12">Node 1</text><text x="385" y="96" text-anchor="middle" class="svg-muted" font-size="11">CPU+disk</text>
<rect x="445" y="60" width="70" height="46" rx="6" fill="#fed7aa" stroke="#64748b"/><text x="480" y="80" text-anchor="middle" class="svg-ink" font-size="12">Node 2</text><text x="480" y="96" text-anchor="middle" class="svg-muted" font-size="11">CPU+disk</text>
<rect x="540" y="60" width="70" height="46" rx="6" fill="#fed7aa" stroke="#64748b"/><text x="575" y="80" text-anchor="middle" class="svg-ink" font-size="12">Node 3</text><text x="575" y="96" text-anchor="middle" class="svg-muted" font-size="11">CPU+disk</text>
<rect x="350" y="140" width="260" height="30" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="480" y="160" text-anchor="middle" class="svg-ink" font-size="12">Redundant Ethernet (25G, jumbo MTU)</text>
<line x1="385" y1="106" x2="385" y2="140" stroke="#64748b" stroke-width="2"/><line x1="480" y1="106" x2="480" y2="140" stroke="#64748b" stroke-width="2"/><line x1="575" y1="106" x2="575" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="480" y="196" text-anchor="middle" class="svg-muted" font-size="11">Storage traffic LAN fabric share karta hai</text>
<text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="11">Neela = hosts, hara = fabric, purple = array, orange = HCI nodes</text>
</svg><p class="cap">Ek hi business ko alag jagahon par dono models chahiye ho sakte hain.</p></div>

<h3>Northwind ke liye chosen design</h3>
<p>Factories: har site par teen-node HCI cluster, do top-of-rack switches, 25G links, head office mein witness; local survivability, remote management. Head office: SAP HANA aur Oracle ke liye do 32G MDS fabrics aur all-flash arrays se SAN refresh (compute storage growth se bandha nahi hota, isliye per-core licences predictable rehte hain), aur general VMware workloads ke liye 100G spine-leaf par naya HCI cluster, storage VLAN aur jumbo MTU ke saath. Natija: do models, har ek wahan jahan woh jeette hain.</p>

<div class="warn"><p><b>Common mistake.</b> HCI network ko LAN ki tarah size karna. Node failure par cluster replicas rebuild karta hai, jisse traffic double ho jaata hai. Sirf normal I/O ke liye nahi, rebuild ke liye design karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> HCI storage network ko hatata nahi; use Ethernet par le aata hai. Dual redundant switches aur consistent MTU phir bhi zaroori hain.</p></div>

<div class="scn"><h4>Rebuild jisne sab slow kar diya</h4><p>Northwind ke ek plant mein ek node mar gaya aur HCI cluster ne production VMs ke saath shared 10G links par 6 TB replicas copy karna shuru kar diya. 11 ghante tak user response times double rahe. Fix: 25G uplinks, apni QoS class wala storage VLAN, aur platform mein tune ki hui rebuild bandwidth limit.</p><p><b>Lesson:</b> HCI network ko storage array ka hissa bana deta hai, isliye use utni hi care se treat karo.</p></div>

<div class="iv"><p class="q">"Fibre Channel SAN ki jagah HCI kab recommend karoge?"</p><p>Strong answer: edge, branch aur mid-size virtualised estates ke liye jo simplicity aur linear scale chahte hain, jab network modern Ethernet ho. Bade latency-critical databases, bare-metal hosts, independent scaling ya existing FC investment ke liye SAN chuno. Rebuild aur licence points zaroor batao.</p></div>

<h3>Module summary aur exam checklist</h3>
<p><b>Aap yeh kar paane chahiye:</b></p>
<ul>
<li>Requirements se FC, FCoE, iSCSI ya NVMe-oF (FC, RoCEv2, TCP) chunna, aur choice defend karna.</li>
<li>Dual A/B fabrics design karna, collapsed core, core-edge ya edge-core-edge chunna, aur MDS 9000 fixed versus director select karna.</li>
<li>Safe change process ke saath VSANs, smart zoning aur device aliases design karna.</li>
<li>NPV versus E-port edge decide karna, port channels size karna aur oversubscription aur fan-in/fan-out calculate karna.</li>
<li>PFC, ETS, FIP, VE ports aur alag A/B ke saath FCoE aur multi-hop design karna.</li>
<li>Dedicated VLANs, jumbo MTU aur multipathing ke saath iSCSI aur NVMe/TCP design karna; RoCE ki PFC aur ECN zarooratein jaanna.</li>
<li>Latency se sync ya async chunna, DWDM ya FCIP pick karna, aur analytics, HA aur DR tests plan karna.</li>
<li>HCI ko SAN se compare karna aur network impact samjhana.</li>
</ul>

<dl class="terms">
<dt>WWPN</dt><dd>World Wide Port Name, FC port ki unique 64-bit identity.</dd>
<dt>FCID</dt><dd>Login ke waqt assign hone wala 24-bit fabric address.</dd>
<dt>FLOGI / FDISC</dt><dd>Fabric login; FDISC extra logins jodta hai (NPIV).</dd>
<dt>VSAN</dt><dd>Virtual SAN, wahi switches ke andar alag logical fabric.</dd>
<dt>Smart zoning</dt><dd>Init aur target roles wale zones taaki sirf valid pairs program hon.</dd>
<dt>NPV / NPIV</dt><dd>NP uplinks wala proxy edge switch / ek F port par multiple logins.</dd>
<dt>ISL / TE port</dt><dd>Switches ke beech link; trunking E port kai VSANs carry karta hai.</dd>
<dt>PFC / ETS / DCBX</dt><dd>Per-priority pause / bandwidth sharing / dono ka negotiation.</dd>
<dt>FCIP</dt><dd>Sites ke beech TCP/IP par tunnel hue FC frames.</dd>
<dt>RPO / RTO</dt><dd>Bardasht hone wala data loss / recover hone mein lagne wala time.</dd>
</dl>

<div class="exam"><p><b>Sabse zyada puchhe jaane wale facts.</b> A aur B fabrics kabhi connect nahi hote. Zoning per VSAN hoti hai; default policy deny hai. Smart zoning ko init ya target chahiye. Core par NPIV, edge par NPV, NPV domain ID use nahi karta. SAN port channels mein 16 links tak. FCoE: Ethertype 0x8906, FIP 0x8914, CoS 3 no-drop, MTU 2158, ek FCoE VLAN ek VSAN se. iSCSI: TCP 3260. RoCEv2: UDP 4791 PFC aur ECN ke saath. Sync distance se limited (lagbhag 100 km par 1 ms RTT); async bandwidth se.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har storage design RPO, RTO, latency, scale aur skills se shuru karo.</li>
<li>Isolation (fabrics, VSANs, zones, LUN masking) human error se sabse badi suraksha hai.</li>
<li>Links ko peaks aur rebuilds ke liye size karo, averages ke liye nahi.</li>
<li>HCI storage ko Ethernet par le jaata hai; network design phir bhi safalta tay karta hai.</li>
<li>Failover regularly test karo aur analytics se dekhte raho.</li>
</ul></div>
`}};export{e as default};