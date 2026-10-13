var e={id:`big-picture`,h:{en:`EIGRP: the big picture`,hi:`EIGRP: big picture`},body:{en:`
<h3>What you will learn</h3>
<ul>
<li>Why EIGRP is called an <b>advanced distance-vector</b> protocol, and how it differs from RIP and from link-state OSPF.</li>
<li>The five EIGRP packet types, the Reliable Transport Protocol (RTP) and the three tables every EIGRP router keeps.</li>
<li>What two routers must agree on to become neighbours (AS number, K values, subnet, authentication).</li>
<li>The composite metric: bandwidth plus delay, the K values, and the 64-bit <b>wide metrics</b> of named mode, with real calculations.</li>
<li>DUAL in depth: feasible distance, reported distance, successor, feasible successor and the feasibility condition.</li>
<li>Classic and named-mode configuration, passive interfaces, summarisation, stub routing and unequal-cost load balancing with <code>variance</code>.</li>
<li>Queries and stuck-in-active at concept level, a full EIGRP vs OSPF comparison (ENCOR blueprint 3.2.a), and a troubleshooting workflow that walks all three labs.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should be comfortable with IPv4 subnetting and wildcard masks, the idea of administrative distance (AD), static routes, and single-area OSPF from CCNA. If any of that feels shaky, revisit the CCNA OSPF and static routing modules first. The next module, <b>ENCOR OSPF</b>, goes deep into multi-area OSPF; here we only compare the two. The ENARSI EIGRP module later goes further into troubleshooting stuck-in-active and advanced named-mode features.</p>

<h3>An analogy: courier hubs that trust their neighbours</h3>
<p>Picture a chain of courier hubs across India. No hub owns a full map of the country. Instead, each hub asks its direct neighbours, "How far are you from Noida?" and adds the distance to reach that neighbour. That is <b>distance vector</b>: you learn a distance and a direction from the people next to you.</p>
<p>Old-style hubs (RIP) shouted their entire list every 30 seconds, whether anything changed or not, and when a road closed they had to wait and gossip until everyone agreed. EIGRP hubs are smarter. They send a full list only once, when they first meet a neighbour, and after that they send only the <b>changes</b>, only to hubs that care. Every delivery note is signed for, so nothing gets lost. Most importantly, each hub keeps a <b>pre-approved backup courier</b>: a neighbour that is mathematically proven not to send the parcel back through this hub. When the main road closes, the hub switches to the backup in milliseconds without asking anyone.</p>
<p>OSPF hubs work differently. Every hub buys the complete road map (the link-state database) and computes routes itself. Both approaches work; they simply make different trade-offs, and ENCOR expects you to compare them.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Three-site WAN used in the first lab">
<rect x="250" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">R2 core</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">EIGRP AS 100</text>
<rect x="40" y="120" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="110" y="142" text-anchor="middle" class="svg-ink" font-size="14">R1 Jaipur</text><text x="110" y="160" text-anchor="middle" class="svg-muted" font-size="12">1.1.1.1</text>
<rect x="460" y="120" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="530" y="142" text-anchor="middle" class="svg-ink" font-size="14">R3 Noida DC</text><text x="530" y="160" text-anchor="middle" class="svg-muted" font-size="12">3.3.3.3</text>
<line x1="180" y1="130" x2="250" y2="55" stroke="#64748b" stroke-width="3"/><text x="160" y="85" class="svg-muted" font-size="12">10.0.12.0/24</text>
<line x1="390" y1="55" x2="460" y2="130" stroke="#64748b" stroke-width="3"/><text x="420" y="85" class="svg-muted" font-size="12">10.0.23.0/24</text>
<line x1="180" y1="155" x2="460" y2="155" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6 4"/><text x="320" y="148" text-anchor="middle" class="svg-accent" font-size="12">backup 10 Mbps 10.0.13.0/24</text>
<rect x="40" y="220" width="140" height="44" rx="8" fill="#fde68a"/><text x="110" y="247" text-anchor="middle" class="svg-ink" font-size="12">LAN 192.168.10.0/24</text>
<rect x="460" y="220" width="140" height="44" rx="8" fill="#fde68a"/><text x="530" y="247" text-anchor="middle" class="svg-ink" font-size="12">LAN 192.168.30.0/24</text>
<line x1="110" y1="170" x2="110" y2="220" stroke="#64748b" stroke-width="2"/><line x1="530" y1="170" x2="530" y2="220" stroke="#64748b" stroke-width="2"/>
<text x="320" y="290" text-anchor="middle" class="svg-ink" font-size="12">Best path R1 to R3 via R2; the slow link is a feasible successor</text>
</svg><p class="cap">The three-site WAN from the first lab. You will meet these routers and addresses in almost every chapter.</p></div>

<h3>A short history</h3>
<p>Cisco created <b>IGRP</b> in the 1980s as a better RIP. In the early 1990s it was replaced by <b>Enhanced IGRP</b>, which added the <b>DUAL</b> (Diffusing Update Algorithm) loop-free convergence engine designed by J.J. Garcia-Luna-Aceves. For two decades EIGRP was Cisco-proprietary. In 2016 Cisco published its basic operation as an informational RFC (RFC 7868), but in practice EIGRP still runs almost only on Cisco gear. Older books call it a "hybrid" protocol; Cisco's current term, and the one the exam uses, is <b>advanced distance vector</b>.</p>

<h3>Why "advanced"?</h3>
<table class="cmp"><tr><th>Feature</th><th>What it gives you</th></tr>
<tr><td>DUAL</td><td>Loop-free paths at every instant, and instant failover to a feasible successor</td></tr>
<tr><td>Topology table</td><td>Every neighbour's advertised distance is remembered, so backups are pre-computed</td></tr>
<tr><td>Partial, bounded updates</td><td>No periodic full updates; only changes, only to routers that need them</td></tr>
<tr><td>RTP</td><td>Updates, Queries and Replies are acknowledged and retransmitted if lost</td></tr>
<tr><td>Composite metric</td><td>Bandwidth and delay by default, far richer than RIP's hop count</td></tr>
<tr><td>Unequal-cost load balancing</td><td><code>variance</code> lets a slower loop-free path carry a share of traffic, which OSPF cannot do</td></tr>
</table>

<div class="eg"><p><b>Worked example: the three numbers you will earn in lab 1.</b> On R1, the Noida LAN 192.168.30.0/24 is reached through R2 with a total metric of <b>3328</b>; that is the <b>feasible distance</b>. The direct 10 Mbps link to R3 costs <b>256512</b>, far worse, yet R3's own distance to its LAN is only <b>2816</b>. Because 2816 is less than 3328, R3 cannot possibly be routing back through R1, so the slow link is a proven loop-free backup: a <b>feasible successor</b>. By chapter 7 you will calculate each of these numbers by hand.</p></div>

<p>Key numbers to memorise from day one: EIGRP runs directly over IP as <b>protocol 88</b>, uses multicast <b>224.0.0.10</b> (IPv6: FF02::A), and has an administrative distance of <b>90</b> for internal routes (code <code>D</code>), <b>170</b> for external routes (<code>D EX</code>) and <b>5</b> for a locally generated summary.</p>

<div class="warn"><p><b>Common mistake.</b> Describing EIGRP as link state because it "keeps a topology table". The EIGRP topology table holds only what neighbours advertised (their distances), not a map of every link in the network. No EIGRP router knows the full topology.</p></div>

<div class="exam"><p><b>Exam trap.</b> OSPF is IP protocol <b>89</b> with 224.0.0.5/6; EIGRP is IP protocol <b>88</b> with 224.0.0.10. EIGRP does not use TCP or UDP at all; RTP is its own reliability layer inside protocol 88.</p></div>

<div class="scn"><h4>Choosing a protocol for a Cisco-only WAN</h4><p>A retail chain ran 60 Cisco branch routers, each with a fast MPLS link and a slower broadband VPN. The network team wanted both links to carry traffic in proportion to their speed and wanted failover in under a second. They picked EIGRP: feasible successors gave instant failover, and <code>variance</code> spread flows over both links. Two years later a firewall vendor that did not support EIGRP was introduced at the data centre, and the team had to redistribute between EIGRP and OSPF at that edge.</p><p><b>Lesson:</b> EIGRP shines in Cisco-only networks that want fast failover and unequal-cost load balancing; in multi-vendor environments OSPF is usually the safer choice.</p></div>

<div class="iv"><p class="q">"Why is EIGRP called an advanced distance-vector protocol and not a link-state protocol?"</p><p>Strong answer: a router learns only distances and next hops from its neighbours, never the full topology, so it is distance vector. It is "advanced" because it adds DUAL for loop-free convergence with pre-computed feasible successors, a topology table of all neighbours' advertised distances, reliable partial updates over RTP instead of periodic full updates, and a composite metric. Mention protocol 88, 224.0.0.10 and AD 90/170.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EIGRP is an advanced distance-vector protocol: routers learn distances from neighbours, never the whole map.</li>
<li>DUAL keeps every path loop-free and promotes a pre-computed feasible successor instantly.</li>
<li>Updates are partial, bounded and reliable (RTP); there are no periodic full updates.</li>
<li>IP protocol 88, multicast 224.0.0.10, AD 90 internal, 170 external, 5 summary.</li>
<li>EIGRP is Cisco-originated (informational RFC 7868) and uniquely supports unequal-cost load balancing.</li>
</ul></div>
`,hi:`
<h3>Aap kya seekhoge</h3>
<ul>
<li>EIGRP ko <b>advanced distance-vector</b> protocol kyun kehte hain, aur yeh RIP aur link-state OSPF se kaise alag hai.</li>
<li>EIGRP ke paanch packet types, Reliable Transport Protocol (RTP) aur woh teen tables jo har EIGRP router rakhta hai.</li>
<li>Do routers ko neighbour banne ke liye kin cheezon par agree karna padta hai (AS number, K values, subnet, authentication).</li>
<li>Composite metric: bandwidth plus delay, K values, aur named mode ke 64-bit <b>wide metrics</b>, real calculations ke saath.</li>
<li>DUAL gehraai se: feasible distance, reported distance, successor, feasible successor aur feasibility condition.</li>
<li>Classic aur named-mode configuration, passive interfaces, summarisation, stub routing aur <code>variance</code> se unequal-cost load balancing.</li>
<li>Queries aur stuck-in-active concept level par, poora EIGRP vs OSPF comparison (ENCOR blueprint 3.2.a), aur ek troubleshooting workflow jo teeno labs ko walk karta hai.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapko IPv4 subnetting aur wildcard masks, administrative distance (AD) ka idea, static routes, aur CCNA wala single-area OSPF aana chahiye. Agar inme se kuch kamzor lage, to pehle CCNA OSPF aur static routing modules dobara dekho. Agla module, <b>ENCOR OSPF</b>, multi-area OSPF mein gehraai se jaata hai; yahan hum sirf dono ko compare karte hain. Baad mein ENARSI EIGRP module stuck-in-active troubleshooting aur advanced named-mode features mein aur aage jaata hai.</p>

<h3>Ek analogy: courier hubs jo apne neighbours par bharosa karte hain</h3>
<p>Poore India mein courier hubs ki ek chain socho. Kisi hub ke paas desh ka poora map nahi hai. Iski jagah har hub apne direct neighbours se poochta hai, "Aap Noida se kitni door ho?" aur us neighbour tak pahunchne ki distance usme jod deta hai. Yahi <b>distance vector</b> hai: aap apne bagal walon se ek distance aur ek direction seekhte ho.</p>
<p>Purane style ke hubs (RIP) har 30 second apni poori list chillate the, kuch badla ho ya nahi, aur jab koi road band hoti thi to unhe wait karna padta tha aur tab tak gossip karni padti thi jab tak sab agree na kar lein. EIGRP hubs zyada smart hain. Woh poori list sirf ek baar bhejte hain, jab pehli baar kisi neighbour se milte hain, aur uske baad sirf <b>changes</b> bhejte hain, sirf un hubs ko jinhe farak padta hai. Har delivery note par signature hota hai, isliye kuch khota nahi. Sabse zaroori baat, har hub ek <b>pre-approved backup courier</b> rakhta hai: ek neighbour jo mathematically proven hai ki parcel ko wapas is hub se nahi bhejega. Jab main road band hoti hai, hub kisi se poochhe bina milliseconds mein backup par switch kar leta hai.</p>
<p>OSPF hubs alag tarike se kaam karte hain. Har hub poora road map (link-state database) khareedta hai aur routes khud compute karta hai. Dono approaches kaam karte hain; bas alag trade-offs karte hain, aur ENCOR chahta hai ki aap dono ko compare kar sako.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Pehle lab ka teen-site WAN">
<rect x="250" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">R2 core</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">EIGRP AS 100</text>
<rect x="40" y="120" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="110" y="142" text-anchor="middle" class="svg-ink" font-size="14">R1 Jaipur</text><text x="110" y="160" text-anchor="middle" class="svg-muted" font-size="12">1.1.1.1</text>
<rect x="460" y="120" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="530" y="142" text-anchor="middle" class="svg-ink" font-size="14">R3 Noida DC</text><text x="530" y="160" text-anchor="middle" class="svg-muted" font-size="12">3.3.3.3</text>
<line x1="180" y1="130" x2="250" y2="55" stroke="#64748b" stroke-width="3"/><text x="160" y="85" class="svg-muted" font-size="12">10.0.12.0/24</text>
<line x1="390" y1="55" x2="460" y2="130" stroke="#64748b" stroke-width="3"/><text x="420" y="85" class="svg-muted" font-size="12">10.0.23.0/24</text>
<line x1="180" y1="155" x2="460" y2="155" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6 4"/><text x="320" y="148" text-anchor="middle" class="svg-accent" font-size="12">backup 10 Mbps 10.0.13.0/24</text>
<rect x="40" y="220" width="140" height="44" rx="8" fill="#fde68a"/><text x="110" y="247" text-anchor="middle" class="svg-ink" font-size="12">LAN 192.168.10.0/24</text>
<rect x="460" y="220" width="140" height="44" rx="8" fill="#fde68a"/><text x="530" y="247" text-anchor="middle" class="svg-ink" font-size="12">LAN 192.168.30.0/24</text>
<line x1="110" y1="170" x2="110" y2="220" stroke="#64748b" stroke-width="2"/><line x1="530" y1="170" x2="530" y2="220" stroke="#64748b" stroke-width="2"/>
<text x="320" y="290" text-anchor="middle" class="svg-ink" font-size="12">R1 se R3 ka best path R2 se; slow link feasible successor hai</text>
</svg><p class="cap">Pehle lab ka teen-site WAN. Yeh routers aur addresses aapko lagbhag har chapter mein milenge.</p></div>

<h3>Chhota sa itihaas</h3>
<p>Cisco ne 1980s mein RIP se behtar protocol ke roop mein <b>IGRP</b> banaya. 1990s ki shuruaat mein iski jagah <b>Enhanced IGRP</b> aaya, jisme J.J. Garcia-Luna-Aceves ka design kiya hua <b>DUAL</b> (Diffusing Update Algorithm) loop-free convergence engine joda gaya. Do dashak tak EIGRP Cisco-proprietary raha. 2016 mein Cisco ne iska basic operation ek informational RFC (RFC 7868) ke roop mein publish kiya, lekin practically EIGRP aaj bhi lagbhag sirf Cisco gear par chalta hai. Purani books ise "hybrid" protocol kehti hain; Cisco ka current term, aur exam jo use karta hai, <b>advanced distance vector</b> hai.</p>

<h3>"Advanced" kyun?</h3>
<table class="cmp"><tr><th>Feature</th><th>Aapko kya milta hai</th></tr>
<tr><td>DUAL</td><td>Har pal loop-free paths, aur feasible successor par instant failover</td></tr>
<tr><td>Topology table</td><td>Har neighbour ka advertised distance yaad rakha jaata hai, isliye backups pehle se compute hote hain</td></tr>
<tr><td>Partial, bounded updates</td><td>Koi periodic full update nahi; sirf changes, sirf un routers ko jinhe zaroorat hai</td></tr>
<tr><td>RTP</td><td>Updates, Queries aur Replies ka acknowledgement hota hai aur kho jaane par retransmit hote hain</td></tr>
<tr><td>Composite metric</td><td>Default mein bandwidth aur delay, RIP ke hop count se kahin zyada rich</td></tr>
<tr><td>Unequal-cost load balancing</td><td><code>variance</code> ek slow loop-free path ko bhi traffic ka hissa dene deta hai, jo OSPF nahi kar sakta</td></tr>
</table>

<div class="eg"><p><b>Worked example: woh teen numbers jo aap lab 1 mein kamaoge.</b> R1 par Noida LAN 192.168.30.0/24 R2 ke through <b>3328</b> ke total metric par pahunchta hai; yahi <b>feasible distance</b> hai. R3 tak ka direct 10 Mbps link <b>256512</b> ka padta hai, bahut kharab, phir bhi R3 ka apne LAN tak ka distance sirf <b>2816</b> hai. Kyunki 2816, 3328 se kam hai, R3 kisi haal mein R1 ke through wapas route nahi kar raha ho sakta, isliye slow link ek proven loop-free backup hai: ek <b>feasible successor</b>. Chapter 7 tak aap in sab numbers ko haath se calculate kar loge.</p></div>

<p>Pehle din se yaad karne wale key numbers: EIGRP seedha IP par <b>protocol 88</b> ke roop mein chalta hai, multicast <b>224.0.0.10</b> use karta hai (IPv6: FF02::A), aur iska administrative distance internal routes (code <code>D</code>) ke liye <b>90</b>, external routes (<code>D EX</code>) ke liye <b>170</b> aur locally generated summary ke liye <b>5</b> hai.</p>

<div class="warn"><p><b>Common galti.</b> EIGRP ko link state bolna kyunki woh "topology table rakhta hai". EIGRP topology table mein sirf wahi hota hai jo neighbours ne advertise kiya (unke distances), network ke har link ka map nahi. Kisi EIGRP router ko poori topology nahi pata hoti.</p></div>

<div class="exam"><p><b>Exam trap.</b> OSPF IP protocol <b>89</b> hai 224.0.0.5/6 ke saath; EIGRP IP protocol <b>88</b> hai 224.0.0.10 ke saath. EIGRP TCP ya UDP bilkul use nahi karta; RTP protocol 88 ke andar uski apni reliability layer hai.</p></div>

<div class="scn"><h4>Cisco-only WAN ke liye protocol chunna</h4><p>Ek retail chain ke paas 60 Cisco branch routers the, har ek par ek fast MPLS link aur ek slow broadband VPN. Network team chahti thi ki dono links apni speed ke anupaat mein traffic le jaayein aur failover ek second se kam mein ho. Unhone EIGRP chuna: feasible successors se instant failover mila, aur <code>variance</code> ne flows ko dono links par baant diya. Do saal baad data centre par ek firewall vendor aaya jo EIGRP support nahi karta tha, aur team ko us edge par EIGRP aur OSPF ke beech redistribute karna pada.</p><p><b>Seekh:</b> EIGRP un Cisco-only networks mein chamakta hai jinhe fast failover aur unequal-cost load balancing chahiye; multi-vendor environments mein OSPF aam taur par zyada safe choice hai.</p></div>

<div class="iv"><p class="q">"EIGRP ko advanced distance-vector protocol kyun kehte hain, link-state protocol kyun nahi?"</p><p>Strong answer: router apne neighbours se sirf distances aur next hops seekhta hai, poori topology kabhi nahi, isliye yeh distance vector hai. Yeh "advanced" isliye hai kyunki isme pre-computed feasible successors ke saath loop-free convergence ke liye DUAL, saare neighbours ke advertised distances ki topology table, periodic full updates ki jagah RTP par reliable partial updates, aur ek composite metric hai. Protocol 88, 224.0.0.10 aur AD 90/170 zaroor bolo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EIGRP advanced distance-vector protocol hai: routers neighbours se distances seekhte hain, poora map kabhi nahi.</li>
<li>DUAL har path ko loop-free rakhta hai aur pre-computed feasible successor ko turant promote karta hai.</li>
<li>Updates partial, bounded aur reliable (RTP) hain; koi periodic full update nahi.</li>
<li>IP protocol 88, multicast 224.0.0.10, AD 90 internal, 170 external, 5 summary.</li>
<li>EIGRP Cisco ka banaya hua hai (informational RFC 7868) aur akela aisa hai jo unequal-cost load balancing support karta hai.</li>
</ul></div>
`}};export{e as default};