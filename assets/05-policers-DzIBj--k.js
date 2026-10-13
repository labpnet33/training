var e={id:`policers`,h:{en:`Policers: enforcing a rate, hard and soft`,hi:`Policers: rate lagoo karna, hard aur soft`},body:{en:`
<p>Classification sorts traffic. A <b>policer</b> limits how much of it is allowed. Think of the rope in the airport lane: it lets a fixed number of people through per minute, and the rest are either turned away or sent to a slower lane. Junos policers are used to protect a link from a noisy user, to enforce a contracted rate with a customer, or to stop a high-priority class from taking the whole link.</p>

<h3>The token bucket</h3>
<p>A single-rate policer is a <b>token bucket</b>. Tokens arrive at a steady speed, the <code>bandwidth-limit</code> (bits per second). The bucket holds at most <code>burst-size-limit</code> bytes of tokens. Each packet needs tokens equal to its size. If enough tokens are in the bucket the packet is <b>in profile</b> and passes. If not, it is <b>out of profile</b> and gets the <code>then</code> action.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Token bucket">
<rect x="40" y="60" width="110" height="50" rx="8" fill="#bae6fd"/><text x="95" y="90" text-anchor="middle" class="svg-ink" font-size="13">Packets in</text>
<rect x="250" y="40" width="140" height="90" rx="10" fill="#fde68a"/><text x="320" y="75" text-anchor="middle" class="svg-ink" font-size="13">Token bucket</text><text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="11">size = burst-size-limit</text><text x="320" y="113" text-anchor="middle" class="svg-muted" font-size="11">fill = bandwidth-limit</text>
<rect x="490" y="30" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="555" y="55" text-anchor="middle" class="svg-ink" font-size="13">In profile: pass</text>
<rect x="490" y="100" width="130" height="40" rx="8" fill="#fed7aa"/><text x="555" y="125" text-anchor="middle" class="svg-ink" font-size="13">Out: then action</text>
<line x1="150" y1="85" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><line x1="390" y1="70" x2="490" y2="50" stroke="#64748b" stroke-width="2"/><line x1="390" y1="100" x2="490" y2="120" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Enough tokens: the packet passes. Not enough: the policer action applies.</p></div>

<h3>Hard and soft policers</h3>
<table class="cmp"><tr><th>then action</th><th>Type</th><th>Effect on excess traffic</th></tr>
<tr><td><code>discard</code></td><td>Hard</td><td>Dropped immediately</td></tr>
<tr><td><code>loss-priority high</code></td><td>Soft</td><td>Forwarded, but first to be dropped in a congested queue</td></tr>
<tr><td><code>forwarding-class X</code></td><td>Reclassify</td><td>Moved to another class and queue</td></tr></table>
<pre class="code"><span class="c"># config on HUB: a hard 2 Mbps policer for guests</span>
set firewall policer P-GUEST if-exceeding bandwidth-limit 2m
set firewall policer P-GUEST if-exceeding burst-size-limit 30k
set firewall policer P-GUEST then discard</pre>

<h3>Attaching a policer</h3>
<p>There are two ways. The first uses a filter term, so only matching traffic is policed. This is what the guest lab does at the Indore hub, where guests live in 10.77.20.0/24 and staff in 10.77.10.0/24:</p>
<pre class="code">set firewall family inet filter GUEST-LIMIT term guests from source-address 10.77.20.0/24
set firewall family inet filter GUEST-LIMIT term guests then policer P-GUEST
set firewall family inet filter GUEST-LIMIT term guests then count guest-pkts
set firewall family inet filter GUEST-LIMIT term guests then accept
set firewall family inet filter GUEST-LIMIT term others then accept
set interfaces ge-0/0/1 unit 0 family inet filter input GUEST-LIMIT
commit</pre>
<p>The second attaches the policer to the whole unit: <code>set interfaces ge-0/0/1 unit 0 family inet policer input P-GUEST</code>. Its instance name includes the interface, for example <code>P-GUEST-ge-0/0/1.0-inet-i</code>.</p>

<h3>Proof from the simulator</h3>
<p>A guest streams 6 Mbps of UDP for 10 seconds. A staff member sends the same stream. Results:</p>
<pre class="out">GUEST&gt; traffic show
ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
1   203.0.113.80       udp/8443   0     6000     10/10 37500     12650      <span class="hl">66.3%</span>

STAFF&gt; traffic show
ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
1   203.0.113.80       udp/8443   0     6000     10/10 37500     37500      <span class="hl">0.0%</span>

lab@HUB&gt; show firewall filter GUEST-LIMIT
Filter: GUEST-LIMIT
Counters:
Name                                                Bytes              Packets
guest-pkts                                        7500000                37500
Policers:
Name                                                Bytes              Packets
<span class="hl">P-GUEST-guests                                    4970000                24850</span></pre>
<p>Reading it: the counter saw all 37,500 guest packets. The policer counted 24,850 of them as out of profile, those are the ones discarded. The guest gets about one third of 6 Mbps, which is the 2 Mbps limit. Staff traffic never matched the term, so it passed with no loss. <code>clear firewall all</code> resets these counters, which is useful before a test.</p>

<h3>The soft version</h3>
<p>Changing only the last line to <code>then loss-priority high</code> (and attaching the policer to the unit) gives:</p>
<pre class="out">GUEST&gt; traffic show
1   203.0.113.80       udp/8443   0     6000     10/10 37500     37500      <span class="hl">0.0%</span>

lab@HUB&gt; show policer
Name                                                Bytes              Packets
P-GUEST-ge-0/0/1.0-inet-i                         4970000                24850</pre>
<p>Zero loss, yet 24,850 packets were still counted as out of profile. They were not dropped; they were re-marked with high loss priority. They would be the first to go if a downstream queue filled. A soft policer alone does not limit the rate; it only prepares the traffic for the drop profiles of chapter 6.</p>

<div class="eg"><p><b>Worked example: sizing the burst.</b> A 2 Mbps limit is 250,000 bytes per second, or 250 bytes per millisecond. The usual starting point is the traffic the link sends in about 5 ms, which is 1,250 bytes, but never less than the maximum packet size. Since a full Ethernet frame is 1,500 bytes, 30k is a safe lab value and allows bursts of about 20 full frames. Too small a burst drops legal traffic on every micro-burst; too large lets bursts through unchecked.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Policing the whole unit when only guests should be limited, which also slows staff. (2) A burst size below one packet, so nothing ever passes. (3) Forgetting the <code>others</code> term and discarding all non-guest traffic. (4) Expecting a soft policer to cut the rate. Also note that the three-colour policers (single-rate and two-rate) exist for committed and peak rates; they are configured under <code>firewall three-color-policer</code> and are not part of the labs here.</p></div>
<div class="exam"><p><b>Exam trap.</b> A policer drops or marks excess traffic; a shaper delays it. The exam may ask which one buffers packets. Policers never buffer. Also, <code>bandwidth-limit</code> is in bits per second while <code>burst-size-limit</code> is in bytes.</p></div>

<div class="scn"><h4>The guest Wi-Fi that ate the uplink</h4><p>At a co-working hub, guests streaming video filled a 10 Mbps uplink and staff could not reach the cloud CRM. The engineer did not want to block guests, only to cap them. A policer on the guest subnet source address at 2 Mbps in an input filter fixed it. The <code>count</code> action showed 66 percent of guest packets policed during peak, proving the cap worked, while staff counters stayed at zero.</p><p><b>Lesson:</b> match the traffic you want to limit, police it, and count it so you can prove the effect.</p></div>

<div class="iv"><p class="q">"What is the difference between policing and shaping?"</p><p>A policer measures traffic against a rate and immediately drops or re-marks the excess; it uses no buffer. A shaper holds excess packets in a queue and releases them at the configured rate, which adds delay but avoids loss. I would police at a network edge to enforce a contract and shape on an egress port towards a slower circuit.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A policer is a token bucket: <code>bandwidth-limit</code> is the rate, <code>burst-size-limit</code> the depth.</li>
<li><code>then discard</code> is hard; <code>then loss-priority high</code> is soft.</li>
<li>Attach in a filter term to police only matching traffic, or on the unit for all traffic.</li>
<li>Counters: <code>show policer</code>, <code>show firewall filter</code>, reset with <code>clear firewall all</code>.</li>
<li>Policers never buffer; shaping delays traffic.</li>
</ul></div>
`,hi:`
<p>Classification traffic ko chhantta hai. <b>Policer</b> yeh limit karta hai ki uska kitna hissa allowed hai. Airport lane ki rassi socho: woh ek minute mein fixed logon ko jaane deti hai, baaki ya to wapas bhej diye jaate hain ya dheemi lane mein. Junos policers kisi shorr machane wale user se link bachane, customer ke saath contracted rate lagoo karne, ya high-priority class ko poora link lene se rokne ke liye use hote hain.</p>

<h3>Token bucket</h3>
<p>Single-rate policer ek <b>token bucket</b> hai. Tokens ek steady speed se aate hain, jise <code>bandwidth-limit</code> (bits per second) kehte hain. Bucket mein zyada se zyada <code>burst-size-limit</code> bytes ke tokens rehte hain. Har packet ko apne size jitne tokens chahiye. Bucket mein kaafi tokens hon to packet <b>in profile</b> hai aur nikal jaata hai. Nahi hon to woh <b>out of profile</b> hai aur use <code>then</code> action milta hai.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Token bucket">
<rect x="40" y="60" width="110" height="50" rx="8" fill="#bae6fd"/><text x="95" y="90" text-anchor="middle" class="svg-ink" font-size="13">Packets aaye</text>
<rect x="250" y="40" width="140" height="90" rx="10" fill="#fde68a"/><text x="320" y="75" text-anchor="middle" class="svg-ink" font-size="13">Token bucket</text><text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="11">size = burst-size-limit</text><text x="320" y="113" text-anchor="middle" class="svg-muted" font-size="11">fill = bandwidth-limit</text>
<rect x="490" y="30" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="555" y="55" text-anchor="middle" class="svg-ink" font-size="13">In profile: pass</text>
<rect x="490" y="100" width="130" height="40" rx="8" fill="#fed7aa"/><text x="555" y="125" text-anchor="middle" class="svg-ink" font-size="13">Out: then action</text>
<line x1="150" y1="85" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><line x1="390" y1="70" x2="490" y2="50" stroke="#64748b" stroke-width="2"/><line x1="390" y1="100" x2="490" y2="120" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Tokens kaafi: packet nikal jaata hai. Kaafi nahi: policer action lagta hai.</p></div>

<h3>Hard aur soft policers</h3>
<table class="cmp"><tr><th>then action</th><th>Type</th><th>Excess traffic par asar</th></tr>
<tr><td><code>discard</code></td><td>Hard</td><td>Turant drop</td></tr>
<tr><td><code>loss-priority high</code></td><td>Soft</td><td>Aage jaata hai, lekin congested queue mein sabse pehle drop hota hai</td></tr>
<tr><td><code>forwarding-class X</code></td><td>Reclassify</td><td>Doosri class aur queue mein shift</td></tr></table>
<pre class="code"><span class="c"># config HUB par: guests ke liye hard 2 Mbps policer</span>
set firewall policer P-GUEST if-exceeding bandwidth-limit 2m
set firewall policer P-GUEST if-exceeding burst-size-limit 30k
set firewall policer P-GUEST then discard</pre>

<h3>Policer lagana</h3>
<p>Do tareeke hain. Pehla filter term se, jisse sirf matching traffic police hota hai. Indore hub ka guest lab yahi karta hai, jahan guests 10.77.20.0/24 mein aur staff 10.77.10.0/24 mein hain:</p>
<pre class="code">set firewall family inet filter GUEST-LIMIT term guests from source-address 10.77.20.0/24
set firewall family inet filter GUEST-LIMIT term guests then policer P-GUEST
set firewall family inet filter GUEST-LIMIT term guests then count guest-pkts
set firewall family inet filter GUEST-LIMIT term guests then accept
set firewall family inet filter GUEST-LIMIT term others then accept
set interfaces ge-0/0/1 unit 0 family inet filter input GUEST-LIMIT
commit</pre>
<p>Doosra tareeka policer ko poori unit par lagana hai: <code>set interfaces ge-0/0/1 unit 0 family inet policer input P-GUEST</code>. Uske instance naam mein interface hota hai, jaise <code>P-GUEST-ge-0/0/1.0-inet-i</code>.</p>

<h3>Simulator se saboot</h3>
<p>Ek guest 10 second ke liye 6 Mbps UDP stream karta hai. Ek staff member wahi stream bhejta hai. Nateeje:</p>
<pre class="out">GUEST&gt; traffic show
ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
1   203.0.113.80       udp/8443   0     6000     10/10 37500     12650      <span class="hl">66.3%</span>

STAFF&gt; traffic show
ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
1   203.0.113.80       udp/8443   0     6000     10/10 37500     37500      <span class="hl">0.0%</span>

lab@HUB&gt; show firewall filter GUEST-LIMIT
Filter: GUEST-LIMIT
Counters:
Name                                                Bytes              Packets
guest-pkts                                        7500000                37500
Policers:
Name                                                Bytes              Packets
<span class="hl">P-GUEST-guests                                    4970000                24850</span></pre>
<p>Padhna: counter ne saare 37,500 guest packets dekhe. Policer ne unmein se 24,850 ko out of profile gina, yahi discard hue. Guest ko 6 Mbps ka lagbhag ek tihai milta hai, jo 2 Mbps limit hai. Staff traffic term se match hi nahi hua, isliye bina loss ke nikla. <code>clear firewall all</code> in counters ko reset karta hai, jo test se pehle kaam aata hai.</p>

<h3>Soft version</h3>
<p>Sirf aakhri line ko <code>then loss-priority high</code> karne (aur policer ko unit par lagane) se yeh milta hai:</p>
<pre class="out">GUEST&gt; traffic show
1   203.0.113.80       udp/8443   0     6000     10/10 37500     37500      <span class="hl">0.0%</span>

lab@HUB&gt; show policer
Name                                                Bytes              Packets
P-GUEST-ge-0/0/1.0-inet-i                         4970000                24850</pre>
<p>Zero loss, phir bhi 24,850 packets out of profile gine gaye. Woh drop nahi hue; unhe high loss priority se re-mark kiya gaya. Neeche ki koi queue bhari to woh sabse pehle jaayenge. Akela soft policer rate kam nahi karta; woh sirf traffic ko chapter 6 ke drop profiles ke liye taiyaar karta hai.</p>

<div class="eg"><p><b>Worked example: burst size tay karna.</b> 2 Mbps limit matlab 250,000 bytes per second, yaani 250 bytes per millisecond. Aam shuruaati point woh traffic hai jo link lagbhag 5 ms mein bhejta hai, yaani 1,250 bytes, lekin maximum packet size se kam kabhi nahi. Full Ethernet frame 1,500 bytes ka hota hai, isliye 30k ek safe lab value hai aur lagbhag 20 full frames ke burst ko jaane deti hai. Burst bahut chhota ho to har micro-burst par legal traffic drop hota hai; bahut bada ho to bursts bina jaanch ke nikal jaate hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Jab sirf guests ko limit karna ho tab poori unit police karna, jisse staff bhi dheema ho jaata hai. (2) Ek packet se chhota burst size, jisse kuch bhi nahi nikalta. (3) <code>others</code> term bhool kar guest ke alawa saara traffic discard karna. (4) Soft policer se rate kam hone ki umeed. Yeh bhi note karo ki committed aur peak rates ke liye three-colour policers (single-rate aur two-rate) hote hain; woh <code>firewall three-color-policer</code> ke neeche configure hote hain aur yahan ke labs ka hissa nahi hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Policer excess traffic ko drop ya mark karta hai; shaper use delay karta hai. Exam poochh sakta hai ki kaun packets ko buffer karta hai. Policers kabhi buffer nahi karte. Yeh bhi: <code>bandwidth-limit</code> bits per second mein hai jabki <code>burst-size-limit</code> bytes mein.</p></div>

<div class="scn"><h4>Guest Wi-Fi jisne uplink kha liya</h4><p>Ek co-working hub mein video stream karte guests ne 10 Mbps uplink bhar diya aur staff cloud CRM tak nahi pahunch paya. Engineer guests ko block nahi karna chahta tha, sirf cap karna chahta tha. Input filter mein guest subnet source address par 2 Mbps ka policer lagane se masla hal hua. <code>count</code> action ne peak mein 66 percent guest packets police hote dikhaye, jisse cap ka kaam karna saabit hua, jabki staff counters zero rahe.</p><p><b>Lesson:</b> jis traffic ko limit karna hai use match karo, police karo, aur count karo taaki asar saabit kar sako.</p></div>

<div class="iv"><p class="q">"Policing aur shaping mein kya difference hai?"</p><p>Policer traffic ko rate ke against naapta hai aur excess ko turant drop ya re-mark karta hai; woh buffer use nahi karta. Shaper excess packets ko queue mein rokta hai aur configured rate par chhodta hai, jisse delay badhta hai lekin loss bachta hai. Contract lagoo karne ke liye main network edge par police karunga aur dheemi circuit ki taraf egress port par shape karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policer ek token bucket hai: <code>bandwidth-limit</code> rate hai, <code>burst-size-limit</code> gehraai.</li>
<li><code>then discard</code> hard hai; <code>then loss-priority high</code> soft hai.</li>
<li>Sirf matching traffic police karne ke liye filter term mein lagao, ya saare traffic ke liye unit par.</li>
<li>Counters: <code>show policer</code>, <code>show firewall filter</code>, reset <code>clear firewall all</code> se.</li>
<li>Policers kabhi buffer nahi karte; shaping traffic ko delay karta hai.</li>
</ul></div>
`}};export{e as default};