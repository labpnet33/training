var e={id:`rule-order-traps`,h:{en:`Rule order traps, shadowed rules and emergency isolation`,hi:`Rule order ke traps, shadowed rules aur emergency isolation`},body:{en:`
<h3>First match wins, and why it bites</h3>
<p>Imagine a security guard with a stack of instructions. He reads from the top and acts on the first one that fits. If the top sheet says "let all developers in", the sheet further down saying "keep developers out of finance" is never read. The sheet is not wrong. It is <b>shadowed</b>: a rule higher up catches the flows first, so the lower rule never gets to act.</p>
<p>In a distributed firewall policy this is the most common cause of "my rule does nothing". There are three flavours: a wider rule above a narrower one, a rule disabled by accident, and a rule in a later category that an earlier category already answered.</p>

<h3>Trap 1: allow-any above a deny</h3>
<div class="eg"><p><b>Worked example.</b> Narmada's Environment category should contain "Deny dev to prod". Someone added "Allow dev tools" (source all dev, destination any, service any) at the top. A developer on WEB-D then reached the production database. Traceflow tells the story:</p></div>
<pre class="out">Flow: WEB-D -&gt; DB-P (sql)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (2 rules)
  <span class="hl">MATCH Allow dev tools -&gt; ALLOW (applied to DFW)</span>
Result: ALLOW by rule "Allow dev tools" in environment</pre>
<p>The line "Category environment (2 rules)" followed by an immediate MATCH tells you the first rule matched and the second was never examined. The fix is order only: move "Deny dev to prod" above "Allow dev tools". You do not delete either rule, because "Allow dev tools" may still be useful for other destinations. After the move and Publish changes:</p>
<pre class="out">Flow: WEB-D -&gt; DB-P (sql)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (2 rules)
  <span class="hl">MATCH Deny dev to prod -&gt; DENY (applied to DFW)</span>
Result: DENY by rule "Deny dev to prod" in environment</pre>
<p>Two checks after any reorder: the blocked flow is now blocked, and the flows that should still work do still work. Dev inside dev still passes through the Application category, and WEB-D to DB-P on dns still ends in Infrastructure with "Allow DNS", because Infrastructure is read before Environment.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Before and after: allow rule above deny shadows it, after reorder deny is read first">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="13">Before: deny is shadowed</text>
<rect x="40" y="30" width="240" height="40" rx="8" fill="#bbf7d0"/><text x="160" y="55" text-anchor="middle" class="svg-ink" font-size="12">1  Allow dev tools (any)</text>
<rect x="40" y="80" width="240" height="40" rx="8" fill="#e2e8f0" stroke="#64748b" stroke-dasharray="5 4"/><text x="160" y="105" text-anchor="middle" class="svg-muted" font-size="12">2  Deny dev to prod (never read)</text>
<text x="160" y="150" text-anchor="middle" class="svg-ink" font-size="12">WEB-D to DB-P: ALLOW</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="13">After: order fixed</text>
<rect x="360" y="30" width="240" height="40" rx="8" fill="#fed7aa"/><text x="480" y="55" text-anchor="middle" class="svg-ink" font-size="12">1  Deny dev to prod</text>
<rect x="360" y="80" width="240" height="40" rx="8" fill="#bbf7d0"/><text x="480" y="105" text-anchor="middle" class="svg-ink" font-size="12">2  Allow dev tools (any)</text>
<text x="480" y="150" text-anchor="middle" class="svg-ink" font-size="12">WEB-D to DB-P: DENY</text>
</svg><p class="cap">The same two rules. Only the order changed, and the outcome flipped.</p></div>
<p>The general rule: <b>put specific rules above general ones</b>. A deny for one pair of groups is specific; an allow from one group to anything is general.</p>

<h3>Trap 2: a disabled rule</h3>
<p>A rule has an enabled switch. A disabled rule is skipped by the evaluator and the trace says so. If someone disables "Deny dev to prod" for testing and forgets, the same flow reads:</p>
<pre class="out">Category environment (1 rule)
  <span class="hl">Deny dev to prod: disabled, skipped</span>
...
No rule matched: default rule -&gt; ALLOW</pre>
<p>Dev reaches prod again, but this time through the default rule. Disabled rules are invisible risk, so list them in every policy review.</p>

<h3>Trap 3: a blanket deny that hides everything below</h3>
<p>A deny from any to any on any service in a category shadows every rule under it in that category. The console raises an alert for this. If someone puts a rule "Deny all" at the top of Environment, the Alerts and audit page shows a warning of this form: "Category environment: rule "Deny all" denies any to any and shadows the rules below it". Treat such an alert as a to-do, not as noise.</p>

<h3>Emergency isolation: the category that wins</h3>
<p>Now the useful side of ordering. Emergency is read first, so a rule there cannot be overridden by anything below. Narmada keeps two prepared rules for incident response: one denies traffic <b>from</b> any VM in the group "Quarantine" and one denies traffic <b>to</b> it. The group is dynamic, built on the tag quarantine=true, so isolating a suspect VM means adding that one tag. Suppose APP-P is tagged and a web server tries to talk to it:</p>
<pre class="out">Flow: WEB-P -&gt; APP-P (h&#116;tps)
Category emergency (2 rules)
  Isolate quarantined (outbound): no match (source no, destination yes, service yes, applied to yes)
  <span class="hl">MATCH Isolate quarantined (inbound) -&gt; DENY (applied to DFW)</span>
Result: DENY by rule "Isolate quarantined (inbound)" in emergency</pre>
<p>And APP-P trying to reach its database is stopped by the outbound rule. Both directions are needed: one rule would leave the VM free to either send or receive. The legitimate application rule "Web to app (prod)" is still in the policy, but it is in a lower category and is never reached.</p>
<p>Without the prepared rules, a tag alone does nothing. The engine raises a warning: "VM APP-P has the quarantine tag but no enabled deny rule uses the quarantine group".</p>

<div class="note"><p><b>Another blanket example.</b> In Lab 3 you add a deny rule on service rdp, source any, destination any, in Emergency. It beats every Application rule, now and in future. Keep the number of Emergency rules very small and review them often, because they override everything.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Fixing shadowing by deleting the wrong rule; reorder first. (2) Placing the new rule at the bottom of a category and wondering why it does nothing. (3) Forgetting to test both the blocked and the allowed flows after a reorder. (4) Adding only one direction of an isolation rule. (5) Forgetting Applied To: a rule applied to a group with no members is enforced nowhere.</p></div>
<div class="exam"><p><b>Exam trap.</b> "A deny rule exists but traffic is allowed. What do you check?" The trace: which rule matched first, whether it is higher in the same category or in an earlier category, whether the deny is disabled, whether it is published, and its Applied To.</p></div>

<div class="scn"><h4>The audit that found two rules in the wrong order</h4><p>An internal auditor asked why a developer could reach the production database even though a deny rule existed. The engineer ran Traceflow from WEB-D to DB-P and saw the allow rule matching first. He moved the deny rule up one place, published, re-ran the same Traceflow and also checked a dns flow and a dev-to-dev flow. All three came back as expected and the auditor closed the finding.</p><p><b>Lesson:</b> evidence is a before and after trace, not a screenshot of the rule list.</p></div>

<div class="iv"><p class="q">"A deny rule is not working. How do you troubleshoot it?"</p><p>Strong answer: run Traceflow for the exact flow and read which rule matched. Check order inside the category, categories above it, enabled state, whether the change was published, group membership of both VMs (tags are exact text) and Applied To. Fix by order or scope, not by deleting rules, then repeat the trace.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A shadowed rule is correct but never reached because a higher rule matched first.</li>
<li>Put specific rules above general ones; reorder instead of deleting.</li>
<li>Disabled rules are skipped and show as "disabled, skipped" in the trace.</li>
<li>A blanket any-any deny hides every rule below it in its category and raises an alert.</li>
<li>Emergency is read first: prepared quarantine rules in both directions isolate a VM by tag.</li>
</ul></div>
`,hi:`
<h3>First match wins, aur yeh kaatta kyun hai</h3>
<p>Ek security guard socho jiske paas instructions ka stack hai. Woh ooper se padhta hai aur pehli fit hone wali instruction par amal karta hai. Agar sabse ooper wali sheet kehti hai "saare developers ko andar jaane do", to neeche wali sheet jo kehti hai "developers ko finance se door rakho" kabhi padhi hi nahi jaati. Sheet galat nahi hai. Woh <b>shadowed</b> hai: ooper ka rule flows ko pehle pakad leta hai, to neeche wala rule kabhi kaam nahi karta.</p>
<p>Distributed firewall policy mein "mera rule kuch nahi karta" ka sabse common karan yahi hai. Iske teen roop hain: narrow rule ke ooper wider rule, galti se disable hua rule, aur aisa rule jiska jawab pehle ki category pehle hi de chuki hai.</p>

<h3>Trap 1: deny ke ooper allow-any</h3>
<div class="eg"><p><b>Worked example.</b> Narmada ki Environment category mein "Deny dev to prod" hona chahiye. Kisi ne sabse ooper "Allow dev tools" (source poora dev, destination any, service any) jod diya. Phir WEB-D ka developer production database tak pahunch gaya. Traceflow kahani batata hai:</p></div>
<pre class="out">Flow: WEB-D -&gt; DB-P (sql)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (2 rules)
  <span class="hl">MATCH Allow dev tools -&gt; ALLOW (applied to DFW)</span>
Result: ALLOW by rule "Allow dev tools" in environment</pre>
<p>"Category environment (2 rules)" ke turant baad MATCH ka matlab hai pehla rule match hua aur doosra kabhi examine hi nahi hua. Fix sirf order hai: "Deny dev to prod" ko "Allow dev tools" ke ooper le jao. Koi rule delete mat karo, kyunki "Allow dev tools" doosri destinations ke liye kaam ka ho sakta hai. Move aur Publish changes ke baad:</p>
<pre class="out">Flow: WEB-D -&gt; DB-P (sql)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (2 rules)
  <span class="hl">MATCH Deny dev to prod -&gt; DENY (applied to DFW)</span>
Result: DENY by rule "Deny dev to prod" in environment</pre>
<p>Kisi bhi reorder ke baad do checks: jo flow block hona tha woh ab block hai, aur jo flows chalne chahiye woh ab bhi chalte hain. Dev ke andar ka flow Application category se guzarta hai, aur WEB-D se DB-P dns ab bhi Infrastructure mein "Allow DNS" par khatam hota hai, kyunki Infrastructure Environment se pehle padhi jaati hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Pehle aur baad: allow rule deny ke ooper to deny shadowed, reorder ke baad deny pehle padha jaata hai">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="13">Pehle: deny shadowed hai</text>
<rect x="40" y="30" width="240" height="40" rx="8" fill="#bbf7d0"/><text x="160" y="55" text-anchor="middle" class="svg-ink" font-size="12">1  Allow dev tools (any)</text>
<rect x="40" y="80" width="240" height="40" rx="8" fill="#e2e8f0" stroke="#64748b" stroke-dasharray="5 4"/><text x="160" y="105" text-anchor="middle" class="svg-muted" font-size="12">2  Deny dev to prod (kabhi nahi padha)</text>
<text x="160" y="150" text-anchor="middle" class="svg-ink" font-size="12">WEB-D se DB-P: ALLOW</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="13">Baad: order theek</text>
<rect x="360" y="30" width="240" height="40" rx="8" fill="#fed7aa"/><text x="480" y="55" text-anchor="middle" class="svg-ink" font-size="12">1  Deny dev to prod</text>
<rect x="360" y="80" width="240" height="40" rx="8" fill="#bbf7d0"/><text x="480" y="105" text-anchor="middle" class="svg-ink" font-size="12">2  Allow dev tools (any)</text>
<text x="480" y="150" text-anchor="middle" class="svg-ink" font-size="12">WEB-D se DB-P: DENY</text>
</svg><p class="cap">Wahi do rules. Sirf order badla, aur result palat gaya.</p></div>
<p>General niyam: <b>specific rules ko general rules ke ooper rakho</b>. Do groups ke beech ka deny specific hai; ek group se kisi bhi jagah ka allow general hai.</p>

<h3>Trap 2: disabled rule</h3>
<p>Rule ka enabled switch hota hai. Disabled rule evaluator skip kar deta hai aur trace bata deta hai. Agar kisi ne testing ke liye "Deny dev to prod" disable kiya aur bhool gaya, to wahi flow aise padhta hai:</p>
<pre class="out">Category environment (1 rule)
  <span class="hl">Deny dev to prod: disabled, skipped</span>
...
No rule matched: default rule -&gt; ALLOW</pre>
<p>Dev phir prod tak pahunchta hai, lekin is baar default rule se. Disabled rules chhupa hua risk hain, isliye har policy review mein unhe list karo.</p>

<h3>Trap 3: blanket deny jo neeche sab chhupa de</h3>
<p>Category mein any se any, any service ka deny, us category mein apne neeche ke har rule ko shadow karta hai. Console iske liye alert deta hai. Agar kisi ne Environment ke top par "Deny all" rule rakha, to Alerts and audit page is shakal ki warning dikhata hai: "Category environment: rule "Deny all" denies any to any and shadows the rules below it". Aise alert ko to-do samjho, noise nahi.</p>

<h3>Emergency isolation: jo category jeetti hai</h3>
<p>Ab ordering ka kaam ka pehlu. Emergency sabse pehle padhi jaati hai, to wahan ka rule neeche ki kisi cheez se override nahi ho sakta. Narmada incident response ke liye do tayyar rules rakhta hai: ek group "Quarantine" ke kisi bhi VM <b>se</b> aane wala traffic deny karta hai aur ek <b>us tak</b> jaane wala. Group dynamic hai, tag quarantine=true par bana, to shak wale VM ko isolate karna matlab sirf woh ek tag lagana. Maan lo APP-P tagged hai aur web server use baat karna chahta hai:</p>
<pre class="out">Flow: WEB-P -&gt; APP-P (h&#116;tps)
Category emergency (2 rules)
  Isolate quarantined (outbound): no match (source no, destination yes, service yes, applied to yes)
  <span class="hl">MATCH Isolate quarantined (inbound) -&gt; DENY (applied to DFW)</span>
Result: DENY by rule "Isolate quarantined (inbound)" in emergency</pre>
<p>Aur APP-P jab apne database tak jaana chahe to outbound rule use rok deta hai. Dono directions chahiye: ek rule se VM ya to bhej sakta ya receive kar sakta rehta. Legitimate rule "Web to app (prod)" policy mein abhi bhi hai, lekin woh neeche ki category mein hai aur kabhi reach nahi hota.</p>
<p>Tayyar rules ke bina sirf tag kuch nahi karta. Engine warning deta hai: "VM APP-P has the quarantine tag but no enabled deny rule uses the quarantine group".</p>

<div class="note"><p><b>Ek aur blanket example.</b> Lab 3 mein aap Emergency mein service rdp, source any, destination any ka deny rule jodte ho. Woh har Application rule ko haraa deta hai, abhi aur aage bhi. Emergency rules ki sankhya bahut kam rakho aur unhe aksar review karo, kyunki woh sab kuch override karte hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Shadowing ko galat rule delete karke theek karna; pehle reorder karo. (2) Naya rule category ke sabse neeche rakhkar sochna ki kaam kyun nahi karta. (3) Reorder ke baad blocked aur allowed dono flows test karna bhool jaana. (4) Isolation rule ki sirf ek direction jodna. (5) Applied To bhool jaana: jis group mein koi member nahi usse applied rule kahin enforce nahi hota.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Deny rule hai lekin traffic allowed hai. Kya check karoge?" Trace: pehle kaunsa rule match hua, kya woh usi category mein ooper hai ya pehle ki category mein, kya deny disabled hai, kya publish hua, aur uska Applied To.</p></div>

<div class="scn"><h4>Audit jisne do rules ka galat order pakda</h4><p>Ek internal auditor ne poocha ki deny rule hone ke baad bhi developer production database tak kaise pahunch gaya. Engineer ne WEB-D se DB-P tak Traceflow chalaya aur allow rule ko pehle match hote dekha. Usne deny rule ko ek jagah ooper kiya, publish kiya, wahi Traceflow dobara chalaya aur ek dns flow aur ek dev-to-dev flow bhi check kiya. Teeno expected aaye aur auditor ne finding close kar di.</p><p><b>Seekh:</b> saboot before aur after trace hai, rule list ka screenshot nahi.</p></div>

<div class="iv"><p class="q">"Deny rule kaam nahi kar raha. Troubleshoot kaise karoge?"</p><p>Strong answer: exact flow ke liye Traceflow chalao aur padho kaunsa rule match hua. Category ke andar order, ooper ki categories, enabled state, publish hua ya nahi, dono VMs ki group membership (tags exact text hote hain) aur Applied To check karo. Fix order ya scope se karo, rules delete karke nahi, phir trace dobara chalao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Shadowed rule sahi hota hai lekin reach nahi hota kyunki ooper ka rule pehle match hota hai.</li>
<li>Specific rules ko general ke ooper rakho; delete ki jagah reorder karo.</li>
<li>Disabled rules skip hote hain aur trace mein "disabled, skipped" dikhte hain.</li>
<li>any-any blanket deny apni category ke neeche ke har rule ko chhupa deta hai aur alert deta hai.</li>
<li>Emergency sabse pehle padhi jaati hai: dono directions ke tayyar quarantine rules tag se VM ko isolate karte hain.</li>
</ul></div>
`}};export{e as default};