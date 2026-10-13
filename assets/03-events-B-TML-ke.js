var e={id:`events`,h:{en:`Events: reading them and knowing what a handler can see`,hi:`Events: unhe padhna aur samajhna ki handler kya dekh sakta hai`},body:{en:`
<p>When a fire alarm rings, the panel in the lobby shows a line: which floor, which sensor, what time. That line is not the fire and it is not the fire brigade report. It is a pointer that tells a person where to look. An event on the FortiAnalyzer is that line. This chapter teaches you to read it and to understand the three situations where a handler is silent although traffic exists.</p>

<h3>Reading the event list</h3>
<p>Events belong to an ADOM, so you list them per ADOM. Here is a real list from the simulator after the handler deny-burst of chapter 2 saw six denied sessions from PC-HQ, three at a time.</p>
<pre class="out">FAZ-1 # execute fazui events root list
ID   SEVERITY  HANDLER             DEVICE            GROUP         LOGS  LAST LOG             STATUS
1    high      deny-burst          HQ-FGT            <span class="hl">10.10.0.10</span>    3     2026-10-12 20:47:06  <span class="hl">unhandled</span>
2    high      deny-burst          HQ-FGT            10.10.0.10    3     2026-10-12 20:48:02  unhandled</pre>
<table class="cmp"><tr><th>Column</th><th>What it tells you</th></tr>
<tr><td>ID</td><td>Number of the event inside the ADOM. You need it to open an incident.</td></tr>
<tr><td>SEVERITY</td><td>Copied from the handler.</td></tr>
<tr><td>HANDLER</td><td>Which rule fired. A wrong rule name here is the first thing to check when the volume is odd.</td></tr>
<tr><td>DEVICE</td><td>Which FortiGate sent the logs.</td></tr>
<tr><td>GROUP</td><td>The value of the group-by field, here the source IP. A star means the handler had no group-by.</td></tr>
<tr><td>LOGS</td><td>How many logs were counted. It is at least the threshold.</td></tr>
<tr><td>LAST LOG</td><td>The log time of the log that completed the pattern.</td></tr>
<tr><td>STATUS</td><td>unhandled until somebody opens an incident for it.</td></tr>
</table>
<p>Notice that six denied logs gave two events with three logs each, not one event with six. After an event the window is emptied (chapter 2), so counting starts again from zero.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Six logs make two events">
<rect x="30" y="30" width="26" height="26" rx="4" fill="#bae6fd"/><rect x="62" y="30" width="26" height="26" rx="4" fill="#bae6fd"/><rect x="94" y="30" width="26" height="26" rx="4" fill="#bae6fd"/>
<rect x="150" y="30" width="26" height="26" rx="4" fill="#bae6fd"/><rect x="182" y="30" width="26" height="26" rx="4" fill="#bae6fd"/><rect x="214" y="30" width="26" height="26" rx="4" fill="#bae6fd"/>
<rect x="30" y="76" width="90" height="30" rx="6" fill="#fde68a"/><text x="75" y="96" text-anchor="middle" class="svg-ink" font-size="12">Event 1</text>
<rect x="150" y="76" width="90" height="30" rx="6" fill="#fde68a"/><text x="195" y="96" text-anchor="middle" class="svg-ink" font-size="12">Event 2</text>
<text x="300" y="50" class="svg-ink" font-size="13">Six denied logs, threshold 3:</text>
<text x="300" y="72" class="svg-muted" font-size="12">window cleared after each event,</text>
<text x="300" y="92" class="svg-muted" font-size="12">so the count restarts from zero.</text>
<text x="30" y="140" class="svg-accent" font-size="12">An event is a pointer to logs, not a copy of them.</text>
</svg><p class="cap">Each event consumes the logs that made it.</p></div>

<h3>Three reasons a handler stays silent</h3>
<p><b>1. The handler is younger than the logs.</b> A handler evaluates logs when they are stored, in log-time order. It does not look back at logs that were already stored before it was created. There is no "re-run on old logs" in the simulator. If you create the handler after the traffic, you get nothing.</p>
<pre class="code"><span class="c">! traffic first, handler afterwards</span>
execute fazui handler create root deny-burst traffic action=deny group-by=srcip 3 5 high
execute fazui events root list</pre>
<pre class="out"><span class="hl">No events in ADOM root.</span></pre>
<p>The three denied logs from PC-HQ are in Log View, yet the list is empty. The fix is not a change of the handler: generate the pattern again, now that the handler exists.</p>

<p><b>2. The handler is disabled.</b> A handler has a status, enable or disable. A disabled handler raises nothing, and it still looks normal in the list except for one word.</p>
<pre class="out">NAME                TYPE     THRESHOLD             SEVERITY  STATUS   FILTER
deny-burst          traffic  3 in 5 min            high      <span class="hl">disable</span>  action=deny group-by=srcip</pre>
<p>You disable a handler with <code>set status disable</code> inside <code>config faz event-handler</code> and enable it again with <code>set status enable</code>.</p>

<p><b>3. The pattern does not match.</b> The filter looks for a value the logs never hold, the threshold is too high for the window, or the device and ADOM are wrong. Chapters 5 and 6 treat these in detail.</p>

<div class="eg"><p><b>Worked example.</b> At 20:46 PC-HQ is denied three times and the SOC lead creates the handler at 20:47. Nothing fires. At 20:48 PC-HQ is denied three more times and event 1 appears with LOGS 3 and the group 10.10.0.10. The first three logs were never counted, because they were stored before the handler existed.</p></div>

<h3>Predefined handlers and templates (theory)</h3>
<p>The real FortiAnalyzer ships with predefined handlers for common threats and can use handler templates, so a new unit is not empty. The simulator has none: every handler is created by you. Treat the predefined handlers of the real product as a starting point that must still be checked against your own network, because they filter on fields and values that your devices must actually produce.</p>

<div class="warn"><p><b>Common mistakes.</b> Creating the handler after the traffic and then concluding that the handler is broken; reading the LOGS column as the number of logs in the whole ADOM (it counts only the logs of that one event); forgetting that the events list is per ADOM, so an event of ADOM Retail does not appear in <code>events root list</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> A new event has the status <code>unhandled</code>. It does not become "resolved" by itself, and reading it does not change it. Only an incident (chapter 4) moves it on.</p></div>

<div class="scn"><h4>The handler that was created too late</h4><p>A SOC lead at Kaveri noticed a burst of denied sessions at 11:00 and created a handler at 11:10 to "check if it happens again". She waited an hour and saw no event, and told the manager that the burst had been a false alarm. The burst was real, but the handler could not see logs stored before 11:10.</p><p><b>Lesson:</b> a handler is a tripwire for the future. For the past, use Log View with the same filter.</p></div>

<div class="iv"><p class="q">"You created an event handler and there are matching logs, but no event. Why?"</p><p>First: was the handler created before those logs were stored? Handlers do not look back. Second: is it enabled? Third: do the filter, threshold and window match what the logs really hold? Say that you would confirm with Log View using the same filter.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An event shows ID, severity, handler, device, group, log count, last log time and status.</li>
<li>The window is emptied after an event, so six logs at threshold 3 give two events.</li>
<li>A handler sees only logs stored after it was created.</li>
<li>A disabled handler raises nothing; check the STATUS column of the handler list.</li>
<li>Predefined handlers and templates exist in the real product; the simulator has none.</li>
</ul></div>
`,hi:`
<p>Fire alarm bajne par lobby ke panel par ek line dikhti hai: kaun si floor, kaun sa sensor, kitne baje. Wo line aag nahi hai aur fire brigade ki report bhi nahi. Wo ek pointer hai jo insaan ko batata hai kahan dekhna hai. FortiAnalyzer ka event wahi line hai. Is chapter mein aap use padhna seekhoge, aur wo teen situations bhi jahan traffic hone par bhi handler chup rehta hai.</p>

<h3>Event list padhna</h3>
<p>Events ADOM ke hote hain, isliye unhe ADOM ke hisaab se list karte hain. Neeche simulator ki real list hai, jab chapter 2 ke handler deny-burst ne PC-HQ ke chhe denied sessions, teen-teen karke, dekhe.</p>
<pre class="out">FAZ-1 # execute fazui events root list
ID   SEVERITY  HANDLER             DEVICE            GROUP         LOGS  LAST LOG             STATUS
1    high      deny-burst          HQ-FGT            <span class="hl">10.10.0.10</span>    3     2026-10-12 20:47:06  <span class="hl">unhandled</span>
2    high      deny-burst          HQ-FGT            10.10.0.10    3     2026-10-12 20:48:02  unhandled</pre>
<table class="cmp"><tr><th>Column</th><th>Kya batata hai</th></tr>
<tr><td>ID</td><td>ADOM ke andar event ka number. Incident kholne ke liye ye chahiye.</td></tr>
<tr><td>SEVERITY</td><td>Handler se copy hoti hai.</td></tr>
<tr><td>HANDLER</td><td>Kaun sa rule fire hua. Volume ajeeb ho to sabse pehle yahi rule name check karo.</td></tr>
<tr><td>DEVICE</td><td>Kis FortiGate ne logs bheje.</td></tr>
<tr><td>GROUP</td><td>Group-by field ki value, yahan source IP. Star ka matlab handler mein group-by nahi tha.</td></tr>
<tr><td>LOGS</td><td>Kitne logs gine gaye. Ye kam se kam threshold ke barabar hota hai.</td></tr>
<tr><td>LAST LOG</td><td>Us log ka log time jisne pattern poora kiya.</td></tr>
<tr><td>STATUS</td><td>unhandled jab tak koi us ke liye incident na khole.</td></tr>
</table>
<p>Dhyaan do ki chhe denied logs se do events bane, teen-teen logs ke, ek event chhe logs ka nahi. Event ke baad window khaali ho jaati hai (chapter 2), isliye ginti zero se phir shuru hoti hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Chhe logs se do events">
<rect x="30" y="30" width="26" height="26" rx="4" fill="#bae6fd"/><rect x="62" y="30" width="26" height="26" rx="4" fill="#bae6fd"/><rect x="94" y="30" width="26" height="26" rx="4" fill="#bae6fd"/>
<rect x="150" y="30" width="26" height="26" rx="4" fill="#bae6fd"/><rect x="182" y="30" width="26" height="26" rx="4" fill="#bae6fd"/><rect x="214" y="30" width="26" height="26" rx="4" fill="#bae6fd"/>
<rect x="30" y="76" width="90" height="30" rx="6" fill="#fde68a"/><text x="75" y="96" text-anchor="middle" class="svg-ink" font-size="12">Event 1</text>
<rect x="150" y="76" width="90" height="30" rx="6" fill="#fde68a"/><text x="195" y="96" text-anchor="middle" class="svg-ink" font-size="12">Event 2</text>
<text x="300" y="50" class="svg-ink" font-size="13">Chhe denied logs, threshold 3:</text>
<text x="300" y="72" class="svg-muted" font-size="12">har event ke baad window clear,</text>
<text x="300" y="92" class="svg-muted" font-size="12">isliye ginti zero se restart hoti hai.</text>
<text x="30" y="140" class="svg-accent" font-size="12">Event logs ka pointer hai, unki copy nahi.</text>
</svg><p class="cap">Har event wo logs kha leta hai jinse wo bana.</p></div>

<h3>Handler chup rehne ke teen kaaran</h3>
<p><b>1. Handler logs se naya hai.</b> Handler logs ko tab evaluate karta hai jab wo store hote hain, log-time order mein. Jo logs handler banne se pehle store ho chuke hain unhe wo peeche jaakar nahi dekhta. Simulator mein "purane logs par re-run" nahi hai. Traffic ke baad handler banaoge to kuch nahi milega.</p>
<pre class="code"><span class="c">! pehle traffic, baad mein handler</span>
execute fazui handler create root deny-burst traffic action=deny group-by=srcip 3 5 high
execute fazui events root list</pre>
<pre class="out"><span class="hl">No events in ADOM root.</span></pre>
<p>PC-HQ ke teen denied logs Log View mein hain, phir bhi list khaali hai. Fix handler badalna nahi hai: ab handler maujood hai, pattern phir se generate karo.</p>

<p><b>2. Handler disabled hai.</b> Handler ka status enable ya disable hota hai. Disabled handler kuch raise nahi karta, aur list mein ek word ke alawa normal dikhta hai.</p>
<pre class="out">NAME                TYPE     THRESHOLD             SEVERITY  STATUS   FILTER
deny-burst          traffic  3 in 5 min            high      <span class="hl">disable</span>  action=deny group-by=srcip</pre>
<p>Handler ko <code>config faz event-handler</code> ke andar <code>set status disable</code> se disable aur <code>set status enable</code> se phir enable karte hain.</p>

<p><b>3. Pattern match nahi karta.</b> Filter aisi value dhoondta hai jo logs mein kabhi hoti hi nahi, threshold window ke hisaab se bahut zyada hai, ya device aur ADOM galat hain. Chapters 5 aur 6 ise detail mein dekhte hain.</p>

<div class="eg"><p><b>Worked example.</b> 20:46 par PC-HQ teen baar deny hota hai aur SOC lead 20:47 par handler banati hai. Kuch fire nahi hota. 20:48 par PC-HQ phir teen baar deny hota hai aur event 1 LOGS 3 aur group 10.10.0.10 ke saath aa jata hai. Pehle teen logs kabhi gine hi nahi gaye, kyunki wo handler banne se pehle store ho chuke the.</p></div>

<h3>Predefined handlers aur templates (theory)</h3>
<p>Real FortiAnalyzer common threats ke liye predefined handlers ke saath aata hai aur handler templates use kar sakta hai, taaki naya unit khaali na ho. Simulator mein koi nahi hai: har handler aap banate ho. Real product ke predefined handlers ko starting point maano jo aapke apne network par check hona chahiye, kyunki wo un fields aur values par filter karte hain jo aapke devices ko sach mein produce karni hongi.</p>

<div class="warn"><p><b>Common mistakes.</b> Traffic ke baad handler banana aur phir maan lena ki handler kharab hai; LOGS column ko poore ADOM ke logs ki sankhya samajhna (wo sirf us ek event ke logs ginta hai); bhoolna ki events list ADOM-wise hai, isliye ADOM Retail ka event <code>events root list</code> mein nahi aata.</p></div>

<div class="exam"><p><b>Exam trap.</b> Naya event <code>unhandled</code> status mein hota hai. Wo apne aap "resolved" nahi hota, aur padhne se badalta nahi. Sirf incident (chapter 4) use aage badhata hai.</p></div>

<div class="scn"><h4>Handler jo der se bana</h4><p>Kaveri ki SOC lead ne 11:00 par denied sessions ka burst dekha aur 11:10 par handler banaya "dekhne ke liye ki phir hota hai ya nahi". Ek ghanta intezaar kiya, koi event nahi dikha, aur manager ko bol diya ki burst false alarm tha. Burst real tha, par handler 11:10 se pehle store hue logs dekh nahi sakta tha.</p><p><b>Lesson:</b> handler future ka tripwire hai. Past ke liye wahi filter lagakar Log View use karo.</p></div>

<div class="iv"><p class="q">"Aapne event handler banaya, matching logs hain, par event nahi aaya. Kyun?"</p><p>Pehle: kya handler un logs ke store hone se pehle bana tha? Handler peeche nahi dekhta. Doosra: kya wo enabled hai? Teesra: kya filter, threshold aur window wahi hain jo logs mein sach mein hai? Bolo ki aap wahi filter Log View mein lagakar confirm karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Event mein ID, severity, handler, device, group, log count, last log time aur status dikhte hain.</li>
<li>Event ke baad window khaali hoti hai, isliye threshold 3 par chhe logs se do events bante hain.</li>
<li>Handler sirf wo logs dekhta hai jo uske banne ke baad store hue.</li>
<li>Disabled handler kuch raise nahi karta; handler list ka STATUS column check karo.</li>
<li>Predefined handlers aur templates real product mein hain; simulator mein nahi.</li>
</ul></div>
`}};export{e as default};