var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The whole module in one picture</h3>
<p>You started with a guard who visits every five minutes and ended with a secure stream that you designed, built and repaired. Streaming telemetry is model-driven: you pick a path from a data model, choose when the device sends it, and point it at a collector over TLS. The console OBSERVER turns those choices into cards you can edit, and every Apply is a real change in what the device sends. Remember the tagline: <b>Click-ops, but you understand what each click does.</b></p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Telemetry pipeline">
<rect x="15" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="70" y="92" text-anchor="middle" class="svg-ink" font-size="12">Device</text><text x="70" y="108" text-anchor="middle" class="svg-muted" font-size="12">model + paths</text>
<rect x="175" y="70" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="230" y="92" text-anchor="middle" class="svg-ink" font-size="12">Subscription</text><text x="230" y="108" text-anchor="middle" class="svg-muted" font-size="12">mode + interval</text>
<rect x="335" y="70" width="110" height="50" rx="8" fill="#fde68a"/><text x="390" y="92" text-anchor="middle" class="svg-ink" font-size="12">TLS channel</text><text x="390" y="108" text-anchor="middle" class="svg-muted" font-size="12">port + certificate</text>
<rect x="495" y="70" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="92" text-anchor="middle" class="svg-ink" font-size="12">Collector</text><text x="560" y="108" text-anchor="middle" class="svg-muted" font-size="12">store + dashboards</text>
<g stroke="#64748b" stroke-width="2"><line x1="125" y1="95" x2="175" y2="95"/><line x1="285" y1="95" x2="335" y2="95"/><line x1="445" y1="95" x2="495" y2="95"/></g>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">every box can fail: check them in order</text>
</svg><p class="cap">The four things that must line up for data to arrive.</p></div>

<h3>Can-do checklist</h3>
<p>You are ready for the exam and for an interview when you can do each of these without notes:</p>
<ul>
<li>Explain why a five-minute counter poll averages away a burst, using numbers.</li>
<li>Compare pull and push, and name one signal that should stay on polling.</li>
<li>Describe YANG, a path, a key predicate and an OpenConfig-style model.</li>
<li>Name the three gNMI operations and say which one changes configuration.</li>
<li>Choose sample or on-change for a link state, a counter and a queue depth, and justify it.</li>
<li>Explain the interval versus microburst trade-off and the cost side: cardinality, rate, retention.</li>
<li>Explain dial-in and dial-out and which is firewall-friendly.</li>
<li>Compare JSON and protobuf, and state what TLS protects.</li>
<li>Walk the ordered troubleshooting workflow and name the reason codes.</li>
<li>Build, fix and prove a subscription in the console (labs obs-tel-1 and obs-tel-2).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Telemetry</dt><dd>Data a device reports about itself, here streamed from a model.</dd>
<dt>gNMI</dt><dd>A management interface over gRPC with Get, Set and Subscribe.</dd>
<dt>YANG</dt><dd>A language that describes a data model as a tree.</dd>
<dt>Path</dt><dd>The address of a node in the model, with slashes and optional key predicates.</dd>
<dt>Sample</dt><dd>Send the value every interval.</dd>
<dt>On-change</dt><dd>Send only when the value changes.</dd>
<dt>Target-defined</dt><dd>The device chooses sample or on-change per leaf.</dd>
<dt>Dial-in / dial-out</dt><dd>Collector connects to device / device connects to collector.</dd>
<dt>Encoding</dt><dd>JSON (readable) or protobuf (compact binary).</dd>
<dt>Cardinality</dt><dd>The number of distinct series stored.</dd>
</dl>

<h3>Most tested facts</h3>
<ul>
<li>Subscribe streams, Get reads once, Set changes configuration.</li>
<li>On-change fits state-like leaves; counters and CPU are sample only.</li>
<li>Event shorter than the sample interval can be invisible with a green stream.</li>
<li>TLS protects the channel; protobuf is smaller than JSON but needs the schema.</li>
<li>Ports come from vendor documentation. The simulator uses its own numbers.</li>
<li>Silence is not proof of health: monitor the stream itself.</li>
</ul>

<h3>Console cheat-sheet</h3>
<pre class="code"><span class="c">! Telemetry page, one subscription card</span>
Name        ts-if-kch
Target      R-KCH
Path        /interfaces/interface[name=Gi0/1]/state/oper-status
Mode        on-change
Collector   10.1.50.100:57400
TLS         on        Enabled   on
<span class="c">! then: CommitBar - Apply changes; Live tools - capture on R-KCH</span></pre>
<p><b>What does this change on the wire/policy?</b> A subscription decides what the device sends, how often, to whom and over which secure channel. Nothing else in the network changes.</p>

<div class="warn"><p><b>Common mistakes to avoid on exam day.</b> Mixing up Subscribe and Set; picking on-change for counters; reading a green badge as proof that an event was captured; forgetting that Apply is what makes a change live.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Dial-out is less secure because the device initiates." No. Direction does not decide security; TLS and certificates do. Dial-out is simply easier through firewalls.</p></div>

<div class="scn"><h4>The interview whiteboard</h4><p>A candidate was asked to monitor a link that flaps and a link that bursts. She chose on-change on oper-status for the flap, a 500 ms queue-depth sample on the one bursting link, and polling every five minutes for CPU. She added a heartbeat check on the stream and costed the series. The panel hired her.</p><p><b>Lesson:</b> match each signal to the cheapest method that still sees the event.</p></div>

<div class="iv"><p class="q">"Design telemetry for three branches in a nutshell."</p><p>Strong answer: on-change for interface and BGP state, fast sample only for queue depth on the critical uplinks, five-minute polling for slow gauges, all over TLS to one collector, with a health check that alerts when a stream goes quiet, and retention that rolls fine data up.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stream what needs speed, poll what does not.</li>
<li>Model, path, mode, interval, collector, TLS: six decisions per subscription.</li>
<li>The interval must not be longer than the event you want to see.</li>
<li>Troubleshoot in order, one change at a time, and prove it with a capture.</li>
<li>Next: obs-dash turns this data into dashboards and baselines.</li>
</ul></div>
`,hi:`
<h3>Poora module ek picture mein</h3>
<p>Aapne ek guard se shuru kiya jo har paanch minute mein aata tha aur ek secure stream par khatam kiya jo aapne design ki, banayi aur repair ki. Streaming telemetry model-driven hai: aap data model se ek path chunte ho, chunte ho ki device use kab bheje, aur TLS par collector ki taraf point karte ho. Console OBSERVER in choices ko cards mein badal deta hai jo aap edit kar sakte ho, aur har Apply is baat mein asli change hai ki device kya bhejta hai. Tagline yaad rakho: <b>Click-ops, but you understand what each click does.</b></p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Telemetry pipeline">
<rect x="15" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="70" y="92" text-anchor="middle" class="svg-ink" font-size="12">Device</text><text x="70" y="108" text-anchor="middle" class="svg-muted" font-size="12">model + paths</text>
<rect x="175" y="70" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="230" y="92" text-anchor="middle" class="svg-ink" font-size="12">Subscription</text><text x="230" y="108" text-anchor="middle" class="svg-muted" font-size="12">mode + interval</text>
<rect x="335" y="70" width="110" height="50" rx="8" fill="#fde68a"/><text x="390" y="92" text-anchor="middle" class="svg-ink" font-size="12">TLS channel</text><text x="390" y="108" text-anchor="middle" class="svg-muted" font-size="12">port + certificate</text>
<rect x="495" y="70" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="92" text-anchor="middle" class="svg-ink" font-size="12">Collector</text><text x="560" y="108" text-anchor="middle" class="svg-muted" font-size="12">store + dashboards</text>
<g stroke="#64748b" stroke-width="2"><line x1="125" y1="95" x2="175" y2="95"/><line x1="285" y1="95" x2="335" y2="95"/><line x1="445" y1="95" x2="495" y2="95"/></g>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">har box fail ho sakta hai: order mein check karo</text>
</svg><p class="cap">Chaar cheezein jo align honi chahiye taaki data aaye.</p></div>

<h3>Can-do checklist</h3>
<p>Aap exam aur interview ke liye ready ho jab inme se har ek bina notes ke kar sako:</p>
<ul>
<li>Numbers ke saath samjhao ki paanch minute ka counter poll burst ko kyun average kar deta hai.</li>
<li>Pull aur push compare karo, aur ek signal batao jo polling par rehna chahiye.</li>
<li>YANG, path, key predicate aur OpenConfig-style model describe karo.</li>
<li>Teen gNMI operations ke naam batao aur kaun configuration badalta hai.</li>
<li>Link state, counter aur queue depth ke liye sample ya on-change chuno aur justify karo.</li>
<li>Interval versus microburst trade-off aur cost side samjhao: cardinality, rate, retention.</li>
<li>Dial-in aur dial-out samjhao aur kaun firewall-friendly hai.</li>
<li>JSON aur protobuf compare karo, aur batao TLS kya protect karta hai.</li>
<li>Ordered troubleshooting workflow chalao aur reason codes ke naam batao.</li>
<li>Console mein subscription banao, fix karo aur saabit karo (labs obs-tel-1 aur obs-tel-2).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Telemetry</dt><dd>Woh data jo device apne baare mein report karta hai, yahan model se stream hota hai.</dd>
<dt>gNMI</dt><dd>gRPC par management interface jisme Get, Set aur Subscribe hain.</dd>
<dt>YANG</dt><dd>Language jo data model ko tree ki tarah describe karti hai.</dd>
<dt>Path</dt><dd>Model ke ek node ka address, slashes aur optional key predicates ke saath.</dd>
<dt>Sample</dt><dd>Har interval par value bhejo.</dd>
<dt>On-change</dt><dd>Sirf value badalne par bhejo.</dd>
<dt>Target-defined</dt><dd>Device har leaf ke liye sample ya on-change chunta hai.</dd>
<dt>Dial-in / dial-out</dt><dd>Collector device se connect karta hai / device collector se connect karta hai.</dd>
<dt>Encoding</dt><dd>JSON (readable) ya protobuf (compact binary).</dd>
<dt>Cardinality</dt><dd>Store kiye gaye distinct series ki ginti.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>Subscribe stream karta hai, Get ek baar padhta hai, Set configuration badalta hai.</li>
<li>On-change state-like leaves ke liye hai; counters aur CPU sirf sample.</li>
<li>Sample interval se chhota event hari stream ke saath bhi invisible ho sakta hai.</li>
<li>TLS channel protect karta hai; protobuf JSON se chhota hai lekin schema chahiye.</li>
<li>Ports vendor documentation se aate hain. Simulator apne numbers use karta hai.</li>
<li>Chuppi health ka proof nahi hai: stream ko khud monitor karo.</li>
</ul>

<h3>Console cheat-sheet</h3>
<pre class="code"><span class="c">! Telemetry page, ek subscription card</span>
Name        ts-if-kch
Target      R-KCH
Path        /interfaces/interface[name=Gi0/1]/state/oper-status
Mode        on-change
Collector   10.1.50.100:57400
TLS         on        Enabled   on
<span class="c">! phir: CommitBar - Apply changes; Live tools - R-KCH par capture</span></pre>
<p><b>Wire/policy par kya badalta hai?</b> Subscription decide karti hai ki device kya bhejta hai, kitni baar, kisko aur kaun se secure channel par. Network mein aur kuch nahi badalta.</p>

<div class="warn"><p><b>Exam ke din bachne wali galtiyan.</b> Subscribe aur Set ko mix karna; counters ke liye on-change chunna; hare badge ko is baat ka saboot samajhna ki event capture hua; yeh bhoolna ki Apply hi change ko live karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Dial-out kam secure hai kyunki device shuru karta hai." Nahi. Direction security decide nahi karti; TLS aur certificates karte hain. Dial-out bas firewalls ke through aasan hai.</p></div>

<div class="scn"><h4>Interview ka whiteboard</h4><p>Ek candidate se kaha gaya ki ek flap hone wale link aur ek burst karne wale link ko monitor karo. Usne flap ke liye oper-status par on-change, burst wale ek link par 500 ms queue-depth sample, aur CPU ke liye har paanch minute ki polling chuni. Usne stream par heartbeat check jodi aur series ki costing ki. Panel ne use hire kar liya.</p><p><b>Seekh:</b> har signal ko sabse sasta method do jo phir bhi event dekh sake.</p></div>

<div class="iv"><p class="q">"Teen branches ke liye telemetry ek nutshell mein design karo."</p><p>Strong answer: interface aur BGP state ke liye on-change, sirf critical uplinks par queue depth ke liye fast sample, slow gauges ke liye paanch-minute polling, sab TLS par ek collector tak, ek health check jo stream chup hone par alert kare, aur retention jo fine data ko roll up kare.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Jise speed chahiye use stream karo, jise nahi use poll karo.</li>
<li>Model, path, mode, interval, collector, TLS: har subscription ke chhe decisions.</li>
<li>Interval us event se lamba nahi hona chahiye jo aap dekhna chahte ho.</li>
<li>Order mein troubleshoot karo, ek time par ek change, aur capture se saabit karo.</li>
<li>Aage: obs-dash is data ko dashboards aur baselines mein badalta hai.</li>
</ul></div>
`}};export{e as default};