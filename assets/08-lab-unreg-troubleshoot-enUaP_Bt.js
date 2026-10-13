var e={id:`lab-unreg-troubleshoot`,h:{en:`Lab fa-unreg-ts: three FortiGates, three reasons the logs do not arrive`,hi:`Lab fa-unreg-ts: teen FortiGates, logs na aane ki teen wajahein`},body:{en:`
<p>A doctor who hears "my stomach hurts" does not prescribe one medicine for everyone. She asks questions, looks at the patient, and finds that the three people in the waiting room have three different illnesses. This lab is the same. Log View is empty for all three Kaveri sites, but each FortiGate has a different cause. Your job is to diagnose each one with the right command, fix it, and then prove the result.</p>

<h3>The goal</h3>
<p>The three FortiGates were meant to log to FAZ-1 (192.0.2.6) since last week. One points to a wrong server address, one has logging switched off, and one is connected but nobody registered it. Fix all three and show that logs are stored for every site. The lab has four tasks. It is a troubleshooting lab, so we give you the reasoning and the evidence to look for, not the commands in a list.</p>

<h3>Step 0: take the same measurement on all three</h3>
<p>Before you change anything, run <code>execute log fortianalyzer test-connectivity</code> on each FortiGate and <code>execute fazui unregistered list</code> on FAZ-1. Three FortiGates, three different pictures. This is the habit that separates a quick diagnosis from guesswork: measure first, change second.</p>

<h3>HQ-FGT: the connection does not come up</h3>
<p>The task asks for the Connection line (two words). Compare what you see with chapter 5.</p>
<pre class="out">HQ-FGT # execute log fortianalyzer test-connectivity
FortiAnalyzer Host Name: -
FortiAnalyzer Serial: -
FortiAnalyzer Registration: unknown
<span class="hl">Connection: Connection timeout</span></pre>
<p>Empty host fields: nobody answered. Logging is on (otherwise the message would say it is disabled), so look at the address. <code>show log fortianalyzer setting</code> reads the server value:</p>
<pre class="out">HQ-FGT # show log fortianalyzer setting
config log fortianalyzer setting
    set status enable
    set server "192.0.2.66"
end</pre>
<p>The server is 192.0.2.66, but FAZ-1 is 192.0.2.6. A single extra digit. Correct the server, then run test-connectivity again. Do not stop at the fix: the new message may be a different one. On HQ-FGT it becomes Allow with Registration unregistered; that is the third fault, and it belongs to FAZ-1.</p>

<h3>TRY-FGT: the server is right, nothing connects</h3>
<p>Here the test does not even try:</p>
<pre class="out">TRY-FGT # execute log fortianalyzer test-connectivity
<span class="hl">FortiAnalyzer logging is disabled.</span> Enable it: config log fortianalyzer setting, set status enable.</pre>
<p>The task says the server is right but there is no connection. The command tells you the reason in plain words. To see the whole table, including defaults, use <code>show full-configuration log fortianalyzer setting</code>. You will see <code>set status disable</code> next to <code>set server "192.0.2.6"</code>. This is why chapter 3 stressed that plain <code>show</code> hides defaults: status disable is the default, so a plain show would not have printed it. Enable the status and test again.</p>

<h3>MDU-FGT: connected, but not registered</h3>
<p>MDU-FGT is the quiet one. Its connection is fine:</p>
<pre class="out">MDU-FGT # execute log fortianalyzer test-connectivity
FortiAnalyzer Host Name: FAZ-1
FortiAnalyzer Serial: FAZ-VMEVYXM9SG00
<span class="hl">FortiAnalyzer Registration: unregistered</span>
<span class="hl">Connection: Allow</span></pre>
<p>On FAZ-1 the unregistered list shows only MDU-FGT at the start (HQ and TRY are not yet connected). After you fix HQ and TRY, they appear in the list too, so the third task is to register all three. The task says "list the unregistered devices and register all three FortiGates in the ADOM root". Do the list first; it proves which devices connect after your fixes.</p>

<h3>The proof: logs for every site</h3>
<p>The last task asks you to open web sessions from all three PCs and check Log View. It also asks which transport the log connection uses when <code>reliable</code> is enabled. To answer from evidence, enable reliable on one FortiGate and read the mode in <code>diagnose test application miglogd 6</code> or <code>diagnose test application oftpd 3</code> on FAZ-1.</p>
<pre class="out">FAZ-1 # diagnose log device
Device          SN                  ADOM      Traffic  UTM    Event  Rejected  Last log
HQ-FGT          FGVMEV1RGF38I000    root      4        0      0      0         2026-10-12 20:45:07
MDU-FGT         FGVMEV1JOS6TJ000    root      4        0      0      0         2026-10-12 20:45:07
TRY-FGT         FGVMEV3X688U0000    root      4        0      0      0         2026-10-12 20:45:07</pre>
<p>Three rows, all in root, all with traffic logs and zero rejected. That is the evidence the lab wants. Also check that the unregistered list is empty again.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Three sites, three causes">
<rect x="20" y="20" width="190" height="64" rx="8" fill="#fed7aa"/><text x="115" y="46" text-anchor="middle" class="svg-ink" font-size="13">HQ-FGT</text><text x="115" y="66" text-anchor="middle" class="svg-muted" font-size="12">wrong server 192.0.2.66</text>
<rect x="225" y="20" width="190" height="64" rx="8" fill="#fed7aa"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text><text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="12">status disable</text>
<rect x="430" y="20" width="190" height="64" rx="8" fill="#fed7aa"/><text x="525" y="46" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT</text><text x="525" y="66" text-anchor="middle" class="svg-muted" font-size="12">not registered</text>
<rect x="225" y="130" width="190" height="56" rx="8" fill="#ddd6fe"/><text x="320" y="154" text-anchor="middle" class="svg-ink" font-size="13">FAZ-1 192.0.2.6</text><text x="320" y="172" text-anchor="middle" class="svg-muted" font-size="12">register all three</text>
<line x1="115" y1="84" x2="280" y2="130" stroke="#64748b" stroke-width="2"/><line x1="320" y1="84" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><line x1="525" y1="84" x2="360" y2="130" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Each FortiGate starts with a different fault; all three end registered on FAZ-1.</p></div>

<div class="eg"><p><b>Worked example.</b> A note for your log book: HQ-FGT, Connection timeout, empty host fields, server 192.0.2.66, corrected to 192.0.2.6, then Allow and unregistered, registered. TRY-FGT, logging disabled, status enabled, then Allow and unregistered, registered. MDU-FGT, Allow and unregistered from the start, registered. Write the finding, the evidence and the fix for each device; it is the style a ticket needs.</p></div>

<div class="warn"><p><b>Common wrong turns.</b> Registering HQ-FGT before the connection works: the device will not be in the list yet, and the register command refuses an unknown name. Changing the server on the wrong FortiGate. Declaring victory after the first Allow, without opening traffic from every PC. Forgetting that stored logs from before registration do not exist, so Log View may be empty until you generate new traffic.</p></div>

<div class="exam"><p><b>Exam traps.</b> Three symptoms (timeout, disabled, unregistered) map to three layers (address, setting, registration). Disabled logging is the default state. Reliable enable means TCP.</p></div>

<div class="scn"><h4>One ticket, three causes</h4><p>A service desk closed a ticket "logs missing from all branches" after fixing one address. The next week an auditor found two branches still empty. The engineer reopened it and measured each device separately: one had logging off after a firmware reset, one was never registered. The ticket was split into one line per device.</p><p><b>Lesson:</b> treat each device as its own case; a fix for one is not a fix for all.</p></div>

<div class="iv"><p class="q">"Logs are missing from three sites. Where do you start?"</p><p>I measure each site the same way before changing anything: test-connectivity on each FortiGate and the unregistered list on the FortiAnalyzer. Then I fix by layer: setting, address, path, registration, and re-test after every fix, finishing with traffic from each site and diagnose log device.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Measure all devices first; each may have a different fault.</li>
<li>Connection timeout with empty host fields points to the server address or path.</li>
<li>Logging disabled is shown plainly by test-connectivity; show hides the default.</li>
<li>Allow plus unregistered is fixed on FAZ-1 by registering the device.</li>
<li>Prove the result with traffic from every PC and diagnose log device.</li>
</ul></div>
`,hi:`
<p>Jo doctor sunti hai "mere pet mein dard hai" wo sabko ek hi dawa nahi deti. Wo sawal poochti hai, patient ko dekhti hai, aur paati hai ki waiting room ke teen logon ko teen alag bimariyan hain. Ye lab bhi waisa hi hai. Teeno Kaveri sites ke liye Log View khaali hai, par har FortiGate ki wajah alag hai. Aapka kaam hai har ek ko sahi command se diagnose karna, fix karna aur phir result saabit karna.</p>

<h3>Goal</h3>
<p>Teeno FortiGates ko pichhle hafte se FAZ-1 (192.0.2.6) ko log bhejne the. Ek galat server address par point karta hai, ek mein logging band hai, aur ek connected hai par kisi ne use register nahi kiya. Teeno fix karo aur dikhao ki har site ke logs stored hain. Lab mein chaar tasks hain. Ye troubleshooting lab hai, isliye hum reasoning aur dekhne wala evidence dete hain, commands ki list nahi.</p>

<h3>Step 0: teeno par same measurement lo</h3>
<p>Kuch badalne se pehle har FortiGate par <code>execute log fortianalyzer test-connectivity</code> aur FAZ-1 par <code>execute fazui unregistered list</code> chalao. Teen FortiGates, teen alag tasveerein. Yahi aadat tez diagnosis aur andaze mein fark karti hai: pehle naapo, phir badlo.</p>

<h3>HQ-FGT: connection up nahi hota</h3>
<p>Task Connection line poochta hai (do words). Jo dikhe use chapter 5 se compare karo.</p>
<pre class="out">HQ-FGT # execute log fortianalyzer test-connectivity
FortiAnalyzer Host Name: -
FortiAnalyzer Serial: -
FortiAnalyzer Registration: unknown
<span class="hl">Connection: Connection timeout</span></pre>
<p>Khaali host fields: kisi ne jawab nahi diya. Logging on hai (warna message kehta ki disabled hai), isliye address dekho. <code>show log fortianalyzer setting</code> server value padhta hai:</p>
<pre class="out">HQ-FGT # show log fortianalyzer setting
config log fortianalyzer setting
    set status enable
    set server "192.0.2.66"
end</pre>
<p>Server 192.0.2.66 hai, jabki FAZ-1 192.0.2.6 hai. Ek extra digit. Server sahi karo, phir test-connectivity dobara chalao. Fix par mat ruko: naya message alag ho sakta hai. HQ-FGT par wo Allow aur Registration unregistered ban jata hai; ye teesri fault hai, aur FAZ-1 ki hai.</p>

<h3>TRY-FGT: server sahi hai, kuch connect nahi hota</h3>
<p>Yahan test koshish bhi nahi karta:</p>
<pre class="out">TRY-FGT # execute log fortianalyzer test-connectivity
<span class="hl">FortiAnalyzer logging is disabled.</span> Enable it: config log fortianalyzer setting, set status enable.</pre>
<p>Task kehta hai server sahi hai par connection nahi. Command wajah saaf shabdon mein batati hai. Poori table, defaults ke saath, dekhne ke liye <code>show full-configuration log fortianalyzer setting</code> use karo. Aapko <code>set server "192.0.2.6"</code> ke paas <code>set status disable</code> dikhega. Isliye chapter 3 ne zor diya tha ki plain <code>show</code> defaults chhupata hai: status disable default hai, to plain show use print nahi karta. Status enable karo aur dobara test karo.</p>

<h3>MDU-FGT: connected, par registered nahi</h3>
<p>MDU-FGT shaant wala hai. Uska connection theek hai:</p>
<pre class="out">MDU-FGT # execute log fortianalyzer test-connectivity
FortiAnalyzer Host Name: FAZ-1
FortiAnalyzer Serial: FAZ-VMEVYXM9SG00
<span class="hl">FortiAnalyzer Registration: unregistered</span>
<span class="hl">Connection: Allow</span></pre>
<p>FAZ-1 par shuru mein unregistered list sirf MDU-FGT dikhati hai (HQ aur TRY abhi connected nahi). HQ aur TRY fix karne ke baad wo bhi list mein aate hain, isliye teesra task teeno FortiGates ko ADOM root mein register karna hai. Task kehta hai "unregistered devices list karo aur teeno FortiGates ko root mein register karo". Pehle list karo; wo saabit karti hai ki aapke fix ke baad kaun se devices connect hue.</p>

<h3>Saboot: har site ke logs</h3>
<p>Aakhri task teeno PCs se web sessions kholne aur Log View check karne ko kehta hai. Wo ye bhi poochta hai ki <code>reliable</code> enabled ho to log connection kaun sa transport use karta hai. Evidence se jawab dene ke liye ek FortiGate par reliable enable karo aur <code>diagnose test application miglogd 6</code> mein ya FAZ-1 par <code>diagnose test application oftpd 3</code> mein mode padho.</p>
<pre class="out">FAZ-1 # diagnose log device
Device          SN                  ADOM      Traffic  UTM    Event  Rejected  Last log
HQ-FGT          FGVMEV1RGF38I000    root      4        0      0      0         2026-10-12 20:45:07
MDU-FGT         FGVMEV1JOS6TJ000    root      4        0      0      0         2026-10-12 20:45:07
TRY-FGT         FGVMEV3X688U0000    root      4        0      0      0         2026-10-12 20:45:07</pre>
<p>Teen rows, sab root mein, sab ke traffic logs, rejected zero. Lab yahi evidence chahta hai. Ye bhi check karo ki unregistered list phir khaali hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Teen sites, teen wajahein">
<rect x="20" y="20" width="190" height="64" rx="8" fill="#fed7aa"/><text x="115" y="46" text-anchor="middle" class="svg-ink" font-size="13">HQ-FGT</text><text x="115" y="66" text-anchor="middle" class="svg-muted" font-size="12">galat server 192.0.2.66</text>
<rect x="225" y="20" width="190" height="64" rx="8" fill="#fed7aa"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text><text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="12">status disable</text>
<rect x="430" y="20" width="190" height="64" rx="8" fill="#fed7aa"/><text x="525" y="46" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT</text><text x="525" y="66" text-anchor="middle" class="svg-muted" font-size="12">registered nahi</text>
<rect x="225" y="130" width="190" height="56" rx="8" fill="#ddd6fe"/><text x="320" y="154" text-anchor="middle" class="svg-ink" font-size="13">FAZ-1 192.0.2.6</text><text x="320" y="172" text-anchor="middle" class="svg-muted" font-size="12">teeno register karo</text>
<line x1="115" y1="84" x2="280" y2="130" stroke="#64748b" stroke-width="2"/><line x1="320" y1="84" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><line x1="525" y1="84" x2="360" y2="130" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Har FortiGate alag fault se shuru hota hai; teeno FAZ-1 par registered hokar khatam hote hain.</p></div>

<div class="eg"><p><b>Worked example.</b> Apni log book ke liye note: HQ-FGT, Connection timeout, khaali host fields, server 192.0.2.66, 192.0.2.6 kiya, phir Allow aur unregistered, registered. TRY-FGT, logging disabled, status enabled, phir Allow aur unregistered, registered. MDU-FGT, shuru se Allow aur unregistered, registered. Har device ke liye finding, evidence aur fix likho; ticket ka yahi style hota hai.</p></div>

<div class="warn"><p><b>Common wrong turns.</b> Connection chalne se pehle HQ-FGT register karna: device abhi list mein nahi hoga, aur register command unknown naam refuse karti hai. Galat FortiGate par server badalna. Pehle Allow par jeet ghoshit karna, bina har PC se traffic kholne ke. Ye bhoolna ki registration se pehle ke stored logs exist nahi karte, isliye naya traffic banane tak Log View khaali ho sakti hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Teen symptoms (timeout, disabled, unregistered) teen layers (address, setting, registration) se mapped hain. Disabled logging default state hai. Reliable enable matlab TCP.</p></div>

<div class="scn"><h4>Ek ticket, teen wajahein</h4><p>Ek service desk ne "saare branches se logs missing" ticket ek address fix karke band kar diya. Agle hafte auditor ne do branches ab bhi khaali paaye. Engineer ne ticket reopen kiya aur har device alag naapa: ek mein firmware reset ke baad logging off thi, ek kabhi register hi nahi hua tha. Ticket ko har device ki ek line mein baanta gaya.</p><p><b>Lesson:</b> har device ko alag case maano; ek ka fix sabka fix nahi.</p></div>

<div class="iv"><p class="q">"Teen sites se logs missing hain. Kahan se shuru karoge?"</p><p>Kuch badalne se pehle har site ko same tarah naapta hoon: har FortiGate par test-connectivity aur FortiAnalyzer par unregistered list. Phir layer ke hisaab se fix karta hoon: setting, address, path, registration, aur har fix ke baad re-test, ant mein har site se traffic aur diagnose log device.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle saare devices naapo; har ek ki fault alag ho sakti hai.</li>
<li>Khaali host fields ke saath Connection timeout server address ya path ki taraf ishara karta hai.</li>
<li>Logging disabled test-connectivity saaf batata hai; show default chhupata hai.</li>
<li>Allow aur unregistered FAZ-1 par device register karke theek hota hai.</li>
<li>Har PC ke traffic aur diagnose log device se result saabit karo.</li>
</ul></div>
`}};export{e as default};