var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: read the chain with the Access Tracker`,hi:`Troubleshooting workflow: Access Tracker se chain padhna`},body:{en:`
<p>A doctor does not start with surgery. The doctor asks where it hurts, takes the temperature, reads the report, and only then treats. A ClearPass engineer should work the same way. The patient is a failed or wrongly placed client; the report is the Access Tracker record; and the five stages you have learned are the body parts. The workflow below is short enough to remember and strong enough to solve most tickets in this module.</p>

<h3>The six-step workflow</h3>
<ol>
<li><b>Did ClearPass see the request at all?</b> Open the Access Tracker. If there is no record, the problem is before the chain: the NAD is not registered, the source IP is not the one configured, or the shared secret differs. Check the <b>Event Viewer</b>: dropped requests are logged there. (These faults belong to the deployment module; here we only recognise them.)</li>
<li><b>Read the status and the Alerts tab.</b> The error code names the stage.</li>
<li><b>Read the Summary tab.</b> Which service ran? Which method and source? Which roles? Which profiles? Which policy?</li>
<li><b>Read the Input tab</b> when classification or role mapping is suspicious: the real RADIUS attributes and the values taken from the source.</li>
<li><b>Read the Output tab</b> when the result is Accept but the client is in the wrong place: the exact attributes that left ClearPass.</li>
<li><b>Check the switch</b> with <code>show port-access clients detail</code> and, if needed, <code>show port-access role NAME</code>. Then fix one thing, make the client authenticate again, and prove it.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Decision tree for ClearPass tickets">
<rect x="220" y="8" width="200" height="34" rx="8" fill="#bae6fd"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">Record in Access Tracker?</text>
<rect x="20" y="70" width="190" height="40" rx="8" fill="#fed7aa"/><text x="115" y="88" text-anchor="middle" class="svg-ink" font-size="12">No: Event Viewer,</text><text x="115" y="103" text-anchor="middle" class="svg-ink" font-size="12">NAD, IP, secret</text>
<rect x="225" y="70" width="190" height="40" rx="8" fill="#fde68a"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="12">Alert 9002: service</text><text x="320" y="103" text-anchor="middle" class="svg-ink" font-size="12">rules and order</text>
<rect x="430" y="70" width="190" height="40" rx="8" fill="#fde68a"/><text x="525" y="88" text-anchor="middle" class="svg-ink" font-size="12">Alert 215/216/217:</text><text x="525" y="103" text-anchor="middle" class="svg-ink" font-size="12">credentials, source</text>
<rect x="20" y="140" width="190" height="40" rx="8" fill="#ddd6fe"/><text x="115" y="158" text-anchor="middle" class="svg-ink" font-size="12">Roles missing:</text><text x="115" y="173" text-anchor="middle" class="svg-ink" font-size="12">role mapping, attribute</text>
<rect x="225" y="140" width="190" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="158" text-anchor="middle" class="svg-ink" font-size="12">9010 or wrong profile:</text><text x="320" y="173" text-anchor="middle" class="svg-ink" font-size="12">policy rules, order</text>
<rect x="430" y="140" width="190" height="40" rx="8" fill="#bbf7d0"/><text x="525" y="158" text-anchor="middle" class="svg-ink" font-size="12">Accept, wrong place:</text><text x="525" y="173" text-anchor="middle" class="svg-ink" font-size="12">Output vs switch role</text>
<g stroke="#64748b" stroke-width="2"><line x1="260" y1="42" x2="115" y2="70"/><line x1="320" y1="42" x2="320" y2="70"/><line x1="380" y1="42" x2="525" y2="70"/></g>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="13">Yes: read the alert, then Summary, Input, Output and the switch</text>
</svg><p class="cap">Start at the record, let the alert pick the branch, and change one thing at a time.</p></div>

<h3>Symptom to cause table</h3>
<table class="cmp"><tr><th>What you see</th><th>Stage</th><th>Likely cause</th><th>Fix</th></tr>
<tr><td>9002 Failed to classify request to service</td><td>Service</td><td>Rule on wrong NAS-Port-Type or Service-Type; service disabled</td><td>Correct the rule, enable the service</td></tr>
<tr><td>Accepted, but Service is the wrong one</td><td>Service</td><td>Broad service above production</td><td>Reorder or disable the test service</td></tr>
<tr><td>215, 216, 217</td><td>Authentication</td><td>Password, missing account, disabled account</td><td>Fix the account or endpoint</td></tr>
<tr><td>9005 or 9006</td><td>Authentication</td><td>Method or source not on the service</td><td>Add the method or source</td></tr>
<tr><td>Roles shows only [User Authenticated]</td><td>Role mapping</td><td>No rule for this attribute, spelling mismatch</td><td>Add or fix the mapping rule</td></tr>
<tr><td>9010 No enforcement rule matched</td><td>Policy</td><td>No rule for the role; default deny</td><td>Add a policy rule on the right role</td></tr>
<tr><td>Everyone gets the same profile</td><td>Policy</td><td>Catch-all rule first</td><td>Remove or move it</td></tr>
<tr><td>9009 profile does not exist</td><td>Policy</td><td>Rule names a deleted profile</td><td>Recreate the profile or change the rule</td></tr>
<tr><td>9011 VLAN attributes incomplete</td><td>Profile</td><td>Tunnel-Type or Medium-Type missing</td><td>Use the VLAN template</td></tr>
<tr><td>Accepted, role not applied on the switch</td><td>Profile / switch</td><td>Name or case differs from the switch role</td><td>Match the exact name</td></tr></table>

<h3>Worked tickets</h3>
<p><b>Ticket A, Bob rejected (cp-role-mapping).</b> Alerts: 9010. Summary: Roles [User Authenticated]. Stage: role mapping, then policy. Add the CONTRACTOR role, a mapping rule on Department, the EP-CONTRACTOR profile and a policy rule. Bounce LAPTOP2 or wait for the quiet period, then confirm VLAN 20.</p>
<p><b>Ticket B, everyone lands in GUEST after a pilot (cp-service-order).</b> Alerts: none, Status ACCEPT. Summary: Service shows the test service. Stage: service order. Move Wired 802.1X to position 1 or disable the test service, bounce 1/1/3-1/1/4, prove EMPLOYEE and CONTRACTOR.</p>
<p><b>Ticket C, authenticated users all in GUEST though service and roles are right (cp-policy-order).</b> Summary shows the right service and the roles ENGINEER or CONTRACTOR, but the profile is EP-GUEST. Stage: policy order. Show the policy, remove the catch-all at position 1, bounce the ports, prove the roles.</p>
<pre class="out">Summary
-------
  Username                  : bob
  Service                   : Wired 802.1X
  Roles                     : [User Authenticated], <span class="hl">CONTRACTOR</span>
  Enforcement Profiles      : <span class="hl">EP-GUEST</span>
  Enforcement Policy        : EPOL-WIRED</pre>
<p>Lab output, representative of the layout. The right role, the wrong profile: the fault cannot be in role mapping, it must be in the order or content of the policy.</p>

<h3>Habits of a calm engineer</h3>
<ul>
<li>Change one object, then test. Two changes at once hide which one worked.</li>
<li>Always test one user of each kind, not only the one who complained.</li>
<li>Write down what you changed. Rolling back needs a record.</li>
<li>Remember that the fix does not apply to a live session. Use a port bounce, <code>monitoring access-tracker reauthorize MAC</code> or a Disconnect (CoA is covered in the guest and security module).</li>
<li>Do not "fix" with a permissive default. It removes the symptom and keeps the fault.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Changing the switch when ClearPass is at fault and the reverse. Reading the newest record of another user. Forgetting that the tracker keeps history: an old record shows the old configuration. Judging the fix before the client has authenticated again.</p></div>
<div class="exam"><p><b>Exam trap.</b> "No Access Tracker record" and "a record with a reject" are different problems. No record means ClearPass dropped or never received the request (NAD, IP, secret); a reject record means the chain ran and the alert tells you which stage said no.</p></div>

<div class="scn"><h4>Three users, one afternoon</h4><p>Three tickets arrived together: nobody in the branch can connect, a contractor sits in the guest VLAN, and engineers all get guest access. The engineer opened the tracker once and sorted them. Branch: alert 9002 on every request, a service rule problem. Contractor: roles missing, a mapping spelling. Engineers: the right service and roles but profile EP-GUEST, a catch-all at the top of the policy. Three different stages, found in less than ten minutes because she read the alert and the Summary before touching anything.</p><p><b>Lesson:</b> the Access Tracker tells you the stage. Your job is to listen.</p></div>

<div class="iv"><p class="q">"Describe your approach to troubleshooting a ClearPass access problem."</p><p>Strong answer: confirm the request reached ClearPass (Access Tracker, Event Viewer), read the alert code, read the Summary for service, roles and profiles, use Input and Output to compare what came in and what went out, check the switch state, change one thing, force a new authentication and verify. Name one or two codes (9002, 9010, 216) and what each implies.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Start from the Access Tracker record; the alert and the Summary name the stage.</li>
<li>No record means a NAD, IP or secret problem; a reject record means the chain ran.</li>
<li>Roles right but profile wrong points to policy order or content.</li>
<li>Accepted but misplaced points to the response attributes and the switch role.</li>
<li>Change one thing, re-authenticate, verify on both sides.</li>
</ul></div>
`,hi:`
<p>Doctor operation se shuru nahi karta. Woh poochta hai kahan dard hai, temperature leta hai, report padhta hai, aur tab ilaaj karta hai. ClearPass engineer ko bhi aise hi kaam karna chahiye. Patient fail hua ya galat jagah gaya client hai; report Access Tracker record hai; aur jo paanch stages aapne seekhe woh body parts hain. Neeche ka workflow yaad rakhne laayak chhota hai aur is module ke zyada tar tickets solve karne laayak strong.</p>

<h3>Chhe step ka workflow</h3>
<ol>
<li><b>Kya ClearPass ne request dekhi bhi?</b> Access Tracker kholo. Record na ho to problem chain se pehle hai: NAD registered nahi, source IP configured wala nahi, ya shared secret alag hai. <b>Event Viewer</b> check karo: dropped requests wahin log hote hain. (Yeh faults deployment module ke hain; yahan sirf pehchanna hai.)</li>
<li><b>Status aur Alerts tab padho.</b> Error code stage ka naam batata hai.</li>
<li><b>Summary tab padho.</b> Kaunsi service chali? Kaunsa method aur source? Kaunse roles? Kaunse profiles? Kaunsi policy?</li>
<li>Classification ya role mapping par shak ho to <b>Input tab padho</b>: asli RADIUS attributes aur source se liye gaye values.</li>
<li>Result Accept ho lekin client galat jagah ho to <b>Output tab padho</b>: ClearPass se nikle exact attributes.</li>
<li><b>Switch check karo</b> <code>show port-access clients detail</code> se aur zaroorat ho to <code>show port-access role NAME</code> se. Phir ek cheez fix karo, client ko dobara authenticate karwao, aur prove karo.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="ClearPass tickets ka decision tree">
<rect x="220" y="8" width="200" height="34" rx="8" fill="#bae6fd"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">Access Tracker mein record?</text>
<rect x="20" y="70" width="190" height="40" rx="8" fill="#fed7aa"/><text x="115" y="88" text-anchor="middle" class="svg-ink" font-size="12">Nahi: Event Viewer,</text><text x="115" y="103" text-anchor="middle" class="svg-ink" font-size="12">NAD, IP, secret</text>
<rect x="225" y="70" width="190" height="40" rx="8" fill="#fde68a"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="12">Alert 9002: service</text><text x="320" y="103" text-anchor="middle" class="svg-ink" font-size="12">rules aur order</text>
<rect x="430" y="70" width="190" height="40" rx="8" fill="#fde68a"/><text x="525" y="88" text-anchor="middle" class="svg-ink" font-size="12">Alert 215/216/217:</text><text x="525" y="103" text-anchor="middle" class="svg-ink" font-size="12">credentials, source</text>
<rect x="20" y="140" width="190" height="40" rx="8" fill="#ddd6fe"/><text x="115" y="158" text-anchor="middle" class="svg-ink" font-size="12">Roles missing:</text><text x="115" y="173" text-anchor="middle" class="svg-ink" font-size="12">role mapping, attribute</text>
<rect x="225" y="140" width="190" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="158" text-anchor="middle" class="svg-ink" font-size="12">9010 ya galat profile:</text><text x="320" y="173" text-anchor="middle" class="svg-ink" font-size="12">policy rules, order</text>
<rect x="430" y="140" width="190" height="40" rx="8" fill="#bbf7d0"/><text x="525" y="158" text-anchor="middle" class="svg-ink" font-size="12">Accept, galat jagah:</text><text x="525" y="173" text-anchor="middle" class="svg-ink" font-size="12">Output vs switch role</text>
<g stroke="#64748b" stroke-width="2"><line x1="260" y1="42" x2="115" y2="70"/><line x1="320" y1="42" x2="320" y2="70"/><line x1="380" y1="42" x2="525" y2="70"/></g>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="13">Haan: alert padho, phir Summary, Input, Output aur switch</text>
</svg><p class="cap">Record se shuru karo, alert ko branch chunne do, aur ek baar mein ek cheez badlo.</p></div>

<h3>Symptom se cause ki table</h3>
<table class="cmp"><tr><th>Kya dikhta hai</th><th>Stage</th><th>Likely cause</th><th>Fix</th></tr>
<tr><td>9002 Failed to classify request to service</td><td>Service</td><td>Galat NAS-Port-Type ya Service-Type par rule; service disabled</td><td>Rule theek karo, service enable karo</td></tr>
<tr><td>Accepted, lekin Service galat hai</td><td>Service</td><td>Production ke upar broad service</td><td>Reorder karo ya test service disable karo</td></tr>
<tr><td>215, 216, 217</td><td>Authentication</td><td>Password, account missing, account disabled</td><td>Account ya endpoint theek karo</td></tr>
<tr><td>9005 ya 9006</td><td>Authentication</td><td>Method ya source service par nahi</td><td>Method ya source jodo</td></tr>
<tr><td>Roles mein sirf [User Authenticated]</td><td>Role mapping</td><td>Is attribute ka rule nahi, spelling mismatch</td><td>Mapping rule jodo ya theek karo</td></tr>
<tr><td>9010 No enforcement rule matched</td><td>Policy</td><td>Role ka rule nahi; default deny</td><td>Sahi role par policy rule jodo</td></tr>
<tr><td>Sabko same profile milta hai</td><td>Policy</td><td>Catch-all rule pehle</td><td>Hatao ya aage-peeche karo</td></tr>
<tr><td>9009 profile does not exist</td><td>Policy</td><td>Rule delete hue profile ka naam leta hai</td><td>Profile dobara banao ya rule badlo</td></tr>
<tr><td>9011 VLAN attributes incomplete</td><td>Profile</td><td>Tunnel-Type ya Medium-Type missing</td><td>VLAN template use karo</td></tr>
<tr><td>Accepted, switch par role apply nahi hua</td><td>Profile / switch</td><td>Naam ya case switch role se alag</td><td>Exact naam match karo</td></tr></table>

<h3>Worked tickets</h3>
<p><b>Ticket A, Bob reject (cp-role-mapping).</b> Alerts: 9010. Summary: Roles [User Authenticated]. Stage: role mapping, phir policy. CONTRACTOR role, Department par mapping rule, EP-CONTRACTOR profile aur policy rule jodo. LAPTOP2 ko bounce karo ya quiet period ka wait karo, phir VLAN 20 confirm karo.</p>
<p><b>Ticket B, pilot ke baad sab GUEST mein (cp-service-order).</b> Alerts: koi nahi, Status ACCEPT. Summary: Service mein test service dikhti hai. Stage: service order. Wired 802.1X ko position 1 par lao ya test service disable karo, 1/1/3-1/1/4 bounce karo, EMPLOYEE aur CONTRACTOR prove karo.</p>
<p><b>Ticket C, service aur roles sahi hain phir bhi authenticated users sab GUEST mein (cp-policy-order).</b> Summary mein sahi service aur roles ENGINEER ya CONTRACTOR dikhte hain, lekin profile EP-GUEST hai. Stage: policy order. Policy show karo, position 1 ka catch-all hatao, ports bounce karo, roles prove karo.</p>
<pre class="out">Summary
-------
  Username                  : bob
  Service                   : Wired 802.1X
  Roles                     : [User Authenticated], <span class="hl">CONTRACTOR</span>
  Enforcement Profiles      : <span class="hl">EP-GUEST</span>
  Enforcement Policy        : EPOL-WIRED</pre>
<p>Lab output, layout representative hai. Sahi role, galat profile: fault role mapping mein nahi ho sakta, woh policy ke order ya content mein hi hai.</p>

<h3>Shaant engineer ki aadatein</h3>
<ul>
<li>Ek object badlo, phir test karo. Ek saath do changes se pata nahi chalta kaunsa kaam kiya.</li>
<li>Hamesha har kism ke ek user ko test karo, sirf shikayat karne wale ko nahi.</li>
<li>Jo badla woh likh lo. Rollback ke liye record chahiye.</li>
<li>Yaad rakho ki fix live session par lagu nahi hota. Port bounce, <code>monitoring access-tracker reauthorize MAC</code> ya Disconnect use karo (CoA guest aur security module mein hai).</li>
<li>Permissive default se "fix" mat karo. Woh symptom hata deta hai aur fault rakh leta hai.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> ClearPass ki galti mein switch badalna aur ulta. Kisi doosre user ka newest record padhna. Yeh bhoolna ki tracker history rakhta hai: purana record purani configuration dikhata hai. Client ke dobara authenticate hone se pehle fix ko judge karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Access Tracker mein record nahi" aur "reject wala record" alag problems hain. Record nahi ka matlab ClearPass ne request drop ki ya payi hi nahi (NAD, IP, secret); reject record ka matlab chain chali aur alert batata hai kaunse stage ne no kaha.</p></div>

<div class="scn"><h4>Teen users, ek dopahar</h4><p>Teen tickets ek saath aaye: branch mein koi connect nahi ho paa raha, ek contractor guest VLAN mein hai, aur engineers ko guest access mil raha hai. Engineer ne tracker ek baar khola aur unhe sort kar diya. Branch: har request par alert 9002, service rule ki problem. Contractor: roles missing, mapping ki spelling. Engineers: sahi service aur roles lekin profile EP-GUEST, policy ke top par catch-all. Teen alag stages, das minute se kam mein mile, kyunki usne kuch chhoone se pehle alert aur Summary padhe.</p><p><b>Seekh:</b> Access Tracker stage batata hai. Aapka kaam sunna hai.</p></div>

<div class="iv"><p class="q">"ClearPass access problem troubleshoot karne ka aapka approach batao."</p><p>Strong answer: confirm karo request ClearPass tak pahunchi (Access Tracker, Event Viewer), alert code padho, Summary se service, roles aur profiles padho, Input aur Output se compare karo kya aaya aur kya gaya, switch state check karo, ek cheez badlo, nayi authentication force karo aur verify karo. Ek-do codes (9002, 9010, 216) aur unka matlab batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Access Tracker record se shuru karo; alert aur Summary stage ka naam batate hain.</li>
<li>Record nahi ka matlab NAD, IP ya secret problem; reject record ka matlab chain chali.</li>
<li>Roles sahi lekin profile galat ho to policy order ya content ki taraf dekho.</li>
<li>Accepted lekin galat jagah ho to response attributes aur switch role dekho.</li>
<li>Ek cheez badlo, re-authenticate karo, dono side verify karo.</li>
</ul></div>
`}};export{e as default};