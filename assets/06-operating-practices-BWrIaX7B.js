var e={id:`operating-practices`,h:{en:`Operating practices: naming, health checks, runbooks and tickets`,hi:`Operating practices: naming, health checks, runbooks aur tickets`},body:{en:`
<p>A good kitchen is not only about good chefs. Labels on every box, a cleaning list on the wall, a daily check of the fridge temperature, and a written recipe for the busiest dish: these keep the kitchen safe when the head chef is on leave. A FortiAnalyzer is operated the same way. The technology is only half of it. The other half is habits that make a problem visible early and let a tired engineer at 2 a.m. do the right thing without guessing.</p>

<h3>Naming</h3>
<p>Names are used in searches, event handlers, reports and tickets, so they must be predictable. Kaveri Retail uses a short code and a role: <code>HQ-FGT</code>, <code>MDU-FGT</code>, <code>TRY-FGT</code> for devices, the ADOM names Corporate, Retail and Kaveri, and handler names that say what they catch: <code>deny-burst</code>, <code>hq-deny</code>, <code>mdu-deny</code>. Rules that work: one pattern for all devices; the same device name on the FortiGate and in the FortiAnalyzer device table; no spaces; names that stay true when the person who made them leaves.</p>

<h3>Documentation: the logging register</h3>
<p>Keep a small table that you update with every change. For each device: site, FortiGate address, serial, ADOM, date registered, upload option, owner, and the retention promise.</p>
<table class="cmp"><tr><th>Device</th><th>Site</th><th>ADOM</th><th>Address</th><th>Owner</th></tr>
<tr><td>HQ-FGT</td><td>Chennai</td><td>Corporate</td><td>192.0.2.11</td><td>Network team</td></tr>
<tr><td>MDU-FGT</td><td>Madurai</td><td>Retail</td><td>192.0.2.12</td><td>Network team</td></tr>
<tr><td>TRY-FGT</td><td>Trichy</td><td>Retail</td><td>192.0.2.13</td><td>Network team</td></tr></table>
<p>The register is compared with the device list of FAZ-1 once a week. A device in the register but not in the list was never onboarded; a device in the list but not in the register is a mystery that deserves a ticket.</p>

<h3>Monitoring the logging health</h3>
<p>FAZ-1 does not shout when a FortiGate stops sending. You must look. These are the daily and weekly checks, all with commands the simulator really has (the names marked "stand-in" are GUI views in the real product).</p>
<table class="cmp"><tr><th>When</th><th>Question</th><th>Command</th></tr>
<tr><td>Daily</td><td>Is every device registered, connected, and receiving?</td><td><code>diagnose device list</code></td></tr>
<tr><td>Daily</td><td>Is anybody connected but unregistered?</td><td><code>execute fazui unregistered list</code> (stand-in)</td></tr>
<tr><td>Daily</td><td>When did each device last send a log?</td><td><code>diagnose log device</code></td></tr>
<tr><td>Weekly</td><td>Used percent, overwritten, rejected?</td><td><code>execute fazui storage root</code> (stand-in)</td></tr>
<tr><td>On a ticket</td><td>Does the FortiGate see the server?</td><td><code>execute log fortianalyzer test-connectivity</code></td></tr></table>
<pre class="out">FAZ-1 # diagnose log device
Device          SN                  ADOM      Traffic  UTM    Event  Rejected  Last log
HQ-FGT          FGVMEV1RGF38I000    root      2        0      0      0         2026-10-12 20:28:05
MDU-FGT         FGVMEV1JOS6TJ000    Kaveri    1        0      0      0         2026-10-12 20:28:05</pre>
<p>Read the Last log column. A device whose last log is hours old on a busy store is the first sign of trouble, long before an auditor asks. A device with 0 in all columns and no last log is either new, quiet or broken: the register tells you which.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Operating loop">
<rect x="10" y="30" width="140" height="56" rx="8" fill="#bae6fd"/><text x="80" y="54" text-anchor="middle" class="svg-ink" font-size="13">Register</text><text x="80" y="72" text-anchor="middle" class="svg-muted" font-size="12">what should exist</text>
<rect x="180" y="30" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="250" y="54" text-anchor="middle" class="svg-ink" font-size="13">Check</text><text x="250" y="72" text-anchor="middle" class="svg-muted" font-size="12">what does exist</text>
<rect x="350" y="30" width="140" height="56" rx="8" fill="#fde68a"/><text x="420" y="54" text-anchor="middle" class="svg-ink" font-size="13">Ticket</text><text x="420" y="72" text-anchor="middle" class="svg-muted" font-size="12">every difference</text>
<rect x="520" y="30" width="110" height="56" rx="8" fill="#bbf7d0"/><text x="575" y="54" text-anchor="middle" class="svg-ink" font-size="13">Runbook</text><text x="575" y="72" text-anchor="middle" class="svg-muted" font-size="12">known fix</text>
<line x1="150" y1="58" x2="180" y2="58" stroke="#64748b" stroke-width="2"/><line x1="320" y1="58" x2="350" y2="58" stroke="#64748b" stroke-width="2"/><line x1="490" y1="58" x2="520" y2="58" stroke="#64748b" stroke-width="2"/>
<text x="10" y="130" class="svg-muted" font-size="12">A difference between register and reality is never "ignore". It is a ticket with a name.</text>
</svg><p class="cap">The operating loop: compare the register with the real state and ticket every difference.</p></div>

<h3>Runbooks and tickets</h3>
<p>A <b>runbook</b> is a short written procedure for a known situation: onboarding a site, retiring a site, "logs missing", "unregistered device appeared", "quota nearly full". Each runbook lists the check command, the expected wording, the fix and the proof. Chapter 3 of this module is the raw material for the "logs missing" runbook. A good <b>ticket</b> says: device, what was seen (paste the output), what was changed, and the proof afterwards. Closing a ticket without proof is how a week of lost logs happens.</p>

<div class="eg"><p><b>Worked example.</b> Monday check. <code>diagnose device list</code> shows HQ-FGT and MDU-FGT up, and TRY-FGT up with 0/0/0. The register says TRY-FGT was onboarded on Friday. Last log "-" on a working store is wrong, so a ticket is opened. The engineer finds that TRY-FGT policy logging is set low, fixes it in the change window, sends a test request from the store PC, and pastes the new <code>diagnose log device</code> line into the ticket.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Looking at the FortiAnalyzer only when somebody complains. Using names that only one person understands. Keeping the register in one head. Closing a ticket on "Connection: Allow" with no log seen. Changing quota or retention without writing the old values down.</p></div>

<div class="exam"><p><b>Exam traps.</b> Registered and connected does not mean receiving: read the log counts and last log. The unregistered list shows connected devices without an entry. Monitoring dashboards and alerts about disk or devices are GUI features in the real product; the simulator only has the commands above.</p></div>

<div class="scn"><h4>The quiet branch</h4><p>The weekly check showed that the Trichy FortiGate had a last log six days old. Nobody had complained, because nobody had searched Trichy logs. The register said "owner: network team", the ticket went to them, and the cause was a FortiGate policy that had been edited to stop logging. They restored it and added the daily device-list check to the runbook.</p><p><b>Lesson:</b> a monitoring habit finds in minutes what an audit finds in months.</p></div>

<div class="iv"><p class="q">"How do you keep a FortiAnalyzer healthy over the years?"</p><p>Predictable naming, a register of devices that is compared to the real device list, daily checks of device status and unregistered devices, weekly checks of storage and quota counters, runbooks for the known failures, and tickets with proof. Say that the FortiAnalyzer will not warn you by itself that a FortiGate went quiet.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use one naming pattern, identical on the FortiGate and in the FortiAnalyzer.</li>
<li>Keep a register and compare it with the device list regularly.</li>
<li>Check device status, unregistered devices and last log daily; storage counters weekly.</li>
<li>Write runbooks for known faults and close tickets only with proof.</li>
</ul></div>
`,hi:`
<p>Achhi kitchen sirf achhe chefs se nahi banti. Har dabbe par label, deewar par cleaning list, fridge ke temperature ka daily check, aur sabse busy dish ki likhi hui recipe: ye sab head chef ke chhutti par hone par bhi kitchen ko safe rakhte hain. FortiAnalyzer bhi aise hi chalaya jaata hai. Technology sirf aadha hissa hai. Doosra aadha aisi aadatein hain jo problem ko jaldi visible banati hain aur raat ke 2 baje thake engineer ko bina guess kiye sahi kaam karne deti hain.</p>

<h3>Naming</h3>
<p>Naam searches, event handlers, reports aur tickets mein use hote hain, isliye predictable hone chahiye. Kaveri Retail short code aur role use karta hai: devices ke liye <code>HQ-FGT</code>, <code>MDU-FGT</code>, <code>TRY-FGT</code>, ADOM names Corporate, Retail aur Kaveri, aur handler names jo batate hain ki wo kya pakadte hain: <code>deny-burst</code>, <code>hq-deny</code>, <code>mdu-deny</code>. Jo rules kaam karte hain: sab devices ke liye ek pattern; FortiGate aur FortiAnalyzer device table mein same device name; spaces nahi; aise naam jo banane wale ke jaane ke baad bhi sach rahein.</p>

<h3>Documentation: logging register</h3>
<p>Ek chhoti table rakho jo har change ke saath update ho. Har device ke liye: site, FortiGate address, serial, ADOM, register hone ki date, upload option, owner, aur retention promise.</p>
<table class="cmp"><tr><th>Device</th><th>Site</th><th>ADOM</th><th>Address</th><th>Owner</th></tr>
<tr><td>HQ-FGT</td><td>Chennai</td><td>Corporate</td><td>192.0.2.11</td><td>Network team</td></tr>
<tr><td>MDU-FGT</td><td>Madurai</td><td>Retail</td><td>192.0.2.12</td><td>Network team</td></tr>
<tr><td>TRY-FGT</td><td>Trichy</td><td>Retail</td><td>192.0.2.13</td><td>Network team</td></tr></table>
<p>Register ko hafte mein ek baar FAZ-1 ki device list se compare karo. Register mein hai par list mein nahi, matlab device kabhi onboard hi nahi hua; list mein hai par register mein nahi, wo rahasya hai jiska ticket banta hai.</p>

<h3>Logging health monitor karna</h3>
<p>Jab FortiGate logs bhejna band kare to FAZ-1 shor nahi machata. Aapko dekhna padta hai. Ye daily aur weekly checks hain, sab ke commands simulator mein sach mein hain ("stand-in" likhe naam real product mein GUI views hain).</p>
<table class="cmp"><tr><th>Kab</th><th>Sawal</th><th>Command</th></tr>
<tr><td>Daily</td><td>Kya har device registered, connected aur receiving hai?</td><td><code>diagnose device list</code></td></tr>
<tr><td>Daily</td><td>Kya koi connected par unregistered hai?</td><td><code>execute fazui unregistered list</code> (stand-in)</td></tr>
<tr><td>Daily</td><td>Har device ne aakhri log kab bheja?</td><td><code>diagnose log device</code></td></tr>
<tr><td>Weekly</td><td>Used percent, overwritten, rejected?</td><td><code>execute fazui storage root</code> (stand-in)</td></tr>
<tr><td>Ticket par</td><td>Kya FortiGate ko server dikh raha hai?</td><td><code>execute log fortianalyzer test-connectivity</code></td></tr></table>
<pre class="out">FAZ-1 # diagnose log device
Device          SN                  ADOM      Traffic  UTM    Event  Rejected  Last log
HQ-FGT          FGVMEV1RGF38I000    root      2        0      0      0         2026-10-12 20:28:05
MDU-FGT         FGVMEV1JOS6TJ000    Kaveri    1        0      0      0         2026-10-12 20:28:05</pre>
<p>Last log column padho. Busy store ka device jiska last log ghanton purana hai, wo trouble ka pehla sign hai, auditor ke poochne se bahut pehle. Jis device ke saare columns 0 hain aur last log nahi hai, wo ya naya hai, ya shant hai, ya broken: register batata hai kaun sa.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Operating loop">
<rect x="10" y="30" width="140" height="56" rx="8" fill="#bae6fd"/><text x="80" y="54" text-anchor="middle" class="svg-ink" font-size="13">Register</text><text x="80" y="72" text-anchor="middle" class="svg-muted" font-size="12">kya hona chahiye</text>
<rect x="180" y="30" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="250" y="54" text-anchor="middle" class="svg-ink" font-size="13">Check</text><text x="250" y="72" text-anchor="middle" class="svg-muted" font-size="12">kya hai</text>
<rect x="350" y="30" width="140" height="56" rx="8" fill="#fde68a"/><text x="420" y="54" text-anchor="middle" class="svg-ink" font-size="13">Ticket</text><text x="420" y="72" text-anchor="middle" class="svg-muted" font-size="12">har difference</text>
<rect x="520" y="30" width="110" height="56" rx="8" fill="#bbf7d0"/><text x="575" y="54" text-anchor="middle" class="svg-ink" font-size="13">Runbook</text><text x="575" y="72" text-anchor="middle" class="svg-muted" font-size="12">known fix</text>
<line x1="150" y1="58" x2="180" y2="58" stroke="#64748b" stroke-width="2"/><line x1="320" y1="58" x2="350" y2="58" stroke="#64748b" stroke-width="2"/><line x1="490" y1="58" x2="520" y2="58" stroke="#64748b" stroke-width="2"/>
<text x="10" y="130" class="svg-muted" font-size="12">Register aur reality ka difference "ignore" nahi hota. Wo naam wala ticket hai.</text>
</svg><p class="cap">Operating loop: register ko asli state se compare karo aur har difference ka ticket banao.</p></div>

<h3>Runbooks aur tickets</h3>
<p><b>Runbook</b> kisi known situation ki chhoti likhi procedure hai: site onboard karna, site retire karna, "logs missing", "unregistered device aaya", "quota lagbhag full". Har runbook mein check command, expected wording, fix aur proof hota hai. Is module ka chapter 3 "logs missing" runbook ka kaccha maal hai. Achha <b>ticket</b> kehta hai: device, kya dekha (output paste karo), kya badla, aur baad ka proof. Proof ke bina ticket close karne se hi ek hafte ke lost logs hote hain.</p>

<div class="eg"><p><b>Worked example.</b> Monday check. <code>diagnose device list</code> mein HQ-FGT aur MDU-FGT up hain, aur TRY-FGT up hai par 0/0/0. Register kehta hai TRY-FGT Friday ko onboard hua. Chalte store par last log "-" galat hai, isliye ticket khulta hai. Engineer ko pata chalta hai ki TRY-FGT ki policy logging low set hai, wo change window mein fix karta hai, store PC se test request bhejta hai, aur naya <code>diagnose log device</code> line ticket mein paste karta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> FortiAnalyzer ko tabhi dekhna jab koi shikayat kare. Aise naam jo sirf ek insaan samajhta hai. Register ek hi dimaag mein rakhna. Bina log dekhe "Connection: Allow" par ticket close karna. Purani values likhe bina quota ya retention badalna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Registered aur connected ka matlab receiving nahi: log counts aur last log padho. Unregistered list entry ke bina connected devices dikhati hai. Disk ya devices ke monitoring dashboards aur alerts real product ke GUI features hain; simulator mein sirf upar ke commands hain.</p></div>

<div class="scn"><h4>Shant branch</h4><p>Weekly check mein dikha ki Trichy FortiGate ka last log chhe din purana hai. Kisi ne shikayat nahi ki thi, kyunki kisi ne Trichy logs search hi nahi kiye the. Register mein "owner: network team" tha, ticket unhe gaya, aur cause ek FortiGate policy thi jise edit karke logging band kar di gayi thi. Unhone use restore kiya aur runbook mein daily device-list check jodha.</p><p><b>Lesson:</b> monitoring ki aadat minutes mein wo dhoondhti hai jo audit mahinon mein dhoondhta hai.</p></div>

<div class="iv"><p class="q">"FortiAnalyzer ko saalon tak healthy kaise rakhte ho?"</p><p>Predictable naming, devices ka register jo real device list se compare hota hai, device status aur unregistered devices ke daily checks, storage aur quota counters ke weekly checks, known failures ke liye runbooks, aur proof ke saath tickets. Bolo ki FortiGate ke chup hone par FortiAnalyzer khud warning nahi dega.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek naming pattern use karo, FortiGate aur FortiAnalyzer mein ek jaisa.</li>
<li>Register rakho aur use device list se regularly compare karo.</li>
<li>Device status, unregistered devices aur last log daily; storage counters weekly check karo.</li>
<li>Known faults ke runbooks likho aur tickets sirf proof ke saath close karo.</li>
</ul></div>
`}};export{e as default};