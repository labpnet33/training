var e={id:`big-picture`,h:{en:`What you will learn: why networks run dynamic routing`,hi:`Aap kya seekhoge: networks dynamic routing kyun chalate hain`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn why dynamic routing protocols exist, how OSPF (Open Shortest Path First) works, how to enable it on Junos, how neighbours become Full, how to read the four key show commands, how the database and areas fit together, how OSPF cost and reference bandwidth steer traffic, and how to troubleshoot a neighbour that will not form. This is the OSPF part of the Routing Fundamentals objective of JNCIA-Junos (JN0-106).</p>
<p><b>Prerequisites.</b> You should understand longest prefix match, the routing table and route preference from the previous module (jncia-routing): OSPF internal routes have preference 10, so they beat RIP and BGP but lose to static routes at 5. You should also be comfortable with show interfaces terse and ping from the monitoring module.</p>

<h3>Analogy: static signs versus a live map</h3>
<p>In the routing module you hand-wrote road signs. That works for a village. A big city changes every day: roads close, new roads open. Nobody can repaint all the signs each morning. Instead every junction officer tells his neighbours "I can reach these streets", and each officer builds his own live map from everyone's reports. When a road closes, the officer next to it announces the change, every map updates in seconds, and traffic reroutes without anyone touching a sign.</p>
<p>OSPF is that system. Each router describes its own links, floods the description to every router in the area, and every router runs the same calculation on the same map, so all of them agree on the best paths.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Diamond topology Indore">
<rect x="10" y="85" width="80" height="44" rx="8" fill="#e2e8f0"/><text x="50" y="106" text-anchor="middle" class="svg-ink" font-size="12">PC1</text><text x="50" y="121" text-anchor="middle" class="svg-muted" font-size="10">192.168.40.10</text>
<rect x="140" y="85" width="80" height="44" rx="8" fill="#bae6fd"/><text x="180" y="112" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="290" y="20" width="80" height="44" rx="8" fill="#ddd6fe"/><text x="330" y="47" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="290" y="150" width="80" height="44" rx="8" fill="#ddd6fe"/><text x="330" y="177" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="440" y="85" width="80" height="44" rx="8" fill="#bbf7d0"/><text x="480" y="112" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<rect x="560" y="85" width="70" height="44" rx="8" fill="#e2e8f0"/><text x="595" y="106" text-anchor="middle" class="svg-ink" font-size="12">SRV</text><text x="595" y="121" text-anchor="middle" class="svg-muted" font-size="10">172.16.44.10</text>
<line x1="90" y1="107" x2="140" y2="107" stroke="#64748b" stroke-width="2"/><line x1="220" y1="95" x2="290" y2="45" stroke="#64748b" stroke-width="2"/><line x1="220" y1="120" x2="290" y2="170" stroke="#64748b" stroke-width="2"/><line x1="370" y1="45" x2="440" y2="95" stroke="#64748b" stroke-width="2"/><line x1="370" y1="170" x2="440" y2="120" stroke="#64748b" stroke-width="2"/><line x1="520" y1="107" x2="560" y2="107" stroke="#64748b" stroke-width="2"/>
<text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="12">area 0, two equal paths</text>
</svg><p class="cap">The Indore diamond (lab 1). R1 has two equal-cost paths to R4, and OSPF finds both by itself.</p></div>

<h3>Why not just static routes?</h3>
<table class="cmp"><tr><th>Question</th><th>Static</th><th>OSPF</th></tr>
<tr><td>Who maintains routes?</td><td>You, by hand</td><td>The protocol</td></tr>
<tr><td>Link fails</td><td>Route stays until you remove it</td><td>Neighbour goes down, routes recomputed in seconds</td></tr>
<tr><td>New LAN added</td><td>Edit every router</td><td>Enable OSPF on the new interface once</td></tr>
<tr><td>CPU and bandwidth</td><td>None</td><td>Small, for hellos and updates</td></tr>
<tr><td>Good for</td><td>Stubs, small sites, backups</td><td>Campus, data centre, medium to large networks</td></tr></table>

<h3>The three labs</h3>
<ul>
<li><b>Single-area OSPF (Indore).</b> R3 and R4 already run OSPF in area 0. You bring R1 (with the staff LAN 192.168.40.0/24) and R2 in, advertise loopbacks and the LAN as passive interfaces, and prove PC1 reaches the server 172.16.44.10 behind R4.</li>
<li><b>Neighbours stuck (Vizag).</b> A four-router ring built by three engineers has only one adjacency. You find a hello-interval mismatch, an area mismatch and a missing interface.</li>
<li><b>Steer traffic with OSPF cost (Mysuru).</b> You apply a reference bandwidth of 100g and a metric of 500 on the rented R3 path, in both directions, so traffic prefers R2.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Before OSPF, R1 in the Indore lab knows only its own connected subnets. Two minutes after you enable OSPF in area 0 on R1's uplinks, R1 knows R4's loopback 10.255.4.4/32 and the server LAN 172.16.44.0/24, each with two next hops. You typed no routes. When R2 is switched off later, R1 drops the R2 next hop and keeps the R3 path with no action from you.</p></div>

<div class="note"><p><b>Notation.</b> In OSPF you will see areas written both as 0 and as 0.0.0.0, and 0.0.0.1 for area 1. They are the same style: an area ID is a 32-bit number, usually written like an IPv4 address.</p></div>
<div class="warn"><p><b>Common mistake.</b> Thinking "OSPF is up" means "the network works". OSPF can be Full and the ping can still fail for a reason that has nothing to do with the protocol, such as a wrong interface address. Verify with a ping.</p></div>

<div class="scn"><h4>The weekend nobody touched a route</h4><p>A university added a new building to its campus network on a Friday. The engineer enabled OSPF on the new router's two uplinks and its LAN, as a passive interface. By Monday every other router already knew the new LAN. During the weekend a fibre was cut; OSPF removed the dead path and used the other one while everyone was away. Nobody was paged.</p><p><b>Lesson:</b> dynamic routing turns topology changes from tickets into non-events.</p></div>

<div class="iv"><p class="q">"Why would you choose OSPF over static routing?"</p><p>Because it adapts to failures and growth without manual edits: routers exchange link information, build the same topology map, and recompute best paths with Dijkstra's SPF. Static routes are fine for stubs and backups. Mention fast convergence, scalability with areas, and that OSPF is an open standard supported by every vendor.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPF is a link-state interior gateway protocol; routers share link information and compute paths.</li>
<li>It adapts to failures automatically, unlike static routes.</li>
<li>OSPF internal routes have preference 10; static is 5.</li>
<li>The labs: single-area build (Indore), stuck neighbours (Vizag), cost tuning (Mysuru).</li>
<li>Area 0 and 0.0.0.0 are the same backbone area.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki dynamic routing protocols kyun hote hain, OSPF (Open Shortest Path First) kaise kaam karta hai, Junos par ise kaise enable karte hain, neighbours Full kaise banate hain, chaar key show commands kaise padhte hain, database aur areas kaise jude hain, OSPF cost aur reference bandwidth traffic ko kaise modte hain, aur jo neighbour nahi banta use kaise troubleshoot karte hain. Yeh JNCIA-Junos (JN0-106) ke Routing Fundamentals objective ka OSPF hissa hai.</p>
<p><b>Prerequisites.</b> Pichle module (jncia-routing) se longest prefix match, routing table aur route preference aani chahiye: OSPF internal routes ki preference 10 hai, isliye woh RIP aur BGP ko haraate hain lekin 5 wale static se haar jaate hain. Monitoring module ke show interfaces terse aur ping se bhi comfortable hona chahiye.</p>

<h3>Analogy: static signs vs live map</h3>
<p>Routing module mein aapne haath se road signs likhe. Gaon ke liye yeh chalta hai. Bade sheher mein roz kuch badalta hai: sadkein band hoti hain, nayi khulti hain. Koi har subah saare signs dobara paint nahi kar sakta. Iski jagah har chauraahe ka officer apne padosiyon ko batata hai "main in galiyon tak pahunch sakta hoon", aur har officer sabki reports se apna live map banata hai. Sadak band ho to uske paas ka officer announce karta hai, har map seconds mein update hota hai, aur traffic bina kisi sign ko chhue reroute ho jaata hai.</p>
<p>OSPF wahi system hai. Har router apne links ka description deta hai, use area ke har router tak flood karta hai, aur har router same map par same calculation chalata hai, isliye sab best paths par agree karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Diamond topology Indore">
<rect x="10" y="85" width="80" height="44" rx="8" fill="#e2e8f0"/><text x="50" y="106" text-anchor="middle" class="svg-ink" font-size="12">PC1</text><text x="50" y="121" text-anchor="middle" class="svg-muted" font-size="10">192.168.40.10</text>
<rect x="140" y="85" width="80" height="44" rx="8" fill="#bae6fd"/><text x="180" y="112" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="290" y="20" width="80" height="44" rx="8" fill="#ddd6fe"/><text x="330" y="47" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="290" y="150" width="80" height="44" rx="8" fill="#ddd6fe"/><text x="330" y="177" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="440" y="85" width="80" height="44" rx="8" fill="#bbf7d0"/><text x="480" y="112" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<rect x="560" y="85" width="70" height="44" rx="8" fill="#e2e8f0"/><text x="595" y="106" text-anchor="middle" class="svg-ink" font-size="12">SRV</text><text x="595" y="121" text-anchor="middle" class="svg-muted" font-size="10">172.16.44.10</text>
<line x1="90" y1="107" x2="140" y2="107" stroke="#64748b" stroke-width="2"/><line x1="220" y1="95" x2="290" y2="45" stroke="#64748b" stroke-width="2"/><line x1="220" y1="120" x2="290" y2="170" stroke="#64748b" stroke-width="2"/><line x1="370" y1="45" x2="440" y2="95" stroke="#64748b" stroke-width="2"/><line x1="370" y1="170" x2="440" y2="120" stroke="#64748b" stroke-width="2"/><line x1="520" y1="107" x2="560" y2="107" stroke="#64748b" stroke-width="2"/>
<text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="12">area 0, do equal paths</text>
</svg><p class="cap">Indore diamond (lab 1). R1 ke R4 tak do equal-cost paths hain, aur OSPF dono khud dhoondh leta hai.</p></div>

<h3>Sirf static routes kyun nahi?</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Static</th><th>OSPF</th></tr>
<tr><td>Routes kaun maintain karta hai?</td><td>Aap, haath se</td><td>Protocol</td></tr>
<tr><td>Link fail ho</td><td>Route tab tak rehta hai jab tak aap na hatao</td><td>Neighbour down, routes seconds mein recompute</td></tr>
<tr><td>Naya LAN judna</td><td>Har router edit karo</td><td>Naye interface par ek baar OSPF enable karo</td></tr>
<tr><td>CPU aur bandwidth</td><td>Koi nahi</td><td>Thoda, hellos aur updates ke liye</td></tr>
<tr><td>Kahan achha</td><td>Stubs, chhote sites, backups</td><td>Campus, data centre, medium se bade networks</td></tr></table>

<h3>Teen labs</h3>
<ul>
<li><b>Single-area OSPF (Indore).</b> R3 aur R4 pehle se area 0 mein OSPF chala rahe hain. Aap R1 (staff LAN 192.168.40.0/24 ke saath) aur R2 ko laate ho, loopbacks aur LAN ko passive interfaces ke roop mein advertise karte ho, aur saabit karte ho PC1 R4 ke peeche server 172.16.44.10 tak pahunchta hai.</li>
<li><b>Neighbours atke hue (Vizag).</b> Teen engineers ki banayi chaar-router ring mein sirf ek adjacency hai. Aap hello-interval mismatch, area mismatch aur missing interface dhoondhte ho.</li>
<li><b>OSPF cost se traffic modna (Mysuru).</b> Aap 100g reference bandwidth aur kiraye wale R3 path par 500 metric lagate ho, dono directions mein, taaki traffic R2 ko prefer kare.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> OSPF se pehle Indore lab mein R1 sirf apne connected subnets jaanta hai. R1 ke uplinks par area 0 mein OSPF enable karne ke do minute baad R1 R4 ka loopback 10.255.4.4/32 aur server LAN 172.16.44.0/24 jaanta hai, har ek ke do next hops ke saath. Aapne koi route type nahi kiya. Baad mein R2 band ho to R1 R2 wala next hop hata deta hai aur R3 wala path rakhta hai, aapke kuch kiye bina.</p></div>

<div class="note"><p><b>Notation.</b> OSPF mein areas 0 aur 0.0.0.0 dono tarah likhe dikhte hain, aur area 1 ke liye 0.0.0.1. Area ID 32-bit number hai, aam taur par IPv4 address jaisa likha jaata hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> "OSPF up hai" ko "network chal raha hai" samajhna. OSPF Full ho sakta hai aur ping phir bhi fail ho sakti hai aisi wajah se jiska protocol se koi lena dena nahi, jaise galat interface address. Ping se verify karo.</p></div>

<div class="scn"><h4>Woh weekend jab kisi ne route nahi chhua</h4><p>Ek university ne Friday ko campus network mein naya building jodi. Engineer ne naye router ke do uplinks aur uske LAN par (passive interface ke roop mein) OSPF enable kiya. Monday tak baaki har router naye LAN ko jaanta tha. Weekend mein ek fibre kat gayi; OSPF ne mara hua path hataya aur doosra use kiya jab sab ghar par the. Kisi ko page nahi karna pada.</p><p><b>Lesson:</b> dynamic routing topology changes ko tickets se non-events bana deti hai.</p></div>

<div class="iv"><p class="q">"Static routing ki jagah OSPF kyun chunoge?"</p><p>Kyunki yeh manual edits ke bina failures aur growth ke saath adapt karta hai: routers link information exchange karte hain, same topology map banate hain, aur Dijkstra ke SPF se best paths dobara compute karte hain. Static routes stubs aur backups ke liye theek hain. Fast convergence, areas ke saath scalability, aur yeh ki OSPF open standard hai jo har vendor support karta hai, yeh batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPF link-state interior gateway protocol hai; routers link information share karke paths compute karte hain.</li>
<li>Yeh static routes ke ulta failures ke saath apne aap adapt karta hai.</li>
<li>OSPF internal routes ki preference 10 hai; static 5.</li>
<li>Labs: single-area build (Indore), atke neighbours (Vizag), cost tuning (Mysuru).</li>
<li>Area 0 aur 0.0.0.0 ek hi backbone area hain.</li>
</ul></div>
`}};export{e as default};