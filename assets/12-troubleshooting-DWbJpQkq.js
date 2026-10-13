var e={id:`troubleshooting`,h:{en:`Troubleshooting multi-area OSPF (ticket: Area 0 split)`,hi:`Multi-area OSPF troubleshooting (ticket: Area 0 split)`},body:{en:`
<p>A good doctor does not start with surgery. They check pulse, then blood tests, then scans, each step narrowing the cause. OSPF troubleshooting works the same way: neighbours first, then interface settings, then the database, then the routing table, then filters and summaries. Jumping to <code>clear ip ospf process</code> is surgery without a diagnosis.</p>

<h3>The workflow</h3>
<ol>
<li><b>Neighbours</b>: <code>show ip ospf neighbor</code>. Missing neighbour, stuck state (Init, 2-Way, ExStart/Exchange) or FULL?</li>
<li><b>Interfaces</b>: <code>show ip ospf interface brief</code> and <code>show ip ospf interface Gi0/x</code>. Right area, right network type, matching timers, not passive, expected cost.</li>
<li><b>Logs</b>: mismatched area ID, mismatched Hello parameters, duplicate router ID, "Too many retransmissions".</li>
<li><b>Roles</b>: <code>show ip ospf</code> ("It is an area border router"), <code>show ip ospf border-routers</code> on other routers.</li>
<li><b>Database</b>: <code>show ip ospf database</code>, then <code>summary</code>, <code>router</code>, <code>network</code>, <code>external</code> for the prefix in question. Is the LSA there, who advertises it, which area?</li>
<li><b>Routing table</b>: <code>show ip route ospf</code> and <code>show ip route &lt;prefix&gt;</code>. LSA present but no route means a filter, a failed SPF two-way check, or an unreachable advertising router.</li>
<li><b>Policy</b>: <code>show run | section router ospf</code> for ranges, filter-lists and distribute-lists.</li>
</ol>

<h3>Walking lab 1 (multi-area with ABR summarisation)</h3>
<table class="cmp"><tr><th>Symptom</th><th>Check</th><th>Likely cause and fix</th></tr>
<tr><td>R1 has no O IA routes at all</td><td><code>show ip ospf neighbor</code> on ABR1</td><td>Gi0/0 not in area 10, or not enabled. Put it in area 10 with <code>ip ospf 1 area 10</code>.</td></tr>
<tr><td>R1 has a neighbour, still no O IA</td><td><code>show ip ospf</code> on ABR1</td><td>No interface in area 0, so not an ABR. Enable Gi0/1 and Lo0 in area 0.</td></tr>
<tr><td>Console on CORE: mismatched area ID</td><td><code>show ip ospf interface brief</code> on ABR2</td><td>ABR2 Gi0/0 in area 20 instead of 0: wrong network statement.</td></tr>
<tr><td>CORE still shows four 172.16 /24s</td><td><code>show ip ospf | begin Area 10</code> on ABR1</td><td>Range typed under the wrong area (<code>area 0 range</code>) or wrong mask.</td></tr>
<tr><td>PC5 cannot ping 172.16.2.1</td><td><code>show ip route 172.16.2.1</code> on R5, ABR2, CORE, ABR1</td><td>Follow the path hop by hop; check PC5's gateway 192.168.20.1 and R5's O IA /22.</td></tr></table>

<h3>Walking lab 2 (point-to-point on Ethernet)</h3>
<ul>
<li><b>Only one end changed to point-to-point</b>: neighbour is FULL, but routes through that link are missing (broadcast versus point-to-point). <code>show ip ospf interface</code> on both ends reveals the mismatch.</li>
<li><b>Hello 5 only on R1</b>: logs show mismatched Hello parameters; neighbour down after 20 seconds. Configure R2 Gi0/0 too.</li>
<li><b>Loopback still /32 on R1</b>: the point-to-point command went on R3 Loopback0 instead of Loopback1.</li>
</ul>

<h3>The ticket: Area 0 split</h3>
<p><b>Ticket NK-7730.</b> "Since the CORE to ABR2 fibre was cut at 09:40, Pune users cannot reach the Chennai plant. R1 still shows a route to 192.168.20.0/24, but traceroutes die at ABR1. Pune server logs show connection attempts from the plant, but the plant never gets a reply." Background: last month a backup link 10.10.24.0/30 was added between ABR1 Gi0/2 and ABR2 Gi0/2, placed in <b>area 10</b>.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Area 0 split">
<rect x="150" y="20" width="200" height="90" rx="12" fill="#bae6fd"/><text x="250" y="40" text-anchor="middle" class="svg-ink" font-size="12">Area 0 part A</text>
<rect x="400" y="20" width="120" height="90" rx="12" fill="#bae6fd"/><text x="460" y="40" text-anchor="middle" class="svg-ink" font-size="12">Area 0 part B</text>
<rect x="170" y="55" width="70" height="34" rx="6" fill="#ddd6fe"/><text x="205" y="77" text-anchor="middle" class="svg-ink" font-size="12">ABR1</text>
<rect x="265" y="55" width="70" height="34" rx="6" fill="#e2e8f0"/><text x="300" y="77" text-anchor="middle" class="svg-ink" font-size="12">CORE</text>
<rect x="425" y="55" width="70" height="34" rx="6" fill="#ddd6fe"/><text x="460" y="77" text-anchor="middle" class="svg-ink" font-size="12">ABR2</text>
<line x1="240" y1="72" x2="265" y2="72" stroke="#64748b" stroke-width="2"/>
<line x1="335" y1="72" x2="425" y2="72" stroke="#dc2626" stroke-width="2" stroke-dasharray="4 4"/><text x="380" y="64" text-anchor="middle" class="svg-accent" font-size="12">cut</text>
<rect x="60" y="140" width="460" height="70" rx="12" fill="#bbf7d0"/><text x="120" y="160" text-anchor="middle" class="svg-ink" font-size="12">Area 10</text>
<line x1="205" y1="89" x2="205" y2="185" stroke="#64748b" stroke-width="2"/><line x1="460" y1="89" x2="460" y2="185" stroke="#64748b" stroke-width="2"/>
<line x1="205" y1="185" x2="460" y2="185" stroke="#64748b" stroke-width="2"/><text x="332" y="178" text-anchor="middle" class="svg-muted" font-size="12">backup 10.10.24.0/30 (area 10)</text>
<rect x="80" y="170" width="60" height="30" rx="6" fill="#e2e8f0"/><text x="110" y="190" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">ABR2 keeps Lo0 in area 0, so it is still an ABR on its own backbone island</text>
</svg><p class="cap">The backbone is now two islands joined only through area 10. ABRs refuse to use type 3 LSAs learned in area 10.</p></div>

<pre class="out">CORE# show ip route 192.168.20.0
<span class="hl">% Network not in table</span>

ABR1# show ip ospf border-routers
Internal Router Routing Table
Codes: i - Intra-area route, I - Inter-area route
<span class="hl">i 4.4.4.4 [1] via 10.10.24.2, GigabitEthernet0/2, ABR, Area 10, SPF 14</span>

ABR1# show ip ospf database summary 192.168.20.0 | include Area|Advertising
                Summary Net Link States (Area 10)
<span class="hl">  Advertising Router: 4.4.4.4</span>

ABR1# show ip route 192.168.20.0
<span class="hl">% Network not in table</span>

R1# show ip route 192.168.20.0 | include Known|from
  Known via "ospf 1", distance 110, metric 4, type inter area
  * 10.10.12.2, from 4.4.4.4, 00:06:02 ago, via GigabitEthernet0/0</pre>

<p><b>Diagnosis.</b> ABR2 still has Loopback0 in area 0, so it remains an ABR on a one-router backbone island. It originates a type 3 for 192.168.20.0/24 into area 10. R1, an internal area 10 router, happily uses it: its next hop is ABR1, the path to ABR2 over the backup link. But ABR1 is also an ABR, and an ABR uses only <b>backbone</b> type 3 LSAs for its own routes. ABR1 sees the LSA in area 10 and ignores it, so it has no route and drops R1's packets. CORE, in area 0 part A, receives nothing from ABR2 at all. In the other direction ABR2 learns Pune's prefixes as intra-area routes (it is in area 10), so R5 has routes and Chennai-to-Pune packets arrive, but the replies die at ABR1: one-way, half-working, confusing.</p>

<p><b>Fix now: a virtual link across area 10</b> joins the two backbone islands.</p>
<pre class="code">ABR1(config)# router ospf 1
ABR1(config-router)# area 10 virtual-link 4.4.4.4
ABR2(config)# router ospf 1
ABR2(config-router)# area 10 virtual-link 2.2.2.2</pre>
<pre class="out">ABR1# show ip ospf virtual-links
<span class="hl">Virtual Link OSPF_VL0 to router 4.4.4.4 is up</span>
  Run as demand circuit
  DoNotAge LSA allowed.
  Transit area 10, via interface GigabitEthernet0/2
  Topology-MTID    Cost    Disabled     Shutdown      Topology Name
        0           1         no           no            Base
  Transmit Delay is 1 sec, State POINT_TO_POINT,
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5
    <span class="hl">Adjacency State FULL (Hello suppressed)</span></pre>
<p><b>Fix properly</b>: make the backup link part of area 0 (it connects two ABRs, so it belongs in the backbone), or add a second backbone path. Then remove the virtual link. Area 0 must never depend on a single link.</p>

<div class="eg"><p><b>Worked example: why R1's metric is 4.</b> ABR2's type 3 into area 10 carries metric 2 (to the Chennai LAN). R1 reaches ABR2 inside area 10 via ABR1: 1 (R1 Gi0/0) + 1 (ABR1 Gi0/2) = 2. Total 4, from 4.4.4.4. Before the cut the route was 5, from 2.2.2.2. A changed "from" router and a changed metric are strong clues that the path now bypasses the backbone.</p></div>

<div class="warn"><p><b>Common mistake.</b> Seeing the route on R1 and declaring "routing is fine, it must be a firewall". Always check the routing table on every hop of the path; an ABR can drop what an internal router happily sends to it.</p></div>

<div class="exam"><p><b>Exam trap.</b> A partitioned area 0 is repaired with a virtual link through a normal transit area (not stub or NSSA), configured on both ABRs with the other's router ID. <code>show ip ospf virtual-links</code> verifies it.</p></div>

<div class="scn"><h4>The clear that made it worse</h4><p>During a similar outage, an engineer ran <code>clear ip ospf process</code> on the core. All adjacencies on the core dropped, every area briefly lost inter-area routes, and the original split was still there afterwards. Following the workflow, <code>show ip ospf border-routers</code> and the database would have shown the island in two minutes.</p><p><b>Lesson:</b> diagnose with show commands first; clearing OSPF is disruptive and rarely fixes design problems.</p></div>

<div class="iv"><p class="q">"R1 has an O IA route but traffic dies at the ABR. What do you check?"</p><p>Strong answer: routing table on each hop, then <code>show ip ospf border-routers</code> and <code>show ip ospf database summary &lt;prefix&gt;</code> on the ABR to see which area the type 3 came from. If the ABR has the LSA only in a non-backbone area, it will not use it: the backbone is partitioned or the ABR has lost area 0. Fix with a proper backbone link, or a temporary virtual link.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work in order: neighbours, interfaces, logs, roles, database, routing table, policy.</li>
<li>LSA present but no route: filter, network type mismatch or unreachable advertiser.</li>
<li>ABRs use only backbone type 3 LSAs; a split area 0 causes half-working, asymmetric routing.</li>
<li>Virtual links repair a split quickly; a proper area 0 link is the real fix.</li>
<li>Never clear OSPF before you have a diagnosis.</li>
</ul></div>
`,hi:`
<p>Achha doctor surgery se shuru nahi karta. Woh pehle pulse check karta hai, phir blood tests, phir scans, har step wajah ko narrow karta hai. OSPF troubleshooting bhi aise hi kaam karti hai: pehle neighbours, phir interface settings, phir database, phir routing table, phir filters aur summaries. Seedha <code>clear ip ospf process</code> par kood jaana bina diagnosis ki surgery hai.</p>

<h3>Workflow</h3>
<ol>
<li><b>Neighbours</b>: <code>show ip ospf neighbor</code>. Neighbour missing hai, state atki hai (Init, 2-Way, ExStart/Exchange) ya FULL hai?</li>
<li><b>Interfaces</b>: <code>show ip ospf interface brief</code> aur <code>show ip ospf interface Gi0/x</code>. Sahi area, sahi network type, matching timers, passive nahi, expected cost.</li>
<li><b>Logs</b>: mismatched area ID, mismatched Hello parameters, duplicate router ID, "Too many retransmissions".</li>
<li><b>Roles</b>: <code>show ip ospf</code> ("It is an area border router"), doosre routers par <code>show ip ospf border-routers</code>.</li>
<li><b>Database</b>: <code>show ip ospf database</code>, phir sawaal wale prefix ke liye <code>summary</code>, <code>router</code>, <code>network</code>, <code>external</code>. LSA hai ya nahi, kaun advertise karta hai, kaunsa area?</li>
<li><b>Routing table</b>: <code>show ip route ospf</code> aur <code>show ip route &lt;prefix&gt;</code>. LSA hai par route nahi matlab filter, fail hua SPF two-way check, ya unreachable advertising router.</li>
<li><b>Policy</b>: ranges, filter-lists aur distribute-lists ke liye <code>show run | section router ospf</code>.</li>
</ol>

<h3>Lab 1 walk karna (ABR summarisation ke saath multi-area)</h3>
<table class="cmp"><tr><th>Symptom</th><th>Check</th><th>Sambhavit wajah aur fix</th></tr>
<tr><td>R1 par koi O IA route hi nahi</td><td>ABR1 par <code>show ip ospf neighbor</code></td><td>Gi0/0 area 10 mein nahi, ya enable nahi. <code>ip ospf 1 area 10</code> se area 10 mein daalo.</td></tr>
<tr><td>R1 ka neighbour hai, phir bhi O IA nahi</td><td>ABR1 par <code>show ip ospf</code></td><td>Area 0 mein koi interface nahi, isliye ABR nahi. Gi0/1 aur Lo0 ko area 0 mein enable karo.</td></tr>
<tr><td>CORE ke console par mismatched area ID</td><td>ABR2 par <code>show ip ospf interface brief</code></td><td>ABR2 Gi0/0 area 0 ki jagah area 20 mein: galat network statement.</td></tr>
<tr><td>CORE ab bhi chaar 172.16 /24s dikhata hai</td><td>ABR1 par <code>show ip ospf | begin Area 10</code></td><td>Range galat area ke neeche type hui (<code>area 0 range</code>) ya galat mask.</td></tr>
<tr><td>PC5 172.16.2.1 ping nahi kar pata</td><td>R5, ABR2, CORE, ABR1 par <code>show ip route 172.16.2.1</code></td><td>Path hop by hop follow karo; PC5 ka gateway 192.168.20.1 aur R5 ka O IA /22 check karo.</td></tr></table>

<h3>Lab 2 walk karna (Ethernet par point-to-point)</h3>
<ul>
<li><b>Sirf ek end point-to-point par badla</b>: neighbour FULL hai, par us link ke through routes missing hain (broadcast vs point-to-point). Dono ends par <code>show ip ospf interface</code> mismatch dikhata hai.</li>
<li><b>Hello 5 sirf R1 par</b>: logs mismatched Hello parameters dikhate hain; 20 second baad neighbour down. R2 Gi0/0 bhi configure karo.</li>
<li><b>R1 par loopback ab bhi /32</b>: point-to-point command R3 Loopback1 ki jagah Loopback0 par lag gaya.</li>
</ul>

<h3>Ticket: Area 0 split</h3>
<p><b>Ticket NK-7730.</b> "09:40 par CORE se ABR2 ka fibre katne ke baad se Pune users Chennai plant tak nahi pahunch pa rahe. R1 ab bhi 192.168.20.0/24 ka route dikhata hai, lekin traceroutes ABR1 par mar jaate hain. Pune server logs mein plant se connection attempts dikhte hain, par plant ko kabhi reply nahi milta." Background: pichhle mahine ABR1 Gi0/2 aur ABR2 Gi0/2 ke beech backup link 10.10.24.0/30 joda gaya tha, <b>area 10</b> mein.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Area 0 split">
<rect x="150" y="20" width="200" height="90" rx="12" fill="#bae6fd"/><text x="250" y="40" text-anchor="middle" class="svg-ink" font-size="12">Area 0 hissa A</text>
<rect x="400" y="20" width="120" height="90" rx="12" fill="#bae6fd"/><text x="460" y="40" text-anchor="middle" class="svg-ink" font-size="12">Area 0 hissa B</text>
<rect x="170" y="55" width="70" height="34" rx="6" fill="#ddd6fe"/><text x="205" y="77" text-anchor="middle" class="svg-ink" font-size="12">ABR1</text>
<rect x="265" y="55" width="70" height="34" rx="6" fill="#e2e8f0"/><text x="300" y="77" text-anchor="middle" class="svg-ink" font-size="12">CORE</text>
<rect x="425" y="55" width="70" height="34" rx="6" fill="#ddd6fe"/><text x="460" y="77" text-anchor="middle" class="svg-ink" font-size="12">ABR2</text>
<line x1="240" y1="72" x2="265" y2="72" stroke="#64748b" stroke-width="2"/>
<line x1="335" y1="72" x2="425" y2="72" stroke="#dc2626" stroke-width="2" stroke-dasharray="4 4"/><text x="380" y="64" text-anchor="middle" class="svg-accent" font-size="12">kata</text>
<rect x="60" y="140" width="460" height="70" rx="12" fill="#bbf7d0"/><text x="120" y="160" text-anchor="middle" class="svg-ink" font-size="12">Area 10</text>
<line x1="205" y1="89" x2="205" y2="185" stroke="#64748b" stroke-width="2"/><line x1="460" y1="89" x2="460" y2="185" stroke="#64748b" stroke-width="2"/>
<line x1="205" y1="185" x2="460" y2="185" stroke="#64748b" stroke-width="2"/><text x="332" y="178" text-anchor="middle" class="svg-muted" font-size="12">backup 10.10.24.0/30 (area 10)</text>
<rect x="80" y="170" width="60" height="30" rx="6" fill="#e2e8f0"/><text x="110" y="190" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">ABR2 ka Lo0 area 0 mein hai, isliye apne backbone island par woh ab bhi ABR hai</text>
</svg><p class="cap">Backbone ab do islands hai jo sirf area 10 se jude hain. ABRs area 10 mein seekhe type 3 LSAs use karne se mana karte hain.</p></div>

<pre class="out">CORE# show ip route 192.168.20.0
<span class="hl">% Network not in table</span>

ABR1# show ip ospf border-routers
Internal Router Routing Table
Codes: i - Intra-area route, I - Inter-area route
<span class="hl">i 4.4.4.4 [1] via 10.10.24.2, GigabitEthernet0/2, ABR, Area 10, SPF 14</span>

ABR1# show ip ospf database summary 192.168.20.0 | include Area|Advertising
                Summary Net Link States (Area 10)
<span class="hl">  Advertising Router: 4.4.4.4</span>

ABR1# show ip route 192.168.20.0
<span class="hl">% Network not in table</span>

R1# show ip route 192.168.20.0 | include Known|from
  Known via "ospf 1", distance 110, metric 4, type inter area
  * 10.10.12.2, from 4.4.4.4, 00:06:02 ago, via GigabitEthernet0/0</pre>

<p><b>Diagnosis.</b> ABR2 ka Loopback0 ab bhi area 0 mein hai, isliye woh ek-router backbone island par ABR bana rehta hai. Woh area 10 mein 192.168.20.0/24 ka type 3 banata hai. R1, jo area 10 ka internal router hai, use khushi se use karta hai: uska next hop ABR1 hai, jo backup link ke through ABR2 tak ka path hai. Lekin ABR1 bhi ABR hai, aur ABR apne routes ke liye sirf <b>backbone</b> type 3 LSAs use karta hai. ABR1 area 10 mein LSA dekhta hai aur ignore kar deta hai, isliye uske paas route nahi hai aur woh R1 ke packets drop karta hai. CORE, jo area 0 ke hisse A mein hai, ABR2 se kuch bhi nahi paata. Doosri direction mein ABR2 Pune ke prefixes intra-area routes ke roop mein seekhta hai (woh area 10 mein hai), isliye R5 ke paas routes hain aur Chennai se Pune packets pahunchte hain, lekin replies ABR1 par mar jaate hain: one-way, aadha chalta hua, confusing.</p>

<p><b>Abhi ka fix: area 10 ke paar virtual link</b> dono backbone islands ko jodta hai.</p>
<pre class="code">ABR1(config)# router ospf 1
ABR1(config-router)# area 10 virtual-link 4.4.4.4
ABR2(config)# router ospf 1
ABR2(config-router)# area 10 virtual-link 2.2.2.2</pre>
<pre class="out">ABR1# show ip ospf virtual-links
<span class="hl">Virtual Link OSPF_VL0 to router 4.4.4.4 is up</span>
  Run as demand circuit
  DoNotAge LSA allowed.
  Transit area 10, via interface GigabitEthernet0/2
  Topology-MTID    Cost    Disabled     Shutdown      Topology Name
        0           1         no           no            Base
  Transmit Delay is 1 sec, State POINT_TO_POINT,
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5
    <span class="hl">Adjacency State FULL (Hello suppressed)</span></pre>
<p><b>Sahi fix</b>: backup link ko area 0 ka hissa banao (yeh do ABRs ko jodta hai, isliye backbone mein hi hona chahiye), ya doosra backbone path jodo. Phir virtual link hata do. Area 0 kabhi ek hi link par depend nahi hona chahiye.</p>

<div class="eg"><p><b>Worked example: R1 ka metric 4 kyun hai.</b> ABR2 ka area 10 mein type 3 metric 2 (Chennai LAN tak) le jaata hai. R1 area 10 ke andar ABR1 ke through ABR2 tak pahunchta hai: 1 (R1 Gi0/0) + 1 (ABR1 Gi0/2) = 2. Total 4, 4.4.4.4 se. Cut se pehle route 5 tha, 2.2.2.2 se. Badla hua "from" router aur badla hua metric strong clues hain ki path ab backbone ko bypass kar raha hai.</p></div>

<div class="warn"><p><b>Common galti.</b> R1 par route dekh kar keh dena "routing theek hai, firewall hoga". Hamesha path ke har hop par routing table check karo; ABR woh drop kar sakta hai jo internal router khushi se use bhejta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Partitioned area 0 normal transit area (stub ya NSSA nahi) ke through virtual link se repair hota hai, dono ABRs par doosre ke router ID ke saath configure. <code>show ip ospf virtual-links</code> ise verify karta hai.</p></div>

<div class="scn"><h4>Clear jisne halat aur bigaad di</h4><p>Aise hi ek outage ke dauraan ek engineer ne core par <code>clear ip ospf process</code> chala diya. Core ki saari adjacencies gir gayi, har area ne kuch der ke liye inter-area routes kho diye, aur original split baad mein bhi wahin tha. Workflow follow karte to <code>show ip ospf border-routers</code> aur database do minute mein island dikha dete.</p><p><b>Seekh:</b> pehle show commands se diagnose karo; OSPF clear karna disruptive hai aur design problems shayad hi kabhi fix karta hai.</p></div>

<div class="iv"><p class="q">"R1 ke paas O IA route hai par traffic ABR par mar jaata hai. Aap kya check karoge?"</p><p>Strong answer: har hop par routing table, phir ABR par <code>show ip ospf border-routers</code> aur <code>show ip ospf database summary &lt;prefix&gt;</code> taaki dikhe type 3 kis area se aaya. Agar ABR ke paas LSA sirf non-backbone area mein hai, woh use nahi karega: backbone partitioned hai ya ABR ne area 0 kho diya hai. Proper backbone link se fix karo, ya temporary virtual link se.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein kaam karo: neighbours, interfaces, logs, roles, database, routing table, policy.</li>
<li>LSA hai par route nahi: filter, network type mismatch ya unreachable advertiser.</li>
<li>ABRs sirf backbone type 3 LSAs use karte hain; split area 0 aadhi chalti, asymmetric routing deta hai.</li>
<li>Virtual links split ko jaldi repair karte hain; proper area 0 link asli fix hai.</li>
<li>Diagnosis se pehle kabhi OSPF clear mat karo.</li>
</ul></div>
`}};export{e as default};