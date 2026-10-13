var e={id:`url-filtering`,h:{en:`URL filtering: the order every web request follows`,hi:`URL filtering: har web request ka order`},body:{en:`
<h3>What you will learn</h3>
<p>In this module you learn how the cloud security service decides what to do with a web request: allow it, block it, inspect it, or hold it. You will be able to read a rule list, predict the result, and prove it with the Policy tester. <b>Prerequisites:</b> the basics from zs-start (identity, policy order) and zs-fwd (how traffic reaches the cloud). Remember the scope: this is a simulator with its own generic portal. Exact vendor values always come from the vendor documentation. In the vendor's own wording, the three cloud services are called ZIA, ZPA and ZDX; this module is about the internet-access one.</p>

<h3>The airport analogy</h3>
<p>Think of airport security. First a guard checks your boarding pass (who are you, where are you going). Then your bag goes through a scanner, then a closer check. The stations come in a <b>fixed order</b>, and the guard at station one cannot see what only station four can see. A web request at Sahyadri Logistics is the same: it walks through a pipeline, and each stage only sees what is available at that point.</p>

<h3>The six stages</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Six stage pipeline">
<rect x="8" y="30" width="96" height="70" rx="8" fill="#bae6fd"/><text x="56" y="58" text-anchor="middle" class="svg-ink" font-size="12">1 Identity</text><text x="56" y="76" text-anchor="middle" class="svg-muted" font-size="11">who is it?</text>
<rect x="112" y="30" width="96" height="70" rx="8" fill="#bbf7d0"/><text x="160" y="52" text-anchor="middle" class="svg-ink" font-size="12">2 URL filter</text><text x="160" y="68" text-anchor="middle" class="svg-muted" font-size="11">host, category</text>
<rect x="216" y="30" width="96" height="70" rx="8" fill="#ddd6fe"/><text x="264" y="52" text-anchor="middle" class="svg-ink" font-size="12">3 SSL</text><text x="264" y="68" text-anchor="middle" class="svg-muted" font-size="11">inspect or not</text>
<rect x="320" y="30" width="96" height="70" rx="8" fill="#fde68a"/><text x="368" y="52" text-anchor="middle" class="svg-ink" font-size="12">4 URL filter</text><text x="368" y="68" text-anchor="middle" class="svg-muted" font-size="11">full path</text>
<rect x="424" y="30" width="96" height="70" rx="8" fill="#fed7aa"/><text x="472" y="52" text-anchor="middle" class="svg-ink" font-size="12">5 DLP</text><text x="472" y="68" text-anchor="middle" class="svg-muted" font-size="11">uploads</text>
<rect x="528" y="30" width="96" height="70" rx="8" fill="#e2e8f0"/><text x="576" y="52" text-anchor="middle" class="svg-ink" font-size="12">6 Malware</text><text x="576" y="68" text-anchor="middle" class="svg-muted" font-size="11">+ sandbox</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Stages 4, 5 and 6 only work if stage 3 decrypted the traffic</text>
</svg><p class="cap">The fixed order of the web pipeline in the simulator.</p></div>
<ol>
<li><b>Identity.</b> The service works out the user and groups (Finance, Engineering, Sales, HR, Contractors).</li>
<li><b>URL filtering by host and category.</b> It looks at the destination name, for example news.example is News and casino.example is Gambling. The host name is visible even when the traffic is encrypted, so this stage always works.</li>
<li><b>SSL decision.</b> Should this connection be opened up (inspected), left alone (skip) or blocked? Chapter 2 covers it.</li>
<li><b>URL filtering by full path.</b> Rules about the part after the host name. The path is inside the encrypted data, so this stage runs only if stage 3 inspected.</li>
<li><b>DLP</b> on uploads, and <b>malware protection and sandbox</b> on downloads: chapter 3.</li>
</ol>

<h3>How a rule list works</h3>
<p>A rule has conditions (users or groups, locations, categories, URLs) and an action (allow or block). The list is <b>ordered and first match wins</b>: the engine walks from the top, stops at the first rule whose conditions all fit, and applies its action. If nothing matches, the URL filter default is <b>allow</b>. That default surprises beginners: a destination you forgot to mention is open.</p>
<table class="cmp"><tr><th>#</th><th>Rule</th><th>Who</th><th>What</th><th>Action</th></tr>
<tr><td>1</td><td>Block-Gambling</td><td>any</td><td>category Gambling</td><td>block</td></tr>
<tr><td>2</td><td>Sales-allow-Social</td><td>Sales</td><td>category Social</td><td>allow</td></tr>
<tr><td>3</td><td>Block-Social</td><td>any</td><td>category Social</td><td>block</td></tr>
<tr><td>-</td><td>default</td><td>any</td><td>anything else</td><td>allow</td></tr></table>
<p>Kabir (Sales) opens social.example: rule 1 does not fit, rule 2 fits, so allow. Meena (Engineering): rule 2 does not fit (wrong group), rule 3 fits, so block. If someone swaps rules 2 and 3, <i>everybody</i> is blocked, because the broad rule now catches Kabir first. <b>Specific rules go above general ones.</b></p>
<pre class="out">Policy tester   user: meena (Engineering)   location: chn
Destination: social.example   category: Social
 1 identity            meena, group Engineering
 2 URL filtering       rule 1 Block-Gambling      no match
                       rule 2 Sales-allow-Social  no match (group)
                       <span class="hl">rule 3 Block-Social        MATCH</span>
Result: BLOCKED (403)  rule: Block-Social</pre>

<div class="note"><p><b>What does this change on the wire/policy?</b> A URL rule changes nothing on the tunnel or the DNS lookup. It changes the answer to one request: the service either relays it or returns a block page. Reordering rules changes which rule matches first, so it can change results for users who never appear in the rule you edited.</p></div>

<h3>Troubleshooting walk: ticket 320020 and lab zs-sec-1</h3>
<p>Symptom: a contractor (rohit, group Contractors) cannot open crm.saas.example, but employees can. Evidence: run the destination in the Policy tester as rohit. It names the deciding rule, say Contractors-no-SaaS, whose category is the broad Business SaaS. Root cause: the rule was written for a category when only one site was meant. Fix: narrow the rule to the specific host, or place an allow rule for the CRM above it. Verify: repeat the test, expect Result: ALLOWED with the new rule name, then confirm another contractor-blocked site is still blocked. Lab zs-sec-1 trains exactly this loop: read the list, predict, test, fix order.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Writing a broad block above a narrow allow. (2) Forgetting that default is allow. (3) Naming a group in a rule for a location where users are not identified, so the group never matches. (4) Testing as the wrong user.</p></div>
<div class="exam"><p><b>Exam trap.</b> Full-URL (path) rules do nothing on traffic that was not inspected. If a path rule is ignored, check the SSL decision first.</p></div>

<div class="scn"><h4>The CRM that vanished for one person</h4><p>A contractor reported the CRM page showing a block page while his manager saw it fine. The engineer did not guess: she ran the Policy tester as the contractor, saw the rule name, and found a category rule created during a security push. She added the CRM host to an allow rule above it. Five minutes, no change to any other group.</p><p><b>Lesson:</b> the tester names the rule; fix that rule, not the symptom.</p></div>

<div class="iv"><p class="q">"What is a secure web gateway and how does it decide?"</p><p>A secure web gateway sits between users and the internet and enforces policy on web traffic. Mention the order: identity, host and category filter, SSL decision, full-URL filter, DLP, malware and sandbox; ordered first-match rules; default allow; and that deep stages need inspection.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A secure web gateway applies policy in a fixed order of stages.</li>
<li>Host and category filtering always works; full-path filtering needs inspection.</li>
<li>Rules are first match wins, with default allow for URLs.</li>
<li>Specific rules go above general ones.</li>
<li>Use the Policy tester to find the deciding rule before editing anything.</li>
</ul></div>
`,hi:`
<h3>Is chapter mein aap kya seekhoge</h3>
<p>Is module mein aap seekhoge ki cloud security service ek web request ke saath kya karna hai yeh kaise decide karti hai: allow, block, inspect ya hold. Aap rule list padhkar result predict kar paoge aur Policy tester se prove kar paoge. <b>Prerequisites:</b> zs-start ke basics (identity, policy order) aur zs-fwd (traffic cloud tak kaise pahunchta hai). Scope yaad rakho: yeh simulator hai apne generic portal ke saath. Exact vendor values hamesha vendor documentation se aate hain. Vendor ki apni wording mein teen cloud services ZIA, ZPA aur ZDX kehlaati hain; yeh module internet-access wali service ke baare mein hai.</p>

<h3>Airport ka analogy</h3>
<p>Airport security socho. Pehle guard boarding pass check karta hai (aap kaun ho, kahan ja rahe ho). Phir bag scanner se guzarta hai, phir closer check. Stations ka ek <b>fixed order</b> hota hai, aur station one ka guard woh nahi dekh sakta jo sirf station four dekh sakta hai. Sahyadri Logistics ki web request bhi aisi hi hai: woh ek pipeline se guzarti hai, aur har stage sirf wahi dekhta hai jo us point par available hai.</p>

<h3>Chhe stages</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Chhe stage ki pipeline">
<rect x="8" y="30" width="96" height="70" rx="8" fill="#bae6fd"/><text x="56" y="58" text-anchor="middle" class="svg-ink" font-size="12">1 Identity</text><text x="56" y="76" text-anchor="middle" class="svg-muted" font-size="11">kaun hai?</text>
<rect x="112" y="30" width="96" height="70" rx="8" fill="#bbf7d0"/><text x="160" y="52" text-anchor="middle" class="svg-ink" font-size="12">2 URL filter</text><text x="160" y="68" text-anchor="middle" class="svg-muted" font-size="11">host, category</text>
<rect x="216" y="30" width="96" height="70" rx="8" fill="#ddd6fe"/><text x="264" y="52" text-anchor="middle" class="svg-ink" font-size="12">3 SSL</text><text x="264" y="68" text-anchor="middle" class="svg-muted" font-size="11">inspect ya nahi</text>
<rect x="320" y="30" width="96" height="70" rx="8" fill="#fde68a"/><text x="368" y="52" text-anchor="middle" class="svg-ink" font-size="12">4 URL filter</text><text x="368" y="68" text-anchor="middle" class="svg-muted" font-size="11">full path</text>
<rect x="424" y="30" width="96" height="70" rx="8" fill="#fed7aa"/><text x="472" y="52" text-anchor="middle" class="svg-ink" font-size="12">5 DLP</text><text x="472" y="68" text-anchor="middle" class="svg-muted" font-size="11">uploads</text>
<rect x="528" y="30" width="96" height="70" rx="8" fill="#e2e8f0"/><text x="576" y="52" text-anchor="middle" class="svg-ink" font-size="12">6 Malware</text><text x="576" y="68" text-anchor="middle" class="svg-muted" font-size="11">+ sandbox</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Stage 4, 5 aur 6 tabhi chalte hain jab stage 3 ne decrypt kiya ho</text>
</svg><p class="cap">Simulator mein web pipeline ka fixed order.</p></div>
<ol>
<li><b>Identity.</b> Service user aur groups pata karti hai (Finance, Engineering, Sales, HR, Contractors).</li>
<li><b>Host aur category se URL filtering.</b> Yeh destination ka naam dekhta hai, jaise news.example News hai aur casino.example Gambling. Traffic encrypted ho tab bhi host name dikhta hai, isliye yeh stage hamesha kaam karta hai.</li>
<li><b>SSL decision.</b> Is connection ko kholna (inspect) hai, chhodna (skip) hai ya block karna hai? Chapter 2 mein aayega.</li>
<li><b>Full path se URL filtering.</b> Host name ke baad wale hisse ke rules. Path encrypted data ke andar hota hai, isliye yeh stage tabhi chalta hai jab stage 3 ne inspect kiya ho.</li>
<li><b>DLP</b> uploads par, aur <b>malware protection aur sandbox</b> downloads par: chapter 3.</li>
</ol>

<h3>Rule list kaise kaam karti hai</h3>
<p>Rule mein conditions hoti hain (users ya groups, locations, categories, URLs) aur ek action (allow ya block). List <b>ordered hai aur first match wins</b>: engine upar se chalta hai, pehle us rule par rukta hai jiski saari conditions fit hoti hain, aur uska action lagata hai. Kuch match na ho to URL filter ka default <b>allow</b> hai. Yeh default beginners ko surprise karta hai: jo destination aap bhool gaye woh khula hai.</p>
<table class="cmp"><tr><th>#</th><th>Rule</th><th>Kaun</th><th>Kya</th><th>Action</th></tr>
<tr><td>1</td><td>Block-Gambling</td><td>any</td><td>category Gambling</td><td>block</td></tr>
<tr><td>2</td><td>Sales-allow-Social</td><td>Sales</td><td>category Social</td><td>allow</td></tr>
<tr><td>3</td><td>Block-Social</td><td>any</td><td>category Social</td><td>block</td></tr>
<tr><td>-</td><td>default</td><td>any</td><td>baaki sab</td><td>allow</td></tr></table>
<p>Kabir (Sales) social.example kholta hai: rule 1 fit nahi, rule 2 fit, to allow. Meena (Engineering): rule 2 fit nahi (group alag), rule 3 fit, to block. Agar koi rule 2 aur 3 swap kar de to <i>sab</i> block ho jaate hain, kyunki broad rule ab Kabir ko pehle pakad leta hai. <b>Specific rules general rules ke upar rakho.</b></p>
<pre class="out">Policy tester   user: meena (Engineering)   location: chn
Destination: social.example   category: Social
 1 identity            meena, group Engineering
 2 URL filtering       rule 1 Block-Gambling      no match
                       rule 2 Sales-allow-Social  no match (group)
                       <span class="hl">rule 3 Block-Social        MATCH</span>
Result: BLOCKED (403)  rule: Block-Social</pre>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> URL rule tunnel ya DNS lookup par kuch nahi badalta. Yeh ek request ka jawab badalta hai: service ya to use relay karti hai ya block page return karti hai. Rules reorder karne se pehle kaun match karega yeh badalta hai, isliye un users ka result bhi badal sakta hai jo aapke edit kiye rule mein kabhi aaye hi nahi.</p></div>

<h3>Troubleshooting walk: ticket 320020 aur lab zs-sec-1</h3>
<p>Symptom: ek contractor (rohit, group Contractors) crm.saas.example nahi khol pa raha, lekin employees khol lete hain. Evidence: destination ko Policy tester mein rohit ke roop mein run karo. Woh deciding rule ka naam batata hai, maan lo Contractors-no-SaaS, jiski category broad Business SaaS hai. Root cause: rule category par likha gaya jabki sirf ek site chahiye thi. Fix: rule ko specific host tak narrow karo, ya CRM ke liye allow rule uske upar rakho. Verify: test dobara karo, naye rule ke naam ke saath Result: ALLOWED aana chahiye, phir confirm karo ki doosri contractor-blocked site abhi bhi block hai. Lab zs-sec-1 yahi loop sikhata hai: list padho, predict karo, test karo, order fix karo.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Broad block ko narrow allow ke upar rakhna. (2) Yeh bhoolna ki default allow hai. (3) Aise location ke rule mein group likhna jahan users identify nahi hote, to group kabhi match nahi karta. (4) Galat user ke roop mein test karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Full-URL (path) rules un traffic par kuch nahi karte jo inspect nahi hua. Path rule ignore ho raha ho to pehle SSL decision check karo.</p></div>

<div class="scn"><h4>Ek bande ke liye gayab hua CRM</h4><p>Ek contractor ne bataya ki CRM page par block page aa raha hai jabki uska manager use dekh leta hai. Engineer ne guess nahi kiya: usne Policy tester contractor ke roop mein chalaya, rule ka naam dekha, aur ek security push ke time bani category rule mili. Usne CRM host ko uske upar ek allow rule mein daal diya. Paanch minute, kisi aur group mein koi badlaav nahi.</p><p><b>Seekh:</b> tester rule ka naam batata hai; us rule ko fix karo, symptom ko nahi.</p></div>

<div class="iv"><p class="q">"Secure web gateway kya hota hai aur woh decide kaise karta hai?"</p><p>Secure web gateway users aur internet ke beech baithta hai aur web traffic par policy enforce karta hai. Order bolo: identity, host aur category filter, SSL decision, full-URL filter, DLP, malware aur sandbox; ordered first-match rules; default allow; aur yeh ki deep stages ko inspection chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Secure web gateway stages ke fixed order mein policy lagata hai.</li>
<li>Host aur category filtering hamesha chalti hai; full-path filtering ko inspection chahiye.</li>
<li>Rules first match wins hain, URLs ke liye default allow ke saath.</li>
<li>Specific rules general rules ke upar jaate hain.</li>
<li>Kuch edit karne se pehle Policy tester se deciding rule dhoondho.</li>
</ul></div>
`}};export{e as default};