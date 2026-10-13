var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>A pilot does not fly from memory. Before every flight she reads a short checklist, even after ten thousand hours. This chapter is that checklist for FortiManager operations: what you should be able to do, the words you must know, and the facts that people most often get wrong. Read it after the labs, and again the evening before an interview.</p>

<h3>What this module covered</h3>
<p>You learned a fixed order for onboarding faults (chapter 1), the stages of an install and the message each stage produces (chapter 2), how to remove, move and replace a device (chapter 3), theory for protecting the manager and pairing it with FortiAnalyzer (chapters 4 and 5), the habits that keep changes safe (chapter 6), and two labs that tested all of it (chapters 7 and 8). The practical skills here overlap with what vendor administrator-level exams test, but this is independent training and does not prepare you for any particular exam.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module map">
<rect x="10" y="20" width="190" height="56" rx="8" fill="#bae6fd"/><text x="105" y="44" text-anchor="middle" class="svg-ink" font-size="13">Onboard</text><text x="105" y="62" text-anchor="middle" class="svg-muted" font-size="12">7 checks in order</text>
<rect x="225" y="20" width="190" height="56" rx="8" fill="#fde68a"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">Install</text><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">5 stages, first error wins</text>
<rect x="440" y="20" width="190" height="56" rx="8" fill="#fed7aa"/><text x="535" y="44" text-anchor="middle" class="svg-ink" font-size="13">Retire or replace</text><text x="535" y="62" text-anchor="middle" class="svg-muted" font-size="12">delete, re-authorize</text>
<rect x="10" y="100" width="300" height="50" rx="8" fill="#ddd6fe"/><text x="160" y="130" text-anchor="middle" class="svg-ink" font-size="12">Protect: HA, backup, sizing (theory)</text>
<rect x="330" y="100" width="300" height="50" rx="8" fill="#bbf7d0"/><text x="480" y="130" text-anchor="middle" class="svg-ink" font-size="12">Operate: names, windows, runbooks</text>
</svg><p class="cap">The module on one page.</p></div>

<h3>Checklist: can you do it?</h3>
<ul>
<li>From the FortiGate, read the FGFM debug and say which address it tries.</li>
<li>Explain why an empty unauthorized list and an authorize error point to different halves of the problem.</li>
<li>Name the seven onboarding checks in order.</li>
<li>Read an install message and name the stage that failed.</li>
<li>Fix: installation target, allow-push-configuration, missing mapping, missing object.</li>
<li>Delete a device, explain what disappears and what stays, and re-authorize it into another ADOM.</li>
<li>Run a preview, install, verify with a ping, and record the revision.</li>
<li>Explain in two sentences what HA and backup do, and say which of them copies a mistake.</li>
<li>Separate what FortiManager answers (what changed) from what FortiAnalyzer answers (what happened).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>FGFM</dt><dd>The management protocol between FortiGate and FortiManager, TCP 541.</dd>
<dt>Unauthorized device</dt><dd>Connected over FGFM but not yet in the device database.</dd>
<dt>Authorize</dt><dd>Accept a device into an ADOM; retrieves the configuration as revision 1.</dd>
<dt>ADOM</dt><dd>Administrative domain; a container with a version that must equal the device firmware.</dd>
<dt>Installation target</dt><dd>A device listed in a policy package as a place to install it.</dd>
<dt>allow-push-configuration</dt><dd>FortiGate setting that decides whether FortiManager may push configuration.</dd>
<dt>Normalized interface</dt><dd>An ADOM-level interface name that maps to a real port per device.</dd>
<dt>Dynamic mapping</dt><dd>The per-device row that links a normalized interface to a real port.</dd>
<dt>Device delete</dt><dd>Removes FortiManager's record and revision history; the FortiGate keeps its configuration.</dd>
<dt>HA and backup</dt><dd>Real-product theory: a second unit for availability, a stored file for recovery.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Remember</th></tr>
<tr><td>Port</td><td>FGFM is TCP 541.</td></tr>
<tr><td>Type</td><td>Only type fortimanager uses the fmg address; fortiguard is the default.</td></tr>
<tr><td>Version</td><td>ADOM version equals device firmware; refused at authorize.</td></tr>
<tr><td>Install failure</td><td>Nothing is sent and the revision history is unchanged.</td></tr>
<tr><td>Push</td><td>allow-push-configuration is set on the FortiGate.</td></tr>
<tr><td>Delete</td><td>Device returns as unauthorized if central-management is still set.</td></tr>
<tr><td>Theory only here</td><td>HA, backup, FortiAnalyzer, workflow mode and ADOM locking.</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Read this status: <code>conn: down</code> on MDU-FGT after a power cut at the branch, while PC-MDU cannot ping SRV-WEB. Tunnel is down, so installs would fail with the FGFM message. But the ping failure is a separate matter: FortiManager is not in the traffic path, so look at the branch network, not at FMG-1.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Learning commands without the reason for them. Reading only the last line of an error. Treating theory topics as if the simulator did them. Saying "FortiManager" when you mean the FortiGate setting, or the other way round.</p></div>

<div class="exam"><p><b>Exam traps.</b> Watch the wording of questions on where a setting lives (FortiGate or FortiManager), at which step a message appears (authorize or install), and what delete affects (record or device). Authorize, import, install and revision actions are GUI or API actions in the real product; the simulator offers them as <code>execute fmgui</code> commands.</p></div>

<div class="scn"><h4>The new joiner's first week</h4><p>A new network engineer was given the checklist above on day one. On day three a branch disappeared from the manager. She read the status, saw conn down, looked at the FortiGate debug and found a changed address. On day four an install failed; she read the message, found the missing mapping and fixed it before lunch. Her manager had expected a month of shadowing.</p><p><b>Lesson:</b> a checklist and real messages make juniors useful quickly.</p></div>

<div class="iv"><p class="q">"What would you check on your first day with an unfamiliar FortiManager?"</p><p>Device list and config status for every device, the ADOM list with versions, the unauthorized list for strangers, the revision history of recent installs, and the naming scheme. Then ask for the runbooks and the backup and HA design, and be clear which of these you know from labs and which from reading.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work in fixed orders: seven onboarding checks, five install stages.</li>
<li>The first error is the diagnosis; read it fully.</li>
<li>Delete removes FortiManager's record, not the FortiGate's configuration.</li>
<li>Preview, install, verify and record every change.</li>
<li>HA, backup and FortiAnalyzer are theory here; know where the lab ends.</li>
</ul></div>
`,hi:`
<p>Pilot yaad se nahi udta. Har flight se pehle wo chhoti checklist padhti hai, das hazaar ghante ke baad bhi. Ye chapter FortiManager operations ki wahi checklist hai: aap kya kar sakte ho, kaun se shabd aane chahiye, aur kaun se facts log sabse zyada galat bolte hain. Labs ke baad ise padho, aur interview se ek raat pehle dobara.</p>

<h3>Is module mein kya cover hua</h3>
<p>Aapne onboarding faults ka fixed order seekha (chapter 1), install ke stages aur har stage ka message (chapter 2), device ko remove, move aur replace karna (chapter 3), manager ko protect karne aur FortiAnalyzer ke saath jodne ki theory (chapters 4 aur 5), changes safe rakhne ki aadatein (chapter 6), aur do labs jinhone sab test kiya (chapters 7 aur 8). Yahan ke practical skills vendor administrator-level exams jo test karte hain usse overlap karte hain, par ye independent training hai aur kisi particular exam ki taiyari nahi karwati.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module map">
<rect x="10" y="20" width="190" height="56" rx="8" fill="#bae6fd"/><text x="105" y="44" text-anchor="middle" class="svg-ink" font-size="13">Onboard</text><text x="105" y="62" text-anchor="middle" class="svg-muted" font-size="12">7 checks order mein</text>
<rect x="225" y="20" width="190" height="56" rx="8" fill="#fde68a"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">Install</text><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">5 stages, pehli error jeetti hai</text>
<rect x="440" y="20" width="190" height="56" rx="8" fill="#fed7aa"/><text x="535" y="44" text-anchor="middle" class="svg-ink" font-size="13">Retire ya replace</text><text x="535" y="62" text-anchor="middle" class="svg-muted" font-size="12">delete, re-authorize</text>
<rect x="10" y="100" width="300" height="50" rx="8" fill="#ddd6fe"/><text x="160" y="130" text-anchor="middle" class="svg-ink" font-size="12">Protect: HA, backup, sizing (theory)</text>
<rect x="330" y="100" width="300" height="50" rx="8" fill="#bbf7d0"/><text x="480" y="130" text-anchor="middle" class="svg-ink" font-size="12">Operate: names, windows, runbooks</text>
</svg><p class="cap">Poora module ek page par.</p></div>

<h3>Checklist: kya aap kar sakte ho?</h3>
<ul>
<li>FortiGate se FGFM debug padho aur batao ki wo kaun sa address try karta hai.</li>
<li>Samjhao ki khaali unauthorized list aur authorize error problem ke alag hisson ki taraf kyun ishara karte hain.</li>
<li>Saat onboarding checks order mein batao.</li>
<li>Install message padho aur batao ki kaun sa stage fail hua.</li>
<li>Fix karo: installation target, allow-push-configuration, missing mapping, missing object.</li>
<li>Device delete karo, batao kya jaata hai aur kya rehta hai, aur use doosre ADOM mein re-authorize karo.</li>
<li>Preview chalao, install karo, ping se verify karo, aur revision record karo.</li>
<li>Do sentence mein samjhao ki HA aur backup kya karte hain, aur batao kaun galti ki copy bana deta hai.</li>
<li>Alag karo ki FortiManager kya jawab deta hai (kya badla) aur FortiAnalyzer kya (kya hua).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>FGFM</dt><dd>FortiGate aur FortiManager ke beech management protocol, TCP 541.</dd>
<dt>Unauthorized device</dt><dd>FGFM par connected par abhi device database mein nahi.</dd>
<dt>Authorize</dt><dd>Device ko ADOM mein accept karna; configuration revision 1 ki tarah retrieve hoti hai.</dd>
<dt>ADOM</dt><dd>Administrative domain; version wala container jo device firmware ke barabar hona chahiye.</dd>
<dt>Installation target</dt><dd>Policy package mein list kiya gaya device jahan use install kiya ja sakta hai.</dd>
<dt>allow-push-configuration</dt><dd>FortiGate setting jo decide karti hai ki FortiManager configuration push kar sakta hai ya nahi.</dd>
<dt>Normalized interface</dt><dd>ADOM-level interface naam jo har device ke liye real port se map hota hai.</dd>
<dt>Dynamic mapping</dt><dd>Per-device row jo normalized interface ko real port se jodti hai.</dd>
<dt>Device delete</dt><dd>FortiManager ka record aur revision history hatata hai; FortiGate apni configuration rakhta hai.</dd>
<dt>HA aur backup</dt><dd>Real-product theory: availability ke liye doosra unit, recovery ke liye stored file.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Yaad rakho</th></tr>
<tr><td>Port</td><td>FGFM TCP 541 hai.</td></tr>
<tr><td>Type</td><td>Sirf type fortimanager fmg address use karta hai; fortiguard default hai.</td></tr>
<tr><td>Version</td><td>ADOM version device firmware ke barabar; authorize par refuse hota hai.</td></tr>
<tr><td>Install failure</td><td>Kuch nahi bheja jata aur revision history unchanged.</td></tr>
<tr><td>Push</td><td>allow-push-configuration FortiGate par set hota hai.</td></tr>
<tr><td>Delete</td><td>central-management set ho to device unauthorized ki tarah wapas aata hai.</td></tr>
<tr><td>Yahan sirf theory</td><td>HA, backup, FortiAnalyzer, workflow mode aur ADOM locking.</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ye status padho: branch mein power cut ke baad MDU-FGT par <code>conn: down</code>, aur PC-MDU SRV-WEB ko ping nahi kar pa raha. Tunnel down hai, to installs FGFM message ke saath fail hote. Par ping failure alag baat hai: FortiManager traffic path mein nahi hai, isliye branch network dekho, FMG-1 nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Commands ko unki wajah ke bina seekhna. Error ki sirf aakhri line padhna. Theory topics ko aise maanna jaise simulator unhe karta hai. "FortiManager" bolna jab FortiGate setting ka matlab ho, ya ulta.</p></div>

<div class="exam"><p><b>Exam traps.</b> Sawalon ke wording par dhyan do: setting kahan rehti hai (FortiGate ya FortiManager), message kis step par aata hai (authorize ya install), aur delete kis par asar karta hai (record ya device). Authorize, import, install aur revision actions real product mein GUI ya API actions hain; simulator unhe <code>execute fmgui</code> commands ki tarah deta hai.</p></div>

<div class="scn"><h4>Naye joiner ka pehla hafta</h4><p>Ek naye network engineer ko pehle din upar ki checklist di gayi. Teesre din ek branch manager se gayab ho gaya. Usne status padha, conn down dekha, FortiGate debug dekha aur badla hua address mila. Chauthe din ek install fail hua; usne message padha, missing mapping mili aur lunch se pehle fix kar di. Manager ne ek mahine ke shadowing ki ummeed ki thi.</p><p><b>Lesson:</b> checklist aur real messages juniors ko jaldi kaam ka bana dete hain.</p></div>

<div class="iv"><p class="q">"Anjaan FortiManager par pehle din kya check karoge?"</p><p>Har device ki device list aur config status, versions ke saath ADOM list, ajnabiyon ke liye unauthorized list, recent installs ki revision history, aur naming scheme. Phir runbooks aur backup aur HA design maango, aur saaf kaho ki inme se kya aap labs se jaante ho aur kya padhkar.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Fixed orders mein kaam karo: saat onboarding checks, paanch install stages.</li>
<li>Pehli error hi diagnosis hai; use poora padho.</li>
<li>Delete FortiManager ka record hatata hai, FortiGate ki configuration nahi.</li>
<li>Har change ko preview, install, verify aur record karo.</li>
<li>HA, backup aur FortiAnalyzer yahan theory hain; jaano ki lab kahan khatam hoti hai.</li>
</ul></div>
`}};export{e as default};