var e={id:`analytics-dashboards`,h:{en:`Analytics dashboards and reports: how to read them`,hi:`Analytics dashboards aur reports: unhe kaise padhein`},body:{en:`
<p>Imagine the flight recorder of an aircraft. When something goes wrong, nobody asks the pilot to remember every minute; they replay the recording. <b>Versa Analytics</b> is the flight recorder of your SD-WAN. Every branch exports <b>logs</b> (records of events and flows) to the Analytics node, which stores, indexes and turns them into dashboards and reports. In the course the Analytics node is <code>ANA</code> at 198.51.100.30 in the Mumbai DC. This chapter is conceptual: the course CLI cannot draw charts, but you must still know what the real dashboards show and how to read them like an engineer.</p>

<h3>The log pipeline in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Log pipeline">
<rect x="20" y="30" width="130" height="60" rx="8" fill="#bae6fd"/><text x="85" y="56" text-anchor="middle" class="svg-ink" font-size="13">Branch1 VOS</text><text x="85" y="74" text-anchor="middle" class="svg-muted" font-size="12">log exporter</text>
<rect x="20" y="110" width="130" height="60" rx="8" fill="#bae6fd"/><text x="85" y="136" text-anchor="middle" class="svg-ink" font-size="13">Branch2 VOS</text><text x="85" y="154" text-anchor="middle" class="svg-muted" font-size="12">log exporter</text>
<rect x="250" y="60" width="140" height="80" rx="8" fill="#ddd6fe"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">Analytics ANA</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.30</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">collector port 1234</text>
<rect x="480" y="30" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="550" y="60" text-anchor="middle" class="svg-ink" font-size="13">Dashboards</text>
<rect x="480" y="120" width="140" height="50" rx="8" fill="#fde68a"/><text x="550" y="150" text-anchor="middle" class="svg-ink" font-size="13">Reports, log search</text>
<line x1="150" y1="60" x2="250" y2="90" stroke="#64748b" stroke-width="2"/><line x1="150" y1="140" x2="250" y2="112" stroke="#64748b" stroke-width="2"/><line x1="390" y1="85" x2="480" y2="55" stroke="#64748b" stroke-width="2"/><line x1="390" y1="115" x2="480" y2="145" stroke="#64748b" stroke-width="2"/>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">If the first arrow breaks, every chart to the right goes quiet</text>
</svg><p class="cap">Exporter on the branch, collector on Analytics, dashboards and reports on top. Chapter 7 troubleshoots a break in the first arrow.</p></div>

<h3>What the main dashboards show</h3>
<p>Names and layouts differ by software release, so learn the <b>questions</b> each view answers rather than memorising menus.</p>
<dl class="terms">
<dt>Site and appliance overview</dt><dd>Map or list of all sites with status (up, degraded, down), tunnel counts and alarms. Answers: "which sites are unhealthy right now?".</dd>
<dt>Path and SLA metrics</dt><dd>Time-series of latency, jitter and loss per access circuit and per site pair, with SLA violations marked. Answers: "since when is the Internet circuit bad, and is it one direction?".</dd>
<dt>Bandwidth and utilisation</dt><dd>Throughput per access circuit, per application, per user. Answers: "is a backup job saturating the circuit?" and "do we need a bigger circuit?".</dd>
<dt>Application visibility</dt><dd>Which applications use which transport, top talkers, application risk. Answers: "is voice really going over MPLS?".</dd>
<dt>Security and firewall logs</dt><dd>Allowed and denied flows, URL categories, threats. Answers: "was this guest traffic blocked?". This is the view that goes blind when log flow is silent.</dd>
<dt>Reports</dt><dd>Scheduled summaries (daily, weekly, monthly) sent to managers: availability, SLA compliance, top applications. They turn raw logs into decisions such as capacity planning or carrier performance reviews.</dd>
</dl>

<h3>Rules for reading a chart correctly</h3>
<ol>
<li><b>Fix the scope first.</b> Tenant, appliance, metric, direction, time range and <b>time zone</b>. A chart without these is not evidence; it is a picture. Always add them to a screenshot or a ticket.</li>
<li><b>Check freshness.</b> The last data point must be recent. A flat line can mean "no problem" or "no data". Compare the newest timestamp with the clock.</li>
<li><b>Look at the baseline.</b> Compare with the same hour yesterday or last week. A Monday 9 am peak is normal; the same peak at 3 am is not.</li>
<li><b>Mind the aggregation.</b> A five-minute average hides a ten-second burst of loss that already ruined a call. Zoom in to the shortest interval.</li>
<li><b>Correlate with events.</b> Put the change calendar and carrier notices next to the chart. A step in the line at 10:40 and a template push at 10:39 is a lead.</li>
<li><b>Confirm with current state.</b> History says what happened; a CLI test says what is true now.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Delhi voice complaints. The SLA chart for Delhi shows Internet loss rising from 0.3 percent to 2.5 percent at 14:05 while MPLS stays at 0.05 percent. The VOICE profile allows 1 percent. The application chart shows voice moving to MPLS at 14:06, so users were affected for about a minute. Conclusion: the policy worked as designed; the Internet circuit needs a carrier ticket, with the chart (tenant Acme, appliance Branch1, loss, 14:00 to 15:00 IST) attached.</p></div>

<h3>Absence is also data</h3>
<p>A log source that stops sending produces no chart, no error, and no red light. The Analytics source list is the control: onboarded branches on one side, active sources on the other. In the course CLI, <code>show analytics sources</code> lists every branch whose exporter points at this node and its status. A branch missing from that list is exactly the situation in lab <b>vs-log-silence</b>.</p>
<pre class="out">admin@Analytics-cli&gt; show analytics sources
Branch        Status
Branch2       Exporting to ANA</pre>
<p>Here Delhi (Branch1) is not listed. Chapter 7 shows how to find out why.</p>

<div class="note"><p><b>Real product note.</b> In real Versa, Analytics is a clustered, scalable log platform that normally gets its logs from branches over their transport networks, can be sized for retention, and integrates with the Director GUI for monitoring. Logs can also be forwarded to external SIEM tools. Exact dashboards, retention and cluster layout depend on release and sizing, which is outside this course's simplified model.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Screenshots without scope; trusting a flat line; ignoring the time zone (a 10 am IST event is 04:30 UTC); using only averages; treating dashboards as the single source of truth instead of confirming with a live test.</p></div>
<div class="exam"><p><b>Exam trap.</b> Analytics is not in the data path. If Analytics is down, user traffic keeps flowing; you lose visibility, not connectivity. The reverse is also true: a perfect dashboard does not prove the application works.</p></div>

<div class="scn"><h4>The "problem" that was a time zone</h4><p>A carrier insisted there was no fault at 09:30 while the customer's chart showed a loss spike at 09:30. The chart was in IST and the carrier's log in UTC. Once the engineer restated the spike as 04:00 UTC, the carrier found a maintenance event at that exact time and issued a credit.</p><p><b>Lesson:</b> always state the time zone with a timestamp.</p></div>

<div class="iv"><p class="q">"How do you use Analytics during an incident?"</p><p>Scope the chart (tenant, site, metric, time, zone), check the data is fresh, compare with baseline, correlate with change and carrier events, then confirm with a live CLI test. Mention that missing data is itself a finding.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Analytics is the flight recorder: branches export logs, the collector stores them, dashboards and reports present them.</li>
<li>Every chart needs tenant, appliance, metric, time range and time zone.</li>
<li>Check freshness, baseline and aggregation before you trust a graph.</li>
<li>Confirm history with a current CLI test.</li>
<li>Analytics is not in the data path: down means blind, not broken.</li>
</ul></div>
`,hi:`
<p>Aircraft ka flight recorder socho. Kuch galat ho to koi pilot se har minute yaad karne ko nahi kehta; recording replay karte hain. <b>Versa Analytics</b> aapke SD-WAN ka flight recorder hai. Har branch <b>logs</b> (events aur flows ke records) Analytics node ko export karta hai, jo unhe store, index karke dashboards aur reports mein badalta hai. Course mein Analytics node <code>ANA</code> hai, Mumbai DC mein 198.51.100.30 par. Ye chapter conceptual hai: course CLI charts nahi bana sakta, lekin real dashboards kya dikhate hain aur unhe engineer ki tarah kaise padhna hai ye aapko aana chahiye.</p>

<h3>Log pipeline ek picture mein</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Log pipeline">
<rect x="20" y="30" width="130" height="60" rx="8" fill="#bae6fd"/><text x="85" y="56" text-anchor="middle" class="svg-ink" font-size="13">Branch1 VOS</text><text x="85" y="74" text-anchor="middle" class="svg-muted" font-size="12">log exporter</text>
<rect x="20" y="110" width="130" height="60" rx="8" fill="#bae6fd"/><text x="85" y="136" text-anchor="middle" class="svg-ink" font-size="13">Branch2 VOS</text><text x="85" y="154" text-anchor="middle" class="svg-muted" font-size="12">log exporter</text>
<rect x="250" y="60" width="140" height="80" rx="8" fill="#ddd6fe"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">Analytics ANA</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.30</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">collector port 1234</text>
<rect x="480" y="30" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="550" y="60" text-anchor="middle" class="svg-ink" font-size="13">Dashboards</text>
<rect x="480" y="120" width="140" height="50" rx="8" fill="#fde68a"/><text x="550" y="150" text-anchor="middle" class="svg-ink" font-size="13">Reports, log search</text>
<line x1="150" y1="60" x2="250" y2="90" stroke="#64748b" stroke-width="2"/><line x1="150" y1="140" x2="250" y2="112" stroke="#64748b" stroke-width="2"/><line x1="390" y1="85" x2="480" y2="55" stroke="#64748b" stroke-width="2"/><line x1="390" y1="115" x2="480" y2="145" stroke="#64748b" stroke-width="2"/>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">Pehla arrow toote to right ke saare charts chup ho jate hain</text>
</svg><p class="cap">Branch par exporter, Analytics par collector, upar dashboards aur reports. Chapter 7 pehle arrow ke break ko troubleshoot karta hai.</p></div>

<h3>Main dashboards kya dikhate hain</h3>
<p>Software release ke hisaab se naam aur layout badalte hain, isliye menus yaad karne ke bajay ye seekho ki har view kaunsa <b>sawal</b> answer karta hai.</p>
<dl class="terms">
<dt>Site aur appliance overview</dt><dd>Saari sites ka map ya list status ke saath (up, degraded, down), tunnel counts aur alarms. Jawab deta hai: "abhi kaunsi sites unhealthy hain?".</dd>
<dt>Path aur SLA metrics</dt><dd>Har access circuit aur site pair ke latency, jitter, loss ki time-series, SLA violations marked. Jawab: "Internet circuit kab se kharab hai, aur ek direction mein ya dono?".</dd>
<dt>Bandwidth aur utilisation</dt><dd>Har access circuit, application, user ka throughput. Jawab: "kya backup job circuit saturate kar raha hai?" aur "kya bada circuit chahiye?".</dd>
<dt>Application visibility</dt><dd>Kaunsi application kaunse transport par, top talkers, application risk. Jawab: "kya voice sach mein MPLS se ja rahi hai?".</dd>
<dt>Security aur firewall logs</dt><dd>Allowed aur denied flows, URL categories, threats. Jawab: "kya ye guest traffic block hua?". Log flow silent ho to yahi view andha ho jata hai.</dd>
<dt>Reports</dt><dd>Managers ko bheje jane wale scheduled summaries (daily, weekly, monthly): availability, SLA compliance, top applications. Ye raw logs ko decisions mein badalte hain jaise capacity planning ya carrier performance review.</dd>
</dl>

<h3>Chart ko sahi padhne ke rules</h3>
<ol>
<li><b>Pehle scope fix karo.</b> Tenant, appliance, metric, direction, time range aur <b>time zone</b>. In ke bina chart evidence nahi, sirf picture hai. Screenshot ya ticket mein hamesha inhe jodo.</li>
<li><b>Freshness check karo.</b> Aakhri data point recent hona chahiye. Flat line ka matlab "problem nahi" bhi ho sakta hai aur "data nahi" bhi. Newest timestamp ko clock se compare karo.</li>
<li><b>Baseline dekho.</b> Kal ya pichhle hafte ke same ghante se compare karo. Monday 9 baje ka peak normal hai; raat 3 baje wahi peak normal nahi.</li>
<li><b>Aggregation ka dhyan rakho.</b> Paanch minute ka average das second ka loss burst chhupa deta hai jo call kharab kar chuka. Sabse chhote interval par zoom karo.</li>
<li><b>Events se correlate karo.</b> Change calendar aur carrier notices chart ke saath rakho. 10:40 par line mein step aur 10:39 par template push ek lead hai.</li>
<li><b>Current state se confirm karo.</b> History batati hai kya hua; CLI test batata hai abhi kya sach hai.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Delhi voice complaints. Delhi ka SLA chart 14:05 par Internet loss 0.3 percent se 2.5 percent hota dikhata hai jabki MPLS 0.05 percent par rehta hai. VOICE profile 1 percent allow karta hai. Application chart 14:06 par voice ko MPLS par jata dikhata hai, yani users lagbhag ek minute affected rahe. Conclusion: policy design ke hisaab se chali; Internet circuit ke liye carrier ticket chahiye, chart (tenant Acme, appliance Branch1, loss, 14:00 se 15:00 IST) attach karke.</p></div>

<h3>Absence bhi data hai</h3>
<p>Jo log source bhejna band kar de, uska koi chart, error ya red light nahi aata. Analytics source list control hai: ek taraf onboarded branches, doosri taraf active sources. Course CLI mein <code>show analytics sources</code> har us branch ko list karta hai jiska exporter is node ko point karta hai, status ke saath. Is list mein branch ka na hona wahi situation hai jo lab <b>vs-log-silence</b> mein hai.</p>
<pre class="out">admin@Analytics-cli&gt; show analytics sources
Branch        Status
Branch2       Exporting to ANA</pre>
<p>Yahan Delhi (Branch1) listed nahi hai. Chapter 7 dikhata hai ki wajah kaise dhundhein.</p>

<div class="note"><p><b>Real product note.</b> Real Versa mein Analytics ek clustered, scalable log platform hai jo normally branches se unke transport networks par logs leta hai, retention ke hisaab se size ho sakta hai, aur monitoring ke liye Director GUI se integrate hota hai. Logs external SIEM tools ko bhi forward ho sakte hain. Exact dashboards, retention aur cluster layout release aur sizing par depend karte hain, jo is course ke simplified model se bahar hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Bina scope ke screenshots; flat line par bharosa; time zone ignore karna (10 am IST event 04:30 UTC hai); sirf averages use karna; dashboards ko single source of truth maanna aur live test se confirm na karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Analytics data path mein nahi hai. Analytics down ho to user traffic chalta rehta hai; visibility jati hai, connectivity nahi. Ulta bhi sach hai: perfect dashboard ye prove nahi karta ki application chal rahi hai.</p></div>

<div class="scn"><h4>Wo "problem" jo time zone thi</h4><p>Carrier ne zor diya ki 09:30 par koi fault nahi tha jabki customer ke chart mein 09:30 par loss spike tha. Chart IST mein tha aur carrier ka log UTC mein. Engineer ne spike ko 04:00 UTC bataya to carrier ko usi time par maintenance event mila aur credit mila.</p><p><b>Lesson:</b> timestamp ke saath time zone hamesha likho.</p></div>

<div class="iv"><p class="q">"Incident ke dauran Analytics kaise use karte ho?"</p><p>Chart ka scope set karo (tenant, site, metric, time, zone), data fresh hai check karo, baseline se compare karo, change aur carrier events se correlate karo, phir live CLI test se confirm karo. Batao ki missing data khud ek finding hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Analytics flight recorder hai: branches logs export karte hain, collector store karta hai, dashboards aur reports dikhate hain.</li>
<li>Har chart ko tenant, appliance, metric, time range aur time zone chahiye.</li>
<li>Graph par bharosa se pehle freshness, baseline aur aggregation check karo.</li>
<li>History ko current CLI test se confirm karo.</li>
<li>Analytics data path mein nahi: down matlab andha, broken nahi.</li>
</ul></div>
`}};export{e as default};