var e={id:`bfd-config`,h:{en:`BFD in practice: interface timers, clients, verification, dampening, design cautions`,hi:`BFD practice mein: interface timers, clients, verification, dampening, design cautions`},body:{en:`
<p>Installing a smoke detector is two jobs: mounting the detector, and wiring it to the alarm bell. A detector with no bell is useless. BFD is the same: you configure <b>timers on the interface</b> (the detector), and you <b>register clients</b> such as OSPF, EIGRP, BGP or static routes (the bells). Forget either half and nothing happens faster than before.</p>

<h3>Step 1: timers on the interface</h3>
<pre class="code"><span class="c">! EDGE, link to ISP1 (ISP1 mirrors this on its side)</span>
interface GigabitEthernet0/0
 bfd interval 50 min_rx 50 multiplier 3
 no ip redirects
<span class="c">! Optional: disable echo mode if the neighbour does not support it</span>
<span class="c">!  no bfd echo</span></pre>
<p><code>interval</code> is the desired transmit interval in milliseconds, <code>min_rx</code> the fastest rate this router accepts, and <code>multiplier</code> the number of missed packets before declaring the session down. Here detection is 50 x 3 = 150 ms if the neighbour uses the same values.</p>
<p>Newer IOS-XE releases also offer <b>templates</b>, which keep timers in one place and add dampening:</p>
<pre class="code">bfd-template single-hop FAST
 interval min-tx 50 min-rx 50 multiplier 3
 dampening 5 1000 2000 20
interface GigabitEthernet0/0
 bfd template FAST</pre>

<h3>Step 2: register the clients</h3>
<table class="cmp"><tr><th>Client</th><th>Configuration</th></tr>
<tr><td>OSPF (all interfaces)</td><td><code>router ospf 1</code> then <code>bfd all-interfaces</code> (exclude one with <code>ip ospf bfd disable</code>)</td></tr>
<tr><td>OSPF (one interface)</td><td><code>ip ospf bfd</code> on the interface</td></tr>
<tr><td>EIGRP classic</td><td><code>router eigrp 100</code> then <code>bfd all-interfaces</code> or <code>bfd interface GigabitEthernet0/0</code></td></tr>
<tr><td>EIGRP named</td><td><code>af-interface GigabitEthernet0/0</code> then <code>bfd</code></td></tr>
<tr><td>BGP</td><td><code>neighbor 10.0.1.1 fall-over bfd</code> (multihop peers use <code>fall-over bfd multi-hop</code> with a multi-hop template)</td></tr>
<tr><td>Static route</td><td><code>ip route static bfd GigabitEthernet0/0 10.0.1.1</code> plus a static route that names both the interface and the next hop</td></tr>
<tr><td>HSRP</td><td><code>standby bfd</code> on the interface</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> In the PBR lab, EDGE's default route to ISP1 is a plain static route. If ISP1's router hangs while the Ethernet link stays up, the default route stays in the table forever. With BFD it is removed within about 150 ms and a floating default toward ISP2 takes over:</p>
<pre class="code">ip route static bfd GigabitEthernet0/0 10.0.1.1
ip route 0.0.0.0 0.0.0.0 GigabitEthernet0/0 10.0.1.1
ip route 0.0.0.0 0.0.0.0 GigabitEthernet0/1 10.0.2.1 10</pre>
<p>The second route has administrative distance 10, so it appears only when the BFD-tracked route is withdrawn.</p></div>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="One BFD session shared by several clients">
<rect x="250" y="80" width="140" height="56" rx="10" fill="#fde68a"/><text x="320" y="104" text-anchor="middle" class="svg-ink" font-size="14">BFD session</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">to 10.0.1.1</text>
<rect x="20" y="20" width="120" height="40" rx="8" fill="#bae6fd"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="13">OSPF</text>
<rect x="20" y="90" width="120" height="40" rx="8" fill="#bae6fd"/><text x="80" y="115" text-anchor="middle" class="svg-ink" font-size="13">BGP</text>
<rect x="20" y="160" width="120" height="40" rx="8" fill="#bae6fd"/><text x="80" y="185" text-anchor="middle" class="svg-ink" font-size="13">Static route</text>
<rect x="500" y="80" width="120" height="56" rx="8" fill="#ddd6fe"/><text x="560" y="112" text-anchor="middle" class="svg-ink" font-size="13">ISP1</text>
<line x1="140" y1="40" x2="250" y2="95" stroke="#64748b" stroke-width="2"/><line x1="140" y1="110" x2="250" y2="108" stroke="#64748b" stroke-width="2"/><line x1="140" y1="180" x2="250" y2="122" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="108" x2="500" y2="108" stroke="#64748b" stroke-width="3"/><text x="445" y="100" text-anchor="middle" class="svg-accent" font-size="12">50 ms x 3</text>
</svg><p class="cap">Many clients, one BFD session per neighbour: when it goes down, all of them are told at once.</p></div>

<h3>Step 3: verify</h3>
<pre class="out">EDGE# show bfd neighbors
IPv4 Sessions
NeighAddr                              LD/RD         RH/RS     State     Int
<span class="hl">10.0.1.1                                 1/2          Up        Up        Gi0/0</span>

EDGE# show bfd neighbors details
IPv4 Sessions
NeighAddr                              LD/RD         RH/RS     State     Int
10.0.1.1                                 1/2          Up        Up        Gi0/0
<span class="hl">Session state is UP and using echo function with 50 ms interval.</span>
Session Host: Software
OurAddr: 10.0.1.2
Handle: 1
Local Diag: 0, Demand mode: 0, Poll bit: 0
MinTxInt: 1000000, MinRxInt: 1000000, Multiplier: 3
Received MinRxInt: 1000000, Received Multiplier: 3
Holddown (hits): 0(0), Hello (hits): 1000(1234)
Rx Count: 1240, Rx Interval (ms) min/max/avg: 1/1000/876 last: 312 ms ago
Tx Count: 1241, Tx Interval (ms) min/max/avg: 760/1000/879 last: 104 ms ago
<span class="hl">Registered protocols: OSPF CEF</span>
Uptime: 00:20:31
Last packet: Version: 1                  - Diagnostic: 0
             State bit: Up               - Demand bit: 0
             Poll bit: 0                 - Final bit: 0
             C bit: 0
             Multiplier: 3               - Length: 24
             My Discr.: 2                - Your Discr.: 1
             Min tx interval: 1000000    - Min rx interval: 1000000
             Min Echo interval: 50000</pre>
<p>Read it like this: LD/RD are the local and remote discriminators; RH/RS is the remote heard state and the session state. Because echo mode is active, the control timers show the 1-second slow timer (values in microseconds) and echo runs at 50 ms. <b>Registered protocols</b> tells you which clients will react; if your client is missing here, it is not registered. When a failure happens, the client logs the reason:</p>
<pre class="out">%OSPF-5-ADJCHG: Process 1, Nbr 10.0.1.1 on GigabitEthernet0/0 from FULL to DOWN, <span class="hl">Neighbor Down: BFD node down</span></pre>

<h3>Dampening</h3>
<p>A link that flaps every few seconds makes BFD tear down and rebuild adjacencies repeatedly, which is worse than a clean outage. <b>BFD dampening</b> works like BGP route dampening: each flap adds a penalty, the penalty decays with a half-life, and when it crosses the suppress threshold the session is held down until it decays below the reuse threshold (never longer than the maximum suppress time). In <code>dampening 5 1000 2000 20</code> the values are half-life 5 minutes, reuse 1000, suppress 2000 and maximum suppress 20 minutes.</p>

<h3>Design cautions</h3>
<ul>
<li><b>CPU and scale.</b> Software BFD at 50 ms on dozens of sessions can load a small router. Check platform limits; prefer hardware-offloaded BFD on large boxes.</li>
<li><b>Control-plane protection.</b> If CoPP or an interface ACL drops UDP 3784/3785, sessions never come up or flap under load.</li>
<li><b>Lossy or virtual paths.</b> On internet VPNs, wireless or busy virtual routers, aggressive timers cause false failures. Use gentler values such as 300 ms x 3.</li>
<li><b>High availability.</b> If a router uses SSO/NSF and a switchover takes longer than the BFD detection time, neighbours will declare it dead. Align BFD timers with the HA design.</li>
<li><b>OSPF on broadcast segments</b> builds BFD sessions only with neighbours in FULL state, so DROTHER-to-DROTHER pairs have no BFD.</li>
<li><b>BFD never brings anything up.</b> It only takes things down faster; adjacencies still form through their own protocol.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Configuring <code>bfd interval</code> on one router only. BFD needs both ends; the session stays down and, depending on the client, the adjacency may still form without BFD protection, so you believe you are protected when you are not. Always check <code>show bfd neighbors</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> For static routes, BFD requires <code>ip route static bfd INTERFACE NEXT-HOP</code> and a static route that includes both interface and next hop. For BGP the keyword is <code>fall-over bfd</code>, not "bfd" under the neighbour.</p></div>

<div class="scn"><h4>Fast timers, slow network</h4><p>A company enabled BFD at 50 ms x 3 on DMVPN tunnels over the internet. During evening peaks, jitter of 200 ms caused BFD to declare spokes down several times an hour, and each flap reset EIGRP and dropped calls. The team moved the tunnels to 500 ms x 3 and enabled dampening; detection was still under two seconds, and false flaps disappeared.</p><p><b>Lesson:</b> choose BFD timers for the path's real behaviour, not for the lowest number the router accepts.</p></div>

<div class="iv"><p class="q">"How would you make a static default route fail over quickly when the next-hop router hangs but the link stays up?"</p><p>Strong answer: configure BFD on the interface on both routers, then <code>ip route static bfd Gi0/0 10.0.1.1</code> and a static route naming both interface and next hop. When BFD goes down, the route is withdrawn and a floating static with higher AD takes over. Alternative: IP SLA with object tracking. Verify with <code>show bfd neighbors details</code> (static listed under Registered protocols) and <code>show ip route</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Two halves: <code>bfd interval X min_rx Y multiplier Z</code> on the interface, plus client registration.</li>
<li>Clients: OSPF/EIGRP <code>bfd all-interfaces</code>, BGP <code>fall-over bfd</code>, static <code>ip route static bfd</code>, HSRP <code>standby bfd</code>.</li>
<li><code>show bfd neighbors [details]</code>: state, timers, echo status and registered protocols.</li>
<li>Dampening suppresses a flapping session using penalty, half-life, suppress and reuse thresholds.</li>
<li>Mind CPU, CoPP, lossy paths, HA switchover time and OSPF DROTHER behaviour.</li>
</ul></div>
`,hi:`
<p>Smoke detector lagana do kaam hain: detector mount karna, aur use alarm bell se jodna. Bina bell ka detector bekaar hai. BFD bhi aisa hi hai: aap <b>interface par timers</b> configure karte ho (detector), aur OSPF, EIGRP, BGP ya static routes jaise <b>clients register</b> karte ho (bells). Koi bhi aadha bhoolo aur kuch bhi pehle se tez nahi hota.</p>

<h3>Step 1: interface par timers</h3>
<pre class="code"><span class="c">! EDGE, ISP1 ki taraf link (ISP1 apni side par yahi mirror karta hai)</span>
interface GigabitEthernet0/0
 bfd interval 50 min_rx 50 multiplier 3
 no ip redirects
<span class="c">! Optional: agar neighbour support na kare to echo mode band karo</span>
<span class="c">!  no bfd echo</span></pre>
<p><code>interval</code> milliseconds mein desired transmit interval hai, <code>min_rx</code> sabse tez rate jo yeh router accept karta hai, aur <code>multiplier</code> kitne packets miss hone par session down declare ho. Yahan detection 50 x 3 = 150 ms hai agar neighbour same values use kare.</p>
<p>Naye IOS-XE releases <b>templates</b> bhi dete hain, jo timers ek jagah rakhte hain aur dampening jodte hain:</p>
<pre class="code">bfd-template single-hop FAST
 interval min-tx 50 min-rx 50 multiplier 3
 dampening 5 1000 2000 20
interface GigabitEthernet0/0
 bfd template FAST</pre>

<h3>Step 2: clients register karo</h3>
<table class="cmp"><tr><th>Client</th><th>Configuration</th></tr>
<tr><td>OSPF (saare interfaces)</td><td><code>router ospf 1</code> phir <code>bfd all-interfaces</code> (ek ko <code>ip ospf bfd disable</code> se bahar karo)</td></tr>
<tr><td>OSPF (ek interface)</td><td>Interface par <code>ip ospf bfd</code></td></tr>
<tr><td>EIGRP classic</td><td><code>router eigrp 100</code> phir <code>bfd all-interfaces</code> ya <code>bfd interface GigabitEthernet0/0</code></td></tr>
<tr><td>EIGRP named</td><td><code>af-interface GigabitEthernet0/0</code> phir <code>bfd</code></td></tr>
<tr><td>BGP</td><td><code>neighbor 10.0.1.1 fall-over bfd</code> (multihop peers multi-hop template ke saath <code>fall-over bfd multi-hop</code> use karte hain)</td></tr>
<tr><td>Static route</td><td><code>ip route static bfd GigabitEthernet0/0 10.0.1.1</code> plus ek static route jo interface aur next hop dono ka naam le</td></tr>
<tr><td>HSRP</td><td>Interface par <code>standby bfd</code></td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> PBR lab mein EDGE ka ISP1 ki taraf default route ek plain static route hai. Agar Ethernet link up rehte hue ISP1 ka router hang ho jaaye, default route hamesha table mein rehta hai. BFD ke saath woh lagbhag 150 ms mein hat jaata hai aur ISP2 ki taraf floating default le leta hai:</p>
<pre class="code">ip route static bfd GigabitEthernet0/0 10.0.1.1
ip route 0.0.0.0 0.0.0.0 GigabitEthernet0/0 10.0.1.1
ip route 0.0.0.0 0.0.0.0 GigabitEthernet0/1 10.0.2.1 10</pre>
<p>Doosre route ki administrative distance 10 hai, isliye woh tabhi dikhta hai jab BFD-tracked route withdraw hota hai.</p></div>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="One BFD session shared by several clients">
<rect x="250" y="80" width="140" height="56" rx="10" fill="#fde68a"/><text x="320" y="104" text-anchor="middle" class="svg-ink" font-size="14">BFD session</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.1 tak</text>
<rect x="20" y="20" width="120" height="40" rx="8" fill="#bae6fd"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="13">OSPF</text>
<rect x="20" y="90" width="120" height="40" rx="8" fill="#bae6fd"/><text x="80" y="115" text-anchor="middle" class="svg-ink" font-size="13">BGP</text>
<rect x="20" y="160" width="120" height="40" rx="8" fill="#bae6fd"/><text x="80" y="185" text-anchor="middle" class="svg-ink" font-size="13">Static route</text>
<rect x="500" y="80" width="120" height="56" rx="8" fill="#ddd6fe"/><text x="560" y="112" text-anchor="middle" class="svg-ink" font-size="13">ISP1</text>
<line x1="140" y1="40" x2="250" y2="95" stroke="#64748b" stroke-width="2"/><line x1="140" y1="110" x2="250" y2="108" stroke="#64748b" stroke-width="2"/><line x1="140" y1="180" x2="250" y2="122" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="108" x2="500" y2="108" stroke="#64748b" stroke-width="3"/><text x="445" y="100" text-anchor="middle" class="svg-accent" font-size="12">50 ms x 3</text>
</svg><p class="cap">Kai clients, har neighbour ke liye ek BFD session: jab woh down hota hai, sabko ek saath bataya jaata hai.</p></div>

<h3>Step 3: verify karo</h3>
<pre class="out">EDGE# show bfd neighbors
IPv4 Sessions
NeighAddr                              LD/RD         RH/RS     State     Int
<span class="hl">10.0.1.1                                 1/2          Up        Up        Gi0/0</span>

EDGE# show bfd neighbors details
IPv4 Sessions
NeighAddr                              LD/RD         RH/RS     State     Int
10.0.1.1                                 1/2          Up        Up        Gi0/0
<span class="hl">Session state is UP and using echo function with 50 ms interval.</span>
Session Host: Software
OurAddr: 10.0.1.2
Handle: 1
Local Diag: 0, Demand mode: 0, Poll bit: 0
MinTxInt: 1000000, MinRxInt: 1000000, Multiplier: 3
Received MinRxInt: 1000000, Received Multiplier: 3
Holddown (hits): 0(0), Hello (hits): 1000(1234)
Rx Count: 1240, Rx Interval (ms) min/max/avg: 1/1000/876 last: 312 ms ago
Tx Count: 1241, Tx Interval (ms) min/max/avg: 760/1000/879 last: 104 ms ago
<span class="hl">Registered protocols: OSPF CEF</span>
Uptime: 00:20:31
Last packet: Version: 1                  - Diagnostic: 0
             State bit: Up               - Demand bit: 0
             Poll bit: 0                 - Final bit: 0
             C bit: 0
             Multiplier: 3               - Length: 24
             My Discr.: 2                - Your Discr.: 1
             Min tx interval: 1000000    - Min rx interval: 1000000
             Min Echo interval: 50000</pre>
<p>Ise aise padho: LD/RD local aur remote discriminators hain; RH/RS remote heard state aur session state hai. Kyunki echo mode active hai, control timers 1-second slow timer dikhate hain (values microseconds mein) aur echo 50 ms par chalta hai. <b>Registered protocols</b> batata hai kaunse clients react karenge; agar aapka client yahan missing hai, to woh registered nahi hai. Failure hone par client wajah log karta hai:</p>
<pre class="out">%OSPF-5-ADJCHG: Process 1, Nbr 10.0.1.1 on GigabitEthernet0/0 from FULL to DOWN, <span class="hl">Neighbor Down: BFD node down</span></pre>

<h3>Dampening</h3>
<p>Jo link har kuch second mein flap kare, woh BFD se baar-baar adjacencies girwata aur banwata hai, jo ek saaf outage se bhi bura hai. <b>BFD dampening</b> BGP route dampening jaisa kaam karta hai: har flap ek penalty jodta hai, penalty half-life ke saath ghat-ti hai, aur jab woh suppress threshold paar karti hai to session tab tak down rakha jaata hai jab tak woh reuse threshold se neeche na aa jaaye (maximum suppress time se zyada kabhi nahi). <code>dampening 5 1000 2000 20</code> mein values hain half-life 5 minute, reuse 1000, suppress 2000 aur maximum suppress 20 minute.</p>

<h3>Design cautions</h3>
<ul>
<li><b>CPU aur scale.</b> Darjanon sessions par 50 ms wala software BFD chhote router ko load kar sakta hai. Platform limits check karo; bade boxes par hardware-offloaded BFD prefer karo.</li>
<li><b>Control-plane protection.</b> Agar CoPP ya interface ACL UDP 3784/3785 drop kare, sessions kabhi up nahi hote ya load mein flap karte hain.</li>
<li><b>Lossy ya virtual paths.</b> Internet VPNs, wireless ya busy virtual routers par aggressive timers jhoothe failures dete hain. 300 ms x 3 jaisi naram values use karo.</li>
<li><b>High availability.</b> Agar router SSO/NSF use karta hai aur switchover BFD detection time se zyada leta hai, neighbours use dead declare kar denge. BFD timers ko HA design ke saath align karo.</li>
<li><b>Broadcast segments par OSPF</b> BFD sessions sirf FULL state wale neighbours ke saath banata hai, isliye DROTHER-to-DROTHER pairs mein BFD nahi hota.</li>
<li><b>BFD kabhi kuch up nahi karta.</b> Yeh sirf cheezon ko tez down karta hai; adjacencies ab bhi apne protocol se banti hain.</li>
</ul>

<div class="warn"><p><b>Common galti.</b> <code>bfd interval</code> sirf ek router par configure karna. BFD ko dono ends chahiye; session down rehta hai aur, client ke hisaab se, adjacency bina BFD protection ke ban bhi sakti hai, isliye aap sochte ho ki protected ho jabki nahi ho. Hamesha <code>show bfd neighbors</code> check karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Static routes ke liye BFD ko <code>ip route static bfd INTERFACE NEXT-HOP</code> aur ek aisa static route chahiye jismein interface aur next hop dono hon. BGP ke liye keyword <code>fall-over bfd</code> hai, neighbour ke neeche "bfd" nahi.</p></div>

<div class="scn"><h4>Tez timers, dheema network</h4><p>Ek company ne internet par DMVPN tunnels par 50 ms x 3 BFD enable kiya. Shaam ke peak mein 200 ms ke jitter se BFD ghante mein kai baar spokes ko down declare karta tha, aur har flap EIGRP reset karke calls gira deta tha. Team ne tunnels ko 500 ms x 3 par kiya aur dampening enable ki; detection phir bhi do second se kam tha, aur jhoothe flaps gayab ho gaye.</p><p><b>Seekh:</b> BFD timers path ke asli behaviour ke hisaab se chuno, router jo sabse chhota number accept kare uske hisaab se nahi.</p></div>

<div class="iv"><p class="q">"Jab next-hop router hang ho lekin link up rahe, tab static default route ko jaldi failover kaise karwaoge?"</p><p>Strong answer: dono routers par interface par BFD configure karo, phir <code>ip route static bfd Gi0/0 10.0.1.1</code> aur ek static route jo interface aur next hop dono ka naam le. BFD down hone par route withdraw hota hai aur zyada AD wala floating static le leta hai. Alternative: object tracking ke saath IP SLA. <code>show bfd neighbors details</code> (Registered protocols mein static listed) aur <code>show ip route</code> se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Do hisse: interface par <code>bfd interval X min_rx Y multiplier Z</code>, plus client registration.</li>
<li>Clients: OSPF/EIGRP <code>bfd all-interfaces</code>, BGP <code>fall-over bfd</code>, static <code>ip route static bfd</code>, HSRP <code>standby bfd</code>.</li>
<li><code>show bfd neighbors [details]</code>: state, timers, echo status aur registered protocols.</li>
<li>Dampening penalty, half-life, suppress aur reuse thresholds se flapping session ko suppress karta hai.</li>
<li>CPU, CoPP, lossy paths, HA switchover time aur OSPF DROTHER behaviour ka dhyan rakho.</li>
</ul></div>
`}};export{e as default};