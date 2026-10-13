var e={id:`p2p-ethernet`,h:{en:`Point-to-point on Ethernet, timers and passive-interface`,hi:`Ethernet par point-to-point, timers aur passive-interface`},body:{en:`
<p>Imagine a two-person office that insists on holding a formal election for a chairperson every time one of them comes back from lunch, and then writes a separate memo announcing the result to head office. That is what a routed Ethernet link between two routers does with the default broadcast network type. Almost every link between routers in a modern campus or data centre is a two-router Ethernet link, so this chapter is about removing that ceremony.</p>

<h3>Why point-to-point on Ethernet</h3>
<ul>
<li><b>Faster adjacency.</b> A broadcast interface waits for the Wait timer (40 seconds by default) before electing a DR if none exists. Point-to-point skips it; the neighbour goes FULL in a few seconds after the link comes up.</li>
<li><b>Smaller LSDB.</b> No DR means no type 2 network LSA for the link. The link is described inside each router's type 1 LSA.</li>
<li><b>Simpler SPF.</b> No pseudonode in the graph; the two routers connect directly.</li>
<li><b>No DR surprises.</b> Nobody has to plan priorities, and a reload never moves the DR role.</li>
</ul>
<p>Use it only when the segment truly has two OSPF routers. If you later plug a third router into that VLAN, point-to-point will not form correct adjacencies with it.</p>

<h3>Lab 2 walkthrough</h3>
<p>R1, R2 and R3 are chained: R1 Gi0/0 10.0.12.1/30 to R2 Gi0/0 10.0.12.2, and R2 Gi0/1 10.0.23.1/30 to R3 Gi0/0 10.0.23.2. All run <code>router ospf 1</code> with <code>network 0.0.0.0 255.255.255.255 area 0</code>. Before any change, R2 shows DR and BDR roles on both links and the database has a "Net Link States" section.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Lab 2 topology">
<rect x="40" y="50" width="110" height="44" rx="8" fill="#bae6fd"/><text x="95" y="77" text-anchor="middle" class="svg-ink" font-size="13">R1 1.1.1.1</text>
<rect x="265" y="50" width="110" height="44" rx="8" fill="#bae6fd"/><text x="320" y="77" text-anchor="middle" class="svg-ink" font-size="13">R2 2.2.2.2</text>
<rect x="490" y="50" width="110" height="44" rx="8" fill="#bae6fd"/><text x="545" y="77" text-anchor="middle" class="svg-ink" font-size="13">R3 3.3.3.3</text>
<line x1="150" y1="72" x2="265" y2="72" stroke="#64748b" stroke-width="3"/><line x1="375" y1="72" x2="490" y2="72" stroke="#64748b" stroke-width="3"/>
<text x="207" y="40" text-anchor="middle" class="svg-accent" font-size="12">10.0.12.0/30</text><text x="432" y="40" text-anchor="middle" class="svg-accent" font-size="12">10.0.23.0/30</text>
<text x="207" y="115" text-anchor="middle" class="svg-muted" font-size="12">P2P, Hello 5/Dead 20</text><text x="432" y="115" text-anchor="middle" class="svg-muted" font-size="12">P2P</text>
<rect x="490" y="125" width="110" height="30" rx="6" fill="#bbf7d0"/><text x="545" y="145" text-anchor="middle" class="svg-ink" font-size="12">Lo1 10.33.33.1/24</text>
</svg><p class="cap">Lab 2: two transit links converted to point-to-point, one tuned link and one loopback advertised with its real mask.</p></div>

<pre class="code"><span class="c">! Task 1: R1-R2 link, both ends</span>
R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip ospf network point-to-point
R2(config)# interface GigabitEthernet0/0
R2(config-if)# ip ospf network point-to-point
<span class="c">! Task 2: R2-R3 link, both ends</span>
R2(config)# interface GigabitEthernet0/1
R2(config-if)# ip ospf network point-to-point
R3(config)# interface GigabitEthernet0/0
R3(config-if)# ip ospf network point-to-point</pre>

<p>Changing the network type resets the adjacency once. While only one end is changed you may see the mismatch from chapter 3; finish both ends quickly.</p>

<pre class="out">R2# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">1.1.1.1           0   FULL/  -        00:00:37    10.0.12.1       GigabitEthernet0/0</span>
<span class="hl">3.3.3.3           0   FULL/  -        00:00:31    10.0.23.2       GigabitEthernet0/1</span>

R2# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Lo0          1     0               2.2.2.2/32         1     LOOP  0/0
Gi0/1        1     0               10.0.23.1/30       1     P2P   1/1
Gi0/0        1     0               10.0.12.2/30       1     P2P   1/1</pre>

<p>Task 3: <code>show ip ospf database</code> on R2 now lists only "Router Link States (Area 0)". The "Net Link States" section is gone because no DR exists.</p>

<h3>Tuning Hello and Dead timers</h3>
<p>Task 4 asks for Hello 5 / Dead 20 on the R1-R2 link. <code>ip ospf hello-interval 5</code> automatically sets Dead to four times Hello (20). If you set <code>ip ospf dead-interval</code> manually, it stays fixed even if you change Hello later. The timers are compared in every Hello, so while only R1 is changed the neighbour times out; configure both ends.</p>
<pre class="code">R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip ospf hello-interval 5
R2(config)# interface GigabitEthernet0/0
R2(config-if)# ip ospf hello-interval 5</pre>
<pre class="out">R1# show ip ospf interface GigabitEthernet0/0 | include Timer|Network
  Process ID 1, Router ID 1.1.1.1, <span class="hl">Network Type POINT_TO_POINT, Cost: 1</span>
  Timer intervals configured, <span class="hl">Hello 5, Dead 20</span>, Wait 20, Retransmit 5</pre>
<p>For sub-second failure detection, use <b>BFD</b> (<code>ip ospf bfd</code>) instead of aggressive OSPF timers; BFD runs in a lightweight process and does not load the OSPF control plane.</p>

<h3>Task 5: the loopback mask</h3>
<pre class="code">R3(config)# interface Loopback1
R3(config-if)# ip ospf network point-to-point</pre>
<p>Before: R1 shows <code>O 10.33.33.1/32</code>. After: <code>O 10.33.33.0/24 [110/3]</code>. The route is the same loopback, just advertised with its configured mask.</p>

<h3>passive-interface</h3>
<p>A <b>passive interface</b> still has its network advertised into OSPF, but sends no Hellos and forms no neighbours on it. Use it on every user LAN and loopback: it prevents rogue routers from forming adjacencies and injecting routes, and saves CPU. In lab 1, R5 already has <code>passive-interface GigabitEthernet0/1</code> on the plant LAN.</p>
<pre class="code">router ospf 1
 passive-interface default
 no passive-interface GigabitEthernet0/0
 no passive-interface GigabitEthernet0/1</pre>
<p><code>passive-interface default</code> makes everything passive; you then open only the router-facing links. This is the safest template for access and distribution routers.</p>

<div class="eg"><p><b>Worked example.</b> A distribution router has 2 uplinks and 40 SVIs for user VLANs. Without passive interfaces it sends 40 Hellos every 10 seconds into user VLANs, 14,400 useless packets per hour, and any laptop running a routing daemon could become a neighbour. With <code>passive-interface default</code> plus two <code>no passive-interface</code> lines, it sends Hellos on 2 interfaces only, and all 40 subnets are still advertised.</p></div>

<div class="warn"><p><b>Common mistake.</b> Making an uplink passive by accident (for example after applying <code>passive-interface default</code> and forgetting the exceptions). The subnet is still in the routing table of the neighbour via other paths, so it looks fine at first, but the adjacency on that link is gone. <code>show ip ospf interface Gi0/0</code> says "No Hellos (Passive interface)".</p></div>

<div class="exam"><p><b>Exam trap.</b> A passive interface still advertises its connected network. It is not a filter. And changing the Hello interval changes Dead to four times Hello automatically, unless Dead was set manually.</p></div>

<div class="scn"><h4>The 40-second outage after every reload</h4><p>In a data centre, every time a spine switch reloaded, some leaf routes took about 40 seconds longer than expected to return. The engineer compared timestamps in the logs and saw neighbours sitting in 2WAY until the Wait timer expired on the broadcast-type uplinks. Converting all routed leaf-spine links to <code>ip ospf network point-to-point</code> removed the Wait timer and the type 2 LSAs; adjacencies came back within seconds of the link.</p><p><b>Lesson:</b> on two-router Ethernet links, point-to-point is the standard design choice.</p></div>

<div class="iv"><p class="q">"Why do many engineers configure point-to-point on Ethernet links, and what are the risks?"</p><p>Strong answer: no DR/BDR election, no 40-second Wait timer, no type 2 LSA, a smaller and simpler SPF graph, and neighbour state FULL/-. The risks: both ends must match, and if more than two routers ever share the segment the design breaks. Mention passive-interface default as the companion best practice.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Point-to-point on Ethernet removes the DR election, the Wait timer and the type 2 LSA.</li>
<li>Configure it on both ends; neighbours then show FULL/ - and interfaces show P2P.</li>
<li><code>ip ospf hello-interval 5</code> gives Dead 20 automatically; timers must match on both ends.</li>
<li>Point-to-point on a loopback advertises its real mask instead of /32.</li>
<li><code>passive-interface</code> stops Hellos but still advertises the network; use <code>passive-interface default</code> on access routers.</li>
</ul></div>
`,hi:`
<p>Socho do logon ka ek office jo har baar kisi ke lunch se wapas aane par chairperson ka formal election karta hai, aur phir result announce karne ke liye head office ko alag memo likhta hai. Default broadcast network type ke saath do routers ke beech routed Ethernet link yahi karta hai. Modern campus ya data centre mein routers ke beech lagbhag har link do-router Ethernet link hota hai, isliye yeh chapter us ceremony ko hatane ke baare mein hai.</p>

<h3>Ethernet par point-to-point kyun</h3>
<ul>
<li><b>Tez adjacency.</b> Broadcast interface DR na hone par elect karne se pehle Wait timer (default 40 second) ka intezaar karta hai. Point-to-point ise skip karta hai; link up hone ke kuch second mein neighbour FULL ho jaata hai.</li>
<li><b>Chhota LSDB.</b> DR nahi to link ke liye type 2 network LSA nahi. Link har router ke type 1 LSA ke andar describe hota hai.</li>
<li><b>Simple SPF.</b> Graph mein koi pseudonode nahi; dono routers seedhe jude hain.</li>
<li><b>DR ke surprises nahi.</b> Kisi ko priorities plan nahi karni padti, aur reload kabhi DR role nahi hilata.</li>
</ul>
<p>Ise sirf tab use karo jab segment par sach mein do OSPF routers hon. Agar baad mein aap us VLAN mein teesra router lagaoge, to point-to-point uske saath sahi adjacencies nahi banayega.</p>

<h3>Lab 2 walkthrough</h3>
<p>R1, R2 aur R3 chain mein hain: R1 Gi0/0 10.0.12.1/30 se R2 Gi0/0 10.0.12.2, aur R2 Gi0/1 10.0.23.1/30 se R3 Gi0/0 10.0.23.2. Sab <code>router ospf 1</code> ke saath <code>network 0.0.0.0 255.255.255.255 area 0</code> chalate hain. Kisi change se pehle R2 dono links par DR aur BDR roles dikhata hai aur database mein "Net Link States" section hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Lab 2 topology">
<rect x="40" y="50" width="110" height="44" rx="8" fill="#bae6fd"/><text x="95" y="77" text-anchor="middle" class="svg-ink" font-size="13">R1 1.1.1.1</text>
<rect x="265" y="50" width="110" height="44" rx="8" fill="#bae6fd"/><text x="320" y="77" text-anchor="middle" class="svg-ink" font-size="13">R2 2.2.2.2</text>
<rect x="490" y="50" width="110" height="44" rx="8" fill="#bae6fd"/><text x="545" y="77" text-anchor="middle" class="svg-ink" font-size="13">R3 3.3.3.3</text>
<line x1="150" y1="72" x2="265" y2="72" stroke="#64748b" stroke-width="3"/><line x1="375" y1="72" x2="490" y2="72" stroke="#64748b" stroke-width="3"/>
<text x="207" y="40" text-anchor="middle" class="svg-accent" font-size="12">10.0.12.0/30</text><text x="432" y="40" text-anchor="middle" class="svg-accent" font-size="12">10.0.23.0/30</text>
<text x="207" y="115" text-anchor="middle" class="svg-muted" font-size="12">P2P, Hello 5/Dead 20</text><text x="432" y="115" text-anchor="middle" class="svg-muted" font-size="12">P2P</text>
<rect x="490" y="125" width="110" height="30" rx="6" fill="#bbf7d0"/><text x="545" y="145" text-anchor="middle" class="svg-ink" font-size="12">Lo1 10.33.33.1/24</text>
</svg><p class="cap">Lab 2: do transit links point-to-point mein badle, ek link tune kiya, aur ek loopback asli mask ke saath advertise.</p></div>

<pre class="code"><span class="c">! Task 1: R1-R2 link, dono ends</span>
R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip ospf network point-to-point
R2(config)# interface GigabitEthernet0/0
R2(config-if)# ip ospf network point-to-point
<span class="c">! Task 2: R2-R3 link, dono ends</span>
R2(config)# interface GigabitEthernet0/1
R2(config-if)# ip ospf network point-to-point
R3(config)# interface GigabitEthernet0/0
R3(config-if)# ip ospf network point-to-point</pre>

<p>Network type badalne se adjacency ek baar reset hoti hai. Jab tak sirf ek end badla hai, aapko chapter 3 wala mismatch dikh sakta hai; dono ends jaldi khatam karo.</p>

<pre class="out">R2# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">1.1.1.1           0   FULL/  -        00:00:37    10.0.12.1       GigabitEthernet0/0</span>
<span class="hl">3.3.3.3           0   FULL/  -        00:00:31    10.0.23.2       GigabitEthernet0/1</span>

R2# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Lo0          1     0               2.2.2.2/32         1     LOOP  0/0
Gi0/1        1     0               10.0.23.1/30       1     P2P   1/1
Gi0/0        1     0               10.0.12.2/30       1     P2P   1/1</pre>

<p>Task 3: R2 par <code>show ip ospf database</code> ab sirf "Router Link States (Area 0)" dikhata hai. "Net Link States" section gayab hai kyunki koi DR nahi hai.</p>

<h3>Hello aur Dead timers tune karna</h3>
<p>Task 4 R1-R2 link par Hello 5 / Dead 20 maangta hai. <code>ip ospf hello-interval 5</code> Dead ko apne aap Hello ka chaar guna (20) kar deta hai. Agar aap <code>ip ospf dead-interval</code> manually set karte ho, to baad mein Hello badalne par bhi woh fixed rehta hai. Timers har Hello mein compare hote hain, isliye jab tak sirf R1 badla hai neighbour time out hota hai; dono ends configure karo.</p>
<pre class="code">R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip ospf hello-interval 5
R2(config)# interface GigabitEthernet0/0
R2(config-if)# ip ospf hello-interval 5</pre>
<pre class="out">R1# show ip ospf interface GigabitEthernet0/0 | include Timer|Network
  Process ID 1, Router ID 1.1.1.1, <span class="hl">Network Type POINT_TO_POINT, Cost: 1</span>
  Timer intervals configured, <span class="hl">Hello 5, Dead 20</span>, Wait 20, Retransmit 5</pre>
<p>Sub-second failure detection ke liye aggressive OSPF timers ki jagah <b>BFD</b> (<code>ip ospf bfd</code>) use karo; BFD ek halke process mein chalta hai aur OSPF control plane par load nahi daalta.</p>

<h3>Task 5: loopback ka mask</h3>
<pre class="code">R3(config)# interface Loopback1
R3(config-if)# ip ospf network point-to-point</pre>
<p>Pehle: R1 <code>O 10.33.33.1/32</code> dikhata hai. Baad mein: <code>O 10.33.33.0/24 [110/3]</code>. Route wahi loopback hai, bas apne configured mask ke saath advertise hua.</p>

<h3>passive-interface</h3>
<p><b>Passive interface</b> ka network OSPF mein advertise hota rehta hai, lekin us par na Hellos jaate hain na neighbours bante hain. Ise har user LAN aur loopback par use karo: yeh rogue routers ko adjacency banakar routes inject karne se rokta hai, aur CPU bachata hai. Lab 1 mein R5 par plant LAN ke liye pehle se <code>passive-interface GigabitEthernet0/1</code> hai.</p>
<pre class="code">router ospf 1
 passive-interface default
 no passive-interface GigabitEthernet0/0
 no passive-interface GigabitEthernet0/1</pre>
<p><code>passive-interface default</code> sab kuch passive kar deta hai; phir aap sirf router ki taraf wale links kholte ho. Access aur distribution routers ke liye yeh sabse safe template hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek distribution router ke 2 uplinks aur user VLANs ke 40 SVIs hain. Passive interfaces ke bina woh har 10 second mein user VLANs mein 40 Hellos bhejta hai, ghante mein 14,400 bekaar packets, aur routing daemon chalane wala koi bhi laptop neighbour ban sakta hai. <code>passive-interface default</code> plus do <code>no passive-interface</code> lines ke saath, woh sirf 2 interfaces par Hellos bhejta hai, aur saare 40 subnets phir bhi advertise hote hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Galti se uplink ko passive bana dena (jaise <code>passive-interface default</code> lagakar exceptions bhool jaana). Subnet neighbour ki routing table mein doosre paths se hota hai, isliye pehle sab theek lagta hai, lekin us link ki adjacency chali gayi hai. <code>show ip ospf interface Gi0/0</code> kehta hai "No Hellos (Passive interface)".</p></div>

<div class="exam"><p><b>Exam trap.</b> Passive interface apna connected network advertise karta rehta hai. Yeh filter nahi hai. Aur Hello interval badalne se Dead apne aap Hello ka chaar guna ho jaata hai, jab tak Dead manually set na ho.</p></div>

<div class="scn"><h4>Har reload ke baad 40 second ka outage</h4><p>Ek data centre mein jab bhi spine switch reload hota, kuch leaf routes expected se lagbhag 40 second der se wapas aate. Engineer ne logs ke timestamps compare kiye aur dekha ki broadcast-type uplinks par Wait timer khatam hone tak neighbours 2WAY mein baithe rehte. Saare routed leaf-spine links ko <code>ip ospf network point-to-point</code> par badalne se Wait timer aur type 2 LSAs hat gaye; link aate hi seconds mein adjacencies wapas aa gayi.</p><p><b>Seekh:</b> do-router Ethernet links par point-to-point standard design choice hai.</p></div>

<div class="iv"><p class="q">"Bahut engineers Ethernet links par point-to-point kyun configure karte hain, aur iske risks kya hain?"</p><p>Strong answer: DR/BDR election nahi, 40 second ka Wait timer nahi, type 2 LSA nahi, chhota aur simple SPF graph, aur neighbour state FULL/-. Risks: dono ends match hone chahiye, aur agar kabhi segment par do se zyada routers aaye to design toot jaata hai. Saath wali best practice ke roop mein passive-interface default ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ethernet par point-to-point DR election, Wait timer aur type 2 LSA hata deta hai.</li>
<li>Ise dono ends par configure karo; phir neighbours FULL/ - aur interfaces P2P dikhate hain.</li>
<li><code>ip ospf hello-interval 5</code> apne aap Dead 20 deta hai; timers dono ends par match hone chahiye.</li>
<li>Loopback par point-to-point /32 ki jagah asli mask advertise karta hai.</li>
<li><code>passive-interface</code> Hellos rokta hai par network advertise karta rehta hai; access routers par <code>passive-interface default</code> use karo.</li>
</ul></div>
`}};export{e as default};