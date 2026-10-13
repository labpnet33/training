var e={id:`big-picture`,h:{en:`The big picture: why service providers switch on labels`,hi:`Big picture: service providers labels par switch kyun karte hain`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to explain what MPLS is and why it exists, read an MPLS label header bit by bit, name the role of every router on a label switched path, and describe how LDP discovers neighbours, forms sessions and hands out labels. You will enable LDP on a four-router core, read the LIB and LFIB, prove label switching with a traceroute, and explain penultimate hop popping. You will then climb one level higher to MPLS Layer 3 VPN: VRFs on the PE routers, route distinguishers, route targets, MP-BGP VPNv4 and the two-label stack. Finally you will troubleshoot broken LDP sessions exactly like the lab ticket. This covers ENARSI 300-410 v1.1 objectives <b>2.1 Describe MPLS operations</b> (LSR, LDP, label switching, LSP) and <b>2.2 Describe MPLS Layer 3 VPN</b>.</p>

<p><b>Prerequisites.</b> You should be comfortable with OSPF in a single area, loopback interfaces, the routing table and CEF, and iBGP basics (update-source, next hop). The earlier ENARSI modules on BGP and on VRF-lite are enough background; we will refer back to them rather than repeat them. The next module, DMVPN, is another VPN technology from the same exam domain, so you will be able to compare the two.</p>

<h3>An analogy: the courier sorting hub</h3>
<p>Imagine a national courier company. When you drop a parcel at the city counter, the clerk reads the full address once, decides which route it will take, and sticks a small coloured <b>route sticker</b> on the box, for example "R22". From then on, the sorting hubs along the way never read the address again. Each hub only looks at the sticker, checks a tiny table ("R22 goes to belt 3, replace the sticker with R17"), and passes it on. The hub just before the destination peels the sticker off, and the final office delivers by the real address.</p>
<p>That is <b>MPLS</b>, Multiprotocol Label Switching. The counter clerk is the <b>ingress edge router</b>, the sticker is the <b>label</b>, the hubs are the <b>core routers</b>, and the route the parcel follows is the <b>label switched path</b>. The address still decides the route; the sticker is just a quick way to remember that decision.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="MPLS core">
<rect x="10" y="90" width="80" height="40" rx="8" fill="#fde68a"/><text x="50" y="115" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="120" y="90" width="90" height="40" rx="8" fill="#bae6fd"/><text x="165" y="115" text-anchor="middle" class="svg-ink" font-size="13">PE1</text>
<rect x="250" y="90" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="295" y="115" text-anchor="middle" class="svg-ink" font-size="13">P1</text>
<rect x="380" y="90" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="425" y="115" text-anchor="middle" class="svg-ink" font-size="13">P2</text>
<rect x="510" y="90" width="90" height="40" rx="8" fill="#bae6fd"/><text x="555" y="115" text-anchor="middle" class="svg-ink" font-size="13">PE2</text>
<line x1="90" y1="110" x2="120" y2="110" stroke="#64748b" stroke-width="2"/><line x1="210" y1="110" x2="250" y2="110" stroke="#64748b" stroke-width="2"/><line x1="340" y1="110" x2="380" y2="110" stroke="#64748b" stroke-width="2"/><line x1="470" y1="110" x2="510" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="230" y="80" text-anchor="middle" class="svg-accent" font-size="12">push 22</text>
<text x="360" y="80" text-anchor="middle" class="svg-accent" font-size="12">swap 22→17</text>
<text x="490" y="80" text-anchor="middle" class="svg-accent" font-size="12">pop</text>
<rect x="115" y="160" width="490" height="30" rx="6" fill="#e2e8f0"/><text x="360" y="180" text-anchor="middle" class="svg-ink" font-size="12">MPLS core: OSPF + LDP, loopbacks 1.1.1.1 to 4.4.4.4</text>
<text x="165" y="150" text-anchor="middle" class="svg-muted" font-size="12">ingress</text><text x="555" y="150" text-anchor="middle" class="svg-muted" font-size="12">egress</text>
<text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">Label switched path PE1 → PE2 (one direction)</text>
</svg><p class="cap">The lab topology: the edge pushes a label, the core swaps it, the router before the egress pops it.</p></div>

<h3>A short history, and the speed myth</h3>
<p>In the mid-1990s routers did their longest-prefix-match lookups in software, and they were slow. ATM switches, on the other hand, forwarded on short fixed-length labels in hardware. Cisco's <b>Tag Switching</b> and similar vendor ideas tried to combine IP routing with label-style forwarding, and the IETF standardised the result as MPLS (the architecture is RFC 3031, 2001). The original selling point was <b>speed</b>: a label lookup is an exact match in a small table, much cheaper than a longest-prefix match.</p>
<p>That argument is <b>no longer true</b>. Modern routers use CEF and hardware (ASIC, TCAM) that do IP lookups at line rate. If an interviewer asks "is MPLS faster than IP routing?", the honest answer is: not in any meaningful way today. MPLS survived and grew because of what the label lets you <b>do</b>, not how fast it is.</p>

<h3>The real value of MPLS</h3>
<ul>
<li><b>MPLS Layer 3 VPN</b>: one provider core carries thousands of customers, even with overlapping private addresses, each in its own VRF. A second label identifies the customer. This is the single biggest reason MPLS exists in service providers and large enterprises.</li>
<li><b>BGP-free core</b>: the ingress router looks up the BGP route once and labels the packet toward the exit router's loopback. The core routers only need IGP routes to the edge loopbacks, not the full internet table.</li>
<li><b>Traffic engineering</b> (MPLS TE, RSVP-TE, and today Segment Routing): steer traffic along a path the IGP would not choose, and use fast reroute to protect it in under 50 ms.</li>
<li><b>Layer 2 services</b>: pseudowires and VPLS carry Ethernet across the same core. These are beyond ENARSI, but they use the same label machinery.</li>
<li><b>Multiprotocol</b>: the label does not care what is underneath. IPv4, IPv6 (6PE, 6VPE) and Ethernet frames can all ride the same LSPs.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> An ISP core has 40 P routers and 12 PE routers. Without MPLS every P router would need the full internet table (well over 900,000 IPv4 routes) and a BGP session. With MPLS and LDP, each P router only needs roughly 12 PE loopbacks plus the core links, perhaps 100 routes. The 12 PE routers carry BGP. Memory, CPU and convergence time in the core all drop sharply.</p></div>

<h3>The chapters ahead</h3>
<table class="cmp"><tr><th>Chapters</th><th>Topic</th></tr>
<tr><td>2 to 4</td><td>Label format and stack, FEC and router roles, LIB, LFIB and FIB</td></tr>
<tr><td>5 and 6</td><td>Push, swap, pop and penultimate hop popping</td></tr>
<tr><td>7 and 8</td><td>LDP operation, configuration and verification (Lab 1)</td></tr>
<tr><td>9 to 11</td><td>MPLS L3VPN: VRF, RD, RT, MP-BGP VPNv4, packet walk</td></tr>
<tr><td>12 and 13</td><td>Troubleshooting (Lab 2) and the exam checklist</td></tr></table>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking MPLS replaces the routing protocol. It does not. OSPF (or IS-IS) still builds the routing table; LDP only attaches labels to routes that already exist. No IGP route, no label.</p></div>

<div class="exam"><p><b>Exam trap.</b> "MPLS is used mainly because label lookups are faster than IP lookups" is a classic wrong option. On ENARSI, pick answers about VPNs, BGP-free core and traffic engineering.</p></div>

<div class="scn"><h4>The core that kept running out of memory</h4><p>A regional ISP ran full iBGP on every router, including small aggregation routers in the core. As the internet table grew, the oldest core routers ran out of memory and BGP sessions reset during peak hours. The engineers enabled LDP across the core, kept BGP only on the edge routers, and removed BGP from the P routers. Transit traffic kept flowing because the edges now labelled packets toward each other's loopbacks.</p><p><b>Lesson:</b> a BGP-free core is one of the most practical reasons to run MPLS, even before any VPN service is sold.</p></div>

<div class="iv"><p class="q">"Why do service providers use MPLS if IP forwarding is just as fast?"</p><p>A strong candidate says the speed benefit is historical. The real value is decoupling forwarding from the IP header: MPLS L3VPN with overlapping customer addresses, a BGP-free core, traffic engineering with fast reroute, and Layer 2 services over the same core. Mention that the IGP still decides the path and LDP only distributes labels.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MPLS forwards on a short label added at the network edge; the IGP still decides the path.</li>
<li>The speed advantage is a myth today; the value is VPNs, BGP-free core, TE and L2 services.</li>
<li>The edge pushes a label, the core swaps it, and the router before the egress pops it.</li>
<li>ENARSI 2.1 covers LSR, LDP, label switching and LSP; 2.2 covers MPLS Layer 3 VPN.</li>
<li>The lab core is PE1 – P1 – P2 – PE2 with loopbacks 1.1.1.1 to 4.4.4.4 in OSPF.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap samjha paoge ki MPLS kya hai aur kyun bana, MPLS label header ko bit by bit padh paoge, label switched path par har router ka role bata paoge, aur explain kar paoge ki LDP neighbours kaise discover karta hai, sessions kaise banata hai aur labels kaise baant'ta hai. Aap chaar routers ke core par LDP on karoge, LIB aur LFIB padhoge, traceroute se label switching prove karoge, aur penultimate hop popping samjhaoge. Phir ek level upar jaakar MPLS Layer 3 VPN dekhoge: PE routers par VRFs, route distinguishers, route targets, MP-BGP VPNv4 aur two-label stack. Aakhir mein aap toote hue LDP sessions ko bilkul lab ticket ki tarah troubleshoot karoge. Yeh ENARSI 300-410 v1.1 ke objectives <b>2.1 Describe MPLS operations</b> (LSR, LDP, label switching, LSP) aur <b>2.2 Describe MPLS Layer 3 VPN</b> cover karta hai.</p>

<p><b>Prerequisites.</b> Aapko single area OSPF, loopback interfaces, routing table aur CEF, aur iBGP basics (update-source, next hop) aane chahiye. BGP aur VRF-lite wale pehle ke ENARSI modules kaafi background hain; hum unhe dohrayenge nahi, bas refer karenge. Agla module, DMVPN, isi exam domain ki ek aur VPN technology hai, to aap dono ki tulna kar paoge.</p>

<h3>Ek analogy: courier sorting hub</h3>
<p>Ek national courier company socho. Jab aap city counter par parcel dete ho, clerk poora address sirf ek baar padhta hai, decide karta hai ki parcel kis route se jaayega, aur box par ek chhota rangeen <b>route sticker</b> laga deta hai, jaise "R22". Uske baad raaste ke sorting hubs address dobara kabhi nahi padhte. Har hub sirf sticker dekhta hai, ek chhoti si table check karta hai ("R22 belt 3 par jaata hai, sticker ko R17 se badlo"), aur aage bhej deta hai. Destination se theek pehle wala hub sticker utaar deta hai, aur final office asli address se deliver karta hai.</p>
<p>Yahi <b>MPLS</b> hai, Multiprotocol Label Switching. Counter clerk <b>ingress edge router</b> hai, sticker <b>label</b> hai, hubs <b>core routers</b> hain, aur parcel jis route par chalta hai woh <b>label switched path</b> hai. Route ab bhi address decide karta hai; sticker bas us decision ko yaad rakhne ka tez tarika hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="MPLS core">
<rect x="10" y="90" width="80" height="40" rx="8" fill="#fde68a"/><text x="50" y="115" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="120" y="90" width="90" height="40" rx="8" fill="#bae6fd"/><text x="165" y="115" text-anchor="middle" class="svg-ink" font-size="13">PE1</text>
<rect x="250" y="90" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="295" y="115" text-anchor="middle" class="svg-ink" font-size="13">P1</text>
<rect x="380" y="90" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="425" y="115" text-anchor="middle" class="svg-ink" font-size="13">P2</text>
<rect x="510" y="90" width="90" height="40" rx="8" fill="#bae6fd"/><text x="555" y="115" text-anchor="middle" class="svg-ink" font-size="13">PE2</text>
<line x1="90" y1="110" x2="120" y2="110" stroke="#64748b" stroke-width="2"/><line x1="210" y1="110" x2="250" y2="110" stroke="#64748b" stroke-width="2"/><line x1="340" y1="110" x2="380" y2="110" stroke="#64748b" stroke-width="2"/><line x1="470" y1="110" x2="510" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="230" y="80" text-anchor="middle" class="svg-accent" font-size="12">push 22</text>
<text x="360" y="80" text-anchor="middle" class="svg-accent" font-size="12">swap 22→17</text>
<text x="490" y="80" text-anchor="middle" class="svg-accent" font-size="12">pop</text>
<rect x="115" y="160" width="490" height="30" rx="6" fill="#e2e8f0"/><text x="360" y="180" text-anchor="middle" class="svg-ink" font-size="12">MPLS core: OSPF + LDP, loopbacks 1.1.1.1 se 4.4.4.4</text>
<text x="165" y="150" text-anchor="middle" class="svg-muted" font-size="12">ingress</text><text x="555" y="150" text-anchor="middle" class="svg-muted" font-size="12">egress</text>
<text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">Label switched path PE1 → PE2 (ek direction)</text>
</svg><p class="cap">Lab topology: edge label push karta hai, core use swap karta hai, egress se pehle wala router use pop karta hai.</p></div>

<h3>Thoda sa history, aur speed ka myth</h3>
<p>1990s ke beech mein routers apne longest-prefix-match lookups software mein karte the, aur woh slow the. Doosri taraf ATM switches chhote fixed-length labels par hardware mein forward karte the. Cisco ke <b>Tag Switching</b> aur doosre vendors ke aise ideas ne IP routing ko label-style forwarding ke saath jodne ki koshish ki, aur IETF ne result ko MPLS ke naam se standard kiya (architecture RFC 3031, 2001 hai). Shuru mein selling point tha <b>speed</b>: label lookup ek chhoti table mein exact match hai, longest-prefix match se kaafi sasta.</p>
<p>Yeh argument <b>ab sach nahi hai</b>. Modern routers CEF aur hardware (ASIC, TCAM) use karte hain jo IP lookups line rate par karte hain. Agar interviewer pooche "kya MPLS IP routing se tez hai?", to imaandaar jawab hai: aaj kisi meaningful tarike se nahi. MPLS isliye bacha aur badha kyunki label se aap kya <b>kar sakte ho</b>, isliye nahi ki woh kitna tez hai.</p>

<h3>MPLS ki asli value</h3>
<ul>
<li><b>MPLS Layer 3 VPN</b>: ek provider core hazaaron customers ko le jaata hai, overlapping private addresses ke saath bhi, har ek apne VRF mein. Ek doosra label customer ko pehchanta hai. Service providers aur bade enterprises mein MPLS ke hone ki yeh sabse badi wajah hai.</li>
<li><b>BGP-free core</b>: ingress router BGP route ek baar dekhta hai aur packet par exit router ke loopback ki taraf label laga deta hai. Core routers ko sirf edge loopbacks ke IGP routes chahiye, poori internet table nahi.</li>
<li><b>Traffic engineering</b> (MPLS TE, RSVP-TE, aur aaj Segment Routing): traffic ko us path par chalao jo IGP khud nahi chunta, aur fast reroute se use 50 ms se kam mein protect karo.</li>
<li><b>Layer 2 services</b>: pseudowires aur VPLS usi core par Ethernet le jaate hain. Yeh ENARSI se bahar hain, par same label machinery use karte hain.</li>
<li><b>Multiprotocol</b>: label ko farak nahi padta ki neeche kya hai. IPv4, IPv6 (6PE, 6VPE) aur Ethernet frames sab same LSPs par chal sakte hain.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek ISP core mein 40 P routers aur 12 PE routers hain. MPLS ke bina har P router ko poori internet table (900,000 se zyada IPv4 routes) aur ek BGP session chahiye. MPLS aur LDP ke saath har P router ko sirf lagbhag 12 PE loopbacks plus core links chahiye, shayad 100 routes. BGP sirf 12 PE routers chalate hain. Core mein memory, CPU aur convergence time sab kaafi kam ho jaate hain.</p></div>

<h3>Aage ke chapters</h3>
<table class="cmp"><tr><th>Chapters</th><th>Topic</th></tr>
<tr><td>2 se 4</td><td>Label format aur stack, FEC aur router roles, LIB, LFIB aur FIB</td></tr>
<tr><td>5 aur 6</td><td>Push, swap, pop aur penultimate hop popping</td></tr>
<tr><td>7 aur 8</td><td>LDP operation, configuration aur verification (Lab 1)</td></tr>
<tr><td>9 se 11</td><td>MPLS L3VPN: VRF, RD, RT, MP-BGP VPNv4, packet walk</td></tr>
<tr><td>12 aur 13</td><td>Troubleshooting (Lab 2) aur exam checklist</td></tr></table>

<div class="warn"><p><b>Common beginner galti.</b> Yeh sochna ki MPLS routing protocol ki jagah le leta hai. Aisa nahi hai. OSPF (ya IS-IS) ab bhi routing table banata hai; LDP sirf pehle se maujood routes par labels lagata hai. IGP route nahi, to label nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> "MPLS mainly isliye use hota hai kyunki label lookups IP lookups se tez hain" ek classic galat option hai. ENARSI mein VPNs, BGP-free core aur traffic engineering wale answers chuno.</p></div>

<div class="scn"><h4>Woh core jiski memory baar baar khatam hoti thi</h4><p>Ek regional ISP har router par full iBGP chalata tha, core ke chhote aggregation routers par bhi. Jaise jaise internet table badhi, sabse purane core routers ki memory khatam hone lagi aur peak hours mein BGP sessions reset hone lage. Engineers ne poore core mein LDP on kiya, BGP sirf edge routers par rakha, aur P routers se BGP hata diya. Transit traffic chalta raha kyunki ab edges ek doosre ke loopbacks ki taraf packets par label lagate the.</p><p><b>Seekh:</b> BGP-free core MPLS chalane ki sabse practical wajahon mein se ek hai, koi VPN service bechne se pehle bhi.</p></div>

<div class="iv"><p class="q">"Agar IP forwarding utna hi tez hai, to service providers MPLS kyun use karte hain?"</p><p>Strong candidate kehta hai ki speed ka fayda historical hai. Asli value forwarding ko IP header se alag karne mein hai: overlapping customer addresses ke saath MPLS L3VPN, BGP-free core, fast reroute ke saath traffic engineering, aur same core par Layer 2 services. Yeh bhi bolo ki path ab bhi IGP decide karta hai aur LDP sirf labels distribute karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MPLS network edge par lage ek chhote label par forward karta hai; path ab bhi IGP decide karta hai.</li>
<li>Speed ka fayda aaj ek myth hai; value hai VPNs, BGP-free core, TE aur L2 services.</li>
<li>Edge label push karta hai, core swap karta hai, aur egress se pehle wala router pop karta hai.</li>
<li>ENARSI 2.1 mein LSR, LDP, label switching aur LSP hain; 2.2 mein MPLS Layer 3 VPN.</li>
<li>Lab core PE1 – P1 – P2 – PE2 hai, loopbacks 1.1.1.1 se 4.4.4.4 OSPF mein.</li>
</ul></div>
`}};export{e as default};