var e={id:`why-qos`,h:{en:`What you will learn: why the WAN edge needs QoS`,hi:`Aap kya seekhoge: WAN edge ko QoS kyun chahiye`},body:{en:`
<p>Picture the road outside a big railway station at 6 pm. Ambulances, buses, cars, scooters and handcarts all use the same road. If nobody manages it, the ambulance sits in the same jam as the handcart. A city fixes this with <b>lanes</b> (a bus lane, an ambulance priority), <b>traffic police</b> (who decide which vehicle goes first) and a <b>toll gate</b> that releases vehicles only as fast as the next bridge can take them. <b>Quality of Service (QoS)</b> is exactly that, for packets, and the WAN edge is the busiest junction in your network.</p>

<h3>What you will learn in this module</h3>
<ul>
<li>Why a WAN link needs QoS, even when average utilisation looks low.</li>
<li>How traffic is <b>classified and marked</b> with DSCP and forwarding classes.</li>
<li>The building blocks of a <b>localized policy</b>: class map, QoS scheduler and QoS map, rewrite rule, policer and ACL.</li>
<li><b>Queuing and scheduling</b>: the 8 queues, low-latency queuing (LLQ), weighted round robin (WRR), and congestion avoidance with RED.</li>
<li><b>Shaping</b> a WAN interface to the real circuit speed, and <b>hierarchical</b> QoS.</li>
<li><b>Per-tunnel QoS</b> on a hub that serves many spokes.</li>
<li>How DSCP travels across the IPsec overlay and through an MPLS provider, and how QoS works with application-aware routing and FEC.</li>
<li>Voice and video examples with real numbers, verification commands and a troubleshooting workflow.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should have finished the earlier modules of this track: the architecture and tunnels (<b>sdw-arch</b>), how an edge attaches to a transport (<b>sdw-edge</b>), templates (<b>sdw-templates</b>), centralized data policy and application-aware routing (<b>sdw-aar</b>), and security (<b>sdw-sec</b>). QoS is a <i>localized</i> feature: it is configured on the edge and does not change routing. Basic IP QoS ideas such as DSCP and queues help, but each term is defined again here.</p>

<h3>Why a WAN needs QoS</h3>
<p>Inside a campus, links are fast and rarely full. A WAN link is different: a branch in Pune may have a 20 Mbps broadband circuit shared by video calls, an ERP system, backups and staff watching videos. When the circuit fills, packets wait in a queue. When the queue is full, packets are dropped. Voice is hurt first: a voice call needs a packet every 20 ms, with a delay under about 150 ms one way, jitter under about 30 ms and loss under about 1 percent. A file transfer does not care about any of that. Without QoS every packet is treated the same (<b>best effort</b>), so a 2 GB backup can push the voice call into loss.</p>
<p>Remember that SD-WAN already steers traffic between transports with <b>application-aware routing</b> (the sdw-aar module). AAR chooses <i>which tunnel</i>. QoS decides <i>which packet goes first on the chosen link</i>. They solve different problems and you normally need both.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="QoS path through a WAN edge">
<rect x="10" y="80" width="100" height="60" rx="8" fill="#bbf7d0"/><text x="60" y="108" text-anchor="middle" class="svg-ink" font-size="13">LAN</text><text x="60" y="126" text-anchor="middle" class="svg-muted" font-size="12">10.1.10.0/24</text>
<rect x="135" y="80" width="105" height="60" rx="8" fill="#bae6fd"/><text x="187" y="106" text-anchor="middle" class="svg-ink" font-size="13">1 Classify</text><text x="187" y="124" text-anchor="middle" class="svg-muted" font-size="12">ACL / policy</text>
<rect x="265" y="30" width="105" height="160" rx="8" fill="#ddd6fe"/><text x="317" y="52" text-anchor="middle" class="svg-ink" font-size="13">2 Queues</text>
<rect x="278" y="62" width="79" height="20" rx="4" fill="#fde68a"/><text x="317" y="77" text-anchor="middle" class="svg-ink" font-size="11">Q0 voice LLQ</text>
<rect x="278" y="90" width="79" height="20" rx="4" fill="#fed7aa"/><text x="317" y="105" text-anchor="middle" class="svg-ink" font-size="11">Q1 video</text>
<rect x="278" y="118" width="79" height="20" rx="4" fill="#fed7aa"/><text x="317" y="133" text-anchor="middle" class="svg-ink" font-size="11">Q2 default</text>
<rect x="278" y="146" width="79" height="20" rx="4" fill="#e2e8f0"/><text x="317" y="161" text-anchor="middle" class="svg-ink" font-size="11">Q3 bulk</text>
<rect x="395" y="80" width="105" height="60" rx="8" fill="#bae6fd"/><text x="447" y="106" text-anchor="middle" class="svg-ink" font-size="13">3 Shape</text><text x="447" y="124" text-anchor="middle" class="svg-muted" font-size="12">20 Mbps</text>
<rect x="525" y="80" width="105" height="60" rx="8" fill="#fde68a"/><text x="577" y="106" text-anchor="middle" class="svg-ink" font-size="13">WAN</text><text x="577" y="124" text-anchor="middle" class="svg-muted" font-size="12">INET / MPLS</text>
<line x1="110" y1="110" x2="135" y2="110" stroke="#64748b" stroke-width="2"/><line x1="240" y1="110" x2="265" y2="110" stroke="#64748b" stroke-width="2"/><line x1="370" y1="110" x2="395" y2="110" stroke="#64748b" stroke-width="2"/><line x1="500" y1="110" x2="525" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="320" y="216" text-anchor="middle" class="svg-accent" font-size="12">Mark, queue, shape: the three jobs of QoS on the edge</text>
</svg><p class="cap">Packets from the LAN are classified, placed in a queue, and released by a shaper at the speed of the circuit.</p></div>

<h3>The five ideas in one table</h3>
<table class="cmp"><tr><th>Idea</th><th>Question it answers</th><th>Where you will meet it</th></tr>
<tr><td>Classification and marking</td><td>What kind of traffic is this?</td><td>Chapter 2</td></tr>
<tr><td>Queuing and scheduling</td><td>Who is sent first when the link is busy?</td><td>Chapters 3 and 4</td></tr>
<tr><td>Shaping and policing</td><td>How fast may we send, and what if a class exceeds its rate?</td><td>Chapter 5</td></tr>
<tr><td>Per-tunnel QoS</td><td>How do we protect each spoke from the others at the hub?</td><td>Chapter 6</td></tr>
<tr><td>End-to-end behaviour</td><td>Does the marking survive the overlay and the provider?</td><td>Chapter 7</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Branch E-BLR-1 in Bengaluru has one 20 Mbps broadband (biz-internet colour). During a month-end close, 40 users upload reports, 12 people are on voice calls and 3 meeting rooms run video. Each G.711 call needs about 110 kbps on the wire once IPsec overhead is added (we calculate this properly in chapter 7), so 12 calls need about 1.3 Mbps. If the uploads fill the 20 Mbps circuit, the router queue grows, delay climbs from 20 ms to over 200 ms and voice breaks. With QoS, voice is placed in a priority queue and sent first, and the uploads simply take a little longer.</p></div>

<div class="warn"><p><b>Common mistake.</b> Believing QoS creates bandwidth. It only decides who waits and who is dropped when the link is full. If the circuit is permanently too small, QoS reduces the pain but only more bandwidth fixes it.</p></div>

<div class="exam"><p><b>Exam trap.</b> QoS in Catalyst SD-WAN is configured with a <b>localized policy</b> and a classifying ACL or centralized data policy. It is not a control policy and it does not change OMP routes.</p></div>

<div class="scn"><h4>Voice breaks every Friday at 5 pm</h4><p>Bharat Retail's Delhi branch reported choppy calls every Friday evening. The monitoring dashboard showed the biz-internet link at 100 percent for 30 minutes while a backup job ran. The application-aware routing policy kept voice on biz-internet because the MPLS circuit was down for maintenance. The engineer added a QoS map that placed voice in a priority queue and the backup in a bulk queue, and shaped the interface to the real circuit speed. The next Friday the backup ran slower but calls were clean.</p><p><b>Lesson:</b> path selection cannot help when there is only one path; queue priority can.</p></div>

<div class="iv"><p class="q">"What is the difference between application-aware routing and QoS in SD-WAN?"</p><p>AAR chooses the transport (tunnel) per application using measured loss, latency and jitter. QoS works on a single interface and decides the order in which packets leave it: classification, queues, scheduling and shaping. AAR is a centralized policy; QoS is a localized policy on the edge. They complement each other.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>QoS decides who waits or is dropped when a link is full; it does not add bandwidth.</li>
<li>The WAN edge does three jobs: classify and mark, queue and schedule, then shape.</li>
<li>AAR picks the path; QoS orders packets on the chosen path.</li>
<li>QoS is a localized policy, applied on the edge through templates.</li>
<li>Voice needs low delay, jitter and loss, so it is placed in the priority queue.</li>
</ul></div>
`,hi:`
<p>Badi railway station ke bahar shaam 6 baje ki sadak socho. Ambulance, bus, car, scooter aur thela sab ek hi sadak use karte hain. Agar koi manage na kare to ambulance bhi thele ke saath usi jam mein phans jaati hai. Shehar iska hal <b>lanes</b> (bus lane, ambulance priority), <b>traffic police</b> (jo tay karti hai pehle kaun jaayega) aur ek <b>toll gate</b> se karta hai jo gaadiyon ko utni hi tezi se chhodta hai jitni agla pul le sake. <b>Quality of Service (QoS)</b> bilkul yahi hai, packets ke liye, aur WAN edge aapke network ka sabse busy chauraha hai.</p>

<h3>Is module mein aap kya seekhoge</h3>
<ul>
<li>WAN link ko QoS kyun chahiye, bhale average utilisation kam dikhe.</li>
<li>Traffic ko DSCP aur forwarding classes se kaise <b>classify aur mark</b> karte hain.</li>
<li><b>Localized policy</b> ke building blocks: class map, QoS scheduler aur QoS map, rewrite rule, policer aur ACL.</li>
<li><b>Queuing aur scheduling</b>: 8 queues, low-latency queuing (LLQ), weighted round robin (WRR), aur RED se congestion avoidance.</li>
<li>WAN interface ko asli circuit speed par <b>shape</b> karna, aur <b>hierarchical</b> QoS.</li>
<li>Hub par <b>per-tunnel QoS</b> jo kai spokes ko serve karta hai.</li>
<li>DSCP IPsec overlay aur MPLS provider se kaise guzarta hai, aur QoS application-aware routing aur FEC ke saath kaise kaam karta hai.</li>
<li>Voice aur video ke real numbers ke examples, verification commands aur troubleshooting workflow.</li>
</ul>

<h3>Prerequisites</h3>
<p>Is track ke pichhle modules complete hone chahiye: architecture aur tunnels (<b>sdw-arch</b>), edge transport se kaise judta hai (<b>sdw-edge</b>), templates (<b>sdw-templates</b>), centralized data policy aur application-aware routing (<b>sdw-aar</b>), aur security (<b>sdw-sec</b>). QoS ek <i>localized</i> feature hai: yeh edge par configure hota hai aur routing nahi badalta. DSCP aur queues jaise basic IP QoS ideas se madad milti hai, lekin har term yahan dobara define hota hai.</p>

<h3>WAN ko QoS kyun chahiye</h3>
<p>Campus ke andar links fast hote hain aur kam hi bharte hain. WAN link alag hai: Pune ki branch ke paas 20 Mbps broadband ho sakta hai jo video calls, ERP, backups aur video dekhte staff mein share hota hai. Circuit bharta hai to packets queue mein intezaar karte hain. Queue full ho to packets drop hote hain. Voice sabse pehle prabhavit hoti hai: voice call ko har 20 ms mein ek packet chahiye, one-way delay lagbhag 150 ms se kam, jitter lagbhag 30 ms se kam aur loss lagbhag 1 percent se kam. File transfer ko in sabki parwah nahi. QoS ke bina har packet ek jaisa treat hota hai (<b>best effort</b>), to 2 GB ka backup voice call ko loss mein dhakel sakta hai.</p>
<p>Yaad rakho SD-WAN pehle se transports ke beech <b>application-aware routing</b> (sdw-aar module) se traffic steer karta hai. AAR chunta hai <i>kaunsa tunnel</i>. QoS tay karta hai <i>chune hue link par kaunsa packet pehle jaayega</i>. Dono alag problems solve karte hain aur aam taur par dono chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="WAN edge se QoS path">
<rect x="10" y="80" width="100" height="60" rx="8" fill="#bbf7d0"/><text x="60" y="108" text-anchor="middle" class="svg-ink" font-size="13">LAN</text><text x="60" y="126" text-anchor="middle" class="svg-muted" font-size="12">10.1.10.0/24</text>
<rect x="135" y="80" width="105" height="60" rx="8" fill="#bae6fd"/><text x="187" y="106" text-anchor="middle" class="svg-ink" font-size="13">1 Classify</text><text x="187" y="124" text-anchor="middle" class="svg-muted" font-size="12">ACL / policy</text>
<rect x="265" y="30" width="105" height="160" rx="8" fill="#ddd6fe"/><text x="317" y="52" text-anchor="middle" class="svg-ink" font-size="13">2 Queues</text>
<rect x="278" y="62" width="79" height="20" rx="4" fill="#fde68a"/><text x="317" y="77" text-anchor="middle" class="svg-ink" font-size="11">Q0 voice LLQ</text>
<rect x="278" y="90" width="79" height="20" rx="4" fill="#fed7aa"/><text x="317" y="105" text-anchor="middle" class="svg-ink" font-size="11">Q1 video</text>
<rect x="278" y="118" width="79" height="20" rx="4" fill="#fed7aa"/><text x="317" y="133" text-anchor="middle" class="svg-ink" font-size="11">Q2 default</text>
<rect x="278" y="146" width="79" height="20" rx="4" fill="#e2e8f0"/><text x="317" y="161" text-anchor="middle" class="svg-ink" font-size="11">Q3 bulk</text>
<rect x="395" y="80" width="105" height="60" rx="8" fill="#bae6fd"/><text x="447" y="106" text-anchor="middle" class="svg-ink" font-size="13">3 Shape</text><text x="447" y="124" text-anchor="middle" class="svg-muted" font-size="12">20 Mbps</text>
<rect x="525" y="80" width="105" height="60" rx="8" fill="#fde68a"/><text x="577" y="106" text-anchor="middle" class="svg-ink" font-size="13">WAN</text><text x="577" y="124" text-anchor="middle" class="svg-muted" font-size="12">INET / MPLS</text>
<line x1="110" y1="110" x2="135" y2="110" stroke="#64748b" stroke-width="2"/><line x1="240" y1="110" x2="265" y2="110" stroke="#64748b" stroke-width="2"/><line x1="370" y1="110" x2="395" y2="110" stroke="#64748b" stroke-width="2"/><line x1="500" y1="110" x2="525" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="320" y="216" text-anchor="middle" class="svg-accent" font-size="12">Mark, queue, shape: edge par QoS ke teen kaam</text>
</svg><p class="cap">LAN se aaye packets classify hote hain, queue mein jaate hain, aur shaper unhe circuit ki speed par chhodta hai.</p></div>

<h3>Paanch ideas ek table mein</h3>
<table class="cmp"><tr><th>Idea</th><th>Kaunsa sawaal solve karta hai</th><th>Kahan milega</th></tr>
<tr><td>Classification aur marking</td><td>Yeh kis tarah ka traffic hai?</td><td>Chapter 2</td></tr>
<tr><td>Queuing aur scheduling</td><td>Link busy ho to pehle kise bheja jaaye?</td><td>Chapter 3 aur 4</td></tr>
<tr><td>Shaping aur policing</td><td>Hum kitni tezi se bhej sakte hain, aur class rate cross kare to kya?</td><td>Chapter 5</td></tr>
<tr><td>Per-tunnel QoS</td><td>Hub par har spoke ko dusron se kaise bachayein?</td><td>Chapter 6</td></tr>
<tr><td>End-to-end behaviour</td><td>Kya marking overlay aur provider se bachti hai?</td><td>Chapter 7</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Bengaluru ki branch E-BLR-1 ke paas ek 20 Mbps broadband (biz-internet colour) hai. Month-end close mein 40 users reports upload karte hain, 12 log voice calls par hain aur 3 meeting rooms video chalate hain. Har G.711 call IPsec overhead jodne ke baad wire par lagbhag 110 kbps leti hai (chapter 7 mein theek se calculate karenge), to 12 calls ko lagbhag 1.3 Mbps chahiye. Agar uploads 20 Mbps circuit bhar dein, router queue badhti hai, delay 20 ms se 200 ms ke upar chala jaata hai aur voice toot jaati hai. QoS ke saath voice priority queue mein jaati hai aur pehle bheji jaati hai, aur uploads bas thoda zyada samay lete hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Yeh maan lena ki QoS bandwidth banata hai. Yeh sirf tay karta hai ki link full hone par kaun intezaar kare aur kise drop kiya jaaye. Agar circuit hamesha chhota hai to QoS dard kam karta hai, lekin sirf zyada bandwidth hi hal hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Catalyst SD-WAN mein QoS <b>localized policy</b> aur classify karne wale ACL ya centralized data policy se configure hota hai. Yeh control policy nahi hai aur OMP routes nahi badalta.</p></div>

<div class="scn"><h4>Har Friday 5 baje voice toot-ti hai</h4><p>Bharat Retail ki Delhi branch ne report kiya ki har Friday shaam calls choppy hoti hain. Monitoring dashboard ne dikhaya ki biz-internet link 30 minute tak 100 percent par tha jab backup job chal raha tha. Application-aware routing policy ne voice ko biz-internet par hi rakha kyunki MPLS circuit maintenance mein down tha. Engineer ne ek QoS map joda jisme voice priority queue mein aur backup bulk queue mein gaya, aur interface ko asli circuit speed par shape kiya. Agle Friday backup dheere chala lekin calls saaf rahin.</p><p><b>Lesson:</b> jab sirf ek path ho to path selection madad nahi kar sakta; queue priority kar sakti hai.</p></div>

<div class="iv"><p class="q">"SD-WAN mein application-aware routing aur QoS mein kya fark hai?"</p><p>AAR measured loss, latency aur jitter se har application ke liye transport (tunnel) chunta hai. QoS ek hi interface par kaam karta hai aur tay karta hai ki packets kis order mein niklenge: classification, queues, scheduling aur shaping. AAR centralized policy hai; QoS edge par localized policy hai. Dono ek dusre ke poorak hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>QoS tay karta hai link full hone par kaun intezaar kare ya drop ho; yeh bandwidth nahi badhata.</li>
<li>WAN edge teen kaam karta hai: classify aur mark, queue aur schedule, phir shape.</li>
<li>AAR path chunta hai; QoS chune hue path par packets ko order deta hai.</li>
<li>QoS ek localized policy hai, jo templates se edge par lagti hai.</li>
<li>Voice ko low delay, jitter aur loss chahiye, isliye woh priority queue mein jaati hai.</li>
</ul></div>
`}};export{e as default};