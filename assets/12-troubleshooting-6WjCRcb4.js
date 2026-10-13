var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow for endpoint and email tickets`,hi:`Endpoint aur email tickets ke liye troubleshooting workflow`},body:{en:`
<p>A good mechanic does not start by replacing the engine. When a car will not start he asks, in order: is there fuel, is the battery charged, does the starter turn, is there a spark? Each answer rules out a whole branch. Endpoint and email tickets sound dramatic ("the antivirus did nothing!") but almost always fall into a few branches you can test in order. This chapter gives you that order and applies it to the four labs.</p>

<h3>The endpoint ladder</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Endpoint troubleshooting ladder">
<rect x="20" y="10" width="300" height="38" rx="8" fill="#bae6fd"/><text x="170" y="34" text-anchor="middle" class="svg-ink" font-size="13">1. Connector installed and online?</text>
<rect x="20" y="58" width="300" height="38" rx="8" fill="#bae6fd"/><text x="170" y="82" text-anchor="middle" class="svg-ink" font-size="13">2. Which group, policy and mode?</text>
<rect x="20" y="106" width="300" height="38" rx="8" fill="#bbf7d0"/><text x="170" y="130" text-anchor="middle" class="svg-ink" font-size="13">3. What was the disposition?</text>
<rect x="20" y="154" width="300" height="38" rx="8" fill="#bbf7d0"/><text x="170" y="178" text-anchor="middle" class="svg-ink" font-size="13">4. Allow list or exclusion in the way?</text>
<rect x="20" y="202" width="300" height="38" rx="8" fill="#fde68a"/><text x="170" y="226" text-anchor="middle" class="svg-ink" font-size="13">5. Which engine fired, which event?</text>
<rect x="20" y="250" width="300" height="38" rx="8" fill="#fde68a"/><text x="170" y="274" text-anchor="middle" class="svg-ink" font-size="13">6. Scope: trajectory, contain</text>
<text x="340" y="34" class="svg-muted" font-size="12">secure-endpoint status, last seen</text>
<text x="340" y="82" class="svg-muted" font-size="12">audit vs protect: the classic</text>
<text x="340" y="130" class="svg-muted" font-size="12">Unknown runs, Malicious acts</text>
<text x="340" y="178" class="svg-muted" font-size="12">Allowed beats convicted</text>
<text x="340" y="226" class="svg-muted" font-size="12">Threat Detected vs Quarantine Success</text>
<text x="340" y="274" class="svg-muted" font-size="12">file trajectory, isolate, custom detection</text>
</svg><p class="cap">Test from the top; most tickets are solved by step 2 or step 4.</p></div>

<h3>Symptom to cause</h3>
<table class="cmp"><tr><th>Symptom</th><th>Most likely cause</th><th>Check / fix</th></tr>
<tr><td>Threat Detected, but the file ran</td><td>Policy in <b>Audit</b> mode</td><td>Status line <code>Policy : X (audit)</code>; move the group to a Protect policy</td></tr>
<tr><td>Known-malicious file ran in Protect mode, event says "Allowed"</td><td>Hash or path on the <b>Allowed</b> list, or an over-broad exclusion</td><td>Remove the entry; use the narrowest exclusion</td></tr>
<tr><td>New file ran with no block</td><td>Disposition <b>Unknown</b></td><td>Submit to Malware Analytics; add a Simple Custom Detection if confirmed</td></tr>
<tr><td>Custom detection added, but no retrospective quarantine</td><td>List not attached to that policy; host in Audit; file never seen there; exact hash differs</td><td>Check policy lists, mode, file trajectory, the SHA-256</td></tr>
<tr><td>No events from a computer</td><td>No connector, connector offline, proxy blocking the cloud</td><td><code>secure-endpoint status</code>, last-seen time, policy proxy settings</td></tr>
<tr><td>Isolated host still reachable or cannot be released</td><td>Connector offline when isolation was sent; unsupported OS; cloud unreachable</td><td>Check last seen; use the unlock code locally</td></tr>
<tr><td>Business app quarantined</td><td>False positive</td><td>Restore from quarantine; allow-list by exact SHA-256; report it</td></tr>
</table>

<h3>Applying it to the labs</h3>
<p><b>Lab (a): "logged but not stopped".</b> Step 1 passes (connector 8.4.1, registered). Step 2 finds the cause immediately:</p>
<pre class="out">PC1&gt; secure-endpoint status
Cisco Secure Endpoint Connector 8.4.1
  Computer   : PC1
  Group      : Endpoints
<span class="hl">  Policy     : NK-Standard (audit)</span>
  Isolation  : Not isolated
  Quarantined: 0 file(s)</pre>
<p>Fix: NK-Standard to Protect; prove it with <code>Quarantine Success</code> and <code>Quarantined: 1 file(s)</code>.</p>
<p><b>Lab (b): "ran today, bad tomorrow".</b> Step 3: the Cloud IOC shows disposition Unknown, so Protect mode correctly let it run. The right action is outbreak control, not a policy change: Simple Custom Detection NK-Dropper, verify the RETRO quarantine, isolate PC1 and confirm with <code>ping 203.0.113.9</code> timing out.</p>
<p><b>Lab (c): "Protect mode on all three, still ran everywhere".</b> Step 2 passes (Workstations, Protect). Step 4 is the cause:</p>
<pre class="out">2026-09-29 09:01:04  Executed malware  PC-SALES  invoice_2026.exe  <span class="hl">Allowed by allow list</span></pre>
<p>Step 6 scopes it: earliest execution PC-SALES, parent <code>outlook.exe</code>; isolate patient zero, then remove the Allowed entry and contain the other two.</p>
<p><b>Lab (d): the email ticket.</b> The email ladder is shorter: (1) find the campaign by sender and verdict, not subject; (2) count and confirm each message's verdict; (3) remediate the bad ones; (4) verify clean mail is untouched; (5) if remediation fails, check that the tenant integration has read/write permission and that the message has not already been moved or deleted by the user. Result: M1, M2 and M4 in Quarantine; M3 untouched; M5 (BEC) escalated separately.</p>

<div class="eg"><p><b>Worked example: a false positive done right.</b> After a vendor update, the finance team's <code>ledger-sync.exe</code> is quarantined on 31 computers. The event shows a Malicious disposition from the cloud for SHA-256 <code>7c41…9e</code>. Wrong fix: switch Finance to Audit. Right fix: confirm with the vendor and Malware Analytics that the file is benign, restore it from quarantine on the 31 computers, add that exact SHA-256 to the Allowed list for the Finance policy, and report the false positive to Cisco. Every other protection stays on.</p></div>

<div class="warn"><p><b>Common mistake.</b> Fixing a ticket by weakening protection (Audit mode, disabling an engine, allow-listing a folder). It closes the ticket and opens the next breach. Every fix should be the narrowest change that solves the specific problem.</p></div>

<div class="exam"><p><b>Exam trap.</b> Scenario questions often hide the answer in one word of output: <i>audit</i>, <i>Unknown</i>, <i>Allowed</i>, <i>retro</i>. Read the event detail and the policy line before you read the answer options.</p></div>

<div class="scn"><h4>The custom detection that did nothing</h4><p>A SOC analyst added a SHA-256 from a threat report as a Simple Custom Detection for the Servers group, but no retrospective events appeared, although the file was on two servers. Working the ladder: the Servers policy used a different custom-detection list than the one he edited. Attaching the list to the Servers policy triggered retrospective quarantine on both servers within minutes.</p><p><b>Lesson:</b> outbreak-control lists only act through the policies that use them.</p></div>

<div class="iv"><p class="q">"A user says Secure Endpoint did not stop malware. How do you troubleshoot?"</p><p>Strong answer: work top-down. Confirm the connector is installed, registered and online. Read the computer's group, policy and mode: Audit only logs. Read the event's disposition: Unknown files run. Check for allow-list entries or exclusions that cover the file. Identify which engine fired and whether there is a Quarantine Success. Then scope with file trajectory and contain with isolation and a custom detection. Fix with the narrowest change and never by disabling protection.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ladder: connector online → group/policy/mode → disposition → allow list/exclusion → engine/event → scope and contain.</li>
<li>Audit mode and Allowed lists explain most "it did not stop it" tickets.</li>
<li>Unknown files are allowed by design; outbreak control and retrospection handle them.</li>
<li>Email: filter by sender and verdict, remediate only the bad messages, verify clean mail, check read/write permission.</li>
<li>Fix false positives with exact SHA-256 allow entries, never by switching to Audit.</li>
</ul></div>
`,hi:`
<p>Accha mechanic engine badalne se shuru nahi karta. Jab car start nahi hoti, woh order mein poochta hai: fuel hai, battery charged hai, starter ghoomta hai, spark hai? Har jawab ek poori branch ko rule out karta hai. Endpoint aur email tickets dramatic lagte hain ("antivirus ne kuch nahi kiya!") par lagbhag hamesha kuch branches mein aate hain jinhe aap order mein test kar sakte ho. Yeh chapter aapko woh order deta hai aur use chaaron labs par lagata hai.</p>

<h3>Endpoint ladder</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Endpoint troubleshooting ladder">
<rect x="20" y="10" width="300" height="38" rx="8" fill="#bae6fd"/><text x="170" y="34" text-anchor="middle" class="svg-ink" font-size="13">1. Connector installed aur online?</text>
<rect x="20" y="58" width="300" height="38" rx="8" fill="#bae6fd"/><text x="170" y="82" text-anchor="middle" class="svg-ink" font-size="13">2. Kaunsa group, policy aur mode?</text>
<rect x="20" y="106" width="300" height="38" rx="8" fill="#bbf7d0"/><text x="170" y="130" text-anchor="middle" class="svg-ink" font-size="13">3. Disposition kya tha?</text>
<rect x="20" y="154" width="300" height="38" rx="8" fill="#bbf7d0"/><text x="170" y="178" text-anchor="middle" class="svg-ink" font-size="13">4. Allow list ya exclusion beech mein?</text>
<rect x="20" y="202" width="300" height="38" rx="8" fill="#fde68a"/><text x="170" y="226" text-anchor="middle" class="svg-ink" font-size="13">5. Kaunsa engine, kaunsa event?</text>
<rect x="20" y="250" width="300" height="38" rx="8" fill="#fde68a"/><text x="170" y="274" text-anchor="middle" class="svg-ink" font-size="13">6. Scope: trajectory, contain</text>
<text x="340" y="34" class="svg-muted" font-size="12">secure-endpoint status, last seen</text>
<text x="340" y="82" class="svg-muted" font-size="12">audit vs protect: classic</text>
<text x="340" y="130" class="svg-muted" font-size="12">Unknown chalta, Malicious par action</text>
<text x="340" y="178" class="svg-muted" font-size="12">Allowed conviction ko harata hai</text>
<text x="340" y="226" class="svg-muted" font-size="12">Threat Detected vs Quarantine Success</text>
<text x="340" y="274" class="svg-muted" font-size="12">file trajectory, isolate, custom detection</text>
</svg><p class="cap">Upar se test karo; zyadatar tickets step 2 ya step 4 par solve ho jaate hain.</p></div>

<h3>Symptom se cause</h3>
<table class="cmp"><tr><th>Symptom</th><th>Sabse likely cause</th><th>Check / fix</th></tr>
<tr><td>Threat Detected, par file chali</td><td>Policy <b>Audit</b> mode mein</td><td>Status line <code>Policy : X (audit)</code>; group ko Protect policy par le jao</td></tr>
<tr><td>Protect mode mein known-malicious file chali, event kehta hai "Allowed"</td><td>Hash ya path <b>Allowed</b> list par, ya over-broad exclusion</td><td>Entry hatao; sabse narrow exclusion use karo</td></tr>
<tr><td>Nayi file bina block chali</td><td>Disposition <b>Unknown</b></td><td>Malware Analytics ko submit karo; confirm ho to Simple Custom Detection add karo</td></tr>
<tr><td>Custom detection add ki, par retrospective quarantine nahi</td><td>List us policy se judi nahi; host Audit mein; file wahan kabhi dekhi nahi gayi; exact hash alag</td><td>Policy lists, mode, file trajectory, SHA-256 check karo</td></tr>
<tr><td>Computer se koi events nahi</td><td>Connector nahi, connector offline, proxy cloud ko block kar raha</td><td><code>secure-endpoint status</code>, last-seen time, policy proxy settings</td></tr>
<tr><td>Isolated host abhi bhi reachable ya release nahi ho raha</td><td>Isolation bhejte waqt connector offline; unsupported OS; cloud unreachable</td><td>Last seen check karo; locally unlock code use karo</td></tr>
<tr><td>Business app quarantine ho gaya</td><td>False positive</td><td>Quarantine se restore; exact SHA-256 se allow-list; report karo</td></tr>
</table>

<h3>Labs par lagana</h3>
<p><b>Lab (a): "log hua par ruka nahi".</b> Step 1 pass (connector 8.4.1, registered). Step 2 turant cause dhoondh leta hai:</p>
<pre class="out">PC1&gt; secure-endpoint status
Cisco Secure Endpoint Connector 8.4.1
  Computer   : PC1
  Group      : Endpoints
<span class="hl">  Policy     : NK-Standard (audit)</span>
  Isolation  : Not isolated
  Quarantined: 0 file(s)</pre>
<p>Fix: NK-Standard ko Protect; <code>Quarantine Success</code> aur <code>Quarantined: 1 file(s)</code> se prove karo.</p>
<p><b>Lab (b): "aaj chali, kal bad".</b> Step 3: Cloud IOC disposition Unknown dikhata hai, isliye Protect mode ne sahi mein use chalne diya. Sahi action outbreak control hai, policy change nahi: Simple Custom Detection NK-Dropper, RETRO quarantine verify karo, PC1 isolate karo aur <code>ping 203.0.113.9</code> ke timeout se confirm karo.</p>
<p><b>Lab (c): "teeno par Protect mode, phir bhi har jagah chali".</b> Step 2 pass (Workstations, Protect). Step 4 cause hai:</p>
<pre class="out">2026-09-29 09:01:04  Executed malware  PC-SALES  invoice_2026.exe  <span class="hl">Allowed by allow list</span></pre>
<p>Step 6 scope karta hai: sabse pehla execution PC-SALES, parent <code>outlook.exe</code>; patient zero isolate karo, phir Allowed entry hatao aur baaki do ko contain karo.</p>
<p><b>Lab (d): email ticket.</b> Email ladder chhoti hai: (1) campaign ko sender aur verdict se dhoondho, subject se nahi; (2) har message ka verdict gino aur confirm karo; (3) bad wale remediate karo; (4) verify karo ki clean mail ko chhua nahi; (5) agar remediation fail ho, check karo ki tenant integration ke paas read/write permission hai aur message user ne pehle hi move ya delete to nahi kar diya. Result: M1, M2 aur M4 Quarantine mein; M3 ko chhua nahi; M5 (BEC) alag se escalate.</p>

<div class="eg"><p><b>Worked example: false positive sahi tarike se.</b> Vendor update ke baad finance team ka <code>ledger-sync.exe</code> 31 computers par quarantine ho jaata hai. Event SHA-256 <code>7c41…9e</code> ke liye cloud se Malicious disposition dikhata hai. Galat fix: Finance ko Audit par switch karna. Sahi fix: vendor aur Malware Analytics se confirm karo ki file benign hai, 31 computers par use quarantine se restore karo, Finance policy ki Allowed list mein wahi exact SHA-256 add karo, aur false positive Cisco ko report karo. Baaki har protection on rehti hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Protection kamzor karke ticket fix karna (Audit mode, engine disable, folder allow-list). Isse ticket band hota hai aur agla breach khulta hai. Har fix sabse narrow change hona chahiye jo specific problem solve kare.</p></div>

<div class="exam"><p><b>Exam trap.</b> Scenario questions aksar answer output ke ek shabd mein chhupaate hain: <i>audit</i>, <i>Unknown</i>, <i>Allowed</i>, <i>retro</i>. Answer options padhne se pehle event detail aur policy line padho.</p></div>

<div class="scn"><h4>Woh custom detection jisne kuch nahi kiya</h4><p>SOC analyst ne threat report se ek SHA-256 Servers group ke liye Simple Custom Detection mein add kiya, par koi retrospective events nahi aaye, jabki file do servers par thi. Ladder chalane par: Servers policy us list se alag custom-detection list use karti thi jo usne edit ki. List ko Servers policy se jodne par minutes mein dono servers par retrospective quarantine trigger hua.</p><p><b>Seekh:</b> outbreak-control lists sirf un policies ke through act karti hain jo unhe use karti hain.</p></div>

<div class="iv"><p class="q">"User kehta hai Secure Endpoint ne malware nahi roka. Kaise troubleshoot karoge?"</p><p>Strong answer: top-down chalo. Confirm karo connector installed, registered aur online hai. Computer ka group, policy aur mode padho: Audit sirf log karta hai. Event ka disposition padho: Unknown files chalti hain. File ko cover karne wali allow-list entries ya exclusions check karo. Pehchano kaunsa engine fire hua aur kya Quarantine Success hai. Phir file trajectory se scope karo aur isolation aur custom detection se contain karo. Sabse narrow change se fix karo aur kabhi protection disable karke nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ladder: connector online → group/policy/mode → disposition → allow list/exclusion → engine/event → scope aur contain.</li>
<li>Audit mode aur Allowed lists zyadatar "isne roka nahi" tickets explain karte hain.</li>
<li>Unknown files design se allowed hain; outbreak control aur retrospection unhe handle karte hain.</li>
<li>Email: sender aur verdict se filter karo, sirf bad messages remediate karo, clean mail verify karo, read/write permission check karo.</li>
<li>False positives exact SHA-256 allow entries se fix karo, kabhi Audit par switch karke nahi.</li>
</ul></div>
`}};export{e as default};