var e={id:`troubleshooting`,h:{en:`Troubleshooting IS-IS: a workflow for silent adjacencies`,hi:`IS-IS troubleshooting: chup adjacencies ke liye workflow`},body:{en:`
<p>When an IS-IS adjacency does not come up, there is no error message on the screen. The two routers simply do not talk. That silence is why a fixed order of checks matters. A doctor does not guess: temperature, pulse, then specific tests. Here is the order for IS-IS, moving from the cheapest check to the most specific one.</p>

<h3>The workflow</h3>
<ol>
<li><b>Layer 1 and 2.</b> Interface up/up, right cable, same VLAN or point-to-point circuit? <code>show ip interface brief</code>. Without this, nothing else matters.</li>
<li><b>Is IS-IS running on the interface?</b> <code>show clns interface &lt;int&gt;</code> prints the circuit type, metrics, priority and the number of active adjacencies. If the interface is not listed, <code>ip router isis</code> is missing.</li>
<li><b>Router and circuit types.</b> <code>show running-config | section router isis</code> for <code>is-type</code> and the NET, and the interface for <code>isis circuit-type</code>. Level-1 needs the same area, level 1 cannot meet level-2-only.</li>
<li><b>Network type.</b> Both ends point-to-point or both broadcast. Compare <code>show clns interface</code> on both ends: a DIS line ("DR ID") appears only on broadcast circuits.</li>
<li><b>MTU, authentication, duplicate system ID.</b> Hello padding to the full MTU, a key mismatch, or two routers with the same system ID.</li>
<li><b>Adjacency up but routes missing?</b> Go to the database (<code>show isis database detail</code>): is the LSP there? If yes and the route is not installed, suspect a metric-style mismatch (see spcor-isis-design), the ATT/leaking rules, or a route-map filter.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IS-IS troubleshooting flow">
<rect x="10" y="20" width="120" height="44" rx="8" fill="#bae6fd"/><text x="70" y="47" text-anchor="middle" class="svg-ink" font-size="12">1 Link up?</text>
<rect x="150" y="20" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="210" y="47" text-anchor="middle" class="svg-ink" font-size="12">2 ip router isis?</text>
<rect x="290" y="20" width="120" height="44" rx="8" fill="#fde68a"/><text x="350" y="47" text-anchor="middle" class="svg-ink" font-size="12">3 Level / area</text>
<rect x="430" y="20" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="490" y="47" text-anchor="middle" class="svg-ink" font-size="12">4 Network type</text>
<rect x="150" y="100" width="150" height="44" rx="8" fill="#fed7aa"/><text x="225" y="127" text-anchor="middle" class="svg-ink" font-size="12">5 MTU / auth / ID</text>
<rect x="330" y="100" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="415" y="127" text-anchor="middle" class="svg-ink" font-size="12">6 LSP there? route?</text>
<g stroke="#64748b" stroke-width="2"><line x1="130" y1="42" x2="150" y2="42"/><line x1="270" y1="42" x2="290" y2="42"/><line x1="410" y1="42" x2="430" y2="42"/><line x1="490" y1="64" x2="490" y2="82"/><line x1="490" y1="82" x2="225" y2="82"/><line x1="225" y1="82" x2="225" y2="100"/><line x1="300" y1="122" x2="330" y2="122"/></g>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Silent adjacency: work left to right. Adjacency up but no route: jump to step 6.</text>
</svg><p class="cap">Check the cheap things first, then the specific ones.</p></div>

<h3>Walk-through: three silent adjacencies (lab spcor-isis-adjacency-ts)</h3>
<p>The scenario: a change window went wrong at Metro Fibre. R1 (level-1) and R2 are in area 49.0001; R3 and R4 (level-1) in area 49.0002. Nobody can reach anybody. Start at R1.</p>
<p><b>Fault 1: R1 and R2.</b></p>
<pre class="out">R1# show isis neighbors
Tag null:
System Id       Type Interface     IP Address      State Holdtime Circuit Id

R1# show running-config | section router isis
router isis
 net <span class="hl">49.0003</span>.0000.0000.0001.00
 is-type level-1
 log-adjacency-changes</pre>
<p>No neighbour. R1 is level-1 only and R2 is in 49.0001, but R1's NET says 49.0003. Fix without changing the system ID: <code>no net 49.0003.0000.0000.0001.00</code> then <code>net 49.0001.0000.0000.0001.00</code>.</p>
<p><b>Fault 2: R2 and R3.</b> Compare the two ends of the link:</p>
<pre class="out">R2# show clns interface g0/1
    Level-2 Metric: 10, Priority: 64, Circuit ID: R2.00
    Number of active level-2 adjacencies: 0

R3# show clns interface g0/1
    Level-1 Metric: 10, Priority: 64, Circuit ID: R3.02
    <span class="hl">DR ID: R3.02</span>
    Level-2 Metric: 10, Priority: 64, Circuit ID: R3.02
    <span class="hl">DR ID: R3.02</span>
    Number of active level-2 adjacencies: 0</pre>
<p>R3 shows a "DR ID" (a DIS), so R3 runs a broadcast circuit; R2 has no DR line because it is point-to-point (the lab configured it so). One end is p2p, the other LAN. Fix on R3: <code>isis network point-to-point</code> under Gi0/1.</p>
<p><b>Fault 3: R3 and R4.</b></p>
<pre class="out">R3# show clns interface g0/0
    <span class="hl">Circuit Type: level-2</span>
    Level-2 Metric: 10, Priority: 64, Circuit ID: R3.01
    Number of active level-2 adjacencies: 0</pre>
<p>R4 is level-1 only; R3 runs only level 2 on this interface because of <code>isis circuit-type level-2-only</code>. Fix on R3: <code>no isis circuit-type</code>. Then set the DIS priority: <code>isis priority 100 level-1</code> on the same interface. After all three fixes:</p>
<pre class="out">R1# show isis neighbors
R2              L1   Gi0/0         10.1.12.2       UP    22       R2.01

R3# show isis neighbors
R4              L1   Gi0/0         10.1.34.4       UP    22       <span class="hl">R3.01</span>
R2              L2   Gi0/1         10.1.23.2       UP    22       00</pre>
<p>R3 is now the level-1 DIS on its LAN with R4 (circuit R3.01) and R2-R3 is a level-2 point-to-point adjacency (circuit 00). The lab checks that R1 and R4 can reach each other's loopbacks.</p>

<h3>Symptom-to-cause table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>No neighbour at all</td><td>No ip router isis, area mismatch on L1, circuit-type, network type</td><td>show clns interface, running-config</td></tr>
<tr><td>Neighbour flapping</td><td>MTU, duplex or physical errors, aggressive timers, auth keys</td><td>logs, interface counters</td></tr>
<tr><td>Adjacency up, no routes</td><td>Metric-style mismatch, ATT bit absent, route-map filter</td><td>show isis database detail</td></tr>
<tr><td>Loopback unreachable</td><td>No ip router isis on Loopback0, passive misuse</td><td>show ip route isis</td></tr>
<tr><td>Traffic avoids a router</td><td>Overload bit set</td><td>OL column in show isis database</td></tr></table>
<p><code>debug isis adj-packets</code> is the next tool (reference command; not simulated): use it briefly and carefully on a live router because it prints every hello.</p>

<div class="eg"><p><b>Worked example.</b> A new router R6 shows no neighbour on a core link. Your steps: link up (yes); <code>show clns interface</code> lists the interface (yes, so IS-IS is on); is-type level-1-2, NET area same as the neighbour's (yes); the neighbour prints "DR ID" lines and R6 does not, so one end is p2p. You configure <code>isis network point-to-point</code> on the neighbour, the adjacency comes up in seconds. Four commands, four layers, no guessing.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Rebooting the router. It never fixes a configuration mismatch. (2) Fixing only one end and declaring victory: always re-check both neighbours. (3) Changing the system ID to "fix" an adjacency: this renumbers the router in the whole domain and breaks other things.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam shows two partial configurations and asks why no adjacency forms. Look for: different areas with level-1, p2p on one end only, circuit-type mismatch, different authentication. Do the checks in the order above.</p></div>

<div class="scn"><h4>Change window, three faults, one hour</h4><p>The team that led the change window above found all three faults in under an hour using this order: first area mismatch (visible in the running config), then the p2p mismatch (visible by comparing DR lines), then the circuit type. The first engineer who tried had changed three things at once and then could not tell which one mattered.</p><p><b>Lesson:</b> one fix at a time, re-verify after each, and write the cause in the ticket.</p></div>

<div class="iv"><p class="q">"An IS-IS adjacency does not come up. What do you check?"</p><p>Interface state and IP, then whether IS-IS is enabled on the circuit, then router type and area against the neighbour's, then circuit type and network type on both ends, then MTU, authentication and system ID duplication. If the adjacency is up but routes are missing, I read the database and look at metric style and leaking.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A silent adjacency has no error message; use a fixed order of checks.</li>
<li>show clns interface shows circuit type, priority, DR ID and active adjacencies.</li>
<li>Typical causes: area mismatch on L1, p2p on one end, circuit-type, MTU, authentication.</li>
<li>Adjacency up with routes missing: read the database and think of metric style, ATT and filters.</li>
<li>Change one thing at a time and verify both ends.</li>
</ul></div>
`,hi:`
<p>Jab IS-IS adjacency up nahi hoti, screen par koi error message nahi aata. Dono routers bas baat nahi karte. Isi khamoshi ki wajah se checks ka fixed order zaroori hai. Doctor andaza nahi lagata: temperature, pulse, phir specific tests. IS-IS ke liye order yeh hai, sabse sasti check se sabse specific tak.</p>

<h3>Workflow</h3>
<ol>
<li><b>Layer 1 aur 2.</b> Interface up/up, sahi cable, same VLAN ya point-to-point circuit? <code>show ip interface brief</code>. Iske bina baaki kuch matter nahi karta.</li>
<li><b>Kya interface par IS-IS chal raha hai?</b> <code>show clns interface &lt;int&gt;</code> circuit type, metrics, priority aur active adjacencies ki ginti print karta hai. Interface list mein na ho to <code>ip router isis</code> missing hai.</li>
<li><b>Router aur circuit types.</b> <code>is-type</code> aur NET ke liye <code>show running-config | section router isis</code>, aur interface par <code>isis circuit-type</code>. Level-1 ko same area chahiye, level 1 level-2-only se nahi mil sakta.</li>
<li><b>Network type.</b> Dono ends point-to-point ya dono broadcast. Dono ends par <code>show clns interface</code> compare karo: DIS line ("DR ID") sirf broadcast circuits par aati hai.</li>
<li><b>MTU, authentication, duplicate system ID.</b> Poore MTU tak hello padding, key mismatch, ya do routers ki same system ID.</li>
<li><b>Adjacency up par routes missing?</b> Database (<code>show isis database detail</code>) par jao: kya LSP wahan hai? Haan aur route install nahi hua to metric-style mismatch (spcor-isis-design dekho), ATT/leaking rules, ya route-map filter par shak karo.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IS-IS troubleshooting flow">
<rect x="10" y="20" width="120" height="44" rx="8" fill="#bae6fd"/><text x="70" y="47" text-anchor="middle" class="svg-ink" font-size="12">1 Link up?</text>
<rect x="150" y="20" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="210" y="47" text-anchor="middle" class="svg-ink" font-size="12">2 ip router isis?</text>
<rect x="290" y="20" width="120" height="44" rx="8" fill="#fde68a"/><text x="350" y="47" text-anchor="middle" class="svg-ink" font-size="12">3 Level / area</text>
<rect x="430" y="20" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="490" y="47" text-anchor="middle" class="svg-ink" font-size="12">4 Network type</text>
<rect x="150" y="100" width="150" height="44" rx="8" fill="#fed7aa"/><text x="225" y="127" text-anchor="middle" class="svg-ink" font-size="12">5 MTU / auth / ID</text>
<rect x="330" y="100" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="415" y="127" text-anchor="middle" class="svg-ink" font-size="12">6 LSP hai? route?</text>
<g stroke="#64748b" stroke-width="2"><line x1="130" y1="42" x2="150" y2="42"/><line x1="270" y1="42" x2="290" y2="42"/><line x1="410" y1="42" x2="430" y2="42"/><line x1="490" y1="64" x2="490" y2="82"/><line x1="490" y1="82" x2="225" y2="82"/><line x1="225" y1="82" x2="225" y2="100"/><line x1="300" y1="122" x2="330" y2="122"/></g>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Chup adjacency: left se right chalo. Adjacency up par route nahi: step 6 par jao.</text>
</svg><p class="cap">Pehle sasti cheezein check karo, phir specific.</p></div>

<h3>Walk-through: teen chup adjacencies (lab spcor-isis-adjacency-ts)</h3>
<p>Scenario: Metro Fibre ki change window galat ho gayi. R1 (level-1) aur R2 area 49.0001 mein hain; R3 aur R4 (level-1) area 49.0002 mein. Koi kisi tak nahi pahunchta. R1 se shuru karo.</p>
<p><b>Fault 1: R1 aur R2.</b></p>
<pre class="out">R1# show isis neighbors
Tag null:
System Id       Type Interface     IP Address      State Holdtime Circuit Id

R1# show running-config | section router isis
router isis
 net <span class="hl">49.0003</span>.0000.0000.0001.00
 is-type level-1
 log-adjacency-changes</pre>
<p>Koi neighbour nahi. R1 sirf level-1 hai aur R2 49.0001 mein hai, par R1 ka NET 49.0003 kehta hai. System ID badle bina fix: <code>no net 49.0003.0000.0000.0001.00</code> phir <code>net 49.0001.0000.0000.0001.00</code>.</p>
<p><b>Fault 2: R2 aur R3.</b> Link ke dono ends compare karo:</p>
<pre class="out">R2# show clns interface g0/1
    Level-2 Metric: 10, Priority: 64, Circuit ID: R2.00
    Number of active level-2 adjacencies: 0

R3# show clns interface g0/1
    Level-1 Metric: 10, Priority: 64, Circuit ID: R3.02
    <span class="hl">DR ID: R3.02</span>
    Level-2 Metric: 10, Priority: 64, Circuit ID: R3.02
    <span class="hl">DR ID: R3.02</span>
    Number of active level-2 adjacencies: 0</pre>
<p>R3 "DR ID" (DIS) dikhata hai, yaani R3 broadcast circuit chalata hai; R2 par DR line nahi hai kyunki woh point-to-point hai (lab ne aise configure kiya). Ek end p2p, doosra LAN. R3 par fix: Gi0/1 ke neeche <code>isis network point-to-point</code>.</p>
<p><b>Fault 3: R3 aur R4.</b></p>
<pre class="out">R3# show clns interface g0/0
    <span class="hl">Circuit Type: level-2</span>
    Level-2 Metric: 10, Priority: 64, Circuit ID: R3.01
    Number of active level-2 adjacencies: 0</pre>
<p>R4 sirf level-1 hai; R3 is interface par <code>isis circuit-type level-2-only</code> ki wajah se sirf level 2 chalata hai. R3 par fix: <code>no isis circuit-type</code>. Phir DIS priority set karo: usi interface par <code>isis priority 100 level-1</code>. Teeno fixes ke baad:</p>
<pre class="out">R1# show isis neighbors
R2              L1   Gi0/0         10.1.12.2       UP    22       R2.01

R3# show isis neighbors
R4              L1   Gi0/0         10.1.34.4       UP    22       <span class="hl">R3.01</span>
R2              L2   Gi0/1         10.1.23.2       UP    22       00</pre>
<p>R3 ab R4 ke saath apne LAN par level-1 DIS hai (circuit R3.01) aur R2-R3 level-2 point-to-point adjacency hai (circuit 00). Lab check karta hai ki R1 aur R4 ek doosre ke loopbacks tak pahunch sakte hain.</p>

<h3>Symptom se cause ki table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Sambhavit cause</th><th>Check</th></tr>
<tr><td>Koi neighbour nahi</td><td>ip router isis nahi, L1 par area mismatch, circuit-type, network type</td><td>show clns interface, running-config</td></tr>
<tr><td>Neighbour flap kar raha hai</td><td>MTU, duplex ya physical errors, aggressive timers, auth keys</td><td>logs, interface counters</td></tr>
<tr><td>Adjacency up, routes nahi</td><td>Metric-style mismatch, ATT bit absent, route-map filter</td><td>show isis database detail</td></tr>
<tr><td>Loopback unreachable</td><td>Loopback0 par ip router isis nahi, passive ka galat use</td><td>show ip route isis</td></tr>
<tr><td>Traffic router se bachta hai</td><td>Overload bit set hai</td><td>show isis database mein OL column</td></tr></table>
<p><code>debug isis adj-packets</code> agla tool hai (reference command; simulate nahi hota): live router par ise thodi der aur dhyan se use karo kyunki woh har hello print karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Naya router R6 core link par koi neighbour nahi dikhata. Aapke steps: link up (haan); <code>show clns interface</code> interface list karta hai (haan, matlab IS-IS on hai); is-type level-1-2, NET ka area neighbour ke area jaisa (haan); neighbour "DR ID" lines print karta hai aur R6 nahi, to ek end p2p hai. Aap neighbour par <code>isis network point-to-point</code> lagate ho, adjacency kuch seconds mein up. Chaar commands, chaar layers, andaza nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Router reboot karna. Configuration mismatch ko woh kabhi theek nahi karta. (2) Sirf ek end fix karke jeet ghoshit kar dena: dono neighbours dobara check karo. (3) Adjacency "fix" karne ke liye system ID badalna: yeh router ko poore domain mein renumber kar deta hai aur doosri cheezein todta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam do partial configurations dikhata hai aur poochta hai adjacency kyun nahi banti. Dhoondho: level-1 ke saath alag areas, sirf ek end par p2p, circuit-type mismatch, alag authentication. Upar ke order mein checks karo.</p></div>

<div class="scn"><h4>Change window, teen faults, ek ghanta</h4><p>Upar wali change window ko lead karne wali team ne teeno faults ek ghante se kam mein is order se dhoondh liye: pehle area mismatch (running config mein dikha), phir p2p mismatch (DR lines compare karke), phir circuit type. Jis pehle engineer ne koshish ki thi usne ek saath teen cheezein badal di thi aur phir pata nahi chala ki kaunsi matter ki.</p><p><b>Lesson:</b> ek baar mein ek fix, har ke baad re-verify, aur ticket mein cause likho.</p></div>

<div class="iv"><p class="q">"IS-IS adjacency up nahi ho rahi. Kya check karte ho?"</p><p>Interface state aur IP, phir kya circuit par IS-IS enable hai, phir router type aur area neighbour ke saath, phir dono ends par circuit type aur network type, phir MTU, authentication aur system ID duplication. Adjacency up ho par routes missing hon to main database padhta hoon aur metric style aur leaking dekhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chup adjacency mein error message nahi hota; checks ka fixed order use karo.</li>
<li>show clns interface circuit type, priority, DR ID aur active adjacencies dikhata hai.</li>
<li>Aam causes: L1 par area mismatch, ek end par p2p, circuit-type, MTU, authentication.</li>
<li>Adjacency up par routes missing: database padho aur metric style, ATT aur filters sochho.</li>
<li>Ek baar mein ek cheez badlo aur dono ends verify karo.</li>
</ul></div>
`}};export{e as default};