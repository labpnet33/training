var e={id:`troubleshoot`,h:{en:`Verification and the troubleshooting workflow (ticket NK-4521)`,hi:`Verification aur troubleshooting workflow (ticket NK-4521)`},body:{en:`
<p>When a socket in a house goes dead, a good electrician does not rip open every wall. She checks the socket, then the breaker for that circuit, then the main board, and each answer tells her where to look next. OSPF faults yield to the same discipline. One question splits almost every OSPF ticket in half: <b>is the neighbour FULL?</b> If not, the problem is between two routers. If yes, the problem is in what is being advertised or chosen.</p>

<h3>The five commands that answer almost everything</h3>
<table class="cmp"><tr><th>Command</th><th>What it proves</th></tr>
<tr><td><code>show ip ospf neighbor</code></td><td>Who the neighbours are, their state (FULL, 2WAY, EXSTART) and role</td></tr>
<tr><td><code>show ip ospf interface brief</code></td><td>Which interfaces run OSPF, their area, cost, role and F/C neighbour count</td></tr>
<tr><td><code>show ip ospf interface Gi0/0</code></td><td>Timers, network type, priority, DR/BDR, passive ("No Hellos"), authentication</td></tr>
<tr><td><code>show ip protocols</code></td><td>Router ID, network statements, passive interfaces, sources of routes, reference bandwidth</td></tr>
<tr><td><code>show ip route ospf</code> and <code>show ip ospf database</code></td><td>The SPF result, and the raw map it was computed from</td></tr>
</table>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="OSPF troubleshooting flow">
<rect x="190" y="8" width="260" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">1. Route missing or wrong? show ip route</text>
<line x1="320" y1="46" x2="320" y2="66" stroke="#64748b" stroke-width="2"/>
<rect x="190" y="66" width="260" height="38" rx="8" fill="#bae6fd"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">2. Neighbour FULL? show ip ospf neighbor</text>
<line x1="260" y1="104" x2="150" y2="134" stroke="#64748b" stroke-width="2"/><line x1="380" y1="104" x2="490" y2="134" stroke="#64748b" stroke-width="2"/>
<text x="190" y="126" text-anchor="end" class="svg-muted" font-size="12">no</text><text x="450" y="126" class="svg-muted" font-size="12">yes</text>
<rect x="15" y="134" width="290" height="138" rx="8" fill="#fed7aa"/>
<text x="160" y="156" text-anchor="middle" class="svg-ink" font-size="13">Adjacency problem</text>
<text x="160" y="178" text-anchor="middle" class="svg-muted" font-size="12">ping neighbour, interfaces up/up?</text>
<text x="160" y="198" text-anchor="middle" class="svg-muted" font-size="12">OSPF enabled? area? passive?</text>
<text x="160" y="218" text-anchor="middle" class="svg-muted" font-size="12">timers, mask, auth, network type</text>
<text x="160" y="238" text-anchor="middle" class="svg-muted" font-size="12">duplicate RID, ACL on protocol 89</text>
<text x="160" y="258" text-anchor="middle" class="svg-muted" font-size="12">EXSTART/EXCHANGE: MTU</text>
<rect x="335" y="134" width="290" height="138" rx="8" fill="#bbf7d0"/>
<text x="480" y="156" text-anchor="middle" class="svg-ink" font-size="13">Advertisement or selection problem</text>
<text x="480" y="178" text-anchor="middle" class="svg-muted" font-size="12">is the far network enabled in OSPF?</text>
<text x="480" y="198" text-anchor="middle" class="svg-muted" font-size="12">is it in show ip ospf database?</text>
<text x="480" y="218" text-anchor="middle" class="svg-muted" font-size="12">network type mismatch at FULL?</text>
<text x="480" y="238" text-anchor="middle" class="svg-muted" font-size="12">better AD source (static)?</text>
<text x="480" y="258" text-anchor="middle" class="svg-muted" font-size="12">costs, reference bandwidth</text>
</svg><p class="cap">Split the problem at the neighbour state, then work down one list. Change one thing at a time.</p></div>

<h3>Walkthrough: ticket NK-4521, branch unreachable</h3>
<p>The ticket: monitoring alert MON-1182 says 4.4.4.4 (branch router R4) has not answered ICMP since 02:10. Change CHG-7730 ran from 01:30 to 02:00: "OSPF timers tuned, area plan updated, loopbacks made passive". Three separate mistakes were made. Start at head office, R1, and walk towards the branch.</p>

<p><b>Hop 1: R1 to R2.</b> R1 has no neighbours and no OSPF routes at all.</p>
<pre class="out">R1# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface

R1# show ip ospf interface GigabitEthernet0/0 | include Timer
<span class="hl">  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5</span>
R2# show ip ospf interface GigabitEthernet0/0 | include Timer
<span class="hl">  Timer intervals configured, Hello 5, Dead 20, Wait 20, Retransmit 5</span></pre>
<pre class="code"><span class="c">! Fault 1: the timer "tuning" was applied to one end only. Restore defaults on R2.</span>
R2(config)# interface GigabitEthernet0/0
R2(config-if)# no ip ospf hello-interval</pre>

<p><b>Hop 2: R2 to R3.</b> R1 and R2 are now FULL, but R2 has no neighbour on Gi0/1. The console logs an <code>%OSPF-4-ERRRCV</code> "mismatched area ID" message, and R3 confirms it:</p>
<pre class="out">R3# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Lo0          1     0               3.3.3.3/32         1     LOOP  0/0
Gi0/1        1     0               10.0.34.1/30       1     DR    0/0
<span class="hl">Gi0/0        1     1               10.0.23.2/30       1     DR    0/0</span></pre>
<pre class="code"><span class="c">! Fault 2: the "area plan" put R3's link to R2 in area 1.</span>
R3(config)# router ospf 1
R3(config-router)# no network 10.0.23.0 0.0.0.3 area 1
R3(config-router)# network 10.0.23.0 0.0.0.3 area 0</pre>

<p><b>Hop 3: R3 to R4.</b> R3's Gi0/1 still shows 0/0 neighbours. R4 is the only other router on that link, so check what it is doing:</p>
<pre class="out">R4# show ip protocols | begin Passive
  Passive Interface(s):
<span class="hl">    GigabitEthernet0/0</span>
    Loopback0</pre>
<pre class="code"><span class="c">! Fault 3: "loopbacks made passive" also caught the uplink.</span>
R4(config)# router ospf 1
R4(config-router)# no passive-interface GigabitEthernet0/0</pre>

<p><b>Prove it.</b> Wait up to 40 seconds for the Ethernet DR elections, confirm FULL on every hop, then test from head office:</p>
<pre class="out">R1# show ip route ospf | include 4.4.4.4
<span class="hl">O        4.4.4.4 [110/4] via 10.0.12.2, 00:00:12, GigabitEthernet0/0</span>
R1# ping 4.4.4.4
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 4.4.4.4, timeout is 2 seconds:
<span class="hl">!!!!!</span>
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms</pre>

<div class="eg"><p><b>Worked example: the closing note.</b> "NK-4521 resolved 08:24. Root cause: CHG-7730 introduced three OSPF errors: Hello 5/Dead 20 on R2 Gi0/0 only (adjacency R1-R2 down); R3 Gi0/0 placed in area 1 (area mismatch with R2); R4 Gi0/0 made passive (no Hellos to R3). All three reverted; adjacencies FULL; R1 reaches 4.4.4.4 with cost 4. Recommendation: peer review for OSPF changes and a post-change check of <code>show ip ospf neighbor</code> on both ends of every touched link."</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing several things at once, so you never learn which one fixed it. Running <code>clear ip ospf process</code> as a "fix", which only hides the cause for a moment. Declaring failure after 10 seconds, when an Ethernet adjacency legitimately needs up to 40. Using <code>debug ip ospf adj</code> on a busy production router without limits; use it briefly, and prefer show commands first.</p></div>

<div class="exam"><p><b>Exam trap.</b> Troubleshooting exhibits hide the fault in one field: a Hello 5 next to a Hello 10, an Area 1 in a column of 0s, an interface listed under "Passive Interface(s)", or a neighbour stuck in EXSTART. Read every line of every output, on both routers.</p></div>

<div class="scn"><h4>Neighbours fine, the office still dark</h4><p>A new floor was added to a branch: VLAN 30, gateway 192.168.30.1 on R3's Gi0/2. Users on the floor could reach nothing beyond R3. R2 and R3 were FULL, so the junior engineer suspected the switches. <code>show ip protocols</code> on R3 listed network statements for 10.0.23.0 and 3.3.3.3 only; nothing matched 192.168.30.1, so the LAN was never advertised. Adding <code>network 192.168.30.0 0.0.0.255 area 0</code> and making Gi0/2 passive fixed it in one minute.</p><p><b>Lesson:</b> FULL neighbours only prove the adjacency. Missing routes with healthy neighbours mean something is not being advertised.</p></div>

<div class="iv"><p class="q">"A user says a remote subnet is unreachable. How do you troubleshoot OSPF?"</p><p>Strong answer: confirm the symptom with <code>show ip route</code> and a ping. Then check neighbours hop by hop with <code>show ip ospf neighbor</code>. If an adjacency is missing, compare <code>show ip ospf interface</code> on both ends: area, timers, mask, network type, authentication, passive state, RIDs, ACLs, and MTU if stuck in EXSTART. If adjacencies are FULL, check that the remote network is enabled (<code>show ip protocols</code>), present in the LSDB, and not overridden by a lower-AD route. Fix one thing at a time and verify end to end.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>First question: is the neighbour FULL? That splits adjacency faults from advertisement faults.</li>
<li>Compare <code>show ip ospf interface</code> on both ends of a broken link: area, timers, network type, passive.</li>
<li>Healthy neighbours with a missing route: check network statements, the LSDB and AD.</li>
<li>NK-4521: one-sided Hello timers, a wrong area, and a passive uplink, fixed hop by hop.</li>
<li>Change one thing at a time, wait for the 40-second DR wait, and prove it with a route and a ping.</li>
</ul></div>
`,hi:`
<p>Jab ghar ka ek socket band ho jaata hai, achhi electrician har deewar nahi todti. Woh socket check karti hai, phir us circuit ka breaker, phir main board, aur har jawab batata hai ki aage kahan dekhna hai. OSPF faults bhi isi discipline se sulajhte hain. Ek sawaal lagbhag har OSPF ticket ko aadha kar deta hai: <b>kya neighbour FULL hai?</b> Agar nahi, problem do routers ke beech hai. Agar haan, problem is baat mein hai ki kya advertise ho raha hai ya kya choose ho raha hai.</p>

<h3>Paanch commands jo lagbhag sab kuch bata dete hain</h3>
<table class="cmp"><tr><th>Command</th><th>Kya prove karta hai</th></tr>
<tr><td><code>show ip ospf neighbor</code></td><td>Neighbours kaun hain, unki state (FULL, 2WAY, EXSTART) aur role</td></tr>
<tr><td><code>show ip ospf interface brief</code></td><td>Kaunse interfaces par OSPF chal raha hai, unka area, cost, role aur F/C neighbour count</td></tr>
<tr><td><code>show ip ospf interface Gi0/0</code></td><td>Timers, network type, priority, DR/BDR, passive ("No Hellos"), authentication</td></tr>
<tr><td><code>show ip protocols</code></td><td>Router ID, network statements, passive interfaces, routes ke sources, reference bandwidth</td></tr>
<tr><td><code>show ip route ospf</code> aur <code>show ip ospf database</code></td><td>SPF ka result, aur woh raw map jisse woh nikla</td></tr>
</table>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="OSPF troubleshooting flow">
<rect x="190" y="8" width="260" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">1. Route missing ya galat? show ip route</text>
<line x1="320" y1="46" x2="320" y2="66" stroke="#64748b" stroke-width="2"/>
<rect x="190" y="66" width="260" height="38" rx="8" fill="#bae6fd"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">2. Neighbour FULL? show ip ospf neighbor</text>
<line x1="260" y1="104" x2="150" y2="134" stroke="#64748b" stroke-width="2"/><line x1="380" y1="104" x2="490" y2="134" stroke="#64748b" stroke-width="2"/>
<text x="190" y="126" text-anchor="end" class="svg-muted" font-size="12">nahi</text><text x="450" y="126" class="svg-muted" font-size="12">haan</text>
<rect x="15" y="134" width="290" height="138" rx="8" fill="#fed7aa"/>
<text x="160" y="156" text-anchor="middle" class="svg-ink" font-size="13">Adjacency problem</text>
<text x="160" y="178" text-anchor="middle" class="svg-muted" font-size="12">neighbour ping, interfaces up/up?</text>
<text x="160" y="198" text-anchor="middle" class="svg-muted" font-size="12">OSPF enabled? area? passive?</text>
<text x="160" y="218" text-anchor="middle" class="svg-muted" font-size="12">timers, mask, auth, network type</text>
<text x="160" y="238" text-anchor="middle" class="svg-muted" font-size="12">duplicate RID, protocol 89 par ACL</text>
<text x="160" y="258" text-anchor="middle" class="svg-muted" font-size="12">EXSTART/EXCHANGE: MTU</text>
<rect x="335" y="134" width="290" height="138" rx="8" fill="#bbf7d0"/>
<text x="480" y="156" text-anchor="middle" class="svg-ink" font-size="13">Advertisement ya selection problem</text>
<text x="480" y="178" text-anchor="middle" class="svg-muted" font-size="12">door ka network OSPF mein enabled?</text>
<text x="480" y="198" text-anchor="middle" class="svg-muted" font-size="12">show ip ospf database mein hai?</text>
<text x="480" y="218" text-anchor="middle" class="svg-muted" font-size="12">FULL par network type mismatch?</text>
<text x="480" y="238" text-anchor="middle" class="svg-muted" font-size="12">behtar AD source (static)?</text>
<text x="480" y="258" text-anchor="middle" class="svg-muted" font-size="12">costs, reference bandwidth</text>
</svg><p class="cap">Problem ko neighbour state par split karo, phir ek list neeche tak jao. Ek baar mein ek hi cheez badlo.</p></div>

<h3>Walkthrough: ticket NK-4521, branch unreachable</h3>
<p>Ticket: monitoring alert MON-1182 kehta hai ki 4.4.4.4 (branch router R4) ne 02:10 se ICMP ka jawab nahi diya. Change CHG-7730 01:30 se 02:00 tak chala: "OSPF timers tuned, area plan updated, loopbacks made passive". Teen alag galtiyan hui thi. Head office R1 se shuru karo aur branch ki taraf chalo.</p>

<p><b>Hop 1: R1 se R2.</b> R1 ke paas na koi neighbour hai na koi OSPF route.</p>
<pre class="out">R1# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface

R1# show ip ospf interface GigabitEthernet0/0 | include Timer
<span class="hl">  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5</span>
R2# show ip ospf interface GigabitEthernet0/0 | include Timer
<span class="hl">  Timer intervals configured, Hello 5, Dead 20, Wait 20, Retransmit 5</span></pre>
<pre class="code"><span class="c">! Fault 1: timer "tuning" sirf ek end par lagi. R2 par defaults wapas lao.</span>
R2(config)# interface GigabitEthernet0/0
R2(config-if)# no ip ospf hello-interval</pre>

<p><b>Hop 2: R2 se R3.</b> R1 aur R2 ab FULL hain, lekin R2 ka Gi0/1 par koi neighbour nahi. Console <code>%OSPF-4-ERRRCV</code> "mismatched area ID" message log karta hai, aur R3 ise confirm karta hai:</p>
<pre class="out">R3# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Lo0          1     0               3.3.3.3/32         1     LOOP  0/0
Gi0/1        1     0               10.0.34.1/30       1     DR    0/0
<span class="hl">Gi0/0        1     1               10.0.23.2/30       1     DR    0/0</span></pre>
<pre class="code"><span class="c">! Fault 2: "area plan" ne R3 ka R2 wala link area 1 mein daal diya.</span>
R3(config)# router ospf 1
R3(config-router)# no network 10.0.23.0 0.0.0.3 area 1
R3(config-router)# network 10.0.23.0 0.0.0.3 area 0</pre>

<p><b>Hop 3: R3 se R4.</b> R3 ka Gi0/1 abhi bhi 0/0 neighbours dikhata hai. Us link par R4 hi akela dusra router hai, to dekho woh kya kar raha hai:</p>
<pre class="out">R4# show ip protocols | begin Passive
  Passive Interface(s):
<span class="hl">    GigabitEthernet0/0</span>
    Loopback0</pre>
<pre class="code"><span class="c">! Fault 3: "loopbacks made passive" ne uplink ko bhi pakad liya.</span>
R4(config)# router ospf 1
R4(config-router)# no passive-interface GigabitEthernet0/0</pre>

<p><b>Prove karo.</b> Ethernet DR elections ke liye 40 second tak wait karo, har hop par FULL confirm karo, phir head office se test karo:</p>
<pre class="out">R1# show ip route ospf | include 4.4.4.4
<span class="hl">O        4.4.4.4 [110/4] via 10.0.12.2, 00:00:12, GigabitEthernet0/0</span>
R1# ping 4.4.4.4
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 4.4.4.4, timeout is 2 seconds:
<span class="hl">!!!!!</span>
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms</pre>

<div class="eg"><p><b>Worked example: closing note.</b> "NK-4521 08:24 par resolve. Root cause: CHG-7730 ne teen OSPF errors daale: sirf R2 Gi0/0 par Hello 5/Dead 20 (R1-R2 adjacency down); R3 Gi0/0 area 1 mein (R2 ke saath area mismatch); R4 Gi0/0 passive (R3 ko koi Hellos nahi). Teeno revert kiye; adjacencies FULL; R1 cost 4 se 4.4.4.4 tak pahunchta hai. Recommendation: OSPF changes ka peer review aur har chhue link ke dono ends par post-change <code>show ip ospf neighbor</code> check."</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Ek saath kai cheezein badalna, jisse kabhi pata nahi chalta ki kisne theek kiya. <code>clear ip ospf process</code> ko "fix" ki tarah chalana, jo cause ko bas thodi der chhupata hai. 10 second baad failure declare kar dena, jabki Ethernet adjacency ko jaayaz taur par 40 second tak chahiye. Busy production router par bina limit <code>debug ip ospf adj</code> use karna; ise thodi der use karo, aur pehle show commands prefer karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Troubleshooting exhibits fault ko ek field mein chhupate hain: Hello 10 ke bagal mein Hello 5, 0s ke column mein ek Area 1, "Passive Interface(s)" ke neeche list hua interface, ya EXSTART mein atka neighbour. Dono routers par har output ki har line padho.</p></div>

<div class="scn"><h4>Neighbours theek, office phir bhi andhera</h4><p>Ek branch mein naya floor joda gaya: VLAN 30, gateway 192.168.30.1 R3 ke Gi0/2 par. Floor ke users R3 ke aage kuch bhi reach nahi kar pa rahe the. R2 aur R3 FULL the, isliye junior engineer ko switches par shak hua. R3 par <code>show ip protocols</code> mein sirf 10.0.23.0 aur 3.3.3.3 ke network statements the; 192.168.30.1 se kuch match nahi hota tha, isliye LAN kabhi advertise hi nahi hua. <code>network 192.168.30.0 0.0.0.255 area 0</code> jodne aur Gi0/2 ko passive banane se ek minute mein theek ho gaya.</p><p><b>Seekh:</b> FULL neighbours sirf adjacency prove karte hain. Healthy neighbours ke saath missing routes ka matlab hai kuch advertise nahi ho raha.</p></div>

<div class="iv"><p class="q">"User kehta hai ek remote subnet unreachable hai. Aap OSPF kaise troubleshoot karoge?"</p><p>Strong answer: <code>show ip route</code> aur ping se symptom confirm karo. Phir <code>show ip ospf neighbor</code> se hop by hop neighbours check karo. Agar adjacency missing hai, dono ends par <code>show ip ospf interface</code> compare karo: area, timers, mask, network type, authentication, passive state, RIDs, ACLs, aur EXSTART mein atka ho to MTU. Agar adjacencies FULL hain, check karo ki remote network enabled hai (<code>show ip protocols</code>), LSDB mein hai, aur kisi kam-AD route se override nahi ho raha. Ek baar mein ek cheez theek karo aur end to end verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehla sawaal: kya neighbour FULL hai? Yeh adjacency faults ko advertisement faults se alag karta hai.</li>
<li>Toote link ke dono ends par <code>show ip ospf interface</code> compare karo: area, timers, network type, passive.</li>
<li>Healthy neighbours aur missing route: network statements, LSDB aur AD check karo.</li>
<li>NK-4521: ek taraf ke Hello timers, galat area, aur passive uplink, hop by hop theek kiye.</li>
<li>Ek baar mein ek cheez badlo, 40 second ke DR wait ka intezaar karo, aur route aur ping se prove karo.</li>
</ul></div>
`}};export{e as default};