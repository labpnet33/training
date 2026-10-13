var e={id:`policy-order-logs-method`,h:{en:`Policy order, logs and the troubleshooting method`,hi:`Policy order, logs aur troubleshooting method`},body:{en:`
<h3>What happens to one web request</h3>
<p>When a request reaches the cloud service, the checks run in a fixed order. Think of airport security: ticket check, bag scanner, then the gate. Skipping or reordering would change who gets through. The order in this simulator, which matches how such services are usually described, is:</p>
<ol>
<li><b>Identity:</b> who is the user, from sign-in?</li>
<li><b>URL filtering by host and category:</b> is this website or its category allowed?</li>
<li><b>SSL inspection decision:</b> should this encrypted session be opened, skipped or blocked?</li>
<li><b>URL filtering by full path:</b> only possible if the session was opened.</li>
<li><b>DLP</b> on uploads: does the data contain a card number or national ID?</li>
<li><b>Malware protection and sandbox</b> on downloads: is the file known bad, or unknown and held?</li>
</ol>
<p>The first rule that matches decides ("first match wins"). The URL list ends with an implicit <b>allow</b>, which is why a block rule must exist for something to be blocked. SSL rules with no match mean "do not inspect". Steps 4 to 6 see content only when step 3 opened the session (module zs-sec).</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Order of checks for a web request">
<rect x="10" y="30" width="90" height="60" rx="8" fill="#bae6fd"/><text x="55" y="55" text-anchor="middle" class="svg-ink" font-size="12">1 Identity</text><text x="55" y="75" text-anchor="middle" class="svg-muted" font-size="12">who?</text>
<rect x="110" y="30" width="100" height="60" rx="8" fill="#bae6fd"/><text x="160" y="55" text-anchor="middle" class="svg-ink" font-size="12">2 URL host</text><text x="160" y="75" text-anchor="middle" class="svg-muted" font-size="12">category</text>
<rect x="220" y="30" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="270" y="55" text-anchor="middle" class="svg-ink" font-size="12">3 SSL rule</text><text x="270" y="75" text-anchor="middle" class="svg-muted" font-size="12">open it?</text>
<rect x="330" y="30" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="380" y="55" text-anchor="middle" class="svg-ink" font-size="12">4 URL path</text><text x="380" y="75" text-anchor="middle" class="svg-muted" font-size="12">if opened</text>
<rect x="440" y="30" width="80" height="60" rx="8" fill="#fde68a"/><text x="480" y="55" text-anchor="middle" class="svg-ink" font-size="12">5 DLP</text><text x="480" y="75" text-anchor="middle" class="svg-muted" font-size="12">uploads</text>
<rect x="530" y="30" width="100" height="60" rx="8" fill="#fed7aa"/><text x="580" y="55" text-anchor="middle" class="svg-ink" font-size="12">6 Malware</text><text x="580" y="75" text-anchor="middle" class="svg-muted" font-size="12">downloads</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">first matching rule decides; URL list ends with allow</text>
</svg><p class="cap">Identity first, content checks last; steps 4 to 6 need the session to be opened.</p></div>

<h3>Rules, order and the Policy tester</h3>
<p>A rule has a name, an enabled switch, the users (groups) and locations it covers, what it matches (categories or URLs) and an action. Rules are listed top to bottom. Moving a rule up or down changes the result. The <b>Policy tester</b> page takes a user, location and destination and runs the same engine as a real browser would. It tells you the decision and the rule responsible.</p>
<pre class="out">Policy tester
User: kabir   Location: Jaipur Branch   Destination: games.example
<span class="hl">Result: BLOCKED   Rule: Block-Gaming (URL filtering)</span>
Path: pac   Identity: kabir (Sales)   Category: Gaming
Logged: yes</pre>

<h3>Logs and the audit trail</h3>
<p>Every request that reaches the service is logged with the fields: <b>user, host, action, rule, type</b> (web or firewall) and <b>location</b>. A request that went direct never reached the service, so there is <b>no log line at all</b>. Missing logs are therefore evidence of a forwarding problem, not a policy one. The audit log is separate: it records <i>admin</i> actions such as a rule change or an Activate, and each Policy tester run.</p>
<pre class="out">Log: recent web requests
user   host              action   rule              type  loc
kabir  games.example     blocked  Block-Gaming      web   Jaipur Branch
kabir  news.example      allowed  (default allow)   web   Jaipur Branch
rohit  crm.saas.example  blocked  <span class="hl">Contractors-limit</span>   web   Pune HQ</pre>

<h3>The method: symptom, evidence, root cause, fix, verify</h3>
<ol>
<li><b>Symptom:</b> one sentence: who, what, where, since when.</li>
<li><b>Evidence:</b> run the Policy tester and read the log. Never guess.</li>
<li><b>Root cause:</b> the rule, setting or path that produced the evidence.</li>
<li><b>Fix:</b> the smallest change, then Activate.</li>
<li><b>Verify:</b> repeat the same test and see the new result; check the audit log shows your change.</li>
</ol>

<div class="eg"><p><b>Lab zs-start-2: block a category and prove it.</b> Task: Gaming must be blocked for everyone. Evidence before: tester shows games.example ALLOWED by default allow. Fix: on <b>URL filtering</b>, add a rule with category Gaming and action block, place it above any broad allow, Activate. Verify: tester shows BLOCKED with the new rule name, a client test (<code>curl games.example</code>) returns 403 and the log has a line with action blocked.</p></div>
<div class="eg"><p><b>Lab zs-start-3 (troubleshoot): the contractor cannot open a business app.</b> Symptom: rohit (Contractors) gets 403 on crm.saas.example. Evidence: the tester names the deciding rule. Root cause: that rule is either wider than intended (blocks a whole category instead of the one site) or sits above the more specific allow. Fix: narrow the rule or move the allow above it, Activate. Verify: the tester now says ALLOWED for rohit, while a different Contractors-only restriction (for example social.example) is still BLOCKED. A fix that opens too much is a new problem.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> Moving a URL rule up changes which rule is first to match for every request that fits both. The wire does not change; the decision does, and with it the response code (403 for a policy block) and the log line.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Adding a block rule below a broad allow, so it never fires. (2) Testing from the wrong user or location. (3) Reading "no logs" as "no problem"; it can mean the traffic went direct. (4) Fixing without the verify step.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Default URL action?" Allow. "Two rules match; which wins?" The one higher in the list.</p></div>

<div class="scn"><h4>Fixed it, but nothing changed</h4><p>An admin added a gaming block, tested, and still saw ALLOWED. The Policy tester named an older rule, "Allow-all-staff", sitting above. After moving the new rule to the top and activating, the tester showed BLOCKED and the audit log showed the reorder.</p><p><b>Lesson:</b> the tester names the rule that decided; read that name first.</p></div>

<div class="iv"><p class="q">"How do you prove a policy change worked?"</p><p>Strong answer: before and after tests with the same user, location and destination; read the rule name in the result; confirm the client sees the expected code; find the log line; check the audit entry. Mention that evidence comes before the fix.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: identity, URL host, SSL decision, URL path, DLP, malware and sandbox.</li>
<li>First match wins; URL default is allow; SSL no match means not inspected.</li>
<li>Policy tester shows the decision and the rule responsible.</li>
<li>Logs hold user, host, action, rule, type, location; no log can mean direct traffic.</li>
<li>Method: symptom, evidence, root cause, fix, verify.</li>
</ul></div>
`,hi:`
<h3>Ek web request ke saath kya hota hai</h3>
<p>Jab request cloud service tak pahunchti hai, checks ek fixed order mein chalte hain. Airport security socho: ticket check, bag scanner, phir gate. Order skip ya badalne se kaun nikalta hai woh badal jaata hai. Is simulator ka order, jo aam taur par aisi services ke baare mein bataya jaata hai, yeh hai:</p>
<ol>
<li><b>Identity:</b> sign-in se user kaun hai?</li>
<li><b>URL filtering by host aur category:</b> kya yeh website ya uski category allowed hai?</li>
<li><b>SSL inspection decision:</b> kya is encrypted session ko kholna, skip karna ya block karna hai?</li>
<li><b>URL filtering by full path:</b> tabhi possible hai jab session khola gaya ho.</li>
<li><b>DLP</b> uploads par: kya data mein card number ya national ID hai?</li>
<li><b>Malware protection aur sandbox</b> downloads par: kya file known bad hai, ya unknown aur hold ki gayi?</li>
</ol>
<p>Jo pehla rule match karta hai woh decide karta hai ("first match wins"). URL list ek implicit <b>allow</b> par khatam hoti hai, isliye kuch block karne ke liye block rule hona zaroori hai. SSL rules mein koi match na ho to matlab "inspect mat karo". Steps 4 se 6 tabhi content dekhte hain jab step 3 ne session khola ho (module zs-sec).</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Web request ke checks ka order">
<rect x="10" y="30" width="90" height="60" rx="8" fill="#bae6fd"/><text x="55" y="55" text-anchor="middle" class="svg-ink" font-size="12">1 Identity</text><text x="55" y="75" text-anchor="middle" class="svg-muted" font-size="12">kaun?</text>
<rect x="110" y="30" width="100" height="60" rx="8" fill="#bae6fd"/><text x="160" y="55" text-anchor="middle" class="svg-ink" font-size="12">2 URL host</text><text x="160" y="75" text-anchor="middle" class="svg-muted" font-size="12">category</text>
<rect x="220" y="30" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="270" y="55" text-anchor="middle" class="svg-ink" font-size="12">3 SSL rule</text><text x="270" y="75" text-anchor="middle" class="svg-muted" font-size="12">kholna hai?</text>
<rect x="330" y="30" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="380" y="55" text-anchor="middle" class="svg-ink" font-size="12">4 URL path</text><text x="380" y="75" text-anchor="middle" class="svg-muted" font-size="12">agar khula</text>
<rect x="440" y="30" width="80" height="60" rx="8" fill="#fde68a"/><text x="480" y="55" text-anchor="middle" class="svg-ink" font-size="12">5 DLP</text><text x="480" y="75" text-anchor="middle" class="svg-muted" font-size="12">uploads</text>
<rect x="530" y="30" width="100" height="60" rx="8" fill="#fed7aa"/><text x="580" y="55" text-anchor="middle" class="svg-ink" font-size="12">6 Malware</text><text x="580" y="75" text-anchor="middle" class="svg-muted" font-size="12">downloads</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">pehla matching rule decide karta hai; URL list allow par khatam</text>
</svg><p class="cap">Pehle identity, last mein content checks; steps 4 se 6 ko session khula hona chahiye.</p></div>

<h3>Rules, order aur Policy tester</h3>
<p>Rule ka ek naam, enabled switch, jin users (groups) aur locations ko cover karta hai, kya match karta hai (categories ya URLs) aur ek action hota hai. Rules upar se neeche listed hote hain. Rule ko upar ya neeche karne se result badal jaata hai. <b>Policy tester</b> page user, location aur destination leta hai aur wahi engine chalata hai jo asli browser ke liye chalta. Yeh decision aur zimmedaar rule batata hai.</p>
<pre class="out">Policy tester
User: kabir   Location: Jaipur Branch   Destination: games.example
<span class="hl">Result: BLOCKED   Rule: Block-Gaming (URL filtering)</span>
Path: pac   Identity: kabir (Sales)   Category: Gaming
Logged: yes</pre>

<h3>Logs aur audit trail</h3>
<p>Service tak pahunchne wali har request in fields ke saath log hoti hai: <b>user, host, action, rule, type</b> (web ya firewall) aur <b>location</b>. Jo request direct gayi woh service tak pahunchi hi nahi, to uska <b>koi log line nahi</b> hoti. Isliye missing logs forwarding problem ka evidence hain, policy ka nahi. Audit log alag hai: woh <i>admin</i> actions record karta hai jaise rule change ya Activate, aur har Policy tester run.</p>
<pre class="out">Log: recent web requests
user   host              action   rule              type  loc
kabir  games.example     blocked  Block-Gaming      web   Jaipur Branch
kabir  news.example      allowed  (default allow)   web   Jaipur Branch
rohit  crm.saas.example  blocked  <span class="hl">Contractors-limit</span>   web   Pune HQ</pre>

<h3>Method: symptom, evidence, root cause, fix, verify</h3>
<ol>
<li><b>Symptom:</b> ek sentence: kaun, kya, kahan, kab se.</li>
<li><b>Evidence:</b> Policy tester chalao aur log padho. Kabhi guess mat karo.</li>
<li><b>Root cause:</b> woh rule, setting ya path jisne evidence banaya.</li>
<li><b>Fix:</b> sabse chhota change, phir Activate.</li>
<li><b>Verify:</b> wahi test dobara chalao aur naya result dekho; audit log mein apna change check karo.</li>
</ol>

<div class="eg"><p><b>Lab zs-start-2: category block karo aur prove karo.</b> Task: Gaming sabke liye block honi chahiye. Pehle ka evidence: tester games.example ko default allow se ALLOWED dikhata hai. Fix: <b>URL filtering</b> par category Gaming aur action block wala rule add karo, kisi broad allow ke upar rakho, Activate karo. Verify: tester naye rule ke naam ke saath BLOCKED dikhata hai, client test (<code>curl games.example</code>) 403 deta hai aur log mein action blocked wali line hoti hai.</p></div>
<div class="eg"><p><b>Lab zs-start-3 (troubleshoot): contractor business app nahi khol pa raha.</b> Symptom: rohit (Contractors) ko crm.saas.example par 403 milta hai. Evidence: tester deciding rule ka naam batata hai. Root cause: woh rule ya to intended se zyada wide hai (ek site ki jagah poori category block karta hai) ya zyada specific allow ke upar baitha hai. Fix: rule ko narrow karo ya allow ko upar le jao, Activate karo. Verify: tester ab rohit ke liye ALLOWED kehta hai, jabki koi doosri Contractors-only restriction (jaise social.example) abhi bhi BLOCKED hai. Jo fix zyada khol de woh nayi problem hai.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> URL rule ko upar le jaane se un sab requests ke liye jo dono rules se match karti hain, pehla match karne wala rule badal jaata hai. Wire nahi badalta; decision badalta hai, aur uske saath response code (policy block ke liye 403) aur log line.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Block rule ko broad allow ke neeche daalna, to woh kabhi fire nahi hota. (2) Galat user ya location se test karna. (3) "No logs" ko "no problem" padhna; iska matlab traffic direct gaya ho sakta hai. (4) Verify step ke bina fix kar dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Default URL action?" Allow. "Do rules match hon to kaun jeetta hai?" Jo list mein upar hai.</p></div>

<div class="scn"><h4>Fix kiya, lekin kuch nahi badla</h4><p>Ek admin ne gaming block add kiya, test kiya, aur phir bhi ALLOWED dikha. Policy tester ne ek purana rule "Allow-all-staff" bataya jo upar baitha tha. Naye rule ko top par le jaakar activate karne ke baad tester ne BLOCKED dikhaya aur audit log ne reorder dikhaya.</p><p><b>Seekh:</b> tester us rule ka naam batata hai jisne decide kiya; pehle woh naam padho.</p></div>

<div class="iv"><p class="q">"Policy change kaam kiya yeh kaise prove karoge?"</p><p>Strong answer: same user, location aur destination ke saath before aur after tests; result mein rule ka naam padho; confirm karo ki client expected code dekhta hai; log line dhoondo; audit entry check karo. Mention karo ki evidence fix se pehle aata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: identity, URL host, SSL decision, URL path, DLP, malware aur sandbox.</li>
<li>First match wins; URL default allow hai; SSL mein no match ka matlab inspect nahi.</li>
<li>Policy tester decision aur zimmedaar rule dikhata hai.</li>
<li>Logs mein user, host, action, rule, type, location hota hai; no log ka matlab direct traffic ho sakta hai.</li>
<li>Method: symptom, evidence, root cause, fix, verify.</li>
</ul></div>
`}};export{e as default};