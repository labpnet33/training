var e={id:`zero-trust-microseg`,h:{en:`Zero trust and micro-segmentation`,hi:`Zero trust aur micro-segmentation`},body:{en:`
<h3>Zero trust, applied to east-west traffic</h3>
<p><b>Zero trust</b> means that being "inside" the network earns no trust. Every connection is treated as something that must be justified. For traffic between servers, the question becomes: <i>does the application need this flow?</i> If yes, allow exactly that flow. If not, it should not exist.</p>
<p><b>Micro-segmentation</b> is the practice of doing this in small pieces. Instead of one big trusted zone, each application tier, or even each workload, gets its own boundary, and rules describe the few flows allowed across those boundaries. The boundary is created by policy at each vNIC (chapter 3), not by new cables or subnets.</p>

<h3>Allow-list thinking</h3>
<p>Two mindsets exist. A <b>block-list</b> says "allow everything, block the bad things I know about". An <b>allow-list</b> says "block everything, allow only the good things I know about". The first fails against what you did not think of. The second fails safely: a forgotten flow is blocked and someone notices, instead of silently open. Micro-segmentation moves you from the first to the second, one application at a time.</p>
<p>Careful: you cannot start with "block everything". If you switch the default rule to deny before the needed allow rules exist, the application stops. That is why a project has an order.</p>

<h3>The four steps of a segmentation project</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Four steps of a segmentation project">
<rect x="10" y="30" width="140" height="70" rx="10" fill="#bae6fd"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="13">1. Discover</text><text x="80" y="75" text-anchor="middle" class="svg-muted" font-size="11">which flows exist</text>
<rect x="175" y="30" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="245" y="55" text-anchor="middle" class="svg-ink" font-size="13">2. Group</text><text x="245" y="75" text-anchor="middle" class="svg-muted" font-size="11">workloads by role</text>
<rect x="340" y="30" width="140" height="70" rx="10" fill="#fde68a"/><text x="410" y="55" text-anchor="middle" class="svg-ink" font-size="13">3. Allow rules</text><text x="410" y="75" text-anchor="middle" class="svg-muted" font-size="11">only needed flows</text>
<rect x="505" y="30" width="125" height="70" rx="10" fill="#fed7aa"/><text x="567" y="55" text-anchor="middle" class="svg-ink" font-size="13">4. Default deny</text><text x="567" y="75" text-anchor="middle" class="svg-muted" font-size="11">then verify</text>
<line x1="150" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><line x1="315" y1="65" x2="340" y2="65" stroke="#64748b" stroke-width="2"/><line x1="480" y1="65" x2="505" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">Publish after each change: nothing counts until it is published</text>
</svg><p class="cap">The default rule is switched to deny last, never first.</p></div>
<ol>
<li><b>Discover flows.</b> Learn who talks to whom, using the flow log, application owners and design documents. Without this you will either block something needed or allow something not needed.</li>
<li><b>Group workloads.</b> Put VMs into groups by role, such as "Web servers (prod)". A group can be <b>dynamic</b>, built from tags and names, so a new VM with the right tags joins automatically, or <b>static</b>, a fixed list. Tag values are compared as exact text, so "web" and "Web" are different.</li>
<li><b>Write allow rules.</b> One rule per needed flow: group to group, one service, allow. Put the rule in the right category. Log the rules you want evidence from.</li>
<li><b>Switch the default to deny.</b> Only after the allow rules are verified, set the default rule to drop or reject. Now anything not listed is blocked.</li>
</ol>

<h3>Publish before it counts</h3>
<p>The console keeps your edits in a draft. Nothing is enforced until you click <b>Publish changes</b>. This protects you from half-finished rules going live, and it also means a correct rule you forgot to publish does nothing. If a test result looks unchanged after you edited policy, check publish first.</p>

<h3>A tour of the console pages</h3>
<table class="cmp">
<tr><th>Page</th><th>Its job</th></tr>
<tr><td>Overview</td><td>A summary of the environment: counts of VMs, groups, rules and recent activity.</td></tr>
<tr><td>Inventory</td><td>The list of VMs with their IP addresses and tags.</td></tr>
<tr><td>Groups</td><td>Group definitions and their current members.</td></tr>
<tr><td>Policy</td><td>The categories and rules, plus the default rule. Edits are made here and then published with Publish changes.</td></tr>
<tr><td>Tools</td><td>Traceflow (ask the policy what would happen, no counters) and Send test traffic (counts hits and writes the flow log).</td></tr>
<tr><td>Flows and logs</td><td>The record of test traffic and rule hits: who talked to whom and which rule decided.</td></tr>
<tr><td>Alerts and audit</td><td>Warnings about risky policy, such as a rule applied to an empty group, and a record of changes.</td></tr>
</table>

<h3>Lab 2 walkthrough: your first rule</h3>
<p>In Lab 2 you close the hole you saw in Lab 1. In the <b>Policy</b> page, open the Application category and add a rule: source "Web servers (prod)", destination "Database servers (prod)", service any, action deny. Turn on logging for it. Click <b>Publish changes</b>. Then run Traceflow from WEB-P to DB-P on sql.</p>
<pre class="out">Flow: WEB-P -&gt; DB-P (sql)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (1 rule)
  Deny dev to prod: no match (source no, destination yes, service yes, applied to yes)
Category application (5 rules)
  Web to app (prod): no match (source yes, destination no, service no, applied to yes)
  App to DB (prod): no match (source no, destination yes, service yes, applied to yes)
  Web to app (dev): no match (source no, destination no, service no, applied to yes)
  App to DB (dev): no match (source no, destination no, service yes, applied to yes)
<span class="hl">  MATCH Deny web to DB (prod) -&gt; DENY (applied to DFW)</span>
<span class="hl">Result: DENY by rule "Deny web to DB (prod)" in application</span></pre>
<p>Now prove the application still works. Trace APP-P to DB-P on sql:</p>
<pre class="out">Flow: APP-P -&gt; DB-P (sql)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (1 rule)
  Deny dev to prod: no match (source no, destination yes, service yes, applied to yes)
Category application (5 rules)
  Web to app (prod): no match (source no, destination no, service no, applied to yes)
<span class="hl">  MATCH App to DB (prod) -&gt; ALLOW (applied to DFW)</span>
<span class="hl">Result: ALLOW by rule "App to DB (prod)" in application</span></pre>
<p>Also check WEB-P to APP-P on h&#116;tps (still allowed by "Web to app (prod)") and WEB-D to APP-D on h&#116;tps (dev is untouched because your rule names only prod groups). The new rule sits at the end of the Application list; it is safe there because no earlier rule matches web to database. Note that the Traceflow stops printing rules after the first match.</p>

<div class="eg"><p><b>Worked example.</b> Before: 30 directed VM paths, 26 of them unneeded and open. After Lab 2: the unneeded web-to-database path in prod is closed. Others, such as WEB-P to APP-D, are still open until the default is switched to deny. One rule is progress, not the finish. Your project is finished when the allow rules cover the needed flows and the default rule is deny.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Forgetting Publish changes and testing an unpublished rule. (2) Switching the default to deny before the allow rules exist. (3) Putting a broad allow above a narrow deny in the same category, so the deny never matches. (4) Typing a tag value with different capitalisation and wondering why a VM is not in the group.</p></div>
<div class="exam"><p><b>Exam trap.</b> The order of a segmentation project is discover, group, allow, then deny by default. "Set default deny first" is the wrong answer.</p></div>

<div class="scn"><h4>The rule that did nothing</h4><p>An engineer at Narmada added the web-to-database deny and ran a test. The flow was still allowed. She checked the group members (correct), the rule order (correct) and finally the top bar: it showed unpublished changes. After Publish changes the test returned DENY.</p><p><b>Lesson:</b> when policy seems ignored, check publish before debugging anything else.</p></div>

<div class="iv"><p class="q">"How would you start micro-segmenting an existing flat data center?"</p><p>Strong answer: discover flows first, group workloads by tags, write allow rules for the needed flows and verify with Traceflow and logs, then move the default rule to deny, publishing at each step. Start with one application, not the whole data center. Mention reviewing hit counters on the default rule to find forgotten flows.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zero trust for east-west traffic: allow only the flows the application needs.</li>
<li>Micro-segmentation builds small boundaries with policy at each vNIC, not new cabling.</li>
<li>Four steps: discover flows, group workloads, write allow rules, switch the default to deny.</li>
<li>Nothing is enforced until you click Publish changes.</li>
<li>Traceflow asks the policy; Send test traffic counts hits and writes the flow log.</li>
</ul></div>
`,hi:`
<h3>Zero trust, east-west traffic par lagu</h3>
<p><b>Zero trust</b> ka matlab hai ki network ke "andar" hone se koi trust nahi milta. Har connection ko aisi cheez maana jaata hai jise justify karna hai. Servers ke beech ke traffic ke liye sawal ban jaata hai: <i>kya application ko yeh flow chahiye?</i> Haan, to bilkul wahi flow allow karo. Nahi, to woh flow hona hi nahi chahiye.</p>
<p><b>Micro-segmentation</b> yahi kaam chhote tukdon mein karne ka tareeka hai. Ek bade trusted zone ki jagah har application tier, ya har workload, ki apni boundary hoti hai, aur rules batate hain ki un boundaries ke paar kaunse thode flows allowed hain. Boundary har vNIC par policy se banti hai (chapter 3), naye cables ya subnets se nahi.</p>

<h3>Allow-list thinking</h3>
<p>Do mindsets hote hain. <b>Block-list</b> kehti hai "sab kuch allow karo, jo bure cheezein mujhe pata hain unhe block karo". <b>Allow-list</b> kehti hai "sab kuch block karo, sirf wahi allow karo jo achhi cheezein mujhe pata hain". Pehli wahan fail hoti hai jahan aapne socha nahi. Doosri safely fail hoti hai: bhoola hua flow block ho jaata hai aur kisi ko pata chal jaata hai, chupchap khula nahi rehta. Micro-segmentation aapko pehle se doosre mindset par le jaati hai, ek time par ek application.</p>
<p>Dhyan do: aap "sab block karo" se shuru nahi kar sakte. Agar zaroori allow rules banne se pehle default rule ko deny kar diya, to application ruk jaati hai. Isliye project ka ek order hota hai.</p>

<h3>Segmentation project ke chaar steps</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Segmentation project ke chaar steps">
<rect x="10" y="30" width="140" height="70" rx="10" fill="#bae6fd"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="13">1. Discover</text><text x="80" y="75" text-anchor="middle" class="svg-muted" font-size="11">kaunse flows hain</text>
<rect x="175" y="30" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="245" y="55" text-anchor="middle" class="svg-ink" font-size="13">2. Group</text><text x="245" y="75" text-anchor="middle" class="svg-muted" font-size="11">role se workloads</text>
<rect x="340" y="30" width="140" height="70" rx="10" fill="#fde68a"/><text x="410" y="55" text-anchor="middle" class="svg-ink" font-size="13">3. Allow rules</text><text x="410" y="75" text-anchor="middle" class="svg-muted" font-size="11">sirf zaroori flows</text>
<rect x="505" y="30" width="125" height="70" rx="10" fill="#fed7aa"/><text x="567" y="55" text-anchor="middle" class="svg-ink" font-size="13">4. Default deny</text><text x="567" y="75" text-anchor="middle" class="svg-muted" font-size="11">phir verify</text>
<line x1="150" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><line x1="315" y1="65" x2="340" y2="65" stroke="#64748b" stroke-width="2"/><line x1="480" y1="65" x2="505" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">Har change ke baad Publish: publish hone tak kuch count nahi hota</text>
</svg><p class="cap">Default rule ko deny sabse aakhir mein kiya jaata hai, kabhi pehle nahi.</p></div>
<ol>
<li><b>Flows discover karo.</b> Jaano kaun kisse baat karta hai, flow log, application owners aur design documents se. Iske bina aap ya to kuch zaroori block kar doge ya kuch gair-zaroori allow kar doge.</li>
<li><b>Workloads group karo.</b> VMs ko role ke hisaab se groups mein rakho, jaise "Web servers (prod)". Group <b>dynamic</b> ho sakta hai, tags aur names se bana, to sahi tags wala naya VM apne aap join ho jaata hai, ya <b>static</b>, ek fixed list. Tag values exact text ki tarah compare hoti hain, isliye "web" aur "Web" alag hain.</li>
<li><b>Allow rules likho.</b> Har zaroori flow ke liye ek rule: group se group, ek service, allow. Rule ko sahi category mein rakho. Jin rules ka saboot chahiye unhe log karo.</li>
<li><b>Default ko deny karo.</b> Allow rules verify hone ke baad hi default rule ko drop ya reject karo. Ab jo listed nahi hai woh block hai.</li>
</ol>

<h3>Publish ke baad hi count hota hai</h3>
<p>Console aapke edits ko draft mein rakhta hai. Jab tak aap <b>Publish changes</b> par click nahi karte, kuch enforce nahi hota. Isse adhoore rules live hone se bachte hain, aur iska matlab yeh bhi hai ki sahi rule jo aap publish karna bhool gaye woh kuch nahi karta. Agar policy edit karne ke baad test result wahi dikhe, to pehle publish check karo.</p>

<h3>Console pages ka tour</h3>
<table class="cmp">
<tr><th>Page</th><th>Iska kaam</th></tr>
<tr><td>Overview</td><td>Environment ka summary: VMs, groups, rules ki ginti aur recent activity.</td></tr>
<tr><td>Inventory</td><td>VMs ki list, unke IP addresses aur tags ke saath.</td></tr>
<tr><td>Groups</td><td>Group definitions aur unke maujooda members.</td></tr>
<tr><td>Policy</td><td>Categories aur rules, plus default rule. Edits yahan hote hain aur phir Publish changes se publish hote hain.</td></tr>
<tr><td>Tools</td><td>Traceflow (policy se poocho kya hoga, counters nahi badalte) aur Send test traffic (hits ginta hai aur flow log likhta hai).</td></tr>
<tr><td>Flows and logs</td><td>Test traffic aur rule hits ka record: kisne kisse baat ki aur kaunse rule ne decide kiya.</td></tr>
<tr><td>Alerts and audit</td><td>Risky policy ki warnings, jaise khaali group par lagaya rule, aur changes ka record.</td></tr>
</table>

<h3>Lab 2 walkthrough: aapka pehla rule</h3>
<p>Lab 2 mein aap Lab 1 mein dikhe hole ko band karte ho. <b>Policy</b> page mein Application category kholo aur ek rule jodo: source "Web servers (prod)", destination "Database servers (prod)", service any, action deny. Uska logging on karo. <b>Publish changes</b> par click karo. Phir WEB-P se DB-P tak sql par Traceflow chalao.</p>
<pre class="out">Flow: WEB-P -&gt; DB-P (sql)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (1 rule)
  Deny dev to prod: no match (source no, destination yes, service yes, applied to yes)
Category application (5 rules)
  Web to app (prod): no match (source yes, destination no, service no, applied to yes)
  App to DB (prod): no match (source no, destination yes, service yes, applied to yes)
  Web to app (dev): no match (source no, destination no, service no, applied to yes)
  App to DB (dev): no match (source no, destination no, service yes, applied to yes)
<span class="hl">  MATCH Deny web to DB (prod) -&gt; DENY (applied to DFW)</span>
<span class="hl">Result: DENY by rule "Deny web to DB (prod)" in application</span></pre>
<p>Ab saabit karo ki application abhi bhi chalti hai. APP-P se DB-P tak sql trace karo:</p>
<pre class="out">Flow: APP-P -&gt; DB-P (sql)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (1 rule)
  Deny dev to prod: no match (source no, destination yes, service yes, applied to yes)
Category application (5 rules)
  Web to app (prod): no match (source no, destination no, service no, applied to yes)
<span class="hl">  MATCH App to DB (prod) -&gt; ALLOW (applied to DFW)</span>
<span class="hl">Result: ALLOW by rule "App to DB (prod)" in application</span></pre>
<p>Saath hi WEB-P se APP-P h&#116;tps par check karo (abhi bhi "Web to app (prod)" se allowed) aur WEB-D se APP-D h&#116;tps par (dev untouched hai kyunki aapka rule sirf prod groups ka naam leta hai). Naya rule Application list ke end mein hai; wahan safe hai kyunki koi pehle ka rule web se database ko match nahi karta. Dhyan do ki Traceflow pehle match ke baad rules print karna band kar deta hai.</p>

<div class="eg"><p><b>Worked example.</b> Pehle: 30 directed VM paths, jinme 26 gair-zaroori aur khule. Lab 2 ke baad: prod ka gair-zaroori web-to-database path band. Baaki, jaise WEB-P se APP-D, tab tak khule hain jab tak default deny nahi hota. Ek rule progress hai, finish nahi. Aapka project tab khatam hota hai jab allow rules zaroori flows cover karein aur default rule deny ho.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Publish changes bhool jaana aur unpublished rule ko test karna. (2) Allow rules banne se pehle default ko deny kar dena. (3) Same category mein narrow deny ke ooper broad allow rakh dena, jisse deny kabhi match nahi karta. (4) Tag value alag capitalisation mein type karna aur sochna ki VM group mein kyun nahi aaya.</p></div>
<div class="exam"><p><b>Exam trap.</b> Segmentation project ka order hai discover, group, allow, phir default deny. "Pehle default deny karo" galat answer hai.</p></div>

<div class="scn"><h4>Rule jisne kuch nahi kiya</h4><p>Narmada ki ek engineer ne web-to-database deny jodkar test chalaya. Flow abhi bhi allowed tha. Usne group members dekhe (sahi), rule order dekha (sahi) aur aakhir mein top bar dekha: wahan unpublished changes dikh rahe the. Publish changes ke baad test ne DENY diya.</p><p><b>Seekh:</b> jab policy ignore hoti dikhe, kuch aur debug karne se pehle publish check karo.</p></div>

<div class="iv"><p class="q">"Ek maujooda flat data center ko micro-segment karna kaise shuru karoge?"</p><p>Strong answer: pehle flows discover karo, tags se workloads group karo, zaroori flows ke liye allow rules likho aur Traceflow aur logs se verify karo, phir default rule ko deny karo, har step par publish karte hue. Poore data center se nahi, ek application se shuru karo. Bhoole hue flows dhoondhne ke liye default rule ke hit counters review karne ki baat bhi karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>East-west traffic ke liye zero trust: sirf wahi flows allow karo jo application ko chahiye.</li>
<li>Micro-segmentation har vNIC par policy se chhoti boundaries banati hai, naye cabling se nahi.</li>
<li>Chaar steps: flows discover, workloads group, allow rules likho, default ko deny karo.</li>
<li>Publish changes dabane tak kuch enforce nahi hota.</li>
<li>Traceflow policy se poochta hai; Send test traffic hits ginta hai aur flow log likhta hai.</li>
</ul></div>
`}};export{e as default};