var e={id:`dscp-overlay-aar`,h:{en:`DSCP across the overlay and the provider, QoS with AAR and FEC, and voice and video sizing`,hi:`Overlay aur provider mein DSCP, AAR aur FEC ke saath QoS, aur voice-video sizing`},body:{en:`
<p>You write an address and a "URGENT" sticker on a parcel. The courier company puts your parcel inside its own sealed box with its own label, and the sticker is hidden inside. Will the sorting depot treat your parcel as urgent? Only if the courier copies the sticker onto the outer box, and only if the depot agrees to honour it. In SD-WAN the "sealed box" is the IPsec tunnel and the depot is your MPLS or internet provider.</p>

<h3>What happens to DSCP inside the tunnel</h3>
<p>When the edge sends a LAN packet into an IPsec tunnel, the original IP packet is encrypted and wrapped in a new outer IP header (plus ESP and UDP headers). A transport device can read only the <b>outer</b> header. Cisco's documentation and labs show that the DSCP of the original packet is <b>preserved in the outer header</b>, so a provider that honours DSCP can still see "46" on an encrypted voice packet. A <b>rewrite rule</b> on the egress WAN interface then lets you change the outer DSCP to match what the provider expects, without touching the inner packet that the far-end site will receive.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="DSCP across the overlay">
<rect x="10" y="60" width="130" height="70" rx="8" fill="#bbf7d0"/><text x="75" y="90" text-anchor="middle" class="svg-ink" font-size="13">IP phone</text><text x="75" y="110" text-anchor="middle" class="svg-muted" font-size="12">inner DSCP 46</text>
<rect x="170" y="40" width="140" height="110" rx="8" fill="#bae6fd"/><text x="240" y="66" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1</text><text x="240" y="88" text-anchor="middle" class="svg-muted" font-size="12">class VOICE, Q0</text><text x="240" y="106" text-anchor="middle" class="svg-muted" font-size="12">outer DSCP 46</text><text x="240" y="124" text-anchor="middle" class="svg-muted" font-size="12">rewrite: 46 to 46</text>
<rect x="340" y="60" width="130" height="70" rx="8" fill="#fde68a"/><text x="405" y="86" text-anchor="middle" class="svg-ink" font-size="13">MPLS provider</text><text x="405" y="106" text-anchor="middle" class="svg-muted" font-size="12">EF = real-time class</text>
<rect x="500" y="40" width="130" height="110" rx="8" fill="#bae6fd"/><text x="565" y="66" text-anchor="middle" class="svg-ink" font-size="13">E-MUM-1</text><text x="565" y="90" text-anchor="middle" class="svg-muted" font-size="12">decrypt</text><text x="565" y="108" text-anchor="middle" class="svg-muted" font-size="12">inner DSCP 46</text>
<line x1="140" y1="95" x2="170" y2="95" stroke="#64748b" stroke-width="2"/><line x1="310" y1="95" x2="340" y2="95" stroke="#64748b" stroke-width="3"/><line x1="470" y1="95" x2="500" y2="95" stroke="#64748b" stroke-width="3"/>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="12">Inner marking stays for the far LAN; outer marking is what the provider sees</text>
</svg><p class="cap">The provider reads only the outer DSCP; a rewrite rule can adapt it to the provider's classes.</p></div>

<h3>Talking to an MPLS provider</h3>
<p>MPLS providers sell a small number of <b>classes of service</b>, often three or four (real-time, business-critical, standard, default) with specific DSCP values for each, and they police each class to the amount you bought. Packets with a value they do not recognise are usually treated as default. The edge's job is to map <b>your</b> classes to <b>their</b> values with a rewrite rule on the MPLS interface:</p>
<table class="cmp"><tr><th>Your class</th><th>Inner DSCP</th><th>Provider class (example)</th><th>Rewrite on MPLS egress</th></tr>
<tr><td>VOICE</td><td>46</td><td>Real-time</td><td>46</td></tr>
<tr><td>VIDEO</td><td>34</td><td>Business-critical</td><td>26 (AF31)</td></tr>
<tr><td>CRITICAL</td><td>18</td><td>Business-critical</td><td>26 (AF31) or 18 (AF21)</td></tr>
<tr><td>BULK</td><td>8</td><td>Default</td><td>0</td></tr></table>
<p>The same class can take two different DSCP values depending on <b>packet loss priority</b>: traffic within a policer's rate has PLP low, excess marked by <code>exceed remark</code> has PLP high, and the rewrite rule can give them different values (for example AF31 for conforming and AF32 for exceeding) so the provider drops the excess first. For an MPLS CSC provider, Cisco also shows a rewrite directly to the MPLS EXP value.</p>
<p>Always use a provider's published class table. Do not copy numbers from this chapter into a production network without confirming them in the contract.</p>

<h3>The public internet</h3>
<p>Internet providers generally do not honour DSCP between networks, and may reset it to zero. A rewrite rule on a biz-internet interface is therefore pointless for the path, but the <b>local queues and shaper still matter</b>: they protect your voice within your own circuit, where most congestion happens (the last mile at the branch).</p>

<h3>QoS and application-aware routing together</h3>
<p>The sdw-aar module measures each tunnel with BFD and compares loss, latency and jitter with an SLA class. Some points where QoS and AAR interact:</p>
<ul>
<li><b>QoS protects the measurement.</b> If a tunnel is saturated by bulk traffic, queuing delay raises measured latency and jitter and AAR may declare a violation and move voice away. With a proper queue for bulk and shaping, the measured values reflect the transport, not your own congestion. Cisco places the router's own control traffic in queue 0; do not fill that queue with user traffic beyond its policer, or protocol packets can be delayed.</li>
<li><b>AAR chooses the path, QoS orders packets on it.</b> After AAR moves voice to the mpls colour, the QoS map on that interface must also have a voice queue and a rewrite rule for that provider. Create the QoS policy for <b>every</b> transport interface, not only the main one.</li>
<li><b>Mark first, steer second.</b> A data policy that sets DSCP and a class can also use that match for AAR. Classify once; use the same app-list in both.</li>
<li><b>Order on the edge.</b> Ingress ACL, then the centralized policies, then forwarding, IPsec encapsulation and finally the egress QoS (see the sdw-aar troubleshooting chapter). The classifier at ingress therefore decides the queue used at egress.</li>
</ul>

<h3>FEC and packet duplication need bandwidth</h3>
<p>Loss correction from the sdw-aar module trades bandwidth for quality. <b>Packet duplication</b> sends every packet of the chosen traffic on two tunnels, so that traffic uses <b>double</b> the bandwidth. <b>FEC</b> adds parity packets, which add overhead. Both add load to the queues on the interfaces they use. Include the duplicates in the sizing of the voice queue on <b>both</b> paths, otherwise the LLQ police rate drops the very packets you duplicated to protect.</p>

<h3>Sizing voice and video with real numbers</h3>
<p>For a G.711 call with 20 ms packetisation: payload 160 bytes + RTP 12 + UDP 8 + IP 20 = 200 bytes at Layer 3 (80 kbps). In an IPsec tunnel add about 54 bytes of outer IP, ESP, IV and ICV, 8 bytes of UDP encapsulation and 18 bytes of Ethernet header and trailer: about 280 bytes per packet. At 50 packets per second that is 280 x 8 x 50 = 112,000 bps, about <b>112 kbps per call</b> on the wire. G.729 (20-byte payload) is about 140 bytes, about <b>56 kbps</b>. Treat these as planning figures; actual overhead depends on cipher, encapsulation and L2 type.</p>
<div class="eg"><p><b>Worked example.</b> Branch E-BLR-1: shaped 19 Mbps, 12 G.711 calls, 3 HD video rooms assumed at 2 Mbps each, with packet duplication on voice. Voice: 12 x 0.112 = 1.34 Mbps; with duplication on the path 2.7 Mbps; the LLQ at 20 percent of 19 Mbps = 3.8 Mbps. Good. Video: 3 x 2 = 6 Mbps. With the earlier WRR ratio 25:25:10:20 the video share of the remaining 15.2 Mbps is 15.2 x 25/80 = 4.75 Mbps, less than 6, so video suffers in busy hours. Change the ratio to VIDEO 40, CRITICAL 20, DEFAULT 20, BULK 10 (total 90): video gets 15.2 x 40/90 = 6.76 Mbps. Now both fit with room to spare.</p></div>

<div class="warn"><p><b>Common mistake.</b> Marking voice DSCP 46 on both transports and assuming the internet provider honours it. On the internet the marking does nothing between networks. Another mistake is sizing the LLQ for the calls on one path and forgetting duplicated packets.</p></div>

<div class="exam"><p><b>Exam trap.</b> DSCP is preserved in the outer IPsec header; the rewrite rule is applied on the egress WAN (tunnel) interface and can change the outer value for the provider. The forwarding class never leaves the router. Duplication doubles the bandwidth of the duplicated traffic.</p></div>

<div class="scn"><h4>The provider's "gold" class stayed empty</h4><p>Bharat Retail bought 4 Mbps of real-time class on its MPLS from the provider, but voice calls over MPLS suffered during bulk transfers, and the provider's report showed the real-time class idle. The edge was marking voice DSCP 46, but the provider's class table used DSCP 40 for real-time. All voice fell in the default class. The team added a rewrite rule mapping VOICE to 40 on the MPLS interface and calls became clean.</p><p><b>Lesson:</b> map your classes to the provider's published values with a rewrite rule.</p></div>

<div class="iv"><p class="q">"Does DSCP survive an SD-WAN IPsec tunnel, and how do you adapt it to an MPLS provider?"</p><p>Yes: the original DSCP is preserved in the outer IP header, so an MPLS provider can classify encrypted packets. I use a rewrite rule on the MPLS WAN interface to map my forwarding classes (and loss priority) to the provider's published DSCP values. On the internet the marking is normally ignored between networks, so only local queuing and shaping help there.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Outer IPsec header carries the DSCP; a rewrite rule can change the outer value on egress.</li>
<li>Map your classes to the MPLS provider's published classes; the internet usually ignores DSCP.</li>
<li>QoS keeps AAR measurements honest and must exist on every transport interface.</li>
<li>Duplication doubles and FEC adds bandwidth; include it in voice queue sizing.</li>
<li>Plan with figures: about 112 kbps per G.711 call on the wire, about 56 kbps per G.729 call.</li>
</ul></div>
`,hi:`
<p>Aap parcel par pata aur "URGENT" ka sticker lagate ho. Courier company aapka parcel apne sealed box mein apne label ke saath rakhti hai, aur sticker andar chhup jaata hai. Kya sorting depot aapke parcel ko urgent maanega? Tabhi jab courier sticker bahar ke box par bhi copy kare, aur depot use maanne ko raazi ho. SD-WAN mein "sealed box" IPsec tunnel hai aur depot aapka MPLS ya internet provider.</p>

<h3>Tunnel ke andar DSCP ka kya hota hai</h3>
<p>Edge jab LAN packet ko IPsec tunnel mein bhejta hai to original IP packet encrypt hota hai aur naye outer IP header (plus ESP aur UDP headers) mein lipta jaata hai. Transport device sirf <b>outer</b> header padh sakta hai. Cisco ke documentation aur labs dikhate hain ki original packet ka DSCP <b>outer header mein preserve</b> hota hai, to DSCP maanne wala provider encrypted voice packet par bhi "46" dekh sakta hai. Egress WAN interface par <b>rewrite rule</b> phir outer DSCP ko provider ki ummeed ke hisaab se badalne deta hai, us inner packet ko chhue bina jo door ki site ko milega.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Overlay mein DSCP">
<rect x="10" y="60" width="130" height="70" rx="8" fill="#bbf7d0"/><text x="75" y="90" text-anchor="middle" class="svg-ink" font-size="13">IP phone</text><text x="75" y="110" text-anchor="middle" class="svg-muted" font-size="12">inner DSCP 46</text>
<rect x="170" y="40" width="140" height="110" rx="8" fill="#bae6fd"/><text x="240" y="66" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1</text><text x="240" y="88" text-anchor="middle" class="svg-muted" font-size="12">class VOICE, Q0</text><text x="240" y="106" text-anchor="middle" class="svg-muted" font-size="12">outer DSCP 46</text><text x="240" y="124" text-anchor="middle" class="svg-muted" font-size="12">rewrite: 46 se 46</text>
<rect x="340" y="60" width="130" height="70" rx="8" fill="#fde68a"/><text x="405" y="86" text-anchor="middle" class="svg-ink" font-size="13">MPLS provider</text><text x="405" y="106" text-anchor="middle" class="svg-muted" font-size="12">EF = real-time class</text>
<rect x="500" y="40" width="130" height="110" rx="8" fill="#bae6fd"/><text x="565" y="66" text-anchor="middle" class="svg-ink" font-size="13">E-MUM-1</text><text x="565" y="90" text-anchor="middle" class="svg-muted" font-size="12">decrypt</text><text x="565" y="108" text-anchor="middle" class="svg-muted" font-size="12">inner DSCP 46</text>
<line x1="140" y1="95" x2="170" y2="95" stroke="#64748b" stroke-width="2"/><line x1="310" y1="95" x2="340" y2="95" stroke="#64748b" stroke-width="3"/><line x1="470" y1="95" x2="500" y2="95" stroke="#64748b" stroke-width="3"/>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="12">Inner marking door ki LAN ke liye rehti hai; outer marking provider dekhta hai</text>
</svg><p class="cap">Provider sirf outer DSCP padhta hai; rewrite rule use provider ki classes ke hisaab se badal sakta hai.</p></div>

<h3>MPLS provider se baat karna</h3>
<p>MPLS providers thodi si <b>classes of service</b> bechte hain, aksar teen ya chaar (real-time, business-critical, standard, default), har ek ke liye khaas DSCP values ke saath, aur har class ko aapke kharide hue amount tak police karte hain. Jo value woh pehchante nahi use aam taur par default maante hain. Edge ka kaam hai <b>aapki</b> classes ko <b>unki</b> values se map karna, MPLS interface par rewrite rule se:</p>
<table class="cmp"><tr><th>Aapki class</th><th>Inner DSCP</th><th>Provider class (example)</th><th>MPLS egress par rewrite</th></tr>
<tr><td>VOICE</td><td>46</td><td>Real-time</td><td>46</td></tr>
<tr><td>VIDEO</td><td>34</td><td>Business-critical</td><td>26 (AF31)</td></tr>
<tr><td>CRITICAL</td><td>18</td><td>Business-critical</td><td>26 (AF31) ya 18 (AF21)</td></tr>
<tr><td>BULK</td><td>8</td><td>Default</td><td>0</td></tr></table>
<p>Ek hi class <b>packet loss priority</b> ke hisaab se do alag DSCP values le sakti hai: policer ke rate ke andar traffic ka PLP low hota hai, <code>exceed remark</code> se mark kiya excess PLP high hota hai, aur rewrite rule unhe alag values de sakta hai (jaise conforming ke liye AF31 aur exceeding ke liye AF32) taaki provider excess ko pehle drop kare. MPLS CSC provider ke liye Cisco seedha MPLS EXP value par rewrite bhi dikhata hai.</p>
<p>Hamesha provider ki published class table use karo. Is chapter ke numbers production network mein contract mein confirm kiye bina mat copy karo.</p>

<h3>Public internet</h3>
<p>Internet providers aam taur par networks ke beech DSCP ko maante nahi, aur use zero par reset bhi kar sakte hain. Isliye biz-internet interface par rewrite rule path ke liye bekaar hai, lekin <b>local queues aur shaper phir bhi matter karte hain</b>: woh aapke apne circuit ke andar voice ko bachate hain, jahan zyadatar congestion hota hai (branch par last mile).</p>

<h3>QoS aur application-aware routing saath mein</h3>
<p>sdw-aar module har tunnel ko BFD se naapta hai aur loss, latency aur jitter ko SLA class se compare karta hai. QoS aur AAR kahan milte hain:</p>
<ul>
<li><b>QoS measurement ko imaandar rakhta hai.</b> Agar tunnel bulk traffic se saturate ho jaaye, queuing delay measured latency aur jitter badha deta hai aur AAR violation declare karke voice ko door le ja sakta hai. Bulk ke liye sahi queue aur shaping ke saath measured values transport ko dikhate hain, aapki apni congestion ko nahi. Cisco router ka apna control traffic queue 0 mein rakhta hai; us queue ko user traffic se uske policer se zyada mat bharo, warna protocol packets late ho sakte hain.</li>
<li><b>AAR path chunta hai, QoS us par packets ko order deta hai.</b> AAR voice ko mpls colour par le jaaye, to us interface ke QoS map mein bhi voice queue aur us provider ke liye rewrite rule hona chahiye. QoS policy <b>har</b> transport interface ke liye banao, sirf mukhya ke liye nahi.</li>
<li><b>Pehle mark, phir steer.</b> Jo data policy DSCP aur class set karti hai wahi match AAR ke liye bhi use ho sakta hai. Ek baar classify karo; dono mein wahi app-list use karo.</li>
<li><b>Edge par order.</b> Ingress ACL, phir centralized policies, phir forwarding, IPsec encapsulation aur ant mein egress QoS (sdw-aar ka troubleshooting chapter dekho). Isliye ingress ka classifier tay karta hai ki egress par kaunsi queue use hogi.</li>
</ul>

<h3>FEC aur packet duplication ko bandwidth chahiye</h3>
<p>sdw-aar module ka loss correction bandwidth ke badle quality kharidta hai. <b>Packet duplication</b> chune hue traffic ke har packet ko do tunnels par bhejta hai, to woh traffic <b>double</b> bandwidth use karta hai. <b>FEC</b> parity packets jodta hai, jo overhead badhate hain. Dono jin interfaces ko use karte hain unki queues par load badhate hain. Voice queue ki sizing mein duplicates ko <b>dono</b> paths par jodo, warna LLQ ka police rate wahi packets drop kar deta hai jinhe aapne bachane ke liye duplicate kiya tha.</p>

<h3>Asli numbers se voice aur video sizing</h3>
<p>G.711 call (20 ms packetisation) ke liye: payload 160 bytes + RTP 12 + UDP 8 + IP 20 = Layer 3 par 200 bytes (80 kbps). IPsec tunnel mein lagbhag 54 bytes outer IP, ESP, IV aur ICV, 8 bytes UDP encapsulation aur 18 bytes Ethernet header aur trailer jodo: lagbhag 280 bytes per packet. 50 packets per second par yeh 280 x 8 x 50 = 112,000 bps, wire par lagbhag <b>112 kbps per call</b> hai. G.729 (20-byte payload) lagbhag 140 bytes, yaani lagbhag <b>56 kbps</b>. Inhe planning figures samjho; asli overhead cipher, encapsulation aur L2 type par depend karta hai.</p>
<div class="eg"><p><b>Worked example.</b> Branch E-BLR-1: shaped 19 Mbps, 12 G.711 calls, 3 HD video rooms (maan lo har ek 2 Mbps), voice par packet duplication. Voice: 12 x 0.112 = 1.34 Mbps; path par duplication ke saath 2.7 Mbps; LLQ 19 Mbps ka 20 percent = 3.8 Mbps. Theek. Video: 3 x 2 = 6 Mbps. Pehle ke WRR ratio 25:25:10:20 se bache 15.2 Mbps mein video ka hissa 15.2 x 25/80 = 4.75 Mbps hai, 6 se kam, to busy ghanton mein video tootti hai. Ratio ko VIDEO 40, CRITICAL 20, DEFAULT 20, BULK 10 (total 90) karo: video ko 15.2 x 40/90 = 6.76 Mbps milte hain. Ab dono bachat ke saath fit hote hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Dono transports par voice ko DSCP 46 mark karna aur maan lena ki internet provider use maanega. Internet par marking networks ke beech kuch nahi karti. Ek aur galti hai LLQ ko ek path ki calls ke hisaab se size karna aur duplicated packets bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> DSCP outer IPsec header mein preserve hota hai; rewrite rule egress WAN (tunnel) interface par lagta hai aur provider ke liye outer value badal sakta hai. Forwarding class router se kabhi bahar nahi jaati. Duplication duplicate kiye traffic ka bandwidth double karta hai.</p></div>

<div class="scn"><h4>Provider ki "gold" class khaali rahi</h4><p>Bharat Retail ne provider se MPLS par 4 Mbps real-time class kharidi thi, lekin bulk transfers ke dauran MPLS par voice calls kharab hoti thin, aur provider ki report mein real-time class idle dikhi. Edge voice ko DSCP 46 mark kar raha tha, lekin provider ki class table real-time ke liye DSCP 40 use karti thi. Saari voice default class mein gir rahi thi. Team ne MPLS interface par VOICE ko 40 se map karne wala rewrite rule joda aur calls saaf ho gayin.</p><p><b>Lesson:</b> apni classes ko provider ki published values se rewrite rule ke zariye map karo.</p></div>

<div class="iv"><p class="q">"Kya DSCP SD-WAN IPsec tunnel se bachta hai, aur MPLS provider ke liye use kaise adapt karte ho?"</p><p>Haan: original DSCP outer IP header mein preserve hota hai, to MPLS provider encrypted packets ko classify kar sakta hai. Main MPLS WAN interface par rewrite rule use karta hoon jo meri forwarding classes (aur loss priority) ko provider ki published DSCP values se map karta hai. Internet par marking aam taur par networks ke beech ignore hoti hai, isliye wahan sirf local queuing aur shaping madad karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Outer IPsec header DSCP carry karta hai; rewrite rule egress par outer value badal sakta hai.</li>
<li>Apni classes ko MPLS provider ki published classes se map karo; internet aam taur par DSCP ignore karta hai.</li>
<li>QoS AAR measurements ko imaandar rakhta hai aur har transport interface par hona chahiye.</li>
<li>Duplication double aur FEC extra bandwidth leta hai; voice queue sizing mein jodo.</li>
<li>Figures se plan karo: G.711 call wire par lagbhag 112 kbps, G.729 lagbhag 56 kbps.</li>
</ul></div>
`}};export{e as default};