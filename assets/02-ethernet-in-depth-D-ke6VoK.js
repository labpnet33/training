var e=(e,t,n,r,i,a)=>`<text x="`+e+`" y="`+t+`" text-anchor="`+(a||`middle`)+`" class="`+(r||`svg-ink`)+`" font-size="`+(i||12)+`">`+n+`</text>`,t=(e,t,n,r,i)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" fill="`+i+`" stroke="#64748b" stroke-width="0.8"/>`,n=(n,r,i,a,o)=>{let s=``;return[`52`,`54`,`00`,`a1`,`00`,`10`].forEach((n,r)=>{s+=t(20+r*100,30,100,34,r<3?`#bae6fd`:`#bbf7d0`)+e(70+r*100,52,n,`svg-ink`,14)}),s+=e(170,20,r,`svg-accent`,12)+e(470,20,i,`svg-accent`,12),s+=`<line x1="20" y1="64" x2="120" y2="64" stroke="#64748b" stroke-width="1"/>`,[0,1,0,1,0,0,1,0].forEach((n,r)=>{let i=r===7?`#fde68a`:r===6?`#fed7aa`:`#e2e8f0`;s+=t(150+r*40,92,40,30,i)+e(170+r*40,112,n,`svg-ink`,14)+e(170+r*40,86,`b`+(7-r),`svg-muted`,10)}),s+=e(130,112,`0x52 =`,`svg-ink`,12,`end`),s+=`<line x1="70" y1="64" x2="150" y2="92" stroke="#64748b" stroke-width="1"/><line x1="70" y1="64" x2="470" y2="92" stroke="#64748b" stroke-width="1"/>`,s+=e(470,142,a,`svg-accent`,12)+e(430,162,o,`svg-accent`,12,`middle`),`<div class="dia"><svg viewBox="0 0 640 178" role="img" aria-label="MAC address anatomy">`+s+`</svg><p class="cap">`+n+`</p></div>`},r=`<pre class="out">Frame 1: 60 bytes on wire (480 bits), 60 bytes captured
Ethernet II, Src: NKLabs_a1:00:10, Dst: Broadcast
    Destination: Broadcast (ff:ff:ff:ff:ff:ff)
    Source: NKLabs_a1:00:10 (52:54:00:a1:00:10)
    Type: ARP (0x0806)
    <span class="hl">Padding: 18 bytes</span></pre>`,i=`<pre class="out">Ethernet II, Src: NKLabs_c2:00:01, Dst: 01:80:c2:00:00:00
    Destination: 01:80:c2:00:00:00 (01:80:c2:00:00:00)
    Source: NKLabs_c2:00:01 (52:54:00:c2:00:01)
    <span class="hl">Length: Length (0x0027)</span>
    Padding: 7 bytes
Logical-Link Control
    DSAP: Spanning Tree BPDU (0x42)
    SSAP: Spanning Tree BPDU (0x42)
    Control field: U, func=UI (0x03)</pre>`,a=`<pre class="out">     5 packets input, 488 bytes, 0 no buffer
     <span class="hl">0 input errors, 0 CRC, 0 frame, 0 overrun, 0 ignored</span>
     <span class="hl">0 runts, 0 giants, 0 throttles</span>
     3 packets output, 360 bytes, 0 underruns
     0 output errors, 0 collisions, 0 interface resets
     <span class="hl">0 late collision, 0 deferred</span></pre>`,o={id:`ethernet-in-depth`,h:{en:`Ethernet II in depth: MAC bits, EtherTypes, padding, FCS and size errors`,hi:`Ethernet II gehraai se: MAC bits, EtherTypes, padding, FCS aur size errors`},body:{en:`
<p>An Ethernet frame is a sealed envelope with strict postal rules. It must be at least a certain size, it carries a tamper seal, and its address block hides two flag bits that change how every switch treats it. In ccna-models you met the fields. Here you learn what each bit means, what a <b>healthy</b> frame looks like on the wire, and which counter on the switch tells you that something has gone wrong with the physical link.</p>

<h3>What happens before the header</h3>
<p>The NIC sends <b>7 bytes of preamble</b> (10101010 repeated) so the receiver can lock its clock, then the <b>SFD</b> (10101011): the final pair of 1s means "the next bit is the first bit of the destination MAC". The NIC strips both before the host sees the frame, which is why no capture ever shows them. After the frame the sender stays silent for 12 byte times, the <b>inter-frame gap</b>. Remember these 20 extra bytes (8 + 12) per frame: they matter for throughput maths in chapter 9. Ethernet also transmits each byte <b>least significant bit first</b>, which is why the I/G bit below is the very first bit of the address on the wire.</p>

<h3>Anatomy of a MAC address</h3>
`+n(`The first byte decides how switches treat the address. The two lowest bits are flags; the rest of the first three bytes is the OUI.`,`OUI: 24 bits (IEEE-assigned)`,`NIC-specific: 24 bits`,`bit 0 = I/G (0 unicast, 1 group)`,`bit 1 = U/L (0 global, 1 local)`)+`
<div class="tbl"><table class="cmp">
<tr><th>Address</th><th>First byte</th><th>I/G</th><th>U/L</th><th>What it is</th></tr>
<tr><td>52:54:00:a1:00:10</td><td>0101 0010</td><td>0</td><td>1</td><td>unicast, locally administered (a virtual or lab NIC)</td></tr>
<tr><td>00:50:7f:06:6d:01</td><td>0000 0000</td><td>0</td><td>0</td><td>unicast, globally unique (vendor OUI), PC1 in the ccna-models lab</td></tr>
<tr><td>ff:ff:ff:ff:ff:ff</td><td>1111 1111</td><td>1</td><td>1</td><td>broadcast: every NIC in the VLAN accepts it</td></tr>
<tr><td>01:00:5e:00:00:05</td><td>0000 0001</td><td>1</td><td>0</td><td>IPv4 multicast 224.0.0.5 (OSPF AllSPFRouters)</td></tr>
<tr><td>01:80:c2:00:00:00</td><td>0000 0001</td><td>1</td><td>0</td><td>spanning-tree BPDUs</td></tr>
<tr><td>33:33:00:00:00:01</td><td>0011 0011</td><td>1</td><td>1</td><td>IPv6 all-nodes multicast</td></tr>
</table></div>
<p>IPv4 multicast maps into <code>01:00:5e</code> plus the low 23 bits of the group address, so 224.0.0.5 becomes 01:00:5e:00:00:05. Cisco writes the same address as <code>5254.00a1.0010</code>; the simulator uses this form in <code>show</code> commands and colon form in captures.</p>

<h3>EtherType versus Length: Ethernet II against 802.3</h3>
<p>The two bytes after the source MAC mean different things depending on their value. <b>0x0600 (1536) and above</b> is an EtherType: Ethernet II. <b>0x05DC (1500) and below</b> is a payload length: IEEE 802.3, and an LLC header (DSAP, SSAP, control) follows. Values between are undefined. Spanning tree still uses the 802.3 form:</p>
`+i+`
<p>Length 0x0027 = 39 = 3 bytes of LLC + 36 bytes of BPDU, and the remaining 7 bytes are padding. Other types you will meet: 0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6, 0x8100 802.1Q, 0x88A8 802.1ad, 0x88CC LLDP, 0x8809 slow protocols (LACP), 0x8847 MPLS unicast.</p>

<h3>Minimum size, padding and the FCS</h3>
<p>A legal frame is <b>64 to 1518 bytes</b> counted from destination MAC to FCS. If the payload is shorter than 46 bytes the NIC adds zero padding. An ARP message is only 28 bytes: 14 + 28 = 42, plus <b>18 bytes of padding</b> = 60, plus the 4-byte FCS = 64. The capture shows 60 because the FCS is not captured:</p>
`+r+`
<p>Padding is not part of the ARP message. The receiver learns the real length from the upper layer (for IPv4, the Total Length field), so a 40-byte TCP ACK shows <code>Padding: 6 bytes</code> in the simulator too. The <b>FCS</b> is a CRC-32 over everything from the destination MAC to the last padding byte. For the 60 bytes above the CRC-32 is 0xe5eded3d, appended on the wire as <code>3d ed ed e5</code>. The receiving NIC recomputes it; a mismatch means the frame is silently discarded and the <b>CRC</b> counter increments. Ethernet never asks for a resend.</p>

<div class="eg"><p><b>Worked example: how much wire does one full frame use?</b> Payload 1500 + header 14 + FCS 4 = 1518 bytes of frame. Add preamble and SFD (8) and the inter-frame gap (12): <b>1538 byte times</b> per frame. On a 1 Gbps link that is 12.3 microseconds. Smallest frame: 64 + 20 = 84 byte times, so at most 1,488,095 frames per second.</p></div>

<h3>Counters that expose bad frames</h3>
<p>The interface counters on a healthy link are all zero. Learn which counter points at which fault:</p>
`+a+`
<div class="tbl"><table class="cmp">
<tr><th>Counter</th><th>Frame seen</th><th>Usual cause</th></tr>
<tr><td>CRC</td><td>right length, FCS wrong</td><td>bad cable or optic, interference, duplex mismatch, failing NIC</td></tr>
<tr><td>frame</td><td>bad FCS and not a whole number of bytes</td><td>same physical causes, often a damaged cable</td></tr>
<tr><td>runts</td><td>under 64 bytes</td><td>collisions on half duplex, faulty NIC or driver</td></tr>
<tr><td>giants</td><td>over 1518 bytes (1522 if tagged)</td><td>MTU or jumbo mismatch, extra encapsulation such as QinQ</td></tr>
<tr><td>late collision</td><td>collision after 64 bytes sent</td><td>duplex mismatch or an over-long segment</td></tr>
</table></div>
<p><b>Jumbo frames</b> carry up to about 9000 bytes of payload (9216 on many switches). They help storage and data-centre traffic but must be enabled on <b>every</b> NIC and switch port on the path: one 1500-byte hop makes the neighbour count giants.</p>

<div class="warn"><p><b>Common mistakes.</b> Saying "the switch added the FCS error": the receiving port counted it, so look at the cable and the far end. Treating a duplex mismatch as a speed problem: the signature is CRC plus late collisions on the half-duplex side. Quoting the minimum frame as 60 because that is what the capture shows.</p></div>

<div class="exam"><p><b>Exam traps.</b> 64 bytes minimum and 1518 maximum include the FCS. 1500 is the MTU (payload) not the frame. I/G bit 1 = group address; U/L bit 1 = locally administered. Values of 1536 or more in the type/length field are EtherTypes. CRC errors are a Layer 1 symptom seen at Layer 2.</p></div>

<div class="scn"><h4>Storage that hung at one megabyte</h4><p>After a new storage array was added, small pings worked but mounting a volume hung after the first megabyte. The array and servers used 9000-byte jumbo frames, but one trunk port on an older switch was still at 1500. That port's neighbour counted a steady stream of <b>giants</b> and dropped them, while 64-byte pings sailed through. Enabling jumbo frames on the forgotten switch fixed it.</p><p><b>Lesson:</b> when small packets work and big ones vanish, compare the MTU of every hop and look at the giants counter.</p></div>

<div class="iv"><p class="q">"What is a runt, a giant and a CRC error?"</p><p>Runt: shorter than 64 bytes, typically a collision fragment or bad NIC. Giant: longer than the maximum (1518, 1522 tagged). CRC: correct length but the FCS does not match, so the frame was damaged on the wire. Say that they are counted on the receiving port and point you to the cable, optic, duplex or MTU, not to the router configuration.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A MAC's first byte carries two flags: I/G (bit 0) and U/L (bit 1). Broadcast and multicast have I/G = 1.</li>
<li>Type/length of 1536 or more is an EtherType; 1500 or less is an 802.3 length followed by LLC.</li>
<li>Frames are 64 to 1518 bytes; short payloads are padded with zeros and the upper layer's length hides the padding.</li>
<li>The FCS is a CRC-32; a bad one means a silent discard and a CRC counter, never a retransmission at Layer 2.</li>
<li>Runts, giants, CRC and late collisions each point to a different physical or MTU cause.</li>
</ul></div>
`,hi:`
<p>Ethernet frame ek sealed envelope hai jiske postal rules bahut sakht hain. Uska ek minimum size hona zaroori hai, usme tamper seal hai, aur uske address block mein do flag bits chhupe hain jo har switch ka behaviour badal dete hain. ccna-models mein aapne fields dekhe the. Yahan aap seekhoge ki har bit ka matlab kya hai, wire par <b>healthy</b> frame kaisa dikhta hai, aur switch ka kaunsa counter batata hai ki physical link mein kuch galat hai.</p>

<h3>Header se pehle kya hota hai</h3>
<p>NIC <b>7 bytes preamble</b> (10101010 baar baar) bhejta hai taaki receiver apni clock lock kar sake, phir <b>SFD</b> (10101011): aakhri 1 ki jodi ka matlab "agla bit destination MAC ka pehla bit hai". NIC dono ko host ke dekhne se pehle hata deta hai, isliye kisi capture mein yeh nahi dikhte. Frame ke baad sender 12 byte times chup rehta hai, jise <b>inter-frame gap</b> kehte hain. Har frame ke yeh 20 extra bytes (8 + 12) yaad rakhna: chapter 9 ke throughput maths mein kaam aayenge. Ethernet har byte ko <b>least significant bit pehle</b> bhejta hai, isliye neeche wala I/G bit wire par address ka sabse pehla bit hai.</p>

<h3>MAC address ki anatomy</h3>
`+n(`Pehla byte decide karta hai ki switches address ko kaise treat karenge. Sabse neeche ke do bits flags hain; pehle teen bytes ka baaki hissa OUI hai.`,`OUI: 24 bits (IEEE assign karta hai)`,`NIC-specific: 24 bits`,`bit 0 = I/G (0 unicast, 1 group)`,`bit 1 = U/L (0 global, 1 local)`)+`
<div class="tbl"><table class="cmp">
<tr><th>Address</th><th>Pehla byte</th><th>I/G</th><th>U/L</th><th>Yeh kya hai</th></tr>
<tr><td>52:54:00:a1:00:10</td><td>0101 0010</td><td>0</td><td>1</td><td>unicast, locally administered (virtual ya lab NIC)</td></tr>
<tr><td>00:50:7f:06:6d:01</td><td>0000 0000</td><td>0</td><td>0</td><td>unicast, globally unique (vendor OUI), ccna-models lab ka PC1</td></tr>
<tr><td>ff:ff:ff:ff:ff:ff</td><td>1111 1111</td><td>1</td><td>1</td><td>broadcast: VLAN ka har NIC ise accept karta hai</td></tr>
<tr><td>01:00:5e:00:00:05</td><td>0000 0001</td><td>1</td><td>0</td><td>IPv4 multicast 224.0.0.5 (OSPF AllSPFRouters)</td></tr>
<tr><td>01:80:c2:00:00:00</td><td>0000 0001</td><td>1</td><td>0</td><td>spanning-tree BPDUs</td></tr>
<tr><td>33:33:00:00:00:01</td><td>0011 0011</td><td>1</td><td>1</td><td>IPv6 all-nodes multicast</td></tr>
</table></div>
<p>IPv4 multicast <code>01:00:5e</code> plus group address ke low 23 bits mein map hota hai, isliye 224.0.0.5 ban jaata hai 01:00:5e:00:00:05. Cisco wahi address <code>5254.00a1.0010</code> likhta hai; simulator <code>show</code> commands mein yeh form aur captures mein colon form use karta hai.</p>

<h3>EtherType vs Length: Ethernet II aur 802.3</h3>
<p>Source MAC ke baad ke do bytes ka matlab unki value par depend karta hai. <b>0x0600 (1536) aur usse upar</b> EtherType hai: Ethernet II. <b>0x05DC (1500) aur usse neeche</b> payload length hai: IEEE 802.3, aur aage LLC header (DSAP, SSAP, control) aata hai. Beech ki values undefined hain. Spanning tree ab bhi 802.3 form use karta hai:</p>
`+i+`
<p>Length 0x0027 = 39 = 3 bytes LLC + 36 bytes BPDU, aur baaki 7 bytes padding hain. Aur types jo milenge: 0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6, 0x8100 802.1Q, 0x88A8 802.1ad, 0x88CC LLDP, 0x8809 slow protocols (LACP), 0x8847 MPLS unicast.</p>

<h3>Minimum size, padding aur FCS</h3>
<p>Legal frame destination MAC se FCS tak gine to <b>64 se 1518 bytes</b> ka hota hai. Agar payload 46 bytes se chhota ho to NIC zero padding jodta hai. ARP message sirf 28 bytes ka hai: 14 + 28 = 42, plus <b>18 bytes padding</b> = 60, plus 4-byte FCS = 64. Capture 60 dikhata hai kyunki FCS capture nahi hota:</p>
`+r+`
<p>Padding ARP message ka hissa nahi hai. Receiver asli length upar wali layer se jaanta hai (IPv4 mein Total Length field), isliye 40-byte ka TCP ACK simulator mein bhi <code>Padding: 6 bytes</code> dikhata hai. <b>FCS</b> destination MAC se aakhri padding byte tak ka CRC-32 hai. Upar ke 60 bytes ka CRC-32 0xe5eded3d hai, jo wire par <code>3d ed ed e5</code> ke roop mein jodta hai. Receiving NIC ise dobara nikalta hai; mismatch ka matlab frame chupchaap discard hua aur <b>CRC</b> counter badha. Ethernet kabhi resend nahi maangta.</p>

<div class="eg"><p><b>Worked example: ek full frame kitna wire use karta hai?</b> Payload 1500 + header 14 + FCS 4 = 1518 bytes frame. Preamble aur SFD (8) aur inter-frame gap (12) jodo: har frame ke liye <b>1538 byte times</b>. 1 Gbps link par yeh 12.3 microseconds hai. Sabse chhota frame: 64 + 20 = 84 byte times, yaani zyada se zyada 1,488,095 frames per second.</p></div>

<h3>Woh counters jo kharab frames batate hain</h3>
<p>Healthy link par interface counters sab zero hote hain. Seekho ki kaunsa counter kis fault ki taraf ishaara karta hai:</p>
`+a+`
<div class="tbl"><table class="cmp">
<tr><th>Counter</th><th>Kaisa frame dikha</th><th>Aam wajah</th></tr>
<tr><td>CRC</td><td>length theek, FCS galat</td><td>kharab cable ya optic, interference, duplex mismatch, kharab NIC</td></tr>
<tr><td>frame</td><td>FCS galat aur poore bytes nahi</td><td>wahi physical wajah, aksar damaged cable</td></tr>
<tr><td>runts</td><td>64 bytes se chhota</td><td>half duplex par collisions, faulty NIC ya driver</td></tr>
<tr><td>giants</td><td>1518 se bada (tagged ho to 1522)</td><td>MTU ya jumbo mismatch, extra encapsulation jaise QinQ</td></tr>
<tr><td>late collision</td><td>64 bytes bhejne ke baad collision</td><td>duplex mismatch ya bahut lambi segment</td></tr>
</table></div>
<p><b>Jumbo frames</b> lagbhag 9000 bytes payload tak le jaate hain (kai switches par 9216). Storage aur data-centre traffic mein kaam aate hain, lekin path ke <b>har</b> NIC aur switch port par enable hone chahiye: ek 1500-byte hop se padosi giants count karne lagta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Kehna "switch ne FCS error add kiya": receiving port ne count kiya, isliye cable aur far end dekho. Duplex mismatch ko speed problem samajhna: iski pehchaan half-duplex side par CRC plus late collisions hai. Minimum frame 60 batana kyunki capture mein wahi dikhta hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> 64 bytes minimum aur 1518 maximum FCS ko include karte hain. 1500 MTU (payload) hai, frame nahi. I/G bit 1 = group address; U/L bit 1 = locally administered. Type/length field mein 1536 ya zyada value EtherType hoti hai. CRC errors Layer 1 ka symptom hain jo Layer 2 par dikhte hain.</p></div>

<div class="scn"><h4>Storage jo ek megabyte par hang ho gaya</h4><p>Naya storage array lagane ke baad chhote pings chalte the lekin volume mount karte waqt pehle megabyte ke baad hang ho jaata tha. Array aur servers 9000-byte jumbo frames use karte the, lekin ek purane switch ka ek trunk port abhi 1500 par tha. Us port ke padosi ne lagatar <b>giants</b> count kiye aur drop kiye, jabki 64-byte pings nikal jaate the. Bhule hue switch par jumbo frames enable karne se theek ho gaya.</p><p><b>Seekh:</b> jab chhote packets chalein aur bade gayab ho jayein, to har hop ka MTU compare karo aur giants counter dekho.</p></div>

<div class="iv"><p class="q">"Runt, giant aur CRC error kya hote hain?"</p><p>Runt: 64 bytes se chhota, aam taur par collision fragment ya kharab NIC. Giant: maximum se bada (1518, tagged ho to 1522). CRC: length theek lekin FCS match nahi karta, yaani frame wire par damage hua. Batao ki yeh receiving port par count hote hain aur cable, optic, duplex ya MTU ki taraf ishaara karte hain, router configuration ki taraf nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MAC ke pehle byte mein do flags hain: I/G (bit 0) aur U/L (bit 1). Broadcast aur multicast mein I/G = 1.</li>
<li>Type/length 1536 ya zyada ho to EtherType; 1500 ya kam ho to 802.3 length aur uske baad LLC.</li>
<li>Frames 64 se 1518 bytes ke; chhote payload zero se pad hote hain aur upar wali layer ki length padding chhupa deti hai.</li>
<li>FCS CRC-32 hai; kharab ho to chupchaap discard aur CRC counter, Layer 2 par kabhi retransmission nahi.</li>
<li>Runts, giants, CRC aur late collisions har ek alag physical ya MTU wajah dikhata hai.</li>
</ul></div>
`}};export{o as default};