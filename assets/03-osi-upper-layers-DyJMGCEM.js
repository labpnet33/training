var e={id:`osi-upper`,h:{en:`OSI in depth, part 2: Transport to Application, with memory aids`,hi:`OSI gehraai mein, part 2: Transport se Application tak, memory aids ke saath`},body:{en:`
<p>The lower layers get data to the right machine. The upper four layers make sure it reaches the right <b>program</b>, in the right <b>order</b>, in a <b>format</b> both sides understand, inside a <b>conversation</b> that starts and ends cleanly. In the courier company, these are the dispatch team, the booking clerk, the packing team and the sales desk.</p>

<h3>Layer 4, Transport: ports, reliability and flow</h3>
<p>Layer 4 carries data between <b>applications</b> on two hosts. It uses <b>port numbers</b> so that many conversations can share one IP address (this is called multiplexing). Its PDU is a <b>segment</b> for TCP and a <b>datagram</b> for UDP.</p>
<p><b>TCP</b> (Transmission Control Protocol, IP protocol 6) is <b>connection-oriented and reliable</b>. Its header (20 bytes minimum) contains source and destination ports, a <b>sequence number</b> (the position of this data in the stream), an <b>acknowledgement number</b> (the next byte expected), <b>flags</b> (SYN, ACK, FIN, RST, PSH, URG), a <b>window size</b> (how much data the receiver can accept before it must acknowledge; this is flow control) and a checksum. Lost segments are detected by missing acknowledgements and <b>retransmitted</b>; out-of-order segments are put back in order.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="TCP three-way handshake and teardown">
<rect x="40" y="10" width="120" height="34" rx="6" fill="#bae6fd"/><text x="100" y="32" text-anchor="middle" class="svg-ink" font-size="13">PC1 client</text>
<rect x="480" y="10" width="120" height="34" rx="6" fill="#bbf7d0"/><text x="540" y="32" text-anchor="middle" class="svg-ink" font-size="13">SRV :443</text>
<line x1="100" y1="44" x2="100" y2="220" stroke="#64748b"/><line x1="540" y1="44" x2="540" y2="220" stroke="#64748b"/>
<line x1="100" y1="64" x2="540" y2="84" stroke="#64748b" stroke-width="2"/><text x="320" y="66" text-anchor="middle" class="svg-accent" font-size="13">1. SYN seq=100</text>
<line x1="540" y1="100" x2="100" y2="120" stroke="#64748b" stroke-width="2"/><text x="320" y="102" text-anchor="middle" class="svg-accent" font-size="13">2. SYN-ACK seq=300 ack=101</text>
<line x1="100" y1="136" x2="540" y2="156" stroke="#64748b" stroke-width="2"/><text x="320" y="138" text-anchor="middle" class="svg-accent" font-size="13">3. ACK ack=301</text>
<text x="320" y="182" text-anchor="middle" class="svg-ink" font-size="13">Data flows, each side acknowledges</text>
<text x="320" y="206" text-anchor="middle" class="svg-muted" font-size="12">Close: FIN, ACK in each direction (or RST to abort)</text>
</svg><p class="cap">The three-way handshake agrees starting sequence numbers before any data is sent. A closed port answers the SYN with RST.</p></div>

<p><b>UDP</b> (User Datagram Protocol, IP protocol 17) is <b>connectionless and best-effort</b>. Its header is only 8 bytes: source port, destination port, length and checksum. No handshake, no sequencing, no retransmission. That makes it ideal for short request-reply exchanges (DNS, DHCP, NTP, SNMP, TFTP, syslog) and real-time voice and video, where a late packet is useless anyway. If an application over UDP needs reliability, the application must add it itself (TFTP numbers its blocks, for example).</p>
<p><b>Devices at Layer 4:</b> stateful firewalls (they track TCP state and ports) and Layer 4 load balancers (they balance by IP and port without reading the content).</p>

<h3>Layer 5, Session: opening, keeping and closing conversations</h3>
<p>Layer 5 <b>establishes, maintains and terminates sessions</b> between applications, and can add <b>checkpoints</b> so a long transfer can resume from the last checkpoint instead of the start. It also controls dialog (who talks when: simplex, half duplex, full duplex). Protocols usually placed here for exam purposes include <b>RPC</b> (remote procedure calls), <b>NetBIOS</b> session service, and the session control parts of <b>SQL</b> database connections and tunnelling protocols such as <b>PPTP</b> and <b>L2TP</b>. In TCP/IP these functions live inside the application, which is why the TCP/IP model has no separate session layer.</p>

<h3>Layer 6, Presentation: format, encryption and compression</h3>
<p>Layer 6 makes sure the receiver can <b>understand</b> the data. Three jobs: <b>translation/encoding</b> (ASCII, Unicode/UTF-8, EBCDIC on mainframes), <b>encryption and decryption</b> (CompTIA places SSL/TLS here), and <b>compression</b>. File and media formats are also treated as presentation-layer items: JPEG, GIF, PNG, MPEG, MP3.</p>

<h3>Layer 7, Application: the door to network services</h3>
<p>Layer 7 is <b>not</b> the application program itself (the browser or mail client). It is the set of protocols that programs use to request network services: <b>HTTP/HTTPS, DNS, DHCP, SMTP, FTP, SSH, Telnet, SNMP, LDAP, SIP, RDP</b>. <b>Devices that work at Layer 7</b> read the content: proxies, Layer 7 load balancers (route by URL or cookie), web application firewalls and next-generation firewalls that identify applications.</p>

<h3>Memory aids you will actually use</h3>
<table class="cmp"><tr><th>Direction</th><th>Mnemonic</th><th>Layers</th></tr>
<tr><td>Bottom-up (1 to 7)</td><td><b>P</b>lease <b>D</b>o <b>N</b>ot <b>T</b>hrow <b>S</b>ausage <b>P</b>izza <b>A</b>way</td><td>Physical, Data link, Network, Transport, Session, Presentation, Application</td></tr>
<tr><td>Top-down (7 to 1)</td><td><b>A</b>ll <b>P</b>eople <b>S</b>eem <b>T</b>o <b>N</b>eed <b>D</b>ata <b>P</b>rocessing</td><td>Application, Presentation, Session, Transport, Network, Data link, Physical</td></tr>
<tr><td>PDUs top-down</td><td><b>D</b>on't <b>S</b>ome <b>P</b>eople <b>F</b>ear <b>B</b>irthdays</td><td>Data (L5-7), Segment (L4), Packet (L3), Frame (L2), Bits (L1)</td></tr>
<tr><td>Addresses</td><td>"<b>M</b>y <b>I</b>ndian <b>P</b>ost" = 2, 3, 4</td><td>MAC at L2, IP at L3, Port at L4</td></tr>
</table>

<div class="eg"><p><b>Worked example: place each item on a layer.</b> A web application firewall blocking SQL injection: L7. A stateful firewall allowing return traffic for TCP 443: L4. JPEG compression of a photo: L6. An RPC call that sets up a session: L5. A router choosing a path by destination IP: L3. A switch filtering by MAC: L2. A fibre patch lead: L1.</p></div>

<h3>Seeing Layer 4 state on a router</h3>
<p>When you SSH from PC1 to R1, R1 keeps a TCP control block for that connection. <code>show tcp brief</code> lists local and remote sockets (IP plus port) and the state.</p>
<pre class="code"><span class="c">! on R1 while an SSH session from PC1 is open</span>
R1# show tcp brief</pre>
<pre class="out">TCB       Local Address               Foreign Address             (state)
<span class="hl">0D3A6F28  10.0.10.1.22                10.0.10.10.49712            ESTAB</span></pre>
<p>R1's side of the socket is port 22 (SSH); PC1 chose ephemeral port 49712. ESTAB means the handshake completed.</p>

<div class="warn"><p><b>Common mistake.</b> Saying "UDP is unreliable so it is bad". UDP is chosen deliberately where speed and low overhead matter more than resending, and many UDP applications add their own reliability. Another mistake: calling the web browser a Layer 7 device. The browser is software that uses Layer 7 protocols.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Connection-oriented, sequencing, acknowledgements, windowing" = TCP. "Connectionless, best-effort, low overhead" = UDP. Encryption, encoding and compression = Layer 6. Session setup, maintenance and teardown = Layer 5. A proxy or content filter = Layer 7. A closed TCP port replies with RST; a closed UDP port triggers ICMP port unreachable.</p></div>

<div class="scn"><h4>The report that died after one hour</h4><p>A finance team's nightly report query ran over TCP 1433 to a SQL server in the data center. Queries that took more than an hour always failed with "connection reset". The database and the client were healthy. The engineer checked the firewall between them: its idle timeout for TCP was 60 minutes, and the long query sent nothing while the server was busy. The firewall deleted the connection from its state table, then reset the next packet. Enabling TCP keepalives on the client (and a longer timeout for that rule) fixed it.</p><p><b>Lesson:</b> a session (L5) depends on every Layer 4 stateful device in the path keeping its state.</p></div>

<div class="iv"><p class="q">"Explain the TCP three-way handshake. What happens if the server port is closed, and how is UDP different?"</p><p>Strong answer: client sends SYN with its initial sequence number, server answers SYN-ACK with its own sequence number and acknowledges the client's, client sends ACK; now data flows with sequence and acknowledgement numbers and window-based flow control. If the port is closed the server answers the SYN with RST; if a firewall silently drops it, the client times out. UDP has no handshake; a closed UDP port usually produces an ICMP port unreachable. Mention the flags and FIN versus RST teardown.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layer 4 uses ports; TCP is reliable (handshake, sequence, ACK, window), UDP is best-effort with an 8-byte header.</li>
<li>Layer 5 sets up, maintains and ends sessions (RPC, NetBIOS, SQL sessions, checkpoints).</li>
<li>Layer 6 handles encoding, encryption (TLS in CompTIA's view) and compression.</li>
<li>Layer 7 is the protocols applications use, not the applications; proxies, WAFs and L7 load balancers work here.</li>
<li>Mnemonics: Please Do Not Throw Sausage Pizza Away; Don't Some People Fear Birthdays for PDUs.</li>
</ul></div>
`,hi:`
<p>Neeche ki layers data ko sahi machine tak pahunchati hain. Upar ki chaar layers pakka karti hain ki data sahi <b>program</b> tak, sahi <b>order</b> mein, aise <b>format</b> mein pahunche jo dono sides samjhein, aur ek aisi <b>baatcheet</b> ke andar jo saaf shuru aur khatam ho. Courier company mein yeh dispatch team, booking clerk, packing team aur sales desk hain.</p>

<h3>Layer 4, Transport: ports, reliability aur flow</h3>
<p>Layer 4 do hosts ki <b>applications</b> ke beech data le jaati hai. Yeh <b>port numbers</b> use karti hai taaki bahut saari baatcheet ek IP address share kar sakein (ise multiplexing kehte hain). Iska PDU TCP ke liye <b>segment</b> aur UDP ke liye <b>datagram</b> hai.</p>
<p><b>TCP</b> (Transmission Control Protocol, IP protocol 6) <b>connection-oriented aur reliable</b> hai. Iske header (kam se kam 20 bytes) mein source aur destination ports, <b>sequence number</b> (stream mein is data ki position), <b>acknowledgement number</b> (agla expected byte), <b>flags</b> (SYN, ACK, FIN, RST, PSH, URG), <b>window size</b> (acknowledge karne se pehle receiver kitna data le sakta hai; yahi flow control hai) aur checksum hote hain. Khoye hue segments missing acknowledgements se pakde jaate hain aur <b>retransmit</b> hote hain; out-of-order segments ko wapas order mein lagaya jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="TCP three-way handshake aur teardown">
<rect x="40" y="10" width="120" height="34" rx="6" fill="#bae6fd"/><text x="100" y="32" text-anchor="middle" class="svg-ink" font-size="13">PC1 client</text>
<rect x="480" y="10" width="120" height="34" rx="6" fill="#bbf7d0"/><text x="540" y="32" text-anchor="middle" class="svg-ink" font-size="13">SRV :443</text>
<line x1="100" y1="44" x2="100" y2="220" stroke="#64748b"/><line x1="540" y1="44" x2="540" y2="220" stroke="#64748b"/>
<line x1="100" y1="64" x2="540" y2="84" stroke="#64748b" stroke-width="2"/><text x="320" y="66" text-anchor="middle" class="svg-accent" font-size="13">1. SYN seq=100</text>
<line x1="540" y1="100" x2="100" y2="120" stroke="#64748b" stroke-width="2"/><text x="320" y="102" text-anchor="middle" class="svg-accent" font-size="13">2. SYN-ACK seq=300 ack=101</text>
<line x1="100" y1="136" x2="540" y2="156" stroke="#64748b" stroke-width="2"/><text x="320" y="138" text-anchor="middle" class="svg-accent" font-size="13">3. ACK ack=301</text>
<text x="320" y="182" text-anchor="middle" class="svg-ink" font-size="13">Data chalta hai, har side acknowledge karti hai</text>
<text x="320" y="206" text-anchor="middle" class="svg-muted" font-size="12">Close: har direction mein FIN, ACK (ya abort ke liye RST)</text>
</svg><p class="cap">Three-way handshake koi bhi data bhejne se pehle starting sequence numbers par sahmati banata hai. Band port SYN ka jawab RST se deta hai.</p></div>

<p><b>UDP</b> (User Datagram Protocol, IP protocol 17) <b>connectionless aur best-effort</b> hai. Iska header sirf 8 bytes ka hai: source port, destination port, length aur checksum. Koi handshake nahi, koi sequencing nahi, koi retransmission nahi. Isliye yeh chhote request-reply exchanges (DNS, DHCP, NTP, SNMP, TFTP, syslog) aur real-time voice aur video ke liye perfect hai, jahan late packet waise bhi bekaar hai. Agar UDP par kisi application ko reliability chahiye, to application ko khud jodni padti hai (jaise TFTP apne blocks number karta hai).</p>
<p><b>Layer 4 ke devices:</b> stateful firewalls (yeh TCP state aur ports track karte hain) aur Layer 4 load balancers (yeh content padhe bina IP aur port se balance karte hain).</p>

<h3>Layer 5, Session: baatcheet kholna, chalana aur band karna</h3>
<p>Layer 5 applications ke beech <b>sessions establish, maintain aur terminate</b> karti hai, aur <b>checkpoints</b> jod sakti hai taaki lamba transfer shuru se nahi balki aakhri checkpoint se resume ho. Yeh dialog bhi control karti hai (kaun kab bolega: simplex, half duplex, full duplex). Exam ke liye yahan rakhe jaane wale protocols mein <b>RPC</b> (remote procedure calls), <b>NetBIOS</b> session service, aur <b>SQL</b> database connections aur <b>PPTP</b> aur <b>L2TP</b> jaise tunnelling protocols ke session control hisse shaamil hain. TCP/IP mein yeh functions application ke andar rehte hain, isiliye TCP/IP model mein alag session layer nahi hai.</p>

<h3>Layer 6, Presentation: format, encryption aur compression</h3>
<p>Layer 6 pakka karti hai ki receiver data ko <b>samajh</b> sake. Teen kaam: <b>translation/encoding</b> (ASCII, Unicode/UTF-8, mainframes par EBCDIC), <b>encryption aur decryption</b> (CompTIA SSL/TLS ko yahan rakhta hai), aur <b>compression</b>. File aur media formats bhi presentation-layer items maane jaate hain: JPEG, GIF, PNG, MPEG, MP3.</p>

<h3>Layer 7, Application: network services ka darwaza</h3>
<p>Layer 7 application program khud <b>nahi</b> hai (browser ya mail client). Yeh protocols ka set hai jinse programs network services maangte hain: <b>HTTP/HTTPS, DNS, DHCP, SMTP, FTP, SSH, Telnet, SNMP, LDAP, SIP, RDP</b>. <b>Layer 7 par kaam karne wale devices</b> content padhte hain: proxies, Layer 7 load balancers (URL ya cookie se route karte hain), web application firewalls aur next-generation firewalls jo applications pehchaante hain.</p>

<h3>Memory aids jo aap sach mein use karoge</h3>
<table class="cmp"><tr><th>Direction</th><th>Mnemonic</th><th>Layers</th></tr>
<tr><td>Bottom-up (1 se 7)</td><td><b>P</b>lease <b>D</b>o <b>N</b>ot <b>T</b>hrow <b>S</b>ausage <b>P</b>izza <b>A</b>way</td><td>Physical, Data link, Network, Transport, Session, Presentation, Application</td></tr>
<tr><td>Top-down (7 se 1)</td><td><b>A</b>ll <b>P</b>eople <b>S</b>eem <b>T</b>o <b>N</b>eed <b>D</b>ata <b>P</b>rocessing</td><td>Application, Presentation, Session, Transport, Network, Data link, Physical</td></tr>
<tr><td>PDUs top-down</td><td><b>D</b>on't <b>S</b>ome <b>P</b>eople <b>F</b>ear <b>B</b>irthdays</td><td>Data (L5-7), Segment (L4), Packet (L3), Frame (L2), Bits (L1)</td></tr>
<tr><td>Addresses</td><td>"<b>M</b>y <b>I</b>ndian <b>P</b>ost" = 2, 3, 4</td><td>L2 par MAC, L3 par IP, L4 par Port</td></tr>
</table>

<div class="eg"><p><b>Worked example: har item ko layer par rakho.</b> SQL injection block karta web application firewall: L7. TCP 443 ke return traffic ko allow karta stateful firewall: L4. Photo ka JPEG compression: L6. Session set up karti RPC call: L5. Destination IP se path chunta router: L3. MAC se filter karta switch: L2. Fibre patch lead: L1.</p></div>

<h3>Router par Layer 4 state dekhna</h3>
<p>Jab aap PC1 se R1 par SSH karte ho, R1 us connection ke liye TCP control block rakhta hai. <code>show tcp brief</code> local aur remote sockets (IP plus port) aur state dikhata hai.</p>
<pre class="code"><span class="c">! R1 par jab PC1 se SSH session khula ho</span>
R1# show tcp brief</pre>
<pre class="out">TCB       Local Address               Foreign Address             (state)
<span class="hl">0D3A6F28  10.0.10.1.22                10.0.10.10.49712            ESTAB</span></pre>
<p>Socket ki R1 wali side port 22 (SSH) hai; PC1 ne ephemeral port 49712 chuna. ESTAB ka matlab handshake poora ho gaya.</p>

<div class="warn"><p><b>Common galti.</b> Kehna "UDP unreliable hai isliye bura hai". UDP jaan-boojhkar wahan chuna jaata hai jahan speed aur kam overhead resend karne se zyada zaroori hai, aur bahut si UDP applications apni reliability khud jodti hain. Ek aur galti: web browser ko Layer 7 device kehna. Browser software hai jo Layer 7 protocols use karta hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Connection-oriented, sequencing, acknowledgements, windowing" = TCP. "Connectionless, best-effort, kam overhead" = UDP. Encryption, encoding aur compression = Layer 6. Session setup, maintenance aur teardown = Layer 5. Proxy ya content filter = Layer 7. Band TCP port RST se reply karta hai; band UDP port ICMP port unreachable trigger karta hai.</p></div>

<div class="scn"><h4>Woh report jo ek ghante baad mar jaati thi</h4><p>Finance team ki raat wali report query TCP 1433 par data center ke SQL server tak chalti thi. Ek ghante se lambi queries hamesha "connection reset" se fail hoti thi. Database aur client dono healthy the. Engineer ne unke beech ka firewall check kiya: uska TCP idle timeout 60 minute tha, aur lambi query server busy rehne tak kuch nahi bhejti thi. Firewall ne connection ko apni state table se hata diya, phir agle packet ko reset kar diya. Client par TCP keepalives enable karne (aur us rule ke liye lamba timeout) se problem theek ho gayi.</p><p><b>Seekh:</b> session (L5) raaste ke har Layer 4 stateful device par depend karta hai ki woh apni state rakhe.</p></div>

<div class="iv"><p class="q">"TCP three-way handshake samjhao. Server port band ho to kya hota hai, aur UDP kaise alag hai?"</p><p>Strong answer: client apne initial sequence number ke saath SYN bhejta hai, server apne sequence number ke saath SYN-ACK bhejta hai aur client ka acknowledge karta hai, client ACK bhejta hai; ab data sequence aur acknowledgement numbers aur window-based flow control ke saath chalta hai. Port band ho to server SYN ka jawab RST se deta hai; agar firewall chupchaap drop kare to client time out hota hai. UDP mein handshake nahi hota; band UDP port aam taur par ICMP port unreachable deta hai. Flags aur FIN vs RST teardown mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layer 4 ports use karti hai; TCP reliable hai (handshake, sequence, ACK, window), UDP 8-byte header ke saath best-effort hai.</li>
<li>Layer 5 sessions set up, maintain aur end karti hai (RPC, NetBIOS, SQL sessions, checkpoints).</li>
<li>Layer 6 encoding, encryption (CompTIA ki nazar mein TLS) aur compression sambhalti hai.</li>
<li>Layer 7 woh protocols hain jo applications use karti hain, applications khud nahi; proxies, WAFs aur L7 load balancers yahan kaam karte hain.</li>
<li>Mnemonics: Please Do Not Throw Sausage Pizza Away; PDUs ke liye Don't Some People Fear Birthdays.</li>
</ul></div>
`}};export{e as default};