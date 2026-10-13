var e={id:`performance`,h:{en:`Performance: bandwidth, congestion, latency, loss and jitter`,hi:`Performance: bandwidth, congestion, latency, loss aur jitter`},body:{en:`
<p>"The network is slow" is the most common and the vaguest complaint you will ever get. Objective 5.4 gives you the vocabulary to turn it into something measurable. Picture a highway. <b>Bandwidth</b> is the number of lanes. <b>Congestion</b> is rush hour. A <b>bottleneck</b> is the one-lane bridge in the middle. <b>Latency</b> is how long the journey takes. <b>Packet loss</b> is cars that never arrive. <b>Jitter</b> is when the journey takes 20 minutes one day and 60 the next. Each has a different cause and a different fix.</p>

<h3>Bandwidth and throughput</h3>
<p><b>Bandwidth</b> is the capacity of a link, in bits per second: a 1 Gbps port, a 100 Mbps WAN circuit. <b>Throughput</b> is what you actually achieve, which is always lower because of protocol overhead, congestion, latency and loss. When a user says "I pay for 1 Gbps but only get 300 Mbps", you are comparing throughput to bandwidth, and the gap is what you must explain.</p>

<h3>Congestion and contention</h3>
<p><b>Congestion</b> happens when more traffic arrives at a point than it can send. Frames wait in a queue (latency rises), and when the queue is full, new frames are dropped (loss). <b>Contention</b> is the competition that causes it: many devices sharing one resource. Examples: 48 access ports at 1 Gbps sharing two 10 Gbps uplinks (an oversubscription of 48:20, or 2.4:1), fifty laptops sharing one Wi-Fi channel, or every branch backing up to the data center at 22:00.</p>
<pre class="out">WAN1# show interfaces gi0/1 | include load|drops|rate
  reliability 255/255, <span class="hl">txload 251/255</span>, rxload 38/255
  Input queue: 0/375/0/0 (size/max/drops/flushes); <span class="hl">Total output drops: 48213</span>
  5 minute input rate 14912000 bits/sec, 2711 packets/sec
  5 minute output rate 98534000 bits/sec, 9120 packets/sec</pre>
<p>Here the 100 Mbps WAN link sends 98.5 Mbps, txload is 251 of 255 (98%), and output drops keep rising. That is congestion in the outbound direction, not a fault in the cable.</p>

<h3>Bottlenecking</h3>
<p>End-to-end throughput can never exceed the <b>slowest link on the path</b>. Upgrading anything else does nothing.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Bottleneck on a path">
<rect x="10" y="45" width="90" height="40" rx="6" fill="#bbf7d0"/><text x="55" y="70" text-anchor="middle" class="svg-ink" font-size="12">PC</text>
<rect x="190" y="45" width="90" height="40" rx="6" fill="#bae6fd"/><text x="235" y="70" text-anchor="middle" class="svg-ink" font-size="12">Access SW</text>
<rect x="370" y="45" width="90" height="40" rx="6" fill="#bae6fd"/><text x="415" y="70" text-anchor="middle" class="svg-ink" font-size="12">Branch R</text>
<rect x="540" y="45" width="90" height="40" rx="6" fill="#ddd6fe"/><text x="585" y="70" text-anchor="middle" class="svg-ink" font-size="12">DC server</text>
<line x1="100" y1="65" x2="190" y2="65" stroke="#64748b" stroke-width="6"/><text x="145" y="38" text-anchor="middle" class="svg-muted" font-size="12">1 Gbps</text>
<line x1="280" y1="65" x2="370" y2="65" stroke="#64748b" stroke-width="8"/><text x="325" y="38" text-anchor="middle" class="svg-muted" font-size="12">10 Gbps</text>
<line x1="460" y1="65" x2="540" y2="65" stroke="#64748b" stroke-width="2"/><text x="500" y="38" text-anchor="middle" class="svg-accent" font-size="12">100 Mbps</text>
<text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">Best possible end-to-end rate: 100 Mbps</text>
</svg><p class="cap">The WAN link is the bottleneck. Upgrading the PC or the LAN will not make the file copy faster.</p></div>

<div class="eg"><p><b>Worked example: how long should the backup take?</b> A branch must copy a 10 GB backup to the data center over the 100 Mbps WAN. 10 GB = 10 x 8 = 80 Gb = 80,000 Mb. At a perfect 100 Mbps: 80,000 / 100 = 800 seconds, about 13 minutes. With roughly 10% protocol overhead, expect about 15 minutes, and much longer if the link is already busy with users. If the job takes 3 hours, something else is wrong (loss, latency or a shaping policy), because the bottleneck alone explains only 15 minutes.</p></div>

<h3>Latency</h3>
<p><b>Latency</b> is delay, usually measured as round-trip time (RTT) by ping. It has four parts: <b>propagation</b> (distance: light in fiber covers about 200 km per millisecond, so 1,000 km adds about 5 ms each way), <b>serialization</b> (time to put bits on the wire, larger on slow links), <b>queuing</b> (waiting behind other traffic, the part congestion inflates) and <b>processing</b> in each device. Satellite links add hundreds of milliseconds. High latency hurts chatty applications that need many round trips.</p>

<h3>Packet loss</h3>
<p><b>Packet loss</b> is the percentage of packets that never arrive. Causes: congestion drops, physical errors (CRC), a failing link, a policer, or wireless interference. Even 1 to 2% loss hurts a lot: TCP treats loss as congestion and slows down, so file transfers crawl, and voice calls get gaps.</p>

<h3>Jitter</h3>
<p><b>Jitter</b> is the variation in latency from packet to packet. Web browsing hardly notices it; real-time voice and video suffer, because packets must be played out at a steady rhythm. Jitter comes mainly from changing queue depth on congested links.</p>
<pre class="out">PC1&gt; ping 10.20.30.40 -c 6
84 bytes from 10.20.30.40 icmp_seq=1 ttl=62 time=21.4 ms
84 bytes from 10.20.30.40 icmp_seq=2 ttl=62 time=23.0 ms
84 bytes from 10.20.30.40 icmp_seq=3 ttl=62 <span class="hl">time=78.6 ms</span>
84 bytes from 10.20.30.40 icmp_seq=4 ttl=62 time=22.1 ms
84 bytes from 10.20.30.40 icmp_seq=5 ttl=62 <span class="hl">time=91.3 ms</span>
10.20.30.40 icmp_seq=6 timeout</pre>
<p>Average RTT is fine at times, but it swings from 21 to 91 ms (high jitter) and one packet is lost: classic signs of a congested queue. Common guideline targets for voice: one-way latency under <b>150 ms</b>, jitter under <b>30 ms</b>, loss under <b>1%</b>.</p>

<h3>Fixes that match the cause</h3>
<table class="cmp"><tr><th>Measured problem</th><th>Typical fixes</th></tr>
<tr><td>Congestion on one link</td><td>QoS (prioritise voice, limit bulk), schedule backups off-hours, add bandwidth, add links (EtherChannel, ECMP)</td></tr>
<tr><td>Bottleneck</td><td>Upgrade the slowest link, or move the workload closer (local cache, replica)</td></tr>
<tr><td>High latency</td><td>Shorter path, local services, fewer round trips (application tuning)</td></tr>
<tr><td>Loss with CRC errors</td><td>Physical fix: cable, optic, duplex (chapter 5)</td></tr>
<tr><td>Jitter for voice</td><td>QoS with a priority queue for voice; reduce congestion</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Measuring one ping and calling the network "fine". Buying more bandwidth when the problem is loss from a bad cable. Running a speed test over Wi-Fi to judge the WAN circuit. Forgetting that output drops are counted on the <b>sending</b> interface of the congested link.</p></div>

<div class="exam"><p><b>Exam traps.</b> Bandwidth is capacity; throughput is actual. Latency is delay; jitter is the variation in delay. Voice problems with choppy audio point to jitter or loss, usually fixed with QoS. The slowest link on the path is the bottleneck. Contention means many devices sharing one resource.</p></div>

<div class="scn"><h4>Choppy calls every evening</h4><p>A sales office complained that VoIP calls became robotic after 18:00. Ping from a phone VLAN host to the call server showed RTT jumping between 30 and 180 ms with 3% loss, only in the evening. Interface graphs showed the 50 Mbps WAN link at 100% from 18:00: an automated cloud backup started then. The team configured QoS with a priority queue for voice and shaped the backup to 30 Mbps. Calls became clear, and the backup still finished before midnight.</p><p><b>Lesson:</b> correlate the time of the complaint with utilisation graphs. Jitter plus loss at a busy hour means congestion.</p></div>

<div class="iv"><p class="q">"What is the difference between latency and jitter, and why does voice care about both?"</p><p>Latency is how long a packet takes to arrive; jitter is how much that time varies between packets. Voice needs low latency so conversations do not overlap (under about 150 ms one way), and low jitter so the playout buffer can keep a steady rhythm (under about 30 ms). Mention that congestion inflates queuing delay, which raises both, and that QoS priority queuing is the standard fix.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bandwidth is capacity, throughput is what you actually get; the slowest link is the bottleneck.</li>
<li>Congestion fills queues: latency rises, then output drops appear; contention is many users sharing one resource.</li>
<li>Latency = propagation + serialization + queuing + processing; jitter = variation in latency.</li>
<li>Voice targets: under 150 ms one way, under 30 ms jitter, under 1% loss.</li>
<li>Measure first (ping series, interface load and drops, graphs), then choose QoS, capacity or a physical fix.</li>
</ul></div>
`,hi:`
<p>"Network slow hai" sabse common aur sabse dhundhli shikayat hai jo aapko kabhi milegi. Objective 5.4 aapko woh vocabulary deta hai jisse aap ise measurable bana sako. Ek highway socho. <b>Bandwidth</b> lanes ki sankhya hai. <b>Congestion</b> rush hour hai. <b>Bottleneck</b> beech ka ek-lane wala pul hai. <b>Latency</b> safar mein lagne wala samay hai. <b>Packet loss</b> woh gaadiyan hain jo kabhi pahunchti nahi. <b>Jitter</b> tab hai jab safar ek din 20 minute leta hai aur agle din 60. Har ek ka cause alag hai aur fix alag.</p>

<h3>Bandwidth aur throughput</h3>
<p><b>Bandwidth</b> link ki capacity hai, bits per second mein: 1 Gbps port, 100 Mbps WAN circuit. <b>Throughput</b> woh hai jo aap asal mein haasil karte ho, jo protocol overhead, congestion, latency aur loss ki wajah se hamesha kam hota hai. Jab user kehta hai "main 1 Gbps ka paisa deta hoon lekin sirf 300 Mbps milta hai", to aap throughput ko bandwidth se compare kar rahe ho, aur yahi gap aapko samjhana hai.</p>

<h3>Congestion aur contention</h3>
<p><b>Congestion</b> tab hota hai jab kisi point par us se zyada traffic aata hai jitna woh bhej sakta hai. Frames queue mein wait karte hain (latency badhti hai), aur jab queue full ho jaati hai, naye frames drop hote hain (loss). <b>Contention</b> woh competition hai jo ise cause karta hai: kai devices ek resource share karte hain. Examples: 1 Gbps ke 48 access ports do 10 Gbps uplinks share karte hain (48:20 ya 2.4:1 ka oversubscription), pachaas laptops ek Wi-Fi channel share karte hain, ya har branch 22:00 baje data center mein backup karti hai.</p>
<pre class="out">WAN1# show interfaces gi0/1 | include load|drops|rate
  reliability 255/255, <span class="hl">txload 251/255</span>, rxload 38/255
  Input queue: 0/375/0/0 (size/max/drops/flushes); <span class="hl">Total output drops: 48213</span>
  5 minute input rate 14912000 bits/sec, 2711 packets/sec
  5 minute output rate 98534000 bits/sec, 9120 packets/sec</pre>
<p>Yahan 100 Mbps WAN link 98.5 Mbps bhej raha hai, txload 255 mein se 251 hai (98%), aur output drops badhte ja rahe hain. Yeh outbound direction mein congestion hai, cable mein fault nahi.</p>

<h3>Bottlenecking</h3>
<p>End-to-end throughput kabhi bhi <b>path ke sabse slow link</b> se zyada nahi ho sakta. Kuch aur upgrade karne se kuch nahi hota.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Path par bottleneck">
<rect x="10" y="45" width="90" height="40" rx="6" fill="#bbf7d0"/><text x="55" y="70" text-anchor="middle" class="svg-ink" font-size="12">PC</text>
<rect x="190" y="45" width="90" height="40" rx="6" fill="#bae6fd"/><text x="235" y="70" text-anchor="middle" class="svg-ink" font-size="12">Access SW</text>
<rect x="370" y="45" width="90" height="40" rx="6" fill="#bae6fd"/><text x="415" y="70" text-anchor="middle" class="svg-ink" font-size="12">Branch R</text>
<rect x="540" y="45" width="90" height="40" rx="6" fill="#ddd6fe"/><text x="585" y="70" text-anchor="middle" class="svg-ink" font-size="12">DC server</text>
<line x1="100" y1="65" x2="190" y2="65" stroke="#64748b" stroke-width="6"/><text x="145" y="38" text-anchor="middle" class="svg-muted" font-size="12">1 Gbps</text>
<line x1="280" y1="65" x2="370" y2="65" stroke="#64748b" stroke-width="8"/><text x="325" y="38" text-anchor="middle" class="svg-muted" font-size="12">10 Gbps</text>
<line x1="460" y1="65" x2="540" y2="65" stroke="#64748b" stroke-width="2"/><text x="500" y="38" text-anchor="middle" class="svg-accent" font-size="12">100 Mbps</text>
<text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">Best possible end-to-end rate: 100 Mbps</text>
</svg><p class="cap">WAN link bottleneck hai. PC ya LAN upgrade karne se file copy tez nahi hogi.</p></div>

<div class="eg"><p><b>Worked example: backup mein kitna time lagna chahiye?</b> Ek branch ko 10 GB backup 100 Mbps WAN par data center copy karna hai. 10 GB = 10 x 8 = 80 Gb = 80,000 Mb. Perfect 100 Mbps par: 80,000 / 100 = 800 second, lagbhag 13 minute. Lagbhag 10% protocol overhead ke saath lagbhag 15 minute expect karo, aur agar link pehle se users se busy hai to kaafi zyada. Agar job 3 ghante le raha hai, to kuch aur galat hai (loss, latency ya shaping policy), kyunki akela bottleneck sirf 15 minute samjhata hai.</p></div>

<h3>Latency</h3>
<p><b>Latency</b> delay hai, aam taur par ping se round-trip time (RTT) ke roop mein naapa jaata hai. Iske chaar hisse hain: <b>propagation</b> (distance: fiber mein light lagbhag 200 km per millisecond chalti hai, isliye 1,000 km har taraf lagbhag 5 ms jodta hai), <b>serialization</b> (bits ko wire par daalne ka time, slow links par zyada), <b>queuing</b> (doosre traffic ke peeche wait karna, woh hissa jo congestion badhata hai) aur har device mein <b>processing</b>. Satellite links sainkdon milliseconds jodte hain. High latency un chatty applications ko nuksaan karti hai jinhe kai round trips chahiye.</p>

<h3>Packet loss</h3>
<p><b>Packet loss</b> un packets ka percentage hai jo kabhi pahunchte nahi. Causes: congestion drops, physical errors (CRC), fail hota link, policer, ya wireless interference. 1 se 2% loss bhi bahut nuksaan karta hai: TCP loss ko congestion maanta hai aur slow ho jaata hai, isliye file transfers reng-te hain, aur voice calls mein gaps aate hain.</p>

<h3>Jitter</h3>
<p><b>Jitter</b> packet se packet latency ka variation hai. Web browsing ise mushkil se notice karti hai; real-time voice aur video pareshaan hote hain, kyunki packets ko steady rhythm mein play karna padta hai. Jitter mainly congested links par badalti queue depth se aata hai.</p>
<pre class="out">PC1&gt; ping 10.20.30.40 -c 6
84 bytes from 10.20.30.40 icmp_seq=1 ttl=62 time=21.4 ms
84 bytes from 10.20.30.40 icmp_seq=2 ttl=62 time=23.0 ms
84 bytes from 10.20.30.40 icmp_seq=3 ttl=62 <span class="hl">time=78.6 ms</span>
84 bytes from 10.20.30.40 icmp_seq=4 ttl=62 time=22.1 ms
84 bytes from 10.20.30.40 icmp_seq=5 ttl=62 <span class="hl">time=91.3 ms</span>
10.20.30.40 icmp_seq=6 timeout</pre>
<p>Average RTT kabhi kabhi theek hai, lekin 21 se 91 ms tak jhoolta hai (high jitter) aur ek packet lost hai: congested queue ke classic signs. Voice ke common guideline targets: one-way latency <b>150 ms</b> se kam, jitter <b>30 ms</b> se kam, loss <b>1%</b> se kam.</p>

<h3>Cause se match karne wale fixes</h3>
<table class="cmp"><tr><th>Naapi gayi problem</th><th>Typical fixes</th></tr>
<tr><td>Ek link par congestion</td><td>QoS (voice ko priority, bulk ko limit), backups off-hours schedule karo, bandwidth jodo, links jodo (EtherChannel, ECMP)</td></tr>
<tr><td>Bottleneck</td><td>Sabse slow link upgrade karo, ya workload ko paas le jao (local cache, replica)</td></tr>
<tr><td>High latency</td><td>Chhota path, local services, kam round trips (application tuning)</td></tr>
<tr><td>CRC errors ke saath loss</td><td>Physical fix: cable, optic, duplex (chapter 5)</td></tr>
<tr><td>Voice ke liye jitter</td><td>Voice ke liye priority queue ke saath QoS; congestion kam karo</td></tr>
</table>

<div class="warn"><p><b>Common galtiyan.</b> Ek ping naap kar network ko "theek" kehna. Jab problem kharab cable ka loss ho tab zyada bandwidth khareedna. WAN circuit judge karne ke liye Wi-Fi par speed test chalana. Yeh bhoolna ki output drops congested link ke <b>bhejne wale</b> interface par gine jaate hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> Bandwidth capacity hai; throughput actual hai. Latency delay hai; jitter delay ka variation hai. Choppy audio wali voice problems jitter ya loss ki taraf ishara karti hain, aam taur par QoS se fix. Path ka sabse slow link bottleneck hai. Contention matlab kai devices ek resource share kar rahe hain.</p></div>

<div class="scn"><h4>Har shaam choppy calls</h4><p>Ek sales office ne shikayat ki ki 18:00 ke baad VoIP calls robotic ho jaati hain. Phone VLAN host se call server tak ping ne RTT ko 30 aur 180 ms ke beech jhoolte hue 3% loss ke saath dikhaya, sirf shaam ko. Interface graphs ne 50 Mbps WAN link ko 18:00 se 100% par dikhaya: tab ek automated cloud backup shuru hota tha. Team ne voice ke liye priority queue ke saath QoS configure kiya aur backup ko 30 Mbps par shape kiya. Calls saaf ho gayi, aur backup phir bhi aadhi raat se pehle khatam ho gaya.</p><p><b>Seekh:</b> shikayat ke time ko utilisation graphs se correlate karo. Busy ghante mein jitter plus loss matlab congestion.</p></div>

<div class="iv"><p class="q">"Latency aur jitter mein kya farak hai, aur voice ko dono ki parwah kyun hai?"</p><p>Latency packet ke pahunchne ka time hai; jitter yeh hai ki woh time packets ke beech kitna badalta hai. Voice ko kam latency chahiye taaki baatcheet overlap na ho (one way lagbhag 150 ms se kam), aur kam jitter taaki playout buffer steady rhythm rakh sake (lagbhag 30 ms se kam). Mention karo ki congestion queuing delay badhata hai, jo dono ko badhata hai, aur QoS priority queuing standard fix hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bandwidth capacity hai, throughput jo asal mein milta hai; sabse slow link bottleneck hai.</li>
<li>Congestion queues bharta hai: latency badhti hai, phir output drops aate hain; contention matlab kai users ek resource share kar rahe hain.</li>
<li>Latency = propagation + serialization + queuing + processing; jitter = latency ka variation.</li>
<li>Voice targets: one way 150 ms se kam, jitter 30 ms se kam, loss 1% se kam.</li>
<li>Pehle naapo (ping series, interface load aur drops, graphs), phir QoS, capacity ya physical fix chuno.</li>
</ul></div>
`}};export{e as default};