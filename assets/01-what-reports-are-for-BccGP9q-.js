var e={id:`what-reports-are-for`,h:{en:`What reports are for and who reads them`,hi:`Reports kis liye hain aur kaun padhta hai`},body:{en:`
<div class="note"><p><b>What you will learn.</b> Why a pile of logs is not an answer, what a report is on a FortiAnalyzer, who reads reports and what each reader needs, and how the simulator lets you run reports. <b>Prerequisites:</b> the earlier modules of this track: logs reach FAZ-1 over OFTP, the device is registered, and logs are stored in an ADOM. You should also know what a traffic log and a UTM log are. If you can run a Log View search, you are ready.</p></div>

<p>Think of a shop owner at the end of the month. The cash register has printed thousands of small slips, one per sale. Nobody reads them one by one. The owner asks the accountant: "How much did we sell, what sold best, and how many customers walked away?" The accountant adds the slips and hands over one page. A <b>report</b> is that one page. The logs on FAZ-1 are the slips; the report is the summary that a human can read in two minutes.</p>

<h3>Logs, searches and reports are three different tools</h3>
<p>A <b>log</b> is one record of one event, for example one session through a firewall policy. <b>Log View</b> lets you search those records to answer a specific question: "what happened to the user at 10.30.0.10 at 11 o'clock?". A <b>report</b> counts and groups many logs to answer a general question: "what is this branch network used for?". Use Log View when you chase one event, and a report when you need the picture.</p>
<table class="cmp"><tr><th>Tool</th><th>Question it answers</th><th>Size of the answer</th></tr>
<tr><td>Log View</td><td>What exactly happened in this session?</td><td>One log, or a short list</td></tr>
<tr><td>Event handler</td><td>Did something suspicious repeat?</td><td>An event with a count</td></tr>
<tr><td>Report</td><td>What is the overall picture for a device or ADOM?</td><td>Totals and top lists</td></tr>
</table>

<h3>Who reads reports</h3>
<p>Different readers want different pages. A <b>store manager</b> wants to know if the shop network is used for work or for downloads. A <b>security officer</b> wants threats and blocked sessions. A <b>network engineer</b> wants bandwidth and top applications to plan a link upgrade. An <b>auditor</b> wants evidence that controls ran during a period. The same logs feed all four; only the layout changes.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="From logs to reports and readers">
<rect x="20" y="70" width="130" height="64" rx="8" fill="#bae6fd"/><text x="85" y="98" text-anchor="middle" class="svg-ink" font-size="13">FortiGates</text><text x="85" y="116" text-anchor="middle" class="svg-muted" font-size="12">write logs</text>
<rect x="200" y="70" width="130" height="64" rx="8" fill="#ddd6fe"/><text x="265" y="98" text-anchor="middle" class="svg-ink" font-size="13">FAZ-1</text><text x="265" y="116" text-anchor="middle" class="svg-muted" font-size="12">stores in ADOM</text>
<rect x="380" y="70" width="110" height="64" rx="8" fill="#bbf7d0"/><text x="435" y="98" text-anchor="middle" class="svg-ink" font-size="13">Report</text><text x="435" y="116" text-anchor="middle" class="svg-muted" font-size="12">counts logs</text>
<rect x="530" y="14" width="100" height="36" rx="8" fill="#fde68a"/><text x="580" y="37" text-anchor="middle" class="svg-ink" font-size="12">Store manager</text>
<rect x="530" y="86" width="100" height="36" rx="8" fill="#fde68a"/><text x="580" y="109" text-anchor="middle" class="svg-ink" font-size="12">Security</text>
<rect x="530" y="158" width="100" height="36" rx="8" fill="#fde68a"/><text x="580" y="181" text-anchor="middle" class="svg-ink" font-size="12">Auditor</text>
<line x1="150" y1="102" x2="200" y2="102" stroke="#64748b" stroke-width="2"/><line x1="330" y1="102" x2="380" y2="102" stroke="#64748b" stroke-width="2"/>
<line x1="490" y1="95" x2="530" y2="32" stroke="#64748b" stroke-width="2"/><line x1="490" y1="104" x2="530" y2="104" stroke="#64748b" stroke-width="2"/><line x1="490" y1="112" x2="530" y2="172" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">A report can only count what FAZ-1 has stored: no stored logs, no report.</p></div>

<h3>The key idea: a report is only as good as the logs</h3>
<p>A report is not a separate source of truth. It reads the stored <b>analytics</b> logs (the searchable store) of one ADOM, or of one device inside it, and counts them. Everything you learned in the earlier modules therefore decides what a report shows. A device that is not registered stores nothing. A policy with <code>logtraffic disable</code> writes nothing. A report cannot show a session that was never logged.</p>

<h3>How the simulator runs reports</h3>
<p>In the real product, reports are run and viewed in the GUI under the Reports section. The simulator offers two stand-in commands on FAZ-1, and we say so because they do not exist on a real FortiAnalyzer.</p>
<pre class="code"><span class="c">! stand-ins for GUI actions</span>
FAZ-1 # execute fazui report list
FAZ-1 # execute fazui report run &lt;adom&gt; &lt;device|-&gt; "&lt;layout&gt;"</pre>
<p>The device can be one name or a dash for all devices of the ADOM. The simulator has exactly three layouts, which chapter 2 explains.</p>
<pre class="out">FAZ-1 # execute fazui report list
Predefined report layouts:
  <span class="hl">Threat Report</span>
  <span class="hl">Traffic Report</span>
  <span class="hl">Bandwidth and Applications</span></pre>

<div class="eg"><p><b>Worked example.</b> The Trichy store manager asks: "What is our branch network used for?" Searching logs one by one is the wrong tool; there may be thousands. You run the Traffic Report for TRY-FGT and read the top applications. If the top entry is browsing and a small number of sessions are file sharing, you have an answer in one page, with numbers.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using a report to prove one specific event (use Log View). Reading a report without asking which ADOM and which device it covers. Expecting a report to include data from before the device was registered: those logs were discarded.</p></div>

<div class="exam"><p><b>Exam traps.</b> A report counts stored analytics logs; logs in the archive are not included. Reports are a GUI feature in the real product; the <code>execute fazui report</code> form is only the simulator stand-in.</p></div>

<div class="scn"><h4>The branch that "does nothing but downloads"</h4><p>A regional head heard that Trichy staff download films at work. Instead of arguing, the engineer ran the Traffic Report for TRY-FGT. Browsing sessions dominated, and two sessions of a file-sharing client were counted as blocked by the application control list. The head saw the real proportion: a policy problem for two sessions, not a culture problem.</p><p><b>Lesson:</b> a report turns an opinion into a number and a scale.</p></div>

<div class="iv"><p class="q">"What is the difference between Log View and a report?"</p><p>Log View searches individual records to investigate one event; a report aggregates many records into totals and top lists for a reader. Add that both depend on the same stored logs, so registration, ADOM and logging settings decide what either can show.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A report summarises many logs; Log View finds specific logs.</li>
<li>Readers differ: store manager, security, network engineer, auditor.</li>
<li>Reports read only the stored analytics logs of an ADOM or one device.</li>
<li>No stored log means no line in any report.</li>
<li>In the simulator, <code>execute fazui report list</code> and <code>run</code> stand in for the GUI.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Is chapter mein aap seekhoge.</b> Logs ka dher jawab kyun nahi hota, FortiAnalyzer par report kya hoti hai, reports kaun padhta hai aur har reader ko kya chahiye, aur simulator mein reports kaise run karte hain. <b>Prerequisites:</b> is track ke pehle ke modules: logs OFTP se FAZ-1 tak pahunchte hain, device registered hai, aur logs ADOM mein store hote hain. Aapko traffic log aur UTM log kya hote hain ye bhi pata hona chahiye. Agar aap Log View search chala lete ho, to aap ready ho.</p></div>

<p>Socho ek shop owner mahine ke end par. Cash register ne hazaaron chhoti slips print ki hain, har sale ki ek. Koi unhe ek-ek karke nahi padhta. Owner accountant se poochta hai: "Kitna becha, kya sabse zyada bika, aur kitne customers wapas chale gaye?" Accountant slips jodta hai aur ek page de deta hai. <b>Report</b> wahi ek page hai. FAZ-1 ke logs slips hain; report wo summary hai jo insaan do minute mein padh sake.</p>

<h3>Logs, searches aur reports teen alag tools hain</h3>
<p><b>Log</b> ek event ka ek record hai, jaise firewall policy se guzarta ek session. <b>Log View</b> in records mein search karne deta hai taaki ek specific sawal ka jawab mile: "10.30.0.10 wale user ke saath 11 baje kya hua?". <b>Report</b> kai logs ko count aur group karke general sawal ka jawab deti hai: "ye branch network kis kaam aa raha hai?". Ek event ke peeche padna ho to Log View, poori tasveer chahiye to report.</p>
<table class="cmp"><tr><th>Tool</th><th>Kaun sa sawal</th><th>Jawab ka size</th></tr>
<tr><td>Log View</td><td>Is session mein theek-theek kya hua?</td><td>Ek log, ya chhoti list</td></tr>
<tr><td>Event handler</td><td>Kya kuch shak wala baar-baar hua?</td><td>Count ke saath ek event</td></tr>
<tr><td>Report</td><td>Device ya ADOM ki overall tasveer kya hai?</td><td>Totals aur top lists</td></tr>
</table>

<h3>Reports kaun padhta hai</h3>
<p>Alag readers ko alag page chahiye. <b>Store manager</b> jaanna chahta hai ki shop network kaam ke liye use ho raha hai ya downloads ke liye. <b>Security officer</b> ko threats aur blocked sessions chahiye. <b>Network engineer</b> ko bandwidth aur top applications chahiye taaki link upgrade plan kare. <b>Auditor</b> ko saboot chahiye ki ek period mein controls chale. Chaaron ko wahi logs feed karte hain; sirf layout badalta hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Logs se reports aur readers tak">
<rect x="20" y="70" width="130" height="64" rx="8" fill="#bae6fd"/><text x="85" y="98" text-anchor="middle" class="svg-ink" font-size="13">FortiGates</text><text x="85" y="116" text-anchor="middle" class="svg-muted" font-size="12">logs likhte hain</text>
<rect x="200" y="70" width="130" height="64" rx="8" fill="#ddd6fe"/><text x="265" y="98" text-anchor="middle" class="svg-ink" font-size="13">FAZ-1</text><text x="265" y="116" text-anchor="middle" class="svg-muted" font-size="12">ADOM mein store</text>
<rect x="380" y="70" width="110" height="64" rx="8" fill="#bbf7d0"/><text x="435" y="98" text-anchor="middle" class="svg-ink" font-size="13">Report</text><text x="435" y="116" text-anchor="middle" class="svg-muted" font-size="12">logs ginti hai</text>
<rect x="530" y="14" width="100" height="36" rx="8" fill="#fde68a"/><text x="580" y="37" text-anchor="middle" class="svg-ink" font-size="12">Store manager</text>
<rect x="530" y="86" width="100" height="36" rx="8" fill="#fde68a"/><text x="580" y="109" text-anchor="middle" class="svg-ink" font-size="12">Security</text>
<rect x="530" y="158" width="100" height="36" rx="8" fill="#fde68a"/><text x="580" y="181" text-anchor="middle" class="svg-ink" font-size="12">Auditor</text>
<line x1="150" y1="102" x2="200" y2="102" stroke="#64748b" stroke-width="2"/><line x1="330" y1="102" x2="380" y2="102" stroke="#64748b" stroke-width="2"/>
<line x1="490" y1="95" x2="530" y2="32" stroke="#64748b" stroke-width="2"/><line x1="490" y1="104" x2="530" y2="104" stroke="#64748b" stroke-width="2"/><line x1="490" y1="112" x2="530" y2="172" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Report wahi ginti hai jo FAZ-1 ne store kiya hai: stored log nahi to report nahi.</p></div>

<h3>Asli baat: report utni hi achhi jitne achhe logs</h3>
<p>Report koi alag source of truth nahi hai. Wo ek ADOM ke, ya uske andar ek device ke, stored <b>analytics</b> logs (searchable store) padhti hai aur ginti hai. Isliye pehle modules mein jo seekha wo decide karta hai ki report kya dikhayegi. Jo device registered nahi hai wo kuch store nahi karta. <code>logtraffic disable</code> wali policy kuch nahi likhti. Jo session kabhi log hi nahi hua, report use nahi dikha sakti.</p>

<h3>Simulator reports kaise run karta hai</h3>
<p>Real product mein reports GUI ke Reports section mein run aur dekhi jati hain. Simulator FAZ-1 par do stand-in commands deta hai, aur hum ye batate hain kyunki ye real FortiAnalyzer par nahi hote.</p>
<pre class="code"><span class="c">! GUI actions ke stand-ins</span>
FAZ-1 # execute fazui report list
FAZ-1 # execute fazui report run &lt;adom&gt; &lt;device|-&gt; "&lt;layout&gt;"</pre>
<p>Device ek naam ho sakta hai ya dash matlab ADOM ke saare devices. Simulator mein theek teen layouts hain, jo chapter 2 samjhata hai.</p>
<pre class="out">FAZ-1 # execute fazui report list
Predefined report layouts:
  <span class="hl">Threat Report</span>
  <span class="hl">Traffic Report</span>
  <span class="hl">Bandwidth and Applications</span></pre>

<div class="eg"><p><b>Worked example.</b> Trichy ka store manager poochta hai: "Hamara branch network kis kaam aa raha hai?" Logs ek-ek karke dekhna galat tool hai; hazaaron ho sakte hain. Aap TRY-FGT ke liye Traffic Report run karte ho aur top applications padhte ho. Agar top entry browsing hai aur kuch sessions file sharing ke hain, to ek page mein numbers ke saath jawab mil gaya.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Ek specific event prove karne ke liye report use karna (Log View use karo). Ye pooche bina report padhna ki wo kaun si ADOM aur kaun sa device cover karti hai. Report se device registered hone se pehle ka data expect karna: wo logs discard ho chuke the.</p></div>

<div class="exam"><p><b>Exam traps.</b> Report stored analytics logs ginti hai; archive ke logs shamil nahi hote. Real product mein reports GUI feature hain; <code>execute fazui report</code> sirf simulator ka stand-in hai.</p></div>

<div class="scn"><h4>Wo branch jo "sirf downloads karti hai"</h4><p>Ek regional head ne suna ki Trichy staff kaam ke time films download karta hai. Bahes ke bajay engineer ne TRY-FGT ka Traffic Report chalaya. Browsing sessions zyada the, aur file-sharing client ke do sessions application control list ne blocked count kiye. Head ne asli proportion dekha: do sessions ki policy problem, culture problem nahi.</p><p><b>Lesson:</b> report raay ko number aur scale mein badal deti hai.</p></div>

<div class="iv"><p class="q">"Log View aur report mein kya fark hai?"</p><p>Log View individual records search karke ek event investigate karta hai; report kai records ko totals aur top lists mein aggregate karke reader ko deti hai. Ye jodo ki dono same stored logs par nirbhar hain, isliye registration, ADOM aur logging settings decide karti hain ki dono kya dikha sakte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Report kai logs ka summary hai; Log View specific logs dhoondhta hai.</li>
<li>Readers alag hain: store manager, security, network engineer, auditor.</li>
<li>Reports ADOM ya ek device ke sirf stored analytics logs padhti hain.</li>
<li>Stored log nahi to kisi report mein line nahi.</li>
<li>Simulator mein <code>execute fazui report list</code> aur <code>run</code> GUI ke stand-in hain.</li>
</ul></div>
`}};export{e as default};