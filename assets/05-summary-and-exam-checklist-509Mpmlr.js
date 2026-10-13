var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The module on one page</h3>
<p>Operations is what keeps the service healthy after the design is done. Logs record every request that reaches the cloud; feeds carry them to the SIEM; the policy tester rehearses a request and names the deciding rule; a four-layer method (forwarding, identity, policy, destination) finds faults in order; change control and the audit log keep your own changes safe and traceable.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Operations summary">
<rect x="10" y="30" width="145" height="60" rx="8" fill="#bae6fd"/><text x="82" y="65" text-anchor="middle" class="svg-ink" font-size="13">Logs and feeds</text>
<rect x="170" y="30" width="145" height="60" rx="8" fill="#bbf7d0"/><text x="242" y="65" text-anchor="middle" class="svg-ink" font-size="13">Policy tester</text>
<rect x="330" y="30" width="145" height="60" rx="8" fill="#fde68a"/><text x="402" y="65" text-anchor="middle" class="svg-ink" font-size="13">Four-layer method</text>
<rect x="490" y="30" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="560" y="65" text-anchor="middle" class="svg-ink" font-size="13">Change control</text>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">see it, rehearse it, find it, change it safely</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">audit log ties them together: who changed what, when</text>
</svg><p class="cap">Four daily tools of the operations engineer.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain web and firewall logs and why direct traffic has no log.</li>
<li>List what a feed needs: enabled, log service up, destination, port, format (lab zs-ops-1).</li>
<li>Run the policy tester and read path, identity, rule and result lines.</li>
<li>Explain why first match wins and how to fix rule order.</li>
<li>Troubleshoot in order: forwarding, identity, policy, destination (lab zs-ops-2).</li>
<li>Handle a multi-site outage by finding the common change, as in ticket 321090.</li>
<li>Fix a log feed with wrong format and port, as in ticket 321070.</li>
<li>Write a change plan with window, tests and rollback; read the audit log.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>SIEM</dt><dd>Central security log store with search and alerts.</dd>
<dt>Log feed</dt><dd>A stream of logs from the cloud to a destination.</dd>
<dt>Decision trace</dt><dd>Step-by-step result of the policy tester.</dd>
<dt>Direct path</dt><dd>Traffic that bypasses the cloud: no policy, no logs.</dd>
<dt>Change window</dt><dd>Agreed time to apply a change.</dd>
<dt>Rollback</dt><dd>Restoring previous values after a failed change.</dd>
<dt>Audit log</dt><dd>Record of admin actions and tester runs.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Symptom</th><th>Check first</th></tr>
<tr><td>SIEM receives nothing</td><td>Feed enabled, log service up, destination, port, format</td></tr>
<tr><td>Request missing from logs</td><td>Path: did it go direct?</td></tr>
<tr><td>Wrong rule fires</td><td>Tester rule name, rule order, scope</td></tr>
<tr><td>Two sites down after a change</td><td>Audit log and common change; maybe two faults</td></tr>
<tr><td>Outage after your change</td><td>Roll back with old values, then verify</td></tr>
</table>

<div class="note"><p><b>What does this change on the wire/policy?</b> Logs, feeds and the tester observe; they change no user traffic. Forwarding, identity, policy and activation changes do. Always say which kind of action you are about to take.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Starting at policy, fixing two things at once, trusting a tester run with wrong inputs, and forgetting that exact ports and formats belong to your SIEM documentation.</p></div>
<div class="exam"><p><b>Exam trap.</b> A feed fails if even one of destination, port or format is wrong; fix them all, then confirm at the SIEM.</p></div>

<div class="scn"><h4>Quarter-end review</h4><p>An auditor asked how the team proved fixes. The team showed tickets with tester output before and after, audit entries for each activation, and SIEM events for blocked requests.</p><p><b>Lesson:</b> operations is partly about evidence you can show later.</p></div>

<div class="iv"><p class="q">"Tell me about a time you diagnosed a multi-site outage, or how you would."</p><p>Look for the common event first, check audit log and path per site, use the four layers, fix one issue at a time, verify per site, and record. Mention that different forwarding methods can mean independent faults.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Logs exist only for traffic that reached the cloud.</li>
<li>Feeds need destination, port, format, enabled and a running log service.</li>
<li>The tester names the deciding rule; inputs must match reality.</li>
<li>Four layers: forwarding, identity, policy, destination.</li>
<li>Plan, test, activate in a window, verify, and keep a rollback.</li>
</ul></div>
`,hi:`
<h3>Module ek page par</h3>
<p>Operations woh hai jo design ke baad service ko healthy rakhta hai. Logs cloud tak pahunchne wali har request record karte hain; feeds unhe SIEM tak le jaate hain; policy tester request ka rehearsal karta hai aur decide karne wale rule ka naam batata hai; chaar-layer method (forwarding, identity, policy, destination) faults ko order mein dhundta hai; change control aur audit log aapke apne changes ko safe aur traceable rakhte hain.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Operations summary">
<rect x="10" y="30" width="145" height="60" rx="8" fill="#bae6fd"/><text x="82" y="65" text-anchor="middle" class="svg-ink" font-size="13">Logs aur feeds</text>
<rect x="170" y="30" width="145" height="60" rx="8" fill="#bbf7d0"/><text x="242" y="65" text-anchor="middle" class="svg-ink" font-size="13">Policy tester</text>
<rect x="330" y="30" width="145" height="60" rx="8" fill="#fde68a"/><text x="402" y="65" text-anchor="middle" class="svg-ink" font-size="13">Four-layer method</text>
<rect x="490" y="30" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="560" y="65" text-anchor="middle" class="svg-ink" font-size="13">Change control</text>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">dekho, rehearse karo, dhundo, safely badlo</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">audit log sabko jodta hai: kisne kya kab badla</text>
</svg><p class="cap">Operations engineer ke chaar daily tools.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Web aur firewall logs samjhao aur yeh ki direct traffic ka log kyun nahi hota.</li>
<li>Feed ko kya chahiye batao: enabled, log service up, destination, port, format (lab zs-ops-1).</li>
<li>Policy tester chalao aur path, identity, rule aur result lines padho.</li>
<li>Samjhao first match wins kyun hai aur rule order kaise fix karte hain.</li>
<li>Order mein troubleshoot karo: forwarding, identity, policy, destination (lab zs-ops-2).</li>
<li>Multi-site outage ko common change dhundh kar handle karo, jaise ticket 321090 mein.</li>
<li>Galat format aur port wala log feed fix karo, jaise ticket 321070 mein.</li>
<li>Window, tests aur rollback ke saath change plan likho; audit log padho.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>SIEM</dt><dd>Central security log store, search aur alerts ke saath.</dd>
<dt>Log feed</dt><dd>Cloud se destination tak logs ki stream.</dd>
<dt>Decision trace</dt><dd>Policy tester ka step-by-step result.</dd>
<dt>Direct path</dt><dd>Traffic jo cloud ko bypass karta hai: no policy, no logs.</dd>
<dt>Change window</dt><dd>Change apply karne ka agreed time.</dd>
<dt>Rollback</dt><dd>Failed change ke baad pichhli values restore karna.</dd>
<dt>Audit log</dt><dd>Admin actions aur tester runs ka record.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Symptom</th><th>Pehle check karo</th></tr>
<tr><td>SIEM ko kuch nahi mil raha</td><td>Feed enabled, log service up, destination, port, format</td></tr>
<tr><td>Request logs mein missing</td><td>Path: kya woh direct gayi?</td></tr>
<tr><td>Galat rule fire hota hai</td><td>Tester rule name, rule order, scope</td></tr>
<tr><td>Change ke baad do sites down</td><td>Audit log aur common change; shayad do faults</td></tr>
<tr><td>Aapke change ke baad outage</td><td>Purani values se roll back, phir verify</td></tr>
</table>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Logs, feeds aur tester observe karte hain; user traffic nahi badalte. Forwarding, identity, policy aur activation changes badalte hain. Hamesha bolo ki aap kaun sa action lene wale ho.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Policy se shuru karna, do cheezein ek saath fix karna, galat inputs wale tester run par bharosa karna, aur bhool jaana ki exact ports aur formats aapke SIEM documentation ke hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Feed tab bhi fail hota hai jab destination, port ya format mein se ek bhi galat ho; sab fix karo, phir SIEM par confirm karo.</p></div>

<div class="scn"><h4>Quarter-end review</h4><p>Auditor ne poocha ki team ne fixes kaise prove kiye. Team ne tickets dikhaye jinme pehle aur baad ka tester output tha, har activation ki audit entries, aur blocked requests ke SIEM events.</p><p><b>Seekh:</b> operations ka ek hissa woh evidence hai jo baad mein dikha sakein.</p></div>

<div class="iv"><p class="q">"Multi-site outage diagnose karne ka koi experience batao, ya kaise karoge."</p><p>Pehle common event dhundo, har site ka audit log aur path check karo, chaar layers use karo, ek ek issue fix karo, har site par verify karo, aur record karo. Mention karo ki alag forwarding methods ka matlab independent faults ho sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Logs sirf us traffic ke hote hain jo cloud tak pahuncha.</li>
<li>Feeds ko destination, port, format, enabled aur running log service chahiye.</li>
<li>Tester decide karne wale rule ka naam batata hai; inputs reality se match hone chahiye.</li>
<li>Chaar layers: forwarding, identity, policy, destination.</li>
<li>Plan, test, window mein activate, verify, aur rollback rakho.</li>
</ul></div>
`}};export{e as default};