var e={id:`why-vxlan`,h:{en:`Why VXLAN: overlay, underlay, VNI and VTEP`,hi:`VXLAN kyun: overlay, underlay, VNI aur VTEP`},body:{en:`
<p>Before any configuration, you need to feel the problem that VXLAN solves. Old data centres were built with VLANs and spanning tree. That design has four limits, and each one hurts more as the data centre grows.</p>
<ul>
<li><b>Only 4094 VLANs.</b> The VLAN ID is 12 bits. A cloud provider with thousands of customers runs out fast.</li>
<li><b>Spanning tree blocks links.</b> STP stops loops by switching off redundant links. You buy two uplinks and use one.</li>
<li><b>One big failure domain.</b> A broadcast storm or a loop in one rack can reach every rack that carries the VLAN.</li>
<li><b>MAC table size.</b> Every switch on the VLAN learns every host MAC.</li>
</ul>
<p>The modern answer is a <b>routed leaf-spine fabric</b>. Every link between a leaf and a spine is a Layer 3 point-to-point link. Routing protocols use <b>ECMP</b> (equal-cost multipath), so all links carry traffic. No STP is needed because there is no Layer 2 loop to prevent. But applications still ask for the same subnet in many racks, for example for virtual machine mobility. VXLAN gives them that.</p>

<h3>Overlay and underlay</h3>
<p>Two words appear in every EVPN conversation. The <b>underlay</b> is the real IP network: loopbacks, /31 links, and an IGP such as OSPF. Its only job is to deliver an IP packet from one leaf loopback to another. The <b>overlay</b> is the virtual network built on top: the VXLAN tunnels and the BGP EVPN sessions. Tenant traffic lives in the overlay. The spine only sees outer IP packets between loopbacks and never learns a host MAC.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Overlay above underlay">
<rect x="20" y="20" width="600" height="70" rx="12" fill="#ddd6fe"/><text x="40" y="45" class="svg-ink" font-size="14">OVERLAY</text><text x="40" y="68" class="svg-muted" font-size="12">VXLAN tunnels (VNI 1010) + BGP EVPN sessions between loopbacks</text>
<rect x="20" y="110" width="600" height="80" rx="12" fill="#bae6fd"/><text x="40" y="135" class="svg-ink" font-size="14">UNDERLAY</text><text x="40" y="158" class="svg-muted" font-size="12">Routed IP fabric: OSPF on /31 links and lo0, ECMP, jumbo MTU</text>
<line x1="150" y1="90" x2="150" y2="110" stroke="#64748b" stroke-width="2"/><line x1="490" y1="90" x2="490" y2="110" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The overlay rides on the underlay. Fix the underlay first when the overlay breaks.</p></div>

<h3>The VXLAN packet</h3>
<p>VXLAN (RFC 7348) wraps an entire Ethernet frame. The ingress leaf adds, from the inside out: an 8-byte <b>VXLAN header</b> that carries the <b>VNI</b>, a UDP header with destination port <code>4789</code>, an outer IP header, and an outer Ethernet header. The source UDP port is derived from a hash of the inner frame, so ECMP in the underlay can spread different flows over different links.</p>
<ul>
<li><b>VNI</b> (VXLAN Network Identifier): 24 bits, so about 16 million segments, against 4094 VLANs. On Junos each VLAN is mapped to one VNI: <code>set vlans V10 vxlan vni 1010</code>.</li>
<li><b>VTEP</b> (VXLAN tunnel end point): the device that encapsulates and decapsulates. On a Junos leaf the VTEP address is the loopback, chosen with <code>set switch-options vtep-source-interface lo0.0</code>.</li>
<li><b>Overhead:</b> VXLAN adds about 50 bytes (14 outer Ethernet, 20 outer IP, 8 UDP, 8 VXLAN). A 1500-byte host frame needs an underlay MTU of at least 1550. Use jumbo frames (for example 9192) on fabric links.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> In pod 30, PC1 (10.30.10.21) sends an ARP request. LEAF1 sees a broadcast in V10, which is VNI 1010. It adds the VXLAN header with VNI 1010, UDP 4789, outer source 10.30.255.11 and outer destination 10.30.255.12. The spine reads only the outer IP header, routes it, and LEAF2 removes the wrapper. The VNI in the header tells LEAF2 which VLAN (V10) to deliver the frame into. Capture on the fabric link: the hosts appear only in the inner frame.</p></div>

<h3>Flood-and-learn versus EVPN</h3>
<p>Plain VXLAN has no way to know which VTEP holds a MAC. It either floods unknown frames to every VTEP using multicast in the underlay, or it replicates them one by one. It learns remote MACs from the data plane, the same way a normal switch does. That scales poorly and gives you no policy.</p>
<p><b>EVPN</b> replaces this with a control plane. When LEAF2 learns a local MAC, it tells everyone through a BGP route. When a leaf comes up and serves a VNI, it announces itself. Learning becomes routing: you get route targets, policy and fast convergence. The next chapters show how.</p>

<div class="tbl"><table class="cmp"><tr><th>Question</th><th>Plain VLAN trunk</th><th>EVPN-VXLAN</th></tr>
<tr><td>Segments</td><td>4094</td><td>About 16 million VNIs</td></tr>
<tr><td>Loop prevention</td><td>Spanning tree</td><td>Routed underlay, no L2 loop</td></tr>
<tr><td>Uplink use</td><td>One active</td><td>All links, ECMP</td></tr>
<tr><td>MAC learning</td><td>Data plane flood</td><td>BGP control plane</td></tr>
<tr><td>Failure domain</td><td>Whole VLAN</td><td>Per leaf and per VNI</td></tr></table></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting MTU. Pings work, small transfers work, then a file copy hangs because 1500-byte frames plus 50 bytes of VXLAN exceed a 1500-byte underlay MTU. Always raise the fabric MTU first.</p></div>

<div class="exam"><p><b>Exam trap.</b> The VNI is 24 bits and lives in the VXLAN header. The VLAN ID is 12 bits and is local to a switch. Two leaves can use different VLAN IDs for the same VNI on Junos, but the VNI must match. The UDP port is 4789, not 4780 or 8472.</p></div>

<div class="scn"><h4>The file copy that froze</h4><p>After a new fabric went live in Pune, users could ping and browse but large database backups stalled at 1.4 MB. Ping with a large size and the do-not-fragment bit failed above 1472 bytes. The engineer found the leaf-to-spine links still at the default 1514 MTU. Setting <code>mtu 9192</code> on every fabric interface fixed it at once.</p><p><b>Lesson:</b> VXLAN needs a larger underlay MTU. Test with big pings early.</p></div>

<div class="iv"><p class="q">"What is the difference between a VLAN, a VNI and a VTEP?"</p><p>A VLAN is a local 12-bit Layer 2 segment on a switch. A VNI is the 24-bit identifier that carries that segment across the fabric inside the VXLAN header. A VTEP is the device, usually the leaf loopback, that adds and removes the VXLAN wrapper. Add the 50-byte overhead and MTU point to show depth.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VXLAN removes VLAN limits, STP blocking and large failure domains by tunnelling over routed IP.</li>
<li>Underlay = IP reachability between loopbacks; overlay = VXLAN plus BGP EVPN.</li>
<li>VXLAN header carries a 24-bit VNI; transport is UDP port 4789.</li>
<li>Overhead is about 50 bytes, so raise the underlay MTU.</li>
<li>EVPN replaces flood-and-learn with BGP-advertised MAC and VTEP information.</li>
</ul></div>
`,hi:`
<p>Koi bhi configuration karne se pehle aapko woh problem samajhni hai jo VXLAN solve karta hai. Purane data centres VLANs aur spanning tree se bante the. Us design mein chaar limits hain, aur data centre bada hone par har ek zyada dukh deti hai.</p>
<ul>
<li><b>Sirf 4094 VLANs.</b> VLAN ID 12 bits ka hai. Hazaron customers wala cloud provider jaldi khatam kar deta hai.</li>
<li><b>Spanning tree links block karta hai.</b> STP redundant links band karke loops rokta hai. Aap do uplinks kharidte ho aur ek use karte ho.</li>
<li><b>Ek bada failure domain.</b> Ek rack mein broadcast storm ya loop har us rack tak pahunch sakta hai jo woh VLAN carry karta hai.</li>
<li><b>MAC table size.</b> VLAN ka har switch har host MAC seekhta hai.</li>
</ul>
<p>Modern jawab hai <b>routed leaf-spine fabric</b>. Leaf aur spine ke beech har link Layer 3 point-to-point link hai. Routing protocols <b>ECMP</b> (equal-cost multipath) use karte hain, to saare links traffic carry karte hain. STP ki zaroorat nahi kyunki rokne ke liye koi Layer 2 loop hai hi nahi. Lekin applications ab bhi kai racks mein same subnet maangti hain, jaise virtual machine mobility ke liye. VXLAN woh deta hai.</p>

<h3>Overlay aur underlay</h3>
<p>Do shabd har EVPN baat-cheet mein aate hain. <b>Underlay</b> asli IP network hai: loopbacks, /31 links, aur OSPF jaisa IGP. Uska ek hi kaam hai: ek leaf loopback se doosre tak IP packet pahunchana. <b>Overlay</b> uske upar bana virtual network hai: VXLAN tunnels aur BGP EVPN sessions. Tenant traffic overlay mein rehta hai. Spine sirf loopbacks ke beech outer IP packets dekhta hai aur kabhi host MAC nahi seekhta.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Overlay above underlay">
<rect x="20" y="20" width="600" height="70" rx="12" fill="#ddd6fe"/><text x="40" y="45" class="svg-ink" font-size="14">OVERLAY</text><text x="40" y="68" class="svg-muted" font-size="12">VXLAN tunnels (VNI 1010) + loopbacks ke beech BGP EVPN sessions</text>
<rect x="20" y="110" width="600" height="80" rx="12" fill="#bae6fd"/><text x="40" y="135" class="svg-ink" font-size="14">UNDERLAY</text><text x="40" y="158" class="svg-muted" font-size="12">Routed IP fabric: /31 links aur lo0 par OSPF, ECMP, jumbo MTU</text>
<line x1="150" y1="90" x2="150" y2="110" stroke="#64748b" stroke-width="2"/><line x1="490" y1="90" x2="490" y2="110" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Overlay underlay ke upar chalta hai. Overlay toote to pehle underlay theek karo.</p></div>

<h3>VXLAN packet</h3>
<p>VXLAN (RFC 7348) poore Ethernet frame ko lapet deta hai. Ingress leaf andar se bahar yeh jodta hai: 8-byte <b>VXLAN header</b> jo <b>VNI</b> carry karta hai, destination port <code>4789</code> wala UDP header, outer IP header, aur outer Ethernet header. Source UDP port inner frame ke hash se nikalta hai, taaki underlay ka ECMP alag flows ko alag links par baant sake.</p>
<ul>
<li><b>VNI</b> (VXLAN Network Identifier): 24 bits, yani lagbhag 16 million segments, jabki VLANs 4094. Junos par har VLAN ek VNI se map hota hai: <code>set vlans V10 vxlan vni 1010</code>.</li>
<li><b>VTEP</b> (VXLAN tunnel end point): jo device encapsulate aur decapsulate karta hai. Junos leaf par VTEP address loopback hota hai, jo <code>set switch-options vtep-source-interface lo0.0</code> se chuna jaata hai.</li>
<li><b>Overhead:</b> VXLAN lagbhag 50 bytes jodta hai (14 outer Ethernet, 20 outer IP, 8 UDP, 8 VXLAN). 1500-byte host frame ke liye underlay MTU kam se kam 1550 chahiye. Fabric links par jumbo frames (jaise 9192) use karo.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Pod 30 mein PC1 (10.30.10.21) ARP request bhejta hai. LEAF1 V10 mein broadcast dekhta hai, jo VNI 1010 hai. Woh VNI 1010 ke saath VXLAN header, UDP 4789, outer source 10.30.255.11 aur outer destination 10.30.255.12 jodta hai. Spine sirf outer IP header padhta hai, route karta hai, aur LEAF2 wrapper hata deta hai. Header ka VNI LEAF2 ko batata hai ki frame kis VLAN (V10) mein deliver karna hai. Fabric link par capture mein hosts sirf inner frame mein dikhte hain.</p></div>

<h3>Flood-and-learn versus EVPN</h3>
<p>Plain VXLAN ko pata nahi hota ki kaunsa VTEP kaunsa MAC rakhta hai. Woh ya to unknown frames ko underlay ke multicast se har VTEP ko flood karta hai, ya ek-ek karke replicate karta hai. Woh remote MACs data plane se seekhta hai, jaise aam switch. Yeh badi scale par kharab chalta hai aur policy nahi deta.</p>
<p><b>EVPN</b> iski jagah control plane deta hai. Jab LEAF2 local MAC seekhta hai, woh BGP route se sabko bata deta hai. Jab koi leaf up hota hai aur VNI serve karta hai, woh khud ko announce karta hai. Learning routing ban jaati hai: route targets, policy aur fast convergence milte hain. Agle chapters dikhate hain kaise.</p>

<div class="tbl"><table class="cmp"><tr><th>Sawaal</th><th>Plain VLAN trunk</th><th>EVPN-VXLAN</th></tr>
<tr><td>Segments</td><td>4094</td><td>Lagbhag 16 million VNIs</td></tr>
<tr><td>Loop prevention</td><td>Spanning tree</td><td>Routed underlay, L2 loop nahi</td></tr>
<tr><td>Uplink use</td><td>Ek active</td><td>Saare links, ECMP</td></tr>
<tr><td>MAC learning</td><td>Data plane flood</td><td>BGP control plane</td></tr>
<tr><td>Failure domain</td><td>Poora VLAN</td><td>Per leaf aur per VNI</td></tr></table></div>

<div class="warn"><p><b>Aam galti.</b> MTU bhool jaana. Ping chalta hai, chhote transfers chalte hain, phir file copy atak jaata hai kyunki 1500-byte frames plus 50 bytes VXLAN 1500-byte underlay MTU se bade ho jaate hain. Pehle fabric MTU badhao.</p></div>

<div class="exam"><p><b>Exam trap.</b> VNI 24 bits ka hai aur VXLAN header mein rehta hai. VLAN ID 12 bits ka hai aur switch ke liye local hai. Junos par do leaves same VNI ke liye alag VLAN IDs use kar sakte hain, lekin VNI match hona chahiye. UDP port 4789 hai, 4780 ya 8472 nahi.</p></div>

<div class="scn"><h4>File copy jo atak gaya</h4><p>Pune mein naya fabric live hone ke baad users ping aur browse kar paa rahe the, lekin bade database backups 1.4 MB par atak jaate the. Do-not-fragment bit ke saath bade size ki ping 1472 bytes se upar fail ho rahi thi. Engineer ne dekha ki leaf-to-spine links abhi bhi default 1514 MTU par the. Har fabric interface par <code>mtu 9192</code> set karne se turant theek ho gaya.</p><p><b>Lesson:</b> VXLAN ko bada underlay MTU chahiye. Bade pings se pehle hi test karo.</p></div>

<div class="iv"><p class="q">"VLAN, VNI aur VTEP mein kya fark hai?"</p><p>VLAN switch par local 12-bit Layer 2 segment hai. VNI 24-bit identifier hai jo us segment ko VXLAN header ke andar fabric ke paar le jaata hai. VTEP woh device hai, aam taur par leaf loopback, jo VXLAN wrapper jodta aur hataata hai. 50-byte overhead aur MTU ka point jodo to depth dikhegi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VXLAN routed IP par tunnel karke VLAN limits, STP blocking aur bade failure domains hata deta hai.</li>
<li>Underlay = loopbacks ke beech IP reachability; overlay = VXLAN plus BGP EVPN.</li>
<li>VXLAN header mein 24-bit VNI hota hai; transport UDP port 4789.</li>
<li>Overhead lagbhag 50 bytes hai, isliye underlay MTU badhao.</li>
<li>EVPN flood-and-learn ki jagah BGP se MAC aur VTEP information baantta hai.</li>
</ul></div>
`}};export{e as default};