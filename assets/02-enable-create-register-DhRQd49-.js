var e={id:`enable-create-register`,h:{en:`Enabling ADOM mode, creating ADOMs and the version rule`,hi:`ADOM mode enable karna, ADOMs banana aur version rule`},body:{en:`
<p>Think of opening new counters in a bank branch. First the manager decides that the branch will work with separate counters at all (that is switching ADOM mode on). Then each counter gets a name board (creating an ADOM). Finally every customer is sent to the right counter (registering a device in an ADOM). If a counter only handles old-style forms, a customer with a new-style form is politely refused. That refusal is the version rule.</p>

<h3>Step 1: switch ADOM mode on</h3>
<p>ADOM mode is a global switch called <code>adom-status</code>. While it is off, everything lands in <code>root</code>. In the lab this is one small block on FAZ-1:</p>
<pre class="code"><span class="c">! on FAZ-1</span>
config system global
    set adom-status enable
end</pre>
<p>You can see the effect in <code>get system status</code>, where the line "Admin Domain Configuration" changes from Disabled to Enabled. In the real product the same switch is in the GUI system settings; the CLI form is real.</p>

<h3>Step 2: create the ADOMs and give each a version</h3>
<p>Every ADOM has a <b>version</b>, for example 7.6. It tells FortiAnalyzer which firmware generation of FortiGate the ADOM is meant for, because log fields and reports differ a little between generations. The ADOM table is <code>config dvmdb adom</code>:</p>
<pre class="code">config dvmdb adom
    edit "Corporate"
        set version 7.6
    next
end</pre>
<p>The name is case sensitive in practice: Corporate and corporate would be two different ADOMs, so copy names exactly. The same table is used by FortiManager, so if you did the sibling track you have seen it already.</p>

<h3>Step 3: register the device in an ADOM</h3>
<p>Registration stores the FortiGate serial number in the device table together with its ADOM. In the real product you add the device in the GUI. The simulator offers the stand-in command <code>execute fazui register &lt;device&gt; &lt;adom&gt;</code>. It also checks the version rule.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Three steps to place a device in an ADOM">
<rect x="14" y="40" width="170" height="86" rx="8" fill="#fde68a"/><text x="99" y="68" text-anchor="middle" class="svg-ink" font-size="13">1. adom-status</text><text x="99" y="88" text-anchor="middle" class="svg-muted" font-size="12">enable (global)</text><text x="99" y="108" text-anchor="middle" class="svg-muted" font-size="12">config system global</text>
<rect x="235" y="40" width="170" height="86" rx="8" fill="#bae6fd"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="13">2. Create ADOM</text><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="12">name and version 7.6</text><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">config dvmdb adom</text>
<rect x="456" y="40" width="170" height="86" rx="8" fill="#bbf7d0"/><text x="541" y="68" text-anchor="middle" class="svg-ink" font-size="13">3. Register</text><text x="541" y="88" text-anchor="middle" class="svg-muted" font-size="12">device into ADOM</text><text x="541" y="108" text-anchor="middle" class="svg-muted" font-size="12">version must match</text>
<line x1="184" y1="83" x2="235" y2="83" stroke="#64748b" stroke-width="2"/><line x1="405" y1="83" x2="456" y2="83" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Switch, create, register. Skipping the order gives the messages shown below.</p></div>

<h3>The version rule</h3>
<p>The ADOM version must equal the firmware version of the FortiGate you place in it. Our FortiGates run 7.6. This is what happens when an ADOM called Old with version 7.4 exists and you try to register HQ-FGT there, and what happens when the ADOM name does not exist at all:</p>
<pre class="out">FAZ-1 # execute fazui register HQ-FGT Old
<span class="hl">Registration failed: Device firmware version 7.6 does not match the version of ADOM Old (7.4).</span>

FAZ-1 # execute fazui register MDU-FGT Nowhere
ADOM 'Nowhere' does not exist.</pre>
<p>When the version is right, registration works and storage starts from the next log:</p>
<pre class="out">FAZ-1 # execute fazui register HQ-FGT Corporate
Device HQ-FGT (FGVMEV1RGF38I000) registered in ADOM Corporate.
Logs received from now on are stored.</pre>

<div class="eg"><p><b>Worked example.</b> Kaveri Retail asks for Corporate and Retail, both 7.6. You enable ADOM mode, create both ADOMs and register HQ-FGT in Corporate, MDU-FGT and TRY-FGT in Retail. Then <code>diagnose dvm adom list</code> shows the device count per ADOM:</p>
<pre class="out">OID	STATE	NAME		VERSION	MODE	DEVICES
3	enabled	root		7.6	GMS	0
283	enabled	Corporate		7.6	GMS	<span class="hl">1</span>
259	enabled	Retail		7.6	GMS	<span class="hl">2</span></pre></div>

<h3>Moving or re-registering a device</h3>
<p>A device that belongs to the wrong ADOM is not edited in place in the simulator. You delete its device entry and register it again. Between the two commands the FortiGate is connected but unknown, so it is listed as unregistered and any log it sends in that gap is discarded. Logs that were already stored stay in the old ADOM; they do not travel with the device.</p>
<pre class="code">diagnose dvm device delete Retail TRY-FGT
execute fazui register TRY-FGT Corporate</pre>
<pre class="out">FAZ-1 # execute fazui unregistered list
NAME            SERIAL              IP              LOGS DISCARDED  LAST LOG SEEN
TRY-FGT         FGVMEV3X688U0000    192.0.2.13      0               -</pre>
<p>Theory: in the real product moving a device between ADOMs has more steps and caveats, and ADOM upgrade (changing the version of an ADOM that already holds devices) is a separate procedure. Neither is modelled here.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Creating the ADOM with the wrong version and then wondering why registration fails. (2) Trying to register before <code>adom-status enable</code>. (3) Forgetting that a move opens a gap of discarded logs; do it in a quiet moment and tell the team. (4) Expecting old logs to follow the device.</p></div>

<div class="exam"><p><b>Exam traps.</b> The ADOM version equals the device firmware version, not the FortiAnalyzer version. The unit has "Max Number of Admin Domains" in <code>get system status</code>; that limit is part of the unit, not of a lab. A device row holds one ADOM only.</p></div>

<div class="scn"><h4>The registration that kept failing</h4><p>An engineer at a distributor created an ADOM named Branches with version 7.4 because "that is what the older branches run", then tried to register a new 7.6 firewall there. The message named both versions. He created a second ADOM, Branches76, for the new devices and kept the older units where they were, instead of changing the firmware of working firewalls to suit a container.</p><p><b>Lesson:</b> read the two version numbers in the message; the ADOM follows the device, never the other way round.</p></div>

<div class="iv"><p class="q">"A FortiGate cannot be added to an ADOM. What do you check?"</p><p>First whether ADOM mode is on and the ADOM name exists exactly. Then the ADOM version against the device firmware, because they must be equal. Then whether the serial number is already registered somewhere else.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: <code>adom-status enable</code>, create the ADOM with a version, register the device.</li>
<li>The ADOM version must equal the device firmware version.</li>
<li>Moving a device means delete and register again; stored logs stay in the old ADOM.</li>
<li>During the gap the device is unregistered and its logs are discarded.</li>
<li>Registration is a GUI action in the real product; <code>execute fazui register</code> is the simulator stand-in.</li>
</ul></div>
`,hi:`
<p>Socho bank branch mein naye counters khul rahe hain. Pehle manager tay karta hai ki branch alag counters ke saath kaam karegi (yeh ADOM mode on karna hai). Phir har counter ko naam ka board milta hai (ADOM banana). Aakhir mein har customer ko sahi counter par bheja jata hai (device ko ADOM mein register karna). Agar kisi counter par sirf purane tarah ke forms chalte hain, to naye form wale customer ko politely mana kar diya jata hai. Wahi inkaar version rule hai.</p>

<h3>Step 1: ADOM mode on karo</h3>
<p>ADOM mode ek global switch hai jiska naam <code>adom-status</code> hai. Jab tak off hai, sab kuch <code>root</code> mein jata hai. Lab mein ye FAZ-1 par ek chhota block hai:</p>
<pre class="code"><span class="c">! on FAZ-1</span>
config system global
    set adom-status enable
end</pre>
<p>Iska asar aap <code>get system status</code> mein dekh sakte ho, jahan "Admin Domain Configuration" line Disabled se Enabled ho jati hai. Real product mein yehi switch GUI ki system settings mein hai; CLI form real hai.</p>

<h3>Step 2: ADOMs banao aur har ek ko version do</h3>
<p>Har ADOM ka ek <b>version</b> hota hai, jaise 7.6. Ye FortiAnalyzer ko batata hai ki ADOM kis firmware generation ke FortiGate ke liye hai, kyunki log fields aur reports generations ke beech thode alag hote hain. ADOM table <code>config dvmdb adom</code> hai:</p>
<pre class="code">config dvmdb adom
    edit "Corporate"
        set version 7.6
    next
end</pre>
<p>Naam practically case sensitive hai: Corporate aur corporate do alag ADOMs honge, isliye naam bilkul copy karo. Yehi table FortiManager bhi use karta hai, to sibling track kiya ho to aap ise dekh chuke ho.</p>

<h3>Step 3: device ko ADOM mein register karo</h3>
<p>Registration FortiGate ka serial number device table mein uske ADOM ke saath store karta hai. Real product mein device GUI se add hota hai. Simulator stand-in command deta hai: <code>execute fazui register &lt;device&gt; &lt;adom&gt;</code>. Ye version rule bhi check karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Device ko ADOM mein rakhne ke teen steps">
<rect x="14" y="40" width="170" height="86" rx="8" fill="#fde68a"/><text x="99" y="68" text-anchor="middle" class="svg-ink" font-size="13">1. adom-status</text><text x="99" y="88" text-anchor="middle" class="svg-muted" font-size="12">enable (global)</text><text x="99" y="108" text-anchor="middle" class="svg-muted" font-size="12">config system global</text>
<rect x="235" y="40" width="170" height="86" rx="8" fill="#bae6fd"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="13">2. ADOM banao</text><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="12">naam aur version 7.6</text><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">config dvmdb adom</text>
<rect x="456" y="40" width="170" height="86" rx="8" fill="#bbf7d0"/><text x="541" y="68" text-anchor="middle" class="svg-ink" font-size="13">3. Register</text><text x="541" y="88" text-anchor="middle" class="svg-muted" font-size="12">device ADOM mein</text><text x="541" y="108" text-anchor="middle" class="svg-muted" font-size="12">version match zaroori</text>
<line x1="184" y1="83" x2="235" y2="83" stroke="#64748b" stroke-width="2"/><line x1="405" y1="83" x2="456" y2="83" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Switch, create, register. Order skip karoge to neeche wale messages milenge.</p></div>

<h3>Version rule</h3>
<p>ADOM version us FortiGate ke firmware version ke barabar hona chahiye jise aap usme rakhte ho. Humare FortiGates 7.6 chalate hain. Jab Old naam ka ADOM version 7.4 ke saath hai aur aap HQ-FGT ko wahan register karte ho, aur jab ADOM naam hi exist nahi karta, tab ye hota hai:</p>
<pre class="out">FAZ-1 # execute fazui register HQ-FGT Old
<span class="hl">Registration failed: Device firmware version 7.6 does not match the version of ADOM Old (7.4).</span>

FAZ-1 # execute fazui register MDU-FGT Nowhere
ADOM 'Nowhere' does not exist.</pre>
<p>Version sahi ho to registration chalta hai aur storage agle log se shuru hota hai:</p>
<pre class="out">FAZ-1 # execute fazui register HQ-FGT Corporate
Device HQ-FGT (FGVMEV1RGF38I000) registered in ADOM Corporate.
Logs received from now on are stored.</pre>

<div class="eg"><p><b>Worked example.</b> Kaveri Retail ko Corporate aur Retail chahiye, dono 7.6. Aap ADOM mode enable karte ho, dono ADOMs banate ho aur HQ-FGT ko Corporate mein, MDU-FGT aur TRY-FGT ko Retail mein register karte ho. Phir <code>diagnose dvm adom list</code> har ADOM ka device count dikhata hai:</p>
<pre class="out">OID	STATE	NAME		VERSION	MODE	DEVICES
3	enabled	root		7.6	GMS	0
283	enabled	Corporate		7.6	GMS	<span class="hl">1</span>
259	enabled	Retail		7.6	GMS	<span class="hl">2</span></pre></div>

<h3>Device ko move ya re-register karna</h3>
<p>Galat ADOM mein pada device simulator mein in place edit nahi hota. Aap uski device entry delete karte ho aur dobara register karte ho. Dono commands ke beech FortiGate connected hai par unknown, isliye wo unregistered list mein aata hai aur us gap mein bheja gaya har log discard ho jata hai. Jo logs pehle se store the wo purane ADOM mein hi rehte hain; wo device ke saath travel nahi karte.</p>
<pre class="code">diagnose dvm device delete Retail TRY-FGT
execute fazui register TRY-FGT Corporate</pre>
<pre class="out">FAZ-1 # execute fazui unregistered list
NAME            SERIAL              IP              LOGS DISCARDED  LAST LOG SEEN
TRY-FGT         FGVMEV3X688U0000    192.0.2.13      0               -</pre>
<p>Theory: real product mein device ko ADOMs ke beech move karne mein zyada steps aur savdhaniyan hain, aur ADOM upgrade (jis ADOM mein devices hain uska version badalna) alag procedure hai. Dono yahan model nahi hain.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) ADOM galat version ke saath banana aur phir sochna ki registration kyun fail ho raha hai. (2) <code>adom-status enable</code> se pehle register karne ki koshish. (3) Bhool jana ki move se discarded logs ka gap banta hai; shaant waqt par karo aur team ko batao. (4) Purane logs ke device ke saath chalne ki ummeed.</p></div>

<div class="exam"><p><b>Exam traps.</b> ADOM version device firmware version ke barabar hota hai, FortiAnalyzer version ke nahi. <code>get system status</code> mein "Max Number of Admin Domains" hota hai; ye limit unit ka hissa hai, lab ka nahi. Device row mein sirf ek ADOM hota hai.</p></div>

<div class="scn"><h4>Registration jo baar baar fail hua</h4><p>Ek distributor ke engineer ne Branches naam ka ADOM version 7.4 ke saath banaya kyunki "purani branches wahi chalati hain", phir naya 7.6 firewall wahan register karne gaya. Message mein dono versions the. Usne naye devices ke liye doosra ADOM Branches76 banaya aur purani units wahin rehne di, container ke hisaab se kaam kar rahe firewalls ka firmware badalne ke bajaye.</p><p><b>Lesson:</b> message ke dono version numbers padho; ADOM device ke peeche chalta hai, device ADOM ke peeche nahi.</p></div>

<div class="iv"><p class="q">"Ek FortiGate ADOM mein add nahi ho raha. Aap kya check karte ho?"</p><p>Pehle ADOM mode on hai ya nahi aur ADOM ka naam bilkul sahi hai ya nahi. Phir ADOM version aur device firmware, kyunki dono barabar hone chahiye. Phir ye ki serial number kahin aur already registered to nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: <code>adom-status enable</code>, version ke saath ADOM banao, device register karo.</li>
<li>ADOM version device firmware version ke barabar hona chahiye.</li>
<li>Move matlab delete aur dobara register; stored logs purane ADOM mein rehte hain.</li>
<li>Gap ke dauran device unregistered hota hai aur uske logs discard hote hain.</li>
<li>Registration real product mein GUI action hai; <code>execute fazui register</code> simulator stand-in hai.</li>
</ul></div>
`}};export{e as default};