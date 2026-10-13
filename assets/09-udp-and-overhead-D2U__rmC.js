var e=(e,t,n,r,i,a)=>`<text x="`+e+`" y="`+t+`" text-anchor="`+(a||`middle`)+`" class="`+(r||`svg-ink`)+`" font-size="`+(i||12)+`">`+n+`</text>`,t=(e,t,n,r,i)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" fill="`+i+`" stroke="#64748b" stroke-width="0.8"/>`,n=(n,r,i)=>{let a=600/32,o=``;return[0,8,16,24].forEach(t=>{o+=e(20+t*a+2,12,t,`svg-muted`,10,`start`)}),o+=e(618,12,31,`svg-muted`,10,`end`),n.forEach((n,r)=>{let i=20,s=18+r*34;n.forEach(n=>{let r=n[1]*a;o+=t(i,s,r,32,n[2])+e(i+r/2,s+20,n[0],`svg-ink`,n[3]||11),i+=r})}),`<div class="dia"><svg viewBox="0 0 640 `+(24+n.length*34)+`" role="img" aria-label="`+i+`">`+o+`</svg><p class="cap">`+r+`</p></div>`},r=[[[`Source Port (16)`,16,`#bae6fd`],[`Destination Port (16)`,16,`#bae6fd`]],[[`Length (16): header + data`,16,`#ddd6fe`],[`Checksum (16)`,16,`#fed7aa`]],[[`Data (the application message: DNS, DHCP, NTP, SNMP, syslog, RTP ...)`,32,`#bbf7d0`,11]]],i=(n,r)=>{let i=``,a=[[`Preamble+SFD 8`,70,`#e2e8f0`],[`Eth 14`,44,`#bae6fd`],[`IP 20`,44,`#ddd6fe`],[`TCP 20`,44,`#fde68a`],[`Payload 1460 (MSS)`,290,`#bbf7d0`],[`FCS 4`,36,`#bae6fd`],[`IFG 12`,50,`#e2e8f0`]],o=20;return a.forEach(n=>{i+=t(o,40,n[1],44,n[2])+e(o+n[1]/2,66,n[0],`svg-ink`,9),o+=n[1]}),i+=e(320,22,r,`svg-ink`,12),i+=e(320,112,`headers and framing: 78 bytes`,`svg-accent`,12),i+=e(320,134,`1460 / 1538 = 94.9 percent of the wire carries your data`,`svg-ink`,13),`<div class="dia"><svg viewBox="0 0 640 146" role="img" aria-label="Wire overhead of one full TCP frame">`+i+`</svg><p class="cap">`+n+`</p></div>`},a=`<pre class="out">0020  08 08 <span class="hl">c9 3a 00 35 00 29 9e d2</span> 7c 1c 01 00 00 01

User Datagram Protocol, Src Port: 51514, Dst Port: 53
    Source Port: 51514
    Destination Port: 53
    Length: 41
    Checksum: 0x9ed2 [correct]
Domain Name System (query)
    Transaction ID: 0x7c1c
    Flags: 0x0100 Standard query (QR=0, RD=1)
    Query: www.nwkings.com: type A, class IN</pre>`,o=`<div class="tbl"><table class="cmp">
<tr><th>Service</th><th>Packet (Packet Studio flow)</th><th>UDP ports</th><th>UDP length</th></tr>
<tr><td>DHCP</td><td>Discover, 0.0.0.0 to 255.255.255.255</td><td>68 to 67</td><td>272</td></tr>
<tr><td>DNS</td><td>query for www.nwkings.com, 192.168.10.10 to 8.8.8.8</td><td>51514 to 53</td><td>41</td></tr>
<tr><td>NTP</td><td>client request, 10.0.0.1 to 10.0.0.123 (DSCP CS6, TTL 255)</td><td>123 to 123</td><td>56</td></tr>
<tr><td>SNMP</td><td>get-request sysName, community nkRO in clear text</td><td>50311 to 161</td><td>47</td></tr>
<tr><td>Syslog</td><td>LOCAL7.ERRORS %LINK-3-UPDOWN, 192.168.99.254 to 192.168.99.50</td><td>55123 to 514</td><td>110</td></tr>
</table></div>`,s=`<pre class="out">802.1Q Virtual LAN, PRI: 5, DEI: 0, ID: 100
Differentiated Services Field: 0xb8 (DSCP: EF (voice), ECN: Not-ECT)
Total Length: 200
User Datagram Protocol, Src Port: 16384, Dst Port: 16386
    Length: 180
Frame 1: 218 bytes on wire (1744 bits), 218 bytes captured</pre>`,c={id:`udp-and-overhead`,h:{en:`The UDP header and what it lacks, UDP services, header overhead and goodput maths`,hi:`UDP header aur usme kya nahi, UDP services, header overhead aur goodput maths`},body:{en:`
<p>If TCP is a registered courier, UDP is a <b>postcard</b>: an address, a short message, a stamp and nothing else. No receipt, no page numbers, no check that the postbox exists. That sounds poor until you need a message to arrive quickly, or the answer to a question that costs one packet, or a live voice stream where a late word is worse than a missing one. UDP is the right tool for all three, and its 8-byte header is as small as a transport header can be.</p>

<h3>The 8 bytes</h3>
`+n(r,`The entire UDP header: two ports, a length and a checksum.`,`UDP header`)+`
<p>Here is the UDP header of the DNS query from the Packet Studio <code>dns</code> flow, taken straight from the bytes:</p>
`+a+`
<div class="eg"><p><b>Worked example: decode and cross-check.</b> <code>c9 3a</code> = 51,514 (an ephemeral source port), <code>00 35</code> = 53 (DNS). <code>00 29</code> = 41 = 8 bytes of header + 33 bytes of DNS message. Cross-check with IP: Total Length 61 minus 20 bytes of IP header = 41. A UDP length that disagrees with the IP Total Length is a malformed packet. The checksum <code>9e d2</code> covers the UDP header, the data and a pseudo-header of source IP, destination IP, protocol 17 and the UDP length. In IPv4 a sender may set it to 0 to mean "not computed"; in IPv6 it is mandatory. A computed value of 0 is sent as ffff.</p></div>

<h3>What UDP does not have</h3>
<div class="tbl"><table class="cmp">
<tr><th>Feature</th><th>TCP</th><th>UDP</th></tr>
<tr><td>Connection set-up</td><td>3-way handshake</td><td>none: first packet carries data</td></tr>
<tr><td>Sequence and acknowledgment numbers</td><td>yes, per byte</td><td>none</td></tr>
<tr><td>Retransmission</td><td>automatic</td><td>none: the application decides</td></tr>
<tr><td>Ordering</td><td>guaranteed</td><td>none: datagrams can reorder</td></tr>
<tr><td>Flow and congestion control</td><td>window, slow start</td><td>none: a sender can flood</td></tr>
<tr><td>Message boundaries</td><td>byte stream</td><td>one datagram = one message</td></tr>
<tr><td>Header size</td><td>20 to 60 bytes</td><td>8 bytes</td></tr>
</table></div>
<p>If you need reliability over UDP you build it into the application, as TFTP does with stop-and-wait or QUIC does with its own streams. The missing handshake also means a spoofed source address is easy to forge, which is why UDP amplification attacks exist and why open DNS and NTP servers are restricted.</p>

<h3>Real services on UDP</h3>
`+o+`
<ul>
<li><b>DNS (53)</b>: one question, one answer; flags 0x0100 for the query and 0x8180 for a normal response, 0x8183 for NXDOMAIN. Large answers and zone transfers move to TCP 53.</li>
<li><b>DHCP (67 and 68)</b>: the client has no IP address, so TCP cannot be used; the Discover leaves from 0.0.0.0 port 68 to 255.255.255.255 port 67.</li>
<li><b>NTP (123)</b>: tiny, fixed-size 48-byte messages with timestamps; the simulator marks them CS6 and TTL 255.</li>
<li><b>SNMP (161, traps 162)</b>: v2c sends the community string in clear text, which is visible in the bytes; v3 adds authentication and encryption.</li>
<li><b>Syslog (514)</b>: the priority value is facility x 8 + severity; local7 (23) with severity 3 is 23 x 8 + 3 = 187. If the receiver is down, the message is simply gone.</li>
</ul>

<h3>Why voice and video choose UDP</h3>
<p>A retransmitted voice sample arrives after the listener has moved on, so waiting for it only adds delay. Real-time media sends RTP inside UDP and lets the codec hide small losses. The simulator's voice packet:</p>
`+s+`
<p>UDP length 180 = 8 + 12 (RTP) + 160 bytes of G.711 audio, which is 20 ms of speech: 160 bytes x 50 packets per second x 8 = 64 kbps. The frame carries VLAN 100, CoS 5 and DSCP EF so the network can give it the priority queue.</p>

<h3>Header overhead and goodput</h3>
`+i(`One full-size TCP frame on Ethernet. Not drawn to scale: the payload is really 95 percent of the width.`,`Bytes on the wire for one 1500-byte IP packet`)+`
<p>Every TCP segment pays 14 (Ethernet) + 20 (IP) + 20 (TCP) = <b>54 bytes</b> of headers, 58 with the FCS, and 78 once the preamble, SFD and inter-frame gap are counted. <b>Goodput</b> is the application data rate; <b>line rate</b> is what the link signals.</p>
<div class="tbl"><table class="cmp">
<tr><th>Case on a 1 Gbps link</th><th>Payload</th><th>Wire bytes</th><th>Goodput</th></tr>
<tr><td>TCP, MSS 1460, no options</td><td>1460</td><td>1538</td><td>94.9 percent = 949 Mbps</td></tr>
<tr><td>TCP with timestamps (12 option bytes)</td><td>1448</td><td>1538</td><td>94.1 percent = 941 Mbps</td></tr>
<tr><td>UDP, 1472 bytes</td><td>1472</td><td>1538</td><td>95.7 percent = 957 Mbps</td></tr>
<tr><td>TCP on a trunk (802.1Q), timestamps</td><td>1448</td><td>1542</td><td>93.9 percent = 939 Mbps</td></tr>
<tr><td>Bare TCP ACK (padded to 64)</td><td>0</td><td>84</td><td>0, but still 1,488,095 per second possible</td></tr>
<tr><td>G.711 voice packet, tagged</td><td>160</td><td>242</td><td>66 percent</td></tr>
</table></div>
<p>The voice row shows why small packets hurt: 242 bytes x 8 bits x 50 packets = <b>96.8 kbps on the wire for a 64 kbps codec</b>, a 51 percent overhead, and Layer 2 headers are not even counted by simple bandwidth calculators. Jumbo frames and larger segments reduce overhead for bulk transfers; they do nothing for voice.</p>

<div class="warn"><p><b>Common mistakes.</b> Saying UDP is "bad" or "fast": it is simply unreliable and lightweight. Forgetting that a firewall that allows DNS only on UDP 53 breaks large answers that fall back to TCP 53. Sizing a link by codec rate without the 40 to 50 percent packet overhead. Expecting a 1 Gbps link to deliver 1,000 Mbps of file transfer.</p></div>

<div class="exam"><p><b>Exam traps.</b> UDP header = 8 bytes: ports, length, checksum. DHCP 67 and 68, TFTP 69, NTP 123, SNMP 161 and 162, syslog 514 are UDP; DNS uses both. Voice and video use UDP (RTP). IPv4 UDP checksum may be zero; IPv6's may not. TCP header is at least 20 bytes, so 14 + 20 + 20 = 54.</p></div>

<div class="scn"><h4>Choppy calls only during backups</h4><p>Voice calls broke up every evening. A capture on the access port showed phone packets arriving with DSCP 0, not EF: the switch port was set to untrusted and rewrote the marking, so voice shared the default queue with a backup job that filled the uplink. Trusting the phone's markings (or classifying by VLAN and port) restored EF, the priority queue took over and the calls became clean while the backup kept running.</p><p><b>Lesson:</b> UDP voice has no retransmission to rescue it; check the DSCP in the header and where it was lost.</p></div>

<div class="iv"><p class="q">"Why does DNS use UDP, and when does it use TCP?"</p><p>A query and answer fit in one datagram each, so UDP avoids the handshake and keeps a busy server stateless. Responses larger than the UDP size limit (512 bytes, or more with EDNS), truncated answers and zone transfers use TCP port 53. So the firewall must allow both.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>UDP header = 8 bytes: source port, destination port, length, checksum. Length = IP Total Length - IP header.</li>
<li>No handshake, sequence numbers, acknowledgments, retransmission or flow control; the application must cope.</li>
<li>DHCP, DNS, NTP, SNMP, syslog, TFTP and RTP voice and video ride on UDP.</li>
<li>14 + 20 + 20 = 54 bytes of headers per TCP segment; 1538 wire bytes per full frame gives 949 Mbps goodput on 1 Gbps.</li>
<li>Small packets multiply overhead: a 64 kbps voice stream needs about 97 kbps on the wire.</li>
</ul></div>
`,hi:`
<p>Agar TCP registered courier hai, to UDP ek <b>postcard</b> hai: address, chhota message, stamp aur kuch nahi. Na receipt, na page numbers, na yeh check ki postbox hai bhi ya nahi. Yeh kamzor lagta hai jab tak aapko message jaldi pahunchana ho, ya ek packet mein poore hone wale sawaal ka jawab chahiye, ya live voice stream chahiye jahan late aaya shabd gayab shabd se bhi bura hai. In teeno ke liye UDP sahi tool hai, aur uska 8-byte header transport header ke liye jitna chhota ho sakta hai utna chhota hai.</p>

<h3>Woh 8 bytes</h3>
`+n(r,`Poora UDP header: do ports, ek length aur ek checksum.`,`UDP header`)+`
<p>Packet Studio ke <code>dns</code> flow ke DNS query ka UDP header yeh hai, seedha bytes se liya hua:</p>
`+a+`
<div class="eg"><p><b>Worked example: decode aur cross-check.</b> <code>c9 3a</code> = 51,514 (ephemeral source port), <code>00 35</code> = 53 (DNS). <code>00 29</code> = 41 = 8 bytes header + 33 bytes DNS message. IP se cross-check: Total Length 61 minus 20 bytes IP header = 41. UDP length jo IP Total Length se na mile woh malformed packet hai. Checksum <code>9e d2</code> UDP header, data aur source IP, destination IP, protocol 17 aur UDP length ke pseudo-header ko cover karta hai. IPv4 mein sender ise 0 set kar sakta hai, yaani "calculate nahi kiya"; IPv6 mein yeh mandatory hai. Calculated value 0 aaye to ffff bheji jaati hai.</p></div>

<h3>UDP mein kya nahi hai</h3>
<div class="tbl"><table class="cmp">
<tr><th>Feature</th><th>TCP</th><th>UDP</th></tr>
<tr><td>Connection set-up</td><td>3-way handshake</td><td>nahi: pehla packet hi data le jaata hai</td></tr>
<tr><td>Sequence aur acknowledgment numbers</td><td>haan, per byte</td><td>nahi</td></tr>
<tr><td>Retransmission</td><td>automatic</td><td>nahi: application tay karti hai</td></tr>
<tr><td>Ordering</td><td>guaranteed</td><td>nahi: datagrams reorder ho sakte hain</td></tr>
<tr><td>Flow aur congestion control</td><td>window, slow start</td><td>nahi: sender baadh la sakta hai</td></tr>
<tr><td>Message boundaries</td><td>byte stream</td><td>ek datagram = ek message</td></tr>
<tr><td>Header size</td><td>20 se 60 bytes</td><td>8 bytes</td></tr>
</table></div>
<p>UDP par reliability chahiye to application ke andar banani padti hai, jaise TFTP stop-and-wait se ya QUIC apni streams se karta hai. Handshake na hone ka matlab source address forge karna aasaan hai, isliye UDP amplification attacks hote hain aur open DNS aur NTP servers restricted rakhe jaate hain.</p>

<h3>UDP par real services</h3>
`+o+`
<ul>
<li><b>DNS (53)</b>: ek sawaal, ek jawab; query ke liye flags 0x0100 aur normal response ke liye 0x8180, NXDOMAIN ke liye 0x8183. Bade answers aur zone transfers TCP 53 par jaate hain.</li>
<li><b>DHCP (67 aur 68)</b>: client ke paas IP address nahi hota, isliye TCP use nahi ho sakta; Discover 0.0.0.0 port 68 se 255.255.255.255 port 67 ko jaata hai.</li>
<li><b>NTP (123)</b>: timestamps ke saath chhote, fixed 48-byte messages; simulator inhe CS6 aur TTL 255 mark karta hai.</li>
<li><b>SNMP (161, traps 162)</b>: v2c community string clear text mein bhejta hai, jo bytes mein dikhti hai; v3 authentication aur encryption jodta hai.</li>
<li><b>Syslog (514)</b>: priority value = facility x 8 + severity; local7 (23) aur severity 3 matlab 23 x 8 + 3 = 187. Receiver down ho to message bas gayab ho jaata hai.</li>
</ul>

<h3>Voice aur video UDP kyun chunte hain</h3>
<p>Dobara bheja gaya voice sample tab aata hai jab sunne wala aage badh chuka hota hai, isliye uska intezaar sirf delay badhata hai. Real-time media RTP ko UDP ke andar bhejta hai aur codec chhote losses chhupa leta hai. Simulator ka voice packet:</p>
`+s+`
<p>UDP length 180 = 8 + 12 (RTP) + 160 bytes G.711 audio, yaani 20 ms ki speech: 160 bytes x 50 packets per second x 8 = 64 kbps. Frame VLAN 100, CoS 5 aur DSCP EF le jaata hai taaki network use priority queue de sake.</p>

<h3>Header overhead aur goodput</h3>
`+i(`Ethernet par ek full-size TCP frame. Scale ke hisaab se nahi: payload asal mein 95 percent chaudai hai.`,`Ek 1500-byte IP packet ke wire bytes`)+`
<p>Har TCP segment <b>54 bytes</b> headers ka bhugtan karta hai: 14 (Ethernet) + 20 (IP) + 20 (TCP), FCS ke saath 58, aur preamble, SFD aur inter-frame gap gino to 78. <b>Goodput</b> application data rate hai; <b>line rate</b> woh hai jo link signal karta hai.</p>
<div class="tbl"><table class="cmp">
<tr><th>1 Gbps link par case</th><th>Payload</th><th>Wire bytes</th><th>Goodput</th></tr>
<tr><td>TCP, MSS 1460, koi options nahi</td><td>1460</td><td>1538</td><td>94.9 percent = 949 Mbps</td></tr>
<tr><td>TCP timestamps ke saath (12 option bytes)</td><td>1448</td><td>1538</td><td>94.1 percent = 941 Mbps</td></tr>
<tr><td>UDP, 1472 bytes</td><td>1472</td><td>1538</td><td>95.7 percent = 957 Mbps</td></tr>
<tr><td>Trunk (802.1Q) par TCP, timestamps</td><td>1448</td><td>1542</td><td>93.9 percent = 939 Mbps</td></tr>
<tr><td>Bare TCP ACK (64 tak padded)</td><td>0</td><td>84</td><td>0, lekin phir bhi 1,488,095 per second mumkin</td></tr>
<tr><td>G.711 voice packet, tagged</td><td>160</td><td>242</td><td>66 percent</td></tr>
</table></div>
<p>Voice wali row dikhati hai ki chhote packets kyun nuksaan karte hain: 242 bytes x 8 bits x 50 packets = <b>64 kbps codec ke liye wire par 96.8 kbps</b>, yaani 51 percent overhead, aur simple bandwidth calculators Layer 2 headers ginte bhi nahi. Jumbo frames aur bade segments bulk transfers ka overhead ghatate hain; voice par unka koi asar nahi.</p>

<div class="warn"><p><b>Common galtiyan.</b> UDP ko "bura" ya "tez" kehna: woh bas unreliable aur halka hai. Yeh bhoolna ki sirf UDP 53 par DNS allow karne wala firewall TCP 53 par fall back karne wale bade answers tod deta hai. Link ko codec rate se size karna bina 40 se 50 percent packet overhead ke. 1 Gbps link se file transfer mein 1,000 Mbps ki ummeed.</p></div>

<div class="exam"><p><b>Exam traps.</b> UDP header = 8 bytes: ports, length, checksum. DHCP 67 aur 68, TFTP 69, NTP 123, SNMP 161 aur 162, syslog 514 UDP hain; DNS dono use karta hai. Voice aur video UDP (RTP) use karte hain. IPv4 UDP checksum zero ho sakta hai; IPv6 ka nahi. TCP header kam se kam 20 bytes, isliye 14 + 20 + 20 = 54.</p></div>

<div class="scn"><h4>Choppy calls sirf backups ke dauran</h4><p>Voice calls har shaam toot-toot kar aati thi. Access port ke capture mein phone packets DSCP 0 ke saath aate dikhe, EF nahi: switch port untrusted tha aur marking rewrite kar deta tha, isliye voice default queue mein us backup job ke saath baithi jo uplink bhar deta tha. Phone ki markings par trust karne (ya VLAN aur port se classify karne) se EF wapas aaya, priority queue ne kaam sambhala aur backup chalte hue bhi calls saaf ho gayi.</p><p><b>Seekh:</b> UDP voice ko bachane ke liye retransmission nahi hai; header mein DSCP dekho aur dekho kahan khoya.</p></div>

<div class="iv"><p class="q">"DNS UDP kyun use karta hai, aur TCP kab?"</p><p>Query aur answer ek ek datagram mein fit hote hain, isliye UDP handshake bacha leta hai aur busy server ko stateless rakhta hai. UDP size limit (512 bytes, EDNS ke saath zyada) se bade responses, truncated answers aur zone transfers TCP port 53 use karte hain. Isliye firewall ko dono allow karne chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>UDP header = 8 bytes: source port, destination port, length, checksum. Length = IP Total Length - IP header.</li>
<li>Handshake, sequence numbers, acknowledgments, retransmission ya flow control nahi; application ko sambhalna padta hai.</li>
<li>DHCP, DNS, NTP, SNMP, syslog, TFTP aur RTP voice-video UDP par chalte hain.</li>
<li>Har TCP segment par 14 + 20 + 20 = 54 bytes headers; 1538 wire bytes per full frame se 1 Gbps par 949 Mbps goodput.</li>
<li>Chhote packets overhead badhate hain: 64 kbps voice stream ko wire par lagbhag 97 kbps chahiye.</li>
</ul></div>
`}};export{c as default};