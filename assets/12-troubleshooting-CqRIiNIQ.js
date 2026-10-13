var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: walking lab 2`,hi:`Troubleshooting workflow: lab 2 ko step by step`},body:{en:`
<p>A good doctor does not start with surgery. She asks where it hurts, checks the pulse, orders one test, reads it, and only then treats. Redistribution problems deserve the same discipline, because the symptom (a missing route in Delhi) often appears far from the cause (one line in a prefix list in a boundary router). This chapter gives you a repeatable workflow and then walks the lab 2 tickets exactly as you would in the lab or the exam.</p>

<h3>The workflow: follow the route from birth to destination</h3>
<ol>
<li><b>Define the symptom precisely.</b> Which prefix, seen from which router, and which of three types: <b>missing</b>, <b>wrong path</b>, or <b>looping/flapping</b>. Use <code>show ip route PREFIX</code>, <code>traceroute</code> and <code>ping</code> with a source.</li>
<li><b>Birth: is the route installed from the intended source on the redistributing router?</b> <code>show ip route PREFIX</code> and read "Known via". If AD made another source win, nothing will be exported from the intended one.</li>
<li><b>The redistribute command.</b> <code>show ip protocols</code> and <code>show running-config | section router</code>: right process or AS number, seed metric into EIGRP or RIP, <code>subnets</code> into OSPF, the route-map name spelled exactly.</li>
<li><b>Policy.</b> <code>show route-map NAME</code>, <code>show ip prefix-list detail NAME</code> (hit counts), ACLs. Walk the route through the entries by hand.</li>
<li><b>The target database.</b> <code>show ip eigrp topology PREFIX</code> (External data, originating router, tag) or <code>show ip ospf database external PREFIX</code> (advertising router, tag, metric type).</li>
<li><b>Propagation.</b> Distribute-lists, summarisation, EIGRP stub, OSPF stub or totally stubby areas (which block type-5 LSAs), filtering on ABRs.</li>
<li><b>Path choice.</b> On each hop, compare AD and metric; check both boundary routers.</li>
<li><b>Loops.</b> TTL-expired messages, <code>debug ip routing</code> showing add and delete churn, missing tags.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Troubleshooting flow">
<rect x="10" y="20" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="13">1 symptom</text>
<rect x="170" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="240" y="47" text-anchor="middle" class="svg-ink" font-size="13">2 source RIB</text>
<rect x="330" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="400" y="47" text-anchor="middle" class="svg-ink" font-size="13">3 redistribute</text>
<rect x="490" y="20" width="140" height="44" rx="8" fill="#fde68a"/><text x="560" y="47" text-anchor="middle" class="svg-ink" font-size="13">4 policy</text>
<rect x="490" y="120" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="147" text-anchor="middle" class="svg-ink" font-size="13">5 target DB</text>
<rect x="330" y="120" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="400" y="147" text-anchor="middle" class="svg-ink" font-size="13">6 propagation</text>
<rect x="170" y="120" width="140" height="44" rx="8" fill="#fed7aa"/><text x="240" y="147" text-anchor="middle" class="svg-ink" font-size="13">7 AD and path</text>
<rect x="10" y="120" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="80" y="147" text-anchor="middle" class="svg-ink" font-size="13">8 loops, tags</text>
<line x1="150" y1="42" x2="170" y2="42" stroke="#64748b" stroke-width="2"/><line x1="310" y1="42" x2="330" y2="42" stroke="#64748b" stroke-width="2"/><line x1="470" y1="42" x2="490" y2="42" stroke="#64748b" stroke-width="2"/>
<line x1="560" y1="64" x2="560" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="490" y1="142" x2="470" y2="142" stroke="#64748b" stroke-width="2"/><line x1="330" y1="142" x2="310" y2="142" stroke="#64748b" stroke-width="2"/><line x1="170" y1="142" x2="150" y2="142" stroke="#64748b" stroke-width="2"/>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">follow the prefix from where it is born to where it is missing</text>
</svg><p class="cap">Eight checks in order: most tickets are solved by step 4, but steps 7 and 8 catch the multi-point problems.</p></div>

<h3>Lab 2, ticket 1: BR1 takes the long way to 192.168.50.0/24</h3>
<p><b>Symptom.</b> The lab asks for hop 1 of a traceroute from BR1.</p>
<pre class="out">BR1#traceroute 192.168.50.1
Tracing the route to 192.168.50.1
<span class="hl">  1 10.2.1.1 1 msec 1 msec 1 msec</span>
  2 10.2.2.2 1 msec 2 msec 1 msec
  3 10.1.2.1 2 msec *  2 msec</pre>
<p>Hop 1 is <b>10.2.1.1</b>, O1: BR1 is sending Delhi traffic into Bengaluru. <b>Check the RIB.</b></p>
<pre class="out">BR1#show ip route 192.168.50.0
Routing entry for 192.168.50.0/24
  <span class="hl">Known via "ospf 1", distance 110, metric 20</span>
  <span class="hl">Tag 90, type extern 2, forward metric 2</span>
  Redistributing via eigrp 100
  Routing Descriptor Blocks:
  * 10.2.1.1, from 2.2.2.2, 00:12:40 ago, via GigabitEthernet0/1
      Route metric is 20, traffic share count is 1
      Route tag 90</pre>
<p>The route is O E2, tag 90 (born in EIGRP), advertised by 2.2.2.2 (BR2). The tags already prevent it going back into EIGRP, so this is not feedback. It is AD: 110 beats the D EX 170 still visible in <code>show ip eigrp topology 192.168.50.0/24</code>. <b>Fix on both boundary routers:</b></p>
<pre class="code">router ospf 1
 distance ospf external 171</pre>
<pre class="out">BR1#show ip route 192.168.50.0 | include Known
  <span class="hl">Known via "eigrp 100", distance 170, metric 130816, type external</span>
O1#show ip route 192.168.50.0 | include via
  <span class="hl">* 10.2.2.2, from 2.2.2.2, 00:00:18 ago, via GigabitEthernet0/1</span>
  <span class="hl">  10.2.1.2, from 1.1.1.1, 00:00:18 ago, via GigabitEthernet0/0</span></pre>
<p>BR1 now uses E1 directly, and because BR1's RIB entry is EIGRP again, it redistributes the prefix too: O1 load-shares across both boundary routers. Redundancy restored.</p>

<h3>Lab 2, ticket 2: Delhi cannot reach the Bengaluru users</h3>
<p><b>Symptom.</b> E1 has only one Bengaluru prefix.</p>
<pre class="out">E1#show ip route | include 10.200
<span class="hl">D EX     10.200.1.0/24 [170/51456] via 10.1.2.2, 00:14:02, GigabitEthernet0/1</span>
                       [170/51456] via 10.1.1.2, 00:14:02, GigabitEthernet0/0</pre>
<p><b>Source RIB</b>: BR1 has <code>O 10.200.10.0/24</code> and <code>O 10.200.2.0/24</code>, so birth is fine. <b>Redistribute command</b>: <code>show ip protocols</code> shows "Redistributing: ospf 1" and the running config shows <code>route-map OSPF-TO-EIGRP</code> with the seed metric. <b>Policy</b>:</p>
<pre class="out">BR1#show route-map OSPF-TO-EIGRP
route-map OSPF-TO-EIGRP, deny, sequence 10
  Match clauses:
    tag 90
route-map OSPF-TO-EIGRP, permit, sequence 20
  Match clauses:
    <span class="hl">ip address prefix-lists: OSPF-LANS</span>
  Set clauses:
    tag 110
BR1#show ip prefix-list detail OSPF-LANS
   <span class="hl">seq 5 permit 10.200.1.0/24 (hit count: 14, refcount: 1)</span></pre>
<p>Walk 10.200.10.0/24 through the map: not tag 90, then no prefix-list entry matches, so implicit deny. <b>Fix on both boundary routers</b>, without touching the tagging:</p>
<pre class="code">ip prefix-list OSPF-LANS seq 10 permit 10.200.0.0/16 le 24</pre>
<pre class="out">E1#show ip route 10.200.10.0
Routing entry for 10.200.10.0/24
  <span class="hl">Known via "eigrp 100", distance 170, metric 51456, type external</span>
  Routing Descriptor Blocks:
  * 10.1.2.2, from 10.1.2.2, 00:00:25 ago, via GigabitEthernet0/1
      Route metric is 51456, traffic share count is 1
      <span class="hl">Route tag 110</span>
    10.1.1.2, from 10.1.1.2, 00:00:25 ago, via GigabitEthernet0/0</pre>
<p>Final check: PCE pings 10.200.10.10 and PCO pings 192.168.50.1. A ping sourced from O1 itself may still fail, because O1 sources it from a transit link (10.2.x.x) that the prefix list deliberately does not redistribute. That is expected, not a new fault.</p>

<h3>Debugging, carefully</h3>
<p><code>debug ip routing</code> prints every RIB add and delete, and reveals AD fights and oscillation.</p>
<pre class="out">RT: add 192.168.50.0/24 via 10.1.1.1, eigrp metric [170/130816]
<span class="hl">RT: closer admin distance for 192.168.50.0, flushing 1 routes</span>
RT: add 192.168.50.0/24 via 10.2.1.1, ospf metric [110/20]</pre>
<p>Use it on a lab router or with logging to the buffer and a short capture window, then <code>undebug all</code>.</p>

<div class="eg"><p><b>Worked example: symptom to cause cheat table.</b> Only D EX routes missing on one router: duplicate EIGRP router ID. Nothing redistributed into EIGRP: missing seed metric or missing route map. Only classful networks in OSPF: missing <code>subnets</code> on old code. Some prefixes missing: prefix list or route map implicit deny. Wrong path at a boundary: AD. Dead routes that stay alive and TTL expired: feedback without tags. Type-5 routes missing in one area: stub area.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing configuration before collecting evidence. Removing the tag route maps "to test" in lab 2 would re-open the feedback loop and make both tickets harder to read. Change one thing, on all boundary routers, and re-verify.</p></div>

<div class="exam"><p><b>Exam trap.</b> In troubleshooting questions the first command you choose matters. For "route missing after redistribution" the best first step is usually <code>show ip route PREFIX</code> on the redistributing router (is it installed from the source?), not a debug.</p></div>

<div class="scn"><h4>Missing only in the branches</h4><p>After a migration, a hub correctly redistributed EIGRP into OSPF, and the core routers saw every O E2 route, but branch routers in area 20 did not. Steps 2 to 5 all checked out. Step 6 found <code>area 20 stub</code> on the ABR: stub areas block type-5 LSAs and replace them with a default route. The branches were fine with the default; the real fault was a monitoring server that polled for specific routes. The team documented the design instead of changing it.</p><p><b>Lesson:</b> finish the workflow; sometimes "missing" is the design working as intended.</p></div>

<div class="iv"><p class="q">"A prefix redistributed from OSPF into EIGRP is missing on some EIGRP routers. Walk me through your troubleshooting."</p><p>Strong answer: confirm the symptom with <code>show ip route</code> on an affected and an unaffected router. On the boundary router, check the prefix is installed as OSPF, then check the redistribute command (seed metric, route-map name), the route map and prefix list hit counts, and whether the prefix is in <code>show ip eigrp topology</code> with the expected tag. Then look downstream for distribute-lists, summarisation or stub configuration, and check duplicate router IDs if only externals are missing. Apply fixes consistently on every boundary router and verify end to end.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Classify the symptom: missing, wrong path, or looping.</li>
<li>Follow the prefix: source RIB, redistribute command, policy, target database, propagation, path choice, loops.</li>
<li>Lab 2 ticket 1 is AD (fix with <code>distance ospf external 171</code>); ticket 2 is a too-exact prefix list (fix with <code>le 24</code>).</li>
<li>Prefix-list hit counts, route tags and External data are the fastest evidence.</li>
<li>Use <code>debug ip routing</code> carefully to catch AD fights and flapping.</li>
</ul></div>
`,hi:`
<p>Ek accha doctor surgery se shuru nahi karta. Woh poochti hai kahan dard hai, nabz check karti hai, ek test karwati hai, use padhti hai, aur tab ilaaj karti hai. Redistribution problems ko bhi yahi discipline chahiye, kyunki symptom (Delhi mein missing route) aksar cause (boundary router ki prefix list ki ek line) se bahut door dikhta hai. Yeh chapter aapko ek repeatable workflow deta hai aur phir lab 2 ke tickets ko bilkul waise walk karta hai jaise aap lab ya exam mein karoge.</p>

<h3>Workflow: route ko janam se destination tak follow karo</h3>
<ol>
<li><b>Symptom ko exactly define karo.</b> Kaunsa prefix, kis router se dekha, aur teen types mein se kaunsa: <b>missing</b>, <b>galat path</b>, ya <b>looping/flapping</b>. <code>show ip route PREFIX</code>, <code>traceroute</code> aur source ke saath <code>ping</code> use karo.</li>
<li><b>Janam: kya redistribute karne wale router par route intended source se installed hai?</b> <code>show ip route PREFIX</code> aur "Known via" padho. Agar AD ki wajah se doosra source jeet gaya, to intended wale se kuch export nahi hoga.</li>
<li><b>Redistribute command.</b> <code>show ip protocols</code> aur <code>show running-config | section router</code>: sahi process ya AS number, EIGRP ya RIP mein seed metric, OSPF mein <code>subnets</code>, route-map naam bilkul sahi spelling mein.</li>
<li><b>Policy.</b> <code>show route-map NAME</code>, <code>show ip prefix-list detail NAME</code> (hit counts), ACLs. Route ko haath se entries ke through chalao.</li>
<li><b>Target database.</b> <code>show ip eigrp topology PREFIX</code> (External data, originating router, tag) ya <code>show ip ospf database external PREFIX</code> (advertising router, tag, metric type).</li>
<li><b>Propagation.</b> Distribute-lists, summarisation, EIGRP stub, OSPF stub ya totally stubby areas (jo type-5 LSAs block karte hain), ABRs par filtering.</li>
<li><b>Path choice.</b> Har hop par AD aur metric compare karo; dono boundary routers check karo.</li>
<li><b>Loops.</b> TTL-expired messages, add aur delete churn dikhata <code>debug ip routing</code>, missing tags.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Troubleshooting flow">
<rect x="10" y="20" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="13">1 symptom</text>
<rect x="170" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="240" y="47" text-anchor="middle" class="svg-ink" font-size="13">2 source RIB</text>
<rect x="330" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="400" y="47" text-anchor="middle" class="svg-ink" font-size="13">3 redistribute</text>
<rect x="490" y="20" width="140" height="44" rx="8" fill="#fde68a"/><text x="560" y="47" text-anchor="middle" class="svg-ink" font-size="13">4 policy</text>
<rect x="490" y="120" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="147" text-anchor="middle" class="svg-ink" font-size="13">5 target DB</text>
<rect x="330" y="120" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="400" y="147" text-anchor="middle" class="svg-ink" font-size="13">6 propagation</text>
<rect x="170" y="120" width="140" height="44" rx="8" fill="#fed7aa"/><text x="240" y="147" text-anchor="middle" class="svg-ink" font-size="13">7 AD aur path</text>
<rect x="10" y="120" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="80" y="147" text-anchor="middle" class="svg-ink" font-size="13">8 loops, tags</text>
<line x1="150" y1="42" x2="170" y2="42" stroke="#64748b" stroke-width="2"/><line x1="310" y1="42" x2="330" y2="42" stroke="#64748b" stroke-width="2"/><line x1="470" y1="42" x2="490" y2="42" stroke="#64748b" stroke-width="2"/>
<line x1="560" y1="64" x2="560" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="490" y1="142" x2="470" y2="142" stroke="#64748b" stroke-width="2"/><line x1="330" y1="142" x2="310" y2="142" stroke="#64748b" stroke-width="2"/><line x1="170" y1="142" x2="150" y2="142" stroke="#64748b" stroke-width="2"/>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">prefix ko wahan se follow karo jahan paida hua, wahan tak jahan missing hai</text>
</svg><p class="cap">Order mein aath checks: zyada tar tickets step 4 tak solve ho jaate hain, lekin steps 7 aur 8 multi-point problems pakadte hain.</p></div>

<h3>Lab 2, ticket 1: BR1 192.168.50.0/24 ke liye lamba raasta leta hai</h3>
<p><b>Symptom.</b> Lab BR1 se traceroute ka hop 1 poochti hai.</p>
<pre class="out">BR1#traceroute 192.168.50.1
Tracing the route to 192.168.50.1
<span class="hl">  1 10.2.1.1 1 msec 1 msec 1 msec</span>
  2 10.2.2.2 1 msec 2 msec 1 msec
  3 10.1.2.1 2 msec *  2 msec</pre>
<p>Hop 1 <b>10.2.1.1</b> hai, O1: BR1 Delhi ka traffic Bengaluru mein bhej raha hai. <b>RIB check karo.</b></p>
<pre class="out">BR1#show ip route 192.168.50.0
Routing entry for 192.168.50.0/24
  <span class="hl">Known via "ospf 1", distance 110, metric 20</span>
  <span class="hl">Tag 90, type extern 2, forward metric 2</span>
  Redistributing via eigrp 100
  Routing Descriptor Blocks:
  * 10.2.1.1, from 2.2.2.2, 00:12:40 ago, via GigabitEthernet0/1
      Route metric is 20, traffic share count is 1
      Route tag 90</pre>
<p>Route O E2 hai, tag 90 (EIGRP mein paida), 2.2.2.2 (BR2) ne advertise kiya. Tags ise pehle se EIGRP mein wapas jaane se rokte hain, isliye yeh feedback nahi hai. Yeh AD hai: 110, D EX 170 ko harata hai jo <code>show ip eigrp topology 192.168.50.0/24</code> mein ab bhi dikhta hai. <b>Dono boundary routers par fix:</b></p>
<pre class="code">router ospf 1
 distance ospf external 171</pre>
<pre class="out">BR1#show ip route 192.168.50.0 | include Known
  <span class="hl">Known via "eigrp 100", distance 170, metric 130816, type external</span>
O1#show ip route 192.168.50.0 | include via
  <span class="hl">* 10.2.2.2, from 2.2.2.2, 00:00:18 ago, via GigabitEthernet0/1</span>
  <span class="hl">  10.2.1.2, from 1.1.1.1, 00:00:18 ago, via GigabitEthernet0/0</span></pre>
<p>BR1 ab seedha E1 use karta hai, aur kyunki BR1 ki RIB entry phir se EIGRP hai, woh prefix ko redistribute bhi karta hai: O1 dono boundary routers par load-share karta hai. Redundancy wapas.</p>

<h3>Lab 2, ticket 2: Delhi Bengaluru users tak nahi pahunch paata</h3>
<p><b>Symptom.</b> E1 ke paas sirf ek Bengaluru prefix hai.</p>
<pre class="out">E1#show ip route | include 10.200
<span class="hl">D EX     10.200.1.0/24 [170/51456] via 10.1.2.2, 00:14:02, GigabitEthernet0/1</span>
                       [170/51456] via 10.1.1.2, 00:14:02, GigabitEthernet0/0</pre>
<p><b>Source RIB</b>: BR1 ke paas <code>O 10.200.10.0/24</code> aur <code>O 10.200.2.0/24</code> hain, isliye janam theek hai. <b>Redistribute command</b>: <code>show ip protocols</code> "Redistributing: ospf 1" dikhata hai aur running config seed metric ke saath <code>route-map OSPF-TO-EIGRP</code> dikhata hai. <b>Policy</b>:</p>
<pre class="out">BR1#show route-map OSPF-TO-EIGRP
route-map OSPF-TO-EIGRP, deny, sequence 10
  Match clauses:
    tag 90
route-map OSPF-TO-EIGRP, permit, sequence 20
  Match clauses:
    <span class="hl">ip address prefix-lists: OSPF-LANS</span>
  Set clauses:
    tag 110
BR1#show ip prefix-list detail OSPF-LANS
   <span class="hl">seq 5 permit 10.200.1.0/24 (hit count: 14, refcount: 1)</span></pre>
<p>10.200.10.0/24 ko map ke through chalao: tag 90 nahi, phir koi prefix-list entry match nahi karti, isliye implicit deny. <b>Dono boundary routers par fix</b>, tagging ko chhue bina:</p>
<pre class="code">ip prefix-list OSPF-LANS seq 10 permit 10.200.0.0/16 le 24</pre>
<pre class="out">E1#show ip route 10.200.10.0
Routing entry for 10.200.10.0/24
  <span class="hl">Known via "eigrp 100", distance 170, metric 51456, type external</span>
  Routing Descriptor Blocks:
  * 10.1.2.2, from 10.1.2.2, 00:00:25 ago, via GigabitEthernet0/1
      Route metric is 51456, traffic share count is 1
      <span class="hl">Route tag 110</span>
    10.1.1.2, from 10.1.1.2, 00:00:25 ago, via GigabitEthernet0/0</pre>
<p>Final check: PCE 10.200.10.10 ko ping karta hai aur PCO 192.168.50.1 ko. O1 se khud source kiya ping ab bhi fail ho sakta hai, kyunki O1 use transit link (10.2.x.x) se source karta hai jise prefix list jaan-boojh kar redistribute nahi karti. Yeh expected hai, naya fault nahi.</p>

<h3>Debugging, dhyaan se</h3>
<p><code>debug ip routing</code> har RIB add aur delete print karta hai, aur AD ki ladaiyan aur oscillation dikhata hai.</p>
<pre class="out">RT: add 192.168.50.0/24 via 10.1.1.1, eigrp metric [170/130816]
<span class="hl">RT: closer admin distance for 192.168.50.0, flushing 1 routes</span>
RT: add 192.168.50.0/24 via 10.2.1.1, ospf metric [110/20]</pre>
<p>Ise lab router par use karo ya buffer mein logging aur chhoti capture window ke saath, phir <code>undebug all</code>.</p>

<div class="eg"><p><b>Worked example: symptom se cause cheat table.</b> Ek router par sirf D EX routes missing: duplicate EIGRP router ID. EIGRP mein kuch redistribute nahi hua: missing seed metric ya missing route map. OSPF mein sirf classful networks: purane code par missing <code>subnets</code>. Kuch prefixes missing: prefix list ya route map ka implicit deny. Boundary par galat path: AD. Mare hue routes jo zinda rehte hain aur TTL expired: bina tags ka feedback. Ek area mein type-5 routes missing: stub area.</p></div>

<div class="warn"><p><b>Common galti.</b> Saboot jama karne se pehle configuration badalna. Lab 2 mein "test karne ke liye" tag route maps hatane se feedback loop phir khul jaayega aur dono tickets padhna mushkil ho jaayega. Ek cheez badlo, saare boundary routers par, aur dobara verify karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Troubleshooting questions mein aapka chuna pehla command matter karta hai. "Redistribution ke baad route missing" ke liye best pehla step aam taur par redistribute karne wale router par <code>show ip route PREFIX</code> hai (kya source se installed hai?), debug nahi.</p></div>

<div class="scn"><h4>Sirf branches mein missing</h4><p>Ek migration ke baad hub ne EIGRP ko OSPF mein sahi redistribute kiya, aur core routers ko har O E2 route dikh raha tha, lekin area 20 ke branch routers ko nahi. Steps 2 se 5 sab theek nikle. Step 6 ne ABR par <code>area 20 stub</code> dhoondha: stub areas type-5 LSAs block karke unki jagah default route dete hain. Branches default ke saath theek the; asli fault ek monitoring server tha jo specific routes poll karta tha. Team ne design badalne ki jagah use document kiya.</p><p><b>Seekh:</b> workflow poora karo; kabhi kabhi "missing" ka matlab design sahi kaam kar raha hai.</p></div>

<div class="iv"><p class="q">"OSPF se EIGRP mein redistribute hua ek prefix kuch EIGRP routers par missing hai. Apna troubleshooting samjhao."</p><p>Strong answer: affected aur unaffected router par <code>show ip route</code> se symptom confirm karo. Boundary router par check karo ki prefix OSPF ki tarah installed hai, phir redistribute command (seed metric, route-map naam), route map aur prefix list hit counts, aur kya prefix <code>show ip eigrp topology</code> mein expected tag ke saath hai. Phir downstream distribute-lists, summarisation ya stub configuration dekho, aur agar sirf externals missing hain to duplicate router IDs check karo. Fixes har boundary router par consistently lagao aur end to end verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Symptom classify karo: missing, galat path, ya looping.</li>
<li>Prefix follow karo: source RIB, redistribute command, policy, target database, propagation, path choice, loops.</li>
<li>Lab 2 ka ticket 1 AD hai (<code>distance ospf external 171</code> se fix); ticket 2 zaroorat se zyada exact prefix list hai (<code>le 24</code> se fix).</li>
<li>Prefix-list hit counts, route tags aur External data sabse tez saboot hain.</li>
<li>AD ki ladaiyan aur flapping pakadne ke liye <code>debug ip routing</code> dhyaan se use karo.</li>
</ul></div>
`}};export{e as default};