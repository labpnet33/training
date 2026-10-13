var e={id:`congestion-avoidance`,h:{en:`Congestion avoidance: tail drop, RED and WRED`,hi:`Congestion avoidance: tail drop, RED aur WRED`},body:{en:`
<p>A popular restaurant has a waiting area with 20 chairs. When all chairs are taken, the host turns away <b>everyone</b> who arrives, and all those groups walk off at once, go somewhere else, and the restaurant is suddenly half empty. A smarter host starts politely suggesting another time to a few walk-in guests once 12 chairs are taken, more often at 16, and only refuses everyone when the room is truly full. The restaurant stays busy but never overflows. The first host is <b>tail drop</b>; the second is <b>RED</b>.</p>

<h3>The problem with tail drop</h3>
<p>Every queue has a limit (for example 64 packets). With <b>tail drop</b>, packets are accepted until the queue is full, then <b>every</b> new arrival is dropped. For TCP this causes three problems:</p>
<dl class="terms">
<dt>TCP global synchronization</dt><dd>Many TCP flows lose packets in the same instant, all halve their window together, the link goes under-used, then all ramp up together and overflow again. The link oscillates between congested and idle.</dd>
<dt>TCP starvation</dt><dd>While TCP flows back off, aggressive non-responsive UDP flows keep sending and take over the queue.</dd>
<dt>Constant high delay</dt><dd>A queue that is always nearly full adds maximum delay to every packet, including the ones that are not dropped.</dd>
</dl>
<p>Tools that drop <b>before</b> the queue is full are called <b>congestion avoidance</b>, in contrast with queuing, which is congestion management.</p>

<h3>RED: random early detection</h3>
<p><b>RED</b> watches the <b>average</b> queue depth (smoothed over time, so short bursts do not trigger it) and drops a few random packets early, which makes only some TCP senders slow down. It has three parameters:</p>
<ul>
<li><b>Minimum threshold</b>: below it, nothing is dropped.</li>
<li><b>Maximum threshold</b>: between min and max, the drop probability rises linearly from 0 up to 1 in <b>MPD</b> (mark probability denominator). MPD 10 means 1 in 10 packets at the maximum threshold.</li>
<li>Above the maximum threshold: <b>full drop</b>, everything new is dropped, exactly like tail drop.</li>
</ul>
<p>The average depth uses an <b>exponential weighting constant</b>, default 9, meaning each new sample counts for 1/512 of the average.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="WRED drop probability">
<line x1="70" y1="200" x2="600" y2="200" stroke="#64748b" stroke-width="2"/><line x1="70" y1="200" x2="70" y2="30" stroke="#64748b" stroke-width="2"/>
<text x="335" y="232" text-anchor="middle" class="svg-muted" font-size="12">average queue depth (packets)</text>
<text x="30" y="110" text-anchor="middle" class="svg-muted" font-size="12" transform="rotate(-90 30 110)">drop probability</text>
<text x="60" y="44" text-anchor="end" class="svg-ink" font-size="12">100%</text><text x="60" y="164" text-anchor="end" class="svg-ink" font-size="12">10%</text>
<line x1="70" y1="160" x2="450" y2="160" stroke="#64748b" stroke-width="1" stroke-dasharray="3 4"/>
<polyline points="70,200 250,200 450,160 450,40 600,40" fill="none" stroke="#64748b" stroke-width="3"/>
<polyline points="70,200 190,200 450,160" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="250" y="216" text-anchor="middle" class="svg-ink" font-size="12">32</text><text x="190" y="216" text-anchor="middle" class="svg-ink" font-size="12">24</text><text x="450" y="216" text-anchor="middle" class="svg-ink" font-size="12">40</text>
<text x="300" y="140" class="svg-accent" font-size="12">AF11: min 32</text><text x="170" y="185" class="svg-accent" font-size="12">AF13: min 24</text>
<text x="520" y="30" text-anchor="middle" class="svg-accent" font-size="12">full drop</text>
</svg><p class="cap">WRED profiles in one queue: AF13 (dashed) starts dropping at 24 packets, AF11 (solid) at 32; both reach 1 in 10 at 40, then full drop.</p></div>

<h3>WRED: weighted RED</h3>
<p><b>WRED</b> keeps a separate RED profile per marking, so inside one queue lower-priority packets are dropped earlier. This is exactly what the AF <b>drop precedence</b> means: AF13 gets a lower minimum threshold than AF12, which gets a lower one than AF11. Cisco WRED can be based on IP Precedence (the default) or on DSCP.</p>
<pre class="code">policy-map WAN-OUT
 class AF11-Q
  bandwidth 2000
  random-detect dscp-based
  random-detect dscp af11 32 40 10
  random-detect dscp af12 28 40 10
  random-detect dscp af13 24 40 10</pre>
<p>The syntax is <code>random-detect dscp VALUE MIN MAX MPD</code>. Add <code>random-detect ecn</code> and, when both TCP endpoints support <b>ECN</b>, WRED sets the ECN bits to signal congestion instead of dropping the packet.</p>

<div class="eg"><p><b>Worked example.</b> Average queue depth is 30 packets in AF11-Q. AF11 (min 32): below its minimum, so 0% drop. AF12 (min 28, max 40, MPD 10): (30 - 28) / (40 - 28) × 1/10 = 2/12 × 0.1 = about 1.7%. AF13 (min 24): (30 - 24) / (40 - 24) × 0.1 = 6/16 × 0.1 = 3.75%. If the average ever passes 40, all three are dropped. This is why a policer that re-marks excess backup traffic from AF11 to AF13 makes the excess the first to go when the WAN gets busy.</p></div>

<pre class="out">R1# show policy-map interface GigabitEthernet0/0 output
  ...
    Class-map: AF11-Q (match-any)
      ...
      Exp-weight-constant: 9 (1/512)
<span class="hl">      Mean queue depth: 30 packets</span>
      dscp     Transmitted      Random drop      Tail drop    Minimum Maximum Mark
                pkts/bytes       pkts/bytes       pkts/bytes    thresh  thresh  prob
      af11    20012/28016800        0/0              0/0          32      40  1/10
      af12     5210/7294000        61/85400          0/0          28      40  1/10
<span class="hl">      af13     3120/4368000       140/196000         0/0          24      40  1/10</span></pre>

<div class="warn"><p><b>Common mistake.</b> Applying WRED to the voice class. Voice is UDP: it does not slow down when a packet is dropped, so early drops only damage calls. Use WRED on TCP-heavy data classes (AF and class-default), never on EF.</p></div>

<div class="exam"><p><b>Exam trap.</b> Below the minimum threshold nothing is dropped; between min and max the probability rises to 1/MPD; above the maximum everything is dropped (full drop). Cisco WRED defaults to IP Precedence unless you configure <code>dscp-based</code>. RED targets TCP global synchronization.</p></div>

<div class="scn"><h4>The sawtooth WAN graph</h4><p>A data-centre replication link showed a sawtooth utilisation graph: 100% for a few seconds, then 55%, then back to 100%, and file copies took far longer than the bandwidth suggested. <code>show policy-map interface</code> showed only tail drops in class-default, arriving in bursts. Dozens of replication TCP sessions were hitting tail drop at the same moment and backing off together. Enabling <code>random-detect dscp-based</code> in the data classes smoothed utilisation to a steady 90 to 95% and cut copy times by a third.</p><p><b>Lesson:</b> synchronized tail drops waste bandwidth; WRED spreads the drops out so TCP flows back off one at a time.</p></div>

<div class="iv"><p class="q">"What problem does WRED solve and how does it work?"</p><p>Strong answer: tail drop discards all arrivals when a queue is full, which causes TCP global synchronization, starvation by UDP, and high constant delay. WRED monitors average queue depth and randomly drops packets between a minimum and maximum threshold, with probability up to 1/MPD, so only some TCP flows slow down. Weighted means separate thresholds per IP Precedence or DSCP, so AF13 drops before AF11. Do not use it on voice. Mention ECN marking as an alternative to dropping.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tail drop causes TCP global synchronization, starvation and constant high delay.</li>
<li>RED drops randomly between min and max thresholds based on average depth, up to 1/MPD.</li>
<li>WRED uses different thresholds per IPP or DSCP; higher AF drop precedence drops first.</li>
<li>Use WRED on TCP data classes, not on EF voice; ECN can mark instead of drop.</li>
<li>Syntax: <code>random-detect dscp-based</code> then <code>random-detect dscp VALUE MIN MAX MPD</code>.</li>
</ul></div>
`,hi:`
<p>Ek popular restaurant mein 20 kursiyon wala waiting area hai. Jab saari kursiyan bhar jaati hain, host aane wale <b>har kisi</b> ko lauta deta hai, aur woh saare groups ek saath chale jaate hain, kahin aur jaate hain, aur restaurant achanak aadha khaali ho jaata hai. Ek samajhdaar host 12 kursiyan bharte hi kuch walk-in guests ko pyaar se doosra samay suggest karna shuru karta hai, 16 par zyada baar, aur sirf tab sabko mana karta hai jab kamra sach mein full ho. Restaurant busy rehta hai par kabhi overflow nahi hota. Pehla host <b>tail drop</b> hai; doosra <b>RED</b>.</p>

<h3>Tail drop ki problem</h3>
<p>Har queue ki ek limit hoti hai (jaise 64 packets). <b>Tail drop</b> mein queue full hone tak packets accept hote hain, phir <b>har</b> naya aane wala drop hota hai. TCP ke liye isse teen problems hoti hain:</p>
<dl class="terms">
<dt>TCP global synchronization</dt><dd>Kai TCP flows ek hi pal mein packets khote hain, sab ek saath apni window aadhi karte hain, link kam use hota hai, phir sab ek saath badhte hain aur dobara overflow karte hain. Link congested aur idle ke beech jhoolta rehta hai.</dd>
<dt>TCP starvation</dt><dd>Jab TCP flows peeche hat-te hain, aggressive non-responsive UDP flows bhejte rehte hain aur queue par kabza kar lete hain.</dd>
<dt>Lagatar zyada delay</dt><dd>Hamesha lagbhag full queue har packet mein maximum delay jodti hai, un packets mein bhi jo drop nahi hote.</dd>
</dl>
<p>Jo tools queue full hone se <b>pehle</b> drop karte hain unhe <b>congestion avoidance</b> kehte hain, queuing ke ulat, jo congestion management hai.</p>

<h3>RED: random early detection</h3>
<p><b>RED</b> <b>average</b> queue depth dekhta hai (samay ke saath smooth kiya hua, taaki chhote bursts ise trigger na karein) aur kuch random packets jaldi drop karta hai, jisse sirf kuch TCP senders dheeme hote hain. Iske teen parameters hain:</p>
<ul>
<li><b>Minimum threshold</b>: iske neeche kuch drop nahi hota.</li>
<li><b>Maximum threshold</b>: min aur max ke beech drop probability 0 se linearly badhkar <b>MPD</b> (mark probability denominator) mein 1 tak jaati hai. MPD 10 matlab maximum threshold par 10 mein 1 packet.</li>
<li>Maximum threshold ke upar: <b>full drop</b>, har naya packet drop, bilkul tail drop jaisa.</li>
</ul>
<p>Average depth ek <b>exponential weighting constant</b> use karti hai, default 9, matlab har naya sample average ka 1/512 hissa ginta hai.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="WRED drop probability">
<line x1="70" y1="200" x2="600" y2="200" stroke="#64748b" stroke-width="2"/><line x1="70" y1="200" x2="70" y2="30" stroke="#64748b" stroke-width="2"/>
<text x="335" y="232" text-anchor="middle" class="svg-muted" font-size="12">average queue depth (packets)</text>
<text x="30" y="110" text-anchor="middle" class="svg-muted" font-size="12" transform="rotate(-90 30 110)">drop probability</text>
<text x="60" y="44" text-anchor="end" class="svg-ink" font-size="12">100%</text><text x="60" y="164" text-anchor="end" class="svg-ink" font-size="12">10%</text>
<line x1="70" y1="160" x2="450" y2="160" stroke="#64748b" stroke-width="1" stroke-dasharray="3 4"/>
<polyline points="70,200 250,200 450,160 450,40 600,40" fill="none" stroke="#64748b" stroke-width="3"/>
<polyline points="70,200 190,200 450,160" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="250" y="216" text-anchor="middle" class="svg-ink" font-size="12">32</text><text x="190" y="216" text-anchor="middle" class="svg-ink" font-size="12">24</text><text x="450" y="216" text-anchor="middle" class="svg-ink" font-size="12">40</text>
<text x="300" y="140" class="svg-accent" font-size="12">AF11: min 32</text><text x="170" y="185" class="svg-accent" font-size="12">AF13: min 24</text>
<text x="520" y="30" text-anchor="middle" class="svg-accent" font-size="12">full drop</text>
</svg><p class="cap">Ek queue mein WRED profiles: AF13 (dashed) 24 packets par drop shuru karta hai, AF11 (solid) 32 par; dono 40 par 10 mein 1 tak pahunchte hain, phir full drop.</p></div>

<h3>WRED: weighted RED</h3>
<p><b>WRED</b> har marking ka alag RED profile rakhta hai, isliye ek hi queue ke andar kam-priority packets pehle drop hote hain. AF <b>drop precedence</b> ka yahi matlab hai: AF13 ko AF12 se kam minimum threshold milta hai, aur AF12 ko AF11 se kam. Cisco WRED IP Precedence (default) ya DSCP par based ho sakta hai.</p>
<pre class="code">policy-map WAN-OUT
 class AF11-Q
  bandwidth 2000
  random-detect dscp-based
  random-detect dscp af11 32 40 10
  random-detect dscp af12 28 40 10
  random-detect dscp af13 24 40 10</pre>
<p>Syntax hai <code>random-detect dscp VALUE MIN MAX MPD</code>. <code>random-detect ecn</code> jodo aur, jab dono TCP endpoints <b>ECN</b> support karein, WRED packet drop karne ki jagah congestion signal karne ke liye ECN bits set karta hai.</p>

<div class="eg"><p><b>Worked example.</b> AF11-Q mein average queue depth 30 packets hai. AF11 (min 32): apne minimum ke neeche, isliye 0% drop. AF12 (min 28, max 40, MPD 10): (30 - 28) / (40 - 28) × 1/10 = 2/12 × 0.1 = lagbhag 1.7%. AF13 (min 24): (30 - 24) / (40 - 24) × 0.1 = 6/16 × 0.1 = 3.75%. Agar average kabhi 40 paar kare, to teeno drop hote hain. Isiliye jo policer extra backup traffic ko AF11 se AF13 re-mark karta hai, woh WAN busy hone par us extra ko sabse pehle girne wala bana deta hai.</p></div>

<pre class="out">R1# show policy-map interface GigabitEthernet0/0 output
  ...
    Class-map: AF11-Q (match-any)
      ...
      Exp-weight-constant: 9 (1/512)
<span class="hl">      Mean queue depth: 30 packets</span>
      dscp     Transmitted      Random drop      Tail drop    Minimum Maximum Mark
                pkts/bytes       pkts/bytes       pkts/bytes    thresh  thresh  prob
      af11    20012/28016800        0/0              0/0          32      40  1/10
      af12     5210/7294000        61/85400          0/0          28      40  1/10
<span class="hl">      af13     3120/4368000       140/196000         0/0          24      40  1/10</span></pre>

<div class="warn"><p><b>Common galti.</b> Voice class par WRED lagana. Voice UDP hai: packet drop hone par yeh dheemi nahi hoti, isliye early drops sirf calls ko nuksaan karte hain. WRED TCP-heavy data classes (AF aur class-default) par use karo, EF par kabhi nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Minimum threshold ke neeche kuch drop nahi hota; min aur max ke beech probability 1/MPD tak badhti hai; maximum ke upar sab drop hota hai (full drop). Cisco WRED default mein IP Precedence use karta hai jab tak aap <code>dscp-based</code> configure na karo. RED TCP global synchronization ko target karta hai.</p></div>

<div class="scn"><h4>Sawtooth WAN graph</h4><p>Ek data-centre replication link ka utilisation graph sawtooth jaisa tha: kuch seconds 100%, phir 55%, phir wapas 100%, aur file copies bandwidth ke hisaab se kahin zyada samay le rahi thi. <code>show policy-map interface</code> mein class-default mein sirf tail drops the, bursts mein aate hue. Darjanon replication TCP sessions ek hi pal mein tail drop se takra rahe the aur ek saath peeche hat rahe the. Data classes mein <code>random-detect dscp-based</code> enable karne se utilisation steady 90 se 95% par smooth ho gaya aur copy time ek tihaai kam hua.</p><p><b>Seekh:</b> synchronized tail drops bandwidth barbaad karte hain; WRED drops ko phaila deta hai taaki TCP flows ek ek karke peeche hatein.</p></div>

<div class="iv"><p class="q">"WRED kaunsi problem solve karta hai aur kaise kaam karta hai?"</p><p>Strong answer: tail drop queue full hone par saare aane wale packets phenk deta hai, jisse TCP global synchronization, UDP se starvation, aur lagatar zyada delay hota hai. WRED average queue depth monitor karta hai aur minimum aur maximum threshold ke beech random packets drop karta hai, probability 1/MPD tak, taaki sirf kuch TCP flows dheeme hon. Weighted ka matlab har IP Precedence ya DSCP ke alag thresholds, isliye AF13, AF11 se pehle drop hota hai. Ise voice par use mat karo. Drop ki jagah ECN marking ka alternative bhi batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tail drop TCP global synchronization, starvation aur lagatar zyada delay paida karta hai.</li>
<li>RED average depth ke basis par min aur max thresholds ke beech random drop karta hai, 1/MPD tak.</li>
<li>WRED har IPP ya DSCP ke alag thresholds use karta hai; zyada AF drop precedence pehle drop hota hai.</li>
<li>WRED TCP data classes par use karo, EF voice par nahi; ECN drop ki jagah mark kar sakta hai.</li>
<li>Syntax: <code>random-detect dscp-based</code> phir <code>random-detect dscp VALUE MIN MAX MPD</code>.</li>
</ul></div>
`}};export{e as default};