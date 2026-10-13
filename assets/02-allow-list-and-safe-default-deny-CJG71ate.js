var e={id:`allow-list-default-deny`,h:{en:`Deny-list versus allow-list, and the safe route to default deny`,hi:`Deny-list versus allow-list, aur default deny ka safe raasta`},body:{en:`
<h3>Two ways to run a firewall</h3>
<p>Think of a housing society gate. In the first style the guard has a <b>list of banned people</b>: everyone not on the list walks in. In the second style the guard has a <b>list of invited guests</b>: only people on the list walk in, everyone else is stopped. The first is a <b>deny-list</b> (also called a blocklist). The second is an <b>allow-list</b> (an allowlist).</p>
<table class="cmp">
<tr><th></th><th>Deny-list</th><th>Allow-list</th></tr>
<tr><td>Default rule action</td><td>allow</td><td>deny</td></tr>
<tr><td>What you write</td><td>Rules for what to block</td><td>Rules for what to permit</td></tr>
<tr><td>A flow nobody thought of</td><td>Works (allowed)</td><td>Blocked until someone adds a rule</td></tr>
<tr><td>Safe to start with</td><td>Yes, nothing breaks</td><td>No, anything unlisted breaks</td></tr>
<tr><td>Security strength</td><td>Weak: new paths are open by default</td><td>Strong: new paths are closed by default</td></tr>
</table>
<p>A fresh console in the simulator, and on a fresh install according to the published documentation, has a default rule of <b>allow</b>, so you start as a deny-list. Micro-segmentation aims at an allow-list, because that is what shrinks the blast radius you met in the first module. The tricky part is the move from one to the other without an outage.</p>

<h3>Why the default rule matters so much</h3>
<p>Every flow that no rule mentions falls to the default rule. In the seeded Narmada policy, there is no rule about web servers talking to the database. Run it:</p>
<pre class="out">Flow: WEB-P -&gt; DB-P (sql)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (1 rule)
  Deny dev to prod: no match (source no, destination yes, service yes, applied to yes)
Category application (4 rules)
  Web to app (prod): no match (source yes, destination no, service no, applied to yes)
  App to DB (prod): no match (source no, destination yes, service yes, applied to yes)
  Web to app (dev): no match (source no, destination no, service no, applied to yes)
  App to DB (dev): no match (source no, destination no, service yes, applied to yes)
No rule matched: default rule -&gt; ALLOW
<span class="hl">Result: ALLOW by the default rule</span></pre>
<p>The design says only the app tier may talk to the database, yet the web tier can. Nobody wrote a rule to allow it; the default rule did. Flipping the default to deny closes this hole, and every other hole nobody has noticed.</p>

<h3>The safe route, step by step</h3>
<p>The danger of flipping the default is simple: any legitimate flow you forgot to list stops working. So you never start with the flip. You finish with it.</p>
<ol>
<li><b>Write down what you know.</b> From the application design, list every flow each application needs: source group, destination group, service.</li>
<li><b>Create the allow rules</b> for those flows in the Application category (and shared ones, such as DNS, in Infrastructure). Turn on <b>logging</b> for them so they show up in the record.</li>
<li><b>Observe with real traffic.</b> Look at the hit counter of the <b>default rule</b>. Every hit on the default rule is a flow that no rule covers. In the simulator you create the traffic with Send test traffic; in a real deployment the counters come from live traffic and you watch them over a full business cycle, such as a month-end run. Check the documentation for your version for how hit counts and logs are shown.</li>
<li><b>Resolve every default hit.</b> For each flow the counter reveals, decide: legitimate (add an allow rule) or not wanted (leave it to be blocked).</li>
<li><b>Verify with Traceflow</b> that every listed flow matches an allow rule, not the default. Traceflow is read-only and changes nothing.</li>
<li><b>Flip the default to deny and Publish changes.</b> Immediately re-test the critical flows.</li>
<li><b>Keep a way back.</b> If something important breaks, the fastest recovery is a new allow rule for that flow. Setting the default back to allow is the emergency fallback, and it re-opens every hole, so use it only to restore a business-critical flow while you fix the real gap.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Safe route: list flows, log, observe default hits, add allows, verify, flip default to deny">
<rect x="6" y="40" width="96" height="60" rx="8" fill="#bae6fd"/><text x="54" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 List flows</text><text x="54" y="84" text-anchor="middle" class="svg-muted" font-size="11">from design</text>
<rect x="112" y="40" width="96" height="60" rx="8" fill="#ddd6fe"/><text x="160" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 Allow + log</text><text x="160" y="84" text-anchor="middle" class="svg-muted" font-size="11">add rules</text>
<rect x="218" y="40" width="96" height="60" rx="8" fill="#fde68a"/><text x="266" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 Observe</text><text x="266" y="84" text-anchor="middle" class="svg-muted" font-size="11">default hits</text>
<rect x="324" y="40" width="96" height="60" rx="8" fill="#bbf7d0"/><text x="372" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 Fix gaps</text><text x="372" y="84" text-anchor="middle" class="svg-muted" font-size="11">more allows</text>
<rect x="430" y="40" width="96" height="60" rx="8" fill="#bae6fd"/><text x="478" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 Traceflow</text><text x="478" y="84" text-anchor="middle" class="svg-muted" font-size="11">verify</text>
<rect x="536" y="40" width="98" height="60" rx="8" fill="#fed7aa"/><text x="585" y="66" text-anchor="middle" class="svg-ink" font-size="12">6 Flip + test</text><text x="585" y="84" text-anchor="middle" class="svg-muted" font-size="11">default deny</text>
<line x1="102" y1="70" x2="112" y2="70" stroke="#64748b" stroke-width="2"/><line x1="208" y1="70" x2="218" y2="70" stroke="#64748b" stroke-width="2"/><line x1="314" y1="70" x2="324" y2="70" stroke="#64748b" stroke-width="2"/><line x1="420" y1="70" x2="430" y2="70" stroke="#64748b" stroke-width="2"/><line x1="526" y1="70" x2="536" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">the flip is the last step, never the first</text>
</svg><p class="cap">Six steps. The default rule changes only after the allow rules exist and have been verified.</p></div>

<h3>What a forgotten flow looks like</h3>
<div class="eg"><p><b>Worked example.</b> Narmada's default was flipped to deny last night. This morning the database administrators cannot open an SSH session from APP-P to DB-P. Nobody listed ssh, since it is used only for maintenance. Traceflow shows it:</p></div>
<pre class="out">Flow: APP-P -&gt; DB-P (ssh)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (1 rule)
  Deny dev to prod: no match (source no, destination yes, service yes, applied to yes)
Category application (4 rules)
  Web to app (prod): no match (source no, destination no, service no, applied to yes)
  App to DB (prod): no match (source yes, destination yes, service no, applied to yes)
  Web to app (dev): no match (source no, destination no, service no, applied to yes)
  App to DB (dev): no match (source no, destination no, service no, applied to yes)
No rule matched: default rule -&gt; DENY
<span class="hl">Result: DENY by the default rule</span></pre>
<p>Look at "App to DB (prod)": source yes, destination yes, service no. It is the right pair of groups with the wrong service. The smallest fix is one new rule, <b>Admin SSH app to DB (prod)</b>, from the group "App servers (prod)" to "Database servers (prod)", service ssh, action allow, with logging on. After Publish changes:</p>
<pre class="out">Category application (5 rules)
  ...
  <span class="hl">MATCH Admin SSH app to DB (prod) -&gt; ALLOW (applied to DFW)</span>
Result: ALLOW by rule "Admin SSH app to DB (prod)" in application</pre>
<p>And the guard test: WEB-P to DB-P on ssh still ends in "DENY by the default rule". The new rule names the app group as source, so the web tier gains nothing. Had you used source "any", you would have repaired the admins' problem and quietly re-opened the web-to-database path.</p>

<h3>The rule of the smallest allow</h3>
<p>A good allow rule names a specific source group, a specific destination group and a specific service. Each "any" you use widens the hole. When you are in a hurry, you must still prefer "a bit slower and narrow" over "fast and wide".</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Flipping the default first "to see what breaks" in production. (2) Forgetting infrastructure flows such as DNS, which is why the seed lists Allow DNS in Infrastructure. (3) Fixing an outage with an allow of any source or any service. (4) Forgetting new VMs: a VM missing its tags is outside every group, so no allow rule matches it and, under default deny, it is blocked.</p></div>
<div class="exam"><p><b>Exam trap.</b> "What decides a flow that no rule matches?" The default rule. "A fresh install has a default of?" Allow. "Which comes first in a segmentation project, the allow rules or the default flip?" The allow rules.</p></div>

<div class="scn"><h4>The month-end batch job</h4><p>Narmada's team observed default-rule hits for a week and found nothing alarming, so they flipped to deny. At month end, a reporting VM that runs only once a month could not reach the database and the finance report failed. The fix was one allow rule, and the lesson was to observe for at least one full business cycle before flipping.</p><p><b>Lesson:</b> rarely used flows hide from short observation windows.</p></div>

<div class="iv"><p class="q">"How would you move a live environment to default deny without an outage?"</p><p>Strong answer: list the known flows, add allow rules with logging, watch the default rule's hit counter and logs for a full business cycle, add allows for every legitimate flow found, verify with Traceflow, then flip the default and test the critical flows, with a prepared rollback. Say that Traceflow is read-only and that hit counts guide you but do not replace the application owner's knowledge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Default allow gives a deny-list; default deny gives an allow-list, the stronger design.</li>
<li>Flows no rule mentions fall to the default rule, so flipping it breaks every unlisted flow.</li>
<li>Safe order: list, add allows with logging, observe default hits, fix gaps, verify, flip, retest.</li>
<li>Fix outages with the smallest allow: specific source group, destination group and service.</li>
<li>Observe for a full business cycle; rare jobs hide from short windows.</li>
</ul></div>
`,hi:`
<h3>Firewall chalane ke do tareeke</h3>
<p>Housing society ka gate socho. Pehle style mein guard ke paas <b>banned logon ki list</b> hai: jo list mein nahi, woh andar chala jaata hai. Doosre style mein guard ke paas <b>invited guests ki list</b> hai: sirf list wale andar jaate hain, baaki sab roke jaate hain. Pehla <b>deny-list</b> hai (blocklist bhi kehte hain). Doosra <b>allow-list</b> hai (allowlist).</p>
<table class="cmp">
<tr><th></th><th>Deny-list</th><th>Allow-list</th></tr>
<tr><td>Default rule ka action</td><td>allow</td><td>deny</td></tr>
<tr><td>Aap kya likhte ho</td><td>Kya block karna hai uske rules</td><td>Kya permit karna hai uske rules</td></tr>
<tr><td>Aisa flow jis par kisi ne socha nahi</td><td>Chalta hai (allowed)</td><td>Tab tak block jab tak koi rule na jode</td></tr>
<tr><td>Shuru karne ke liye safe</td><td>Haan, kuch nahi tootta</td><td>Nahi, jo listed nahi woh tootta hai</td></tr>
<tr><td>Security strength</td><td>Kamzor: naye paths by default khule</td><td>Mazboot: naye paths by default band</td></tr>
</table>
<p>Simulator ka fresh console, aur published documentation ke hisaab se fresh install, default rule <b>allow</b> ke saath aata hai, to aap deny-list se shuru karte ho. Micro-segmentation allow-list ki taraf jaata hai, kyunki wahi blast radius chhota karti hai jo aapne pehle module mein dekha. Mushkil hissa hai ek se doosre par bina outage ke jaana.</p>

<h3>Default rule itna important kyun hai</h3>
<p>Jo flow kisi rule mein mention nahi, woh default rule par girta hai. Seeded Narmada policy mein web servers ke database se baat karne ka koi rule nahi hai. Chalao:</p>
<pre class="out">Flow: WEB-P -&gt; DB-P (sql)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (1 rule)
  Deny dev to prod: no match (source no, destination yes, service yes, applied to yes)
Category application (4 rules)
  Web to app (prod): no match (source yes, destination no, service no, applied to yes)
  App to DB (prod): no match (source no, destination yes, service yes, applied to yes)
  Web to app (dev): no match (source no, destination no, service no, applied to yes)
  App to DB (dev): no match (source no, destination no, service yes, applied to yes)
No rule matched: default rule -&gt; ALLOW
<span class="hl">Result: ALLOW by the default rule</span></pre>
<p>Design kehta hai ki database se sirf app tier baat kare, phir bhi web tier kar sakta hai. Kisi ne ise allow karne ka rule nahi likha; default rule ne kiya. Default ko deny karne se yeh hole band hota hai, aur woh har hole bhi jo kisi ko dikha nahi.</p>

<h3>Safe route, step by step</h3>
<p>Default flip karne ka khatra simple hai: jo legitimate flow aap list karna bhool gaye woh chalna band ho jaata hai. Isliye flip se shuru nahi karte. Flip par khatam karte ho.</p>
<ol>
<li><b>Jo pata hai woh likho.</b> Application design se har application ke zaroori flows list karo: source group, destination group, service.</li>
<li><b>Allow rules banao</b> un flows ke liye Application category mein (aur DNS jaise shared flows Infrastructure mein). Unka <b>logging</b> on karo taaki woh record mein dikhein.</li>
<li><b>Real traffic se observe karo.</b> <b>Default rule</b> ka hit counter dekho. Default rule par har hit ek aisa flow hai jise koi rule cover nahi karta. Simulator mein traffic aap Send test traffic se banate ho; real deployment mein counters live traffic se aate hain aur aap unhe poore business cycle tak dekhte ho, jaise month-end run. Hit counts aur logs kaise dikhte hain, iske liye apne version ki documentation check karo.</li>
<li><b>Har default hit resolve karo.</b> Counter jo flow dikhaye uske liye tay karo: legitimate hai (allow rule jodo) ya nahi chahiye (block hone do).</li>
<li><b>Traceflow se verify karo</b> ki har listed flow default se nahi, allow rule se match ho raha hai. Traceflow read-only hai, kuch nahi badalta.</li>
<li><b>Default ko deny karo aur Publish changes dabao.</b> Turant critical flows dobara test karo.</li>
<li><b>Wapas jaane ka raasta rakho.</b> Agar kuch important tootta hai, sabse tez recovery us flow ka naya allow rule hai. Default ko wapas allow karna emergency fallback hai, aur woh har hole phir khol deta hai, isliye sirf business-critical flow bachane ke liye use karo jab tak asli gap theek ho.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Safe route: flows list, log, default hits dekho, allow jodo, verify, default deny flip">
<rect x="6" y="40" width="96" height="60" rx="8" fill="#bae6fd"/><text x="54" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Flows list</text><text x="54" y="84" text-anchor="middle" class="svg-muted" font-size="11">design se</text>
<rect x="112" y="40" width="96" height="60" rx="8" fill="#ddd6fe"/><text x="160" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 Allow + log</text><text x="160" y="84" text-anchor="middle" class="svg-muted" font-size="11">rules jodo</text>
<rect x="218" y="40" width="96" height="60" rx="8" fill="#fde68a"/><text x="266" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 Observe</text><text x="266" y="84" text-anchor="middle" class="svg-muted" font-size="11">default hits</text>
<rect x="324" y="40" width="96" height="60" rx="8" fill="#bbf7d0"/><text x="372" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 Gaps bharo</text><text x="372" y="84" text-anchor="middle" class="svg-muted" font-size="11">aur allows</text>
<rect x="430" y="40" width="96" height="60" rx="8" fill="#bae6fd"/><text x="478" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 Traceflow</text><text x="478" y="84" text-anchor="middle" class="svg-muted" font-size="11">verify</text>
<rect x="536" y="40" width="98" height="60" rx="8" fill="#fed7aa"/><text x="585" y="66" text-anchor="middle" class="svg-ink" font-size="12">6 Flip + test</text><text x="585" y="84" text-anchor="middle" class="svg-muted" font-size="11">default deny</text>
<line x1="102" y1="70" x2="112" y2="70" stroke="#64748b" stroke-width="2"/><line x1="208" y1="70" x2="218" y2="70" stroke="#64748b" stroke-width="2"/><line x1="314" y1="70" x2="324" y2="70" stroke="#64748b" stroke-width="2"/><line x1="420" y1="70" x2="430" y2="70" stroke="#64748b" stroke-width="2"/><line x1="526" y1="70" x2="536" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">flip aakhri step hai, pehla kabhi nahi</text>
</svg><p class="cap">Chhe steps. Default rule tabhi badalta hai jab allow rules ban chuke ho aur verify ho chuke ho.</p></div>

<h3>Bhoola hua flow kaisa dikhta hai</h3>
<div class="eg"><p><b>Worked example.</b> Narmada ka default kal raat deny kar diya gaya. Aaj subah database administrators APP-P se DB-P tak SSH session nahi khol paate. Kisi ne ssh list nahi kiya kyunki woh sirf maintenance mein use hota hai. Traceflow dikhata hai:</p></div>
<pre class="out">Flow: APP-P -&gt; DB-P (ssh)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (1 rule)
  Deny dev to prod: no match (source no, destination yes, service yes, applied to yes)
Category application (4 rules)
  Web to app (prod): no match (source no, destination no, service no, applied to yes)
  App to DB (prod): no match (source yes, destination yes, service no, applied to yes)
  Web to app (dev): no match (source no, destination no, service no, applied to yes)
  App to DB (dev): no match (source no, destination no, service no, applied to yes)
No rule matched: default rule -&gt; DENY
<span class="hl">Result: DENY by the default rule</span></pre>
<p>"App to DB (prod)" dekho: source yes, destination yes, service no. Groups ka jodi sahi hai, service galat. Sabse chhota fix ek naya rule hai, <b>Admin SSH app to DB (prod)</b>, group "App servers (prod)" se "Database servers (prod)" tak, service ssh, action allow, logging on. Publish changes ke baad:</p>
<pre class="out">Category application (5 rules)
  ...
  <span class="hl">MATCH Admin SSH app to DB (prod) -&gt; ALLOW (applied to DFW)</span>
Result: ALLOW by rule "Admin SSH app to DB (prod)" in application</pre>
<p>Aur guard test: WEB-P se DB-P ssh par ab bhi "DENY by the default rule" par khatam hota hai. Naya rule app group ko source banata hai, to web tier ko kuch nahi milta. Agar source "any" rakhte, to admins ki problem theek ho jaati aur chupke se web-to-database path phir khul jaata.</p>

<h3>Sabse chhote allow ka niyam</h3>
<p>Achha allow rule specific source group, specific destination group aur specific service naam leta hai. Jitna "any" use karte ho utna hole chauda hota hai. Jaldi mein bhi "thoda dheere aur narrow" ko "tez aur wide" par prefer karo.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Production mein "dekhte hain kya tootta hai" ke liye pehle default flip kar dena. (2) DNS jaise infrastructure flows bhool jaana, isliye seed mein Allow DNS Infrastructure mein hai. (3) Outage ko any source ya any service ke allow se theek karna. (4) Naye VMs bhool jaana: jis VM ke tags nahi woh kisi group mein nahi, to koi allow rule use match nahi karta aur default deny mein woh block ho jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Jo flow kisi rule se match nahi hota use kaun decide karta hai?" Default rule. "Fresh install ka default?" Allow. "Segmentation project mein pehle kya, allow rules ya default flip?" Allow rules.</p></div>

<div class="scn"><h4>Month-end batch job</h4><p>Narmada ki team ne ek hafte default-rule hits observe kiye, kuch alarming nahi mila, to deny kar diya. Month end par ek reporting VM, jo mahine mein sirf ek baar chalta hai, database tak nahi pahunch paya aur finance report fail ho gayi. Fix ek allow rule tha, aur seekh yeh ki flip se pehle kam se kam ek poora business cycle observe karo.</p><p><b>Seekh:</b> kabhi-kabhi chalne wale flows chhoti observation window mein chhup jaate hain.</p></div>

<div class="iv"><p class="q">"Live environment ko bina outage ke default deny par kaise le jaoge?"</p><p>Strong answer: known flows list karo, logging ke saath allow rules jodo, default rule ka hit counter aur logs poore business cycle tak dekho, har legitimate flow ke liye allow jodo, Traceflow se verify karo, phir default flip karo aur critical flows test karo, rollback tayyar rakhkar. Bolo ki Traceflow read-only hai aur hit counts guide karte hain lekin application owner ke knowledge ki jagah nahi lete.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Default allow deny-list deta hai; default deny allow-list deta hai, jo mazboot design hai.</li>
<li>Jo flows kisi rule mein nahi woh default rule par girte hain, isliye flip karne se har unlisted flow tootta hai.</li>
<li>Safe order: list, logging ke saath allows, default hits observe, gaps bharo, verify, flip, retest.</li>
<li>Outage ko sabse chhote allow se theek karo: specific source group, destination group aur service.</li>
<li>Poora business cycle observe karo; rare jobs chhoti windows mein chhup jaati hain.</li>
</ul></div>
`}};export{e as default};