var e=(e,t,n,r,i,a)=>`<text x="`+e+`" y="`+t+`" text-anchor="`+(a||`middle`)+`" class="`+(r||`svg-ink`)+`" font-size="`+(i||12)+`">`+n+`</text>`,t=(e,t,n,r,i)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" fill="`+i+`" stroke="#64748b" stroke-width="0.8"/>`,n=(n,r,i)=>{let a=600/32,o=``;return[0,8,16,24].forEach(t=>{o+=e(20+t*a+2,12,t,`svg-muted`,10,`start`)}),o+=e(618,12,31,`svg-muted`,10,`end`),n.forEach((n,r)=>{let i=20,s=18+r*34;n.forEach(n=>{let r=n[1]*a;o+=t(i,s,r,32,n[2])+e(i+r/2,s+20,n[0],`svg-ink`,n[3]||11),i+=r})}),`<div class="dia"><svg viewBox="0 0 640 `+(24+n.length*34)+`" role="img" aria-label="`+i+`">`+o+`</svg><p class="cap">`+r+`</p></div>`},r=[[[`Ver 4`,4,`#ddd6fe`],[`IHL`,4,`#ddd6fe`],[`DSCP (6)`,6,`#e2e8f0`],[`ECN`,2,`#e2e8f0`,9],[`Total Length (16)`,16,`#ddd6fe`]],[[`Identification (16)`,16,`#e2e8f0`],[`R`,1,`#fecaca`,9],[`DF`,1,`#fde68a`,9],[`MF`,1,`#fde68a`,9],[`Fragment Offset (13)`,13,`#e2e8f0`]],[[`TTL (8)`,8,`#fed7aa`],[`Protocol (8)`,8,`#fed7aa`],[`Header Checksum (16)`,16,`#fed7aa`]],[[`Source Address (32)`,32,`#bbf7d0`]],[[`Destination Address (32)`,32,`#bbf7d0`]],[[`Options, 0 to 40 bytes (present only when IHL is greater than 5)`,32,`#f1f5f9`,10]]],i=`<pre class="out">0010  00 30 3a 10 40 00 80 06 b9 b4 c0 a8 0a 0a cb 00

Internet Protocol Version 4, Src: 192.168.10.10, Dst: 203.0.113.80
    Version: 4
    Header Length: 20 bytes (5)
    Differentiated Services Field: 0x00 (DSCP: CS0 (default, best effort), ECN: Not-ECT)
    Total Length: 48
    Identification: 0x3a10 (14864)
    Flags: 0x40, Don't fragment
    Fragment Offset: 0
    <span class="hl">Time to Live: 128</span>
    <span class="hl">Protocol: TCP (6)</span>
    Header Checksum: 0xb9b4 [correct]</pre>`,a=`<pre class="out">Differentiated Services Field: 0xb8 (DSCP: EF (voice), ECN: Not-ECT)
Differentiated Services Field: 0x88 (DSCP: AF41 (video), ECN: Not-ECT)
Differentiated Services Field: 0xc0 (DSCP: CS6 (network control), ECN: Not-ECT)</pre>`,o={id:`ipv4-row-by-row`,h:{en:`The IPv4 header row by row: normal values, abnormal values and what they reveal`,hi:`IPv4 header row by row: normal values, abnormal values aur woh kya batate hain`},body:{en:`
<p>In ccna-models you met the IPv4 waybill. Now you inspect it the way a customs officer does: row by row, asking of every box "is this value normal, and if it is not, what does that tell me?" Most network faults leave a fingerprint in one of these twenty bytes.</p>

`+n(r,`The IPv4 header: five fixed rows (20 bytes) plus optional options. Orange boxes are rewritten by routers, yellow boxes are the fragmentation flags.`,`IPv4 header bit ruler`)+`

<h3>Row 1: version, IHL, DSCP/ECN, total length</h3>
<dl class="terms">
<dt>Version (4 bits)</dt><dd>Always 4 here. Anything else in an IPv4 EtherType frame is corrupt.</dd>
<dt>IHL (4 bits)</dt><dd>Header words of 4 bytes. Normal: 5 (20 bytes). 6 to 15 means options are present. Below 5 is illegal and the packet is discarded. The first byte is therefore <code>45</code> for almost every packet.</dd>
<dt>DSCP (6 bits) and ECN (2 bits)</dt><dd>Normal for ordinary traffic: 0x00. Voice is EF (46), carried as byte 0xb8; video AF41 (34) is 0x88; routing protocols use CS6 (48) = 0xc0. ECN values: 00 not capable, 01 or 10 capable, 11 congestion experienced. The byte equals DSCP x 4 + ECN. Real captures from the simulator:</dd>
</dl>
`+a+`
<dl class="terms">
<dt>Total Length (16 bits)</dt><dd>IP header plus data, in bytes: 20 to 65,535. On Ethernet it is at most 1500. It must equal the frame size minus 14 (minus 4 more if tagged), apart from padding. A value larger than what arrived means a truncated packet or a capture with a snap length; a frame bigger than the Total Length means padding (all zeros).</dd>
</dl>

<h3>Row 2: identification, flags and fragment offset</h3>
<dl class="terms">
<dt>Identification (16 bits)</dt><dd>A per-packet counter chosen by the sender; fragments of one packet share it. In the simulator's <code>tcp</code> flow PC1's packets carry 0x3a10, 0x3a12 (the GET) and 0x3a14 (the FIN) while the server counts independently from 0x7c20.</dd>
<dt>Flags (3 bits)</dt><dd>Bit 0 is reserved and must be 0. <b>DF</b> (don't fragment) is 0x4000 in the 16-bit word; <b>MF</b> (more fragments) is 0x2000. Normal TCP packets have DF = 1, so byte 6 is <code>40</code>. DF with MF together is contradictory: no sender should produce it. Note: the simulator prints the whole byte (0x40 or 0x20), while Wireshark prints the 3-bit value (0x2 or 0x1).</dd>
<dt>Fragment offset (13 bits)</dt><dd>Where this fragment starts, in units of 8 bytes. 0 on unfragmented packets and on the first fragment. Chapter 6 works through real numbers.</dd>
</dl>

<h3>Row 3: TTL, protocol, checksum</h3>
<p><b>TTL</b> is where a hop count meets the OS fingerprint. A reply that arrives with TTL 63 started at 64 and crossed one router. Real values from the simulator:</p>
<div class="tbl"><table class="cmp">
<tr><th>TTL seen</th><th>Likely start</th><th>Routers crossed</th><th>Where it appeared</th></tr>
<tr><td>63</td><td>64</td><td>1</td><td>ping reply from SRV in the ccna-models lab</td></tr>
<tr><td>61</td><td>64</td><td>3</td><td>port-unreachable from the server in the traceroute flow</td></tr>
<tr><td>52</td><td>64</td><td>12</td><td>web server replies in the tcp flow</td></tr>
<tr><td>117</td><td>128</td><td>11</td><td>DNS reply from 8.8.8.8</td></tr>
<tr><td>255</td><td>255</td><td>0</td><td>router-generated ICMP from the next hop</td></tr>
</table></div>
<p><b>Protocol</b>: 1 ICMP, 2 IGMP, 6 TCP, 17 UDP, 47 GRE, 50 ESP, 89 OSPF. An unexpected value is the first clue in firewall logs (chapter 1). The <b>Header Checksum</b> is the 16-bit ones-complement of the ones-complement sum of the header's 16-bit words, computed with the checksum field set to zero.</p>

<div class="eg"><p><b>Worked example: verify the checksum of the SYN by hand.</b> The ten header words are 4500 0030 3a10 4000 8006 [0000] c0a8 0a0a cb00 7150. Running sum: 4500 + 0030 = 4530; + 3a10 = 7f40; + 4000 = bf40; + 8006 = 13f46; + 0000 = 13f46; + c0a8 = 1ffee; + 0a0a = 209f8; + cb00 = 2d4f8; + 7150 = 34648. Fold the carry: 4648 + 3 = 464b. Complement: ffff - 464b = <b>b9b4</b>, exactly the value in the packet and the simulator's "[correct]". A router that lowers TTL from 128 to 127 changes the word 8006 to 7f06, so the sum falls by 0x0100, the complement rises by 0x0100 and the new checksum is <b>bab4</b>. Try it yourself.</p></div>

<h3>Rows 4 and 5, and the options</h3>
<p>Source and destination are 32 bits each. <b>Abnormal</b> values and their meaning: source 0.0.0.0 is legal only in a DHCP Discover (destination 255.255.255.255, seen in the simulator's DHCP flow); a source of 255.255.255.255 or a multicast address is never valid; source equal to destination is a classic malformed (LAND) packet; 169.254.x.x means a host that failed DHCP. <b>Options</b> exist only when IHL is above 5. Router Alert (used by IGMP) makes IHL 6; source-routing options are blocked by most networks because they let a sender choose the path.</p>

<h3>Reading the SYN row by row</h3>
`+i+`
<div class="warn"><p><b>Common mistakes.</b> Calling a "bad checksum" in a capture on the sending host a fault: NIC checksum offload fills the field after the capture point, so the sender's own packets look wrong while the receiver sees them correct. Reading the DSCP byte as the DSCP: 0xb8 is 184, the DSCP is 46. Expecting TTL to change inside one LAN: only routers decrement it.</p></div>

<div class="exam"><p><b>Exam traps.</b> IHL 5 = 20 bytes; the byte is 0x45. DF is the middle flag bit and MF the last. Fragment offset counts 8-byte blocks. The checksum covers the header only, and TTL and checksum change at every router. Protocol 6 TCP, 17 UDP, 1 ICMP, 89 OSPF.</p></div>

<div class="scn"><h4>"All our own packets have bad checksums"</h4><p>A junior engineer captured on a Linux server and saw hundreds of red lines saying "checksum incorrect" on outgoing packets, and opened a ticket about a faulty NIC. The same traffic captured on the switch port was perfect. The server's NIC offloaded checksum calculation to hardware, so the kernel handed the capture a packet with a placeholder value. Nothing was wrong on the wire.</p><p><b>Lesson:</b> validate checksums where the packet is received, not where it is sent.</p></div>

<div class="iv"><p class="q">"A packet arrives with IHL 8. What does that tell you?"</p><p>IHL 8 means 32 bytes of header: 12 bytes of options. Say which options matter (Router Alert, record route, source routing), that most are blocked or ignored in production, that the options come after the destination address and that the TCP or UDP header starts 32 bytes into the IP packet, not 20.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Byte 0x45 = version 4, IHL 5; IHL above 5 means options, below 5 is invalid.</li>
<li>DSCP byte = DSCP x 4 + ECN: EF is 0xb8, AF41 0x88, CS6 0xc0.</li>
<li>Total Length must equal frame size minus link header; padding and truncation show up as mismatches.</li>
<li>DF = 0x4000, MF = 0x2000, offset in 8-byte blocks; DF with MF is abnormal.</li>
<li>TTL and checksum change per router; initial TTLs of 64, 128 and 255 reveal OS and distance.</li>
</ul></div>
`,hi:`
<p>ccna-models mein aap IPv4 waybill se mile the. Ab hum use customs officer ki tarah jaanchte hain: row by row, har box ke baare mein poochte hue "kya yeh value normal hai, aur agar nahi to yeh mujhe kya batati hai?" Zyada tar network faults in bees bytes mein se kisi ek mein fingerprint chhod jaate hain.</p>

`+n(r,`IPv4 header: paanch fixed rows (20 bytes) aur optional options. Orange boxes routers dobara likhte hain, peele boxes fragmentation flags hain.`,`IPv4 header bit ruler`)+`

<h3>Row 1: version, IHL, DSCP/ECN, total length</h3>
<dl class="terms">
<dt>Version (4 bits)</dt><dd>Yahan hamesha 4. IPv4 EtherType wale frame mein koi aur value corrupt hai.</dd>
<dt>IHL (4 bits)</dt><dd>4-byte words mein header. Normal: 5 (20 bytes). 6 se 15 ka matlab options maujood hain. 5 se kam illegal hai aur packet discard hota hai. Isliye lagbhag har packet ka pehla byte <code>45</code> hota hai.</dd>
<dt>DSCP (6 bits) aur ECN (2 bits)</dt><dd>Aam traffic ke liye normal: 0x00. Voice EF (46) hai, byte 0xb8 ke roop mein; video AF41 (34) 0x88 hai; routing protocols CS6 (48) = 0xc0 use karte hain. ECN values: 00 capable nahi, 01 ya 10 capable, 11 congestion experienced. Byte = DSCP x 4 + ECN. Simulator ke real captures:</dd>
</dl>
`+a+`
<dl class="terms">
<dt>Total Length (16 bits)</dt><dd>IP header plus data bytes mein: 20 se 65,535. Ethernet par zyada se zyada 1500. Yeh frame size minus 14 (tagged ho to 4 aur kam) ke barabar hona chahiye, padding ke alawa. Jo aaya usse badi value ka matlab truncated packet ya snap length wala capture; Total Length se bada frame matlab padding (sab zero).</dd>
</dl>

<h3>Row 2: identification, flags aur fragment offset</h3>
<dl class="terms">
<dt>Identification (16 bits)</dt><dd>Sender ka chuna hua per-packet counter; ek packet ke fragments same value share karte hain. Simulator ke <code>tcp</code> flow mein PC1 ke packets 0x3a10, 0x3a12 (GET) aur 0x3a14 (FIN) carry karte hain jabki server 0x7c20 se apna alag count karta hai.</dd>
<dt>Flags (3 bits)</dt><dd>Bit 0 reserved hai aur 0 hona chahiye. <b>DF</b> (don't fragment) 16-bit word mein 0x4000 hai; <b>MF</b> (more fragments) 0x2000. Normal TCP packets mein DF = 1, isliye byte 6 <code>40</code> hota hai. DF aur MF saath mein contradictory hain: koi sender aisa nahi banata. Note: simulator poora byte print karta hai (0x40 ya 0x20), jabki Wireshark 3-bit value (0x2 ya 0x1) print karta hai.</dd>
<dt>Fragment offset (13 bits)</dt><dd>Yeh fragment kahan se shuru hota hai, 8-byte units mein. Unfragmented packets aur pehle fragment par 0. Chapter 6 real numbers ke saath samjhata hai.</dd>
</dl>

<h3>Row 3: TTL, protocol, checksum</h3>
<p><b>TTL</b> woh jagah hai jahan hop count OS fingerprint se milta hai. TTL 63 ke saath aaya reply 64 se shuru hua aur ek router paar kiya. Simulator ki real values:</p>
<div class="tbl"><table class="cmp">
<tr><th>TTL dikha</th><th>Shayad shuru</th><th>Routers paar</th><th>Kahan dikha</th></tr>
<tr><td>63</td><td>64</td><td>1</td><td>ccna-models lab mein SRV ka ping reply</td></tr>
<tr><td>61</td><td>64</td><td>3</td><td>traceroute flow mein server ka port-unreachable</td></tr>
<tr><td>52</td><td>64</td><td>12</td><td>tcp flow mein web server ke replies</td></tr>
<tr><td>117</td><td>128</td><td>11</td><td>8.8.8.8 ka DNS reply</td></tr>
<tr><td>255</td><td>255</td><td>0</td><td>agle hop ka router-generated ICMP</td></tr>
</table></div>
<p><b>Protocol</b>: 1 ICMP, 2 IGMP, 6 TCP, 17 UDP, 47 GRE, 50 ESP, 89 OSPF. Anjaan value firewall logs ka pehla clue hai (chapter 1). <b>Header Checksum</b> header ke 16-bit words ke ones-complement sum ka ones-complement hai, checksum field ko zero rakhkar nikala hua.</p>

<div class="eg"><p><b>Worked example: SYN ka checksum haath se verify karo.</b> Header ke das words hain 4500 0030 3a10 4000 8006 [0000] c0a8 0a0a cb00 7150. Running sum: 4500 + 0030 = 4530; + 3a10 = 7f40; + 4000 = bf40; + 8006 = 13f46; + 0000 = 13f46; + c0a8 = 1ffee; + 0a0a = 209f8; + cb00 = 2d4f8; + 7150 = 34648. Carry fold karo: 4648 + 3 = 464b. Complement: ffff - 464b = <b>b9b4</b>, bilkul packet aur simulator ke "[correct]" wali value. Router jab TTL 128 se 127 karta hai to word 8006 se 7f06 ho jaata hai aur checksum dobara nikalna padta hai: sum 0x0100 ghatega, isliye complement 0x0100 badhega, yaani b9b4 se bab4. Khud try karo.</p></div>

<h3>Rows 4 aur 5, aur options</h3>
<p>Source aur destination har ek 32 bits. <b>Abnormal</b> values aur unka matlab: source 0.0.0.0 sirf DHCP Discover mein legal hai (destination 255.255.255.255, simulator ke DHCP flow mein dikhta hai); source 255.255.255.255 ya multicast address kabhi valid nahi; source = destination classic malformed (LAND) packet hai; 169.254.x.x ka matlab DHCP fail hua host. <b>Options</b> sirf tab jab IHL 5 se zyada ho. Router Alert (IGMP use karta hai) IHL ko 6 kar deta hai; source-routing options zyada tar networks block karte hain kyunki sender path chun leta hai.</p>

<h3>SYN ko row by row padhna</h3>
`+i+`
<div class="warn"><p><b>Common galtiyan.</b> Sending host par capture mein "bad checksum" ko fault kehna: NIC checksum offload capture point ke baad field bharta hai, isliye sender ke apne packets galat dikhte hain jabki receiver ko sahi milte hain. DSCP byte ko hi DSCP padhna: 0xb8 matlab 184, DSCP 46 hai. Ek LAN ke andar TTL badalne ki ummeed: sirf routers ise ghatate hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> IHL 5 = 20 bytes; byte 0x45. DF beech ka flag bit hai aur MF aakhri. Fragment offset 8-byte blocks gintaa hai. Checksum sirf header cover karta hai, aur TTL aur checksum har router par badalte hain. Protocol 6 TCP, 17 UDP, 1 ICMP, 89 OSPF.</p></div>

<div class="scn"><h4>"Hamare saare packets ke checksum kharab hain"</h4><p>Ek junior engineer ne Linux server par capture kiya aur outgoing packets par "checksum incorrect" likhi sainkdon red lines dekhi, aur faulty NIC ka ticket khol diya. Wahi traffic switch port par capture karne par bilkul theek tha. Server ke NIC ne checksum calculation hardware ko offload kar rakha tha, isliye kernel ne capture ko placeholder value wala packet diya. Wire par kuch galat nahi tha.</p><p><b>Seekh:</b> checksum wahan validate karo jahan packet receive hota hai, jahan bheja jaata hai wahan nahi.</p></div>

<div class="iv"><p class="q">"Ek packet IHL 8 ke saath aaya. Yeh kya batata hai?"</p><p>IHL 8 matlab 32 bytes header: 12 bytes options. Batao kaunse options matter karte hain (Router Alert, record route, source routing), ki production mein zyada tar block ya ignore hote hain, ki options destination address ke baad aate hain aur TCP ya UDP header IP packet mein 20 nahi, 32 bytes par shuru hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Byte 0x45 = version 4, IHL 5; IHL 5 se zyada ka matlab options, 5 se kam invalid.</li>
<li>DSCP byte = DSCP x 4 + ECN: EF 0xb8, AF41 0x88, CS6 0xc0.</li>
<li>Total Length frame size minus link header ke barabar honi chahiye; padding aur truncation mismatch ke roop mein dikhte hain.</li>
<li>DF = 0x4000, MF = 0x2000, offset 8-byte blocks mein; DF ke saath MF abnormal hai.</li>
<li>TTL aur checksum har router par badalte hain; 64, 128 aur 255 ke initial TTLs OS aur doori batate hain.</li>
</ul></div>
`}};export{o as default};