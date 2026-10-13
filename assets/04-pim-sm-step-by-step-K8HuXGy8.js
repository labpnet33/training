var e={id:`pim-sm-step-by-step`,h:{en:`PIM sparse mode step by step: shared tree, register and the shortest path`,hi:`PIM sparse mode step by step: shared tree, register aur shortest path`},body:{en:`
<p>Now the main event: how a sparse-mode tree is built, one message at a time. We follow the Sahyadri lecture through the four routers of the first lab. R1 is on the studio LAN with PC1 (10.20.1.10), R2 holds the RP (Loopback0, 2.2.2.2), R3 and R4 serve the two classrooms, and R1 and R4 also share a direct link. The group is 239.20.1.1.</p>

<h3>Step 0: every router must know the RP</h3>
<p>A <b>static RP</b> is the simplest way. On every router, including the RP itself:</p>
<pre class="code">ip pim rp-address 2.2.2.2</pre>
<pre class="out">R2#show ip pim rp mapping
PIM Group-to-RP Mappings

<span class="hl">Group(s): 224.0.0.0/4, Static
    RP: 2.2.2.2 (?)</span></pre>
<p>The range 224.0.0.0/4 means "all groups". The RP must be reachable in the unicast routing table from every router: that is why R2 advertises 2.2.2.2 in OSPF and why PIM is also enabled on Loopback0. How the RP is chosen and the other ways to learn it (ACLs, Auto-RP, BSR, anycast) belong to the next module.</p>

<h3>Step 1: a receiver joins, the shared tree grows toward the RP</h3>
<p>PC3 and PC4 send IGMP reports for 239.20.1.1. R3 and R4 are the last-hop routers. Each creates a <b>(*,G) entry</b> and sends a <b>(*,G) Join</b> out of the interface that leads toward the RP, because the RPF lookup for 2.2.2.2 points there. R2, the RP, adds those interfaces to its outgoing list. No source exists yet, so no data flows.</p>
<pre class="out">R3#show ip mroute 239.20.1.1
(*, 239.20.1.1), 00:00:24/00:02:36, RP 2.2.2.2, flags: <span class="hl">SC</span>
  Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:24/00:02:36

R2#show ip mroute 239.20.1.1
(*, 239.20.1.1), 00:00:36/stopped, RP 2.2.2.2, flags: <span class="hl">S</span>
  <span class="hl">Incoming interface: Null, RPF nbr 0.0.0.0</span>
  Outgoing interface list:
    GigabitEthernet0/2, Forward/Sparse, 00:00:36/00:02:54
    GigabitEthernet0/3, Forward/Sparse, 00:00:24/00:03:06</pre>
<p>Read R3: flag <b>S</b> means sparse mode, <b>C</b> means a member is directly connected. The incoming interface is the one facing the RP, and the <b>RPF neighbour</b> is the next hop toward the RP. The outgoing interface list (OIL) holds the LAN with the receiver. On R2 the incoming interface is <b>Null</b> because R2 <i>is</i> the root of the shared tree; the timer shows <b>stopped</b> since the RP keeps the (*,G) while joins arrive.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="PIM-SM steps">
<rect x="20" y="105" width="70" height="40" rx="8" fill="#fde68a"/><text x="55" y="130" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="120" y="105" width="70" height="40" rx="8" fill="#bae6fd"/><text x="155" y="130" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="290" y="25" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="335" y="50" text-anchor="middle" class="svg-ink" font-size="13">R2 (RP)</text>
<rect x="290" y="185" width="90" height="40" rx="8" fill="#bae6fd"/><text x="335" y="210" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<rect x="480" y="25" width="70" height="40" rx="8" fill="#bae6fd"/><text x="515" y="50" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="560" y="185" width="70" height="40" rx="8" fill="#bbf7d0"/><text x="595" y="210" text-anchor="middle" class="svg-ink" font-size="13">PC4</text>
<line x1="90" y1="125" x2="120" y2="125" stroke="#64748b"/>
<line x1="190" y1="115" x2="290" y2="50" stroke="#64748b"/><line x1="190" y1="135" x2="290" y2="200" stroke="#64748b"/><line x1="380" y1="45" x2="480" y2="45" stroke="#64748b"/><line x1="380" y1="205" x2="560" y2="205" stroke="#64748b"/><line x1="335" y1="65" x2="335" y2="185" stroke="#64748b"/>
<path d="M 300 195 L 300 70" stroke="#2563eb" stroke-width="2" fill="none"/><text x="250" y="130" class="svg-accent" font-size="11">1 (*,G) join</text>
<path d="M 160 105 L 295 55" stroke="#ea580c" stroke-width="2" stroke-dasharray="5 3" fill="none"/><text x="175" y="70" class="svg-muted" font-size="11">2 Register</text>
<path d="M 190 140 L 290 205" stroke="#16a34a" stroke-width="2" fill="none"/><text x="205" y="195" class="svg-muted" font-size="11">4 (S,G) join</text>
</svg><p class="cap">1 receiver joins the shared tree; 2 the source is registered to the RP; 3 data flows down the shared tree; 4 R4 joins the source tree directly.</p></div>

<h3>Step 2: the source starts, R1 registers it to the RP</h3>
<p>PC1 begins sending. R1 is the source's DR. It does not know where the receivers are, but it knows the RP. R1 wraps the first packets inside a unicast <b>PIM Register</b> message to 2.2.2.2 and sets the <b>F</b> (register) flag on its (S,G) entry. The RP unwraps them and sends them down the shared tree to R3 and R4, so the receivers get data already. The RP also sends an <b>(S,G) Join</b> toward the source so the stream arrives natively, and then tells R1 to stop encapsulating with <b>Register-Stop</b>. From now on data travels R1 to R2 as ordinary multicast.</p>
<p>To see the stage where everyone is still on the shared tree, we tell R4 never to switch (<code>ip pim spt-threshold infinity</code>, chapter 5) and send the stream:</p>
<pre class="out">R1#show ip mroute 239.20.1.1
(10.20.1.10, 239.20.1.1), 00:00:12/00:02:48, flags: <span class="hl">FT</span>
  Incoming interface: GigabitEthernet0/0, RPF nbr 0.0.0.0
  Outgoing interface list:
    GigabitEthernet0/1, Forward/Sparse, 00:00:12/00:03:18

R2#show ip mroute 239.20.1.1
(*, 239.20.1.1), 00:01:24/stopped, RP 2.2.2.2, flags: S
  Incoming interface: Null, RPF nbr 0.0.0.0
  Outgoing interface list:
    GigabitEthernet0/2, Forward/Sparse, 00:01:24/00:03:06
    GigabitEthernet0/3, Forward/Sparse, 00:01:12/00:03:18

(10.20.1.10, 239.20.1.1), 00:00:24/00:02:36, flags: T
  Incoming interface: GigabitEthernet0/1, RPF nbr 10.0.12.1
  Outgoing interface list:
    GigabitEthernet0/2, Forward/Sparse, 00:00:24/00:03:06
    GigabitEthernet0/3, Forward/Sparse, 00:00:24/00:03:06</pre>
<p>R1's incoming interface is the source LAN and its RPF neighbour is 0.0.0.0, because the source is directly attached. The <b>F</b> flag says R1 registered the source. R2 now has both a (*,G) and an (S,G); its (S,G) comes in on Gi0/1 from R1 and goes out to both receivers. R4 shows only a (*,G): its stream comes down the shared tree.</p>

<h3>Step 3: the last-hop router switches to the shortest path</h3>
<p>The shared-tree path is not always the shortest. R4 has a direct link to R1, but the stream currently goes R1, R2, R4. By default a last-hop router joins the source tree as soon as the first packet arrives (SPT threshold 0). R4 does an RPF lookup for the <i>source</i> 10.20.1.10, finds the direct link Gi0/2, and sends an (S,G) Join out of it. When the stream arrives natively on the direct link, R4 sets the <b>T</b> flag (SPT bit) and prunes the source from the shared tree, so R2 stops sending it a second copy.</p>
<pre class="out">R4#show ip rpf 10.20.1.10
RPF information for ? (10.20.1.10)
  <span class="hl">RPF interface: GigabitEthernet0/2</span>
  RPF neighbor: ? (10.0.14.1)
  RPF route/mask: 10.20.1.0/24
  RPF type: unicast (ospf)

R4#show ip mroute 239.20.1.1
(*, 239.20.1.1), 00:00:39/00:02:21, RP 2.2.2.2, flags: <span class="hl">SJC</span>
  Incoming interface: GigabitEthernet0/3, RPF nbr 10.0.24.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:39/00:02:21

(10.20.1.10, 239.20.1.1), 00:00:24/00:02:36, flags: <span class="hl">T</span>
  Incoming interface: <span class="hl">GigabitEthernet0/2</span>, RPF nbr 10.0.14.1
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:24/00:03:06</pre>
<p>The (*,G) entry on R4 now carries <b>J</b> (join SPT) and still faces the RP on Gi0/3, ready to be used again. The (S,G) entry arrives on Gi0/2, the direct link. R3 has no shorter path than through R2 (its only link goes there), so its (S,G) arrives on the same interface as its (*,G): switching changed nothing for it.</p>

<table class="cmp"><tr><th>Step</th><th>Message</th><th>Who sends it</th><th>Result</th></tr>
<tr><td>1</td><td>IGMP report, then (*,G) Join</td><td>Receiver, then last-hop router</td><td>Shared tree to the RP</td></tr>
<tr><td>2</td><td>Register (unicast)</td><td>Source's DR</td><td>RP learns the source</td></tr>
<tr><td>2b</td><td>(S,G) Join, Register-Stop</td><td>RP</td><td>Native stream R1 to RP</td></tr>
<tr><td>3</td><td>(S,G) Join, (S,G,rpt) Prune</td><td>Last-hop router</td><td>Shortest-path tree, T flag</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Count hops for R4. Through the RP the stream travels R1, R2, R4: 2 router-to-router links. Direct it travels R1, R4: 1 link. After the switch, the R1-R2 link no longer carries a copy for R4, and R4 sees one copy instead of two arriving briefly during the transition.</p></div>

<div class="warn"><p><b>Common mistake.</b> Expecting to see the Register message, flag F, on the last-hop router, or the T flag on the RP before any join. F belongs on the source's DR; T appears where the stream arrives on the shortest-path interface.</p></div>
<div class="exam"><p><b>Exam trap.</b> The RP is a meeting point for the <b>control plane</b>. Once the source tree is built, data does not need to pass through the RP; that is why the switch to the SPT exists.</p></div>

<div class="scn"><h4>Register storm on the RP</h4><p>A new camera in a Chennai studio sent a video stream, but the RP's CPU spiked and the stream stuttered. The source router could not get Register-Stop back because the RP's unicast route to the studio went through an interface where PIM was missing, so the RP could never join the source tree. Every packet was being encapsulated in Register and decapsulated by the CPU. Enabling PIM on that link let the RP join (S,G) and the CPU dropped.</p><p><b>Lesson:</b> a source whose (S,G) on the DR stays flagged F with an empty or tiny OIL, and an RP with high CPU, points at a broken RPF path from the RP to the source.</p></div>

<div class="iv"><p class="q">"Walk me through what happens from the moment a receiver joins to the first packet arriving."</p><p>Strong answer: IGMP report; last-hop DR creates (*,G) and sends a join toward the RP, building the shared tree hop by hop. A source starts, its DR registers it to the RP by unicast; the RP forwards down the shared tree and joins the source tree; Register-Stop ends the encapsulation. The last-hop router sees the first packet, joins (S,G) by its own RPF path to the source, and prunes the source from the shared tree. Name the flags S, C, F, J and T.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>(*,G) joins grow the shared tree from the receivers toward the RP; the RP shows incoming interface Null.</li>
<li>The source's DR registers the source to the RP (flag F) until the RP joins the source tree.</li>
<li>The last-hop router switches to the shortest-path tree on the first packet by default (flags J on (*,G), T on (S,G)).</li>
<li>The RPF lookup toward the source decides the (S,G) incoming interface.</li>
<li>After switchover the RP is no longer in the data path for that receiver.</li>
</ul></div>
`,hi:`
<p>Ab main baat: sparse-mode tree kaise banta hai, ek ek message ke saath. Hum Sahyadri ke lecture ko pehle lab ke chaar routers se follow karte hain. R1 studio LAN par PC1 (10.20.1.10) ke saath hai, R2 ke paas RP hai (Loopback0, 2.2.2.2), R3 aur R4 do classrooms ko serve karte hain, aur R1 aur R4 ke beech ek direct link bhi hai. Group 239.20.1.1 hai.</p>

<h3>Step 0: har router ko RP pata hona chahiye</h3>
<p><b>Static RP</b> sabse aasan tareeka hai. Har router par, RP par bhi:</p>
<pre class="code">ip pim rp-address 2.2.2.2</pre>
<pre class="out">R2#show ip pim rp mapping
PIM Group-to-RP Mappings

<span class="hl">Group(s): 224.0.0.0/4, Static
    RP: 2.2.2.2 (?)</span></pre>
<p>Range 224.0.0.0/4 ka matlab "saare groups". RP har router se unicast routing table mein reachable hona chahiye: isiliye R2 2.2.2.2 ko OSPF mein advertise karta hai aur Loopback0 par bhi PIM on hai. RP kaise chuna jaata hai aur use seekhne ke baaki tareeke (ACLs, Auto-RP, BSR, anycast) agle module ke hain.</p>

<h3>Step 1: receiver join karta hai, shared tree RP ki taraf badhta hai</h3>
<p>PC3 aur PC4 239.20.1.1 ke liye IGMP reports bhejte hain. R3 aur R4 last-hop routers hain. Har ek <b>(*,G) entry</b> banata hai aur RP ki taraf jaane wale interface se <b>(*,G) Join</b> bhejta hai, kyunki 2.2.2.2 ka RPF lookup wahin point karta hai. R2, yaani RP, un interfaces ko apni outgoing list mein jodta hai. Abhi koi source nahi hai, isliye data nahi chalta.</p>
<pre class="out">R3#show ip mroute 239.20.1.1
(*, 239.20.1.1), 00:00:24/00:02:36, RP 2.2.2.2, flags: <span class="hl">SC</span>
  Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:24/00:02:36

R2#show ip mroute 239.20.1.1
(*, 239.20.1.1), 00:00:36/stopped, RP 2.2.2.2, flags: <span class="hl">S</span>
  <span class="hl">Incoming interface: Null, RPF nbr 0.0.0.0</span>
  Outgoing interface list:
    GigabitEthernet0/2, Forward/Sparse, 00:00:36/00:02:54
    GigabitEthernet0/3, Forward/Sparse, 00:00:24/00:03:06</pre>
<p>R3 padho: flag <b>S</b> ka matlab sparse mode, <b>C</b> ka matlab ek member directly connected hai. Incoming interface woh hai jo RP ki taraf dekhta hai, aur <b>RPF neighbour</b> RP ki taraf next hop hai. Outgoing interface list (OIL) mein receiver wali LAN hai. R2 par incoming interface <b>Null</b> hai kyunki R2 khud shared tree ka root <i>hai</i>; timer <b>stopped</b> dikhata hai kyunki joins aate rehne tak RP (*,G) rakhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="PIM-SM steps">
<rect x="20" y="105" width="70" height="40" rx="8" fill="#fde68a"/><text x="55" y="130" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="120" y="105" width="70" height="40" rx="8" fill="#bae6fd"/><text x="155" y="130" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="290" y="25" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="335" y="50" text-anchor="middle" class="svg-ink" font-size="13">R2 (RP)</text>
<rect x="290" y="185" width="90" height="40" rx="8" fill="#bae6fd"/><text x="335" y="210" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<rect x="480" y="25" width="70" height="40" rx="8" fill="#bae6fd"/><text x="515" y="50" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="560" y="185" width="70" height="40" rx="8" fill="#bbf7d0"/><text x="595" y="210" text-anchor="middle" class="svg-ink" font-size="13">PC4</text>
<line x1="90" y1="125" x2="120" y2="125" stroke="#64748b"/>
<line x1="190" y1="115" x2="290" y2="50" stroke="#64748b"/><line x1="190" y1="135" x2="290" y2="200" stroke="#64748b"/><line x1="380" y1="45" x2="480" y2="45" stroke="#64748b"/><line x1="380" y1="205" x2="560" y2="205" stroke="#64748b"/><line x1="335" y1="65" x2="335" y2="185" stroke="#64748b"/>
<path d="M 300 195 L 300 70" stroke="#2563eb" stroke-width="2" fill="none"/><text x="250" y="130" class="svg-accent" font-size="11">1 (*,G) join</text>
<path d="M 160 105 L 295 55" stroke="#ea580c" stroke-width="2" stroke-dasharray="5 3" fill="none"/><text x="175" y="70" class="svg-muted" font-size="11">2 Register</text>
<path d="M 190 140 L 290 205" stroke="#16a34a" stroke-width="2" fill="none"/><text x="205" y="195" class="svg-muted" font-size="11">4 (S,G) join</text>
</svg><p class="cap">1 receiver shared tree join karta hai; 2 source RP ke paas register hota hai; 3 data shared tree se neeche jaata hai; 4 R4 seedha source tree join karta hai.</p></div>

<h3>Step 2: source shuru hota hai, R1 use RP ke paas register karta hai</h3>
<p>PC1 bhejna shuru karta hai. R1 source ka DR hai. Use nahi pata receivers kahan hain, par RP pata hai. R1 pehle packets ko unicast <b>PIM Register</b> message ke andar 2.2.2.2 ko lapet ke bhejta hai aur apni (S,G) entry par <b>F</b> (register) flag lagata hai. RP unhe kholkar shared tree se R3 aur R4 ko bhejta hai, isliye receivers ko data pehle hi mil jaata hai. RP source ki taraf ek <b>(S,G) Join</b> bhi bhejta hai taaki stream natively aaye, aur phir <b>Register-Stop</b> se R1 ko encapsulation band karne ko kehta hai. Ab R1 se R2 tak data normal multicast ke roop mein jaata hai.</p>
<p>Woh stage dekhne ke liye jahan sab abhi shared tree par hain, hum R4 ko kehte hain kabhi switch na kare (<code>ip pim spt-threshold infinity</code>, chapter 5) aur stream bhejte hain:</p>
<pre class="out">R1#show ip mroute 239.20.1.1
(10.20.1.10, 239.20.1.1), 00:00:12/00:02:48, flags: <span class="hl">FT</span>
  Incoming interface: GigabitEthernet0/0, RPF nbr 0.0.0.0
  Outgoing interface list:
    GigabitEthernet0/1, Forward/Sparse, 00:00:12/00:03:18

R2#show ip mroute 239.20.1.1
(*, 239.20.1.1), 00:01:24/stopped, RP 2.2.2.2, flags: S
  Incoming interface: Null, RPF nbr 0.0.0.0
  Outgoing interface list:
    GigabitEthernet0/2, Forward/Sparse, 00:01:24/00:03:06
    GigabitEthernet0/3, Forward/Sparse, 00:01:12/00:03:18

(10.20.1.10, 239.20.1.1), 00:00:24/00:02:36, flags: T
  Incoming interface: GigabitEthernet0/1, RPF nbr 10.0.12.1
  Outgoing interface list:
    GigabitEthernet0/2, Forward/Sparse, 00:00:24/00:03:06
    GigabitEthernet0/3, Forward/Sparse, 00:00:24/00:03:06</pre>
<p>R1 ka incoming interface source LAN hai aur uska RPF neighbour 0.0.0.0 hai, kyunki source directly attached hai. <b>F</b> flag batata hai ki R1 ne source register kiya. R2 ke paas ab (*,G) aur (S,G) dono hain; uski (S,G) Gi0/1 par R1 se aati hai aur dono receivers ko jaati hai. R4 sirf (*,G) dikhata hai: uski stream shared tree se neeche aati hai.</p>

<h3>Step 3: last-hop router shortest path par switch karta hai</h3>
<p>Shared-tree path hamesha sabse chhota nahi hota. R4 ka R1 se direct link hai, par abhi stream R1, R2, R4 se jaati hai. Default mein last-hop router pehla packet aate hi source tree join kar leta hai (SPT threshold 0). R4 <i>source</i> 10.20.1.10 ke liye RPF lookup karta hai, direct link Gi0/2 paata hai, aur usse (S,G) Join bhejta hai. Jab stream direct link par natively aati hai, R4 <b>T</b> flag (SPT bit) lagata hai aur source ko shared tree se prune kar deta hai, taaki R2 use doosri copy bhejna band kare.</p>
<pre class="out">R4#show ip rpf 10.20.1.10
RPF information for ? (10.20.1.10)
  <span class="hl">RPF interface: GigabitEthernet0/2</span>
  RPF neighbor: ? (10.0.14.1)
  RPF route/mask: 10.20.1.0/24
  RPF type: unicast (ospf)

R4#show ip mroute 239.20.1.1
(*, 239.20.1.1), 00:00:39/00:02:21, RP 2.2.2.2, flags: <span class="hl">SJC</span>
  Incoming interface: GigabitEthernet0/3, RPF nbr 10.0.24.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:39/00:02:21

(10.20.1.10, 239.20.1.1), 00:00:24/00:02:36, flags: <span class="hl">T</span>
  Incoming interface: <span class="hl">GigabitEthernet0/2</span>, RPF nbr 10.0.14.1
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:24/00:03:06</pre>
<p>R4 ki (*,G) entry par ab <b>J</b> (join SPT) hai aur woh abhi bhi Gi0/3 par RP ki taraf dekhti hai, phir se use hone ko taiyaar. (S,G) entry Gi0/2, yaani direct link, par aati hai. R3 ke paas R2 se hokar jaane se chhota path nahi (uska ek hi link wahin jaata hai), isliye uski (S,G) wahi interface use karti hai jo (*,G): switching se uske liye kuch nahi badla.</p>

<table class="cmp"><tr><th>Step</th><th>Message</th><th>Kaun bhejta hai</th><th>Result</th></tr>
<tr><td>1</td><td>IGMP report, phir (*,G) Join</td><td>Receiver, phir last-hop router</td><td>RP tak shared tree</td></tr>
<tr><td>2</td><td>Register (unicast)</td><td>Source ka DR</td><td>RP ko source pata chalta hai</td></tr>
<tr><td>2b</td><td>(S,G) Join, Register-Stop</td><td>RP</td><td>R1 se RP tak native stream</td></tr>
<tr><td>3</td><td>(S,G) Join, (S,G,rpt) Prune</td><td>Last-hop router</td><td>Shortest-path tree, T flag</td></tr></table>

<div class="eg"><p><b>Worked example.</b> R4 ke liye hops gino. RP ke through stream R1, R2, R4 jaati hai: 2 router-to-router links. Direct R1, R4: 1 link. Switch ke baad R1-R2 link R4 ke liye copy carry nahi karta, aur transition ke dauraan jo do copies thodi der aati thi uski jagah R4 ko ek copy dikhti hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Last-hop router par Register message, flag F, dekhna ya join se pehle RP par T flag expect karna. F source ke DR par hota hai; T wahan dikhta hai jahan stream shortest-path interface par aati hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> RP <b>control plane</b> ka milne ka point hai. Source tree ban jaane ke baad data ko RP se guzarne ki zaroorat nahi; isiliye SPT par switch hota hai.</p></div>

<div class="scn"><h4>RP par Register storm</h4><p>Chennai studio ke ek naye camera ne video stream bheji, par RP ka CPU spike hua aur stream atakne lagi. Source router ko Register-Stop wapas nahi mil paaya kyunki RP ka studio tak unicast route us interface se jaata tha jahan PIM missing tha, isliye RP kabhi source tree join nahi kar paaya. Har packet Register mein encapsulate ho raha tha aur CPU use decapsulate kar raha tha. Us link par PIM on karne se RP ne (S,G) join kar liya aur CPU gir gaya.</p><p><b>Seekh:</b> DR par jis source ki (S,G) flag F ke saath khaali ya bahut chhoti OIL ke saath rehti hai, aur RP ka CPU high hai, woh RP se source tak toote hue RPF path ki taraf ishara karta hai.</p></div>

<div class="iv"><p class="q">"Mujhe batao receiver ke join karne se pehle packet aane tak kya hota hai."</p><p>Strong answer: IGMP report; last-hop DR (*,G) banata hai aur RP ki taraf join bhejta hai, hop by hop shared tree banata hai. Source shuru hota hai, uska DR use unicast se RP ko register karta hai; RP shared tree se neeche forward karta hai aur source tree join karta hai; Register-Stop encapsulation khatam karta hai. Last-hop router pehla packet dekhta hai, source tak apne RPF path se (S,G) join karta hai, aur source ko shared tree se prune karta hai. Flags S, C, F, J aur T ka naam lo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>(*,G) joins receivers se RP ki taraf shared tree ugate hain; RP par incoming interface Null dikhta hai.</li>
<li>Source ka DR source ko RP ke paas register karta hai (flag F) jab tak RP source tree join na kare.</li>
<li>Last-hop router default mein pehle packet par shortest-path tree par switch karta hai ((*,G) par J, (S,G) par T flags).</li>
<li>Source ki taraf RPF lookup (S,G) ka incoming interface tay karta hai.</li>
<li>Switchover ke baad us receiver ke liye RP data path mein nahi rehta.</li>
</ul></div>
`}};export{e as default};