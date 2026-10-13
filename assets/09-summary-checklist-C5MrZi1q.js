var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before an exam, a pilot does not re-read the whole manual. She runs a checklist: the few things that, if forgotten, cause the most trouble. This chapter is that checklist for the first module of the FortiAnalyzer track. If you can do every item below without looking, you understand how logs travel from a FortiGate to a FortiAnalyzer and why they sometimes do not arrive.</p>

<h3>What you should be able to do</h3>
<ol>
<li>Explain in two sentences why logs are sent to a FortiAnalyzer, and what a FortiAnalyzer does not do (it is not in the traffic path and blocks nothing).</li>
<li>Name the three log families (traffic, UTM, event) and give one example of each.</li>
<li>Draw the log flow: policy logging, filter, queue, OFTP on port 514, registration check, storage.</li>
<li>Configure <code>config log fortianalyzer setting</code> with status enable and the server, and know the other options: serial, upload-option, reliable, source-ip, certificate-verification.</li>
<li>Explain the severity filter and <code>forward-traffic</code>, and what each stops.</li>
<li>Read test-connectivity (Connection and Registration) and <code>diagnose test application miglogd 6</code> (mode, queued, lost).</li>
<li>List unregistered devices on FAZ-1, register a device into root, and say what happened to the logs sent before.</li>
<li>Check the result with <code>diagnose log device</code>, <code>diagnose device list</code> and Log View.</li>
<li>Follow the ordered workflow: logging on, address, path, identity, registration, real logs.</li>
<li>Say which actions are GUI in the real product and which names exist only in the simulator.</li>
</ol>

<h3>The module in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Module summary">
<rect x="10" y="30" width="140" height="60" rx="8" fill="#bae6fd"/><text x="80" y="56" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="80" y="76" text-anchor="middle" class="svg-muted" font-size="12">setting + filter</text>
<rect x="190" y="30" width="120" height="60" rx="8" fill="#fde68a"/><text x="250" y="56" text-anchor="middle" class="svg-ink" font-size="13">Connection</text><text x="250" y="76" text-anchor="middle" class="svg-muted" font-size="12">port 514</text>
<rect x="350" y="30" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="415" y="56" text-anchor="middle" class="svg-ink" font-size="13">FAZ-1</text><text x="415" y="76" text-anchor="middle" class="svg-muted" font-size="12">registered?</text>
<rect x="520" y="30" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="575" y="56" text-anchor="middle" class="svg-ink" font-size="13">Stored</text><text x="575" y="76" text-anchor="middle" class="svg-muted" font-size="12">Log View</text>
<line x1="150" y1="60" x2="190" y2="60" stroke="#64748b" stroke-width="2"/><line x1="310" y1="60" x2="350" y2="60" stroke="#64748b" stroke-width="2"/><line x1="480" y1="60" x2="520" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">no connection: queue on FortiGate. connected, not registered: discarded.</text>
</svg><p class="cap">Where logs wait, where they are discarded and where they are stored.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>OFTP</dt><dd>The protocol that carries logs from a FortiGate to a FortiAnalyzer, port 514.</dd>
<dt>UDP / reliable</dt><dd>Default log transport (no acknowledgement) versus <code>reliable enable</code> (TCP, acknowledged).</dd>
<dt>upload-option</dt><dd>realtime, 1-minute or 5-minute flush of the queue.</dd>
<dt>Registration</dt><dd>A device-table row holding the serial number of a FortiGate.</dd>
<dt>Unregistered</dt><dd>Connected, but without a device-table row; its logs are discarded and counted.</dd>
<dt>root</dt><dd>The built-in domain used when ADOMs are off.</dd>
<dt>test-connectivity</dt><dd>FortiGate command showing Connection and Registration.</dd>
<dt>miglogd 6</dt><dd>FortiGate diagnose showing mode, queued, sent and lost.</dd>
</dl>

<h3>The most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>Log port</td><td>514 (UDP by default, TCP with reliable)</td></tr>
<tr><td>Who starts the log connection</td><td>The FortiGate</td></tr>
<tr><td>Logs of an unregistered device</td><td>Discarded and counted, not stored, not queued</td></tr>
<tr><td>Logs sent before registration</td><td>Lost for good</td></tr>
<tr><td>Enable logging without a server</td><td>Refused: Attribute 'server' MUST be set.</td></tr>
<tr><td>Empty host fields in test-connectivity</td><td>No answer: address or path</td></tr>
<tr><td>Serial number mismatch</td><td>Identity problem; FortiGate queues logs</td></tr>
<tr><td>Where registration happens</td><td>On the FortiAnalyzer (GUI in the real product)</td></tr>
<tr><td>Domain with ADOMs off</td><td>root</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> A self-test. Madurai's analyst cannot find yesterday's logs. You run through the checklist: test-connectivity says Allow and unregistered (so the link is fine); the unregistered list on FAZ-1 shows MDU-FGT with a discarded counter of 120; you register it into root; new traffic from PC-MDU appears in Log View. Yesterday's 120 logs are gone and you report that honestly.</p></div>

<div class="warn"><p><b>Honest boundaries.</b> The simulator stands in for GUI actions with <code>execute fazui</code> commands. Licences, HA, log forwarding and firmware are theory. The overlap of this track with vendor administrator-level skills is partial and this is independent training; it does not prepare you for a vendor exam.</p></div>

<div class="exam"><p><b>Exam traps (last look).</b> Connected is not registered. Registered is not the same as logging (the policy and filter can still stop logs). Timeout and mismatch are different layers. Reliable means TCP. The FortiAnalyzer is never in the traffic path.</p></div>

<div class="scn"><h4>The handover note</h4><p>A senior engineer leaving a project wrote a four-line handover for the next person: the three server settings, the registration status of each FortiGate from the unregistered list, the result of diagnose log device on the day, and the statement that logs before the registration date do not exist. The next engineer had no questions on day one.</p><p><b>Lesson:</b> a good note names the evidence, not just the configuration.</p></div>

<div class="iv"><p class="q">"Summarise how logging from a FortiGate to a FortiAnalyzer works."</p><p>The FortiGate writes traffic, UTM and event logs, filters them, queues them and sends them over OFTP on port 514, UDP by default or TCP with reliable. The FortiAnalyzer stores the logs only for registered devices, identified by serial number; others are discarded and counted. I verify with test-connectivity, miglogd 6, the unregistered list, diagnose log device and Log View.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FortiGate side: setting and filter; FortiAnalyzer side: registration and storage.</li>
<li>Port 514; UDP by default; reliable enable means TCP.</li>
<li>Unregistered means discarded; earlier logs are gone for good.</li>
<li>Troubleshoot in order and test after every fix.</li>
<li>Know which names are real and which are simulator stand-ins.</li>
</ul></div>
`,hi:`
<p>Exam se pehle pilot poora manual dobara nahi padhta. Wo ek checklist chalata hai: wo thodi si cheezein jo bhool jao to sabse zyada pareshani hoti hai. Ye chapter FortiAnalyzer track ke pehle module ki wahi checklist hai. Neeche ka har item agar bina dekhe kar sako, to aap samajhte ho ki logs FortiGate se FortiAnalyzer tak kaise jate hain aur kabhi-kabhi kyun nahi pahunchte.</p>

<h3>Aap kya kar sakte ho</h3>
<ol>
<li>Do sentences mein samjhao ki logs FortiAnalyzer ko kyun bheje jate hain, aur FortiAnalyzer kya nahi karta (wo traffic path mein nahi hai aur kuch block nahi karta).</li>
<li>Teen log families (traffic, UTM, event) ke naam batao aur har ek ka ek example do.</li>
<li>Log flow draw karo: policy logging, filter, queue, port 514 par OFTP, registration check, storage.</li>
<li>status enable aur server ke saath <code>config log fortianalyzer setting</code> configure karo, aur baaki options jaano: serial, upload-option, reliable, source-ip, certificate-verification.</li>
<li>Severity filter aur <code>forward-traffic</code> samjhao, aur har ek kya rokta hai.</li>
<li>test-connectivity (Connection aur Registration) aur <code>diagnose test application miglogd 6</code> (mode, queued, lost) padho.</li>
<li>FAZ-1 par unregistered devices list karo, device ko root mein register karo, aur batao ki pehle bheje logs ka kya hua.</li>
<li>Result <code>diagnose log device</code>, <code>diagnose device list</code> aur Log View se check karo.</li>
<li>Ordered workflow follow karo: logging on, address, path, identity, registration, real logs.</li>
<li>Batao kaun se actions real product mein GUI hain aur kaun se names sirf simulator mein hain.</li>
</ol>

<h3>Module ek tasveer mein</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Module summary">
<rect x="10" y="30" width="140" height="60" rx="8" fill="#bae6fd"/><text x="80" y="56" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="80" y="76" text-anchor="middle" class="svg-muted" font-size="12">setting + filter</text>
<rect x="190" y="30" width="120" height="60" rx="8" fill="#fde68a"/><text x="250" y="56" text-anchor="middle" class="svg-ink" font-size="13">Connection</text><text x="250" y="76" text-anchor="middle" class="svg-muted" font-size="12">port 514</text>
<rect x="350" y="30" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="415" y="56" text-anchor="middle" class="svg-ink" font-size="13">FAZ-1</text><text x="415" y="76" text-anchor="middle" class="svg-muted" font-size="12">registered?</text>
<rect x="520" y="30" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="575" y="56" text-anchor="middle" class="svg-ink" font-size="13">Stored</text><text x="575" y="76" text-anchor="middle" class="svg-muted" font-size="12">Log View</text>
<line x1="150" y1="60" x2="190" y2="60" stroke="#64748b" stroke-width="2"/><line x1="310" y1="60" x2="350" y2="60" stroke="#64748b" stroke-width="2"/><line x1="480" y1="60" x2="520" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">connection nahi: FortiGate par queue. connected, registered nahi: discard.</text>
</svg><p class="cap">Logs kahan wait karte hain, kahan discard hote hain aur kahan store hote hain.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>OFTP</dt><dd>Wo protocol jo FortiGate se FortiAnalyzer tak logs le jata hai, port 514.</dd>
<dt>UDP / reliable</dt><dd>Default log transport (acknowledgement nahi) versus <code>reliable enable</code> (TCP, acknowledged).</dd>
<dt>upload-option</dt><dd>Queue ka realtime, 1-minute ya 5-minute flush.</dd>
<dt>Registration</dt><dd>Device-table row jisme FortiGate ka serial number hai.</dd>
<dt>Unregistered</dt><dd>Connected, par device-table row nahi; uske logs discard aur count hote hain.</dd>
<dt>root</dt><dd>ADOMs off hone par use hone wala built-in domain.</dd>
<dt>test-connectivity</dt><dd>FortiGate command jo Connection aur Registration dikhati hai.</dd>
<dt>miglogd 6</dt><dd>FortiGate diagnose jo mode, queued, sent aur lost dikhata hai.</dd>
</dl>

<h3>Sabse zyada poochhe jane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Jawab</th></tr>
<tr><td>Log port</td><td>514 (default UDP, reliable ke saath TCP)</td></tr>
<tr><td>Log connection kaun start karta hai</td><td>FortiGate</td></tr>
<tr><td>Unregistered device ke logs</td><td>Discard aur count, store nahi, queue nahi</td></tr>
<tr><td>Registration se pehle bheje logs</td><td>Hamesha ke liye lost</td></tr>
<tr><td>Server ke bina logging enable</td><td>Refuse: Attribute 'server' MUST be set.</td></tr>
<tr><td>test-connectivity mein khaali host fields</td><td>Jawab nahi: address ya path</td></tr>
<tr><td>Serial number mismatch</td><td>Identity problem; FortiGate logs queue karta hai</td></tr>
<tr><td>Registration kahan hoti hai</td><td>FortiAnalyzer par (real product mein GUI)</td></tr>
<tr><td>ADOMs off hon to domain</td><td>root</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Ek self-test. Madurai ka analyst kal ke logs nahi dhoondh pa raha. Aap checklist chalate ho: test-connectivity Allow aur unregistered kehta hai (matlab link theek); FAZ-1 ki unregistered list MDU-FGT ko 120 discarded counter ke saath dikhati hai; aap use root mein register karte ho; PC-MDU se naya traffic Log View mein dikhta hai. Kal ke 120 logs gaye aur aap ye imaandari se report karte ho.</p></div>

<div class="warn"><p><b>Honest boundaries.</b> Simulator GUI actions ki jagah <code>execute fazui</code> commands deta hai. Licences, HA, log forwarding aur firmware theory hain. Is track ka vendor administrator-level skills se overlap partial hai aur ye independent training hai; ye kisi vendor exam ki taiyari nahi karwati.</p></div>

<div class="exam"><p><b>Exam traps (aakhri nazar).</b> Connected registered nahi hai. Registered ka matlab logging nahi (policy aur filter ab bhi logs rok sakte hain). Timeout aur mismatch alag layers hain. Reliable matlab TCP. FortiAnalyzer kabhi traffic path mein nahi hota.</p></div>

<div class="scn"><h4>Handover note</h4><p>Project chhodte hue senior engineer ne agle insaan ke liye chaar line ka handover likha: teen server settings, unregistered list se har FortiGate ki registration status, us din diagnose log device ka result, aur ye statement ki registration date se pehle ke logs exist nahi karte. Agle engineer ke paas pehle din koi sawal nahi tha.</p><p><b>Lesson:</b> achha note sirf configuration nahi, evidence ka naam leta hai.</p></div>

<div class="iv"><p class="q">"FortiGate se FortiAnalyzer tak logging kaise kaam karti hai, summary mein batao."</p><p>FortiGate traffic, UTM aur event logs likhta hai, filter karta hai, queue karta hai aur port 514 par OFTP se bhejta hai, default UDP ya reliable ke saath TCP. FortiAnalyzer logs sirf registered devices ke store karta hai, jo serial number se pehchane jate hain; baaki discard aur count hote hain. Main test-connectivity, miglogd 6, unregistered list, diagnose log device aur Log View se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FortiGate side: setting aur filter; FortiAnalyzer side: registration aur storage.</li>
<li>Port 514; default UDP; reliable enable matlab TCP.</li>
<li>Unregistered matlab discard; pehle ke logs hamesha ke liye gaye.</li>
<li>Order mein troubleshoot karo aur har fix ke baad test karo.</li>
<li>Jaano kaun se names real hain aur kaun se simulator stand-ins.</li>
</ul></div>
`}};export{e as default};