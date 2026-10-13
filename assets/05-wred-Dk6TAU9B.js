var e={id:`wred`,h:{en:`WRED: TCP synchronisation, thresholds and random-detect dscp-based`,hi:`WRED: TCP synchronisation, thresholds aur random-detect dscp-based`},body:{en:`
<p>CBWFQ and LLQ decide <i>who</i> is served. <b>Weighted Random Early Detection (WRED)</b> decides <i>which packets are dropped, and when</i>, so that a full queue does not hurt TCP more than necessary. It does not create bandwidth either; it makes the sharing smoother and keeps queues short.</p>

<h3>First, how TCP behaves under loss</h3>
<p><b>TCP</b> is the protocol of web pages, file copies and most business applications. It sends data in a window and slowly makes the window bigger (<b>slow start</b>, then gradual growth) until a packet is lost. TCP treats a loss as a signal that the network is full and <b>halves its sending rate</b>, then grows again. Voice over UDP behaves differently: it does not slow down when a packet is lost, so WRED is useful for TCP and pointless for UDP.</p>

<h3>The problem: tail drop and global synchronisation</h3>
<p>With plain tail drop the queue stays full until it overflows. At that instant <b>many TCP flows lose packets at the same time</b>. All of them halve their rate together, the link suddenly becomes under-used, then all of them grow together again until the queue overflows once more. The result is a sawtooth: the link alternates between overloaded and half empty, and the average use is poor. This is called <b>global synchronisation</b>. A traffic policeman who lets the road fill up and then closes it for everyone causes the same effect.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Tail drop sawtooth versus WRED smooth rate">
<text x="160" y="18" text-anchor="middle" class="svg-ink" font-size="13">Tail drop: all flows back off together</text>
<path d="M20 170 V30 M20 170 H300" stroke="#64748b" stroke-width="1.5" fill="none"/>
<polyline points="20,150 70,90 110,60 112,130 150,100 190,60 192,130 230,100 270,62 272,130" fill="none" stroke="#dc2626" stroke-width="2.5"/>
<line x1="20" y1="60" x2="300" y2="60" stroke="#94a3b8" stroke-dasharray="4 4"/><text x="296" y="54" text-anchor="end" class="svg-muted" font-size="11">link full</text>
<text x="480" y="18" text-anchor="middle" class="svg-ink" font-size="13">WRED: flows back off one by one</text>
<path d="M340 170 V30 M340 170 H620" stroke="#64748b" stroke-width="1.5" fill="none"/>
<polyline points="340,150 390,90 430,72 470,80 510,70 550,76 590,70 620,72" fill="none" stroke="#16a34a" stroke-width="2.5"/>
<line x1="340" y1="60" x2="620" y2="60" stroke="#94a3b8" stroke-dasharray="4 4"/>
<text x="160" y="192" text-anchor="middle" class="svg-muted" font-size="11">time</text><text x="480" y="192" text-anchor="middle" class="svg-muted" font-size="11">time</text>
</svg><p class="cap">Total sending rate of many TCP flows. WRED keeps it close to the link rate instead of swinging.</p></div>

<h3>RED: drop a few packets early and at random</h3>
<p><b>Random Early Detection (RED)</b> starts dropping packets <i>before</i> the queue is full, with a small probability that grows as the queue grows. Because the dropped packets belong to random flows, only a few flows slow down at a time, and the others keep going. RED uses three settings and one measurement:</p>
<ul>
<li><b>Average queue size.</b> RED does not react to the instant queue, which jumps with every burst. It uses a smoothed value, an exponentially weighted moving average. The <b>exponential weighting constant</b> (default 9, which means a weight of 1/512) sets how slowly the average follows the real queue.</li>
<li><b>Minimum threshold.</b> Below it nothing is dropped.</li>
<li><b>Maximum threshold.</b> Above it every packet is dropped, like tail drop.</li>
<li><b>Mark probability denominator.</b> Between the two thresholds the drop probability rises linearly from 0 up to 1 divided by this number. A denominator of 10 means a maximum of 1 in 10, or 10 percent, at the maximum threshold.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="RED drop probability curve">
<path d="M70 190 V25 M70 190 H600" stroke="#64748b" stroke-width="1.5" fill="none"/>
<polyline points="70,190 250,190 450,150 450,40 590,40" fill="none" stroke="#2563eb" stroke-width="3"/>
<line x1="250" y1="190" x2="250" y2="205" stroke="#64748b"/><line x1="450" y1="190" x2="450" y2="205" stroke="#64748b"/>
<text x="250" y="217" text-anchor="middle" class="svg-ink" font-size="12">min 20</text><text x="450" y="217" text-anchor="middle" class="svg-ink" font-size="12">max 40</text>
<text x="62" y="44" text-anchor="end" class="svg-ink" font-size="12">100%</text><text x="62" y="154" text-anchor="end" class="svg-ink" font-size="12">10%</text><text x="62" y="194" text-anchor="end" class="svg-ink" font-size="12">0</text>
<text x="160" y="170" text-anchor="middle" class="svg-muted" font-size="12">no drops</text><text x="350" y="150" text-anchor="middle" class="svg-accent" font-size="12">random early drops</text><text x="530" y="30" text-anchor="middle" class="svg-muted" font-size="12">drop all</text>
<text x="335" y="12" text-anchor="middle" class="svg-ink" font-size="12">drop probability against average queue (packets)</text>
</svg><p class="cap">Example profile: minimum 20, maximum 40, denominator 10.</p></div>

<div class="eg"><p><b>Worked example.</b> With minimum 20, maximum 40 and denominator 10, the average queue is 30 packets. That is halfway between the thresholds, so the drop probability is (30 - 20) / (40 - 20) x (1/10) = 0.5 x 0.1 = <b>5 percent</b>. At an average of 35 it is (15 / 20) x 0.1 = 7.5 percent. At 41 packets every packet is dropped. If the average is 18, no packet is dropped even though a burst may momentarily fill more.</p></div>

<h3>The W in WRED: weighted by drop precedence</h3>
<p>WRED keeps a <b>different profile per precedence or DSCP value</b>. The idea comes from the AF classes: AF21, AF22 and AF23 are the same class with <b>increasing drop precedence</b>. Give AF23 a lower minimum threshold, and in a congested queue AF23 packets start dying first, AF22 next and AF21 last. So WRED not only drops early, it chooses the less important packets to drop early.</p>
<table class="cmp"><tr><th>DSCP</th><th>Meaning</th><th>Example profile (min / max / denominator)</th></tr>
<tr><td>AF21</td><td>Low drop precedence</td><td>32 / 40 / 10</td></tr>
<tr><td>AF22</td><td>Medium</td><td>28 / 40 / 10</td></tr>
<tr><td>AF23</td><td>High: dropped first</td><td>24 / 40 / 10</td></tr>
</table>

<h3>Configuration</h3>
<pre class="code"><span class="c">! Precedence-based WRED (the default flavour of random-detect)</span>
policy-map WAN-OUT
 class class-default
  fair-queue
  random-detect
<span class="c">! DSCP-based WRED in the TCP classes, with the default profiles</span>
 class ERP-Q
  bandwidth percent 40
  random-detect dscp-based
 class BKP-Q
  bandwidth percent 30
  random-detect dscp-based
<span class="c">! Real IOS XE also lets you tune one DSCP: min, max, denominator</span>
<span class="c">!   random-detect dscp af23 24 40 10</span>
<span class="c">!   random-detect exponential-weighting-constant 9</span></pre>
<p>Rules: WRED goes in classes that carry <b>TCP</b>, and never in the priority class of an LLQ. Voice is UDP and does not slow down on loss, so early drops would only damage calls; a priority queue must not drop early. A class that already has <code>bandwidth</code> can use WRED and then drops according to the profile instead of pure tail drop. Modern deployments may also enable <b>ECN</b> (<code>random-detect ecn</code>), where the router marks packets as congested instead of dropping them if both TCP ends support it.</p>

<h3>Reading it in the simulator</h3>
<p>The simulator accepts <code>random-detect</code> and <code>random-detect dscp-based</code> and shows the WRED lines in <code>show policy-map interface</code>:</p>
<pre class="out">    Class-map: BKP-Q (match-any)
      112500 packets, 22500000 bytes
      Match: dscp af11 (10)
      Queueing
      queue limit 64 packets
      (queue depth/total drops/no-buffer drops) 0/30020/0
      bandwidth 30% (3000 kbps)
      <span class="hl">Exp-weight-constant: 9 (1/512)</span>
      <span class="hl">Mean queue depth: 0 packets</span></pre>
<div class="note"><p><b>In the simulator.</b> Per-DSCP thresholds (<code>random-detect dscp af23 24 40 10</code>) are not accepted, there is no table of thresholds and drop probabilities, the mean queue depth stays at 0, and the drop counters still come from the bandwidth model, not from random early drops. The lab therefore checks that you place WRED correctly (TCP classes yes, priority class no) and that the policy still works under load. Real routers print a table with one row per DSCP showing transmitted, random drops, tail drops, minimum and maximum thresholds and the mark probability.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) WRED in the voice class. (2) Expecting WRED to help UDP streams. (3) Setting the minimum threshold higher than the queue can ever reach, so WRED never acts. (4) Forgetting that tuned thresholds must be smaller than the queue limit of the class.</p></div>

<div class="exam"><p><b>Exam trap.</b> "What problem does WRED solve?" TCP global synchronisation caused by tail drop. "Which packets does WRED drop first?" Those with a higher drop precedence, such as AF23 before AF21. "What happens above the maximum threshold?" All packets are dropped, as in tail drop.</p></div>

<div class="scn"><h4>The sawtooth on the campus backup link</h4><p>The monitoring graph of the Pune WAN showed the traffic jumping between 10 Mbps and 4 Mbps every few seconds, even though twenty students' laptops were sending backups all evening. The queue counters showed bursts of tail drops, after which every TCP flow reduced its rate together. The engineer enabled <code>random-detect dscp-based</code> in the backup and ERP classes. The graph flattened to a steady 9 Mbps, queue delay fell, and the total backup time became shorter even though the circuit had not changed.</p><p><b>Lesson:</b> dropping a few packets early can raise total throughput, because TCP flows no longer collapse together.</p></div>

<div class="iv"><p class="q">"What is global synchronisation and how does WRED prevent it?"</p><p>When a queue tail-drops, many TCP flows lose packets at once and all halve their windows together, then all grow together, so the link oscillates between overloaded and under-used. WRED drops random packets early, with a probability that rises between a minimum and a maximum threshold on the average queue, so flows slow down at different times. Mention that it helps TCP, not UDP, that thresholds depend on DSCP, and that it is not used in the priority class.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tail drop makes TCP flows back off together (global synchronisation); RED/WRED drops a few packets early and at random.</li>
<li>WRED uses the average queue size, a minimum and maximum threshold and a mark probability denominator.</li>
<li>Different DSCP values get different profiles, so higher drop precedence (AF23) is dropped first.</li>
<li>Configure random-detect or random-detect dscp-based in TCP classes, never in the priority class.</li>
<li>The simulator shows the WRED lines but does not model thresholds or random drops.</li>
</ul></div>
`,hi:`
<p>CBWFQ aur LLQ tay karte hain ki <i>kise</i> serve kiya jaaye. <b>Weighted Random Early Detection (WRED)</b> tay karta hai ki <i>kaun se packets, aur kab, drop hon</i>, taaki full queue TCP ko zaroorat se zyada nuksaan na pahunchaye. Yeh bhi bandwidth paida nahi karta; yeh sharing ko smooth banata hai aur queues ko chhota rakhta hai.</p>

<h3>Pehle, loss mein TCP kaise behave karta hai</h3>
<p><b>TCP</b> web pages, file copy aur zyadatar business applications ka protocol hai. Yeh data window mein bhejta hai aur dheere-dheere window badhata hai (<b>slow start</b>, phir dheemi growth) jab tak koi packet kho na jaaye. TCP loss ko signal maanta hai ki network bhar gaya hai aur <b>apna sending rate aadha kar deta hai</b>, phir dobara badhta hai. UDP par voice alag behave karti hai: packet khone par woh dheemi nahi hoti, isliye WRED TCP ke liye kaam ka hai aur UDP ke liye bekaar.</p>

<h3>Problem: tail drop aur global synchronisation</h3>
<p>Plain tail drop ke saath queue overflow hone tak bhari rehti hai. Us pal <b>kai TCP flows ek saath packets khote hain</b>. Sab ek saath rate aadha karte hain, link achanak kam use hone lagta hai, phir sab ek saath badhte hain jab tak queue phir overflow na ho. Nateeja ek sawtooth hai: link overloaded aur aadha khali ke beech jhoolta hai, aur average use kharab rehta hai. Ise <b>global synchronisation</b> kehte hain. Jo traffic policeman road ko bharne deta hai aur phir sab ke liye band kar deta hai, wahi asar paida karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Tail drop sawtooth versus WRED smooth rate">
<text x="160" y="18" text-anchor="middle" class="svg-ink" font-size="13">Tail drop: sab flows ek saath peeche hat-te hain</text>
<path d="M20 170 V30 M20 170 H300" stroke="#64748b" stroke-width="1.5" fill="none"/>
<polyline points="20,150 70,90 110,60 112,130 150,100 190,60 192,130 230,100 270,62 272,130" fill="none" stroke="#dc2626" stroke-width="2.5"/>
<line x1="20" y1="60" x2="300" y2="60" stroke="#94a3b8" stroke-dasharray="4 4"/><text x="296" y="54" text-anchor="end" class="svg-muted" font-size="11">link full</text>
<text x="480" y="18" text-anchor="middle" class="svg-ink" font-size="13">WRED: flows ek-ek karke peeche hat-te hain</text>
<path d="M340 170 V30 M340 170 H620" stroke="#64748b" stroke-width="1.5" fill="none"/>
<polyline points="340,150 390,90 430,72 470,80 510,70 550,76 590,70 620,72" fill="none" stroke="#16a34a" stroke-width="2.5"/>
<line x1="340" y1="60" x2="620" y2="60" stroke="#94a3b8" stroke-dasharray="4 4"/>
<text x="160" y="192" text-anchor="middle" class="svg-muted" font-size="11">time</text><text x="480" y="192" text-anchor="middle" class="svg-muted" font-size="11">time</text>
</svg><p class="cap">Kai TCP flows ka total sending rate. WRED use link rate ke paas rakhta hai, jhoolne nahi deta.</p></div>

<h3>RED: kuch packets pehle hi aur random drop karo</h3>
<p><b>Random Early Detection (RED)</b> queue bharne se <i>pehle</i> hi packets drop karna shuru karta hai, chhoti probability ke saath jo queue badhne par badhti hai. Kyunki drop hone wale packets random flows ke hote hain, ek samay mein sirf kuch flows dheeme hote hain, baaki chalte rehte hain. RED teen settings aur ek measurement use karta hai:</p>
<ul>
<li><b>Average queue size.</b> RED instant queue par react nahi karta, jo har burst ke saath uchhalti hai. Yeh smoothed value use karta hai, ek exponentially weighted moving average. <b>Exponential weighting constant</b> (default 9, yaani weight 1/512) tay karta hai ki average asli queue ko kitni dheere follow kare.</li>
<li><b>Minimum threshold.</b> Isse neeche kuch drop nahi hota.</li>
<li><b>Maximum threshold.</b> Isse upar har packet drop hota hai, tail drop ki tarah.</li>
<li><b>Mark probability denominator.</b> Dono thresholds ke beech drop probability 0 se 1 divided by is number tak linearly badhti hai. Denominator 10 ka matlab maximum threshold par maximum 1 in 10, yaani 10 percent.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="RED drop probability curve">
<path d="M70 190 V25 M70 190 H600" stroke="#64748b" stroke-width="1.5" fill="none"/>
<polyline points="70,190 250,190 450,150 450,40 590,40" fill="none" stroke="#2563eb" stroke-width="3"/>
<line x1="250" y1="190" x2="250" y2="205" stroke="#64748b"/><line x1="450" y1="190" x2="450" y2="205" stroke="#64748b"/>
<text x="250" y="217" text-anchor="middle" class="svg-ink" font-size="12">min 20</text><text x="450" y="217" text-anchor="middle" class="svg-ink" font-size="12">max 40</text>
<text x="62" y="44" text-anchor="end" class="svg-ink" font-size="12">100%</text><text x="62" y="154" text-anchor="end" class="svg-ink" font-size="12">10%</text><text x="62" y="194" text-anchor="end" class="svg-ink" font-size="12">0</text>
<text x="160" y="170" text-anchor="middle" class="svg-muted" font-size="12">no drops</text><text x="350" y="150" text-anchor="middle" class="svg-accent" font-size="12">random early drops</text><text x="530" y="30" text-anchor="middle" class="svg-muted" font-size="12">drop all</text>
<text x="335" y="12" text-anchor="middle" class="svg-ink" font-size="12">average queue (packets) ke mukable drop probability</text>
</svg><p class="cap">Example profile: minimum 20, maximum 40, denominator 10.</p></div>

<div class="eg"><p><b>Worked example.</b> Minimum 20, maximum 40 aur denominator 10 ke saath average queue 30 packets hai. Yeh thresholds ke theek beech hai, isliye drop probability (30 - 20) / (40 - 20) x (1/10) = 0.5 x 0.1 = <b>5 percent</b> hai. Average 35 par yeh (15 / 20) x 0.1 = 7.5 percent hai. 41 packets par har packet drop hota hai. Agar average 18 hai, to koi packet drop nahi hota chahe burst kuch pal ke liye zyada bhar de.</p></div>

<h3>WRED ka W: drop precedence ke hisaab se weighted</h3>
<p>WRED <b>har precedence ya DSCP value ke liye alag profile</b> rakhta hai. Idea AF classes se aata hai: AF21, AF22 aur AF23 ek hi class hain jinki <b>drop precedence badhti jaati hai</b>. AF23 ko kam minimum threshold do, aur congested queue mein AF23 packets pehle marenge, phir AF22, aur AF21 sabse baad mein. Isliye WRED sirf jaldi drop nahi karta, kam zaroori packets ko pehle drop karne ke liye chunta bhi hai.</p>
<table class="cmp"><tr><th>DSCP</th><th>Matlab</th><th>Example profile (min / max / denominator)</th></tr>
<tr><td>AF21</td><td>Low drop precedence</td><td>32 / 40 / 10</td></tr>
<tr><td>AF22</td><td>Medium</td><td>28 / 40 / 10</td></tr>
<tr><td>AF23</td><td>High: sabse pehle drop</td><td>24 / 40 / 10</td></tr>
</table>

<h3>Configuration</h3>
<pre class="code"><span class="c">! Precedence-based WRED (random-detect ka default roop)</span>
policy-map WAN-OUT
 class class-default
  fair-queue
  random-detect
<span class="c">! TCP classes mein DSCP-based WRED, default profiles ke saath</span>
 class ERP-Q
  bandwidth percent 40
  random-detect dscp-based
 class BKP-Q
  bandwidth percent 30
  random-detect dscp-based
<span class="c">! Asli IOS XE mein ek DSCP tune bhi kar sakte ho: min, max, denominator</span>
<span class="c">!   random-detect dscp af23 24 40 10</span>
<span class="c">!   random-detect exponential-weighting-constant 9</span></pre>
<p>Niyam: WRED un classes mein jaata hai jo <b>TCP</b> le jaati hain, aur LLQ ki priority class mein kabhi nahi. Voice UDP hai aur loss par dheemi nahi hoti, isliye early drops sirf calls bigaadte; priority queue ko early drop nahi karna chahiye. Jis class mein <code>bandwidth</code> pehle se hai woh WRED use kar sakti hai aur phir pure tail drop ki jagah profile ke hisaab se drop karti hai. Modern deployments <b>ECN</b> (<code>random-detect ecn</code>) bhi on kar sakte hain, jahan agar dono TCP ends support karte hon to router packets ko drop karne ki jagah congested mark karta hai.</p>

<h3>Simulator mein padhna</h3>
<p>Simulator <code>random-detect</code> aur <code>random-detect dscp-based</code> accept karta hai aur <code>show policy-map interface</code> mein WRED lines dikhata hai:</p>
<pre class="out">    Class-map: BKP-Q (match-any)
      112500 packets, 22500000 bytes
      Match: dscp af11 (10)
      Queueing
      queue limit 64 packets
      (queue depth/total drops/no-buffer drops) 0/30020/0
      bandwidth 30% (3000 kbps)
      <span class="hl">Exp-weight-constant: 9 (1/512)</span>
      <span class="hl">Mean queue depth: 0 packets</span></pre>
<div class="note"><p><b>Simulator mein.</b> Per-DSCP thresholds (<code>random-detect dscp af23 24 40 10</code>) accept nahi hote, thresholds aur drop probabilities ki table nahi hai, mean queue depth 0 rehti hai, aur drop counters ab bhi bandwidth model se aate hain, random early drops se nahi. Isliye lab check karti hai ki aap WRED sahi jagah lagate ho (TCP classes mein haan, priority class mein nahi) aur load mein policy phir bhi kaam karti hai. Asli routers ek table chhaapte hain jisme har DSCP ki ek row hoti hai: transmitted, random drops, tail drops, minimum aur maximum thresholds aur mark probability.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Voice class mein WRED. (2) UDP streams ko WRED se madad ki ummeed. (3) Minimum threshold ko itna bada rakhna ki queue wahan kabhi pahunche hi nahi, aur WRED kabhi chale hi nahi. (4) Bhool jaana ki tuned thresholds class ki queue limit se chhote hone chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> "WRED kaun si problem solve karta hai?" Tail drop se hone wali TCP global synchronisation. "WRED kaun se packets pehle drop karta hai?" Jinki drop precedence zyada ho, jaise AF21 se pehle AF23. "Maximum threshold se upar kya hota hai?" Sab packets drop hote hain, tail drop ki tarah.</p></div>

<div class="scn"><h4>Campus backup link par sawtooth</h4><p>Pune WAN ke monitoring graph mein traffic har kuch second mein 10 Mbps aur 4 Mbps ke beech kood raha tha, jabki bees students ke laptops poori shaam backup bhej rahe the. Queue counters mein tail drops ke bursts the, jiske baad har TCP flow ek saath apna rate ghatata tha. Engineer ne backup aur ERP classes mein <code>random-detect dscp-based</code> on kiya. Graph sthir 9 Mbps par samtal ho gaya, queue delay ghati, aur circuit badla nahi tha phir bhi total backup time chhota ho gaya.</p><p><b>Lesson:</b> kuch packets pehle hi drop karne se total throughput badh sakta hai, kyunki TCP flows ek saath collapse nahi karte.</p></div>

<div class="iv"><p class="q">"Global synchronisation kya hai aur WRED ise kaise rokta hai?"</p><p>Jab queue tail-drop karti hai, kai TCP flows ek saath packets khote hain aur sab apni windows ek saath aadhi karte hain, phir sab ek saath badhte hain, isliye link overloaded aur under-used ke beech jhoolta hai. WRED random packets pehle hi drop karta hai, average queue par minimum aur maximum threshold ke beech badhti probability ke saath, isliye flows alag-alag samay par dheeme hote hain. Yeh bhi bolo ki yeh TCP ko madad karta hai, UDP ko nahi, thresholds DSCP par nirbhar karte hain, aur yeh priority class mein use nahi hota.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tail drop TCP flows ko ek saath peeche hataata hai (global synchronisation); RED/WRED kuch packets pehle hi aur random drop karta hai.</li>
<li>WRED average queue size, minimum aur maximum threshold aur mark probability denominator use karta hai.</li>
<li>Alag DSCP values ko alag profiles milte hain, isliye zyada drop precedence (AF23) pehle drop hoti hai.</li>
<li>TCP classes mein random-detect ya random-detect dscp-based lagao, priority class mein kabhi nahi.</li>
<li>Simulator WRED lines dikhata hai lekin thresholds ya random drops model nahi karta.</li>
</ul></div>
`}};export{e as default};