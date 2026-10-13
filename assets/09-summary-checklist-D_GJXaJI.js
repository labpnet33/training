var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a long train journey you run through a small list: ticket, water, charger, ID. You do not rely on feeling that "I packed everything". This chapter is that list for ADOMs, storage and retention. Go through it slowly; if an item feels shaky, return to the chapter named next to it.</p>

<h3>The module in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="From FortiGate to ADOM storage">
<rect x="10" y="60" width="130" height="70" rx="8" fill="#fde68a"/><text x="75" y="88" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="75" y="108" text-anchor="middle" class="svg-muted" font-size="12">logtraffic + filter</text>
<rect x="180" y="60" width="130" height="70" rx="8" fill="#bae6fd"/><text x="245" y="88" text-anchor="middle" class="svg-ink" font-size="13">Registration</text><text x="245" y="108" text-anchor="middle" class="svg-muted" font-size="12">serial in one ADOM</text>
<rect x="350" y="20" width="130" height="70" rx="8" fill="#bbf7d0"/><text x="415" y="48" text-anchor="middle" class="svg-ink" font-size="13">Analytics</text><text x="415" y="68" text-anchor="middle" class="svg-muted" font-size="12">searchable</text>
<rect x="350" y="110" width="130" height="70" rx="8" fill="#ddd6fe"/><text x="415" y="138" text-anchor="middle" class="svg-ink" font-size="13">Archive</text><text x="415" y="158" text-anchor="middle" class="svg-muted" font-size="12">evidence only</text>
<rect x="520" y="60" width="110" height="70" rx="8" fill="#fed7aa"/><text x="575" y="88" text-anchor="middle" class="svg-ink" font-size="13">Quota</text><text x="575" y="108" text-anchor="middle" class="svg-muted" font-size="12">overwrite / drop</text>
<line x1="140" y1="95" x2="180" y2="95" stroke="#64748b" stroke-width="2"/><line x1="310" y1="95" x2="350" y2="55" stroke="#64748b" stroke-width="2"/><line x1="310" y1="95" x2="350" y2="145" stroke="#64748b" stroke-width="2"/><line x1="480" y1="55" x2="520" y2="95" stroke="#64748b" stroke-width="2"/><line x1="480" y1="145" x2="520" y2="95" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">A log must be created, forwarded, registered, placed in an ADOM and then fit the quota and the clock.</p></div>

<h3>Checklist: can you do these?</h3>
<ul>
<li>Explain why a company uses ADOMs and name the three rules: one device in one ADOM, root always exists, storage settings are per ADOM. (chapter 1)</li>
<li>Enable ADOM mode, create an ADOM with a version, register a device and read <code>diagnose dvm adom list</code>. (chapter 2)</li>
<li>State the version rule and read the message when it fails. (chapter 2)</li>
<li>Move a device by deleting its entry and registering it again, and say what happens to logs in the gap and to old logs. (chapter 2)</li>
<li>Choose ADOMs by audience, retention, firmware generation and report scope, and name them sensibly. (chapter 3)</li>
<li>Read <code>execute fazui storage</code>: quota, retention, logs stored, received, overwritten, rejected. (chapter 4)</li>
<li>Set quota and retention per ADOM and choose overwrite or drop with a reason. (chapters 4 and 6)</li>
<li>Estimate disk from logs per day, average size and days. (chapter 4)</li>
<li>Diagnose "registered and connected but no logs": logtraffic, forward-traffic, severity, sent counters. (chapter 5)</li>
<li>Describe, as theory, forwarding, collector and analyzer modes, HA and the Security Fabric ADOM. (chapters 3 and 6)</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ADOM</dt><dd>Administrative domain: a container for devices and their logs, with its own quota and retention.</dd>
<dt>root</dt><dd>The built-in ADOM; the only one while ADOM mode is off.</dd>
<dt>Version rule</dt><dd>The ADOM version must equal the firmware version of its devices.</dd>
<dt>Analytics logs</dt><dd>Recent, searchable logs used by Log View and reports.</dd>
<dt>Archive logs</dt><dd>Older, compressed, not searchable; kept as evidence until their retention ends.</dd>
<dt>Quota</dt><dd>Maximum disk space of an ADOM.</dd>
<dt>Overwrite / drop</dt><dd>What happens when the quota is full: delete the oldest, or refuse the newest.</dd>
<dt>logtraffic</dt><dd>Policy setting on the FortiGate: disable, utm or all (default utm).</dd>
<dt>Log filter</dt><dd>FortiGate setting for what is forwarded to the FortiAnalyzer: forward-traffic and severity.</dd>
</dl>

<h3>The most tested facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>Which ADOM exists from the start?</td><td>root</td></tr>
<tr><td>How many ADOMs can hold one device?</td><td>One</td></tr>
<tr><td>What must the ADOM version equal?</td><td>The device firmware version</td></tr>
<tr><td>Simulator default retention</td><td>Analytics 60 days, archive 365 days</td></tr>
<tr><td>Simulator default quota and policy</td><td>1000 MB, overwrite</td></tr>
<tr><td>Where do old analytics logs go?</td><td>The archive, then deletion</td></tr>
<tr><td>Is the archive searchable?</td><td>No</td></tr>
<tr><td>Default of logtraffic</td><td>utm (hidden by <code>show</code>)</td></tr>
<tr><td>Severity level of traffic logs</td><td>notice (a filter of warning stops them)</td></tr>
<tr><td>Logs sent before registration</td><td>Discarded, not recoverable</td></tr>
</table>

<div class="note"><p><b>Real product versus simulator.</b> In the real product ADOMs, registration, storage views and retention are GUI pages. The simulator shows them as <code>execute fazui register</code>, <code>execute fazui storage</code>, <code>config system log quota</code> and <code>config system log settings</code>; these names do not exist on a real FortiAnalyzer. The FortiGate commands (<code>config log fortianalyzer setting</code> and <code>filter</code>, <code>config firewall policy</code>, <code>diagnose test application miglogd 6</code>) use real names. Sizes (700 bytes per log, 1000 MB default quota, archive at a quarter of the size) are stand-ins, and retention aging cannot be watched in a lab. This module overlaps with vendor administrator-level skills, but it is independent training and does not prepare you for any exam.</p></div>

<div class="eg"><p><b>Worked example: revision drill.</b> A ticket says "branch logs are missing for the Retail ADOM". Order your checks: (1) is the device registered and in which ADOM, (2) is the FortiGate sending (sent counters), (3) policy logtraffic, (4) filter severity and forward-traffic, (5) quota Overwritten and Rejected counters, (6) Log View asked in the right ADOM with the right type. Say the order aloud twice.</p></div>

<div class="warn"><p><b>Common mistakes to avoid on the day.</b> Mixing up retention (time) and quota (size). Saying that archive logs are searchable. Forgetting that the fix of a logging setting applies only to new logs. Claiming that an ADOM changes forwarding of user traffic.</p></div>

<div class="exam"><p><b>Exam traps recap.</b> Version equals device firmware. Moves leave old logs behind. Overwrite is the default. A short <code>show</code> hides defaults. Registered and connected is not the same as logging.</p></div>

<div class="scn"><h4>The handover note that saved a weekend</h4><p>A night-shift engineer handed over a short note: "Retail ADOM, quota 500 MB, 30 and 180 days, overwrite, check Overwritten every Monday, MDU filter is information, HQ policy 1 logtraffic all." On Saturday a colleague who had never seen the unit found Overwritten rising within ten minutes, because the note told him what normal looked like.</p><p><b>Lesson:</b> write down the settings and what "healthy" looks like; the next person will thank you.</p></div>

<div class="iv"><p class="q">"Summarise ADOMs and retention in one minute."</p><p>ADOMs separate devices, logs and administrators; a device is in exactly one, versions must match, and root always exists. Storage is per ADOM: analytics for search, archive for evidence, retention in days and a quota in size, with overwrite or drop when full. If logs are missing, I follow the path: registration, policy logtraffic, filter, counters, then Log View.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ADOMs: one device, one ADOM; version equals firmware; root always exists.</li>
<li>Storage settings are per ADOM: quota, analytics days, archive days, overwrite or drop.</li>
<li>Sizing is arithmetic: logs per day x average size x days, archive at a fraction.</li>
<li>No logs? Follow the log path from the FortiGate counters to Log View.</li>
<li>Know what is real in the simulator and what is theory: aging, forwarding, HA, Fabric ADOM.</li>
</ul></div>
`,hi:`
<p>Lambi train journey se pehle aap ek chhoti list dekhte ho: ticket, paani, charger, ID. Aap "mujhe lagta hai sab rakh liya" ke ehsaas par bharosa nahi karte. Ye chapter ADOMs, storage aur retention ki wahi list hai. Ise dheere dheere dekho; koi item kamzor lage to saath likhe chapter par wapas jao.</p>

<h3>Module ek picture mein</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="FortiGate se ADOM storage tak">
<rect x="10" y="60" width="130" height="70" rx="8" fill="#fde68a"/><text x="75" y="88" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="75" y="108" text-anchor="middle" class="svg-muted" font-size="12">logtraffic + filter</text>
<rect x="180" y="60" width="130" height="70" rx="8" fill="#bae6fd"/><text x="245" y="88" text-anchor="middle" class="svg-ink" font-size="13">Registration</text><text x="245" y="108" text-anchor="middle" class="svg-muted" font-size="12">serial ek ADOM mein</text>
<rect x="350" y="20" width="130" height="70" rx="8" fill="#bbf7d0"/><text x="415" y="48" text-anchor="middle" class="svg-ink" font-size="13">Analytics</text><text x="415" y="68" text-anchor="middle" class="svg-muted" font-size="12">searchable</text>
<rect x="350" y="110" width="130" height="70" rx="8" fill="#ddd6fe"/><text x="415" y="138" text-anchor="middle" class="svg-ink" font-size="13">Archive</text><text x="415" y="158" text-anchor="middle" class="svg-muted" font-size="12">sirf evidence</text>
<rect x="520" y="60" width="110" height="70" rx="8" fill="#fed7aa"/><text x="575" y="88" text-anchor="middle" class="svg-ink" font-size="13">Quota</text><text x="575" y="108" text-anchor="middle" class="svg-muted" font-size="12">overwrite / drop</text>
<line x1="140" y1="95" x2="180" y2="95" stroke="#64748b" stroke-width="2"/><line x1="310" y1="95" x2="350" y2="55" stroke="#64748b" stroke-width="2"/><line x1="310" y1="95" x2="350" y2="145" stroke="#64748b" stroke-width="2"/><line x1="480" y1="55" x2="520" y2="95" stroke="#64748b" stroke-width="2"/><line x1="480" y1="145" x2="520" y2="95" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Log bane, forward ho, registered ho, ADOM mein jaye, phir quota aur clock mein fit ho.</p></div>

<h3>Checklist: kya aap ye kar sakte ho?</h3>
<ul>
<li>Samjhao ki company ADOMs kyun use karti hai aur teen rules batao: ek device ek ADOM, root hamesha hota hai, storage settings per ADOM. (chapter 1)</li>
<li>ADOM mode enable karo, version ke saath ADOM banao, device register karo aur <code>diagnose dvm adom list</code> padho. (chapter 2)</li>
<li>Version rule batao aur fail hone par message padho. (chapter 2)</li>
<li>Device ko entry delete karke aur dobara register karke move karo, aur batao gap ke logs aur purane logs ka kya hota hai. (chapter 2)</li>
<li>ADOMs audience, retention, firmware generation aur report scope se chuno, aur sahi naam do. (chapter 3)</li>
<li><code>execute fazui storage</code> padho: quota, retention, logs stored, received, overwritten, rejected. (chapter 4)</li>
<li>Per ADOM quota aur retention set karo aur wajah ke saath overwrite ya drop chuno. (chapters 4 aur 6)</li>
<li>Logs per day, average size aur days se disk estimate karo. (chapter 4)</li>
<li>"Registered aur connected par logs nahi" diagnose karo: logtraffic, forward-traffic, severity, sent counters. (chapter 5)</li>
<li>Theory ke roop mein forwarding, collector aur analyzer modes, HA aur Security Fabric ADOM batao. (chapters 3 aur 6)</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ADOM</dt><dd>Administrative domain: devices aur unke logs ka container, apne quota aur retention ke saath.</dd>
<dt>root</dt><dd>Built-in ADOM; ADOM mode off ho to akela wahi hota hai.</dd>
<dt>Version rule</dt><dd>ADOM version uske devices ke firmware version ke barabar hona chahiye.</dd>
<dt>Analytics logs</dt><dd>Recent, searchable logs jo Log View aur reports use karte hain.</dd>
<dt>Archive logs</dt><dd>Purane, compressed, searchable nahi; retention khatam hone tak evidence ke liye rakhe jate hain.</dd>
<dt>Quota</dt><dd>ADOM ki maximum disk space.</dd>
<dt>Overwrite / drop</dt><dd>Quota full hone par kya hota hai: sabse purana delete, ya sabse naya refuse.</dd>
<dt>logtraffic</dt><dd>FortiGate par policy setting: disable, utm ya all (default utm).</dd>
<dt>Log filter</dt><dd>FortiAnalyzer ko kya forward hoga uski FortiGate setting: forward-traffic aur severity.</dd>
</dl>

<h3>Sabse zyada poochhe jane wale facts</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Jawab</th></tr>
<tr><td>Shuru se kaun sa ADOM exist karta hai?</td><td>root</td></tr>
<tr><td>Ek device kitne ADOMs mein ho sakta hai?</td><td>Ek</td></tr>
<tr><td>ADOM version kiske barabar hona chahiye?</td><td>Device firmware version</td></tr>
<tr><td>Simulator default retention</td><td>Analytics 60 din, archive 365 din</td></tr>
<tr><td>Simulator default quota aur policy</td><td>1000 MB, overwrite</td></tr>
<tr><td>Purane analytics logs kahan jate hain?</td><td>Archive, phir deletion</td></tr>
<tr><td>Kya archive searchable hai?</td><td>Nahi</td></tr>
<tr><td>logtraffic ka default</td><td>utm (<code>show</code> chhupata hai)</td></tr>
<tr><td>Traffic logs ka severity level</td><td>notice (warning filter unhe rokta hai)</td></tr>
<tr><td>Registration se pehle bheje gaye logs</td><td>Discard, recover nahi hote</td></tr>
</table>

<div class="note"><p><b>Real product aur simulator.</b> Real product mein ADOMs, registration, storage views aur retention GUI pages hain. Simulator inhe <code>execute fazui register</code>, <code>execute fazui storage</code>, <code>config system log quota</code> aur <code>config system log settings</code> ke roop mein dikhata hai; ye naam real FortiAnalyzer par exist nahi karte. FortiGate commands (<code>config log fortianalyzer setting</code> aur <code>filter</code>, <code>config firewall policy</code>, <code>diagnose test application miglogd 6</code>) real naam use karte hain. Sizes (700 bytes per log, 1000 MB default quota, archive chauthai size par) stand-ins hain, aur retention aging lab mein dekhi nahi ja sakti. Ye module vendor administrator-level skills ke saath overlap karta hai, par ye independent training hai aur kisi exam ki taiyari nahi karwata.</p></div>

<div class="eg"><p><b>Worked example: revision drill.</b> Ticket kehta hai "Retail ADOM ke branch logs missing hain". Apne checks ka order lagao: (1) device registered hai aur kis ADOM mein, (2) FortiGate bhej raha hai (sent counters), (3) policy logtraffic, (4) filter severity aur forward-traffic, (5) quota ke Overwritten aur Rejected counters, (6) Log View sahi ADOM mein sahi type ke saath poochha gaya. Order ko do baar zor se bolo.</p></div>

<div class="warn"><p><b>Exam ke din bachne wali galtiyan.</b> Retention (time) aur quota (size) ko mix karna. Archive logs ko searchable kehna. Bhool jana ki logging setting ki fix sirf naye logs par lagu hoti hai. Ye kehna ki ADOM user traffic ka forwarding badalta hai.</p></div>

<div class="exam"><p><b>Exam traps recap.</b> Version device firmware ke barabar. Move purane logs peeche chhodta hai. Overwrite default hai. Chhota <code>show</code> defaults chhupata hai. Registered aur connected ka matlab logging nahi.</p></div>

<div class="scn"><h4>Handover note jisne weekend bacha liya</h4><p>Night-shift engineer ne chhota note diya: "Retail ADOM, quota 500 MB, 30 aur 180 din, overwrite, har Monday Overwritten check karo, MDU filter information hai, HQ policy 1 logtraffic all." Saturday ko ek colleague ne, jisne ye unit kabhi dekhi nahi thi, dus minute mein Overwritten badhta pakad liya, kyunki note ne bataya tha ki normal kaisa dikhta hai.</p><p><b>Lesson:</b> settings aur "healthy" kaisa dikhta hai ye likh kar rakho; agla vyakti shukriya kahega.</p></div>

<div class="iv"><p class="q">"ADOMs aur retention ko ek minute mein summarise karo."</p><p>ADOMs devices, logs aur administrators ko alag karte hain; device sirf ek mein hota hai, versions match hone chahiye, aur root hamesha hota hai. Storage per ADOM hai: search ke liye analytics, evidence ke liye archive, din mein retention aur size mein quota, full hone par overwrite ya drop. Logs missing hon to main path follow karta hoon: registration, policy logtraffic, filter, counters, phir Log View.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ADOMs: ek device ek ADOM; version firmware ke barabar; root hamesha hota hai.</li>
<li>Storage settings per ADOM: quota, analytics days, archive days, overwrite ya drop.</li>
<li>Sizing arithmetic hai: logs per day x average size x days, archive uska hissa.</li>
<li>Logs nahi? FortiGate counters se Log View tak log path follow karo.</li>
<li>Jaano simulator mein kya real hai aur kya theory: aging, forwarding, HA, Fabric ADOM.</li>
</ul></div>
`}};export{e as default};