var e={id:`thresholds-duration-dedupe-and-routing`,h:{en:`Thresholds, duration, dedupe and routing`,hi:`Thresholds, duration, dedupe aur routing`},body:{en:`
<h3>The anatomy of one rule</h3>
<p>An alert rule is a sentence: "when this metric on this target is beyond this limit for this long, tell this person at this level of urgency, but do not repeat yourself for a while." Every part of the sentence is a field in the Alert rules page. In this chapter we build one from scratch, which is lab <b>obs-alert-1</b>: an alert rule with a duration and routing.</p>
<table class="cmp"><tr><th>Field</th><th>Plain meaning</th><th>Example</th></tr>
<tr><td>Metric and Target</td><td>What we watch and where; target can be <code>any</code></td><td>latency on R-KCH</td></tr>
<tr><td>Operator and Threshold</td><td>The limit</td><td>&gt; 150 (ms)</td></tr>
<tr><td>For (points)</td><td>How many consecutive samples must be true</td><td>6 (one point is 5 minutes, so 30 minutes)</td></tr>
<tr><td>Severity</td><td>How urgent</td><td>warning</td></tr>
<tr><td>Dedupe window (points)</td><td>Silence after a notification for the same rule and target</td><td>12 (one hour)</td></tr>
<tr><td>Route</td><td>Who is told, and how</td><td>rt-chat</td></tr>
</table>

<h3>For-duration: ignore the blip</h3>
<p>Networks blip. A single sample at 95 percent CPU during a backup is normal; ten minutes at 95 is a problem. The <b>for-duration</b> makes the rule wait: it fires only after the condition has been true for that many consecutive points. In the console, one point is five minutes, so 12 points are one hour and 288 are a day. A short duration reacts fast but flaps; a long one is calm but late. Pick it from the cost of being late. A dead link should fire in 10 to 15 minutes; a slowly growing memory leak can wait an hour or two.</p>

<h3>Hysteresis: do not flap at the edge</h3>
<p><b>Hysteresis</b> means using two different limits for "raise" and "clear". Imagine a thermostat that switches the heater on at 18 degrees and off at 22. Without the gap, a value hovering at 90 would raise, clear, raise and clear all night. The console keeps this simple: the for-duration on the way in and the dedupe window on the way out act together as a cheap hysteresis. In real products you will often find an explicit "recover below" value. Same idea.</p>

<h3>Dedupe and grouping: one problem, one message</h3>
<p><b>Dedupe</b> (de-duplication) means that once a notification has been sent for a rule and a target, further notifications for the same pair are held back for the dedupe window. A value of 0 means every episode notifies. <b>Grouping</b> means that when five routers raise the same symptom because one upstream circuit failed, the people get one message about the incident, not five. The console's dedupe is per rule and per target, so grouping across targets is a design choice: prefer an alert on the cause (the circuit) over alerts on every symptom.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="For-duration and dedupe on a timeline">
<line x1="30" y1="150" x2="620" y2="150" stroke="#64748b" stroke-width="2"/>
<path d="M30 140 L90 138 L130 60 L150 140 L200 138 L240 60 L330 58 L400 62 L440 140 L520 60 L560 140" fill="none" stroke="#ea5d0c" stroke-width="2"/>
<line x1="30" y1="60" x2="620" y2="60" stroke="#64748b" stroke-dasharray="5 4"/>
<text x="34" y="52" class="svg-muted" font-size="12">threshold</text>
<rect x="240" y="165" width="160" height="18" rx="4" fill="#fde68a"/><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="12">true for N points: FIRES</text>
<rect x="400" y="165" width="130" height="18" rx="4" fill="#bbf7d0"/><text x="465" y="178" text-anchor="middle" class="svg-ink" font-size="12">dedupe: silent</text>
<text x="140" y="45" text-anchor="middle" class="svg-ink" font-size="12">blip, ignored</text>
</svg><p class="cap">Short spikes are ignored; a long breach fires once; later breaches inside the dedupe window stay quiet.</p></div>

<h3>Routing and escalation</h3>
<p>The Route field names a route from the On-call routing page. A route has a channel (<code>pager</code>, <code>chat</code>, <code>email</code> or <code>none</code>), a contact and a list of severities it carries. <b>The rule's severity must be in the route's list.</b> If it is not, the console delivers to channel none, which means nobody is told. This is the quietest bug in alerting.</p>
<p>The page also holds the on-call rota: primary <b>Priya Nair</b>, secondary <b>Ravi Menon</b> and <b>escalate after 15 minutes</b>. Escalation means that if the primary does not acknowledge within that time, the secondary is paged. Without escalation, one sleeping phone is a single point of failure.</p>

<h3>Maintenance silences</h3>
<p>When Kabir Shah upgrades the Lucknow router at night, alerts for that router are expected. A <b>maintenance silence</b> mutes chosen rules and targets for a stated window, with an owner and an end time. Never solve this by disabling the rule and forgetting it; the silence must expire by itself. In the simulator you will simulate this thinking with the Enabled toggle on a rule, but the habit to learn is: write the window down, and switch it back on.</p>

<h3>Worked walkthrough: lab obs-alert-1</h3>
<p>Open Alert rules, press <b>Add rule</b>, then fill the card.</p>
<ol>
<li>Metric latency, target R-KCH, operator &gt;, threshold 150. <i>What does this change on the wire/policy?</i> Nothing on the wire: the console already receives latency from probes and polls, and now compares it to 150.</li>
<li>For 6 points (30 minutes), severity warning, dedupe 12. This changes how often a human is interrupted, not what is measured.</li>
<li>Route rt-chat, which carries warning. If you picked rt-pager here, the page would show Delivered as <code>none</code> in the "Who is told, rule by rule" table.</li>
<li>Check the preview counters, then press Apply in the commit bar.</li>
</ol>
<pre class="out">Who is told, rule by rule (after Apply)
Rule               Severity   Route      Delivered as   Per week
r-latency-kch      warning    rt-chat    chat               2
r-cpu              critical   rt-pager   pager              1
r-wrong            warning    rt-pager   <span class="hl">none</span>               4</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) For-duration of 1 point on a spiky metric. (2) Dedupe 0 on a rule that stays true for hours. (3) A pager route that does not carry the rule's severity. (4) Pressing Apply and forgetting that edits before Apply are only a draft; the checks read the applied state.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which setting stops repeated messages for one long problem?" is dedupe, not for-duration. For-duration filters short spikes before the first message.</p></div>

<div class="scn"><h4>The page that went nowhere</h4><p>Meena Iyer created a critical packet-loss rule for Lucknow and tested it with a fault. The rule showed firing, yet nobody was woken. The rule pointed to rt-chat, which carries only warning and info, so delivery was none. She changed the route to rt-pager, applied, and the table showed pager.</p><p><b>Lesson:</b> test the whole chain, not only the rule.</p></div>

<div class="iv"><p class="q">"How do you stop an alert from flapping?"</p><p>Use a for-duration so short spikes are ignored, a dedupe window so one long episode produces one message, and hysteresis (a separate recover level) where the tool supports it. Mention choosing the duration by the cost of being late.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A rule is metric, target, limit, for-duration, severity, dedupe and route.</li>
<li>One point is 5 minutes in the console; 12 points are an hour.</li>
<li>For-duration filters blips; dedupe stops repeats; hysteresis stops flapping.</li>
<li>The route must carry the rule's severity or delivery is none.</li>
<li>Escalation (15 minutes to the secondary) removes the single sleeping phone.</li>
</ul></div>
`,hi:`
<h3>Ek rule ki anatomy</h3>
<p>Alert rule ek sentence hai: "jab is target ka yeh metric is limit ke paar rahe itni der tak, to is insaan ko is urgency ke saath batao, lekin kuch der tak khud ko repeat mat karo." Sentence ka har hissa Alert rules page ka ek field hai. Is chapter mein hum ek rule zero se banate hain, yaani lab <b>obs-alert-1</b>: duration aur routing ke saath alert rule.</p>
<table class="cmp"><tr><th>Field</th><th>Seedha matlab</th><th>Example</th></tr>
<tr><td>Metric aur Target</td><td>Kya dekhte hain aur kahan; target <code>any</code> ho sakta hai</td><td>R-KCH par latency</td></tr>
<tr><td>Operator aur Threshold</td><td>Limit</td><td>&gt; 150 (ms)</td></tr>
<tr><td>For (points)</td><td>Kitne consecutive samples true hone chahiye</td><td>6 (ek point 5 minute, to 30 minute)</td></tr>
<tr><td>Severity</td><td>Kitna urgent</td><td>warning</td></tr>
<tr><td>Dedupe window (points)</td><td>Notification ke baad same rule aur target ke liye chuppi</td><td>12 (ek ghanta)</td></tr>
<tr><td>Route</td><td>Kise batana hai, aur kaise</td><td>rt-chat</td></tr>
</table>

<h3>For-duration: blip ko ignore karo</h3>
<p>Networks mein blips aate hain. Backup ke dauraan ek sample 95 percent CPU normal hai; das minute 95 par rehna problem hai. <b>For-duration</b> rule ko rukwata hai: woh tabhi fire karta hai jab condition itne consecutive points tak true rahe. Console mein ek point paanch minute ka hai, to 12 points ek ghanta aur 288 ek din. Chhota duration jaldi react karta hai lekin flap karta hai; lamba shaant hai lekin late. Duration late hone ki keemat se chuno. Dead link 10 se 15 minute mein fire hona chahiye; dheere badhta memory leak ek do ghante ruk sakta hai.</p>

<h3>Hysteresis: edge par flap mat karo</h3>
<p><b>Hysteresis</b> matlab "raise" aur "clear" ke liye do alag limits. Aisa thermostat socho jo heater 18 degree par on aur 22 par off karta hai. Gap ke bina 90 ke aaspaas ghoomta value poori raat raise, clear, raise, clear karta rahega. Console ise simple rakhta hai: andar aate waqt for-duration aur bahar jaate waqt dedupe window milkar sasti hysteresis ka kaam karte hain. Asli products mein aksar explicit "recover below" value milti hai. Idea wahi hai.</p>

<h3>Dedupe aur grouping: ek problem, ek message</h3>
<p><b>Dedupe</b> (de-duplication) ka matlab hai ki rule aur target ke liye ek notification jaane ke baad usi jodi ke aur notifications dedupe window tak roke jaate hain. 0 ka matlab har episode notify karta hai. <b>Grouping</b> ka matlab hai ki jab ek upstream circuit fail hone se paanch routers wahi symptom raise karein, to logon ko incident ka ek message mile, paanch nahi. Console ka dedupe rule aur target ke hisaab se hai, to targets ke beech grouping ek design choice hai: har symptom par alert ke bajaye cause (circuit) par alert pasand karo.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Timeline par for-duration aur dedupe">
<line x1="30" y1="150" x2="620" y2="150" stroke="#64748b" stroke-width="2"/>
<path d="M30 140 L90 138 L130 60 L150 140 L200 138 L240 60 L330 58 L400 62 L440 140 L520 60 L560 140" fill="none" stroke="#ea5d0c" stroke-width="2"/>
<line x1="30" y1="60" x2="620" y2="60" stroke="#64748b" stroke-dasharray="5 4"/>
<text x="34" y="52" class="svg-muted" font-size="12">threshold</text>
<rect x="240" y="165" width="160" height="18" rx="4" fill="#fde68a"/><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="12">N points true: FIRE</text>
<rect x="400" y="165" width="130" height="18" rx="4" fill="#bbf7d0"/><text x="465" y="178" text-anchor="middle" class="svg-ink" font-size="12">dedupe: chup</text>
<text x="140" y="45" text-anchor="middle" class="svg-ink" font-size="12">blip, ignore</text>
</svg><p class="cap">Chhote spikes ignore hote hain; lamba breach ek baar fire karta hai; dedupe window ke andar baad ke breaches chup rehte hain.</p></div>

<h3>Routing aur escalation</h3>
<p>Route field On-call routing page ka ek route naam se leta hai. Route ke paas channel (<code>pager</code>, <code>chat</code>, <code>email</code> ya <code>none</code>), contact aur severities ki list hoti hai jo woh carry karta hai. <b>Rule ki severity route ki list mein honi chahiye.</b> Agar nahi hai to console channel none ko deliver karta hai, yaani kisi ko nahi bataya jaata. Alerting ka sabse chupchaap bug yehi hai.</p>
<p>Page par on-call rota bhi hai: primary <b>Priya Nair</b>, secondary <b>Ravi Menon</b> aur <b>escalate after 15 minutes</b>. Escalation ka matlab hai ki agar primary itne time mein acknowledge na kare to secondary ko page jaata hai. Escalation ke bina ek soya hua phone single point of failure hai.</p>

<h3>Maintenance silences</h3>
<p>Jab Kabir Shah raat ko Lucknow router upgrade karta hai, us router ke alerts expected hain. <b>Maintenance silence</b> chune hue rules aur targets ko batayi hui window ke liye mute karta hai, owner aur end time ke saath. Isse rule disable karke bhool jaane se kabhi solve mat karo; silence apne aap expire hona chahiye. Simulator mein aap rule ke Enabled toggle se yeh sochoge, lekin seekhne ki aadat hai: window likho, aur wapas on karo.</p>

<h3>Worked walkthrough: lab obs-alert-1</h3>
<p>Alert rules kholo, <b>Add rule</b> dabao, phir card bharo.</p>
<ol>
<li>Metric latency, target R-KCH, operator &gt;, threshold 150. <i>Wire/policy par kya badalta hai?</i> Wire par kuch nahi: console ko latency pehle se probes aur polls se mil rahi hai, ab woh use 150 se compare karta hai.</li>
<li>For 6 points (30 minute), severity warning, dedupe 12. Yeh badalta hai ki insaan kitni baar interrupt hota hai, kya measure hota hai nahi.</li>
<li>Route rt-chat, jo warning carry karta hai. Agar yahan rt-pager chunte, to "Who is told, rule by rule" table mein Delivered as <code>none</code> dikhta.</li>
<li>Preview counters dekho, phir commit bar mein Apply dabao.</li>
</ol>
<pre class="out">Who is told, rule by rule (after Apply)
Rule               Severity   Route      Delivered as   Per week
r-latency-kch      warning    rt-chat    chat               2
r-cpu              critical   rt-pager   pager              1
r-wrong            warning    rt-pager   <span class="hl">none</span>               4</pre>

<div class="warn"><p><b>Common galtiyan.</b> (1) Spiky metric par for-duration 1 point. (2) Jo rule ghanton true rehta hai uspar dedupe 0. (3) Pager route jo rule ki severity carry nahi karta. (4) Apply dabake bhool jaana ki Apply se pehle ke edits sirf draft hain; checks applied state padhte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Ek lambi problem ke repeated messages kaun si setting rokti hai?" jawab dedupe hai, for-duration nahi. For-duration pehle message se pehle chhote spikes filter karta hai.</p></div>

<div class="scn"><h4>Woh page jo kahin nahi gaya</h4><p>Meena Iyer ne Lucknow ke liye critical packet-loss rule banaya aur fault laga ke test kiya. Rule firing dikha, phir bhi kisi ko jagaya nahi gaya. Rule rt-chat par point kar raha tha jo sirf warning aur info carry karta hai, to delivery none thi. Usne route rt-pager kiya, apply kiya, aur table mein pager dikha.</p><p><b>Seekh:</b> poori chain test karo, sirf rule nahi.</p></div>

<div class="iv"><p class="q">"Alert flapping kaise rokte ho?"</p><p>For-duration se chhote spikes ignore, dedupe window se ek lambe episode ka ek message, aur jahan tool support kare wahan hysteresis (alag recover level). Batao ki duration late hone ki keemat se chunte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rule matlab metric, target, limit, for-duration, severity, dedupe aur route.</li>
<li>Console mein ek point 5 minute hai; 12 points ek ghanta.</li>
<li>For-duration blips filter karta hai; dedupe repeats rokta hai; hysteresis flapping rokti hai.</li>
<li>Route ko rule ki severity carry karni chahiye warna delivery none hai.</li>
<li>Escalation (15 minute baad secondary) soye hue phone ko single point of failure nahi rehne deta.</li>
</ul></div>
`}};export{e as default};