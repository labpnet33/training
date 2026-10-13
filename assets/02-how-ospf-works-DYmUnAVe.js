var e={id:`how-ospf-works`,h:{en:`How OSPF works: link state, packets and SPF`,hi:`OSPF kaise kaam karta hai: link state, packets aur SPF`},body:{en:`
<p>OSPF is a <b>link-state</b> protocol. The phrase means: each router describes the state of its own links, shares it with all other routers, and every router builds an identical map of the network. Then each router works out the shortest path to every destination by itself. Compare this with distance-vector protocols such as RIP, where routers only pass along what neighbours told them ("I am 2 hops from there").</p>

<h3>Key facts</h3>
<ul>
<li>OSPF is an <b>interior gateway protocol (IGP)</b>: it runs inside one organisation's network (one autonomous system).</li>
<li>It is an open standard, defined for IPv4 as <b>OSPFv2</b> and for IPv6 as <b>OSPFv3</b>. This module covers OSPFv2.</li>
<li>It runs directly over IP as protocol number <b>89</b>, not over TCP or UDP.</li>
<li>It uses multicast addresses <b>224.0.0.5</b> (all OSPF routers) and <b>224.0.0.6</b> (DR and BDR only).</li>
<li>Routes learned by OSPF within the AS have preference 10 in Junos (external ones, 150).</li>
<li>The metric is <b>cost</b>, based on interface bandwidth. Lower cost is better.</li>
</ul>

<h3>The five packet types</h3>
<table class="cmp"><tr><th>Type</th><th>Name</th><th>Job</th></tr>
<tr><td>1</td><td>Hello</td><td>Find neighbours, check settings, act as keepalive, elect the DR</td></tr>
<tr><td>2</td><td>Database Description (DBD)</td><td>Summarise the list of LSAs a router has</td></tr>
<tr><td>3</td><td>Link State Request (LSR)</td><td>Ask for specific LSAs the router is missing</td></tr>
<tr><td>4</td><td>Link State Update (LSU)</td><td>Carry the actual LSAs</td></tr>
<tr><td>5</td><td>Link State Acknowledgement</td><td>Confirm receipt of LSAs so delivery is reliable</td></tr></table>

<h3>Analogy: the neighbourhood notice board</h3>
<p>Imagine every house in a street writes a card: "I am house 7; my neighbours are house 6 and house 8; the road to each is 1 km long." Every house puts its card on a shared notice board and copies everybody else's cards. After a few minutes every house holds the same stack of cards. Each house then draws the street map from the stack and finds the shortest route from itself to every other house. If house 8 is demolished, house 7 writes a new card, the new card is copied everywhere, and every house redraws its map.</p>
<p>In OSPF the card is an <b>LSA (Link State Advertisement)</b>, the shared stack is the <b>link-state database (LSDB)</b>, and the map-drawing is the <b>SPF algorithm</b> (also called Dijkstra).</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Link-state process">
<rect x="10" y="30" width="140" height="70" rx="10" fill="#bae6fd"/><text x="80" y="58" text-anchor="middle" class="svg-ink" font-size="13">1. Hello</text><text x="80" y="78" text-anchor="middle" class="svg-muted" font-size="11">meet neighbours</text>
<rect x="170" y="30" width="140" height="70" rx="10" fill="#ddd6fe"/><text x="240" y="58" text-anchor="middle" class="svg-ink" font-size="13">2. Exchange LSAs</text><text x="240" y="78" text-anchor="middle" class="svg-muted" font-size="11">DBD, LSR, LSU</text>
<rect x="330" y="30" width="140" height="70" rx="10" fill="#fde68a"/><text x="400" y="58" text-anchor="middle" class="svg-ink" font-size="13">3. Same LSDB</text><text x="400" y="78" text-anchor="middle" class="svg-muted" font-size="11">identical on all</text>
<rect x="490" y="30" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="560" y="58" text-anchor="middle" class="svg-ink" font-size="13">4. Run SPF</text><text x="560" y="78" text-anchor="middle" class="svg-muted" font-size="11">routes to inet.0</text>
<line x1="150" y1="65" x2="170" y2="65" stroke="#64748b" stroke-width="2"/><line x1="310" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><line x1="470" y1="65" x2="490" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">A topology change starts the cycle again from step 2</text>
</svg><p class="cap">From hello to routing table. After the first sync only changes are flooded.</p></div>

<h3>Router ID</h3>
<p>Every OSPF router has a <b>router ID (RID)</b>, a 32-bit number written like an IPv4 address. It identifies the router in the database and must be unique. In Junos, set it explicitly:</p>
<pre class="code">set routing-options router-id 10.255.4.1</pre>
<p>Using the loopback address as router ID is the best practice, because the loopback never goes down with a link. If you do not configure one, Junos picks an address from an interface (normally the lo0 primary address), but a router ID chosen by luck can change when interfaces change, so configure it. The router ID does not have to be a reachable address, but making it the loopback makes it easy to ping and identify.</p>

<h3>How the cost is calculated</h3>
<p>OSPF cost is derived from bandwidth: <code>cost = reference bandwidth / interface bandwidth</code>. Junos uses a default reference bandwidth of 100 Mbps, so a Fast Ethernet (100 Mbps) link costs 1 and slower links cost more. A gigabit interface would also compute 0.1 and be rounded up to the minimum cost of 1, so on modern networks you raise the reference bandwidth (chapter 7). A path's cost is the sum of the costs of the outgoing interfaces along the path, and OSPF prefers the lowest total.</p>
<div class="eg"><p><b>Worked example.</b> With reference bandwidth 100g, a 1 Gbps interface costs 100 and a 10 Gbps interface costs 10. Path A crosses two 1 Gbps links: 100 + 100 = 200. Path B crosses one 10 Gbps link: 10. OSPF chooses B. If two paths tie at 200, both are installed (equal-cost multipath).</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking OSPF counts hops. It does not. A path of five fast links can beat a path of one slow link, because cost is bandwidth based.</p></div>
<div class="exam"><p><b>Exam trap.</b> OSPF uses IP protocol 89, not TCP or UDP, and multicast 224.0.0.5 and 224.0.0.6. Link-state, not distance-vector. Routers must share the same LSDB inside an area. The algorithm is SPF (Dijkstra).</p></div>

<div class="scn"><h4>The router ID collision</h4><p>A network team cloned a router configuration to build a new site and forgot to change the router ID. Two routers now claimed the same ID. Neighbours reported flapping adjacencies and the LSDB kept changing as each router tried to override the other's LSAs. Giving the clone its own loopback-based router ID stopped the flapping at once.</p><p><b>Lesson:</b> router IDs must be unique; configure them deliberately, preferably from the loopback.</p></div>

<div class="iv"><p class="q">"Explain link-state routing in simple words."</p><p>Each router advertises the state and cost of its own links in LSAs and floods them to all routers in the area. All routers store the same link-state database and independently run SPF (Dijkstra) to compute the shortest path tree, then install the best routes. Compared with distance-vector, link-state has a full map, converges faster and is loop free within an area.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPF is link-state: LSAs build an identical LSDB, and each router runs SPF.</li>
<li>OSPF runs over IP protocol 89 using 224.0.0.5 and 224.0.0.6.</li>
<li>Five packet types: Hello, DBD, LSR, LSU, LSAck.</li>
<li>Router ID must be unique; set it from the loopback.</li>
<li>Cost = reference bandwidth / interface bandwidth; the lowest total path cost wins.</li>
</ul></div>
`,hi:`
<p>OSPF ek <b>link-state</b> protocol hai. Iska matlab: har router apne links ki state describe karta hai, use baaki sab routers ke saath share karta hai, aur har router network ka identical map banata hai. Phir har router khud har destination tak shortest path nikalta hai. Iski tulna distance-vector protocols jaise RIP se karo, jahan routers sirf wahi aage pass karte hain jo padosiyon ne bataya ("main wahan se 2 hop door hoon").</p>

<h3>Key facts</h3>
<ul>
<li>OSPF ek <b>interior gateway protocol (IGP)</b> hai: yeh ek organisation ke network (ek autonomous system) ke andar chalta hai.</li>
<li>Yeh open standard hai, IPv4 ke liye <b>OSPFv2</b> aur IPv6 ke liye <b>OSPFv3</b>. Is module mein OSPFv2 hai.</li>
<li>Yeh seedha IP par protocol number <b>89</b> ke roop mein chalta hai, TCP ya UDP par nahi.</li>
<li>Yeh multicast addresses <b>224.0.0.5</b> (saare OSPF routers) aur <b>224.0.0.6</b> (sirf DR aur BDR) use karta hai.</li>
<li>Junos mein AS ke andar OSPF se seekhe routes ki preference 10 hai (external ki 150).</li>
<li>Metric <b>cost</b> hai, interface bandwidth par based. Kam cost behtar.</li>
</ul>

<h3>Paanch packet types</h3>
<table class="cmp"><tr><th>Type</th><th>Naam</th><th>Kaam</th></tr>
<tr><td>1</td><td>Hello</td><td>Neighbours dhoondhna, settings check karna, keepalive, DR elect karna</td></tr>
<tr><td>2</td><td>Database Description (DBD)</td><td>Router ke paas jo LSAs hain unki list ka summary</td></tr>
<tr><td>3</td><td>Link State Request (LSR)</td><td>Jo specific LSAs missing hain unhe maangna</td></tr>
<tr><td>4</td><td>Link State Update (LSU)</td><td>Asli LSAs carry karna</td></tr>
<tr><td>5</td><td>Link State Acknowledgement</td><td>LSAs ki receipt confirm karna taaki delivery reliable ho</td></tr></table>

<h3>Analogy: mohalle ka notice board</h3>
<p>Socho gali ka har ghar ek card likhta hai: "main ghar 7 hoon; mere padosi ghar 6 aur ghar 8 hain; har ek tak sadak 1 km hai." Har ghar apna card shared notice board par lagata hai aur sabke cards ki copy leta hai. Kuch minute baad har ghar ke paas same cards ka stack hota hai. Har ghar stack se gali ka map banata hai aur apne se har doosre ghar tak sabse chhota raasta nikalta hai. Ghar 8 toot jaaye to ghar 7 naya card likhta hai, naya card har jagah copy hota hai, aur har ghar apna map dobara banata hai.</p>
<p>OSPF mein card <b>LSA (Link State Advertisement)</b> hai, shared stack <b>link-state database (LSDB)</b> hai, aur map banana <b>SPF algorithm</b> (Dijkstra) hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Link-state process">
<rect x="10" y="30" width="140" height="70" rx="10" fill="#bae6fd"/><text x="80" y="58" text-anchor="middle" class="svg-ink" font-size="13">1. Hello</text><text x="80" y="78" text-anchor="middle" class="svg-muted" font-size="11">neighbours se milo</text>
<rect x="170" y="30" width="140" height="70" rx="10" fill="#ddd6fe"/><text x="240" y="58" text-anchor="middle" class="svg-ink" font-size="13">2. LSAs exchange</text><text x="240" y="78" text-anchor="middle" class="svg-muted" font-size="11">DBD, LSR, LSU</text>
<rect x="330" y="30" width="140" height="70" rx="10" fill="#fde68a"/><text x="400" y="58" text-anchor="middle" class="svg-ink" font-size="13">3. Same LSDB</text><text x="400" y="78" text-anchor="middle" class="svg-muted" font-size="11">sab par identical</text>
<rect x="490" y="30" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="560" y="58" text-anchor="middle" class="svg-ink" font-size="13">4. SPF chalao</text><text x="560" y="78" text-anchor="middle" class="svg-muted" font-size="11">routes inet.0 mein</text>
<line x1="150" y1="65" x2="170" y2="65" stroke="#64748b" stroke-width="2"/><line x1="310" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><line x1="470" y1="65" x2="490" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">Topology change step 2 se cycle dobara shuru karta hai</text>
</svg><p class="cap">Hello se routing table tak. Pehle sync ke baad sirf changes flood hote hain.</p></div>

<h3>Router ID</h3>
<p>Har OSPF router ka ek <b>router ID (RID)</b> hota hai, 32-bit number jo IPv4 address jaisa likha jaata hai. Yeh database mein router ki pehchaan hai aur unique hona chahiye. Junos mein explicitly set karo:</p>
<pre class="code">set routing-options router-id 10.255.4.1</pre>
<p>Loopback address ko router ID banana best practice hai, kyunki loopback link ke saath down nahi hota. Configure na karo to Junos kisi interface se address chunta hai (aam taur par lo0 ka primary address), lekin kismat se chuna hua router ID interfaces badalne par badal sakta hai, isliye configure karo. Router ID ka reachable address hona zaroori nahi, lekin loopback rakhne se ping aur pehchaan aasaan hoti hai.</p>

<h3>Cost kaise calculate hota hai</h3>
<p>OSPF cost bandwidth se nikalta hai: <code>cost = reference bandwidth / interface bandwidth</code>. Junos ki default reference bandwidth 100 Mbps hai, isliye Fast Ethernet (100 Mbps) link ka cost 1 aur slow links ka zyada. Gigabit interface 0.1 compute hoga aur minimum cost 1 par round up hoga, isliye modern networks mein reference bandwidth badhate hain (chapter 7). Path ka cost raaste ke outgoing interfaces ke costs ka jod hai, aur OSPF sabse kam total prefer karta hai.</p>
<div class="eg"><p><b>Worked example.</b> Reference bandwidth 100g ke saath 1 Gbps interface ka cost 100 aur 10 Gbps ka 10. Path A do 1 Gbps links paar karta hai: 100 + 100 = 200. Path B ek 10 Gbps link paar karta hai: 10. OSPF B chunta hai. Do paths 200 par tie hon to dono install hote hain (equal-cost multipath).</p></div>

<div class="warn"><p><b>Common mistake.</b> Yeh sochna ki OSPF hops ginta hai. Aisa nahi hai. Paanch tez links ka path ek slow link ke path ko haraa sakta hai, kyunki cost bandwidth par based hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> OSPF IP protocol 89 use karta hai, TCP ya UDP nahi, aur multicast 224.0.0.5 aur 224.0.0.6. Link-state, distance-vector nahi. Ek area ke andar routers ka LSDB same hona chahiye. Algorithm SPF (Dijkstra) hai.</p></div>

<div class="scn"><h4>Router ID ka collision</h4><p>Ek network team ne naya site banane ke liye router configuration clone ki aur router ID badalna bhool gayi. Ab do routers same ID claim kar rahe the. Neighbours ne flapping adjacencies report ki aur LSDB badalta raha kyunki har router doosre ke LSAs override karne ki koshish kar raha tha. Clone ko apna loopback-based router ID dene se flapping turant ruk gayi.</p><p><b>Lesson:</b> router IDs unique hone chahiye; unhe soch kar configure karo, tarjeeh loopback se.</p></div>

<div class="iv"><p class="q">"Link-state routing simple shabdon mein samjhao."</p><p>Har router apne links ki state aur cost LSAs mein advertise karta hai aur area ke saare routers mein flood karta hai. Saare routers same link-state database rakhte hain aur independently SPF (Dijkstra) chalate hain shortest path tree compute karne ke liye, phir best routes install karte hain. Distance-vector ke muqable link-state ke paas poora map hota hai, convergence tez hai aur area ke andar loop free hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPF link-state hai: LSAs identical LSDB banate hain, aur har router SPF chalata hai.</li>
<li>OSPF IP protocol 89 par 224.0.0.5 aur 224.0.0.6 use karta hai.</li>
<li>Paanch packet types: Hello, DBD, LSR, LSU, LSAck.</li>
<li>Router ID unique hona chahiye; loopback se set karo.</li>
<li>Cost = reference bandwidth / interface bandwidth; sabse kam total path cost jeetta hai.</li>
</ul></div>
`}};export{e as default};