var e={id:`root-election-cost`,h:{en:`Root bridge election and path cost (short vs long)`,hi:`Root bridge election aur path cost (short vs long)`},body:{en:`
<p>Every map needs a "you are here" point. Spanning tree's reference point is the <b>root bridge</b>: the one switch that every other switch measures distances to. Once the root is known, "distance" is simply the sum of the <b>path costs</b> of the links between a switch and the root, like adding up toll charges on a highway journey. This chapter covers both halves: who becomes root, and how the toll is added up.</p>

<h3>Step 1: electing the root bridge</h3>
<ol>
<li>When a switch boots, it knows nobody, so it assumes it is the root. It sends BPDUs listing <b>itself</b> as Root Bridge ID, with root path cost 0.</li>
<li>When a switch receives a BPDU whose Root Bridge ID is <b>lower</b> (better) than the root it currently believes in, the BPDU is called <b>superior</b>. The switch stops claiming, records the new root, and from then on advertises that root in its own BPDUs.</li>
<li>Within a few hello intervals, every switch in the VLAN agrees on the single switch with the <b>lowest Bridge ID</b>.</li>
</ol>
<p>Lowest Bridge ID means: compare the <b>priority</b> (including the VLAN number) first; only if priorities are equal, compare the <b>MAC address</b>. Costs, speeds, uptime and model play no part in the root election.</p>

<div class="eg"><p><b>Worked example: the lab with defaults.</b> All three switches have priority 32768, so in VLAN 10 all show 32778 and the MAC decides:</p>
<table class="cmp"><tr><th>Switch</th><th>Priority (VLAN 10)</th><th>MAC</th><th>Result</th></tr>
<tr><td>SW1</td><td>32778</td><td>5254.<b>00</b>23.a200</td><td><b>Root</b> (lowest MAC)</td></tr>
<tr><td>SW3</td><td>32778</td><td>5254.<b>fe</b>23.9f00</td><td>second lowest</td></tr>
<tr><td>SW2</td><td>32778</td><td>5254.<b>ff</b>23.a000</td><td>highest</td></tr>
</table>
<p>Compare MACs hex digit by hex digit from the left: 5254 is equal, then 00 beats fe beats ff. SW1 wins every VLAN until you change a priority.</p></div>

<p>The root role is <b>preemptive</b>: if a switch with a lower Bridge ID is connected later, it becomes root immediately and the whole tree is recalculated. That is why a forgotten switch with priority 0, or simply a very old switch with a low MAC, can steal the root (chapter 10 shows how Root Guard and BPDU Guard stop that).</p>

<h3>Step 2: path cost, the toll for each link</h3>
<p>Each port has an STP <b>port cost</b> derived from its speed: faster link, lower cost. There are two tables.</p>
<table class="cmp"><tr><th>Link speed</th><th>Short (16-bit, 802.1D-1998)</th><th>Long (32-bit, 802.1t)</th></tr>
<tr><td>10 Mbps</td><td>100</td><td>2,000,000</td></tr>
<tr><td>100 Mbps</td><td>19</td><td>200,000</td></tr>
<tr><td>1 Gbps</td><td>4</td><td>20,000</td></tr>
<tr><td>10 Gbps</td><td>2</td><td>2,000</td></tr>
<tr><td>40 Gbps</td><td>1 (cannot be told apart)</td><td>500</td></tr>
<tr><td>100 Gbps</td><td>1 (cannot be told apart)</td><td>200</td></tr>
</table>
<p>The short table was designed when 1 Gbps was fast, so everything above 10 Gbps collapses to the smallest values and STP cannot prefer a 100 Gbps path over a 40 Gbps one. The <b>long</b> method (cost = 20 Tbps divided by link speed) fixes that. On Cisco switches you choose it globally, and it must be the <b>same on every switch</b>:</p>
<pre class="code">SW1(config)# spanning-tree pathcost method long</pre>
<pre class="out">SW1# show spanning-tree summary | include Pathcost
<span class="hl">Configured Pathcost method used is short</span></pre>
<p>Most Catalyst IOS releases default to short; some newer IOS XE releases default to long, so always check. A port-channel (next module) gets a cost based on its combined bandwidth, which is one reason bundling links is attractive.</p>

<h3>Step 3: adding up the root path cost</h3>
<p>The rule is precise: <b>the root advertises cost 0; when a switch receives a BPDU on a port, it adds that receiving port's cost to the cost in the BPDU</b>. The result is the root path cost via that port. The switch then advertises its best root path cost to its downstream neighbours. The outgoing port's cost is never added by the sender.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Four-switch square with path costs">
<rect x="80" y="30" width="130" height="46" rx="8" fill="#fde68a"/><text x="145" y="51" text-anchor="middle" class="svg-ink" font-size="14">SWA root</text><text x="145" y="68" text-anchor="middle" class="svg-muted" font-size="12">cost 0</text>
<rect x="430" y="30" width="130" height="46" rx="8" fill="#bae6fd"/><text x="495" y="51" text-anchor="middle" class="svg-ink" font-size="14">SWB</text><text x="495" y="68" text-anchor="middle" class="svg-muted" font-size="12">root cost 2</text>
<rect x="80" y="190" width="130" height="46" rx="8" fill="#bae6fd"/><text x="145" y="211" text-anchor="middle" class="svg-ink" font-size="14">SWC</text><text x="145" y="228" text-anchor="middle" class="svg-muted" font-size="12">root cost 4</text>
<rect x="430" y="190" width="130" height="46" rx="8" fill="#bbf7d0"/><text x="495" y="211" text-anchor="middle" class="svg-ink" font-size="14">SWD</text><text x="495" y="228" text-anchor="middle" class="svg-muted" font-size="12">root cost 6</text>
<line x1="210" y1="53" x2="430" y2="53" stroke="#64748b" stroke-width="5"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="12">10G, cost 2</text>
<line x1="145" y1="76" x2="145" y2="190" stroke="#64748b" stroke-width="3"/><text x="152" y="138" class="svg-ink" font-size="12">1G, cost 4</text>
<line x1="495" y1="76" x2="495" y2="190" stroke="#64748b" stroke-width="3"/><text x="502" y="138" class="svg-ink" font-size="12">1G, cost 4</text>
<line x1="210" y1="213" x2="430" y2="213" stroke="#64748b" stroke-width="1.5"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="12">100M, cost 19</text>
<text x="320" y="262" text-anchor="middle" class="svg-accent" font-size="12">SWD: via SWB 2+4 = 6, via SWC 4+19 = 23</text>
</svg><p class="cap">Short-method costs on a square. Each switch keeps the lowest sum as its root path cost.</p></div>

<div class="eg"><p><b>Worked example: the square.</b> SWA is root (priority 4096). Links: SWA-SWB 10 Gbps, SWA-SWC 1 Gbps, SWB-SWD 1 Gbps, SWC-SWD 100 Mbps.</p>
<ul>
<li>SWB: via SWA directly, 0 + 2 = <b>2</b>. Via SWD it would be at least 6 + 4 = 10. Best is 2.</li>
<li>SWC: via SWA directly, 0 + 4 = <b>4</b>. Via SWD: 6 + 19 = 25. Best is 4.</li>
<li>SWD: BPDU from SWB says 2, add the 1 Gbps receiving port: 2 + 4 = <b>6</b>. BPDU from SWC says 4, add the 100 Mbps port: 4 + 19 = 23. Best is 6, through SWB.</li>
</ul>
<p>With the long method the numbers change (SWB 2,000; SWC 20,000; SWD 22,000 via SWB versus 220,000 via SWC) but the decisions are identical. Chapter 6 turns these costs into port roles.</p></div>

<pre class="out">SWD# show spanning-tree vlan 10 | include Root ID|Cost|Port
  Root ID    Priority    4106
<span class="hl">             Cost        6</span>
             Port        2 (GigabitEthernet0/1)</pre>

<div class="warn"><p><b>Common mistake.</b> Adding the cost of the port a BPDU <b>leaves</b> from. The sender advertises its own root path cost; the receiver adds its <b>incoming</b> port cost. Getting this backwards gives wrong answers on almost every exam question.</p></div>

<div class="exam"><p><b>Exam trap.</b> The root bridge is decided only by Bridge ID, never by cost or speed. And the short-method values to memorise are 100, 19, 4, 2 for 10M, 100M, 1G, 10G. The root's own root path cost is always 0.</p></div>

<div class="scn"><h4>The new 10G links nobody used</h4><p>A campus added a new distribution switch, DIST2, with 10 Gbps uplinks, but traffic from the access layer still crossed the old 1 Gbps path through DIST1. DIST2 had arrived with <code>pathcost method long</code> while every other switch used short. DIST2 received cost 0 from the root and added its long 10G cost, so it advertised 2,000. The access switches compared 2,000 + 2 through DIST2 with 4 + 4 = 8 through DIST1 and kept the slow path. Setting the same method on every switch fixed the choice.</p><p><b>Lesson:</b> path cost methods must match across the whole Layer 2 domain, or cost comparisons become meaningless.</p></div>

<div class="iv"><p class="q">"How does a switch calculate its root path cost?"</p><p>Strong answer: the root sends BPDUs with cost 0. Each switch that receives a BPDU adds the cost of the port it arrived on to the cost carried in the BPDU. It does this for every port that hears BPDUs, keeps the lowest total as its root path cost, and advertises that value downstream. Quote the short costs (100, 19, 4, 2) and mention the long method and that it must be consistent network-wide.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Root election: lowest Bridge ID wins, priority first, then MAC; cost and speed do not matter.</li>
<li>The root role is preemptive; a switch with a better BID takes over as soon as it is connected.</li>
<li>Short costs: 10M 100, 100M 19, 1G 4, 10G 2. Long costs: 20 Tbps divided by speed (1G = 20,000).</li>
<li>Root path cost = cost in the received BPDU + cost of the receiving port; the root advertises 0.</li>
<li>Use <code>spanning-tree pathcost method long</code> consistently on all switches or not at all.</li>
</ul></div>
`,hi:`
<p>Har map ko ek "aap yahan ho" point chahiye. Spanning tree ka reference point <b>root bridge</b> hai: woh ek switch jisse baaki har switch doori naapta hai. Root pata chalte hi "doori" bas switch aur root ke beech ke links ki <b>path costs</b> ka jod hai, jaise highway journey par toll charges jodna. Yeh chapter dono hisse cover karta hai: root kaun banta hai, aur toll kaise joda jaata hai.</p>

<h3>Step 1: root bridge elect karna</h3>
<ol>
<li>Jab switch boot hota hai, woh kisi ko nahi jaanta, isliye maan leta hai ki woh khud root hai. Woh BPDUs bhejta hai jismein Root Bridge ID <b>khud</b> hota hai, root path cost 0 ke saath.</li>
<li>Jab switch ko aisa BPDU milta hai jiska Root Bridge ID us root se <b>kam</b> (better) hai jise woh abhi maanta hai, us BPDU ko <b>superior</b> kehte hain. Switch claim karna band karta hai, naya root record karta hai, aur ab se apne BPDUs mein wahi root advertise karta hai.</li>
<li>Kuch hello intervals mein VLAN ka har switch <b>sabse kam Bridge ID</b> wale ek switch par agree kar leta hai.</li>
</ol>
<p>Sabse kam Bridge ID ka matlab: pehle <b>priority</b> compare karo (VLAN number ke saath); sirf agar priorities barabar hon, tab <b>MAC address</b> compare karo. Costs, speeds, uptime aur model root election mein koi role nahi nibhate.</p>

<div class="eg"><p><b>Worked example: defaults ke saath lab.</b> Teeno switches ki priority 32768 hai, isliye VLAN 10 mein teeno 32778 dikhate hain aur MAC decide karta hai:</p>
<table class="cmp"><tr><th>Switch</th><th>Priority (VLAN 10)</th><th>MAC</th><th>Result</th></tr>
<tr><td>SW1</td><td>32778</td><td>5254.<b>00</b>23.a200</td><td><b>Root</b> (sabse chhota MAC)</td></tr>
<tr><td>SW3</td><td>32778</td><td>5254.<b>fe</b>23.9f00</td><td>doosra sabse chhota</td></tr>
<tr><td>SW2</td><td>32778</td><td>5254.<b>ff</b>23.a000</td><td>sabse bada</td></tr>
</table>
<p>MACs ko left se hex digit by hex digit compare karo: 5254 barabar hai, phir 00 fe ko harata hai aur fe ff ko. Jab tak aap priority nahi badalte, SW1 har VLAN jeetta hai.</p></div>

<p>Root role <b>preemptive</b> hai: agar baad mein kam Bridge ID wala switch connect ho, woh turant root ban jaata hai aur poora tree dobara calculate hota hai. Isiliye priority 0 wala bhoola hua switch, ya bas bahut chhote MAC wala purana switch, root chura sakta hai (chapter 10 dikhata hai ki Root Guard aur BPDU Guard ise kaise rokte hain).</p>

<h3>Step 2: path cost, har link ka toll</h3>
<p>Har port ki ek STP <b>port cost</b> hoti hai jo uski speed se nikalti hai: tez link, kam cost. Do tables hain.</p>
<table class="cmp"><tr><th>Link speed</th><th>Short (16-bit, 802.1D-1998)</th><th>Long (32-bit, 802.1t)</th></tr>
<tr><td>10 Mbps</td><td>100</td><td>2,000,000</td></tr>
<tr><td>100 Mbps</td><td>19</td><td>200,000</td></tr>
<tr><td>1 Gbps</td><td>4</td><td>20,000</td></tr>
<tr><td>10 Gbps</td><td>2</td><td>2,000</td></tr>
<tr><td>40 Gbps</td><td>1 (alag nahi pehchan sakte)</td><td>500</td></tr>
<tr><td>100 Gbps</td><td>1 (alag nahi pehchan sakte)</td><td>200</td></tr>
</table>
<p>Short table tab design hui thi jab 1 Gbps tez maana jaata tha, isliye 10 Gbps se upar sab kuch sabse chhoti values mein simat jaata hai aur STP 100 Gbps path ko 40 Gbps wale se prefer nahi kar sakta. <b>Long</b> method (cost = 20 Tbps divided by link speed) ise theek karta hai. Cisco switches par aap ise globally chunte ho, aur yeh <b>har switch par same</b> hona chahiye:</p>
<pre class="code">SW1(config)# spanning-tree pathcost method long</pre>
<pre class="out">SW1# show spanning-tree summary | include Pathcost
<span class="hl">Configured Pathcost method used is short</span></pre>
<p>Zyada tar Catalyst IOS releases ka default short hai; kuch naye IOS XE releases ka default long hai, isliye hamesha check karo. Port-channel (agla module) ko uski combined bandwidth ke hisaab se cost milti hai, jo links bundle karne ki ek wajah hai.</p>

<h3>Step 3: root path cost jodna</h3>
<p>Rule precise hai: <b>root cost 0 advertise karta hai; jab switch kisi port par BPDU receive karta hai, woh us receiving port ki cost ko BPDU wali cost mein jodta hai</b>. Result us port ke through root path cost hai. Phir switch apni best root path cost apne downstream neighbours ko advertise karta hai. Bhejne wala kabhi outgoing port ki cost nahi jodta.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Path costs ke saath chaar-switch square">
<rect x="80" y="30" width="130" height="46" rx="8" fill="#fde68a"/><text x="145" y="51" text-anchor="middle" class="svg-ink" font-size="14">SWA root</text><text x="145" y="68" text-anchor="middle" class="svg-muted" font-size="12">cost 0</text>
<rect x="430" y="30" width="130" height="46" rx="8" fill="#bae6fd"/><text x="495" y="51" text-anchor="middle" class="svg-ink" font-size="14">SWB</text><text x="495" y="68" text-anchor="middle" class="svg-muted" font-size="12">root cost 2</text>
<rect x="80" y="190" width="130" height="46" rx="8" fill="#bae6fd"/><text x="145" y="211" text-anchor="middle" class="svg-ink" font-size="14">SWC</text><text x="145" y="228" text-anchor="middle" class="svg-muted" font-size="12">root cost 4</text>
<rect x="430" y="190" width="130" height="46" rx="8" fill="#bbf7d0"/><text x="495" y="211" text-anchor="middle" class="svg-ink" font-size="14">SWD</text><text x="495" y="228" text-anchor="middle" class="svg-muted" font-size="12">root cost 6</text>
<line x1="210" y1="53" x2="430" y2="53" stroke="#64748b" stroke-width="5"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="12">10G, cost 2</text>
<line x1="145" y1="76" x2="145" y2="190" stroke="#64748b" stroke-width="3"/><text x="152" y="138" class="svg-ink" font-size="12">1G, cost 4</text>
<line x1="495" y1="76" x2="495" y2="190" stroke="#64748b" stroke-width="3"/><text x="502" y="138" class="svg-ink" font-size="12">1G, cost 4</text>
<line x1="210" y1="213" x2="430" y2="213" stroke="#64748b" stroke-width="1.5"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="12">100M, cost 19</text>
<text x="320" y="262" text-anchor="middle" class="svg-accent" font-size="12">SWD: SWB se 2+4 = 6, SWC se 4+19 = 23</text>
</svg><p class="cap">Square par short-method costs. Har switch sabse kam jod ko apni root path cost rakhta hai.</p></div>

<div class="eg"><p><b>Worked example: square.</b> SWA root hai (priority 4096). Links: SWA-SWB 10 Gbps, SWA-SWC 1 Gbps, SWB-SWD 1 Gbps, SWC-SWD 100 Mbps.</p>
<ul>
<li>SWB: SWA se seedha, 0 + 2 = <b>2</b>. SWD ke through kam se kam 6 + 4 = 10 hota. Best 2 hai.</li>
<li>SWC: SWA se seedha, 0 + 4 = <b>4</b>. SWD ke through: 6 + 19 = 25. Best 4 hai.</li>
<li>SWD: SWB ka BPDU 2 kehta hai, 1 Gbps receiving port jodo: 2 + 4 = <b>6</b>. SWC ka BPDU 4 kehta hai, 100 Mbps port jodo: 4 + 19 = 23. Best 6 hai, SWB ke through.</li>
</ul>
<p>Long method ke saath numbers badalte hain (SWB 2,000; SWC 20,000; SWD SWB ke through 22,000 versus SWC ke through 220,000) lekin decisions bilkul same hain. Chapter 6 in costs ko port roles mein badalta hai.</p></div>

<pre class="out">SWD# show spanning-tree vlan 10 | include Root ID|Cost|Port
  Root ID    Priority    4106
<span class="hl">             Cost        6</span>
             Port        2 (GigabitEthernet0/1)</pre>

<div class="warn"><p><b>Common galti.</b> Us port ki cost jodna jahan se BPDU <b>nikalta</b> hai. Sender apni root path cost advertise karta hai; receiver apne <b>incoming</b> port ki cost jodta hai. Ise ulta karne se lagbhag har exam question ka jawab galat aata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Root bridge sirf Bridge ID se decide hota hai, kabhi cost ya speed se nahi. Aur yaad karne wali short-method values hain 10M, 100M, 1G, 10G ke liye 100, 19, 4, 2. Root ki apni root path cost hamesha 0 hoti hai.</p></div>

<div class="scn"><h4>Naye 10G links jinhe kisi ne use nahi kiya</h4><p>Ek campus ne 10 Gbps uplinks wala naya distribution switch DIST2 joda, lekin access layer ka traffic abhi bhi DIST1 ke through purane 1 Gbps path se ja raha tha. DIST2 <code>pathcost method long</code> ke saath aaya tha jabki baaki har switch short use kar raha tha. DIST2 ko root se cost 0 mili aur usne apni long 10G cost jodi, isliye usne 2,000 advertise kiya. Access switches ne DIST2 ke through 2,000 + 2 ko DIST1 ke through 4 + 4 = 8 se compare kiya aur slow path rakha. Har switch par same method set karne se choice theek hui.</p><p><b>Seekh:</b> path cost methods poore Layer 2 domain mein match hone chahiye, warna cost comparisons ka koi matlab nahi rehta.</p></div>

<div class="iv"><p class="q">"Switch apni root path cost kaise calculate karta hai?"</p><p>Strong answer: root cost 0 ke saath BPDUs bhejta hai. BPDU receive karne wala har switch us port ki cost jodta hai jis par woh aaya, BPDU mein aayi cost mein. Woh yeh har us port ke liye karta hai jo BPDUs sunta hai, sabse kam total ko apni root path cost rakhta hai, aur wahi value downstream advertise karta hai. Short costs (100, 19, 4, 2) batao aur long method ka zikr karo, aur yeh ki yeh network-wide consistent hona chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Root election: sabse kam Bridge ID jeetta hai, pehle priority, phir MAC; cost aur speed matter nahi karte.</li>
<li>Root role preemptive hai; better BID wala switch connect hote hi le leta hai.</li>
<li>Short costs: 10M 100, 100M 19, 1G 4, 10G 2. Long costs: 20 Tbps divided by speed (1G = 20,000).</li>
<li>Root path cost = received BPDU ki cost + receiving port ki cost; root 0 advertise karta hai.</li>
<li><code>spanning-tree pathcost method long</code> saare switches par consistently use karo, ya bilkul nahi.</li>
</ul></div>
`}};export{e as default};