var e={id:`what-an-alert-is-for`,h:{en:`What an alert is for`,hi:`Alert kis liye hota hai`},body:{en:`
<h3>What you will learn</h3>
<p>Click-ops, but you understand what each click does. That is the promise of the console you use in this module. By the end you will be able to say what an alert is for, build an alert rule with a duration and a route, calm a noisy rule, set up SLA probes and spot a probe that lies. <b>Prerequisites:</b> the obs-start and obs-dash modules (metrics, the console, dashboards, baselines). You do not need CLI skills here; every lab happens in the observability console of Godavari Foods, our invented company with sites in Hyderabad, Kochi and Lucknow.</p>
<p><b>Scope:</b> everything is simulated. The console, the alert evaluation and the probes are teaching models with deterministic numbers. We do not name any vendor product, and exact menu paths in a real product will differ.</p>

<h3>The big picture: a smoke alarm, not a diary</h3>
<p>Think of the smoke alarm in your kitchen. It does not ring because the toaster is warm. It rings when there is smoke, loud enough to wake you, and it is your flat, so you know it is yours to handle. A diary, on the other hand, records everything and nobody reads it at 3 a.m. A dashboard is a diary you can read when you choose. An <b>alert</b> is the smoke alarm: it interrupts a human. Because interrupting a human is expensive, every alert must earn that interruption.</p>

<h3>The three tests of a good alert</h3>
<p>Before you create any rule, ask three questions.</p>
<ul>
<li><b>Actionable:</b> is there something a person can do right now? If the answer is "just look", it belongs on a dashboard.</li>
<li><b>Urgent:</b> does it need action now, or can it wait until morning? Urgent goes to a pager. The rest goes to chat or email.</li>
<li><b>Owned:</b> does a named person or team receive it? An alert sent to nobody is a log line with extra steps.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="From signal to person">
<rect x="10" y="40" width="120" height="70" rx="10" fill="#bae6fd"/><text x="70" y="70" text-anchor="middle" class="svg-ink" font-size="13">Signal</text><text x="70" y="90" text-anchor="middle" class="svg-muted" font-size="12">util, cpu, loss</text>
<rect x="170" y="40" width="120" height="70" rx="10" fill="#fde68a"/><text x="230" y="70" text-anchor="middle" class="svg-ink" font-size="13">Rule</text><text x="230" y="90" text-anchor="middle" class="svg-muted" font-size="12">limit + for-time</text>
<rect x="330" y="40" width="120" height="70" rx="10" fill="#ddd6fe"/><text x="390" y="70" text-anchor="middle" class="svg-ink" font-size="13">Route</text><text x="390" y="90" text-anchor="middle" class="svg-muted" font-size="12">severity picks it</text>
<rect x="490" y="40" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="560" y="70" text-anchor="middle" class="svg-ink" font-size="13">Owner</text><text x="560" y="90" text-anchor="middle" class="svg-muted" font-size="12">Priya, then Ravi</text>
<line x1="130" y1="75" x2="170" y2="75" stroke="#64748b" stroke-width="2"/><line x1="290" y1="75" x2="330" y2="75" stroke="#64748b" stroke-width="2"/><line x1="450" y1="75" x2="490" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">an alert is the whole chain, not only the rule</text>
</svg><p class="cap">A signal becomes an alert only when a rule fires and a route reaches an owner.</p></div>

<h3>Alert, dashboard, log: three different jobs</h3>
<table class="cmp"><tr><th>Tool</th><th>Who starts it</th><th>Best for</th></tr>
<tr><td>Dashboard</td><td>A person, when curious</td><td>Understanding, trends, daily checks</td></tr>
<tr><td>Log search</td><td>A person, during a ticket</td><td>Detail: what exactly happened</td></tr>
<tr><td>Alert</td><td>The system, unprompted</td><td>Telling a person something needs action</td></tr>
</table>

<h3>Fixed thresholds and baselines</h3>
<p>A <b>threshold</b> rule says "CPU above 90". It is simple and easy to explain, so start there. A <b>baseline</b> rule says "latency is far from what is normal for this time". It adapts to busy and quiet hours, but you must trust the baseline (you met drift in the dashboards module). In the console, an alert rule has a threshold and a field called "Sigma from baseline"; 0 means use the plain threshold, a number above 0 means "that many standard deviations away from the named baseline". Prefer thresholds for hard limits (disk full, link down) and baselines for things that swing daily.</p>

<h3>Severity decides who is interrupted</h3>
<p>Severity has three levels in the console: <code>critical</code>, <code>warning</code> and <code>info</code>. Rough meaning: critical means customers or revenue are hurt now, warning means it will become critical if nobody acts, info means good to know. Severity is not a mood; it is a routing key. The seeded routes show this: <code>rt-pager</code> carries critical, <code>rt-chat</code> (channel #network-ops) carries warning and info, <code>rt-email</code> carries all, and <code>rt-none</code> sends nowhere.</p>

<h3>Tour of the Alert rules page</h3>
<p>Open Alert rules in the left menu. Each rule is a card with a severity badge and a number "n / week", the notifications that rule would have produced in the last week. At the top you see two counters, notifications per week and pages per week, once for the applied state and once for "after Apply". The second pair is your preview: you can change a rule and see the effect before it goes live. Changes are saved to the candidate and go live only when you press Apply in the commit bar.</p>
<pre class="out">Alert rules                      applied      after Apply
Notifications per week              7              7
Pages per week                      2              2
r-cpu      critical  rt-pager   cpu  &gt; 90 for 3    1 / week
r-util     warning   rt-chat    util &gt; 90 for 3    3 / week
r-latency  warning   rt-chat    lat  &gt; 150 for 3   <span class="hl">2 / week</span>
r-loss     critical  rt-pager   loss &gt; 2 for 3     1 / week
r-mem      warning   rt-chat    mem  &gt; 92 for 6    0 / week</pre>

<div class="note"><p><b>What does this change on the wire/policy?</b> Reading this page changes nothing. Editing a rule changes only what the console does after it evaluates metrics it already collects: no packet is sent to any router. The visible effect is who gets a message and when. Apply changes the live evaluation; until then your edits are a draft.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Alerting on every metric because it is available. (2) Setting severity critical to "make sure someone looks". (3) Creating a rule with no route or a route that does not carry that severity: the console delivers it to channel none and nobody hears it.</p></div>
<div class="exam"><p><b>Exam trap.</b> An alert that fires but notifies nobody is still a failed alert. Question wording like "the rule fired yet no one was told" points to routing, not to the threshold.</p></div>

<div class="scn"><h4>The dashboard that nobody opened</h4><p>At Godavari Foods, Kochi latency crept up over three days. It was visible on the health dashboard, but nobody looks at dashboards on Saturday. On Monday the ERP team complained. The fix was not a better dashboard; it was one rule: latency above 150 ms for 15 minutes, warning, to the chat route, with Priya Nair as owner.</p><p><b>Lesson:</b> dashboards are for looking, alerts are for being told.</p></div>

<div class="iv"><p class="q">"What makes a good alert?"</p><p>It is actionable, urgent enough to interrupt a person, and owned by someone named. Mention that severity maps to a route, that every alert should link to a runbook, and that anything non-urgent belongs on a dashboard or a daily report.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An alert interrupts a human, so it must be actionable, urgent and owned.</li>
<li>Dashboards are for looking; alerts are for being told.</li>
<li>Thresholds suit hard limits; baselines suit daily swings.</li>
<li>Severity is a routing key: critical to pager, warning to chat.</li>
<li>The Alert rules page shows per-rule weekly counts and a before-and-after preview.</li>
</ul></div>
`,hi:`
<h3>Is module mein aap kya seekhoge</h3>
<p>Click-ops, but you understand what each click does. Yehi is module ke console ka vaada hai. Module ke end tak aap bata paoge ki alert kis liye hota hai, duration aur route ke saath alert rule banaoge, noisy rule ko shaant karoge, SLA probes set karoge aur jhooth bolne wala probe pakdoge. <b>Prerequisites:</b> obs-start aur obs-dash modules (metrics, console, dashboards, baselines). Yahan CLI skills nahi chahiye; har lab Godavari Foods ke observability console mein hota hai, hamari banayi hui company jiske sites Hyderabad, Kochi aur Lucknow mein hain.</p>
<p><b>Scope:</b> sab kuch simulated hai. Console, alert evaluation aur probes teaching models hain jinke numbers deterministic hain. Hum kisi vendor product ka naam nahi lete, aur asli product mein menu paths alag honge.</p>

<h3>Badi tasveer: smoke alarm, diary nahi</h3>
<p>Apne kitchen ka smoke alarm socho. Woh isliye nahi bajta ki toaster garam hai. Woh tab bajta hai jab dhuan ho, itna loud ki aap jaag jao, aur woh aapka ghar hai to aapko pata hai ki sambhalna aapko hai. Diary sab kuch likhti hai aur raat 3 baje use koi nahi padhta. Dashboard aisi diary hai jo aap jab chaho padh sakte ho. <b>Alert</b> smoke alarm hai: woh insaan ko interrupt karta hai. Insaan ko interrupt karna mehnga hai, isliye har alert ko apna interruption kamaana padta hai.</p>

<h3>Achhe alert ke teen tests</h3>
<p>Koi bhi rule banane se pehle teen sawal poochho.</p>
<ul>
<li><b>Actionable:</b> kya koi abhi kuch kar sakta hai? Agar jawab "bas dekhna hai" hai, to woh dashboard par jaata hai.</li>
<li><b>Urgent:</b> kya abhi action chahiye ya subah tak ruk sakta hai? Urgent pager par jaata hai. Baaki chat ya email par.</li>
<li><b>Owned:</b> kya kisi named insaan ya team ko milta hai? Jo alert kisi ko nahi jaata woh extra steps wali log line hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Signal se insaan tak">
<rect x="10" y="40" width="120" height="70" rx="10" fill="#bae6fd"/><text x="70" y="70" text-anchor="middle" class="svg-ink" font-size="13">Signal</text><text x="70" y="90" text-anchor="middle" class="svg-muted" font-size="12">util, cpu, loss</text>
<rect x="170" y="40" width="120" height="70" rx="10" fill="#fde68a"/><text x="230" y="70" text-anchor="middle" class="svg-ink" font-size="13">Rule</text><text x="230" y="90" text-anchor="middle" class="svg-muted" font-size="12">limit + for-time</text>
<rect x="330" y="40" width="120" height="70" rx="10" fill="#ddd6fe"/><text x="390" y="70" text-anchor="middle" class="svg-ink" font-size="13">Route</text><text x="390" y="90" text-anchor="middle" class="svg-muted" font-size="12">severity chunti hai</text>
<rect x="490" y="40" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="560" y="70" text-anchor="middle" class="svg-ink" font-size="13">Owner</text><text x="560" y="90" text-anchor="middle" class="svg-muted" font-size="12">Priya, phir Ravi</text>
<line x1="130" y1="75" x2="170" y2="75" stroke="#64748b" stroke-width="2"/><line x1="290" y1="75" x2="330" y2="75" stroke="#64748b" stroke-width="2"/><line x1="450" y1="75" x2="490" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">alert poori chain hai, sirf rule nahi</text>
</svg><p class="cap">Signal tabhi alert banta hai jab rule fire ho aur route owner tak pahunche.</p></div>

<h3>Alert, dashboard, log: teen alag kaam</h3>
<table class="cmp"><tr><th>Tool</th><th>Kaun shuru karta hai</th><th>Kis ke liye best</th></tr>
<tr><td>Dashboard</td><td>Insaan, jab curious ho</td><td>Samajhna, trends, daily checks</td></tr>
<tr><td>Log search</td><td>Insaan, ticket ke dauraan</td><td>Detail: exactly kya hua</td></tr>
<tr><td>Alert</td><td>System, bina poochhe</td><td>Insaan ko batana ki action chahiye</td></tr>
</table>

<h3>Fixed thresholds aur baselines</h3>
<p><b>Threshold</b> rule kehta hai "CPU 90 se upar". Yeh simple hai aur samjhana aasaan, isliye yahin se shuru karo. <b>Baseline</b> rule kehta hai "latency is time ke normal se bahut door hai". Yeh busy aur quiet ghanton ke hisaab se adapt hota hai, lekin baseline par bharosa hona chahiye (drift aap dashboards module mein dekh chuke ho). Console mein alert rule ka ek threshold hota hai aur ek field "Sigma from baseline"; 0 matlab plain threshold, 0 se bada number matlab "named baseline se utne standard deviations door". Hard limits (disk full, link down) ke liye threshold, jo roz upar neeche hota hai uske liye baseline.</p>

<h3>Severity decide karti hai kise interrupt karna hai</h3>
<p>Console mein severity ke teen levels hain: <code>critical</code>, <code>warning</code> aur <code>info</code>. Mota matlab: critical yaani customers ya revenue abhi hurt ho raha hai, warning yaani agar kisi ne action nahi liya to critical ban jaayega, info yaani jaanna achha hai. Severity mood nahi hai; woh routing key hai. Seeded routes yeh dikhate hain: <code>rt-pager</code> critical carry karta hai, <code>rt-chat</code> (channel #network-ops) warning aur info, <code>rt-email</code> sab, aur <code>rt-none</code> kahin nahi bhejta.</p>

<h3>Alert rules page ka tour</h3>
<p>Left menu mein Alert rules kholo. Har rule ek card hai jisme severity badge aur number "n / week" hai, yaani us rule ne pichhle hafte mein kitne notifications banaye hote. Upar do counters hain, notifications per week aur pages per week, ek baar applied state ke liye aur ek baar "after Apply" ke liye. Doosri jodi aapka preview hai: rule badlo aur live jaane se pehle effect dekho. Changes candidate mein save hote hain aur commit bar mein Apply dabane par hi live hote hain.</p>
<pre class="out">Alert rules                      applied      after Apply
Notifications per week              7              7
Pages per week                      2              2
r-cpu      critical  rt-pager   cpu  &gt; 90 for 3    1 / week
r-util     warning   rt-chat    util &gt; 90 for 3    3 / week
r-latency  warning   rt-chat    lat  &gt; 150 for 3   <span class="hl">2 / week</span>
r-loss     critical  rt-pager   loss &gt; 2 for 3     1 / week
r-mem      warning   rt-chat    mem  &gt; 92 for 6    0 / week</pre>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Yeh page padhne se kuch nahi badalta. Rule edit karne se sirf wahi badalta hai jo console un metrics ke saath karta hai jo woh pehle se collect kar raha hai: kisi router ko koi packet nahi jaata. Dikhne wala effect hai ki kise message milta hai aur kab. Apply live evaluation badalta hai; tab tak aapke edits draft hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Har metric par alert lagana kyunki woh available hai. (2) "Pakka koi dekhe" ke liye severity critical kar dena. (3) Bina route ka rule ya aisa route jo us severity ko carry nahi karta: console use channel none ko deliver karta hai aur kisi ko pata nahi chalta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jo alert fire hua lekin kisi ko notify nahi kiya, woh bhi failed alert hai. "Rule fire hua phir bhi kisi ko nahi bataya" jaisa wording threshold nahi, routing ki taraf ishara karta hai.</p></div>

<div class="scn"><h4>Woh dashboard jo kisi ne nahi kholi</h4><p>Godavari Foods mein Kochi ki latency teen din mein dheere dheere badhi. Health dashboard par dikh rahi thi, lekin Saturday ko dashboard koi nahi dekhta. Monday ko ERP team ne complain kiya. Fix behtar dashboard nahi tha; ek rule tha: latency 150 ms se upar 15 minute tak, warning, chat route par, owner Priya Nair.</p><p><b>Seekh:</b> dashboards dekhne ke liye hain, alerts batane ke liye.</p></div>

<div class="iv"><p class="q">"Achha alert kya banata hai?"</p><p>Woh actionable hota hai, itna urgent ki insaan ko interrupt kare, aur kisi named insaan ka owned hota hai. Batao ki severity route se map hoti hai, har alert ke saath runbook link hona chahiye, aur jo urgent nahi woh dashboard ya daily report par jaata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Alert insaan ko interrupt karta hai, isliye actionable, urgent aur owned hona chahiye.</li>
<li>Dashboards dekhne ke liye hain; alerts batane ke liye.</li>
<li>Threshold hard limits ke liye; baseline daily swings ke liye.</li>
<li>Severity routing key hai: critical pager par, warning chat par.</li>
<li>Alert rules page rule ke hisaab se weekly counts aur before-after preview dikhata hai.</li>
</ul></div>
`}};export{e as default};