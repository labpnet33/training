var e={id:`dual-paths`,h:{en:`Loop-free path selection: reading DUAL like a troubleshooter`,hi:`Loop-free path selection: DUAL ko troubleshooter ki tarah padhna`},body:{en:`
<p>Imagine you drive to work every day by the highway (your <b>successor</b>). You also keep a backup road in mind, but only one that you are sure does not pass through your own house again, because the friend who suggested it lives closer to the office than you do (a <b>feasible successor</b>). A third road also reaches the office, but your friend on that road actually lives <i>farther</i> from the office than you, so you cannot be sure his route does not come back through your street. You do not trust it as an instant backup. That is DUAL's <b>feasibility condition</b>, and in ENARSI you must be able to read it straight from router output.</p>

<h3>The five terms, one line each</h3>
<dl class="terms">
<dt>Reported distance (RD)</dt><dd>The neighbour's own metric to the destination, as it advertised it. Also called advertised distance.</dd>
<dt>Feasible distance (FD)</dt><dd>Your best total metric to the destination, remembered since the route last became passive.</dd>
<dt>Feasibility condition (FC)</dt><dd>A neighbour qualifies as a backup only if its <b>RD &lt; your FD</b>. Equal is not enough.</dd>
<dt>Successor</dt><dd>The neighbour on the lowest-metric path; installed in the routing table.</dd>
<dt>Feasible successor (FS)</dt><dd>A neighbour that meets the FC; pre-computed, used instantly when the successor fails, without Queries.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Three paths from R1">
<rect x="20" y="100" width="90" height="46" rx="8" fill="#bae6fd"/><text x="65" y="128" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="260" y="20" width="90" height="46" rx="8" fill="#bbf7d0"/><text x="305" y="48" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<rect x="260" y="100" width="90" height="46" rx="8" fill="#fde68a"/><text x="305" y="128" text-anchor="middle" class="svg-ink" font-size="14">R4</text>
<rect x="260" y="180" width="90" height="46" rx="8" fill="#ddd6fe"/><text x="305" y="208" text-anchor="middle" class="svg-ink" font-size="14">R3</text>
<rect x="480" y="100" width="140" height="46" rx="8" fill="#e2e8f0"/><text x="550" y="128" text-anchor="middle" class="svg-ink" font-size="13">192.168.4.0/24</text>
<line x1="110" y1="115" x2="260" y2="45" stroke="#64748b" stroke-width="2"/><text x="170" y="68" class="svg-muted" font-size="12">Gi0/0 1G</text>
<line x1="110" y1="123" x2="260" y2="123" stroke="#64748b" stroke-width="2"/><text x="160" y="116" class="svg-muted" font-size="12">Gi0/2 10M</text>
<line x1="110" y1="131" x2="260" y2="203" stroke="#64748b" stroke-width="2"/><text x="140" y="190" class="svg-muted" font-size="12">Gi0/1 100M</text>
<line x1="350" y1="43" x2="480" y2="115" stroke="#64748b" stroke-width="2"/><text x="400" y="66" class="svg-accent" font-size="12">RD 2816</text>
<line x1="305" y1="146" x2="305" y2="180" stroke="#64748b" stroke-width="2"/><text x="315" y="167" class="svg-accent" font-size="12">R4 via R3: RD 3072</text>
<line x1="350" y1="203" x2="480" y2="131" stroke="#64748b" stroke-width="2"/><text x="410" y="190" class="svg-accent" font-size="12">RD 2816</text>
</svg><p class="cap">R2 and R3 are connected to the LAN; R4 reaches it through R3. All classic metrics.</p></div>

<h3>Reading the topology table</h3>
<pre class="out">R1#show ip eigrp topology 192.168.4.0/24
EIGRP-IPv4 Topology Entry for AS(10)/ID(1.1.1.1) for 192.168.4.0/24
  State is Passive, Query origin flag is 1, 1 Successor(s), <span class="hl">FD is 3072</span>
  Descriptor Blocks:
  10.0.12.2 (GigabitEthernet0/0), from 10.0.12.2, Send flag is 0x0
      <span class="hl">Composite metric is (3072/2816)</span>, route is Internal
      Vector metric:
        Minimum bandwidth is 1000000 Kbit
        Total delay is 20 microseconds
        Reliability is 255/255
        Load is 1/255
        Minimum MTU is 1500
        Hop count is 1
        Originating router is 2.2.2.2
  10.0.13.3 (GigabitEthernet0/1), from 10.0.13.3, Send flag is 0x0
      Composite metric is (26112/2816), route is Internal
R1#show ip eigrp topology all-links
P 192.168.4.0/24, 1 successors, FD is 3072, serno 14
        via 10.0.12.2 (3072/2816), GigabitEthernet0/0
        via 10.0.13.3 (26112/2816), GigabitEthernet0/1
        via 10.0.14.4 (256768/3072), GigabitEthernet0/2</pre>

<div class="eg"><p><b>Worked example: apply the FC.</b> FD = 3072 via R2 (successor). R3 reports 2816: 2816 &lt; 3072, so R3 is a <b>feasible successor</b> even though its total metric (26112) is much worse. R4 reports 3072: 3072 is <b>not</b> less than 3072, so R4 fails the FC. Being equal is not enough. That is why R4 appears only in <code>all-links</code>. The plain <code>show ip eigrp topology</code> shows successors and feasible successors only.</p></div>

<h3>What happens when the successor fails</h3>
<p>With a feasible successor, R1 switches <b>locally</b>, in milliseconds, with no Queries. You can watch it with <code>debug eigrp fsm</code>:</p>
<pre class="out">DUAL: Find FS for dest 192.168.4.0/24. FD is 3072, RD is 3072
DUAL:    10.0.12.2 metric 4294967295/4294967295
DUAL:    10.0.14.4 metric 256768/3072
<span class="hl">DUAL:    10.0.13.3 metric 26112/2816 found Dmin is 26112</span>
DUAL: Removing dest 192.168.4.0/24, nexthop 10.0.12.2
DUAL: RT installed 192.168.4.0/24 via 10.0.13.3</pre>
<p>R3 has the lowest remaining distance (Dmin 26112) and meets the FC, so R1 installs it immediately. No Query is sent, the route stays <b>passive</b>, and the neighbours simply receive an Update with R1's new metric. Without any feasible successor, the route goes <b>active</b> and Queries go out, which is the subject of the next chapter.</p>

<h3>Named mode numbers</h3>
<p>In named mode the table shows 64-bit wide metrics. On HUB in the first lab the summary from SP1 reads <code>via 10.10.1.2 (1392640/163840)</code>, and the routing table shows <code>[90/10880]</code>, which is 1392640 divided by the RIB scale 128. The FC is applied to the wide values, not to the RIB numbers.</p>

<h3>"It is in the topology table but not in the routing table"</h3>
<ul>
<li><b>Administrative distance.</b> A static route (AD 1), OSPF (110) or even an EIGRP summary (5) for the same prefix wins. <code>show ip route 192.168.4.0</code> shows who owns it.</li>
<li><b>External vs internal.</b> An EIGRP external route (AD 170) loses to OSPF (110) for the same prefix.</li>
<li><b>Distribute-list in.</b> The route is filtered before installation; <code>show ip protocols</code> shows the filter.</li>
<li><b>Inaccessible.</b> <code>FD is Inaccessible</code> means every path has an infinite metric: the route is being withdrawn.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Comparing a neighbour's <b>total</b> metric with the FD instead of its RD; forgetting the FC needs "strictly less than"; assuming the second-best path is always the feasible successor; reading <code>show ip eigrp topology</code> without <code>all-links</code> and concluding a neighbour does not advertise the route.</p></div>

<div class="exam"><p><b>Exam trap.</b> The FD is the lowest metric since the route last became passive; it does not rise just because the current path got worse. A path can be the best available yet fail the FC. And a feasible successor only helps if the successor fails; it is not used for load sharing unless variance allows it.</p></div>

<div class="scn"><h4>The backup link that did not save the day</h4><p>A campus had two uplinks to the core: a 10G primary and a second 10G path through another distribution switch. When the primary failed, users saw a two-second outage and logs showed Queries. The team had expected an instant switch. <code>show ip eigrp topology all-links</code> showed the backup path's RD equal to the FD, because both paths had identical delay to the core, so it failed the FC by being equal. Adjusting the delay on the backup distribution switch's core link lowered its RD below the FD, and the next failover test switched instantly.</p><p><b>Lesson:</b> if you want an instant backup, check that its RD is strictly lower than your FD.</p></div>

<div class="iv"><p class="q">"Why might the second-best path not be a feasible successor?"</p><p>Because the feasibility condition compares the neighbour's reported distance with your feasible distance, not the total metrics. A neighbour whose own distance is equal to or greater than your FD might be routing through you, so DUAL cannot prove its path is loop-free and does not keep it as a backup. Give numbers: FD 3072, RD 3072 fails; RD 2816 passes even with a total of 26112. Mention <code>all-links</code> to see non-feasible paths.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Feasibility condition: neighbour's RD must be strictly less than your FD.</li>
<li>The successor has the lowest total metric; a feasible successor may have a much worse total.</li>
<li><code>show ip eigrp topology</code> shows successors and FSs; <code>all-links</code> shows everything.</li>
<li>With an FS, failover is local and instant; without one, the route goes active and Queries start.</li>
<li>In the topology table but not the RIB: check AD, external vs internal, and inbound filters.</li>
</ul></div>
`,hi:`
<p>Socho aap roz highway se office jaate ho (aapka <b>successor</b>). Aap ek backup road bhi dimaag mein rakhte ho, lekin sirf aisi jiske baare mein pakka ho ki woh dobara aapke ghar se hokar nahi guzarti, kyunki jis dost ne woh sujhayi woh office ke aapse zyada paas rehta hai (<b>feasible successor</b>). Ek teesri road bhi office tak pahunchti hai, lekin us road wala dost office se aapse <i>zyada door</i> rehta hai, isliye aap pakka nahi keh sakte ki uska route aapki gali se wapas nahi aata. Aap use instant backup ke roop mein trust nahi karte. Yahi DUAL ki <b>feasibility condition</b> hai, aur ENARSI mein aapko ise seedha router output se padhna aana chahiye.</p>

<h3>Paanch terms, har ek ek line mein</h3>
<dl class="terms">
<dt>Reported distance (RD)</dt><dd>Destination tak neighbour ka apna metric, jaisa usne advertise kiya. Ise advertised distance bhi kehte hain.</dd>
<dt>Feasible distance (FD)</dt><dd>Destination tak aapka best total metric, jo route ke pichhli baar passive hone se yaad rakha gaya hai.</dd>
<dt>Feasibility condition (FC)</dt><dd>Neighbour backup tabhi ban sakta hai jab uska <b>RD &lt; aapka FD</b> ho. Barabar hona kaafi nahi.</dd>
<dt>Successor</dt><dd>Sabse kam metric wale path ka neighbour; routing table mein install hota hai.</dd>
<dt>Feasible successor (FS)</dt><dd>Jo neighbour FC poori karta hai; pehle se calculate hota hai, successor fail hone par bina Queries turant use hota hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="R1 se teen paths">
<rect x="20" y="100" width="90" height="46" rx="8" fill="#bae6fd"/><text x="65" y="128" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="260" y="20" width="90" height="46" rx="8" fill="#bbf7d0"/><text x="305" y="48" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<rect x="260" y="100" width="90" height="46" rx="8" fill="#fde68a"/><text x="305" y="128" text-anchor="middle" class="svg-ink" font-size="14">R4</text>
<rect x="260" y="180" width="90" height="46" rx="8" fill="#ddd6fe"/><text x="305" y="208" text-anchor="middle" class="svg-ink" font-size="14">R3</text>
<rect x="480" y="100" width="140" height="46" rx="8" fill="#e2e8f0"/><text x="550" y="128" text-anchor="middle" class="svg-ink" font-size="13">192.168.4.0/24</text>
<line x1="110" y1="115" x2="260" y2="45" stroke="#64748b" stroke-width="2"/><text x="170" y="68" class="svg-muted" font-size="12">Gi0/0 1G</text>
<line x1="110" y1="123" x2="260" y2="123" stroke="#64748b" stroke-width="2"/><text x="160" y="116" class="svg-muted" font-size="12">Gi0/2 10M</text>
<line x1="110" y1="131" x2="260" y2="203" stroke="#64748b" stroke-width="2"/><text x="140" y="190" class="svg-muted" font-size="12">Gi0/1 100M</text>
<line x1="350" y1="43" x2="480" y2="115" stroke="#64748b" stroke-width="2"/><text x="400" y="66" class="svg-accent" font-size="12">RD 2816</text>
<line x1="305" y1="146" x2="305" y2="180" stroke="#64748b" stroke-width="2"/><text x="315" y="167" class="svg-accent" font-size="12">R4 R3 ke through: RD 3072</text>
<line x1="350" y1="203" x2="480" y2="131" stroke="#64748b" stroke-width="2"/><text x="410" y="190" class="svg-accent" font-size="12">RD 2816</text>
</svg><p class="cap">R2 aur R3 LAN se connected hain; R4 R3 ke through pahunchta hai. Saare classic metrics.</p></div>

<h3>Topology table padhna</h3>
<pre class="out">R1#show ip eigrp topology 192.168.4.0/24
EIGRP-IPv4 Topology Entry for AS(10)/ID(1.1.1.1) for 192.168.4.0/24
  State is Passive, Query origin flag is 1, 1 Successor(s), <span class="hl">FD is 3072</span>
  Descriptor Blocks:
  10.0.12.2 (GigabitEthernet0/0), from 10.0.12.2, Send flag is 0x0
      <span class="hl">Composite metric is (3072/2816)</span>, route is Internal
      Vector metric:
        Minimum bandwidth is 1000000 Kbit
        Total delay is 20 microseconds
        Reliability is 255/255
        Load is 1/255
        Minimum MTU is 1500
        Hop count is 1
        Originating router is 2.2.2.2
  10.0.13.3 (GigabitEthernet0/1), from 10.0.13.3, Send flag is 0x0
      Composite metric is (26112/2816), route is Internal
R1#show ip eigrp topology all-links
P 192.168.4.0/24, 1 successors, FD is 3072, serno 14
        via 10.0.12.2 (3072/2816), GigabitEthernet0/0
        via 10.0.13.3 (26112/2816), GigabitEthernet0/1
        via 10.0.14.4 (256768/3072), GigabitEthernet0/2</pre>

<div class="eg"><p><b>Worked example: FC apply karo.</b> FD = 3072 R2 ke through (successor). R3 2816 report karta hai: 2816 &lt; 3072, isliye R3 <b>feasible successor</b> hai chahe uska total metric (26112) kahin zyada kharab ho. R4 3072 report karta hai: 3072, 3072 se kam <b>nahi</b> hai, isliye R4 FC fail karta hai. Barabar hona kaafi nahi. Isiliye R4 sirf <code>all-links</code> mein dikhta hai. Simple <code>show ip eigrp topology</code> sirf successors aur feasible successors dikhata hai.</p></div>

<h3>Jab successor fail hota hai to kya hota hai</h3>
<p>Feasible successor ke saath R1 <b>locally</b>, milliseconds mein, bina Queries ke switch karta hai. Aap ise <code>debug eigrp fsm</code> se dekh sakte ho:</p>
<pre class="out">DUAL: Find FS for dest 192.168.4.0/24. FD is 3072, RD is 3072
DUAL:    10.0.12.2 metric 4294967295/4294967295
DUAL:    10.0.14.4 metric 256768/3072
<span class="hl">DUAL:    10.0.13.3 metric 26112/2816 found Dmin is 26112</span>
DUAL: Removing dest 192.168.4.0/24, nexthop 10.0.12.2
DUAL: RT installed 192.168.4.0/24 via 10.0.13.3</pre>
<p>R3 ki bachi hui distance sabse kam hai (Dmin 26112) aur woh FC poori karta hai, isliye R1 use turant install kar deta hai. Koi Query nahi jaati, route <b>passive</b> rehta hai, aur neighbours ko bas R1 ke naye metric ke saath ek Update milta hai. Bina kisi feasible successor ke route <b>active</b> hota hai aur Queries jaati hain, jo agle chapter ka topic hai.</p>

<h3>Named mode ke numbers</h3>
<p>Named mode mein table 64-bit wide metrics dikhati hai. Pehle lab mein HUB par SP1 ka summary <code>via 10.10.1.2 (1392640/163840)</code> padhta hai, aur routing table <code>[90/10880]</code> dikhati hai, jo 1392640 ko RIB scale 128 se divide karke aata hai. FC wide values par apply hoti hai, RIB numbers par nahi.</p>

<h3>"Topology table mein hai lekin routing table mein nahi"</h3>
<ul>
<li><b>Administrative distance.</b> Same prefix ke liye static route (AD 1), OSPF (110) ya EIGRP summary (5) bhi jeet jaata hai. <code>show ip route 192.168.4.0</code> dikhata hai ki owner kaun hai.</li>
<li><b>External vs internal.</b> EIGRP external route (AD 170) same prefix ke liye OSPF (110) se haar jaata hai.</li>
<li><b>Distribute-list in.</b> Route installation se pehle filter ho jaata hai; <code>show ip protocols</code> filter dikhata hai.</li>
<li><b>Inaccessible.</b> <code>FD is Inaccessible</code> ka matlab hai har path ka metric infinite hai: route withdraw ho raha hai.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Neighbour ke RD ki jagah uske <b>total</b> metric ko FD se compare karna; bhool jaana ki FC ko "strictly less than" chahiye; maan lena ki second-best path hamesha feasible successor hai; <code>all-links</code> ke bina <code>show ip eigrp topology</code> padh kar yeh conclude karna ki neighbour route advertise nahi karta.</p></div>

<div class="exam"><p><b>Exam trap.</b> FD woh sabse kam metric hai jo route ke pichhli baar passive hone ke baad se hai; current path kharab hone se yeh nahi badhta. Koi path best available hote hue bhi FC fail kar sakta hai. Aur feasible successor sirf tab madad karta hai jab successor fail ho; load sharing ke liye use nahi hota jab tak variance allow na kare.</p></div>

<div class="scn"><h4>Backup link jisne din nahi bachaya</h4><p>Ek campus ke core tak do uplinks the: 10G primary aur doosre distribution switch se hokar ek aur 10G path. Primary fail hua to users ko do second ka outage dikha aur logs mein Queries dikhi. Team ko instant switch ki umeed thi. <code>show ip eigrp topology all-links</code> ne dikhaya ki backup path ka RD FD ke barabar tha, kyunki dono paths ka core tak delay same tha, isliye barabar hone ki wajah se FC fail hui. Backup distribution switch ke core link par delay adjust karne se uska RD FD se neeche aa gaya, aur agle failover test mein instant switch hua.</p><p><b>Seekh:</b> agar instant backup chahiye, to check karo ki uska RD aapke FD se strictly kam ho.</p></div>

<div class="iv"><p class="q">"Second-best path feasible successor kyun nahi ho sakta?"</p><p>Kyunki feasibility condition neighbour ke reported distance ko aapke feasible distance se compare karti hai, total metrics ko nahi. Jis neighbour ki apni distance aapke FD ke barabar ya zyada hai, woh shayad aapke through route kar raha ho, isliye DUAL prove nahi kar sakta ki uska path loop-free hai aur use backup nahi rakhta. Numbers do: FD 3072, RD 3072 fail; RD 2816 pass, chahe total 26112 ho. Non-feasible paths dekhne ke liye <code>all-links</code> ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Feasibility condition: neighbour ka RD aapke FD se strictly kam hona chahiye.</li>
<li>Successor ka total metric sabse kam hota hai; feasible successor ka total kahin zyada kharab ho sakta hai.</li>
<li><code>show ip eigrp topology</code> successors aur FSs dikhata hai; <code>all-links</code> sab kuch.</li>
<li>FS ke saath failover local aur instant hai; iske bina route active hota hai aur Queries shuru hoti hain.</li>
<li>Topology table mein hai par RIB mein nahi: AD, external vs internal, aur inbound filters check karo.</li>
</ul></div>
`}};export{e as default};