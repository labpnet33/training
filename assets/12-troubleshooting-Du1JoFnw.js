var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: walking all seven labs as tickets`,hi:`Troubleshooting workflow: saaton labs ko tickets ki tarah chalna`},body:{en:`
<p>A good doctor does not prescribe medicine after the first sentence. She checks pulse, then blood test, then scan, narrowing down with each step. OSPF troubleshooting works the same way. Every problem in this module lives at one of four levels, and one command per level tells you which level you are at: <b>neighbours</b>, <b>database</b>, <b>routing table</b>, <b>forwarding</b>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Four-step OSPF troubleshooting workflow">
<rect x="10" y="30" width="140" height="80" rx="10" fill="#bae6fd"/><text x="80" y="58" text-anchor="middle" class="svg-ink" font-size="13">1. Neighbours</text><text x="80" y="80" text-anchor="middle" class="svg-muted" font-size="12">show ip ospf</text><text x="80" y="96" text-anchor="middle" class="svg-muted" font-size="12">neighbor</text>
<rect x="170" y="30" width="140" height="80" rx="10" fill="#bbf7d0"/><text x="240" y="58" text-anchor="middle" class="svg-ink" font-size="13">2. Database</text><text x="240" y="80" text-anchor="middle" class="svg-muted" font-size="12">show ip ospf</text><text x="240" y="96" text-anchor="middle" class="svg-muted" font-size="12">database</text>
<rect x="330" y="30" width="140" height="80" rx="10" fill="#fde68a"/><text x="400" y="58" text-anchor="middle" class="svg-ink" font-size="13">3. Route table</text><text x="400" y="80" text-anchor="middle" class="svg-muted" font-size="12">show ip route</text><text x="400" y="96" text-anchor="middle" class="svg-muted" font-size="12">&lt;prefix&gt;</text>
<rect x="490" y="30" width="140" height="80" rx="10" fill="#fed7aa"/><text x="560" y="58" text-anchor="middle" class="svg-ink" font-size="13">4. Forwarding</text><text x="560" y="80" text-anchor="middle" class="svg-muted" font-size="12">ping,</text><text x="560" y="96" text-anchor="middle" class="svg-muted" font-size="12">traceroute</text>
<line x1="150" y1="70" x2="170" y2="70" stroke="#64748b" stroke-width="2"/><line x1="310" y1="70" x2="330" y2="70" stroke="#64748b" stroke-width="2"/><line x1="470" y1="70" x2="490" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="80" y="140" text-anchor="middle" class="svg-ink" font-size="12">area, auth,</text><text x="80" y="156" text-anchor="middle" class="svg-ink" font-size="12">stub flag, timers</text>
<text x="240" y="140" text-anchor="middle" class="svg-ink" font-size="12">area type filters,</text><text x="240" y="156" text-anchor="middle" class="svg-ink" font-size="12">translation, VL</text>
<text x="400" y="140" text-anchor="middle" class="svg-ink" font-size="12">route type order,</text><text x="400" y="156" text-anchor="middle" class="svg-ink" font-size="12">forward metric</text>
<text x="560" y="140" text-anchor="middle" class="svg-ink" font-size="12">default route,</text><text x="560" y="156" text-anchor="middle" class="svg-ink" font-size="12">return path</text>
</svg><p class="cap">Stop at the first level that looks wrong. Fixing level 3 while level 1 is broken wastes time.</p></div>

<h3>Symptom to cause</h3>
<table class="cmp"><tr><th>What you see</th><th>Likely causes in this module</th><th>Proof</th></tr>
<tr><td>No neighbour at all</td><td>Stub/NSSA flag mismatch, authentication type or key, timers from a network-type mismatch, missing <code>neighbor</code> on NBMA, OSPFv3 family missing or no IPv6</td><td><code>debug ip ospf adj</code> / <code>hello</code>, <code>show ip ospf interface</code></td></tr>
<tr><td>Neighbour stuck in EXSTART/EXCHANGE</td><td>MTU mismatch (from ENCOR)</td><td><code>show ip interface | include MTU</code></td></tr>
<tr><td>FULL, but routes missing</td><td>Area type filtering (by design), network-type mismatch, area not touching area 0, forwarding address unreachable</td><td><code>show ip ospf database</code>, <code>show ip ospf virtual-links</code></td></tr>
<tr><td>Route present, wrong path</td><td>Route type order, E1 versus E2, forward metric, default-cost</td><td><code>show ip route &lt;prefix&gt;</code></td></tr>
<tr><td>Route present, ping fails</td><td>No default in an NSSA, return path missing</td><td><code>ping</code> both ways, <code>traceroute</code></td></tr>
</table>

<h3>The seven labs as tickets</h3>
<p><b>Ticket 1, Indore (stub).</b> "Branch router's table is full of external routes." Level 2: <code>show ip ospf database</code> shows type-4 and type-5 LSAs in area 51. Configure <code>area 51 stub</code> on both routers (the adjacency drops until both match), then <code>area 51 default-cost 50</code> on the ABR. Proof: O*IA [110/51], no O E2, ping 203.0.113.1 works.</p>
<p><b>Ticket 2, Kochi (totally stubby).</b> "Still too many routes." <code>show ip ospf database summary</code> lists many type-3 LSAs. Add <code>no-summary</code> on the ABR only. Proof: one summary LSA, 0.0.0.0; CORE still has 192.168.52.0/24 as O IA.</p>
<p><b>Ticket 3, Nagpur (NSSA).</b> "Block externals but advertise the partner." A stub would forbid redistribution, so use <code>area 30 nssa</code> and <code>redistribute connected subnets</code> on BR. Proof: O N2 on ABR, O E2 on CORE with advertising router 2.2.2.2. Then "branch lost the internet": no automatic default in NSSA, so add <code>default-information-originate</code> on the ABR (O*N2).</p>
<p><b>Ticket 4, Surat (totally NSSA).</b> "Warehouse cannot reach the internet and has too many routes." <code>area 40 nssa no-summary</code> on the ABR gives O*IA and removes type-3 routes. "Core needs the real cost": <code>metric-type 1</code> on BR gives O N1 and O E1 above 20.</p>
<p><b>Ticket 5, new plant (virtual link).</b> "R4 and head office cannot see each other." Neighbours are all FULL, so level 1 is fine; level 2 shows no area 0 information in area 2. Area 2 does not touch area 0. <code>area 1 virtual-link</code> with each other's router ID on R2 and R3. Proof: OSPF_VL0 FULL, R3 is an ABR, 4.4.4.4 O IA on R1.</p>
<p><b>Ticket 6, SEC-12 (MD5).</b> "R1 and R3 lost neighbours after R2 was secured." Level 1 fails. <code>debug ip ospf adj</code> on R2 gives two different messages: type mismatch (R1 has no authentication) and key mismatch (R3 has br@nch23). Fix both, verify "Message digest authentication enabled, Youngest key id is 1", ping 3.3.3.3 from R1.</p>
<p><b>Ticket 7, DCI (HMAC-SHA).</b> "Move to SHA and rotate keys without an outage." Build identical key chains, apply to both ends within the dead interval, then add key 2 on both. Proof: "Sending SA: Key 2, Algorithm HMAC-SHA-512" on both routers and a FULL neighbour.</p>

<div class="eg"><p><b>Worked example: timing an authentication ticket.</b> R2 got area 0 MD5 at 09:00:00. R1's neighbour state in R2 stayed FULL until the dead timer expired at 09:00:40 (40 seconds on Ethernet), and the users called at 09:01. When you arrive, <code>show ip ospf neighbor</code> is empty, which already rules out MTU (EXSTART) and network-type problems (FULL but routes missing). The debug line then names the exact fault in under a minute.</p></div>

<h3>Commands you will use on every ticket</h3>
<pre class="code">show ip ospf                          <span class="c">! area types, ABR/ASBR, translation, area auth</span>
show ip ospf interface Gi0/0          <span class="c">! network type, timers, auth, key id, Sending SA</span>
show ip ospf neighbor
show ip ospf database [summary | asbr-summary | external | nssa-external | database-summary]
show ip ospf virtual-links
show ip route ospf  /  show ip route &lt;prefix&gt;
show key chain
debug ip ospf adj  /  debug ip ospf hello
show ospfv3 interface brief  /  show ospfv3 neighbor</pre>

<div class="warn"><p><b>Common mistakes.</b> Changing several things at once, then not knowing which one fixed the problem. Using <code>clear ip ospf process</code> in production to "refresh" things: it drops every adjacency on the router. Leaving debugs running on a busy router; use <code>undebug all</code> as soon as you have the line you need.</p></div>

<div class="exam"><p><b>Exam trap.</b> Troubleshooting items usually give you outputs from several routers and ask for one root cause. Read the lines this module taught you: "It is a stub area", "Perform type-7/type-5 LSA translation", "Transit area 1", "Message digest authentication enabled", "Sending SA". The answer is almost always hidden in one of them.</p></div>

<div class="scn"><h4>The NSSA change that cut off a plant</h4><p>After a merger, a network team converted area 7 to an NSSA so a partner router could be attached. Twenty minutes later a remote plant in area 9 went dark. Neighbours were FULL everywhere. <code>show ip ospf virtual-links</code> on the plant's ABR showed the link down: area 9 had been connected to the backbone by a virtual link through area 7, and a virtual link cannot transit an NSSA. The team reverted area 7 to normal, attached the partner in a new NSSA hanging directly off area 0, and later removed the virtual link with a proper redesign.</p><p><b>Lesson:</b> before changing an area type, check whether any virtual link uses that area as transit.</p></div>

<div class="iv"><p class="q">"A route is missing on an OSPF router. Walk me through how you troubleshoot it."</p><p>Strong answer: go layer by layer. First neighbours: are they FULL, and if not, check area, authentication, stub/NSSA flag, timers and network type with debug. Then the database: is the LSA present, and is the area type filtering it by design, is the ABR translating, is the area connected to area 0. Then the routing table: which route type won and why, including the forward metric for E2. Finally forwarding: default route and return path. Mention the specific commands at each step.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four levels: neighbours, database, routing table, forwarding. Stop at the first broken one.</li>
<li>No neighbour: flags, authentication, timers, network type, NBMA neighbours, OSPFv3 IPv6.</li>
<li>FULL but missing routes: area type (often by design), network-type mismatch, disconnected area, forwarding address.</li>
<li>Wrong path: route type order, E2 forward metric, default-cost.</li>
<li>Read the exact show lines; the root cause is usually written there.</li>
</ul></div>
`,hi:`
<p>Achha doctor pehle sentence ke baad dawa nahi likhta. Woh pehle pulse check karti hai, phir blood test, phir scan, har step ke saath dayra chhota karti hai. OSPF troubleshooting bhi aise hi kaam karta hai. Is module ki har problem chaar mein se ek level par rehti hai, aur har level ki ek command batati hai ki aap kis level par ho: <b>neighbours</b>, <b>database</b>, <b>routing table</b>, <b>forwarding</b>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Chaar step wala OSPF troubleshooting workflow">
<rect x="10" y="30" width="140" height="80" rx="10" fill="#bae6fd"/><text x="80" y="58" text-anchor="middle" class="svg-ink" font-size="13">1. Neighbours</text><text x="80" y="80" text-anchor="middle" class="svg-muted" font-size="12">show ip ospf</text><text x="80" y="96" text-anchor="middle" class="svg-muted" font-size="12">neighbor</text>
<rect x="170" y="30" width="140" height="80" rx="10" fill="#bbf7d0"/><text x="240" y="58" text-anchor="middle" class="svg-ink" font-size="13">2. Database</text><text x="240" y="80" text-anchor="middle" class="svg-muted" font-size="12">show ip ospf</text><text x="240" y="96" text-anchor="middle" class="svg-muted" font-size="12">database</text>
<rect x="330" y="30" width="140" height="80" rx="10" fill="#fde68a"/><text x="400" y="58" text-anchor="middle" class="svg-ink" font-size="13">3. Route table</text><text x="400" y="80" text-anchor="middle" class="svg-muted" font-size="12">show ip route</text><text x="400" y="96" text-anchor="middle" class="svg-muted" font-size="12">&lt;prefix&gt;</text>
<rect x="490" y="30" width="140" height="80" rx="10" fill="#fed7aa"/><text x="560" y="58" text-anchor="middle" class="svg-ink" font-size="13">4. Forwarding</text><text x="560" y="80" text-anchor="middle" class="svg-muted" font-size="12">ping,</text><text x="560" y="96" text-anchor="middle" class="svg-muted" font-size="12">traceroute</text>
<line x1="150" y1="70" x2="170" y2="70" stroke="#64748b" stroke-width="2"/><line x1="310" y1="70" x2="330" y2="70" stroke="#64748b" stroke-width="2"/><line x1="470" y1="70" x2="490" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="80" y="140" text-anchor="middle" class="svg-ink" font-size="12">area, auth,</text><text x="80" y="156" text-anchor="middle" class="svg-ink" font-size="12">stub flag, timers</text>
<text x="240" y="140" text-anchor="middle" class="svg-ink" font-size="12">area type filters,</text><text x="240" y="156" text-anchor="middle" class="svg-ink" font-size="12">translation, VL</text>
<text x="400" y="140" text-anchor="middle" class="svg-ink" font-size="12">route type order,</text><text x="400" y="156" text-anchor="middle" class="svg-ink" font-size="12">forward metric</text>
<text x="560" y="140" text-anchor="middle" class="svg-ink" font-size="12">default route,</text><text x="560" y="156" text-anchor="middle" class="svg-ink" font-size="12">return path</text>
</svg><p class="cap">Pehle galat dikhne wale level par ruk jao. Level 1 toota ho aur aap level 3 theek karo to time waste hota hai.</p></div>

<h3>Symptom se cause tak</h3>
<table class="cmp"><tr><th>Aapko kya dikhta hai</th><th>Is module mein likely causes</th><th>Proof</th></tr>
<tr><td>Koi neighbour hi nahi</td><td>Stub/NSSA flag mismatch, authentication type ya key, network-type mismatch se timers, NBMA par <code>neighbor</code> missing, OSPFv3 family missing ya IPv6 nahi</td><td><code>debug ip ospf adj</code> / <code>hello</code>, <code>show ip ospf interface</code></td></tr>
<tr><td>Neighbour EXSTART/EXCHANGE mein atka</td><td>MTU mismatch (ENCOR se)</td><td><code>show ip interface | include MTU</code></td></tr>
<tr><td>FULL, lekin routes gayab</td><td>Area type filtering (design se), network-type mismatch, area 0 ko na chhoota area, forwarding address unreachable</td><td><code>show ip ospf database</code>, <code>show ip ospf virtual-links</code></td></tr>
<tr><td>Route hai, galat path</td><td>Route type order, E1 vs E2, forward metric, default-cost</td><td><code>show ip route &lt;prefix&gt;</code></td></tr>
<tr><td>Route hai, ping fail</td><td>NSSA mein default nahi, return path missing</td><td>Dono taraf <code>ping</code>, <code>traceroute</code></td></tr>
</table>

<h3>Saat labs tickets ki tarah</h3>
<p><b>Ticket 1, Indore (stub).</b> "Branch router ki table external routes se bhari hai." Level 2: <code>show ip ospf database</code> area 51 mein type-4 aur type-5 LSAs dikhata hai. Dono routers par <code>area 51 stub</code> configure karo (dono match hone tak adjacency drop rehti hai), phir ABR par <code>area 51 default-cost 50</code>. Proof: O*IA [110/51], koi O E2 nahi, ping 203.0.113.1 chalta hai.</p>
<p><b>Ticket 2, Kochi (totally stubby).</b> "Ab bhi bahut routes hain." <code>show ip ospf database summary</code> bahut saare type-3 LSAs list karta hai. Sirf ABR par <code>no-summary</code> jodo. Proof: ek summary LSA, 0.0.0.0; CORE ke paas ab bhi 192.168.52.0/24 O IA hai.</p>
<p><b>Ticket 3, Nagpur (NSSA).</b> "Externals roko lekin partner advertise karo." Stub redistribution mana karega, isliye BR par <code>area 30 nssa</code> aur <code>redistribute connected subnets</code> use karo. Proof: ABR par O N2, CORE par advertising router 2.2.2.2 ke saath O E2. Phir "branch ka internet chala gaya": NSSA mein automatic default nahi, isliye ABR par <code>default-information-originate</code> jodo (O*N2).</p>
<p><b>Ticket 4, Surat (totally NSSA).</b> "Warehouse internet tak nahi pahunchta aur bahut routes hain." ABR par <code>area 40 nssa no-summary</code> O*IA deta hai aur type-3 routes hatata hai. "Core ko asli cost chahiye": BR par <code>metric-type 1</code> O N1 aur 20 se upar O E1 deta hai.</p>
<p><b>Ticket 5, naya plant (virtual link).</b> "R4 aur head office ek doosre ko nahi dekh paate." Saare neighbours FULL hain, to level 1 theek hai; level 2 area 2 mein area 0 ki koi information nahi dikhata. Area 2 area 0 ko nahi chhoota. R2 aur R3 par ek doosre ke router ID ke saath <code>area 1 virtual-link</code>. Proof: OSPF_VL0 FULL, R3 ABR hai, R1 par 4.4.4.4 O IA.</p>
<p><b>Ticket 6, SEC-12 (MD5).</b> "R2 secure hone ke baad R1 aur R3 ne neighbours kho diye." Level 1 fail. R2 par <code>debug ip ospf adj</code> do alag messages deta hai: type mismatch (R1 par authentication nahi) aur key mismatch (R3 par br@nch23). Dono theek karo, "Message digest authentication enabled, Youngest key id is 1" verify karo, R1 se 3.3.3.3 ping karo.</p>
<p><b>Ticket 7, DCI (HMAC-SHA).</b> "SHA par jao aur bina outage ke keys rotate karo." Identical key chains banao, dead interval ke andar dono ends par apply karo, phir dono par key 2 jodo. Proof: dono routers par "Sending SA: Key 2, Algorithm HMAC-SHA-512" aur FULL neighbour.</p>

<div class="eg"><p><b>Worked example: authentication ticket ki timing.</b> R2 ko 09:00:00 par area 0 MD5 mila. R2 mein R1 ki neighbour state dead timer khatam hone tak 09:00:40 par FULL rahi (Ethernet par 40 seconds), aur users ne 09:01 par call kiya. Jab aap pahunchte ho, <code>show ip ospf neighbor</code> khaali hai, jo MTU (EXSTART) aur network-type problems (FULL lekin routes gayab) ko pehle hi rule out kar deta hai. Phir debug line ek minute se kam mein exact fault bata deti hai.</p></div>

<h3>Commands jo aap har ticket par use karoge</h3>
<pre class="code">show ip ospf                          <span class="c">! area types, ABR/ASBR, translation, area auth</span>
show ip ospf interface Gi0/0          <span class="c">! network type, timers, auth, key id, Sending SA</span>
show ip ospf neighbor
show ip ospf database [summary | asbr-summary | external | nssa-external | database-summary]
show ip ospf virtual-links
show ip route ospf  /  show ip route &lt;prefix&gt;
show key chain
debug ip ospf adj  /  debug ip ospf hello
show ospfv3 interface brief  /  show ospfv3 neighbor</pre>

<div class="warn"><p><b>Common galtiyan.</b> Ek saath kai cheezein badalna, aur phir pata na hona ki kisne problem theek ki. Production mein cheezein "refresh" karne ke liye <code>clear ip ospf process</code> use karna: yeh router ki har adjacency drop kar deta hai. Busy router par debugs chalte chhod dena; jaise hi zaroori line mile, <code>undebug all</code> use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Troubleshooting items aam taur par kai routers ke outputs dete hain aur ek root cause poochte hain. Woh lines padho jo is module ne sikhayi: "It is a stub area", "Perform type-7/type-5 LSA translation", "Transit area 1", "Message digest authentication enabled", "Sending SA". Jawab lagbhag hamesha inmein se kisi ek mein chhupa hota hai.</p></div>

<div class="scn"><h4>NSSA change jisne ek plant ko kaat diya</h4><p>Merger ke baad ek network team ne area 7 ko NSSA mein convert kiya taaki ek partner router joda ja sake. Bees minute baad area 9 ka ek remote plant andhere mein chala gaya. Har jagah neighbours FULL the. Plant ke ABR par <code>show ip ospf virtual-links</code> ne link down dikhaya: area 9 area 7 ke through virtual link se backbone se juda tha, aur virtual link NSSA ko transit nahi kar sakta. Team ne area 7 ko wapas normal kiya, partner ko seedha area 0 se latakte ek naye NSSA mein joda, aur baad mein proper redesign ke saath virtual link hata diya.</p><p><b>Lesson:</b> area type badalne se pehle check karo ki koi virtual link us area ko transit ki tarah to use nahi karta.</p></div>

<div class="iv"><p class="q">"Ek OSPF router par route missing hai. Batao aap kaise troubleshoot karoge."</p><p>Strong answer: layer by layer chalo. Pehle neighbours: kya woh FULL hain, aur agar nahi, to debug se area, authentication, stub/NSSA flag, timers aur network type check karo. Phir database: kya LSA hai, kya area type use design se filter kar raha hai, kya ABR translate kar raha hai, kya area area 0 se juda hai. Phir routing table: kaunsa route type jeeta aur kyun, E2 ke liye forward metric samet. Aakhir mein forwarding: default route aur return path. Har step par specific commands mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar levels: neighbours, database, routing table, forwarding. Pehle toote hue par ruko.</li>
<li>Neighbour nahi: flags, authentication, timers, network type, NBMA neighbours, OSPFv3 IPv6.</li>
<li>FULL lekin routes gayab: area type (aksar design se), network-type mismatch, disconnected area, forwarding address.</li>
<li>Galat path: route type order, E2 forward metric, default-cost.</li>
<li>Exact show lines padho; root cause aam taur par wahin likha hota hai.</li>
</ul></div>
`}};export{e as default};