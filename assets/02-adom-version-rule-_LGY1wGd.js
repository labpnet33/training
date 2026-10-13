var e={id:`adom-version-rule`,h:{en:`The ADOM version rule and turning ADOMs on`,hi:`ADOM version rule aur ADOMs on karna`},body:{en:`
<p>A power plug only works in a socket of the same shape. If the shape is wrong, the socket simply refuses it, and no amount of pushing helps. The version of an ADOM is that shape. FortiManager stores configuration in the form of one firmware generation per ADOM, and a FortiGate can only be put into an ADOM whose version matches its own firmware.</p>

<h3>The rule</h3>
<p>The <b>ADOM version</b> must equal the <b>firmware version</b> of every device in it. In our lab the three FortiGates run 7.6 (the device list prints 7.6 MR0 with a build number), so their ADOM must have the version 7.6. You write the major and minor numbers only: <code>7.6</code>, not 7.6.0. If the numbers differ, authorize and add-device are refused and nothing changes in the device database.</p>
<p>Why does FortiManager insist? The configuration syntax changes between releases. A command that exists in 7.6 may be missing or different in 7.4. If one policy package were sent to devices of two releases, it would be correct for one and wrong for the other. A version per ADOM removes that guesswork.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="ADOM version must equal device firmware">
<rect x="30" y="40" width="170" height="80" rx="8" fill="#bae6fd"/><text x="115" y="72" text-anchor="middle" class="svg-ink" font-size="13">ADOM Kaveri</text><text x="115" y="96" text-anchor="middle" class="svg-accent" font-size="14">version 7.6</text>
<rect x="440" y="40" width="170" height="80" rx="8" fill="#bbf7d0"/><text x="525" y="72" text-anchor="middle" class="svg-ink" font-size="13">HQ-FGT firmware</text><text x="525" y="96" text-anchor="middle" class="svg-accent" font-size="14">7.6 MR0</text>
<text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="26">=</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">equal: authorize works. Different: refused.</text>
</svg><p class="cap">The one comparison FortiManager makes before it accepts a device.</p></div>

<h3>Turning ADOMs on and creating one</h3>
<p>ADOMs are off on a new FortiManager. Turn them on first, then create each ADOM as a row of the table <code>dvmdb adom</code> with a version.</p>
<pre class="code"><span class="c">! on FMG-1</span>
config system global
    set adom-status enable
end
config dvmdb adom
    edit "Kaveri"
        set version 7.6
    next
end
diagnose dvm adom list</pre>
<p>The <b>root ADOM</b> is created by the system. It is the default home, it cannot be removed, and in this simulator its version is 7.6. With ADOMs off, every device lives in root. Once ADOMs are on, root usually stays empty and the real ADOMs hold the devices, as in the diagram of chapter 1.</p>

<h3>What the refusal looks like</h3>
<p>Imagine the ADOM Kaveri was prepared last month by a colleague who typed 7.4 by mistake. Two FortiGates are waiting in the unauthorized list. This is the real output of the lab fm-adom-ver-ts:</p>
<pre class="out">FMG-1 # diagnose dvm adom list
OID	STATE	NAME		VERSION	MODE	DEVICES
3	enabled	root		7.6	GMS	0
464	enabled	Kaveri		<span class="hl">7.4</span>	GMS	0

FMG-1 # execute fmgui authorize HQ-FGT Kaveri
<span class="hl">Authorization failed: Device firmware version 7.6 does not match the version of ADOM Kaveri (7.4).</span></pre>
<p>The message names both numbers, so you do not have to guess. The same text appears for add-device when you add a device from the FortiManager side. Fix the ADOM version to 7.6 (the simulator lets you edit the row), then authorize again; the device list then shows both devices in Kaveri with conn up.</p>
<p>Remember that authorize and add-device are <code>execute fmgui</code> commands only in the simulator. In the real product they are GUI or API actions, and ADOM upgrade is a separate guided operation that the simulator does not model.</p>

<div class="eg"><p><b>Worked example.</b> HQ-FGT runs 7.6. You create the ADOM Old with version 7.4 and try <code>execute fmgui add-device HQ-FGT 192.0.2.11 Old</code>. Reply: add device failed, firmware 7.6 does not match the ADOM Old (7.4). Typing a missing ADOM name gives a different message: ADOM does not exist. Two different mistakes, two different texts.</p></div>

<h3>Workspace and workflow mode (theory)</h3>
<p>In the real product an ADOM can run in <b>workspace mode</b>, where an administrator locks the ADOM before editing and commits when done, so that two people cannot change it at once. <b>Workflow mode</b> adds an approval step: a change is submitted as a session and a second person approves it. The simulator does not model locking or workflow, so two lab sessions could overwrite each other. Treat both as exam theory.</p>

<div class="warn"><p><b>Common mistakes.</b> Creating the ADOM before <code>adom-status enable</code>. Typing the FortiManager version instead of the device firmware: FMG-1 itself reports v7.6.0, which is a different number from the ADOM version. Fixing the wrong side: the error is about the ADOM, so do not upgrade or downgrade the FortiGate.</p></div>

<div class="exam"><p><b>Exam traps.</b> The ADOM version is compared with the device firmware, not with the FortiManager build. Names are global in the simulator: a name used in one ADOM cannot be reused in another. root exists before ADOMs are enabled.</p></div>

<div class="scn"><h4>Eight devices stuck in the waiting list</h4><p>After a firmware upgrade weekend, eight branch FortiGates called in and none could be authorized. The engineer first checked routes and certificates. The error text said firmware 7.6 against ADOM 7.4. The ADOM had been cloned from an old template. One edit of the version, eight authorizations, finished before lunch.</p><p><b>Lesson:</b> read the whole refusal message; it names the two values that disagree.</p></div>

<div class="iv"><p class="q">"A device is connected over FGFM but authorize fails. What do you check?"</p><p>Read the message first. If it names a version mismatch, compare the device firmware with the ADOM version and correct the ADOM. Also confirm the ADOM exists and the name is spelled right.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ADOM version must equal the device firmware; write 7.6, not 7.6.0.</li>
<li>Turn ADOMs on with <code>set adom-status enable</code> in <code>config system global</code>.</li>
<li>Create ADOMs in <code>config dvmdb adom</code> with <code>set version</code>.</li>
<li>The refusal text names both versions, so the fix is quick.</li>
<li>Workspace locking and workflow approval are real-product theory, not modelled.</li>
</ul></div>
`,hi:`
<p>Power plug sirf usi shape ke socket mein chalta hai. Shape galat ho to socket use refuse kar deta hai, aur zor lagane se kuch nahi hota. ADOM ka version wahi shape hai. FortiManager har ADOM mein ek firmware generation ke form mein configuration rakhta hai, aur FortiGate sirf us ADOM mein ja sakta hai jiska version uske apne firmware se match kare.</p>

<h3>Rule</h3>
<p><b>ADOM version</b> uske har device ke <b>firmware version</b> ke barabar hona chahiye. Hamare lab mein teeno FortiGates 7.6 chalate hain (device list build number ke saath 7.6 MR0 print karti hai), isliye unka ADOM version 7.6 hona chahiye. Aap sirf major aur minor likhte ho: <code>7.6</code>, 7.6.0 nahi. Numbers alag hon to authorize aur add-device refuse hote hain aur device database mein kuch nahi badalta.</p>
<p>FortiManager itna zor kyun deta hai? Releases ke beech configuration syntax badalta hai. Jo command 7.6 mein hai wo 7.4 mein missing ya alag ho sakti hai. Ek policy package do releases ke devices ko bheja jaye to ek ke liye sahi aur doosre ke liye galat hoga. ADOM per version se ye andaza lagana khatam ho jata hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="ADOM version device firmware ke barabar">
<rect x="30" y="40" width="170" height="80" rx="8" fill="#bae6fd"/><text x="115" y="72" text-anchor="middle" class="svg-ink" font-size="13">ADOM Kaveri</text><text x="115" y="96" text-anchor="middle" class="svg-accent" font-size="14">version 7.6</text>
<rect x="440" y="40" width="170" height="80" rx="8" fill="#bbf7d0"/><text x="525" y="72" text-anchor="middle" class="svg-ink" font-size="13">HQ-FGT firmware</text><text x="525" y="96" text-anchor="middle" class="svg-accent" font-size="14">7.6 MR0</text>
<text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="26">=</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">barabar: authorize chalta hai. Alag: refuse.</text>
</svg><p class="cap">Device accept karne se pehle FortiManager ki ek hi comparison.</p></div>

<h3>ADOMs on karna aur ADOM banana</h3>
<p>Nayi FortiManager par ADOMs off hote hain. Pehle on karo, phir har ADOM ko table <code>dvmdb adom</code> ki row ki tarah version ke saath banao.</p>
<pre class="code"><span class="c">! on FMG-1</span>
config system global
    set adom-status enable
end
config dvmdb adom
    edit "Kaveri"
        set version 7.6
    next
end
diagnose dvm adom list</pre>
<p><b>Root ADOM</b> system khud banata hai. Ye default ghar hai, hataya nahi ja sakta, aur is simulator mein iska version 7.6 hai. ADOMs off hon to har device root mein rehta hai. ADOMs on hone ke baad root aam taur par khaali rehta hai aur asli ADOMs mein devices hote hain, jaise chapter 1 ke diagram mein.</p>

<h3>Refusal kaisa dikhta hai</h3>
<p>Maan lo ADOM Kaveri pichhle mahine ek colleague ne bana diya aur galti se 7.4 type kar diya. Do FortiGates unauthorized list mein wait kar rahe hain. Ye lab fm-adom-ver-ts ka real output hai:</p>
<pre class="out">FMG-1 # diagnose dvm adom list
OID	STATE	NAME		VERSION	MODE	DEVICES
3	enabled	root		7.6	GMS	0
464	enabled	Kaveri		<span class="hl">7.4</span>	GMS	0

FMG-1 # execute fmgui authorize HQ-FGT Kaveri
<span class="hl">Authorization failed: Device firmware version 7.6 does not match the version of ADOM Kaveri (7.4).</span></pre>
<p>Message dono numbers ka naam leta hai, isliye andaza nahi lagana padta. FortiManager side se add-device karo to wahi text aata hai. ADOM version 7.6 kar do (simulator row edit karne deta hai), phir authorize karo; device list dono devices ko Kaveri mein conn up ke saath dikhati hai.</p>
<p>Yaad rakho ki authorize aur add-device sirf simulator mein <code>execute fmgui</code> commands hain. Real product mein ye GUI ya API actions hain, aur ADOM upgrade alag guided operation hai jo simulator model nahi karta.</p>

<div class="eg"><p><b>Worked example.</b> HQ-FGT 7.6 chalata hai. Aap version 7.4 ke saath ADOM Old banate ho aur <code>execute fmgui add-device HQ-FGT 192.0.2.11 Old</code> try karte ho. Reply: add device failed, firmware 7.6 ADOM Old (7.4) se match nahi karta. Missing ADOM name likho to alag message milta hai: ADOM does not exist. Do alag galtiyan, do alag texts.</p></div>

<h3>Workspace aur workflow mode (theory)</h3>
<p>Real product mein ADOM <b>workspace mode</b> mein chal sakta hai, jahan administrator edit se pehle ADOM lock karta hai aur kaam ke baad commit karta hai, taaki do log ek saath change na kar sakein. <b>Workflow mode</b> approval step jodta hai: change session ki tarah submit hota hai aur doosra insaan approve karta hai. Simulator locking ya workflow model nahi karta, isliye do lab sessions ek doosre ko overwrite kar sakte hain. Dono ko exam theory samjho.</p>

<div class="warn"><p><b>Common mistakes.</b> <code>adom-status enable</code> se pehle ADOM banana. Device firmware ki jagah FortiManager version type karna: FMG-1 khud v7.6.0 batata hai, jo ADOM version se alag number hai. Galat side theek karna: error ADOM ke baare mein hai, isliye FortiGate ko upgrade ya downgrade mat karo.</p></div>

<div class="exam"><p><b>Exam traps.</b> ADOM version device firmware se compare hota hai, FortiManager build se nahi. Simulator mein names global hain: ek ADOM mein use hua naam doosre ADOM mein dobara nahi use ho sakta. ADOMs enable hone se pehle bhi root exist karta hai.</p></div>

<div class="scn"><h4>Aath devices waiting list mein atke</h4><p>Firmware upgrade weekend ke baad aath branch FortiGates call in hue aur ek bhi authorize nahi ho paya. Engineer ne pehle routes aur certificates check kiye. Error text mein firmware 7.6 aur ADOM 7.4 likha tha. ADOM purane template se clone hua tha. Version ka ek edit, aath authorizations, lunch se pehle kaam khatam.</p><p><b>Lesson:</b> poora refusal message padho; wo un do values ka naam leta hai jo match nahi karti.</p></div>

<div class="iv"><p class="q">"Device FGFM se connected hai par authorize fail ho raha hai. Kya check karoge?"</p><p>Pehle message padho. Version mismatch ka naam aaye to device firmware ko ADOM version se compare karo aur ADOM theek karo. Ye bhi confirm karo ki ADOM exist karta hai aur naam sahi spell hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ADOM version device firmware ke barabar hona chahiye; 7.6 likho, 7.6.0 nahi.</li>
<li>ADOMs ko <code>config system global</code> mein <code>set adom-status enable</code> se on karo.</li>
<li>ADOMs <code>config dvmdb adom</code> mein <code>set version</code> ke saath banao.</li>
<li>Refusal text dono versions batata hai, isliye fix jaldi hota hai.</li>
<li>Workspace locking aur workflow approval real-product theory hain, model nahi.</li>
</ul></div>
`}};export{e as default};