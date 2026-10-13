var e={id:`device-virtualization`,h:{en:`Device virtualization: hypervisors, VMs and virtual switching`,hi:`Device virtualization: hypervisors, VMs aur virtual switching`},body:{en:`
<p>Picture a large family house converted into paying-guest rooms. The owner (the <b>hypervisor</b>) controls the building, the water and the electricity. Each guest (a <b>virtual machine</b>) gets a room with a lock and believes it has its own space. The corridor that connects the rooms to the front gate is the <b>virtual switch</b>. ENCOR blueprint item 2.1 asks you to describe exactly these three things.</p>

<h3>Hypervisor type 1 and type 2</h3>
<p>A <b>hypervisor</b> (also called a virtual machine monitor) is software that shares one physical host's CPU, memory, storage and network cards among several isolated virtual machines. There are two families:</p>
<table class="cmp"><tr><th></th><th>Type 1 (bare metal / native)</th><th>Type 2 (hosted)</th></tr>
<tr><td>Runs on</td><td>Directly on the server hardware</td><td>As an application inside a normal OS (Windows, macOS, Linux)</td></tr>
<tr><td>Examples</td><td>VMware ESXi, Microsoft Hyper-V, KVM, Xen, Cisco NFVIS (KVM based)</td><td>VMware Workstation, VMware Fusion, Oracle VirtualBox</td></tr>
<tr><td>Performance</td><td>High; direct access to hardware</td><td>Lower; every call passes through the host OS</td></tr>
<tr><td>Where used</td><td>Data centers, clouds, branch NFV platforms</td><td>Labs, testing, a developer's laptop</td></tr>
</table>
<p>KVM is sometimes debated because it is part of the Linux kernel, but because the kernel itself becomes the hypervisor running on hardware, it is classed as type 1. For the exam, remember: type 1 sits on hardware, type 2 sits on an OS.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Type 1 and type 2 hypervisor stacks">
<text x="160" y="20" text-anchor="middle" class="svg-accent" font-size="14">Type 1</text>
<rect x="40" y="30" width="75" height="40" rx="6" fill="#fde68a"/><text x="77" y="55" text-anchor="middle" class="svg-ink" font-size="12">VM1</text>
<rect x="122" y="30" width="75" height="40" rx="6" fill="#fde68a"/><text x="160" y="55" text-anchor="middle" class="svg-ink" font-size="12">VM2</text>
<rect x="205" y="30" width="75" height="40" rx="6" fill="#fde68a"/><text x="242" y="55" text-anchor="middle" class="svg-ink" font-size="12">VM3</text>
<rect x="40" y="80" width="240" height="40" rx="6" fill="#ddd6fe"/><text x="160" y="105" text-anchor="middle" class="svg-ink" font-size="13">Hypervisor (ESXi, KVM)</text>
<rect x="40" y="130" width="240" height="40" rx="6" fill="#e2e8f0"/><text x="160" y="155" text-anchor="middle" class="svg-ink" font-size="13">Server hardware</text>
<text x="480" y="20" text-anchor="middle" class="svg-accent" font-size="14">Type 2</text>
<rect x="360" y="30" width="115" height="40" rx="6" fill="#fde68a"/><text x="417" y="55" text-anchor="middle" class="svg-ink" font-size="12">VM1</text>
<rect x="485" y="30" width="115" height="40" rx="6" fill="#fde68a"/><text x="542" y="55" text-anchor="middle" class="svg-ink" font-size="12">VM2</text>
<rect x="360" y="80" width="240" height="40" rx="6" fill="#ddd6fe"/><text x="480" y="105" text-anchor="middle" class="svg-ink" font-size="13">Hypervisor app (VirtualBox)</text>
<rect x="360" y="130" width="240" height="40" rx="6" fill="#bae6fd"/><text x="480" y="155" text-anchor="middle" class="svg-ink" font-size="13">Host OS (Windows, macOS)</text>
<rect x="360" y="180" width="240" height="40" rx="6" fill="#e2e8f0"/><text x="480" y="205" text-anchor="middle" class="svg-ink" font-size="13">Laptop hardware</text>
</svg><p class="cap">Type 1 has one less layer between the VM and the hardware, which is why data centers use it.</p></div>

<h3>What a virtual machine really is</h3>
<p>A <b>virtual machine</b> is a set of files plus a running process that behaves like a complete computer. It has <b>vCPUs</b> (time slices of physical cores), <b>vRAM</b>, a <b>virtual disk</b> (a file such as VMDK, VHDX or qcow2), and one or more <b>vNICs</b>, each with its own MAC address. It runs its own <b>guest OS</b> and does not know it is virtual. Because a VM is just files, it can be cloned from a template in minutes, snapshotted before a risky change, and <b>live-migrated</b> (vMotion, Live Migration) to another host without dropping its sessions, as long as both hosts see the same storage and the same VLANs.</p>
<p>Network devices are VMs too. The Cisco <b>Catalyst 8000V</b> is IOS XE as a virtual router; virtual firewalls and wireless controllers exist as well. Running network functions as VMs on standard servers is called <b>NFV</b> (network functions virtualization).</p>

<h3>Virtual switching</h3>
<p>Each vNIC connects to a port on a <b>virtual switch</b> inside the hypervisor. The virtual switch forwards frames between VMs on the same host in memory, and sends everything else out through physical NICs called <b>uplinks</b> (on ESXi, vmnic0, vmnic1). Common implementations:</p>
<ul>
<li><b>vSphere Standard Switch (vSS)</b>: configured per host.</li>
<li><b>vSphere Distributed Switch (vDS)</b>: one switch configured centrally in vCenter and pushed to many hosts, so port groups stay identical, which live migration needs.</li>
<li><b>Hyper-V virtual switch</b>, <b>Linux bridge</b> and <b>Open vSwitch (OVS)</b> in KVM and OpenStack.</li>
</ul>
<p>VMs attach to <b>port groups</b>, which are templates holding the VLAN and security policy. VLAN tagging can happen in three places: <b>EST</b> (external switch tagging, the physical switch port is an access port, no tag reaches the host), <b>VST</b> (virtual switch tagging, the port group adds a VLAN tag 1 to 4094 and the uplink goes to a trunk; this is the most common), and <b>VGT</b> (virtual guest tagging, the VM itself tags, which on a vSS means VLAN 4095 on the port group).</p>
<p>A virtual switch does not run spanning tree. It avoids loops differently: it never forwards a frame received on one uplink out of another uplink. That is why the physical switch port facing a host is usually configured as an edge trunk with PortFast (<code>spanning-tree portfast trunk</code>) and BPDU Guard.</p>

<div class="eg"><p><b>Worked example.</b> Host HV1 has uplinks vmnic0 and vmnic1 to SW1 Gi1/0/1 and SW2 Gi1/0/1. Port group PG-Web uses VLAN 10 and PG-DB uses VLAN 20 (VST). Both switch ports must be trunks allowing VLANs 10 and 20. WEB01 (10.10.10.11) talks to DB01 (10.20.20.21): the frame leaves the host on an uplink tagged 10, the gateway routes it, and it comes back down the trunk tagged 20 to DB01. Both VMs sit on the same physical server, yet the traffic still goes out to the gateway, because they are in different VLANs.</p></div>

<pre class="code"><span class="c">! SW1 port facing the hypervisor uplink</span>
interface GigabitEthernet1/0/1
 description HV1 vmnic0
 switchport mode trunk
 switchport trunk allowed vlan 10,20
 spanning-tree portfast trunk
 spanning-tree bpduguard enable</pre>

<div class="warn"><p><b>Common mistakes.</b> Allowing a VLAN on one host's trunk but not another, so a VM loses connectivity after live migration. Setting the port group VLAN to 21 when the gateway is in VLAN 20. Configuring an LACP port-channel on the physical switch while the vSS uses simple active-standby teaming: a standard switch cannot run LACP.</p></div>

<div class="exam"><p><b>Exam traps.</b> VirtualBox and Workstation are type 2; ESXi, Hyper-V and KVM are type 1. Containers are not VMs: they share the host kernel and have no guest OS. A vSwitch does not participate in STP.</p></div>

<div class="scn"><h4>The VM that died after vMotion</h4><p>A payroll VM worked perfectly on host HV3 but lost its network every time DRS moved it to HV5. The VM, IP and port group were identical. The engineer ran <code>show interfaces trunk</code> on the switch facing HV5 and saw VLAN 30 missing from the allowed list: it had been added on HV3's ports during the original build but forgotten on HV5's.</p><p><b>Lesson:</b> the physical trunks facing every host in a cluster must carry the same VLANs. Use a distributed switch and a standard switch template so hosts stay consistent.</p></div>

<div class="iv"><p class="q">"Explain type 1 versus type 2 hypervisors, and where the network engineer's job starts in a virtualized server."</p><p>Type 1 runs on bare metal (ESXi, Hyper-V, KVM) and is used in production; type 2 runs on a host OS (VirtualBox, Workstation) and is used for labs. The network starts at the vNIC: the virtual switch and its port groups decide the VLAN, the uplinks connect to physical trunks, and teaming and VLAN lists must match on every host for live migration to work. Mention that a vSwitch does not run STP and that the facing ports use PortFast trunk and BPDU Guard.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Type 1 hypervisor = on hardware (ESXi, Hyper-V, KVM); type 2 = on a host OS (VirtualBox, Workstation).</li>
<li>A VM has vCPU, vRAM, a virtual disk file and vNICs with their own MACs; it can be cloned, snapshotted and live-migrated.</li>
<li>The virtual switch connects vNICs to port groups and to physical uplinks; VST tagging with trunk uplinks is most common.</li>
<li>vSwitches do not run STP; they never forward between uplinks.</li>
<li>NFV runs routers and firewalls, such as Catalyst 8000V, as VMs.</li>
</ul></div>
`,hi:`
<p>Ek bade family ghar ko socho jise paying-guest rooms mein badal diya gaya. Maalik (<b>hypervisor</b>) building, paani aur bijli control karta hai. Har guest (<b>virtual machine</b>) ko lock wala room milta hai aur woh maanta hai ki uski apni jagah hai. Rooms ko main gate se jodne wala corridor <b>virtual switch</b> hai. ENCOR blueprint item 2.1 aapse bilkul inhi teen cheezon ko describe karne ko kehta hai.</p>

<h3>Hypervisor type 1 aur type 2</h3>
<p><b>Hypervisor</b> (jise virtual machine monitor bhi kehte hain) woh software hai jo ek physical host ka CPU, memory, storage aur network cards kai isolated virtual machines mein baant-ta hai. Iske do families hain:</p>
<table class="cmp"><tr><th></th><th>Type 1 (bare metal / native)</th><th>Type 2 (hosted)</th></tr>
<tr><td>Kahan chalta hai</td><td>Seedha server hardware par</td><td>Normal OS (Windows, macOS, Linux) ke andar ek application ki tarah</td></tr>
<tr><td>Examples</td><td>VMware ESXi, Microsoft Hyper-V, KVM, Xen, Cisco NFVIS (KVM based)</td><td>VMware Workstation, VMware Fusion, Oracle VirtualBox</td></tr>
<tr><td>Performance</td><td>High; hardware tak direct access</td><td>Kam; har call host OS se hokar jaati hai</td></tr>
<tr><td>Kahan use hota hai</td><td>Data centers, clouds, branch NFV platforms</td><td>Labs, testing, developer ka laptop</td></tr>
</table>
<p>KVM par kabhi-kabhi debate hoti hai kyunki woh Linux kernel ka hissa hai, lekin kyunki kernel khud hardware par chalne wala hypervisor ban jaata hai, use type 1 maana jaata hai. Exam ke liye yaad rakho: type 1 hardware par baithta hai, type 2 OS par.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Type 1 aur type 2 hypervisor stacks">
<text x="160" y="20" text-anchor="middle" class="svg-accent" font-size="14">Type 1</text>
<rect x="40" y="30" width="75" height="40" rx="6" fill="#fde68a"/><text x="77" y="55" text-anchor="middle" class="svg-ink" font-size="12">VM1</text>
<rect x="122" y="30" width="75" height="40" rx="6" fill="#fde68a"/><text x="160" y="55" text-anchor="middle" class="svg-ink" font-size="12">VM2</text>
<rect x="205" y="30" width="75" height="40" rx="6" fill="#fde68a"/><text x="242" y="55" text-anchor="middle" class="svg-ink" font-size="12">VM3</text>
<rect x="40" y="80" width="240" height="40" rx="6" fill="#ddd6fe"/><text x="160" y="105" text-anchor="middle" class="svg-ink" font-size="13">Hypervisor (ESXi, KVM)</text>
<rect x="40" y="130" width="240" height="40" rx="6" fill="#e2e8f0"/><text x="160" y="155" text-anchor="middle" class="svg-ink" font-size="13">Server hardware</text>
<text x="480" y="20" text-anchor="middle" class="svg-accent" font-size="14">Type 2</text>
<rect x="360" y="30" width="115" height="40" rx="6" fill="#fde68a"/><text x="417" y="55" text-anchor="middle" class="svg-ink" font-size="12">VM1</text>
<rect x="485" y="30" width="115" height="40" rx="6" fill="#fde68a"/><text x="542" y="55" text-anchor="middle" class="svg-ink" font-size="12">VM2</text>
<rect x="360" y="80" width="240" height="40" rx="6" fill="#ddd6fe"/><text x="480" y="105" text-anchor="middle" class="svg-ink" font-size="13">Hypervisor app (VirtualBox)</text>
<rect x="360" y="130" width="240" height="40" rx="6" fill="#bae6fd"/><text x="480" y="155" text-anchor="middle" class="svg-ink" font-size="13">Host OS (Windows, macOS)</text>
<rect x="360" y="180" width="240" height="40" rx="6" fill="#e2e8f0"/><text x="480" y="205" text-anchor="middle" class="svg-ink" font-size="13">Laptop hardware</text>
</svg><p class="cap">Type 1 mein VM aur hardware ke beech ek layer kam hai, isiliye data centers ise use karte hain.</p></div>

<h3>Virtual machine asal mein kya hai</h3>
<p><b>Virtual machine</b> kuch files aur ek chalta hua process hai jo poore computer ki tarah behave karta hai. Iske paas <b>vCPUs</b> (physical cores ke time slices), <b>vRAM</b>, ek <b>virtual disk</b> (VMDK, VHDX ya qcow2 jaisi file), aur ek ya zyada <b>vNICs</b> hote hain, har ek ka apna MAC address. Yeh apna <b>guest OS</b> chalati hai aur ise pata nahi hota ki yeh virtual hai. Kyunki VM sirf files hai, ise template se minuton mein clone kiya ja sakta hai, risky change se pehle snapshot liya ja sakta hai, aur bina sessions tode doosre host par <b>live-migrate</b> (vMotion, Live Migration) kiya ja sakta hai, bas dono hosts ko same storage aur same VLANs dikhne chahiye.</p>
<p>Network devices bhi VMs hote hain. Cisco <b>Catalyst 8000V</b> virtual router ke roop mein IOS XE hai; virtual firewalls aur wireless controllers bhi hote hain. Network functions ko standard servers par VMs ki tarah chalana <b>NFV</b> (network functions virtualization) kehlata hai.</p>

<h3>Virtual switching</h3>
<p>Har vNIC hypervisor ke andar ek <b>virtual switch</b> ke port se judta hai. Virtual switch same host ki VMs ke beech frames memory mein hi forward karta hai, aur baaki sab kuch physical NICs se bahar bhejta hai jinhe <b>uplinks</b> kehte hain (ESXi par vmnic0, vmnic1). Common implementations:</p>
<ul>
<li><b>vSphere Standard Switch (vSS)</b>: har host par alag configure hota hai.</li>
<li><b>vSphere Distributed Switch (vDS)</b>: ek switch jo vCenter mein centrally configure hota hai aur kai hosts par push hota hai, taaki port groups identical rahein, jo live migration ko chahiye.</li>
<li><b>Hyper-V virtual switch</b>, <b>Linux bridge</b> aur KVM aur OpenStack mein <b>Open vSwitch (OVS)</b>.</li>
</ul>
<p>VMs <b>port groups</b> se judti hain, jo VLAN aur security policy wale templates hain. VLAN tagging teen jagah ho sakti hai: <b>EST</b> (external switch tagging, physical switch port access port hai, host tak koi tag nahi pahunchta), <b>VST</b> (virtual switch tagging, port group 1 se 4094 tak VLAN tag lagata hai aur uplink trunk par jaata hai; yeh sabse common hai), aur <b>VGT</b> (virtual guest tagging, VM khud tag karti hai, jo vSS par port group par VLAN 4095 ka matlab hai).</p>
<p>Virtual switch spanning tree nahi chalata. Woh loops alag tarike se rokta hai: ek uplink par aaya frame kabhi doosre uplink se bahar forward nahi karta. Isiliye host ki taraf wala physical switch port aam taur par PortFast (<code>spanning-tree portfast trunk</code>) aur BPDU Guard ke saath edge trunk configure hota hai.</p>

<div class="eg"><p><b>Worked example.</b> Host HV1 ke uplinks vmnic0 aur vmnic1 SW1 Gi1/0/1 aur SW2 Gi1/0/1 tak jaate hain. Port group PG-Web VLAN 10 aur PG-DB VLAN 20 use karta hai (VST). Dono switch ports trunks hone chahiye jo VLANs 10 aur 20 allow karein. WEB01 (10.10.10.11) DB01 (10.20.20.21) se baat karta hai: frame host se uplink par tag 10 ke saath nikalta hai, gateway use route karta hai, aur woh trunk se tag 20 ke saath DB01 tak wapas aata hai. Dono VMs same physical server par baithi hain, phir bhi traffic gateway tak bahar jaata hai, kyunki woh alag VLANs mein hain.</p></div>

<pre class="code"><span class="c">! Hypervisor uplink ki taraf wala SW1 port</span>
interface GigabitEthernet1/0/1
 description HV1 vmnic0
 switchport mode trunk
 switchport trunk allowed vlan 10,20
 spanning-tree portfast trunk
 spanning-tree bpduguard enable</pre>

<div class="warn"><p><b>Common galtiyan.</b> Ek host ke trunk par VLAN allow karna lekin doosre par nahi, jisse live migration ke baad VM connectivity kho deti hai. Port group VLAN 21 set karna jabki gateway VLAN 20 mein hai. Physical switch par LACP port-channel configure karna jabki vSS simple active-standby teaming use karta hai: standard switch LACP nahi chala sakta.</p></div>

<div class="exam"><p><b>Exam traps.</b> VirtualBox aur Workstation type 2 hain; ESXi, Hyper-V aur KVM type 1 hain. Containers VMs nahi hain: woh host kernel share karte hain aur unka koi guest OS nahi hota. vSwitch STP mein participate nahi karta.</p></div>

<div class="scn"><h4>vMotion ke baad marne wali VM</h4><p>Ek payroll VM host HV3 par bilkul theek chalti thi lekin jab bhi DRS use HV5 par le jaata, network kho deti. VM, IP aur port group identical the. Engineer ne HV5 ki taraf wale switch par <code>show interfaces trunk</code> chalaya aur dekha ki allowed list mein VLAN 30 missing tha: original build ke time HV3 ke ports par add hua tha lekin HV5 ke ports par bhool gaye the.</p><p><b>Seekh:</b> cluster ke har host ki taraf wale physical trunks ko same VLANs le jaane chahiye. Distributed switch aur ek standard switch template use karo taaki hosts consistent rahein.</p></div>

<div class="iv"><p class="q">"Type 1 aur type 2 hypervisors samjhao, aur virtualized server mein network engineer ka kaam kahan se shuru hota hai."</p><p>Type 1 bare metal par chalta hai (ESXi, Hyper-V, KVM) aur production mein use hota hai; type 2 host OS par chalta hai (VirtualBox, Workstation) aur labs ke liye use hota hai. Network vNIC se shuru hota hai: virtual switch aur uske port groups VLAN decide karte hain, uplinks physical trunks se judte hain, aur live migration chalne ke liye har host par teaming aur VLAN lists match honi chahiye. Batao ki vSwitch STP nahi chalata aur facing ports PortFast trunk aur BPDU Guard use karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Type 1 hypervisor = hardware par (ESXi, Hyper-V, KVM); type 2 = host OS par (VirtualBox, Workstation).</li>
<li>VM ke paas vCPU, vRAM, virtual disk file aur apne MACs wale vNICs hote hain; ise clone, snapshot aur live-migrate kiya ja sakta hai.</li>
<li>Virtual switch vNICs ko port groups aur physical uplinks se jodta hai; trunk uplinks ke saath VST tagging sabse common hai.</li>
<li>vSwitches STP nahi chalate; woh uplinks ke beech kabhi forward nahi karte.</li>
<li>NFV routers aur firewalls, jaise Catalyst 8000V, ko VMs ki tarah chalata hai.</li>
</ul></div>
`}};export{e as default};