var e={id:`ti-lfa`,h:{en:`TI-LFA: topology-independent fast reroute`,hi:`TI-LFA: topology-independent fast reroute`},body:{en:`
<p>In the TE module you saw FRR with backup tunnels that someone must design. TI-LFA gives the same 50 ms repair <b>automatically</b>, with no tunnels, no RSVP and a guarantee that it works in any topology. It is like a driver whose sat-nav already has the best detour pre-loaded for every possible blocked road, and the detour is the route the traffic would take after the network converges anyway.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="TI-LFA finds a P node (reachable from S) and a Q node (can reach the destination) and encodes the repair as a short segment list."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Source S</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">PLR, detects failure</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Protected link</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">fails</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">P node</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">reachable, safe</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Q node</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">reaches dest safely</text><text x="320" y="128" text-anchor="middle" class="svg-accent" font-size="12">Repair path = post-convergence path, loop-free by construction</text></svg><p class="cap">TI-LFA finds a P node (reachable from S) and a Q node (can reach the destination) and encodes the repair as a short segment list.</p></div>
<h3>From LFA to TI-LFA</h3>
<table class="cmp"><tr><th>Technique</th><th>Idea</th><th>Coverage</th></tr><tr><td>Basic LFA (RFC 5286)</td><td>A neighbour that reaches the destination without looping back through S</td><td>Partial; depends on topology</td></tr><tr><td>Remote LFA (RFC 7490)</td><td>Tunnel (LDP) to a remote PQ node that is safe</td><td>Better, but not complete; needs LDP</td></tr><tr><td>TI-LFA</td><td>Compute the post-convergence path and steer onto it with an SR segment list</td><td>Complete for link and node protection, with enough SID depth</td></tr></table>
<p><b>Basic LFA</b> asks: does a neighbour N of the protecting router S exist such that N forwards to the destination D without sending the packet back through S? The inequality (the loop-free condition) is <code>distance(N,D) &lt; distance(N,S) + distance(S,D)</code>. In ring topologies no such neighbour often exists, so there is no protection. TI-LFA removes that limit.</p>
<h3>How TI-LFA computes the repair</h3>
<ol>
<li><b>Step 1: remove the failed element</b> (link, node or SRLG) from the topology the router knows from IS-IS.</li>
<li><b>Step 2: run SPF without it.</b> The result is the <b>post-convergence path</b>, the path the IGP will use after it reconverges.</li>
<li><b>Step 3: compute the P-space.</b> The P-space is the set of nodes the PLR can reach by its normal shortest paths without passing through the failed element.</li>
<li><b>Step 4: compute the Q-space.</b> The Q-space is the set of nodes that can reach the destination by their normal shortest paths without passing through the failed element.</li>
<li><b>Step 5: find the repair.</b> If a node lies in both P and Q (a <b>PQ node</b>), one prefix-SID is enough: send the traffic to the PQ node, which then continues. If P and Q do not intersect, the PLR sends the traffic to a P node and then uses an adjacency-SID to cross a single link into a Q node. This is why the list needs at most a few segments.</li>
</ol>
<h3>Segments in the repair list</h3>
<p>The repair list is usually short: zero to two segments, sometimes more in complex topologies. The first segment is a prefix-SID of P (or an adjacency-SID of the first link), and the second is an adjacency-SID of the link between P and Q or a prefix-SID of Q. The platform <b>MSD</b> limits how many labels can be pushed, so check it for large rings. Because the segments are only labels, the repair goes through the same forwarding hardware at full speed.</p>
<h3>Protection types</h3>
<ul>
<li><b>Link protection.</b> Repair path avoids the failed link. This is the default.</li>
<li><b>Node protection.</b> Repair path avoids the next hop router. Enabled with a tiebreaker such as <code>node-protecting</code>; preferred when whole-router failure matters.</li>
<li><b>SRLG protection.</b> Repair path avoids all links in the same shared risk group as the failed link.</li>
<li><b>Tiebreakers.</b> When several repair paths exist, rules decide: node-protecting, SRLG-disjoint, lowest metric, primary-path ECMP and so on.</li>
</ul>
<h3>Microloops</h3>
<p>When the failure is detected, the PLR switches to the repair path at once. The rest of the network, however, converges at different times. During that interval, two routers that have updated their tables at different moments can send a packet back and forth: a <b>microloop</b>. The repair itself is loop-free, but the <i>transition</i> from repair to new path may not be. <b>SR microloop avoidance</b> makes routers install a temporary segment list that guides the packets safely along the post-convergence path while the network settles, then updates to the normal path after a timer.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XR</span>
router isis CORE
 address-family ipv4 unicast
  microloop avoidance segment-routing
  microloop avoidance rib-update-delay 5000
<span class="c"> !</span>
 interface TenGigE0/0/0/1
  address-family ipv4 unicast
   fast-reroute per-prefix
   fast-reroute per-prefix ti-lfa
   fast-reroute per-prefix tiebreaker node-protecting index 100
<span class="c">  !</span>
<span class="c"> !</span>
<span class="c">! IOS XE (keyword placement can vary by release)</span>
router isis CORE
 fast-reroute per-prefix level-2 all
 fast-reroute ti-lfa level-2</pre>
<p>Enable TI-LFA on every core interface, both directions. Verify with <code>show isis fast-reroute detail</code>: for each prefix, the output lists the primary path, the repair path and the protection type (link, node or SRLG). We do not print sample output because this module has no lab.</p>
<h3>TI-LFA versus MPLS-TE FRR</h3>
<table class="cmp"><tr><th>Aspect</th><th>MPLS-TE FRR</th><th>TI-LFA</th></tr><tr><td>Backup tunnels</td><td>Configured or auto-tunnel; signalled with RSVP</td><td>None, computed in the IGP</td></tr><tr><td>Protects</td><td>Only LSPs that use the TE tunnel</td><td>All traffic: IP, SR-MPLS, LDP, services</td></tr><tr><td>Backup path quality</td><td>Whatever the tunnel path is</td><td>Post-convergence path</td></tr><tr><td>Operations</td><td>Per-interface backups, bandwidth</td><td>One command per interface</td></tr><tr><td>Topology limits</td><td>Manual design</td><td>Complete coverage in theory, bound by SID depth</td></tr></table>
<div class="eg"><p><b>Worked example.</b> A ring of six routers A, B, C, D, E, F with equal metrics. Traffic from A to C normally goes A, B, C. The link A to B fails. Basic LFA finds no loop-free neighbour on A: F is at distance 3 from C, and distance(F,A) + distance(A,C) is also 3, so the strict inequality fails and F might send the packet back to A. TI-LFA removes the link A-B, runs SPF and gets the post-convergence path A, F, E, D, C. It then encodes that path as a short segment list (a prefix-SID of a node on the path, plus an adjacency-SID where a single link must be forced). A pushes the labels and the packet follows A, F, E, D, C within 50 ms. Metrics are only illustrative.</p></div>
<div class="warn"><p><b>Common mistake.</b> Enabling TI-LFA on only one side of a link or only on some interfaces. The router that does not run it has no repair for traffic that arrives from the other side. Also, ignoring MSD: on a platform with a small MSD, a long repair list may not be installable and the prefix is left unprotected.</p></div>
<div class="exam"><p><b>Exam trap.</b> TI-LFA uses the <b>post-convergence</b> path, the one the IGP will pick after the failure, so there is no second, temporary path to re-optimise. It needs no RSVP and no LDP. It provides link, node and SRLG protection and relies on SR for the repair stack. Detection speed (LOS or BFD) still defines the total repair time.</p></div>
<div class="scn"><h4>The ring that LFA could not protect</h4><p>A metro ring of eight routers had no LFA coverage for many prefixes, and a fibre cut meant 800 ms of loss while IS-IS reconverged. After enabling SR and TI-LFA, the same cut was repaired in under 50 ms. The network team also enabled microloop avoidance, because a test showed brief loops for other prefixes during the transition.</p><p><b>Lesson:</b> TI-LFA covers topologies that LFA cannot; add microloop avoidance for the transition.</p></div>
<div class="iv"><p class="q">"How does TI-LFA work and why is it called topology independent?"</p><p>TI-LFA precomputes, for each destination and each protected failure, the post-convergence path. It finds the P-space (nodes reachable from the PLR without using the failed link), the Q-space (nodes that reach the destination without using it), and builds a segment list using a P node, an optional adjacency-SID and a Q node to carry the packet along that path. It works in any topology because the SR stack can express any path, so coverage does not depend on neighbour distances. Repair is about 50 ms and needs no RSVP or tunnels.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>TI-LFA gives automatic 50 ms repair along the post-convergence path.</li>
<li>P-space and Q-space define the repair; the repair list is a short segment stack.</li>
<li>Link, node and SRLG protection; tiebreakers choose among repairs.</li>
<li>Microloop avoidance protects the transition after the repair.</li>
<li>Needs SR only; no RSVP, no LDP; limited by platform MSD.</li>
</ul></div>
`,hi:`
<p>TE module mein aapne backup tunnels wala FRR dekha jise kisi ko design karna padta hai. TI-LFA wahi 50 ms repair <b>automatically</b> deta hai, bina tunnels, bina RSVP aur is guarantee ke saath ki yeh kisi bhi topology mein kaam karta hai. Yeh aise driver jaisa hai jiske sat-nav mein har possible blocked road ke liye behtareen detour pehle se loaded hai, aur woh detour wahi route hai jo network converge hone ke baad traffic waise bhi lega.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="TI-LFA P node (S se reachable) aur Q node (destination tak pahunch sakta hai) dhoondta hai aur repair ko chhoti segment list mein encode karta hai."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Source S</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">PLR, failure detect karta hai</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Protected link</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">fail hota hai</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">P node</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">reachable, safe</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Q node</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">destination tak safely pahunchta hai</text><text x="320" y="128" text-anchor="middle" class="svg-accent" font-size="12">Repair path = post-convergence path, construction se loop-free</text></svg><p class="cap">TI-LFA P node (S se reachable) aur Q node (destination tak pahunch sakta hai) dhoondta hai aur repair ko chhoti segment list mein encode karta hai.</p></div>
<h3>LFA se TI-LFA tak</h3>
<table class="cmp"><tr><th>Technique</th><th>Idea</th><th>Coverage</th></tr><tr><td>Basic LFA (RFC 5286)</td><td>Aisa neighbour jo destination tak S se wapas loop kiye bina pahunchata hai</td><td>Partial; topology par depend</td></tr><tr><td>Remote LFA (RFC 7490)</td><td>Safe remote PQ node tak (LDP) tunnel</td><td>Behtar, lekin complete nahi; LDP chahiye</td></tr><tr><td>TI-LFA</td><td>Post-convergence path compute karo aur SR segment list se us par steer karo</td><td>Link aur node protection ke liye complete, SID depth kaafi ho to</td></tr></table>
<p><b>Basic LFA</b> poochta hai: kya protecting router S ka koi neighbour N hai jo packet S se wapas bheje bina destination D tak forward karta hai? Inequality (loop-free condition) hai <code>distance(N,D) &lt; distance(N,S) + distance(S,D)</code>. Ring topologies mein aisa neighbour aksar nahi milta, isliye protection nahi. TI-LFA yeh limit hata deta hai.</p>
<h3>TI-LFA repair kaise compute karta hai</h3>
<ol>
<li><b>Step 1: failed element hatao</b> (link, node ya SRLG) us topology se jo router ko IS-IS se pata hai.</li>
<li><b>Step 2: uske bina SPF chalao.</b> Result <b>post-convergence path</b> hai, jo path IGP reconverge hone ke baad use karega.</li>
<li><b>Step 3: P-space compute karo.</b> P-space un nodes ka set hai jinhe PLR apne normal shortest paths se failed element se guzare bina pahunch sakta hai.</li>
<li><b>Step 4: Q-space compute karo.</b> Q-space un nodes ka set hai jo apne normal shortest paths se failed element se guzare bina destination tak pahunch sakte hain.</li>
<li><b>Step 5: repair dhoondo.</b> Koi node P aur Q dono mein ho (<b>PQ node</b>) to ek prefix-SID kaafi hai: traffic PQ node ko bhejo, jo aage badhata hai. P aur Q intersect na karein to PLR traffic ko P node ko bhejta hai aur phir adjacency-SID se ek link cross karke Q node mein jaata hai. Isi wajah se list mein adhiktam kuch hi segments chahiye.</li>
</ol>
<h3>Repair list ke segments</h3>
<p>Repair list aam taur par chhoti hoti hai: zero se do segments, complex topologies mein kabhi zyada. Pehla segment P ka prefix-SID (ya pehle link ka adjacency-SID) hai, aur doosra P aur Q ke beech link ka adjacency-SID ya Q ka prefix-SID. Platform ka <b>MSD</b> limit karta hai ki kitne labels push ho sakte hain, isliye bade rings ke liye use check karo. Segments sirf labels hain, isliye repair same forwarding hardware se full speed par jaata hai.</p>
<h3>Protection types</h3>
<ul>
<li><b>Link protection.</b> Repair path failed link se bachta hai. Yeh default hai.</li>
<li><b>Node protection.</b> Repair path next hop router se bachta hai. <code>node-protecting</code> jaise tiebreaker se enable hota hai; poore router ka failure matter kare to preferred.</li>
<li><b>SRLG protection.</b> Repair path failed link ke same shared risk group ke saare links se bachta hai.</li>
<li><b>Tiebreakers.</b> Kai repair paths hon to rules decide karte hain: node-protecting, SRLG-disjoint, lowest metric, primary-path ECMP waghera.</li>
</ul>
<h3>Microloops</h3>
<p>Failure detect hote hi PLR turant repair path par switch karta hai. Lekin baaki network alag-alag samay par converge hota hai. Us interval mein do routers jinhone alag moments par tables update kiye, packet ko aage-peeche bhej sakte hain: <b>microloop</b>. Repair khud loop-free hai, lekin repair se naye path tak <i>transition</i> shayad nahi. <b>SR microloop avoidance</b> routers ko temporary segment list install karwata hai jo network settle hone tak packets ko post-convergence path par safely guide karti hai, phir timer ke baad normal path par update hoti hai.</p>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
<span class="c">! IOS XR</span>
router isis CORE
 address-family ipv4 unicast
  microloop avoidance segment-routing
  microloop avoidance rib-update-delay 5000
<span class="c"> !</span>
 interface TenGigE0/0/0/1
  address-family ipv4 unicast
   fast-reroute per-prefix
   fast-reroute per-prefix ti-lfa
   fast-reroute per-prefix tiebreaker node-protecting index 100
<span class="c">  !</span>
<span class="c"> !</span>
<span class="c">! IOS XE (keyword placement release ke hisaab se badal sakta hai)</span>
router isis CORE
 fast-reroute per-prefix level-2 all
 fast-reroute ti-lfa level-2</pre>
<p>TI-LFA ko har core interface par, dono directions mein, enable karo. <code>show isis fast-reroute detail</code> se verify karo: har prefix ke liye output primary path, repair path aur protection type (link, node ya SRLG) list karta hai. Sample output nahi chhapa kyunki is module ka lab nahi hai.</p>
<h3>TI-LFA versus MPLS-TE FRR</h3>
<table class="cmp"><tr><th>Pehlu</th><th>MPLS-TE FRR</th><th>TI-LFA</th></tr><tr><td>Backup tunnels</td><td>Configured ya auto-tunnel; RSVP se signalled</td><td>Koi nahi, IGP mein compute hota hai</td></tr><tr><td>Kya protect karta hai</td><td>Sirf TE tunnel use karne wale LSPs</td><td>Saara traffic: IP, SR-MPLS, LDP, services</td></tr><tr><td>Backup path quality</td><td>Jo bhi tunnel path ho</td><td>Post-convergence path</td></tr><tr><td>Operations</td><td>Per-interface backups, bandwidth</td><td>Har interface par ek command</td></tr><tr><td>Topology limits</td><td>Manual design</td><td>Theory mein complete coverage, SID depth se bandha</td></tr></table>
<div class="eg"><p><b>Worked example.</b> Chhe routers A, B, C, D, E, F ka ring, equal metrics. A se C ka traffic normally A, B, C se jaata hai. A aur B ke beech link fail hota hai. Basic LFA ko A par koi loop-free neighbour nahi milta: F, C se distance 3 par hai, aur distance(F,A) + distance(A,C) bhi 3 hai, isliye strict inequality fail hoti hai aur F packet wapas A ko bhej sakta hai. TI-LFA link A-B hatata hai, SPF chalata hai aur post-convergence path A, F, E, D, C paata hai. Phir use chhoti segment list mein encode karta hai (path ke kisi node ka prefix-SID, aur jahan ek single link force karna ho wahan adjacency-SID). A labels push karta hai aur packet 50 ms ke andar A, F, E, D, C follow karta hai. Metrics sirf illustrative hain.</p></div>
<div class="warn"><p><b>Common mistake.</b> TI-LFA ko link ki sirf ek side ya sirf kuch interfaces par enable karna. Jo router isse nahi chalata uske paas doosri taraf se aate traffic ke liye repair nahi hota. Aur MSD ko ignore karna: chhote MSD wale platform par lambi repair list install nahi ho sakti aur prefix unprotected reh jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> TI-LFA <b>post-convergence</b> path use karta hai, jo IGP failure ke baad chunega, isliye koi doosra temporary path re-optimise karne ko nahi. Ise RSVP aur LDP nahi chahiye. Yeh link, node aur SRLG protection deta hai aur repair stack ke liye SR par depend karta hai. Detection speed (LOS ya BFD) abhi bhi total repair time tay karti hai.</p></div>
<div class="scn"><h4>Ring jise LFA protect nahi kar paya</h4><p>Aath routers ke metro ring mein kai prefixes ke liye LFA coverage nahi thi, aur fibre cut ka matlab tha 800 ms loss jab tak IS-IS reconverge hua. SR aur TI-LFA enable karne ke baad wahi cut 50 ms se kam mein repair hua. Network team ne microloop avoidance bhi enable kiya, kyunki ek test mein doosre prefixes ke liye transition ke dauran chhote loops dikhe.</p><p><b>Lesson:</b> TI-LFA un topologies ko cover karta hai jo LFA nahi kar sakta; transition ke liye microloop avoidance jodo.</p></div>
<div class="iv"><p class="q">"TI-LFA kaise kaam karta hai aur ise topology independent kyun kehte hain?"</p><p>TI-LFA har destination aur har protected failure ke liye post-convergence path pehle se compute karta hai. Woh P-space (PLR se failed link use kiye bina reachable nodes), Q-space (jo use kiye bina destination tak pahunchte hain) dhoondta hai, aur P node, optional adjacency-SID aur Q node se segment list banata hai jo packet ko us path par le jaati hai. Yeh kisi bhi topology mein kaam karta hai kyunki SR stack koi bhi path express kar sakta hai, isliye coverage neighbour distances par depend nahi karti. Repair lagbhag 50 ms hai aur RSVP ya tunnels nahi chahiye.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>TI-LFA post-convergence path par automatic 50 ms repair deta hai.</li>
<li>P-space aur Q-space repair define karte hain; repair list chhota segment stack hai.</li>
<li>Link, node aur SRLG protection; tiebreakers repairs ke beech chunte hain.</li>
<li>Microloop avoidance repair ke baad transition ko protect karta hai.</li>
<li>Sirf SR chahiye; RSVP nahi, LDP nahi; platform MSD se limited.</li>
</ul></div>
`}};export{e as default};