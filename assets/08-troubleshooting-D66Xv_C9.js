var e={id:`troubleshooting`,h:{en:`OSPF troubleshooting workflow and the three lab tickets`,hi:`OSPF troubleshooting workflow aur teen lab tickets`},body:{en:`
<p>OSPF troubleshooting is detective work with a fixed order. The neighbour state tells you which clue to chase. This chapter gives the workflow and then walks through the three lab tickets, including every command.</p>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="OSPF troubleshooting tree">
<rect x="210" y="8" width="220" height="36" rx="8" fill="#bae6fd"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="12">show ospf interface: is it listed?</text>
<rect x="10" y="70" width="190" height="44" rx="8" fill="#fed7aa"/><text x="105" y="90" text-anchor="middle" class="svg-ink" font-size="11">No: add it under protocols ospf,</text><text x="105" y="105" text-anchor="middle" class="svg-ink" font-size="11">check interface up and IP</text>
<rect x="225" y="70" width="190" height="44" rx="8" fill="#fde68a"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="11">Yes, Nbrs 0: compare area,</text><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="11">hello/dead, subnet, auth</text>
<rect x="440" y="70" width="190" height="44" rx="8" fill="#ddd6fe"/><text x="535" y="90" text-anchor="middle" class="svg-ink" font-size="11">Yes, neighbour present:</text><text x="535" y="105" text-anchor="middle" class="svg-ink" font-size="11">read its state</text>
<rect x="440" y="140" width="190" height="44" rx="8" fill="#bbf7d0"/><text x="535" y="160" text-anchor="middle" class="svg-ink" font-size="11">Full: check show route and</text><text x="535" y="175" text-anchor="middle" class="svg-ink" font-size="11">ping (not an OSPF fault?)</text>
<line x1="270" y1="44" x2="150" y2="70" stroke="#64748b" stroke-width="2"/><line x1="320" y1="44" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><line x1="370" y1="44" x2="500" y2="70" stroke="#64748b" stroke-width="2"/><line x1="535" y1="114" x2="535" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="11">Init: one-way hellos. ExStart: MTU. 2Way on a LAN: often normal.</text>
</svg><p class="cap">Follow the branches from the first command.</p></div>
<ol>
<li>Is the interface <b>up</b> and does it have an IP address? (show interfaces terse)</li>
<li>Is it <b>listed</b> in show ospf interface, in the <b>right area</b>?</li>
<li>Do <b>hello, dead, subnet and authentication</b> match the other end? (show ospf interface detail on both)</li>
<li>What <b>state</b> is the neighbour in?</li>
<li>Check the <b>log</b>: <code>show log messages | match OSPF</code>.</li>
<li>When Full, is the <b>route</b> in inet.0 and does a <b>ping</b> work?</li></ol>

<h3>Ticket 1: Single-area OSPF (Indore)</h3>
<p><b>Goal:</b> R1 and R2 join R3 and R4 in area 0 so PC1 reaches SRV 172.16.44.10.</p>
<ol>
<li>R1: set router ID, enable both uplinks, loopback passive, staff LAN passive.</li>
<li>R2: router ID 10.255.4.2, both uplinks, loopback passive.</li>
<li>Wait about 40 seconds, then <code>show ospf neighbor</code>: R1 has two Full neighbours (R2 and R3), R2 has two (R1 and R4).</li>
<li>On R4 <code>show route protocol ospf</code> lists 10.255.4.1/32, 10.255.4.2/32 and 192.168.40.0/24.</li>
<li>On R1 <code>show route 10.255.4.4</code> shows <b>two</b> next hops, via R2 and via R3: equal-cost multipath, the answer to the lab question.</li>
<li><code>ping 172.16.44.10</code> from PC1.</li></ol>

<h3>Ticket 2: Neighbours stuck (Vizag)</h3>
<p><b>Symptom:</b> in a four-router ring (R1, R2, R3, R4) only one adjacency is up, and PC1 cannot reach SRV 172.16.55.10 behind R3. Three faults, three engineers.</p>
<pre class="out">lab@R2-VIZAG&gt; show ospf interface ge-0/0/0.0 detail
Interface           State   Area            DR ID           BDR ID          Nbrs
ge-0/0/0.0          DR      0.0.0.0         10.255.5.2      0.0.0.0            0
  Type: LAN, Address: 10.5.12.2, Mask: 255.255.255.252, MTU: 1500, Cost: 1
  DR addr: 10.5.12.2, Priority: 128
  Adj count: 0
  <span class="hl">Hello: 5, Dead: 20</span>, ReXmit: 5, Not Stub
  Auth type: None
</pre>
<ol>
<li><b>R1 to R2, hello mismatch.</b> R2 uses Hello 5 and Dead 20 on ge-0/0/0.0, R1 uses the default 10 and 40. Hellos are dropped for mismatched timers, so Nbrs stays 0. Fix on R2: <code>delete protocols ospf area 0.0.0.0 interface ge-0/0/0.0 hello-interval</code> and commit. The company standard is the Junos defaults. After about 40 seconds R1 and R2 are Full.</li>
<li><b>R3 to R4, area mismatch.</b> <code>show ospf interface</code> on R3 lists ge-0/0/1.0 in area 0.0.0.1 while R4 has it in 0.0.0.0. The area ID in the hello must match. Fix on R3: <code>delete protocols ospf area 0.0.0.1</code> and <code>set protocols ospf area 0.0.0.0 interface ge-0/0/1.0</code>.</li>
<li><b>R4 to R1, interface missing.</b> On R4 show ospf interface does not list ge-0/0/1.0 at all. The interface was never added. Fix: <code>set protocols ospf area 0.0.0.0 interface ge-0/0/1.0</code>.</li>
<li><b>Final check.</b> Every router shows two Full neighbours; show route protocol ospf on R1 lists the loopbacks of R2, R3 and R4; ping from PC1 to 172.16.55.10 works.</li></ol>
<div class="note"><p><b>Hint.</b> The R2 to R3 link (10.5.23.0/30) was already fine, which is why one adjacency existed from the start.</p></div>

<h3>Ticket 3: Steer traffic with cost (Mysuru)</h3>
<ol>
<li>R1 <code>show route 172.16.66.0/24</code>: two next hops.</li>
<li>Reference bandwidth 100g on all four routers; check Cost: 100 on ge-0/0/0.0.</li>
<li>R1 ge-0/0/1.0 metric 500; R1 now has one next hop (10.6.12.2).</li>
<li>R4 ge-0/0/1.0 metric 500; R4 reaches 192.168.60.0/24 only via 10.6.24.1 (R2).</li>
<li>traceroute from R1 to 172.16.66.10 starts with 10.6.12.2; PC1 still pings the server.</li></ol>

<div class="warn"><p><b>Common mistakes.</b> Fixing the first mismatch and stopping: Vizag had three. Changing a timer on both ends but with different values. Changing the metric on only one router.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam shows two show ospf interface outputs and asks why no adjacency forms. Compare Area, Hello, Dead and Mask first. Also remember that Auth type, MTU, area type flags and a duplicate router ID can stop an adjacency, and that passive on a router-to-router link prevents any neighbour.</p></div>

<div class="scn"><h4>One engineer, one typo, one dead ring</h4><p>A weekend change turned a healthy four-router ring into a mess. R3's link to R4 had been typed into area 0.0.0.1 by mistake. The log on R4 repeated "OSPF packet ignored: area mismatch from 10.5.34.1". The engineer compared show ospf interface on both ends, saw the area column differ, moved the interface to area 0.0.0.0 and the adjacency went Full a few seconds later. Because the ring had a second path, users noticed only slower traffic, which is why the fault stayed hidden until Monday.</p><p><b>Lesson:</b> compare both ends, and read the log; it often names the mismatch.</p></div>

<div class="iv"><p class="q">"Two OSPF routers will not become neighbours. What do you check?"</p><p>Interface up and addressed; listed in show ospf interface and not passive; same area; same subnet and mask; same hello and dead; same authentication; same area type; unique router IDs; matching MTU if stuck in ExStart; and whether a filter blocks protocol 89 or multicast 224.0.0.5. Compare show ospf interface detail on both ends, and read show log messages.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Follow the order: interface up, listed in OSPF, matches, state, log, route, ping.</li>
<li>Vizag faults: hello-interval mismatch, area mismatch, interface missing.</li>
<li>Init means one-way hellos; ExStart often MTU; Nbrs 0 means a hello mismatch.</li>
<li>Indore: ECMP gives two next hops to R4's loopback.</li>
<li>Mysuru: reference bandwidth everywhere, metric 500 on both ends of the rented path.</li>
</ul></div>
`,hi:`
<p>OSPF troubleshooting ek fixed order wali detective work hai. Neighbour state batati hai kaunsa clue follow karna hai. Yeh chapter workflow deta hai aur phir teeno lab tickets ko har command ke saath chalata hai.</p>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="OSPF troubleshooting tree">
<rect x="210" y="8" width="220" height="36" rx="8" fill="#bae6fd"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="12">show ospf interface: listed hai?</text>
<rect x="10" y="70" width="190" height="44" rx="8" fill="#fed7aa"/><text x="105" y="90" text-anchor="middle" class="svg-ink" font-size="11">Nahi: protocols ospf mein lagao,</text><text x="105" y="105" text-anchor="middle" class="svg-ink" font-size="11">interface up aur IP check karo</text>
<rect x="225" y="70" width="190" height="44" rx="8" fill="#fde68a"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="11">Haan, Nbrs 0: area, hello/dead,</text><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="11">subnet, auth compare karo</text>
<rect x="440" y="70" width="190" height="44" rx="8" fill="#ddd6fe"/><text x="535" y="90" text-anchor="middle" class="svg-ink" font-size="11">Haan, neighbour hai:</text><text x="535" y="105" text-anchor="middle" class="svg-ink" font-size="11">uski state padho</text>
<rect x="440" y="140" width="190" height="44" rx="8" fill="#bbf7d0"/><text x="535" y="160" text-anchor="middle" class="svg-ink" font-size="11">Full: show route aur ping</text><text x="535" y="175" text-anchor="middle" class="svg-ink" font-size="11">(OSPF fault nahi?)</text>
<line x1="270" y1="44" x2="150" y2="70" stroke="#64748b" stroke-width="2"/><line x1="320" y1="44" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><line x1="370" y1="44" x2="500" y2="70" stroke="#64748b" stroke-width="2"/><line x1="535" y1="114" x2="535" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="11">Init: one-way hellos. ExStart: MTU. LAN par 2Way: aksar normal.</text>
</svg><p class="cap">Pehle command se branches follow karo.</p></div>
<ol>
<li>Interface <b>up</b> hai aur IP address hai? (show interfaces terse)</li>
<li>show ospf interface mein <b>listed</b> hai, <b>sahi area</b> mein?</li>
<li><b>Hello, dead, subnet aur authentication</b> doosre end se match karte hain? (dono par show ospf interface detail)</li>
<li>Neighbour kis <b>state</b> mein hai?</li>
<li><b>Log</b> check karo: <code>show log messages | match OSPF</code>.</li>
<li>Full ho to <b>route</b> inet.0 mein hai aur <b>ping</b> chalta hai?</li></ol>

<h3>Ticket 1: Single-area OSPF (Indore)</h3>
<p><b>Goal:</b> R1 aur R2 area 0 mein R3 aur R4 ke saath judte hain taaki PC1 SRV 172.16.44.10 tak pahunche.</p>
<ol>
<li>R1: router ID set karo, dono uplinks enable karo, loopback passive, staff LAN passive.</li>
<li>R2: router ID 10.255.4.2, dono uplinks, loopback passive.</li>
<li>Lagbhag 40 second rukkar <code>show ospf neighbor</code>: R1 ke do Full neighbours (R2 aur R3), R2 ke do (R1 aur R4).</li>
<li>R4 par <code>show route protocol ospf</code> 10.255.4.1/32, 10.255.4.2/32 aur 192.168.40.0/24 list karta hai.</li>
<li>R1 par <code>show route 10.255.4.4</code> <b>do</b> next hops dikhata hai, R2 ke through aur R3 ke through: equal-cost multipath, lab ke sawaal ka jawab.</li>
<li>PC1 se <code>ping 172.16.44.10</code>.</li></ol>

<h3>Ticket 2: Neighbours atke hue (Vizag)</h3>
<p><b>Symptom:</b> chaar-router ring (R1, R2, R3, R4) mein sirf ek adjacency up hai, aur PC1 R3 ke peeche SRV 172.16.55.10 tak nahi pahunch pa raha. Teen faults, teen engineers.</p>
<pre class="out">lab@R2-VIZAG&gt; show ospf interface ge-0/0/0.0 detail
Interface           State   Area            DR ID           BDR ID          Nbrs
ge-0/0/0.0          DR      0.0.0.0         10.255.5.2      0.0.0.0            0
  Type: LAN, Address: 10.5.12.2, Mask: 255.255.255.252, MTU: 1500, Cost: 1
  DR addr: 10.5.12.2, Priority: 128
  Adj count: 0
  <span class="hl">Hello: 5, Dead: 20</span>, ReXmit: 5, Not Stub
  Auth type: None
</pre>
<ol>
<li><b>R1 se R2, hello mismatch.</b> R2 ge-0/0/0.0 par Hello 5 aur Dead 20 use karta hai, R1 default 10 aur 40. Mismatched timers wale hellos drop hote hain, isliye Nbrs 0 rehta hai. R2 par fix: <code>delete protocols ospf area 0.0.0.0 interface ge-0/0/0.0 hello-interval</code> aur commit. Company standard Junos defaults hain. Lagbhag 40 second baad R1 aur R2 Full hain.</li>
<li><b>R3 se R4, area mismatch.</b> R3 par <code>show ospf interface</code> ge-0/0/1.0 ko area 0.0.0.1 mein list karta hai jabki R4 ke paas 0.0.0.0 hai. Hello mein area ID match honi chahiye. R3 par fix: <code>delete protocols ospf area 0.0.0.1</code> aur <code>set protocols ospf area 0.0.0.0 interface ge-0/0/1.0</code>.</li>
<li><b>R4 se R1, interface missing.</b> R4 par show ospf interface ge-0/0/1.0 ko list hi nahi karta. Interface kabhi add nahi hua tha. Fix: <code>set protocols ospf area 0.0.0.0 interface ge-0/0/1.0</code>.</li>
<li><b>Final check.</b> Har router do Full neighbours dikhata hai; R1 par show route protocol ospf R2, R3 aur R4 ke loopbacks list karta hai; PC1 se 172.16.55.10 ping chalti hai.</li></ol>
<div class="note"><p><b>Hint.</b> R2 se R3 link (10.5.23.0/30) pehle se theek tha, isliye shuru se ek adjacency maujood thi.</p></div>

<h3>Ticket 3: Cost se traffic modna (Mysuru)</h3>
<ol>
<li>R1 <code>show route 172.16.66.0/24</code>: do next hops.</li>
<li>Chaaron routers par reference bandwidth 100g; ge-0/0/0.0 par Cost: 100 check karo.</li>
<li>R1 ge-0/0/1.0 metric 500; R1 ke paas ab ek next hop (10.6.12.2).</li>
<li>R4 ge-0/0/1.0 metric 500; R4 192.168.60.0/24 tak sirf 10.6.24.1 (R2) se pahunchta hai.</li>
<li>R1 se 172.16.66.10 tak traceroute 10.6.12.2 se shuru hota hai; PC1 phir bhi server ko ping karta hai.</li></ol>

<div class="warn"><p><b>Common mistakes.</b> Pehla mismatch theek karke ruk jaana: Vizag mein teen the. Timer dono ends par badalna lekin alag values ke saath. Metric sirf ek router par badalna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam do show ospf interface outputs dikhata hai aur poochta hai adjacency kyun nahi banti. Pehle Area, Hello, Dead aur Mask compare karo. Yeh bhi yaad rakho ki Auth type, MTU, area type flags aur duplicate router ID adjacency rok sakte hain, aur router-to-router link par passive koi bhi neighbour rok deta hai.</p></div>

<div class="scn"><h4>Ek engineer, ek typo, ek mari hui ring</h4><p>Weekend ke change ne healthy chaar-router ring ko gadbad kar diya. R3 ka R4 wala link galti se area 0.0.0.1 mein type ho gaya tha. R4 ke log mein baar baar "OSPF packet ignored: area mismatch from 10.5.34.1" aata raha. Engineer ne dono ends par show ospf interface compare kiya, area column alag dekha, interface ko area 0.0.0.0 mein kiya aur adjacency kuch seconds baad Full ho gayi. Ring mein doosra path tha, isliye users ne sirf slow traffic dekha, aur isiliye fault Monday tak chhupa raha.</p><p><b>Lesson:</b> dono ends compare karo, aur log padho; woh aksar mismatch ka naam batata hai.</p></div>

<div class="iv"><p class="q">"Do OSPF routers neighbour nahi ban rahe. Kya check karoge?"</p><p>Interface up aur addressed; show ospf interface mein listed aur passive nahi; same area; same subnet aur mask; same hello aur dead; same authentication; same area type; unique router IDs; ExStart mein atke to MTU match; aur kya koi filter protocol 89 ya multicast 224.0.0.5 block kar raha hai. Dono ends par show ospf interface detail compare karo, aur show log messages padho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order follow karo: interface up, OSPF mein listed, matches, state, log, route, ping.</li>
<li>Vizag faults: hello-interval mismatch, area mismatch, interface missing.</li>
<li>Init matlab one-way hellos; ExStart aksar MTU; Nbrs 0 matlab hello mismatch.</li>
<li>Indore: ECMP R4 ke loopback tak do next hops deta hai.</li>
<li>Mysuru: har jagah reference bandwidth, kiraye wale path ke dono ends par metric 500.</li>
</ul></div>
`}};export{e as default};