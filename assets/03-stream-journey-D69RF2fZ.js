var e={id:`journey`,h:{en:`A multicast stream's journey: group, join, tree, one copy per link`,hi:`Multicast stream ka safar: group, join, tree, har link par ek copy`},body:{en:`
<p>Let us follow one live lecture from the Pune studio to two classrooms, step by step. We use the same names as the first lab, so chapter 7 will feel familiar. The devices are PC-STUDIO (the source), routers R1, R2 and R3, and two receiver PCs, PC-CLASS-A behind R3 and PC-CLASS-B behind R2. The group address is <b>239.20.1.1</b>.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Topology of the first multicast lab">
<rect x="10" y="150" width="90" height="40" rx="8" fill="#fde68a"/><text x="55" y="174" text-anchor="middle" class="svg-ink" font-size="12">PC-STUDIO</text>
<rect x="130" y="100" width="60" height="44" rx="8" fill="#bae6fd"/><text x="160" y="127" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="270" y="60" width="80" height="50" rx="8" fill="#ddd6fe"/><text x="310" y="82" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="310" y="100" text-anchor="middle" class="svg-muted" font-size="11">RP 2.2.2.2</text>
<rect x="430" y="100" width="60" height="44" rx="8" fill="#bae6fd"/><text x="460" y="127" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="270" y="180" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="315" y="204" text-anchor="middle" class="svg-ink" font-size="12">PC-CLASS-B</text>
<rect x="540" y="150" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="585" y="174" text-anchor="middle" class="svg-ink" font-size="12">PC-CLASS-A</text>
<line x1="100" y1="165" x2="145" y2="140" stroke="#64748b" stroke-width="2"/>
<line x1="190" y1="115" x2="270" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="350" y1="90" x2="430" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="315" y1="110" x2="315" y2="180" stroke="#64748b" stroke-width="2"/>
<line x1="490" y1="130" x2="560" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="230" y="90" class="svg-muted" font-size="11">10.0.12.0/24</text><text x="385" y="90" class="svg-muted" font-size="11">10.0.23.0/24</text>
<text x="20" y="215" class="svg-muted" font-size="11">10.1.1.0/24</text><text x="545" y="210" class="svg-muted" font-size="11">10.3.3.0/24</text><text x="322" y="150" class="svg-muted" font-size="11">10.2.2.0/24</text>
</svg><p class="cap">One source, three routers, two receivers. R2 is the meeting point (the rendezvous point).</p></div>

<h3>Step 1: the host says "I want this group" (IGMP)</h3>
<p>PC-CLASS-A wants the lecture. It sends a small message, an <b>IGMP membership report</b>, to its router R3: "someone on this LAN wants group 239.20.1.1". R3 now remembers that its LAN interface has a member of that group. You can see this memory with <code>show ip igmp groups</code>.</p>
<pre class="out">R3# show ip igmp groups
IGMP Connected Group Membership
Group Address    Interface                Uptime    Expires   Last Reporter   Group Accounted
<span class="hl">239.20.1.1       GigabitEthernet0/0       00:00:51  00:02:09  10.3.3.10</span></pre>
<p>The last reporter 10.3.3.10 is PC-CLASS-A. IGMP only works on the last hop, between hosts and their own router.</p>

<h3>Step 2: routers build a tree towards the source (PIM)</h3>
<p>A router that knows about a member must pull the stream towards itself. In <b>PIM sparse mode</b> routers do not know where the source is at first, so they use a <b>rendezvous point (RP)</b>, a router that every router agrees to use as the meeting place for the group. Here the RP is R2, with address 2.2.2.2. R3 sends a PIM <b>join</b> hop by hop towards the RP. Each router on the way records "if packets for this group arrive, send a copy out of this interface". These records form a <b>tree</b>: the root is the RP or the source, the leaves are the receivers.</p>

<h3>Step 3: the source starts, and the tree carries it</h3>
<p>PC-STUDIO sends packets to 239.20.1.1. R1, its router, registers the source with the RP, the RP joins towards the source, and the stream starts to flow along the tree. After a moment routers switch to a direct, shortest path from the source, but the idea is the same: <b>every router forwards one copy out of each interface that leads to a member</b>.</p>

<h3>Reading the multicast routing table</h3>
<p>The table of group state on a router is the <b>mroute table</b>. Here is the real entry on R2, the RP, in our lab:</p>
<pre class="out">R2# show ip mroute 239.20.1.1
(*, 239.20.1.1), 00:00:51/00:02:09, RP 2.2.2.2, flags: SC
  Incoming interface: Null, RPF nbr 0.0.0.0
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:39/00:02:21
    GigabitEthernet0/2, Forward/Sparse, 00:00:51/00:02:09

<span class="hl">(10.1.1.10, 239.20.1.1)</span>, 00:00:24/00:02:36, flags: T
  Incoming interface: GigabitEthernet0/1, RPF nbr 10.0.12.1
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:24/00:03:06
    GigabitEthernet0/2, Forward/Sparse, 00:00:24/00:03:06</pre>
<p>Read it like a rule book. <b>(*, G)</b> means "any source for group G" (the shared tree, rooted at the RP). <b>(S, G)</b> means "this specific source S sending to group G" (the source tree). <b>Incoming interface</b> is where packets must arrive. <b>Outgoing interface list (OIL)</b> is where copies go out. Here R2 receives from R1 on Gi0/1 and sends one copy to Gi0/0 (PC-CLASS-B's LAN) and one to Gi0/2 (towards R3). The flag <b>T</b> means the stream is flowing on the shortest-path tree. We study every flag in mq-pim.</p>

<div class="eg"><p><b>Worked example.</b> The source sends 4 Mbps. The R1-R2 link carries 4 Mbps once. R2 makes two copies, one per outgoing interface, so the R2-R3 link carries 4 Mbps once, and PC-CLASS-B's LAN carries 4 Mbps once. If 200 more PCs join behind R3, the R2-R3 link still carries 4 Mbps.</p></div>

<h3>The safety rule: reverse path check</h3>
<p>Multicast packets can loop if networks have more than one path. To avoid that, a router accepts a multicast packet only if it arrives on the interface it would itself use to send unicast traffic <i>back</i> to the source. This is the <b>RPF check</b> (reverse path forwarding), and "RPF nbr" in the output is the neighbour used. It is the most common cause of multicast faults, and the module mq-mroute is dedicated to it.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Forgetting <code>ip pim sparse-mode</code> on one interface; the tree breaks at that link. (2) Forgetting to tell routers where the RP is. (3) Reading the stream as working just because the join exists; check that the source is sending too.</p></div>

<div class="exam"><p><b>Exam trap.</b> IGMP is host to router. PIM is router to router. They are different protocols doing different jobs.</p></div>

<div class="scn"><h4>The silent classroom</h4><p>At Sahyadri University a classroom in Nagpur showed a black screen while Pune and Mumbai worked. The engineer asked "who knows about the group?" and ran <code>show ip igmp groups</code> on the Nagpur router: empty. The receiver PC never joined, because the lecture software used a different group address than the one the router was told about. Once the group matched, the router showed the entry and the picture appeared.</p><p><b>Lesson:</b> start at the receiver's router. If IGMP shows no group, the problem is on the LAN, not in the core.</p></div>

<div class="iv"><p class="q">"Walk me through how a multicast stream reaches a receiver."</p><p>Strong answer: the host sends an IGMP report to its router; the router sends a PIM join towards the RP (or source); routers on the path add the incoming interface to their mroute tables; the source sends to the group address; each router forwards one copy per outgoing interface; the RPF check stops loops.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGMP tells the last-hop router that a host wants a group.</li>
<li>PIM builds a tree of routers; the RP is the meeting point in sparse mode.</li>
<li>show ip mroute lists (*,G) and (S,G) entries with incoming interface and outgoing list.</li>
<li>Each link carries one copy no matter how many receivers are behind it.</li>
<li>The RPF check prevents loops and is the first suspect when a stream is missing.</li>
</ul></div>
`,hi:`
<p>Chalo ek live lecture ko Pune studio se do classrooms tak step by step follow karte hain. Hum pehle lab ke hi names use karte hain, isliye chapter 7 familiar lagega. Devices hain PC-STUDIO (source), routers R1, R2 aur R3, aur do receiver PCs, R3 ke peeche PC-CLASS-A aur R2 ke peeche PC-CLASS-B. Group address <b>239.20.1.1</b> hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Pehle multicast lab ki topology">
<rect x="10" y="150" width="90" height="40" rx="8" fill="#fde68a"/><text x="55" y="174" text-anchor="middle" class="svg-ink" font-size="12">PC-STUDIO</text>
<rect x="130" y="100" width="60" height="44" rx="8" fill="#bae6fd"/><text x="160" y="127" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="270" y="60" width="80" height="50" rx="8" fill="#ddd6fe"/><text x="310" y="82" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="310" y="100" text-anchor="middle" class="svg-muted" font-size="11">RP 2.2.2.2</text>
<rect x="430" y="100" width="60" height="44" rx="8" fill="#bae6fd"/><text x="460" y="127" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="270" y="180" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="315" y="204" text-anchor="middle" class="svg-ink" font-size="12">PC-CLASS-B</text>
<rect x="540" y="150" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="585" y="174" text-anchor="middle" class="svg-ink" font-size="12">PC-CLASS-A</text>
<line x1="100" y1="165" x2="145" y2="140" stroke="#64748b" stroke-width="2"/>
<line x1="190" y1="115" x2="270" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="350" y1="90" x2="430" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="315" y1="110" x2="315" y2="180" stroke="#64748b" stroke-width="2"/>
<line x1="490" y1="130" x2="560" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="230" y="90" class="svg-muted" font-size="11">10.0.12.0/24</text><text x="385" y="90" class="svg-muted" font-size="11">10.0.23.0/24</text>
<text x="20" y="215" class="svg-muted" font-size="11">10.1.1.0/24</text><text x="545" y="210" class="svg-muted" font-size="11">10.3.3.0/24</text><text x="322" y="150" class="svg-muted" font-size="11">10.2.2.0/24</text>
</svg><p class="cap">Ek source, teen routers, do receivers. R2 meeting point hai (rendezvous point).</p></div>

<h3>Step 1: host kehta hai "mujhe yeh group chahiye" (IGMP)</h3>
<p>PC-CLASS-A ko lecture chahiye. Woh apne router R3 ko ek chhota message bhejta hai, ek <b>IGMP membership report</b>: "is LAN par kisi ko group 239.20.1.1 chahiye". R3 ab yaad rakhta hai ki uske LAN interface par us group ka member hai. Yeh yaadasht aap <code>show ip igmp groups</code> se dekh sakte ho.</p>
<pre class="out">R3# show ip igmp groups
IGMP Connected Group Membership
Group Address    Interface                Uptime    Expires   Last Reporter   Group Accounted
<span class="hl">239.20.1.1       GigabitEthernet0/0       00:00:51  00:02:09  10.3.3.10</span></pre>
<p>Last reporter 10.3.3.10 PC-CLASS-A hai. IGMP sirf last hop par kaam karta hai, hosts aur unke apne router ke beech.</p>

<h3>Step 2: routers source ki taraf tree banate hain (PIM)</h3>
<p>Jis router ko member ka pata hai use stream ko apni taraf kheenchna padta hai. <b>PIM sparse mode</b> mein routers ko shuru mein source ka pata nahi hota, isliye woh ek <b>rendezvous point (RP)</b> use karte hain, ek router jise sab routers group ke liye milne ki jagah maante hain. Yahan RP R2 hai, address 2.2.2.2. R3 RP ki taraf hop by hop ek PIM <b>join</b> bhejta hai. Raaste ka har router likh leta hai "agar is group ke packets aayein, to is interface se ek copy bhejo". Yeh records ek <b>tree</b> banate hain: root RP ya source hai, leaves receivers hain.</p>

<h3>Step 3: source shuru hota hai, aur tree stream le jaata hai</h3>
<p>PC-STUDIO 239.20.1.1 par packets bhejta hai. R1, uska router, source ko RP ke paas register karta hai, RP source ki taraf join karta hai, aur stream tree ke saath bahne lagti hai. Thodi der baad routers source se seedhe, sabse chhote raaste par switch kar lete hain, lekin idea wahi hai: <b>har router har us interface se ek copy bhejta hai jo member tak jaata hai</b>.</p>

<h3>Multicast routing table padhna</h3>
<p>Router par group state ki table <b>mroute table</b> kehlati hai. Hamare lab mein RP R2 par asli entry yeh hai:</p>
<pre class="out">R2# show ip mroute 239.20.1.1
(*, 239.20.1.1), 00:00:51/00:02:09, RP 2.2.2.2, flags: SC
  Incoming interface: Null, RPF nbr 0.0.0.0
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:39/00:02:21
    GigabitEthernet0/2, Forward/Sparse, 00:00:51/00:02:09

<span class="hl">(10.1.1.10, 239.20.1.1)</span>, 00:00:24/00:02:36, flags: T
  Incoming interface: GigabitEthernet0/1, RPF nbr 10.0.12.1
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:24/00:03:06
    GigabitEthernet0/2, Forward/Sparse, 00:00:24/00:03:06</pre>
<p>Ise rule book ki tarah padho. <b>(*, G)</b> ka matlab "group G ke liye koi bhi source" (shared tree, RP par rooted). <b>(S, G)</b> ka matlab "yeh specific source S group G ko bhej raha hai" (source tree). <b>Incoming interface</b> woh hai jahan packets aane chahiye. <b>Outgoing interface list (OIL)</b> woh hai jahan copies nikalti hain. Yahan R2 R1 se Gi0/1 par receive karta hai aur ek copy Gi0/0 (PC-CLASS-B ka LAN) aur ek Gi0/2 (R3 ki taraf) bhejta hai. Flag <b>T</b> ka matlab stream shortest-path tree par chal rahi hai. Har flag hum mq-pim mein padhenge.</p>

<div class="eg"><p><b>Worked example.</b> Source 4 Mbps bhejta hai. R1-R2 link 4 Mbps ek baar carry karti hai. R2 do copies banata hai, har outgoing interface par ek, isliye R2-R3 link 4 Mbps ek baar carry karti hai, aur PC-CLASS-B ka LAN 4 Mbps ek baar. Agar R3 ke peeche 200 aur PCs join karein, R2-R3 link phir bhi 4 Mbps carry karti hai.</p></div>

<h3>Safety rule: reverse path check</h3>
<p>Agar networks mein ek se zyada raaste hon to multicast packets loop kar sakte hain. Isse bachne ke liye router multicast packet tabhi accept karta hai jab woh us interface par aaye jisse router khud source ko unicast traffic <i>wapas</i> bhejne ke liye use karta. Yeh <b>RPF check</b> (reverse path forwarding) hai, aur output mein "RPF nbr" use hone wala neighbour hai. Yeh multicast faults ki sabse common wajah hai, aur module mq-mroute isi ko dedicated hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Ek interface par <code>ip pim sparse-mode</code> bhool jaana; us link par tree toot jaata hai. (2) Routers ko RP kahan hai yeh batana bhool jaana. (3) Sirf join dekh kar maan lena ki stream chal rahi hai; check karo ki source bhi bhej raha hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> IGMP host se router tak hai. PIM router se router tak hai. Yeh alag protocols hain jo alag kaam karte hain.</p></div>

<div class="scn"><h4>Khamosh classroom</h4><p>Sahyadri University mein Nagpur ki ek classroom mein black screen thi jabki Pune aur Mumbai chal rahe the. Engineer ne poochha "group ke baare mein kaun jaanta hai?" aur Nagpur router par <code>show ip igmp groups</code> chalaya: khaali. Receiver PC ne kabhi join nahi kiya, kyunki lecture software ne router ko bataye gaye address se alag group address use kiya tha. Group match hone par router ne entry dikhayi aur picture aa gayi.</p><p><b>Seekh:</b> receiver ke router se shuru karo. Agar IGMP koi group nahi dikhata, to problem LAN par hai, core mein nahi.</p></div>

<div class="iv"><p class="q">"Mujhe samjhao ki multicast stream receiver tak kaise pahunchti hai."</p><p>Strong answer: host apne router ko IGMP report bhejta hai; router RP (ya source) ki taraf PIM join bhejta hai; raaste ke routers apni mroute table mein incoming interface add karte hain; source group address par bhejta hai; har router har outgoing interface par ek copy forward karta hai; RPF check loops rokta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGMP last-hop router ko batata hai ki host ko group chahiye.</li>
<li>PIM routers ka tree banata hai; sparse mode mein RP meeting point hai.</li>
<li>show ip mroute (*,G) aur (S,G) entries dikhata hai, incoming interface aur outgoing list ke saath.</li>
<li>Har link par ek copy chalti hai, chahe peeche kitne bhi receivers hon.</li>
<li>RPF check loops rokta hai aur stream missing ho to pehla suspect hai.</li>
</ul></div>
`}};export{e as default};