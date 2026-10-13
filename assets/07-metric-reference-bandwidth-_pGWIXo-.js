var e={id:`metric-reference-bandwidth`,h:{en:`OSPF metric, reference bandwidth and steering traffic`,hi:`OSPF metric, reference bandwidth aur traffic steer karna`},body:{en:`
<p>When two paths reach the same destination, OSPF compares their <b>total cost</b> and installs the lowest. This chapter shows how the cost is calculated, why you must raise the default reference bandwidth, and how to push traffic one way or the other. This is the Mysuru lab.</p>

<h3>Analogy: choosing a route by toll and traffic</h3>
<p>Imagine a satnav that adds up "cost" for each road: a wide motorway is cheap per kilometre, a narrow lane is expensive. It picks the route with the smallest total. If you tell it a particular road has a heavy toll, it avoids that road unless nothing else is available. In OSPF the toll is the cost, and you can set it by hand.</p>

<h3>How Junos calculates cost</h3>
<pre class="code">cost = reference-bandwidth / interface bandwidth        (minimum 1)
default reference-bandwidth = 100 Mbps</pre>
<table class="cmp"><tr><th>Interface</th><th>Default (100 Mbps ref)</th><th>With 100g reference</th></tr>
<tr><td>10 Mbps</td><td>10</td><td>10000</td></tr>
<tr><td>100 Mbps</td><td>1</td><td>1000</td></tr>
<tr><td>1 Gbps</td><td>1 (minimum)</td><td>100</td></tr>
<tr><td>10 Gbps</td><td>1 (minimum)</td><td>10</td></tr>
<tr><td>100 Gbps</td><td>1 (minimum)</td><td>1</td></tr></table>
<p>With the default, a 100 Mbps link and a 100 Gbps link have the <b>same</b> cost of 1, so OSPF cannot tell a fast path from a slow one. The fix is to raise the reference bandwidth so that the fastest link in your network gets a cost near 1 and slower links cost more. <b>It must be the same on every router in the OSPF domain</b>; if one router uses a different value, its costs are inconsistent with the rest and paths may be chosen badly.</p>
<pre class="code">set protocols ospf reference-bandwidth 100g</pre>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Path costs in the Mysuru lab">
<rect x="10" y="85" width="80" height="40" rx="8" fill="#e2e8f0"/><text x="50" y="110" text-anchor="middle" class="svg-ink" font-size="12">PC1</text>
<rect x="130" y="85" width="80" height="40" rx="8" fill="#bae6fd"/><text x="170" y="110" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="290" y="15" width="80" height="40" rx="8" fill="#bbf7d0"/><text x="330" y="40" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="290" y="155" width="80" height="40" rx="8" fill="#fed7aa"/><text x="330" y="180" text-anchor="middle" class="svg-ink" font-size="13">R3 rented</text>
<rect x="450" y="85" width="80" height="40" rx="8" fill="#ddd6fe"/><text x="490" y="110" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<rect x="570" y="85" width="65" height="40" rx="8" fill="#e2e8f0"/><text x="602" y="110" text-anchor="middle" class="svg-ink" font-size="12">SRV</text>
<line x1="90" y1="105" x2="130" y2="105" stroke="#64748b" stroke-width="2"/><line x1="210" y1="95" x2="290" y2="40" stroke="#64748b" stroke-width="2"/><line x1="210" y1="115" x2="290" y2="170" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/><line x1="370" y1="40" x2="450" y2="95" stroke="#64748b" stroke-width="2"/><line x1="370" y1="170" x2="450" y2="115" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/><line x1="530" y1="105" x2="570" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="230" y="55" class="svg-accent" font-size="11">cost 100</text><text x="400" y="55" class="svg-accent" font-size="11">cost 100</text>
<text x="215" y="160" class="svg-accent" font-size="11">metric 500</text><text x="400" y="165" class="svg-accent" font-size="11">metric 500</text>
</svg><p class="cap">Both paths cost 200 at first. After metric 500 on the rented R3 links, R2 costs 200 and R3 costs 600.</p></div>

<h3>Worked example: the Mysuru lab</h3>
<p>R1 loads traffic over R2 and over R3 equally because each path crosses two gigabit links of the same cost. The R3 circuit is rented and billed per gigabyte, so you want it used only as a backup.</p>
<ol>
<li><b>See the problem.</b> On R1, <code>show route 172.16.66.0/24</code> lists <b>two</b> next hops, via R2 (10.6.12.2) and R3 (10.6.13.2).</li>
<li><b>Apply the company standard</b> on all four routers: <code>set protocols ospf reference-bandwidth 100g</code>.</li>
<li><b>Check the cost.</b> <code>show ospf interface ge-0/0/0.0 detail</code> on R1 now shows <code>Cost: 100</code> (100 Gbps / 1 Gbps). The path costs are still equal.</li>
<li><b>Make R3 expensive from R1.</b> <code>set protocols ospf area 0.0.0.0 interface ge-0/0/1.0 metric 500</code>. R1 now reaches 172.16.66.0/24 only via R2.</li>
<li><b>Do the reverse on R4.</b> Cost is applied to the <b>outgoing</b> interface, so replies from the server still choose R3 unless you also set <code>metric 500</code> on R4's ge-0/0/1.0 towards R3. Now traffic in both directions prefers R2.</li></ol>
<pre class="out">lab@R1-MYSURU&gt; show route 172.16.66.0/24
inet.0: 14 destinations, 14 routes (14 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

172.16.66.0/24     *[OSPF/10] 00:00:30, metric 300
                    &gt;  to 10.6.12.2 via ge-0/0/0.0

lab@R1-MYSURU&gt; traceroute 172.16.66.10
traceroute to 172.16.66.10 (172.16.66.10), 30 hops max, 40 byte packets
 1  <span class="hl">10.6.12.2 (10.6.12.2)</span>  0.9 ms  0.7 ms  0.7 ms
 2  10.6.24.2 (10.6.24.2)  1.3 ms  1.1 ms  1.0 ms
 3  172.16.66.10 (172.16.66.10)  1.8 ms  1.6 ms  1.5 ms
</pre>
<p>The metric 300 is the path cost: 100 (R1 to R2) + 100 (R2 to R4) + 100 for R4's own LAN interface towards the server. The path via R3 would cost 500 + 100 + 100 = 700, so R2 wins.</p>

<h3>Rules to remember</h3>
<ul>
<li>An explicit <code>metric</code> on an interface always overrides the calculated cost.</li>
<li>Cost is applied on the <b>outgoing</b> interface. To steer traffic both ways, change both directions, which means both ends of the path.</li>
<li>Equal-cost paths are all installed (ECMP); <code>show route</code> lists several next hops, as in the first step of the lab.</li>
<li>A loopback is advertised with cost 0.</li>
<li>Changing reference bandwidth on only some routers is a classic cause of strange paths. Do it everywhere in one change window.</li>
<li>Do not use hop-count thinking: three high-speed links can beat one slow link.</li></ul>

<h3>Other ways to influence OSPF routing</h3>
<p>Cost is the standard tool. The exam also expects you to know that you can change the hello and dead intervals (only matched on both ends), the router priority to influence the DR, and the route preference of OSPF itself with <code>set protocols ospf preference 20</code>, which changes how OSPF competes with other sources. Do not confuse metric (inside OSPF) with preference (between protocols).</p>

<div class="warn"><p><b>Common mistake.</b> Setting the metric on one router only. Traffic from R1 to the server avoids R3, but the replies come back through R3 because R4 still sees it as equal cost. Asymmetric paths make troubleshooting and billing confusing.</p></div>
<div class="exam"><p><b>Exam trap.</b> Junos default reference bandwidth is 100 Mbps, so 100 Mbps, 1 Gbps and 10 Gbps all cost 1. Cost = reference / bandwidth. The metric on an interface overrides it. Cost is outgoing. OSPF compares the sum of costs, not hop count. Preference and metric are different things.</p></div>

<div class="scn"><h4>The 10 gigabit link that nobody used</h4><p>A company upgraded its core to 10 Gbps but kept a 1 Gbps backup. Traffic still split across both, and the backup saturated. Both links showed cost 1 because the reference bandwidth was the 100 Mbps default. Setting reference-bandwidth 100g on every router gave 10 Gbps a cost of 10 and 1 Gbps a cost of 100, so all traffic moved to the fast link overnight.</p><p><b>Lesson:</b> raise the reference bandwidth in any network with links faster than 100 Mbps, on every router.</p></div>

<div class="iv"><p class="q">"How does OSPF calculate cost and how do you make traffic prefer one path?"</p><p>Cost is reference bandwidth divided by interface bandwidth, default reference 100 Mbps, so modern links all cost 1 until you raise it consistently on all routers. To prefer a path, set a higher metric on the interfaces of the unwanted path. Cost is outgoing, so adjust both directions for symmetric traffic. Verify with show route and traceroute.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cost = reference bandwidth / interface bandwidth, minimum 1; default reference is 100 Mbps.</li>
<li>Set reference-bandwidth (for example 100g) on every router in the domain.</li>
<li>An explicit interface metric overrides the calculated cost.</li>
<li>Cost counts on the outgoing interface: steer both directions.</li>
<li>Equal-cost paths are all installed; metric is not preference.</li>
</ul></div>
`,hi:`
<p>Do paths same destination tak pahunchte hon to OSPF unka <b>total cost</b> compare karta hai aur sabse kam install karta hai. Yeh chapter dikhata hai cost kaise calculate hota hai, default reference bandwidth kyun badhani chahiye, aur traffic ko ek taraf ya doosri taraf kaise dhakelna hai. Yeh Mysuru lab hai.</p>

<h3>Analogy: toll aur traffic se raasta chunna</h3>
<p>Ek satnav socho jo har sadak ka "cost" jodta hai: chauda motorway per kilometre sasta hai, patli gali mehngi. Woh sabse chhota total wala raasta chunta hai. Aap use bata do ki kisi sadak par bhaari toll hai to woh us sadak se bachta hai jab tak aur kuch na ho. OSPF mein toll cost hai, aur aap use haath se set kar sakte ho.</p>

<h3>Junos cost kaise calculate karta hai</h3>
<pre class="code">cost = reference-bandwidth / interface bandwidth        (minimum 1)
default reference-bandwidth = 100 Mbps</pre>
<table class="cmp"><tr><th>Interface</th><th>Default (100 Mbps ref)</th><th>100g reference ke saath</th></tr>
<tr><td>10 Mbps</td><td>10</td><td>10000</td></tr>
<tr><td>100 Mbps</td><td>1</td><td>1000</td></tr>
<tr><td>1 Gbps</td><td>1 (minimum)</td><td>100</td></tr>
<tr><td>10 Gbps</td><td>1 (minimum)</td><td>10</td></tr>
<tr><td>100 Gbps</td><td>1 (minimum)</td><td>1</td></tr></table>
<p>Default ke saath 100 Mbps aur 100 Gbps link ka cost <b>same</b> 1 hota hai, isliye OSPF tez path ko slow path se alag nahi kar paata. Fix hai reference bandwidth badhana taaki aapke network ka sabse tez link cost 1 ke aaspaas aaye aur slow links ka zyada. <b>Yeh OSPF domain ke har router par same hona chahiye</b>; ek router par alag value ho to uske costs baaki se inconsistent ho jaate hain aur paths galat chune ja sakte hain.</p>
<pre class="code">set protocols ospf reference-bandwidth 100g</pre>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Path costs in the Mysuru lab">
<rect x="10" y="85" width="80" height="40" rx="8" fill="#e2e8f0"/><text x="50" y="110" text-anchor="middle" class="svg-ink" font-size="12">PC1</text>
<rect x="130" y="85" width="80" height="40" rx="8" fill="#bae6fd"/><text x="170" y="110" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="290" y="15" width="80" height="40" rx="8" fill="#bbf7d0"/><text x="330" y="40" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="290" y="155" width="80" height="40" rx="8" fill="#fed7aa"/><text x="330" y="180" text-anchor="middle" class="svg-ink" font-size="13">R3 kiraye ka</text>
<rect x="450" y="85" width="80" height="40" rx="8" fill="#ddd6fe"/><text x="490" y="110" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<rect x="570" y="85" width="65" height="40" rx="8" fill="#e2e8f0"/><text x="602" y="110" text-anchor="middle" class="svg-ink" font-size="12">SRV</text>
<line x1="90" y1="105" x2="130" y2="105" stroke="#64748b" stroke-width="2"/><line x1="210" y1="95" x2="290" y2="40" stroke="#64748b" stroke-width="2"/><line x1="210" y1="115" x2="290" y2="170" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/><line x1="370" y1="40" x2="450" y2="95" stroke="#64748b" stroke-width="2"/><line x1="370" y1="170" x2="450" y2="115" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/><line x1="530" y1="105" x2="570" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="230" y="55" class="svg-accent" font-size="11">cost 100</text><text x="400" y="55" class="svg-accent" font-size="11">cost 100</text>
<text x="215" y="160" class="svg-accent" font-size="11">metric 500</text><text x="400" y="165" class="svg-accent" font-size="11">metric 500</text>
</svg><p class="cap">Shuru mein dono paths ka cost 200. Kiraye wale R3 links par metric 500 ke baad R2 ka 200 aur R3 ka 600.</p></div>

<h3>Worked example: Mysuru lab</h3>
<p>R1 traffic R2 aur R3 dono par barabar baantta hai kyunki har path same cost ke do gigabit links paar karta hai. R3 circuit kiraye ka hai aur per gigabyte bill hota hai, isliye aap chahte ho woh sirf backup ho.</p>
<ol>
<li><b>Problem dekho.</b> R1 par <code>show route 172.16.66.0/24</code> <b>do</b> next hops list karta hai, R2 (10.6.12.2) ke through aur R3 (10.6.13.2) ke through.</li>
<li><b>Company standard lagao</b> chaaron routers par: <code>set protocols ospf reference-bandwidth 100g</code>.</li>
<li><b>Cost check karo.</b> R1 par <code>show ospf interface ge-0/0/0.0 detail</code> ab <code>Cost: 100</code> dikhata hai (100 Gbps / 1 Gbps). Path costs abhi bhi barabar hain.</li>
<li><b>R1 se R3 ko mehenga banao.</b> <code>set protocols ospf area 0.0.0.0 interface ge-0/0/1.0 metric 500</code>. R1 ab 172.16.66.0/24 tak sirf R2 se jaata hai.</li>
<li><b>R4 par ulta karo.</b> Cost <b>outgoing</b> interface par lagta hai, isliye server ke replies tab bhi R3 chunenge jab tak R4 ke R3 wale ge-0/0/1.0 par bhi <code>metric 500</code> na lagao. Ab dono directions ka traffic R2 ko prefer karta hai.</li></ol>
<pre class="out">lab@R1-MYSURU&gt; show route 172.16.66.0/24
inet.0: 14 destinations, 14 routes (14 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

172.16.66.0/24     *[OSPF/10] 00:00:30, metric 300
                    &gt;  to 10.6.12.2 via ge-0/0/0.0

lab@R1-MYSURU&gt; traceroute 172.16.66.10
traceroute to 172.16.66.10 (172.16.66.10), 30 hops max, 40 byte packets
 1  <span class="hl">10.6.12.2 (10.6.12.2)</span>  0.9 ms  0.7 ms  0.7 ms
 2  10.6.24.2 (10.6.24.2)  1.3 ms  1.1 ms  1.0 ms
 3  172.16.66.10 (172.16.66.10)  1.8 ms  1.6 ms  1.5 ms
</pre>
<p>Metric 300 path cost hai: 100 (R1 se R2) + 100 (R2 se R4) + 100 R4 ke apne LAN interface ka, server ki taraf. R3 wale path ka cost 500 + 100 + 100 = 700 hota, isliye R2 jeetta hai.</p>

<h3>Yaad rakhne ke rules</h3>
<ul>
<li>Interface par explicit <code>metric</code> hamesha calculated cost ko override karta hai.</li>
<li>Cost <b>outgoing</b> interface par lagta hai. Dono taraf steer karne ke liye dono directions badlo, yaani path ke dono ends.</li>
<li>Equal-cost paths sab install hote hain (ECMP); <code>show route</code> kai next hops list karta hai, jaise lab ke pehle step mein.</li>
<li>Loopback cost 0 ke saath advertise hota hai.</li>
<li>Reference bandwidth sirf kuch routers par badalna ajeeb paths ka classic kaaran hai. Ek hi change window mein har jagah karo.</li>
<li>Hop-count soch use mat karo: teen tez links ek slow link ko haraa sakte hain.</li></ul>

<h3>OSPF routing ko influence karne ke aur tarike</h3>
<p>Cost standard tool hai. Exam yeh bhi expect karta hai ki aap hello aur dead intervals badal sakte ho (dono ends par match karne par hi), DR ko influence karne ke liye router priority, aur OSPF ki apni route preference <code>set protocols ospf preference 20</code> se, jo badalti hai ki OSPF doosre sources ke saath kaise compete karta hai. Metric (OSPF ke andar) ko preference (protocols ke beech) se confuse mat karo.</p>

<div class="warn"><p><b>Common mistake.</b> Metric sirf ek router par set karna. R1 se server ka traffic R3 se bachta hai, lekin replies R3 se aate hain kyunki R4 ko woh abhi bhi equal cost lagta hai. Asymmetric paths troubleshooting aur billing ko confusing banate hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Junos default reference bandwidth 100 Mbps hai, isliye 100 Mbps, 1 Gbps aur 10 Gbps sab ka cost 1. Cost = reference / bandwidth. Interface par metric ise override karta hai. Cost outgoing hai. OSPF costs ka sum compare karta hai, hop count nahi. Preference aur metric alag cheezein hain.</p></div>

<div class="scn"><h4>10 gigabit link jo kisi ne use nahi kiya</h4><p>Ek company ne core ko 10 Gbps kiya lekin 1 Gbps backup rakha. Traffic phir bhi dono par baanta aur backup saturate ho gaya. Dono links ka cost 1 tha kyunki reference bandwidth 100 Mbps default thi. Har router par reference-bandwidth 100g set karne se 10 Gbps ka cost 10 aur 1 Gbps ka 100 hua, aur saara traffic raat bhar mein tez link par chala gaya.</p><p><b>Lesson:</b> 100 Mbps se tez links wale network mein har router par reference bandwidth badhao.</p></div>

<div class="iv"><p class="q">"OSPF cost kaise calculate karta hai aur traffic ko ek path prefer karne par kaise majboor karte ho?"</p><p>Cost reference bandwidth ko interface bandwidth se divide karke aata hai, default reference 100 Mbps, isliye modern links sab cost 1 rehte hain jab tak aap ise saare routers par consistently na badhao. Path prefer karwane ke liye unwanted path ke interfaces par zyada metric set karo. Cost outgoing hai, isliye symmetric traffic ke liye dono directions adjust karo. show route aur traceroute se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cost = reference bandwidth / interface bandwidth, minimum 1; default reference 100 Mbps.</li>
<li>Domain ke har router par reference-bandwidth (jaise 100g) set karo.</li>
<li>Explicit interface metric calculated cost ko override karta hai.</li>
<li>Cost outgoing interface par gina jaata hai: dono directions steer karo.</li>
<li>Equal-cost paths sab install hote hain; metric preference nahi hai.</li>
</ul></div>
`}};export{e as default};