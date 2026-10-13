var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Airline pilots are experts, yet they still run a checklist before every flight, because under pressure memory skips steps. Use this chapter the same way: before the exam, before an interview, and before you touch OSPF on a production router. If you can do everything in the first list without notes, you are ready.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="From configuration to a route in the table">
<rect x="5" y="40" width="95" height="56" rx="8" fill="#e2e8f0"/><text x="52" y="64" text-anchor="middle" class="svg-ink" font-size="12">Interface</text><text x="52" y="82" text-anchor="middle" class="svg-muted" font-size="11">enabled</text>
<rect x="112" y="40" width="95" height="56" rx="8" fill="#fed7aa"/><text x="159" y="64" text-anchor="middle" class="svg-ink" font-size="12">Hellos</text><text x="159" y="82" text-anchor="middle" class="svg-muted" font-size="11">match</text>
<rect x="219" y="40" width="95" height="56" rx="8" fill="#bae6fd"/><text x="266" y="64" text-anchor="middle" class="svg-ink" font-size="12">Adjacency</text><text x="266" y="82" text-anchor="middle" class="svg-muted" font-size="11">FULL</text>
<rect x="326" y="40" width="95" height="56" rx="8" fill="#ddd6fe"/><text x="373" y="64" text-anchor="middle" class="svg-ink" font-size="12">LSDB</text><text x="373" y="82" text-anchor="middle" class="svg-muted" font-size="11">identical</text>
<rect x="433" y="40" width="95" height="56" rx="8" fill="#fde68a"/><text x="480" y="64" text-anchor="middle" class="svg-ink" font-size="12">SPF</text><text x="480" y="82" text-anchor="middle" class="svg-muted" font-size="11">lowest cost</text>
<rect x="540" y="40" width="95" height="56" rx="8" fill="#bbf7d0"/><text x="587" y="64" text-anchor="middle" class="svg-ink" font-size="12">Route</text><text x="587" y="82" text-anchor="middle" class="svg-muted" font-size="11">O [110/x]</text>
<line x1="100" y1="68" x2="112" y2="68" stroke="#64748b" stroke-width="2"/><line x1="207" y1="68" x2="219" y2="68" stroke="#64748b" stroke-width="2"/><line x1="314" y1="68" x2="326" y2="68" stroke="#64748b" stroke-width="2"/><line x1="421" y1="68" x2="433" y2="68" stroke="#64748b" stroke-width="2"/><line x1="528" y1="68" x2="540" y2="68" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Every OSPF fault breaks one of these six links in the chain</text>
</svg><p class="cap">The whole module in one line: enable, match, synchronise, compute, install.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain IGP versus EGP, distance vector versus link state, and why OSPF has AD 110.</li>
<li>Name the three OSPF tables and the five packet types, with 224.0.0.5, 224.0.0.6 and protocol 89.</li>
<li>Predict a router ID, set it, and apply it with <code>clear ip ospf process</code>.</li>
<li>List every neighbour requirement, and say which mismatch gives which symptom.</li>
<li>Walk through Down, Init, 2-Way, ExStart, Exchange, Loading, Full.</li>
<li>Predict the DR and BDR from priorities and RIDs, and explain non-preemption.</li>
<li>Choose broadcast or point-to-point, and read type 1 and type 2 LSAs in the database.</li>
<li>Calculate cost, change the reference bandwidth, and run SPF by hand.</li>
<li>Configure OSPF with network statements and with <code>ip ospf area</code>, plus passive interfaces and a default route.</li>
<li>Troubleshoot hop by hop, as in ticket NK-4521.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>LSA</dt><dd>Link-state advertisement: one router's (type 1) or one segment's (type 2) description, flooded through the area.</dd>
<dt>LSDB</dt><dd>The collection of all LSAs in an area; identical on every router in that area.</dd>
<dt>SPF</dt><dd>Dijkstra's shortest path first algorithm, run by each router with itself as root.</dd>
<dt>Router ID</dt><dd>Unique 32-bit name of an OSPF router, in dotted decimal.</dd>
<dt>Adjacency</dt><dd>A neighbour relationship that has reached FULL, with synchronised databases.</dd>
<dt>DR / BDR / DROTHER</dt><dd>Designated router, its backup, and every other router on a broadcast segment.</dd>
<dt>ABR / ASBR</dt><dd>Router between areas / router injecting external routes such as a default.</dd>
<dt>Passive interface</dt><dd>Advertised in OSPF, but sends no Hellos, so it forms no neighbours.</dd>
<dt>Reference bandwidth</dt><dd>The numerator of the cost formula; 100 Mbps by default.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Identity</td><td>Link state, open standard, AD 110, IP protocol 89, metric = cost</td></tr>
<tr><td>Multicast</td><td>224.0.0.5 all OSPF routers; 224.0.0.6 DR and BDR</td></tr>
<tr><td>Timers</td><td>Hello 10, dead 40 on broadcast and point-to-point</td></tr>
<tr><td>Router ID</td><td>Command, then highest up loopback, then highest up interface</td></tr>
<tr><td>DR election</td><td>Highest priority (default 1, 0 = never), then highest RID; non-preemptive</td></tr>
<tr><td>Cost</td><td>100 Mbps ÷ bandwidth, minimum 1; Gigabit and FastEthernet both 1 by default</td></tr>
<tr><td>States</td><td>EXSTART/EXCHANGE stuck = MTU; 2WAY between DROTHERs = normal</td></tr>
<tr><td>Route codes</td><td><code>O</code> intra-area, <code>O IA</code> inter-area, <code>O*E2</code> default from <code>default-information originate</code></td></tr>
</table>

<h3>Exam traps in one place</h3>
<ul>
<li>A new <code>router-id</code> does nothing until <code>clear ip ospf process</code> or a reload.</li>
<li>Duplicate router IDs log <code>%OSPF-4-DUP_RTRID_NBR</code> and block the adjacency.</li>
<li>The process ID does not need to match; the area ID does.</li>
<li>A passive transit link kills its neighbour with no error message.</li>
<li>Changing the Hello interval on one side changes its dead interval too and drops the neighbour when the dead timer expires.</li>
<li>Priority 0 on every router of a segment: no DR, everyone stuck at 2WAY, no routes.</li>
<li>A loopback is advertised as a /32 unless its network type is point-to-point.</li>
<li><code>default-information originate</code> needs a default route in the table unless <code>always</code> is used.</li>
<li>A floating static backing up OSPF needs an AD above 110.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Build</span>
router ospf 1
 router-id 1.1.1.1
 auto-cost reference-bandwidth 10000
 network 10.0.12.0 0.0.0.3 area 0
 passive-interface Loopback0
 default-information originate
interface GigabitEthernet0/0
 ip ospf 1 area 0
 ip ospf network point-to-point
 ip ospf cost 100
 ip ospf priority 0
<span class="c">! Verify</span>
show ip ospf neighbor
show ip ospf interface brief
show ip ospf interface GigabitEthernet0/0
show ip protocols
show ip ospf database
show ip route ospf
clear ip ospf process</pre>

<div class="eg"><p><b>Worked example: a two-minute exam drill.</b> Exhibit: R5 shows neighbour 6.6.6.6 with Pri 0, state <code>2WAY/DROTHER</code>, and R5's own interface is <code>DROTH 0/1</code>. Step 1: 2-Way means Hellos match. Step 2: both are DROTHER, so nobody is DR. Step 3: the neighbour has priority 0 and R5 is not DR either, so R5 must also be priority 0. Answer: set priority 1 or more on one router, or change both ends to point-to-point.</p></div>

<div class="warn"><p><b>Common mistake before the exam.</b> Memorising commands without reading outputs. Most OSPF questions give you an exhibit and ask what is wrong. Practise reading <code>show ip ospf neighbor</code>, <code>show ip ospf interface</code> and <code>show ip route</code> until each column means something to you.</p></div>

<div class="exam"><p><b>Last-minute check.</b> If a question says "neighbours are up but a route is missing", think network statement, passive LAN, or network type mismatch. If it says "neighbour never appears", think area, subnet, timers, authentication, passive or ACL. If it says "stuck", read the state name.</p></div>

<div class="scn"><h4>The fifteen-minute morning check</h4><p>A NOC team at an IT services firm made a habit of a short OSPF health check at the start of each shift: count FULL neighbours on the core routers against a baseline, glance at the SPF execution counter, and compare the number of OSPF routes with yesterday. One morning the SPF counter on the core had jumped by 300 overnight while the neighbour count looked normal. Syslog showed a branch link flapping every few minutes. The team raised a provider ticket before any user noticed, and raised the link's cost so traffic preferred the stable backup.</p><p><b>Lesson:</b> the commands you learned for troubleshooting are also your daily early-warning system.</p></div>

<div class="iv"><p class="q">"Explain OSPF from power-on to a route in the routing table, in two minutes."</p><p>Strong answer: the router picks a router ID, sends Hellos on OSPF interfaces to 224.0.0.5, and forms neighbours when area, subnet, timers, authentication and stub flag match. On Ethernet a DR and BDR are elected. Neighbours exchange DBDs, request missing LSAs and reach FULL with identical LSDBs. Each router runs SPF on the LSDB, adds outgoing interface costs, and installs the lowest-cost routes with AD 110; equal costs load-share. Changes are flooded as new LSAs and SPF reruns. Finish with how you would verify each step with a show command.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPF chain: enable interface, matching Hellos, FULL adjacency, identical LSDB, SPF, route.</li>
<li>Know the numbers: AD 110, protocol 89, 224.0.0.5/6, Hello 10/dead 40, default priority 1, reference 100 Mbps.</li>
<li>Neighbour state names point to causes; EXSTART means MTU.</li>
<li>Configure with network statements or <code>ip ospf area</code>; use passive, point-to-point and a consistent reference bandwidth.</li>
<li>Troubleshoot hop by hop, one change at a time, and prove the fix with a route and a ping.</li>
</ul></div>
`,hi:`
<p>Airline pilots experts hote hain, phir bhi har flight se pehle checklist chalate hain, kyunki pressure mein yaadasht steps chhod deti hai. Is chapter ko aise hi use karo: exam se pehle, interview se pehle, aur production router par OSPF chhoone se pehle. Agar aap pehli list ki har cheez bina notes ke kar sakte ho, to aap ready ho.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Configuration se table mein route tak">
<rect x="5" y="40" width="95" height="56" rx="8" fill="#e2e8f0"/><text x="52" y="64" text-anchor="middle" class="svg-ink" font-size="12">Interface</text><text x="52" y="82" text-anchor="middle" class="svg-muted" font-size="11">enabled</text>
<rect x="112" y="40" width="95" height="56" rx="8" fill="#fed7aa"/><text x="159" y="64" text-anchor="middle" class="svg-ink" font-size="12">Hellos</text><text x="159" y="82" text-anchor="middle" class="svg-muted" font-size="11">match</text>
<rect x="219" y="40" width="95" height="56" rx="8" fill="#bae6fd"/><text x="266" y="64" text-anchor="middle" class="svg-ink" font-size="12">Adjacency</text><text x="266" y="82" text-anchor="middle" class="svg-muted" font-size="11">FULL</text>
<rect x="326" y="40" width="95" height="56" rx="8" fill="#ddd6fe"/><text x="373" y="64" text-anchor="middle" class="svg-ink" font-size="12">LSDB</text><text x="373" y="82" text-anchor="middle" class="svg-muted" font-size="11">identical</text>
<rect x="433" y="40" width="95" height="56" rx="8" fill="#fde68a"/><text x="480" y="64" text-anchor="middle" class="svg-ink" font-size="12">SPF</text><text x="480" y="82" text-anchor="middle" class="svg-muted" font-size="11">lowest cost</text>
<rect x="540" y="40" width="95" height="56" rx="8" fill="#bbf7d0"/><text x="587" y="64" text-anchor="middle" class="svg-ink" font-size="12">Route</text><text x="587" y="82" text-anchor="middle" class="svg-muted" font-size="11">O [110/x]</text>
<line x1="100" y1="68" x2="112" y2="68" stroke="#64748b" stroke-width="2"/><line x1="207" y1="68" x2="219" y2="68" stroke="#64748b" stroke-width="2"/><line x1="314" y1="68" x2="326" y2="68" stroke="#64748b" stroke-width="2"/><line x1="421" y1="68" x2="433" y2="68" stroke="#64748b" stroke-width="2"/><line x1="528" y1="68" x2="540" y2="68" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Har OSPF fault is chain ki chhe kadiyon mein se ek todta hai</text>
</svg><p class="cap">Poora module ek line mein: enable, match, synchronise, compute, install.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>IGP versus EGP, distance vector versus link state samjhao, aur OSPF ka AD 110 kyun hai.</li>
<li>Teen OSPF tables aur paanch packet types ke naam lo, 224.0.0.5, 224.0.0.6 aur protocol 89 ke saath.</li>
<li>Router ID predict karo, set karo, aur <code>clear ip ospf process</code> se lagu karo.</li>
<li>Har neighbour requirement list karo, aur batao kaunsa mismatch kaunsa symptom deta hai.</li>
<li>Down, Init, 2-Way, ExStart, Exchange, Loading, Full samjhao.</li>
<li>Priorities aur RIDs se DR aur BDR predict karo, aur non-preemption samjhao.</li>
<li>Broadcast ya point-to-point chuno, aur database mein type 1 aur type 2 LSAs padho.</li>
<li>Cost calculate karo, reference bandwidth badlo, aur SPF haath se chalao.</li>
<li>Network statements aur <code>ip ospf area</code> dono se OSPF configure karo, passive interfaces aur default route ke saath.</li>
<li>Ticket NK-4521 ki tarah hop by hop troubleshoot karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>LSA</dt><dd>Link-state advertisement: ek router ka (type 1) ya ek segment ka (type 2) description, jo area mein flood hota hai.</dd>
<dt>LSDB</dt><dd>Area ke saare LSAs ka collection; us area ke har router par identical.</dd>
<dt>SPF</dt><dd>Dijkstra ka shortest path first algorithm, jise har router khud ko root maan kar chalata hai.</dd>
<dt>Router ID</dt><dd>OSPF router ka unique 32-bit naam, dotted decimal mein.</dd>
<dt>Adjacency</dt><dd>Neighbour relationship jo FULL tak pahunch gaya ho, synchronised databases ke saath.</dd>
<dt>DR / BDR / DROTHER</dt><dd>Designated router, uska backup, aur broadcast segment ka har dusra router.</dd>
<dt>ABR / ASBR</dt><dd>Areas ke beech ka router / default jaise external routes daalne wala router.</dd>
<dt>Passive interface</dt><dd>OSPF mein advertise hota hai, lekin Hellos nahi bhejta, isliye koi neighbour nahi banata.</dd>
<dt>Reference bandwidth</dt><dd>Cost formula ka numerator; default 100 Mbps.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Pehchaan</td><td>Link state, open standard, AD 110, IP protocol 89, metric = cost</td></tr>
<tr><td>Multicast</td><td>224.0.0.5 saare OSPF routers; 224.0.0.6 DR aur BDR</td></tr>
<tr><td>Timers</td><td>Broadcast aur point-to-point par Hello 10, dead 40</td></tr>
<tr><td>Router ID</td><td>Command, phir sabse bada up loopback, phir sabse bada up interface</td></tr>
<tr><td>DR election</td><td>Sabse zyada priority (default 1, 0 = kabhi nahi), phir sabse bada RID; non-preemptive</td></tr>
<tr><td>Cost</td><td>100 Mbps ÷ bandwidth, minimum 1; default mein Gigabit aur FastEthernet dono 1</td></tr>
<tr><td>States</td><td>EXSTART/EXCHANGE mein atka = MTU; DROTHERs ke beech 2WAY = normal</td></tr>
<tr><td>Route codes</td><td><code>O</code> intra-area, <code>O IA</code> inter-area, <code>O*E2</code> <code>default-information originate</code> se aaya default</td></tr>
</table>

<h3>Saare exam traps ek jagah</h3>
<ul>
<li>Naya <code>router-id</code> tab tak kuch nahi karta jab tak <code>clear ip ospf process</code> ya reload na ho.</li>
<li>Duplicate router IDs <code>%OSPF-4-DUP_RTRID_NBR</code> log karte hain aur adjacency rok dete hain.</li>
<li>Process ID match hona zaroori nahi; area ID zaroori hai.</li>
<li>Passive transit link apne neighbour ko bina error message ke khatam kar deta hai.</li>
<li>Ek side par Hello interval badalne se uska dead interval bhi badalta hai aur dead timer khatam hone par neighbour gir jaata hai.</li>
<li>Segment ke har router par priority 0: koi DR nahi, sab 2WAY par atke, koi routes nahi.</li>
<li>Loopback /32 ke roop mein advertise hota hai jab tak uska network type point-to-point na ho.</li>
<li><code>default-information originate</code> ko table mein default route chahiye jab tak <code>always</code> use na ho.</li>
<li>OSPF ko back up karne wale floating static ka AD 110 se upar hona chahiye.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Build</span>
router ospf 1
 router-id 1.1.1.1
 auto-cost reference-bandwidth 10000
 network 10.0.12.0 0.0.0.3 area 0
 passive-interface Loopback0
 default-information originate
interface GigabitEthernet0/0
 ip ospf 1 area 0
 ip ospf network point-to-point
 ip ospf cost 100
 ip ospf priority 0
<span class="c">! Verify</span>
show ip ospf neighbor
show ip ospf interface brief
show ip ospf interface GigabitEthernet0/0
show ip protocols
show ip ospf database
show ip route ospf
clear ip ospf process</pre>

<div class="eg"><p><b>Worked example: do minute ki exam drill.</b> Exhibit: R5 neighbour 6.6.6.6 ko Pri 0, state <code>2WAY/DROTHER</code> ke saath dikhata hai, aur R5 ka apna interface <code>DROTH 0/1</code> hai. Step 1: 2-Way matlab Hellos match karte hain. Step 2: dono DROTHER hain, isliye koi DR nahi. Step 3: neighbour ki priority 0 hai aur R5 bhi DR nahi, isliye R5 bhi priority 0 hoga. Answer: kisi ek router par priority 1 ya zyada set karo, ya dono ends ko point-to-point karo.</p></div>

<div class="warn"><p><b>Exam se pehle common galti.</b> Outputs padhe bina commands ratna. Zyada tar OSPF questions exhibit dete hain aur poochte hain ki kya galat hai. <code>show ip ospf neighbor</code>, <code>show ip ospf interface</code> aur <code>show ip route</code> padhne ki practice tab tak karo jab tak har column ka matlab samajh na aaye.</p></div>

<div class="exam"><p><b>Last-minute check.</b> Agar question kahe "neighbours up hain lekin ek route missing hai", to network statement, passive LAN, ya network type mismatch socho. Agar kahe "neighbour kabhi dikhta hi nahi", to area, subnet, timers, authentication, passive ya ACL socho. Agar kahe "atka hua", to state ka naam padho.</p></div>

<div class="scn"><h4>Pandrah minute ka subah ka check</h4><p>Ek IT services firm ki NOC team ne har shift ki shuruaat mein chhota OSPF health check aadat bana liya: core routers par FULL neighbours ko baseline se ginna, SPF execution counter par nazar daalna, aur OSPF routes ki ginti kal se compare karna. Ek subah core par SPF counter raat bhar mein 300 badh gaya tha jabki neighbour count normal dikh raha tha. Syslog mein ek branch link har kuch minute flap karta dikha. Team ne kisi user ke notice karne se pehle provider ticket raise kiya, aur link ki cost badhayi taaki traffic stable backup ko prefer kare.</p><p><b>Seekh:</b> troubleshooting ke liye seekhe commands aapka daily early-warning system bhi hain.</p></div>

<div class="iv"><p class="q">"Power-on se routing table mein route tak OSPF do minute mein samjhao."</p><p>Strong answer: router ek router ID chunta hai, OSPF interfaces par 224.0.0.5 ko Hellos bhejta hai, aur area, subnet, timers, authentication aur stub flag match hone par neighbours banata hai. Ethernet par DR aur BDR elect hote hain. Neighbours DBDs exchange karte hain, missing LSAs maangte hain aur identical LSDBs ke saath FULL tak pahunchte hain. Har router LSDB par SPF chalata hai, outgoing interface costs jodta hai, aur lowest-cost routes AD 110 ke saath install karta hai; barabar costs load-share karti hain. Changes naye LSAs ke roop mein flood hote hain aur SPF dobara chalta hai. Aakhir mein batao ki har step ko kis show command se verify karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPF chain: interface enable, matching Hellos, FULL adjacency, identical LSDB, SPF, route.</li>
<li>Numbers yaad rakho: AD 110, protocol 89, 224.0.0.5/6, Hello 10/dead 40, default priority 1, reference 100 Mbps.</li>
<li>Neighbour state ke naam causes ki taraf ishara karte hain; EXSTART matlab MTU.</li>
<li>Network statements ya <code>ip ospf area</code> se configure karo; passive, point-to-point aur consistent reference bandwidth use karo.</li>
<li>Hop by hop troubleshoot karo, ek baar mein ek change, aur route aur ping se fix prove karo.</li>
</ul></div>
`}};export{e as default};