var e={id:`network-tiers`,h:{en:`Access, aggregation, core and edge: roles, topologies and trade-offs`,hi:`Access, aggregation, core aur edge: roles, topologies aur trade-offs`},body:{en:`
<p>Each tier has a purpose, a typical topology and a failure budget. This chapter walks the tiers, the router roles inside them and the design trade-offs you must be able to defend in an SPCOR scenario.</p>

<h3>Access</h3>
<p>The access tier reaches the customer: a fibre or copper line, a coax cable, a mobile cell site or a business Ethernet circuit. It has the <b>highest number of devices and ports</b> and the lowest bandwidth per device, so it is built for low cost, small power and ease of deployment. Typical topologies are <b>hub-and-spoke</b> (each access node on a fibre to the aggregation site) and <b>rings</b> (a ring of access nodes, protected by a ring protocol or by two uplinks). Access devices often do Layer 2 only, and sometimes simple Layer 3 at cell sites. Detailed technologies come in the next chapter.</p>

<h3>Aggregation (pre-aggregation and aggregation)</h3>
<p>Aggregation collects hundreds or thousands of access links onto fewer, faster uplinks. It is where many operators apply <b>service-level policy</b>: QoS classification and marking, subscriber handling, and VLAN or label mapping into the service. It is also where <b>oversubscription</b> is decided. If 100 access links at 1 Gbps feed a 10 Gbps uplink, the ratio is 10:1. Operators choose ratios based on measured traffic, not on the sum of port speeds.</p>
<p>Large networks use two stages: <b>pre-aggregation</b> (close to the access) and <b>aggregation</b> (a metro hub). Topologies are typically <b>dual-homed hub-and-spoke</b> or <b>rings of aggregation nodes</b>. A pair of aggregation routers gives node redundancy.</p>

<h3>Core</h3>
<p>The core connects aggregation sites and edges with <b>high-capacity, simple, fast-converging</b> forwarding. Typical designs are a partial mesh or a ring of core sites with ECMP over many links. The core carries labelled traffic (MPLS or segment routing) so that it does not need to know customer routes. This is why a P router holds only IGP and label information. Because the core carries everything, it is built for <b>very high availability</b>, with redundant routers, line cards and links, and strict change control.</p>

<h3>Edge and peering</h3>
<p>The edge has several roles, often on different devices.</p>
<table class="cmp"><tr><th>Role</th><th>Function</th></tr>
<tr><td>PE (service edge)</td><td>Connects enterprise customers; holds VRFs, pseudowires, EVPN instances</td></tr>
<tr><td>BNG / BRAS</td><td>Terminates broadband subscriber sessions, authentication, per-subscriber policy</td></tr>
<tr><td>Mobile packet core attachment</td><td>Connects to the mobile core and cell-site transport</td></tr>
<tr><td>Internet gateway / peering router</td><td>eBGP with transit providers and peers, with filters and policy</td></tr>
<tr><td>Data-centre interconnect</td><td>Connects provider data centres and cloud on-ramps</td></tr>
<tr><td>Route reflector (RR)</td><td>Distributes BGP routes to PEs without a full mesh</td></tr></table>
<p>Note: the Internet gateway row uses eBGP (external BGP) with other autonomous systems.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Typical SP topology">
<rect x="20" y="20" width="90" height="36" rx="6" fill="#bae6fd"/><text x="65" y="43" text-anchor="middle" class="svg-ink" font-size="12">Access A</text>
<rect x="20" y="170" width="90" height="36" rx="6" fill="#bae6fd"/><text x="65" y="193" text-anchor="middle" class="svg-ink" font-size="12">Access B</text>
<rect x="180" y="60" width="90" height="36" rx="6" fill="#bbf7d0"/><text x="225" y="83" text-anchor="middle" class="svg-ink" font-size="12">Agg 1</text>
<rect x="180" y="150" width="90" height="36" rx="6" fill="#bbf7d0"/><text x="225" y="173" text-anchor="middle" class="svg-ink" font-size="12">Agg 2</text>
<rect x="340" y="30" width="80" height="36" rx="6" fill="#ddd6fe"/><text x="380" y="53" text-anchor="middle" class="svg-ink" font-size="12">Core 1</text>
<rect x="340" y="180" width="80" height="36" rx="6" fill="#ddd6fe"/><text x="380" y="203" text-anchor="middle" class="svg-ink" font-size="12">Core 2</text>
<rect x="500" y="60" width="120" height="36" rx="6" fill="#fde68a"/><text x="560" y="83" text-anchor="middle" class="svg-ink" font-size="12">Internet GW</text>
<rect x="500" y="150" width="120" height="36" rx="6" fill="#fde68a"/><text x="560" y="173" text-anchor="middle" class="svg-ink" font-size="12">PE / BNG</text>
<g stroke="#64748b" stroke-width="2"><line x1="110" y1="38" x2="180" y2="78"/><line x1="110" y1="38" x2="180" y2="168"/><line x1="110" y1="188" x2="180" y2="78"/><line x1="110" y1="188" x2="180" y2="168"/><line x1="270" y1="78" x2="340" y2="48"/><line x1="270" y1="78" x2="340" y2="198"/><line x1="270" y1="168" x2="340" y2="48"/><line x1="270" y1="168" x2="340" y2="198"/><line x1="380" y1="66" x2="380" y2="180"/><line x1="420" y1="48" x2="500" y2="78"/><line x1="420" y1="198" x2="500" y2="168"/><line x1="420" y1="48" x2="500" y2="168"/><line x1="420" y1="198" x2="500" y2="78"/></g>
</svg><p class="cap">A dual-homed, redundant tiered topology: no single node failure isolates a tier.</p></div>

<h3>Design principles</h3>
<ul>
<li><b>Dual-home each tier</b> to two devices in the tier above. Single points of failure are only accepted in the access tier, where the blast radius is small.</li>
<li><b>Failure domains</b>: keep them small and predictable. A fault should affect a bounded number of subscribers.</li>
<li><b>Keep the core simple</b>: no customer state, few protocols, high speeds.</li>
<li><b>Push state to the edge</b>: VRFs, subscriber sessions, NAT and policy belong at the PE or BNG.</li>
<li><b>Hierarchy limits routing scale</b>: IGP areas or levels, summarisation and BGP labelled-unicast (covered in the next design chapter) keep tables small.</li>
<li><b>Capacity planning</b>: plan for the failure case. A link must carry the traffic of its failed neighbour without dropping, so in a pair each link should normally stay below about 50 percent, and with n parallel links the safe load per link is about (n-1)/n of capacity.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A pair of aggregation routers each have a 100 Gbps uplink to the core. Normal load is 70 Gbps in total (35 per link). If one uplink fails, all 70 Gbps must use the other 100 Gbps link: 70 percent. That fits. If normal load were 120 Gbps (60 per link), a failure would need 120 Gbps on a 100 Gbps link and traffic would be dropped. The rule: the sum of loads on the pair must be below one link's capacity if you want a single failure to be invisible.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sizing for the normal case only; letting access rings share a single aggregation node; and putting complex services in the core.</p></div>
<div class="exam"><p><b>Exam trap.</b> The PE holds service state (VRFs, pseudowires). The P router does not. The route reflector is a control-plane function and does not need to be in the forwarding path.</p></div>

<div class="scn"><h4>The uplink that was fine until it was needed</h4><p>An aggregation pair ran at 60 percent on each uplink. A fibre cut moved one link's load to the other, which then ran at 120 percent. Customers saw packet loss until the fibre was repaired. The operator then adopted a rule: planned utilisation must allow a single failure with headroom.</p><p><b>Lesson:</b> capacity planning must include the failure case.</p></div>

<div class="iv"><p class="q">"What are the main design principles of a service provider network?"</p><p>Hierarchy (access, aggregation, core, edge), redundancy at each tier, small failure domains, a simple high-speed core with service state at the edge, summarisation to limit routing state, and capacity planned for the failure case.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Access reaches users; aggregation collects and applies policy; core transports; edge connects out.</li>
<li>Dual-home each tier and keep failure domains small.</li>
<li>Service state lives at the PE or BNG, not the core.</li>
<li>Plan capacity for single failures, not just normal load.</li>
<li>Route reflectors scale BGP without a full mesh.</li>
</ul></div>
`,hi:`
<p>Har tier ka ek purpose, ek typical topology aur ek failure budget hota hai. Yeh chapter tiers, unke andar router roles aur woh design trade-offs walk karta hai jinhe aapko SPCOR scenario mein defend karna aana chahiye.</p>

<h3>Access</h3>
<p>Access tier customer tak pahunchta hai: fibre ya copper line, coax cable, mobile cell site ya business Ethernet circuit. Ismein <b>sabse zyaada devices aur ports</b> hote hain aur har device par sabse kam bandwidth, isliye yeh low cost, kam power aur aasaan deployment ke liye banaya jaata hai. Typical topologies <b>hub-and-spoke</b> (har access node aggregation site tak fibre par) aur <b>rings</b> (access nodes ki ring, ring protocol ya do uplinks se protected) hain. Access devices aksar sirf Layer 2 karte hain, aur kabhi kabhi cell sites par simple Layer 3. Detailed technologies agle chapter mein hain.</p>

<h3>Aggregation (pre-aggregation aur aggregation)</h3>
<p>Aggregation saikdon ya hazaron access links ko kam, tez uplinks par ikattha karta hai. Yahan kai operators <b>service-level policy</b> lagate hain: QoS classification aur marking, subscriber handling, aur service mein VLAN ya label mapping. Yahin <b>oversubscription</b> tay hota hai. Agar 100 access links 1 Gbps ke 10 Gbps uplink ko feed karte hain, ratio 10:1 hai. Operators ratios port speeds ke sum se nahi, measured traffic se chunte hain.</p>
<p>Bade networks do stages use karte hain: <b>pre-aggregation</b> (access ke paas) aur <b>aggregation</b> (metro hub). Topologies aam taur par <b>dual-homed hub-and-spoke</b> ya <b>aggregation nodes ki rings</b> hoti hain. Aggregation routers ki pair node redundancy deti hai.</p>

<h3>Core</h3>
<p>Core aggregation sites aur edges ko <b>high-capacity, simple, fast-converging</b> forwarding se jodta hai. Typical designs core sites ka partial mesh ya ring hote hain jisme kai links par ECMP hota hai. Core labelled traffic (MPLS ya segment routing) carry karta hai taaki use customer routes jaanne ki zaroorat na ho. Isi wajah se P router sirf IGP aur label information rakhta hai. Kyunki core sab kuch carry karta hai, yeh redundant routers, line cards aur links, aur strict change control ke saath <b>bahut high availability</b> ke liye banaya jaata hai.</p>

<h3>Edge aur peering</h3>
<p>Edge ke kai roles hote hain, aksar alag devices par.</p>
<table class="cmp"><tr><th>Role</th><th>Function</th></tr>
<tr><td>PE (service edge)</td><td>Enterprise customers ko jodta hai; VRFs, pseudowires, EVPN instances rakhta hai</td></tr>
<tr><td>BNG / BRAS</td><td>Broadband subscriber sessions, authentication, per-subscriber policy terminate karta hai</td></tr>
<tr><td>Mobile packet core attachment</td><td>Mobile core aur cell-site transport se jodta hai</td></tr>
<tr><td>Internet gateway / peering router</td><td>Transit providers aur peers ke saath eBGP, filters aur policy ke saath</td></tr>
<tr><td>Data-centre interconnect</td><td>Provider data centres aur cloud on-ramps ko jodta hai</td></tr>
<tr><td>Route reflector (RR)</td><td>Full mesh ke bina PEs ko BGP routes distribute karta hai</td></tr></table>
<p>Note: Internet gateway row doosre autonomous systems ke saath eBGP (external BGP) use karti hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Typical SP topology">
<rect x="20" y="20" width="90" height="36" rx="6" fill="#bae6fd"/><text x="65" y="43" text-anchor="middle" class="svg-ink" font-size="12">Access A</text>
<rect x="20" y="170" width="90" height="36" rx="6" fill="#bae6fd"/><text x="65" y="193" text-anchor="middle" class="svg-ink" font-size="12">Access B</text>
<rect x="180" y="60" width="90" height="36" rx="6" fill="#bbf7d0"/><text x="225" y="83" text-anchor="middle" class="svg-ink" font-size="12">Agg 1</text>
<rect x="180" y="150" width="90" height="36" rx="6" fill="#bbf7d0"/><text x="225" y="173" text-anchor="middle" class="svg-ink" font-size="12">Agg 2</text>
<rect x="340" y="30" width="80" height="36" rx="6" fill="#ddd6fe"/><text x="380" y="53" text-anchor="middle" class="svg-ink" font-size="12">Core 1</text>
<rect x="340" y="180" width="80" height="36" rx="6" fill="#ddd6fe"/><text x="380" y="203" text-anchor="middle" class="svg-ink" font-size="12">Core 2</text>
<rect x="500" y="60" width="120" height="36" rx="6" fill="#fde68a"/><text x="560" y="83" text-anchor="middle" class="svg-ink" font-size="12">Internet GW</text>
<rect x="500" y="150" width="120" height="36" rx="6" fill="#fde68a"/><text x="560" y="173" text-anchor="middle" class="svg-ink" font-size="12">PE / BNG</text>
<g stroke="#64748b" stroke-width="2"><line x1="110" y1="38" x2="180" y2="78"/><line x1="110" y1="38" x2="180" y2="168"/><line x1="110" y1="188" x2="180" y2="78"/><line x1="110" y1="188" x2="180" y2="168"/><line x1="270" y1="78" x2="340" y2="48"/><line x1="270" y1="78" x2="340" y2="198"/><line x1="270" y1="168" x2="340" y2="48"/><line x1="270" y1="168" x2="340" y2="198"/><line x1="380" y1="66" x2="380" y2="180"/><line x1="420" y1="48" x2="500" y2="78"/><line x1="420" y1="198" x2="500" y2="168"/><line x1="420" y1="48" x2="500" y2="168"/><line x1="420" y1="198" x2="500" y2="78"/></g>
</svg><p class="cap">Dual-homed, redundant tiered topology: koi single node failure kisi tier ko isolate nahi karta.</p></div>

<h3>Design principles</h3>
<ul>
<li><b>Har tier ko dual-home karo</b> upar ke tier ke do devices se. Single points of failure sirf access tier mein accept hote hain, jahan blast radius chhota hai.</li>
<li><b>Failure domains</b>: unhe chhota aur predictable rakho. Fault ek bounded number ke subscribers ko affect kare.</li>
<li><b>Core simple rakho</b>: customer state nahi, kam protocols, high speeds.</li>
<li><b>State edge ki taraf dhakelo</b>: VRFs, subscriber sessions, NAT aur policy PE ya BNG par honi chahiye.</li>
<li><b>Hierarchy routing scale limit karti hai</b>: IGP areas ya levels, summarisation aur BGP labelled-unicast (agle design chapter mein) tables chhote rakhte hain.</li>
<li><b>Capacity planning</b>: failure case ke liye plan karo. Link ko apne failed neighbour ka traffic bina drop kiye carry karna chahiye, isliye pair mein har link normally lagbhag 50 percent se neeche rehna chahiye, aur n parallel links ke saath per link safe load lagbhag (n-1)/n capacity hota hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Aggregation routers ki pair ke har ek ka core tak 100 Gbps uplink hai. Normal load kul 70 Gbps hai (35 per link). Agar ek uplink fail ho, to saare 70 Gbps doosre 100 Gbps link par jaate hain: 70 percent. Yeh fit hota hai. Agar normal load 120 Gbps (60 per link) hota, to failure par 100 Gbps link par 120 Gbps chahiye hota aur traffic drop hota. Rule: pair par loads ka sum ek link ki capacity se kam hona chahiye agar single failure ko invisible rakhna hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sirf normal case ke liye size karna; access rings ko ek hi aggregation node share karne dena; aur core mein complex services rakhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> PE service state (VRFs, pseudowires) rakhta hai. P router nahi. Route reflector control-plane function hai aur use forwarding path mein hona zaroori nahi.</p></div>

<div class="scn"><h4>Uplink jo tab tak theek tha jab tak zaroorat nahi padi</h4><p>Aggregation pair har uplink par 60 percent par chal rahi thi. Fibre cut ne ek link ka load doosre par daal diya, jo 120 percent par chala. Customers ne fibre repair hone tak packet loss dekha. Operator ne phir rule apnaya: planned utilisation single failure ko headroom ke saath allow kare.</p><p><b>Lesson:</b> capacity planning mein failure case shamil hona chahiye.</p></div>

<div class="iv"><p class="q">"Service provider network ke main design principles kya hain?"</p><p>Hierarchy (access, aggregation, core, edge), har tier par redundancy, chhote failure domains, simple high-speed core jisme service state edge par ho, routing state limit karne ke liye summarisation, aur failure case ke liye planned capacity.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Access users tak pahunchta hai; aggregation ikattha karta aur policy lagata hai; core transport karta hai; edge bahar jodta hai.</li>
<li>Har tier dual-home karo aur failure domains chhote rakho.</li>
<li>Service state PE ya BNG par rehti hai, core mein nahi.</li>
<li>Single failures ke liye capacity plan karo, sirf normal load ke liye nahi.</li>
<li>Route reflectors full mesh ke bina BGP scale karte hain.</li>
</ul></div>
`}};export{e as default};