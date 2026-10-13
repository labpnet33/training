var e={id:`big-picture`,h:{en:`Multi-area OSPF: the big picture`,hi:`Multi-area OSPF: badi picture`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to explain exactly how two OSPF routers go from strangers to a FULL adjacency (including the DBD master/slave exchange and the MTU check), choose and configure the right network type on any link, read every LSA type from 1 to 7 in the database, design a multi-area network around the backbone, summarise at the area border and at the redistribution point, filter inter-area routes, predict which path OSPF will pick, run the same design in OSPFv3, and troubleshoot a broken multi-area network from a real ticket. This covers the CCNP ENCOR 350-401 v1.2 objective 3.2.b: configure simple OSPFv2/v3 environments, including multiple normal areas, summarisation and filtering (neighbour adjacency, point-to-point and broadcast network types, and passive-interface).</p>

<p><b>Prerequisites.</b> You finished the CCNA modules <i>OSPFv2 single-area</i> and <i>OSPFv3</i>. You already know what a router ID is, the five packet types by name, the neighbour states from Down to Full, the DR/BDR election, cost and reference bandwidth, and the two ways to enable OSPF (network statements and interface commands). We will refer back to those ideas and go one level deeper, not re-teach them. You should also be fluent with prefix lengths and wildcard masks, because summarisation and prefix-lists depend on them.</p>

<h3>An analogy: a country with states</h3>
<p>Imagine India's road department trying to keep one giant map of every lane in every village. Every time a lane in a village in Kerala is closed, every district office in Punjab would have to redraw its map. That is single-area OSPF at scale: every router holds every detail, and every change triggers a full recalculation everywhere.</p>
<p>The real solution is <b>states</b>. Inside a state, the offices keep the detailed map of their own roads. At the state border, a <b>border office</b> tells the rest of the country only the summary: "Kerala towns are reachable through me, about 600 km away". All state highways connect through one <b>national highway network</b>, so any state can reach any other. In OSPF the states are <b>areas</b>, the border offices are <b>Area Border Routers (ABRs)</b>, and the national highway is <b>area 0, the backbone</b>. A router that connects to a completely different road system, like a port connecting to foreign countries, is an <b>Autonomous System Boundary Router (ASBR)</b>.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Lab topology for multi-area OSPF">
<rect x="10" y="40" width="190" height="140" rx="12" fill="#bbf7d0"/><text x="105" y="62" text-anchor="middle" class="svg-ink" font-size="13">Area 10 (Pune)</text>
<rect x="215" y="40" width="210" height="140" rx="12" fill="#bae6fd"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="13">Area 0 (backbone)</text>
<rect x="440" y="40" width="190" height="140" rx="12" fill="#fde68a"/><text x="535" y="62" text-anchor="middle" class="svg-ink" font-size="13">Area 20 (Chennai)</text>
<rect x="30" y="95" width="70" height="40" rx="8" fill="#e2e8f0"/><text x="65" y="120" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="175" y="95" width="80" height="40" rx="8" fill="#ddd6fe"/><text x="215" y="120" text-anchor="middle" class="svg-ink" font-size="13">ABR1</text>
<rect x="285" y="95" width="70" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">CORE</text>
<rect x="385" y="95" width="80" height="40" rx="8" fill="#ddd6fe"/><text x="425" y="120" text-anchor="middle" class="svg-ink" font-size="13">ABR2</text>
<rect x="540" y="95" width="70" height="40" rx="8" fill="#e2e8f0"/><text x="575" y="120" text-anchor="middle" class="svg-ink" font-size="13">R5</text>
<line x1="100" y1="115" x2="175" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="255" y1="115" x2="285" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="355" y1="115" x2="385" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="465" y1="115" x2="540" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="65" y="160" text-anchor="middle" class="svg-muted" font-size="12">172.16.0-3.0/24</text>
<text x="575" y="160" text-anchor="middle" class="svg-muted" font-size="12">192.168.20.0/24</text>
<text x="137" y="108" text-anchor="middle" class="svg-accent" font-size="12">10.10.12.0/30</text>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">10.0.23.0 + 10.0.34.0</text>
<text x="502" y="108" text-anchor="middle" class="svg-accent" font-size="12">10.20.45.0/30</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">RIDs: R1 1.1.1.1, ABR1 2.2.2.2, CORE 3.3.3.3, ABR2 4.4.4.4, R5 5.5.5.5</text>
</svg><p class="cap">The main lab of this module: two non-backbone areas joined through area 0 by two ABRs.</p></div>

<h3>Why areas matter in real networks</h3>
<p>OSPF is a link-state protocol: every router in an area holds the same link-state database (LSDB) and runs Dijkstra's SPF algorithm on it. The cost of that design grows with the size of the area. A bigger area means a bigger LSDB (memory), more LSAs flooded (bandwidth and CPU), and more frequent full SPF runs, because any flapping link anywhere in the area forces every router in that area to recalculate. Areas limit all three. Detailed topology (type 1 and type 2 LSAs) stays inside its area. Other areas receive only prefixes and costs (type 3 LSAs), and a change inside one area causes only a cheap partial calculation elsewhere. Add summarisation at the border and a flap inside an area may cause no change at all outside it.</p>

<div class="eg"><p><b>Worked example.</b> A company has 240 routers in one area, each with about 6 links. The LSDB holds roughly 240 router LSAs plus network LSAs for every shared segment, and one unstable branch WAN link triggers SPF on all 240 routers. Split into a backbone of 20 routers and 11 regional areas of about 20 routers each, and each regional router only computes SPF over about 20 routers. If each ABR summarises its region into one /16, a branch flap in Pune changes nothing at all in Chennai's routing table.</p></div>

<h3>The two labs you will build</h3>
<p><b>Lab 1, OSPF multi-area with ABR summarisation</b> (the diagram above). The Pune campus is area 10 with router R1 and four LANs 172.16.0.0/24 to 172.16.3.0/24. The Chennai plant is area 20 with R5 and the LAN 192.168.20.0/24 where PC5 lives. CORE is the backbone. ABR1 and ABR2 are addressed but not running OSPF. You will bring both ABRs up, check that R1 learns 192.168.20.0/24 as an <code>O IA</code> route, summarise Pune into 172.16.0.0/22 on ABR1 with <code>area 10 range</code>, and ping from PC5 to 172.16.2.1.</p>
<p><b>Lab 2, OSPF point-to-point on Ethernet.</b> Three routers R1, R2 and R3 in a chain, all in area 0, every link electing a DR it does not need. You will convert both links to the point-to-point network type, tune Hello 5 / Dead 20 on the R1-R2 link and make R3's Loopback1 appear with its real /24 mask.</p>
<p><b>Ticket: Area 0 split.</b> In the troubleshooting chapter you will walk through a broken design where the backbone is cut in two and some routes vanish while others still appear but black-hole.</p>

<h3>The road map</h3>
<table class="cmp"><tr><th>Chapters</th><th>What you build in your head</th></tr>
<tr><td>2</td><td>Packets and adjacency in depth: DBD, master/slave, MTU</td></tr>
<tr><td>3 to 4</td><td>All network types; point-to-point on Ethernet, timers and passive-interface</td></tr>
<tr><td>5 to 7</td><td>LSA types 1 to 7, areas and router roles, configuring multi-area OSPF</td></tr>
<tr><td>8 to 10</td><td>Summarisation, filtering, path selection and cost tuning</td></tr>
<tr><td>11 to 13</td><td>OSPFv3 multi-area, troubleshooting, summary and exam checklist</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Thinking areas are about security or about separating customers. Areas are purely a scaling and stability tool. Routers in different areas still reach each other; they just see less detail.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Multi-area OSPF reduces the number of routes" is only true with summarisation. Without <code>area range</code>, an ABR still advertises every prefix as its own type 3 LSA. What areas always reduce is the topology detail and the scope of SPF runs.</p></div>

<div class="scn"><h4>The flapping branch that slowed the whole country</h4><p>A retail chain ran 300 routers in a single area 0. One branch had a faulty 4G backup link that went up and down every few minutes. The core routers showed SPF running hundreds of times per day and CPU spikes on the smaller branch routers. The engineer checked <code>show ip ospf | include SPF</code> and <code>show ip ospf database router</code>, found the branch LSA sequence number climbing constantly, and redesigned into a backbone plus regional areas with summaries at each ABR. The flaps then stayed inside one region.</p><p><b>Lesson:</b> areas contain instability; summaries hide it completely from the rest of the network.</p></div>

<div class="iv"><p class="q">"Why would you use multiple OSPF areas?"</p><p>Strong answer: to limit the size of the LSDB, the flooding scope of type 1 and 2 LSAs and the scope of full SPF runs, and to create points (the ABRs) where you can summarise and filter. Mention that all areas must connect to area 0, that inter-area traffic crosses the backbone, and that the real stability gain comes from summarisation at the ABR.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Areas split one big LSDB into smaller ones; detailed topology stays inside its area.</li>
<li>ABRs connect areas to area 0; ASBRs bring in external routes.</li>
<li>Other areas receive prefixes and costs (type 3), not topology.</li>
<li>Summarisation at the ABR gives the biggest stability win.</li>
<li>This module deepens CCNA OSPF: adjacency internals, network types, LSAs, multi-area, summarisation, filtering and OSPFv3.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap exactly samjha paoge ki do OSPF routers anjaan se FULL adjacency tak kaise pahunchte hain (DBD master/slave exchange aur MTU check ke saath), kisi bhi link par sahi network type choose aur configure kar paoge, database mein type 1 se 7 tak har LSA padh paoge, backbone ke around multi-area network design kar paoge, area border aur redistribution point par summarise kar paoge, inter-area routes filter kar paoge, predict kar paoge ki OSPF kaunsa path chunega, same design OSPFv3 mein chala paoge, aur ek real ticket se toota hua multi-area network troubleshoot kar paoge. Yeh CCNP ENCOR 350-401 v1.2 ka objective 3.2.b cover karta hai: simple OSPFv2/v3 environments configure karna, jismein multiple normal areas, summarisation aur filtering shaamil hain (neighbour adjacency, point-to-point aur broadcast network types, aur passive-interface).</p>

<p><b>Prerequisites.</b> Aapne CCNA ke modules <i>OSPFv2 single-area</i> aur <i>OSPFv3</i> khatam kar liye hain. Aapko pehle se pata hai router ID kya hai, paanch packet types ke naam, Down se Full tak neighbour states, DR/BDR election, cost aur reference bandwidth, aur OSPF enable karne ke do tarike (network statements aur interface commands). Hum un ideas ko refer karenge aur ek level gehraai mein jaayenge, dobara nahi padhayenge. Prefix lengths aur wildcard masks par bhi aapki pakad honi chahiye, kyunki summarisation aur prefix-lists unhi par depend karte hain.</p>

<h3>Ek analogy: states wala desh</h3>
<p>Socho India ka road department har gaon ki har gali ka ek giant map rakhne ki koshish kar raha hai. Jab bhi Kerala ke kisi gaon ki gali band ho, Punjab ke har district office ko apna map dobara banana padega. Yahi scale par single-area OSPF hai: har router har detail rakhta hai, aur har change har jagah poora recalculation trigger karta hai.</p>
<p>Asli solution hai <b>states</b>. State ke andar offices apni sadkon ka detailed map rakhte hain. State border par ek <b>border office</b> baaki desh ko sirf summary batata hai: "Kerala ke towns mere through milenge, lagbhag 600 km door". Saare state highways ek <b>national highway network</b> se jude hain, isliye koi bhi state kisi bhi doosre state tak pahunch sakta hai. OSPF mein states hain <b>areas</b>, border offices hain <b>Area Border Routers (ABRs)</b>, aur national highway hai <b>area 0, backbone</b>. Jo router bilkul alag road system se judta hai, jaise videsh se judne wala port, woh <b>Autonomous System Boundary Router (ASBR)</b> hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Multi-area OSPF ki lab topology">
<rect x="10" y="40" width="190" height="140" rx="12" fill="#bbf7d0"/><text x="105" y="62" text-anchor="middle" class="svg-ink" font-size="13">Area 10 (Pune)</text>
<rect x="215" y="40" width="210" height="140" rx="12" fill="#bae6fd"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="13">Area 0 (backbone)</text>
<rect x="440" y="40" width="190" height="140" rx="12" fill="#fde68a"/><text x="535" y="62" text-anchor="middle" class="svg-ink" font-size="13">Area 20 (Chennai)</text>
<rect x="30" y="95" width="70" height="40" rx="8" fill="#e2e8f0"/><text x="65" y="120" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="175" y="95" width="80" height="40" rx="8" fill="#ddd6fe"/><text x="215" y="120" text-anchor="middle" class="svg-ink" font-size="13">ABR1</text>
<rect x="285" y="95" width="70" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">CORE</text>
<rect x="385" y="95" width="80" height="40" rx="8" fill="#ddd6fe"/><text x="425" y="120" text-anchor="middle" class="svg-ink" font-size="13">ABR2</text>
<rect x="540" y="95" width="70" height="40" rx="8" fill="#e2e8f0"/><text x="575" y="120" text-anchor="middle" class="svg-ink" font-size="13">R5</text>
<line x1="100" y1="115" x2="175" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="255" y1="115" x2="285" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="355" y1="115" x2="385" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="465" y1="115" x2="540" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="65" y="160" text-anchor="middle" class="svg-muted" font-size="12">172.16.0-3.0/24</text>
<text x="575" y="160" text-anchor="middle" class="svg-muted" font-size="12">192.168.20.0/24</text>
<text x="137" y="108" text-anchor="middle" class="svg-accent" font-size="12">10.10.12.0/30</text>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">10.0.23.0 + 10.0.34.0</text>
<text x="502" y="108" text-anchor="middle" class="svg-accent" font-size="12">10.20.45.0/30</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">RIDs: R1 1.1.1.1, ABR1 2.2.2.2, CORE 3.3.3.3, ABR2 4.4.4.4, R5 5.5.5.5</text>
</svg><p class="cap">Is module ki main lab: do non-backbone areas, do ABRs ke through area 0 se jude hue.</p></div>

<h3>Real networks mein areas kyun matter karte hain</h3>
<p>OSPF link-state protocol hai: area ka har router same link-state database (LSDB) rakhta hai aur uspar Dijkstra ka SPF algorithm chalata hai. Is design ki cost area ke size ke saath badhti hai. Bada area matlab bada LSDB (memory), zyada LSAs flood (bandwidth aur CPU), aur zyada baar full SPF, kyunki area mein kahin bhi ek flapping link us area ke har router ko recalculate karne par majboor karta hai. Areas teeno ko limit karte hain. Detailed topology (type 1 aur type 2 LSAs) apne area ke andar rehti hai. Doosre areas ko sirf prefixes aur costs milte hain (type 3 LSAs), aur ek area ke andar ka change baaki jagah sirf sasta partial calculation karwata hai. Border par summarisation jodo to area ke andar ka flap bahar shayad koi change hi na kare.</p>

<div class="eg"><p><b>Worked example.</b> Ek company ke ek area mein 240 routers hain, har ek ke lagbhag 6 links. LSDB mein lagbhag 240 router LSAs plus har shared segment ke network LSAs hain, aur ek unstable branch WAN link saare 240 routers par SPF trigger karta hai. Ise 20 routers ke backbone aur lagbhag 20 routers wale 11 regional areas mein baanto, to har regional router sirf lagbhag 20 routers par SPF compute karta hai. Agar har ABR apne region ko ek /16 mein summarise kare, to Pune ki branch ka flap Chennai ki routing table mein kuch bhi nahi badalta.</p></div>

<h3>Do labs jo aap banaoge</h3>
<p><b>Lab 1, ABR summarisation ke saath OSPF multi-area</b> (upar wala diagram). Pune campus area 10 hai jismein router R1 aur chaar LANs 172.16.0.0/24 se 172.16.3.0/24 hain. Chennai plant area 20 hai jismein R5 aur LAN 192.168.20.0/24 hai jahan PC5 hai. CORE backbone hai. ABR1 aur ABR2 par addresses hain lekin OSPF nahi chal raha. Aap dono ABRs up karoge, check karoge ki R1 192.168.20.0/24 ko <code>O IA</code> route ke roop mein seekhta hai, ABR1 par <code>area 10 range</code> se Pune ko 172.16.0.0/22 mein summarise karoge, aur PC5 se 172.16.2.1 ping karoge.</p>
<p><b>Lab 2, Ethernet par OSPF point-to-point.</b> Teen routers R1, R2 aur R3 chain mein, sab area 0 mein, har link aisa DR elect kar raha hai jiski zaroorat nahi. Aap dono links ko point-to-point network type mein badloge, R1-R2 link par Hello 5 / Dead 20 tune karoge aur R3 ka Loopback1 asli /24 mask ke saath dikhaoge.</p>
<p><b>Ticket: Area 0 split.</b> Troubleshooting chapter mein aap ek toote design ko walk karoge jahan backbone do tukdon mein kat gaya hai aur kuch routes gayab ho jaate hain jabki kuch dikhte to hain par black-hole karte hain.</p>

<h3>Road map</h3>
<table class="cmp"><tr><th>Chapters</th><th>Dimaag mein kya banaoge</th></tr>
<tr><td>2</td><td>Packets aur adjacency gehraai se: DBD, master/slave, MTU</td></tr>
<tr><td>3 se 4</td><td>Saare network types; Ethernet par point-to-point, timers aur passive-interface</td></tr>
<tr><td>5 se 7</td><td>LSA types 1 se 7, areas aur router roles, multi-area OSPF configure karna</td></tr>
<tr><td>8 se 10</td><td>Summarisation, filtering, path selection aur cost tuning</td></tr>
<tr><td>11 se 13</td><td>OSPFv3 multi-area, troubleshooting, summary aur exam checklist</td></tr></table>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki areas security ke liye ya customers alag karne ke liye hain. Areas sirf scaling aur stability ka tool hain. Alag areas ke routers ek doosre tak pahunchte rehte hain; bas unhe kam detail dikhti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Multi-area OSPF routes ki sankhya kam karta hai" sirf summarisation ke saath sach hai. <code>area range</code> ke bina ABR har prefix ko alag type 3 LSA ke roop mein advertise karta hai. Areas hamesha jo kam karte hain woh hai topology detail aur SPF runs ka scope.</p></div>

<div class="scn"><h4>Flap karti branch jisne poore desh ko slow kar diya</h4><p>Ek retail chain ek hi area 0 mein 300 routers chala rahi thi. Ek branch ka kharab 4G backup link har kuch minute mein up-down ho raha tha. Core routers par din mein saikdon baar SPF chalta dikha aur chhote branch routers par CPU spikes aaye. Engineer ne <code>show ip ospf | include SPF</code> aur <code>show ip ospf database router</code> check kiya, branch LSA ka sequence number lagatar badhta paaya, aur design ko backbone plus regional areas mein badla, har ABR par summaries ke saath. Uske baad flaps ek region ke andar hi reh gaye.</p><p><b>Seekh:</b> areas instability ko rokte hain; summaries use baaki network se poori tarah chhupa dete hain.</p></div>

<div class="iv"><p class="q">"Aap multiple OSPF areas kyun use karoge?"</p><p>Strong answer: LSDB ka size, type 1 aur 2 LSAs ka flooding scope aur full SPF runs ka scope limit karne ke liye, aur aise points (ABRs) banane ke liye jahan summarise aur filter kar sako. Batao ki saare areas ko area 0 se judna zaroori hai, inter-area traffic backbone cross karta hai, aur asli stability gain ABR par summarisation se aata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Areas ek bade LSDB ko chhote LSDBs mein baantte hain; detailed topology apne area ke andar rehti hai.</li>
<li>ABRs areas ko area 0 se jodte hain; ASBRs external routes laate hain.</li>
<li>Doosre areas ko prefixes aur costs milte hain (type 3), topology nahi.</li>
<li>ABR par summarisation sabse bada stability fayda deta hai.</li>
<li>Yeh module CCNA OSPF ko gehra karta hai: adjacency internals, network types, LSAs, multi-area, summarisation, filtering aur OSPFv3.</li>
</ul></div>
`}};export{e as default};