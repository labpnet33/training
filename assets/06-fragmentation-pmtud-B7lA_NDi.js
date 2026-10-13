var e=(e,t,n,r,i,a)=>`<text x="`+e+`" y="`+t+`" text-anchor="`+(a||`middle`)+`" class="`+(r||`svg-ink`)+`" font-size="`+(i||12)+`">`+n+`</text>`,t=(e,t,n,r,i)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" fill="`+i+`" stroke="#64748b" stroke-width="0.8"/>`,n=(e,t,n,r,i)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="1.5"`+(i?` stroke-dasharray="5 4"`:``)+`/>`,r=(r,i,a,o,s,c)=>{let l=``;l+=e(320,16,i,`svg-ink`,13),l+=t(10,24,14,30,`#ddd6fe`)+t(24,24,586,30,`#bbf7d0`)+e(317,44,`ICMP header 8 + data 4000 = 4008 bytes of payload`,`svg-ink`,12);let u=(n,r,i,a,o)=>t(n,90,14,40,`#ddd6fe`)+t(n+14,90,r,40,`#bbf7d0`)+e(n+14+r/2,108,i,`svg-ink`,12)+e(n+14+r/2,124,`offset `+a+`, MF=`+o,`svg-muted`,11);return l+=u(10,200,`1480 bytes`,0,1)+u(226,200,`1480 bytes`,185,1)+u(442,142,`1048 bytes`,370,0),l+=e(110,84,a,`svg-accent`,12)+e(326,84,o,`svg-accent`,12)+e(527,84,s,`svg-accent`,12),l+=e(320,158,c,`svg-ink`,12),l+=n(17,54,17,90,1)+n(233,54,233,90,1)+n(449,54,449,90,1),`<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Fragmentation">`+l+`</svg><p class="cap">`+r+`</p></div>`},i=(t,r,i,a,o)=>{let s=``;return[[90,`PC1`],[330,`R1 (tunnel MTU 1400)`],[560,`Server`]].forEach(t=>{s+=e(t[0],18,t[1],`svg-ink`,13)+n(t[0],26,t[0],190,0)}),s+=n(90,48,330,64)+e(210,46,r,`svg-accent`,11),s+=n(330,84,90,100)+e(210,82,i,`svg-accent`,11),s+=n(90,124,330,140)+e(210,122,a,`svg-accent`,11),s+=n(330,144,560,160)+e(445,142,o,`svg-ink`,11),`<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Path MTU discovery">`+s+`</svg><p class="cap">`+t+`</p></div>`},a=`<pre class="out">Source           Destination      Protocol Length Info
192.168.10.10    203.0.113.80     ICMP       1514 Echo (ping) request  id=0x0003, seq=1, ttl=64
192.168.10.10    203.0.113.80     ICMP       1514 Fragmented IP protocol (proto=ICMP 1, off=1480, ID=0x9abc)
192.168.10.10    203.0.113.80     ICMP       1082 Fragmented IP protocol (proto=ICMP 1, off=2960, ID=0x9abc)

Frame 1: 1514 bytes on wire (12112 bits), 1514 bytes captured
    Total Length: 1500
    Identification: 0x9abc (39612)
    <span class="hl">Flags: 0x20, More fragments</span>
    Fragment Offset: 0
Frame 2: 1514 bytes on wire (12112 bits), 1514 bytes captured
    Total Length: 1500
    Identification: 0x9abc (39612)
    <span class="hl">Flags: 0x20, More fragments</span>
    Fragment Offset: 1480 (185 x 8 bytes)
Frame 3: 1082 bytes on wire (8656 bits), 1082 bytes captured
    Total Length: 1068
    Identification: 0x9abc (39612)
    <span class="hl">Flags: 0x00</span>
    Fragment Offset: 2960 (370 x 8 bytes)</pre>`,o=`<pre class="out">frag 1   45 00 05 dc 9a bc <span class="hl">20 00</span> 40 01 b3 61 c0 a8 0a 0a cb 00 71 50
frag 2   45 00 05 dc 9a bc <span class="hl">20 b9</span> 40 01 b2 a8 c0 a8 0a 0a cb 00 71 50
frag 3   45 00 04 2c 9a bc <span class="hl">01 72</span> 40 01 d3 9f c0 a8 0a 0a cb 00 71 50</pre>`,s=`<pre class="out">Source           Destination      Protocol Length Info
192.168.10.10    203.0.113.80     TCP        1514 51000 → 443 [ACK] Seq=1 Ack=1 Win=64240 Len=1460
192.168.10.1     192.168.10.10    ICMP         70 <span class="hl">Destination unreachable (Fragmentation needed), next-hop MTU 1400</span>
192.168.10.10    203.0.113.80     TCP        1414 51000 → 443 [ACK] Seq=1 Ack=1 Win=64240 Len=<span class="hl">1360</span>

Internet Control Message Protocol
    Type: 3 (Destination unreachable)
    Code: 4 (Fragmentation needed)
    Checksum: 0x2e8f [correct]
    Unused: 0000
    MTU of next hop: 1400</pre>`,c=`<pre class="code"><span class="c">! Make the tunnel MTU explicit and clamp TCP MSS so hosts never send more than fits</span>
R1(config)# interface Tunnel0
R1(config-if)# ip mtu 1400
R1(config-if)# ip tcp adjust-mss 1360
<span class="c">! Test from a Cisco router with DF set (an M in the reply means "could not fragment")</span>
R1# ping 203.0.113.80 size 1500 df-bit</pre>`,l={id:`fragmentation-pmtud`,h:{en:`Fragmentation, MTU, the DF bit, path MTU discovery and MSS clamping`,hi:`Fragmentation, MTU, DF bit, path MTU discovery aur MSS clamping`},body:{en:`
<p>Imagine posting a large wardrobe through a series of doors. The first door is 1500 mm wide, the next only 1400 mm. You can saw the wardrobe in pieces and rebuild it at the destination (fragmentation), or you can be told "too wide, send a smaller one" and repack it (path MTU discovery). The network does both, and a surprising number of "it pings but the application hangs" tickets are a failed attempt at the second.</p>

<h3>MTU and the fields involved</h3>
<p>The <b>MTU</b> is the largest IP packet a link will carry: 1500 on Ethernet. If a packet is bigger than the outgoing MTU, a router has two choices. If the <b>DF</b> bit is 0 it may <b>fragment</b>: split the payload into pieces that each fit, each with its own IP header. If DF is 1 it must drop the packet and tell the sender with ICMP. Three header fields describe a fragment: <b>Identification</b> (the same on every piece), <b>MF</b> (1 on every piece except the last) and the <b>Fragment Offset</b> (where the piece starts, in 8-byte units). So every fragment except the last must carry a multiple of 8 data bytes.</p>

<h3>Real fragments from a 4000-byte ping</h3>
`+r(`A 4000-byte ping on a 1500-byte MTU: payload 4008 bytes (ICMP header included) becomes three IP packets. Each fragment repeats the 20-byte IP header (purple); only the first one contains the ICMP header.`,`Original datagram: 20-byte IP header + 4008 bytes of payload`,`Fragment 1`,`Fragment 2`,`Fragment 3`,`Reassembly happens only at the destination host, never at routers`)+`
<p>The Packet Studio <code>mtu</code> flow shows PC1 sending exactly this. The simulator prints the whole flags byte, so MF appears as 0x20:</p>
`+a+`
<p>The fragment-offset field is the last 13 bits of the 16-bit word after the Identification, and the flags are the top 3 bits. In hex:</p>
`+o+`
<div class="eg"><p><b>Worked example: derive the numbers.</b> ICMP payload = 8 (header) + 4000 = 4008 bytes. Each fragment may carry at most 1500 - 20 = 1480 bytes, and 1480 is a multiple of 8 (185 x 8). Fragment 1 carries bytes 0 to 1479 (offset 0, word <code>2000</code>: MF only). Fragment 2 carries 1480 to 2959 (offset 185 = 0xb9, word <code>20b9</code>). Fragment 3 carries the remaining 4008 - 2960 = 1048 bytes (offset 370 = 0x172, MF clear, word <code>0172</code>), so its Total Length is 1048 + 20 = 1068 and its frame is 1082 bytes. The wire carries 1514 + 1514 + 1082 = 4110 bytes for 4000 bytes of data, because two extra IP headers were needed.</p></div>

<h3>Why fragmentation is avoided</h3>
<ul>
<li><b>Fragile</b>: losing any one fragment discards the whole datagram. With 1% loss per packet, three fragments survive with probability 0.99 x 0.99 x 0.99 = 97.0%, and TCP then resends the <i>entire</i> segment.</li>
<li><b>Costly</b>: the receiver needs memory and CPU to reassemble, and a flood of incomplete fragments is a known resource attack.</li>
<li><b>Invisible to filters</b>: only the first fragment contains the TCP or UDP ports. An ACL or firewall that matches on ports cannot match the later fragments, so devices treat fragments specially or reassemble first.</li>
</ul>
<p>IPv6 removed router fragmentation altogether: only the sender may fragment and the router signals "Packet Too Big" with ICMPv6 type 2.</p>

<h3>Path MTU discovery with the DF bit</h3>
<p>TCP sets DF on every packet. When such a packet meets a smaller link, the router returns <b>ICMP type 3, code 4</b> ("fragmentation needed") and includes the <b>next-hop MTU</b>. The sender lowers its estimate and retransmits smaller. The flow shows the whole mechanism in three frames: a 1500-byte packet, the error from R1 and the retry.</p>
`+i(`Path MTU discovery in the Packet Studio flow: one error message teaches the sender the right size.`,`1500-byte packet, DF=1`,`ICMP 3/4, next-hop MTU 1400`,`resend, Len=1360 (1400 bytes)`,`delivered`)+`
`+s+`
<p>The retry carries <b>Len=1360</b>: 1400 - 20 (IP) - 20 (TCP) = 1360 bytes of data. That number is the <b>MSS</b> (maximum segment size) the connection should have used from the start.</p>

<h3>Testing the path MTU</h3>
<p>The classic test is a ping with DF set and a chosen size. The data size you ask for is the packet size minus 28 (20 IP + 8 ICMP): to test 1500 use 1472.</p>
<pre class="code"><span class="c">! Windows</span>
ping -f -l 1472 203.0.113.80
<span class="c">! Linux</span>
ping -M do -s 1472 203.0.113.80</pre>
<p>If the path cannot carry it, Windows answers "Packet needs to be fragmented but DF set", Linux prints "message too long, mtu=1400" and an IOS router prints <code>M</code>. Lower the size until it works: that size plus 28 is your path MTU. The simulator's PC <code>ping</code> offers only the count option, so use the Packet Studio flow to see the mechanism.</p>

<h3>MSS clamping and tunnels</h3>
<p>Tunnels add headers, so the usable MTU falls: GRE costs 24 bytes (MTU 1476), PPPoE 8 (1492), VXLAN 50 (1450), IPsec roughly 50 to 70 depending on mode and cipher. If something drops the ICMP errors, PMTUD fails and you get a <b>black hole</b>: the handshake and small packets work, the first big packet vanishes. The fix on the router is to <b>clamp the MSS</b>, rewriting the MSS option in SYN packets so hosts never send too-large segments, plus an explicit tunnel MTU:</p>
`+c+`
<div class="warn"><p><b>Common mistakes.</b> Blocking all ICMP on a firewall, which silently breaks PMTUD. Setting <code>ip mtu 1400</code> without clamping MSS, so TCP still tries 1460. Quoting the ping size as the packet size: 1472 data bytes make a 1500-byte packet. Raising the MTU on one switch port: it must match on both ends and on every hop.</p></div>

<div class="exam"><p><b>Exam traps.</b> Fragment offset is in 8-byte units; only the last fragment has MF = 0; only the destination reassembles. ICMP type 3 code 4 carries the next-hop MTU. Default MSS = MTU - 40 = 1460. DF is set by TCP and cleared by default in many UDP applications.</p></div>

<div class="scn"><h4>The VPN where file shares hang</h4><p>Staff at a branch could browse intranet pages and ping the head office, but opening a large spreadsheet from a file share froze at 0%. The branch router had an IPsec/GRE tunnel with an effective MTU of 1400, and the firewall at the head office dropped ICMP "fragmentation needed". Big TCP segments with DF set vanished with no error back. The engineer proved it with <code>ping -f -l 1372</code> (works) and <code>1373</code> (fails), then added <code>ip tcp adjust-mss 1360</code> on the tunnel and permitted ICMP type 3 on the firewall.</p><p><b>Lesson:</b> small works, large hangs: test with DF pings, then clamp MSS.</p></div>

<div class="iv"><p class="q">"What is path MTU discovery and what breaks it?"</p><p>The sender sets DF and sends full-size packets; a router with a smaller link drops one and returns ICMP 3/4 with the next-hop MTU; the sender retransmits smaller. It breaks when ICMP is filtered, producing a PMTUD black hole. Mention MSS clamping as the mitigation and IPv6's Packet Too Big.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Fragments share the Identification; MF is 1 except on the last; the offset counts 8-byte blocks; only the destination reassembles.</li>
<li>One lost fragment loses the whole packet, so modern stacks set DF and avoid fragmenting.</li>
<li>DF + a too-big packet = ICMP type 3 code 4 with the next-hop MTU: that is path MTU discovery.</li>
<li>MSS = MTU - 40; tunnels reduce the MTU, so clamp MSS (for example 1360 for MTU 1400).</li>
<li>Symptom of a PMTUD black hole: handshake and small packets work, large transfers hang. Test with a DF ping.</li>
</ul></div>
`,hi:`
<p>Sochiye aap ek bada almirah darwazon ki ek series se bhej rahe ho. Pehla darwaza 1500 mm chauda hai, agla sirf 1400 mm. Aap almirah ko aari se tukdon mein kaat kar destination par jod sakte ho (fragmentation), ya aapko bataya jaata hai "bahut chauda hai, chhota bhejo" aur aap dobara pack karte ho (path MTU discovery). Network dono karta hai, aur "ping chalta hai par application hang ho jaati hai" wale kaafi tickets dusre tareeke ki naakaam koshish hote hain.</p>

<h3>MTU aur sambandhit fields</h3>
<p><b>MTU</b> sabse bada IP packet hai jo link le ja sakta hai: Ethernet par 1500. Agar packet outgoing MTU se bada ho to router ke paas do raaste hain. Agar <b>DF</b> bit 0 hai to woh <b>fragment</b> kar sakta hai: payload ko aise tukdon mein todna jo fit ho jayein, har tukde ka apna IP header. Agar DF 1 hai to use packet drop karna padta hai aur sender ko ICMP se batana padta hai. Teen header fields fragment ko describe karte hain: <b>Identification</b> (har tukde par same), <b>MF</b> (aakhri ko chhodkar har tukde par 1) aur <b>Fragment Offset</b> (tukda kahan se shuru hota hai, 8-byte units mein). Isliye aakhri ko chhodkar har fragment ko 8 ke multiple data bytes le jaane padte hain.</p>

<h3>4000-byte ping ke real fragments</h3>
`+r(`1500-byte MTU par 4000-byte ping: payload 4008 bytes (ICMP header ke saath) teen IP packets ban jaata hai. Har fragment 20-byte IP header (purple) dohrata hai; ICMP header sirf pehle fragment mein hai.`,`Original datagram: 20-byte IP header + 4008 bytes payload`,`Fragment 1`,`Fragment 2`,`Fragment 3`,`Reassembly sirf destination host par hota hai, routers par kabhi nahi`)+`
<p>Packet Studio ka <code>mtu</code> flow PC1 ko bilkul yahi bhejte dikhata hai. Simulator poora flags byte print karta hai, isliye MF 0x20 dikhta hai:</p>
`+a+`
<p>Fragment-offset field Identification ke baad ke 16-bit word ke aakhri 13 bits hain, aur flags top 3 bits. Hex mein:</p>
`+o+`
<div class="eg"><p><b>Worked example: numbers nikalo.</b> ICMP payload = 8 (header) + 4000 = 4008 bytes. Har fragment zyada se zyada 1500 - 20 = 1480 bytes le ja sakta hai, aur 1480 8 ka multiple hai (185 x 8). Fragment 1 bytes 0 se 1479 le jaata hai (offset 0, word <code>2000</code>: sirf MF). Fragment 2 1480 se 2959 (offset 185 = 0xb9, word <code>20b9</code>). Fragment 3 bache hue 4008 - 2960 = 1048 bytes (offset 370 = 0x172, MF clear, word <code>0172</code>), isliye uski Total Length 1048 + 20 = 1068 aur frame 1082 bytes. 4000 bytes data ke liye wire par 1514 + 1514 + 1082 = 4110 bytes jaate hain, kyunki do extra IP headers lage.</p></div>

<h3>Fragmentation se kyun bachte hain</h3>
<ul>
<li><b>Nazuk</b>: koi ek fragment kho jaye to poora datagram gir jaata hai. Har packet par 1% loss ho to teen fragments 0.99 x 0.99 x 0.99 = 97.0% probability se bachte hain, aur TCP phir <i>poora</i> segment dobara bhejta hai.</li>
<li><b>Mehnga</b>: receiver ko reassemble karne ke liye memory aur CPU chahiye, aur adhoore fragments ki baadh ek jaana-maana resource attack hai.</li>
<li><b>Filters ko dikhte nahi</b>: TCP ya UDP ports sirf pehle fragment mein hote hain. Ports par match karne wala ACL ya firewall baad ke fragments match nahi kar sakta, isliye devices fragments ko alag treat karte hain ya pehle reassemble karte hain.</li>
</ul>
<p>IPv6 ne router fragmentation hata diya: sirf sender fragment kar sakta hai aur router ICMPv6 type 2 se "Packet Too Big" batata hai.</p>

<h3>DF bit ke saath path MTU discovery</h3>
<p>TCP har packet par DF set karta hai. Jab aisa packet chhote link se milta hai, router <b>ICMP type 3, code 4</b> ("fragmentation needed") lautata hai aur usme <b>next-hop MTU</b> bhi bhejta hai. Sender apna estimate ghatata hai aur chhota dobara bhejta hai. Flow poora mechanism teen frames mein dikhata hai: 1500-byte packet, R1 ka error aur retry.</p>
`+i(`Packet Studio flow mein path MTU discovery: ek error message sender ko sahi size sikha deta hai.`,`1500-byte packet, DF=1`,`ICMP 3/4, next-hop MTU 1400`,`resend, Len=1360 (1400 bytes)`,`delivered`)+`
`+s+`
<p>Retry mein <b>Len=1360</b> hai: 1400 - 20 (IP) - 20 (TCP) = 1360 bytes data. Yeh number woh <b>MSS</b> (maximum segment size) hai jo connection ko shuru se use karna chahiye tha.</p>

<h3>Path MTU test karna</h3>
<p>Classic test DF set aur chuni hui size ka ping hai. Jo data size aap maangte ho woh packet size minus 28 (20 IP + 8 ICMP) hota hai: 1500 test karne ke liye 1472 use karo.</p>
<pre class="code"><span class="c">! Windows</span>
ping -f -l 1472 203.0.113.80
<span class="c">! Linux</span>
ping -M do -s 1472 203.0.113.80</pre>
<p>Agar path ise le ja nahi sakta, to Windows "Packet needs to be fragmented but DF set" batata hai, Linux "message too long, mtu=1400" print karta hai aur IOS router <code>M</code> print karta hai. Size tab tak ghatao jab tak chale: woh size plus 28 aapka path MTU hai. Simulator ke PC ka <code>ping</code> sirf count option deta hai, isliye mechanism dekhne ke liye Packet Studio flow use karo.</p>

<h3>MSS clamping aur tunnels</h3>
<p>Tunnels headers jodte hain, isliye usable MTU ghat jaata hai: GRE 24 bytes (MTU 1476), PPPoE 8 (1492), VXLAN 50 (1450), IPsec mode aur cipher ke hisaab se lagbhag 50 se 70. Agar kuch ICMP errors drop kar de to PMTUD fail hota hai aur <b>black hole</b> banta hai: handshake aur chhote packets chalte hain, pehla bada packet gayab ho jaata hai. Router par fix hai <b>MSS clamp</b> karna, yaani SYN packets ke MSS option ko rewrite karna taaki hosts kabhi bahut bade segments na bhejein, aur saath mein explicit tunnel MTU:</p>
`+c+`
<div class="warn"><p><b>Common galtiyan.</b> Firewall par saara ICMP block karna, jisse PMTUD chupchaap toot jaata hai. MSS clamp kiye bina <code>ip mtu 1400</code> set karna, to TCP ab bhi 1460 try karta hai. Ping size ko packet size batana: 1472 data bytes 1500-byte packet banate hain. Ek switch port par MTU badhana: woh dono ends par aur har hop par match hona chahiye.</p></div>

<div class="exam"><p><b>Exam traps.</b> Fragment offset 8-byte units mein; sirf aakhri fragment par MF = 0; sirf destination reassemble karta hai. ICMP type 3 code 4 next-hop MTU le jaata hai. Default MSS = MTU - 40 = 1460. DF TCP set karta hai aur kai UDP applications mein default clear hota hai.</p></div>

<div class="scn"><h4>VPN jahan file shares hang hote hain</h4><p>Branch ke staff intranet pages dekh sakte the aur head office ko ping kar sakte the, lekin file share se bada spreadsheet kholne par 0% par freeze ho jaata tha. Branch router par IPsec/GRE tunnel tha jiska effective MTU 1400 tha, aur head office ke firewall ne ICMP "fragmentation needed" drop kar diya. DF wale bade TCP segments bina kisi error ke gayab ho gaye. Engineer ne <code>ping -f -l 1372</code> (chalta hai) aur <code>1373</code> (fail) se prove kiya, phir tunnel par <code>ip tcp adjust-mss 1360</code> lagaya aur firewall par ICMP type 3 permit kiya.</p><p><b>Seekh:</b> chhota chalta hai, bada hang hota hai: DF pings se test karo, phir MSS clamp karo.</p></div>

<div class="iv"><p class="q">"Path MTU discovery kya hai aur ise kya todta hai?"</p><p>Sender DF set karke full-size packets bhejta hai; chhote link wala router ek drop karta hai aur next-hop MTU ke saath ICMP 3/4 lautata hai; sender chhota dobara bhejta hai. Yeh tab tootta hai jab ICMP filter ho, jisse PMTUD black hole banta hai. Mitigation ke taur par MSS clamping aur IPv6 ka Packet Too Big mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Fragments Identification share karte hain; MF aakhri ko chhodkar 1; offset 8-byte blocks gintaa hai; sirf destination reassemble karta hai.</li>
<li>Ek fragment kho jaye to poora packet jaata hai, isliye modern stacks DF set karte hain aur fragment se bachte hain.</li>
<li>DF + bahut bada packet = ICMP type 3 code 4 next-hop MTU ke saath: yehi path MTU discovery hai.</li>
<li>MSS = MTU - 40; tunnels MTU ghatate hain, isliye MSS clamp karo (MTU 1400 ke liye jaise 1360).</li>
<li>PMTUD black hole ka symptom: handshake aur chhote packets chalte hain, bade transfers hang. DF ping se test karo.</li>
</ul></div>
`}};export{l as default};