var e={id:`per-firewall-validation`,h:{en:`Per-firewall validation, partial success and reading failures`,hi:`Per-firewall validation, partial success aur failures padhna`},body:{en:`
<p>A push to ten firewalls is not one decision; it is ten independent decisions. Each firewall checks the configuration it receives against its own state. Some pass, some fail. Learning to read that result table is the core troubleshooting skill of this module.</p>

<h3>Analogy: ten schools, one circular</h3>
<p>The education board sends the same circular to ten schools. Each school checks it against its own timetable. Nine accept it. One school replies "clashes with our exam week". The board does not cancel the nine; it fixes the tenth. A Panorama push behaves the same way.</p>

<h3>What each firewall checks</h3>
<ul>
<li>Every zone, interface and profile referenced by a rule exists on that firewall.</li>
<li>Rule and object names do not clash with local configuration.</li>
<li>Template variables resolve to a value for that firewall.</li>
<li>Values are of the right type.</li>
</ul>
<p>A firewall that fails <b>keeps its previous running configuration</b>. Failure never leaves a firewall half-configured. Firewalls that pass commit the new configuration; the push ends as "completed with errors" and the failing firewalls stay Out of Sync.</p>

<h3>Reading the result table</h3>
<pre class="out">Serial            Hostname          Result
0079185321121     NK-PUNE-PA        commit succeeded (device group NK-BRANCHES)
0079134988264     NK-DELHI-PA       <span class="hl">commit failed</span>: rulebase -&gt; security -&gt; rules -&gt; Allow-Web-Out is already in use by a local rule: rename one of them
0079151765883     NK-CHENNAI-PA     <span class="hl">commit failed</span>: rulebase -&gt; security -&gt; rules -&gt; Allow-Web-Out from 'trust' is not a valid reference

Push to shared-policy NK-BRANCHES completed with errors</pre>
<table class="tbl">
<tr><th>Message pattern</th><th>Meaning</th><th>Where to fix</th></tr>
<tr><td>is not a valid reference</td><td>Missing zone, interface or profile on that firewall</td><td>Deliver the dependency (template push)</td></tr>
<tr><td>already in use by a local rule</td><td>Name clash with a rule configured locally</td><td>Rename one of them (chapter 8)</td></tr>
<tr><td>variable ... has no value for this firewall</td><td>Unresolved template variable</td><td>Set the value in the stack or on the stack device entry</td></tr>
</table>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Partial success">
<rect x="20" y="20" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="50" text-anchor="middle" class="svg-ink" font-size="12">Panorama push</text>
<rect x="260" y="8" width="170" height="34" rx="8" fill="#bbf7d0"/><text x="345" y="30" text-anchor="middle" class="svg-ink" font-size="12">Pune: succeeded</text>
<rect x="260" y="48" width="170" height="34" rx="8" fill="#fde68a"/><text x="345" y="70" text-anchor="middle" class="svg-ink" font-size="12">Delhi: failed, unchanged</text>
<rect x="260" y="88" width="170" height="34" rx="8" fill="#fde68a"/><text x="345" y="110" text-anchor="middle" class="svg-ink" font-size="12">Chennai: failed, unchanged</text>
<line x1="140" y1="45" x2="260" y2="25" stroke="#64748b" stroke-width="2"/><line x1="140" y1="45" x2="260" y2="65" stroke="#64748b" stroke-width="2"/><line x1="140" y1="45" x2="260" y2="105" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Each firewall decides alone. Failed ones keep their old configuration.</p></div>

<h3>A method for failures</h3>
<ol>
<li>Note which firewalls failed and which succeeded; compare what differs (template received, local rules, variables).</li>
<li>Read the first words of each message to classify it with the table.</li>
<li>Fix on the right side (Panorama or the firewall), commit where needed, and run validate-only.</li>
<li>Push for real and re-check with show devices all.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Re-pushing the same configuration again and again hoping for success; treating "completed with errors" as a Panorama fault; fixing only the first error when a firewall has several.</p></div>
<div class="exam"><p><b>Exam trap.</b> Partial success is normal. A failed firewall is not broken: it simply stays on its previous configuration.</p></div>

<div class="scn"><h4>Two red lines out of three</h4><p>After a Friday push the result showed Pune green, Delhi and Chennai red, each for a different reason. The engineer classified the messages: one clash, one missing dependency. Two small fixes and a validate-only run later, all three were green. Re-pushing without reading would have repeated both failures.</p><p><b>Lesson:</b> classify the message, then fix the cause.</p></div>

<div class="iv"><p class="q">"A push shows one firewall green and one red. What now?"</p><p>The green one is applied and the red one is unchanged. I read the red message, fix its cause, validate-only, then push again, and confirm both show In Sync.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Each firewall validates independently.</li>
<li>A failing firewall keeps its previous configuration.</li>
<li>Classify the message before you act.</li>
<li>Fix, validate-only, push, verify.</li>
</ul></div>
`,hi:`
<p>Das firewalls ko push ek decision nahi hai; wo das independent decisions hain. Har firewall mile hue configuration ko apni state ke saath check karta hai. Kuch pass, kuch fail. Us result table ko padhna seekhna is module ki core troubleshooting skill hai.</p>

<h3>Analogy: das schools, ek circular</h3>
<p>Education board das schools ko ek hi circular bhejta hai. Har school use apni timetable se check karta hai. Nau accept karte hain. Ek school jawab deta hai "hamare exam week se clash karta hai". Board nau ko cancel nahi karta; dasve ko fix karta hai. Panorama push bhi aise hi behave karta hai.</p>

<h3>Har firewall kya check karta hai</h3>
<ul>
<li>Rule mein referenced har zone, interface aur profile us firewall par exist karta hai.</li>
<li>Rule aur object names local configuration se clash nahi karte.</li>
<li>Template variables us firewall ke liye value resolve karte hain.</li>
<li>Values sahi type ki hain.</li>
</ul>
<p>Jo firewall fail hota hai wo <b>apni pichhli running configuration rakhta hai</b>. Failure kabhi firewall ko aadha-configured nahi chhodta. Jo pass hote hain wo nayi configuration commit karte hain; push "completed with errors" par khatam hota hai aur failing firewalls Out of Sync rehte hain.</p>

<h3>Result table padhna</h3>
<pre class="out">Serial            Hostname          Result
0079185321121     NK-PUNE-PA        commit succeeded (device group NK-BRANCHES)
0079134988264     NK-DELHI-PA       <span class="hl">commit failed</span>: rulebase -&gt; security -&gt; rules -&gt; Allow-Web-Out is already in use by a local rule: rename one of them
0079151765883     NK-CHENNAI-PA     <span class="hl">commit failed</span>: rulebase -&gt; security -&gt; rules -&gt; Allow-Web-Out from 'trust' is not a valid reference

Push to shared-policy NK-BRANCHES completed with errors</pre>
<table class="tbl">
<tr><th>Message pattern</th><th>Matlab</th><th>Fix kahan</th></tr>
<tr><td>is not a valid reference</td><td>Us firewall par zone, interface ya profile missing</td><td>Dependency deliver karo (template push)</td></tr>
<tr><td>already in use by a local rule</td><td>Local rule ke saath name clash</td><td>Ek ka naam badlo (chapter 8)</td></tr>
<tr><td>variable ... has no value for this firewall</td><td>Unresolved template variable</td><td>Stack mein ya stack device entry par value set karo</td></tr>
</table>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Partial success">
<rect x="20" y="20" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="50" text-anchor="middle" class="svg-ink" font-size="12">Panorama push</text>
<rect x="260" y="8" width="170" height="34" rx="8" fill="#bbf7d0"/><text x="345" y="30" text-anchor="middle" class="svg-ink" font-size="12">Pune: succeeded</text>
<rect x="260" y="48" width="170" height="34" rx="8" fill="#fde68a"/><text x="345" y="70" text-anchor="middle" class="svg-ink" font-size="12">Delhi: failed, unchanged</text>
<rect x="260" y="88" width="170" height="34" rx="8" fill="#fde68a"/><text x="345" y="110" text-anchor="middle" class="svg-ink" font-size="12">Chennai: failed, unchanged</text>
<line x1="140" y1="45" x2="260" y2="25" stroke="#64748b" stroke-width="2"/><line x1="140" y1="45" x2="260" y2="65" stroke="#64748b" stroke-width="2"/><line x1="140" y1="45" x2="260" y2="105" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Har firewall akela decide karta hai. Failed wale purani configuration rakhte hain.</p></div>

<h3>Failures ke liye method</h3>
<ol>
<li>Note karo kaunse firewalls fail aur kaunse succeed hue; compare karo kya alag hai (template mila, local rules, variables).</li>
<li>Har message ke pehle shabd padhke table se classify karo.</li>
<li>Sahi side par fix karo (Panorama ya firewall), jahan zaroori ho commit karo, aur validate-only chalao.</li>
<li>Asli push karo aur show devices all se dobara check karo.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Wahi configuration baar baar re-push karna is ummeed mein ki succeed ho jaye; "completed with errors" ko Panorama fault samajhna; ek firewall par kai errors hon to sirf pehli fix karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Partial success normal hai. Failed firewall toota hua nahi hai: wo bas apni pichhli configuration par rehta hai.</p></div>

<div class="scn"><h4>Teen mein se do red lines</h4><p>Friday push ke baad result mein Pune green, Delhi aur Chennai red the, har ek alag wajah se. Engineer ne messages classify kiye: ek clash, ek missing dependency. Do chhote fixes aur ek validate-only run ke baad teeno green the. Bina padhe re-push karne se dono failures repeat hote.</p><p><b>Lesson:</b> message classify karo, phir cause fix karo.</p></div>

<div class="iv"><p class="q">"Push mein ek firewall green aur ek red hai. Ab kya?"</p><p>Green wala apply ho chuka hai aur red wala unchanged hai. Red message padhta hoon, uska cause fix karta hoon, validate-only, phir dobara push, aur confirm karta hoon ki dono In Sync dikhein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har firewall independently validate karta hai.</li>
<li>Failing firewall apni pichhli configuration rakhta hai.</li>
<li>Act karne se pehle message classify karo.</li>
<li>Fix, validate-only, push, verify.</li>
</ul></div>
`}};export{e as default};