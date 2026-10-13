var e={id:`big-picture`,h:{en:`OSPF: the big picture`,hi:`OSPF: badi picture`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to explain how routers discover each other and share a map of the network, configure single-area OSPFv2 on Cisco IOS in two different ways, control the router ID, the DR/BDR election and the path cost, read every important <code>show</code> command, and fix a broken OSPF network from a real NOC ticket. This is the flagship routing topic of the CCNA 200-301 exam, and it is asked in almost every network engineer interview in India and abroad.</p>

<p><b>Prerequisites.</b> You should already be comfortable with the IOS CLI and configuration modes (module <i>Cisco IOS from zero</i>), IPv4 subnetting including /30 and /32 masks (<i>IPv4 addressing and subnetting</i>), and how a router reads its routing table and uses static routes (<i>Routing table and static routes</i>). If "longest prefix match" and "administrative distance" sound unfamiliar, revise that module first. We will refer back to it, not re-teach it.</p>

<h3>Start with an analogy: every router carries the same city map</h3>
<p>Imagine a delivery company in a big city. In the old days, each rider carried a slip of paper written by the manager: "to reach Sector 12, turn left at the petrol pump". That is <b>static routing</b>. It works until a road is dug up. Then every slip is wrong, and the manager has to rewrite them one by one.</p>
<p>Now imagine every rider has the <b>same live map</b> on their phone. When a road closes, the traffic police announce it, every phone updates within seconds, and each rider calculates their own new shortest route. Nobody waits for the manager. That is <b>OSPF</b> (Open Shortest Path First). Every router in an area holds an identical map of the network, called the <b>link-state database</b>, and runs a shortest-path calculation on it to build its own routing table.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="The four-router lab topology used in this module">
<line x1="100" y1="80" x2="240" y2="80" stroke="#64748b" stroke-width="3"/>
<line x1="260" y1="80" x2="400" y2="80" stroke="#64748b" stroke-width="3"/>
<line x1="420" y1="80" x2="560" y2="80" stroke="#64748b" stroke-width="3"/>
<rect x="40" y="55" width="80" height="50" rx="10" fill="#bae6fd"/><text x="80" y="85" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="200" y="55" width="80" height="50" rx="10" fill="#bae6fd"/><text x="240" y="85" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<rect x="360" y="55" width="80" height="50" rx="10" fill="#bae6fd"/><text x="400" y="85" text-anchor="middle" class="svg-ink" font-size="14">R3</text>
<rect x="520" y="55" width="80" height="50" rx="10" fill="#bae6fd"/><text x="560" y="85" text-anchor="middle" class="svg-ink" font-size="14">R4</text>
<text x="160" y="40" text-anchor="middle" class="svg-accent" font-size="12">10.0.12.0/30</text>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="12">10.0.23.0/30</text>
<text x="480" y="40" text-anchor="middle" class="svg-accent" font-size="12">10.0.34.0/30</text>
<rect x="30" y="130" width="100" height="30" rx="6" fill="#bbf7d0"/><text x="80" y="150" text-anchor="middle" class="svg-ink" font-size="12">Lo0 1.1.1.1</text>
<rect x="190" y="130" width="100" height="30" rx="6" fill="#bbf7d0"/><text x="240" y="150" text-anchor="middle" class="svg-ink" font-size="12">Lo0 2.2.2.2</text>
<rect x="350" y="130" width="100" height="30" rx="6" fill="#bbf7d0"/><text x="400" y="150" text-anchor="middle" class="svg-ink" font-size="12">Lo0 3.3.3.3</text>
<rect x="510" y="130" width="100" height="30" rx="6" fill="#bbf7d0"/><text x="560" y="150" text-anchor="middle" class="svg-ink" font-size="12">Lo0 4.4.4.4</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">All links GigabitEthernet, all interfaces in area 0</text>
</svg><p class="cap">The lab chain: head office R1 to branch R4. Each link is a /30, each router has a /32 loopback.</p></div>

<h3>Why not just use static routes?</h3>
<p>Static routes are perfect for a stub branch with one exit. They become painful as soon as the network has more than a few routers or more than one path. Every static route is a promise that you, the human, will update it when something changes. OSPF removes those promises. It finds new paths automatically after a failure, adds new subnets as soon as you enable OSPF on them, and always prefers the fastest path when you give it correct costs.</p>

<div class="eg"><p><b>Worked example.</b> In the lab chain above there are 7 networks: 4 loopbacks and 3 point-to-point links. R1 is directly connected to 2 of them, so it needs 5 static routes. R2 and R3 are connected to 3 each, so they need 4 each. R4 needs 5. That is <b>18 static routes</b> for only four routers, and adding a fifth router means touching all of them again. With OSPF each router needs one <code>router ospf 1</code> command and two or three network statements, and a new router is configured only on itself.</p></div>

<h3>The road map of this module</h3>
<table class="cmp"><tr><th>Chapters</th><th>What you build in your head</th></tr>
<tr><td>2 to 3</td><td>Dynamic routing families, and how OSPF works inside: LSDB, SPF, five packet types</td></tr>
<tr><td>4 to 8</td><td>Router ID, neighbour rules, neighbour states, DR/BDR, network types and LSAs</td></tr>
<tr><td>9 to 10</td><td>Cost, reference bandwidth, a full SPF calculation, and areas</td></tr>
<tr><td>11 to 12</td><td>Configuration, verification and the troubleshooting workflow, including ticket NK-4521</td></tr>
<tr><td>13</td><td>Summary, exam traps and the command cheat-sheet</td></tr>
</table>
<p>The labs use exactly the devices and addresses you see in this module: the R1 to R4 chain for building OSPF and for the NOC ticket, and a four-router core VLAN (10.10.0.0/24) for DR/BDR, router IDs and cost. After this module comes OSPFv3 for IPv6, which reuses nearly everything you learn here.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Treating OSPF as magic that "just finds routes". OSPF only advertises networks on interfaces where you enabled it, only forms neighbours when a strict list of parameters matches, and only picks the fastest path when the cost values make sense. Most OSPF outages are one of those three things.</p></div>

<div class="exam"><p><b>Exam focus.</b> The CCNA blueprint asks you to configure and verify <b>single-area OSPFv2</b>: neighbour adjacencies, point-to-point and broadcast network types (DR/BDR selection) and the router ID. It also expects you to read OSPF entries in the routing table. Multi-area design, stub areas and LSA types beyond 1 and 2 belong to CCNP.</p></div>

<div class="scn"><h4>Twelve branches and one cut cable</h4><p>A logistics company grew from 3 to 12 branches, each with two WAN links, all routed with static routes and floating statics. One night a fibre cut took down a core link. The floating statics on the branches failed over, but three statics on the head office routers still pointed at the dead path, and return traffic for those branches was dropped for two hours until someone found them. The team moved to single-area OSPF the next quarter. The next fibre cut caused a 40-second blip that users barely noticed, because every router recalculated its paths on its own.</p><p><b>Lesson:</b> static routes do not know when the network changes. A dynamic protocol like OSPF does, and it reacts in seconds.</p></div>

<div class="iv"><p class="q">"Why would you use OSPF instead of static routes?"</p><p>Strong answer: static routes do not adapt to failures, do not scale, and every change is manual. OSPF is an open-standard link-state protocol: routers discover neighbours automatically, share a common database, compute the lowest-cost path with SPF and reconverge in seconds after a failure. Then add balance: static routes are still the right choice for a stub site with one exit, or as a floating backup. Interviewers like candidates who know when <i>not</i> to use a protocol.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPF gives every router in an area the same map (the LSDB); each router computes its own shortest paths.</li>
<li>Static routing does not scale and does not react to failures; OSPF does both automatically.</li>
<li>The CCNA focuses on single-area OSPFv2: neighbours, point-to-point, broadcast with DR/BDR, and the router ID.</li>
<li>Most OSPF faults come from interfaces not enabled, neighbour parameters that do not match, or bad cost values.</li>
<li>The labs use the R1 to R4 chain (10.0.12.0/30, 10.0.23.0/30, 10.0.34.0/30, loopbacks 1.1.1.1 to 4.4.4.4).</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap samjha paoge ki routers ek dusre ko kaise dhoondhte hain aur network ka map kaise share karte hain, Cisco IOS par single-area OSPFv2 do alag tareekon se configure kar paoge, router ID, DR/BDR election aur path cost control kar paoge, har important <code>show</code> command padh paoge, aur ek real NOC ticket se toota hua OSPF network theek kar paoge. Yeh CCNA 200-301 exam ka flagship routing topic hai, aur India aur bahar lagbhag har network engineer interview mein poocha jaata hai.</p>

<p><b>Prerequisites.</b> Aapko IOS CLI aur configuration modes (module <i>Cisco IOS from zero</i>), IPv4 subnetting jismein /30 aur /32 masks bhi hain (<i>IPv4 addressing and subnetting</i>), aur router apni routing table kaise padhta hai aur static routes kaise use karta hai (<i>Routing table and static routes</i>) mein comfortable hona chahiye. Agar "longest prefix match" aur "administrative distance" anjaan lagte hain, to pehle woh module revise karo. Hum uska reference denge, dobara nahi padhayenge.</p>

<h3>Ek analogy se shuru karo: har router ke paas same city map hai</h3>
<p>Ek bade shehar mein delivery company socho. Purane zamane mein har rider ke paas manager ki likhi ek parchi hoti thi: "Sector 12 jaane ke liye petrol pump par left lo". Yeh <b>static routing</b> hai. Yeh tab tak chalti hai jab tak koi sadak khud na jaaye. Phir har parchi galat ho jaati hai, aur manager ko ek ek karke sab dobara likhni padti hain.</p>
<p>Ab socho har rider ke phone par <b>same live map</b> hai. Jab sadak band hoti hai, traffic police announce karti hai, har phone kuch second mein update ho jaata hai, aur har rider apna naya shortest route khud calculate karta hai. Koi manager ka wait nahi karta. Yahi <b>OSPF</b> (Open Shortest Path First) hai. Ek area ke har router ke paas network ka ek identical map hota hai, jise <b>link-state database</b> kehte hain, aur woh us par shortest-path calculation chala kar apni routing table banata hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Is module mein use hone wali chaar router lab topology">
<line x1="100" y1="80" x2="240" y2="80" stroke="#64748b" stroke-width="3"/>
<line x1="260" y1="80" x2="400" y2="80" stroke="#64748b" stroke-width="3"/>
<line x1="420" y1="80" x2="560" y2="80" stroke="#64748b" stroke-width="3"/>
<rect x="40" y="55" width="80" height="50" rx="10" fill="#bae6fd"/><text x="80" y="85" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="200" y="55" width="80" height="50" rx="10" fill="#bae6fd"/><text x="240" y="85" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<rect x="360" y="55" width="80" height="50" rx="10" fill="#bae6fd"/><text x="400" y="85" text-anchor="middle" class="svg-ink" font-size="14">R3</text>
<rect x="520" y="55" width="80" height="50" rx="10" fill="#bae6fd"/><text x="560" y="85" text-anchor="middle" class="svg-ink" font-size="14">R4</text>
<text x="160" y="40" text-anchor="middle" class="svg-accent" font-size="12">10.0.12.0/30</text>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="12">10.0.23.0/30</text>
<text x="480" y="40" text-anchor="middle" class="svg-accent" font-size="12">10.0.34.0/30</text>
<rect x="30" y="130" width="100" height="30" rx="6" fill="#bbf7d0"/><text x="80" y="150" text-anchor="middle" class="svg-ink" font-size="12">Lo0 1.1.1.1</text>
<rect x="190" y="130" width="100" height="30" rx="6" fill="#bbf7d0"/><text x="240" y="150" text-anchor="middle" class="svg-ink" font-size="12">Lo0 2.2.2.2</text>
<rect x="350" y="130" width="100" height="30" rx="6" fill="#bbf7d0"/><text x="400" y="150" text-anchor="middle" class="svg-ink" font-size="12">Lo0 3.3.3.3</text>
<rect x="510" y="130" width="100" height="30" rx="6" fill="#bbf7d0"/><text x="560" y="150" text-anchor="middle" class="svg-ink" font-size="12">Lo0 4.4.4.4</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Saare links GigabitEthernet, saare interfaces area 0 mein</text>
</svg><p class="cap">Lab chain: head office R1 se branch R4 tak. Har link /30 hai, har router ka /32 loopback hai.</p></div>

<h3>Sirf static routes kyun nahi?</h3>
<p>Ek exit wali stub branch ke liye static routes perfect hain. Lekin jaise hi network mein kuch se zyada routers ya ek se zyada paths hote hain, yeh takleef dene lagte hain. Har static route ek vaada hai ki aap, insaan, kuch badalne par use update karoge. OSPF in vaadon ko hata deta hai. Failure ke baad naye paths apne aap dhoondhta hai, jaise hi aap kisi subnet par OSPF enable karte ho use add kar deta hai, aur sahi costs dene par hamesha sabse fast path choose karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Upar wali lab chain mein 7 networks hain: 4 loopbacks aur 3 point-to-point links. R1 unmein se 2 se directly connected hai, isliye use 5 static routes chahiye. R2 aur R3 teen teen se connected hain, isliye dono ko 4-4 chahiye. R4 ko 5 chahiye. Sirf chaar routers ke liye <b>18 static routes</b>, aur paanchva router jodne ka matlab sabko phir se chhoona. OSPF mein har router ko ek <code>router ospf 1</code> command aur do-teen network statements chahiye, aur naya router sirf khud par configure hota hai.</p></div>

<h3>Is module ka road map</h3>
<table class="cmp"><tr><th>Chapters</th><th>Dimaag mein kya banega</th></tr>
<tr><td>2 se 3</td><td>Dynamic routing families, aur OSPF andar se kaise kaam karta hai: LSDB, SPF, paanch packet types</td></tr>
<tr><td>4 se 8</td><td>Router ID, neighbour rules, neighbour states, DR/BDR, network types aur LSAs</td></tr>
<tr><td>9 se 10</td><td>Cost, reference bandwidth, poora SPF calculation, aur areas</td></tr>
<tr><td>11 se 12</td><td>Configuration, verification aur troubleshooting workflow, ticket NK-4521 ke saath</td></tr>
<tr><td>13</td><td>Summary, exam traps aur command cheat-sheet</td></tr>
</table>
<p>Labs bilkul wahi devices aur addresses use karti hain jo aap is module mein dekhoge: OSPF banane aur NOC ticket ke liye R1 se R4 chain, aur DR/BDR, router IDs aur cost ke liye chaar routers ka core VLAN (10.10.0.0/24). Is module ke baad IPv6 ke liye OSPFv3 aata hai, jo yahan seekhi lagbhag har cheez dobara use karta hai.</p>

<div class="warn"><p><b>Beginners ki common galti.</b> OSPF ko jaadu samajhna jo "bas routes dhoondh leta hai". OSPF sirf un interfaces ke networks advertise karta hai jahan aapne use enable kiya, neighbours tabhi banata hai jab parameters ki ek strict list match ho, aur sabse fast path tabhi chunta hai jab cost values sahi hon. Zyada tar OSPF outages inhi teen cheezon mein se ek hote hain.</p></div>

<div class="exam"><p><b>Exam focus.</b> CCNA blueprint aapse <b>single-area OSPFv2</b> configure aur verify karwata hai: neighbour adjacencies, point-to-point aur broadcast network types (DR/BDR selection) aur router ID. Routing table mein OSPF entries padhna bhi expected hai. Multi-area design, stub areas aur type 1 aur 2 ke aage ke LSA types CCNP ke hisse hain.</p></div>

<div class="scn"><h4>Barah branches aur ek kata hua cable</h4><p>Ek logistics company 3 se 12 branches tak badh gayi, har branch ke do WAN links, sab static routes aur floating statics se routed. Ek raat fibre cut se ek core link down ho gaya. Branches par floating statics ne failover kar diya, lekin head office routers par teen statics abhi bhi dead path ki taraf point kar rahe the, aur un branches ka return traffic do ghante tak drop hota raha jab tak kisi ne unhe dhoondha nahi. Agle quarter team single-area OSPF par shift ho gayi. Agle fibre cut par 40 second ka blip aaya jo users ko mushkil se pata chala, kyunki har router ne apne paths khud recalculate kar liye.</p><p><b>Seekh:</b> static routes ko pata nahi chalta ki network badla hai. OSPF jaise dynamic protocol ko pata chalta hai, aur woh second mein react karta hai.</p></div>

<div class="iv"><p class="q">"Static routes ki jagah aap OSPF kyun use karoge?"</p><p>Strong answer: static routes failures ke hisaab se adapt nahi karte, scale nahi karte, aur har change manual hota hai. OSPF ek open-standard link-state protocol hai: routers neighbours apne aap dhoondhte hain, ek common database share karte hain, SPF se lowest-cost path nikaalte hain aur failure ke baad second mein reconverge ho jaate hain. Phir balance jodo: ek exit wali stub site ke liye, ya floating backup ke roop mein, static routes ab bhi sahi choice hain. Interviewers ko aise candidates pasand hain jo jaante hain ki protocol kab <i>nahi</i> use karna.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPF area ke har router ko same map (LSDB) deta hai; har router apne shortest paths khud compute karta hai.</li>
<li>Static routing scale nahi karti aur failures par react nahi karti; OSPF dono apne aap karta hai.</li>
<li>CCNA single-area OSPFv2 par focus karta hai: neighbours, point-to-point, DR/BDR ke saath broadcast, aur router ID.</li>
<li>Zyada tar OSPF faults enable na kiye interfaces, match na karne wale neighbour parameters, ya galat cost values se aate hain.</li>
<li>Labs R1 se R4 chain use karti hain (10.0.12.0/30, 10.0.23.0/30, 10.0.34.0/30, loopbacks 1.1.1.1 se 4.4.4.4).</li>
</ul></div>
`}};export{e as default};