var e={id:`categories-order`,h:{en:`Categories, rule order and the default rule`,hi:`Categories, rule order aur default rule`},body:{en:`
<h3>Why this chapter matters</h3>
<p>Groups say who, Applied To says where. This chapter says <b>in what order</b> the rules are read and <b>what happens when nothing matches</b>. Most real-world outages and most security holes in a distributed firewall come from getting this order wrong. After this chapter you can:</p>
<ul>
<li>name the four categories in order and give the job of each;</li>
<li>explain first-match-wins, and what a disabled rule does;</li>
<li>explain the default rule, why a fresh install allows everything, and how to harden it safely;</li>
<li>explain the difference between a draft change and a published change.</li>
</ul>

<h3>An analogy: layers of rules in a company</h3>
<p>In a company, the fire marshal's order ("evacuate now") beats everything. Below it come building-wide rules ("everyone may use the lifts"), then department rules ("production staff may not enter the office floor"), then team rules ("the billing team may open the billing system"). If nothing covers a situation, a final default decides. Higher layers are read first, and the first rule that applies ends the search.</p>

<h3>The four categories, in priority order</h3>
<table class="cmp">
<tr><th>Order</th><th>Category</th><th>Typical job</th><th>Narmada example</th></tr>
<tr><td>1</td><td>Emergency</td><td>Incident response: isolate or force-allow quickly</td><td>Deny anything from a VM tagged quarantine = true</td></tr>
<tr><td>2</td><td>Infrastructure</td><td>Shared services every VM needs</td><td>Allow DNS</td></tr>
<tr><td>3</td><td>Environment</td><td>Walls between big zones</td><td>Deny dev to prod</td></tr>
<tr><td>4</td><td>Application</td><td>Per-application allow rules</td><td>Web to app, app to DB</td></tr>
<tr><td>last</td><td>Default rule</td><td>Catch-all when nothing matched</td><td>Allow (fresh install) or deny (hardened)</td></tr>
</table>
<p>Published product documentation also lists an Ethernet (layer 2) category ahead of Emergency. This simulator does not model it, and it does not model the "Jump to Application" action. Our order is Emergency, Infrastructure, Environment, Application, then the default rule.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Rule evaluation order through the categories">
<rect x="20" y="20" width="130" height="44" rx="8" fill="#fed7aa"/><text x="85" y="47" text-anchor="middle" class="svg-ink" font-size="13">1 Emergency</text>
<rect x="170" y="20" width="130" height="44" rx="8" fill="#fde68a"/><text x="235" y="47" text-anchor="middle" class="svg-ink" font-size="13">2 Infrastructure</text>
<rect x="320" y="20" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="385" y="47" text-anchor="middle" class="svg-ink" font-size="13">3 Environment</text>
<rect x="470" y="20" width="150" height="44" rx="8" fill="#bae6fd"/><text x="545" y="47" text-anchor="middle" class="svg-ink" font-size="13">4 Application</text>
<line x1="150" y1="42" x2="170" y2="42" stroke="#64748b" stroke-width="2"/><line x1="300" y1="42" x2="320" y2="42" stroke="#64748b" stroke-width="2"/><line x1="450" y1="42" x2="470" y2="42" stroke="#64748b" stroke-width="2"/>
<text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="12">Inside a category: top rule first, then the next. The first match ends the search.</text>
<rect x="170" y="125" width="300" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="13">Default rule: only if nothing matched</text>
<line x1="545" y1="64" x2="545" y2="110" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="545" y1="110" x2="470" y2="140" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">Empty categories are skipped. A disabled rule is skipped.</text>
</svg><p class="cap">Higher category first, top rule first. The first match decides; the default rule is the safety net.</p></div>

<h3>First match wins</h3>
<p>The engine walks the categories in order and the rules top to bottom. The moment a rule matches (source, destination, service and Applied To all yes), it returns the rule's action and stops. Rules below it are never looked at. A rule that is <b>disabled</b> is skipped. Which means two practical facts: a specific exception must sit <em>above</em> the broad rule it excepts, and a broad deny placed too high shadows everything under it.</p>

<h3>Worked example 1: higher category beats lower</h3>
<p>WEB-D (dev) asks DB-P (prod) for a DNS lookup. The Environment category says "deny dev to prod", yet the flow is allowed. Real output:</p>
<pre class="out">Flow: WEB-D -&gt; DB-P (dns)
Category infrastructure (1 rule)
  <span class="hl">MATCH Allow DNS -&gt; ALLOW (applied to DFW)</span>
Result: ALLOW by rule "Allow DNS" in infrastructure</pre>
<p>Infrastructure is read before Environment. The same flow on sql is denied by the Environment rule, because Allow DNS does not match sql. A category is a priority level, not a folder.</p>

<h3>Worked example 2: the Emergency category</h3>
<p>The security team tags WEB-P with quarantine = true. Emergency rules deny any flow from or to the quarantine group. Real output for WEB-P to APP-P:</p>
<pre class="out">Flow: WEB-P -&gt; APP-P (h&#116;tps)
Category emergency (2 rules)
  <span class="hl">MATCH Isolate quarantined (outbound) -&gt; DENY (applied to DFW)</span>
Result: DENY by rule "Isolate quarantined (outbound)" in emergency</pre>
<p>No other category was even read. This is why incident response rules live in Emergency: nothing below can undo them, and one tag isolates a VM in seconds. (Tagging is chapter 1; the group g-quarantine is chapter 2.)</p>

<h3>Worked example 3: order inside one category</h3>
<p>Someone adds "Allow web anywhere" (web group to any, any service) at the top of the Application category and "Deny web to DB (prod)" at the bottom. WEB-P to DB-P on sql:</p>
<pre class="out">Flow: WEB-P -&gt; DB-P (sql)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (1 rule)
  Deny dev to prod: no match (source no, destination yes, service yes, applied to yes)
Category application (6 rules)
  <span class="hl">MATCH Allow web anywhere -&gt; ALLOW (applied to DFW)</span>
Result: ALLOW by rule "Allow web anywhere" in application</pre>
<p>The deny never gets a turn. Moving the deny above the allow turns the result into "DENY by rule Deny web to DB (prod)" (same inputs, run on the engine). One drag of a rule changed the outcome.</p>

<h3>The default rule</h3>
<p>If no rule matched, the <b>default rule</b> decides. In a fresh install it is <b>allow</b>: the product starts permissive so that switching it on does not break a running data center. A flow with no rule, such as WEB-P to DB-P on sql, therefore passes with the line "No rule matched: default rule -&gt; ALLOW". That is the flat network from module vd-start, still open.</p>
<p>Hardening means changing the default to <b>deny</b>, but only after every needed flow has its own allow rule. Done in the wrong order, it breaks things. Real output for an admin ssh from APP-P to DB-P that nobody listed, with the default at deny:</p>
<pre class="out">Flow: APP-P -&gt; DB-P (ssh)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (1 rule)
  Deny dev to prod: no match (source no, destination yes, service yes, applied to yes)
Category application (4 rules)
  Web to app (prod): no match (source no, destination no, service no, applied to yes)
  <span class="hl">App to DB (prod): no match (source yes, destination yes, service no, applied to yes)</span>
  Web to app (dev): no match (source no, destination no, service no, applied to yes)
  App to DB (dev): no match (source no, destination no, service no, applied to yes)
No rule matched: default rule -&gt; DENY
Result: DENY by the default rule</pre>
<p>Source yes, destination yes, service no: the right pair of groups, but ssh is not sql. Add an allow rule for ssh first if the admin flow is needed.</p>

<h3>Draft versus published</h3>
<p>Edits you make in the console are a <b>draft</b> (candidate). Only <b>Publish changes</b> turns the draft into the running, enforced policy. Traceflow and test traffic read the published policy, so an unpublished edit changes nothing. Traceflow is read only; <b>Send test traffic</b> also counts rule hits and writes the flow log.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Putting a broad allow above a specific deny. (2) Hardening the default to deny before listing the flows. (3) Forgetting to publish and testing the old policy. (4) Putting emergency rules in Application, where Environment and Infrastructure can override them.</p></div>
<div class="exam"><p><b>Exam trap.</b> Category priority is Emergency, Infrastructure, Environment, Application, default. Inside a category the order is top to bottom and the first match wins. A fresh install default is allow.</p></div>

<div class="scn"><h4>The Friday change that opened a wall</h4><p>An engineer needed dev tools to reach a test server and added "Allow dev tools" at the top of the Environment category. The "Deny dev to prod" rule sat just below it. On Monday a scan showed dev machines reaching production databases. Traceflow showed MATCH Allow dev tools, and the deny was never reached. Narrowing the new rule to the one test server and keeping the deny above anything broad closed the gap.</p><p><b>Lesson:</b> a broad rule high in a category shadows everything under it. Read the order before you publish.</p></div>

<div class="iv"><p class="q">"In what order does a distributed firewall evaluate rules, and what is the default rule?"</p><p>Strong answer: by category in priority order (Emergency, Infrastructure, Environment, Application), top to bottom inside each, first match wins, and then the default rule for anything unmatched. A fresh install defaults to allow, so a real project builds the allow rules first, verifies with Traceflow, and only then switches the default to deny and publishes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Categories are read in order: Emergency, Infrastructure, Environment, Application, then the default rule.</li>
<li>Inside a category rules run top to bottom and the first match wins; disabled rules are skipped.</li>
<li>A higher category beats a lower one, so incident rules belong in Emergency.</li>
<li>A fresh install default rule is allow; harden it to deny only after the needed allows exist.</li>
<li>Only published changes are enforced; Traceflow is read only and test traffic counts hits.</li>
</ul></div>
`,hi:`
<h3>Yeh chapter kyun zaroori hai</h3>
<p>Groups batate hain kaun, Applied To batata hai kahan. Yeh chapter batata hai rules <b>kis order mein</b> padhe jaate hain aur <b>kuch match na ho to kya hota hai</b>. Distributed firewall ke zyadatar real-world outages aur security holes is order ko galat karne se aate hain. Is chapter ke baad aap yeh kar sakoge:</p>
<ul>
<li>chaaron categories order mein bata sakoge aur har ka kaam bata sakoge;</li>
<li>first-match-wins samjha sakoge, aur disabled rule kya karta hai yeh bata sakoge;</li>
<li>default rule samjha sakoge, fresh install sab kyun allow karta hai, aur ise safely kaise harden karte hain;</li>
<li>draft change aur published change ka fark samjha sakoge.</li>
</ul>

<h3>Ek analogy: company mein rules ki layers</h3>
<p>Company mein fire marshal ka order ("abhi evacuate karo") sab par bhaari hai. Uske neeche building-wide rules aate hain ("sab lift use kar sakte hain"), phir department rules ("production staff office floor par nahi ja sakta"), phir team rules ("billing team billing system khol sakti hai"). Agar koi situation cover nahi hoti, to aakhri default decide karta hai. Upar ki layers pehle padhi jaati hain, aur jo pehla rule lagu hota hai woh search khatam kar deta hai.</p>

<h3>Chaar categories, priority order mein</h3>
<table class="cmp">
<tr><th>Order</th><th>Category</th><th>Aam kaam</th><th>Narmada example</th></tr>
<tr><td>1</td><td>Emergency</td><td>Incident response: jaldi isolate ya force-allow</td><td>Tag quarantine = true wale VM se aane wala sab deny</td></tr>
<tr><td>2</td><td>Infrastructure</td><td>Shared services jo har VM ko chahiye</td><td>Allow DNS</td></tr>
<tr><td>3</td><td>Environment</td><td>Bade zones ke beech deewarein</td><td>Deny dev to prod</td></tr>
<tr><td>4</td><td>Application</td><td>Har application ke allow rules</td><td>Web to app, app to DB</td></tr>
<tr><td>last</td><td>Default rule</td><td>Kuch match na ho to catch-all</td><td>Allow (fresh install) ya deny (hardened)</td></tr>
</table>
<p>Published product documentation Emergency se pehle ek Ethernet (layer 2) category bhi batati hai. Yeh simulator use model nahi karta, aur "Jump to Application" action bhi model nahi karta. Hamara order hai Emergency, Infrastructure, Environment, Application, phir default rule.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Categories se guzarta rule evaluation order">
<rect x="20" y="20" width="130" height="44" rx="8" fill="#fed7aa"/><text x="85" y="47" text-anchor="middle" class="svg-ink" font-size="13">1 Emergency</text>
<rect x="170" y="20" width="130" height="44" rx="8" fill="#fde68a"/><text x="235" y="47" text-anchor="middle" class="svg-ink" font-size="13">2 Infrastructure</text>
<rect x="320" y="20" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="385" y="47" text-anchor="middle" class="svg-ink" font-size="13">3 Environment</text>
<rect x="470" y="20" width="150" height="44" rx="8" fill="#bae6fd"/><text x="545" y="47" text-anchor="middle" class="svg-ink" font-size="13">4 Application</text>
<line x1="150" y1="42" x2="170" y2="42" stroke="#64748b" stroke-width="2"/><line x1="300" y1="42" x2="320" y2="42" stroke="#64748b" stroke-width="2"/><line x1="450" y1="42" x2="470" y2="42" stroke="#64748b" stroke-width="2"/>
<text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="12">Category ke andar: ooper wala rule pehle. Pehla match search khatam karta hai.</text>
<rect x="170" y="125" width="300" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="13">Default rule: sirf jab kuch match na ho</text>
<line x1="545" y1="64" x2="545" y2="110" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="545" y1="110" x2="470" y2="140" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">Khaali categories skip hoti hain. Disabled rule skip hota hai.</text>
</svg><p class="cap">Upar ki category pehle, ooper ka rule pehle. Pehla match decide karta hai; default rule safety net hai.</p></div>

<h3>First match wins</h3>
<p>Engine categories ko order mein aur rules ko ooper se neeche walk karta hai. Jaise hi koi rule match karta hai (source, destination, service aur Applied To sab yes), woh rule ka action return karke ruk jaata hai. Uske neeche ke rules dekhe hi nahi jaate. <b>Disabled</b> rule skip hota hai. Iska matlab do practical baatein: specific exception ko us broad rule ke <em>ooper</em> hona chahiye jiska woh exception hai, aur bahut ooper rakha broad deny uske neeche ke sab ko shadow kar deta hai.</p>

<h3>Worked example 1: upar ki category neeche wali ko haraati hai</h3>
<p>WEB-D (dev) DB-P (prod) se DNS lookup maangta hai. Environment category kehti hai "deny dev to prod", phir bhi flow allow hota hai. Real output:</p>
<pre class="out">Flow: WEB-D -&gt; DB-P (dns)
Category infrastructure (1 rule)
  <span class="hl">MATCH Allow DNS -&gt; ALLOW (applied to DFW)</span>
Result: ALLOW by rule "Allow DNS" in infrastructure</pre>
<p>Infrastructure Environment se pehle padhi jaati hai. Wahi flow sql par Environment rule se deny hota hai, kyunki Allow DNS sql ko match nahi karta. Category ek priority level hai, folder nahi.</p>

<h3>Worked example 2: Emergency category</h3>
<p>Security team WEB-P par quarantine = true tag lagati hai. Emergency rules quarantine group se aane ya jaane wale har flow ko deny karte hain. WEB-P se APP-P ka real output:</p>
<pre class="out">Flow: WEB-P -&gt; APP-P (h&#116;tps)
Category emergency (2 rules)
  <span class="hl">MATCH Isolate quarantined (outbound) -&gt; DENY (applied to DFW)</span>
Result: DENY by rule "Isolate quarantined (outbound)" in emergency</pre>
<p>Koi aur category padhi hi nahi gayi. Isiliye incident response rules Emergency mein rehte hain: neeche ka koi rule unhe undo nahi kar sakta, aur ek tag VM ko seconds mein isolate kar deta hai. (Tagging chapter 1 hai; group g-quarantine chapter 2 hai.)</p>

<h3>Worked example 3: ek category ke andar order</h3>
<p>Koi Application category ke sabse ooper "Allow web anywhere" (web group se any tak, any service) aur sabse neeche "Deny web to DB (prod)" jodta hai. WEB-P se DB-P, sql par:</p>
<pre class="out">Flow: WEB-P -&gt; DB-P (sql)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (1 rule)
  Deny dev to prod: no match (source no, destination yes, service yes, applied to yes)
Category application (6 rules)
  <span class="hl">MATCH Allow web anywhere -&gt; ALLOW (applied to DFW)</span>
Result: ALLOW by rule "Allow web anywhere" in application</pre>
<p>Deny ki baari kabhi aati hi nahi. Deny ko allow ke ooper le jaane se result "DENY by rule Deny web to DB (prod)" ho jaata hai (wahi inputs, engine par chalaya). Ek rule ko drag karne se outcome badal gaya.</p>

<h3>Default rule</h3>
<p>Agar koi rule match nahi hua, to <b>default rule</b> decide karta hai. Fresh install mein woh <b>allow</b> hota hai: product permissive shuru hota hai taaki ise chalu karne se chalta hua data center na toote. Jis flow ka koi rule nahi, jaise WEB-P se DB-P sql par, woh line "No rule matched: default rule -&gt; ALLOW" ke saath nikal jaata hai. Yeh module vd-start wala flat network hai, abhi bhi khula.</p>
<p>Harden karne ka matlab default ko <b>deny</b> karna hai, lekin tab jab har zaroori flow ka apna allow rule ho. Galat order mein karoge to cheezein tootengi. Default deny ke saath APP-P se DB-P tak admin ssh jo kisi ne list nahi kiya, uska real output:</p>
<pre class="out">Flow: APP-P -&gt; DB-P (ssh)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (1 rule)
  Deny dev to prod: no match (source no, destination yes, service yes, applied to yes)
Category application (4 rules)
  Web to app (prod): no match (source no, destination no, service no, applied to yes)
  <span class="hl">App to DB (prod): no match (source yes, destination yes, service no, applied to yes)</span>
  Web to app (dev): no match (source no, destination no, service no, applied to yes)
  App to DB (dev): no match (source no, destination no, service no, applied to yes)
No rule matched: default rule -&gt; DENY
Result: DENY by the default rule</pre>
<p>Source yes, destination yes, service no: groups ka jodi sahi hai, par ssh sql nahi hai. Admin flow zaroori ho to pehle ssh ka allow rule jodo.</p>

<h3>Draft versus published</h3>
<p>Console mein aapke edits ek <b>draft</b> (candidate) hote hain. Sirf <b>Publish changes</b> draft ko running, enforced policy banata hai. Traceflow aur test traffic published policy padhte hain, isliye unpublished edit kuch nahi badalta. Traceflow read only hai; <b>Send test traffic</b> rule hits bhi gintata hai aur flow log likhta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Specific deny ke ooper broad allow rakhna. (2) Flows list kiye bina default ko deny karna. (3) Publish bhool kar purani policy test karna. (4) Emergency rules ko Application mein rakhna, jahan Environment aur Infrastructure unhe override kar sakte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Category priority hai Emergency, Infrastructure, Environment, Application, default. Category ke andar order ooper se neeche hai aur pehla match jeetta hai. Fresh install ka default allow hai.</p></div>

<div class="scn"><h4>Friday ka change jisne deewar khol di</h4><p>Ek engineer ko dev tools ko ek test server tak pahunchana tha aur usne Environment category ke sabse ooper "Allow dev tools" jodha. "Deny dev to prod" rule uske theek neeche tha. Monday ko scan mein dikha ki dev machines production databases tak pahunch rahe hain. Traceflow ne MATCH Allow dev tools dikhaya, aur deny tak baari aayi hi nahi. Naye rule ko sirf us ek test server tak narrow karne aur deny ko kisi bhi broad rule ke ooper rakhne se gap band hua.</p><p><b>Seekh:</b> category mein ooper rakha broad rule neeche ke sab ko shadow kar deta hai. Publish se pehle order padho.</p></div>

<div class="iv"><p class="q">"Distributed firewall rules ko kis order mein evaluate karta hai, aur default rule kya hai?"</p><p>Strong answer: category ke priority order mein (Emergency, Infrastructure, Environment, Application), har ke andar ooper se neeche, pehla match jeetta hai, aur jo kuch match na ho uske liye default rule. Fresh install ka default allow hota hai, isliye real project pehle allow rules banata hai, Traceflow se verify karta hai, aur tabhi default ko deny karke publish karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Categories order mein padhi jaati hain: Emergency, Infrastructure, Environment, Application, phir default rule.</li>
<li>Category ke andar rules ooper se neeche chalte hain, pehla match jeetta hai; disabled rules skip hote hain.</li>
<li>Upar ki category neeche wali ko haraati hai, isliye incident rules Emergency mein rakho.</li>
<li>Fresh install ka default rule allow hai; zaroori allows ban jaane ke baad hi use deny karo.</li>
<li>Sirf published changes enforce hote hain; Traceflow read only hai aur test traffic hits gintata hai.</li>
</ul></div>
`}};export{e as default};