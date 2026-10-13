var e={id:`qos-concepts`,h:{en:`QoS concepts: marking, queuing, policing and shaping`,hi:`QoS concepts: marking, queuing, policing aur shaping`},body:{en:`
<p>Think of a toll plaza at rush hour. Ten lanes of highway squeeze into three toll booths, so a queue forms. An ambulance must not wait behind fifty trucks, so it gets its own lane that always goes first. Buses get a guaranteed booth. Everyone else shares what is left, and when the queue gets too long, some cars are turned away early. <b>Quality of Service (QoS)</b> does exactly this for packets. It does not create bandwidth; it decides <b>who waits and who is dropped when there is not enough</b>.</p>

<h3>Why congestion happens</h3>
<p>Congestion occurs wherever more traffic arrives than an interface can send: a 1 Gbit/s LAN feeding a 50 Mbit/s WAN link, or twenty access ports sharing one uplink. For a few milliseconds or seconds, packets must be queued, and if the queue is full they are dropped. For email this is harmless (TCP retransmits). For a voice call it means robotic, choppy audio.</p>
<p>QoS manages four characteristics:</p>
<ul>
<li><b>Bandwidth</b>: how much capacity a class of traffic gets.</li>
<li><b>Delay (latency)</b>: how long a packet takes end to end, including queuing.</li>
<li><b>Jitter</b>: the variation in delay between packets of the same flow.</li>
<li><b>Loss</b>: the percentage of packets dropped.</li>
</ul>

<h3>What voice and video need</h3>
<table class="cmp"><tr><th>Traffic</th><th>One-way delay</th><th>Jitter</th><th>Loss</th><th>Bandwidth</th></tr>
<tr><td>Voice</td><td>≤ 150 ms</td><td>≤ 30 ms</td><td>≤ 1 %</td><td>Small and steady: about 87 kbit/s per G.711 call on Ethernet</td></tr>
<tr><td>Interactive video</td><td>≤ 150 to 200 ms</td><td>≤ 30 to 50 ms</td><td>≤ 0.1 to 1 %</td><td>Large and bursty</td></tr>
<tr><td>Data (web, email)</td><td>Tolerant</td><td>Tolerant</td><td>TCP recovers</td><td>Bursty, takes whatever is free</td></tr></table>

<h3>Step 1: classification and marking</h3>
<p><b>Classification</b> means identifying what a packet is: by ACL (addresses, ports), by NBAR (application recognition), or by trusting a marking already in the packet. <b>Marking</b> writes a value into the header so that every later device can classify quickly without inspecting the packet again.</p>
<table class="cmp"><tr><th>Field</th><th>Where</th><th>Bits / range</th><th>Voice value</th></tr>
<tr><td>CoS (PCP)</td><td>802.1Q tag, Layer 2, only on trunks</td><td>3 bits, 0 to 7</td><td>5</td></tr>
<tr><td>IP Precedence</td><td>IPv4 ToS byte, old</td><td>3 bits, 0 to 7</td><td>5</td></tr>
<tr><td>DSCP</td><td>IPv4 ToS / IPv6 Traffic Class, Layer 3</td><td>6 bits, 0 to 63</td><td>EF (46)</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="ToS byte with DSCP">
<text x="20" y="25" class="svg-ink" font-size="13">IPv4 ToS byte (8 bits)</text>
<rect x="20" y="40" width="360" height="40" fill="#bae6fd"/><text x="200" y="65" text-anchor="middle" class="svg-ink" font-size="13">DSCP: 6 bits (0-63)</text>
<rect x="380" y="40" width="120" height="40" fill="#e2e8f0"/><text x="440" y="65" text-anchor="middle" class="svg-ink" font-size="13">ECN: 2 bits</text>
<rect x="20" y="90" width="180" height="30" fill="#fde68a"/><text x="110" y="110" text-anchor="middle" class="svg-ink" font-size="12">first 3 bits = old IP Precedence</text>
<text x="20" y="150" class="svg-muted" font-size="12">EF = 101110 = 46 (precedence 5); AF41 = 100010 = 34; CS3 = 011000 = 24; default = 0</text>
</svg><p class="cap">DSCP reuses the first six bits of the old ToS byte, so its top three bits still line up with IP Precedence.</p></div>

<p>Common DSCP values: <b>EF (46)</b> for voice, <b>AF41 (34)</b> for interactive video, <b>CS3 (24)</b> for call signalling, <b>CS6 (48)</b> for routing protocols, <b>AF21 (18)</b> for important data, <b>default/BE (0)</b> for everything else. <b>AF</b> (Assured Forwarding) values are written AFxy, where x is the class (1 to 4) and y the drop precedence (1 low, 3 high): DSCP = 8x + 2y. <b>CSx</b> = 8x.</p>

<p>Where to mark? At the <b>trust boundary</b>, as close to the source as possible. Typically the access switch trusts markings from a Cisco IP phone (which marks voice EF/CoS 5) but re-marks traffic from PCs, because a user could mark their download as EF to jump the queue.</p>

<h3>Step 2: queuing and congestion management</h3>
<p>When an interface is congested, packets wait in software queues. The <b>scheduler</b> decides which queue sends next:</p>
<ul>
<li><b>FIFO</b>: one queue, first in, first out. No QoS at all.</li>
<li><b>CBWFQ</b> (class-based weighted fair queuing): each class gets a queue and a <b>guaranteed minimum bandwidth</b>; round-robin style service.</li>
<li><b>LLQ</b> (low latency queuing): CBWFQ plus one <b>strict-priority queue</b> for voice (and sometimes video). It is always served first, and it is policed to its configured rate so it cannot starve the others.</li>
</ul>
<p><b>Congestion avoidance</b> acts before a queue is full. With plain <b>tail drop</b>, a full queue drops every new packet, and all TCP flows slow down and speed up together (TCP global synchronisation). <b>WRED</b> (weighted random early detection) drops a few packets randomly as the queue fills, more from low-priority classes (for example AF13 before AF11), so TCP flows back off gradually.</p>

<h3>Step 3: policing versus shaping</h3>
<p>Both measure traffic against a rate, usually the <b>CIR</b> (committed information rate) a provider sells, using a token bucket. They differ in what they do with the excess:</p>
<table class="cmp"><tr><th></th><th>Policing</th><th>Shaping</th></tr>
<tr><td>Excess traffic</td><td>Dropped or re-marked</td><td>Buffered (queued) and sent later</td></tr>
<tr><td>Adds delay?</td><td>No</td><td>Yes, but smooths bursts</td></tr>
<tr><td>Typical place</td><td>Provider, ingress of the customer link</td><td>Customer, egress toward the provider</td></tr>
<tr><td>Direction</td><td>Inbound or outbound</td><td>Outbound only</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A branch has a 1 Gbit/s fibre to the provider but buys a 200 Mbit/s CIR. The provider <b>polices</b> at 200 Mbit/s: anything above is dropped, including voice if it arrives in a burst. The branch router therefore <b>shapes</b> its output to 200 Mbit/s, so excess waits in the router's own queues, where LLQ sends voice first. Result: the provider never drops, and the branch decides what waits. Checking DSCP: AF41 = 8 × 4 + 2 × 1 = 34; AF23 = 8 × 2 + 2 × 3 = 22.</p></div>

<p>For recognition only (CCNA does not require you to configure it), this is what an LLQ policy looks like in the Modular QoS CLI:</p>
<pre class="code">R1(config)# class-map match-any VOICE
R1(config-cmap)# match dscp ef
R1(config)# policy-map WAN-OUT
R1(config-pmap)# class VOICE
R1(config-pmap-c)# priority percent 30
R1(config-pmap)# class class-default
R1(config-pmap-c)# fair-queue
R1(config)# interface GigabitEthernet0/1
R1(config-if)# service-policy output WAN-OUT</pre>

<div class="warn"><p><b>Common mistake.</b> Believing QoS fixes a link that is permanently full. QoS handles short-term congestion by choosing winners and losers. If the link is at 100 % all day, voice may be fine but everything else suffers; the fix is more bandwidth.</p></div>

<div class="exam"><p><b>Exam trap.</b> Policing drops, shaping delays. CoS is Layer 2 (3 bits, trunk only); DSCP is Layer 3 (6 bits). EF = 46. LLQ adds a priority queue to CBWFQ. Voice targets: 150 ms delay, 30 ms jitter, 1 % loss.</p></div>

<div class="scn"><h4>Choppy calls every morning</h4><p>A call centre complained that calls sounded broken every morning at 9:00. Interface counters showed output drops on the 100 Mbit/s WAN link when everyone started syncing email and cloud files. The phones marked voice EF, but the WAN router had no QoS policy, so voice sat in the same FIFO queue as file transfers. Adding an LLQ policy with a priority queue for EF and a shaper matching the provider's CIR stopped the voice drops immediately; file sync became slightly slower, which nobody noticed.</p><p><b>Lesson:</b> marking alone does nothing; a queuing policy on the congested interface must act on the marks.</p></div>

<div class="iv"><p class="q">"What is the difference between policing and shaping, and where would you use each?"</p><p>Strong answer: both enforce a rate using a token bucket. A policer drops or re-marks traffic above the rate immediately, adding no delay, typically at a provider's ingress. A shaper buffers the excess and releases it at the rate, smoothing bursts but adding delay, typically on the customer's egress toward a provider so the provider's policer never drops. Mention that shaping combined with LLQ protects voice.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>QoS manages bandwidth, delay, jitter and loss during congestion; it does not add bandwidth.</li>
<li>Voice needs ≤ 150 ms delay, ≤ 30 ms jitter, ≤ 1 % loss; marked EF (46) and CoS 5.</li>
<li>Classify and mark at the trust boundary; CoS is 3 bits at Layer 2, DSCP 6 bits at Layer 3; AFxy = 8x + 2y.</li>
<li>CBWFQ guarantees bandwidth per class; LLQ adds a strict-priority queue; WRED drops early to avoid tail drop.</li>
<li>Policing drops or re-marks excess; shaping buffers and delays it.</li>
</ul></div>
`,hi:`
<p>Rush hour mein ek toll plaza socho. Highway ki das lanes teen toll booths mein simat jaati hain, isliye queue banti hai. Ambulance ko pachaas trucks ke peeche intezaar nahi karna chahiye, isliye use apni lane milti hai jo hamesha pehle jaati hai. Buses ko ek guaranteed booth milta hai. Baaki sab bacha hua share karte hain, aur jab queue bahut lambi ho jaaye, to kuch cars ko pehle hi lauta diya jaata hai. <b>Quality of Service (QoS)</b> packets ke liye bilkul yahi karta hai. Yeh bandwidth nahi banata; yeh decide karta hai ki <b>jab kaafi na ho to kaun intezaar kare aur kaun drop ho</b>.</p>

<h3>Congestion kyun hota hai</h3>
<p>Congestion wahan hota hai jahan interface jitna bhej sakta hai usse zyada traffic aata hai: 1 Gbit/s LAN jo 50 Mbit/s WAN link ko feed karta hai, ya bees access ports jo ek uplink share karte hain. Kuch milliseconds ya seconds ke liye packets ko queue karna padta hai, aur queue bhari ho to woh drop hote hain. Email ke liye yeh nuksaan nahi karta (TCP retransmit karta hai). Voice call ke liye iska matlab robotic, tooti hui awaaz.</p>
<p>QoS chaar characteristics manage karta hai:</p>
<ul>
<li><b>Bandwidth</b>: traffic ki ek class ko kitni capacity milti hai.</li>
<li><b>Delay (latency)</b>: packet ko end to end kitna time lagta hai, queuing samet.</li>
<li><b>Jitter</b>: same flow ke packets ke beech delay ka badalna.</li>
<li><b>Loss</b>: drop hue packets ka percentage.</li>
</ul>

<h3>Voice aur video ko kya chahiye</h3>
<table class="cmp"><tr><th>Traffic</th><th>One-way delay</th><th>Jitter</th><th>Loss</th><th>Bandwidth</th></tr>
<tr><td>Voice</td><td>≤ 150 ms</td><td>≤ 30 ms</td><td>≤ 1 %</td><td>Chhoti aur steady: Ethernet par har G.711 call lagbhag 87 kbit/s</td></tr>
<tr><td>Interactive video</td><td>≤ 150 se 200 ms</td><td>≤ 30 se 50 ms</td><td>≤ 0.1 se 1 %</td><td>Badi aur bursty</td></tr>
<tr><td>Data (web, email)</td><td>Tolerant</td><td>Tolerant</td><td>TCP recover karta hai</td><td>Bursty, jo free ho le leta hai</td></tr></table>

<h3>Step 1: classification aur marking</h3>
<p><b>Classification</b> matlab pehchanna ki packet kya hai: ACL se (addresses, ports), NBAR se (application recognition), ya packet mein pehle se maujood marking par trust karke. <b>Marking</b> header mein ek value likhta hai taaki baad ka har device packet ko dobara inspect kiye bina jaldi classify kar sake.</p>
<table class="cmp"><tr><th>Field</th><th>Kahan</th><th>Bits / range</th><th>Voice value</th></tr>
<tr><td>CoS (PCP)</td><td>802.1Q tag, Layer 2, sirf trunks par</td><td>3 bits, 0 se 7</td><td>5</td></tr>
<tr><td>IP Precedence</td><td>IPv4 ToS byte, purana</td><td>3 bits, 0 se 7</td><td>5</td></tr>
<tr><td>DSCP</td><td>IPv4 ToS / IPv6 Traffic Class, Layer 3</td><td>6 bits, 0 se 63</td><td>EF (46)</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="DSCP ke saath ToS byte">
<text x="20" y="25" class="svg-ink" font-size="13">IPv4 ToS byte (8 bits)</text>
<rect x="20" y="40" width="360" height="40" fill="#bae6fd"/><text x="200" y="65" text-anchor="middle" class="svg-ink" font-size="13">DSCP: 6 bits (0-63)</text>
<rect x="380" y="40" width="120" height="40" fill="#e2e8f0"/><text x="440" y="65" text-anchor="middle" class="svg-ink" font-size="13">ECN: 2 bits</text>
<rect x="20" y="90" width="180" height="30" fill="#fde68a"/><text x="110" y="110" text-anchor="middle" class="svg-ink" font-size="12">pehle 3 bits = purana IP Precedence</text>
<text x="20" y="150" class="svg-muted" font-size="12">EF = 101110 = 46 (precedence 5); AF41 = 100010 = 34; CS3 = 011000 = 24; default = 0</text>
</svg><p class="cap">DSCP purane ToS byte ke pehle chhe bits reuse karta hai, isliye uske upar ke teen bits abhi bhi IP Precedence se line up karte hain.</p></div>

<p>Common DSCP values: voice ke liye <b>EF (46)</b>, interactive video ke liye <b>AF41 (34)</b>, call signalling ke liye <b>CS3 (24)</b>, routing protocols ke liye <b>CS6 (48)</b>, important data ke liye <b>AF21 (18)</b>, aur baaki sab ke liye <b>default/BE (0)</b>. <b>AF</b> (Assured Forwarding) values AFxy likhi jaati hain, jahan x class (1 se 4) aur y drop precedence (1 low, 3 high) hai: DSCP = 8x + 2y. <b>CSx</b> = 8x.</p>

<p>Mark kahan karein? <b>Trust boundary</b> par, source ke jitna kareeb ho sake. Aam taur par access switch Cisco IP phone ki markings par trust karta hai (jo voice ko EF/CoS 5 mark karta hai) lekin PCs ke traffic ko re-mark karta hai, kyunki user apne download ko EF mark karke queue mein aage kood sakta hai.</p>

<h3>Step 2: queuing aur congestion management</h3>
<p>Jab interface congested hota hai, packets software queues mein intezaar karte hain. <b>Scheduler</b> decide karta hai ki agli baari kis queue ki hai:</p>
<ul>
<li><b>FIFO</b>: ek queue, first in, first out. Koi QoS nahi.</li>
<li><b>CBWFQ</b> (class-based weighted fair queuing): har class ko ek queue aur ek <b>guaranteed minimum bandwidth</b> milti hai; round-robin jaisi service.</li>
<li><b>LLQ</b> (low latency queuing): CBWFQ plus voice (aur kabhi kabhi video) ke liye ek <b>strict-priority queue</b>. Yeh hamesha pehle serve hoti hai, aur apne configured rate par police hoti hai taaki baaki queues ko bhookha na maar de.</li>
</ul>
<p><b>Congestion avoidance</b> queue bharne se pehle kaam karta hai. Plain <b>tail drop</b> mein bhari queue har naya packet drop karti hai, aur saare TCP flows ek saath slow aur fast hote hain (TCP global synchronisation). <b>WRED</b> (weighted random early detection) queue bharne ke saath randomly kuch packets drop karta hai, low-priority classes se zyada (jaise AF11 se pehle AF13), taaki TCP flows dheere dheere peeche hatein.</p>

<h3>Step 3: policing vs shaping</h3>
<p>Dono traffic ko ek rate ke against naapte hain, aam taur par provider ka becha hua <b>CIR</b> (committed information rate), token bucket use karke. Fark yeh hai ki extra traffic ke saath kya karte hain:</p>
<table class="cmp"><tr><th></th><th>Policing</th><th>Shaping</th></tr>
<tr><td>Extra traffic</td><td>Drop ya re-mark</td><td>Buffer (queue) karke baad mein bheja</td></tr>
<tr><td>Delay jodta hai?</td><td>Nahi</td><td>Haan, lekin bursts smooth karta hai</td></tr>
<tr><td>Typical jagah</td><td>Provider, customer link ka ingress</td><td>Customer, provider ki taraf egress</td></tr>
<tr><td>Direction</td><td>Inbound ya outbound</td><td>Sirf outbound</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ek branch ke paas provider tak 1 Gbit/s fibre hai lekin woh 200 Mbit/s CIR kharidti hai. Provider 200 Mbit/s par <b>police</b> karta hai: upar ka sab drop, voice bhi agar burst mein aaye. Isliye branch router apna output 200 Mbit/s par <b>shape</b> karta hai, taaki extra router ki apni queues mein ruke, jahan LLQ voice ko pehle bhejta hai. Result: provider kabhi drop nahi karta, aur branch decide karti hai kaun intezaar kare. DSCP check: AF41 = 8 × 4 + 2 × 1 = 34; AF23 = 8 × 2 + 2 × 3 = 22.</p></div>

<p>Sirf pehchanne ke liye (CCNA configure karna nahi maangta), Modular QoS CLI mein LLQ policy aisi dikhti hai:</p>
<pre class="code">R1(config)# class-map match-any VOICE
R1(config-cmap)# match dscp ef
R1(config)# policy-map WAN-OUT
R1(config-pmap)# class VOICE
R1(config-pmap-c)# priority percent 30
R1(config-pmap)# class class-default
R1(config-pmap-c)# fair-queue
R1(config)# interface GigabitEthernet0/1
R1(config-if)# service-policy output WAN-OUT</pre>

<div class="warn"><p><b>Common galti.</b> Yeh maanna ki QoS hamesha bhare rehne wale link ko theek kar dega. QoS short-term congestion ko winners aur losers chun kar handle karta hai. Agar link poore din 100 % par hai, to voice theek ho sakti hai par baaki sab pareshan hoga; fix zyada bandwidth hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Policing drop karta hai, shaping delay karta hai. CoS Layer 2 hai (3 bits, sirf trunk); DSCP Layer 3 (6 bits). EF = 46. LLQ CBWFQ mein priority queue jodta hai. Voice targets: 150 ms delay, 30 ms jitter, 1 % loss.</p></div>

<div class="scn"><h4>Har subah tooti calls</h4><p>Ek call centre ne complain kiya ki har subah 9:00 baje calls tooti hui sunaai deti hain. Interface counters ne 100 Mbit/s WAN link par output drops dikhaye jab sab log email aur cloud files sync karna shuru karte the. Phones voice ko EF mark karte the, lekin WAN router par koi QoS policy nahi thi, isliye voice file transfers ke saath same FIFO queue mein baithi thi. EF ke liye priority queue wali LLQ policy aur provider ke CIR se match karta shaper jodne se voice drops turant ruk gaye; file sync thoda slow hua, jo kisi ne notice nahi kiya.</p><p><b>Seekh:</b> sirf marking kuch nahi karti; congested interface par ek queuing policy ko marks par act karna padta hai.</p></div>

<div class="iv"><p class="q">"Policing aur shaping mein kya fark hai, aur har ek kahan use karoge?"</p><p>Strong answer: dono token bucket se ek rate enforce karte hain. Policer rate se upar ka traffic turant drop ya re-mark karta hai, koi delay nahi jodta, aam taur par provider ke ingress par. Shaper extra ko buffer karke rate par chhodta hai, bursts smooth karta hai par delay jodta hai, aam taur par customer ke egress par provider ki taraf taaki provider ka policer kabhi drop na kare. Mention karo ki LLQ ke saath shaping voice ko bachata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>QoS congestion ke dauran bandwidth, delay, jitter aur loss manage karta hai; bandwidth nahi jodta.</li>
<li>Voice ko ≤ 150 ms delay, ≤ 30 ms jitter, ≤ 1 % loss chahiye; EF (46) aur CoS 5 mark hoti hai.</li>
<li>Trust boundary par classify aur mark karo; CoS Layer 2 par 3 bits, DSCP Layer 3 par 6 bits; AFxy = 8x + 2y.</li>
<li>CBWFQ har class ko bandwidth guarantee karta hai; LLQ strict-priority queue jodta hai; WRED tail drop se bachne ke liye pehle drop karta hai.</li>
<li>Policing extra ko drop ya re-mark karta hai; shaping use buffer karke delay karta hai.</li>
</ul></div>
`}};export{e as default};