var e={id:`encap`,h:{en:`Encapsulation and decapsulation`,hi:`Encapsulation aur decapsulation`},body:{en:`
<p>Think of a gift inside a box, inside a padded envelope, inside a courier bag. Whoever packs it adds one layer at a time, starting from the gift. Whoever receives it removes one layer at a time, starting from the outside, and each wrapper has a label that tells you what is inside the next one. That packing is <b>encapsulation</b>; the unpacking is <b>decapsulation</b> (also called de-encapsulation).</p>

<h3>Encapsulation on the sender, step by step</h3>
<p>Follow PC1 as it sends "GET /" to SRV in Lab 1:</p>
<ol>
<li><b>Application.</b> The web client creates the request text: <code>GET / HTTP/1.1</code>, <code>Host: 203.0.113.80</code>. This is the <b>data</b>.</li>
<li><b>Transport.</b> TCP adds a header of at least 20 bytes: source port (a random high port such as 49875), destination port 80, sequence and acknowledgement numbers, flags, window. Data plus TCP header = a <b>segment</b>.</li>
<li><b>Internet.</b> IP adds a 20-byte header: source 10.1.1.10, destination 203.0.113.80, TTL 64, and <b>Protocol = 6</b> to say "a TCP segment is inside". Segment plus IP header = a <b>packet</b>.</li>
<li><b>Link.</b> Ethernet adds a 14-byte header (destination MAC, source MAC, <b>EtherType 0x0800</b> meaning "IPv4 inside") and a 4-byte trailer, the <b>FCS</b>. Packet plus header and trailer = a <b>frame</b>.</li>
<li><b>Physical.</b> The NIC sends the frame as <b>bits</b>, preceded by a preamble so the receiver can lock on to the signal.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Encapsulation nesting">
<rect x="380" y="15" width="200" height="34" rx="6" fill="#fde68a"/><text x="480" y="37" text-anchor="middle" class="svg-ink" font-size="13">Data: GET /</text>
<rect x="300" y="65" width="80" height="34" rx="6" fill="#fed7aa"/><text x="340" y="87" text-anchor="middle" class="svg-ink" font-size="12">TCP 20+</text>
<rect x="380" y="65" width="200" height="34" rx="6" fill="#fde68a"/><text x="480" y="87" text-anchor="middle" class="svg-ink" font-size="13">Data</text>
<text x="600" y="87" class="svg-accent" font-size="12">Segment</text>
<rect x="220" y="115" width="80" height="34" rx="6" fill="#ddd6fe"/><text x="260" y="137" text-anchor="middle" class="svg-ink" font-size="12">IPv4 20</text>
<rect x="300" y="115" width="280" height="34" rx="6" fill="#fed7aa"/><text x="440" y="137" text-anchor="middle" class="svg-ink" font-size="13">Segment</text>
<text x="600" y="137" class="svg-accent" font-size="12">Packet</text>
<rect x="140" y="165" width="80" height="34" rx="6" fill="#bae6fd"/><text x="180" y="187" text-anchor="middle" class="svg-ink" font-size="12">Eth 14</text>
<rect x="220" y="165" width="300" height="34" rx="6" fill="#ddd6fe"/><text x="370" y="187" text-anchor="middle" class="svg-ink" font-size="13">Packet</text>
<rect x="520" y="165" width="60" height="34" rx="6" fill="#bae6fd"/><text x="550" y="187" text-anchor="middle" class="svg-ink" font-size="12">FCS 4</text>
<text x="600" y="187" class="svg-accent" font-size="12">Frame</text>
<text x="20" y="237" class="svg-muted" font-size="12">Each header's type field names the next one: EtherType 0x0800 to IPv4, Protocol 6 to TCP, port 80 to the web server</text>
</svg><p class="cap">Each layer treats everything from above as its payload and adds its own header (and, for Ethernet, a trailer).</p></div>

<h3>The chain of "what is inside" fields</h3>
<p>A receiver only knows how to read the next header because the current header tells it. This chain is worth memorising:</p>
<table class="cmp"><tr><th>Header</th><th>Field</th><th>Common values</th></tr>
<tr><td>Ethernet</td><td>EtherType</td><td>0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6, 0x8100 802.1Q tag</td></tr>
<tr><td>IPv4</td><td>Protocol (IPv6: Next Header)</td><td>1 ICMP, 6 TCP, 17 UDP, 47 GRE, 50 ESP, 89 OSPF</td></tr>
<tr><td>TCP / UDP</td><td>Destination port</td><td>22 SSH, 53 DNS, 80 HTTP, 443 HTTPS</td></tr>
</table>

<h3>Decapsulation on the receiver</h3>
<ol>
<li>SRV's NIC receives the bits, checks the <b>FCS</b> (a corrupted frame is silently dropped) and checks that the destination MAC is its own, a broadcast, or a multicast it has joined.</li>
<li>It reads <b>EtherType 0x0800</b> and hands the payload to IPv4.</li>
<li>IPv4 checks the header checksum and that the destination IP 203.0.113.80 is its own, then reads <b>Protocol 6</b> and hands the payload to TCP.</li>
<li>TCP checks its checksum, finds the connection by the four values source IP, source port, destination IP, destination port, and delivers the data to the process listening on <b>port 80</b>.</li>
<li>The web server reads "GET /" and builds a reply, which is encapsulated the same way in the other direction.</li>
</ol>

<div class="eg"><p><b>Worked example: overhead in numbers.</b> Ethernet's standard <b>MTU</b> (maximum transmission unit, the largest packet the link carries) is <b>1500 bytes</b>. Take away 20 bytes of IPv4 header and 20 bytes of TCP header and 1460 bytes remain for data; that is the typical <b>TCP MSS</b> (maximum segment size) announced in the SYN. The frame is 14 + 1500 + 4 = <b>1518 bytes</b>. On the wire, 8 bytes of preamble and SFD and a 12-byte inter-frame gap are also spent, so 1460 useful bytes cost 1538 byte-times: about 95% efficiency.</p></div>

<h3>What a capture shows</h3>
<p>A packet analyser displays the layers exactly in encapsulation order, one line per header. Here is PC1's SYN from Lab 1:</p>
<pre class="out">Frame 4: 74 bytes on wire (592 bits), 74 bytes captured (592 bits)
Ethernet II, Src: 52:54:00:a1:00:10, Dst: 52:54:0c:04:4b:01
    <span class="hl">Type: IPv4 (0x0800)</span>
Internet Protocol Version 4, Src: 10.1.1.10, Dst: 203.0.113.80
    Time to Live: 64
    <span class="hl">Protocol: TCP (6)</span>
Transmission Control Protocol, Src Port: 49875, Dst Port: 80, Seq: 0, Len: 0</pre>
<p>74 bytes = 14 (Ethernet) + 20 (IPv4) + 40 (TCP header with options such as MSS; no data yet). The analyser does not show the FCS by default because most NICs strip it before the capture software sees the frame.</p>

<div class="warn"><p><b>Common mistakes.</b> Thinking the FCS is part of the IP packet (it belongs to the Ethernet frame). Thinking a router keeps the original frame: it throws the Ethernet header and FCS away and builds a new frame for the next link (chapter 7). Forgetting that tunnels and VPNs add more headers, so the inner packet must be smaller than 1500 bytes.</p></div>

<div class="exam"><p><b>Exam traps.</b> Order of encapsulation: data, segment, packet, frame, bits. Only Layer 2 adds a <b>trailer</b>. "Which field identifies the Layer 4 protocol?" is the IP <b>Protocol</b> field, not the port.</p></div>

<div class="scn"><h4>Web pages hang over the new VPN</h4><p>After a branch moved to an IPsec VPN, small pages loaded but large pages and file downloads hung. Ping with small packets worked. The engineer realised the tunnel adds its own headers (ESP and a new IP header, around 50 to 70 bytes), so full 1500-byte packets from the branch no longer fitted the 1500-byte internet link, and the servers' "fragmentation needed" ICMP messages were blocked on the way back. The fix was to clamp TCP MSS on the branch LAN interface so hosts send smaller segments: <code>ip tcp adjust-mss 1360</code>.</p><p><b>Lesson:</b> every extra layer of encapsulation costs bytes. When "small works, big hangs", suspect MTU and overhead.</p></div>

<div class="iv"><p class="q">"Explain encapsulation using a web request."</p><p>Walk down the stack: HTTP data, TCP adds ports and sequence numbers (segment), IP adds source and destination IP, TTL and Protocol 6 (packet), Ethernet adds MACs, EtherType 0x0800 and FCS (frame), then bits. Then reverse it for decapsulation and mention the type-field chain. Strong candidates add the MTU/MSS arithmetic: 1500 minus 40 = 1460.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Encapsulation: data, then segment (TCP header), packet (IP header), frame (Ethernet header and FCS), bits.</li>
<li>Decapsulation reverses it, checking FCS, MAC, IP and port at each step.</li>
<li>Type fields chain the layers: EtherType, then IP Protocol, then port.</li>
<li>MTU 1500, MSS 1460, Ethernet frame up to 1518 bytes (1522 with an 802.1Q tag).</li>
<li>Tunnels add headers; "small works, big hangs" means MTU trouble.</li>
</ul></div>
`,hi:`
<p>Ek gift socho jo ek box ke andar hai, jo ek padded envelope ke andar hai, jo ek courier bag ke andar hai. Jo pack karta hai woh ek ek layer jodta hai, gift se shuru karke. Jo receive karta hai woh ek ek layer hatata hai, bahar se shuru karke, aur har wrapper par ek label hai jo batata hai ki agle wrapper ke andar kya hai. Yeh packing <b>encapsulation</b> hai; unpacking <b>decapsulation</b> hai (ise de-encapsulation bhi kehte hain).</p>

<h3>Sender par encapsulation, step by step</h3>
<p>Lab 1 mein PC1 ko follow karo jab woh SRV ko "GET /" bhejta hai:</p>
<ol>
<li><b>Application.</b> Web client request text banata hai: <code>GET / HTTP/1.1</code>, <code>Host: 203.0.113.80</code>. Yeh <b>data</b> hai.</li>
<li><b>Transport.</b> TCP kam se kam 20 bytes ka header jodta hai: source port (49875 jaisa random high port), destination port 80, sequence aur acknowledgement numbers, flags, window. Data plus TCP header = <b>segment</b>.</li>
<li><b>Internet.</b> IP 20-byte header jodta hai: source 10.1.1.10, destination 203.0.113.80, TTL 64, aur <b>Protocol = 6</b> yeh batane ke liye ki "andar TCP segment hai". Segment plus IP header = <b>packet</b>.</li>
<li><b>Link.</b> Ethernet 14-byte header (destination MAC, source MAC, <b>EtherType 0x0800</b> yaani "andar IPv4") aur 4-byte trailer, <b>FCS</b>, jodta hai. Packet plus header aur trailer = <b>frame</b>.</li>
<li><b>Physical.</b> NIC frame ko <b>bits</b> ki tarah bhejta hai, pehle ek preamble ke saath taaki receiver signal par lock ho sake.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Encapsulation nesting">
<rect x="380" y="15" width="200" height="34" rx="6" fill="#fde68a"/><text x="480" y="37" text-anchor="middle" class="svg-ink" font-size="13">Data: GET /</text>
<rect x="300" y="65" width="80" height="34" rx="6" fill="#fed7aa"/><text x="340" y="87" text-anchor="middle" class="svg-ink" font-size="12">TCP 20+</text>
<rect x="380" y="65" width="200" height="34" rx="6" fill="#fde68a"/><text x="480" y="87" text-anchor="middle" class="svg-ink" font-size="13">Data</text>
<text x="600" y="87" class="svg-accent" font-size="12">Segment</text>
<rect x="220" y="115" width="80" height="34" rx="6" fill="#ddd6fe"/><text x="260" y="137" text-anchor="middle" class="svg-ink" font-size="12">IPv4 20</text>
<rect x="300" y="115" width="280" height="34" rx="6" fill="#fed7aa"/><text x="440" y="137" text-anchor="middle" class="svg-ink" font-size="13">Segment</text>
<text x="600" y="137" class="svg-accent" font-size="12">Packet</text>
<rect x="140" y="165" width="80" height="34" rx="6" fill="#bae6fd"/><text x="180" y="187" text-anchor="middle" class="svg-ink" font-size="12">Eth 14</text>
<rect x="220" y="165" width="300" height="34" rx="6" fill="#ddd6fe"/><text x="370" y="187" text-anchor="middle" class="svg-ink" font-size="13">Packet</text>
<rect x="520" y="165" width="60" height="34" rx="6" fill="#bae6fd"/><text x="550" y="187" text-anchor="middle" class="svg-ink" font-size="12">FCS 4</text>
<text x="600" y="187" class="svg-accent" font-size="12">Frame</text>
<text x="20" y="237" class="svg-muted" font-size="12">Har header ka type field agle ka naam batata hai: EtherType 0x0800 se IPv4, Protocol 6 se TCP, port 80 se web server</text>
</svg><p class="cap">Har layer upar se aayi har cheez ko apna payload maanti hai aur apna header jodti hai (aur Ethernet ke case mein ek trailer bhi).</p></div>

<h3>"Andar kya hai" fields ki chain</h3>
<p>Receiver agla header padhna tabhi jaanta hai jab current header use batata hai. Yeh chain yaad karne laayak hai:</p>
<table class="cmp"><tr><th>Header</th><th>Field</th><th>Common values</th></tr>
<tr><td>Ethernet</td><td>EtherType</td><td>0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6, 0x8100 802.1Q tag</td></tr>
<tr><td>IPv4</td><td>Protocol (IPv6: Next Header)</td><td>1 ICMP, 6 TCP, 17 UDP, 47 GRE, 50 ESP, 89 OSPF</td></tr>
<tr><td>TCP / UDP</td><td>Destination port</td><td>22 SSH, 53 DNS, 80 HTTP, 443 HTTPS</td></tr>
</table>

<h3>Receiver par decapsulation</h3>
<ol>
<li>SRV ka NIC bits receive karta hai, <b>FCS</b> check karta hai (corrupt frame chupchaap drop ho jaata hai) aur check karta hai ki destination MAC uska apna hai, broadcast hai, ya koi multicast hai jo usne join kiya hai.</li>
<li>Woh <b>EtherType 0x0800</b> padhta hai aur payload IPv4 ko de deta hai.</li>
<li>IPv4 header checksum check karta hai aur ki destination IP 203.0.113.80 uska apna hai, phir <b>Protocol 6</b> padhta hai aur payload TCP ko deta hai.</li>
<li>TCP apna checksum check karta hai, chaar values (source IP, source port, destination IP, destination port) se connection dhoondhta hai, aur data <b>port 80</b> par listen kar rahe process ko deliver karta hai.</li>
<li>Web server "GET /" padhta hai aur reply banata hai, jo dusri direction mein isi tarah encapsulate hota hai.</li>
</ol>

<div class="eg"><p><b>Worked example: numbers mein overhead.</b> Ethernet ka standard <b>MTU</b> (maximum transmission unit, sabse bada packet jo link le jaata hai) <b>1500 bytes</b> hai. 20 bytes IPv4 header aur 20 bytes TCP header ghatao to data ke liye 1460 bytes bachte hain; yahi typical <b>TCP MSS</b> (maximum segment size) hai jo SYN mein announce hota hai. Frame 14 + 1500 + 4 = <b>1518 bytes</b> ka hota hai. Wire par 8 bytes preamble aur SFD aur 12-byte inter-frame gap bhi kharch hote hain, isliye 1460 useful bytes ki keemat 1538 byte-times hai: lagbhag 95% efficiency.</p></div>

<h3>Capture kya dikhata hai</h3>
<p>Packet analyser layers ko bilkul encapsulation ke order mein dikhata hai, har header ki ek line. Yeh Lab 1 se PC1 ka SYN hai:</p>
<pre class="out">Frame 4: 74 bytes on wire (592 bits), 74 bytes captured (592 bits)
Ethernet II, Src: 52:54:00:a1:00:10, Dst: 52:54:0c:04:4b:01
    <span class="hl">Type: IPv4 (0x0800)</span>
Internet Protocol Version 4, Src: 10.1.1.10, Dst: 203.0.113.80
    Time to Live: 64
    <span class="hl">Protocol: TCP (6)</span>
Transmission Control Protocol, Src Port: 49875, Dst Port: 80, Seq: 0, Len: 0</pre>
<p>74 bytes = 14 (Ethernet) + 20 (IPv4) + 40 (MSS jaise options wala TCP header; abhi koi data nahi). Analyser default mein FCS nahi dikhata kyunki zyada tar NICs capture software ke frame dekhne se pehle hi use hata dete hain.</p>

<div class="warn"><p><b>Common galtiyan.</b> Sochna ki FCS IP packet ka hissa hai (woh Ethernet frame ka hai). Sochna ki router original frame rakhta hai: woh Ethernet header aur FCS phenk deta hai aur agle link ke liye naya frame banata hai (chapter 7). Bhool jaana ki tunnels aur VPNs aur headers jodte hain, isliye andar wala packet 1500 bytes se chhota hona chahiye.</p></div>

<div class="exam"><p><b>Exam traps.</b> Encapsulation ka order: data, segment, packet, frame, bits. Sirf Layer 2 <b>trailer</b> jodti hai. "Kaunsa field Layer 4 protocol identify karta hai?" iska jawab IP ka <b>Protocol</b> field hai, port nahi.</p></div>

<div class="scn"><h4>Naye VPN par web pages atak jaate hain</h4><p>Ek branch IPsec VPN par shift hui, uske baad chhote pages load ho rahe the lekin bade pages aur file downloads atak jaate the. Chhote packets se ping chal raha tha. Engineer ko samajh aaya ki tunnel apne headers jodta hai (ESP aur ek naya IP header, lagbhag 50 se 70 bytes), isliye branch ke poore 1500-byte packets ab 1500-byte internet link mein fit nahi hote the, aur servers ke "fragmentation needed" ICMP messages wapas aate hue block ho rahe the. Fix tha branch LAN interface par TCP MSS clamp karna taaki hosts chhote segments bhejein: <code>ip tcp adjust-mss 1360</code>.</p><p><b>Seekh:</b> encapsulation ki har extra layer bytes kharch karti hai. Jab "chhota chalta hai, bada atakta hai", to MTU aur overhead par shak karo.</p></div>

<div class="iv"><p class="q">"Web request ka use karke encapsulation samjhao."</p><p>Stack mein neeche jao: HTTP data, TCP ports aur sequence numbers jodta hai (segment), IP source aur destination IP, TTL aur Protocol 6 jodta hai (packet), Ethernet MACs, EtherType 0x0800 aur FCS jodta hai (frame), phir bits. Phir decapsulation ke liye ulta chalao aur type-field chain mention karo. Strong candidates MTU/MSS ka hisaab bhi jodte hain: 1500 minus 40 = 1460.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Encapsulation: data, phir segment (TCP header), packet (IP header), frame (Ethernet header aur FCS), bits.</li>
<li>Decapsulation ise ulta karta hai, har step par FCS, MAC, IP aur port check karta hai.</li>
<li>Type fields layers ko jodte hain: EtherType, phir IP Protocol, phir port.</li>
<li>MTU 1500, MSS 1460, Ethernet frame 1518 bytes tak (802.1Q tag ke saath 1522).</li>
<li>Tunnels headers jodte hain; "chhota chalta hai, bada atakta hai" matlab MTU ki problem.</li>
</ul></div>
`}};export{e as default};