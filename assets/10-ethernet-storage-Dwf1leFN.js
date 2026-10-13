var e={id:`ethernet`,h:{en:`Storage over Ethernet: FCoE with DCB, iSCSI, NFS and NVMe over Fabrics`,hi:`Ethernet par storage: DCB ke saath FCoE, iSCSI, NFS aur NVMe over Fabrics`},body:{en:`
<p>So far our disks travelled on a private courier network (Fibre Channel). Many data centers want to use the Ethernet "public roads" they already own. That works, but the roads must be made safe for fragile cargo. This chapter covers four ways to do it: carry FC frames inside Ethernet (<b>FCoE</b>), carry SCSI inside TCP (<b>iSCSI</b>), share files over IP (<b>NFS</b>), and the newest option, <b>NVMe over Fabrics</b>.</p>

<h3>FCoE: Fibre Channel inside Ethernet frames</h3>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="FCoE encapsulation">
<rect x="10" y="30" width="120" height="50" rx="6" fill="#e2e8f0"/><text x="70" y="52" text-anchor="middle" class="svg-ink" font-size="12">Ethernet header</text><text x="70" y="70" text-anchor="middle" class="svg-muted" font-size="12">802.1Q, CoS 3</text>
<rect x="130" y="30" width="110" height="50" rx="6" fill="#fde68a"/><text x="185" y="52" text-anchor="middle" class="svg-ink" font-size="12">FCoE header</text><text x="185" y="70" text-anchor="middle" class="svg-muted" font-size="12">Ethertype 0x8906</text>
<rect x="240" y="30" width="290" height="50" rx="6" fill="#bae6fd"/><text x="385" y="52" text-anchor="middle" class="svg-ink" font-size="12">Complete FC frame (header + up to 2112 B)</text><text x="385" y="70" text-anchor="middle" class="svg-muted" font-size="12">unchanged</text>
<rect x="530" y="30" width="100" height="50" rx="6" fill="#e2e8f0"/><text x="580" y="60" text-anchor="middle" class="svg-ink" font-size="12">EOF + FCS</text>
<text x="320" y="105" text-anchor="middle" class="svg-accent" font-size="12">Frame is about 2.2 KB, so FCoE links need a "baby jumbo" MTU of 2500</text>
</svg><p class="cap">FCoE keeps the FC frame intact and wraps it in Ethernet. It is layer 2 only and cannot be routed over IP.</p></div>
<p><b>FCoE</b> lets one converged 10/25/40/100G link carry both LAN and SAN traffic from a server's CNA (converged network adapter) to a Nexus switch or UCS fabric interconnect. Fewer adapters, cables and switch ports. Because FC must never lose a frame, the Ethernet link must be made lossless with <b>DCB</b> (Data Center Bridging):</p>
<ul>
<li><b>PFC</b> (Priority Flow Control, 802.1Qbb): a PAUSE per traffic class. When buffers fill, only the FCoE class (normally <b>CoS 3</b>) is paused; normal LAN traffic keeps flowing. It is the Ethernet cousin of buffer credits.</li>
<li><b>ETS</b> (Enhanced Transmission Selection, 802.1Qaz): guaranteed bandwidth shares per class, for example 50% FCoE and 50% LAN when both are busy.</li>
<li><b>DCBX</b> (DCB Exchange): uses LLDP to agree PFC and ETS settings between the switch and the adapter.</li>
</ul>
<p><b>FIP</b> (FCoE Initialization Protocol, Ethertype <b>0x8914</b>) is the control plane. The CNA uses FIP to discover the <b>FCoE VLAN</b>, find the <b>FCF</b> (FC forwarder, the switch function that terminates FCoE), and then perform FLOGI. The FCF answers with an FCID and a MAC address built from the FC-MAP (default 0E:FC:00) plus the FCID, called an <b>FPMA</b> (fabric provided MAC address).</p>
<p>On a Nexus switch the FC side of the server port is a <b>vFC</b> (virtual Fibre Channel) interface bound to the Ethernet port, and one dedicated VLAN is mapped to each VSAN:</p>
<pre class="code"><span class="c">! Nexus in fabric A: FCoE VLAN 1010 carries VSAN 10</span>
feature fcoe
vsan database
  vsan 10
vlan 1010
  fcoe vsan 10
interface ethernet1/11
  switchport mode trunk
  switchport trunk allowed vlan 10,1010
  spanning-tree port type edge trunk
  no shutdown
interface vfc11
  bind interface ethernet1/11
  no shutdown
vsan database
  vsan 10 interface vfc11</pre>
<p>After that the vFC behaves like an F_Port: <code>show flogi database</code> lists the CNA's WWPN on <code>vfc11</code>, and you zone it on the VSAN exactly as in chapter 6. Use a different FCoE VLAN per fabric (for example 1010 for A, 1020 for B) and never carry FCoE VLANs between fabrics.</p>

<h3>iSCSI: SCSI inside TCP</h3>
<p><b>iSCSI</b> puts SCSI commands into TCP, on port <b>3260</b>. It runs on any IP network with ordinary switches. The host is the <b>initiator</b> (software initiator in the hypervisor, or a hardware iSCSI HBA), the array port is the <b>target</b>, reached through a <b>portal</b> (IP address and port). Names are <b>IQNs</b>, for example <code>iqn.1998-01.com.vmware:esx01</code> or <code>iqn.2026-01.example.nk:array1</code>. Discovery is static or dynamic (SendTargets), and <b>CHAP</b> authenticates the initiator. Access control is IQN-based LUN masking on the array.</p>
<p>Best practice: two separate VLANs and subnets (path A and path B, like fabrics A and B), dedicated NICs with port binding and multipathing instead of LACP, <b>jumbo frames (MTU 9000) end to end</b>, no routing between initiator and target, and PFC or at least enough buffer and bandwidth to avoid drops.</p>
<div class="eg"><p><b>Worked example: why jumbo frames help.</b> A 1 MiB write is 1,048,576 bytes. With MTU 1500 each TCP segment carries at most 1,460 bytes of data, so the write needs about <b>719 frames</b>. With MTU 9000 each segment carries about 8,960 bytes, so about <b>118 frames</b>: roughly six times fewer frames, headers and interrupts. To test the path in ESXi: <code>vmkping -d -s 8972 192.0.2.50</code> (don't fragment, 8,972 bytes of payload + 28 bytes of IP/ICMP headers = 9,000). If it fails while a normal ping works, some hop has a smaller MTU.</p></div>

<h3>NFS: file access over IP</h3>
<p><b>NFS</b> gives file-level access: the storage system owns the file system and exports a directory; clients mount it. It uses TCP port <b>2049</b>. NFSv3 is stateless and simple (it also needs helper services such as the portmapper on port 111); NFSv4.1 is stateful, uses only port 2049, supports Kerberos authentication and session trunking across several connections. Access control is the <b>export policy</b> (which client IPs may mount, read-only or read-write). VMware can use NFS directly as a datastore, and AI and analytics platforms use NFS heavily. The network rules are the same as iSCSI: dedicated VLAN, jumbo frames, no congestion.</p>

<h3>NVMe and NVMe over Fabrics (concept)</h3>
<p><b>NVMe</b> is a command set designed for flash: up to 64K queues with 64K commands each, instead of SCSI's single deep queue. <b>NVMe over Fabrics</b> carries it across a network, with <b>namespaces</b> instead of LUNs and <b>NQNs</b> as names. Transports:</p>
<ul>
<li><b>FC-NVMe</b>: NVMe as an FC-4 protocol on the same FC fabric. The MDS, VSANs and zoning stay the same; the name server shows the NVMe FC-4 type. Hosts can run SCSI and NVMe over the same HBA.</li>
<li><b>NVMe/TCP</b>: over plain TCP/IP (IANA port 4420), no special NICs; the easiest Ethernet option.</li>
<li><b>NVMe/RoCEv2</b>: over RDMA on UDP (port 4791). Lowest latency, but it needs a lossless or well-tuned Ethernet (PFC and ECN).</li>
</ul>

<table class="cmp"><tr><th></th><th>FC</th><th>FCoE</th><th>iSCSI</th><th>NFS</th><th>NVMe/TCP</th></tr>
<tr><td>Type</td><td>Block</td><td>Block</td><td>Block</td><td>File</td><td>Block</td></tr>
<tr><td>Transport</td><td>FC fabric</td><td>Lossless Ethernet (DCB), L2 only</td><td>TCP 3260</td><td>TCP 2049</td><td>TCP 4420</td></tr>
<tr><td>Names</td><td>WWPN / FCID</td><td>WWPN / FCID + FPMA</td><td>IQN / IP</td><td>IP + export path</td><td>NQN / IP</td></tr>
<tr><td>Access control</td><td>Zoning + masking</td><td>Zoning + masking</td><td>CHAP + masking</td><td>Export policy</td><td>Host NQN mapping</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Enabling FCoE without a no-drop class and PFC on every hop. Carrying the FCoE VLAN on normal LAN trunks or across fabrics. Jumbo frames configured on the host and array but not on one switch in the middle. Putting iSCSI or NFS in a shared user VLAN, or bonding iSCSI NICs with LACP instead of using multipathing.</p></div>
<div class="exam"><p><b>Exam tip.</b> FCoE Ethertype 0x8906, FIP 0x8914; PFC = 802.1Qbb (per-priority pause), ETS = 802.1Qaz (bandwidth), DCBX negotiates via LLDP; FCoE typically CoS 3; vFC bound to an Ethernet port; one FCoE VLAN per VSAN. iSCSI TCP 3260, NFS TCP 2049.</p></div>

<div class="scn"><h4>The iSCSI datastore that hung on big copies</h4><p>A new ESXi cluster used iSCSI with MTU 9000. Small VMs worked, but copying large files hung for tens of seconds and the host logged path errors. Normal pings to the array worked. <code>vmkping -d -s 8972</code> failed. The engineer checked every hop: the host vmkernel port, the vSwitch, both leaf ports and the array ports were at 9000, but the new leaf pair's uplink to the storage leaf had been left at 1500. Large frames were dropped silently at that hop. After setting MTU 9216 on the uplinks, <code>vmkping -d -s 8972</code> succeeded and the copies ran at full speed.</p><p><b>Lesson:</b> jumbo frames must be end to end; test with a large don't-fragment ping, not a normal ping.</p></div>

<div class="iv"><p class="q">"What does DCB add to Ethernet for FCoE, and why is it needed?"</p><p>Strong answer: FC assumes no loss, but Ethernet drops on congestion. DCB adds PFC (802.1Qbb), which pauses only the FCoE priority (usually CoS 3) so it becomes lossless without stopping other traffic; ETS (802.1Qaz), which guarantees bandwidth per class; and DCBX, which negotiates these settings with LLDP. Add FIP for VLAN and FCF discovery and login, vFC interfaces bound to Ethernet ports, one dedicated FCoE VLAN per VSAN, and that FCoE is layer 2 only.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FCoE wraps complete FC frames in Ethernet (0x8906); FIP (0x8914) handles discovery and login; vFC interfaces and FCoE VLAN-to-VSAN mapping on Nexus.</li>
<li>DCB makes Ethernet lossless for FCoE: PFC per-priority pause, ETS bandwidth shares, DCBX negotiation.</li>
<li>iSCSI (TCP 3260) uses IQNs, CHAP and masking; use two VLANs, multipathing and end-to-end jumbo frames.</li>
<li>NFS (TCP 2049) is file access controlled by export policies; v4.1 adds sessions and Kerberos.</li>
<li>NVMe-oF uses namespaces and NQNs over FC-NVMe, NVMe/TCP or RoCEv2.</li>
</ul></div>
`,hi:`
<p>Ab tak hamari disks ek private courier network (Fibre Channel) par travel kar rahi thi. Bahut saare data centers woh Ethernet "public roads" use karna chahte hain jo unke paas pehle se hain. Yeh kaam karta hai, lekin roads ko nazuk saaman ke liye safe banana padta hai. Yeh chapter iske chaar tareeke cover karta hai: FC frames ko Ethernet ke andar le jaana (<b>FCoE</b>), SCSI ko TCP ke andar le jaana (<b>iSCSI</b>), IP par files share karna (<b>NFS</b>), aur sabse naya option, <b>NVMe over Fabrics</b>.</p>

<h3>FCoE: Ethernet frames ke andar Fibre Channel</h3>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="FCoE encapsulation">
<rect x="10" y="30" width="120" height="50" rx="6" fill="#e2e8f0"/><text x="70" y="52" text-anchor="middle" class="svg-ink" font-size="12">Ethernet header</text><text x="70" y="70" text-anchor="middle" class="svg-muted" font-size="12">802.1Q, CoS 3</text>
<rect x="130" y="30" width="110" height="50" rx="6" fill="#fde68a"/><text x="185" y="52" text-anchor="middle" class="svg-ink" font-size="12">FCoE header</text><text x="185" y="70" text-anchor="middle" class="svg-muted" font-size="12">Ethertype 0x8906</text>
<rect x="240" y="30" width="290" height="50" rx="6" fill="#bae6fd"/><text x="385" y="52" text-anchor="middle" class="svg-ink" font-size="12">Poora FC frame (header + 2112 B tak)</text><text x="385" y="70" text-anchor="middle" class="svg-muted" font-size="12">bina badlaav</text>
<rect x="530" y="30" width="100" height="50" rx="6" fill="#e2e8f0"/><text x="580" y="60" text-anchor="middle" class="svg-ink" font-size="12">EOF + FCS</text>
<text x="320" y="105" text-anchor="middle" class="svg-accent" font-size="12">Frame lagbhag 2.2 KB ka hai, isliye FCoE links ko 2500 ka "baby jumbo" MTU chahiye</text>
</svg><p class="cap">FCoE FC frame ko intact rakhta hai aur use Ethernet mein wrap karta hai. Yeh sirf layer 2 hai aur IP par route nahi ho sakta.</p></div>
<p><b>FCoE</b> ek converged 10/25/40/100G link ko server ke CNA (converged network adapter) se Nexus switch ya UCS fabric interconnect tak LAN aur SAN dono traffic le jaane deta hai. Kam adapters, cables aur switch ports. Kyunki FC kabhi frame nahi kho sakta, Ethernet link ko <b>DCB</b> (Data Center Bridging) se lossless banana padta hai:</p>
<ul>
<li><b>PFC</b> (Priority Flow Control, 802.1Qbb): har traffic class ke liye ek PAUSE. Jab buffers bharte hain, sirf FCoE class (normally <b>CoS 3</b>) pause hoti hai; normal LAN traffic chalta rehta hai. Yeh buffer credits ka Ethernet wala cousin hai.</li>
<li><b>ETS</b> (Enhanced Transmission Selection, 802.1Qaz): har class ke guaranteed bandwidth shares, jaise dono busy hon to 50% FCoE aur 50% LAN.</li>
<li><b>DCBX</b> (DCB Exchange): switch aur adapter ke beech PFC aur ETS settings tay karne ke liye LLDP use karta hai.</li>
</ul>
<p><b>FIP</b> (FCoE Initialization Protocol, Ethertype <b>0x8914</b>) control plane hai. CNA FIP se <b>FCoE VLAN</b> discover karta hai, <b>FCF</b> (FC forwarder, switch ka woh function jo FCoE terminate karta hai) dhoondhta hai, aur phir FLOGI karta hai. FCF ek FCID aur FC-MAP (default 0E:FC:00) plus FCID se bana MAC address deta hai, jise <b>FPMA</b> (fabric provided MAC address) kehte hain.</p>
<p>Nexus switch par server port ki FC side ek <b>vFC</b> (virtual Fibre Channel) interface hoti hai jo Ethernet port se bound hoti hai, aur har VSAN se ek dedicated VLAN map hota hai:</p>
<pre class="code"><span class="c">! fabric A mein Nexus: FCoE VLAN 1010 VSAN 10 le jaata hai</span>
feature fcoe
vsan database
  vsan 10
vlan 1010
  fcoe vsan 10
interface ethernet1/11
  switchport mode trunk
  switchport trunk allowed vlan 10,1010
  spanning-tree port type edge trunk
  no shutdown
interface vfc11
  bind interface ethernet1/11
  no shutdown
vsan database
  vsan 10 interface vfc11</pre>
<p>Uske baad vFC F_Port ki tarah behave karta hai: <code>show flogi database</code> CNA ka WWPN <code>vfc11</code> par list karta hai, aur aap use VSAN par bilkul chapter 6 ki tarah zone karte ho. Har fabric ke liye alag FCoE VLAN use karo (jaise A ke liye 1010, B ke liye 1020) aur FCoE VLANs ko kabhi fabrics ke beech mat le jao.</p>

<h3>iSCSI: TCP ke andar SCSI</h3>
<p><b>iSCSI</b> SCSI commands ko TCP mein, port <b>3260</b> par daalta hai. Yeh ordinary switches wale kisi bhi IP network par chalta hai. Host <b>initiator</b> hai (hypervisor mein software initiator, ya hardware iSCSI HBA), array port <b>target</b> hai, jis tak ek <b>portal</b> (IP address aur port) se pahuncha jaata hai. Naam <b>IQNs</b> hote hain, jaise <code>iqn.1998-01.com.vmware:esx01</code> ya <code>iqn.2026-01.example.nk:array1</code>. Discovery static ya dynamic (SendTargets) hoti hai, aur <b>CHAP</b> initiator ko authenticate karta hai. Access control array par IQN-based LUN masking hai.</p>
<p>Best practice: do alag VLANs aur subnets (path A aur path B, fabrics A aur B ki tarah), LACP ke bajaye port binding aur multipathing ke saath dedicated NICs, <b>end to end jumbo frames (MTU 9000)</b>, initiator aur target ke beech koi routing nahi, aur drops se bachne ke liye PFC ya kam se kam kaafi buffer aur bandwidth.</p>
<div class="eg"><p><b>Worked example: jumbo frames kyun madad karte hain.</b> 1 MiB write 1,048,576 bytes ka hai. MTU 1500 ke saath har TCP segment zyada se zyada 1,460 bytes data le jaata hai, isliye write ko lagbhag <b>719 frames</b> chahiye. MTU 9000 ke saath har segment lagbhag 8,960 bytes le jaata hai, to lagbhag <b>118 frames</b>: lagbhag chhe guna kam frames, headers aur interrupts. ESXi mein path test karne ke liye: <code>vmkping -d -s 8972 192.0.2.50</code> (don't fragment, 8,972 bytes payload + 28 bytes IP/ICMP headers = 9,000). Agar yeh fail ho jabki normal ping kaam kare, to kisi hop ka MTU chhota hai.</p></div>

<h3>NFS: IP par file access</h3>
<p><b>NFS</b> file-level access deta hai: storage system file system ka maalik hota hai aur ek directory export karta hai; clients use mount karte hain. Yeh TCP port <b>2049</b> use karta hai. NFSv3 stateless aur simple hai (ise portmapper jaisi helper services bhi chahiye, port 111 par); NFSv4.1 stateful hai, sirf port 2049 use karta hai, Kerberos authentication aur kai connections par session trunking support karta hai. Access control <b>export policy</b> hai (kaunse client IPs mount kar sakte hain, read-only ya read-write). VMware NFS ko seedha datastore ki tarah use kar sakta hai, aur AI aur analytics platforms NFS bahut use karte hain. Network rules iSCSI jaise hi hain: dedicated VLAN, jumbo frames, koi congestion nahi.</p>

<h3>NVMe aur NVMe over Fabrics (concept)</h3>
<p><b>NVMe</b> flash ke liye design kiya gaya command set hai: SCSI ki ek deep queue ke bajaye 64K commands wali 64K queues tak. <b>NVMe over Fabrics</b> ise network ke across le jaata hai, LUNs ki jagah <b>namespaces</b> aur naamon ki tarah <b>NQNs</b> ke saath. Transports:</p>
<ul>
<li><b>FC-NVMe</b>: same FC fabric par FC-4 protocol ki tarah NVMe. MDS, VSANs aur zoning same rehte hain; name server NVMe FC-4 type dikhata hai. Hosts same HBA par SCSI aur NVMe dono chala sakte hain.</li>
<li><b>NVMe/TCP</b>: plain TCP/IP par (IANA port 4420), koi special NICs nahi; sabse aasaan Ethernet option.</li>
<li><b>NVMe/RoCEv2</b>: UDP (port 4791) par RDMA ke upar. Sabse kam latency, lekin ise lossless ya achhi tarah tuned Ethernet (PFC aur ECN) chahiye.</li>
</ul>

<table class="cmp"><tr><th></th><th>FC</th><th>FCoE</th><th>iSCSI</th><th>NFS</th><th>NVMe/TCP</th></tr>
<tr><td>Type</td><td>Block</td><td>Block</td><td>Block</td><td>File</td><td>Block</td></tr>
<tr><td>Transport</td><td>FC fabric</td><td>Lossless Ethernet (DCB), sirf L2</td><td>TCP 3260</td><td>TCP 2049</td><td>TCP 4420</td></tr>
<tr><td>Naam</td><td>WWPN / FCID</td><td>WWPN / FCID + FPMA</td><td>IQN / IP</td><td>IP + export path</td><td>NQN / IP</td></tr>
<tr><td>Access control</td><td>Zoning + masking</td><td>Zoning + masking</td><td>CHAP + masking</td><td>Export policy</td><td>Host NQN mapping</td></tr>
</table>

<div class="warn"><p><b>Common galtiyan.</b> Har hop par no-drop class aur PFC ke bina FCoE enable karna. FCoE VLAN ko normal LAN trunks par ya fabrics ke across le jaana. Jumbo frames host aur array par configure karna lekin beech ke ek switch par nahi. iSCSI ya NFS ko shared user VLAN mein daalna, ya multipathing ke bajaye iSCSI NICs ko LACP se bond karna.</p></div>
<div class="exam"><p><b>Exam tip.</b> FCoE Ethertype 0x8906, FIP 0x8914; PFC = 802.1Qbb (per-priority pause), ETS = 802.1Qaz (bandwidth), DCBX LLDP se negotiate karta hai; FCoE aam taur par CoS 3; vFC Ethernet port se bound; har VSAN ke liye ek FCoE VLAN. iSCSI TCP 3260, NFS TCP 2049.</p></div>

<div class="scn"><h4>Woh iSCSI datastore jo badi copies par atakta tha</h4><p>Ek naya ESXi cluster MTU 9000 ke saath iSCSI use karta tha. Chhoti VMs kaam karti thi, lekin badi files copy karna dasiyon seconds ke liye atak jaata tha aur host path errors log karta tha. Array tak normal pings kaam karte the. <code>vmkping -d -s 8972</code> fail hua. Engineer ne har hop check kiya: host vmkernel port, vSwitch, dono leaf ports aur array ports 9000 par the, lekin naye leaf pair ka storage leaf tak uplink 1500 par chhoot gaya tha. Us hop par bade frames chupchaap drop ho rahe the. Uplinks par MTU 9216 set karne ke baad <code>vmkping -d -s 8972</code> succeed hua aur copies full speed par chali.</p><p><b>Seekh:</b> jumbo frames end to end hone chahiye; normal ping se nahi, bade don't-fragment ping se test karo.</p></div>

<div class="iv"><p class="q">"DCB FCoE ke liye Ethernet mein kya jodta hai, aur yeh kyun zaroori hai?"</p><p>Strong answer: FC loss nahi maanta, lekin Ethernet congestion par drop karta hai. DCB PFC (802.1Qbb) jodta hai, jo sirf FCoE priority (aam taur par CoS 3) ko pause karta hai taaki woh doosre traffic ko roke bina lossless ho jaaye; ETS (802.1Qaz), jo har class ki bandwidth guarantee karta hai; aur DCBX, jo in settings ko LLDP se negotiate karta hai. VLAN aur FCF discovery aur login ke liye FIP, Ethernet ports se bound vFC interfaces, har VSAN ke liye ek dedicated FCoE VLAN, aur yeh ki FCoE sirf layer 2 hai, yeh bhi jodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FCoE poore FC frames ko Ethernet mein wrap karta hai (0x8906); FIP (0x8914) discovery aur login handle karta hai; Nexus par vFC interfaces aur FCoE VLAN-to-VSAN mapping.</li>
<li>DCB Ethernet ko FCoE ke liye lossless banata hai: PFC per-priority pause, ETS bandwidth shares, DCBX negotiation.</li>
<li>iSCSI (TCP 3260) IQNs, CHAP aur masking use karta hai; do VLANs, multipathing aur end-to-end jumbo frames use karo.</li>
<li>NFS (TCP 2049) export policies se controlled file access hai; v4.1 sessions aur Kerberos jodta hai.</li>
<li>NVMe-oF FC-NVMe, NVMe/TCP ya RoCEv2 par namespaces aur NQNs use karta hai.</li>
</ul></div>
`}};export{e as default};