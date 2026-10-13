var e={id:`lab-fa-report-ts`,h:{en:`Lab fa-report-ts: the Madurai and Trichy reports are empty`,hi:`Lab fa-report-ts: Madurai aur Trichy ki reports khaali hain`},body:{en:`
<p>A doctor who hears "my stomach hurts" does not prescribe at once. The doctor asks, examines and finds out whether it is one problem or two. This troubleshooting lab is the same: two reports are empty, and they look identical, but their causes are different. If you fix only the first cause, you will believe the job is done while the second branch is still blind.</p>

<h3>The ticket</h3>
<p>The Traffic Reports for MDU-FGT and TRY-FGT come back with zero sessions although both branches work all day. The hint in the brief tells you that there are two different causes: one report is run in the wrong ADOM, and one FortiGate was never registered, so its logs were thrown away. The lab has FAZ-1, SW-NET, SRV-WEB, HQ-FGT, MDU-FGT, TRY-FGT and one PC at each site. The ADOMs are Corporate and Retail.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Two causes for two empty reports">
<rect x="20" y="20" width="280" height="160" rx="10" fill="#fde68a"/><text x="160" y="46" text-anchor="middle" class="svg-ink" font-size="14">Fault A: MDU-FGT</text>
<text x="40" y="78" class="svg-ink" font-size="12">Registered, logs stored in Retail</text><text x="40" y="102" class="svg-ink" font-size="12">Report run in Corporate</text><text x="40" y="126" class="svg-muted" font-size="12">Proof: diagnose dvm device list</text><text x="40" y="150" class="svg-accent" font-size="12">Fix: run the report in Retail</text>
<rect x="340" y="20" width="280" height="160" rx="10" fill="#fed7aa"/><text x="480" y="46" text-anchor="middle" class="svg-ink" font-size="14">Fault B: TRY-FGT</text>
<text x="360" y="78" class="svg-ink" font-size="12">Connected, never registered</text><text x="360" y="102" class="svg-ink" font-size="12">Logs discarded, nothing stored</text><text x="360" y="126" class="svg-muted" font-size="12">Proof: unregistered list</text><text x="360" y="150" class="svg-accent" font-size="12">Fix: register, then new traffic</text>
</svg><p class="cap">Same symptom, two causes, two different proofs.</p></div>

<h3>Approach, step by step</h3>
<ol>
<li><b>Create the traffic.</b> Open three web sessions from each of PC-HQ, PC-MDU and PC-TRY with the <code>curl</code> command towards SRV-WEB (192.0.2.80). Wait a few seconds.</li>
<li><b>Reproduce the symptom.</b> Run the Traffic Report for MDU-FGT in the ADOM Corporate. It is empty.</li>
<li><b>Ask where the device lives.</b> <code>diagnose dvm device list</code> prints the ADOM of every device. Run the report again in that ADOM.</li>
<li><b>Look at the second branch.</b> TRY-FGT is empty in every ADOM. List the unregistered devices, register TRY-FGT in Retail, create new web sessions from PC-TRY and run its report.</li>
<li><b>Answer the theory question:</b> logs older than the analytics retention move to the archive, and reports do not read the archive.</li>
</ol>

<h3>What the evidence looks like</h3>
<p>The empty report is honest about its basis line:</p>
<pre class="out">FAZ-1 # execute fazui report run Corporate MDU-FGT "Traffic Report"
Report: Traffic Report   ADOM: Corporate   Device: MDU-FGT
<span class="hl">Based on 0 stored analytics logs (0 traffic, 0 utm, 0 event).</span></pre>
<p>The device list shows the ADOM column. MDU-FGT is not in Corporate:</p>
<pre class="out">FAZ-1 # diagnose dvm device list
faz-log  678  FGVMEV1RGF38I000 ... HQ-FGT   <span class="hl">Corporate</span>
faz-log  171  FGVMEV1JOS6TJ000 ... MDU-FGT  <span class="hl">Retail</span></pre>
<p>The Trichy FortiGate is connected but unknown. The counter shows how many logs were thrown away:</p>
<pre class="out">FAZ-1 # execute fazui unregistered list
NAME            SERIAL              IP              LOGS DISCARDED  LAST LOG SEEN
TRY-FGT         FGVMEV3X688U0000    192.0.2.13      <span class="hl">3</span>               2026-10-12 21:35:52
FAZ-1 # execute fazui register TRY-FGT Retail
Device TRY-FGT (FGVMEV3X688U0000) registered in ADOM Retail.
<span class="hl">3 logs received while it was unregistered were discarded.</span> Logs received from now on are stored.</pre>

<div class="eg"><p><b>Worked example of the reasoning.</b> After the fix, the MDU-FGT report in Retail shows three sessions from 10.20.0.10, matching the three web requests from PC-MDU. TRY-FGT shows nothing until you create new sessions, because the three discarded logs are gone for good. The report after new traffic then shows the sessions from 10.30.0.10.</p></div>

<h3>Common wrong turns</h3>
<ul>
<li><b>Registering MDU-FGT again.</b> It is already registered. The tool answers that it is already registered, and nothing changes.</li>
<li><b>Registering TRY-FGT in Corporate</b> because the first report was run there. The brief wants Retail, where the Madurai branch lives, so the Retail reports cover both branches.</li>
<li><b>Running the TRY-FGT report straight after registering.</b> No new traffic means no new logs; the report is still empty.</li>
<li><b>Stopping after the first fix.</b> Run both reports at the end and check that each has sessions.</li>
<li><b>Looking at the quota first.</b> A fresh lab has a default 1000 MB quota and nothing to overwrite. Follow the order of chapter 4.</li>
</ul>

<div class="warn"><p><b>Honest limit.</b> The simulator lists an unregistered device only while it is connected. The real product keeps unregistered devices in its list until you delete them.</p></div>

<div class="exam"><p><b>Exam traps.</b> Registering is not retroactive. A report in an ADOM that does not contain the device is empty, not an error. The archive is the one-word answer to the theory question.</p></div>

<div class="scn"><h4>The ADOM that moved nothing</h4><p>After a reorganisation the Madurai FortiGate was placed in Retail, but the weekly report job still named Corporate. For weeks it printed zeros and nobody questioned it, because zero was plausible for a quiet branch. A new engineer compared the basis line with the device list and spotted the mismatch in two minutes.</p><p><b>Lesson:</b> an empty report with no error is a prompt to check the scope, not proof of silence.</p></div>

<div class="iv"><p class="q">"Two branches both show empty reports. What do you do?"</p><p>Treat them as two separate problems. For each, check ADOM and device name, then registration, then log counters. Explain that a wrong ADOM is a scope problem and an unregistered device is a data problem, and that registration does not recover earlier logs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Identical empty reports can have different causes; test each one.</li>
<li>The device list shows the ADOM; the unregistered list shows discarded logs.</li>
<li>Registering starts storage from the next log; nothing is recovered.</li>
<li>Create new traffic after every fix before you re-run the report.</li>
<li>Reports read analytics logs only; older logs sit in the archive.</li>
</ul></div>
`,hi:`
<p>Doctor "mere pet mein dard hai" sunkar turant dawa nahi likhta. Wo poochta hai, jaanch karta hai aur dekhta hai ki problem ek hai ya do. Ye troubleshooting lab bhi aisi hi hai: do reports khaali hain, ek jaisi dikhti hain, par unke karan alag hain. Agar aap sirf pehla karan theek karoge, to lagega kaam ho gaya jabki doosri branch ab bhi andhi hai.</p>

<h3>Ticket</h3>
<p>MDU-FGT aur TRY-FGT ke Traffic Reports zero sessions ke saath aate hain jabki dono branches din bhar chalti hain. Brief ka hint batata hai ki do alag karan hain: ek report galat ADOM mein chalayi gayi hai, aur ek FortiGate kabhi register nahi hua, isliye uske logs phenk diye gaye. Lab mein FAZ-1, SW-NET, SRV-WEB, HQ-FGT, MDU-FGT, TRY-FGT aur har site par ek PC hai. ADOMs Corporate aur Retail hain.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Do khaali reports ke do karan">
<rect x="20" y="20" width="280" height="160" rx="10" fill="#fde68a"/><text x="160" y="46" text-anchor="middle" class="svg-ink" font-size="14">Fault A: MDU-FGT</text>
<text x="40" y="78" class="svg-ink" font-size="12">Registered, logs Retail mein store</text><text x="40" y="102" class="svg-ink" font-size="12">Report Corporate mein chalayi</text><text x="40" y="126" class="svg-muted" font-size="12">Saboot: diagnose dvm device list</text><text x="40" y="150" class="svg-accent" font-size="12">Fix: report Retail mein chalao</text>
<rect x="340" y="20" width="280" height="160" rx="10" fill="#fed7aa"/><text x="480" y="46" text-anchor="middle" class="svg-ink" font-size="14">Fault B: TRY-FGT</text>
<text x="360" y="78" class="svg-ink" font-size="12">Connected, kabhi register nahi</text><text x="360" y="102" class="svg-ink" font-size="12">Logs discard, kuch store nahi</text><text x="360" y="126" class="svg-muted" font-size="12">Saboot: unregistered list</text><text x="360" y="150" class="svg-accent" font-size="12">Fix: register, phir naya traffic</text>
</svg><p class="cap">Symptom ek, karan do, saboot alag-alag.</p></div>

<h3>Approach, step by step</h3>
<ol>
<li><b>Traffic banao.</b> PC-HQ, PC-MDU aur PC-TRY se <code>curl</code> command se SRV-WEB (192.0.2.80) ke teen-teen web sessions kholo. Kuch second ruko.</li>
<li><b>Symptom reproduce karo.</b> MDU-FGT ka Traffic Report ADOM Corporate mein chalao. Wo khaali hai.</li>
<li><b>Poocho device kahan rehta hai.</b> <code>diagnose dvm device list</code> har device ka ADOM print karta hai. Report usi ADOM mein dobara chalao.</li>
<li><b>Doosri branch dekho.</b> TRY-FGT har ADOM mein khaali hai. Unregistered devices list karo, TRY-FGT ko Retail mein register karo, PC-TRY se naye web sessions banao aur uski report chalao.</li>
<li><b>Theory sawal ka jawab do:</b> analytics retention se purane logs archive mein chale jate hain, aur reports archive nahi padhti.</li>
</ol>

<h3>Evidence kaisa dikhta hai</h3>
<p>Khaali report apni basis line mein imaandar hai:</p>
<pre class="out">FAZ-1 # execute fazui report run Corporate MDU-FGT "Traffic Report"
Report: Traffic Report   ADOM: Corporate   Device: MDU-FGT
<span class="hl">Based on 0 stored analytics logs (0 traffic, 0 utm, 0 event).</span></pre>
<p>Device list ADOM column dikhati hai. MDU-FGT Corporate mein nahi hai:</p>
<pre class="out">FAZ-1 # diagnose dvm device list
faz-log  678  FGVMEV1RGF38I000 ... HQ-FGT   <span class="hl">Corporate</span>
faz-log  171  FGVMEV1JOS6TJ000 ... MDU-FGT  <span class="hl">Retail</span></pre>
<p>Trichy ka FortiGate connected hai par anjaan. Counter batata hai kitne logs phenke gaye:</p>
<pre class="out">FAZ-1 # execute fazui unregistered list
NAME            SERIAL              IP              LOGS DISCARDED  LAST LOG SEEN
TRY-FGT         FGVMEV3X688U0000    192.0.2.13      <span class="hl">3</span>               2026-10-12 21:35:52
FAZ-1 # execute fazui register TRY-FGT Retail
Device TRY-FGT (FGVMEV3X688U0000) registered in ADOM Retail.
<span class="hl">3 logs received while it was unregistered were discarded.</span> Logs received from now on are stored.</pre>

<div class="eg"><p><b>Reasoning ka worked example.</b> Fix ke baad Retail mein MDU-FGT ki report 10.20.0.10 ke teen sessions dikhati hai, jo PC-MDU ke teen web requests se match karte hain. TRY-FGT naye sessions banane tak kuch nahi dikhata, kyunki teen discarded logs hamesha ke liye gaye. Naye traffic ke baad report 10.30.0.10 ke sessions dikhati hai.</p></div>

<h3>Common wrong turns</h3>
<ul>
<li><b>MDU-FGT ko dobara register karna.</b> Wo already registered hai. Tool kehta hai already registered hai, aur kuch nahi badalta.</li>
<li><b>TRY-FGT ko Corporate mein register karna</b> kyunki pehli report wahan chalayi thi. Brief Retail chahta hai, jahan Madurai branch rehti hai, taaki Retail reports dono branches cover karein.</li>
<li><b>Register karte hi TRY-FGT ki report chalana.</b> Naya traffic nahi to naye logs nahi; report ab bhi khaali hai.</li>
<li><b>Pehle fix par ruk jana.</b> Aakhir mein dono reports chalao aur check karo ki har ek mein sessions hain.</li>
<li><b>Pehle quota dekhna.</b> Fresh lab mein default 1000 MB quota hai aur overwrite karne ko kuch nahi. Chapter 4 ka order follow karo.</li>
</ul>

<div class="warn"><p><b>Honest limit.</b> Simulator unregistered device ko sirf tab list karta hai jab wo connected ho. Real product unregistered devices ko delete karne tak list mein rakhta hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Registration retroactive nahi hoti. Jis ADOM mein device nahi hai wahan report khaali aati hai, error nahi. Theory sawal ka ek-shabd jawab archive hai.</p></div>

<div class="scn"><h4>Wo ADOM jisme kuch move nahi hua</h4><p>Reorganisation ke baad Madurai FortiGate Retail mein rakha gaya, par weekly report job ab bhi Corporate naam leti thi. Kai hafte wo zeros print karti rahi aur kisi ne sawal nahi uthaya, kyunki shaant branch ke liye zero maqool lagta tha. Ek naye engineer ne basis line ko device list se compare kiya aur do minute mein mismatch pakad liya.</p><p><b>Lesson:</b> bina error ke khaali report scope check karne ka ishara hai, khamoshi ka saboot nahi.</p></div>

<div class="iv"><p class="q">"Do branches ki reports khaali hain. Kya karoge?"</p><p>Unhe do alag problems maano. Har ek ke liye ADOM aur device name check karo, phir registration, phir log counters. Samjhao ki galat ADOM scope problem hai aur unregistered device data problem hai, aur registration purane logs wapas nahi laati.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek jaisi khaali reports ke alag karan ho sakte hain; har ek test karo.</li>
<li>Device list ADOM dikhati hai; unregistered list discarded logs dikhati hai.</li>
<li>Register karne se storage agle log se shuru hota hai; kuch recover nahi hota.</li>
<li>Har fix ke baad report dobara chalane se pehle naya traffic banao.</li>
<li>Reports sirf analytics logs padhti hain; purane logs archive mein hain.</li>
</ul></div>
`}};export{e as default};