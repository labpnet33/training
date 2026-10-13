var e={id:`encapsulation`,h:{en:`Encapsulation: how the wrapper is built (GRE versus IP-IP)`,hi:`Encapsulation: wrapper kaise banta hai (GRE banaam IP-IP)`},body:{en:`
<p>Before typing any configuration, you need a clear picture of what a tunnel router does to every packet. The words are simple: <b>encapsulation</b> means adding a new header in front; <b>decapsulation</b> means removing it at the far end. Everything else in this module (MTU, keepalives, recursive routing) follows from this one idea.</p>

<h3>Step by step: one packet through a tunnel</h3>
<ol>
<li>PC1 (192.168.61.10) sends a packet to PC3 (192.168.63.10). R1 receives it on its LAN port.</li>
<li>R1 looks up 192.168.63.0/24 in its routing table. The best route points out of the tunnel interface, for example <code>gr-0/0/0.0</code>.</li>
<li>R1 <b>encapsulates</b>: it adds an outer IP header with source 203.0.113.1 (tunnel source) and destination 203.0.113.9 (tunnel destination), and for GRE a 4-byte GRE header in between.</li>
<li>R1 now looks up the <i>outer destination</i> 203.0.113.9 in the routing table. This is a second, separate lookup. It uses the underlay route, here a static default to the ISP.</li>
<li>The ISP forwards on the outer header only. R3 receives a packet addressed to its own WAN address, sees the protocol number, and hands it to the tunnel process.</li>
<li>R3 <b>decapsulates</b>, removes the outer header, and routes the original packet to PC3.</li>
</ol>
<p>Notice the two lookups: one for the inner destination (which selects the tunnel) and one for the outer destination (which must <b>not</b> select the tunnel). Chapter 8 shows what happens when the second lookup goes wrong.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="GRE and IP-IP packet layout">
<text x="20" y="22" class="svg-ink" font-size="13">GRE packet (protocol 47)</text>
<rect x="20" y="32" width="150" height="40" rx="4" fill="#fde68a"/><text x="95" y="57" text-anchor="middle" class="svg-ink" font-size="12">Outer IP  20 B</text>
<rect x="170" y="32" width="90" height="40" rx="4" fill="#fed7aa"/><text x="215" y="57" text-anchor="middle" class="svg-ink" font-size="12">GRE  4 B</text>
<rect x="260" y="32" width="250" height="40" rx="4" fill="#bae6fd"/><text x="385" y="57" text-anchor="middle" class="svg-ink" font-size="12">Passenger IP packet (up to 1476 B)</text>
<text x="20" y="112" class="svg-ink" font-size="13">IP-IP packet (protocol 4)</text>
<rect x="20" y="122" width="150" height="40" rx="4" fill="#fde68a"/><text x="95" y="147" text-anchor="middle" class="svg-ink" font-size="12">Outer IP  20 B</text>
<rect x="170" y="122" width="340" height="40" rx="4" fill="#bae6fd"/><text x="340" y="147" text-anchor="middle" class="svg-ink" font-size="12">Passenger IPv4 packet (up to 1480 B)</text>
<text x="20" y="200" class="svg-muted" font-size="12">Both fit inside a 1500-byte underlay MTU. IP-IP wastes 4 bytes less.</text>
</svg><p class="cap">The outer IP header is the same in both. GRE adds a small header carrying a protocol type.</p></div>

<h3>GRE versus IP-IP in detail</h3>
<table class="cmp"><tr><th></th><th>GRE (gr-0/0/0)</th><th>IP-IP (ip-0/0/0)</th></tr>
<tr><td>Outer IP protocol number</td><td>47</td><td>4</td></tr>
<tr><td>Overhead</td><td>20 + 4 = 24 bytes (more if optional key, checksum or sequence fields are used)</td><td>20 bytes</td></tr>
<tr><td>Passenger</td><td>IPv4, IPv6, MPLS and more, selected by the GRE protocol-type field</td><td>IPv4 only</td></tr>
<tr><td>Optional features</td><td>key, keepalives (OAM)</td><td>none</td></tr>
<tr><td>Multicast and routing hellos</td><td>carried like any passenger</td><td>IPv4 passenger only</td></tr>
<tr><td>Typical use</td><td>general-purpose overlay</td><td>simple IPv4 point-to-point</td></tr></table>
<p>The <b>GRE protocol-type field</b> is why GRE is flexible: it says what is inside (for example 0x0800 for IPv4), so the far end knows how to read the passenger. IP-IP has no such field, so the far end assumes IPv4.</p>

<h3>The tunnel interface on Junos</h3>
<p>A Junos tunnel is a logical interface <code>gr-fpc/pic/port.unit</code> or <code>ip-fpc/pic/port.unit</code>. It behaves as a point-to-point link: it has its own IP address, appears in <code>show interfaces terse</code>, and can run OSPF or take static routes. Remember the two ends of the configuration:</p>
<ul>
<li><b>tunnel source</b>: an address that exists on this router (an interface address). It becomes the outer source.</li>
<li><b>tunnel destination</b>: the far router's address, reachable through the <i>underlay</i>. It becomes the outer destination.</li>
</ul>
<p>On the far router the two are swapped. If source and destination do not mirror each other, packets arrive at an address that has no matching tunnel and are dropped.</p>

<div class="eg"><p><b>Worked example.</b> A 1000-byte inner packet leaving R1 through GRE becomes 1000 + 24 = 1024 bytes on the ISP link. The same packet through IP-IP becomes 1020 bytes. A 1476-byte inner packet becomes exactly 1500 bytes with GRE, which is the largest that fits an unmodified Ethernet underlay.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using the tunnel's own overlay address (for example 172.31.6.1) as tunnel source. The source must be an underlay address that really sits on the router. The overlay address lives on the tunnel unit itself.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember protocol numbers: GRE is 47, IP-IP is 4. IPv6 inside IPv4 uses 41 and ESP uses 50. Know that IP-IP cannot carry IPv6 while GRE can.</p></div>

<div class="scn"><h4>The tunnel that dropped everything</h4><p>An engineer built a GRE tunnel but typed the same source and destination on both routers instead of mirroring them. Each router sent packets to the other, but on arrival the far side found no tunnel whose source matched the outer source address, so it discarded them. The tunnel unit still showed Up, which misled the team for an hour. Comparing <code>show interfaces gr-0/0/0.0 detail</code> on both sides revealed the mismatch immediately.</p><p><b>Lesson:</b> source and destination on one end must be the destination and source on the other.</p></div>

<div class="iv"><p class="q">"Explain the two routing lookups a tunnel router performs."</p><p>First the router looks up the inner destination, which selects the tunnel interface. After encapsulation it looks up the outer destination, which must resolve through a real underlay interface. If the outer lookup points back into the tunnel, you get recursive routing and the tunnel fails.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Encapsulation adds an outer IP header (plus a 4-byte GRE header for GRE).</li>
<li>GRE is IP protocol 47, IP-IP is protocol 4.</li>
<li>GRE carries IPv4, IPv6 and more; IP-IP carries IPv4 only.</li>
<li>Source and destination are mirrored on the two routers.</li>
<li>The outer destination must be reachable through the underlay, never through the tunnel.</li>
</ul></div>
`,hi:`
<p>Koi configuration type karne se pehle aapko saaf tasveer chahiye ki tunnel router har packet ke saath kya karta hai. Shabd saral hain: <b>encapsulation</b> ka matlab aage naya header jodna; <b>decapsulation</b> ka matlab far end par use hatana. Is module ki baaki saari cheezein (MTU, keepalives, recursive routing) isi ek idea se nikalti hain.</p>

<h3>Step by step: ek packet tunnel se kaise guzarta hai</h3>
<ol>
<li>PC1 (192.168.61.10) PC3 (192.168.63.10) ko packet bhejta hai. R1 use apne LAN port par receive karta hai.</li>
<li>R1 routing table mein 192.168.63.0/24 dekhta hai. Best route tunnel interface ki taraf jaata hai, jaise <code>gr-0/0/0.0</code>.</li>
<li>R1 <b>encapsulate</b> karta hai: source 203.0.113.1 (tunnel source) aur destination 203.0.113.9 (tunnel destination) wala outer IP header jodta hai, aur GRE ke liye beech mein 4-byte GRE header.</li>
<li>Ab R1 <i>outer destination</i> 203.0.113.9 ko routing table mein dekhta hai. Yeh doosra, alag lookup hai. Yeh underlay route use karta hai, yahan ISP ki taraf static default.</li>
<li>ISP sirf outer header par forward karta hai. R3 ko apne hi WAN address par aaya packet milta hai, protocol number dekhta hai, aur use tunnel process ko de deta hai.</li>
<li>R3 <b>decapsulate</b> karta hai, outer header hatata hai, aur original packet PC3 ki taraf route karta hai.</li>
</ol>
<p>Dhyan do: do lookups hote hain: ek inner destination ke liye (jo tunnel chunta hai) aur ek outer destination ke liye (jo tunnel ko <b>nahi</b> chunna chahiye). Chapter 8 dikhata hai ki doosra lookup galat ho to kya hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="GRE aur IP-IP packet layout">
<text x="20" y="22" class="svg-ink" font-size="13">GRE packet (protocol 47)</text>
<rect x="20" y="32" width="150" height="40" rx="4" fill="#fde68a"/><text x="95" y="57" text-anchor="middle" class="svg-ink" font-size="12">Outer IP  20 B</text>
<rect x="170" y="32" width="90" height="40" rx="4" fill="#fed7aa"/><text x="215" y="57" text-anchor="middle" class="svg-ink" font-size="12">GRE  4 B</text>
<rect x="260" y="32" width="250" height="40" rx="4" fill="#bae6fd"/><text x="385" y="57" text-anchor="middle" class="svg-ink" font-size="12">Passenger IP packet (1476 B tak)</text>
<text x="20" y="112" class="svg-ink" font-size="13">IP-IP packet (protocol 4)</text>
<rect x="20" y="122" width="150" height="40" rx="4" fill="#fde68a"/><text x="95" y="147" text-anchor="middle" class="svg-ink" font-size="12">Outer IP  20 B</text>
<rect x="170" y="122" width="340" height="40" rx="4" fill="#bae6fd"/><text x="340" y="147" text-anchor="middle" class="svg-ink" font-size="12">Passenger IPv4 packet (1480 B tak)</text>
<text x="20" y="200" class="svg-muted" font-size="12">Dono 1500-byte underlay MTU mein fit hote hain. IP-IP 4 byte kam kharch karta hai.</text>
</svg><p class="cap">Outer IP header dono mein same hai. GRE ek chhota header jodta hai jo protocol type rakhta hai.</p></div>

<h3>GRE banaam IP-IP detail mein</h3>
<table class="cmp"><tr><th></th><th>GRE (gr-0/0/0)</th><th>IP-IP (ip-0/0/0)</th></tr>
<tr><td>Outer IP protocol number</td><td>47</td><td>4</td></tr>
<tr><td>Overhead</td><td>20 + 4 = 24 bytes (optional key, checksum ya sequence fields se zyada)</td><td>20 bytes</td></tr>
<tr><td>Passenger</td><td>IPv4, IPv6, MPLS aur bhi, GRE protocol-type field se tay</td><td>sirf IPv4</td></tr>
<tr><td>Optional features</td><td>key, keepalives (OAM)</td><td>koi nahi</td></tr>
<tr><td>Multicast aur routing hellos</td><td>kisi bhi passenger ki tarah jaate hain</td><td>sirf IPv4 passenger</td></tr>
<tr><td>Typical use</td><td>general-purpose overlay</td><td>simple IPv4 point-to-point</td></tr></table>
<p><b>GRE protocol-type field</b> hi GRE ko flexible banata hai: yeh batata hai andar kya hai (jaise IPv4 ke liye 0x0800), taaki far end passenger sahi padh sake. IP-IP mein aisa field nahi, isliye far end IPv4 maan leta hai.</p>

<h3>Junos par tunnel interface</h3>
<p>Junos tunnel ek logical interface hai: <code>gr-fpc/pic/port.unit</code> ya <code>ip-fpc/pic/port.unit</code>. Yeh point-to-point link ki tarah chalta hai: iska apna IP address hota hai, <code>show interfaces terse</code> mein dikhta hai, aur uspar OSPF ya static routes chalte hain. Configuration ke do sirey yaad rakho:</p>
<ul>
<li><b>tunnel source</b>: aisa address jo is router par maujood hai (interface address). Yeh outer source ban jaata hai.</li>
<li><b>tunnel destination</b>: far router ka address, jo <i>underlay</i> se reachable hona chahiye. Yeh outer destination ban jaata hai.</li>
</ul>
<p>Far router par dono ulte hote hain. Source aur destination ek doosre ke mirror na hon to packets aise address par pahunchte hain jiska koi matching tunnel nahi, aur drop ho jaate hain.</p>

<div class="eg"><p><b>Worked example.</b> R1 se GRE se nikalta 1000-byte inner packet ISP link par 1000 + 24 = 1024 bytes ho jaata hai. Wahi packet IP-IP se 1020 bytes banta hai. 1476-byte inner packet GRE ke saath theek 1500 bytes banta hai, jo bina badle Ethernet underlay mein fit hone wala sabse bada size hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Tunnel ka apna overlay address (jaise 172.31.6.1) tunnel source banana. Source ek underlay address hona chahiye jo router par sach mein maujood ho. Overlay address tunnel unit par hi rehta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Protocol numbers yaad rakho: GRE 47, IP-IP 4. IPv4 ke andar IPv6 ke liye 41 aur ESP ke liye 50. Yaad rakho ki IP-IP IPv6 nahi le jaa sakta jabki GRE le jaa sakta hai.</p></div>

<div class="scn"><h4>Tunnel jisne sab kuch drop kar diya</h4><p>Ek engineer ne GRE tunnel banaya lekin dono routers par mirror karne ki jagah same source aur destination type kar diye. Har router doosre ko packets bhejta raha, lekin pahunchne par far side ko koi aisa tunnel nahi mila jiska source outer source se match kare, to usne packets discard kar diye. Tunnel unit phir bhi Up dikhta raha, jisse team ek ghanta bhatakti rahi. Dono taraf <code>show interfaces gr-0/0/0.0 detail</code> compare karte hi mismatch turant dikh gaya.</p><p><b>Lesson:</b> ek end ka source aur destination doosre end par destination aur source hone chahiye.</p></div>

<div class="iv"><p class="q">"Tunnel router jo do routing lookups karta hai unhe samjhao."</p><p>Pehle router inner destination dekhta hai, jo tunnel interface chunta hai. Encapsulation ke baad woh outer destination dekhta hai, jo asli underlay interface se resolve hona chahiye. Agar outer lookup wapas tunnel ki taraf ishaara kare to recursive routing hoti hai aur tunnel fail ho jaata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Encapsulation outer IP header jodta hai (GRE mein saath mein 4-byte GRE header).</li>
<li>GRE IP protocol 47 hai, IP-IP protocol 4.</li>
<li>GRE IPv4, IPv6 aur bhi le jaata hai; IP-IP sirf IPv4.</li>
<li>Source aur destination do routers par mirror hote hain.</li>
<li>Outer destination underlay se reachable hona chahiye, tunnel se kabhi nahi.</li>
</ul></div>
`}};export{e as default};