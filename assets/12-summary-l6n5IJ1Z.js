var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with courier hubs that trust their neighbours and keep a pre-approved backup courier. You now know exactly how that trust is earned (neighbour requirements), how distance is measured (the composite metric), how the backup is proven safe (the feasibility condition), and what happens when there is no backup (Queries). This chapter packs it all into a checklist you can revise from the night before the exam.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Explain why EIGRP is an advanced distance-vector protocol, and name its protocol number, multicast address and AD values.</li>
<li>List the five packet types, which are reliable, and what RTP does when an ACK is missing.</li>
<li>State what must match for an adjacency (AS, K values, subnet, authentication) and what need not (timers, MTU, router ID).</li>
<li>Calculate a classic metric by hand, such as 256 x (10 + 3) = 3328, and a wide metric, such as 2,621,440 / 128 = 20480.</li>
<li>Read a topology table: find the FD, the successor, every feasible successor, and explain why a path is or is not an FS.</li>
<li>Configure EIGRP in classic and named mode with wildcard network statements, passive interfaces and authentication.</li>
<li>Configure a summary, a stub router, and unequal-cost load balancing with the smallest correct variance.</li>
<li>Describe going Active, Queries and Replies, and stuck-in-active, and how stubs and summaries limit queries.</li>
<li>Compare EIGRP and OSPF on type, metric, load balancing, path selection, path operations and area types.</li>
<li>Troubleshoot a K-value mismatch and a missing network statement from logs and <code>show ip protocols</code>.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="DUAL decision when a successor fails">
<rect x="210" y="12" width="220" height="40" rx="8" fill="#fed7aa"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">Successor lost</text>
<rect x="210" y="82" width="220" height="44" rx="8" fill="#fde68a"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">Feasible successor?</text><text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">any RD &lt; FD</text>
<rect x="30" y="170" width="240" height="60" rx="8" fill="#bbf7d0"/><text x="150" y="194" text-anchor="middle" class="svg-ink" font-size="13">Yes: local computation</text><text x="150" y="212" text-anchor="middle" class="svg-muted" font-size="12">promote FS, stay Passive</text>
<rect x="370" y="170" width="240" height="60" rx="8" fill="#ddd6fe"/><text x="490" y="194" text-anchor="middle" class="svg-ink" font-size="13">No: go Active</text><text x="490" y="212" text-anchor="middle" class="svg-muted" font-size="12">Query all, wait for Replies</text>
<line x1="320" y1="52" x2="320" y2="82" stroke="#64748b" stroke-width="2"/><line x1="270" y1="126" x2="170" y2="170" stroke="#64748b" stroke-width="2"/><line x1="370" y1="126" x2="470" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="490" y="260" text-anchor="middle" class="svg-accent" font-size="12">no reply in time: SIA, neighbour reset</text>
<text x="150" y="260" text-anchor="middle" class="svg-accent" font-size="12">milliseconds, no packets needed</text>
</svg><p class="cap">The one decision DUAL makes every time a successor is lost.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>DUAL</dt><dd>Diffusing Update Algorithm; keeps paths loop-free and chooses successors and feasible successors.</dd>
<dt>RTP</dt><dd>Reliable Transport Protocol; sequence numbers, ACKs and unicast retransmission for Updates, Queries and Replies.</dd>
<dt>FD</dt><dd>Feasible distance; your best total metric to a destination.</dd>
<dt>RD / AD</dt><dd>Reported (advertised) distance; the neighbour's own metric to the destination.</dd>
<dt>Successor</dt><dd>Neighbour on the best path; installed in the routing table.</dd>
<dt>Feasible successor</dt><dd>Loop-free backup neighbour with RD &lt; FD.</dd>
<dt>Active / Passive</dt><dd>Route state: Active while querying for a new path, Passive when stable.</dd>
<dt>SIA</dt><dd>Stuck in active; a Query not answered in time, leading to a neighbour reset.</dd>
<dt>Variance</dt><dd>Multiplier allowing feasible successors with metric below variance x FD into the routing table.</dd>
<dt>Stub router</dt><dd>A router its neighbours do not query; advertises connected and summary routes by default.</dd>
<dt>Wide metrics</dt><dd>64-bit named-mode metrics with picosecond delay; RIB value = metric / 128.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>IP protocol / multicast</td><td>88 / 224.0.0.10 (FF02::A)</td></tr>
<tr><td>AD</td><td>90 internal, 170 external, 5 summary</td></tr>
<tr><td>Timers</td><td>Hello 5 s, hold 15 s (60/180 on slow multipoint NBMA); need not match</td></tr>
<tr><td>Default K values</td><td>K1=1, K2=0, K3=1, K4=0, K5=0; must match</td></tr>
<tr><td>Classic metric</td><td>256 x (10^7 / min BW Kbps + sum of delays in tens of microseconds)</td></tr>
<tr><td>Feasibility condition</td><td>RD strictly less than FD</td></tr>
<tr><td>Variance rule</td><td>FS and metric less than variance x FD</td></tr>
<tr><td>Maximum paths</td><td>4 by default</td></tr>
<tr><td>Active timer</td><td>3 minutes; SIA-Query at half-time</td></tr>
<tr><td>Default stub</td><td>connected + summary</td></tr>
<tr><td>Hop count limit</td><td>100 by default</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! classic mode</span>
router eigrp 100
 eigrp router-id 1.1.1.1
 network 10.0.12.0 0.0.0.255
 passive-interface GigabitEthernet0/2
 variance 3
 eigrp stub
interface GigabitEthernet0/0
 ip summary-address eigrp 100 10.1.0.0 255.255.252.0
 ip authentication mode eigrp 100 md5
 ip authentication key-chain eigrp 100 NK-KEYS
 delay 20

<span class="c">! named mode</span>
router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 100
  network 10.0.12.0 0.0.0.255
  af-interface GigabitEthernet0/0
   authentication mode hmac-sha-256 N3tK1ngs
   summary-address 10.1.0.0 255.255.252.0
  topology base
   variance 3

<span class="c">! verification</span>
show ip eigrp neighbors [detail]
show ip eigrp interfaces
show ip eigrp topology [all-links | active | prefix]
show ip protocols
show ip route eigrp
show eigrp address-family ipv4 topology</pre>

<div class="eg"><p><b>Worked example: one last full calculation.</b> R5 learns 198.51.100.0/24 from two neighbours. Via R6: total 5120, R6 reports 2560. Via R7: total 12800, R7 reports 4608. FD = 5120 (R6 is the successor). R7's RD 4608 &lt; 5120, so R7 is a feasible successor. 12800 / 5120 = 2.5, so the smallest variance that installs R7 is <b>3</b> (2 x 5120 = 10240 is too small; 3 x 5120 = 15360 is enough).</p></div>

<div class="warn"><p><b>Common mistake.</b> Revising only definitions. The exam and interviews give you numbers and outputs. Practise reading <code>(total/RD)</code> pairs and calculating variance until it takes seconds.</p></div>

<div class="exam"><p><b>Exam trap.</b> Watch for these swaps: RD compared with total metric instead of FD; "EIGRP areas"; OSPF with unequal-cost load balancing; protocol 89 for EIGRP; hello timers that "must match"; passive interfaces that "stop advertising".</p></div>

<div class="scn"><h4>The interview whiteboard</h4><p>A candidate for a network engineer role in Bengaluru was handed a topology table with four paths and asked which could be used if the primary failed, and how to load-balance over two of them. He calculated the FD, checked each RD against it, found two feasible successors, and computed the minimum variance for the better one, explaining that the third path failed the feasibility condition despite a moderate total metric. He got the job, and the interviewer later said that it was the calculation, not the definitions, that decided it.</p><p><b>Lesson:</b> EIGRP knowledge is judged by whether you can reason with numbers from real output.</p></div>

<div class="iv"><p class="q">"In two minutes, tell me everything important about EIGRP."</p><p>Strong answer: Cisco advanced distance-vector IGP, protocol 88, 224.0.0.10, AD 90/170. Neighbours need the same AS, K values, subnet and authentication. Metric is bandwidth plus delay (wide metrics in named mode). DUAL keeps a successor and feasible successors using RD &lt; FD, so failover is instant; without an FS the route goes Active and queries, and stubs and summarisation limit that. Unique feature: unequal-cost load balancing with variance. Versus OSPF: no areas, faster pre-computed failover, but Cisco-centric.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EIGRP = advanced distance vector + DUAL + RTP + composite metric.</li>
<li>Adjacency: same AS, K values, subnet, authentication; timers and MTU need not match.</li>
<li>FS rule: RD &lt; FD. Variance rule: FS and metric below variance x FD.</li>
<li>No FS means Queries; stubs and summaries keep query domains small and prevent SIA.</li>
<li>Know the EIGRP vs OSPF table and the troubleshooting ladder cold.</li>
</ul></div>
`,hi:`
<p>Aapne un courier hubs se shuru kiya tha jo apne neighbours par bharosa karte hain aur ek pre-approved backup courier rakhte hain. Ab aap bilkul jaante ho ki woh bharosa kaise kamaya jaata hai (neighbour requirements), distance kaise naapi jaati hai (composite metric), backup ko safe kaise prove kiya jaata hai (feasibility condition), aur backup na ho to kya hota hai (Queries). Yeh chapter sab kuch ek checklist mein pack karta hai jise aap exam se pehli raat revise kar sako.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao ki EIGRP advanced distance-vector protocol kyun hai, aur uska protocol number, multicast address aur AD values batao.</li>
<li>Paanch packet types list karo, kaunse reliable hain, aur ACK missing hone par RTP kya karta hai.</li>
<li>Batao ki adjacency ke liye kya match hona chahiye (AS, K values, subnet, authentication) aur kya zaroori nahi (timers, MTU, router ID).</li>
<li>Classic metric haath se calculate karo, jaise 256 x (10 + 3) = 3328, aur wide metric, jaise 2,621,440 / 128 = 20480.</li>
<li>Topology table padho: FD, successor, har feasible successor dhoondho, aur samjhao ki koi path FS kyun hai ya kyun nahi.</li>
<li>Wildcard network statements, passive interfaces aur authentication ke saath classic aur named mode mein EIGRP configure karo.</li>
<li>Ek summary, ek stub router, aur sabse chhote sahi variance ke saath unequal-cost load balancing configure karo.</li>
<li>Active hona, Queries aur Replies, aur stuck-in-active describe karo, aur stubs aur summaries queries ko kaise limit karte hain.</li>
<li>EIGRP aur OSPF ko type, metric, load balancing, path selection, path operations aur area types par compare karo.</li>
<li>Logs aur <code>show ip protocols</code> se K-value mismatch aur missing network statement troubleshoot karo.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Successor fail hone par DUAL ka decision">
<rect x="210" y="12" width="220" height="40" rx="8" fill="#fed7aa"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">Successor kho gaya</text>
<rect x="210" y="82" width="220" height="44" rx="8" fill="#fde68a"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">Feasible successor hai?</text><text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">koi RD &lt; FD</text>
<rect x="30" y="170" width="240" height="60" rx="8" fill="#bbf7d0"/><text x="150" y="194" text-anchor="middle" class="svg-ink" font-size="13">Haan: local computation</text><text x="150" y="212" text-anchor="middle" class="svg-muted" font-size="12">FS promote, Passive raho</text>
<rect x="370" y="170" width="240" height="60" rx="8" fill="#ddd6fe"/><text x="490" y="194" text-anchor="middle" class="svg-ink" font-size="13">Nahi: Active ho jao</text><text x="490" y="212" text-anchor="middle" class="svg-muted" font-size="12">sabko Query, Replies ka wait</text>
<line x1="320" y1="52" x2="320" y2="82" stroke="#64748b" stroke-width="2"/><line x1="270" y1="126" x2="170" y2="170" stroke="#64748b" stroke-width="2"/><line x1="370" y1="126" x2="470" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="490" y="260" text-anchor="middle" class="svg-accent" font-size="12">time par reply nahi: SIA, neighbour reset</text>
<text x="150" y="260" text-anchor="middle" class="svg-accent" font-size="12">milliseconds, koi packet nahi chahiye</text>
</svg><p class="cap">Woh ek decision jo DUAL har baar successor khone par leta hai.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>DUAL</dt><dd>Diffusing Update Algorithm; paths ko loop-free rakhta hai aur successors aur feasible successors chunta hai.</dd>
<dt>RTP</dt><dd>Reliable Transport Protocol; Updates, Queries aur Replies ke liye sequence numbers, ACKs aur unicast retransmission.</dd>
<dt>FD</dt><dd>Feasible distance; destination tak aapka best total metric.</dd>
<dt>RD / AD</dt><dd>Reported (advertised) distance; destination tak neighbour ka apna metric.</dd>
<dt>Successor</dt><dd>Best path wala neighbour; routing table mein install hota hai.</dd>
<dt>Feasible successor</dt><dd>RD &lt; FD wala loop-free backup neighbour.</dd>
<dt>Active / Passive</dt><dd>Route state: naye path ke liye query karte waqt Active, stable hone par Passive.</dd>
<dt>SIA</dt><dd>Stuck in active; Query ka time par jawab nahi, jisse neighbour reset hota hai.</dd>
<dt>Variance</dt><dd>Multiplier jo variance x FD se kam metric wale feasible successors ko routing table mein aane deta hai.</dd>
<dt>Stub router</dt><dd>Aisa router jise uske neighbours query nahi karte; default mein connected aur summary routes advertise karta hai.</dd>
<dt>Wide metrics</dt><dd>Picosecond delay wale 64-bit named-mode metrics; RIB value = metric / 128.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>IP protocol / multicast</td><td>88 / 224.0.0.10 (FF02::A)</td></tr>
<tr><td>AD</td><td>90 internal, 170 external, 5 summary</td></tr>
<tr><td>Timers</td><td>Hello 5 s, hold 15 s (slow multipoint NBMA par 60/180); match zaroori nahi</td></tr>
<tr><td>Default K values</td><td>K1=1, K2=0, K3=1, K4=0, K5=0; match hone chahiye</td></tr>
<tr><td>Classic metric</td><td>256 x (10^7 / min BW Kbps + delays ka jod tens of microseconds mein)</td></tr>
<tr><td>Feasibility condition</td><td>RD strictly FD se kam</td></tr>
<tr><td>Variance rule</td><td>FS aur metric variance x FD se kam</td></tr>
<tr><td>Maximum paths</td><td>Default 4</td></tr>
<tr><td>Active timer</td><td>3 minute; aadhe time par SIA-Query</td></tr>
<tr><td>Default stub</td><td>connected + summary</td></tr>
<tr><td>Hop count limit</td><td>Default 100</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! classic mode</span>
router eigrp 100
 eigrp router-id 1.1.1.1
 network 10.0.12.0 0.0.0.255
 passive-interface GigabitEthernet0/2
 variance 3
 eigrp stub
interface GigabitEthernet0/0
 ip summary-address eigrp 100 10.1.0.0 255.255.252.0
 ip authentication mode eigrp 100 md5
 ip authentication key-chain eigrp 100 NK-KEYS
 delay 20

<span class="c">! named mode</span>
router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 100
  network 10.0.12.0 0.0.0.255
  af-interface GigabitEthernet0/0
   authentication mode hmac-sha-256 N3tK1ngs
   summary-address 10.1.0.0 255.255.252.0
  topology base
   variance 3

<span class="c">! verification</span>
show ip eigrp neighbors [detail]
show ip eigrp interfaces
show ip eigrp topology [all-links | active | prefix]
show ip protocols
show ip route eigrp
show eigrp address-family ipv4 topology</pre>

<div class="eg"><p><b>Worked example: ek aakhri poora calculation.</b> R5 198.51.100.0/24 do neighbours se seekhta hai. R6 se: total 5120, R6 report karta hai 2560. R7 se: total 12800, R7 report karta hai 4608. FD = 5120 (R6 successor hai). R7 ka RD 4608 &lt; 5120, isliye R7 feasible successor hai. 12800 / 5120 = 2.5, isliye R7 ko install karne wala sabse chhota variance <b>3</b> hai (2 x 5120 = 10240 bahut chhota hai; 3 x 5120 = 15360 kaafi hai).</p></div>

<div class="warn"><p><b>Common galti.</b> Sirf definitions revise karna. Exam aur interviews aapko numbers aur outputs dete hain. <code>(total/RD)</code> pairs padhna aur variance calculate karna itna practice karo ki seconds lagein.</p></div>

<div class="exam"><p><b>Exam trap.</b> In adla-badli ka dhyan rakho: RD ko FD ki jagah total metric se compare karna; "EIGRP areas"; OSPF mein unequal-cost load balancing; EIGRP ke liye protocol 89; hello timers jo "match hone chahiye"; passive interfaces jo "advertise karna band kar dete hain".</p></div>

<div class="scn"><h4>Interview whiteboard</h4><p>Bengaluru mein network engineer role ke ek candidate ko chaar paths wali topology table di gayi aur poocha gaya ki primary fail hone par kaunse use ho sakte hain, aur unme se do par load-balance kaise karein. Usne FD calculate kiya, har RD ko usse check kiya, do feasible successors dhoondhe, aur behtar wale ke liye minimum variance nikaala, yeh samjhate hue ki teesra path moderate total metric ke bawajood feasibility condition fail karta hai. Use job mili, aur interviewer ne baad mein kaha ki definitions nahi, calculation ne faisla kiya.</p><p><b>Seekh:</b> EIGRP knowledge is baat se judge hoti hai ki aap real output ke numbers se reasoning kar sakte ho ya nahi.</p></div>

<div class="iv"><p class="q">"Do minute mein EIGRP ke baare mein har zaroori baat batao."</p><p>Strong answer: Cisco ka advanced distance-vector IGP, protocol 88, 224.0.0.10, AD 90/170. Neighbours ko same AS, K values, subnet aur authentication chahiye. Metric bandwidth plus delay hai (named mode mein wide metrics). DUAL RD &lt; FD se ek successor aur feasible successors rakhta hai, isliye failover instant hai; FS na ho to route Active hokar query karta hai, aur stubs aur summarisation use limit karte hain. Unique feature: variance se unequal-cost load balancing. OSPF ke mukable: koi areas nahi, fast pre-computed failover, lekin Cisco-centric.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EIGRP = advanced distance vector + DUAL + RTP + composite metric.</li>
<li>Adjacency: same AS, K values, subnet, authentication; timers aur MTU ka match zaroori nahi.</li>
<li>FS rule: RD &lt; FD. Variance rule: FS aur metric variance x FD se kam.</li>
<li>FS nahi matlab Queries; stubs aur summaries query domains chhote rakhte hain aur SIA rokte hain.</li>
<li>EIGRP vs OSPF table aur troubleshooting ladder zubaani yaad rakho.</li>
</ul></div>
`}};export{e as default};