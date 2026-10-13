var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a long train journey you tick a list: ticket, charger, water. You do not read the whole railway guide again. This chapter is that list for reports on FAZ-1. Read it after the labs, tick what you can really do, and go back to the chapter named in brackets for any line you cannot tick.</p>

<h3>What the module covered</h3>
<p>A report is a summary of stored analytics logs for one ADOM or one device (chapter 1). The simulator has three fixed layouts: Traffic Report, Threat Report and Bandwidth and Applications (chapter 2). Reading a report correctly means reading the scope and the basis line first, then sessions and bytes, then blocked versus denied, then the top lists (chapter 3). An empty or wrong report has a fixed order of causes (chapter 4). Dashboards, schedules, PDF files, email, datasets and custom charts are theory (chapter 5). Good practice is a stable weekly routine and honest evidence notes (chapter 6). The two labs trained both sides: reading a report (chapter 7) and finding why two reports are empty (chapter 8).</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Report pipeline summary">
<rect x="14" y="50" width="104" height="60" rx="8" fill="#bae6fd"/><text x="66" y="76" text-anchor="middle" class="svg-ink" font-size="12">Traffic and</text><text x="66" y="94" text-anchor="middle" class="svg-ink" font-size="12">UTM logs</text>
<rect x="148" y="50" width="104" height="60" rx="8" fill="#bae6fd"/><text x="200" y="76" text-anchor="middle" class="svg-ink" font-size="12">Registered</text><text x="200" y="94" text-anchor="middle" class="svg-ink" font-size="12">device</text>
<rect x="282" y="50" width="104" height="60" rx="8" fill="#ddd6fe"/><text x="334" y="76" text-anchor="middle" class="svg-ink" font-size="12">ADOM store</text><text x="334" y="94" text-anchor="middle" class="svg-muted" font-size="12">analytics</text>
<rect x="416" y="50" width="104" height="60" rx="8" fill="#bbf7d0"/><text x="468" y="76" text-anchor="middle" class="svg-ink" font-size="12">Layout run</text><text x="468" y="94" text-anchor="middle" class="svg-muted" font-size="12">3 choices</text>
<rect x="550" y="50" width="78" height="60" rx="8" fill="#fde68a"/><text x="589" y="85" text-anchor="middle" class="svg-ink" font-size="12">Reader</text>
<line x1="118" y1="80" x2="148" y2="80" stroke="#64748b" stroke-width="2"/><line x1="252" y1="80" x2="282" y2="80" stroke="#64748b" stroke-width="2"/><line x1="386" y1="80" x2="416" y2="80" stroke="#64748b" stroke-width="2"/><line x1="520" y1="80" x2="550" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="14" y="145" class="svg-accent" font-size="12">A break anywhere on the left gives an empty or wrong page on the right.</text>
</svg><p class="cap">The whole module in one line.</p></div>

<h3>Checklist: can you do this?</h3>
<ul>
<li>Explain in two sentences the difference between Log View and a report (chapter 1).</li>
<li>List the three layouts and say which logs and which reader each one fits (chapter 2).</li>
<li>Run <code>execute fazui report run &lt;adom&gt; &lt;device|-&gt; "&lt;layout&gt;"</code> with correct quotes (chapter 2).</li>
<li>Read the basis line and say what N means (chapter 3).</li>
<li>Explain why Blocked can be larger than the deny count (chapter 3).</li>
<li>Name the order of checks for an empty report and the command for each (chapter 4).</li>
<li>Say which dashboard and report features are theory in this course (chapter 5).</li>
<li>Write three honest sentences for a store manager from a report (chapter 6).</li>
<li>Fix a wrong-ADOM report and an unregistered device, and generate new traffic after the fix (chapter 8).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Report</dt><dd>A summary of many stored logs: totals and top lists for one scope.</dd>
<dt>Layout</dt><dd>The fixed form of a report. The simulator has Traffic Report, Threat Report and Bandwidth and Applications.</dd>
<dt>Analytics logs</dt><dd>The searchable store. Reports and Log View read only this store.</dd>
<dt>Archive</dt><dd>Older logs kept in a smaller form; not searchable, not in reports.</dd>
<dt>Session</dt><dd>One conversation through the firewall; one traffic log.</dd>
<dt>Blocked</dt><dd>A deny, or a session stopped by a security profile verdict.</dd>
<dt>Basis line</dt><dd>The "Based on N stored analytics logs" line that shows how much data stands behind the numbers.</dd>
<dt>Dataset, chart</dt><dd>Real-product building blocks of custom reports; theory here.</dd>
</dl>

<h3>The most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Layouts in the simulator</td><td>Three</td></tr>
<tr><td>Reports read</td><td>Stored analytics logs of an ADOM or one device</td></tr>
<tr><td>Bytes in the simulator</td><td>84 per traffic log (stand-in)</td></tr>
<tr><td>Default analytics retention</td><td>60 days, then the archive</td></tr>
<tr><td>Unregistered device</td><td>Logs discarded and counted; registration is not retroactive</td></tr>
<tr><td>Quota full</td><td>Overwrite loses the oldest, drop rejects the newest</td></tr>
<tr><td>Dashboards, schedules, PDF, email, custom datasets</td><td>Theory only</td></tr>
</table>
<p>The skills in this module overlap with vendor administrator-level skills for central logging and reporting. This is independent training and does not claim to cover any exam.</p>

<div class="warn"><p><b>Common mistakes to remember.</b> Reading a number without the scope. Calling simulator bytes real. Fixing one cause and stopping. Quoting a report without the retention window.</p></div>

<div class="exam"><p><b>Exam traps in one place.</b> Blocked is wider than deny. Reports ignore the archive. A schedule changes timing, not content. The commands <code>execute fazui report</code> and <code>execute fazui storage</code> are stand-ins for GUI actions.</p></div>

<div class="scn"><h4>The new engineer's first Monday</h4><p>On the first Monday a new engineer was asked: "Why does the Trichy report show zero?" Using the checklist, the engineer confirmed the ADOM, found the device in the unregistered list, registered it, asked a colleague to browse, and showed the first real sessions within ten minutes.</p><p><b>Lesson:</b> a fixed checklist beats cleverness at the start of a career.</p></div>

<div class="iv"><p class="q">"Summarise what you know about FortiAnalyzer reporting."</p><p>Reports summarise stored analytics logs per ADOM or device; layouts decide the question; I read the scope and basis first; empty reports follow a fixed check order; dashboards, schedules and custom charts I know as theory, and I say so.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Report quality equals log quality: registration, ADOM, logging, retention, quota.</li>
<li>Three layouts: traffic, threat, bandwidth and applications.</li>
<li>Read scope, basis line, then numbers; Blocked is not only deny.</li>
<li>Empty report: ADOM, registration, logs received, archive, quota.</li>
<li>Be honest about stand-ins and about theory-only features.</li>
</ul></div>
`,hi:`
<p>Lambi train yatra se pehle aap list tick karte ho: ticket, charger, paani. Poori railway guide dobara nahi padhte. Ye chapter FAZ-1 par reports ke liye wahi list hai. Labs ke baad ise padho, jo sach mein kar sakte ho use tick karo, aur jo line tick na ho sake uske liye bracket mein likhe chapter par wapas jao.</p>

<h3>Module ne kya cover kiya</h3>
<p>Report ek ADOM ya ek device ke stored analytics logs ka summary hai (chapter 1). Simulator mein teen fixed layouts hain: Traffic Report, Threat Report aur Bandwidth and Applications (chapter 2). Report sahi padhne ka matlab hai pehle scope aur basis line, phir sessions aur bytes, phir blocked versus denied, phir top lists (chapter 3). Khaali ya galat report ke karanon ka ek tay order hai (chapter 4). Dashboards, schedules, PDF files, email, datasets aur custom charts theory hain (chapter 5). Achhi practice hai stable weekly routine aur imaandar evidence notes (chapter 6). Do labs ne dono taraf train kiya: report padhna (chapter 7) aur do reports khaali kyun hain ye dhoondhna (chapter 8).</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Report pipeline summary">
<rect x="14" y="50" width="104" height="60" rx="8" fill="#bae6fd"/><text x="66" y="76" text-anchor="middle" class="svg-ink" font-size="12">Traffic aur</text><text x="66" y="94" text-anchor="middle" class="svg-ink" font-size="12">UTM logs</text>
<rect x="148" y="50" width="104" height="60" rx="8" fill="#bae6fd"/><text x="200" y="76" text-anchor="middle" class="svg-ink" font-size="12">Registered</text><text x="200" y="94" text-anchor="middle" class="svg-ink" font-size="12">device</text>
<rect x="282" y="50" width="104" height="60" rx="8" fill="#ddd6fe"/><text x="334" y="76" text-anchor="middle" class="svg-ink" font-size="12">ADOM store</text><text x="334" y="94" text-anchor="middle" class="svg-muted" font-size="12">analytics</text>
<rect x="416" y="50" width="104" height="60" rx="8" fill="#bbf7d0"/><text x="468" y="76" text-anchor="middle" class="svg-ink" font-size="12">Layout run</text><text x="468" y="94" text-anchor="middle" class="svg-muted" font-size="12">3 choices</text>
<rect x="550" y="50" width="78" height="60" rx="8" fill="#fde68a"/><text x="589" y="85" text-anchor="middle" class="svg-ink" font-size="12">Reader</text>
<line x1="118" y1="80" x2="148" y2="80" stroke="#64748b" stroke-width="2"/><line x1="252" y1="80" x2="282" y2="80" stroke="#64748b" stroke-width="2"/><line x1="386" y1="80" x2="416" y2="80" stroke="#64748b" stroke-width="2"/><line x1="520" y1="80" x2="550" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="14" y="145" class="svg-accent" font-size="12">Left side mein kahin bhi toot, to right side par khaali ya galat page.</text>
</svg><p class="cap">Poora module ek line mein.</p></div>

<h3>Checklist: kya aap ye kar sakte ho?</h3>
<ul>
<li>Log View aur report ka fark do sentences mein samjhao (chapter 1).</li>
<li>Teen layouts list karo aur batao har ek kaun se logs aur kaun se reader ke liye hai (chapter 2).</li>
<li>Sahi quotes ke saath <code>execute fazui report run &lt;adom&gt; &lt;device|-&gt; "&lt;layout&gt;"</code> chalao (chapter 2).</li>
<li>Basis line padho aur batao N ka matlab kya hai (chapter 3).</li>
<li>Samjhao Blocked deny count se bada kyun ho sakta hai (chapter 3).</li>
<li>Khaali report ke checks ka order aur har ek ka command batao (chapter 4).</li>
<li>Batao dashboard aur report ke kaun se features is course mein theory hain (chapter 5).</li>
<li>Report se store manager ke liye teen imaandar sentences likho (chapter 6).</li>
<li>Galat-ADOM report aur unregistered device fix karo, aur fix ke baad naya traffic generate karo (chapter 8).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Report</dt><dd>Kai stored logs ka summary: ek scope ke totals aur top lists.</dd>
<dt>Layout</dt><dd>Report ka fixed form. Simulator mein Traffic Report, Threat Report aur Bandwidth and Applications hain.</dd>
<dt>Analytics logs</dt><dd>Searchable store. Reports aur Log View sirf yahi store padhte hain.</dd>
<dt>Archive</dt><dd>Purane logs chhote roop mein; searchable nahi, reports mein nahi.</dd>
<dt>Session</dt><dd>Firewall ke through ek conversation; ek traffic log.</dd>
<dt>Blocked</dt><dd>Deny, ya security profile verdict se roka gaya session.</dd>
<dt>Basis line</dt><dd>"Based on N stored analytics logs" line jo dikhati hai numbers ke peeche kitna data hai.</dd>
<dt>Dataset, chart</dt><dd>Custom reports ke real-product building blocks; yahan theory.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Simulator mein layouts</td><td>Teen</td></tr>
<tr><td>Reports kya padhti hain</td><td>ADOM ya ek device ke stored analytics logs</td></tr>
<tr><td>Simulator mein bytes</td><td>Har traffic log par 84 (stand-in)</td></tr>
<tr><td>Default analytics retention</td><td>60 din, phir archive</td></tr>
<tr><td>Unregistered device</td><td>Logs discard aur count; registration retroactive nahi</td></tr>
<tr><td>Quota full</td><td>Overwrite sabse purane khota hai, drop sabse naye reject karta hai</td></tr>
<tr><td>Dashboards, schedules, PDF, email, custom datasets</td><td>Sirf theory</td></tr>
</table>
<p>Is module ki skills central logging aur reporting ke vendor administrator-level skills se overlap karti hain. Ye independent training hai aur kisi exam ko cover karne ka claim nahi karti.</p>

<div class="warn"><p><b>Yaad rakhne wali common mistakes.</b> Scope ke bina number padhna. Simulator bytes ko real kehna. Ek karan fix karke ruk jana. Retention window ke bina report quote karna.</p></div>

<div class="exam"><p><b>Exam traps ek jagah.</b> Blocked deny se bada hai. Reports archive ignore karti hain. Schedule timing badalta hai, content nahi. <code>execute fazui report</code> aur <code>execute fazui storage</code> GUI actions ke stand-ins hain.</p></div>

<div class="scn"><h4>Naye engineer ka pehla Monday</h4><p>Pehle Monday naye engineer se poocha gaya: "Trichy ki report zero kyun dikhati hai?" Checklist se engineer ne ADOM confirm kiya, device ko unregistered list mein paya, register kiya, colleague se browse karwaya, aur das minute mein pehle real sessions dikha diye.</p><p><b>Lesson:</b> career ki shuruaat mein fixed checklist hoshiyari se behtar hai.</p></div>

<div class="iv"><p class="q">"FortiAnalyzer reporting ke baare mein jo jaante ho wo summarise karo."</p><p>Reports ADOM ya device ke stored analytics logs summarise karti hain; layouts sawal tay karte hain; main pehle scope aur basis padhta hoon; khaali reports ka fixed check order hai; dashboards, schedules aur custom charts main theory ke roop mein jaanta hoon, aur ye kehta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Report ki quality log ki quality ke barabar: registration, ADOM, logging, retention, quota.</li>
<li>Teen layouts: traffic, threat, bandwidth and applications.</li>
<li>Scope, basis line, phir numbers padho; Blocked sirf deny nahi.</li>
<li>Khaali report: ADOM, registration, logs received, archive, quota.</li>
<li>Stand-ins aur theory-only features ke baare mein imaandar raho.</li>
</ul></div>
`}};export{e as default};