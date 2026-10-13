var e={id:`policing-shaping`,h:{en:`Policing versus shaping: token buckets, CIR, burst and where each is used`,hi:`Policing versus shaping: token buckets, CIR, burst aur har ek kahan use hota hai`},body:{en:`
<p>Two doormen guard a cinema that only seats 100. The first one, the <b>policer</b>, stands at the door and says "100 are in, everybody else goes home" or, if he is kind, "you may watch standing at the back, but you are first to be thrown out if it gets crowded". The second one, the <b>shaper</b>, has a waiting room: he lets people in at a steady pace and the rest sit in the lobby until there is space. Nobody is turned away unless the lobby is full too. Both enforce a rate. The first never delays anyone and the second always does.</p>

<h3>The token bucket in plain words</h3>
<p>Both tools use the same maths. Imagine a bucket that can hold some tokens. A tap drips new tokens into the bucket at a fixed speed. One token pays for one byte (or bit). To send a packet, the router takes tokens equal to its size out of the bucket. If enough tokens are there, the packet <b>conforms</b> and is sent. If not, it does not conform and something else happens: drop, re-mark, or wait.</p>
<dl class="terms">
<dt>CIR (committed information rate)</dt><dd>How fast the tap drips: the long-term average rate you allow, in bits per second.</dd>
<dt>Bc (committed burst)</dt><dd>The size of the bucket: how many tokens can be saved up. A flow that was idle can then send a short burst at line rate. For <code>police</code> it is in bytes; for <code>shape</code> it is in bits.</dd>
<dt>Be (excess burst)</dt><dd>An optional second bucket for traffic slightly above the contract.</dd>
<dt>Tc (time interval)</dt><dd>Bc divided by CIR. The shaper releases at most Bc bits in each Tc.</dd>
</dl>
<p>The router default for <code>police</code> is Bc = CIR / 32 bytes (with a minimum of 1500), which equals 250 ms of traffic at the CIR. The simulator shows exactly that: for a 3,000,000 bps policer it prints <code>bc 93750 bytes</code>, because 3,000,000 / 32 = 93,750.</p>

<h3>Policing</h3>
<p>A policer measures the traffic and decides immediately, with no buffering. In the single-rate, two-colour form there are two actions:</p>
<ul>
<li><b>conform-action</b>: the packet fits the bucket. Usually <code>transmit</code>.</li>
<li><b>exceed-action</b>: it does not. <code>drop</code>, or <code>set-dscp-transmit</code> to lower its marking and send it anyway.</li>
</ul>
<p>A third, optional <b>violate-action</b> exists when you configure Be too (three colours). Conform is green, exceed is yellow (above CIR but inside the excess bucket) and violate is red (beyond both). A typical use is: green transmit, yellow send as AF12, red drop. Policing can be applied on <b>input or output</b>. It adds no delay, but causes burst losses that TCP notices.</p>
<pre class="code">R1(config)# policy-map MARK-IN
R1(config-pmap)# class BULK
R1(config-pmap-c)# set dscp af11
R1(config-pmap-c)# police 3000000 conform-action transmit exceed-action drop
R1(config)# interface GigabitEthernet0/1
R1(config-if)# service-policy input MARK-IN
PC-DATA> traffic 10.20.0.100 tcp/445 6000 30
R1# show policy-map interface GigabitEthernet0/1 input</pre>
<pre class="out">    Class-map: BULK (match-any)  
      16080 packets, 22512000 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: access-group name BULK-SMB
        16080 packets, 22512000 bytes
        30 second rate 0000 bps
      police:
          cir 3000000 bps, bc 93750 bytes
        conformed 8107 packets, 11343750 bytes; actions:
          transmit 
        exceeded 7973 packets, 11168250 bytes; actions:
          drop 
        conformed 0000 bps, exceeded 0000 bps
      QoS Set
        dscp af11
          Packets marked 16080</pre>
<p>The SMB backup offered 6 Mbps. The policer let about half through: 8,107 packets conformed (11.3 MB over 30 s is about 3.0 Mbps) and 7,973 exceeded and were dropped. The packets marked counter (16,080) equals everything the class saw, including the 7,973 that the policer then dropped.</p>

<h3>A three-colour policer</h3>
<pre class="code">R1(config)# policy-map P3
R1(config-pmap)# class class-default
R1(config-pmap-c)# police cir 1000000 bc 31250 be 31250 conform-action transmit exceed-action set-dscp-transmit af12 violate-action drop
R1(config)# interface GigabitEthernet0/1
R1(config-if)# service-policy input P3
PC-DATA> traffic 10.20.0.100 udp/5001 3000 10
R1# show policy-map interface GigabitEthernet0/1 input</pre>
<pre class="out">    Class-map: class-default (match-any)  
      18750 packets, 3750000 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: any 
      police:
          cir 1000000 bps, bc 31250 bytes, be 31250 bytes
        conformed 6406 packets, 1281250 bytes; actions:
          transmit 
        exceeded 156 packets, 31250 bytes; actions:
          set-dscp-transmit af12 
        violated 12188 packets, 2437500 bytes; actions:
          drop </pre>
<p>3 Mbps offered into a 1 Mbps contract: about one third conformed, a small slice (156 packets, exactly the 31,250-byte excess bucket) was re-marked AF12 and sent, and the rest (12,188 packets) was violating and dropped.</p>

<h3>Shaping</h3>
<p>A shaper uses the same bucket, but non-conforming packets are <b>held in a queue</b> and released later as tokens arrive. The output rate is smooth, never above the CIR, and short bursts are absorbed by the buffer. This adds <b>delay and jitter</b>, and if the sustained rate exceeds the CIR for long, the buffer fills and the shaper drops too. Shaping is applied only in the <b>output</b> direction on a router. The command is <code>shape average</code>, and because a shaper must know where to queue, it is normally the top (parent) policy with a child queuing policy beneath it.</p>
<pre class="code">R1(config)# policy-map CH
R1(config-pmap)# class EF-Q
R1(config-pmap-c)# priority 500
R1(config-pmap)# class class-default
R1(config-pmap-c)# fair-queue
R1(config)# policy-map PARENT
R1(config-pmap)# class class-default
R1(config-pmap-c)# shape average 2000000
R1(config-pmap-c)# service-policy CH
R1(config)# interface GigabitEthernet0/0
R1(config-if)# service-policy output PARENT
PHONE> traffic 10.20.0.100 udp/20000 400 20 dscp ef
PC-DATA> traffic 10.20.0.100 tcp/445 4000 20
R1# show policy-map interface GigabitEthernet0/0 output</pre>
<pre class="out">  Service-policy output: PARENT

    Class-map: class-default (match-any)  
      12140 packets, 10996000 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: any 
      Queueing
      queue limit 64 packets
      (queue depth/total drops/no-buffer drops) 0/0/0
      (pkts output/bytes output) 8256/5550000
      shape (average) cir 2000000, bc 8000, be 8000
      target shape rate 2000000

      Service-policy : CH

        Class-map: EF-Q (match-any)  
          5000 packets, 1000000 bytes
          Priority: 500 kbps, burst bytes 12500, b/w exceed drops: 0
          (queue depth/total drops/no-buffer drops) 0/0/0
          (pkts output/bytes output) 5000/1000000

        Class-map: class-default (match-any)  
          7140 packets, 9996000 bytes
          (queue depth/total drops/no-buffer drops) 0/3884/0
          (pkts output/bytes output) 3256/4550000
          Fair-queue: per-flow queue limit 16 packets</pre>
<p>(Some lines inside each class are omitted here for space; they are the same offered-rate and match lines you have already seen.) The parent shapes the whole 10 Mbps port to <code>cir 2000000</code> with <code>bc 8000</code>, so Tc = 8000 / 2,000,000 = 4 ms. The EF class goes first inside the shaped rate and loses nothing: 5,000 of 5,000 packets. The backup, offering 4 Mbps into a 2 Mbps shaper, was buffered and smoothed to the shaped rate, but it kept arriving faster than the queue could drain, so the queue overflowed: 3,884 drops in class-default. Shaping adds delay first and loss only when the buffer is exhausted.</p>

<h3>Policing versus shaping</h3>
<div class="dia"><svg viewBox="0 0 660 200" role="img" aria-label="Policer vs shaper rate graphs">
<text x="165" y="18" text-anchor="middle" class="svg-ink" font-size="13">Policing</text><text x="495" y="18" text-anchor="middle" class="svg-ink" font-size="13">Shaping</text>
<path d="M20 30 V160 H310 M350 30 V160 H640" stroke="#64748b" stroke-width="1.5" fill="none"/>
<path d="M20 100 H310 M350 100 H640" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5 4" fill="none"/>
<text x="318" y="98" class="svg-accent" font-size="11" text-anchor="end">CIR</text>
<polyline points="20,150 60,150 80,50 110,50 125,150 170,150 190,60 230,60 245,150 310,150" stroke="#94a3b8" stroke-width="2" fill="none"/>
<polyline points="20,150 60,150 80,100 110,100 125,150 170,150 190,100 230,100 245,150 310,150" stroke="#0284c7" stroke-width="3" fill="none"/>
<polyline points="350,150 390,150 410,50 440,50 455,150 500,150 520,60 560,60 575,150 640,150" stroke="#94a3b8" stroke-width="2" fill="none"/>
<polyline points="350,150 390,150 410,100 470,100 500,100 560,100 600,100 640,150" stroke="#0284c7" stroke-width="3" fill="none"/>
<text x="165" y="182" text-anchor="middle" class="svg-muted" font-size="11">peaks are cut off (drop or re-mark)</text>
<text x="495" y="182" text-anchor="middle" class="svg-muted" font-size="11">peaks are spread out (delay)</text>
</svg><p class="cap">Grey: offered traffic. Blue: what leaves. The policer clips; the shaper smooths and delays.</p></div>
<div class="tbl"><table>
<tr><th>Feature</th><th>Policing</th><th>Shaping</th></tr>
<tr><td>Excess traffic</td><td>Dropped, or re-marked and sent</td><td>Buffered and sent later</td></tr>
<tr><td>Delay and jitter</td><td>None added</td><td>Added (queue)</td></tr>
<tr><td>Output pattern</td><td>Bursty, clipped at the peak</td><td>Smooth</td></tr>
<tr><td>Direction</td><td>Input or output</td><td>Output only</td></tr>
<tr><td>Memory</td><td>No buffer</td><td>Needs buffer and a queue</td></tr>
<tr><td>TCP effect</td><td>Drops cause retransmissions and sawtooth throughput</td><td>Gentler, TCP adapts to delay</td></tr>
<tr><td>Command</td><td><code>police</code></td><td><code>shape average</code></td></tr>
<tr><td>Typical use</td><td>Service provider limiting a customer; limiting scavenger or guest traffic at the edge; the voice policer inside LLQ</td><td>Customer sending a 1 Gbps port into a 100 Mbps contracted service; Frame Relay or Metro Ethernet subrate links</td></tr>
</table></div>

<div class="eg"><p><b>Worked example.</b> A provider sells the Pune branch a 20 Mbps service on a 1 Gbps hand-off and polices at 20 Mbps ingress. If the branch router just sends at 1 Gbps line rate bursts, the provider's policer drops every burst above 20 Mbps, even though the long-term average is lower. The fix is on the customer side: a parent policy <code>shape average 20000000</code> on the WAN port with the LLQ policy as a child. Now bursts are queued at the customer router, voice goes first inside the shaped rate, and the provider's policer never sees an excess packet. Policers punish bursts; shapers prevent them.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Trying <code>shape</code> on an input policy (not allowed). Using a policer where you wanted smoothing: the drops look like loss on the link. Thinking shaping is free: it adds queuing delay, so voice traffic needs its own priority queue inside the shaper. Confusing the burst units (bytes for police, bits for shape in the displays).</p></div>

<div class="exam"><p><b>Exam traps.</b> Policing: drops or re-marks, no buffer, input or output. Shaping: buffers and delays, output only. Both use a token bucket with CIR and Bc. Three outcomes of a policer: conform, exceed, violate. Shaping toward a service-provider CIR avoids the provider's policer dropping you. Neither adds bandwidth.</p></div>

<div class="scn"><h4>The 100 Mbps contract on a 1 Gbps port</h4><p>After upgrading the head office handoff to a 1 Gbps port, users complained that file transfers were slower than on the old 100 Mbps link. The provider still sold 100 Mbps and policed at ingress. Short bursts at 1 Gbps were being cut, TCP backed off hard each time, and throughput averaged 40 Mbps. A shaper at 98 Mbps on the router, with a child LLQ policy, brought transfers back to about 95 Mbps and kept voice clean.</p><p><b>Lesson:</b> when the physical port is faster than the contract, shape to just below the contracted rate.</p></div>

<div class="iv"><p class="q">"Policing or shaping: which do you use and where?"</p><p>Policing drops or re-marks excess immediately and can be applied in either direction; use it to enforce a limit, for example at the ISP or on guest traffic. Shaping buffers excess and releases it at the CIR, output only; use it on the customer side when the port is faster than the contracted rate. Mention that shaping adds delay and that both rely on a token bucket (CIR and Bc).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Token bucket: tokens arrive at CIR, the bucket holds Bc; a packet conforms if enough tokens exist.</li>
<li>Policer: conform, exceed, violate actions (transmit, set-dscp-transmit, drop); no delay; input or output.</li>
<li>Shaper: buffers excess to a smooth CIR; adds delay and jitter; output only; drops only when the buffer is full.</li>
<li>Default police Bc is CIR / 32 bytes (3 Mbps gives 93,750).</li>
<li>Shape to just below the provider contract so their policer never drops you.</li>
</ul></div>
`,hi:`
<p>Ek cinema hall ke do darban hain jisme sirf 100 seats hain. Pehla, <b>policer</b>, darwaze par khada hai aur kehta hai "100 andar, baaki sab ghar jao" ya, agar dayalu hai, "peeche khade hokar dekh sakte ho, lekin bheed hui to sabse pehle tum nikaale jaoge". Doosra, <b>shaper</b>, ke paas waiting room hai: woh steady pace par logon ko andar bhejta hai aur baaki lobby mein baithe rehte hain jab tak jagah na bane. Jab tak lobby bhi full na ho, kisi ko wapas nahi bheja jaata. Dono rate enforce karte hain. Pehla kisi ko delay nahi karta aur doosra hamesha karta hai.</p>

<h3>Token bucket saadi bhasha mein</h3>
<p>Dono tools wahi maths use karte hain. Ek bucket socho jisme kuch tokens aa sakte hain. Ek nal fixed speed se bucket mein naye tokens tapkata hai. Ek token ek byte (ya bit) ka bhugtan karta hai. Packet bhejne ke liye router bucket se uske size ke barabar tokens nikalta hai. Agar kaafi tokens hain, packet <b>conform</b> karta hai aur bhej diya jaata hai. Nahi, to woh conform nahi karta aur kuch aur hota hai: drop, re-mark ya wait.</p>
<dl class="terms">
<dt>CIR (committed information rate)</dt><dd>Nal kitni tez tapkata hai: aapke allow kiya hua long-term average rate, bits per second mein.</dd>
<dt>Bc (committed burst)</dt><dd>Bucket ka size: kitne tokens save ho sakte hain. Idle raha flow phir line rate par chhota burst bhej sakta hai. <code>police</code> ke liye bytes mein, <code>shape</code> ke liye bits mein.</dd>
<dt>Be (excess burst)</dt><dd>Contract se thode upar ke traffic ke liye optional doosra bucket.</dd>
<dt>Tc (time interval)</dt><dd>Bc ko CIR se bhaag do. Shaper har Tc mein adhik se adhik Bc bits chhodta hai.</dd>
</dl>
<p><code>police</code> ka router default Bc = CIR / 32 bytes hai (minimum 1500), jo CIR par 250 ms ke traffic ke barabar hai. Simulator theek yahi dikhata hai: 3,000,000 bps policer ke liye <code>bc 93750 bytes</code> print karta hai, kyunki 3,000,000 / 32 = 93,750.</p>

<h3>Policing</h3>
<p>Policer traffic naapta hai aur turant, bina buffer ke, faisla karta hai. Single-rate, two-colour form mein do actions hain:</p>
<ul>
<li><b>conform-action</b>: packet bucket mein fit hota hai. Aam taur par <code>transmit</code>.</li>
<li><b>exceed-action</b>: nahi hota. <code>drop</code>, ya <code>set-dscp-transmit</code> se marking kam karke phir bhi bhej do.</li>
</ul>
<p>Be bhi configure karo to teesra, optional <b>violate-action</b> aata hai (three colours). Conform hara hai, exceed peela (CIR se upar lekin excess bucket ke andar) aur violate laal (dono ke paar). Typical use: green transmit, yellow AF12 ki tarah bhejo, red drop. Policing <b>input ya output</b> dono par lag sakti hai. Delay nahi jodti, lekin burst losses karti hai jo TCP notice karta hai.</p>
<pre class="code">R1(config)# policy-map MARK-IN
R1(config-pmap)# class BULK
R1(config-pmap-c)# set dscp af11
R1(config-pmap-c)# police 3000000 conform-action transmit exceed-action drop
R1(config)# interface GigabitEthernet0/1
R1(config-if)# service-policy input MARK-IN
PC-DATA> traffic 10.20.0.100 tcp/445 6000 30
R1# show policy-map interface GigabitEthernet0/1 input</pre>
<pre class="out">    Class-map: BULK (match-any)  
      16080 packets, 22512000 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: access-group name BULK-SMB
        16080 packets, 22512000 bytes
        30 second rate 0000 bps
      police:
          cir 3000000 bps, bc 93750 bytes
        conformed 8107 packets, 11343750 bytes; actions:
          transmit 
        exceeded 7973 packets, 11168250 bytes; actions:
          drop 
        conformed 0000 bps, exceeded 0000 bps
      QoS Set
        dscp af11
          Packets marked 16080</pre>
<p>SMB backup ne 6 Mbps offer kiya. Policer ne lagbhag aadha nikalne diya: 8,107 packets conform hue (30 s mein 11.3 MB, yaani lagbhag 3.0 Mbps) aur 7,973 exceed hokar drop hue. Packets marked counter (16,080) us class ke dekhe saare packets ke barabar hai, un 7,973 ko milakar jinhe policer ne baad mein drop kiya.</p>

<h3>Three-colour policer</h3>
<pre class="code">R1(config)# policy-map P3
R1(config-pmap)# class class-default
R1(config-pmap-c)# police cir 1000000 bc 31250 be 31250 conform-action transmit exceed-action set-dscp-transmit af12 violate-action drop
R1(config)# interface GigabitEthernet0/1
R1(config-if)# service-policy input P3
PC-DATA> traffic 10.20.0.100 udp/5001 3000 10
R1# show policy-map interface GigabitEthernet0/1 input</pre>
<pre class="out">    Class-map: class-default (match-any)  
      18750 packets, 3750000 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: any 
      police:
          cir 1000000 bps, bc 31250 bytes, be 31250 bytes
        conformed 6406 packets, 1281250 bytes; actions:
          transmit 
        exceeded 156 packets, 31250 bytes; actions:
          set-dscp-transmit af12 
        violated 12188 packets, 2437500 bytes; actions:
          drop </pre>
<p>1 Mbps contract mein 3 Mbps offered: lagbhag ek tihai conform hua, ek chhota hissa (156 packets, theek 31,250-byte excess bucket) AF12 re-mark hokar bheja gaya, aur baaki (12,188 packets) violating tha aur drop hua.</p>

<h3>Shaping</h3>
<p>Shaper wahi bucket use karta hai, lekin non-conforming packets ko <b>queue mein roka</b> jaata hai aur tokens aane par baad mein chhoda jaata hai. Output rate smooth hota hai, kabhi CIR se upar nahi, aur chhote bursts buffer absorb kar leta hai. Isse <b>delay aur jitter</b> badhta hai, aur agar sustained rate der tak CIR se upar rahe to buffer bhar jaata hai aur shaper bhi drop karta hai. Router par shaping sirf <b>output</b> direction mein lagti hai. Command <code>shape average</code> hai, aur kyunki shaper ko pata hona chahiye ki queue kahan karni hai, aam taur par yeh top (parent) policy hoti hai jiske neeche child queuing policy hoti hai.</p>
<pre class="code">R1(config)# policy-map CH
R1(config-pmap)# class EF-Q
R1(config-pmap-c)# priority 500
R1(config-pmap)# class class-default
R1(config-pmap-c)# fair-queue
R1(config)# policy-map PARENT
R1(config-pmap)# class class-default
R1(config-pmap-c)# shape average 2000000
R1(config-pmap-c)# service-policy CH
R1(config)# interface GigabitEthernet0/0
R1(config-if)# service-policy output PARENT
PHONE> traffic 10.20.0.100 udp/20000 400 20 dscp ef
PC-DATA> traffic 10.20.0.100 tcp/445 4000 20
R1# show policy-map interface GigabitEthernet0/0 output</pre>
<pre class="out">  Service-policy output: PARENT

    Class-map: class-default (match-any)  
      12140 packets, 10996000 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: any 
      Queueing
      queue limit 64 packets
      (queue depth/total drops/no-buffer drops) 0/0/0
      (pkts output/bytes output) 8256/5550000
      shape (average) cir 2000000, bc 8000, be 8000
      target shape rate 2000000

      Service-policy : CH

        Class-map: EF-Q (match-any)  
          5000 packets, 1000000 bytes
          Priority: 500 kbps, burst bytes 12500, b/w exceed drops: 0
          (queue depth/total drops/no-buffer drops) 0/0/0
          (pkts output/bytes output) 5000/1000000

        Class-map: class-default (match-any)  
          7140 packets, 9996000 bytes
          (queue depth/total drops/no-buffer drops) 0/3884/0
          (pkts output/bytes output) 3256/4550000
          Fair-queue: per-flow queue limit 16 packets</pre>
<p>(Jagah bachane ke liye har class ki kuch lines yahan chhodi gayi hain; woh wahi offered-rate aur match lines hain jo aap dekh chuke ho.) Parent poore 10 Mbps port ko <code>cir 2000000</code> aur <code>bc 8000</code> par shape karta hai, isliye Tc = 8000 / 2,000,000 = 4 ms. EF class shaped rate ke andar pehle jaati hai aur kuch nahi khoti: 5,000 mein se 5,000 packets. Backup, jo 2 Mbps shaper mein 4 Mbps offer kar raha tha, buffer hua aur shaped rate par smooth hua, lekin woh queue ke drain hone se tez aata raha, isliye queue overflow hui: class-default mein 3,884 drops. Shaping pehle delay jodti hai aur loss tabhi jab buffer khatam ho jaaye.</p>

<h3>Policing versus shaping</h3>
<div class="dia"><svg viewBox="0 0 660 200" role="img" aria-label="Policer aur shaper ke rate graphs">
<text x="165" y="18" text-anchor="middle" class="svg-ink" font-size="13">Policing</text><text x="495" y="18" text-anchor="middle" class="svg-ink" font-size="13">Shaping</text>
<path d="M20 30 V160 H310 M350 30 V160 H640" stroke="#64748b" stroke-width="1.5" fill="none"/>
<path d="M20 100 H310 M350 100 H640" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5 4" fill="none"/>
<text x="318" y="98" class="svg-accent" font-size="11" text-anchor="end">CIR</text>
<polyline points="20,150 60,150 80,50 110,50 125,150 170,150 190,60 230,60 245,150 310,150" stroke="#94a3b8" stroke-width="2" fill="none"/>
<polyline points="20,150 60,150 80,100 110,100 125,150 170,150 190,100 230,100 245,150 310,150" stroke="#0284c7" stroke-width="3" fill="none"/>
<polyline points="350,150 390,150 410,50 440,50 455,150 500,150 520,60 560,60 575,150 640,150" stroke="#94a3b8" stroke-width="2" fill="none"/>
<polyline points="350,150 390,150 410,100 470,100 500,100 560,100 600,100 640,150" stroke="#0284c7" stroke-width="3" fill="none"/>
<text x="165" y="182" text-anchor="middle" class="svg-muted" font-size="11">peaks kat jaate hain (drop ya re-mark)</text>
<text x="495" y="182" text-anchor="middle" class="svg-muted" font-size="11">peaks failaye jaate hain (delay)</text>
</svg><p class="cap">Grey: aaya hua traffic. Blue: jo nikla. Policer kaatta hai; shaper smooth karke delay karta hai.</p></div>
<div class="tbl"><table>
<tr><th>Feature</th><th>Policing</th><th>Shaping</th></tr>
<tr><td>Excess traffic</td><td>Drop, ya re-mark karke bhejna</td><td>Buffer karke baad mein bhejna</td></tr>
<tr><td>Delay aur jitter</td><td>Kuch nahi jodta</td><td>Jodta hai (queue)</td></tr>
<tr><td>Output pattern</td><td>Bursty, peak par kata hua</td><td>Smooth</td></tr>
<tr><td>Direction</td><td>Input ya output</td><td>Sirf output</td></tr>
<tr><td>Memory</td><td>Buffer nahi</td><td>Buffer aur queue chahiye</td></tr>
<tr><td>TCP par asar</td><td>Drops se retransmissions aur sawtooth throughput</td><td>Narm, TCP delay ke saath adapt karta hai</td></tr>
<tr><td>Command</td><td><code>police</code></td><td><code>shape average</code></td></tr>
<tr><td>Aam use</td><td>Service provider customer ko limit karta hai; edge par scavenger ya guest traffic limit karna; LLQ ke andar voice policer</td><td>Customer 1 Gbps port ko 100 Mbps contracted service mein bhejta hai; subrate Frame Relay ya Metro Ethernet links</td></tr>
</table></div>

<div class="eg"><p><b>Worked example.</b> Provider Pune branch ko 1 Gbps hand-off par 20 Mbps service bechta hai aur ingress par 20 Mbps par police karta hai. Agar branch router sidha 1 Gbps line rate bursts bheje, to provider ka policer 20 Mbps se upar ka har burst drop karta hai, chahe long-term average kam ho. Fix customer side par hai: WAN port par parent policy <code>shape average 20000000</code> aur child ki tarah LLQ policy. Ab bursts customer router mein queue hote hain, voice shaped rate ke andar pehle jaati hai, aur provider ke policer ko kabhi excess packet dikhta hi nahi. Policers bursts ko saza dete hain; shapers unhe rokte hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Input policy par <code>shape</code> try karna (allowed nahi). Smoothing chahiye thi lekin policer lagaya: drops link par loss jaise dikhte hain. Shaping ko free samajhna: yeh queuing delay jodti hai, isliye voice traffic ko shaper ke andar apni priority queue chahiye. Burst units mix karna (displays mein police ke liye bytes, shape ke liye bits).</p></div>

<div class="exam"><p><b>Exam traps.</b> Policing: drop ya re-mark, buffer nahi, input ya output. Shaping: buffer aur delay, sirf output. Dono token bucket (CIR aur Bc) use karte hain. Policer ke teen outcomes: conform, exceed, violate. Service-provider CIR ki taraf shaping provider ke policer ko aapko drop karne se rokti hai. Koi bhi bandwidth nahi badhata.</p></div>

<div class="scn"><h4>1 Gbps port par 100 Mbps ka contract</h4><p>Head office ka hand-off 1 Gbps port par upgrade karne ke baad users ne shikayat ki ki file transfers purane 100 Mbps link se bhi dheeme hain. Provider ab bhi 100 Mbps bechta tha aur ingress par police karta tha. 1 Gbps ke chhote bursts kat rahe the, TCP har baar zor se peeche hat jaata tha, aur throughput average 40 Mbps tha. Router par 98 Mbps ka shaper, child LLQ policy ke saath, lagane se transfers lagbhag 95 Mbps par aa gaye aur voice saaf rahi.</p><p><b>Seekh:</b> jab physical port contract se tez ho, to contracted rate se thoda neeche shape karo.</p></div>

<div class="iv"><p class="q">"Policing ya shaping: kaunsa use karoge aur kahan?"</p><p>Policing excess ko turant drop ya re-mark karti hai aur dono directions mein lag sakti hai; limit enforce karne ke liye, jaise ISP par ya guest traffic par. Shaping excess ko buffer karke CIR par chhodti hai, sirf output; jab port contracted rate se tez ho to customer side par. Batao ki shaping delay jodti hai aur dono token bucket (CIR aur Bc) par chalte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Token bucket: tokens CIR par aate hain, bucket mein Bc aata hai; kaafi tokens hon to packet conform karta hai.</li>
<li>Policer: conform, exceed, violate actions (transmit, set-dscp-transmit, drop); delay nahi; input ya output.</li>
<li>Shaper: excess ko smooth CIR tak buffer karta hai; delay aur jitter jodta hai; sirf output; buffer full hone par hi drop karta hai.</li>
<li>Default police Bc CIR / 32 bytes hai (3 Mbps ka 93,750).</li>
<li>Provider contract se thoda neeche shape karo taaki unka policer aapko drop na kare.</li>
</ul></div>
`}};export{e as default};