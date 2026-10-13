var e={id:`policy-tester`,h:{en:`The policy tester and reading a decision`,hi:`Policy tester aur decision padhna`},body:{en:`
<h3>A rehearsal for one request</h3>
<p>Logs tell you what happened. The <b>policy tester</b> lets you ask "what would happen if this user opened this host from this place?" without disturbing anyone. It runs the same engine as real traffic, so the answer is a faithful rehearsal. You enter a user (or client), a destination and optionally a file or a body, and it prints a <b>decision trace</b>: each step of the policy order with its result.</p>

<h3>The trace, step by step</h3>
<p>The cloud policy order you already know is: forwarding path, identity, URL filtering by host and category, SSL inspection decision, URL filtering by full path (only if inspected), DLP on uploads, malware protection and sandbox on downloads. A trace shows each of these lines. You read from the top and stop at the first line that is not what you expected.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Decision trace lines">
<rect x="150" y="10" width="340" height="30" rx="6" fill="#bae6fd"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">1 Path: tunnel, proxy, client or direct?</text>
<rect x="150" y="48" width="340" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="13">2 Identity: user and groups</text>
<rect x="150" y="86" width="340" height="30" rx="6" fill="#fde68a"/><text x="320" y="106" text-anchor="middle" class="svg-ink" font-size="13">3 URL rule: host and category</text>
<rect x="150" y="124" width="340" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="144" text-anchor="middle" class="svg-ink" font-size="13">4 SSL: inspect, skip or block</text>
<rect x="150" y="162" width="340" height="30" rx="6" fill="#fed7aa"/><text x="320" y="182" text-anchor="middle" class="svg-ink" font-size="13">5 DLP, sandbox, malware</text>
<text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="12">first surprising line = where to look</text>
</svg><p class="cap">Read the trace top to bottom.</p></div>

<h3>What each line tells you</h3>
<table class="cmp"><tr><th>Line</th><th>Typical surprise</th><th>Points at</th></tr>
<tr><td>Path: direct</td><td>Expected tunnel, got direct</td><td>Forwarding: bypass, PAC, tunnel failover</td></tr>
<tr><td>Identity: unknown</td><td>Expected a user</td><td>Authentication off, SAML, client not signed in</td></tr>
<tr><td>Rule: default allow</td><td>Expected a block rule</td><td>Rule scope, order, disabled rule, wrong group</td></tr>
<tr><td>SSL: not inspected</td><td>DLP or sandbox did nothing</td><td>A skip rule or no matching inspect rule</td></tr>
<tr><td>Result 495</td><td>Certificate error</td><td>Device lacks the inspection root or app pins its certificate</td></tr>
</table>

<h3>Rule order, first match wins</h3>
<p>Rules are ordered and the first match decides. The tester prints the <b>name of the rule that decided</b>. If that is not the rule you expected, either a rule above it matched first, or yours did not match (scope, user, group, location, category). Fixing order is often a drag in the rule list, not a new rule.</p>

<div class="eg"><p><b>Worked example.</b> Engineering should be allowed ssh to 203.0.113.200 but vikram is blocked.</p></div>
<pre class="out">Policy tester   client: LAPTOP-RMT   user: vikram   target: 203.0.113.200 tcp 22
Path ............... client tunnel (location: remote)
Identity ........... vikram (Engineering)
Firewall ........... rule 1 <span class="hl">Block ssh</span>   action: block
                     (rule 4 Allow ssh for Engineering is below and never reached)
Result ............. blocked</pre>
<p>The decision shows rule 1 matched first. The fix is to move the allow rule above the block rule, then rerun the tester. Notice the tester also explained <i>why</i> rule 4 did not apply.</p>

<h3>Tester and audit</h3>
<p>Every tester run writes a <code>tool:policy</code> entry in the audit log, so tests are visible later. Use it freely, but write the user, target and result in your ticket so others can repeat it.</p>

<div class="note"><p><b>What does this change on the wire/policy?</b> Nothing. The tester sends no real traffic and changes no rule; it only reads current policy and tells you the outcome. The change you make afterwards (such as moving a rule) is what alters policy, and you rerun the tester to prove it.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Testing as the wrong user or from the wrong location, then trusting the result. (2) Editing policy before reading the trace. (3) Assuming the tester shows what the user's laptop does; the client state (installed, signed in, trusted network) must match too.</p></div>
<div class="exam"><p><b>Exam trap.</b> A tester result is only as true as its inputs. Check user, location and client state first.</p></div>

<div class="scn"><h4>The rule that was never reached</h4><p>A new allow rule did nothing. The tester named an older block rule above it. One drag in the list fixed it and the tester confirmed the new rule name.</p><p><b>Lesson:</b> the tester names the rule that decided; start there.</p></div>

<div class="iv"><p class="q">"A user says site X is blocked but you believe policy allows it. What do you do?"</p><p>Run the tester with the same user, location and target. Read path, identity, rule name and result. If tester and user disagree, check the client state and whether traffic went direct.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The tester rehearses one request through the real engine.</li>
<li>Read the trace from the top; stop at the first surprise.</li>
<li>It prints the rule that decided; first match wins.</li>
<li>Inputs must match reality: user, location, client state.</li>
<li>It changes nothing; runs appear in the audit log.</li>
</ul></div>
`,hi:`
<h3>Ek request ka rehearsal</h3>
<p>Logs batate hain kya hua. <b>Policy tester</b> aapko poochhne deta hai "agar yeh user is jagah se yeh host kholta to kya hota?", kisi ko pareshaan kiye bina. Yeh real traffic wala hi engine chalata hai, to jawab ek sacha rehearsal hai. Aap user (ya client), destination aur optionally file ya body daalte ho, aur yeh <b>decision trace</b> print karta hai: policy order ka har step apne result ke saath.</p>

<h3>Trace, step by step</h3>
<p>Cloud policy order jo aap jaante ho: forwarding path, identity, host aur category par URL filtering, SSL inspection decision, full path par URL filtering (sirf inspect hone par), uploads par DLP, downloads par malware protection aur sandbox. Trace in sab ki lines dikhata hai. Aap upar se padhte ho aur pehli us line par ruk jaate ho jo aapki expectation se alag ho.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Decision trace lines">
<rect x="150" y="10" width="340" height="30" rx="6" fill="#bae6fd"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">1 Path: tunnel, proxy, client ya direct?</text>
<rect x="150" y="48" width="340" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="13">2 Identity: user aur groups</text>
<rect x="150" y="86" width="340" height="30" rx="6" fill="#fde68a"/><text x="320" y="106" text-anchor="middle" class="svg-ink" font-size="13">3 URL rule: host aur category</text>
<rect x="150" y="124" width="340" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="144" text-anchor="middle" class="svg-ink" font-size="13">4 SSL: inspect, skip ya block</text>
<rect x="150" y="162" width="340" height="30" rx="6" fill="#fed7aa"/><text x="320" y="182" text-anchor="middle" class="svg-ink" font-size="13">5 DLP, sandbox, malware</text>
<text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="12">pehli hairan karne wali line = jahan dekhna hai</text>
</svg><p class="cap">Trace ko upar se neeche padho.</p></div>

<h3>Har line kya batati hai</h3>
<table class="cmp"><tr><th>Line</th><th>Typical surprise</th><th>Kis taraf ishara</th></tr>
<tr><td>Path: direct</td><td>Tunnel expect tha, direct mila</td><td>Forwarding: bypass, PAC, tunnel failover</td></tr>
<tr><td>Identity: unknown</td><td>User expect tha</td><td>Authentication off, SAML, client signed in nahi</td></tr>
<tr><td>Rule: default allow</td><td>Block rule expect tha</td><td>Rule scope, order, disabled rule, galat group</td></tr>
<tr><td>SSL: not inspected</td><td>DLP ya sandbox ne kuch nahi kiya</td><td>Skip rule ya koi matching inspect rule nahi</td></tr>
<tr><td>Result 495</td><td>Certificate error</td><td>Device ke paas inspection root nahi ya app apna certificate pin karti hai</td></tr>
</table>

<h3>Rule order, first match wins</h3>
<p>Rules ordered hote hain aur pehla match decide karta hai. Tester <b>decide karne wale rule ka naam</b> print karta hai. Woh rule woh nahi jo expect tha, to ya to uske upar wala rule pehle match hua, ya aapka rule match nahi hua (scope, user, group, location, category). Order fix karna aksar rule list mein drag karna hota hai, naya rule nahi.</p>

<div class="eg"><p><b>Worked example.</b> Engineering ko 203.0.113.200 par ssh allowed hona chahiye lekin vikram blocked hai.</p></div>
<pre class="out">Policy tester   client: LAPTOP-RMT   user: vikram   target: 203.0.113.200 tcp 22
Path ............... client tunnel (location: remote)
Identity ........... vikram (Engineering)
Firewall ........... rule 1 <span class="hl">Block ssh</span>   action: block
                     (rule 4 Allow ssh for Engineering neeche hai aur kabhi reach nahi hota)
Result ............. blocked</pre>
<p>Decision dikhata hai rule 1 pehle match hua. Fix hai allow rule ko block rule ke upar le jaana, phir tester dobara chalana. Dhyan do tester ne yeh bhi bataya ki rule 4 <i>kyun</i> apply nahi hua.</p>

<h3>Tester aur audit</h3>
<p>Har tester run audit log mein <code>tool:policy</code> entry likhta hai, to tests baad mein dikhte hain. Use freely karo, lekin ticket mein user, target aur result likho taaki dusre repeat kar sakein.</p>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Kuch nahi. Tester koi real traffic nahi bhejta aur koi rule nahi badalta; woh sirf current policy padhta hai aur outcome batata hai. Baad mein jo change aap karte ho (jaise rule move karna) wahi policy badalta hai, aur aap tester dobara chala kar prove karte ho.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Galat user ya galat location se test karke result par bharosa karna. (2) Trace padhne se pehle policy edit karna. (3) Maan lena ki tester user ke laptop ka kaam dikhata hai; client state (installed, signed in, trusted network) bhi match honi chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Tester ka result utna hi sach hai jitne uske inputs. Pehle user, location aur client state check karo.</p></div>

<div class="scn"><h4>Woh rule jo reach hi nahi hua</h4><p>Naya allow rule kuch nahi kar raha tha. Tester ne uske upar ek purana block rule bataya. List mein ek drag se fix ho gaya aur tester ne naye rule ka naam confirm kiya.</p><p><b>Seekh:</b> tester decide karne wale rule ka naam batata hai; wahin se shuru karo.</p></div>

<div class="iv"><p class="q">"User kehta hai site X blocked hai lekin aapko lagta hai policy allow karti hai. Kya karoge?"</p><p>Same user, location aur target ke saath tester chalao. Path, identity, rule name aur result padho. Tester aur user mein disagreement ho to client state aur kya traffic direct gaya check karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tester ek request ko real engine se rehearse karta hai.</li>
<li>Trace upar se padho; pehli surprise par ruko.</li>
<li>Yeh decide karne wale rule ko print karta hai; first match wins.</li>
<li>Inputs reality se match karne chahiye: user, location, client state.</li>
<li>Yeh kuch nahi badalta; runs audit log mein dikhte hain.</li>
</ul></div>
`}};export{e as default};