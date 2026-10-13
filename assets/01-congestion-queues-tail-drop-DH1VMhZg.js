var e={id:`congestion`,h:{en:`Overview: congestion, queues and tail drop`,hi:`Overview: congestion, queues aur tail drop`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn what a router does when more packets arrive than a link can send. You will build the three queuing tools that every modern network uses: <b>CBWFQ</b> (guaranteed bandwidth per class), <b>LLQ</b> (a strict-priority queue for voice) and <b>WRED</b> (dropping a few packets early so that TCP slows down gently). You will configure them on an IOS XE style router, load a congested link with test traffic, read <code>show policy-map interface</code> like a support engineer, and troubleshoot the three classic faults: voice dropping under load, a class that gets nothing, and a policy that refuses to attach.</p>
<p><b>Prerequisites.</b> You should know what an IP packet, an interface and a routing table are, and you should have finished the previous module on classification and marking (what DSCP is, what EF and AF21 mean, and what a class-map does). Here we assume the packets are already marked correctly and we decide what the router does with them.</p>

<h3>Start with an analogy: the toll booth</h3>
<p>Picture a six-lane highway that narrows to a single toll booth. On a quiet night every car passes without stopping. At 6 pm, hundreds of cars arrive together and the booth can only serve one car every few seconds. A line of cars forms. If the line grows longer than the space you built for it, the last cars are turned away. Nothing is wrong with the road or the booth: the problem is only that cars arrive faster than they can leave.</p>
<p>A router interface is the toll booth. The line of cars is a <b>queue</b>. Turning cars away is a <b>drop</b>. And an ambulance (a voice packet) needs a special lane so that it does not wait in the same line as a heavy lorry (a backup transfer). That special lane is exactly what this module teaches you to build.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Fast LAN feeding a slow WAN through one queue">
<rect x="10" y="50" width="150" height="90" rx="10" fill="#bbf7d0"/><text x="85" y="85" text-anchor="middle" class="svg-ink" font-size="14">Pune campus LAN</text><text x="85" y="107" text-anchor="middle" class="svg-muted" font-size="12">1 Gbps, many hosts</text>
<path d="M160 95 H235" stroke="#64748b" stroke-width="6" fill="none"/>
<rect x="235" y="40" width="190" height="110" rx="10" fill="#bae6fd"/><text x="330" y="62" text-anchor="middle" class="svg-ink" font-size="14">R1 egress queue</text>
<rect x="250" y="80" width="22" height="40" fill="#fde68a"/><rect x="276" y="80" width="22" height="40" fill="#fde68a"/><rect x="302" y="80" width="22" height="40" fill="#fde68a"/><rect x="328" y="80" width="22" height="40" fill="#fed7aa"/><rect x="354" y="80" width="22" height="40" fill="#fed7aa"/><rect x="380" y="80" width="22" height="40" fill="#fecaca"/>
<text x="330" y="140" text-anchor="middle" class="svg-muted" font-size="12">packets wait here</text>
<path d="M425 95 H470" stroke="#64748b" stroke-width="2" fill="none"/>
<rect x="470" y="50" width="160" height="90" rx="10" fill="#ddd6fe"/><text x="550" y="85" text-anchor="middle" class="svg-ink" font-size="14">WAN to Mumbai</text><text x="550" y="107" text-anchor="middle" class="svg-muted" font-size="12">10 Mbps circuit</text>
<text x="320" y="178" text-anchor="middle" class="svg-accent" font-size="12">100 times faster in than out: the queue fills, then packets are dropped</text>
</svg><p class="cap">The queue lives on the egress of the slow link. Nothing queues on the way in.</p></div>

<h3>What congestion is, and why it happens</h3>
<p><b>Congestion</b> means that at this moment more traffic wants to leave an interface than the interface can carry. Three everyday causes:</p>
<ul>
<li><b>Speed mismatch.</b> A 1 Gbps LAN port feeds a 10 Mbps WAN circuit. One host sending at full speed is already 100 times too fast.</li>
<li><b>Aggregation.</b> Fifty hosts, each sending only 1 Mbps, still add up to 50 Mbps towards a single 10 Mbps uplink.</li>
<li><b>Bursts.</b> Even an average load of 40 percent can overflow for a few milliseconds when many packets arrive together.</li>
</ul>
<p>Congestion is normal, not a fault. It happens on every network somewhere, usually for seconds at a time. QoS decides how gracefully the network behaves when it happens.</p>

<h3>The queue, the buffer and the tail drop</h3>
<p>When a packet cannot be sent immediately, the router stores it in memory, in a <b>queue</b> (also called a buffer). Packets leave in the order they arrived, first in, first out, at the speed of the link. The memory is limited. When the queue is full, the next arriving packet has nowhere to go and is discarded. Because the newest packet at the <b>tail</b> of the line is the one thrown away, this is called <b>tail drop</b>.</p>
<p>A queue has two bad effects, and you must keep both in mind:</p>
<ul>
<li><b>Delay.</b> Every packet waits for those ahead of it. The wait is the queue size divided by the link speed.</li>
<li><b>Loss.</b> When the queue is full, packets vanish. Voice and video cannot retransmit them in time, so the listener hears gaps.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> R1 holds up to 64 packets of 1500 bytes in the queue of the 10 Mbps WAN. That is 64 x 1500 = 96,000 bytes = 768,000 bits. At 10,000,000 bits per second the last packet waits 768,000 / 10,000,000 = 0.0768 s, about <b>77 ms</b>. Add a typical 20 ms propagation to Mumbai and the one-way delay is near 100 ms, still acceptable for voice (the usual target is under 150 ms one way). But if a voice packet sits behind a full queue of backup traffic, it also faces the same tail drop as the backup packets when the queue overflows, and 1 percent loss is already audible. FIFO gives voice and backup exactly the same fate.</p></div>

<h3>Where queuing happens: only on the output side</h3>
<p>Packets queue where they <b>wait for a link</b>, which is the <b>output</b> of the slow interface. That is why in this module every queuing policy is attached with <code>service-policy output</code>. If you try to attach a queuing policy in the input direction, IOS XE refuses it. Classification and marking, which you learnt in the previous module, usually happen on input; queuing and dropping happen on output.</p>
<p>Another point beginners miss: queuing policies do nothing while the link is not busy. If the link has room, every packet leaves at once and no class is limited. A bandwidth guarantee is therefore a promise made <b>during congestion only</b>.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Believing that QoS creates bandwidth. It does not. A 10 Mbps circuit stays a 10 Mbps circuit. QoS only decides who goes first, who gets a guaranteed share, and who is dropped when the circuit is full. If the sum of important traffic is more than the circuit, the real fix is more bandwidth.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which direction do you apply a queuing policy?" Output. "Which congestion symptom does tail drop cause besides loss?" Delay variation (jitter) and, in TCP, global synchronisation, which Chapter 5 explains.</p></div>

<h3>A map of the module</h3>
<table class="cmp"><tr><th>Chapter</th><th>Question it answers</th></tr>
<tr><td>2</td><td>How did queuing evolve: FIFO, PQ, WFQ, CBWFQ, LLQ?</td></tr>
<tr><td>3</td><td>How do I guarantee bandwidth to a class (CBWFQ)?</td></tr>
<tr><td>4</td><td>How do I protect voice (LLQ) without starving others?</td></tr>
<tr><td>5</td><td>How do I stop TCP from collapsing all at once (WRED)?</td></tr>
<tr><td>6</td><td>How many classes, how much bandwidth, how big a queue?</td></tr>
<tr><td>7-8</td><td>How do I verify and troubleshoot it?</td></tr>
</table>

<div class="scn"><h4>The evening the ERP stopped</h4><p>Sahyadri University connects its Pune campus to the Mumbai data centre over a 10 Mbps circuit. Every night at 20:00 an automatic backup starts and the finance ERP, which students and staff use for fee payments, begins to time out. The network team first suspected the ERP server. A look at the WAN interface showed 100 percent output load and thousands of output drops, all in one single queue. Nothing was broken: backup traffic and ERP traffic were sharing a plain FIFO queue, and the backup, being much bigger, filled it. The fix was not new bandwidth. It was to give the ERP its own class with a guaranteed share, which is exactly the first lab of this module.</p><p><b>Lesson:</b> when everything shares one queue, the loudest sender wins. QoS gives each kind of traffic its own queue and rules.</p></div>

<div class="iv"><p class="q">"What is congestion, and where do queues form in a router?"</p><p>A strong answer: congestion is when offered traffic exceeds the interface rate, typically because of a speed mismatch or aggregation. Packets are buffered in the egress queue of the slower interface; when the buffer is full the router tail-drops. Mention both delay and loss, and say that queuing policies are applied outbound and only matter during congestion.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Congestion means offered traffic is higher than the link rate; it is normal and short-lived.</li>
<li>A queue buffers packets and adds delay equal to queue size divided by link speed; a full queue tail-drops.</li>
<li>Queues form on the output of the slow interface, so queuing policies use service-policy output.</li>
<li>QoS never adds bandwidth; it chooses who waits, who is guaranteed and who is dropped.</li>
<li>Guarantees only matter while the link is congested.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki jab link bhej sakne se zyada packets aate hain to router kya karta hai. Aap woh teen queuing tools banaoge jo har modern network use karta hai: <b>CBWFQ</b> (har class ke liye guaranteed bandwidth), <b>LLQ</b> (voice ke liye strict-priority queue) aur <b>WRED</b> (kuch packets pehle hi drop karna taaki TCP narmi se dheema ho). Aap inhe IOS XE style router par configure karoge, test traffic se congested link load karoge, <code>show policy-map interface</code> ko support engineer ki tarah padhoge, aur teen classic faults troubleshoot karoge: load mein voice drop hona, ek class ko kuch na milna, aur policy ka attach hone se mana karna.</p>
<p><b>Prerequisites.</b> Aapko pata hona chahiye ki IP packet, interface aur routing table kya hote hain, aur pichhla module (classification aur marking) complete hona chahiye: DSCP kya hai, EF aur AF21 ka matlab, aur class-map kya karta hai. Yahan hum maan lete hain ki packets pehle se sahi mark ho chuke hain, aur hum tay karte hain ki router unke saath kya karega.</p>

<h3>Analogy se shuru karo: toll booth</h3>
<p>Ek chhe-lane highway sochiye jo ek akele toll booth par sankri ho jaati hai. Shaant raat mein har gaadi bina ruke nikal jaati hai. Shaam 6 baje saikdon gaadiyan ek saath aati hain aur booth har kuch second mein sirf ek gaadi nikaal sakta hai. Gaadiyon ki line ban jaati hai. Agar line us jagah se lambi ho jaaye jo aapne uske liye banayi thi, to aakhri gaadiyan wapas bhej di jaati hain. Road ya booth mein koi kharabi nahi hai: dikkat sirf yeh hai ki gaadiyan nikalne se tez aa rahi hain.</p>
<p>Router interface toll booth hai. Gaadiyon ki line <b>queue</b> hai. Gaadiyon ko wapas bhejna <b>drop</b> hai. Aur ambulance (voice packet) ko alag lane chahiye taaki woh bhaari lorry (backup transfer) ki line mein na ruke. Wahi alag lane banana yeh module sikhata hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Fast LAN feeding a slow WAN through one queue">
<rect x="10" y="50" width="150" height="90" rx="10" fill="#bbf7d0"/><text x="85" y="85" text-anchor="middle" class="svg-ink" font-size="14">Pune campus LAN</text><text x="85" y="107" text-anchor="middle" class="svg-muted" font-size="12">1 Gbps, kai hosts</text>
<path d="M160 95 H235" stroke="#64748b" stroke-width="6" fill="none"/>
<rect x="235" y="40" width="190" height="110" rx="10" fill="#bae6fd"/><text x="330" y="62" text-anchor="middle" class="svg-ink" font-size="14">R1 egress queue</text>
<rect x="250" y="80" width="22" height="40" fill="#fde68a"/><rect x="276" y="80" width="22" height="40" fill="#fde68a"/><rect x="302" y="80" width="22" height="40" fill="#fde68a"/><rect x="328" y="80" width="22" height="40" fill="#fed7aa"/><rect x="354" y="80" width="22" height="40" fill="#fed7aa"/><rect x="380" y="80" width="22" height="40" fill="#fecaca"/>
<text x="330" y="140" text-anchor="middle" class="svg-muted" font-size="12">packets yahan intezaar karte hain</text>
<path d="M425 95 H470" stroke="#64748b" stroke-width="2" fill="none"/>
<rect x="470" y="50" width="160" height="90" rx="10" fill="#ddd6fe"/><text x="550" y="85" text-anchor="middle" class="svg-ink" font-size="14">WAN to Mumbai</text><text x="550" y="107" text-anchor="middle" class="svg-muted" font-size="12">10 Mbps circuit</text>
<text x="320" y="178" text-anchor="middle" class="svg-accent" font-size="12">Andar 100 guna tez, bahar dheema: queue bharti hai, phir packets drop hote hain</text>
</svg><p class="cap">Queue slow link ke egress par rehti hai. Andar aate waqt kuch queue nahi hota.</p></div>

<h3>Congestion kya hai, aur kyun hota hai</h3>
<p><b>Congestion</b> ka matlab hai ki is pal interface se jitna traffic nikalna chahta hai, interface utna le jaa nahi sakta. Teen rozmarra wajah:</p>
<ul>
<li><b>Speed mismatch.</b> 1 Gbps LAN port 10 Mbps WAN circuit ko feed karta hai. Ek hi host poori speed se bheje to woh pehle se 100 guna tez hai.</li>
<li><b>Aggregation.</b> Pachas hosts, har ek sirf 1 Mbps bheje, phir bhi ek 10 Mbps uplink ki taraf 50 Mbps ban jaata hai.</li>
<li><b>Bursts.</b> Average load 40 percent ho tab bhi kuch milliseconds ke liye overflow ho sakta hai jab kai packets ek saath aate hain.</li>
</ul>
<p>Congestion normal hai, fault nahi. Yeh har network mein kahin na kahin hota hai, aam taur par kuch seconds ke liye. QoS tay karta hai ki jab yeh hota hai to network kitni sabhyata se behave kare.</p>

<h3>Queue, buffer aur tail drop</h3>
<p>Jab packet turant bheja nahi ja sakta, router use memory mein, <b>queue</b> (buffer bhi kehte hain) mein rakh leta hai. Packets usi order mein nikalte hain jis order mein aaye, first in first out, link ki speed se. Memory limited hoti hai. Queue bhar jaaye to agle aane wale packet ke paas jaane ki jagah nahi hoti aur woh discard ho jaata hai. Line ki <b>poonchh (tail)</b> par jo sabse naya packet hota hai wahi phenka jaata hai, isliye ise <b>tail drop</b> kehte hain.</p>
<p>Queue ke do bure asar hote hain, dono yaad rakhna:</p>
<ul>
<li><b>Delay.</b> Har packet apne aage walon ka intezaar karta hai. Intezaar = queue size divided by link speed.</li>
<li><b>Loss.</b> Queue bhar jaaye to packets gayab ho jaate hain. Voice aur video unhe time par retransmit nahi kar sakte, isliye sunne wale ko beech mein gaps sunai dete hain.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> R1 10 Mbps WAN ki queue mein 1500 byte ke 64 packets tak rakhta hai. Yeh 64 x 1500 = 96,000 bytes = 768,000 bits hai. 10,000,000 bits per second par aakhri packet 768,000 / 10,000,000 = 0.0768 s, lagbhag <b>77 ms</b> intezaar karta hai. Mumbai tak ke aam 20 ms propagation ko jodo to one-way delay lagbhag 100 ms hai, jo voice ke liye abhi bhi theek hai (aam target one way 150 ms se kam). Lekin agar voice packet backup traffic ki bhari queue ke peeche baithe, to queue overflow hone par usi tail drop ka shikaar hota hai jis ka backup packets hote hain, aur 1 percent loss bhi sunai deta hai. FIFO voice aur backup ko bilkul ek jaisa anjaam deta hai.</p></div>

<h3>Queuing kahan hoti hai: sirf output side par</h3>
<p>Packets wahan queue hote hain jahan woh <b>link ka intezaar</b> karte hain, yaani slow interface ka <b>output</b>. Isliye is module mein har queuing policy <code>service-policy output</code> se lagayi jaati hai. Agar aap queuing policy input direction mein lagane ki koshish karo, to IOS XE use mana kar deta hai. Classification aur marking, jo aapne pichhle module mein seekhi, aam taur par input par hoti hain; queuing aur dropping output par.</p>
<p>Ek aur baat jo beginners chhod dete hain: link busy na ho to queuing policy kuch nahi karti. Link mein jagah ho to har packet turant nikal jaata hai aur kisi class ko limit nahi hota. Isliye bandwidth guarantee sirf <b>congestion ke dauran</b> ka vaada hai.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Yeh maan lena ki QoS bandwidth banata hai. Nahi banata. 10 Mbps circuit 10 Mbps hi rehta hai. QoS sirf tay karta hai ki circuit bhar jaane par kaun pehle jaaye, kise guaranteed hissa mile aur kise drop kiya jaaye. Agar zaroori traffic ka jod circuit se zyada hai, to asli ilaaj zyada bandwidth hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Queuing policy kis direction mein lagate hain?" Output. "Tail drop loss ke alawa kaun sa congestion symptom deta hai?" Delay variation (jitter) aur TCP mein global synchronisation, jo Chapter 5 samjhata hai.</p></div>

<h3>Module ka naksha</h3>
<table class="cmp"><tr><th>Chapter</th><th>Yeh kis sawal ka jawab deta hai</th></tr>
<tr><td>2</td><td>Queuing kaise evolve hui: FIFO, PQ, WFQ, CBWFQ, LLQ?</td></tr>
<tr><td>3</td><td>Class ko bandwidth guarantee kaise dun (CBWFQ)?</td></tr>
<tr><td>4</td><td>Voice ko bachaun to baaki ko starve na karun, kaise (LLQ)?</td></tr>
<tr><td>5</td><td>TCP ko ek saath collapse hone se kaise rokun (WRED)?</td></tr>
<tr><td>6</td><td>Kitni classes, kitni bandwidth, kitni badi queue?</td></tr>
<tr><td>7-8</td><td>Ise verify aur troubleshoot kaise karun?</td></tr>
</table>

<div class="scn"><h4>Woh shaam jab ERP ruk gaya</h4><p>Sahyadri University apne Pune campus ko Mumbai data centre se 10 Mbps circuit se jodta hai. Har raat 20:00 baje automatic backup shuru hota hai aur finance ERP, jise students aur staff fee payment ke liye use karte hain, time out hone lagta hai. Network team ne pehle ERP server par shak kiya. WAN interface dekha to output load 100 percent tha aur hazaaron output drops the, sab ek hi queue mein. Kuch tuta nahi tha: backup traffic aur ERP traffic plain FIFO queue share kar rahe the, aur backup, jo bahut bada tha, use bhar deta tha. Fix nayi bandwidth nahi thi. Fix thi ERP ko apni class dena, guaranteed hisse ke saath, jo is module ki pehli lab hai.</p><p><b>Lesson:</b> jab sab ek hi queue share karte hain, sabse zor se bhejne wala jeet-ta hai. QoS har tarah ke traffic ko apni queue aur apne niyam deta hai.</p></div>

<div class="iv"><p class="q">"Congestion kya hai, aur router mein queues kahan banti hain?"</p><p>Strong answer: congestion tab hai jab offered traffic interface rate se zyada ho, aam taur par speed mismatch ya aggregation se. Packets slow interface ki egress queue mein buffer hote hain; buffer bhar jaaye to router tail-drop karta hai. Delay aur loss dono ka zikr karo, aur bolo ki queuing policies outbound lagti hain aur sirf congestion mein matter karti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Congestion ka matlab offered traffic link rate se zyada hai; yeh normal aur short-lived hai.</li>
<li>Queue packets buffer karti hai aur delay jodti hai jo queue size divided by link speed hota hai; full queue tail-drop karti hai.</li>
<li>Queues slow interface ke output par banti hain, isliye queuing policies service-policy output use karti hain.</li>
<li>QoS kabhi bandwidth nahi jodta; yeh chunta hai kaun wait kare, kise guarantee mile aur kise drop kiya jaaye.</li>
<li>Guarantees sirf tab matter karti hain jab link congested ho.</li>
</ul></div>
`}};export{e as default};