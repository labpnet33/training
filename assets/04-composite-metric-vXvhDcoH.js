var e={id:`composite-metric`,h:{en:`The composite metric: bandwidth, delay and K values`,hi:`Composite metric: bandwidth, delay aur K values`},body:{en:`
<p>Imagine planning a truck journey from Jaipur to Noida. Two things decide how good a route is. First, the <b>narrowest bridge</b> on the way limits how much the truck can carry, no matter how wide the rest of the highway is. Second, every <b>toll booth and traffic light</b> adds a few minutes, and those minutes add up. EIGRP's default metric is exactly this: the <b>slowest link</b> on the path (bandwidth) plus the <b>sum of delays</b> of every link.</p>

<h3>What an EIGRP update carries</h3>
<p>Each route in an Update carries a small vector of values: minimum bandwidth, total delay, reliability, load, minimum MTU and hop count. Only the first four can enter the metric, and by default only <b>bandwidth</b> and <b>delay</b> do. MTU and hop count are carried for information (hop count also has a limit, 100 by default).</p>

<h3>The full formula and the K values</h3>
<p>The <b>K values</b> are weights that switch each part of the formula on or off:</p>
<pre class="code">metric = 256 x [ K1 x BW + (K2 x BW) / (256 - load) + K3 x DELAY ] x [ K5 / (reliability + K4) ]

<span class="c">! BW    = 10^7 / slowest bandwidth on the path, in Kbps (integer)</span>
<span class="c">! DELAY = sum of interface delays on the path, in tens of microseconds</span>
<span class="c">! if K5 = 0, the last bracket is ignored (treated as 1)</span>
<span class="c">! defaults: K1=1 K2=0 K3=1 K4=0 K5=0</span></pre>
<p>With the defaults, everything collapses to the formula you will use every day:</p>
<pre class="code">metric = 256 x ( 10^7 / min-bandwidth-Kbps  +  total-delay-in-tens-of-microseconds )</pre>
<p>Cisco recommends leaving K values at the defaults. Load and reliability change from moment to moment; if they were in the metric, routes would flap whenever a link got busy. And, as you saw in chapter 3, K values must match between neighbours.</p>

<h3>Default interface values</h3>
<table class="cmp"><tr><th>Interface</th><th>Bandwidth (Kbps)</th><th>Delay (microseconds)</th></tr>
<tr><td>GigabitEthernet and TenGigabitEthernet</td><td>1,000,000 / 10,000,000</td><td>10</td></tr>
<tr><td>FastEthernet</td><td>100,000</td><td>100</td></tr>
<tr><td>Ethernet (10 Mbps)</td><td>10,000</td><td>1000</td></tr>
<tr><td>Serial (default)</td><td>1,544</td><td>20,000</td></tr>
<tr><td>Loopback</td><td>8,000,000</td><td>5000</td></tr>
</table>
<p>Delays are added for every <b>outgoing</b> interface toward the destination, including the interface on the far router where the destination network lives.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Metric calculation for 192.168.30.0/24">
<rect x="20" y="100" width="90" height="46" rx="8" fill="#bbf7d0"/><text x="65" y="128" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="270" y="20" width="90" height="46" rx="8" fill="#bae6fd"/><text x="315" y="48" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<rect x="430" y="100" width="90" height="46" rx="8" fill="#ddd6fe"/><text x="475" y="128" text-anchor="middle" class="svg-ink" font-size="14">R3</text>
<rect x="540" y="100" width="90" height="46" rx="8" fill="#fde68a"/><text x="585" y="122" text-anchor="middle" class="svg-ink" font-size="12">LAN</text><text x="585" y="138" text-anchor="middle" class="svg-muted" font-size="12">.30.0/24</text>
<line x1="110" y1="110" x2="270" y2="50" stroke="#64748b" stroke-width="3"/><text x="150" y="68" class="svg-muted" font-size="12">1G, 10 us</text>
<line x1="360" y1="50" x2="430" y2="110" stroke="#64748b" stroke-width="3"/><text x="400" y="68" class="svg-muted" font-size="12">1G, 10 us</text>
<line x1="520" y1="123" x2="540" y2="123" stroke="#64748b" stroke-width="3"/><text x="530" y="170" text-anchor="middle" class="svg-muted" font-size="12">1G, 10 us</text>
<line x1="110" y1="140" x2="430" y2="140" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6 4"/><text x="270" y="160" text-anchor="middle" class="svg-accent" font-size="12">10 Mbps, 10 us</text>
<text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">via R2: 256 x (10 + 3) = 3328</text>
<text x="320" y="235" text-anchor="middle" class="svg-ink" font-size="13">via slow link: 256 x (1000 + 2) = 256512</text>
</svg><p class="cap">Lab 1: the bandwidth term takes the slowest link, the delay term adds every hop.</p></div>

<div class="eg"><p><b>Worked example: lab 1, R1 to 192.168.30.0/24.</b></p>
<ol>
<li><b>Via R2.</b> Links: R1 Gi0/0, R2 Gi0/1, R3 Gi0/2 (the LAN). Slowest bandwidth 1,000,000 Kbps, so BW = 10^7 / 1,000,000 = <b>10</b>. Delay 10 + 10 + 10 = 30 microseconds = <b>3</b> tens. Metric = 256 x (10 + 3) = <b>3328</b>.</li>
<li><b>R2's own distance</b> (what R2 reports to R1): R2 Gi0/1 and R3 Gi0/2, so 256 x (10 + 2) = <b>3072</b>.</li>
<li><b>Via the backup link.</b> R1 Gi0/1 has <code>bandwidth 10000</code>, so the slowest link is 10,000 Kbps: BW = 10^7 / 10,000 = <b>1000</b>. Delay: R1 Gi0/1 (10) + R3 Gi0/2 (10) = 20 microseconds = <b>2</b>. Metric = 256 x (1000 + 2) = <b>256512</b>.</li>
<li><b>R3's own distance</b> to its LAN: 256 x (10 + 1) = <b>2816</b>.</li>
</ol>
<p>Notice that the <code>bandwidth</code> command did not change the delay; the Gigabit interface keeps its 10 microseconds.</p></div>

<pre class="out">R1# show ip eigrp topology 192.168.30.0/24
EIGRP-IPv4 Topology Entry for AS(100)/ID(1.1.1.1) for 192.168.30.0/24
  State is Passive, Query origin flag is 1, 1 Successor(s), FD is 3328
  Descriptor Blocks:
  10.0.12.2 (GigabitEthernet0/0), from 10.0.12.2, Send flag is 0x0
      <span class="hl">Composite metric is (3328/3072), route is Internal</span>
      Vector metric:
        <span class="hl">Minimum bandwidth is 1000000 Kbit</span>
        <span class="hl">Total delay is 30 microseconds</span>
        Reliability is 255/255
        Load is 1/255
        Minimum MTU is 1500
        Hop count is 2
        Originating router is 3.3.3.3
  10.0.13.3 (GigabitEthernet0/1), from 10.0.13.3, Send flag is 0x0
      Composite metric is (256512/2816), route is Internal
      Vector metric:
        Minimum bandwidth is 10000 Kbit
        Total delay is 20 microseconds</pre>

<h3>Tuning the metric: prefer delay</h3>
<p>You can steer EIGRP by changing <code>bandwidth</code> (in Kbps) or <code>delay</code> (in <b>tens of microseconds</b>) on an interface. Engineers usually change <b>delay</b>, because it is additive and predictable and it affects nothing else. The bandwidth value is also used by OSPF cost, QoS percentages and monitoring tools, so changing it has side effects. In lab 2 you will find <code>delay 20</code> on R1 Gi0/1: that is 200 microseconds, which appears as <code>DLY 200 usec</code> in <code>show interfaces</code>.</p>

<h3>The weakness of the classic metric</h3>
<p>10^7 divided by 10,000,000 Kbps (10 Gbps) is 1, and faster links give less than 1, which truncates to 0. Every interface of 1 Gbps and faster also has the same 10 microsecond delay. So in classic mode a 10G, 40G and 100G path look almost identical. That is why named mode introduced <b>wide metrics</b>, the subject of chapter 6.</p>

<div class="warn"><p><b>Common mistake.</b> Mixing up units. <code>show interfaces</code> prints delay in microseconds (<code>DLY 10 usec</code>), the <code>delay</code> command takes tens of microseconds, and the formula uses tens of microseconds. <code>delay 10</code> means 100 microseconds, not 10.</p></div>

<div class="exam"><p><b>Exam trap.</b> Bandwidth is the <b>minimum</b> along the path; delay is the <b>sum</b>. Load and reliability are carried in updates but are not in the metric with default K values. MTU is never part of the metric.</p></div>

<div class="scn"><h4>The primary link that suddenly lost</h4><p>After a circuit upgrade, an engineer typed <code>bandwidth 1000</code> on a 1 Gbps MPLS interface, thinking the unit was Mbps. EIGRP now saw the MPLS path as a 1 Mbps link: BW = 10^7 / 1000 = 10,000, a metric of well over 2.5 million, and moved all traffic to the 20 Mbps broadband backup. Users complained of slow file transfers. <code>show interfaces</code> revealed <code>BW 1000 Kbit/sec</code>. Setting <code>bandwidth 1000000</code> (or removing the command) restored the path.</p><p><b>Lesson:</b> the bandwidth command is in Kbps, and it is a routing input, not just a label.</p></div>

<div class="iv"><p class="q">"How is the EIGRP metric calculated, and which knob would you use to influence path selection?"</p><p>Strong answer: with default K values, metric = 256 x (10^7 / slowest bandwidth in Kbps + sum of delays in tens of microseconds). Bandwidth is the minimum along the path, delay is cumulative. To influence paths, change interface delay, because it is additive and has no side effects, whereas bandwidth also affects OSPF, QoS and monitoring. Showing a quick calculation, such as 256 x (10 + 3) = 3328, impresses interviewers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Default metric = 256 x (10^7 / min bandwidth in Kbps + total delay in tens of microseconds).</li>
<li>K1 = bandwidth, K3 = delay are on by default; K2 (load), K4 and K5 (reliability) are off.</li>
<li>Bandwidth is the slowest link; delay adds up across every outgoing interface to the destination.</li>
<li>Tune with <code>delay</code> (tens of microseconds) rather than <code>bandwidth</code> (Kbps).</li>
<li>Classic metrics cannot tell 10G from 100G; wide metrics fix that.</li>
</ul></div>
`,hi:`
<p>Jaipur se Noida tak ek truck ki journey plan karne ki socho. Do cheezein decide karti hain ki route kitna achha hai. Pehla, raaste ka <b>sabse sankra pul</b> limit karta hai ki truck kitna maal le ja sakta hai, chahe baaki highway kitna bhi chauda ho. Doosra, har <b>toll booth aur traffic light</b> kuch minute jodti hai, aur woh minute judte jaate hain. EIGRP ka default metric bilkul yahi hai: path ka <b>sabse slow link</b> (bandwidth) plus har link ke <b>delays ka jod</b>.</p>

<h3>EIGRP update kya le jaata hai</h3>
<p>Update ka har route values ka ek chhota vector le jaata hai: minimum bandwidth, total delay, reliability, load, minimum MTU aur hop count. Inme se sirf pehle chaar metric mein aa sakte hain, aur default mein sirf <b>bandwidth</b> aur <b>delay</b> aate hain. MTU aur hop count sirf jaankari ke liye jaate hain (hop count ki ek limit bhi hai, default 100).</p>

<h3>Poora formula aur K values</h3>
<p><b>K values</b> weights hain jo formula ke har hisse ko on ya off karte hain:</p>
<pre class="code">metric = 256 x [ K1 x BW + (K2 x BW) / (256 - load) + K3 x DELAY ] x [ K5 / (reliability + K4) ]

<span class="c">! BW    = 10^7 / path ki sabse slow bandwidth, Kbps mein (integer)</span>
<span class="c">! DELAY = path ke interface delays ka jod, tens of microseconds mein</span>
<span class="c">! agar K5 = 0 ho, to aakhri bracket ignore hota hai (1 maana jaata hai)</span>
<span class="c">! defaults: K1=1 K2=0 K3=1 K4=0 K5=0</span></pre>
<p>Defaults ke saath sab kuch us formula mein simat jaata hai jo aap roz use karoge:</p>
<pre class="code">metric = 256 x ( 10^7 / min-bandwidth-Kbps  +  total-delay-in-tens-of-microseconds )</pre>
<p>Cisco K values ko defaults par chhodne ki salah deta hai. Load aur reliability har pal badalte hain; agar woh metric mein hote, to link busy hote hi routes flap karte. Aur, jaisa aapne chapter 3 mein dekha, K values neighbours ke beech match honi chahiye.</p>

<h3>Default interface values</h3>
<table class="cmp"><tr><th>Interface</th><th>Bandwidth (Kbps)</th><th>Delay (microseconds)</th></tr>
<tr><td>GigabitEthernet aur TenGigabitEthernet</td><td>1,000,000 / 10,000,000</td><td>10</td></tr>
<tr><td>FastEthernet</td><td>100,000</td><td>100</td></tr>
<tr><td>Ethernet (10 Mbps)</td><td>10,000</td><td>1000</td></tr>
<tr><td>Serial (default)</td><td>1,544</td><td>20,000</td></tr>
<tr><td>Loopback</td><td>8,000,000</td><td>5000</td></tr>
</table>
<p>Destination ki taraf har <b>outgoing</b> interface ka delay joda jaata hai, us door wale router ke interface samet jahan destination network rehta hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="192.168.30.0/24 ka metric calculation">
<rect x="20" y="100" width="90" height="46" rx="8" fill="#bbf7d0"/><text x="65" y="128" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="270" y="20" width="90" height="46" rx="8" fill="#bae6fd"/><text x="315" y="48" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<rect x="430" y="100" width="90" height="46" rx="8" fill="#ddd6fe"/><text x="475" y="128" text-anchor="middle" class="svg-ink" font-size="14">R3</text>
<rect x="540" y="100" width="90" height="46" rx="8" fill="#fde68a"/><text x="585" y="122" text-anchor="middle" class="svg-ink" font-size="12">LAN</text><text x="585" y="138" text-anchor="middle" class="svg-muted" font-size="12">.30.0/24</text>
<line x1="110" y1="110" x2="270" y2="50" stroke="#64748b" stroke-width="3"/><text x="150" y="68" class="svg-muted" font-size="12">1G, 10 us</text>
<line x1="360" y1="50" x2="430" y2="110" stroke="#64748b" stroke-width="3"/><text x="400" y="68" class="svg-muted" font-size="12">1G, 10 us</text>
<line x1="520" y1="123" x2="540" y2="123" stroke="#64748b" stroke-width="3"/><text x="530" y="170" text-anchor="middle" class="svg-muted" font-size="12">1G, 10 us</text>
<line x1="110" y1="140" x2="430" y2="140" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6 4"/><text x="270" y="160" text-anchor="middle" class="svg-accent" font-size="12">10 Mbps, 10 us</text>
<text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">R2 se: 256 x (10 + 3) = 3328</text>
<text x="320" y="235" text-anchor="middle" class="svg-ink" font-size="13">slow link se: 256 x (1000 + 2) = 256512</text>
</svg><p class="cap">Lab 1: bandwidth term sabse slow link leta hai, delay term har hop jodta hai.</p></div>

<div class="eg"><p><b>Worked example: lab 1, R1 se 192.168.30.0/24.</b></p>
<ol>
<li><b>R2 ke through.</b> Links: R1 Gi0/0, R2 Gi0/1, R3 Gi0/2 (LAN). Sabse slow bandwidth 1,000,000 Kbps, isliye BW = 10^7 / 1,000,000 = <b>10</b>. Delay 10 + 10 + 10 = 30 microseconds = <b>3</b> tens. Metric = 256 x (10 + 3) = <b>3328</b>.</li>
<li><b>R2 ka apna distance</b> (jo R2, R1 ko report karta hai): R2 Gi0/1 aur R3 Gi0/2, isliye 256 x (10 + 2) = <b>3072</b>.</li>
<li><b>Backup link ke through.</b> R1 Gi0/1 par <code>bandwidth 10000</code> hai, isliye sabse slow link 10,000 Kbps hai: BW = 10^7 / 10,000 = <b>1000</b>. Delay: R1 Gi0/1 (10) + R3 Gi0/2 (10) = 20 microseconds = <b>2</b>. Metric = 256 x (1000 + 2) = <b>256512</b>.</li>
<li><b>R3 ka apne LAN tak apna distance</b>: 256 x (10 + 1) = <b>2816</b>.</li>
</ol>
<p>Dhyan do ki <code>bandwidth</code> command ne delay nahi badla; Gigabit interface apne 10 microseconds rakhta hai.</p></div>

<pre class="out">R1# show ip eigrp topology 192.168.30.0/24
EIGRP-IPv4 Topology Entry for AS(100)/ID(1.1.1.1) for 192.168.30.0/24
  State is Passive, Query origin flag is 1, 1 Successor(s), FD is 3328
  Descriptor Blocks:
  10.0.12.2 (GigabitEthernet0/0), from 10.0.12.2, Send flag is 0x0
      <span class="hl">Composite metric is (3328/3072), route is Internal</span>
      Vector metric:
        <span class="hl">Minimum bandwidth is 1000000 Kbit</span>
        <span class="hl">Total delay is 30 microseconds</span>
        Reliability is 255/255
        Load is 1/255
        Minimum MTU is 1500
        Hop count is 2
        Originating router is 3.3.3.3
  10.0.13.3 (GigabitEthernet0/1), from 10.0.13.3, Send flag is 0x0
      Composite metric is (256512/2816), route is Internal
      Vector metric:
        Minimum bandwidth is 10000 Kbit
        Total delay is 20 microseconds</pre>

<h3>Metric tune karna: delay ko prefer karo</h3>
<p>Aap interface par <code>bandwidth</code> (Kbps mein) ya <code>delay</code> (<b>tens of microseconds</b> mein) badal kar EIGRP ko steer kar sakte ho. Engineers aam taur par <b>delay</b> badalte hain, kyunki yeh additive aur predictable hai aur kisi aur cheez ko affect nahi karta. Bandwidth value OSPF cost, QoS percentages aur monitoring tools bhi use karte hain, isliye use badalne ke side effects hote hain. Lab 2 mein aapko R1 Gi0/1 par <code>delay 20</code> milega: yeh 200 microseconds hai, jo <code>show interfaces</code> mein <code>DLY 200 usec</code> dikhta hai.</p>

<h3>Classic metric ki kamzori</h3>
<p>10^7 ko 10,000,000 Kbps (10 Gbps) se divide karo to 1 aata hai, aur tez links 1 se kam dete hain, jo truncate hokar 0 ho jaata hai. 1 Gbps aur usse tez har interface ka delay bhi same 10 microseconds hai. Isliye classic mode mein 10G, 40G aur 100G path lagbhag ek jaise dikhte hain. Isi wajah se named mode ne <b>wide metrics</b> introduce kiye, jo chapter 6 ka topic hai.</p>

<div class="warn"><p><b>Common galti.</b> Units mix karna. <code>show interfaces</code> delay microseconds mein print karta hai (<code>DLY 10 usec</code>), <code>delay</code> command tens of microseconds leta hai, aur formula tens of microseconds use karta hai. <code>delay 10</code> ka matlab 100 microseconds hai, 10 nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Bandwidth path ki <b>minimum</b> value hai; delay <b>jod</b> hai. Load aur reliability updates mein jaate hain lekin default K values ke saath metric mein nahi hote. MTU kabhi metric ka hissa nahi hota.</p></div>

<div class="scn"><h4>Primary link jo achanak haar gaya</h4><p>Circuit upgrade ke baad ek engineer ne 1 Gbps MPLS interface par <code>bandwidth 1000</code> type kiya, yeh sochkar ki unit Mbps hai. EIGRP ab MPLS path ko 1 Mbps link dekh raha tha: BW = 10^7 / 1000 = 10,000, yaani 2.5 million se kaafi zyada metric, aur usne saara traffic 20 Mbps broadband backup par bhej diya. Users ne slow file transfers ki shikayat ki. <code>show interfaces</code> ne <code>BW 1000 Kbit/sec</code> dikhaya. <code>bandwidth 1000000</code> set karne (ya command hatane) se path wapas aa gaya.</p><p><b>Seekh:</b> bandwidth command Kbps mein hai, aur yeh routing input hai, sirf label nahi.</p></div>

<div class="iv"><p class="q">"EIGRP metric kaise calculate hota hai, aur path selection ko influence karne ke liye aap kaunsa knob use karoge?"</p><p>Strong answer: default K values ke saath, metric = 256 x (10^7 / sabse slow bandwidth Kbps mein + delays ka jod tens of microseconds mein). Bandwidth path ki minimum hai, delay cumulative hai. Paths influence karne ke liye interface delay badlo, kyunki yeh additive hai aur iske side effects nahi, jabki bandwidth OSPF, QoS aur monitoring ko bhi affect karti hai. Ek jaldi sa calculation dikhana, jaise 256 x (10 + 3) = 3328, interviewers ko impress karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Default metric = 256 x (10^7 / min bandwidth Kbps mein + total delay tens of microseconds mein).</li>
<li>K1 = bandwidth, K3 = delay default mein on hain; K2 (load), K4 aur K5 (reliability) off hain.</li>
<li>Bandwidth sabse slow link hai; delay destination tak har outgoing interface par judta hai.</li>
<li><code>bandwidth</code> (Kbps) ki jagah <code>delay</code> (tens of microseconds) se tune karo.</li>
<li>Classic metrics 10G aur 100G mein fark nahi kar paate; wide metrics yeh theek karte hain.</li>
</ul></div>
`}};export{e as default};