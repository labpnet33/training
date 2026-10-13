var e={id:`policing-shaping`,h:{en:`Policing vs shaping: token bucket maths (CIR, Bc, Be, Tc)`,hi:`Policing vs shaping: token bucket maths (CIR, Bc, Be, Tc)`},body:{en:`
<p>Two ways to keep cars at 60 km/h on a road. A <b>speed camera</b> lets you drive as you like but fines (drops) anyone caught above the limit, instantly. A <b>ramp meter</b> at the motorway entrance holds cars at a red light and releases them one at a time, so they never exceed the rate, at the cost of waiting. The camera is a <b>policer</b>; the ramp meter is a <b>shaper</b>. Both measure the rate the same way, with a <b>token bucket</b>.</p>

<h3>The token bucket</h3>
<dl class="terms">
<dt>CIR (committed information rate)</dt><dd>The contracted average rate, in bits per second. Tokens are added to the bucket at this rate.</dd>
<dt>Bc (committed burst)</dt><dd>The bucket size: how much can be sent in one go at line rate.</dd>
<dt>Tc (committed time interval)</dt><dd>The interval in which Bc is refilled. <b>Tc = Bc / CIR</b>.</dd>
<dt>Be (excess burst)</dt><dd>A second bucket that only fills with tokens left unused in earlier intervals, allowing an occasional burst of Bc + Be.</dd>
</dl>
<p>A packet may be sent (policer: <b>conforms</b>) if the bucket holds enough tokens for its size; sending removes those tokens. If not, a policer acts immediately (drop or re-mark: <b>exceed</b>), while a shaper puts the packet in a queue until enough tokens arrive.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Token bucket">
<rect x="230" y="60" width="130" height="110" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="295" y="120" text-anchor="middle" class="svg-ink" font-size="13">bucket = Bc</text>
<text x="295" y="30" text-anchor="middle" class="svg-accent" font-size="12">tokens arrive at CIR</text><line x1="295" y1="38" x2="295" y2="60" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="180" width="150" height="36" rx="6" fill="#e2e8f0"/><text x="95" y="203" text-anchor="middle" class="svg-ink" font-size="13">packet arrives</text>
<line x1="170" y1="198" x2="230" y2="160" stroke="#64748b" stroke-width="2"/>
<rect x="430" y="40" width="190" height="40" rx="6" fill="#bbf7d0"/><text x="525" y="65" text-anchor="middle" class="svg-ink" font-size="12">enough tokens: send</text>
<rect x="430" y="110" width="190" height="40" rx="6" fill="#fed7aa"/><text x="525" y="135" text-anchor="middle" class="svg-ink" font-size="12">policer: drop or re-mark</text>
<rect x="430" y="170" width="190" height="40" rx="6" fill="#fde68a"/><text x="525" y="195" text-anchor="middle" class="svg-ink" font-size="12">shaper: queue, send later</text>
<line x1="360" y1="90" x2="430" y2="60" stroke="#64748b" stroke-width="2"/><line x1="360" y1="130" x2="430" y2="130" stroke="#64748b" stroke-width="2"/><line x1="360" y1="160" x2="430" y2="190" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Same bucket, two behaviours: the policer decides on the spot; the shaper buffers the packet until tokens arrive.</p></div>

<h3>Policer flavours</h3>
<ul>
<li><b>Single-rate, two-colour</b>: CIR and Bc; results <b>conform</b> or <b>exceed</b>.</li>
<li><b>Single-rate, three-colour</b> (RFC 2697): CIR, Bc and Be; conform, exceed (fits in Be), or <b>violate</b>.</li>
<li><b>Two-rate, three-colour</b> (RFC 2698): CIR and a higher <b>PIR</b> (peak rate); up to CIR conforms, between CIR and PIR exceeds, above PIR violates.</li>
</ul>
<p>Actions per colour: <code>transmit</code>, <code>drop</code>, <code>set-dscp-transmit</code> or <code>set-prec-transmit</code>. Re-marking instead of dropping, for example AF11 to AF13, lets the excess through when the network is quiet and makes it the first victim of WRED when it is busy.</p>
<pre class="code"><span class="c">! lab 1: single-rate two-colour on the backup class</span>
policy-map MARK-IN
 class BULK
  set dscp af11
  police 3000000 conform-action transmit exceed-action drop
<span class="c">! two-rate three-colour alternative</span>
<span class="c">!  police cir 3000000 pir 5000000</span>
<span class="c">!   conform-action transmit</span>
<span class="c">!   exceed-action set-dscp-transmit af13</span>
<span class="c">!   violate-action drop</span></pre>

<h3>Shaping</h3>
<pre class="code">policy-map SHAPE-50M
 class class-default
  shape average 50000000</pre>
<p>A shaper sends at most Bc bits in each Tc and queues the rest, turning a bursty stream into a smooth one at CIR. It only works <b>outbound</b>, adds delay, but avoids drops, which TCP likes much better than a policer's losses.</p>

<div class="eg"><p><b>Worked example: shaping maths.</b> Shape to 3 Mbps with Tc = 10 ms: Bc = CIR × Tc = 3,000,000 × 0.01 = <b>30,000 bits</b>. On a 100 Mbps port the shaper sends those 30,000 bits in 0.3 ms at line rate, then stays silent for 9.7 ms, 100 times per second. Average: 3 Mbps. IOS XE picks Tc = 4 ms by default for <code>shape average</code>, so <code>shape average 50000000</code> gives Bc = 50,000,000 / 250 = 200,000 bits. A small Tc matters for voice: with the old 125 ms Tc, a voice packet could wait up to 125 ms for the next interval.</p></div>

<div class="eg"><p><b>Worked example: policer maths.</b> <code>police 3000000</code> with no Bc: IOS uses Bc = CIR / 32 bytes = 93,750 bytes, which is 250 ms of traffic at 3 Mbps. For TCP, Cisco suggests Bc of about 1.5 seconds of traffic: 3,000,000 × 1.5 / 8 = 562,500 bytes. Careful with units: <code>police</code> takes CIR in bps and Bc/Be in <b>bytes</b>; <code>shape average</code> takes CIR in bps and Bc/Be in <b>bits</b>.</p></div>

<pre class="out">R1# show policy-map interface GigabitEthernet0/1 input
    Class-map: BULK (match-all)
      16071 packets, 22499400 bytes
      30 second offered rate 6000000 bps, drop rate 3000000 bps
      Match: access-group name BULK-SMB
      police:
          cir 3000000 bps, bc 93750 bytes
<span class="hl">        conformed 8036 packets, 11250400 bytes; actions:</span>
          transmit
<span class="hl">        exceeded 8035 packets, 11249000 bytes; actions:</span>
          drop
        conformed 3000000 bps, exceeded 3000000 bps
      QoS Set
        dscp af11
          Packets marked 16071</pre>

<table class="cmp"><tr><th></th><th>Policer</th><th>Shaper</th></tr>
<tr><td>Excess traffic</td><td>dropped or re-marked at once</td><td>queued and sent later</td></tr>
<tr><td>Direction</td><td>input or output</td><td>output only</td></tr>
<tr><td>Delay and jitter</td><td>none added</td><td>added (queuing)</td></tr>
<tr><td>Effect on TCP</td><td>drops cause retransmissions</td><td>smooth, fewer drops</td></tr>
<tr><td>Typical place</td><td>ingress edge, provider side, CoPP</td><td>customer WAN egress to a sub-rate service</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> A tiny policer burst. <code>police cir 10000000 bc 1500</code> allows only one packet per burst; TCP sees constant loss and reaches perhaps a third of the rate. Size Bc generously for TCP, or shape instead of police when the traffic is yours.</p></div>

<div class="exam"><p><b>Exam trap.</b> Tc = Bc / CIR. Shapers queue (delay), policers drop or re-mark (no delay). Shaping is output only; policing works in both directions. Three-colour policers add the violate action; two-rate policers use CIR and PIR.</p></div>

<div class="scn"><h4>A 20 Mbps service that delivered 7 Mbps</h4><p>A branch bought a 20 Mbps service delivered on a 1 Gbps Ethernet port. The provider policed at 20 Mbps with a small burst. File transfers peaked at 7 Mbps and the provider's counters showed heavy drops. The branch router was sending line-rate bursts at 1 Gbps that the policer cut down, and TCP kept halving its window. The engineer added a 20 Mbps shaper outbound on the WAN interface, so traffic left the branch already smooth. Throughput rose to 19 Mbps with almost no drops.</p><p><b>Lesson:</b> when the provider polices, shape to the same rate on your side.</p></div>

<div class="iv"><p class="q">"Explain policing versus shaping and the token bucket terms."</p><p>Strong answer: both use a token bucket. CIR is the average rate, Bc the burst size, Tc = Bc/CIR the interval, Be an extra burst built from unused tokens. A policer drops or re-marks non-conforming traffic immediately, can be input or output, adds no delay but causes TCP loss. A shaper buffers excess and sends it later, output only, adding delay but smoothing traffic. Mention single-rate and two-rate three-colour policers and that police Bc is in bytes while shape Bc is in bits.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Token bucket: CIR fills it, Bc is its size, Tc = Bc / CIR, Be is extra burst from unused tokens.</li>
<li>Policer: conform, exceed, violate; drop or re-mark immediately; input or output.</li>
<li>Shaper: queues excess, output only, adds delay, smooths bursts; IOS XE default Tc is 4 ms.</li>
<li>Default policer Bc is CIR/32 bytes (250 ms); police Bc is bytes, shape Bc is bits.</li>
<li>In lab 1, BULK is policed to 3 Mbps inbound with exceed-action drop.</li>
</ul></div>
`,hi:`
<p>Sadak par gaadiyon ko 60 km/h par rakhne ke do tarike. <b>Speed camera</b> aapko jaise chahe chalane deta hai par limit se upar pakde gaye har kisi par turant fine (drop) lagata hai. Motorway entrance par <b>ramp meter</b> gaadiyon ko laal batti par rokta hai aur ek ek karke chhodta hai, taaki woh kabhi rate se aage na jaayein, intezaar ki keemat par. Camera <b>policer</b> hai; ramp meter <b>shaper</b>. Dono rate ko ek hi tarah naapte hain, <b>token bucket</b> se.</p>

<h3>Token bucket</h3>
<dl class="terms">
<dt>CIR (committed information rate)</dt><dd>Contract wala average rate, bits per second mein. Tokens isi rate se bucket mein daale jaate hain.</dd>
<dt>Bc (committed burst)</dt><dd>Bucket ka size: line rate par ek jhatke mein kitna bheja ja sakta hai.</dd>
<dt>Tc (committed time interval)</dt><dd>Woh interval jismein Bc dobara bharta hai. <b>Tc = Bc / CIR</b>.</dd>
<dt>Be (excess burst)</dt><dd>Doosra bucket jo sirf pichhle intervals ke unused tokens se bharta hai, kabhi kabhi Bc + Be ka burst allow karta hai.</dd>
</dl>
<p>Packet tab bheja ja sakta hai (policer: <b>conform</b>) jab bucket mein uske size ke liye kaafi tokens hon; bhejne se woh tokens nikal jaate hain. Agar nahi, to policer turant action leta hai (drop ya re-mark: <b>exceed</b>), jabki shaper packet ko queue mein rakhta hai jab tak kaafi tokens na aa jaayein.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Token bucket">
<rect x="230" y="60" width="130" height="110" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="295" y="120" text-anchor="middle" class="svg-ink" font-size="13">bucket = Bc</text>
<text x="295" y="30" text-anchor="middle" class="svg-accent" font-size="12">tokens CIR par aate hain</text><line x1="295" y1="38" x2="295" y2="60" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="180" width="150" height="36" rx="6" fill="#e2e8f0"/><text x="95" y="203" text-anchor="middle" class="svg-ink" font-size="13">packet aata hai</text>
<line x1="170" y1="198" x2="230" y2="160" stroke="#64748b" stroke-width="2"/>
<rect x="430" y="40" width="190" height="40" rx="6" fill="#bbf7d0"/><text x="525" y="65" text-anchor="middle" class="svg-ink" font-size="12">kaafi tokens: bhejo</text>
<rect x="430" y="110" width="190" height="40" rx="6" fill="#fed7aa"/><text x="525" y="135" text-anchor="middle" class="svg-ink" font-size="12">policer: drop ya re-mark</text>
<rect x="430" y="170" width="190" height="40" rx="6" fill="#fde68a"/><text x="525" y="195" text-anchor="middle" class="svg-ink" font-size="12">shaper: queue, baad mein bhejo</text>
<line x1="360" y1="90" x2="430" y2="60" stroke="#64748b" stroke-width="2"/><line x1="360" y1="130" x2="430" y2="130" stroke="#64748b" stroke-width="2"/><line x1="360" y1="160" x2="430" y2="190" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Same bucket, do behaviour: policer wahin faisla karta hai; shaper tokens aane tak packet ko buffer karta hai.</p></div>

<h3>Policer ke prakaar</h3>
<ul>
<li><b>Single-rate, two-colour</b>: CIR aur Bc; nateeja <b>conform</b> ya <b>exceed</b>.</li>
<li><b>Single-rate, three-colour</b> (RFC 2697): CIR, Bc aur Be; conform, exceed (Be mein fit), ya <b>violate</b>.</li>
<li><b>Two-rate, three-colour</b> (RFC 2698): CIR aur usse uncha <b>PIR</b> (peak rate); CIR tak conform, CIR aur PIR ke beech exceed, PIR ke upar violate.</li>
</ul>
<p>Har colour ke actions: <code>transmit</code>, <code>drop</code>, <code>set-dscp-transmit</code> ya <code>set-prec-transmit</code>. Drop ki jagah re-mark karna, jaise AF11 se AF13, network shaant hone par extra ko jaane deta hai aur busy hone par use WRED ka pehla shikaar banata hai.</p>
<pre class="code"><span class="c">! lab 1: backup class par single-rate two-colour</span>
policy-map MARK-IN
 class BULK
  set dscp af11
  police 3000000 conform-action transmit exceed-action drop
<span class="c">! two-rate three-colour alternative</span>
<span class="c">!  police cir 3000000 pir 5000000</span>
<span class="c">!   conform-action transmit</span>
<span class="c">!   exceed-action set-dscp-transmit af13</span>
<span class="c">!   violate-action drop</span></pre>

<h3>Shaping</h3>
<pre class="code">policy-map SHAPE-50M
 class class-default
  shape average 50000000</pre>
<p>Shaper har Tc mein zyada se zyada Bc bits bhejta hai aur baaki ko queue karta hai, bursty stream ko CIR par smooth stream mein badal deta hai. Yeh sirf <b>outbound</b> kaam karta hai, delay jodta hai, par drops se bachata hai, jo TCP ko policer ke loss se kahin zyada pasand hai.</p>

<div class="eg"><p><b>Worked example: shaping maths.</b> Tc = 10 ms ke saath 3 Mbps par shape: Bc = CIR × Tc = 3,000,000 × 0.01 = <b>30,000 bits</b>. 100 Mbps port par shaper woh 30,000 bits line rate par 0.3 ms mein bhejta hai, phir 9.7 ms chup rehta hai, second mein 100 baar. Average: 3 Mbps. IOS XE <code>shape average</code> ke liye default mein Tc = 4 ms chunta hai, isliye <code>shape average 50000000</code> Bc = 50,000,000 / 250 = 200,000 bits deta hai. Chhota Tc voice ke liye matter karta hai: purane 125 ms Tc ke saath voice packet agle interval ke liye 125 ms tak ruk sakta tha.</p></div>

<div class="eg"><p><b>Worked example: policer maths.</b> Bina Bc ke <code>police 3000000</code>: IOS Bc = CIR / 32 bytes = 93,750 bytes use karta hai, jo 3 Mbps par 250 ms ka traffic hai. TCP ke liye Cisco lagbhag 1.5 second ke traffic jitna Bc suggest karta hai: 3,000,000 × 1.5 / 8 = 562,500 bytes. Units mein dhyan: <code>police</code> CIR bps mein aur Bc/Be <b>bytes</b> mein leta hai; <code>shape average</code> CIR bps mein aur Bc/Be <b>bits</b> mein.</p></div>

<pre class="out">R1# show policy-map interface GigabitEthernet0/1 input
    Class-map: BULK (match-all)
      16071 packets, 22499400 bytes
      30 second offered rate 6000000 bps, drop rate 3000000 bps
      Match: access-group name BULK-SMB
      police:
          cir 3000000 bps, bc 93750 bytes
<span class="hl">        conformed 8036 packets, 11250400 bytes; actions:</span>
          transmit
<span class="hl">        exceeded 8035 packets, 11249000 bytes; actions:</span>
          drop
        conformed 3000000 bps, exceeded 3000000 bps
      QoS Set
        dscp af11
          Packets marked 16071</pre>

<table class="cmp"><tr><th></th><th>Policer</th><th>Shaper</th></tr>
<tr><td>Extra traffic</td><td>turant drop ya re-mark</td><td>queue karke baad mein bhejta hai</td></tr>
<tr><td>Direction</td><td>input ya output</td><td>sirf output</td></tr>
<tr><td>Delay aur jitter</td><td>kuch nahi jodta</td><td>jodta hai (queuing)</td></tr>
<tr><td>TCP par asar</td><td>drops se retransmissions</td><td>smooth, kam drops</td></tr>
<tr><td>Aam jagah</td><td>ingress edge, provider side, CoPP</td><td>sub-rate service ki taraf customer WAN egress</td></tr></table>

<div class="warn"><p><b>Common galti.</b> Bahut chhota policer burst. <code>police cir 10000000 bc 1500</code> ek burst mein sirf ek packet allow karta hai; TCP ko lagatar loss dikhta hai aur woh shayad rate ka ek tihaai hi pahunchta hai. TCP ke liye Bc khula size karo, ya jab traffic aapka ho to police ki jagah shape karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Tc = Bc / CIR. Shapers queue karte hain (delay), policers drop ya re-mark karte hain (koi delay nahi). Shaping sirf output hai; policing dono directions mein kaam karta hai. Three-colour policers violate action jodte hain; two-rate policers CIR aur PIR use karte hain.</p></div>

<div class="scn"><h4>20 Mbps service jo 7 Mbps deti thi</h4><p>Ek branch ne 1 Gbps Ethernet port par di gayi 20 Mbps service khareedi. Provider chhote burst ke saath 20 Mbps par police karta tha. File transfers 7 Mbps par atak jaate aur provider ke counters mein bhaari drops the. Branch router 1 Gbps par line-rate bursts bhej raha tha jinhe policer kaat deta, aur TCP baar baar apni window aadhi karta. Engineer ne WAN interface par outbound 20 Mbps shaper joda, taaki traffic branch se pehle hi smooth nikle. Throughput lagbhag bina drops ke 19 Mbps tak pahunch gaya.</p><p><b>Seekh:</b> jab provider police kare, apni taraf usi rate par shape karo.</p></div>

<div class="iv"><p class="q">"Policing vs shaping aur token bucket terms samjhao."</p><p>Strong answer: dono token bucket use karte hain. CIR average rate hai, Bc burst size, Tc = Bc/CIR interval, Be unused tokens se bana extra burst. Policer non-conforming traffic ko turant drop ya re-mark karta hai, input ya output ho sakta hai, delay nahi jodta par TCP loss paida karta hai. Shaper extra ko buffer karke baad mein bhejta hai, sirf output, delay jodta hai par traffic smooth karta hai. Single-rate aur two-rate three-colour policers batao, aur yeh ki police Bc bytes mein hai jabki shape Bc bits mein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Token bucket: CIR ise bharta hai, Bc iska size hai, Tc = Bc / CIR, Be unused tokens se extra burst hai.</li>
<li>Policer: conform, exceed, violate; turant drop ya re-mark; input ya output.</li>
<li>Shaper: extra ko queue karta hai, sirf output, delay jodta hai, bursts smooth karta hai; IOS XE default Tc 4 ms hai.</li>
<li>Default policer Bc CIR/32 bytes (250 ms) hai; police Bc bytes mein, shape Bc bits mein.</li>
<li>Lab 1 mein BULK inbound 3 Mbps par exceed-action drop ke saath police hota hai.</li>
</ul></div>
`}};export{e as default};