var e={id:`ipv4-header`,h:{en:`The IPv4 header, field by field`,hi:`IPv4 header, field by field`},body:{en:`
<p>If the Ethernet frame is the office's internal envelope, the IPv4 header is the courier waybill glued to the parcel. It holds the full sender and receiver addresses, a "handle with care" class, a note of what kind of item is inside, and a "return to sender after N hubs" counter so a parcel that gets lost in a loop does not travel forever. Every router reads this waybill, and only a few boxes on it are ever changed on the way.</p>

<h3>The layout: 20 bytes in five 32-bit rows</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="IPv4 header layout">
<text x="20" y="18" class="svg-muted" font-size="12">bit 0</text><text x="600" y="18" class="svg-muted" font-size="12">31</text>
<rect x="20" y="25" width="60" height="36" fill="#ddd6fe"/><text x="50" y="48" text-anchor="middle" class="svg-ink" font-size="12">Ver</text>
<rect x="80" y="25" width="60" height="36" fill="#ddd6fe"/><text x="110" y="48" text-anchor="middle" class="svg-ink" font-size="12">IHL</text>
<rect x="140" y="25" width="160" height="36" fill="#e2e8f0"/><text x="220" y="48" text-anchor="middle" class="svg-ink" font-size="12">DSCP / ECN</text>
<rect x="300" y="25" width="320" height="36" fill="#ddd6fe"/><text x="460" y="48" text-anchor="middle" class="svg-ink" font-size="12">Total Length</text>
<rect x="20" y="61" width="280" height="36" fill="#e2e8f0"/><text x="160" y="84" text-anchor="middle" class="svg-ink" font-size="12">Identification</text>
<rect x="300" y="61" width="60" height="36" fill="#e2e8f0"/><text x="330" y="84" text-anchor="middle" class="svg-ink" font-size="12">Flags</text>
<rect x="360" y="61" width="260" height="36" fill="#e2e8f0"/><text x="490" y="84" text-anchor="middle" class="svg-ink" font-size="12">Fragment Offset</text>
<rect x="20" y="97" width="140" height="36" fill="#fde68a"/><text x="90" y="120" text-anchor="middle" class="svg-ink" font-size="12">TTL</text>
<rect x="160" y="97" width="140" height="36" fill="#fde68a"/><text x="230" y="120" text-anchor="middle" class="svg-ink" font-size="12">Protocol</text>
<rect x="300" y="97" width="320" height="36" fill="#fde68a"/><text x="460" y="120" text-anchor="middle" class="svg-ink" font-size="12">Header Checksum</text>
<rect x="20" y="133" width="600" height="36" fill="#bbf7d0"/><text x="320" y="156" text-anchor="middle" class="svg-ink" font-size="12">Source IP address (32 bits)</text>
<rect x="20" y="169" width="600" height="36" fill="#bbf7d0"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="12">Destination IP address (32 bits)</text>
<text x="320" y="232" text-anchor="middle" class="svg-accent" font-size="12">Yellow row: TTL and checksum change at every router</text>
</svg><p class="cap">The fixed 20-byte IPv4 header. Options, rarely used, can extend it up to 60 bytes.</p></div>

<h3>Every field explained</h3>
<dl class="terms">
<dt>Version (4 bits)</dt><dd>4 for IPv4. IPv6 has its own, different header with value 6.</dd>
<dt>IHL, Internet Header Length (4 bits)</dt><dd>Header length in 32-bit words. The minimum 5 means 20 bytes; the maximum 15 means 60 bytes (with options).</dd>
<dt>DSCP and ECN (8 bits, formerly Type of Service)</dt><dd>6 bits of <b>DSCP</b> mark the packet's QoS class (for example <b>EF</b>, value 46, for voice), and 2 bits of ECN signal congestion without dropping.</dd>
<dt>Total Length (16 bits)</dt><dd>Header plus data in bytes, so at most 65,535. On Ethernet it is normally at most 1500.</dd>
<dt>Identification, Flags, Fragment Offset</dt><dd>Used for <b>fragmentation</b>. If a packet is bigger than the next link's MTU, a router may split it; every fragment carries the same Identification, the <b>MF</b> (more fragments) flag, and an offset in 8-byte units. The <b>DF</b> (don't fragment) flag forbids splitting; the router then drops the packet and sends ICMP "fragmentation needed" back, which is how <b>path MTU discovery</b> works. Most modern hosts set DF.</dd>
<dt>TTL, Time to Live (8 bits)</dt><dd>A hop counter. The sender sets it (Linux, macOS and our lab PCs use 64, Windows 128, Cisco IOS 255). Every router subtracts 1; a router that reduces it to 0 discards the packet and sends <b>ICMP Time Exceeded</b> (type 11) to the source. This kills packets caught in routing loops, and <b>traceroute</b> uses it deliberately.</dd>
<dt>Protocol (8 bits)</dt><dd>What is inside: 1 ICMP, 2 IGMP, 6 TCP, 17 UDP, 47 GRE, 50 ESP, 51 AH, 88 EIGRP, 89 OSPF, 112 VRRP.</dd>
<dt>Header Checksum (16 bits)</dt><dd>Protects the <b>header only</b>, not the data. Because TTL changes at every hop, every router must recalculate it.</dd>
<dt>Source and Destination address (32 bits each)</dt><dd>The end-to-end addresses. Routers forward on the destination; without NAT neither changes along the path.</dd>
</dl>

<h3>Reading the header in a capture</h3>
<p>Here is PC1's SYN from Lab 1, captured on the PC1-SW1 link, with the IPv4 layer expanded:</p>
<pre class="out">Internet Protocol Version 4, Src: 10.1.1.10, Dst: 203.0.113.80
    0100 .... = Version: 4
    .... 0101 = Header Length: 20 bytes (5)
    Differentiated Services Field: 0x00 (DSCP: CS0, ECN: Not-ECT)
    Total Length: 60
    Identification: 0x1c46 (7238)
    010. .... = Flags: 0x2, Don't fragment
    ...0 0000 0000 0000 = Fragment Offset: 0
    <span class="hl">Time to Live: 64</span>
    <span class="hl">Protocol: TCP (6)</span>
    Header Checksum: 0x9d2a [validation disabled]
    Source Address: 10.1.1.10
    Destination Address: 203.0.113.80</pre>

<div class="eg"><p><b>Worked example.</b> Total Length 60 = 20 bytes of IPv4 header + 40 bytes of TCP header (the SYN carries options and no data). The same packet captured on the R1-SRV link shows <b>Time to Live: 63</b> and a <b>different Header Checksum</b>, while source, destination, Identification, Protocol and Total Length are identical. The server's reply leaves with TTL 64 and arrives at PC1 with 63, which is why <code>ping 203.0.113.80</code> from PC1 shows <code>ttl=63</code>. From the TTL you can even guess the far end's OS and distance: a reply arriving with 117 probably started at 128 (Windows) and crossed 11 routers.</p></div>

<h3>ICMP: IP's messenger</h3>
<p>ICMP (Protocol 1) carries control messages about IP. You will meet: Echo Request (type 8) and Echo Reply (type 0) used by <b>ping</b>; Destination Unreachable (type 3), with codes such as 1 host unreachable, 3 port unreachable, 4 fragmentation needed, 13 administratively prohibited; and Time Exceeded (type 11) used by <b>traceroute</b>. Traceroute sends probes with TTL 1, 2, 3 and so on; each router that drops a probe at TTL 0 reveals itself with a Time Exceeded message.</p>

<div class="warn"><p><b>Common mistakes.</b> Thinking the IP checksum protects the data (TCP and UDP have their own checksums). Believing TTL is measured in seconds (historically intended, in practice a hop count). Blocking all ICMP on a firewall "for security": it breaks path MTU discovery and hides useful errors. Permit at least unreachables and Time Exceeded.</p></div>

<div class="exam"><p><b>Exam traps.</b> Minimum IPv4 header = 20 bytes. Protocol 6 = TCP, 17 = UDP, 1 = ICMP, 89 = OSPF. Fields a router changes on every hop: <b>TTL</b> and <b>Header Checksum</b> (plus fragmentation fields only if it fragments, and addresses only with NAT). DSCP is the QoS marking in the old ToS byte.</p></div>

<div class="scn"><h4>The loop that traceroute revealed</h4><p>A new remote subnet 198.51.100.0/24 was unreachable. <code>traceroute</code> from the core showed hop 1 as the edge router, hop 2 as the core, hop 3 as the edge again, alternating until 30 hops. Each router had a static route pointing at the other for that prefix, so packets bounced until TTL reached 0 and ICMP Time Exceeded came back. The engineer corrected the edge router's static route to point at the WAN next hop, and the trace completed in three hops.</p><p><b>Lesson:</b> TTL is the internet's safety fuse. When a trace alternates between two routers, you have a routing loop, and TTL expiry is what stopped it from melting the link.</p></div>

<div class="iv"><p class="q">"Which fields of the IPv4 header change as a packet crosses a router, and why?"</p><p>Answer: TTL decreases by one to stop loops, so the header checksum must be recalculated. Source and destination IP stay the same unless NAT is used; the Ethernet header is completely rebuilt (that is Layer 2, not IP). Mention fragmentation fields change only if the router fragments, which is rare because hosts set DF and use path MTU discovery.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv4 header: 20 bytes minimum; Version, IHL, DSCP/ECN, Total Length, ID/Flags/Offset, TTL, Protocol, Checksum, Source, Destination.</li>
<li>TTL drops by 1 per router; at 0 the packet dies and ICMP Time Exceeded goes back.</li>
<li>Protocol field: 1 ICMP, 6 TCP, 17 UDP, 89 OSPF.</li>
<li>Header checksum covers only the header and is recalculated at every hop.</li>
<li>DF plus ICMP "fragmentation needed" = path MTU discovery; do not block all ICMP.</li>
</ul></div>
`,hi:`
<p>Agar Ethernet frame office ka internal envelope hai, to IPv4 header parcel par chipka courier waybill hai. Isme poore sender aur receiver addresses hote hain, ek "dhyan se sambhalo" class, andar kis tarah ka item hai uska note, aur ek "N hubs ke baad sender ko wapas karo" counter taaki loop mein khoya parcel hamesha ghoomta na rahe. Har router yeh waybill padhta hai, aur raaste mein iske sirf kuch box hi kabhi badalte hain.</p>

<h3>Layout: paanch 32-bit rows mein 20 bytes</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="IPv4 header layout">
<text x="20" y="18" class="svg-muted" font-size="12">bit 0</text><text x="600" y="18" class="svg-muted" font-size="12">31</text>
<rect x="20" y="25" width="60" height="36" fill="#ddd6fe"/><text x="50" y="48" text-anchor="middle" class="svg-ink" font-size="12">Ver</text>
<rect x="80" y="25" width="60" height="36" fill="#ddd6fe"/><text x="110" y="48" text-anchor="middle" class="svg-ink" font-size="12">IHL</text>
<rect x="140" y="25" width="160" height="36" fill="#e2e8f0"/><text x="220" y="48" text-anchor="middle" class="svg-ink" font-size="12">DSCP / ECN</text>
<rect x="300" y="25" width="320" height="36" fill="#ddd6fe"/><text x="460" y="48" text-anchor="middle" class="svg-ink" font-size="12">Total Length</text>
<rect x="20" y="61" width="280" height="36" fill="#e2e8f0"/><text x="160" y="84" text-anchor="middle" class="svg-ink" font-size="12">Identification</text>
<rect x="300" y="61" width="60" height="36" fill="#e2e8f0"/><text x="330" y="84" text-anchor="middle" class="svg-ink" font-size="12">Flags</text>
<rect x="360" y="61" width="260" height="36" fill="#e2e8f0"/><text x="490" y="84" text-anchor="middle" class="svg-ink" font-size="12">Fragment Offset</text>
<rect x="20" y="97" width="140" height="36" fill="#fde68a"/><text x="90" y="120" text-anchor="middle" class="svg-ink" font-size="12">TTL</text>
<rect x="160" y="97" width="140" height="36" fill="#fde68a"/><text x="230" y="120" text-anchor="middle" class="svg-ink" font-size="12">Protocol</text>
<rect x="300" y="97" width="320" height="36" fill="#fde68a"/><text x="460" y="120" text-anchor="middle" class="svg-ink" font-size="12">Header Checksum</text>
<rect x="20" y="133" width="600" height="36" fill="#bbf7d0"/><text x="320" y="156" text-anchor="middle" class="svg-ink" font-size="12">Source IP address (32 bits)</text>
<rect x="20" y="169" width="600" height="36" fill="#bbf7d0"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="12">Destination IP address (32 bits)</text>
<text x="320" y="232" text-anchor="middle" class="svg-accent" font-size="12">Peeli row: TTL aur checksum har router par badalte hain</text>
</svg><p class="cap">Fixed 20-byte IPv4 header. Options, jo kam use hote hain, ise 60 bytes tak badha sakte hain.</p></div>

<h3>Har field samjho</h3>
<dl class="terms">
<dt>Version (4 bits)</dt><dd>IPv4 ke liye 4. IPv6 ka apna alag header hai jiski value 6 hai.</dd>
<dt>IHL, Internet Header Length (4 bits)</dt><dd>Header length 32-bit words mein. Minimum 5 matlab 20 bytes; maximum 15 matlab 60 bytes (options ke saath).</dd>
<dt>DSCP aur ECN (8 bits, pehle Type of Service)</dt><dd>6 bits ka <b>DSCP</b> packet ki QoS class mark karta hai (jaise voice ke liye <b>EF</b>, value 46), aur 2 bits ka ECN bina drop kiye congestion signal karta hai.</dd>
<dt>Total Length (16 bits)</dt><dd>Header plus data bytes mein, isliye maximum 65,535. Ethernet par normally maximum 1500.</dd>
<dt>Identification, Flags, Fragment Offset</dt><dd><b>Fragmentation</b> ke liye use hote hain. Agar packet agle link ke MTU se bada ho, to router use tod sakta hai; har fragment mein same Identification, <b>MF</b> (more fragments) flag, aur 8-byte units mein offset hota hai. <b>DF</b> (don't fragment) flag todna mana karta hai; tab router packet drop karta hai aur ICMP "fragmentation needed" wapas bhejta hai, aur <b>path MTU discovery</b> aise hi kaam karti hai. Zyada tar modern hosts DF set karte hain.</dd>
<dt>TTL, Time to Live (8 bits)</dt><dd>Ek hop counter. Sender ise set karta hai (Linux, macOS aur hamare lab PCs 64, Windows 128, Cisco IOS 255 use karte hain). Har router 1 ghatata hai; jo router ise 0 kar deta hai woh packet discard karta hai aur source ko <b>ICMP Time Exceeded</b> (type 11) bhejta hai. Isse routing loops mein phanse packets khatam hote hain, aur <b>traceroute</b> ise jaan boojh kar use karta hai.</dd>
<dt>Protocol (8 bits)</dt><dd>Andar kya hai: 1 ICMP, 2 IGMP, 6 TCP, 17 UDP, 47 GRE, 50 ESP, 51 AH, 88 EIGRP, 89 OSPF, 112 VRRP.</dd>
<dt>Header Checksum (16 bits)</dt><dd><b>Sirf header</b> ko protect karta hai, data ko nahi. Kyunki TTL har hop par badalta hai, har router ko ise dobara nikalna padta hai.</dd>
<dt>Source aur Destination address (har ek 32 bits)</dt><dd>End-to-end addresses. Routers destination par forward karte hain; NAT ke bina path mein dono mein se koi nahi badalta.</dd>
</dl>

<h3>Capture mein header padhna</h3>
<p>Yeh Lab 1 se PC1 ka SYN hai, PC1-SW1 link par capture kiya gaya, IPv4 layer expand karke:</p>
<pre class="out">Internet Protocol Version 4, Src: 10.1.1.10, Dst: 203.0.113.80
    0100 .... = Version: 4
    .... 0101 = Header Length: 20 bytes (5)
    Differentiated Services Field: 0x00 (DSCP: CS0, ECN: Not-ECT)
    Total Length: 60
    Identification: 0x1c46 (7238)
    010. .... = Flags: 0x2, Don't fragment
    ...0 0000 0000 0000 = Fragment Offset: 0
    <span class="hl">Time to Live: 64</span>
    <span class="hl">Protocol: TCP (6)</span>
    Header Checksum: 0x9d2a [validation disabled]
    Source Address: 10.1.1.10
    Destination Address: 203.0.113.80</pre>

<div class="eg"><p><b>Worked example.</b> Total Length 60 = 20 bytes IPv4 header + 40 bytes TCP header (SYN mein options hain aur koi data nahi). Wahi packet R1-SRV link par capture karo to <b>Time to Live: 63</b> aur <b>alag Header Checksum</b> dikhta hai, jabki source, destination, Identification, Protocol aur Total Length bilkul same hain. Server ka reply TTL 64 ke saath nikalta hai aur PC1 par 63 ke saath pahunchta hai, isiliye PC1 se <code>ping 203.0.113.80</code> <code>ttl=63</code> dikhata hai. TTL se aap doosre end ka OS aur doori bhi andaza laga sakte ho: 117 ke saath aaya reply shayad 128 (Windows) se shuru hua aur 11 routers paar kiye.</p></div>

<h3>ICMP: IP ka messenger</h3>
<p>ICMP (Protocol 1) IP ke baare mein control messages le jaata hai. Aapko milenge: Echo Request (type 8) aur Echo Reply (type 0) jo <b>ping</b> use karta hai; Destination Unreachable (type 3), codes ke saath jaise 1 host unreachable, 3 port unreachable, 4 fragmentation needed, 13 administratively prohibited; aur Time Exceeded (type 11) jo <b>traceroute</b> use karta hai. Traceroute TTL 1, 2, 3 wagairah ke saath probes bhejta hai; har router jo TTL 0 par probe drop karta hai, Time Exceeded message se apni pehchaan bata deta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Sochna ki IP checksum data ko protect karta hai (TCP aur UDP ke apne checksums hain). Maanna ki TTL seconds mein naapa jaata hai (itihaas mein aisa socha gaya tha, practice mein hop count hai). Firewall par "security ke liye" saara ICMP block karna: isse path MTU discovery tootti hai aur useful errors chhup jaate hain. Kam se kam unreachables aur Time Exceeded permit karo.</p></div>

<div class="exam"><p><b>Exam traps.</b> Minimum IPv4 header = 20 bytes. Protocol 6 = TCP, 17 = UDP, 1 = ICMP, 89 = OSPF. Router har hop par jo fields badalta hai: <b>TTL</b> aur <b>Header Checksum</b> (fragmentation fields sirf tab jab woh fragment kare, aur addresses sirf NAT ke saath). DSCP purane ToS byte mein QoS marking hai.</p></div>

<div class="scn"><h4>Loop jo traceroute ne pakda</h4><p>Ek naya remote subnet 198.51.100.0/24 unreachable tha. Core se <code>traceroute</code> ne hop 1 par edge router, hop 2 par core, hop 3 par phir edge dikhaya, 30 hops tak baari baari. Har router ke paas us prefix ke liye doosre ki taraf point karta static route tha, isliye packets tab tak uchhalte rahe jab tak TTL 0 nahi hua aur ICMP Time Exceeded wapas nahi aaya. Engineer ne edge router ka static route WAN next hop ki taraf theek kiya, aur trace teen hops mein poora hua.</p><p><b>Seekh:</b> TTL internet ka safety fuse hai. Jab trace do routers ke beech baari baari chale, to aapke paas routing loop hai, aur TTL expiry hi woh cheez hai jisne link ko pighalne se roka.</p></div>

<div class="iv"><p class="q">"Router paar karte hue IPv4 header ke kaunse fields badalte hain, aur kyun?"</p><p>Jawab: loops rokne ke liye TTL ek kam hota hai, isliye header checksum dobara nikalna padta hai. Source aur destination IP wahi rehte hain jab tak NAT use na ho; Ethernet header poora dobara banta hai (woh Layer 2 hai, IP nahi). Mention karo ki fragmentation fields sirf tab badalte hain jab router fragment kare, jo kam hota hai kyunki hosts DF set karte hain aur path MTU discovery use karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv4 header: minimum 20 bytes; Version, IHL, DSCP/ECN, Total Length, ID/Flags/Offset, TTL, Protocol, Checksum, Source, Destination.</li>
<li>TTL har router par 1 ghat-ta hai; 0 par packet khatam aur ICMP Time Exceeded wapas jaata hai.</li>
<li>Protocol field: 1 ICMP, 6 TCP, 17 UDP, 89 OSPF.</li>
<li>Header checksum sirf header cover karta hai aur har hop par dobara nikalta hai.</li>
<li>DF plus ICMP "fragmentation needed" = path MTU discovery; saara ICMP block mat karo.</li>
</ul></div>
`}};export{e as default};