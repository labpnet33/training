var e=(e,t,n,r,i,a)=>`<text x="`+e+`" y="`+t+`" text-anchor="`+(a||`middle`)+`" class="`+(r||`svg-ink`)+`" font-size="`+(i||12)+`">`+n+`</text>`,t=(e,t,n,r,i)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" fill="`+i+`" stroke="#64748b" stroke-width="0.8"/>`,n=(e,t,n,r)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="1.5"/><polygon points="`+n+`,`+r+` `+(n-6)+`,`+(r-4)+` `+(n-6)+`,`+(r+4)+`" fill="#64748b"/>`,r=(r,i)=>{let a=``,o=(n,r,i,a)=>t(n,30,110,56,a)+e(n+55,54,r,`svg-ink`,12)+e(n+55,72,i,`svg-muted`,10);return a+=o(10,`1. Layer 2`,i[0],`#bae6fd`)+o(140,`2. ARP`,i[1],`#bbf7d0`)+o(270,`3. IP`,i[2],`#ddd6fe`)+o(400,`4. ICMP`,i[3],`#fde68a`)+o(530,`5. TCP / UDP`,i[4],`#fed7aa`),a+=n(120,58,140,58)+n(250,58,270,58)+n(380,58,400,58)+n(510,58,530,58),a+=e(320,112,i[5],`svg-ink`,12),`<div class="dia"><svg viewBox="0 0 640 126" role="img" aria-label="Capture triage order">`+a+`</svg><p class="cap">`+r+`</p></div>`},i=`<div class="tbl"><table class="cmp">
<tr><th>Layer</th><th>Field</th><th>Size</th><th>Normal</th><th>Abnormal means</th></tr>
<tr><td>Ethernet</td><td>Destination, source MAC</td><td>6 + 6</td><td>unicast source; I/G bit 0 on source</td><td>multicast or broadcast as a source is invalid</td></tr>
<tr><td>Ethernet</td><td>EtherType / length</td><td>2</td><td>0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6, 0x8100 tag</td><td>1500 or less = 802.3 length with LLC (STP)</td></tr>
<tr><td>Ethernet</td><td>FCS, frame size</td><td>4</td><td>64 to 1518 (1522 tagged)</td><td>CRC, runts, giants: cable, duplex, MTU</td></tr>
<tr><td>802.1Q</td><td>TPID, PCP, DEI, VID</td><td>16, 3, 1, 12</td><td>0x8100; VID 1 to 4094</td><td>native VLAN untagged; mismatch leaks VLANs</td></tr>
<tr><td>ARP</td><td>opcode, sender, target</td><td>28 total</td><td>request to ff:ff, reply unicast</td><td>no reply, two MACs, remote target IP</td></tr>
<tr><td>IPv4</td><td>Version, IHL</td><td>4 + 4</td><td>0x45</td><td>IHL below 5 invalid; above 5 = options</td></tr>
<tr><td>IPv4</td><td>DSCP / ECN</td><td>6 + 2</td><td>0x00; EF 0xb8; AF41 0x88; CS6 0xc0</td><td>voice at 0x00 = marking lost</td></tr>
<tr><td>IPv4</td><td>Total Length</td><td>16</td><td>frame minus 14</td><td>mismatch = padding or truncation</td></tr>
<tr><td>IPv4</td><td>Identification, flags, offset</td><td>16, 3, 13</td><td>DF = 0x4000 on TCP; offset 0</td><td>MF or offset above 0 = fragments; DF with MF is odd</td></tr>
<tr><td>IPv4</td><td>TTL</td><td>8</td><td>64, 128 or 255 at source</td><td>1 or 0 = about to die; loop if repeated</td></tr>
<tr><td>IPv4</td><td>Protocol, checksum</td><td>8, 16</td><td>1, 6, 17, 89; header sums to 0xffff</td><td>wrong protocol blocked; bad sum = corruption or offload</td></tr>
<tr><td>ICMP</td><td>type, code</td><td>8 + 8</td><td>8 and 0 (ping); 11/0 (traceroute); 3/3 at the end</td><td>3/1 host, 3/4 MTU, 3/13 filter</td></tr>
<tr><td>TCP</td><td>ports, seq, ack</td><td>16, 32, 32</td><td>ack = next byte expected</td><td>SYN repeated, no ack = dropped</td></tr>
<tr><td>TCP</td><td>offset, flags</td><td>4, 9</td><td>SYN 0x02, SYN-ACK 0x12, ACK 0x10, PSH-ACK 0x18, FIN-ACK 0x11</td><td>RST 0x04 = refused or aborted; odd combinations = scan</td></tr>
<tr><td>TCP</td><td>window, options</td><td>16, up to 40</td><td>MSS 1460; window above 0</td><td>Win=0 = receiver full; small MSS = tunnel clamp</td></tr>
<tr><td>UDP</td><td>ports, length, checksum</td><td>2 + 2 + 2 + 2</td><td>length = IP length - 20</td><td>mismatch = malformed; checksum 0 = not computed</td></tr>
</table></div>`,a=`<div class="tbl"><table class="cmp">
<tr><th>What you see in the capture</th><th>Most likely fault</th><th>Where to act</th></tr>
<tr><td>ARP request repeated, never answered</td><td>host down, wrong VLAN, wrong mask, port security</td><td>host and access port</td></tr>
<tr><td>two different MACs answer for one IP</td><td>duplicate address</td><td>find both owners</td></tr>
<tr><td>CRC or runt counters rising on one port</td><td>cable, optic or duplex mismatch</td><td>the physical link</td></tr>
<tr><td>giants counted, small pings fine, bulk transfers hang</td><td>MTU or jumbo mismatch</td><td>every hop's MTU</td></tr>
<tr><td>untagged frames carry the wrong VLAN, CDP logs a mismatch</td><td>native VLAN differs between trunk ends</td><td>both trunk ports</td></tr>
<tr><td>TTL 1 packets and Time Exceeded from alternating routers</td><td>routing loop</td><td>routing tables</td></tr>
<tr><td>ICMP 3/0 or 3/1 from the gateway</td><td>no route (0) or last-hop ARP failure (1)</td><td>routing or the target host</td></tr>
<tr><td>ICMP 3/13 from a router</td><td>ACL or firewall rejecting on purpose</td><td>the filter</td></tr>
<tr><td>ICMP 3/4 appears, or big DF packets vanish silently</td><td>path MTU smaller than expected, black hole if no ICMP</td><td>tunnel MTU, MSS clamp, ICMP policy</td></tr>
<tr><td>SYN sent three times, gaps doubling, nothing back</td><td>dropped on the way or on the return path</td><td>ACLs, firewall, server gateway</td></tr>
<tr><td>SYN answered by RST, ACK within milliseconds</td><td>port closed or reject rule</td><td>the service or firewall rule</td></tr>
<tr><td>handshake fine, request repeated, no response</td><td>server application, or large packets lost to MTU</td><td>server, then PMTUD</td></tr>
<tr><td>three duplicate ACKs then a retransmission</td><td>packet loss on the path</td><td>links, queues, drops</td></tr>
<tr><td>Win=0 from one side</td><td>slow receiving application</td><td>that host</td></tr>
<tr><td>RST mid-stream with a TTL unlike the server's</td><td>middlebox reset</td><td>firewall or IPS</td></tr>
<tr><td>DNS response flags 0x8183</td><td>name does not exist (NXDOMAIN)</td><td>spelling or the zone</td></tr>
<tr><td>voice UDP shows DSCP 0 instead of EF</td><td>marking rewritten at an untrusted port</td><td>QoS trust boundary</td></tr>
</table></div>`,o={id:`headers-summary`,h:{en:`Summary and exam checklist: field cheat sheet and symptom-to-fault table`,hi:`Summary aur exam checklist: field cheat sheet aur symptom-to-fault table`},body:{en:`
<p>A good engineer reading a capture is like a doctor reading a chart: a handful of vital signs, read in a fixed order, point to the problem before any fancy test. This last chapter packs everything from the module into one reference page, then shows the order in which to read a conversation and what each abnormal sign means.</p>

`+r(`Read a capture in the order the packet was built: link, address resolution, network, errors, then the transport.`,[`MAC, VLAN, FCS`,`request, reply?`,`TTL, DF, length`,`type and code`,`flags, window`])+`

<h3>The checklist: can you do these?</h3>
<ul>
<li>Convert hex to binary and decimal, and read a field in network byte order (chapter 1).</li>
<li>Split a MAC into OUI, I/G and U/L bits, and name the frame sizes and error counters (chapter 2).</li>
<li>Decode a 802.1Q tag from four bytes and explain the native VLAN (chapter 3).</li>
<li>Read an ARP request, reply and gratuitous ARP, and predict switch behaviour for each MAC type (chapter 4).</li>
<li>Check an IPv4 header row by row, including DSCP, flags, TTL and checksum (chapter 5).</li>
<li>Work out fragment offsets and MSS values, and explain a PMTUD black hole (chapter 6).</li>
<li>Map any ICMP type and code to a fault, and read a traceroute (chapter 7).</li>
<li>Follow TCP sequence numbers through a handshake, data, teardown, loss and a zero window (chapter 8).</li>
<li>Decode UDP, and compute goodput and voice bandwidth (chapter 9).</li>
</ul>

<h3>One-page field cheat sheet</h3>
`+i+`

<h3>Symptom in the capture to fault</h3>
`+a+`

<h3>Mini glossary</h3>
<dl class="terms">
<dt>OUI</dt><dd>first 24 bits of a MAC, assigned by the IEEE to a manufacturer.</dd>
<dt>MTU / MSS</dt><dd>largest IP packet a link carries / largest TCP data per segment (MTU minus 40).</dd>
<dt>PMTUD</dt><dd>path MTU discovery: DF packets plus ICMP 3/4 find the smallest MTU on the path.</dd>
<dt>DSCP / PCP</dt><dd>Layer 3 and Layer 2 priority markings (EF 46 and CoS 5 for voice).</dd>
<dt>ISN</dt><dd>initial sequence number, random per connection; analysers show it as 0.</dd>
<dt>Goodput</dt><dd>application data rate after all header and framing overhead.</dd>
</dl>

<div class="eg"><p><b>Worked example: triage one ticket in five reads.</b> "PC1 cannot open the page on 203.0.113.80." (1) Layer 2: frames from PC1 have the gateway's MAC as destination, normal. (2) ARP: PC1 resolved the gateway. (3) IP: the SYN has TTL 64 on the PC link and 63 on the server link, DF set, protocol 6, so the path and routing work. (4) ICMP: nothing came back. (5) TCP: the SYN reaches the server, but no SYN-ACK leaves. The server cannot answer, which is exactly the fault of the ccna-models troubleshooting lab: SRV had no default gateway, so it could not reply to a host outside its own subnet. Five reads, one fault, no device logins needed to find it.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Starting at Layer 7 and guessing. Trusting one capture point: capture on both sides of the suspect device and compare TTL, checksum and flags. Ignoring the first packet of a conversation, which usually carries the whole story. Memorising values without knowing which field they belong to.</p></div>

<div class="exam"><p><b>Exam traps, all in one place.</b> Ethernet header 14, FCS 4, frame 64 to 1518, tagged 1522, MTU 1500. EtherType 0x0800, 0x0806, 0x86DD, 0x8100. IPv4 header 20 to 60 (IHL x 4); protocol 1, 6, 17, 89. TTL and checksum change per router, MAC addresses change per hop, IP addresses do not (without NAT). TCP header 20 to 60, UDP 8. ACK = next byte expected; SYN and FIN consume one number. Port 80 TCP, 53 both, 67 and 68, 69, 123, 161, 162, 514 UDP. Default MSS 1460 for MTU 1500. ICMP: 0, 3, 5, 8, 11.</p></div>

<div class="scn"><h4>Three captures, one afternoon</h4><p>On a Friday the NOC got three tickets: a chatty branch with a slow share, a flaky phone and an unreachable web service. The branch trace showed the handshake and small packets passing but no reply to a 1,400-byte segment and no ICMP: PMTUD black hole, fixed with an MSS clamp. The phone's packets arrived with DSCP 0: an untrusted access port. The web server received the SYN and did not answer: a missing default gateway. Each diagnosis took one table lookup from this chapter and no configuration was changed until the cause was proven.</p><p><b>Lesson:</b> the header tells you the fault; the device configuration only tells you how to fix it.</p></div>

<div class="iv"><p class="q">"Walk me through troubleshooting 'the app is slow' with a packet capture."</p><p>Capture on the client and server side. Check the handshake RTT for the network baseline. Look for retransmissions and duplicate ACKs (loss), Zero Window (slow receiver), long gaps before the first response byte (server time), small MSS or DF drops (MTU), and DSCP values (QoS). Name the fault, the evidence packet and the owner of the fix.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read headers in order: Ethernet, 802.1Q, ARP, IPv4, ICMP, then TCP or UDP.</li>
<li>Every abnormal value points to a specific, nameable fault; use the symptom table before touching a device.</li>
<li>Memorise the sizes (14, 4, 20, 8, 28, 20 to 60), the type values and the TCP flag bytes.</li>
<li>TTL, checksum and MAC change per hop; ports and IPs do not.</li>
<li>Overhead is real: 54 bytes per TCP segment, 949 Mbps goodput on 1 Gbps, and 97 kbps on the wire for a 64 kbps voice stream.</li>
</ul></div>
`,hi:`
<p>Capture padhta hua achha engineer chart padhte doctor jaisa hota hai: kuch vital signs, tay order mein padhe, kisi fancy test se pehle hi problem ki taraf ishaara kar dete hain. Yeh aakhri chapter module ki saari cheezein ek reference page mein pack karta hai, phir dikhata hai ki conversation kis order mein padhni hai aur har abnormal sign ka matlab kya hai.</p>

`+r(`Capture ko usi order mein padho jis order mein packet bana: link, address resolution, network, errors, phir transport.`,[`MAC, VLAN, FCS`,`request, reply?`,`TTL, DF, length`,`type aur code`,`flags, window`])+`

<h3>Checklist: kya aap yeh kar sakte ho?</h3>
<ul>
<li>Hex ko binary aur decimal mein badalna, aur network byte order mein field padhna (chapter 1).</li>
<li>MAC ko OUI, I/G aur U/L bits mein todna, aur frame sizes aur error counters ke naam batana (chapter 2).</li>
<li>Chaar bytes se 802.1Q tag decode karna aur native VLAN samjhana (chapter 3).</li>
<li>ARP request, reply aur gratuitous ARP padhna, aur har MAC type ke liye switch behaviour predict karna (chapter 4).</li>
<li>IPv4 header ko row by row check karna, DSCP, flags, TTL aur checksum ke saath (chapter 5).</li>
<li>Fragment offsets aur MSS values nikalna, aur PMTUD black hole samjhana (chapter 6).</li>
<li>Koi bhi ICMP type aur code fault se map karna, aur traceroute padhna (chapter 7).</li>
<li>TCP sequence numbers ko handshake, data, teardown, loss aur zero window ke through follow karna (chapter 8).</li>
<li>UDP decode karna, aur goodput aur voice bandwidth compute karna (chapter 9).</li>
</ul>

<h3>Ek-page field cheat sheet</h3>
`+i.replace(`<th>Layer</th><th>Field</th><th>Size</th><th>Normal</th><th>Abnormal means</th>`,`<th>Layer</th><th>Field</th><th>Size</th><th>Normal</th><th>Abnormal ka matlab</th>`)+`

<h3>Capture mein symptom se fault tak</h3>
`+a.replace(`<th>What you see in the capture</th><th>Most likely fault</th><th>Where to act</th>`,`<th>Capture mein kya dikha</th><th>Sabse mumkin fault</th><th>Kahan action lena hai</th>`)+`

<h3>Mini glossary</h3>
<dl class="terms">
<dt>OUI</dt><dd>MAC ke pehle 24 bits, jo IEEE manufacturer ko assign karta hai.</dd>
<dt>MTU / MSS</dt><dd>link jo sabse bada IP packet le jaata hai / ek segment mein sabse zyada TCP data (MTU minus 40).</dd>
<dt>PMTUD</dt><dd>path MTU discovery: DF packets plus ICMP 3/4 path ka sabse chhota MTU dhoondhte hain.</dd>
<dt>DSCP / PCP</dt><dd>Layer 3 aur Layer 2 priority markings (voice ke liye EF 46 aur CoS 5).</dd>
<dt>ISN</dt><dd>initial sequence number, har connection ke liye random; analysers ise 0 dikhate hain.</dd>
<dt>Goodput</dt><dd>saare header aur framing overhead ke baad application data rate.</dd>
</dl>

<div class="eg"><p><b>Worked example: ek ticket paanch reads mein triage.</b> "PC1 203.0.113.80 ka page nahi khol pa raha." (1) Layer 2: PC1 ke frames ka destination gateway ka MAC hai, normal. (2) ARP: PC1 ne gateway resolve kar liya. (3) IP: SYN ka TTL PC link par 64 aur server link par 63, DF set, protocol 6, yaani path aur routing kaam kar rahe hain. (4) ICMP: kuch wapas nahi aaya. (5) TCP: SYN server tak pahunchta hai, lekin koi SYN-ACK nahi nikalta. Server jawab nahi de sakta, jo bilkul ccna-models troubleshooting lab ka fault hai: SRV ka default gateway nahi tha, isliye woh apne subnet ke bahar ke host ko reply nahi bhej sakta tha. Paanch reads, ek fault, ise dhoondhne ke liye kisi device par login nahi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Layer 7 se shuru karke andaza lagana. Ek capture point par bharosa: shak wale device ke dono taraf capture karo aur TTL, checksum aur flags compare karo. Conversation ka pehla packet ignore karna, jo aksar poori kahani le jaata hai. Values ratna bina yeh jaane ki woh kis field ki hain.</p></div>

<div class="exam"><p><b>Exam traps, ek jagah.</b> Ethernet header 14, FCS 4, frame 64 se 1518, tagged 1522, MTU 1500. EtherType 0x0800, 0x0806, 0x86DD, 0x8100. IPv4 header 20 se 60 (IHL x 4); protocol 1, 6, 17, 89. TTL aur checksum har router par badalte hain, MAC addresses har hop par, IP addresses nahi (NAT ke bina). TCP header 20 se 60, UDP 8. ACK = agla expected byte; SYN aur FIN ek number khate hain. Port 80 TCP, 53 dono, 67 aur 68, 69, 123, 161, 162, 514 UDP. MTU 1500 ke liye default MSS 1460. ICMP: 0, 3, 5, 8, 11.</p></div>

<div class="scn"><h4>Teen captures, ek dopahar</h4><p>Ek Friday NOC ko teen tickets mile: ek branch jahan share slow tha, ek flaky phone aur ek unreachable web service. Branch ke trace mein handshake aur chhote packets guzar rahe the lekin 1,400-byte segment ka reply nahi aaya aur ICMP bhi nahi: PMTUD black hole, MSS clamp se fix. Phone ke packets DSCP 0 ke saath aa rahe the: untrusted access port. Web server ko SYN mila aur usne jawab nahi diya: default gateway missing. Har diagnosis is chapter ki ek table lookup se hua aur cause saabit hone se pehle koi configuration nahi badli.</p><p><b>Seekh:</b> header fault batata hai; device configuration sirf yeh batati hai ki use theek kaise karna hai.</p></div>

<div class="iv"><p class="q">"'App slow hai' ko packet capture se troubleshoot karne ka walkthrough do."</p><p>Client aur server dono taraf capture karo. Network baseline ke liye handshake RTT dekho. Retransmissions aur duplicate ACKs (loss), Zero Window (slow receiver), pehle response byte se pehle lamba gap (server time), chhota MSS ya DF drops (MTU) aur DSCP values (QoS) dekho. Fault ka naam, evidence packet aur fix ke owner batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Headers order mein padho: Ethernet, 802.1Q, ARP, IPv4, ICMP, phir TCP ya UDP.</li>
<li>Har abnormal value ek khaas, naam wale fault ki taraf ishaara karti hai; device chhone se pehle symptom table use karo.</li>
<li>Sizes (14, 4, 20, 8, 28, 20 se 60), type values aur TCP flag bytes yaad rakho.</li>
<li>TTL, checksum aur MAC har hop par badalte hain; ports aur IPs nahi.</li>
<li>Overhead asli hai: har TCP segment par 54 bytes, 1 Gbps par 949 Mbps goodput, aur 64 kbps voice stream ke liye wire par 97 kbps.</li>
</ul></div>
`}};export{o as default};