var e={id:`topologies`,h:{en:`Topologies and network architectures`,hi:`Topologies aur network architectures`},body:{en:`
<p>Look at a city map from above. Some neighbourhoods have all lanes leading to one central market (a star). Some old towns have one long main road with every shop along it (a bus). A ring road circles the city. And between big cities, highways link almost every city to every other (a mesh). A <b>topology</b> is exactly this: the shape of how devices are connected. Choosing the shape decides how much the network costs, how fast it is and what happens when one piece breaks.</p>

<h3>Physical vs logical topology</h3>
<p>The <b>physical topology</b> is how the cables actually run. The <b>logical topology</b> is how data flows. They can differ: an old hub looked like a star physically (every cable to one box) but behaved like a bus logically (every signal went to every device). Diagrams you draw at work usually show one or the other, so always ask which.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Bus, ring, star and mesh topologies">
<text x="75" y="20" text-anchor="middle" class="svg-accent" font-size="13">Bus</text>
<line x1="15" y1="100" x2="135" y2="100" stroke="#64748b" stroke-width="3"/>
<line x1="35" y1="100" x2="35" y2="70" stroke="#64748b"/><line x1="75" y1="100" x2="75" y2="70" stroke="#64748b"/><line x1="115" y1="100" x2="115" y2="70" stroke="#64748b"/>
<line x1="55" y1="100" x2="55" y2="130" stroke="#64748b"/><line x1="95" y1="100" x2="95" y2="130" stroke="#64748b"/>
<circle cx="35" cy="64" r="8" fill="#bbf7d0"/><circle cx="75" cy="64" r="8" fill="#bbf7d0"/><circle cx="115" cy="64" r="8" fill="#bbf7d0"/><circle cx="55" cy="136" r="8" fill="#bbf7d0"/><circle cx="95" cy="136" r="8" fill="#bbf7d0"/>
<text x="235" y="20" text-anchor="middle" class="svg-accent" font-size="13">Ring</text>
<circle cx="235" cy="100" r="50" fill="none" stroke="#64748b" stroke-width="2"/>
<circle cx="235" cy="50" r="9" fill="#bbf7d0"/><circle cx="285" cy="100" r="9" fill="#bbf7d0"/><circle cx="235" cy="150" r="9" fill="#bbf7d0"/><circle cx="185" cy="100" r="9" fill="#bbf7d0"/>
<text x="400" y="20" text-anchor="middle" class="svg-accent" font-size="13">Star</text>
<rect x="385" y="88" width="30" height="24" rx="4" fill="#bae6fd"/>
<line x1="400" y1="88" x2="400" y2="50" stroke="#64748b"/><line x1="415" y1="100" x2="455" y2="100" stroke="#64748b"/><line x1="400" y1="112" x2="400" y2="150" stroke="#64748b"/><line x1="385" y1="100" x2="345" y2="100" stroke="#64748b"/><line x1="412" y1="88" x2="440" y2="60" stroke="#64748b"/>
<circle cx="400" cy="44" r="8" fill="#bbf7d0"/><circle cx="461" cy="100" r="8" fill="#bbf7d0"/><circle cx="400" cy="156" r="8" fill="#bbf7d0"/><circle cx="339" cy="100" r="8" fill="#bbf7d0"/><circle cx="445" cy="55" r="8" fill="#bbf7d0"/>
<text x="560" y="20" text-anchor="middle" class="svg-accent" font-size="13">Full mesh</text>
<line x1="520" y1="60" x2="600" y2="60" stroke="#64748b"/><line x1="520" y1="60" x2="520" y2="140" stroke="#64748b"/><line x1="520" y1="60" x2="600" y2="140" stroke="#64748b"/><line x1="600" y1="60" x2="600" y2="140" stroke="#64748b"/><line x1="600" y1="60" x2="520" y2="140" stroke="#64748b"/><line x1="520" y1="140" x2="600" y2="140" stroke="#64748b"/>
<circle cx="520" cy="60" r="10" fill="#ddd6fe"/><circle cx="600" cy="60" r="10" fill="#ddd6fe"/><circle cx="520" cy="140" r="10" fill="#ddd6fe"/><circle cx="600" cy="140" r="10" fill="#ddd6fe"/>
<text x="75" y="190" text-anchor="middle" class="svg-muted" font-size="12">one shared cable</text><text x="235" y="190" text-anchor="middle" class="svg-muted" font-size="12">each to two neighbours</text><text x="400" y="190" text-anchor="middle" class="svg-muted" font-size="12">all to a central switch</text><text x="560" y="190" text-anchor="middle" class="svg-muted" font-size="12">every node to every node</text>
</svg><p class="cap">The four classic shapes. Modern LANs are stars; WAN cores are often partial meshes.</p></div>

<h3>The classic topologies</h3>
<dl class="terms">
<dt>Bus (history)</dt><dd>All devices tapped onto one shared coaxial cable with a <b>terminator</b> at each end. Only one device could talk at a time, collisions were common, and one break in the cable stopped everyone. Used by early Ethernet (10BASE5, 10BASE2). You will only meet it in exams and old buildings.</dd>
<dt>Ring (history)</dt><dd>Each device connects to two neighbours, forming a loop; data passes around the ring. Token Ring and FDDI used a <b>token</b> that gave permission to transmit. A single break could stop the ring, so FDDI used a <b>dual ring</b>. Ring ideas survive in some metro and ISP fibre rings.</dd>
<dt>Star</dt><dd>Every device has its own cable to a central switch. One broken cable affects only one device, and adding devices is easy. This is how almost every LAN is built today. The weak point is the central switch, so important sites use two.</dd>
<dt>Extended star / hierarchical</dt><dd>Stars connected to bigger stars: floor switches connect to building switches, which connect to a core. This is simply a star of stars.</dd>
<dt>Mesh</dt><dd>In a <b>full mesh</b> every node connects to every other node: maximum redundancy, maximum cost. The number of links is n(n-1)/2. A <b>partial mesh</b> connects only the important nodes to each other.</dd>
<dt>Hub-and-spoke</dt><dd>Branches (spokes) connect to a central site (hub), typical for company WANs. Cheap and simple, but branch-to-branch traffic goes through the hub.</dd>
<dt>Point-to-point</dt><dd>A single link between exactly two devices, such as two routers joined by a WAN circuit.</dd>
<dt>Hybrid</dt><dd>A mix of the above, which is what every real network is.</dd>
</dl>

<div class="eg"><p><b>Worked example: the cost of a full mesh.</b> A company has 5 offices. A full mesh needs 5 x 4 / 2 = <b>10</b> links. With 10 offices: 10 x 9 / 2 = <b>45</b> links. With 20 offices: 20 x 19 / 2 = <b>190</b> links. That is why large WANs use hub-and-spoke or partial mesh, and keep full mesh for a few core sites.</p></div>

<h3>Architectures: small office, campus, data center</h3>
<table class="cmp"><tr><th>Environment</th><th>Typical design</th><th>Key idea</th></tr>
<tr><td><b>SOHO</b> (small office/home office)</td><td>One all-in-one router with Wi-Fi, maybe one small switch</td><td>Simple and cheap; one box is a single point of failure</td></tr>
<tr><td><b>Campus</b> (large office, college)</td><td><b>Three-tier</b>: access, distribution, core</td><td>Access switches connect users; distribution aggregates a building and applies policy; core is a fast backbone between buildings</td></tr>
<tr><td><b>Collapsed core</b> (medium site)</td><td>Two tiers: access plus a combined distribution/core</td><td>Saves money where a separate core is not needed</td></tr>
<tr><td><b>Data center</b></td><td><b>Spine-leaf</b>: every leaf switch connects to every spine switch</td><td>Any server reaches any other in the same number of hops; built for east-west traffic</td></tr>
</table>
<p>Two direction words appear everywhere: <b>north-south</b> traffic enters or leaves a site (users to the internet), while <b>east-west</b> traffic stays inside (server to server). Modern applications create far more east-west traffic, which is why data centers moved to spine-leaf.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Three-tier campus design">
<rect x="220" y="15" width="200" height="34" rx="6" fill="#ddd6fe"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">Core (fast backbone)</text>
<rect x="100" y="80" width="170" height="34" rx="6" fill="#bae6fd"/><text x="185" y="102" text-anchor="middle" class="svg-ink" font-size="13">Distribution A</text>
<rect x="370" y="80" width="170" height="34" rx="6" fill="#bae6fd"/><text x="455" y="102" text-anchor="middle" class="svg-ink" font-size="13">Distribution B</text>
<line x1="280" y1="49" x2="185" y2="80" stroke="#64748b" stroke-width="2"/><line x1="360" y1="49" x2="455" y2="80" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="145" width="120" height="30" rx="6" fill="#bbf7d0"/><text x="80" y="165" text-anchor="middle" class="svg-ink" font-size="12">Access 1 (floor 1)</text>
<rect x="190" y="145" width="120" height="30" rx="6" fill="#bbf7d0"/><text x="250" y="165" text-anchor="middle" class="svg-ink" font-size="12">Access 2 (floor 2)</text>
<rect x="340" y="145" width="120" height="30" rx="6" fill="#bbf7d0"/><text x="400" y="165" text-anchor="middle" class="svg-ink" font-size="12">Access 3</text>
<rect x="500" y="145" width="120" height="30" rx="6" fill="#bbf7d0"/><text x="560" y="165" text-anchor="middle" class="svg-ink" font-size="12">Access 4</text>
<line x1="150" y1="114" x2="80" y2="145" stroke="#64748b"/><line x1="220" y1="114" x2="250" y2="145" stroke="#64748b"/><line x1="420" y1="114" x2="400" y2="145" stroke="#64748b"/><line x1="490" y1="114" x2="560" y2="145" stroke="#64748b"/>
</svg><p class="cap">Three-tier campus: users plug into access, distribution aggregates, core joins buildings. Real designs double every uplink.</p></div>

<h3>Wired or wireless?</h3>
<p>Wired links are faster, more stable, lower in latency and harder to eavesdrop on. Wireless gives mobility and saves cabling, but it is shared, affected by walls and interference, and needs strong security. Most sites use both: wired for desks, servers, printers and APs; wireless for laptops and phones. Wi-Fi normally runs in <b>infrastructure mode</b> (clients join an AP); <b>ad hoc</b> mode (devices talk directly) is rare in business.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Believing a star is fully redundant. In a star, the central switch and the single uplink are single points of failure. Real designs add a second switch and a second uplink, which turns part of the network into a mesh.</p></div>

<div class="exam"><p><b>Exam trap.</b> Full mesh links = n(n-1)/2. A bus needs terminators and one break stops everything. Three-tier = access, distribution, core; collapsed core merges distribution and core; spine-leaf = every leaf to every spine, never leaf to leaf.</p></div>

<div class="scn"><h4>Every branch went down when head office did</h4><p>A retail chain connected 40 stores to head office in a hub-and-spoke WAN, and store-to-store video calls also passed through head office. When head office lost power for two hours, every store lost billing, stock checks and calls, even though the stores' own internet links were fine. The redesign gave each store direct internet access for cloud apps, added a second data center as a backup hub, and kept a small partial mesh between regional stores.</p><p><b>Lesson:</b> topology decides what fails together. Know your single points of failure before they find you.</p></div>

<div class="iv"><p class="q">"Which topology do modern LANs use, and what are the trade-offs of a full mesh?"</p><p>Strong answer: modern LANs are physically a star (or extended star): each device has its own cable to an access switch, so one cable fault affects one device and growth is easy. A full mesh gives the most redundancy and shortest paths, but the number of links grows as n(n-1)/2, so cost and complexity explode; it is used between a few critical core nodes, while larger WANs use partial mesh or hub-and-spoke. Mention three-tier and spine-leaf as the campus and data center designs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Topology = the shape of connections; physical (cables) and logical (data flow) may differ.</li>
<li>Bus and ring are history; star is today's LAN; mesh gives redundancy at n(n-1)/2 links.</li>
<li>WANs often use hub-and-spoke, point-to-point or partial mesh.</li>
<li>Campus: three-tier (access, distribution, core) or collapsed core. Data center: spine-leaf for east-west traffic.</li>
<li>Wired = speed and stability; wireless = mobility; real sites use both.</li>
</ul></div>
`,hi:`
<p>Upar se ek shehar ka map dekho. Kuch mohallon mein saari galiyaan ek central market tak jaati hain (star). Kuch purane towns mein ek lambi main road hai jiske kinare har dukaan hai (bus). Ek ring road shehar ke chaaron taraf ghoomti hai. Aur bade shehron ke beech highways lagbhag har shehar ko har dusre shehar se jodte hain (mesh). <b>Topology</b> bilkul yahi hai: devices kaise jude hain uska shape. Shape chunna tay karta hai ki network kitna mehenga hai, kitna fast hai aur ek hissa toote to kya hota hai.</p>

<h3>Physical vs logical topology</h3>
<p><b>Physical topology</b> yeh hai ki cables asal mein kaise chalti hain. <b>Logical topology</b> yeh hai ki data kaise behta hai. Dono alag ho sakte hain: purana hub physically star jaisa dikhta tha (har cable ek box tak) lekin logically bus jaisa behave karta tha (har signal har device tak jaata tha). Kaam par aap jo diagrams banate ho woh aam taur par ek ya dusra dikhate hain, isliye hamesha poocho kaunsa.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Bus, ring, star aur mesh topologies">
<text x="75" y="20" text-anchor="middle" class="svg-accent" font-size="13">Bus</text>
<line x1="15" y1="100" x2="135" y2="100" stroke="#64748b" stroke-width="3"/>
<line x1="35" y1="100" x2="35" y2="70" stroke="#64748b"/><line x1="75" y1="100" x2="75" y2="70" stroke="#64748b"/><line x1="115" y1="100" x2="115" y2="70" stroke="#64748b"/>
<line x1="55" y1="100" x2="55" y2="130" stroke="#64748b"/><line x1="95" y1="100" x2="95" y2="130" stroke="#64748b"/>
<circle cx="35" cy="64" r="8" fill="#bbf7d0"/><circle cx="75" cy="64" r="8" fill="#bbf7d0"/><circle cx="115" cy="64" r="8" fill="#bbf7d0"/><circle cx="55" cy="136" r="8" fill="#bbf7d0"/><circle cx="95" cy="136" r="8" fill="#bbf7d0"/>
<text x="235" y="20" text-anchor="middle" class="svg-accent" font-size="13">Ring</text>
<circle cx="235" cy="100" r="50" fill="none" stroke="#64748b" stroke-width="2"/>
<circle cx="235" cy="50" r="9" fill="#bbf7d0"/><circle cx="285" cy="100" r="9" fill="#bbf7d0"/><circle cx="235" cy="150" r="9" fill="#bbf7d0"/><circle cx="185" cy="100" r="9" fill="#bbf7d0"/>
<text x="400" y="20" text-anchor="middle" class="svg-accent" font-size="13">Star</text>
<rect x="385" y="88" width="30" height="24" rx="4" fill="#bae6fd"/>
<line x1="400" y1="88" x2="400" y2="50" stroke="#64748b"/><line x1="415" y1="100" x2="455" y2="100" stroke="#64748b"/><line x1="400" y1="112" x2="400" y2="150" stroke="#64748b"/><line x1="385" y1="100" x2="345" y2="100" stroke="#64748b"/><line x1="412" y1="88" x2="440" y2="60" stroke="#64748b"/>
<circle cx="400" cy="44" r="8" fill="#bbf7d0"/><circle cx="461" cy="100" r="8" fill="#bbf7d0"/><circle cx="400" cy="156" r="8" fill="#bbf7d0"/><circle cx="339" cy="100" r="8" fill="#bbf7d0"/><circle cx="445" cy="55" r="8" fill="#bbf7d0"/>
<text x="560" y="20" text-anchor="middle" class="svg-accent" font-size="13">Full mesh</text>
<line x1="520" y1="60" x2="600" y2="60" stroke="#64748b"/><line x1="520" y1="60" x2="520" y2="140" stroke="#64748b"/><line x1="520" y1="60" x2="600" y2="140" stroke="#64748b"/><line x1="600" y1="60" x2="600" y2="140" stroke="#64748b"/><line x1="600" y1="60" x2="520" y2="140" stroke="#64748b"/><line x1="520" y1="140" x2="600" y2="140" stroke="#64748b"/>
<circle cx="520" cy="60" r="10" fill="#ddd6fe"/><circle cx="600" cy="60" r="10" fill="#ddd6fe"/><circle cx="520" cy="140" r="10" fill="#ddd6fe"/><circle cx="600" cy="140" r="10" fill="#ddd6fe"/>
<text x="75" y="190" text-anchor="middle" class="svg-muted" font-size="12">ek shared cable</text><text x="235" y="190" text-anchor="middle" class="svg-muted" font-size="12">har ek do padosiyon se</text><text x="400" y="190" text-anchor="middle" class="svg-muted" font-size="12">sab central switch se</text><text x="560" y="190" text-anchor="middle" class="svg-muted" font-size="12">har node har node se</text>
</svg><p class="cap">Chaar classic shapes. Modern LANs star hain; WAN cores aksar partial mesh hote hain.</p></div>

<h3>Classic topologies</h3>
<dl class="terms">
<dt>Bus (itihaas)</dt><dd>Saare devices ek shared coaxial cable par tapped, har end par ek <b>terminator</b>. Ek waqt mein sirf ek device bol sakta tha, collisions aam the, aur cable mein ek toot sabko rok deti thi. Shuruaati Ethernet (10BASE5, 10BASE2) ne ise use kiya. Yeh aapko sirf exams aur purani buildings mein milega.</dd>
<dt>Ring (itihaas)</dt><dd>Har device do padosiyon se judta hai, ek loop banata hai; data ring mein ghoomta hai. Token Ring aur FDDI ek <b>token</b> use karte the jo transmit karne ki permission deta tha. Ek toot ring rok sakti thi, isliye FDDI <b>dual ring</b> use karta tha. Ring ke ideas kuch metro aur ISP fibre rings mein zinda hain.</dd>
<dt>Star</dt><dd>Har device ki central switch tak apni cable hoti hai. Ek tooti cable sirf ek device ko affect karti hai, aur devices jodna aasaan hai. Aaj lagbhag har LAN aise hi banta hai. Kamzor point central switch hai, isliye important sites do lagati hain.</dd>
<dt>Extended star / hierarchical</dt><dd>Stars bade stars se jude: floor switches building switches se judte hain, jo core se judte hain. Yeh bas stars ka star hai.</dd>
<dt>Mesh</dt><dd><b>Full mesh</b> mein har node har dusre node se judta hai: maximum redundancy, maximum cost. Links ki sankhya n(n-1)/2 hoti hai. <b>Partial mesh</b> sirf important nodes ko aapas mein jodta hai.</dd>
<dt>Hub-and-spoke</dt><dd>Branches (spokes) ek central site (hub) se judti hain, company WANs mein typical. Sasta aur simple, lekin branch se branch traffic hub se hokar jaata hai.</dd>
<dt>Point-to-point</dt><dd>Exactly do devices ke beech ek single link, jaise WAN circuit se jude do routers.</dd>
<dt>Hybrid</dt><dd>Upar walon ka mix, jo har real network hota hai.</dd>
</dl>

<div class="eg"><p><b>Worked example: full mesh ki keemat.</b> Ek company ke 5 offices hain. Full mesh ko 5 x 4 / 2 = <b>10</b> links chahiye. 10 offices ke saath: 10 x 9 / 2 = <b>45</b> links. 20 offices ke saath: 20 x 19 / 2 = <b>190</b> links. Isiliye bade WANs hub-and-spoke ya partial mesh use karte hain, aur full mesh sirf kuch core sites ke liye rakhte hain.</p></div>

<h3>Architectures: chhota office, campus, data center</h3>
<table class="cmp"><tr><th>Environment</th><th>Typical design</th><th>Key idea</th></tr>
<tr><td><b>SOHO</b> (small office/home office)</td><td>Wi-Fi wala ek all-in-one router, shayad ek chhota switch</td><td>Simple aur sasta; ek box single point of failure hai</td></tr>
<tr><td><b>Campus</b> (bada office, college)</td><td><b>Three-tier</b>: access, distribution, core</td><td>Access switches users ko jodte hain; distribution ek building ko aggregate karta hai aur policy lagata hai; core buildings ke beech fast backbone hai</td></tr>
<tr><td><b>Collapsed core</b> (medium site)</td><td>Do tiers: access plus combined distribution/core</td><td>Jahan alag core ki zaroorat nahi, wahan paisa bachata hai</td></tr>
<tr><td><b>Data center</b></td><td><b>Spine-leaf</b>: har leaf switch har spine switch se juda</td><td>Koi bhi server kisi bhi server tak same number of hops mein; east-west traffic ke liye bana</td></tr>
</table>
<p>Do direction words har jagah aate hain: <b>north-south</b> traffic site mein aata ya bahar jaata hai (users se internet), jabki <b>east-west</b> traffic andar rehta hai (server se server). Modern applications kahin zyada east-west traffic banati hain, isliye data centers spine-leaf par shift hue.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Three-tier campus design">
<rect x="220" y="15" width="200" height="34" rx="6" fill="#ddd6fe"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">Core (fast backbone)</text>
<rect x="100" y="80" width="170" height="34" rx="6" fill="#bae6fd"/><text x="185" y="102" text-anchor="middle" class="svg-ink" font-size="13">Distribution A</text>
<rect x="370" y="80" width="170" height="34" rx="6" fill="#bae6fd"/><text x="455" y="102" text-anchor="middle" class="svg-ink" font-size="13">Distribution B</text>
<line x1="280" y1="49" x2="185" y2="80" stroke="#64748b" stroke-width="2"/><line x1="360" y1="49" x2="455" y2="80" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="145" width="120" height="30" rx="6" fill="#bbf7d0"/><text x="80" y="165" text-anchor="middle" class="svg-ink" font-size="12">Access 1 (floor 1)</text>
<rect x="190" y="145" width="120" height="30" rx="6" fill="#bbf7d0"/><text x="250" y="165" text-anchor="middle" class="svg-ink" font-size="12">Access 2 (floor 2)</text>
<rect x="340" y="145" width="120" height="30" rx="6" fill="#bbf7d0"/><text x="400" y="165" text-anchor="middle" class="svg-ink" font-size="12">Access 3</text>
<rect x="500" y="145" width="120" height="30" rx="6" fill="#bbf7d0"/><text x="560" y="165" text-anchor="middle" class="svg-ink" font-size="12">Access 4</text>
<line x1="150" y1="114" x2="80" y2="145" stroke="#64748b"/><line x1="220" y1="114" x2="250" y2="145" stroke="#64748b"/><line x1="420" y1="114" x2="400" y2="145" stroke="#64748b"/><line x1="490" y1="114" x2="560" y2="145" stroke="#64748b"/>
</svg><p class="cap">Three-tier campus: users access mein plug karte hain, distribution aggregate karta hai, core buildings ko jodta hai. Real designs har uplink double karte hain.</p></div>

<h3>Wired ya wireless?</h3>
<p>Wired links zyada fast, zyada stable, kam latency wale aur chupke se sunne mein mushkil hote hain. Wireless mobility deta hai aur cabling bachata hai, lekin yeh shared hai, deewaron aur interference se affect hota hai, aur strong security chahiye. Zyada tar sites dono use karti hain: desks, servers, printers aur APs ke liye wired; laptops aur phones ke liye wireless. Wi-Fi normally <b>infrastructure mode</b> mein chalta hai (clients AP join karte hain); <b>ad hoc</b> mode (devices seedhe baat karte hain) business mein rare hai.</p>

<div class="warn"><p><b>Beginners ki common galti.</b> Maanna ki star poori tarah redundant hai. Star mein central switch aur single uplink single points of failure hain. Real designs doosra switch aur doosra uplink jodte hain, jisse network ka ek hissa mesh ban jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Full mesh links = n(n-1)/2. Bus ko terminators chahiye aur ek toot sab rok deti hai. Three-tier = access, distribution, core; collapsed core distribution aur core ko milata hai; spine-leaf = har leaf har spine se, kabhi leaf se leaf nahi.</p></div>

<div class="scn"><h4>Head office gira to har branch giri</h4><p>Ek retail chain ne 40 stores ko hub-and-spoke WAN mein head office se joda tha, aur store-se-store video calls bhi head office se hokar jaati thi. Jab head office ki bijli do ghante ke liye gayi, har store ki billing, stock checks aur calls band ho gayi, jabki stores ke apne internet links theek the. Redesign mein har store ko cloud apps ke liye direct internet access diya gaya, backup hub ke roop mein doosra data center joda gaya, aur regional stores ke beech ek chhota partial mesh rakha gaya.</p><p><b>Seekh:</b> topology tay karti hai ki kya ek saath fail hota hai. Apne single points of failure ko pehchaano isse pehle ki woh aapko dhoondh lein.</p></div>

<div class="iv"><p class="q">"Modern LANs kaunsi topology use karte hain, aur full mesh ke trade-offs kya hain?"</p><p>Strong answer: modern LANs physically star (ya extended star) hote hain: har device ki access switch tak apni cable hoti hai, isliye ek cable fault ek device ko affect karta hai aur badhna aasaan hai. Full mesh sabse zyada redundancy aur sabse chhote paths deta hai, lekin links ki sankhya n(n-1)/2 ki tarah badhti hai, isliye cost aur complexity phat jaati hai; yeh kuch critical core nodes ke beech use hota hai, jabki bade WANs partial mesh ya hub-and-spoke use karte hain. Campus aur data center designs ke roop mein three-tier aur spine-leaf mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Topology = connections ka shape; physical (cables) aur logical (data flow) alag ho sakte hain.</li>
<li>Bus aur ring itihaas hain; star aaj ka LAN hai; mesh n(n-1)/2 links par redundancy deta hai.</li>
<li>WANs aksar hub-and-spoke, point-to-point ya partial mesh use karte hain.</li>
<li>Campus: three-tier (access, distribution, core) ya collapsed core. Data center: east-west traffic ke liye spine-leaf.</li>
<li>Wired = speed aur stability; wireless = mobility; real sites dono use karti hain.</li>
</ul></div>
`}};export{e as default};