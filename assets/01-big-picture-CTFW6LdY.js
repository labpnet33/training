var e={id:`big-picture`,h:{en:`EIGRP for the troubleshooter: the big picture`,hi:`Troubleshooter ke liye EIGRP: big picture`},body:{en:`
<h3>What you will learn</h3>
<p>In the ENCOR EIGRP module you learned how EIGRP works: neighbours, the composite metric, DUAL, feasible successors, stubs and variance. This ENARSI module turns that knowledge into <b>troubleshooting skill</b>. By the end you will be able to:</p>
<ul>
<li>Build and read <b>named-mode</b> EIGRP (address-family, af-interface, topology base) for IPv4 and IPv6, and convert a classic configuration to named mode safely.</li>
<li>Diagnose every reason a neighbour does not form or keeps flapping: AS number, K values, subnet, passive interfaces, ACLs, authentication (MD5 and HMAC-SHA-256), timers and MTU.</li>
<li>Read the topology table like a DUAL engine: FD, RD, feasibility condition, successor, feasible successor, active routes and <b>stuck-in-active</b>.</li>
<li>Use stub options, summarisation, wide metrics, equal and unequal-cost load balancing, offset-lists and distribute-lists, and fix them when they hide routes.</li>
<li>Walk the two labs of this module the way a senior engineer would, with the right show commands and debugs.</li>
</ul>
<p>This maps to the CCNP ENARSI 300-410 v1.1 blueprint items <b>1.5</b> (troubleshoot manual and auto-summarisation with any routing protocol) and <b>1.8</b> (troubleshoot EIGRP classic and named mode: address families, neighbour relationship and authentication, loop-free path selection, stubs, load balancing and metrics).</p>

<h3>Prerequisites</h3>
<p>You should be comfortable with the ENCOR EIGRP module: packet types, RTP, the three tables, the classic metric formula and the difference between FD and RD. Policy-based routing (1.6) and redistribution with route maps are taught in their own ENARSI modules; here we only touch filtering where it breaks EIGRP. DMVPN has its own module too, so you get a preview only.</p>

<h3>An analogy: the courier network after the audit</h3>
<p>In ENCOR we compared EIGRP routers to courier hubs that trust what their neighbours tell them. Now imagine the courier company after a security audit and an expansion. Every depot must show an ID card before a neighbour depot accepts a parcel (authentication). Small village depots are told "only deliver locally, never act as a transit hub" (stub). Regional hubs start saying "anything for 10.1.x.x, send it to me" instead of listing every street (summarisation). And when a road closes, head office no longer phones every depot in the country asking "do you know another way?", because that phone chain once took so long that head office gave up and cut the line (stuck-in-active).</p>
<p>Your job as the troubleshooter is to find which of those new rules is stopping the parcels.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Four layers to check">
<rect x="20" y="16" width="600" height="44" rx="8" fill="#bae6fd"/><text x="40" y="43" class="svg-ink" font-size="14">1. Neighbours</text><text x="600" y="43" text-anchor="end" class="svg-muted" font-size="12">show ip eigrp neighbors / interfaces detail</text>
<rect x="20" y="72" width="600" height="44" rx="8" fill="#bbf7d0"/><text x="40" y="99" class="svg-ink" font-size="14">2. Topology table</text><text x="600" y="99" text-anchor="end" class="svg-muted" font-size="12">show ip eigrp topology [all-links | active]</text>
<rect x="20" y="128" width="600" height="44" rx="8" fill="#ddd6fe"/><text x="40" y="155" class="svg-ink" font-size="14">3. Routing table (RIB)</text><text x="600" y="155" text-anchor="end" class="svg-muted" font-size="12">show ip route eigrp / show ip protocols</text>
<rect x="20" y="184" width="600" height="44" rx="8" fill="#fde68a"/><text x="40" y="211" class="svg-ink" font-size="14">4. Forwarding</text><text x="600" y="211" text-anchor="end" class="svg-muted" font-size="12">ping, traceroute, show ip cef</text>
</svg><p class="cap">Work top to bottom. A fault at one layer explains every symptom below it.</p></div>

<h3>The four-layer model you will use in every chapter</h3>
<ol>
<li><b>Neighbours.</b> No adjacency, no routes. Most EIGRP tickets end here.</li>
<li><b>Topology table.</b> The neighbour is up but a prefix is missing or has no feasible successor. Look at what was advertised, and why it was suppressed (stub, summary, filter, split horizon).</li>
<li><b>Routing table.</b> The prefix is in the topology table but not installed. Another source with a lower administrative distance won, or a distribute-list <code>in</code> blocked it.</li>
<li><b>Forwarding.</b> The route is installed, yet traffic fails: a Null0 summary swallows it, an ACL drops it, or the return path is missing.</li>
</ol>

<h3>The labs of this module</h3>
<p><b>Lab · Named mode, stub branches and summaries</b>: NK Retail's data-centre router HUB runs <code>router eigrp NK-WAN</code> with AS 10. You bring branch routers SP1 (router ID 2.2.2.2) and SP2 (3.3.3.3) into named mode, keep every interface passive except the uplink Gi0/0, make them <code>eigrp stub connected summary</code>, and summarise four store LANs per branch into 10.1.0.0/22 and 10.2.0.0/22.</p>
<p><b>Troubleshoot · Flapping and missing EIGRP neighbours</b>: HUB (classic <code>router eigrp 10</code>) has three spokes on 10.20.1.0/24, 10.20.2.0/24 and 10.20.3.0/24. After an MD5 rollout (key chain NK-KEYS, key 1) SP1 and SP3 have no neighbour and SP2 flaps. You will find three different faults.</p>

<div class="eg"><p><b>Worked example: reading a ticket with the model.</b> "Branch SP2 users cannot reach the data centre." Layer 1: <code>show ip eigrp neighbors</code> on HUB lists 10.20.2.2 but its <b>Q Cnt</b> is 3 and the uptime keeps restarting at 00:00:xx. The neighbour exists but reliable packets are not acknowledged. You stop at layer 1, because there is no point studying the topology table of a neighbour that resets every 80 seconds.</p></div>

<div class="warn"><p><b>Common mistake.</b> Jumping to <code>show ip route</code> first. The routing table only tells you a route is missing; it never tells you why. The neighbour table and the topology table do.</p></div>

<div class="exam"><p><b>Exam trap.</b> ENARSI questions often show named-mode output (<code>EIGRP-IPv4 VR(NK-WAN) Address-Family</code>) and classic output side by side. The process name never has to match between routers; the AS number does. Metrics in the RIB of a named-mode router are the wide metric divided by the RIB scale (128), so they look very different from classic metrics for the same path.</p></div>

<div class="scn"><h4>The branch that vanished after a "harmless" template</h4><p>A retail chain pushed a standard configuration template to 40 branch routers overnight. In the morning, 12 branches had no EIGRP neighbour. The on-call engineer first rebooted two routers, which changed nothing. A senior engineer ran <code>show ip protocols</code> on one branch and saw every interface listed under "Passive Interface(s)", including the uplink. The template contained <code>passive-interface default</code> but the line that re-enabled the uplink used the old interface name from a different router model.</p><p><b>Lesson:</b> start at layer 1, read what the router says about itself, and never reboot to "see if it helps".</p></div>

<div class="iv"><p class="q">"How do you approach an EIGRP problem where a remote LAN is unreachable?"</p><p>Describe a layered method: confirm neighbours (and their Q Cnt and uptime), then the topology table for the prefix, then the RIB and administrative distance, then forwarding. Name the exact commands. Mention that you check the source router first (is it advertising?) and then each hop towards you. Interviewers want a repeatable method, not a list of random commands.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ENARSI EIGRP is about troubleshooting depth: blueprint items 1.5 (summarisation) and 1.8 (EIGRP classic and named mode).</li>
<li>Use four layers: neighbours, topology table, routing table, forwarding.</li>
<li>Most tickets end at layer 1: AS, K values, subnet, passive, ACL, authentication, timers.</li>
<li>The process name is local; the AS number must match.</li>
<li>The two labs cover named mode with stubs and summaries, and flapping or missing neighbours after an authentication rollout.</li>
</ul></div>
`,hi:`
<h3>Aap kya seekhoge</h3>
<p>ENCOR EIGRP module mein aapne seekha ki EIGRP kaise kaam karta hai: neighbours, composite metric, DUAL, feasible successors, stubs aur variance. Yeh ENARSI module us knowledge ko <b>troubleshooting skill</b> mein badalta hai. End tak aap yeh kar paoge:</p>
<ul>
<li><b>Named-mode</b> EIGRP (address-family, af-interface, topology base) IPv4 aur IPv6 dono ke liye banana aur padhna, aur classic configuration ko safely named mode mein convert karna.</li>
<li>Har wajah diagnose karna jiski wajah se neighbour nahi banta ya flap karta rehta hai: AS number, K values, subnet, passive interfaces, ACLs, authentication (MD5 aur HMAC-SHA-256), timers aur MTU.</li>
<li>Topology table ko DUAL engine ki tarah padhna: FD, RD, feasibility condition, successor, feasible successor, active routes aur <b>stuck-in-active</b>.</li>
<li>Stub options, summarisation, wide metrics, equal aur unequal-cost load balancing, offset-lists aur distribute-lists use karna, aur jab yeh routes chhupa dein to inhe theek karna.</li>
<li>Is module ke dono labs ko senior engineer ki tarah walk karna, sahi show commands aur debugs ke saath.</li>
</ul>
<p>Yeh CCNP ENARSI 300-410 v1.1 blueprint ke items <b>1.5</b> (kisi bhi routing protocol ke saath manual aur auto-summarisation troubleshoot karna) aur <b>1.8</b> (EIGRP classic aur named mode troubleshoot karna: address families, neighbour relationship aur authentication, loop-free path selection, stubs, load balancing aur metrics) se map hota hai.</p>

<h3>Prerequisites</h3>
<p>Aapko ENCOR EIGRP module ke saath comfortable hona chahiye: packet types, RTP, teen tables, classic metric formula aur FD aur RD ka farak. Policy-based routing (1.6) aur route maps ke saath redistribution apne alag ENARSI modules mein padhaye jaate hain; yahan hum filtering ko sirf wahan chhoote hain jahan woh EIGRP todti hai. DMVPN ka bhi apna module hai, isliye yahan sirf preview milega.</p>

<h3>Ek analogy: audit ke baad courier network</h3>
<p>ENCOR mein humne EIGRP routers ko courier hubs se compare kiya tha jo apne neighbours ki baat par bharosa karte hain. Ab socho courier company ka security audit hua aur expansion bhi. Har depot ko parcel accept karwane se pehle neighbour depot ko ID card dikhana padta hai (authentication). Chhote gaon ke depots ko bola gaya "sirf local delivery karo, kabhi transit hub mat bano" (stub). Regional hubs har gali list karne ki jagah bolne lage "10.1.x.x ke liye kuch bhi ho, mujhe bhejo" (summarisation). Aur jab koi road band hoti hai, head office ab desh ke har depot ko phone karke nahi poochta "kya tumhe koi aur raasta pata hai?", kyunki ek baar us phone chain mein itna time laga ki head office ne haar maan kar line kaat di (stuck-in-active).</p>
<p>Troubleshooter ke roop mein aapka kaam hai yeh dhoondhna ki in naye rules mein se kaunsa parcels ko rok raha hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Check karne ki chaar layers">
<rect x="20" y="16" width="600" height="44" rx="8" fill="#bae6fd"/><text x="40" y="43" class="svg-ink" font-size="14">1. Neighbours</text><text x="600" y="43" text-anchor="end" class="svg-muted" font-size="12">show ip eigrp neighbors / interfaces detail</text>
<rect x="20" y="72" width="600" height="44" rx="8" fill="#bbf7d0"/><text x="40" y="99" class="svg-ink" font-size="14">2. Topology table</text><text x="600" y="99" text-anchor="end" class="svg-muted" font-size="12">show ip eigrp topology [all-links | active]</text>
<rect x="20" y="128" width="600" height="44" rx="8" fill="#ddd6fe"/><text x="40" y="155" class="svg-ink" font-size="14">3. Routing table (RIB)</text><text x="600" y="155" text-anchor="end" class="svg-muted" font-size="12">show ip route eigrp / show ip protocols</text>
<rect x="20" y="184" width="600" height="44" rx="8" fill="#fde68a"/><text x="40" y="211" class="svg-ink" font-size="14">4. Forwarding</text><text x="600" y="211" text-anchor="end" class="svg-muted" font-size="12">ping, traceroute, show ip cef</text>
</svg><p class="cap">Upar se neeche kaam karo. Ek layer ka fault uske neeche ke har symptom ko explain karta hai.</p></div>

<h3>Chaar-layer model jo aap har chapter mein use karoge</h3>
<ol>
<li><b>Neighbours.</b> Adjacency nahi, to routes nahi. Zyada tar EIGRP tickets yahin khatam hote hain.</li>
<li><b>Topology table.</b> Neighbour up hai lekin koi prefix missing hai ya uska feasible successor nahi hai. Dekho kya advertise hua, aur woh kyun suppress hua (stub, summary, filter, split horizon).</li>
<li><b>Routing table.</b> Prefix topology table mein hai par install nahi hua. Kam administrative distance wala koi aur source jeet gaya, ya distribute-list <code>in</code> ne use block kar diya.</li>
<li><b>Forwarding.</b> Route install hai, phir bhi traffic fail hota hai: Null0 summary use nigal jaata hai, ACL use drop karta hai, ya return path missing hai.</li>
</ol>

<h3>Is module ke labs</h3>
<p><b>Lab · Named mode, stub branches and summaries</b>: NK Retail ka data-centre router HUB <code>router eigrp NK-WAN</code> AS 10 ke saath chalata hai. Aap branch routers SP1 (router ID 2.2.2.2) aur SP2 (3.3.3.3) ko named mode mein laate ho, uplink Gi0/0 ke alawa har interface passive rakhte ho, unhe <code>eigrp stub connected summary</code> banate ho, aur har branch ke chaar store LANs ko 10.1.0.0/22 aur 10.2.0.0/22 mein summarise karte ho.</p>
<p><b>Troubleshoot · Flapping and missing EIGRP neighbours</b>: HUB (classic <code>router eigrp 10</code>) ke teen spokes 10.20.1.0/24, 10.20.2.0/24 aur 10.20.3.0/24 par hain. MD5 rollout (key chain NK-KEYS, key 1) ke baad SP1 aur SP3 ka koi neighbour nahi hai aur SP2 flap karta hai. Aap teen alag faults dhoondhoge.</p>

<div class="eg"><p><b>Worked example: model se ticket padhna.</b> "Branch SP2 ke users data centre tak nahi pahunch pa rahe." Layer 1: HUB par <code>show ip eigrp neighbors</code> 10.20.2.2 list karta hai lekin uska <b>Q Cnt</b> 3 hai aur uptime baar baar 00:00:xx se restart hota hai. Neighbour hai lekin reliable packets ka acknowledgement nahi aa raha. Aap layer 1 par ruk jaate ho, kyunki jo neighbour har 80 second mein reset hota hai uski topology table padhne ka koi fayda nahi.</p></div>

<div class="warn"><p><b>Common galti.</b> Seedha pehle <code>show ip route</code> par kood jaana. Routing table sirf batati hai ki route missing hai; woh kabhi nahi batati kyun. Neighbour table aur topology table batati hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> ENARSI questions aksar named-mode output (<code>EIGRP-IPv4 VR(NK-WAN) Address-Family</code>) aur classic output saath mein dikhate hain. Process name routers ke beech kabhi match hona zaroori nahi; AS number zaroori hai. Named-mode router ki RIB mein metrics wide metric ko RIB scale (128) se divide karke aate hain, isliye same path ke liye yeh classic metrics se bahut alag dikhte hain.</p></div>

<div class="scn"><h4>"Harmless" template ke baad gayab branch</h4><p>Ek retail chain ne raat mein 40 branch routers par ek standard configuration template push kiya. Subah 12 branches ka koi EIGRP neighbour nahi tha. On-call engineer ne pehle do routers reboot kiye, jisse kuch nahi badla. Ek senior engineer ne ek branch par <code>show ip protocols</code> chalaya aur dekha ki "Passive Interface(s)" ke neeche har interface list tha, uplink bhi. Template mein <code>passive-interface default</code> tha lekin uplink ko wapas enable karne wali line ek alag router model ka purana interface name use kar rahi thi.</p><p><b>Seekh:</b> layer 1 se shuru karo, router apne baare mein jo bolta hai woh padho, aur "shayad theek ho jaaye" soch kar kabhi reboot mat karo.</p></div>

<div class="iv"><p class="q">"Jab koi remote LAN unreachable ho to aap EIGRP problem ko kaise approach karte ho?"</p><p>Layered method batao: neighbours confirm karo (unka Q Cnt aur uptime bhi), phir prefix ke liye topology table, phir RIB aur administrative distance, phir forwarding. Exact commands ke naam lo. Batao ki aap pehle source router check karte ho (kya woh advertise kar raha hai?) aur phir apni taraf aate har hop ko. Interviewers ko repeatable method chahiye, random commands ki list nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ENARSI EIGRP troubleshooting depth ke baare mein hai: blueprint items 1.5 (summarisation) aur 1.8 (EIGRP classic aur named mode).</li>
<li>Chaar layers use karo: neighbours, topology table, routing table, forwarding.</li>
<li>Zyada tar tickets layer 1 par khatam hote hain: AS, K values, subnet, passive, ACL, authentication, timers.</li>
<li>Process name local hai; AS number match hona chahiye.</li>
<li>Dono labs named mode ke saath stubs aur summaries, aur authentication rollout ke baad flap karte ya missing neighbours cover karte hain.</li>
</ul></div>
`}};export{e as default};