var e={id:`vni-vtep`,h:{en:`VNIs, VTEPs and the VXLAN packet on IOS XE`,hi:`VNIs, VTEPs aur IOS XE par VXLAN packet`},body:{en:`
<p>Think of a courier company. Inside a building, a parcel is addressed "Desk 14, Finance". To send it to another city, the company puts it in a bigger box with a city address on the outside and a customer-account number on a sticker. The sorting hubs read only the outside address. At the destination, the box is opened and the parcel goes to Desk 14. In VXLAN the parcel is the Ethernet frame, the outside address is the VTEP IP pair, and the account sticker is the <b>VNI</b>.</p>

<h3>Building blocks</h3>
<dl class="terms">
<dt>VLAN</dt><dd>Local Layer 2 segment on one switch. 12-bit ID, 4094 usable. VLAN numbers have only local meaning in VXLAN.</dd>
<dt>VNI</dt><dd>VXLAN Network Identifier. A 24-bit segment number, about 16 million values. The VNI is what must match across leaves.</dd>
<dt>VTEP</dt><dd>VXLAN Tunnel End Point. The device that encapsulates frames into VXLAN and decapsulates them. In our fabric each leaf is a VTEP.</dd>
<dt>NVE</dt><dd>Network Virtualization Edge. The logical interface that represents the VTEP on the switch: <code>interface nve1</code>.</dd>
<dt>L2VNI</dt><dd>A VNI that stretches one VLAN (Layer 2 bridging). The tenant segments 10010 and 10020 are L2VNIs.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="VXLAN packet layers">
<rect x="20" y="40" width="100" height="50" fill="#e2e8f0" stroke="#64748b"/><text x="70" y="62" text-anchor="middle" class="svg-ink" font-size="12">Outer Eth</text><text x="70" y="78" text-anchor="middle" class="svg-muted" font-size="12">14 B</text>
<rect x="120" y="40" width="100" height="50" fill="#bae6fd" stroke="#64748b"/><text x="170" y="62" text-anchor="middle" class="svg-ink" font-size="12">Outer IP</text><text x="170" y="78" text-anchor="middle" class="svg-muted" font-size="12">20 B</text>
<rect x="220" y="40" width="90" height="50" fill="#ddd6fe" stroke="#64748b"/><text x="265" y="62" text-anchor="middle" class="svg-ink" font-size="12">UDP 4789</text><text x="265" y="78" text-anchor="middle" class="svg-muted" font-size="12">8 B</text>
<rect x="310" y="40" width="100" height="50" fill="#fde68a" stroke="#64748b"/><text x="360" y="62" text-anchor="middle" class="svg-ink" font-size="12">VXLAN hdr</text><text x="360" y="78" text-anchor="middle" class="svg-muted" font-size="12">VNI, 8 B</text>
<rect x="410" y="40" width="210" height="50" fill="#bbf7d0" stroke="#64748b"/><text x="515" y="62" text-anchor="middle" class="svg-ink" font-size="12">Original frame from host</text><text x="515" y="78" text-anchor="middle" class="svg-muted" font-size="12">inner Eth + IP + payload</text>
<text x="170" y="120" text-anchor="middle" class="svg-accent" font-size="12">src 10.255.1.11  dst 10.255.1.12</text>
<text x="360" y="145" text-anchor="middle" class="svg-muted" font-size="12">Overhead = 14 + 20 + 8 + 8 = 50 bytes</text>
</svg><p class="cap">The spines read only the outer IP header.</p></div>

<h3>Mapping a VLAN to a VNI on IOS XE-style switches</h3>
<p>The VLAN-to-VNI binding is made in <code>vlan configuration</code> mode and an EVPN instance. In this module the instance supplies the L2VNI and the replication list; the BGP part comes in the next module.</p>
<pre class="code"><span class="c">! LEAF1: VLAN 10 becomes VNI 10010</span>
vlan 10
 name TENANT-A-WEB
l2vpn evpn instance 10 vlan-based
 encapsulation vxlan
vlan configuration 10
 member evpn-instance 10 vni 10010
<span class="c">! The VTEP itself</span>
interface Loopback1
 ip address 10.255.1.11 255.255.255.255
interface nve1
 no ip address
 source-interface Loopback1
 member vni 10010 ingress-replication</pre>

<div class="eg"><p><b>Worked example: VLAN need not match, VNI must.</b> LEAF1 puts H1 in VLAN 10, but suppose LEAF3 used VLAN 110 for the same tenant segment. If both bind to VNI 10010 the segment still works, because only the VNI travels in the packet. We keep VLAN 10 everywhere in this track for simplicity, but you should know the VLAN is local.</p></div>

<h3>Why the VTEP uses a loopback</h3>
<p>The VTEP address must stay up as long as the switch has any working uplink. A physical interface address disappears when that interface fails; a loopback is always reachable through every uplink thanks to ECMP. That is why the router-id loopback (Lo0) and the VTEP loopback (Lo1) are separate: Lo1 is advertised in the underlay and is the tunnel endpoint.</p>

<h3>The UDP port and entropy</h3>
<p>The UDP destination is 4789. The UDP <b>source</b> port is a hash of the inner frame's headers, so different flows get different source ports and the spines spread them across both uplinks (ECMP). One huge flow still stays on one path, many small flows spread out.</p>

<pre class="out">LEAF1# show nve interface nve1
Interface: nve1, State: Admin Up, Oper Up, Encapsulation: Vxlan,
 BGP host reachability: Disabled, VxLAN dport: 4789
 VNI number: L2CP 0 L3CP 0 L2DP 1 L3DP 0
 source-interface: Loopback1 (primary: <span class="hl">10.255.1.11</span> vrf: 0)
 Pkts In   Bytes In   Pkts Out  Bytes Out
 0         0          0         0</pre>
<p>Check three things: Oper Up, the right source address, and the VNI counters ("L2DP 1" means one data-plane L2VNI, our flood-and-learn mode).</p>

<div class="warn"><p><b>Common mistake.</b> Using Lo0 as the VTEP source because "it is already in OSPF". It works until you need a separate anycast or per-VTEP address; our track keeps Lo1 for the VTEP so troubleshooting is clear.</p></div>

<div class="exam"><p><b>Exam trap.</b> The VNI is carried in the VXLAN header; the VLAN ID is not. And the 50-byte overhead means the underlay MTU must be at least 1550 for 1500-byte hosts (jumbo is normal).</p></div>

<div class="scn"><h4>One VNI, two VLAN numbers</h4><p>After a merger, LEAF3 used VLAN 210 for the web tier while LEAF1 used VLAN 10. An engineer "fixed" the mismatch by renumbering, and a short outage followed. Later a colleague pointed out the original config was fine: both VLANs were bound to VNI 10010 and traffic flowed. The real fault had been a typo, VNI 10001 on LEAF3.</p><p><b>Lesson:</b> compare VNIs, not VLAN numbers, when two leaves cannot talk.</p></div>

<div class="iv"><p class="q">"What is the difference between a VLAN, a VNI and a VTEP?"</p><p>Strong answer: a VLAN is a local 12-bit Layer 2 segment, a VNI is the 24-bit fabric-wide segment ID carried in the VXLAN header, and a VTEP is the device or interface that maps one to the other and does the encapsulation. The binding is per leaf; the VNI is what must agree.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VNI is 24 bits; VLAN is local, VNI is global.</li>
<li>VTEP = nve1 sourced from a loopback (Lo1 here).</li>
<li>Overhead is 50 bytes; UDP destination is 4789; source port is a hash.</li>
<li>Binding: vlan configuration, member evpn-instance, vni; nve1 member vni.</li>
</ul></div>
`,hi:`
<p>Ek courier company socho. Building ke andar parcel par likha hota hai "Desk 14, Finance". Doosre shehar bhejna ho to company use ek bade box mein rakhti hai jis par bahar shehar ka address aur customer-account number ka sticker hota hai. Sorting hubs sirf bahar ka address padhte hain. Destination par box khulta hai aur parcel Desk 14 par jaata hai. VXLAN mein parcel Ethernet frame hai, bahar ka address VTEP IP pair hai, aur account sticker <b>VNI</b> hai.</p>

<h3>Building blocks</h3>
<dl class="terms">
<dt>VLAN</dt><dd>Ek switch ka local Layer 2 segment. 12-bit ID, 4094 usable. VXLAN mein VLAN number ka sirf local matlab hota hai.</dd>
<dt>VNI</dt><dd>VXLAN Network Identifier. 24-bit segment number, lagbhag 16 million values. Leaves ke beech VNI hi match hona chahiye.</dd>
<dt>VTEP</dt><dd>VXLAN Tunnel End Point. Woh device jo frames ko VXLAN mein encapsulate aur decapsulate karta hai. Hamare fabric mein har leaf ek VTEP hai.</dd>
<dt>NVE</dt><dd>Network Virtualization Edge. Switch par VTEP ko represent karne wala logical interface: <code>interface nve1</code>.</dd>
<dt>L2VNI</dt><dd>Aisa VNI jo ek VLAN ko stretch karta hai (Layer 2 bridging). Tenant segments 10010 aur 10020 L2VNIs hain.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="VXLAN packet layers">
<rect x="20" y="40" width="100" height="50" fill="#e2e8f0" stroke="#64748b"/><text x="70" y="62" text-anchor="middle" class="svg-ink" font-size="12">Outer Eth</text><text x="70" y="78" text-anchor="middle" class="svg-muted" font-size="12">14 B</text>
<rect x="120" y="40" width="100" height="50" fill="#bae6fd" stroke="#64748b"/><text x="170" y="62" text-anchor="middle" class="svg-ink" font-size="12">Outer IP</text><text x="170" y="78" text-anchor="middle" class="svg-muted" font-size="12">20 B</text>
<rect x="220" y="40" width="90" height="50" fill="#ddd6fe" stroke="#64748b"/><text x="265" y="62" text-anchor="middle" class="svg-ink" font-size="12">UDP 4789</text><text x="265" y="78" text-anchor="middle" class="svg-muted" font-size="12">8 B</text>
<rect x="310" y="40" width="100" height="50" fill="#fde68a" stroke="#64748b"/><text x="360" y="62" text-anchor="middle" class="svg-ink" font-size="12">VXLAN hdr</text><text x="360" y="78" text-anchor="middle" class="svg-muted" font-size="12">VNI, 8 B</text>
<rect x="410" y="40" width="210" height="50" fill="#bbf7d0" stroke="#64748b"/><text x="515" y="62" text-anchor="middle" class="svg-ink" font-size="12">Host ka original frame</text><text x="515" y="78" text-anchor="middle" class="svg-muted" font-size="12">inner Eth + IP + payload</text>
<text x="170" y="120" text-anchor="middle" class="svg-accent" font-size="12">src 10.255.1.11  dst 10.255.1.12</text>
<text x="360" y="145" text-anchor="middle" class="svg-muted" font-size="12">Overhead = 14 + 20 + 8 + 8 = 50 bytes</text>
</svg><p class="cap">Spines sirf outer IP header padhte hain.</p></div>

<h3>IOS XE-style switches par VLAN ko VNI se map karna</h3>
<p>VLAN-to-VNI binding <code>vlan configuration</code> mode aur ek EVPN instance mein hoti hai. Is module mein instance L2VNI aur replication list deta hai; BGP wala hissa agle module mein aata hai.</p>
<pre class="code"><span class="c">! LEAF1: VLAN 10 ban jaata hai VNI 10010</span>
vlan 10
 name TENANT-A-WEB
l2vpn evpn instance 10 vlan-based
 encapsulation vxlan
vlan configuration 10
 member evpn-instance 10 vni 10010
<span class="c">! VTEP khud</span>
interface Loopback1
 ip address 10.255.1.11 255.255.255.255
interface nve1
 no ip address
 source-interface Loopback1
 member vni 10010 ingress-replication</pre>

<div class="eg"><p><b>Worked example: VLAN match karna zaroori nahi, VNI zaroori hai.</b> LEAF1 H1 ko VLAN 10 mein rakhta hai, lekin maano LEAF3 same tenant segment ke liye VLAN 110 use kare. Agar dono VNI 10010 se bind hain to segment phir bhi chalta hai, kyunki packet mein sirf VNI jaata hai. Is track mein hum simplicity ke liye har jagah VLAN 10 rakhte hain, lekin yaad rakho ki VLAN local hai.</p></div>

<h3>VTEP loopback kyun use karta hai</h3>
<p>VTEP address tab tak up rehna chahiye jab tak switch ka koi bhi uplink kaam kar raha ho. Physical interface ka address us interface ke fail hone par gayab ho jaata hai; loopback ECMP ki wajah se har uplink se reachable rehta hai. Isliye router-id loopback (Lo0) aur VTEP loopback (Lo1) alag hain: Lo1 underlay mein advertise hota hai aur tunnel endpoint hai.</p>

<h3>UDP port aur entropy</h3>
<p>UDP destination 4789 hai. UDP <b>source</b> port inner frame ke headers ka hash hota hai, isliye alag flows ko alag source ports milte hain aur spines unhe dono uplinks par baant dete hain (ECMP). Ek bahut bada flow ek hi path par rehta hai, bahut saare chhote flows phail jaate hain.</p>

<pre class="out">LEAF1# show nve interface nve1
Interface: nve1, State: Admin Up, Oper Up, Encapsulation: Vxlan,
 BGP host reachability: Disabled, VxLAN dport: 4789
 VNI number: L2CP 0 L3CP 0 L2DP 1 L3DP 0
 source-interface: Loopback1 (primary: <span class="hl">10.255.1.11</span> vrf: 0)
 Pkts In   Bytes In   Pkts Out  Bytes Out
 0         0          0         0</pre>
<p>Teen cheezein check karo: Oper Up, sahi source address, aur VNI counters ("L2DP 1" matlab ek data-plane L2VNI, yaani hamara flood-and-learn mode).</p>

<div class="warn"><p><b>Common galti.</b> Lo0 ko VTEP source bana dena kyunki "woh pehle se OSPF mein hai". Yeh chalta hai jab tak alag anycast ya per-VTEP address ki zaroorat na pade; hamare track mein VTEP ke liye Lo1 rakha hai taaki troubleshooting saaf rahe.</p></div>

<div class="exam"><p><b>Exam trap.</b> VNI VXLAN header mein jaata hai; VLAN ID nahi jaata. Aur 50-byte overhead ka matlab hai 1500-byte hosts ke liye underlay MTU kam se kam 1550 chahiye (jumbo normal hai).</p></div>

<div class="scn"><h4>Ek VNI, do VLAN numbers</h4><p>Merger ke baad LEAF3 ne web tier ke liye VLAN 210 use kiya jabki LEAF1 VLAN 10 use karta tha. Ek engineer ne mismatch "theek" karne ke liye renumber kiya aur thodi der outage hua. Baad mein ek colleague ne bataya ki original config theek tha: dono VLANs VNI 10010 se bound the aur traffic chal raha tha. Asli fault ek typo tha, LEAF3 par VNI 10001.</p><p><b>Seekh:</b> jab do leaves baat na kar paayein to VLAN numbers nahi, VNIs compare karo.</p></div>

<div class="iv"><p class="q">"VLAN, VNI aur VTEP mein kya fark hai?"</p><p>Strong answer: VLAN local 12-bit Layer 2 segment hai, VNI VXLAN header mein jaane wala 24-bit fabric-wide segment ID hai, aur VTEP woh device ya interface hai jo ek ko doosre se map karke encapsulation karta hai. Binding per leaf hoti hai; VNI hi agree hona chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VNI 24 bits ka hai; VLAN local hai, VNI global hai.</li>
<li>VTEP = loopback (yahan Lo1) se sourced nve1.</li>
<li>Overhead 50 bytes; UDP destination 4789; source port hash hota hai.</li>
<li>Binding: vlan configuration, member evpn-instance, vni; nve1 member vni.</li>
</ul></div>
`}};export{e as default};