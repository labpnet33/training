var e={id:`encapsulation`,h:{en:`The VXLAN packet, byte by byte`,hi:`VXLAN packet, byte by byte`},body:{en:`
<p>Go back to the courier analogy. The original note (the server's Ethernet frame) goes into an envelope untouched. On the envelope the courier writes a department label (the VNI), a service type (UDP port 4789), the two building addresses (the VTEP loopbacks) and finally hands it to the local delivery van that drives to the next junction (the outer Ethernet header towards the spine). In this chapter you will open that envelope layer by layer and count every byte, because the byte count is exactly what breaks VXLAN when the MTU is wrong.</p>

<h3>The full packet</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="VXLAN packet format">
<rect x="10" y="30" width="110" height="50" rx="4" fill="#e2e8f0"/><text x="65" y="52" text-anchor="middle" class="svg-ink" font-size="12">Outer Ethernet</text><text x="65" y="70" text-anchor="middle" class="svg-muted" font-size="12">14 bytes</text>
<rect x="122" y="30" width="100" height="50" rx="4" fill="#bae6fd"/><text x="172" y="52" text-anchor="middle" class="svg-ink" font-size="12">Outer IPv4</text><text x="172" y="70" text-anchor="middle" class="svg-muted" font-size="12">20 bytes</text>
<rect x="224" y="30" width="90" height="50" rx="4" fill="#bbf7d0"/><text x="269" y="52" text-anchor="middle" class="svg-ink" font-size="12">UDP</text><text x="269" y="70" text-anchor="middle" class="svg-muted" font-size="12">8 bytes</text>
<rect x="316" y="30" width="90" height="50" rx="4" fill="#fde68a"/><text x="361" y="52" text-anchor="middle" class="svg-ink" font-size="12">VXLAN</text><text x="361" y="70" text-anchor="middle" class="svg-muted" font-size="12">8 bytes</text>
<rect x="408" y="30" width="180" height="50" rx="4" fill="#ddd6fe"/><text x="498" y="52" text-anchor="middle" class="svg-ink" font-size="12">Original frame</text><text x="498" y="70" text-anchor="middle" class="svg-muted" font-size="12">inner MACs + IP payload</text>
<rect x="590" y="30" width="40" height="50" rx="4" fill="#e2e8f0"/><text x="610" y="60" text-anchor="middle" class="svg-ink" font-size="12">FCS</text>
<line x1="10" y1="100" x2="406" y2="100" stroke="#64748b" stroke-width="2"/><text x="208" y="118" text-anchor="middle" class="svg-accent" font-size="13">50 bytes of VXLAN overhead</text>
<text x="65" y="150" text-anchor="middle" class="svg-muted" font-size="12">next-hop MACs</text>
<text x="172" y="150" text-anchor="middle" class="svg-muted" font-size="12">VTEP to VTEP</text>
<text x="269" y="150" text-anchor="middle" class="svg-muted" font-size="12">dst 4789</text>
<text x="361" y="150" text-anchor="middle" class="svg-muted" font-size="12">flags + VNI</text>
<text x="498" y="150" text-anchor="middle" class="svg-muted" font-size="12">untouched by the fabric</text>
<text x="65" y="170" text-anchor="middle" class="svg-muted" font-size="12">leaf to spine</text>
<text x="172" y="170" text-anchor="middle" class="svg-muted" font-size="12">10.254.0.1 to .2</text>
<text x="269" y="170" text-anchor="middle" class="svg-muted" font-size="12">src = hash</text>
<text x="361" y="170" text-anchor="middle" class="svg-muted" font-size="12">VNI 10010</text>
<text x="498" y="170" text-anchor="middle" class="svg-muted" font-size="12">SRV1 to SRV2</text>
</svg><p class="cap">Read it from the inside out: the server's frame, then VXLAN, UDP, IP and a new Ethernet header.</p></div>

<h3>Layer 1 (innermost): the original Ethernet frame</h3>
<p>This is the frame SRV1 sent: destination MAC (6 bytes), source MAC (6 bytes), EtherType (2 bytes) and the IP packet. The <b>802.1Q tag is normally removed</b> by the ingress VTEP: the VLAN number is local to the leaf, and the VNI carries the segment identity instead. The original <b>FCS is dropped</b> too, because the outer frame gets its own FCS. So a full-size 1500-byte IP packet from the server becomes a <b>1514-byte inner frame</b>.</p>

<h3>Layer 2: the VXLAN header (8 bytes)</h3>
<ul>
<li><b>Flags</b> (8 bits). Only the <b>I flag</b> (0x08) is set, meaning "the VNI field is valid". Wireshark shows the flags word as 0x0800.</li>
<li><b>Reserved</b> (24 bits), set to zero.</li>
<li><b>VNI</b> (24 bits). The segment ID. VNI 10010 is 0x00271A on the wire.</li>
<li><b>Reserved</b> (8 bits), set to zero.</li>
</ul>
<p>That is all. There is no sequence number, no MAC table, no signalling. VXLAN is purely an encapsulation.</p>

<h3>Layer 3: the outer UDP header (8 bytes)</h3>
<ul>
<li><b>Destination port 4789</b>, the IANA-assigned VXLAN port. The receiving VTEP recognises VXLAN by this port. (Early Linux kernels used 8472; you may still see that in some software VTEPs, and mismatched ports mean no decapsulation.)</li>
<li><b>Source port</b>: calculated from a <b>hash of the inner frame headers</b> (MACs, IPs, ports). RFC 7348 recommends the dynamic range 49152–65535. This is the clever part: every inner flow gets a different outer source port, so the spines' ECMP hash spreads different flows across different paths, while packets of one flow always take the same path and stay in order.</li>
<li><b>Checksum</b>: normally sent as zero for IPv4, which the RFC permits.</li>
</ul>

<h3>Layer 4: the outer IP header (20 bytes for IPv4)</h3>
<p>Source = the local VTEP address (loopback1, 10.254.0.1). Destination = the remote VTEP (10.254.0.2) for known unicast, or a peer from the replication list, or a multicast group for BUM traffic in multicast mode. Protocol = 17 (UDP). The underlay routes this packet like any other, using the OSPF routes to the loopbacks. VTEPs <b>do not fragment</b> VXLAN packets; an oversized packet is dropped.</p>

<h3>Layer 5: the outer Ethernet header (14 bytes)</h3>
<p>Destination MAC = the next hop (the spine's interface MAC), source MAC = the leaf's uplink MAC, EtherType 0x0800. This header is rewritten at every routed hop, exactly like normal IP forwarding. If the uplink is an 802.1Q trunk (unusual in a routed fabric), add 4 bytes.</p>

<div class="eg"><p><b>Worked example: the MTU arithmetic.</b> SRV1 sends a 1500-byte IP packet. Inner frame = 1500 + 14 = 1514. Add VXLAN 8 + UDP 8 + outer IPv4 20 = 1550-byte outer IP packet. With the outer Ethernet header (14) the frame on the uplink is 1564 bytes before FCS. So every underlay link needs an IP MTU of at least <b>1550</b>. Standard practice is <b>mtu 9216</b> on all fabric interfaces, which the lab underlay already uses, leaving room for jumbo frames from servers (up to about 9166 bytes). With an IPv6 underlay the overhead is 70 bytes (40-byte IPv6 header).</p></div>

<h3>What a capture shows</h3>
<pre class="out">Frame 42: 1564 bytes on wire
Ethernet II, Src: LEAF1-Eth1/1, Dst: SPINE1-Eth1/1
Internet Protocol Version 4, <span class="hl">Src: 10.254.0.1, Dst: 10.254.0.2</span>
User Datagram Protocol, <span class="hl">Src Port: 53172, Dst Port: 4789</span>
Virtual eXtensible Local Area Network
    Flags: 0x0800, VXLAN Network ID (VNI)
    <span class="hl">VXLAN Network Identifier (VNI): 10010</span>
    Reserved: 0
Ethernet II, Src: 0050.56aa.0011, Dst: 0050.56aa.0012
Internet Protocol Version 4, Src: 172.16.10.11, Dst: 172.16.10.12
Internet Control Message Protocol (Echo request)</pre>
<p>Notice the two IP headers: the outer one between VTEPs (10.254.x) and the inner one between servers (172.16.10.x). The spines only look at the outer one.</p>

<div class="warn"><p><b>Common mistake.</b> Testing the fabric with a default ping between loopbacks, which sends a small packet, and declaring the MTU fine. Small packets such as ARP and ping pass through even when the MTU is 1500; large TCP segments with the DF bit set are silently dropped. Test with a large, non-fragmentable ping between the VTEP loopbacks (for example <code>ping 10.254.0.2 source 10.254.0.1 packet-size 8900 df-bit</code>).</p></div>

<div class="exam"><p><b>Exam trap.</b> Overhead is <b>50 bytes</b> (IPv4 underlay, untagged outer frame), 54 with an outer 802.1Q tag. The UDP <b>destination</b> port is fixed at 4789; the <b>source</b> port varies for entropy. Questions often swap these two.</p></div>

<div class="scn"><h4>Only one spine was ever busy</h4><p>A team integrated a third-party software VTEP with their Nexus fabric. Traffic worked, but monitoring showed one spine at 70% and the other nearly idle. A capture on the uplink showed every VXLAN packet from the software VTEP using the same UDP source port, because source-port hashing was disabled in its configuration. The spines' ECMP hash (outer IPs and ports) therefore saw one flow and always picked the same path. Enabling the inner-flow hash on the software VTEP spread the load evenly within minutes.</p><p><b>Lesson:</b> the outer UDP source port is what gives VXLAN its ECMP entropy. If it never changes, one path carries everything.</p></div>

<div class="iv"><p class="q">"Walk me through the VXLAN header and the overhead it adds."</p><p>Strong answer: from the inside out, the original frame without its FCS and usually without the 802.1Q tag; an 8-byte VXLAN header with the I flag and a 24-bit VNI; an 8-byte UDP header with destination 4789 and a hashed source port for ECMP; a 20-byte outer IPv4 header from the source VTEP to the destination VTEP; and a 14-byte outer Ethernet header rewritten hop by hop. Total 50 bytes, so the underlay needs at least 1550 IP MTU for 1500-byte servers, and in practice 9216.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Outer Ethernet 14 + outer IPv4 20 + UDP 8 + VXLAN 8 = 50 bytes of overhead.</li>
<li>VXLAN header: I flag set, 24-bit VNI, reserved fields zero.</li>
<li>UDP destination port 4789; source port is a hash of the inner flow for ECMP entropy.</li>
<li>Outer IPs are the VTEP loopbacks; inner IPs are the servers'.</li>
<li>VTEPs do not fragment: set the underlay to 9216 and test with large DF pings.</li>
</ul></div>
`,hi:`
<p>Courier analogy par wapas chalo. Original note (server ka Ethernet frame) bina chhede envelope mein jaata hai. Envelope par courier ek department label (VNI), ek service type (UDP port 4789), dono buildings ke addresses (VTEP loopbacks) likhta hai aur aakhir mein use local delivery van ko deta hai jo agle junction tak jaati hai (spine ki taraf outer Ethernet header). Is chapter mein aap us envelope ko layer by layer khologe aur har byte ginoge, kyunki byte count hi woh cheez hai jo MTU galat hone par VXLAN ko todti hai.</p>

<h3>Poora packet</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="VXLAN packet format">
<rect x="10" y="30" width="110" height="50" rx="4" fill="#e2e8f0"/><text x="65" y="52" text-anchor="middle" class="svg-ink" font-size="12">Outer Ethernet</text><text x="65" y="70" text-anchor="middle" class="svg-muted" font-size="12">14 bytes</text>
<rect x="122" y="30" width="100" height="50" rx="4" fill="#bae6fd"/><text x="172" y="52" text-anchor="middle" class="svg-ink" font-size="12">Outer IPv4</text><text x="172" y="70" text-anchor="middle" class="svg-muted" font-size="12">20 bytes</text>
<rect x="224" y="30" width="90" height="50" rx="4" fill="#bbf7d0"/><text x="269" y="52" text-anchor="middle" class="svg-ink" font-size="12">UDP</text><text x="269" y="70" text-anchor="middle" class="svg-muted" font-size="12">8 bytes</text>
<rect x="316" y="30" width="90" height="50" rx="4" fill="#fde68a"/><text x="361" y="52" text-anchor="middle" class="svg-ink" font-size="12">VXLAN</text><text x="361" y="70" text-anchor="middle" class="svg-muted" font-size="12">8 bytes</text>
<rect x="408" y="30" width="180" height="50" rx="4" fill="#ddd6fe"/><text x="498" y="52" text-anchor="middle" class="svg-ink" font-size="12">Original frame</text><text x="498" y="70" text-anchor="middle" class="svg-muted" font-size="12">inner MACs + IP payload</text>
<rect x="590" y="30" width="40" height="50" rx="4" fill="#e2e8f0"/><text x="610" y="60" text-anchor="middle" class="svg-ink" font-size="12">FCS</text>
<line x1="10" y1="100" x2="406" y2="100" stroke="#64748b" stroke-width="2"/><text x="208" y="118" text-anchor="middle" class="svg-accent" font-size="13">50 bytes VXLAN overhead</text>
<text x="65" y="150" text-anchor="middle" class="svg-muted" font-size="12">next-hop MACs</text>
<text x="172" y="150" text-anchor="middle" class="svg-muted" font-size="12">VTEP se VTEP</text>
<text x="269" y="150" text-anchor="middle" class="svg-muted" font-size="12">dst 4789</text>
<text x="361" y="150" text-anchor="middle" class="svg-muted" font-size="12">flags + VNI</text>
<text x="498" y="150" text-anchor="middle" class="svg-muted" font-size="12">fabric ise nahi chhoota</text>
<text x="65" y="170" text-anchor="middle" class="svg-muted" font-size="12">leaf se spine</text>
<text x="172" y="170" text-anchor="middle" class="svg-muted" font-size="12">10.254.0.1 se .2</text>
<text x="269" y="170" text-anchor="middle" class="svg-muted" font-size="12">src = hash</text>
<text x="361" y="170" text-anchor="middle" class="svg-muted" font-size="12">VNI 10010</text>
<text x="498" y="170" text-anchor="middle" class="svg-muted" font-size="12">SRV1 se SRV2</text>
</svg><p class="cap">Andar se bahar padho: server ka frame, phir VXLAN, UDP, IP aur ek naya Ethernet header.</p></div>

<h3>Layer 1 (sabse andar): original Ethernet frame</h3>
<p>Yeh woh frame hai jo SRV1 ne bheja: destination MAC (6 bytes), source MAC (6 bytes), EtherType (2 bytes) aur IP packet. Ingress VTEP <b>802.1Q tag ko normally hata deta hai</b>: VLAN number leaf par local hai, aur segment ki pehchaan uski jagah VNI carry karta hai. Original <b>FCS bhi drop</b> hota hai, kyunki outer frame ko apna FCS milta hai. Isliye server ka full-size 1500-byte IP packet ek <b>1514-byte inner frame</b> ban jaata hai.</p>

<h3>Layer 2: VXLAN header (8 bytes)</h3>
<ul>
<li><b>Flags</b> (8 bits). Sirf <b>I flag</b> (0x08) set hota hai, matlab "VNI field valid hai". Wireshark flags word ko 0x0800 dikhata hai.</li>
<li><b>Reserved</b> (24 bits), zero par set.</li>
<li><b>VNI</b> (24 bits). Segment ID. VNI 10010 wire par 0x00271A hai.</li>
<li><b>Reserved</b> (8 bits), zero par set.</li>
</ul>
<p>Bas itna hi. Koi sequence number nahi, koi MAC table nahi, koi signalling nahi. VXLAN sirf ek encapsulation hai.</p>

<h3>Layer 3: outer UDP header (8 bytes)</h3>
<ul>
<li><b>Destination port 4789</b>, IANA-assigned VXLAN port. Receiving VTEP isi port se VXLAN pehchaanta hai. (Purane Linux kernels 8472 use karte the; kuch software VTEPs mein ab bhi dikh sakta hai, aur ports mismatch hone par decapsulation nahi hota.)</li>
<li><b>Source port</b>: <b>inner frame headers ke hash</b> (MACs, IPs, ports) se calculate hota hai. RFC 7348 dynamic range 49152–65535 recommend karta hai. Yahi clever part hai: har inner flow ko alag outer source port milta hai, isliye spines ka ECMP hash alag flows ko alag paths par baant deta hai, jabki ek flow ke packets hamesha same path lete hain aur order mein rehte hain.</li>
<li><b>Checksum</b>: IPv4 ke liye normally zero bheja jaata hai, jise RFC allow karta hai.</li>
</ul>

<h3>Layer 4: outer IP header (IPv4 ke liye 20 bytes)</h3>
<p>Source = local VTEP address (loopback1, 10.254.0.1). Destination = known unicast ke liye remote VTEP (10.254.0.2), ya replication list ka ek peer, ya multicast mode mein BUM traffic ke liye multicast group. Protocol = 17 (UDP). Underlay is packet ko baaki packets ki tarah loopbacks ke OSPF routes se route karta hai. VTEPs VXLAN packets ko <b>fragment nahi karte</b>; oversized packet drop ho jaata hai.</p>

<h3>Layer 5: outer Ethernet header (14 bytes)</h3>
<p>Destination MAC = next hop (spine ka interface MAC), source MAC = leaf ka uplink MAC, EtherType 0x0800. Yeh header har routed hop par rewrite hota hai, bilkul normal IP forwarding ki tarah. Agar uplink 802.1Q trunk hai (routed fabric mein unusual), to 4 bytes aur jodo.</p>

<div class="eg"><p><b>Worked example: MTU ka hisaab.</b> SRV1 ek 1500-byte IP packet bhejta hai. Inner frame = 1500 + 14 = 1514. VXLAN 8 + UDP 8 + outer IPv4 20 jodo = 1550-byte outer IP packet. Outer Ethernet header (14) ke saath uplink par frame FCS se pehle 1564 bytes ka hai. Isliye har underlay link ko kam se kam <b>1550</b> ka IP MTU chahiye. Standard practice saare fabric interfaces par <b>mtu 9216</b> hai, jo lab underlay pehle se use karta hai, aur servers ke jumbo frames (lagbhag 9166 bytes tak) ke liye jagah chhodta hai. IPv6 underlay ke saath overhead 70 bytes hai (40-byte IPv6 header).</p></div>

<h3>Capture kya dikhata hai</h3>
<pre class="out">Frame 42: 1564 bytes on wire
Ethernet II, Src: LEAF1-Eth1/1, Dst: SPINE1-Eth1/1
Internet Protocol Version 4, <span class="hl">Src: 10.254.0.1, Dst: 10.254.0.2</span>
User Datagram Protocol, <span class="hl">Src Port: 53172, Dst Port: 4789</span>
Virtual eXtensible Local Area Network
    Flags: 0x0800, VXLAN Network ID (VNI)
    <span class="hl">VXLAN Network Identifier (VNI): 10010</span>
    Reserved: 0
Ethernet II, Src: 0050.56aa.0011, Dst: 0050.56aa.0012
Internet Protocol Version 4, Src: 172.16.10.11, Dst: 172.16.10.12
Internet Control Message Protocol (Echo request)</pre>
<p>Do IP headers dekho: outer wala VTEPs ke beech (10.254.x) aur inner wala servers ke beech (172.16.10.x). Spines sirf outer wala dekhte hain.</p>

<div class="warn"><p><b>Common galti.</b> Loopbacks ke beech default ping se fabric test karna, jo chhota packet bhejta hai, aur MTU ko theek declare kar dena. ARP aur ping jaise chhote packets MTU 1500 hone par bhi nikal jaate hain; DF bit wale bade TCP segments chupchaap drop hote hain. VTEP loopbacks ke beech bade, non-fragmentable ping se test karo (jaise <code>ping 10.254.0.2 source 10.254.0.1 packet-size 8900 df-bit</code>).</p></div>

<div class="exam"><p><b>Exam trap.</b> Overhead <b>50 bytes</b> hai (IPv4 underlay, untagged outer frame), outer 802.1Q tag ke saath 54. UDP <b>destination</b> port 4789 par fixed hai; <b>source</b> port entropy ke liye badalta hai. Questions aksar in dono ko ulta kar dete hain.</p></div>

<div class="scn"><h4>Hamesha sirf ek spine busy tha</h4><p>Ek team ne apne Nexus fabric ke saath third-party software VTEP integrate kiya. Traffic kaam kar raha tha, lekin monitoring mein ek spine 70% par aur doosra lagbhag idle dikha. Uplink par capture se pata chala ki software VTEP ka har VXLAN packet same UDP source port use kar raha tha, kyunki uski configuration mein source-port hashing disabled thi. Isliye spines ke ECMP hash (outer IPs aur ports) ko ek hi flow dikhta tha aur woh hamesha same path chunta tha. Software VTEP par inner-flow hash enable karte hi kuch minutes mein load barabar bant gaya.</p><p><b>Seekh:</b> outer UDP source port hi VXLAN ko ECMP entropy deta hai. Agar woh kabhi nahi badalta, to ek hi path sab kuch carry karta hai.</p></div>

<div class="iv"><p class="q">"VXLAN header aur uske overhead ko walk through karo."</p><p>Strong answer: andar se bahar, original frame bina FCS ke aur aam taur par bina 802.1Q tag ke; I flag aur 24-bit VNI wala 8-byte VXLAN header; destination 4789 aur ECMP ke liye hashed source port wala 8-byte UDP header; source VTEP se destination VTEP tak 20-byte outer IPv4 header; aur hop by hop rewrite hone wala 14-byte outer Ethernet header. Total 50 bytes, isliye 1500-byte servers ke liye underlay ko kam se kam 1550 IP MTU chahiye, aur practice mein 9216.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Outer Ethernet 14 + outer IPv4 20 + UDP 8 + VXLAN 8 = 50 bytes overhead.</li>
<li>VXLAN header: I flag set, 24-bit VNI, reserved fields zero.</li>
<li>UDP destination port 4789; source port ECMP entropy ke liye inner flow ka hash hai.</li>
<li>Outer IPs VTEP loopbacks hain; inner IPs servers ke.</li>
<li>VTEPs fragment nahi karte: underlay 9216 par set karo aur bade DF pings se test karo.</li>
</ul></div>
`}};export{e as default};