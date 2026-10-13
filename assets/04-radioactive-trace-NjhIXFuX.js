var e={id:`radioactive-trace`,h:{en:`Radioactive Trace: a flight recorder for one client`,hi:`Radioactive Trace: ek client ka flight recorder`},body:{en:`
<p>When a plane has an accident, investigators do not interview passengers; they read the flight recorder. <b>Radioactive Trace</b> (RA trace) is the flight recorder for one Wi-Fi client. You tell the controller "mark this MAC address as radioactive". From then on, every software process that touches that client writes detailed messages tagged with that MAC. When you stop, the controller collects only those messages into one file. No other client's data is mixed in, so it is safe to use on a busy production network.</p>

<h3>Why it exists</h3>
<p>Older controllers printed global debugs: every message of every client at once. That was slow and risky. The 9800 runs many software processes (for example <b>wncd</b>, which handles client state, and <b>smd</b>, which handles authentication sessions). A global debug would have to turn on all of them for all clients. RA trace uses a <b>condition</b> instead: a filter on a MAC address or an IP address, so only matching messages are recorded.</p>

<h3>The commands</h3>
<pre class="code"><span class="c">! start tracing a client (repeat for an AP radio MAC if needed)</span>
WLC1# debug wireless mac 0050.2fe9.9a01
<span class="c">! optional: more internal detail, and a 5 minute self-stop</span>
WLC1# debug wireless mac 0050.2fe9.9a01 internal monitor-time 300
<span class="c">! ... reproduce the problem now ...</span>
WLC1# no debug wireless mac 0050.2fe9.9a01
<span class="c">! read the result</span>
WLC1# show logging profile wireless filter mac 0050.2fe9.9a01
WLC1# show logging profile wireless internal filter mac 0050.2fe9.9a01 to-file LAPTOP1-GOOD.log</pre>
<dl class="terms">
<dt>debug wireless mac</dt><dd>Opens a trace condition for that MAC. Colon, dash and dotted forms are all accepted by the lab model. You can start it <b>before</b> the client connects; the MAC is all that is needed.</dd>
<dt>monitor-time</dt><dd>How many seconds the condition stays active (default 1800, that is 30 minutes; the allowed range is 1 to 2085978494). When it ends, the controller stops and writes the file itself. Use a short value in production so you cannot forget a condition.</dd>
<dt>internal</dt><dd>Adds internal-only lines. Normally TAC asks for it; use it when the standard lines do not explain the failure.</dd>
<dt>no debug wireless mac</dt><dd>Stops the condition and writes a file named like <code>ra_trace_MAC_0050.2fe9.9a01_171240.123_Oct_04_2026.log</code> into bootflash. If none is active, the lab prints a note, not an error.</dd>
<dt>show logging profile wireless</dt><dd>Prints the trace. Filters: <code>start last N second|minute|hour|day</code>, <code>filter mac</code>, <code>filter ipv4</code>, and <code>to-file name</code> to save the text.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Radioactive trace flow">
<rect x="20" y="20" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="42" text-anchor="middle" class="svg-ink" font-size="13">Condition</text><text x="80" y="58" text-anchor="middle" class="svg-muted" font-size="12">MAC or IP</text>
<rect x="175" y="20" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="245" y="42" text-anchor="middle" class="svg-ink" font-size="13">Processes log</text><text x="245" y="58" text-anchor="middle" class="svg-muted" font-size="12">wncd, smd, ...</text>
<rect x="350" y="20" width="120" height="50" rx="8" fill="#fde68a"/><text x="410" y="42" text-anchor="middle" class="svg-ink" font-size="13">Stop</text><text x="410" y="58" text-anchor="middle" class="svg-muted" font-size="12">or monitor-time</text>
<rect x="505" y="20" width="115" height="50" rx="8" fill="#fed7aa"/><text x="562" y="42" text-anchor="middle" class="svg-ink" font-size="13">File</text><text x="562" y="58" text-anchor="middle" class="svg-muted" font-size="12">bootflash</text>
<line x1="140" y1="45" x2="175" y2="45" stroke="#64748b" stroke-width="2"/><line x1="315" y1="45" x2="350" y2="45" stroke="#64748b" stroke-width="2"/><line x1="470" y1="45" x2="505" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="105" width="295" height="45" rx="8" fill="#e2e8f0"/><text x="322" y="132" text-anchor="middle" class="svg-ink" font-size="13">show logging profile wireless (read, filter, to-file)</text>
<line x1="562" y1="70" x2="562" y2="127" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="562" y1="127" x2="470" y2="127" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
</svg><p class="cap">From condition to evidence file. Everything between start and stop for that MAC ends up in the file.</p></div>

<h3>The web UI</h3>
<p>Go to <b>Troubleshooting &gt; Radioactive Trace</b>. Enter the client MAC, click <b>Start</b>, reproduce the problem, click <b>Stop</b>, then <b>Generate</b>. The page runs the same lines as above and lists the trace files so you can view or download them. The web UI trace list also shows any condition still active.</p>

<h3>Staged conditions and cleanup</h3>
<p>The platform also supports conditions in two steps. This matters when you need several MACs at once.</p>
<pre class="code">WLC1# debug platform condition feature wireless mac 0050.2fe9.9a01
WLC1# debug platform condition feature wireless mac 0050.32e9.9f01
WLC1# debug platform condition start
<span class="c">! ... reproduce ...</span>
WLC1# debug platform condition stop
WLC1# show platform conditions
WLC1# clear platform condition all
WLC1# dir bootflash:</pre>
<p><code>clear platform condition all</code> stops everything and writes the files. Always finish a session with <code>show platform conditions</code> to check nothing is left running, and <code>dir bootflash:</code> to see the files.</p>

<div class="eg"><p><b>Worked example.</b> At 17:12 LAPTOP1 cannot stay on NK-STAFF. You run <code>debug wireless mac 0050.2fe9.9a01</code>, ask the user to connect, wait ten seconds, then run <code>no debug wireless mac 0050.2fe9.9a01</code>. The controller writes <code>ra_trace_MAC_0050.2fe9.9a01_171257.457_Oct_04_2026.log</code>. <code>show logging profile wireless filter mac 0050.2fe9.9a01</code> prints about 25 lines; the single ERR line near the end already names the cause (chapter 7 walks this exact lab).</p></div>

<h3>Good habits</h3>
<ul>
<li><b>Start before, stop after.</b> A trace that starts after the failure contains nothing useful, except the always-on lines.</li>
<li><b>One failure per trace.</b> Reproduce once, stop, read. A trace with five attempts is harder to read.</li>
<li><b>Short monitor-time</b> in production.</li>
<li><b>Name your saved files</b>: <code>to-file LAPTOP1-before-fix.log</code>, then another after the fix.</li>
<li><b>Trace the right MAC.</b> Some clients use a private (randomised) MAC per SSID. Read the MAC from the client's Wi-Fi status for this SSID, not from the device label.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Leaving conditions active with a long monitor-time on dozens of MACs after a project. They consume resources and bootflash. Clear them.</p></div>
<div class="exam"><p><b>Exam trap.</b> RA trace is <b>per client (or per AP)</b>, filtered by MAC or IP, and written to a file on stop. It is not a global debug and it is not a packet capture: it records software messages, not packets on the wire.</p></div>

<div class="scn"><h4>The private MAC</h4><p>An engineer traced the MAC printed on a phone's sticker and got an empty file. The phone used a randomised per-network MAC. After reading the MAC from the phone's Wi-Fi details for NK-VOICE and tracing that one, the trace showed the failure in seconds.</p><p><b>Lesson:</b> an empty trace usually means the wrong MAC or a trace started too late, not a healthy client.</p></div>

<div class="iv"><p class="q">"What is Radioactive Trace and why is it safer than a debug?"</p><p>It is a conditional trace on a MAC or IP: only messages for that client, from all processes, are collected and saved to a file when you stop or when monitor-time expires. It does not flood the console or burden the CPU the way a global debug could. Mention always-on tracing and the internal option.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Radioactive Trace is a conditional, per-client (or per-AP) trace, filtered by MAC or IP.</li>
<li>Start with <code>debug wireless mac</code>, stop with <code>no debug wireless mac</code>; the file lands in bootflash.</li>
<li>Default monitor-time is 1800 s; use a short one in production.</li>
<li>Read with <code>show logging profile wireless</code>, save with <code>to-file</code>.</li>
<li>Always clear leftover conditions: <code>clear platform condition all</code>.</li>
</ul></div>
`,hi:`
<p>Plane ka accident hota hai to investigators passengers ka interview nahi lete; woh flight recorder padhte hain. <b>Radioactive Trace</b> (RA trace) ek Wi-Fi client ka flight recorder hai. Aap controller ko kehte ho "is MAC address ko radioactive mark karo". Us waqt se har software process jo us client ko chhoota hai us MAC ke tag ke saath detailed messages likhta hai. Stop karne par controller sirf wahi messages ek file mein jama karta hai. Kisi aur client ka data mix nahi hota, isliye busy production network par bhi safe hai.</p>

<h3>Yeh kyun hai</h3>
<p>Purane controllers global debugs print karte the: har client ka har message ek saath. Woh slow aur risky tha. 9800 kai software processes chalata hai (jaise <b>wncd</b>, jo client state sambhalta hai, aur <b>smd</b>, jo authentication sessions sambhalta hai). Global debug ko sab processes sab clients ke liye on karne padte. RA trace ek <b>condition</b> use karta hai: MAC address ya IP address par filter, jisse sirf matching messages record hote hain.</p>

<h3>Commands</h3>
<pre class="code"><span class="c">! client ko trace karna shuru karo (zaroorat ho to AP radio MAC ke liye bhi)</span>
WLC1# debug wireless mac 0050.2fe9.9a01
<span class="c">! optional: zyada internal detail, aur 5 minute mein self-stop</span>
WLC1# debug wireless mac 0050.2fe9.9a01 internal monitor-time 300
<span class="c">! ... ab problem reproduce karo ...</span>
WLC1# no debug wireless mac 0050.2fe9.9a01
<span class="c">! result padho</span>
WLC1# show logging profile wireless filter mac 0050.2fe9.9a01
WLC1# show logging profile wireless internal filter mac 0050.2fe9.9a01 to-file LAPTOP1-GOOD.log</pre>
<dl class="terms">
<dt>debug wireless mac</dt><dd>Us MAC ke liye trace condition kholta hai. Lab model colon, dash aur dotted teeno forms accept karta hai. Aap ise client ke connect hone se <b>pehle</b> bhi start kar sakte ho; sirf MAC chahiye.</dd>
<dt>monitor-time</dt><dd>Condition kitne second active rehti hai (default 1800, yaani 30 minute; allowed range 1 se 2085978494). Khatam hone par controller khud stop karke file likhta hai. Production mein chhoti value use karo taaki condition bhool na jao.</dd>
<dt>internal</dt><dd>Internal-only lines jodta hai. Aam taur par TAC maangta hai; tab use karo jab standard lines failure explain na karein.</dd>
<dt>no debug wireless mac</dt><dd>Condition stop karta hai aur bootflash mein <code>ra_trace_MAC_0050.2fe9.9a01_171240.123_Oct_04_2026.log</code> jaisi naam ki file likhta hai. Agar koi active nahi to lab note print karta hai, error nahi.</dd>
<dt>show logging profile wireless</dt><dd>Trace print karta hai. Filters: <code>start last N second|minute|hour|day</code>, <code>filter mac</code>, <code>filter ipv4</code>, aur text save karne ke liye <code>to-file name</code>.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Radioactive trace flow">
<rect x="20" y="20" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="42" text-anchor="middle" class="svg-ink" font-size="13">Condition</text><text x="80" y="58" text-anchor="middle" class="svg-muted" font-size="12">MAC ya IP</text>
<rect x="175" y="20" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="245" y="42" text-anchor="middle" class="svg-ink" font-size="13">Processes log</text><text x="245" y="58" text-anchor="middle" class="svg-muted" font-size="12">wncd, smd, ...</text>
<rect x="350" y="20" width="120" height="50" rx="8" fill="#fde68a"/><text x="410" y="42" text-anchor="middle" class="svg-ink" font-size="13">Stop</text><text x="410" y="58" text-anchor="middle" class="svg-muted" font-size="12">ya monitor-time</text>
<rect x="505" y="20" width="115" height="50" rx="8" fill="#fed7aa"/><text x="562" y="42" text-anchor="middle" class="svg-ink" font-size="13">File</text><text x="562" y="58" text-anchor="middle" class="svg-muted" font-size="12">bootflash</text>
<line x1="140" y1="45" x2="175" y2="45" stroke="#64748b" stroke-width="2"/><line x1="315" y1="45" x2="350" y2="45" stroke="#64748b" stroke-width="2"/><line x1="470" y1="45" x2="505" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="105" width="295" height="45" rx="8" fill="#e2e8f0"/><text x="322" y="132" text-anchor="middle" class="svg-ink" font-size="13">show logging profile wireless (padho, filter, to-file)</text>
<line x1="562" y1="70" x2="562" y2="127" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="562" y1="127" x2="470" y2="127" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
</svg><p class="cap">Condition se evidence file tak. Start aur stop ke beech us MAC ka sab kuch file mein aata hai.</p></div>

<h3>Web UI</h3>
<p><b>Troubleshooting &gt; Radioactive Trace</b> par jao. Client MAC daalo, <b>Start</b> click karo, problem reproduce karo, <b>Stop</b> click karo, phir <b>Generate</b>. Page wahi lines chalata hai jo upar hain aur trace files ki list dikhata hai taaki aap view ya download kar sako. Web UI ki trace list abhi active condition bhi dikhati hai.</p>

<h3>Staged conditions aur cleanup</h3>
<p>Platform conditions ko do steps mein bhi support karta hai. Jab ek saath kai MAC chahiye tab yeh kaam aata hai.</p>
<pre class="code">WLC1# debug platform condition feature wireless mac 0050.2fe9.9a01
WLC1# debug platform condition feature wireless mac 0050.32e9.9f01
WLC1# debug platform condition start
<span class="c">! ... reproduce ...</span>
WLC1# debug platform condition stop
WLC1# show platform conditions
WLC1# clear platform condition all
WLC1# dir bootflash:</pre>
<p><code>clear platform condition all</code> sab kuch stop karke files likhta hai. Session hamesha <code>show platform conditions</code> se khatam karo yeh check karne ke liye ki kuch chal to nahi raha, aur files dekhne ke liye <code>dir bootflash:</code>.</p>

<div class="eg"><p><b>Worked example.</b> 17:12 par LAPTOP1 NK-STAFF par tik nahi paata. Aap <code>debug wireless mac 0050.2fe9.9a01</code> chalate ho, user ko connect karne bolte ho, das second wait karte ho, phir <code>no debug wireless mac 0050.2fe9.9a01</code>. Controller <code>ra_trace_MAC_0050.2fe9.9a01_171257.457_Oct_04_2026.log</code> likhta hai. <code>show logging profile wireless filter mac 0050.2fe9.9a01</code> lagbhag 25 lines print karta hai; ant ke paas ek ERR line hi cause bata deti hai (chapter 7 isi lab ko walk karta hai).</p></div>

<h3>Achhi aadatein</h3>
<ul>
<li><b>Pehle start, baad mein stop.</b> Failure ke baad start kiya trace kaam ka kuch nahi rakhta, sivaay always-on lines ke.</li>
<li><b>Ek trace mein ek failure.</b> Ek baar reproduce, stop, padho. Paanch attempts wala trace padhna mushkil hai.</li>
<li>Production mein <b>chhota monitor-time</b>.</li>
<li><b>Saved files ko naam do</b>: <code>to-file LAPTOP1-before-fix.log</code>, phir fix ke baad doosri.</li>
<li><b>Sahi MAC trace karo.</b> Kuch clients har SSID ke liye private (randomised) MAC use karte hain. MAC client ke is SSID ke Wi-Fi status se padho, device ke label se nahi.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Project ke baad darjano MACs par lamba monitor-time ke saath conditions active chhod dena. Yeh resources aur bootflash khate hain. Unhe clear karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> RA trace <b>per client (ya per AP)</b> hai, MAC ya IP se filtered, aur stop par file mein likha jata hai. Yeh global debug nahi hai aur packet capture nahi hai: yeh software messages record karta hai, wire ke packets nahi.</p></div>

<div class="scn"><h4>Private MAC</h4><p>Ek engineer ne phone ke sticker par chhapa MAC trace kiya aur khali file mili. Phone randomised per-network MAC use karta tha. Phone ke Wi-Fi details se NK-VOICE ka MAC padhkar usse trace karne par trace ne seconds mein failure dikha diya.</p><p><b>Lesson:</b> khali trace ka matlab aam taur par galat MAC ya der se start hua trace hai, healthy client nahi.</p></div>

<div class="iv"><p class="q">"Radioactive Trace kya hai aur debug se safe kyun hai?"</p><p>Yeh MAC ya IP par conditional trace hai: sirf us client ke messages, sab processes se, jama hote hain aur stop karne par ya monitor-time expire hone par file mein save hote hain. Yeh console ko flood nahi karta aur CPU par utna bojh nahi daalta jitna global debug daal sakta hai. Always-on tracing aur internal option ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Radioactive Trace conditional, per-client (ya per-AP) trace hai, MAC ya IP se filtered.</li>
<li><code>debug wireless mac</code> se start, <code>no debug wireless mac</code> se stop; file bootflash mein aati hai.</li>
<li>Default monitor-time 1800 s hai; production mein chhota rakho.</li>
<li><code>show logging profile wireless</code> se padho, <code>to-file</code> se save karo.</li>
<li>Bachi conditions hamesha clear karo: <code>clear platform condition all</code>.</li>
</ul></div>
`}};export{e as default};