var e={id:`outbreak-retrospection`,h:{en:`Outbreak control, Malware Analytics and retrospection (Lab b)`,hi:`Outbreak control, Malware Analytics aur retrospection (Lab b)`},body:{en:`
<p>Imagine a food-safety agency. On Monday a batch of tinned soup passes inspection and is sold in 40 shops. On Wednesday a lab test shows the batch is contaminated. A good agency does not wait for the next shipment; it uses the batch number to find every shop and every home that bought it and recalls it. <b>Outbreak control</b> is your power to declare a batch bad yourself, and <b>retrospection</b> is the recall of everything already sold.</p>

<h3>Outbreak control lists</h3>
<table class="cmp"><tr><th>List</th><th>Matches on</th><th>Effect</th></tr>
<tr><td><b>Simple Custom Detection</b></td><td>SHA-256 hashes</td><td>Treat the file as malicious on every connector whose policy uses the list: quarantine in Protect mode, and trigger retrospection</td></tr>
<tr><td><b>Advanced Custom Detection</b></td><td>ClamAV-style signatures (byte patterns, logical signatures)</td><td>Catch a family of variants, not just one hash</td></tr>
<tr><td><b>Application Control: Blocked</b></td><td>SHA-256 of an application</td><td>Prevent that executable from running, even if it is not malware (for example an unauthorised remote-access tool)</td></tr>
<tr><td><b>Application Control: Allowed</b></td><td>SHA-256 or path</td><td>Trust the file and skip conviction, used to fix false positives on your own tools</td></tr>
<tr><td><b>Network: IP Block / Allow lists</b></td><td>IP addresses or CIDR ranges, optionally ports</td><td>DFC blocks (or always allows) connections from endpoints to these destinations</td></tr>
</table>
<p>Lists are created once and attached to policies, so one list can protect many groups. Changes reach connectors at their next policy update, typically within minutes.</p>

<h3>Secure Malware Analytics: getting a verdict for the unknown</h3>
<p>When a file is <b>Unknown</b>, it runs, and you need a deeper verdict. <b>Secure Malware Analytics</b> (formerly Threat Grid) detonates the file in an instrumented sandbox and reports a <b>threat score</b> (0 to 100) and <b>behavioural indicators</b> such as "writes to Run registry key (persistence)", "injects into a signed process" or "contacts a low-reputation host". Files can be submitted manually, or automatically through the policy's low-prevalence executable feature: executables seen on very few computers in your organisation are sent for analysis. In the lab this produces a <b>Cloud IOC</b> event with the detail "Low-prevalence executable submitted to Secure Malware Analytics".</p>

<h3>Retrospection, step by step</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Retrospection timeline">
<line x1="40" y1="60" x2="600" y2="60" stroke="#64748b" stroke-width="2"/>
<circle cx="90" cy="60" r="7" fill="#fde68a"/><text x="90" y="40" text-anchor="middle" class="svg-ink" font-size="12">Day 1</text>
<text x="90" y="88" text-anchor="middle" class="svg-ink" font-size="12">setup_tool.exe runs</text><text x="90" y="104" text-anchor="middle" class="svg-muted" font-size="12">Unknown, Cloud IOC</text>
<circle cx="320" cy="60" r="7" fill="#fed7aa"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="12">Day 2</text>
<text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="12">Intel: it is a dropper</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">add SHA as NK-Dropper</text>
<circle cx="550" cy="60" r="7" fill="#bbf7d0"/><text x="550" y="40" text-anchor="middle" class="svg-ink" font-size="12">Minutes later</text>
<text x="550" y="88" text-anchor="middle" class="svg-ink" font-size="12">RETRO quarantine</text><text x="550" y="104" text-anchor="middle" class="svg-muted" font-size="12">every host that has it</text>
<rect x="140" y="150" width="360" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">The cloud remembers every SHA each connector saw</text><text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">that memory is what makes the recall possible</text>
</svg><p class="cap">Retrospection: a verdict that changes later still reaches files already on disk.</p></div>
<p>The connector records the SHA-256 of every file it sees, including Clean and Unknown ones. When a hash's disposition changes to Malicious, either because global intelligence caught up or because you added a Simple Custom Detection, the cloud looks up every computer that has seen that hash and tells those connectors to quarantine it. The console shows a <b>retrospective</b> event. This is only possible because of cloud-side memory, and it is one of the clearest differences between an EDR and a classic AV.</p>

<h3>Lab (b) walkthrough, tasks 1 to 3</h3>
<p>PC1 is in group Workstations, which uses the Protect policy. <b>Task 1:</b> run the tool and read the event.</p>
<pre class="out">PC1&gt; run setup_tool.exe
<span class="hl">Secure Endpoint: "setup_tool.exe" has an UNKNOWN disposition — submitted to Secure Malware Analytics (threat score 41).</span>
The file ran.</pre>
<p>Even in Protect mode it ran, because Unknown is not Malicious. The Events tab shows a <b>Cloud IOC</b> event for PC1 with <code>SHA-256: deadbeef00cafe11feed22face33beef44dead55beef66cafe77feed88face99</code>. That is your answer.</p>
<p><b>Task 2:</b> threat intelligence confirms it is a dropper. Add the hash.</p>
<pre class="code"><span class="c">! Secure Endpoint console on SEC-CLOUD</span>
Outbreak Control &gt; Custom Detections - Simple &gt; Add
  SHA-256 : deadbeef00cafe11feed22face33beef44dead55beef66cafe77feed88face99
  Name    : NK-Dropper
Save   <span class="c">! the list is applied by the policies that use it</span></pre>
<p><b>Task 3:</b> you do not run the file again. Retrospection does the work:</p>
<pre class="out">Event       : Quarantine Success   <span class="hl">[RETRO]</span>
Computer    : PC1
File        : setup_tool.exe
SHA-256     : deadbeef00cafe11feed22face33beef44dead55beef66cafe77feed88face99
Disposition : Malicious
Threat      : NK-Dropper
<span class="hl">Detail      : Retrospective detection (custom detection NK-Dropper)</span></pre>
<p><code>secure-endpoint status</code> on PC1 now shows <code>Quarantined: 1 file(s)</code>. Task 4, isolation, is in the next chapter.</p>

<div class="eg"><p><b>Worked example.</b> A partner CERT shares three IOCs: SHA-256 <code>9f3a…c1</code> (a loader), IP 198.51.100.77 (its C2) and a domain. You add the hash to a Simple Custom Detection and the IP to an IP Block list attached to the Workstations and Servers policies. Within minutes, 6 of your 900 computers show retrospective quarantine events for the loader (they had seen it last week), and 2 show DFC block events when the loader's leftover scheduled task tried to call 198.51.100.77. You now know exactly which 6 machines need investigation.</p></div>

<div class="warn"><p><b>Common mistake.</b> Putting a broadly used file (or a whole folder) on the <b>Allowed</b> list to silence a false positive. Allowed beats convicted: if that file is later trojanised, it will run everywhere. Lab (c) is built on exactly this mistake.</p></div>

<div class="exam"><p><b>Exam trap.</b> A Simple Custom Detection matches only the exact SHA-256: change one byte and it no longer matches. For variants you need Advanced Custom Detections (signatures) or the cloud engines. Also, retrospective quarantine only happens on computers whose policy is in an enforcing mode; audit-mode computers get the event but keep the file.</p></div>

<div class="scn"><h4>Two days late, still in time</h4><p>An IT admin tool downloaded by 40 engineers turned out to be trojanised; the vendor's update server had been compromised. When it ran it was Unknown with low prevalence. Two days later a partner flagged its hash. The SOC added a Simple Custom Detection, and within ten minutes 38 machines reported retrospective quarantine. The other 2 were in an Audit group, so they showed the event but kept the file; they were moved to Protect and isolated for review.</p><p><b>Lesson:</b> retrospection turns late intelligence into immediate action, but only where the policy enforces.</p></div>

<div class="iv"><p class="q">"What is retrospective security and why is it valuable?"</p><p>Strong answer: the endpoint and the cloud keep a record of every file seen. When a file's verdict changes later, from Unknown or Clean to Malicious, the system goes back and acts on every copy already present, quarantining it and raising retrospective events. It closes the gap between when malware arrives and when the world learns it is malware. Mention that file trajectory then shows exactly where the file went.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Outbreak control: Simple (SHA-256) and Advanced (signature) custom detections, app block and allow lists, IP block and allow lists.</li>
<li>Unknown files run; Secure Malware Analytics gives a threat score and behavioural indicators.</li>
<li>Retrospection quarantines files already on disk when their verdict turns Malicious.</li>
<li>Lab (b): <code>setup_tool.exe</code> Unknown → Simple Custom Detection NK-Dropper → RETRO Quarantine Success.</li>
<li>Allowed lists override convictions; keep them narrow and exact.</li>
</ul></div>
`,hi:`
<p>Ek food-safety agency socho. Monday ko tinned soup ka ek batch inspection pass karke 40 dukaanon mein bik jaata hai. Wednesday ko lab test dikhata hai ki batch contaminated hai. Acchi agency agli shipment ka wait nahi karti; woh batch number se har dukaan aur har ghar dhoondhti hai jisne use khareeda aur recall karti hai. <b>Outbreak control</b> aapki taaqat hai khud kisi batch ko bad declare karne ki, aur <b>retrospection</b> pehle se bik chuki har cheez ka recall hai.</p>

<h3>Outbreak control lists</h3>
<table class="cmp"><tr><th>List</th><th>Kis par match</th><th>Effect</th></tr>
<tr><td><b>Simple Custom Detection</b></td><td>SHA-256 hashes</td><td>Har us connector par file ko malicious maano jiski policy list use karti hai: Protect mode mein quarantine, aur retrospection trigger</td></tr>
<tr><td><b>Advanced Custom Detection</b></td><td>ClamAV-style signatures (byte patterns, logical signatures)</td><td>Sirf ek hash nahi, variants ki family pakdo</td></tr>
<tr><td><b>Application Control: Blocked</b></td><td>Application ka SHA-256</td><td>Us executable ko chalne se roko, chahe woh malware na ho (jaise unauthorised remote-access tool)</td></tr>
<tr><td><b>Application Control: Allowed</b></td><td>SHA-256 ya path</td><td>File par trust karo aur conviction skip karo, apne tools par false positives fix karne ke liye</td></tr>
<tr><td><b>Network: IP Block / Allow lists</b></td><td>IP addresses ya CIDR ranges, optionally ports</td><td>DFC endpoints se in destinations ke connections block (ya hamesha allow) karta hai</td></tr>
</table>
<p>Lists ek baar banti hain aur policies se judti hain, isliye ek list kai groups ko protect kar sakti hai. Changes connectors tak unke agle policy update par pahunchte hain, aam taur par minutes mein.</p>

<h3>Secure Malware Analytics: unknown ke liye verdict lena</h3>
<p>Jab file <b>Unknown</b> hoti hai, woh chalti hai, aur aapko gehra verdict chahiye. <b>Secure Malware Analytics</b> (pehle Threat Grid) file ko instrumented sandbox mein detonate karta hai aur <b>threat score</b> (0 se 100) aur <b>behavioural indicators</b> report karta hai, jaise "writes to Run registry key (persistence)", "injects into a signed process" ya "contacts a low-reputation host". Files manually submit ho sakti hain, ya policy ke low-prevalence executable feature se automatically: jo executables aapki organisation mein bahut kam computers par dikhe, woh analysis ke liye bheje jaate hain. Lab mein isse ek <b>Cloud IOC</b> event banta hai jiski detail hai "Low-prevalence executable submitted to Secure Malware Analytics".</p>

<h3>Retrospection, step by step</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Retrospection timeline">
<line x1="40" y1="60" x2="600" y2="60" stroke="#64748b" stroke-width="2"/>
<circle cx="90" cy="60" r="7" fill="#fde68a"/><text x="90" y="40" text-anchor="middle" class="svg-ink" font-size="12">Day 1</text>
<text x="90" y="88" text-anchor="middle" class="svg-ink" font-size="12">setup_tool.exe chalti</text><text x="90" y="104" text-anchor="middle" class="svg-muted" font-size="12">Unknown, Cloud IOC</text>
<circle cx="320" cy="60" r="7" fill="#fed7aa"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="12">Day 2</text>
<text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="12">Intel: yeh dropper hai</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">SHA ko NK-Dropper add</text>
<circle cx="550" cy="60" r="7" fill="#bbf7d0"/><text x="550" y="40" text-anchor="middle" class="svg-ink" font-size="12">Minutes baad</text>
<text x="550" y="88" text-anchor="middle" class="svg-ink" font-size="12">RETRO quarantine</text><text x="550" y="104" text-anchor="middle" class="svg-muted" font-size="12">har host jahan maujood</text>
<rect x="140" y="150" width="360" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">Cloud har connector ka dekha har SHA yaad rakhta hai</text><text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">yahi memory recall ko possible banati hai</text>
</svg><p class="cap">Retrospection: baad mein badla verdict bhi disk par pehle se padi files tak pahunchta hai.</p></div>
<p>Connector har dekhi file ka SHA-256 record karta hai, Clean aur Unknown wali bhi. Jab kisi hash ka disposition Malicious ho jaata hai, chahe global intelligence ne pakda ho ya aapne Simple Custom Detection add ki ho, cloud har us computer ko dhoondhta hai jisne woh hash dekha aur un connectors ko use quarantine karne ko kehta hai. Console ek <b>retrospective</b> event dikhata hai. Yeh sirf cloud-side memory ki wajah se possible hai, aur yeh EDR aur classic AV ke beech sabse saaf farak mein se ek hai.</p>

<h3>Lab (b) walkthrough, tasks 1 se 3</h3>
<p>PC1 group Workstations mein hai, jo Protect policy use karta hai. <b>Task 1:</b> tool chalao aur event padho.</p>
<pre class="out">PC1&gt; run setup_tool.exe
<span class="hl">Secure Endpoint: "setup_tool.exe" has an UNKNOWN disposition — submitted to Secure Malware Analytics (threat score 41).</span>
The file ran.</pre>
<p>Protect mode mein bhi yeh chali, kyunki Unknown Malicious nahi hai. Events tab PC1 ke liye <b>Cloud IOC</b> event dikhata hai jismein <code>SHA-256: deadbeef00cafe11feed22face33beef44dead55beef66cafe77feed88face99</code> hai. Yahi aapka answer hai.</p>
<p><b>Task 2:</b> threat intelligence confirm karti hai ki yeh dropper hai. Hash add karo.</p>
<pre class="code"><span class="c">! SEC-CLOUD par Secure Endpoint console</span>
Outbreak Control &gt; Custom Detections - Simple &gt; Add
  SHA-256 : deadbeef00cafe11feed22face33beef44dead55beef66cafe77feed88face99
  Name    : NK-Dropper
Save   <span class="c">! list un policies se apply hoti hai jo use use karti hain</span></pre>
<p><b>Task 3:</b> aap file dobara nahi chalaate. Kaam retrospection karta hai:</p>
<pre class="out">Event       : Quarantine Success   <span class="hl">[RETRO]</span>
Computer    : PC1
File        : setup_tool.exe
SHA-256     : deadbeef00cafe11feed22face33beef44dead55beef66cafe77feed88face99
Disposition : Malicious
Threat      : NK-Dropper
<span class="hl">Detail      : Retrospective detection (custom detection NK-Dropper)</span></pre>
<p>PC1 par <code>secure-endpoint status</code> ab <code>Quarantined: 1 file(s)</code> dikhata hai. Task 4, isolation, agle chapter mein hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek partner CERT teen IOCs share karta hai: SHA-256 <code>9f3a…c1</code> (ek loader), IP 198.51.100.77 (uska C2) aur ek domain. Aap hash ko Simple Custom Detection mein aur IP ko Workstations aur Servers policies se jude IP Block list mein add karte ho. Minutes mein aapke 900 mein se 6 computers loader ke liye retrospective quarantine events dikhate hain (unhone ise pichle hafte dekha tha), aur 2 DFC block events dikhate hain jab loader ke bache hue scheduled task ne 198.51.100.77 ko call karne ki koshish ki. Ab aap bilkul jaante ho ki kin 6 machines ki investigation chahiye.</p></div>

<div class="warn"><p><b>Common galti.</b> False positive chup karane ke liye broadly use hone wali file (ya poora folder) <b>Allowed</b> list par daal dena. Allowed conviction ko hara deta hai: agar woh file baad mein trojanised ho, to har jagah chalegi. Lab (c) bilkul isi galti par bana hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Simple Custom Detection sirf exact SHA-256 match karti hai: ek byte badlo aur match khatam. Variants ke liye Advanced Custom Detections (signatures) ya cloud engines chahiye. Aur retrospective quarantine sirf un computers par hota hai jinki policy enforcing mode mein hai; audit-mode computers ko event milta hai par file rehti hai.</p></div>

<div class="scn"><h4>Do din late, phir bhi time par</h4><p>40 engineers ka download kiya ek IT admin tool trojanised nikla; vendor ka update server compromise hua tha. Chalte waqt woh low prevalence ke saath Unknown tha. Do din baad ek partner ne uska hash flag kiya. SOC ne Simple Custom Detection add ki, aur das minute mein 38 machines ne retrospective quarantine report kiya. Baaki 2 Audit group mein thi, isliye unhone event dikhaya par file rakhi; unhe Protect mein move kiya gaya aur review ke liye isolate kiya gaya.</p><p><b>Seekh:</b> retrospection late intelligence ko turant action mein badalta hai, par sirf wahan jahan policy enforce karti hai.</p></div>

<div class="iv"><p class="q">"Retrospective security kya hai aur yeh valuable kyun hai?"</p><p>Strong answer: endpoint aur cloud har dekhi file ka record rakhte hain. Jab kisi file ka verdict baad mein badalta hai, Unknown ya Clean se Malicious, to system peeche jaakar pehle se maujood har copy par act karta hai, use quarantine karta hai aur retrospective events uthata hai. Yeh malware aane aur duniya ko pata chalne ke beech ka gap band karta hai. Mention karo ki file trajectory phir bilkul dikhati hai ki file kahan kahan gayi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Outbreak control: Simple (SHA-256) aur Advanced (signature) custom detections, app block aur allow lists, IP block aur allow lists.</li>
<li>Unknown files chalti hain; Secure Malware Analytics threat score aur behavioural indicators deta hai.</li>
<li>Retrospection disk par pehle se padi files ko quarantine karta hai jab unka verdict Malicious ho jaata hai.</li>
<li>Lab (b): <code>setup_tool.exe</code> Unknown → Simple Custom Detection NK-Dropper → RETRO Quarantine Success.</li>
<li>Allowed lists convictions ko override karti hain; unhe narrow aur exact rakho.</li>
</ul></div>
`}};export{e as default};