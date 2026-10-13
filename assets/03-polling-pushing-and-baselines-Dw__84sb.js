var e={id:`polling-pushing-baselines`,h:{en:`Polling, pushing and baselines: how data arrives and what normal means`,hi:`Polling, pushing aur baselines: data kaise aata hai aur normal ka matlab kya hai`},body:{en:`
<h3>An analogy: the teacher and the class</h3>
<p>A teacher can learn how students are doing in two ways. She can walk round every ten minutes and ask each student "how are you?" That is <b>polling</b>. Or she can tell the students "put your hand up the moment something is wrong". That is <b>pushing</b>. Walking round finds slow problems and gives regular numbers for a chart, but a student can be in trouble for nine minutes before she arrives. Hands up are instant, but a student who is too ill to raise a hand says nothing, and silence looks like "all fine". Good monitoring uses both.</p>

<h3>Three ways data reaches the NMS</h3>
<dl class="terms">
<dt>Polling (pull)</dt><dd>The NMS asks the device on a schedule, for example every 5 minutes: "give me ifOperStatus and CPU". Used by SNMP. The big advantage: if the device does not answer, <i>the NMS notices the silence</i>. That is how you detect a dead device.</dd>
<dt>Event push (traps, informs, syslog)</dt><dd>The device sends a message the instant something happens: a link goes down, a user logs in. Instant, but nobody confirms receipt (a trap is fire-and-forget; an inform is acknowledged). If the device is dead it sends nothing.</dd>
<dt>Streaming telemetry (push on a schedule or on change)</dt><dd>The device keeps a subscription open and sends data every few seconds, or only when a value changes. Finer than polling and lighter on the device. Module obs-telemetry teaches it. Here you only need the idea: <b>subscribe once, receive many times</b>.</dd>
</dl>

<table class="cmp"><tr><th>Method</th><th>Who starts it</th><th>Speed</th><th>Detects a dead device?</th></tr>
<tr><td>SNMP polling</td><td>NMS</td><td>every N minutes</td><td>yes (no answer)</td></tr>
<tr><td>Traps / informs</td><td>device</td><td>instant</td><td>no</td></tr>
<tr><td>Syslog</td><td>device</td><td>instant</td><td>no</td></tr>
<tr><td>Streaming telemetry</td><td>device (after subscribe)</td><td>seconds or on change</td><td>partly (stream stops)</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Polling versus pushing">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="13">Polling: NMS asks</text>
<rect x="30" y="40" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="75" y="65" text-anchor="middle" class="svg-ink" font-size="12">NMS</text>
<rect x="200" y="40" width="90" height="40" rx="8" fill="#bae6fd"/><text x="245" y="65" text-anchor="middle" class="svg-ink" font-size="12">Router</text>
<line x1="120" y1="52" x2="200" y2="52" stroke="#64748b" stroke-width="2"/><text x="160" y="46" text-anchor="middle" class="svg-muted" font-size="11">get?</text>
<line x1="200" y1="70" x2="120" y2="70" stroke="#64748b" stroke-width="2"/><text x="160" y="92" text-anchor="middle" class="svg-muted" font-size="11">answer</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="13">Pushing: device tells</text>
<rect x="350" y="40" width="90" height="40" rx="8" fill="#bae6fd"/><text x="395" y="65" text-anchor="middle" class="svg-ink" font-size="12">Router</text>
<rect x="520" y="40" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="565" y="65" text-anchor="middle" class="svg-ink" font-size="12">NMS</text>
<line x1="440" y1="60" x2="520" y2="60" stroke="#64748b" stroke-width="2"/><text x="480" y="52" text-anchor="middle" class="svg-muted" font-size="11">trap / log / stream</text>
<text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="13">Time line (one point = 5 minutes)</text>
<line x1="40" y1="165" x2="600" y2="165" stroke="#64748b" stroke-width="2"/>
<circle cx="100" cy="165" r="5" fill="#0ea5e9"/><circle cx="220" cy="165" r="5" fill="#0ea5e9"/><circle cx="340" cy="165" r="5" fill="#0ea5e9"/><circle cx="460" cy="165" r="5" fill="#0ea5e9"/>
<polygon points="395,150 405,150 400,163" fill="#ea5d0c"/><text x="400" y="145" text-anchor="middle" class="svg-accent" font-size="11">event (trap)</text>
<text x="160" y="192" text-anchor="middle" class="svg-muted" font-size="11">blue = scheduled polls</text>
</svg><p class="cap">Polls come on a schedule; an event arrives the moment it happens.</p></div>

<h3>How often to poll</h3>
<p>The polling interval is a trade-off. Every 5 minutes (300 seconds) is the common default: cheap and good for trends. Every 60 seconds catches shorter problems but costs 5 times more traffic and storage. A problem shorter than the interval can hide between two polls. In the console used in this track, the history is one week, one point every 5 minutes, which is 288 points a day and 2016 points a week.</p>
<div class="eg"><p><b>Worked example.</b> Kochi latency is normally 30 ms. A 4-minute burst of 400 ms happens at 10:01. Polls run at 10:00 and 10:05, both show 30 ms. The burst is invisible. The same burst with a 60-second interval would be caught four times. This is exactly why the telemetry module exists: sample faster, or subscribe to events.</p></div>

<h3>Counters and rates</h3>
<p>Many SNMP values are <b>counters</b>: a number that only climbs, such as ifInOctets, the total bytes received on an interface since boot. A counter alone says little. You need two polls and some arithmetic: the rate is (second value minus first value) divided by the seconds between them. If ifInOctets was 1,000,000,000 and five minutes (300 s) later 1,450,000,000, then 450,000,000 bytes arrived, which is 1,500,000 bytes a second, or 12 Mbps. On a 100 Mbps link that is 12 percent utilisation. The console does this maths for you, but you must understand it to spot a counter that wrapped or reset after a reload.</p>

<h3>What is normal? Baselines</h3>
<p>A number means nothing without context. Is 70 percent CPU bad? On a router that normally idles at 10 percent, yes; on a busy server that runs at 65 percent every afternoon, no. A <b>baseline</b> is the recorded picture of normal. Two kinds matter:</p>
<ul>
<li><b>Fixed baseline:</b> normal measured from a known healthy period, for example the first 2 days of the week. It never moves, so it is a stable yardstick.</li>
<li><b>Rolling baseline:</b> normal recomputed from the last N points. It adapts automatically, but if the network slowly gets worse it adapts to the bad state and stops complaining. That is <b>drift</b>, and it can hide an outage. Module obs-dash covers it in depth.</li>
</ul>
<p>Networks also have <b>seasonality</b>: the same shape repeats. Traffic peaks about lunchtime, drops at night and drops more on weekends. A good baseline compares 13:00 today with 13:00 on earlier days, not with 03:00.</p>

<h3>Thresholds and alerts</h3>
<p>A <b>threshold</b> is a limit, for example CPU above 90 percent. An <b>alert</b> is a notification when a threshold is crossed for long enough, for example for 3 consecutive points (15 minutes). The "for long enough" part is what stops a single spike from waking Priya at night. Tuning alerts is its own module; remember now that a good alert is specific, rare and actionable.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Relying only on traps and never polling: a dead router sends nothing, so you never learn. (2) Polling too fast on many devices and overloading small routers. (3) Reading a raw counter as if it were a rate. (4) Using a rolling baseline for a slow failure and trusting it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Traps are unacknowledged; informs are acknowledged and retransmitted. Polling is the only one of the three that notices a completely silent device. Counter32 values wrap after about 4.29 billion; busy links use 64-bit counters.</p></div>

<div class="scn"><h4>The router that died quietly</h4><p>Lucknow's router lost power at 02:10. The team had configured traps only, no polling. No trap was ever sent, so no alert fired, and the branch stayed down until staff arrived at 09:00. After the incident the team added SNMP polling every 5 minutes with an alert for "no answer for 3 polls". The same fault the next month raised an alert at 02:25.</p><p><b>Lesson:</b> push tells you what a device says; polling tells you when it says nothing.</p></div>

<div class="iv"><p class="q">"SNMP polling or traps: which would you choose?"</p><p>Strong answer: both. Polling gives regular metrics for trends and detects a dead device through silence. Traps and syslog give instant notice of events between polls. Mention that streaming telemetry improves on both by pushing data every few seconds, and that you would still alert on missing data.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Polling pulls on a schedule and detects silence; pushing (traps, syslog, streaming) tells you instantly but cannot report a dead device.</li>
<li>A fast event can hide between two polls; shorter intervals or streaming reveal it.</li>
<li>Rate = (counter now minus counter before) divided by seconds; 450,000,000 bytes in 300 s is 12 Mbps.</li>
<li>A baseline is the picture of normal; fixed is stable, rolling adapts and can drift.</li>
<li>An alert needs a threshold and a duration so it is rare and actionable.</li>
</ul></div>
`,hi:`
<h3>Ek analogy: teacher aur class</h3>
<p>Teacher do tareeke se jaan sakti hai ki students kaise hain. Woh har das minute mein class mein ghoom kar har student se poochh sakti hai "kaisa hai?" Yeh <b>polling</b> hai. Ya woh students se keh sakti hai "jaise hi kuch galat ho, haath utha do". Yeh <b>pushing</b> hai. Ghoomne se slow problems milte hain aur chart ke liye regular numbers, lekin student nau minute tak musibat mein reh sakta hai uske aane se pehle. Haath uthana instant hai, par jo student itna beemar hai ki haath nahi utha sakta woh kuch nahi bolta, aur khamoshi "sab theek" jaisi lagti hai. Achhi monitoring dono use karti hai.</p>

<h3>NMS tak data pahunchne ke teen tareeke</h3>
<dl class="terms">
<dt>Polling (pull)</dt><dd>NMS schedule par device se poochta hai, jaise har 5 minute: "mujhe ifOperStatus aur CPU do". SNMP isse use karta hai. Bada fayda: agar device jawab nahi deta, to <i>NMS khamoshi notice karta hai</i>. Isi se dead device pakda jaata hai.</dd>
<dt>Event push (traps, informs, syslog)</dt><dd>Device jaise hi kuch hota hai (link down, user login) turant message bhejta hai. Instant hai, par receipt confirm koi nahi karta (trap fire-and-forget hai; inform acknowledged hota hai). Agar device dead hai to woh kuch nahi bhejta.</dd>
<dt>Streaming telemetry (schedule par ya change par push)</dt><dd>Device subscription khuli rakhta hai aur har kuch second mein, ya sirf value badalne par, data bhejta hai. Polling se finer aur device par halka. Module obs-telemetry ise sikhata hai. Yahan bas idea chahiye: <b>ek baar subscribe karo, baar baar receive karo</b>.</dd>
</dl>

<table class="cmp"><tr><th>Method</th><th>Kaun shuru karta hai</th><th>Speed</th><th>Dead device pakadta hai?</th></tr>
<tr><td>SNMP polling</td><td>NMS</td><td>har N minute</td><td>haan (jawab nahi)</td></tr>
<tr><td>Traps / informs</td><td>device</td><td>instant</td><td>nahi</td></tr>
<tr><td>Syslog</td><td>device</td><td>instant</td><td>nahi</td></tr>
<tr><td>Streaming telemetry</td><td>device (subscribe ke baad)</td><td>seconds ya on change</td><td>partly (stream ruk jaati hai)</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Polling versus pushing">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="13">Polling: NMS poochta hai</text>
<rect x="30" y="40" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="75" y="65" text-anchor="middle" class="svg-ink" font-size="12">NMS</text>
<rect x="200" y="40" width="90" height="40" rx="8" fill="#bae6fd"/><text x="245" y="65" text-anchor="middle" class="svg-ink" font-size="12">Router</text>
<line x1="120" y1="52" x2="200" y2="52" stroke="#64748b" stroke-width="2"/><text x="160" y="46" text-anchor="middle" class="svg-muted" font-size="11">get?</text>
<line x1="200" y1="70" x2="120" y2="70" stroke="#64748b" stroke-width="2"/><text x="160" y="92" text-anchor="middle" class="svg-muted" font-size="11">jawab</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="13">Pushing: device batata hai</text>
<rect x="350" y="40" width="90" height="40" rx="8" fill="#bae6fd"/><text x="395" y="65" text-anchor="middle" class="svg-ink" font-size="12">Router</text>
<rect x="520" y="40" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="565" y="65" text-anchor="middle" class="svg-ink" font-size="12">NMS</text>
<line x1="440" y1="60" x2="520" y2="60" stroke="#64748b" stroke-width="2"/><text x="480" y="52" text-anchor="middle" class="svg-muted" font-size="11">trap / log / stream</text>
<text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="13">Time line (ek point = 5 minute)</text>
<line x1="40" y1="165" x2="600" y2="165" stroke="#64748b" stroke-width="2"/>
<circle cx="100" cy="165" r="5" fill="#0ea5e9"/><circle cx="220" cy="165" r="5" fill="#0ea5e9"/><circle cx="340" cy="165" r="5" fill="#0ea5e9"/><circle cx="460" cy="165" r="5" fill="#0ea5e9"/>
<polygon points="395,150 405,150 400,163" fill="#ea5d0c"/><text x="400" y="145" text-anchor="middle" class="svg-accent" font-size="11">event (trap)</text>
<text x="160" y="192" text-anchor="middle" class="svg-muted" font-size="11">neela = scheduled polls</text>
</svg><p class="cap">Polls schedule par aate hain; event jaise hi hota hai waise hi aata hai.</p></div>

<h3>Kitni baar poll karein</h3>
<p>Polling interval ek trade-off hai. Har 5 minute (300 seconds) common default hai: sasta aur trends ke liye achha. Har 60 seconds chhote problems pakadta hai lekin 5 guna zyada traffic aur storage leta hai. Interval se chhota problem do polls ke beech chhup sakta hai. Is track ke console mein history ek hafte ki hai, har 5 minute ka ek point, yaani din mein 288 points aur hafte mein 2016 points.</p>
<div class="eg"><p><b>Worked example.</b> Kochi latency normally 30 ms hai. 10:01 par 4 minute ka 400 ms ka burst aata hai. Polls 10:00 aur 10:05 par chalte hain, dono 30 ms dikhate hain. Burst invisible hai. Wahi burst 60 second interval ke saath chaar baar pakda jaata. Isiliye telemetry module hai: tez sample karo, ya events ko subscribe karo.</p></div>

<h3>Counters aur rates</h3>
<p>Kai SNMP values <b>counters</b> hain: ek number jo sirf badhta hai, jaise ifInOctets, boot ke baad interface par aaye total bytes. Akela counter kam batata hai. Aapko do polls aur thoda hisaab chahiye: rate = (doosri value minus pehli value) divided by beech ke seconds. Agar ifInOctets 1,000,000,000 tha aur paanch minute (300 s) baad 1,450,000,000, to 450,000,000 bytes aaye, yaani 1,500,000 bytes per second, ya 12 Mbps. 100 Mbps link par yeh 12 percent utilisation hai. Console yeh maths aapke liye karta hai, lekin aapko samajhna chahiye taaki wrap hua ya reload ke baad reset hua counter pehchan sako.</p>

<h3>Normal kya hai? Baselines</h3>
<p>Context ke bina number ka koi matlab nahi. Kya 70 percent CPU bura hai? Jo router normally 10 percent par idle rehta hai uske liye haan; jo busy server har dopahar 65 percent par chalta hai uske liye nahi. <b>Baseline</b> normal ki recorded tasveer hai. Do kisme matter karti hain:</p>
<ul>
<li><b>Fixed baseline:</b> known healthy period se naapa gaya normal, jaise hafte ke pehle 2 din. Yeh kabhi nahi hilta, isliye stable yardstick hai.</li>
<li><b>Rolling baseline:</b> pichhle N points se dobara compute hua normal. Yeh khud adapt hota hai, lekin agar network dheere dheere kharab hota hai to yeh kharab state ke saath adapt ho jaata hai aur shikayat band kar deta hai. Yeh <b>drift</b> hai, aur yeh outage chhupa sakta hai. Module obs-dash ise detail mein cover karta hai.</li>
</ul>
<p>Networks mein <b>seasonality</b> bhi hoti hai: wahi shape repeat hoti hai. Traffic lunchtime ke aaspaas peak karta hai, raat ko girta hai aur weekend par aur girta hai. Achha baseline aaj ke 13:00 ko pichhle dino ke 13:00 se compare karta hai, 03:00 se nahi.</p>

<h3>Thresholds aur alerts</h3>
<p><b>Threshold</b> ek limit hai, jaise CPU 90 percent se upar. <b>Alert</b> woh notification hai jab threshold kaafi der tak cross hota hai, jaise 3 consecutive points (15 minute) ke liye. "Kaafi der tak" wala hissa ek akele spike ko Priya ko raat mein jagane se rokta hai. Alert tuning apna alag module hai; abhi yaad rakho ki achha alert specific, rare aur actionable hota hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Sirf traps par bharosa karna aur polling na karna: dead router kuch nahi bhejta, to aapko pata hi nahi chalta. (2) Bahut devices par bahut tez poll karke chhote routers ko overload karna. (3) Raw counter ko rate ki tarah padhna. (4) Slow failure ke liye rolling baseline use karke us par bharosa karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Traps unacknowledged hote hain; informs acknowledged aur retransmit hote hain. Teeno mein se sirf polling poori tarah khamosh device ko notice karti hai. Counter32 values lagbhag 4.29 billion ke baad wrap hoti hain; busy links 64-bit counters use karte hain.</p></div>

<div class="scn"><h4>Woh router jo chupchaap mar gaya</h4><p>Lucknow ke router ki power 02:10 par chali gayi. Team ne sirf traps configure kiye the, polling nahi. Koi trap kabhi bheja hi nahi gaya, isliye koi alert fire nahi hua, aur branch 09:00 tak down raha jab staff aaya. Incident ke baad team ne har 5 minute SNMP polling jodi, aur "3 polls tak jawab nahi" ka alert lagaya. Agle mahine wahi fault 02:25 par alert le aaya.</p><p><b>Seekh:</b> push batata hai ki device kya bolta hai; polling batati hai ki woh kab kuch nahi bolta.</p></div>

<div class="iv"><p class="q">"SNMP polling ya traps: aap kya chunoge?"</p><p>Strong answer: dono. Polling trends ke liye regular metrics deti hai aur khamoshi se dead device pakadti hai. Traps aur syslog polls ke beech events ka turant notice dete hain. Jodo ki streaming telemetry dono se behtar hai kyunki har kuch second mein data push karti hai, aur phir bhi aap missing data par alert lagaoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Polling schedule par pull karti hai aur khamoshi pakadti hai; pushing (traps, syslog, streaming) turant batati hai par dead device report nahi kar sakti.</li>
<li>Tez event do polls ke beech chhup sakta hai; chhote intervals ya streaming use reveal karte hain.</li>
<li>Rate = (abhi ka counter minus pehle ka counter) divided by seconds; 300 s mein 450,000,000 bytes yaani 12 Mbps.</li>
<li>Baseline normal ki tasveer hai; fixed stable hai, rolling adapt karta hai aur drift kar sakta hai.</li>
<li>Alert ko threshold aur duration chahiye taaki woh rare aur actionable ho.</li>
</ul></div>
`}};export{e as default};