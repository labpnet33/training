var e={id:`what-is-pim`,h:{en:`PIM in one picture: what it does and why it is called protocol independent`,hi:`PIM ek picture mein: yeh kya karta hai aur protocol independent kyun kehlata hai`},body:{en:`
<p><b>What you will learn in this module.</b> You will be able to explain how routers build a multicast delivery tree, enable PIM sparse mode on a live network, choose the designated router on a LAN, read every line of <code>show ip mroute</code>, keep a group on the shared tree when policy says so, deliver a channel with source-specific multicast and no rendezvous point at all, and find a broken tree with a fixed order of checks. You do not need earlier PIM experience.</p>
<p><b>Prerequisites.</b> The module on multicast addressing and IGMP (mq-igmp): you know what a group address such as 239.20.1.1 is and that a receiver tells its router about it with an IGMP report. You also need basic routing: static routes or OSPF, and what a loopback interface is.</p>

<h3>Start with an analogy: a newspaper that is delivered only to subscribers</h3>
<p>Imagine a publisher in Pune who prints one daily edition. Posting a copy to every house in India would be wasteful, and handing the paper to every stranger on the street would annoy people. A smarter publisher keeps a <b>subscription desk</b> in a central city. Readers tell their local agent "I want the edition". Agents pass the request toward the desk. The publisher sends one bundle to the desk, and the delivery network copies it only where a subscriber exists.</p>
<p>That is what <b>PIM (Protocol Independent Multicast)</b> does for IP. The <b>receiver</b> asks its last router for a group (IGMP). The routers then pass the request hop by hop toward the sender, leaving behind a little state, and the data flows back along the same path. A router copies a packet only on links where a receiver exists behind it. Many receivers, one copy per link.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="PIM request and data flow">
<rect x="10" y="90" width="90" height="50" rx="8" fill="#fde68a"/><text x="55" y="112" text-anchor="middle" class="svg-ink" font-size="13">Source</text><text x="55" y="128" text-anchor="middle" class="svg-muted" font-size="11">PC1</text>
<rect x="150" y="90" width="80" height="50" rx="8" fill="#bae6fd"/><text x="190" y="120" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="290" y="30" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="335" y="52" text-anchor="middle" class="svg-ink" font-size="14">R2</text><text x="335" y="68" text-anchor="middle" class="svg-muted" font-size="11">RP 2.2.2.2</text>
<rect x="290" y="150" width="90" height="50" rx="8" fill="#bae6fd"/><text x="335" y="180" text-anchor="middle" class="svg-ink" font-size="14">R4</text>
<rect x="440" y="30" width="80" height="50" rx="8" fill="#bae6fd"/><text x="480" y="60" text-anchor="middle" class="svg-ink" font-size="14">R3</text>
<rect x="540" y="150" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="585" y="172" text-anchor="middle" class="svg-ink" font-size="13">Receiver</text><text x="585" y="188" text-anchor="middle" class="svg-muted" font-size="11">PC4</text>
<rect x="540" y="30" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="585" y="52" text-anchor="middle" class="svg-ink" font-size="13">Receiver</text><text x="585" y="68" text-anchor="middle" class="svg-muted" font-size="11">PC3</text>
<line x1="100" y1="115" x2="150" y2="115" stroke="#64748b"/><line x1="230" y1="105" x2="290" y2="60" stroke="#64748b"/><line x1="230" y1="125" x2="290" y2="170" stroke="#64748b"/><line x1="380" y1="55" x2="440" y2="55" stroke="#64748b"/><line x1="380" y1="175" x2="540" y2="175" stroke="#64748b"/><line x1="520" y1="55" x2="540" y2="55" stroke="#64748b"/>
<text x="320" y="222" text-anchor="middle" class="svg-accent" font-size="12">Joins travel toward the source or RP, data flows back, one copy per link</text>
</svg><p class="cap">The tree is built by requests moving toward the sender. Only links that lead to a receiver carry the stream.</p></div>

<h3>Why the name says "protocol independent"</h3>
<p>PIM does not discover the network by itself. It does not run its own routing protocol with its own cost and its own table of destinations. It simply asks the ordinary <b>unicast routing table</b> (built by OSPF, EIGRP, BGP or static routes) one question: "Which interface and which neighbour do I use to reach that address?" That answer is used to send a join toward the source or the rendezvous point. So PIM works on top of any routing protocol, which is exactly what "independent" means. This question is the <b>RPF lookup</b> (reverse path forwarding); the module on RPF and mroute troubleshooting (mq-mroute) goes deep on it. For now, remember that if unicast routing is wrong, PIM is wrong.</p>

<h3>The jobs PIM performs</h3>
<ul>
<li><b>Find neighbours.</b> Routers send Hello messages to 224.0.0.13 on every PIM interface and learn who else speaks PIM (chapter 2).</li>
<li><b>Elect a designated router (DR)</b> on each LAN, so one router acts for the receivers and sources on that LAN (chapter 2).</li>
<li><b>Build a tree.</b> In sparse mode a receiver's router sends a Join toward a meeting point, the <b>rendezvous point (RP)</b>; the source's router registers to the RP; later the tree can be shortened to a direct <b>shortest-path tree</b> (chapters 3 to 5).</li>
<li><b>Prune and age state.</b> When nobody listens, branches are removed (chapter 5).</li>
<li><b>Deliver a channel without an RP</b> when the receiver names the source: SSM (chapter 6).</li>
</ul>

<h3>Two kinds of tree, in one line each</h3>
<p>A <b>shared tree</b> (written <b>(*,G)</b>, "any source, group G") is rooted at the RP: every source reaches receivers through that one meeting point. A <b>source tree</b> or <b>shortest-path tree</b> (written <b>(S,G)</b>, "source S, group G") is rooted at the source and uses the best unicast path. You will see both on every sparse-mode router.</p>

<div class="eg"><p><b>Worked example.</b> Sahyadri University streams a lecture from the Pune studio to two campus classrooms. With unicast the studio would send one copy per student device; with 300 devices on a 20 Mbps stream that is 6 Gbps leaving one server. With PIM sparse mode the server sends one 20 Mbps stream. R2 copies it to R3 and R4, and each of those copies it onto the classroom LAN. The busiest link carries 20 Mbps, not 6 Gbps.</p></div>

<h3>Your lab map for this module</h3>
<table class="cmp"><tr><th>Lab</th><th>What you do</th><th>Chapters that prepare you</th></tr>
<tr><td>mq-pim-sm-static-rp</td><td>Four routers, static RP on a loopback, read the flags until R4 takes the short path</td><td>2, 3, 4, 7</td></tr>
<tr><td>mq-pim-spt-dr</td><td>Pick the DR with priority, then stay on the shared tree with spt-threshold</td><td>2, 5</td></tr>
<tr><td>mq-pim-ssm</td><td>Deliver a channel from one encoder only, with IGMPv3 and no RP</td><td>6</td></tr>
<tr><td>mq-pim-adjacency-fault</td><td>Find three hidden faults: neighbour, interface, RP</td><td>8</td></tr></table>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking PIM carries the multicast data. It does not. PIM is only the signalling that builds the tree. The data itself is ordinary UDP packets with a group address as the destination.</p></div>

<div class="scn"><h4>Everything is "up" and still nobody sees the lecture</h4><p>A new engineer enabled <code>ip multicast-routing</code> on all four routers and saw all interfaces up, so he reported the network ready. The first lecture failed. The reason: the interfaces had no PIM and the routers knew no RP, so there was no tree-building signalling at all. Multicast routing enabled globally is only the engine switch; PIM on the interfaces is what makes the routers talk to each other.</p><p><b>Lesson:</b> a working multicast network needs three things: routing on, PIM on each path interface, and a way to reach the RP (or SSM for the channel).</p></div>

<div class="iv"><p class="q">"What does PIM actually do, and why is it called protocol independent?"</p><p>Strong answer: PIM builds the multicast distribution tree. Receivers' routers send joins toward the RP or the source, and each router records an incoming and an outgoing interface list in its mroute table. It is independent because it takes the best path from the existing unicast routing table instead of running its own topology protocol. Mention that PIM carries no user data, and that sparse mode is the normal choice.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PIM builds the tree; the data is plain UDP to a group address.</li>
<li>It borrows the best path from the unicast routing table: unicast problems become multicast problems.</li>
<li>Shared tree is (*,G) rooted at the RP; shortest-path tree is (S,G) rooted at the source.</li>
<li>A network needs multicast routing on, PIM on the path interfaces, and an RP (or SSM).</li>
<li>Prerequisite knowledge: group addresses and IGMP from the module before this one.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap samjha paoge ki routers multicast delivery tree kaise banate hain, live network par PIM sparse mode kaise on karte hain, LAN par designated router kaise chunte hain, <code>show ip mroute</code> ki har line kaise padhte hain, policy kahe to group ko shared tree par kaise rakhte hain, source-specific multicast se bina rendezvous point ke channel kaise deliver karte hain, aur fixed order ke checks se toota hua tree kaise dhoondhte hain. PIM ka pehle se koi experience nahi chahiye.</p>
<p><b>Prerequisites.</b> Multicast addressing aur IGMP wala module (mq-igmp): aapko pata hai ki 239.20.1.1 jaisa group address kya hota hai aur receiver apne router ko IGMP report se uske baare mein batata hai. Basic routing bhi chahiye: static routes ya OSPF, aur loopback interface kya hota hai.</p>

<h3>Ek analogy se shuru karo: akhbaar jo sirf subscribers ko jaata hai</h3>
<p>Socho Pune mein ek publisher hai jo roz ek edition chhapta hai. Poore India ke har ghar ko copy post karna fuzool hoga, aur sadak par har ajnabi ko akhbaar thama dena logon ko pareshan karega. Smart publisher kisi central city mein ek <b>subscription desk</b> rakhta hai. Readers apne local agent ko batate hain "mujhe edition chahiye". Agents request ko desk ki taraf aage badhate hain. Publisher desk ko ek bundle bhejta hai, aur delivery network use sirf wahin copy karta hai jahan subscriber hai.</p>
<p>IP ke liye <b>PIM (Protocol Independent Multicast)</b> yahi karta hai. <b>Receiver</b> apne last router se group maangta hai (IGMP). Phir routers request ko hop by hop sender ki taraf badhate hain, peeche thodi si state chhodte hue, aur data usi path se wapas aata hai. Router packet ko sirf un links par copy karta hai jinke peeche receiver hai. Bahut saare receivers, har link par ek copy.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="PIM request aur data flow">
<rect x="10" y="90" width="90" height="50" rx="8" fill="#fde68a"/><text x="55" y="112" text-anchor="middle" class="svg-ink" font-size="13">Source</text><text x="55" y="128" text-anchor="middle" class="svg-muted" font-size="11">PC1</text>
<rect x="150" y="90" width="80" height="50" rx="8" fill="#bae6fd"/><text x="190" y="120" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="290" y="30" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="335" y="52" text-anchor="middle" class="svg-ink" font-size="14">R2</text><text x="335" y="68" text-anchor="middle" class="svg-muted" font-size="11">RP 2.2.2.2</text>
<rect x="290" y="150" width="90" height="50" rx="8" fill="#bae6fd"/><text x="335" y="180" text-anchor="middle" class="svg-ink" font-size="14">R4</text>
<rect x="440" y="30" width="80" height="50" rx="8" fill="#bae6fd"/><text x="480" y="60" text-anchor="middle" class="svg-ink" font-size="14">R3</text>
<rect x="540" y="150" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="585" y="172" text-anchor="middle" class="svg-ink" font-size="13">Receiver</text><text x="585" y="188" text-anchor="middle" class="svg-muted" font-size="11">PC4</text>
<rect x="540" y="30" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="585" y="52" text-anchor="middle" class="svg-ink" font-size="13">Receiver</text><text x="585" y="68" text-anchor="middle" class="svg-muted" font-size="11">PC3</text>
<line x1="100" y1="115" x2="150" y2="115" stroke="#64748b"/><line x1="230" y1="105" x2="290" y2="60" stroke="#64748b"/><line x1="230" y1="125" x2="290" y2="170" stroke="#64748b"/><line x1="380" y1="55" x2="440" y2="55" stroke="#64748b"/><line x1="380" y1="175" x2="540" y2="175" stroke="#64748b"/><line x1="520" y1="55" x2="540" y2="55" stroke="#64748b"/>
<text x="320" y="222" text-anchor="middle" class="svg-accent" font-size="12">Joins source ya RP ki taraf jaate hain, data wapas aata hai, har link par ek copy</text>
</svg><p class="cap">Tree sender ki taraf badhti requests se banta hai. Sirf woh links stream carry karte hain jo receiver tak jaate hain.</p></div>

<h3>Naam mein "protocol independent" kyun hai</h3>
<p>PIM khud network discover nahi karta. Woh apna routing protocol, apni cost aur destinations ki apni table nahi chalata. Woh bas normal <b>unicast routing table</b> (OSPF, EIGRP, BGP ya static routes se bani) se ek sawaal poochta hai: "Us address tak pahunchne ke liye main kaunsa interface aur kaunsa neighbour use karun?" Is jawab se source ya rendezvous point ki taraf join bheja jaata hai. Isliye PIM kisi bhi routing protocol ke upar chalta hai, yahi "independent" ka matlab hai. Is sawaal ko <b>RPF lookup</b> (reverse path forwarding) kehte hain; RPF aur mroute troubleshooting wala module (mq-mroute) ispar gehrai se jaata hai. Abhi bas yaad rakho: agar unicast routing galat hai to PIM galat hai.</p>

<h3>PIM ke kaam</h3>
<ul>
<li><b>Neighbours dhoondhna.</b> Routers har PIM interface par 224.0.0.13 ko Hello bhejte hain aur seekhte hain ki aur kaun PIM bolta hai (chapter 2).</li>
<li>Har LAN par <b>designated router (DR)</b> chunna, taaki us LAN ke receivers aur sources ki taraf se ek hi router kaam kare (chapter 2).</li>
<li><b>Tree banana.</b> Sparse mode mein receiver ka router ek milne ki jagah, <b>rendezvous point (RP)</b>, ki taraf Join bhejta hai; source ka router RP ko register karta hai; baad mein tree chhota hokar seedha <b>shortest-path tree</b> ban sakta hai (chapters 3 se 5).</li>
<li><b>Prune karna aur state purani karna.</b> Jab koi nahi sun raha, branches hata di jaati hain (chapter 5).</li>
<li>Jab receiver source ka naam batata hai to <b>bina RP ke channel deliver karna</b>: SSM (chapter 6).</li>
</ul>

<h3>Do tarah ke tree, ek ek line mein</h3>
<p><b>Shared tree</b> (likha jaata hai <b>(*,G)</b>, "koi bhi source, group G") RP par rooted hota hai: har source receivers tak is ek milne ki jagah se pahunchta hai. <b>Source tree</b> ya <b>shortest-path tree</b> (likha jaata hai <b>(S,G)</b>, "source S, group G") source par rooted hota hai aur best unicast path use karta hai. Har sparse-mode router par aap dono dekhoge.</p>

<div class="eg"><p><b>Worked example.</b> Sahyadri University Pune studio se do campus classrooms tak lecture stream karti hai. Unicast mein studio har student device ke liye ek copy bhejta; 20 Mbps stream ke 300 devices ke saath ek server se 6 Gbps nikalta. PIM sparse mode mein server sirf ek 20 Mbps stream bhejta hai. R2 use R3 aur R4 ko copy karta hai, aur woh dono classroom LAN par copy karte hain. Sabse busy link 20 Mbps carry karta hai, 6 Gbps nahi.</p></div>

<h3>Is module ka lab map</h3>
<table class="cmp"><tr><th>Lab</th><th>Aap kya karte ho</th><th>Kaunse chapters taiyaar karte hain</th></tr>
<tr><td>mq-pim-sm-static-rp</td><td>Chaar routers, loopback par static RP, flags padho jab tak R4 chhota path na le le</td><td>2, 3, 4, 7</td></tr>
<tr><td>mq-pim-spt-dr</td><td>Priority se DR chuno, phir spt-threshold se shared tree par raho</td><td>2, 5</td></tr>
<tr><td>mq-pim-ssm</td><td>IGMPv3 aur bina RP ke, sirf ek encoder se channel deliver karo</td><td>6</td></tr>
<tr><td>mq-pim-adjacency-fault</td><td>Teen chhupe faults dhoondho: neighbour, interface, RP</td><td>8</td></tr></table>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh sochna ki PIM multicast data carry karta hai. Aisa nahi hai. PIM sirf signalling hai jo tree banati hai. Data khud normal UDP packets hain jinka destination group address hota hai.</p></div>

<div class="scn"><h4>Sab "up" hai phir bhi koi lecture nahi dekh paata</h4><p>Ek naye engineer ne chaaron routers par <code>ip multicast-routing</code> on kiya aur saare interfaces up dekhe, to usne network ready bata diya. Pehla lecture fail ho gaya. Wajah: interfaces par PIM nahi tha aur routers ko koi RP pata nahi tha, to tree banane wali signalling thi hi nahi. Global multicast routing sirf engine ka switch hai; interfaces par PIM hi routers ko aapas mein baat karwata hai.</p><p><b>Seekh:</b> working multicast network ko teen cheezein chahiye: routing on, path ke har interface par PIM, aur RP tak pahunchne ka raasta (ya channel ke liye SSM).</p></div>

<div class="iv"><p class="q">"PIM asal mein kya karta hai, aur ise protocol independent kyun kehte hain?"</p><p>Strong answer: PIM multicast distribution tree banata hai. Receivers ke routers RP ya source ki taraf joins bhejte hain, aur har router apni mroute table mein incoming aur outgoing interface list rakhta hai. Yeh independent isliye hai kyunki yeh apna topology protocol chalane ki jagah existing unicast routing table se best path leta hai. Batao ki PIM user data carry nahi karta, aur normal choice sparse mode hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PIM tree banata hai; data group address par jaane wala plain UDP hai.</li>
<li>Yeh unicast routing table se best path udhaar leta hai: unicast ki problems multicast ki problems ban jaati hain.</li>
<li>Shared tree (*,G) hai aur RP par rooted; shortest-path tree (S,G) hai aur source par rooted.</li>
<li>Network ko multicast routing on, path interfaces par PIM, aur RP (ya SSM) chahiye.</li>
<li>Prerequisite: pichhle module ke group addresses aur IGMP.</li>
</ul></div>
`}};export{e as default};