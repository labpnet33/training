var e={id:`tiers`,h:{en:`Three-tier, two-tier and the collapsed core`,hi:`Three-tier, two-tier aur collapsed core`},body:{en:`
<p>Think of a big railway network. Local trains stop at every small station (access). Several local lines meet at a junction where passengers change trains and tickets are checked (distribution). Junctions are linked by express trains that never stop at small stations (core). A small town, though, does not need an express line: one junction that also acts as the main station is enough. That is the difference between a <b>three-tier</b> campus and a <b>two-tier (collapsed-core)</b> campus.</p>

<h3>The three layers and their jobs</h3>
<table class="cmp"><tr><th>Layer</th><th>Main job</th><th>Typical features</th></tr>
<tr><td><b>Access</b></td><td>Connect end devices: PCs, phones, APs, printers, cameras</td><td>VLANs, PoE, 802.1X, port security, DHCP snooping, dynamic ARP inspection, QoS trust boundary, PortFast and BPDU guard</td></tr>
<tr><td><b>Distribution</b></td><td>Aggregate access switches; the Layer 2/Layer 3 boundary</td><td>SVIs and FHRP gateways, STP root, route summarisation, ACLs and policy, redundant uplinks to core</td></tr>
<tr><td><b>Core</b></td><td>Fast, reliable transport between distribution blocks, data centre, WAN and internet edge</td><td>Layer 3 only, high-speed links, fast convergence, minimal policy, no users attached</td></tr>
</table>
<p>The core is deliberately simple. Anything that costs CPU or adds risk (complex ACLs, NAT, packet inspection) belongs at the distribution layer or in dedicated blocks such as the internet edge. A core switch should do one thing: move packets between blocks as fast and as reliably as possible.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Three-tier versus two-tier campus">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">Three-tier</text>
<rect x="95" y="35" width="55" height="30" rx="6" fill="#fde68a"/><text x="122" y="55" text-anchor="middle" class="svg-ink" font-size="12">Core</text>
<rect x="170" y="35" width="55" height="30" rx="6" fill="#fde68a"/><text x="197" y="55" text-anchor="middle" class="svg-ink" font-size="12">Core</text>
<rect x="20" y="110" width="55" height="30" rx="6" fill="#bae6fd"/><text x="47" y="130" text-anchor="middle" class="svg-ink" font-size="12">Dist</text>
<rect x="85" y="110" width="55" height="30" rx="6" fill="#bae6fd"/><text x="112" y="130" text-anchor="middle" class="svg-ink" font-size="12">Dist</text>
<rect x="180" y="110" width="55" height="30" rx="6" fill="#bae6fd"/><text x="207" y="130" text-anchor="middle" class="svg-ink" font-size="12">Dist</text>
<rect x="245" y="110" width="55" height="30" rx="6" fill="#bae6fd"/><text x="272" y="130" text-anchor="middle" class="svg-ink" font-size="12">Dist</text>
<rect x="30" y="190" width="100" height="30" rx="6" fill="#bbf7d0"/><text x="80" y="210" text-anchor="middle" class="svg-ink" font-size="12">Access bldg A</text>
<rect x="190" y="190" width="100" height="30" rx="6" fill="#bbf7d0"/><text x="240" y="210" text-anchor="middle" class="svg-ink" font-size="12">Access bldg B</text>
<line x1="122" y1="65" x2="47" y2="110" stroke="#64748b"/><line x1="122" y1="65" x2="112" y2="110" stroke="#64748b"/><line x1="122" y1="65" x2="207" y2="110" stroke="#64748b"/><line x1="122" y1="65" x2="272" y2="110" stroke="#64748b"/>
<line x1="197" y1="65" x2="47" y2="110" stroke="#64748b"/><line x1="197" y1="65" x2="112" y2="110" stroke="#64748b"/><line x1="197" y1="65" x2="207" y2="110" stroke="#64748b"/><line x1="197" y1="65" x2="272" y2="110" stroke="#64748b"/>
<line x1="47" y1="140" x2="80" y2="190" stroke="#64748b"/><line x1="112" y1="140" x2="80" y2="190" stroke="#64748b"/><line x1="207" y1="140" x2="240" y2="190" stroke="#64748b"/><line x1="272" y1="140" x2="240" y2="190" stroke="#64748b"/>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">Two-tier (collapsed core)</text>
<rect x="400" y="90" width="70" height="36" rx="6" fill="#fde68a"/><text x="435" y="113" text-anchor="middle" class="svg-ink" font-size="12">DS1</text>
<rect x="500" y="90" width="70" height="36" rx="6" fill="#fde68a"/><text x="535" y="113" text-anchor="middle" class="svg-ink" font-size="12">DS2</text>
<text x="485" y="80" text-anchor="middle" class="svg-muted" font-size="12">core + distribution</text>
<rect x="435" y="190" width="100" height="30" rx="6" fill="#bbf7d0"/><text x="485" y="210" text-anchor="middle" class="svg-ink" font-size="12">AS1</text>
<line x1="470" y1="108" x2="500" y2="108" stroke="#64748b" stroke-width="3"/><line x1="435" y1="126" x2="470" y2="190" stroke="#64748b"/><line x1="535" y1="126" x2="500" y2="190" stroke="#64748b"/>
</svg><p class="cap">Three-tier adds a core pair once there are several distribution blocks. Two-tier merges core and distribution into one pair, as in this module's lab.</p></div>

<h3>Why a separate core? The full-mesh problem</h3>
<p>Without a core, every distribution block must connect directly to every other block and to the WAN, data centre and internet edge. The number of block-to-block connections grows as n(n-1)/2.</p>
<div class="eg"><p><b>Worked example.</b> Six building distribution pairs fully meshed need 6 x 5 / 2 = <b>15</b> pair-to-pair connections. If each connection is four links (every switch to every switch of the other pair), that is <b>60</b> fibres, and building seven adds 24 more. With a core pair in the middle, each distribution pair needs only <b>4</b> links (two switches, each to both core switches): 6 x 4 = <b>24</b> links, and building seven adds just 4. Routing adjacencies drop the same way.</p></div>
<p>A common rule of thumb is to introduce a dedicated core once you have more than two or three distribution blocks, or when the campus spans several buildings, or when you need one clean meeting point for the data centre, WAN and internet edge.</p>

<h3>Two-tier: the collapsed core</h3>
<p>In a <b>collapsed-core</b> design the core and distribution functions run on the same pair of switches. Access switches uplink to the pair; the pair also connects to the WAN routers, firewalls or a small server room. This is the right design for a single building or a medium site: fewer boxes, less cabling, less cost, and still fully redundant if built in pairs. In the lab, DS1 and DS2 are a collapsed core: they are the default gateways for VLANs 10 and 20 (distribution role) and route towards R1 and the data centre (core role).</p>
<p>The trade-offs: the collapsed pair carries both user-facing policy and core transport, so a mistake there affects everything; scaling to many buildings eventually brings back the full-mesh problem; and upgrades must be planned more carefully because there is no separate core to carry traffic.</p>

<h3>Summarise at the distribution layer</h3>
<p>Hierarchy pays off in routing. If each building uses one block of addresses, its distribution pair can advertise a single summary to the core. In OSPF, with the building in its own area and the distribution switches as ABRs:</p>
<pre class="code"><span class="c">! On each distribution switch acting as ABR for area 1</span>
router ospf 1
 area 1 range 10.1.0.0 255.255.0.0</pre>
<pre class="out">CORE1# show ip route ospf
<span class="hl">O IA     10.1.0.0/16 [110/3] via 10.0.11.2, 00:05:12, TenGigabitEthernet1/0/1</span>
                     [110/3] via 10.0.12.2, 00:05:12, TenGigabitEthernet1/0/2</pre>
<p>A user subnet flapping inside the building no longer triggers SPF recalculation across the whole campus. The multi-area OSPF module covers the details.</p>

<div class="warn"><p><b>Common mistakes.</b> Attaching servers or users directly to core switches "because there were free ports". Putting heavy ACLs or NAT in the core. Building a collapsed core with a single switch, which creates a single point of failure for the whole site.</p></div>

<div class="exam"><p><b>Exam trap.</b> A collapsed core merges <b>distribution and core</b>, not access and distribution. When a question describes a small site where one pair of switches provides gateways and connects to the WAN, the answer is two-tier/collapsed core.</p></div>

<div class="scn"><h4>Building five broke the budget</h4><p>A company grew from one office building to four, each with its own collapsed-core pair, and connected the pairs in a full mesh. When the fifth building was approved, the plan needed eight new fibre runs, four new routing adjacencies per switch, and changes on every existing pair. The architect proposed a core pair in the main data room instead. New buildings now connect with four links to the core, existing pairs were migrated one at a time, and OSPF summarisation at each building cut the routing table in the core from hundreds of routes to a handful.</p><p><b>Lesson:</b> a collapsed core is perfect until you have several of them; then a dedicated core restores modularity.</p></div>

<div class="iv"><p class="q">"When would you choose a two-tier collapsed core instead of a three-tier design?"</p><p>For a single building or a small-to-medium site where one pair of switches can provide the gateways and connect to the WAN, data centre and internet edge. It saves cost and cabling while keeping redundancy. Move to three-tier when there are several distribution blocks or buildings, because a core avoids the full mesh, gives one meeting point for the other modules and keeps each block's failures local. Mention the n(n-1)/2 link growth.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Access connects devices, distribution is the L2/L3 and policy boundary, core is fast Layer 3 transport.</li>
<li>Keep the core simple: no users, no heavy policy, fast convergence.</li>
<li>A core avoids the n(n-1)/2 full mesh once there are several distribution blocks.</li>
<li>Collapsed core (two-tier) merges distribution and core; ideal for one building or a medium site.</li>
<li>Summarise each block at the distribution layer to contain routing churn.</li>
</ul></div>
`,hi:`
<p>Ek bade railway network ke baare mein socho. Local trains har chhote station par rukti hain (access). Kai local lines ek junction par milti hain jahan passengers train badalte hain aur tickets check hote hain (distribution). Junctions express trains se jude hote hain jo chhote stations par kabhi nahi rukti (core). Lekin ek chhote town ko express line ki zaroorat nahi: ek junction jo main station ka kaam bhi kare, kaafi hai. Yahi fark hai <b>three-tier</b> campus aur <b>two-tier (collapsed-core)</b> campus mein.</p>

<h3>Teen layers aur unke kaam</h3>
<table class="cmp"><tr><th>Layer</th><th>Main kaam</th><th>Typical features</th></tr>
<tr><td><b>Access</b></td><td>End devices ko jodna: PCs, phones, APs, printers, cameras</td><td>VLANs, PoE, 802.1X, port security, DHCP snooping, dynamic ARP inspection, QoS trust boundary, PortFast aur BPDU guard</td></tr>
<tr><td><b>Distribution</b></td><td>Access switches ko aggregate karna; Layer 2/Layer 3 boundary</td><td>SVIs aur FHRP gateways, STP root, route summarisation, ACLs aur policy, core tak redundant uplinks</td></tr>
<tr><td><b>Core</b></td><td>Distribution blocks, data centre, WAN aur internet edge ke beech tez, reliable transport</td><td>Sirf Layer 3, high-speed links, fast convergence, kam se kam policy, koi user attached nahi</td></tr>
</table>
<p>Core jaan-boojhkar simple rakha jaata hai. Jo bhi cheez CPU khaaye ya risk badhaye (complex ACLs, NAT, packet inspection) woh distribution layer ya internet edge jaise dedicated blocks mein jaati hai. Core switch ko ek hi kaam karna chahiye: blocks ke beech packets ko jitna tez aur reliable ho sake utna move karna.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Three-tier vs two-tier campus">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">Three-tier</text>
<rect x="95" y="35" width="55" height="30" rx="6" fill="#fde68a"/><text x="122" y="55" text-anchor="middle" class="svg-ink" font-size="12">Core</text>
<rect x="170" y="35" width="55" height="30" rx="6" fill="#fde68a"/><text x="197" y="55" text-anchor="middle" class="svg-ink" font-size="12">Core</text>
<rect x="20" y="110" width="55" height="30" rx="6" fill="#bae6fd"/><text x="47" y="130" text-anchor="middle" class="svg-ink" font-size="12">Dist</text>
<rect x="85" y="110" width="55" height="30" rx="6" fill="#bae6fd"/><text x="112" y="130" text-anchor="middle" class="svg-ink" font-size="12">Dist</text>
<rect x="180" y="110" width="55" height="30" rx="6" fill="#bae6fd"/><text x="207" y="130" text-anchor="middle" class="svg-ink" font-size="12">Dist</text>
<rect x="245" y="110" width="55" height="30" rx="6" fill="#bae6fd"/><text x="272" y="130" text-anchor="middle" class="svg-ink" font-size="12">Dist</text>
<rect x="30" y="190" width="100" height="30" rx="6" fill="#bbf7d0"/><text x="80" y="210" text-anchor="middle" class="svg-ink" font-size="12">Access bldg A</text>
<rect x="190" y="190" width="100" height="30" rx="6" fill="#bbf7d0"/><text x="240" y="210" text-anchor="middle" class="svg-ink" font-size="12">Access bldg B</text>
<line x1="122" y1="65" x2="47" y2="110" stroke="#64748b"/><line x1="122" y1="65" x2="112" y2="110" stroke="#64748b"/><line x1="122" y1="65" x2="207" y2="110" stroke="#64748b"/><line x1="122" y1="65" x2="272" y2="110" stroke="#64748b"/>
<line x1="197" y1="65" x2="47" y2="110" stroke="#64748b"/><line x1="197" y1="65" x2="112" y2="110" stroke="#64748b"/><line x1="197" y1="65" x2="207" y2="110" stroke="#64748b"/><line x1="197" y1="65" x2="272" y2="110" stroke="#64748b"/>
<line x1="47" y1="140" x2="80" y2="190" stroke="#64748b"/><line x1="112" y1="140" x2="80" y2="190" stroke="#64748b"/><line x1="207" y1="140" x2="240" y2="190" stroke="#64748b"/><line x1="272" y1="140" x2="240" y2="190" stroke="#64748b"/>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">Two-tier (collapsed core)</text>
<rect x="400" y="90" width="70" height="36" rx="6" fill="#fde68a"/><text x="435" y="113" text-anchor="middle" class="svg-ink" font-size="12">DS1</text>
<rect x="500" y="90" width="70" height="36" rx="6" fill="#fde68a"/><text x="535" y="113" text-anchor="middle" class="svg-ink" font-size="12">DS2</text>
<text x="485" y="80" text-anchor="middle" class="svg-muted" font-size="12">core + distribution</text>
<rect x="435" y="190" width="100" height="30" rx="6" fill="#bbf7d0"/><text x="485" y="210" text-anchor="middle" class="svg-ink" font-size="12">AS1</text>
<line x1="470" y1="108" x2="500" y2="108" stroke="#64748b" stroke-width="3"/><line x1="435" y1="126" x2="470" y2="190" stroke="#64748b"/><line x1="535" y1="126" x2="500" y2="190" stroke="#64748b"/>
</svg><p class="cap">Kai distribution blocks hone par three-tier ek core pair jodta hai. Two-tier core aur distribution ko ek pair mein merge karta hai, jaisa is module ke lab mein.</p></div>

<h3>Alag core kyun? Full-mesh problem</h3>
<p>Core ke bina har distribution block ko har doosre block se aur WAN, data centre aur internet edge se seedha judna padta hai. Block-to-block connections ki sankhya n(n-1)/2 ki tarah badhti hai.</p>
<div class="eg"><p><b>Worked example.</b> Chhe building distribution pairs ko full mesh karne ke liye 6 x 5 / 2 = <b>15</b> pair-to-pair connections chahiye. Agar har connection chaar links ka ho (har switch doosre pair ke har switch se), to <b>60</b> fibres, aur saatvi building 24 aur jodti hai. Beech mein core pair ho to har distribution pair ko sirf <b>4</b> links chahiye (do switches, har ek dono core switches tak): 6 x 4 = <b>24</b> links, aur saatvi building sirf 4 jodti hai. Routing adjacencies bhi isi tarah kam hoti hain.</p></div>
<p>Common thumb rule: jab do-teen se zyada distribution blocks hon, ya campus kai buildings mein faila ho, ya data centre, WAN aur internet edge ke liye ek saaf meeting point chahiye, tab dedicated core laao.</p>

<h3>Two-tier: collapsed core</h3>
<p><b>Collapsed-core</b> design mein core aur distribution functions same switch pair par chalte hain. Access switches pair tak uplink karte hain; pair WAN routers, firewalls ya chhote server room se bhi judta hai. Single building ya medium site ke liye yahi sahi design hai: kam boxes, kam cabling, kam cost, aur pairs mein bana ho to poori tarah redundant. Lab mein DS1 aur DS2 collapsed core hain: woh VLANs 10 aur 20 ke default gateways hain (distribution role) aur R1 aur data centre ki taraf route karte hain (core role).</p>
<p>Trade-offs: collapsed pair user-facing policy aur core transport dono uthata hai, isliye wahan ki galti sab kuch affect karti hai; kai buildings tak scale karne par full-mesh problem wapas aa jaati hai; aur upgrades zyada dhyan se plan karne padte hain kyunki traffic uthane ke liye alag core nahi hota.</p>

<h3>Distribution layer par summarise karo</h3>
<p>Hierarchy ka fayda routing mein milta hai. Agar har building addresses ka ek block use kare, to uska distribution pair core ko ek hi summary advertise kar sakta hai. OSPF mein, building apne area mein ho aur distribution switches ABRs hon:</p>
<pre class="code"><span class="c">! Area 1 ke ABR wale har distribution switch par</span>
router ospf 1
 area 1 range 10.1.0.0 255.255.0.0</pre>
<pre class="out">CORE1# show ip route ospf
<span class="hl">O IA     10.1.0.0/16 [110/3] via 10.0.11.2, 00:05:12, TenGigabitEthernet1/0/1</span>
                     [110/3] via 10.0.12.2, 00:05:12, TenGigabitEthernet1/0/2</pre>
<p>Building ke andar flap karta user subnet ab poore campus mein SPF recalculation trigger nahi karta. Multi-area OSPF module details cover karta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> "Free ports the isliye" servers ya users ko seedha core switches par lagana. Core mein heavy ACLs ya NAT daalna. Single switch se collapsed core banana, jo poori site ka single point of failure ban jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Collapsed core <b>distribution aur core</b> ko merge karta hai, access aur distribution ko nahi. Jab question chhoti site describe kare jahan ek switch pair gateways deta hai aur WAN se judta hai, answer two-tier/collapsed core hai.</p></div>

<div class="scn"><h4>Paanchvi building ne budget tod diya</h4><p>Ek company ek office building se chaar tak badhi, har ek ka apna collapsed-core pair, aur pairs ko full mesh mein joda. Jab paanchvi building approve hui, plan ko aath naye fibre runs, har switch par chaar nayi routing adjacencies, aur har existing pair par changes chahiye the. Architect ne iski jagah main data room mein core pair propose kiya. Nayi buildings ab core tak chaar links se judti hain, existing pairs ek-ek karke migrate hue, aur har building par OSPF summarisation ne core ki routing table ko sainkdon routes se kuch hi routes tak kar diya.</p><p><b>Seekh:</b> collapsed core perfect hai jab tak aapke paas kai na hon; phir dedicated core modularity wapas laata hai.</p></div>

<div class="iv"><p class="q">"Three-tier design ki jagah two-tier collapsed core kab chunoge?"</p><p>Single building ya small-to-medium site ke liye jahan ek switch pair gateways de sake aur WAN, data centre aur internet edge se jud sake. Isse cost aur cabling bachti hai aur redundancy bani rehti hai. Jab kai distribution blocks ya buildings hon tab three-tier par jao, kyunki core full mesh se bachata hai, baaki modules ke liye ek meeting point deta hai aur har block ke failures local rakhta hai. n(n-1)/2 link growth ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Access devices jodta hai, distribution L2/L3 aur policy boundary hai, core tez Layer 3 transport hai.</li>
<li>Core simple rakho: koi users nahi, heavy policy nahi, fast convergence.</li>
<li>Kai distribution blocks hone par core n(n-1)/2 full mesh se bachata hai.</li>
<li>Collapsed core (two-tier) distribution aur core ko merge karta hai; ek building ya medium site ke liye ideal.</li>
<li>Routing churn contain karne ke liye har block ko distribution layer par summarise karo.</li>
</ul></div>
`}};export{e as default};