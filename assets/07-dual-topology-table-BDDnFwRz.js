var e={id:`dual`,h:{en:`DUAL in depth: FD, RD, successors and feasible successors`,hi:`DUAL gehraai se: FD, RD, successors aur feasible successors`},body:{en:`
<p>You are driving to the airport and your GPS shows the best route. A good GPS also keeps a backup route in mind. But imagine a "backup" that quietly sends you around the block and back onto the road you just left: that is a loop, and it is worse than no backup. <b>DUAL</b> (Diffusing Update Algorithm) only accepts a backup when it can <b>prove</b>, from numbers alone, that the backup does not lead back through you. This chapter teaches you to make that proof yourself, in seconds, from a topology table.</p>

<h3>Four terms, precisely</h3>
<dl class="terms">
<dt>Reported distance (RD)</dt><dd>Also called <b>advertised distance (AD)</b>. The neighbour's own metric to the destination, as it told you in its Update.</dd>
<dt>Feasible distance (FD)</dt><dd>Your best (lowest) total metric to the destination: the neighbour's RD plus the cost of reaching that neighbour. Strictly, it is the lowest metric since the route last became passive, which is why it can briefly differ from the current metric during changes.</dd>
<dt>Successor</dt><dd>The neighbour on the path with the lowest total metric. Its route goes into the routing table. There can be several successors if metrics tie.</dd>
<dt>Feasible successor (FS)</dt><dd>A neighbour that meets the <b>feasibility condition</b>: <b>RD &lt; FD</b>. It is a guaranteed loop-free backup, kept ready in the topology table.</dd>
</dl>

<h3>Why RD &lt; FD proves there is no loop</h3>
<p>Suppose neighbour N were routing to the destination <b>through you</b>. Then N's distance would be your distance plus at least the cost of the link to you, so N's RD would be <b>greater</b> than your metric, which is at least your FD. So if N reports a distance strictly <b>smaller</b> than your FD, its path cannot pass through you. That is the whole proof, and it needs no map of the network.</p>
<p>The condition is <b>sufficient</b>, not necessary. A neighbour can have a perfectly loop-free path and still fail the test, for example when its RD equals or exceeds your FD. DUAL is deliberately conservative: it would rather miss a backup than accept a loop.</p>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Router R1 with four neighbours to network X">
<rect x="30" y="118" width="90" height="46" rx="8" fill="#bbf7d0"/><text x="75" y="146" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="520" y="118" width="100" height="46" rx="8" fill="#fde68a"/><text x="570" y="146" text-anchor="middle" class="svg-ink" font-size="13">Network X</text>
<rect x="260" y="14" width="110" height="40" rx="8" fill="#bae6fd"/><text x="315" y="39" text-anchor="middle" class="svg-ink" font-size="12">A: 2000 / 1500</text>
<rect x="260" y="84" width="110" height="40" rx="8" fill="#bae6fd"/><text x="315" y="109" text-anchor="middle" class="svg-ink" font-size="12">B: 2500 / 1000</text>
<rect x="260" y="154" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="315" y="179" text-anchor="middle" class="svg-ink" font-size="12">C: 3000 / 2000</text>
<rect x="260" y="224" width="110" height="40" rx="8" fill="#bae6fd"/><text x="315" y="249" text-anchor="middle" class="svg-ink" font-size="12">D: 4500 / 1800</text>
<line x1="120" y1="130" x2="260" y2="34" stroke="#64748b" stroke-width="2"/><line x1="120" y1="136" x2="260" y2="104" stroke="#64748b" stroke-width="2"/><line x1="120" y1="146" x2="260" y2="174" stroke="#64748b" stroke-width="2"/><line x1="120" y1="152" x2="260" y2="244" stroke="#64748b" stroke-width="2"/>
<line x1="370" y1="34" x2="520" y2="130" stroke="#64748b" stroke-width="2"/><line x1="370" y1="104" x2="520" y2="136" stroke="#64748b" stroke-width="2"/><line x1="370" y1="174" x2="520" y2="146" stroke="#64748b" stroke-width="2"/><line x1="370" y1="244" x2="520" y2="152" stroke="#64748b" stroke-width="2"/>
<text x="445" y="30" class="svg-accent" font-size="12">successor</text><text x="445" y="100" class="svg-accent" font-size="12">FS</text><text x="445" y="200" class="svg-muted" font-size="12">not FS</text><text x="445" y="262" class="svg-accent" font-size="12">FS</text>
</svg><p class="cap">Each box shows total metric / reported distance through that neighbour. FD = 2000.</p></div>

<div class="eg"><p><b>Worked example 1: four neighbours.</b> R1 learns Network X from four neighbours (total / RD): A 2000/1500, B 2500/1000, C 3000/2000, D 4500/1800.</p>
<ol>
<li>Lowest total is A (2000), so <b>A is the successor</b> and <b>FD = 2000</b>.</li>
<li>B: RD 1000 &lt; 2000, so <b>B is an FS</b>.</li>
<li>C: RD 2000 is <b>equal</b> to FD, not less, so <b>C is not an FS</b>.</li>
<li>D: RD 1800 &lt; 2000, so <b>D is an FS</b>, even though its total metric (4500) is the worst of all.</li>
</ol>
<p>The lesson hidden here: the feasibility condition never looks at the total metric through the neighbour. It compares the neighbour's <b>RD</b> with your <b>FD</b>.</p></div>

<h3>The topology table of lab 1</h3>
<pre class="out">R1# show ip eigrp topology
EIGRP-IPv4 Topology Table for AS(100)/ID(1.1.1.1)
Codes: P - Passive, A - Active, U - Update, Q - Query, R - Reply,
       r - reply Status, s - sia Status

<span class="hl">P 192.168.30.0/24, 1 successors, FD is 3328
        via 10.0.12.2 (3328/3072), GigabitEthernet0/0
        via 10.0.13.3 (256512/2816), GigabitEthernet0/1</span>
P 2.2.2.2/32, 1 successors, FD is 130816
        via 10.0.12.2 (130816/128256), GigabitEthernet0/0
P 3.3.3.3/32, 1 successors, FD is 131072
        via 10.0.12.2 (131072/130816), GigabitEthernet0/0
        via 10.0.13.3 (384256/128256), GigabitEthernet0/1
P 192.168.10.0/24, 1 successors, FD is 2816
        via Connected, GigabitEthernet0/2</pre>
<p>Each <code>(a/b)</code> pair is (total metric through that neighbour / its RD). <code>P</code> means <b>Passive</b>: stable, no computation running. The first line under each prefix is the successor; the others are feasible successors. For 192.168.30.0/24, 2816 &lt; 3328, so 10.0.13.3 is the FS that lab 1 asks you to find.</p>

<h3>What the normal view hides</h3>
<p><code>show ip eigrp topology</code> shows only successors and feasible successors. To see every path, add <code>all-links</code>:</p>
<pre class="out">R1# show ip eigrp topology all-links
P 2.2.2.2/32, 1 successors, FD is 130816, serno 3
        via 10.0.12.2 (130816/128256), GigabitEthernet0/0
        <span class="hl">via 10.0.13.3 (384512/130816), GigabitEthernet0/1</span></pre>

<div class="eg"><p><b>Worked example 2: a loop-free path that is not an FS.</b> For R2's loopback 2.2.2.2, R3 reports 256 x (10 + 1 + 500) = <b>130816</b>, and R1's FD is also <b>130816</b>. Equal is not less, so R3 fails the feasibility condition, although R3's path (straight to R2) obviously does not loop through R1. That is why it appears only with <code>all-links</code>.</p></div>

<h3>When the successor fails</h3>
<ul>
<li><b>An FS exists</b>: DUAL performs a <b>local computation</b>. It promotes the FS to successor immediately, installs it in the routing table, and sends Updates to its neighbours. No Queries, no waiting. If the R1 to R2 link fails, 192.168.30.0/24 moves to 10.0.13.3 at once with a new FD of 256512.</li>
<li><b>No FS exists</b>: the route goes <b>Active</b> and DUAL starts a <b>diffusing computation</b>: it sends Queries and must wait for every Reply. For 2.2.2.2, R1 queries R3, R3 replies with its own working path via R2, and R1 installs 2.2.2.2 via R3 with metric 384512. Chapter 8 explains this process and how it can go wrong.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Expecting a feasible successor to carry traffic. An FS sits in the topology table only. It enters the routing table when the successor fails, or when you configure <code>variance</code> (chapter 9).</p></div>

<div class="exam"><p><b>Exam trap.</b> The condition is strictly <b>RD &lt; FD</b>. An RD equal to the FD fails. The exam often gives you a path with a huge total metric but a small RD; it is still an FS. And a path with a small total metric but RD above FD cannot exist, because a total metric is always larger than the RD it includes.</p></div>

<div class="scn"><h4>The backup that failed over slowly</h4><p>A hospital had two WAN paths to its imaging servers. When the primary failed, EIGRP took several seconds to converge instead of milliseconds, and some sessions timed out. <code>show ip eigrp topology all-links</code> showed the backup neighbour's RD was slightly higher than the FD, so it was not a feasible successor and every failure triggered Queries across the WAN. Lowering the delay on the backup router's server-facing interface reduced its RD below the FD. The backup became an FS and failover dropped to under a second.</p><p><b>Lesson:</b> if you want instant failover, check that your backup path is a feasible successor, not just a second path.</p></div>

<div class="iv"><p class="q">"Explain the feasibility condition and why it guarantees a loop-free backup."</p><p>Strong answer: a neighbour is a feasible successor if its reported distance is strictly less than my feasible distance. If that neighbour were routing through me, its distance would have to be at least my distance plus the link between us, which is more than my FD. So RD &lt; FD proves its path does not use me. It is sufficient but not necessary; some loop-free paths fail it. Then walk through a quick example with numbers such as 2816 &lt; 3328.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RD = neighbour's own metric; FD = your best total metric; successor = best neighbour.</li>
<li>Feasibility condition: RD strictly less than FD. It compares RD with FD, never the total metric.</li>
<li><code>show ip eigrp topology</code> lists successors and FSs; <code>all-links</code> shows every path.</li>
<li>Successor fails with an FS present: instant local switch. Without an FS: route goes Active and queries.</li>
<li>An FS is a backup only; it forwards traffic only after failover or with <code>variance</code>.</li>
</ul></div>
`,hi:`
<p>Aap airport ja rahe ho aur GPS best route dikhata hai. Achha GPS ek backup route bhi dimaag mein rakhta hai. Lekin socho ek aisa "backup" jo chupchaap aapko block ke chakkar lagwakar wapas usi road par le aaye jise aapne abhi chhoda: yeh loop hai, aur yeh backup na hone se bhi bura hai. <b>DUAL</b> (Diffusing Update Algorithm) backup sirf tab accept karta hai jab woh sirf numbers se <b>prove</b> kar sake ki backup aapke through wapas nahi jaata. Yeh chapter aapko sikhata hai ki topology table se yeh proof seconds mein khud kaise karo.</p>

<h3>Chaar terms, bilkul sahi</h3>
<dl class="terms">
<dt>Reported distance (RD)</dt><dd>Ise <b>advertised distance (AD)</b> bhi kehte hain. Destination tak neighbour ka apna metric, jaisa usne apne Update mein bataya.</dd>
<dt>Feasible distance (FD)</dt><dd>Destination tak aapka best (sabse kam) total metric: neighbour ka RD plus us neighbour tak pahunchne ka cost. Strictly, yeh route ke pichhli baar passive hone ke baad ka sabse kam metric hai, isliye changes ke dauraan yeh current metric se thodi der ke liye alag ho sakta hai.</dd>
<dt>Successor</dt><dd>Sabse kam total metric wale path ka neighbour. Iska route routing table mein jaata hai. Metrics tie hon to kai successors ho sakte hain.</dd>
<dt>Feasible successor (FS)</dt><dd>Woh neighbour jo <b>feasibility condition</b> poori kare: <b>RD &lt; FD</b>. Yeh guaranteed loop-free backup hai, topology table mein ready rakha hua.</dd>
</dl>

<h3>RD &lt; FD kyun prove karta hai ki loop nahi hai</h3>
<p>Maan lo neighbour N destination tak <b>aapke through</b> route kar raha hai. To N ka distance aapka distance plus aap tak ke link ka kam se kam cost hoga, isliye N ka RD aapke metric se <b>bada</b> hoga, jo kam se kam aapke FD jitna hai. Isliye agar N aapke FD se strictly <b>chhota</b> distance report kare, to uska path aapke through nahi jaa sakta. Yahi poora proof hai, aur isme network ke map ki zaroorat nahi.</p>
<p>Yeh condition <b>sufficient</b> hai, necessary nahi. Ek neighbour ke paas bilkul loop-free path ho sakta hai aur phir bhi woh test fail kar sakta hai, jaise jab uska RD aapke FD ke barabar ya zyada ho. DUAL jaan-boojhkar conservative hai: woh loop accept karne se behtar backup miss karna samajhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Router R1 ke network X tak chaar neighbours">
<rect x="30" y="118" width="90" height="46" rx="8" fill="#bbf7d0"/><text x="75" y="146" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="520" y="118" width="100" height="46" rx="8" fill="#fde68a"/><text x="570" y="146" text-anchor="middle" class="svg-ink" font-size="13">Network X</text>
<rect x="260" y="14" width="110" height="40" rx="8" fill="#bae6fd"/><text x="315" y="39" text-anchor="middle" class="svg-ink" font-size="12">A: 2000 / 1500</text>
<rect x="260" y="84" width="110" height="40" rx="8" fill="#bae6fd"/><text x="315" y="109" text-anchor="middle" class="svg-ink" font-size="12">B: 2500 / 1000</text>
<rect x="260" y="154" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="315" y="179" text-anchor="middle" class="svg-ink" font-size="12">C: 3000 / 2000</text>
<rect x="260" y="224" width="110" height="40" rx="8" fill="#bae6fd"/><text x="315" y="249" text-anchor="middle" class="svg-ink" font-size="12">D: 4500 / 1800</text>
<line x1="120" y1="130" x2="260" y2="34" stroke="#64748b" stroke-width="2"/><line x1="120" y1="136" x2="260" y2="104" stroke="#64748b" stroke-width="2"/><line x1="120" y1="146" x2="260" y2="174" stroke="#64748b" stroke-width="2"/><line x1="120" y1="152" x2="260" y2="244" stroke="#64748b" stroke-width="2"/>
<line x1="370" y1="34" x2="520" y2="130" stroke="#64748b" stroke-width="2"/><line x1="370" y1="104" x2="520" y2="136" stroke="#64748b" stroke-width="2"/><line x1="370" y1="174" x2="520" y2="146" stroke="#64748b" stroke-width="2"/><line x1="370" y1="244" x2="520" y2="152" stroke="#64748b" stroke-width="2"/>
<text x="445" y="30" class="svg-accent" font-size="12">successor</text><text x="445" y="100" class="svg-accent" font-size="12">FS</text><text x="445" y="200" class="svg-muted" font-size="12">FS nahi</text><text x="445" y="262" class="svg-accent" font-size="12">FS</text>
</svg><p class="cap">Har box us neighbour ke through total metric / reported distance dikhata hai. FD = 2000.</p></div>

<div class="eg"><p><b>Worked example 1: chaar neighbours.</b> R1 Network X ko chaar neighbours se seekhta hai (total / RD): A 2000/1500, B 2500/1000, C 3000/2000, D 4500/1800.</p>
<ol>
<li>Sabse kam total A (2000) hai, isliye <b>A successor hai</b> aur <b>FD = 2000</b>.</li>
<li>B: RD 1000 &lt; 2000, isliye <b>B FS hai</b>.</li>
<li>C: RD 2000 FD ke <b>barabar</b> hai, kam nahi, isliye <b>C FS nahi hai</b>.</li>
<li>D: RD 1800 &lt; 2000, isliye <b>D FS hai</b>, bhale hi uska total metric (4500) sabse kharab hai.</li>
</ol>
<p>Yahan chhupi seekh: feasibility condition kabhi neighbour ke through total metric nahi dekhti. Yeh neighbour ke <b>RD</b> ko aapke <b>FD</b> se compare karti hai.</p></div>

<h3>Lab 1 ki topology table</h3>
<pre class="out">R1# show ip eigrp topology
EIGRP-IPv4 Topology Table for AS(100)/ID(1.1.1.1)
Codes: P - Passive, A - Active, U - Update, Q - Query, R - Reply,
       r - reply Status, s - sia Status

<span class="hl">P 192.168.30.0/24, 1 successors, FD is 3328
        via 10.0.12.2 (3328/3072), GigabitEthernet0/0
        via 10.0.13.3 (256512/2816), GigabitEthernet0/1</span>
P 2.2.2.2/32, 1 successors, FD is 130816
        via 10.0.12.2 (130816/128256), GigabitEthernet0/0
P 3.3.3.3/32, 1 successors, FD is 131072
        via 10.0.12.2 (131072/130816), GigabitEthernet0/0
        via 10.0.13.3 (384256/128256), GigabitEthernet0/1
P 192.168.10.0/24, 1 successors, FD is 2816
        via Connected, GigabitEthernet0/2</pre>
<p>Har <code>(a/b)</code> pair (us neighbour ke through total metric / uska RD) hai. <code>P</code> ka matlab <b>Passive</b>: stable, koi computation nahi chal raha. Har prefix ke neeche pehli line successor hai; baaki feasible successors hain. 192.168.30.0/24 ke liye 2816 &lt; 3328, isliye 10.0.13.3 woh FS hai jo lab 1 aapse dhoondhwata hai.</p>

<h3>Normal view kya chhupata hai</h3>
<p><code>show ip eigrp topology</code> sirf successors aur feasible successors dikhata hai. Har path dekhne ke liye <code>all-links</code> jodo:</p>
<pre class="out">R1# show ip eigrp topology all-links
P 2.2.2.2/32, 1 successors, FD is 130816, serno 3
        via 10.0.12.2 (130816/128256), GigabitEthernet0/0
        <span class="hl">via 10.0.13.3 (384512/130816), GigabitEthernet0/1</span></pre>

<div class="eg"><p><b>Worked example 2: loop-free path jo FS nahi hai.</b> R2 ke loopback 2.2.2.2 ke liye R3 report karta hai 256 x (10 + 1 + 500) = <b>130816</b>, aur R1 ka FD bhi <b>130816</b> hai. Barabar, kam nahi, isliye R3 feasibility condition fail karta hai, jabki R3 ka path (seedha R2 tak) saaf taur par R1 ke through loop nahi karta. Isi wajah se yeh sirf <code>all-links</code> ke saath dikhta hai.</p></div>

<h3>Jab successor fail hota hai</h3>
<ul>
<li><b>FS maujood hai</b>: DUAL <b>local computation</b> karta hai. FS ko turant successor bana deta hai, routing table mein install karta hai, aur neighbours ko Updates bhejta hai. Koi Queries nahi, koi wait nahi. Agar R1 se R2 ka link fail ho, to 192.168.30.0/24 turant 256512 ke naye FD ke saath 10.0.13.3 par chala jaata hai.</li>
<li><b>FS nahi hai</b>: route <b>Active</b> ho jaata hai aur DUAL <b>diffusing computation</b> shuru karta hai: Queries bhejta hai aur har Reply ka wait karna padta hai. 2.2.2.2 ke liye R1, R3 ko query karta hai, R3 R2 wale apne chalte path ke saath reply karta hai, aur R1 2.2.2.2 ko R3 ke through metric 384512 ke saath install karta hai. Chapter 8 yeh process aur isme kya galat ho sakta hai, samjhata hai.</li>
</ul>

<div class="warn"><p><b>Common galti.</b> Feasible successor se traffic le jaane ki umeed karna. FS sirf topology table mein baitha rehta hai. Yeh routing table mein tab aata hai jab successor fail ho, ya jab aap <code>variance</code> configure karo (chapter 9).</p></div>

<div class="exam"><p><b>Exam trap.</b> Condition strictly <b>RD &lt; FD</b> hai. FD ke barabar RD fail hota hai. Exam aksar aisa path deta hai jiska total metric bahut bada lekin RD chhota ho; woh phir bhi FS hai. Aur aisa path jiska total metric chhota ho lekin RD FD se upar ho, exist hi nahi kar sakta, kyunki total metric hamesha usme shaamil RD se bada hota hai.</p></div>

<div class="scn"><h4>Backup jo dheere failover hua</h4><p>Ek hospital ke paas imaging servers tak do WAN paths the. Primary fail hone par EIGRP ko milliseconds ki jagah kai seconds lage converge hone mein, aur kuch sessions time out ho gaye. <code>show ip eigrp topology all-links</code> ne dikhaya ki backup neighbour ka RD FD se thoda zyada tha, isliye woh feasible successor nahi tha aur har failure WAN ke paar Queries trigger karta tha. Backup router ke server-facing interface ka delay kam karne se uska RD FD se neeche aa gaya. Backup FS ban gaya aur failover ek second se kam ho gaya.</p><p><b>Seekh:</b> agar instant failover chahiye, to check karo ki aapka backup path feasible successor hai, sirf doosra path nahi.</p></div>

<div class="iv"><p class="q">"Feasibility condition samjhao aur yeh loop-free backup ki guarantee kyun deti hai."</p><p>Strong answer: neighbour feasible successor hai agar uska reported distance mere feasible distance se strictly kam ho. Agar woh neighbour mere through route kar raha hota, to uska distance kam se kam mera distance plus hamare beech ka link hota, jo mere FD se zyada hai. Isliye RD &lt; FD prove karta hai ki uska path mujhe use nahi karta. Yeh sufficient hai, necessary nahi; kuch loop-free paths ise fail karte hain. Phir 2816 &lt; 3328 jaise numbers ke saath ek jaldi sa example walk karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RD = neighbour ka apna metric; FD = aapka best total metric; successor = best neighbour.</li>
<li>Feasibility condition: RD strictly FD se kam. Yeh RD ko FD se compare karti hai, total metric ko kabhi nahi.</li>
<li><code>show ip eigrp topology</code> successors aur FSs dikhata hai; <code>all-links</code> har path dikhata hai.</li>
<li>FS ke hote successor fail ho: turant local switch. FS ke bina: route Active hota hai aur query karta hai.</li>
<li>FS sirf backup hai; yeh sirf failover ke baad ya <code>variance</code> ke saath traffic forward karta hai.</li>
</ul></div>
`}};export{e as default};