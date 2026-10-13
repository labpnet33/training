var e={id:`queuing`,h:{en:`Queuing: FIFO, WFQ, CBWFQ and LLQ`,hi:`Queuing: FIFO, WFQ, CBWFQ aur LLQ`},body:{en:`
<p>A bank has one cashier and a long line at month end. It can serve people strictly in arrival order. It can let quick customers slip ahead of someone depositing a sack of coins. It can promise the business counter at least one customer in every four. Or it can let a VIP jump straight to the front every time, but only up to a fixed number of VIPs per hour. Those four ideas are <b>FIFO</b>, <b>WFQ</b>, <b>CBWFQ</b> and <b>LLQ</b>. Queuing is also called <b>congestion management</b>.</p>

<h3>When queuing happens at all</h3>
<p>Every interface has a small hardware queue, the <b>transmit ring (tx-ring)</b>, which is always FIFO. Packets go straight into it while there is room. Only when the tx-ring is full do packets wait in the <b>software queues</b> that your policy controls. So a queuing policy only acts during congestion, which is exactly when you need it. That is also why queuing is configured <b>outbound</b>: packets only wait on the way out.</p>

<h3>FIFO</h3>
<p><b>First in, first out</b>: one queue, served in arrival order, with <b>tail drop</b> when it is full. A voice packet that arrives behind 60 backup packets waits for all of them. On a 10 Mbps link a 1500-byte packet takes 1.2 ms to serialize, so 60 of them add 72 ms of delay and, worse, a varying amount: jitter.</p>

<h3>WFQ</h3>
<p><b>Weighted Fair Queuing</b> automatically builds one queue per flow (by addresses, ports and protocol) and shares the link fairly between flows, weighted by IP Precedence. Low-volume flows such as a voice call or a Telnet session get served quickly, and one elephant flow cannot starve the rest. WFQ needs no classes, but it also gives no guarantees and no real priority. Today you meet it as <code>fair-queue</code> inside class-default.</p>

<h3>CBWFQ</h3>
<p><b>Class-Based Weighted Fair Queuing</b> lets you define classes with MQC and give each one a <b>minimum bandwidth guarantee during congestion</b>:</p>
<ul>
<li><code>bandwidth 2000</code>: at least 2000 kbps.</li>
<li><code>bandwidth percent 20</code>: at least 20% of the interface (or parent shaper) rate.</li>
<li><code>bandwidth remaining percent 30</code>: 30% of what is left after the priority class.</li>
</ul>
<p>A guarantee is a floor, not a ceiling. If other classes are idle, a class may use more. Unused guarantees are shared among the classes that need them. All classes in one policy must use the same unit (kbps or percent). A guaranteed <b>share</b> still means waiting your turn, so CBWFQ alone is not enough for voice.</p>

<h3>LLQ</h3>
<p><b>Low Latency Queuing</b> is CBWFQ plus one <b>strict-priority queue</b>, configured with <code>priority</code>. The scheduler always empties the priority queue first, so voice sees almost no queuing delay and jitter. To stop the priority queue from starving everyone else, it has a built-in <b>implicit policer</b>: during congestion, traffic above the configured priority rate is dropped (counted as "b/w exceed drops"). When the link is not congested, the priority class can use spare bandwidth.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="LLQ scheduler">
<rect x="20" y="30" width="170" height="40" rx="6" fill="#bbf7d0"/><text x="105" y="55" text-anchor="middle" class="svg-ink" font-size="13">EF-Q priority 1000</text>
<rect x="20" y="95" width="170" height="40" rx="6" fill="#bae6fd"/><text x="105" y="120" text-anchor="middle" class="svg-ink" font-size="13">AF11-Q bandwidth 2000</text>
<rect x="20" y="160" width="170" height="40" rx="6" fill="#e2e8f0"/><text x="105" y="185" text-anchor="middle" class="svg-ink" font-size="13">class-default fair-queue</text>
<rect x="290" y="80" width="120" height="70" rx="10" fill="#fde68a"/><text x="350" y="110" text-anchor="middle" class="svg-ink" font-size="13">scheduler</text><text x="350" y="128" text-anchor="middle" class="svg-muted" font-size="12">EF first</text>
<line x1="190" y1="50" x2="290" y2="95" stroke="#64748b" stroke-width="3"/><line x1="190" y1="115" x2="290" y2="115" stroke="#64748b" stroke-width="2"/><line x1="190" y1="180" x2="290" y2="135" stroke="#64748b" stroke-width="1.5"/>
<rect x="450" y="95" width="90" height="40" rx="6" fill="#fed7aa"/><text x="495" y="120" text-anchor="middle" class="svg-ink" font-size="13">tx-ring</text>
<line x1="410" y1="115" x2="450" y2="115" stroke="#64748b" stroke-width="2"/><line x1="540" y1="115" x2="630" y2="115" stroke="#64748b" stroke-width="2"/><text x="585" y="105" text-anchor="middle" class="svg-accent" font-size="12">Gi0/0 10M</text>
<text x="240" y="30" class="svg-accent" font-size="12">always served first</text>
</svg><p class="cap">WAN-OUT on R1: a strict-priority queue for voice, a guaranteed queue for bulk, and fair queuing for the rest, feeding the FIFO tx-ring.</p></div>

<h3>Configuring LLQ in the lab</h3>
<pre class="code">class-map match-any EF-Q
 match dscp ef
class-map match-any AF11-Q
 match dscp af11
policy-map WAN-OUT
 class EF-Q
  priority 1000          <span class="c">! LLQ, strict priority, 1 Mbps</span>
 class AF11-Q
  bandwidth 2000         <span class="c">! CBWFQ, at least 2 Mbps</span>
 class class-default
  fair-queue             <span class="c">! WFQ between the remaining flows</span>
interface GigabitEthernet0/0
 service-policy output WAN-OUT</pre>
<p>WAN-OUT matches on <b>DSCP</b>, not on ACLs. It trusts the marking that MARK-IN wrote at the LAN edge: classify once, then read the label.</p>

<pre class="out">R1# show policy-map interface GigabitEthernet0/0 output
 GigabitEthernet0/0

  Service-policy output: WAN-OUT

    Class-map: EF-Q (match-any)
      7500 packets, 1500000 bytes
      30 second offered rate 400000 bps, drop rate 0000 bps
      Match: dscp ef (46)
        7500 packets, 1500000 bytes
        30 second rate 400000 bps
<span class="hl">      Priority: 1000 kbps, burst bytes 25000, b/w exceed drops: 0</span>
      Queueing
      queue limit 512 packets
<span class="hl">      (queue depth/total drops/no-buffer drops) 0/0/0</span>
      (pkts output/bytes output) 7500/1500000</pre>

<div class="eg"><p><b>Worked example: the lab under load.</b> The WAN is 10 Mbps. Offered: voice 400 kbps (EF), backup policed to 3 Mbps (AF11), a bulk download of 8 Mbps (class-default). Total 11.4 Mbps, so about 1.4 Mbps must wait or be dropped. The scheduler sends all 400 kbps of EF first; it is well under the 1000 kbps priority rate, so nothing is policed. AF11 is guaranteed 2 Mbps and gets a share of the leftover 7.6 Mbps, enough for its 3 Mbps. Class-default gets what remains and absorbs the drops. Result: voice 0% loss, class-default drops, which is exactly what task 4 and 5 of lab 1 ask you to prove.</p></div>

<div class="warn"><p><b>Common mistake.</b> Sizing the priority class too small. If 12 G.711 calls (about 1 Mbps at Layer 3, more with Layer 2 overhead) share <code>priority 1000</code>, the implicit policer drops voice during congestion and every call suffers. Size LLQ for peak calls including overhead, and keep it at or below about one third of the link.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>bandwidth</code> is a minimum guarantee, not a limit. <code>priority</code> is a guarantee <b>and</b> a limit during congestion. The two commands cannot be in the same class. Queuing only works outbound.</p></div>

<div class="scn"><h4>Video in the priority queue</h4><p>A company moved video conferencing into the same LLQ class as voice to "make video better". Soon both voice and video degraded whenever a large meeting started. <code>show policy-map interface</code> showed thousands of b/w exceed drops in the priority class. Bursty video overran the priority rate and the implicit policer dropped voice and video packets alike. The fix was a separate video class with <code>bandwidth percent</code> (AF41) and voice alone in the priority queue.</p><p><b>Lesson:</b> keep the priority queue for smooth, predictable, small traffic. Watch b/w exceed drops.</p></div>

<div class="iv"><p class="q">"What is the difference between CBWFQ and LLQ, and why does LLQ need a policer?"</p><p>Strong answer: CBWFQ gives each class a minimum bandwidth share during congestion but classes still take turns, so delay varies. LLQ adds a strict-priority queue that is always served first, giving voice minimal delay and jitter. Because strict priority could starve other classes, LLQ polices the priority class to its configured rate during congestion; excess is dropped and shown as b/w exceed drops. Both are output-only.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Software queues only fill when the FIFO tx-ring is full, so queuing acts during congestion only.</li>
<li>FIFO: one queue; WFQ: automatic per-flow fairness; CBWFQ: per-class minimum guarantees.</li>
<li>LLQ = CBWFQ plus a strict-priority queue with an implicit policer during congestion.</li>
<li><code>bandwidth</code> is a floor; <code>priority</code> is a floor and a ceiling under congestion.</li>
<li>In the lab, WAN-OUT on Gi0/0 output gives EF priority 1000, AF11 bandwidth 2000, and fair-queue to class-default.</li>
</ul></div>
`,hi:`
<p>Ek bank mein ek hi cashier hai aur month end par lambi line hai. Woh logon ko sakhti se aane ke kram mein serve kar sakta hai. Woh jaldi wale customers ko sikkon ki bori jama karne wale se aage nikalne de sakta hai. Woh business counter ko har chaar mein kam se kam ek customer ka vaada kar sakta hai. Ya woh VIP ko har baar seedhe aage aane de sakta hai, par ek ghante mein ek fixed ginti tak hi. Yeh chaar ideas hain <b>FIFO</b>, <b>WFQ</b>, <b>CBWFQ</b> aur <b>LLQ</b>. Queuing ko <b>congestion management</b> bhi kehte hain.</p>

<h3>Queuing hoti kab hai</h3>
<p>Har interface ki ek chhoti hardware queue hoti hai, <b>transmit ring (tx-ring)</b>, jo hamesha FIFO hai. Jab tak jagah hai packets seedhe usmein jaate hain. Sirf jab tx-ring full hoti hai tab packets un <b>software queues</b> mein intezaar karte hain jo aapki policy control karti hai. Isliye queuing policy sirf congestion mein kaam karti hai, jo bilkul wahi samay hai jab aapko iski zaroorat hai. Isiliye queuing <b>outbound</b> configure hoti hai: packets sirf bahar jaate waqt intezaar karte hain.</p>

<h3>FIFO</h3>
<p><b>First in, first out</b>: ek queue, aane ke kram mein serve, full hone par <b>tail drop</b>. Jo voice packet 60 backup packets ke peeche aata hai woh sabka intezaar karta hai. 10 Mbps link par 1500-byte packet ko serialize hone mein 1.2 ms lagte hain, isliye 60 packets 72 ms delay jodte hain aur, usse bura, badalti hui maatra mein: jitter.</p>

<h3>WFQ</h3>
<p><b>Weighted Fair Queuing</b> apne aap har flow (addresses, ports aur protocol se) ki ek queue banata hai aur link ko flows ke beech barabar baantta hai, IP Precedence se weighted. Voice call ya Telnet session jaise low-volume flows jaldi serve hote hain, aur ek elephant flow baaki sabko bhookha nahi maar sakta. WFQ ko classes nahi chahiye, par yeh koi guarantee aur koi asli priority bhi nahi deta. Aaj aap ise class-default ke andar <code>fair-queue</code> ke roop mein dekhte ho.</p>

<h3>CBWFQ</h3>
<p><b>Class-Based Weighted Fair Queuing</b> aapko MQC se classes define karke har ek ko <b>congestion ke dauran minimum bandwidth guarantee</b> dene deta hai:</p>
<ul>
<li><code>bandwidth 2000</code>: kam se kam 2000 kbps.</li>
<li><code>bandwidth percent 20</code>: interface (ya parent shaper) rate ka kam se kam 20%.</li>
<li><code>bandwidth remaining percent 30</code>: priority class ke baad jo bacha uska 30%.</li>
</ul>
<p>Guarantee ek floor hai, ceiling nahi. Agar baaki classes idle hain, to class zyada use kar sakti hai. Unused guarantees un classes mein baant di jaati hain jinhe zaroorat hai. Ek policy ki saari classes ko same unit (kbps ya percent) use karna hota hai. Guaranteed <b>hissa</b> ka matlab phir bhi apni baari ka intezaar hai, isliye sirf CBWFQ voice ke liye kaafi nahi.</p>

<h3>LLQ</h3>
<p><b>Low Latency Queuing</b> CBWFQ plus ek <b>strict-priority queue</b> hai, jo <code>priority</code> se configure hoti hai. Scheduler hamesha pehle priority queue khaali karta hai, isliye voice ko lagbhag koi queuing delay aur jitter nahi dikhta. Priority queue baaki sabko bhookha na maar de, isliye ismein built-in <b>implicit policer</b> hota hai: congestion ke dauran configured priority rate se upar ka traffic drop hota hai ("b/w exceed drops" mein gina jaata hai). Jab link congested nahi hota, priority class bachi bandwidth use kar sakti hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="LLQ scheduler">
<rect x="20" y="30" width="170" height="40" rx="6" fill="#bbf7d0"/><text x="105" y="55" text-anchor="middle" class="svg-ink" font-size="13">EF-Q priority 1000</text>
<rect x="20" y="95" width="170" height="40" rx="6" fill="#bae6fd"/><text x="105" y="120" text-anchor="middle" class="svg-ink" font-size="13">AF11-Q bandwidth 2000</text>
<rect x="20" y="160" width="170" height="40" rx="6" fill="#e2e8f0"/><text x="105" y="185" text-anchor="middle" class="svg-ink" font-size="13">class-default fair-queue</text>
<rect x="290" y="80" width="120" height="70" rx="10" fill="#fde68a"/><text x="350" y="110" text-anchor="middle" class="svg-ink" font-size="13">scheduler</text><text x="350" y="128" text-anchor="middle" class="svg-muted" font-size="12">EF pehle</text>
<line x1="190" y1="50" x2="290" y2="95" stroke="#64748b" stroke-width="3"/><line x1="190" y1="115" x2="290" y2="115" stroke="#64748b" stroke-width="2"/><line x1="190" y1="180" x2="290" y2="135" stroke="#64748b" stroke-width="1.5"/>
<rect x="450" y="95" width="90" height="40" rx="6" fill="#fed7aa"/><text x="495" y="120" text-anchor="middle" class="svg-ink" font-size="13">tx-ring</text>
<line x1="410" y1="115" x2="450" y2="115" stroke="#64748b" stroke-width="2"/><line x1="540" y1="115" x2="630" y2="115" stroke="#64748b" stroke-width="2"/><text x="585" y="105" text-anchor="middle" class="svg-accent" font-size="12">Gi0/0 10M</text>
<text x="240" y="30" class="svg-accent" font-size="12">hamesha pehle serve</text>
</svg><p class="cap">R1 par WAN-OUT: voice ke liye strict-priority queue, bulk ke liye guaranteed queue, aur baaki ke liye fair queuing, jo FIFO tx-ring ko feed karti hain.</p></div>

<h3>Lab mein LLQ configure karna</h3>
<pre class="code">class-map match-any EF-Q
 match dscp ef
class-map match-any AF11-Q
 match dscp af11
policy-map WAN-OUT
 class EF-Q
  priority 1000          <span class="c">! LLQ, strict priority, 1 Mbps</span>
 class AF11-Q
  bandwidth 2000         <span class="c">! CBWFQ, kam se kam 2 Mbps</span>
 class class-default
  fair-queue             <span class="c">! baaki flows ke beech WFQ</span>
interface GigabitEthernet0/0
 service-policy output WAN-OUT</pre>
<p>WAN-OUT <b>DSCP</b> par match karti hai, ACLs par nahi. Yeh us marking par bharosa karti hai jo MARK-IN ne LAN edge par likhi: ek baar classify, phir label padho.</p>

<pre class="out">R1# show policy-map interface GigabitEthernet0/0 output
 GigabitEthernet0/0

  Service-policy output: WAN-OUT

    Class-map: EF-Q (match-any)
      7500 packets, 1500000 bytes
      30 second offered rate 400000 bps, drop rate 0000 bps
      Match: dscp ef (46)
        7500 packets, 1500000 bytes
        30 second rate 400000 bps
<span class="hl">      Priority: 1000 kbps, burst bytes 25000, b/w exceed drops: 0</span>
      Queueing
      queue limit 512 packets
<span class="hl">      (queue depth/total drops/no-buffer drops) 0/0/0</span>
      (pkts output/bytes output) 7500/1500000</pre>

<div class="eg"><p><b>Worked example: load mein lab.</b> WAN 10 Mbps hai. Offered: voice 400 kbps (EF), backup 3 Mbps par policed (AF11), 8 Mbps ka bulk download (class-default). Total 11.4 Mbps, isliye lagbhag 1.4 Mbps ko intezaar karna ya drop hona padega. Scheduler EF ke saare 400 kbps pehle bhejta hai; yeh 1000 kbps priority rate se kaafi kam hai, isliye kuch police nahi hota. AF11 ko 2 Mbps guaranteed hai aur bache 7.6 Mbps ka hissa milta hai, uske 3 Mbps ke liye kaafi. Class-default ko jo bacha woh milta hai aur drops wahi jhelti hai. Nateeja: voice 0% loss, class-default mein drops, bilkul wahi jo lab 1 ke task 4 aur 5 aapse sabit karwate hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Priority class ko bahut chhota size karna. Agar 12 G.711 calls (Layer 3 par lagbhag 1 Mbps, Layer 2 overhead ke saath zyada) <code>priority 1000</code> share karein, to implicit policer congestion mein voice drop karta hai aur har call kharab hoti hai. LLQ ko overhead samet peak calls ke liye size karo, aur ise link ke lagbhag ek tihaai ya usse kam rakho.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>bandwidth</code> minimum guarantee hai, limit nahi. <code>priority</code> congestion mein guarantee <b>aur</b> limit dono hai. Dono commands ek class mein nahi ho sakte. Queuing sirf outbound kaam karti hai.</p></div>

<div class="scn"><h4>Priority queue mein video</h4><p>Ek company ne "video behtar karne" ke liye video conferencing ko voice wali LLQ class mein daal diya. Jaldi hi jab bhi badi meeting shuru hoti, voice aur video dono kharab ho jaate. <code>show policy-map interface</code> mein priority class mein hazaaron b/w exceed drops the. Bursty video priority rate se aage nikal gaya aur implicit policer ne voice aur video dono ke packets drop kiye. Fix tha video ke liye alag class <code>bandwidth percent</code> (AF41) ke saath aur priority queue mein sirf voice.</p><p><b>Seekh:</b> priority queue ko smooth, predictable, chhote traffic ke liye rakho. b/w exceed drops par nazar rakho.</p></div>

<div class="iv"><p class="q">"CBWFQ aur LLQ mein kya fark hai, aur LLQ ko policer kyun chahiye?"</p><p>Strong answer: CBWFQ congestion ke dauran har class ko minimum bandwidth hissa deta hai par classes phir bhi baari leti hain, isliye delay badalta hai. LLQ ek strict-priority queue jodta hai jo hamesha pehle serve hoti hai, jisse voice ko sabse kam delay aur jitter milta hai. Kyunki strict priority baaki classes ko bhookha maar sakti hai, LLQ congestion ke dauran priority class ko uske configured rate par police karta hai; extra drop hota hai aur b/w exceed drops mein dikhta hai. Dono sirf output hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Software queues tabhi bharti hain jab FIFO tx-ring full ho, isliye queuing sirf congestion mein kaam karti hai.</li>
<li>FIFO: ek queue; WFQ: apne aap per-flow fairness; CBWFQ: per-class minimum guarantees.</li>
<li>LLQ = CBWFQ plus strict-priority queue, congestion mein implicit policer ke saath.</li>
<li><code>bandwidth</code> floor hai; <code>priority</code> congestion mein floor aur ceiling dono.</li>
<li>Lab mein Gi0/0 output par WAN-OUT EF ko priority 1000, AF11 ko bandwidth 2000, aur class-default ko fair-queue deti hai.</li>
</ul></div>
`}};export{e as default};