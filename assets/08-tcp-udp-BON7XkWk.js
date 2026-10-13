var e={id:`tcp-udp`,h:{en:`TCP vs UDP: handshake, sequence numbers, windowing and ports`,hi:`TCP vs UDP: handshake, sequence numbers, windowing aur ports`},body:{en:`
<p>Two ways to send documents. A <b>registered courier</b>: you phone first to check someone is in, every page is numbered, the receiver signs for what arrived, missing pages are sent again, and at the end both sides agree the delivery is complete. A <b>flyer drop</b>: you push paper through the letterbox and walk on; fast and cheap, no guarantee. <b>TCP</b> is the registered courier. <b>UDP</b> is the flyer drop. Both live at Layer 4 and both use <b>port numbers</b> to hand data to the right application.</p>

<h3>Ports and sockets</h3>
<p>A port is a 16-bit number (0-65535) that identifies an application on a host. Servers listen on <b>well-known ports</b> (0-1023) or registered ports (1024-49151). Clients pick a random <b>ephemeral</b> source port (IANA range 49152-65535; Linux uses 32768-60999 by default). A connection is identified by the <b>socket pair</b>: source IP, source port, destination IP, destination port (plus the protocol). That is how one PC can open ten browser tabs to the same server: each uses a different source port.</p>

<table class="cmp"><tr><th>Port</th><th>Protocol</th><th>Transport</th><th>Port</th><th>Protocol</th><th>Transport</th></tr>
<tr><td>20, 21</td><td>FTP data, control</td><td>TCP</td><td>67, 68</td><td>DHCP server, client</td><td>UDP</td></tr>
<tr><td>22</td><td>SSH, SCP, SFTP</td><td>TCP</td><td>69</td><td>TFTP</td><td>UDP</td></tr>
<tr><td>23</td><td>Telnet</td><td>TCP</td><td>123</td><td>NTP</td><td>UDP</td></tr>
<tr><td>25</td><td>SMTP</td><td>TCP</td><td>161, 162</td><td>SNMP, SNMP traps</td><td>UDP</td></tr>
<tr><td>53</td><td>DNS</td><td>UDP (TCP for large replies)</td><td>514</td><td>Syslog</td><td>UDP</td></tr>
<tr><td>80</td><td>HTTP</td><td>TCP</td><td>110 / 143</td><td>POP3 / IMAP</td><td>TCP</td></tr>
<tr><td>443</td><td>HTTPS</td><td>TCP (UDP for HTTP/3)</td><td>3389</td><td>RDP</td><td>TCP</td></tr>
</table>

<h3>The TCP header</h3>
<p>At least 20 bytes: <b>source port</b> and <b>destination port</b> (16 bits each), <b>sequence number</b> (32 bits, the number of the first data byte in this segment), <b>acknowledgement number</b> (32 bits, the next byte expected from the other side), data offset (header length), <b>flags</b> (SYN, ACK, FIN, RST, PSH, URG, plus ECE and CWR), <b>window</b> (16 bits, how many bytes the sender of this segment can still receive), checksum (covers header and data) and urgent pointer. Options such as <b>MSS</b>, window scale and SACK appear in the SYN.</p>

<h3>The three-way handshake</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="TCP handshake data and close">
<text x="110" y="20" text-anchor="middle" class="svg-ink" font-size="13">PC1 (client)</text><text x="530" y="20" text-anchor="middle" class="svg-ink" font-size="13">SRV :80</text>
<line x1="110" y1="30" x2="110" y2="290" stroke="#64748b" stroke-width="2"/><line x1="530" y1="30" x2="530" y2="290" stroke="#64748b" stroke-width="2"/>
<line x1="110" y1="45" x2="530" y2="65" stroke="#64748b" stroke-width="1.5"/><text x="320" y="47" text-anchor="middle" class="svg-accent" font-size="12">SYN seq=0</text>
<line x1="530" y1="80" x2="110" y2="100" stroke="#64748b" stroke-width="1.5"/><text x="320" y="82" text-anchor="middle" class="svg-accent" font-size="12">SYN, ACK seq=0 ack=1</text>
<line x1="110" y1="115" x2="530" y2="135" stroke="#64748b" stroke-width="1.5"/><text x="320" y="117" text-anchor="middle" class="svg-accent" font-size="12">ACK seq=1 ack=1</text>
<line x1="110" y1="150" x2="530" y2="170" stroke="#64748b" stroke-width="1.5"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="12">GET / (seq=1, 60 bytes)</text>
<line x1="530" y1="185" x2="110" y2="205" stroke="#64748b" stroke-width="1.5"/><text x="320" y="187" text-anchor="middle" class="svg-ink" font-size="12">200 OK (ack=61)</text>
<line x1="110" y1="225" x2="530" y2="240" stroke="#64748b" stroke-width="1.5"/><text x="320" y="226" text-anchor="middle" class="svg-muted" font-size="12">FIN, ACK</text>
<line x1="530" y1="255" x2="110" y2="270" stroke="#64748b" stroke-width="1.5"/><text x="320" y="256" text-anchor="middle" class="svg-muted" font-size="12">FIN, ACK then final ACK</text>
</svg><p class="cap">Relative sequence numbers, as a packet analyser shows them.</p></div>
<ol>
<li><b>SYN</b>: the client picks an initial sequence number (random; analysers show it as relative 0) and offers options such as MSS 1460.</li>
<li><b>SYN-ACK</b>: the server picks its own initial sequence number and acknowledges the client's SYN with <b>ack = client ISN + 1</b>. A SYN consumes one sequence number.</li>
<li><b>ACK</b>: the client acknowledges the server's SYN. Both sides are now ESTABLISHED and data can flow.</li>
</ol>

<h3>Sequence and acknowledgement numbers</h3>
<p>TCP numbers <b>bytes</b>, not segments. If PC1 sends 60 bytes starting at seq 1, SRV answers <b>ack 61</b>: "I have everything up to byte 60, send 61 next". Acknowledgements are <b>cumulative</b>. If a segment is lost, the receiver keeps acknowledging the last in-order byte; after a timeout (or three duplicate ACKs, called fast retransmit) the sender <b>retransmits</b>. The receiver uses sequence numbers to put segments back in order and discard duplicates.</p>

<h3>Windowing and flow control</h3>
<p>Waiting for an ACK after every segment would be very slow. Instead the receiver advertises a <b>window</b>: how many bytes may be in flight unacknowledged. The window <b>slides</b> forward as ACKs arrive. If the receiving application is slow, its buffer fills, the advertised window shrinks, and at <b>window 0</b> the sender must pause. That is <b>flow control</b>: the receiver protects itself. The window-scale option lets windows exceed 64 KB on fast links. (Separately, the sender runs <b>congestion control</b>, such as slow start, to protect the network.)</p>

<h3>Closing: four steps, or a reset</h3>
<p>A graceful close uses <b>FIN</b> in each direction, each acknowledged: FIN, ACK, FIN, ACK (the middle two are often combined into one FIN-ACK segment). The side that closes first waits in TIME_WAIT for a while before reusing the socket. An <b>RST</b> aborts immediately; a server sends RST to a SYN for a port where nothing listens, which the client reports as "connection refused".</p>

<h3>UDP</h3>
<p>The UDP header is just 8 bytes: source port, destination port, length, checksum. No handshake, no sequence numbers, no acknowledgements, no retransmission, no windows. Applications that need speed or can tolerate loss use it: voice and video (a late packet is useless), DNS queries (one question, one answer, retry if needed), DHCP, TFTP, SNMP, syslog, NTP. If an application needs reliability over UDP, it builds its own (as TFTP and QUIC do).</p>

<table class="cmp"><tr><th>Feature</th><th>TCP</th><th>UDP</th></tr>
<tr><td>Connection</td><td>Connection-oriented (handshake)</td><td>Connectionless</td></tr>
<tr><td>Reliability</td><td>ACKs, retransmission, ordering</td><td>None (best effort)</td></tr>
<tr><td>Flow control</td><td>Sliding window</td><td>None</td></tr>
<tr><td>Header size</td><td>20-60 bytes</td><td>8 bytes</td></tr>
<tr><td>Typical uses</td><td>Web, SSH, email, file transfer</td><td>Voice, video, DNS, DHCP, SNMP, syslog</td></tr>
</table>

<div class="eg"><p><b>Worked example: the Lab 1 conversation.</b></p>
<pre class="out">No. Source         Destination    Protocol Info
3   10.1.1.10      203.0.113.80   TCP   <span class="hl">49875 → 80 [SYN] Seq=0 Win=64240 Len=0 MSS=1460</span>
4   203.0.113.80   10.1.1.10      TCP   <span class="hl">80 → 49875 [SYN, ACK] Seq=0 Ack=1 Win=65160 Len=0 MSS=1460</span>
5   10.1.1.10      203.0.113.80   TCP   49875 → 80 [ACK] Seq=1 Ack=1 Win=64240 Len=0
6   10.1.1.10      203.0.113.80   HTTP  GET / HTTP/1.1
7   203.0.113.80   10.1.1.10      TCP   80 → 49875 [ACK] Seq=1 Ack=61 Win=65160 Len=0
8   203.0.113.80   10.1.1.10      HTTP  HTTP/1.1 200 OK  (text/html)</pre>
<p>PC1's request is 60 bytes (seq 1 to 60), so SRV acknowledges 61. The destination port is <b>80</b>; the source 49875 is ephemeral, and the reply simply swaps them. In Lab 2 you will be asked for exactly these: the SYN-ACK flags and the destination port.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Saying UDP is "unreliable so bad": it is the right choice for real-time traffic. Thinking the ACK number is the number of the segment received (it is the <b>next byte expected</b>). Opening only TCP 53 for DNS on a firewall. Confusing flow control (receiver's window) with congestion control (sender's own limit).</p></div>

<div class="exam"><p><b>Exam traps.</b> Handshake order SYN, SYN-ACK, ACK; close uses FIN and ACK (four segments). TCP header 20 bytes minimum, UDP 8 bytes. DHCP 67/68, TFTP 69, SNMP 161/162, syslog 514 and NTP 123 are UDP; SSH 22, Telnet 23, SMTP 25, HTTP 80, HTTPS 443 are TCP; DNS uses both.</p></div>

<div class="scn"><h4>"The network is slow" that was the server</h4><p>Users said file uploads to an internal application crawled. The network team captured on the server's switch port and filtered for the upload. The server repeatedly advertised <b>Win=0</b> ("TCP ZeroWindow"), the clients paused, sent small window probes, then resumed a little. Links were at 3% utilisation with no drops. The application was writing uploads to a full disk and could not empty its receive buffer. After storage was expanded, windows stayed open and uploads ran at full speed.</p><p><b>Lesson:</b> TCP flow control tells you who is slow. A zero window is the receiver saying "stop", which points at the host, not the network.</p></div>

<div class="iv"><p class="q">"Explain the TCP three-way handshake with sequence numbers, and when you would choose UDP."</p><p>Describe SYN (client ISN x), SYN-ACK (server ISN y, ack x+1), ACK (ack y+1), and that the SYN and FIN each consume one sequence number. Explain that ACK numbers are the next byte expected and that the window provides flow control. For UDP, give reasons: low latency, no connection setup, loss-tolerant or request-response apps like voice, DNS and DHCP. Senior candidates mention QUIC (HTTP/3) building reliability on top of UDP 443.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ports pick the application; a socket pair (IPs, ports, protocol) identifies a connection; clients use ephemeral source ports.</li>
<li>TCP: SYN, SYN-ACK, ACK; byte-numbered sequences; cumulative ACK = next byte expected; retransmission; FIN or RST to close.</li>
<li>The advertised window gives flow control; window 0 means the receiver is full.</li>
<li>UDP: 8-byte header, no handshake, no reliability; used for voice, video, DNS, DHCP, SNMP, syslog, NTP, TFTP.</li>
<li>Know the well-known ports and whether each runs over TCP or UDP.</li>
</ul></div>
`,hi:`
<p>Documents bhejne ke do tareeke. <b>Registered courier</b>: aap pehle phone karke check karte ho ki koi ghar par hai, har page par number hota hai, receiver jo pahuncha us par sign karta hai, missing pages dobara bheje jaate hain, aur end mein dono sides maanti hain ki delivery poori hui. <b>Flyer drop</b>: aap letterbox mein kaagaz daalte ho aur aage badh jaate ho; tez aur sasta, koi guarantee nahi. <b>TCP</b> registered courier hai. <b>UDP</b> flyer drop hai. Dono Layer 4 par rehte hain aur dono data ko sahi application tak dene ke liye <b>port numbers</b> use karte hain.</p>

<h3>Ports aur sockets</h3>
<p>Port ek 16-bit number (0-65535) hai jo host par ek application ko identify karta hai. Servers <b>well-known ports</b> (0-1023) ya registered ports (1024-49151) par listen karte hain. Clients ek random <b>ephemeral</b> source port chunte hain (IANA range 49152-65535; Linux default mein 32768-60999 use karta hai). Connection ko <b>socket pair</b> se identify kiya jaata hai: source IP, source port, destination IP, destination port (plus protocol). Isi tarah ek PC same server ke liye das browser tabs khol sakta hai: har ek alag source port use karta hai.</p>

<table class="cmp"><tr><th>Port</th><th>Protocol</th><th>Transport</th><th>Port</th><th>Protocol</th><th>Transport</th></tr>
<tr><td>20, 21</td><td>FTP data, control</td><td>TCP</td><td>67, 68</td><td>DHCP server, client</td><td>UDP</td></tr>
<tr><td>22</td><td>SSH, SCP, SFTP</td><td>TCP</td><td>69</td><td>TFTP</td><td>UDP</td></tr>
<tr><td>23</td><td>Telnet</td><td>TCP</td><td>123</td><td>NTP</td><td>UDP</td></tr>
<tr><td>25</td><td>SMTP</td><td>TCP</td><td>161, 162</td><td>SNMP, SNMP traps</td><td>UDP</td></tr>
<tr><td>53</td><td>DNS</td><td>UDP (bade replies ke liye TCP)</td><td>514</td><td>Syslog</td><td>UDP</td></tr>
<tr><td>80</td><td>HTTP</td><td>TCP</td><td>110 / 143</td><td>POP3 / IMAP</td><td>TCP</td></tr>
<tr><td>443</td><td>HTTPS</td><td>TCP (HTTP/3 ke liye UDP)</td><td>3389</td><td>RDP</td><td>TCP</td></tr>
</table>

<h3>TCP header</h3>
<p>Kam se kam 20 bytes: <b>source port</b> aur <b>destination port</b> (har ek 16 bits), <b>sequence number</b> (32 bits, is segment ke pehle data byte ka number), <b>acknowledgement number</b> (32 bits, dusri side se agla expected byte), data offset (header length), <b>flags</b> (SYN, ACK, FIN, RST, PSH, URG, plus ECE aur CWR), <b>window</b> (16 bits, is segment ka sender abhi kitne bytes aur receive kar sakta hai), checksum (header aur data dono cover karta hai) aur urgent pointer. <b>MSS</b>, window scale aur SACK jaise options SYN mein aate hain.</p>

<h3>Three-way handshake</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="TCP handshake, data aur close">
<text x="110" y="20" text-anchor="middle" class="svg-ink" font-size="13">PC1 (client)</text><text x="530" y="20" text-anchor="middle" class="svg-ink" font-size="13">SRV :80</text>
<line x1="110" y1="30" x2="110" y2="290" stroke="#64748b" stroke-width="2"/><line x1="530" y1="30" x2="530" y2="290" stroke="#64748b" stroke-width="2"/>
<line x1="110" y1="45" x2="530" y2="65" stroke="#64748b" stroke-width="1.5"/><text x="320" y="47" text-anchor="middle" class="svg-accent" font-size="12">SYN seq=0</text>
<line x1="530" y1="80" x2="110" y2="100" stroke="#64748b" stroke-width="1.5"/><text x="320" y="82" text-anchor="middle" class="svg-accent" font-size="12">SYN, ACK seq=0 ack=1</text>
<line x1="110" y1="115" x2="530" y2="135" stroke="#64748b" stroke-width="1.5"/><text x="320" y="117" text-anchor="middle" class="svg-accent" font-size="12">ACK seq=1 ack=1</text>
<line x1="110" y1="150" x2="530" y2="170" stroke="#64748b" stroke-width="1.5"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="12">GET / (seq=1, 60 bytes)</text>
<line x1="530" y1="185" x2="110" y2="205" stroke="#64748b" stroke-width="1.5"/><text x="320" y="187" text-anchor="middle" class="svg-ink" font-size="12">200 OK (ack=61)</text>
<line x1="110" y1="225" x2="530" y2="240" stroke="#64748b" stroke-width="1.5"/><text x="320" y="226" text-anchor="middle" class="svg-muted" font-size="12">FIN, ACK</text>
<line x1="530" y1="255" x2="110" y2="270" stroke="#64748b" stroke-width="1.5"/><text x="320" y="256" text-anchor="middle" class="svg-muted" font-size="12">FIN, ACK phir final ACK</text>
</svg><p class="cap">Relative sequence numbers, jaise packet analyser dikhata hai.</p></div>
<ol>
<li><b>SYN</b>: client ek initial sequence number chunta hai (random; analysers ise relative 0 dikhate hain) aur MSS 1460 jaise options offer karta hai.</li>
<li><b>SYN-ACK</b>: server apna initial sequence number chunta hai aur client ke SYN ko <b>ack = client ISN + 1</b> se acknowledge karta hai. SYN ek sequence number consume karta hai.</li>
<li><b>ACK</b>: client server ke SYN ko acknowledge karta hai. Ab dono sides ESTABLISHED hain aur data chal sakta hai.</li>
</ol>

<h3>Sequence aur acknowledgement numbers</h3>
<p>TCP <b>bytes</b> ko number karta hai, segments ko nahi. Agar PC1 seq 1 se shuru karke 60 bytes bhejta hai, to SRV <b>ack 61</b> se jawab deta hai: "mere paas byte 60 tak sab hai, agla 61 bhejo". Acknowledgements <b>cumulative</b> hote hain. Agar koi segment kho jaaye, to receiver aakhri in-order byte ko acknowledge karta rehta hai; timeout ke baad (ya teen duplicate ACKs ke baad, jise fast retransmit kehte hain) sender <b>retransmit</b> karta hai. Receiver sequence numbers se segments ko wapas order mein lagata hai aur duplicates hata deta hai.</p>

<h3>Windowing aur flow control</h3>
<p>Har segment ke baad ACK ka intezaar bahut slow hoga. Iske bajaye receiver ek <b>window</b> advertise karta hai: kitne bytes bina acknowledge hue raaste mein ho sakte hain. ACKs aate hi window aage <b>slide</b> hoti hai. Agar receive karne wali application slow hai, uska buffer bhar jaata hai, advertised window chhoti hoti hai, aur <b>window 0</b> par sender ko rukna padta hai. Yahi <b>flow control</b> hai: receiver khud ko bachata hai. Window-scale option tez links par windows ko 64 KB se bada hone deta hai. (Alag se, sender network ko bachane ke liye <b>congestion control</b>, jaise slow start, chalata hai.)</p>

<h3>Band karna: chaar steps, ya reset</h3>
<p>Graceful close har direction mein <b>FIN</b> use karta hai, har ek acknowledge hota hai: FIN, ACK, FIN, ACK (beech ke do aksar ek FIN-ACK segment mein mil jaate hain). Jo side pehle band karti hai woh socket dobara use karne se pehle kuch der TIME_WAIT mein intezaar karti hai. <b>RST</b> turant abort karta hai; server us port ke SYN ko RST bhejta hai jahan koi listen nahi kar raha, jise client "connection refused" batata hai.</p>

<h3>UDP</h3>
<p>UDP header sirf 8 bytes ka hai: source port, destination port, length, checksum. Na handshake, na sequence numbers, na acknowledgements, na retransmission, na windows. Jo applications ko speed chahiye ya jo loss jhel sakti hain woh ise use karti hain: voice aur video (late packet bekaar hai), DNS queries (ek sawaal, ek jawab, zaroorat ho to retry), DHCP, TFTP, SNMP, syslog, NTP. Agar kisi application ko UDP par reliability chahiye, to woh apni khud banati hai (jaise TFTP aur QUIC karte hain).</p>

<table class="cmp"><tr><th>Feature</th><th>TCP</th><th>UDP</th></tr>
<tr><td>Connection</td><td>Connection-oriented (handshake)</td><td>Connectionless</td></tr>
<tr><td>Reliability</td><td>ACKs, retransmission, ordering</td><td>Koi nahi (best effort)</td></tr>
<tr><td>Flow control</td><td>Sliding window</td><td>Koi nahi</td></tr>
<tr><td>Header size</td><td>20-60 bytes</td><td>8 bytes</td></tr>
<tr><td>Typical uses</td><td>Web, SSH, email, file transfer</td><td>Voice, video, DNS, DHCP, SNMP, syslog</td></tr>
</table>

<div class="eg"><p><b>Worked example: Lab 1 ki conversation.</b></p>
<pre class="out">No. Source         Destination    Protocol Info
3   10.1.1.10      203.0.113.80   TCP   <span class="hl">49875 → 80 [SYN] Seq=0 Win=64240 Len=0 MSS=1460</span>
4   203.0.113.80   10.1.1.10      TCP   <span class="hl">80 → 49875 [SYN, ACK] Seq=0 Ack=1 Win=65160 Len=0 MSS=1460</span>
5   10.1.1.10      203.0.113.80   TCP   49875 → 80 [ACK] Seq=1 Ack=1 Win=64240 Len=0
6   10.1.1.10      203.0.113.80   HTTP  GET / HTTP/1.1
7   203.0.113.80   10.1.1.10      TCP   80 → 49875 [ACK] Seq=1 Ack=61 Win=65160 Len=0
8   203.0.113.80   10.1.1.10      HTTP  HTTP/1.1 200 OK  (text/html)</pre>
<p>PC1 ki request 60 bytes ki hai (seq 1 se 60), isliye SRV 61 acknowledge karta hai. Destination port <b>80</b> hai; source 49875 ephemeral hai, aur reply mein dono bas swap ho jaate hain. Lab 2 mein aapse bilkul yahi poocha jaayega: SYN-ACK ke flags aur destination port.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Kehna ki UDP "unreliable hai isliye bura hai": real-time traffic ke liye yahi sahi choice hai. Sochna ki ACK number receive hue segment ka number hai (yeh <b>agla expected byte</b> hai). Firewall par DNS ke liye sirf TCP 53 kholna. Flow control (receiver ki window) ko congestion control (sender ki apni limit) se confuse karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Handshake ka order SYN, SYN-ACK, ACK; close FIN aur ACK use karta hai (chaar segments). TCP header minimum 20 bytes, UDP 8 bytes. DHCP 67/68, TFTP 69, SNMP 161/162, syslog 514 aur NTP 123 UDP hain; SSH 22, Telnet 23, SMTP 25, HTTP 80, HTTPS 443 TCP hain; DNS dono use karta hai.</p></div>

<div class="scn"><h4>"Network slow hai" jo asal mein server tha</h4><p>Users ne kaha ki ek internal application par file uploads reng rahe the. Network team ne server ke switch port par capture kiya aur upload ke liye filter lagaya. Server baar baar <b>Win=0</b> ("TCP ZeroWindow") advertise kar raha tha, clients ruk jaate, chhote window probes bhejte, phir thoda aage badhte. Links 3% utilisation par the aur koi drop nahi tha. Application uploads ek bhari hui disk par likh rahi thi aur apna receive buffer khaali nahi kar pa rahi thi. Storage badhane ke baad windows khuli rahi aur uploads full speed par chale.</p><p><b>Seekh:</b> TCP flow control batata hai ki slow kaun hai. Zero window receiver ka "ruko" kehna hai, jo host ki taraf ishaara karta hai, network ki taraf nahi.</p></div>

<div class="iv"><p class="q">"Sequence numbers ke saath TCP three-way handshake samjhao, aur aap UDP kab chunoge."</p><p>SYN (client ISN x), SYN-ACK (server ISN y, ack x+1), ACK (ack y+1) describe karo, aur ki SYN aur FIN dono ek ek sequence number consume karte hain. Samjhao ki ACK numbers agla expected byte hain aur window flow control deti hai. UDP ke liye wajah do: kam latency, connection setup nahi, loss-tolerant ya request-response apps jaise voice, DNS aur DHCP. Senior candidates QUIC (HTTP/3) mention karte hain jo UDP 443 ke upar reliability banata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ports application chunte hain; socket pair (IPs, ports, protocol) connection identify karta hai; clients ephemeral source ports use karte hain.</li>
<li>TCP: SYN, SYN-ACK, ACK; byte-numbered sequences; cumulative ACK = agla expected byte; retransmission; band karne ke liye FIN ya RST.</li>
<li>Advertised window flow control deti hai; window 0 matlab receiver bhar gaya.</li>
<li>UDP: 8-byte header, na handshake, na reliability; voice, video, DNS, DHCP, SNMP, syslog, NTP, TFTP ke liye.</li>
<li>Well-known ports yaad rakho aur ki har ek TCP par chalta hai ya UDP par.</li>
</ul></div>
`}};export{e as default};