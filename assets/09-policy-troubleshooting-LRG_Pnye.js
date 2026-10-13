var e={id:`policy-troubleshooting`,h:{en:`Troubleshooting policy matches with traffic logs`,hi:`Traffic logs se policy match troubleshoot karna`},body:{en:`
<p>A doctor does not guess. She reads the chart, asks where it hurts and checks one thing at a time. Policy troubleshooting is the same: you do not start by editing rules. You read the traffic log, find which rule decided, and compare that with the rule you expected. The log is the chart.</p>

<h3>The five questions</h3>
<ol>
<li><b>Did the traffic arrive at all?</b> Search the traffic log by source IP (for example 10.200.0.7) or user. No entry means the problem is before policy: tunnel, GlobalProtect, routing.</li>
<li><b>Which rule decided?</b> Read the rule name column. This is often the whole answer.</li>
<li><b>Which zones did it see?</b> Compare source zone and destination zone with what you intended. A data-centre zone left in untrust is the classic mistake.</li>
<li><b>Which application and user did it see?</b> The application may differ from what the rule lists; the user may be missing.</li>
<li><b>Is the configuration live?</b> A saved change is not a pushed change. Check that the push finished and the status is in sync.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Triage flow">
<rect x="220" y="10" width="200" height="36" rx="8" fill="#bae6fd"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Log entry exists?</text>
<rect x="30" y="80" width="170" height="36" rx="8" fill="#fed7aa"/><text x="115" y="103" text-anchor="middle" class="svg-ink" font-size="12">No: tunnel, routing, GP</text>
<rect x="240" y="80" width="160" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="103" text-anchor="middle" class="svg-ink" font-size="13">Yes: read rule name</text>
<rect x="440" y="80" width="180" height="36" rx="8" fill="#ddd6fe"/><text x="530" y="103" text-anchor="middle" class="svg-ink" font-size="12">Expected rule?</text>
<rect x="120" y="160" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="215" y="182" text-anchor="middle" class="svg-ink" font-size="12">Yes: check profile,</text><text x="215" y="198" text-anchor="middle" class="svg-ink" font-size="12">URL log, return path</text>
<rect x="340" y="160" width="190" height="50" rx="8" fill="#fde68a"/><text x="435" y="182" text-anchor="middle" class="svg-ink" font-size="12">No: zones, order,</text><text x="435" y="198" text-anchor="middle" class="svg-ink" font-size="12">user, push status</text>
<line x1="270" y1="46" x2="150" y2="80" stroke="#64748b" stroke-width="2"/><line x1="320" y1="46" x2="320" y2="80" stroke="#64748b" stroke-width="2"/><line x1="400" y1="98" x2="440" y2="98" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="116" x2="260" y2="160" stroke="#64748b" stroke-width="2"/><line x1="540" y1="116" x2="440" y2="160" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Start from the log. If there is no entry, policy is not the problem yet.</p></div>

<h3>Reading a traffic log row</h3>
<p>Typical columns (names vary by tool): time, source IP, source user, source zone, destination IP, destination zone, application, rule, action, and session end reason. Read left to right and ask whether each value matches your intent.</p>
<pre class="out">Time      Src IP       User        Src Zone  Dst IP       Dst Zone  App   Rule                 Action
15:30:02  10.200.0.7   lab-user1   mobile    10.10.0.50   <span class="hl">untrust</span>   ssl   <span class="hl">deny-other-internal</span>  deny</pre>
<p>This one row says: the user was identified, the app was ssl, but the destination was seen as untrust. Why did it hit <code>deny-other-internal</code>? Because the allow rule needs destination zone trust. The zone mapping is the fault, not the rule.</p>

<h3>The lab fault: wrong order or unmapped zone</h3>
<div class="eg"><p><b>Worked example (lab pa-policy-3).</b> Symptom: lab-user1 on LAPTOP-HOME (203.0.113.50, pool address 10.200.0.7) cannot open the app at 10.10.0.50. Tunnel and GlobalProtect are fine (the user has a pool address and can browse). Step 1: the traffic log has entries, so traffic arrives. Step 2: the rule column says a broad deny at position 1. Step 3: destination zone is trust, so the zone is fine. Fix: move the broad deny below <code>allow-private-hq-app</code>, push, retest. In the second variant of the lab the rule order is right but the destination zone shows untrust; then the fix is in the zone mapping and the push, not in the rule list.</p></div>

<h3>Common fault patterns and where to look</h3>
<table class="cmp">
<tr><th>Symptom</th><th>Log evidence</th><th>Likely cause</th><th>Fix</th></tr>
<tr><td>Internal app blocked</td><td>Dst zone untrust</td><td>Zone not mapped to trust</td><td>Zone mapping, push</td></tr>
<tr><td>Allow rule never hits</td><td>Another rule name above</td><td>Shadowing</td><td>Reorder or narrow</td></tr>
<tr><td>Group rule does not match</td><td>User blank or wrong</td><td>Missing identity mapping</td><td>Fix CIE or master device data</td></tr>
<tr><td>Site blocked, no deny rule</td><td>URL log shows block</td><td>URL category action</td><td>Custom category or profile change</td></tr>
<tr><td>Allowed but no reply</td><td>Allow in log, no response</td><td>Return route missing</td><td>Service connection routing</td></tr>
<tr><td>Change has no effect</td><td>Old rule names</td><td>Not pushed</td><td>Push; wait for in-sync</td></tr>
<tr><td>No rule hit logged</td><td>Entry has no forwarding</td><td>Log forwarding profile missing</td><td>Attach profile</td></tr>
</table>

<h3>Wait for the push, then test again</h3>
<p>In SCM the default mobile user protection should be checked about 15 minutes after the first push, as the documentation advises. After every change, check that the push job succeeded and the configuration is in sync, then repeat the exact same test. A test with a different source, application or time is not a fair comparison.</p>

<div class="warn"><p><b>Common mistakes.</b> Editing rules before reading the log; testing from a different user than the complaint; concluding "policy is fine" when the log shows no entry (the traffic never reached policy); making two changes at once and not knowing which one fixed it.</p></div>
<div class="exam"><p><b>Exam trap.</b> The traffic log, not the rule list, tells you which rule actually matched. For traffic enforcement questions the documented evidence is the Log Viewer traffic logs, zone mapping, rule order, the log forwarding profile and the push status. Answers that suggest rebuilding the tunnel for a policy deny are wrong.</p></div>

<div class="scn"><h4>"We opened the firewall and nothing changed"</h4><p>A team added an allow rule for a new app at 10.10.0.60, saved it and tested. Still blocked. The traffic log kept showing the final deny. The push job for the container was never started; the change sat as a pending, saved edit. After running the push and waiting for in-sync, the log showed the new rule name with allow.</p><p><b>Lesson:</b> saved is not live. Confirm the push, then retest.</p></div>

<div class="iv"><p class="q">"A user says a private app is blocked. Walk me through it."</p><p>Search the traffic log for the user or source IP. If no entry, check connectivity. If there is one, read the rule name, source and destination zones, application and user. Compare with the intended rule, fix zone mapping, order, identity or profile, push, wait for in-sync, retest with the same case.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Start with the traffic log, not with the rule editor.</li>
<li>The rule name column shows which rule decided.</li>
<li>Check zones, application, user and push status for every mismatch.</li>
<li>A URL block appears in the URL log, not as a deny rule.</li>
<li>Change one thing, push, wait for in-sync, retest identically.</li>
</ul></div>
`,hi:`
<p>Doctor andaza nahi lagati. Wo chart padhti hai, poochhti hai kahan dard hai aur ek ek cheez check karti hai. Policy troubleshooting bhi aisi hi hai: aap rules edit karke shuru nahi karte. Traffic log padhte ho, dekhte ho kaunse rule ne decide kiya, aur use us rule se compare karte ho jiski aapko ummeed thi. Log hi chart hai.</p>

<h3>Paanch sawal</h3>
<ol>
<li><b>Kya traffic aaya bhi?</b> Traffic log source IP (jaise 10.200.0.7) ya user se search karo. Entry nahi hai to problem policy se pehle hai: tunnel, GlobalProtect, routing.</li>
<li><b>Kaunse rule ne decide kiya?</b> Rule name column padho. Aksar yahi poora jawab hota hai.</li>
<li><b>Usne kaunse zones dekhe?</b> Source zone aur destination zone ko apne intent se compare karo. Data-centre zone untrust mein reh jana classic galti hai.</li>
<li><b>Usne kaunsi application aur user dekha?</b> Application rule ki list se alag ho sakti hai; user missing ho sakta hai.</li>
<li><b>Kya configuration live hai?</b> Saved change aur pushed change alag cheezein hain. Check karo push khatam hua aur status in sync hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Triage flow">
<rect x="220" y="10" width="200" height="36" rx="8" fill="#bae6fd"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Log entry hai?</text>
<rect x="30" y="80" width="170" height="36" rx="8" fill="#fed7aa"/><text x="115" y="103" text-anchor="middle" class="svg-ink" font-size="12">Nahi: tunnel, routing, GP</text>
<rect x="240" y="80" width="160" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="103" text-anchor="middle" class="svg-ink" font-size="13">Haan: rule name padho</text>
<rect x="440" y="80" width="180" height="36" rx="8" fill="#ddd6fe"/><text x="530" y="103" text-anchor="middle" class="svg-ink" font-size="12">Expected rule?</text>
<rect x="120" y="160" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="215" y="182" text-anchor="middle" class="svg-ink" font-size="12">Haan: profile, URL log,</text><text x="215" y="198" text-anchor="middle" class="svg-ink" font-size="12">return path check</text>
<rect x="340" y="160" width="190" height="50" rx="8" fill="#fde68a"/><text x="435" y="182" text-anchor="middle" class="svg-ink" font-size="12">Nahi: zones, order,</text><text x="435" y="198" text-anchor="middle" class="svg-ink" font-size="12">user, push status</text>
<line x1="270" y1="46" x2="150" y2="80" stroke="#64748b" stroke-width="2"/><line x1="320" y1="46" x2="320" y2="80" stroke="#64748b" stroke-width="2"/><line x1="400" y1="98" x2="440" y2="98" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="116" x2="260" y2="160" stroke="#64748b" stroke-width="2"/><line x1="540" y1="116" x2="440" y2="160" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Log se shuru karo. Entry nahi hai to abhi policy problem nahi hai.</p></div>

<h3>Traffic log row padhna</h3>
<p>Typical columns (naam tool ke hisaab se badalte hain): time, source IP, source user, source zone, destination IP, destination zone, application, rule, action aur session end reason. Left se right padho aur poochho ki har value aapke intent se match karti hai ya nahi.</p>
<pre class="out">Time      Src IP       User        Src Zone  Dst IP       Dst Zone  App   Rule                 Action
15:30:02  10.200.0.7   lab-user1   mobile    10.10.0.50   <span class="hl">untrust</span>   ssl   <span class="hl">deny-other-internal</span>  deny</pre>
<p>Ye ek row kehti hai: user identify hua, app ssl thi, lekin destination untrust dikhi. <code>deny-other-internal</code> kyun hit hua? Kyunki allow rule ko destination zone trust chahiye. Fault zone mapping hai, rule nahi.</p>

<h3>Lab fault: galat order ya unmapped zone</h3>
<div class="eg"><p><b>Worked example (lab pa-policy-3).</b> Symptom: LAPTOP-HOME (203.0.113.50, pool address 10.200.0.7) par lab-user1 10.10.0.50 ka app nahi khol paa raha. Tunnel aur GlobalProtect theek hain (user ko pool address mila hai aur browse kar sakta hai). Step 1: traffic log mein entries hain, yani traffic aa raha hai. Step 2: rule column position 1 ka broad deny dikhata hai. Step 3: destination zone trust hai, yani zone theek hai. Fix: broad deny ko <code>allow-private-hq-app</code> ke neeche le jao, push karo, dobara test karo. Lab ke doosre variant mein rule order sahi hai lekin destination zone untrust dikhti hai; tab fix rule list mein nahi, zone mapping aur push mein hai.</p></div>

<h3>Common fault patterns aur kahan dekhein</h3>
<table class="cmp">
<tr><th>Symptom</th><th>Log evidence</th><th>Likely cause</th><th>Fix</th></tr>
<tr><td>Internal app blocked</td><td>Dst zone untrust</td><td>Zone trust se map nahi</td><td>Zone mapping, push</td></tr>
<tr><td>Allow rule kabhi hit nahi</td><td>Upar doosre rule ka naam</td><td>Shadowing</td><td>Reorder ya narrow</td></tr>
<tr><td>Group rule match nahi</td><td>User blank ya galat</td><td>Identity mapping missing</td><td>CIE ya master device data fix</td></tr>
<tr><td>Site blocked, deny rule nahi</td><td>URL log block dikhata hai</td><td>URL category action</td><td>Custom category ya profile change</td></tr>
<tr><td>Allowed lekin reply nahi</td><td>Log mein allow, response nahi</td><td>Return route missing</td><td>Service connection routing</td></tr>
<tr><td>Change ka asar nahi</td><td>Purane rule names</td><td>Push nahi hua</td><td>Push; in-sync ka wait</td></tr>
<tr><td>Rule hit logged nahi</td><td>Entry forwarding ke bina</td><td>Log forwarding profile missing</td><td>Profile attach karo</td></tr>
</table>

<h3>Push ka wait karo, phir dobara test karo</h3>
<p>SCM mein default mobile user protection pehle push ke lagbhag 15 minute baad check karni chahiye, jaisa documentation salah deti hai. Har change ke baad check karo ki push job succeed hua aur configuration in sync hai, phir bilkul wahi test dobara karo. Alag source, application ya time wala test fair comparison nahi hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Log padhne se pehle rules edit karna; complaint wale user se alag user se test karna; log mein entry na ho tab bhi "policy theek hai" maan lena (traffic policy tak pahuncha hi nahi); ek saath do changes karna aur na jaanna ki kisne fix kiya.</p></div>
<div class="exam"><p><b>Exam trap.</b> Kaunsa rule actually match hua ye rule list nahi, traffic log batata hai. Traffic enforcement questions ka documented evidence hai Log Viewer ke traffic logs, zone mapping, rule order, log forwarding profile aur push status. Policy deny ke liye tunnel dobara banane wale jawab galat hain.</p></div>

<div class="scn"><h4>"Humne firewall khola aur kuch nahi badla"</h4><p>Team ne 10.10.0.60 ke naye app ke liye allow rule add kiya, save kiya aur test kiya. Phir bhi blocked. Traffic log final deny hi dikhata raha. Container ka push job kabhi start hi nahi hua tha; change pending, saved edit ke roop mein pada tha. Push chalakar in-sync ka wait karne ke baad log mein naya rule name allow ke saath dikha.</p><p><b>Lesson:</b> saved matlab live nahi. Push confirm karo, phir retest.</p></div>

<div class="iv"><p class="q">"User kehta hai private app blocked hai. Mujhe step by step batao."</p><p>Traffic log mein user ya source IP search karo. Entry nahi hai to connectivity check karo. Hai to rule name, source aur destination zones, application aur user padho. Intended rule se compare karo, zone mapping, order, identity ya profile fix karo, push karo, in-sync ka wait karo, aur same case se retest karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rule editor se nahi, traffic log se shuru karo.</li>
<li>Rule name column dikhata hai kisne decide kiya.</li>
<li>Har mismatch ke liye zones, application, user aur push status check karo.</li>
<li>URL block URL log mein dikhta hai, deny rule ke roop mein nahi.</li>
<li>Ek cheez badlo, push karo, in-sync ka wait karo, bilkul same retest karo.</li>
</ul></div>
`}};export{e as default};