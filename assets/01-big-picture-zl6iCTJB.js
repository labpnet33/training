var e={id:`big-picture`,h:{en:`The big picture: who you are vs where you are`,hi:`Big picture: aap kaun ho vs aap kahan ho`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to explain why the Internet mixes up "who a host is" with "where a host is", describe how <b>LISP</b> (Locator/ID Separation Protocol) separates the two, walk a packet through Map-Register, Map-Request and Map-Reply, configure a LISP map-server and two xTRs on IOS XE, read <code>show lisp site</code> and <code>show ip lisp map-cache</code>, explain <b>VXLAN</b> byte by byte, build a flood-and-learn VXLAN segment between two VTEPs, and explain how Cisco <b>SD-Access</b> glues LISP, VXLAN and SGTs together. This covers ENCOR 350-401 v1.2 objective <b>2.3 Describe network virtualization concepts: LISP and VXLAN</b>.</p>

<p><b>Prerequisites.</b> You should be comfortable with IPv4 addressing and subnetting, the routing table, OSPF basics, VLANs and MAC learning on a switch, and the idea of a tunnel (GRE) from the previous module <b>VRF, GRE and IPsec</b>. If "encapsulation" sounds new, reread the GRE chapter first: LISP and VXLAN are both tunnels with a smarter brain.</p>

<h3>An analogy: your mobile number and the tower</h3>
<p>Your mobile number identifies <b>you</b>. It does not tell anybody which tower you are connected to right now. When a friend calls you, the mobile network looks you up in a database (the home location register) and finds the tower that currently serves you. Walk from Delhi to Mumbai and your number stays the same; only the database entry changes.</p>
<p>Classic IP does not work like that. An IP address is both your <b>name</b> and your <b>street address</b>. Routers forward on it, so it must be topologically correct. Move a server to another data center and it needs a new address, the DNS record changes, firewall rules break and every session drops. That double duty is called the <b>identity/location problem</b>, and it causes three real pains:</p>
<ul>
<li><b>Mobility is hard.</b> A VM or a laptop that moves between sites or floors must change IP, or the network must carry a special host route for it everywhere.</li>
<li><b>Routing tables explode.</b> Every multihomed site advertises its own prefix into the core, so the core must know everything. The global BGP table is past a million IPv4 routes.</li>
<li><b>Multihoming and traffic engineering are clumsy.</b> Steering inbound traffic across two ISPs needs AS-path prepending and more-specific tricks.</li>
</ul>

<h3>The two ideas of this module</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="LISP and VXLAN overview">
<rect x="20" y="20" width="280" height="100" rx="10" fill="#bae6fd"/>
<text x="160" y="46" text-anchor="middle" class="svg-ink" font-size="14">LISP</text>
<text x="160" y="68" text-anchor="middle" class="svg-muted" font-size="12">EID = who (10.1.1.10)</text>
<text x="160" y="86" text-anchor="middle" class="svg-muted" font-size="12">RLOC = where (100.64.1.2)</text>
<text x="160" y="104" text-anchor="middle" class="svg-accent" font-size="12">map-server answers on demand</text>
<rect x="340" y="20" width="280" height="100" rx="10" fill="#bbf7d0"/>
<text x="480" y="46" text-anchor="middle" class="svg-ink" font-size="14">VXLAN</text>
<text x="480" y="68" text-anchor="middle" class="svg-muted" font-size="12">Ethernet frame inside UDP 4789</text>
<text x="480" y="86" text-anchor="middle" class="svg-muted" font-size="12">24-bit VNI, VTEP to VTEP</text>
<text x="480" y="104" text-anchor="middle" class="svg-accent" font-size="12">stretches Layer 2 over Layer 3</text>
<rect x="120" y="160" width="400" height="70" rx="10" fill="#ddd6fe"/>
<text x="320" y="186" text-anchor="middle" class="svg-ink" font-size="14">SD-Access fabric</text>
<text x="320" y="208" text-anchor="middle" class="svg-muted" font-size="12">LISP control plane + VXLAN data plane + SGT policy</text>
<line x1="160" y1="120" x2="240" y2="160" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="120" x2="400" y2="160" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">LISP answers "where is this endpoint?", VXLAN carries the frame there, and SD-Access combines them.</p></div>

<p><b>LISP</b> gives hosts an <b>EID</b> (Endpoint Identifier, "who") and gives the router in front of the site an <b>RLOC</b> (Routing Locator, "where"). The core routes only RLOCs. A <b>map-server</b> keeps the EID-to-RLOC database, and routers ask it only when traffic needs an answer, exactly like the phone network asking the location register. LISP is an IETF standard, now RFC 9300 (data plane) and RFC 9301 (control plane).</p>
<p><b>VXLAN</b> (Virtual eXtensible LAN, RFC 7348) wraps a complete Ethernet frame inside UDP so that one Layer 2 segment can stretch across a routed IP network. Segments are numbered with a 24-bit <b>VNI</b>, and the devices that wrap and unwrap are <b>VTEPs</b>.</p>
<p>They meet in <b>SD-Access</b>: LISP decides where an endpoint lives, VXLAN carries its traffic, and a Scalable Group Tag (SGT) in the VXLAN header carries its security group.</p>

<h3>Overlay and underlay, one more time</h3>
<p>Both technologies create an <b>overlay</b>: a virtual network whose addresses ride inside packets of a simpler <b>underlay</b>. The underlay only needs to route between tunnel endpoints (RLOCs or VTEP loopbacks), usually with OSPF or IS-IS. It never learns the overlay addresses. That is why the core in our LISP lab has no route to 10.1.1.0/24 or 10.2.2.0/24 and still delivers the traffic.</p>

<div class="eg"><p><b>Worked example: the labs in this module.</b> In the LISP lab, PC1 (10.1.1.10) sits behind XTR1 (RLOC 100.64.1.2) and PC2 (10.2.2.10) sits behind XTR2 (RLOC 100.64.2.2). MSMR (100.64.3.2) is the map-server and map-resolver. CORE runs OSPF for 100.64.x.x only. In the VXLAN lab, PC1 (192.168.10.11) and PC2 (192.168.10.12) are in VLAN 10 on VTEP1 (loopback 1.1.1.1) and VTEP2 (loopback 2.2.2.2), joined by SPINE over a routed OSPF underlay. VLAN 10 maps to VNI 10010.</p></div>

<h3>How the module is organised</h3>
<ol>
<li>Chapters 2 to 6: LISP terms, control plane packet walks, data plane, IOS XE configuration and verification, mobility and interworking.</li>
<li>Chapters 7 to 9: VXLAN header, flood and learn versus control planes, configuration on NX-OS and IOS XE.</li>
<li>Chapter 10: SD-Access, where LISP, VXLAN and SGT work together.</li>
<li>Chapter 11: a troubleshooting workflow that walks all three labs.</li>
<li>Chapter 12: summary, glossary and exam checklist.</li>
</ol>
<p>The ENCOR blueprint says "describe", so the exam mostly tests concepts: terms, message names, ports, header sizes and roles. The labs let you prove those concepts with real commands, which is what interviews reward.</p>

<div class="warn"><p><b>Common mistake.</b> Thinking LISP or VXLAN replace the routing protocol. They do not. The underlay still needs a working IGP between RLOCs or VTEP loopbacks. If the underlay is broken, the overlay is broken, every time.</p></div>

<div class="exam"><p><b>Exam trap.</b> LISP separates identity from location; VXLAN extends Layer 2 segments. Do not swap them. VXLAN by itself has no idea where an endpoint lives; it needs flooding or a control plane (BGP EVPN or LISP) to find out.</p></div>

<div class="scn"><h4>The data center move that broke everything</h4><p>A retailer moved its billing VMs from the old data center to a new one over a weekend. Each VM got a new IP in the new subnet. On Monday, partner firewalls still allowed only the old addresses, a hard-coded IP in a payment script failed, and DNS caches kept pointing to the old site for hours. The network team's post-mortem proposed an overlay (a VXLAN stretch for the migration window and LISP-style host mobility for the long term) so that VMs keep their identity while their location changes.</p><p><b>Lesson:</b> when identity and location are the same number, every move is a readdressing project. Overlays exist to break that link.</p></div>

<div class="iv"><p class="q">"In one minute, what problem does LISP solve and what problem does VXLAN solve?"</p><p>Strong answer: LISP splits the IP address into an identifier (EID) and a locator (RLOC), with a mapping system that resolves one to the other on demand; that gives mobility, smaller core tables and easier multihoming. VXLAN is a MAC-in-UDP encapsulation that stretches Layer 2 segments across a routed underlay with 16 million VNIs. Finish by saying SD-Access uses LISP as the control plane and VXLAN as the data plane.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A classic IP address is both identity and location; that causes mobility pain and routing table growth.</li>
<li>LISP: EID = who, RLOC = where, a map-server resolves EIDs to RLOCs on demand.</li>
<li>VXLAN: Ethernet frames in UDP 4789 between VTEPs, 24-bit VNI.</li>
<li>Both are overlays; the underlay only routes RLOCs or VTEP loopbacks.</li>
<li>SD-Access = LISP control plane + VXLAN data plane + SGT policy.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap samjha paoge ki Internet "host kaun hai" aur "host kahan hai" ko kyun mila deta hai, <b>LISP</b> (Locator/ID Separation Protocol) in dono ko kaise alag karta hai, Map-Register, Map-Request aur Map-Reply mein packet ka safar kaise hota hai, IOS XE par LISP map-server aur do xTRs configure kar paoge, <code>show lisp site</code> aur <code>show ip lisp map-cache</code> padh paoge, <b>VXLAN</b> ko byte-by-byte samjha paoge, do VTEPs ke beech flood-and-learn VXLAN segment bana paoge, aur samjha paoge ki Cisco <b>SD-Access</b> LISP, VXLAN aur SGTs ko kaise jodta hai. Yeh ENCOR 350-401 v1.2 ka objective <b>2.3 Describe network virtualization concepts: LISP and VXLAN</b> cover karta hai.</p>

<p><b>Prerequisites.</b> Aapko IPv4 addressing aur subnetting, routing table, OSPF basics, VLANs aur switch par MAC learning, aur pichhle module <b>VRF, GRE aur IPsec</b> se tunnel (GRE) ka idea aana chahiye. Agar "encapsulation" naya lagta hai to pehle GRE chapter dobara padho: LISP aur VXLAN dono tunnels hi hain, bas zyada smart dimaag ke saath.</p>

<h3>Ek analogy: aapka mobile number aur tower</h3>
<p>Aapka mobile number <b>aapko</b> pehchanta hai. Yeh kisi ko nahi batata ki abhi aap kaunse tower se jude ho. Jab dost call karta hai, mobile network aapko ek database (home location register) mein dhoondta hai aur woh tower nikaalta hai jo abhi aapko serve kar raha hai. Delhi se Mumbai chale jao, number wahi rehta hai; sirf database entry badalti hai.</p>
<p>Classic IP aise kaam nahi karta. IP address aapka <b>naam</b> bhi hai aur <b>ghar ka pata</b> bhi. Routers usi par forward karte hain, isliye use topology ke hisaab se sahi hona padta hai. Server ko doosre data center mein le jao to use naya address chahiye, DNS record badalta hai, firewall rules toot jaate hain aur har session drop hota hai. Is double duty ko <b>identity/location problem</b> kehte hain, aur isse teen asli dard hote hain:</p>
<ul>
<li><b>Mobility mushkil hai.</b> Jo VM ya laptop sites ya floors ke beech move karta hai use IP badalna padta hai, ya network ko uske liye har jagah special host route le jaana padta hai.</li>
<li><b>Routing tables phat jaati hain.</b> Har multihomed site apna prefix core mein advertise karti hai, isliye core ko sab kuch pata hona chahiye. Global BGP table das lakh se zyada IPv4 routes paar kar chuki hai.</li>
<li><b>Multihoming aur traffic engineering bhaddi hain.</b> Do ISPs ke beech inbound traffic mode karne ke liye AS-path prepending aur more-specific jugaad chahiye.</li>
</ul>

<h3>Is module ke do ideas</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="LISP aur VXLAN overview">
<rect x="20" y="20" width="280" height="100" rx="10" fill="#bae6fd"/>
<text x="160" y="46" text-anchor="middle" class="svg-ink" font-size="14">LISP</text>
<text x="160" y="68" text-anchor="middle" class="svg-muted" font-size="12">EID = kaun (10.1.1.10)</text>
<text x="160" y="86" text-anchor="middle" class="svg-muted" font-size="12">RLOC = kahan (100.64.1.2)</text>
<text x="160" y="104" text-anchor="middle" class="svg-accent" font-size="12">map-server zaroorat par jawab deta hai</text>
<rect x="340" y="20" width="280" height="100" rx="10" fill="#bbf7d0"/>
<text x="480" y="46" text-anchor="middle" class="svg-ink" font-size="14">VXLAN</text>
<text x="480" y="68" text-anchor="middle" class="svg-muted" font-size="12">Ethernet frame UDP 4789 ke andar</text>
<text x="480" y="86" text-anchor="middle" class="svg-muted" font-size="12">24-bit VNI, VTEP se VTEP</text>
<text x="480" y="104" text-anchor="middle" class="svg-accent" font-size="12">Layer 3 par Layer 2 failata hai</text>
<rect x="120" y="160" width="400" height="70" rx="10" fill="#ddd6fe"/>
<text x="320" y="186" text-anchor="middle" class="svg-ink" font-size="14">SD-Access fabric</text>
<text x="320" y="208" text-anchor="middle" class="svg-muted" font-size="12">LISP control plane + VXLAN data plane + SGT policy</text>
<line x1="160" y1="120" x2="240" y2="160" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="120" x2="400" y2="160" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">LISP batata hai "yeh endpoint kahan hai?", VXLAN frame ko wahan le jaata hai, aur SD-Access dono ko jodta hai.</p></div>

<p><b>LISP</b> hosts ko ek <b>EID</b> (Endpoint Identifier, "kaun") deta hai aur site ke saamne wale router ko ek <b>RLOC</b> (Routing Locator, "kahan"). Core sirf RLOCs route karta hai. Ek <b>map-server</b> EID-se-RLOC database rakhta hai, aur routers usse tabhi poochte hain jab traffic ko jawab chahiye, bilkul waise jaise phone network location register se poochta hai. LISP ek IETF standard hai, ab RFC 9300 (data plane) aur RFC 9301 (control plane).</p>
<p><b>VXLAN</b> (Virtual eXtensible LAN, RFC 7348) poore Ethernet frame ko UDP ke andar lapet-ta hai taaki ek Layer 2 segment routed IP network ke paar fail sake. Segments ko 24-bit <b>VNI</b> se number kiya jaata hai, aur jo devices lapet-te aur kholte hain unhe <b>VTEPs</b> kehte hain.</p>
<p>Dono <b>SD-Access</b> mein milte hain: LISP decide karta hai endpoint kahan rehta hai, VXLAN uska traffic le jaata hai, aur VXLAN header mein ek Scalable Group Tag (SGT) uska security group le jaata hai.</p>

<h3>Overlay aur underlay, ek baar aur</h3>
<p>Dono technologies ek <b>overlay</b> banati hain: ek virtual network jiske addresses ek simple <b>underlay</b> ke packets ke andar safar karte hain. Underlay ko sirf tunnel endpoints (RLOCs ya VTEP loopbacks) ke beech route karna hota hai, aam taur par OSPF ya IS-IS se. Woh overlay addresses kabhi nahi seekhta. Isiliye hamare LISP lab mein core ke paas 10.1.1.0/24 ya 10.2.2.0/24 ka route nahi hai aur phir bhi traffic deliver hota hai.</p>

<div class="eg"><p><b>Worked example: is module ki labs.</b> LISP lab mein PC1 (10.1.1.10) XTR1 (RLOC 100.64.1.2) ke peeche hai aur PC2 (10.2.2.10) XTR2 (RLOC 100.64.2.2) ke peeche. MSMR (100.64.3.2) map-server aur map-resolver hai. CORE sirf 100.64.x.x ke liye OSPF chalata hai. VXLAN lab mein PC1 (192.168.10.11) aur PC2 (192.168.10.12) VLAN 10 mein VTEP1 (loopback 1.1.1.1) aur VTEP2 (loopback 2.2.2.2) par hain, jo SPINE ke through routed OSPF underlay se jude hain. VLAN 10 VNI 10010 se map hota hai.</p></div>

<h3>Module ka structure</h3>
<ol>
<li>Chapters 2 se 6: LISP terms, control plane packet walks, data plane, IOS XE configuration aur verification, mobility aur interworking.</li>
<li>Chapters 7 se 9: VXLAN header, flood and learn vs control planes, NX-OS aur IOS XE par configuration.</li>
<li>Chapter 10: SD-Access, jahan LISP, VXLAN aur SGT saath kaam karte hain.</li>
<li>Chapter 11: troubleshooting workflow jo teeno labs ko walk karta hai.</li>
<li>Chapter 12: summary, glossary aur exam checklist.</li>
</ol>
<p>ENCOR blueprint "describe" kehta hai, isliye exam zyada tar concepts test karta hai: terms, message names, ports, header sizes aur roles. Labs aapko woh concepts real commands se prove karne deti hain, aur interviews mein yahi kaam aata hai.</p>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki LISP ya VXLAN routing protocol ko replace karte hain. Nahi karte. Underlay ko ab bhi RLOCs ya VTEP loopbacks ke beech chalta hua IGP chahiye. Underlay toota to overlay tootega, har baar.</p></div>

<div class="exam"><p><b>Exam trap.</b> LISP identity ko location se alag karta hai; VXLAN Layer 2 segments ko extend karta hai. Inhe ulto mat. VXLAN akele ko pata nahi hota endpoint kahan rehta hai; use pata karne ke liye flooding ya control plane (BGP EVPN ya LISP) chahiye.</p></div>

<div class="scn"><h4>Data center move jisne sab tod diya</h4><p>Ek retailer ne weekend par apne billing VMs purane data center se naye mein shift kiye. Har VM ko naye subnet mein naya IP mila. Monday ko partner firewalls sirf purane addresses allow kar rahe the, ek payment script mein hard-coded IP fail hua, aur DNS caches ghanton tak purani site ki taraf point karte rahe. Network team ke post-mortem ne ek overlay suggest kiya (migration window ke liye VXLAN stretch aur long term ke liye LISP-style host mobility) taaki VMs ki identity wahi rahe jabki location badle.</p><p><b>Seekh:</b> jab identity aur location ek hi number ho, to har move ek readdressing project ban jaata hai. Overlays isi rishte ko todne ke liye hain.</p></div>

<div class="iv"><p class="q">"Ek minute mein batao, LISP kaunsi problem solve karta hai aur VXLAN kaunsi?"</p><p>Strong answer: LISP IP address ko identifier (EID) aur locator (RLOC) mein baant-ta hai, ek mapping system ke saath jo zaroorat par ek ko doosre mein resolve karta hai; isse mobility, chhoti core tables aur aasaan multihoming milti hai. VXLAN ek MAC-in-UDP encapsulation hai jo 16 million VNIs ke saath Layer 2 segments ko routed underlay ke paar failata hai. End mein bolo ki SD-Access LISP ko control plane aur VXLAN ko data plane ki tarah use karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Classic IP address identity bhi hai aur location bhi; isse mobility ka dard aur routing table growth hoti hai.</li>
<li>LISP: EID = kaun, RLOC = kahan, map-server zaroorat par EIDs ko RLOCs mein resolve karta hai.</li>
<li>VXLAN: Ethernet frames UDP 4789 mein VTEPs ke beech, 24-bit VNI.</li>
<li>Dono overlays hain; underlay sirf RLOCs ya VTEP loopbacks route karta hai.</li>
<li>SD-Access = LISP control plane + VXLAN data plane + SGT policy.</li>
</ul></div>
`}};export{e as default};