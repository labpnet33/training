var e={id:`big-picture`,h:{en:`The big picture: routes crossing borders`,hi:`Big picture: routes jo borders cross karte hain`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these 13 chapters you will be able to explain, configure, verify and troubleshoot everything in the first block of the CCNP ENARSI 300-410 v1.1 blueprint: <b>administrative distance</b> (1.1), <b>route maps</b> for any routing protocol (1.2), <b>loop prevention</b> with filtering, tagging, split horizon and route poisoning (1.3), and <b>redistribution</b> between any routing protocols or routing sources (1.4). Along the way you will master prefix lists, ACL-based route matching and distribute-lists, because every one of those blueprint items depends on them.</p>

<h3>Prerequisites</h3>
<ul>
<li>You can configure basic EIGRP and single-area OSPF and read <code>show ip route</code> (ENCOR routing modules).</li>
<li>You know what an ACL, a wildcard mask and a subnet mask are (CCNA).</li>
<li>You have seen the structured troubleshooting method from the ENARSI start module: define the problem, gather facts, test one hypothesis at a time.</li>
</ul>
<p>We will not re-teach how EIGRP or OSPF form neighbours. Deep EIGRP, OSPF and BGP troubleshooting come in the next ENARSI modules; here we focus on what happens <b>between</b> routing sources.</p>

<h3>An analogy: two countries and a border post</h3>
<p>Imagine two countries that speak different languages and use different currencies. A company has offices in both, so goods must cross the border every day. At the border post an officer does four jobs:</p>
<ol>
<li><b>Decides whom to believe.</b> If two messengers bring different news about the same town, the officer trusts the more reliable source. In a router that ranking is <b>administrative distance (AD)</b>.</li>
<li><b>Converts currency.</b> A price in rupees means nothing across the border until it is converted. Routing metrics are the same: an OSPF cost of 3 means nothing to EIGRP, so the router assigns a <b>seed metric</b> when it redistributes.</li>
<li><b>Applies customs rules.</b> Some goods may cross, others may not. <b>Prefix lists</b>, <b>route maps</b> and <b>distribute-lists</b> are the customs rulebook.</li>
<li><b>Stamps passports.</b> A stamp says "this traveller came from country A". If the same traveller tries to re-enter country A through a second border post pretending to be foreign, the stamp gives him away. That stamp is a <b>route tag</b>, and it is the main tool against redistribution loops.</li>
</ol>
<p>Keep this picture in mind. Every chapter in this module is one of these four jobs, done carefully.</p>

<h3>Why it matters in real networks</h3>
<p>Pure single-protocol networks are rare. Companies merge (one side runs EIGRP, the other OSPF), branches connect over BGP to a provider, static routes point at firewalls, and data centers inject routes into the campus. Wherever two routing sources meet, a router must <b>redistribute</b>: copy routes learned from one source into another protocol. Done carelessly, redistribution causes three classic failures: routes that silently never appear, traffic that takes a long detour (<b>suboptimal routing</b>), and <b>routing loops</b> or flapping routes. ENARSI loves these problems because they test whether you understand the rules, not just the commands.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Lab topology">
<rect x="10" y="20" width="250" height="270" rx="14" fill="#bae6fd"/>
<rect x="380" y="20" width="250" height="270" rx="14" fill="#bbf7d0"/>
<text x="24" y="42" class="svg-ink" font-size="13">EIGRP 100 (Delhi)</text>
<text x="616" y="42" text-anchor="end" class="svg-ink" font-size="13">OSPF area 0 (Bengaluru)</text>
<rect x="40" y="115" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="100" y="137" text-anchor="middle" class="svg-ink" font-size="14">E1</text><text x="100" y="155" text-anchor="middle" class="svg-muted" font-size="12">RID 5.5.5.5</text>
<rect x="260" y="45" width="120" height="50" rx="8" fill="#fde68a"/><text x="320" y="67" text-anchor="middle" class="svg-ink" font-size="14">BR1</text><text x="320" y="85" text-anchor="middle" class="svg-muted" font-size="12">RID 1.1.1.1</text>
<rect x="260" y="185" width="120" height="50" rx="8" fill="#fde68a"/><text x="320" y="207" text-anchor="middle" class="svg-ink" font-size="14">BR2</text><text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">RID 2.2.2.2</text>
<rect x="480" y="115" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="540" y="137" text-anchor="middle" class="svg-ink" font-size="14">O1</text><text x="540" y="155" text-anchor="middle" class="svg-muted" font-size="12">RID 9.9.9.9</text>
<line x1="160" y1="130" x2="260" y2="70" stroke="#64748b" stroke-width="2"/>
<line x1="160" y1="150" x2="260" y2="210" stroke="#64748b" stroke-width="2"/>
<line x1="380" y1="70" x2="480" y2="130" stroke="#64748b" stroke-width="2"/>
<line x1="380" y1="210" x2="480" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="100" y="188" text-anchor="middle" class="svg-muted" font-size="12">users 172.16.10.0/24</text>
<text x="100" y="206" text-anchor="middle" class="svg-muted" font-size="12">Lo1 192.168.50.0/24</text>
<text x="540" y="188" text-anchor="middle" class="svg-muted" font-size="12">users 10.200.10.0/24</text>
<text x="540" y="206" text-anchor="middle" class="svg-muted" font-size="12">Lo 10.200.1.0, 10.200.2.0</text>
<text x="320" y="270" text-anchor="middle" class="svg-accent" font-size="13">boundary routers redistribute both ways</text>
</svg><p class="cap">The module lab: Delhi runs EIGRP 100, Bengaluru runs OSPF area 0, and BR1 and BR2 run both. Links: E1-BR1 10.1.1.0/24, E1-BR2 10.1.2.0/24, BR1-O1 10.2.1.0/24, BR2-O1 10.2.2.0/24.</p></div>

<h3>The lab you will build and break</h3>
<p>Both labs in this module use the topology above. <b>E1</b> is the Delhi core (EIGRP 100, router ID 5.5.5.5). It has the Delhi users on 172.16.10.0/24 and a partner network 192.168.50.0/24 on Loopback1 that it injects with <code>redistribute connected</code>, so the rest of EIGRP sees it as an external route. <b>O1</b> is the Bengaluru core (OSPF area 0, router ID 9.9.9.9) with the Bengaluru users on 10.200.10.0/24 and loopbacks 10.200.1.0/24 and 10.200.2.0/24. <b>BR1</b> and <b>BR2</b> are the two boundary routers. Because there are two of them, the lab contains every classic multi-point redistribution problem.</p>
<ul>
<li><b>Lab 1, Mutual redistribution with route tags</b>: redistribute in both directions on both boundary routers, then use tags so nothing that left a domain comes back into it.</li>
<li><b>Lab 2, Troubleshoot suboptimal routing and missing prefixes</b>: BR1 sends Delhi-bound traffic through Bengaluru, and a prefix list hides the Bengaluru users from Delhi. You fix both without removing the tags.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Before any redistribution, E1's routing table holds only EIGRP and connected routes, and O1 holds only OSPF and connected routes. PCE (172.16.10.10) pinging PCO (10.200.10.10) fails at E1 with "destination unreachable", because E1 has no route to 10.200.10.0/24. After Lab 1, E1 shows <code>D EX 10.200.10.0/24</code> with two next hops (10.1.1.2 and 10.1.2.2), O1 shows <code>O E2 172.16.10.0/24</code> with metric 20 and tag 90, and the ping succeeds.</p></div>

<h3>How this module is organised</h3>
<table class="cmp"><tr><th>Blueprint item</th><th>Chapters</th></tr>
<tr><td>1.1 Administrative distance</td><td>2 route selection and AD, 3 changing AD</td></tr>
<tr><td>1.2 Route maps (attributes, tagging, filtering)</td><td>4 prefix lists, 5 ACLs for routes, 6 route maps, 7 distribute-lists</td></tr>
<tr><td>1.4 Redistribution</td><td>8 rules and seed metrics, 9 configuring one-way and mutual</td></tr>
<tr><td>1.3 Loop prevention</td><td>10 multi-point problems, 11 tags, split horizon, poisoning</td></tr>
<tr><td>All of the above</td><td>12 troubleshooting workflow, 13 summary and exam checklist</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Thinking of redistribution as "connecting two protocols". It is not a link between protocols; it is a <b>copy from one routing table source into another protocol's database</b>, done by one router, in one direction, under that router's rules. Every problem in this module comes from forgetting that.</p></div>

<div class="exam"><p><b>Exam trap.</b> The blueprint says "troubleshoot". Expect show-command output and a symptom, not a blank config screen. You must read <code>show ip route</code>, <code>show ip protocols</code> and <code>show route-map</code> output and spot the one wrong line.</p></div>

<div class="scn"><h4>The merger that went live on a Friday</h4><p>After an acquisition, an engineer joined an EIGRP company to an OSPF company with two routers and typed <code>redistribute ospf 1</code> under EIGRP and <code>redistribute eigrp 100 subnets</code> under OSPF on both. Delhi could still not reach Bengaluru, and on Monday traffic from one boundary router to a Delhi partner network was crossing the WAN twice. Checking showed two separate faults: no seed metric under EIGRP, so nothing entered EIGRP, and an AD preference that made one boundary router trust the OSPF copy of a Delhi route. Adding the seed metric, tags and <code>distance ospf external 171</code> fixed both.</p><p><b>Lesson:</b> redistribution is never "just one command"; plan metrics, filters, tags and AD together.</p></div>

<div class="iv"><p class="q">"What is route redistribution, and why do engineers consider it risky?"</p><p>Strong answer: redistribution is a router taking routes installed in its routing table by one source (a protocol, static or connected) and advertising them into another protocol with a new seed metric. It is risky because the original metric is lost, AD differences can make routers prefer a longer path, and with two or more redistribution points routes can feed back into their origin and cause loops. Mention the controls: filtering with prefix lists and route maps, tagging, and AD tuning.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>This module covers ENARSI 300-410 v1.1 items 1.1 to 1.4: AD, route maps, loop prevention and redistribution.</li>
<li>Redistribution copies routes from one routing source's table entries into another protocol, one router and one direction at a time.</li>
<li>Four jobs at every boundary: choose the source (AD), convert the metric (seed), filter (prefix lists, route maps), stamp (tags).</li>
<li>Two or more boundary routers bring suboptimal routing and feedback loops; both labs are built around that.</li>
<li>Lab devices: E1 (EIGRP 100), O1 (OSPF area 0), BR1 and BR2 running both.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In 13 chapters ke end tak aap CCNP ENARSI 300-410 v1.1 blueprint ke pehle block ki har cheez explain, configure, verify aur troubleshoot kar paoge: <b>administrative distance</b> (1.1), kisi bhi routing protocol ke liye <b>route maps</b> (1.2), filtering, tagging, split horizon aur route poisoning ke saath <b>loop prevention</b> (1.3), aur kisi bhi routing protocols ya routing sources ke beech <b>redistribution</b> (1.4). Raaste mein aap prefix lists, ACL-based route matching aur distribute-lists bhi master karoge, kyunki in sab blueprint items ki neenv yahi hain.</p>

<h3>Prerequisites</h3>
<ul>
<li>Aap basic EIGRP aur single-area OSPF configure kar sakte ho aur <code>show ip route</code> padh sakte ho (ENCOR routing modules).</li>
<li>Aapko pata hai ki ACL, wildcard mask aur subnet mask kya hote hain (CCNA).</li>
<li>Aapne ENARSI start module ka structured troubleshooting method dekha hai: problem define karo, facts jama karo, ek samay mein ek hypothesis test karo.</li>
</ul>
<p>Hum dobara nahi sikhayenge ki EIGRP ya OSPF neighbours kaise banate hain. Deep EIGRP, OSPF aur BGP troubleshooting agle ENARSI modules mein aayegi; yahan hum us par focus karte hain jo routing sources ke <b>beech</b> hota hai.</p>

<h3>Ek analogy: do desh aur ek border post</h3>
<p>Do desh socho jo alag bhashayein bolte hain aur alag currencies use karte hain. Ek company ke offices dono mein hain, isliye roz saaman border cross karta hai. Border post par officer chaar kaam karta hai:</p>
<ol>
<li><b>Tay karta hai kiska bharosa kare.</b> Agar do messengers ek hi shehar ke baare mein alag khabar laayein, to officer zyada reliable source par bharosa karta hai. Router mein yeh ranking <b>administrative distance (AD)</b> hai.</li>
<li><b>Currency convert karta hai.</b> Rupees mein likhi keemat border ke us paar tab tak bekaar hai jab tak convert na ho. Routing metrics bhi aise hi hain: OSPF cost 3 ka EIGRP ke liye koi matlab nahi, isliye redistribute karte waqt router ek <b>seed metric</b> deta hai.</li>
<li><b>Customs rules lagata hai.</b> Kuch saaman cross kar sakta hai, kuch nahi. <b>Prefix lists</b>, <b>route maps</b> aur <b>distribute-lists</b> customs ki rulebook hain.</li>
<li><b>Passport par stamp lagata hai.</b> Stamp batata hai "yeh musafir desh A se aaya hai". Agar wahi musafir doosre border post se videshi ban kar desh A mein wapas ghusne ki koshish kare, to stamp use pakad leta hai. Woh stamp <b>route tag</b> hai, aur redistribution loops ke khilaaf yahi main tool hai.</li>
</ol>
<p>Yeh picture dimaag mein rakho. Is module ka har chapter in chaar kaamon mein se ek hai, dhyaan se kiya hua.</p>

<h3>Real networks mein yeh kyun zaroori hai</h3>
<p>Sirf ek protocol wale networks kam hote hain. Companies merge hoti hain (ek side EIGRP chalati hai, doosri OSPF), branches provider se BGP par judti hain, static routes firewalls ki taraf point karte hain, aur data centers campus mein routes daalte hain. Jahan bhi do routing sources milte hain, router ko <b>redistribute</b> karna padta hai: ek source se seekhe routes ko doosre protocol mein copy karna. Laaparwahi se kiya jaaye to redistribution teen classic failures laata hai: routes jo chupchaap kabhi aate hi nahi, traffic jo lamba chakkar lagata hai (<b>suboptimal routing</b>), aur <b>routing loops</b> ya flap karte routes. ENARSI ko yeh problems pasand hain kyunki yeh test karti hain ki aap rules samajhte ho, sirf commands nahi.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Lab topology">
<rect x="10" y="20" width="250" height="270" rx="14" fill="#bae6fd"/>
<rect x="380" y="20" width="250" height="270" rx="14" fill="#bbf7d0"/>
<text x="24" y="42" class="svg-ink" font-size="13">EIGRP 100 (Delhi)</text>
<text x="616" y="42" text-anchor="end" class="svg-ink" font-size="13">OSPF area 0 (Bengaluru)</text>
<rect x="40" y="115" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="100" y="137" text-anchor="middle" class="svg-ink" font-size="14">E1</text><text x="100" y="155" text-anchor="middle" class="svg-muted" font-size="12">RID 5.5.5.5</text>
<rect x="260" y="45" width="120" height="50" rx="8" fill="#fde68a"/><text x="320" y="67" text-anchor="middle" class="svg-ink" font-size="14">BR1</text><text x="320" y="85" text-anchor="middle" class="svg-muted" font-size="12">RID 1.1.1.1</text>
<rect x="260" y="185" width="120" height="50" rx="8" fill="#fde68a"/><text x="320" y="207" text-anchor="middle" class="svg-ink" font-size="14">BR2</text><text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">RID 2.2.2.2</text>
<rect x="480" y="115" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="540" y="137" text-anchor="middle" class="svg-ink" font-size="14">O1</text><text x="540" y="155" text-anchor="middle" class="svg-muted" font-size="12">RID 9.9.9.9</text>
<line x1="160" y1="130" x2="260" y2="70" stroke="#64748b" stroke-width="2"/>
<line x1="160" y1="150" x2="260" y2="210" stroke="#64748b" stroke-width="2"/>
<line x1="380" y1="70" x2="480" y2="130" stroke="#64748b" stroke-width="2"/>
<line x1="380" y1="210" x2="480" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="100" y="188" text-anchor="middle" class="svg-muted" font-size="12">users 172.16.10.0/24</text>
<text x="100" y="206" text-anchor="middle" class="svg-muted" font-size="12">Lo1 192.168.50.0/24</text>
<text x="540" y="188" text-anchor="middle" class="svg-muted" font-size="12">users 10.200.10.0/24</text>
<text x="540" y="206" text-anchor="middle" class="svg-muted" font-size="12">Lo 10.200.1.0, 10.200.2.0</text>
<text x="320" y="270" text-anchor="middle" class="svg-accent" font-size="13">boundary routers dono taraf redistribute karte hain</text>
</svg><p class="cap">Module ki lab: Delhi EIGRP 100 chalata hai, Bengaluru OSPF area 0 chalata hai, aur BR1 aur BR2 dono chalate hain. Links: E1-BR1 10.1.1.0/24, E1-BR2 10.1.2.0/24, BR1-O1 10.2.1.0/24, BR2-O1 10.2.2.0/24.</p></div>

<h3>Woh lab jo aap banaoge aur todoge</h3>
<p>Is module ki dono labs upar wali topology use karti hain. <b>E1</b> Delhi core hai (EIGRP 100, router ID 5.5.5.5). Is par Delhi users 172.16.10.0/24 par hain aur Loopback1 par ek partner network 192.168.50.0/24 hai jise yeh <code>redistribute connected</code> se inject karta hai, isliye baaki EIGRP ise external route ki tarah dekhta hai. <b>O1</b> Bengaluru core hai (OSPF area 0, router ID 9.9.9.9), jis par Bengaluru users 10.200.10.0/24 par hain aur loopbacks 10.200.1.0/24 aur 10.200.2.0/24 hain. <b>BR1</b> aur <b>BR2</b> do boundary routers hain. Kyunki do hain, lab mein har classic multi-point redistribution problem maujood hai.</p>
<ul>
<li><b>Lab 1, Route tags ke saath mutual redistribution</b>: dono boundary routers par dono directions mein redistribute karo, phir tags use karo taaki jo cheez kisi domain se nikli ho woh wapas us mein na aaye.</li>
<li><b>Lab 2, Suboptimal routing aur missing prefixes troubleshoot karo</b>: BR1 Delhi ki taraf ka traffic Bengaluru se bhejta hai, aur ek prefix list Bengaluru users ko Delhi se chhupa deti hai. Aap tags hataye bina dono theek karte ho.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Kisi bhi redistribution se pehle E1 ki routing table mein sirf EIGRP aur connected routes hain, aur O1 mein sirf OSPF aur connected routes. PCE (172.16.10.10) se PCO (10.200.10.10) ka ping E1 par "destination unreachable" ke saath fail hota hai, kyunki E1 ke paas 10.200.10.0/24 ka route nahi hai. Lab 1 ke baad E1 par <code>D EX 10.200.10.0/24</code> do next hops (10.1.1.2 aur 10.1.2.2) ke saath dikhta hai, O1 par <code>O E2 172.16.10.0/24</code> metric 20 aur tag 90 ke saath dikhta hai, aur ping chal jaata hai.</p></div>

<h3>Yeh module kaise organised hai</h3>
<table class="cmp"><tr><th>Blueprint item</th><th>Chapters</th></tr>
<tr><td>1.1 Administrative distance</td><td>2 route selection aur AD, 3 AD badalna</td></tr>
<tr><td>1.2 Route maps (attributes, tagging, filtering)</td><td>4 prefix lists, 5 routes ke liye ACLs, 6 route maps, 7 distribute-lists</td></tr>
<tr><td>1.4 Redistribution</td><td>8 rules aur seed metrics, 9 one-way aur mutual configure karna</td></tr>
<tr><td>1.3 Loop prevention</td><td>10 multi-point problems, 11 tags, split horizon, poisoning</td></tr>
<tr><td>Upar ka sab kuch</td><td>12 troubleshooting workflow, 13 summary aur exam checklist</td></tr></table>

<div class="warn"><p><b>Common galti.</b> Redistribution ko "do protocols ko jodna" samajhna. Yeh protocols ke beech koi link nahi hai; yeh <b>ek routing table source se doosre protocol ke database mein copy</b> hai, jo ek router karta hai, ek direction mein, us router ke rules ke hisaab se. Is module ki har problem yeh bhoolne se aati hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Blueprint "troubleshoot" kehta hai. Show-command output aur ek symptom expect karo, khaali config screen nahi. Aapko <code>show ip route</code>, <code>show ip protocols</code> aur <code>show route-map</code> ka output padh kar woh ek galat line pakadni hogi.</p></div>

<div class="scn"><h4>Woh merger jo Friday ko live hua</h4><p>Acquisition ke baad ek engineer ne EIGRP wali company ko OSPF wali company se do routers ke through joda aur dono par EIGRP ke neeche <code>redistribute ospf 1</code> aur OSPF ke neeche <code>redistribute eigrp 100 subnets</code> type kiya. Delhi phir bhi Bengaluru tak nahi pahunch paaya, aur Monday ko ek boundary router se Delhi partner network ka traffic WAN do baar cross kar raha tha. Check karne par do alag faults mile: EIGRP ke neeche seed metric nahi tha, isliye EIGRP mein kuch nahi gaya, aur ek AD preference ne ek boundary router se Delhi route ki OSPF copy par bharosa karwa diya. Seed metric, tags aur <code>distance ospf external 171</code> jodne se dono theek ho gaye.</p><p><b>Seekh:</b> redistribution kabhi "bas ek command" nahi hota; metrics, filters, tags aur AD ek saath plan karo.</p></div>

<div class="iv"><p class="q">"Route redistribution kya hai, aur engineers ise risky kyun maante hain?"</p><p>Strong answer: redistribution mein router apni routing table mein ek source (protocol, static ya connected) dwara install kiye routes lekar unhe naye seed metric ke saath doosre protocol mein advertise karta hai. Yeh risky hai kyunki original metric kho jaata hai, AD ke fark se routers lamba path prefer kar sakte hain, aur do ya zyada redistribution points par routes apne origin mein wapas feed ho kar loops bana sakte hain. Controls bhi batao: prefix lists aur route maps se filtering, tagging, aur AD tuning.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Yeh module ENARSI 300-410 v1.1 ke items 1.1 se 1.4 cover karta hai: AD, route maps, loop prevention aur redistribution.</li>
<li>Redistribution ek routing source ki table entries ko doosre protocol mein copy karta hai, ek samay mein ek router aur ek direction.</li>
<li>Har boundary par chaar kaam: source chuno (AD), metric convert karo (seed), filter karo (prefix lists, route maps), stamp lagao (tags).</li>
<li>Do ya zyada boundary routers suboptimal routing aur feedback loops laate hain; dono labs isi par bani hain.</li>
<li>Lab devices: E1 (EIGRP 100), O1 (OSPF area 0), BR1 aur BR2 dono chalate hain.</li>
</ul></div>
`}};export{e as default};