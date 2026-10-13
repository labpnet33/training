var e=(e,t,n,r,i,a,o,s)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" rx="6" fill="`+i+`" stroke="#64748b"`+(s?` stroke-dasharray="4 3"`:``)+`/><text x="`+(e+n/2)+`" y="`+(t+20)+`" text-anchor="middle" class="svg-ink" font-size="12">`+a+`</text>`+(o?`<text x="`+(e+n/2)+`" y="`+(t+36)+`" text-anchor="middle" class="svg-muted" font-size="11">`+o+`</text>`:``),t=t=>`<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="`+t.alt+`"><rect x="10" y="10" width="200" height="250" rx="8" fill="none" stroke="#64748b" stroke-dasharray="3 3"/><text x="110" y="28" text-anchor="middle" class="svg-accent" font-size="13">`+t.p1+`</text><rect x="225" y="10" width="200" height="250" rx="8" fill="none" stroke="#64748b" stroke-dasharray="3 3"/><text x="325" y="28" text-anchor="middle" class="svg-accent" font-size="13">`+t.p2+`</text><rect x="440" y="10" width="190" height="250" rx="8" fill="none" stroke="#64748b" stroke-dasharray="3 3"/><text x="535" y="28" text-anchor="middle" class="svg-accent" font-size="13">`+t.p3+`</text>`+e(25,45,80,46,`#bbf7d0`,t.cv,`HX data`)+e(115,45,80,46,`#bbf7d0`,t.cv,`HX data`)+e(25,100,80,46,`#bbf7d0`,t.cv,`HX data`)+e(115,100,80,46,`#bae6fd`,t.co,`no disks`)+e(25,160,170,40,`#ddd6fe`,`FI-A / FI-B`,t.fi)+`<text x="110" y="230" text-anchor="middle" class="svg-muted" font-size="12">`+t.n1+`</text><text x="110" y="248" text-anchor="middle" class="svg-muted" font-size="12">`+t.n1b+`</text>`+e(240,45,80,46,`#bbf7d0`,t.cv,`HX Edge`)+e(330,45,80,46,`#bbf7d0`,t.cv,`HX Edge`)+e(240,110,170,40,`#ddd6fe`,t.sw,`10 / 25G`)+e(285,170,80,40,`#fde68a`,t.wit,``,!0)+`<line x1="325" y1="150" x2="325" y2="170" stroke="#64748b" stroke-dasharray="4 3"/><text x="325" y="232" text-anchor="middle" class="svg-muted" font-size="12">`+t.n2+`</text><text x="325" y="250" text-anchor="middle" class="svg-muted" font-size="12">`+t.n2b+`</text>`+e(455,45,160,56,`#fed7aa`,t.gs,`8 GPU`)+e(455,110,160,40,`#ddd6fe`,t.nic,`200 / 400G`)+e(455,160,160,40,`#bae6fd`,t.k8,`pods`)+`<text x="535" y="232" text-anchor="middle" class="svg-muted" font-size="12">`+t.n3+`</text><text x="535" y="250" text-anchor="middle" class="svg-muted" font-size="12">`+t.n3b+`</text><rect x="30" y="285" width="14" height="14" fill="#bbf7d0" stroke="#64748b"/><text x="50" y="297" class="svg-muted" font-size="12">`+t.l1+`</text><rect x="170" y="285" width="14" height="14" fill="#bae6fd" stroke="#64748b"/><text x="190" y="297" class="svg-muted" font-size="12">`+t.l2+`</text><rect x="320" y="285" width="14" height="14" fill="#fed7aa" stroke="#64748b"/><text x="340" y="297" class="svg-muted" font-size="12">`+t.l3+`</text><rect x="440" y="285" width="14" height="14" fill="#fde68a" stroke="#64748b"/><text x="460" y="297" class="svg-muted" font-size="12">`+t.l4+`</text></svg><p class="cap">`+t.cap+`</p></div>`,n={id:`hyperconverged-virtualization-gpu`,h:{en:`Hyperconverged, virtualization, Kubernetes and GPU server design`,hi:`Hyperconverged, virtualization, Kubernetes aur GPU server design`},body:{en:`
<h3>The customer case: Orion Genomics</h3>
<p>Orion Genomics has three needs. A hospital-facing portal runs on 120 virtual machines and has outgrown its old servers. Eleven clinics need a small local cluster for imaging software and cannot send an engineer to repair anything. A research group wants to train models on sequencing data and has been quoted a server with eight GPUs. The IT team has two people.</p>
<p><b>Requirements:</b> an easy platform for the portal; tiny, self-healing clusters in clinics; a GPU platform that the network and facilities can actually host. <b>Constraints:</b> clinics have 10 or 25 Gbps top-of-rack switches only; the data center rack budget is 12 kW; the portal's 120 VMs need about 1.8 TB of RAM with room for one host failure.</p>

<h3>Beginner view: what hyperconverged means</h3>
<p>In a traditional design, compute servers, a SAN and storage arrays are separate boxes. In a <b>hyperconverged infrastructure (HCI)</b>, every node has its own disks and the nodes together form one shared storage pool through software. Cisco HyperFlex used the <b>HX Data Platform</b> on UCS nodes. Data is protected by keeping copies on other nodes: <b>replication factor 2 (RF2)</b> keeps two copies, <b>RF3</b> keeps three and survives more failures at the cost of capacity.</p>
<table class="cmp"><tr><th>HyperFlex form</th><th>Shape</th><th>Fits</th></tr>
<tr><td>Standard cluster</td><td>Converged nodes (disks plus compute) and optional compute-only nodes, attached to a UCS domain</td><td>Data center VM farms</td></tr>
<tr><td>Edge cluster</td><td>2 to 4 nodes on ordinary 10 or 25 Gbps switches, no fabric interconnects, managed from Intersight</td><td>Branch and clinic sites</td></tr>
<tr><td>Stretched cluster</td><td>Equal nodes in two sites plus a witness at a third; needs low latency and high bandwidth between sites</td><td>Zero data loss across two buildings</td></tr>
</table>
`+t({alt:`HyperFlex, edge and GPU server patterns`,p1:`HX cluster in DC`,p2:`HX Edge (branch)`,p3:`AI / GPU pattern`,cv:`Converged`,co:`Compute-only`,fi:`UCS domain`,sw:`ToR switches`,wit:`Witness`,gs:`GPU server`,nic:`NICs / fabric`,k8:`Kubernetes`,n1:`Scale compute and`,n1b:`storage separately`,n2:`No FIs, 2 to 4 nodes`,n2b:`managed from the cloud`,n3:`Power, cooling, network`,n3b:`decide the size`,l1:`Storage + compute`,l2:`Compute only`,l3:`Accelerated`,l4:`Witness`,cap:`Three patterns: a data center HX cluster with FIs, a small edge cluster without FIs, and a GPU server design where power, cooling and network drive the sizing.`})+`
<h3>Virtualization sizing</h3>
<ul>
<li><b>Failure headroom:</b> size for N+1. If 6 hosts must run the load and one may fail, buy 7. For HCI the lost node also reduces storage capacity and triggers a rebuild, so check capacity with RF in mind.</li>
<li><b>CPU:</b> a vCPU to physical core ratio is a planning input, not a rule. Start from measured usage. Remember NUMA: a very large VM that spans sockets can run slower.</li>
<li><b>Memory:</b> usually the first limit. Orion's 1.8 TB plus one host failure means: with 8 hosts at 512 GB, the 7 survivors give 3.5 TB, which leaves room for growth.</li>
<li><b>Network layout for the hypervisor:</b> separate vNICs for management, vMotion, storage and VM traffic, with each pair spread across fabric A and B.</li>
</ul>
<div class="eg"><p>Portal sizing: 1.8 TB needed. Host RAM 512 GB. Hosts for the load: 1.8 / 0.5 = 3.6, so 4. Add one for failure: 5. Add 30 percent growth: about 6. Orion buys 6 hosts. HX with RF3 on 6 nodes tolerates two simultaneous node failures if free capacity allows the rebuild, so capacity must stay under the vendor's recommended fill level.</p></div>

<h3>Kubernetes and containers</h3>
<p>Containers need many small east-west flows, a CNI plugin for pod networking, persistent volumes, and fast node replacement. Design questions: bare metal or VM nodes, how many nodes per failure domain, which storage class provides persistent volumes, and how the cluster is built and upgraded. Intersight offers a managed Kubernetes service, and profiles can build the underlying servers repeatably. Adapter policies on the VIC allow tuned settings such as receive queues; verify feature support for the exact adapter and OS before promising it.</p>

<h3>AI and GPU server design</h3>
<p>A GPU server pulls much more power and produces more heat than a general server. An eight-GPU system can need several kW per chassis, so a 12 kW rack holds very few. Design in this order: <b>power and cooling</b> first, then <b>PCIe and GPU layout</b> (for example GPUs in a dedicated node attached to an X-Series compute node, or an eight-GPU rack server), then the <b>network</b>. Training clusters need a lossless, high-speed east-west fabric, typically 200 or 400 Gbps NICs with RoCEv2 using PFC and ECN, as covered in the network modules. Storage must feed the GPUs fast enough, so check throughput and not just capacity.</p>

<h3>Options and trade-offs</h3>
<table class="cmp"><tr><th>Need</th><th>Option</th><th>Pros</th><th>Cons</th></tr>
<tr><td>Portal</td><td>HX standard cluster</td><td>Single team, simple scaling</td><td>Storage and compute scale together unless compute-only nodes are added</td></tr>
<tr><td>Portal</td><td>Blades plus SAN</td><td>Independent scaling, existing skills</td><td>Two teams and more parts</td></tr>
<tr><td>Clinics</td><td>HX Edge, 2 nodes with cloud witness</td><td>No FIs, small, remote managed</td><td>Limited scale; witness needs connectivity</td></tr>
<tr><td>Research</td><td>8-GPU server on a 400G fabric in a high-density row</td><td>Meets model training speed</td><td>Needs facility upgrade</td></tr>
</table>
<div class="eg"><p><b>Chosen design.</b> Portal: HX standard cluster of six converged nodes, RF3, hosted behind a UCS domain managed by Intersight. Clinics: two-node HX Edge clusters managed centrally. Research: a GPU server in a facility row with the required power and cooling; if the 12 kW budget is the limit, start with one server and publish the facility plan.</p></div>

<div class="warn"><p><b>Post-mortem: the clinic that lost its witness.</b> A clinic's 2-node cluster lost its link to the witness during a network change, and one node stopped serving. Both nodes were healthy, but quorum needed the witness. Fix: monitor witness reachability and treat it as part of the cluster.</p></div>
<div class="exam"><p><b>Exam trap.</b> Pick the form from the site: FIs and a UCS domain for a data center cluster, no FIs for edge, a witness in a third location for stretched clusters. Do not treat compute-only nodes as capacity providers. Check the current lifecycle status of a platform in vendor announcements before recommending it for a new build.</p></div>

<div class="scn"><h4>The GPU server that did not fit</h4><p>A research server arrived and tripped the breaker on a 12 kW row, because two such servers were planned in one rack. The facilities team measured peak draw and found one server was the limit. The group moved to a high-density row and put storage elsewhere.</p><p><b>Lesson:</b> do the power and cooling arithmetic before the purchase order.</p></div>
<div class="iv"><p class="q">"When would you choose HCI over blades with a SAN?"</p><p>Strong answer: pick HCI when the team is small, workloads are uniform, and fast simple scale-out matters, especially at the edge. Pick blades with a SAN when compute and storage must scale independently, when you already run shared arrays, or when workloads need features that HCI does not offer.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HCI pools local disks through software; RF2 and RF3 trade capacity for resilience.</li>
<li>Standard, edge and stretched clusters fit different sites; stretched needs a witness and low latency.</li>
<li>Size virtualization for N+1 and check memory first.</li>
<li>Kubernetes design is about failure domains, pod networking and persistent storage.</li>
<li>GPU design starts with power and cooling, then PCIe, then network.</li>
</ul></div>
`,hi:`
<h3>Customer case: Orion Genomics</h3>
<p>Orion Genomics ki teen zarooratein hain. Hospital-facing portal 120 virtual machines par chalta hai aur purane servers se bahar ho gaya hai. Gyarah clinics ko imaging software ke liye chhota local cluster chahiye aur woh kuch repair karne engineer nahi bhej sakte. Ek research group sequencing data par models train karna chahta hai aur use aath GPUs wale server ka quote mila hai. IT team mein do log hain.</p>
<p><b>Requirements:</b> portal ke liye aasaan platform; clinics mein chhote, self-healing clusters; aisa GPU platform jo network aur facilities sach mein host kar sakein. <b>Constraints:</b> clinics mein sirf 10 ya 25 Gbps top-of-rack switches hain; data center rack budget 12 kW hai; portal ke 120 VMs ko lagbhag 1.8 TB RAM chahiye, ek host failure ki jagah ke saath.</p>

<h3>Beginner view: hyperconverged ka matlab</h3>
<p>Traditional design mein compute servers, SAN aur storage arrays alag boxes hote hain. <b>Hyperconverged infrastructure (HCI)</b> mein har node ke apne disks hote hain aur nodes mil kar software se ek shared storage pool banate hain. Cisco HyperFlex UCS nodes par <b>HX Data Platform</b> use karta tha. Data ki suraksha doosre nodes par copies rakh kar hoti hai: <b>replication factor 2 (RF2)</b> do copies rakhta hai, <b>RF3</b> teen copies rakhta hai aur capacity ki keemat par zyada failures survive karta hai.</p>
<table class="cmp"><tr><th>HyperFlex form</th><th>Shape</th><th>Kahan fit</th></tr>
<tr><td>Standard cluster</td><td>Converged nodes (disks plus compute) aur optional compute-only nodes, UCS domain se attached</td><td>Data center VM farms</td></tr>
<tr><td>Edge cluster</td><td>Aam 10 ya 25 Gbps switches par 2 se 4 nodes, fabric interconnects nahi, Intersight se managed</td><td>Branch aur clinic sites</td></tr>
<tr><td>Stretched cluster</td><td>Do sites mein barabar nodes aur teesri jagah witness; sites ke beech low latency aur high bandwidth chahiye</td><td>Do buildings ke beech zero data loss</td></tr>
</table>
`+t({alt:`HyperFlex, edge aur GPU server patterns`,p1:`DC mein HX cluster`,p2:`HX Edge (branch)`,p3:`AI / GPU pattern`,cv:`Converged`,co:`Compute-only`,fi:`UCS domain`,sw:`ToR switches`,wit:`Witness`,gs:`GPU server`,nic:`NICs / fabric`,k8:`Kubernetes`,n1:`Compute aur storage`,n1b:`alag scale karo`,n2:`FIs nahi, 2 se 4 nodes`,n2b:`cloud se managed`,n3:`Power, cooling, network`,n3b:`size tay karte hain`,l1:`Storage + compute`,l2:`Sirf compute`,l3:`Accelerated`,l4:`Witness`,cap:`Teen patterns: FIs ke saath DC HX cluster, FIs ke bina chhota edge cluster, aur GPU server design jahan power, cooling aur network sizing tay karte hain.`})+`
<h3>Virtualization sizing</h3>
<ul>
<li><b>Failure headroom:</b> N+1 ke liye size karo. Agar 6 hosts load chalane chahiye aur ek fail ho sakta hai, to 7 kharido. HCI mein gaya hua node storage capacity bhi ghatata hai aur rebuild shuru karta hai, isliye RF ke saath capacity check karo.</li>
<li><b>CPU:</b> vCPU se physical core ratio planning input hai, rule nahi. Measured usage se shuru karo. NUMA yaad rakho: bahut bada VM jo sockets par phailta hai slow ho sakta hai.</li>
<li><b>Memory:</b> aam taur par pehli limit. Orion ka 1.8 TB aur ek host failure: 512 GB ke 8 hosts mein 7 bache hosts 3.5 TB dete hain, jisse growth ki jagah bachti hai.</li>
<li><b>Hypervisor ka network layout:</b> management, vMotion, storage aur VM traffic ke liye alag vNICs, har pair fabric A aur B par phaili hui.</li>
</ul>
<div class="eg"><p>Portal sizing: 1.8 TB chahiye. Host RAM 512 GB. Load ke liye hosts: 1.8 / 0.5 = 3.6, yaani 4. Failure ke liye ek aur: 5. 30 percent growth jodo: lagbhag 6. Orion 6 hosts kharidta hai. 6 nodes par RF3 wala HX do ek saath node failures tolerate karta hai agar free capacity rebuild allow kare, isliye capacity vendor ke recommended fill level se neeche rakho.</p></div>

<h3>Kubernetes aur containers</h3>
<p>Containers ko bahut saare chhote east-west flows, pod networking ke liye CNI plugin, persistent volumes aur tez node replacement chahiye. Design sawal: bare metal ya VM nodes, har failure domain mein kitne nodes, persistent volumes kaunsi storage class deti hai, aur cluster kaise banta aur upgrade hota hai. Intersight managed Kubernetes service deta hai, aur profiles neeche ke servers ko repeatable tareeke se bana sakte hain. VIC ki adapter policies receive queues jaisi tuned settings deti hain; promise karne se pehle exact adapter aur OS ke liye feature support verify karo.</p>

<h3>AI aur GPU server design</h3>
<p>GPU server general server se kahin zyada power kheenchta hai aur zyada heat banata hai. Aath-GPU system ko har chassis mein kai kW chahiye ho sakte hain, isliye 12 kW rack mein bahut kam aate hain. Is order mein design karo: pehle <b>power aur cooling</b>, phir <b>PCIe aur GPU layout</b> (jaise X-Series compute node se attached dedicated GPU node, ya aath-GPU rack server), phir <b>network</b>. Training clusters ko lossless, high-speed east-west fabric chahiye, aam taur par 200 ya 400 Gbps NICs aur PFC tatha ECN ke saath RoCEv2, jaisa network modules mein hai. Storage ko GPUs ko tez feed karna hai, isliye sirf capacity nahi, throughput bhi check karo.</p>

<h3>Options aur trade-offs</h3>
<table class="cmp"><tr><th>Need</th><th>Option</th><th>Pros</th><th>Cons</th></tr>
<tr><td>Portal</td><td>HX standard cluster</td><td>Ek team, simple scaling</td><td>Compute-only nodes ke bina storage aur compute saath scale hote hain</td></tr>
<tr><td>Portal</td><td>Blades plus SAN</td><td>Independent scaling, existing skills</td><td>Do teams aur zyada parts</td></tr>
<tr><td>Clinics</td><td>HX Edge, cloud witness ke saath 2 nodes</td><td>FIs nahi, chhota, remote managed</td><td>Limited scale; witness ko connectivity chahiye</td></tr>
<tr><td>Research</td><td>High-density row mein 400G fabric par 8-GPU server</td><td>Model training speed poori</td><td>Facility upgrade chahiye</td></tr>
</table>
<div class="eg"><p><b>Chosen design.</b> Portal: Intersight se managed UCS domain ke peeche chhe converged nodes ka HX standard cluster, RF3. Clinics: central managed do-node HX Edge clusters. Research: zaroori power aur cooling wali facility row mein GPU server; agar 12 kW budget hi limit ho to ek server se shuru karo aur facility plan publish karo.</p></div>

<div class="warn"><p><b>Post-mortem: witness khone wala clinic.</b> Network change ke dauraan ek clinic ke 2-node cluster ka witness se link toot gaya aur ek node serving band kar gaya. Dono nodes theek the, lekin quorum ko witness chahiye tha. Fix: witness reachability monitor karo aur use cluster ka hissa maano.</p></div>
<div class="exam"><p><b>Exam trap.</b> Form site se choose karo: data center cluster ke liye FIs aur UCS domain, edge ke liye FIs nahi, stretched clusters ke liye teesri jagah witness. Compute-only nodes ko capacity provider mat maano. Naye build ke liye koi platform recommend karne se pehle vendor announcements mein uska current lifecycle status check karo.</p></div>

<div class="scn"><h4>GPU server jo fit nahi hua</h4><p>Research server aaya aur 12 kW row ka breaker trip ho gaya kyunki ek rack mein aise do servers plan the. Facilities team ne peak draw naapa to ek server hi limit nikla. Group high-density row mein gaya aur storage kahin aur rakha.</p><p><b>Seekh:</b> purchase order se pehle power aur cooling ka hisaab karo.</p></div>
<div class="iv"><p class="q">"SAN ke saath blades ke bajay HCI kab choose karoge?"</p><p>Strong answer: jab team chhoti ho, workloads uniform hon, aur tez simple scale-out matter kare, khaaskar edge par, tab HCI. Jab compute aur storage ko alag scale karna ho, shared arrays pehle se hon, ya workloads ko aise features chahiye jo HCI nahi deta, tab SAN ke saath blades.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HCI local disks ko software se pool karta hai; RF2 aur RF3 capacity ke badle resilience dete hain.</li>
<li>Standard, edge aur stretched clusters alag sites ke liye hain; stretched ko witness aur low latency chahiye.</li>
<li>Virtualization N+1 ke liye size karo aur pehle memory check karo.</li>
<li>Kubernetes design failure domains, pod networking aur persistent storage ke baare mein hai.</li>
<li>GPU design power aur cooling se shuru hota hai, phir PCIe, phir network.</li>
</ul></div>
`}};export{n as default};