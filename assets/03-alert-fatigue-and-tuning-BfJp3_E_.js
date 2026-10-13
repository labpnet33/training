var e={id:`alert-fatigue-and-tuning`,h:{en:`Alert fatigue and tuning`,hi:`Alert fatigue aur tuning`},body:{en:`
<h3>The boy who cried wolf, with pagers</h3>
<p>In the old story, the shepherd boy shouted "wolf" so often that when the wolf really came, nobody ran. <b>Alert fatigue</b> is the same story in an operations room. When a team receives hundreds of alerts and most need no action, people start to mute the channel, swipe the notification away, or answer "probably nothing". The one alert that matters is then buried. Fatigue is not a character flaw of the on-call engineer; it is a defect in the alerting design.</p>

<h3>Symptoms of fatigue</h3>
<ul>
<li>The pager rings more than a few times a week and most pages end with "no action needed".</li>
<li>People acknowledge without looking, or the chat channel is muted.</li>
<li>The same alert fires every night at the same hour (a pattern, so a design problem).</li>
<li>A real outage is first reported by users, not by the alerts.</li>
<li>Nobody can say why a given rule exists or what to do when it fires.</li>
</ul>

<h3>Measure first: alerts per week</h3>
<p>You cannot tune what you do not count. The console gives two numbers on the Alert rules and Alerts and audit pages: <b>notifications per week</b> and <b>pages per week</b>. A page is a notification on the pager channel, the one that wakes or interrupts a person. A useful rule of thumb is that an on-call person should get only a handful of pages in a week, and each should need action. The Alerts and audit page also has a bar chart, notifications per rule this week. The tallest bar is your first suspect, because alert volume follows the Pareto rule: a few rules make most of the noise.</p>
<pre class="out">Notifications per rule this week
r-noisy     <span class="hl">################################  312</span>
r-util      ##   3
r-latency   #    2
r-cpu       #    1
r-loss      #    1
Notifications / week   319     Pager   313     Chat / email / none   6 / 0 / 0</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Tuning loop">
<rect x="20" y="30" width="130" height="60" rx="10" fill="#bae6fd"/><text x="85" y="65" text-anchor="middle" class="svg-ink" font-size="13">1 Measure</text>
<rect x="180" y="30" width="130" height="60" rx="10" fill="#fde68a"/><text x="245" y="65" text-anchor="middle" class="svg-ink" font-size="13">2 Find top rule</text>
<rect x="340" y="30" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="405" y="65" text-anchor="middle" class="svg-ink" font-size="13">3 Change one thing</text>
<rect x="500" y="30" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="560" y="65" text-anchor="middle" class="svg-ink" font-size="13">4 Preview, Apply</text>
<line x1="150" y1="60" x2="180" y2="60" stroke="#64748b" stroke-width="2"/><line x1="310" y1="60" x2="340" y2="60" stroke="#64748b" stroke-width="2"/><line x1="470" y1="60" x2="500" y2="60" stroke="#64748b" stroke-width="2"/>
<path d="M560 90 L560 150 L85 150 L85 90" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="320" y="172" text-anchor="middle" class="svg-muted" font-size="12">repeat weekly until pages are few and all need action</text>
</svg><p class="cap">Tuning is a loop, not a one-time clean-up.</p></div>

<h3>The tuning steps, in order</h3>
<ol>
<li><b>Does it need a human at all?</b> If no, delete the alert or move it to a dashboard or daily report.</li>
<li><b>Raise the threshold</b> to a level that means harm. 50 percent utilisation is not harm; 90 percent might be.</li>
<li><b>Add a for-duration</b> so blips are ignored (1 point becomes 6 points, thirty minutes).</li>
<li><b>Add dedupe</b> so one episode gives one message (0 becomes 48 points, four hours).</li>
<li><b>Lower the severity</b> if it is not an emergency, and <b>route</b> it to chat instead of the pager.</li>
<li><b>Write a runbook</b> link for every rule that stays.</li>
</ol>
<p>Change one rule at a time, preview, apply, and watch next week's number.</p>

<h3>Worked walkthrough: lab obs-alert-2</h3>
<p>The ticket says the on-call is being paged all week. The seed has a rule named <code>r-noisy</code>: utilisation greater than 50, for 1 point, dedupe 0, critical, route rt-pager. On the Alert rules page its card shows hundreds of notifications a week.</p>
<ol>
<li>Open the r-noisy card. Set <b>Threshold 75</b>, <b>For 6</b>, <b>Dedupe 48</b>.</li>
<li>Set <b>Severity warning</b> and <b>Route rt-chat</b>. <i>What does this change on the wire/policy?</i> Nothing on the network. It changes who is interrupted: the pager stops, a chat message replaces it.</li>
<li>Read "After Apply: notifications" and "After Apply: pages" before you commit. Aim for under 20 notifications and 0 pages for this rule.</li>
<li>Press Apply. The applied counters now match the preview.</li>
</ol>
<p>Notice what we did not do: we did not delete the rule. Utilisation above 75 for half an hour is still worth knowing, just not at 3 a.m.</p>

<h3>Runbooks: an alert should come with instructions</h3>
<p>A <b>runbook</b> is a short page that says: what this alert means, how to check it (which dashboard, which Live tool), the usual causes, the first safe action, and whom to call next. If you cannot write the runbook, the alert is probably not actionable. Runbooks also let a new engineer handle a page at night without waking the expert.</p>

<h3>SLIs, SLOs and error budgets, gently</h3>
<p>Instead of alerting on many causes, alert on what users feel. An <b>SLI</b> (service level indicator) is a measured number about the user's experience, for example "percentage of ERP requests from Kochi answered in under 100 ms". An <b>SLO</b> (objective) is the target for that number, for example 99 percent over 30 days. The <b>error budget</b> is the room left for failure: 1 percent of 30 days is about 7 hours. Alert when the budget is being burned too fast, not whenever one router sneezes. This is gentler on people and closer to what the business cares about. An SLA is the promise made to a customer, often with a penalty; the SLO is your internal target, set stricter than the SLA.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Tuning by disabling every noisy rule, which swaps fatigue for blindness. (2) Changing five things at once so you cannot tell what helped. (3) Lowering severity but leaving the pager route in place. (4) Copying every vendor default alert without asking if it is actionable.</p></div>
<div class="exam"><p><b>Exam trap.</b> The best first step for fatigue is to measure and rank by volume, not to buy a new tool. Also: SLA is the external promise, SLO the internal goal, SLI the measurement.</p></div>

<div class="scn"><h4>300 alerts a week</h4><p>Ravi Menon reported his pager buzzed 313 times in a week, nearly all from one utilisation rule that fired at every backup spike. The team ranked rules by volume, raised the limit to 75, required 30 minutes, deduped for four hours and routed it to chat. Pages dropped to zero for that rule and the following week Ravi slept through a quiet Saturday. A genuine critical loss page still arrived.</p><p><b>Lesson:</b> fewer, better alerts keep the real ones loud.</p></div>

<div class="iv"><p class="q">"Your on-call is drowning in alerts. What do you do?"</p><p>Measure alerts per week and pages per week, rank rules by volume, then for each ask if it is actionable. Tune threshold, for-duration, dedupe, severity and route, one change at a time, and add a runbook. Mention SLO-based alerting as the long-term direction.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Alert fatigue is a design defect: too many alerts that need no action.</li>
<li>Measure notifications and pages per week; start with the biggest rule.</li>
<li>Tune in order: need, threshold, for-duration, dedupe, severity, route, runbook.</li>
<li>Change one rule at a time and use the preview before Apply.</li>
<li>SLI measures, SLO targets, error budget is the allowed failure; alert on budget burn.</li>
</ul></div>
`,hi:`
<h3>Bhediya aaya wali kahani, pagers ke saath</h3>
<p>Purani kahani mein charwaha ladka itni baar "bhediya" chillata hai ki jab bhediya sach mein aata hai to koi nahi bhaagta. <b>Alert fatigue</b> operations room mein wahi kahani hai. Jab team ko sainkdon alerts milte hain aur zyadatar mein action nahi chahiye, to log channel mute kar dete hain, notification swipe kar dete hain, ya kehte hain "shayad kuch nahi". Tab jo ek alert zaroori hai woh dab jaata hai. Fatigue on-call engineer ki kamzori nahi hai; yeh alerting design ka defect hai.</p>

<h3>Fatigue ke symptoms</h3>
<ul>
<li>Pager hafte mein kuch baar se zyada bajta hai aur zyadatar pages "action nahi chahiye" par khatam hote hain.</li>
<li>Log bina dekhe acknowledge karte hain, ya chat channel muted hai.</li>
<li>Wahi alert roz raat usi ghante par fire hota hai (pattern, yaani design problem).</li>
<li>Asli outage ki khabar pehle users dete hain, alerts nahi.</li>
<li>Koi nahi bata sakta ki rule kyun hai ya fire hone par kya karna hai.</li>
</ul>

<h3>Pehle measure karo: alerts per week</h3>
<p>Jo gino nahi use tune nahi kar sakte. Console Alert rules aur Alerts and audit pages par do numbers deta hai: <b>notifications per week</b> aur <b>pages per week</b>. Page woh notification hai jo pager channel par jaati hai, jo insaan ko jagati ya interrupt karti hai. Mota rule: on-call ko hafte mein bas kuch hi pages milne chahiye, aur har ek mein action chahiye. Alerts and audit page par bar chart bhi hai, is hafte rule ke hisaab se notifications. Sabse lamba bar pehla suspect hai, kyunki alert volume Pareto rule follow karta hai: kuch rules zyadatar noise banate hain.</p>
<pre class="out">Notifications per rule this week
r-noisy     <span class="hl">################################  312</span>
r-util      ##   3
r-latency   #    2
r-cpu       #    1
r-loss      #    1
Notifications / week   319     Pager   313     Chat / email / none   6 / 0 / 0</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Tuning loop">
<rect x="20" y="30" width="130" height="60" rx="10" fill="#bae6fd"/><text x="85" y="65" text-anchor="middle" class="svg-ink" font-size="13">1 Measure</text>
<rect x="180" y="30" width="130" height="60" rx="10" fill="#fde68a"/><text x="245" y="65" text-anchor="middle" class="svg-ink" font-size="13">2 Top rule dhundo</text>
<rect x="340" y="30" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="405" y="65" text-anchor="middle" class="svg-ink" font-size="13">3 Ek cheez badlo</text>
<rect x="500" y="30" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="560" y="65" text-anchor="middle" class="svg-ink" font-size="13">4 Preview, Apply</text>
<line x1="150" y1="60" x2="180" y2="60" stroke="#64748b" stroke-width="2"/><line x1="310" y1="60" x2="340" y2="60" stroke="#64748b" stroke-width="2"/><line x1="470" y1="60" x2="500" y2="60" stroke="#64748b" stroke-width="2"/>
<path d="M560 90 L560 150 L85 150 L85 90" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="320" y="172" text-anchor="middle" class="svg-muted" font-size="12">har hafte repeat karo jab tak pages kam hon aur sab mein action ho</text>
</svg><p class="cap">Tuning ek loop hai, ek baar ki safai nahi.</p></div>

<h3>Tuning ke steps, order mein</h3>
<ol>
<li><b>Kya ise insaan chahiye?</b> Agar nahi, alert delete karo ya dashboard ya daily report par daalo.</li>
<li><b>Threshold badhao</b> us level tak jo nuksaan ka matlab ho. 50 percent utilisation nuksaan nahi; 90 percent ho sakta hai.</li>
<li><b>For-duration lagao</b> taaki blips ignore hon (1 point se 6 points, tees minute).</li>
<li><b>Dedupe lagao</b> taaki ek episode ka ek message ho (0 se 48 points, chaar ghante).</li>
<li><b>Severity kam karo</b> agar emergency nahi hai, aur use pager ke bajaye chat par <b>route</b> karo.</li>
<li>Jo rules bachein unke liye <b>runbook</b> link likho.</li>
</ol>
<p>Ek baar mein ek rule badlo, preview karo, apply karo, aur agle hafte ka number dekho.</p>

<h3>Worked walkthrough: lab obs-alert-2</h3>
<p>Ticket kehta hai on-call ko poora hafta page ho raha hai. Seed mein ek rule <code>r-noisy</code> hai: utilisation 50 se zyada, for 1 point, dedupe 0, critical, route rt-pager. Alert rules page par uske card mein hafte ke sainkdon notifications dikhte hain.</p>
<ol>
<li>r-noisy card kholo. <b>Threshold 75</b>, <b>For 6</b>, <b>Dedupe 48</b> set karo.</li>
<li><b>Severity warning</b> aur <b>Route rt-chat</b> set karo. <i>Wire/policy par kya badalta hai?</i> Network par kuch nahi. Yeh badalta hai ki kise interrupt kiya jaata hai: pager band, uski jagah chat message.</li>
<li>Commit se pehle "After Apply: notifications" aur "After Apply: pages" padho. Is rule ke liye 20 se kam notifications aur 0 pages ka target rakho.</li>
<li>Apply dabao. Ab applied counters preview se match karte hain.</li>
</ol>
<p>Dhyan do hamne kya nahi kiya: rule delete nahi kiya. Aadhe ghante tak 75 se upar utilisation jaanna phir bhi kaam ka hai, bas raat 3 baje nahi.</p>

<h3>Runbooks: alert ke saath instructions aani chahiye</h3>
<p><b>Runbook</b> chhota page hai jo batata hai: is alert ka matlab, kaise check karna hai (kaun sa dashboard, kaun sa Live tool), usual causes, pehla safe action, aur agla call kise. Agar aap runbook nahi likh sakte, to alert shayad actionable nahi hai. Runbooks naye engineer ko raat ko expert ko jagaye bina page sambhalne dete hain.</p>

<h3>SLI, SLO aur error budget, aaram se</h3>
<p>Kai causes par alert ke bajaye wahan alert karo jo users mehsoos karte hain. <b>SLI</b> (service level indicator) user ke experience ka measured number hai, jaise "Kochi se ERP requests ka percentage jinka jawab 100 ms mein aaya". <b>SLO</b> (objective) us number ka target hai, jaise 30 din mein 99 percent. <b>Error budget</b> failure ke liye bachi jagah hai: 30 din ka 1 percent lagbhag 7 ghante. Alert tab karo jab budget bahut tez jal raha ho, jab bhi ek router chheenkta hai tab nahi. Yeh logon ke liye halka hai aur business ki chinta ke kareeb. SLA customer se kiya vaada hai, aksar penalty ke saath; SLO aapka internal target hai, SLA se sakht.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Har noisy rule disable karke tune karna: fatigue ki jagah andhapan aa jaata hai. (2) Ek saath paanch cheezein badalna ki pata na chale kya kaam aaya. (3) Severity kam karna lekin pager route rakhna. (4) Har vendor default alert ko bina poochhe copy karna ki actionable hai ya nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Fatigue ka best pehla step measure karna aur volume se rank karna hai, naya tool kharidna nahi. Yeh bhi: SLA external promise, SLO internal goal, SLI measurement.</p></div>

<div class="scn"><h4>Hafte mein 300 alerts</h4><p>Ravi Menon ne bataya ki uska pager hafte mein 313 baar bajaa, lagbhag sab ek utilisation rule se jo har backup spike par fire hota tha. Team ne rules ko volume se rank kiya, limit 75 ki, 30 minute zaroori kiye, chaar ghante ka dedupe lagaya aur use chat par route kiya. Us rule ke pages zero ho gaye aur agle hafte Ravi shaant Saturday mein soya. Asli critical loss page phir bhi aaya.</p><p><b>Seekh:</b> kam, behtar alerts asli wale ko loud rakhte hain.</p></div>

<div class="iv"><p class="q">"Aapka on-call alerts mein doob raha hai. Kya karoge?"</p><p>Alerts per week aur pages per week measure karo, rules ko volume se rank karo, har ek ke liye poochho ki actionable hai ya nahi. Threshold, for-duration, dedupe, severity aur route tune karo, ek baar mein ek change, aur runbook jodo. Long-term direction ke taur par SLO-based alerting batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Alert fatigue design defect hai: bahut saare alerts jinme action nahi chahiye.</li>
<li>Notifications aur pages per week measure karo; sabse bade rule se shuru karo.</li>
<li>Order mein tune karo: need, threshold, for-duration, dedupe, severity, route, runbook.</li>
<li>Ek baar mein ek rule badlo aur Apply se pehle preview use karo.</li>
<li>SLI measure karta hai, SLO target hai, error budget allowed failure hai; budget burn par alert karo.</li>
</ul></div>
`}};export{e as default};