var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>This chapter is your revision sheet for N10-009 objectives 1.1, 1.2, 1.4, 1.5 and 1.6. Read it the night before the exam, and use the can-do list to find anything you should revisit. Next in the track: <b>IPv4 addressing and subnetting</b>, then IPv6, then cloud and SDN concepts.</p>

<h3>Can-do checklist</h3>
<ul>
<li>I can name all seven OSI layers in both directions, with the PDU, typical protocols and devices at each.</li>
<li>I can list the main fields of an Ethernet frame, an IPv4 header, a TCP header and a UDP header.</li>
<li>I can explain, hop by hop, what changes when a packet crosses a router (MACs, TTL, checksum) and what does not (IPs).</li>
<li>I can prove it in the lab: ttl=63 on PC1, the gateway MAC in <code>arp</code>, the C route out Gi0/1 on R1.</li>
<li>I can calculate MSS from MTU and explain why tunnels need <code>ip tcp adjust-mss</code>.</li>
<li>I can choose between router, switch, firewall types, IDS, IPS, load balancer, forward and reverse proxy, NAS, SAN, AP and WLC.</li>
<li>I can explain CDN, VPN types (site-to-site, client-to-site, clientless, full and split tunnel), QoS steps and both meanings of TTL.</li>
<li>I can recite all twenty N10-009 ports with TCP/UDP and the insecure-to-secure pairs.</li>
<li>I can write firewall rules for DNS, NTP, SNMP, syslog and an IPsec VPN, including protocol-based rules for ESP and GRE.</li>
<li>I can pick copper, multimode or single-mode, the right optic (SR/LR/ER, SFP/QSFP) and the right connector for a link.</li>
<li>I can compare mesh, hybrid, star/hub-and-spoke, point-to-point, three-tier, collapsed core and spine-leaf, and relate them to north-south and east-west traffic.</li>
<li>I can troubleshoot by layer and read "refused", "timeout", "not reachable" and "administratively down" correctly.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="OSI summary">
<rect x="10" y="8" width="620" height="30" rx="6" fill="#fde68a"/><text x="20" y="28" class="svg-ink" font-size="13">7 Application: data, HTTP DNS SMTP SSH, proxy, WAF, L7 LB</text>
<rect x="10" y="42" width="620" height="30" rx="6" fill="#fde68a"/><text x="20" y="62" class="svg-ink" font-size="13">6 Presentation: data, encoding, TLS encryption, compression</text>
<rect x="10" y="76" width="620" height="30" rx="6" fill="#fde68a"/><text x="20" y="96" class="svg-ink" font-size="13">5 Session: data, set up and tear down sessions, RPC, NetBIOS</text>
<rect x="10" y="110" width="620" height="30" rx="6" fill="#ddd6fe"/><text x="20" y="130" class="svg-ink" font-size="13">4 Transport: segment or datagram, TCP UDP ports, stateful firewall</text>
<rect x="10" y="144" width="620" height="30" rx="6" fill="#bbf7d0"/><text x="20" y="164" class="svg-ink" font-size="13">3 Network: packet, IP, ICMP, TTL, router, L3 switch</text>
<rect x="10" y="178" width="620" height="30" rx="6" fill="#bae6fd"/><text x="20" y="198" class="svg-ink" font-size="13">2 Data link: frame, MAC, 802.1Q, FCS, switch, AP, NIC</text>
<rect x="10" y="212" width="620" height="30" rx="6" fill="#e2e8f0"/><text x="20" y="232" class="svg-ink" font-size="13">1 Physical: bits, cables, connectors, hub, repeater, transceiver</text>
</svg><p class="cap">Please Do Not Throw Sausage Pizza Away (1 to 7). Don't Some People Fear Birthdays (PDUs 7 to 1).</p></div>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Port</th><th>Service</th><th>Port</th><th>Service</th></tr>
<tr><td>20/21 TCP</td><td>FTP</td><td>161/162 UDP</td><td>SNMP (poll / trap)</td></tr>
<tr><td>22 TCP</td><td>SSH, SFTP</td><td>389 TCP</td><td>LDAP</td></tr>
<tr><td>23 TCP</td><td>Telnet</td><td>443 TCP</td><td>HTTPS</td></tr>
<tr><td>25 TCP</td><td>SMTP</td><td>445 TCP</td><td>SMB</td></tr>
<tr><td>53 UDP/TCP</td><td>DNS</td><td>514 UDP</td><td>Syslog</td></tr>
<tr><td>67/68 UDP</td><td>DHCP</td><td>587 TCP</td><td>SMTPS</td></tr>
<tr><td>69 UDP</td><td>TFTP</td><td>636 TCP</td><td>LDAPS</td></tr>
<tr><td>80 TCP</td><td>HTTP</td><td>1433 TCP</td><td>SQL Server</td></tr>
<tr><td>123 UDP</td><td>NTP</td><td>3389 TCP</td><td>RDP</td></tr>
<tr><td></td><td></td><td>5060/5061</td><td>SIP / SIP over TLS</td></tr>
</table>
<ul>
<li>IP protocol numbers: ICMP 1, TCP 6, UDP 17, GRE 47, ESP 50, AH 51. IKE UDP 500, NAT-T UDP 4500.</li>
<li>Port ranges: 0-1023 well-known, 1024-49151 registered, 49152-65535 ephemeral.</li>
<li>MTU 1500, MSS 1460; GRE adds 24 bytes; jumbo frames about 9000.</li>
<li>Voice QoS: DSCP EF (46), CoS 5; policing drops, shaping delays.</li>
<li>Copper Ethernet 100 m; 10GBASE-T 55 m on Cat6, 100 m on Cat6a; Cat8 30 m.</li>
<li>10GBASE-SR multimode 300-400 m; LR single-mode 10 km; ER 40 km. DAC about 5-7 m.</li>
<li>Full mesh links n(n-1)/2. Spine-leaf: every leaf to every spine, 2 hops between servers.</li>
<li>IDS out-of-band, IPS inline; forward proxy for clients, reverse proxy for servers; NAS files, SAN blocks.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>PDU</dt><dd>Protocol data unit: the name for data at a layer (bits, frame, packet, segment/datagram, data).</dd>
<dt>Encapsulation</dt><dd>Adding a layer's header (and trailer) around the data from the layer above.</dd>
<dt>MTU / MSS</dt><dd>Largest packet a link carries / largest TCP payload per segment.</dd>
<dt>Ephemeral port</dt><dd>Temporary client source port, 49152-65535.</dd>
<dt>Socket / 5-tuple</dt><dd>IP plus port / the five values that identify a connection.</dd>
<dt>VIP</dt><dd>Virtual IP presented by a load balancer for a pool of servers.</dd>
<dt>DMZ</dt><dd>Screened subnet for public-facing servers between inside and outside.</dd>
<dt>Anycast</dt><dd>One address on many nodes; routing delivers to the nearest.</dd>
<dt>DAC</dt><dd>Direct attach copper: twinax cable with fixed transceivers for short links.</dd>
<dt>Plenum</dt><dd>Air-handling space; requires fire-rated, low-smoke cable.</dd>
<dt>Collapsed core</dt><dd>Two-tier design merging core and distribution layers.</dd>
<dt>East-west</dt><dd>Traffic between servers inside a site; north-south enters or leaves it.</dd>
</dl>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! PC (lab)</span>
show ip                  <span class="c">! address, mask, gateway, DNS, MAC</span>
ping 10.0.20.10          <span class="c">! L3 reachability, read the ttl</span>
arp                      <span class="c">! L2: gateway MAC learned?</span>
ip dns 10.0.10.1         <span class="c">! set the DNS server</span>
nslookup web.nwk.lab     <span class="c">! name resolution over UDP 53</span>
curl h&#116;tps://web.nwk.lab <span class="c">! TCP 443 to the web service</span>
<span class="c">! Router / switch</span>
show interfaces          <span class="c">! L1/L2 status, errors, speed, duplex</span>
show ip interface brief  <span class="c">! up/down and addresses at a glance</span>
show ip route            <span class="c">! L3 path decisions</span>
show access-lists        <span class="c">! which rules are matching</span>
show lldp neighbors      <span class="c">! who is connected to which port</span>
show interfaces status   <span class="c">! transceiver type per port</span></pre>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> 389 is LDAP, 3389 is RDP. SFTP is 22, FTPS is not. ESP is protocol 50, not port 50. Broadcast does not exist in IPv6. CRC errors are a Layer 1 symptom. An IDS cannot block.</p></div>

<div class="exam"><p><b>Exam strategy.</b> For PBQs that ask you to match ports or cables, fill in the ones you are sure of first; the remaining options shrink. For "which layer" questions, find the addressing or device in the stem: MAC means 2, IP or router means 3, port or TCP means 4, encryption or format means 6, a named service means 7.</p></div>

<div class="scn"><h4>The interview that turned on one ping</h4><p>A fresher interviewing for a NOC role was asked: "A PC gets ttl=125 from a server. What can you tell me?" He answered that the server was probably Windows (default TTL 128) and three routers sat on the return path; then added that the PC's ARP cache would show only the gateway, not the server, and that each router had rebuilt the frame. He was hired partly because he explained layers with evidence, not definitions.</p><p><b>Lesson:</b> connect every fact in this module to something you can observe in a real output.</p></div>

<div class="iv"><p class="q">"Give me a one-minute overview of how data moves from an application on one host to an application on another."</p><p>Strong answer: the application hands data to TCP or UDP, which adds ports (and for TCP, sequencing and reliability). IP adds source and destination addresses and a TTL. The host decides local or remote with its mask, ARPs for the gateway if remote, and frames the packet with the gateway's MAC. Switches forward by MAC; each router strips the frame, decrements TTL, routes by destination IP and builds a new frame. The receiver decapsulates up to the application on the destination port. Close with how you would verify each step.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSI layers, PDUs and devices, plus encapsulation hop by hop, are the base for every later module.</li>
<li>Appliances and functions are chosen by the decision they make and the layer they read.</li>
<li>Twenty ports with transport, six IP protocol numbers and four traffic types must be automatic.</li>
<li>Media choice is distance first: DAC, copper, multimode, single-mode; optics and connectors must match.</li>
<li>Topology follows traffic: three-tier and collapsed core for campuses, spine-leaf for east-west data centers.</li>
</ul></div>
`,hi:`
<p>Yeh chapter N10-009 objectives 1.1, 1.2, 1.4, 1.5 aur 1.6 ki aapki revision sheet hai. Exam se pehle wali raat ise padho, aur can-do list se woh cheezein dhoondho jinhe dobara dekhna hai. Track mein aage: <b>IPv4 addressing aur subnetting</b>, phir IPv6, phir cloud aur SDN concepts.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Main saaton OSI layers dono directions mein bol sakta hoon, har ek ke PDU, typical protocols aur devices ke saath.</li>
<li>Main Ethernet frame, IPv4 header, TCP header aur UDP header ke main fields bata sakta hoon.</li>
<li>Main hop by hop samjha sakta hoon ki packet router paar kare to kya badalta hai (MACs, TTL, checksum) aur kya nahi (IPs).</li>
<li>Main lab mein prove kar sakta hoon: PC1 par ttl=63, <code>arp</code> mein gateway MAC, R1 par Gi0/1 se bahar C route.</li>
<li>Main MTU se MSS calculate kar sakta hoon aur samjha sakta hoon ki tunnels ko <code>ip tcp adjust-mss</code> kyun chahiye.</li>
<li>Main router, switch, firewall types, IDS, IPS, load balancer, forward aur reverse proxy, NAS, SAN, AP aur WLC mein se chun sakta hoon.</li>
<li>Main CDN, VPN types (site-to-site, client-to-site, clientless, full aur split tunnel), QoS steps aur TTL ke dono matlab samjha sakta hoon.</li>
<li>Main saare bees N10-009 ports TCP/UDP aur insecure-se-secure pairs ke saath bol sakta hoon.</li>
<li>Main DNS, NTP, SNMP, syslog aur IPsec VPN ke firewall rules likh sakta hoon, ESP aur GRE ke protocol-based rules samet.</li>
<li>Main kisi link ke liye copper, multimode ya single-mode, sahi optic (SR/LR/ER, SFP/QSFP) aur sahi connector chun sakta hoon.</li>
<li>Main mesh, hybrid, star/hub-and-spoke, point-to-point, three-tier, collapsed core aur spine-leaf compare kar sakta hoon, aur unhe north-south aur east-west traffic se jod sakta hoon.</li>
<li>Main layer ke hisaab se troubleshoot kar sakta hoon aur "refused", "timeout", "not reachable" aur "administratively down" sahi padh sakta hoon.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="OSI summary">
<rect x="10" y="8" width="620" height="30" rx="6" fill="#fde68a"/><text x="20" y="28" class="svg-ink" font-size="13">7 Application: data, HTTP DNS SMTP SSH, proxy, WAF, L7 LB</text>
<rect x="10" y="42" width="620" height="30" rx="6" fill="#fde68a"/><text x="20" y="62" class="svg-ink" font-size="13">6 Presentation: data, encoding, TLS encryption, compression</text>
<rect x="10" y="76" width="620" height="30" rx="6" fill="#fde68a"/><text x="20" y="96" class="svg-ink" font-size="13">5 Session: data, sessions set up aur tear down, RPC, NetBIOS</text>
<rect x="10" y="110" width="620" height="30" rx="6" fill="#ddd6fe"/><text x="20" y="130" class="svg-ink" font-size="13">4 Transport: segment ya datagram, TCP UDP ports, stateful firewall</text>
<rect x="10" y="144" width="620" height="30" rx="6" fill="#bbf7d0"/><text x="20" y="164" class="svg-ink" font-size="13">3 Network: packet, IP, ICMP, TTL, router, L3 switch</text>
<rect x="10" y="178" width="620" height="30" rx="6" fill="#bae6fd"/><text x="20" y="198" class="svg-ink" font-size="13">2 Data link: frame, MAC, 802.1Q, FCS, switch, AP, NIC</text>
<rect x="10" y="212" width="620" height="30" rx="6" fill="#e2e8f0"/><text x="20" y="232" class="svg-ink" font-size="13">1 Physical: bits, cables, connectors, hub, repeater, transceiver</text>
</svg><p class="cap">Please Do Not Throw Sausage Pizza Away (1 se 7). Don't Some People Fear Birthdays (PDUs 7 se 1).</p></div>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Port</th><th>Service</th><th>Port</th><th>Service</th></tr>
<tr><td>20/21 TCP</td><td>FTP</td><td>161/162 UDP</td><td>SNMP (poll / trap)</td></tr>
<tr><td>22 TCP</td><td>SSH, SFTP</td><td>389 TCP</td><td>LDAP</td></tr>
<tr><td>23 TCP</td><td>Telnet</td><td>443 TCP</td><td>HTTPS</td></tr>
<tr><td>25 TCP</td><td>SMTP</td><td>445 TCP</td><td>SMB</td></tr>
<tr><td>53 UDP/TCP</td><td>DNS</td><td>514 UDP</td><td>Syslog</td></tr>
<tr><td>67/68 UDP</td><td>DHCP</td><td>587 TCP</td><td>SMTPS</td></tr>
<tr><td>69 UDP</td><td>TFTP</td><td>636 TCP</td><td>LDAPS</td></tr>
<tr><td>80 TCP</td><td>HTTP</td><td>1433 TCP</td><td>SQL Server</td></tr>
<tr><td>123 UDP</td><td>NTP</td><td>3389 TCP</td><td>RDP</td></tr>
<tr><td></td><td></td><td>5060/5061</td><td>SIP / TLS par SIP</td></tr>
</table>
<ul>
<li>IP protocol numbers: ICMP 1, TCP 6, UDP 17, GRE 47, ESP 50, AH 51. IKE UDP 500, NAT-T UDP 4500.</li>
<li>Port ranges: 0-1023 well-known, 1024-49151 registered, 49152-65535 ephemeral.</li>
<li>MTU 1500, MSS 1460; GRE 24 bytes jodta hai; jumbo frames lagbhag 9000.</li>
<li>Voice QoS: DSCP EF (46), CoS 5; policing drop karta hai, shaping delay karta hai.</li>
<li>Copper Ethernet 100 m; 10GBASE-T Cat6 par 55 m, Cat6a par 100 m; Cat8 30 m.</li>
<li>10GBASE-SR multimode 300-400 m; LR single-mode 10 km; ER 40 km. DAC lagbhag 5-7 m.</li>
<li>Full mesh links n(n-1)/2. Spine-leaf: har leaf har spine se, servers ke beech 2 hops.</li>
<li>IDS out-of-band, IPS inline; clients ke liye forward proxy, servers ke liye reverse proxy; NAS files, SAN blocks.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>PDU</dt><dd>Protocol data unit: kisi layer par data ka naam (bits, frame, packet, segment/datagram, data).</dd>
<dt>Encapsulation</dt><dd>Upar wali layer ke data ke around layer ka header (aur trailer) jodna.</dd>
<dt>MTU / MSS</dt><dd>Link jo sabse bada packet le ja sakta hai / har segment ka sabse bada TCP payload.</dd>
<dt>Ephemeral port</dt><dd>Temporary client source port, 49152-65535.</dd>
<dt>Socket / 5-tuple</dt><dd>IP plus port / woh paanch values jo connection pehchanti hain.</dd>
<dt>VIP</dt><dd>Servers ke pool ke liye load balancer ka dikhaya virtual IP.</dd>
<dt>DMZ</dt><dd>Inside aur outside ke beech public-facing servers ke liye screened subnet.</dd>
<dt>Anycast</dt><dd>Kai nodes par ek address; routing sabse nazdeek tak pahunchati hai.</dd>
<dt>DAC</dt><dd>Direct attach copper: chhote links ke liye fixed transceivers wali twinax cable.</dd>
<dt>Plenum</dt><dd>Air-handling jagah; fire-rated, kam dhuaan wali cable chahiye.</dd>
<dt>Collapsed core</dt><dd>Core aur distribution layers ko milane wala two-tier design.</dd>
<dt>East-west</dt><dd>Site ke andar servers ke beech traffic; north-south andar aata ya bahar jaata hai.</dd>
</dl>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! PC (lab)</span>
show ip                  <span class="c">! address, mask, gateway, DNS, MAC</span>
ping 10.0.20.10          <span class="c">! L3 reachability, ttl padho</span>
arp                      <span class="c">! L2: gateway MAC seekha?</span>
ip dns 10.0.10.1         <span class="c">! DNS server set karo</span>
nslookup web.nwk.lab     <span class="c">! UDP 53 par name resolution</span>
curl h&#116;tps://web.nwk.lab <span class="c">! web service tak TCP 443</span>
<span class="c">! Router / switch</span>
show interfaces          <span class="c">! L1/L2 status, errors, speed, duplex</span>
show ip interface brief  <span class="c">! ek nazar mein up/down aur addresses</span>
show ip route            <span class="c">! L3 path decisions</span>
show access-lists        <span class="c">! kaunse rules match ho rahe hain</span>
show lldp neighbors      <span class="c">! kaun kis port se juda hai</span>
show interfaces status   <span class="c">! har port ka transceiver type</span></pre>

<div class="warn"><p><b>Aakhri minute ki galtiyan jinse bachna hai.</b> 389 LDAP hai, 3389 RDP. SFTP 22 hai, FTPS nahi. ESP protocol 50 hai, port 50 nahi. IPv6 mein broadcast nahi hota. CRC errors Layer 1 ka symptom hain. IDS block nahi kar sakta.</p></div>

<div class="exam"><p><b>Exam strategy.</b> Ports ya cables match karne wale PBQs mein pehle woh bharo jinme aap sure ho; baaki options kam ho jaate hain. "Kaunsi layer" wale sawaalon mein stem mein addressing ya device dhoondho: MAC matlab 2, IP ya router matlab 3, port ya TCP matlab 4, encryption ya format matlab 6, service ka naam matlab 7.</p></div>

<div class="scn"><h4>Woh interview jo ek ping par palat gaya</h4><p>NOC role ke liye interview de rahe ek fresher se poocha gaya: "PC ko server se ttl=125 milta hai. Aap kya bata sakte ho?" Usne jawab diya ki server shayad Windows hai (default TTL 128) aur return path par teen routers hain; phir joda ki PC ke ARP cache mein sirf gateway dikhega, server nahi, aur har router ne frame dobara banaya. Use aanshik roop se isliye hire kiya gaya kyunki usne layers ko definitions se nahi, saboot se samjhaya.</p><p><b>Seekh:</b> is module ke har fact ko kisi aisi cheez se jodo jo aap real output mein dekh sako.</p></div>

<div class="iv"><p class="q">"Ek minute mein batao ki data ek host ki application se doosre host ki application tak kaise jaata hai."</p><p>Strong answer: application data TCP ya UDP ko deti hai, jo ports jodta hai (aur TCP ke liye sequencing aur reliability). IP source aur destination addresses aur TTL jodta hai. Host apne mask se local ya remote decide karta hai, remote ho to gateway ke liye ARP karta hai, aur packet ko gateway ke MAC ke saath frame karta hai. Switches MAC se forward karte hain; har router frame hatata hai, TTL kam karta hai, destination IP se route karta hai aur naya frame banata hai. Receiver destination port par application tak decapsulate karta hai. End mein batao ki aap har step kaise verify karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSI layers, PDUs aur devices, plus hop by hop encapsulation, har agle module ki neenv hain.</li>
<li>Appliances aur functions us decision se chune jaate hain jo woh lete hain aur us layer se jo woh padhte hain.</li>
<li>Transport ke saath bees ports, chhe IP protocol numbers aur chaar traffic types automatic hone chahiye.</li>
<li>Media choice mein pehle distance: DAC, copper, multimode, single-mode; optics aur connectors match hone chahiye.</li>
<li>Topology traffic ko follow karti hai: campuses ke liye three-tier aur collapsed core, east-west data centers ke liye spine-leaf.</li>
</ul></div>
`}};export{e as default};