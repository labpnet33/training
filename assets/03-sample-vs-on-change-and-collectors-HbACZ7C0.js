var e={id:`sample-onchange-collectors`,h:{en:`Sample, on-change and collectors`,hi:`Sample, on-change aur collectors`},body:{en:`
<h3>Three ways to decide when data is sent</h3>
<p>Once you pick a path, you choose <i>when</i> the device sends it. Think of a smoke detector, a thermometer and a doorbell. The thermometer is read on a schedule. The smoke detector and the doorbell speak only when something happens.</p>
<dl class="terms">
<dt>Sample</dt><dd>The device sends the current value every fixed interval, for example every 10000 ms. You get a regular series, even when nothing changes.</dd>
<dt>On-change</dt><dd>The device sends a value only when it changes, plus one initial value when the subscription starts. Perfect for link state or a BGP session. The stream is silent when the world is stable.</dd>
<dt>Target-defined</dt><dd>You let the device decide: it picks on-change for state-like leaves and sample for the rest. Convenient, but you give up control of the interval. The console offers sample and on-change; target-defined is a concept you meet in the protocol.</dd>
</dl>
<p>A related idea: many devices also let you ask for a heartbeat, a periodic repeat of an unchanged on-change value, so the collector can tell "nothing changed" from "the stream died". Silence is ambiguous, and a good design removes the ambiguity.</p>

<h3>The sampling interval versus microburst trade-off</h3>
<p>A sample reads one instant. A microburst, a surge lasting tens or hundreds of milliseconds, is seen only if a sample lands inside it. With an interval of 10000 ms and an event of 800 ms, the chance of catching it is 800 / 10000, which is 8 percent. A shorter interval raises the chance but multiplies the data.</p>
<div class="eg"><p><b>Worked example.</b> Interface counters on R-HYD at 10000 ms give 8640 readings a day per leaf. At 1000 ms they give 86400, ten times as many. A 800 ms event is caught about 80 percent of the time by a 1000 ms sample, and certainly by an interval of 500 ms or less. The console tool "Will this subscription see an event?" applies the contract rule: an on-change subscription always sees the event; a sample subscription sees it only if its interval is not larger than the event. So type 800 ms and test 10000 (hidden), 1000 (hidden, the interval is larger than the event) and 500 (visible).</p></div>
<p>The rule is deliberately strict: it teaches the safe design, "sample no slower than the event you care about". For counters that cannot use on-change, a different trick works: stream a <b>queue depth</b> path (<code>/qos/interface/queue/depth</code>) at a fast interval only on the few links that matter, rather than every counter everywhere.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Interval versus event">
<line x1="20" y1="120" x2="620" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="300" y="50" width="30" height="70" fill="#fed7aa"/><text x="315" y="40" text-anchor="middle" class="svg-accent" font-size="12">event 800 ms</text>
<g fill="#bae6fd"><circle cx="40" cy="110" r="5"/><circle cx="200" cy="110" r="5"/><circle cx="360" cy="110" r="5"/><circle cx="520" cy="110" r="5"/></g>
<text x="120" y="150" text-anchor="middle" class="svg-muted" font-size="12">sample 10000 ms: misses</text>
<g fill="#bbf7d0"><circle cx="300" cy="100" r="5"/><circle cx="315" cy="100" r="5"/><circle cx="330" cy="100" r="5"/></g>
<text x="440" y="150" text-anchor="middle" class="svg-muted" font-size="12">sample 500 ms or on-change: sees it</text>
<text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="12">shorter interval = more data and more load</text>
</svg><p class="cap">Blue dots miss the event; green dots land inside it.</p></div>

<h3>Dial-in versus dial-out</h3>
<p>Who opens the connection? In <b>dial-in</b> the collector connects to the device and sends a Subscribe request; the device streams back over that same connection. The collector needs a route and permission to reach the device, and the subscription lives as long as the connection. In <b>dial-out</b> the device is configured with the collector address and opens the connection itself. Dial-out is friendly to firewalls and NAT, because the device starts the session outward, and it survives collector restarts by reconnecting. The console models a subscription with a collector address and port, which is the dial-out view: R-KCH is told to send to 10.1.50.100:57400.</p>

<h3>The collector, cardinality and cost</h3>
<p>The <b>collector</b> terminates TLS, decodes JSON or protobuf, adds labels such as device and site, and writes to a store that dashboards query. Three costs grow together:</p>
<ul>
<li><b>Cardinality</b>: the number of distinct series. One counters path on a router with 48 interfaces and 6 counters is 288 series. Add a label with many values, such as a customer or flow id, and the count explodes.</li>
<li><b>Rate</b>: series times samples per second.</li>
<li><b>Retention</b>: how long you keep fine-grained data. Keep seconds-level data for days and roll it up to five-minute averages for months.</li>
</ul>
<p>Rule of thumb: stream state with on-change, stream a few hot counters fast, keep everything else on polling every few minutes.</p>

<h3>Lab obs-tel-1: build it in the console</h3>
<p>Lab obs-tel-1 asks for a gNMI subscription with both modes. The lab brief gives the exact path, interval and target; the method below is always the same.</p>
<ol>
<li>Open <b>Telemetry</b> in OBSERVER and press <b>Add subscription</b>. A card "New subscription" appears with defaults: R-HYD, <code>/system/cpu</code>, sample, 10000 ms, collector 10.1.50.100:57400, TLS on, port 57400, enabled.</li>
<li>Press <b>Edit</b>. Set the target, pick the path from the model list (the six paths on the page), set mode. For a link-state path choose <b>on-change</b>; for counters, CPU or queue depth choose <b>sample</b> and set the interval.</li>
<li>Check that TLS is on, Enabled is on and the device port matches the device. Read "After Apply", the preview line on the card.</li>
<li>Press <b>Apply changes</b> in the CommitBar. The badge turns green "streaming".</li>
<li>Use "Will this subscription see an event?" to test the event length the brief mentions.</li>
</ol>
<p><b>What does this change on the wire/policy?</b> Adding the subscription changes what the device sends: from nothing to a secure stream to 10.1.50.100. Switching a path from sample to on-change changes the stream from "every interval" to "only when it changes", which cuts volume for link state by orders of magnitude. Switching the interval from 10000 to 500 ms multiplies volume by twenty.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Streaming everything at one second "to be safe": the collector and the router CPU pay. (2) Using sample for link state and finding out about a link flap a whole interval late. (3) Forgetting Apply: the card shows your edit, but the applied state is unchanged.</p></div>
<div class="exam"><p><b>Exam trap.</b> On-change is not available for every leaf. A counter changes every moment, so counter paths are sample only. Also, on-change sends nothing while the value is stable, so add a heartbeat or health check to detect a dead stream.</p></div>

<div class="scn"><h4>The flap that sample mode hid</h4><p>A Kochi uplink flapped for four seconds twice a day. The ten-second sample of oper-status caught it only one time in a week. Changing that single subscription to on-change produced a down and an up event with exact timestamps for every flap, with less data than before.</p><p><b>Lesson:</b> match the mode to the shape of the signal.</p></div>

<div class="iv"><p class="q">"How do you choose the sampling interval, and what is the cost of going lower?"</p><p>Strong answer: pick it from the shortest event you must see, no slower than that event, then check the cost: more series times more samples means more CPU on the device, more bandwidth and more storage. Prefer on-change for state, fast sample on a few hot paths, and roll data up for long retention.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sample sends every interval, on-change sends only changes, target-defined lets the device choose.</li>
<li>A sample sees an event only if the interval is not longer than the event; on-change always sees it.</li>
<li>Dial-in means the collector connects; dial-out means the device connects to the collector.</li>
<li>Cardinality, rate and retention drive collector cost.</li>
<li>In the console: Add subscription, Edit, check TLS and Enabled, Apply, then test the event length.</li>
</ul></div>
`,hi:`
<h3>Data kab bheja jaye, uske teen tareeke</h3>
<p>Path chunne ke baad aap chunte ho ki device use <i>kab</i> bheje. Smoke detector, thermometer aur doorbell socho. Thermometer schedule par padha jaata hai. Smoke detector aur doorbell tabhi bolte hain jab kuch hota hai.</p>
<dl class="terms">
<dt>Sample</dt><dd>Device har fixed interval par current value bhejta hai, jaise har 10000 ms. Kuch na badle tab bhi aapko regular series milti hai.</dd>
<dt>On-change</dt><dd>Device value tabhi bhejta hai jab woh badle, aur subscription shuru hone par ek initial value. Link state ya BGP session ke liye perfect. Duniya stable ho to stream chup rehti hai.</dd>
<dt>Target-defined</dt><dd>Aap device par chhod dete ho: woh state-like leaves ke liye on-change aur baaki ke liye sample chunta hai. Convenient hai, lekin interval ka control chala jaata hai. Console sample aur on-change deta hai; target-defined protocol mein milne wala concept hai.</dd>
</dl>
<p>Ek related idea: kai devices heartbeat bhi maangne dete hain, yani unchanged on-change value ka periodic repeat, taaki collector "kuch nahi badla" aur "stream mar gayi" mein farak bata sake. Chuppi ambiguous hoti hai, aur achha design is ambiguity ko hata deta hai.</p>

<h3>Sampling interval versus microburst trade-off</h3>
<p>Sample ek pal padhta hai. Microburst, yani das ya sau milliseconds ka surge, tabhi dikhta hai jab koi sample uske andar gire. 10000 ms interval aur 800 ms event ke saath pakadne ka chance 800 / 10000 hai, yani 8 percent. Chhota interval chance badhata hai lekin data multiply kar deta hai.</p>
<div class="eg"><p><b>Worked example.</b> R-HYD ke interface counters 10000 ms par ek leaf ke liye din mein 8640 readings dete hain. 1000 ms par 86400, das guna. 800 ms ka event 1000 ms sample se lagbhag 80 percent pakda jaata hai, aur 500 ms ya usse kam interval se pakka. Console ka tool "Will this subscription see an event?" contract ka rule lagata hai: on-change subscription event hamesha dekhti hai; sample subscription tabhi dekhti hai jab uska interval event se bada na ho. To 800 ms event likho aur 10000 (hidden), 1000 (hidden, interval event se bada hai) aur 500 (visible) test karo.</p></div>
<p>Rule jaanbujhkar strict hai: yeh safe design sikhata hai, "sample us event se slow nahi jise tum dekhna chahte ho". Jo counters on-change nahi use kar sakte unke liye alag trick chalti hai: har jagah har counter ki jagah sirf kuch zaroori links par <b>queue depth</b> path (<code>/qos/interface/queue/depth</code>) tez interval par stream karo.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Interval versus event">
<line x1="20" y1="120" x2="620" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="300" y="50" width="30" height="70" fill="#fed7aa"/><text x="315" y="40" text-anchor="middle" class="svg-accent" font-size="12">event 800 ms</text>
<g fill="#bae6fd"><circle cx="40" cy="110" r="5"/><circle cx="200" cy="110" r="5"/><circle cx="360" cy="110" r="5"/><circle cx="520" cy="110" r="5"/></g>
<text x="120" y="150" text-anchor="middle" class="svg-muted" font-size="12">sample 10000 ms: miss</text>
<g fill="#bbf7d0"><circle cx="300" cy="100" r="5"/><circle cx="315" cy="100" r="5"/><circle cx="330" cy="100" r="5"/></g>
<text x="440" y="150" text-anchor="middle" class="svg-muted" font-size="12">sample 500 ms ya on-change: dikhta hai</text>
<text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="12">chhota interval = zyada data aur zyada load</text>
</svg><p class="cap">Neele dots event miss karte hain; hare dots uske andar girte hain.</p></div>

<h3>Dial-in versus dial-out</h3>
<p>Connection kaun kholta hai? <b>Dial-in</b> mein collector device se connect hota hai aur Subscribe request bhejta hai; device usi connection par stream wapas karta hai. Collector ko device tak route aur permission chahiye, aur subscription connection ke saath hi jeeti hai. <b>Dial-out</b> mein device ko collector ka address diya jaata hai aur woh khud connection kholta hai. Dial-out firewalls aur NAT ke liye friendly hai, kyunki device session bahar ki taraf shuru karta hai, aur collector restart hone par reconnect karke survive karta hai. Console subscription ko collector address aur port ke saath model karta hai, yani dial-out view: R-KCH ko 10.1.50.100:57400 par bhejne ko kaha gaya hai.</p>

<h3>Collector, cardinality aur cost</h3>
<p><b>Collector</b> TLS terminate karta hai, JSON ya protobuf decode karta hai, device aur site jaise labels jodta hai, aur ek store mein likhta hai jise dashboards query karte hain. Teen costs saath mein badhti hain:</p>
<ul>
<li><b>Cardinality</b>: distinct series ki ginti. 48 interfaces aur 6 counters wale router par ek counters path 288 series hai. Aisa label jodo jiski bahut values hon, jaise customer ya flow id, to ginti phat jaati hai.</li>
<li><b>Rate</b>: series guna per second samples.</li>
<li><b>Retention</b>: fine-grained data kitne time rakhte ho. Seconds-level data dinon ke liye rakho aur mahino ke liye paanch-minute averages mein roll up karo.</li>
</ul>
<p>Thumb rule: state ko on-change se stream karo, kuch hot counters tez stream karo, baaki sab ko har kuch minute ki polling par rakho.</p>

<h3>Lab obs-tel-1: console mein banao</h3>
<p>Lab obs-tel-1 dono modes wali gNMI subscription maangta hai. Lab brief exact path, interval aur target deta hai; neeche ka method hamesha wahi rehta hai.</p>
<ol>
<li>OBSERVER mein <b>Telemetry</b> kholo aur <b>Add subscription</b> dabao. Defaults ke saath "New subscription" card aata hai: R-HYD, <code>/system/cpu</code>, sample, 10000 ms, collector 10.1.50.100:57400, TLS on, port 57400, enabled.</li>
<li><b>Edit</b> dabao. Target set karo, model list se path chuno (page par chhe paths), mode set karo. Link-state path ke liye <b>on-change</b>; counters, CPU ya queue depth ke liye <b>sample</b> aur interval set karo.</li>
<li>Check karo ki TLS on hai, Enabled on hai aur device port device se match karta hai. Card par "After Apply" preview line padho.</li>
<li>CommitBar mein <b>Apply changes</b> dabao. Badge hara "streaming" ho jaata hai.</li>
<li>"Will this subscription see an event?" se brief ki event length test karo.</li>
</ol>
<p><b>Wire/policy par kya badalta hai?</b> Subscription jodne se device jo bhejta hai woh badalta hai: kuch nahi se 10.1.50.100 tak secure stream. Path ko sample se on-change karne se stream "har interval" se "sirf badalne par" ho jaati hai, jisse link state ka volume kai guna ghat jaata hai. Interval 10000 se 500 ms karne se volume bees guna ho jaata hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) "Safe rahne ke liye" sab kuch ek second par stream karna: collector aur router CPU keemat chukate hain. (2) Link state ke liye sample use karke link flap ka pata poora interval late chalna. (3) Apply bhool jaana: card aapka edit dikhata hai, par applied state wahi rehti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> On-change har leaf ke liye available nahi hai. Counter har pal badalta hai, isliye counter paths sirf sample hain. Aur on-change value stable rehne par kuch nahi bhejta, isliye mari hui stream pakadne ke liye heartbeat ya health check jodo.</p></div>

<div class="scn"><h4>Woh flap jo sample mode ne chhupa diya</h4><p>Kochi ka ek uplink din mein do baar chaar second ke liye flap hota tha. Das second ke oper-status sample ne use hafte mein sirf ek baar pakda. Sirf us ek subscription ko on-change karne se har flap ka down aur up event exact timestamps ke saath mila, pehle se kam data ke saath.</p><p><b>Seekh:</b> mode ko signal ki shape se match karo.</p></div>

<div class="iv"><p class="q">"Sampling interval kaise chunte ho, aur kam karne ki cost kya hai?"</p><p>Strong answer: use sabse chhote event se chunta hoon jo dikhna zaroori hai, us event se slow nahi, phir cost check karta hoon: zyada series guna zyada samples matlab device par zyada CPU, zyada bandwidth aur zyada storage. State ke liye on-change, kuch hot paths par fast sample, aur lambi retention ke liye data roll up.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sample har interval bhejta hai, on-change sirf changes, target-defined device ko chunne deta hai.</li>
<li>Sample event tabhi dekhta hai jab interval event se lamba na ho; on-change hamesha dekhta hai.</li>
<li>Dial-in matlab collector connect karta hai; dial-out matlab device collector se connect karta hai.</li>
<li>Cardinality, rate aur retention collector cost chalate hain.</li>
<li>Console mein: Add subscription, Edit, TLS aur Enabled check, Apply, phir event length test.</li>
</ul></div>
`}};export{e as default};