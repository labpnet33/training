var e={id:`policies-modes`,h:{en:`Policies and modes: audit vs protect (Lab a)`,hi:`Policies aur modes: audit vs protect (Lab a)`},body:{en:`
<p>A new security guard's first week is often "observe only": he notes everyone who looks suspicious but stops nobody, so the manager can check he is not about to tackle the CEO. After that week, he is allowed to stop people. Secure Endpoint policies work the same way. <b>Audit</b> is the observing week; <b>Protect</b> is the real job. Forgetting to end the observing week is the single most common endpoint failure in real tickets.</p>

<h3>What a policy contains</h3>
<ul>
<li><b>Modes</b> for each engine: what to do on a detection.</li>
<li><b>Engines</b> on or off (file, network, MAP, exploit, script and others).</li>
<li><b>Exclusions</b>: paths, file extensions, processes or threat names the connector should ignore, typically for databases, backup software and other security tools.</li>
<li><b>Outbreak control lists</b> attached to the policy: custom detections, application block and allow lists, IP lists (chapter 7).</li>
<li><b>Product updates</b>, proxy, connector UI (whether users see notifications), and the uninstall password.</li>
</ul>

<h3>Audit, Protect and the per-engine modes</h3>
<table class="cmp"><tr><th>Mode</th><th>On a Malicious verdict</th><th>When to use</th></tr>
<tr><td><b>Audit</b></td><td>Detect and log an event. The file is <b>not</b> quarantined and still runs.</td><td>Pilots, tuning exclusions, sensitive servers during baselining</td></tr>
<tr><td><b>Protect</b></td><td>Detect, block and <b>quarantine</b>. The file does not execute.</td><td>Normal production</td></tr>
</table>
<p>In the real console each engine has its own setting: file conviction can be Audit or Quarantine, network (DFC) Audit or Block, and the behavioural engines Audit or an enforcing option such as Block or Protect. Cisco's default <b>Protect</b> policy sets the enforcing options; the default <b>Audit</b> policy logs only. A third default, <b>Triage</b>, is an aggressive policy for computers you already suspect, with extra engines and stricter settings. The lab simplifies this into one mode per policy, which is exactly the decision you make most often.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Audit vs protect flow">
<rect x="20" y="85" width="140" height="50" rx="8" fill="#e2e8f0"/><text x="90" y="107" text-anchor="middle" class="svg-ink" font-size="13">run invoice_2026</text><text x="90" y="125" text-anchor="middle" class="svg-muted" font-size="12">on PC1</text>
<rect x="200" y="85" width="140" height="50" rx="8" fill="#fde68a"/><text x="270" y="107" text-anchor="middle" class="svg-ink" font-size="13">Verdict</text><text x="270" y="125" text-anchor="middle" class="svg-muted" font-size="12">Malicious</text>
<rect x="390" y="25" width="230" height="50" rx="8" fill="#fed7aa"/><text x="505" y="47" text-anchor="middle" class="svg-ink" font-size="13">Audit: Threat Detected</text><text x="505" y="65" text-anchor="middle" class="svg-muted" font-size="12">+ Executed malware, file RAN</text>
<rect x="390" y="145" width="230" height="50" rx="8" fill="#bbf7d0"/><text x="505" y="167" text-anchor="middle" class="svg-ink" font-size="13">Protect: Threat Detected</text><text x="505" y="185" text-anchor="middle" class="svg-muted" font-size="12">+ Quarantine Success, did not run</text>
<line x1="160" y1="110" x2="200" y2="110" stroke="#64748b" stroke-width="2"/><line x1="340" y1="110" x2="390" y2="50" stroke="#64748b" stroke-width="2"/><line x1="340" y1="110" x2="390" y2="170" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Same file, same verdict, two different outcomes. The mode decides.</p></div>

<h3>Lab (a) walkthrough: Protect mode stops a malware execution</h3>
<p>PC1's connector is in group <b>Endpoints</b>, which uses policy <b>NK-Standard</b>. All engines are on, but the mode is audit.</p>
<p><b>Step 1: read the connector.</b></p>
<pre class="out">PC1&gt; secure-endpoint status
Cisco Secure Endpoint Connector 8.4.1
  Computer   : PC1
  Group      : Endpoints
<span class="hl">  Policy     : NK-Standard (audit)</span>
  Isolation  : Not isolated
  Quarantined: 0 file(s)</pre>
<p>The answer to task 1 is <b>audit</b>. If you ran the sample now, you would see:</p>
<pre class="out">PC1&gt; run invoice_2026.exe
<span class="hl">Secure Endpoint (Audit): "invoice_2026.exe" was flagged as W32.Ransom.Rans:Trojan but AUDIT mode only logs — the file RAN.</span></pre>
<p><b>Step 2: change the policy mode in the console.</b></p>
<pre class="code"><span class="c">! Secure Endpoint console on SEC-CLOUD</span>
Groups &amp; Policies &gt; NK-Standard
  Mode: Protect            <span class="c">! was Audit</span>
  File protection: On      <span class="c">! keep the File engine enabled</span>
Save</pre>
<p><b>Step 3: run the sample again and verify.</b></p>
<pre class="out">PC1&gt; run invoice_2026.exe
<span class="hl">Secure Endpoint (Protect): "invoice_2026.exe" was QUARANTINED — W32.Ransom.Rans:Trojan.</span>
The file did not execute.

PC1&gt; secure-endpoint status
Cisco Secure Endpoint Connector 8.4.1
  Computer   : PC1
  Group      : Endpoints
<span class="hl">  Policy     : NK-Standard (protect)</span>
  Isolation  : Not isolated
<span class="hl">  Quarantined: 1 file(s)</span></pre>
<p><b>Step 4: read the event.</b> The Events tab now shows two events for PC1: <b>Threat Detected</b> and <b>Quarantine Success</b>. Open the Quarantine Success event:</p>
<pre class="out">Event       : Quarantine Success
Computer    : PC1
File        : invoice_2026.exe
<span class="hl">SHA-256     : a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff00</span>
<span class="hl">Disposition : Malicious</span>
<span class="hl">Threat      : W32.Ransom.Rans:Trojan</span>
Detail      : File moved to quarantine</pre>
<p><b>Step 5: confirm in Malware Analytics.</b> Paste the SHA-256 into the Malware Analytics view. It shows disposition Malicious, threat name W32.Ransom.Rans:Trojan, threat score 95 and indicators such as "Ransomware note dropped to disk" and "Shadow copies deleted (vssadmin)". Those are your answers for tasks 4 and 5.</p>

<div class="eg"><p><b>Worked example: a safe rollout plan.</b> 1,200 laptops. Week 1: deploy all connectors into an Audit group. Week 2: review events; 37 detections, of which 34 are real threats and 3 are an in-house build tool. Add an allow-list entry (by SHA-256) for the build tool. Week 3: move 100 pilot laptops to the Protect group. Week 4: move everyone else and set an alert for any computer still in an audit group. Servers follow the same process with the Server policy and the vendor-recommended exclusions.</p></div>

<div class="warn"><p><b>Common mistake.</b> Over-broad exclusions such as excluding <code>C:\\Users\\</code> or every <code>.exe</code> "to stop false positives". Malware lives in user folders. Exclude the narrowest path, process or SHA-256 that solves the problem, and document why.</p></div>

<div class="exam"><p><b>Exam trap.</b> In Audit mode you still get a <b>Threat Detected</b> event and the full trajectory. Seeing the event does not prove the file was stopped; only a <b>Quarantine Success</b> (or a Block event for other engines) does.</p></div>

<div class="scn"><h4>"It saw it but did not stop it"</h4><p>Ransomware encrypted a finance share. The console showed a Threat Detected event for <code>W32.Ransom</code> on the finance laptop five seconds before the encryption started. The engineer opened the computer and read <code>Group: Finance-Test, Policy: Finance-Test (Audit)</code>. The group had been created for a pilot and never switched. The laptop was moved to a Protect group, restored from backup, and all audit groups were reviewed.</p><p><b>Lesson:</b> when an endpoint detected but did not block, check the mode before anything else.</p></div>

<div class="iv"><p class="q">"A threat was detected on a laptop but the files were still encrypted. What do you check first?"</p><p>Strong answer: the effective policy and mode of that computer. If its group uses an Audit policy, Secure Endpoint detects and logs but does not quarantine. Then confirm which engine fired, whether there is an exclusion or allow-list entry covering the file, and whether the connector was online. Fix by moving the computer to a Protect group, not by turning engines on and off.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Audit = detect and log, file runs. Protect = detect, block and quarantine.</li>
<li>Default policies include Audit, Protect, Triage, Server and Domain Controller.</li>
<li>Roll out in Audit, tune exclusions narrowly, then move groups to Protect.</li>
<li>Lab (a): NK-Standard audit → protect, <code>run invoice_2026.exe</code>, Quarantine Success, SHA a1b2…ff00, W32.Ransom.Rans:Trojan.</li>
<li>Threat Detected alone does not mean stopped; look for Quarantine Success.</li>
</ul></div>
`,hi:`
<p>Naye security guard ka pehla hafta aksar "sirf observe" hota hai: woh har suspicious dikhne wale ko note karta hai par kisi ko rokta nahi, taaki manager check kar sake ki woh CEO ko hi na pakad le. Us hafte ke baad use logon ko rokne ki ijaazat milti hai. Secure Endpoint policies bhi aise hi kaam karti hain. <b>Audit</b> observe wala hafta hai; <b>Protect</b> asli kaam hai. Observe wala hafta khatam karna bhool jaana real tickets mein sabse common endpoint failure hai.</p>

<h3>Policy mein kya hota hai</h3>
<ul>
<li>Har engine ke liye <b>modes</b>: detection par kya karna hai.</li>
<li><b>Engines</b> on ya off (file, network, MAP, exploit, script aur doosre).</li>
<li><b>Exclusions</b>: paths, file extensions, processes ya threat names jinhe connector ignore kare, aam taur par databases, backup software aur doosre security tools ke liye.</li>
<li>Policy se jude <b>outbreak control lists</b>: custom detections, application block aur allow lists, IP lists (chapter 7).</li>
<li><b>Product updates</b>, proxy, connector UI (users ko notifications dikhein ya nahi), aur uninstall password.</li>
</ul>

<h3>Audit, Protect aur per-engine modes</h3>
<table class="cmp"><tr><th>Mode</th><th>Malicious verdict par</th><th>Kab use karein</th></tr>
<tr><td><b>Audit</b></td><td>Detect karke event log. File quarantine <b>nahi</b> hoti aur chalti hai.</td><td>Pilots, exclusions tune karna, baselining ke dauraan sensitive servers</td></tr>
<tr><td><b>Protect</b></td><td>Detect, block aur <b>quarantine</b>. File execute nahi hoti.</td><td>Normal production</td></tr>
</table>
<p>Real console mein har engine ki apni setting hoti hai: file conviction Audit ya Quarantine ho sakta hai, network (DFC) Audit ya Block, aur behavioural engines Audit ya Block ya Protect jaisa enforcing option. Cisco ki default <b>Protect</b> policy enforcing options set karti hai; default <b>Audit</b> policy sirf log karti hai. Teesri default, <b>Triage</b>, un computers ke liye aggressive policy hai jin par aapko pehle se shak hai, extra engines aur stricter settings ke saath. Lab ise har policy ke ek mode mein simplify karta hai, jo bilkul wahi decision hai jo aap sabse zyada lete ho.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Audit vs protect flow">
<rect x="20" y="85" width="140" height="50" rx="8" fill="#e2e8f0"/><text x="90" y="107" text-anchor="middle" class="svg-ink" font-size="13">run invoice_2026</text><text x="90" y="125" text-anchor="middle" class="svg-muted" font-size="12">PC1 par</text>
<rect x="200" y="85" width="140" height="50" rx="8" fill="#fde68a"/><text x="270" y="107" text-anchor="middle" class="svg-ink" font-size="13">Verdict</text><text x="270" y="125" text-anchor="middle" class="svg-muted" font-size="12">Malicious</text>
<rect x="390" y="25" width="230" height="50" rx="8" fill="#fed7aa"/><text x="505" y="47" text-anchor="middle" class="svg-ink" font-size="13">Audit: Threat Detected</text><text x="505" y="65" text-anchor="middle" class="svg-muted" font-size="12">+ Executed malware, file CHALI</text>
<rect x="390" y="145" width="230" height="50" rx="8" fill="#bbf7d0"/><text x="505" y="167" text-anchor="middle" class="svg-ink" font-size="13">Protect: Threat Detected</text><text x="505" y="185" text-anchor="middle" class="svg-muted" font-size="12">+ Quarantine Success, nahi chali</text>
<line x1="160" y1="110" x2="200" y2="110" stroke="#64748b" stroke-width="2"/><line x1="340" y1="110" x2="390" y2="50" stroke="#64748b" stroke-width="2"/><line x1="340" y1="110" x2="390" y2="170" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Same file, same verdict, do alag nateeje. Mode tay karta hai.</p></div>

<h3>Lab (a) walkthrough: Protect mode malware execution rokta hai</h3>
<p>PC1 ka connector group <b>Endpoints</b> mein hai, jo policy <b>NK-Standard</b> use karta hai. Saare engines on hain, par mode audit hai.</p>
<p><b>Step 1: connector padho.</b></p>
<pre class="out">PC1&gt; secure-endpoint status
Cisco Secure Endpoint Connector 8.4.1
  Computer   : PC1
  Group      : Endpoints
<span class="hl">  Policy     : NK-Standard (audit)</span>
  Isolation  : Not isolated
  Quarantined: 0 file(s)</pre>
<p>Task 1 ka answer <b>audit</b> hai. Agar aap abhi sample chalaate, to yeh dikhta:</p>
<pre class="out">PC1&gt; run invoice_2026.exe
<span class="hl">Secure Endpoint (Audit): "invoice_2026.exe" was flagged as W32.Ransom.Rans:Trojan but AUDIT mode only logs — the file RAN.</span></pre>
<p><b>Step 2: console mein policy mode badlo.</b></p>
<pre class="code"><span class="c">! SEC-CLOUD par Secure Endpoint console</span>
Groups &amp; Policies &gt; NK-Standard
  Mode: Protect            <span class="c">! pehle Audit tha</span>
  File protection: On      <span class="c">! File engine enabled rakho</span>
Save</pre>
<p><b>Step 3: sample dobara chalao aur verify karo.</b></p>
<pre class="out">PC1&gt; run invoice_2026.exe
<span class="hl">Secure Endpoint (Protect): "invoice_2026.exe" was QUARANTINED — W32.Ransom.Rans:Trojan.</span>
The file did not execute.

PC1&gt; secure-endpoint status
Cisco Secure Endpoint Connector 8.4.1
  Computer   : PC1
  Group      : Endpoints
<span class="hl">  Policy     : NK-Standard (protect)</span>
  Isolation  : Not isolated
<span class="hl">  Quarantined: 1 file(s)</span></pre>
<p><b>Step 4: event padho.</b> Events tab ab PC1 ke liye do events dikhata hai: <b>Threat Detected</b> aur <b>Quarantine Success</b>. Quarantine Success event kholo:</p>
<pre class="out">Event       : Quarantine Success
Computer    : PC1
File        : invoice_2026.exe
<span class="hl">SHA-256     : a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff00</span>
<span class="hl">Disposition : Malicious</span>
<span class="hl">Threat      : W32.Ransom.Rans:Trojan</span>
Detail      : File moved to quarantine</pre>
<p><b>Step 5: Malware Analytics mein confirm karo.</b> SHA-256 ko Malware Analytics view mein paste karo. Yeh disposition Malicious, threat name W32.Ransom.Rans:Trojan, threat score 95 aur "Ransomware note dropped to disk" aur "Shadow copies deleted (vssadmin)" jaise indicators dikhata hai. Yahi tasks 4 aur 5 ke answers hain.</p>

<div class="eg"><p><b>Worked example: ek safe rollout plan.</b> 1,200 laptops. Week 1: saare connectors Audit group mein deploy karo. Week 2: events review karo; 37 detections, jinmein 34 asli threats aur 3 ek in-house build tool. Build tool ke liye (SHA-256 se) allow-list entry add karo. Week 3: 100 pilot laptops ko Protect group mein move karo. Week 4: baaki sabko move karo aur kisi bhi audit group mein bache computer ke liye alert set karo. Servers Server policy aur vendor-recommended exclusions ke saath same process follow karte hain.</p></div>

<div class="warn"><p><b>Common galti.</b> "False positives rokne ke liye" <code>C:\\Users\\</code> ya har <code>.exe</code> ko exclude karne jaise over-broad exclusions. Malware user folders mein hi rehta hai. Sabse narrow path, process ya SHA-256 exclude karo jo problem solve kare, aur wajah document karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Audit mode mein bhi aapko <b>Threat Detected</b> event aur poori trajectory milti hai. Event dikhna yeh prove nahi karta ki file ruki; sirf <b>Quarantine Success</b> (ya doosre engines ke liye Block event) prove karta hai.</p></div>

<div class="scn"><h4>"Dekha par roka nahi"</h4><p>Ransomware ne ek finance share encrypt kar diya. Console ne encryption shuru hone se paanch second pehle finance laptop par <code>W32.Ransom</code> ka Threat Detected event dikhaya. Engineer ne computer khola aur padha <code>Group: Finance-Test, Policy: Finance-Test (Audit)</code>. Group ek pilot ke liye bana tha aur kabhi switch nahi hua. Laptop ko Protect group mein move kiya gaya, backup se restore hua, aur saare audit groups review hue.</p><p><b>Seekh:</b> jab endpoint ne detect kiya par block nahi kiya, sabse pehle mode check karo.</p></div>

<div class="iv"><p class="q">"Laptop par threat detect hua par files phir bhi encrypt ho gayin. Pehle kya check karoge?"</p><p>Strong answer: us computer ki effective policy aur mode. Agar uska group Audit policy use karta hai, to Secure Endpoint detect aur log karta hai par quarantine nahi. Phir confirm karo ki kaunsa engine fire hua, kya koi exclusion ya allow-list entry file ko cover karti hai, aur connector online tha ya nahi. Fix computer ko Protect group mein move karke karo, engines on-off karke nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Audit = detect aur log, file chalti hai. Protect = detect, block aur quarantine.</li>
<li>Default policies mein Audit, Protect, Triage, Server aur Domain Controller hain.</li>
<li>Audit mein roll out karo, exclusions narrow tune karo, phir groups ko Protect par le jao.</li>
<li>Lab (a): NK-Standard audit → protect, <code>run invoice_2026.exe</code>, Quarantine Success, SHA a1b2…ff00, W32.Ransom.Rans:Trojan.</li>
<li>Sirf Threat Detected ka matlab ruka hua nahi; Quarantine Success dhoondho.</li>
</ul></div>
`}};export{e as default};