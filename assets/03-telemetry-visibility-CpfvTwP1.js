var e={id:`telemetry-visibility`,h:{en:`Telemetry and visibility design: Insights, streaming telemetry and flow analytics`,hi:`Telemetry aur visibility design: Insights, streaming telemetry aur flow analytics`},body:{en:`
<p><b>Analogy.</b> A city control room does not wait for citizens to phone in about a traffic jam. Sensors on every junction stream data continuously, and software spots the jam, shows where it started and suggests a diversion. Telemetry gives the data center the same sensors. The old method, asking each switch a question every five minutes (polling), is like sending a person to count cars by hand.</p>

<h3>The customer case: Tandoor Pay</h3>
<p>Tandoor Pay is a payments company in Mumbai with one primary data center and one disaster recovery site. Its card-authorisation service must answer within 150 ms. Twice a month, customers see random timeouts that last 2 to 3 minutes. The network team's tools poll switch counters every 5 minutes, so by the time they look, the evidence is gone. The VP of Engineering wants root cause in under 30 minutes, an alert before customers notice, and proof for the regulator that the network was healthy during an incident. Constraints: 12 leaf and 4 spine Nexus 9000 switches, an existing Nexus Dashboard cluster, a collector team of two people, and a rule that monitoring traffic must not use more than 1 percent of any link.</p>

<h3>Requirements</h3>
<ul>
<li>Second-level visibility of drops, latency and microbursts, not five-minute averages.</li>
<li>Flow-level evidence: which conversation between which two hosts was affected.</li>
<li>Correlation of network events with configuration changes and software or hardware issues.</li>
<li>Streaming to a collector over a secure management path.</li>
</ul>

<h3>The building blocks</h3>
<dl class="terms">
<dt>Streaming telemetry</dt><dd>The switch pushes structured data to a collector on a schedule or when something changes, instead of waiting to be polled. Model-driven telemetry uses data models and encodings such as GPB or JSON, often carried over gRPC.</dd>
<dt>Sensor group, destination group, subscription</dt><dd>The three parts of NX-OS telemetry configuration: what to collect (sensor path), where to send it, and how often.</dd>
<dt>Flow telemetry</dt><dd>Per-flow records captured in switch hardware (on supported Nexus 9000 models), with details such as drops and path, not only byte counts.</dd>
<dt>Nexus Dashboard Insights</dt><dd>A Nexus Dashboard service that collects software telemetry and flow telemetry from the fabric, finds anomalies, correlates them with changes and gives suggested remediation.</dd>
<dt>NetFlow and sFlow</dt><dd>Traditional flow export. Sampled and widely supported, but less detailed than hardware flow telemetry.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Telemetry data path">
<rect x="10" y="20" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="13">Leaf switches (12)</text>
<rect x="10" y="100" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="85" y="130" text-anchor="middle" class="svg-ink" font-size="13">Spine switches (4)</text>
<rect x="210" y="20" width="170" height="50" rx="8" fill="#bae6fd"/><text x="295" y="42" text-anchor="middle" class="svg-ink" font-size="13">Streaming telemetry</text><text x="295" y="60" text-anchor="middle" class="svg-muted" font-size="12">sensor paths, seconds</text>
<rect x="210" y="100" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="295" y="122" text-anchor="middle" class="svg-ink" font-size="13">Flow telemetry</text><text x="295" y="140" text-anchor="middle" class="svg-muted" font-size="12">per-flow, drops</text>
<rect x="430" y="50" width="200" height="70" rx="8" fill="#ddd6fe"/><text x="530" y="78" text-anchor="middle" class="svg-ink" font-size="14">Nexus Dashboard</text><text x="530" y="98" text-anchor="middle" class="svg-ink" font-size="14">Insights</text>
<rect x="430" y="170" width="200" height="50" rx="8" fill="#fde68a"/><text x="530" y="200" text-anchor="middle" class="svg-ink" font-size="13">Anomaly + advisory</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="160" y1="45" x2="210" y2="45"/><line x1="160" y1="125" x2="210" y2="125"/><line x1="380" y1="45" x2="430" y2="75"/><line x1="380" y1="125" x2="430" y2="100"/><line x1="530" y1="120" x2="530" y2="170"/></g>
<rect x="10" y="240" width="14" height="14" fill="#e2e8f0"/><text x="30" y="252" class="svg-muted" font-size="12">devices</text>
<rect x="110" y="240" width="14" height="14" fill="#bae6fd"/><text x="130" y="252" class="svg-muted" font-size="12">software data</text>
<rect x="240" y="240" width="14" height="14" fill="#bbf7d0"/><text x="260" y="252" class="svg-muted" font-size="12">hardware data</text>
<rect x="380" y="240" width="14" height="14" fill="#ddd6fe"/><text x="400" y="252" class="svg-muted" font-size="12">analytics</text>
</svg><p class="cap">Two data types feed one analytics service. Devices send; the platform correlates and advises.</p></div>

<h3>Options and trade-offs</h3>
<table class="cmp"><tr><th>Option</th><th>Detail level</th><th>Cost and load</th><th>Verdict</th></tr>
<tr><td>SNMP polling every 5 minutes</td><td>Low, averages</td><td>Low</td><td>Keep for basic reachability only</td></tr>
<tr><td>Streaming telemetry to own collector</td><td>High, device state</td><td>You build and run the collector</td><td>Useful for custom dashboards</td></tr>
<tr><td>NetFlow or sFlow sampling</td><td>Medium, sampled flows</td><td>Moderate</td><td>Fine for capacity trends</td></tr>
<tr><td>Nexus Dashboard Insights with flow telemetry</td><td>High, per-flow with drops and anomalies</td><td>Licence and cluster sizing</td><td>Chosen for the payment path</td></tr>
</table>

<h3>Chosen design and justification</h3>
<p>Tandoor Pay enables Insights on both sites, with flow telemetry for the authorisation VRF and software telemetry for the whole fabric. Telemetry travels on the out-of-band management VRF, so it never competes with payment traffic and respects the 1 percent link rule. Alert thresholds are set on drops and on latency for the card-authorisation flows. Insights anomalies are linked to change events, so the team can see that a QoS change at 14:02 preceded the first drops. Sizing matters: the design records the number of switches and the flow count against the supported scale of the cluster before ordering.</p>

<div class="eg"><p><b>Worked example.</b> A flow from 10.40.1.15 to 10.40.2.20 on port 8443 shows drops on leaf-07 every 2 hours for 90 seconds. Polling saw nothing because average utilisation was 18 percent. Flow telemetry shows a microburst from a nightly batch job, and the anomaly timeline shows the congestion starting at the same minute. Root cause found in 12 minutes.</p></div>

<pre class="code"><span class="c">! NX-OS model-driven telemetry: what, where, how often</span>
feature telemetry
telemetry
  destination-group 100
    ip address 192.0.2.50 port 50001 protocol gRPC encoding GPB
  sensor-group 100
    data-source DME
    path sys/intf depth unbounded
  subscription 100
    dst-grp 100
    snsr-grp 100 sample-interval 30000
</pre>

<h3>What went wrong at a similar site</h3>
<div class="scn"><h4>Alerts nobody could use</h4><p>A bank switched on every telemetry sensor path at a 5-second interval on 80 switches. The collector ran out of disk in 9 days, 2,000 alerts a day trained the team to ignore the dashboard, and a real drop event was missed. The redesign selected sensors from the questions the team needed answered, used longer intervals for slow-changing data, and defined three alert levels with an owner for each.</p><p><b>Lesson:</b> design telemetry from the questions you must answer, then size the collector and the alert process to match.</p></div>

<div class="exam"><p><b>Exam trap.</b> Insights gives anomaly detection and correlation, not just graphs. If the question asks for correlation with configuration change or for proactive advisories, Insights is the answer; if it asks for custom raw streams, streaming telemetry to a collector.</p></div>

<div class="warn"><p><b>Common mistake.</b> Sending telemetry over the production data path or forgetting the collector's capacity. Use the management VRF and size storage.</p></div>

<div class="iv"><p class="q">"Why use streaming telemetry instead of SNMP polling?"</p><p>Strong answer: push gives finer time resolution, lower load on the device CPU, and structured data models; polling misses short events and uses request/response overhead. Add that you still need design choices: sensor paths, intervals, secure transport, a collector sized for volume, and alerts with owners.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Telemetry is pushed by the device; polling is pulled by the tool.</li>
<li>NX-OS telemetry uses sensor groups, destination groups and subscriptions.</li>
<li>Flow telemetry shows per-flow behaviour, including drops, in hardware.</li>
<li>Nexus Dashboard Insights adds anomaly detection, correlation and advisories.</li>
<li>Design for questions, scale and alert ownership, not for maximum data.</li>
</ul></div>
`,hi:`
<p><b>Analogy.</b> City control room citizens ke phone ka wait nahi karta ki traffic jam hai. Har junction par sensors lagatar data stream karte hain, aur software jam pakadta hai, dikhata hai kahan se shuru hua aur diversion suggest karta hai. Telemetry data center ko wahi sensors deti hai. Purana tareeka, har paanch minute mein har switch se sawal poochna (polling), aisa hai jaise ek aadmi ko haath se gaadiyan ginne bhejna.</p>

<h3>Customer case: Tandoor Pay</h3>
<p>Tandoor Pay Mumbai ki ek payments company hai jiske paas ek primary data center aur ek disaster recovery site hai. Uski card-authorisation service ko 150 ms mein jawab dena hota hai. Mahine mein do baar customers ko random timeouts dikhte hain jo 2 se 3 minute chalte hain. Network team ke tools har 5 minute mein switch counters poll karte hain, isliye jab tak wo dekhte hain, evidence ja chuka hota hai. VP of Engineering ko 30 minute ke andar root cause, customers ko pata chalne se pehle alert, aur regulator ke liye proof chahiye ki incident ke dauraan network healthy tha. Constraints: 12 leaf aur 4 spine Nexus 9000 switches, ek existing Nexus Dashboard cluster, do logon ki collector team, aur rule ki monitoring traffic kisi bhi link ka 1 percent se zyada use na kare.</p>

<h3>Requirements</h3>
<ul>
<li>Drops, latency aur microbursts ki second-level visibility, paanch minute ke averages nahi.</li>
<li>Flow-level evidence: kaun si conversation kin do hosts ke beech affect hui.</li>
<li>Network events ko configuration change aur software ya hardware issues se correlate karna.</li>
<li>Secure management path par collector tak streaming.</li>
</ul>

<h3>Building blocks</h3>
<dl class="terms">
<dt>Streaming telemetry</dt><dd>Switch structured data collector ko schedule par ya change hone par push karta hai, poll hone ka wait nahi karta. Model-driven telemetry data models aur GPB ya JSON jaise encodings use karti hai, aksar gRPC par.</dd>
<dt>Sensor group, destination group, subscription</dt><dd>NX-OS telemetry configuration ke teen hisse: kya collect karna hai (sensor path), kahan bhejna hai, aur kitni baar.</dd>
<dt>Flow telemetry</dt><dd>Switch hardware mein (supported Nexus 9000 models par) capture hone wale per-flow records, drops aur path jaisi details ke saath, sirf byte counts nahi.</dd>
<dt>Nexus Dashboard Insights</dt><dd>Nexus Dashboard service jo fabric se software telemetry aur flow telemetry collect karti hai, anomalies dhundhti hai, changes se correlate karti hai aur suggested remediation deti hai.</dd>
<dt>NetFlow aur sFlow</dt><dd>Traditional flow export. Sampled aur widely supported, lekin hardware flow telemetry se kam detailed.</dd>
</dl>

<svg viewBox="0 0 640 280" role="img" aria-label="Telemetry data path">
<rect x="10" y="20" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="13">Leaf switches (12)</text>
<rect x="10" y="100" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="85" y="130" text-anchor="middle" class="svg-ink" font-size="13">Spine switches (4)</text>
<rect x="210" y="20" width="170" height="50" rx="8" fill="#bae6fd"/><text x="295" y="42" text-anchor="middle" class="svg-ink" font-size="13">Streaming telemetry</text><text x="295" y="60" text-anchor="middle" class="svg-muted" font-size="12">sensor paths, seconds</text>
<rect x="210" y="100" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="295" y="122" text-anchor="middle" class="svg-ink" font-size="13">Flow telemetry</text><text x="295" y="140" text-anchor="middle" class="svg-muted" font-size="12">per-flow, drops</text>
<rect x="430" y="50" width="200" height="70" rx="8" fill="#ddd6fe"/><text x="530" y="78" text-anchor="middle" class="svg-ink" font-size="14">Nexus Dashboard</text><text x="530" y="98" text-anchor="middle" class="svg-ink" font-size="14">Insights</text>
<rect x="430" y="170" width="200" height="50" rx="8" fill="#fde68a"/><text x="530" y="200" text-anchor="middle" class="svg-ink" font-size="13">Anomaly + advisory</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="160" y1="45" x2="210" y2="45"/><line x1="160" y1="125" x2="210" y2="125"/><line x1="380" y1="45" x2="430" y2="75"/><line x1="380" y1="125" x2="430" y2="100"/><line x1="530" y1="120" x2="530" y2="170"/></g>
<rect x="10" y="240" width="14" height="14" fill="#e2e8f0"/><text x="30" y="252" class="svg-muted" font-size="12">devices</text>
<rect x="110" y="240" width="14" height="14" fill="#bae6fd"/><text x="130" y="252" class="svg-muted" font-size="12">software data</text>
<rect x="240" y="240" width="14" height="14" fill="#bbf7d0"/><text x="260" y="252" class="svg-muted" font-size="12">hardware data</text>
<rect x="380" y="240" width="14" height="14" fill="#ddd6fe"/><text x="400" y="252" class="svg-muted" font-size="12">analytics</text>
</svg>

<h3>Options aur trade-offs</h3>
<table class="cmp"><tr><th>Option</th><th>Detail level</th><th>Cost aur load</th><th>Verdict</th></tr>
<tr><td>Har 5 minute SNMP polling</td><td>Low, averages</td><td>Low</td><td>Sirf basic reachability ke liye rakho</td></tr>
<tr><td>Apne collector par streaming telemetry</td><td>High, device state</td><td>Collector aap banate aur chalate ho</td><td>Custom dashboards ke liye useful</td></tr>
<tr><td>NetFlow ya sFlow sampling</td><td>Medium, sampled flows</td><td>Moderate</td><td>Capacity trends ke liye theek</td></tr>
<tr><td>Flow telemetry ke saath Nexus Dashboard Insights</td><td>High, drops aur anomalies ke saath per-flow</td><td>Licence aur cluster sizing</td><td>Payment path ke liye chosen</td></tr>
</table>

<h3>Chosen design aur justification</h3>
<p>Tandoor Pay dono sites par Insights enable karta hai, authorisation VRF ke liye flow telemetry aur poore fabric ke liye software telemetry ke saath. Telemetry out-of-band management VRF par chalti hai, isliye payment traffic se compete nahi karti aur 1 percent link rule maanti hai. Alert thresholds drops aur card-authorisation flows ki latency par set hain. Insights anomalies change events se linked hain, isliye team dekh sakti hai ki 14:02 par QoS change pehle drops se pehle hua tha. Sizing zaroori hai: design order karne se pehle switches ki sankhya aur flow count ko cluster ke supported scale se match karta hai.</p>

<div class="eg"><p><b>Worked example.</b> 10.40.1.15 se 10.40.2.20 port 8443 ke flow mein leaf-07 par har 2 ghante mein 90 second ke drops dikhte hain. Polling ne kuch nahi dekha kyunki average utilisation 18 percent tha. Flow telemetry nightly batch job ka microburst dikhati hai, aur anomaly timeline congestion usi minute se shuru dikhati hai. Root cause 12 minute mein mila.</p></div>

<pre class="code"><span class="c">! NX-OS model-driven telemetry: kya, kahan, kitni baar</span>
feature telemetry
telemetry
  destination-group 100
    ip address 192.0.2.50 port 50001 protocol gRPC encoding GPB
  sensor-group 100
    data-source DME
    path sys/intf depth unbounded
  subscription 100
    dst-grp 100
    snsr-grp 100 sample-interval 30000
</pre>

<h3>Similar site par kya galat hua</h3>
<div class="scn"><h4>Alerts jo kaam ke nahi the</h4><p>Ek bank ne 80 switches par har telemetry sensor path 5 second interval par on kar diya. Collector ka disk 9 din mein bhar gaya, roz ke 2,000 alerts ne team ko dashboard ignore karna sikha diya, aur ek real drop event miss ho gaya. Redesign mein sensors us sawal se chune gaye jiska jawab chahiye tha, slow-changing data ke liye lambe intervals rakhe, aur teen alert levels banaye jinka har ek ka owner tha.</p><p><b>Lesson:</b> telemetry ko un sawalon se design karo jinke jawab chahiye, phir collector aur alert process ko usi hisaab se size karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Insights anomaly detection aur correlation deta hai, sirf graphs nahi. Agar question configuration change se correlation ya proactive advisories maange, to answer Insights; agar custom raw streams maange, to collector par streaming telemetry.</p></div>

<div class="warn"><p><b>Common mistake.</b> Telemetry production data path par bhejna ya collector ki capacity bhool jana. Management VRF use karo aur storage size karo.</p></div>

<div class="iv"><p class="q">"SNMP polling ki jagah streaming telemetry kyun?"</p><p>Strong answer: push se finer time resolution, device CPU par kam load aur structured data models milte hain; polling short events miss karti hai aur request/response overhead rakhti hai. Yeh bhi jodo ki design choices phir bhi chahiye: sensor paths, intervals, secure transport, volume ke liye sized collector, aur owners ke saath alerts.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Telemetry device push karta hai; polling tool pull karta hai.</li>
<li>NX-OS telemetry sensor groups, destination groups aur subscriptions use karti hai.</li>
<li>Flow telemetry hardware mein per-flow behaviour, drops samet, dikhati hai.</li>
<li>Nexus Dashboard Insights anomaly detection, correlation aur advisories jodta hai.</li>
<li>Maximum data ke liye nahi, sawalon, scale aur alert ownership ke liye design karo.</li>
</ul></div>
`}};export{e as default};