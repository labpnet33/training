var e=(e,t,n,r,i,a)=>`<text x="`+e+`" y="`+t+`" text-anchor="`+(a||`middle`)+`" class="`+(r||`svg-ink`)+`" font-size="`+(i||12)+`">`+n+`</text>`,t=(e,t,n,r,i)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" fill="`+i+`" stroke="#64748b" stroke-width="0.8"/>`,n=(n,r,i)=>{let a=600/32,o=``;return[0,8,16,24].forEach(t=>{o+=e(20+t*a+2,12,t,`svg-muted`,10,`start`)}),o+=e(618,12,31,`svg-muted`,10,`end`),n.forEach((n,r)=>{let i=20,s=18+r*34;n.forEach(n=>{let r=n[1]*a;o+=t(i,s,r,32,n[2])+e(i+r/2,s+20,n[0],`svg-ink`,n[3]||11),i+=r})}),`<div class="dia"><svg viewBox="0 0 640 `+(24+n.length*34)+`" role="img" aria-label="`+i+`">`+o+`</svg><p class="cap">`+r+`</p></div>`},r=[[[`Source Port (16)`,16,`#bae6fd`],[`Destination Port (16)`,16,`#bae6fd`]],[[`Sequence Number (32)`,32,`#ddd6fe`]],[[`Acknowledgment Number (32)`,32,`#ddd6fe`]],[[`Offset`,4,`#e2e8f0`,10],[`Rsv`,3,`#f1f5f9`,8],[`NS`,1,`#f1f5f9`,7],[`CWR`,1,`#f1f5f9`,6],[`ECE`,1,`#f1f5f9`,6],[`URG`,1,`#fde68a`,6],[`ACK`,1,`#fde68a`,6],[`PSH`,1,`#fde68a`,6],[`RST`,1,`#fde68a`,6],[`SYN`,1,`#fde68a`,6],[`FIN`,1,`#fde68a`,6],[`Window (16)`,16,`#bbf7d0`]],[[`Checksum (16)`,16,`#fed7aa`],[`Urgent Pointer (16)`,16,`#e2e8f0`]],[[`Options, 0 to 40 bytes: MSS, NOP, window scale, SACK permitted, SACK, timestamps`,32,`#f1f5f9`,10]]],i=`<pre class="out">Source          Destination     Info
192.168.10.10   203.0.113.80    50122 → 80 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 SACK_PERM
203.0.113.80    192.168.10.10   80 → 50122 [SYN, ACK] Seq=0 Ack=1 Win=65160 Len=0 MSS=1460 SACK_PERM
192.168.10.10   203.0.113.80    50122 → 80 [ACK] Seq=1 Ack=1 Win=64240 Len=0
192.168.10.10   203.0.113.80    GET / HTTP/1.1
203.0.113.80    192.168.10.10   80 → 50122 [ACK] Seq=1 Ack=85 Win=65160 Len=0
203.0.113.80    192.168.10.10   HTTP/1.1 200 OK
192.168.10.10   203.0.113.80    50122 → 80 [ACK] Seq=85 Ack=109 Win=64240 Len=0
192.168.10.10   203.0.113.80    50122 → 80 [FIN, ACK] Seq=85 Ack=109 Win=64240 Len=0
203.0.113.80    192.168.10.10   80 → 50122 [FIN, ACK] Seq=109 Ack=86 Win=65160 Len=0
192.168.10.10   203.0.113.80    50122 → 80 [ACK] Seq=86 Ack=110 Win=64240 Len=0</pre>`,a=`<pre class="out">0020  71 50 c3 ca 00 50 <span class="hl">6a 1b 2c 3d</span> 00 00 00 00 <span class="hl">70 02</span>
0030  <span class="hl">fa f0</span> 26 b8 00 00 <span class="hl">02 04 05 b4</span> <span class="hl">01</span> <span class="hl">01</span> <span class="hl">04 02</span>

Sequence Number: 0    (relative sequence number)
Header Length: 28 bytes (7)
Flags: 0x002 (SYN)
Window: 64240
Options: (8 bytes), Maximum segment size: 1460 bytes, No-Operation, No-Operation, SACK permitted</pre>`,o=`<pre class="out">50200 → 22 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 SACK_PERM
22 → 50200 [RST, ACK] Seq=1 Ack=1 Win=0 Len=0

0020  0a 0a 00 16 c4 18 00 00 00 00 1f 2e 3d 4d <span class="hl">50 14</span>
0030  00 00 88 23 00 00</pre>`,s=`<pre class="out">[TCP Dup ACK] 52777 → 445 [ACK] Seq=1 Ack=1461 Win=64240 Len=0
[TCP Dup ACK] 52777 → 445 [ACK] Seq=1 Ack=1461 Win=64240 Len=0
[TCP Dup ACK] 52777 → 445 [ACK] Seq=1 Ack=1461 Win=64240 Len=0
<span class="hl">[TCP Fast Retransmission] 445 → 52777 [PSH, ACK] Seq=1461 Ack=1 Win=65160 Len=1460</span>
52777 → 445 [ACK] Seq=1 Ack=<span class="hl">7301</span> Win=64240 Len=0
<span class="hl">[TCP Zero Window] 52777 → 445 [ACK] Seq=1 Ack=20001 Win=0 Len=0</span>
[TCP Window Update] 52777 → 445 [ACK] Seq=1 Ack=20001 Win=502 Len=0</pre>`,c={id:`tcp-header-in-depth`,h:{en:`The TCP header row by row: flags, options, handshake, teardown, RST, retransmission and windows`,hi:`TCP header row by row: flags, options, handshake, teardown, RST, retransmission aur windows`},body:{en:`
<p>Think of TCP as a long conversation by numbered letters. Every page carries its page number, every reply says "I have everything up to page N, send N+1", and every reply also says how many pages still fit on the reader's desk. A few stamps on the envelope say "hello", "goodbye" or "stop, I did not expect this". In ccna-models you saw the conversation. Here you read the stamps and numbers bit by bit, because they are how a capture proves who is at fault.</p>

`+n(r,`The TCP header: 20 fixed bytes plus options. Yellow boxes are the six classic control flags.`,`TCP header bit ruler`)+`

<h3>The fixed 20 bytes</h3>
<dl class="terms">
<dt>Ports (16 + 16 bits)</dt><dd>Destination is the service (80, 443, 22), source is an ephemeral port chosen by the client (50122 here). A port of 0 is never valid.</dd>
<dt>Sequence number (32 bits)</dt><dd>The number of the first data byte in this segment. The very first value, the ISN, is random; analysers show relative numbers starting at 0. A SYN and a FIN each consume one number.</dd>
<dt>Acknowledgment number (32 bits)</dt><dd>The next byte the sender of this segment expects, valid only when the ACK flag is set. It is cumulative: "everything before this arrived".</dd>
<dt>Data offset (4 bits)</dt><dd>Header length in 32-bit words. 5 = 20 bytes, no options. 6 to 15 means options. The first SYN usually has 6 or more.</dd>
<dt>Window (16 bits)</dt><dd>How many more bytes the sender of this segment can buffer. 0 means "stop sending".</dd>
<dt>Checksum (16 bits)</dt><dd>Covers the TCP header, the data and a pseudo-header (source and destination IP, protocol 6, TCP length). It is mandatory. The Urgent Pointer is only meaningful with URG and is practically unused.</dd>
</dl>

<h3>The flags byte</h3>
<div class="tbl"><table class="cmp">
<tr><th>Flag</th><th>Value</th><th>Meaning</th><th>Combination you see</th></tr>
<tr><td>FIN</td><td>0x01</td><td>I have nothing more to send</td><td>FIN, ACK = 0x011</td></tr>
<tr><td>SYN</td><td>0x02</td><td>synchronise sequence numbers (open)</td><td>SYN = 0x002, SYN, ACK = 0x012</td></tr>
<tr><td>RST</td><td>0x04</td><td>abort: this connection does not exist or is refused</td><td>RST, ACK = 0x014</td></tr>
<tr><td>PSH</td><td>0x08</td><td>deliver this data to the application now</td><td>PSH, ACK = 0x018</td></tr>
<tr><td>ACK</td><td>0x10</td><td>the acknowledgment field is valid</td><td>ACK = 0x010 (all segments after the SYN)</td></tr>
<tr><td>URG, ECE, CWR</td><td>0x20, 0x40, 0x80</td><td>urgent data, ECN echo, window reduced</td><td>rare</td></tr>
</table></div>
<p><b>Abnormal</b> combinations: SYN with FIN, SYN with RST, or no flags at all. No honest stack sends them; they appear in scans and are dropped by firewalls.</p>

<h3>Options and the real SYN bytes</h3>
<p>Options follow the fixed header as kind, length, value triplets. The ones to know: <code>02 04 05 b4</code> MSS 1460; <code>01</code> NOP padding; <code>04 02</code> SACK permitted; <code>03 03 07</code> window scale 7 (multiply the window by 128); <code>08 0a</code> timestamps. The Packet Studio SYN carries only MSS, NOP, NOP and SACK permitted (8 bytes, offset 7); a real Linux or Windows SYN also has timestamps and window scale, which is why its header is 40 bytes (offset 10).</p>
`+a+`
<p>The four highlighted bytes <code>6a 1b 2c 3d</code> are the real, random initial sequence number (1,780,165,693) that the analyser shows as relative 0. The next byte pair <code>70 02</code> is data offset 7 and the flags byte 0x02.</p>
<div class="eg"><p><b>Worked example: how fast can this window go?</b> The advertised window is 0xfaf0 = 64,240 bytes (44 segments of 1460). The sender can have only one window in flight per round trip. At an RTT of 20 ms: 64,240 x 8 = 513,920 bits per 0.020 s = <b>25.7 Mbps</b>, no matter whether the link is 100 Mbps or 10 Gbps. At 100 ms RTT it is 5.1 Mbps. This is why window scaling exists: shift 7 multiplies the window by 128 and fills long, fast links.</p></div>

<h3>Handshake, data and teardown with real sequence numbers</h3>
`+i+`
<p>Follow the arithmetic. The SYN consumes one number, so the SYN-ACK acknowledges 1. The GET carries 84 bytes (Seq 1 to 84), so the server acknowledges <b>85</b>. The response has 108 bytes, so the client acknowledges 109. Each FIN also consumes one number: the client FIN at Seq 85 is acknowledged with 86, the server FIN at Seq 109 with 110. A handshake needs three segments; the polite close needs three or four (the middle two are often merged into one FIN, ACK).</p>

<h3>RST: the abrupt stop</h3>
<p>A reset says "this segment does not belong to any connection I have". The classic case is a SYN to a closed port, answered at once:</p>
`+o+`
<p>The flags byte is <code>14</code> (RST + ACK) and the window is 0 (the simulator labels a zero window on any packet, even an RST). Causes of a RST: nothing listens on the port; a firewall or IPS rejects the connection with a reset instead of dropping it; an application aborts and closes with unread data; a stateful device lost its state after an idle timeout, so the next packet gets reset; a host reboots and the old peer keeps sending. <b>Tip:</b> compare the TTL of the RST with the server's real packets. A different TTL means a middlebox forged it.</p>

<h3>Loss, retransmission and the window in a capture</h3>
<p>The Packet Studio <code>tcperr</code> flow shows a server sending 1460-byte segments; the second is lost. Because TCP acknowledges only the last in-order byte, the client repeats the same acknowledgment:</p>
`+s+`
<p>Three duplicate ACKs for 1461 trigger a <b>fast retransmission</b> of the missing segment without waiting for the timer. One acknowledgment (7301) then covers everything received since. If no duplicate ACKs arrive, the sender waits for the retransmission timeout, which starts around one second and doubles each time (a Linux SYN is retried at about 1, 3, 7 and 15 seconds). A <b>Zero Window</b> means the receiver's buffer is full: the application is slow, not the network, and a Window Update reopens it.</p>

<div class="warn"><p><b>Common mistakes.</b> Reading Seq and Ack as packet counts: they count bytes. Calling every retransmission "network loss": it can be a slow receiver, a PMTUD black hole or a forged RST. Forgetting that analysers show relative numbers while the packet holds large random raw values.</p></div>

<div class="exam"><p><b>Exam traps.</b> The ACK number is the next byte expected. SYN and FIN each use one sequence number. The three-way handshake is SYN, SYN-ACK, ACK. The window is the receiver's flow control; congestion control is the sender's own. Minimum header 20 bytes, maximum 60. RST aborts without the four-step close.</p></div>

<div class="scn"><h4>Connection refused in 20 milliseconds</h4><p>An admin could not SSH to a new server. A capture showed the SYN leaving and a RST, ACK returning almost instantly with the server's normal TTL. A RST that fast proves the server was reachable and the port was closed: <code>sshd</code> had not been started. A silent timeout would have pointed to a firewall drop instead. After starting the service the handshake completed.</p><p><b>Lesson:</b> RST means reachable but refused; silence means dropped. They are different faults with different owners.</p></div>

<div class="iv"><p class="q">"A user says the application is slow. How do you prove from a capture whether it is the network or the server?"</p><p>Look at the TCP behaviour. Retransmissions and duplicate ACKs point to loss on the path. Zero Window from the receiver points to a slow host. A long gap between the request and the first response byte, with a healthy handshake round trip, points to server processing time. Quote the handshake RTT as the network baseline.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>TCP numbers bytes: ACK = next byte expected; SYN and FIN consume one number each.</li>
<li>Flags byte values: SYN 0x02, SYN-ACK 0x12, ACK 0x10, PSH-ACK 0x18, FIN-ACK 0x11, RST-ACK 0x14.</li>
<li>Data offset times 4 is the header length; options (MSS, window scale, SACK, timestamps) live there.</li>
<li>Immediate RST = reachable but refused; silence = dropped; three duplicate ACKs = loss and fast retransmit.</li>
<li>Throughput is capped by window divided by RTT; Zero Window blames the receiver.</li>
</ul></div>
`,hi:`
<p>TCP ko numbered letters ki lambi baatcheet samjho. Har page par uska page number hota hai, har reply kehta hai "mere paas page N tak sab hai, N+1 bhejo", aur har reply yeh bhi batata hai ki padhne wale ki desk par abhi kitne pages aur fit honge. Envelope par kuch stamps kehte hain "hello", "goodbye" ya "ruko, mujhe yeh expect nahi tha". ccna-models mein aapne baatcheet dekhi thi. Yahan hum stamps aur numbers ko bit by bit padhte hain, kyunki capture mein yehi saabit karte hain ki galti kiski hai.</p>

`+n(r,`TCP header: 20 fixed bytes plus options. Peele boxes chhe classic control flags hain.`,`TCP header bit ruler`)+`

<h3>Fixed 20 bytes</h3>
<dl class="terms">
<dt>Ports (16 + 16 bits)</dt><dd>Destination service hai (80, 443, 22), source client ka chuna hua ephemeral port hai (yahan 50122). Port 0 kabhi valid nahi.</dd>
<dt>Sequence number (32 bits)</dt><dd>Is segment ke pehle data byte ka number. Sabse pehli value, ISN, random hoti hai; analysers 0 se shuru hone wale relative numbers dikhate hain. SYN aur FIN har ek ek number kha jaate hain.</dd>
<dt>Acknowledgment number (32 bits)</dt><dd>Is segment ka sender agla kaunsa byte expect karta hai, sirf tab valid jab ACK flag set ho. Yeh cumulative hai: "isse pehle ka sab aa gaya".</dd>
<dt>Data offset (4 bits)</dt><dd>Header length 32-bit words mein. 5 = 20 bytes, koi options nahi. 6 se 15 ka matlab options. Pehle SYN mein aam taur par 6 ya zyada hota hai.</dd>
<dt>Window (16 bits)</dt><dd>Is segment ka sender aur kitne bytes buffer kar sakta hai. 0 ka matlab "bhejna band karo".</dd>
<dt>Checksum (16 bits)</dt><dd>TCP header, data aur pseudo-header (source aur destination IP, protocol 6, TCP length) ko cover karta hai. Yeh mandatory hai. Urgent Pointer sirf URG ke saath matlab rakhta hai aur practically use nahi hota.</dd>
</dl>

<h3>Flags byte</h3>
<div class="tbl"><table class="cmp">
<tr><th>Flag</th><th>Value</th><th>Matlab</th><th>Jo combination dikhta hai</th></tr>
<tr><td>FIN</td><td>0x01</td><td>mere paas bhejne ko aur kuch nahi</td><td>FIN, ACK = 0x011</td></tr>
<tr><td>SYN</td><td>0x02</td><td>sequence numbers sync karo (open)</td><td>SYN = 0x002, SYN, ACK = 0x012</td></tr>
<tr><td>RST</td><td>0x04</td><td>abort: yeh connection exist nahi karta ya refuse hua</td><td>RST, ACK = 0x014</td></tr>
<tr><td>PSH</td><td>0x08</td><td>yeh data abhi application ko do</td><td>PSH, ACK = 0x018</td></tr>
<tr><td>ACK</td><td>0x10</td><td>acknowledgment field valid hai</td><td>ACK = 0x010 (SYN ke baad ke saare segments)</td></tr>
<tr><td>URG, ECE, CWR</td><td>0x20, 0x40, 0x80</td><td>urgent data, ECN echo, window reduced</td><td>kam dikhte hain</td></tr>
</table></div>
<p><b>Abnormal</b> combinations: SYN ke saath FIN, SYN ke saath RST, ya koi flag nahi. Koi imaandaar stack inhe nahi bhejta; yeh scans mein dikhte hain aur firewalls inhe drop karte hain.</p>

<h3>Options aur asli SYN bytes</h3>
<p>Options fixed header ke baad kind, length, value triplets mein aate hain. Jo jaanne hain: <code>02 04 05 b4</code> MSS 1460; <code>01</code> NOP padding; <code>04 02</code> SACK permitted; <code>03 03 07</code> window scale 7 (window ko 128 se multiply karo); <code>08 0a</code> timestamps. Packet Studio ke SYN mein sirf MSS, NOP, NOP aur SACK permitted hain (8 bytes, offset 7); asli Linux ya Windows SYN mein timestamps aur window scale bhi hote hain, isliye uska header 40 bytes (offset 10) hota hai.</p>
`+a+`
<p>Chaar highlighted bytes <code>6a 1b 2c 3d</code> asli, random initial sequence number (1,780,165,693) hain jise analyser relative 0 dikhata hai. Agla byte jodi <code>70 02</code> data offset 7 aur flags byte 0x02 hai.</p>
<div class="eg"><p><b>Worked example: yeh window kitni tez ja sakti hai?</b> Advertised window 0xfaf0 = 64,240 bytes hai (1460 ke 44 segments). Sender ek round trip mein sirf ek window in flight rakh sakta hai. 20 ms RTT par: 64,240 x 8 = 513,920 bits per 0.020 s = <b>25.7 Mbps</b>, chahe link 100 Mbps ho ya 10 Gbps. 100 ms RTT par 5.1 Mbps. Isiliye window scaling hai: shift 7 window ko 128 guna karta hai aur lambe, tez links bhar deta hai.</p></div>

<h3>Handshake, data aur teardown real sequence numbers ke saath</h3>
`+i+`
<p>Arithmetic follow karo. SYN ek number khata hai, isliye SYN-ACK 1 acknowledge karta hai. GET 84 bytes le jaata hai (Seq 1 se 84), isliye server <b>85</b> acknowledge karta hai. Response 108 bytes ka hai, isliye client 109 acknowledge karta hai. Har FIN bhi ek number khata hai: client ka FIN Seq 85 par 86 se acknowledge hota hai, server ka FIN Seq 109 par 110 se. Handshake ko teen segments chahiye; polite close ko teen ya chaar (beech ke do aksar ek FIN, ACK mein mil jaate hain).</p>

<h3>RST: achanak ruk jaana</h3>
<p>Reset kehta hai "yeh segment kisi bhi connection ka nahi jo mere paas hai". Classic case closed port ko SYN hai, jiska jawab turant aata hai:</p>
`+o+`
<p>Flags byte <code>14</code> hai (RST + ACK) aur window 0 hai (simulator kisi bhi packet par zero window label kar deta hai, RST par bhi). RST ke kaaran: port par kuch listen nahi karta; firewall ya IPS drop ki jagah reset se connection reject karta hai; application abort karti hai aur unread data ke saath close karti hai; stateful device idle timeout ke baad state kho deta hai, isliye agle packet par reset aata hai; host reboot hota hai aur purana peer bhejta rehta hai. <b>Tip:</b> RST ka TTL server ke asli packets ke TTL se compare karo. Alag TTL ka matlab middlebox ne forge kiya.</p>

<h3>Capture mein loss, retransmission aur window</h3>
<p>Packet Studio ka <code>tcperr</code> flow ek server dikhata hai jo 1460-byte segments bhej raha hai; doosra kho jaata hai. TCP sirf aakhri in-order byte acknowledge karta hai, isliye client wahi acknowledgment dohrata hai:</p>
`+s+`
<p>1461 ke teen duplicate ACKs timer ka intezaar kiye bina missing segment ka <b>fast retransmission</b> trigger karte hain. Phir ek acknowledgment (7301) tab se aaye sab kuch cover kar leta hai. Agar duplicate ACKs na aayein to sender retransmission timeout ka intezaar karta hai, jo lagbhag ek second se shuru hota hai aur har baar double hota hai (Linux SYN lagbhag 1, 3, 7 aur 15 second par retry hota hai). <b>Zero Window</b> ka matlab receiver ka buffer bhara hai: application slow hai, network nahi, aur Window Update ise dobara kholta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Seq aur Ack ko packet counts padhna: yeh bytes gintay hain. Har retransmission ko "network loss" kehna: yeh slow receiver, PMTUD black hole ya forged RST bhi ho sakta hai. Yeh bhoolna ki analysers relative numbers dikhate hain jabki packet mein bade random raw values hote hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> ACK number agla expected byte hai. SYN aur FIN har ek ek sequence number use karte hain. Three-way handshake SYN, SYN-ACK, ACK hai. Window receiver ka flow control hai; congestion control sender ka apna hai. Minimum header 20 bytes, maximum 60. RST chaar-step close ke bina abort karta hai.</p></div>

<div class="scn"><h4>20 milliseconds mein connection refused</h4><p>Ek admin naye server par SSH nahi kar pa raha tha. Capture mein SYN jaata dikha aur lagbhag turant server ke normal TTL ke saath RST, ACK wapas aaya. Itna tez RST saabit karta hai ki server reachable tha aur port closed tha: <code>sshd</code> start hi nahi hua tha. Khamosh timeout firewall drop ki taraf ishaara karta. Service start karne ke baad handshake poora hua.</p><p><b>Seekh:</b> RST ka matlab reachable lekin refused; khamoshi ka matlab dropped. Yeh alag faults hain jinke owners alag hain.</p></div>

<div class="iv"><p class="q">"User kehta hai application slow hai. Capture se kaise saabit karoge ki network hai ya server?"</p><p>TCP behaviour dekho. Retransmissions aur duplicate ACKs path par loss batate hain. Receiver ka Zero Window slow host batata hai. Request aur pehle response byte ke beech lamba gap, jab handshake round trip healthy ho, server processing time batata hai. Handshake RTT ko network baseline ke taur par quote karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>TCP bytes number karta hai: ACK = agla expected byte; SYN aur FIN ek ek number khate hain.</li>
<li>Flags byte values: SYN 0x02, SYN-ACK 0x12, ACK 0x10, PSH-ACK 0x18, FIN-ACK 0x11, RST-ACK 0x14.</li>
<li>Data offset x 4 header length hai; options (MSS, window scale, SACK, timestamps) wahin rehte hain.</li>
<li>Turant RST = reachable lekin refused; khamoshi = dropped; teen duplicate ACKs = loss aur fast retransmit.</li>
<li>Throughput window / RTT se capped hai; Zero Window receiver ko doshi batata hai.</li>
</ul></div>
`}};export{c as default};