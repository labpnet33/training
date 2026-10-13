var e={id:`event-handlers`,h:{en:`Event handlers: filter, threshold, window and group-by`,hi:`Event handlers: filter, threshold, window aur group-by`},body:{en:`
<p>A smoke detector does not ring when it sees one grain of dust. It rings when the smoke in the room crosses a level. An event handler is the same idea for logs: it ignores single records and reacts when enough matching records pile up in a short time. To write a good handler you must understand its five parts.</p>

<h3>The parts of a handler</h3>
<table class="cmp"><tr><th>Part</th><th>Meaning</th><th>Example</th></tr>
<tr><td>ADOM and device</td><td>Which stored logs the handler may look at. The device is optional; without it the handler reads every device of the ADOM.</td><td>root, HQ-FGT</td></tr>
<tr><td>Log type</td><td>traffic, utm or event. A handler reads one type.</td><td>traffic</td></tr>
<tr><td>Filter</td><td>Conditions on log fields, written <code>field=value</code>. All conditions must match. A <code>*</code> inside a value is a wildcard.</td><td><code>action=deny</code></td></tr>
<tr><td>Threshold and window</td><td>How many matching logs (threshold) within how many minutes (window) raise an event.</td><td>3 logs in 5 minutes</td></tr>
<tr><td>Severity</td><td>low, medium, high or critical; it is copied to every event.</td><td>high</td></tr>
<tr><td>Group-by</td><td>Count separately per value of a field: none, srcip, dstip, devname, user or policyid.</td><td>srcip</td></tr>
</table>

<h3>The sliding window</h3>
<p>The handler does not count "logs per clock minute". It keeps, for each group, the times of the matching logs it has seen. When a new log arrives it forgets times that are older than the window and counts what is left. If the count reaches the threshold, an event is raised and the window for that group is emptied, so the next event needs a fresh set of logs.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Sliding window of five minutes">
<line x1="30" y1="60" x2="610" y2="60" stroke="#64748b" stroke-width="2"/>
<circle cx="70" cy="60" r="7" fill="#bae6fd"/><circle cx="130" cy="60" r="7" fill="#bae6fd"/><circle cx="190" cy="60" r="7" fill="#bae6fd"/>
<circle cx="400" cy="60" r="7" fill="#fed7aa"/><circle cx="500" cy="60" r="7" fill="#fed7aa"/><circle cx="590" cy="60" r="7" fill="#fed7aa"/>
<text x="70" y="40" text-anchor="middle" class="svg-muted" font-size="12">0</text><text x="130" y="40" text-anchor="middle" class="svg-muted" font-size="12">2</text><text x="190" y="40" text-anchor="middle" class="svg-muted" font-size="12">4</text>
<text x="400" y="40" text-anchor="middle" class="svg-muted" font-size="12">20</text><text x="500" y="40" text-anchor="middle" class="svg-muted" font-size="12">24</text><text x="590" y="40" text-anchor="middle" class="svg-muted" font-size="12">28</text>
<rect x="55" y="80" width="150" height="26" rx="6" fill="#bbf7d0"/><text x="130" y="98" text-anchor="middle" class="svg-ink" font-size="12">3 logs in 4 min: event</text>
<rect x="385" y="80" width="220" height="26" rx="6" fill="#fde68a"/><text x="495" y="98" text-anchor="middle" class="svg-ink" font-size="12">3 logs in 8 min: no event</text>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="13">Threshold 3, window 5 minutes. Minutes since the first log.</text>
<text x="320" y="174" text-anchor="middle" class="svg-muted" font-size="12">Logs further apart than the window never count together.</text>
</svg><p class="cap">Same number of logs, different spacing: only the left group fires.</p></div>

<div class="eg"><p><b>Worked example.</b> Handler: threshold 3, window 5 minutes. Matching logs arrive at minute 0, 2 and 4: when the third arrives the window holds all three (4 minutes wide), so an event is raised. Another source sends logs at minute 20, 24 and 28: when the third arrives the logs at 20 has already left the window (28 minus 20 is 8 minutes), so the count never reaches 3. Same traffic volume, no event. The spacing matters, not only the total.</p></div>

<h3>Group-by in one sentence</h3>
<p>With <code>group-by=srcip</code> the handler keeps one window for every source address. Three denied sessions from 10.10.0.10 count together, but one denied session from 10.10.0.10 and two from 10.20.0.10 do not add up to three. Without group-by, all matching logs share a single window, so three different PCs each denied once would also fire the handler.</p>

<h3>Creating a handler in the simulator</h3>
<p>The GUI form of the real product is replaced by one command. The last three words are always the threshold, the window in minutes and the severity.</p>
<pre class="code"><span class="c">! on FAZ-1 (stand-in for the GUI handler form)</span>
execute fazui handler create root deny-burst traffic action=deny group-by=srcip 3 5 high
execute fazui handler list root</pre>
<pre class="out">Event handler 'deny-burst' created in ADOM root: 3 traffic logs matching action=deny within 5 minutes raise a high event.

NAME                TYPE     THRESHOLD             SEVERITY  STATUS   FILTER
deny-burst          traffic  3 in 5 min            high      enable   <span class="hl">action=deny group-by=srcip</span></pre>
<p>The same handler is also stored as a configuration table, which you can read and edit, for example to disable it:</p>
<pre class="out">FAZ-1 # show faz event-handler
config faz event-handler
    edit "deny-burst"
        set filter "action=deny"
        set threshold 3
        set severity high
        set group-by srcip
    next
end</pre>
<p>Values with spaces go inside single quotes in the filter. A wrong severity is refused: <code>Handler not created: value parse error before 'urgent'</code>. The wizard-like usage line appears when you forget words.</p>

<div class="warn"><p><b>Common mistakes.</b> Swapping threshold and window (<code>5 3</code> instead of <code>3 5</code>); forgetting that no device means all devices of the ADOM; writing a filter in words ("blocked") instead of the value the logs hold (chapter 5); choosing a window so short that normal traffic can never fill it.</p></div>

<div class="exam"><p><b>Exam trap.</b> The threshold is a number of logs, the window a number of minutes. "3 in 5" is not "3 per clock minute for 5 minutes". Also, severity belongs to the handler, not to the logs: a high handler can read notice-level traffic logs.</p></div>

<div class="scn"><h4>The handler that counted two branches as one</h4><p>Kaveri's analyst created a handler with threshold 3 and no group-by to catch a PC that is repeatedly denied. One morning it fired even though no PC had been denied more than once: three different PCs had hit the same blocked page. All matching logs shared one window. Adding <code>group-by=srcip</code> made it count per PC and the false events stopped.</p><p><b>Lesson:</b> decide what "the same thing" means (same source, same destination, same user) and choose the group-by field for it.</p></div>

<div class="iv"><p class="q">"How does an event handler decide when to raise an event?"</p><p>It filters stored logs of one type, keeps a sliding window of matching log times per group, and raises an event when the window holds the threshold number of logs within the configured minutes. Then mention group-by, that the window is cleared after an event, and that the severity is set by the handler author.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A handler has an ADOM, an optional device, a log type, a filter, a threshold, a window, a severity and an optional group-by.</li>
<li>The window slides: logs further apart than the window never count together.</li>
<li>Group-by counts separately per value of a field such as srcip.</li>
<li>After an event the window of that group is emptied.</li>
<li>In the simulator the form is <code>execute fazui handler create</code>; the last three words are threshold, minutes, severity.</li>
</ul></div>
`,hi:`
<p>Smoke detector dhool ke ek kan ko dekh kar nahi bajta. Wo tab bajta hai jab kamre mein dhuan ek level paar kar jaye. Event handler logs ke liye wahi idea hai: wo akele records ko ignore karta hai aur tab react karta hai jab thode time mein kaafi matching records jama ho jayen. Achha handler likhne ke liye uske paanch parts samajhna zaroori hai.</p>

<h3>Handler ke parts</h3>
<table class="cmp"><tr><th>Part</th><th>Matlab</th><th>Example</th></tr>
<tr><td>ADOM aur device</td><td>Handler kaun se stored logs dekh sakta hai. Device optional hai; bina device ke handler ADOM ke saare devices padhta hai.</td><td>root, HQ-FGT</td></tr>
<tr><td>Log type</td><td>traffic, utm ya event. Handler ek hi type padhta hai.</td><td>traffic</td></tr>
<tr><td>Filter</td><td>Log fields par conditions, <code>field=value</code> ki tarah likhi jaati hain. Saari conditions match honi chahiye. Value ke andar <code>*</code> wildcard hai.</td><td><code>action=deny</code></td></tr>
<tr><td>Threshold aur window</td><td>Kitne matching logs (threshold) kitne minutes (window) mein aayen to event raise ho.</td><td>5 minute mein 3 logs</td></tr>
<tr><td>Severity</td><td>low, medium, high ya critical; ye har event mein copy hoti hai.</td><td>high</td></tr>
<tr><td>Group-by</td><td>Field ki har value ke liye alag count karo: none, srcip, dstip, devname, user ya policyid.</td><td>srcip</td></tr>
</table>

<h3>Sliding window</h3>
<p>Handler "clock ke har minute ke logs" nahi ginta. Wo har group ke liye matching logs ke times yaad rakhta hai. Naya log aane par wo window se purane times bhula deta hai aur jo bacha usse ginta hai. Agar count threshold tak pahunche to event raise hota hai aur us group ki window khaali ho jaati hai, isliye agle event ke liye naye logs chahiye.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Paanch minute ki sliding window">
<line x1="30" y1="60" x2="610" y2="60" stroke="#64748b" stroke-width="2"/>
<circle cx="70" cy="60" r="7" fill="#bae6fd"/><circle cx="130" cy="60" r="7" fill="#bae6fd"/><circle cx="190" cy="60" r="7" fill="#bae6fd"/>
<circle cx="400" cy="60" r="7" fill="#fed7aa"/><circle cx="500" cy="60" r="7" fill="#fed7aa"/><circle cx="590" cy="60" r="7" fill="#fed7aa"/>
<text x="70" y="40" text-anchor="middle" class="svg-muted" font-size="12">0</text><text x="130" y="40" text-anchor="middle" class="svg-muted" font-size="12">2</text><text x="190" y="40" text-anchor="middle" class="svg-muted" font-size="12">4</text>
<text x="400" y="40" text-anchor="middle" class="svg-muted" font-size="12">20</text><text x="500" y="40" text-anchor="middle" class="svg-muted" font-size="12">24</text><text x="590" y="40" text-anchor="middle" class="svg-muted" font-size="12">28</text>
<rect x="55" y="80" width="150" height="26" rx="6" fill="#bbf7d0"/><text x="130" y="98" text-anchor="middle" class="svg-ink" font-size="12">4 min mein 3 logs: event</text>
<rect x="385" y="80" width="220" height="26" rx="6" fill="#fde68a"/><text x="495" y="98" text-anchor="middle" class="svg-ink" font-size="12">8 min mein 3 logs: event nahi</text>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="13">Threshold 3, window 5 minute. Pehle log ke baad ke minutes.</text>
<text x="320" y="174" text-anchor="middle" class="svg-muted" font-size="12">Window se zyada door ke logs kabhi saath nahi gine jaate.</text>
</svg><p class="cap">Logs utne hi, spacing alag: sirf left wala group fire hota hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Handler: threshold 3, window 5 minute. Matching logs minute 0, 2 aur 4 par aate hain: teesra aane par window mein teeno hain (4 minute chaudi), isliye event raise hota hai. Doosra source minute 20, 24 aur 28 par logs bhejta hai: teesra aane par minute 20 wala log window se nikal chuka hai (28 minus 20 yaani 8 minute), isliye count 3 tak nahi pahunchta. Traffic volume same, event nahi. Spacing matter karti hai, sirf total nahi.</p></div>

<h3>Group-by ek sentence mein</h3>
<p><code>group-by=srcip</code> ke saath handler har source address ki alag window rakhta hai. 10.10.0.10 se teen denied sessions saath gine jaate hain, par 10.10.0.10 se ek aur 10.20.0.10 se do denied sessions milkar teen nahi bante. Group-by ke bina saare matching logs ek hi window share karte hain, isliye teen alag PCs ka ek-ek denied session bhi handler fire kar deta.</p>

<h3>Simulator mein handler banana</h3>
<p>Real product ka GUI form yahan ek command se replace hua hai. Aakhri teen words hamesha threshold, window (minutes mein) aur severity hote hain.</p>
<pre class="code"><span class="c">! on FAZ-1 (GUI handler form ka stand-in)</span>
execute fazui handler create root deny-burst traffic action=deny group-by=srcip 3 5 high
execute fazui handler list root</pre>
<pre class="out">Event handler 'deny-burst' created in ADOM root: 3 traffic logs matching action=deny within 5 minutes raise a high event.

NAME                TYPE     THRESHOLD             SEVERITY  STATUS   FILTER
deny-burst          traffic  3 in 5 min            high      enable   <span class="hl">action=deny group-by=srcip</span></pre>
<p>Wahi handler configuration table ki tarah bhi stored hota hai, jise aap padh aur edit kar sakte ho, jaise use disable karne ke liye:</p>
<pre class="out">FAZ-1 # show faz event-handler
config faz event-handler
    edit "deny-burst"
        set filter "action=deny"
        set threshold 3
        set severity high
        set group-by srcip
    next
end</pre>
<p>Spaces wali values filter mein single quotes ke andar jaati hain. Galat severity refuse hoti hai: <code>Handler not created: value parse error before 'urgent'</code>. Words bhool jao to usage line aati hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Threshold aur window ulta likhna (<code>3 5</code> ki jagah <code>5 3</code>); bhoolna ki device na do to ADOM ke saare devices; filter mein words ("blocked") likhna jabki logs mein jo value hai wo chahiye (chapter 5); itni chhoti window rakhna ki normal traffic usse kabhi bhar hi na sake.</p></div>

<div class="exam"><p><b>Exam trap.</b> Threshold logs ki sankhya hai, window minutes ki. "3 in 5" ka matlab "5 minute tak har clock minute mein 3" nahi hai. Severity handler ki hoti hai, logs ki nahi: high handler notice-level traffic logs bhi padh sakta hai.</p></div>

<div class="scn"><h4>Handler jisne do branches ko ek gina</h4><p>Kaveri ke analyst ne threshold 3 aur bina group-by ke handler banaya, taaki baar-baar denied hone wali PC pakdi ja sake. Ek subah wo fire hua jabki kisi PC ko ek se zyada baar deny nahi kiya gaya tha: teen alag PCs ne ek hi blocked page kholi thi. Saare matching logs ek window mein the. <code>group-by=srcip</code> jodne se wo PC ke hisaab se ginne laga aur false events band ho gaye.</p><p><b>Lesson:</b> pehle tay karo ki "wahi cheez" ka matlab kya hai (same source, same destination, same user) aur uske liye group-by field chuno.</p></div>

<div class="iv"><p class="q">"Event handler event kab raise karna hai ye kaise decide karta hai?"</p><p>Wo ek type ke stored logs filter karta hai, har group ke liye matching log times ki sliding window rakhta hai, aur jab window mein configured minutes ke andar threshold jitne logs ho jayen to event raise karta hai. Phir group-by, event ke baad window ka clear hona, aur severity handler author set karta hai ye mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Handler mein ADOM, optional device, log type, filter, threshold, window, severity aur optional group-by hote hain.</li>
<li>Window slide karti hai: window se zyada door ke logs kabhi saath nahi gine jaate.</li>
<li>Group-by field ki har value (jaise srcip) ke liye alag count karta hai.</li>
<li>Event ke baad us group ki window khaali ho jaati hai.</li>
<li>Simulator mein form <code>execute fazui handler create</code> hai; aakhri teen words threshold, minutes, severity hain.</li>
</ul></div>
`}};export{e as default};