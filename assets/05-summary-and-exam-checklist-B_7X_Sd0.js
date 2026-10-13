var e={id:`summary-and-exam-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The whole module in one minute</h3>
<p>Monitoring exists so that you see problems before users call. A network gives you four kinds of evidence, called signals: <b>metrics</b> (how much), <b>logs</b> (what and when), <b>flows</b> (who with whom) and <b>traces</b> (where the time went). They arrive at the NMS by <b>polling</b> (the NMS asks), <b>pushing</b> (traps, informs, syslog) or <b>streaming</b> (the device sends on a subscription). A number means nothing without a <b>baseline</b> of what is normal, and an alert needs a threshold and a duration. When something is wrong you follow one method: symptom, evidence, root cause, fix, verify. The console GUI is the same data in a friendlier form, and its rule is <b>"Click-ops, but you understand what each click does."</b></p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="The monitoring loop">
<rect x="15" y="50" width="100" height="44" rx="8" fill="#bae6fd"/><text x="65" y="77" text-anchor="middle" class="svg-ink" font-size="13">Device</text>
<rect x="150" y="50" width="100" height="44" rx="8" fill="#bbf7d0"/><text x="200" y="77" text-anchor="middle" class="svg-ink" font-size="13">Collect</text>
<rect x="285" y="50" width="100" height="44" rx="8" fill="#ddd6fe"/><text x="335" y="77" text-anchor="middle" class="svg-ink" font-size="13">Compare</text>
<rect x="420" y="50" width="100" height="44" rx="8" fill="#fde68a"/><text x="470" y="77" text-anchor="middle" class="svg-ink" font-size="13">Alert</text>
<rect x="555" y="50" width="75" height="44" rx="8" fill="#fed7aa"/><text x="592" y="77" text-anchor="middle" class="svg-ink" font-size="13">Fix</text>
<line x1="115" y1="72" x2="150" y2="72" stroke="#64748b" stroke-width="2"/><line x1="250" y1="72" x2="285" y2="72" stroke="#64748b" stroke-width="2"/><line x1="385" y1="72" x2="420" y2="72" stroke="#64748b" stroke-width="2"/><line x1="520" y1="72" x2="555" y2="72" stroke="#64748b" stroke-width="2"/>
<path d="M592 94 L592 125 L65 125 L65 94" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="330" y="118" text-anchor="middle" class="svg-muted" font-size="12">verify the same evidence, then repeat</text>
</svg><p class="cap">The monitoring loop: data from the device, collected, compared with normal, alerted, fixed and verified.</p></div>

<h3>Can-do checklist</h3>
<p>Tick each line honestly. If you cannot do it without looking, re-read the chapter named in brackets.</p>
<ul>
<li>I can explain why monitoring matters in two sentences (chapter 1).</li>
<li>I can define NMS, agent, target, monitoring and observability (chapter 1).</li>
<li>I can name the four signals, what each answers and the protocol that usually carries it (chapter 2).</li>
<li>I can configure a router to send logs to 10.1.50.100 and to answer one read-only SNMP community restricted by ACL 20 (chapter 2).</li>
<li>I can run snmpget from the NMS and show syslog, and read both outputs (chapter 2).</li>
<li>I can compare polling, traps, informs, syslog and streaming (chapter 3).</li>
<li>I can compute a rate from two counter values (chapter 3).</li>
<li>I can explain fixed baseline, rolling baseline, seasonality and drift (chapter 3).</li>
<li>I can read the console Overview and tell critical from no data (chapter 4).</li>
<li>I can apply the five-step method and say what a click changes (chapter 4).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Agent</dt><dd>Software on a device that answers SNMP and sends logs and traps.</dd>
<dt>Alert</dt><dd>A notification after a threshold is crossed for long enough.</dd>
<dt>Baseline</dt><dd>The recorded picture of normal for a metric.</dd>
<dt>Counter</dt><dd>A value that only increases, such as bytes received; a rate needs two readings.</dd>
<dt>Drift</dt><dd>A rolling baseline slowly accepting a bad state as normal.</dd>
<dt>Flow</dt><dd>A summary of one conversation: addresses, protocol, ports, bytes.</dd>
<dt>Inform</dt><dd>An acknowledged trap, retransmitted until confirmed.</dd>
<dt>Metric</dt><dd>A number sampled over time.</dd>
<dt>NMS</dt><dd>Network management system: collects, stores and shows monitoring data.</dd>
<dt>Polling</dt><dd>The NMS asking a device for values on a schedule.</dd>
<dt>Seasonality</dt><dd>A repeating pattern, such as a lunchtime peak.</dd>
<dt>Telemetry</dt><dd>Data sent by a device on a subscription, every few seconds or on change.</dd>
<dt>Trap</dt><dd>An unacknowledged SNMP event message sent by the device.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>SNMP polling port</td><td>UDP 161 on the device</td></tr>
<tr><td>Trap receiver port</td><td>UDP 162 on the manager</td></tr>
<tr><td>Syslog port</td><td>UDP 514 on the collector</td></tr>
<tr><td>Flow export (this track)</td><td>UDP 9995 to the collector</td></tr>
<tr><td>Console history</td><td>2016 points, 1 point = 5 minutes, 288 per day</td></tr>
<tr><td>Godavari targets</td><td>7: three routers, one switch, three servers</td></tr>
<tr><td>NMS address</td><td>10.1.50.100</td></tr>
<tr><td>Router loopbacks</td><td>10.255.0.1, 10.255.0.2, 10.255.0.3</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">service timestamps log datetime msec
logging host 10.1.50.100
logging trap informational
access-list 20 permit host 10.1.50.100
snmp-server community GF-RO RO 20
snmp-server location Hyderabad-Rack-A1
<span class="c">! on the NMS</span>
snmpget -c GF-RO 10.255.0.1 sysName.0
show syslog
show traps</pre>

<h3>Scope boundary, restated</h3>
<p>This track simulates SNMP v2c and v3 polling and traps, syslog, NetFlow and IPFIX, SPAN, IP SLA, and in the console: targets, dashboards, baselines, alert rules and routing, SLA probes, streaming-telemetry subscriptions, top talkers, a capture tool and an audit log. It does not simulate real MIB trees beyond the objects used, real encryption, real throughput, a real time-series database or any vendor product screens. When a real product differs, the vendor documentation wins.</p>

<div class="warn"><p><b>Last common mistakes.</b> Believing no news is good news; treating a timeout as proof of a dead device; leaving a read-only community open to every address; skipping the verify step.</p></div>
<div class="exam"><p><b>Exam traps to remember.</b> Polling is the only method that detects total silence. Traps are not acknowledged; informs are. Critical and no data are different states with different causes. A rolling baseline can hide a slow outage; a fixed baseline cannot.</p></div>

<div class="scn"><h4>The new engineer's first week</h4><p>Kabir Shah joined the Godavari NOC. On day one he configured logging and a read-only community on a lab router, then proved both with snmpget and show syslog. On day two he opened the console, found the one target with no data, read the reason, and traced it to a wrong credential. On day three he wrote the five-step note for the ticket. By Friday he was on the secondary on-call rota.</p><p><b>Lesson:</b> the basics, done in order with evidence, are what the job is made of.</p></div>

<div class="iv"><p class="q">"Describe a complete monitoring setup for a three-site company."</p><p>Strong answer: a central NMS; SNMP polling every 5 minutes with restricted, non-default credentials (v3 preferred); syslog to the NMS with timestamps and NTP; flow export for traffic questions; traps for instant events; dashboards and baselines for context; alerts with duration and routing; and a written troubleshooting method with an audit trail. Mention that you alert on missing data too.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four signals, four questions: how much, what happened, who with whom, where did time go.</li>
<li>Polling detects silence; push gives instant events; streaming gives fine data.</li>
<li>Baselines give meaning; thresholds with duration give good alerts.</li>
<li>Method: symptom, evidence, root cause, fix, verify.</li>
<li>Know the ports: 161, 162, 514, 9995, and the Godavari addressing.</li>
</ul></div>
`,hi:`
<h3>Poora module ek minute mein</h3>
<p>Monitoring isliye hai ki aap users ke call karne se pehle problems dekho. Network aapko chaar tarah ka evidence deta hai, jinhe signals kehte hain: <b>metrics</b> (kitna), <b>logs</b> (kya aur kab), <b>flows</b> (kaun kisse) aur <b>traces</b> (time kahan gaya). Yeh NMS tak <b>polling</b> (NMS poochta hai), <b>pushing</b> (traps, informs, syslog) ya <b>streaming</b> (device subscription par bhejta hai) se aate hain. Normal ke <b>baseline</b> ke bina number ka koi matlab nahi, aur alert ko threshold aur duration chahiye. Kuch galat ho to ek hi method follow karte hain: symptom, evidence, root cause, fix, verify. Console GUI wahi data friendlier form mein hai, aur uska rule hai <b>"Click-ops, but you understand what each click does."</b></p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="The monitoring loop">
<rect x="15" y="50" width="100" height="44" rx="8" fill="#bae6fd"/><text x="65" y="77" text-anchor="middle" class="svg-ink" font-size="13">Device</text>
<rect x="150" y="50" width="100" height="44" rx="8" fill="#bbf7d0"/><text x="200" y="77" text-anchor="middle" class="svg-ink" font-size="13">Collect</text>
<rect x="285" y="50" width="100" height="44" rx="8" fill="#ddd6fe"/><text x="335" y="77" text-anchor="middle" class="svg-ink" font-size="13">Compare</text>
<rect x="420" y="50" width="100" height="44" rx="8" fill="#fde68a"/><text x="470" y="77" text-anchor="middle" class="svg-ink" font-size="13">Alert</text>
<rect x="555" y="50" width="75" height="44" rx="8" fill="#fed7aa"/><text x="592" y="77" text-anchor="middle" class="svg-ink" font-size="13">Fix</text>
<line x1="115" y1="72" x2="150" y2="72" stroke="#64748b" stroke-width="2"/><line x1="250" y1="72" x2="285" y2="72" stroke="#64748b" stroke-width="2"/><line x1="385" y1="72" x2="420" y2="72" stroke="#64748b" stroke-width="2"/><line x1="520" y1="72" x2="555" y2="72" stroke="#64748b" stroke-width="2"/>
<path d="M592 94 L592 125 L65 125 L65 94" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="330" y="118" text-anchor="middle" class="svg-muted" font-size="12">wahi evidence se verify karo, phir repeat</text>
</svg><p class="cap">Monitoring loop: device se data, collect, normal se compare, alert, fix aur verify.</p></div>

<h3>Can-do checklist</h3>
<p>Har line imaandari se tick karo. Agar bina dekhe nahi kar sakte, to bracket mein likha chapter dobara padho.</p>
<ul>
<li>Main do vakyon mein explain kar sakta hoon ki monitoring kyun matter karti hai (chapter 1).</li>
<li>Main NMS, agent, target, monitoring aur observability define kar sakta hoon (chapter 1).</li>
<li>Main chaar signals ke naam, har ek kya jawab deta hai aur aam taur par kaunsa protocol le jaata hai bata sakta hoon (chapter 2).</li>
<li>Main router ko configure kar sakta hoon ki logs 10.1.50.100 ko bheje aur ACL 20 se restricted ek read-only SNMP community ka jawab de (chapter 2).</li>
<li>Main NMS se snmpget aur show syslog chala kar dono outputs padh sakta hoon (chapter 2).</li>
<li>Main polling, traps, informs, syslog aur streaming compare kar sakta hoon (chapter 3).</li>
<li>Main do counter values se rate nikal sakta hoon (chapter 3).</li>
<li>Main fixed baseline, rolling baseline, seasonality aur drift explain kar sakta hoon (chapter 3).</li>
<li>Main console Overview padh kar critical aur no data mein fark bata sakta hoon (chapter 4).</li>
<li>Main paanch-step method lagakar bata sakta hoon ki click kya badalta hai (chapter 4).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Agent</dt><dd>Device par software jo SNMP ka jawab deta hai aur logs aur traps bhejta hai.</dd>
<dt>Alert</dt><dd>Threshold kaafi der cross hone ke baad notification.</dd>
<dt>Baseline</dt><dd>Kisi metric ke normal ki recorded tasveer.</dd>
<dt>Counter</dt><dd>Aisi value jo sirf badhti hai, jaise received bytes; rate ke liye do readings chahiye.</dd>
<dt>Drift</dt><dd>Rolling baseline ka dheere dheere kharab state ko normal maan lena.</dd>
<dt>Flow</dt><dd>Ek conversation ka summary: addresses, protocol, ports, bytes.</dd>
<dt>Inform</dt><dd>Acknowledged trap, confirm hone tak retransmit hota hai.</dd>
<dt>Metric</dt><dd>Time ke saath sample kiya gaya number.</dd>
<dt>NMS</dt><dd>Network management system: monitoring data collect, store aur show karta hai.</dd>
<dt>Polling</dt><dd>NMS ka schedule par device se values maangna.</dd>
<dt>Seasonality</dt><dd>Repeat hone wala pattern, jaise lunchtime peak.</dd>
<dt>Telemetry</dt><dd>Subscription par device ka bheja data, har kuch second ya change par.</dd>
<dt>Trap</dt><dd>Device ka bheja unacknowledged SNMP event message.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>SNMP polling port</td><td>device par UDP 161</td></tr>
<tr><td>Trap receiver port</td><td>manager par UDP 162</td></tr>
<tr><td>Syslog port</td><td>collector par UDP 514</td></tr>
<tr><td>Flow export (is track mein)</td><td>collector ko UDP 9995</td></tr>
<tr><td>Console history</td><td>2016 points, 1 point = 5 minute, din mein 288</td></tr>
<tr><td>Godavari targets</td><td>7: teen routers, ek switch, teen servers</td></tr>
<tr><td>NMS address</td><td>10.1.50.100</td></tr>
<tr><td>Router loopbacks</td><td>10.255.0.1, 10.255.0.2, 10.255.0.3</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">service timestamps log datetime msec
logging host 10.1.50.100
logging trap informational
access-list 20 permit host 10.1.50.100
snmp-server community GF-RO RO 20
snmp-server location Hyderabad-Rack-A1
<span class="c">! on the NMS</span>
snmpget -c GF-RO 10.255.0.1 sysName.0
show syslog
show traps</pre>

<h3>Scope boundary, dobara</h3>
<p>Yeh track SNMP v2c aur v3 polling aur traps, syslog, NetFlow aur IPFIX, SPAN, IP SLA, aur console mein: targets, dashboards, baselines, alert rules aur routing, SLA probes, streaming-telemetry subscriptions, top talkers, ek capture tool aur audit log simulate karta hai. Yeh use kiye gaye objects ke aage real MIB trees, real encryption, real throughput, real time-series database ya koi vendor product screens simulate nahi karta. Jahan real product alag ho, wahan vendor documentation final hai.</p>

<div class="warn"><p><b>Aakhri common galtiyan.</b> Yeh maanna ki no news is good news; timeout ko dead device ka proof samajhna; read-only community ko har address ke liye khula chhodna; verify step skip karna.</p></div>
<div class="exam"><p><b>Yaad rakhne wale exam traps.</b> Polling hi poori khamoshi pakadti hai. Traps acknowledged nahi hote; informs hote hain. Critical aur no data alag states hain jinke alag causes hain. Rolling baseline slow outage chhupa sakta hai; fixed baseline nahi chhupata.</p></div>

<div class="scn"><h4>Naye engineer ka pehla hafta</h4><p>Kabir Shah ne Godavari NOC join kiya. Pehle din usne lab router par logging aur read-only community configure ki, aur dono ko snmpget aur show syslog se prove kiya. Doosre din usne console kholi, no data wala ek target dhoondha, reason padha aur galat credential tak trace kiya. Teesre din usne ticket ke liye paanch-step note likha. Friday tak woh secondary on-call rota mein tha.</p><p><b>Seekh:</b> basics, sahi order mein aur evidence ke saath, hi is job ki buniyaad hain.</p></div>

<div class="iv"><p class="q">"Teen sites wali company ka complete monitoring setup describe karo."</p><p>Strong answer: ek central NMS; har 5 minute SNMP polling restricted, non-default credentials ke saath (v3 preferred); timestamps aur NTP ke saath NMS ko syslog; traffic ke sawaalon ke liye flow export; instant events ke liye traps; context ke liye dashboards aur baselines; duration aur routing ke saath alerts; aur audit trail ke saath likha hua troubleshooting method. Jodo ki aap missing data par bhi alert lagate ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar signals, chaar sawaal: kitna, kya hua, kaun kisse, time kahan gaya.</li>
<li>Polling khamoshi pakadti hai; push instant events deta hai; streaming fine data deti hai.</li>
<li>Baselines meaning dete hain; duration ke saath thresholds achhe alerts dete hain.</li>
<li>Method: symptom, evidence, root cause, fix, verify.</li>
<li>Ports yaad rakho: 161, 162, 514, 9995, aur Godavari addressing.</li>
</ul></div>
`}};export{e as default};