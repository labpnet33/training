var e={id:`protocol-families`,h:{en:`Dynamic routing: distance-vector, link-state and path-vector`,hi:`Dynamic routing: distance-vector, link-state aur path-vector`},body:{en:`
<p>Static routes work until the network grows or a link fails at 2 a.m. <b>Dynamic routing protocols</b> let routers teach each other about networks, notice failures and recalculate paths without a human. Before learning any one protocol, learn the three families. Every exam question about "which protocol would you choose" is really a question about these families.</p>

<h3>What every routing protocol does</h3>
<ol>
<li><b>Discover neighbours:</b> find the other routers on directly connected links, usually with hello messages.</li>
<li><b>Exchange information:</b> share the networks each router knows, in a format specific to the protocol.</li>
<li><b>Choose best paths:</b> run an algorithm and install the winners in the routing table.</li>
<li><b>React to change:</b> when a link or router fails, spread the news and recalculate. The time until every router agrees again is called <b>convergence</b>. Faster convergence means shorter outages.</li>
</ol>

<h3>IGP versus EGP</h3>
<p>An <b>autonomous system (AS)</b> is a network under one administrative control, like one company or one ISP. <b>Interior gateway protocols (IGPs)</b> run inside an AS: OSPF, EIGRP, IS-IS and RIP. The <b>exterior gateway protocol (EGP)</b> runs between autonomous systems: today that is <b>BGP</b>, the protocol that holds the internet together.</p>

<h3>Family 1: distance-vector ("routing by rumour")</h3>
<p>Analogy: you ask a neighbour the way to the railway station. He says "about 3 km that way". You have never seen the map; you trust his distance and direction. That is distance-vector: each router knows only what its neighbours tell it, a <b>distance</b> (metric) and a <b>vector</b> (direction, the next hop).</p>
<ul>
<li>Classic example: <b>RIP</b>, which uses hop count (maximum 15; 16 = unreachable) and sends its whole table every 30 seconds. It is legacy and no longer on the Network+ N10-009 objectives by name, but it is the textbook example of the family.</li>
<li>Problems: slow convergence and routing loops such as <b>count to infinity</b>. Distance-vector protocols fight loops with split horizon (do not advertise a route back out the interface you learned it on), route poisoning and hold-down timers.</li>
<li><b>EIGRP</b> is called an <b>advanced distance-vector</b> (sometimes "hybrid") protocol. It still learns from neighbours, but sends updates only when something changes and keeps a pre-computed backup path, so it converges very fast.</li>
</ul>

<h3>Family 2: link-state ("everyone has the map")</h3>
<p>Analogy: instead of asking for directions, every router gets a copy of the same city map and uses a navigation app to compute the shortest route itself. Link-state routers flood small advertisements describing their own links (called <b>LSAs</b> in OSPF) to every router in the area. Each router builds an identical <b>link-state database (LSDB)</b>, then runs Dijkstra's <b>shortest path first (SPF)</b> algorithm with itself as the root.</p>
<ul>
<li>Examples: <b>OSPF</b> (open standard, the most common enterprise IGP) and <b>IS-IS</b> (common in service providers).</li>
<li>Strengths: fast convergence, no routing-by-rumour loops, a full view of the topology, hierarchical design with areas.</li>
<li>Costs: more memory and CPU for the database and SPF, more design work (areas).</li>
</ul>

<h3>Family 3: path-vector (BGP)</h3>
<p>Analogy: a parcel label that lists every courier company that has handled it. If a company sees its own name on the label, it knows the parcel is going in a circle and refuses it. BGP advertisements carry the <b>AS path</b>, the list of autonomous systems the route has passed through. A router rejects any route that already contains its own AS number, which prevents loops across the internet. BGP chooses paths using <b>attributes and policy</b>, not just speed, because between companies business rules matter more than bandwidth.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Three families of routing protocols">
<rect x="10" y="10" width="200" height="40" rx="8" fill="#fed7aa"/><text x="110" y="35" text-anchor="middle" class="svg-ink" font-size="14">Distance-vector</text>
<rect x="220" y="10" width="200" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">Link-state</text>
<rect x="430" y="10" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="530" y="35" text-anchor="middle" class="svg-ink" font-size="14">Path-vector</text>
<text x="110" y="80" text-anchor="middle" class="svg-muted" font-size="12">knows neighbours' view</text>
<text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">knows the whole map</text>
<text x="530" y="80" text-anchor="middle" class="svg-muted" font-size="12">knows the AS path</text>
<text x="110" y="110" text-anchor="middle" class="svg-ink" font-size="13">RIP, EIGRP (advanced)</text>
<text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">OSPF, IS-IS</text>
<text x="530" y="110" text-anchor="middle" class="svg-ink" font-size="13">BGP</text>
<text x="110" y="140" text-anchor="middle" class="svg-muted" font-size="12">metric: hops / composite</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">metric: cost (SPF)</text>
<text x="530" y="140" text-anchor="middle" class="svg-muted" font-size="12">attributes + policy</text>
<rect x="10" y="170" width="410" height="40" rx="8" fill="#bbf7d0"/><text x="215" y="195" text-anchor="middle" class="svg-ink" font-size="13">IGPs: inside one autonomous system</text>
<rect x="430" y="170" width="200" height="40" rx="8" fill="#fde68a"/><text x="530" y="195" text-anchor="middle" class="svg-ink" font-size="13">EGP: between ASes</text>
</svg><p class="cap">Distance-vector and link-state protocols run inside an organisation; path-vector BGP connects organisations.</p></div>

<div class="eg"><p><b>Worked example: the same failure, two families.</b> In the Lab 2 triangle, the R1-R2 link fails. With a slow distance-vector protocol like RIP, R1 might wait for the route to time out (180 seconds by default) before trying R3, unless R2 sends a triggered update. With OSPF, R1 notices the interface go down at once (or misses hellos for 40 seconds if the failure is not visible locally), floods a new LSA, every router reruns SPF, and the path via R3 is installed within seconds. In the lab you will watch the route change from via 10.0.12.2 to via 10.0.13.2.</p></div>

<h3>Choosing a family</h3>
<table class="cmp"><tr><th>Need</th><th>Typical choice</th></tr>
<tr><td>Small stub site, one exit</td><td>Static default route</td></tr>
<tr><td>Multi-vendor enterprise campus or WAN</td><td>OSPF (open standard, link-state)</td></tr>
<tr><td>Cisco-heavy network wanting simple config and fast failover</td><td>EIGRP</td></tr>
<tr><td>Connecting to ISPs, multihoming, cloud interconnects</td><td>BGP</td></tr>
</table>

<div class="warn"><p><b>Common mistake.</b> Calling BGP a "link-state" or "distance-vector" protocol. BGP is <b>path-vector</b>. Also, do not say link-state protocols send the whole routing table; they flood link-state advertisements and each router computes its own table.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which protocol is used between autonomous systems on the internet?" The answer is BGP, never OSPF or EIGRP. "Which protocol builds a full topology map and uses SPF?" The answer is OSPF (link-state).</p></div>

<div class="scn"><h4>The 3-minute outage every time a link flapped</h4><p>A manufacturing company still ran RIP between six plant routers. Every time a microwave link flapped, some plants lost access to the ERP system for up to three minutes while routes timed out and hold-down timers expired. Operators had learned to "wait it out". The network team migrated to OSPF over a weekend, one area, with the same addressing. The next link flap caused a sub-second blip that no user noticed.</p><p><b>Lesson:</b> the family of protocol decides convergence behaviour. Link-state protocols react to topology changes far faster than classic distance-vector.</p></div>

<div class="iv"><p class="q">"Compare distance-vector and link-state routing."</p><p>Strong answer: distance-vector routers know only what neighbours advertise, a metric and a next hop, and classic ones send periodic full updates, which makes them simple but slow and loop-prone (counter-measures: split horizon, poisoning, hold-down). Link-state routers flood descriptions of their links, build an identical database and run SPF, so they converge fast and loop-free at the cost of memory, CPU and area design. Name examples for each, then mention EIGRP as advanced distance-vector and BGP as path-vector.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routing protocols discover neighbours, exchange information, choose best paths and reconverge after failures.</li>
<li>IGPs (OSPF, EIGRP, IS-IS, RIP) run inside an AS; BGP runs between autonomous systems.</li>
<li>Distance-vector learns from neighbours; link-state gives every router the full map and runs SPF.</li>
<li>BGP is path-vector: it carries the AS path to prevent loops and chooses paths by policy.</li>
<li>Faster convergence means shorter outages; OSPF and EIGRP converge far faster than RIP.</li>
</ul></div>
`,hi:`
<p>Static routes tab tak kaam karte hain jab tak network badhta nahi ya raat 2 baje koi link fail nahi hota. <b>Dynamic routing protocols</b> routers ko ek doosre ko networks ke baare mein sikhaane, failures notice karne aur bina insaan ke paths dobara calculate karne dete hain. Kisi ek protocol ko seekhne se pehle teen families seekho. "Aap kaunsa protocol chunoge" wala har exam question asal mein inhi families ke baare mein hota hai.</p>

<h3>Har routing protocol kya karta hai</h3>
<ol>
<li><b>Neighbours dhoondhna:</b> directly connected links par doosre routers dhoondhna, aam taur par hello messages se.</li>
<li><b>Information exchange karna:</b> har router ko jo networks pata hain unhe share karna, protocol ke apne format mein.</li>
<li><b>Best paths chunna:</b> ek algorithm chalana aur winners ko routing table mein install karna.</li>
<li><b>Change par react karna:</b> jab koi link ya router fail ho, khabar failaana aur dobara calculate karna. Jab tak har router phir se agree na kare us time ko <b>convergence</b> kehte hain. Tez convergence matlab chhote outages.</li>
</ol>

<h3>IGP vs EGP</h3>
<p><b>Autonomous system (AS)</b> ek administrative control ke neeche ka network hai, jaise ek company ya ek ISP. <b>Interior gateway protocols (IGPs)</b> ek AS ke andar chalte hain: OSPF, EIGRP, IS-IS aur RIP. <b>Exterior gateway protocol (EGP)</b> autonomous systems ke beech chalta hai: aaj woh <b>BGP</b> hai, woh protocol jo internet ko jode rakhta hai.</p>

<h3>Family 1: distance-vector ("afwaah se routing")</h3>
<p>Analogy: aap padosi se railway station ka raasta poochte ho. Woh kehta hai "us taraf lagbhag 3 km". Aapne map kabhi nahi dekha; aap uski doori aur disha par bharosa karte ho. Yahi distance-vector hai: har router ko sirf woh pata hai jo neighbours batate hain, ek <b>distance</b> (metric) aur ek <b>vector</b> (disha, yaani next hop).</p>
<ul>
<li>Classic example: <b>RIP</b>, jo hop count use karta hai (maximum 15; 16 = unreachable) aur har 30 second mein apni poori table bhejta hai. Yeh legacy hai aur Network+ N10-009 objectives mein naam se nahi hai, lekin family ka textbook example hai.</li>
<li>Problems: slow convergence aur <b>count to infinity</b> jaise routing loops. Distance-vector protocols loops se split horizon (jis interface se route seekha use wahi wapas advertise mat karo), route poisoning aur hold-down timers se ladte hain.</li>
<li><b>EIGRP</b> ko <b>advanced distance-vector</b> (kabhi kabhi "hybrid") protocol kehte hain. Yeh abhi bhi neighbours se seekhta hai, lekin updates sirf kuch badalne par bhejta hai aur pehle se compute kiya backup path rakhta hai, isliye bahut tez converge karta hai.</li>
</ul>

<h3>Family 2: link-state ("sabke paas map hai")</h3>
<p>Analogy: raasta poochne ke bajaye har router ko same city map ki copy milti hai aur woh navigation app se sabse chhota raasta khud nikaalta hai. Link-state routers apne links ka description dene wale chhote advertisements (OSPF mein <b>LSAs</b>) area ke har router tak flood karte hain. Har router ek identical <b>link-state database (LSDB)</b> banata hai, phir khud ko root maan kar Dijkstra ka <b>shortest path first (SPF)</b> algorithm chalata hai.</p>
<ul>
<li>Examples: <b>OSPF</b> (open standard, sabse common enterprise IGP) aur <b>IS-IS</b> (service providers mein common).</li>
<li>Strengths: tez convergence, afwaah wale loops nahi, topology ka poora view, areas ke saath hierarchical design.</li>
<li>Costs: database aur SPF ke liye zyada memory aur CPU, zyada design kaam (areas).</li>
</ul>

<h3>Family 3: path-vector (BGP)</h3>
<p>Analogy: parcel ka label jis par har woh courier company likhi hai jisne use handle kiya. Agar kisi company ko label par apna naam dikhe, to use pata chal jaata hai ki parcel gol gol ghoom raha hai aur woh use mana kar deti hai. BGP advertisements <b>AS path</b> carry karte hain, un autonomous systems ki list jinse route guzra hai. Router aisa har route reject karta hai jismein pehle se uska apna AS number ho, jisse internet par loops rukte hain. BGP paths <b>attributes aur policy</b> se chunta hai, sirf speed se nahi, kyunki companies ke beech business rules bandwidth se zyada matter karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Routing protocols ki teen families">
<rect x="10" y="10" width="200" height="40" rx="8" fill="#fed7aa"/><text x="110" y="35" text-anchor="middle" class="svg-ink" font-size="14">Distance-vector</text>
<rect x="220" y="10" width="200" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">Link-state</text>
<rect x="430" y="10" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="530" y="35" text-anchor="middle" class="svg-ink" font-size="14">Path-vector</text>
<text x="110" y="80" text-anchor="middle" class="svg-muted" font-size="12">neighbours ka view</text>
<text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">poora map</text>
<text x="530" y="80" text-anchor="middle" class="svg-muted" font-size="12">AS path</text>
<text x="110" y="110" text-anchor="middle" class="svg-ink" font-size="13">RIP, EIGRP (advanced)</text>
<text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">OSPF, IS-IS</text>
<text x="530" y="110" text-anchor="middle" class="svg-ink" font-size="13">BGP</text>
<text x="110" y="140" text-anchor="middle" class="svg-muted" font-size="12">metric: hops / composite</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">metric: cost (SPF)</text>
<text x="530" y="140" text-anchor="middle" class="svg-muted" font-size="12">attributes + policy</text>
<rect x="10" y="170" width="410" height="40" rx="8" fill="#bbf7d0"/><text x="215" y="195" text-anchor="middle" class="svg-ink" font-size="13">IGPs: ek autonomous system ke andar</text>
<rect x="430" y="170" width="200" height="40" rx="8" fill="#fde68a"/><text x="530" y="195" text-anchor="middle" class="svg-ink" font-size="13">EGP: ASes ke beech</text>
</svg><p class="cap">Distance-vector aur link-state protocols organisation ke andar chalte hain; path-vector BGP organisations ko jodta hai.</p></div>

<div class="eg"><p><b>Worked example: same failure, do families.</b> Lab 2 ke triangle mein R1-R2 link fail hota hai. RIP jaise slow distance-vector protocol ke saath R1 shayad R3 try karne se pehle route ke time out hone ka wait kare (default 180 second), jab tak R2 triggered update na bheje. OSPF ke saath R1 interface down hote hi turant notice karta hai (ya agar failure locally visible nahi to 40 second tak hellos miss karta hai), naya LSA flood karta hai, har router SPF dobara chalata hai, aur R3 wala path seconds mein install ho jaata hai. Lab mein aap route ko via 10.0.12.2 se via 10.0.13.2 badalte dekhoge.</p></div>

<h3>Family chunna</h3>
<table class="cmp"><tr><th>Zaroorat</th><th>Typical choice</th></tr>
<tr><td>Chhoti stub site, ek exit</td><td>Static default route</td></tr>
<tr><td>Multi-vendor enterprise campus ya WAN</td><td>OSPF (open standard, link-state)</td></tr>
<tr><td>Cisco-heavy network jise simple config aur tez failover chahiye</td><td>EIGRP</td></tr>
<tr><td>ISPs se judna, multihoming, cloud interconnects</td><td>BGP</td></tr>
</table>

<div class="warn"><p><b>Common galti.</b> BGP ko "link-state" ya "distance-vector" protocol kehna. BGP <b>path-vector</b> hai. Aur yeh mat kaho ki link-state protocols poori routing table bhejte hain; woh link-state advertisements flood karte hain aur har router apni table khud compute karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Internet par autonomous systems ke beech kaunsa protocol use hota hai?" Jawab BGP hai, kabhi OSPF ya EIGRP nahi. "Kaunsa protocol poora topology map banata hai aur SPF use karta hai?" Jawab OSPF (link-state) hai.</p></div>

<div class="scn"><h4>Har link flap par 3 minute ka outage</h4><p>Ek manufacturing company chhe plant routers ke beech abhi bhi RIP chala rahi thi. Jab bhi microwave link flap hota, kuch plants teen minute tak ERP system tak access kho dete jab tak routes time out hote aur hold-down timers expire hote. Operators ne "ruk jao" seekh liya tha. Network team ne ek weekend mein same addressing ke saath ek area wale OSPF par migrate kiya. Agla link flap ek second se kam ka blip laaya jo kisi user ne notice nahi kiya.</p><p><b>Seekh:</b> protocol ki family convergence behaviour decide karti hai. Link-state protocols topology changes par classic distance-vector se kahin tez react karte hain.</p></div>

<div class="iv"><p class="q">"Distance-vector aur link-state routing compare karo."</p><p>Strong answer: distance-vector routers ko sirf woh pata hai jo neighbours advertise karte hain, ek metric aur ek next hop, aur classic wale periodic full updates bhejte hain, jisse woh simple lekin slow aur loop-prone hote hain (counter-measures: split horizon, poisoning, hold-down). Link-state routers apne links ke descriptions flood karte hain, identical database banate hain aur SPF chalate hain, isliye memory, CPU aur area design ki keemat par tez aur loop-free converge karte hain. Har ek ke examples do, phir EIGRP ko advanced distance-vector aur BGP ko path-vector bolo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routing protocols neighbours dhoondhte hain, information exchange karte hain, best paths chunte hain aur failures ke baad reconverge karte hain.</li>
<li>IGPs (OSPF, EIGRP, IS-IS, RIP) AS ke andar chalte hain; BGP autonomous systems ke beech chalta hai.</li>
<li>Distance-vector neighbours se seekhta hai; link-state har router ko poora map deta hai aur SPF chalata hai.</li>
<li>BGP path-vector hai: loops rokne ke liye AS path carry karta hai aur policy se paths chunta hai.</li>
<li>Tez convergence matlab chhote outages; OSPF aur EIGRP RIP se kahin tez converge karte hain.</li>
</ul></div>
`}};export{e as default};