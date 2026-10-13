var e={id:`bfd-data-plane`,h:{en:`Layer 4: BFD, tunnels and the data plane (down, flapping, MTU)`,hi:`Layer 4: BFD, tunnels aur data plane (down, flapping, MTU)`},body:{en:`
<p>Two offices agree on a phone line in the control room (OMP) and then each builds a private pipe to the other. To know the pipe is alive, each side says "are you there?" once a second. If seven answers in a row are missing, the pipe is declared dead. That "are you there?" is BFD. When users say "the branch is slow" or "it drops every few minutes", the first place to look is these little hellos, because the tunnel is the road your data actually drives on.</p>

<h3>What a BFD session proves</h3>
<p>One BFD session exists for each pair of TLOCs between two edges, inside the IPsec tunnel. Default timers are a hello every 1000 ms and a multiplier of 7, so loss of the hellos for about seven seconds brings the session down (sdw-arch and sdw-edge covered this). A session in state <b>up</b> proves four things at once: the remote TLOC is resolved, the path between the two public addresses and UDP ports is open, the IPsec keys match, and packets travel in both directions. BFD also measures loss, latency and jitter for application-aware routing (sdw-aar).</p>

<h3>Step 1: count what you expect</h3>
<p>Before reading any detail, predict the number. Each edge has a list of TLOCs; a tunnel is attempted between two TLOCs of different sites if the colours are allowed to connect (same colour when restricted). For Bharat Retail: E-DEL-1 has 2 TLOCs (biz-internet, mpls), E-MUM-1 has 2, E-BLR-1 has 1 (biz-internet), E-HYD-1 has 1 (mpls). From E-DEL-1 you should see: 2 sessions to Mumbai, 1 to Bengaluru (internet) and 1 to Hyderabad (MPLS), so <b>4</b> sessions.</p>
<pre class="out">E-DEL-1# show sdwan bfd summary
sessions-total                   4
sessions-up                      3
sessions-max                     4
sessions-flap                    9
poll-interval                    120000
<span class="hl">E-DEL-1# show sdwan bfd sessions</span>
                          SOURCE TLOC  REMOTE TLOC              DST PUBLIC    DST PUBLIC  DETECT     TX
SYSTEM IP    SITE ID STATE  COLOR        COLOR        SOURCE IP    IP            PORT   MULTIPLIER INTERVAL UPTIME       TRANSITIONS
10.255.0.12  200     up     biz-internet biz-internet 203.0.113.6  203.0.113.10  12346  7          1000     0:02:11:40   0
10.255.0.12  200     up     mpls         mpls         172.16.1.2   172.16.2.2    12366  7          1000     0:02:11:38   0
10.255.0.13  300     up     biz-internet biz-internet 203.0.113.6  203.0.113.14  12346  7          1000     0:00:00:51   <span class="hl">14</span>
10.255.0.14  400     <span class="hl">down</span>   mpls         mpls         172.16.1.2   172.16.4.2    12366  7          1000     0:00:00:00   1</pre>
<p>Compare the three numbers: <b>total</b> (4, as predicted), <b>up</b> (3, so one is down) and <b>sessions-flap</b> (9, so something has been flapping). In the table, row 4 is plainly down. Row 3 is up but has 14 <b>transitions</b> and only 51 seconds of uptime: it is flapping. These two rows are two different problems.</p>

<h3>Problem A: a session that never comes up</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="BFD down checklist">
<rect x="10" y="15" width="150" height="50" rx="8" fill="#bae6fd"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="12">1 Remote TLOC known?</text>
<rect x="175" y="15" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="250" y="45" text-anchor="middle" class="svg-ink" font-size="12">2 Colours allowed?</text>
<rect x="340" y="15" width="150" height="50" rx="8" fill="#fde68a"/><text x="415" y="45" text-anchor="middle" class="svg-ink" font-size="12">3 Path and ports open?</text>
<rect x="505" y="15" width="125" height="50" rx="8" fill="#fed7aa"/><text x="567" y="45" text-anchor="middle" class="svg-ink" font-size="12">4 NAT type</text>
<rect x="10" y="95" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="85" y="125" text-anchor="middle" class="svg-ink" font-size="12">5 Remote edge healthy?</text>
<rect x="175" y="95" width="150" height="50" rx="8" fill="#fbcfe8"/><text x="250" y="125" text-anchor="middle" class="svg-ink" font-size="12">6 Tunnel interface up?</text>
<rect x="340" y="95" width="150" height="50" rx="8" fill="#e5e7eb"/><text x="415" y="125" text-anchor="middle" class="svg-ink" font-size="12">7 Packets in and out?</text>
<text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="12">Work left to right; stop at the first "no"</text>
</svg><p class="cap">Seven questions for a session that stays down.</p></div>
<ol>
<li><b>Is the remote TLOC known?</b> <code>show sdwan omp tlocs</code>. If the remote TLOC is not there, go back to chapter 4.</li>
<li><b>Are the colours allowed to connect?</b> With <code>restrict</code>, mpls only builds tunnels to mpls. A branch whose second circuit was named private1 gets no mpls tunnel (the sdw-edge module's Delhi and Mumbai ticket).</li>
<li><b>Are the path and ports open?</b> The data plane uses UDP, starting at 12346 for the source of the TLOC, with hopped ports as in chapter 2. A firewall at the branch or the hub that allows control traffic to the controllers may still block edge-to-edge UDP. Test with the transport interface and a capture (chapter 8).</li>
<li><b>Which NAT sits at each end?</b> <code>show sdwan control local-properties</code> on both edges. Two address-port-dependent NATs cannot form a direct tunnel.</li>
<li><b>Is the remote edge healthy?</b> Run the same commands on the other side: its tunnel interface, its transport, its control connections.</li>
<li><b>Is the tunnel interface up and allowing the service?</b> The tunnel interface must be up with the right encapsulation (IPsec, or GRE where used). The allow-service list on that interface controls which services answer on the transport.</li>
<li><b>Do packets go in and out?</b> <code>show sdwan tunnel statistics</code> shows transmit and receive counters per tunnel.</li>
</ol>
<pre class="out">E-DEL-1# show sdwan tunnel statistics
tunnel-protocol ipsec  (trimmed)
source-ip        172.16.1.2
dest-ip          172.16.4.2
source-port      12366
dest-port        12366
tx_pkts          4132
<span class="hl">rx_pkts          0</span></pre>
<p>Transmit growing and receive stuck at 0 means our packets leave but nothing comes back: a firewall, the provider, or a fault at the remote edge. If both counters are 0, the tunnel is not even trying, which points back to steps 1 and 2.</p>

<h3>Problem B: a session that flaps</h3>
<p>A flapping session goes down for seconds, comes back, and repeats. The <b>transitions</b> counter in <code>show sdwan bfd sessions</code> grows, and <code>show sdwan bfd history</code> shows the times. Reasons to check, in order of how often they occur:</p>
<ul>
<li><b>Real loss on the circuit.</b> Compare with <code>show sdwan app-route stats</code>, which reports loss, latency and jitter for each tunnel. High loss is a provider ticket (sdw-ops chapter 8: prove it with times and a speed test).</li>
<li><b>Congestion.</b> A saturated link drops the hellos along with the data. BFD packets are marked with a high priority class (CS6), so a queue in the underlay or the edge that does not protect that class can drop them; the sdw-qos module shows how to keep it in a safe queue.</li>
<li><b>Provider path changes.</b> A circuit that moves between paths causes short outages that line up in time with the transitions.</li>
<li><b>Timers too aggressive.</b> On a very lossy link, the default multiplier of 7 may be too sensitive; increasing hello interval or multiplier on that colour reduces flaps, at the cost of slower failure detection. Treat it as a workaround, not a cure.</li>
<li><b>One-sided NAT timeouts.</b> A NAT that times out the mapping and re-creates it with a different port interrupts the tunnel until the edge learns the new one.</li>
</ul>

<h3>Problem C: the tunnel is up but big packets fail</h3>
<p>IPsec adds overhead, so the largest packet that fits inside the tunnel is smaller than the interface MTU. Symptoms: pings and small web pages work, but file transfers, some HTTPS sites or VPN-within-VPN stall. Test it directly from the service VPN:</p>
<pre class="code">E-MUM-1# ping vrf 10 10.1.10.10 size 1400 df-bit
E-MUM-1# ping vrf 10 10.1.10.10 size 1200 df-bit</pre>
<p>If 1200 works and 1400 fails, the path MTU is somewhere in between. Check the tunnel and interface MTU in the configuration and in the tunnel statistics, and look at the TCP MSS adjustment setting on the tunnel interface, which rewrites the TCP maximum segment size so that hosts send smaller segments (a value around 1350 is a typical example in Cisco examples; choose it for your overhead). Fragmentation along a provider path that drops fragments is a classic cause of "some sites work".</p>

<div class="eg"><p><b>Worked example.</b> Mumbai is slow at 11:00 every day. <code>show sdwan bfd summary</code> on E-MUM-1 shows sessions-flap rising by about 20 each hour. <code>show sdwan app-route stats</code> shows loss of 12 percent on the MPLS tunnel at those times and 0 percent at night. A speed test at 11:00 confirms the circuit is saturated by a backup job. The fix is two-part: shape and schedule the backup (sdw-qos), and keep voice on the less loaded transport with an SLA class (sdw-aar). The provider was never involved.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Treating "BFD down" as a provider problem before checking colours and NAT. (2) Not counting expected sessions. (3) Tuning timers to hide real loss. (4) Testing MTU without the DF bit. (5) Reading statistics from only one side.</p></div>

<div class="exam"><p><b>Exam trap.</b> BFD runs inside the IPsec tunnel between TLOC pairs with a default hello of 1 second and multiplier 7. The data plane needs the control plane first: no OMP route and TLOC, no BFD session. Restricted colours connect only to the same colour.</p></div>

<div class="scn"><h4>Delhi to Hyderabad: MPLS tunnel is down but MPLS is "up"</h4><p>The provider says the circuit is fine. E-DEL-1 shows the BFD session to E-HYD-1 down, transmit counters rising and receive at 0. A capture on the MPLS interface of E-DEL-1 shows our packets leaving. At Hyderabad a new branch firewall, placed behind the MPLS router, dropped UDP 12366 inbound. The firewall change allowed the tunnel ports from the Delhi address and the session came up.</p><p><b>Lesson:</b> a counter that moves in one direction only points to a filter on the way back.</p></div>

<div class="iv"><p class="q">"A BFD session is flapping. How do you approach it?"</p><p>I read the transitions and history to see when it flaps, compare with loss, latency and jitter from app-route statistics and check for congestion or a provider event at the same times. I verify that BFD traffic is protected by the QoS design, look at NAT timeouts and path changes, and only as a workaround adjust the timers for that colour. Then I prove the cause to the provider with times and measurements.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Count the sessions you expect; compare total, up and flaps.</li>
<li>Down: remote TLOC, colours, ports, NAT, remote edge, tunnel interface, counters.</li>
<li>Flapping: loss, congestion, path changes, NAT timeouts; timers are only a workaround.</li>
<li>Counters moving one way only point to a filter on the return path.</li>
<li>Test MTU with the DF bit from the service VPN.</li>
</ul></div>
`,hi:`
<p>Do offices control room mein phone line par sahmat hote hain (OMP) aur phir har ek doosre tak private pipe banata hai. Pipe zinda hai yeh jaanne ke liye har side ek second mein ek baar poochhti hai "tum wahan ho?". Lagataar saat jawab na aaye to pipe ko mara hua maana jaata hai. Yeh "tum wahan ho?" BFD hai. Jab users kehte hain "branch slow hai" ya "har kuch minute mein girti hai", to sabse pehle yeh chhote hellos dekho, kyunki tunnel wohi sadak hai jis par aapka data asal mein chalta hai.</p>

<h3>BFD session kya sabit karta hai</h3>
<p>Do edges ke beech har TLOC pair ke liye IPsec tunnel ke andar ek BFD session hota hai. Default timers har 1000 ms mein hello aur multiplier 7 hain, to lagbhag saat second hello na aane par session down ho jaata hai (sdw-arch aur sdw-edge mein padha). <b>up</b> state ka session ek saath chaar cheezein sabit karta hai: remote TLOC resolved hai, dono public addresses aur UDP ports ke beech path khula hai, IPsec keys match karti hain, aur packets dono taraf jaate hain. BFD application-aware routing ke liye loss, latency aur jitter bhi naapta hai (sdw-aar).</p>

<h3>Step 1: jo expected hai woh ginto</h3>
<p>Koi detail padhne se pehle number ka andaza lagao. Har edge ke paas TLOCs ki list hoti hai; alag sites ke do TLOCs ke beech tunnel koshish hota hai agar colours connect ho sakte hain (restricted ho to same colour). Bharat Retail ke liye: E-DEL-1 ke 2 TLOCs (biz-internet, mpls), E-MUM-1 ke 2, E-BLR-1 ka 1 (biz-internet), E-HYD-1 ka 1 (mpls). E-DEL-1 se aapko dikhna chahiye: Mumbai ke 2 sessions, Bengaluru ka 1 (internet) aur Hyderabad ka 1 (MPLS), yaani <b>4</b> sessions.</p>
<pre class="out">E-DEL-1# show sdwan bfd summary
sessions-total                   4
sessions-up                      3
sessions-max                     4
sessions-flap                    9
poll-interval                    120000
<span class="hl">E-DEL-1# show sdwan bfd sessions</span>
                          SOURCE TLOC  REMOTE TLOC              DST PUBLIC    DST PUBLIC  DETECT     TX
SYSTEM IP    SITE ID STATE  COLOR        COLOR        SOURCE IP    IP            PORT   MULTIPLIER INTERVAL UPTIME       TRANSITIONS
10.255.0.12  200     up     biz-internet biz-internet 203.0.113.6  203.0.113.10  12346  7          1000     0:02:11:40   0
10.255.0.12  200     up     mpls         mpls         172.16.1.2   172.16.2.2    12366  7          1000     0:02:11:38   0
10.255.0.13  300     up     biz-internet biz-internet 203.0.113.6  203.0.113.14  12346  7          1000     0:00:00:51   <span class="hl">14</span>
10.255.0.14  400     <span class="hl">down</span>   mpls         mpls         172.16.1.2   172.16.4.2    12366  7          1000     0:00:00:00   1</pre>
<p>Teen numbers compare karo: <b>total</b> (4, jaisa socha tha), <b>up</b> (3, yaani ek down) aur <b>sessions-flap</b> (9, yaani kuch flap ho raha hai). Table mein row 4 saaf down hai. Row 3 up hai lekin 14 <b>transitions</b> aur sirf 51 second uptime: woh flap kar rahi hai. Yeh do rows do alag problems hain.</p>

<h3>Problem A: session jo kabhi up nahi hota</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="BFD down checklist">
<rect x="10" y="15" width="150" height="50" rx="8" fill="#bae6fd"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="12">1 Remote TLOC pata hai?</text>
<rect x="175" y="15" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="250" y="45" text-anchor="middle" class="svg-ink" font-size="12">2 Colours allowed?</text>
<rect x="340" y="15" width="150" height="50" rx="8" fill="#fde68a"/><text x="415" y="45" text-anchor="middle" class="svg-ink" font-size="12">3 Path, ports khule?</text>
<rect x="505" y="15" width="125" height="50" rx="8" fill="#fed7aa"/><text x="567" y="45" text-anchor="middle" class="svg-ink" font-size="12">4 NAT type</text>
<rect x="10" y="95" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="85" y="125" text-anchor="middle" class="svg-ink" font-size="12">5 Remote edge theek?</text>
<rect x="175" y="95" width="150" height="50" rx="8" fill="#fbcfe8"/><text x="250" y="125" text-anchor="middle" class="svg-ink" font-size="12">6 Tunnel interface up?</text>
<rect x="340" y="95" width="150" height="50" rx="8" fill="#e5e7eb"/><text x="415" y="125" text-anchor="middle" class="svg-ink" font-size="12">7 Packets in aur out?</text>
<text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="12">Baaen se daaen kaam karo; pehle "nahi" par ruko</text>
</svg><p class="cap">Down rehne wale session ke liye saat sawal.</p></div>
<ol>
<li><b>Remote TLOC pata hai?</b> <code>show sdwan omp tlocs</code>. Remote TLOC na ho to chapter 4 par wapas.</li>
<li><b>Colours connect ho sakte hain?</b> <code>restrict</code> ke saath mpls sirf mpls se tunnel banata hai. Jis branch ke doosre circuit ka naam private1 hai use mpls tunnel nahi milta (sdw-edge module ka Delhi aur Mumbai ticket).</li>
<li><b>Path aur ports khule hain?</b> Data plane UDP use karta hai, TLOC ke source ke liye 12346 se shuru, hopped ports chapter 2 jaise. Branch ya hub par firewall jo controllers tak control traffic allow karta hai, phir bhi edge-to-edge UDP block kar sakta hai. Transport interface par capture se test karo (chapter 8).</li>
<li><b>Dono ends par kaunsa NAT hai?</b> Dono edges par <code>show sdwan control local-properties</code>. Do address-port-dependent NAT seedha tunnel nahi bana sakte.</li>
<li><b>Remote edge theek hai?</b> Doosri side par wahi commands: uska tunnel interface, transport, control connections.</li>
<li><b>Tunnel interface up hai aur service allow hai?</b> Tunnel interface sahi encapsulation (IPsec, ya jahan use ho GRE) ke saath up hona chahiye. Us interface ki allow-service list tay karti hai transport par kaunsi services jawab dengi.</li>
<li><b>Packets in aur out hote hain?</b> <code>show sdwan tunnel statistics</code> har tunnel ke transmit aur receive counters dikhata hai.</li>
</ol>
<pre class="out">E-DEL-1# show sdwan tunnel statistics
tunnel-protocol ipsec  (trimmed)
source-ip        172.16.1.2
dest-ip          172.16.4.2
source-port      12366
dest-port        12366
tx_pkts          4132
<span class="hl">rx_pkts          0</span></pre>
<p>Transmit badhna aur receive 0 par atka rehna matlab hamare packets jaate hain lekin kuch wapas nahi aata: firewall, provider, ya remote edge ka fault. Dono counters 0 hon to tunnel koshish hi nahi kar raha, jo steps 1 aur 2 ki taraf wapas le jaata hai.</p>

<h3>Problem B: session jo flap karta hai</h3>
<p>Flapping session seconds ke liye gir kar wapas aata hai aur dohrata hai. <code>show sdwan bfd sessions</code> mein <b>transitions</b> counter badhta hai, aur <code>show sdwan bfd history</code> times dikhata hai. Check karne ki wajahein, kitni baar hoti hain us order mein:</p>
<ul>
<li><b>Circuit par asli loss.</b> <code>show sdwan app-route stats</code> se compare karo, jo har tunnel ka loss, latency aur jitter batata hai. Zyada loss provider ticket hai (sdw-ops chapter 8: times aur speed test se sabit karo).</li>
<li><b>Congestion.</b> Saturated link data ke saath hellos bhi gira deta hai. BFD packets high priority class (CS6) mein mark hote hain, to underlay ya edge ki jo queue us class ko protect nahi karti woh unhe gira sakti hai; sdw-qos module batata hai ise safe queue mein kaise rakhein.</li>
<li><b>Provider path changes.</b> Jo circuit paths ke beech move karta hai woh chhote outages deta hai jo transitions ke time se milte hain.</li>
<li><b>Timers bahut aggressive.</b> Bahut lossy link par default multiplier 7 zyada sensitive ho sakta hai; us colour par hello interval ya multiplier badhane se flaps kam hote hain, lekin failure detection slow hoti hai. Isse workaround maano, ilaaj nahi.</li>
<li><b>Ek-taraf NAT timeouts.</b> NAT jo mapping timeout karke alag port se banata hai woh tab tak tunnel rokta hai jab tak edge naya port na seekh le.</li>
</ul>

<h3>Problem C: tunnel up hai lekin bade packets fail</h3>
<p>IPsec overhead jodta hai, isliye tunnel ke andar jo sabse bada packet fit hota hai woh interface MTU se chhota hota hai. Symptoms: ping aur chhote web pages chalte hain lekin file transfers, kuch HTTPS sites ya VPN-within-VPN atak jaate hain. Service VPN se seedha test karo:</p>
<pre class="code">E-MUM-1# ping vrf 10 10.1.10.10 size 1400 df-bit
E-MUM-1# ping vrf 10 10.1.10.10 size 1200 df-bit</pre>
<p>Agar 1200 chale aur 1400 fail ho to path MTU beech mein kahin hai. Configuration aur tunnel statistics mein tunnel aur interface MTU dekho, aur tunnel interface par TCP MSS adjustment setting dekho, jo TCP maximum segment size badalti hai taaki hosts chhote segments bhejein (1350 ke aas-paas ki value Cisco examples mein typical udaharan hai; apne overhead ke hisaab se chuno). Jo provider path fragments gira deta hai uspar fragmentation "kuch sites chalti hain" ki classic wajah hai.</p>

<div class="eg"><p><b>Worked example.</b> Mumbai roz 11:00 par slow hota hai. E-MUM-1 par <code>show sdwan bfd summary</code> sessions-flap ghante mein lagbhag 20 badhta dikhata hai. <code>show sdwan app-route stats</code> un waqton MPLS tunnel par 12 percent loss aur raat ko 0 percent dikhata hai. 11:00 par speed test confirm karta hai ki backup job se circuit saturated hai. Fix do hisson mein hai: backup ko shape aur schedule karo (sdw-qos), aur voice ko kam bhare transport par SLA class se rakho (sdw-aar). Provider ko kabhi involve nahi karna pada.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Colours aur NAT dekhe bina "BFD down" ko provider problem manna. (2) Expected sessions na ginna. (3) Asli loss chhupane ke liye timers tune karna. (4) DF bit ke bina MTU test karna. (5) Sirf ek side se statistics padhna.</p></div>

<div class="exam"><p><b>Exam trap.</b> BFD TLOC pairs ke beech IPsec tunnel ke andar chalta hai, default hello 1 second aur multiplier 7. Data plane ko pehle control plane chahiye: OMP route aur TLOC nahi to BFD session nahi. Restricted colours sirf same colour se connect hote hain.</p></div>

<div class="scn"><h4>Delhi se Hyderabad: MPLS tunnel down hai lekin MPLS "up" hai</h4><p>Provider kehta hai circuit theek hai. E-DEL-1 E-HYD-1 ka BFD session down dikhata hai, transmit counters badh rahe hain aur receive 0. E-DEL-1 ke MPLS interface par capture hamare packets jaate dikhata hai. Hyderabad mein MPLS router ke peeche lagaye naye branch firewall ne UDP 12366 inbound gira diya. Firewall change ne Delhi address se tunnel ports allow kiye aur session up hua.</p><p><b>Lesson:</b> jo counter sirf ek direction mein chalta hai woh wapsi ke raaste mein filter ki taraf ishara karta hai.</p></div>

<div class="iv"><p class="q">"BFD session flap kar raha hai. Kaise approach karoge?"</p><p>Main transitions aur history padhta hoon ki kab flap hota hai, app-route statistics ke loss, latency aur jitter se compare karta hoon aur wahi times par congestion ya provider event dekhta hoon. Verify karta hoon ki BFD traffic QoS design se protected hai, NAT timeouts aur path changes dekhta hoon, aur sirf workaround ke roop mein us colour ke timers adjust karta hoon. Phir provider ko times aur measurements se wajah sabit karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Expected sessions ginto; total, up aur flaps compare karo.</li>
<li>Down: remote TLOC, colours, ports, NAT, remote edge, tunnel interface, counters.</li>
<li>Flapping: loss, congestion, path changes, NAT timeouts; timers sirf workaround.</li>
<li>Jo counters ek hi direction mein chalte hain woh wapsi ke raaste ke filter ko dikhate hain.</li>
<li>MTU ko service VPN se DF bit ke saath test karo.</li>
</ul></div>
`}};export{e as default};