var e={id:`verification`,h:{en:`Verifying multi-area OSPF: reading every show command`,hi:`Multi-area OSPF verify karna: har show command padhna`},body:{en:`
<p>A doctor does not start with surgery; she starts with a pulse, then temperature, then a blood test. Verifying OSPF works the same way: a fixed order, from the cheapest check to the most detailed one. For multi-area OSPF the order is: are the neighbours up, are the interfaces in the right areas, is the router what I expect (internal, ABR, ASBR), what is in the database, what reached the routing table, and does traffic really flow.</p>

<h3>The checklist</h3>
<div class="tbl"><table>
<tr><th>#</th><th>Question</th><th>Command</th></tr>
<tr><td>1</td><td>Are adjacencies FULL?</td><td><code>show ip ospf neighbor</code></td></tr>
<tr><td>2</td><td>Is each interface in the right area?</td><td><code>show ip ospf interface brief</code></td></tr>
<tr><td>3</td><td>What role and how many areas?</td><td><code>show ip ospf</code></td></tr>
<tr><td>4</td><td>Which LSAs does this router hold?</td><td><code>show ip ospf database</code> and its keywords</td></tr>
<tr><td>5</td><td>Where are the ABRs and ASBRs?</td><td><code>show ip ospf border-routers</code></td></tr>
<tr><td>6</td><td>What did OSPF install?</td><td><code>show ip route ospf</code></td></tr>
<tr><td>7</td><td>Does the path work?</td><td><code>ping</code> and <code>traceroute</code></td></tr>
</table></div>

<h3>1 and 2: neighbours and areas</h3>
<p>You know <code>show ip ospf neighbor</code> from single-area OSPF. Multi-area adds one rule: the neighbour must be in the <b>same area as the link</b>. So always follow it with the Area column of the interface table. On the ABR it looks like this:</p>
<pre class="out">R2# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
<span class="hl">Gi0/0        1     1               10.0.12.2/30       1     DR    1/1</span>
<span class="hl">Gi0/1        1     0               10.0.23.1/30       1     BDR   1/1</span>
Lo0          1     0               2.2.2.2/32         1     LOOP  0/0</pre>
<p>Read the Nbrs F/C column as 'full neighbours / total neighbours'. On the ABR, one interface per area has 1/1. If a link shows 0/0 while the other end is up, suspect the area, the mask or the Hello values. If it shows 0/1 or 1/2, an adjacency is stuck before FULL.</p>

<h3>3: what kind of router is this</h3>
<pre class="out">R2# show ip ospf | include border|Number of areas in|Area B|Area 1|interfaces in|Number of LSA|SPF algorithm executed
<span class="hl"> It is an area border router</span>
<span class="hl"> Number of areas in this router is 2. 2 normal 0 stub 0 nssa</span>
    Area BACKBONE(0)
        Number of interfaces in this area is 2 (1 loopback)
        SPF algorithm executed 2 times
        Number of LSA 8. Checksum Sum 0xB26F87
    Area 1
        Number of interfaces in this area is 1
        SPF algorithm executed 2 times
        Number of LSA 6. Checksum Sum 0x24C0A0</pre>
<p>Use this output to check three things. The role line (area border router, autonomous system boundary router, or no line for an internal router). The count of areas, which for an ABR must be at least 2. And the per-area block, where each area has its <b>own</b> interface count, LSA count and SPF counter. Also look at the Area BACKBONE block on an ABR: if it says 'Number of interfaces in this area is 1 (1 loopback)', the router has no real link in area 0 and will not forward inter-area traffic.</p>

<h3>4: the database and its keywords</h3>
<p>Plain <code>show ip ospf database</code> prints one section per LSA type and area, as you saw in chapter 3. Add a keyword for the detail of one type:</p>
<ul>
<li><code>show ip ospf database router</code>: type 1 detail, with the lines 'Area Border Router' or 'AS Boundary Router' showing the flags set by each originator.</li>
<li><code>show ip ospf database network</code>: type 2 detail.</li>
<li><code>show ip ospf database summary</code>: type 3 detail, the prefixes learned through the ABR.</li>
<li><code>show ip ospf database asbr-summary</code>: type 4 detail.</li>
<li><code>show ip ospf database external</code>: type 5 detail, including the metric type and the forwarding address.</li>
</ul>
<pre class="out">R1# show ip ospf database summary

            OSPF Router with ID (1.1.1.1) (Process ID 1)

		Summary Net Link States (Area 1)

  LS age: 60
  Options: (No TOS-capability, DC, Upward)
  LS Type: Summary Links(Network)
  Link State ID: 10.0.23.0 (summary Network Number)
  Advertising Router: 2.2.2.2
  LS Seq Number: 80000001
  Checksum: 0x19CE
  Length: 28
  Network Mask: /30
        MTID: 0         Metric: 1</pre>
<p>(Two more LSAs, for 2.2.2.2/32 and 3.3.3.3/32, are omitted here to save space.) Each entry is one prefix: Link State ID is the network, Network Mask its length and Metric the cost <b>from the ABR</b>. Advertising Router 2.2.2.2 tells you which ABR to blame, or thank.</p>

<h3>5: border routers</h3>
<p>Before using an inter-area or external route, a router must know the way to the ABR or ASBR. <code>show ip ospf border-routers</code> shows this internal table:</p>
<pre class="out">R1# show ip ospf border-routers

            OSPF Router with ID (1.1.1.1) (Process ID 1)


		Base Topology (MTID 0)

Internal Router Routing Table
Codes: i - Intra-area route, I - Inter-area route

<span class="hl">i 2.2.2.2 [1] via 10.0.12.2, GigabitEthernet0/0, ABR, Area 1, SPF 2</span>
<span class="hl">I 3.3.3.3 [2] via 10.0.12.2, GigabitEthernet0/0, ASBR, Area 1, SPF 2</span></pre>
<p>R1 knows two border routers. 2.2.2.2 is an ABR, reached intra-area (lowercase i), cost 1, and R1 learned it from a type 1 LSA. 3.3.3.3 is an ASBR, reached inter-area (capital I) through the ABR, cost 2, and R1 learned it from the type 4 LSA. If an expected ASBR is absent from this list, its external routes will not install on this router. It is the fastest way to find a missing type 4.</p>

<h3>6 and 7: routing table and path</h3>
<p>On R1, <code>show ip route ospf</code> gave the O IA and O*E2 lines of chapter 4. Finish with <code>traceroute 3.3.3.3</code>: the first hop must be the ABR, 10.0.12.2, and the second the destination. That proves the packet enters the backbone.</p>

<div class="eg"><p><b>Worked example.</b> You are told: 'R1 cannot see the internet.' Run the checklist on R1. Neighbour FULL, interface in area 1: both fine. Database: Type-5 section has 0.0.0.0 from 3.3.3.3, but there is no Summary ASB section. Border-routers: only 2.2.2.2, no 3.3.3.3. That points to the ABR, which is not generating type 4. On R2, <code>show ip ospf</code> would show the ABR flag missing or Area BACKBONE with only a loopback. Five minutes, four commands, and you have the faulty router, not a guess.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reading only the routing table: a route can be missing because of a fault two routers away. Forgetting that the database of an ABR is per area, so you must read the right section. Treating FULL as enough: on a multi-area link the area must be right too.</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>show ip ospf</code> shows the role and per-area information. <code>show ip ospf border-routers</code> lists ABRs and ASBRs known to this router. <code>show ip ospf database</code> keywords map to types: router 1, network 2, summary 3, asbr-summary 4, external 5. <code>show ip ospf interface brief</code> shows the area of every OSPF interface. A lowercase i in the border-routers table means intra-area; capital I means inter-area.</p></div>

<div class="scn"><h4>Everything FULL, nothing reachable</h4><p>After a weekend change window, a plant in area 4 lost all contact with the head office. The NOC saw every adjacency FULL on every router, so they blamed the WAN provider. An engineer ran <code>show ip ospf</code> on the plant's ABR and found that its backbone block listed 'Number of interfaces in this area is 1 (1 loopback)'. Someone had moved the uplink into area 4 on both ends, so the adjacency stayed FULL, but the plant's ABR was left with no real link in area 0. It was an ABR only on paper. Moving the uplink back to area 0 on both ends restored routes in under a minute.</p><p><b>Lesson:</b> check the area counts and interface counts per area on every ABR.</p></div>

<div class="iv"><p class="q">'How do you check whether a router is working as an ABR?'</p><p>Strong answer: <code>show ip ospf</code> must say area border router and list at least two areas, one of them BACKBONE with a real, non-loopback interface. <code>show ip ospf interface brief</code> shows the area of each link and a FULL neighbour on both sides. On a neighbour in a different area, the database should show type 3 LSAs advertised by the ABR's router ID, and <code>show ip ospf border-routers</code> should list it as ABR.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Verify in order: neighbours, interface areas, router role, database, border routers, routing table, path test.</li>
<li><code>show ip ospf</code> gives the role plus per-area counters; <code>show ip ospf interface brief</code> gives the area of every link.</li>
<li>Database keywords map to LSA types; Advertising Router of a type 3 is the ABR.</li>
<li><code>show ip ospf border-routers</code> proves a router can reach the ABRs and ASBRs it depends on.</li>
</ul></div>
`,hi:`
<p>Doctor operation se shuru nahi karta; woh pehle nabz dekhta hai, phir temperature, phir blood test. OSPF verify karna bhi aise hi chalta hai: ek fixed order, sabse sasti check se sabse detailed tak. Multi-area OSPF ke liye order yeh hai: neighbours up hain, interfaces sahi areas mein hain, router waisa hai jaisa socha (internal, ABR, ASBR), database mein kya hai, routing table mein kya pahuncha, aur traffic sach mein chalta hai ya nahi.</p>

<h3>Checklist</h3>
<div class="tbl"><table>
<tr><th>#</th><th>Sawaal</th><th>Command</th></tr>
<tr><td>1</td><td>Adjacencies FULL hain?</td><td><code>show ip ospf neighbor</code></td></tr>
<tr><td>2</td><td>Har interface sahi area mein hai?</td><td><code>show ip ospf interface brief</code></td></tr>
<tr><td>3</td><td>Role kya hai aur kitne areas?</td><td><code>show ip ospf</code></td></tr>
<tr><td>4</td><td>Is router ke paas kaun se LSAs hain?</td><td><code>show ip ospf database</code> aur uske keywords</td></tr>
<tr><td>5</td><td>ABRs aur ASBRs kahan hain?</td><td><code>show ip ospf border-routers</code></td></tr>
<tr><td>6</td><td>OSPF ne kya install kiya?</td><td><code>show ip route ospf</code></td></tr>
<tr><td>7</td><td>Path chalta hai?</td><td><code>ping</code> aur <code>traceroute</code></td></tr>
</table></div>

<h3>1 aur 2: neighbours aur areas</h3>
<p><code>show ip ospf neighbor</code> aap single-area OSPF se jaante ho. Multi-area ek rule jodta hai: neighbour <b>link ke same area</b> mein hona chahiye. Isliye iske baad hamesha interface table ka Area column dekho. ABR par yeh aisa dikhta hai:</p>
<pre class="out">R2# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
<span class="hl">Gi0/0        1     1               10.0.12.2/30       1     DR    1/1</span>
<span class="hl">Gi0/1        1     0               10.0.23.1/30       1     BDR   1/1</span>
Lo0          1     0               2.2.2.2/32         1     LOOP  0/0</pre>
<p>Nbrs F/C column ko 'full neighbours / total neighbours' padho. ABR par har area ke ek interface par 1/1 hota hai. Agar koi link 0/0 dikhaye jabki doosra end up hai, to area, mask ya Hello values par shak karo. Agar 0/1 ya 1/2 dikhe, to adjacency FULL se pehle atki hai.</p>

<h3>3: yeh kis tarah ka router hai</h3>
<pre class="out">R2# show ip ospf | include border|Number of areas in|Area B|Area 1|interfaces in|Number of LSA|SPF algorithm executed
<span class="hl"> It is an area border router</span>
<span class="hl"> Number of areas in this router is 2. 2 normal 0 stub 0 nssa</span>
    Area BACKBONE(0)
        Number of interfaces in this area is 2 (1 loopback)
        SPF algorithm executed 2 times
        Number of LSA 8. Checksum Sum 0xB26F87
    Area 1
        Number of interfaces in this area is 1
        SPF algorithm executed 2 times
        Number of LSA 6. Checksum Sum 0x24C0A0</pre>
<p>Is output se teen cheezein check karo. Role line (area border router, autonomous system boundary router, ya internal router ke liye koi line nahi). Areas ki ginti, jo ABR ke liye kam se kam 2 honi chahiye. Aur per-area block, jahan har area ka <b>apna</b> interface count, LSA count aur SPF counter hota hai. ABR par Area BACKBONE block bhi dekho: agar 'Number of interfaces in this area is 1 (1 loopback)' likha hai, to router ka area 0 mein koi asli link nahi hai aur woh inter-area traffic forward nahi karega.</p>

<h3>4: database aur uske keywords</h3>
<p>Seedha <code>show ip ospf database</code> har LSA type aur area ka alag section print karta hai, jaisa chapter 3 mein dekha. Ek type ki detail ke liye keyword jodo:</p>
<ul>
<li><code>show ip ospf database router</code>: type 1 detail, jisme 'Area Border Router' ya 'AS Boundary Router' lines har originator ke flags dikhati hain.</li>
<li><code>show ip ospf database network</code>: type 2 detail.</li>
<li><code>show ip ospf database summary</code>: type 3 detail, ABR ke through seekhe prefixes.</li>
<li><code>show ip ospf database asbr-summary</code>: type 4 detail.</li>
<li><code>show ip ospf database external</code>: type 5 detail, jisme metric type aur forwarding address bhi hota hai.</li>
</ul>
<pre class="out">R1# show ip ospf database summary

            OSPF Router with ID (1.1.1.1) (Process ID 1)

		Summary Net Link States (Area 1)

  LS age: 60
  Options: (No TOS-capability, DC, Upward)
  LS Type: Summary Links(Network)
  Link State ID: 10.0.23.0 (summary Network Number)
  Advertising Router: 2.2.2.2
  LS Seq Number: 80000001
  Checksum: 0x19CE
  Length: 28
  Network Mask: /30
        MTID: 0         Metric: 1</pre>
<p>(Do aur LSAs, 2.2.2.2/32 aur 3.3.3.3/32 ke, jagah bachane ke liye yahan chhode gaye hain.) Har entry ek prefix hai: Link State ID network hai, Network Mask uski length aur Metric <b>ABR se</b> cost. Advertising Router 2.2.2.2 batata hai ki kis ABR ko dosh dena hai, ya shukriya.</p>

<h3>5: border routers</h3>
<p>Inter-area ya external route use karne se pehle router ko ABR ya ASBR tak ka raasta pata hona chahiye. <code>show ip ospf border-routers</code> yeh internal table dikhata hai:</p>
<pre class="out">R1# show ip ospf border-routers

            OSPF Router with ID (1.1.1.1) (Process ID 1)


		Base Topology (MTID 0)

Internal Router Routing Table
Codes: i - Intra-area route, I - Inter-area route

<span class="hl">i 2.2.2.2 [1] via 10.0.12.2, GigabitEthernet0/0, ABR, Area 1, SPF 2</span>
<span class="hl">I 3.3.3.3 [2] via 10.0.12.2, GigabitEthernet0/0, ASBR, Area 1, SPF 2</span></pre>
<p>R1 do border routers jaanta hai. 2.2.2.2 ABR hai, intra-area (chhota i) mila, cost 1, aur R1 ne ise type 1 LSA se seekha. 3.3.3.3 ASBR hai, ABR ke through inter-area (bada I) mila, cost 2, aur R1 ne ise type 4 LSA se seekha. Agar koi expected ASBR is list mein nahi hai, to uske external routes is router par install nahi honge. Missing type 4 dhundhne ka sabse tez tareeka yahi hai.</p>

<h3>6 aur 7: routing table aur path</h3>
<p>R1 par <code>show ip route ospf</code> ne chapter 4 wali O IA aur O*E2 lines di thi. End mein <code>traceroute 3.3.3.3</code> chalao: pehla hop ABR, 10.0.12.2, hona chahiye aur doosra destination. Isse saabit hota hai ki packet backbone mein ghusta hai.</p>

<div class="eg"><p><b>Worked example.</b> Aapko bola gaya: 'R1 ko internet nahi dikh raha.' R1 par checklist chalao. Neighbour FULL, interface area 1 mein: dono theek. Database: Type-5 section mein 3.3.3.3 se 0.0.0.0 hai, lekin Summary ASB section nahi hai. Border-routers: sirf 2.2.2.2, 3.3.3.3 nahi. Yeh ABR ki taraf ishara karta hai, jo type 4 nahi bana raha. R2 par <code>show ip ospf</code> mein ABR flag gayab hoga ya Area BACKBONE mein sirf loopback hoga. Paanch minute, chaar commands, aur aapke paas andaaza nahi, galat router hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Sirf routing table padhna: route do routers door ki galti se gayab ho sakta hai. Bhoolna ki ABR par database area ke hisaab se hota hai, isliye sahi section padhna padta hai. FULL ko kaafi samajhna: multi-area link par sahi area bhi chahiye.</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>show ip ospf</code> role aur per-area jaankari dikhata hai. <code>show ip ospf border-routers</code> is router ko pata ABRs aur ASBRs ki list dikhata hai. <code>show ip ospf database</code> ke keywords types se map hote hain: router 1, network 2, summary 3, asbr-summary 4, external 5. <code>show ip ospf interface brief</code> har OSPF interface ka area dikhata hai. Border-routers table mein chhota i matlab intra-area; bada I matlab inter-area.</p></div>

<div class="scn"><h4>Sab FULL, kuch reachable nahi</h4><p>Weekend change window ke baad area 4 ka ek plant head office se poori tarah kat gaya. NOC ko har router par har adjacency FULL dikhi, isliye unhone WAN provider ko dosh diya. Ek engineer ne plant ke ABR par <code>show ip ospf</code> chalaya aur dekha ki uske backbone block mein 'Number of interfaces in this area is 1 (1 loopback)' likha hai. Kisi ne uplink ko dono ends par area 4 mein daal diya tha, isliye adjacency FULL rahi, lekin plant ke ABR ke paas area 0 mein koi asli link nahi bacha. Woh sirf kaagaz par ABR tha. Uplink ko dono ends par wapas area 0 mein karte hi routes ek minute se kam mein wapas aa gaye.</p><p><b>Seekh:</b> har ABR par per-area interface counts check karo.</p></div>

<div class="iv"><p class="q">'Kaise check karoge ki router ABR ki tarah kaam kar raha hai?'</p><p>Strong answer: <code>show ip ospf</code> mein area border router likha hona chahiye aur kam se kam do areas, jinme se ek BACKBONE ho aur uska ek asli, non-loopback interface ho. <code>show ip ospf interface brief</code> har link ka area aur dono taraf FULL neighbour dikhata hai. Dusre area ke neighbour par database mein ABR ke router ID ke advertise kiye type 3 LSAs dikhne chahiye, aur <code>show ip ospf border-routers</code> use ABR ke roop mein list kare.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein verify karo: neighbours, interface areas, router role, database, border routers, routing table, path test.</li>
<li><code>show ip ospf</code> role aur per-area counters deta hai; <code>show ip ospf interface brief</code> har link ka area deta hai.</li>
<li>Database keywords LSA types se map hote hain; type 3 ka Advertising Router ABR hai.</li>
<li><code>show ip ospf border-routers</code> saabit karta hai ki router un ABRs aur ASBRs tak pahunch sakta hai jinpar woh nirbhar hai.</li>
</ul></div>
`}};export{e as default};