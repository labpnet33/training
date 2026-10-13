var e={id:`protocols`,h:{en:`Protocols and standards; TCP vs UDP`,hi:`Protocols aur standards; TCP vs UDP`},body:{en:`
<p>When you call someone, you both follow unwritten rules. The caller waits for "Hello?", then introduces themselves; if the line breaks, one of you says "Can you hear me?" and repeats the last sentence; at the end you both say goodbye before hanging up. Nobody taught you this in school, yet if one person ignored the rules the conversation would fail. Computers cannot guess, so their rules must be written down precisely. A written set of rules for communication is called a <b>protocol</b>.</p>

<h3>What a protocol defines</h3>
<p>A protocol specifies:</p>
<ul>
<li><b>Format</b>: which fields a message has, in what order and how many bits each (for example the source and destination IP fields in an IP header).</li>
<li><b>Sequence</b>: who speaks first and what the reply must be (for example SYN, SYN-ACK, ACK).</li>
<li><b>Timing</b>: how long to wait for a reply before trying again.</li>
<li><b>Error handling</b>: what to do if a message is lost, damaged or unexpected.</li>
</ul>
<p>Because a protocol is precise, a phone from one company, a router from another and a server from a third can all talk to each other.</p>

<h3>Standards and who writes them</h3>
<p>A <b>standard</b> is a protocol or specification that an official body has published so anyone can build to it. Open standards are the reason networks from different vendors interoperate.</p>
<table class="cmp"><tr><th>Body</th><th>What it standardises</th><th>Examples you will meet</th></tr>
<tr><td><b>IEEE</b></td><td>Layers 1 and 2: cables, Ethernet, Wi-Fi</td><td>802.3 (Ethernet), 802.11 (Wi-Fi), 802.1Q (VLAN tags), 802.3af/at/bt (PoE)</td></tr>
<tr><td><b>IETF</b></td><td>Internet protocols, published as numbered <b>RFCs</b> (Requests for Comments)</td><td>IP, TCP, UDP, DNS, DHCP, OSPF, BGP; RFC 1918 private addresses</td></tr>
<tr><td><b>ISO</b></td><td>International standards in general</td><td>The OSI reference model</td></tr>
<tr><td><b>TIA/EIA</b></td><td>Building cabling</td><td>TIA-568 (T568A/T568B wiring, 100 m channel)</td></tr>
<tr><td><b>ITU-T</b></td><td>Telecommunications</td><td>Many WAN and optical transport standards</td></tr>
<tr><td><b>IANA</b> and the <b>RIRs</b></td><td>Numbers, not protocols</td><td>Port numbers, IP address blocks (APNIC serves the Asia-Pacific region, including India)</td></tr>
</table>
<p>A <b>proprietary</b> protocol belongs to one vendor. For example, Cisco's CDP discovers neighbouring Cisco devices, while the open-standard LLDP (IEEE 802.1AB) does the same across vendors. In mixed networks, engineers prefer open standards.</p>

<h3>Common protocols and their jobs</h3>
<table class="cmp"><tr><th>Protocol</th><th>Layer</th><th>Job</th></tr>
<tr><td>Ethernet / Wi-Fi</td><td>1-2</td><td>Move frames on a wired or wireless link</td></tr>
<tr><td>ARP</td><td>2/3</td><td>Find the MAC address for an IPv4 address on the LAN</td></tr>
<tr><td>IP (IPv4, IPv6)</td><td>3</td><td>Address and route packets end to end</td></tr>
<tr><td>ICMP</td><td>3</td><td>Error and test messages; <code>ping</code> and <code>traceroute</code> use it</td></tr>
<tr><td>TCP / UDP</td><td>4</td><td>Deliver data to the right application (ports), reliably or quickly</td></tr>
<tr><td>DNS</td><td>7</td><td>Names to IP addresses (port 53)</td></tr>
<tr><td>DHCP</td><td>7</td><td>Automatic addressing (UDP 67/68)</td></tr>
<tr><td>HTTP / HTTPS</td><td>7</td><td>Web pages and APIs (TCP 80 / 443)</td></tr>
<tr><td>SSH / Telnet</td><td>7</td><td>Remote command line; SSH is encrypted (22), Telnet is plain text (23)</td></tr>
<tr><td>FTP / SFTP / TFTP</td><td>7</td><td>File transfer (21, SFTP runs over SSH 22, TFTP UDP 69)</td></tr>
<tr><td>SMTP / IMAP / POP3</td><td>7</td><td>Send email (25/587) and read it (143/993, 110/995)</td></tr>
<tr><td>NTP, SNMP, Syslog</td><td>7</td><td>Time sync (UDP 123), monitoring (UDP 161/162), logs (UDP 514)</td></tr>
</table>

<h3>TCP vs UDP: registered post vs a loudspeaker announcement</h3>
<p>Both TCP and UDP work at Layer 4 and both use port numbers. The difference is how much care they take.</p>
<p><b>TCP</b> (Transmission Control Protocol) is like registered post with acknowledgement. It first opens a <b>connection</b> with the three-way handshake. It numbers every byte (<b>sequence numbers</b>), the receiver confirms what arrived (<b>acknowledgements</b>), anything missing is <b>retransmitted</b>, data is put back in order, and a <b>window</b> controls how fast the sender may go (flow control). The price is more overhead (a header of at least 20 bytes) and some delay.</p>
<p><b>UDP</b> (User Datagram Protocol) is like a loudspeaker announcement: it just sends. No connection, no acknowledgement, no retransmission, no ordering, and a tiny 8-byte header. If something is lost, the application decides whether to care. That makes UDP ideal where speed matters more than perfection, or where the application handles reliability itself.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="TCP handshake compared with UDP">
<text x="160" y="20" text-anchor="middle" class="svg-accent" font-size="13">TCP: connect, then send</text>
<text x="480" y="20" text-anchor="middle" class="svg-accent" font-size="13">UDP: just send</text>
<rect x="30" y="30" width="80" height="30" rx="6" fill="#bbf7d0"/><text x="70" y="50" text-anchor="middle" class="svg-ink" font-size="12">Client</text>
<rect x="210" y="30" width="80" height="30" rx="6" fill="#bae6fd"/><text x="250" y="50" text-anchor="middle" class="svg-ink" font-size="12">Server</text>
<line x1="70" y1="60" x2="70" y2="210" stroke="#64748b"/><line x1="250" y1="60" x2="250" y2="210" stroke="#64748b"/>
<line x1="70" y1="80" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><text x="160" y="84" text-anchor="middle" class="svg-ink" font-size="12">SYN</text>
<line x1="250" y1="112" x2="70" y2="132" stroke="#64748b" stroke-width="2"/><text x="160" y="116" text-anchor="middle" class="svg-ink" font-size="12">SYN-ACK</text>
<line x1="70" y1="144" x2="250" y2="164" stroke="#64748b" stroke-width="2"/><text x="160" y="148" text-anchor="middle" class="svg-ink" font-size="12">ACK</text>
<text x="160" y="195" text-anchor="middle" class="svg-muted" font-size="12">then data, each piece acknowledged</text>
<rect x="370" y="30" width="80" height="30" rx="6" fill="#bbf7d0"/><text x="410" y="50" text-anchor="middle" class="svg-ink" font-size="12">Client</text>
<rect x="530" y="30" width="80" height="30" rx="6" fill="#bae6fd"/><text x="570" y="50" text-anchor="middle" class="svg-ink" font-size="12">Server</text>
<line x1="410" y1="60" x2="410" y2="210" stroke="#64748b"/><line x1="570" y1="60" x2="570" y2="210" stroke="#64748b"/>
<line x1="410" y1="80" x2="570" y2="100" stroke="#64748b" stroke-width="2"/><text x="490" y="84" text-anchor="middle" class="svg-ink" font-size="12">DNS query</text>
<line x1="570" y1="112" x2="410" y2="132" stroke="#64748b" stroke-width="2"/><text x="490" y="116" text-anchor="middle" class="svg-ink" font-size="12">DNS answer</text>
<text x="490" y="170" text-anchor="middle" class="svg-muted" font-size="12">no handshake, no ACK</text>
</svg><p class="cap">TCP spends a round trip setting up before any data moves; UDP sends immediately.</p></div>
<table class="cmp"><tr><th></th><th>TCP</th><th>UDP</th></tr>
<tr><td>Connection</td><td>Yes (three-way handshake)</td><td>No</td></tr>
<tr><td>Reliability</td><td>ACKs, retransmission, ordering</td><td>None built in</td></tr>
<tr><td>Header size</td><td>20 bytes or more</td><td>8 bytes</td></tr>
<tr><td>Typical uses</td><td>Web, email, file transfer, SSH</td><td>DNS queries, DHCP, voice and video calls, live streaming, online games, TFTP, SNMP, syslog</td></tr>
</table>
<p>You can see live TCP connections on Windows with <code>netstat -an</code>:</p>
<pre class="out">  Proto  Local Address          Foreign Address        State
  <span class="hl">TCP    192.168.1.23:51514     203.0.113.80:443       ESTABLISHED</span>
  TCP    192.168.1.23:51520     203.0.113.80:443       TIME_WAIT
  UDP    0.0.0.0:5353           *:*</pre>
<p>The first line is Asha's browser (ephemeral port 51514) connected to the web server on port 443. UDP lines have no state, because UDP has no connections.</p>

<div class="eg"><p><b>Worked example.</b> In a video call, one lost voice packet causes a tiny click. If the call used TCP, the lost packet would be retransmitted and everything behind it would wait, so the voice would freeze for a moment, which is much worse. That is why voice uses UDP. Downloading a 2 GB software file is the opposite: one missing byte ruins the file, so it uses TCP.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Saying "UDP is unreliable, so it is bad". UDP is simply lightweight; the application chooses. DNS uses UDP for quick queries and falls back to TCP for large answers and zone transfers.</p></div>

<div class="exam"><p><b>Exam trap.</b> Know which protocols are TCP vs UDP and their ports: DNS 53 (UDP mainly, also TCP), DHCP 67/68 UDP, TFTP 69 UDP, SNMP 161/162 UDP, Syslog 514 UDP, NTP 123 UDP; SSH 22, Telnet 23, SMTP 25, HTTP 80, HTTPS 443 on TCP. IEEE = Layers 1-2 (802.x); IETF = RFCs.</p></div>

<div class="scn"><h4>Choppy calls after a "security hardening"</h4><p>After a firewall change, staff complained that softphone calls connected but the audio was one-way or silent. The engineer compared the new rule set with the old one and found that the admin had allowed only TCP to the voice provider, believing "TCP is safer". Call signalling worked over TCP, but the voice itself (RTP) travels over UDP on a range of ports, and it was now blocked. Allowing the provider's documented UDP port range restored clear audio.</p><p><b>Lesson:</b> know which transport each application needs. Blocking UDP breaks real-time voice and video, DNS and DHCP.</p></div>

<div class="iv"><p class="q">"What is the difference between TCP and UDP? Give examples of applications for each."</p><p>Strong answer: both are Layer 4 and use ports. TCP is connection-oriented: three-way handshake, sequence numbers, acknowledgements, retransmission, ordering and flow control, so it suits web, email, file transfer and SSH. UDP is connectionless with an 8-byte header and no delivery guarantees, so it suits latency-sensitive or simple request/response traffic: voice and video, live streaming, DNS queries, DHCP, SNMP, syslog, TFTP. Mention that applications on UDP can add their own reliability if needed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A protocol defines format, sequence, timing and error handling; a standard is a published protocol anyone can build to.</li>
<li>IEEE = Ethernet/Wi-Fi (802.x); IETF = internet protocols (RFCs); ISO = OSI model; TIA = cabling; IANA/RIRs = numbers.</li>
<li>Know the common protocols with their layer, job and port.</li>
<li>TCP: connection, ACKs, retransmission, ordering, flow control. UDP: fast, 8-byte header, no guarantees.</li>
<li>Voice, video, DNS, DHCP rely on UDP; web, email, file transfer and SSH rely on TCP.</li>
</ul></div>
`,hi:`
<p>Jab aap kisi ko call karte ho, dono unwritten rules follow karte ho. Call karne wala "Hello?" ka intezaar karta hai, phir apna parichay deta hai; agar line toot jaaye, to ek kehta hai "Aawaz aa rahi hai?" aur aakhri line dohraata hai; end mein dono phone rakhne se pehle bye bolte ho. Yeh aapko school mein kisi ne nahi sikhaya, phir bhi agar ek insaan rules ignore kare to baatcheet fail ho jaaye. Computers andaaza nahi laga sakte, isliye unke rules bilkul exact likhne padte hain. Communication ke liye likhe gaye rules ke set ko <b>protocol</b> kehte hain.</p>

<h3>Protocol kya define karta hai</h3>
<p>Protocol yeh specify karta hai:</p>
<ul>
<li><b>Format</b>: message mein kaunse fields hain, kis order mein aur har ek kitne bits ka (jaise IP header mein source aur destination IP fields).</li>
<li><b>Sequence</b>: pehle kaun bolta hai aur reply kya hona chahiye (jaise SYN, SYN-ACK, ACK).</li>
<li><b>Timing</b>: dobara koshish karne se pehle reply ka kitna intezaar karna hai.</li>
<li><b>Error handling</b>: message kho jaaye, kharab ho ya unexpected ho to kya karna hai.</li>
</ul>
<p>Kyunki protocol exact hota hai, ek company ka phone, dusri ka router aur teesri ka server sab aapas mein baat kar sakte hain.</p>

<h3>Standards aur unhe kaun likhta hai</h3>
<p><b>Standard</b> woh protocol ya specification hai jise ek official body ne publish kiya hai taaki koi bhi uske hisaab se bana sake. Open standards hi wajah hain ki alag vendors ke networks aapas mein kaam karte hain.</p>
<table class="cmp"><tr><th>Body</th><th>Kya standardise karti hai</th><th>Examples jo aap dekhoge</th></tr>
<tr><td><b>IEEE</b></td><td>Layers 1 aur 2: cables, Ethernet, Wi-Fi</td><td>802.3 (Ethernet), 802.11 (Wi-Fi), 802.1Q (VLAN tags), 802.3af/at/bt (PoE)</td></tr>
<tr><td><b>IETF</b></td><td>Internet protocols, numbered <b>RFCs</b> (Requests for Comments) ke roop mein publish</td><td>IP, TCP, UDP, DNS, DHCP, OSPF, BGP; RFC 1918 private addresses</td></tr>
<tr><td><b>ISO</b></td><td>General international standards</td><td>OSI reference model</td></tr>
<tr><td><b>TIA/EIA</b></td><td>Building cabling</td><td>TIA-568 (T568A/T568B wiring, 100 m channel)</td></tr>
<tr><td><b>ITU-T</b></td><td>Telecommunications</td><td>Bahut saare WAN aur optical transport standards</td></tr>
<tr><td><b>IANA</b> aur <b>RIRs</b></td><td>Numbers, protocols nahi</td><td>Port numbers, IP address blocks (APNIC Asia-Pacific region serve karta hai, India samet)</td></tr>
</table>
<p><b>Proprietary</b> protocol ek vendor ka hota hai. Jaise, Cisco ka CDP padosi Cisco devices discover karta hai, jabki open-standard LLDP (IEEE 802.1AB) wahi kaam vendors ke paar karta hai. Mixed networks mein engineers open standards pasand karte hain.</p>

<h3>Common protocols aur unke kaam</h3>
<table class="cmp"><tr><th>Protocol</th><th>Layer</th><th>Kaam</th></tr>
<tr><td>Ethernet / Wi-Fi</td><td>1-2</td><td>Wired ya wireless link par frames chalana</td></tr>
<tr><td>ARP</td><td>2/3</td><td>LAN par IPv4 address ka MAC address dhoondhna</td></tr>
<tr><td>IP (IPv4, IPv6)</td><td>3</td><td>Packets ko end to end address aur route karna</td></tr>
<tr><td>ICMP</td><td>3</td><td>Error aur test messages; <code>ping</code> aur <code>traceroute</code> ise use karte hain</td></tr>
<tr><td>TCP / UDP</td><td>4</td><td>Data ko sahi application (ports) tak pahunchana, reliably ya tezi se</td></tr>
<tr><td>DNS</td><td>7</td><td>Naam se IP address (port 53)</td></tr>
<tr><td>DHCP</td><td>7</td><td>Automatic addressing (UDP 67/68)</td></tr>
<tr><td>HTTP / HTTPS</td><td>7</td><td>Web pages aur APIs (TCP 80 / 443)</td></tr>
<tr><td>SSH / Telnet</td><td>7</td><td>Remote command line; SSH encrypted hai (22), Telnet plain text (23)</td></tr>
<tr><td>FTP / SFTP / TFTP</td><td>7</td><td>File transfer (21, SFTP SSH 22 par chalta hai, TFTP UDP 69)</td></tr>
<tr><td>SMTP / IMAP / POP3</td><td>7</td><td>Email bhejna (25/587) aur padhna (143/993, 110/995)</td></tr>
<tr><td>NTP, SNMP, Syslog</td><td>7</td><td>Time sync (UDP 123), monitoring (UDP 161/162), logs (UDP 514)</td></tr>
</table>

<h3>TCP vs UDP: registered post vs loudspeaker announcement</h3>
<p>TCP aur UDP dono Layer 4 par kaam karte hain aur dono port numbers use karte hain. Farak yeh hai ki woh kitni care karte hain.</p>
<p><b>TCP</b> (Transmission Control Protocol) acknowledgement wale registered post jaisa hai. Yeh pehle three-way handshake se <b>connection</b> kholta hai. Yeh har byte ko number karta hai (<b>sequence numbers</b>), receiver confirm karta hai ki kya pahuncha (<b>acknowledgements</b>), jo gayab hai woh <b>retransmit</b> hota hai, data wapas order mein lagaya jaata hai, aur ek <b>window</b> control karti hai ki sender kitna tez bhej sakta hai (flow control). Keemat hai zyada overhead (kam se kam 20 bytes ka header) aur thoda delay.</p>
<p><b>UDP</b> (User Datagram Protocol) loudspeaker announcement jaisa hai: bas bhej deta hai. Na connection, na acknowledgement, na retransmission, na ordering, aur ek chhota 8-byte header. Agar kuch kho jaaye, application tay karti hai ki parwaah karni hai ya nahi. Isse UDP wahan perfect hai jahan speed perfection se zyada zaroori hai, ya jahan application reliability khud handle karti hai.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="TCP handshake aur UDP ki tulna">
<text x="160" y="20" text-anchor="middle" class="svg-accent" font-size="13">TCP: pehle connect, phir bhejo</text>
<text x="480" y="20" text-anchor="middle" class="svg-accent" font-size="13">UDP: bas bhej do</text>
<rect x="30" y="30" width="80" height="30" rx="6" fill="#bbf7d0"/><text x="70" y="50" text-anchor="middle" class="svg-ink" font-size="12">Client</text>
<rect x="210" y="30" width="80" height="30" rx="6" fill="#bae6fd"/><text x="250" y="50" text-anchor="middle" class="svg-ink" font-size="12">Server</text>
<line x1="70" y1="60" x2="70" y2="210" stroke="#64748b"/><line x1="250" y1="60" x2="250" y2="210" stroke="#64748b"/>
<line x1="70" y1="80" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><text x="160" y="84" text-anchor="middle" class="svg-ink" font-size="12">SYN</text>
<line x1="250" y1="112" x2="70" y2="132" stroke="#64748b" stroke-width="2"/><text x="160" y="116" text-anchor="middle" class="svg-ink" font-size="12">SYN-ACK</text>
<line x1="70" y1="144" x2="250" y2="164" stroke="#64748b" stroke-width="2"/><text x="160" y="148" text-anchor="middle" class="svg-ink" font-size="12">ACK</text>
<text x="160" y="195" text-anchor="middle" class="svg-muted" font-size="12">phir data, har tukda acknowledged</text>
<rect x="370" y="30" width="80" height="30" rx="6" fill="#bbf7d0"/><text x="410" y="50" text-anchor="middle" class="svg-ink" font-size="12">Client</text>
<rect x="530" y="30" width="80" height="30" rx="6" fill="#bae6fd"/><text x="570" y="50" text-anchor="middle" class="svg-ink" font-size="12">Server</text>
<line x1="410" y1="60" x2="410" y2="210" stroke="#64748b"/><line x1="570" y1="60" x2="570" y2="210" stroke="#64748b"/>
<line x1="410" y1="80" x2="570" y2="100" stroke="#64748b" stroke-width="2"/><text x="490" y="84" text-anchor="middle" class="svg-ink" font-size="12">DNS query</text>
<line x1="570" y1="112" x2="410" y2="132" stroke="#64748b" stroke-width="2"/><text x="490" y="116" text-anchor="middle" class="svg-ink" font-size="12">DNS answer</text>
<text x="490" y="170" text-anchor="middle" class="svg-muted" font-size="12">na handshake, na ACK</text>
</svg><p class="cap">TCP koi bhi data chalne se pehle setup mein ek round trip lagata hai; UDP turant bhej deta hai.</p></div>
<table class="cmp"><tr><th></th><th>TCP</th><th>UDP</th></tr>
<tr><td>Connection</td><td>Haan (three-way handshake)</td><td>Nahi</td></tr>
<tr><td>Reliability</td><td>ACKs, retransmission, ordering</td><td>Built-in kuch nahi</td></tr>
<tr><td>Header size</td><td>20 bytes ya zyada</td><td>8 bytes</td></tr>
<tr><td>Typical uses</td><td>Web, email, file transfer, SSH</td><td>DNS queries, DHCP, voice aur video calls, live streaming, online games, TFTP, SNMP, syslog</td></tr>
</table>
<p>Windows par live TCP connections aap <code>netstat -an</code> se dekh sakte ho:</p>
<pre class="out">  Proto  Local Address          Foreign Address        State
  <span class="hl">TCP    192.168.1.23:51514     203.0.113.80:443       ESTABLISHED</span>
  TCP    192.168.1.23:51520     203.0.113.80:443       TIME_WAIT
  UDP    0.0.0.0:5353           *:*</pre>
<p>Pehli line Asha ka browser hai (ephemeral port 51514) jo port 443 par web server se juda hai. UDP lines mein koi state nahi hoti, kyunki UDP mein connections hote hi nahi.</p>

<div class="eg"><p><b>Worked example.</b> Video call mein ek khoya hua voice packet ek chhota sa click paida karta hai. Agar call TCP use karti, to khoya packet retransmit hota aur uske peeche sab kuch intezaar karta, to aawaz ek pal ke liye freeze ho jaati, jo kahin bura hai. Isiliye voice UDP use karta hai. 2 GB ki software file download karna ulta hai: ek bhi missing byte file kharab kar deta hai, isliye woh TCP use karti hai.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> Kehna "UDP unreliable hai, isliye bura hai". UDP bas lightweight hai; application chunti hai. DNS jaldi wali queries ke liye UDP use karta hai aur bade answers aur zone transfers ke liye TCP par jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Jaano kaunse protocols TCP vs UDP hain aur unke ports: DNS 53 (mainly UDP, TCP bhi), DHCP 67/68 UDP, TFTP 69 UDP, SNMP 161/162 UDP, Syslog 514 UDP, NTP 123 UDP; SSH 22, Telnet 23, SMTP 25, HTTP 80, HTTPS 443 TCP par. IEEE = Layers 1-2 (802.x); IETF = RFCs.</p></div>

<div class="scn"><h4>"Security hardening" ke baad tooti-footi calls</h4><p>Firewall change ke baad staff ne complain kiya ki softphone calls connect ho rahi thi lekin audio one-way ya silent tha. Engineer ne naye rule set ko purane se compare kiya aur paaya ki admin ne voice provider ke liye sirf TCP allow kiya tha, yeh maan kar ki "TCP zyada safe hai". Call signalling TCP par chal rahi thi, lekin voice khud (RTP) ports ki ek range par UDP se jaati hai, aur woh ab block thi. Provider ki documented UDP port range allow karne se audio saaf ho gaya.</p><p><b>Seekh:</b> jaano kaunsi application ko kaunsa transport chahiye. UDP block karne se real-time voice aur video, DNS aur DHCP toot jaate hain.</p></div>

<div class="iv"><p class="q">"TCP aur UDP mein kya farak hai? Dono ke liye applications ke examples do."</p><p>Strong answer: dono Layer 4 hain aur ports use karte hain. TCP connection-oriented hai: three-way handshake, sequence numbers, acknowledgements, retransmission, ordering aur flow control, isliye yeh web, email, file transfer aur SSH ke liye theek hai. UDP connectionless hai, 8-byte header ke saath aur koi delivery guarantee nahi, isliye yeh latency-sensitive ya simple request/response traffic ke liye theek hai: voice aur video, live streaming, DNS queries, DHCP, SNMP, syslog, TFTP. Mention karo ki UDP par applications zaroorat ho to apni reliability khud jod sakti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Protocol format, sequence, timing aur error handling define karta hai; standard ek published protocol hai jiske hisaab se koi bhi bana sakta hai.</li>
<li>IEEE = Ethernet/Wi-Fi (802.x); IETF = internet protocols (RFCs); ISO = OSI model; TIA = cabling; IANA/RIRs = numbers.</li>
<li>Common protocols ko unki layer, kaam aur port ke saath jaano.</li>
<li>TCP: connection, ACKs, retransmission, ordering, flow control. UDP: fast, 8-byte header, koi guarantee nahi.</li>
<li>Voice, video, DNS, DHCP UDP par chalte hain; web, email, file transfer aur SSH TCP par.</li>
</ul></div>
`}};export{e as default};