var e={id:`san-fundamentals`,h:{en:`SAN fundamentals and choosing the storage protocol`,hi:`SAN fundamentals aur storage protocol ka selection`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn to design the storage network of a data center the way a Cisco 300-610 DCID candidate is expected to: starting from a customer's requirements, not from a command. Seven chapters take you through protocol choice, dual-fabric SAN topologies, zoning and VSANs, NPV and NPIV, ISL sizing and oversubscription, FCoE and storage over Ethernet, SAN extension for disaster recovery, SAN analytics, and the hyperconverged-versus-SAN decision. <b>Prerequisites:</b> you should know what a VLAN and a trunk are, what a server and a hypervisor do, and roughly what a disk is. Compute and network modules of this track help, but they are not required.</p>

<h3>Start with an analogy: the warehouse and the delivery roads</h3>
<p>Imagine a huge warehouse (the <b>storage array</b>) holding the data of many companies. The shops (the <b>servers</b>) do not own shelves of their own; they order boxes (blocks of data) from the warehouse. The roads between shops and warehouse are the <b>SAN</b>, a <b>Storage Area Network</b>. A SAN gives each server the illusion of a locally attached disk, called a <b>LUN</b> (Logical Unit Number), while the data physically lives in a shared array. Because a lost road means a shop cannot read its own "disk", SAN designers are obsessive about two things: never lose the path, and never drop a frame.</p>

<h3>The case: Kestrel Logistics</h3>
<div class="eg"><p><b>Customer.</b> Kestrel Logistics, a freight company with one main data center and a recovery site 40 km away. It runs 60 ESXi hosts, a Microsoft SQL Server cluster for its tracking system and an Oracle warehouse database. Today it has one Ethernet-based iSCSI array and users complain of slow database writes at month end.</p><p><b>Requirements.</b> Database latency under 2 ms; no single point of failure; 40 percent capacity growth in three years; budget for two new all-flash arrays and two storage switches.</p><p><b>Constraints.</b> The storage team has FC experience; the network team runs Nexus 9000 for the LAN; the CIO wants to try NVMe for the Oracle workload later.</p></div>

<h3>Block storage protocols: the options</h3>
<ul>
<li><b>Fibre Channel (FC).</b> A dedicated, lossless network with its own protocol stack. Speeds of 8, 16, 32 and 64 Gbps. It uses <b>buffer-to-buffer credits</b> so a sender never transmits when the receiver has no buffer. Identity is the <b>WWPN</b> (World Wide Port Name), and the fabric hands out a 24-bit <b>FCID</b>.</li>
<li><b>FCoE.</b> The same FC frames carried inside Ethernet (Ethertype 0x8906) over a lossless 10/25/40/100 Gbps link, so one cable carries LAN and SAN. It needs <b>Priority Flow Control</b> to make Ethernet lossless for the FCoE class.</li>
<li><b>iSCSI.</b> SCSI commands carried over TCP port 3260 on ordinary Ethernet. Cheap and routable, but it depends on your Ethernet quality.</li>
<li><b>NVMe over Fabrics (NVMe-oF).</b> NVMe commands over a network, with far lower latency and many parallel queues. The transports are <b>NVMe/FC</b> (runs on the same FC fabric), <b>NVMe/RoCEv2</b> (RDMA over lossless Ethernet) and <b>NVMe/TCP</b> (plain TCP, no special NIC).</li>
</ul>

<table class="cmp"><tr><th>Option</th><th>Strength</th><th>Weakness</th><th>Fits Kestrel?</th></tr>
<tr><td>FC (32G)</td><td>Isolated, predictable, mature tooling</td><td>Separate switches, HBAs and skills</td><td>Yes, for databases</td></tr>
<tr><td>FCoE</td><td>One cable, fewer adapters</td><td>Needs careful PFC design</td><td>Maybe for blade/UCS access</td></tr>
<tr><td>iSCSI</td><td>Low cost, routable</td><td>Shares LAN, latency varies</td><td>Yes, for dev and file-like loads</td></tr>
<tr><td>NVMe/FC</td><td>Low latency, reuses FC fabric</td><td>Needs array and HBA support</td><td>Yes, later for Oracle</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Basic SAN with hosts, two fabrics and an array">
<rect x="20" y="20" width="110" height="46" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="75" y="48" text-anchor="middle" class="svg-ink" font-size="13">ESXi host 1</text>
<rect x="20" y="100" width="110" height="46" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="75" y="128" text-anchor="middle" class="svg-ink" font-size="13">SQL cluster</text>
<rect x="20" y="180" width="110" height="46" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="75" y="208" text-anchor="middle" class="svg-ink" font-size="13">Oracle host</text>
<rect x="260" y="40" width="120" height="50" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">SAN switch A</text>
<rect x="260" y="170" width="120" height="50" rx="8" fill="#fde68a" stroke="#64748b"/><text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">SAN switch B</text>
<rect x="500" y="80" width="120" height="100" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="560" y="125" text-anchor="middle" class="svg-ink" font-size="13">All-flash</text><text x="560" y="145" text-anchor="middle" class="svg-ink" font-size="13">array</text>
<line x1="130" y1="43" x2="260" y2="60" stroke="#64748b"/><line x1="130" y1="123" x2="260" y2="70" stroke="#64748b"/><line x1="130" y1="203" x2="260" y2="75" stroke="#64748b"/>
<line x1="130" y1="50" x2="260" y2="185" stroke="#64748b"/><line x1="130" y1="130" x2="260" y2="195" stroke="#64748b"/><line x1="130" y1="205" x2="260" y2="205" stroke="#64748b"/>
<line x1="380" y1="65" x2="500" y2="105" stroke="#64748b"/><line x1="380" y1="195" x2="500" y2="155" stroke="#64748b"/>
<text x="320" y="20" text-anchor="middle" class="svg-muted" font-size="12">Fabric A and Fabric B never connect</text>
<rect x="20" y="240" width="12" height="12" fill="#bae6fd"/><text x="38" y="251" class="svg-muted" font-size="11">Host</text>
<rect x="90" y="240" width="12" height="12" fill="#bbf7d0"/><text x="108" y="251" class="svg-muted" font-size="11">Fabric A</text>
<rect x="180" y="240" width="12" height="12" fill="#fde68a"/><text x="198" y="251" class="svg-muted" font-size="11">Fabric B</text>
<rect x="270" y="240" width="12" height="12" fill="#ddd6fe"/><text x="288" y="251" class="svg-muted" font-size="11">Storage</text>
</svg><p class="cap">Every host has one port to each fabric; the array has controllers on both.</p></div>

<h3>Requirements to design decisions</h3>
<p>Kestrel's requirement "latency under 2 ms" and "no single point of failure" translate to: all-flash arrays, 32G FC, two fabrics, and multipathing in the OS. "Storage team knows FC" and "database workloads" favour FC for the core. "CIO wants NVMe" is satisfied without a new network because NVMe/FC rides on the same FC fabric; the array and HBA simply speak both FCP (SCSI) and FC-NVMe on one port. iSCSI is kept for the test and development cluster, where a shared Ethernet fabric with a dedicated VLAN is good enough.</p>
<p><b>Chosen design.</b> Two MDS 9000 fabrics (A and B), 32G FC to the databases and arrays, NVMe/FC enabled for the Oracle hosts after firmware validation, iSCSI on dedicated VLANs and 9000-byte MTU for development. Each host runs multipathing (for example VMware native multipathing) across both fabrics.</p>

<h3>Why the protocol choice is a design trade-off, not a fashion</h3>
<p>FC and FCoE share the same upper layers, so a LUN looks identical to a host. The difference is the transport: a purpose-built lossless fabric versus converged Ethernet. NVMe/RoCEv2 gives the lowest latency but demands the strictest Ethernet configuration (PFC and ECN end to end). NVMe/TCP is easier to run but uses more CPU and has higher tail latency than RDMA.</p>

<div class="exam"><p><b>Exam trap.</b> Do not say that FCoE "replaces" FC. FCoE is an encapsulation of FC frames; zoning, WWPNs, FLOGI and name server work the same. NVMe/FC is not a different cable either; it is a different upper-layer protocol on the FC fabric.</p></div>
<div class="warn"><p><b>Common mistake.</b> Running iSCSI for a latency-sensitive database on the same VLAN and uplinks as user traffic. One backup job then spikes database latency. Separate the VLAN, enable jumbo MTU end to end and give the storage class its own queue.</p></div>

<div class="scn"><h4>What went wrong at Kestrel before the redesign</h4><p>Month-end writes were slow because the iSCSI array shared 10G uplinks with a nightly file backup. Retransmissions rose, SQL waits on log writes climbed to 25 ms, and the tracking portal timed out. The team first blamed the array. Port counters on the uplink showed drops during the backup window. Moving storage to dedicated FC fabrics removed the contention, and latency fell below 1 ms.</p><p><b>Lesson:</b> a shared network can be perfectly healthy for the LAN and still be wrong for storage. Design for the worst hour, not the average.</p></div>

<div class="iv"><p class="q">"A customer wants NVMe performance. Must they replace their Fibre Channel SAN?"</p><p>Strong answer: no. NVMe/FC runs on the existing FC fabric if the HBAs, switch software and arrays support it. Both FCP and FC-NVMe can coexist on one port, so you migrate hosts one by one. Choose NVMe/RoCEv2 or NVMe/TCP only when the customer already runs a lossless or very fast Ethernet fabric.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A SAN presents shared array capacity to servers as LUNs; losing the path means losing the disk.</li>
<li>FC is a dedicated lossless fabric; FCoE carries FC frames over lossless Ethernet; iSCSI uses TCP 3260.</li>
<li>NVMe-oF transports are NVMe/FC, NVMe/RoCEv2 and NVMe/TCP.</li>
<li>Pick the protocol from latency, skills, budget and growth, then validate hardware support.</li>
<li>Always plan two independent fabrics and multipathing.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap data center ka storage network usi tarah design karna seekhoge jaise Cisco 300-610 DCID candidate se expected hai: customer ki requirements se shuru karke, command se nahi. Saat chapters mein protocol choice, dual-fabric SAN topologies, zoning aur VSANs, NPV aur NPIV, ISL sizing aur oversubscription, FCoE aur storage over Ethernet, disaster recovery ke liye SAN extension, SAN analytics, aur hyperconverged versus SAN ka decision cover hoga. <b>Prerequisites:</b> aapko pata hona chahiye VLAN aur trunk kya hota hai, server aur hypervisor kya karte hain, aur disk kya hoti hai. Is track ke compute aur network modules madad karte hain, par zaroori nahi.</p>

<h3>Analogy se shuru karein: warehouse aur delivery roads</h3>
<p>Ek bahut bade warehouse (<b>storage array</b>) ki kalpana karo jisme kai companies ka data rakha hai. Shops (<b>servers</b>) ke paas apni shelves nahi hoti; woh warehouse se boxes (data ke blocks) mangwate hain. Shops aur warehouse ke beech ki roads hi <b>SAN</b>, yaani <b>Storage Area Network</b> hain. SAN har server ko ek local disk ka ehsaas deta hai, jise <b>LUN</b> (Logical Unit Number) kehte hain, jabki data physically shared array mein rehta hai. Road gum hui to shop apni hi "disk" nahi padh sakti, isliye SAN designers do cheezon par bahut strict hote hain: path kabhi mat khoo, frame kabhi drop mat karo.</p>

<h3>Case: Kestrel Logistics</h3>
<div class="eg"><p><b>Customer.</b> Kestrel Logistics, ek freight company jiska ek main data center hai aur 40 km door recovery site hai. Uske paas 60 ESXi hosts, tracking system ka Microsoft SQL Server cluster aur ek Oracle warehouse database hai. Abhi ek Ethernet-based iSCSI array hai aur month end par users database writes slow hone ki shikayat karte hain.</p><p><b>Requirements.</b> Database latency 2 ms se kam; koi single point of failure nahi; teen saal mein 40 percent capacity growth; do naye all-flash arrays aur do storage switches ka budget.</p><p><b>Constraints.</b> Storage team ko FC ka experience hai; network team LAN ke liye Nexus 9000 chalati hai; CIO baad mein Oracle workload ke liye NVMe try karna chahta hai.</p></div>

<h3>Block storage protocols: options</h3>
<ul>
<li><b>Fibre Channel (FC).</b> Dedicated, lossless network jiska apna protocol stack hai. Speeds 8, 16, 32 aur 64 Gbps. Yeh <b>buffer-to-buffer credits</b> use karta hai, taaki sender tab transmit na kare jab receiver ke paas buffer na ho. Identity <b>WWPN</b> (World Wide Port Name) hoti hai, aur fabric 24-bit <b>FCID</b> deta hai.</li>
<li><b>FCoE.</b> Wahi FC frames Ethernet (Ethertype 0x8906) ke andar, lossless 10/25/40/100 Gbps link par, yaani ek cable LAN aur SAN dono carry karti hai. FCoE class ko lossless banane ke liye <b>Priority Flow Control</b> chahiye.</li>
<li><b>iSCSI.</b> SCSI commands TCP port 3260 par normal Ethernet ke upar. Sasta aur routable, par aapki Ethernet quality par depend karta hai.</li>
<li><b>NVMe over Fabrics (NVMe-oF).</b> NVMe commands network par, bahut kam latency aur kai parallel queues ke saath. Transports: <b>NVMe/FC</b> (wahi FC fabric par chalta hai), <b>NVMe/RoCEv2</b> (lossless Ethernet par RDMA) aur <b>NVMe/TCP</b> (plain TCP, special NIC nahi).</li>
</ul>

<table class="cmp"><tr><th>Option</th><th>Strength</th><th>Weakness</th><th>Kestrel ke liye fit?</th></tr>
<tr><td>FC (32G)</td><td>Isolated, predictable, mature tooling</td><td>Alag switches, HBAs aur skills</td><td>Haan, databases ke liye</td></tr>
<tr><td>FCoE</td><td>Ek cable, kam adapters</td><td>PFC design dhyan se karna padta hai</td><td>Shayad blade/UCS access ke liye</td></tr>
<tr><td>iSCSI</td><td>Kam cost, routable</td><td>LAN share karta hai, latency vary karti hai</td><td>Haan, dev aur file-like loads ke liye</td></tr>
<tr><td>NVMe/FC</td><td>Kam latency, FC fabric reuse</td><td>Array aur HBA support chahiye</td><td>Haan, baad mein Oracle ke liye</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Hosts, do fabrics aur array wala basic SAN">
<rect x="20" y="20" width="110" height="46" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="75" y="48" text-anchor="middle" class="svg-ink" font-size="13">ESXi host 1</text>
<rect x="20" y="100" width="110" height="46" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="75" y="128" text-anchor="middle" class="svg-ink" font-size="13">SQL cluster</text>
<rect x="20" y="180" width="110" height="46" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="75" y="208" text-anchor="middle" class="svg-ink" font-size="13">Oracle host</text>
<rect x="260" y="40" width="120" height="50" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">SAN switch A</text>
<rect x="260" y="170" width="120" height="50" rx="8" fill="#fde68a" stroke="#64748b"/><text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">SAN switch B</text>
<rect x="500" y="80" width="120" height="100" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="560" y="125" text-anchor="middle" class="svg-ink" font-size="13">All-flash</text><text x="560" y="145" text-anchor="middle" class="svg-ink" font-size="13">array</text>
<line x1="130" y1="43" x2="260" y2="60" stroke="#64748b"/><line x1="130" y1="123" x2="260" y2="70" stroke="#64748b"/><line x1="130" y1="203" x2="260" y2="75" stroke="#64748b"/>
<line x1="130" y1="50" x2="260" y2="185" stroke="#64748b"/><line x1="130" y1="130" x2="260" y2="195" stroke="#64748b"/><line x1="130" y1="205" x2="260" y2="205" stroke="#64748b"/>
<line x1="380" y1="65" x2="500" y2="105" stroke="#64748b"/><line x1="380" y1="195" x2="500" y2="155" stroke="#64748b"/>
<text x="320" y="20" text-anchor="middle" class="svg-muted" font-size="12">Fabric A aur Fabric B kabhi connect nahi hote</text>
<rect x="20" y="240" width="12" height="12" fill="#bae6fd"/><text x="38" y="251" class="svg-muted" font-size="11">Host</text>
<rect x="90" y="240" width="12" height="12" fill="#bbf7d0"/><text x="108" y="251" class="svg-muted" font-size="11">Fabric A</text>
<rect x="180" y="240" width="12" height="12" fill="#fde68a"/><text x="198" y="251" class="svg-muted" font-size="11">Fabric B</text>
<rect x="270" y="240" width="12" height="12" fill="#ddd6fe"/><text x="288" y="251" class="svg-muted" font-size="11">Storage</text>
</svg><p class="cap">Har host ka ek port har fabric se judta hai; array ke controllers dono mein hote hain.</p></div>

<h3>Requirements se design decisions tak</h3>
<p>Kestrel ki requirement "latency 2 ms se kam" aur "koi single point of failure nahi" ka matlab hai: all-flash arrays, 32G FC, do fabrics, aur OS mein multipathing. "Storage team FC jaanti hai" aur "database workloads" FC ko core ke liye favour karte hain. "CIO ko NVMe chahiye" ke liye naya network nahi chahiye, kyunki NVMe/FC wahi FC fabric par chalta hai; array aur HBA ek hi port par FCP (SCSI) aur FC-NVMe dono bolte hain. iSCSI test aur development cluster ke liye rakha gaya hai, jahan dedicated VLAN wala shared Ethernet fabric kaafi hai.</p>
<p><b>Chosen design.</b> Do MDS 9000 fabrics (A aur B), databases aur arrays ko 32G FC, firmware validation ke baad Oracle hosts ke liye NVMe/FC enable, development ke liye dedicated VLANs aur 9000-byte MTU par iSCSI. Har host dono fabrics par multipathing chalata hai (jaise VMware native multipathing).</p>

<h3>Protocol choice trade-off kyun hai, fashion nahi</h3>
<p>FC aur FCoE ki upar ki layers same hain, isliye host ko LUN same dikhta hai. Fark transport ka hai: purpose-built lossless fabric versus converged Ethernet. NVMe/RoCEv2 sabse kam latency deta hai, par Ethernet configuration sabse strict maangta hai (PFC aur ECN end to end). NVMe/TCP chalana aasan hai, par RDMA se zyada CPU leta hai aur tail latency bhi zyada hoti hai.</p>

<div class="exam"><p><b>Exam trap.</b> Aisa mat kaho ki FCoE FC ko "replace" karta hai. FCoE FC frames ka encapsulation hai; zoning, WWPNs, FLOGI aur name server same kaam karte hain. NVMe/FC bhi alag cable nahi hai; yeh FC fabric par alag upper-layer protocol hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Latency-sensitive database ke liye iSCSI ko user traffic wale VLAN aur uplinks par chalana. Ek backup job database latency spike kar deta hai. VLAN alag karo, end to end jumbo MTU enable karo aur storage class ko apni queue do.</p></div>

<div class="scn"><h4>Redesign se pehle Kestrel mein kya galat gaya</h4><p>Month-end writes slow the kyunki iSCSI array 10G uplinks ko nightly file backup ke saath share kar raha tha. Retransmissions badhe, SQL ka log write wait 25 ms tak gaya, aur tracking portal time out hone laga. Team ne pehle array ko blame kiya. Uplink ke port counters ne backup window mein drops dikhaye. Storage ko dedicated FC fabrics par le jaane se contention hat gaya aur latency 1 ms se neeche aa gayi.</p><p><b>Lesson:</b> shared network LAN ke liye bilkul healthy ho sakta hai aur phir bhi storage ke liye galat ho sakta hai. Worst hour ke liye design karo, average ke liye nahi.</p></div>

<div class="iv"><p class="q">"Customer ko NVMe performance chahiye. Kya unhe apna Fibre Channel SAN replace karna padega?"</p><p>Strong answer: nahi. Agar HBAs, switch software aur arrays support karte hain to NVMe/FC existing FC fabric par chalta hai. FCP aur FC-NVMe ek hi port par saath reh sakte hain, isliye hosts ko ek ek karke migrate karte ho. NVMe/RoCEv2 ya NVMe/TCP tab chuno jab customer ke paas pehle se lossless ya bahut fast Ethernet fabric ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SAN shared array capacity ko servers ko LUNs ki tarah deta hai; path khona matlab disk khona.</li>
<li>FC dedicated lossless fabric hai; FCoE FC frames ko lossless Ethernet par le jaata hai; iSCSI TCP 3260 use karta hai.</li>
<li>NVMe-oF transports: NVMe/FC, NVMe/RoCEv2 aur NVMe/TCP.</li>
<li>Latency, skills, budget aur growth se protocol chuno, phir hardware support validate karo.</li>
<li>Hamesha do independent fabrics aur multipathing plan karo.</li>
</ul></div>
`}};export{e as default};