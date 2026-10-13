var e={id:`virtualization`,h:{en:`Virtualization, virtual switches and containers`,hi:`Virtualization, virtual switches aur containers`},body:{en:`
<p>Imagine a large house split into flats. One building, one roof, one electricity connection, but many families, each with its own locked door. <b>Virtualization</b> does the same with a server: one physical machine is split into many <b>virtual machines (VMs)</b>, each believing it has its own CPU, memory, disk and network card. Almost every server you connect in a modern data center runs a hypervisor, so the "device" at the end of your switch port is often a whole small network of VMs.</p>

<h3>Hypervisors: type 1 and type 2</h3>
<p>A <b>hypervisor</b> is the software that creates and runs VMs and shares the real hardware between them.</p>
<table class="cmp"><tr><th>Type</th><th>Runs on</th><th>Examples</th><th>Used for</th></tr>
<tr><td><b>Type 1 (bare metal)</b></td><td>Directly on the server hardware</td><td>VMware ESXi, KVM (built into the Linux kernel), Microsoft Hyper-V</td><td>Production data centers</td></tr>
<tr><td><b>Type 2 (hosted)</b></td><td>As an application on a normal OS</td><td>VirtualBox, VMware Workstation</td><td>Labs and laptops</td></tr>
</table>
<p>Each VM gets <b>vCPUs</b>, virtual RAM, a virtual disk (a file such as a VMDK or qcow2 on local or shared storage) and one or more <b>vNICs</b>, each with its own MAC address. A management platform such as <b>vCenter</b> controls many ESXi hosts as a cluster.</p>

<div class="eg"><p><b>Worked example: consolidation.</b> A company has 40 old physical servers, each averaging 8% CPU and 24 GB RAM. Total demand: about 40 × 24 = 960 GB RAM. New hosts have 64 cores and 512 GB RAM each. RAM is the limit: 960 ÷ 512 ≈ 1.9, so two hosts could hold everything, but you plan <b>three</b> so the cluster survives one host failure (N+1). Forty boxes, eighty power supplies and eighty cables become three hosts and six data links.</p></div>

<h3>Virtual switches and port groups</h3>
<p>VMs inside one host need a switch to talk to each other and to the outside. That switch is software: the <b>virtual switch</b>. Its "uplinks" are the physical NICs of the host (in VMware called vmnics), which plug into your leaf switches.</p>
<ul>
<li><b>vSphere Standard Switch (vSS)</b>: configured separately on every ESXi host.</li>
<li><b>vSphere Distributed Switch (vDS)</b>: configured once in vCenter and pushed to all hosts, so every host is consistent.</li>
<li>On KVM: the <b>Linux bridge</b> or <b>Open vSwitch</b>; on Hyper-V: the <b>Hyper-V Virtual Switch</b>.</li>
</ul>
<p>A <b>port group</b> is a group of virtual ports with the same settings, most importantly the <b>VLAN ID</b>. A VM in port group "WEB-VLAN10" is placed in VLAN 10. The virtual switch adds the 802.1Q tag on the way out of the uplink. This is called <b>virtual switch tagging</b>, and it means the physical leaf port must be a <b>trunk</b> that allows every VLAN the host's port groups use.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="VMs on a virtual switch with port groups and trunk uplinks">
<rect x="10" y="10" width="620" height="140" rx="10" fill="#e2e8f0"/><text x="20" y="30" class="svg-muted" font-size="12">ESXi host</text>
<rect x="40" y="40" width="110" height="36" rx="6" fill="#ddd6fe"/><text x="95" y="63" text-anchor="middle" class="svg-ink" font-size="12">VM web1</text>
<rect x="170" y="40" width="110" height="36" rx="6" fill="#ddd6fe"/><text x="225" y="63" text-anchor="middle" class="svg-ink" font-size="12">VM web2</text>
<rect x="360" y="40" width="110" height="36" rx="6" fill="#ddd6fe"/><text x="415" y="63" text-anchor="middle" class="svg-ink" font-size="12">VM db1</text>
<rect x="40" y="96" width="560" height="40" rx="6" fill="#bae6fd"/><text x="200" y="121" text-anchor="middle" class="svg-ink" font-size="12">Port group WEB (VLAN 10)</text><text x="460" y="121" text-anchor="middle" class="svg-ink" font-size="12">Port group DB (VLAN 20)</text>
<line x1="95" y1="76" x2="120" y2="96" stroke="#64748b" stroke-width="2"/><line x1="225" y1="76" x2="200" y2="96" stroke="#64748b" stroke-width="2"/><line x1="415" y1="76" x2="440" y2="96" stroke="#64748b" stroke-width="2"/>
<line x1="200" y1="136" x2="200" y2="185" stroke="#64748b" stroke-width="2"/><line x1="440" y1="136" x2="440" y2="185" stroke="#64748b" stroke-width="2"/>
<text x="210" y="165" class="svg-accent" font-size="12">vmnic0 trunk 10,20</text><text x="450" y="165" class="svg-accent" font-size="12">vmnic1 trunk 10,20</text>
<rect x="130" y="185" width="140" height="36" rx="6" fill="#bbf7d0"/><text x="200" y="208" text-anchor="middle" class="svg-ink" font-size="12">LEAF-01</text>
<rect x="370" y="185" width="140" height="36" rx="6" fill="#bbf7d0"/><text x="440" y="208" text-anchor="middle" class="svg-ink" font-size="12">LEAF-02</text>
</svg><p class="cap">The vSwitch tags frames by port group; the leaf ports must trunk the same VLANs.</p></div>

<h3>Live migration and why it shapes the network</h3>
<p><b>Live migration</b> (VMware <b>vMotion</b>, Hyper-V Live Migration, KVM live migration) moves a running VM from one host to another with no reboot. The hypervisor copies the VM's memory to the target host over a dedicated migration network, repeats the copy for pages that changed, pauses the VM for a fraction of a second, and resumes it on the new host.</p>
<p>The VM keeps its <b>IP address and MAC address</b>. Its users should not notice. That creates two network requirements:</p>
<ol>
<li><b>Layer-2 mobility.</b> The VM's VLAN (and its default gateway) must exist on the new host's leaf ports too. Traditionally that meant stretching VLANs across many racks; today <b>VXLAN overlays</b> give the same Layer-2 reach over a routed fabric.</li>
<li><b>MAC moves.</b> After the move, the physical switches still think the MAC is behind the old port. The hypervisor sends a notification frame (ESXi sends a RARP by default) from the new host so switches update their MAC tables. You will see the MAC "move" from one port or leaf to another.</li>
</ol>
<pre class="out">LEAF-02# show mac address-table address 0050.56ab.1234
   VLAN     MAC Address      Type      age     Secure NTFY Ports
---------+-----------------+--------+---------+------+----+------------------
<span class="hl">*   10     0050.56ab.1234   dynamic  0         F      F    Eth1/12</span></pre>
<p>Before the vMotion this MAC was learned on another leaf; now it appears on LEAF-02 port Eth1/12. One move is normal. The same MAC bouncing between two ports many times a second is <b>MAC flapping</b>, a sign of a loop or a teaming misconfiguration.</p>

<h3>Containers and Kubernetes (concept level)</h3>
<p>A <b>container</b> packages an application with its libraries but shares the host's operating system kernel. It starts in seconds and uses far less memory than a VM. <b>Kubernetes</b> runs containers across many servers (nodes): it groups containers into <b>pods</b>, gives each pod its own IP address, restarts failed pods and scales them up and down. Networking is provided by a <b>CNI plugin</b>; some build an overlay between nodes, others peer with the leaf switches using BGP to advertise pod subnets.</p>

<h3>What this means for the network team</h3>
<ul>
<li>Trunk the right VLANs to every host in a cluster, identically on both leaves.</li>
<li>Support larger MTU (jumbo frames, often 9000 bytes on hosts) for migration, storage and overlay traffic, end to end.</li>
<li>Expect many more MAC and IP addresses per port, and constant change.</li>
<li>Work closely with the virtualization and platform teams: a port group VLAN change on their side is a network change.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Adding a new port group VLAN in vCenter but not allowing it on the leaf trunks, so VMs on some hosts are isolated. Allowing a VLAN on only one of the two leaves. Setting jumbo MTU on the hosts but not on every switch in the path.</p></div>
<div class="exam"><p><b>Exam tip.</b> ESXi, KVM and Hyper-V are type 1. vDS is managed centrally by vCenter; vSS is per host. vMotion keeps the VM's IP and MAC, which is why DC fabrics need Layer-2 mobility (VXLAN EVPN or ACI).</p></div>

<div class="scn"><h4>The VM that died after vMotion</h4><p>Every time the app team's VM "pay-api" was moved by DRS to host ESX07, it became unreachable; moved back to ESX03, it worked. The engineer compared the trunks: VLAN 30 was allowed on the ports to ESX01 to ESX06, but ESX07 had been added last month with an old template allowing only 10 and 20. The VM moved, sent its RARP, but VLAN 30 frames were dropped at the leaf. Adding VLAN 30 to both of ESX07's ports fixed it, and the team moved to a single port template for every host in the cluster.</p><p><b>Lesson:</b> every host in a cluster must see exactly the same VLANs, or live migration becomes an outage.</p></div>

<div class="iv"><p class="q">"Why does vMotion matter to a network engineer?"</p><p>Strong answer: vMotion moves a running VM between hosts while it keeps its IP and MAC. So its VLAN and gateway must be available wherever it might land (Layer-2 mobility, today delivered by VXLAN EVPN or ACI rather than huge spanning-tree domains), switches must relearn its MAC quickly (the host sends a RARP), and the migration network needs bandwidth and consistent MTU. Mention consistent trunk configuration across every host in a cluster.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Type 1 hypervisors (ESXi, KVM, Hyper-V) run on bare metal; type 2 run on top of an OS.</li>
<li>The virtual switch tags VM traffic by port group VLAN; leaf ports to hosts are trunks.</li>
<li>vSS is per host; vDS is managed once in vCenter.</li>
<li>Live migration keeps IP and MAC, forcing Layer-2 mobility and causing MAC moves.</li>
<li>Containers share the host kernel; Kubernetes gives each pod an IP and needs a CNI plugin.</li>
</ul></div>
`,hi:`
<p>Ek badi building ko socho jo flats mein bati hai. Ek building, ek chhat, ek bijli connection, lekin kai families, har ek ka apna tala laga darwaza. <b>Virtualization</b> server ke saath yahi karta hai: ek physical machine ko kai <b>virtual machines (VMs)</b> mein baanta jaata hai, aur har VM ko lagta hai ki uska apna CPU, memory, disk aur network card hai. Modern data center mein aap jo bhi server jodte ho, lagbhag har ek par hypervisor chalta hai, isliye aapke switch port ke end par jo "device" hai woh aksar VMs ka poora chhota network hota hai.</p>

<h3>Hypervisors: type 1 aur type 2</h3>
<p><b>Hypervisor</b> woh software hai jo VMs banata aur chalata hai aur asli hardware ko unke beech share karta hai.</p>
<table class="cmp"><tr><th>Type</th><th>Kis par chalta hai</th><th>Examples</th><th>Kahan use hota hai</th></tr>
<tr><td><b>Type 1 (bare metal)</b></td><td>Seedha server hardware par</td><td>VMware ESXi, KVM (Linux kernel mein built-in), Microsoft Hyper-V</td><td>Production data centers</td></tr>
<tr><td><b>Type 2 (hosted)</b></td><td>Normal OS par ek application ki tarah</td><td>VirtualBox, VMware Workstation</td><td>Labs aur laptops</td></tr>
</table>
<p>Har VM ko <b>vCPUs</b>, virtual RAM, ek virtual disk (local ya shared storage par VMDK ya qcow2 jaisi file) aur ek ya zyada <b>vNICs</b> milte hain, har ek ka apna MAC address. <b>vCenter</b> jaisa management platform kai ESXi hosts ko ek cluster ki tarah control karta hai.</p>

<div class="eg"><p><b>Worked example: consolidation.</b> Ek company ke paas 40 purane physical servers hain, har ek average 8% CPU aur 24 GB RAM use karta hai. Total demand: lagbhag 40 × 24 = 960 GB RAM. Naye hosts mein har ek mein 64 cores aur 512 GB RAM hai. RAM limit hai: 960 ÷ 512 ≈ 1.9, to do hosts sab kuch rakh sakte hain, lekin aap <b>teen</b> plan karte ho taaki cluster ek host failure jhel sake (N+1). Chaalees boxes, assi power supplies aur assi cables teen hosts aur chhe data links ban jaate hain.</p></div>

<h3>Virtual switches aur port groups</h3>
<p>Ek host ke andar ke VMs ko aapas mein aur bahar baat karne ke liye switch chahiye. Woh switch software hai: <b>virtual switch</b>. Uske "uplinks" host ke physical NICs hain (VMware mein inhe vmnics kehte hain), jo aapke leaf switches mein lagte hain.</p>
<ul>
<li><b>vSphere Standard Switch (vSS)</b>: har ESXi host par alag se configure hota hai.</li>
<li><b>vSphere Distributed Switch (vDS)</b>: vCenter mein ek baar configure hota hai aur saare hosts par push hota hai, taaki har host consistent rahe.</li>
<li>KVM par: <b>Linux bridge</b> ya <b>Open vSwitch</b>; Hyper-V par: <b>Hyper-V Virtual Switch</b>.</li>
</ul>
<p><b>Port group</b> same settings wale virtual ports ka group hai, sabse zaroori setting hai <b>VLAN ID</b>. Port group "WEB-VLAN10" wala VM VLAN 10 mein rakha jaata hai. Virtual switch uplink se bahar jaate waqt 802.1Q tag jodta hai. Ise <b>virtual switch tagging</b> kehte hain, aur iska matlab hai ki physical leaf port ek <b>trunk</b> hona chahiye jo host ke port groups ke har VLAN ko allow kare.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Port groups aur trunk uplinks wale virtual switch par VMs">
<rect x="10" y="10" width="620" height="140" rx="10" fill="#e2e8f0"/><text x="20" y="30" class="svg-muted" font-size="12">ESXi host</text>
<rect x="40" y="40" width="110" height="36" rx="6" fill="#ddd6fe"/><text x="95" y="63" text-anchor="middle" class="svg-ink" font-size="12">VM web1</text>
<rect x="170" y="40" width="110" height="36" rx="6" fill="#ddd6fe"/><text x="225" y="63" text-anchor="middle" class="svg-ink" font-size="12">VM web2</text>
<rect x="360" y="40" width="110" height="36" rx="6" fill="#ddd6fe"/><text x="415" y="63" text-anchor="middle" class="svg-ink" font-size="12">VM db1</text>
<rect x="40" y="96" width="560" height="40" rx="6" fill="#bae6fd"/><text x="200" y="121" text-anchor="middle" class="svg-ink" font-size="12">Port group WEB (VLAN 10)</text><text x="460" y="121" text-anchor="middle" class="svg-ink" font-size="12">Port group DB (VLAN 20)</text>
<line x1="95" y1="76" x2="120" y2="96" stroke="#64748b" stroke-width="2"/><line x1="225" y1="76" x2="200" y2="96" stroke="#64748b" stroke-width="2"/><line x1="415" y1="76" x2="440" y2="96" stroke="#64748b" stroke-width="2"/>
<line x1="200" y1="136" x2="200" y2="185" stroke="#64748b" stroke-width="2"/><line x1="440" y1="136" x2="440" y2="185" stroke="#64748b" stroke-width="2"/>
<text x="210" y="165" class="svg-accent" font-size="12">vmnic0 trunk 10,20</text><text x="450" y="165" class="svg-accent" font-size="12">vmnic1 trunk 10,20</text>
<rect x="130" y="185" width="140" height="36" rx="6" fill="#bbf7d0"/><text x="200" y="208" text-anchor="middle" class="svg-ink" font-size="12">LEAF-01</text>
<rect x="370" y="185" width="140" height="36" rx="6" fill="#bbf7d0"/><text x="440" y="208" text-anchor="middle" class="svg-ink" font-size="12">LEAF-02</text>
</svg><p class="cap">vSwitch port group ke hisaab se frames tag karta hai; leaf ports ko wahi VLANs trunk karne chahiye.</p></div>

<h3>Live migration aur yeh network ko kaise shape karta hai</h3>
<p><b>Live migration</b> (VMware <b>vMotion</b>, Hyper-V Live Migration, KVM live migration) ek chalte hue VM ko bina reboot ek host se dusre host par le jaata hai. Hypervisor VM ki memory ko ek dedicated migration network par target host tak copy karta hai, badle hue pages ke liye copy repeat karta hai, VM ko second ke ek hisse ke liye pause karta hai, aur naye host par resume kar deta hai.</p>
<p>VM apna <b>IP address aur MAC address</b> rakhta hai. Uske users ko pata nahi chalna chahiye. Isse do network requirements banti hain:</p>
<ol>
<li><b>Layer-2 mobility.</b> VM ka VLAN (aur uska default gateway) naye host ke leaf ports par bhi hona chahiye. Pehle iska matlab tha VLANs ko kai racks tak stretch karna; aaj <b>VXLAN overlays</b> routed fabric par wahi Layer-2 reach dete hain.</li>
<li><b>MAC moves.</b> Move ke baad physical switches ab bhi sochte hain ki MAC purane port ke peeche hai. Hypervisor naye host se ek notification frame bhejta hai (ESXi default mein RARP bhejta hai) taaki switches apni MAC tables update karein. Aap dekhoge ki MAC ek port ya leaf se dusre par "move" hota hai.</li>
</ol>
<pre class="out">LEAF-02# show mac address-table address 0050.56ab.1234
   VLAN     MAC Address      Type      age     Secure NTFY Ports
---------+-----------------+--------+---------+------+----+------------------
<span class="hl">*   10     0050.56ab.1234   dynamic  0         F      F    Eth1/12</span></pre>
<p>vMotion se pehle yeh MAC kisi aur leaf par learn hua tha; ab yeh LEAF-02 ke port Eth1/12 par dikhta hai. Ek move normal hai. Wahi MAC do ports ke beech ek second mein kai baar uchhle to yeh <b>MAC flapping</b> hai, jo loop ya teaming misconfiguration ka sign hai.</p>

<h3>Containers aur Kubernetes (concept level)</h3>
<p><b>Container</b> ek application ko uski libraries ke saath package karta hai lekin host ka operating system kernel share karta hai. Yeh seconds mein start hota hai aur VM se kaafi kam memory use karta hai. <b>Kubernetes</b> containers ko kai servers (nodes) par chalata hai: yeh containers ko <b>pods</b> mein group karta hai, har pod ko apna IP address deta hai, fail hue pods restart karta hai aur unhe upar-neeche scale karta hai. Networking ek <b>CNI plugin</b> deta hai; kuch nodes ke beech overlay banate hain, kuch pod subnets advertise karne ke liye BGP se leaf switches ke saath peer karte hain.</p>

<h3>Network team ke liye iska matlab</h3>
<ul>
<li>Cluster ke har host par sahi VLANs trunk karo, dono leaves par bilkul same.</li>
<li>Migration, storage aur overlay traffic ke liye bada MTU (jumbo frames, hosts par aksar 9000 bytes) end to end support karo.</li>
<li>Har port par kaafi zyada MAC aur IP addresses aur lagataar badlaav expect karo.</li>
<li>Virtualization aur platform teams ke saath milkar kaam karo: unki taraf port group VLAN change bhi ek network change hai.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> vCenter mein naya port group VLAN jodna lekin leaf trunks par allow na karna, jisse kuch hosts ke VMs isolate ho jaate hain. VLAN ko do mein se sirf ek leaf par allow karna. Hosts par jumbo MTU set karna lekin path ke har switch par nahi.</p></div>
<div class="exam"><p><b>Exam tip.</b> ESXi, KVM aur Hyper-V type 1 hain. vDS vCenter se centrally manage hota hai; vSS har host par alag. vMotion VM ka IP aur MAC rakhta hai, isiliye DC fabrics ko Layer-2 mobility chahiye (VXLAN EVPN ya ACI).</p></div>

<div class="scn"><h4>Woh VM jo vMotion ke baad mar gaya</h4><p>Jab bhi app team ka VM "pay-api" DRS dwara host ESX07 par move hota, woh unreachable ho jaata; wapas ESX03 par le jao, to chal jaata. Engineer ne trunks compare kiye: ESX01 se ESX06 ke ports par VLAN 30 allowed tha, lekin ESX07 pichhle mahine ek purane template se joda gaya tha jo sirf 10 aur 20 allow karta tha. VM move hua, usne RARP bheja, lekin VLAN 30 ke frames leaf par drop ho gaye. ESX07 ke dono ports par VLAN 30 jodne se problem theek hui, aur team ne cluster ke har host ke liye ek hi port template apna liya.</p><p><b>Seekh:</b> cluster ke har host ko bilkul same VLANs dikhne chahiye, warna live migration outage ban jaata hai.</p></div>

<div class="iv"><p class="q">"vMotion network engineer ke liye kyun matter karta hai?"</p><p>Strong answer: vMotion chalte VM ko hosts ke beech move karta hai aur VM apna IP aur MAC rakhta hai. Isliye uska VLAN aur gateway har us jagah available hona chahiye jahan woh land kar sakta hai (Layer-2 mobility, jo aaj bade spanning-tree domains ke bajaye VXLAN EVPN ya ACI deta hai), switches ko uska MAC jaldi relearn karna chahiye (host RARP bhejta hai), aur migration network ko bandwidth aur consistent MTU chahiye. Cluster ke har host par consistent trunk configuration ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Type 1 hypervisors (ESXi, KVM, Hyper-V) bare metal par chalte hain; type 2 OS ke upar.</li>
<li>Virtual switch VM traffic ko port group VLAN ke hisaab se tag karta hai; hosts ki taraf leaf ports trunks hote hain.</li>
<li>vSS har host par alag hai; vDS vCenter mein ek baar manage hota hai.</li>
<li>Live migration IP aur MAC rakhta hai, jisse Layer-2 mobility zaroori hoti hai aur MAC moves hote hain.</li>
<li>Containers host kernel share karte hain; Kubernetes har pod ko IP deta hai aur CNI plugin maangta hai.</li>
</ul></div>
`}};export{e as default};