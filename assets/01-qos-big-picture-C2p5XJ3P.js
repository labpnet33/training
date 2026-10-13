var e={id:`qos-big-picture`,h:{en:`Why QoS: the big picture, and what voice and video need`,hi:`QoS kyun: big picture, aur voice aur video ko kya chahiye`},body:{en:`
<h3>What you will learn</h3>
<ul>
<li>Why congestion breaks voice and video, measured with real numbers: bandwidth, delay, jitter and loss.</li>
<li>The three QoS models (best effort, IntServ, DiffServ) and why enterprises run DiffServ.</li>
<li>How to classify traffic (ACL, NBAR), where to draw the trust boundary, and how to mark it with CoS, DSCP, IP Precedence, MPLS EXP and Wi-Fi user priority.</li>
<li>The Modular QoS CLI (class-map, policy-map, service-policy) and the tools it drives: CBWFQ and LLQ queueing, WRED, policing and shaping with token bucket maths.</li>
<li>Where to apply each policy, hierarchical shaping on sub-rate WAN links, and wireless QoS profiles on a controller.</li>
<li>How to read <code>show policy-map interface</code> and troubleshoot a policy that "looks right" but does nothing.</li>
</ul>
<p><b>Prerequisites:</b> CCNA-level IPv4 addressing, extended ACLs, VLANs and 802.1Q trunks, and basic router configuration. The ENCOR bridge module is helpful but not required. Everything QoS-specific is built from zero here.</p>

<h3>The big picture: an airport security line</h3>
<p>Picture an airport with one security scanner. On a quiet morning everybody walks straight through. At 7 pm three flights board together and a long line forms. The scanner is not slower; there are simply more passengers than it can handle per minute. Now the airport has choices. It can serve everyone in arrival order and let the pilots miss their flight. Or it can open a <b>priority lane</b> for crew, give business class a guaranteed share of the scanner, and ask passengers with no hurry to wait. It cannot make the scanner faster. It can only decide <b>who waits and who is turned away</b>.</p>
<p>That is exactly what <b>Quality of Service (QoS)</b> is: a set of tools that decide, <b>during congestion</b>, which packets are sent first, which wait in a queue, and which are dropped. QoS never creates bandwidth. If a link is never full, QoS changes almost nothing.</p>

<h3>Where congestion happens</h3>
<p>A link always transmits at its line rate. Congestion appears where more traffic arrives than the outgoing interface can send, which happens in two classic places:</p>
<ul>
<li><b>Speed mismatch:</b> a 1 Gbps LAN feeding a 10 Mbps or 100 Mbps WAN circuit. This is the branch router's WAN egress, the most important QoS point in any enterprise.</li>
<li><b>Aggregation:</b> forty 1 Gbps access ports sharing one 10 Gbps uplink. Usually fine, but short microbursts still fill buffers.</li>
</ul>
<p>When packets arrive faster than they leave, they wait in the <b>output queue</b>. When the queue is full, new arrivals are dropped. Every QoS symptom comes from this one fact.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Lab topology with WAN bottleneck">
<rect x="10" y="30" width="100" height="40" rx="8" fill="#bbf7d0"/><text x="60" y="48" text-anchor="middle" class="svg-ink" font-size="13">PHONE</text><text x="60" y="63" text-anchor="middle" class="svg-muted" font-size="12">10.10.10.10</text>
<rect x="10" y="150" width="100" height="40" rx="8" fill="#fde68a"/><text x="60" y="168" text-anchor="middle" class="svg-ink" font-size="13">PC-DATA</text><text x="60" y="183" text-anchor="middle" class="svg-muted" font-size="12">10.10.10.20</text>
<rect x="150" y="90" width="80" height="40" rx="8" fill="#e2e8f0"/><text x="190" y="115" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<line x1="110" y1="50" x2="150" y2="105" stroke="#64748b" stroke-width="2"/><line x1="110" y1="170" x2="150" y2="118" stroke="#64748b" stroke-width="2"/>
<rect x="270" y="90" width="90" height="40" rx="8" fill="#bae6fd"/><text x="315" y="108" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="315" y="123" text-anchor="middle" class="svg-muted" font-size="12">branch</text>
<line x1="230" y1="110" x2="270" y2="110" stroke="#64748b" stroke-width="4"/><text x="250" y="150" text-anchor="middle" class="svg-muted" font-size="12">1 Gbps</text>
<rect x="440" y="90" width="80" height="40" rx="8" fill="#bae6fd"/><text x="480" y="115" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<line x1="360" y1="110" x2="440" y2="110" stroke="#64748b" stroke-width="1.5"/><text x="400" y="100" text-anchor="middle" class="svg-accent" font-size="12">10 Mbps</text>
<rect x="545" y="90" width="85" height="40" rx="8" fill="#ddd6fe"/><text x="587" y="108" text-anchor="middle" class="svg-ink" font-size="13">HQ-SRV</text><text x="587" y="123" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.100</text>
<line x1="520" y1="110" x2="545" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="160" width="150" height="34" rx="6" fill="#fed7aa"/><text x="405" y="182" text-anchor="middle" class="svg-ink" font-size="12">queue builds: Gi0/0 out</text>
<line x1="360" y1="130" x2="380" y2="160" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="320" y="20" text-anchor="middle" class="svg-muted" font-size="12">Pune branch to HQ, the topology of both labs</text>
</svg><p class="cap">The lab network: a fast LAN meets a 10 Mbps WAN on R1 GigabitEthernet0/0. The output queue there is where QoS earns its keep.</p></div>

<h3>The four symptoms</h3>
<dl class="terms">
<dt>Bandwidth</dt><dd>The capacity of a link in bits per second. Not enough of it, at one moment, for everyone.</dd>
<dt>Delay (latency)</dt><dd>The time a packet takes end to end: serialization, propagation, and the variable part, <b>queuing delay</b>.</dd>
<dt>Jitter</dt><dd>The variation in delay between packets of the same flow. Phones hide it with a <b>jitter buffer</b>, but a big buffer adds delay.</dd>
<dt>Loss</dt><dd>Packets dropped, mostly because a queue was full (tail drop).</dd>
</dl>
<p>TCP applications such as backups and downloads tolerate all four: TCP slows down and retransmits. Real-time UDP media cannot retransmit; a late voice packet is as useless as a lost one.</p>

<table class="cmp"><tr><th>Requirement</th><th>Voice</th><th>Interactive video</th><th>Bulk data</th></tr>
<tr><td>One-way delay</td><td>150 ms or less</td><td>150 to 200 ms</td><td>tolerant</td></tr>
<tr><td>Jitter</td><td>30 ms or less</td><td>30 to 50 ms</td><td>tolerant</td></tr>
<tr><td>Loss</td><td>1% or less</td><td>0.1 to 1%</td><td>recovered by TCP</td></tr>
<tr><td>Bandwidth</td><td>21 to 320 kbps per call, smooth</td><td>hundreds of kbps to many Mbps, bursty</td><td>takes all it can get</td></tr></table>

<div class="eg"><p><b>Worked example: how much bandwidth is one G.711 call?</b> G.711 sends 64 kbps of audio. With the common 20 ms packetization, each packet carries 160 bytes of voice, at 50 packets per second. Add 12 bytes RTP, 8 bytes UDP and 20 bytes IPv4 = 200 bytes per packet. 200 × 8 × 50 = <b>80 kbps</b> at Layer 3. On Ethernet add 18 bytes of header and FCS: 218 × 8 × 50 = <b>87.2 kbps</b>. A G.729 call (20 bytes of voice) needs 60 × 8 × 50 = 24 kbps at Layer 3. Five G.711 calls therefore need about 400 kbps, exactly the voice load you will generate in the lab with <code>traffic 10.20.0.100 udp/20000 400 30</code>.</p></div>

<div class="warn"><p><b>Common mistake.</b> "We will just buy more bandwidth." Upgrading helps averages, but backups and updates are designed to fill whatever pipe they get, and microbursts still overflow queues. QoS is what protects voice during the few seconds that matter.</p></div>

<div class="exam"><p><b>Exam trap.</b> QoS manages congestion; it does not add capacity and it has no effect on an uncongested interface. Also remember the voice numbers: 150 ms one-way delay, 30 ms jitter, 1% loss.</p></div>

<div class="scn"><h4>Robotic calls every evening</h4><p>The Pune branch complained that calls to HQ sounded robotic, but only after 6 pm. Daytime pings showed 12 ms latency and no loss, so the provider closed the ticket. The engineer ran a ping during the evening backup window instead: latency jumped to 380 ms with 4% loss. The 10 Mbps WAN was full of SMB backup traffic and a software update, and the router served everything first-in, first-out. Voice sat behind 1400-byte backup packets in a full queue.</p><p><b>Lesson:</b> QoS problems only show under load. Test during congestion, and look at the WAN egress queue first. This exact case is lab 1 of this module.</p></div>

<div class="iv"><p class="q">"What is QoS and when does it actually do anything?"</p><p>Strong answer: QoS is a set of tools, classification, marking, queuing, dropping, policing and shaping, that decide which traffic gets through first when an interface is congested. It manages delay, jitter and loss for sensitive traffic such as voice (150 ms, 30 ms, 1%). It does not create bandwidth and only takes effect when a queue builds, typically at a LAN-to-WAN speed mismatch.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Congestion happens at speed mismatches and aggregation points; the WAN egress is the key place.</li>
<li>The four symptoms are bandwidth, delay, jitter and loss.</li>
<li>Voice targets: 150 ms or less one-way, 30 ms or less jitter, 1% or less loss, about 80 kbps per G.711 call at Layer 3.</li>
<li>QoS decides who waits and who is dropped; it never adds capacity.</li>
<li>Both labs use one topology: PHONE and PC-DATA behind R1, a 10 Mbps WAN to R2 and HQ-SRV.</li>
</ul></div>
`,hi:`
<h3>Aap kya seekhoge</h3>
<ul>
<li>Congestion voice aur video ko kyun todta hai, asli numbers ke saath: bandwidth, delay, jitter aur loss.</li>
<li>Teen QoS models (best effort, IntServ, DiffServ) aur enterprises DiffServ kyun chalate hain.</li>
<li>Traffic ko kaise classify karein (ACL, NBAR), trust boundary kahan kheenchein, aur use CoS, DSCP, IP Precedence, MPLS EXP aur Wi-Fi user priority se kaise mark karein.</li>
<li>Modular QoS CLI (class-map, policy-map, service-policy) aur woh tools jo yeh chalata hai: CBWFQ aur LLQ queueing, WRED, policing aur shaping token bucket maths ke saath.</li>
<li>Har policy kahan lagani hai, sub-rate WAN links par hierarchical shaping, aur controller par wireless QoS profiles.</li>
<li><code>show policy-map interface</code> kaise padhein aur us policy ko kaise troubleshoot karein jo "sahi dikhti hai" par kuch karti nahi.</li>
</ul>
<p><b>Prerequisites:</b> CCNA-level IPv4 addressing, extended ACLs, VLANs aur 802.1Q trunks, aur basic router configuration. ENCOR bridge module madadgaar hai par zaroori nahi. QoS ki har cheez yahan zero se banayi gayi hai.</p>

<h3>Big picture: airport ki security line</h3>
<p>Ek airport socho jismein ek hi security scanner hai. Shaant subah mein sab seedhe nikal jaate hain. Shaam 7 baje teen flights ek saath board hoti hain aur lambi line lag jaati hai. Scanner dheema nahi hua; bas passengers itne zyada hain ki woh har minute sambhal nahi paata. Ab airport ke paas options hain. Woh sabko aane ke kram mein serve kare aur pilots ki flight chhoot jaaye. Ya woh crew ke liye <b>priority lane</b> khole, business class ko scanner ka guaranteed hissa de, aur jinhe jaldi nahi hai unhe intezaar karne ko kahe. Woh scanner tez nahi kar sakta. Woh sirf decide kar sakta hai ki <b>kaun intezaar kare aur kise lauta diya jaaye</b>.</p>
<p>Yahi <b>Quality of Service (QoS)</b> hai: tools ka ek set jo <b>congestion ke dauran</b> decide karta hai ki kaunse packets pehle jaayenge, kaunse queue mein intezaar karenge, aur kaunse drop honge. QoS kabhi bandwidth paida nahi karta. Agar link kabhi full hi nahi hota, to QoS lagbhag kuch nahi badalta.</p>

<h3>Congestion kahan hota hai</h3>
<p>Link hamesha apne line rate par hi transmit karta hai. Congestion wahan aata hai jahan outgoing interface jitna bhej sakta hai usse zyada traffic aata hai, aur yeh do classic jagah hota hai:</p>
<ul>
<li><b>Speed mismatch:</b> 1 Gbps LAN jo 10 Mbps ya 100 Mbps WAN circuit ko feed karta hai. Yeh branch router ka WAN egress hai, kisi bhi enterprise ka sabse important QoS point.</li>
<li><b>Aggregation:</b> chaalees 1 Gbps access ports ek 10 Gbps uplink share karte hain. Aam taur par theek, par chhote microbursts phir bhi buffers bhar dete hain.</li>
</ul>
<p>Jab packets nikalne se tez aate hain, woh <b>output queue</b> mein intezaar karte hain. Queue full hone par naye aane wale drop hote hain. Har QoS lakshan isi ek fact se aata hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Lab topology with WAN bottleneck">
<rect x="10" y="30" width="100" height="40" rx="8" fill="#bbf7d0"/><text x="60" y="48" text-anchor="middle" class="svg-ink" font-size="13">PHONE</text><text x="60" y="63" text-anchor="middle" class="svg-muted" font-size="12">10.10.10.10</text>
<rect x="10" y="150" width="100" height="40" rx="8" fill="#fde68a"/><text x="60" y="168" text-anchor="middle" class="svg-ink" font-size="13">PC-DATA</text><text x="60" y="183" text-anchor="middle" class="svg-muted" font-size="12">10.10.10.20</text>
<rect x="150" y="90" width="80" height="40" rx="8" fill="#e2e8f0"/><text x="190" y="115" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<line x1="110" y1="50" x2="150" y2="105" stroke="#64748b" stroke-width="2"/><line x1="110" y1="170" x2="150" y2="118" stroke="#64748b" stroke-width="2"/>
<rect x="270" y="90" width="90" height="40" rx="8" fill="#bae6fd"/><text x="315" y="108" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="315" y="123" text-anchor="middle" class="svg-muted" font-size="12">branch</text>
<line x1="230" y1="110" x2="270" y2="110" stroke="#64748b" stroke-width="4"/><text x="250" y="150" text-anchor="middle" class="svg-muted" font-size="12">1 Gbps</text>
<rect x="440" y="90" width="80" height="40" rx="8" fill="#bae6fd"/><text x="480" y="115" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<line x1="360" y1="110" x2="440" y2="110" stroke="#64748b" stroke-width="1.5"/><text x="400" y="100" text-anchor="middle" class="svg-accent" font-size="12">10 Mbps</text>
<rect x="545" y="90" width="85" height="40" rx="8" fill="#ddd6fe"/><text x="587" y="108" text-anchor="middle" class="svg-ink" font-size="13">HQ-SRV</text><text x="587" y="123" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.100</text>
<line x1="520" y1="110" x2="545" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="160" width="150" height="34" rx="6" fill="#fed7aa"/><text x="405" y="182" text-anchor="middle" class="svg-ink" font-size="12">queue yahan banti: Gi0/0 out</text>
<line x1="360" y1="130" x2="380" y2="160" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="320" y="20" text-anchor="middle" class="svg-muted" font-size="12">Pune branch se HQ, dono labs ki topology</text>
</svg><p class="cap">Lab network: fast LAN R1 GigabitEthernet0/0 par 10 Mbps WAN se milta hai. Wahan ki output queue hi woh jagah hai jahan QoS apna kaam dikhata hai.</p></div>

<h3>Chaar lakshan</h3>
<dl class="terms">
<dt>Bandwidth</dt><dd>Link ki capacity bits per second mein. Ek pal mein sabke liye kaafi nahi.</dd>
<dt>Delay (latency)</dt><dd>Packet ko end to end lagne wala samay: serialization, propagation, aur badalne wala hissa, <b>queuing delay</b>.</dd>
<dt>Jitter</dt><dd>Same flow ke packets ke beech delay ka utaar-chadhaav. Phone ise <b>jitter buffer</b> se chhupata hai, par bada buffer delay badhata hai.</dd>
<dt>Loss</dt><dd>Drop hue packets, zyada tar isliye ki queue full thi (tail drop).</dd>
</dl>
<p>Backups aur downloads jaisi TCP applications chaaron ko jhel leti hain: TCP dheema hota hai aur retransmit karta hai. Real-time UDP media retransmit nahi kar sakta; der se aaya voice packet utna hi bekaar hai jitna khoya hua.</p>

<table class="cmp"><tr><th>Zaroorat</th><th>Voice</th><th>Interactive video</th><th>Bulk data</th></tr>
<tr><td>One-way delay</td><td>150 ms ya kam</td><td>150 se 200 ms</td><td>jhel leta hai</td></tr>
<tr><td>Jitter</td><td>30 ms ya kam</td><td>30 se 50 ms</td><td>jhel leta hai</td></tr>
<tr><td>Loss</td><td>1% ya kam</td><td>0.1 se 1%</td><td>TCP recover karta hai</td></tr>
<tr><td>Bandwidth</td><td>21 se 320 kbps per call, smooth</td><td>sau kbps se kai Mbps, bursty</td><td>jitna mile sab le leta hai</td></tr></table>

<div class="eg"><p><b>Worked example: ek G.711 call kitni bandwidth leti hai?</b> G.711 64 kbps audio bhejta hai. Common 20 ms packetization ke saath har packet mein 160 bytes voice hoti hai, 50 packets per second par. 12 bytes RTP, 8 bytes UDP aur 20 bytes IPv4 jodo = 200 bytes per packet. 200 × 8 × 50 = Layer 3 par <b>80 kbps</b>. Ethernet par 18 bytes header aur FCS jodo: 218 × 8 × 50 = <b>87.2 kbps</b>. G.729 call (20 bytes voice) ko Layer 3 par 60 × 8 × 50 = 24 kbps chahiye. Isliye paanch G.711 calls ko lagbhag 400 kbps chahiye, bilkul utna voice load jitna aap lab mein <code>traffic 10.20.0.100 udp/20000 400 30</code> se banaoge.</p></div>

<div class="warn"><p><b>Common galti.</b> "Hum bas zyada bandwidth khareed lenge." Upgrade averages mein madad karta hai, par backups aur updates jo bhi pipe mile use bharne ke liye hi bane hain, aur microbursts phir bhi queues overflow karte hain. QoS hi un kuch seconds mein voice ko bachata hai jo matter karte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> QoS congestion manage karta hai; yeh capacity nahi jodta aur uncongested interface par iska koi asar nahi. Voice numbers bhi yaad rakho: 150 ms one-way delay, 30 ms jitter, 1% loss.</p></div>

<div class="scn"><h4>Har shaam robotic calls</h4><p>Pune branch ne shikayat ki ki HQ ko calls robotic sunai deti hain, par sirf shaam 6 baje ke baad. Din ke pings mein 12 ms latency aur zero loss tha, isliye provider ne ticket band kar diya. Engineer ne iski jagah shaam ke backup window mein ping chalaya: latency 380 ms tak uchhal gayi aur 4% loss tha. 10 Mbps WAN SMB backup traffic aur ek software update se bhara tha, aur router sab kuch first-in, first-out serve kar raha tha. Voice full queue mein 1400-byte backup packets ke peeche baithi thi.</p><p><b>Seekh:</b> QoS problems sirf load mein dikhti hain. Congestion ke dauran test karo, aur pehle WAN egress queue dekho. Yahi case is module ka lab 1 hai.</p></div>

<div class="iv"><p class="q">"QoS kya hai aur yeh asal mein kab kuch karta hai?"</p><p>Strong answer: QoS tools ka set hai, classification, marking, queuing, dropping, policing aur shaping, jo decide karta hai ki interface congested hone par kaunsa traffic pehle nikle. Yeh voice jaise sensitive traffic ke liye delay, jitter aur loss manage karta hai (150 ms, 30 ms, 1%). Yeh bandwidth paida nahi karta aur sirf tab asar karta hai jab queue banti hai, aam taur par LAN-to-WAN speed mismatch par.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Congestion speed mismatch aur aggregation points par hota hai; WAN egress sabse zaroori jagah hai.</li>
<li>Chaar lakshan hain bandwidth, delay, jitter aur loss.</li>
<li>Voice targets: 150 ms ya kam one-way, 30 ms ya kam jitter, 1% ya kam loss, Layer 3 par lagbhag 80 kbps per G.711 call.</li>
<li>QoS decide karta hai kaun intezaar kare aur kaun drop ho; yeh kabhi capacity nahi jodta.</li>
<li>Dono labs ek hi topology use karti hain: R1 ke peeche PHONE aur PC-DATA, R2 aur HQ-SRV tak 10 Mbps WAN.</li>
</ul></div>
`}};export{e as default};