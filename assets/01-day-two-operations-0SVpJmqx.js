var e={id:`day-two-operations`,h:{en:`Day-two operations of a FortiAnalyzer`,hi:`FortiAnalyzer ke day-two operations`},body:{en:`
<div class="note"><p><b>What you will learn.</b> What "day two" means for a FortiAnalyzer, how to add a new site, move a device and retire one, how to plan a change window, and who should be allowed to change what. <b>Prerequisites:</b> FortiGate administration (you can read a FortiGate configuration and use the CLI), and the earlier FortiAnalyzer modules of this track: the log flow from a FortiGate to FAZ-1, device registration, ADOMs, Log View and the storage output. Every term is explained again when it first appears.</p></div>

<p>Think of a new railway line. Building the track and opening the first train is "day one". Everything after that is "day two": adding a station, moving a train to another line, closing a station that nobody uses, and making sure the timetable is still true. A FortiAnalyzer is the same. Installing it and receiving the first log is the easy part. A company lives with it for years, and most of the work is small, repeated changes.</p>

<h3>The four day-two jobs</h3>
<p>For the invented company Kaveri Retail the FortiAnalyzer is FAZ-1 at 192.0.2.6, and the FortiGates are HQ-FGT, MDU-FGT and TRY-FGT. Almost every ticket for FAZ-1 is one of four jobs.</p>
<table class="cmp"><tr><th>Job</th><th>Both sides</th><th>Where you prove it</th></tr>
<tr><td>Add a site</td><td>FortiGate: logging settings. FAZ-1: register the device in an ADOM.</td><td>Registered list, then new logs in Log View</td></tr>
<tr><td>Move a device</td><td>Register it in another ADOM; new logs go there.</td><td>ADOM list and Log View in the new ADOM</td></tr>
<tr><td>Retire a device</td><td>Delete the entry and stop the logging on the FortiGate.</td><td>Unregistered list is empty</td></tr>
<tr><td>Change a setting</td><td>Quota, retention, handlers, reports.</td><td>Storage output, events, report</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Device life cycle on FAZ-1">
<rect x="10" y="40" width="130" height="56" rx="8" fill="#bae6fd"/><text x="75" y="64" text-anchor="middle" class="svg-ink" font-size="13">1 Connect</text><text x="75" y="82" text-anchor="middle" class="svg-muted" font-size="12">FortiGate setting</text>
<rect x="170" y="40" width="130" height="56" rx="8" fill="#ddd6fe"/><text x="235" y="64" text-anchor="middle" class="svg-ink" font-size="13">2 Register</text><text x="235" y="82" text-anchor="middle" class="svg-muted" font-size="12">ADOM chosen</text>
<rect x="330" y="40" width="130" height="56" rx="8" fill="#bbf7d0"/><text x="395" y="64" text-anchor="middle" class="svg-ink" font-size="13">3 Operate</text><text x="395" y="82" text-anchor="middle" class="svg-muted" font-size="12">logs, events, reports</text>
<rect x="490" y="40" width="140" height="56" rx="8" fill="#fed7aa"/><text x="560" y="64" text-anchor="middle" class="svg-ink" font-size="13">4 Retire</text><text x="560" y="82" text-anchor="middle" class="svg-muted" font-size="12">delete + stop logging</text>
<line x1="140" y1="68" x2="170" y2="68" stroke="#64748b" stroke-width="2"/><line x1="300" y1="68" x2="330" y2="68" stroke="#64748b" stroke-width="2"/><line x1="460" y1="68" x2="490" y2="68" stroke="#64748b" stroke-width="2"/>
<text x="10" y="130" class="svg-muted" font-size="12">A move is step 2 done again in another ADOM. Stored logs stay where they were stored.</text>
</svg><p class="cap">The life of a device on a FortiAnalyzer.</p></div>

<h3>Adding a site</h3>
<p>Two steps, in this order. First the FortiGate must send logs: <code>config log fortianalyzer setting</code> with <code>status enable</code> and the <code>server</code> address. If you know the serial number of FAZ-1, put it in <code>serial</code> so the FortiGate refuses an impostor. Second, FAZ-1 must accept the device. A FortiGate that connects but is not in the device table is <b>unregistered</b>: its logs are discarded and counted, nothing is stored. Registration is a GUI action in the real product; the simulator offers it as <code>execute fazui register</code>.</p>
<pre class="code"><span class="c">! on TRY-FGT (Trichy)</span>
config log fortianalyzer setting
    set status enable
    set server 192.0.2.6
end
<span class="c">! on FAZ-1 (stand-in for the GUI action)</span>
execute fazui register TRY-FGT root</pre>
<pre class="out">FAZ-1 # execute fazui register TRY-FGT root
<span class="hl">Device TRY-FGT (FGVMEV3X688U0000) registered in ADOM root.</span>
Logs received from now on are stored.</pre>
<p>Notice the sentence "from now on". If the device was connected for a while before, the first logs are gone. When you register HQ-FGT after a minute of traffic, the simulator tells you: "2 logs received while it was unregistered were discarded." That is why you register first and generate test traffic afterwards.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri opens a fourth store, Salem. Plan: (1) FortiGate gets the logging settings with the FAZ-1 serial; (2) the engineer checks <code>execute log fortianalyzer test-connectivity</code> until it says "Connection: Allow"; (3) the device is registered in the ADOM Retail (ADOM mode must be on and the ADOM version must equal the device firmware); (4) a test web request from the store PC creates a traffic log; (5) Log View shows it. Only now the ticket is closed.</p></div>

<h3>Moving a device</h3>
<p>Sometimes a store changes business unit and its logs must be kept in another ADOM. In the simulator you remove the device entry and register it again in the new ADOM. The rule that matters: logs already stored stay in the ADOM where they were stored; only logs received after the new registration go to the new ADOM. So searches and reports for the old period must be run in the old ADOM. Treat any promise that "history moves with the device" as theory you must verify in the real product.</p>

<h3>Change windows and who may change what</h3>
<p>Deleting a device, lowering a quota or switching the quota policy to <code>drop</code> can lose evidence. Do these in an agreed change window, with a ticket number, and record what you saw before and after (storage output, device list). Per-user permissions and administrator profiles exist in the real product (for example, a read-only auditor who can search but not delete); the simulator has one admin, so this is theory here. The principle is simple: the person who reads logs should not be the only person who can delete them.</p>

<div class="warn"><p><b>Common mistakes.</b> Registering the device before the FortiGate is connected, then wondering why nothing arrives. Creating test traffic before registration and treating the missing logs as a fault. Moving a device and looking for old logs in the new ADOM. Changing quota policy in business hours without telling the audit owner.</p></div>

<div class="exam"><p><b>Exam traps.</b> Connected is not registered. Logs received while unregistered are discarded, never queued. Stored logs stay where they are when a device is deleted or moved. Registration and Log View are GUI in the real product; <code>execute fazui</code> exists only in the simulator.</p></div>

<div class="scn"><h4>The new store that looked healthy</h4><p>The Salem FortiGate reported "Connection: Allow" and the project manager closed the ticket. A week later the audit team found no Salem logs at all. The device was connected but nobody had registered it, so every log was counted as discarded. The fix took one minute; the lost week could not be recovered.</p><p><b>Lesson:</b> a ticket for a new site is closed by a log you can search, not by a green connection line.</p></div>

<div class="iv"><p class="q">"You are asked to onboard a new branch to the FortiAnalyzer. What do you do?"</p><p>Configure logging on the FortiGate with the server and the FortiAnalyzer serial, verify the connection with test-connectivity, register the device in the right ADOM, generate a test log, and find it in Log View. Mention that logs sent before registration are lost.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Day two is adding, moving, retiring and tuning, not installing.</li>
<li>A new site needs both sides: FortiGate logging settings and registration on FAZ-1.</li>
<li>Logs received while a device is unregistered are discarded and counted, not stored.</li>
<li>Stored logs stay in the ADOM where they were stored when a device is moved or deleted.</li>
<li>Risky changes (delete, quota, drop policy) belong in a change window with a record.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Is chapter mein aap seekhoge.</b> FortiAnalyzer ke liye "day two" ka matlab kya hai, naya site kaise add karte hain, device ko kaise move aur retire karte hain, change window kaise plan karte hain, aur kise kya change karne ki permission honi chahiye. <b>Prerequisites:</b> FortiGate administration (aap FortiGate configuration padh sakte ho aur CLI use kar sakte ho), aur is track ke pehle FortiAnalyzer modules: FortiGate se FAZ-1 tak log flow, device registration, ADOMs, Log View aur storage output. Har term pehli baar aane par dobara samjhaya gaya hai.</p></div>

<p>Socho ek nayi railway line hai. Track banana aur pehli train chalana "day one" hai. Uske baad sab kuch "day two" hai: station add karna, train ko doosri line par bhejna, jis station par koi nahi aata use band karna, aur ye dekhna ki timetable ab bhi sahi hai. FortiAnalyzer bhi aisa hi hai. Install karna aur pehla log receive karna aasaan hissa hai. Company saalon tak isse use karti hai aur zyada kaam chhote, baar-baar hone wale changes hote hain.</p>

<h3>Chaar day-two jobs</h3>
<p>Invented company Kaveri Retail ke liye FortiAnalyzer FAZ-1 hai (192.0.2.6) aur FortiGates HQ-FGT, MDU-FGT, TRY-FGT hain. FAZ-1 ke lagbhag har ticket in chaar jobs mein se ek hota hai.</p>
<table class="cmp"><tr><th>Job</th><th>Dono sides</th><th>Proof kahan milta hai</th></tr>
<tr><td>Site add karna</td><td>FortiGate: logging settings. FAZ-1: device ko ADOM mein register karna.</td><td>Registered list, phir Log View mein naye logs</td></tr>
<tr><td>Device move karna</td><td>Doosre ADOM mein register karo; naye logs wahan jaate hain.</td><td>ADOM list aur naye ADOM ka Log View</td></tr>
<tr><td>Device retire karna</td><td>Entry delete karo aur FortiGate par logging band karo.</td><td>Unregistered list khaali</td></tr>
<tr><td>Setting change karna</td><td>Quota, retention, handlers, reports.</td><td>Storage output, events, report</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="FAZ-1 par device ka life cycle">
<rect x="10" y="40" width="130" height="56" rx="8" fill="#bae6fd"/><text x="75" y="64" text-anchor="middle" class="svg-ink" font-size="13">1 Connect</text><text x="75" y="82" text-anchor="middle" class="svg-muted" font-size="12">FortiGate setting</text>
<rect x="170" y="40" width="130" height="56" rx="8" fill="#ddd6fe"/><text x="235" y="64" text-anchor="middle" class="svg-ink" font-size="13">2 Register</text><text x="235" y="82" text-anchor="middle" class="svg-muted" font-size="12">ADOM chuna</text>
<rect x="330" y="40" width="130" height="56" rx="8" fill="#bbf7d0"/><text x="395" y="64" text-anchor="middle" class="svg-ink" font-size="13">3 Operate</text><text x="395" y="82" text-anchor="middle" class="svg-muted" font-size="12">logs, events, reports</text>
<rect x="490" y="40" width="140" height="56" rx="8" fill="#fed7aa"/><text x="560" y="64" text-anchor="middle" class="svg-ink" font-size="13">4 Retire</text><text x="560" y="82" text-anchor="middle" class="svg-muted" font-size="12">delete + logging band</text>
<line x1="140" y1="68" x2="170" y2="68" stroke="#64748b" stroke-width="2"/><line x1="300" y1="68" x2="330" y2="68" stroke="#64748b" stroke-width="2"/><line x1="460" y1="68" x2="490" y2="68" stroke="#64748b" stroke-width="2"/>
<text x="10" y="130" class="svg-muted" font-size="12">Move matlab step 2 doosre ADOM mein dobara. Stored logs wahin rehte hain.</text>
</svg><p class="cap">FortiAnalyzer par device ki zindagi.</p></div>

<h3>Site add karna</h3>
<p>Do steps, isi order mein. Pehle FortiGate ko logs bhejne hain: <code>config log fortianalyzer setting</code> mein <code>status enable</code> aur <code>server</code> address. Agar FAZ-1 ka serial number pata hai to use <code>serial</code> mein daalo, taaki FortiGate nakli server ko refuse kare. Doosra, FAZ-1 ko device accept karna hai. Jo FortiGate connect hai par device table mein nahi, wo <b>unregistered</b> hai: uske logs discard hote hain aur count hote hain, kuch store nahi hota. Real product mein registration GUI action hai; simulator ise <code>execute fazui register</code> ki tarah deta hai.</p>
<pre class="code"><span class="c">! on TRY-FGT (Trichy)</span>
config log fortianalyzer setting
    set status enable
    set server 192.0.2.6
end
<span class="c">! on FAZ-1 (GUI action ka stand-in)</span>
execute fazui register TRY-FGT root</pre>
<pre class="out">FAZ-1 # execute fazui register TRY-FGT root
<span class="hl">Device TRY-FGT (FGVMEV3X688U0000) registered in ADOM root.</span>
Logs received from now on are stored.</pre>
<p>"From now on" wali line dhyan se dekho. Agar device kuch der pehle se connected tha to pehle ke logs chale gaye. Jab aap ek minute traffic ke baad HQ-FGT register karte ho, simulator batata hai: "2 logs received while it was unregistered were discarded." Isliye pehle register karo, test traffic baad mein banao.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri chautha store Salem kholta hai. Plan: (1) FortiGate par FAZ-1 serial ke saath logging settings; (2) engineer <code>execute log fortianalyzer test-connectivity</code> tab tak chalata hai jab tak "Connection: Allow" na aaye; (3) device ADOM Retail mein register hota hai (ADOM mode on hona chahiye aur ADOM version device firmware ke barabar); (4) store PC se test web request ek traffic log banata hai; (5) Log View mein wo dikhta hai. Ab jaakar ticket close hota hai.</p></div>

<h3>Device move karna</h3>
<p>Kabhi store business unit badalta hai aur uske logs doosre ADOM mein rakhne hote hain. Simulator mein aap device entry hatate ho aur use naye ADOM mein dobara register karte ho. Zaroori rule: jo logs pehle se stored hain wo usi ADOM mein rehte hain jahan store hue; sirf naye registration ke baad aaye logs naye ADOM mein jaate hain. Isliye purane period ki search aur reports purane ADOM mein chalani hongi. "History device ke saath move hoti hai" jaisa vaada theory samjho jise real product mein verify karna hoga.</p>

<h3>Change windows aur kaun kya badle</h3>
<p>Device delete karna, quota kam karna ya quota policy <code>drop</code> karna evidence kho sakta hai. Ye kaam agreed change window mein, ticket number ke saath karo, aur pehle-baad ka record rakho (storage output, device list). Per-user permissions aur administrator profiles real product mein hote hain (jaise read-only auditor jo search kar sakta hai par delete nahi); simulator mein ek hi admin hai, isliye yahan ye theory hai. Principle simple hai: jo log padhta hai wahi akela insaan nahi hona chahiye jo unhe delete kar sake.</p>

<div class="warn"><p><b>Common mistakes.</b> FortiGate connect hone se pehle device register kar dena, phir sochna ki kuch aa kyun nahi raha. Registration se pehle test traffic banana aur missing logs ko fault samajhna. Device move karke purane logs naye ADOM mein dhoondhna. Audit owner ko bataye bina business hours mein quota policy badalna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Connected ka matlab registered nahi. Unregistered rehte hue aaye logs discard hote hain, queue nahi hote. Device delete ya move karne par stored logs wahin rehte hain. Registration aur Log View real product mein GUI hain; <code>execute fazui</code> sirf simulator mein hai.</p></div>

<div class="scn"><h4>Naya store jo healthy dikh raha tha</h4><p>Salem FortiGate ne "Connection: Allow" dikhaya aur project manager ne ticket close kar diya. Ek hafte baad audit team ko Salem ke koi logs nahi mile. Device connected tha par kisi ne register nahi kiya tha, isliye har log discarded count hua. Fix ek minute ka tha; kho gaya hafta wapas nahi aaya.</p><p><b>Lesson:</b> naye site ka ticket aise log se close hota hai jo aap search kar sako, green connection line se nahi.</p></div>

<div class="iv"><p class="q">"Aapko FortiAnalyzer par naya branch onboard karna hai. Aap kya karoge?"</p><p>FortiGate par server aur FortiAnalyzer serial ke saath logging configure karo, test-connectivity se connection verify karo, device ko sahi ADOM mein register karo, ek test log banao aur Log View mein dhoondho. Ye bhi bolo ki registration se pehle bheje gaye logs lost hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Day two matlab add, move, retire aur tune karna, install karna nahi.</li>
<li>Naye site ko dono sides chahiye: FortiGate logging settings aur FAZ-1 par registration.</li>
<li>Unregistered rehte hue aaye logs discard aur count hote hain, store nahi.</li>
<li>Device move ya delete par stored logs usi ADOM mein rehte hain jahan store hue.</li>
<li>Risky changes (delete, quota, drop policy) change window mein record ke saath karo.</li>
</ul></div>
`}};export{e as default};