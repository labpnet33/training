var e={id:`distribution-trees`,h:{en:`Distribution trees: source trees (S,G) and shared trees (*,G)`,hi:`Distribution trees: source trees (S,G) aur shared trees (*,G)`},body:{en:`
<p>Think of how water reaches the houses in a town. Water leaves the treatment plant through one main pipe, which splits into smaller pipes, which split again toward each street. Water never flows in a circle, and a street with no houses gets no pipe. A multicast <b>distribution tree</b> is exactly that network of pipes: rooted at the source (or at a meeting point), branching only toward LANs that have receivers, and never containing a loop.</p>

<h3>The vocabulary of a tree</h3>
<dl class="terms">
<dt>Upstream / downstream</dt><dd>Upstream means toward the source (or toward the RP); downstream means toward the receivers. Joins travel upstream; data travels downstream.</dd>
<dt>Incoming interface (IIF)</dt><dd>The one interface on which a router accepts packets for a tree. It always points upstream and is chosen by the RPF check (next chapter).</dd>
<dt>Outgoing interface list (OIL)</dt><dd>The interfaces a router copies the packet onto. An interface is added when a downstream PIM neighbour joins or a local host reports with IGMP; it is removed by a prune or a timeout.</dd>
<dt>First-hop router (FHR)</dt><dd>The router on the source's LAN (in our lab, R1 for the studio PC1 at 10.1.1.10).</dd>
<dt>Last-hop router (LHR)</dt><dd>The router on a receiver LAN (R3 and R4 in the lab).</dd>
<dt>Multicast state</dt><dd>An entry in the multicast routing table (<code>show ip mroute</code>) holding the IIF and OIL for one tree.</dd>
</dl>

<h3>Source tree: (S,G), the shortest-path tree</h3>
<p>A <b>source tree</b> is rooted at the source itself and follows the shortest unicast path from the source to every receiver. It is also called the <b>shortest-path tree (SPT)</b>. Its state is written <b>(S,G)</b>, pronounced "S comma G": one specific source S sending to group G. For example <b>(10.1.1.10, 239.10.10.10)</b>.</p>
<ul>
<li><b>Pro</b>: optimal path and lowest latency; no single meeting point in the data path.</li>
<li><b>Con</b>: one entry per source per group in every router on the tree. A video wall with 50 cameras in the same group means 50 (S,G) entries per router.</li>
<li><b>Con</b>: the receivers' routers must already know the source address to build it.</li>
</ul>

<h3>Shared tree: (*,G), the RP tree</h3>
<p>A <b>shared tree</b> is rooted at a chosen router called the <b>Rendezvous Point (RP)</b>. Every source for the group sends to the RP, and the RP forwards down one common tree to all receivers. Its state is written <b>(*,G)</b>, "star comma G": any source, group G. It is also called the <b>RP tree (RPT)</b>.</p>
<ul>
<li><b>Pro</b>: one entry per group regardless of how many sources exist, and receivers do not need to know the sources in advance. They only need to know the RP.</li>
<li><b>Con</b>: traffic may take a longer path (source to RP, then RP to receiver), and the RP becomes a potential bottleneck and single point of failure.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Source tree versus shared tree">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">Source tree (S,G)</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">Shared tree (*,G)</text>
<rect x="30" y="40" width="80" height="30" rx="6" fill="#bbf7d0"/><text x="70" y="60" text-anchor="middle" class="svg-ink" font-size="12">Source S</text>
<rect x="40" y="110" width="60" height="30" rx="6" fill="#bae6fd"/><text x="70" y="130" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<rect x="200" y="110" width="60" height="30" rx="6" fill="#e2e8f0"/><text x="230" y="130" text-anchor="middle" class="svg-muted" font-size="12">R2</text>
<rect x="40" y="200" width="60" height="30" rx="6" fill="#bae6fd"/><text x="70" y="220" text-anchor="middle" class="svg-ink" font-size="12">R3</text>
<rect x="200" y="200" width="80" height="30" rx="6" fill="#fde68a"/><text x="240" y="220" text-anchor="middle" class="svg-ink" font-size="12">Rcvr</text>
<line x1="70" y1="70" x2="70" y2="110" stroke="#64748b" stroke-width="3"/><line x1="70" y1="140" x2="70" y2="200" stroke="#64748b" stroke-width="3"/><line x1="100" y1="215" x2="200" y2="215" stroke="#64748b" stroke-width="3"/>
<line x1="100" y1="125" x2="200" y2="125" stroke="#64748b" stroke-dasharray="4 4"/>
<rect x="350" y="40" width="80" height="30" rx="6" fill="#bbf7d0"/><text x="390" y="60" text-anchor="middle" class="svg-ink" font-size="12">Source S</text>
<rect x="360" y="110" width="60" height="30" rx="6" fill="#bae6fd"/><text x="390" y="130" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<rect x="520" y="110" width="80" height="30" rx="6" fill="#ddd6fe"/><text x="560" y="130" text-anchor="middle" class="svg-ink" font-size="12">R2 = RP</text>
<rect x="360" y="200" width="60" height="30" rx="6" fill="#bae6fd"/><text x="390" y="220" text-anchor="middle" class="svg-ink" font-size="12">R3</text>
<rect x="520" y="200" width="80" height="30" rx="6" fill="#fde68a"/><text x="560" y="220" text-anchor="middle" class="svg-ink" font-size="12">Rcvr</text>
<line x1="390" y1="70" x2="390" y2="110" stroke="#64748b" stroke-width="3"/><line x1="420" y1="125" x2="520" y2="125" stroke="#64748b" stroke-width="3"/><line x1="560" y1="140" x2="560" y2="200" stroke="#64748b" stroke-width="3"/>
<line x1="390" y1="140" x2="390" y2="200" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="320" y="258" text-anchor="middle" class="svg-muted" font-size="12">Thick = data path. The shared tree detours through the RP.</text>
</svg><p class="cap">The same topology: the source tree follows the shortest path, the shared tree always passes the RP.</p></div>

<div class="eg"><p><b>Worked example: counting state.</b> A trading floor uses 20 groups, each with 5 sources, and 12 routers carry them. With source trees only, each router holds up to 20 x 5 = 100 (S,G) entries, 1200 across the network. With shared trees only, each router holds 20 (*,G) entries, 240 in total, at the cost of every packet passing through the RP. PIM sparse mode on IOS uses both: it starts on the shared tree and then moves to the source tree (chapter 8), so it gets easy discovery and optimal paths.</p></div>

<h3>Which protocol uses which tree</h3>
<table class="cmp">
<tr><th>Mode</th><th>Trees used</th><th>Notes</th></tr>
<tr><td>PIM dense mode</td><td>Source trees (S,G) only</td><td>Flood and prune; no RP</td></tr>
<tr><td>PIM sparse mode</td><td>Shared tree (*,G) first, then source tree (S,G)</td><td>Needs an RP; SPT switchover by default</td></tr>
<tr><td>PIM SSM</td><td>Source trees (S,G) only</td><td>Receivers name the source with IGMPv3; no RP</td></tr>
<tr><td>Bidirectional PIM</td><td>Shared tree (*,G) only, traffic flows both ways</td><td>No (S,G) state at all; for many-to-many</td></tr>
</table>

<h3>How it looks in the router</h3>
<p>This is R3, a last-hop router, after a classroom joined 239.10.10.10 and the studio started sending. Do not worry about every flag yet; notice the two kinds of entry.</p>
<pre class="out">R3# show ip mroute 239.10.10.10
<span class="hl">(*, 239.10.10.10), 00:04:10/00:02:53, RP 2.2.2.2, flags: SJC</span>
  Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:04:10/00:02:53

<span class="hl">(10.1.1.10, 239.10.10.10), 00:01:02/00:02:57, flags: T</span>
  Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:01:02/00:02:57</pre>
<p>The (*,G) entry points at the RP 2.2.2.2; the (S,G) entry points at the source 10.1.1.10. In this small lab both happen to leave through Gi0/2 toward R2, because R2 is both the RP and on the shortest path.</p>

<div class="warn"><p><b>Common mistake.</b> Reading (*,G) as "all groups". The star means <b>any source</b> for this one group. (S,G) means one source, one group.</p></div>

<div class="exam"><p><b>Exam trap.</b> Shared tree = (*,G) = rooted at the <b>RP</b>. Source tree = SPT = (S,G) = rooted at the <b>source</b>. Questions often ask which uses more state (source trees) and which may give suboptimal paths (shared trees).</p></div>

<div class="scn"><h4>The RP in the wrong city</h4><p>A retailer placed its only RP in the Delhi data centre. Store cameras in Chennai streamed to a security desk also in Chennai, but video lagged and the Delhi WAN link showed the camera traffic twice, in and out. Sparse mode had been configured with <code>ip pim spt-threshold infinity</code>, which keeps receivers on the shared tree, so every packet detoured through Delhi. Removing that command let the Chennai last-hop router switch to the source tree, and the traffic stayed local.</p><p><b>Lesson:</b> shared trees are simple but can hairpin through a distant RP; source trees follow the shortest path.</p></div>

<div class="iv"><p class="q">"What is the difference between a source tree and a shared tree?"</p><p>Strong answer: a source tree, or SPT, is rooted at the source, noted (S,G), and follows the shortest path; it is optimal but needs one entry per source per group. A shared tree is rooted at the RP, noted (*,G), with one entry per group for all sources; it scales and lets receivers discover sources, but paths may be suboptimal and the RP is critical. Add that PIM-SM starts on the shared tree and switches to the SPT.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A distribution tree has one incoming interface (upstream) and an outgoing interface list (downstream).</li>
<li>Source tree = SPT = (S,G), rooted at the source: optimal path, more state.</li>
<li>Shared tree = RPT = (*,G), rooted at the RP: less state, possible detour.</li>
<li>Dense and SSM use source trees; sparse uses both; bidir uses only the shared tree.</li>
<li>FHR = router on the source LAN; LHR = router on a receiver LAN.</li>
</ul></div>
`,hi:`
<p>Socho shehar ke gharon tak paani kaise pahunchta hai. Paani treatment plant se ek main pipe mein nikalta hai, jo chhoti pipes mein batt-ta hai, jo phir har gali ki taraf batt-ti hain. Paani kabhi gol gol nahi ghoomta, aur jis gali mein ghar nahi, wahan pipe nahi. Multicast <b>distribution tree</b> bilkul pipes ka aisa hi network hai: source par (ya meeting point par) rooted, sirf un LANs ki taraf shaakhein jahan receivers hain, aur kabhi loop nahi.</p>

<h3>Tree ki shabdavali</h3>
<dl class="terms">
<dt>Upstream / downstream</dt><dd>Upstream matlab source (ya RP) ki taraf; downstream matlab receivers ki taraf. Joins upstream chalte hain; data downstream chalta hai.</dd>
<dt>Incoming interface (IIF)</dt><dd>Woh ek interface jis par router kisi tree ke packets accept karta hai. Yeh hamesha upstream point karta hai aur RPF check (agla chapter) se chuna jaata hai.</dd>
<dt>Outgoing interface list (OIL)</dt><dd>Woh interfaces jin par router packet copy karta hai. Interface tab judta hai jab downstream PIM neighbour join kare ya local host IGMP se report kare; prune ya timeout se hat-ta hai.</dd>
<dt>First-hop router (FHR)</dt><dd>Source ke LAN wala router (hamari lab mein studio PC1 10.1.1.10 ke liye R1).</dd>
<dt>Last-hop router (LHR)</dt><dd>Receiver LAN wala router (lab mein R3 aur R4).</dd>
<dt>Multicast state</dt><dd>Multicast routing table (<code>show ip mroute</code>) ki ek entry jo ek tree ka IIF aur OIL rakhti hai.</dd>
</dl>

<h3>Source tree: (S,G), shortest-path tree</h3>
<p><b>Source tree</b> khud source par rooted hota hai aur source se har receiver tak shortest unicast path follow karta hai. Ise <b>shortest-path tree (SPT)</b> bhi kehte hain. Iski state <b>(S,G)</b> likhi jaati hai, bola jaata hai "S comma G": ek specific source S group G par bhej raha hai. Jaise <b>(10.1.1.10, 239.10.10.10)</b>.</p>
<ul>
<li><b>Pro</b>: optimal path aur sabse kam latency; data path mein koi single meeting point nahi.</li>
<li><b>Con</b>: tree ke har router mein har source har group ki ek entry. Same group mein 50 cameras wali video wall matlab har router mein 50 (S,G) entries.</li>
<li><b>Con</b>: ise banane ke liye receivers ke routers ko source address pehle se pata hona chahiye.</li>
</ul>

<h3>Shared tree: (*,G), RP tree</h3>
<p><b>Shared tree</b> ek chune hue router par rooted hota hai jise <b>Rendezvous Point (RP)</b> kehte hain. Group ka har source RP ko bhejta hai, aur RP ek common tree se saare receivers tak forward karta hai. Iski state <b>(*,G)</b> likhi jaati hai, "star comma G": koi bhi source, group G. Ise <b>RP tree (RPT)</b> bhi kehte hain.</p>
<ul>
<li><b>Pro</b>: har group ki ek entry chahe kitne bhi sources hon, aur receivers ko sources pehle se jaanne ki zaroorat nahi. Unhe sirf RP pata hona chahiye.</li>
<li><b>Con</b>: traffic lamba path le sakta hai (source se RP, phir RP se receiver), aur RP potential bottleneck aur single point of failure ban jaata hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Source tree versus shared tree">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">Source tree (S,G)</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">Shared tree (*,G)</text>
<rect x="30" y="40" width="80" height="30" rx="6" fill="#bbf7d0"/><text x="70" y="60" text-anchor="middle" class="svg-ink" font-size="12">Source S</text>
<rect x="40" y="110" width="60" height="30" rx="6" fill="#bae6fd"/><text x="70" y="130" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<rect x="200" y="110" width="60" height="30" rx="6" fill="#e2e8f0"/><text x="230" y="130" text-anchor="middle" class="svg-muted" font-size="12">R2</text>
<rect x="40" y="200" width="60" height="30" rx="6" fill="#bae6fd"/><text x="70" y="220" text-anchor="middle" class="svg-ink" font-size="12">R3</text>
<rect x="200" y="200" width="80" height="30" rx="6" fill="#fde68a"/><text x="240" y="220" text-anchor="middle" class="svg-ink" font-size="12">Rcvr</text>
<line x1="70" y1="70" x2="70" y2="110" stroke="#64748b" stroke-width="3"/><line x1="70" y1="140" x2="70" y2="200" stroke="#64748b" stroke-width="3"/><line x1="100" y1="215" x2="200" y2="215" stroke="#64748b" stroke-width="3"/>
<line x1="100" y1="125" x2="200" y2="125" stroke="#64748b" stroke-dasharray="4 4"/>
<rect x="350" y="40" width="80" height="30" rx="6" fill="#bbf7d0"/><text x="390" y="60" text-anchor="middle" class="svg-ink" font-size="12">Source S</text>
<rect x="360" y="110" width="60" height="30" rx="6" fill="#bae6fd"/><text x="390" y="130" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<rect x="520" y="110" width="80" height="30" rx="6" fill="#ddd6fe"/><text x="560" y="130" text-anchor="middle" class="svg-ink" font-size="12">R2 = RP</text>
<rect x="360" y="200" width="60" height="30" rx="6" fill="#bae6fd"/><text x="390" y="220" text-anchor="middle" class="svg-ink" font-size="12">R3</text>
<rect x="520" y="200" width="80" height="30" rx="6" fill="#fde68a"/><text x="560" y="220" text-anchor="middle" class="svg-ink" font-size="12">Rcvr</text>
<line x1="390" y1="70" x2="390" y2="110" stroke="#64748b" stroke-width="3"/><line x1="420" y1="125" x2="520" y2="125" stroke="#64748b" stroke-width="3"/><line x1="560" y1="140" x2="560" y2="200" stroke="#64748b" stroke-width="3"/>
<line x1="390" y1="140" x2="390" y2="200" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="320" y="258" text-anchor="middle" class="svg-muted" font-size="12">Mota = data path. Shared tree RP se ghoom kar jaata hai.</text>
</svg><p class="cap">Same topology: source tree shortest path follow karta hai, shared tree hamesha RP se guzarta hai.</p></div>

<div class="eg"><p><b>Worked example: state ginna.</b> Ek trading floor 20 groups use karta hai, har ek ke 5 sources, aur 12 routers inhe carry karte hain. Sirf source trees ke saath har router mein 20 x 5 = 100 tak (S,G) entries, poore network mein 1200. Sirf shared trees ke saath har router mein 20 (*,G) entries, kul 240, is keemat par ki har packet RP se guzre. IOS par PIM sparse mode dono use karta hai: shared tree par shuru karta hai aur phir source tree par shift hota hai (chapter 8), isliye use aasaan discovery aur optimal paths dono milte hain.</p></div>

<h3>Kaunsa protocol kaunsa tree use karta hai</h3>
<table class="cmp">
<tr><th>Mode</th><th>Trees used</th><th>Notes</th></tr>
<tr><td>PIM dense mode</td><td>Sirf source trees (S,G)</td><td>Flood and prune; koi RP nahi</td></tr>
<tr><td>PIM sparse mode</td><td>Pehle shared tree (*,G), phir source tree (S,G)</td><td>RP chahiye; default mein SPT switchover</td></tr>
<tr><td>PIM SSM</td><td>Sirf source trees (S,G)</td><td>Receivers IGMPv3 se source batate hain; koi RP nahi</td></tr>
<tr><td>Bidirectional PIM</td><td>Sirf shared tree (*,G), traffic dono taraf</td><td>Bilkul (S,G) state nahi; many-to-many ke liye</td></tr>
</table>

<h3>Router mein kaisa dikhta hai</h3>
<p>Yeh R3 hai, ek last-hop router, jab classroom ne 239.10.10.10 join kiya aur studio ne bhejna shuru kiya. Abhi har flag ki chinta mat karo; do tarah ki entries dekho.</p>
<pre class="out">R3# show ip mroute 239.10.10.10
<span class="hl">(*, 239.10.10.10), 00:04:10/00:02:53, RP 2.2.2.2, flags: SJC</span>
  Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:04:10/00:02:53

<span class="hl">(10.1.1.10, 239.10.10.10), 00:01:02/00:02:57, flags: T</span>
  Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:01:02/00:02:57</pre>
<p>(*,G) entry RP 2.2.2.2 ki taraf point karti hai; (S,G) entry source 10.1.1.10 ki taraf. Is chhoti lab mein dono Gi0/2 se R2 ki taraf nikalti hain, kyunki R2 RP bhi hai aur shortest path par bhi.</p>

<div class="warn"><p><b>Common galti.</b> (*,G) ko "saare groups" padhna. Star ka matlab is ek group ke liye <b>koi bhi source</b>. (S,G) matlab ek source, ek group.</p></div>

<div class="exam"><p><b>Exam trap.</b> Shared tree = (*,G) = <b>RP</b> par rooted. Source tree = SPT = (S,G) = <b>source</b> par rooted. Questions aksar poochte hain kaunsa zyada state use karta hai (source trees) aur kaunsa suboptimal paths de sakta hai (shared trees).</p></div>

<div class="scn"><h4>Galat shehar mein RP</h4><p>Ek retailer ne apna akela RP Delhi data centre mein rakha. Chennai ke store cameras Chennai mein hi ek security desk ko stream karte the, par video lag karta tha aur Delhi WAN link par camera traffic do baar dikhta tha, andar aur bahar. Sparse mode <code>ip pim spt-threshold infinity</code> ke saath configure tha, jo receivers ko shared tree par hi rakhta hai, isliye har packet Delhi se ghoom kar aata tha. Woh command hatane se Chennai last-hop router source tree par switch kar paaya, aur traffic local raha.</p><p><b>Seekh:</b> shared trees simple hain par door ke RP se hairpin kar sakte hain; source trees shortest path follow karte hain.</p></div>

<div class="iv"><p class="q">"Source tree aur shared tree mein kya fark hai?"</p><p>Strong answer: source tree, yaani SPT, source par rooted hai, (S,G) likha jaata hai, aur shortest path follow karta hai; optimal hai par har source har group ki ek entry chahiye. Shared tree RP par rooted hai, (*,G) likha jaata hai, saare sources ke liye har group ki ek entry; scale karta hai aur receivers ko sources discover karne deta hai, par paths suboptimal ho sakte hain aur RP critical hai. Jodo ki PIM-SM shared tree par shuru hota hai aur SPT par switch karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Distribution tree mein ek incoming interface (upstream) aur ek outgoing interface list (downstream) hoti hai.</li>
<li>Source tree = SPT = (S,G), source par rooted: optimal path, zyada state.</li>
<li>Shared tree = RPT = (*,G), RP par rooted: kam state, ghoom kar jaane ka chance.</li>
<li>Dense aur SSM source trees use karte hain; sparse dono; bidir sirf shared tree.</li>
<li>FHR = source LAN wala router; LHR = receiver LAN wala router.</li>
</ul></div>
`}};export{e as default};