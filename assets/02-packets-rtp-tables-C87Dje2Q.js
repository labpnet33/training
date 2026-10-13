var e={id:`packets-rtp-tables`,h:{en:`Packets, RTP and the three tables`,hi:`Packets, RTP aur teen tables`},body:{en:`
<p>Think about the difference between a postcard and a registered letter. A postcard is cheap: you drop it in the box and hope. A registered letter costs more, but the post office gets a signature, and if nobody signs, it tries again. EIGRP uses both. Small "I am still here" messages are postcards. Anything that changes the routing table travels as a registered letter that must be acknowledged. This mix is what lets EIGRP be both lightweight and reliable.</p>

<h3>Where EIGRP sits in the packet</h3>
<p>EIGRP does not use TCP or UDP. Its packets ride directly inside IP with <b>protocol number 88</b>. Most packets are sent to the multicast group <b>224.0.0.10</b> (FF02::A for IPv6) with a TTL of 1, so they never leave the local link. Some packets are unicast to one neighbour, as you will see below.</p>

<h3>The five packet types</h3>
<table class="cmp"><tr><th>Packet</th><th>Purpose</th><th>Reliable?</th><th>Sent as</th></tr>
<tr><td>Hello</td><td>Discover neighbours and keep them alive</td><td>No</td><td>Multicast</td></tr>
<tr><td>Update</td><td>Carry routes: full table to a new neighbour, then only changes</td><td>Yes</td><td>Unicast to a new neighbour, multicast for changes</td></tr>
<tr><td>Query</td><td>"I lost my route to X and have no backup. Do you have a path?"</td><td>Yes</td><td>Usually multicast</td></tr>
<tr><td>Reply</td><td>Answer to a Query, with the replier's metric (or unreachable)</td><td>Yes</td><td>Unicast</td></tr>
<tr><td>ACK</td><td>Acknowledge a reliable packet; it is a Hello with no data and a non-zero acknowledgement number</td><td>No</td><td>Unicast</td></tr>
</table>
<p>Two extra types appear later in the module: <b>SIA-Query</b> and <b>SIA-Reply</b>, used to check on a neighbour that has not answered a Query for a long time (chapter 8).</p>

<h3>RTP: EIGRP's own reliability layer</h3>
<p>The <b>Reliable Transport Protocol</b> gives every reliable packet a <b>sequence number</b>. The receiver acknowledges it, often by piggybacking the acknowledgement on its own next packet. If an acknowledgement does not arrive within the <b>RTO</b> (retransmission timeout, calculated from the measured round-trip time, <b>SRTT</b>), the packet is retransmitted as <b>unicast</b> to the neighbours that did not acknowledge. After <b>16</b> unsuccessful retries the neighbour is reset with the message <code>retry limit exceeded</code>. Packets waiting for acknowledgement are counted in the <b>Q Cnt</b> column of <code>show ip eigrp neighbors</code>; a Q Cnt that stays above 0 means a neighbour is not acknowledging.</p>

<h3>Timers</h3>
<ul>
<li><b>Hello interval</b>: 5 seconds on Ethernet, point-to-point links and fast WAN links; 60 seconds on multipoint NBMA interfaces at T1 speed (1.544 Mbps) or slower.</li>
<li><b>Hold time</b>: by default three times the hello, so 15 or 180 seconds. If no EIGRP packet arrives from a neighbour within the hold time, it is declared down.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Neighbour bring-up sequence">
<rect x="80" y="14" width="100" height="32" rx="6" fill="#bbf7d0"/><text x="130" y="35" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="460" y="14" width="100" height="32" rx="6" fill="#bae6fd"/><text x="510" y="35" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<line x1="130" y1="46" x2="130" y2="290" stroke="#64748b" stroke-width="1.5"/><line x1="510" y1="46" x2="510" y2="290" stroke="#64748b" stroke-width="1.5"/>
<line x1="130" y1="70" x2="510" y2="80" stroke="#64748b" stroke-width="2"/><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">1. Hello (multicast)</text>
<line x1="510" y1="100" x2="130" y2="110" stroke="#64748b" stroke-width="2"/><text x="320" y="98" text-anchor="middle" class="svg-muted" font-size="12">2. Hello, then empty Update with INIT</text>
<line x1="130" y1="135" x2="510" y2="145" stroke="#64748b" stroke-width="2"/><text x="320" y="133" text-anchor="middle" class="svg-muted" font-size="12">3. ACK plus own INIT Update</text>
<line x1="510" y1="170" x2="130" y2="180" stroke="#64748b" stroke-width="2"/><text x="320" y="168" text-anchor="middle" class="svg-accent" font-size="12">4. Full Updates (unicast)</text>
<line x1="130" y1="205" x2="510" y2="215" stroke="#64748b" stroke-width="2"/><text x="320" y="203" text-anchor="middle" class="svg-accent" font-size="12">5. Full Updates plus ACKs</text>
<line x1="510" y1="240" x2="130" y2="250" stroke="#64748b" stroke-width="2"/><text x="320" y="238" text-anchor="middle" class="svg-muted" font-size="12">6. ACK</text>
<text x="320" y="282" text-anchor="middle" class="svg-ink" font-size="12">Converged: only Hellos until something changes</text>
</svg><p class="cap">How R1 and R2 bring up an adjacency. Every Update is acknowledged; Hellos are not.</p></div>

<h3>The three tables</h3>
<dl class="terms">
<dt>Neighbour table</dt><dd>Every router that answered Hellos: address, interface, hold timer, uptime, SRTT, RTO, queue count and last sequence number. Command: <code>show ip eigrp neighbors</code>.</dd>
<dt>Topology table</dt><dd>Every prefix learned from every neighbour, with each neighbour's reported distance and your total metric through it. DUAL works on this table. Command: <code>show ip eigrp topology</code>.</dd>
<dt>Routing table (RIB)</dt><dd>Only the best path or paths (successors) are installed, marked <code>D</code> or <code>D EX</code>. Command: <code>show ip route eigrp</code>.</dd>
</dl>

<h3>Partial and bounded updates</h3>
<p>RIP re-sends its whole table on a timer. EIGRP does not. After the initial full exchange with a new neighbour, it sends an Update only when a route changes (<b>partial</b>), and only to neighbours affected by that change (<b>bounded</b>). Split horizon is on by default: a router does not advertise a route out of the interface it uses to reach that route. In a stable network, the only traffic you will see is a Hello every 5 seconds.</p>

<div class="eg"><p><b>Worked example: counting packets.</b> A stable router with two neighbours sends one Hello per interface every 5 seconds: 2 x 12 = 24 Hellos per minute, about 1,440 per hour, each well under 100 bytes. Now an interface on R3 flaps. R3 sends one multicast Update about the lost prefix; R1 and R2 each ACK it. Later, when the interface returns, another Update and two ACKs follow. You can watch these counters grow with <code>show ip eigrp traffic</code>.</p></div>

<pre class="out">R1# show ip eigrp traffic
EIGRP-IPv4 Traffic Statistics for AS(100)
  <span class="hl">Hellos sent/received: 412/398</span>
  <span class="hl">Updates sent/received: 9/11</span>
  Queries sent/received: 1/0
  Replies sent/received: 0/1
  Acks sent/received: 8/7
  SIA-Queries sent/received: 0/0
  SIA-Replies sent/received: 0/0
  Hello Process ID: 285
  PDM Process ID: 283
  Socket Queue: 0/10000/2/0 (current/max/highest/drops)
  Input Queue: 0/2000/2/0 (current/max/highest/drops)</pre>

<div class="warn"><p><b>Common mistake.</b> Thinking an ACK is a separate protocol message with its own opcode. An EIGRP ACK is simply a Hello packet that carries no routes and has a non-zero acknowledgement number. That is also why ACKs themselves are never acknowledged.</p></div>

<div class="exam"><p><b>Exam trap.</b> Reliable: Update, Query, Reply (and SIA-Query/SIA-Reply). Unreliable: Hello and ACK. Replies are unicast; Hellos are multicast. Updates to a brand-new neighbour are unicast; updates about changes are multicast.</p></div>

<div class="scn"><h4>Hellos pass, updates die</h4><p>A new EIGRP adjacency between two data-centre routers came up, then went down about 80 seconds later with <code>retry limit exceeded</code>, over and over. Hellos clearly worked. The engineer noticed that the Q Cnt column was stuck at 3 and the SRTT was 0. A switch in the path had a lower MTU on one trunk than the router interfaces, so small Hellos passed but the large, full-sized initial Update packets were dropped. RTP retried 16 times and gave up. Fixing the MTU on the trunk stabilised the neighbour.</p><p><b>Lesson:</b> a neighbour that flaps with "retry limit exceeded" and a stuck Q Cnt means reliable packets are not getting through; check MTU, unicast filtering and one-way links.</p></div>

<div class="iv"><p class="q">"Which EIGRP packets are sent reliably, and how does RTP make them reliable?"</p><p>Strong answer: Updates, Queries and Replies are reliable; Hellos and ACKs are not. RTP puts a sequence number on each reliable packet and waits for an acknowledgement; if none arrives within the RTO, derived from the SRTT, it retransmits as unicast to the missing neighbours, and after 16 retries it resets the neighbour. Mention protocol 88, multicast 224.0.0.10, and that ACKs are data-less Hellos.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five packet types: Hello, Update, Query, Reply, ACK (plus SIA-Query and SIA-Reply).</li>
<li>RTP gives Updates, Queries and Replies sequence numbers, acknowledgements and unicast retransmission; 16 failed retries reset the neighbour.</li>
<li>Default hello 5 s and hold 15 s; 60 s and 180 s on slow multipoint NBMA links.</li>
<li>Three tables: neighbour, topology (all advertised paths) and routing (successors only).</li>
<li>Updates are partial and bounded; a stable EIGRP network sends only Hellos.</li>
</ul></div>
`,hi:`
<p>Postcard aur registered letter ka fark socho. Postcard sasta hai: box mein daalo aur umeed karo. Registered letter mehenga hai, lekin post office signature leta hai, aur agar koi sign na kare to dobara koshish karta hai. EIGRP dono use karta hai. Chhote "main abhi bhi yahan hoon" messages postcards hain. Jo bhi cheez routing table badalti hai woh registered letter ki tarah jaati hai jiska acknowledgement zaroori hai. Yahi mix EIGRP ko halka aur reliable dono banata hai.</p>

<h3>Packet mein EIGRP kahan baithta hai</h3>
<p>EIGRP TCP ya UDP use nahi karta. Iske packets seedha IP ke andar <b>protocol number 88</b> ke saath chalte hain. Zyada tar packets multicast group <b>224.0.0.10</b> (IPv6 ke liye FF02::A) par TTL 1 ke saath bheje jaate hain, isliye woh kabhi local link se bahar nahi jaate. Kuch packets ek neighbour ko unicast hote hain, jaisa aap neeche dekhoge.</p>

<h3>Paanch packet types</h3>
<table class="cmp"><tr><th>Packet</th><th>Kaam</th><th>Reliable?</th><th>Kaise bheja jaata hai</th></tr>
<tr><td>Hello</td><td>Neighbours dhoondhna aur unhe zinda rakhna</td><td>Nahi</td><td>Multicast</td></tr>
<tr><td>Update</td><td>Routes le jaana: naye neighbour ko poori table, phir sirf changes</td><td>Haan</td><td>Naye neighbour ko unicast, changes ke liye multicast</td></tr>
<tr><td>Query</td><td>"Mera X ka route chala gaya aur backup nahi hai. Kya aapke paas path hai?"</td><td>Haan</td><td>Aam taur par multicast</td></tr>
<tr><td>Reply</td><td>Query ka jawab, replier ke metric ke saath (ya unreachable)</td><td>Haan</td><td>Unicast</td></tr>
<tr><td>ACK</td><td>Reliable packet ko acknowledge karna; yeh bina data ka Hello hai jisme non-zero acknowledgement number hota hai</td><td>Nahi</td><td>Unicast</td></tr>
</table>
<p>Module mein aage do extra types aate hain: <b>SIA-Query</b> aur <b>SIA-Reply</b>, jo us neighbour ko check karne ke liye use hote hain jisne lambe samay se Query ka jawab nahi diya (chapter 8).</p>

<h3>RTP: EIGRP ki apni reliability layer</h3>
<p><b>Reliable Transport Protocol</b> har reliable packet ko ek <b>sequence number</b> deta hai. Receiver use acknowledge karta hai, aksar acknowledgement ko apne agle packet par piggyback karke. Agar <b>RTO</b> (retransmission timeout, jo measured round-trip time <b>SRTT</b> se calculate hota hai) ke andar acknowledgement na aaye, to packet un neighbours ko <b>unicast</b> ke roop mein retransmit hota hai jinhone acknowledge nahi kiya. <b>16</b> nakaam retries ke baad neighbour <code>retry limit exceeded</code> message ke saath reset ho jaata hai. Acknowledgement ka wait kar rahe packets <code>show ip eigrp neighbors</code> ke <b>Q Cnt</b> column mein gine jaate hain; agar Q Cnt 0 se upar hi atka rahe, matlab koi neighbour acknowledge nahi kar raha.</p>

<h3>Timers</h3>
<ul>
<li><b>Hello interval</b>: Ethernet, point-to-point links aur fast WAN links par 5 second; T1 speed (1.544 Mbps) ya usse slow multipoint NBMA interfaces par 60 second.</li>
<li><b>Hold time</b>: default mein hello ka teen guna, yaani 15 ya 180 second. Agar hold time ke andar neighbour se koi EIGRP packet na aaye, to use down declare kar diya jaata hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Neighbour bring-up sequence">
<rect x="80" y="14" width="100" height="32" rx="6" fill="#bbf7d0"/><text x="130" y="35" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="460" y="14" width="100" height="32" rx="6" fill="#bae6fd"/><text x="510" y="35" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<line x1="130" y1="46" x2="130" y2="290" stroke="#64748b" stroke-width="1.5"/><line x1="510" y1="46" x2="510" y2="290" stroke="#64748b" stroke-width="1.5"/>
<line x1="130" y1="70" x2="510" y2="80" stroke="#64748b" stroke-width="2"/><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">1. Hello (multicast)</text>
<line x1="510" y1="100" x2="130" y2="110" stroke="#64748b" stroke-width="2"/><text x="320" y="98" text-anchor="middle" class="svg-muted" font-size="12">2. Hello, phir INIT wala khaali Update</text>
<line x1="130" y1="135" x2="510" y2="145" stroke="#64748b" stroke-width="2"/><text x="320" y="133" text-anchor="middle" class="svg-muted" font-size="12">3. ACK plus apna INIT Update</text>
<line x1="510" y1="170" x2="130" y2="180" stroke="#64748b" stroke-width="2"/><text x="320" y="168" text-anchor="middle" class="svg-accent" font-size="12">4. Poore Updates (unicast)</text>
<line x1="130" y1="205" x2="510" y2="215" stroke="#64748b" stroke-width="2"/><text x="320" y="203" text-anchor="middle" class="svg-accent" font-size="12">5. Poore Updates plus ACKs</text>
<line x1="510" y1="240" x2="130" y2="250" stroke="#64748b" stroke-width="2"/><text x="320" y="238" text-anchor="middle" class="svg-muted" font-size="12">6. ACK</text>
<text x="320" y="282" text-anchor="middle" class="svg-ink" font-size="12">Converged: jab tak kuch na badle, sirf Hellos</text>
</svg><p class="cap">R1 aur R2 adjacency kaise banate hain. Har Update ka acknowledgement hota hai; Hellos ka nahi.</p></div>

<h3>Teen tables</h3>
<dl class="terms">
<dt>Neighbour table</dt><dd>Har woh router jisne Hellos ka jawab diya: address, interface, hold timer, uptime, SRTT, RTO, queue count aur last sequence number. Command: <code>show ip eigrp neighbors</code>.</dd>
<dt>Topology table</dt><dd>Har neighbour se seekha har prefix, har neighbour ke reported distance aur uske through aapke total metric ke saath. DUAL isi table par kaam karta hai. Command: <code>show ip eigrp topology</code>.</dd>
<dt>Routing table (RIB)</dt><dd>Sirf best path ya paths (successors) install hote hain, <code>D</code> ya <code>D EX</code> mark ke saath. Command: <code>show ip route eigrp</code>.</dd>
</dl>

<h3>Partial aur bounded updates</h3>
<p>RIP timer par apni poori table dobara bhejta hai. EIGRP nahi. Naye neighbour ke saath pehle full exchange ke baad, yeh Update sirf tab bhejta hai jab koi route badle (<b>partial</b>), aur sirf un neighbours ko jin par us change ka asar ho (<b>bounded</b>). Split horizon default mein on hai: router kisi route ko us interface se advertise nahi karta jisse woh khud us route tak pahunchta hai. Stable network mein aapko sirf har 5 second ek Hello dikhega.</p>

<div class="eg"><p><b>Worked example: packets ginna.</b> Do neighbours wala ek stable router har interface par har 5 second ek Hello bhejta hai: 2 x 12 = 24 Hellos per minute, lagbhag 1,440 per ghanta, har ek 100 bytes se kaafi kam. Ab R3 par ek interface flap hota hai. R3 lost prefix ke baare mein ek multicast Update bhejta hai; R1 aur R2 dono use ACK karte hain. Baad mein jab interface wapas aata hai, ek aur Update aur do ACKs aate hain. In counters ko aap <code>show ip eigrp traffic</code> se badhte dekh sakte ho.</p></div>

<pre class="out">R1# show ip eigrp traffic
EIGRP-IPv4 Traffic Statistics for AS(100)
  <span class="hl">Hellos sent/received: 412/398</span>
  <span class="hl">Updates sent/received: 9/11</span>
  Queries sent/received: 1/0
  Replies sent/received: 0/1
  Acks sent/received: 8/7
  SIA-Queries sent/received: 0/0
  SIA-Replies sent/received: 0/0
  Hello Process ID: 285
  PDM Process ID: 283
  Socket Queue: 0/10000/2/0 (current/max/highest/drops)
  Input Queue: 0/2000/2/0 (current/max/highest/drops)</pre>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki ACK apne opcode wala alag protocol message hai. EIGRP ACK bas ek Hello packet hai jisme koi routes nahi hote aur non-zero acknowledgement number hota hai. Isi wajah se ACKs ka khud kabhi acknowledgement nahi hota.</p></div>

<div class="exam"><p><b>Exam trap.</b> Reliable: Update, Query, Reply (aur SIA-Query/SIA-Reply). Unreliable: Hello aur ACK. Replies unicast hote hain; Hellos multicast. Bilkul naye neighbour ko Updates unicast jaate hain; changes wale updates multicast.</p></div>

<div class="scn"><h4>Hellos pass, updates marte hain</h4><p>Do data-centre routers ke beech ek nayi EIGRP adjacency up hui, phir lagbhag 80 second baad <code>retry limit exceeded</code> ke saath down ho gayi, baar baar. Hellos saaf taur par kaam kar rahe the. Engineer ne dekha ki Q Cnt column 3 par atka tha aur SRTT 0 tha. Path ke ek switch par ek trunk ka MTU router interfaces se kam tha, isliye chhote Hellos pass ho jaate the lekin bade, full-size initial Update packets drop ho jaate the. RTP ne 16 baar retry kiya aur haar maan li. Trunk par MTU theek karne se neighbour stable ho gaya.</p><p><b>Seekh:</b> jo neighbour "retry limit exceeded" ke saath flap kare aur Q Cnt atka ho, matlab reliable packets nahi pahunch rahe; MTU, unicast filtering aur one-way links check karo.</p></div>

<div class="iv"><p class="q">"Kaunse EIGRP packets reliably bheje jaate hain, aur RTP unhe reliable kaise banata hai?"</p><p>Strong answer: Updates, Queries aur Replies reliable hain; Hellos aur ACKs nahi. RTP har reliable packet par sequence number lagata hai aur acknowledgement ka wait karta hai; SRTT se nikle RTO ke andar na aaye to missing neighbours ko unicast mein retransmit karta hai, aur 16 retries ke baad neighbour reset kar deta hai. Protocol 88, multicast 224.0.0.10, aur yeh ki ACKs bina data ke Hellos hain, zaroor bolo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch packet types: Hello, Update, Query, Reply, ACK (plus SIA-Query aur SIA-Reply).</li>
<li>RTP Updates, Queries aur Replies ko sequence numbers, acknowledgements aur unicast retransmission deta hai; 16 nakaam retries neighbour reset karti hain.</li>
<li>Default hello 5 s aur hold 15 s; slow multipoint NBMA links par 60 s aur 180 s.</li>
<li>Teen tables: neighbour, topology (saare advertised paths) aur routing (sirf successors).</li>
<li>Updates partial aur bounded hain; stable EIGRP network sirf Hellos bhejta hai.</li>
</ul></div>
`}};export{e as default};