var e={id:`troubleshoot-dashboards`,h:{en:`Troubleshooting dashboards`,hi:`Dashboards ka troubleshooting`},body:{en:`
<h3>When the dashboard lies</h3>
<p>Most monitoring tickets are not "the network is down". They are "the dashboard says one thing and the users say another". A dashboard can lie in four ways: it shows <b>no data</b>, it shows data that <b>hides</b> the problem, it <b>learned</b> the problem as normal, or it shows a normal pattern as a problem. This chapter gives you a workflow to tell them apart, then walks lab obs-dash-3.</p>

<h3>The workflow</h3>
<ol>
<li><b>Is there data?</b> A panel that says nodata means the poller got no answer. Go to <b>Targets</b> and read the reason: disabled, timeout, wrong-community, unknown-user, wrong-level, auth-failure or decrypt-error. Fix polling first (module obs-snmp).</li>
<li><b>Does the panel ask the right question?</b> Check metric, target, aggregation and window. An average over twelve hours can hide a one-hour fault; a window of one hour can miss yesterday's cause.</li>
<li><b>Is a baseline in the way?</b> Open <b>Baselines</b>. Compare the z-score against the baseline with the z-score against the healthy reference.</li>
<li><b>Is the pattern seasonal?</b> If the "problem" appears at the same hour every day, suspect a scheduled job such as a backup, not a fault.</li>
<li><b>Confirm with a second, independent signal.</b> Latency high on the dashboard? Check loss, a probe or a flow view. Two signals agreeing is evidence.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Dashboard troubleshooting flow">
<rect x="20" y="20" width="130" height="50" rx="8" fill="#bae6fd"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="12">1 Data present?</text>
<rect x="170" y="20" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="235" y="50" text-anchor="middle" class="svg-ink" font-size="12">2 Right question?</text>
<rect x="320" y="20" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="385" y="50" text-anchor="middle" class="svg-ink" font-size="12">3 Baseline ok?</text>
<rect x="470" y="20" width="150" height="50" rx="8" fill="#fde68a"/><text x="545" y="50" text-anchor="middle" class="svg-ink" font-size="12">4 Seasonal?</text>
<rect x="170" y="120" width="300" height="50" rx="8" fill="#fed7aa"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="12">5 Confirm with an independent signal</text>
<g stroke="#64748b" stroke-width="2"><line x1="150" y1="45" x2="170" y2="45"/><line x1="300" y1="45" x2="320" y2="45"/><line x1="450" y1="45" x2="470" y2="45"/><line x1="545" y1="70" x2="470" y2="130"/></g>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">no data: fix polling   hidden: fix the query   learned: fix the baseline</text>
</svg><p class="cap">Four ways a dashboard can mislead, then proof.</p></div>

<h3>Case 1: no data for Kochi</h3>
<p>With the tweak <code>snmp-bad</code> the console polls R-KCH with the community <code>GF-R0</code> (a zero instead of the letter O). The agent expects <code>GF-RO</code>. The panels for R-KCH show nodata, while R-HYD and R-LKO are fine. Open Targets, set the R-KCH poll community to <code>GF-RO</code>, Apply. That is the example in ticket 331020. Note how the nodata was visible and honest; the dashboard did not invent zeros.</p>

<h3>Case 2: lab obs-dash-3, baseline drift hides an outage</h3>
<p>Scenario: Kabir Shah says the Kochi link has been slow for days. The anomaly view says all is normal. The network is built with the tweak <code>drift</code>: Kochi latency has been 70 ms above normal for 900 points, and a rolling baseline <code>bl-lat-kch-roll</code> exists.</p>
<pre class="out">Baselines
bl-lat-kch        fixed    z = 17.5    abnormal now
bl-lat-kch-roll   rolling  window 576  z = 0.1    normal now   <span class="hl">drifted: bad state learned as normal</span>
Dashboards > d-health  p-lat-lko  latency  avg  ok
Alert rules  r-latency  latency &gt; 150 for 3 points  (Kochi is at 110, below it)</pre>
<p>Three things combined: the rolling baseline learned the shift, the fixed alert threshold of 150 ms is above the real degraded value of 110 ms, and the health dashboard watches Lucknow latency, not Kochi. No single tool is "wrong"; the design has a blind spot. Steps:</p>
<ol>
<li>Open <b>Baselines</b>. Read the drifted badge on <code>bl-lat-kch-roll</code>. Compare "z against healthy reference".</li>
<li>Press the card controls: set <b>Mode</b> to <b>fixed</b> so the baseline uses the healthy reference. A longer rolling window is a weaker option: it must exceed the length of the problem and still ages out eventually.</li>
<li>Open <b>Dashboards</b>, add a Kochi latency panel to <code>d-health</code> with a warn and crit chosen from the healthy value (for example warn 60, crit 90).</li>
<li>Press <b>Apply changes</b>. The "drifted" label disappears and the abnormal badge returns.</li>
<li>Confirm with a second signal: the SLA probe or the Live tools ping to R-KCH.</li>
</ol>
<p><b>What does this change on the wire/policy?</b> Switching a baseline to fixed changes what the console treats as abnormal and what any alert that uses this baseline will fire on. The new panel only reads data. Nothing is sent to a device. The routing of notifications is unchanged unless you edit an alert rule.</p>

<h3>Case 3: the 02:00 "problem" that is a backup</h3>
<p>With the tweak <code>seasonal-backup</code> SRV-HYD utilisation rises by 45 points for one hour from 02:00 every day. A non-seasonal baseline flags it nightly. Setting Seasonality to daily compares 02:00 with earlier 02:00 readings, so the peak is normal. Switch it on, and still keep a hard limit for "very high at any hour".</p>

<h3>Dashboard design mistakes that cause tickets</h3>
<ul>
<li>nodata drawn as zero or as a flat green line.</li>
<li>Averages only, so spikes never show.</li>
<li>Thresholds inside the normal range (always amber) or far above real pain (never amber).</li>
<li>No unit, no target name on the panel title.</li>
<li>Different time windows side by side.</li>
<li>Dashboards no one owns, with stale panels for devices that no longer exist.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> (1) Restarting the poller before reading the reason code. (2) Trusting "normal" from a rolling baseline during a long problem. (3) Fixing the panel when the polling is broken. (4) Calling it a network fault when it is a backup.</p></div>
<div class="exam"><p><b>Exam trap.</b> The best evidence of drift is comparing against the healthy reference. If z against the baseline is about zero but z against the reference is large, the baseline has drifted.</p></div>

<div class="scn"><h4>The month Lucknow was blind</h4><p>A router was replaced in Lucknow and the new device used SNMP version 3, while the console still polled version 2c. Panels showed nodata. Someone set the empty panels to "show zero" to look tidy. The dashboard then said CPU 0 percent and loss 0 percent for a week. A real fault hid inside that neat green.</p><p><b>Lesson:</b> never disguise nodata; make it loud.</p></div>

<div class="iv"><p class="q">"The anomaly alert stopped firing during a long slowdown. Why?"</p><p>Strong answer: a rolling baseline drifted. After one window of bad data the bad level became the mean, so the z-score returned to normal. Fix by using a fixed baseline or a hard threshold for service levels, and by comparing against a healthy reference.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A dashboard lies by showing no data, hiding with averages, learning the problem or flagging a routine job.</li>
<li>Work in order: data, question, baseline, seasonality, second signal.</li>
<li>nodata means polling failed; read the reason on Targets.</li>
<li>Drifted baseline: switch to fixed and add a panel and a hard threshold.</li>
<li>Daily seasonality removes false alarms from scheduled jobs.</li>
</ul></div>
`,hi:`
<h3>Jab dashboard jhooth bolta hai</h3>
<p>Zyadatar monitoring tickets "network down hai" nahi hote. Woh hote hain "dashboard kuch kehta hai aur users kuch aur". Dashboard chaar tarah se jhooth bol sakta hai: woh <b>no data</b> dikhata hai, woh aisa data dikhata hai jo problem ko <b>chhupa</b> deta hai, usne problem ko normal ke roop mein <b>seekh</b> liya hai, ya woh normal pattern ko problem dikhata hai. Yeh chapter inhe alag karne ka workflow deta hai, phir lab obs-dash-3 chalata hai.</p>

<h3>Workflow</h3>
<ol>
<li><b>Data hai?</b> nodata wala panel matlab poller ko jawab nahi mila. <b>Targets</b> par jao aur reason padho: disabled, timeout, wrong-community, unknown-user, wrong-level, auth-failure ya decrypt-error. Pehle polling fix karo (module obs-snmp).</li>
<li><b>Panel sahi sawaal poochta hai?</b> Metric, target, aggregation aur window check karo. Barah ghante ka average ek ghante ka fault chhupa sakta hai; ek ghante ki window kal ka cause miss kar sakti hai.</li>
<li><b>Baseline raste mein hai?</b> <b>Baselines</b> kholo. Baseline ke against z-score ko healthy reference ke against z-score se compare karo.</li>
<li><b>Pattern seasonal hai?</b> Agar "problem" har din usi ghante par aati hai, to backup jaisi scheduled job ka shak karo, fault ka nahi.</li>
<li><b>Doosre, independent signal se confirm karo.</b> Dashboard par latency high hai? Loss, probe ya flow view check karo. Do signals ka agree karna evidence hai.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Dashboard troubleshooting flow">
<rect x="20" y="20" width="130" height="50" rx="8" fill="#bae6fd"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="12">1 Data hai?</text>
<rect x="170" y="20" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="235" y="50" text-anchor="middle" class="svg-ink" font-size="12">2 Sahi sawaal?</text>
<rect x="320" y="20" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="385" y="50" text-anchor="middle" class="svg-ink" font-size="12">3 Baseline theek?</text>
<rect x="470" y="20" width="150" height="50" rx="8" fill="#fde68a"/><text x="545" y="50" text-anchor="middle" class="svg-ink" font-size="12">4 Seasonal?</text>
<rect x="170" y="120" width="300" height="50" rx="8" fill="#fed7aa"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="12">5 Independent signal se confirm</text>
<g stroke="#64748b" stroke-width="2"><line x1="150" y1="45" x2="170" y2="45"/><line x1="300" y1="45" x2="320" y2="45"/><line x1="450" y1="45" x2="470" y2="45"/><line x1="545" y1="70" x2="470" y2="130"/></g>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">no data: polling fix   hidden: query fix   learned: baseline fix</text>
</svg><p class="cap">Dashboard ke gumrah karne ke chaar tareeke, phir proof.</p></div>

<h3>Case 1: Kochi ke liye no data</h3>
<p>Tweak <code>snmp-bad</code> ke saath console R-KCH ko community <code>GF-R0</code> (letter O ki jagah zero) se poll karta hai. Agent <code>GF-RO</code> expect karta hai. R-KCH ke panels nodata dikhate hain, jabki R-HYD aur R-LKO theek hain. Targets kholo, R-KCH ki poll community <code>GF-RO</code> karo, Apply. Yeh ticket 331020 ka example hai. Dhyan do ki nodata dikha aur imaandaar tha; dashboard ne zero nahi banaye.</p>

<h3>Case 2: lab obs-dash-3, baseline drift outage chhupata hai</h3>
<p>Scenario: Kabir Shah kehte hain ki Kochi link kai dino se slow hai. Anomaly view kehta hai sab normal hai. Network tweak <code>drift</code> ke saath bana hai: Kochi latency 900 points se normal se 70 ms upar hai, aur ek rolling baseline <code>bl-lat-kch-roll</code> maujood hai.</p>
<pre class="out">Baselines
bl-lat-kch        fixed    z = 17.5    abnormal now
bl-lat-kch-roll   rolling  window 576  z = 0.1    normal now   <span class="hl">drifted: bad state learned as normal</span>
Dashboards > d-health  p-lat-lko  latency  avg  ok
Alert rules  r-latency  latency &gt; 150 for 3 points  (Kochi is at 110, below it)</pre>
<p>Teen cheezein mil gayin: rolling baseline ne shift seekh liya, fixed alert threshold 150 ms asli degraded value 110 ms se upar hai, aur health dashboard Lucknow latency dekhta hai, Kochi ki nahi. Koi ek tool "galat" nahi; design mein blind spot hai. Steps:</p>
<ol>
<li><b>Baselines</b> kholo. <code>bl-lat-kch-roll</code> par drifted badge padho. "z against healthy reference" compare karo.</li>
<li>Card controls se <b>Mode</b> ko <b>fixed</b> karo taaki baseline healthy reference use kare. Lambi rolling window kamzor option hai: use problem ki length se badi honi chahiye aur phir bhi aakhir mein age out ho jaati hai.</li>
<li><b>Dashboards</b> kholo, <code>d-health</code> mein Kochi latency panel jodo, healthy value se chune warn aur crit ke saath (jaise warn 60, crit 90).</li>
<li><b>Apply changes</b> dabao. "drifted" label hat jaata hai aur abnormal badge wapas aata hai.</li>
<li>Doosre signal se confirm karo: SLA probe ya R-KCH par Live tools ping.</li>
</ol>
<p><b>Wire/policy par kya badalta hai?</b> Baseline ko fixed karne se badalta hai ki console kise abnormal maanta hai aur is baseline ko use karne wala koi bhi alert kis par fire hoga. Naya panel sirf data padhta hai. Device ko kuch nahi bheja jaata. Notifications ki routing tab tak same rehti hai jab tak aap alert rule edit na karo.</p>

<h3>Case 3: 02:00 ki "problem" jo backup hai</h3>
<p>Tweak <code>seasonal-backup</code> ke saath SRV-HYD utilisation har din 02:00 se ek ghante ke liye 45 points badhti hai. Non-seasonal baseline ise roz raat flag karta hai. Seasonality ko daily karne se 02:00 ko pichhle 02:00 readings se compare kiya jaata hai, to peak normal ho jaata hai. Ise on karo, aur "kisi bhi ghante par bahut high" ke liye hard limit bhi rakho.</p>

<h3>Dashboard design ki galtiyan jo tickets banati hain</h3>
<ul>
<li>nodata ko zero ya flat green line ki tarah draw karna.</li>
<li>Sirf averages, to spikes kabhi nahi dikhte.</li>
<li>Thresholds normal range ke andar (hamesha amber) ya asli dard se bahut upar (kabhi amber nahi).</li>
<li>Panel title mein unit nahi, target ka naam nahi.</li>
<li>Side by side alag time windows.</li>
<li>Aise dashboards jinka koi owner nahi, un devices ke stale panels ke saath jo ab exist nahi karte.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> (1) Reason code padhne se pehle poller restart karna. (2) Lambi problem ke dauraan rolling baseline ke "normal" par bharosa karna. (3) Polling toota ho tab panel fix karna. (4) Backup ko network fault bata dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Drift ka sabse achha saboot healthy reference se compare karna hai. Agar baseline ke against z lagbhag zero hai lekin reference ke against z bada hai, to baseline drift ho chuka hai.</p></div>

<div class="scn"><h4>Woh mahina jab Lucknow andha tha</h4><p>Lucknow mein ek router badla gaya aur naya device SNMP version 3 use karta tha, jabki console abhi bhi version 2c se poll karta tha. Panels nodata dikhate the. Kisi ne khaali panels ko tidy dikhane ke liye "show zero" kar diya. Dashboard ek hafte tak CPU 0 percent aur loss 0 percent kehta raha. Us saaf hare ke andar ek asli fault chhupa tha.</p><p><b>Seekh:</b> nodata ko kabhi chhupao mat; use loud banao.</p></div>

<div class="iv"><p class="q">"Lambi slowdown ke dauraan anomaly alert fire hona band ho gaya. Kyun?"</p><p>Strong answer: rolling baseline drift ho gaya. Ek window kharab data ke baad kharab level mean ban gaya, to z-score normal ho gaya. Service levels ke liye fixed baseline ya hard threshold use karke aur healthy reference se compare karke fix karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dashboard no data dikhakar, averages se chhupakar, problem seekhkar ya routine job flag karke jhooth bolta hai.</li>
<li>Order mein kaam karo: data, sawaal, baseline, seasonality, doosra signal.</li>
<li>nodata matlab polling fail; Targets par reason padho.</li>
<li>Drifted baseline: fixed karo aur panel aur hard threshold jodo.</li>
<li>Daily seasonality scheduled jobs ke false alarms hatati hai.</li>
</ul></div>
`}};export{e as default};