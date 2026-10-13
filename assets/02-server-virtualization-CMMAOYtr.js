var e={id:`server-virtualization`,h:{en:`Server virtualization and what a VM is made of`,hi:`Server virtualization aur VM kis cheez se bani hoti hai`},body:{en:`
<p>Before hotels, a traveller rented a whole house for one night: expensive, mostly empty, and slow to arrange. A hotel builds one large building and sells rooms by the night. Each guest gets a key, a bed and a bathroom, but shares the lift, kitchen and staff. A classic data center was the "whole house" model: <b>one operating system per physical server</b>. Server virtualization is the hotel.</p>

<h3>The problem with one server per application</h3>
<p>For years every new application got a new physical server, because mixing applications on one OS caused conflicts: two apps needing different library versions, one app crashing and taking the other down, one team's patch breaking another team's service. The result was <b>server sprawl</b>:</p>
<ul>
<li>Most servers ran at 5 to 15% CPU, yet each needed rack space, two power supplies, cooling, cables and switch ports.</li>
<li>A new server took weeks: purchase order, delivery, racking, cabling, OS install.</li>
<li>Hardware failure meant restoring the whole OS onto a new box, often by hand.</li>
</ul>

<h3>The solution: a hypervisor</h3>
<p>A <b>hypervisor</b> (also called a virtual machine monitor) is software that sits between the hardware and the operating systems. It divides CPU time, memory, storage and network access among many <b>virtual machines</b>, and keeps them isolated from each other. The physical server is now called the <b>host</b>; each VM is a <b>guest</b>. The guest OS runs unchanged and believes it owns real hardware.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Before and after virtualization">
<text x="150" y="22" text-anchor="middle" class="svg-accent" font-size="13">Before: 3 servers</text>
<rect x="30" y="40" width="70" height="90" rx="6" fill="#e2e8f0"/><text x="65" y="80" text-anchor="middle" class="svg-ink" font-size="12">OS+App</text><text x="65" y="100" text-anchor="middle" class="svg-muted" font-size="12">8% CPU</text>
<rect x="115" y="40" width="70" height="90" rx="6" fill="#e2e8f0"/><text x="150" y="80" text-anchor="middle" class="svg-ink" font-size="12">OS+App</text><text x="150" y="100" text-anchor="middle" class="svg-muted" font-size="12">6% CPU</text>
<rect x="200" y="40" width="70" height="90" rx="6" fill="#e2e8f0"/><text x="235" y="80" text-anchor="middle" class="svg-ink" font-size="12">OS+App</text><text x="235" y="100" text-anchor="middle" class="svg-muted" font-size="12">11% CPU</text>
<text x="150" y="160" text-anchor="middle" class="svg-muted" font-size="12">3 boxes, 6 PSUs, 6 switch ports</text>
<text x="470" y="22" text-anchor="middle" class="svg-accent" font-size="13">After: 1 host</text>
<rect x="360" y="40" width="70" height="60" rx="6" fill="#bbf7d0"/><text x="395" y="75" text-anchor="middle" class="svg-ink" font-size="12">VM1</text>
<rect x="435" y="40" width="70" height="60" rx="6" fill="#bbf7d0"/><text x="470" y="75" text-anchor="middle" class="svg-ink" font-size="12">VM2</text>
<rect x="510" y="40" width="70" height="60" rx="6" fill="#bbf7d0"/><text x="545" y="75" text-anchor="middle" class="svg-ink" font-size="12">VM3</text>
<rect x="360" y="108" width="220" height="26" rx="6" fill="#bae6fd"/><text x="470" y="126" text-anchor="middle" class="svg-ink" font-size="12">hypervisor</text>
<rect x="360" y="140" width="220" height="26" rx="6" fill="#e2e8f0"/><text x="470" y="158" text-anchor="middle" class="svg-ink" font-size="12">one server, 25% CPU</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">same workloads, a third of the hardware</text>
</svg><p class="cap">Consolidation: three lightly used servers become three VMs on one host.</p></div>

<h3>What a VM is made of</h3>
<p>A VM is a complete computer defined in <b>files</b> and presented by the hypervisor as virtual hardware:</p>
<dl class="terms">
<dt>vCPU</dt><dd>A share of physical CPU cores. The hypervisor schedules vCPUs on real cores; hosts usually run more vCPUs than they have cores (overcommit), because VMs are rarely busy at the same moment.</dd>
<dt>Virtual memory (vRAM)</dt><dd>RAM assigned to the VM from the host's physical memory.</dd>
<dt>Virtual disk</dt><dd>A file on local or shared storage (for example a VMDK file in VMware, VHDX in Hyper-V, qcow2 in KVM) that the guest sees as a normal hard disk.</dd>
<dt>vNIC</dt><dd>A virtual network interface card. Each vNIC has its <b>own MAC address</b> and connects to a port on the virtual switch. VMware's automatically generated MACs start with <code>00:50:56</code> or <code>00:0c:29</code>, Hyper-V's with <code>00:15:5d</code>, KVM's usually with <code>52:54:00</code>. Seeing these OUIs in a switch MAC table tells you "this is a VM".</dd>
<dt>Configuration file</dt><dd>A small file (for example the VMX file) describing the VM: how many vCPUs, how much RAM, which disks and which network each vNIC connects to.</dd>
</dl>

<h3>Benefits you should be able to list</h3>
<ul>
<li><b>Consolidation</b>: fewer physical servers, less power, cooling, space and cabling.</li>
<li><b>Fast provisioning</b>: clone a <b>template</b> and have a new server in minutes.</li>
<li><b>Isolation</b>: a crash or compromise in one VM does not affect the others.</li>
<li><b>Snapshots</b>: save the state before a risky change and roll back in seconds.</li>
<li><b>Mobility and availability</b>: because a VM is files, it can be <b>live-migrated</b> to another host or restarted on a surviving host after a failure (chapter 5).</li>
<li><b>Hardware independence</b>: the guest sees standard virtual hardware, so it runs on any host of the cluster.</li>
</ul>

<p>In the lab, the hypervisor HV1 lists its VMs like this. Notice that each VM has a vNIC (a virtual port), a port group, a VLAN and its own MAC address:</p>
<pre class="out">HV1:~# vm list
Name        State        vNIC     Port group        VLAN  MAC address        IPv4 address
<span class="hl">DB          Powered off  vport2   VM-Network        0     52:54:00:3a:7c:12  10.20.20.12/24</span>
WEB         Powered on   vport1   VM-Network        0     52:54:00:3a:7c:11  10.10.10.11/24</pre>
<p>Both VMs still sit on the default untagged port group <code>VM-Network</code>, and DB is powered off. You will fix both in chapter 4.</p>

<div class="eg"><p><b>Worked example.</b> A host has 2 sockets x 16 cores = 32 cores and 256 GB RAM. You plan VMs of 4 vCPU and 16 GB each. RAM allows 256 / 16 = 16 VMs, minus about 16 GB for the hypervisor, so 15 VMs. Those 15 VMs need 60 vCPUs on 32 cores, a 1.9:1 overcommit ratio, which is normal for general server workloads. RAM, not CPU, is usually the first limit.</p></div>

<div class="warn"><p><b>Common mistake.</b> Assuming a VM has no MAC address "because it is virtual". Every vNIC has a unique MAC, and the physical switch learns it on the port toward the host. Two cloned VMs with the same manually set MAC cause exactly the flapping and loss you would see with two physical PCs.</p></div>

<div class="exam"><p><b>Exam trap.</b> A VM contains a <b>full guest operating system</b>; a container does not. If an answer says "each instance runs its own OS kernel", it describes VMs.</p></div>

<div class="scn"><h4>The cloned MAC</h4><p>An engineer cloned a Linux VM by copying its files instead of using the clone wizard. Both VMs kept the same MAC address. Users saw intermittent loss to both servers, and the access switch logged <code>%SW_MATM-4-MACFLAP_NOTIF</code> messages for one MAC moving between two ports. Regenerating the MAC on the copy stopped the flapping.</p><p><b>Lesson:</b> VMs are real Layer 2 citizens. Duplicate MACs and duplicate IPs break the network exactly as with physical hosts.</p></div>

<div class="iv"><p class="q">"What is a virtual machine, and what are its components?"</p><p>A VM is a software-defined computer running a full guest OS on virtual hardware presented by a hypervisor. List vCPU, vRAM, virtual disk files, one or more vNICs with their own MAC addresses, and a configuration file. Add one benefit with a number (for example "20 servers consolidated onto 3 hosts") and mention isolation and snapshots.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Server virtualization runs many isolated VMs on one physical host through a hypervisor.</li>
<li>A VM is files plus virtual hardware: vCPU, vRAM, virtual disk, vNIC and a config file.</li>
<li>Every vNIC has its own MAC; VM MAC OUIs such as 00:50:56 or 52:54:00 reveal virtual machines in a MAC table.</li>
<li>Benefits: consolidation, fast provisioning, isolation, snapshots, mobility and hardware independence.</li>
<li>Each VM runs a full guest OS; that is the key difference from containers.</li>
</ul></div>
`,hi:`
<p>Hotels se pehle, ek traveller ek raat ke liye poora ghar kiraye par leta tha: mehenga, zyada tar khaali, aur arrange karne mein dheema. Hotel ek badi building banata hai aur rooms raat ke hisaab se bechta hai. Har guest ko chaabi, bed aur bathroom milta hai, par lift, kitchen aur staff share hote hain. Classic data center "poora ghar" model tha: <b>har physical server par ek operating system</b>. Server virtualization hotel hai.</p>

<h3>Har application ke liye ek server ki problem</h3>
<p>Saalon tak har nayi application ko naya physical server milta tha, kyunki ek OS par applications mix karne se conflicts hote the: do apps ko alag library versions chahiye, ek app crash hokar doosre ko bhi gira de, ek team ka patch doosri team ki service tod de. Nateeja tha <b>server sprawl</b>:</p>
<ul>
<li>Zyada tar servers 5 se 15% CPU par chalte the, phir bhi har ek ko rack space, do power supplies, cooling, cables aur switch ports chahiye the.</li>
<li>Naya server lagne mein hafte lagte the: purchase order, delivery, racking, cabling, OS install.</li>
<li>Hardware failure ka matlab tha poora OS naye box par restore karna, aksar haath se.</li>
</ul>

<h3>Solution: hypervisor</h3>
<p><b>Hypervisor</b> (jise virtual machine monitor bhi kehte hain) ek software hai jo hardware aur operating systems ke beech baithta hai. Yeh CPU time, memory, storage aur network access ko kai <b>virtual machines</b> mein baantta hai, aur unhe ek doosre se isolated rakhta hai. Physical server ko ab <b>host</b> kehte hain; har VM ek <b>guest</b> hai. Guest OS bina badlaav ke chalta hai aur maanta hai ki asli hardware uska hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Virtualization se pehle aur baad">
<text x="150" y="22" text-anchor="middle" class="svg-accent" font-size="13">Pehle: 3 servers</text>
<rect x="30" y="40" width="70" height="90" rx="6" fill="#e2e8f0"/><text x="65" y="80" text-anchor="middle" class="svg-ink" font-size="12">OS+App</text><text x="65" y="100" text-anchor="middle" class="svg-muted" font-size="12">8% CPU</text>
<rect x="115" y="40" width="70" height="90" rx="6" fill="#e2e8f0"/><text x="150" y="80" text-anchor="middle" class="svg-ink" font-size="12">OS+App</text><text x="150" y="100" text-anchor="middle" class="svg-muted" font-size="12">6% CPU</text>
<rect x="200" y="40" width="70" height="90" rx="6" fill="#e2e8f0"/><text x="235" y="80" text-anchor="middle" class="svg-ink" font-size="12">OS+App</text><text x="235" y="100" text-anchor="middle" class="svg-muted" font-size="12">11% CPU</text>
<text x="150" y="160" text-anchor="middle" class="svg-muted" font-size="12">3 boxes, 6 PSUs, 6 switch ports</text>
<text x="470" y="22" text-anchor="middle" class="svg-accent" font-size="13">Baad mein: 1 host</text>
<rect x="360" y="40" width="70" height="60" rx="6" fill="#bbf7d0"/><text x="395" y="75" text-anchor="middle" class="svg-ink" font-size="12">VM1</text>
<rect x="435" y="40" width="70" height="60" rx="6" fill="#bbf7d0"/><text x="470" y="75" text-anchor="middle" class="svg-ink" font-size="12">VM2</text>
<rect x="510" y="40" width="70" height="60" rx="6" fill="#bbf7d0"/><text x="545" y="75" text-anchor="middle" class="svg-ink" font-size="12">VM3</text>
<rect x="360" y="108" width="220" height="26" rx="6" fill="#bae6fd"/><text x="470" y="126" text-anchor="middle" class="svg-ink" font-size="12">hypervisor</text>
<rect x="360" y="140" width="220" height="26" rx="6" fill="#e2e8f0"/><text x="470" y="158" text-anchor="middle" class="svg-ink" font-size="12">ek server, 25% CPU</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">wahi workloads, ek tihai hardware</text>
</svg><p class="cap">Consolidation: teen kam use hone wale servers ek host par teen VMs ban jaate hain.</p></div>

<h3>VM kis cheez se bani hoti hai</h3>
<p>VM <b>files</b> mein define kiya gaya ek poora computer hai, jise hypervisor virtual hardware ki tarah present karta hai:</p>
<dl class="terms">
<dt>vCPU</dt><dd>Physical CPU cores ka ek hissa. Hypervisor vCPUs ko asli cores par schedule karta hai; hosts aam taur par cores se zyada vCPUs chalate hain (overcommit), kyunki VMs shayad hi ek hi pal mein busy hoti hain.</dd>
<dt>Virtual memory (vRAM)</dt><dd>Host ki physical memory se VM ko di gayi RAM.</dd>
<dt>Virtual disk</dt><dd>Local ya shared storage par ek file (jaise VMware mein VMDK file, Hyper-V mein VHDX, KVM mein qcow2) jise guest normal hard disk ki tarah dekhta hai.</dd>
<dt>vNIC</dt><dd>Virtual network interface card. Har vNIC ka <b>apna MAC address</b> hota hai aur woh virtual switch ke ek port se judta hai. VMware ke automatically bane MACs <code>00:50:56</code> ya <code>00:0c:29</code> se shuru hote hain, Hyper-V ke <code>00:15:5d</code> se, KVM ke aam taur par <code>52:54:00</code> se. Switch MAC table mein yeh OUIs dikhna batata hai ki "yeh VM hai".</dd>
<dt>Configuration file</dt><dd>Ek chhoti file (jaise VMX file) jo VM ko describe karti hai: kitne vCPUs, kitni RAM, kaunse disks aur har vNIC kis network se judta hai.</dd>
</dl>

<h3>Fayde jo aapko list karne aane chahiye</h3>
<ul>
<li><b>Consolidation</b>: kam physical servers, kam power, cooling, space aur cabling.</li>
<li><b>Fast provisioning</b>: ek <b>template</b> clone karo aur minutes mein naya server tayyar.</li>
<li><b>Isolation</b>: ek VM ka crash ya compromise baaki VMs par asar nahi karta.</li>
<li><b>Snapshots</b>: risky change se pehle state save karo aur seconds mein roll back karo.</li>
<li><b>Mobility aur availability</b>: kyunki VM files hai, use doosre host par <b>live-migrate</b> kiya ja sakta hai ya failure ke baad bache hue host par restart kiya ja sakta hai (chapter 5).</li>
<li><b>Hardware independence</b>: guest standard virtual hardware dekhta hai, isliye cluster ke kisi bhi host par chal jaata hai.</li>
</ul>

<p>Lab mein hypervisor HV1 apni VMs aise list karta hai. Dekho ki har VM ka ek vNIC (virtual port), ek port group, ek VLAN aur apna MAC address hai:</p>
<pre class="out">HV1:~# vm list
Name        State        vNIC     Port group        VLAN  MAC address        IPv4 address
<span class="hl">DB          Powered off  vport2   VM-Network        0     52:54:00:3a:7c:12  10.20.20.12/24</span>
WEB         Powered on   vport1   VM-Network        0     52:54:00:3a:7c:11  10.10.10.11/24</pre>
<p>Dono VMs abhi default untagged port group <code>VM-Network</code> par hain, aur DB powered off hai. Aap dono cheezein chapter 4 mein theek karoge.</p>

<div class="eg"><p><b>Worked example.</b> Ek host mein 2 sockets x 16 cores = 32 cores aur 256 GB RAM hai. Aap 4 vCPU aur 16 GB wali VMs plan karte ho. RAM 256 / 16 = 16 VMs allow karti hai, hypervisor ke liye lagbhag 16 GB ghatao, to 15 VMs. Un 15 VMs ko 32 cores par 60 vCPUs chahiye, yaani 1.9:1 overcommit ratio, jo general server workloads ke liye normal hai. Aam taur par pehli limit CPU nahi, RAM hoti hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh maan lena ki VM ka MAC address nahi hota "kyunki woh virtual hai". Har vNIC ka unique MAC hota hai, aur physical switch use host ki taraf wale port par learn karta hai. Same manually set MAC wali do cloned VMs bilkul wahi flapping aur loss karti hain jo do physical PCs karte.</p></div>

<div class="exam"><p><b>Exam trap.</b> VM mein <b>poora guest operating system</b> hota hai; container mein nahi. Agar answer kehta hai "har instance apna OS kernel chalata hai", to woh VMs ki baat kar raha hai.</p></div>

<div class="scn"><h4>Clone kiya hua MAC</h4><p>Ek engineer ne clone wizard use karne ki jagah files copy karke Linux VM clone ki. Dono VMs ne same MAC address rakha. Users ko dono servers tak beech beech mein loss dikha, aur access switch ne ek MAC ke do ports ke beech move hone ke <code>%SW_MATM-4-MACFLAP_NOTIF</code> messages log kiye. Copy par MAC regenerate karne se flapping ruk gayi.</p><p><b>Seekh:</b> VMs asli Layer 2 citizens hain. Duplicate MACs aur duplicate IPs network ko bilkul physical hosts ki tarah todte hain.</p></div>

<div class="iv"><p class="q">"Virtual machine kya hai, aur uske components kya hain?"</p><p>VM ek software-defined computer hai jo hypervisor ke present kiye virtual hardware par poora guest OS chalata hai. vCPU, vRAM, virtual disk files, apne MAC addresses wale ek ya zyada vNICs, aur ek configuration file list karo. Ek number ke saath ek fayda jodo (jaise "20 servers 3 hosts par consolidate kiye") aur isolation aur snapshots mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Server virtualization hypervisor ke through ek physical host par kai isolated VMs chalata hai.</li>
<li>VM files plus virtual hardware hai: vCPU, vRAM, virtual disk, vNIC aur config file.</li>
<li>Har vNIC ka apna MAC hota hai; 00:50:56 ya 52:54:00 jaise VM MAC OUIs MAC table mein virtual machines ko pehchaan dete hain.</li>
<li>Fayde: consolidation, fast provisioning, isolation, snapshots, mobility aur hardware independence.</li>
<li>Har VM poora guest OS chalati hai; containers se yahi sabse bada fark hai.</li>
</ul></div>
`}};export{e as default};