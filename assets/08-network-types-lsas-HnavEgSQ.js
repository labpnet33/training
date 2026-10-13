var e={id:`network-types`,h:{en:`Network types and the LSDB: router and network LSAs`,hi:`Network types aur LSDB: router aur network LSAs`},body:{en:`
<p>A private phone call between two friends needs no moderator. A conference call with twenty people does, or everybody talks over each other. OSPF makes the same distinction with <b>network types</b>. The network type of an interface decides whether a DR is elected, how neighbours are found, which timers apply, and what the link looks like inside the LSDB.</p>

<h3>The network types you must know</h3>
<table class="cmp"><tr><th>Type</th><th>Default on</th><th>DR/BDR</th><th>Hello/Dead</th><th>Neighbour state shown</th></tr>
<tr><td><b>Broadcast</b></td><td>Ethernet interfaces</td><td>Yes</td><td>10 / 40</td><td><code>FULL/DR</code>, <code>FULL/BDR</code>, <code>2WAY/DROTHER</code></td></tr>
<tr><td><b>Point-to-point</b></td><td>Serial (HDLC, PPP), GRE tunnels</td><td>No</td><td>10 / 40</td><td><code>FULL/  -</code></td></tr>
<tr><td>Non-broadcast and point-to-multipoint</td><td>Legacy Frame Relay, hub-and-spoke</td><td>Depends</td><td>30 / 120</td><td>CCNP topics</td></tr>
<tr><td>Loopback</td><td>Loopback interfaces</td><td>n/a</td><td>n/a</td><td>Advertised as a /32 host route</td></tr>
</table>

<h3>Why engineers set point-to-point on Ethernet links</h3>
<p>A router-to-router Ethernet link with a /30 or /31 can only ever have two routers on it. Treating it as broadcast wastes effort: a DR election nobody needs, a 40-second wait timer before the adjacency forms, and an extra network LSA in the database. Changing the network type fixes all three:</p>
<pre class="code"><span class="c">! On BOTH ends of the link</span>
R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip ospf network point-to-point</pre>
<pre class="out">R1# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">2.2.2.2           0   FULL/  -        00:00:37    10.0.12.2       GigabitEthernet0/0</span></pre>
<p>The dash means "no DR role on this link", and the priority column shows 0 because priority is meaningless here. Adjacency comes up in a few seconds, and convergence after a failure is faster. This is standard practice in data center spine-leaf underlays and in most modern WAN cores.</p>

<h3>What the LSDB contains: LSA types 1 and 2</h3>
<dl class="terms">
<dt>Type 1: Router LSA</dt><dd>Created by <b>every</b> router, one per area it belongs to, and flooded only inside that area. Its Link State ID is the router's RID. It lists every OSPF link of the router with its cost: a <b>point-to-point</b> link to a neighbour RID, a <b>transit</b> link to a broadcast segment (identified by the DR's address), or a <b>stub</b> network such as a loopback or a passive user LAN.</dd>
<dt>Type 2: Network LSA</dt><dd>Created only by the <b>DR</b> of a broadcast segment that has at least one full neighbour. Its Link State ID is the DR's interface address. It lists the segment's mask and every router attached to it. Think of it as the segment introducing itself as a pseudo-node in the map.</dd>
</dl>
<p>Other types exist and will come later: type 3 summaries made by ABRs (routes marked <code>O IA</code>) and type 5 externals such as a default route injected with <code>default-information originate</code> (marked <code>O*E2</code>).</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Router LSAs and a network LSA on the Lab 3 core VLAN">
<rect x="220" y="90" width="200" height="44" rx="22" fill="#ddd6fe"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">Type 2: 10.10.0.0/24</text><text x="320" y="126" text-anchor="middle" class="svg-muted" font-size="11">made by DR 1.1.1.1</text>
<rect x="30" y="20" width="120" height="40" rx="8" fill="#bae6fd"/><text x="90" y="45" text-anchor="middle" class="svg-ink" font-size="12">Type 1: R1</text>
<rect x="490" y="20" width="120" height="40" rx="8" fill="#bae6fd"/><text x="550" y="45" text-anchor="middle" class="svg-ink" font-size="12">Type 1: R2</text>
<rect x="30" y="160" width="120" height="40" rx="8" fill="#bae6fd"/><text x="90" y="185" text-anchor="middle" class="svg-ink" font-size="12">Type 1: R3</text>
<rect x="490" y="160" width="120" height="40" rx="8" fill="#bae6fd"/><text x="550" y="185" text-anchor="middle" class="svg-ink" font-size="12">Type 1: R4</text>
<line x1="150" y1="45" x2="240" y2="95" stroke="#64748b" stroke-width="2"/><line x1="490" y1="45" x2="400" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="180" x2="240" y2="130" stroke="#64748b" stroke-width="2"/><line x1="490" y1="180" x2="400" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="320" y="30" text-anchor="middle" class="svg-muted" font-size="11">each router LSA: transit link to DR 10.10.0.1</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="11">network LSA lists R1, R2, R3, R4</text>
</svg><p class="cap">On a broadcast segment the routers connect to a pseudo-node described by the DR's type 2 LSA.</p></div>

<h3>Reading the database</h3>
<pre class="out">R1# show ip ospf database

            OSPF Router with ID (1.1.1.1) (Process ID 1)

                Router Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum Link count
1.1.1.1         1.1.1.1         118         0x80000004 0x00A3C1 2
2.2.2.2         2.2.2.2         121         0x80000003 0x0081D7 2
3.3.3.3         3.3.3.3         121         0x80000003 0x00C2E4 2
<span class="hl">4.4.4.4         4.4.4.4         117         0x80000005 0x005F12 3</span>

                Net Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum
<span class="hl">10.10.0.1       1.1.1.1         118         0x80000001 0x00B4A2</span>
10.14.0.2       4.4.4.4         117         0x80000001 0x00E730</pre>
<p>This is Lab 3 after the DR changes. There is one router LSA per router. R4 has 3 links: the core VLAN, the backup link and its server LAN (a stub, because it is passive). There are two network LSAs: the core VLAN, whose DR is R1 (10.10.0.1), and the R1 to R4 backup link, which is still a broadcast segment and elected R4 (higher RID, equal priority) as DR. The Seq# column increases every time a router re-originates its LSA.</p>

<div class="eg"><p><b>Worked example.</b> In the Lab 1 chain with default broadcast links, the LSDB holds 4 router LSAs plus 3 network LSAs (one per /30): 7 LSAs. Set <code>ip ospf network point-to-point</code> on all six link interfaces and the network LSAs disappear: 4 LSAs, each router LSA describing its point-to-point neighbours and the /30 subnets as stub links. Same routes, smaller map, no DR elections.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Setting point-to-point on one end only. Both ends still use 10/40 timers, so they may even reach FULL, but one describes a transit link to a DR and the other a point-to-point link, the LSDB does not agree, and SPF drops routes over that link. Also, forgetting that a loopback with a /24 mask is advertised as a <b>/32</b> host route unless it is set to point-to-point: in Lab 3, R2's Loopback0 172.16.2.1/24 appears on other routers as 172.16.2.1/32.</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>FULL/  -</code> means a point-to-point network type. Ethernet defaults to broadcast; serial defaults to point-to-point. Only the DR originates the type 2 LSA. Type 1 and type 2 LSAs never leave their area.</p></div>

<div class="scn"><h4>Full adjacency, missing routes</h4><p>During a data center refresh, an engineer converted the uplinks of a new leaf switch to point-to-point, but the change on the matching spine ports was skipped. Both ends showed the neighbour as FULL, so monitoring stayed green, yet the leaf's server subnets never appeared on the spines. <code>show ip ospf interface</code> showed <code>Network Type POINT_TO_POINT</code> on the leaf and <code>BROADCAST</code> on the spine. Setting the spine ports to point-to-point made the routes appear within seconds.</p><p><b>Lesson:</b> FULL is not the same as working. Check that both ends agree on the network type, and check the routing table.</p></div>

<div class="iv"><p class="q">"Why would you configure ip ospf network point-to-point on an Ethernet link?"</p><p>Strong answer: a routed Ethernet link between two routers has only two members, so the DR/BDR election, the 40-second wait timer and the type 2 network LSA add nothing. Point-to-point removes them, so adjacencies form faster, the LSDB is smaller and SPF is simpler. It must be configured on both ends, otherwise the adjacency can show FULL while routes are missing. Mention the <code>FULL/  -</code> neighbour state as the proof.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ethernet defaults to broadcast (DR/BDR); serial and GRE default to point-to-point (no DR).</li>
<li>Point-to-point on router-to-router Ethernet links removes the election, the wait timer and the network LSA.</li>
<li>Type 1 router LSA: every router, lists its links and costs; type 2 network LSA: made by the DR for a broadcast segment.</li>
<li>Network type must match on both ends, or routes can be missing even at FULL.</li>
<li>Loopbacks are advertised as /32 unless set to point-to-point.</li>
</ul></div>
`,hi:`
<p>Do doston ke beech private phone call ko moderator nahi chahiye. Bees logon ki conference call ko chahiye, warna sab ek dusre ke upar bolenge. OSPF yahi farak <b>network types</b> se karta hai. Interface ka network type decide karta hai ki DR elect hoga ya nahi, neighbours kaise milenge, kaunse timers lagenge, aur LSDB ke andar link kaisa dikhega.</p>

<h3>Network types jo aapko pata hone chahiye</h3>
<table class="cmp"><tr><th>Type</th><th>Default kahan</th><th>DR/BDR</th><th>Hello/Dead</th><th>Neighbour state kaisi dikhti hai</th></tr>
<tr><td><b>Broadcast</b></td><td>Ethernet interfaces</td><td>Haan</td><td>10 / 40</td><td><code>FULL/DR</code>, <code>FULL/BDR</code>, <code>2WAY/DROTHER</code></td></tr>
<tr><td><b>Point-to-point</b></td><td>Serial (HDLC, PPP), GRE tunnels</td><td>Nahi</td><td>10 / 40</td><td><code>FULL/  -</code></td></tr>
<tr><td>Non-broadcast aur point-to-multipoint</td><td>Legacy Frame Relay, hub-and-spoke</td><td>Depend karta hai</td><td>30 / 120</td><td>CCNP topics</td></tr>
<tr><td>Loopback</td><td>Loopback interfaces</td><td>n/a</td><td>n/a</td><td>/32 host route ke roop mein advertise</td></tr>
</table>

<h3>Engineers Ethernet links par point-to-point kyun set karte hain</h3>
<p>/30 ya /31 wale router-to-router Ethernet link par kabhi bhi sirf do routers ho sakte hain. Use broadcast maanna mehnat waste karta hai: ek DR election jiski kisi ko zaroorat nahi, adjacency banne se pehle 40 second ka wait timer, aur database mein ek extra network LSA. Network type badalne se teeno theek ho jaate hain:</p>
<pre class="code"><span class="c">! Link ke DONO ends par</span>
R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip ospf network point-to-point</pre>
<pre class="out">R1# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">2.2.2.2           0   FULL/  -        00:00:37    10.0.12.2       GigabitEthernet0/0</span></pre>
<p>Dash ka matlab hai "is link par koi DR role nahi", aur priority column 0 dikhata hai kyunki yahan priority ka koi matlab nahi. Adjacency kuch second mein up ho jaati hai, aur failure ke baad convergence fast hota hai. Data center spine-leaf underlays aur zyada tar modern WAN cores mein yeh standard practice hai.</p>

<h3>LSDB mein kya hota hai: LSA types 1 aur 2</h3>
<dl class="terms">
<dt>Type 1: Router LSA</dt><dd><b>Har</b> router banata hai, jis area mein woh hai uske liye ek, aur sirf usi area ke andar flood hota hai. Iska Link State ID router ka RID hota hai. Isme router ka har OSPF link cost ke saath list hota hai: neighbour RID tak <b>point-to-point</b> link, broadcast segment tak <b>transit</b> link (DR ke address se pehchana jaata hai), ya <b>stub</b> network jaise loopback ya passive user LAN.</dd>
<dt>Type 2: Network LSA</dt><dd>Sirf broadcast segment ka <b>DR</b> banata hai, jis segment par kam se kam ek full neighbour ho. Iska Link State ID DR ka interface address hota hai. Isme segment ka mask aur usse jude har router ki list hoti hai. Ise aise socho ki segment map mein pseudo-node ki tarah apna parichay deta hai.</dd>
</dl>
<p>Aur types bhi hain jo baad mein aayenge: ABRs ke banaye type 3 summaries (routes <code>O IA</code> se mark hote hain) aur type 5 externals, jaise <code>default-information originate</code> se daala gaya default route (<code>O*E2</code> se mark).</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Lab 3 core VLAN par router LSAs aur ek network LSA">
<rect x="220" y="90" width="200" height="44" rx="22" fill="#ddd6fe"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">Type 2: 10.10.0.0/24</text><text x="320" y="126" text-anchor="middle" class="svg-muted" font-size="11">DR 1.1.1.1 ne banaya</text>
<rect x="30" y="20" width="120" height="40" rx="8" fill="#bae6fd"/><text x="90" y="45" text-anchor="middle" class="svg-ink" font-size="12">Type 1: R1</text>
<rect x="490" y="20" width="120" height="40" rx="8" fill="#bae6fd"/><text x="550" y="45" text-anchor="middle" class="svg-ink" font-size="12">Type 1: R2</text>
<rect x="30" y="160" width="120" height="40" rx="8" fill="#bae6fd"/><text x="90" y="185" text-anchor="middle" class="svg-ink" font-size="12">Type 1: R3</text>
<rect x="490" y="160" width="120" height="40" rx="8" fill="#bae6fd"/><text x="550" y="185" text-anchor="middle" class="svg-ink" font-size="12">Type 1: R4</text>
<line x1="150" y1="45" x2="240" y2="95" stroke="#64748b" stroke-width="2"/><line x1="490" y1="45" x2="400" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="180" x2="240" y2="130" stroke="#64748b" stroke-width="2"/><line x1="490" y1="180" x2="400" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="320" y="30" text-anchor="middle" class="svg-muted" font-size="11">har router LSA: DR 10.10.0.1 tak transit link</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="11">network LSA mein R1, R2, R3, R4 list</text>
</svg><p class="cap">Broadcast segment par routers ek pseudo-node se judte hain jise DR ka type 2 LSA describe karta hai.</p></div>

<h3>Database padhna</h3>
<pre class="out">R1# show ip ospf database

            OSPF Router with ID (1.1.1.1) (Process ID 1)

                Router Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum Link count
1.1.1.1         1.1.1.1         118         0x80000004 0x00A3C1 2
2.2.2.2         2.2.2.2         121         0x80000003 0x0081D7 2
3.3.3.3         3.3.3.3         121         0x80000003 0x00C2E4 2
<span class="hl">4.4.4.4         4.4.4.4         117         0x80000005 0x005F12 3</span>

                Net Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum
<span class="hl">10.10.0.1       1.1.1.1         118         0x80000001 0x00B4A2</span>
10.14.0.2       4.4.4.4         117         0x80000001 0x00E730</pre>
<p>Yeh DR changes ke baad ka Lab 3 hai. Har router ka ek router LSA hai. R4 ke 3 links hain: core VLAN, backup link aur uska server LAN (stub, kyunki passive hai). Do network LSAs hain: core VLAN, jiska DR R1 (10.10.0.1) hai, aur R1 se R4 ka backup link, jo abhi bhi broadcast segment hai aur jisne R4 (bada RID, barabar priority) ko DR chuna. Seq# column har baar badhta hai jab router apna LSA dobara originate karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Default broadcast links wali Lab 1 chain mein LSDB mein 4 router LSAs aur 3 network LSAs (har /30 ka ek) hain: 7 LSAs. Chhe link interfaces par <code>ip ospf network point-to-point</code> set karo aur network LSAs gayab ho jaate hain: 4 LSAs, har router LSA apne point-to-point neighbours aur /30 subnets ko stub links ke roop mein describe karta hai. Same routes, chhota map, koi DR election nahi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Point-to-point sirf ek end par set karna. Dono ends abhi bhi 10/40 timers use karte hain, isliye FULL tak bhi pahunch sakte hain, lekin ek DR tak transit link describe karta hai aur dusra point-to-point link, LSDB agree nahi karta, aur SPF us link ke routes gira deta hai. Yeh bhi bhoolna ki /24 mask wala loopback <b>/32</b> host route ke roop mein advertise hota hai jab tak use point-to-point na kiya jaaye: Lab 3 mein R2 ka Loopback0 172.16.2.1/24 dusre routers par 172.16.2.1/32 dikhta hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>FULL/  -</code> matlab point-to-point network type. Ethernet ka default broadcast hai; serial ka default point-to-point. Type 2 LSA sirf DR originate karta hai. Type 1 aur type 2 LSAs apna area kabhi nahi chhodte.</p></div>

<div class="scn"><h4>Full adjacency, gayab routes</h4><p>Data center refresh ke dauraan ek engineer ne naye leaf switch ke uplinks ko point-to-point kar diya, lekin matching spine ports par change reh gaya. Dono ends par neighbour FULL dikh raha tha, isliye monitoring green rahi, phir bhi leaf ke server subnets spines par kabhi nahi aaye. <code>show ip ospf interface</code> mein leaf par <code>Network Type POINT_TO_POINT</code> aur spine par <code>BROADCAST</code> dikha. Spine ports ko point-to-point karte hi routes kuch second mein aa gaye.</p><p><b>Seekh:</b> FULL ka matlab kaam karna nahi hai. Check karo ki dono ends network type par agree karte hain, aur routing table check karo.</p></div>

<div class="iv"><p class="q">"Ethernet link par aap ip ospf network point-to-point kyun configure karoge?"</p><p>Strong answer: do routers ke beech routed Ethernet link par sirf do members hote hain, isliye DR/BDR election, 40 second ka wait timer aur type 2 network LSA kuch nahi jodte. Point-to-point inhe hata deta hai, isliye adjacencies jaldi banti hain, LSDB chhota hota hai aur SPF simple hota hai. Ise dono ends par configure karna zaroori hai, warna adjacency FULL dikh sakti hai jabki routes missing hon. Proof ke roop mein <code>FULL/  -</code> neighbour state mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ethernet ka default broadcast (DR/BDR) hai; serial aur GRE ka default point-to-point (koi DR nahi).</li>
<li>Router-to-router Ethernet links par point-to-point election, wait timer aur network LSA hata deta hai.</li>
<li>Type 1 router LSA: har router, apne links aur costs list karta hai; type 2 network LSA: broadcast segment ke liye DR banata hai.</li>
<li>Network type dono ends par match hona chahiye, warna FULL par bhi routes missing ho sakte hain.</li>
<li>Loopbacks /32 ke roop mein advertise hote hain jab tak point-to-point set na ho.</li>
</ul></div>
`}};export{e as default};