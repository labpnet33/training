var e={id:`decommission-replace`,h:{en:`Decommissioning and replacing a device`,hi:`Device ko decommission aur replace karna`},body:{en:`
<p>When an employee leaves a company, the office does two separate things. It removes the name from the staff register, and it collects the access card. Removing a name from the register does not stop the person from walking up to the gate; the card still opens it. Removing a FortiGate from FortiManager has the same two sides. The <b>register</b> is the device database on FortiManager. The <b>card</b> is the central-management setting on the FortiGate that keeps calling FortiManager. You must think about both.</p>

<h3>Three situations</h3>
<table class="cmp"><tr><th>Situation</th><th>What you do</th></tr>
<tr><td>Retire a device for good</td><td>Delete it from the device database; then remove the central-management setting on the FortiGate.</td></tr>
<tr><td>Move a device to another ADOM</td><td>Delete it, create the target ADOM if needed, authorize it there. The ADOM version must equal the firmware.</td></tr>
<tr><td>Replace failed hardware</td><td>The new unit has a new serial number; it arrives as a new unauthorized device.</td></tr></table>

<h3>What device delete does</h3>
<p>The command on FMG-1 is <code>diagnose dvm device delete &lt;adom&gt; &lt;device&gt;</code>. It removes the row from the device database (the table of managed devices with serial number, ADOM and address). It also removes the stored revision history of that device. It does <b>not</b> touch the configuration of the FortiGate itself: policies, addresses and interfaces stay exactly as they were, and the FortiGate keeps forwarding traffic.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Before and after device delete">
<rect x="20" y="20" width="270" height="150" rx="8" fill="#e2e8f0"/><text x="155" y="42" text-anchor="middle" class="svg-ink" font-size="13">Before delete</text>
<rect x="40" y="56" width="110" height="40" rx="6" fill="#ddd6fe"/><text x="95" y="80" text-anchor="middle" class="svg-ink" font-size="12">Device DB: HQ-FGT</text>
<rect x="165" y="56" width="110" height="40" rx="6" fill="#bae6fd"/><text x="220" y="80" text-anchor="middle" class="svg-ink" font-size="12">Revisions 1..n</text>
<text x="40" y="130" class="svg-muted" font-size="12">FGFM tunnel up, status managed</text>
<rect x="350" y="20" width="270" height="150" rx="8" fill="#e2e8f0"/><text x="485" y="42" text-anchor="middle" class="svg-ink" font-size="13">After delete</text>
<rect x="370" y="56" width="110" height="40" rx="6" fill="#fed7aa"/><text x="425" y="80" text-anchor="middle" class="svg-ink" font-size="12">Unauthorized list</text>
<rect x="495" y="56" width="110" height="40" rx="6" fill="#bbf7d0"/><text x="550" y="80" text-anchor="middle" class="svg-ink" font-size="12">FortiGate config kept</text>
<text x="370" y="130" class="svg-muted" font-size="12">Tunnel still up; no revisions left</text>
<line x1="290" y1="95" x2="350" y2="95" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Delete removes FortiManager's record, not the FortiGate's configuration.</p></div>

<h3>Real output from the lab</h3>
<p>In the lab HQ-FGT starts managed in the ADOM Kaveri. After the delete the device list shows one device, and the FortiGate comes back as a candidate:</p>
<pre class="out">FMG-1 # diagnose dvm device delete Kaveri HQ-FGT
FMG-1 # execute fmgui unauthorized list
Unauthorized devices (connected through FGFM, waiting to be authorized):
NAME		SERIAL			IP		VERSION
<span class="hl">HQ-FGT</span>		FGVMEV1RGF38I000	192.0.2.11	7.6 MR0

HQ-FGT # show system central-management
    set type fortimanager
    set fmg "192.0.2.5"

FMG-1 # execute fmgui revision list HQ-FGT
device 'HQ-FGT' has no revision history.</pre>
<p>The delete command prints nothing when it succeeds. The FortiGate still has type fortimanager and fmg 192.0.2.5, so it reconnects and appears as unauthorized. That is the card that still opens the gate.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri wants HQ-FGT in a new ADOM called Corporate. Steps: delete HQ-FGT from Kaveri; create the ADOM Corporate with version 7.6 (<code>config dvmdb adom</code>, edit, set version 7.6); authorize HQ-FGT into Corporate (<code>execute fmgui authorize HQ-FGT Corporate</code>, a GUI action in the real product). The device gets revision 1 in the new ADOM. MDU-FGT is never touched and stays in Kaveri.</p></div>

<h3>Replacing hardware</h3>
<p>A replacement FortiGate has a new serial number, so FortiManager sees a stranger. In the simulator you authorize the new unit as a new device and may give it the old name. Before that, delete the old entry, so that two rows do not describe one site. The new unit starts with revision 1 from whatever configuration it holds. If it is a clean unit, you then install the policy package and templates to rebuild it. In the real product there is also a replace-device function that keeps the old name, package assignment and history; it is not part of the simulator, so treat it as theory here.</p>
<p>Keep a copy of the retired FortiGate configuration for audit before you wipe it, and update your documentation: site list, installation targets, addresses.</p>

<div class="warn"><p><b>Common mistakes.</b> Believing that delete wipes the FortiGate. Deleting a device and forgetting that it will reappear as unauthorized because the tunnel is still configured. Authorizing into an ADOM of a different version. Moving the wrong device: always read the name and serial number before you delete.</p></div>

<div class="exam"><p><b>Exam traps.</b> Delete affects FortiManager only. A deleted but still configured device returns to the unauthorized list. The revision history of a deleted device is gone. A new serial number means a new device.</p></div>

<div class="scn"><h4>The firewall that came back from the dead</h4><p>A branch FortiGate was decommissioned, deleted from FortiManager, and moved to a storage room. Months later it was powered on in a test network that could reach FortiManager. Within seconds the unauthorized list showed a device nobody recognised. The administrator checked the serial number against the asset list, found it was the retired unit, and did not authorize it. The proper retirement would have reset central-management on the unit before storage.</p><p><b>Lesson:</b> retire both sides: the database row and the device's own management setting.</p></div>

<div class="iv"><p class="q">"What happens when you delete a managed device from FortiManager?"</p><p>The device database row and its revision history are removed, the FortiGate configuration is untouched and traffic continues. If the FortiGate still has central-management pointing to the FortiManager, it returns to the unauthorized list. For a replacement, the new serial is a new device; in the real product the replace function keeps the identity, but I would still verify the install.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Delete removes FortiManager's record and revision history, not the FortiGate's configuration.</li>
<li>A device with central-management still set returns to the unauthorized list.</li>
<li>Moving to another ADOM is delete, create ADOM if needed, authorize.</li>
<li>A replacement unit has a new serial number and arrives as a new device.</li>
<li>Replace-device is theory here; the simulator has authorize only.</li>
</ul></div>
`,hi:`
<p>Jab koi employee company chhodta hai, office do alag kaam karta hai. Wo staff register se naam hatata hai, aur access card wapas leta hai. Register se naam hatane se banda gate tak aana nahi rukta; card abhi bhi gate kholta hai. FortiManager se FortiGate hatane ke bhi do side hain. <b>Register</b> FortiManager ka device database hai. <b>Card</b> FortiGate ki central-management setting hai jo FortiManager ko call karti rehti hai. Dono ke baare mein sochna padta hai.</p>

<h3>Teen situations</h3>
<table class="cmp"><tr><th>Situation</th><th>Kya karte ho</th></tr>
<tr><td>Device hamesha ke liye retire karna</td><td>Device database se delete karo; phir FortiGate par central-management setting hatao.</td></tr>
<tr><td>Device ko doosre ADOM mein le jana</td><td>Delete karo, zaroorat ho to target ADOM banao, wahan authorize karo. ADOM version firmware ke barabar ho.</td></tr>
<tr><td>Kharab hardware replace karna</td><td>Naye unit ka naya serial number hota hai; wo naye unauthorized device ki tarah aata hai.</td></tr></table>

<h3>Device delete kya karta hai</h3>
<p>FMG-1 par command hai <code>diagnose dvm device delete &lt;adom&gt; &lt;device&gt;</code>. Ye device database (managed devices ki table: serial number, ADOM aur address) se row hata deta hai. Ye us device ki stored revision history bhi hata deta hai. Ye FortiGate ki apni configuration ko <b>nahi</b> chhoota: policies, addresses aur interfaces bilkul waise hi rehte hain, aur FortiGate traffic forward karta rehta hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Before and after device delete">
<rect x="20" y="20" width="270" height="150" rx="8" fill="#e2e8f0"/><text x="155" y="42" text-anchor="middle" class="svg-ink" font-size="13">Delete se pehle</text>
<rect x="40" y="56" width="110" height="40" rx="6" fill="#ddd6fe"/><text x="95" y="80" text-anchor="middle" class="svg-ink" font-size="12">Device DB: HQ-FGT</text>
<rect x="165" y="56" width="110" height="40" rx="6" fill="#bae6fd"/><text x="220" y="80" text-anchor="middle" class="svg-ink" font-size="12">Revisions 1..n</text>
<text x="40" y="130" class="svg-muted" font-size="12">FGFM tunnel up, status managed</text>
<rect x="350" y="20" width="270" height="150" rx="8" fill="#e2e8f0"/><text x="485" y="42" text-anchor="middle" class="svg-ink" font-size="13">Delete ke baad</text>
<rect x="370" y="56" width="110" height="40" rx="6" fill="#fed7aa"/><text x="425" y="80" text-anchor="middle" class="svg-ink" font-size="12">Unauthorized list</text>
<rect x="495" y="56" width="110" height="40" rx="6" fill="#bbf7d0"/><text x="550" y="80" text-anchor="middle" class="svg-ink" font-size="12">FortiGate config kept</text>
<text x="370" y="130" class="svg-muted" font-size="12">Tunnel abhi up; koi revision nahi</text>
<line x1="290" y1="95" x2="350" y2="95" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Delete FortiManager ka record hatata hai, FortiGate ki configuration nahi.</p></div>

<h3>Lab ka real output</h3>
<p>Lab mein HQ-FGT shuru mein ADOM Kaveri mein managed hai. Delete ke baad device list mein ek hi device bachta hai, aur FortiGate candidate ki tarah wapas aata hai:</p>
<pre class="out">FMG-1 # diagnose dvm device delete Kaveri HQ-FGT
FMG-1 # execute fmgui unauthorized list
Unauthorized devices (connected through FGFM, waiting to be authorized):
NAME		SERIAL			IP		VERSION
<span class="hl">HQ-FGT</span>		FGVMEV1RGF38I000	192.0.2.11	7.6 MR0

HQ-FGT # show system central-management
    set type fortimanager
    set fmg "192.0.2.5"

FMG-1 # execute fmgui revision list HQ-FGT
device 'HQ-FGT' has no revision history.</pre>
<p>Delete command safal hone par kuch print nahi karta. FortiGate par abhi bhi type fortimanager aur fmg 192.0.2.5 hai, isliye wo dobara connect hota hai aur unauthorized dikhta hai. Yahi wo card hai jo gate abhi bhi kholta hai.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri chahta hai ki HQ-FGT naye ADOM Corporate mein ho. Steps: Kaveri se HQ-FGT delete karo; version 7.6 ke saath ADOM Corporate banao (<code>config dvmdb adom</code>, edit, set version 7.6); HQ-FGT ko Corporate mein authorize karo (<code>execute fmgui authorize HQ-FGT Corporate</code>, real product mein GUI action). Device ko naye ADOM mein revision 1 milta hai. MDU-FGT ko kabhi chhua nahi jata aur wo Kaveri mein rehta hai.</p></div>

<h3>Hardware replace karna</h3>
<p>Replacement FortiGate ka naya serial number hota hai, isliye FortiManager use ajnabi samajhta hai. Simulator mein aap naye unit ko naye device ki tarah authorize karte ho aur chaho to purana naam de sakte ho. Usse pehle purani entry delete karo, taaki ek site ko do rows describe na karein. Naya unit jo configuration rakhta hai usse revision 1 se shuru hota hai. Clean unit ho to policy package aur templates install karke use dobara banate ho. Real product mein replace-device function bhi hai jo purana naam, package assignment aur history rakhta hai; ye simulator mein nahi hai, isliye yahan theory samjho.</p>
<p>Retired FortiGate ko wipe karne se pehle audit ke liye uski configuration ki copy rakho, aur documentation update karo: site list, installation targets, addresses.</p>

<div class="warn"><p><b>Common mistakes.</b> Ye maanna ki delete FortiGate ko wipe karta hai. Device delete karke bhoolna ki tunnel configured hone ki wajah se wo unauthorized ki tarah wapas aayega. Alag version ke ADOM mein authorize karna. Galat device move karna: delete se pehle naam aur serial number hamesha padho.</p></div>

<div class="exam"><p><b>Exam traps.</b> Delete sirf FortiManager par asar karta hai. Deleted par abhi configured device unauthorized list mein wapas aata hai. Deleted device ki revision history chali jaati hai. Naya serial number matlab naya device.</p></div>

<div class="scn"><h4>Wo firewall jo wapas zinda ho gaya</h4><p>Ek branch FortiGate decommission hua, FortiManager se delete hua aur storage room mein rakha gaya. Mahino baad use ek test network mein on kiya gaya jo FortiManager tak pahunchta tha. Kuch second mein unauthorized list mein ek aisa device aaya jise koi pehchanta nahi tha. Administrator ne serial number asset list se match kiya, dekha ki ye retired unit hai, aur use authorize nahi kiya. Sahi retirement mein storage se pehle unit par central-management reset ho jata.</p><p><b>Lesson:</b> dono side retire karo: database row aur device ki apni management setting.</p></div>

<div class="iv"><p class="q">"Managed device ko FortiManager se delete karo to kya hota hai?"</p><p>Device database row aur uski revision history hat jaati hai, FortiGate ki configuration untouched rehti hai aur traffic chalta rehta hai. FortiGate par central-management abhi FortiManager ki taraf point kare to wo unauthorized list mein wapas aata hai. Replacement mein naya serial naya device hai; real product mein replace function identity rakhta hai, par main phir bhi install verify karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Delete FortiManager ka record aur revision history hatata hai, FortiGate ki configuration nahi.</li>
<li>Jis device par central-management set hai wo unauthorized list mein wapas aata hai.</li>
<li>Doosre ADOM mein jana matlab delete, zaroorat ho to ADOM banao, authorize.</li>
<li>Replacement unit ka naya serial number hota hai aur wo naye device ki tarah aata hai.</li>
<li>Replace-device yahan theory hai; simulator mein sirf authorize hai.</li>
</ul></div>
`}};export{e as default};