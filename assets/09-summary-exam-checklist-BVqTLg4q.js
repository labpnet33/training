var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with a toll booth and finish it with a working toolbox. This last chapter gathers everything in one place: the big picture, a can-do checklist, a mini glossary, the facts examiners love, a command cheat-sheet, and a few notes about what the practice labs do and do not model. Read it the night before an interview or exam, then try the labs again without looking at the hints.</p>

<h3>The big picture in one drawing</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Summary of queuing tools">
<rect x="10" y="20" width="195" height="110" rx="10" fill="#bae6fd"/><text x="107" y="46" text-anchor="middle" class="svg-ink" font-size="14">CBWFQ</text>
<text x="107" y="70" text-anchor="middle" class="svg-muted" font-size="12">bandwidth guarantee</text><text x="107" y="90" text-anchor="middle" class="svg-muted" font-size="12">per class, a floor</text><text x="107" y="110" text-anchor="middle" class="svg-muted" font-size="12">spare shared by weight</text>
<rect x="222" y="20" width="195" height="110" rx="10" fill="#ddd6fe"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="14">LLQ</text>
<text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">strict priority queue</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">low delay for voice</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">policed when congested</text>
<rect x="435" y="20" width="195" height="110" rx="10" fill="#bbf7d0"/><text x="532" y="46" text-anchor="middle" class="svg-ink" font-size="14">WRED</text>
<text x="532" y="70" text-anchor="middle" class="svg-muted" font-size="12">early random drop</text><text x="532" y="90" text-anchor="middle" class="svg-muted" font-size="12">for TCP classes</text><text x="532" y="110" text-anchor="middle" class="svg-muted" font-size="12">by drop precedence</text>
<text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">All three live in a policy-map, attached with service-policy output</text>
<text x="320" y="187" text-anchor="middle" class="svg-accent" font-size="12">and all three only act while the interface is congested</text>
</svg><p class="cap">Who is guaranteed, who goes first, who is dropped early.</p></div>

<h3>Can-do checklist</h3>
<p>You are ready when you can do each of these without notes:</p>
<ul>
<li>Explain congestion, queues, tail drop, delay and loss, and compute the delay of a queue from its length and the link rate.</li>
<li>Name FIFO, PQ, CQ, WFQ, CBWFQ and LLQ and say what each fixed.</li>
<li>Configure a CBWFQ policy with bandwidth in kbps, percent and remaining percent, and explain that it is a floor.</li>
<li>Configure an LLQ with a rate, explain the implicit policer and conditional policing, and size it from the number of calls.</li>
<li>Describe global synchronisation and how WRED prevents it, with minimum, maximum and mark probability denominator.</li>
<li>Apply the 75/25 and one-third guidelines and choose a queue-limit from a delay target.</li>
<li>Read show policy-map interface and find matched packets, offered rate, drops, priority exceed drops and the bandwidth line.</li>
<li>Troubleshoot with four checks: attached, classified, numbers, bottleneck.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Congestion</dt><dd>More traffic offered than the interface can send.</dd>
<dt>Tail drop</dt><dd>Discarding new packets when the queue is full.</dd>
<dt>CBWFQ</dt><dd>Class-based weighted fair queuing: a queue and a guaranteed minimum per class.</dd>
<dt>LLQ</dt><dd>Low latency queuing: CBWFQ plus one strict-priority queue.</dd>
<dt>Implicit policer</dt><dd>The rate limit on a priority class, enforced only during congestion.</dd>
<dt>class-default</dt><dd>The class for everything that matched no other class; always last.</dd>
<dt>WRED</dt><dd>Weighted random early detection: random early drops, with profiles per precedence or DSCP.</dd>
<dt>Global synchronisation</dt><dd>Many TCP flows backing off and recovering together after tail drop.</dd>
<dt>Exponential weighting constant</dt><dd>Controls how slowly the average queue follows the real queue; default 9.</dd>
<dt>queue-limit</dt><dd>Maximum length of a class queue.</dd>
<dt>max-reserved-bandwidth</dt><dd>Share of the interface that class guarantees may use; classic default 75 percent.</dd>
<dt>Bufferbloat</dt><dd>Excess delay caused by oversized queues on a slow link.</dd>
</dl>

<h3>Most tested facts</h3>
<ul>
<li>Queuing policies are applied <b>outbound</b>; they act only during congestion.</li>
<li>bandwidth is a minimum, not a maximum. All classes in a policy use the same unit.</li>
<li>A class cannot hold both priority and bandwidth.</li>
<li>Priority traffic above its rate is dropped only when the link is congested.</li>
<li>One class-default always exists and is matched last; classes are matched top to bottom, first match wins.</li>
<li>G.711 is about 80 kbps per call at IP level (87.2 kbps on Ethernet); G.729 about 24 kbps (31.2 kbps).</li>
<li>Keep priority traffic under about one third of the link and total guarantees under about 75 percent.</li>
<li>WRED helps TCP, not UDP, and does not belong in the priority class.</li>
<li>Maximum drop probability at the maximum threshold is 1 divided by the mark probability denominator.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code">class-map match-any NAME
 match dscp ef
policy-map NAME
 class VOICE-Q
  priority 1000              <span class="c">! or: priority percent 10</span>
 class ERP-Q
  bandwidth percent 40       <span class="c">! or: bandwidth 4000 / bandwidth remaining percent 60</span>
  random-detect dscp-based   <span class="c">! WRED for TCP classes only</span>
  queue-limit 32 packets
 class class-default
  fair-queue
interface GigabitEthernet0/0
 service-policy output NAME
<span class="c">! verify</span>
show policy-map interface GigabitEthernet0/0 output
show policy-map NAME
show class-map
clear counters</pre>

<h3>What the practice labs model, and what they do not</h3>
<p>The simulator shares a congested link between classes second by second, which is enough to prove guarantees, priority, class order, attach-time checks and the counters. It does <b>not</b> model WRED thresholds or random early drops, a non-zero queue depth, the effect of <code>queue-limit</code>, the 75 percent reserve rule, or starvation by a priority class without a rate. Where the lab and a real router can differ, the chapters said so; on a real router you will also see the extra tables and non-zero depths.</p>

<div class="eg"><p><b>Worked example for the exam.</b> A 20 Mbps circuit carries 40 G.711 calls. Per call 80 kbps at IP level, so 40 x 80 = 3200 kbps; with Ethernet headers 40 x 87.2 = 3488 kbps. One third of the link is 6667 kbps, so priority 3500 kbps (about 17.5 percent) is safe. With a 75 percent guarantee ceiling (15,000 kbps), 3500 leaves 11,500 kbps for ERP, backup and the rest.</p></div>

<div class="warn"><p><b>Common mistakes to avoid on exam day.</b> Confusing bandwidth (floor) with shaping or policing (ceiling); thinking LLQ always polices; applying queuing on input; mixing kbps and percent; forgetting that unused guarantee is redistributed.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which statement about LLQ is true?" Strict priority, policed only under congestion, cannot be combined with bandwidth in the same class. "What does WRED use to decide?" The average queue size against per-DSCP thresholds, not the instant queue.</p></div>

<div class="scn"><h4>The interview that turned on one number</h4><p>A candidate for a network engineer role at a Pune IT company was asked to design WAN QoS for 25 phones on a 6 Mbps circuit. She computed 25 x 80 = 2000 kbps, noted that one third of the link is 2000 kbps, and said that this was exactly at the limit, so she would use the lower-bandwidth G.729 codec or ask for a bigger circuit. She then gave a five-class design with a 75 percent ceiling, WRED in the data classes and a load test to verify. The panel noted that she had turned a theory question into a design decision with numbers.</p><p><b>Lesson:</b> interviewers reward calculation and judgement, not recitation.</p></div>

<div class="iv"><p class="q">"Summarise how you would protect voice and business data on a congested WAN in two minutes."</p><p>Mark at the edge, then on the WAN egress use an LLQ policy: a priority class sized from calls times per-call bandwidth and held under a third of the link, CBWFQ classes with percent-based guarantees for critical data and bulk, fair-queue and WRED in the TCP classes, and a total of guarantees under about 75 percent. Attach it outbound on the bottleneck interface, verify with show policy-map interface under load, and shape if the router's interface is not the real bottleneck.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CBWFQ guarantees, LLQ prioritises with a cap, WRED drops early for TCP; all act on congested output.</li>
<li>Design: few classes, percent guarantees under about 75 percent, priority under about a third, short queues for delay-sensitive classes.</li>
<li>Verify under load with show policy-map interface: matched, drops, priority exceed drops.</li>
<li>Troubleshoot in order: attached, classified, numbers, bottleneck.</li>
<li>Know the limits of the simulator and of your own assumptions about the real router.</li>
</ul></div>
`,hi:`
<p>Aapne is module ko toll booth se shuru kiya aur ek kaam karte toolbox ke saath khatam kar rahe ho. Yeh aakhri chapter sab kuch ek jagah jama karta hai: badi tasveer, can-do checklist, mini glossary, woh facts jo examiners ko pasand hain, command cheat-sheet, aur practice labs kya model karti hain aur kya nahi uske kuch notes. Ise interview ya exam se pehli raat padho, phir labs ko hints dekhe bina dobara try karo.</p>

<h3>Ek drawing mein badi tasveer</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Summary of queuing tools">
<rect x="10" y="20" width="195" height="110" rx="10" fill="#bae6fd"/><text x="107" y="46" text-anchor="middle" class="svg-ink" font-size="14">CBWFQ</text>
<text x="107" y="70" text-anchor="middle" class="svg-muted" font-size="12">bandwidth guarantee</text><text x="107" y="90" text-anchor="middle" class="svg-muted" font-size="12">har class ke liye, floor</text><text x="107" y="110" text-anchor="middle" class="svg-muted" font-size="12">spare weight se share</text>
<rect x="222" y="20" width="195" height="110" rx="10" fill="#ddd6fe"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="14">LLQ</text>
<text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">strict priority queue</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">voice ke liye low delay</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">congestion mein policed</text>
<rect x="435" y="20" width="195" height="110" rx="10" fill="#bbf7d0"/><text x="532" y="46" text-anchor="middle" class="svg-ink" font-size="14">WRED</text>
<text x="532" y="70" text-anchor="middle" class="svg-muted" font-size="12">early random drop</text><text x="532" y="90" text-anchor="middle" class="svg-muted" font-size="12">TCP classes ke liye</text><text x="532" y="110" text-anchor="middle" class="svg-muted" font-size="12">drop precedence se</text>
<text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">Teeno policy-map mein rehte hain, service-policy output se lagte hain</text>
<text x="320" y="187" text-anchor="middle" class="svg-accent" font-size="12">aur teeno sirf tab kaam karte hain jab interface congested ho</text>
</svg><p class="cap">Kise guarantee, kaun pehle jaaye, kise pehle hi drop.</p></div>

<h3>Can-do checklist</h3>
<p>Aap tab taiyaar ho jab neeche ka har kaam bina notes ke kar sako:</p>
<ul>
<li>Congestion, queues, tail drop, delay aur loss samjhao, aur queue ki length aur link rate se queue ka delay calculate karo.</li>
<li>FIFO, PQ, CQ, WFQ, CBWFQ aur LLQ ke naam batao aur bolo ki har ek ne kya theek kiya.</li>
<li>kbps, percent aur remaining percent mein bandwidth ke saath CBWFQ policy configure karo, aur samjhao ki yeh floor hai.</li>
<li>Rate ke saath LLQ configure karo, implicit policer aur conditional policing samjhao, aur calls ki sankhya se size nikalo.</li>
<li>Global synchronisation batao aur WRED ise kaise rokta hai, minimum, maximum aur mark probability denominator ke saath.</li>
<li>75/25 aur one-third guidelines lagao aur delay target se queue-limit chuno.</li>
<li>show policy-map interface padho aur matched packets, offered rate, drops, priority exceed drops aur bandwidth line dhoondho.</li>
<li>Chaar checks se troubleshoot karo: attached, classified, numbers, bottleneck.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Congestion</dt><dd>Interface jitna bhej sakta hai usse zyada traffic offered.</dd>
<dt>Tail drop</dt><dd>Queue bhar jaane par naye packets discard karna.</dd>
<dt>CBWFQ</dt><dd>Class-based weighted fair queuing: har class ke liye queue aur guaranteed minimum.</dd>
<dt>LLQ</dt><dd>Low latency queuing: CBWFQ plus ek strict-priority queue.</dd>
<dt>Implicit policer</dt><dd>Priority class par rate limit, jo sirf congestion mein lagti hai.</dd>
<dt>class-default</dt><dd>Un sab ke liye class jo kisi aur class se match nahi hue; hamesha aakhri.</dd>
<dt>WRED</dt><dd>Weighted random early detection: random early drops, precedence ya DSCP ke profiles ke saath.</dd>
<dt>Global synchronisation</dt><dd>Tail drop ke baad kai TCP flows ka ek saath peeche hatna aur sambhalna.</dd>
<dt>Exponential weighting constant</dt><dd>Tay karta hai ki average queue asli queue ko kitni dheere follow kare; default 9.</dd>
<dt>queue-limit</dt><dd>Class queue ki maximum length.</dd>
<dt>max-reserved-bandwidth</dt><dd>Interface ka woh hissa jo class guarantees use kar sakti hain; classic default 75 percent.</dd>
<dt>Bufferbloat</dt><dd>Slow link par bahut badi queues se hone wala zyada delay.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>Queuing policies <b>outbound</b> lagti hain; yeh sirf congestion mein kaam karti hain.</li>
<li>bandwidth minimum hai, maximum nahi. Ek policy ki sab classes same unit use karti hain.</li>
<li>Ek class mein priority aur bandwidth dono nahi ho sakte.</li>
<li>Rate se upar ka priority traffic tabhi drop hota hai jab link congested ho.</li>
<li>class-default hamesha maujood hai aur aakhir mein match hoti hai; classes upar se neeche match hoti hain, pehla match jeet-ta hai.</li>
<li>G.711 IP level par lagbhag 80 kbps per call (Ethernet par 87.2 kbps); G.729 lagbhag 24 kbps (31.2 kbps).</li>
<li>Priority traffic link ke lagbhag ek tihayi se neeche aur total guarantees lagbhag 75 percent se neeche rakho.</li>
<li>WRED TCP ko madad karta hai, UDP ko nahi, aur priority class mein nahi lagta.</li>
<li>Maximum threshold par maximum drop probability = 1 divided by mark probability denominator.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code">class-map match-any NAME
 match dscp ef
policy-map NAME
 class VOICE-Q
  priority 1000              <span class="c">! ya: priority percent 10</span>
 class ERP-Q
  bandwidth percent 40       <span class="c">! ya: bandwidth 4000 / bandwidth remaining percent 60</span>
  random-detect dscp-based   <span class="c">! WRED sirf TCP classes ke liye</span>
  queue-limit 32 packets
 class class-default
  fair-queue
interface GigabitEthernet0/0
 service-policy output NAME
<span class="c">! verify</span>
show policy-map interface GigabitEthernet0/0 output
show policy-map NAME
show class-map
clear counters</pre>

<h3>Practice labs kya model karti hain, aur kya nahi</h3>
<p>Simulator congested link ko classes ke beech har second baantta hai, jo guarantees, priority, class order, attach-time checks aur counters saabit karne ke liye kaafi hai. Yeh WRED thresholds ya random early drops, non-zero queue depth, <code>queue-limit</code> ka asar, 75 percent reserve niyam, ya bina rate wali priority class dwara starvation <b>model nahi karta</b>. Jahan lab aur asli router mein farak ho sakta hai, chapters ne bata diya; asli router par aapko extra tables aur non-zero depths bhi dikhenge.</p>

<div class="eg"><p><b>Exam ke liye worked example.</b> 20 Mbps circuit par 40 G.711 calls chal rahi hain. Har call IP level par 80 kbps, yaani 40 x 80 = 3200 kbps; Ethernet headers ke saath 40 x 87.2 = 3488 kbps. Link ka ek tihayi 6667 kbps hai, isliye priority 3500 kbps (lagbhag 17.5 percent) surakshit hai. 75 percent guarantee ceiling (15,000 kbps) ke saath 3500 se ERP, backup aur baaki ke liye 11,500 kbps bachte hain.</p></div>

<div class="warn"><p><b>Exam din se bachne wali common mistakes.</b> bandwidth (floor) ko shaping ya policing (ceiling) se confuse karna; yeh sochna ki LLQ hamesha police karta hai; queuing ko input par lagana; kbps aur percent mix karna; bhool jaana ki unused guarantee dobara baanti jaati hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "LLQ ke baare mein kaun sa statement sahi hai?" Strict priority, sirf congestion mein policed, ek hi class mein bandwidth ke saath nahi ho sakta. "WRED kis par decide karta hai?" Average queue size ko per-DSCP thresholds se compare karke, instant queue se nahi.</p></div>

<div class="scn"><h4>Woh interview jo ek number par tika</h4><p>Pune ki ek IT company mein network engineer role ke candidate se 6 Mbps circuit par 25 phones ke liye WAN QoS design karne ko kaha gaya. Usne 25 x 80 = 2000 kbps nikala, note kiya ki link ka ek tihayi 2000 kbps hai, yaani theek limit par, isliye woh kam bandwidth wala G.729 codec use karegi ya bade circuit ke liye kahegi. Phir usne paanch-class design diya, 75 percent ceiling ke saath, data classes mein WRED aur verify karne ke liye load test ke saath. Panel ne note kiya ki usne theory ke sawal ko numbers ke saath design decision bana diya.</p><p><b>Lesson:</b> interviewers calculation aur judgement ko inaam dete hain, ratne ko nahi.</p></div>

<div class="iv"><p class="q">"Congested WAN par voice aur business data ko kaise protect karoge, do minute mein batao."</p><p>Edge par mark karo, phir WAN egress par LLQ policy use karo: calls guna per-call bandwidth se size hui aur link ke ek tihayi se neeche rakhi priority class, critical data aur bulk ke liye percent-based guarantees wali CBWFQ classes, TCP classes mein fair-queue aur WRED, aur guarantees ka total lagbhag 75 percent se neeche. Ise bottleneck interface par outbound lagao, load mein show policy-map interface se verify karo, aur agar router ka interface asli bottleneck nahi hai to shape karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CBWFQ guarantee deta hai, LLQ cap ke saath prioritise karta hai, WRED TCP ke liye pehle drop karta hai; teeno congested output par kaam karte hain.</li>
<li>Design: kam classes, lagbhag 75 percent se neeche percent guarantees, priority lagbhag ek tihayi se neeche, delay-sensitive classes ke liye chhoti queues.</li>
<li>Load mein show policy-map interface se verify karo: matched, drops, priority exceed drops.</li>
<li>Order mein troubleshoot karo: attached, classified, numbers, bottleneck.</li>
<li>Simulator ki aur asli router ke baare mein apni dharnaon ki seemayein jaano.</li>
</ul></div>
`}};export{e as default};