var e={id:`queuing`,h:{en:`Congestion management and queuing: FIFO, WFQ, CBWFQ, LLQ, tail drop and WRED`,hi:`Congestion management aur queuing: FIFO, WFQ, CBWFQ, LLQ, tail drop aur WRED`},body:{en:`
<p>Picture a petrol pump on a festival weekend. With one nozzle and one lane, every car waits its turn, even the ambulance. Now add rules: a separate lane for emergency vehicles, a guaranteed slot for the delivery vans of the local dairy, and a shared lane for everyone else, where each car gets a fair turn. That is queuing. When a router's output interface cannot send packets as fast as they arrive, it must keep them somewhere (the queue) and decide which one leaves next (the <b>scheduler</b>). Congestion management is the choice of queue structure and scheduling rule.</p>

<h3>Where queuing happens</h3>
<p>Queues only matter when there is congestion, and congestion lives on the <b>output</b> side of an interface. Every interface has a small hardware transmit ring, and in front of it the software queues that your policy builds. Packets are put into queues by class, and the scheduler picks from the queues. On a router, queuing actions (<code>priority</code>, <code>bandwidth</code>, <code>fair-queue</code>, <code>shape</code>) are accepted only in the <b>output</b> direction.</p>

<h3>The queuing disciplines</h3>
<dl class="terms">
<dt>FIFO (first in, first out)</dt><dd>One queue. No classes, no priorities. It is the default on fast interfaces and it is the "no QoS" case: a bulk burst can sit in front of a voice packet.</dd>
<dt>Priority Queuing (legacy)</dt><dd>Strict order: always empty the high queue first. Voice is perfect, but a heavy high queue starves everything below it.</dd>
<dt>Weighted Fair Queuing (WFQ)</dt><dd>The router automatically separates traffic into <b>flows</b> (by addresses, ports and protocol) and gives each flow a fair share of bandwidth, with extra weight for higher IP Precedence. A small interactive flow is not buried by a big download. No configuration, but no hard guarantees and it does not scale to high speeds. In MQC you will meet it as <code>fair-queue</code> inside class-default.</dd>
<dt>Class-Based WFQ (CBWFQ)</dt><dd>You define the classes and give each a <b>minimum guaranteed bandwidth</b> with <code>bandwidth</code> (kbps, percent, or remaining percent). During congestion each class is served at least at its rate; if a class is idle, others may borrow the unused share. It guarantees bandwidth but not low delay.</dd>
<dt>Low Latency Queuing (LLQ)</dt><dd>CBWFQ plus one or more <b>strict-priority queues</b>, configured with <code>priority</code>. Packets in the priority queue are sent before anything else, which gives voice the low delay and jitter it needs. LLQ is the standard design for voice and the one the exam expects you to know.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 660 250" role="img" aria-label="LLQ scheduler">
<rect x="10" y="20" width="110" height="34" fill="#bbf7d0"/><text x="65" y="42" text-anchor="middle" class="svg-ink" font-size="12">EF: priority 1000</text>
<rect x="10" y="70" width="110" height="34" fill="#bae6fd"/><text x="65" y="92" text-anchor="middle" class="svg-ink" font-size="12">AF11: bw 2000</text>
<rect x="10" y="120" width="110" height="34" fill="#bae6fd"/><text x="65" y="142" text-anchor="middle" class="svg-ink" font-size="12">AF21: bw 1000</text>
<rect x="10" y="170" width="110" height="34" fill="#e2e8f0"/><text x="65" y="192" text-anchor="middle" class="svg-ink" font-size="12">class-default</text>
<path d="M120 37 H300 M120 87 H260 M120 137 H260 M120 187 H260" stroke="#64748b" stroke-width="2" fill="none"/>
<rect x="260" y="70" width="110" height="134" rx="6" fill="#ddd6fe"/><text x="315" y="130" text-anchor="middle" class="svg-ink" font-size="12">CBWFQ</text><text x="315" y="148" text-anchor="middle" class="svg-ink" font-size="12">scheduler</text>
<rect x="300" y="20" width="110" height="34" rx="6" fill="#fde68a"/><text x="355" y="42" text-anchor="middle" class="svg-ink" font-size="12">Priority first</text>
<path d="M410 37 H470 V120 H440 M370 137 H440" stroke="#64748b" stroke-width="2" fill="none"/>
<rect x="440" y="100" width="100" height="60" rx="6" fill="#bbf7d0"/><text x="490" y="128" text-anchor="middle" class="svg-ink" font-size="12">TX ring</text><text x="490" y="146" text-anchor="middle" class="svg-muted" font-size="11">10 Mbps wire</text>
<path d="M540 130 H620" stroke="#64748b" stroke-width="3" fill="none"/>
<text x="330" y="232" text-anchor="middle" class="svg-accent" font-size="12">The priority queue is policed to its rate while the link is congested, so it cannot starve the rest.</text>
</svg><p class="cap">LLQ: one strict-priority queue plus CBWFQ classes with guaranteed shares.</p></div>

<h3>The starvation guard</h3>
<p>A pure priority queue is dangerous: if too much traffic arrives marked EF, the other queues never get a turn. LLQ fixes this by <b>policing the priority queue to the configured rate during congestion</b>. If you write <code>priority 1000</code> (1000 kbps) the voice class is served first up to 1 Mbps; anything beyond is dropped when the link is busy. When the link is not congested, the class may exceed its rate because nothing else is waiting. This is why you size the priority rate to the real number of calls, and why you should not put video or bulk data into it. A common design rule is to keep the priority queue at no more than about one third of the link.</p>

<h3>What LLQ looks like on the simulator</h3>
<p>The WAN policy gives EF a 500 kbps priority queue, and class-default uses <code>fair-queue</code>. The phone sends 900 kbps of EF voice (more than 500, to show the guard) while PC-DATA floods 12 Mbps of UDP into the 10 Mbps link.</p>
<pre class="code">R1(config)# class-map match-any EF-Q
R1(config-cmap)# match dscp ef
R1(config)# policy-map WAN-OUT
R1(config-pmap)# class EF-Q
R1(config-pmap-c)# priority 500
R1(config-pmap)# class class-default
R1(config-pmap-c)# fair-queue
R1(config)# interface GigabitEthernet0/0
R1(config-if)# service-policy output WAN-OUT
PHONE> traffic 10.20.0.100 udp/20000 900 20 dscp ef
PC-DATA> traffic 10.20.0.100 udp/5001 12000 20
R1# show policy-map interface GigabitEthernet0/0 output | include Class-map|Priority|packets|drops</pre>
<pre class="out">    Class-map: EF-Q (match-any)  
      11260 packets, 2252000 bytes
        11260 packets, 2252000 bytes
      Priority: 500 kbps, burst bytes 12500, b/w exceed drops: 1757
      queue limit 512 packets
      (queue depth/total drops/no-buffer drops) 0/1757/0
    Class-map: class-default (match-any)  
      150000 packets, 30000000 bytes
      queue limit 64 packets
      (queue depth/total drops/no-buffer drops) 0/27817/0
      Fair-queue: per-flow queue limit 16 packets</pre>
<p>Read the EF-Q block. <code>Priority: 500 kbps</code> is the guard. <code>b/w exceed drops: 1757</code> is the number of EF packets discarded because the call offered more than its 500 kbps while the link was congested. The other column, <code>(queue depth/total drops/no-buffer drops) 0/1757/0</code>, shows the queue is empty (depth 0): priority traffic does not wait. The bulk class-default dropped 27,817 packets, as expected. The test flow on the phone confirms it: 11,260 packets sent, 9,510 delivered, 15.5% loss. The fix is not to remove the guard but to size it to the real traffic, or to correct the offender.</p>

<h3>Tail drop, global synchronisation and WRED</h3>
<p>What does a queue do when it is full? By default it uses <b>tail drop</b>: new packets are discarded until space appears. This is simple but unfair: many TCP flows lose packets at the same moment, all cut their speed in half together, the link underuses, then they all speed up together and overflow again. This wave is called <b>global TCP synchronisation</b>.</p>
<p><b>Random Early Detection (RED)</b> avoids it by starting to drop a few packets <i>before</i> the queue is full. <b>Weighted RED (WRED)</b> does so using the marking: it keeps a minimum threshold, a maximum threshold and a drop probability for each DSCP or precedence, so that AFx3 packets start to be dropped earlier and harder than AFx1 packets. Dropping randomly desynchronises the flows and TCP senders ease off gradually. WRED helps TCP traffic only; do not use it on voice (UDP does not slow down when packets are lost). At CCNA level, know the concept: tail drop versus early random drop by DSCP. You enable it in a class with <code>random-detect</code>.</p>

<div class="eg"><p><b>Worked example.</b> A 10 Mbps WAN carries 20 G.711 calls (about 1.75 Mbps), several video calls and bulk backups. Design: EF gets <code>priority 2000</code> (a little above 20 calls at 87 kbps each), AF41 video gets <code>bandwidth 3000</code>, AF21 transactional <code>bandwidth 1500</code>, class-default <code>fair-queue</code>. The sum of reservations is 6,500 kbps, which is 65% of 10,000 kbps, leaving a margin. At quiet times everything flows. At 9 AM when backups start, the 1.75 Mbps of voice always passes first, video and transactional classes are guaranteed at least their share, and the backup takes the leftover and absorbs the drops.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Putting everything important into the priority class: the more you add, the less each is protected, and a 33% rule is broken. Combining <code>priority</code> and <code>bandwidth</code> in the same class (the simulator refuses it: "Remove the bandwidth command from this class before configuring priority"). Using WRED on voice. Believing CBWFQ gives low delay: it gives bandwidth; delay-sensitive traffic needs the priority queue.</p></div>

<div class="exam"><p><b>Exam traps.</b> LLQ = CBWFQ + strict priority queue; used for voice. The priority queue is policed during congestion to prevent starvation. CBWFQ guarantees bandwidth, LLQ guarantees bandwidth and low delay. Tail drop is the default; WRED drops early based on DSCP or precedence to avoid global TCP synchronisation. Queuing is output only. FIFO is the default on most interfaces.</p></div>

<div class="scn"><h4>The priority queue that ate the WAN</h4><p>A support team configured <code>priority percent 70</code> for voice "to be safe" on a 4 Mbps branch link. Voice itself used 600 kbps, so the rest of the 2.8 Mbps stayed idle most of the day and only became a problem when a video client marked EF by mistake: it filled the priority queue, and ERP traffic in the other classes was starved to the little left over. Reducing the priority to 25% and re-marking the video as AF41 restored balance.</p><p><b>Lesson:</b> size the priority class from real calls, and police what enters it.</p></div>

<div class="iv"><p class="q">"What is LLQ and why does it have a policer?"</p><p>LLQ is CBWFQ with a strict-priority queue for delay-sensitive traffic such as voice. Voice is always sent first, giving low latency and jitter. The priority queue is limited to its configured rate during congestion because otherwise a heavy EF flow would starve every other class. Add that outside congestion the class can use spare bandwidth.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Queues form on the output side of a congested interface; the scheduler picks the next packet.</li>
<li>FIFO has no classes. WFQ shares fairly per flow. CBWFQ guarantees minimum bandwidth per class. LLQ adds a strict priority queue for voice.</li>
<li>The priority queue is policed during congestion, the starvation guard; excess EF is dropped.</li>
<li>Tail drop causes global TCP synchronisation; WRED drops early and by DSCP, for TCP traffic only.</li>
<li>Keep the priority class to about one third of the link and only for voice.</li>
</ul></div>
`,hi:`
<p>Tyohaar ke weekend par petrol pump socho. Ek nozzle aur ek lane ho to har gaadi apni baari ka intezaar karti hai, ambulance bhi. Ab rules jodo: emergency vehicles ke liye alag lane, local dairy ki delivery vans ke liye guaranteed slot, aur baaki sab ke liye shared lane jahan har gaadi ko fair baari milti hai. Yahi queuing hai. Jab router ka output interface packets ko utni tez nahi bhej sakta jitni tez woh aate hain, to use unhe kahin rakhna padta hai (queue) aur tay karna padta hai ki agla kaun jaaye (<b>scheduler</b>). Congestion management queue structure aur scheduling rule ka chunaav hai.</p>

<h3>Queuing kahan hoti hai</h3>
<p>Queues tab matter karti hain jab congestion ho, aur congestion interface ke <b>output</b> side par rehta hai. Har interface mein chhota hardware transmit ring hota hai, aur uske aage woh software queues jo aapki policy banati hai. Packets class ke hisaab se queues mein jaate hain, aur scheduler queues mein se chunta hai. Router par queuing actions (<code>priority</code>, <code>bandwidth</code>, <code>fair-queue</code>, <code>shape</code>) sirf <b>output</b> direction mein accept hote hain.</p>

<h3>Queuing disciplines</h3>
<dl class="terms">
<dt>FIFO (first in, first out)</dt><dd>Ek queue. Na classes, na priorities. Fast interfaces par default hai aur yahi "no QoS" case hai: bulk burst voice packet ke aage baith sakta hai.</dd>
<dt>Priority Queuing (legacy)</dt><dd>Strict order: hamesha high queue pehle khali karo. Voice ke liye perfect, lekin bhaari high queue apne neeche ki sab ko bhookha rakhti hai.</dd>
<dt>Weighted Fair Queuing (WFQ)</dt><dd>Router apne aap traffic ko <b>flows</b> mein baant deta hai (addresses, ports aur protocol se) aur har flow ko bandwidth ka fair share deta hai, ooncha IP Precedence ho to zyada weight. Chhoti interactive flow bade download ke neeche nahi dabti. Koi configuration nahi, lekin hard guarantees nahi aur high speeds par scale nahi karta. MQC mein ise class-default ke andar <code>fair-queue</code> ke roop mein dekhoge.</dd>
<dt>Class-Based WFQ (CBWFQ)</dt><dd>Aap classes define karte ho aur har ek ko <code>bandwidth</code> se <b>minimum guaranteed bandwidth</b> dete ho (kbps, percent ya remaining percent). Congestion mein har class kam se kam apne rate par serve hoti hai; agar koi class idle ho to doosre uska unused share udhaar le sakte hain. Bandwidth guarantee karta hai lekin low delay nahi.</dd>
<dt>Low Latency Queuing (LLQ)</dt><dd>CBWFQ plus ek ya zyada <b>strict-priority queues</b>, jo <code>priority</code> se configure hoti hain. Priority queue ke packets sabse pehle bheje jaate hain, jisse voice ko low delay aur jitter milta hai. Voice ke liye LLQ standard design hai aur exam yahi expect karta hai.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 660 250" role="img" aria-label="LLQ scheduler">
<rect x="10" y="20" width="110" height="34" fill="#bbf7d0"/><text x="65" y="42" text-anchor="middle" class="svg-ink" font-size="12">EF: priority 1000</text>
<rect x="10" y="70" width="110" height="34" fill="#bae6fd"/><text x="65" y="92" text-anchor="middle" class="svg-ink" font-size="12">AF11: bw 2000</text>
<rect x="10" y="120" width="110" height="34" fill="#bae6fd"/><text x="65" y="142" text-anchor="middle" class="svg-ink" font-size="12">AF21: bw 1000</text>
<rect x="10" y="170" width="110" height="34" fill="#e2e8f0"/><text x="65" y="192" text-anchor="middle" class="svg-ink" font-size="12">class-default</text>
<path d="M120 37 H300 M120 87 H260 M120 137 H260 M120 187 H260" stroke="#64748b" stroke-width="2" fill="none"/>
<rect x="260" y="70" width="110" height="134" rx="6" fill="#ddd6fe"/><text x="315" y="130" text-anchor="middle" class="svg-ink" font-size="12">CBWFQ</text><text x="315" y="148" text-anchor="middle" class="svg-ink" font-size="12">scheduler</text>
<rect x="300" y="20" width="110" height="34" rx="6" fill="#fde68a"/><text x="355" y="42" text-anchor="middle" class="svg-ink" font-size="12">Priority pehle</text>
<path d="M410 37 H470 V120 H440 M370 137 H440" stroke="#64748b" stroke-width="2" fill="none"/>
<rect x="440" y="100" width="100" height="60" rx="6" fill="#bbf7d0"/><text x="490" y="128" text-anchor="middle" class="svg-ink" font-size="12">TX ring</text><text x="490" y="146" text-anchor="middle" class="svg-muted" font-size="11">10 Mbps wire</text>
<path d="M540 130 H620" stroke="#64748b" stroke-width="3" fill="none"/>
<text x="330" y="232" text-anchor="middle" class="svg-accent" font-size="12">Congestion mein priority queue apne rate par police hoti hai, taaki baaki ko bhookha na rakhe.</text>
</svg><p class="cap">LLQ: ek strict-priority queue plus guaranteed share wali CBWFQ classes.</p></div>

<h3>Starvation guard</h3>
<p>Pure priority queue khatarnak hai: agar EF mark hua bahut zyada traffic aa jaye, to baaki queues ko kabhi baari nahi milti. LLQ iska hal karta hai: congestion ke dauran <b>priority queue ko configured rate par police</b> karke. Agar aap <code>priority 1000</code> (1000 kbps) likhte ho, to voice class 1 Mbps tak pehle serve hoti hai; uske upar ka traffic link busy hone par drop ho jaata hai. Jab link congested nahi hota, class apne rate se upar ja sakti hai kyunki koi aur wait nahi kar raha. Aam design rule hai ki priority queue ko link ke lagbhag ek tihai se zyada na rakho.</p>

<h3>Simulator par LLQ kaisa dikhta hai</h3>
<p>WAN policy EF ko 500 kbps ki priority queue deti hai, aur class-default <code>fair-queue</code> use karta hai. Phone 900 kbps EF voice bhejta hai (500 se zyada, guard dikhane ke liye) jabki PC-DATA 10 Mbps link mein 12 Mbps UDP bhar deta hai.</p>
<pre class="code">R1(config)# class-map match-any EF-Q
R1(config-cmap)# match dscp ef
R1(config)# policy-map WAN-OUT
R1(config-pmap)# class EF-Q
R1(config-pmap-c)# priority 500
R1(config-pmap)# class class-default
R1(config-pmap-c)# fair-queue
R1(config)# interface GigabitEthernet0/0
R1(config-if)# service-policy output WAN-OUT
PHONE> traffic 10.20.0.100 udp/20000 900 20 dscp ef
PC-DATA> traffic 10.20.0.100 udp/5001 12000 20
R1# show policy-map interface GigabitEthernet0/0 output | include Class-map|Priority|packets|drops</pre>
<pre class="out">    Class-map: EF-Q (match-any)  
      11260 packets, 2252000 bytes
        11260 packets, 2252000 bytes
      Priority: 500 kbps, burst bytes 12500, b/w exceed drops: 1757
      queue limit 512 packets
      (queue depth/total drops/no-buffer drops) 0/1757/0
    Class-map: class-default (match-any)  
      150000 packets, 30000000 bytes
      queue limit 64 packets
      (queue depth/total drops/no-buffer drops) 0/27817/0
      Fair-queue: per-flow queue limit 16 packets</pre>
<p>EF-Q block padho. <code>Priority: 500 kbps</code> guard hai. <code>b/w exceed drops: 1757</code> un EF packets ki sankhya hai jo isliye discard hue ki call ne link congested hone par 500 kbps se zyada offer kiya. <code>(queue depth/total drops/no-buffer drops) 0/1757/0</code> batata hai ki queue khali hai (depth 0): priority traffic wait nahi karta. Phone ka test flow bhi confirm karta hai: 11,260 packets bheje, 9,510 pahunche, 15.5% loss. Fix guard hatana nahi hai, balki use asli traffic ke hisaab se size karna, ya galti karne wale ko sudharna.</p>

<h3>Tail drop, global synchronisation aur WRED</h3>
<p>Queue full ho jaye to kya hota hai? Default mein <b>tail drop</b>: jab tak jagah na bane, naye packets discard hote hain. Yeh simple hai lekin unfair: kai TCP flows ek hi pal par packets khoti hain, sab saath mein speed aadhi karti hain, link underuse hota hai, phir sab saath mein speed badhati hain aur phir overflow. Is laher ko <b>global TCP synchronisation</b> kehte hain.</p>
<p><b>Random Early Detection (RED)</b> queue full hone se <i>pehle</i> kuch packets drop karna shuru karke ise rokta hai. <b>Weighted RED (WRED)</b> marking ke hisaab se aisa karta hai: har DSCP ya precedence ke liye minimum threshold, maximum threshold aur drop probability rakhta hai, taaki AFx3 packets AFx1 se pehle aur zyada drop hon. Random dropping flows ko desynchronise karti hai aur TCP senders dheere dheere speed kam karte hain. WRED sirf TCP traffic ki madad karta hai; voice par mat lagao (UDP packets khone par dheema nahi hota). CCNA level par concept jaano: tail drop versus DSCP ke hisaab se early random drop. Class mein ise <code>random-detect</code> se enable karte hain.</p>

<div class="eg"><p><b>Worked example.</b> 10 Mbps WAN par 20 G.711 calls (lagbhag 1.75 Mbps), kuch video calls aur bulk backups chalte hain. Design: EF ko <code>priority 2000</code> (87 kbps wali 20 calls se thoda upar), AF41 video ko <code>bandwidth 3000</code>, AF21 transactional ko <code>bandwidth 1500</code>, class-default <code>fair-queue</code>. Reservations ka jod 6,500 kbps hai, yaani 10,000 kbps ka 65%, margin bachta hai. Shaant waqt mein sab bahta hai. Subah 9 baje jab backups shuru hote hain, voice ka 1.75 Mbps hamesha pehle nikalta hai, video aur transactional classes ko kam se kam unka share guaranteed hai, aur backup bacha hua leta hai aur drops absorb karta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Sab zaroori cheezein priority class mein daal dena: jitna zyada jodoge, har ek ki protection utni kam, aur 33% rule toot jaata hai. Ek hi class mein <code>priority</code> aur <code>bandwidth</code> milana (simulator mana karta hai: "Remove the bandwidth command from this class before configuring priority"). Voice par WRED lagana. Maan lena ki CBWFQ low delay deta hai: woh bandwidth deta hai; delay-sensitive traffic ko priority queue chahiye.</p></div>

<div class="exam"><p><b>Exam traps.</b> LLQ = CBWFQ + strict priority queue; voice ke liye. Priority queue congestion mein police hoti hai taaki starvation na ho. CBWFQ bandwidth guarantee karta hai, LLQ bandwidth aur low delay dono. Tail drop default hai; WRED DSCP ya precedence ke hisaab se jaldi drop karta hai taaki global TCP synchronisation na ho. Queuing sirf output mein. Zyada tar interfaces par default FIFO hai.</p></div>

<div class="scn"><h4>Priority queue jo WAN kha gayi</h4><p>Ek support team ne 4 Mbps branch link par "safe rehne ke liye" voice ke liye <code>priority percent 70</code> configure kiya. Voice khud 600 kbps use karti thi, isliye baaki 2.8 Mbps din bhar zyada tar khali rehta tha, aur problem tab bani jab ek video client galti se EF mark ho gaya: usne priority queue bhar di, aur doosri classes ka ERP traffic bache hue thode se par bhookha reh gaya. Priority ko 25% karne aur video ko AF41 re-mark karne se balance wapas aaya.</p><p><b>Seekh:</b> priority class ko asli calls se size karo, aur jo uske andar aata hai use police karo.</p></div>

<div class="iv"><p class="q">"LLQ kya hai aur usme policer kyun hai?"</p><p>LLQ CBWFQ hai jisme voice jaise delay-sensitive traffic ke liye strict-priority queue hoti hai. Voice hamesha pehle bheji jaati hai, isse low latency aur jitter milta hai. Congestion mein priority queue configured rate tak limit hoti hai kyunki warna bhaari EF flow baaki saari classes ko bhookha rakh deti. Jodo ki congestion ke bahar class spare bandwidth use kar sakti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Queues congested interface ke output side par banti hain; scheduler agla packet chunta hai.</li>
<li>FIFO mein classes nahi. WFQ per flow fair share deta hai. CBWFQ har class ko minimum bandwidth guarantee karta hai. LLQ voice ke liye strict priority queue jodta hai.</li>
<li>Priority queue congestion mein police hoti hai, yahi starvation guard hai; excess EF drop hota hai.</li>
<li>Tail drop global TCP synchronisation karta hai; WRED jaldi aur DSCP ke hisaab se drop karta hai, sirf TCP traffic ke liye.</li>
<li>Priority class ko link ke lagbhag ek tihai tak rakho aur sirf voice ke liye.</li>
</ul></div>
`}};export{e as default};