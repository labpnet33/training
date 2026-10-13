var e={id:`dynamic-routing`,h:{en:`Dynamic routing families: IGP, EGP, distance vector and link state`,hi:`Dynamic routing families: IGP, EGP, distance vector aur link state`},body:{en:`
<p>Before learning OSPF itself, place it on the map of routing protocols. Picture two ways of asking for directions in an unfamiliar town. In the first, you ask the shopkeeper next to you. He says "the station is three streets that way" because somebody told him so. You trust him, but you have no idea whether he is right. In the second, you open a map and work out the route yourself. The first style is <b>distance vector</b>. The second is <b>link state</b>, and that is OSPF.</p>

<h3>IGP versus EGP</h3>
<p>An <b>autonomous system (AS)</b> is a network under one administrative control, such as a company, a university or an internet service provider. Protocols that route <i>inside</i> an AS are <b>Interior Gateway Protocols (IGPs)</b>: RIP, EIGRP, OSPF and IS-IS. The protocol that routes <i>between</i> autonomous systems on the internet is an <b>Exterior Gateway Protocol (EGP)</b>, and today that means only <b>BGP</b>. IGPs are tuned for fast convergence and the best path by speed. BGP is tuned for policy and for carrying the full internet table.</p>

<table class="cmp"><tr><th>Protocol</th><th>Type</th><th>Algorithm</th><th>Metric</th><th>AD</th></tr>
<tr><td>RIPv2</td><td>IGP</td><td>Distance vector</td><td>Hop count (max 15)</td><td>120</td></tr>
<tr><td>EIGRP</td><td>IGP</td><td>Advanced distance vector (DUAL)</td><td>Bandwidth and delay</td><td>90 internal, 170 external</td></tr>
<tr><td>OSPF</td><td>IGP</td><td>Link state (SPF / Dijkstra)</td><td>Cost from bandwidth</td><td>110</td></tr>
<tr><td>IS-IS</td><td>IGP</td><td>Link state</td><td>Configured metric</td><td>115</td></tr>
<tr><td>BGP</td><td>EGP</td><td>Path vector</td><td>Path attributes</td><td>20 eBGP, 200 iBGP</td></tr>
</table>

<h3>Distance vector: routing by rumour</h3>
<p>A distance vector router tells its directly connected neighbours what it knows: "I can reach network X at distance 3". The neighbour adds its own distance and passes it on. No router sees the whole topology; each knows only a <b>distance</b> and a <b>direction</b> (the next hop). Classic RIP sends its full table every 30 seconds whether anything changed or not. Because information travels hop by hop, bad news travels slowly, and loops can form while routers still believe an old rumour. RIP needs extra rules to cope: split horizon, route poisoning and hold-down timers.</p>

<h3>Link state: everybody gets the map</h3>
<p>A link-state router does not advertise its routing table. It describes <b>its own links</b>: "I am router 1.1.1.1, I have a link to 2.2.2.2 with cost 1 and a stub network 1.1.1.1/32". These descriptions are called <b>LSAs</b> (link-state advertisements) and are flooded unchanged to every router in the area. Every router stores all of them in its <b>LSDB</b> and runs the <b>SPF</b> algorithm with itself as the root. The results are loop-free, convergence is fast, and updates are sent only when something changes, with a periodic refresh every 30 minutes. The price is more memory and CPU, and the need for good design (areas) in very large networks.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Distance vector compared with link state">
<rect x="10" y="10" width="300" height="200" rx="10" fill="#fed7aa"/>
<text x="160" y="34" text-anchor="middle" class="svg-ink" font-size="14">Distance vector</text>
<rect x="30" y="60" width="60" height="36" rx="6" fill="#e2e8f0"/><text x="60" y="83" text-anchor="middle" class="svg-ink" font-size="13">A</text>
<rect x="130" y="60" width="60" height="36" rx="6" fill="#e2e8f0"/><text x="160" y="83" text-anchor="middle" class="svg-ink" font-size="13">B</text>
<rect x="230" y="60" width="60" height="36" rx="6" fill="#e2e8f0"/><text x="260" y="83" text-anchor="middle" class="svg-ink" font-size="13">C</text>
<line x1="90" y1="78" x2="130" y2="78" stroke="#64748b" stroke-width="2"/><line x1="190" y1="78" x2="230" y2="78" stroke="#64748b" stroke-width="2"/>
<text x="160" y="130" text-anchor="middle" class="svg-muted" font-size="12">C tells B: net X, 1 hop</text>
<text x="160" y="152" text-anchor="middle" class="svg-muted" font-size="12">B tells A: net X, 2 hops</text>
<text x="160" y="184" text-anchor="middle" class="svg-ink" font-size="12">A knows distance and direction only</text>
<rect x="330" y="10" width="300" height="200" rx="10" fill="#bbf7d0"/>
<text x="480" y="34" text-anchor="middle" class="svg-ink" font-size="14">Link state (OSPF)</text>
<rect x="350" y="60" width="60" height="36" rx="6" fill="#e2e8f0"/><text x="380" y="83" text-anchor="middle" class="svg-ink" font-size="13">A</text>
<rect x="450" y="60" width="60" height="36" rx="6" fill="#e2e8f0"/><text x="480" y="83" text-anchor="middle" class="svg-ink" font-size="13">B</text>
<rect x="550" y="60" width="60" height="36" rx="6" fill="#e2e8f0"/><text x="580" y="83" text-anchor="middle" class="svg-ink" font-size="13">C</text>
<line x1="410" y1="78" x2="450" y2="78" stroke="#64748b" stroke-width="2"/><line x1="510" y1="78" x2="550" y2="78" stroke="#64748b" stroke-width="2"/>
<text x="480" y="130" text-anchor="middle" class="svg-muted" font-size="12">Every router floods its own links</text>
<text x="480" y="152" text-anchor="middle" class="svg-muted" font-size="12">All hold the same LSDB</text>
<text x="480" y="184" text-anchor="middle" class="svg-ink" font-size="12">Each runs SPF on the full map</text>
</svg><p class="cap">Distance vector passes on conclusions; link state passes on facts and lets each router conclude for itself.</p></div>

<h3>How the router chooses: prefix, then AD, then metric</h3>
<p>A router may learn the same prefix from several sources. The routing table (from the previous module) applies three rules in a fixed order:</p>
<ol>
<li><b>Longest prefix match</b> decides which route a packet uses. A /24 beats a /16 for an address inside both.</li>
<li><b>Administrative distance (AD)</b> decides which source is installed when two sources offer the <i>same</i> prefix and length. Lower is more trusted: connected 0, static 1, EIGRP 90, OSPF 110, RIP 120.</li>
<li><b>Metric</b> decides between paths learned from the <i>same</i> protocol. For OSPF the lowest total cost wins; equal costs are load-shared.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> R1 learns 10.1.1.0/24 from OSPF with metric 20 and from EIGRP with metric 3072. It also has a static route 10.1.0.0/16. Only EIGRP's /24 is installed, because AD 90 beats 110 (the metrics 20 and 3072 are never compared). A packet to 10.1.1.5 matches both the /24 and the /16, and the /24 wins as the longer match. A packet to 10.1.2.5 matches only the /16 static route.</p></div>

<p>An OSPF entry in <code>show ip route</code> reads left to right like this:</p>
<pre class="out">R1# show ip route ospf
      10.0.0.0/8 is variably subnetted, 5 subnets, 2 masks
<span class="hl">O        10.0.34.0/30 [110/3] via 10.0.12.2, 00:02:11, GigabitEthernet0/0</span></pre>
<p><code>O</code> is the source (OSPF), <code>[110/3]</code> is AD 110 and metric 3, <code>via 10.0.12.2</code> is the next hop, then the age of the route and the exit interface.</p>

<div class="warn"><p><b>Common mistake.</b> Comparing metrics across protocols ("OSPF cost 20 is less than EIGRP metric 3072, so OSPF wins"). Metrics are only compared inside one protocol. Between protocols, AD decides.</p></div>

<div class="exam"><p><b>Exam trap.</b> A <b>floating static route</b> meant as a backup to OSPF must have an AD <b>higher than 110</b>, for example <code>ip route 10.50.0.0 255.255.255.0 10.9.9.2 200</code>. Any value of 110 or lower replaces or ties with the OSPF route.</p></div>

<div class="scn"><h4>The backup that became the primary</h4><p>A branch had OSPF over a 1 Gbps fibre and a 20 Mbps broadband tunnel as backup. The engineer added <code>ip route 10.50.0.0 255.255.255.0 172.16.9.2 100</code>, believing "100 is a high number". Users complained that file transfers crawled. <code>show ip route 10.50.0.0</code> showed "Known via static, distance 100" instead of OSPF. AD 100 is more trusted than OSPF's 110, so the backup won permanently. Changing the AD to 200 restored OSPF as primary and left the static waiting quietly for a fibre failure.</p><p><b>Lesson:</b> AD is the tie-breaker between sources. Know the default values by heart.</p></div>

<div class="iv"><p class="q">"What is the difference between a distance vector and a link-state protocol?"</p><p>Strong answer: a distance vector router advertises its routes (distance and direction) to neighbours, which pass them on, so no router sees the whole topology and convergence can be slow with loop risks. A link-state router floods descriptions of its own links (LSAs) to every router in the area; all build an identical LSDB and each runs Dijkstra's SPF to compute loop-free best paths, with fast, event-driven convergence at the cost of more CPU and memory. Give examples: RIP versus OSPF, and mention EIGRP as advanced distance vector.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGPs (RIP, EIGRP, OSPF, IS-IS) route inside one AS; BGP is the EGP that routes between autonomous systems.</li>
<li>Distance vector shares routes hop by hop; link state floods link descriptions so every router computes its own paths.</li>
<li>OSPF is link state, open standard, AD 110, metric = cost.</li>
<li>Route selection order: longest prefix match, then lowest AD, then lowest metric.</li>
<li>A floating static backing up OSPF needs an AD above 110.</li>
</ul></div>
`,hi:`
<p>OSPF khud seekhne se pehle use routing protocols ke map par rakho. Ek anjaan shehar mein raasta poochne ke do tareeke socho. Pehle mein aap bagal ke dukaandaar se poochte ho. Woh kehta hai "station us taraf teen gali door hai" kyunki kisi ne use bataya tha. Aap uspar bharosa karte ho, lekin pata nahi ki woh sahi hai ya nahi. Dusre mein aap map kholte ho aur raasta khud nikaalte ho. Pehla style <b>distance vector</b> hai. Dusra <b>link state</b> hai, aur wahi OSPF hai.</p>

<h3>IGP versus EGP</h3>
<p><b>Autonomous system (AS)</b> ek aisa network hai jo ek hi administrative control mein ho, jaise ek company, university ya internet service provider. Jo protocols AS ke <i>andar</i> route karte hain woh <b>Interior Gateway Protocols (IGPs)</b> hain: RIP, EIGRP, OSPF aur IS-IS. Internet par autonomous systems ke <i>beech</i> route karne wala protocol <b>Exterior Gateway Protocol (EGP)</b> hai, aur aaj iska matlab sirf <b>BGP</b> hai. IGPs fast convergence aur speed ke hisaab se best path ke liye tune hote hain. BGP policy aur poori internet table carry karne ke liye tune hota hai.</p>

<table class="cmp"><tr><th>Protocol</th><th>Type</th><th>Algorithm</th><th>Metric</th><th>AD</th></tr>
<tr><td>RIPv2</td><td>IGP</td><td>Distance vector</td><td>Hop count (max 15)</td><td>120</td></tr>
<tr><td>EIGRP</td><td>IGP</td><td>Advanced distance vector (DUAL)</td><td>Bandwidth aur delay</td><td>90 internal, 170 external</td></tr>
<tr><td>OSPF</td><td>IGP</td><td>Link state (SPF / Dijkstra)</td><td>Bandwidth se cost</td><td>110</td></tr>
<tr><td>IS-IS</td><td>IGP</td><td>Link state</td><td>Configured metric</td><td>115</td></tr>
<tr><td>BGP</td><td>EGP</td><td>Path vector</td><td>Path attributes</td><td>20 eBGP, 200 iBGP</td></tr>
</table>

<h3>Distance vector: suni-sunayi baat se routing</h3>
<p>Distance vector router apne directly connected neighbours ko batata hai ki use kya pata hai: "main network X tak distance 3 par pahunch sakta hoon". Neighbour apni distance jodta hai aur aage bhej deta hai. Kisi router ko poori topology nahi dikhti; har ek ko sirf <b>distance</b> aur <b>direction</b> (next hop) pata hota hai. Classic RIP har 30 second mein apni poori table bhejta hai, chahe kuch badla ho ya nahi. Kyunki information hop by hop chalti hai, buri khabar dheere pahunchti hai, aur jab tak routers purani baat par bharosa karte hain, loops ban sakte hain. RIP ko sambhalne ke liye extra rules chahiye: split horizon, route poisoning aur hold-down timers.</p>

<h3>Link state: sabko map milta hai</h3>
<p>Link-state router apni routing table advertise nahi karta. Woh <b>apne links</b> describe karta hai: "main router 1.1.1.1 hoon, mera 2.2.2.2 tak cost 1 ka link hai aur ek stub network 1.1.1.1/32 hai". In descriptions ko <b>LSAs</b> (link-state advertisements) kehte hain aur yeh bina badle area ke har router tak flood hote hain. Har router inhe apne <b>LSDB</b> mein store karta hai aur khud ko root maan kar <b>SPF</b> algorithm chalata hai. Result loop-free hote hain, convergence fast hota hai, aur updates sirf kuch badalne par jaate hain, saath mein har 30 minute ek periodic refresh. Keemat hai zyada memory aur CPU, aur bahut bade networks mein achhe design (areas) ki zaroorat.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Distance vector aur link state ki tulna">
<rect x="10" y="10" width="300" height="200" rx="10" fill="#fed7aa"/>
<text x="160" y="34" text-anchor="middle" class="svg-ink" font-size="14">Distance vector</text>
<rect x="30" y="60" width="60" height="36" rx="6" fill="#e2e8f0"/><text x="60" y="83" text-anchor="middle" class="svg-ink" font-size="13">A</text>
<rect x="130" y="60" width="60" height="36" rx="6" fill="#e2e8f0"/><text x="160" y="83" text-anchor="middle" class="svg-ink" font-size="13">B</text>
<rect x="230" y="60" width="60" height="36" rx="6" fill="#e2e8f0"/><text x="260" y="83" text-anchor="middle" class="svg-ink" font-size="13">C</text>
<line x1="90" y1="78" x2="130" y2="78" stroke="#64748b" stroke-width="2"/><line x1="190" y1="78" x2="230" y2="78" stroke="#64748b" stroke-width="2"/>
<text x="160" y="130" text-anchor="middle" class="svg-muted" font-size="12">C ne B ko bataya: net X, 1 hop</text>
<text x="160" y="152" text-anchor="middle" class="svg-muted" font-size="12">B ne A ko bataya: net X, 2 hops</text>
<text x="160" y="184" text-anchor="middle" class="svg-ink" font-size="12">A ko sirf distance aur direction pata</text>
<rect x="330" y="10" width="300" height="200" rx="10" fill="#bbf7d0"/>
<text x="480" y="34" text-anchor="middle" class="svg-ink" font-size="14">Link state (OSPF)</text>
<rect x="350" y="60" width="60" height="36" rx="6" fill="#e2e8f0"/><text x="380" y="83" text-anchor="middle" class="svg-ink" font-size="13">A</text>
<rect x="450" y="60" width="60" height="36" rx="6" fill="#e2e8f0"/><text x="480" y="83" text-anchor="middle" class="svg-ink" font-size="13">B</text>
<rect x="550" y="60" width="60" height="36" rx="6" fill="#e2e8f0"/><text x="580" y="83" text-anchor="middle" class="svg-ink" font-size="13">C</text>
<line x1="410" y1="78" x2="450" y2="78" stroke="#64748b" stroke-width="2"/><line x1="510" y1="78" x2="550" y2="78" stroke="#64748b" stroke-width="2"/>
<text x="480" y="130" text-anchor="middle" class="svg-muted" font-size="12">Har router apne links flood karta hai</text>
<text x="480" y="152" text-anchor="middle" class="svg-muted" font-size="12">Sabke paas same LSDB</text>
<text x="480" y="184" text-anchor="middle" class="svg-ink" font-size="12">Har ek poore map par SPF chalata hai</text>
</svg><p class="cap">Distance vector nateeje aage bhejta hai; link state facts aage bhejta hai aur har router ko khud nateeja nikaalne deta hai.</p></div>

<h3>Router kaise chunta hai: prefix, phir AD, phir metric</h3>
<p>Router ek hi prefix kai sources se seekh sakta hai. Routing table (pichhle module se) teen rules ek fixed order mein lagati hai:</p>
<ol>
<li><b>Longest prefix match</b> decide karta hai ki packet kaunsa route use karega. Dono ke andar wale address ke liye /24, /16 ko hara deta hai.</li>
<li><b>Administrative distance (AD)</b> decide karta hai ki kaunsa source install hoga jab do sources <i>same</i> prefix aur length dete hain. Kam matlab zyada bharosemand: connected 0, static 1, EIGRP 90, OSPF 110, RIP 120.</li>
<li><b>Metric</b> <i>same</i> protocol se seekhe paths ke beech decide karta hai. OSPF ke liye sabse kam total cost jeetti hai; barabar costs par load share hota hai.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> R1 10.1.1.0/24 ko OSPF se metric 20 ke saath aur EIGRP se metric 3072 ke saath seekhta hai. Uske paas ek static route 10.1.0.0/16 bhi hai. Sirf EIGRP ka /24 install hota hai, kyunki AD 90, 110 ko hara deta hai (metrics 20 aur 3072 kabhi compare nahi hote). 10.1.1.5 ka packet /24 aur /16 dono se match karta hai, aur longer match hone se /24 jeetta hai. 10.1.2.5 ka packet sirf /16 static route se match karta hai.</p></div>

<p><code>show ip route</code> mein OSPF entry left se right aise padhi jaati hai:</p>
<pre class="out">R1# show ip route ospf
      10.0.0.0/8 is variably subnetted, 5 subnets, 2 masks
<span class="hl">O        10.0.34.0/30 [110/3] via 10.0.12.2, 00:02:11, GigabitEthernet0/0</span></pre>
<p><code>O</code> source hai (OSPF), <code>[110/3]</code> matlab AD 110 aur metric 3, <code>via 10.0.12.2</code> next hop hai, phir route ki age aur exit interface.</p>

<div class="warn"><p><b>Common galti.</b> Alag protocols ke metrics compare karna ("OSPF cost 20, EIGRP metric 3072 se kam hai, isliye OSPF jeetega"). Metrics sirf ek protocol ke andar compare hote hain. Protocols ke beech AD decide karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> OSPF ke backup ke roop mein bana <b>floating static route</b> ka AD <b>110 se zyada</b> hona chahiye, jaise <code>ip route 10.50.0.0 255.255.255.0 10.9.9.2 200</code>. 110 ya usse kam koi bhi value OSPF route ko replace karegi ya uske barabar hogi.</p></div>

<div class="scn"><h4>Backup jo primary ban gaya</h4><p>Ek branch mein 1 Gbps fibre par OSPF tha aur backup ke liye 20 Mbps broadband tunnel. Engineer ne <code>ip route 10.50.0.0 255.255.255.0 172.16.9.2 100</code> add kiya, yeh sochkar ki "100 bada number hai". Users ne shikayat ki ki file transfers reng rahe hain. <code>show ip route 10.50.0.0</code> mein OSPF ki jagah "Known via static, distance 100" dikha. AD 100, OSPF ke 110 se zyada bharosemand hai, isliye backup hamesha ke liye jeet gaya. AD 200 karne se OSPF wapas primary bana aur static chupchaap fibre failure ka wait karne laga.</p><p><b>Seekh:</b> AD sources ke beech tie-breaker hai. Default values yaad rakho.</p></div>

<div class="iv"><p class="q">"Distance vector aur link-state protocol mein kya farak hai?"</p><p>Strong answer: distance vector router apne routes (distance aur direction) neighbours ko advertise karta hai, jo unhe aage bhejte hain, isliye kisi router ko poori topology nahi dikhti aur convergence dheema ho sakta hai, loops ke risk ke saath. Link-state router apne links ke descriptions (LSAs) area ke har router tak flood karta hai; sab identical LSDB banate hain aur har ek Dijkstra ka SPF chala kar loop-free best paths nikaalta hai, fast aur event-driven convergence ke saath, badle mein zyada CPU aur memory. Examples do: RIP versus OSPF, aur EIGRP ko advanced distance vector ke roop mein mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGPs (RIP, EIGRP, OSPF, IS-IS) ek AS ke andar route karte hain; BGP woh EGP hai jo autonomous systems ke beech route karta hai.</li>
<li>Distance vector routes hop by hop share karta hai; link state link descriptions flood karta hai taaki har router apne paths khud nikaale.</li>
<li>OSPF link state hai, open standard, AD 110, metric = cost.</li>
<li>Route selection order: longest prefix match, phir sabse kam AD, phir sabse kam metric.</li>
<li>OSPF ko back up karne wale floating static ka AD 110 se upar hona chahiye.</li>
</ul></div>
`}};export{e as default};