var e={id:`gre-concepts`,h:{en:`Tunnels and GRE: packets inside packets`,hi:`Tunnels aur GRE: packet ke andar packet`},body:{en:`
<p>You want to send a letter to a friend in another city, but the courier company only accepts parcels addressed to its own depots. So you put your letter, with your friend's address still written on it, inside a courier box addressed from the Pune depot to the Jaipur depot. The courier only reads the box label. In Jaipur the depot opens the box and posts the original letter to your friend. That is <b>tunnelling</b>, and <b>GRE</b> is the simplest and most flexible box a router can use.</p>

<h3>The problem GRE solves</h3>
<p>In the GRE lab, BR1 (Pune) has LAN 10.1.10.0/24 and BR2 (Jaipur) has LAN 10.2.20.0/24. Each branch has one internet link: BR1 Gi0/0 is 100.64.11.2/30 and BR2 Gi0/0 is 100.64.22.2/30. The ISP router only knows its connected public subnets. If BR1 sends a packet to 10.2.20.10, the ISP has no route and drops it. We cannot ask the ISP to carry our private routes. We need a way to make the private packet look like a public one while it crosses the ISP.</p>

<h3>Three protocols in every tunnel</h3>
<dl class="terms">
<dt>Passenger protocol</dt><dd>The original packet you want to deliver: here IPv4 from 10.1.10.10 to 10.2.20.10. It could also be IPv6 or multicast.</dd>
<dt>Carrier (encapsulation) protocol</dt><dd>The header that says "there is a packet inside": GRE.</dd>
<dt>Transport (delivery) protocol</dt><dd>The new outer IP header that the underlay routes: source 100.64.11.2, destination 100.64.22.2, IP protocol number 47.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="GRE encapsulation">
<rect x="20" y="20" width="360" height="40" rx="6" fill="#fde68a"/><text x="200" y="45" text-anchor="middle" class="svg-ink" font-size="13">Original: IP 10.1.10.10 to 10.2.20.10 | data</text>
<text x="400" y="45" class="svg-muted" font-size="12">passenger</text>
<rect x="20" y="100" width="150" height="40" rx="6" fill="#bae6fd"/><text x="95" y="118" text-anchor="middle" class="svg-ink" font-size="12">Outer IP (20 B)</text><text x="95" y="133" text-anchor="middle" class="svg-muted" font-size="12">proto 47</text>
<rect x="175" y="100" width="90" height="40" rx="6" fill="#ddd6fe"/><text x="220" y="118" text-anchor="middle" class="svg-ink" font-size="12">GRE (4 B)</text><text x="220" y="133" text-anchor="middle" class="svg-muted" font-size="12">0x0800</text>
<rect x="270" y="100" width="350" height="40" rx="6" fill="#fde68a"/><text x="445" y="125" text-anchor="middle" class="svg-ink" font-size="12">IP 10.1.10.10 to 10.2.20.10 | data</text>
<line x1="200" y1="60" x2="445" y2="100" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="95" y="160" text-anchor="middle" class="svg-accent" font-size="12">100.64.11.2 to 100.64.22.2</text>
</svg><p class="cap">GRE adds 24 bytes: a 20-byte outer IPv4 header and a 4-byte basic GRE header.</p></div>

<h3>Inside the GRE header</h3>
<p>The basic GRE header (RFC 2784) is only <b>4 bytes</b>: a few flag bits, a version field (0), and a 16-bit <b>protocol type</b> that uses Ethernet type values, so 0x0800 means "IPv4 inside" and 0x86DD means "IPv6 inside". Optional fields add 4 bytes each when enabled: a checksum, a <b>key</b> (to tell several tunnels between the same two endpoints apart, configured with <code>tunnel key</code>) and a sequence number. The outer IPv4 header uses <b>protocol 47</b>, which is how firewalls recognise GRE. GRE has no ports, so GRE through a PAT device is a problem; that is one reason IPsec NAT-T exists.</p>

<h3>What GRE can and cannot do</h3>
<table class="cmp"><tr><th>GRE can</th><th>GRE cannot</th></tr>
<tr><td>Carry unicast, multicast and broadcast, so OSPF and EIGRP hellos run over it</td><td>Encrypt anything: the passenger is readable by anyone on the path</td></tr>
<tr><td>Carry IPv6 over IPv4, or IPv4 over IPv6 (<code>tunnel mode gre ipv6</code>)</td><td>Authenticate the peer or detect tampering</td></tr>
<tr><td>Make a remote site look directly connected: the whole tunnel is one hop</td><td>Detect a dead far end on its own (needs keepalives)</td></tr>
<tr><td>Work across any IP underlay: internet, MPLS, even a VRF</td><td>Pass through PAT easily (no ports)</td></tr>
</table>

<h3>Why the tunnel is one hop</h3>
<p>From the passenger's point of view, BR1 and BR2 are neighbours on 172.16.12.0/30. The TTL of the inner packet is decremented once by BR1 and once by BR2; the ISP only decrements the outer TTL. A traceroute from PC1 to PC2 therefore shows 10.1.10.1, then 172.16.12.2, then 10.2.20.10. The ISP is invisible.</p>

<div class="eg"><p><b>Worked example: the numbers.</b> PC1 sends a 1400-byte ICMP packet. BR1 routes it into Tunnel0, adds 4 bytes of GRE and a 20-byte outer header: 1424 bytes on the wire, from 100.64.11.2 to 100.64.22.2, protocol 47. A full 1500-byte passenger would become 1524 bytes, larger than the Ethernet MTU, and would have to be fragmented or dropped. Chapter 6 shows how <code>ip mtu 1400</code> and <code>ip tcp adjust-mss 1360</code> avoid that.</p></div>

<h3>Point-to-point and multipoint GRE</h3>
<p>The tunnels in this module are <b>point-to-point</b>: one tunnel interface, one fixed destination. Large hub-and-spoke networks use <b>multipoint GRE (mGRE)</b>, where one tunnel interface on the hub reaches many spokes and NHRP maps tunnel addresses to public addresses. That is DMVPN, covered in ENARSI. Catalyst SD-WAN also builds overlay tunnels, but uses IPsec directly rather than GRE in most designs.</p>

<div class="warn"><p><b>Common mistakes.</b> Believing GRE is a VPN in the security sense: a GRE tunnel over the internet exposes every packet. Blocking GRE on an edge ACL by permitting only TCP and UDP: GRE is protocol 47 and needs <code>permit gre host 100.64.22.2 host 100.64.11.2</code>. Using the same source and destination for two tunnels without a tunnel key.</p></div>

<div class="exam"><p><b>Exam traps.</b> GRE is IP protocol 47 (not a TCP or UDP port). Overhead is 24 bytes (20 + 4) with no options. GRE supports multicast; a crypto map alone does not. GRE adds no confidentiality.</p></div>

<div class="scn"><h4>OSPF would not cross the VPN</h4><p>A company connected two sites with a plain IPsec crypto-map VPN and tried to run OSPF between them. Hellos never arrived, because OSPF hellos are multicast to 224.0.0.5 and the crypto ACL only matched unicast subnets. The engineer built a GRE tunnel between the routers, ran OSPF on the tunnel interface, and protected the tunnel with IPsec. The adjacency came up and routes were learned dynamically.</p><p><b>Lesson:</b> when you need routing protocols or multicast across a secure WAN, wrap them in GRE (or use a VTI) and then encrypt.</p></div>

<div class="iv"><p class="q">"What is GRE, and why would you use it if it does not encrypt?"</p><p>GRE is a simple encapsulation protocol, IP protocol 47, with a 4-byte header plus a new 20-byte IP header. It carries almost any passenger protocol, including multicast and IPv6, so routing protocols can run over it, and it makes remote sites look directly connected. It adds no security, so across untrusted networks you combine it with IPsec (GRE over IPsec) or use a VTI. Mention the MTU impact and keepalives.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A tunnel wraps a passenger packet in a carrier header (GRE) and a transport header (outer IP).</li>
<li>GRE = IP protocol 47, 4-byte basic header, protocol type 0x0800 for IPv4; 24 bytes total overhead.</li>
<li>GRE carries multicast and routing protocols, but gives no encryption or authentication.</li>
<li>The whole tunnel is one hop; the underlay is invisible to the passenger.</li>
<li>Point-to-point GRE for a few sites; mGRE with NHRP (DMVPN) for many.</li>
</ul></div>
`,hi:`
<p>Aap doosre shehar mein ek dost ko chitthi bhejna chahte ho, lekin courier company sirf apne depots ke address wale parcels leti hai. To aap apni chitthi, jis par dost ka address ab bhi likha hai, ek courier box mein daalte ho jiska label Pune depot se Jaipur depot hai. Courier sirf box ka label padhta hai. Jaipur mein depot box kholta hai aur original chitthi aapke dost ko bhej deta hai. Yahi <b>tunnelling</b> hai, aur <b>GRE</b> sabse simple aur flexible box hai jo router use kar sakta hai.</p>

<h3>GRE kaunsi problem solve karta hai</h3>
<p>GRE lab mein BR1 (Pune) ka LAN 10.1.10.0/24 hai aur BR2 (Jaipur) ka LAN 10.2.20.0/24. Har branch ka ek internet link hai: BR1 Gi0/0 100.64.11.2/30 hai aur BR2 Gi0/0 100.64.22.2/30. ISP router sirf apne connected public subnets jaanta hai. Agar BR1 10.2.20.10 ko packet bhejta hai, to ISP ke paas route nahi hai aur woh drop kar deta hai. Hum ISP se apne private routes carry karne ko nahi keh sakte. Humein aisa tareeka chahiye jisse private packet ISP cross karte waqt public packet jaisa dikhe.</p>

<h3>Har tunnel mein teen protocols</h3>
<dl class="terms">
<dt>Passenger protocol</dt><dd>Original packet jo aap deliver karna chahte ho: yahan 10.1.10.10 se 10.2.20.10 tak IPv4. Yeh IPv6 ya multicast bhi ho sakta hai.</dd>
<dt>Carrier (encapsulation) protocol</dt><dd>Woh header jo kehta hai "andar ek packet hai": GRE.</dd>
<dt>Transport (delivery) protocol</dt><dd>Naya outer IP header jise underlay route karta hai: source 100.64.11.2, destination 100.64.22.2, IP protocol number 47.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="GRE encapsulation">
<rect x="20" y="20" width="360" height="40" rx="6" fill="#fde68a"/><text x="200" y="45" text-anchor="middle" class="svg-ink" font-size="13">Original: IP 10.1.10.10 se 10.2.20.10 | data</text>
<text x="400" y="45" class="svg-muted" font-size="12">passenger</text>
<rect x="20" y="100" width="150" height="40" rx="6" fill="#bae6fd"/><text x="95" y="118" text-anchor="middle" class="svg-ink" font-size="12">Outer IP (20 B)</text><text x="95" y="133" text-anchor="middle" class="svg-muted" font-size="12">proto 47</text>
<rect x="175" y="100" width="90" height="40" rx="6" fill="#ddd6fe"/><text x="220" y="118" text-anchor="middle" class="svg-ink" font-size="12">GRE (4 B)</text><text x="220" y="133" text-anchor="middle" class="svg-muted" font-size="12">0x0800</text>
<rect x="270" y="100" width="350" height="40" rx="6" fill="#fde68a"/><text x="445" y="125" text-anchor="middle" class="svg-ink" font-size="12">IP 10.1.10.10 se 10.2.20.10 | data</text>
<line x1="200" y1="60" x2="445" y2="100" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="95" y="160" text-anchor="middle" class="svg-accent" font-size="12">100.64.11.2 se 100.64.22.2</text>
</svg><p class="cap">GRE 24 bytes jodta hai: 20-byte outer IPv4 header aur 4-byte basic GRE header.</p></div>

<h3>GRE header ke andar</h3>
<p>Basic GRE header (RFC 2784) sirf <b>4 bytes</b> ka hai: kuch flag bits, ek version field (0), aur ek 16-bit <b>protocol type</b> jo Ethernet type values use karta hai, to 0x0800 ka matlab "andar IPv4" aur 0x86DD ka matlab "andar IPv6". Optional fields enable hone par har ek 4 bytes jodta hai: ek checksum, ek <b>key</b> (same do endpoints ke beech kai tunnels ko alag pehchanne ke liye, <code>tunnel key</code> se configure hoti hai) aur ek sequence number. Outer IPv4 header <b>protocol 47</b> use karta hai, isi se firewalls GRE pehchante hain. GRE mein ports nahi hote, isliye PAT device ke through GRE ek problem hai; IPsec NAT-T hone ki ek wajah yahi hai.</p>

<h3>GRE kya kar sakta hai aur kya nahi</h3>
<table class="cmp"><tr><th>GRE kar sakta hai</th><th>GRE nahi kar sakta</th></tr>
<tr><td>Unicast, multicast aur broadcast le jaana, isliye OSPF aur EIGRP hellos iske upar chalte hain</td><td>Kuch bhi encrypt karna: path par koi bhi passenger padh sakta hai</td></tr>
<tr><td>IPv4 par IPv6, ya IPv6 par IPv4 le jaana (<code>tunnel mode gre ipv6</code>)</td><td>Peer ko authenticate karna ya chhed-chhaad pakadna</td></tr>
<tr><td>Remote site ko directly connected dikhana: poora tunnel ek hop</td><td>Khud se dead far end pakadna (keepalives chahiye)</td></tr>
<tr><td>Kisi bhi IP underlay par chalna: internet, MPLS, yahan tak ki VRF</td><td>PAT ke through aasani se jaana (ports nahi)</td></tr>
</table>

<h3>Tunnel ek hop kyun hai</h3>
<p>Passenger ke nazariye se, BR1 aur BR2 172.16.12.0/30 par neighbours hain. Inner packet ka TTL ek baar BR1 aur ek baar BR2 ghatata hai; ISP sirf outer TTL ghatata hai. Isliye PC1 se PC2 ka traceroute 10.1.10.1, phir 172.16.12.2, phir 10.2.20.10 dikhata hai. ISP invisible hai.</p>

<div class="eg"><p><b>Worked example: numbers.</b> PC1 1400-byte ICMP packet bhejta hai. BR1 use Tunnel0 mein route karta hai, 4 bytes GRE aur 20-byte outer header jodta hai: wire par 1424 bytes, 100.64.11.2 se 100.64.22.2, protocol 47. Poora 1500-byte passenger 1524 bytes ban jaata, Ethernet MTU se bada, aur use fragment ya drop karna padta. Chapter 6 dikhata hai ki <code>ip mtu 1400</code> aur <code>ip tcp adjust-mss 1360</code> isse kaise bachate hain.</p></div>

<h3>Point-to-point aur multipoint GRE</h3>
<p>Is module ke tunnels <b>point-to-point</b> hain: ek tunnel interface, ek fixed destination. Bade hub-and-spoke networks <b>multipoint GRE (mGRE)</b> use karte hain, jahan hub par ek tunnel interface kai spokes tak pahunchta hai aur NHRP tunnel addresses ko public addresses se map karta hai. Yeh DMVPN hai, jo ENARSI mein cover hota hai. Catalyst SD-WAN bhi overlay tunnels banata hai, lekin zyada tar designs mein GRE ki jagah seedha IPsec use karta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Yeh maan-na ki GRE security ke matlab mein VPN hai: internet par GRE tunnel har packet expose karta hai. Edge ACL par sirf TCP aur UDP permit karke GRE block kar dena: GRE protocol 47 hai aur use <code>permit gre host 100.64.22.2 host 100.64.11.2</code> chahiye. Do tunnels ke liye bina tunnel key ke same source aur destination use karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> GRE IP protocol 47 hai (TCP ya UDP port nahi). Bina options ke overhead 24 bytes (20 + 4) hai. GRE multicast support karta hai; akela crypto map nahi karta. GRE koi confidentiality nahi jodta.</p></div>

<div class="scn"><h4>OSPF VPN cross nahi kar raha tha</h4><p>Ek company ne do sites ko plain IPsec crypto-map VPN se joda aur unke beech OSPF chalane ki koshish ki. Hellos kabhi pahunche hi nahi, kyunki OSPF hellos 224.0.0.5 par multicast hote hain aur crypto ACL sirf unicast subnets match karta tha. Engineer ne routers ke beech GRE tunnel banaya, tunnel interface par OSPF chalaya, aur tunnel ko IPsec se protect kiya. Adjacency up hui aur routes dynamically seekhe gaye.</p><p><b>Seekh:</b> jab secure WAN ke paar routing protocols ya multicast chahiye, unhe GRE mein lapeto (ya VTI use karo) aur phir encrypt karo.</p></div>

<div class="iv"><p class="q">"GRE kya hai, aur agar yeh encrypt nahi karta to aap ise kyun use karoge?"</p><p>GRE ek simple encapsulation protocol hai, IP protocol 47, 4-byte header aur ek naye 20-byte IP header ke saath. Yeh lagbhag koi bhi passenger protocol le jaata hai, multicast aur IPv6 samet, isliye routing protocols iske upar chal sakte hain, aur yeh remote sites ko directly connected dikhata hai. Yeh koi security nahi jodta, isliye untrusted networks ke paar ise IPsec ke saath milate ho (GRE over IPsec) ya VTI use karte ho. MTU impact aur keepalives ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnel passenger packet ko carrier header (GRE) aur transport header (outer IP) mein lapet-ta hai.</li>
<li>GRE = IP protocol 47, 4-byte basic header, IPv4 ke liye protocol type 0x0800; total overhead 24 bytes.</li>
<li>GRE multicast aur routing protocols le jaata hai, lekin encryption ya authentication nahi deta.</li>
<li>Poora tunnel ek hop hai; underlay passenger ke liye invisible hai.</li>
<li>Kuch sites ke liye point-to-point GRE; bahut saari sites ke liye NHRP ke saath mGRE (DMVPN).</li>
</ul></div>
`}};export{e as default};