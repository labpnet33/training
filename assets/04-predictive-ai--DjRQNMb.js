var e={id:`predictive`,h:{en:`Predictive AI: baselines, anomaly detection and capacity forecasting`,hi:`Predictive AI: baselines, anomaly detection aur capacity forecasting`},body:{en:`
<p>A good doctor does not panic because your pulse is 90. They compare it with <i>your</i> normal: 90 is fine after climbing stairs, worrying at rest if you are usually at 60. Predictive AI in a NOC does the same for every interface, CPU and link: it learns each one's normal, notices when something drifts away from it, and projects trends into the future before users feel the pain.</p>

<h3>Static thresholds versus learned baselines</h3>
<p>A <b>static threshold</b> is a fixed line: "alert when utilisation exceeds 80%". It is easy to understand but produces two kinds of pain. On a link that is always at 85% during backups, it alerts every night for nothing. On a link that normally carries 2% and suddenly jumps to 60% because of a loop, it stays silent because 60% is under 80%.</p>
<p>A <b>baseline</b> is a learned description of normal behaviour, usually an average (mean) and a measure of spread (standard deviation, SD), ideally per hour of day and day of week. This pattern over the day and week is called <b>seasonality</b>: Monday 10:00 looks nothing like Sunday 03:00. <b>Anomaly detection</b> flags values that are far outside the baseline, whether that is above 80% or not.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Traffic line with baseline band and one spike marked as anomaly">
<rect x="40" y="110" width="560" height="40" fill="#bbf7d0"/>
<text x="48" y="104" class="svg-muted" font-size="12">baseline band (mean ± 3 SD)</text>
<line x1="40" y1="30" x2="600" y2="30" stroke="#fed7aa" stroke-width="2" stroke-dasharray="6 4"/>
<text x="600" y="24" text-anchor="end" class="svg-muted" font-size="12">static 80% threshold</text>
<polyline points="40,132 90,128 140,135 190,126 240,131 290,129 340,134 380,127 400,60 420,55 440,58 460,130 510,128 560,133 600,130" fill="none" stroke="#64748b" stroke-width="2"/>
<circle cx="420" cy="55" r="7" fill="#fde68a" stroke="#64748b"/>
<text x="430" y="80" class="svg-ink" font-size="13">anomaly: far above normal</text>
<text x="40" y="190" class="svg-muted" font-size="12">time</text>
</svg><p class="cap">The spike never crosses the static threshold, but it is far outside the learned baseline, so anomaly detection catches it.</p></div>

<h3>The z-score: how far from normal?</h3>
<p>A simple, widely used measure is the <b>z-score</b>: <code>z = (current value − mean) ÷ SD</code>. It says how many standard deviations the value is away from normal. Values within about ±3 are ordinary noise; much larger values are unusual. Real products use more advanced models (seasonal forecasts, clustering, neural networks), but the idea is the same: compare now with a learned normal.</p>

<div class="eg"><p><b>Worked example.</b> An interface's baseline is 180 packets/s with SD 10. Now it shows 2,100 packets/s. z = (2100 − 180) ÷ 10 = 192. That is enormously outside normal, so it is an anomaly. But the z-score does not tell you <i>why</i>. It could be a broadcast storm from a loop, a DDoS, a new application, or the scheduled nightly backup. An anomaly is a question, not an answer. Your next steps: check the time (backup window?), the syslog (%SPANTREE or storm-control messages?), the flow data (which source and destination?) and the change calendar.</p></div>

<h3>What the lab shows</h3>
<p>NK Copilot samples interface counters every 5 seconds, learns a baseline from the first 30 seconds, then flags interfaces far above it.</p>
<pre class="out">NOC&gt; copilot anomalies
NK Copilot telemetry - packets/s per interface (sample every 5 s, baseline = first 30 s)
Device  Interface  Baseline      Now      z-score  Trend (last 12)  Status
R1      Gi0/0      60 ±3         61       0.3      ▅▅▅▅▅▅▅▅▅▅▅▅     normal
<span class="hl">R3      Gi0/1      181 ±9        2170     219.8    ▁▁▁▁▁▁▇█████     ANOMALY (x12.0 vs baseline)</span>

Copilot: 1 interface(s) far above their learned baseline. Spikes can be real incidents (loop, broadcast storm, backup job, attack) or a stale baseline - correlate with logs before acting.</pre>
<p>In the guardrails lab this spike on DC Gi0/1 is the backup server's scheduled job. The right reaction is to identify it, confirm the context, and not "fix" it. If the baseline itself is wrong (learned during an unusual period), <code>copilot anomalies --relearn</code> clears and relearns it.</p>

<h3>Capacity forecasting</h3>
<p>Anomaly detection looks at sudden changes; <b>forecasting</b> looks at slow trends. A regression model (supervised learning, chapter 2) fits a trend line to months of utilisation and projects when the link will cross your planning limit. Engineers usually forecast on the <b>95th percentile</b> of utilisation, which ignores short bursts but reflects the real busy level.</p>
<div class="eg"><p><b>Worked example.</b> A 1 Gbps WAN link's monthly 95th percentile went 52%, 54%, 56%, 58%, 60%, 62% over six months: about +2% per month. Your policy is to upgrade before 80%. (80 − 62) ÷ 2 = 9 months. Circuit delivery takes 3 months, so the order must go in within 6 months. That forecast turns a future outage into a calm purchase order. Re-check it monthly: a new office or a cloud migration can bend the curve.</p></div>

<h3>Other predictive uses</h3>
<ul>
<li>Predicting hardware failure from rising correctable memory errors, fan speed or optic receive power drifting towards its low threshold.</li>
<li>Predicting Wi-Fi experience problems from client retry rates and RF interference.</li>
<li>Scoring the risk of a change from the history of similar changes.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Learning the baseline during an incident or migration, so the abnormal becomes "normal". Ignoring seasonality, so every Monday morning looks like an attack. Treating every anomaly as an incident and waking people up for the backup job. Trusting a forecast built on three days of data.</p></div>
<div class="exam"><p><b>Exam trap.</b> Predictive AI forecasts or detects deviations from history; it does not create configs (that is generative) or act (that is agentic). An anomaly means "unusual", not "malicious". A baseline that is learned from data is ML; a fixed threshold is rule-based.</p></div>

<div class="scn"><h4>The quiet loop</h4><p>A campus distribution switch uplink normally carried about 3% utilisation overnight. One night a mis-patched cable created a loop on an access switch with spanning tree disabled on that port. Broadcast traffic pushed the uplink to 55%: under the 80% static alarm, so nothing fired, but users on two floors had very slow applications. The next day the team enabled baseline-based anomaly detection. The replay of the same data showed the uplink at z &gt; 50 within a minute of the loop. They also re-enabled BPDU guard on access ports.</p><p><b>Lesson:</b> learned baselines catch "abnormal for this link" events that fixed thresholds miss, but you still need the protocol knowledge to find the cause.</p></div>

<div class="iv"><p class="q">"How is anomaly detection different from threshold alerting, and what can go wrong with it?"</p><p>Strong answer: thresholds are fixed lines; anomaly detection learns a per-metric baseline with seasonality and flags statistically unusual values, such as a high z-score, even under the threshold. Risks: a baseline learned during a bad period, missing seasonality, too many false positives (alert fatigue), and anomalies that are legitimate (backups, patch days). Say that an anomaly starts an investigation with logs, flows and change records; it does not prove a cause.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A baseline is a learned normal (mean and spread, ideally per time of day and week).</li>
<li>z = (value − mean) ÷ SD measures how far from normal a value is.</li>
<li>An anomaly is unusual, not automatically bad: correlate with time, logs, flows and changes.</li>
<li>Capacity forecasting projects trends (often on the 95th percentile) to plan upgrades before users suffer.</li>
<li>A baseline learned during an incident hides real problems; relearn it when the network changes.</li>
</ul></div>
`,hi:`
<p>Ek achha doctor is baat par panic nahi karta ki aapki pulse 90 hai. Woh use <i>aapke</i> normal se compare karta hai: seedhiyan chadhne ke baad 90 theek hai, aaram mein chinta ki baat hai agar aap aam taur par 60 par rehte ho. NOC mein predictive AI har interface, CPU aur link ke liye yahi karta hai: har ek ka normal seekhta hai, notice karta hai jab kuch usse door jaata hai, aur users ko dard hone se pehle trends ko future mein project karta hai.</p>

<h3>Static thresholds versus learned baselines</h3>
<p><b>Static threshold</b> ek fixed line hai: "jab utilisation 80% se upar jaaye tab alert karo". Yeh samajhna aasaan hai lekin do tarah ka dard deta hai. Jo link backups ke dauraan hamesha 85% par hota hai, us par yeh har raat bekaar alert karta hai. Jo link normally 2% le jaata hai aur loop ki wajah se achanak 60% par pahunch jaata hai, us par yeh chup rehta hai kyunki 60% to 80% se neeche hai.</p>
<p><b>Baseline</b> normal behaviour ka seekha hua description hai, aam taur par ek average (mean) aur spread ka measure (standard deviation, SD), ideally din ke har ghante aur hafte ke har din ke liye. Din aur hafte ke is pattern ko <b>seasonality</b> kehte hain: Monday 10:00 Sunday 03:00 jaisa bilkul nahi dikhta. <b>Anomaly detection</b> un values ko flag karta hai jo baseline se bahut bahar hain, chahe woh 80% se upar ho ya na ho.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Traffic line baseline band ke saath aur ek spike anomaly ki tarah marked">
<rect x="40" y="110" width="560" height="40" fill="#bbf7d0"/>
<text x="48" y="104" class="svg-muted" font-size="12">baseline band (mean ± 3 SD)</text>
<line x1="40" y1="30" x2="600" y2="30" stroke="#fed7aa" stroke-width="2" stroke-dasharray="6 4"/>
<text x="600" y="24" text-anchor="end" class="svg-muted" font-size="12">static 80% threshold</text>
<polyline points="40,132 90,128 140,135 190,126 240,131 290,129 340,134 380,127 400,60 420,55 440,58 460,130 510,128 560,133 600,130" fill="none" stroke="#64748b" stroke-width="2"/>
<circle cx="420" cy="55" r="7" fill="#fde68a" stroke="#64748b"/>
<text x="430" y="80" class="svg-ink" font-size="13">anomaly: normal se bahut upar</text>
<text x="40" y="190" class="svg-muted" font-size="12">time</text>
</svg><p class="cap">Spike static threshold ko kabhi cross nahi karta, lekin seekhe hue baseline se bahut bahar hai, isliye anomaly detection use pakad leta hai.</p></div>

<h3>z-score: normal se kitna door?</h3>
<p>Ek simple, bahut use hone wala measure hai <b>z-score</b>: <code>z = (current value − mean) ÷ SD</code>. Yeh batata hai ki value normal se kitne standard deviations door hai. Lagbhag ±3 ke andar ki values aam noise hain; bahut badi values unusual hain. Real products zyada advanced models use karte hain (seasonal forecasts, clustering, neural networks), lekin idea wahi hai: abhi ko seekhe hue normal se compare karo.</p>

<div class="eg"><p><b>Worked example.</b> Ek interface ka baseline 180 packets/s hai, SD 10. Abhi yeh 2,100 packets/s dikha raha hai. z = (2100 − 180) ÷ 10 = 192. Yeh normal se bahut zyada bahar hai, isliye anomaly hai. Lekin z-score yeh nahi batata ki <i>kyun</i>. Yeh loop se broadcast storm ho sakta hai, DDoS, nayi application, ya raat ka scheduled backup. Anomaly ek sawaal hai, jawab nahi. Aapke agle steps: time check karo (backup window?), syslog (%SPANTREE ya storm-control messages?), flow data (kaunsa source aur destination?) aur change calendar.</p></div>

<h3>Lab kya dikhati hai</h3>
<p>NK Copilot har 5 second mein interface counters sample karta hai, pehle 30 second se baseline seekhta hai, phir usse bahut upar wale interfaces flag karta hai.</p>
<pre class="out">NOC&gt; copilot anomalies
NK Copilot telemetry - packets/s per interface (sample every 5 s, baseline = first 30 s)
Device  Interface  Baseline      Now      z-score  Trend (last 12)  Status
R1      Gi0/0      60 ±3         61       0.3      ▅▅▅▅▅▅▅▅▅▅▅▅     normal
<span class="hl">R3      Gi0/1      181 ±9        2170     219.8    ▁▁▁▁▁▁▇█████     ANOMALY (x12.0 vs baseline)</span>

Copilot: 1 interface(s) far above their learned baseline. Spikes can be real incidents (loop, broadcast storm, backup job, attack) or a stale baseline - correlate with logs before acting.</pre>
<p>Guardrails lab mein DC Gi0/1 par yeh spike backup server ka scheduled job hai. Sahi reaction hai ise pehchanna, context confirm karna, aur ise "fix" na karna. Agar baseline khud galat hai (unusual period mein seekha gaya), to <code>copilot anomalies --relearn</code> use clear karke dobara seekhta hai.</p>

<h3>Capacity forecasting</h3>
<p>Anomaly detection achanak changes dekhta hai; <b>forecasting</b> dheeme trends dekhta hai. Ek regression model (supervised learning, chapter 2) mahino ke utilisation par trend line fit karta hai aur project karta hai ki link kab aapki planning limit cross karega. Engineers aam taur par utilisation ke <b>95th percentile</b> par forecast karte hain, jo chhote bursts ko ignore karta hai lekin asli busy level dikhata hai.</p>
<div class="eg"><p><b>Worked example.</b> Ek 1 Gbps WAN link ka monthly 95th percentile chhe mahino mein 52%, 54%, 56%, 58%, 60%, 62% gaya: lagbhag +2% per month. Aapki policy hai 80% se pehle upgrade karna. (80 − 62) ÷ 2 = 9 mahine. Circuit delivery mein 3 mahine lagte hain, isliye order 6 mahine ke andar jaana chahiye. Yeh forecast future outage ko ek shaant purchase order mein badal deta hai. Har mahine dobara check karo: naya office ya cloud migration curve ko mod sakta hai.</p></div>

<h3>Doosre predictive uses</h3>
<ul>
<li>Badhte correctable memory errors, fan speed, ya low threshold ki taraf khiskti optic receive power se hardware failure predict karna.</li>
<li>Client retry rates aur RF interference se Wi-Fi experience problems predict karna.</li>
<li>Milte-julte changes ki history se kisi change ka risk score karna.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Incident ya migration ke dauraan baseline seekhna, jisse abnormal "normal" ban jaata hai. Seasonality ignore karna, jisse har Monday subah attack jaisi dikhti hai. Har anomaly ko incident maan kar backup job ke liye logon ko jagana. Teen din ke data par bane forecast par trust karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Predictive AI history se forecast karta hai ya deviations pakadta hai; yeh configs nahi banata (woh generative hai) aur act nahi karta (woh agentic hai). Anomaly ka matlab "unusual" hai, "malicious" nahi. Data se seekha gaya baseline ML hai; fixed threshold rule-based hai.</p></div>

<div class="scn"><h4>Khamosh loop</h4><p>Ek campus distribution switch ka uplink raat mein normally lagbhag 3% utilisation le jaata tha. Ek raat galat patch kiye cable ne ek access switch par loop bana diya, us port par spanning tree disabled tha. Broadcast traffic ne uplink ko 55% tak pahuncha diya: 80% static alarm se neeche, isliye kuch fire nahi hua, lekin do floors ke users ki applications bahut slow thi. Agle din team ne baseline-based anomaly detection enable kiya. Usi data ke replay ne loop ke ek minute ke andar uplink ko z &gt; 50 par dikhaya. Unhone access ports par BPDU guard bhi dobara enable kiya.</p><p><b>Seekh:</b> seekhe hue baselines "is link ke liye abnormal" events pakadte hain jo fixed thresholds miss karte hain, lekin cause dhoondhne ke liye protocol knowledge phir bhi chahiye.</p></div>

<div class="iv"><p class="q">"Anomaly detection threshold alerting se kaise alag hai, aur usmein kya galat ho sakta hai?"</p><p>Strong answer: thresholds fixed lines hain; anomaly detection har metric ka seasonality ke saath baseline seekhta hai aur statistically unusual values flag karta hai, jaise high z-score, threshold se neeche bhi. Risks: bure period mein seekha baseline, seasonality miss hona, bahut zyada false positives (alert fatigue), aur legitimate anomalies (backups, patch days). Bolo ki anomaly logs, flows aur change records ke saath investigation shuru karti hai; cause prove nahi karti.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Baseline seekha hua normal hai (mean aur spread, ideally din ke time aur hafte ke hisaab se).</li>
<li>z = (value − mean) ÷ SD naapta hai ki value normal se kitni door hai.</li>
<li>Anomaly unusual hai, automatically bura nahi: time, logs, flows aur changes se correlate karo.</li>
<li>Capacity forecasting trends project karta hai (aksar 95th percentile par) taaki users ke suffer karne se pehle upgrades plan hon.</li>
<li>Incident ke dauraan seekha baseline asli problems chhupata hai; network badle to dobara seekho.</li>
</ul></div>
`}};export{e as default};