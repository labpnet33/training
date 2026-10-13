var e={id:`routing-and-forwarding-tables`,h:{en:`Routing table versus forwarding table`,hi:`Routing table versus forwarding table`},body:{en:`
<p>Beginners often think a router has "a routing table" and that is the end of it. On Junos there are two related but different tables, and the JNCIA-Junos exam asks about both. Understanding the difference also explains how backup routes work.</p>

<h3>An analogy: the planner and the signpost</h3>
<p>A travel planner keeps a thick folder with every possible route to a city: train, bus, flight, with times and costs. When a traveller asks, the planner picks the best one and writes a single instruction on a signpost: "Platform 3". The folder is the <b>routing table</b>. The signpost is the <b>forwarding table</b>. The traveller (a packet) never reads the folder; the signpost is fast and simple.</p>

<h3>The routing table (RIB)</h3>
<p><code>rpd</code> on the RE collects routes from every source into the routing table: <b>Direct</b> and <b>Local</b> routes from interface addresses, <b>Static</b> routes, <b>OSPF</b>, <b>BGP</b> and others. It may hold several routes for the same prefix. For each prefix Junos selects one <b>active</b> route: the one with the lowest <b>preference</b> (administrative distance). Ties are broken by other rules such as metric. The active route is marked with an asterisk (*).</p>
<table class="cmp"><tr><th>Source</th><th>Default preference</th></tr>
<tr><td>Direct, Local</td><td>0</td></tr>
<tr><td>Static</td><td>5</td></tr>
<tr><td>OSPF internal</td><td>10</td></tr>
<tr><td>IS-IS Level 1 / Level 2</td><td>15 / 18</td></tr>
<tr><td>RIP</td><td>100</td></tr>
<tr><td>Aggregate / generated</td><td>130</td></tr>
<tr><td>OSPF external</td><td>150</td></tr>
<tr><td>BGP</td><td>170</td></tr></table>
<p>Lower is better. Junos keeps separate tables per protocol family: <code>inet.0</code> for IPv4 unicast, <code>inet6.0</code> for IPv6, <code>inet.3</code> and <code>mpls.0</code> for MPLS.</p>

<h3>The forwarding table (FIB)</h3>
<p>From the active routes the RE builds the forwarding table: for each prefix, only the winning next hop and the exit interface, in a compact form the hardware can search quickly. A copy lives on the RE and on every PFE. This table, not the routing table, is used for every packet.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="From routes to forwarding table">
<rect x="10" y="20" width="110" height="40" rx="6" fill="#bbf7d0"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="12">OSPF 10</text>
<rect x="10" y="70" width="110" height="40" rx="6" fill="#fde68a"/><text x="65" y="95" text-anchor="middle" class="svg-ink" font-size="12">Static 200</text>
<rect x="10" y="120" width="110" height="40" rx="6" fill="#bae6fd"/><text x="65" y="145" text-anchor="middle" class="svg-ink" font-size="12">Direct 0</text>
<rect x="190" y="50" width="170" height="100" rx="8" fill="#ddd6fe"/><text x="275" y="80" text-anchor="middle" class="svg-ink" font-size="13">Routing table</text><text x="275" y="100" text-anchor="middle" class="svg-ink" font-size="13">inet.0 (RE)</text><text x="275" y="125" text-anchor="middle" class="svg-muted" font-size="11">best preference wins</text>
<rect x="440" y="50" width="190" height="100" rx="8" fill="#fed7aa"/><text x="535" y="80" text-anchor="middle" class="svg-ink" font-size="13">Forwarding table</text><text x="535" y="100" text-anchor="middle" class="svg-ink" font-size="13">(RE + every PFE)</text><text x="535" y="125" text-anchor="middle" class="svg-muted" font-size="11">active route only</text>
<line x1="120" y1="40" x2="190" y2="80" stroke="#64748b" stroke-width="2"/><line x1="120" y1="90" x2="190" y2="100" stroke="#64748b" stroke-width="2"/><line x1="120" y1="140" x2="190" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="360" y1="100" x2="440" y2="100" stroke="#64748b" stroke-width="2"/><text x="400" y="92" text-anchor="middle" class="svg-accent" font-size="12">download</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Packets are looked up in the forwarding table, never in the routing table</text>
</svg><p class="cap">Many routes in, one active route per prefix, then a compact forwarding entry.</p></div>

<h3>Reading both tables</h3>
<pre class="out">lab@R1&gt; show route 172.16.30.0/24
inet.0: 9 destinations, 10 routes (9 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

172.16.30.0/24     <span class="hl">*[OSPF/10]</span> 00:12:41, metric 2
                    &gt;  to 10.0.12.2 via ge-0/0/0.0
                   <span class="hl"> [Static/200]</span> 00:03:10
                    &gt;  to 10.0.13.2 via ge-0/0/1.0

lab@R1&gt; show route forwarding-table destination 172.16.30.0/24
Routing table: default.inet
Internet:
Destination        Type RtRef Next hop           Type Index    NhRef Netif
172.16.30.0/24     user     0 10.0.12.2          ucst   622     2 ge-0/0/0.0</pre>
<table class="cmp"><tr><th>show route (RIB)</th><th>show route forwarding-table (FIB)</th></tr>
<tr><td>Lives on the RE</td><td>Lives on the RE and every PFE</td></tr>
<tr><td>All routes, active and inactive, with protocol, preference, metric, age</td><td>Only the active route per prefix, reduced to next hop and interface</td></tr>
<tr><td>Used by routing protocols and policy</td><td>Used for every packet lookup</td></tr></table>

<h3>Floating static routes</h3>
<p>A static route with a high preference, such as <code>preference 200</code>, is a <b>floating static</b> route. While OSPF (10) is available the static route stays inactive in the routing table and is absent from the forwarding table. If the OSPF route disappears, the static route becomes active and enters the forwarding table. This is a simple backup path.</p>
<pre class="code">set routing-options static route 172.16.30.0/24 next-hop 10.0.13.2
set routing-options static route 172.16.30.0/24 preference 200</pre>

<div class="eg"><p><b>Worked example.</b> For 172.16.30.0/24 R1 has OSPF (10) via 10.0.12.2 and static (200) via 10.0.13.2. Active: OSPF. Count in the routing table: 2 routes. Count in the forwarding table: 1 entry, via 10.0.12.2. After the primary link fails and OSPF withdraws its route, the table shows only the static route, and the forwarding table switches to 10.0.13.2.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Expecting the forwarding table to list every route. Setting the floating static preference lower than the primary protocol (for example 5 against OSPF 10), which makes the "backup" the primary. Forgetting that a static route needs a reachable next hop.</p></div>

<div class="exam"><p><b>Exam trap.</b> Preference only decides between routes for the same prefix. Lower is better. The forwarding table contains only active routes.</p></div>

<div class="scn"><h4>The backup that stole the traffic</h4><p>An engineer added a backup static route via a slow 4G link for 172.16.30.0/24 but forgot to set a preference, so it defaulted to 5, better than OSPF at 10. All traffic moved to the 4G link and users complained of slowness. <code>show route 172.16.30.0/24</code> showed the static route with an asterisk. Adding <code>preference 200</code> moved traffic back to the fast OSPF path, and the 4G route waited quietly as a floating backup.</p><p><b>Lesson:</b> always set the preference of a backup route higher than the primary's.</p></div>

<div class="iv"><p class="q">"What is the difference between the routing table and the forwarding table?"</p><p>The routing table (show route) holds all learned routes, active and inactive, with attributes, and lives on the RE. The forwarding table (show route forwarding-table) holds only the active route per prefix as next hop and interface, and is copied to the PFE for line-rate lookups. Mention floating statics as an example of an inactive route.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The routing table holds all routes; the forwarding table holds only the active one per prefix.</li>
<li>Lowest preference wins: Direct 0, Static 5, OSPF 10, RIP 100, BGP 170.</li>
<li>Junos has separate tables per family: inet.0, inet6.0 and others.</li>
<li>A floating static route uses a high preference so it is inactive until the primary route disappears.</li>
<li>Packets are forwarded using the forwarding table.</li>
</ul></div>
`,hi:`
<p>Beginners aksar sochte hain ki router ke paas "ek routing table" hoti hai aur bas. Junos par do related lekin alag tables hain, aur JNCIA-Junos exam dono ke baare mein poochta hai. Fark samajhne se backup routes kaise kaam karte hain yeh bhi samajh aata hai.</p>

<h3>Analogy: planner aur signpost</h3>
<p>Travel planner ke paas ek mota folder hota hai jisme shehar tak har sambhav route hai: train, bus, flight, time aur cost ke saath. Traveller poochta hai to planner sabse achha chunta hai aur signpost par ek hi instruction likhta hai: "Platform 3". Folder <b>routing table</b> hai. Signpost <b>forwarding table</b> hai. Traveller (packet) folder kabhi nahi padhta; signpost tez aur simple hai.</p>

<h3>Routing table (RIB)</h3>
<p>RE par <code>rpd</code> har source ke routes ko routing table mein jama karta hai: interface addresses se <b>Direct</b> aur <b>Local</b> routes, <b>Static</b> routes, <b>OSPF</b>, <b>BGP</b> aur aur. Ek hi prefix ke kai routes ho sakte hain. Har prefix ke liye Junos ek <b>active</b> route chunta hai: jiski <b>preference</b> (administrative distance) sabse kam ho. Tie hone par metric jaise doosre rules tay karte hain. Active route ke aage asterisk (*) hota hai.</p>
<table class="cmp"><tr><th>Source</th><th>Default preference</th></tr>
<tr><td>Direct, Local</td><td>0</td></tr>
<tr><td>Static</td><td>5</td></tr>
<tr><td>OSPF internal</td><td>10</td></tr>
<tr><td>IS-IS Level 1 / Level 2</td><td>15 / 18</td></tr>
<tr><td>RIP</td><td>100</td></tr>
<tr><td>Aggregate / generated</td><td>130</td></tr>
<tr><td>OSPF external</td><td>150</td></tr>
<tr><td>BGP</td><td>170</td></tr></table>
<p>Kam behtar hai. Junos har protocol family ke liye alag tables rakhta hai: IPv4 unicast ke liye <code>inet.0</code>, IPv6 ke liye <code>inet6.0</code>, MPLS ke liye <code>inet.3</code> aur <code>mpls.0</code>.</p>

<h3>Forwarding table (FIB)</h3>
<p>Active routes se RE forwarding table banata hai: har prefix ke liye sirf jeetne wala next hop aur exit interface, ek compact form mein jo hardware tezi se search kar sake. Ek copy RE par aur har PFE par rehti hai. Har packet ke liye yahi table use hoti hai, routing table nahi.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Routes se forwarding table tak">
<rect x="10" y="20" width="110" height="40" rx="6" fill="#bbf7d0"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="12">OSPF 10</text>
<rect x="10" y="70" width="110" height="40" rx="6" fill="#fde68a"/><text x="65" y="95" text-anchor="middle" class="svg-ink" font-size="12">Static 200</text>
<rect x="10" y="120" width="110" height="40" rx="6" fill="#bae6fd"/><text x="65" y="145" text-anchor="middle" class="svg-ink" font-size="12">Direct 0</text>
<rect x="190" y="50" width="170" height="100" rx="8" fill="#ddd6fe"/><text x="275" y="80" text-anchor="middle" class="svg-ink" font-size="13">Routing table</text><text x="275" y="100" text-anchor="middle" class="svg-ink" font-size="13">inet.0 (RE)</text><text x="275" y="125" text-anchor="middle" class="svg-muted" font-size="11">best preference jeetti hai</text>
<rect x="440" y="50" width="190" height="100" rx="8" fill="#fed7aa"/><text x="535" y="80" text-anchor="middle" class="svg-ink" font-size="13">Forwarding table</text><text x="535" y="100" text-anchor="middle" class="svg-ink" font-size="13">(RE + har PFE)</text><text x="535" y="125" text-anchor="middle" class="svg-muted" font-size="11">sirf active route</text>
<line x1="120" y1="40" x2="190" y2="80" stroke="#64748b" stroke-width="2"/><line x1="120" y1="90" x2="190" y2="100" stroke="#64748b" stroke-width="2"/><line x1="120" y1="140" x2="190" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="360" y1="100" x2="440" y2="100" stroke="#64748b" stroke-width="2"/><text x="400" y="92" text-anchor="middle" class="svg-accent" font-size="12">download</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Packets forwarding table mein lookup hote hain, routing table mein kabhi nahi</text>
</svg><p class="cap">Kai routes andar, har prefix ka ek active route, phir ek compact forwarding entry.</p></div>

<h3>Dono tables padhna</h3>
<pre class="out">lab@R1&gt; show route 172.16.30.0/24
inet.0: 9 destinations, 10 routes (9 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

172.16.30.0/24     <span class="hl">*[OSPF/10]</span> 00:12:41, metric 2
                    &gt;  to 10.0.12.2 via ge-0/0/0.0
                   <span class="hl"> [Static/200]</span> 00:03:10
                    &gt;  to 10.0.13.2 via ge-0/0/1.0

lab@R1&gt; show route forwarding-table destination 172.16.30.0/24
Routing table: default.inet
Internet:
Destination        Type RtRef Next hop           Type Index    NhRef Netif
172.16.30.0/24     user     0 10.0.12.2          ucst   622     2 ge-0/0/0.0</pre>
<table class="cmp"><tr><th>show route (RIB)</th><th>show route forwarding-table (FIB)</th></tr>
<tr><td>RE par rehta hai</td><td>RE aur har PFE par rehta hai</td></tr>
<tr><td>Saare routes, active aur inactive, protocol, preference, metric, age ke saath</td><td>Har prefix ka sirf active route, next hop aur interface tak simplify</td></tr>
<tr><td>Routing protocols aur policy use karte hain</td><td>Har packet lookup mein use hota hai</td></tr></table>

<h3>Floating static routes</h3>
<p>Ucchi preference wala static route, jaise <code>preference 200</code>, <b>floating static</b> route kehlata hai. Jab tak OSPF (10) maujood hai, static route routing table mein inactive rehta hai aur forwarding table mein nahi hota. OSPF route gayab ho jaye to static route active ho jaata hai aur forwarding table mein aa jaata hai. Yeh ek simple backup path hai.</p>
<pre class="code">set routing-options static route 172.16.30.0/24 next-hop 10.0.13.2
set routing-options static route 172.16.30.0/24 preference 200</pre>

<div class="eg"><p><b>Worked example.</b> 172.16.30.0/24 ke liye R1 ke paas OSPF (10) 10.0.12.2 ke through aur static (200) 10.0.13.2 ke through hai. Active: OSPF. Routing table mein count: 2 routes. Forwarding table mein count: 1 entry, 10.0.12.2 ke through. Primary link fail hone aur OSPF ke route hataane ke baad table mein sirf static route dikhta hai, aur forwarding table 10.0.13.2 par switch ho jaati hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forwarding table se har route list hone ki ummeed. Floating static ki preference primary protocol se kam rakhna (jaise OSPF 10 ke saamne 5), jisse "backup" primary ban jaata hai. Yeh bhoolna ki static route ko reachable next hop chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Preference sirf same prefix ke routes ke beech faisla karti hai. Kam behtar hai. Forwarding table mein sirf active routes hote hain.</p></div>

<div class="scn"><h4>Backup jisne traffic chura liya</h4><p>Ek engineer ne 172.16.30.0/24 ke liye slow 4G link ke through backup static route jodi lekin preference set karna bhool gaya, to woh default 5 rahi, jo OSPF ke 10 se behtar hai. Saara traffic 4G link par chala gaya aur users ne slowness ki shikayat ki. <code>show route 172.16.30.0/24</code> ne static route par asterisk dikhaya. <code>preference 200</code> jodne se traffic wapas tez OSPF path par chala gaya, aur 4G route floating backup ban kar chupchap intezaar karne laga.</p><p><b>Lesson:</b> backup route ki preference hamesha primary se zyada rakho.</p></div>

<div class="iv"><p class="q">"Routing table aur forwarding table mein kya fark hai?"</p><p>Routing table (show route) mein saare seekhe hue routes, active aur inactive, attributes ke saath hote hain, aur woh RE par rehti hai. Forwarding table (show route forwarding-table) mein har prefix ka sirf active route next hop aur interface ke roop mein hota hai, aur line-rate lookups ke liye PFE ko copy hoti hai. Inactive route ke example ke roop mein floating static ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routing table mein saare routes; forwarding table mein har prefix ka sirf active route.</li>
<li>Sabse kam preference jeetti hai: Direct 0, Static 5, OSPF 10, RIP 100, BGP 170.</li>
<li>Junos har family ke liye alag tables rakhta hai: inet.0, inet6.0 aur aur.</li>
<li>Floating static route ucchi preference use karta hai taaki primary route gayab hone tak inactive rahe.</li>
<li>Packets forwarding table se forward hote hain.</li>
</ul></div>
`}};export{e as default};