var e={id:`hit-counts-logging`,h:{en:`Hit counts, logging, Traceflow versus test traffic, and Context Profiles`,hi:`Hit counts, logging, Traceflow versus test traffic, aur Context Profiles`},body:{en:`
<h3>Evidence before you change policy</h3>
<p>A shop owner who wants to remove an old lock first checks whether anyone still uses that door. In the same way, before you delete, tighten or reorder a rule, you want evidence. Two tools give it: the <b>hit counter</b> of each rule and the <b>flow log</b>. A third tool, Traceflow, answers a different question, and mixing them up is a classic mistake.</p>

<h3>Hit counter: how many times did this rule decide a flow?</h3>
<p>A <b>hit counter</b> goes up by one each time a rule is the one that decides a flow. Note the words: <i>decides</i>. If a flow matches rule A, rule B below it is never consulted and gets no hit, even if B would also have matched. The default rule has its own counter too, and it is the most valuable one when you are moving to default deny: each default hit is a flow that nothing covers.</p>
<p>What a count tells you:</p>
<ul>
<li><b>Zero for a long time:</b> the rule may be unused, a candidate to review. It is evidence, not proof: a rule for a quarterly job may show zero for weeks.</li>
<li><b>Many hits you did not expect:</b> traffic you did not plan for, for example a dev VM hitting a deny rule again and again.</li>
<li><b>Hits on the default rule:</b> flows without a rule. Under default allow they are silent holes; under default deny they are outages.</li>
</ul>
<p>In real deployments the counters come from live traffic. In the simulator they come from <b>Send test traffic</b> only. Check the documentation for your version for how counters are collected and how often they refresh.</p>

<h3>Logging: a record of decisions</h3>
<p>Every rule has a "Log matches" switch, and the default rule has "Log default rule matches". Logging means a match is written to a log, so that later you can see which VM talked to which VM, on what service, and what happened. It is the raw material for investigations and for building new allow rules.</p>
<div class="note"><p><b>How logging works in the simulator.</b> The Flows and logs page shows a table with every rule's category, action, hits and logging switch (on or off), and a flow log. In the simulator every test flow is written to the flow log so you can study it, whether the rule's logging switch is on or off. Hit counters count regardless of the switch too. The switch is stored, published and shown, as a real deployment would use it, but it does not filter the simulator's flow log. Real log volume, retention and export are not modelled.</p></div>
<p>Why still turn logging on? Good habit: log deny rules (you want to know what was blocked), log allow rules on sensitive paths such as app to database, and log the default rule during a migration. In real life, logging every busy rule costs storage, so choose.</p>

<h3>Traceflow versus Send test traffic</h3>
<p>The Tools page has two tools that look alike and behave differently.</p>
<table class="cmp">
<tr><th></th><th>Traceflow</th><th>Send test traffic</th></tr>
<tr><td>What it does</td><td>Follows one imaginary flow through the published rules and prints every rule it looked at</td><td>Runs the flow through the published policy as traffic</td></tr>
<tr><td>Hit counters</td><td>Not changed</td><td>Increased for the deciding rule or the default rule</td></tr>
<tr><td>Flow log</td><td>Not written</td><td>One line written</td></tr>
<tr><td>Output</td><td>Step-by-step reasons, MATCH and no-match lines</td><td>One line: allow or deny and by which rule</td></tr>
<tr><td>Best for</td><td>Understanding and proving a decision</td><td>Producing evidence: hits and log entries</td></tr>
<tr><td>Reads</td><td>Published policy</td><td>Published policy</td></tr>
</table>
<p>Both read the <b>published</b> policy, so an unpublished edit is invisible to both. Here is a Traceflow, followed by the counters:</p>
<pre class="out">Flow: WEB-P -&gt; APP-P (h&#116;tps)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (1 rule)
  Deny dev to prod: no match (source no, destination yes, service yes, applied to yes)
Category application (4 rules)
  MATCH Web to app (prod) -&gt; ALLOW (applied to DFW)
Result: ALLOW by rule "Web to app (prod)" in application</pre>
<p>After this Traceflow every counter in the simulator is still zero. Now four test flows are sent: WEB-P to APP-P on h&#116;tps twice, WEB-D to DB-P on sql, and WEB-P to DB-P on sql:</p>
<pre class="out">WEB-P -&gt; APP-P (h&#116;tps): ALLOW by rule "Web to app (prod)"
WEB-P -&gt; APP-P (h&#116;tps): ALLOW by rule "Web to app (prod)"
WEB-D -&gt; DB-P (sql): DENY by rule "Deny dev to prod"
WEB-P -&gt; DB-P (sql): ALLOW by the default rule</pre>
<p>The Flows and logs page now shows the hit table and the flow log. The columns are Rule, Category, Action, Hits, Logging:</p>
<pre class="out">Allow DNS | infrastructure | allow | 0 | off
Deny dev to prod | environment | deny | <span class="hl">1</span> | on
Web to app (prod) | application | allow | <span class="hl">2</span> | on
App to DB (prod) | application | allow | 0 | on
Web to app (dev) | application | allow | 0 | off
App to DB (dev) | application | allow | 0 | off
Default rule | default | allow | <span class="hl">1</span> | off</pre>
<p>Reading it: the web-to-app rule decided two flows; the dev wall caught one; and one flow, web to database, was decided by the default rule. That last line is exactly the kind of finding that tells you a hole exists. The four lines of the flow log record who, to whom, which service, the action, the deciding rule and its category.</p>

<div class="eg"><p><b>Worked example.</b> In Lab 4 you send test traffic twice from WEB-P to APP-P, once from WEB-D to DB-P, read the counters, then open the dev rule "Web to app (dev)", tick Log matches and Publish changes. Remember: ticking the box is an edit, so until you publish, the checker still sees the old state.</p></div>

<h3>Beyond ports: Context Profiles as a concept</h3>
<p>Everything so far matched a flow by <b>service</b>: a protocol and a port, like tcp 3306 for sql. Ports are a blunt tool. Many different applications share port 443, and one application may use many ports. Some products therefore add <b>application-aware matching</b> (for example recognising a named application regardless of port) and <b>FQDN matching</b> (matching a fully qualified domain name such as updates.example, instead of an IP address). In the VMware product family this idea is packaged as <b>Context Profiles</b>, which a rule can use alongside, or instead of, a plain service.</p>
<div class="warn"><p><b>Not modelled.</b> Context Profiles are not in the simulator. Nothing in this course's labs, Traceflow or tests uses them, and this course does not describe their exact fields, supported applications or limits. Learn the exact behaviour for your version from the published product documentation.</p></div>
<p><b>Reference configuration (not run in the simulator):</b> in words only, a rule in the Application category could say: source "App servers (prod)", destination any, matched on a named FQDN such as updates.example using a context profile instead of a service, action allow. The idea is to let production app servers reach one update site without opening the whole internet. Where to apply it, which protocols are supported and how the name is resolved all depend on the version.</p>
<p>For interviews, you only need the concept: ports say <i>how</i>, context profiles can say <i>what application or which name</i>, and they refine a rule without changing the category logic you have learned.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Using Traceflow and expecting hit counters to move. (2) Reading a zero count as proof a rule is unused. (3) Forgetting to publish a logging change. (4) Assuming a rule below a matching rule also gets a hit. (5) Treating Context Profiles as something you can practise in this simulator.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Does Traceflow increase the hit count?" No, it is read-only. "Which counter shows flows that no rule covers?" The default rule's.</p></div>

<div class="scn"><h4>The cleanup that nearly broke payroll</h4><p>A Narmada engineer saw a rule with zero hits after a week and planned to delete it. A colleague asked him to check the rule's purpose first: it covered the payroll run, executed once a month. He kept the rule, added a comment in the name and scheduled the review after month end.</p><p><b>Lesson:</b> a zero hit count is a question to ask the application owner, not an order to delete.</p></div>

<div class="iv"><p class="q">"What is the difference between a Traceflow and real traffic when you test a firewall policy?"</p><p>Strong answer: Traceflow simulates a flow against the published policy and explains each rule, without counting hits or writing logs. Real or test traffic goes through enforcement and updates counters and logs, so it is the evidence tool. I use Traceflow to understand and prove a decision, and traffic plus counters to find unused rules and uncovered flows.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A hit counter counts flows a rule decided; the default rule has its own counter.</li>
<li>Zero hits is a lead for review, not proof the rule is unused.</li>
<li>Traceflow is read-only: no hits, no log. Send test traffic updates both.</li>
<li>Both tools read the published policy only.</li>
<li>Context Profiles add application and FQDN awareness beyond ports; they are a concept here and are not modelled.</li>
</ul></div>
`,hi:`
<h3>Policy badalne se pehle saboot</h3>
<p>Dukaan ka maalik purana lock hatane se pehle dekhta hai ki us darwaze ko koi use karta hai ya nahi. Isi tarah rule delete, tight ya reorder karne se pehle aapko saboot chahiye. Do tools yeh dete hain: har rule ka <b>hit counter</b> aur <b>flow log</b>. Teesra tool, Traceflow, alag sawal ka jawab deta hai, aur inhe mix kar dena classic galti hai.</p>

<h3>Hit counter: is rule ne kitni baar flow decide kiya?</h3>
<p><b>Hit counter</b> har baar ek badhta hai jab rule woh hota hai jo flow ko <i>decide</i> karta hai. Shabd dhyan se: <i>decide</i>. Agar flow rule A se match ho gaya, to uske neeche rule B ko dekha hi nahi jaata aur use hit nahi milta, chahe B bhi match karta. Default rule ka bhi apna counter hai, aur default deny ki taraf jaate waqt yeh sabse keemti hai: default par har hit ek aisa flow hai jise kuch cover nahi karta.</p>
<p>Count aapko kya batata hai:</p>
<ul>
<li><b>Bahut din tak zero:</b> rule unused ho sakta hai, review ka candidate. Yeh saboot hai, praman nahi: quarterly job ka rule hafton tak zero dikha sakta hai.</li>
<li><b>Bahut hits jinki ummeed nahi thi:</b> aisa traffic jiski planning nahi thi, jaise dev VM baar baar deny rule se takra raha ho.</li>
<li><b>Default rule par hits:</b> bina rule ke flows. Default allow mein yeh chupe hole hain; default deny mein yeh outage hain.</li>
</ul>
<p>Real deployments mein counters live traffic se aate hain. Simulator mein sirf <b>Send test traffic</b> se aate hain. Counters kaise collect hote hain aur kitni baar refresh hote hain, iske liye apne version ki documentation check karo.</p>

<h3>Logging: faislon ka record</h3>
<p>Har rule mein "Log matches" switch hota hai, aur default rule mein "Log default rule matches". Logging ka matlab match log mein likha jaata hai, taaki baad mein dekh sako kaunsa VM kis VM se, kis service par baat kar raha tha aur kya hua. Yeh investigations aur naye allow rules banane ka kaccha maal hai.</p>
<div class="note"><p><b>Simulator mein logging kaise kaam karta hai.</b> Flows and logs page ek table dikhata hai jisme har rule ki category, action, hits aur logging switch (on ya off) hai, aur ek flow log. Simulator mein har test flow flow log mein likha jaata hai taaki aap padh sako, chahe rule ka logging switch on ho ya off. Hit counters bhi switch ki parwah kiye bina ginte hain. Switch real deployment ki tarah stored, published aur dikhaya jaata hai, lekin simulator ke flow log ko filter nahi karta. Real log volume, retention aur export model nahi hain.</p></div>
<p>Phir bhi logging on kyun karein? Achhi aadat: deny rules log karo (jaanna hai kya block hua), sensitive paths jaise app to database ke allow rules log karo, aur migration ke dauran default rule log karo. Real life mein har busy rule log karne se storage lagta hai, to soch ke chuno.</p>

<h3>Traceflow versus Send test traffic</h3>
<p>Tools page par do tools hain jo ek jaise dikhte hain aur alag chalte hain.</p>
<table class="cmp">
<tr><th></th><th>Traceflow</th><th>Send test traffic</th></tr>
<tr><td>Kya karta hai</td><td>Ek kaalpnik flow ko published rules se guzaarta hai aur har dekha hua rule print karta hai</td><td>Flow ko published policy se traffic ki tarah chalata hai</td></tr>
<tr><td>Hit counters</td><td>Nahi badalte</td><td>Deciding rule ya default rule ke badhte hain</td></tr>
<tr><td>Flow log</td><td>Nahi likhta</td><td>Ek line likhta hai</td></tr>
<tr><td>Output</td><td>Step-by-step wajah, MATCH aur no-match lines</td><td>Ek line: allow ya deny aur kaunsa rule</td></tr>
<tr><td>Kis liye best</td><td>Faisla samajhna aur saabit karna</td><td>Saboot banana: hits aur log entries</td></tr>
<tr><td>Padhta hai</td><td>Published policy</td><td>Published policy</td></tr>
</table>
<p>Dono <b>published</b> policy padhte hain, to unpublished edit dono ko nahi dikhta. Pehle ek Traceflow, phir counters:</p>
<pre class="out">Flow: WEB-P -&gt; APP-P (h&#116;tps)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (1 rule)
  Deny dev to prod: no match (source no, destination yes, service yes, applied to yes)
Category application (4 rules)
  MATCH Web to app (prod) -&gt; ALLOW (applied to DFW)
Result: ALLOW by rule "Web to app (prod)" in application</pre>
<p>Is Traceflow ke baad simulator mein har counter abhi bhi zero hai. Ab chaar test flows bhejte hain: WEB-P se APP-P h&#116;tps par do baar, WEB-D se DB-P sql, aur WEB-P se DB-P sql:</p>
<pre class="out">WEB-P -&gt; APP-P (h&#116;tps): ALLOW by rule "Web to app (prod)"
WEB-P -&gt; APP-P (h&#116;tps): ALLOW by rule "Web to app (prod)"
WEB-D -&gt; DB-P (sql): DENY by rule "Deny dev to prod"
WEB-P -&gt; DB-P (sql): ALLOW by the default rule</pre>
<p>Flows and logs page ab hit table aur flow log dikhata hai. Columns hain Rule, Category, Action, Hits, Logging:</p>
<pre class="out">Allow DNS | infrastructure | allow | 0 | off
Deny dev to prod | environment | deny | <span class="hl">1</span> | on
Web to app (prod) | application | allow | <span class="hl">2</span> | on
App to DB (prod) | application | allow | 0 | on
Web to app (dev) | application | allow | 0 | off
App to DB (dev) | application | allow | 0 | off
Default rule | default | allow | <span class="hl">1</span> | off</pre>
<p>Padho: web-to-app rule ne do flows decide kiye; dev wall ne ek pakda; aur ek flow, web se database, default rule ne decide kiya. Woh aakhri line bilkul wahi finding hai jo batati hai ki hole hai. Flow log ki chaar lines record karti hain kaun, kisse, kaunsi service, action, deciding rule aur uski category.</p>

<div class="eg"><p><b>Worked example.</b> Lab 4 mein aap WEB-P se APP-P do baar, WEB-D se DB-P ek baar test traffic bhejte ho, counters padhte ho, phir dev rule "Web to app (dev)" kholkar Log matches tick karte ho aur Publish changes dabate ho. Yaad rakho: box tick karna ek edit hai, to publish tak checker ko purani state dikhti hai.</p></div>

<h3>Ports ke aage: Context Profiles ek concept ke roop mein</h3>
<p>Ab tak har flow <b>service</b> se match hua: protocol aur port, jaise sql ke liye tcp 3306. Ports kund hathiyar hain. Bahut saari alag applications port 443 share karti hain, aur ek application bahut ports use kar sakti hai. Isliye kuch products <b>application-aware matching</b> (jaise port chahe jo ho, named application pehchaanna) aur <b>FQDN matching</b> (IP address ki jagah updates.example jaise fully qualified domain name se match) jodte hain. VMware product family mein yeh idea <b>Context Profiles</b> ke naam se aata hai, jo rule plain service ke saath ya uski jagah use kar sakta hai.</p>
<div class="warn"><p><b>Model nahi hai.</b> Context Profiles simulator mein nahi hain. Is course ke labs, Traceflow ya tests mein inka koi use nahi hai, aur yeh course unke exact fields, supported applications ya limits describe nahi karta. Apne version ka exact behaviour published product documentation se seekho.</p></div>
<p><b>Reference configuration (not run in the simulator):</b> sirf shabdon mein, Application category ka rule aise keh sakta hai: source "App servers (prod)", destination any, service ki jagah context profile se named FQDN jaise updates.example par match, action allow. Idea yeh hai ki production app servers ek update site tak pahunch sakein bina poora internet kholne ke. Ise kahan apply karna hai, kaunse protocols supported hain aur naam kaise resolve hota hai, yeh sab version par depend karta hai.</p>
<p>Interview ke liye sirf concept chahiye: ports <i>kaise</i> batate hain, context profiles <i>kaunsi application ya kaunsa naam</i> bata sakte hain, aur woh rule ko refine karte hain bina category logic badle jo aapne seekha.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Traceflow chalakar hit counters ke hilne ki ummeed. (2) Zero count ko praman maanna ki rule unused hai. (3) Logging change publish karna bhool jaana. (4) Yeh maanna ki matching rule ke neeche wale rule ko bhi hit milta hai. (5) Context Profiles ko aisi cheez maanna jise is simulator mein practise kar sakte ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Kya Traceflow hit count badhata hai?" Nahi, woh read-only hai. "Kaunsa counter un flows ko dikhata hai jinhe koi rule cover nahi karta?" Default rule ka.</p></div>

<div class="scn"><h4>Cleanup jo payroll ko tod deta</h4><p>Narmada ke ek engineer ne ek hafte baad ek rule ke zero hits dekhe aur use delete karne ka plan banaya. Colleague ne kaha pehle rule ka purpose check karo: woh payroll run ka rule tha, jo mahine mein ek baar chalta hai. Usne rule rakha, naam mein comment jod diya aur review month end ke baad schedule kiya.</p><p><b>Seekh:</b> zero hit count application owner se poochne ka sawal hai, delete karne ka order nahi.</p></div>

<div class="iv"><p class="q">"Firewall policy test karte waqt Traceflow aur real traffic mein kya fark hai?"</p><p>Strong answer: Traceflow published policy ke against flow simulate karta hai aur har rule explain karta hai, bina hits ginne ya logs likhne ke. Real ya test traffic enforcement se guzarta hai aur counters aur logs update karta hai, isliye woh saboot ka tool hai. Main Traceflow faisla samajhne aur saabit karne ke liye use karta hoon, aur traffic plus counters unused rules aur uncovered flows dhoondhne ke liye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hit counter un flows ko ginta hai jo rule ne decide kiye; default rule ka apna counter hai.</li>
<li>Zero hits review ka lead hai, praman nahi ki rule unused hai.</li>
<li>Traceflow read-only hai: na hits, na log. Send test traffic dono update karta hai.</li>
<li>Dono tools sirf published policy padhte hain.</li>
<li>Context Profiles ports ke aage application aur FQDN awareness dete hain; yahan concept hain aur model nahi hain.</li>
</ul></div>
`}};export{e as default};