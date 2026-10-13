var e={id:`data-plane`,h:{en:`The data plane: IPsec tunnels, BFD, and following one packet`,hi:`Data plane: IPsec tunnels, BFD, aur ek packet ko follow karna`},body:{en:`
<p>The control plane decides where traffic should go; the data plane actually moves it. In this chapter you will see how the tunnels are built and protected, what BFD does inside them, and how to follow a single packet from a PC in Delhi to a server in Hyderabad, hop by hop, using the commands from the earlier chapters. This is the second lab of the module.</p>

<h3>IPsec tunnels without IKE</h3>
<p>User traffic travels in <b>IPsec ESP</b> tunnels between TLOCs. The tunnel is carried inside UDP so it can cross NAT. Unlike a classic VPN there is no IKE negotiation between edges by default. Instead, each edge generates its own encryption key (AES-256-GCM) and advertises it to the Controller, which hands it out to the other edges inside OMP. Keys are refreshed on a timer (the rekey interval, default one day), and an edge keeps the previous key for a short time so traffic does not drop during the change. Newer software also offers pairwise keys, where each pair of edges uses its own key; the principle, that the Controller distributes the key material, stays the same. GRE is a possible encapsulation, mostly toward service devices, but IPsec is the normal case.</p>

<h3>BFD inside every tunnel</h3>
<p>Inside each IPsec tunnel the two edges run <b>BFD</b>, a very light hello exchange. It is the only way an edge learns that the remote TLOC is alive over that transport. Default values: hello interval 1000 ms, multiplier 7, so a dead tunnel is detected in about seven seconds. BFD also samples <b>loss, latency and jitter</b> for each tunnel; these samples feed application-aware routing (the poll interval and multiplier are set under <code>bfd app-route</code>). BFD up means the TLOC is resolved and OMP routes that point to it can be installed.</p>
<pre class="code">E-DEL-1# show sdwan bfd sessions
                          SOURCE TLOC  REMOTE TLOC              DST PUBLIC   DST PUBLIC       DETECT     TX
SYSTEM IP   SITE ID STATE COLOR        COLOR        SOURCE IP   IP           PORT       ENCAP MULTIPLIER INTERVAL(msec) UPTIME     TRANSITIONS
-----------------------------------------------------------------------------------------------------------------------------------------------
10.255.0.12 200     <span class="hl">up</span>    biz-internet biz-internet 203.0.113.6 203.0.113.10 12346      ipsec 7          1000           0:00:00:03 0
10.255.0.12 200     <span class="hl">up</span>    mpls         mpls         172.16.1.2  172.16.2.2   12366      ipsec 7          1000           0:00:00:03 0
10.255.0.13 300     <span class="hl">up</span>    biz-internet biz-internet 203.0.113.6 203.0.113.14 12346      ipsec 7          1000           0:00:00:03 0

E-DEL-1# show sdwan bfd summary
sessions-total                   3
sessions-up                      3
sessions-max                     3
sessions-flap                    0</pre>
<p>Count the sessions. E-DEL-1 has two TLOCs (internet and MPLS), E-MUM-1 two, E-BLR-1 one. Because MPLS is restricted, E-DEL-1 forms internet-to-internet and MPLS-to-MPLS with Mumbai (2) and internet-to-internet with Bengaluru (1): <b>3 sessions</b>. The <code>TRANSITIONS</code> column counts how often a session changed state; a large number means a flapping tunnel. Edges with the <b>same site ID</b> never build tunnels to each other.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Packet path from PC-DEL to a server">
<rect x="10" y="100" width="80" height="40" rx="8" fill="#e2e8f0"/><text x="50" y="125" text-anchor="middle" class="svg-ink" font-size="12">PC-DEL</text>
<rect x="120" y="90" width="100" height="60" rx="8" fill="#bbf7d0"/><text x="170" y="112" text-anchor="middle" class="svg-ink" font-size="12">E-DEL-1</text><text x="170" y="130" text-anchor="middle" class="svg-muted" font-size="10">VRF 10 lookup</text>
<rect x="420" y="90" width="100" height="60" rx="8" fill="#bbf7d0"/><text x="470" y="112" text-anchor="middle" class="svg-ink" font-size="12">E-HYD-1</text><text x="470" y="130" text-anchor="middle" class="svg-muted" font-size="10">VRF 10 delivery</text>
<rect x="550" y="100" width="80" height="40" rx="8" fill="#e2e8f0"/><text x="590" y="125" text-anchor="middle" class="svg-ink" font-size="12">SRV-HYD</text>
<ellipse cx="320" cy="60" rx="70" ry="24" fill="#bae6fd"/><text x="320" y="64" text-anchor="middle" class="svg-ink" font-size="11">INET (underlay)</text>
<ellipse cx="320" cy="190" rx="70" ry="24" fill="#ddd6fe"/><text x="320" y="194" text-anchor="middle" class="svg-ink" font-size="11">MPLS (underlay)</text>
<line x1="90" y1="120" x2="120" y2="120" stroke="#64748b" stroke-width="2"/><line x1="520" y1="120" x2="550" y2="120" stroke="#64748b" stroke-width="2"/>
<path d="M220 105 Q270 190 250 190" stroke="#16a34a" stroke-width="3" fill="none"/><path d="M390 190 Q370 190 420 135" stroke="#16a34a" stroke-width="3" fill="none"/>
<path d="M220 110 Q250 60 250 60" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 3" fill="none"/><path d="M390 60 Q420 60 420 105" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 3" fill="none"/>
<text x="320" y="240" text-anchor="middle" class="svg-ink" font-size="12">Green: tunnel in use today (mpls). Grey dashed: internet tunnel that appears once added.</text>
<text x="320" y="258" text-anchor="middle" class="svg-muted" font-size="11">For the PC, both edges are one hop apart; the underlay is invisible.</text>
</svg><p class="cap">Packet path in the Zenith Logistics lab. The underlay routers do not appear in a traceroute from a service VPN.</p></div>

<h3>Follow the packet: PC-DEL to SRV-HYD (lab 2)</h3>
<p>The developer asks how traffic from 10.1.10.10 (Delhi) reaches the scanner server 10.4.10.10 (Hyderabad). Answer it in four steps, one command each.</p>
<ol>
<li><b>VRF routing table on E-DEL-1.</b> The PC's gateway is the edge, so the lookup happens in VRF 10.
<pre class="code">E-DEL-1# show ip route vrf 10 | begin Gateway
C        10.1.10.0/24 is directly connected, GigabitEthernet3
<span class="hl">m        10.4.10.0/24 [251/0] via 10.255.0.14, 00:05:12, Sdwan-system-intf</span></pre>
Code <code>m</code>, administrative distance 251, next hop the system IP 10.255.0.14 of E-HYD-1.</li>
<li><b>OMP route detail.</b> <code>show sdwan omp routes vpn 10 10.4.10.0/24 detail</code> shows that the Controller 10.255.255.2 sent the route and that the TLOC is <code>10.255.0.14, mpls, ipsec</code> (see chapter 5).</li>
<li><b>BFD.</b> <code>show sdwan bfd sessions</code> lists the session to 10.255.0.14. Because E-HYD-1 has only an MPLS TLOC, and MPLS is restricted, the only possible pair is MPLS to MPLS: one session, colour <code>mpls</code>. That is the colour the flow uses today.</li>
<li><b>Traceroute.</b> From the PC (or with <code>traceroute vrf 10 10.4.10.10</code> on the edge) you see the remote edge's LAN address and then the server. The WAN is one hop:
<pre class="code">E-DEL-1# traceroute vrf 10 10.4.10.10
Tracing the route to 10.4.10.10
  1 10.4.10.1 1 msec 2 msec 1 msec
  2 10.4.10.10 2 msec 3 msec 2 msec</pre></li>
</ol>
<p>The underlay routers in the MPLS cloud are invisible because the original packet is wrapped in ESP and travels edge to edge.</p>

<h3>Add the second transport and check the result</h3>
<p>The last task of lab 2 brings Hyderabad's new broadband line (GigabitEthernet1, already addressed) into the overlay using the TLOC configuration from chapter 4: <code>interface Tunnel1</code> with <code>tunnel mode sdwan</code>, and <code>tunnel-interface</code> with <code>encapsulation ipsec</code> and <code>color biz-internet</code> under <code>sdwan</code>, then <code>commit</code>. Expected result on E-DEL-1:</p>
<pre class="code">E-DEL-1# show sdwan bfd sessions
SYSTEM IP   SITE ID STATE COLOR        COLOR        SOURCE IP   IP           PORT   ENCAP ...
10.255.0.14 400     <span class="hl">up</span>    biz-internet biz-internet 203.0.113.6 203.0.113.10 12346  ipsec ...
10.255.0.14 400     <span class="hl">up</span>    mpls         mpls         172.16.1.2  172.16.2.2   12366  ipsec ...

E-DEL-1# show sdwan omp routes vpn 10 10.4.10.0/24
VPN PREFIX        FROM PEER    ID LABEL STATUS TYPE      TLOC IP      COLOR        ENCAP
10  10.4.10.0/24  10.255.255.2 1  1002  C,I,R  installed 10.255.0.14  biz-internet ipsec
10  10.4.10.0/24  10.255.255.2 2  1002  C,I,R  installed 10.255.0.14  mpls         ipsec</pre>
<p>Two BFD sessions (one per colour pair) and two installed paths: the prefix is now reachable over both transports, and the PC can still ping the server.</p>

<div class="eg"><p><b>Worked example.</b> A flow is going over MPLS and the carrier has a failure. BFD over MPLS stops answering; after the detect time (7 x 1000 ms) the session goes down, the MPLS TLOC becomes unresolved, the MPLS path of the OMP route is no longer usable, and the edge keeps forwarding over the remaining internet path. No routing protocol reconvergence is needed, and the PC sees only a short pause.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Looking for the underlay routers in a traceroute; assuming "BFD up" means "quality good" (it only says the TLOC is alive; quality comes from the measurements and policy); expecting tunnels between edges that share a site ID; testing from the edge's CLI without <code>vrf 10</code> and then wondering why the ping uses the wrong table.</p></div>

<div class="exam"><p><b>Exam traps.</b> No IKE between edges by default: the Controller distributes keys inside OMP. BFD runs <i>inside</i> the IPsec tunnels, default hello 1000 ms and multiplier 7. BFD is what resolves a TLOC and feeds application-aware routing with loss, latency and jitter.</p></div>

<div class="scn"><h4>Flapping tunnel to Bengaluru</h4><p>Delhi users reported that file transfers to Bengaluru kept stalling. <code>show sdwan bfd sessions</code> showed the internet session to E-BLR-1 with the state "up" but a TRANSITIONS counter of 37 in a day and an uptime of only a few minutes. The NOC concluded the underlay was dropping BFD packets intermittently. They opened a ticket with the Bengaluru ISP using the transition counts as evidence, and in the meantime application-aware routing moved the critical flows to MPLS-backed paths through Mumbai.</p><p><b>Lesson:</b> state alone is not enough; look at uptime and transitions to catch instability.</p></div>

<div class="iv"><p class="q">"How does a failure of one transport get detected and handled?"</p><p>Strong answer: BFD runs inside each tunnel; after the detect time (hello 1 s, multiplier 7 by default) the session goes down, the TLOC is marked unresolved, OMP routes via that TLOC stop being used, and the edge uses the remaining tunnels. Add that BFD also measures loss, latency and jitter so application-aware policy can react to degradation, not just failure.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>User data travels edge to edge in IPsec tunnels over UDP; the Controller distributes the keys through OMP.</li>
<li>BFD runs inside each tunnel (hello 1000 ms, multiplier 7) and resolves the TLOC.</li>
<li>To follow a packet: show ip route vrf, show sdwan omp routes detail, show sdwan bfd sessions, traceroute vrf.</li>
<li>Session count depends on TLOC pairs, restrict and site IDs; same site ID means no tunnels.</li>
<li>Adding a TLOC at one site adds a BFD session and an installed path at its peers.</li>
</ul></div>
`,hi:`
<p>Control plane tay karta hai ki traffic kahan jaana chahiye; data plane use asal mein le jaata hai. Is chapter mein aap dekhoge ki tunnels kaise bante aur protect hote hain, unke andar BFD kya karta hai, aur pichhle chapters ki commands se Delhi ke PC se Hyderabad ke server tak ek packet ko hop by hop kaise follow karte hain. Yeh module ka doosra lab hai.</p>

<h3>IKE ke bina IPsec tunnels</h3>
<p>User traffic TLOCs ke beech <b>IPsec ESP</b> tunnels mein chalta hai. Tunnel UDP ke andar carry hota hai taaki NAT cross kar sake. Classic VPN se alag, default mein edges ke beech IKE negotiation nahi hota. Iski jagah har edge apni encryption key (AES-256-GCM) khud generate karke Controller ko advertise karta hai, jo use OMP ke andar doosre edges ko de deta hai. Keys timer par refresh hoti hain (rekey interval, default ek din), aur edge purani key thodi der rakhta hai taaki badlav ke dauraan traffic na gire. Naya software pairwise keys bhi deta hai, jahan har pair of edges apni key use karta hai; principle, ki Controller key material distribute karta hai, wahi rehta hai. GRE ek possible encapsulation hai, zyada tar service devices ki taraf, par normal case IPsec hai.</p>

<h3>Har tunnel ke andar BFD</h3>
<p>Har IPsec tunnel ke andar dono edges <b>BFD</b> chalate hain, ek bahut halka hello exchange. Edge ko yeh jaanne ka yahi ek tareeka hai ki us transport par remote TLOC zinda hai. Default values: hello interval 1000 ms, multiplier 7, isliye dead tunnel lagbhag saat second mein detect hota hai. BFD har tunnel ke <b>loss, latency aur jitter</b> bhi sample karta hai; yeh samples application-aware routing ko feed karte hain (poll interval aur multiplier <code>bfd app-route</code> ke neeche set hote hain). BFD up ka matlab TLOC resolved hai aur us par point karne wale OMP routes install ho sakte hain.</p>
<pre class="code">E-DEL-1# show sdwan bfd sessions
                          SOURCE TLOC  REMOTE TLOC              DST PUBLIC   DST PUBLIC       DETECT     TX
SYSTEM IP   SITE ID STATE COLOR        COLOR        SOURCE IP   IP           PORT       ENCAP MULTIPLIER INTERVAL(msec) UPTIME     TRANSITIONS
-----------------------------------------------------------------------------------------------------------------------------------------------
10.255.0.12 200     <span class="hl">up</span>    biz-internet biz-internet 203.0.113.6 203.0.113.10 12346      ipsec 7          1000           0:00:00:03 0
10.255.0.12 200     <span class="hl">up</span>    mpls         mpls         172.16.1.2  172.16.2.2   12366      ipsec 7          1000           0:00:00:03 0
10.255.0.13 300     <span class="hl">up</span>    biz-internet biz-internet 203.0.113.6 203.0.113.14 12346      ipsec 7          1000           0:00:00:03 0

E-DEL-1# show sdwan bfd summary
sessions-total                   3
sessions-up                      3
sessions-max                     3
sessions-flap                    0</pre>
<p>Sessions gino. E-DEL-1 ke do TLOCs (internet aur MPLS), E-MUM-1 ke do, E-BLR-1 ka ek. Kyunki MPLS restricted hai, E-DEL-1 Mumbai ke saath internet-to-internet aur MPLS-to-MPLS (2) aur Bengaluru ke saath internet-to-internet (1) banata hai: <b>3 sessions</b>. <code>TRANSITIONS</code> column batata hai ki session ne kitni baar state badli; bada number flapping tunnel dikhata hai. <b>Same site ID</b> wale edges aapas mein kabhi tunnel nahi banate.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="PC-DEL se server tak packet path">
<rect x="10" y="100" width="80" height="40" rx="8" fill="#e2e8f0"/><text x="50" y="125" text-anchor="middle" class="svg-ink" font-size="12">PC-DEL</text>
<rect x="120" y="90" width="100" height="60" rx="8" fill="#bbf7d0"/><text x="170" y="112" text-anchor="middle" class="svg-ink" font-size="12">E-DEL-1</text><text x="170" y="130" text-anchor="middle" class="svg-muted" font-size="10">VRF 10 lookup</text>
<rect x="420" y="90" width="100" height="60" rx="8" fill="#bbf7d0"/><text x="470" y="112" text-anchor="middle" class="svg-ink" font-size="12">E-HYD-1</text><text x="470" y="130" text-anchor="middle" class="svg-muted" font-size="10">VRF 10 delivery</text>
<rect x="550" y="100" width="80" height="40" rx="8" fill="#e2e8f0"/><text x="590" y="125" text-anchor="middle" class="svg-ink" font-size="12">SRV-HYD</text>
<ellipse cx="320" cy="60" rx="70" ry="24" fill="#bae6fd"/><text x="320" y="64" text-anchor="middle" class="svg-ink" font-size="11">INET (underlay)</text>
<ellipse cx="320" cy="190" rx="70" ry="24" fill="#ddd6fe"/><text x="320" y="194" text-anchor="middle" class="svg-ink" font-size="11">MPLS (underlay)</text>
<line x1="90" y1="120" x2="120" y2="120" stroke="#64748b" stroke-width="2"/><line x1="520" y1="120" x2="550" y2="120" stroke="#64748b" stroke-width="2"/>
<path d="M220 105 Q270 190 250 190" stroke="#16a34a" stroke-width="3" fill="none"/><path d="M390 190 Q370 190 420 135" stroke="#16a34a" stroke-width="3" fill="none"/>
<path d="M220 110 Q250 60 250 60" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 3" fill="none"/><path d="M390 60 Q420 60 420 105" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 3" fill="none"/>
<text x="320" y="240" text-anchor="middle" class="svg-ink" font-size="12">Green: aaj use ho raha tunnel (mpls). Grey dashed: internet tunnel jo jodne ke baad aata hai.</text>
<text x="320" y="258" text-anchor="middle" class="svg-muted" font-size="11">PC ke liye dono edges ek hop door hain; underlay dikhta nahi.</text>
</svg><p class="cap">Zenith Logistics lab mein packet path. Service VPN se traceroute mein underlay routers nahi dikhte.</p></div>

<h3>Packet follow karo: PC-DEL se SRV-HYD tak (lab 2)</h3>
<p>Developer poochta hai ki 10.1.10.10 (Delhi) ka traffic scanner server 10.4.10.10 (Hyderabad) tak kaise pahunchta hai. Chaar steps mein jawab do, har step mein ek command.</p>
<ol>
<li><b>E-DEL-1 par VRF routing table.</b> PC ka gateway edge hai, isliye lookup VRF 10 mein hota hai.
<pre class="code">E-DEL-1# show ip route vrf 10 | begin Gateway
C        10.1.10.0/24 is directly connected, GigabitEthernet3
<span class="hl">m        10.4.10.0/24 [251/0] via 10.255.0.14, 00:05:12, Sdwan-system-intf</span></pre>
Code <code>m</code>, administrative distance 251, next hop E-HYD-1 ka system IP 10.255.0.14.</li>
<li><b>OMP route detail.</b> <code>show sdwan omp routes vpn 10 10.4.10.0/24 detail</code> dikhata hai ki Controller 10.255.255.2 ne route bheja aur TLOC <code>10.255.0.14, mpls, ipsec</code> hai (chapter 5 dekho).</li>
<li><b>BFD.</b> <code>show sdwan bfd sessions</code> 10.255.0.14 tak ka session list karta hai. Kyunki E-HYD-1 ka sirf MPLS TLOC hai, aur MPLS restricted hai, isliye ek hi possible pair hai: MPLS se MPLS, ek session, colour <code>mpls</code>. Aaj flow yahi colour use karta hai.</li>
<li><b>Traceroute.</b> PC se (ya edge par <code>traceroute vrf 10 10.4.10.10</code> se) aapko remote edge ka LAN address aur phir server dikhta hai. WAN ek hop hai:
<pre class="code">E-DEL-1# traceroute vrf 10 10.4.10.10
Tracing the route to 10.4.10.10
  1 10.4.10.1 1 msec 2 msec 1 msec
  2 10.4.10.10 2 msec 3 msec 2 msec</pre></li>
</ol>
<p>MPLS cloud ke underlay routers dikhte nahi kyunki original packet ESP mein lapeta hota hai aur edge se edge jaata hai.</p>

<h3>Doosra transport jodo aur result check karo</h3>
<p>Lab 2 ka aakhri task Hyderabad ki nayi broadband line (GigabitEthernet1, address pehle se laga) ko chapter 4 ki TLOC configuration se overlay mein laata hai: <code>tunnel mode sdwan</code> ke saath <code>interface Tunnel1</code>, aur <code>sdwan</code> ke neeche <code>encapsulation ipsec</code> aur <code>color biz-internet</code> ke saath <code>tunnel-interface</code>, phir <code>commit</code>. E-DEL-1 par expected result:</p>
<pre class="code">E-DEL-1# show sdwan bfd sessions
SYSTEM IP   SITE ID STATE COLOR        COLOR        SOURCE IP   IP           PORT   ENCAP ...
10.255.0.14 400     <span class="hl">up</span>    biz-internet biz-internet 203.0.113.6 203.0.113.10 12346  ipsec ...
10.255.0.14 400     <span class="hl">up</span>    mpls         mpls         172.16.1.2  172.16.2.2   12366  ipsec ...

E-DEL-1# show sdwan omp routes vpn 10 10.4.10.0/24
VPN PREFIX        FROM PEER    ID LABEL STATUS TYPE      TLOC IP      COLOR        ENCAP
10  10.4.10.0/24  10.255.255.2 1  1002  C,I,R  installed 10.255.0.14  biz-internet ipsec
10  10.4.10.0/24  10.255.255.2 2  1002  C,I,R  installed 10.255.0.14  mpls         ipsec</pre>
<p>Do BFD sessions (har colour pair ka ek) aur do installed paths: prefix ab dono transports par reachable hai, aur PC ab bhi server ko ping kar sakta hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek flow MPLS par chal raha hai aur carrier mein failure aata hai. MPLS par BFD jawab dena band kar deta hai; detect time (7 x 1000 ms) ke baad session down ho jaata hai, MPLS TLOC unresolved ho jaata hai, OMP route ka MPLS path usable nahi rehta, aur edge bacha hua internet path par forward karta rehta hai. Routing protocol reconvergence ki zaroorat nahi, aur PC sirf chhota pause dekhta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Traceroute mein underlay routers dhundhna; "BFD up" ko "quality achhi" samajhna (woh sirf batata hai ki TLOC zinda hai; quality measurements aur policy se aati hai); same site ID share karne wale edges ke beech tunnels ki ummeed karna; edge ki CLI se <code>vrf 10</code> ke bina test karna aur phir sochna ki ping galat table kyun use kar raha hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Default mein edges ke beech IKE nahi: Controller OMP ke andar keys distribute karta hai. BFD IPsec tunnels ke <i>andar</i> chalta hai, default hello 1000 ms aur multiplier 7. BFD TLOC ko resolve karta hai aur application-aware routing ko loss, latency aur jitter deta hai.</p></div>

<div class="scn"><h4>Bengaluru ka flapping tunnel</h4><p>Delhi ke users ne shikayat ki ki Bengaluru ko file transfers baar baar ruk rahe hain. <code>show sdwan bfd sessions</code> ne E-BLR-1 ka internet session state "up" ke saath dikhaya par ek din mein TRANSITIONS counter 37 aur uptime sirf kuch minute. NOC ne nateeja nikala ki underlay BFD packets kabhi kabhi drop kar raha hai. Unhone transition counts ko evidence bana kar Bengaluru ISP ke saath ticket khola, aur tab tak application-aware routing ne critical flows ko Mumbai ke through MPLS-backed paths par move kar diya.</p><p><b>Seekh:</b> sirf state kaafi nahi; instability pakadne ke liye uptime aur transitions dekho.</p></div>

<div class="iv"><p class="q">"Ek transport ka failure kaise detect aur handle hota hai?"</p><p>Strong answer: BFD har tunnel ke andar chalta hai; detect time (default hello 1 s, multiplier 7) ke baad session down hota hai, TLOC unresolved mark hota hai, us TLOC wale OMP routes use hona band ho jaate hain, aur edge bache hue tunnels use karta hai. Jodo ki BFD loss, latency aur jitter bhi measure karta hai taaki application-aware policy sirf failure par nahi, degradation par bhi react kar sake.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>User data UDP par IPsec tunnels mein edge se edge chalta hai; Controller keys OMP ke through baant-ta hai.</li>
<li>BFD har tunnel ke andar chalta hai (hello 1000 ms, multiplier 7) aur TLOC ko resolve karta hai.</li>
<li>Packet follow karne ke liye: show ip route vrf, show sdwan omp routes detail, show sdwan bfd sessions, traceroute vrf.</li>
<li>Session count TLOC pairs, restrict aur site IDs par depend karta hai; same site ID matlab tunnels nahi.</li>
<li>Ek site par TLOC jodne se uske peers par ek BFD session aur ek installed path badhta hai.</li>
</ul></div>
`}};export{e as default};