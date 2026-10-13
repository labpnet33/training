var e={id:`diagrams`,h:{en:`Network documentation: diagrams, racks and cable maps`,hi:`Network documentation: diagrams, racks aur cable maps`},body:{en:`
<p>Imagine arriving in a new city with two maps. One is a street map: every road, building and bus stop, drawn to scale. The other is the metro map: only lines, stations and interchanges, with no real distances. Both are correct, and you need both. A network has the same two kinds of map: <b>physical</b> and <b>logical</b> diagrams.</p>

<h3>Physical versus logical diagrams</h3>
<dl class="terms">
<dt>Physical diagram</dt><dd>Shows where things really are and how they are connected: buildings, floors, closets, racks, devices, port numbers, cable types and patch panels. It answers "where is it and what is it plugged into?"</dd>
<dt>Logical diagram</dt><dd>Shows how traffic flows, regardless of location: subnets, VLANs, routing domains, VPN tunnels, firewall zones and IP addressing. It answers "how does data get from A to B?"</dd>
</dl>
<p>A switch in a closet on floor 3 appears on the physical diagram as "SW-F3-01, rack B, U22, ports Gi1/0/1-48". On the logical diagram the same switch may disappear entirely, replaced by "VLAN 20 Staff 10.20.0.0/24" and "VLAN 30 Voice 10.30.0.0/24".</p>

<h3>Layer 1, layer 2 and layer 3 diagrams</h3>
<p>Large networks split documentation by OSI layer, because one drawing with everything becomes unreadable.</p>
<table class="cmp"><tr><th>Diagram</th><th>What it shows</th><th>Typical question it answers</th></tr>
<tr><td><b>Layer 1 (physical)</b></td><td>Cables, fibre types, port-to-port connections, patch panels, media converters, speeds</td><td>"Which port on the core does the fibre from closet 2 land on?"</td></tr>
<tr><td><b>Layer 2 (data link)</b></td><td>VLANs, trunks and allowed VLANs, link aggregation groups, spanning-tree root and blocked ports</td><td>"Why can VLAN 30 not reach the distribution switch?"</td></tr>
<tr><td><b>Layer 3 (network)</b></td><td>Subnets, gateways, routing protocols and areas, static routes, NAT points, firewalls and VPNs</td><td>"Which router is the next hop for the 10.40.0.0/16 branch networks?"</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Same network drawn as physical and logical diagrams">
<rect x="10" y="10" width="300" height="220" rx="8" fill="#e2e8f0"/><text x="160" y="32" text-anchor="middle" class="svg-ink" font-size="14">Physical (L1)</text>
<rect x="30" y="50" width="120" height="32" rx="6" fill="#bae6fd"/><text x="90" y="71" text-anchor="middle" class="svg-ink" font-size="12">R1 rack A U30</text>
<rect x="170" y="50" width="120" height="32" rx="6" fill="#bae6fd"/><text x="230" y="71" text-anchor="middle" class="svg-ink" font-size="12">SW1 rack A U24</text>
<line x1="150" y1="66" x2="170" y2="66" stroke="#64748b" stroke-width="2"/>
<text x="160" y="100" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 to Gi0/1, Cat6, PP-A:01</text>
<rect x="30" y="130" width="120" height="32" rx="6" fill="#bbf7d0"/><text x="90" y="151" text-anchor="middle" class="svg-ink" font-size="12">NMS desk IT-2</text>
<rect x="170" y="130" width="120" height="32" rx="6" fill="#bbf7d0"/><text x="230" y="151" text-anchor="middle" class="svg-ink" font-size="12">PC1 desk 4B</text>
<line x1="90" y1="130" x2="210" y2="82" stroke="#64748b"/><line x1="230" y1="130" x2="230" y2="82" stroke="#64748b"/>
<text x="160" y="190" text-anchor="middle" class="svg-muted" font-size="12">Where it is, what it plugs into</text>
<rect x="330" y="10" width="300" height="220" rx="8" fill="#fde68a"/><text x="480" y="32" text-anchor="middle" class="svg-ink" font-size="14">Logical (L3)</text>
<rect x="350" y="60" width="260" height="36" rx="6" fill="#ddd6fe"/><text x="480" y="83" text-anchor="middle" class="svg-ink" font-size="12">Mgmt LAN 192.168.50.0/24, gw .1</text>
<rect x="350" y="118" width="120" height="36" rx="6" fill="#fed7aa"/><text x="410" y="141" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<rect x="490" y="118" width="120" height="36" rx="6" fill="#fed7aa"/><text x="550" y="141" text-anchor="middle" class="svg-ink" font-size="12">R2 Lo0 .2.1</text>
<line x1="470" y1="136" x2="490" y2="136" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="96" x2="410" y2="118" stroke="#64748b"/>
<text x="480" y="180" text-anchor="middle" class="svg-muted" font-size="12">10.0.12.0/30 point-to-point</text>
<text x="480" y="205" text-anchor="middle" class="svg-muted" font-size="12">How traffic flows</text>
</svg><p class="cap">The same lab network twice. The physical view shows racks, ports and desks; the logical view shows subnets and routers. The switch is essential physically but invisible logically.</p></div>

<h3>Rack diagrams</h3>
<p>A <b>rack diagram</b> (rack elevation) is a front and rear drawing of one rack, showing which device sits in which <b>rack unit</b> (U). One U is 1.75 inches (44.45 mm) tall; a common full-height rack is 42U. A good rack diagram records the device name, height in U, front or rear mounting, power supply connections (feed A and feed B), and blanking panels. Technicians use it to plan space, power and airflow before installing anything, and to send a remote hands engineer to "rack B, U22" without any guesswork.</p>

<h3>Cable maps and labelling</h3>
<p>A <b>cable map</b> lists every cable run: cable ID, source device and port, patch panel and port, destination device and port, cable type and length. Both ends of the cable carry the same label. When a user at desk 4B has no network, the cable map says "desk 4B, wall jack 4B-02, patch panel PP-C port 14, switch SW-F3-01 Gi1/0/14" and the fix takes minutes instead of hours.</p>

<div class="eg"><p><b>Worked example: a cable map entry.</b></p>
<pre class="out">Cable ID  From               Patch        To                  Type   Len
C-0412    Desk 4B jack 4B-02 PP-C:14      SW-F3-01 Gi1/0/14   Cat6   38 m
C-0413    R1 Gi0/0           PP-A:01      SW1 Gi0/1           Cat6   2 m
<span class="hl">F-0021    CORE-1 Te1/1/1     ODF-1:07     SW-F3-01 Te1/1/1    OM4    92 m</span></pre>
<p>The highlighted fibre run tells the technician the fibre type (OM4 multimode) and length, which matters when choosing optics and when checking a link that shows errors.</p></div>

<h3>Keeping documentation alive</h3>
<p>A diagram that was right last year is dangerous, because people trust it. Good teams store diagrams in a shared, version-controlled place, update them as part of every change (chapter 4) and review them on a schedule. Many tools can draw layer 2 and layer 3 maps automatically from discovery data (LLDP neighbours, routing tables), which you will meet in chapter 8.</p>

<div class="warn"><p><b>Common mistakes.</b> Drawing one giant diagram that mixes cables, VLANs and routing, so nobody can read it. Labelling only one end of a cable. Forgetting to update the diagram after a change, so the next engineer follows a map of a network that no longer exists. Putting passwords or community strings on diagrams that are shared widely.</p></div>

<div class="exam"><p><b>Exam trap.</b> If the question mentions rack units, power feeds or where a device is mounted, the answer is a <b>rack diagram</b>. If it mentions ports, patch panels or cable runs, it is a <b>cable map</b> or <b>physical/layer 1 diagram</b>. If it mentions subnets, VLANs or routing, it is a <b>logical</b> (layer 2 or layer 3) diagram.</p></div>

<div class="scn"><h4>The migration that followed the wrong map</h4><p>A school district migrated its routing to a new core. The engineer used the layer 3 diagram to plan static routes, but the diagram was two years old and missed a subnet added for the science labs. After the cut-over, the labs lost internet access. The engineer compared the routing table on the old core with the diagram, found the missing 10.60.8.0/22 network, added the route and updated the diagram in the same change ticket.</p><p><b>Lesson:</b> verify documentation against the live network before a change, and update it as part of the change, not "later".</p></div>

<div class="iv"><p class="q">"What is the difference between a physical and a logical network diagram, and when would you use each?"</p><p>Strong answer: physical shows real locations and connections (racks, ports, cables, patch panels), logical shows how data flows (subnets, VLANs, routing, security zones). I use physical when replacing hardware or tracing a cable, and logical when troubleshooting reachability or planning addressing. Mention that large networks split into layer 1, 2 and 3 diagrams, and that diagrams must be updated with every change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Physical diagrams show where things are and what they plug into; logical diagrams show how traffic flows.</li>
<li>Layer 1 diagrams show cables and ports, layer 2 shows VLANs, trunks and STP, layer 3 shows subnets and routing.</li>
<li>A rack diagram shows each device's rack units, power feeds and orientation; 1U = 1.75 in, a common rack is 42U.</li>
<li>A cable map ties each cable ID to both ends and the patch panel; label both ends.</li>
<li>Documentation must be updated as part of every change or it becomes dangerous.</li>
</ul></div>
`,hi:`
<p>Socho aap ek naye shehar mein do maps ke saath pahunche. Ek street map hai: har sadak, building aur bus stop, scale par bana hua. Doosra metro map hai: sirf lines, stations aur interchanges, asli doori ke bina. Dono sahi hain, aur aapko dono chahiye. Network ke paas bhi yahi do tarah ke maps hote hain: <b>physical</b> aur <b>logical</b> diagrams.</p>

<h3>Physical vs logical diagrams</h3>
<dl class="terms">
<dt>Physical diagram</dt><dd>Dikhata hai ki cheezein asal mein kahan hain aur kaise judi hain: buildings, floors, closets, racks, devices, port numbers, cable types aur patch panels. Yeh jawab deta hai "yeh kahan hai aur kismein plug hai?"</dd>
<dt>Logical diagram</dt><dd>Dikhata hai ki traffic kaise flow karta hai, location se farak nahi padta: subnets, VLANs, routing domains, VPN tunnels, firewall zones aur IP addressing. Yeh jawab deta hai "data A se B tak kaise pahunchta hai?"</dd>
</dl>
<p>Floor 3 ke closet ka ek switch physical diagram par "SW-F3-01, rack B, U22, ports Gi1/0/1-48" ke roop mein dikhta hai. Logical diagram par wahi switch poori tarah gayab ho sakta hai, uski jagah "VLAN 20 Staff 10.20.0.0/24" aur "VLAN 30 Voice 10.30.0.0/24" aa jaate hain.</p>

<h3>Layer 1, layer 2 aur layer 3 diagrams</h3>
<p>Bade networks documentation ko OSI layer ke hisaab se baant dete hain, kyunki sab kuch ek drawing mein daalne se woh padhne laayak nahi rehti.</p>
<table class="cmp"><tr><th>Diagram</th><th>Kya dikhata hai</th><th>Typical sawaal jiska jawab deta hai</th></tr>
<tr><td><b>Layer 1 (physical)</b></td><td>Cables, fibre types, port-to-port connections, patch panels, media converters, speeds</td><td>"Closet 2 se aane wala fibre core ke kaunse port par land hota hai?"</td></tr>
<tr><td><b>Layer 2 (data link)</b></td><td>VLANs, trunks aur allowed VLANs, link aggregation groups, spanning-tree root aur blocked ports</td><td>"VLAN 30 distribution switch tak kyun nahi pahunch raha?"</td></tr>
<tr><td><b>Layer 3 (network)</b></td><td>Subnets, gateways, routing protocols aur areas, static routes, NAT points, firewalls aur VPNs</td><td>"10.40.0.0/16 branch networks ke liye next hop kaunsa router hai?"</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Ek hi network physical aur logical diagram mein">
<rect x="10" y="10" width="300" height="220" rx="8" fill="#e2e8f0"/><text x="160" y="32" text-anchor="middle" class="svg-ink" font-size="14">Physical (L1)</text>
<rect x="30" y="50" width="120" height="32" rx="6" fill="#bae6fd"/><text x="90" y="71" text-anchor="middle" class="svg-ink" font-size="12">R1 rack A U30</text>
<rect x="170" y="50" width="120" height="32" rx="6" fill="#bae6fd"/><text x="230" y="71" text-anchor="middle" class="svg-ink" font-size="12">SW1 rack A U24</text>
<line x1="150" y1="66" x2="170" y2="66" stroke="#64748b" stroke-width="2"/>
<text x="160" y="100" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 se Gi0/1, Cat6, PP-A:01</text>
<rect x="30" y="130" width="120" height="32" rx="6" fill="#bbf7d0"/><text x="90" y="151" text-anchor="middle" class="svg-ink" font-size="12">NMS desk IT-2</text>
<rect x="170" y="130" width="120" height="32" rx="6" fill="#bbf7d0"/><text x="230" y="151" text-anchor="middle" class="svg-ink" font-size="12">PC1 desk 4B</text>
<line x1="90" y1="130" x2="210" y2="82" stroke="#64748b"/><line x1="230" y1="130" x2="230" y2="82" stroke="#64748b"/>
<text x="160" y="190" text-anchor="middle" class="svg-muted" font-size="12">Kahan hai, kismein plug hai</text>
<rect x="330" y="10" width="300" height="220" rx="8" fill="#fde68a"/><text x="480" y="32" text-anchor="middle" class="svg-ink" font-size="14">Logical (L3)</text>
<rect x="350" y="60" width="260" height="36" rx="6" fill="#ddd6fe"/><text x="480" y="83" text-anchor="middle" class="svg-ink" font-size="12">Mgmt LAN 192.168.50.0/24, gw .1</text>
<rect x="350" y="118" width="120" height="36" rx="6" fill="#fed7aa"/><text x="410" y="141" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<rect x="490" y="118" width="120" height="36" rx="6" fill="#fed7aa"/><text x="550" y="141" text-anchor="middle" class="svg-ink" font-size="12">R2 Lo0 .2.1</text>
<line x1="470" y1="136" x2="490" y2="136" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="96" x2="410" y2="118" stroke="#64748b"/>
<text x="480" y="180" text-anchor="middle" class="svg-muted" font-size="12">10.0.12.0/30 point-to-point</text>
<text x="480" y="205" text-anchor="middle" class="svg-muted" font-size="12">Traffic kaise flow karta hai</text>
</svg><p class="cap">Wahi lab network do baar. Physical view racks, ports aur desks dikhata hai; logical view subnets aur routers. Switch physically zaroori hai lekin logically dikhta hi nahi.</p></div>

<h3>Rack diagrams</h3>
<p><b>Rack diagram</b> (rack elevation) ek rack ki front aur rear drawing hai, jo dikhati hai ki kaunsa device kaunse <b>rack unit</b> (U) mein baitha hai. Ek U 1.75 inch (44.45 mm) ooncha hota hai; common full-height rack 42U ka hota hai. Achha rack diagram device ka naam, U mein height, front ya rear mounting, power supply connections (feed A aur feed B) aur blanking panels record karta hai. Technicians ise kuch bhi install karne se pehle space, power aur airflow plan karne ke liye use karte hain, aur remote hands engineer ko bina guesswork ke "rack B, U22" bhejne ke liye.</p>

<h3>Cable maps aur labelling</h3>
<p><b>Cable map</b> har cable run ki list hai: cable ID, source device aur port, patch panel aur port, destination device aur port, cable type aur length. Cable ke dono ends par same label hota hai. Jab desk 4B ke user ka network nahi chalta, cable map batata hai "desk 4B, wall jack 4B-02, patch panel PP-C port 14, switch SW-F3-01 Gi1/0/14" aur fix ghanton ki jagah minutes mein ho jaata hai.</p>

<div class="eg"><p><b>Worked example: cable map ki ek entry.</b></p>
<pre class="out">Cable ID  From               Patch        To                  Type   Len
C-0412    Desk 4B jack 4B-02 PP-C:14      SW-F3-01 Gi1/0/14   Cat6   38 m
C-0413    R1 Gi0/0           PP-A:01      SW1 Gi0/1           Cat6   2 m
<span class="hl">F-0021    CORE-1 Te1/1/1     ODF-1:07     SW-F3-01 Te1/1/1    OM4    92 m</span></pre>
<p>Highlighted fibre run technician ko fibre type (OM4 multimode) aur length batata hai, jo optics chunte waqt aur errors wala link check karte waqt matter karta hai.</p></div>

<h3>Documentation ko zinda rakhna</h3>
<p>Jo diagram pichhle saal sahi tha woh khatarnak hai, kyunki log us par bharosa karte hain. Achhi teams diagrams ko ek shared, version-controlled jagah rakhti hain, har change ke hisse ke roop mein update karti hain (chapter 4) aur schedule par review karti hain. Bahut saare tools discovery data (LLDP neighbours, routing tables) se layer 2 aur layer 3 maps automatically bana sakte hain, jo aap chapter 8 mein dekhoge.</p>

<div class="warn"><p><b>Common galtiyan.</b> Ek bada diagram banana jismein cables, VLANs aur routing sab mix hon, jise koi padh na sake. Cable ka sirf ek end label karna. Change ke baad diagram update karna bhool jaana, taaki agla engineer aise network ka map follow kare jo ab exist hi nahi karta. Widely shared diagrams par passwords ya community strings likh dena.</p></div>

<div class="exam"><p><b>Exam trap.</b> Agar sawaal mein rack units, power feeds ya device kahan mount hai ka zikr ho, jawab <b>rack diagram</b> hai. Agar ports, patch panels ya cable runs ka zikr ho, to <b>cable map</b> ya <b>physical/layer 1 diagram</b>. Agar subnets, VLANs ya routing ka zikr ho, to <b>logical</b> (layer 2 ya layer 3) diagram.</p></div>

<div class="scn"><h4>Galat map follow karne wala migration</h4><p>Ek school district ne apni routing naye core par migrate ki. Engineer ne static routes plan karne ke liye layer 3 diagram use kiya, lekin diagram do saal purana tha aur science labs ke liye jode gaye ek subnet ko miss kar raha tha. Cut-over ke baad labs ka internet chala gaya. Engineer ne purane core ki routing table ko diagram se compare kiya, missing 10.60.8.0/22 network dhoondha, route add kiya aur usi change ticket mein diagram update kiya.</p><p><b>Seekh:</b> change se pehle documentation ko live network se verify karo, aur use change ke hisse ke roop mein update karo, "baad mein" nahi.</p></div>

<div class="iv"><p class="q">"Physical aur logical network diagram mein kya farak hai, aur aap kab kaunsa use karoge?"</p><p>Strong answer: physical asli locations aur connections dikhata hai (racks, ports, cables, patch panels), logical dikhata hai ki data kaise flow karta hai (subnets, VLANs, routing, security zones). Hardware replace karte waqt ya cable trace karte waqt main physical use karta hoon, aur reachability troubleshoot karte waqt ya addressing plan karte waqt logical. Batao ki bade networks layer 1, 2 aur 3 diagrams mein baante jaate hain, aur har change ke saath diagrams update hone chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Physical diagrams dikhate hain ki cheezein kahan hain aur kismein plug hain; logical diagrams dikhate hain ki traffic kaise flow karta hai.</li>
<li>Layer 1 diagrams cables aur ports dikhate hain, layer 2 VLANs, trunks aur STP, layer 3 subnets aur routing.</li>
<li>Rack diagram har device ke rack units, power feeds aur orientation dikhata hai; 1U = 1.75 in, common rack 42U ka hota hai.</li>
<li>Cable map har cable ID ko dono ends aur patch panel se jodta hai; dono ends label karo.</li>
<li>Documentation har change ke hisse ke roop mein update honi chahiye, warna woh khatarnak ban jaati hai.</li>
</ul></div>
`}};export{e as default};