var e={id:`troubleshooting-identity`,h:{en:`Troubleshooting identity: four tickets, one method`,hi:`Identity troubleshooting: chaar tickets, ek method`},body:{en:`
<h3>A method before a fix</h3>
<p>Identity problems feel mysterious because the symptom ("it does not work") is the same for very different causes. Use one method every time: <b>symptom, evidence, root cause, fix, verify</b>. Evidence comes from the portal pages (Identity, Locations, Alerts and audit) and from the Policy tester. Never change a setting before you have evidence for it.</p>

<h3>Quick triage: which question first?</h3>
<ol>
<li><b>Who fails?</b> Everybody, one site, one user, or one group?</li>
<li><b>What error?</b> A 401 means identity failed. A 403 means identity worked and a rule blocked. No error and the wrong rule means identity was unknown.</li>
<li><b>What does the Identity page say?</b> SAML health, certificate days, clock, SCIM and the user table.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Identity triage tree">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">What error does the user see?</text>
<rect x="10" y="100" width="190" height="60" rx="8" fill="#fed7aa"/><text x="105" y="125" text-anchor="middle" class="svg-ink" font-size="13">401 sign-in error</text><text x="105" y="145" text-anchor="middle" class="svg-muted" font-size="12">SAML, user missing, disabled</text>
<rect x="225" y="100" width="190" height="60" rx="8" fill="#fde68a"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="13">403 blocked</text><text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">identity ok, rule or groups</text>
<rect x="440" y="100" width="190" height="60" rx="8" fill="#bae6fd"/><text x="535" y="125" text-anchor="middle" class="svg-ink" font-size="13">Wrong rule, no error</text><text x="535" y="145" text-anchor="middle" class="svg-muted" font-size="12">user unknown: auth off</text>
<line x1="280" y1="50" x2="105" y2="100" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="100" stroke="#64748b" stroke-width="2"/><line x1="360" y1="50" x2="535" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">then read the Identity page and run the Policy tester</text>
</svg><p class="cap">The error code points you to the right page before you touch anything.</p></div>

<h3>Ticket 320030: Pune users get 401 errors</h3>
<p><b>Symptom:</b> all Pune users see a sign-in error; Chennai client-connector users still work. <b>Evidence:</b> SAML page shows certificate 0 days left, health problem; Alerts shows a SAML alert. <b>Root cause:</b> signing certificate expired, so every assertion fails verification. <b>Fix:</b> load the renewed certificate. <b>Verify:</b> health turns healthy and ravi gets a normal page.</p>
<pre class="out">Identity &gt; SAML
Certificate ........ <span class="hl">0 days left (expired)</span>
Health ............. PROBLEM
Policy tester  user: ravi  host: news.example
Identity ........... <span class="hl">FAILED: signature check</span>   result: 401</pre>

<h3>Ticket 320080: the Sales rule works in Pune but not Jaipur</h3>
<p><b>Symptom:</b> social.example is blocked for Sales in Pune but open for kabir in Jaipur. <b>Evidence:</b> tester at location jpr reports user unknown; the Locations page shows Authentication required: off for Jaipur. <b>Root cause:</b> no identity, so the Sales rule cannot match. <b>Fix:</b> turn authentication on for the location, activate. <b>Verify:</b> the tester now names kabir (Sales) and the block rule.</p>
<pre class="out">Policy tester  user: (from site)  host: social.example  location: jpr
Identity ........... <span class="hl">unknown (authentication off)</span>
URL rule ........... Default allow
Result ............. 200 allowed</pre>

<h3>Ticket 321030: new HR hire has no access</h3>
<p><b>Symptom:</b> signs in fine, HR portal unreachable. <b>Evidence:</b> user table shows provisioned no, groups empty; SCIM page shows not synced; the Alerts page raises a SCIM alert. <b>Root cause:</b> sync not running, so no HR group. <b>Fix:</b> repair SCIM (token, enable, sync). <b>Verify:</b> user shows HR, and the private-access test passes after sign-in again. This is lab <b>zs-id-2</b> in the same shape: a new user, no groups.</p>

<h3>Ticket 321040: offboard a contractor</h3>
<p><b>Symptom:</b> a leaver is still active. <b>Evidence:</b> user table enabled yes, group Contractors. <b>Root cause:</b> account not disabled. <b>Fix:</b> disable the user. <b>Verify:</b> web test returns 401 and the private application test fails. Prove both paths, not just one.</p>

<h3>Lab zs-id-1: building the SAML trust</h3>
<p>The lab starts with a mismatch between the two sides. Compare, correct the value that differs, activate changes, and check that health says healthy. Keep a note of what you changed; the audit log shows it later.</p>

<div class="note"><p><b>What does this change on the wire/policy?</b> A fix on the Identity page changes whether an assertion is accepted or a user table row is valid. A fix on the Locations page changes whether the user is known at all. Each fix has a different test: SAML health, tester identity line, user table.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Restarting things or changing rules before reading the error code. (2) Fixing only the symptom user instead of the cause. (3) Closing the ticket without a verification test.</p></div>
<div class="exam"><p><b>Exam trap.</b> 401 and 403 are not interchangeable. 401 is identity; 403 is a policy block after identity succeeded.</p></div>

<div class="scn"><h4>Two tickets, same morning</h4><p>One caller said "Jaipur can open social media" and another said "Pune cannot sign in". The engineer used the same method on both: error code, Identity page, tester. One was authentication off, the other an expired certificate. Two minutes each because the evidence came first.</p><p><b>Lesson:</b> method beats memory.</p></div>

<div class="iv"><p class="q">"A user says they cannot reach an app after joining. How do you troubleshoot?"</p><p>Ask the error: sign-in versus blocked. Check SAML health, then the user row (enabled, provisioned, groups), then the tester for the identity and rule line. Fix the cause, verify with the same test, and note the change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use symptom, evidence, root cause, fix, verify every time.</li>
<li>401 means identity failed; 403 means a rule blocked a known user.</li>
<li>Expired certificate: all users fail; renew it.</li>
<li>Authentication off: user unknown, group rules miss.</li>
<li>No groups: repair SCIM; offboard by disabling and verify.</li>
</ul></div>
`,hi:`
<h3>Fix se pehle method</h3>
<p>Identity problems mysterious lagti hain kyunki symptom ("kaam nahi kar raha") bahut alag causes ke liye same hota hai. Har baar ek method use karo: <b>symptom, evidence, root cause, fix, verify</b>. Evidence portal pages (Identity, Locations, Alerts and audit) aur Policy tester se aata hai. Evidence ke bina kabhi koi setting mat badlo.</p>

<h3>Quick triage: pehla sawaal kaun sa?</h3>
<ol>
<li><b>Kaun fail ho raha hai?</b> Sab, ek site, ek user ya ek group?</li>
<li><b>Kaun sa error?</b> 401 matlab identity fail. 403 matlab identity chali aur rule ne block kiya. Koi error nahi aur galat rule matlab identity unknown thi.</li>
<li><b>Identity page kya kehta hai?</b> SAML health, certificate days, clock, SCIM aur user table.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Identity triage tree">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">User ko kaun sa error?</text>
<rect x="10" y="100" width="190" height="60" rx="8" fill="#fed7aa"/><text x="105" y="125" text-anchor="middle" class="svg-ink" font-size="13">401 sign-in error</text><text x="105" y="145" text-anchor="middle" class="svg-muted" font-size="12">SAML, user missing, disabled</text>
<rect x="225" y="100" width="190" height="60" rx="8" fill="#fde68a"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="13">403 blocked</text><text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">identity ok, rule ya groups</text>
<rect x="440" y="100" width="190" height="60" rx="8" fill="#bae6fd"/><text x="535" y="125" text-anchor="middle" class="svg-ink" font-size="13">Galat rule, error nahi</text><text x="535" y="145" text-anchor="middle" class="svg-muted" font-size="12">user unknown: auth off</text>
<line x1="280" y1="50" x2="105" y2="100" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="100" stroke="#64748b" stroke-width="2"/><line x1="360" y1="50" x2="535" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">phir Identity page padho aur Policy tester chalao</text>
</svg><p class="cap">Error code kuch chhune se pehle sahi page ki taraf ishara karta hai.</p></div>

<h3>Ticket 320030: Pune users ko 401 errors</h3>
<p><b>Symptom:</b> saare Pune users ko sign-in error; Chennai ke client-connector users abhi bhi chal rahe hain. <b>Evidence:</b> SAML page certificate 0 days left aur health problem dikhata hai; Alerts mein SAML alert hai. <b>Root cause:</b> signing certificate expire ho gaya, to har assertion verification mein fail hota hai. <b>Fix:</b> renewed certificate load karo. <b>Verify:</b> health healthy ho jaata hai aur ravi ko normal page milta hai.</p>
<pre class="out">Identity &gt; SAML
Certificate ........ <span class="hl">0 days left (expired)</span>
Health ............. PROBLEM
Policy tester  user: ravi  host: news.example
Identity ........... <span class="hl">FAILED: signature check</span>   result: 401</pre>

<h3>Ticket 320080: Sales rule Pune mein chalta hai, Jaipur mein nahi</h3>
<p><b>Symptom:</b> social.example Pune mein Sales ke liye blocked hai lekin Jaipur mein kabir ke liye open hai. <b>Evidence:</b> location jpr par tester user unknown batata hai; Locations page Jaipur ke liye Authentication required: off dikhata hai. <b>Root cause:</b> identity nahi, to Sales rule match nahi kar sakta. <b>Fix:</b> location par authentication on karo, activate. <b>Verify:</b> tester ab kabir (Sales) aur block rule ka naam batata hai.</p>
<pre class="out">Policy tester  user: (from site)  host: social.example  location: jpr
Identity ........... <span class="hl">unknown (authentication off)</span>
URL rule ........... Default allow
Result ............. 200 allowed</pre>

<h3>Ticket 321030: naye HR hire ko access nahi</h3>
<p><b>Symptom:</b> sign in theek, HR portal unreachable. <b>Evidence:</b> user table provisioned no, groups empty dikhati hai; SCIM page not synced; Alerts SCIM alert raise karta hai. <b>Root cause:</b> sync nahi chal raha, to HR group nahi. <b>Fix:</b> SCIM repair karo (token, enable, sync). <b>Verify:</b> user HR dikhata hai, aur dobara sign in ke baad private-access test pass hota hai. Lab <b>zs-id-2</b> isi shape ka hai: naya user, no groups.</p>

<h3>Ticket 321040: contractor offboard karo</h3>
<p><b>Symptom:</b> leaver abhi bhi active hai. <b>Evidence:</b> user table enabled yes, group Contractors. <b>Root cause:</b> account disable nahi hua. <b>Fix:</b> user ko disable karo. <b>Verify:</b> web test 401 deta hai aur private application test fail hota hai. Dono paths prove karo, sirf ek nahi.</p>

<h3>Lab zs-id-1: SAML trust banana</h3>
<p>Lab dono sides ke mismatch se shuru hota hai. Compare karo, jo value alag hai use sahi karo, activate changes karo, aur check karo ki health healthy kehta hai. Note rakho ki kya badla; audit log baad mein use dikhata hai.</p>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Identity page par fix assertion accept hota hai ya nahi, ya user table row valid hai ya nahi, yeh badalta hai. Locations page par fix badalta hai ki user known hai ya nahi. Har fix ka alag test hai: SAML health, tester ki identity line, user table.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Error code padhne se pehle cheezein restart karna ya rules badalna. (2) Cause ki jagah sirf symptom wale user ko fix karna. (3) Verification test ke bina ticket close karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> 401 aur 403 interchangeable nahi hain. 401 identity hai; 403 identity ke success hone ke baad policy block hai.</p></div>

<div class="scn"><h4>Ek hi subah do tickets</h4><p>Ek caller ne bola "Jaipur social media khol sakta hai" aur doosre ne "Pune sign in nahi kar pa raha". Engineer ne dono par same method use kiya: error code, Identity page, tester. Ek authentication off tha, doosra expired certificate. Har ek do minute mein, kyunki evidence pehle aaya.</p><p><b>Seekh:</b> method yaadasht se behtar hai.</p></div>

<div class="iv"><p class="q">"Join karne ke baad user app tak nahi pahunch pa raha. Kaise troubleshoot karoge?"</p><p>Error poochho: sign-in ya blocked. SAML health check karo, phir user row (enabled, provisioned, groups), phir tester ki identity aur rule line. Cause fix karo, same test se verify karo, aur change note karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har baar symptom, evidence, root cause, fix, verify use karo.</li>
<li>401 matlab identity fail; 403 matlab known user ko rule ne block kiya.</li>
<li>Expired certificate: saare users fail; renew karo.</li>
<li>Authentication off: user unknown, group rules miss.</li>
<li>No groups: SCIM repair karo; offboard ke liye disable karo aur verify karo.</li>
</ul></div>
`}};export{e as default};