var e={id:`baselines`,h:{en:`Baselines, alerting, APIs and monitoring solutions`,hi:`Baselines, alerting, APIs aur monitoring solutions`},body:{en:`
<p>A doctor who sees a resting heart rate of 95 cannot say whether it is a problem without knowing the patient. For a marathon runner whose normal is 50, it is alarming; for someone who just climbed stairs, it is fine. Networks are the same. A number means nothing without a <b>baseline</b>: a record of what normal looks like for this device, at this time of day, on this day of the week.</p>

<h3>Baseline metrics</h3>
<p>A <b>baseline</b> is built by collecting metrics over a representative period (weeks, including month-end and busy days) and recording typical values and ranges. Metrics you will baseline:</p>
<table class="cmp"><tr><th>Metric</th><th>What it tells you</th><th>Typical source</th></tr>
<tr><td>Bandwidth utilisation / throughput</td><td>How full the links are</td><td>SNMP interface counters, flow data</td></tr>
<tr><td>Latency</td><td>Delay from A to B (ms)</td><td>Ping, synthetic probes</td></tr>
<tr><td>Jitter</td><td>Variation in latency; critical for voice and video</td><td>Synthetic probes</td></tr>
<tr><td>Packet loss</td><td>Percentage of packets that never arrive</td><td>Probes, interface drops</td></tr>
<tr><td>Interface errors</td><td>CRC errors, discards: cabling, duplex or congestion issues</td><td>SNMP, CLI</td></tr>
<tr><td>CPU, memory, temperature</td><td>Device health</td><td>SNMP, APIs, telemetry</td></tr>
</table>

<div class="eg"><p><b>Worked example: utilisation from counters.</b> Utilisation % = (Δbytes × 8) ÷ (interval in seconds × link speed in bps) × 100. R1 Gi0/1 is 100 Mbps. Two polls 300 s apart show ifHCOutOctets rising by 1,125,000,000 bytes. 1,125,000,000 × 8 = 9,000,000,000 bits; ÷ (300 × 100,000,000) = 0.30, so <b>30%</b>. The baseline for this link at 10:00 is 25-35%, so no alert. If the next interval shows 92%, well outside the baseline, an <b>anomaly alert</b> fires.</p></div>

<h3>Anomaly alerting and notifications</h3>
<p>Alerts come in two main styles. <b>Static thresholds</b> fire when a value crosses a fixed line (CPU above 90% for 5 minutes, interface down). <b>Anomaly (deviation) alerting</b> fires when a value moves far away from its baseline, even if the absolute number looks harmless: 40% utilisation at 03:00 on a link that is normally 2% at night may be a backup job gone wrong or data being stolen. Alerts are delivered as <b>notifications</b>: dashboard colours, email, SMS, chat messages, or tickets created automatically. Good alerting is tuned: too many false alarms and people stop reading them (<b>alert fatigue</b>).</p>

<h3>API integration</h3>
<p>Modern devices, controllers and cloud services expose <b>APIs</b> (application programming interfaces), usually REST over HTTPS with JSON data. Monitoring platforms use APIs to pull data that SNMP does not cover (wireless client counts from a controller, SD-WAN path quality, cloud VPC metrics), and to push actions: open a ticket, post to a chat channel, or trigger an automation. <b>Streaming telemetry</b> reverses polling: the device pushes a continuous stream of structured data to the collector every few seconds, which gives far finer detail than 5-minute SNMP polls.</p>
<pre class="out">GET /api/v1/interfaces/GigabitEthernet0-1/stats
{
  "name": "GigabitEthernet0/1",
  "oper-status": "up",
  <span class="hl">"out-utilisation-percent": 30.0,</span>
  "in-errors": 0
}</pre>

<h3>Network monitoring solutions</h3>
<p>N10-009 lists five things a monitoring solution does:</p>
<dl class="terms">
<dt>Network discovery</dt><dd>Finds devices and how they connect, using ping sweeps, SNMP, LLDP/CDP neighbours, ARP and routing tables. <b>Ad hoc</b> discovery runs on demand (after a change, during an audit); <b>scheduled</b> discovery runs regularly (every night) to keep the inventory and topology maps current and catch rogue devices.</dd>
<dt>Traffic analysis</dt><dd>Uses flow data and captures to show who uses the bandwidth, which applications and when.</dd>
<dt>Performance monitoring</dt><dd>Tracks latency, jitter, loss, utilisation, errors, CPU and memory against baselines.</dd>
<dt>Availability monitoring</dt><dd>Answers "is it up?": ICMP reachability, interface status, service checks, traps and uptime percentages for SLA reports.</dd>
<dt>Configuration monitoring</dt><dd>Backs up configurations, compares them with the golden configuration and alerts on unauthorised or unexpected changes (configuration drift).</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Monitoring platform inputs and outputs">
<rect x="10" y="20" width="150" height="34" rx="6" fill="#bae6fd"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="12">SNMP polls, traps</text>
<rect x="10" y="62" width="150" height="34" rx="6" fill="#bae6fd"/><text x="85" y="84" text-anchor="middle" class="svg-ink" font-size="12">Syslog</text>
<rect x="10" y="104" width="150" height="34" rx="6" fill="#bae6fd"/><text x="85" y="126" text-anchor="middle" class="svg-ink" font-size="12">Flow data</text>
<rect x="10" y="146" width="150" height="34" rx="6" fill="#bae6fd"/><text x="85" y="168" text-anchor="middle" class="svg-ink" font-size="12">APIs, telemetry</text>
<rect x="230" y="60" width="180" height="90" rx="10" fill="#bbf7d0"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="14">Monitoring platform</text><text x="320" y="114" text-anchor="middle" class="svg-muted" font-size="12">baselines, thresholds</text><text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">discovery, maps</text>
<rect x="480" y="30" width="150" height="34" rx="6" fill="#fde68a"/><text x="555" y="52" text-anchor="middle" class="svg-ink" font-size="12">Dashboards</text>
<rect x="480" y="88" width="150" height="34" rx="6" fill="#fed7aa"/><text x="555" y="110" text-anchor="middle" class="svg-ink" font-size="12">Alerts, on-call</text>
<rect x="480" y="146" width="150" height="34" rx="6" fill="#ddd6fe"/><text x="555" y="168" text-anchor="middle" class="svg-ink" font-size="12">Tickets, reports</text>
<line x1="160" y1="37" x2="230" y2="85" stroke="#64748b"/><line x1="160" y1="79" x2="230" y2="95" stroke="#64748b"/><line x1="160" y1="121" x2="230" y2="115" stroke="#64748b"/><line x1="160" y1="163" x2="230" y2="125" stroke="#64748b"/>
<line x1="410" y1="95" x2="480" y2="47" stroke="#64748b"/><line x1="410" y1="105" x2="480" y2="105" stroke="#64748b"/><line x1="410" y1="115" x2="480" y2="163" stroke="#64748b"/>
</svg><p class="cap">Many data sources feed one platform, which compares them with baselines and turns deviations into dashboards, alerts and tickets.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Building a baseline from one quiet week and then alerting on every busy Monday. Setting thresholds so tight that alerts fire all day. Monitoring only "up or down" and missing a link that is up but dropping 5% of packets. Polling every device every 10 seconds and overloading their CPUs. Forgetting to re-baseline after a major change.</p></div>

<div class="exam"><p><b>Exam trap.</b> A <b>baseline</b> is what normal looks like; you need it before you can spot an anomaly. <b>Scheduled</b> discovery runs automatically at intervals; <b>ad hoc</b> runs when someone starts it. <b>Configuration monitoring</b> detects drift from the golden config; <b>availability monitoring</b> checks up/down status.</p></div>

<div class="scn"><h4>Up but broken</h4><p>A retail chain's monitoring showed every branch router green, yet card payments in one region were timing out. The dashboard only checked availability (ping every 5 minutes). The engineer added performance probes that measured loss and jitter every 30 seconds and compared them with a two-week baseline. The region's MPLS link was up but losing 4% of packets at peak hour, far above its 0.1% baseline. The provider found a faulty line card. The team now alerts on loss and jitter deviations, not just on down.</p><p><b>Lesson:</b> availability is not performance; baselines and anomaly alerts catch the "up but broken" failures users feel.</p></div>

<div class="iv"><p class="q">"How would you decide what normal looks like on a network, and how would you alert on problems?"</p><p>Strong answer: collect utilisation, latency, jitter, loss, errors, CPU and memory for several weeks including busy periods, and build a baseline per device and time of day. Use static thresholds for hard limits (interface down, CPU above 90% sustained) and deviation-based anomaly alerts for unusual behaviour. Route alerts by severity to dashboards, tickets or on-call phones, tune them to avoid alert fatigue, and re-baseline after major changes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A baseline records normal values per device and time; anomalies are deviations from it.</li>
<li>Utilisation % = Δbytes × 8 ÷ (seconds × link bps) × 100.</li>
<li>APIs (REST/JSON) and streaming telemetry complement SNMP and feed automation.</li>
<li>Solutions: discovery (ad hoc or scheduled), traffic analysis, performance, availability and configuration monitoring.</li>
<li>Tune alerts to avoid alert fatigue; monitor performance, not only up/down.</li>
</ul></div>
`,hi:`
<p>Ek doctor jo resting heart rate 95 dekhta hai, patient ko jaane bina nahi keh sakta ki yeh problem hai ya nahi. Ek marathon runner ke liye jiska normal 50 hai, yeh khatre ki baat hai; kisi ke liye jo abhi seedhiyan chadh ke aaya hai, yeh theek hai. Networks bhi aise hi hain. <b>Baseline</b> ke bina number ka koi matlab nahi: is device ke liye, din ke is samay, hafte ke is din normal kaisa dikhta hai, uska record.</p>

<h3>Baseline metrics</h3>
<p><b>Baseline</b> ek representative period (hafte, month-end aur busy din shamil karke) mein metrics collect karke aur typical values aur ranges record karke banta hai. Metrics jinka aap baseline banaoge:</p>
<table class="cmp"><tr><th>Metric</th><th>Kya batata hai</th><th>Typical source</th></tr>
<tr><td>Bandwidth utilisation / throughput</td><td>Links kitne bhare hain</td><td>SNMP interface counters, flow data</td></tr>
<tr><td>Latency</td><td>A se B tak delay (ms)</td><td>Ping, synthetic probes</td></tr>
<tr><td>Jitter</td><td>Latency mein variation; voice aur video ke liye critical</td><td>Synthetic probes</td></tr>
<tr><td>Packet loss</td><td>Kitne percent packets kabhi nahi pahunchte</td><td>Probes, interface drops</td></tr>
<tr><td>Interface errors</td><td>CRC errors, discards: cabling, duplex ya congestion issues</td><td>SNMP, CLI</td></tr>
<tr><td>CPU, memory, temperature</td><td>Device health</td><td>SNMP, APIs, telemetry</td></tr>
</table>

<div class="eg"><p><b>Worked example: counters se utilisation.</b> Utilisation % = (Δbytes × 8) ÷ (interval seconds mein × link speed bps mein) × 100. R1 Gi0/1 100 Mbps ka hai. 300 s ke gap wale do polls mein ifHCOutOctets 1,125,000,000 bytes badhta hai. 1,125,000,000 × 8 = 9,000,000,000 bits; ÷ (300 × 100,000,000) = 0.30, yaani <b>30%</b>. Is link ka 10:00 ka baseline 25-35% hai, isliye koi alert nahi. Agar agla interval 92% dikhaye, baseline se bahut bahar, to <b>anomaly alert</b> fire hota hai.</p></div>

<h3>Anomaly alerting aur notifications</h3>
<p>Alerts do main styles mein aate hain. <b>Static thresholds</b> tab fire hote hain jab value ek fixed line cross karti hai (5 minute tak CPU 90% se upar, interface down). <b>Anomaly (deviation) alerting</b> tab fire hoti hai jab value apne baseline se bahut door chali jaaye, chahe absolute number harmless lage: raat mein normally 2% wale link par 03:00 baje 40% utilisation ek bigda hua backup job ya chori ho raha data ho sakta hai. Alerts <b>notifications</b> ke roop mein pahunchte hain: dashboard colours, email, SMS, chat messages, ya apne aap bane tickets. Achhi alerting tuned hoti hai: bahut saare false alarms hon to log unhe padhna band kar dete hain (<b>alert fatigue</b>).</p>

<h3>API integration</h3>
<p>Modern devices, controllers aur cloud services <b>APIs</b> (application programming interfaces) expose karte hain, aam taur par HTTPS par REST, JSON data ke saath. Monitoring platforms APIs se woh data kheenchte hain jo SNMP cover nahi karta (controller se wireless client counts, SD-WAN path quality, cloud VPC metrics), aur actions push karte hain: ticket kholna, chat channel par post karna, ya automation trigger karna. <b>Streaming telemetry</b> polling ko ulta kar deti hai: device har kuch seconds mein collector ko structured data ki lagataar stream push karta hai, jo 5-minute SNMP polls se kahin zyada detail deti hai.</p>
<pre class="out">GET /api/v1/interfaces/GigabitEthernet0-1/stats
{
  "name": "GigabitEthernet0/1",
  "oper-status": "up",
  <span class="hl">"out-utilisation-percent": 30.0,</span>
  "in-errors": 0
}</pre>

<h3>Network monitoring solutions</h3>
<p>N10-009 paanch kaam batata hai jo monitoring solution karta hai:</p>
<dl class="terms">
<dt>Network discovery</dt><dd>Ping sweeps, SNMP, LLDP/CDP neighbours, ARP aur routing tables se devices aur unke connections dhoondhta hai. <b>Ad hoc</b> discovery zaroorat par chalti hai (change ke baad, audit ke dauraan); <b>scheduled</b> discovery regularly chalti hai (har raat) taaki inventory aur topology maps current rahein aur rogue devices pakde jaayein.</dd>
<dt>Traffic analysis</dt><dd>Flow data aur captures se dikhata hai ki bandwidth kaun use karta hai, kaunsi applications aur kab.</dd>
<dt>Performance monitoring</dt><dd>Latency, jitter, loss, utilisation, errors, CPU aur memory ko baselines ke against track karta hai.</dd>
<dt>Availability monitoring</dt><dd>"Kya yeh up hai?" ka jawab: ICMP reachability, interface status, service checks, traps aur SLA reports ke liye uptime percentages.</dd>
<dt>Configuration monitoring</dt><dd>Configurations ka backup leta hai, unhe golden configuration se compare karta hai aur unauthorised ya unexpected changes (configuration drift) par alert karta hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Monitoring platform ke inputs aur outputs">
<rect x="10" y="20" width="150" height="34" rx="6" fill="#bae6fd"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="12">SNMP polls, traps</text>
<rect x="10" y="62" width="150" height="34" rx="6" fill="#bae6fd"/><text x="85" y="84" text-anchor="middle" class="svg-ink" font-size="12">Syslog</text>
<rect x="10" y="104" width="150" height="34" rx="6" fill="#bae6fd"/><text x="85" y="126" text-anchor="middle" class="svg-ink" font-size="12">Flow data</text>
<rect x="10" y="146" width="150" height="34" rx="6" fill="#bae6fd"/><text x="85" y="168" text-anchor="middle" class="svg-ink" font-size="12">APIs, telemetry</text>
<rect x="230" y="60" width="180" height="90" rx="10" fill="#bbf7d0"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="14">Monitoring platform</text><text x="320" y="114" text-anchor="middle" class="svg-muted" font-size="12">baselines, thresholds</text><text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">discovery, maps</text>
<rect x="480" y="30" width="150" height="34" rx="6" fill="#fde68a"/><text x="555" y="52" text-anchor="middle" class="svg-ink" font-size="12">Dashboards</text>
<rect x="480" y="88" width="150" height="34" rx="6" fill="#fed7aa"/><text x="555" y="110" text-anchor="middle" class="svg-ink" font-size="12">Alerts, on-call</text>
<rect x="480" y="146" width="150" height="34" rx="6" fill="#ddd6fe"/><text x="555" y="168" text-anchor="middle" class="svg-ink" font-size="12">Tickets, reports</text>
<line x1="160" y1="37" x2="230" y2="85" stroke="#64748b"/><line x1="160" y1="79" x2="230" y2="95" stroke="#64748b"/><line x1="160" y1="121" x2="230" y2="115" stroke="#64748b"/><line x1="160" y1="163" x2="230" y2="125" stroke="#64748b"/>
<line x1="410" y1="95" x2="480" y2="47" stroke="#64748b"/><line x1="410" y1="105" x2="480" y2="105" stroke="#64748b"/><line x1="410" y1="115" x2="480" y2="163" stroke="#64748b"/>
</svg><p class="cap">Bahut saare data sources ek platform ko feed karte hain, jo unhe baselines se compare karta hai aur deviations ko dashboards, alerts aur tickets mein badalta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Ek shaant hafte se baseline banana aur phir har busy Monday par alert karna. Thresholds itne tight rakhna ki din bhar alerts fire hon. Sirf "up ya down" monitor karna aur aisa link miss karna jo up hai lekin 5% packets drop kar raha hai. Har device ko har 10 second poll karke unke CPUs overload karna. Bade change ke baad re-baseline karna bhoolna.</p></div>

<div class="exam"><p><b>Exam trap.</b> <b>Baseline</b> woh hai jaisa normal dikhta hai; anomaly pakadne se pehle yeh chahiye. <b>Scheduled</b> discovery intervals par apne aap chalti hai; <b>ad hoc</b> tab chalti hai jab koi use shuru kare. <b>Configuration monitoring</b> golden config se drift pakadti hai; <b>availability monitoring</b> up/down status check karti hai.</p></div>

<div class="scn"><h4>Up lekin toota hua</h4><p>Ek retail chain ki monitoring mein har branch router green tha, phir bhi ek region mein card payments timeout ho rahe the. Dashboard sirf availability check karta tha (har 5 minute ping). Engineer ne performance probes jode jo har 30 seconds loss aur jitter measure karte the aur unhe do hafte ke baseline se compare karte the. Region ka MPLS link up tha lekin peak hour mein 4% packets kho raha tha, apne 0.1% baseline se bahut upar. Provider ko ek kharab line card mila. Team ab sirf down par nahi, loss aur jitter deviations par bhi alert karti hai.</p><p><b>Seekh:</b> availability performance nahi hai; baselines aur anomaly alerts woh "up lekin toote hue" failures pakadte hain jo users mehsoos karte hain.</p></div>

<div class="iv"><p class="q">"Aap kaise tay karoge ki network par normal kaisa dikhta hai, aur problems par alert kaise karoge?"</p><p>Strong answer: kai hafton tak, busy periods shamil karke, utilisation, latency, jitter, loss, errors, CPU aur memory collect karo, aur har device aur din ke samay ke liye baseline banao. Hard limits (interface down, lagataar CPU 90% se upar) ke liye static thresholds aur unusual behaviour ke liye deviation-based anomaly alerts use karo. Alerts ko severity ke hisaab se dashboards, tickets ya on-call phones par route karo, alert fatigue se bachne ke liye tune karo, aur bade changes ke baad re-baseline karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Baseline har device aur samay ke normal values record karta hai; anomalies usse deviations hain.</li>
<li>Utilisation % = Δbytes × 8 ÷ (seconds × link bps) × 100.</li>
<li>APIs (REST/JSON) aur streaming telemetry SNMP ko complement karte hain aur automation ko feed karte hain.</li>
<li>Solutions: discovery (ad hoc ya scheduled), traffic analysis, performance, availability aur configuration monitoring.</li>
<li>Alert fatigue se bachne ke liye alerts tune karo; sirf up/down nahi, performance bhi monitor karo.</li>
</ul></div>
`}};export{e as default};