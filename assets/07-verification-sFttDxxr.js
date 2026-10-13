var e={id:`verify`,h:{en:`Verification: reading show policy-map interface`,hi:`Verification: show policy-map interface padhna`},body:{en:`
<p>A queuing policy that nobody has verified is only a hope. This chapter teaches the one command that shows what the router is really doing, <code>show policy-map interface</code>, and a reliable way of reading it: four questions, always in the same order. The same method works on every QoS problem you will meet.</p>

<h3>Think of a hospital chart</h3>
<p>A doctor does not guess. The chart says how many patients came in (matched packets), how many were treated (output), how many were turned away (drops), and how long the waiting room is (queue). The numbers do not lie, and a nurse who reads them in order finds the problem in a minute. The policy-map output is the chart for the interface.</p>

<h3>The commands</h3>
<table class="cmp"><tr><th>Command</th><th>What it shows</th></tr>
<tr><td><code>show policy-map interface GigabitEthernet0/0</code></td><td>Counters of every class, in both directions where a policy is attached</td></tr>
<tr><td><code>show policy-map interface GigabitEthernet0/0 output</code></td><td>The same, only for the output policy</td></tr>
<tr><td><code>show policy-map WAN-OUT</code></td><td>The configuration of the policy (no counters)</td></tr>
<tr><td><code>show class-map</code></td><td>What each class matches</td></tr>
<tr><td><code>show running-config | section policy-map</code></td><td>The policy exactly as configured</td></tr>
<tr><td><code>clear counters</code></td><td>Resets the counters so that a new test starts from zero</td></tr>
</table>
<p>If <code>show policy-map interface</code> prints nothing for an interface, <b>no policy is attached there</b>, which is the first thing to check in Chapter 8.</p>

<h3>Anatomy of one class block</h3>
<p>Here is a real simulator output after a 20 second test with a 400 kbps EF call, 3000 kbps AF21 and 9000 kbps AF11 on the 10 Mbps WAN (WRED lines come from Chapter 5):</p>
<pre class="out">  Service-policy output: WAN-OUT

    Class-map: VOICE-Q (match-any)
      5000 packets, 1000000 bytes
      <span class="hl">30 second offered rate 333333 bps, drop rate 0000 bps</span>
      Match: dscp ef (46)
        5000 packets, 1000000 bytes
        30 second rate 333333 bps
      <span class="hl">Priority: 1000 kbps, burst bytes 25000, b/w exceed drops: 0</span>
      Queueing
      queue limit 512 packets
      <span class="hl">(queue depth/total drops/no-buffer drops) 0/0/0</span>
      (pkts output/bytes output) 5000/1000000

    Class-map: BKP-Q (match-any)
      112500 packets, 22500000 bytes
      30 second offered rate 7500000 bps, drop rate 2001333 bps
      Match: dscp af11 (10)
      Queueing
      queue limit 64 packets
      <span class="hl">(queue depth/total drops/no-buffer drops) 0/30020/0</span>
      (pkts output/bytes output) 82480/16496000
      bandwidth 30% (3000 kbps)
      Exp-weight-constant: 9 (1/512)
      Mean queue depth: 0 packets</pre>
<dl class="terms">
<dt>packets, bytes</dt><dd>Everything that matched the class since the policy was attached or the counters were cleared. This is the proof that classification works.</dd>
<dt>30 second offered rate / drop rate</dt><dd>Average load of the class and of its drops over the last 30 seconds (the default load interval). A flow that ran for only 20 seconds shows a lower figure than it really sent, because the average includes quiet time. 333,333 bps here is 400 kbps sent for 20 of the 24 seconds observed.</dd>
<dt>Match</dt><dd>The criterion of the class-map and how many packets matched each criterion.</dd>
<dt>Priority ... b/w exceed drops</dt><dd>Only in a priority class: the rate, the policer burst and packets dropped by the policer because the class exceeded its rate during congestion.</dd>
<dt>queue limit</dt><dd>The maximum length of the class queue.</dd>
<dt>(queue depth / total drops / no-buffer drops)</dt><dd>Packets waiting now, packets dropped by this class since the start, and drops caused by lack of buffers. The middle number is the one you read most.</dd>
<dt>(pkts output / bytes output)</dt><dd>What was actually transmitted. Matched minus output equals the drops.</dd>
<dt>bandwidth 30% (3000 kbps)</dt><dd>The configured guarantee, converted to kbps.</dd>
</dl>

<h3>Four questions, in this order</h3>
<ol>
<li><b>Is the policy attached, in the right direction?</b> The block heading must say <code>Service-policy output</code> on the congested interface.</li>
<li><b>Is the traffic in the class I expect?</b> Look at matched packets. A class with 0 packets while its traffic is running means classification or marking is wrong.</li>
<li><b>Where are the drops?</b> Compare total drops per class. Drops in the class that should be protected mean its guarantee is too small, or it is misclassified.</li>
<li><b>Do the numbers fit the design?</b> Check the offered rate against the guarantee, the priority rate against the voice load, and the sum of guarantees against the interface rate.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> In the output above, VOICE-Q matched 5000 packets (400 kbps of 200-byte packets is 250 packets per second, times 20 s) and output 5000: zero drops, so the call crossed the congested link untouched. BKP-Q matched 112,500 packets, output 82,480 and dropped 30,020: the sum 82,480 + 30,020 = 112,500 confirms that the numbers are consistent. The backup was the class that waited, exactly what the policy intended. The ERP, not shown, had 0 drops because it offered less than its guarantee.</p></div>

<h3>Testing properly</h3>
<p>Verification needs <b>load</b>. On an idle link no class drops anything and every policy looks perfect. Build a repeatable test: clear the counters, start the protected flows and the flood together, let them run for 20 to 30 seconds, then read the counters. On the lab hosts, <code>traffic 10.40.0.100 udp/20000 400 20 dscp ef</code> sends a 400 kbps EF call for 20 seconds and <code>traffic show</code> prints sent, delivered and loss percent, so you can compare the end-to-end result with the router's counters.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Testing on an idle link. (2) Reading the packets of a policy attached in the wrong direction. (3) Comparing the 30 second rate with the traffic rate without remembering the averaging window. (4) Forgetting to clear counters before a test, then reading old numbers.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which command shows per-class drops?" show policy-map interface, not show policy-map. "Which counter proves the priority policer is dropping?" b/w exceed drops (on many platforms called exceeded or conformed/exceeded under the priority class).</p></div>

<div class="note"><p><b>Junos note.</b> Junos expresses the same ideas with forwarding classes, schedulers and scheduler-maps, applied to the physical interface. The mapping: bandwidth percent is <code>transmit-rate percent</code>, priority is <code>priority strict-high</code>, queue-limit is <code>buffer-size</code>, and random-detect is a drop profile referenced from the scheduler. Verification uses <code>show class-of-service interface ge-0/0/0</code>, <code>show class-of-service scheduler-map SM-WAN</code> and, for the counters, <code>show interfaces queue ge-0/0/0</code>, which prints queued, transmitted, tail-dropped and RED-dropped packets for each queue.</p></div>
<pre class="code">set class-of-service schedulers S-VOICE transmit-rate percent 10
set class-of-service schedulers S-VOICE priority strict-high
set class-of-service schedulers S-ERP transmit-rate percent 35
set class-of-service schedulers S-BE transmit-rate remainder
set class-of-service drop-profiles DP-TCP interpolate fill-level [ 30 60 ] drop-probability [ 0 20 ]
set class-of-service schedulers S-ERP drop-profile-map loss-priority high protocol tcp drop-profile DP-TCP
set class-of-service scheduler-maps SM-WAN forwarding-class expedited-forwarding scheduler S-VOICE
set class-of-service scheduler-maps SM-WAN forwarding-class assured-forwarding scheduler S-ERP
set class-of-service scheduler-maps SM-WAN forwarding-class best-effort scheduler S-BE
set class-of-service interfaces ge-0/0/0 scheduler-map SM-WAN</pre>

<div class="scn"><h4>The class with zero packets</h4><p>At the Pune campus a new policy was attached and the complaint continued: ERP still slow during backups. The engineer ran the load test and read the output. ERP-Q showed 0 packets while class-default showed 31,000. The ERP traffic was reaching the WAN, but it was matched by no class. A look at a packet capture showed it left the application server marked AF31, not AF21 as the policy expected. After matching AF31 as well, ERP-Q started counting and the slow-ERP tickets stopped.</p><p><b>Lesson:</b> read the matched packets first. A guarantee is useless for traffic that never enters the class.</p></div>

<div class="iv"><p class="q">"How do you verify that a QoS policy works?"</p><p>I generate load so the link is congested, then read show policy-map interface in order: policy attached outbound on the right interface, traffic matched in the expected class, drops located in the right class, and the numbers consistent with the design, for example priority rate versus voice load. I compare it with end-to-end loss and delay from the test hosts, and clear counters between tests.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>show policy-map interface is the main tool: per class it shows matched, offered and drop rates, queue and drop counters.</li>
<li>Read in order: attached and direction, matched packets, where drops are, do the numbers fit.</li>
<li>Matched packets minus output packets equals drops.</li>
<li>Verification needs load; an idle link hides every mistake.</li>
<li>Junos: scheduler-map and show interfaces queue give the same information.</li>
</ul></div>
`,hi:`
<p>Jis queuing policy ko kisi ne verify nahi kiya woh sirf ek ummeed hai. Yeh chapter woh ek command sikhata hai jo dikhata hai ki router asal mein kya kar raha hai, <code>show policy-map interface</code>, aur use padhne ka bharosemand tareeka: chaar sawal, hamesha usi order mein. Yahi tareeka har QoS problem par kaam karta hai jo aap milenge.</p>

<h3>Hospital chart ki tarah socho</h3>
<p>Doctor andaza nahi lagata. Chart batata hai kitne patients aaye (matched packets), kitno ka ilaaj hua (output), kitne wapas bheje gaye (drops), aur waiting room kitna lamba hai (queue). Numbers jhooth nahi bolte, aur jo nurse unhe order mein padhti hai woh ek minute mein problem dhoondh leti hai. Policy-map output interface ka chart hai.</p>

<h3>Commands</h3>
<table class="cmp"><tr><th>Command</th><th>Kya dikhata hai</th></tr>
<tr><td><code>show policy-map interface GigabitEthernet0/0</code></td><td>Har class ke counters, dono directions mein jahan policy lagi ho</td></tr>
<tr><td><code>show policy-map interface GigabitEthernet0/0 output</code></td><td>Wahi, sirf output policy ke liye</td></tr>
<tr><td><code>show policy-map WAN-OUT</code></td><td>Policy ka configuration (counters nahi)</td></tr>
<tr><td><code>show class-map</code></td><td>Har class kya match karti hai</td></tr>
<tr><td><code>show running-config | section policy-map</code></td><td>Policy bilkul waisi jaisi configure hui</td></tr>
<tr><td><code>clear counters</code></td><td>Counters reset karta hai taaki naya test zero se shuru ho</td></tr>
</table>
<p>Agar <code>show policy-map interface</code> kisi interface ke liye kuch nahi chhaapta, to <b>wahan koi policy attach nahi hai</b>, jo Chapter 8 mein sabse pehle check karni hai.</p>

<h3>Ek class block ki anatomy</h3>
<p>Yeh 10 Mbps WAN par 400 kbps EF call, 3000 kbps AF21 aur 9000 kbps AF11 ke 20 second ke test ke baad asli simulator output hai (WRED lines Chapter 5 se aati hain):</p>
<pre class="out">  Service-policy output: WAN-OUT

    Class-map: VOICE-Q (match-any)
      5000 packets, 1000000 bytes
      <span class="hl">30 second offered rate 333333 bps, drop rate 0000 bps</span>
      Match: dscp ef (46)
        5000 packets, 1000000 bytes
        30 second rate 333333 bps
      <span class="hl">Priority: 1000 kbps, burst bytes 25000, b/w exceed drops: 0</span>
      Queueing
      queue limit 512 packets
      <span class="hl">(queue depth/total drops/no-buffer drops) 0/0/0</span>
      (pkts output/bytes output) 5000/1000000

    Class-map: BKP-Q (match-any)
      112500 packets, 22500000 bytes
      30 second offered rate 7500000 bps, drop rate 2001333 bps
      Match: dscp af11 (10)
      Queueing
      queue limit 64 packets
      <span class="hl">(queue depth/total drops/no-buffer drops) 0/30020/0</span>
      (pkts output/bytes output) 82480/16496000
      bandwidth 30% (3000 kbps)
      Exp-weight-constant: 9 (1/512)
      Mean queue depth: 0 packets</pre>
<dl class="terms">
<dt>packets, bytes</dt><dd>Jo kuch class se match hua, policy attach hone ya counters clear hone ke baad se. Yeh saboot hai ki classification kaam kar rahi hai.</dd>
<dt>30 second offered rate / drop rate</dt><dd>Class ka aur uske drops ka pichhle 30 second ka average load (default load interval). Jo flow sirf 20 second chala woh asal bheje se kam figure dikhata hai, kyunki average mein shaant waqt shamil hota hai. Yahan 333,333 bps matlab 400 kbps jo dekhe gaye 24 second mein se 20 second tak bheja.</dd>
<dt>Match</dt><dd>Class-map ka criterion aur har criterion par kitne packets match hue.</dd>
<dt>Priority ... b/w exceed drops</dt><dd>Sirf priority class mein: rate, policer burst aur woh packets jo policer ne drop kiye kyunki class ne congestion ke dauran apna rate paar kiya.</dd>
<dt>queue limit</dt><dd>Class queue ki maximum length.</dd>
<dt>(queue depth / total drops / no-buffer drops)</dt><dd>Abhi intezaar kar rahe packets, is class ke shuruaat se drop hue packets, aur buffers ki kami se hue drops. Beech wala number sabse zyada padha jaata hai.</dd>
<dt>(pkts output / bytes output)</dt><dd>Asal mein transmit kya hua. Matched minus output = drops.</dd>
<dt>bandwidth 30% (3000 kbps)</dt><dd>Configured guarantee, kbps mein convert hui.</dd>
</dl>

<h3>Chaar sawal, isi order mein</h3>
<ol>
<li><b>Kya policy attach hai, sahi direction mein?</b> Block ki heading congested interface par <code>Service-policy output</code> kehni chahiye.</li>
<li><b>Kya traffic us class mein hai jo main chahta hoon?</b> Matched packets dekho. Jab uska traffic chal raha ho aur class mein 0 packets hon, to classification ya marking galat hai.</li>
<li><b>Drops kahan hain?</b> Har class ke total drops compare karo. Jo class protected honi chahiye usme drops matlab uski guarantee chhoti hai, ya woh galat classify hui.</li>
<li><b>Kya numbers design mein fit hote hain?</b> Offered rate ko guarantee se, priority rate ko voice load se, aur guarantees ke sum ko interface rate se check karo.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Upar ke output mein VOICE-Q ne 5000 packets match kiye (200-byte packets ka 400 kbps matlab 250 packets per second, guna 20 s) aur output 5000: zero drops, yaani call congested link se bina chhue guzar gayi. BKP-Q ne 112,500 packets match kiye, output 82,480 aur drop 30,020: sum 82,480 + 30,020 = 112,500 confirm karta hai ki numbers consistent hain. Backup woh class thi jo ruki, bilkul jaisa policy ka irada tha. ERP, jo dikhaya nahi gaya, mein 0 drops the kyunki usne apni guarantee se kam offer kiya.</p></div>

<h3>Sahi tarah se test karna</h3>
<p>Verification ko <b>load</b> chahiye. Khali link par koi class kuch drop nahi karti aur har policy perfect dikhti hai. Dohraya ja sakne wala test banao: counters clear karo, protected flows aur flood ek saath shuru karo, 20 se 30 second chalne do, phir counters padho. Lab hosts par <code>traffic 10.40.0.100 udp/20000 400 20 dscp ef</code> 20 second ke liye 400 kbps EF call bhejta hai aur <code>traffic show</code> sent, delivered aur loss percent chhaapta hai, isliye aap end-to-end result ko router ke counters se compare kar sakte ho.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Khali link par test karna. (2) Galat direction mein lagi policy ke packets padhna. (3) 30 second rate ko traffic rate se compare karna bina averaging window yaad rakhe. (4) Test se pehle counters clear karna bhool jaana, phir purane numbers padhna.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaun si command per-class drops dikhati hai?" show policy-map interface, show policy-map nahi. "Kaun sa counter sabit karta hai ki priority policer drop kar raha hai?" b/w exceed drops (kai platforms par priority class ke neeche exceeded ya conformed/exceeded kehlata hai).</p></div>

<div class="note"><p><b>Junos note.</b> Junos wahi ideas forwarding classes, schedulers aur scheduler-maps se express karta hai, jo physical interface par lagte hain. Mapping: bandwidth percent hai <code>transmit-rate percent</code>, priority hai <code>priority strict-high</code>, queue-limit hai <code>buffer-size</code>, aur random-detect ek drop profile hai jise scheduler se reference kiya jaata hai. Verification <code>show class-of-service interface ge-0/0/0</code>, <code>show class-of-service scheduler-map SM-WAN</code> aur counters ke liye <code>show interfaces queue ge-0/0/0</code> se hoti hai, jo har queue ke queued, transmitted, tail-dropped aur RED-dropped packets chhaapta hai.</p></div>
<pre class="code">set class-of-service schedulers S-VOICE transmit-rate percent 10
set class-of-service schedulers S-VOICE priority strict-high
set class-of-service schedulers S-ERP transmit-rate percent 35
set class-of-service schedulers S-BE transmit-rate remainder
set class-of-service drop-profiles DP-TCP interpolate fill-level [ 30 60 ] drop-probability [ 0 20 ]
set class-of-service schedulers S-ERP drop-profile-map loss-priority high protocol tcp drop-profile DP-TCP
set class-of-service scheduler-maps SM-WAN forwarding-class expedited-forwarding scheduler S-VOICE
set class-of-service scheduler-maps SM-WAN forwarding-class assured-forwarding scheduler S-ERP
set class-of-service scheduler-maps SM-WAN forwarding-class best-effort scheduler S-BE
set class-of-service interfaces ge-0/0/0 scheduler-map SM-WAN</pre>

<div class="scn"><h4>Woh class jisme zero packets the</h4><p>Pune campus mein nayi policy attach hui aur shikayat jaari rahi: backup ke dauran ERP abhi bhi dheema. Engineer ne load test chalaya aur output padha. ERP-Q mein 0 packets the jabki class-default mein 31,000. ERP traffic WAN tak pahunch raha tha, lekin kisi class se match nahi hua. Packet capture se pata chala ki woh application server se AF31 mark hokar nikalta tha, AF21 nahi jaisa policy ne socha tha. AF31 bhi match karne ke baad ERP-Q ginne lagi aur slow-ERP tickets band ho gaye.</p><p><b>Lesson:</b> pehle matched packets padho. Jo traffic class mein kabhi aata hi nahi uske liye guarantee bekaar hai.</p></div>

<div class="iv"><p class="q">"QoS policy kaam karti hai yeh aap kaise verify karte ho?"</p><p>Main load generate karta hoon taaki link congested ho, phir show policy-map interface ko order mein padhta hoon: sahi interface par policy outbound attach hai, traffic expected class mein match hua, drops sahi class mein hain, aur numbers design se consistent hain, jaise priority rate versus voice load. Main test hosts ke end-to-end loss aur delay se compare karta hoon, aur tests ke beech counters clear karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>show policy-map interface mukhya tool hai: har class ke liye matched, offered aur drop rates, queue aur drop counters dikhata hai.</li>
<li>Order mein padho: attached aur direction, matched packets, drops kahan hain, kya numbers fit hote hain.</li>
<li>Matched packets minus output packets = drops.</li>
<li>Verification ko load chahiye; khali link har galti chhupa deta hai.</li>
<li>Junos: scheduler-map aur show interfaces queue wahi jaankari dete hain.</li>
</ul></div>
`}};export{e as default};