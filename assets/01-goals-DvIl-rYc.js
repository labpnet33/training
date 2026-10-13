var e={id:`goals`,h:{en:`Start here: what EVPN is and the problem it solves`,hi:`Yahan se shuru karo: EVPN kya hai aur kaunsi problem solve karta hai`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to build a complete VXLAN BGP EVPN fabric on Cisco Nexus switches and explain every line of it in an interview: iBGP sessions from the leaves to spine route reflectors, the L2VPN EVPN address family, the five EVPN route types, route distinguishers and route targets, L2VNIs with BGP ingress replication and ARP suppression, the distributed anycast gateway, symmetric IRB with a tenant VRF and L3VNI, external connectivity through a border leaf, multihoming and Multi-Site at design level, and a step-by-step troubleshooting method. The labs use the same fabric all the way through: <b>SPINE1</b> and <b>SPINE2</b> as route reflectors, <b>LEAF1</b> and <b>LEAF2</b> as VTEPs, servers <b>SRV1</b> and <b>SRV2</b>.</p>
<p><b>Prerequisites.</b> You should already be comfortable with the previous modules: spine-leaf design, a routed OSPF underlay with loopback0 (router ID) and loopback1 (VTEP address), and VXLAN flood-and-learn with <code>interface nve1</code> and static <code>peer-ip</code> lists. You do not need to be a BGP expert; chapter 2 gives you exactly the BGP you need.</p>

<h3>An analogy: the society notice board</h3>
<p>Imagine a large housing society with many towers. In the old system, whenever a courier arrived for "flat 0802, Mr Rao", the guard at the gate did not know which tower Mr Rao lived in, so he shouted the name over the loudspeaker in every tower and waited for someone to answer. That works for ten flats. With two thousand flats, the loudspeakers never stop, everyone is disturbed, and the guard must still be told by hand whenever a new tower opens.</p>
<p>Now the society puts up a <b>notice board</b> at a central office. Every tower's guard writes on it: "Tower 3 has flats 0801 to 0850" and "Mr Rao, flat 0802, is in Tower 3". Every other guard reads the board. When a courier arrives, the guard simply looks up the board and sends the courier straight to Tower 3. No shouting. A new tower just writes its own entries, and everyone else learns it automatically.</p>
<p>That is exactly the move from <b>VXLAN flood-and-learn</b> to <b>VXLAN BGP EVPN</b>. The loudspeaker is flooding. The notice board is BGP. The guards are the leaf switches (VTEPs). The central office that copies notices for everyone is the spine <b>route reflector</b>.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Flood and learn versus EVPN">
<rect x="10" y="10" width="300" height="30" rx="6" fill="#fed7aa"/><text x="160" y="30" text-anchor="middle" class="svg-ink" font-size="13">Flood and learn</text>
<rect x="330" y="10" width="300" height="30" rx="6" fill="#bbf7d0"/><text x="480" y="30" text-anchor="middle" class="svg-ink" font-size="13">BGP EVPN</text>
<rect x="30" y="150" width="70" height="30" rx="6" fill="#bae6fd"/><text x="65" y="170" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text>
<rect x="125" y="150" width="70" height="30" rx="6" fill="#bae6fd"/><text x="160" y="170" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text>
<rect x="220" y="150" width="70" height="30" rx="6" fill="#bae6fd"/><text x="255" y="170" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text>
<line x1="100" y1="160" x2="125" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/><line x1="65" y1="150" x2="255" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<text x="160" y="105" text-anchor="middle" class="svg-accent" font-size="12">ARP and unknown MAC flooded</text>
<text x="160" y="210" text-anchor="middle" class="svg-muted" font-size="12">static peer-ip on every leaf</text>
<rect x="420" y="60" width="120" height="30" rx="6" fill="#ddd6fe"/><text x="480" y="80" text-anchor="middle" class="svg-ink" font-size="12">Spine RR</text>
<rect x="350" y="150" width="70" height="30" rx="6" fill="#bae6fd"/><text x="385" y="170" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text>
<rect x="445" y="150" width="70" height="30" rx="6" fill="#bae6fd"/><text x="480" y="170" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text>
<rect x="540" y="150" width="70" height="30" rx="6" fill="#bae6fd"/><text x="575" y="170" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text>
<line x1="480" y1="90" x2="385" y2="150" stroke="#64748b" stroke-width="2"/><line x1="480" y1="90" x2="480" y2="150" stroke="#64748b" stroke-width="2"/><line x1="480" y1="90" x2="575" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="480" y="125" text-anchor="middle" class="svg-accent" font-size="12">BGP updates</text>
<text x="480" y="210" text-anchor="middle" class="svg-muted" font-size="12">VTEPs and hosts learned from BGP</text>
</svg><p class="cap">Left: every leaf floods and must be told its peers by hand. Right: every leaf announces what it has to the route reflector, which copies it to all others.</p></div>

<h3>What flood-and-learn does badly</h3>
<p>Recall how a VXLAN leaf works. A <b>VTEP</b> (VXLAN tunnel endpoint) takes a server's Ethernet frame, adds a VXLAN header with a 24-bit <b>VNI</b> (VXLAN network identifier, the "VLAN number" of the overlay), wraps it in UDP port 4789 and sends it across the routed underlay to another VTEP. In <b>flood-and-learn</b> mode two questions have poor answers:</p>
<ul>
<li><b>Which other VTEPs have VNI 10010?</b> You either type every remote VTEP by hand (<code>ingress-replication protocol static</code> with <code>peer-ip</code>) or run multicast in the underlay. Add a tenth leaf and you touch nine old leaves.</li>
<li><b>Behind which VTEP is MAC 0050.7966.6802?</b> Nobody knows until a frame from that MAC arrives. So ARP requests, broadcasts and unknown unicast (together called <b>BUM</b> traffic: broadcast, unknown unicast, multicast) are flooded to every VTEP in the VNI.</li>
</ul>
<p>There is a third gap: flood-and-learn gives you only Layer 2. Routing between subnets still happens on some central gateway, so traffic between two VMs in the same rack may travel to a distant router and back (hair-pinning).</p>

<h3>What EVPN is</h3>
<p><b>EVPN</b> (Ethernet VPN) is a <b>control plane</b> for Layer-2 and Layer-3 overlays, defined in RFC 7432 and adapted for VXLAN in RFC 8365. It uses <b>MP-BGP</b> (multiprotocol BGP) to carry information that used to be learned from the wire:</p>
<ul>
<li>"I am VTEP 10.254.0.1 and I have VNI 10010" (route type 3), which builds the flood list automatically.</li>
<li>"MAC 0050.7966.6801 with IP 172.16.10.11 lives behind me" (route type 2), which fills remote MAC tables and ARP caches before any traffic flows.</li>
<li>"Subnet 172.16.20.0/24 of tenant A is reachable through me" (route type 5), which gives real routing inside the fabric.</li>
</ul>
<p>The <b>data plane stays VXLAN</b>. Packets still travel inside UDP/4789 between loopback1 addresses. Only the learning moved from data traffic into BGP. This is the single most important sentence of the module.</p>

<table class="cmp"><tr><th>Question</th><th>Flood and learn</th><th>BGP EVPN</th></tr>
<tr><td>Remote VTEP list</td><td>static peer-ip or multicast</td><td>learned from route type 3</td></tr>
<tr><td>Remote MACs</td><td>learned from data traffic</td><td>advertised in route type 2</td></tr>
<tr><td>ARP</td><td>flooded everywhere</td><td>answered locally (ARP suppression)</td></tr>
<tr><td>Routing between subnets</td><td>central gateway</td><td>anycast gateway on every leaf, symmetric IRB</td></tr>
<tr><td>show nve peers LearnType</td><td>DP (data plane)</td><td>CP (control plane)</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> A fabric has 40 leaves and 300 VNIs. With static ingress replication, each leaf needs a peer list per VNI: up to 39 peers × 300 VNIs = 11,700 lines of peer configuration per leaf, and every new leaf means editing all 40. With EVPN each leaf configures only its own VNIs plus two BGP neighbors (the spines). Adding leaf 41 means configuring leaf 41 only.</p></div>

<h3>How the module is organised</h3>
<ol>
<li>BGP refresher and MP-BGP EVPN sessions (lab 1: leaves peer with the route reflectors).</li>
<li>Route types, RD and RT: the vocabulary of every show command.</li>
<li>L2VNI with BGP (lab 2: move VLAN 10 from static peers to EVPN).</li>
<li>IRB, anycast gateway and L3VNI (lab 3: symmetric IRB for tenant A).</li>
<li>External connectivity, multihoming and Multi-Site.</li>
<li>Troubleshooting (lab 4 ticket and lab 5 NOC incident), then the summary.</li>
</ol>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking that EVPN replaces VXLAN or that traffic now flows "through BGP" or "through the spines' BGP process". BGP only carries reachability information. Spines forward VXLAN packets as ordinary IP packets in the underlay; the fact that they are also route reflectors does not put them in the data path of the overlay.</p></div>
<div class="exam"><p><b>Exam trap.</b> EVPN is a control plane; VXLAN is the data plane. If a question asks "which component learns remote MAC addresses in a BGP EVPN fabric", the answer is BGP (MP-BGP L2VPN EVPN), not data-plane learning.</p></div>

<div class="scn"><h4>The fabric that could not grow</h4><p>A payments company ran 16 leaves with VXLAN flood-and-learn and static peer lists. Every new leaf meant a change window touching all existing leaves, and a missed <code>peer-ip</code> on one leaf once left a VNI half-connected for two days: some servers could ping each other, others could not. ARP floods also grew with every VM. The team migrated to BGP EVPN one VNI at a time, keeping the same VNIs and loopbacks, and added two spine route reflectors. After the migration, adding a leaf required configuration on that leaf only, and <code>show nve peers</code> listed all VTEPs with LearnType CP within a minute.</p><p><b>Lesson:</b> EVPN is not a new data plane; it is the automation of learning. Its biggest real-world win is operational: consistent, automatic peer discovery and far less flooding.</p></div>

<div class="iv"><p class="q">"Why would you use BGP EVPN instead of VXLAN flood-and-learn?"</p><p>Strong answer: flood-and-learn needs static peer lists or underlay multicast and learns MACs only from flooded traffic, so it scales badly and floods ARP everywhere. EVPN adds an MP-BGP control plane: type-3 routes discover VTEPs per VNI, type-2 routes advertise MAC and IP so ARP can be suppressed, and type-5 routes carry prefixes. It also enables the distributed anycast gateway and symmetric IRB. Say clearly that the data plane is still VXLAN on UDP 4789.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EVPN is a BGP-based control plane; VXLAN remains the data plane.</li>
<li>Flood-and-learn needs manual peers and floods BUM traffic; EVPN learns VTEPs and hosts from BGP.</li>
<li>Type 3 = "I have this VNI", type 2 = "this MAC/IP is behind me", type 5 = "this prefix is behind me".</li>
<li>Spines act as BGP route reflectors, but they are not in the overlay data path.</li>
<li>The labs use SPINE1/SPINE2 (RRs), LEAF1/LEAF2 (VTEPs), AS 65001, loopback0 for BGP and loopback1 for VXLAN.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap Cisco Nexus switches par ek complete VXLAN BGP EVPN fabric bana paoge aur interview mein uski har line explain kar paoge: leaves se spine route reflectors tak iBGP sessions, L2VPN EVPN address family, paanch EVPN route types, route distinguishers aur route targets, BGP ingress replication aur ARP suppression ke saath L2VNIs, distributed anycast gateway, tenant VRF aur L3VNI ke saath symmetric IRB, border leaf ke through external connectivity, design level par multihoming aur Multi-Site, aur ek step-by-step troubleshooting method. Labs shuru se end tak ek hi fabric use karte hain: <b>SPINE1</b> aur <b>SPINE2</b> route reflectors ki tarah, <b>LEAF1</b> aur <b>LEAF2</b> VTEPs ki tarah, aur servers <b>SRV1</b> aur <b>SRV2</b>.</p>
<p><b>Prerequisites.</b> Pichhle modules aapko comfortable hone chahiye: spine-leaf design, loopback0 (router ID) aur loopback1 (VTEP address) ke saath routed OSPF underlay, aur <code>interface nve1</code> aur static <code>peer-ip</code> lists wala VXLAN flood-and-learn. BGP expert hona zaroori nahi; chapter 2 aapko bilkul utna BGP deta hai jitna chahiye.</p>

<h3>Ek analogy: society ka notice board</h3>
<p>Ek badi housing society socho jismein bahut saare towers hain. Purane system mein, jab bhi courier "flat 0802, Mr Rao" ke liye aata, gate par guard ko pata nahi hota ki Mr Rao kis tower mein rehte hain, isliye woh har tower mein loudspeaker par naam chillata aur kisi ke jawab ka wait karta. Das flats ke liye yeh chal jaata hai. Do hazaar flats ke saath loudspeakers kabhi band nahi hote, sab disturb hote hain, aur naya tower khulne par guard ko abhi bhi haath se batana padta hai.</p>
<p>Ab society ek central office mein <b>notice board</b> lagati hai. Har tower ka guard us par likhta hai: "Tower 3 mein flats 0801 se 0850 hain" aur "Mr Rao, flat 0802, Tower 3 mein hain". Baaki har guard board padhta hai. Courier aane par guard bas board dekhta hai aur courier ko seedha Tower 3 bhej deta hai. Koi chillana nahi. Naya tower bas apni entries likhta hai, aur baaki sab apne aap seekh lete hain.</p>
<p>Bilkul yahi move hai <b>VXLAN flood-and-learn</b> se <b>VXLAN BGP EVPN</b> tak. Loudspeaker flooding hai. Notice board BGP hai. Guards leaf switches (VTEPs) hain. Central office jo sabke liye notices copy karta hai, woh spine <b>route reflector</b> hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Flood and learn vs EVPN">
<rect x="10" y="10" width="300" height="30" rx="6" fill="#fed7aa"/><text x="160" y="30" text-anchor="middle" class="svg-ink" font-size="13">Flood and learn</text>
<rect x="330" y="10" width="300" height="30" rx="6" fill="#bbf7d0"/><text x="480" y="30" text-anchor="middle" class="svg-ink" font-size="13">BGP EVPN</text>
<rect x="30" y="150" width="70" height="30" rx="6" fill="#bae6fd"/><text x="65" y="170" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text>
<rect x="125" y="150" width="70" height="30" rx="6" fill="#bae6fd"/><text x="160" y="170" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text>
<rect x="220" y="150" width="70" height="30" rx="6" fill="#bae6fd"/><text x="255" y="170" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text>
<line x1="100" y1="160" x2="125" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/><line x1="65" y1="150" x2="255" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<text x="160" y="105" text-anchor="middle" class="svg-accent" font-size="12">ARP aur unknown MAC flood</text>
<text x="160" y="210" text-anchor="middle" class="svg-muted" font-size="12">har leaf par static peer-ip</text>
<rect x="420" y="60" width="120" height="30" rx="6" fill="#ddd6fe"/><text x="480" y="80" text-anchor="middle" class="svg-ink" font-size="12">Spine RR</text>
<rect x="350" y="150" width="70" height="30" rx="6" fill="#bae6fd"/><text x="385" y="170" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text>
<rect x="445" y="150" width="70" height="30" rx="6" fill="#bae6fd"/><text x="480" y="170" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text>
<rect x="540" y="150" width="70" height="30" rx="6" fill="#bae6fd"/><text x="575" y="170" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text>
<line x1="480" y1="90" x2="385" y2="150" stroke="#64748b" stroke-width="2"/><line x1="480" y1="90" x2="480" y2="150" stroke="#64748b" stroke-width="2"/><line x1="480" y1="90" x2="575" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="480" y="125" text-anchor="middle" class="svg-accent" font-size="12">BGP updates</text>
<text x="480" y="210" text-anchor="middle" class="svg-muted" font-size="12">VTEPs aur hosts BGP se seekhe</text>
</svg><p class="cap">Left: har leaf flood karta hai aur use peers haath se batane padte hain. Right: har leaf jo uske paas hai woh route reflector ko batata hai, jo use baaki sabko copy karta hai.</p></div>

<h3>Flood-and-learn kya bura karta hai</h3>
<p>Yaad karo VXLAN leaf kaise kaam karta hai. <b>VTEP</b> (VXLAN tunnel endpoint) server ka Ethernet frame leta hai, 24-bit <b>VNI</b> (VXLAN network identifier, overlay ka "VLAN number") wala VXLAN header jodta hai, use UDP port 4789 mein wrap karta hai aur routed underlay ke paar doosre VTEP ko bhejta hai. <b>Flood-and-learn</b> mode mein do sawaalon ke jawab kamzor hain:</p>
<ul>
<li><b>VNI 10010 aur kin VTEPs ke paas hai?</b> Ya to aap har remote VTEP haath se likhte ho (<code>ingress-replication protocol static</code> ke saath <code>peer-ip</code>) ya underlay mein multicast chalate ho. Dasvaan leaf jodo to nau purane leaves chhune padte hain.</li>
<li><b>MAC 0050.7966.6802 kis VTEP ke peeche hai?</b> Jab tak us MAC ka frame nahi aata, kisi ko nahi pata. Isliye ARP requests, broadcasts aur unknown unicast (sabko milakar <b>BUM</b> traffic: broadcast, unknown unicast, multicast) VNI ke har VTEP par flood hote hain.</li>
</ul>
<p>Ek teesri kami bhi hai: flood-and-learn sirf Layer 2 deta hai. Subnets ke beech routing abhi bhi kisi central gateway par hoti hai, isliye ek hi rack ki do VMs ke beech ka traffic door ke router tak jaa kar wapas aa sakta hai (hair-pinning).</p>

<h3>EVPN kya hai</h3>
<p><b>EVPN</b> (Ethernet VPN) Layer-2 aur Layer-3 overlays ke liye ek <b>control plane</b> hai, jo RFC 7432 mein define hai aur RFC 8365 mein VXLAN ke liye adapt kiya gaya hai. Yeh <b>MP-BGP</b> (multiprotocol BGP) use karta hai woh information le jaane ke liye jo pehle wire se seekhi jaati thi:</p>
<ul>
<li>"Main VTEP 10.254.0.1 hoon aur mere paas VNI 10010 hai" (route type 3), jo flood list apne aap banata hai.</li>
<li>"MAC 0050.7966.6801 IP 172.16.10.11 ke saath mere peeche hai" (route type 2), jo koi traffic chalne se pehle hi remote MAC tables aur ARP caches bhar deta hai.</li>
<li>"Tenant A ka subnet 172.16.20.0/24 mere through reachable hai" (route type 5), jo fabric ke andar asli routing deta hai.</li>
</ul>
<p><b>Data plane VXLAN hi rehta hai</b>. Packets abhi bhi loopback1 addresses ke beech UDP/4789 ke andar chalte hain. Sirf learning data traffic se hat kar BGP mein aa gayi. Yeh is module ka sabse important sentence hai.</p>

<table class="cmp"><tr><th>Sawaal</th><th>Flood and learn</th><th>BGP EVPN</th></tr>
<tr><td>Remote VTEP list</td><td>static peer-ip ya multicast</td><td>route type 3 se seekhi</td></tr>
<tr><td>Remote MACs</td><td>data traffic se seekhe</td><td>route type 2 mein advertise</td></tr>
<tr><td>ARP</td><td>har jagah flood</td><td>locally jawab (ARP suppression)</td></tr>
<tr><td>Subnets ke beech routing</td><td>central gateway</td><td>har leaf par anycast gateway, symmetric IRB</td></tr>
<tr><td>show nve peers LearnType</td><td>DP (data plane)</td><td>CP (control plane)</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Ek fabric mein 40 leaves aur 300 VNIs hain. Static ingress replication ke saath har leaf ko har VNI ke liye peer list chahiye: 39 peers × 300 VNIs = har leaf par 11,700 lines tak ka peer configuration, aur har naye leaf ka matlab hai saare 40 edit karna. EVPN mein har leaf sirf apne VNIs aur do BGP neighbors (spines) configure karta hai. Leaf 41 jodne ka matlab hai sirf leaf 41 configure karna.</p></div>

<h3>Module kaise organise hai</h3>
<ol>
<li>BGP refresher aur MP-BGP EVPN sessions (lab 1: leaves route reflectors se peer karte hain).</li>
<li>Route types, RD aur RT: har show command ki vocabulary.</li>
<li>BGP ke saath L2VNI (lab 2: VLAN 10 ko static peers se EVPN par le jao).</li>
<li>IRB, anycast gateway aur L3VNI (lab 3: tenant A ke liye symmetric IRB).</li>
<li>External connectivity, multihoming aur Multi-Site.</li>
<li>Troubleshooting (lab 4 ticket aur lab 5 NOC incident), phir summary.</li>
</ol>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh sochna ki EVPN VXLAN ko replace karta hai ya ab traffic "BGP ke through" ya "spines ke BGP process ke through" chalta hai. BGP sirf reachability information le jaata hai. Spines VXLAN packets ko underlay mein normal IP packets ki tarah forward karte hain; unka route reflector hona unhe overlay ke data path mein nahi daalta.</p></div>
<div class="exam"><p><b>Exam trap.</b> EVPN control plane hai; VXLAN data plane hai. Agar sawaal pooche "BGP EVPN fabric mein remote MAC addresses kaunsa component seekhta hai", to jawab BGP (MP-BGP L2VPN EVPN) hai, data-plane learning nahi.</p></div>

<div class="scn"><h4>Woh fabric jo badh nahi paa raha tha</h4><p>Ek payments company VXLAN flood-and-learn aur static peer lists ke saath 16 leaves chalati thi. Har naye leaf ka matlab tha ek change window jismein saare purane leaves chhune padte, aur ek baar ek leaf par ek <code>peer-ip</code> chhoot jaane se ek VNI do din tak aadha connected raha: kuch servers ek doosre ko ping kar paate the, kuch nahi. Har VM ke saath ARP floods bhi badhte gaye. Team ne same VNIs aur loopbacks rakhte hue ek-ek VNI karke BGP EVPN par migrate kiya, aur do spine route reflectors jode. Migration ke baad naya leaf jodne ke liye sirf usi leaf par configuration chahiye tha, aur <code>show nve peers</code> ek minute ke andar saare VTEPs LearnType CP ke saath dikhane laga.</p><p><b>Seekh:</b> EVPN naya data plane nahi hai; yeh learning ka automation hai. Real world mein iska sabse bada fayda operational hai: consistent, automatic peer discovery aur bahut kam flooding.</p></div>

<div class="iv"><p class="q">"VXLAN flood-and-learn ki jagah BGP EVPN kyun use karoge?"</p><p>Strong answer: flood-and-learn ko static peer lists ya underlay multicast chahiye aur woh MACs sirf flood hue traffic se seekhta hai, isliye bura scale karta hai aur har jagah ARP flood karta hai. EVPN ek MP-BGP control plane jodta hai: type-3 routes har VNI ke VTEPs discover karte hain, type-2 routes MAC aur IP advertise karte hain taaki ARP suppress ho sake, aur type-5 routes prefixes le jaate hain. Yeh distributed anycast gateway aur symmetric IRB bhi enable karta hai. Saaf bolo ki data plane abhi bhi UDP 4789 par VXLAN hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EVPN BGP-based control plane hai; VXLAN data plane hi rehta hai.</li>
<li>Flood-and-learn ko manual peers chahiye aur woh BUM traffic flood karta hai; EVPN VTEPs aur hosts BGP se seekhta hai.</li>
<li>Type 3 = "mere paas yeh VNI hai", type 2 = "yeh MAC/IP mere peeche hai", type 5 = "yeh prefix mere peeche hai".</li>
<li>Spines BGP route reflectors ka kaam karte hain, lekin woh overlay data path mein nahi hain.</li>
<li>Labs SPINE1/SPINE2 (RRs), LEAF1/LEAF2 (VTEPs), AS 65001, BGP ke liye loopback0 aur VXLAN ke liye loopback1 use karte hain.</li>
</ul></div>
`}};export{e as default};