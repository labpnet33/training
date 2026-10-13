var e={id:`servers`,h:{en:`Servers: what is inside the box and how it meets the network`,hi:`Servers: box ke andar kya hai aur woh network se kaise judta hai`},body:{en:`
<p>A server is just a computer built for the data center: more CPU, more memory, faster network cards, two power supplies, and a tiny second computer inside that lets you manage it remotely. As a network engineer you will spend a lot of time at the point where the server's cable meets your switch port. If you understand what sits on the other side of that cable, most "the network is down" tickets become easy.</p>

<h3>Server anatomy</h3>
<dl class="terms">
<dt>CPU</dt><dd>The processor. Servers often have one or two <b>sockets</b>, each CPU with many <b>cores</b> (dozens is normal today). With simultaneous multithreading each core can run two threads. More cores means more virtual machines per server.</dd>
<dt>RAM</dt><dd>Memory in DIMM slots, often hundreds of gigabytes to several terabytes per server. Virtualisation hosts usually run out of RAM before CPU.</dd>
<dt>NIC</dt><dd>Network interface card. Speeds of 1G (management), 10G, 25G and 100G. Often two ports per card, and usually two cards for redundancy. A <b>SmartNIC</b> or <b>DPU</b> has its own processor to offload work such as encryption, overlay tunnels or virtual switching from the main CPU.</dd>
<dt>HBA</dt><dd>Host bus adapter. For Fibre Channel storage a server uses an FC HBA (16G, 32G or 64G FC). A <b>converged network adapter (CNA)</b>, such as the Cisco VIC, carries both Ethernet and storage traffic on one card.</dd>
<dt>PCIe</dt><dd>The internal bus that connects NICs, HBAs, GPUs and NVMe drives to the CPU. Each generation roughly doubles bandwidth per lane.</dd>
<dt>Local disks</dt><dd>SATA/SAS drives or NVMe SSDs, often behind a RAID controller, plus small boot drives (for example M.2).</dd>
</dl>

<div class="eg"><p><b>Worked example: can the slot feed the NIC?</b> A dual-port 100G NIC can move 2 × 100 Gbit/s = 200 Gbit/s = 25 GB/s in each direction. A PCIe Gen3 x16 slot gives about 15.75 GB/s per direction, a Gen4 x16 slot about 31.5 GB/s. So this NIC needs a Gen4 x16 slot to run both ports at line rate. In a Gen3 slot, the server will never exceed about 126 Gbit/s total, however good the network is.</p></div>

<h3>Rack servers and blade servers</h3>
<table class="cmp"><tr><th></th><th>Rack server</th><th>Blade server</th></tr>
<tr><td>Form</td><td>Standalone 1U or 2U box with its own power, fans and NICs</td><td>Thin server that slides into a shared <b>chassis</b></td></tr>
<tr><td>Shared parts</td><td>None</td><td>Chassis power, fans and network modules</td></tr>
<tr><td>Cabling</td><td>Every server cabled to the ToR</td><td>Only the chassis uplinks are cabled</td></tr>
<tr><td>Cisco example</td><td>UCS C-Series</td><td>UCS B-Series and the modular UCS X-Series</td></tr>
</table>
<p>Blades save space and cables, but tie you to one vendor's chassis. Rack servers are simpler and more flexible. In Cisco UCS both kinds are managed through a pair of <b>fabric interconnects</b>, which you will study in the compute module.</p>

<h3>Out-of-band management: the computer inside the computer</h3>
<p>Every modern server has a <b>BMC</b> (baseboard management controller), a small independent computer with its own network port. It works even when the server is powered off or the operating system has crashed. Vendor names:</p>
<ul><li><b>Cisco CIMC</b> (Cisco Integrated Management Controller)</li><li><b>HPE iLO</b> (Integrated Lights-Out)</li><li><b>Dell iDRAC</b> (integrated Dell Remote Access Controller)</li></ul>
<p>Through the BMC you can power the server on and off, open a remote <b>KVM console</b> (see the screen, use the keyboard), mount an ISO as <b>virtual media</b>, read temperatures and fan speeds, and update firmware. It supports standard APIs such as IPMI and <b>Redfish</b>. The BMC port connects to the separate <b>out-of-band (OOB) management network</b>, never to the production fabric.</p>

<h3>BIOS/UEFI and PXE boot</h3>
<p>When a server powers on, its firmware (<b>UEFI</b>, the modern replacement for BIOS) tests the hardware and chooses a boot device: local disk, SAN LUN, virtual media or the network. <b>PXE</b> (Preboot Execution Environment) boots from the network, which is how large fleets are installed automatically:</p>
<ol>
<li>The NIC sends a DHCP request.</li>
<li>The DHCP server returns an IP address plus the boot server and boot file name.</li>
<li>The NIC downloads a small boot loader (over TFTP, or from a web server on newer UEFI systems).</li>
<li>The loader pulls the OS installer, which installs the server with no one touching it.</li>
</ol>
<p>For the network team, PXE means: the DHCP server must be reachable (a <b>DHCP relay</b> on the gateway if it is in another subnet) and the build VLAN must be <b>untagged</b> (native) on the port, because PXE firmware usually does not tag.</p>

<h3>Connecting one server to two switches</h3>
<p>Each server connects to <b>two leaf switches</b> so that a switch, cable or NIC failure does not isolate it. The operating system combines the NICs, which is called <b>NIC teaming</b> (Windows, VMware) or <b>bonding</b> (Linux). Two basic styles:</p>
<ul>
<li><b>Active/standby</b> (Linux bond mode 1, active-backup): one link forwards, the other waits. No special switch configuration.</li>
<li><b>LACP</b> (802.3ad, Linux bond mode 4): both links forward as one logical link. The switch side must be a port-channel, and because the two links land on two different switches, the switches must act as one, using <b>vPC</b> on Nexus. You will build this in the vPC module.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Server dual-homed to two leaves plus BMC">
<rect x="110" y="15" width="150" height="45" rx="8" fill="#bae6fd"/><text x="185" y="42" text-anchor="middle" class="svg-ink" font-size="13">LEAF-01</text>
<rect x="380" y="15" width="150" height="45" rx="8" fill="#bae6fd"/><text x="455" y="42" text-anchor="middle" class="svg-ink" font-size="13">LEAF-02</text>
<line x1="260" y1="37" x2="380" y2="37" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="30" text-anchor="middle" class="svg-muted" font-size="12">vPC pair</text>
<rect x="200" y="130" width="240" height="60" rx="8" fill="#bbf7d0"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">Server: bond0 = NIC1 + NIC2</text><text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">25G + 25G</text>
<line x1="185" y1="60" x2="260" y2="130" stroke="#64748b" stroke-width="2"/><line x1="455" y1="60" x2="380" y2="130" stroke="#64748b" stroke-width="2"/>
<rect x="500" y="140" width="130" height="40" rx="8" fill="#e2e8f0"/><text x="565" y="165" text-anchor="middle" class="svg-ink" font-size="12">OOB switch</text>
<line x1="440" y1="160" x2="500" y2="160" stroke="#64748b" stroke-width="2"/><text x="470" y="152" text-anchor="middle" class="svg-accent" font-size="12">BMC</text>
</svg><p class="cap">Two data links to two leaves, plus a separate BMC link to the out-of-band network.</p></div>

<p>A typical leaf port facing a virtualisation host is a trunk carrying the host's VLANs:</p>
<pre class="code"><span class="c">! NX-OS port toward ESXi host NIC1</span>
interface Ethernet1/10
  description ESX01-VMNIC0
  switchport mode trunk
  switchport trunk allowed vlan 10,20,30
  spanning-tree port type edge trunk
  mtu 9216
  no shutdown</pre>
<pre class="out">LEAF-01# show interface status | include Eth1/10
<span class="hl">Eth1/10       ESX01-VMNIC0       connected trunk     full    25G     SFP-H25GB-CU3M</span></pre>

<div class="warn"><p><b>Common mistakes.</b> Configuring LACP on the server but a plain trunk on the switches (or the reverse): traffic flaps or one link is suspended. Plugging the BMC into a production VLAN. Forgetting that a server with teaming in active/standby only uses half its bandwidth.</p></div>
<div class="exam"><p><b>Exam tip.</b> CIMC, iLO and iDRAC are all BMCs: out-of-band, independent of the host OS. A CNA carries Ethernet and FC/FCoE on one adapter. An LACP bundle across two switches requires a multi-chassis technology such as vPC.</p></div>

<div class="scn"><h4>The PXE build that hung at "DHCP..."</h4><p>Twenty new hosts sat at the PXE screen showing "DHCP..." forever. The server team had configured the switch ports as an LACP port-channel for the final ESXi build. During PXE, the NIC firmware does not speak LACP, so the Nexus suspended the individual links and no DHCP packet ever left the rack. The engineer added <code>no lacp suspend-individual</code> to the port-channel so a single link could forward before LACP formed, and confirmed the build VLAN was native. All twenty hosts installed within an hour.</p><p><b>Lesson:</b> PXE, DHCP relay, native VLAN and LACP behaviour must be planned together with the server team.</p></div>

<div class="iv"><p class="q">"What is a BMC, and why does it sit on a separate network?"</p><p>Strong answer: the baseboard management controller (CIMC, iLO or iDRAC) is an independent controller for power control, remote console, virtual media, sensors and firmware, working even when the OS is dead. It sits on the out-of-band network so you can still reach and recover servers when the production fabric is broken, and so these powerful interfaces are isolated from user traffic for security.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A server = CPUs (sockets and cores), RAM, NICs, HBAs/CNAs, PCIe, local disks and dual PSUs.</li>
<li>PCIe slot bandwidth can limit a fast NIC; check the generation and lane count.</li>
<li>Rack servers are standalone; blades share a chassis for power, cooling and networking.</li>
<li>The BMC (CIMC/iLO/iDRAC) gives out-of-band control and belongs on the OOB network.</li>
<li>PXE needs DHCP reachability and an untagged build VLAN; dual-homing uses teaming/bonding, with LACP across two switches needing vPC.</li>
</ul></div>
`,hi:`
<p>Server bas data center ke liye bana computer hai: zyada CPU, zyada memory, tez network cards, do power supplies, aur andar ek chhota dusra computer jo aapko use remotely manage karne deta hai. Network engineer ke roop mein aapka kaafi time us point par jaayega jahan server ki cable aapke switch port se milti hai. Agar aap samajh lo ki us cable ke dusri taraf kya hai, to zyada tar "network down hai" wale tickets aasaan ho jaate hain.</p>

<h3>Server ki anatomy</h3>
<dl class="terms">
<dt>CPU</dt><dd>Processor. Servers mein aksar ek ya do <b>sockets</b> hote hain, har CPU mein bahut saare <b>cores</b> (aaj darjanon normal hain). Simultaneous multithreading se har core do threads chala sakta hai. Zyada cores ka matlab har server par zyada virtual machines.</dd>
<dt>RAM</dt><dd>DIMM slots mein memory, aksar har server mein sainkdon gigabytes se kai terabytes tak. Virtualisation hosts mein aam taur par CPU se pehle RAM khatam hoti hai.</dd>
<dt>NIC</dt><dd>Network interface card. Speeds 1G (management), 10G, 25G aur 100G. Aksar har card par do ports, aur redundancy ke liye aam taur par do cards. <b>SmartNIC</b> ya <b>DPU</b> ka apna processor hota hai jo encryption, overlay tunnels ya virtual switching jaisa kaam main CPU se offload karta hai.</dd>
<dt>HBA</dt><dd>Host bus adapter. Fibre Channel storage ke liye server FC HBA use karta hai (16G, 32G ya 64G FC). <b>Converged network adapter (CNA)</b>, jaise Cisco VIC, ek hi card par Ethernet aur storage traffic dono le jaata hai.</dd>
<dt>PCIe</dt><dd>Andar ki bus jo NICs, HBAs, GPUs aur NVMe drives ko CPU se jodti hai. Har generation har lane ki bandwidth lagbhag double kar deti hai.</dd>
<dt>Local disks</dt><dd>SATA/SAS drives ya NVMe SSDs, aksar RAID controller ke peeche, plus chhote boot drives (jaise M.2).</dd>
</dl>

<div class="eg"><p><b>Worked example: kya slot NIC ko feed kar sakta hai?</b> Dual-port 100G NIC har direction mein 2 × 100 Gbit/s = 200 Gbit/s = 25 GB/s move kar sakta hai. PCIe Gen3 x16 slot har direction mein lagbhag 15.75 GB/s deta hai, Gen4 x16 slot lagbhag 31.5 GB/s. To is NIC ko dono ports line rate par chalane ke liye Gen4 x16 slot chahiye. Gen3 slot mein server kabhi total lagbhag 126 Gbit/s se upar nahi jaayega, network chahe kitna bhi achha ho.</p></div>

<h3>Rack servers aur blade servers</h3>
<table class="cmp"><tr><th></th><th>Rack server</th><th>Blade server</th></tr>
<tr><td>Form</td><td>Standalone 1U ya 2U box, apne power, fans aur NICs ke saath</td><td>Patla server jo ek shared <b>chassis</b> mein slide hota hai</td></tr>
<tr><td>Shared parts</td><td>Kuch nahi</td><td>Chassis ka power, fans aur network modules</td></tr>
<tr><td>Cabling</td><td>Har server ToR tak cabled</td><td>Sirf chassis uplinks cabled</td></tr>
<tr><td>Cisco example</td><td>UCS C-Series</td><td>UCS B-Series aur modular UCS X-Series</td></tr>
</table>
<p>Blades jagah aur cables bachate hain, lekin aapko ek vendor ke chassis se baandh dete hain. Rack servers simple aur zyada flexible hain. Cisco UCS mein dono tarah ke servers ek pair <b>fabric interconnects</b> ke through manage hote hain, jo aap compute module mein padhoge.</p>

<h3>Out-of-band management: computer ke andar computer</h3>
<p>Har modern server mein ek <b>BMC</b> (baseboard management controller) hota hai, ek chhota independent computer jiska apna network port hota hai. Yeh tab bhi kaam karta hai jab server power off ho ya operating system crash ho gaya ho. Vendor names:</p>
<ul><li><b>Cisco CIMC</b> (Cisco Integrated Management Controller)</li><li><b>HPE iLO</b> (Integrated Lights-Out)</li><li><b>Dell iDRAC</b> (integrated Dell Remote Access Controller)</li></ul>
<p>BMC ke through aap server ko power on aur off kar sakte ho, remote <b>KVM console</b> khol sakte ho (screen dekho, keyboard use karo), ISO ko <b>virtual media</b> ki tarah mount kar sakte ho, temperatures aur fan speeds padh sakte ho, aur firmware update kar sakte ho. Yeh IPMI aur <b>Redfish</b> jaise standard APIs support karta hai. BMC port alag <b>out-of-band (OOB) management network</b> se judta hai, production fabric se kabhi nahi.</p>

<h3>BIOS/UEFI aur PXE boot</h3>
<p>Jab server power on hota hai, uska firmware (<b>UEFI</b>, BIOS ka modern replacement) hardware test karta hai aur boot device chunta hai: local disk, SAN LUN, virtual media ya network. <b>PXE</b> (Preboot Execution Environment) network se boot karta hai, aur isi tarah bade fleets automatically install hote hain:</p>
<ol>
<li>NIC ek DHCP request bhejta hai.</li>
<li>DHCP server IP address plus boot server aur boot file ka naam lautata hai.</li>
<li>NIC ek chhota boot loader download karta hai (TFTP se, ya naye UEFI systems par web server se).</li>
<li>Loader OS installer kheenchta hai, jo bina kisi ke haath lagaye server install kar deta hai.</li>
</ol>
<p>Network team ke liye PXE ka matlab: DHCP server reachable hona chahiye (agar woh dusre subnet mein hai to gateway par <b>DHCP relay</b>) aur build VLAN port par <b>untagged</b> (native) hona chahiye, kyunki PXE firmware aam taur par tag nahi karta.</p>

<h3>Ek server ko do switches se jodna</h3>
<p>Har server <b>do leaf switches</b> se judta hai taaki switch, cable ya NIC fail hone par woh isolate na ho. Operating system NICs ko combine karta hai, jise <b>NIC teaming</b> (Windows, VMware) ya <b>bonding</b> (Linux) kehte hain. Do basic styles:</p>
<ul>
<li><b>Active/standby</b> (Linux bond mode 1, active-backup): ek link forward karta hai, dusra wait karta hai. Switch par koi special configuration nahi.</li>
<li><b>LACP</b> (802.3ad, Linux bond mode 4): dono links ek logical link ki tarah forward karte hain. Switch side port-channel honi chahiye, aur kyunki dono links do alag switches par aate hain, switches ko ek ki tarah behave karna padta hai, Nexus par <b>vPC</b> use karke. Yeh aap vPC module mein banaoge.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Server do leaves se dual-homed plus BMC">
<rect x="110" y="15" width="150" height="45" rx="8" fill="#bae6fd"/><text x="185" y="42" text-anchor="middle" class="svg-ink" font-size="13">LEAF-01</text>
<rect x="380" y="15" width="150" height="45" rx="8" fill="#bae6fd"/><text x="455" y="42" text-anchor="middle" class="svg-ink" font-size="13">LEAF-02</text>
<line x1="260" y1="37" x2="380" y2="37" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="30" text-anchor="middle" class="svg-muted" font-size="12">vPC pair</text>
<rect x="200" y="130" width="240" height="60" rx="8" fill="#bbf7d0"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">Server: bond0 = NIC1 + NIC2</text><text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">25G + 25G</text>
<line x1="185" y1="60" x2="260" y2="130" stroke="#64748b" stroke-width="2"/><line x1="455" y1="60" x2="380" y2="130" stroke="#64748b" stroke-width="2"/>
<rect x="500" y="140" width="130" height="40" rx="8" fill="#e2e8f0"/><text x="565" y="165" text-anchor="middle" class="svg-ink" font-size="12">OOB switch</text>
<line x1="440" y1="160" x2="500" y2="160" stroke="#64748b" stroke-width="2"/><text x="470" y="152" text-anchor="middle" class="svg-accent" font-size="12">BMC</text>
</svg><p class="cap">Do leaves tak do data links, plus out-of-band network tak alag BMC link.</p></div>

<p>Virtualisation host ki taraf wala typical leaf port ek trunk hota hai jo host ke VLANs le jaata hai:</p>
<pre class="code"><span class="c">! ESXi host NIC1 ki taraf NX-OS port</span>
interface Ethernet1/10
  description ESX01-VMNIC0
  switchport mode trunk
  switchport trunk allowed vlan 10,20,30
  spanning-tree port type edge trunk
  mtu 9216
  no shutdown</pre>
<pre class="out">LEAF-01# show interface status | include Eth1/10
<span class="hl">Eth1/10       ESX01-VMNIC0       connected trunk     full    25G     SFP-H25GB-CU3M</span></pre>

<div class="warn"><p><b>Common galtiyan.</b> Server par LACP configure karna lekin switches par plain trunk (ya ulta): traffic flap karta hai ya ek link suspend ho jaata hai. BMC ko production VLAN mein laga dena. Yeh bhool jaana ki active/standby teaming wala server apni aadhi bandwidth hi use karta hai.</p></div>
<div class="exam"><p><b>Exam tip.</b> CIMC, iLO aur iDRAC sab BMCs hain: out-of-band, host OS se independent. CNA ek adapter par Ethernet aur FC/FCoE le jaata hai. Do switches ke across LACP bundle ke liye vPC jaisi multi-chassis technology chahiye.</p></div>

<div class="scn"><h4>PXE build jo "DHCP..." par atak gaya</h4><p>Bees naye hosts PXE screen par hamesha ke liye "DHCP..." dikhate rahe. Server team ne final ESXi build ke liye switch ports ko LACP port-channel ki tarah configure kiya tha. PXE ke dauraan NIC firmware LACP nahi bolta, isliye Nexus ne individual links ko suspend kar diya aur ek bhi DHCP packet rack se bahar nahi gaya. Engineer ne port-channel par <code>no lacp suspend-individual</code> joda taaki LACP banne se pehle single link forward kar sake, aur confirm kiya ki build VLAN native hai. Ek ghante mein saare bees hosts install ho gaye.</p><p><b>Seekh:</b> PXE, DHCP relay, native VLAN aur LACP behaviour ko server team ke saath milkar plan karna padta hai.</p></div>

<div class="iv"><p class="q">"BMC kya hai, aur woh alag network par kyun hota hai?"</p><p>Strong answer: baseboard management controller (CIMC, iLO ya iDRAC) power control, remote console, virtual media, sensors aur firmware ke liye ek independent controller hai, jo OS dead hone par bhi kaam karta hai. Yeh out-of-band network par hota hai taaki production fabric toot jaaye tab bhi aap servers tak pahunch kar unhe recover kar sako, aur security ke liye yeh powerful interfaces user traffic se isolated rahein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Server = CPUs (sockets aur cores), RAM, NICs, HBAs/CNAs, PCIe, local disks aur dual PSUs.</li>
<li>PCIe slot ki bandwidth tez NIC ko limit kar sakti hai; generation aur lane count check karo.</li>
<li>Rack servers standalone hain; blades power, cooling aur networking ke liye chassis share karte hain.</li>
<li>BMC (CIMC/iLO/iDRAC) out-of-band control deta hai aur OOB network par hi hona chahiye.</li>
<li>PXE ko DHCP reachability aur untagged build VLAN chahiye; dual-homing teaming/bonding use karta hai, aur do switches ke across LACP ke liye vPC chahiye.</li>
</ul></div>
`}};export{e as default};