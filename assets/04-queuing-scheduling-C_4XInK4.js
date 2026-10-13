var e={id:`queuing-scheduling`,h:{en:`Queuing and scheduling: LLQ, WRR, bandwidth percent and RED`,hi:`Queuing aur scheduling: LLQ, WRR, bandwidth percent aur RED`},body:{en:`
<p>A bank branch has one VIP counter and three normal counters, and one security guard who decides which customer goes to which counter. The VIP counter is always served first, but it can only take a few customers per hour so that normal customers are not starved. The normal counters share the remaining staff in fixed proportions. And if the waiting hall is nearly full, the guard starts turning away a few random customers early instead of waiting for a stampede. That is <b>queuing, scheduling and congestion avoidance</b>.</p>

<h3>Why queues exist</h3>
<p>A router interface sends one packet at a time at a fixed rate. If packets arrive faster than they can leave, they wait in memory. That waiting area is a <b>queue</b>. With a single queue (FIFO) every packet waits behind all earlier packets, so a voice packet can wait behind 100 file-transfer packets. QoS uses <b>several queues</b> and a <b>scheduler</b> that picks the next packet from them.</p>

<h3>The eight queues</h3>
<p>Catalyst SD-WAN gives every interface eight queues, numbered 0 to 7. In chapter 3 you mapped classes to them. Remember the fixed facts:</p>
<ul>
<li><b>Queue 0</b>: low-latency queue (LLQ), strict priority. It also carries the router's own control traffic. Any class mapped here must use <code>scheduling llq</code> and <code>drops tail-drop</code>.</li>
<li><b>Queues 1 to 7</b>: weighted round robin (WRR) data queues.</li>
<li>With no QoS configured, all traffic uses <b>queue 2</b>. Unclassified traffic also lands in queue 2 (class-default).</li>
</ul>

<h3>LLQ: priority with a leash</h3>
<p><b>Low-latency queuing</b> means that whenever the priority queue has a packet, it is sent first. Voice gets the minimum possible delay and jitter. To stop one class from starving the rest, the LLQ is <b>policed</b>: its <b>bandwidth percent</b> is the most it may use when the link is congested. On the router this appears as <code>priority level 1</code> plus <code>police rate percent N</code>. Excess priority traffic is dropped during congestion, so size the percentage for the real voice load plus headroom, not for "everything important".</p>

<h3>WRR: sharing what is left</h3>
<p><b>Weighted round robin</b> serves queues 1 to 7 in proportion to their <b>bandwidth percent</b>. If CRITICAL has 25 and BULK has 10, then during congestion CRITICAL gets 2.5 times more than BULK. The numbers are <b>guarantees, not caps</b>: a queue that is empty gives its share to the others. When the link is idle, BULK can use all of it. The bandwidth percentages of all queues together should total 100.</p>

<h3>Buffer percent: how much waiting room</h3>
<p>The <b>buffer percent</b> gives each queue a share of the interface's packet memory. A larger buffer absorbs bursts but adds delay. A voice queue needs a <b>small</b> buffer, because a packet that waits long is useless; a bulk queue can have a larger one.</p>

<h3>Drops: tail drop and RED</h3>
<ul>
<li><b>Tail drop</b>: when the queue is full, new packets are dropped. Simple, and correct for voice (late voice is worthless anyway).</li>
<li><b>RED</b> (random early detection, <code>red-drop</code> in the policy, <code>random-detect</code> on the router): as the queue fills toward its limits, the router drops a few packets at random <i>early</i>. TCP senders slow down gradually instead of all at once, which avoids <b>global synchronisation</b> (many TCP flows backing off and ramping up together). Use RED on TCP-heavy data queues, not on voice.</li>
</ul>
<p>Cisco's own example uses <code>random-detect</code> on a data class and tail drop on the others. When RED applies, the packet loss priority set by a policer decides which packets are dropped first (high PLP before low).</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Scheduler with LLQ and WRR queues">
<rect x="20" y="20" width="90" height="26" rx="4" fill="#fde68a"/><text x="65" y="38" text-anchor="middle" class="svg-ink" font-size="12">Q0 VOICE 20%</text>
<rect x="20" y="58" width="90" height="26" rx="4" fill="#fed7aa"/><text x="65" y="76" text-anchor="middle" class="svg-ink" font-size="12">Q1 VIDEO 25%</text>
<rect x="20" y="96" width="90" height="26" rx="4" fill="#fed7aa"/><text x="65" y="114" text-anchor="middle" class="svg-ink" font-size="12">Q2 DEFAULT 20%</text>
<rect x="20" y="134" width="90" height="26" rx="4" fill="#fed7aa"/><text x="65" y="152" text-anchor="middle" class="svg-ink" font-size="12">Q3 CRITICAL 25%</text>
<rect x="20" y="172" width="90" height="26" rx="4" fill="#e2e8f0"/><text x="65" y="190" text-anchor="middle" class="svg-ink" font-size="12">Q4 BULK 10%</text>
<rect x="190" y="20" width="120" height="26" rx="4" fill="#fde68a"/><text x="250" y="38" text-anchor="middle" class="svg-ink" font-size="12">priority, policed</text>
<rect x="190" y="58" width="120" height="140" rx="4" fill="#ddd6fe"/><text x="250" y="120" text-anchor="middle" class="svg-ink" font-size="13">WRR scheduler</text><text x="250" y="140" text-anchor="middle" class="svg-muted" font-size="12">shares by percent</text>
<rect x="390" y="70" width="110" height="80" rx="8" fill="#bae6fd"/><text x="445" y="104" text-anchor="middle" class="svg-ink" font-size="13">Shaper</text><text x="445" y="124" text-anchor="middle" class="svg-muted" font-size="12">100 Mbps</text>
<rect x="540" y="70" width="90" height="80" rx="8" fill="#bbf7d0"/><text x="585" y="114" text-anchor="middle" class="svg-ink" font-size="13">Wire</text>
<line x1="110" y1="33" x2="190" y2="33" stroke="#64748b" stroke-width="2"/><line x1="110" y1="71" x2="190" y2="90" stroke="#64748b" stroke-width="2"/><line x1="110" y1="109" x2="190" y2="109" stroke="#64748b" stroke-width="2"/><line x1="110" y1="147" x2="190" y2="130" stroke="#64748b" stroke-width="2"/><line x1="110" y1="185" x2="190" y2="160" stroke="#64748b" stroke-width="2"/>
<line x1="310" y1="33" x2="390" y2="95" stroke="#64748b" stroke-width="2"/><line x1="310" y1="128" x2="390" y2="115" stroke="#64748b" stroke-width="2"/><line x1="500" y1="110" x2="540" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="320" y="240" text-anchor="middle" class="svg-accent" font-size="12">Q0 is served first but only up to its policed rate; the rest share by weight</text>
</svg><p class="cap">Five queues feed one shaper: the priority queue is served first, the others share the remainder by their bandwidth percent.</p></div>

<h3>What the router receives</h3>
<p>Manager converts the scheduler and QoS map into an ordinary IOS XE policy map. The exact lines differ between releases, but the shape is stable: Queue 0 with <code>priority level 1</code> and a policer, the other queues with a bandwidth statement and, where you chose RED, <code>random-detect</code>:</p>
<pre class="out">E-DEL-1# show running-config | section policy-map QoS
policy-map QoS-Map
 class Queue0
  <span class="hl">priority level 1</span>
  <span class="hl">police rate percent 20</span>
 class Queue1
  bandwidth remaining ratio 25
  random-detect precedence-based
 class Queue3
  bandwidth remaining ratio 25
  random-detect precedence-based
 class Queue4
  bandwidth remaining ratio 10
 class class-default
  bandwidth remaining ratio 20</pre>
<p>Reading it: voice is first and limited to 20 percent; the others share what is left in the ratio 25 : 25 : 10 : 20. Older releases show <code>bandwidth percent</code> in the same place; treat that as a release difference, not an error.</p>

<div class="eg"><p><b>Worked example.</b> A 100 Mbps shaped WAN link with the five-queue map above. During congestion: voice may use up to 20 Mbps (100 x 20 percent). The other 80 Mbps is shared. By ratio 25:25:10:20 (total 80), VIDEO and CRITICAL each get 25 Mbps, BULK 10 Mbps and DEFAULT 20 Mbps. If VIDEO is idle, its 25 Mbps is redistributed in proportion to the others: CRITICAL gets 25 + 25 x 25/55 = about 36.4 Mbps. In calm times, BULK can take all 100 Mbps, but only until voice or video wants it back.</p></div>

<div class="warn"><p><b>Common mistake.</b> Giving voice a huge LLQ share "to be safe". A large priority queue wastes reserved bandwidth and lets a misbehaving flow marked as voice crowd out everything else. Calculate the real peak number of calls, add headroom, and police it.</p></div>

<div class="exam"><p><b>Exam trap.</b> Queue 0 is the only LLQ and must use tail drop. Bandwidth percentages are <b>guarantees under congestion</b> and unused bandwidth is shared. RED belongs to data queues. Control traffic uses queue 0, and if QoS is not configured the default queue is 2.</p></div>

<div class="scn"><h4>Video calls pixelate while voice is perfect</h4><p>At the Mumbai branch, voice quality was excellent but video meetings froze. The QoS map gave VIDEO 5 percent and BULK 30 percent because the template defaults had never been changed. During backups the video queue was starved to 5 percent of 50 Mbps, 2.5 Mbps, less than a single HD stream. The engineer raised VIDEO to 25 percent and lowered BULK to 10 percent. Pixelation stopped without touching voice.</p><p><b>Lesson:</b> a wrong WRR weight hurts the traffic that is not in the priority queue.</p></div>

<div class="iv"><p class="q">"How does LLQ differ from WRR, and what is RED for?"</p><p>LLQ is strict priority for queue 0: it is always served first but policed to its percent during congestion so it cannot starve others. WRR serves the other queues in proportion to their bandwidth percentages, and unused share is redistributed. RED drops a few packets early as a queue fills so TCP flows slow down gradually and avoid synchronised collapse; I use it on data queues, tail drop on voice.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Eight queues: queue 0 is LLQ with tail drop; queues 1 to 7 are WRR; the default queue is 2.</li>
<li>LLQ is served first but policed to its percentage under congestion.</li>
<li>WRR percentages are guarantees, not caps; idle bandwidth is shared.</li>
<li>Small buffers for voice, larger for bulk; RED for TCP-heavy queues.</li>
<li>Manager turns schedulers into an IOS XE policy map; verify it on the router.</li>
</ul></div>
`,hi:`
<p>Bank branch mein ek VIP counter hai, teen normal counters hain, aur ek security guard hai jo tay karta hai ki kaun sa customer kis counter par jaaye. VIP counter hamesha pehle serve hota hai, lekin woh ghante mein sirf kuch hi customers le sakta hai taaki normal customers bhookhe na rahein. Normal counters bacha hua staff tay hisse mein baant lete hain. Aur agar waiting hall lagbhag bhar jaaye, to guard bheed bhagdad ka intezaar karne ki jagah pehle hi kuch random customers ko mana karna shuru kar deta hai. Yahi hai <b>queuing, scheduling aur congestion avoidance</b>.</p>

<h3>Queues kyun hoti hain</h3>
<p>Router interface ek samay mein ek packet, tay rate par bhejta hai. Agar packets bhejne se tez aate hain to woh memory mein intezaar karte hain. Us waiting area ko <b>queue</b> kehte hain. Ek hi queue (FIFO) mein har packet pichhle sab packets ke peeche rukta hai, to voice packet 100 file-transfer packets ke peeche rukk sakta hai. QoS <b>kai queues</b> aur ek <b>scheduler</b> use karta hai jo unmein se agla packet chunta hai.</p>

<h3>Aath queues</h3>
<p>Catalyst SD-WAN har interface ko aath queues deta hai, 0 se 7. Chapter 3 mein aapne classes ko unse map kiya. Fixed facts yaad rakho:</p>
<ul>
<li><b>Queue 0</b>: low-latency queue (LLQ), strict priority. Yeh router ka apna control traffic bhi carry karti hai. Yahan map hui class ko <code>scheduling llq</code> aur <code>drops tail-drop</code> use karna hi hoga.</li>
<li><b>Queues 1 se 7</b>: weighted round robin (WRR) data queues.</li>
<li>QoS configure na ho to sab traffic <b>queue 2</b> use karta hai. Unclassified traffic bhi queue 2 mein jaata hai (class-default).</li>
</ul>

<h3>LLQ: patte ke saath priority</h3>
<p><b>Low-latency queuing</b> ka matlab hai ki jab bhi priority queue mein packet ho, use pehle bheja jaata hai. Voice ko minimum delay aur jitter milta hai. Ek class baaki sab ko bhookha na rakhe isliye LLQ <b>police</b> hoti hai: uska <b>bandwidth percent</b> woh maximum hai jo congestion mein woh use kar sakti hai. Router par yeh <code>priority level 1</code> aur <code>police rate percent N</code> ke roop mein dikhta hai. Congestion mein excess priority traffic drop hota hai, isliye percentage real voice load plus headroom ke hisaab se rakho, "har important cheez" ke hisaab se nahi.</p>

<h3>WRR: jo bacha use baantna</h3>
<p><b>Weighted round robin</b> queues 1 se 7 ko unke <b>bandwidth percent</b> ke anupaat mein serve karta hai. Agar CRITICAL ko 25 aur BULK ko 10 mile, to congestion mein CRITICAL ko BULK se 2.5 guna zyada milta hai. Numbers <b>guarantees hain, caps nahi</b>: khaali queue apna hissa dusron ko de deti hai. Link idle ho to BULK poora use kar sakta hai. Saari queues ke bandwidth percentages ka total 100 hona chahiye.</p>

<h3>Buffer percent: kitna waiting room</h3>
<p><b>Buffer percent</b> har queue ko interface ki packet memory ka hissa deta hai. Bada buffer bursts absorb karta hai lekin delay badhata hai. Voice queue ko <b>chhota</b> buffer chahiye, kyunki jo packet der se milta hai woh bekaar hai; bulk queue ko bada buffer mil sakta hai.</p>

<h3>Drops: tail drop aur RED</h3>
<ul>
<li><b>Tail drop</b>: queue full ho to naye packets drop hote hain. Simple, aur voice ke liye sahi (der se aayi voice waise bhi bekaar hai).</li>
<li><b>RED</b> (random early detection, policy mein <code>red-drop</code>, router par <code>random-detect</code>): queue apni limits ki taraf bharti hai to router <i>pehle hi</i> kuch packets random drop karta hai. TCP senders ek saath nahi, dheere-dheere slow hote hain, jisse <b>global synchronisation</b> (kai TCP flows ka saath back off aur saath ramp up) bachta hai. RED TCP-heavy data queues par use karo, voice par nahi.</li>
</ul>
<p>Cisco ka apna example ek data class par <code>random-detect</code> aur baaki par tail drop use karta hai. RED lagne par policer ka set kiya packet loss priority tay karta hai ki kaunse packets pehle drop hon (high PLP, low se pehle).</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="LLQ aur WRR queues wala scheduler">
<rect x="20" y="20" width="90" height="26" rx="4" fill="#fde68a"/><text x="65" y="38" text-anchor="middle" class="svg-ink" font-size="12">Q0 VOICE 20%</text>
<rect x="20" y="58" width="90" height="26" rx="4" fill="#fed7aa"/><text x="65" y="76" text-anchor="middle" class="svg-ink" font-size="12">Q1 VIDEO 25%</text>
<rect x="20" y="96" width="90" height="26" rx="4" fill="#fed7aa"/><text x="65" y="114" text-anchor="middle" class="svg-ink" font-size="12">Q2 DEFAULT 20%</text>
<rect x="20" y="134" width="90" height="26" rx="4" fill="#fed7aa"/><text x="65" y="152" text-anchor="middle" class="svg-ink" font-size="12">Q3 CRITICAL 25%</text>
<rect x="20" y="172" width="90" height="26" rx="4" fill="#e2e8f0"/><text x="65" y="190" text-anchor="middle" class="svg-ink" font-size="12">Q4 BULK 10%</text>
<rect x="190" y="20" width="120" height="26" rx="4" fill="#fde68a"/><text x="250" y="38" text-anchor="middle" class="svg-ink" font-size="12">priority, policed</text>
<rect x="190" y="58" width="120" height="140" rx="4" fill="#ddd6fe"/><text x="250" y="120" text-anchor="middle" class="svg-ink" font-size="13">WRR scheduler</text><text x="250" y="140" text-anchor="middle" class="svg-muted" font-size="12">percent se hissa</text>
<rect x="390" y="70" width="110" height="80" rx="8" fill="#bae6fd"/><text x="445" y="104" text-anchor="middle" class="svg-ink" font-size="13">Shaper</text><text x="445" y="124" text-anchor="middle" class="svg-muted" font-size="12">100 Mbps</text>
<rect x="540" y="70" width="90" height="80" rx="8" fill="#bbf7d0"/><text x="585" y="114" text-anchor="middle" class="svg-ink" font-size="13">Wire</text>
<line x1="110" y1="33" x2="190" y2="33" stroke="#64748b" stroke-width="2"/><line x1="110" y1="71" x2="190" y2="90" stroke="#64748b" stroke-width="2"/><line x1="110" y1="109" x2="190" y2="109" stroke="#64748b" stroke-width="2"/><line x1="110" y1="147" x2="190" y2="130" stroke="#64748b" stroke-width="2"/><line x1="110" y1="185" x2="190" y2="160" stroke="#64748b" stroke-width="2"/>
<line x1="310" y1="33" x2="390" y2="95" stroke="#64748b" stroke-width="2"/><line x1="310" y1="128" x2="390" y2="115" stroke="#64748b" stroke-width="2"/><line x1="500" y1="110" x2="540" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="320" y="240" text-anchor="middle" class="svg-accent" font-size="12">Q0 pehle serve hoti hai lekin policed rate tak; baaki weight se baantti hain</text>
</svg><p class="cap">Paanch queues ek shaper ko feed karti hain: priority queue pehle serve hoti hai, baaki bacha hua bandwidth percent se baantti hain.</p></div>

<h3>Router ko kya milta hai</h3>
<p>Manager scheduler aur QoS map ko ek aam IOS XE policy map mein badal deta hai. Exact lines releases ke beech badalti hain, lekin shape stable hai: Queue 0 par <code>priority level 1</code> aur policer, baaki queues par bandwidth statement aur jahan aapne RED chuna wahan <code>random-detect</code>:</p>
<pre class="out">E-DEL-1# show running-config | section policy-map QoS
policy-map QoS-Map
 class Queue0
  <span class="hl">priority level 1</span>
  <span class="hl">police rate percent 20</span>
 class Queue1
  bandwidth remaining ratio 25
  random-detect precedence-based
 class Queue3
  bandwidth remaining ratio 25
  random-detect precedence-based
 class Queue4
  bandwidth remaining ratio 10
 class class-default
  bandwidth remaining ratio 20</pre>
<p>Padhna: voice sabse pehle aur 20 percent tak limited; baaki bacha hua 25 : 25 : 10 : 20 ke ratio mein baantte hain. Purane releases mein isi jagah <code>bandwidth percent</code> dikhta hai; ise release ka fark samjho, error nahi.</p>

<div class="eg"><p><b>Worked example.</b> 100 Mbps shaped WAN link, upar wala paanch-queue map. Congestion mein: voice 20 Mbps tak (100 x 20 percent). Baaki 80 Mbps baanta jaata hai. Ratio 25:25:10:20 (total 80) se VIDEO aur CRITICAL ko 25-25 Mbps, BULK ko 10 Mbps aur DEFAULT ko 20 Mbps. Agar VIDEO idle hai to uske 25 Mbps baaki ke anupaat mein baante jaate hain: CRITICAL ko 25 + 25 x 25/55 = lagbhag 36.4 Mbps. Shaant samay mein BULK poore 100 Mbps le sakta hai, lekin tab tak jab tak voice ya video wapas na maange.</p></div>

<div class="warn"><p><b>Common mistake.</b> "Safe rehne ke liye" voice ko bahut bada LLQ share dena. Bada priority queue reserved bandwidth barbaad karta hai aur voice mark kiya hua badtameez flow baaki sab ko dhakel sakta hai. Calls ki asli peak sankhya nikalo, headroom jodo, aur police karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Queue 0 hi akeli LLQ hai aur tail drop use karni chahiye. Bandwidth percentages <b>congestion mein guarantees</b> hain aur unused bandwidth share hota hai. RED data queues ka hai. Control traffic queue 0 use karta hai, aur QoS configure na ho to default queue 2 hai.</p></div>

<div class="scn"><h4>Voice perfect, video pixelate</h4><p>Mumbai branch mein voice quality shandar thi lekin video meetings freeze hoti thin. QoS map ne VIDEO ko 5 percent aur BULK ko 30 percent diya tha kyunki template defaults kabhi badle hi nahi the. Backups ke dauran video queue 50 Mbps ke 5 percent, yaani 2.5 Mbps tak dab gayi, jo ek HD stream se bhi kam hai. Engineer ne VIDEO 25 percent aur BULK 10 percent kiya. Voice ko chhue bina pixelation band ho gaya.</p><p><b>Lesson:</b> galat WRR weight us traffic ko nuksan pahunchata hai jo priority queue mein nahi hai.</p></div>

<div class="iv"><p class="q">"LLQ aur WRR mein kya fark hai, aur RED kis liye hai?"</p><p>LLQ queue 0 ke liye strict priority hai: hamesha pehle serve hoti hai lekin congestion mein apne percent tak police hoti hai taaki baaki ko bhookha na rakhe. WRR baaki queues ko unke bandwidth percentages ke anupaat mein serve karta hai, aur unused hissa redistribute hota hai. RED queue bharte waqt kuch packets pehle drop karta hai taaki TCP flows dheere slow hon aur synchronised collapse na ho; main ise data queues par use karta hoon, voice par tail drop.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Aath queues: queue 0 LLQ tail drop ke saath; queues 1 se 7 WRR; default queue 2.</li>
<li>LLQ pehle serve hoti hai lekin congestion mein apne percentage tak police hoti hai.</li>
<li>WRR percentages guarantees hain, caps nahi; idle bandwidth share hota hai.</li>
<li>Voice ke liye chhote buffers, bulk ke liye bade; RED TCP-heavy queues ke liye.</li>
<li>Manager schedulers ko IOS XE policy map mein badalta hai; router par verify karo.</li>
</ul></div>
`}};export{e as default};