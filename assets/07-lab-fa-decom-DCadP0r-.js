var e={id:`lab-fa-decom`,h:{en:`Lab fa-decom: retire the Madurai store FortiGate cleanly`,hi:`Lab fa-decom: Madurai store FortiGate ko saaf tarike se retire karo`},body:{en:`
<p>A tenant leaving a flat does not just hand back the key. The landlord checks the meter, cancels the electricity connection and keeps the old bills for the tax office. This lab is that handover for a firewall. The Madurai store of Kaveri Retail is closing, MDU-FGT will be switched off next week, and your job is to remove it from FAZ-1 so nothing is left half-done. The lab runs in the simulator (type: config, about 30 minutes).</p>

<h3>The goal</h3>
<p>At the end: MDU-FGT is no longer in the device table of FAZ-1, it does not appear in the unregistered list, logging is switched off on the FortiGate, HQ-FGT is still registered and connected, and the logs stored for MDU-FGT before the removal can still be searched. HQ-FGT must not be touched.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Lab fa-decom plan">
<rect x="10" y="30" width="140" height="60" rx="8" fill="#bae6fd"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="13">Task 1</text><text x="80" y="73" text-anchor="middle" class="svg-muted" font-size="12">last logs stored</text>
<rect x="170" y="30" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="13">Task 2</text><text x="240" y="73" text-anchor="middle" class="svg-muted" font-size="12">delete the row</text>
<rect x="330" y="30" width="140" height="60" rx="8" fill="#fde68a"/><text x="400" y="55" text-anchor="middle" class="svg-ink" font-size="13">Task 3</text><text x="400" y="73" text-anchor="middle" class="svg-muted" font-size="12">stop the logging</text>
<rect x="490" y="30" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="55" text-anchor="middle" class="svg-ink" font-size="13">Task 4</text><text x="560" y="73" text-anchor="middle" class="svg-muted" font-size="12">old logs remain</text>
<line x1="150" y1="60" x2="170" y2="60" stroke="#64748b" stroke-width="2"/><line x1="310" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><line x1="470" y1="60" x2="490" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="10" y="125" class="svg-muted" font-size="12">Devices: FAZ-1, MDU-FGT, PC-MDU (the store), HQ-FGT (must stay untouched), SRV-WEB.</text>
</svg><p class="cap">Four tasks, each with a proof.</p></div>

<h3>Task 1: make sure there are logs to keep</h3>
<p><b>Approach.</b> From PC-MDU open three web sessions to SRV-WEB at 192.0.2.80 (the lab task gives the exact curl command; it is a plain request on port 80). Each request passes through MDU-FGT policy 1 and becomes a traffic log. <b>Why:</b> task 4 needs something to find, and the lab checks that logs were stored before you delete. <b>Look for:</b> in <code>diagnose log device</code> the Traffic column of MDU-FGT rises to 3.</p>
<p><b>Wrong turn:</b> doing the deletion first. After the row is gone, new logs are no longer stored, so you cannot create the evidence afterwards.</p>

<h3>Task 2: delete the entry and read the consequence</h3>
<p><b>Approach.</b> On FAZ-1 use <code>diagnose dvm device delete &lt;adom&gt; &lt;device&gt;</code> with the ADOM root and the name of the Madurai device, then <code>execute fazui unregistered list</code>. The question asks under which list the device now shows up, in one word. <b>Why:</b> MDU-FGT still has <code>status enable</code> and the server 192.0.2.6, so it keeps connecting. A connected device without a row is unregistered. <b>Look for:</b></p>
<pre class="out">FAZ-1 # execute fazui unregistered list
Unregistered devices (connected through OFTP/514, logs are discarded until they are registered):
NAME            SERIAL              IP              LOGS DISCARDED  LAST LOG SEEN
<span class="hl">MDU-FGT         FGVMEV1JOS6TJ000    192.0.2.12      0               -</span></pre>
<p>The answer is the word at the head of the heading: <b>unregistered</b>. The counter "LOGS DISCARDED" starts at 0 here and grows when the FortiGate sends more logs. <b>Wrong turns:</b> a wrong ADOM name (the command answers that the device is not found in that ADOM; the name in the table is the device name, not the model); deleting HQ-FGT by mistake, which breaks the rest of the lab (read the name twice).</p>

<h3>Task 3: stop the cause on the FortiGate</h3>
<p><b>Approach.</b> On MDU-FGT, enter <code>config log fortianalyzer setting</code>, set the status to disable and run <code>end</code>. Then repeat the unregistered list on FAZ-1. <b>Why:</b> the entry on FAZ-1 is only the symptom; the source is the FortiGate logging setting. <b>Look for:</b> "There are no unregistered devices." and, on MDU-FGT, <code>diagnose test application miglogd 6</code> printing "Log servers: none (FortiAnalyzer logging is disabled)." Then check that HQ-FGT is intact:</p>
<pre class="out">FAZ-1 # diagnose device list
Registered devices (1):
NAME            SERIAL              ADOM        IP              CONN  LOGS (traffic/utm/event)  LAST LOG
HQ-FGT          FGVMEV1RGF38I000    root        192.0.2.11      up    3/0/0                     2026-10-12 20:57:58
<span class="hl">Unregistered devices (0)</span>: connected, logs discarded until the device is registered</pre>
<p><b>Wrong turns:</b> typing <code>set status disable</code> on HQ-FGT (the lab checks that HQ-FGT is still registered); forgetting <code>end</code>, so the change is never applied; deleting the server address instead of disabling the status (it works for the list, but the runbook says disable first and keep the settings until the unit is physically gone).</p>

<h3>Task 4: the stored logs stay</h3>
<p><b>Approach.</b> Run <code>execute fazui logview root MDU-FGT traffic</code> and answer yes or no. <b>Look for:</b></p>
<pre class="out">FAZ-1 # execute fazui logview root MDU-FGT traffic limit 1
Log View  adom=root device=MDU-FGT type=traffic
<span class="hl">3 logs match, 1 shown (newest first).</span></pre>
<p>Three logs match even though the device entry is gone. The answer is yes. <b>Why it works:</b> deleting a device removes the row, not the stored logs; they leave only through retention or quota. In the real product Log View is a GUI page and you would pick the old device from its list; the name of the simulator command is a stand-in.</p>

<div class="eg"><p><b>Worked example of a proof table.</b> Put these four facts in the ticket: (1) before: MDU-FGT registered, three traffic logs; (2) after the delete: MDU-FGT in the unregistered list; (3) after disabling: unregistered list empty, HQ-FGT registered and up; (4) three MDU-FGT logs still found in Log View. A reader who was not there can see that the job was done in the right order.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Stopping after the delete because no error appeared. Answering task 2 from theory without running the list. Trusting that an empty unregistered list means no problem before you have waited for the FortiGate to reconnect. Forgetting that the decommission of the real unit must also remove its cabling and its addresses from other lists (firewall rules, monitoring).</p></div>

<div class="exam"><p><b>Exam traps.</b> One word for the list: unregistered. Deleting a device does not delete its logs. The FortiGate setting, not the FortiAnalyzer, ends the unregistered entry.</p></div>

<div class="scn"><h4>The decommission with proof</h4><p>An auditor asked six months later why the Madurai store logs ended on a Friday. The network team opened the ticket from the lab-style checklist: three outputs showed the delete, the empty unregistered list and the old logs still searchable. The question closed in two minutes.</p><p><b>Lesson:</b> a retirement is finished when you can show what was removed, what was kept, and that nothing else changed.</p></div>

<div class="iv"><p class="q">"Walk me through decommissioning a branch FortiGate from the logging system."</p><p>Preserve what the compliance rule needs, delete the device entry on the FortiAnalyzer in the change window, disable logging on the FortiGate so the unit does not reappear as unregistered, check that other devices are untouched, and confirm that old logs are still searchable. Keep the outputs in the ticket.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Create the last logs first; the lab checks that they were stored.</li>
<li>Delete on FAZ-1, then expect the device in the unregistered list.</li>
<li>End the cycle on the FortiGate with status disable; then the list is empty.</li>
<li>Old logs stay searchable; retention and quota decide when they go.</li>
<li>Never touch HQ-FGT; prove it with the registered list.</li>
</ul></div>
`,hi:`
<p>Flat chhodne wala kirayedaar sirf chaabi wapas nahi karta. Landlord meter check karta hai, bijli connection cancel karta hai aur purane bills tax office ke liye rakhta hai. Ye lab firewall ke liye wahi handover hai. Kaveri Retail ka Madurai store band ho raha hai, MDU-FGT agle hafte switch off hoga, aur aapka kaam use FAZ-1 se is tarah hatana hai ki kuch aadha na chhute. Lab simulator mein chalta hai (type: config, lagbhag 30 minutes).</p>

<h3>Goal</h3>
<p>End mein: MDU-FGT FAZ-1 ki device table mein nahi hai, unregistered list mein nahi dikhta, FortiGate par logging band hai, HQ-FGT abhi bhi registered aur connected hai, aur removal se pehle MDU-FGT ke jo logs stored the wo ab bhi search ho sakte hain. HQ-FGT ko haath nahi lagana.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Lab fa-decom plan">
<rect x="10" y="30" width="140" height="60" rx="8" fill="#bae6fd"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="13">Task 1</text><text x="80" y="73" text-anchor="middle" class="svg-muted" font-size="12">last logs stored</text>
<rect x="170" y="30" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="13">Task 2</text><text x="240" y="73" text-anchor="middle" class="svg-muted" font-size="12">row delete</text>
<rect x="330" y="30" width="140" height="60" rx="8" fill="#fde68a"/><text x="400" y="55" text-anchor="middle" class="svg-ink" font-size="13">Task 3</text><text x="400" y="73" text-anchor="middle" class="svg-muted" font-size="12">logging band</text>
<rect x="490" y="30" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="55" text-anchor="middle" class="svg-ink" font-size="13">Task 4</text><text x="560" y="73" text-anchor="middle" class="svg-muted" font-size="12">purane logs bache</text>
<line x1="150" y1="60" x2="170" y2="60" stroke="#64748b" stroke-width="2"/><line x1="310" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><line x1="470" y1="60" x2="490" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="10" y="125" class="svg-muted" font-size="12">Devices: FAZ-1, MDU-FGT, PC-MDU (store), HQ-FGT (untouched rahega), SRV-WEB.</text>
</svg><p class="cap">Chaar tasks, har ek ka proof.</p></div>

<h3>Task 1: pehle ensure karo ki rakhne layak logs hain</h3>
<p><b>Approach.</b> PC-MDU se SRV-WEB (192.0.2.80) ke liye teen web sessions kholo (lab task exact curl command deta hai; ye port 80 par simple request hai). Har request MDU-FGT ki policy 1 se guzarti hai aur traffic log banti hai. <b>Kyun:</b> task 4 ko dhoondhne ke liye kuch chahiye, aur lab check karta hai ki delete se pehle logs store hue. <b>Kya dekhna hai:</b> <code>diagnose log device</code> mein MDU-FGT ka Traffic column 3 tak badhta hai.</p>
<p><b>Wrong turn:</b> deletion pehle kar dena. Row jaane ke baad naye logs store nahi hote, isliye baad mein evidence nahi bana sakte.</p>

<h3>Task 2: entry delete karo aur nateeja padho</h3>
<p><b>Approach.</b> FAZ-1 par <code>diagnose dvm device delete &lt;adom&gt; &lt;device&gt;</code> use karo, ADOM root aur Madurai device ke naam ke saath, phir <code>execute fazui unregistered list</code>. Sawal poochta hai ki device ab kis list mein dikhta hai, ek word mein. <b>Kyun:</b> MDU-FGT par abhi <code>status enable</code> aur server 192.0.2.6 hai, isliye wo connect karta rehta hai. Row ke bina connected device unregistered hota hai. <b>Kya dekhna hai:</b></p>
<pre class="out">FAZ-1 # execute fazui unregistered list
Unregistered devices (connected through OFTP/514, logs are discarded until they are registered):
NAME            SERIAL              IP              LOGS DISCARDED  LAST LOG SEEN
<span class="hl">MDU-FGT         FGVMEV1JOS6TJ000    192.0.2.12      0               -</span></pre>
<p>Jawab heading ka pehla word hai: <b>unregistered</b>. "LOGS DISCARDED" counter yahan 0 se shuru hota hai aur FortiGate ke aur logs bhejne par badhta hai. <b>Wrong turns:</b> galat ADOM name (command batati hai ki us ADOM mein device nahi mila; table mein naam device ka hota hai, model ka nahi); galti se HQ-FGT delete kar dena, jisse baaki lab toot jaata hai (naam do baar padho).</p>

<h3>Task 3: FortiGate par cause roko</h3>
<p><b>Approach.</b> MDU-FGT par <code>config log fortianalyzer setting</code> mein jao, status disable set karo aur <code>end</code> chalao. Phir FAZ-1 par unregistered list dobara dekho. <b>Kyun:</b> FAZ-1 ki entry sirf symptom hai; source FortiGate ki logging setting hai. <b>Kya dekhna hai:</b> "There are no unregistered devices." aur MDU-FGT par <code>diagnose test application miglogd 6</code> "Log servers: none (FortiAnalyzer logging is disabled)." print kare. Phir check karo ki HQ-FGT intact hai:</p>
<pre class="out">FAZ-1 # diagnose device list
Registered devices (1):
NAME            SERIAL              ADOM        IP              CONN  LOGS (traffic/utm/event)  LAST LOG
HQ-FGT          FGVMEV1RGF38I000    root        192.0.2.11      up    3/0/0                     2026-10-12 20:57:58
<span class="hl">Unregistered devices (0)</span>: connected, logs discarded until the device is registered</pre>
<p><b>Wrong turns:</b> HQ-FGT par <code>set status disable</code> type kar dena (lab check karta hai ki HQ-FGT abhi registered hai); <code>end</code> bhool jaana, isse change apply hi nahi hota; status disable karne ki jagah server address hata dena (list ke liye chalta hai, par runbook kehta hai pehle disable karo aur unit physically jaane tak settings rakho).</p>

<h3>Task 4: stored logs bache rehte hain</h3>
<p><b>Approach.</b> <code>execute fazui logview root MDU-FGT traffic</code> chalao aur yes ya no mein jawab do. <b>Kya dekhna hai:</b></p>
<pre class="out">FAZ-1 # execute fazui logview root MDU-FGT traffic limit 1
Log View  adom=root device=MDU-FGT type=traffic
<span class="hl">3 logs match, 1 shown (newest first).</span></pre>
<p>Device entry jaane ke baad bhi teen logs match karte hain. Jawab yes hai. <b>Ye kaam kyun karta hai:</b> device delete karne se row hatti hai, stored logs nahi; wo sirf retention ya quota se jaate hain. Real product mein Log View GUI page hai aur aap uski list se purana device chunte ho; simulator command ka naam stand-in hai.</p>

<div class="eg"><p><b>Proof table ka worked example.</b> Ticket mein ye chaar facts rakho: (1) pehle: MDU-FGT registered, teen traffic logs; (2) delete ke baad: MDU-FGT unregistered list mein; (3) disable ke baad: unregistered list khaali, HQ-FGT registered aur up; (4) Log View mein MDU-FGT ke teen logs ab bhi mile. Jo reader wahan nahi tha wo dekh sakta hai ki kaam sahi order mein hua.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Delete ke baad ruk jana kyunki error nahi aaya. Task 2 ka jawab list chalaye bina theory se dena. Khaali unregistered list ko "koi problem nahi" maan lena jabki FortiGate ke reconnect hone ka intezaar nahi kiya. Ye bhool jaana ki asli unit ke decommission mein uski cabling aur doosri lists (firewall rules, monitoring) se addresses bhi hatane hote hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> List ke liye ek word: unregistered. Device delete karne se uske logs delete nahi hote. Unregistered entry ko FortiGate setting khatam karti hai, FortiAnalyzer nahi.</p></div>

<div class="scn"><h4>Proof ke saath decommission</h4><p>Chhe mahine baad auditor ne poocha ki Madurai store ke logs Friday ko kyun ruk gaye. Network team ne lab-style checklist se ticket kholi: teen outputs ne delete, khaali unregistered list aur abhi bhi searchable purane logs dikhaye. Sawal do minute mein band hua.</p><p><b>Lesson:</b> retirement tab poori hai jab aap dikha sako ki kya hataya, kya rakha, aur kuch aur nahi badla.</p></div>

<div class="iv"><p class="q">"Logging system se branch FortiGate decommission karne ka process batao."</p><p>Compliance rule ko jo chahiye wo preserve karo, change window mein FortiAnalyzer par device entry delete karo, FortiGate par logging disable karo taaki unit unregistered ban kar wapas na aaye, check karo ki baaki devices untouched hain, aur confirm karo ki purane logs searchable hain. Outputs ticket mein rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle aakhri logs banao; lab check karta hai ki wo store hue.</li>
<li>FAZ-1 par delete karo, phir device ko unregistered list mein expect karo.</li>
<li>Cycle FortiGate par status disable se khatam karo; tab list khaali hoti hai.</li>
<li>Purane logs searchable rehte hain; retention aur quota tay karte hain ki kab jaayein.</li>
<li>HQ-FGT ko kabhi mat chhuo; registered list se prove karo.</li>
</ul></div>
`}};export{e as default};