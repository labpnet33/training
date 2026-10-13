var e={id:`fp-workflow-summary`,h:{en:`The false-positive workflow, summary and exam checklist`,hi:`False-positive workflow, summary aur exam checklist`},body:{en:`
<p>This last chapter turns everything into one repeatable routine, then gives you the summary and exam checklist for the module. Click-ops, but you understand what each click does.</p>

<h3>Start with an analogy: the doctor, not the sledgehammer</h3>
<p>When a smoke alarm rings because of toast, a sensible facilities manager checks the alarm, confirms there is no fire, and moves the toaster or adjusts that one alarm. She does not remove every alarm in the building. The false-positive workflow is that discipline.</p>

<h3>The five-step workflow</h3>
<ol>
<li><b>Reproduce.</b> Get the exact request that fails (client, destination, path). Reproduce it from the right place, for example a Web test or the client PC, and note the time.</li>
<li><b>Read the log.</b> Filter by destination and time. Record the rule, action (Terminate), situation, and whether HTTPS was decrypted. Decide: false positive (legitimate application) or true positive (attack)? Ask the application owner.</li>
<li><b>Add a narrow exception.</b> Situation plus destination, source if known, action permit. Not any/any/any. Not removing the flag.</li>
<li><b>Install policy.</b> Nothing changed on the engine until now. Read install warnings and errors.</li>
<li><b>Retest.</b> The legitimate request passes (log shows Permit). A known bad request, the training pattern /vuln-test, is still terminated. Document the change with owner and review date.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="False positive workflow">
<rect x="6" y="40" width="112" height="70" rx="8" fill="#bae6fd"/><text x="62" y="70" text-anchor="middle" class="svg-ink" font-size="13">1 Reproduce</text><text x="62" y="90" text-anchor="middle" class="svg-muted" font-size="12">same request</text>
<rect x="132" y="40" width="112" height="70" rx="8" fill="#ddd6fe"/><text x="188" y="70" text-anchor="middle" class="svg-ink" font-size="13">2 Read log</text><text x="188" y="90" text-anchor="middle" class="svg-muted" font-size="12">situation</text>
<rect x="258" y="40" width="112" height="70" rx="8" fill="#fde68a"/><text x="314" y="70" text-anchor="middle" class="svg-ink" font-size="13">3 Exception</text><text x="314" y="90" text-anchor="middle" class="svg-muted" font-size="12">narrow</text>
<rect x="384" y="40" width="112" height="70" rx="8" fill="#fed7aa"/><text x="440" y="70" text-anchor="middle" class="svg-ink" font-size="13">4 Install</text><text x="440" y="90" text-anchor="middle" class="svg-muted" font-size="12">policy</text>
<rect x="510" y="40" width="124" height="70" rx="8" fill="#bbf7d0"/><text x="572" y="70" text-anchor="middle" class="svg-ink" font-size="13">5 Retest</text><text x="572" y="90" text-anchor="middle" class="svg-muted" font-size="12">good and bad</text>
<line x1="118" y1="75" x2="132" y2="75" stroke="#64748b" stroke-width="2"/><line x1="244" y1="75" x2="258" y2="75" stroke="#64748b" stroke-width="2"/><line x1="370" y1="75" x2="384" y2="75" stroke="#64748b" stroke-width="2"/><line x1="496" y1="75" x2="510" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Never skip step 5: the bad request must still be blocked.</text>
</svg><p class="cap">Five steps, every time, for every false positive.</p></div>

<div class="eg"><p><b>Worked example (lab fp-inspection-2).</b> Ticket: ERP export from the Staff LAN fails. (1) Reproduce: request /erp/export on 172.16.20.20 from STAFF-PC; it fails. (2) Log: Terminate, situation SUSPICIOUS-QUERY, rule DMZ-web; the ERP owner confirms it is legitimate. (3) Exception: situation SUSPICIOUS-QUERY, destination 172.16.20.20, permit. (4) Install policy. (5) Retest: /erp/export gives Permit; /vuln-test gives Terminate EXPLOIT-TEST. Done in five lines of log.</p></div>

<h3>Where each lab fits</h3>
<table class="cmp"><tr><th>Lab</th><th>Skill</th><th>Chapter</th></tr>
<tr><td>fp-inspection-1</td><td>Enable deep inspection on the DMZ rule</td><td>2</td></tr>
<tr><td>fp-inspection-2</td><td>Exception for a false positive (/erp/export)</td><td>3 and 8</td></tr>
<tr><td>fp-inspection-3</td><td>HTTPS inspection with a banking exclusion</td><td>4</td></tr>
<tr><td>fp-inspection-4</td><td>Block the Social Media category using the Internet cloud</td><td>5</td></tr>
</table>
<p>Every lab passes only after Install policy, because checks read the installed snapshot, not the SMC draft.</p>

<div class="warn"><p><b>Common mistakes in the workflow.</b></p><ul>
<li>Skipping step 2 and guessing the cause (a TLS failure is a certificate problem, not an inspection exception problem).</li>
<li>Skipping step 5, so a mistyped exception that permits too much goes unnoticed.</li>
<li>Calling a real attack a false positive because the user is senior. Verify with the application owner.</li>
</ul></div>

<div class="scn"><h4>Three tickets, one afternoon</h4><p>Pune got three tickets: ERP export fails, a bank portal shows a certificate error, and Facebook still opens. The engineer applied the same discipline. ERP: log shows SUSPICIOUS-QUERY, so a narrow exception. Bank: log shows client rejected the certificate, so an HTTPS exclusion, not an inspection exception. Facebook: rule hit counters showed the web Allow above the category Discard, so the rule order was fixed. Three different fixes, found by reading the log first.</p><p><b>Lesson:</b> the log tells you which chapter of this module you are in.</p></div>

<div class="iv"><p class="q">"Walk me through handling a false positive from an IPS."</p><p>Strong answer: reproduce, read the log and identify the situation, confirm it is legitimate, add the narrowest exception, install, retest the good request and a bad request, and document with a review date. Say you would never disable inspection to fix it.</p></div>

<h3>Summary and exam checklist</h3>
<p><b>Can-do checklist.</b> You should be able to:</p>
<ul>
<li>Explain the difference between an Access rule and an Inspection policy.</li>
<li>Enable deep inspection on the right rule and prove it with a Terminate log line.</li>
<li>Add a narrow exception per situation and destination, without turning inspection off.</li>
<li>List the three conditions for HTTPS decryption and add an exclusion for a pinned site.</li>
<li>Put a URL category in a rule Service and place it above the Allow.</li>
<li>Describe file filtering and sandbox as concepts (not simulated).</li>
<li>Read log level, action and situation, and choose levels deliberately.</li>
<li>Apply the five-step false-positive workflow and install before testing.</li>
</ul>

<h4>Mini glossary</h4>
<dl class="terms">
<dt>Deep inspection</dt><dd>Content inspection requested by a per-rule flag.</dd>
<dt>Situation</dt><dd>The named detection that fired, such as EXPLOIT-TEST.</dd>
<dt>Terminate</dt><dd>Log action when inspection ends a connection.</dd>
<dt>Exception</dt><dd>A narrow permit for a situation, source and destination.</dd>
<dt>False positive</dt><dd>Legitimate traffic matched by a detection.</dd>
<dt>HTTPS inspection</dt><dd>Decrypting and re-encrypting TLS so content can be inspected.</dd>
<dt>Exclusion</dt><dd>A site or category left encrypted, such as pinned banking.</dd>
<dt>URL category</dt><dd>A section of the Internet used as a rule Service.</dd>
<dt>Sandbox</dt><dd>Isolated environment that runs unknown files to watch behaviour.</dd>
</dl>

<div class="exam"><p><b>Most tested facts.</b></p><ul>
<li>An Access rule alone only allows or blocks; the deep flag requests inspection.</li>
<li>Exceptions are per situation and destination; never turn inspection off.</li>
<li>HTTPS decrypts only when enabled in the policy, the rule has the https flag, and the site is not excluded.</li>
<li>Pinned sites such as banking break unless excluded.</li>
<li>URL categories are a rule Service, evaluated after the connection starts; a category Discard above an Allow wins.</li>
<li>Log levels: None, Transient, Stored, Essential, Alert; actions: Allow, Discard, Permit, Refuse, Terminate.</li>
<li>Install policy is the boundary; version-specific details: check the documentation for your NGFW version.</li>
</ul></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Reproduce, read the log, narrow exception, install, retest.</li>
<li>Retest both the good and the bad request.</li>
<li>The log tells you whether the fix is a flag, exception, exclusion or rule order.</li>
<li>Document every exception with owner and review date.</li>
<li>This is independent training, not a certification claim.</li>
</ul></div>
`,hi:`
<p>Yeh aakhri chapter sab kuch ek repeatable routine mein badalta hai, phir module ka summary aur exam checklist deta hai. Click-ops, but you understand what each click does.</p>

<h3>Ek analogy se shuru karo: doctor, hathoda nahi</h3>
<p>Jab toast ki wajah se smoke alarm bajta hai, samajhdaar facilities manager alarm check karti hai, confirm karti hai ki aag nahi hai, aur toaster hata deti hai ya sirf us ek alarm ko adjust karti hai. Woh building ke har alarm ko nahi hatati. False-positive workflow yahi discipline hai.</p>

<h3>Paanch-step workflow</h3>
<ol>
<li><b>Reproduce.</b> Exact request pakdo jo fail hoti hai (client, destination, path). Sahi jagah se reproduce karo, jaise Web test ya client PC, aur time note karo.</li>
<li><b>Log padho.</b> Destination aur time se filter karo. Rule, action (Terminate), situation, aur HTTPS decrypt hua ya nahi, record karo. Decide karo: false positive (legitimate application) ya true positive (attack)? Application owner se poochho.</li>
<li><b>Narrow exception add karo.</b> Situation plus destination, source pata ho to, action permit. any/any/any nahi. Flag hatana nahi.</li>
<li><b>Install policy.</b> Ab tak engine par kuch nahi badla. Install warnings aur errors padho.</li>
<li><b>Retest.</b> Legitimate request pass hoti hai (log mein Permit dikhta hai). Known bad request, training pattern /vuln-test, ab bhi terminate hoti hai. Owner aur review date ke saath change document karo.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="False positive workflow">
<rect x="6" y="40" width="112" height="70" rx="8" fill="#bae6fd"/><text x="62" y="70" text-anchor="middle" class="svg-ink" font-size="13">1 Reproduce</text><text x="62" y="90" text-anchor="middle" class="svg-muted" font-size="12">wahi request</text>
<rect x="132" y="40" width="112" height="70" rx="8" fill="#ddd6fe"/><text x="188" y="70" text-anchor="middle" class="svg-ink" font-size="13">2 Log padho</text><text x="188" y="90" text-anchor="middle" class="svg-muted" font-size="12">situation</text>
<rect x="258" y="40" width="112" height="70" rx="8" fill="#fde68a"/><text x="314" y="70" text-anchor="middle" class="svg-ink" font-size="13">3 Exception</text><text x="314" y="90" text-anchor="middle" class="svg-muted" font-size="12">narrow</text>
<rect x="384" y="40" width="112" height="70" rx="8" fill="#fed7aa"/><text x="440" y="70" text-anchor="middle" class="svg-ink" font-size="13">4 Install</text><text x="440" y="90" text-anchor="middle" class="svg-muted" font-size="12">policy</text>
<rect x="510" y="40" width="124" height="70" rx="8" fill="#bbf7d0"/><text x="572" y="70" text-anchor="middle" class="svg-ink" font-size="13">5 Retest</text><text x="572" y="90" text-anchor="middle" class="svg-muted" font-size="12">good aur bad</text>
<line x1="118" y1="75" x2="132" y2="75" stroke="#64748b" stroke-width="2"/><line x1="244" y1="75" x2="258" y2="75" stroke="#64748b" stroke-width="2"/><line x1="370" y1="75" x2="384" y2="75" stroke="#64748b" stroke-width="2"/><line x1="496" y1="75" x2="510" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Step 5 kabhi skip mat karo: bad request ab bhi block honi chahiye.</text>
</svg><p class="cap">Paanch steps, har baar, har false positive ke liye.</p></div>

<div class="eg"><p><b>Worked example (lab fp-inspection-2).</b> Ticket: Staff LAN se ERP export fail ho raha hai. (1) Reproduce: STAFF-PC se 172.16.20.20 par /erp/export maango; fail hota hai. (2) Log: Terminate, situation SUSPICIOUS-QUERY, rule DMZ-web; ERP owner confirm karta hai ki legitimate hai. (3) Exception: situation SUSPICIOUS-QUERY, destination 172.16.20.20, permit. (4) Install policy. (5) Retest: /erp/export par Permit; /vuln-test par Terminate EXPLOIT-TEST. Log ki paanch lines mein kaam khatam.</p></div>

<h3>Har lab kahan fit hota hai</h3>
<table class="cmp"><tr><th>Lab</th><th>Skill</th><th>Chapter</th></tr>
<tr><td>fp-inspection-1</td><td>DMZ rule par deep inspection enable karo</td><td>2</td></tr>
<tr><td>fp-inspection-2</td><td>False positive ke liye exception (/erp/export)</td><td>3 aur 8</td></tr>
<tr><td>fp-inspection-3</td><td>Banking exclusion ke saath HTTPS inspection</td><td>4</td></tr>
<tr><td>fp-inspection-4</td><td>Internet cloud se Social Media category block karo</td><td>5</td></tr>
</table>
<p>Har lab sirf Install Policy ke baad pass hota hai, kyunki checks SMC draft nahi, installed snapshot padhte hain.</p>

<div class="warn"><p><b>Workflow ki common mistakes.</b></p><ul>
<li>Step 2 skip karke cause guess karna (TLS failure certificate problem hai, inspection exception ki problem nahi).</li>
<li>Step 5 skip karna, jisse galat type kiya hua exception jo zyada permit karta hai unnoticed rehta hai.</li>
<li>Asli attack ko false positive bolna kyunki user senior hai. Application owner se verify karo.</li>
</ul></div>

<div class="scn"><h4>Teen tickets, ek dopahar</h4><p>Pune ko teen tickets mile: ERP export fail, bank portal par certificate error, aur Facebook ab bhi khulti hai. Engineer ne wahi discipline apnayi. ERP: log mein SUSPICIOUS-QUERY, isliye narrow exception. Bank: log mein client ne certificate reject kiya, isliye HTTPS exclusion, inspection exception nahi. Facebook: rule hit counters ne dikhaya ki web Allow category Discard ke upar hai, isliye rule order theek kiya. Teen alag fixes, pehle log padhkar mile.</p><p><b>Lesson:</b> log batata hai ki aap is module ke kaunse chapter mein ho.</p></div>

<div class="iv"><p class="q">"IPS ke false positive ko handle karne ka process batao."</p><p>Strong answer: reproduce karo, log padhkar situation pehchano, confirm karo ki legitimate hai, sabse narrow exception add karo, install karo, achhi request aur bad request retest karo, aur review date ke saath document karo. Bolo ki aap ise theek karne ke liye inspection kabhi disable nahi karoge.</p></div>

<h3>Summary aur exam checklist</h3>
<p><b>Can-do checklist.</b> Aap yeh kar paane chahiye:</p>
<ul>
<li>Access rule aur Inspection policy ka fark samjhana.</li>
<li>Sahi rule par deep inspection enable karna aur Terminate log line se prove karna.</li>
<li>Inspection band kiye bina situation aur destination ke hisaab se narrow exception add karna.</li>
<li>HTTPS decryption ki teen conditions batana aur pinned site ke liye exclusion add karna.</li>
<li>URL category ko rule Service mein rakhna aur Allow ke upar place karna.</li>
<li>File filtering aur sandbox ko concept ke roop mein batana (simulate nahi hota).</li>
<li>Log level, action aur situation padhna, aur levels soch samajhkar chunna.</li>
<li>Paanch-step false-positive workflow apply karna aur test se pehle install karna.</li>
</ul>

<h4>Mini glossary</h4>
<dl class="terms">
<dt>Deep inspection</dt><dd>Per-rule flag se maangi gayi content inspection.</dd>
<dt>Situation</dt><dd>Naam wali detection jo fire hui, jaise EXPLOIT-TEST.</dd>
<dt>Terminate</dt><dd>Inspection connection khatam kare to log action.</dd>
<dt>Exception</dt><dd>Situation, source aur destination ke liye narrow permit.</dd>
<dt>False positive</dt><dd>Legitimate traffic jo detection match kar le.</dd>
<dt>HTTPS inspection</dt><dd>TLS decrypt aur re-encrypt karna taaki content inspect ho sake.</dd>
<dt>Exclusion</dt><dd>Site ya category jo encrypted chhodi jaati hai, jaise pinned banking.</dd>
<dt>URL category</dt><dd>Internet ka section jo rule Service ke roop mein use hota hai.</dd>
<dt>Sandbox</dt><dd>Isolated environment jo unknown files chalakar behaviour dekhta hai.</dd>
</dl>

<div class="exam"><p><b>Sabse zyada pooche jaane wale facts.</b></p><ul>
<li>Akela Access rule sirf allow ya block karta hai; deep flag inspection maangta hai.</li>
<li>Exceptions situation aur destination ke hisaab se hote hain; inspection kabhi band mat karo.</li>
<li>HTTPS tabhi decrypt hota hai jab policy mein enabled ho, rule par https flag ho, aur site excluded na ho.</li>
<li>Pinned sites jaise banking exclude na karo to toot jaati hain.</li>
<li>URL categories rule Service hain, connection start hone ke baad evaluate hoti hain; Allow ke upar category Discard jeetta hai.</li>
<li>Log levels: None, Transient, Stored, Essential, Alert; actions: Allow, Discard, Permit, Refuse, Terminate.</li>
<li>Install policy boundary hai; version-specific details: apne NGFW version ki documentation check karo.</li>
</ul></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Reproduce, log padho, narrow exception, install, retest.</li>
<li>Achhi aur bad dono requests retest karo.</li>
<li>Log batata hai ki fix flag hai, exception, exclusion ya rule order.</li>
<li>Har exception owner aur review date ke saath document karo.</li>
<li>Yeh independent training hai, certification claim nahi.</li>
</ul></div>
`}};export{e as default};