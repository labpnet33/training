var e={id:`why-streaming`,h:{en:`Why streaming beats polling`,hi:`Streaming polling se behtar kyun hai`},body:{en:`
<h3>What you will learn</h3>
<p>In this module you learn streaming telemetry: devices that push their data to a collector instead of waiting to be asked. By the end of this chapter you can explain why a five-minute poll can miss a real problem, describe push versus pull in plain words, and find the Telemetry page of the console. You will also start with our GUI tagline: <b>Click-ops, but you understand what each click does.</b> Every click in this module is a change on the wire or in a policy, and we will always ask what that change is.</p>
<p><b>Prerequisites:</b> you finished obs-start and obs-snmp, so you know what polling is and why a monitoring server called the NMS exists. If SNMP polling every five minutes is new to you, read those first.</p>
<p><b>Scope:</b> the console is a simulator. It simulates polling targets, dashboards, baselines and gNMI-style streaming subscriptions. It does not simulate real encryption, real throughput or a real time-series database, and it does not copy any vendor product screen.</p>

<h3>An analogy: the guard who visits versus the camera that records</h3>
<p>Imagine the Hyderabad server room at Godavari Foods. One way to watch it is a guard who walks in every five minutes, looks around and writes down what he sees. If a door is propped open for two minutes between his visits, he never knows. The other way is a camera that sends a clip the moment the door moves. The guard is <b>polling</b>. The camera is <b>streaming</b>. The guard is cheap and simple, and for slow things such as disk space he is perfect. For fast things the camera wins.</p>

<h3>Pull and push in one minute</h3>
<dl class="terms">
<dt>Pull (polling)</dt><dd>The monitoring system asks the device a question on a timer, for example "what is your interface counter now?". The device answers once. Between questions the monitoring system knows nothing.</dd>
<dt>Push (streaming)</dt><dd>The monitoring system subscribes once. After that the device sends updates on its own, either on a fixed interval or when something changes.</dd>
<dt>Telemetry</dt><dd>Data a device sends about itself. In this module it means model-driven streaming telemetry: the data comes from a defined data model and travels over a secure channel.</dd>
<dt>Collector</dt><dd>The program that receives the stream, stores it and feeds dashboards. In our console the collector is OBSERVER at 10.1.50.100.</dd>
</dl>

<h3>Why polling misses bursts</h3>
<p>A poll is a photograph. A counter-based poll is even weaker: it reads a running total, and subtracting two readings gives only the <b>average</b> over the gap. A burst of traffic that lasts one second inside a five-minute gap barely moves the average.</p>
<div class="eg"><p><b>Worked example.</b> The Hyderabad router sends 1 Gbit/s link traffic. Nightly the ERP export sends a burst of 1 Gbit/s for 2 seconds, then 20 Mbit/s the rest of the time. Over a 300-second poll the average is about (2 x 1000 + 298 x 20) / 300, which is roughly 27 Mbit/s. A dashboard built on that poll says "2.7 percent busy". Meanwhile the output queue was full for 2 seconds, and packets were dropped. The poll answer is correct and useless.</p></div>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Poll versus stream">
<text x="150" y="20" text-anchor="middle" class="svg-ink" font-size="13">Polling: one photo per interval</text>
<line x1="20" y1="170" x2="290" y2="170" stroke="#64748b" stroke-width="2"/>
<rect x="150" y="60" width="10" height="110" fill="#fed7aa"/>
<circle cx="40" cy="160" r="6" fill="#bae6fd"/><circle cx="100" cy="160" r="6" fill="#bae6fd"/><circle cx="220" cy="160" r="6" fill="#bae6fd"/><circle cx="270" cy="160" r="6" fill="#bae6fd"/>
<text x="155" y="52" text-anchor="middle" class="svg-accent" font-size="12">burst</text>
<text x="150" y="200" text-anchor="middle" class="svg-muted" font-size="12">burst falls between two polls</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="13">Streaming: device pushes</text>
<line x1="350" y1="170" x2="620" y2="170" stroke="#64748b" stroke-width="2"/>
<rect x="480" y="60" width="10" height="110" fill="#fed7aa"/>
<circle cx="370" cy="160" r="6" fill="#bbf7d0"/><circle cx="430" cy="160" r="6" fill="#bbf7d0"/><circle cx="485" cy="70" r="6" fill="#bbf7d0"/><circle cx="550" cy="160" r="6" fill="#bbf7d0"/><circle cx="600" cy="160" r="6" fill="#bbf7d0"/>
<text x="485" y="52" text-anchor="middle" class="svg-accent" font-size="12">burst seen</text>
<text x="480" y="200" text-anchor="middle" class="svg-muted" font-size="12">on-change or short interval catches it</text>
</svg><p class="cap">Blue and green dots are readings. The orange bar is a short event.</p></div>

<h3>What streaming costs</h3>
<p>Streaming is not free. A device that sends a reading every second for a hundred counters creates hundreds of thousands of values an hour. That load lands on the router CPU, the network and the collector storage. You will meet this again as <b>cardinality</b>: the number of distinct series you store. Good engineers stream the few signals that need speed and keep slow things on polling.</p>

<h3>The Telemetry page</h3>
<p>Open the console OBSERVER. In the left menu, below Flows, is <b>Telemetry</b>. It lists subscriptions. In the seeded network there are two: <code>ts-if-kch</code> watches the interface operational status of R-KCH and sends only on change, and <code>ts-cnt-hyd</code> watches the interface counters of R-HYD and samples every 10000 ms. Each card shows a badge. Green "streaming" means updates arrive. A red badge shows the reason. There is also a small tool, "Will this subscription see an event?", where you type an event length in milliseconds and see which subscriptions would catch it. Try 800 ms: the sample every 10000 ms says hidden, the on-change says visible.</p>
<p><b>What does this change on the wire/policy?</b> Opening the page changes nothing. Pressing Apply on a new subscription makes the device open a secure channel to the collector address and start sending. Nothing is sent until you apply.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Believing a graph that is smooth must be accurate: it may be an average that hides bursts. (2) Replacing all polling with streaming "because it is modern". (3) Forgetting that streaming needs the device to support the data model and to reach the collector.</p></div>
<div class="exam"><p><b>Exam trap.</b> Streaming telemetry is not the same as syslog or SNMP traps. Traps and syslog announce events as text or short messages. Telemetry streams structured, model-based data, often continuously.</p></div>

<div class="scn"><h4>The 02:00 drops nobody could see</h4><p>Users of the ERP at Godavari Foods complained about slow exports around 02:00. The utilisation graph on the monitoring server stayed flat at 3 percent. A telemetry subscription on queue depth, sampled every second for one night, showed the queue hitting its limit for two or three seconds at the start of the export. The fix was a larger buffer and a rate limit on the export job.</p><p><b>Lesson:</b> an average can be perfectly healthy while users suffer.</p></div>

<div class="iv"><p class="q">"Why use streaming telemetry instead of SNMP polling?"</p><p>Strong answer: polling gives snapshots at fixed gaps and averages away bursts, while streaming pushes data at a short interval or on change, so you see short events and state changes quickly. It is model-driven, so the data has a clear structure. The trade-off is load and storage, so I stream only signals that need speed and keep slow ones on polling.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Polling is pull: the monitoring system asks on a timer. Streaming is push: the device sends after a subscription.</li>
<li>A counter poll gives only an average, so a short burst hides inside it.</li>
<li>Streaming costs CPU, bandwidth and storage, so use it where speed matters.</li>
<li>The console Telemetry page lists subscriptions and shows streaming or the reason it is not.</li>
<li>Nothing leaves a device until you press Apply.</li>
</ul></div>
`,hi:`
<h3>Is chapter mein aap kya seekhoge</h3>
<p>Is module mein aap streaming telemetry seekhoge: aise devices jo poochhe jaane ka intezaar karne ki jagah apna data collector ko push karte hain. Is chapter ke end tak aap bata sakoge ki paanch minute ka poll asli problem kyun miss kar sakta hai, push aur pull simple words mein samjha sakoge, aur console ka Telemetry page dhundh sakoge. Hum apni GUI tagline se bhi shuru karte hain: <b>Click-ops, but you understand what each click does.</b> Is module ka har click wire ya policy par ek change hai, aur hum hamesha poochhenge ki woh change kya hai.</p>
<p><b>Prerequisites:</b> aapne obs-start aur obs-snmp kar liya hai, to aapko pata hai polling kya hai aur NMS naam ka monitoring server kyun hota hai. Agar har paanch minute ki SNMP polling aapke liye nayi hai, pehle woh modules padho.</p>
<p><b>Scope:</b> console ek simulator hai. Yeh polling targets, dashboards, baselines aur gNMI-style streaming subscriptions simulate karta hai. Yeh real encryption, real throughput ya real time-series database simulate nahi karta, aur kisi vendor product screen ki copy nahi karta.</p>

<h3>Ek analogy: ghoomne wala guard versus recording karne wala camera</h3>
<p>Godavari Foods ke Hyderabad server room ki kalpana karo. Isko dekhne ka ek tareeka hai ek guard jo har paanch minute mein andar aata hai, idhar-udhar dekhta hai aur likh leta hai ki kya dikha. Agar do visits ke beech do minute ke liye koi darwaza khula reh gaya, to usse kabhi pata nahi chalega. Doosra tareeka ek camera hai jo darwaza hilte hi clip bhej deta hai. Guard <b>polling</b> hai. Camera <b>streaming</b> hai. Guard sasta aur simple hai, aur disk space jaisi slow cheezon ke liye perfect hai. Tez cheezon ke liye camera jeetta hai.</p>

<h3>Pull aur push ek minute mein</h3>
<dl class="terms">
<dt>Pull (polling)</dt><dd>Monitoring system timer par device se sawaal poochta hai, jaise "abhi tumhara interface counter kya hai?". Device ek baar jawab deta hai. Sawaalon ke beech monitoring system ko kuch pata nahi hota.</dd>
<dt>Push (streaming)</dt><dd>Monitoring system ek baar subscribe karta hai. Uske baad device khud updates bhejta hai, ya to fixed interval par ya jab kuch badle.</dd>
<dt>Telemetry</dt><dd>Woh data jo device apne baare mein bhejta hai. Is module mein iska matlab hai model-driven streaming telemetry: data ek defined data model se aata hai aur secure channel par travel karta hai.</dd>
<dt>Collector</dt><dd>Woh program jo stream receive karta hai, store karta hai aur dashboards ko deta hai. Hamare console mein collector OBSERVER hai, 10.1.50.100 par.</dd>
</dl>

<h3>Polling bursts kyun miss karti hai</h3>
<p>Poll ek photograph hai. Counter-based poll aur bhi kamzor hai: woh running total padhta hai, aur do readings ko ghatane se sirf gap ka <b>average</b> milta hai. Paanch minute ke gap ke andar ek second ka traffic burst average ko mushkil se hilata hai.</p>
<div class="eg"><p><b>Worked example.</b> Hyderabad router ka link 1 Gbit/s hai. Roz raat ERP export 2 second ke liye 1 Gbit/s ka burst bhejta hai, baaki time 20 Mbit/s. 300 second ke poll par average lagbhag (2 x 1000 + 298 x 20) / 300 hai, yani takriban 27 Mbit/s. Is poll par bana dashboard kehta hai "2.7 percent busy". Isi beech output queue 2 second ke liye full thi, aur packets drop hue. Poll ka jawab sahi hai aur bekaar hai.</p></div>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Poll versus stream">
<text x="150" y="20" text-anchor="middle" class="svg-ink" font-size="13">Polling: har interval par ek photo</text>
<line x1="20" y1="170" x2="290" y2="170" stroke="#64748b" stroke-width="2"/>
<rect x="150" y="60" width="10" height="110" fill="#fed7aa"/>
<circle cx="40" cy="160" r="6" fill="#bae6fd"/><circle cx="100" cy="160" r="6" fill="#bae6fd"/><circle cx="220" cy="160" r="6" fill="#bae6fd"/><circle cx="270" cy="160" r="6" fill="#bae6fd"/>
<text x="155" y="52" text-anchor="middle" class="svg-accent" font-size="12">burst</text>
<text x="150" y="200" text-anchor="middle" class="svg-muted" font-size="12">burst do polls ke beech gir gaya</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="13">Streaming: device push karta hai</text>
<line x1="350" y1="170" x2="620" y2="170" stroke="#64748b" stroke-width="2"/>
<rect x="480" y="60" width="10" height="110" fill="#fed7aa"/>
<circle cx="370" cy="160" r="6" fill="#bbf7d0"/><circle cx="430" cy="160" r="6" fill="#bbf7d0"/><circle cx="485" cy="70" r="6" fill="#bbf7d0"/><circle cx="550" cy="160" r="6" fill="#bbf7d0"/><circle cx="600" cy="160" r="6" fill="#bbf7d0"/>
<text x="485" y="52" text-anchor="middle" class="svg-accent" font-size="12">burst dikha</text>
<text x="480" y="200" text-anchor="middle" class="svg-muted" font-size="12">on-change ya chhota interval pakad leta hai</text>
</svg><p class="cap">Neele aur hare dots readings hain. Orange bar ek chhota event hai.</p></div>

<h3>Streaming ki keemat</h3>
<p>Streaming free nahi hai. Jo device sau counters ke liye har second reading bhejta hai woh ek ghante mein lakhon values banata hai. Yeh load router CPU, network aur collector storage par girta hai. Isse aap phir <b>cardinality</b> ke naam se milenge: aapke store kiye hue distinct series ki ginti. Achhe engineers sirf wahi kuch signals stream karte hain jinhe speed chahiye, aur slow cheezein polling par rakhte hain.</p>

<h3>Telemetry page</h3>
<p>Console OBSERVER kholo. Left menu mein Flows ke neeche <b>Telemetry</b> hai. Yeh subscriptions list karta hai. Seeded network mein do hain: <code>ts-if-kch</code> R-KCH ka interface operational status dekhti hai aur sirf change par bhejti hai, aur <code>ts-cnt-hyd</code> R-HYD ke interface counters dekhti hai aur har 10000 ms par sample karti hai. Har card par ek badge hai. Hara "streaming" matlab updates aa rahe hain. Laal badge reason dikhata hai. Ek chhota tool bhi hai, "Will this subscription see an event?", jisme aap event ki length milliseconds mein likhte ho aur dekhte ho kaun si subscriptions usse pakdengi. 800 ms try karo: 10000 ms ka sample hidden kehta hai, on-change visible.</p>
<p><b>Wire/policy par kya badalta hai?</b> Page kholne se kuch nahi badalta. Nayi subscription par Apply dabane se device collector address tak secure channel kholta hai aur bhejna shuru karta hai. Apply se pehle kuch nahi bheja jaata.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Yeh maanna ki smooth graph accurate hai: woh average ho sakta hai jo bursts chhupa raha hai. (2) Sab polling ko "modern hai" kehkar streaming se badal dena. (3) Yeh bhoolna ki streaming ke liye device ko data model support karna hota hai aur collector tak pahunchna hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Streaming telemetry syslog ya SNMP traps ke barabar nahi hai. Traps aur syslog events ko text ya chhote messages mein announce karte hain. Telemetry structured, model-based data stream karti hai, aksar continuously.</p></div>

<div class="scn"><h4>02:00 ke drops jo kisi ko nahi dikhe</h4><p>Godavari Foods ke ERP users ne 02:00 ke aaspaas slow exports ki shikayat ki. Monitoring server par utilisation graph 3 percent par flat raha. Ek raat ke liye queue depth par har second sample hone wali telemetry subscription ne dikhaya ki export ki shuruaat mein queue do-teen second ke liye limit tak pahunchti thi. Fix tha bada buffer aur export job par rate limit.</p><p><b>Seekh:</b> average bilkul healthy ho sakta hai jabki users takleef mein hon.</p></div>

<div class="iv"><p class="q">"SNMP polling ki jagah streaming telemetry kyun use karte hain?"</p><p>Strong answer: polling fixed gaps par snapshots deti hai aur bursts ko average kar deti hai, jabki streaming chhote interval par ya change par data push karti hai, to chhote events aur state changes jaldi dikhte hain. Yeh model-driven hai, to data ka structure clear hota hai. Trade-off load aur storage hai, isliye main sirf wahi signals stream karta hoon jinhe speed chahiye aur slow signals polling par rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Polling pull hai: monitoring system timer par poochta hai. Streaming push hai: subscription ke baad device bhejta hai.</li>
<li>Counter poll sirf average deta hai, isliye chhota burst usme chhup jaata hai.</li>
<li>Streaming CPU, bandwidth aur storage khaati hai, isliye wahin use karo jahan speed chahiye.</li>
<li>Console ka Telemetry page subscriptions list karta hai aur streaming ya na hone ka reason dikhata hai.</li>
<li>Apply dabane tak device se kuch nahi nikalta.</li>
</ul></div>
`}};export{e as default};