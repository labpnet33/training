var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The module in one page</h3>
<p>A dashboard is a fast answer to one question. You learned to choose what to show (the four golden signals, with RED for services and USE for resources), to ask each panel a precise question (metric, target, aggregation, window), to colour the answer with honest thresholds, and to judge readings against a baseline. You also learned how dashboards lie: nodata, hiding averages, drifted baselines and seasonal peaks. Remember the tagline: <b>Click-ops, but you understand what each click does.</b> Panels and baselines only read and judge data; polling credentials, subscriptions and alert rules are the clicks that change what is sent or who is told.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="From data to decision">
<rect x="15" y="60" width="115" height="60" rx="8" fill="#bae6fd"/><text x="72" y="86" text-anchor="middle" class="svg-ink" font-size="12">Polled data</text><text x="72" y="104" text-anchor="middle" class="svg-muted" font-size="12">5 min points</text>
<rect x="160" y="60" width="115" height="60" rx="8" fill="#bbf7d0"/><text x="217" y="86" text-anchor="middle" class="svg-ink" font-size="12">Query</text><text x="217" y="104" text-anchor="middle" class="svg-muted" font-size="12">agg + window</text>
<rect x="305" y="60" width="115" height="60" rx="8" fill="#ddd6fe"/><text x="362" y="86" text-anchor="middle" class="svg-ink" font-size="12">Judgement</text><text x="362" y="104" text-anchor="middle" class="svg-muted" font-size="12">threshold, baseline</text>
<rect x="450" y="60" width="175" height="60" rx="8" fill="#fde68a"/><text x="537" y="86" text-anchor="middle" class="svg-ink" font-size="12">Decision</text><text x="537" y="104" text-anchor="middle" class="svg-muted" font-size="12">ok, look, act</text>
<g stroke="#64748b" stroke-width="2"><line x1="130" y1="90" x2="160" y2="90"/><line x1="275" y1="90" x2="305" y2="90"/><line x1="420" y1="90" x2="450" y2="90"/></g>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">errors can enter at every stage: check each one</text>
</svg><p class="cap">Every stage can mislead; troubleshoot them in order.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Name the four golden signals and map each to a console metric.</li>
<li>Explain RED and USE and say which fits a service and which a resource.</li>
<li>Choose a panel type for a given need.</li>
<li>Compare last, avg, max and p95 and choose one for latency and for capacity.</li>
<li>Convert a window in points to time: 12 is an hour, 288 a day, 2016 a week.</li>
<li>Set warn and crit lines from data and explain that they do not page anyone.</li>
<li>Calculate a z-score and read a baseline card.</li>
<li>Contrast fixed and rolling baselines and define drift.</li>
<li>Explain how daily seasonality removes false alarms.</li>
<li>Run the five-step dashboard troubleshooting workflow.</li>
<li>Complete labs obs-dash-1, obs-dash-2 and obs-dash-3 in the console.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Golden signals</dt><dd>Latency, traffic, errors, saturation.</dd>
<dt>RED</dt><dd>Rate, errors, duration: for services.</dd>
<dt>USE</dt><dd>Utilisation, saturation, errors: for resources.</dd>
<dt>Panel</dt><dd>One question drawn as a number and trend.</dd>
<dt>Aggregation</dt><dd>How many points become one value: last, avg, max, p95.</dd>
<dt>Threshold</dt><dd>A warn or crit line that colours a panel. Not an alert.</dd>
<dt>Baseline</dt><dd>Mean and sd that define normal for a metric.</dd>
<dt>z-score</dt><dd>(reading - mean) / sd.</dd>
<dt>Drift</dt><dd>A rolling baseline learning a lasting problem as normal.</dd>
<dt>Seasonality</dt><dd>A repeating pattern, such as a daily peak.</dd>
<dt>nodata</dt><dd>The poller got no answer. Not the same as zero.</dd>
</dl>

<h3>Most tested facts</h3>
<ul>
<li>Golden signals are latency, traffic, errors and saturation.</li>
<li>avg hides spikes, max is dominated by one glitch, p95 shows the tail.</li>
<li>Thresholds on a panel are colours; alert rules with routes notify.</li>
<li>A fixed baseline never changes; a rolling baseline re-learns and can drift.</li>
<li>Compare against the healthy reference to detect drift.</li>
<li>Seasonality compares with the same time on earlier days.</li>
<li>nodata means polling failed; fix credentials or reachability first.</li>
</ul>

<h3>Console cheat-sheet</h3>
<pre class="code"><span class="c">! Dashboards page: Edit a panel</span>
Title    Kochi latency
Target   R-KCH     Metric   latency
Value    avg       Window   144
Warn     60        Crit     90
<span class="c">! Baselines page: Edit a baseline</span>
Mode     fixed     Sigma (k)   3     Seasonality   daily
<span class="c">! then CommitBar - Apply changes</span></pre>
<p><b>What does this change on the wire/policy?</b> None of these edits sends a packet to a device. They change how stored data is shown and judged. Where an alert rule uses a baseline, they also change when that rule fires.</p>

<div class="warn"><p><b>Common mistakes to avoid on exam day.</b> Treating a red panel as a page; choosing rolling for outage detection; mixing up p95 with the average of the top 5 percent; forgetting that a window in points depends on the five-minute step.</p></div>
<div class="exam"><p><b>Exam trap.</b> "The dashboard shows 0 percent loss for the Lucknow router." Check whether this is a real zero or nodata displayed as zero before believing it.</p></div>

<div class="scn"><h4>One screen, four signals, no surprises</h4><p>After three incidents in a quarter the Godavari Foods team rebuilt its health dashboard: four golden signals for each city, fixed baselines for latency, a daily seasonal baseline for utilisation, thresholds from the healthy week, and a loud nodata state. In the next quarter the on-call engineer found the cause of every incident from this one screen within ten minutes.</p><p><b>Lesson:</b> design for the tired engineer, judge with the right baseline, and never hide missing data.</p></div>

<div class="iv"><p class="q">"Walk me through building a health dashboard from nothing."</p><p>Strong answer: start from the question, choose the four golden signals for the service, pick the target and aggregation for each panel, set warn and crit from the healthy week, keep a single time window, show nodata clearly, add baselines with seasonality for patterns and a fixed reference for service levels, test it against a known fault, then hand ownership to a team.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Show four signals per service on one screen with honest thresholds.</li>
<li>Pick aggregation and window to match the decision.</li>
<li>Judge with baselines, but never let a rolling baseline be the only guard.</li>
<li>nodata is information; treat it as a fault until proven otherwise.</li>
<li>Next: obs-alert turns these judgements into notifications with duration, dedupe and routing.</li>
</ul></div>
`,hi:`
<h3>Module ek page mein</h3>
<p>Dashboard ek sawaal ka tez jawab hai. Aapne seekha ki kya dikhana hai (four golden signals, services ke liye RED aur resources ke liye USE), har panel se ek precise sawaal kaise poochna hai (metric, target, aggregation, window), jawab ko imaandaar thresholds se kaise colour karna hai, aur readings ko baseline ke against kaise judge karna hai. Aapne yeh bhi seekha ki dashboards jhooth kaise bolte hain: nodata, averages se chhupana, drifted baselines aur seasonal peaks. Tagline yaad rakho: <b>Click-ops, but you understand what each click does.</b> Panels aur baselines sirf data padhte aur judge karte hain; polling credentials, subscriptions aur alert rules woh clicks hain jo badalte hain ki kya bheja jaata hai ya kisko bataya jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="From data to decision">
<rect x="15" y="60" width="115" height="60" rx="8" fill="#bae6fd"/><text x="72" y="86" text-anchor="middle" class="svg-ink" font-size="12">Polled data</text><text x="72" y="104" text-anchor="middle" class="svg-muted" font-size="12">5 min points</text>
<rect x="160" y="60" width="115" height="60" rx="8" fill="#bbf7d0"/><text x="217" y="86" text-anchor="middle" class="svg-ink" font-size="12">Query</text><text x="217" y="104" text-anchor="middle" class="svg-muted" font-size="12">agg + window</text>
<rect x="305" y="60" width="115" height="60" rx="8" fill="#ddd6fe"/><text x="362" y="86" text-anchor="middle" class="svg-ink" font-size="12">Judgement</text><text x="362" y="104" text-anchor="middle" class="svg-muted" font-size="12">threshold, baseline</text>
<rect x="450" y="60" width="175" height="60" rx="8" fill="#fde68a"/><text x="537" y="86" text-anchor="middle" class="svg-ink" font-size="12">Decision</text><text x="537" y="104" text-anchor="middle" class="svg-muted" font-size="12">ok, dekho, act karo</text>
<g stroke="#64748b" stroke-width="2"><line x1="130" y1="90" x2="160" y2="90"/><line x1="275" y1="90" x2="305" y2="90"/><line x1="420" y1="90" x2="450" y2="90"/></g>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">har stage mein galti ghus sakti hai: har ek check karo</text>
</svg><p class="cap">Har stage gumrah kar sakta hai; unhe order mein troubleshoot karo.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Four golden signals ke naam batao aur har ek ko console metric se map karo.</li>
<li>RED aur USE samjhao aur batao kaun service ke liye fit hai aur kaun resource ke liye.</li>
<li>Diye gaye need ke liye panel type chuno.</li>
<li>last, avg, max aur p95 compare karo aur latency aur capacity ke liye ek chuno.</li>
<li>Points mein window ko time mein badlo: 12 ek ghanta, 288 ek din, 2016 ek hafta.</li>
<li>Data se warn aur crit lines set karo aur samjhao ki woh kisi ko page nahi karti.</li>
<li>z-score calculate karo aur baseline card padho.</li>
<li>Fixed aur rolling baselines ko contrast karo aur drift define karo.</li>
<li>Samjhao ki daily seasonality false alarms kaise hatati hai.</li>
<li>Paanch-step dashboard troubleshooting workflow chalao.</li>
<li>Console mein labs obs-dash-1, obs-dash-2 aur obs-dash-3 poore karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Golden signals</dt><dd>Latency, traffic, errors, saturation.</dd>
<dt>RED</dt><dd>Rate, errors, duration: services ke liye.</dd>
<dt>USE</dt><dd>Utilisation, saturation, errors: resources ke liye.</dd>
<dt>Panel</dt><dd>Ek sawaal jo number aur trend ki tarah draw hota hai.</dd>
<dt>Aggregation</dt><dd>Kitne points ek value banate hain: last, avg, max, p95.</dd>
<dt>Threshold</dt><dd>Warn ya crit line jo panel ko colour karti hai. Alert nahi.</dd>
<dt>Baseline</dt><dd>Mean aur sd jo ek metric ka normal define karte hain.</dd>
<dt>z-score</dt><dd>(reading - mean) / sd.</dd>
<dt>Drift</dt><dd>Rolling baseline ka lambi problem ko normal seekh lena.</dd>
<dt>Seasonality</dt><dd>Repeat hone wala pattern, jaise daily peak.</dd>
<dt>nodata</dt><dd>Poller ko jawab nahi mila. Zero ke barabar nahi.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>Golden signals hain latency, traffic, errors aur saturation.</li>
<li>avg spikes chhupata hai, max ek glitch se dominate hota hai, p95 tail dikhata hai.</li>
<li>Panel ke thresholds colours hain; routes wale alert rules notify karte hain.</li>
<li>Fixed baseline kabhi nahi badalta; rolling re-learn karta hai aur drift kar sakta hai.</li>
<li>Drift pakadne ke liye healthy reference se compare karo.</li>
<li>Seasonality pichhle dinon ke usi time se compare karti hai.</li>
<li>nodata matlab polling fail; pehle credentials ya reachability fix karo.</li>
</ul>

<h3>Console cheat-sheet</h3>
<pre class="code"><span class="c">! Dashboards page: panel Edit karo</span>
Title    Kochi latency
Target   R-KCH     Metric   latency
Value    avg       Window   144
Warn     60        Crit     90
<span class="c">! Baselines page: baseline Edit karo</span>
Mode     fixed     Sigma (k)   3     Seasonality   daily
<span class="c">! phir CommitBar - Apply changes</span></pre>
<p><b>Wire/policy par kya badalta hai?</b> Inme se koi edit device ko packet nahi bhejta. Yeh badalte hain ki stored data kaise dikhaya aur judge kiya jaata hai. Jahan koi alert rule baseline use karta hai, wahan yeh badalte hain ki woh rule kab fire hoga.</p>

<div class="warn"><p><b>Exam ke din bachne wali galtiyan.</b> Laal panel ko page samajhna; outage detection ke liye rolling chunna; p95 ko top 5 percent ke average se mix karna; yeh bhoolna ki points mein window paanch-minute step par depend karti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Dashboard Lucknow router ke liye 0 percent loss dikhata hai." Maanne se pehle check karo ki yeh asli zero hai ya zero ki tarah dikhaya gaya nodata.</p></div>

<div class="scn"><h4>Ek screen, chaar signals, koi surprise nahi</h4><p>Ek quarter mein teen incidents ke baad Godavari Foods team ne apna health dashboard dobara banaya: har shehar ke liye four golden signals, latency ke liye fixed baselines, utilisation ke liye daily seasonal baseline, healthy hafte se liye thresholds, aur loud nodata state. Agle quarter mein on-call engineer ko har incident ka cause is ek screen se das minute mein mil gaya.</p><p><b>Seekh:</b> thake hue engineer ke liye design karo, sahi baseline se judge karo, aur missing data kabhi mat chhupao.</p></div>

<div class="iv"><p class="q">"Zero se health dashboard banane ka process batao."</p><p>Strong answer: sawaal se shuru karo, service ke liye four golden signals chuno, har panel ke liye target aur aggregation chuno, healthy hafte se warn aur crit set karo, ek hi time window rakho, nodata saaf dikhao, patterns ke liye seasonality ke saath baselines aur service levels ke liye fixed reference jodo, known fault ke against test karo, phir ek team ko ownership do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har service ke chaar signals ek screen par imaandaar thresholds ke saath dikhao.</li>
<li>Aggregation aur window decision se match karke chuno.</li>
<li>Baselines se judge karo, lekin rolling baseline ko akela guard mat banao.</li>
<li>nodata information hai; jab tak ulta saabit na ho use fault maano.</li>
<li>Aage: obs-alert in judgements ko duration, dedupe aur routing ke saath notifications mein badalta hai.</li>
</ul></div>
`}};export{e as default};