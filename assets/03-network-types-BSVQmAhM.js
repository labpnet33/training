var e={id:`network-types`,h:{en:`OSPF network types: timers, DR behaviour and neighbour discovery`,hi:`OSPF network types: timers, DR behaviour aur neighbour discovery`},body:{en:`
<p>A meeting room and a phone call need different etiquette. In a room with twenty people you appoint a chairperson, or everyone talks over everyone. On a one-to-one phone call a chairperson is silly. Some conference lines cannot broadcast at all, so the host must dial each participant by name. OSPF <b>network types</b> are this etiquette: they tell an interface whether to elect a DR, how often to send Hellos, whether to find neighbours by multicast or by manual configuration, and how to describe the link in the router LSA.</p>

<h3>The six network types on Cisco IOS</h3>
<table class="cmp"><tr><th>Network type</th><th>Default on</th><th>DR/BDR</th><th>Hello/Dead</th><th>Neighbours</th></tr>
<tr><td>Broadcast</td><td>Ethernet</td><td>Yes</td><td>10 / 40</td><td>Automatic, 224.0.0.5</td></tr>
<tr><td>Point-to-point</td><td>Serial HDLC/PPP, GRE tunnels</td><td>No</td><td>10 / 40</td><td>Automatic</td></tr>
<tr><td>Non-broadcast (NBMA)</td><td>Frame Relay main interface</td><td>Yes</td><td>30 / 120</td><td>Manual <code>neighbor</code>, unicast</td></tr>
<tr><td>Point-to-multipoint</td><td>Never (configured)</td><td>No</td><td>30 / 120</td><td>Automatic</td></tr>
<tr><td>Point-to-multipoint non-broadcast</td><td>Never (configured)</td><td>No</td><td>30 / 120</td><td>Manual <code>neighbor</code></td></tr>
<tr><td>Loopback</td><td>Loopback interfaces</td><td>n/a</td><td>n/a</td><td>None; advertised as /32 host</td></tr></table>

<p>Change the type per interface with <code>ip ospf network {broadcast | point-to-point | non-broadcast | point-to-multipoint [non-broadcast]}</code>. The Dead interval defaults to four times the Hello, and the <b>Wait</b> timer (how long a broadcast or NBMA interface listens for an existing DR before electing one) equals the Dead interval.</p>

<h3>Broadcast: the DR/BDR model, revisited</h3>
<p>From CCNA you know the rules: highest interface priority wins (default 1, range 0 to 255, 0 means never), then highest router ID; the election is non-preemptive. At CCNP level remember why it exists. On a segment with n routers, full-mesh adjacencies would be n(n-1)/2. With a DR, each DROTHER forms FULL only with the DR and BDR, and stays in 2-Way with other DROTHERs. DROTHERs send updates to <code>224.0.0.6</code> (DR and BDR); the DR re-floods them to <code>224.0.0.5</code>. The DR also originates the <b>type 2 network LSA</b> that represents the segment as a pseudonode in the SPF tree.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Broadcast versus point-to-point adjacencies">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="13">Broadcast segment, 4 routers</text>
<line x1="40" y1="110" x2="280" y2="110" stroke="#64748b" stroke-width="3"/>
<rect x="30" y="45" width="60" height="32" rx="6" fill="#ddd6fe"/><text x="60" y="66" text-anchor="middle" class="svg-ink" font-size="12">DR</text>
<rect x="110" y="45" width="60" height="32" rx="6" fill="#bae6fd"/><text x="140" y="66" text-anchor="middle" class="svg-ink" font-size="12">BDR</text>
<rect x="190" y="140" width="70" height="32" rx="6" fill="#e2e8f0"/><text x="225" y="161" text-anchor="middle" class="svg-ink" font-size="12">DROTHER</text>
<rect x="60" y="140" width="70" height="32" rx="6" fill="#e2e8f0"/><text x="95" y="161" text-anchor="middle" class="svg-ink" font-size="12">DROTHER</text>
<line x1="60" y1="77" x2="60" y2="110" stroke="#64748b"/><line x1="140" y1="77" x2="140" y2="110" stroke="#64748b"/><line x1="95" y1="110" x2="95" y2="140" stroke="#64748b"/><line x1="225" y1="110" x2="225" y2="140" stroke="#64748b"/>
<text x="160" y="200" text-anchor="middle" class="svg-muted" font-size="12">FULL only with DR/BDR; type 2 LSA</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="13">Point-to-point link</text>
<rect x="380" y="90" width="70" height="40" rx="6" fill="#bbf7d0"/><text x="415" y="115" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<rect x="530" y="90" width="70" height="40" rx="6" fill="#bbf7d0"/><text x="565" y="115" text-anchor="middle" class="svg-ink" font-size="12">R2</text>
<line x1="450" y1="110" x2="530" y2="110" stroke="#64748b" stroke-width="3"/>
<text x="490" y="100" text-anchor="middle" class="svg-accent" font-size="12">FULL/ -</text>
<text x="490" y="200" text-anchor="middle" class="svg-muted" font-size="12">No DR, no wait, no type 2 LSA</text>
</svg><p class="cap">A DR saves adjacencies on shared segments; on a two-router link it only adds delay and an extra LSA.</p></div>

<h3>Point-to-point</h3>
<p>Exactly two routers. No election, no Wait timer, so the neighbour goes straight from 2-Way to ExStart. The subnet mask in the Hello is not checked. In the router LSA the link appears as two entries: a <b>point-to-point link</b> to the neighbour's RID and a <b>stub network</b> for the subnet. The neighbour table shows <code>FULL/  -</code>.</p>

<h3>NBMA and point-to-multipoint</h3>
<p>Non-broadcast networks (legacy Frame Relay, some cloud or DMVPN designs) cannot deliver multicast, so neighbours are configured with <code>neighbor 10.1.1.2</code> under the OSPF process and Hellos go unicast. A DR is still elected, and the DR must have direct connectivity to every other router, which is a headache in hub-and-spoke. <b>Point-to-multipoint</b> solves that: no DR, every neighbour relationship is treated as a separate point-to-point link, and each router advertises its own interface address as a /32 host route so spokes reach each other through the hub. Use the non-broadcast variant when multicast is not possible.</p>

<h3>Loopback</h3>
<p>A loopback is advertised as a <b>/32 stub host route</b> whatever mask you configure, because it can only ever be one host. Configure <code>ip ospf network point-to-point</code> on the loopback to advertise the configured mask instead. You will do exactly this on R3 Loopback1 (10.33.33.1/24) in lab 2.</p>

<pre class="out">R2# show ip ospf interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet Address 10.0.12.2/30, Area 0, Attached via Network Statement
  Process ID 1, Router ID 2.2.2.2, <span class="hl">Network Type BROADCAST, Cost: 1</span>
  Transmit Delay is 1 sec, <span class="hl">State DR, Priority 1</span>
  Designated Router (ID) 2.2.2.2, Interface address 10.0.12.2
  Backup Designated router (ID) 1.1.1.1, Interface address 10.0.12.1
  <span class="hl">Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5</span></pre>

<div class="eg"><p><b>Worked example: what happens with mixed types.</b> R1 broadcast (10/40) and R2 non-broadcast (30/120): timers differ, <b>no neighbour</b>. R1 point-to-point (10/40) and R2 point-to-multipoint (30/120): timers differ, no neighbour. R1 broadcast and R2 point-to-point: timers match (10/40), so they become <b>FULL</b>, but R1 describes the link as a transit network to a DR while R2 describes a point-to-point link. SPF's two-way check fails and <b>routes over that link are missing</b> even though the neighbour looks healthy. R1 point-to-point and R2 point-to-multipoint with Hello changed to 10 on R2: FULL and working, because neither elects a DR.</p></div>

<div class="warn"><p><b>Common mistake.</b> Fixing a timer mismatch between broadcast and non-broadcast by adjusting timers only. The adjacency forms, but you now have a non-broadcast interface waiting for unicast neighbours that will never be configured. Choose matching network types first, then tune timers.</p></div>

<div class="exam"><p><b>Exam trap.</b> Point-to-multipoint does <b>not</b> elect a DR, but non-broadcast <b>does</b>. Both default to Hello 30 / Dead 120. Ethernet defaults to broadcast, serial and GRE tunnels to point-to-point, loopbacks to loopback.</p></div>

<div class="scn"><h4>The DMVPN spokes that could not reach each other</h4><p>A company ran OSPF over a hub-and-spoke tunnel with the default point-to-point type on the hub's multipoint tunnel. Only one spoke at a time stayed FULL, and neighbours flapped whenever a new spoke came up, because a point-to-point interface expects exactly one neighbour. Changing the hub and spokes to <code>ip ospf network point-to-multipoint</code> gave each spoke its own adjacency to the hub, with /32 routes for every tunnel endpoint, and spoke-to-spoke reachability through the hub.</p><p><b>Lesson:</b> pick the network type that matches the real topology: two routers, many routers with multicast, or hub-and-spoke.</p></div>

<div class="iv"><p class="q">"Which OSPF network types elect a DR, and what are their default timers?"</p><p>Strong answer: broadcast (10/40) and non-broadcast (30/120) elect a DR and BDR. Point-to-point (10/40), point-to-multipoint (30/120) and point-to-multipoint non-broadcast (30/120) do not. Add that a broadcast/point-to-point mismatch forms FULL but breaks SPF, which is a favourite trick question.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Network type controls DR election, timers, neighbour discovery and how the link appears in the router LSA.</li>
<li>Broadcast and NBMA elect a DR; point-to-point and point-to-multipoint do not.</li>
<li>10/40 for broadcast and point-to-point; 30/120 for NBMA and point-to-multipoint.</li>
<li>Loopbacks advertise /32 unless set to point-to-point.</li>
<li>Broadcast on one end and point-to-point on the other gives FULL neighbours but missing routes.</li>
</ul></div>
`,hi:`
<p>Meeting room aur phone call ke liye alag etiquette chahiye. Bees logon ke kamre mein aap ek chairperson banate ho, warna sab ek doosre ke upar bolte hain. Ek-se-ek phone call par chairperson banana bekaar hai. Kuch conference lines broadcast kar hi nahi sakti, isliye host ko har participant ko naam se dial karna padta hai. OSPF <b>network types</b> yahi etiquette hain: yeh interface ko batate hain ki DR elect karna hai ya nahi, Hellos kitni baar bhejne hain, neighbours multicast se dhoondhne hain ya manual configuration se, aur router LSA mein link ko kaise describe karna hai.</p>

<h3>Cisco IOS par chhe network types</h3>
<table class="cmp"><tr><th>Network type</th><th>Default kahan</th><th>DR/BDR</th><th>Hello/Dead</th><th>Neighbours</th></tr>
<tr><td>Broadcast</td><td>Ethernet</td><td>Haan</td><td>10 / 40</td><td>Automatic, 224.0.0.5</td></tr>
<tr><td>Point-to-point</td><td>Serial HDLC/PPP, GRE tunnels</td><td>Nahi</td><td>10 / 40</td><td>Automatic</td></tr>
<tr><td>Non-broadcast (NBMA)</td><td>Frame Relay main interface</td><td>Haan</td><td>30 / 120</td><td>Manual <code>neighbor</code>, unicast</td></tr>
<tr><td>Point-to-multipoint</td><td>Kabhi nahi (configure karna padta hai)</td><td>Nahi</td><td>30 / 120</td><td>Automatic</td></tr>
<tr><td>Point-to-multipoint non-broadcast</td><td>Kabhi nahi (configure karna padta hai)</td><td>Nahi</td><td>30 / 120</td><td>Manual <code>neighbor</code></td></tr>
<tr><td>Loopback</td><td>Loopback interfaces</td><td>n/a</td><td>n/a</td><td>Koi nahi; /32 host ke roop mein advertise</td></tr></table>

<p>Type ko per interface <code>ip ospf network {broadcast | point-to-point | non-broadcast | point-to-multipoint [non-broadcast]}</code> se badlo. Dead interval default mein Hello ka chaar guna hota hai, aur <b>Wait</b> timer (broadcast ya NBMA interface existing DR ke liye elect karne se pehle kitni der sunta hai) Dead interval ke barabar hota hai.</p>

<h3>Broadcast: DR/BDR model, dobara</h3>
<p>CCNA se aapko rules pata hain: sabse zyada interface priority jeetti hai (default 1, range 0 se 255, 0 matlab kabhi nahi), phir sabse bada router ID; election non-preemptive hai. CCNP level par yaad rakho ki yeh kyun hai. n routers wale segment par full-mesh adjacencies n(n-1)/2 hongi. DR ke saath har DROTHER sirf DR aur BDR ke saath FULL banata hai, aur doosre DROTHERs ke saath 2-Way mein rehta hai. DROTHERs updates <code>224.0.0.6</code> (DR aur BDR) par bhejte hain; DR unhe <code>224.0.0.5</code> par re-flood karta hai. DR hi <b>type 2 network LSA</b> banata hai jo SPF tree mein segment ko pseudonode ke roop mein represent karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Broadcast vs point-to-point adjacencies">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="13">Broadcast segment, 4 routers</text>
<line x1="40" y1="110" x2="280" y2="110" stroke="#64748b" stroke-width="3"/>
<rect x="30" y="45" width="60" height="32" rx="6" fill="#ddd6fe"/><text x="60" y="66" text-anchor="middle" class="svg-ink" font-size="12">DR</text>
<rect x="110" y="45" width="60" height="32" rx="6" fill="#bae6fd"/><text x="140" y="66" text-anchor="middle" class="svg-ink" font-size="12">BDR</text>
<rect x="190" y="140" width="70" height="32" rx="6" fill="#e2e8f0"/><text x="225" y="161" text-anchor="middle" class="svg-ink" font-size="12">DROTHER</text>
<rect x="60" y="140" width="70" height="32" rx="6" fill="#e2e8f0"/><text x="95" y="161" text-anchor="middle" class="svg-ink" font-size="12">DROTHER</text>
<line x1="60" y1="77" x2="60" y2="110" stroke="#64748b"/><line x1="140" y1="77" x2="140" y2="110" stroke="#64748b"/><line x1="95" y1="110" x2="95" y2="140" stroke="#64748b"/><line x1="225" y1="110" x2="225" y2="140" stroke="#64748b"/>
<text x="160" y="200" text-anchor="middle" class="svg-muted" font-size="12">FULL sirf DR/BDR se; type 2 LSA</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="13">Point-to-point link</text>
<rect x="380" y="90" width="70" height="40" rx="6" fill="#bbf7d0"/><text x="415" y="115" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<rect x="530" y="90" width="70" height="40" rx="6" fill="#bbf7d0"/><text x="565" y="115" text-anchor="middle" class="svg-ink" font-size="12">R2</text>
<line x1="450" y1="110" x2="530" y2="110" stroke="#64748b" stroke-width="3"/>
<text x="490" y="100" text-anchor="middle" class="svg-accent" font-size="12">FULL/ -</text>
<text x="490" y="200" text-anchor="middle" class="svg-muted" font-size="12">Na DR, na wait, na type 2 LSA</text>
</svg><p class="cap">Shared segments par DR adjacencies bachata hai; do router wale link par sirf delay aur ek extra LSA jodta hai.</p></div>

<h3>Point-to-point</h3>
<p>Bilkul do routers. Koi election nahi, koi Wait timer nahi, isliye neighbour 2-Way se seedha ExStart mein jaata hai. Hello ka subnet mask check nahi hota. Router LSA mein link do entries ke roop mein dikhta hai: neighbour ke RID tak ek <b>point-to-point link</b> aur subnet ke liye ek <b>stub network</b>. Neighbour table <code>FULL/  -</code> dikhati hai.</p>

<h3>NBMA aur point-to-multipoint</h3>
<p>Non-broadcast networks (purana Frame Relay, kuch cloud ya DMVPN designs) multicast deliver nahi kar sakte, isliye neighbours OSPF process ke andar <code>neighbor 10.1.1.2</code> se configure hote hain aur Hellos unicast jaate hain. DR phir bhi elect hota hai, aur DR ka har doosre router se direct connectivity hona zaroori hai, jo hub-and-spoke mein sirdard hai. <b>Point-to-multipoint</b> ise solve karta hai: koi DR nahi, har neighbour relationship alag point-to-point link ki tarah treat hota hai, aur har router apna interface address /32 host route ke roop mein advertise karta hai taaki spokes hub ke through ek doosre tak pahunchein. Jab multicast possible na ho to non-broadcast variant use karo.</p>

<h3>Loopback</h3>
<p>Loopback <b>/32 stub host route</b> ke roop mein advertise hota hai, chahe aap koi bhi mask configure karo, kyunki woh sirf ek hi host ho sakta hai. Configured mask advertise karne ke liye loopback par <code>ip ospf network point-to-point</code> lagao. Lab 2 mein aap R3 Loopback1 (10.33.33.1/24) par exactly yahi karoge.</p>

<pre class="out">R2# show ip ospf interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet Address 10.0.12.2/30, Area 0, Attached via Network Statement
  Process ID 1, Router ID 2.2.2.2, <span class="hl">Network Type BROADCAST, Cost: 1</span>
  Transmit Delay is 1 sec, <span class="hl">State DR, Priority 1</span>
  Designated Router (ID) 2.2.2.2, Interface address 10.0.12.2
  Backup Designated router (ID) 1.1.1.1, Interface address 10.0.12.1
  <span class="hl">Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5</span></pre>

<div class="eg"><p><b>Worked example: mixed types ke saath kya hota hai.</b> R1 broadcast (10/40) aur R2 non-broadcast (30/120): timers alag, <b>koi neighbour nahi</b>. R1 point-to-point (10/40) aur R2 point-to-multipoint (30/120): timers alag, koi neighbour nahi. R1 broadcast aur R2 point-to-point: timers match (10/40), isliye woh <b>FULL</b> ban jaate hain, par R1 link ko DR wale transit network ki tarah describe karta hai jabki R2 point-to-point link ki tarah. SPF ka two-way check fail hota hai aur <b>us link ke through routes missing</b> rehte hain, jabki neighbour healthy dikhta hai. R1 point-to-point aur R2 point-to-multipoint jismein R2 par Hello 10 kiya gaya: FULL aur kaam karta hai, kyunki dono mein se koi DR elect nahi karta.</p></div>

<div class="warn"><p><b>Common galti.</b> Broadcast aur non-broadcast ke beech timer mismatch ko sirf timers adjust karke fix karna. Adjacency ban jaati hai, lekin ab aapka non-broadcast interface aise unicast neighbours ka wait kar raha hai jo kabhi configure nahi honge. Pehle matching network types chuno, phir timers tune karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Point-to-multipoint DR elect <b>nahi</b> karta, lekin non-broadcast <b>karta hai</b>. Dono ka default Hello 30 / Dead 120 hai. Ethernet ka default broadcast hai, serial aur GRE tunnels ka point-to-point, loopbacks ka loopback.</p></div>

<div class="scn"><h4>DMVPN spokes jo ek doosre tak nahi pahunch paaye</h4><p>Ek company hub-and-spoke tunnel par OSPF chala rahi thi, hub ke multipoint tunnel par default point-to-point type ke saath. Ek samay mein sirf ek spoke FULL rehta tha, aur jab bhi naya spoke up hota neighbours flap karte, kyunki point-to-point interface exactly ek neighbour expect karta hai. Hub aur spokes ko <code>ip ospf network point-to-multipoint</code> par badalne se har spoke ki hub ke saath apni adjacency bani, har tunnel endpoint ke /32 routes ke saath, aur hub ke through spoke-to-spoke reachability mili.</p><p><b>Seekh:</b> woh network type chuno jo asli topology se match kare: do routers, multicast wale kai routers, ya hub-and-spoke.</p></div>

<div class="iv"><p class="q">"Kaunse OSPF network types DR elect karte hain, aur unke default timers kya hain?"</p><p>Strong answer: broadcast (10/40) aur non-broadcast (30/120) DR aur BDR elect karte hain. Point-to-point (10/40), point-to-multipoint (30/120) aur point-to-multipoint non-broadcast (30/120) nahi karte. Jodo ki broadcast/point-to-point mismatch FULL banata hai par SPF tod deta hai, jo ek favourite trick question hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Network type DR election, timers, neighbour discovery aur router LSA mein link kaise dikhe, yeh sab control karta hai.</li>
<li>Broadcast aur NBMA DR elect karte hain; point-to-point aur point-to-multipoint nahi.</li>
<li>Broadcast aur point-to-point ke liye 10/40; NBMA aur point-to-multipoint ke liye 30/120.</li>
<li>Loopbacks /32 advertise karte hain jab tak point-to-point set na ho.</li>
<li>Ek end broadcast aur doosra point-to-point: FULL neighbours par missing routes.</li>
</ul></div>
`}};export{e as default};