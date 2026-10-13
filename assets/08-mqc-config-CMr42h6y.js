var e={id:`mqc-config`,h:{en:`Configuring MQC step by step: a full branch policy`,hi:`MQC step by step configure karna: poori branch policy`},body:{en:`
<p>Think of building a sorting machine in three stages. First you write the sorting rules on cards ("parcels to Delhi", "fragile"). Then you decide what happens to each card: stamp it, weigh it, send it down the express belt. Finally you bolt the whole machine onto a particular conveyor, on the way in or on the way out. Cisco's <b>Modular QoS CLI (MQC)</b> is exactly three steps, and almost every QoS configuration you will ever read follows it.</p>

<h3>The three MQC steps</h3>
<div class="dia"><svg viewBox="0 0 660 170" role="img" aria-label="Three MQC steps">
<rect x="10" y="40" width="190" height="80" rx="8" fill="#bae6fd"/><text x="105" y="68" text-anchor="middle" class="svg-ink" font-size="13">1. class-map</text><text x="105" y="88" text-anchor="middle" class="svg-muted" font-size="11">WHAT traffic?</text><text x="105" y="106" text-anchor="middle" class="svg-muted" font-size="11">match ...</text>
<rect x="235" y="40" width="190" height="80" rx="8" fill="#ddd6fe"/><text x="330" y="68" text-anchor="middle" class="svg-ink" font-size="13">2. policy-map</text><text x="330" y="88" text-anchor="middle" class="svg-muted" font-size="11">WHAT to do with it?</text><text x="330" y="106" text-anchor="middle" class="svg-muted" font-size="11">set / police / priority / bandwidth / shape</text>
<rect x="460" y="40" width="190" height="80" rx="8" fill="#bbf7d0"/><text x="555" y="68" text-anchor="middle" class="svg-ink" font-size="13">3. service-policy</text><text x="555" y="88" text-anchor="middle" class="svg-muted" font-size="11">WHERE and which way?</text><text x="555" y="106" text-anchor="middle" class="svg-muted" font-size="11">interface, input or output</text>
<path d="M200 80 H235 M425 80 H460" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="330" y="150" text-anchor="middle" class="svg-accent" font-size="12">Nothing happens until step 3: a policy that is not attached does nothing.</text>
</svg><p class="cap">Classes are reusable; policies reference classes; interfaces reference policies.</p></div>
<ol>
<li><b>class-map</b>: define a class with one or more <code>match</code> lines. Use <code>match-any</code> or <code>match-all</code>.</li>
<li><b>policy-map</b>: list classes and apply actions to each. Inside a class: <code>set dscp</code>, <code>police</code>, <code>priority</code>, <code>bandwidth</code>, <code>shape average</code>, <code>fair-queue</code>, <code>random-detect</code>. The built-in <code>class-default</code> catches the rest.</li>
<li><b>service-policy</b>: attach the policy to an interface with <code>service-policy input NAME</code> or <code>service-policy output NAME</code>.</li>
</ol>
<div class="tbl"><table>
<tr><th>Command</th><th>Where</th><th>Meaning</th></tr>
<tr><td><code>class-map match-any NAME</code></td><td>global</td><td>Create a class; a packet needs to match any one line</td></tr>
<tr><td><code>match dscp ef</code></td><td>class-map</td><td>Match packets already marked EF</td></tr>
<tr><td><code>match access-group name ACL</code></td><td>class-map</td><td>Match what the ACL permits</td></tr>
<tr><td><code>policy-map NAME</code></td><td>global</td><td>Create a policy</td></tr>
<tr><td><code>class NAME</code></td><td>policy-map</td><td>Enter a class inside the policy</td></tr>
<tr><td><code>set dscp ef</code></td><td>policy class</td><td>Write a DSCP value (marking)</td></tr>
<tr><td><code>police RATE conform-action ... exceed-action ...</code></td><td>policy class</td><td>Enforce a rate (bits per second)</td></tr>
<tr><td><code>priority KBPS</code></td><td>policy class</td><td>Strict-priority queue, policed (LLQ)</td></tr>
<tr><td><code>bandwidth KBPS</code></td><td>policy class</td><td>Minimum guaranteed bandwidth (CBWFQ)</td></tr>
<tr><td><code>fair-queue</code></td><td>policy class</td><td>Flow-based fairness inside the class</td></tr>
<tr><td><code>shape average BPS</code></td><td>policy class</td><td>Smooth to a rate (output only)</td></tr>
<tr><td><code>service-policy output NAME</code></td><td>interface</td><td>Attach the policy outbound</td></tr>
</table></div>

<h3>The branch we will build</h3>
<p>The Pune branch uses a 10 Mbps WAN. Phone and data PC share the LAN. We need two policies: one at the LAN edge that classifies and marks (and limits the SMB backups), and one at the WAN exit that queues by DSCP.</p>
<div class="dia"><svg viewBox="0 0 660 170" role="img" aria-label="Branch topology">
<rect x="10" y="20" width="90" height="40" rx="6" fill="#bbf7d0"/><text x="55" y="45" text-anchor="middle" class="svg-ink" font-size="12">PHONE .10</text>
<rect x="10" y="100" width="90" height="40" rx="6" fill="#bae6fd"/><text x="55" y="125" text-anchor="middle" class="svg-ink" font-size="12">PC-DATA .20</text>
<rect x="160" y="60" width="80" height="40" rx="6" fill="#e2e8f0"/><text x="200" y="85" text-anchor="middle" class="svg-ink" font-size="12">SW1</text>
<rect x="300" y="60" width="80" height="40" rx="6" fill="#ddd6fe"/><text x="340" y="85" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<rect x="450" y="60" width="80" height="40" rx="6" fill="#e2e8f0"/><text x="490" y="85" text-anchor="middle" class="svg-ink" font-size="12">R2</text>
<rect x="580" y="60" width="70" height="40" rx="6" fill="#bae6fd"/><text x="615" y="85" text-anchor="middle" class="svg-ink" font-size="12">HQ-SRV</text>
<path d="M100 40 L160 72 M100 120 L160 88 M240 80 H300 M380 80 H450 M530 80 H580" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="270" y="62" text-anchor="middle" class="svg-muted" font-size="11">Gi0/1 LAN</text>
<text x="415" y="62" text-anchor="middle" class="svg-muted" font-size="11">Gi0/0 WAN 10M</text>
<text x="270" y="108" text-anchor="middle" class="svg-accent" font-size="11">MARK-IN (input)</text>
<text x="415" y="108" text-anchor="middle" class="svg-accent" font-size="11">WAN-OUT (output)</text>
<text x="330" y="150" text-anchor="middle" class="svg-muted" font-size="11">10.10.10.0/24 LAN, 172.16.0.0/30 WAN, 10.20.0.0/24 at HQ</text>
</svg><p class="cap">Mark on the way in from the LAN; queue on the way out to the WAN.</p></div>

<h3>Step 1: classification</h3>
<pre class="code">R1(config)# ip access-list extended VOICE-RTP
R1(config-ext-nacl)# permit udp 10.10.10.0 0.0.0.255 any range 16384 32767
R1(config)# ip access-list extended BULK-SMB
R1(config-ext-nacl)# permit tcp any any eq 445
R1(config)# class-map match-any VOICE
R1(config-cmap)# match access-group name VOICE-RTP
R1(config)# class-map match-any BULK
R1(config-cmap)# match access-group name BULK-SMB
R1(config)# class-map match-any EF-Q
R1(config-cmap)# match dscp ef
R1(config)# class-map match-any AF11-Q
R1(config-cmap)# match dscp af11</pre>
<p>VOICE and BULK classify by ACL, which is expensive and flexible. EF-Q and AF11-Q classify by DSCP, which is cheap and uses the marks written at the edge.</p>

<h3>Step 2: policies</h3>
<pre class="code">R1(config)# policy-map MARK-IN
R1(config-pmap)# class VOICE
R1(config-pmap-c)# set dscp ef
R1(config-pmap)# class BULK
R1(config-pmap-c)# set dscp af11
R1(config-pmap-c)# police 3000000 conform-action transmit exceed-action drop
R1(config-pmap)# class class-default
R1(config-pmap-c)# set dscp default
R1(config)# policy-map WAN-OUT
R1(config-pmap)# class EF-Q
R1(config-pmap-c)# priority 1000
R1(config-pmap)# class AF11-Q
R1(config-pmap-c)# bandwidth 2000
R1(config-pmap)# class class-default
R1(config-pmap-c)# fair-queue</pre>
<p>In MARK-IN, the last class <code>class-default</code> sets DSCP 0. That is the trust boundary at work: anything that is not voice or bulk loses whatever marking its sender gave it. In WAN-OUT, voice gets a 1 Mbps priority queue (10% of the link), bulk gets a 2 Mbps guarantee, and everything else shares the leftover by flow. The total reservation is 3 Mbps, 30% of 10 Mbps.</p>

<h3>Step 3: attachment</h3>
<pre class="code">R1(config)# interface GigabitEthernet0/1
R1(config-if)# service-policy input MARK-IN
R1(config)# interface GigabitEthernet0/0
R1(config-if)# service-policy output WAN-OUT</pre>
<p>MARK-IN goes <b>input</b> on the LAN port: packets are classified as they arrive. WAN-OUT goes <b>output</b> on the WAN port: it queues as packets leave. Check the definitions first:</p>
<pre class="code">R1# show class-map</pre>
<pre class="out"> Class Map match-any VOICE (id 1)
   Match access-group name VOICE-RTP

 Class Map match-any BULK (id 2)
   Match access-group name BULK-SMB

 Class Map match-any EF-Q (id 3)
   Match dscp ef (46)

 Class Map match-any AF11-Q (id 4)
   Match dscp af11 (10)

 Class Map match-any class-default (id 0)
   Match any </pre>

<h3>Generate load and read the counters</h3>
<p>PHONE sends a 400 kbps call (UDP 20000). PC-DATA runs an SMB backup (TCP 445, 6 Mbps) and a UDP bulk flow (8 Mbps). Together that is far over 10 Mbps. Neither source marks anything; the policy does it.</p>
<pre class="code">PHONE> traffic 10.20.0.100 udp/20000 400 30
PC-DATA> traffic 10.20.0.100 tcp/445 6000 30
PC-DATA> traffic 10.20.0.100 udp/5001 8000 30
PHONE> traffic show
R1# show policy-map interface GigabitEthernet0/1 input</pre>
<pre class="out">ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
1   10.20.0.100        udp/20000  0     400      30/30 7500      7500       0.0%

 GigabitEthernet0/1 

  Service-policy input: MARK-IN

    Class-map: VOICE (match-any)  
      7500 packets, 1500000 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: access-group name VOICE-RTP
        7500 packets, 1500000 bytes
        30 second rate 0000 bps
      QoS Set
        dscp ef
          Packets marked 7500</pre>
<p>The phone's own flow shows DSCP 0 at the source, 0.0% loss at the destination, and the input policy marked all 7,500 packets as EF. Now the WAN side:</p>
<pre class="code">R1# show policy-map interface GigabitEthernet0/0 output</pre>
<pre class="out"> GigabitEthernet0/0 

  Service-policy output: WAN-OUT

    Class-map: EF-Q (match-any)  
      7500 packets, 1500000 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: dscp ef (46)
        7500 packets, 1500000 bytes
        30 second rate 0000 bps
      Priority: 1000 kbps, burst bytes 25000, b/w exceed drops: 0
      Queueing
      queue limit 512 packets
      (queue depth/total drops/no-buffer drops) 0/0/0
      (pkts output/bytes output) 7500/1500000

    Class-map: AF11-Q (match-any)  
      8107 packets, 11343750 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: dscp af11 (10)
        8107 packets, 11343750 bytes
        30 second rate 0000 bps
      Queueing
      queue limit 64 packets
      (queue depth/total drops/no-buffer drops) 0/0/0
      (pkts output/bytes output) 8107/11343750
      bandwidth 2000 kbps

    Class-map: class-default (match-any)  
      150000 packets, 30000000 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: any 
      Queueing
      queue limit 64 packets
      (queue depth/total drops/no-buffer drops) 0/13625/0
      (pkts output/bytes output) 136375/27275000</pre>
<p>This is the full story in one screen. EF-Q: all 7,500 voice packets arrived with the EF mark and left, zero drops. AF11-Q: the backup that the 3 Mbps policer already trimmed (8,107 packets) passes with no drops. class-default: the 8 Mbps UDP flood (150,000 packets) fought for the remaining capacity and lost 13,625 packets. Voice is untouched while bulk traffic absorbs the congestion. That is QoS working.</p>

<div class="eg"><p><b>Worked example.</b> Why is the policer in MARK-IN and not in WAN-OUT? Because WAN-OUT is a queuing policy and the SMB backup is better trimmed <i>before</i> it consumes router buffer. Why does WAN-OUT match DSCP instead of the ACLs? Because MARK-IN already did the expensive work. If a second branch router later needs the same treatment, it also matches only DSCP. And why <code>set dscp default</code> in class-default of MARK-IN? So a user cannot walk in with a laptop that marks its own traffic EF.</p></div>

<h3>Rules to remember</h3>
<ul>
<li>Create classes before you refer to them in a policy; create policies before you attach them.</li>
<li>Queuing actions (<code>priority</code>, <code>bandwidth</code>, <code>fair-queue</code>, <code>shape</code>) go in policies attached <b>output</b>. Marking and policing work on either direction.</li>
<li>Each interface can have at most one policy per direction. Replace by removing the old one with <code>no service-policy output NAME</code>.</li>
<li>Within a policy, a packet is placed in the <b>first</b> class that matches, top to bottom; then <code>class-default</code>.</li>
<li><code>priority</code> and <code>bandwidth</code> cannot be mixed in the same class.</li>
<li>A parent policy with <code>shape average</code> and a child <code>service-policy</code> under it is how you shape and queue together.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Writing the policy and forgetting to attach it. Attaching MARK-IN <i>output</i> on the LAN port, when the traffic comes <i>in</i> from the LAN. Forgetting that <code>police</code> takes bits per second while <code>priority</code> and <code>bandwidth</code> take kbps. Matching on DSCP in the WAN policy but never marking at the edge, so every class stays empty.</p></div>

<div class="exam"><p><b>Exam traps.</b> MQC = class-map, policy-map, service-policy. Default class-map type is match-all. The unmatched traffic goes to class-default. Inbound or outbound is part of the attach command. Marking is usually input; LLQ is always output. Verify with <code>show policy-map interface</code>, which shows per-class counters; <code>show class-map</code> and <code>show policy-map</code> show only definitions.</p></div>

<div class="scn"><h4>Friday go-live</h4><p>An engineer pasted a complete QoS config on Friday afternoon. On Monday calls were still bad. <code>show policy-map interface</code> on the WAN port showed EF-Q with zero packets. The classes and policies were perfect, but the marking policy had never been attached to the LAN interface; the paste stopped at the policy-map. One line, <code>service-policy input MARK-IN</code>, fixed it.</p><p><b>Lesson:</b> after every QoS change, send test traffic and read the counters.</p></div>

<div class="iv"><p class="q">"Walk me through configuring QoS for voice on a branch router."</p><p>Name the three MQC steps. Class-map for voice by ACL or DSCP; policy-map that sets DSCP EF at the LAN edge on input; an LLQ policy on the WAN output with <code>priority</code> sized for the calls, <code>bandwidth</code> for key data and <code>fair-queue</code> in class-default. Attach both with <code>service-policy</code>, then verify with <code>show policy-map interface</code> and test traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MQC is three steps: class-map (what), policy-map (what to do), service-policy (where and which direction).</li>
<li>Mark and police on input at the edge; queue (priority, bandwidth, fair-queue) and shape on output.</li>
<li>Edge uses ACL classes; the core uses DSCP classes; class-default catches the rest.</li>
<li>Counters live in <code>show policy-map interface</code>; the definitions live in <code>show class-map</code> and <code>show policy-map</code>.</li>
<li>An unattached policy does nothing. Test with traffic.</li>
</ul></div>
`,hi:`
<p>Sorting machine teen stages mein banane ka socho. Pehle aap cards par sorting rules likhte ho ("Delhi ke parcels", "fragile"). Phir tay karte ho ki har card ke saath kya hoga: stamp lagao, tolo, express belt par bhejo. Ant mein poori machine ko ek khaas conveyor par bolt karte ho, andar aate waqt ya bahar jaate waqt. Cisco ka <b>Modular QoS CLI (MQC)</b> bilkul teen steps hai, aur jitni bhi QoS configuration aap padhoge lagbhag sab isi ko follow karti hai.</p>

<h3>Teen MQC steps</h3>
<div class="dia"><svg viewBox="0 0 660 170" role="img" aria-label="Teen MQC steps">
<rect x="10" y="40" width="190" height="80" rx="8" fill="#bae6fd"/><text x="105" y="68" text-anchor="middle" class="svg-ink" font-size="13">1. class-map</text><text x="105" y="88" text-anchor="middle" class="svg-muted" font-size="11">KAUNSA traffic?</text><text x="105" y="106" text-anchor="middle" class="svg-muted" font-size="11">match ...</text>
<rect x="235" y="40" width="190" height="80" rx="8" fill="#ddd6fe"/><text x="330" y="68" text-anchor="middle" class="svg-ink" font-size="13">2. policy-map</text><text x="330" y="88" text-anchor="middle" class="svg-muted" font-size="11">USKE SAATH KYA?</text><text x="330" y="106" text-anchor="middle" class="svg-muted" font-size="11">set / police / priority / bandwidth / shape</text>
<rect x="460" y="40" width="190" height="80" rx="8" fill="#bbf7d0"/><text x="555" y="68" text-anchor="middle" class="svg-ink" font-size="13">3. service-policy</text><text x="555" y="88" text-anchor="middle" class="svg-muted" font-size="11">KAHAN aur kis disha mein?</text><text x="555" y="106" text-anchor="middle" class="svg-muted" font-size="11">interface, input ya output</text>
<path d="M200 80 H235 M425 80 H460" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="330" y="150" text-anchor="middle" class="svg-accent" font-size="12">Step 3 tak kuch nahi hota: attach na ki gayi policy kuch nahi karti.</text>
</svg><p class="cap">Classes reusable hain; policies classes ko refer karti hain; interfaces policies ko.</p></div>
<ol>
<li><b>class-map</b>: ek ya zyada <code>match</code> lines se class define karo. <code>match-any</code> ya <code>match-all</code> use karo.</li>
<li><b>policy-map</b>: classes list karo aur har ek par actions lagao. Class ke andar: <code>set dscp</code>, <code>police</code>, <code>priority</code>, <code>bandwidth</code>, <code>shape average</code>, <code>fair-queue</code>, <code>random-detect</code>. Built-in <code>class-default</code> baaki sab pakadti hai.</li>
<li><b>service-policy</b>: policy ko interface par <code>service-policy input NAME</code> ya <code>service-policy output NAME</code> se attach karo.</li>
</ol>
<div class="tbl"><table>
<tr><th>Command</th><th>Kahan</th><th>Matlab</th></tr>
<tr><td><code>class-map match-any NAME</code></td><td>global</td><td>Class banao; packet ko koi ek line match karni hai</td></tr>
<tr><td><code>match dscp ef</code></td><td>class-map</td><td>Pehle se EF mark packets match karo</td></tr>
<tr><td><code>match access-group name ACL</code></td><td>class-map</td><td>Jo ACL permit karti hai woh match karo</td></tr>
<tr><td><code>policy-map NAME</code></td><td>global</td><td>Policy banao</td></tr>
<tr><td><code>class NAME</code></td><td>policy-map</td><td>Policy ke andar class mein jao</td></tr>
<tr><td><code>set dscp ef</code></td><td>policy class</td><td>DSCP value likho (marking)</td></tr>
<tr><td><code>police RATE conform-action ... exceed-action ...</code></td><td>policy class</td><td>Rate enforce karo (bits per second)</td></tr>
<tr><td><code>priority KBPS</code></td><td>policy class</td><td>Strict-priority queue, police hoti hui (LLQ)</td></tr>
<tr><td><code>bandwidth KBPS</code></td><td>policy class</td><td>Minimum guaranteed bandwidth (CBWFQ)</td></tr>
<tr><td><code>fair-queue</code></td><td>policy class</td><td>Class ke andar flow-based fairness</td></tr>
<tr><td><code>shape average BPS</code></td><td>policy class</td><td>Rate tak smooth karo (sirf output)</td></tr>
<tr><td><code>service-policy output NAME</code></td><td>interface</td><td>Policy outbound attach karo</td></tr>
</table></div>

<h3>Jo branch hum banayenge</h3>
<p>Pune branch 10 Mbps WAN use karti hai. Phone aur data PC LAN share karte hain. Humein do policies chahiye: LAN edge par ek jo classify aur mark kare (aur SMB backups ko limit kare), aur WAN exit par ek jo DSCP se queue kare.</p>
<div class="dia"><svg viewBox="0 0 660 170" role="img" aria-label="Branch topology">
<rect x="10" y="20" width="90" height="40" rx="6" fill="#bbf7d0"/><text x="55" y="45" text-anchor="middle" class="svg-ink" font-size="12">PHONE .10</text>
<rect x="10" y="100" width="90" height="40" rx="6" fill="#bae6fd"/><text x="55" y="125" text-anchor="middle" class="svg-ink" font-size="12">PC-DATA .20</text>
<rect x="160" y="60" width="80" height="40" rx="6" fill="#e2e8f0"/><text x="200" y="85" text-anchor="middle" class="svg-ink" font-size="12">SW1</text>
<rect x="300" y="60" width="80" height="40" rx="6" fill="#ddd6fe"/><text x="340" y="85" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<rect x="450" y="60" width="80" height="40" rx="6" fill="#e2e8f0"/><text x="490" y="85" text-anchor="middle" class="svg-ink" font-size="12">R2</text>
<rect x="580" y="60" width="70" height="40" rx="6" fill="#bae6fd"/><text x="615" y="85" text-anchor="middle" class="svg-ink" font-size="12">HQ-SRV</text>
<path d="M100 40 L160 72 M100 120 L160 88 M240 80 H300 M380 80 H450 M530 80 H580" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="270" y="62" text-anchor="middle" class="svg-muted" font-size="11">Gi0/1 LAN</text>
<text x="415" y="62" text-anchor="middle" class="svg-muted" font-size="11">Gi0/0 WAN 10M</text>
<text x="270" y="108" text-anchor="middle" class="svg-accent" font-size="11">MARK-IN (input)</text>
<text x="415" y="108" text-anchor="middle" class="svg-accent" font-size="11">WAN-OUT (output)</text>
<text x="330" y="150" text-anchor="middle" class="svg-muted" font-size="11">10.10.10.0/24 LAN, 172.16.0.0/30 WAN, HQ par 10.20.0.0/24</text>
</svg><p class="cap">LAN se aate waqt mark karo; WAN ke liye nikalte waqt queue karo.</p></div>

<h3>Step 1: classification</h3>
<pre class="code">R1(config)# ip access-list extended VOICE-RTP
R1(config-ext-nacl)# permit udp 10.10.10.0 0.0.0.255 any range 16384 32767
R1(config)# ip access-list extended BULK-SMB
R1(config-ext-nacl)# permit tcp any any eq 445
R1(config)# class-map match-any VOICE
R1(config-cmap)# match access-group name VOICE-RTP
R1(config)# class-map match-any BULK
R1(config-cmap)# match access-group name BULK-SMB
R1(config)# class-map match-any EF-Q
R1(config-cmap)# match dscp ef
R1(config)# class-map match-any AF11-Q
R1(config-cmap)# match dscp af11</pre>
<p>VOICE aur BULK ACL se classify karte hain, jo mehenga aur flexible hai. EF-Q aur AF11-Q DSCP se classify karte hain, jo sasta hai aur edge par likhi marks use karta hai.</p>

<h3>Step 2: policies</h3>
<pre class="code">R1(config)# policy-map MARK-IN
R1(config-pmap)# class VOICE
R1(config-pmap-c)# set dscp ef
R1(config-pmap)# class BULK
R1(config-pmap-c)# set dscp af11
R1(config-pmap-c)# police 3000000 conform-action transmit exceed-action drop
R1(config-pmap)# class class-default
R1(config-pmap-c)# set dscp default
R1(config)# policy-map WAN-OUT
R1(config-pmap)# class EF-Q
R1(config-pmap-c)# priority 1000
R1(config-pmap)# class AF11-Q
R1(config-pmap-c)# bandwidth 2000
R1(config-pmap)# class class-default
R1(config-pmap-c)# fair-queue</pre>
<p>MARK-IN mein aakhri class <code>class-default</code> DSCP 0 set karti hai. Yahi trust boundary ka kaam hai: jo voice ya bulk nahi hai woh apne sender ki di hui marking kho deta hai. WAN-OUT mein voice ko 1 Mbps priority queue milti hai (link ka 10%), bulk ko 2 Mbps guarantee, aur baaki sab bacha hua flow ke hisaab se share karta hai. Kul reservation 3 Mbps hai, 10 Mbps ka 30%.</p>

<h3>Step 3: attachment</h3>
<pre class="code">R1(config)# interface GigabitEthernet0/1
R1(config-if)# service-policy input MARK-IN
R1(config)# interface GigabitEthernet0/0
R1(config-if)# service-policy output WAN-OUT</pre>
<p>MARK-IN LAN port par <b>input</b> mein jaati hai: packets aate waqt classify hote hain. WAN-OUT WAN port par <b>output</b> mein jaati hai: packets nikalte waqt queue karti hai. Pehle definitions check karo:</p>
<pre class="code">R1# show class-map</pre>
<pre class="out"> Class Map match-any VOICE (id 1)
   Match access-group name VOICE-RTP

 Class Map match-any BULK (id 2)
   Match access-group name BULK-SMB

 Class Map match-any EF-Q (id 3)
   Match dscp ef (46)

 Class Map match-any AF11-Q (id 4)
   Match dscp af11 (10)

 Class Map match-any class-default (id 0)
   Match any </pre>

<h3>Load banao aur counters padho</h3>
<p>PHONE 400 kbps call bhejta hai (UDP 20000). PC-DATA SMB backup (TCP 445, 6 Mbps) aur UDP bulk flow (8 Mbps) chalata hai. Milakar yeh 10 Mbps se bahut upar hai. Koi source kuch mark nahi karta; policy karti hai.</p>
<pre class="code">PHONE> traffic 10.20.0.100 udp/20000 400 30
PC-DATA> traffic 10.20.0.100 tcp/445 6000 30
PC-DATA> traffic 10.20.0.100 udp/5001 8000 30
PHONE> traffic show
R1# show policy-map interface GigabitEthernet0/1 input</pre>
<pre class="out">ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
1   10.20.0.100        udp/20000  0     400      30/30 7500      7500       0.0%

 GigabitEthernet0/1 

  Service-policy input: MARK-IN

    Class-map: VOICE (match-any)  
      7500 packets, 1500000 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: access-group name VOICE-RTP
        7500 packets, 1500000 bytes
        30 second rate 0000 bps
      QoS Set
        dscp ef
          Packets marked 7500</pre>
<p>Phone ka apna flow source par DSCP 0 dikhata hai, destination par 0.0% loss, aur input policy ne saare 7,500 packets EF mark kiye. Ab WAN side:</p>
<pre class="code">R1# show policy-map interface GigabitEthernet0/0 output</pre>
<pre class="out"> GigabitEthernet0/0 

  Service-policy output: WAN-OUT

    Class-map: EF-Q (match-any)  
      7500 packets, 1500000 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: dscp ef (46)
        7500 packets, 1500000 bytes
        30 second rate 0000 bps
      Priority: 1000 kbps, burst bytes 25000, b/w exceed drops: 0
      Queueing
      queue limit 512 packets
      (queue depth/total drops/no-buffer drops) 0/0/0
      (pkts output/bytes output) 7500/1500000

    Class-map: AF11-Q (match-any)  
      8107 packets, 11343750 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: dscp af11 (10)
        8107 packets, 11343750 bytes
        30 second rate 0000 bps
      Queueing
      queue limit 64 packets
      (queue depth/total drops/no-buffer drops) 0/0/0
      (pkts output/bytes output) 8107/11343750
      bandwidth 2000 kbps

    Class-map: class-default (match-any)  
      150000 packets, 30000000 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: any 
      Queueing
      queue limit 64 packets
      (queue depth/total drops/no-buffer drops) 0/13625/0
      (pkts output/bytes output) 136375/27275000</pre>
<p>Ek screen par poori kahani. EF-Q: saare 7,500 voice packets EF mark ke saath aaye aur nikal gaye, zero drops. AF11-Q: jis backup ko 3 Mbps policer ne pehle hi trim kiya tha (8,107 packets) woh bina drops ke nikla. class-default: 8 Mbps UDP flood (150,000 packets) bachi hui capacity ke liye ladi aur 13,625 packets khoye. Voice untouched hai jabki bulk traffic congestion absorb karta hai. Yahi QoS ka kaam karna hai.</p>

<div class="eg"><p><b>Worked example.</b> Policer MARK-IN mein kyun hai, WAN-OUT mein kyun nahi? Kyunki WAN-OUT queuing policy hai aur SMB backup ko router buffer khane se <i>pehle</i> trim karna behtar hai. WAN-OUT ACLs ki jagah DSCP kyun match karti hai? Kyunki mehenga kaam MARK-IN pehle hi kar chuki hai. Agar baad mein doosre branch router ko wahi treatment chahiye, to woh bhi sirf DSCP match karega. Aur MARK-IN ke class-default mein <code>set dscp default</code> kyun? Taaki koi user aisa laptop lekar na aa sake jo apna traffic khud EF mark karta ho.</p></div>

<h3>Yaad rakhne ke rules</h3>
<ul>
<li>Policy mein refer karne se pehle classes banao; attach karne se pehle policies banao.</li>
<li>Queuing actions (<code>priority</code>, <code>bandwidth</code>, <code>fair-queue</code>, <code>shape</code>) <b>output</b> mein attach hui policies mein jaate hain. Marking aur policing dono directions mein kaam karti hain.</li>
<li>Har interface par har direction mein adhik se adhik ek policy. Badalne ke liye purani ko <code>no service-policy output NAME</code> se hatao.</li>
<li>Policy ke andar packet top se bottom <b>pehli</b> matching class mein jaata hai; phir <code>class-default</code>.</li>
<li><code>priority</code> aur <code>bandwidth</code> ek hi class mein mix nahi ho sakte.</li>
<li><code>shape average</code> wali parent policy aur uske neeche child <code>service-policy</code> se shape aur queue ek saath karte hain.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Policy likhna aur attach karna bhool jaana. MARK-IN ko LAN port par <i>output</i> mein lagana, jabki traffic LAN se <i>andar</i> aata hai. Bhool jaana ki <code>police</code> bits per second leta hai jabki <code>priority</code> aur <code>bandwidth</code> kbps. WAN policy mein DSCP match karna lekin edge par kabhi mark na karna, jisse har class khali rahti hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> MQC = class-map, policy-map, service-policy. Default class-map type match-all hai. Unmatched traffic class-default mein jaata hai. Inbound ya outbound attach command ka hissa hai. Marking aam taur par input mein; LLQ hamesha output mein. Verify <code>show policy-map interface</code> se, jo per-class counters dikhata hai; <code>show class-map</code> aur <code>show policy-map</code> sirf definitions dikhate hain.</p></div>

<div class="scn"><h4>Friday go-live</h4><p>Ek engineer ne Friday dopahar poori QoS config paste ki. Monday ko calls ab bhi kharab thi. WAN port par <code>show policy-map interface</code> ne EF-Q mein zero packets dikhaye. Classes aur policies bilkul theek thi, lekin marking policy LAN interface par kabhi attach hi nahi hui thi; paste policy-map par ruk gaya tha. Ek line, <code>service-policy input MARK-IN</code>, ne fix kar diya.</p><p><b>Seekh:</b> har QoS change ke baad test traffic bhejo aur counters padho.</p></div>

<div class="iv"><p class="q">"Branch router par voice ke liye QoS configure karna samjhao."</p><p>Teen MQC steps batao. Voice ke liye ACL ya DSCP wala class-map; LAN edge par input mein DSCP EF set karne wala policy-map; WAN output par LLQ policy jisme calls ke hisaab se size kiya <code>priority</code>, key data ke liye <code>bandwidth</code> aur class-default mein <code>fair-queue</code>. Dono ko <code>service-policy</code> se attach karo, phir <code>show policy-map interface</code> aur test traffic se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MQC teen steps hai: class-map (kya), policy-map (kya karna), service-policy (kahan aur kis direction mein).</li>
<li>Edge par input mein mark aur police karo; output mein queue (priority, bandwidth, fair-queue) aur shape karo.</li>
<li>Edge ACL classes use karta hai; core DSCP classes; class-default baaki pakadti hai.</li>
<li>Counters <code>show policy-map interface</code> mein hain; definitions <code>show class-map</code> aur <code>show policy-map</code> mein.</li>
<li>Attach na ki gayi policy kuch nahi karti. Traffic se test karo.</li>
</ul></div>
`}};export{e as default};