var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The whole module in one minute</h3>
<p>A distributed firewall policy is read in a fixed order: Emergency, Infrastructure, Environment, Application, then the default rule. Inside a category the first matching rule wins. A fresh console has a default rule of allow, which makes the policy a deny-list; micro-segmentation aims at an allow-list with a default of deny. You get there safely by listing flows, adding allow rules with logging, watching hit counters (especially the default rule's), fixing gaps, verifying with Traceflow, and only then flipping the default. Most "my rule does nothing" tickets are order problems: a wider rule sits above a narrower one, a rule is disabled, an earlier category already answered, or the change was never published. Traceflow explains and never counts; test traffic counts and logs. Context Profiles add application and FQDN awareness beyond ports and are a concept only here.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Summary: categories, allow-list, order, evidence">
<rect x="10" y="30" width="145" height="80" rx="10" fill="#bae6fd"/><text x="82" y="62" text-anchor="middle" class="svg-ink" font-size="13">Categories</text><text x="82" y="82" text-anchor="middle" class="svg-muted" font-size="11">fixed reading order</text>
<rect x="175" y="30" width="145" height="80" rx="10" fill="#bbf7d0"/><text x="247" y="62" text-anchor="middle" class="svg-ink" font-size="13">Allow-list</text><text x="247" y="82" text-anchor="middle" class="svg-muted" font-size="11">flip default last</text>
<rect x="340" y="30" width="145" height="80" rx="10" fill="#fed7aa"/><text x="412" y="62" text-anchor="middle" class="svg-ink" font-size="13">Order</text><text x="412" y="82" text-anchor="middle" class="svg-muted" font-size="11">specific above general</text>
<rect x="505" y="30" width="125" height="80" rx="10" fill="#ddd6fe"/><text x="567" y="62" text-anchor="middle" class="svg-ink" font-size="13">Evidence</text><text x="567" y="82" text-anchor="middle" class="svg-muted" font-size="11">hits, logs, trace</text>
<line x1="155" y1="70" x2="175" y2="70" stroke="#64748b" stroke-width="2"/><line x1="320" y1="70" x2="340" y2="70" stroke="#64748b" stroke-width="2"/><line x1="485" y1="70" x2="505" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Four ideas to retell: categories, allow-list, order, evidence.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>List the four categories and the default rule in reading order, and say what each is for.</li>
<li>Explain why Allow DNS in Infrastructure lets dev reach prod on dns even though Environment denies dev to prod.</li>
<li>Define deny-list and allow-list, and say which default rule action each uses.</li>
<li>Describe the six-step safe route to default deny and why the flip is last.</li>
<li>Read a Traceflow and name the rule or default that decided, and the reason each earlier rule did not match.</li>
<li>Fix an allow-any-above-deny problem by reordering, and verify blocked and allowed flows afterwards.</li>
<li>Spot a disabled rule and a blanket deny that shadows rules below it.</li>
<li>Add an Emergency deny rule and prove with Traceflow that it wins over Application rules.</li>
<li>Send test traffic, read the hit counters and the flow log, and explain what a zero count does and does not prove.</li>
<li>Explain what Context Profiles are for, and say that the simulator does not model them.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Category</dt><dd>A group of rules read in a fixed order: Emergency, Infrastructure, Environment, Application.</dd>
<dt>Default rule</dt><dd>The rule that decides every flow no other rule matched; allow on a fresh install.</dd>
<dt>Deny-list</dt><dd>Policy style with default allow; you list what to block.</dd>
<dt>Allow-list</dt><dd>Policy style with default deny; you list what to permit.</dd>
<dt>First match wins</dt><dd>Rules are read top to bottom and the first match decides.</dd>
<dt>Shadowed rule</dt><dd>A rule that never acts because a rule above it matches first.</dd>
<dt>Hit counter</dt><dd>The number of times a rule decided a flow.</dd>
<dt>Flow log</dt><dd>A record of decisions: source, destination, service, action, rule, category.</dd>
<dt>Traceflow</dt><dd>A read-only test that shows every rule considered for one flow.</dd>
<dt>Send test traffic</dt><dd>A test that runs the flow through the policy and updates hits and the flow log.</dd>
<dt>Quarantine</dt><dd>Isolating a VM by tag, using prepared Emergency rules in both directions.</dd>
<dt>Context Profile</dt><dd>A concept for matching by application or domain name beyond ports; not modelled.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Category reading order</td><td>Emergency, Infrastructure, Environment, Application, default rule</td></tr>
<tr><td>Which wins, category order or rule position?</td><td>Category order</td></tr>
<tr><td>Default rule on a fresh install</td><td>Allow</td></tr>
<tr><td>Does Traceflow change hit counters?</td><td>No</td></tr>
<tr><td>Is an unpublished edit enforced?</td><td>No, only after Publish changes</td></tr>
<tr><td>Best fix for allow-any above a deny</td><td>Move the deny above; do not delete</td></tr>
<tr><td>Fix for a forgotten ssh flow under default deny</td><td>One narrow allow rule from the right source group to the right destination group</td></tr>
</table>

<div class="note"><p><b>What this module does not model.</b> The Ethernet (layer 2) category, the Jump to Application action, a real ESXi kernel module, NSX Manager clustering, containers, public-cloud workloads and Context Profiles. This is independent training based on published product documentation, not vendor content, and it makes no claim of certification coverage.</p></div>

<div class="warn"><p><b>Mistakes to avoid on exam day.</b> Reading the category order wrongly; saying Traceflow counts hits; flipping the default before the allow rules exist; deleting instead of reordering; forgetting to publish.</p></div>
<div class="exam"><p><b>Exam trap.</b> "An Application allow rule exists for a flow, but an Emergency deny matches the same flow. What happens?" Deny, because Emergency is read first.</p></div>

<div class="scn"><h4>A policy handover in four lines</h4><p>Before a holiday, a Narmada engineer left a note: the category plan, the list of allow rules with logging on, the default hit count (zero for a week, but month end pending), and the rollback step. The colleague who took over flipped the default after month end, ran the critical Traceflows and found no surprises.</p><p><b>Lesson:</b> good policy work leaves evidence and a way back.</p></div>

<div class="iv"><p class="q">"Walk me through building a segmentation policy from a fresh environment."</p><p>Strong answer: place broad blocks in Emergency, shared services in Infrastructure, environment walls in Environment and per-app flows in Application; start with default allow, add allow rules with logging, observe default hits over a full cycle, verify with Traceflow, flip to deny, test, and keep the rollback ready. Mention order traps and that Traceflow does not count hits.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Categories run Emergency, Infrastructure, Environment, Application, then default; first match wins in a category.</li>
<li>Allow-list means default deny, reached by adding allows first and flipping last.</li>
<li>Specific rules go above general ones; reorder before you delete.</li>
<li>Hit counters and logs are evidence; Traceflow explains and does not count.</li>
<li>Context Profiles are a concept here; unpublished edits do nothing.</li>
</ul></div>
`,hi:`
<h3>Poora module ek minute mein</h3>
<p>Distributed firewall policy fixed order mein padhi jaati hai: Emergency, Infrastructure, Environment, Application, phir default rule. Category ke andar pehla matching rule jeetta hai. Fresh console ka default rule allow hota hai, jo policy ko deny-list banata hai; micro-segmentation default deny ke saath allow-list ki taraf jaati hai. Wahan safely pahunchne ke liye: flows list karo, logging ke saath allow rules jodo, hit counters dekho (khaaskar default rule ka), gaps bharo, Traceflow se verify karo, aur tabhi default flip karo. Zyada-tar "mera rule kuch nahi karta" tickets order problems hote hain: wider rule narrow ke ooper hai, rule disabled hai, pehle ki category ne jawab de diya, ya change publish hi nahi hua. Traceflow samjhata hai aur ginta nahi; test traffic ginta hai aur log likhta hai. Context Profiles ports ke aage application aur FQDN awareness dete hain aur yahan sirf concept hain.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Summary: categories, allow-list, order, evidence">
<rect x="10" y="30" width="145" height="80" rx="10" fill="#bae6fd"/><text x="82" y="62" text-anchor="middle" class="svg-ink" font-size="13">Categories</text><text x="82" y="82" text-anchor="middle" class="svg-muted" font-size="11">fixed reading order</text>
<rect x="175" y="30" width="145" height="80" rx="10" fill="#bbf7d0"/><text x="247" y="62" text-anchor="middle" class="svg-ink" font-size="13">Allow-list</text><text x="247" y="82" text-anchor="middle" class="svg-muted" font-size="11">default aakhir mein</text>
<rect x="340" y="30" width="145" height="80" rx="10" fill="#fed7aa"/><text x="412" y="62" text-anchor="middle" class="svg-ink" font-size="13">Order</text><text x="412" y="82" text-anchor="middle" class="svg-muted" font-size="11">specific ooper</text>
<rect x="505" y="30" width="125" height="80" rx="10" fill="#ddd6fe"/><text x="567" y="62" text-anchor="middle" class="svg-ink" font-size="13">Saboot</text><text x="567" y="82" text-anchor="middle" class="svg-muted" font-size="11">hits, logs, trace</text>
<line x1="155" y1="70" x2="175" y2="70" stroke="#64748b" stroke-width="2"/><line x1="320" y1="70" x2="340" y2="70" stroke="#64748b" stroke-width="2"/><line x1="485" y1="70" x2="505" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Chaar ideas jo aap dobara bata sako: categories, allow-list, order, saboot.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Chaar categories aur default rule ko reading order mein list karo, aur batao har ek kis kaam ki hai.</li>
<li>Samjhao ki Infrastructure ka Allow DNS dev ko prod tak dns par kyun pahunchne deta hai, jabki Environment dev to prod deny karta hai.</li>
<li>Deny-list aur allow-list define karo, aur batao har ek kaunsa default action use karta hai.</li>
<li>Default deny tak jaane ke chhe-step safe route ka varnan karo aur batao flip aakhir mein kyun.</li>
<li>Traceflow padho aur batao kaunse rule ya default ne decide kiya, aur har pehle rule ne match kyun nahi kiya.</li>
<li>Allow-any-above-deny problem ko reorder se theek karo, aur baad mein blocked aur allowed flows verify karo.</li>
<li>Disabled rule aur neeche ke rules ko shadow karne wala blanket deny pehchaano.</li>
<li>Emergency deny rule jodo aur Traceflow se saabit karo ki woh Application rules par bhaari hai.</li>
<li>Test traffic bhejo, hit counters aur flow log padho, aur samjhao ki zero count kya saabit karta hai aur kya nahi.</li>
<li>Samjhao Context Profiles kis kaam ke hain, aur batao simulator unhe model nahi karta.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Category</dt><dd>Rules ka group jo fixed order mein padha jaata hai: Emergency, Infrastructure, Environment, Application.</dd>
<dt>Default rule</dt><dd>Woh rule jo har us flow ko decide karta hai jise koi aur rule match nahi karta; fresh install par allow.</dd>
<dt>Deny-list</dt><dd>Default allow wali policy style; aap list karte ho kya block karna hai.</dd>
<dt>Allow-list</dt><dd>Default deny wali policy style; aap list karte ho kya permit karna hai.</dd>
<dt>First match wins</dt><dd>Rules ooper se neeche padhe jaate hain aur pehla match decide karta hai.</dd>
<dt>Shadowed rule</dt><dd>Aisa rule jo kabhi kaam nahi karta kyunki uske ooper ka rule pehle match hota hai.</dd>
<dt>Hit counter</dt><dd>Kitni baar rule ne flow decide kiya, uski ginti.</dd>
<dt>Flow log</dt><dd>Faislon ka record: source, destination, service, action, rule, category.</dd>
<dt>Traceflow</dt><dd>Read-only test jo ek flow ke liye har considered rule dikhata hai.</dd>
<dt>Send test traffic</dt><dd>Test jo flow ko policy se chalata hai aur hits aur flow log update karta hai.</dd>
<dt>Quarantine</dt><dd>VM ko tag se isolate karna, dono directions ke tayyar Emergency rules ke saath.</dd>
<dt>Context Profile</dt><dd>Ports ke aage application ya domain name se match karne ka concept; model nahi hai.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp">
<tr><th>Sawal</th><th>Jawab</th></tr>
<tr><td>Category reading order</td><td>Emergency, Infrastructure, Environment, Application, default rule</td></tr>
<tr><td>Category order ya rule position, kaun jeetta hai?</td><td>Category order</td></tr>
<tr><td>Fresh install par default rule</td><td>Allow</td></tr>
<tr><td>Kya Traceflow hit counters badalta hai?</td><td>Nahi</td></tr>
<tr><td>Kya unpublished edit enforce hota hai?</td><td>Nahi, sirf Publish changes ke baad</td></tr>
<tr><td>Deny ke ooper allow-any ka best fix</td><td>Deny ko ooper le jao; delete mat karo</td></tr>
<tr><td>Default deny mein bhoole hue ssh flow ka fix</td><td>Sahi source group se sahi destination group tak ek narrow allow rule</td></tr>
</table>

<div class="note"><p><b>Yeh module kya model nahi karta.</b> Ethernet (layer 2) category, Jump to Application action, real ESXi kernel module, NSX Manager clustering, containers, public-cloud workloads aur Context Profiles. Yeh independent training hai jo published product documentation par based hai, vendor content nahi, aur certification coverage ka koi claim nahi.</p></div>

<div class="warn"><p><b>Exam ke din bachne wali galtiyan.</b> Category order galat padhna; kehna ki Traceflow hits ginta hai; allow rules se pehle default flip karna; reorder ki jagah delete karna; publish bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Ek flow ke liye Application allow rule hai, lekin Emergency deny usi flow ko match karta hai. Kya hota hai?" Deny, kyunki Emergency pehle padhi jaati hai.</p></div>

<div class="scn"><h4>Chaar lines mein policy handover</h4><p>Chhutti se pehle Narmada ke ek engineer ne note chhoda: category plan, logging on wale allow rules ki list, default hit count (ek hafta zero, lekin month end baaki), aur rollback step. Jis colleague ne kaam sambhala usne month end ke baad default flip kiya, critical Traceflows chalaye aur koi surprise nahi mila.</p><p><b>Seekh:</b> achha policy kaam saboot aur wapas jaane ka raasta chhodta hai.</p></div>

<div class="iv"><p class="q">"Fresh environment se segmentation policy banane ka process samjhao."</p><p>Strong answer: broad blocks Emergency mein, shared services Infrastructure mein, environment walls Environment mein aur per-app flows Application mein; default allow se shuru, logging ke saath allow rules, poore cycle tak default hits observe, Traceflow se verify, deny par flip, test, aur rollback tayyar. Order traps bolo aur yeh ki Traceflow hits nahi ginta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Categories Emergency, Infrastructure, Environment, Application, phir default; category ke andar pehla match jeetta hai.</li>
<li>Allow-list matlab default deny, jo pehle allows jodkar aur flip aakhir mein karke milta hai.</li>
<li>Specific rules general ke ooper; delete se pehle reorder.</li>
<li>Hit counters aur logs saboot hain; Traceflow samjhata hai, ginta nahi.</li>
<li>Context Profiles yahan concept hain; unpublished edits kuch nahi karte.</li>
</ul></div>
`}};export{e as default};