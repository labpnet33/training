var e={id:`verify`,h:{en:`Verification: reading every show command`,hi:`Verification: har show command padhna`},body:{en:`
<p>A doctor does not diagnose by guessing. They check pulse, then blood pressure, then blood tests, always in a sensible order, and each test answers one question. OSPFv3 verification is the same: each <code>show</code> command answers one question, and running them in order tells you exactly where you are. This chapter uses the finished module lab and matches the lab's verification tasks: R2 has two FULL neighbours, R1 learns the Mumbai LAN via a link-local next hop, and a ping proves it.</p>

<h3>The five questions and their commands</h3>
<table class="cmp"><tr><th>Question</th><th>Classic command</th><th>AF-style equivalent</th></tr>
<tr><td>Is OSPFv3 running, with which RID and on which interfaces?</td><td><code>show ipv6 protocols</code>, <code>show ipv6 ospf</code></td><td><code>show ospfv3</code></td></tr>
<tr><td>Which interfaces are enabled, in which area, with what cost and role?</td><td><code>show ipv6 ospf interface brief</code></td><td><code>show ospfv3 interface brief</code></td></tr>
<tr><td>Who are my neighbours and are they FULL?</td><td><code>show ipv6 ospf neighbor</code></td><td><code>show ospfv3 neighbor</code></td></tr>
<tr><td>What is in my LSDB?</td><td><code>show ipv6 ospf database</code></td><td><code>show ospfv3 database</code></td></tr>
<tr><td>Which routes did OSPFv3 install?</td><td colspan="2"><code>show ipv6 route ospf</code> (same for both)</td></tr>
</table>

<h3>1. Is the process running?</h3>
<pre class="out">R1# show ipv6 protocols
IPv6 Routing Protocol is "connected"
IPv6 Routing Protocol is "application"
IPv6 Routing Protocol is "ND"
<span class="hl">IPv6 Routing Protocol is "ospf 10"</span>
  <span class="hl">Router ID 1.1.1.1</span>
  Number of areas: 1 normal, 0 stub, 0 nssa
  Interfaces (Area 0):
    GigabitEthernet0/1
    GigabitEthernet0/0
  Redistribution:
    None</pre>
<p>You confirm three things at once: the process exists, it has a router ID, and both interfaces are in area 0. If the Router ID line is missing on an IPv6-only router, stop here: you have the NORTRID problem.</p>

<h3>2. Interfaces at a glance</h3>
<pre class="out">R1# show ipv6 ospf interface brief
Interface    PID   Area            Intf ID    Cost  State Nbrs F/C
Gi0/1        10    0               4          1     DR    0/0
<span class="hl">Gi0/0        10    0               3          1     BDR   1/1</span></pre>
<p>Columns: process ID, area, the <b>Interface ID</b> (an OSPFv3 value the router uses to identify its link, carried in Hellos and LSAs), cost, the router's role on that link (DR, BDR, DROTH, P2P) and <b>Nbrs F/C</b>: neighbours that are Full out of the total Count. <code>1/1</code> is healthy; <code>0/1</code> means a neighbour is stuck. Gi0/1 shows DR with 0/0 because R1 is the only OSPF router on the Delhi LAN.</p>

<h3>3. Neighbours: the lab's key task</h3>
<pre class="out">R2# show ipv6 ospf neighbor

            OSPFv3 Router with ID (2.2.2.2) (Process ID 10)

Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
<span class="hl">1.1.1.1           1   FULL/BDR        00:00:35    3               GigabitEthernet0/0</span>
<span class="hl">3.3.3.3           1   FULL/DR         00:00:33    3               GigabitEthernet0/1</span></pre>
<p>Read it carefully. The <b>Neighbor ID is the router ID</b>, not an IPv6 address. There is no "Address" column like OSPFv2; instead you see the neighbour's <b>Interface ID</b>. The state is FULL, and after the slash is the neighbour's role on that link: R1 is BDR on the R1-R2 link (R2 is DR there because 2.2.2.2 is higher), and R3 is DR on the R2-R3 link. Dead Time counts down from 40 and resets with every Hello. Add <code>detail</code> to see the neighbour's link-local address:</p>
<pre class="out">R2# show ipv6 ospf neighbor detail
 Neighbor 1.1.1.1
    <span class="hl">In the area 0 via interface GigabitEthernet0/0</span>
    <span class="hl">Neighbor: interface-id 3, link-local address FE80::5200:FF:FE01:0</span>
    Neighbor priority is 1, State is FULL, 6 state changes
    DR is 2.2.2.2 BDR is 1.1.1.1</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Verification order">
<rect x="10" y="60" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="85" text-anchor="middle" class="svg-ink" font-size="12">protocols</text><text x="65" y="103" text-anchor="middle" class="svg-muted" font-size="12">RID, process</text>
<rect x="135" y="60" width="110" height="60" rx="8" fill="#bae6fd"/><text x="190" y="85" text-anchor="middle" class="svg-ink" font-size="12">interface brief</text><text x="190" y="103" text-anchor="middle" class="svg-muted" font-size="12">area, F/C</text>
<rect x="260" y="60" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="315" y="85" text-anchor="middle" class="svg-ink" font-size="12">neighbor</text><text x="315" y="103" text-anchor="middle" class="svg-muted" font-size="12">FULL?</text>
<rect x="385" y="60" width="110" height="60" rx="8" fill="#fde68a"/><text x="440" y="85" text-anchor="middle" class="svg-ink" font-size="12">database</text><text x="440" y="103" text-anchor="middle" class="svg-muted" font-size="12">LSAs</text>
<rect x="510" y="60" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="570" y="85" text-anchor="middle" class="svg-ink" font-size="12">route + ping</text><text x="570" y="103" text-anchor="middle" class="svg-muted" font-size="12">O, OI, OE2</text>
<line x1="120" y1="90" x2="135" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="245" y1="90" x2="260" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="370" y1="90" x2="385" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="495" y1="90" x2="510" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">Stop at the first step that looks wrong</text>
</svg><p class="cap">Verify from the process outwards to the forwarding result.</p></div>

<h3>4. Routes and the final proof</h3>
<pre class="out">R1# show ipv6 route ospf
IPv6 Routing Table - default - 7 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
       B - BGP, R - RIP, H - NHRP, I1 - ISIS L1
       I2 - ISIS L2, IA - ISIS interarea, IS - ISIS summary, D - EIGRP
       EX - EIGRP external, ND - ND Default, NDp - ND Prefix, DCE - Destination
       NDr - Redirect, O - OSPF Intra, OI - OSPF Inter, OE1 - OSPF ext 1
       OE2 - OSPF ext 2, ON1 - OSPF NSSA ext 1, ON2 - OSPF NSSA ext 2
<span class="hl">O   2001:DB8:ACAD:3::/64 [110/3]</span>
<span class="hl">     via FE80::5200:FF:FE02:0, GigabitEthernet0/0</span>
O   2001:DB8:ACAD:23::/64 [110/2]
     via FE80::5200:FF:FE02:0, GigabitEthernet0/0

R1# ping 2001:DB8:ACAD:3::1
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 2001:DB8:ACAD:3::1, timeout is 2 seconds:
!!!!!
<span class="hl">Success rate is 100 percent (5/5)</span>, round-trip min/avg/max = 1/1/2 ms</pre>
<p>The route codes in the IPv6 table differ from IPv4: <b>O</b> intra-area, <b>OI</b> inter-area (IPv4 shows "O IA"), <b>OE1/OE2</b> external, <b>ON1/ON2</b> NSSA external. <code>[110/3]</code> is AD/metric. The next hop is R2's link-local address plus the exit interface. The connected link 2001:DB8:ACAD:12::/64 does not appear as O on R1, because a connected route (AD 0) always wins.</p>

<div class="eg"><p><b>Worked example.</b> A colleague says "R3 has the Delhi route, so everything is fine." You run <code>show ipv6 route ospf</code> on R3: <code>O 2001:DB8:ACAD:1::/64 [110/3] via FE80::5200:FF:FE02:1, GigabitEthernet0/0</code>. Good, but routing is two-way. You check R1 as well and find the Mumbai route. Only then do you ping from R1 to 2001:DB8:ACAD:3::1 and see 5/5. That is a complete verification: both directions and a data-plane test.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Looking for the neighbour's IPv6 address in the Neighbor ID column. (2) Using <code>show ip ospf neighbor</code> (OSPFv2) on an IPv6-only router and concluding OSPF is down. (3) Pinging a link-local address without specifying the exit interface; IOS will ask for it because link-locals are ambiguous.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which column in show ipv6 ospf neighbor displays the neighbour's IPv6 address?" None in the summary view: it shows Neighbor ID (router ID) and Interface ID. The link-local address appears in <code>show ipv6 ospf neighbor detail</code>. And inter-area routes in the IPv6 table are <b>OI</b>, not O IA.</p></div>

<div class="scn"><h4>"OSPF is down" that was not</h4><p>A night-shift NOC engineer got an alert that the Chennai IPv6 LAN was unreachable. He logged into the core router, ran <code>show ip ospf neighbor</code>, saw all OSPFv2 neighbours FULL, and closed the ticket as "routing fine". The alert fired again. The next engineer ran <code>show ipv6 ospf interface brief</code> on the Chennai router and saw <code>0/1</code> under F/C on the uplink. <code>show ipv6 ospf neighbor</code> showed the core stuck in INIT. The core side had lost its <code>ipv6 ospf 10 area 0</code> line during an interface template change. Restoring it brought the neighbour to FULL.</p><p><b>Lesson:</b> OSPFv2 and OSPFv3 are separate protocols; verify the one that carries the failing traffic.</p></div>

<div class="iv"><p class="q">"How do you verify OSPFv3 is working end to end?"</p><p>Strong answer, in order: <code>show ipv6 protocols</code> for the process, RID and interfaces; <code>show ipv6 ospf interface brief</code> for area, cost, role and F/C; <code>show ipv6 ospf neighbor</code> for FULL state (RID shown, not address); <code>show ipv6 route ospf</code> for O/OI/OE routes with link-local next hops; finally ping or traceroute between LANs in both directions. Mention <code>show ospfv3</code> equivalents for AF-style configs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: protocols, interface brief, neighbor, database, route, ping.</li>
<li>Neighbor ID shows router IDs; <code>detail</code> shows the link-local address.</li>
<li>F/C in interface brief shows Full neighbours over total; 0/1 means stuck.</li>
<li>IPv6 route codes: O, OI, OE1/OE2, ON1/ON2; next hop is link-local plus interface.</li>
<li>AF-style configs use <code>show ospfv3 ...</code>; the routing table command is the same.</li>
</ul></div>
`,hi:`
<p>Doctor andaaze se diagnose nahi karta. Woh pehle pulse check karta hai, phir blood pressure, phir blood tests, hamesha ek samajhdaar order mein, aur har test ek sawaal ka jawab deta hai. OSPFv3 verification bhi aisa hi hai: har <code>show</code> command ek sawaal ka jawab deta hai, aur unhe order mein chalane se exactly pata chalta hai ki aap kahan ho. Yeh chapter poora bana hua module lab use karta hai aur lab ke verification tasks se match karta hai: R2 ke do FULL neighbours hain, R1 Mumbai LAN ko link-local next hop ke through seekhta hai, aur ping ise prove karta hai.</p>

<h3>Paanch sawaal aur unke commands</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Classic command</th><th>AF-style equivalent</th></tr>
<tr><td>Kya OSPFv3 chal raha hai, kis RID ke saath aur kin interfaces par?</td><td><code>show ipv6 protocols</code>, <code>show ipv6 ospf</code></td><td><code>show ospfv3</code></td></tr>
<tr><td>Kaunse interfaces enabled hain, kis area mein, kis cost aur role ke saath?</td><td><code>show ipv6 ospf interface brief</code></td><td><code>show ospfv3 interface brief</code></td></tr>
<tr><td>Mere neighbours kaun hain aur kya woh FULL hain?</td><td><code>show ipv6 ospf neighbor</code></td><td><code>show ospfv3 neighbor</code></td></tr>
<tr><td>Mere LSDB mein kya hai?</td><td><code>show ipv6 ospf database</code></td><td><code>show ospfv3 database</code></td></tr>
<tr><td>OSPFv3 ne kaunse routes install kiye?</td><td colspan="2"><code>show ipv6 route ospf</code> (dono ke liye same)</td></tr>
</table>

<h3>1. Kya process chal raha hai?</h3>
<pre class="out">R1# show ipv6 protocols
IPv6 Routing Protocol is "connected"
IPv6 Routing Protocol is "application"
IPv6 Routing Protocol is "ND"
<span class="hl">IPv6 Routing Protocol is "ospf 10"</span>
  <span class="hl">Router ID 1.1.1.1</span>
  Number of areas: 1 normal, 0 stub, 0 nssa
  Interfaces (Area 0):
    GigabitEthernet0/1
    GigabitEthernet0/0
  Redistribution:
    None</pre>
<p>Aap ek saath teen cheezein confirm karte ho: process exist karta hai, uska router ID hai, aur dono interfaces area 0 mein hain. Agar IPv6-only router par Router ID line gayab hai, to yahin ruko: aapko NORTRID problem hai.</p>

<h3>2. Ek nazar mein interfaces</h3>
<pre class="out">R1# show ipv6 ospf interface brief
Interface    PID   Area            Intf ID    Cost  State Nbrs F/C
Gi0/1        10    0               4          1     DR    0/0
<span class="hl">Gi0/0        10    0               3          1     BDR   1/1</span></pre>
<p>Columns: process ID, area, <b>Interface ID</b> (ek OSPFv3 value jisse router apne link ko pehchanta hai, Hellos aur LSAs mein jaata hai), cost, us link par router ka role (DR, BDR, DROTH, P2P) aur <b>Nbrs F/C</b>: total Count mein se kitne neighbours Full hain. <code>1/1</code> healthy hai; <code>0/1</code> matlab koi neighbour atka hua hai. Gi0/1 par DR aur 0/0 dikhta hai kyunki Delhi LAN par R1 akela OSPF router hai.</p>

<h3>3. Neighbours: lab ka key task</h3>
<pre class="out">R2# show ipv6 ospf neighbor

            OSPFv3 Router with ID (2.2.2.2) (Process ID 10)

Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
<span class="hl">1.1.1.1           1   FULL/BDR        00:00:35    3               GigabitEthernet0/0</span>
<span class="hl">3.3.3.3           1   FULL/DR         00:00:33    3               GigabitEthernet0/1</span></pre>
<p>Dhyan se padho. <b>Neighbor ID router ID hai</b>, IPv6 address nahi. OSPFv2 jaisa "Address" column nahi hai; uski jagah aap neighbour ka <b>Interface ID</b> dekhte ho. State FULL hai, aur slash ke baad us link par neighbour ka role hai: R1-R2 link par R1 BDR hai (wahan R2 DR hai kyunki 2.2.2.2 bada hai), aur R2-R3 link par R3 DR hai. Dead Time 40 se neeche ginta hai aur har Hello par reset hota hai. Neighbour ka link-local address dekhne ke liye <code>detail</code> jodo:</p>
<pre class="out">R2# show ipv6 ospf neighbor detail
 Neighbor 1.1.1.1
    <span class="hl">In the area 0 via interface GigabitEthernet0/0</span>
    <span class="hl">Neighbor: interface-id 3, link-local address FE80::5200:FF:FE01:0</span>
    Neighbor priority is 1, State is FULL, 6 state changes
    DR is 2.2.2.2 BDR is 1.1.1.1</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Verification order">
<rect x="10" y="60" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="85" text-anchor="middle" class="svg-ink" font-size="12">protocols</text><text x="65" y="103" text-anchor="middle" class="svg-muted" font-size="12">RID, process</text>
<rect x="135" y="60" width="110" height="60" rx="8" fill="#bae6fd"/><text x="190" y="85" text-anchor="middle" class="svg-ink" font-size="12">interface brief</text><text x="190" y="103" text-anchor="middle" class="svg-muted" font-size="12">area, F/C</text>
<rect x="260" y="60" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="315" y="85" text-anchor="middle" class="svg-ink" font-size="12">neighbor</text><text x="315" y="103" text-anchor="middle" class="svg-muted" font-size="12">FULL?</text>
<rect x="385" y="60" width="110" height="60" rx="8" fill="#fde68a"/><text x="440" y="85" text-anchor="middle" class="svg-ink" font-size="12">database</text><text x="440" y="103" text-anchor="middle" class="svg-muted" font-size="12">LSAs</text>
<rect x="510" y="60" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="570" y="85" text-anchor="middle" class="svg-ink" font-size="12">route + ping</text><text x="570" y="103" text-anchor="middle" class="svg-muted" font-size="12">O, OI, OE2</text>
<line x1="120" y1="90" x2="135" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="245" y1="90" x2="260" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="370" y1="90" x2="385" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="495" y1="90" x2="510" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">Jo pehla step galat dikhe wahin ruko</text>
</svg><p class="cap">Process se shuru karke forwarding result tak verify karo.</p></div>

<h3>4. Routes aur final proof</h3>
<pre class="out">R1# show ipv6 route ospf
IPv6 Routing Table - default - 7 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
       B - BGP, R - RIP, H - NHRP, I1 - ISIS L1
       I2 - ISIS L2, IA - ISIS interarea, IS - ISIS summary, D - EIGRP
       EX - EIGRP external, ND - ND Default, NDp - ND Prefix, DCE - Destination
       NDr - Redirect, O - OSPF Intra, OI - OSPF Inter, OE1 - OSPF ext 1
       OE2 - OSPF ext 2, ON1 - OSPF NSSA ext 1, ON2 - OSPF NSSA ext 2
<span class="hl">O   2001:DB8:ACAD:3::/64 [110/3]</span>
<span class="hl">     via FE80::5200:FF:FE02:0, GigabitEthernet0/0</span>
O   2001:DB8:ACAD:23::/64 [110/2]
     via FE80::5200:FF:FE02:0, GigabitEthernet0/0

R1# ping 2001:DB8:ACAD:3::1
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 2001:DB8:ACAD:3::1, timeout is 2 seconds:
!!!!!
<span class="hl">Success rate is 100 percent (5/5)</span>, round-trip min/avg/max = 1/1/2 ms</pre>
<p>IPv6 table mein route codes IPv4 se alag hain: <b>O</b> intra-area, <b>OI</b> inter-area (IPv4 mein "O IA" dikhta hai), <b>OE1/OE2</b> external, <b>ON1/ON2</b> NSSA external. <code>[110/3]</code> AD/metric hai. Next hop R2 ka link-local address plus exit interface hai. Connected link 2001:DB8:ACAD:12::/64 R1 par O ki tarah nahi dikhta, kyunki connected route (AD 0) hamesha jeetta hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek colleague kehta hai "R3 ke paas Delhi route hai, to sab theek hai." Aap R3 par <code>show ipv6 route ospf</code> chalate ho: <code>O 2001:DB8:ACAD:1::/64 [110/3] via FE80::5200:FF:FE02:1, GigabitEthernet0/0</code>. Achha, lekin routing do-tarfa hoti hai. Aap R1 bhi check karte ho aur Mumbai route milta hai. Tabhi aap R1 se 2001:DB8:ACAD:3::1 ping karte ho aur 5/5 dekhte ho. Yeh complete verification hai: dono directions aur ek data-plane test.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Neighbor ID column mein neighbour ka IPv6 address dhoondhna. (2) IPv6-only router par <code>show ip ospf neighbor</code> (OSPFv2) chalana aur conclude karna ki OSPF down hai. (3) Exit interface bataye bina link-local address ping karna; IOS interface poochega kyunki link-locals ambiguous hote hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> "show ipv6 ospf neighbor mein kaunsa column neighbour ka IPv6 address dikhata hai?" Summary view mein koi nahi: yeh Neighbor ID (router ID) aur Interface ID dikhata hai. Link-local address <code>show ipv6 ospf neighbor detail</code> mein aata hai. Aur IPv6 table mein inter-area routes <b>OI</b> hain, O IA nahi.</p></div>

<div class="scn"><h4>"OSPF down hai" jo down tha hi nahi</h4><p>Night-shift NOC engineer ko alert mila ki Chennai IPv6 LAN unreachable hai. Usne core router par login kiya, <code>show ip ospf neighbor</code> chalaya, saare OSPFv2 neighbours FULL dekhe, aur ticket "routing fine" likh kar band kar diya. Alert phir aaya. Agle engineer ne Chennai router par <code>show ipv6 ospf interface brief</code> chalaya aur uplink par F/C mein <code>0/1</code> dekha. <code>show ipv6 ospf neighbor</code> mein core INIT mein atka tha. Interface template change ke dauraan core side ki <code>ipv6 ospf 10 area 0</code> line chali gayi thi. Use wapas lagane se neighbour FULL ho gaya.</p><p><b>Seekh:</b> OSPFv2 aur OSPFv3 alag protocols hain; woh verify karo jo failing traffic le jaata hai.</p></div>

<div class="iv"><p class="q">"OSPFv3 end to end kaam kar raha hai, yeh kaise verify karte ho?"</p><p>Strong answer, order mein: process, RID aur interfaces ke liye <code>show ipv6 protocols</code>; area, cost, role aur F/C ke liye <code>show ipv6 ospf interface brief</code>; FULL state ke liye <code>show ipv6 ospf neighbor</code> (RID dikhta hai, address nahi); link-local next hops wale O/OI/OE routes ke liye <code>show ipv6 route ospf</code>; aakhir mein LANs ke beech dono directions mein ping ya traceroute. AF-style configs ke liye <code>show ospfv3</code> equivalents batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: protocols, interface brief, neighbor, database, route, ping.</li>
<li>Neighbor ID router IDs dikhata hai; <code>detail</code> link-local address dikhata hai.</li>
<li>Interface brief mein F/C total mein se Full neighbours dikhata hai; 0/1 matlab atka hua.</li>
<li>IPv6 route codes: O, OI, OE1/OE2, ON1/ON2; next hop link-local plus interface hai.</li>
<li>AF-style configs <code>show ospfv3 ...</code> use karte hain; routing table command same hai.</li>
</ul></div>
`}};export{e as default};