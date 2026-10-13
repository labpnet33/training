var e={id:`applied-to`,h:{en:`Applied To: where a rule is enforced`,hi:`Applied To: rule kahan enforce hota hai`},body:{en:`
<h3>Why this chapter matters</h3>
<p>A rule has a source, a destination, a service and an action. It also has a fifth setting that beginners overlook: <b>Applied To</b>. It does not change <em>who</em> the rule talks about. It changes <em>where</em> the rule is checked. Many "my rule exists but does nothing" tickets end here. After this chapter you can:</p>
<ul>
<li>explain what Applied To controls, in one sentence;</li>
<li>predict whether a rule is enforced for a flow when Applied To is DFW or a group;</li>
<li>explain why the rule is enforced when the <em>source or the destination</em> VM is in the Applied To group;</li>
<li>find and fix a rule that is applied to the wrong group or to a group with no members.</li>
</ul>

<h3>An analogy: a notice and the doors it is pinned on</h3>
<p>Think of a company notice: "visitors must show an ID card". Writing the notice is one thing. Deciding <b>which doors</b> it is pinned on is another. Pinned on every door, it works everywhere. Pinned only on the back gate, a visitor entering through the main door never sees it, and the rule might as well not exist.</p>
<p>The rule (source, destination, service, action) is the notice. <b>Applied To</b> is the list of doors. In a distributed firewall the doors are the <b>vNICs</b> of the VMs (see module vd-start).</p>

<h3>The two choices</h3>
<dl class="terms">
<dt>DFW</dt><dd>The default. The rule is pushed to every vNIC. Any flow in the data center is checked against it.</dd>
<dt>A group</dt><dd>The rule is pushed only to the vNICs of that group's members. A VM outside the group does not carry the rule.</dd>
</dl>
<p>In a real product, narrowing Applied To is a way to keep each host's rule set small. In this simulator what you can observe is the effect on matching, and that is what the rest of this chapter teaches.</p>

<h3>Source or destination: the rule that works at either end</h3>
<p>A flow is checked twice (module vd-start): at the sender's vNIC on the way out and at the receiver's vNIC on the way in. So a rule with a group in Applied To is enforced for a flow when <b>either the source VM or the destination VM is a member of that group</b>. It is not required that both are.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Applied To group decides which vNICs enforce the rule">
<rect x="20" y="60" width="150" height="70" rx="10" fill="#bae6fd"/><text x="95" y="90" text-anchor="middle" class="svg-ink" font-size="13">WEB-P</text><text x="95" y="110" text-anchor="middle" class="svg-muted" font-size="12">source vNIC (out)</text>
<rect x="470" y="60" width="150" height="70" rx="10" fill="#bbf7d0"/><text x="545" y="90" text-anchor="middle" class="svg-ink" font-size="13">APP-P</text><text x="545" y="110" text-anchor="middle" class="svg-muted" font-size="12">destination vNIC (in)</text>
<line x1="170" y1="95" x2="470" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="12">WEB-P to APP-P, service h&#116;tps</text>
<text x="95" y="160" text-anchor="middle" class="svg-ink" font-size="12">Applied To web group: checked</text>
<text x="545" y="160" text-anchor="middle" class="svg-ink" font-size="12">Applied To app group: checked</text>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">Applied To db group: neither end is a member, so never checked</text>
</svg><p class="cap">The rule is enforced if at least one end of the flow is in the Applied To group.</p></div>

<h3>Worked example 1: the Applied To that points at the wrong group (Lab 4)</h3>
<p>The default rule is deny. The rule "Web to app (prod)" is enabled and its source, destination and service are right, but its Applied To is the database group <code>g-db-prod</code> (only DB-P). A Traceflow from WEB-P to APP-P on h&#116;tps gives this real output:</p>
<pre class="out">Flow: WEB-P -&gt; APP-P (h&#116;tps)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (1 rule)
  Deny dev to prod: no match (source no, destination yes, service yes, applied to yes)
Category application (4 rules)
  <span class="hl">Web to app (prod): no match (source yes, destination yes, service yes, applied to no)</span>
  App to DB (prod): no match (source no, destination no, service no, applied to yes)
  Web to app (dev): no match (source no, destination no, service yes, applied to yes)
  App to DB (dev): no match (source no, destination no, service no, applied to yes)
No rule matched: default rule -&gt; DENY
Result: DENY by the default rule</pre>
<p>Read the highlighted line. Source yes, destination yes, service yes: the rule is perfect. <b>Applied to no</b>: neither WEB-P nor APP-P is in the Applied To group, so the rule was never enforced for this flow. The fix is in exactly one column: set Applied To back to DFW (or to a group that contains the web or app VMs), then press <b>Publish changes</b>. Do not touch the default rule, the other rules, or the action.</p>

<h3>Worked example 2: the group that works from either end</h3>
<p>Now set the same rule's Applied To to the app group <code>g-app-prod</code> (only APP-P). WEB-P is not a member, but APP-P, the destination, is. Real output:</p>
<pre class="out">Flow: WEB-P -&gt; APP-P (h&#116;tps)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (1 rule)
  Deny dev to prod: no match (source no, destination yes, service yes, applied to yes)
Category application (4 rules)
  <span class="hl">MATCH Web to app (prod) -&gt; ALLOW (applied to g-app-prod)</span>
Result: ALLOW by rule "Web to app (prod)" in application</pre>
<p>The rule matched because the destination VM is in the Applied To group. A group that holds only the source VM would work too.</p>

<h3>A missing or empty group enforces nowhere</h3>
<p>If Applied To names a group that does not exist, or a group with no members, then no vNIC carries the rule and it is enforced nowhere. The trace shows the same <b>applied to no</b>. The Alerts and audit page raises a warning for this case, with the wording: the rule is applied to a group which has no members, so it is not enforced anywhere. Be careful though: that alert fires only for a group with <em>no</em> members. In Lab 4 the group <code>g-db-prod</code> has a member (DB-P), so there is no alert about it, and only the Traceflow reveals the mistake.</p>

<h3>How to choose Applied To in practice</h3>
<ul>
<li>When in doubt, leave it at DFW. It is the safe default and the easiest to reason about.</li>
<li>Narrow it only for a reason, and make sure the group contains the VMs at one end of every flow the rule must cover.</li>
<li>After any change, run Traceflow and read the applied-to column.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> (1) Reading Applied To as "who the rule is about": that is source and destination. (2) Setting Applied To to the destination's group "to be tidy" and then adding a flow where neither VM is in that group. (3) Trusting the alert list: a wrong but non-empty group raises no alert. (4) Fixing the symptom by loosening the action or the default rule instead of the one wrong column.</p></div>
<div class="exam"><p><b>Exam trap.</b> Applied To controls where a rule is enforced, not who it matches. When asked "why does a correct rule not match", check Applied To after source, destination and service.</p></div>

<div class="scn"><h4>The hardened default that broke the app</h4><p>After the default rule was switched to deny, the shop application stopped: web could not reach app. The rule list looked perfect. The engineer ran Traceflow and saw "applied to no" on the web-to-app rule. Months earlier someone had narrowed that rule to the database group while tidying, and with the default on allow nobody noticed, because the default rule quietly let the flow through. Setting the rule back to DFW and publishing fixed it in two minutes.</p><p><b>Lesson:</b> a permissive default hides scoping mistakes. They appear the day you harden it.</p></div>

<div class="iv"><p class="q">"What does Applied To do, and how can a correct-looking rule fail to take effect?"</p><p>Strong answer: Applied To decides which vNICs the rule is pushed to: all of them (DFW) or the vNICs of one group. A flow is enforced if the source or the destination is in that group. If the group has neither VM, or is empty, the rule is enforced nowhere, even though source, destination and service are correct. I would confirm with a Traceflow and fix only that column.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Applied To decides where a rule is enforced; source and destination decide whom it matches.</li>
<li>DFW means every vNIC; a group means only the vNICs of its members.</li>
<li>A rule is enforced when the source VM or the destination VM is in the Applied To group.</li>
<li>A missing or empty Applied To group enforces nowhere; the trace says applied to no.</li>
<li>A permissive default rule can hide a wrong Applied To until the default is hardened.</li>
</ul></div>
`,hi:`
<h3>Yeh chapter kyun zaroori hai</h3>
<p>Rule ke paas source, destination, service aur action hota hai. Ek paanchvi setting bhi hoti hai jise beginners ignore kar dete hain: <b>Applied To</b>. Yeh nahi badalti ki rule <em>kiske</em> baare mein hai. Yeh badalti hai ki rule <em>kahan</em> check hota hai. "Mera rule hai par kuch nahi karta" wale kai tickets yahin khatam hote hain. Is chapter ke baad aap yeh kar sakoge:</p>
<ul>
<li>ek sentence mein bata sakoge ki Applied To kya control karta hai;</li>
<li>predict kar sakoge ki Applied To DFW ya group ho to rule kisi flow ke liye enforce hota hai ya nahi;</li>
<li>samjha sakoge ki rule tab bhi enforce hota hai jab <em>source ya destination</em> VM Applied To group mein ho;</li>
<li>galat group ya bina members wale group par applied rule dhundh kar theek kar sakoge.</li>
</ul>

<h3>Ek analogy: notice aur woh darwaze jahan woh lagi hai</h3>
<p>Company ka notice socho: "visitors ID card dikhayein". Notice likhna ek baat hai. Yeh tay karna ki woh <b>kaunse darwazon</b> par lagegi doosri baat hai. Har darwaze par lagi ho to har jagah kaam karti hai. Sirf back gate par lagi ho to main darwaze se aane wale visitor ko woh dikhti hi nahi, aur rule hone na hone barabar hai.</p>
<p>Rule (source, destination, service, action) notice hai. <b>Applied To</b> darwazon ki list hai. Distributed firewall mein darwaze VMs ke <b>vNICs</b> hain (module vd-start dekho).</p>

<h3>Do choices</h3>
<dl class="terms">
<dt>DFW</dt><dd>Default. Rule har vNIC par push hota hai. Data center ka har flow isse check hota hai.</dd>
<dt>Ek group</dt><dd>Rule sirf us group ke members ke vNICs par push hota hai. Group ke bahar ka VM rule nahi rakhta.</dd>
</dl>
<p>Asli product mein Applied To ko narrow karna har host ka rule set chhota rakhne ka tareeka hai. Is simulator mein jo aap observe kar sakte ho woh matching par asar hai, aur is chapter ka baaki hissa wahi sikhata hai.</p>

<h3>Source ya destination: rule jo kisi bhi end par kaam karta hai</h3>
<p>Flow do baar check hota hai (module vd-start): sender ke vNIC par jaate waqt aur receiver ke vNIC par aate waqt. Isliye Applied To mein group wala rule kisi flow ke liye tab enforce hota hai jab <b>source VM ya destination VM us group ka member ho</b>. Dono ka hona zaroori nahi.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Applied To group tay karta hai kaunse vNICs rule enforce karte hain">
<rect x="20" y="60" width="150" height="70" rx="10" fill="#bae6fd"/><text x="95" y="90" text-anchor="middle" class="svg-ink" font-size="13">WEB-P</text><text x="95" y="110" text-anchor="middle" class="svg-muted" font-size="12">source vNIC (out)</text>
<rect x="470" y="60" width="150" height="70" rx="10" fill="#bbf7d0"/><text x="545" y="90" text-anchor="middle" class="svg-ink" font-size="13">APP-P</text><text x="545" y="110" text-anchor="middle" class="svg-muted" font-size="12">destination vNIC (in)</text>
<line x1="170" y1="95" x2="470" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="12">WEB-P to APP-P, service h&#116;tps</text>
<text x="95" y="160" text-anchor="middle" class="svg-ink" font-size="12">Applied To web group: check</text>
<text x="545" y="160" text-anchor="middle" class="svg-ink" font-size="12">Applied To app group: check</text>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">Applied To db group: dono ends member nahi, check nahi hota</text>
</svg><p class="cap">Rule tab enforce hota hai jab flow ka kam se kam ek end Applied To group mein ho.</p></div>

<h3>Worked example 1: Applied To jo galat group ko point karta hai (Lab 4)</h3>
<p>Default rule deny hai. Rule "Web to app (prod)" enabled hai aur uska source, destination, service sahi hain, lekin uska Applied To database group <code>g-db-prod</code> (sirf DB-P) hai. WEB-P se APP-P tak h&#116;tps ka Traceflow yeh real output deta hai:</p>
<pre class="out">Flow: WEB-P -&gt; APP-P (h&#116;tps)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (1 rule)
  Deny dev to prod: no match (source no, destination yes, service yes, applied to yes)
Category application (4 rules)
  <span class="hl">Web to app (prod): no match (source yes, destination yes, service yes, applied to no)</span>
  App to DB (prod): no match (source no, destination no, service no, applied to yes)
  Web to app (dev): no match (source no, destination no, service yes, applied to yes)
  App to DB (dev): no match (source no, destination no, service no, applied to yes)
No rule matched: default rule -&gt; DENY
Result: DENY by the default rule</pre>
<p>Highlighted line padho. Source yes, destination yes, service yes: rule bilkul sahi hai. <b>Applied to no</b>: na WEB-P na APP-P Applied To group mein hai, isliye rule is flow ke liye kabhi enforce hi nahi hua. Fix sirf ek column mein hai: Applied To ko wapas DFW karo (ya aise group par jisme web ya app VMs hon), phir <b>Publish changes</b> dabao. Default rule, doosre rules ya action ko haath mat lagao.</p>

<h3>Worked example 2: group jo kisi bhi end se kaam karta hai</h3>
<p>Ab usi rule ka Applied To app group <code>g-app-prod</code> (sirf APP-P) karo. WEB-P member nahi hai, lekin APP-P, yaani destination, hai. Real output:</p>
<pre class="out">Flow: WEB-P -&gt; APP-P (h&#116;tps)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (1 rule)
  Deny dev to prod: no match (source no, destination yes, service yes, applied to yes)
Category application (4 rules)
  <span class="hl">MATCH Web to app (prod) -&gt; ALLOW (applied to g-app-prod)</span>
Result: ALLOW by rule "Web to app (prod)" in application</pre>
<p>Rule isliye match hua kyunki destination VM Applied To group mein hai. Jis group mein sirf source VM ho woh bhi kaam karega.</p>

<h3>Missing ya empty group kahin enforce nahi hota</h3>
<p>Agar Applied To aise group ka naam le jo exist nahi karta, ya jisme koi member nahi, to koi bhi vNIC rule nahi rakhta aur woh kahin enforce nahi hota. Trace mein wahi <b>applied to no</b> dikhta hai. Alerts and audit page is case ke liye warning deta hai, is wording ke saath: rule aise group par applied hai jisme koi member nahi, isliye woh kahin enforce nahi hota. Lekin dhyan rakho: woh alert tabhi aata hai jab group mein <em>koi member na ho</em>. Lab 4 mein <code>g-db-prod</code> mein ek member (DB-P) hai, isliye uske baare mein koi alert nahi aata, aur galti sirf Traceflow dikhata hai.</p>

<h3>Practice mein Applied To kaise chunein</h3>
<ul>
<li>Shak ho to DFW rehne do. Yeh safe default hai aur samajhna sabse aasan hai.</li>
<li>Sirf kisi wajah se narrow karo, aur dekho ki group mein un har flow ke ek end ke VMs hain jo rule ko cover karne hain.</li>
<li>Har change ke baad Traceflow chalao aur applied-to column padho.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> (1) Applied To ko "rule kiske baare mein hai" padhna: woh source aur destination hain. (2) "Tidy" rakhne ke liye Applied To ko destination ke group par set karna aur phir aisa flow jodna jisme dono VMs us group mein nahi. (3) Alert list par bharosa karna: galat par non-empty group koi alert nahi deta. (4) Sirf ek galat column theek karne ki jagah action ya default rule ko dheela karke symptom chhupana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Applied To control karta hai rule kahan enforce hota hai, kise match karta hai yeh nahi. "Sahi dikhne wala rule match kyun nahi karta" puchha jaye to source, destination aur service ke baad Applied To check karo.</p></div>

<div class="scn"><h4>Hardened default ne app tod diya</h4><p>Default rule deny karne ke baad shop application ruk gayi: web app tak nahi pahunch raha tha. Rule list bilkul sahi dikhti thi. Engineer ne Traceflow chalaya aur web-to-app rule par "applied to no" dekha. Mahino pehle kisi ne tidy karte waqt us rule ko database group tak narrow kar diya tha, aur default allow hone ki wajah se kisi ko pata nahi chala, kyunki default rule flow ko chupchaap nikaal deta tha. Rule ko wapas DFW karke publish karne se do minute mein fix ho gaya.</p><p><b>Seekh:</b> permissive default scoping galtiyan chhupa leta hai. Woh us din saamne aati hain jis din aap default ko harden karte ho.</p></div>

<div class="iv"><p class="q">"Applied To kya karta hai, aur sahi dikhne wala rule asar kyun nahi karta?"</p><p>Strong answer: Applied To tay karta hai ki rule kin vNICs par push hota hai: sab par (DFW) ya ek group ke vNICs par. Flow tab enforce hota hai jab source ya destination us group mein ho. Agar group mein dono VMs nahi hain, ya woh khaali hai, to rule kahin enforce nahi hota, chahe source, destination aur service sahi hon. Main Traceflow se confirm karunga aur sirf wahi column theek karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Applied To tay karta hai rule kahan enforce hota hai; source aur destination tay karte hain rule kise match karta hai.</li>
<li>DFW ka matlab har vNIC; group ka matlab sirf uske members ke vNICs.</li>
<li>Rule tab enforce hota hai jab source VM ya destination VM Applied To group mein ho.</li>
<li>Missing ya empty Applied To group kahin enforce nahi hota; trace mein applied to no aata hai.</li>
<li>Permissive default rule galat Applied To ko tab tak chhupa sakta hai jab tak default harden na ho.</li>
</ul></div>
`}};export{e as default};