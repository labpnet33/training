var e={id:`good-dashboard`,h:{en:`What a good dashboard shows`,hi:`Achha dashboard kya dikhata hai`},body:{en:`
<h3>What you will learn</h3>
<p>This module teaches you to read, build and trust dashboards. By the end of this chapter you can name the four golden signals, explain the RED and USE methods, say what a dashboard is for, and recognise a bad one. You also meet our GUI tagline: <b>Click-ops, but you understand what each click does.</b> Every time you press a button in the console we will ask: what does this change on the wire or in a policy?</p>
<p><b>Prerequisites:</b> obs-start (metrics, logs, flows and the monitoring loop) and obs-snmp (how values reach the NMS). Streaming telemetry from obs-telemetry helps but is not required.</p>
<p><b>Scope:</b> the console OBSERVER is a simulator. It draws dashboards from deterministic series and simulates polling targets, panels, thresholds and baselines. It is not a real time-series database, and it does not copy any vendor product screen. We call real products "dashboard tools" when we talk about concepts.</p>

<h3>An analogy: the car dashboard</h3>
<p>A car dashboard does not show every sensor in the engine. It shows speed, fuel, temperature and a few warning lights, because the driver must decide in a second whether to keep driving. A network dashboard is the same: it answers one question quickly. "Is the service healthy, and if not, where do I look first?" A wall of forty graphs answers nothing.</p>

<h3>The four golden signals</h3>
<p>Site reliability engineers noticed that four signals describe almost any service:</p>
<dl class="terms">
<dt>Latency</dt><dd>How long a request takes. Track slow ones separately from fast ones, because failures can be fast.</dd>
<dt>Traffic</dt><dd>How much demand the system gets: bits per second, requests per second.</dd>
<dt>Errors</dt><dd>The rate of requests or packets that fail: loss, resets, 5xx responses.</dd>
<dt>Saturation</dt><dd>How full the system is: CPU, memory, queue depth, link utilisation. It predicts trouble before it arrives.</dd>
</dl>
<p>Two shortcuts help you apply them. <b>RED</b> is for services and requests: Rate, Errors, Duration. <b>USE</b> is for resources such as an interface, CPU or a buffer: Utilisation, Saturation, Errors. Use RED for the ERP application, USE for the Kochi router.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Golden signals">
<rect x="20" y="30" width="140" height="70" rx="10" fill="#bae6fd"/><text x="90" y="60" text-anchor="middle" class="svg-ink" font-size="13">Latency</text><text x="90" y="80" text-anchor="middle" class="svg-muted" font-size="12">how slow</text>
<rect x="175" y="30" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="245" y="60" text-anchor="middle" class="svg-ink" font-size="13">Traffic</text><text x="245" y="80" text-anchor="middle" class="svg-muted" font-size="12">how much</text>
<rect x="330" y="30" width="140" height="70" rx="10" fill="#fed7aa"/><text x="400" y="60" text-anchor="middle" class="svg-ink" font-size="13">Errors</text><text x="400" y="80" text-anchor="middle" class="svg-muted" font-size="12">how broken</text>
<rect x="485" y="30" width="140" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="13">Saturation</text><text x="555" y="80" text-anchor="middle" class="svg-muted" font-size="12">how full</text>
<text x="90" y="135" text-anchor="middle" class="svg-ink" font-size="12">latency</text>
<text x="245" y="135" text-anchor="middle" class="svg-ink" font-size="12">util</text>
<text x="400" y="135" text-anchor="middle" class="svg-ink" font-size="12">loss</text>
<text x="555" y="135" text-anchor="middle" class="svg-ink" font-size="12">cpu, mem</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">console metric names under each signal</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">RED = rate, errors, duration   USE = utilisation, saturation, errors</text>
</svg><p class="cap">The console metrics map neatly onto the four signals.</p></div>

<h3>The console and its seeded dashboards</h3>
<p>Open OBSERVER and look at <b>Overview</b> first: it summarises the seven targets in three cities (R-HYD, R-KCH, R-LKO, SW-HYD, SRV-HYD, SRV-KCH, SRV-LKO) and shows which are unhealthy. Then open <b>Dashboards</b>. Two dashboards exist:</p>
<ul>
<li><code>d-health</code> (health) with four panels: <code>p-cpu-hyd</code> (CPU of R-HYD, saturation), <code>p-util-kch</code> (utilisation of the Kochi router, traffic), <code>p-lat-lko</code> (latency to Lucknow) and <code>p-loss-kch</code> (loss at Kochi, errors). That is the four golden signals on one screen.</li>
<li><code>d-erp</code> with three panels: ERP server CPU, memory and utilisation.</li>
</ul>
<p>Each panel shows a big number, which target and aggregation produced it, a small trend and a coloured badge: ok, warn, crit or <b>nodata</b>. The five metrics are cpu, mem, util, latency and loss. One point is five minutes, so 12 points are an hour and 288 are a day. The series cover a week.</p>
<pre class="out">Dashboards > d-health
p-cpu-hyd    R-HYD   cpu      last   42 %     ok
p-util-kch   R-KCH   util     last   31 %     ok
p-lat-lko    R-LKO   latency  last   38 ms    ok
p-loss-kch   R-KCH   loss     last   <span class="hl">nodata</span>   polling of R-KCH failed</pre>
<p>"nodata" does <b>not</b> mean the device is idle. It means the poller could not get an answer, so the dashboard has nothing to draw. This difference saves hours in ticket 331020.</p>
<p><b>What does this change on the wire/policy?</b> Reading a dashboard changes nothing. A panel only reads stored data, and the lines you draw on it are colours, not alerts. Changing a panel does not send a packet to a device and does not page anybody. Only polling credentials, subscriptions and alert rules change what is sent or who is told.</p>

<h3>What makes a dashboard good</h3>
<ul>
<li><b>One audience, one question.</b> "Is HQ healthy?" or "Is the ERP slow?"</li>
<li><b>Most important at the top left</b>, where eyes land first.</li>
<li><b>Few panels.</b> Six to twelve. More means nobody reads them.</li>
<li><b>Consistent time range and units</b> so panels can be compared.</li>
<li><b>Thresholds drawn on the panel</b> so a glance tells ok from not ok.</li>
<li><b>Drill-down</b>: a summary above, detail below.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> (1) Showing everything "because we collect it". (2) Mixing different units on one axis. (3) Treating nodata as zero. (4) Building the dashboard for the author, not for the on-call person at 03:00.</p></div>
<div class="exam"><p><b>Exam trap.</b> The four golden signals are latency, traffic, errors and saturation. Do not confuse them with the three pillars of observability (metrics, logs, traces) or with RED and USE, which are two derived methods.</p></div>

<div class="scn"><h4>The dashboard with sixty panels</h4><p>The Hyderabad NOC had a dashboard that every new engineer admired and nobody used during incidents. In an outage the on-call engineer spent four minutes scrolling. Meena Iyer replaced it with one screen of eight panels built on the golden signals, with warning and critical lines. The next incident was triaged in under a minute.</p><p><b>Lesson:</b> a dashboard is judged by how fast it helps a tired person decide.</p></div>

<div class="iv"><p class="q">"What would you put on a health dashboard for a branch router?"</p><p>Strong answer: the four golden signals mapped to the router: latency to the hub, interface utilisation, loss or errors, and CPU or memory saturation, each with a warning and a critical line, one time range for all panels, and a link to detail. Mention that nodata must be visible and distinct from zero.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The four golden signals are latency, traffic, errors and saturation.</li>
<li>RED fits services, USE fits resources.</li>
<li>A good dashboard answers one question quickly with few panels and visible thresholds.</li>
<li>In the console d-health shows the four signals; nodata means polling failed, not idle.</li>
<li>Viewing a panel changes nothing on the wire; only polling, subscriptions and alert rules do.</li>
</ul></div>
`,hi:`
<h3>Is chapter mein aap kya seekhoge</h3>
<p>Yeh module aapko dashboards padhna, banana aur un par bharosa karna sikhata hai. Is chapter ke end tak aap four golden signals ke naam bata sakoge, RED aur USE methods samjha sakoge, bata sakoge ki dashboard kis liye hota hai, aur kharab dashboard pehchan sakoge. Aap hamari GUI tagline se bhi milte ho: <b>Click-ops, but you understand what each click does.</b> Console mein jab bhi aap button dabate ho, hum poochhenge: wire ya policy par kya badalta hai?</p>
<p><b>Prerequisites:</b> obs-start (metrics, logs, flows aur monitoring loop) aur obs-snmp (values NMS tak kaise pahunchti hain). obs-telemetry ki streaming telemetry madad karti hai lekin zaroori nahi.</p>
<p><b>Scope:</b> console OBSERVER ek simulator hai. Yeh deterministic series se dashboards banata hai aur polling targets, panels, thresholds aur baselines simulate karta hai. Yeh real time-series database nahi hai, aur kisi vendor product screen ki copy nahi karta. Concepts ki baat karte waqt hum real products ko "dashboard tools" kehte hain.</p>

<h3>Ek analogy: car ka dashboard</h3>
<p>Car ka dashboard engine ka har sensor nahi dikhata. Woh speed, fuel, temperature aur kuch warning lights dikhata hai, kyunki driver ko ek second mein decide karna hota hai ki chalna jaari rakhe ya nahi. Network dashboard bhi waisa hi hai: woh ek sawaal ka jawab jaldi deta hai. "Kya service healthy hai, aur nahi hai to pehle kahan dekhun?" Chalis graphs ki diwar kisi sawaal ka jawab nahi deti.</p>

<h3>Four golden signals</h3>
<p>Site reliability engineers ne dekha ki chaar signals lagbhag kisi bhi service ko describe kar dete hain:</p>
<dl class="terms">
<dt>Latency</dt><dd>Ek request kitna time leti hai. Slow wali ko fast wali se alag track karo, kyunki failures fast bhi ho sakte hain.</dd>
<dt>Traffic</dt><dd>System ko kitni demand milti hai: bits per second, requests per second.</dd>
<dt>Errors</dt><dd>Fail hone wali requests ya packets ki rate: loss, resets, 5xx responses.</dd>
<dt>Saturation</dt><dd>System kitna bhara hai: CPU, memory, queue depth, link utilisation. Yeh trouble aane se pehle batata hai.</dd>
</dl>
<p>Do shortcuts inhe lagane mein madad karte hain. <b>RED</b> services aur requests ke liye hai: Rate, Errors, Duration. <b>USE</b> resources ke liye hai jaise interface, CPU ya buffer: Utilisation, Saturation, Errors. ERP application ke liye RED, Kochi router ke liye USE use karo.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Golden signals">
<rect x="20" y="30" width="140" height="70" rx="10" fill="#bae6fd"/><text x="90" y="60" text-anchor="middle" class="svg-ink" font-size="13">Latency</text><text x="90" y="80" text-anchor="middle" class="svg-muted" font-size="12">kitna slow</text>
<rect x="175" y="30" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="245" y="60" text-anchor="middle" class="svg-ink" font-size="13">Traffic</text><text x="245" y="80" text-anchor="middle" class="svg-muted" font-size="12">kitna zyada</text>
<rect x="330" y="30" width="140" height="70" rx="10" fill="#fed7aa"/><text x="400" y="60" text-anchor="middle" class="svg-ink" font-size="13">Errors</text><text x="400" y="80" text-anchor="middle" class="svg-muted" font-size="12">kitna toota</text>
<rect x="485" y="30" width="140" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="13">Saturation</text><text x="555" y="80" text-anchor="middle" class="svg-muted" font-size="12">kitna bhara</text>
<text x="90" y="135" text-anchor="middle" class="svg-ink" font-size="12">latency</text>
<text x="245" y="135" text-anchor="middle" class="svg-ink" font-size="12">util</text>
<text x="400" y="135" text-anchor="middle" class="svg-ink" font-size="12">loss</text>
<text x="555" y="135" text-anchor="middle" class="svg-ink" font-size="12">cpu, mem</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">har signal ke neeche console metric ke naam</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">RED = rate, errors, duration   USE = utilisation, saturation, errors</text>
</svg><p class="cap">Console metrics chaar signals par achhe se map ho jaate hain.</p></div>

<h3>Console aur uske seeded dashboards</h3>
<p>OBSERVER kholo aur pehle <b>Overview</b> dekho: yeh teen shehron ke saat targets (R-HYD, R-KCH, R-LKO, SW-HYD, SRV-HYD, SRV-KCH, SRV-LKO) ka summary deta hai aur dikhata hai kaun unhealthy hain. Phir <b>Dashboards</b> kholo. Do dashboards hain:</p>
<ul>
<li><code>d-health</code> (health) chaar panels ke saath: <code>p-cpu-hyd</code> (R-HYD ka CPU, saturation), <code>p-util-kch</code> (Kochi router ki utilisation, traffic), <code>p-lat-lko</code> (Lucknow ki latency) aur <code>p-loss-kch</code> (Kochi par loss, errors). Yaani ek screen par four golden signals.</li>
<li><code>d-erp</code> teen panels ke saath: ERP server ka CPU, memory aur utilisation.</li>
</ul>
<p>Har panel ek bada number dikhata hai, kaun sa target aur aggregation se bana, ek chhota trend aur ek coloured badge: ok, warn, crit ya <b>nodata</b>. Paanch metrics hain: cpu, mem, util, latency aur loss. Ek point paanch minute ka hai, to 12 points ek ghanta aur 288 ek din. Series ek hafte ko cover karti hain.</p>
<pre class="out">Dashboards > d-health
p-cpu-hyd    R-HYD   cpu      last   42 %     ok
p-util-kch   R-KCH   util     last   31 %     ok
p-lat-lko    R-LKO   latency  last   38 ms    ok
p-loss-kch   R-KCH   loss     last   <span class="hl">nodata</span>   polling of R-KCH failed</pre>
<p>"nodata" ka matlab yeh <b>nahi</b> ki device idle hai. Matlab hai poller ko jawab nahi mila, isliye dashboard ke paas draw karne ko kuch nahi. Yeh farak ticket 331020 mein ghanton bachata hai.</p>
<p><b>Wire/policy par kya badalta hai?</b> Dashboard padhne se kuch nahi badalta. Panel sirf stored data padhta hai, aur jo lines aap uspar draw karte ho woh colours hain, alerts nahi. Panel badalne se kisi device ko packet nahi jaata aur kisi ko page nahi hota. Sirf polling credentials, subscriptions aur alert rules badalte hain ki kya bheja jaata hai ya kisko bataya jaata hai.</p>

<h3>Achha dashboard kya banata hai</h3>
<ul>
<li><b>Ek audience, ek sawaal.</b> "Kya HQ healthy hai?" ya "Kya ERP slow hai?"</li>
<li><b>Sabse zaroori top left mein</b>, jahan aankhein pehle jaati hain.</li>
<li><b>Kam panels.</b> Chhe se baarah. Zyada hon to koi nahi padhta.</li>
<li><b>Consistent time range aur units</b> taaki panels compare ho sakein.</li>
<li><b>Thresholds panel par draw ho</b> taaki ek nazar mein ok aur not ok pata chale.</li>
<li><b>Drill-down</b>: upar summary, neeche detail.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> (1) "Hum collect karte hain" isliye sab dikhana. (2) Ek axis par alag units mix karna. (3) nodata ko zero samajhna. (4) Dashboard author ke liye banana, 03:00 par on-call insaan ke liye nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Four golden signals hain latency, traffic, errors aur saturation. Inhe observability ke three pillars (metrics, logs, traces) ya RED aur USE se mat milao, jo do derived methods hain.</p></div>

<div class="scn"><h4>Saath panels wala dashboard</h4><p>Hyderabad NOC ke paas ek dashboard tha jise har naya engineer sarahta tha aur incident mein koi use nahi karta tha. Outage mein on-call engineer chaar minute scroll karta raha. Meena Iyer ne use golden signals par bani aath panels ki ek screen se badal diya, warning aur critical lines ke saath. Agla incident ek minute se kam mein triage ho gaya.</p><p><b>Seekh:</b> dashboard ko is baat se judge karo ki woh thake hue insaan ko kitni jaldi decide karne mein madad karta hai.</p></div>

<div class="iv"><p class="q">"Branch router ke health dashboard par kya rakhoge?"</p><p>Strong answer: four golden signals ko router par map karke: hub tak latency, interface utilisation, loss ya errors, aur CPU ya memory saturation, har ek warning aur critical line ke saath, sab panels ke liye ek time range, aur detail ka link. Yeh bhi bolo ki nodata dikhna chahiye aur zero se alag.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four golden signals hain latency, traffic, errors aur saturation.</li>
<li>RED services ke liye, USE resources ke liye fit hai.</li>
<li>Achha dashboard kam panels aur visible thresholds ke saath ek sawaal jaldi answer karta hai.</li>
<li>Console mein d-health chaar signals dikhata hai; nodata matlab polling fail, idle nahi.</li>
<li>Panel dekhne se wire par kuch nahi badalta; sirf polling, subscriptions aur alert rules badalte hain.</li>
</ul></div>
`}};export{e as default};