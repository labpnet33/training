var e={id:`reporting-practice`,h:{en:`Reporting practice: store managers, audit evidence and hygiene`,hi:`Reporting practice: store managers, audit evidence aur hygiene`},body:{en:`
<p>A good cook does not just know recipes; the cook also keeps the kitchen clean, labels the boxes and writes the date on the jar. Reporting is the same. Running a command is the easy part. The craft lies in choosing the right scope, writing the answer in the reader's language, and leaving enough notes that another engineer could repeat the result next month. This chapter gives you three working routines.</p>

<h3>Routine 1: the weekly page for a store manager</h3>
<p>The Madurai store manager is not a network person. She wants to know three things: is the network busy with work, did anything bad get blocked, and is anything strange. Follow these steps.</p>
<ol>
<li><b>Fix the scope.</b> One ADOM (Retail) and one device (MDU-FGT), so the page is about her store only.</li>
<li><b>Run two layouts.</b> Traffic Report for activity, Threat Report for blocks.</li>
<li><b>Translate.</b> Write three sentences with numbers: "Sessions: N. Blocked: M, all by the application control list. Top application: browsing."</li>
<li><b>Attach the basis.</b> Quote the line "Based on N stored analytics logs" so the reader knows how solid the page is.</li>
<li><b>Keep the same layout every week</b>, so that this week can be compared with last week.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Weekly reporting routine">
<rect x="14" y="40" width="108" height="64" rx="8" fill="#bae6fd"/><text x="68" y="68" text-anchor="middle" class="svg-ink" font-size="12">1 Fix scope</text><text x="68" y="86" text-anchor="middle" class="svg-muted" font-size="12">ADOM, device</text>
<rect x="142" y="40" width="108" height="64" rx="8" fill="#bae6fd"/><text x="196" y="68" text-anchor="middle" class="svg-ink" font-size="12">2 Run layouts</text><text x="196" y="86" text-anchor="middle" class="svg-muted" font-size="12">traffic, threat</text>
<rect x="270" y="40" width="108" height="64" rx="8" fill="#bbf7d0"/><text x="324" y="68" text-anchor="middle" class="svg-ink" font-size="12">3 Check basis</text><text x="324" y="86" text-anchor="middle" class="svg-muted" font-size="12">N logs, not 0</text>
<rect x="398" y="40" width="108" height="64" rx="8" fill="#fde68a"/><text x="452" y="68" text-anchor="middle" class="svg-ink" font-size="12">4 Translate</text><text x="452" y="86" text-anchor="middle" class="svg-muted" font-size="12">3 sentences</text>
<rect x="526" y="40" width="100" height="64" rx="8" fill="#ddd6fe"/><text x="576" y="68" text-anchor="middle" class="svg-ink" font-size="12">5 File it</text><text x="576" y="86" text-anchor="middle" class="svg-muted" font-size="12">date, scope</text>
<line x1="122" y1="72" x2="142" y2="72" stroke="#64748b" stroke-width="2"/><line x1="250" y1="72" x2="270" y2="72" stroke="#64748b" stroke-width="2"/><line x1="378" y1="72" x2="398" y2="72" stroke="#64748b" stroke-width="2"/><line x1="506" y1="72" x2="526" y2="72" stroke="#64748b" stroke-width="2"/>
<text x="14" y="140" class="svg-accent" font-size="12">Same steps every week: the routine makes the numbers comparable.</text>
</svg><p class="cap">Scope, run, check the basis, translate, file.</p></div>

<div class="eg"><p><b>Worked example.</b> The report for all of Retail, both branches together, reads like this. Notice what the manager can use: sources, shares and the honest remark that no application was identified.</p></div>
<pre class="out">FAZ-1 # execute fazui report run Retail - "Bandwidth and Applications"
Report: Bandwidth and Applications   ADOM: Retail   Device: all devices
<span class="hl">Based on 6 stored analytics logs (6 traffic, 0 utm, 0 event).</span>
Sessions: 6   Bytes: 504   (bytes are the byte fields of the simulator logs: a stand-in)
Top applications (by bytes):
  1. unscanned/ALL  504 bytes, 6 sessions
Top sources (by bytes):
  1. 10.30.0.10  252 bytes
  2. 10.20.0.10  252 bytes</pre>
<p>The honest summary: six sessions, split equally between the Trichy PC and the Madurai PC, and no application identified because these policies have no application control profile. The page cannot tell a manager what the traffic was; that is a limit of the policy, not of the report.</p>

<h3>Routine 2: audit evidence</h3>
<p>An auditor asks: "Show me that web filtering and application control were active last month." A report supports this claim only when you record how it was produced. Write down the ADOM, the device, the layout, the date and time of the run, the basis line and the retention period of analytics logs. Add one Log View example of a blocked session, because the auditor will ask to see a single record behind the total. Remember that reports use analytics logs only: with the default retention of 60 days, older evidence has moved to the archive and is not in reports.</p>
<pre class="code"><span class="c">! evidence pack, simulator stand-ins</span>
FAZ-1 # execute fazui report run Retail MDU-FGT "Threat Report"
FAZ-1 # execute fazui logview Retail MDU-FGT utm limit 1
FAZ-1 # execute fazui storage Retail</pre>

<h3>Routine 3: report hygiene</h3>
<ul>
<li><b>Name the scope in every message.</b> "Retail, MDU-FGT, Traffic Report, week 41" is a statement; "the report" is not.</li>
<li><b>Never mix scopes</b> when comparing two weeks.</li>
<li><b>Do not hide stand-ins.</b> In the simulator the bytes are 84 per traffic log. Real products have real bytes; say which one you are looking at.</li>
<li><b>Do not paste raw logs into a manager's page.</b> They contain source addresses and details that the reader does not need.</li>
<li><b>Re-run after a fix.</b> Never quote a number from before a registration or ADOM change.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Sending a report without the scope. Giving the manager the whole output instead of three sentences. Claiming "complete evidence" when the period is longer than the analytics retention. Comparing a device report with an ADOM-wide report.</p></div>

<div class="exam"><p><b>Exam traps.</b> Evidence outside the analytics retention lives in the archive and does not appear in reports. A device scope and an all-devices scope give different totals for the same ADOM. A report proves what was logged, not what was not logged.</p></div>

<div class="scn"><h4>The auditor and the missing month</h4><p>An auditor asked for last quarter's blocked sessions. The engineer ran the Threat Report and found only the last 60 days: older logs had moved to the archive, which is not searchable and not in reports. The engineer had written the retention in the evidence note from the start, so the gap was explained, and a longer analytics retention was proposed for the future instead of an awkward surprise.</p><p><b>Lesson:</b> state the retention window next to every piece of evidence.</p></div>

<div class="iv"><p class="q">"How do you make a report trustworthy for an audit?"</p><p>Record scope, layout, run time and the basis line, keep a sample record from Log View, and state the retention window. Say that a report proves what was logged and that you checked registration and logging settings before relying on it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Fix the scope first: one ADOM, one device for a store manager.</li>
<li>Translate numbers into three honest sentences and quote the basis line.</li>
<li>Audit evidence needs scope, time, retention and one sample record.</li>
<li>Keep the same routine every week so reports can be compared.</li>
<li>Name stand-ins and limits openly.</li>
</ul></div>
`,hi:`
<p>Achha cook sirf recipes nahi jaanta; wo kitchen saaf rakhta hai, dibbon par label lagata hai aur jar par date likhta hai. Reporting bhi aisi hi hai. Command chalana aasaan hissa hai. Kala is mein hai: sahi scope chunna, jawab reader ki bhasha mein likhna, aur itne notes chhodna ki doosra engineer agle mahine wahi result dohra sake. Ye chapter aapko teen working routines deta hai.</p>

<h3>Routine 1: store manager ke liye weekly page</h3>
<p>Madurai ki store manager network wali nahi hain. Unhe teen cheezein jaanni hain: network kaam mein busy hai, kuch bura block hua, kuch ajeeb hai. Ye steps follow karo.</p>
<ol>
<li><b>Scope fix karo.</b> Ek ADOM (Retail) aur ek device (MDU-FGT), taaki page sirf unki store ke baare mein ho.</li>
<li><b>Do layouts chalao.</b> Activity ke liye Traffic Report, blocks ke liye Threat Report.</li>
<li><b>Translate karo.</b> Numbers ke saath teen sentences likho: "Sessions: N. Blocked: M, sab application control list ne. Top application: browsing."</li>
<li><b>Basis jodo.</b> "Based on N stored analytics logs" line quote karo taaki reader ko page ki mazbooti pata chale.</li>
<li><b>Har hafte same layout rakho</b>, taaki is hafte ko pichhle hafte se compare kar sako.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Weekly reporting routine">
<rect x="14" y="40" width="108" height="64" rx="8" fill="#bae6fd"/><text x="68" y="68" text-anchor="middle" class="svg-ink" font-size="12">1 Scope fix</text><text x="68" y="86" text-anchor="middle" class="svg-muted" font-size="12">ADOM, device</text>
<rect x="142" y="40" width="108" height="64" rx="8" fill="#bae6fd"/><text x="196" y="68" text-anchor="middle" class="svg-ink" font-size="12">2 Layouts run</text><text x="196" y="86" text-anchor="middle" class="svg-muted" font-size="12">traffic, threat</text>
<rect x="270" y="40" width="108" height="64" rx="8" fill="#bbf7d0"/><text x="324" y="68" text-anchor="middle" class="svg-ink" font-size="12">3 Basis check</text><text x="324" y="86" text-anchor="middle" class="svg-muted" font-size="12">N logs, 0 nahi</text>
<rect x="398" y="40" width="108" height="64" rx="8" fill="#fde68a"/><text x="452" y="68" text-anchor="middle" class="svg-ink" font-size="12">4 Translate</text><text x="452" y="86" text-anchor="middle" class="svg-muted" font-size="12">3 sentences</text>
<rect x="526" y="40" width="100" height="64" rx="8" fill="#ddd6fe"/><text x="576" y="68" text-anchor="middle" class="svg-ink" font-size="12">5 File karo</text><text x="576" y="86" text-anchor="middle" class="svg-muted" font-size="12">date, scope</text>
<line x1="122" y1="72" x2="142" y2="72" stroke="#64748b" stroke-width="2"/><line x1="250" y1="72" x2="270" y2="72" stroke="#64748b" stroke-width="2"/><line x1="378" y1="72" x2="398" y2="72" stroke="#64748b" stroke-width="2"/><line x1="506" y1="72" x2="526" y2="72" stroke="#64748b" stroke-width="2"/>
<text x="14" y="140" class="svg-accent" font-size="12">Har hafte wahi steps: routine numbers ko comparable banati hai.</text>
</svg><p class="cap">Scope, run, basis check, translate, file.</p></div>

<div class="eg"><p><b>Worked example.</b> Poore Retail ki report, dono branches ek saath, aisi padhti hai. Dekho manager ke kaam kya aata hai: sources, shares aur imaandar remark ki koi application identify nahi hui.</p></div>
<pre class="out">FAZ-1 # execute fazui report run Retail - "Bandwidth and Applications"
Report: Bandwidth and Applications   ADOM: Retail   Device: all devices
<span class="hl">Based on 6 stored analytics logs (6 traffic, 0 utm, 0 event).</span>
Sessions: 6   Bytes: 504   (bytes are the byte fields of the simulator logs: a stand-in)
Top applications (by bytes):
  1. unscanned/ALL  504 bytes, 6 sessions
Top sources (by bytes):
  1. 10.30.0.10  252 bytes
  2. 10.20.0.10  252 bytes</pre>
<p>Imaandar summary: chhe sessions, Trichy PC aur Madurai PC mein barabar baante, aur koi application identify nahi hui kyunki in policies mein application control profile nahi hai. Page manager ko ye nahi bata sakta ki traffic kya tha; ye policy ki limit hai, report ki nahi.</p>

<h3>Routine 2: audit evidence</h3>
<p>Auditor poochta hai: "Dikhao ki pichhle mahine web filtering aur application control active the." Report is claim ko tabhi support karti hai jab aap record karte ho ki wo kaise bani. ADOM, device, layout, run ki date aur time, basis line aur analytics logs ki retention likho. Ek blocked session ka Log View example jodo, kyunki auditor total ke peeche ka ek record dekhna chahega. Yaad rakho ki reports sirf analytics logs use karti hain: default 60 din retention ke saath, purana evidence archive mein ja chuka hai aur reports mein nahi hai.</p>
<pre class="code"><span class="c">! evidence pack, simulator stand-ins</span>
FAZ-1 # execute fazui report run Retail MDU-FGT "Threat Report"
FAZ-1 # execute fazui logview Retail MDU-FGT utm limit 1
FAZ-1 # execute fazui storage Retail</pre>

<h3>Routine 3: report hygiene</h3>
<ul>
<li><b>Har message mein scope likho.</b> "Retail, MDU-FGT, Traffic Report, week 41" statement hai; "wo report" nahi.</li>
<li><b>Do hafte compare karte waqt scopes mat milao.</b></li>
<li><b>Stand-ins mat chhupao.</b> Simulator mein bytes har traffic log par 84 hain. Real products ke bytes real hote hain; batao aap kaun sa dekh rahe ho.</li>
<li><b>Manager ke page par raw logs mat paste karo.</b> Unmein source addresses aur details hote hain jo reader ko nahi chahiye.</li>
<li><b>Fix ke baad dobara run karo.</b> Registration ya ADOM change se pehle ka number kabhi quote mat karo.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Scope ke bina report bhejna. Manager ko teen sentences ki jagah poora output dena. Period analytics retention se lambi hone par "complete evidence" kehna. Device report ko ADOM-wide report se compare karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Analytics retention ke bahar ka evidence archive mein rehta hai aur reports mein nahi aata. Device scope aur all-devices scope same ADOM ke alag totals dete hain. Report wo prove karti hai jo log hua, wo nahi jo log nahi hua.</p></div>

<div class="scn"><h4>Auditor aur gayab mahina</h4><p>Auditor ne pichhli quarter ke blocked sessions maange. Engineer ne Threat Report chalayi aur sirf pichhle 60 din mile: purane logs archive mein ja chuke the, jo searchable nahi aur reports mein nahi. Engineer ne evidence note mein shuru se retention likhi thi, isliye gap explain ho gaya, aur awkward surprise ke bajay future ke liye lambi analytics retention propose hui.</p><p><b>Lesson:</b> har evidence ke saath retention window likho.</p></div>

<div class="iv"><p class="q">"Audit ke liye report ko trustworthy kaise banate ho?"</p><p>Scope, layout, run time aur basis line record karo, Log View se ek sample record rakho, aur retention window batao. Kaho ki report wo prove karti hai jo log hua aur aapne bharosa karne se pehle registration aur logging settings check ki.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle scope fix karo: store manager ke liye ek ADOM, ek device.</li>
<li>Numbers ko teen imaandar sentences mein translate karo aur basis line quote karo.</li>
<li>Audit evidence ko scope, time, retention aur ek sample record chahiye.</li>
<li>Har hafte wahi routine rakho taaki reports comparable rahein.</li>
<li>Stand-ins aur limits khul kar batao.</li>
</ul></div>
`}};export{e as default};