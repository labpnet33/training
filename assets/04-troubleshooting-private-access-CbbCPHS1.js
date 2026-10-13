var e={id:`troubleshooting-private-access`,h:{en:`Troubleshooting private access`,hi:`Private access troubleshooting`},body:{en:`
<h3>One question: which link in the chain broke?</h3>
<p>"I cannot reach the app" has many causes, but the chain is short and ordered. Do not guess; walk it in the same order the request travels. Each check has a cheap test, and the Policy tester's private-access view shows them all. Method for every case: <b>symptom, evidence, root cause, fix, verify</b>.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Checklist order">
<rect x="6" y="30" width="96" height="60" rx="8" fill="#bae6fd"/><text x="54" y="55" text-anchor="middle" class="svg-ink" font-size="12">1 Client</text><text x="54" y="72" text-anchor="middle" class="svg-muted" font-size="10">signed in, bypass</text>
<rect x="110" y="30" width="96" height="60" rx="8" fill="#bbf7d0"/><text x="158" y="55" text-anchor="middle" class="svg-ink" font-size="12">2 Segment</text><text x="158" y="72" text-anchor="middle" class="svg-muted" font-size="10">domain, port</text>
<rect x="214" y="30" width="96" height="60" rx="8" fill="#ddd6fe"/><text x="262" y="55" text-anchor="middle" class="svg-ink" font-size="12">3 Policy</text><text x="262" y="72" text-anchor="middle" class="svg-muted" font-size="10">order, groups</text>
<rect x="318" y="30" width="96" height="60" rx="8" fill="#fde68a"/><text x="366" y="55" text-anchor="middle" class="svg-ink" font-size="12">4 Server grp</text><text x="366" y="72" text-anchor="middle" class="svg-muted" font-size="10">enabled, groups</text>
<rect x="422" y="30" width="96" height="60" rx="8" fill="#fed7aa"/><text x="470" y="55" text-anchor="middle" class="svg-ink" font-size="12">5 Conn group</text><text x="470" y="72" text-anchor="middle" class="svg-muted" font-size="10">site match</text>
<rect x="526" y="30" width="108" height="60" rx="8" fill="#e2e8f0"/><text x="580" y="55" text-anchor="middle" class="svg-ink" font-size="12">6 Connector</text><text x="580" y="72" text-anchor="middle" class="svg-muted" font-size="10">up, enrolled</text>
</svg><p class="cap">Walk the chain left to right and stop at the first red line.</p></div>

<h3>Case 1: ticket 320110, git unreachable (segment domain typo)</h3>
<p><b>Symptom:</b> vikram, remote, cannot reach git; the new segment was published yesterday. <b>Evidence:</b> the tester shows the client fine, and "no application segment matches git.corp.example:22". <b>Root cause:</b> the segment domain was saved as gti.corp.example. <b>Fix:</b> correct the domain. <b>Verify:</b> the tester shows the segment match and ALLOWED. This is the cheapest bug to prevent: copy names from the DNS record, never retype.</p>

<h3>Case 2: ticket 321010, Sales cannot reach the ERP</h3>
<p><b>Symptom:</b> kabir in Jaipur fails, Finance works. <b>Evidence:</b> segment matches, but the policy line reads "rule Block-Sales-pune, deny". <b>Root cause:</b> a deny rule for Sales sits above the allow rule, first match wins. <b>Fix:</b> move the allow above it, or remove the obsolete deny. <b>Verify:</b> kabir allowed, a user without any rule still denied by the implicit deny.</p>
<pre class="out">Policy tester (private access)  user: kabir  app: erp.corp.example:443
 segment          erp  MATCH
 access policy    <span class="hl">rule 1 Block-Sales-pune  DENY  (first match)</span>
Result: BLOCKED (policy)</pre>

<h3>Case 3: ticket 321020, the files server is unreachable</h3>
<p><b>Symptom:</b> meena cannot open files.corp.example. <b>Evidence:</b> segment and policy pass, then "connector APPCONN-CHN status down, enrolled: no". <b>Root cause:</b> the connector is neither up nor enrolled, so no connector can carry the session. <b>Fix:</b> restart the connector service at the site and re-enroll with a new provisioning key if needed. <b>Verify:</b> the status turns up and enrolled; the tester returns ALLOWED. Remember: enrolled without up, or up without enrolled, both fail.</p>

<h3>Case 4: ticket 321080, remote user cannot reach the ERP (bypass list)</h3>
<p><b>Symptom:</b> vikram at home gets a timeout for erp.corp.example, but git works. <b>Evidence:</b> the client profile lists corp.example among bypass domains; <code>nslookup</code> returns a real-looking address instead of the synthetic one, because the name never entered private access. <b>Root cause:</b> the corporate domain was added to the bypass list. <b>Fix:</b> remove it (keep only what truly must go direct), then run <code>zapp update-policy</code> on the client. <b>Verify:</b> synthetic address appears and the app opens.</p>

<h3>Case 5: ticket 321100, contractors only to the file server</h3>
<p><b>Request, not a fault.</b> Evidence before change: the Contractors group has an allow on a segment group that holds both files and erp. Design: split into Contractor-apps (files) and Pune-apps (erp, hr); rule: Contractors on Contractor-apps allow; remove Contractors from the Pune-apps rule. <b>Verify both ways:</b> rohit reaches files, rohit is BLOCKED on erp, and Finance still reaches erp. Always test that you did not break legitimate users.</p>

<h3>Lab zs-zpa-3: a private app is unreachable</h3>
<p>The lab hides one fault among the layers. Do not poke around. Run the tester, find the first red line, name the object, fix that one thing, rerun. Typical hiding places: a disabled server group, a connector group of the wrong site, a connector not enrolled, a disabled segment, or a deny above an allow.</p>
<table class="cmp"><tr><th>Tester line says</th><th>Look at</th></tr>
<tr><td>no segment matches</td><td>domain spelling, port, enabled switch</td></tr>
<tr><td>policy deny or implicit deny</td><td>rule order, group names, segment group membership</td></tr>
<tr><td>server group disabled or no connector groups</td><td>server group page</td></tr>
<tr><td>site mismatch</td><td>connector group site versus app site</td></tr>
<tr><td>connector down or not enrolled</td><td>connector status, enrollment</td></tr>
<tr><td>client not signed in or bypass</td><td>zapp status, bypass list</td></tr></table>

<div class="note"><p><b>What does this change on the wire/policy?</b> Every fix here changes one entry the broker consults: a name, a rule position, a switch, a site label, or the trust of a connector. None opens a firewall port or changes routing. If your fix list includes "open an inbound port", you have misunderstood the design.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Changing two things at once. (2) Fixing the segment when the connector is down. (3) Testing only as an admin, who may match different rules. (4) Forgetting <code>zapp update-policy</code> after a profile change.</p></div>
<div class="exam"><p><b>Exam trap.</b> "The connector shows up but users fail": check enrollment and the site of its group.</p></div>

<div class="scn"><h4>Monday morning, four tickets, one method</h4><p>Four private-access tickets arrived together. The engineer opened the tester for each, found: a typo, a deny above an allow, a connector not enrolled and a bypass entry. Each took minutes because she read the first failing layer and touched only that.</p><p><b>Lesson:</b> a fixed order of checks turns four mysteries into four lookups.</p></div>

<div class="iv"><p class="q">"A user cannot reach an internal app through private access. How do you troubleshoot?"</p><p>Client first: signed in, private access on, domain not bypassed. Then segment match, access policy order with implicit deny, server group, connector group site, connector up and enrolled. Change one thing, retest, and check both allowed and denied users.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Walk the chain in request order: client, segment, policy, server group, connector group, connector.</li>
<li>The tester names the first failing layer.</li>
<li>Typos, rule order, enrollment and bypass entries are the usual faults.</li>
<li>Least privilege changes need a positive and a negative test.</li>
<li>No fix ever needs an inbound firewall port.</li>
</ul></div>
`,hi:`
<h3>Ek sawaal: chain ki kaun si kadi tooti?</h3>
<p>"App reach nahi ho rahi" ke bahut causes ho sakte hain, lekin chain chhoti aur ordered hai. Guess mat karo; request jis order mein chalti hai usi order mein chain ko walk karo. Har check ka ek sasta test hai, aur Policy tester ka private-access view sab dikha deta hai. Har case ka method: <b>symptom, evidence, root cause, fix, verify</b>.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Checklist ka order">
<rect x="6" y="30" width="96" height="60" rx="8" fill="#bae6fd"/><text x="54" y="55" text-anchor="middle" class="svg-ink" font-size="12">1 Client</text><text x="54" y="72" text-anchor="middle" class="svg-muted" font-size="10">signed in, bypass</text>
<rect x="110" y="30" width="96" height="60" rx="8" fill="#bbf7d0"/><text x="158" y="55" text-anchor="middle" class="svg-ink" font-size="12">2 Segment</text><text x="158" y="72" text-anchor="middle" class="svg-muted" font-size="10">domain, port</text>
<rect x="214" y="30" width="96" height="60" rx="8" fill="#ddd6fe"/><text x="262" y="55" text-anchor="middle" class="svg-ink" font-size="12">3 Policy</text><text x="262" y="72" text-anchor="middle" class="svg-muted" font-size="10">order, groups</text>
<rect x="318" y="30" width="96" height="60" rx="8" fill="#fde68a"/><text x="366" y="55" text-anchor="middle" class="svg-ink" font-size="12">4 Server grp</text><text x="366" y="72" text-anchor="middle" class="svg-muted" font-size="10">enabled, groups</text>
<rect x="422" y="30" width="96" height="60" rx="8" fill="#fed7aa"/><text x="470" y="55" text-anchor="middle" class="svg-ink" font-size="12">5 Conn group</text><text x="470" y="72" text-anchor="middle" class="svg-muted" font-size="10">site match</text>
<rect x="526" y="30" width="108" height="60" rx="8" fill="#e2e8f0"/><text x="580" y="55" text-anchor="middle" class="svg-ink" font-size="12">6 Connector</text><text x="580" y="72" text-anchor="middle" class="svg-muted" font-size="10">up, enrolled</text>
</svg><p class="cap">Chain ko left se right walk karo aur pehli red line par ruko.</p></div>

<h3>Case 1: ticket 320110, git unreachable (segment domain typo)</h3>
<p><b>Symptom:</b> vikram, remote, git reach nahi kar pa raha; naya segment kal publish hua tha. <b>Evidence:</b> tester client ko theek dikhata hai, aur "no application segment matches git.corp.example:22". <b>Root cause:</b> segment domain gti.corp.example save hua tha. <b>Fix:</b> domain sahi karo. <b>Verify:</b> tester segment match aur ALLOWED dikhata hai. Yeh sabse sasta bug hai rokne ke liye: names DNS record se copy karo, dobara type mat karo.</p>

<h3>Case 2: ticket 321010, Sales ERP reach nahi kar pa rahi</h3>
<p><b>Symptom:</b> Jaipur mein kabir fail, Finance chal rahi hai. <b>Evidence:</b> segment match karta hai, lekin policy line likhi hai "rule Block-Sales-pune, deny". <b>Root cause:</b> Sales ka deny rule allow rule ke upar baitha hai, first match wins. <b>Fix:</b> allow ko upar le jao, ya purana deny hata do. <b>Verify:</b> kabir allowed, bina kisi rule wala user abhi bhi implicit deny se denied.</p>
<pre class="out">Policy tester (private access)  user: kabir  app: erp.corp.example:443
 segment          erp  MATCH
 access policy    <span class="hl">rule 1 Block-Sales-pune  DENY  (first match)</span>
Result: BLOCKED (policy)</pre>

<h3>Case 3: ticket 321020, files server unreachable</h3>
<p><b>Symptom:</b> meena files.corp.example nahi khol pa rahi. <b>Evidence:</b> segment aur policy pass, phir "connector APPCONN-CHN status down, enrolled: no". <b>Root cause:</b> connector na up hai na enrolled, to koi connector session carry nahi kar sakta. <b>Fix:</b> site par connector service restart karo aur zaroorat ho to nayi provisioning key se re-enroll karo. <b>Verify:</b> status up aur enrolled ho jata hai; tester ALLOWED deta hai. Yaad rakho: enrolled lekin up nahi, ya up lekin enrolled nahi, dono fail hote hain.</p>

<h3>Case 4: ticket 321080, remote user ERP reach nahi kar pa raha (bypass list)</h3>
<p><b>Symptom:</b> ghar par vikram ko erp.corp.example ka timeout milta hai, lekin git chalta hai. <b>Evidence:</b> client profile mein corp.example bypass domains mein hai; <code>nslookup</code> synthetic ki jagah real jaisa address deta hai, kyunki name private access mein kabhi gaya hi nahi. <b>Root cause:</b> corporate domain bypass list mein add ho gaya. <b>Fix:</b> use hatao (sirf wahi rakho jo sach mein direct jaana chahiye), phir client par <code>zapp update-policy</code> chalao. <b>Verify:</b> synthetic address aata hai aur app khulti hai.</p>

<h3>Case 5: ticket 321100, contractors sirf file server tak</h3>
<p><b>Request hai, fault nahi.</b> Change se pehle evidence: Contractors group ko aise segment group par allow hai jisme files aur erp dono hain. Design: Contractor-apps (files) aur Pune-apps (erp, hr) mein split karo; rule: Contractors ko Contractor-apps par allow; Contractors ko Pune-apps wale rule se hatao. <b>Dono tarah verify karo:</b> rohit files reach karta hai, rohit erp par BLOCKED hai, aur Finance abhi bhi erp reach karti hai. Hamesha test karo ki aapne legitimate users nahi toda.</p>

<h3>Lab zs-zpa-3: private app unreachable hai</h3>
<p>Lab layers ke beech ek fault chhupata hai. Idhar-udhar haath mat maaro. Tester chalao, pehli red line dhoondho, object ka naam lo, sirf wahi ek cheez fix karo, dobara chalao. Chhupne ki aam jagahein: disabled server group, galat site ka connector group, enrolled na hua connector, disabled segment, ya allow ke upar deny.</p>
<table class="cmp"><tr><th>Tester line kehti hai</th><th>Kahan dekho</th></tr>
<tr><td>no segment matches</td><td>domain spelling, port, enabled switch</td></tr>
<tr><td>policy deny ya implicit deny</td><td>rule order, group names, segment group membership</td></tr>
<tr><td>server group disabled ya no connector groups</td><td>server group page</td></tr>
<tr><td>site mismatch</td><td>connector group site versus app site</td></tr>
<tr><td>connector down ya not enrolled</td><td>connector status, enrollment</td></tr>
<tr><td>client not signed in ya bypass</td><td>zapp status, bypass list</td></tr></table>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Yahan har fix ek aisi entry badalta hai jise broker consult karta hai: ek name, rule ki position, ek switch, ek site label, ya connector ka trust. Koi bhi firewall port nahi kholta ya routing nahi badalta. Aapki fix list mein "inbound port kholo" aaye to aapne design galat samjha hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Ek saath do cheezein badalna. (2) Connector down ho aur segment fix karna. (3) Sirf admin ke roop mein test karna, jo alag rules match kar sakta hai. (4) Profile change ke baad <code>zapp update-policy</code> bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Connector up dikhta hai lekin users fail": enrollment aur uske group ki site check karo.</p></div>

<div class="scn"><h4>Monday subah, chaar tickets, ek method</h4><p>Chaar private-access tickets ek saath aaye. Engineer ne har ek ke liye tester khola aur paaya: ek typo, allow ke upar deny, ek connector enrolled nahi, aur ek bypass entry. Har ek minutes mein hua kyunki usne pehli failing layer padhi aur sirf wahi chhui.</p><p><b>Seekh:</b> checks ka fixed order chaar mysteries ko chaar lookups bana deta hai.</p></div>

<div class="iv"><p class="q">"User private access se internal app reach nahi kar pa raha. Troubleshoot kaise karoge?"</p><p>Pehle client: signed in, private access on, domain bypass mein nahi. Phir segment match, implicit deny ke saath access policy order, server group, connector group site, connector up aur enrolled. Ek cheez badlo, retest karo, aur allowed aur denied dono users check karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chain ko request order mein walk karo: client, segment, policy, server group, connector group, connector.</li>
<li>Tester pehli failing layer ka naam batata hai.</li>
<li>Typos, rule order, enrollment aur bypass entries aam faults hain.</li>
<li>Least privilege changes ko positive aur negative test chahiye.</li>
<li>Koi fix kabhi inbound firewall port nahi maangta.</li>
</ul></div>
`}};export{e as default};