var e={id:`empty-or-wrong-report`,h:{en:`Why a report is empty or wrong`,hi:`Report khaali ya galat kyun aati hai`},body:{en:`
<p>When a taxi meter shows zero after a long ride, you do not blame the road. You ask: was the meter switched on, was it the right taxi, was the trip recorded? A report that shows zero sessions for a branch that works all day has the same few causes, and they sit in a fixed order. If you check them in that order, you find the fault in a few minutes instead of guessing.</p>

<h3>The rule behind every empty report</h3>
<p>A report counts the stored analytics logs of one ADOM and, optionally, one device. So a report is empty or wrong for exactly one of these reasons: you asked the wrong place, the logs were never stored, the logs were stored and later moved, or the logs were rejected. Each reason has a command that proves it.</p>

<h3>The order of checks</h3>
<ol>
<li><b>Right ADOM and device name?</b> Run <code>diagnose dvm device list</code> and read the ADOM column. A device lives in exactly one ADOM, and a report run in another ADOM shows nothing for it.</li>
<li><b>Is the device registered?</b> Run <code>execute fazui unregistered list</code>. A connected FortiGate that is not in the device table has its logs discarded and counted, never stored.</li>
<li><b>Did the device send logs?</b> Run <code>diagnose log device</code>. The traffic, UTM and event counters per device show whether anything arrived since registration. Zero here with a registered device means no traffic, or logging is off on the FortiGate side (module faz-adom).</li>
<li><b>Are the logs still searchable?</b> Run <code>execute fazui storage &lt;adom&gt;</code>. If the logs moved to the archive, they are no longer in reports.</li>
<li><b>Did the quota drop them?</b> The same storage output shows Overwritten and Rejected counters.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Order of checks for an empty report">
<rect x="20" y="20" width="110" height="52" rx="8" fill="#bae6fd"/><text x="75" y="42" text-anchor="middle" class="svg-ink" font-size="12">1 ADOM and</text><text x="75" y="58" text-anchor="middle" class="svg-ink" font-size="12">device name</text>
<rect x="150" y="20" width="110" height="52" rx="8" fill="#bae6fd"/><text x="205" y="42" text-anchor="middle" class="svg-ink" font-size="12">2 registered?</text><text x="205" y="58" text-anchor="middle" class="svg-muted" font-size="12">unregistered list</text>
<rect x="280" y="20" width="110" height="52" rx="8" fill="#bae6fd"/><text x="335" y="42" text-anchor="middle" class="svg-ink" font-size="12">3 logs sent?</text><text x="335" y="58" text-anchor="middle" class="svg-muted" font-size="12">log device</text>
<rect x="410" y="20" width="100" height="52" rx="8" fill="#fde68a"/><text x="460" y="42" text-anchor="middle" class="svg-ink" font-size="12">4 archive?</text><text x="460" y="58" text-anchor="middle" class="svg-muted" font-size="12">storage</text>
<rect x="530" y="20" width="90" height="52" rx="8" fill="#fde68a"/><text x="575" y="42" text-anchor="middle" class="svg-ink" font-size="12">5 quota?</text><text x="575" y="58" text-anchor="middle" class="svg-muted" font-size="12">storage</text>
<line x1="130" y1="46" x2="150" y2="46" stroke="#64748b" stroke-width="2"/><line x1="260" y1="46" x2="280" y2="46" stroke="#64748b" stroke-width="2"/><line x1="390" y1="46" x2="410" y2="46" stroke="#64748b" stroke-width="2"/><line x1="510" y1="46" x2="530" y2="46" stroke="#64748b" stroke-width="2"/>
<text x="20" y="120" class="svg-ink" font-size="13">Checks 1 to 3: the logs never reached the report.</text>
<text x="20" y="146" class="svg-ink" font-size="13">Checks 4 and 5: the logs were stored, then moved or refused.</text>
<text x="20" y="180" class="svg-accent" font-size="12">Stop at the first check that explains the empty page, fix it, then run the report again.</text>
</svg><p class="cap">Cheapest and most common causes first.</p></div>

<h3>Real output, check by check</h3>
<p>The Madurai report was run in the ADOM Corporate and came back empty. The basis line is the clue.</p>
<pre class="out">FAZ-1 # execute fazui report run Corporate MDU-FGT "Traffic Report"
Report: Traffic Report   ADOM: Corporate   Device: MDU-FGT
<span class="hl">Based on 0 stored analytics logs (0 traffic, 0 utm, 0 event).</span>
Sessions: 0   Bytes: 0   Blocked: 0
FAZ-1 # diagnose dvm device list
faz-log  678  FGVMEV1RGF38I000 ... HQ-FGT   <span class="hl">Corporate</span>
faz-log  171  FGVMEV1JOS6TJ000 ... MDU-FGT  <span class="hl">Retail</span></pre>
<p>MDU-FGT lives in Retail. The Trichy report is empty in every ADOM for another reason:</p>
<pre class="out">FAZ-1 # execute fazui unregistered list
NAME            SERIAL              IP              LOGS DISCARDED  LAST LOG SEEN
<span class="hl">TRY-FGT</span>         FGVMEV3X688U0000    192.0.2.13      0               -
FAZ-1 # diagnose log device
TRY-FGT         FGVMEV3X688U0000    <span class="hl">(unreg)</span>   0        0      0      discarded -</pre>

<div class="eg"><p><b>Worked example.</b> Two weeks later a report for Retail is thinner than expected. The storage output shows the cause: the quota is full, the policy is drop, and new logs were rejected.</p></div>
<pre class="out">FAZ-1 # execute fazui storage root
  Disk quota          : 1 MB
  When the quota is full: drop the new logs
  Logs stored         : analytics 4 (traffic 4, utm 0, event 0), archive 0
  Received so far     : 24
  Overwritten (quota) : 17   <span class="hl">Rejected (quota): 3</span></pre>
<p>With <code>overwrite</code> the oldest logs disappear instead, and the Overwritten counter grows. And after retention, logs move to the archive:</p>
<pre class="out">  Used                : 244.14 KB (0.024 percent)   analytics 0 B, <span class="hl">archive 244.14 KB</span>
  Logs stored         : analytics 0 (traffic 0, utm 0, event 0), archive 4</pre>

<div class="warn"><p><b>Common mistakes.</b> Registering the device and expecting the old sessions to appear: logs received before registration are lost. Generating no new traffic after the fix and running the report at once. Checking the quota before the registration. Forgetting that the dash form of the command covers only the one ADOM you named.</p></div>

<div class="exam"><p><b>Exam traps.</b> Archive logs are not searchable and are not in reports. A device can be in only one ADOM. Unregistered logs are discarded, not queued. Both quota policies lose logs: overwrite loses the oldest, drop loses the newest.</p></div>

<div class="scn"><h4>Two empty reports, two causes</h4><p>Monday's report for Madurai and Trichy came back with zero sessions. The engineer did not guess. The device list showed Madurai in Retail, so the report was simply run in Corporate. The unregistered list showed Trichy, whose logs had been thrown away since the day it was connected. After registering Trichy in Retail and generating fresh web sessions, both reports showed sessions.</p><p><b>Lesson:</b> two symptoms that look identical can have different causes; walk the checks, do not stop at the first fix if the other report is still empty.</p></div>

<div class="iv"><p class="q">"A branch report shows zero sessions. How do you troubleshoot?"</p><p>Confirm the ADOM and device name, then registration, then whether logs arrived, then the archive and quota in the storage output. Say that you would generate fresh traffic after any fix, because nothing is back-filled.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An empty report means no stored analytics logs in that scope.</li>
<li>Check order: ADOM and name, registration, logs received, archive, quota.</li>
<li>The basis line "Based on 0 stored analytics logs" is the first clue.</li>
<li>Logs from before registration are gone; generate new traffic after the fix.</li>
<li>Archived or quota-dropped logs never reach a report.</li>
</ul></div>
`,hi:`
<p>Lamba safar karne ke baad taxi meter zero dikhaye, to aap sadak ko doshi nahi thehrate. Aap poochte ho: meter on tha, taxi sahi thi, trip record hui? Jis branch ka network din bhar chalta hai, uski report zero sessions dikhaye, to uske bhi kuch hi karan hote hain, aur wo ek tay order mein hote hain. Agar aap unhe usi order mein check karte ho, to fault kuch minute mein mil jata hai, andaza lagane mein nahi.</p>

<h3>Har empty report ke peeche ka rule</h3>
<p>Report ek ADOM ke, aur optionally ek device ke, stored analytics logs ginti hai. Isliye report khaali ya galat sirf in karanon mein se kisi ek se hoti hai: aapne galat jagah pooch li, logs kabhi store hi nahi hue, logs store hue aur baad mein hata diye gaye, ya logs reject ho gaye. Har karan ko prove karne wala ek command hai.</p>

<h3>Checks ka order</h3>
<ol>
<li><b>Sahi ADOM aur device name?</b> <code>diagnose dvm device list</code> chalao aur ADOM column padho. Device sirf ek ADOM mein rehta hai, aur doosri ADOM mein chalayi report uske liye kuch nahi dikhati.</li>
<li><b>Device registered hai?</b> <code>execute fazui unregistered list</code> chalao. Connected FortiGate jo device table mein nahi hai, uske logs discard ho jate hain aur count hote hain, store kabhi nahi.</li>
<li><b>Device ne logs bheje?</b> <code>diagnose log device</code> chalao. Har device ke traffic, UTM aur event counters batate hain ki registration ke baad kuch aaya ya nahi. Registered device ke saath yahan zero ka matlab: traffic nahi, ya FortiGate side par logging off hai (module faz-adom).</li>
<li><b>Logs abhi searchable hain?</b> <code>execute fazui storage &lt;adom&gt;</code> chalao. Agar logs archive mein chale gaye, to wo reports mein nahi aate.</li>
<li><b>Quota ne drop kiye?</b> Wahi storage output Overwritten aur Rejected counters dikhata hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Empty report ke liye checks ka order">
<rect x="20" y="20" width="110" height="52" rx="8" fill="#bae6fd"/><text x="75" y="42" text-anchor="middle" class="svg-ink" font-size="12">1 ADOM aur</text><text x="75" y="58" text-anchor="middle" class="svg-ink" font-size="12">device name</text>
<rect x="150" y="20" width="110" height="52" rx="8" fill="#bae6fd"/><text x="205" y="42" text-anchor="middle" class="svg-ink" font-size="12">2 registered?</text><text x="205" y="58" text-anchor="middle" class="svg-muted" font-size="12">unregistered list</text>
<rect x="280" y="20" width="110" height="52" rx="8" fill="#bae6fd"/><text x="335" y="42" text-anchor="middle" class="svg-ink" font-size="12">3 logs aaye?</text><text x="335" y="58" text-anchor="middle" class="svg-muted" font-size="12">log device</text>
<rect x="410" y="20" width="100" height="52" rx="8" fill="#fde68a"/><text x="460" y="42" text-anchor="middle" class="svg-ink" font-size="12">4 archive?</text><text x="460" y="58" text-anchor="middle" class="svg-muted" font-size="12">storage</text>
<rect x="530" y="20" width="90" height="52" rx="8" fill="#fde68a"/><text x="575" y="42" text-anchor="middle" class="svg-ink" font-size="12">5 quota?</text><text x="575" y="58" text-anchor="middle" class="svg-muted" font-size="12">storage</text>
<line x1="130" y1="46" x2="150" y2="46" stroke="#64748b" stroke-width="2"/><line x1="260" y1="46" x2="280" y2="46" stroke="#64748b" stroke-width="2"/><line x1="390" y1="46" x2="410" y2="46" stroke="#64748b" stroke-width="2"/><line x1="510" y1="46" x2="530" y2="46" stroke="#64748b" stroke-width="2"/>
<text x="20" y="120" class="svg-ink" font-size="13">Checks 1 se 3: logs report tak pahunche hi nahi.</text>
<text x="20" y="146" class="svg-ink" font-size="13">Checks 4 aur 5: logs store hue, phir hate ya refuse hue.</text>
<text x="20" y="180" class="svg-accent" font-size="12">Pehle check par ruko jo khaali page ko explain kare, fix karo, phir report dobara chalao.</text>
</svg><p class="cap">Sabse sasta aur sabse common karan pehle.</p></div>

<h3>Real output, check dar check</h3>
<p>Madurai ki report ADOM Corporate mein chalayi gayi aur khaali aayi. Basis line clue hai.</p>
<pre class="out">FAZ-1 # execute fazui report run Corporate MDU-FGT "Traffic Report"
Report: Traffic Report   ADOM: Corporate   Device: MDU-FGT
<span class="hl">Based on 0 stored analytics logs (0 traffic, 0 utm, 0 event).</span>
Sessions: 0   Bytes: 0   Blocked: 0
FAZ-1 # diagnose dvm device list
faz-log  678  FGVMEV1RGF38I000 ... HQ-FGT   <span class="hl">Corporate</span>
faz-log  171  FGVMEV1JOS6TJ000 ... MDU-FGT  <span class="hl">Retail</span></pre>
<p>MDU-FGT Retail mein rehta hai. Trichy ki report har ADOM mein kisi aur karan se khaali hai:</p>
<pre class="out">FAZ-1 # execute fazui unregistered list
NAME            SERIAL              IP              LOGS DISCARDED  LAST LOG SEEN
<span class="hl">TRY-FGT</span>         FGVMEV3X688U0000    192.0.2.13      0               -
FAZ-1 # diagnose log device
TRY-FGT         FGVMEV3X688U0000    <span class="hl">(unreg)</span>   0        0      0      discarded -</pre>

<div class="eg"><p><b>Worked example.</b> Do hafte baad Retail ki report ummeed se patli hai. Storage output karan dikha deta hai: quota full hai, policy drop hai, aur naye logs reject hue.</p></div>
<pre class="out">FAZ-1 # execute fazui storage root
  Disk quota          : 1 MB
  When the quota is full: drop the new logs
  Logs stored         : analytics 4 (traffic 4, utm 0, event 0), archive 0
  Received so far     : 24
  Overwritten (quota) : 17   <span class="hl">Rejected (quota): 3</span></pre>
<p><code>overwrite</code> ke saath sabse purane logs hat jate hain, aur Overwritten counter badhta hai. Aur retention ke baad logs archive mein chale jate hain:</p>
<pre class="out">  Used                : 244.14 KB (0.024 percent)   analytics 0 B, <span class="hl">archive 244.14 KB</span>
  Logs stored         : analytics 0 (traffic 0, utm 0, event 0), archive 4</pre>

<div class="warn"><p><b>Common mistakes.</b> Device register karke purane sessions dikhne ki ummeed rakhna: registration se pehle aaye logs kho jate hain. Fix ke baad naya traffic generate kiye bina turant report chalana. Registration se pehle quota check karna. Ye bhoolna ki dash wala command sirf us ek ADOM ko cover karta hai jiska naam aapne diya.</p></div>

<div class="exam"><p><b>Exam traps.</b> Archive logs searchable nahi aur reports mein nahi. Device sirf ek ADOM mein ho sakta hai. Unregistered logs discard hote hain, queue nahi. Dono quota policies logs khoti hain: overwrite sabse purane, drop sabse naye.</p></div>

<div class="scn"><h4>Do khaali reports, do karan</h4><p>Monday ki Madurai aur Trichy ki report zero sessions ke saath aayi. Engineer ne andaza nahi lagaya. Device list ne Madurai ko Retail mein dikhaya, yaani report Corporate mein chal rahi thi. Unregistered list ne Trichy dikhaya, jiske logs connect hone ke din se phenke ja rahe the. Trichy ko Retail mein register karke aur fresh web sessions generate karke dono reports mein sessions aaye.</p><p><b>Lesson:</b> same dikhne wale do symptoms ke alag karan ho sakte hain; checks chalo, pehle fix par mat ruko agar doosri report ab bhi khaali hai.</p></div>

<div class="iv"><p class="q">"Branch report zero sessions dikha rahi hai. Kaise troubleshoot karoge?"</p><p>Pehle ADOM aur device name confirm karo, phir registration, phir logs aaye ya nahi, phir storage output mein archive aur quota. Kaho ki har fix ke baad fresh traffic generate karoge, kyunki kuch back-fill nahi hota.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Khaali report ka matlab us scope mein stored analytics logs nahi hain.</li>
<li>Check order: ADOM aur name, registration, logs received, archive, quota.</li>
<li>Basis line "Based on 0 stored analytics logs" pehla clue hai.</li>
<li>Registration se pehle ke logs gaye; fix ke baad naya traffic generate karo.</li>
<li>Archived ya quota-dropped logs report tak kabhi nahi pahunchte.</li>
</ul></div>
`}};export{e as default};