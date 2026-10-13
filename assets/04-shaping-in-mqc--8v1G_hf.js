var e={id:`shaping`,h:{en:`Shaping in MQC: shape average and the 1 Gbps handoff`,hi:`MQC mein shaping: shape average aur 1 Gbps handoff`},body:{en:`
<p>A shaper is a policer that has learned manners: when a packet does not fit the bucket it does not throw the packet away, it waits. This chapter shows the command, the rate you should choose, and the traps that make a correct-looking shaper useless.</p>

<h3>The command</h3>
<pre class="code">policy-map WAN-SHAPE
 class class-default
  shape average 19000000
interface GigabitEthernet0/0
 service-policy output WAN-SHAPE</pre>
<p><code>shape average</code> takes the CIR in bits per second. Two optional numbers follow it, Bc and Be in <b>bits</b>; leave them out. A shaper works only in the <b>output</b> direction, because only an outgoing packet can be held back. There is also <code>shape peak</code> (a rate above the average, used rarely) and <code>shape average percent N</code>, which we discuss in the traps below.</p>
<p>Why <code>class class-default</code>? The shaper acts on everything that leaves the interface, so the class that matches everything is the natural place. Shaping a single named class works too and is used to cap one kind of traffic, for example guest Wi-Fi at 5 Mbps, while the rest goes untouched.</p>

<h3>What a shaper does to the traffic</h3>
<p>A 1 Gbps port that is shaped to 19 Mbps still transmits each frame at 1 Gbps. The shaper controls <i>when</i> frames go. Every Tc (4 ms by default) it refills a bucket of Bc bits (76,000 bits at 19 Mbps), sends what the bucket allows, and holds the rest in a queue for the next interval. To the provider the result is a train of short bursts averaging 19 Mbps, which is below the 20 Mbps policer and therefore never dropped.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Shaper holding packets in a queue">
<rect x="10" y="60" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="70" y="88" text-anchor="middle" class="svg-ink" font-size="13">Input</text><text x="70" y="106" text-anchor="middle" class="svg-muted" font-size="12">60 Mbps burst</text>
<rect x="190" y="50" width="170" height="80" rx="8" fill="#fde68a"/><text x="275" y="76" text-anchor="middle" class="svg-ink" font-size="13">Shaper queue</text>
<rect x="200" y="90" width="22" height="26" fill="#f97316"/><rect x="226" y="90" width="22" height="26" fill="#f97316"/><rect x="252" y="90" width="22" height="26" fill="#f97316"/><rect x="278" y="90" width="22" height="26" fill="#f97316"/><rect x="304" y="90" width="22" height="26" fill="#f97316"/>
<rect x="420" y="60" width="130" height="60" rx="8" fill="#bae6fd"/><text x="485" y="88" text-anchor="middle" class="svg-ink" font-size="13">Output</text><text x="485" y="106" text-anchor="middle" class="svg-muted" font-size="12">19 Mbps average</text>
<line x1="130" y1="90" x2="190" y2="90" stroke="#64748b" stroke-width="2"/><line x1="360" y1="90" x2="420" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="275" y="160" text-anchor="middle" class="svg-ink" font-size="12">Bc bits leave every Tc; the rest waits (and, if the queue is full, is dropped)</text>
</svg><p class="cap">Shaping converts a loss problem into a delay problem. The size of the queue then decides how big the delay can get (chapter 6).</p></div>

<h3>Reading the output</h3>
<pre class="out">R1#show policy-map interface GigabitEthernet0/0 output
  Service-policy output: WAN-SHAPE
    Class-map: class-default (match-any)
      613136 packets, 131190400 bytes
      30 second offered rate 69968213 bps, drop rate 0000 bps
      Match: any
      Queueing
      queue limit 64 packets
      (queue depth/total drops/no-buffer drops) 0/0/0
      (pkts output/bytes output) 150681/38699400
      <span class="hl">shape (average) cir 19000000, bc 76000, be 76000</span>
      <span class="hl">target shape rate 19000000</span></pre>
<p>Look for four things: the <b>target shape rate</b> (is it what you meant?), the <b>queue limit</b> (how deep can the wait be?), the <b>total drops</b> in the middle of the three queue counters (are packets being tail-dropped?), and <b>pkts output</b> (how much really left). Note that Bc and Be are in bits: 76,000 bits is the 4 ms of 19 Mbps from chapter 2.</p>

<h3>Choosing the rate</h3>
<p>Shape <b>a little below</b> the CIR, typically 90 to 95 percent, for three reasons.</p>
<ol>
<li><b>Overhead.</b> Your router may count the IP packet; the provider counts the whole Ethernet frame, 18 to 26 bytes more with header, FCS and perhaps a VLAN tag. For a 200-byte voice packet that is nearly 10 percent. If you shape at exactly the CIR, you send slightly more than the provider counts and its policer drops the extra.</li>
<li><b>Measurement jitter.</b> The provider averages over its own interval; bursts at the edge of that interval may look like excess.</li>
<li><b>Queue ownership.</b> Any queue at the provider is outside your control. A shaper below the CIR keeps the only queue where you can manage it.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> Contract 20 Mbps, frames of 218 bytes on the wire for 200-byte packets: factor 218/200 = 1.09. A shaper that counts only the IP packet and is set to 20 Mbps would put 21.8 Mbps on the wire. A shaper at 19 Mbps would put 20.7 Mbps: still slightly high for small packets. That is why 18 Mbps (90 percent) is safer on a voice-heavy link and 19 Mbps is enough where packets are large. Many IOS XE platforms count Layer 2 headers automatically; check your platform notes and verify against the provider counters.</p></div>

<h3>Traps</h3>
<div class="warn"><p><b>Common mistakes.</b> (1) <code>shape average percent 95</code> on a 1 Gbps handoff means 95 percent of the <i>port</i>, 950 Mbps, not of the contract. Use an absolute rate on handoffs. (2) Shaping at exactly the CIR. (3) Applying the shaper on the LAN interface or inbound: it must sit on the output of the port that faces the slow service. (4) Writing Bc in bytes: in <code>shape</code> it is in bits.</p></div>
<div class="exam"><p><b>Exam trap.</b> Shaping is output only; policing can be input or output. The shaper does not change DSCP and does not drop until its queue is full. <code>shape average</code> and <code>shape peak</code> differ only in the extra burst allowed.</p></div>
<div class="note"><p><b>Junos note.</b> On Junos the basic shaper is a rate on the interface or logical unit:</p>
<pre class="code">set class-of-service interfaces ge-0/0/0 shaping-rate 19m</pre>
<p>Hierarchical designs use a traffic-control-profile, covered in chapter 7. Junos can also include Layer 2 overhead in the calculation (<code>overhead-accounting</code> on platforms that support it).</p></div>

<div class="scn"><h4>Shaped at the CIR, still dropping</h4><p>The Pune branch buys 20 Mbps, so the engineer configures <code>shape average 20000000</code> and tests with a big file: it works. A week later phone calls crackle in the evening. Calls are made of small packets, 218 bytes on the wire, so the provider sees 9 percent more than the router counted. The provider policer drops the few percent above 20 Mbps and, with no priority, some of the drops are voice. Changing the shaper to 18 Mbps removes every drop, and the provider counter stays at zero.</p><p><b>Lesson:</b> shape for what the provider measures, not what your router prints. Confirm with the exceeded counter on the other side if you can see it, or with a test using small packets.</p></div>
<div class="iv"><p class="q">"At what rate do you configure a shaper for a 50 Mbps Ethernet service?"</p><p>A little below, around 90 to 95 percent, so 45 to 47 Mbps. The reasons: the provider counts Layer 2 overhead, which is a larger share for small packets; the provider measures over its own interval; and I want the only queue to be mine. Then I verify that the provider policer shows no exceeded packets under a test load.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>shape average BPS</code> in a class, applied with <code>service-policy output</code>.</li>
<li>The shaper sends Bc every Tc and queues the rest; Bc and Be are in bits.</li>
<li>Shape below the CIR to absorb Layer 2 overhead and measurement differences.</li>
<li>Use an absolute rate on a handoff; percent refers to the port speed.</li>
<li>Read the target shape rate, queue limit and total drops in <code>show policy-map interface</code>.</li>
</ul></div>
`,hi:`
<p>Shaper aisa policer hai jisne tameez seekh li hai: jab packet bucket mein fit nahi hota to woh use fenkta nahi, intezaar karata hai. Is chapter mein command, rate jo chunna chahiye, aur woh jaal dikhte hain jo sahi dikhne wale shaper ko bekaar bana dete hain.</p>

<h3>Command</h3>
<pre class="code">policy-map WAN-SHAPE
 class class-default
  shape average 19000000
interface GigabitEthernet0/0
 service-policy output WAN-SHAPE</pre>
<p><code>shape average</code> CIR ko bits per second mein leta hai. Uske baad do optional numbers aate hain, Bc aur Be <b>bits</b> mein; unhe chhod do. Shaper sirf <b>output</b> direction mein kaam karta hai, kyunki sirf bahar jaane wala packet roka ja sakta hai. <code>shape peak</code> bhi hai (average se upar ka rate, kam use hota hai) aur <code>shape average percent N</code>, jis par neeche traps mein baat karenge.</p>
<p><code>class class-default</code> kyun? Shaper interface se nikalne wali har cheez par kaam karta hai, isliye sab kuch match karne wali class swabhavik jagah hai. Ek named class ko shape karna bhi chalta hai aur ek kisam ke traffic ko cap karne ke liye hota hai, jaise guest Wi-Fi 5 Mbps par, jabki baaki untouched.</p>

<h3>Shaper traffic ke saath kya karta hai</h3>
<p>19 Mbps par shape kiya hua 1 Gbps port bhi har frame 1 Gbps par bhejta hai. Shaper tay karta hai ki frames <i>kab</i> jaayein. Har Tc (default 4 ms) mein woh Bc bits ka bucket bharta hai (19 Mbps par 76,000 bits), jo bucket allow kare woh bhejta hai, aur baaki ko agle interval ke liye queue mein rakhta hai. Provider ko nateeja chhote bursts ki train dikhti hai jiska average 19 Mbps hai, jo 20 Mbps policer se neeche hai aur isliye kabhi drop nahi hota.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Shaper queue mein packets rokta hua">
<rect x="10" y="60" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="70" y="88" text-anchor="middle" class="svg-ink" font-size="13">Input</text><text x="70" y="106" text-anchor="middle" class="svg-muted" font-size="12">60 Mbps burst</text>
<rect x="190" y="50" width="170" height="80" rx="8" fill="#fde68a"/><text x="275" y="76" text-anchor="middle" class="svg-ink" font-size="13">Shaper queue</text>
<rect x="200" y="90" width="22" height="26" fill="#f97316"/><rect x="226" y="90" width="22" height="26" fill="#f97316"/><rect x="252" y="90" width="22" height="26" fill="#f97316"/><rect x="278" y="90" width="22" height="26" fill="#f97316"/><rect x="304" y="90" width="22" height="26" fill="#f97316"/>
<rect x="420" y="60" width="130" height="60" rx="8" fill="#bae6fd"/><text x="485" y="88" text-anchor="middle" class="svg-ink" font-size="13">Output</text><text x="485" y="106" text-anchor="middle" class="svg-muted" font-size="12">19 Mbps average</text>
<line x1="130" y1="90" x2="190" y2="90" stroke="#64748b" stroke-width="2"/><line x1="360" y1="90" x2="420" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="275" y="160" text-anchor="middle" class="svg-ink" font-size="12">Har Tc mein Bc bits jaate hain; baaki ruka rehta hai (queue full ho to drop)</text>
</svg><p class="cap">Shaping loss ki problem ko delay ki problem bana deti hai. Queue ka size tay karta hai ki delay kitna bada ho sakta hai (chapter 6).</p></div>

<h3>Output padhna</h3>
<pre class="out">R1#show policy-map interface GigabitEthernet0/0 output
  Service-policy output: WAN-SHAPE
    Class-map: class-default (match-any)
      613136 packets, 131190400 bytes
      30 second offered rate 69968213 bps, drop rate 0000 bps
      Match: any
      Queueing
      queue limit 64 packets
      (queue depth/total drops/no-buffer drops) 0/0/0
      (pkts output/bytes output) 150681/38699400
      <span class="hl">shape (average) cir 19000000, bc 76000, be 76000</span>
      <span class="hl">target shape rate 19000000</span></pre>
<p>Chaar cheezein dekho: <b>target shape rate</b> (kya wahi hai jo socha tha?), <b>queue limit</b> (intezaar kitna gehra ho sakta hai?), teen queue counters ke beech wale <b>total drops</b> (kya packets tail-drop ho rahe hain?), aur <b>pkts output</b> (asal mein kitna nikla). Dhyan do ki Bc aur Be bits mein hain: 76,000 bits chapter 2 ke 19 Mbps ke 4 ms hain.</p>

<h3>Rate chunna</h3>
<p>CIR se <b>thoda neeche</b> shape karo, aam taur par 90 se 95 percent, teen wajah se.</p>
<ol>
<li><b>Overhead.</b> Aapka router shayad IP packet gine; provider poora Ethernet frame ginta hai, header, FCS aur shayad VLAN tag ke saath 18 se 26 bytes zyada. 200-byte voice packet ke liye yeh lagbhag 10 percent hai. Agar theek CIR par shape karo to aap provider ki ginti se thoda zyada bhejte ho aur uska policer extra gira deta hai.</li>
<li><b>Measurement jitter.</b> Provider apne interval par average nikalta hai; us interval ke kinare ke bursts excess jaise dikh sakte hain.</li>
<li><b>Queue ki ownership.</b> Provider par koi bhi queue aapke control ke bahar hai. CIR se neeche ka shaper akeli queue wahan rakhta hai jahan aap use manage kar sakte ho.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> Contract 20 Mbps, 200-byte packets ke liye wire par 218 bytes ke frames: factor 218/200 = 1.09. Jo shaper sirf IP packet ginta hai aur 20 Mbps par set hai woh wire par 21.8 Mbps daalega. 19 Mbps ka shaper 20.7 Mbps daalega: chhote packets ke liye abhi bhi thoda zyada. Isliye voice-heavy link par 18 Mbps (90 percent) zyada safe hai aur jahan packets bade hain wahan 19 Mbps kaafi hai. Kai IOS XE platforms Layer 2 headers automatically ginte hain; apne platform ke notes dekho aur provider counters se verify karo.</p></div>

<h3>Jaal</h3>
<div class="warn"><p><b>Aam galtiyan.</b> (1) 1 Gbps handoff par <code>shape average percent 95</code> ka matlab <i>port</i> ka 95 percent, yaani 950 Mbps, contract ka nahi. Handoff par absolute rate use karo. (2) Theek CIR par shape karna. (3) Shaper LAN interface par ya inbound lagana: woh slow service ki taraf wale port ke output par baithna chahiye. (4) Bc ko bytes mein likhna: <code>shape</code> mein woh bits mein hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Shaping sirf output hai; policing input ya output ho sakti hai. Shaper DSCP nahi badalta aur queue full hone tak drop nahi karta. <code>shape average</code> aur <code>shape peak</code> sirf allowed extra burst mein alag hain.</p></div>
<div class="note"><p><b>Junos note.</b> Junos mein basic shaper interface ya logical unit par ek rate hai:</p>
<pre class="code">set class-of-service interfaces ge-0/0/0 shaping-rate 19m</pre>
<p>Hierarchical designs traffic-control-profile use karte hain, jo chapter 7 mein hai. Junos calculation mein Layer 2 overhead bhi shamil kar sakta hai (jin platforms par supported hai wahan <code>overhead-accounting</code>).</p></div>

<div class="scn"><h4>CIR par shape kiya, phir bhi drops</h4><p>Pune branch 20 Mbps kharidti hai, isliye engineer <code>shape average 20000000</code> configure karta hai aur bade file se test karta hai: chalta hai. Ek hafte baad shaam ko phone calls crackle karti hain. Calls chhote packets ki hoti hain, wire par 218 bytes, isliye provider ko router ki ginti se 9 percent zyada dikhta hai. Provider policer 20 Mbps se upar ke kuch percent gira deta hai aur priority na hone se kuch drops voice ke hote hain. Shaper ko 18 Mbps karne se har drop chala jaata hai, aur provider counter zero rehta hai.</p><p><b>Lesson:</b> woh rate shape karo jo provider naapta hai, woh nahi jo aapka router chhapta hai. Dusri taraf ka exceeded counter dikhe to usse, nahi to chhote packets ke test se confirm karo.</p></div>
<div class="iv"><p class="q">"50 Mbps Ethernet service ke liye shaper kis rate par configure karoge?"</p><p>Thoda neeche, 90 se 95 percent ke aaspaas, yaani 45 se 47 Mbps. Wajah: provider Layer 2 overhead ginta hai jo chhote packets ke liye bada hissa hai; provider apne interval par naapta hai; aur main chahta hoon ki akeli queue meri ho. Phir main verify karta hoon ki test load mein provider policer koi exceeded packet nahi dikhata.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>shape average BPS</code> ek class mein, <code>service-policy output</code> se lagaya hua.</li>
<li>Shaper har Tc mein Bc bhejta hai aur baaki queue mein rakhta hai; Bc aur Be bits mein hain.</li>
<li>Layer 2 overhead aur measurement farq absorb karne ke liye CIR se neeche shape karo.</li>
<li>Handoff par absolute rate use karo; percent port speed ka hota hai.</li>
<li><code>show policy-map interface</code> mein target shape rate, queue limit aur total drops padho.</li>
</ul></div>
`}};export{e as default};