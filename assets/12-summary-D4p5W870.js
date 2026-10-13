var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with a parcel travelling from Delhi to Bengaluru: a note in an envelope, in a box with a waybill, loaded onto a different truck at every hub. You can now replace every part of that story with the real thing: data, TCP ports, an IP header with TTL, an Ethernet frame with MAC addresses that change at every router. This chapter pulls it all together for revision before the exam and before your next interview.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Module summary map">
<rect x="20" y="20" width="190" height="50" rx="8" fill="#fde68a"/><text x="115" y="42" text-anchor="middle" class="svg-ink" font-size="13">Models</text><text x="115" y="60" text-anchor="middle" class="svg-muted" font-size="12">OSI 7, TCP/IP 4</text>
<rect x="225" y="20" width="190" height="50" rx="8" fill="#fed7aa"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Headers</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">Ethernet, IPv4, TCP, UDP</text>
<rect x="430" y="20" width="190" height="50" rx="8" fill="#ddd6fe"/><text x="525" y="42" text-anchor="middle" class="svg-ink" font-size="13">Hop by hop</text><text x="525" y="60" text-anchor="middle" class="svg-muted" font-size="12">MAC changes, IP stays</text>
<rect x="20" y="90" width="190" height="50" rx="8" fill="#bae6fd"/><text x="115" y="112" text-anchor="middle" class="svg-ink" font-size="13">Components</text><text x="115" y="130" text-anchor="middle" class="svg-muted" font-size="12">router, switch, NGFW, AP, PoE</text>
<rect x="225" y="90" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="13">Topologies</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">2/3-tier, spine-leaf, WAN</text>
<rect x="430" y="90" width="190" height="50" rx="8" fill="#e2e8f0"/><text x="525" y="112" text-anchor="middle" class="svg-ink" font-size="13">Captures</text><text x="525" y="130" text-anchor="middle" class="svg-muted" font-size="12">what is missing?</text>
<text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="13">Next: ccna-interfaces (cabling, speed, duplex) and ccna-ipv4 (subnetting)</text>
</svg><p class="cap">The six themes of this module.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Name the seven OSI layers in order, the PDU at each, and a device and protocol at each.</li>
<li>Map OSI to the four-layer TCP/IP model (and the five-layer version).</li>
<li>Describe encapsulation and decapsulation of a web request, including the type-field chain.</li>
<li>Draw the Ethernet II frame with sizes and explain what a switch does with each field.</li>
<li>Explain every field of the IPv4 header, especially TTL, Protocol and the header checksum.</li>
<li>State exactly what changes at a switch and at a router, and prove it with <code>show ip arp</code> and a capture.</li>
<li>Draw the TCP three-way handshake and close with sequence and acknowledgement numbers; explain windowing and flow control.</li>
<li>Compare TCP and UDP and list which well-known ports use which.</li>
<li>Explain the role of routers, L2 and L3 switches, NGFW and IPS, APs, WLCs, endpoints, servers and PoE.</li>
<li>Describe 2-tier, 3-tier, spine-leaf, WAN, SOHO, and on-prem versus cloud.</li>
<li>Troubleshoot "request arrives, reply never leaves" with a capture and fix it (Lab 2).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>PDU</dt><dd>Protocol data unit: data, segment/datagram, packet, frame, bits.</dd>
<dt>Encapsulation</dt><dd>Each layer adding its header (and Ethernet's trailer) around the data from above.</dd>
<dt>EtherType</dt><dd>Ethernet field naming the payload: 0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6.</dd>
<dt>FCS</dt><dd>4-byte CRC trailer; failed frames are discarded.</dd>
<dt>TTL</dt><dd>IP hop counter; decremented by every router; 0 means drop and ICMP Time Exceeded.</dd>
<dt>ARP</dt><dd>Resolves an IPv4 address to a MAC on the local segment; request broadcast, reply unicast.</dd>
<dt>MTU / MSS</dt><dd>Largest IP packet on a link (1500 on Ethernet) / largest TCP data per segment (1460).</dd>
<dt>Socket</dt><dd>IP address plus port; a connection is a pair of sockets.</dd>
<dt>Window</dt><dd>Bytes a receiver will accept before acknowledging; 0 pauses the sender.</dd>
<dt>PSE / PD</dt><dd>PoE power source (switch) / powered device (AP, phone, camera).</dd>
<dt>ECMP</dt><dd>Equal-cost multipath: load sharing across parallel routed links, the basis of spine-leaf.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>PDUs</td><td>L4 segment (UDP datagram), L3 packet, L2 frame, L1 bits</td></tr>
<tr><td>Devices</td><td>Hub L1, switch L2, router L3; routers split broadcast domains</td></tr>
<tr><td>Ethernet</td><td>14-byte header + 4-byte FCS; 64-1518 bytes; 802.1Q adds 4</td></tr>
<tr><td>IPv4</td><td>20-byte header; Protocol 1 ICMP, 6 TCP, 17 UDP, 89 OSPF</td></tr>
<tr><td>Per router hop</td><td>MACs rewritten, TTL -1, IP checksum and FCS recalculated, IPs unchanged (no NAT)</td></tr>
<tr><td>TCP</td><td>SYN, SYN-ACK, ACK; ACK = next byte expected; FIN/ACK close; RST abort</td></tr>
<tr><td>UDP</td><td>8-byte header, no handshake, no retransmission</td></tr>
<tr><td>Ports</td><td>20/21 FTP, 22 SSH, 23 Telnet, 25 SMTP, 53 DNS, 67/68 DHCP, 69 TFTP, 80 HTTP, 123 NTP, 161/162 SNMP, 443 HTTPS, 514 syslog</td></tr>
<tr><td>PoE</td><td>af 15.4 W, at 30 W, bt 60/90 W</td></tr>
<tr><td>Spine-leaf</td><td>Every leaf to every spine; no leaf-leaf links</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Lab PCs</span>
PC1&gt; ip 10.1.1.10/24 10.1.1.1
PC1&gt; show ip
PC1&gt; h&#116;tp 203.0.113.80
PC1&gt; ping 203.0.113.80
PC1&gt; trace 203.0.113.80
<span class="c">! Cisco IOS</span>
R1# show interfaces GigabitEthernet0/0 | include address
R1# show ip arp
R1# show ip route
SW1# show mac address-table dynamic
SW1# show power inline</pre>
<p>Capture filters to remember: <code>arp</code>, <code>icmp</code>, <code>ip.addr == x</code>, <code>tcp.port == 80</code>, <code>tcp.flags.syn == 1</code>, <code>tcp.flags.reset == 1</code>, <code>udp.port == 53</code>.</p>

<div class="eg"><p><b>Worked example: one-minute revision drill.</b> PC1 10.1.1.10 opens port 80 on 203.0.113.80 through SW1 and R1. On the PC1-SW1 link: source MAC PC1, destination MAC R1 Gi0/0, EtherType 0x0800, TTL 64, Protocol 6, destination port 80. On the R1-SRV link: source MAC R1 Gi0/1, destination MAC SRV, TTL 63, new checksum, same IPs and ports. If you can recite that without looking, you own this module.</p></div>

<div class="warn"><p><b>Final mistakes to avoid.</b> Swapping packet and frame. Saying the server's MAC is used across a router. Saying DNS is TCP only. Forgetting the IP checksum is recalculated at every hop. Calling an IDS a blocking device.</p></div>

<div class="exam"><p><b>Blueprint coverage.</b> This module covers CCNA 200-301 v1.1 topics 1.1 (network components), 1.2 (topology architectures) and 1.5 (TCP versus UDP), plus the OSI/TCP/IP and encapsulation fundamentals every other topic assumes. The same material sits in the Network Infrastructure and Connectivity area of the v2.0 blueprint.</p></div>

<div class="scn"><h4>The interview whiteboard</h4><p>A fresher interviewing at a managed-services company was asked: "I type a website address and press Enter. Tell me everything that happens." She drew the path: DNS query over UDP 53, ARP for the gateway, TCP handshake to port 443, the IP header with TTL, the frame rewritten at each router, the SYN-ACK and data coming back, and the FIN close. When the interviewer asked "what if the SYN gets no reply?", she explained capturing on both sides and checking the server's return route. She got the offer; the feedback said "understands the network end to end, not just commands".</p><p><b>Lesson:</b> the "what happens when" question is the whole of this module in one answer. Practise telling it layer by layer.</p></div>

<div class="iv"><p class="q">"What happens, at every layer, when you open a web page?"</p><p>Structure it: name resolution (DNS, UDP 53), the host's routing decision and ARP for the gateway, the TCP handshake (SYN, SYN-ACK, ACK) to 80 or 443, TLS for HTTPS, the HTTP request and response, per-hop behaviour (MACs rewritten, TTL decremented, IPs unchanged unless NAT), and the close. Mention what you would check if a step fails. Keep it under three minutes and offer to go deeper on any layer.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layers give a vocabulary and a troubleshooting method; know OSI and TCP/IP and how they map.</li>
<li>Know Ethernet, IPv4, TCP and UDP headers well enough to read them in a capture.</li>
<li>Per router hop: new MACs, TTL minus one, new checksums, same IPs and ports (no NAT).</li>
<li>TCP is reliable and windowed; UDP is lean; memorise the well-known ports and their transport.</li>
<li>Know the role of each component and each topology design, then practise the "what happens when" story.</li>
</ul></div>
`,hi:`
<p>Aapne Delhi se Bengaluru jaate parcel se shuru kiya tha: envelope mein ek note, waybill wale box mein, har hub par alag truck mein load. Ab aap us kahani ke har hisse ko asli cheez se badal sakte ho: data, TCP ports, TTL wala IP header, aur Ethernet frame jiske MAC addresses har router par badalte hain. Yeh chapter exam aur agle interview se pehle revision ke liye sab kuch ek saath laata hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Module summary map">
<rect x="20" y="20" width="190" height="50" rx="8" fill="#fde68a"/><text x="115" y="42" text-anchor="middle" class="svg-ink" font-size="13">Models</text><text x="115" y="60" text-anchor="middle" class="svg-muted" font-size="12">OSI 7, TCP/IP 4</text>
<rect x="225" y="20" width="190" height="50" rx="8" fill="#fed7aa"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Headers</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">Ethernet, IPv4, TCP, UDP</text>
<rect x="430" y="20" width="190" height="50" rx="8" fill="#ddd6fe"/><text x="525" y="42" text-anchor="middle" class="svg-ink" font-size="13">Hop by hop</text><text x="525" y="60" text-anchor="middle" class="svg-muted" font-size="12">MAC badalta, IP wahi</text>
<rect x="20" y="90" width="190" height="50" rx="8" fill="#bae6fd"/><text x="115" y="112" text-anchor="middle" class="svg-ink" font-size="13">Components</text><text x="115" y="130" text-anchor="middle" class="svg-muted" font-size="12">router, switch, NGFW, AP, PoE</text>
<rect x="225" y="90" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="13">Topologies</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">2/3-tier, spine-leaf, WAN</text>
<rect x="430" y="90" width="190" height="50" rx="8" fill="#e2e8f0"/><text x="525" y="112" text-anchor="middle" class="svg-ink" font-size="13">Captures</text><text x="525" y="130" text-anchor="middle" class="svg-muted" font-size="12">kya missing hai?</text>
<text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="13">Aage: ccna-interfaces (cabling, speed, duplex) aur ccna-ipv4 (subnetting)</text>
</svg><p class="cap">Is module ke chhe themes.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Saat OSI layers order mein, har ek ka PDU, aur har ek par ek device aur protocol batao.</li>
<li>OSI ko four-layer TCP/IP model (aur five-layer version) par map karo.</li>
<li>Web request ka encapsulation aur decapsulation describe karo, type-field chain ke saath.</li>
<li>Ethernet II frame sizes ke saath draw karo aur samjhao ki switch har field ke saath kya karta hai.</li>
<li>IPv4 header ka har field samjhao, khaas kar TTL, Protocol aur header checksum.</li>
<li>Exactly batao ki switch aur router par kya badalta hai, aur <code>show ip arp</code> aur capture se prove karo.</li>
<li>Sequence aur acknowledgement numbers ke saath TCP three-way handshake aur close draw karo; windowing aur flow control samjhao.</li>
<li>TCP aur UDP compare karo aur batao kaunse well-known ports kaunsa use karte hain.</li>
<li>Routers, L2 aur L3 switches, NGFW aur IPS, APs, WLCs, endpoints, servers aur PoE ka role samjhao.</li>
<li>2-tier, 3-tier, spine-leaf, WAN, SOHO, aur on-prem vs cloud describe karo.</li>
<li>"Request pahunchti hai, reply kabhi nahi nikalta" ko capture se troubleshoot karke fix karo (Lab 2).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>PDU</dt><dd>Protocol data unit: data, segment/datagram, packet, frame, bits.</dd>
<dt>Encapsulation</dt><dd>Har layer ka upar se aaye data ke chaaron taraf apna header (aur Ethernet ka trailer) jodna.</dd>
<dt>EtherType</dt><dd>Ethernet field jo payload ka naam batata hai: 0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6.</dd>
<dt>FCS</dt><dd>4-byte CRC trailer; fail hone wale frames discard hote hain.</dd>
<dt>TTL</dt><dd>IP hop counter; har router ise ghatata hai; 0 matlab drop aur ICMP Time Exceeded.</dd>
<dt>ARP</dt><dd>Local segment par IPv4 address ko MAC mein resolve karta hai; request broadcast, reply unicast.</dd>
<dt>MTU / MSS</dt><dd>Link par sabse bada IP packet (Ethernet par 1500) / har segment mein sabse zyada TCP data (1460).</dd>
<dt>Socket</dt><dd>IP address plus port; connection sockets ka ek pair hai.</dd>
<dt>Window</dt><dd>Acknowledge karne se pehle receiver kitne bytes lega; 0 sender ko rok deta hai.</dd>
<dt>PSE / PD</dt><dd>PoE power source (switch) / powered device (AP, phone, camera).</dd>
<dt>ECMP</dt><dd>Equal-cost multipath: parallel routed links par load sharing, spine-leaf ka aadhaar.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>PDUs</td><td>L4 segment (UDP datagram), L3 packet, L2 frame, L1 bits</td></tr>
<tr><td>Devices</td><td>Hub L1, switch L2, router L3; routers broadcast domains alag karte hain</td></tr>
<tr><td>Ethernet</td><td>14-byte header + 4-byte FCS; 64-1518 bytes; 802.1Q 4 jodta hai</td></tr>
<tr><td>IPv4</td><td>20-byte header; Protocol 1 ICMP, 6 TCP, 17 UDP, 89 OSPF</td></tr>
<tr><td>Har router hop</td><td>MACs dobara likhe, TTL -1, IP checksum aur FCS dobara nikale, IPs same (NAT nahi)</td></tr>
<tr><td>TCP</td><td>SYN, SYN-ACK, ACK; ACK = agla expected byte; FIN/ACK close; RST abort</td></tr>
<tr><td>UDP</td><td>8-byte header, na handshake, na retransmission</td></tr>
<tr><td>Ports</td><td>20/21 FTP, 22 SSH, 23 Telnet, 25 SMTP, 53 DNS, 67/68 DHCP, 69 TFTP, 80 HTTP, 123 NTP, 161/162 SNMP, 443 HTTPS, 514 syslog</td></tr>
<tr><td>PoE</td><td>af 15.4 W, at 30 W, bt 60/90 W</td></tr>
<tr><td>Spine-leaf</td><td>Har leaf har spine se; leaf-leaf links nahi</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Lab PCs</span>
PC1&gt; ip 10.1.1.10/24 10.1.1.1
PC1&gt; show ip
PC1&gt; h&#116;tp 203.0.113.80
PC1&gt; ping 203.0.113.80
PC1&gt; trace 203.0.113.80
<span class="c">! Cisco IOS</span>
R1# show interfaces GigabitEthernet0/0 | include address
R1# show ip arp
R1# show ip route
SW1# show mac address-table dynamic
SW1# show power inline</pre>
<p>Yaad rakhne wale capture filters: <code>arp</code>, <code>icmp</code>, <code>ip.addr == x</code>, <code>tcp.port == 80</code>, <code>tcp.flags.syn == 1</code>, <code>tcp.flags.reset == 1</code>, <code>udp.port == 53</code>.</p>

<div class="eg"><p><b>Worked example: ek minute ki revision drill.</b> PC1 10.1.1.10 SW1 aur R1 ke through 203.0.113.80 par port 80 kholta hai. PC1-SW1 link par: source MAC PC1, destination MAC R1 Gi0/0, EtherType 0x0800, TTL 64, Protocol 6, destination port 80. R1-SRV link par: source MAC R1 Gi0/1, destination MAC SRV, TTL 63, naya checksum, same IPs aur ports. Agar aap yeh bina dekhe bol sakte ho, to yeh module aapka hai.</p></div>

<div class="warn"><p><b>Aakhri galtiyan jinse bachna hai.</b> Packet aur frame swap karna. Kehna ki router ke paar server ka MAC use hota hai. Kehna ki DNS sirf TCP hai. Bhoolna ki IP checksum har hop par dobara nikalta hai. IDS ko blocking device kehna.</p></div>

<div class="exam"><p><b>Blueprint coverage.</b> Yeh module CCNA 200-301 v1.1 ke topics 1.1 (network components), 1.2 (topology architectures) aur 1.5 (TCP vs UDP) cover karta hai, plus OSI/TCP/IP aur encapsulation ke woh fundamentals jo baaki har topic maan kar chalta hai. Yahi material v2.0 blueprint ke Network Infrastructure and Connectivity area mein hai.</p></div>

<div class="scn"><h4>Interview ka whiteboard</h4><p>Ek managed-services company mein interview de rahi fresher se poocha gaya: "Main website address type karke Enter dabata hoon. Mujhe sab kuch batao jo hota hai." Usne path draw kiya: UDP 53 par DNS query, gateway ke liye ARP, port 443 tak TCP handshake, TTL wala IP header, har router par dobara likha frame, wapas aate SYN-ACK aur data, aur FIN close. Jab interviewer ne poocha "agar SYN ka koi reply na aaye to?", usne dono sides par capture karna aur server ka return route check karna samjhaya. Use offer mila; feedback mein likha tha "network ko end to end samajhti hai, sirf commands nahi".</p><p><b>Seekh:</b> "kya hota hai jab" wala sawaal ek jawab mein poora module hai. Ise layer by layer sunane ki practice karo.</p></div>

<div class="iv"><p class="q">"Web page kholne par har layer par kya hota hai?"</p><p>Ise structure karo: name resolution (DNS, UDP 53), host ka routing decision aur gateway ke liye ARP, 80 ya 443 tak TCP handshake (SYN, SYN-ACK, ACK), HTTPS ke liye TLS, HTTP request aur response, per-hop behaviour (MACs dobara likhe, TTL kam, NAT na ho to IPs same), aur close. Batao ki koi step fail ho to aap kya check karoge. Teen minute ke andar rakho aur kisi bhi layer par aur gehrai mein jaane ka offer do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layers vocabulary aur troubleshooting method dete hain; OSI aur TCP/IP aur unki mapping jaano.</li>
<li>Ethernet, IPv4, TCP aur UDP headers itne achhe se jaano ki capture mein padh sako.</li>
<li>Har router hop: naye MACs, TTL minus one, naye checksums, same IPs aur ports (NAT nahi).</li>
<li>TCP reliable aur windowed hai; UDP halka hai; well-known ports aur unka transport yaad karo.</li>
<li>Har component aur har topology design ka role jaano, phir "kya hota hai jab" wali kahani ki practice karo.</li>
</ul></div>
`}};export{e as default};