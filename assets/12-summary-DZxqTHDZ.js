var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a flight, pilots run a short checklist even after ten thousand hours in the air, because checklists catch what memory skips. This chapter is your pre-flight checklist for virtualization: read it the evening before the exam or an interview, and tick every line you can do without looking.</p>

<h3>Checklist: you should be able to...</h3>
<ul>
<li>Explain server sprawl and list the benefits of virtualization: consolidation, fast provisioning, isolation, snapshots, mobility, hardware independence.</li>
<li>Name the components of a VM: vCPU, vRAM, virtual disk file, vNIC with its own MAC, configuration file.</li>
<li>Classify hypervisors: type 1 (ESXi, Hyper-V, KVM, Xen) vs type 2 (VirtualBox, VMware Workstation / Fusion), and explain why type 1 suits data centers.</li>
<li>Describe a virtual switch, uplinks and port groups, and how a port group's VLAN ID becomes an 802.1Q tag on the uplink (VLAN 0 untagged, VMware 4095 guest tagging).</li>
<li>Configure the physical side: static trunk (<code>switchport mode trunk</code>), allowed VLANs, router-on-a-stick subinterfaces.</li>
<li>Explain NIC teaming policies and when the switch needs an EtherChannel (IP hash only), and what vMotion needs from the network (same VLAN on all hosts, RARP to update MAC tables).</li>
<li>Compare containers and VMs; explain Docker bridge networking (172.17.0.0/16, NAT) and port publishing HOST:CONTAINER.</li>
<li>Describe Kubernetes: control plane, worker nodes, pods, deployments, services, CNI.</li>
<li>Recite the five NIST characteristics, the three service models and the four deployment models.</li>
<li>Compare internet, internet VPN, private WAN and intercloud exchange for cloud connectivity; define NFV, VNF, NFVI and MANO.</li>
<li>Configure and verify VRF-lite on IOS: <code>vrf definition</code>, <code>vrf forwarding</code>, <code>ip route vrf</code>, <code>show vrf</code>, <code>show ip route vrf</code>, <code>ping vrf</code>.</li>
<li>Troubleshoot a VM without network from the VM outward, and fix port-group VLAN, trunk allowed list and uplink team faults.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Virtualization map">
<rect x="250" y="90" width="140" height="40" rx="8" fill="#fde68a"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="13">Virtualization</text>
<rect x="20" y="20" width="150" height="36" rx="8" fill="#bbf7d0"/><text x="95" y="43" text-anchor="middle" class="svg-ink" font-size="12">Servers: VMs</text>
<rect x="245" y="20" width="150" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="12">OS: containers</text>
<rect x="470" y="20" width="150" height="36" rx="8" fill="#bbf7d0"/><text x="545" y="43" text-anchor="middle" class="svg-ink" font-size="12">Switch: VLANs, vSwitch</text>
<rect x="20" y="164" width="150" height="36" rx="8" fill="#bae6fd"/><text x="95" y="187" text-anchor="middle" class="svg-ink" font-size="12">Router: VRFs</text>
<rect x="245" y="164" width="150" height="36" rx="8" fill="#bae6fd"/><text x="320" y="187" text-anchor="middle" class="svg-ink" font-size="12">Appliances: NFV</text>
<rect x="470" y="164" width="150" height="36" rx="8" fill="#bae6fd"/><text x="545" y="187" text-anchor="middle" class="svg-ink" font-size="12">Data center: cloud</text>
<line x1="95" y1="56" x2="270" y2="90" stroke="#64748b"/><line x1="320" y1="56" x2="320" y2="90" stroke="#64748b"/><line x1="545" y1="56" x2="370" y2="90" stroke="#64748b"/>
<line x1="95" y1="164" x2="270" y2="130" stroke="#64748b"/><line x1="320" y1="164" x2="320" y2="130" stroke="#64748b"/><line x1="545" y1="164" x2="370" y2="130" stroke="#64748b"/>
</svg><p class="cap">One idea, six places: split a physical resource into isolated logical ones.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Hypervisor</dt><dd>Software that runs and isolates VMs; type 1 on hardware, type 2 on a host OS.</dd>
<dt>vNIC / vmnic</dt><dd>vNIC = the VM's virtual network card; vmnic = the host's physical NIC used as a vSwitch uplink.</dd>
<dt>Port group</dt><dd>Named group of virtual ports sharing a policy such as a VLAN ID.</dd>
<dt>vMotion</dt><dd>Live migration of a running VM between hosts, keeping its IP and MAC.</dd>
<dt>Container</dt><dd>Isolated process from an image, sharing the host kernel.</dd>
<dt>Pod</dt><dd>Kubernetes unit: one or more containers sharing one IP.</dd>
<dt>VRF</dt><dd>Separate routing and forwarding table on one router.</dd>
<dt>VNF</dt><dd>A network function (router, firewall) running as software.</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li>Type 1 = bare metal; type 2 = hosted. Containers need no hypervisor and share the kernel.</li>
<li>The vSwitch tags frames with the port group VLAN; the host-facing switch port must be a static trunk because vSwitches do not negotiate DTP; vSwitches do not run STP.</li>
<li>NIST: on-demand self-service, broad network access, resource pooling, rapid elasticity, measured service.</li>
<li>IaaS = you manage the OS; PaaS = you bring code; SaaS = you use the app.</li>
<li>Intercloud exchange = one connection to many clouds; private WAN = QoS and SLA; internet VPN = cheap and encrypted, no QoS.</li>
<li>VRFs allow overlapping IPs; an interface belongs to one VRF; <code>vrf forwarding</code> removes an existing IP address.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! lab hypervisor shell</span>
vm list | vswitch show | nic list | version
vswitch portgroup add|set NAME vlan 0-4094
vswitch uplink add|remove vmnicN
vm set NAME portgroup PG | vm power on NAME | vm console NAME
<span class="c">! switch and router</span>
switchport mode trunk
switchport trunk allowed vlan add 20
show interfaces trunk | show mac address-table
interface g0/0.20 / encapsulation dot1Q 20
<span class="c">! VRF-lite</span>
vrf definition CUST-A / address-family ipv4
vrf forwarding CUST-A
ip route vrf CUST-A 0.0.0.0 0.0.0.0 172.16.0.2
show vrf | show ip route vrf CUST-A | ping vrf CUST-A 10.1.1.10
<span class="c">! containers</span>
docker run -d --name web -p 8080:80 nginx | docker ps | docker inspect web</pre>

<div class="eg"><p><b>Worked example: a 30-second answer.</b> "A VM in port group PG-DB (VLAN 20) cannot reach 10.20.20.1." Say: check the VM is on and addressed; check <code>vm list</code> shows VLAN 20; check <code>vswitch show</code> uplinks are bound and trunking; check <code>show interfaces trunk</code> allows 20 on every team member; check R1 has <code>Gi0/0.20</code> with <code>encapsulation dot1Q 20</code>.</p></div>

<div class="warn"><p><b>Common mistake.</b> Memorising the lists without the "why". Interviewers ask "why must the port be a trunk?" or "why does vMotion need the same VLAN everywhere?" Practise explaining each fact in one sentence.</p></div>

<div class="exam"><p><b>Exam trap.</b> Watch the wording: "shares the host OS kernel" (container), "runs on top of a host OS" (type-2 hypervisor), "multiple routing tables" (VRF), "pay for what you use" (measured service), "one connection to several cloud providers" (intercloud exchange).</p></div>

<div class="scn"><h4>The interview that turned into a whiteboard</h4><p>A candidate was asked to draw how a VM reaches the internet. She drew VM, vNIC, port group with VLAN 20, vSwitch, two uplinks to two switches as trunks, SVI gateway in VRF CORP, firewall, internet, and labelled where tags were added and removed. The panel spent the rest of the interview on design rather than definitions, and she got the offer.</p><p><b>Lesson:</b> being able to draw the whole path, from vNIC to cloud, is what proves you understand virtualization.</p></div>

<div class="iv"><p class="q">"Summarise virtualization for me in two minutes."</p><p>Start with the core idea: split one physical resource into isolated logical ones. Then walk the stack: VMs on type-1 hypervisors, virtual switches tagging VLANs to physical trunks, NIC teaming and vMotion; containers sharing the kernel and orchestrated by Kubernetes; cloud as virtualization delivered with the five NIST characteristics in IaaS, PaaS or SaaS; and in the network itself VRFs and NFV. End with one real troubleshooting story.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Virtualization appears everywhere: servers (VMs), OS (containers), switches (VLANs, vSwitches), routers (VRFs), appliances (NFV) and data centers (cloud).</li>
<li>The network starts inside the host: port-group VLANs must match static trunks and gateways.</li>
<li>Know the lists cold: hypervisor types, NIST five, service and deployment models, connectivity options.</li>
<li>VRF-lite: create, assign before IP, route per VRF, verify with VRF-aware commands.</li>
<li>Troubleshoot from the VM outward and compare with a working path.</li>
</ul></div>
`,hi:`
<p>Flight se pehle pilots das hazaar ghante udne ke baad bhi chhoti checklist chalate hain, kyunki checklist woh pakadti hai jo memory chhod deti hai. Yeh chapter virtualization ke liye aapki pre-flight checklist hai: exam ya interview se pehli shaam ise padho, aur har woh line tick karo jo aap bina dekhe kar sakte ho.</p>

<h3>Checklist: aapko yeh aana chahiye...</h3>
<ul>
<li>Server sprawl samjhana aur virtualization ke fayde list karna: consolidation, fast provisioning, isolation, snapshots, mobility, hardware independence.</li>
<li>VM ke components ke naam: vCPU, vRAM, virtual disk file, apne MAC wala vNIC, configuration file.</li>
<li>Hypervisors classify karna: type 1 (ESXi, Hyper-V, KVM, Xen) vs type 2 (VirtualBox, VMware Workstation / Fusion), aur samjhana ki type 1 data centers ke liye kyun sahi hai.</li>
<li>Virtual switch, uplinks aur port groups describe karna, aur port group ka VLAN ID uplink par 802.1Q tag kaise banta hai (VLAN 0 untagged, VMware 4095 guest tagging).</li>
<li>Physical side configure karna: static trunk (<code>switchport mode trunk</code>), allowed VLANs, router-on-a-stick subinterfaces.</li>
<li>NIC teaming policies samjhana aur switch ko EtherChannel kab chahiye (sirf IP hash), aur vMotion ko network se kya chahiye (saare hosts par same VLAN, MAC tables update karne ke liye RARP).</li>
<li>Containers aur VMs compare karna; Docker bridge networking (172.17.0.0/16, NAT) aur port publishing HOST:CONTAINER samjhana.</li>
<li>Kubernetes describe karna: control plane, worker nodes, pods, deployments, services, CNI.</li>
<li>Paanch NIST characteristics, teen service models aur chaar deployment models bolna.</li>
<li>Cloud connectivity ke liye internet, internet VPN, private WAN aur intercloud exchange compare karna; NFV, VNF, NFVI aur MANO define karna.</li>
<li>IOS par VRF-lite configure aur verify karna: <code>vrf definition</code>, <code>vrf forwarding</code>, <code>ip route vrf</code>, <code>show vrf</code>, <code>show ip route vrf</code>, <code>ping vrf</code>.</li>
<li>Bina network wali VM ko VM se bahar ki taraf troubleshoot karna, aur port-group VLAN, trunk allowed list aur uplink team faults theek karna.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Virtualization map">
<rect x="250" y="90" width="140" height="40" rx="8" fill="#fde68a"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="13">Virtualization</text>
<rect x="20" y="20" width="150" height="36" rx="8" fill="#bbf7d0"/><text x="95" y="43" text-anchor="middle" class="svg-ink" font-size="12">Servers: VMs</text>
<rect x="245" y="20" width="150" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="12">OS: containers</text>
<rect x="470" y="20" width="150" height="36" rx="8" fill="#bbf7d0"/><text x="545" y="43" text-anchor="middle" class="svg-ink" font-size="12">Switch: VLANs, vSwitch</text>
<rect x="20" y="164" width="150" height="36" rx="8" fill="#bae6fd"/><text x="95" y="187" text-anchor="middle" class="svg-ink" font-size="12">Router: VRFs</text>
<rect x="245" y="164" width="150" height="36" rx="8" fill="#bae6fd"/><text x="320" y="187" text-anchor="middle" class="svg-ink" font-size="12">Appliances: NFV</text>
<rect x="470" y="164" width="150" height="36" rx="8" fill="#bae6fd"/><text x="545" y="187" text-anchor="middle" class="svg-ink" font-size="12">Data center: cloud</text>
<line x1="95" y1="56" x2="270" y2="90" stroke="#64748b"/><line x1="320" y1="56" x2="320" y2="90" stroke="#64748b"/><line x1="545" y1="56" x2="370" y2="90" stroke="#64748b"/>
<line x1="95" y1="164" x2="270" y2="130" stroke="#64748b"/><line x1="320" y1="164" x2="320" y2="130" stroke="#64748b"/><line x1="545" y1="164" x2="370" y2="130" stroke="#64748b"/>
</svg><p class="cap">Ek idea, chhe jagah: physical resource ko isolated logical resources mein baantna.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Hypervisor</dt><dd>Software jo VMs chalata aur isolate karta hai; type 1 hardware par, type 2 host OS par.</dd>
<dt>vNIC / vmnic</dt><dd>vNIC = VM ka virtual network card; vmnic = host ka physical NIC jo vSwitch uplink ki tarah use hota hai.</dd>
<dt>Port group</dt><dd>Virtual ports ka naam wala group jo VLAN ID jaisi policy share karta hai.</dd>
<dt>vMotion</dt><dd>Chalti VM ka hosts ke beech live migration, uska IP aur MAC rakhte hue.</dd>
<dt>Container</dt><dd>Image se bana isolated process, jo host kernel share karta hai.</dd>
<dt>Pod</dt><dd>Kubernetes unit: ek IP share karne wale ek ya zyada containers.</dd>
<dt>VRF</dt><dd>Ek router par alag routing aur forwarding table.</dd>
<dt>VNF</dt><dd>Software ki tarah chalne wala network function (router, firewall).</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<ul>
<li>Type 1 = bare metal; type 2 = hosted. Containers ko hypervisor nahi chahiye aur woh kernel share karte hain.</li>
<li>vSwitch frames ko port group VLAN se tag karta hai; host ki taraf wala switch port static trunk hona chahiye kyunki vSwitches DTP negotiate nahi karte; vSwitches STP nahi chalate.</li>
<li>NIST: on-demand self-service, broad network access, resource pooling, rapid elasticity, measured service.</li>
<li>IaaS = OS aap manage karte ho; PaaS = aap code laate ho; SaaS = aap app use karte ho.</li>
<li>Intercloud exchange = kai clouds tak ek connection; private WAN = QoS aur SLA; internet VPN = sasta aur encrypted, QoS nahi.</li>
<li>VRFs overlapping IPs allow karte hain; interface ek VRF ka hota hai; <code>vrf forwarding</code> existing IP address hata deta hai.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! lab hypervisor shell</span>
vm list | vswitch show | nic list | version
vswitch portgroup add|set NAME vlan 0-4094
vswitch uplink add|remove vmnicN
vm set NAME portgroup PG | vm power on NAME | vm console NAME
<span class="c">! switch aur router</span>
switchport mode trunk
switchport trunk allowed vlan add 20
show interfaces trunk | show mac address-table
interface g0/0.20 / encapsulation dot1Q 20
<span class="c">! VRF-lite</span>
vrf definition CUST-A / address-family ipv4
vrf forwarding CUST-A
ip route vrf CUST-A 0.0.0.0 0.0.0.0 172.16.0.2
show vrf | show ip route vrf CUST-A | ping vrf CUST-A 10.1.1.10
<span class="c">! containers</span>
docker run -d --name web -p 8080:80 nginx | docker ps | docker inspect web</pre>

<div class="eg"><p><b>Worked example: 30-second answer.</b> "Port group PG-DB (VLAN 20) ki ek VM 10.20.20.1 tak nahi pahunch pa rahi." Bolo: check karo VM on aur addressed hai; check karo <code>vm list</code> VLAN 20 dikhata hai; check karo <code>vswitch show</code> ke uplinks bound aur trunking hain; check karo <code>show interfaces trunk</code> har team member par 20 allow karta hai; check karo R1 par <code>encapsulation dot1Q 20</code> ke saath <code>Gi0/0.20</code> hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Lists ko bina "kyun" ke ratna. Interviewers poochhte hain "port trunk kyun hona chahiye?" ya "vMotion ko har jagah same VLAN kyun chahiye?" Har fact ko ek sentence mein samjhane ki practice karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Wording par dhyan do: "host OS kernel share karta hai" (container), "host OS ke upar chalta hai" (type-2 hypervisor), "multiple routing tables" (VRF), "jitna use utna pay" (measured service), "kai cloud providers tak ek connection" (intercloud exchange).</p></div>

<div class="scn"><h4>Woh interview jo whiteboard ban gaya</h4><p>Ek candidate se draw karne ko kaha gaya ki VM internet tak kaise pahunchti hai. Usne VM, vNIC, VLAN 20 wala port group, vSwitch, do switches tak trunks ki tarah do uplinks, VRF CORP mein SVI gateway, firewall, internet draw kiya, aur label kiya ki tags kahan jode aur hataye gaye. Panel ne baaki interview definitions ki jagah design par bitaya, aur use offer mil gaya.</p><p><b>Seekh:</b> vNIC se cloud tak poora path draw kar paana hi saabit karta hai ki aap virtualization samajhte ho.</p></div>

<div class="iv"><p class="q">"Mujhe do minute mein virtualization summarise karke batao."</p><p>Core idea se shuru karo: ek physical resource ko isolated logical resources mein baantna. Phir stack par chalo: type-1 hypervisors par VMs, physical trunks tak VLANs tag karne wale virtual switches, NIC teaming aur vMotion; kernel share karne wale aur Kubernetes se orchestrate hone wale containers; paanch NIST characteristics ke saath IaaS, PaaS ya SaaS mein deliver hui virtualization yaani cloud; aur network ke andar VRFs aur NFV. Ek asli troubleshooting story se khatam karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Virtualization har jagah hai: servers (VMs), OS (containers), switches (VLANs, vSwitches), routers (VRFs), appliances (NFV) aur data centers (cloud).</li>
<li>Network host ke andar se shuru hota hai: port-group VLANs static trunks aur gateways se match hone chahiye.</li>
<li>Lists pakki yaad rakho: hypervisor types, NIST paanch, service aur deployment models, connectivity options.</li>
<li>VRF-lite: banao, IP se pehle assign karo, per VRF route karo, VRF-aware commands se verify karo.</li>
<li>VM se bahar ki taraf troubleshoot karo aur chalte path se compare karo.</li>
</ul></div>
`}};export{e as default};