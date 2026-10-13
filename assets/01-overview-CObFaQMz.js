var e={id:`overview`,h:{en:`IS-IS design for the SP core: what you will learn and the big picture`,hi:`SP core ke liye IS-IS design: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> In the spcor-isis module you learned how IS-IS works. Here you learn how to <b>design and operate it</b> in a real provider core, the part of SPCOR 350-501 that decides whether a network keeps running at scale. You will study narrow versus wide metrics and why a mixed Cisco and Juniper core silently loses routes, how to migrate safely, how to steer traffic with interface metrics, when to use one level or two, how to redistribute customer routes and originate a default route at the internet edge, how to protect convergence, and how to troubleshoot all of it. Every output in this module comes from the simulator labs: Cisco IOS XE-style routers and Junos routers on the same IS-IS engine.</p>
<p><b>Prerequisites.</b> The spcor-isis module (NET, levels, adjacencies, DIS, ATT bit, leaking) and the spcor-start module. You should be able to read <code>show isis neighbors</code> and <code>show ip route isis</code> without help.</p>

<h3>Analogy: a motorway sign in two different units</h3>
<p>Imagine a national motorway authority that signs distances in <b>small units</b> that can show only numbers up to 63. It works for a town. When the country grows and one road is 5,000 units long, the signs cannot express it. A newer system introduces <b>wide signs</b> that can show millions. Now a new region puts up wide signs while an old region's drivers can only read the small ones. The roads are connected, the drivers wave to each other at the border (the adjacency is up), but the old-region drivers cannot read the new signs and never learn that the new region exists (routes are missing). That is exactly the IS-IS narrow-versus-wide story, and it is the most important trap of this module.</p>

<h3>The design questions of an IS-IS core</h3>
<table class="cmp"><tr><th>Question</th><th>Typical SP answer</th><th>Chapter</th></tr>
<tr><td>Which metric style?</td><td>Wide, everywhere, from day one</td><td>2, 3</td></tr>
<tr><td>How do we steer traffic?</td><td>Interface metrics set by design, equal metrics for ECMP</td><td>4</td></tr>
<tr><td>One level or two?</td><td>Single level 2 up to a few hundred routers; two levels when scale or boundaries require</td><td>5</td></tr>
<tr><td>How do customer routes enter?</td><td>Filtered redistribution on the PE, or better, BGP</td><td>6</td></tr>
<tr><td>How fast must it converge?</td><td>BFD, throttle timers, fast reroute</td><td>7</td></tr>
<tr><td>What if it breaks?</td><td>Layered troubleshooting</td><td>8</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="The mixed-vendor square of the first lab">
<rect x="60" y="40" width="110" height="60" rx="10" fill="#bae6fd"/><text x="115" y="66" text-anchor="middle" class="svg-ink" font-size="14">R1 (Cisco)</text><text x="115" y="86" text-anchor="middle" class="svg-muted" font-size="11">lo 10.2.255.1</text>
<rect x="470" y="40" width="110" height="60" rx="10" fill="#fed7aa"/><text x="525" y="66" text-anchor="middle" class="svg-ink" font-size="14">JR1 (Juniper)</text><text x="525" y="86" text-anchor="middle" class="svg-muted" font-size="11">lo 10.2.255.11</text>
<rect x="470" y="170" width="110" height="60" rx="10" fill="#fed7aa"/><text x="525" y="196" text-anchor="middle" class="svg-ink" font-size="14">JR2 (Juniper)</text><text x="525" y="216" text-anchor="middle" class="svg-muted" font-size="11">lo 10.2.255.12</text>
<rect x="60" y="170" width="110" height="60" rx="10" fill="#bae6fd"/><text x="115" y="196" text-anchor="middle" class="svg-ink" font-size="14">R2 (Cisco)</text><text x="115" y="216" text-anchor="middle" class="svg-muted" font-size="11">lo 10.2.255.2</text>
<g stroke="#64748b" stroke-width="2"><line x1="170" y1="70" x2="470" y2="70"/><line x1="525" y1="100" x2="525" y2="170"/><line x1="470" y1="200" x2="170" y2="200"/><line x1="115" y1="170" x2="115" y2="100"/></g>
<text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="11">10.2.1.0/24</text><text x="545" y="140" text-anchor="start" class="svg-muted" font-size="11">10.2.2.0/24</text><text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="11">10.2.3.0/24</text><text x="30" y="140" text-anchor="start" class="svg-muted" font-size="11">10.2.4.0/24</text>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">area 49.0010, level-2 only</text>
</svg><p class="cap">The module's first lab: a level-2-only square of two Cisco and two Juniper routers.</p></div>

<h3>Where the first lab starts</h3>
<p>In the lab "Mixed core: the routes that vanished", every adjacency is up. Look at R1 before anything is fixed:</p>
<pre class="out">R1# show isis neighbors
Tag null:
System Id       Type Interface     IP Address      State Holdtime Circuit Id
JR1             L2   Gi0/0         10.2.1.2        <span class="hl">UP</span>    24       00
R2              L2   Gi0/1         10.2.4.1        <span class="hl">UP</span>    30       00

R1# show ip route isis
i L2     10.2.3.0/24 [115/20] via 10.2.4.1, 00:00:30, GigabitEthernet0/1
i L2     10.2.255.2/32 [115/10] via 10.2.4.1, 00:00:30, GigabitEthernet0/1</pre>
<p>R1 has adjacencies to both JR1 and R2, but its routing table holds only R2's routes. Neither Juniper loopback is there. Nothing is "down", yet half the network is invisible. By the end of the next chapter you will know exactly why, and how to prove it in two commands.</p>

<div class="eg"><p><b>Worked example.</b> Bharat Transit adds two Juniper routers to an all-Cisco IS-IS core. On Monday the engineer sees all adjacencies up and declares success. On Tuesday customers behind the Juniper routers complain. The cause is not a link problem: the Juniper routers advertise wide metrics only and the Cisco routers read only narrow ones. This module teaches you to catch this before the customers do.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating "adjacency up" as "design working". In IS-IS an adjacency tells you hellos match; it tells you nothing about whether LSP contents are understood. Always verify the routing table and the database, not only the neighbour list.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions often combine two facts: the default metric style of Cisco IOS (narrow) and the Junos behaviour (it sends and reads both unless set to wide-metrics-only). The right answer to "adjacency up, routes missing" is almost always a metric-style mismatch.</p></div>

<div class="scn"><h4>The loopback that existed only on one side</h4><p>After an overnight migration, a provider's NOC saw PE-to-PE pings working in one direction only. The new PEs were Juniper and had wide metrics only, the old PEs Cisco on narrow. Juniper learned the Cisco loopbacks (it reads both), Cisco did not learn the Juniper ones. BGP sessions that needed both directions stayed down. Setting <code>metric-style wide</code> on the Cisco side fixed it within a minute.</p><p><b>Lesson:</b> one-directional reachability is a classic signature of a metric-style mismatch.</p></div>

<div class="iv"><p class="q">"What is the first thing you check when a new router joins the core and its loopback is unreachable but the adjacency is up?"</p><p>Compare the metric styles. IOS defaults to narrow, so I look at <code>show isis database detail</code> for IS-Extended (wide) entries from the new router and at <code>show running-config | section router isis</code> for a missing <code>metric-style</code> line. Then I fix it on the narrow side by moving to transition and then wide.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>This module is about design and operations of IS-IS at provider scale.</li>
<li>Adjacency up does not mean routes are present; check the table and the database.</li>
<li>Metric style is the first design decision; wide is the provider norm.</li>
<li>Labs use Cisco IOS XE-style and Junos routers on the same IS-IS engine.</li>
<li>Topics: metrics, mixed vendors, steering, levels, redistribution, convergence, troubleshooting.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> spcor-isis module mein aapne seekha ki IS-IS kaise kaam karta hai. Yahan aap seekhoge ki real provider core mein ise <b>design aur operate</b> kaise karte hain, SPCOR 350-501 ka woh hissa jo tay karta hai ki network scale par chalta rehta hai ya nahi. Aap narrow versus wide metrics aur mixed Cisco-Juniper core chupchap routes kyun kho deta hai, safely migrate kaise karte hain, interface metrics se traffic kaise steer karte hain, ek level ya do kab use karne hain, customer routes redistribute karna aur internet edge par default route originate karna, convergence ko protect kaise karte hain, aur sab kuch troubleshoot kaise karte hain, yeh padhoge. Is module ka har output simulator labs se hai: Cisco IOS XE-style routers aur Junos routers ek hi IS-IS engine par.</p>
<p><b>Prerequisites.</b> spcor-isis module (NET, levels, adjacencies, DIS, ATT bit, leaking) aur spcor-start module. Aap <code>show isis neighbors</code> aur <code>show ip route isis</code> bina madad ke padh sakein.</p>

<h3>Analogy: motorway sign do alag units mein</h3>
<p>Ek national motorway authority ki kalpana karo jo distances <b>chhote units</b> mein sign karti hai jo sirf 63 tak ke numbers dikha sakte hain. Ek shehar ke liye kaam karta hai. Desh badhta hai aur ek road 5,000 units lambi ho jaati hai, to signs use express nahi kar paate. Naya system <b>wide signs</b> laata hai jo lakhon dikha sakte hain. Ab ek naya region wide signs lagata hai jabki purane region ke drivers sirf chhote wale padh sakte hain. Roads jude hain, border par drivers ek doosre ko haath hilate hain (adjacency up hai), par purane region ke drivers naye signs padh nahi paate aur kabhi nahi seekhte ki naya region exist karta hai (routes missing). Yahi IS-IS ka narrow-versus-wide ka kissa hai, aur yeh is module ka sabse important jaal hai.</p>

<h3>IS-IS core ke design sawal</h3>
<table class="cmp"><tr><th>Sawal</th><th>Aam SP jawab</th><th>Chapter</th></tr>
<tr><td>Kaunsa metric style?</td><td>Wide, har jagah, pehle din se</td><td>2, 3</td></tr>
<tr><td>Traffic kaise steer karein?</td><td>Design ke hisaab se interface metrics, ECMP ke liye equal metrics</td><td>4</td></tr>
<tr><td>Ek level ya do?</td><td>Kuch sau routers tak single level 2; scale ya boundaries ki zaroorat par do levels</td><td>5</td></tr>
<tr><td>Customer routes kaise aate hain?</td><td>PE par filtered redistribution, ya behtar, BGP</td><td>6</td></tr>
<tr><td>Kitni tez convergence chahiye?</td><td>BFD, throttle timers, fast reroute</td><td>7</td></tr>
<tr><td>Toot jaaye to?</td><td>Layered troubleshooting</td><td>8</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Pehle lab ka mixed-vendor square">
<rect x="60" y="40" width="110" height="60" rx="10" fill="#bae6fd"/><text x="115" y="66" text-anchor="middle" class="svg-ink" font-size="14">R1 (Cisco)</text><text x="115" y="86" text-anchor="middle" class="svg-muted" font-size="11">lo 10.2.255.1</text>
<rect x="470" y="40" width="110" height="60" rx="10" fill="#fed7aa"/><text x="525" y="66" text-anchor="middle" class="svg-ink" font-size="14">JR1 (Juniper)</text><text x="525" y="86" text-anchor="middle" class="svg-muted" font-size="11">lo 10.2.255.11</text>
<rect x="470" y="170" width="110" height="60" rx="10" fill="#fed7aa"/><text x="525" y="196" text-anchor="middle" class="svg-ink" font-size="14">JR2 (Juniper)</text><text x="525" y="216" text-anchor="middle" class="svg-muted" font-size="11">lo 10.2.255.12</text>
<rect x="60" y="170" width="110" height="60" rx="10" fill="#bae6fd"/><text x="115" y="196" text-anchor="middle" class="svg-ink" font-size="14">R2 (Cisco)</text><text x="115" y="216" text-anchor="middle" class="svg-muted" font-size="11">lo 10.2.255.2</text>
<g stroke="#64748b" stroke-width="2"><line x1="170" y1="70" x2="470" y2="70"/><line x1="525" y1="100" x2="525" y2="170"/><line x1="470" y1="200" x2="170" y2="200"/><line x1="115" y1="170" x2="115" y2="100"/></g>
<text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="11">10.2.1.0/24</text><text x="545" y="140" text-anchor="start" class="svg-muted" font-size="11">10.2.2.0/24</text><text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="11">10.2.3.0/24</text><text x="30" y="140" text-anchor="start" class="svg-muted" font-size="11">10.2.4.0/24</text>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">area 49.0010, level-2 only</text>
</svg><p class="cap">Module ka pehla lab: do Cisco aur do Juniper routers ka level-2-only square.</p></div>

<h3>Pehla lab kahan se shuru hota hai</h3>
<p>Lab "Mixed core: the routes that vanished" mein har adjacency up hai. Kuch fix hone se pehle R1 dekho:</p>
<pre class="out">R1# show isis neighbors
Tag null:
System Id       Type Interface     IP Address      State Holdtime Circuit Id
JR1             L2   Gi0/0         10.2.1.2        <span class="hl">UP</span>    24       00
R2              L2   Gi0/1         10.2.4.1        <span class="hl">UP</span>    30       00

R1# show ip route isis
i L2     10.2.3.0/24 [115/20] via 10.2.4.1, 00:00:30, GigabitEthernet0/1
i L2     10.2.255.2/32 [115/10] via 10.2.4.1, 00:00:30, GigabitEthernet0/1</pre>
<p>R1 ki JR1 aur R2 dono se adjacencies hain, par uski routing table mein sirf R2 ke routes hain. Koi Juniper loopback nahi hai. Kuch "down" nahi hai, phir bhi aadha network invisible hai. Agle chapter ke end tak aap exactly jaan loge kyun, aur do commands mein ise prove kaise karein.</p>

<div class="eg"><p><b>Worked example.</b> Bharat Transit all-Cisco IS-IS core mein do Juniper routers jodta hai. Somvaar ko engineer saari adjacencies up dekhkar safalta ghoshit karta hai. Mangalvaar ko Juniper routers ke peeche ke customers shikayat karte hain. Cause link problem nahi hai: Juniper routers sirf wide metrics advertise karte hain aur Cisco routers sirf narrow padhte hain. Yeh module aapko customers se pehle ise pakadna sikhata hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> "Adjacency up" ko "design working" maan lena. IS-IS mein adjacency sirf yeh batati hai ki hellos match karte hain; yeh nahi batati ki LSP contents samjhe ja rahe hain. Hamesha routing table aur database verify karo, sirf neighbour list nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawal aksar do facts milate hain: Cisco IOS ka default metric style (narrow) aur Junos ka behaviour (dono bhejta aur padhta hai jab tak wide-metrics-only na ho). "Adjacency up, routes missing" ka sahi jawab lagbhag hamesha metric-style mismatch hai.</p></div>

<div class="scn"><h4>Woh loopback jo sirf ek taraf exist karta tha</h4><p>Overnight migration ke baad provider ke NOC ko PE-to-PE pings sirf ek direction mein chalte dikhe. Naye PEs Juniper the aur sirf wide metrics, purane PEs Cisco narrow par. Juniper ne Cisco loopbacks seekhe (woh dono padhta hai), Cisco ne Juniper wale nahi seekhe. Jin BGP sessions ko dono directions chahiye the woh down rahe. Cisco side par <code>metric-style wide</code> lagane se ek minute mein theek ho gaya.</p><p><b>Lesson:</b> ek-direction reachability metric-style mismatch ki classic pehchaan hai.</p></div>

<div class="iv"><p class="q">"Naya router core mein judta hai, adjacency up hai par uska loopback unreachable hai. Sabse pehle kya check karte ho?"</p><p>Metric styles compare karta hoon. IOS default mein narrow hai, isliye main naye router ke IS-Extended (wide) entries ke liye <code>show isis database detail</code> dekhta hoon aur missing <code>metric-style</code> line ke liye <code>show running-config | section router isis</code>. Phir narrow side par transition aur phir wide mein jaakar fix karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Yeh module provider scale par IS-IS ke design aur operations ke baare mein hai.</li>
<li>Adjacency up ka matlab routes present nahi; table aur database check karo.</li>
<li>Metric style pehla design decision hai; wide provider norm hai.</li>
<li>Labs mein Cisco IOS XE-style aur Junos routers ek hi IS-IS engine par hain.</li>
<li>Topics: metrics, mixed vendors, steering, levels, redistribution, convergence, troubleshooting.</li>
</ul></div>
`}};export{e as default};