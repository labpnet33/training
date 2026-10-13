var e={id:`limits`,h:{en:`The limits of flood-and-learn, and why EVPN comes next`,hi:`Flood-and-learn ki limits, aur EVPN kyun aata hai`},body:{en:`
<p>Shouting down corridors works in an office of twenty people. In an office of two thousand, everyone shouting "who is Priya?" all day would make work impossible, so the company prints a directory and updates it whenever someone joins or moves desks. Flood-and-learn VXLAN is the shouting office. It is a perfect way to learn the data plane, and it works for a handful of leaves, but it does not survive growth. This chapter lists exactly where it breaks, because those breaking points are the feature list of BGP EVPN.</p>

<h3>Limit 1: every unknown is flooded</h3>
<p>Every ARP request, every DHCP discover, every frame to an aged-out MAC is replicated to <b>every VTEP</b> in the VNI. On a small fabric this is noise. On a fabric with hundreds of leaves and tens of thousands of virtual machines, broadcast and unknown-unicast traffic becomes a steady load on every leaf's uplinks and on every leaf's CPU-facing path, even for leaves that do not host the destination.</p>

<h3>Limit 2: no control plane</h3>
<p>A VTEP only knows what it has <b>seen</b>. There is no protocol telling LEAF1 "SRV2 is now behind LEAF2", no withdrawal when a host leaves, and no way to know a remote VTEP has failed other than the MAC entries aging out. Convergence after a host move or failure depends on the host sending traffic, often a gratuitous ARP from the hypervisor after vMotion. If that ARP is lost, traffic goes to the old location until the entry ages out (default 1800 seconds for MACs on Nexus).</p>

<h3>Limit 3: static peer lists do not scale</h3>
<p>With static ingress replication, each VTEP lists every other VTEP per VNI. The total number of peer entries grows as <b>N × (N − 1)</b> per VNI. Every new leaf means a change on every existing leaf, every VNI. Configuration drift is almost guaranteed: sooner or later a peer is missing on one leaf, and floods from that leaf do not reach a new rack, as you saw in the BUM chapter. Multicast underlays avoid the lists but bring PIM, RPs and multicast troubleshooting into the underlay.</p>

<div class="eg"><p><b>Worked example.</b> 20 leaves, 50 VNIs, all leaves in all VNIs. Static peer lines = 20 × 19 × 50 = <b>19,000 lines</b> across the fabric. Adding leaf 21 means 50 VNIs × 20 existing leaves = 1,000 new lines on old leaves, plus 1,000 on the new one. With EVPN, the new leaf announces itself once per VNI using an IMET route and every peer list updates automatically: zero lines on old leaves.</p></div>

<h3>Limit 4: ARP flooding and silent hosts</h3>
<p>Because no VTEP knows IP-to-MAC bindings in advance, every ARP request crosses the fabric. There is no <b>ARP suppression</b>: the local leaf cannot answer on behalf of a remote host. Silent hosts (printers, some storage targets, standby cluster nodes) are not known anywhere until they speak; traffic towards them is flooded as unknown unicast each time their entry has aged out.</p>

<h3>Limit 5: routing is centralised</h3>
<p>Flood-and-learn gives you Layer 2. For routing between VNIs you typically place SVIs and HSRP on one pair of switches. Traffic between two VMs in different subnets on the same leaf still travels to that gateway pair and back (<b>hairpinning</b>), which wastes bandwidth and adds latency. There is no built-in multi-tenant Layer 3 (VRF per tenant carried across the fabric).</p>

<h3>Limit 6: trust and security</h3>
<p>A flood-and-learn VTEP learns MACs from any VXLAN packet arriving on UDP 4789 that matches a configured VNI. There is no peer authentication and no way to validate that a remote VTEP should really own a MAC. Infrastructure ACLs at the fabric edge are essential. With EVPN, MACs are learned only from authenticated BGP sessions, and MAC mobility sequence numbers help detect duplicates.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Flood and learn versus EVPN">
<rect x="20" y="15" width="290" height="200" rx="10" fill="#fed7aa"/><text x="165" y="40" text-anchor="middle" class="svg-ink" font-size="14">Flood and learn</text>
<text x="40" y="70" class="svg-ink" font-size="12">Learn MACs from traffic</text>
<text x="40" y="95" class="svg-ink" font-size="12">Static peers or multicast</text>
<text x="40" y="120" class="svg-ink" font-size="12">ARP floods everywhere</text>
<text x="40" y="145" class="svg-ink" font-size="12">Central gateway, hairpins</text>
<text x="40" y="170" class="svg-ink" font-size="12">No peer authentication</text>
<text x="40" y="195" class="svg-muted" font-size="12">show nve peers: LearnType DP</text>
<rect x="330" y="15" width="290" height="200" rx="10" fill="#bbf7d0"/><text x="475" y="40" text-anchor="middle" class="svg-ink" font-size="14">BGP EVPN</text>
<text x="350" y="70" class="svg-ink" font-size="12">MAC/IP routes (type 2)</text>
<text x="350" y="95" class="svg-ink" font-size="12">IMET routes build peer lists</text>
<text x="350" y="120" class="svg-ink" font-size="12">ARP suppression</text>
<text x="350" y="145" class="svg-ink" font-size="12">Distributed anycast gateway</text>
<text x="350" y="170" class="svg-ink" font-size="12">Learning only from BGP peers</text>
<text x="350" y="195" class="svg-muted" font-size="12">show nve peers: LearnType CP</text>
</svg><p class="cap">Same VXLAN data plane on the wire; what changes is how VTEPs learn.</p></div>

<h3>What stays the same with EVPN</h3>
<p>Everything you configured in this module is reused: the underlay, loopback1, <code>feature nv overlay</code>, <code>vn-segment</code>, <code>interface nve1</code> and <code>member vni</code>. EVPN adds <code>host-reachability protocol bgp</code> under nve1, BGP with the L2VPN EVPN address family, and replaces the static peer list with <code>ingress-replication protocol bgp</code>. The packet on the wire is the same 50-byte VXLAN encapsulation.</p>

<div class="warn"><p><b>Common mistake.</b> Thinking EVPN is a different encapsulation from VXLAN. It is not. EVPN is the control plane (BGP), VXLAN is the data plane. "VXLAN EVPN" means VXLAN packets whose MAC and VTEP information is distributed by BGP.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which problems of flood-and-learn does EVPN solve?" Expect: control-plane MAC/IP learning, automatic VTEP discovery for ingress replication, ARP suppression, distributed anycast gateway, multi-tenancy with VRFs, and MAC mobility. EVPN does <b>not</b> remove the need for an IP underlay or change the UDP port.</p></div>

<div class="scn"><h4>Monday morning vMotion storm</h4><p>A company with a 12-leaf flood-and-learn fabric moved 300 VMs to new hosts over a weekend. On Monday some applications could not reach their databases for up to 30 minutes. Several hypervisors had not sent gratuitous ARPs after migration, so remote leaves kept stale MAC entries pointing to the old VTEPs until they aged out, and traffic was delivered to the wrong racks. At the same time, ARP floods from 300 VMs rebuilding caches doubled BUM traffic. The following quarter the team enabled BGP EVPN: host moves were advertised with MAC mobility sequence numbers and converged in seconds, and ARP suppression answered most ARP requests locally.</p><p><b>Lesson:</b> flood-and-learn relies on hosts to announce themselves. A control plane lets the network do it.</p></div>

<div class="iv"><p class="q">"Why would you not deploy flood-and-learn VXLAN in a large production fabric?"</p><p>Strong answer: it has no control plane, so remote MACs are learned only from traffic, host moves converge only when hosts send, and all BUM (including every ARP) is flooded to every VTEP. Static ingress-replication lists grow as N×(N−1) and drift; multicast brings PIM complexity. Routing is centralised, causing hairpins, and there is no peer authentication. BGP EVPN keeps the same VXLAN data plane but adds MAC/IP advertisements, automatic peer discovery (IMET), ARP suppression and a distributed anycast gateway.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flood-and-learn floods every unknown to every VTEP in the VNI.</li>
<li>No control plane: learning, moves and failures depend on host traffic and aging.</li>
<li>Static peer lists scale as N×(N−1) per VNI and drift over time.</li>
<li>No ARP suppression, centralised routing and no VTEP authentication.</li>
<li>BGP EVPN keeps the VXLAN data plane and adds the missing control plane.</li>
</ul></div>
`,hi:`
<p>Bees logon ke office mein corridors mein chillana kaam kar jaata hai. Do hazaar logon ke office mein agar sab din bhar "Priya kaun hai?" chillayein to kaam karna impossible ho jaayega, isliye company ek directory chhapti hai aur jab bhi koi join kare ya desk badle use update karti hai. Flood-and-learn VXLAN chillane wala office hai. Data plane seekhne ka yeh perfect tareeka hai, aur kuch leaves ke liye kaam karta hai, lekin growth jhel nahi paata. Yeh chapter exactly batata hai ki yeh kahan toot-ta hai, kyunki woh breaking points hi BGP EVPN ki feature list hain.</p>

<h3>Limit 1: har unknown flood hota hai</h3>
<p>Har ARP request, har DHCP discover, aged-out MAC ko jaane wala har frame VNI ke <b>har VTEP</b> ko replicate hota hai. Chhote fabric par yeh bas shor hai. Sainkdon leaves aur das hazaaron virtual machines wale fabric par broadcast aur unknown-unicast traffic har leaf ke uplinks aur har leaf ke CPU-facing path par lagataar load ban jaata hai, un leaves ke liye bhi jo destination host nahi karte.</p>

<h3>Limit 2: koi control plane nahi</h3>
<p>VTEP sirf woh jaanta hai jo usne <b>dekha</b> hai. Koi protocol LEAF1 ko nahi batata "SRV2 ab LEAF2 ke peeche hai", host ke jaane par koi withdrawal nahi hota, aur remote VTEP fail hua yeh jaanne ka MAC entries age out hone ke alawa koi tareeka nahi. Host move ya failure ke baad convergence host ke traffic bhejne par depend karta hai, aksar vMotion ke baad hypervisor ka gratuitous ARP. Agar woh ARP kho jaaye, to entry age out hone tak traffic purani location par jaata hai (Nexus par MACs ke liye default 1800 seconds).</p>

<h3>Limit 3: static peer lists scale nahi karti</h3>
<p>Static ingress replication mein har VTEP har VNI ke liye har doosre VTEP ko list karta hai. Peer entries ki total sankhya har VNI ke liye <b>N × (N − 1)</b> ki tarah badhti hai. Har naye leaf ka matlab har existing leaf par, har VNI mein change. Configuration drift lagbhag pakka hai: der-saver kisi leaf par ek peer missing hoga, aur us leaf ke floods naye rack tak nahi pahunchenge, jaisa aapne BUM chapter mein dekha. Multicast underlays lists se bachate hain lekin underlay mein PIM, RPs aur multicast troubleshooting le aate hain.</p>

<div class="eg"><p><b>Worked example.</b> 20 leaves, 50 VNIs, saare leaves saare VNIs mein. Static peer lines = 20 × 19 × 50 = poore fabric mein <b>19,000 lines</b>. Leaf 21 jodne ka matlab purane leaves par 50 VNIs × 20 existing leaves = 1,000 nayi lines, plus naye leaf par 1,000. EVPN ke saath naya leaf har VNI ke liye ek IMET route se ek baar khud ko announce karta hai aur har peer list automatically update ho jaati hai: purane leaves par zero lines.</p></div>

<h3>Limit 4: ARP flooding aur silent hosts</h3>
<p>Kyunki koi VTEP pehle se IP-to-MAC bindings nahi jaanta, har ARP request fabric paar karti hai. Koi <b>ARP suppression</b> nahi hai: local leaf remote host ki taraf se jawab nahi de sakta. Silent hosts (printers, kuch storage targets, standby cluster nodes) jab tak bolte nahi tab tak kahin known nahi hote; unki entry age out hone par har baar unki taraf ka traffic unknown unicast ban kar flood hota hai.</p>

<h3>Limit 5: routing centralised hai</h3>
<p>Flood-and-learn aapko Layer 2 deta hai. VNIs ke beech routing ke liye aap aam taur par SVIs aur HSRP ko switches ke ek pair par rakhte ho. Same leaf par alag subnets ke do VMs ke beech ka traffic bhi us gateway pair tak jaa kar wapas aata hai (<b>hairpinning</b>), jo bandwidth waste karta hai aur latency badhata hai. Built-in multi-tenant Layer 3 (fabric ke paar carry hone wala per-tenant VRF) nahi hai.</p>

<h3>Limit 6: trust aur security</h3>
<p>Flood-and-learn VTEP UDP 4789 par aaye kisi bhi VXLAN packet se MACs seekhta hai jo configured VNI se match kare. Koi peer authentication nahi hai aur yeh validate karne ka koi tareeka nahi ki remote VTEP sach mein kisi MAC ka maalik hona chahiye. Fabric edge par infrastructure ACLs zaroori hain. EVPN ke saath MACs sirf authenticated BGP sessions se seekhe jaate hain, aur MAC mobility sequence numbers duplicates detect karne mein help karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Flood and learn versus EVPN">
<rect x="20" y="15" width="290" height="200" rx="10" fill="#fed7aa"/><text x="165" y="40" text-anchor="middle" class="svg-ink" font-size="14">Flood and learn</text>
<text x="40" y="70" class="svg-ink" font-size="12">Traffic se MACs seekho</text>
<text x="40" y="95" class="svg-ink" font-size="12">Static peers ya multicast</text>
<text x="40" y="120" class="svg-ink" font-size="12">ARP floods har jagah</text>
<text x="40" y="145" class="svg-ink" font-size="12">Central gateway, hairpins</text>
<text x="40" y="170" class="svg-ink" font-size="12">Peer authentication nahi</text>
<text x="40" y="195" class="svg-muted" font-size="12">show nve peers: LearnType DP</text>
<rect x="330" y="15" width="290" height="200" rx="10" fill="#bbf7d0"/><text x="475" y="40" text-anchor="middle" class="svg-ink" font-size="14">BGP EVPN</text>
<text x="350" y="70" class="svg-ink" font-size="12">MAC/IP routes (type 2)</text>
<text x="350" y="95" class="svg-ink" font-size="12">IMET routes peer lists banate hain</text>
<text x="350" y="120" class="svg-ink" font-size="12">ARP suppression</text>
<text x="350" y="145" class="svg-ink" font-size="12">Distributed anycast gateway</text>
<text x="350" y="170" class="svg-ink" font-size="12">Sirf BGP peers se learning</text>
<text x="350" y="195" class="svg-muted" font-size="12">show nve peers: LearnType CP</text>
</svg><p class="cap">Wire par same VXLAN data plane; badalta yeh hai ki VTEPs kaise seekhte hain.</p></div>

<h3>EVPN ke saath kya same rehta hai</h3>
<p>Is module mein aapne jo kuch configure kiya sab reuse hota hai: underlay, loopback1, <code>feature nv overlay</code>, <code>vn-segment</code>, <code>interface nve1</code> aur <code>member vni</code>. EVPN nve1 ke neeche <code>host-reachability protocol bgp</code>, L2VPN EVPN address family ke saath BGP jodta hai, aur static peer list ko <code>ingress-replication protocol bgp</code> se replace karta hai. Wire par packet wahi 50-byte VXLAN encapsulation hai.</p>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki EVPN VXLAN se alag encapsulation hai. Aisa nahi hai. EVPN control plane (BGP) hai, VXLAN data plane hai. "VXLAN EVPN" ka matlab hai aise VXLAN packets jinki MAC aur VTEP information BGP distribute karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "EVPN flood-and-learn ki kaunsi problems solve karta hai?" Expect karo: control-plane MAC/IP learning, ingress replication ke liye automatic VTEP discovery, ARP suppression, distributed anycast gateway, VRFs ke saath multi-tenancy, aur MAC mobility. EVPN IP underlay ki zaroorat <b>nahi</b> hatata aur UDP port nahi badalta.</p></div>

<div class="scn"><h4>Monday subah ka vMotion storm</h4><p>12-leaf flood-and-learn fabric wali ek company ne weekend par 300 VMs naye hosts par move kiye. Monday ko kuch applications 30 minute tak apne databases tak nahi pahunch paaye. Kai hypervisors ne migration ke baad gratuitous ARPs nahi bheje the, isliye remote leaves ne purane VTEPs ko point karti stale MAC entries age out hone tak rakhi, aur traffic galat racks par deliver hua. Saath hi, caches dobara banate 300 VMs ke ARP floods ne BUM traffic double kar diya. Agle quarter team ne BGP EVPN enable kiya: host moves MAC mobility sequence numbers ke saath advertise hue aur seconds mein converge hue, aur ARP suppression ne zyada tar ARP requests ka jawab locally diya.</p><p><b>Seekh:</b> flood-and-learn hosts ke khud ko announce karne par depend karta hai. Control plane yeh kaam network se karwata hai.</p></div>

<div class="iv"><p class="q">"Bade production fabric mein aap flood-and-learn VXLAN deploy kyun nahi karoge?"</p><p>Strong answer: iska koi control plane nahi hai, isliye remote MACs sirf traffic se seekhe jaate hain, host moves tabhi converge hote hain jab hosts bhejte hain, aur saara BUM (har ARP samet) har VTEP ko flood hota hai. Static ingress-replication lists N×(N−1) ki tarah badhti hain aur drift hoti hain; multicast PIM ki complexity laata hai. Routing centralised hai jisse hairpins hote hain, aur peer authentication nahi hai. BGP EVPN same VXLAN data plane rakhta hai lekin MAC/IP advertisements, automatic peer discovery (IMET), ARP suppression aur distributed anycast gateway jodta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flood-and-learn har unknown ko VNI ke har VTEP ko flood karta hai.</li>
<li>Koi control plane nahi: learning, moves aur failures host traffic aur aging par depend karte hain.</li>
<li>Static peer lists har VNI ke liye N×(N−1) ki tarah scale hoti hain aur samay ke saath drift hoti hain.</li>
<li>ARP suppression nahi, centralised routing aur VTEP authentication nahi.</li>
<li>BGP EVPN VXLAN data plane rakhta hai aur missing control plane jodta hai.</li>
</ul></div>
`}};export{e as default};