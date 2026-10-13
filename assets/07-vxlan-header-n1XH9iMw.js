var e={id:`vxlan-header`,h:{en:`VXLAN: why it exists and the header byte by byte`,hi:`VXLAN: kyun bana aur header byte by byte`},body:{en:`
<p>Imagine two offices of the same company in different buildings. People want the same intercom extension range in both buildings, as if they sat on one floor. Instead of laying a private cable between the buildings, you put every intercom call into a sealed envelope and send it through the normal city post. The envelope says "floor 10010"; the receiving building opens it and rings the right extension. That is VXLAN: a Layer 2 floor stretched across a routed city.</p>

<h3>Why VXLAN exists</h3>
<ul>
<li><b>VLANs do not cross routers.</b> Campus and data center cores are now routed (Layer 3 to the access or leaf) for fast convergence and ECMP, yet some applications still need the same subnet in two places: VM mobility, clusters, wireless roaming, IoT.</li>
<li><b>12-bit VLAN IDs give only 4094 segments.</b> Multitenant networks need far more. VXLAN's 24-bit <b>VNI</b> gives 16,777,216.</li>
<li><b>Spanning tree is fragile at scale.</b> A routed underlay uses all links with ECMP and has no blocked ports; Layer 2 only exists at the edges, inside the tunnels.</li>
</ul>
<p>The devices at the tunnel ends are <b>VTEPs</b> (VXLAN Tunnel Endpoints). A VTEP has a <b>local side</b> (access ports in VLANs) and a <b>fabric side</b> (a loopback IP in the underlay). On Cisco switches the logical tunnel interface is <b>nve1</b> (Network Virtualization Edge). The underlay routes only VTEP loopbacks, like 1.1.1.1 and 2.2.2.2 in the lab.</p>

<h3>The packet, header by header</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="VXLAN encapsulation">
<rect x="10" y="30" width="95" height="60" rx="6" fill="#e2e8f0"/><text x="57" y="54" text-anchor="middle" class="svg-ink" font-size="13">Outer Eth</text><text x="57" y="72" text-anchor="middle" class="svg-muted" font-size="12">14</text>
<rect x="110" y="30" width="110" height="60" rx="6" fill="#fed7aa"/><text x="165" y="54" text-anchor="middle" class="svg-ink" font-size="13">Outer IPv4</text><text x="165" y="72" text-anchor="middle" class="svg-muted" font-size="12">20, VTEP→VTEP</text>
<rect x="225" y="30" width="90" height="60" rx="6" fill="#fde68a"/><text x="270" y="54" text-anchor="middle" class="svg-ink" font-size="13">UDP</text><text x="270" y="72" text-anchor="middle" class="svg-muted" font-size="12">8, dst 4789</text>
<rect x="320" y="30" width="90" height="60" rx="6" fill="#ddd6fe"/><text x="365" y="54" text-anchor="middle" class="svg-ink" font-size="13">VXLAN</text><text x="365" y="72" text-anchor="middle" class="svg-muted" font-size="12">8, VNI</text>
<rect x="415" y="30" width="215" height="60" rx="6" fill="#bbf7d0"/><text x="522" y="54" text-anchor="middle" class="svg-ink" font-size="13">Original Ethernet frame</text><text x="522" y="72" text-anchor="middle" class="svg-muted" font-size="12">PC1 MAC → PC2 MAC, IP, data</text>
<line x1="10" y1="110" x2="410" y2="110" stroke="#64748b" stroke-width="2"/><text x="210" y="130" text-anchor="middle" class="svg-accent" font-size="13">added by VTEP1: 14 + 20 + 8 + 8 = 50 bytes</text>
<text x="165" y="170" text-anchor="middle" class="svg-muted" font-size="12">1.1.1.1 → 2.2.2.2</text><text x="522" y="170" text-anchor="middle" class="svg-muted" font-size="12">192.168.10.11 → 192.168.10.12</text>
</svg><p class="cap">A ping from PC1 to PC2 on the SPINE link. Only the grey and orange headers are used by the underlay.</p></div>

<table class="cmp"><tr><th>Header</th><th>Size</th><th>What is inside (lab values)</th></tr>
<tr><td>Outer Ethernet</td><td>14 bytes (18 with 802.1Q)</td><td>Source = VTEP1's uplink MAC, destination = next-hop SPINE MAC, EtherType 0x0800. Rewritten at every underlay hop.</td></tr>
<tr><td>Outer IPv4</td><td>20 bytes</td><td>Source 1.1.1.1 (VTEP1 Loopback0), destination 2.2.2.2 (or a multicast group for BUM), protocol 17.</td></tr>
<tr><td>Outer UDP</td><td>8 bytes</td><td>Destination <b>4789</b> (IANA). Source = hash of the inner frame's headers for ECMP entropy. Checksum usually 0.</td></tr>
<tr><td>VXLAN</td><td>8 bytes</td><td>Flags, reserved bits and the 24-bit VNI (details below).</td></tr>
<tr><td>Inner Ethernet</td><td>14 bytes + payload</td><td>The original frame from PC1, normally with its 802.1Q tag removed; the VNI replaces the VLAN.</td></tr>
</table>

<h3>The VXLAN header, byte by byte</h3>
<table class="cmp"><tr><th>Byte</th><th>Field</th><th>Value</th></tr>
<tr><td>0</td><td>Flags: R R R R I R R R</td><td>0x08: only the <b>I</b> flag set, meaning "the VNI is valid".</td></tr>
<tr><td>1–3</td><td>Reserved (24 bits)</td><td>0 in standard VXLAN. VXLAN-GPO uses these bits for a 16-bit <b>Group Policy ID</b>.</td></tr>
<tr><td>4–6</td><td>VNI (24 bits)</td><td>10010 decimal = 0x00271A.</td></tr>
<tr><td>7</td><td>Reserved (8 bits)</td><td>0.</td></tr>
</table>
<pre class="out">Virtual eXtensible Local Area Network
    Flags: 0x0800, VXLAN Network ID (VNI)
        0... .... .... .... = GBP Extension: Not defined
        .... 1... .... .... = VXLAN Network ID (VNI): True
<span class="hl">    VXLAN Network Identifier (VNI): 10010</span>
    Reserved: 0</pre>
<p>That is a capture decode of the header in the lab: raw bytes <code>08 00 00 00 00 27 1A 00</code>.</p>

<h3>VXLAN-GPO: room for a security tag</h3>
<p>The <b>Group Policy Option</b> (an IETF draft that Cisco uses in SD-Access) sets a G flag in byte 0 and puts a <b>16-bit Group Policy ID</b> in bytes 2–3. SD-Access writes the source endpoint's <b>SGT</b> there, so the egress switch can enforce group-based policy without looking anything up. Chapter 10 builds on this.</p>

<div class="eg"><p><b>Worked example: overhead and MTU.</b> PC1 sends a 1500-byte IP packet. Its Ethernet frame without FCS is 1514 bytes. VTEP1 adds VXLAN (8) + UDP (8) + outer IPv4 (20) = 36 bytes, so the outer IP packet is <b>1550 bytes</b>, and the outer Ethernet header adds 14 more on the wire. Hence the rule: <b>VXLAN adds 50 bytes</b> and the underlay interfaces need an IP MTU of at least <b>1550</b>. Most designs simply use jumbo frames (9216 on Nexus, 9100 in SD-Access). An outer 802.1Q tag makes it 54; an IPv6 underlay makes it 70.</p></div>

<div class="warn"><p><b>Common mistake.</b> Raising the MTU on the VTEPs but not on every underlay hop. Small pings work, ARP works, but large packets vanish at the one spine interface still at 1500. Check the MTU on every link in the path.</p></div>

<div class="exam"><p><b>Exam trap.</b> VXLAN uses <b>UDP 4789</b>; LISP data uses 4341 and LISP control 4342. The VNI is <b>24 bits</b>; the VLAN ID is 12 bits. VXLAN overhead is <b>50 bytes</b> including the outer Ethernet header; LISP's 36 bytes does not include one. VXLAN carries <b>Layer 2 frames</b> (MAC-in-UDP); LISP carries IP packets.</p></div>

<div class="scn"><h4>The port the firewall did not know</h4><p>A company stretched a VLAN between two buildings with VXLAN. The underlay path crossed an internal firewall pair. Pings worked after someone allowed ICMP, but nothing else did. The firewall log showed drops of UDP to port 4789 between 1.1.1.1 and 2.2.2.2: the rule only allowed the inner server subnets, which the firewall never sees because they are inside the tunnel. Permitting UDP 4789 between the VTEP loopbacks fixed it; the security team then enforced policy on the inner traffic at the VTEP instead.</p><p><b>Lesson:</b> underlay devices see only VTEP-to-VTEP UDP 4789. Rules written for inner addresses do not match.</p></div>

<div class="iv"><p class="q">"Explain the VXLAN header and the overhead calculation."</p><p>Strong answer: VXLAN is MAC-in-UDP. The VTEP adds an 8-byte VXLAN header (flags with the I bit set, 24 reserved bits, a 24-bit VNI, 8 reserved bits), an 8-byte UDP header with destination 4789 and a hashed source port for ECMP, a 20-byte outer IPv4 header between VTEP loopbacks and a 14-byte outer Ethernet header: 50 bytes. So a 1500-byte host MTU needs a 1550 underlay MTU; jumbo frames are standard. Mention that VXLAN-GPO carries a 16-bit group ID used by SD-Access for SGTs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VXLAN stretches Layer 2 over a routed underlay: MAC-in-UDP between VTEPs.</li>
<li>Headers: outer Ethernet 14 + outer IPv4 20 + UDP 8 + VXLAN 8 = 50 bytes.</li>
<li>UDP destination 4789; source port is a hash for ECMP entropy.</li>
<li>VXLAN header: flags 0x08 (I bit), 24-bit VNI (16 million segments).</li>
<li>Underlay MTU at least 1550; jumbo frames in practice. VXLAN-GPO adds a 16-bit group tag.</li>
</ul></div>
`,hi:`
<p>Ek hi company ke do offices socho alag buildings mein. Log dono buildings mein same intercom extension range chahte hain, jaise ek hi floor par baithe hon. Buildings ke beech private cable bichhane ki jagah aap har intercom call ko ek sealed lifafe mein daal kar normal city post se bhejte ho. Lifafe par likha hai "floor 10010"; receive karne wali building use kholti hai aur sahi extension bajati hai. Yahi VXLAN hai: ek Layer 2 floor jo routed shehar ke paar faila hua hai.</p>

<h3>VXLAN kyun bana</h3>
<ul>
<li><b>VLANs routers paar nahi karte.</b> Campus aur data center cores ab routed hain (access ya leaf tak Layer 3) fast convergence aur ECMP ke liye, phir bhi kuch applications ko do jagah same subnet chahiye: VM mobility, clusters, wireless roaming, IoT.</li>
<li><b>12-bit VLAN IDs sirf 4094 segments dete hain.</b> Multitenant networks ko kahin zyada chahiye. VXLAN ka 24-bit <b>VNI</b> 16,777,216 deta hai.</li>
<li><b>Bade scale par spanning tree kamzor hai.</b> Routed underlay ECMP se saare links use karta hai aur koi blocked port nahi hota; Layer 2 sirf edges par, tunnels ke andar rehta hai.</li>
</ul>
<p>Tunnel ke dono ends ke devices <b>VTEPs</b> (VXLAN Tunnel Endpoints) hain. VTEP ki ek <b>local side</b> hoti hai (VLANs mein access ports) aur ek <b>fabric side</b> (underlay mein loopback IP). Cisco switches par logical tunnel interface <b>nve1</b> (Network Virtualization Edge) hai. Underlay sirf VTEP loopbacks route karta hai, jaise lab mein 1.1.1.1 aur 2.2.2.2.</p>

<h3>Packet, header by header</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="VXLAN encapsulation">
<rect x="10" y="30" width="95" height="60" rx="6" fill="#e2e8f0"/><text x="57" y="54" text-anchor="middle" class="svg-ink" font-size="13">Outer Eth</text><text x="57" y="72" text-anchor="middle" class="svg-muted" font-size="12">14</text>
<rect x="110" y="30" width="110" height="60" rx="6" fill="#fed7aa"/><text x="165" y="54" text-anchor="middle" class="svg-ink" font-size="13">Outer IPv4</text><text x="165" y="72" text-anchor="middle" class="svg-muted" font-size="12">20, VTEP→VTEP</text>
<rect x="225" y="30" width="90" height="60" rx="6" fill="#fde68a"/><text x="270" y="54" text-anchor="middle" class="svg-ink" font-size="13">UDP</text><text x="270" y="72" text-anchor="middle" class="svg-muted" font-size="12">8, dst 4789</text>
<rect x="320" y="30" width="90" height="60" rx="6" fill="#ddd6fe"/><text x="365" y="54" text-anchor="middle" class="svg-ink" font-size="13">VXLAN</text><text x="365" y="72" text-anchor="middle" class="svg-muted" font-size="12">8, VNI</text>
<rect x="415" y="30" width="215" height="60" rx="6" fill="#bbf7d0"/><text x="522" y="54" text-anchor="middle" class="svg-ink" font-size="13">Original Ethernet frame</text><text x="522" y="72" text-anchor="middle" class="svg-muted" font-size="12">PC1 MAC → PC2 MAC, IP, data</text>
<line x1="10" y1="110" x2="410" y2="110" stroke="#64748b" stroke-width="2"/><text x="210" y="130" text-anchor="middle" class="svg-accent" font-size="13">VTEP1 jodta hai: 14 + 20 + 8 + 8 = 50 bytes</text>
<text x="165" y="170" text-anchor="middle" class="svg-muted" font-size="12">1.1.1.1 → 2.2.2.2</text><text x="522" y="170" text-anchor="middle" class="svg-muted" font-size="12">192.168.10.11 → 192.168.10.12</text>
</svg><p class="cap">SPINE link par PC1 se PC2 ka ping. Underlay sirf grey aur orange headers use karta hai.</p></div>

<table class="cmp"><tr><th>Header</th><th>Size</th><th>Andar kya hai (lab values)</th></tr>
<tr><td>Outer Ethernet</td><td>14 bytes (802.1Q ke saath 18)</td><td>Source = VTEP1 ka uplink MAC, destination = next-hop SPINE MAC, EtherType 0x0800. Har underlay hop par dobara likha jaata hai.</td></tr>
<tr><td>Outer IPv4</td><td>20 bytes</td><td>Source 1.1.1.1 (VTEP1 Loopback0), destination 2.2.2.2 (ya BUM ke liye multicast group), protocol 17.</td></tr>
<tr><td>Outer UDP</td><td>8 bytes</td><td>Destination <b>4789</b> (IANA). Source = ECMP entropy ke liye inner frame ke headers ka hash. Checksum aksar 0.</td></tr>
<tr><td>VXLAN</td><td>8 bytes</td><td>Flags, reserved bits aur 24-bit VNI (details neeche).</td></tr>
<tr><td>Inner Ethernet</td><td>14 bytes + payload</td><td>PC1 ka original frame, normally 802.1Q tag hata kar; VNI VLAN ki jagah le leta hai.</td></tr>
</table>

<h3>VXLAN header, byte by byte</h3>
<table class="cmp"><tr><th>Byte</th><th>Field</th><th>Value</th></tr>
<tr><td>0</td><td>Flags: R R R R I R R R</td><td>0x08: sirf <b>I</b> flag set, matlab "VNI valid hai".</td></tr>
<tr><td>1–3</td><td>Reserved (24 bits)</td><td>Standard VXLAN mein 0. VXLAN-GPO in bits ko 16-bit <b>Group Policy ID</b> ke liye use karta hai.</td></tr>
<tr><td>4–6</td><td>VNI (24 bits)</td><td>10010 decimal = 0x00271A.</td></tr>
<tr><td>7</td><td>Reserved (8 bits)</td><td>0.</td></tr>
</table>
<pre class="out">Virtual eXtensible Local Area Network
    Flags: 0x0800, VXLAN Network ID (VNI)
        0... .... .... .... = GBP Extension: Not defined
        .... 1... .... .... = VXLAN Network ID (VNI): True
<span class="hl">    VXLAN Network Identifier (VNI): 10010</span>
    Reserved: 0</pre>
<p>Yeh lab mein header ka capture decode hai: raw bytes <code>08 00 00 00 00 27 1A 00</code>.</p>

<h3>VXLAN-GPO: security tag ki jagah</h3>
<p><b>Group Policy Option</b> (ek IETF draft jise Cisco SD-Access mein use karta hai) byte 0 mein G flag set karta hai aur bytes 2–3 mein <b>16-bit Group Policy ID</b> rakhta hai. SD-Access wahan source endpoint ka <b>SGT</b> likhta hai, taaki egress switch bina kuch dhoonde group-based policy enforce kar sake. Chapter 10 isi par banta hai.</p>

<div class="eg"><p><b>Worked example: overhead aur MTU.</b> PC1 1500-byte IP packet bhejta hai. Bina FCS ke uska Ethernet frame 1514 bytes ka hai. VTEP1 VXLAN (8) + UDP (8) + outer IPv4 (20) = 36 bytes jodta hai, to outer IP packet <b>1550 bytes</b> ka hai, aur wire par outer Ethernet header 14 aur jodta hai. Isliye rule: <b>VXLAN 50 bytes jodta hai</b> aur underlay interfaces ko kam se kam <b>1550</b> IP MTU chahiye. Zyada tar designs seedhe jumbo frames use karte hain (Nexus par 9216, SD-Access mein 9100). Outer 802.1Q tag ke saath 54; IPv6 underlay ke saath 70.</p></div>

<div class="warn"><p><b>Common galti.</b> VTEPs par MTU badhana lekin har underlay hop par nahi. Chhote pings chalte hain, ARP chalta hai, lekin bade packets us ek spine interface par gayab ho jaate hain jo ab bhi 1500 par hai. Path ke har link par MTU check karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> VXLAN <b>UDP 4789</b> use karta hai; LISP data 4341 aur LISP control 4342. VNI <b>24 bits</b> ka hai; VLAN ID 12 bits. VXLAN overhead outer Ethernet header ke saath <b>50 bytes</b> hai; LISP ke 36 bytes mein woh shaamil nahi. VXLAN <b>Layer 2 frames</b> le jaata hai (MAC-in-UDP); LISP IP packets.</p></div>

<div class="scn"><h4>Woh port jo firewall ko nahi pata tha</h4><p>Ek company ne VXLAN se do buildings ke beech VLAN stretch kiya. Underlay path ek internal firewall pair se guzarta tha. Kisi ne ICMP allow kiya to pings chal gaye, lekin aur kuch nahi. Firewall log mein 1.1.1.1 aur 2.2.2.2 ke beech UDP port 4789 ke drops dikhe: rule sirf inner server subnets allow karta tha, jo firewall ko kabhi dikhte hi nahi kyunki woh tunnel ke andar hain. VTEP loopbacks ke beech UDP 4789 permit karne se theek hua; phir security team ne inner traffic par policy VTEP par enforce ki.</p><p><b>Seekh:</b> underlay devices ko sirf VTEP-se-VTEP UDP 4789 dikhta hai. Inner addresses ke liye likhe rules match nahi hote.</p></div>

<div class="iv"><p class="q">"VXLAN header aur overhead calculation samjhao."</p><p>Strong answer: VXLAN MAC-in-UDP hai. VTEP ek 8-byte VXLAN header (I bit set wale flags, 24 reserved bits, 24-bit VNI, 8 reserved bits), destination 4789 aur ECMP ke liye hashed source port wala 8-byte UDP header, VTEP loopbacks ke beech 20-byte outer IPv4 header aur 14-byte outer Ethernet header jodta hai: 50 bytes. Isliye 1500-byte host MTU ko 1550 underlay MTU chahiye; jumbo frames standard hain. Batao ki VXLAN-GPO ek 16-bit group ID le jaata hai jise SD-Access SGTs ke liye use karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VXLAN Layer 2 ko routed underlay par failata hai: VTEPs ke beech MAC-in-UDP.</li>
<li>Headers: outer Ethernet 14 + outer IPv4 20 + UDP 8 + VXLAN 8 = 50 bytes.</li>
<li>UDP destination 4789; source port ECMP entropy ke liye hash hai.</li>
<li>VXLAN header: flags 0x08 (I bit), 24-bit VNI (16 million segments).</li>
<li>Underlay MTU kam se kam 1550; practice mein jumbo frames. VXLAN-GPO 16-bit group tag jodta hai.</li>
</ul></div>
`}};export{e as default};