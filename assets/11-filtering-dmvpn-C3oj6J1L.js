var e={id:`filtering-dmvpn`,h:{en:`Route filtering, split horizon and an EIGRP-over-DMVPN preview`,hi:`Route filtering, split horizon aur EIGRP-over-DMVPN preview`},body:{en:`
<p>A newspaper editor decides which stories reach the readers. A good editor removes only what should not be printed; a careless one deletes the sports page by accident and nobody notices until readers complain. <b>Distribute-lists</b> are EIGRP's editors: they decide which routes are accepted or advertised. <b>Split horizon</b> is an automatic editor rule: "never tell a story back to the person who told it to you". Both are healthy, until the network is hub-and-spoke over one interface, such as DMVPN, where that rule hides spokes from each other.</p>

<h3>Distribute-lists</h3>
<p>A distribute-list filters routes in EIGRP updates, <code>in</code> (before they enter the topology table) or <code>out</code> (before they are advertised), optionally on one interface only. It can reference an ACL, a <b>prefix-list</b> (most precise) or a <b>route-map</b> (can also match tags, useful after redistribution).</p>
<pre class="code">ip prefix-list NO-GUEST seq 5 deny 192.168.50.0/24
ip prefix-list NO-GUEST seq 10 permit 0.0.0.0/0 le 32   <span class="c">! allow everything else</span>
<span class="c">! named mode</span>
router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 10
  topology base
   distribute-list prefix NO-GUEST out GigabitEthernet0/0
<span class="c">! classic: router eigrp 10 → distribute-list prefix NO-GUEST out GigabitEthernet0/0</span></pre>
<pre class="out">SP1#show ip protocols | include filter
  Outgoing update filter list for all interfaces is not set
<span class="hl">    GigabitEthernet0/0 filtered by (prefix-list) NO-GUEST per user request</span>
  Incoming update filter list for all interfaces is not set
SP1#show ip prefix-list detail NO-GUEST
ip prefix-list NO-GUEST:
   count: 2, range entries: 1, sequences: 5 - 10, refcount: 3
   seq 5 deny 192.168.50.0/24 (hit count: 4, refcount: 1)
   seq 10 permit 0.0.0.0/0 le 32 (hit count: 22, refcount: 1)</pre>

<div class="eg"><p><b>Worked example: the missing line.</b> An engineer wants to hide the guest LAN 192.168.50.0/24 and writes only <code>ip prefix-list NO-GUEST seq 5 deny 192.168.50.0/24</code>. Every prefix-list ends with an implicit deny, so <b>every</b> route out of Gi0/0 is now filtered. The hub loses the whole branch, while the adjacency stays up. <code>show ip eigrp topology</code> on the hub shows nothing from SP1, and the hit counts on the branch climb on seq 5 only for the guest route, while nothing else matches a permit. Adding <code>seq 10 permit 0.0.0.0/0 le 32</code> restores the branch.</p></div>

<p>Filtering also shrinks the query domain: a router that filtered a prefix inbound has no entry for it, so when queried it replies "unreachable" at once instead of passing the Query on.</p>

<h3>Split horizon and next-hop-self</h3>
<p>EIGRP split horizon is <b>on by default</b>: a route is not advertised out of the interface it was learned on. On point-to-point links that is exactly right. On a multipoint interface, such as a DMVPN tunnel on the hub, all spokes sit behind <b>one</b> interface. The hub learns SP-A's LAN on Tunnel0 and will not advertise it back out Tunnel0, so SP-B never learns it.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="DMVPN hub split horizon">
<rect x="250" y="14" width="140" height="50" rx="8" fill="#bae6fd"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="14">HUB</text><text x="320" y="54" text-anchor="middle" class="svg-muted" font-size="12">one Tunnel0</text>
<rect x="60" y="150" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="135" y="172" text-anchor="middle" class="svg-ink" font-size="14">SP-A</text><text x="135" y="190" text-anchor="middle" class="svg-muted" font-size="12">LAN 10.5.1.0/24</text>
<rect x="430" y="150" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="505" y="172" text-anchor="middle" class="svg-ink" font-size="14">SP-B</text><text x="505" y="190" text-anchor="middle" class="svg-muted" font-size="12">needs 10.5.1.0/24</text>
<line x1="280" y1="64" x2="150" y2="150" stroke="#64748b" stroke-width="2"/><text x="170" y="100" class="svg-accent" font-size="12">learned on Tunnel0</text>
<line x1="360" y1="64" x2="490" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/><text x="440" y="100" class="svg-accent" font-size="12">blocked: same Tunnel0</text>
</svg><p class="cap">Split horizon on the hub's single tunnel interface hides spokes from each other.</p></div>

<pre class="code">router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 10
  af-interface Tunnel0
   no split-horizon
   no next-hop-self          <span class="c">! DMVPN phase 2 only</span>
<span class="c">! classic: interface Tunnel0 → no ip split-horizon eigrp 10 / no ip next-hop-self eigrp 10</span></pre>

<h3>EIGRP over DMVPN: a preview</h3>
<p>The DMVPN module teaches the design fully. For EIGRP troubleshooting, know these rules:</p>
<table class="cmp"><tr><th>Phase</th><th>What spokes need from the hub</th><th>EIGRP settings on hub Tunnel0</th></tr>
<tr><td>Phase 1 (hub-and-spoke only)</td><td>A summary or default is enough</td><td>Summarise; split horizon can stay on</td></tr>
<tr><td>Phase 2 (dynamic spoke-to-spoke)</td><td>Specific routes with the <b>original spoke</b> as next hop</td><td><code>no split-horizon</code>, <code>no next-hop-self</code>, no summarisation</td></tr>
<tr><td>Phase 3 (NHRP redirect and shortcut)</td><td>A summary or default is enough; NHRP installs shortcuts</td><td><code>no split-horizon</code> or summarise; next-hop-self can stay on</td></tr>
</table>
<p>Also: the hub needs <code>ip nhrp map multicast dynamic</code> so EIGRP Hellos reach the spokes; make spokes <b>stubs</b>; and set a realistic <code>bandwidth</code> on tunnels, because EIGRP paces itself to a share of it (default 50%, <code>bandwidth-percent</code>).</p>

<div class="warn"><p><b>Common mistakes.</b> A prefix-list without a final permit; a distribute-list <code>in</code> when you meant <code>out</code> (the filtering router loses the route, the neighbour does not); an ACL-based distribute-list with a wildcard that matches more than intended; disabling split horizon on point-to-point links "just in case"; summarising on a phase 2 hub, which breaks spoke-to-spoke next hops.</p></div>

<div class="exam"><p><b>Exam trap.</b> Split horizon is on by default for EIGRP on all interfaces. A distribute-list does not affect the adjacency; the neighbour stays up while routes vanish. In named mode, <code>distribute-list</code> is under topology base, while <code>split-horizon</code> and <code>next-hop-self</code> are under af-interface.</p></div>

<div class="scn"><h4>Spokes that could not see each other</h4><p>A retailer migrated 50 stores from MPLS to DMVPN phase 2. Every store reached the head office, but store-to-store video calls failed. On a spoke, <code>show ip route eigrp</code> listed only head-office prefixes. On the hub, <code>show ip eigrp interfaces detail Tunnel0</code> showed "Split-horizon is enabled". After <code>no split-horizon</code> and <code>no next-hop-self</code> on the hub's af-interface Tunnel0, spokes learned each other's LANs with the other spoke's tunnel address as next hop, and NHRP built direct tunnels.</p><p><b>Lesson:</b> on a multipoint hub interface, split horizon and next-hop-self decide whether spokes learn each other and which next hop they use.</p></div>

<div class="iv"><p class="q">"How do you filter one prefix from EIGRP updates, and how do you verify it?"</p><p>Use a prefix-list with a deny for the prefix and a final <code>permit 0.0.0.0/0 le 32</code>, applied with <code>distribute-list prefix NAME out</code> on the interface (under topology base in named mode). Verify with <code>show ip protocols</code> (filter applied), <code>show ip prefix-list detail</code> hit counts, and the neighbour's topology table. Mention that filters do not reset adjacencies and that inbound filters also bound queries.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Distribute-lists filter updates in or out, by ACL, prefix-list or route-map; the adjacency stays up.</li>
<li>Always end a filtering prefix-list with an explicit permit if you mean to allow the rest.</li>
<li>Split horizon is on by default; disable it on multipoint hub interfaces such as DMVPN tunnels.</li>
<li>DMVPN phase 2 needs no split-horizon and no next-hop-self on the hub; phase 3 allows summaries.</li>
<li>Named mode: filters in topology base, split-horizon and next-hop-self in af-interface.</li>
</ul></div>
`,hi:`
<p>Akhbaar ka editor decide karta hai kaunsi stories readers tak pahunchengi. Achha editor sirf wahi hataata hai jo print nahi hona chahiye; laaparwah editor galti se sports page delete kar deta hai aur readers ke complain karne tak kisi ko pata nahi chalta. <b>Distribute-lists</b> EIGRP ke editors hain: yeh decide karti hain kaunse routes accept ya advertise honge. <b>Split horizon</b> ek automatic editor rule hai: "koi story kabhi usi ko wapas mat sunao jisne tumhe sunayi". Dono healthy hain, jab tak network ek interface par hub-and-spoke na ho, jaise DMVPN, jahan yeh rule spokes ko ek dusre se chhupa deta hai.</p>

<h3>Distribute-lists</h3>
<p>Distribute-list EIGRP updates mein routes filter karti hai, <code>in</code> (topology table mein aane se pehle) ya <code>out</code> (advertise hone se pehle), chahein to sirf ek interface par. Yeh ACL, <b>prefix-list</b> (sabse precise) ya <b>route-map</b> (tags bhi match kar sakta hai, redistribution ke baad kaam ka) reference kar sakti hai.</p>
<pre class="code">ip prefix-list NO-GUEST seq 5 deny 192.168.50.0/24
ip prefix-list NO-GUEST seq 10 permit 0.0.0.0/0 le 32   <span class="c">! baaki sab allow</span>
<span class="c">! named mode</span>
router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 10
  topology base
   distribute-list prefix NO-GUEST out GigabitEthernet0/0
<span class="c">! classic: router eigrp 10 → distribute-list prefix NO-GUEST out GigabitEthernet0/0</span></pre>
<pre class="out">SP1#show ip protocols | include filter
  Outgoing update filter list for all interfaces is not set
<span class="hl">    GigabitEthernet0/0 filtered by (prefix-list) NO-GUEST per user request</span>
  Incoming update filter list for all interfaces is not set
SP1#show ip prefix-list detail NO-GUEST
ip prefix-list NO-GUEST:
   count: 2, range entries: 1, sequences: 5 - 10, refcount: 3
   seq 5 deny 192.168.50.0/24 (hit count: 4, refcount: 1)
   seq 10 permit 0.0.0.0/0 le 32 (hit count: 22, refcount: 1)</pre>

<div class="eg"><p><b>Worked example: missing line.</b> Ek engineer guest LAN 192.168.50.0/24 chhupana chahta hai aur sirf <code>ip prefix-list NO-GUEST seq 5 deny 192.168.50.0/24</code> likhta hai. Har prefix-list implicit deny par khatam hoti hai, isliye ab Gi0/0 se <b>har</b> route filter ho jaata hai. Hub poori branch kho deta hai, jabki adjacency up rehti hai. Hub par <code>show ip eigrp topology</code> SP1 se kuch nahi dikhata, aur branch par hit counts seq 5 par sirf guest route ke liye badhte hain, jabki baaki kuch bhi kisi permit se match nahi hota. <code>seq 10 permit 0.0.0.0/0 le 32</code> add karne se branch wapas aa jaati hai.</p></div>

<p>Filtering query domain ko bhi chhota karti hai: jis router ne prefix ko inbound filter kiya uske paas uski entry nahi hoti, isliye query hone par woh Query aage bhejne ki jagah turant "unreachable" reply karta hai.</p>

<h3>Split horizon aur next-hop-self</h3>
<p>EIGRP split horizon <b>default on</b> hai: route us interface se advertise nahi hota jis par woh seekha gaya. Point-to-point links par yeh bilkul sahi hai. Multipoint interface par, jaise hub par DMVPN tunnel, saare spokes <b>ek</b> interface ke peeche hote hain. Hub SP-A ka LAN Tunnel0 par seekhta hai aur use Tunnel0 se wapas advertise nahi karta, isliye SP-B use kabhi nahi seekhta.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="DMVPN hub split horizon">
<rect x="250" y="14" width="140" height="50" rx="8" fill="#bae6fd"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="14">HUB</text><text x="320" y="54" text-anchor="middle" class="svg-muted" font-size="12">ek Tunnel0</text>
<rect x="60" y="150" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="135" y="172" text-anchor="middle" class="svg-ink" font-size="14">SP-A</text><text x="135" y="190" text-anchor="middle" class="svg-muted" font-size="12">LAN 10.5.1.0/24</text>
<rect x="430" y="150" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="505" y="172" text-anchor="middle" class="svg-ink" font-size="14">SP-B</text><text x="505" y="190" text-anchor="middle" class="svg-muted" font-size="12">10.5.1.0/24 chahiye</text>
<line x1="280" y1="64" x2="150" y2="150" stroke="#64748b" stroke-width="2"/><text x="170" y="100" class="svg-accent" font-size="12">Tunnel0 par seekha</text>
<line x1="360" y1="64" x2="490" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/><text x="440" y="100" class="svg-accent" font-size="12">blocked: wahi Tunnel0</text>
</svg><p class="cap">Hub ke single tunnel interface par split horizon spokes ko ek dusre se chhupata hai.</p></div>

<pre class="code">router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 10
  af-interface Tunnel0
   no split-horizon
   no next-hop-self          <span class="c">! sirf DMVPN phase 2</span>
<span class="c">! classic: interface Tunnel0 → no ip split-horizon eigrp 10 / no ip next-hop-self eigrp 10</span></pre>

<h3>DMVPN par EIGRP: ek preview</h3>
<p>DMVPN module design poori tarah padhata hai. EIGRP troubleshooting ke liye yeh rules jaano:</p>
<table class="cmp"><tr><th>Phase</th><th>Spokes ko hub se kya chahiye</th><th>Hub Tunnel0 par EIGRP settings</th></tr>
<tr><td>Phase 1 (sirf hub-and-spoke)</td><td>Summary ya default kaafi hai</td><td>Summarise karo; split horizon on reh sakta hai</td></tr>
<tr><td>Phase 2 (dynamic spoke-to-spoke)</td><td><b>Original spoke</b> ko next hop ke roop mein rakhne wale specific routes</td><td><code>no split-horizon</code>, <code>no next-hop-self</code>, koi summarisation nahi</td></tr>
<tr><td>Phase 3 (NHRP redirect aur shortcut)</td><td>Summary ya default kaafi; NHRP shortcuts install karta hai</td><td><code>no split-horizon</code> ya summarise; next-hop-self on reh sakta hai</td></tr>
</table>
<p>Aur: hub ko <code>ip nhrp map multicast dynamic</code> chahiye taaki EIGRP Hellos spokes tak pahunchein; spokes ko <b>stubs</b> banao; aur tunnels par realistic <code>bandwidth</code> set karo, kyunki EIGRP uske ek hisse tak khud ko pace karta hai (default 50%, <code>bandwidth-percent</code>).</p>

<div class="warn"><p><b>Common galtiyan.</b> Bina final permit ki prefix-list; <code>out</code> ki jagah <code>in</code> distribute-list (filter karne wala router route kho deta hai, neighbour nahi); aisi wildcard wali ACL-based distribute-list jo socha usse zyada match kare; "just in case" point-to-point links par split horizon disable karna; phase 2 hub par summarise karna, jo spoke-to-spoke next hops tod deta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> EIGRP ke liye split horizon saare interfaces par default on hai. Distribute-list adjacency ko affect nahi karti; routes gayab hote hain jabki neighbour up rehta hai. Named mode mein <code>distribute-list</code> topology base ke neeche hai, jabki <code>split-horizon</code> aur <code>next-hop-self</code> af-interface ke neeche.</p></div>

<div class="scn"><h4>Spokes jo ek dusre ko nahi dekh paaye</h4><p>Ek retailer ne 50 stores ko MPLS se DMVPN phase 2 par migrate kiya. Har store head office tak pahunchta tha, lekin store-to-store video calls fail hoti thi. Ek spoke par <code>show ip route eigrp</code> sirf head-office prefixes list karta tha. Hub par <code>show ip eigrp interfaces detail Tunnel0</code> ne "Split-horizon is enabled" dikhaya. Hub ke af-interface Tunnel0 par <code>no split-horizon</code> aur <code>no next-hop-self</code> ke baad spokes ne ek dusre ke LANs doosre spoke ke tunnel address ko next hop rakh kar seekhe, aur NHRP ne direct tunnels banaye.</p><p><b>Seekh:</b> multipoint hub interface par split horizon aur next-hop-self decide karte hain ki spokes ek dusre ko seekhenge ya nahi aur kaunsa next hop use karenge.</p></div>

<div class="iv"><p class="q">"EIGRP updates se ek prefix kaise filter karoge, aur ise kaise verify karoge?"</p><p>Prefix ke liye deny aur final <code>permit 0.0.0.0/0 le 32</code> wali prefix-list use karo, interface par <code>distribute-list prefix NAME out</code> se apply karo (named mode mein topology base ke neeche). <code>show ip protocols</code> (filter applied), <code>show ip prefix-list detail</code> hit counts, aur neighbour ki topology table se verify karo. Batao ki filters adjacencies reset nahi karte aur inbound filters queries ko bhi bound karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Distribute-lists updates ko in ya out, ACL, prefix-list ya route-map se filter karti hain; adjacency up rehti hai.</li>
<li>Agar baaki sab allow karna hai to filtering prefix-list ko hamesha explicit permit se khatam karo.</li>
<li>Split horizon default on hai; DMVPN tunnels jaise multipoint hub interfaces par ise disable karo.</li>
<li>DMVPN phase 2 ko hub par no split-horizon aur no next-hop-self chahiye; phase 3 summaries allow karta hai.</li>
<li>Named mode: filters topology base mein, split-horizon aur next-hop-self af-interface mein.</li>
</ul></div>
`}};export{e as default};