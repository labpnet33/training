var e={id:`fc-header-fields`,h:{en:`Header fields, forwarding classes and queues`,hi:`Header fields, forwarding classes aur queues`},body:{en:`
<p>Before you can classify traffic you must know <b>where the marking lives</b> in a packet and <b>what the router turns it into</b>. This chapter covers the header fields that carry priority and the forwarding classes and queues that Junos maps them to.</p>

<h3>Where the priority bits live</h3>
<p>Three fields are tested on the exam. Each has its own classifier type and its own rewrite type.</p>
<table class="cmp"><tr><th>Field</th><th>Where</th><th>Bits</th><th>Junos type keyword</th></tr>
<tr><td>DSCP</td><td>Upper 6 bits of the IPv4 ToS byte or IPv6 traffic class</td><td>6 (0-63)</td><td><code>dscp</code> (IPv6: <code>dscp-ipv6</code>)</td></tr>
<tr><td>IP precedence</td><td>Upper 3 bits of the same byte</td><td>3 (0-7)</td><td><code>inet-precedence</code></td></tr>
<tr><td>802.1p (PCP)</td><td>802.1Q VLAN tag, only on tagged frames</td><td>3 (0-7)</td><td><code>ieee-802.1</code></td></tr>
<tr><td>MPLS EXP</td><td>MPLS label stack entry</td><td>3 (0-7)</td><td><code>exp</code> (mentioned for completeness)</td></tr></table>
<p>DSCP is the one you will use most. Well-known values: <code>ef</code> = 46 (voice), <code>af11</code> = 10, <code>af12</code> = 12, <code>af13</code> = 14, <code>cs6</code> = 48 (network control), <code>be</code> = 0. The ToS byte on the wire is DSCP times 4, so EF 46 appears as <code>0xb8</code> in a packet capture.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="ToS byte layout">
<rect x="40" y="40" width="360" height="44" rx="4" fill="#bae6fd"/><rect x="400" y="40" width="120" height="44" rx="4" fill="#e2e8f0"/>
<text x="220" y="68" text-anchor="middle" class="svg-ink" font-size="14">DSCP (6 bits)</text><text x="460" y="68" text-anchor="middle" class="svg-ink" font-size="14">ECN (2 bits)</text>
<rect x="40" y="95" width="180" height="26" rx="4" fill="#bbf7d0"/><text x="130" y="113" text-anchor="middle" class="svg-ink" font-size="12">IP precedence (3 bits)</text>
<text x="320" y="20" text-anchor="middle" class="svg-accent" font-size="13">IPv4 ToS byte (8 bits)</text>
<text x="320" y="142" text-anchor="middle" class="svg-muted" font-size="12">EF = 101110 = 46; byte value 10111000 = 0xb8</text>
</svg><p class="cap">DSCP uses the top six bits of the ToS byte; precedence is its top three bits.</p></div>

<h3>Forwarding classes and queues</h3>
<p>A <b>forwarding class</b> is a name. A <b>queue</b> is a buffer on the egress port. The mapping between them is fixed by the forwarding-class definition. In the lab, EDGE shows this:</p>
<pre class="out">lab@EDGE&gt; show class-of-service forwarding-class
  Forwarding class                       ID      Queue  Restricted queue  Fabric priority  Policing priority
  best-effort                            0       0      0                 low              normal
  <span class="hl">expedited-forwarding                   1       1      1</span>                 low              normal
  assured-forwarding                     2       2      2                 low              normal
  network-control                        3       3      3                 low              normal</pre>
<p>Four classes and four queues exist by default. Always verify the queue number on the platform you work on, because the exam asks "which queue carries expedited-forwarding" and the lab task asks the same question. You can add classes with <code>queue-num</code>; in the simulator a new class receives the next free ID and the queue number you choose:</p>
<pre class="code"><span class="c"># config: a fifth class for voice, using queue 5</span>
set class-of-service forwarding-classes class voice queue-num 5
commit</pre>
<pre class="out">lab@EDGE&gt; show class-of-service forwarding-class
  ...
  network-control                        3       3      3                 low              normal
  voice                                  4       5      5                 low              normal</pre>
<p>On the real platforms the number of queues differs (many MX line cards support eight, some EX and QFX switches have different defaults). Lab devices show "8 supported, 4 in use". Do not hard-code assumptions; read the output.</p>

<h3>Loss priority</h3>
<p>Loss priority travels with the packet as a second label. It is set by the classifier or by a filter or policer, and it is used later by <b>drop profiles</b> (RED) to decide who dies first in a filling queue. A packet that exceeds a soft policer can be marked <code>loss-priority high</code> instead of being discarded. We return to this in chapters 5 and 6.</p>

<div class="eg"><p><b>Worked example.</b> A softphone sends RTP with DSCP 46. If the router classifier maps code point <code>101110</code> to <code>expedited-forwarding</code> with <code>loss-priority low</code>, the packet gets FC=EF, PLP=low, queue 1. When it leaves, a rewrite rule can turn FC=EF and PLP=low back into <code>101110</code>. If a different packet arrives with DSCP 10 (AF11) and the classifier maps it to assured-forwarding low, it joins queue 2 and the scheduler serves queue 2 under its own rules.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Mixing up the types: a <code>dscp</code> classifier does not look at 802.1p, and an <code>ieee-802.1</code> classifier cannot help on an untagged access port. Also, a code point in a classifier must match the type: <code>ef</code> is valid for dscp, while <code>101</code> is the 3-bit value for ieee-802.1 and inet-precedence.</p></div>
<div class="exam"><p><b>Exam trap.</b> The ToS byte value is not the DSCP value. DSCP 46 is byte 0xb8 (184). Another trap: loss priority has four levels (low, medium-low, medium-high, high), but some platforms only use two.</p></div>

<div class="scn"><h4>Queue 3 carried the wrong traffic</h4><p>A team created a forwarding class called <code>video</code> and assigned it <code>queue-num 3</code>, because three "looked free". The class overlapped with network-control, and routing protocol hellos shared a queue with video streams. During a busy evening an OSPF neighbour flapped. The engineer ran <code>show class-of-service forwarding-class</code>, saw both classes on queue 3, moved video to queue 5 and the flaps stopped.</p><p><b>Lesson:</b> read the forwarding-class table before creating a class, and never share a queue with network-control.</p></div>

<div class="iv"><p class="q">"What is the difference between DSCP and IP precedence?"</p><p>IP precedence is the top 3 bits of the ToS byte; DSCP is the top 6 bits, so DSCP is a finer version of the same field. A router classifier of type <code>inet-precedence</code> only sees the top three bits, so DSCP values such as AF11 and AF12 can look identical to it. Mention that 802.1p is a separate 3-bit field in the VLAN tag and that Junos uses a different classifier type for each.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DSCP is 6 bits, precedence and 802.1p are 3 bits.</li>
<li>EF is DSCP 46 which appears as byte 0xb8.</li>
<li>Each forwarding class maps to a queue; verify with <code>show class-of-service forwarding-class</code>.</li>
<li>Default classes: best-effort 0, expedited-forwarding 1, assured-forwarding 2, network-control 3.</li>
<li>Loss priority is a second internal label used for drop decisions.</li>
</ul></div>
`,hi:`
<p>Traffic classify karne se pehle aapko pata hona chahiye ki packet mein <b>marking kahan hoti hai</b> aur <b>router use kis cheez mein badalta hai</b>. Yeh chapter un header fields ko cover karta hai jo priority le jaate hain, aur un forwarding classes aur queues ko jinse Junos unhe map karta hai.</p>

<h3>Priority bits kahan hote hain</h3>
<p>Exam mein teen fields poochhe jaate hain. Har ek ka apna classifier type aur apna rewrite type hai.</p>
<table class="cmp"><tr><th>Field</th><th>Kahan</th><th>Bits</th><th>Junos type keyword</th></tr>
<tr><td>DSCP</td><td>IPv4 ToS byte ya IPv6 traffic class ke upar ke 6 bits</td><td>6 (0-63)</td><td><code>dscp</code> (IPv6: <code>dscp-ipv6</code>)</td></tr>
<tr><td>IP precedence</td><td>Usi byte ke upar ke 3 bits</td><td>3 (0-7)</td><td><code>inet-precedence</code></td></tr>
<tr><td>802.1p (PCP)</td><td>802.1Q VLAN tag, sirf tagged frames mein</td><td>3 (0-7)</td><td><code>ieee-802.1</code></td></tr>
<tr><td>MPLS EXP</td><td>MPLS label stack entry</td><td>3 (0-7)</td><td><code>exp</code> (sirf jaankari ke liye)</td></tr></table>
<p>DSCP sabse zyada use hota hai. Jaane-pehchane values: <code>ef</code> = 46 (voice), <code>af11</code> = 10, <code>af12</code> = 12, <code>af13</code> = 14, <code>cs6</code> = 48 (network control), <code>be</code> = 0. Wire par ToS byte DSCP ka 4 guna hota hai, isliye EF 46 packet capture mein <code>0xb8</code> dikhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="ToS byte layout">
<rect x="40" y="40" width="360" height="44" rx="4" fill="#bae6fd"/><rect x="400" y="40" width="120" height="44" rx="4" fill="#e2e8f0"/>
<text x="220" y="68" text-anchor="middle" class="svg-ink" font-size="14">DSCP (6 bits)</text><text x="460" y="68" text-anchor="middle" class="svg-ink" font-size="14">ECN (2 bits)</text>
<rect x="40" y="95" width="180" height="26" rx="4" fill="#bbf7d0"/><text x="130" y="113" text-anchor="middle" class="svg-ink" font-size="12">IP precedence (3 bits)</text>
<text x="320" y="20" text-anchor="middle" class="svg-accent" font-size="13">IPv4 ToS byte (8 bits)</text>
<text x="320" y="142" text-anchor="middle" class="svg-muted" font-size="12">EF = 101110 = 46; byte value 10111000 = 0xb8</text>
</svg><p class="cap">DSCP ToS byte ke upar ke chhe bits use karta hai; precedence uske upar ke teen bits hain.</p></div>

<h3>Forwarding classes aur queues</h3>
<p><b>Forwarding class</b> ek naam hai. <b>Queue</b> egress port par ek buffer hai. Dono ka mapping forwarding-class definition se fix hota hai. Lab mein EDGE par yeh dikhta hai:</p>
<pre class="out">lab@EDGE&gt; show class-of-service forwarding-class
  Forwarding class                       ID      Queue  Restricted queue  Fabric priority  Policing priority
  best-effort                            0       0      0                 low              normal
  <span class="hl">expedited-forwarding                   1       1      1</span>                 low              normal
  assured-forwarding                     2       2      2                 low              normal
  network-control                        3       3      3                 low              normal</pre>
<p>Default mein chaar classes aur chaar queues hoti hain. Jis platform par kaam karo wahan queue number zaroor verify karo, kyunki exam poochhta hai "expedited-forwarding kaunsi queue mein jaata hai" aur lab task bhi yahi poochhta hai. Aap <code>queue-num</code> se classes jod sakte ho; simulator mein nayi class ko agla free ID milta hai aur queue number wahi jo aap chuno:</p>
<pre class="code"><span class="c"># config: queue 5 par paanchvi class</span>
set class-of-service forwarding-classes class voice queue-num 5
commit</pre>
<pre class="out">lab@EDGE&gt; show class-of-service forwarding-class
  ...
  network-control                        3       3      3                 low              normal
  voice                                  4       5      5                 low              normal</pre>
<p>Asli platforms par queues ki ginti alag hoti hai (kai MX line cards aath queues support karte hain, kuch EX aur QFX switches ke defaults alag hain). Lab devices "8 supported, 4 in use" dikhate hain. Assumptions hard-code mat karo; output padho.</p>

<h3>Loss priority</h3>
<p>Loss priority packet ke saath doosre label ki tarah chalti hai. Ise classifier, filter ya policer set karta hai, aur baad mein <b>drop profiles</b> (RED) use karte hain yeh tay karne ke liye ki bharti queue mein pehle kaun marega. Soft policer se zyada traffic ko discard karne ki jagah <code>loss-priority high</code> mark kar sakte ho. Chapter 5 aur 6 mein hum yahan wapas aayenge.</p>

<div class="eg"><p><b>Worked example.</b> Ek softphone DSCP 46 ke saath RTP bhejta hai. Router classifier code point <code>101110</code> ko <code>loss-priority low</code> ke saath <code>expedited-forwarding</code> par map kare to packet ko FC=EF, PLP=low, queue 1 milti hai. Bahar jaate waqt rewrite rule FC=EF aur PLP=low ko wapas <code>101110</code> bana sakta hai. Dusra packet DSCP 10 (AF11) ke saath aaye aur classifier use assured-forwarding low par map kare, to woh queue 2 mein jaata hai aur scheduler queue 2 ko apne rules se serve karta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Types mix karna: <code>dscp</code> classifier 802.1p nahi dekhta, aur <code>ieee-802.1</code> classifier untagged access port par madad nahi kar sakta. Code point type se match hona chahiye: <code>ef</code> dscp ke liye valid hai, jabki <code>101</code> ieee-802.1 aur inet-precedence ki 3-bit value hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> ToS byte ki value DSCP value nahi hoti. DSCP 46 byte 0xb8 (184) hai. Ek aur trap: loss priority ke chaar levels hain (low, medium-low, medium-high, high), lekin kuch platforms sirf do use karte hain.</p></div>

<div class="scn"><h4>Queue 3 mein galat traffic</h4><p>Ek team ne <code>video</code> naam ki forwarding class banayi aur use <code>queue-num 3</code> de diya kyunki teen "khaali dikhti thi". Class network-control se overlap ho gayi aur routing protocol hellos video streams ke saath ek hi queue mein aa gaye. Busy shaam ko ek OSPF neighbour flap hua. Engineer ne <code>show class-of-service forwarding-class</code> chalaya, dono classes queue 3 par dekhi, video ko queue 5 par shift kiya aur flaps ruk gaye.</p><p><b>Lesson:</b> class banane se pehle forwarding-class table padho, aur network-control ke saath queue kabhi share mat karo.</p></div>

<div class="iv"><p class="q">"DSCP aur IP precedence mein kya difference hai?"</p><p>IP precedence ToS byte ke upar ke 3 bits hain; DSCP upar ke 6 bits, yaani DSCP usi field ka bareek version hai. <code>inet-precedence</code> type ka router classifier sirf upar ke teen bits dekhta hai, isliye AF11 aur AF12 jaise DSCP values use ek jaisi dikh sakti hain. Yeh bhi kaho ki 802.1p VLAN tag ka alag 3-bit field hai aur Junos har ek ke liye alag classifier type use karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DSCP 6 bits hai, precedence aur 802.1p 3 bits.</li>
<li>EF DSCP 46 hai jo byte 0xb8 ke roop mein dikhta hai.</li>
<li>Har forwarding class ek queue se map hoti hai; <code>show class-of-service forwarding-class</code> se verify karo.</li>
<li>Default classes: best-effort 0, expedited-forwarding 1, assured-forwarding 2, network-control 3.</li>
<li>Loss priority drop faisle ke liye doosra internal label hai.</li>
</ul></div>
`}};export{e as default};