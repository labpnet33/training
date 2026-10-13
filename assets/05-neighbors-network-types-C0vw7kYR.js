var e={id:`neighbors-network-types`,h:{en:`Neighbour relationships and network types`,hi:`Neighbour relationships aur network types`},body:{en:`
<p>Two colleagues meeting in a small cabin just talk to each other. A hundred people in a hall need a <b>chairperson</b> and a deputy, or nobody can hear anything. OSPF network types are the same idea. On a broadcast link routers elect a chairperson (the DR) and a deputy (the BDR). On a point-to-point link there are only two people, so the election is a waste of time. Picking the wrong model for the room, or having the two ends disagree about the room, is one of the most tested ENARSI faults.</p>

<h3>What must match to become neighbours</h3>
<p>An OSPFv3 Hello is checked field by field. If any of these differ, the neighbour never appears or stays stuck:</p>
<table class="cmp"><tr><th>Must match</th><th>Symptom if not</th></tr>
<tr><td>Area ID</td><td>No neighbour; debug shows an area mismatch</td></tr>
<tr><td>Hello and dead intervals</td><td>No neighbour; "Mismatched hello parameters"</td></tr>
<tr><td>Instance ID</td><td>No neighbour, no message at all</td></tr>
<tr><td>Stub/NSSA flags (E and N option bits)</td><td>No neighbour; option mismatch</td></tr>
<tr><td>Authentication (IPsec SPI and key, or key chain)</td><td>No neighbour; packets dropped</td></tr>
<tr><td>Unique router ID</td><td>Adjacency fails or LSAs flap</td></tr>
<tr><td>Interface MTU (checked in DBD, not Hello)</td><td>Stuck in EXSTART or EXCHANGE</td></tr>
</table>
<p>Not checked: the global IPv6 prefix (chapter 2). Also not checked: the network type itself. That is why a network type mismatch is sneaky.</p>

<h3>The network types</h3>
<table class="cmp"><tr><th>Type</th><th>DR/BDR</th><th>Hello/Dead</th><th>Neighbours</th><th>Notes</th></tr>
<tr><td>Broadcast</td><td>Yes</td><td>10/40</td><td>Automatic (FF02::5)</td><td>Default on Ethernet; DR creates network LSA</td></tr>
<tr><td>Point-to-point</td><td>No</td><td>10/40</td><td>Automatic</td><td>Default on serial/tunnels; <code>FULL/  -</code></td></tr>
<tr><td>NBMA (non-broadcast)</td><td>Yes</td><td>30/120</td><td>Manual</td><td>Neighbour configured by link-local address</td></tr>
<tr><td>Point-to-multipoint</td><td>No</td><td>30/120</td><td>Automatic</td><td>Advertises own address as /128 (LA bit)</td></tr>
<tr><td>Point-to-multipoint non-broadcast</td><td>No</td><td>30/120</td><td>Manual</td><td>For hub-and-spoke without multicast</td></tr>
</table>
<p>For NBMA types the neighbour command takes the neighbour's <b>link-local</b> address, for example <code>ipv6 ospf neighbor FE80::5200:FF:FE02:0</code> on the interface. A global address will not work, because OSPFv3 talks link-local.</p>

<h3>Lab task 2: point-to-point on the transit links</h3>
<p>By default both Ethernet transit links are broadcast. With only two routers each, you still get a DR election, a 40-second wait timer on startup, a network LSA and a DR-originated prefix LSA. Point-to-point removes all of that:</p>
<pre class="code"><span class="c">! R1</span>
interface GigabitEthernet0/0
 ipv6 ospf network point-to-point
<span class="c">! R2: both transit links</span>
interface GigabitEthernet0/0
 ipv6 ospf network point-to-point
interface GigabitEthernet0/1
 ipv6 ospf network point-to-point
<span class="c">! R3</span>
interface GigabitEthernet0/0
 ipv6 ospf network point-to-point
<span class="c">! AF style equivalent on each interface: ospfv3 network point-to-point</span></pre>
<p>Before and after, on the ABR:</p>
<pre class="out">R2# show ipv6 ospf neighbor          <span class="c">(before)</span>
Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
1.1.1.1           1   FULL/BDR        00:00:35    3               GigabitEthernet0/0
3.3.3.3           1   FULL/DR         00:00:31    3               GigabitEthernet0/1

R2# show ipv6 ospf neighbor          <span class="c">(after)</span>
Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
<span class="hl">1.1.1.1           0   FULL/  -        00:00:36    3               GigabitEthernet0/0</span>
<span class="hl">3.3.3.3           0   FULL/  -        00:00:33    3               GigabitEthernet0/1</span></pre>
<p>The dash means "no DR role on this network type". The lab check counts exactly two <code>FULL/  -</code> neighbours on R2. Confirm per interface with <code>show ipv6 ospf interface Gi0/1 | include Network Type</code>, which should say <code>Network Type POINT_TO_POINT</code>.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Network type mismatch">
<rect x="40" y="40" width="160" height="56" rx="8" fill="#bae6fd"/><text x="120" y="63" text-anchor="middle" class="svg-ink" font-size="13">R2 Gi0/1</text><text x="120" y="82" text-anchor="middle" class="svg-muted" font-size="12">point-to-point</text>
<rect x="440" y="40" width="160" height="56" rx="8" fill="#fed7aa"/><text x="520" y="63" text-anchor="middle" class="svg-ink" font-size="13">R3 Gi0/0</text><text x="520" y="82" text-anchor="middle" class="svg-muted" font-size="12">broadcast (DR)</text>
<line x1="200" y1="68" x2="440" y2="68" stroke="#64748b" stroke-width="2"/><text x="320" y="60" text-anchor="middle" class="svg-accent" font-size="12">FULL both ways</text>
<rect x="40" y="130" width="250" height="70" rx="8" fill="#e2e8f0"/><text x="165" y="155" text-anchor="middle" class="svg-ink" font-size="12">R2 router LSA: p2p link</text><text x="165" y="175" text-anchor="middle" class="svg-ink" font-size="12">to router 3.3.3.3</text>
<rect x="350" y="130" width="250" height="70" rx="8" fill="#e2e8f0"/><text x="475" y="155" text-anchor="middle" class="svg-ink" font-size="12">R3 router LSA: transit link</text><text x="475" y="175" text-anchor="middle" class="svg-ink" font-size="12">to a network LSA</text>
<text x="320" y="222" text-anchor="middle" class="svg-accent" font-size="12">Descriptions disagree: SPF two-way check fails, routes missing</text>
</svg><p class="cap">A broadcast/point-to-point mismatch reaches FULL, but the two router LSAs describe the link differently, so SPF will not use it.</p></div>

<h3>The mismatch trap in detail</h3>
<p>Point-to-point and broadcast both use 10/40 timers, so a half-configured link still reaches FULL. But the p2p end describes "a link to router 3.3.3.3", while the broadcast end describes "a link to the transit network whose DR is ...". SPF requires both ends of a link to describe each other (the <b>two-way check</b>). They do not, so the routes across that link are not installed. Neighbours FULL, routes missing: think network type. Broadcast against point-to-multipoint is easier to spot: the timers differ (10/40 against 30/120), so no adjacency forms at all.</p>

<div class="eg"><p><b>Worked example.</b> A fresh broadcast adjacency waits up to the 40-second <b>wait timer</b> before electing a DR, then exchanges databases. With point-to-point the routers go straight from 2-WAY to EXSTART. In the lab, after a reload, R2 and R3 reach FULL in a few seconds instead of about 40, and area 1 loses one network LSA and one prefix LSA.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing only one end of the link. Always change both ends in the same change window, and check both with <code>show ipv6 ospf interface</code>. Another mistake: setting <code>ipv6 ospf priority 0</code> on both ends of a broadcast link; then nobody can be DR and the neighbours stay in 2-WAY.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>2WAY/DROTHER</code> between two DROTHERs on a broadcast LAN is <b>normal</b>, not a fault. <code>FULL/  -</code> is normal on point-to-point and point-to-multipoint. And OSPFv2 and OSPFv3 network types are set separately: <code>ip ospf network</code> does not change OSPFv3.</p></div>

<div class="scn"><h4>Half an implementation, half the routes</h4><p>A change request asked for point-to-point on the Pune WAN handoff. The engineer configured the core side, then was pulled into an outage and never did the branch side. Neighbours stayed FULL, so monitoring stayed green, but branch loopbacks and the branch LAN disappeared from the core routing table. <code>show ipv6 ospf interface</code> showed POINT_TO_POINT on one end and BROADCAST on the other. Configuring the branch side restored the routes within seconds.</p><p><b>Lesson:</b> FULL is not proof of routing. When routes vanish over a FULL adjacency, compare network types on both ends.</p></div>

<div class="iv"><p class="q">"Why would you configure point-to-point on an Ethernet link, and what can go wrong?"</p><p>Strong answer: on a link with exactly two routers the DR/BDR election adds nothing. Point-to-point skips the election and the wait timer, removes the network LSA and the DR's prefix LSA, and speeds up convergence. The risk is a mismatch: if only one end is changed, both ends still reach FULL, but SPF's two-way check fails and routes over the link are missing. Always change both ends and verify with <code>show ipv6 ospf interface</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Must match: area, hello/dead, instance ID, stub flags, authentication; MTU is checked in DBD.</li>
<li>Broadcast and point-to-point use 10/40; NBMA and point-to-multipoint use 30/120.</li>
<li>Manual OSPFv3 neighbours are configured with the neighbour's link-local address.</li>
<li><code>FULL/  -</code> means no DR; the lab expects two of them on R2.</li>
<li>Broadcast versus point-to-point mismatch: FULL but routes missing.</li>
</ul></div>
`,hi:`
<p>Chhote cabin mein milne wale do colleagues bas ek doosre se baat kar lete hain. Hall mein sau log hon to <b>chairperson</b> aur ek deputy chahiye, warna kisi ko kuch sunai nahi dega. OSPF network types bhi yahi idea hai. Broadcast link par routers ek chairperson (DR) aur deputy (BDR) elect karte hain. Point-to-point link par sirf do log hain, isliye election samay ki barbaadi hai. Room ke liye galat model chunna, ya dono ends ka room ke baare mein agree na karna, ENARSI ke sabse zyada test hone wale faults mein se ek hai.</p>

<h3>Neighbours banne ke liye kya match hona chahiye</h3>
<p>OSPFv3 Hello field by field check hota hai. Agar inme se kuch bhi alag hai, to neighbour kabhi dikhta nahi ya atka rehta hai:</p>
<table class="cmp"><tr><th>Match zaroori</th><th>Na ho to symptom</th></tr>
<tr><td>Area ID</td><td>Neighbour nahi; debug area mismatch dikhata hai</td></tr>
<tr><td>Hello aur dead intervals</td><td>Neighbour nahi; "Mismatched hello parameters"</td></tr>
<tr><td>Instance ID</td><td>Neighbour nahi, koi message bhi nahi</td></tr>
<tr><td>Stub/NSSA flags (E aur N option bits)</td><td>Neighbour nahi; option mismatch</td></tr>
<tr><td>Authentication (IPsec SPI aur key, ya key chain)</td><td>Neighbour nahi; packets drop</td></tr>
<tr><td>Unique router ID</td><td>Adjacency fail ya LSAs flap</td></tr>
<tr><td>Interface MTU (DBD mein check, Hello mein nahi)</td><td>EXSTART ya EXCHANGE mein atka</td></tr>
</table>
<p>Check nahi hota: global IPv6 prefix (chapter 2). Yeh bhi check nahi hota: network type khud. Isiliye network type mismatch itna chupa hua hota hai.</p>

<h3>Network types</h3>
<table class="cmp"><tr><th>Type</th><th>DR/BDR</th><th>Hello/Dead</th><th>Neighbours</th><th>Notes</th></tr>
<tr><td>Broadcast</td><td>Haan</td><td>10/40</td><td>Automatic (FF02::5)</td><td>Ethernet par default; DR network LSA banata hai</td></tr>
<tr><td>Point-to-point</td><td>Nahi</td><td>10/40</td><td>Automatic</td><td>Serial/tunnels par default; <code>FULL/  -</code></td></tr>
<tr><td>NBMA (non-broadcast)</td><td>Haan</td><td>30/120</td><td>Manual</td><td>Neighbour link-local address se configure</td></tr>
<tr><td>Point-to-multipoint</td><td>Nahi</td><td>30/120</td><td>Automatic</td><td>Apna address /128 (LA bit) advertise karta hai</td></tr>
<tr><td>Point-to-multipoint non-broadcast</td><td>Nahi</td><td>30/120</td><td>Manual</td><td>Bina multicast wale hub-and-spoke ke liye</td></tr>
</table>
<p>NBMA types ke liye neighbour command neighbour ka <b>link-local</b> address leti hai, jaise interface par <code>ipv6 ospf neighbor FE80::5200:FF:FE02:0</code>. Global address kaam nahi karega, kyunki OSPFv3 link-local par baat karta hai.</p>

<h3>Lab task 2: transit links par point-to-point</h3>
<p>Default mein dono Ethernet transit links broadcast hain. Har ek par sirf do routers hone ke baad bhi aapko DR election, startup par 40-second wait timer, ek network LSA aur ek DR-originated prefix LSA milta hai. Point-to-point yeh sab hata deta hai:</p>
<pre class="code"><span class="c">! R1</span>
interface GigabitEthernet0/0
 ipv6 ospf network point-to-point
<span class="c">! R2: dono transit links</span>
interface GigabitEthernet0/0
 ipv6 ospf network point-to-point
interface GigabitEthernet0/1
 ipv6 ospf network point-to-point
<span class="c">! R3</span>
interface GigabitEthernet0/0
 ipv6 ospf network point-to-point
<span class="c">! AF style mein har interface par equivalent: ospfv3 network point-to-point</span></pre>
<p>ABR par pehle aur baad mein:</p>
<pre class="out">R2# show ipv6 ospf neighbor          <span class="c">(pehle)</span>
Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
1.1.1.1           1   FULL/BDR        00:00:35    3               GigabitEthernet0/0
3.3.3.3           1   FULL/DR         00:00:31    3               GigabitEthernet0/1

R2# show ipv6 ospf neighbor          <span class="c">(baad mein)</span>
Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
<span class="hl">1.1.1.1           0   FULL/  -        00:00:36    3               GigabitEthernet0/0</span>
<span class="hl">3.3.3.3           0   FULL/  -        00:00:33    3               GigabitEthernet0/1</span></pre>
<p>Dash ka matlab hai "is network type par DR role nahi". Lab check R2 par exactly do <code>FULL/  -</code> neighbours ginta hai. Har interface par <code>show ipv6 ospf interface Gi0/1 | include Network Type</code> se confirm karo, jo <code>Network Type POINT_TO_POINT</code> kehna chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Network type mismatch">
<rect x="40" y="40" width="160" height="56" rx="8" fill="#bae6fd"/><text x="120" y="63" text-anchor="middle" class="svg-ink" font-size="13">R2 Gi0/1</text><text x="120" y="82" text-anchor="middle" class="svg-muted" font-size="12">point-to-point</text>
<rect x="440" y="40" width="160" height="56" rx="8" fill="#fed7aa"/><text x="520" y="63" text-anchor="middle" class="svg-ink" font-size="13">R3 Gi0/0</text><text x="520" y="82" text-anchor="middle" class="svg-muted" font-size="12">broadcast (DR)</text>
<line x1="200" y1="68" x2="440" y2="68" stroke="#64748b" stroke-width="2"/><text x="320" y="60" text-anchor="middle" class="svg-accent" font-size="12">dono taraf FULL</text>
<rect x="40" y="130" width="250" height="70" rx="8" fill="#e2e8f0"/><text x="165" y="155" text-anchor="middle" class="svg-ink" font-size="12">R2 router LSA: p2p link</text><text x="165" y="175" text-anchor="middle" class="svg-ink" font-size="12">router 3.3.3.3 tak</text>
<rect x="350" y="130" width="250" height="70" rx="8" fill="#e2e8f0"/><text x="475" y="155" text-anchor="middle" class="svg-ink" font-size="12">R3 router LSA: transit link</text><text x="475" y="175" text-anchor="middle" class="svg-ink" font-size="12">network LSA tak</text>
<text x="320" y="222" text-anchor="middle" class="svg-accent" font-size="12">Descriptions alag: SPF two-way check fail, routes gayab</text>
</svg><p class="cap">Broadcast/point-to-point mismatch FULL tak pahunchta hai, lekin dono router LSAs link ko alag describe karte hain, isliye SPF use use nahi karta.</p></div>

<h3>Mismatch trap detail mein</h3>
<p>Point-to-point aur broadcast dono 10/40 timers use karte hain, isliye aadha configure kiya link bhi FULL tak pahunch jaata hai. Lekin p2p end "router 3.3.3.3 tak link" describe karta hai, jabki broadcast end "us transit network tak link jiska DR ... hai" describe karta hai. SPF chahta hai ki link ke dono ends ek doosre ko describe karein (<b>two-way check</b>). Aisa nahi hota, isliye us link ke paar ke routes install nahi hote. Neighbours FULL, routes gayab: network type socho. Broadcast vs point-to-multipoint pakadna aasaan hai: timers alag hain (10/40 vs 30/120), isliye adjacency banti hi nahi.</p>

<div class="eg"><p><b>Worked example.</b> Naya broadcast adjacency DR elect karne se pehle 40-second tak ke <b>wait timer</b> ka intezaar karta hai, phir databases exchange karta hai. Point-to-point ke saath routers seedhe 2-WAY se EXSTART jaate hain. Lab mein reload ke baad R2 aur R3 lagbhag 40 ki jagah kuch seconds mein FULL ho jaate hain, aur area 1 se ek network LSA aur ek prefix LSA kam ho jaata hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Link ka sirf ek end badalna. Hamesha dono ends ek hi change window mein badlo, aur dono ko <code>show ipv6 ospf interface</code> se check karo. Ek aur galti: broadcast link ke dono ends par <code>ipv6 ospf priority 0</code> set karna; tab koi DR nahi ban sakta aur neighbours 2-WAY mein reh jaate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Broadcast LAN par do DROTHERs ke beech <code>2WAY/DROTHER</code> <b>normal</b> hai, fault nahi. Point-to-point aur point-to-multipoint par <code>FULL/  -</code> normal hai. Aur OSPFv2 aur OSPFv3 network types alag set hote hain: <code>ip ospf network</code> OSPFv3 ko nahi badalta.</p></div>

<div class="scn"><h4>Aadha implementation, aadhe routes</h4><p>Ek change request ne Pune WAN handoff par point-to-point maanga. Engineer ne core side configure ki, phir ek outage mein kheench liya gaya aur branch side kabhi nahi ki. Neighbours FULL rahe, isliye monitoring green rahi, lekin branch loopbacks aur branch LAN core routing table se gayab ho gaye. <code>show ipv6 ospf interface</code> ne ek end par POINT_TO_POINT aur doosre par BROADCAST dikhaya. Branch side configure karne se routes seconds mein wapas aa gaye.</p><p><b>Seekh:</b> FULL routing ka saboot nahi hai. Jab FULL adjacency ke paar routes gayab hon, dono ends ke network types compare karo.</p></div>

<div class="iv"><p class="q">"Aap Ethernet link par point-to-point kyun configure karoge, aur kya galat ho sakta hai?"</p><p>Strong answer: exactly do routers wale link par DR/BDR election kuch nahi jodta. Point-to-point election aur wait timer skip karta hai, network LSA aur DR ka prefix LSA hata deta hai, aur convergence tez karta hai. Risk mismatch ka hai: agar sirf ek end badla, to dono ends phir bhi FULL tak pahunchte hain, lekin SPF ka two-way check fail hota hai aur link ke paar routes gayab hote hain. Hamesha dono ends badlo aur <code>show ipv6 ospf interface</code> se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Match zaroori: area, hello/dead, instance ID, stub flags, authentication; MTU DBD mein check hota hai.</li>
<li>Broadcast aur point-to-point 10/40 use karte hain; NBMA aur point-to-multipoint 30/120.</li>
<li>Manual OSPFv3 neighbours neighbour ke link-local address se configure hote hain.</li>
<li><code>FULL/  -</code> matlab DR nahi; lab R2 par aise do expect karta hai.</li>
<li>Broadcast vs point-to-point mismatch: FULL lekin routes gayab.</li>
</ul></div>
`}};export{e as default};