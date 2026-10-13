var e={id:`big-picture`,h:{en:`The big picture: one box, many computers`,hi:`Big picture: ek box, kai computers`},body:{en:`
<p>Think of a big apartment building. The land, the foundation, the water tank and the electricity connection are shared. Inside, every family has its own flat with its own lock, its own kitchen and its own address. Nobody needs to buy a separate plot of land to live in the city. <b>Virtualization</b> does the same thing for computers and networks: one physical box (the building) is carved into many independent, isolated units (the flats), each of which behaves as if it owned the whole thing.</p>

<h3>What you will learn</h3>
<ul>
<li>Why companies virtualize servers, and what a <b>virtual machine (VM)</b> is actually made of.</li>
<li>The difference between <b>type-1</b> (bare-metal) and <b>type-2</b> (hosted) hypervisors.</li>
<li>How a <b>virtual switch</b>, <b>port groups</b> and <b>802.1Q VLAN tagging</b> connect VMs to the physical network, and how to configure the physical switch and router for them.</li>
<li><b>NIC teaming</b> for redundancy and the idea of <b>live migration (vMotion)</b>.</li>
<li><b>Containers</b>, how they differ from VMs, basic container networking, and <b>Kubernetes</b> at concept level.</li>
<li><b>Cloud computing</b>: the five NIST characteristics, IaaS / PaaS / SaaS, and public, private, hybrid and community clouds.</li>
<li>How an enterprise connects to the cloud: <b>internet VPN</b>, <b>private WAN</b> and <b>intercloud exchange</b>, plus <b>network functions virtualization (NFV)</b>.</li>
<li><b>VRFs</b>, the network version of virtualization, with VRF-lite configuration and verification on Cisco IOS.</li>
<li>A repeatable workflow to troubleshoot <b>a VM that has no network</b>.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should be comfortable with the earlier modules of this track: what a switch and a router do, MAC and IP addresses, IPv4 subnetting and the basic IOS CLI (user, privileged and configuration modes). You do <b>not</b> need to be a VLAN expert yet. VLANs and trunks get their own module later in the Switching domain; here you will learn just enough of them to connect virtual machines, and we will point forward when a topic goes deeper.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Layers of virtualization">
<rect x="40" y="220" width="560" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="243" text-anchor="middle" class="svg-ink" font-size="13">Physical server: CPU, RAM, disks, NICs</text>
<rect x="40" y="172" width="560" height="36" rx="8" fill="#bae6fd"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">Hypervisor + virtual switch</text>
<rect x="40" y="40" width="170" height="120" rx="8" fill="#bbf7d0"/><text x="125" y="70" text-anchor="middle" class="svg-ink" font-size="13">VM: WEB</text><text x="125" y="92" text-anchor="middle" class="svg-muted" font-size="12">Linux + app</text><text x="125" y="112" text-anchor="middle" class="svg-muted" font-size="12">vNIC, VLAN 10</text>
<rect x="235" y="40" width="170" height="120" rx="8" fill="#bbf7d0"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">VM: DB</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">Linux + database</text><text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="12">vNIC, VLAN 20</text>
<rect x="430" y="40" width="170" height="120" rx="8" fill="#fde68a"/><text x="515" y="70" text-anchor="middle" class="svg-ink" font-size="13">Container host VM</text><text x="515" y="92" text-anchor="middle" class="svg-muted" font-size="12">many containers</text><text x="515" y="112" text-anchor="middle" class="svg-muted" font-size="12">one shared kernel</text>
<text x="320" y="24" text-anchor="middle" class="svg-accent" font-size="13">many isolated workloads on one box</text>
</svg><p class="cap">The layers you will meet in this module: hardware, hypervisor with its virtual switch, VMs, and containers running inside a VM.</p></div>

<h3>Why a network engineer must care</h3>
<p>Ten years ago a server had one network cable and one IP address, and the network team could stop thinking at the switch port. Today the first "switch" a workload talks to is usually <b>software inside the server</b>. One physical switch port may carry fifty MAC addresses in six VLANs. A VM can move from one rack to another while it is running, and its MAC address suddenly appears on a different switch port. A developer may start two hundred containers in a minute. Half of the company's applications may live in a public cloud reached over an IPsec tunnel. If you do not understand these layers, you will spend hours looking at a perfectly healthy switch while the fault sits in a port group setting one layer above.</p>

<h3>The two labs of this module</h3>
<p>You will practise on a simulated bare-metal hypervisor. It uses a small, self-explaining shell (for example <code>vswitch show</code> and <code>vm list</code>) that behaves like the real products, and each chapter shows the equivalent idea in VMware vSphere, the most common platform in enterprises.</p>
<table class="cmp"><tr><th>Lab</th><th>Devices</th><th>What you do</th></tr>
<tr><td>Connect VMs through a virtual switch</td><td>R1, SW1, HV1, VMs WEB (10.10.10.11, VLAN 10) and DB (10.20.20.12, VLAN 20)</td><td>Create port groups PG-Web and PG-DB, move the VMs, make SW1 Gi0/0 and Gi0/1 trunks, build router-on-a-stick on R1.</td></tr>
<tr><td>The VM that lost its network</td><td>R1, SW1, HV2, VMs WEB and APP (10.20.20.30, VLAN 20)</td><td>Find three faults: wrong port-group VLAN, a missing VLAN on the trunk, and a broken uplink team.</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A small company has 20 physical servers, each using on average 8% of its CPU and 20 GB of its 64 GB RAM. Total real demand is about 20 x 0.08 = 1.6 servers' worth of CPU and 400 GB of RAM. Two modern hosts with 256 GB RAM each (512 GB total) can carry all 20 workloads as VMs, and a third host gives room for failure. Twenty servers become three: roughly 85% fewer boxes, cables, switch ports and power supplies to maintain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking virtualization is "a server team topic". The VLAN, trunk, MTU, MAC learning and redundancy decisions made on the hypervisor directly decide whether traffic reaches your switch correctly.</p></div>

<div class="exam"><p><b>Exam trap.</b> The CCNA blueprint groups server virtualization, containers and VRFs together as "virtualization fundamentals". Expect questions that mix them, for example "which one shares the host kernel?" (containers) or "which one gives a router several routing tables?" (VRFs).</p></div>

<div class="scn"><h4>The switch that was "fine"</h4><p>A helpdesk ticket said a new billing server could not reach its database. The network engineer checked the access switch: port up, no errors, trunk forwarding, and he closed the ticket as "not network". Two days later the server team found that the VM was attached to a port group tagged VLAN 21 instead of 20, so its frames entered the wrong VLAN inside the host. The physical switch really was fine; the fault was one layer above it.</p><p><b>Lesson:</b> the network now starts inside the server. Always ask which port group and VLAN the VM uses before you declare the network healthy.</p></div>

<div class="iv"><p class="q">"Why should a network engineer understand server virtualization?"</p><p>Say that the access layer has moved into the host: VMs connect to a virtual switch, which tags VLANs on uplinks that must be trunks on the physical switch. Mention MAC mobility with live migration, NIC teaming that must match the switch configuration, and that cloud and containers add more virtual networks. Close with an example of a fault that lives in the hypervisor, not the switch.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Virtualization carves one physical resource into many isolated logical ones: servers into VMs, operating systems into containers, routers into VRFs.</li>
<li>The first switch a VM sees is a virtual switch inside the host.</li>
<li>This module covers VMs, hypervisors, virtual switching, containers, Kubernetes, cloud models and connectivity, NFV and VRFs.</li>
<li>Two labs: building VLAN-tagged port groups end to end, and troubleshooting a VM that lost its network.</li>
<li>VLANs and trunks are covered in depth in a later module; here you learn just what virtual networking needs.</li>
</ul></div>
`,hi:`
<p>Ek badi apartment building socho. Zameen, foundation, paani ki tanki aur bijli ka connection sab share hote hain. Andar har family ka apna flat hai, apna lock, apni kitchen aur apna address. Shehar mein rehne ke liye kisi ko alag plot khareedna nahi padta. <b>Virtualization</b> computers aur networks ke liye yahi karta hai: ek physical box (building) ko kai independent, isolated units (flats) mein baant diya jaata hai, aur har unit aise behave karti hai jaise poora box usi ka ho.</p>

<h3>Aap kya seekhoge</h3>
<ul>
<li>Companies servers ko virtualize kyun karti hain, aur ek <b>virtual machine (VM)</b> asal mein kis cheez se bani hoti hai.</li>
<li><b>Type-1</b> (bare-metal) aur <b>type-2</b> (hosted) hypervisors ka fark.</li>
<li>Ek <b>virtual switch</b>, <b>port groups</b> aur <b>802.1Q VLAN tagging</b> VMs ko physical network se kaise jodte hain, aur unke liye physical switch aur router kaise configure karte hain.</li>
<li>Redundancy ke liye <b>NIC teaming</b> aur <b>live migration (vMotion)</b> ka idea.</li>
<li><b>Containers</b>, woh VMs se kaise alag hain, basic container networking, aur concept level par <b>Kubernetes</b>.</li>
<li><b>Cloud computing</b>: paanch NIST characteristics, IaaS / PaaS / SaaS, aur public, private, hybrid aur community clouds.</li>
<li>Enterprise cloud se kaise judta hai: <b>internet VPN</b>, <b>private WAN</b> aur <b>intercloud exchange</b>, saath mein <b>network functions virtualization (NFV)</b>.</li>
<li><b>VRFs</b>, virtualization ka network wala roop, Cisco IOS par VRF-lite configuration aur verification ke saath.</li>
<li><b>Bina network wali VM</b> ko troubleshoot karne ka repeatable workflow.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapko is track ke pehle modules comfortable hone chahiye: switch aur router kya karte hain, MAC aur IP addresses, IPv4 subnetting aur basic IOS CLI (user, privileged aur configuration modes). Abhi aapko VLAN expert hone ki zaroorat <b>nahi</b> hai. VLANs aur trunks ka apna module baad mein Switching domain mein aata hai; yahan aap unka utna hi seekhoge jitna virtual machines ko jodne ke liye chahiye, aur jahan topic gehra jaata hai wahan hum aage ka reference denge.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Virtualization ki layers">
<rect x="40" y="220" width="560" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="243" text-anchor="middle" class="svg-ink" font-size="13">Physical server: CPU, RAM, disks, NICs</text>
<rect x="40" y="172" width="560" height="36" rx="8" fill="#bae6fd"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">Hypervisor + virtual switch</text>
<rect x="40" y="40" width="170" height="120" rx="8" fill="#bbf7d0"/><text x="125" y="70" text-anchor="middle" class="svg-ink" font-size="13">VM: WEB</text><text x="125" y="92" text-anchor="middle" class="svg-muted" font-size="12">Linux + app</text><text x="125" y="112" text-anchor="middle" class="svg-muted" font-size="12">vNIC, VLAN 10</text>
<rect x="235" y="40" width="170" height="120" rx="8" fill="#bbf7d0"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">VM: DB</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">Linux + database</text><text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="12">vNIC, VLAN 20</text>
<rect x="430" y="40" width="170" height="120" rx="8" fill="#fde68a"/><text x="515" y="70" text-anchor="middle" class="svg-ink" font-size="13">Container host VM</text><text x="515" y="92" text-anchor="middle" class="svg-muted" font-size="12">kai containers</text><text x="515" y="112" text-anchor="middle" class="svg-muted" font-size="12">ek shared kernel</text>
<text x="320" y="24" text-anchor="middle" class="svg-accent" font-size="13">ek box par kai isolated workloads</text>
</svg><p class="cap">Is module mein milne wali layers: hardware, virtual switch ke saath hypervisor, VMs, aur ek VM ke andar chalte containers.</p></div>

<h3>Network engineer ko kyun parwaah karni chahiye</h3>
<p>Das saal pehle server ka ek network cable aur ek IP address hota tha, aur network team switch port par sochna band kar sakti thi. Aaj workload jis pehle "switch" se baat karta hai woh aam taur par <b>server ke andar ka software</b> hota hai. Ek physical switch port chhe VLANs mein pachaas MAC addresses carry kar sakta hai. Ek VM chalte chalte ek rack se doosre rack mein move ho sakti hai, aur uska MAC address achanak doosre switch port par dikhne lagta hai. Ek developer ek minute mein do sau containers start kar sakta hai. Company ki aadhi applications IPsec tunnel ke through public cloud mein ho sakti hain. Agar aap in layers ko nahi samjhoge, to ghanton ek bilkul healthy switch dekhte rahoge jabki fault ek layer upar port group setting mein baitha hai.</p>

<h3>Is module ke do labs</h3>
<p>Aap ek simulated bare-metal hypervisor par practice karoge. Ismein ek chhota, khud samjhaane wala shell hai (jaise <code>vswitch show</code> aur <code>vm list</code>) jo asli products ki tarah behave karta hai, aur har chapter VMware vSphere mein same idea dikhata hai, jo enterprises mein sabse common platform hai.</p>
<table class="cmp"><tr><th>Lab</th><th>Devices</th><th>Aap kya karte ho</th></tr>
<tr><td>Virtual switch se VMs connect karo</td><td>R1, SW1, HV1, VMs WEB (10.10.10.11, VLAN 10) aur DB (10.20.20.12, VLAN 20)</td><td>Port groups PG-Web aur PG-DB banao, VMs move karo, SW1 Gi0/0 aur Gi0/1 ko trunks banao, R1 par router-on-a-stick banao.</td></tr>
<tr><td>Jis VM ka network gayab ho gaya</td><td>R1, SW1, HV2, VMs WEB aur APP (10.20.20.30, VLAN 20)</td><td>Teen faults dhoondho: galat port-group VLAN, trunk par missing VLAN, aur toota hua uplink team.</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ek chhoti company ke paas 20 physical servers hain, har ek average 8% CPU aur apni 64 GB RAM mein se 20 GB use karta hai. Total asli demand lagbhag 20 x 0.08 = 1.6 servers jitna CPU aur 400 GB RAM hai. 256 GB RAM wale do modern hosts (total 512 GB) saare 20 workloads ko VMs ki tarah chala sakte hain, aur teesra host failure ke liye jagah deta hai. Bees servers teen ban jaate hain: maintain karne ke liye lagbhag 85% kam boxes, cables, switch ports aur power supplies.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki virtualization "server team ka topic" hai. Hypervisor par liye gaye VLAN, trunk, MTU, MAC learning aur redundancy decisions seedha decide karte hain ki traffic aapke switch tak sahi pahunchega ya nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> CCNA blueprint server virtualization, containers aur VRFs ko "virtualization fundamentals" ke under saath rakhta hai. Aise questions expect karo jo inhe mix karein, jaise "kaun host kernel share karta hai?" (containers) ya "kaun router ko kai routing tables deta hai?" (VRFs).</p></div>

<div class="scn"><h4>Woh switch jo "theek" tha</h4><p>Helpdesk ticket mein likha tha ki naya billing server apne database tak nahi pahunch pa raha. Network engineer ne access switch check kiya: port up, koi errors nahi, trunk forwarding, aur usne ticket "network issue nahi" likh kar band kar diya. Do din baad server team ne paaya ki VM VLAN 20 ki jagah VLAN 21 tag karne wale port group se judi thi, isliye uske frames host ke andar hi galat VLAN mein jaa rahe the. Physical switch sach mein theek tha; fault usse ek layer upar tha.</p><p><b>Seekh:</b> network ab server ke andar se shuru hota hai. Network ko healthy declare karne se pehle hamesha poochho ki VM kaunsa port group aur VLAN use kar rahi hai.</p></div>

<div class="iv"><p class="q">"Network engineer ko server virtualization kyun samajhna chahiye?"</p><p>Bolo ki access layer host ke andar aa gayi hai: VMs virtual switch se judti hain, jo uplinks par VLANs tag karta hai, aur woh uplinks physical switch par trunks hone chahiye. Live migration ke saath MAC mobility, switch configuration se match karne wali NIC teaming, aur yeh ki cloud aur containers aur virtual networks jodte hain, yeh mention karo. Ek aise fault ke example se khatam karo jo switch mein nahi, hypervisor mein tha.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Virtualization ek physical resource ko kai isolated logical resources mein baant deta hai: servers ko VMs mein, operating systems ko containers mein, routers ko VRFs mein.</li>
<li>VM jo pehla switch dekhti hai woh host ke andar ka virtual switch hai.</li>
<li>Yeh module VMs, hypervisors, virtual switching, containers, Kubernetes, cloud models aur connectivity, NFV aur VRFs cover karta hai.</li>
<li>Do labs: VLAN-tagged port groups end to end banana, aur network kho chuki VM ko troubleshoot karna.</li>
<li>VLANs aur trunks baad ke module mein detail mein aate hain; yahan aap sirf utna seekhte ho jitna virtual networking ko chahiye.</li>
</ul></div>
`}};export{e as default};