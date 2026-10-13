var e=(e,t,n,r,i,a)=>`<text x="`+e+`" y="`+t+`" text-anchor="`+(a||`middle`)+`" class="`+(r||`svg-ink`)+`" font-size="`+(i||12)+`">`+n+`</text>`,t=(e,t,n,r,i)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" fill="`+i+`" stroke="#64748b" stroke-width="0.8"/>`,n=(e,t,n,r)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="1.6"/><polygon points="`+n+`,`+r+` `+(n-7)+`,`+(r-4)+` `+(n-7)+`,`+(r+4)+`" fill="#64748b"/>`,r=(r,i,a,o)=>{let s=``,c=(n,r,i,a,o)=>t(n,40,r,56,i)+e(n+r/2,62,a,`svg-ink`,13)+e(n+r/2,82,o,`svg-muted`,11);return s+=c(10,130,`#bae6fd`,`Ethernet II`,`14 bytes`),s+=c(170,130,`#ddd6fe`,`IPv4`,`20 bytes`),s+=c(330,130,`#fde68a`,`TCP`,`28 bytes (SYN)`),s+=c(490,140,`#bbf7d0`,`Payload`,`0 bytes in a SYN`),s+=n(140,68,170,68)+n(300,68,330,68)+n(460,68,490,68),s+=e(75,28,r,`svg-accent`,12)+e(235,28,i,`svg-accent`,12)+e(395,28,a,`svg-accent`,12)+e(560,28,o,`svg-accent`,12),s+=e(320,128,`62 bytes in the capture = 14 + 20 + 28`,`svg-ink`,13),s+=e(320,150,`Each header ends with a field that names the next one`,`svg-muted`,12),s},i=(e,t)=>`<div class="dia"><svg viewBox="0 0 640 165" role="img" aria-label="Next-header chain">`+e+`</svg><p class="cap">`+t+`</p></div>`,a=`<pre class="out">0000  52 54 00 b2 00 01 52 54 00 a1 00 10 <span class="hl">08 00</span> <span class="hl">45</span> 00
0010  00 30 3a 10 40 00 80 <span class="hl">06</span> b9 b4 c0 a8 0a 0a cb 00
0020  71 50 <span class="hl">c3 ca 00 50</span> 6a 1b 2c 3d 00 00 00 00 <span class="hl">70</span> 02
0030  fa f0 26 b8 00 00 02 04 05 b4 01 01 04 02</pre>`,o={id:`reading-headers`,h:{en:`Reading any header: bits, bytes, hex and the next-header chain`,hi:`Koi bhi header padhna: bits, bytes, hex aur next-header chain`},body:{en:`
<p>A courier parcel travels inside a box, inside a bigger box, inside a delivery crate. Each wrapper carries its own label, and every label ends with one small line that says <b>what is inside me</b>. A packet works exactly like that. Ethernet wraps IP, IP wraps TCP, TCP wraps your application data, and each layer's header ends with a field that names the next header. If you can read that chain in a raw hex dump, no capture will ever frighten you again.</p>

<div class="note"><p><b>What you will learn.</b> In this module you go one level deeper than the introduction in <i>ccna-models</i>: every field of the Ethernet, 802.1Q, ARP, IPv4, ICMP, TCP and UDP headers, what a <b>normal</b> value looks like, what an <b>abnormal</b> value tells you, and how to prove a fault from a capture. <b>Prerequisites:</b> the encapsulation and capture chapters of ccna-models, and basic binary and hex from the IPv4 addressing module. This chapter gives you the reading skills used in every later chapter.</p></div>

<h3>Bits, bytes and hex in thirty seconds</h3>
<p>A <b>bit</b> is 0 or 1. A <b>byte</b> is 8 bits. Half a byte (4 bits) is a <b>nibble</b>, and one hexadecimal digit describes exactly one nibble, which is why hex is the natural way to print bytes: two hex digits per byte, no more arithmetic.</p>
<div class="tbl"><table class="cmp">
<tr><th>Hex byte</th><th>Binary</th><th>Decimal</th><th>Where you meet it</th></tr>
<tr><td>0x45</td><td>0100 0101</td><td>69</td><td>first IPv4 byte: version 4, header length 5 words</td></tr>
<tr><td>0x40</td><td>0100 0000</td><td>64</td><td>a Linux or lab-PC TTL</td></tr>
<tr><td>0x80</td><td>1000 0000</td><td>128</td><td>a Windows TTL, or the DF flag as the top bits of a byte</td></tr>
<tr><td>0xb8</td><td>1011 1000</td><td>184</td><td>DSCP byte for voice: 101110 (46, EF) then ECN 00</td></tr>
<tr><td>0x18</td><td>0001 1000</td><td>24</td><td>TCP flags PSH + ACK</td></tr>
</table></div>

<h3>Network byte order and bit numbering</h3>
<p>Every multi-byte number in a protocol header is sent <b>big-endian</b>: the most significant byte first. This is called <b>network byte order</b>. Port 80 is not stored as <code>50 00</code> but as <code>00 50</code>. Port 50122 is <code>c3 ca</code> (0xc3 x 256 + 0xca = 50122). Length 1500 is <code>05 dc</code>. In RFC diagrams, bit 0 is the <b>leftmost, most significant</b> bit of the first byte, and the diagram is drawn 32 bits (4 bytes) wide, so one row equals four bytes.</p>

<h3>A real hex dump, decoded</h3>
<p>This is the first packet of the Packet Studio <code>tcp</code> flow: PC1 (192.168.10.10) sending a TCP SYN to 203.0.113.80 port 80. The highlighted bytes are the "next header" selectors.</p>
`+a+`
<div class="tbl"><table class="cmp">
<tr><th>Offset</th><th>Bytes</th><th>Meaning</th></tr>
<tr><td>0 to 5</td><td>52 54 00 b2 00 01</td><td>Ethernet destination: R1's MAC (the gateway)</td></tr>
<tr><td>6 to 11</td><td>52 54 00 a1 00 10</td><td>Ethernet source: PC1</td></tr>
<tr><td>12 to 13</td><td>08 00</td><td>EtherType 0x0800: an IPv4 header follows</td></tr>
<tr><td>14</td><td>45</td><td>Version 4, IHL 5 (5 x 4 = 20 bytes)</td></tr>
<tr><td>16 to 17</td><td>00 30</td><td>Total Length 48</td></tr>
<tr><td>22 to 23</td><td>80 06</td><td>TTL 128, Protocol 6: a TCP header follows</td></tr>
<tr><td>26 to 33</td><td>c0 a8 0a 0a cb 00 71 50</td><td>192.168.10.10 to 203.0.113.80</td></tr>
<tr><td>34 to 37</td><td>c3 ca 00 50</td><td>Source port 50122, destination port 80</td></tr>
<tr><td>46</td><td>70</td><td>Data offset 7 (7 x 4 = 28 bytes of TCP header)</td></tr>
<tr><td>47</td><td>02</td><td>Flags: SYN only</td></tr>
</table></div>

`+i(r(`EtherType 0x0800`,`Protocol 6`,`Dst port 80`,`HTTP`),`The next-header chain of the SYN. The last hop of the chain is the destination port, which tells the server which application gets the bytes.`)+`

<h3>The next-header chain</h3>
<p>Every decoder, from Wireshark to the simulator's capture panel, simply follows the selector at the end of each header:</p>
<dl class="terms">
<dt>EtherType (Ethernet or 802.1Q)</dt><dd>0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6, 0x8100 a VLAN tag comes first, 0x88CC LLDP.</dd>
<dt>IP Protocol (IPv4) or Next Header (IPv6)</dt><dd>1 ICMP, 6 TCP, 17 UDP, 89 OSPF, 47 GRE, 50 ESP.</dd>
<dt>TCP or UDP destination port</dt><dd>80 HTTP, 53 DNS, 123 NTP: the application on top.</dd>
<dt>Header length fields</dt><dd>IHL and TCP Data Offset (both count 32-bit words) say <b>where the next header starts</b>. Multiply by 4.</dd>
</dl>

<div class="eg"><p><b>Worked example: do the lengths agree?</b> The capture shows a 62-byte frame. Subtract the 14-byte Ethernet header: 48, which equals the IP Total Length. Subtract the IP header (IHL 5 x 4 = 20): 28, which equals the TCP header (Data Offset 7 x 4 = 28). The TCP options are 28 - 20 = 8 bytes (<code>02 04 05 b4 01 01 04 02</code>), so the SYN carries <b>0 bytes of payload</b>. Now the GET in the same flow: Total Length 124, minus 20, minus 20 = 84 bytes of HTTP text, exactly the "Len: 84" the analyser prints, and 14 + 124 = 138 bytes on the wire. When a length does not add up, something altered, truncated or padded the packet.</p></div>

<h3>Using it in the capture panel</h3>
<p>The display filters use the same names as the fields you just decoded. They only show packets that match, so you can go straight to the header you want:</p>
<pre class="code"><span class="c">! Show only the SYN that starts a connection (no ACK yet)</span>
tcp.flags.syn == 1 &amp;&amp; tcp.flags.ack == 0
<span class="c">! Packets that have crossed at least one router (TTL below the PC default of 64)</span>
ip.ttl &lt; 64
<span class="c">! Only broadcast frames</span>
eth.dst == ff:ff:ff:ff:ff:ff</pre>

<div class="warn"><p><b>Common mistakes.</b> Reading <code>00 50</code> as 50 hundreds or <code>50 00</code> as port 80: always big-endian. Forgetting that IHL and Data Offset count <b>words</b>, not bytes. Counting the 4-byte FCS or the preamble as part of the capture: most captures show frames without the FCS, so the minimum you see is 60 bytes, not 64.</p></div>

<div class="exam"><p><b>Exam traps.</b> Network byte order is big-endian. IPv4 header = IHL x 4 bytes, minimum 20 and maximum 60. TCP header = Data Offset x 4 bytes, minimum 20 and maximum 60. The EtherType and the IP Protocol are different selectors at different layers: 0x0800 is not "protocol 8".</p></div>

<div class="scn"><h4>The firewall that ate OSPF</h4><p>After a firewall was inserted between two routers, OSPF stayed down. The firewall's drop log showed only <code>proto=0x59 src=10.0.12.1 dst=224.0.0.5</code>. Nobody recognised "0x59" until an engineer converted it: 0x59 is 5 x 16 + 9 = 89, the IP protocol number of OSPF, and 224.0.0.5 is the AllSPFRouters group. The hellos were being dropped as an unknown protocol. A rule permitting IP protocol 89 between the two router addresses brought the adjacency up within a hello interval.</p><p><b>Lesson:</b> a single selector byte tells you which protocol was blocked. Learn the common values by heart.</p></div>

<div class="iv"><p class="q">"How do you find the TCP header inside a raw frame?"</p><p>Start at byte 14 (no VLAN tag), read the IPv4 IHL from the low nibble of the first byte, multiply by 4, and the TCP header starts there if the Protocol field is 6. Then Data Offset times 4 gives the TCP header length. Mention network byte order and that a 802.1Q tag shifts everything by 4 bytes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One hex digit = 4 bits; two hex digits = 1 byte. All header numbers are big-endian.</li>
<li>Each header ends with a selector for the next one: EtherType, IP Protocol, then the port.</li>
<li>IHL and Data Offset count 32-bit words: multiply by 4.</li>
<li>Frame length = 14 + IP Total Length; IP Total Length = IP header + TCP header + payload. Use this to detect truncation and padding.</li>
<li>Display filters use the field names you decode: tcp.flags.syn, ip.ttl, eth.dst.</li>
</ul></div>
`,hi:`
<p>Courier parcel ek box ke andar hota hai, woh box ek bade box ke andar, aur woh delivery crate ke andar. Har wrapper par apna label hota hai, aur har label ki aakhri line batati hai ki <b>mere andar kya hai</b>. Packet bilkul aise hi kaam karta hai. Ethernet IP ko wrap karta hai, IP TCP ko, TCP aapke application data ko, aur har layer ke header ka aakhri field agle header ka naam batata hai. Agar aap raw hex dump mein yeh chain padh sako, to koi bhi capture aapko dara nahi sakta.</p>

<div class="note"><p><b>Is chapter mein aap seekhoge.</b> Is module mein hum <i>ccna-models</i> ke introduction se ek level gehre jaate hain: Ethernet, 802.1Q, ARP, IPv4, ICMP, TCP aur UDP headers ka har field, <b>normal</b> value kaisi dikhti hai, <b>abnormal</b> value kya batati hai, aur capture se fault kaise prove karte hain. <b>Prerequisites:</b> ccna-models ke encapsulation aur capture chapters, aur IPv4 addressing module ka basic binary aur hex. Yeh chapter woh reading skills deta hai jo aage har chapter mein use hongi.</p></div>

<h3>Bits, bytes aur hex, tees second mein</h3>
<p><b>Bit</b> matlab 0 ya 1. <b>Byte</b> matlab 8 bits. Aadha byte (4 bits) <b>nibble</b> hai, aur ek hexadecimal digit theek ek nibble ko describe karta hai, isliye bytes print karne ka natural tareeka hex hai: har byte ke liye do hex digits, koi extra arithmetic nahi.</p>
<div class="tbl"><table class="cmp">
<tr><th>Hex byte</th><th>Binary</th><th>Decimal</th><th>Kahan milta hai</th></tr>
<tr><td>0x45</td><td>0100 0101</td><td>69</td><td>IPv4 ka pehla byte: version 4, header length 5 words</td></tr>
<tr><td>0x40</td><td>0100 0000</td><td>64</td><td>Linux ya lab-PC ka TTL</td></tr>
<tr><td>0x80</td><td>1000 0000</td><td>128</td><td>Windows ka TTL, ya byte ke top bits mein DF flag</td></tr>
<tr><td>0xb8</td><td>1011 1000</td><td>184</td><td>voice ka DSCP byte: 101110 (46, EF) phir ECN 00</td></tr>
<tr><td>0x18</td><td>0001 1000</td><td>24</td><td>TCP flags PSH + ACK</td></tr>
</table></div>

<h3>Network byte order aur bit numbering</h3>
<p>Protocol header ka har multi-byte number <b>big-endian</b> mein bheja jaata hai: sabse significant byte pehle. Ise <b>network byte order</b> kehte hain. Port 80 <code>50 00</code> nahi, <code>00 50</code> store hota hai. Port 50122 <code>c3 ca</code> hai (0xc3 x 256 + 0xca = 50122). Length 1500 <code>05 dc</code> hai. RFC diagrams mein bit 0 pehle byte ka <b>sabse left, most significant</b> bit hota hai, aur diagram 32 bits (4 bytes) chaudha banta hai, isliye ek row chaar bytes ke barabar hai.</p>

<h3>Ek real hex dump, decode karke</h3>
<p>Yeh Packet Studio ke <code>tcp</code> flow ka pehla packet hai: PC1 (192.168.10.10) 203.0.113.80 port 80 ko TCP SYN bhej raha hai. Highlighted bytes "next header" selectors hain.</p>
`+a+`
<div class="tbl"><table class="cmp">
<tr><th>Offset</th><th>Bytes</th><th>Matlab</th></tr>
<tr><td>0 se 5</td><td>52 54 00 b2 00 01</td><td>Ethernet destination: R1 ka MAC (gateway)</td></tr>
<tr><td>6 se 11</td><td>52 54 00 a1 00 10</td><td>Ethernet source: PC1</td></tr>
<tr><td>12 se 13</td><td>08 00</td><td>EtherType 0x0800: aage IPv4 header hai</td></tr>
<tr><td>14</td><td>45</td><td>Version 4, IHL 5 (5 x 4 = 20 bytes)</td></tr>
<tr><td>16 se 17</td><td>00 30</td><td>Total Length 48</td></tr>
<tr><td>22 se 23</td><td>80 06</td><td>TTL 128, Protocol 6: aage TCP header hai</td></tr>
<tr><td>26 se 33</td><td>c0 a8 0a 0a cb 00 71 50</td><td>192.168.10.10 se 203.0.113.80</td></tr>
<tr><td>34 se 37</td><td>c3 ca 00 50</td><td>Source port 50122, destination port 80</td></tr>
<tr><td>46</td><td>70</td><td>Data offset 7 (7 x 4 = 28 bytes TCP header)</td></tr>
<tr><td>47</td><td>02</td><td>Flags: sirf SYN</td></tr>
</table></div>

`+i(r(`EtherType 0x0800`,`Protocol 6`,`Dst port 80`,`HTTP`),`SYN ki next-header chain. Chain ka aakhri hop destination port hai, jo server ko batata hai ki bytes kis application ko milenge.`)+`

<h3>Next-header chain</h3>
<p>Har decoder, Wireshark se lekar simulator ke capture panel tak, bas har header ke end ka selector follow karta hai:</p>
<dl class="terms">
<dt>EtherType (Ethernet ya 802.1Q)</dt><dd>0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6, 0x8100 pehle VLAN tag aata hai, 0x88CC LLDP.</dd>
<dt>IP Protocol (IPv4) ya Next Header (IPv6)</dt><dd>1 ICMP, 6 TCP, 17 UDP, 89 OSPF, 47 GRE, 50 ESP.</dd>
<dt>TCP ya UDP destination port</dt><dd>80 HTTP, 53 DNS, 123 NTP: upar wali application.</dd>
<dt>Header length fields</dt><dd>IHL aur TCP Data Offset (dono 32-bit words gintay hain) batate hain ki <b>agla header kahan shuru hota hai</b>. 4 se multiply karo.</dd>
</dl>

<div class="eg"><p><b>Worked example: kya lengths match karti hain?</b> Capture mein 62-byte frame hai. 14-byte Ethernet header ghatao: 48, jo IP Total Length ke barabar hai. IP header ghatao (IHL 5 x 4 = 20): 28, jo TCP header ke barabar hai (Data Offset 7 x 4 = 28). TCP options 28 - 20 = 8 bytes hain (<code>02 04 05 b4 01 01 04 02</code>), isliye SYN <b>0 byte payload</b> le jaata hai. Ab usi flow ka GET dekho: Total Length 124, minus 20, minus 20 = 84 bytes HTTP text, bilkul wahi "Len: 84" jo analyser print karta hai, aur 14 + 124 = 138 bytes wire par. Jab koi length match na kare, to kisi ne packet badla, kaata ya pad kiya hai.</p></div>

<h3>Capture panel mein use</h3>
<p>Display filters wahi names use karte hain jo aapne abhi decode kiye. Woh sirf matching packets dikhate hain, isliye aap seedha us header par pahunch sakte ho jo chahiye:</p>
<pre class="code"><span class="c">! Sirf woh SYN dikhao jo connection shuru karta hai (abhi ACK nahi)</span>
tcp.flags.syn == 1 &amp;&amp; tcp.flags.ack == 0
<span class="c">! Jo packets kam se kam ek router paar kar chuke (TTL PC default 64 se kam)</span>
ip.ttl &lt; 64
<span class="c">! Sirf broadcast frames</span>
eth.dst == ff:ff:ff:ff:ff:ff</pre>

<div class="warn"><p><b>Common galtiyan.</b> <code>00 50</code> ko 50 hundred padhna ya <code>50 00</code> ko port 80 samajhna: hamesha big-endian. Yeh bhoolna ki IHL aur Data Offset <b>words</b> gintay hain, bytes nahi. 4-byte FCS ya preamble ko capture ka hissa ginna: zyada tar captures FCS ke bina frames dikhate hain, isliye minimum 64 nahi, 60 bytes dikhta hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Network byte order big-endian hai. IPv4 header = IHL x 4 bytes, minimum 20 aur maximum 60. TCP header = Data Offset x 4 bytes, minimum 20 aur maximum 60. EtherType aur IP Protocol alag layers ke alag selectors hain: 0x0800 "protocol 8" nahi hai.</p></div>

<div class="scn"><h4>Firewall jo OSPF kha gaya</h4><p>Do routers ke beech firewall lagane ke baad OSPF down reh gaya. Firewall ke drop log mein sirf <code>proto=0x59 src=10.0.12.1 dst=224.0.0.5</code> dikha. "0x59" kisi ne nahi pehchana jab tak ek engineer ne convert nahi kiya: 0x59 = 5 x 16 + 9 = 89, yaani OSPF ka IP protocol number, aur 224.0.0.5 AllSPFRouters group hai. Hellos unknown protocol ki tarah drop ho rahe the. Dono router addresses ke beech IP protocol 89 permit karne wale rule se adjacency ek hello interval mein up aa gayi.</p><p><b>Seekh:</b> ek selector byte hi batata hai ki kaunsa protocol block hua. Common values ratt lo.</p></div>

<div class="iv"><p class="q">"Raw frame ke andar TCP header kaise dhoondhte ho?"</p><p>Byte 14 se shuru karo (VLAN tag nahi), pehle byte ke low nibble se IPv4 IHL padho, 4 se multiply karo, aur agar Protocol field 6 hai to TCP wahin se shuru hota hai. Phir Data Offset x 4 TCP header length deta hai. Network byte order mention karo aur yeh bhi ki 802.1Q tag sab kuch 4 bytes shift kar deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek hex digit = 4 bits; do hex digits = 1 byte. Header ke saare numbers big-endian hain.</li>
<li>Har header ke end mein agle header ka selector hota hai: EtherType, IP Protocol, phir port.</li>
<li>IHL aur Data Offset 32-bit words gintay hain: 4 se multiply karo.</li>
<li>Frame length = 14 + IP Total Length; IP Total Length = IP header + TCP header + payload. Isse truncation aur padding pakadte hain.</li>
<li>Display filters wahi field names use karte hain jo aap decode karte ho: tcp.flags.syn, ip.ttl, eth.dst.</li>
</ul></div>
`}};export{o as default};