var e={id:`fc-basics`,h:{en:`Fibre Channel basics: lossless credits, FC-0 to FC-4, speeds and topologies`,hi:`Fibre Channel basics: lossless credits, FC-0 se FC-4, speeds aur topologies`},body:{en:`
<p>Picture a restaurant kitchen that only sends a plate out when a waiter is standing at the counter with empty hands. No waiter free, no plate leaves, so nothing is ever dropped on the floor. Ethernet works the other way: the kitchen keeps pushing plates, and if the counter is full, plates fall and somebody cooks them again later (TCP retransmission). <b>Fibre Channel (FC)</b> is the first kitchen. That single design choice explains most of what makes FC different.</p>

<h3>Why storage needs lossless delivery</h3>
<p>The SCSI protocol that hosts use to talk to disks was designed for a cable inside one computer. It assumes every command and every data block arrives. If a frame disappears, SCSI does not retransmit quickly; the host waits for an I/O timeout (often 30 seconds or more), aborts the command and retries. During that time the application is frozen. Fibre Channel therefore prevents loss instead of repairing it.</p>

<h3>Buffer-to-buffer credits: how FC prevents drops</h3>
<p>When two FC ports connect, each tells the other how many receive buffers it has. That number is the <b>BB_Credit</b> (buffer-to-buffer credit). The sender keeps a counter:</p>
<ol>
<li>At login the counter starts at the receiver's credit value, for example 32.</li>
<li>Every frame sent decrements the counter by one.</li>
<li>When the receiver frees a buffer, it returns a small primitive called <b>R_RDY</b> (receiver ready), and the sender increments the counter.</li>
<li>If the counter reaches zero, the sender <b>stops</b> and waits. It never sends a frame the receiver cannot store.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Buffer to buffer credit flow">
<rect x="20" y="40" width="170" height="110" rx="8" fill="#bbf7d0"/><text x="105" y="66" text-anchor="middle" class="svg-ink" font-size="13">Sender (HBA)</text><text x="105" y="92" text-anchor="middle" class="svg-muted" font-size="12">credit counter</text><text x="105" y="120" text-anchor="middle" class="svg-accent" font-size="14">32 → 31 → 30</text>
<rect x="450" y="40" width="170" height="110" rx="8" fill="#bae6fd"/><text x="535" y="66" text-anchor="middle" class="svg-ink" font-size="13">Receiver (MDS port)</text><text x="535" y="92" text-anchor="middle" class="svg-muted" font-size="12">32 receive buffers</text>
<line x1="190" y1="75" x2="450" y2="75" stroke="#64748b" stroke-width="2"/><polygon points="450,75 440,70 440,80" fill="#64748b"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="12">data frame (counter − 1)</text>
<line x1="450" y1="125" x2="190" y2="125" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><polygon points="190,125 200,120 200,130" fill="#64748b"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="12">R_RDY (counter + 1)</text>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">Counter at 0 = stop sending. Nothing is ever dropped.</text>
</svg><p class="cap">Credit-based flow control works hop by hop: host to switch, switch to switch, switch to array.</p></div>
<p>On an MDS you can see the credits on every port:</p>
<pre class="out">MDS-A# show interface fc1/1
fc1/1 is up
    Port WWN is 20:01:00:de:fb:12:34:56
    Admin port mode is F, trunk mode is on
    Port mode is F, FCID is 0x0a0000
    Port vsan is 10
    Operating Speed is 32 Gbps
    Port flow control supported (buffer-to-buffer credits)
<span class="hl">    Transmit B2B Credit is 64
    Receive B2B Credit is 32</span>
    Receive data field Size is 2112</pre>

<div class="eg"><p><b>Worked example: credits over distance.</b> Light travels about 5 microseconds per kilometre in fibre. A full FC frame at 16GFC takes about 1.26 microseconds to transmit, so it occupies about 250 metres of fibre. To keep a 10 km link full, the sender must have enough frames "in flight" to cover the round trip: 10 km × 2 = 20 km of fibre ÷ 0.25 km per frame = <b>80 credits</b> for full-size frames. If the average frame is half size, you need about 160. A normal port with 32 credits on that link would run at well under half speed. Long-distance ISLs therefore get extra credits (on MDS with <code>switchport fcrxbbcredit</code>, within platform limits).</p></div>

<h3>The FC layers: FC-0 to FC-4</h3>
<table class="cmp"><tr><th>Layer</th><th>What it defines</th><th>Rough OSI match</th></tr>
<tr><td><b>FC-0</b></td><td>Physical: optics, cables, connectors, signalling rate</td><td>Layer 1</td></tr>
<tr><td><b>FC-1</b></td><td>Encoding (8b/10b up to 8G, 64b/66b at 16G, 256b/257b at 32G and 64G), link-level primitives such as R_RDY and IDLE</td><td>Layer 1 to 2</td></tr>
<tr><td><b>FC-2</b></td><td>Framing, addressing (source and destination FCID), flow control with credits, classes of service, frames, sequences and exchanges</td><td>Layer 2 (plus a bit of 3 and 4)</td></tr>
<tr><td><b>FC-3</b></td><td>Common services across ports; rarely used in practice</td><td>n/a</td></tr>
<tr><td><b>FC-4</b></td><td>Upper-layer protocol mapping: <b>FCP</b> carries SCSI, <b>FC-NVMe</b> carries NVMe</td><td>Layer 4 to 7</td></tr>
</table>
<p>An FC frame is at most <b>2148 bytes</b>: start-of-frame, a 24-byte header (with destination ID, source ID, type and an exchange ID called <b>OX_ID</b>), up to <b>2112 bytes</b> of payload, a CRC and end-of-frame. Several frames form a <b>sequence</b> (for example one block of data), and all sequences of one SCSI command form an <b>exchange</b>. Almost all SAN traffic uses <b>Class 3</b> service: datagram-style, no per-frame acknowledgement, with reliability coming from credits and from SCSI itself.</p>

<h3>Speeds</h3>
<table class="cmp"><tr><th>Name</th><th>Line rate</th><th>Encoding</th><th>Throughput per direction</th></tr>
<tr><td>8GFC</td><td>8.5 GBaud</td><td>8b/10b</td><td>about 800 MB/s</td></tr>
<tr><td>16GFC</td><td>14.025 GBaud</td><td>64b/66b</td><td>about 1,600 MB/s</td></tr>
<tr><td>32GFC</td><td>28.05 GBaud</td><td>256b/257b with FEC</td><td>about 3,200 MB/s</td></tr>
<tr><td>64GFC</td><td>28.9 GBaud PAM4</td><td>256b/257b with FEC</td><td>about 6,400 MB/s</td></tr>
</table>
<p>FC is full duplex, so a 32G link carries about 3,200 MB/s in each direction at once. A new speed generation normally auto-negotiates down to the previous two (a 32G port runs at 32, 16 or 8G), but the optic must also support the speed. Short-wave optics on OM4 multimode reach about 100 metres at 32G; longer runs need long-wave single-mode optics.</p>

<h3>Topologies</h3>
<ul>
<li><b>Point-to-point</b>: two N_Ports connected directly, for example a server cabled straight to an array. Simple, no switch, no sharing.</li>
<li><b>Arbitrated loop (FC-AL)</b>: up to 126 devices plus one switch port in a ring, sharing the bandwidth; a device must win arbitration before it may send. One device resetting the loop disturbed everybody. It is historic; you will only meet it in old disk shelves and exam questions.</li>
<li><b>Switched fabric</b>: every device connects to a switch port and gets dedicated bandwidth. Each switch is a <b>domain</b>; a fabric supports up to <b>239 domains</b>. This is the only topology you will build in this course.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Thinking "lossless" means "cannot congest". Credits stop drops, but a slow device that returns R_RDY late (a <b>slow-drain</b> device) makes the switch hold frames, which back-pressures the ISL and slows every other host sharing it. Also: mixing optics of different speeds or fibre types and then blaming the switch for a port stuck at a low speed.</p></div>
<div class="exam"><p><b>Exam tip.</b> FC is lossless through buffer-to-buffer credits and R_RDY. FC-2 is the framing and flow-control layer; FC-4 maps SCSI (FCP) and NVMe. Maximum payload 2112 bytes; a switched fabric supports 239 domains.</p></div>

<div class="scn"><h4>The replication link that ran at 30%</h4><p>A bank added a 25 km dark-fibre ISL at 16G between two MDS switches for array replication. Replication fell hours behind even though link utilisation never went above 30%. The SAN engineer checked <code>show interface</code> on the ISL: the port was up at 16 Gbps but had only the default receive credits, and the counters showed the transmit credit reaching zero constantly. The math: 25 km × 2 ÷ 0.25 km ≈ 200 credits needed for full frames. After a change window to raise the credits on both ends of the ISL, replication caught up in 40 minutes.</p><p><b>Lesson:</b> on long FC links, bandwidth is limited by credits, not by the line rate.</p></div>

<div class="iv"><p class="q">"How does Fibre Channel achieve lossless delivery, and what can still go wrong?"</p><p>Strong answer: hop-by-hop buffer-to-buffer credits; each port advertises its receive buffers at login, the sender decrements a counter per frame and increments it on R_RDY, and stops at zero, so frames are never dropped for lack of buffers. What still goes wrong: slow-drain devices hold credits and cause back-pressure across ISLs, and long-distance links need more credits or they run below line rate. Mentioning credit math per kilometre is a strong signal.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SCSI expects no loss, so FC prevents drops with buffer-to-buffer credits and R_RDY instead of retransmitting.</li>
<li>FC-0 physical, FC-1 encoding, FC-2 framing and flow control, FC-3 common services, FC-4 protocol mapping (FCP, FC-NVMe).</li>
<li>Frames (max 2148 bytes, 2112 payload) form sequences, and sequences form exchanges identified by OX_ID.</li>
<li>Speeds 8, 16, 32 and 64GFC, roughly 100 MB/s per Gb, full duplex; long links need more credits.</li>
<li>Topologies: point-to-point, arbitrated loop (historic) and switched fabric (up to 239 domains).</li>
</ul></div>
`,hi:`
<p>Ek restaurant kitchen socho jo plate tabhi bhejta hai jab counter par ek waiter khaali haath khada ho. Waiter free nahi, to plate nahi jaati, isliye kuch bhi kabhi zameen par nahi girta. Ethernet ulta kaam karta hai: kitchen plates dhakelta rehta hai, aur agar counter full hai to plates girti hain aur koi baad mein unhe dobara banata hai (TCP retransmission). <b>Fibre Channel (FC)</b> pehla kitchen hai. Yahi ek design choice FC ki zyada tar khasiyat samjhati hai.</p>

<h3>Storage ko lossless delivery kyun chahiye</h3>
<p>Hosts disks se baat karne ke liye jo SCSI protocol use karte hain, woh ek computer ke andar ki cable ke liye bana tha. Woh maanta hai ki har command aur har data block pahunchega. Agar frame gayab ho jaaye, to SCSI jaldi retransmit nahi karta; host I/O timeout (aksar 30 seconds ya zyada) ka wait karta hai, command abort karta hai aur retry karta hai. Us dauraan application freeze rehti hai. Isliye Fibre Channel loss ko repair karne ke bajaye rokta hai.</p>

<h3>Buffer-to-buffer credits: FC drops kaise rokta hai</h3>
<p>Jab do FC ports judte hain, har ek doosre ko batata hai ki uske paas kitne receive buffers hain. Woh number <b>BB_Credit</b> (buffer-to-buffer credit) hai. Sender ek counter rakhta hai:</p>
<ol>
<li>Login par counter receiver ki credit value se shuru hota hai, jaise 32.</li>
<li>Har bheja gaya frame counter ko ek se kam karta hai.</li>
<li>Jab receiver ek buffer free karta hai, woh ek chhota primitive <b>R_RDY</b> (receiver ready) wapas bhejta hai, aur sender counter badha deta hai.</li>
<li>Agar counter zero par pahunch jaaye, sender <b>ruk</b> jaata hai aur wait karta hai. Woh kabhi aisa frame nahi bhejta jo receiver store na kar sake.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Buffer to buffer credit ka flow">
<rect x="20" y="40" width="170" height="110" rx="8" fill="#bbf7d0"/><text x="105" y="66" text-anchor="middle" class="svg-ink" font-size="13">Sender (HBA)</text><text x="105" y="92" text-anchor="middle" class="svg-muted" font-size="12">credit counter</text><text x="105" y="120" text-anchor="middle" class="svg-accent" font-size="14">32 → 31 → 30</text>
<rect x="450" y="40" width="170" height="110" rx="8" fill="#bae6fd"/><text x="535" y="66" text-anchor="middle" class="svg-ink" font-size="13">Receiver (MDS port)</text><text x="535" y="92" text-anchor="middle" class="svg-muted" font-size="12">32 receive buffers</text>
<line x1="190" y1="75" x2="450" y2="75" stroke="#64748b" stroke-width="2"/><polygon points="450,75 440,70 440,80" fill="#64748b"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="12">data frame (counter − 1)</text>
<line x1="450" y1="125" x2="190" y2="125" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><polygon points="190,125 200,120 200,130" fill="#64748b"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="12">R_RDY (counter + 1)</text>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">Counter 0 = bhejna band. Kuch bhi drop nahi hota.</text>
</svg><p class="cap">Credit-based flow control hop by hop kaam karta hai: host se switch, switch se switch, switch se array.</p></div>
<p>MDS par aap har port ke credits dekh sakte ho:</p>
<pre class="out">MDS-A# show interface fc1/1
fc1/1 is up
    Port WWN is 20:01:00:de:fb:12:34:56
    Admin port mode is F, trunk mode is on
    Port mode is F, FCID is 0x0a0000
    Port vsan is 10
    Operating Speed is 32 Gbps
    Port flow control supported (buffer-to-buffer credits)
<span class="hl">    Transmit B2B Credit is 64
    Receive B2B Credit is 32</span>
    Receive data field Size is 2112</pre>

<div class="eg"><p><b>Worked example: distance par credits.</b> Fibre mein light lagbhag 5 microseconds per kilometre chalti hai. 16GFC par ek full FC frame transmit hone mein lagbhag 1.26 microseconds leta hai, isliye woh fibre ka lagbhag 250 metre gherta hai. 10 km link ko full rakhne ke liye sender ke paas round trip cover karne jitne frames "in flight" hone chahiye: 10 km × 2 = 20 km fibre ÷ 0.25 km per frame = full-size frames ke liye <b>80 credits</b>. Agar average frame aadhe size ka hai, to lagbhag 160 chahiye. Us link par 32 credits wala normal port aadhi speed se bhi kaafi kam par chalega. Isliye long-distance ISLs ko extra credits diye jaate hain (MDS par <code>switchport fcrxbbcredit</code> se, platform limits ke andar).</p></div>

<h3>FC layers: FC-0 se FC-4</h3>
<table class="cmp"><tr><th>Layer</th><th>Kya define karta hai</th><th>Lagbhag OSI match</th></tr>
<tr><td><b>FC-0</b></td><td>Physical: optics, cables, connectors, signalling rate</td><td>Layer 1</td></tr>
<tr><td><b>FC-1</b></td><td>Encoding (8G tak 8b/10b, 16G par 64b/66b, 32G aur 64G par 256b/257b), link-level primitives jaise R_RDY aur IDLE</td><td>Layer 1 se 2</td></tr>
<tr><td><b>FC-2</b></td><td>Framing, addressing (source aur destination FCID), credits se flow control, classes of service, frames, sequences aur exchanges</td><td>Layer 2 (plus thoda 3 aur 4)</td></tr>
<tr><td><b>FC-3</b></td><td>Ports ke across common services; practice mein kam use hota hai</td><td>n/a</td></tr>
<tr><td><b>FC-4</b></td><td>Upper-layer protocol mapping: <b>FCP</b> SCSI le jaata hai, <b>FC-NVMe</b> NVMe le jaata hai</td><td>Layer 4 se 7</td></tr>
</table>
<p>FC frame zyada se zyada <b>2148 bytes</b> ka hota hai: start-of-frame, 24-byte header (destination ID, source ID, type aur ek exchange ID jise <b>OX_ID</b> kehte hain), <b>2112 bytes</b> tak payload, ek CRC aur end-of-frame. Kai frames milkar ek <b>sequence</b> banate hain (jaise data ka ek block), aur ek SCSI command ke saare sequences milkar ek <b>exchange</b> banate hain. Lagbhag saara SAN traffic <b>Class 3</b> service use karta hai: datagram-style, har frame ka acknowledgement nahi, reliability credits aur khud SCSI se aati hai.</p>

<h3>Speeds</h3>
<table class="cmp"><tr><th>Naam</th><th>Line rate</th><th>Encoding</th><th>Har direction ka throughput</th></tr>
<tr><td>8GFC</td><td>8.5 GBaud</td><td>8b/10b</td><td>lagbhag 800 MB/s</td></tr>
<tr><td>16GFC</td><td>14.025 GBaud</td><td>64b/66b</td><td>lagbhag 1,600 MB/s</td></tr>
<tr><td>32GFC</td><td>28.05 GBaud</td><td>FEC ke saath 256b/257b</td><td>lagbhag 3,200 MB/s</td></tr>
<tr><td>64GFC</td><td>28.9 GBaud PAM4</td><td>FEC ke saath 256b/257b</td><td>lagbhag 6,400 MB/s</td></tr>
</table>
<p>FC full duplex hai, isliye 32G link ek saath har direction mein lagbhag 3,200 MB/s le jaata hai. Nayi speed generation normally pichhli do tak auto-negotiate karti hai (32G port 32, 16 ya 8G par chalta hai), lekin optic ko bhi woh speed support karni chahiye. OM4 multimode par short-wave optics 32G par lagbhag 100 metre tak pahunchti hain; lambe runs ke liye long-wave single-mode optics chahiye.</p>

<h3>Topologies</h3>
<ul>
<li><b>Point-to-point</b>: do N_Ports seedhe jude, jaise server seedha array se cabled. Simple, koi switch nahi, koi sharing nahi.</li>
<li><b>Arbitrated loop (FC-AL)</b>: 126 devices tak plus ek switch port ek ring mein, bandwidth share karte hue; bhejne se pehle device ko arbitration jeetna padta hai. Ek device loop reset kare to sab disturb hote the. Yeh historic hai; yeh aapko sirf purane disk shelves aur exam questions mein milega.</li>
<li><b>Switched fabric</b>: har device switch port se judta hai aur use dedicated bandwidth milti hai. Har switch ek <b>domain</b> hai; ek fabric <b>239 domains</b> tak support karta hai. Is course mein aap sirf yahi topology banaoge.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Yeh sochna ki "lossless" ka matlab "congest nahi ho sakta". Credits drops rokte hain, lekin ek slow device jo R_RDY der se lautata hai (<b>slow-drain</b> device) switch ko frames pakad kar rakhne par majboor karta hai, jo ISL par back-pressure daalta hai aur use share karne wale har doosre host ko slow kar deta hai. Aur: alag speed ya fibre type ki optics mix karna aur phir low speed par atke port ke liye switch ko blame karna.</p></div>
<div class="exam"><p><b>Exam tip.</b> FC buffer-to-buffer credits aur R_RDY se lossless hai. FC-2 framing aur flow-control layer hai; FC-4 SCSI (FCP) aur NVMe map karta hai. Maximum payload 2112 bytes; switched fabric 239 domains support karta hai.</p></div>

<div class="scn"><h4>Woh replication link jo 30% par chalta tha</h4><p>Ek bank ne array replication ke liye do MDS switches ke beech 16G par 25 km ka dark-fibre ISL joda. Link utilisation kabhi 30% se upar nahi gaya, phir bhi replication ghanton peeche ho gaya. SAN engineer ne ISL par <code>show interface</code> check kiya: port 16 Gbps par up tha lekin sirf default receive credits the, aur counters dikha rahe the ki transmit credit baar baar zero par pahunch raha hai. Math: full frames ke liye 25 km × 2 ÷ 0.25 km ≈ 200 credits chahiye. ISL ke dono ends par credits badhane ke change window ke baad replication 40 minute mein catch up kar gaya.</p><p><b>Seekh:</b> lambe FC links par bandwidth credits se limit hoti hai, line rate se nahi.</p></div>

<div class="iv"><p class="q">"Fibre Channel lossless delivery kaise achieve karta hai, aur phir bhi kya galat ho sakta hai?"</p><p>Strong answer: hop-by-hop buffer-to-buffer credits; har port login par apne receive buffers advertise karta hai, sender har frame par counter kam karta hai aur R_RDY par badhata hai, aur zero par ruk jaata hai, isliye buffers ki kami se frames kabhi drop nahi hote. Phir bhi kya galat hota hai: slow-drain devices credits pakad kar rakhte hain aur ISLs par back-pressure paida karte hain, aur long-distance links ko zyada credits chahiye warna woh line rate se neeche chalte hain. Per kilometre credit math ka zikr strong signal hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SCSI loss expect nahi karta, isliye FC retransmit karne ke bajaye buffer-to-buffer credits aur R_RDY se drops rokta hai.</li>
<li>FC-0 physical, FC-1 encoding, FC-2 framing aur flow control, FC-3 common services, FC-4 protocol mapping (FCP, FC-NVMe).</li>
<li>Frames (max 2148 bytes, 2112 payload) sequences banate hain, aur sequences OX_ID se pehchane jaane wale exchanges banate hain.</li>
<li>Speeds 8, 16, 32 aur 64GFC, lagbhag 100 MB/s per Gb, full duplex; lambe links ko zyada credits chahiye.</li>
<li>Topologies: point-to-point, arbitrated loop (historic) aur switched fabric (239 domains tak).</li>
</ul></div>
`}};export{e as default};