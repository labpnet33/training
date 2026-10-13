var e={id:`ospf-hellos`,h:{en:`Reading OSPF Hellos to find mismatches (Lab 3)`,hi:`Mismatch dhoondhne ke liye OSPF Hellos padhna (Lab 3)`},body:{en:`
<p>Two engineers meet at a conference and swap business cards. They only add each other as colleagues if the cards agree on a few things: the same department, the same meeting schedule, the same floor, the same secret team code. If one card says "meets every 5 minutes" and the other "every 10 minutes", they politely keep handing out cards, but never add each other. OSPF Hellos are those business cards, and a capture lets you put two of them side by side.</p>

<h3>OSPF on the wire</h3>
<p>OSPF runs directly on IP as <b>protocol 89</b> (no TCP or UDP). Hellos go to the multicast address <b>224.0.0.5</b> (all OSPF routers); DR and BDR updates use <b>224.0.0.6</b>. The IP TTL is <b>1</b>, so OSPF packets never leave the link. There are five packet types:</p>
<table class="cmp"><tr><th>Type</th><th>Name</th><th>When you see it</th></tr>
<tr><td>1</td><td>Hello</td><td>Always, every hello interval: discovery and keepalive</td></tr>
<tr><td>2</td><td>Database Description (DBD)</td><td>ExStart/Exchange: summaries of the LSDB, carries the interface MTU</td></tr>
<tr><td>3</td><td>Link State Request (LSR)</td><td>Loading: "send me these LSAs"</td></tr>
<tr><td>4</td><td>Link State Update (LSU)</td><td>The LSAs themselves, at adjacency and on every change</td></tr>
<tr><td>5</td><td>Link State Acknowledgment (LSAck)</td><td>Confirms each LSU</td></tr>
</table>

<h3>The fields in a Hello</h3>
<p>Expand "Open Shortest Path First" in the details pane. The header holds the <b>Source OSPF Router</b> (router ID), <b>Area ID</b> (shown dotted, 0.0.0.0 for the backbone) and <b>Auth Type</b> (0 null, 1 simple password, 2 cryptographic). The Hello body holds the <b>Network Mask</b>, <b>Hello Interval</b>, <b>Options</b> (the E bit is clear in a stub area), <b>Router Priority</b>, <b>Router Dead Interval</b>, <b>Designated Router</b>, <b>Backup Designated Router</b> and the list of <b>Active Neighbor</b> router IDs this router has heard from.</p>
<table class="cmp"><tr><th>Hello field</th><th>Must match?</th><th>Check with</th></tr>
<tr><td>Area ID</td><td><b>Yes</b></td><td>show ip ospf interface</td></tr>
<tr><td>Hello and Dead interval</td><td><b>Yes</b></td><td>show ip ospf interface</td></tr>
<tr><td>Network mask (broadcast and NBMA links)</td><td><b>Yes</b></td><td>show ip interface</td></tr>
<tr><td>Authentication type and key</td><td><b>Yes</b></td><td>show ip ospf interface</td></tr>
<tr><td>Stub area flag (Options)</td><td><b>Yes</b></td><td>show ip ospf</td></tr>
<tr><td>Router ID</td><td>Must be <b>different</b></td><td>show ip ospf</td></tr>
<tr><td>Router priority</td><td>No (DR election only)</td><td>show ip ospf interface</td></tr>
</table>
<p>MTU is not in the Hello. An MTU mismatch lets the neighbours see each other but leaves them stuck in <b>ExStart/Exchange</b>, and you spot it in the Interface MTU field of the DBD packets.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Two Hellos compared">
<rect x="10" y="10" width="300" height="30" rx="6" fill="#bbf7d0"/><text x="160" y="30" text-anchor="middle" class="svg-ink" font-size="13">Hello from R1 (1.1.1.1)</text>
<rect x="330" y="10" width="300" height="30" rx="6" fill="#fed7aa"/><text x="480" y="30" text-anchor="middle" class="svg-ink" font-size="13">Hello from R2 (2.2.2.2)</text>
<text x="20" y="65" class="svg-ink" font-size="12">Area ID: 0.0.0.0</text><text x="340" y="65" class="svg-ink" font-size="12">Area ID: 0.0.0.0</text>
<text x="20" y="90" class="svg-ink" font-size="12">Network Mask: 255.255.255.252</text><text x="340" y="90" class="svg-ink" font-size="12">Network Mask: 255.255.255.252</text>
<text x="20" y="115" class="svg-accent" font-size="12">Hello Interval: 10</text><text x="340" y="115" class="svg-accent" font-size="12">Hello Interval: 5</text>
<text x="20" y="140" class="svg-accent" font-size="12">Router Dead Interval: 40</text><text x="340" y="140" class="svg-accent" font-size="12">Router Dead Interval: 20</text>
<text x="20" y="165" class="svg-ink" font-size="12">Active Neighbor: (none)</text><text x="340" y="165" class="svg-ink" font-size="12">Active Neighbor: (none)</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">Both keep sending, neither lists the other: a parameter mismatch</text>
</svg><p class="cap">Lab 3, R1-R2 link: the odd fields jump out when two Hellos sit side by side.</p></div>

<h3>Three signatures to recognise</h3>
<ul>
<li><b>Both routers send Hellos, neither lists the other as Active Neighbor.</b> Each side receives the other's Hello and discards it: a mismatch in area, timers, mask, authentication or stub flag. Compare the two Hellos field by field.</li>
<li><b>Only one router sends Hellos.</b> OSPF is not enabled on the other interface (missing network statement, passive interface), or the other side's Hellos are being filtered.</li>
<li><b>One router lists the other, but not the other way round.</b> Hellos pass in one direction only: an ACL blocking protocol 89 or multicast in one direction. The stuck side shows the neighbour in <b>INIT</b>.</li>
</ul>

<h3>Lab 3 walkthrough: why is OSPF not forming?</h3>
<p>R1, R2 and R3 should form one area 0 chain (R1 Gi0/0 10.0.12.1, R2 Gi0/0 10.0.12.2, R2 Gi0/1 10.0.23.1, R3 Gi0/0 10.0.23.2), yet <code>show ip ospf neighbor</code> is empty everywhere. Instead of guessing, capture each link.</p>
<p><b>Link R1-R2.</b> Choose <code>R1 Gi0/0 ↔ R2 Gi0/0</code>, filter <code>ospf</code>, open a Hello from Source OSPF Router 2.2.2.2: <b>Hello Interval 5</b>, Dead 20. R1 sends 10 and 40. The show command confirms it:</p>
<pre class="out">R2# show ip ospf interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet Address 10.0.12.2/30, Area 0, Attached via Network Statement
  Process ID 1, Router ID 2.2.2.2, Network Type BROADCAST, Cost: 1
<span class="hl">  Timer intervals configured, Hello 5, Dead 20, Wait 20, Retransmit 5</span></pre>
<p>The design says default timers, so remove the custom value. The dead interval follows automatically (4 × hello):</p>
<pre class="code">R2(config)# interface GigabitEthernet0/0
R2(config-if)# no ip ospf hello-interval   <span class="c">! back to 10/40</span></pre>
<p>Within seconds the capture shows the Hellos listing each other as Active Neighbor, followed by DBD, LSR, LSU and LSAck packets: the adjacency forming live.</p>
<p><b>Link R2-R3.</b> Switch the selector to <code>R2 Gi0/1 ↔ R3 Gi0/0</code>. R3's Hellos carry <b>Area ID 0.0.0.1</b>, R2's carry 0.0.0.0. Fix R3's network statement:</p>
<pre class="code">R3(config)# router ospf 1
R3(config-router)# no network 10.0.23.0 0.0.0.3 area 1
R3(config-router)# network 10.0.23.0 0.0.0.3 area 0</pre>
<pre class="out">R2# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">1.1.1.1           1   FULL/BDR        00:00:36    10.0.12.1       GigabitEthernet0/0</span>
<span class="hl">3.3.3.3           1   FULL/DR         00:00:33    10.0.23.2       GigabitEthernet0/1</span></pre>
<p>Finish with <code>R1# show ip route ospf</code> (3.3.3.3/32 via 10.0.12.2) and <code>R1# ping 3.3.3.3</code>. The DR/BDR roles in your output may differ depending on which router came up first.</p>

<div class="eg"><p><b>Worked example: authentication.</b> On another network, both Hellos show Hello 10, Dead 40, area 0.0.0.0 and matching masks, yet no adjacency. Look at the header: one router sends <b>Auth Type: Null (0)</b>, the other <b>Cryptographic (2)</b>. Authentication was configured on one side only. The capture shows the type but never the key: with type 2 you see only a key ID and a digest, which is exactly why cryptographic authentication is preferred over simple (type 1), whose password travels in clear text.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing only the dead interval on one side to "match". On IOS, setting <code>ip ospf hello-interval</code> changes the dead interval to four times the hello automatically, but setting <code>ip ospf dead-interval</code> does not change the hello. Compare both fields in the capture after every change.</p></div>

<div class="exam"><p><b>Exam trap.</b> Router priority and router ID do not need to match (router IDs must actually be unique). Area, hello, dead, subnet and mask, authentication and stub flag must match. OSPF uses IP protocol 89 and 224.0.0.5/224.0.0.6, not TCP or UDP.</p></div>

<div class="scn"><h4>The new link that stayed in INIT</h4><p>After a change window, a new router link showed the neighbour stuck in INIT on one side and missing on the other. Captures on both ends showed Hellos from R5 arriving at R6, but R6's Hellos never arrived at R5. An inbound ACL on R5's new interface permitted only TCP and ICMP. Because R6 was hearing R5, R6 listed it in its Hellos; R5 heard nothing. Adding <code>permit ospf any any</code> to the ACL brought the adjacency to FULL.</p><p><b>Lesson:</b> the Active Neighbor list tells you who hears whom. A one-way view means one direction is being dropped.</p></div>

<div class="iv"><p class="q">"Two OSPF routers on the same link will not become neighbours. How would you use a capture to find out why?"</p><p>Strong answer: I capture on the link and filter on OSPF. If both routers send Hellos but neither lists the other as an Active Neighbor, I compare the two Hellos: area ID, mask, hello and dead interval, authentication type, stub flag. If only one sends Hellos, OSPF is not enabled or is passive on the other side. If one lists the other but not vice versa, something drops Hellos one way. If they see each other but stick in ExStart, I check the MTU in the DBD packets. Then I confirm with show ip ospf interface and fix the odd side.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPF: IP protocol 89, Hellos to 224.0.0.5 with TTL 1; five packet types from Hello to LSAck.</li>
<li>Must match: area, hello, dead, mask (broadcast links), authentication, stub flag; router ID must differ; priority need not match.</li>
<li>Both sending but neither listed as Active Neighbor = parameter mismatch; one-way listing = one direction dropped.</li>
<li>MTU mismatch shows in DBD packets and leaves neighbours in ExStart/Exchange.</li>
<li>Lab 3: R2 Hello 5/Dead 20 on the R1 link, and R3 area 0.0.0.1 on the R2 link.</li>
</ul></div>
`,hi:`
<p>Do engineers ek conference mein milte hain aur business cards badalte hain. Woh ek dusre ko colleague tabhi banate hain jab cards kuch cheezon par agree karein: same department, same meeting schedule, same floor, same secret team code. Agar ek card kehta hai "har 5 minute meeting" aur dusra "har 10 minute", to woh tameez se cards dete rehte hain, lekin kabhi ek dusre ko add nahi karte. OSPF Hellos wahi business cards hain, aur capture aapko do cards saath rakhne deta hai.</p>

<h3>Wire par OSPF</h3>
<p>OSPF seedha IP par <b>protocol 89</b> ke roop mein chalta hai (TCP ya UDP nahi). Hellos multicast address <b>224.0.0.5</b> (saare OSPF routers) ko jaate hain; DR aur BDR updates <b>224.0.0.6</b> use karte hain. IP TTL <b>1</b> hota hai, isliye OSPF packets kabhi link se bahar nahi jaate. Paanch packet types hain:</p>
<table class="cmp"><tr><th>Type</th><th>Naam</th><th>Kab dikhta hai</th></tr>
<tr><td>1</td><td>Hello</td><td>Hamesha, har hello interval par: discovery aur keepalive</td></tr>
<tr><td>2</td><td>Database Description (DBD)</td><td>ExStart/Exchange: LSDB ki summaries, interface MTU saath le jaata hai</td></tr>
<tr><td>3</td><td>Link State Request (LSR)</td><td>Loading: "mujhe yeh LSAs bhejo"</td></tr>
<tr><td>4</td><td>Link State Update (LSU)</td><td>Khud LSAs, adjacency par aur har change par</td></tr>
<tr><td>5</td><td>Link State Acknowledgment (LSAck)</td><td>Har LSU ko confirm karta hai</td></tr>
</table>

<h3>Hello ke fields</h3>
<p>Details pane mein "Open Shortest Path First" expand karo. Header mein <b>Source OSPF Router</b> (router ID), <b>Area ID</b> (dotted form mein, backbone ke liye 0.0.0.0) aur <b>Auth Type</b> (0 null, 1 simple password, 2 cryptographic) hota hai. Hello body mein <b>Network Mask</b>, <b>Hello Interval</b>, <b>Options</b> (stub area mein E bit clear hota hai), <b>Router Priority</b>, <b>Router Dead Interval</b>, <b>Designated Router</b>, <b>Backup Designated Router</b> aur un router IDs ki <b>Active Neighbor</b> list hoti hai jinhe is router ne suna hai.</p>
<table class="cmp"><tr><th>Hello field</th><th>Match zaroori?</th><th>Kisse check karein</th></tr>
<tr><td>Area ID</td><td><b>Haan</b></td><td>show ip ospf interface</td></tr>
<tr><td>Hello aur Dead interval</td><td><b>Haan</b></td><td>show ip ospf interface</td></tr>
<tr><td>Network mask (broadcast aur NBMA links)</td><td><b>Haan</b></td><td>show ip interface</td></tr>
<tr><td>Authentication type aur key</td><td><b>Haan</b></td><td>show ip ospf interface</td></tr>
<tr><td>Stub area flag (Options)</td><td><b>Haan</b></td><td>show ip ospf</td></tr>
<tr><td>Router ID</td><td><b>Alag</b> hona chahiye</td><td>show ip ospf</td></tr>
<tr><td>Router priority</td><td>Nahi (sirf DR election)</td><td>show ip ospf interface</td></tr>
</table>
<p>MTU Hello mein nahi hota. MTU mismatch mein neighbours ek dusre ko dekh lete hain lekin <b>ExStart/Exchange</b> mein atak jaate hain, aur aap ise DBD packets ke Interface MTU field mein pakadte ho.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Do Hellos ki tulna">
<rect x="10" y="10" width="300" height="30" rx="6" fill="#bbf7d0"/><text x="160" y="30" text-anchor="middle" class="svg-ink" font-size="13">R1 (1.1.1.1) ka Hello</text>
<rect x="330" y="10" width="300" height="30" rx="6" fill="#fed7aa"/><text x="480" y="30" text-anchor="middle" class="svg-ink" font-size="13">R2 (2.2.2.2) ka Hello</text>
<text x="20" y="65" class="svg-ink" font-size="12">Area ID: 0.0.0.0</text><text x="340" y="65" class="svg-ink" font-size="12">Area ID: 0.0.0.0</text>
<text x="20" y="90" class="svg-ink" font-size="12">Network Mask: 255.255.255.252</text><text x="340" y="90" class="svg-ink" font-size="12">Network Mask: 255.255.255.252</text>
<text x="20" y="115" class="svg-accent" font-size="12">Hello Interval: 10</text><text x="340" y="115" class="svg-accent" font-size="12">Hello Interval: 5</text>
<text x="20" y="140" class="svg-accent" font-size="12">Router Dead Interval: 40</text><text x="340" y="140" class="svg-accent" font-size="12">Router Dead Interval: 20</text>
<text x="20" y="165" class="svg-ink" font-size="12">Active Neighbor: (koi nahi)</text><text x="340" y="165" class="svg-ink" font-size="12">Active Neighbor: (koi nahi)</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">Dono bhej rahe hain, koi dusre ko list nahi karta: parameter mismatch</text>
</svg><p class="cap">Lab 3, R1-R2 link: do Hellos saath rakho to alag fields turant dikh jaate hain.</p></div>

<h3>Teen pehchaan jo yaad rakhni hain</h3>
<ul>
<li><b>Dono routers Hellos bhejte hain, koi dusre ko Active Neighbor list nahi karta.</b> Har side dusre ka Hello receive karke discard karti hai: area, timers, mask, authentication ya stub flag mein mismatch. Dono Hellos field by field compare karo.</li>
<li><b>Sirf ek router Hellos bhejta hai.</b> Dusre interface par OSPF enable nahi hai (missing network statement, passive interface), ya dusri side ke Hellos filter ho rahe hain.</li>
<li><b>Ek router dusre ko list karta hai, lekin ulta nahi.</b> Hellos sirf ek direction mein guzarte hain: ek direction mein protocol 89 ya multicast block karta ACL. Atki hui side neighbour ko <b>INIT</b> mein dikhati hai.</li>
</ul>

<h3>Lab 3 walkthrough: OSPF kyun nahi ban raha?</h3>
<p>R1, R2 aur R3 ek area 0 chain banane chahiye (R1 Gi0/0 10.0.12.1, R2 Gi0/0 10.0.12.2, R2 Gi0/1 10.0.23.1, R3 Gi0/0 10.0.23.2), phir bhi <code>show ip ospf neighbor</code> har jagah khaali hai. Andaza lagane ke bajaye har link capture karo.</p>
<p><b>R1-R2 link.</b> <code>R1 Gi0/0 ↔ R2 Gi0/0</code> chuno, <code>ospf</code> filter lagao, Source OSPF Router 2.2.2.2 wala Hello kholo: <b>Hello Interval 5</b>, Dead 20. R1 10 aur 40 bhejta hai. Show command confirm karta hai:</p>
<pre class="out">R2# show ip ospf interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet Address 10.0.12.2/30, Area 0, Attached via Network Statement
  Process ID 1, Router ID 2.2.2.2, Network Type BROADCAST, Cost: 1
<span class="hl">  Timer intervals configured, Hello 5, Dead 20, Wait 20, Retransmit 5</span></pre>
<p>Design default timers kehta hai, isliye custom value hatao. Dead interval apne aap follow karta hai (4 × hello):</p>
<pre class="code">R2(config)# interface GigabitEthernet0/0
R2(config-if)# no ip ospf hello-interval   <span class="c">! wapas 10/40</span></pre>
<p>Kuch seconds mein capture dikhata hai ki Hellos ek dusre ko Active Neighbor list kar rahe hain, uske baad DBD, LSR, LSU aur LSAck packets: adjacency live banti hui.</p>
<p><b>R2-R3 link.</b> Selector ko <code>R2 Gi0/1 ↔ R3 Gi0/0</code> par badlo. R3 ke Hellos mein <b>Area ID 0.0.0.1</b> hai, R2 ke mein 0.0.0.0. R3 ka network statement theek karo:</p>
<pre class="code">R3(config)# router ospf 1
R3(config-router)# no network 10.0.23.0 0.0.0.3 area 1
R3(config-router)# network 10.0.23.0 0.0.0.3 area 0</pre>
<pre class="out">R2# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">1.1.1.1           1   FULL/BDR        00:00:36    10.0.12.1       GigabitEthernet0/0</span>
<span class="hl">3.3.3.3           1   FULL/DR         00:00:33    10.0.23.2       GigabitEthernet0/1</span></pre>
<p><code>R1# show ip route ospf</code> (3.3.3.3/32 via 10.0.12.2) aur <code>R1# ping 3.3.3.3</code> se khatam karo. Aapke output mein DR/BDR roles alag ho sakte hain, is par depend karta hai ki kaunsa router pehle up hua.</p>

<div class="eg"><p><b>Worked example: authentication.</b> Ek dusre network par dono Hellos mein Hello 10, Dead 40, area 0.0.0.0 aur matching masks hain, phir bhi adjacency nahi. Header dekho: ek router <b>Auth Type: Null (0)</b> bhejta hai, dusra <b>Cryptographic (2)</b>. Authentication sirf ek side configure hua tha. Capture type dikhata hai lekin key kabhi nahi: type 2 mein sirf key ID aur digest dikhta hai, isiliye cryptographic authentication simple (type 1) se behtar hai, jiska password clear text mein jaata hai.</p></div>

<div class="warn"><p><b>Common galti.</b> "Match" karne ke liye ek side par sirf dead interval badalna. IOS par <code>ip ospf hello-interval</code> set karne se dead interval apne aap hello ka chaar guna ho jaata hai, lekin <code>ip ospf dead-interval</code> set karne se hello nahi badalta. Har change ke baad capture mein dono fields compare karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Router priority aur router ID ka match hona zaroori nahi (router IDs to unique hone chahiye). Area, hello, dead, subnet aur mask, authentication aur stub flag match hone chahiye. OSPF IP protocol 89 aur 224.0.0.5/224.0.0.6 use karta hai, TCP ya UDP nahi.</p></div>

<div class="scn"><h4>Naya link jo INIT mein atka raha</h4><p>Change window ke baad ek naye router link par neighbour ek side INIT mein atka tha aur dusri side gayab. Dono ends par captures mein R5 ke Hellos R6 tak pahunchte dikhe, lekin R6 ke Hellos kabhi R5 tak nahi pahunche. R5 ke naye interface par inbound ACL sirf TCP aur ICMP permit karta tha. Kyunki R6 R5 ko sun raha tha, R6 use apne Hellos mein list karta tha; R5 ko kuch sunai nahi deta tha. ACL mein <code>permit ospf any any</code> jodne se adjacency FULL ho gayi.</p><p><b>Seekh:</b> Active Neighbor list batati hai kaun kise sunta hai. One-way view ka matlab hai ek direction drop ho rahi hai.</p></div>

<div class="iv"><p class="q">"Same link par do OSPF routers neighbours nahi ban rahe. Wajah dhoondhne ke liye capture kaise use karoge?"</p><p>Strong answer: main link par capture karta hoon aur OSPF par filter karta hoon. Agar dono routers Hellos bhejte hain lekin koi dusre ko Active Neighbor list nahi karta, to main dono Hellos compare karta hoon: area ID, mask, hello aur dead interval, authentication type, stub flag. Agar sirf ek Hellos bhejta hai, to dusri side OSPF enable nahi hai ya passive hai. Agar ek dusre ko list karta hai lekin ulta nahi, to koi ek taraf Hellos drop kar raha hai. Agar ek dusre ko dekhte hain lekin ExStart mein atakte hain, to main DBD packets mein MTU check karta hoon. Phir show ip ospf interface se confirm karke alag side ko fix karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPF: IP protocol 89, Hellos 224.0.0.5 ko TTL 1 ke saath; Hello se LSAck tak paanch packet types.</li>
<li>Match zaroori: area, hello, dead, mask (broadcast links), authentication, stub flag; router ID alag ho; priority match zaroori nahi.</li>
<li>Dono bhej rahe par koi Active Neighbor list mein nahi = parameter mismatch; one-way listing = ek direction drop.</li>
<li>MTU mismatch DBD packets mein dikhta hai aur neighbours ko ExStart/Exchange mein chhod deta hai.</li>
<li>Lab 3: R1 link par R2 ka Hello 5/Dead 20, aur R2 link par R3 ka area 0.0.0.1.</li>
</ul></div>
`}};export{e as default};