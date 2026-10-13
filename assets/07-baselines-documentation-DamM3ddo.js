var e={id:`baselines-documentation`,h:{en:`Baselines, documentation and change management`,hi:`Baselines, documentation aur change management`},body:{en:`
<p>When you visit a doctor for the first time, she records your normal blood pressure, weight and pulse. Years later, a reading of 150 means something only because she knows that you are normally 120. Without the record, she cannot tell "high for you" from "normal for you". A network is the same. "R2 CPU is 45%" is meaningless unless you know that R2 normally runs at 5%. The <b>baseline</b> and the <b>documentation</b> are the network's medical record, and <b>change management</b> is how you avoid making the patient ill in the first place.</p>

<h3>What good documentation contains</h3>
<dl class="terms">
<dt>Physical topology</dt><dd>Devices, ports, cables, optics, patch panels, racks. Answers "which port on R2 goes to R3?"</dd>
<dt>Logical topology</dt><dd>Subnets, VLANs, routing domains, areas and AS numbers, redistribution points, VPN overlays, where ACLs and NAT sit. Answers "which path should traffic from 10.1.10.0/24 take?"</dd>
<dt>Addressing plan</dt><dd>Every subnet, its purpose and its gateway, including loopbacks and point-to-point links.</dd>
<dt>Configuration backups</dt><dd>The current and previous configurations of every device, ideally stored automatically.</dd>
<dt>Change log</dt><dd>Who changed what, when and why, with the change ticket number.</dd>
<dt>Contacts and contracts</dt><dd>Escalation paths, ISP circuit IDs, support contract numbers.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Baseline versus current">
<text x="20" y="24" class="svg-ink" font-size="13">R2 CPU, five-minute average</text>
<line x1="60" y1="170" x2="620" y2="170" stroke="#64748b" stroke-width="1.5"/><line x1="60" y1="40" x2="60" y2="170" stroke="#64748b" stroke-width="1.5"/>
<rect x="60" y="140" width="560" height="22" fill="#bbf7d0"/><text x="70" y="156" class="svg-muted" font-size="12">baseline band 3-8%</text>
<polyline points="60,152 140,150 220,153 300,149 380,151 420,150 460,100 500,95 540,98 580,96 620,97" fill="none" stroke="#64748b" stroke-width="2.5"/>
<text x="470" y="85" class="svg-accent" font-size="12">today 45%</text>
<text x="60" y="190" class="svg-muted" font-size="12">Mon</text><text x="300" y="190" class="svg-muted" font-size="12">Wed</text><text x="560" y="190" class="svg-muted" font-size="12">today</text>
</svg><p class="cap">A baseline turns a number into a finding: 45% is abnormal only because the normal band is known.</p></div>

<h3>What to baseline</h3>
<p>Record the normal state when the network is healthy, at both quiet and busy times, and again after every significant change:</p>
<ul>
<li><b>CPU</b>: <code>show processes cpu sorted</code> and <code>show processes cpu history</code>. The figure "5%/1%" means 5% total, of which 1% is interrupt-level work (packets switched or punted at interrupt level). High interrupt CPU points to traffic hitting the CPU; high process CPU points to a process such as a routing protocol or SNMP.</li>
<li><b>Memory</b>: <code>show processes memory sorted</code> and, on IOS XE, <code>show platform resources</code>.</li>
<li><b>Interfaces</b>: utilisation, errors, drops (<code>show interfaces</code>, SNMP graphs).</li>
<li><b>Control plane</b>: number of neighbours per protocol, number of routes per source (<code>show ip route summary</code>), BGP prefixes received per peer.</li>
<li><b>Performance</b>: normal latency and jitter from IP SLA, normal top talkers from NetFlow.</li>
</ul>
<pre class="out">R2# show ip route summary
IP routing table name is default (0x0)
IP routing table maximum-paths is 32
Route Source    Networks    Subnets     Replicates  Overhead    Memory (bytes)
application     0           0           0           0           0
connected       0           6           0           576         1824
static          0           0           0           0           0
ospf 1          0           4           0           384         1216
  Intra-area: 2 Inter-area: 0 External-1: 0 External-2: 2
  NSSA External-1: 0 NSSA External-2: 0
<span class="hl">eigrp 100       0           3           0           288         912</span>
internal        2                                               1208
Total           2           13          0           1248        5160</pre>

<h3>Automatic configuration backups</h3>
<p>IOS can keep its own configuration history with the <code>archive</code> feature. Every <code>write memory</code>, and once a day regardless, it saves a numbered copy:</p>
<pre class="code"><span class="c">! Keep up to 10 archived configs in flash, on every save and every 24 hours</span>
R2(config)# archive
R2(config-archive)# path flash:R2-cfg
R2(config-archive)# maximum 10
R2(config-archive)# write-memory
R2(config-archive)# time-period 1440</pre>
<pre class="out">R2# show archive
The maximum archive configurations allowed is 10.
There are currently 2 archive configurations saved.
The next archive file will be named flash:R2-cfg-3
 Archive #  Name
   1        flash:R2-cfg-1
<span class="hl">   2        flash:R2-cfg-2 &lt;- Most Recent</span>
   3
   4</pre>

<h3>Change management</h3>
<p>Many outages are self-inflicted. A simple change process prevents most of them:</p>
<ol>
<li><b>Request</b> with a reason and scope.</li>
<li><b>Risk assessment</b> and <b>peer review</b> of the exact commands.</li>
<li>A <b>maintenance window</b> agreed with the business.</li>
<li>An <b>implementation plan</b>, a <b>verification plan</b> (which show commands prove success) and a <b>rollback plan</b> (the exact commands or file to go back).</li>
<li>After the change: verify, update documentation and the baseline, close the ticket.</li>
</ol>
<p>In the next chapters you will see IOS tools that make the rollback plan fast and safe: <code>configure replace</code> and the rollback timer.</p>

<div class="eg"><p><b>Worked example.</b> The baseline for R2 records 13 subnets: 6 connected, 4 OSPF (2 intra-area, 2 external type 2) and 3 EIGRP. After a change, <code>show ip route summary</code> shows 11 subnets, with EIGRP at 1. Two EIGRP routes disappeared. Without a baseline, 11 routes looks perfectly normal. With the baseline you know within a minute that EIGRP lost two prefixes, and the next step is the routing-protocol checklist for EIGRP on R2 and R3.</p></div>

<div class="warn"><p><b>Common mistake.</b> Creating documentation once for a project and never updating it. A wrong diagram is worse than none, because engineers trust it. Make "update the diagram and baseline" a mandatory closing step of every change.</p></div>

<div class="exam"><p><b>Exam trap.</b> The <code>archive</code> <code>path</code>, <code>maximum</code>, <code>write-memory</code> and <code>time-period</code> commands create configuration <b>backups</b>; <code>archive log config</code> records <b>commands typed</b>. They are different features under the same <code>archive</code> mode, and questions sometimes mix them up.</p></div>

<div class="scn"><h4>The "normal" 60% CPU</h4><p>A NOC engineer saw a branch router at 60% CPU and opened a critical incident. Two engineers spent an hour looking for a routing loop. The baseline, found later on a shared drive, showed that this old router always ran at 55 to 65% because it performed software encryption for a legacy tunnel. Nothing had changed. The real problem the users reported, slow file transfers, was a duplex mismatch on the LAN switch, visible in the interface error counters that were far above their baseline of zero.</p><p><b>Lesson:</b> compare with the baseline before calling something abnormal, and look for what actually differs from normal.</p></div>

<div class="iv"><p class="q">"What is a network baseline and why does it matter for troubleshooting?"</p><p>Explain that a baseline is a record of normal behaviour: CPU and memory, interface utilisation and errors, neighbour and route counts, latency and top talkers, taken at quiet and busy times. It lets you tell abnormal from normal quickly, spot what changed, and plan capacity. Add that you refresh it after every significant change and store it with the documentation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Documentation: physical and logical topology, addressing plan, config backups, change log, contacts.</li>
<li>Baseline CPU, memory, interfaces, neighbour and route counts, latency and top talkers, and refresh it after changes.</li>
<li>In "5%/1%" CPU output the second number is interrupt-level load.</li>
<li><code>archive</code> with <code>path</code>, <code>maximum</code>, <code>write-memory</code>, <code>time-period</code> keeps automatic config backups.</li>
<li>Change management: request, review, window, implementation, verification and rollback plans, then update documentation.</li>
</ul></div>
`,hi:`
<p>Jab aap pehli baar doctor ke paas jaate ho, woh aapka normal blood pressure, weight aur pulse record karti hai. Saalon baad 150 ki reading ka matlab tabhi hai kyunki use pata hai ki aap normally 120 ho. Record ke bina woh "aapke liye high" aur "aapke liye normal" mein fark nahi kar sakti. Network bhi aisa hi hai. "R2 ka CPU 45% hai" bekaar hai jab tak aapko pata na ho ki R2 normally 5% par chalta hai. <b>Baseline</b> aur <b>documentation</b> network ka medical record hain, aur <b>change management</b> woh tarika hai jisse aap patient ko pehle hi beemar karne se bachte ho.</p>

<h3>Achhi documentation mein kya hota hai</h3>
<dl class="terms">
<dt>Physical topology</dt><dd>Devices, ports, cables, optics, patch panels, racks. Jawab deta hai "R2 ka kaunsa port R3 tak jaata hai?"</dd>
<dt>Logical topology</dt><dd>Subnets, VLANs, routing domains, areas aur AS numbers, redistribution points, VPN overlays, ACLs aur NAT kahan hain. Jawab deta hai "10.1.10.0/24 se traffic ko kaunsa path lena chahiye?"</dd>
<dt>Addressing plan</dt><dd>Har subnet, uska purpose aur uska gateway, loopbacks aur point-to-point links samet.</dd>
<dt>Configuration backups</dt><dd>Har device ki current aur pichhli configurations, ideally automatically store hui.</dd>
<dt>Change log</dt><dd>Kisne kya badla, kab aur kyun, change ticket number ke saath.</dd>
<dt>Contacts aur contracts</dt><dd>Escalation paths, ISP circuit IDs, support contract numbers.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Baseline versus current">
<text x="20" y="24" class="svg-ink" font-size="13">R2 CPU, five-minute average</text>
<line x1="60" y1="170" x2="620" y2="170" stroke="#64748b" stroke-width="1.5"/><line x1="60" y1="40" x2="60" y2="170" stroke="#64748b" stroke-width="1.5"/>
<rect x="60" y="140" width="560" height="22" fill="#bbf7d0"/><text x="70" y="156" class="svg-muted" font-size="12">baseline band 3-8%</text>
<polyline points="60,152 140,150 220,153 300,149 380,151 420,150 460,100 500,95 540,98 580,96 620,97" fill="none" stroke="#64748b" stroke-width="2.5"/>
<text x="470" y="85" class="svg-accent" font-size="12">aaj 45%</text>
<text x="60" y="190" class="svg-muted" font-size="12">Mon</text><text x="300" y="190" class="svg-muted" font-size="12">Wed</text><text x="560" y="190" class="svg-muted" font-size="12">aaj</text>
</svg><p class="cap">Baseline ek number ko finding mein badalta hai: 45% sirf isliye abnormal hai kyunki normal band pata hai.</p></div>

<h3>Kya baseline karein</h3>
<p>Jab network healthy ho tab normal state record karo, shaant aur busy dono samay par, aur har significant change ke baad dobara:</p>
<ul>
<li><b>CPU</b>: <code>show processes cpu sorted</code> aur <code>show processes cpu history</code>. "5%/1%" ka matlab 5% total, jismein se 1% interrupt-level kaam hai (interrupt level par switch ya punt hue packets). High interrupt CPU CPU tak pahunchte traffic ki taraf ishaara karta hai; high process CPU kisi process jaise routing protocol ya SNMP ki taraf.</li>
<li><b>Memory</b>: <code>show processes memory sorted</code> aur, IOS XE par, <code>show platform resources</code>.</li>
<li><b>Interfaces</b>: utilisation, errors, drops (<code>show interfaces</code>, SNMP graphs).</li>
<li><b>Control plane</b>: har protocol ke neighbours ki sankhya, har source ke routes ki sankhya (<code>show ip route summary</code>), har peer se receive hue BGP prefixes.</li>
<li><b>Performance</b>: IP SLA se normal latency aur jitter, NetFlow se normal top talkers.</li>
</ul>
<pre class="out">R2# show ip route summary
IP routing table name is default (0x0)
IP routing table maximum-paths is 32
Route Source    Networks    Subnets     Replicates  Overhead    Memory (bytes)
application     0           0           0           0           0
connected       0           6           0           576         1824
static          0           0           0           0           0
ospf 1          0           4           0           384         1216
  Intra-area: 2 Inter-area: 0 External-1: 0 External-2: 2
  NSSA External-1: 0 NSSA External-2: 0
<span class="hl">eigrp 100       0           3           0           288         912</span>
internal        2                                               1208
Total           2           13          0           1248        5160</pre>

<h3>Automatic configuration backups</h3>
<p>IOS <code>archive</code> feature se apni configuration history khud rakh sakta hai. Har <code>write memory</code> par, aur din mein ek baar vaise bhi, yeh ek numbered copy save karta hai:</p>
<pre class="code"><span class="c">! Flash mein 10 tak archived configs rakho, har save par aur har 24 ghante</span>
R2(config)# archive
R2(config-archive)# path flash:R2-cfg
R2(config-archive)# maximum 10
R2(config-archive)# write-memory
R2(config-archive)# time-period 1440</pre>
<pre class="out">R2# show archive
The maximum archive configurations allowed is 10.
There are currently 2 archive configurations saved.
The next archive file will be named flash:R2-cfg-3
 Archive #  Name
   1        flash:R2-cfg-1
<span class="hl">   2        flash:R2-cfg-2 &lt;- Most Recent</span>
   3
   4</pre>

<h3>Change management</h3>
<p>Bahut saare outages khud ke banaye hote hain. Ek simple change process zyada tar ko rok deta hai:</p>
<ol>
<li>Reason aur scope ke saath <b>request</b>.</li>
<li>Exact commands ka <b>risk assessment</b> aur <b>peer review</b>.</li>
<li>Business ke saath tay ek <b>maintenance window</b>.</li>
<li>Ek <b>implementation plan</b>, ek <b>verification plan</b> (kaunse show commands success sabit karte hain) aur ek <b>rollback plan</b> (wapas jaane ke exact commands ya file).</li>
<li>Change ke baad: verify karo, documentation aur baseline update karo, ticket band karo.</li>
</ol>
<p>Agle chapters mein aap IOS tools dekhoge jo rollback plan ko tez aur safe banate hain: <code>configure replace</code> aur rollback timer.</p>

<div class="eg"><p><b>Worked example.</b> R2 ki baseline 13 subnets record karti hai: 6 connected, 4 OSPF (2 intra-area, 2 external type 2) aur 3 EIGRP. Ek change ke baad <code>show ip route summary</code> 11 subnets dikhata hai, EIGRP 1 par. Do EIGRP routes gayab ho gaye. Baseline ke bina 11 routes bilkul normal lagta hai. Baseline ke saath aapko ek minute mein pata chal jaata hai ki EIGRP ne do prefixes kho diye, aur agla step R2 aur R3 par EIGRP ke liye routing-protocol checklist hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Ek project ke liye documentation ek baar banana aur kabhi update na karna. Galat diagram na hone se bura hai, kyunki engineers us par bharosa karte hain. "Diagram aur baseline update karo" ko har change ka mandatory closing step banao.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>archive</code> ke <code>path</code>, <code>maximum</code>, <code>write-memory</code> aur <code>time-period</code> commands configuration <b>backups</b> banate hain; <code>archive log config</code> <b>type kiye gaye commands</b> record karta hai. Yeh same <code>archive</code> mode ke neeche alag features hain, aur questions kabhi kabhi inhe mila dete hain.</p></div>

<div class="scn"><h4>"Normal" 60% CPU</h4><p>Ek NOC engineer ne ek branch router ko 60% CPU par dekha aur critical incident khol diya. Do engineers ne ek ghanta routing loop dhoondhne mein lagaya. Baseline, jo baad mein shared drive par mili, dikhati thi ki yeh purana router hamesha 55 se 65% par chalta tha kyunki woh ek legacy tunnel ke liye software encryption karta tha. Kuch nahi badla tha. Users ki asli problem, slow file transfers, LAN switch par duplex mismatch tha, jo interface error counters mein dikh raha tha jo apni zero ki baseline se kaafi upar the.</p><p><b>Seekh:</b> kisi cheez ko abnormal kehne se pehle baseline se compare karo, aur dekho ki normal se asal mein kya alag hai.</p></div>

<div class="iv"><p class="q">"Network baseline kya hai aur troubleshooting ke liye kyun matter karti hai?"</p><p>Samjhao ki baseline normal behaviour ka record hai: CPU aur memory, interface utilisation aur errors, neighbour aur route counts, latency aur top talkers, shaant aur busy samay par liye gaye. Yeh abnormal ko normal se jaldi alag karne, kya badla yeh pakadne, aur capacity plan karne deti hai. Jodo ki aap ise har significant change ke baad refresh karte ho aur documentation ke saath store karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Documentation: physical aur logical topology, addressing plan, config backups, change log, contacts.</li>
<li>CPU, memory, interfaces, neighbour aur route counts, latency aur top talkers baseline karo, aur changes ke baad refresh karo.</li>
<li>"5%/1%" CPU output mein doosra number interrupt-level load hai.</li>
<li><code>path</code>, <code>maximum</code>, <code>write-memory</code>, <code>time-period</code> ke saath <code>archive</code> automatic config backups rakhta hai.</li>
<li>Change management: request, review, window, implementation, verification aur rollback plans, phir documentation update.</li>
</ul></div>
`}};export{e as default};