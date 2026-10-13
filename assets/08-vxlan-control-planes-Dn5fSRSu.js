var e={id:`vxlan-control-planes`,h:{en:`Flood and learn vs control planes: multicast, ingress replication, BGP EVPN, LISP`,hi:`Flood and learn vs control planes: multicast, ingress replication, BGP EVPN, LISP`},body:{en:`
<p>A new employee joins a big office and needs to find Priya. Option one: shout "Priya?" across every floor and remember which floor answered (flood and learn). Option two: look her up in the company directory (a control plane). Shouting works in a small office and becomes chaos in a big one. VXLAN supports both styles, and choosing between them is a design question the exam expects you to describe.</p>

<h3>The problem: VXLAN alone knows nothing</h3>
<p>The VXLAN header only says "this frame belongs to VNI 10010". It does not say which remote VTEP hosts which MAC. A VTEP must somehow learn two things:</p>
<ol>
<li><b>Who are my peers for this VNI?</b> Needed to deliver <b>BUM</b> traffic: broadcast (ARP requests, DHCP), unknown unicast and multicast.</li>
<li><b>Behind which VTEP is MAC X?</b> Needed to send known unicast to exactly one VTEP.</li>
</ol>

<h3>Flood and learn: packet walk in the lab</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Flood and learn packet walk">
<rect x="250" y="16" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">SPINE (underlay)</text>
<rect x="60" y="110" width="170" height="50" rx="8" fill="#bae6fd"/><text x="145" y="132" text-anchor="middle" class="svg-ink" font-size="13">VTEP1 1.1.1.1</text><text x="145" y="150" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10 = VNI 10010</text>
<rect x="410" y="110" width="170" height="50" rx="8" fill="#bae6fd"/><text x="495" y="132" text-anchor="middle" class="svg-ink" font-size="13">VTEP2 2.2.2.2</text><text x="495" y="150" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10 = VNI 10010</text>
<rect x="70" y="210" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="145" y="235" text-anchor="middle" class="svg-ink" font-size="12">PC1 .11</text>
<rect x="420" y="210" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="495" y="235" text-anchor="middle" class="svg-ink" font-size="12">PC2 .12</text>
<line x1="145" y1="160" x2="145" y2="210" stroke="#64748b" stroke-width="2"/><line x1="495" y1="160" x2="495" y2="210" stroke="#64748b" stroke-width="2"/>
<line x1="230" y1="120" x2="270" y2="60" stroke="#64748b" stroke-width="2"/><line x1="370" y1="60" x2="410" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="320" y="92" text-anchor="middle" class="svg-accent" font-size="12">1 ARP copy unicast to 2.2.2.2</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">2 learn PC1 MAC → 1.1.1.1</text>
<text x="320" y="208" text-anchor="middle" class="svg-accent" font-size="12">3 reply unicast, learn PC2 → 2.2.2.2</text>
</svg><p class="cap">Head-end replication in the lab: the ARP broadcast is copied as unicast to each peer in the list.</p></div>
<ol>
<li>PC1 wants to ping 192.168.10.12 and broadcasts an ARP request in VLAN 10.</li>
<li>VTEP1 learns PC1's MAC on its local port Gi1/0, like any switch. The frame is a broadcast, so it must reach every VTEP in VNI 10010.</li>
<li>With <b>ingress (head-end) replication</b>, VTEP1 makes one unicast VXLAN copy for every peer in its list (here only 2.2.2.2). With <b>multicast</b>, it would send one copy to the VNI's underlay group (for example 239.1.1.10) and the underlay PIM tree would replicate it.</li>
<li>VTEP2 decapsulates and floods the ARP to its local ports in VLAN 10. It also <b>learns</b>: inner source MAC PC1 lives behind outer source IP 1.1.1.1. Its MAC table now points PC1 to <code>nve1(1.1.1.1)</code>.</li>
<li>PC2 answers with a unicast ARP reply. VTEP2 already knows PC1 is behind 1.1.1.1, so it sends one unicast VXLAN packet there. VTEP1 learns PC2's MAC behind 2.2.2.2.</li>
</ol>
<p>This is <b>data-plane learning</b>, exactly like a classic switch learning source MACs, except that the "port" is a remote VTEP.</p>

<h3>Multicast vs ingress replication</h3>
<table class="cmp"><tr><th></th><th>Underlay multicast</th><th>Ingress (head-end) replication</th></tr>
<tr><td>How BUM is sent</td><td>One copy to a group per VNI; underlay replicates</td><td>One unicast copy per remote VTEP</td></tr>
<tr><td>Underlay needs</td><td>PIM (sparse mode or bidir), RPs</td><td>Only unicast routing</td></tr>
<tr><td>Peer discovery</td><td>Automatic via group join</td><td>Static list, or BGP EVPN route type 3</td></tr>
<tr><td>Best for</td><td>Many VTEPs, heavy BUM</td><td>Small fabrics, no multicast skills or support</td></tr>
</table>

<h3>Why flood and learn does not scale</h3>
<ul>
<li>Every unknown destination and every ARP floods to every VTEP in the VNI.</li>
<li>Static peer lists must be edited on every VTEP whenever one is added.</li>
<li>Any device that can send UDP 4789 can inject frames; VTEPs are not authenticated.</li>
<li>No built-in routing between VNIs, no ARP suppression, slow MAC moves.</li>
</ul>

<h3>Control plane 1: BGP EVPN</h3>
<p>MP-BGP with the <b>L2VPN EVPN</b> address family advertises what flood and learn had to discover. <b>Route type 2</b> carries MAC and MAC+IP of each host with its VNI and VTEP next hop; <b>route type 3</b> (inclusive multicast) announces "I am a VTEP for VNI 10010", which builds ingress-replication lists automatically; <b>route type 5</b> carries IP prefixes. VTEPs then answer ARP locally (ARP suppression) and all leaves share a distributed anycast gateway. BGP EVPN is the standard in data centers and appears in depth in the DC EVPN module.</p>

<h3>Control plane 2: LISP</h3>
<p>In SD-Access, the edge switch registers every endpoint's MAC and IP as <b>EIDs</b> with the LISP control-plane node (the map-server). When traffic needs a destination, the edge <b>pulls</b> the mapping with a Map-Request, then sends VXLAN to the right edge. ARP broadcasts are converted to unicast using the IP-to-MAC mapping, so flooding is avoided. Unlike BGP EVPN, which <b>pushes</b> every host route to every VTEP, LISP only holds what each edge actually talks to.</p>

<div class="eg"><p><b>Worked example.</b> A fabric has 200 VTEPs and 20,000 hosts. With BGP EVPN, each leaf may receive route type 2 entries for all 20,000 hosts (push). With a LISP control plane, an access switch serving a floor of 50 users caches maybe a few hundred remote entries that its users actually reach (pull). That difference is why Cisco chose LISP for campus edges with small TCAMs.</p></div>

<div class="warn"><p><b>Common mistake.</b> Mixing replication modes in one VNI: VTEP1 with ingress replication and VTEP2 with a multicast group. BUM from VTEP2 goes to the group that VTEP1 never joined, so ARP fails in one direction only. Every VTEP in a VNI must use the same replication method.</p></div>

<div class="exam"><p><b>Exam trap.</b> Flood and learn is <b>data-plane learning</b>; BGP EVPN and LISP are <b>control-plane learning</b>. BGP EVPN is <b>push</b>, LISP is <b>pull</b>. VXLAN is only the data plane in both cases.</p></div>

<div class="scn"><h4>ARP storm across the campus</h4><p>An enterprise stretched a large user VLAN across four buildings with flood-and-learn VXLAN and ingress replication to 30 VTEPs. Every morning, laptops reconnecting generated thousands of ARPs, each copied 29 times by the head-end, and uplinks spiked. The team moved the design to SD-Access, where the edges resolve ARPs through the LISP control-plane node and send them as unicast. Uplink BUM traffic dropped by over 90 percent.</p><p><b>Lesson:</b> flood and learn is fine for a lab or a few VTEPs; at scale you want a control plane.</p></div>

<div class="iv"><p class="q">"Compare flood and learn with BGP EVPN and LISP as VXLAN control planes."</p><p>Strong answer: flood and learn discovers peers statically or by multicast and learns MACs from decapsulated traffic, so BUM floods everywhere. BGP EVPN pushes MAC/IP (type 2), VTEP membership (type 3) and prefixes (type 5) to all VTEPs, enabling ARP suppression and anycast gateways; it is the data center standard. LISP pulls mappings on demand from a map-server, keeping small tables at campus edges; SD-Access uses it. In every case VXLAN is just the data plane.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VTEPs must learn BUM peers and MAC locations; VXLAN itself provides neither.</li>
<li>Flood and learn: BUM via multicast group or ingress replication, MACs learned in the data plane.</li>
<li>Remote MACs appear on <code>nve1(peer-VTEP-IP)</code> in the MAC table.</li>
<li>BGP EVPN = push control plane (types 2, 3, 5); LISP = pull control plane (SD-Access).</li>
<li>All VTEPs in a VNI must use the same replication mode.</li>
</ul></div>
`,hi:`
<p>Ek naya employee bade office mein join karta hai aur use Priya ko dhoondna hai. Option ek: har floor par chilla kar "Priya?" poochna aur yaad rakhna ki kaunse floor se jawab aaya (flood and learn). Option do: company directory mein dekhna (control plane). Chhote office mein chillana chal jaata hai, bade office mein chaos ban jaata hai. VXLAN dono styles support karta hai, aur inke beech chunna ek design sawaal hai jise exam aapse describe karwata hai.</p>

<h3>Problem: akele VXLAN ko kuch nahi pata</h3>
<p>VXLAN header sirf itna kehta hai "yeh frame VNI 10010 ka hai". Yeh nahi batata ki kaunsa remote VTEP kaunsa MAC host karta hai. VTEP ko kisi tarah do cheezein seekhni hoti hain:</p>
<ol>
<li><b>Is VNI ke liye mere peers kaun hain?</b> <b>BUM</b> traffic deliver karne ke liye: broadcast (ARP requests, DHCP), unknown unicast aur multicast.</li>
<li><b>MAC X kis VTEP ke peeche hai?</b> Known unicast ko bilkul ek VTEP par bhejne ke liye.</li>
</ol>

<h3>Flood and learn: lab mein packet walk</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Flood and learn packet walk">
<rect x="250" y="16" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">SPINE (underlay)</text>
<rect x="60" y="110" width="170" height="50" rx="8" fill="#bae6fd"/><text x="145" y="132" text-anchor="middle" class="svg-ink" font-size="13">VTEP1 1.1.1.1</text><text x="145" y="150" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10 = VNI 10010</text>
<rect x="410" y="110" width="170" height="50" rx="8" fill="#bae6fd"/><text x="495" y="132" text-anchor="middle" class="svg-ink" font-size="13">VTEP2 2.2.2.2</text><text x="495" y="150" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10 = VNI 10010</text>
<rect x="70" y="210" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="145" y="235" text-anchor="middle" class="svg-ink" font-size="12">PC1 .11</text>
<rect x="420" y="210" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="495" y="235" text-anchor="middle" class="svg-ink" font-size="12">PC2 .12</text>
<line x1="145" y1="160" x2="145" y2="210" stroke="#64748b" stroke-width="2"/><line x1="495" y1="160" x2="495" y2="210" stroke="#64748b" stroke-width="2"/>
<line x1="230" y1="120" x2="270" y2="60" stroke="#64748b" stroke-width="2"/><line x1="370" y1="60" x2="410" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="320" y="92" text-anchor="middle" class="svg-accent" font-size="12">1 ARP copy 2.2.2.2 ko unicast</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">2 seekho PC1 MAC → 1.1.1.1</text>
<text x="320" y="208" text-anchor="middle" class="svg-accent" font-size="12">3 reply unicast, seekho PC2 → 2.2.2.2</text>
</svg><p class="cap">Lab mein head-end replication: ARP broadcast list ke har peer ko unicast copy ki tarah jaata hai.</p></div>
<ol>
<li>PC1 192.168.10.12 ko ping karna chahta hai aur VLAN 10 mein ARP request broadcast karta hai.</li>
<li>VTEP1 PC1 ka MAC apne local port Gi1/0 par seekhta hai, kisi bhi switch ki tarah. Frame broadcast hai, isliye use VNI 10010 ke har VTEP tak pahunchna chahiye.</li>
<li><b>Ingress (head-end) replication</b> ke saath VTEP1 apni list ke har peer ke liye ek unicast VXLAN copy banata hai (yahan sirf 2.2.2.2). <b>Multicast</b> ke saath woh VNI ke underlay group (jaise 239.1.1.10) ko ek copy bhejta aur underlay PIM tree use replicate karta.</li>
<li>VTEP2 decapsulate karta hai aur ARP ko VLAN 10 ke apne local ports par flood karta hai. Woh <b>seekhta</b> bhi hai: inner source MAC PC1 outer source IP 1.1.1.1 ke peeche hai. Ab uski MAC table PC1 ko <code>nve1(1.1.1.1)</code> par point karti hai.</li>
<li>PC2 unicast ARP reply deta hai. VTEP2 ko pehle se pata hai PC1 1.1.1.1 ke peeche hai, isliye wahan ek unicast VXLAN packet bhejta hai. VTEP1 PC2 ka MAC 2.2.2.2 ke peeche seekhta hai.</li>
</ol>
<p>Yeh <b>data-plane learning</b> hai, bilkul classic switch ke source MACs seekhne jaisa, bas yahan "port" ek remote VTEP hai.</p>

<h3>Multicast vs ingress replication</h3>
<table class="cmp"><tr><th></th><th>Underlay multicast</th><th>Ingress (head-end) replication</th></tr>
<tr><td>BUM kaise jaata hai</td><td>Har VNI ke group ko ek copy; underlay replicate karta hai</td><td>Har remote VTEP ko ek unicast copy</td></tr>
<tr><td>Underlay ko kya chahiye</td><td>PIM (sparse mode ya bidir), RPs</td><td>Sirf unicast routing</td></tr>
<tr><td>Peer discovery</td><td>Group join se automatic</td><td>Static list, ya BGP EVPN route type 3</td></tr>
<tr><td>Kiske liye best</td><td>Bahut VTEPs, bhaari BUM</td><td>Chhote fabrics, multicast skills ya support nahi</td></tr>
</table>

<h3>Flood and learn scale kyun nahi karta</h3>
<ul>
<li>Har unknown destination aur har ARP VNI ke har VTEP tak flood hota hai.</li>
<li>Jab bhi ek VTEP judta hai, har VTEP par static peer lists edit karni padti hain.</li>
<li>Jo bhi device UDP 4789 bhej sake woh frames inject kar sakta hai; VTEPs authenticated nahi hote.</li>
<li>VNIs ke beech built-in routing nahi, ARP suppression nahi, MAC moves dheeme.</li>
</ul>

<h3>Control plane 1: BGP EVPN</h3>
<p><b>L2VPN EVPN</b> address family wala MP-BGP woh sab advertise karta hai jo flood and learn ko dhoondna padta tha. <b>Route type 2</b> har host ka MAC aur MAC+IP uske VNI aur VTEP next hop ke saath le jaata hai; <b>route type 3</b> (inclusive multicast) announce karta hai "main VNI 10010 ka VTEP hoon", jisse ingress-replication lists apne aap banti hain; <b>route type 5</b> IP prefixes le jaata hai. Phir VTEPs ARP ka jawab locally dete hain (ARP suppression) aur saare leaves ek distributed anycast gateway share karte hain. BGP EVPN data centers mein standard hai aur DC EVPN module mein gehraai se aata hai.</p>

<h3>Control plane 2: LISP</h3>
<p>SD-Access mein edge switch har endpoint ke MAC aur IP ko <b>EIDs</b> ki tarah LISP control-plane node (map-server) par register karta hai. Jab traffic ko destination chahiye, edge Map-Request se mapping <b>pull</b> karta hai, phir sahi edge ko VXLAN bhejta hai. ARP broadcasts IP-se-MAC mapping use karke unicast mein badal diye jaate hain, isliye flooding se bachte hain. BGP EVPN ke ulat, jo har host route har VTEP ko <b>push</b> karta hai, LISP sirf wahi rakhta hai jisse har edge sach mein baat karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek fabric mein 200 VTEPs aur 20,000 hosts hain. BGP EVPN ke saath har leaf ko saare 20,000 hosts ki route type 2 entries mil sakti hain (push). LISP control plane ke saath, 50 users ke floor ko serve karne wala access switch shayad kuch sau remote entries cache karta hai jin tak uske users sach mein pahunchte hain (pull). Yahi fark wajah hai ki Cisco ne chhote TCAM wale campus edges ke liye LISP chuna.</p></div>

<div class="warn"><p><b>Common galti.</b> Ek VNI mein replication modes milana: VTEP1 ingress replication ke saath aur VTEP2 multicast group ke saath. VTEP2 ka BUM us group ko jaata hai jise VTEP1 ne kabhi join nahi kiya, isliye ARP sirf ek direction mein fail hota hai. VNI ke har VTEP ko same replication method use karna chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Flood and learn <b>data-plane learning</b> hai; BGP EVPN aur LISP <b>control-plane learning</b>. BGP EVPN <b>push</b> hai, LISP <b>pull</b>. Dono cases mein VXLAN sirf data plane hai.</p></div>

<div class="scn"><h4>Campus bhar mein ARP storm</h4><p>Ek enterprise ne flood-and-learn VXLAN aur 30 VTEPs ko ingress replication ke saath ek bada user VLAN chaar buildings mein stretch kiya. Har subah laptops reconnect hote to hazaaron ARPs bante, har ek head-end par 29 baar copy hota, aur uplinks spike karte. Team ne design ko SD-Access par shift kiya, jahan edges ARPs ko LISP control-plane node ke through resolve karke unicast ki tarah bhejte hain. Uplink BUM traffic 90 percent se zyada gir gaya.</p><p><b>Seekh:</b> flood and learn lab ya kuch VTEPs ke liye theek hai; scale par aapko control plane chahiye.</p></div>

<div class="iv"><p class="q">"VXLAN control planes ki tarah flood and learn, BGP EVPN aur LISP ko compare karo."</p><p>Strong answer: flood and learn peers ko static ya multicast se dhoondta hai aur decapsulated traffic se MACs seekhta hai, isliye BUM har jagah flood hota hai. BGP EVPN MAC/IP (type 2), VTEP membership (type 3) aur prefixes (type 5) saare VTEPs ko push karta hai, jisse ARP suppression aur anycast gateways milte hain; yeh data center standard hai. LISP map-server se zaroorat par mappings pull karta hai, campus edges par chhoti tables rakhta hai; SD-Access ise use karta hai. Har case mein VXLAN sirf data plane hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VTEPs ko BUM peers aur MAC locations seekhni hain; VXLAN khud dono mein se kuch nahi deta.</li>
<li>Flood and learn: BUM multicast group ya ingress replication se, MACs data plane mein seekhe jaate hain.</li>
<li>Remote MACs MAC table mein <code>nve1(peer-VTEP-IP)</code> par dikhte hain.</li>
<li>BGP EVPN = push control plane (types 2, 3, 5); LISP = pull control plane (SD-Access).</li>
<li>VNI ke saare VTEPs ko same replication mode use karna chahiye.</li>
</ul></div>
`}};export{e as default};