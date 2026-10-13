var e={id:`design-thinking`,h:{en:`Thinking like a designer: requirements, failure domains, convergence`,hi:`Designer ki tarah sochna: requirements, failure domains, convergence`},body:{en:`
<p>Professional-level questions often start with a requirement: "the branch must keep working if one uplink fails", "voice must not be delayed by backups", "no single device may carry all transit traffic". You are expected to turn the requirement into a choice of feature. This chapter gives you a simple way to do that.</p>

<h3>The four-step design habit</h3>
<ol>
<li><b>Requirement.</b> What must be true? Write it as a testable sentence.</li>
<li><b>Failure domain.</b> What can fail, and how far does the damage spread? A link, a router, an area, a site.</li>
<li><b>Mechanism.</b> Which feature gives the behaviour? Equal-cost paths, an area boundary, a policy, a scheduler, a spanning-tree root.</li>
<li><b>Proof.</b> Which show command proves it works, before and after a failure?</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Three-tier campus with redundancy">
<rect x="250" y="20" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">Core: R1  R2</text>
<line x1="270" y1="64" x2="150" y2="110" stroke="#64748b" stroke-width="2"/><line x1="270" y1="64" x2="470" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="370" y1="64" x2="170" y2="110" stroke="#64748b" stroke-width="2"/><line x1="370" y1="64" x2="490" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="80" y="110" width="140" height="44" rx="8" fill="#bae6fd"/><text x="150" y="136" text-anchor="middle" class="svg-ink" font-size="13">Distribution A</text>
<rect x="420" y="110" width="140" height="44" rx="8" fill="#bae6fd"/><text x="490" y="136" text-anchor="middle" class="svg-ink" font-size="13">Distribution B</text>
<line x1="130" y1="154" x2="90" y2="200" stroke="#64748b" stroke-width="2"/><line x1="170" y1="154" x2="210" y2="200" stroke="#64748b" stroke-width="2"/>
<line x1="470" y1="154" x2="430" y2="200" stroke="#64748b" stroke-width="2"/><line x1="510" y1="154" x2="550" y2="200" stroke="#64748b" stroke-width="2"/>
<rect x="40" y="200" width="100" height="36" rx="8" fill="#bbf7d0"/><text x="90" y="223" text-anchor="middle" class="svg-ink" font-size="12">Access 1</text>
<rect x="160" y="200" width="100" height="36" rx="8" fill="#bbf7d0"/><text x="210" y="223" text-anchor="middle" class="svg-ink" font-size="12">Access 2</text>
<rect x="380" y="200" width="100" height="36" rx="8" fill="#bbf7d0"/><text x="430" y="223" text-anchor="middle" class="svg-ink" font-size="12">Access 3</text>
<rect x="500" y="200" width="100" height="36" rx="8" fill="#bbf7d0"/><text x="550" y="223" text-anchor="middle" class="svg-ink" font-size="12">Access 4</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="11">every device has two ways up</text>
</svg><p class="cap">A typical hierarchy: every lower device has two upward paths, so one failure never isolates a block.</p></div>

<h3>Failure domains and why areas exist</h3>
<p>A link-state protocol floods every change to every router in the same flooding scope. In a flat design a flapping access link makes every router in the company run SPF. Areas (OSPF) and levels (IS-IS) shrink the flooding scope: the change stays inside the area and only a summary or a leaked route crosses the border. Smaller failure domains give faster, calmer convergence. The price is design effort: you must plan the area border, the summaries and the paths that cross it.</p>

<h3>Convergence versus stability</h3>
<p>Faster is not always better. Aggressive timers detect failures quickly, but also react to a brief glitch. Junos IGPs wait a short <b>SPF delay</b> and apply a hold-down so that a burst of changes causes one calculation. The simulator shows the defaults in <code>show isis overview</code>: SPF delay 200 msec, SPF holddown 5000 msec, SPF rapid runs 3. As a designer you choose where to be fast (core links, with BFD) and where to be patient (unstable access links).</p>

<h3>Design choices you will meet in this course</h3>
<table class="cmp"><tr><th>Requirement</th><th>Typical mechanism</th><th>Module</th></tr>
<tr><td>Keep the table small at the edge</td><td>Area summaries, stub areas, IS-IS L1 areas</td><td>OSPF, IS-IS</td></tr>
<tr><td>Take a router out of the path for maintenance</td><td>Overload bit</td><td>OSPF, IS-IS</td></tr>
<tr><td>Control which routes enter a protocol</td><td>Export and import policy, tags</td><td>OSPF, IS-IS, BGP</td></tr>
<tr><td>Choose the best exit per destination</td><td>Route leaking, metrics, BGP attributes</td><td>IS-IS, BGP</td></tr>
<tr><td>Voice before backups</td><td>Forwarding classes, schedulers</td><td>CoS</td></tr></table>

<h3>Addressing is part of the design</h3>
<p>Use one loopback per router as its identity, /32 for IPv4, and use it for router IDs and for IBGP peering. Use /30 or /31 on point-to-point links. Keep addresses aggregatable by site, so a summary is possible later. In this course every router has a loopback such as 10.255.4.2/32 and links such as 10.4.12.0/30.</p>
<pre class="code"><span class="c">! One loopback is the router identity</span>
set interfaces lo0 unit 0 family inet address 10.255.4.2/32
set routing-options router-id 10.255.4.2
<span class="c">! Point-to-point links are small subnets</span>
set interfaces ge-0/0/0 unit 0 family inet address 10.4.12.2/30</pre>

<div class="eg"><p><b>Worked example.</b> Requirement: "Maintenance on R2 must not drop calls." Failure domain: transit through R2 only. Mechanism: overload on R2, with a second path through R3 already present. Proof: <code>show route</code> on R1 for the server prefix shows one next hop before overload and only the R3 next hop after, and a ping to R2's own loopback still works. You will build exactly this in the OSPF module.</p></div>

<div class="warn"><p><b>Common mistake.</b> Designing for the happy path only. Always ask what happens when the busiest link fails, and check that the remaining path has capacity and a route.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Redundant" does not mean "load balanced". Two links with different metrics give a backup, not two active paths. Equal cost is needed for equal-cost multipath.</p></div>

<div class="scn"><h4>The flat network that melted</h4><p>A growing company ran one OSPF area for thirty routers. A faulty optic on one branch link flapped every few seconds. Every router recalculated SPF constantly and the core CPU stayed high. The fix was not a faster router. The team moved branches into their own areas with summaries, so the flapping stayed local.</p><p><b>Lesson:</b> shrink the failure domain before you buy more hardware.</p></div>

<div class="iv"><p class="q">"Why would you split an IGP into areas or levels?"</p><p>To limit the flooding and SPF scope so a change in one place does not make every router recompute, to shrink routing tables with summaries, and to give a clear structure. Mention the trade-offs: more planning, possible suboptimal routing across borders, and the need for a contiguous backbone or level 2.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use the four steps: requirement, failure domain, mechanism, proof.</li>
<li>Areas and levels shrink failure domains and routing tables.</li>
<li>Faster convergence is a trade-off with stability.</li>
<li>One /32 loopback per router is the stable identity; plan addresses to summarise.</li>
<li>Redundant paths need routes, capacity and the right metrics to be useful.</li>
</ul></div>
`,hi:`
<p>Professional-level sawal aksar requirement se shuru hote hain: "ek uplink fail ho to branch chalta rahe", "backups voice ko delay na karein", "koi ek device saara transit traffic na dhoe". Aapse umeed hai ki requirement ko feature ke choice mein badlo. Yeh chapter aisa karne ka saral tareeka deta hai.</p>

<h3>Design ki chaar-step aadat</h3>
<ol>
<li><b>Requirement.</b> Kya sach hona chahiye? Ise testable vakya mein likho.</li>
<li><b>Failure domain.</b> Kya fail ho sakta hai, aur nuksan kitna door tak failta hai? Link, router, area, site.</li>
<li><b>Mechanism.</b> Kaunsa feature yeh behaviour deta hai? Equal-cost paths, area boundary, policy, scheduler, spanning-tree root.</li>
<li><b>Proof.</b> Failure se pehle aur baad kaunsa show command saabit karta hai ki yeh chal raha hai?</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Redundancy ke saath three-tier campus">
<rect x="250" y="20" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">Core: R1  R2</text>
<line x1="270" y1="64" x2="150" y2="110" stroke="#64748b" stroke-width="2"/><line x1="270" y1="64" x2="470" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="370" y1="64" x2="170" y2="110" stroke="#64748b" stroke-width="2"/><line x1="370" y1="64" x2="490" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="80" y="110" width="140" height="44" rx="8" fill="#bae6fd"/><text x="150" y="136" text-anchor="middle" class="svg-ink" font-size="13">Distribution A</text>
<rect x="420" y="110" width="140" height="44" rx="8" fill="#bae6fd"/><text x="490" y="136" text-anchor="middle" class="svg-ink" font-size="13">Distribution B</text>
<line x1="130" y1="154" x2="90" y2="200" stroke="#64748b" stroke-width="2"/><line x1="170" y1="154" x2="210" y2="200" stroke="#64748b" stroke-width="2"/>
<line x1="470" y1="154" x2="430" y2="200" stroke="#64748b" stroke-width="2"/><line x1="510" y1="154" x2="550" y2="200" stroke="#64748b" stroke-width="2"/>
<rect x="40" y="200" width="100" height="36" rx="8" fill="#bbf7d0"/><text x="90" y="223" text-anchor="middle" class="svg-ink" font-size="12">Access 1</text>
<rect x="160" y="200" width="100" height="36" rx="8" fill="#bbf7d0"/><text x="210" y="223" text-anchor="middle" class="svg-ink" font-size="12">Access 2</text>
<rect x="380" y="200" width="100" height="36" rx="8" fill="#bbf7d0"/><text x="430" y="223" text-anchor="middle" class="svg-ink" font-size="12">Access 3</text>
<rect x="500" y="200" width="100" height="36" rx="8" fill="#bbf7d0"/><text x="550" y="223" text-anchor="middle" class="svg-ink" font-size="12">Access 4</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="11">har device ke paas upar jaane ke do raaste</text>
</svg><p class="cap">Typical hierarchy: neeche ke har device ke paas upar ke do paths hain, isliye ek failure kisi block ko isolate nahi karta.</p></div>

<h3>Failure domains aur areas kyun hote hain</h3>
<p>Link-state protocol har change ko same flooding scope ke har router tak flood karta hai. Flat design mein ek flapping access link company ke har router ko SPF chalane par majboor karta hai. Areas (OSPF) aur levels (IS-IS) flooding scope chhota karte hain: change area ke andar rehta hai aur sirf summary ya leaked route border paar karta hai. Chhote failure domains tez aur shaant convergence dete hain. Keemat hai design ki mehnat: area border, summaries aur border paar karne wale paths ki planning karni padti hai.</p>

<h3>Convergence versus stability</h3>
<p>Tez hamesha behtar nahi hota. Aggressive timers failure jaldi pakadte hain, par chhote glitch par bhi react karte hain. Junos IGPs chhota <b>SPF delay</b> rakhte hain aur hold-down lagate hain taaki changes ki bauchhar par ek hi calculation ho. Simulator <code>show isis overview</code> mein defaults dikhata hai: SPF delay 200 msec, SPF holddown 5000 msec, SPF rapid runs 3. Designer ke roop mein aap chunte ho kahan tez rehna hai (core links, BFD ke saath) aur kahan sabr (unstable access links).</p>

<h3>Is course mein milne wale design choices</h3>
<table class="cmp"><tr><th>Requirement</th><th>Typical mechanism</th><th>Module</th></tr>
<tr><td>Edge par table chhota rakhna</td><td>Area summaries, stub areas, IS-IS L1 areas</td><td>OSPF, IS-IS</td></tr>
<tr><td>Maintenance ke liye router ko path se hatana</td><td>Overload bit</td><td>OSPF, IS-IS</td></tr>
<tr><td>Control karna ki kaunse routes protocol mein jaayein</td><td>Export aur import policy, tags</td><td>OSPF, IS-IS, BGP</td></tr>
<tr><td>Har destination ke liye best exit chunna</td><td>Route leaking, metrics, BGP attributes</td><td>IS-IS, BGP</td></tr>
<tr><td>Backups se pehle voice</td><td>Forwarding classes, schedulers</td><td>CoS</td></tr></table>

<h3>Addressing bhi design ka hissa hai</h3>
<p>Har router ke liye ek loopback ko uski pehchaan banao, IPv4 ke liye /32, aur router ID tatha IBGP peering ke liye use karo. Point-to-point links par /30 ya /31 lagao. Addresses ko site ke hisaab se aggregatable rakho taaki baad mein summary ban sake. Is course mein har router ka loopback jaise 10.255.4.2/32 aur links jaise 10.4.12.0/30 hain.</p>
<pre class="code"><span class="c">! Ek loopback router ki pehchaan hai</span>
set interfaces lo0 unit 0 family inet address 10.255.4.2/32
set routing-options router-id 10.255.4.2
<span class="c">! Point-to-point links chhote subnets hain</span>
set interfaces ge-0/0/0 unit 0 family inet address 10.4.12.2/30</pre>

<div class="eg"><p><b>Worked example.</b> Requirement: "R2 par maintenance se calls drop na hon." Failure domain: sirf R2 ke through transit. Mechanism: R2 par overload, aur R3 ke through doosra path pehle se maujood. Proof: R1 par server prefix ka <code>show route</code> overload se pehle ek se zyada next hop dikhata hai aur baad mein sirf R3 wala, aur R2 ke apne loopback ka ping chalta hai. Yahi aap OSPF module mein banaoge.</p></div>

<div class="warn"><p><b>Common mistake.</b> Sirf happy path ke liye design karna. Hamesha poochho ki sabse busy link fail ho to kya hoga, aur check karo ki bacha hua path capacity aur route rakhta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Redundant" ka matlab "load balanced" nahi hai. Alag metrics wale do links backup dete hain, do active paths nahi. Equal-cost multipath ke liye equal cost chahiye.</p></div>

<div class="scn"><h4>Flat network jo pighal gaya</h4><p>Ek badhti company tees routers ke liye ek OSPF area chala rahi thi. Ek branch link ka kharab optic har kuch seconds mein flap karta tha. Har router baar-baar SPF chalata raha aur core CPU high raha. Fix tez router nahi tha. Team ne branches ko apne areas mein summaries ke saath daala, isliye flapping local rahi.</p><p><b>Lesson:</b> hardware kharidne se pehle failure domain chhota karo.</p></div>

<div class="iv"><p class="q">"IGP ko areas ya levels mein kyun baantoge?"</p><p>Flooding aur SPF scope limit karne ke liye taaki ek jagah ka change har router ko recompute na karwaye, summaries se routing tables chhote karne ke liye, aur saaf structure ke liye. Trade-offs batao: zyada planning, borders ke paar suboptimal routing ho sakti hai, aur contiguous backbone ya level 2 chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar steps use karo: requirement, failure domain, mechanism, proof.</li>
<li>Areas aur levels failure domains aur routing tables chhote karte hain.</li>
<li>Tez convergence stability ke saath trade-off hai.</li>
<li>Har router ka ek /32 loopback stable identity hai; summarise karne ke liye addresses plan karo.</li>
<li>Redundant paths ko kaam ka banane ke liye routes, capacity aur sahi metrics chahiye.</li>
</ul></div>
`}};export{e as default};