var e={id:`lab-fm-decom`,h:{en:`Lab fm-decom: replace the head-office FortiGate`,hi:`Lab fm-decom: head-office FortiGate ko replace karo`},body:{en:`
<p>Moving house is a good picture for this lab. You take your name off the old address register, you do not demolish the old house, and you register at the new address. Nothing is lost if you do the steps in the right order, and one missed step leaves you receiving letters at the wrong place. In this lab HQ-FGT is removed from the device database, appears again as a stranger, and is then registered in a new ADOM. MDU-FGT must stay exactly as it is.</p>

<div class="eg"><p><b>The scenario.</b> "HQ-FGT is being replaced and the new unit will manage the corporate network on its own. Remove the old entry from the device database, see what FortiManager shows afterwards, create the ADOM Corporate and authorize the device into it." Devices: FMG-1, SW-NET, SRV-WEB, HQ-FGT, SW-HQ, PC-HQ, MDU-FGT, SW-MDU, PC-MDU. About 25 minutes. Three tasks.</p></div>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Lab sequence">
<rect x="10" y="30" width="136" height="50" rx="6" fill="#bae6fd"/><text x="78" y="52" text-anchor="middle" class="svg-ink" font-size="12">Managed in</text><text x="78" y="68" text-anchor="middle" class="svg-ink" font-size="12">ADOM Kaveri</text>
<rect x="172" y="30" width="136" height="50" rx="6" fill="#fed7aa"/><text x="240" y="52" text-anchor="middle" class="svg-ink" font-size="12">Deleted:</text><text x="240" y="68" text-anchor="middle" class="svg-ink" font-size="12">unauthorized</text>
<rect x="334" y="30" width="136" height="50" rx="6" fill="#ddd6fe"/><text x="402" y="52" text-anchor="middle" class="svg-ink" font-size="12">ADOM Corporate</text><text x="402" y="68" text-anchor="middle" class="svg-ink" font-size="12">created, 7.6</text>
<rect x="496" y="30" width="134" height="50" rx="6" fill="#bbf7d0"/><text x="563" y="52" text-anchor="middle" class="svg-ink" font-size="12">Authorized in</text><text x="563" y="68" text-anchor="middle" class="svg-ink" font-size="12">Corporate</text>
<line x1="146" y1="55" x2="172" y2="55" stroke="#64748b" stroke-width="2"/><line x1="308" y1="55" x2="334" y2="55" stroke="#64748b" stroke-width="2"/><line x1="470" y1="55" x2="496" y2="55" stroke="#64748b" stroke-width="2"/>
<text x="10" y="120" class="svg-muted" font-size="12">MDU-FGT stays in Kaveri during the whole lab.</text>
</svg><p class="cap">The lab moves one device through four states.</p></div>

<h3>Task 1: delete, then look where it went</h3>
<p>First look at the starting state with <code>diagnose dvm device list</code>: two devices, HQ-FGT and MDU-FGT, both in Kaveri, both <code>conn: up</code>. Then delete HQ-FGT with the command from chapter 3, giving the ADOM name and the device name. The command is quiet when it works. Check with the device list: one device is left. The question is which list shows HQ-FGT afterwards. Use the unauthorized list (a GUI action in the real product, <code>execute fmgui unauthorized list</code> in the simulator):</p>
<pre class="out">Unauthorized devices (connected through FGFM, waiting to be authorized):
NAME		SERIAL			IP		VERSION
<span class="hl">HQ-FGT</span>		FGVMEV1RGF38I000	192.0.2.11	7.6 MR0</pre>
<p>Why does it return? HQ-FGT still has <code>type fortimanager</code> and <code>fmg "192.0.2.5"</code>, so its tunnel is still alive. FortiManager no longer has a row for its serial number, so it treats the device as new.</p>
<p><b>Wrong turn:</b> expecting the list to be empty. A deleted device is not gone from the network; only its record is.</p>

<h3>Task 2: does delete erase the FortiGate configuration?</h3>
<p>The answer is no, and you can prove it instead of trusting a rule. On HQ-FGT run <code>show system central-management</code> and check that the settings are still there. You may also check the policy table with <code>show firewall policy</code>. Then ask FortiManager for the history:</p>
<pre class="out">FMG-1 # execute fmgui revision list HQ-FGT
<span class="hl">device 'HQ-FGT' has no revision history.</span></pre>
<p>This is the other half of the lesson: the FortiGate keeps its configuration, but FortiManager forgets the history. If you need the history for audit, export or note it before you delete.</p>

<h3>Task 3: create Corporate and authorize into it</h3>
<p>Create the ADOM in the ADOM table of FMG-1: <code>config dvmdb adom</code>, edit Corporate, set the version, next, end. The version must be 7.6, equal to the firmware of HQ-FGT. If you set it differently, authorize will be refused with the version message you know from the previous lab. Then authorize HQ-FGT into Corporate and confirm:</p>
<pre class="out">FMG-1 # diagnose dvm device list
... HQ-FGT  <span class="hl">Corporate</span> ...
  |- STATUS: dev-db: not modified; conf: in sync; cond: OK; dm: retrieved; conn: up
FMG-1 # execute fmgui revision list HQ-FGT
1	retrieve	...	Retrieved</pre>
<p>Look at three things: the device now lists Corporate as its ADOM, <code>dm: retrieved</code> and a new revision 1. MDU-FGT must still show Kaveri and the same status as before.</p>

<h3>The trap in this lab</h3>
<p>If you authorize HQ-FGT back into Kaveri out of habit, the device leaves the unauthorized list. A later authorize into Corporate then answers:</p>
<pre class="out">'HQ-FGT' is not in the list of unauthorized devices.</pre>
<p>Read that message carefully: it does not say Corporate is wrong. It says the device is already managed. The fix is to delete it again and authorize it into Corporate. Names are also global in the simulator, so you cannot have two devices with the same name in two ADOMs at once.</p>

<div class="warn"><p><b>Common mistakes.</b> Deleting MDU-FGT by typing the wrong name. Creating Corporate with the wrong version. Forgetting to check the FortiGate side. Authorizing into the wrong ADOM first. Thinking that a replacement of hardware would keep revision history: it does not.</p></div>

<div class="exam"><p><b>Exam traps.</b> Delete is a FortiManager action only. A deleted device with central-management still set is unauthorized, not offline. The ADOM version must equal the firmware. Authorize and add-device are GUI or API actions in the real product.</p></div>

<div class="scn"><h4>Replacing the head-office firewall on a Sunday</h4><p>A company swapped its head-office firewall. The engineer deleted the old record, created a new ADOM for the corporate network, and authorized the new unit there. He then installed the package for the head office. Because he had checked the unauthorized list first, he saw that the serial number matched the new purchase order, not the old one. A colleague had a second unit in the same rack, also pointed at the manager; it was left unauthorized on purpose.</p><p><b>Lesson:</b> the unauthorized list is a safety gate: read the serial number before you authorize.</p></div>

<div class="iv"><p class="q">"How would you move a managed FortiGate into a new ADOM?"</p><p>Create the ADOM with a version equal to the device firmware, delete the device from the old ADOM, authorize it into the new one, check device list and revision 1. Mention that the old history is lost, that the FortiGate configuration is not erased, and that the package and templates must be assigned again in the new ADOM.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Delete removes the record and history; the FortiGate configuration remains.</li>
<li>The device returns as unauthorized while its tunnel is configured.</li>
<li>Create the target ADOM with the right version first.</li>
<li>Authorize into the new ADOM and confirm ADOM, status and revision 1.</li>
<li>Verify that the untouched device kept its state.</li>
</ul></div>
`,hi:`
<p>Ghar badalna is lab ki achhi tasveer hai. Aap purane address register se naam hatate ho, purana ghar todte nahi, aur naye address par register karte ho. Steps sahi order mein karo to kuch nahi khota, aur ek step chhoot jaye to chitthiyan galat jagah aati rehti hain. Is lab mein HQ-FGT device database se hatta hai, ajnabi ki tarah wapas dikhta hai, aur phir naye ADOM mein register hota hai. MDU-FGT bilkul waisa hi rehna chahiye.</p>

<div class="eg"><p><b>Scenario.</b> "HQ-FGT replace ho raha hai aur naya unit corporate network ko alag se manage karega. Device database se purani entry hatao, dekho FortiManager baad mein kya dikhata hai, ADOM Corporate banao aur device ko usme authorize karo." Devices: FMG-1, SW-NET, SRV-WEB, HQ-FGT, SW-HQ, PC-HQ, MDU-FGT, SW-MDU, PC-MDU. Lagbhag 25 minute. Teen tasks.</p></div>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Lab sequence">
<rect x="10" y="30" width="136" height="50" rx="6" fill="#bae6fd"/><text x="78" y="52" text-anchor="middle" class="svg-ink" font-size="12">Managed in</text><text x="78" y="68" text-anchor="middle" class="svg-ink" font-size="12">ADOM Kaveri</text>
<rect x="172" y="30" width="136" height="50" rx="6" fill="#fed7aa"/><text x="240" y="52" text-anchor="middle" class="svg-ink" font-size="12">Deleted:</text><text x="240" y="68" text-anchor="middle" class="svg-ink" font-size="12">unauthorized</text>
<rect x="334" y="30" width="136" height="50" rx="6" fill="#ddd6fe"/><text x="402" y="52" text-anchor="middle" class="svg-ink" font-size="12">ADOM Corporate</text><text x="402" y="68" text-anchor="middle" class="svg-ink" font-size="12">banaya, 7.6</text>
<rect x="496" y="30" width="134" height="50" rx="6" fill="#bbf7d0"/><text x="563" y="52" text-anchor="middle" class="svg-ink" font-size="12">Authorized in</text><text x="563" y="68" text-anchor="middle" class="svg-ink" font-size="12">Corporate</text>
<line x1="146" y1="55" x2="172" y2="55" stroke="#64748b" stroke-width="2"/><line x1="308" y1="55" x2="334" y2="55" stroke="#64748b" stroke-width="2"/><line x1="470" y1="55" x2="496" y2="55" stroke="#64748b" stroke-width="2"/>
<text x="10" y="120" class="svg-muted" font-size="12">Poore lab mein MDU-FGT Kaveri mein hi rehta hai.</text>
</svg><p class="cap">Lab ek device ko chaar states se guzaarta hai.</p></div>

<h3>Task 1: delete karo, phir dekho kahan gaya</h3>
<p>Pehle <code>diagnose dvm device list</code> se starting state dekho: do devices, HQ-FGT aur MDU-FGT, dono Kaveri mein, dono <code>conn: up</code>. Phir chapter 3 ke command se HQ-FGT delete karo, ADOM ka naam aur device ka naam dekar. Command safal hone par chup rehta hai. Device list se check karo: ek device bacha. Sawal hai ki baad mein HQ-FGT kaun si list mein dikhta hai. Unauthorized list use karo (real product mein GUI action, simulator mein <code>execute fmgui unauthorized list</code>):</p>
<pre class="out">Unauthorized devices (connected through FGFM, waiting to be authorized):
NAME		SERIAL			IP		VERSION
<span class="hl">HQ-FGT</span>		FGVMEV1RGF38I000	192.0.2.11	7.6 MR0</pre>
<p>Wapas kyun aata hai? HQ-FGT par abhi bhi <code>type fortimanager</code> aur <code>fmg "192.0.2.5"</code> hai, isliye uska tunnel zinda hai. FortiManager ke paas ab uske serial number ki row nahi hai, to wo device ko naya maanta hai.</p>
<p><b>Wrong turn:</b> list khaali hone ki ummeed. Deleted device network se gayab nahi hota; sirf uska record jaata hai.</p>

<h3>Task 2: kya delete FortiGate configuration mitata hai?</h3>
<p>Jawab no hai, aur aap rule par bharosa karne ki jagah prove kar sakte ho. HQ-FGT par <code>show system central-management</code> chalao aur dekho settings abhi bhi hain. Policy table bhi <code>show firewall policy</code> se dekh sakte ho. Phir FortiManager se history poochho:</p>
<pre class="out">FMG-1 # execute fmgui revision list HQ-FGT
<span class="hl">device 'HQ-FGT' has no revision history.</span></pre>
<p>Ye lesson ka doosra hissa hai: FortiGate configuration rakhta hai, par FortiManager history bhool jata hai. Audit ke liye history chahiye to delete se pehle export karo ya note karo.</p>

<h3>Task 3: Corporate banao aur usme authorize karo</h3>
<p>FMG-1 ki ADOM table mein ADOM banao: <code>config dvmdb adom</code>, edit Corporate, version set karo, next, end. Version 7.6 hona chahiye, HQ-FGT ke firmware ke barabar. Alag set karoge to authorize pichhle lab wale version message ke saath refuse hoga. Phir HQ-FGT ko Corporate mein authorize karo aur confirm karo:</p>
<pre class="out">FMG-1 # diagnose dvm device list
... HQ-FGT  <span class="hl">Corporate</span> ...
  |- STATUS: dev-db: not modified; conf: in sync; cond: OK; dm: retrieved; conn: up
FMG-1 # execute fmgui revision list HQ-FGT
1	retrieve	...	Retrieved</pre>
<p>Teen cheezein dekho: device ab Corporate ko apna ADOM dikhata hai, <code>dm: retrieved</code> aur nayi revision 1. MDU-FGT ab bhi Kaveri aur pehle jaisa status dikhana chahiye.</p>

<h3>Is lab ka trap</h3>
<p>Aadat se HQ-FGT ko wapas Kaveri mein authorize kar do, to device unauthorized list se nikal jata hai. Baad mein Corporate mein authorize karne par jawab aata hai:</p>
<pre class="out">'HQ-FGT' is not in the list of unauthorized devices.</pre>
<p>Ye message dhyan se padho: ye nahi kehta ki Corporate galat hai. Ye kehta hai ki device pehle se managed hai. Fix hai ki use dobara delete karo aur Corporate mein authorize karo. Simulator mein names global hain, isliye do ADOMs mein ek saath same naam ke do devices nahi ho sakte.</p>

<div class="warn"><p><b>Common mistakes.</b> Galat naam type karke MDU-FGT delete kar dena. Corporate ko galat version se banana. FortiGate side check karna bhool jana. Pehle galat ADOM mein authorize karna. Ye sochna ki hardware replacement revision history rakhta hai: nahi rakhta.</p></div>

<div class="exam"><p><b>Exam traps.</b> Delete sirf FortiManager action hai. Deleted device jis par central-management set hai wo unauthorized hai, offline nahi. ADOM version firmware ke barabar ho. Authorize aur add-device real product mein GUI ya API actions hain.</p></div>

<div class="scn"><h4>Sunday ko head-office firewall ka replacement</h4><p>Ek company ne head-office firewall badla. Engineer ne purana record delete kiya, corporate network ke liye naya ADOM banaya, aur naya unit wahan authorize kiya. Phir head office ka package install kiya. Kyunki usne pehle unauthorized list dekhi thi, use dikha ki serial number naye purchase order se match karta hai, purane se nahi. Ek colleague ka doosra unit usi rack mein tha, wo bhi manager ki taraf point tha; use jaan-boojhkar unauthorized chhoda gaya.</p><p><b>Lesson:</b> unauthorized list ek safety gate hai: authorize se pehle serial number padho.</p></div>

<div class="iv"><p class="q">"Managed FortiGate ko naye ADOM mein kaise le jaoge?"</p><p>Device firmware ke barabar version ke saath ADOM banao, purane ADOM se device delete karo, naye mein authorize karo, device list aur revision 1 check karo. Batao ki purani history jaati hai, FortiGate configuration nahi mitti, aur package aur templates naye ADOM mein dobara assign karne padte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Delete record aur history hatata hai; FortiGate configuration rehti hai.</li>
<li>Tunnel configured ho to device unauthorized ki tarah wapas aata hai.</li>
<li>Pehle sahi version ke saath target ADOM banao.</li>
<li>Naye ADOM mein authorize karo aur ADOM, status aur revision 1 confirm karo.</li>
<li>Verify karo ki untouched device ne apni state rakhi.</li>
</ul></div>
`}};export{e as default};