var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a train journey you check a short list: ticket, ID, water, charger. You do not re-read the whole timetable. This chapter is that list for the module: what you can now do, the words you must know, and the facts that are asked again and again. The module ran in three steps. First the idea (chapters 1 to 3): an ADOM is a management container, its version equals the device firmware, and its design follows a rule. Then the records (chapters 4 and 5): the device database and the status line. Then practice (chapters 6 to 8): three labs.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module recap">
<rect x="10" y="30" width="190" height="90" rx="8" fill="#ddd6fe"/><text x="105" y="56" text-anchor="middle" class="svg-ink" font-size="13">Containers</text><text x="105" y="78" text-anchor="middle" class="svg-muted" font-size="12">ADOM, version rule,</text><text x="105" y="96" text-anchor="middle" class="svg-muted" font-size="12">design</text>
<rect x="225" y="30" width="190" height="90" rx="8" fill="#bae6fd"/><text x="320" y="56" text-anchor="middle" class="svg-ink" font-size="13">Records</text><text x="320" y="78" text-anchor="middle" class="svg-muted" font-size="12">device database,</text><text x="320" y="96" text-anchor="middle" class="svg-muted" font-size="12">status line</text>
<rect x="440" y="30" width="190" height="90" rx="8" fill="#bbf7d0"/><text x="535" y="56" text-anchor="middle" class="svg-ink" font-size="13">Practice</text><text x="535" y="78" text-anchor="middle" class="svg-muted" font-size="12">three labs: build,</text><text x="535" y="96" text-anchor="middle" class="svg-muted" font-size="12">refusal, status</text>
<line x1="200" y1="75" x2="225" y2="75" stroke="#64748b" stroke-width="2"/><line x1="415" y1="75" x2="440" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Three layers, each depends on the one before.</p></div>

<h3>Checklist: can you do these?</h3>
<ul>
<li>Explain an ADOM in two sentences to a non-technical manager, and name four reasons to use ADOMs.</li>
<li>Show with <code>get system status</code> and <code>diagnose dvm adom list</code> whether ADOMs are on.</li>
<li>Turn ADOMs on (<code>set adom-status enable</code>) and create an ADOM with the right version.</li>
<li>Authorize each FortiGate into the intended ADOM and prove it with the ADOM list and the device list.</li>
<li>Read a refusal message about versions and fix the ADOM, not the FortiGate.</li>
<li>Read the six status fields in order: conn, conf, dev-db, pkg, dm, cond.</li>
<li>Say whether a problem sits on the FortiGate or on FortiManager.</li>
<li>Use install-preview to see waiting changes, then install-device to clear them.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ADOM</dt><dd>Administrative domain: a named container for devices, packages, objects and templates inside FortiManager.</dd>
<dt>root</dt><dd>The ADOM that exists from the start, even when ADOMs are off.</dd>
<dt>ADOM version</dt><dd>The release, such as 7.6, that every device in the ADOM must run.</dd>
<dt>Device database</dt><dd>The register of managed devices: name, serial number, ADOM, IP, firmware.</dd>
<dt>conn</dt><dd>State of the FGFM tunnel: up or down.</dd>
<dt>conf</dt><dd>Whether the FortiGate matches FortiManager's last copy: in sync or out of sync.</dd>
<dt>dev-db</dt><dd>Modified when changes (for example a template) wait inside FortiManager.</dd>
<dt>dm</dt><dd>The last action on the device: retrieved, installed or autoupdated.</dd>
<dt>pkg</dt><dd>State of the policy package on the device, shown in brackets.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>What must the ADOM version equal?</td><td>The firmware of the devices in it</td></tr>
<tr><td>Which ADOM exists from the start?</td><td>root</td></tr>
<tr><td>Where is the ADOM switch?</td><td>config system global, set adom-status enable</td></tr>
<tr><td>Where are ADOMs created?</td><td>config dvmdb adom, with set version</td></tr>
<tr><td>What identifies a device?</td><td>Its serial number</td></tr>
<tr><td>Does an ADOM separate user traffic?</td><td>No, it separates management data only</td></tr>
<tr><td>conn down: what do conf and cond show?</td><td>out of sync and unknown</td></tr>
<tr><td>What does dev-db modified mean?</td><td>A change is waiting inside FortiManager</td></tr></table>
<p>In the real product the same skills also appear in vendor administrator-level material; this module overlaps with that area, but it is independent training and does not prepare you for any exam. Workspace locking, workflow approval, VDOMs in ADOMs and ADOM upgrade are real-product topics that the simulator does not model. Authorize, add-device, import and install are written as <code>execute fmgui</code> commands only in the simulator.</p>

<div class="eg"><p><b>Worked example.</b> A quick self-test. A device shows conn up, conf in sync, dev-db modified, dm retrieved. What is next? The device is healthy and reachable; a change waits in FortiManager. Run install-preview, read the lines, then install-device. The status then reads dev-db not modified and dm installed.</p></div>

<div class="warn"><p><b>Common mistakes to avoid in the exam room.</b> Mixing up the direction of conf and dev-db. Writing 7.6.0 for an ADOM version. Saying that an ADOM isolates traffic. Forgetting that the lab simulator accepts authorize into any existing ADOM.</p></div>

<div class="exam"><p><b>Exam traps.</b> A question that shows a refusal with two version numbers wants the ADOM fixed. A question with conn down and out of sync wants the tunnel fixed. A question with the serial number wants you to identify the device by it, not by IP or name.</p></div>

<div class="scn"><h4>The handover note that saved a Monday</h4><p>A Kaveri engineer going on leave left a one-page note for the next shift: ADOMs Corporate and Retail, both 7.6; which device lives where; how to read the status line; the three questions to ask when a device is amber. On Monday a new colleague used the note to answer a ticket about two amber devices in ten minutes, without calling anyone.</p><p><b>Lesson:</b> a good design and a readable status line are the best documentation.</p></div>

<div class="iv"><p class="q">"Summarise how ADOMs and the device manager help you run 30 FortiGates."</p><p>ADOMs split the estate by owner or firmware so changes stay contained. The device database lists every FortiGate by serial number, and the status line tells me in seconds whether a device is unreachable, drifting or waiting for an install. I read conn first, then conf, dev-db, pkg and dm.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ADOM version equals device firmware; root always exists; ADOMs are off by default.</li>
<li>Design ADOMs by owner first, then firmware; avoid one ADOM per device.</li>
<li>The serial number identifies the device; the name is a label.</li>
<li>Read the status line in the order conn, conf, dev-db, pkg, dm, cond.</li>
<li>Refusal messages name the two values that disagree.</li>
<li>Next module: policy packages, objects and install.</li>
</ul></div>
`,hi:`
<p>Train journey se pehle aap chhoti list check karte ho: ticket, ID, paani, charger. Poori timetable dobara nahi padhte. Ye chapter module ki wahi list hai: ab aap kya kar sakte ho, kaun se words aane chahiye, aur kaun se facts baar baar poochhe jaate hain. Module teen steps mein chala. Pehle idea (chapters 1 se 3): ADOM management container hai, uska version device firmware ke barabar hota hai, aur uska design ek rule follow karta hai. Phir records (chapters 4 aur 5): device database aur status line. Phir practice (chapters 6 se 8): teen labs.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module recap">
<rect x="10" y="30" width="190" height="90" rx="8" fill="#ddd6fe"/><text x="105" y="56" text-anchor="middle" class="svg-ink" font-size="13">Containers</text><text x="105" y="78" text-anchor="middle" class="svg-muted" font-size="12">ADOM, version rule,</text><text x="105" y="96" text-anchor="middle" class="svg-muted" font-size="12">design</text>
<rect x="225" y="30" width="190" height="90" rx="8" fill="#bae6fd"/><text x="320" y="56" text-anchor="middle" class="svg-ink" font-size="13">Records</text><text x="320" y="78" text-anchor="middle" class="svg-muted" font-size="12">device database,</text><text x="320" y="96" text-anchor="middle" class="svg-muted" font-size="12">status line</text>
<rect x="440" y="30" width="190" height="90" rx="8" fill="#bbf7d0"/><text x="535" y="56" text-anchor="middle" class="svg-ink" font-size="13">Practice</text><text x="535" y="78" text-anchor="middle" class="svg-muted" font-size="12">teen labs: build,</text><text x="535" y="96" text-anchor="middle" class="svg-muted" font-size="12">refusal, status</text>
<line x1="200" y1="75" x2="225" y2="75" stroke="#64748b" stroke-width="2"/><line x1="415" y1="75" x2="440" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Teen layers, har ek pichhli par depend karti hai.</p></div>

<h3>Checklist: kya aap ye kar sakte ho?</h3>
<ul>
<li>ADOM ko non-technical manager ko do sentences mein samjhana, aur ADOMs use karne ki chaar wajah batana.</li>
<li><code>get system status</code> aur <code>diagnose dvm adom list</code> se dikhana ki ADOMs on hain ya nahi.</li>
<li>ADOMs on karna (<code>set adom-status enable</code>) aur sahi version ke saath ADOM banana.</li>
<li>Har FortiGate ko intended ADOM mein authorize karna aur ADOM list aur device list se saabit karna.</li>
<li>Version wala refusal message padhna aur ADOM theek karna, FortiGate nahi.</li>
<li>Chhe status fields order mein padhna: conn, conf, dev-db, pkg, dm, cond.</li>
<li>Batana ki problem FortiGate par hai ya FortiManager par.</li>
<li>Waiting changes dekhne ke liye install-preview aur unhe saaf karne ke liye install-device use karna.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ADOM</dt><dd>Administrative domain: FortiManager ke andar devices, packages, objects aur templates ka named container.</dd>
<dt>root</dt><dd>Wo ADOM jo shuru se exist karta hai, ADOMs off hon tab bhi.</dd>
<dt>ADOM version</dt><dd>Wo release, jaise 7.6, jo ADOM ke har device ko chalani chahiye.</dd>
<dt>Device database</dt><dd>Managed devices ka register: naam, serial number, ADOM, IP, firmware.</dd>
<dt>conn</dt><dd>FGFM tunnel ki state: up ya down.</dd>
<dt>conf</dt><dd>FortiGate FortiManager ki last copy se match karta hai ya nahi: in sync ya out of sync.</dd>
<dt>dev-db</dt><dd>Modified tab hota hai jab changes (jaise template) FortiManager ke andar wait karte hain.</dd>
<dt>dm</dt><dd>Device par aakhri action: retrieved, installed ya autoupdated.</dd>
<dt>pkg</dt><dd>Device par policy package ki state, brackets mein dikhti hai.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Jawab</th></tr>
<tr><td>ADOM version kiske barabar hona chahiye?</td><td>Uske devices ke firmware ke</td></tr>
<tr><td>Shuru se kaun sa ADOM hota hai?</td><td>root</td></tr>
<tr><td>ADOM ka switch kahan hai?</td><td>config system global, set adom-status enable</td></tr>
<tr><td>ADOMs kahan bante hain?</td><td>config dvmdb adom, set version ke saath</td></tr>
<tr><td>Device ki pehchaan kya hai?</td><td>Uska serial number</td></tr>
<tr><td>Kya ADOM user traffic alag karta hai?</td><td>Nahi, sirf management data alag karta hai</td></tr>
<tr><td>conn down hone par conf aur cond kya dikhate hain?</td><td>out of sync aur unknown</td></tr>
<tr><td>dev-db modified ka matlab?</td><td>FortiManager ke andar change wait kar raha hai</td></tr></table>
<p>Real product mein yahi skills vendor administrator-level material mein bhi aati hain; ye module us area se overlap karta hai, par ye independent training hai aur kisi exam ki taiyari ka daava nahi karta. Workspace locking, workflow approval, ADOMs mein VDOMs aur ADOM upgrade real-product topics hain jo simulator model nahi karta. Authorize, add-device, import aur install sirf simulator mein <code>execute fmgui</code> commands ki tarah likhe hain.</p>

<div class="eg"><p><b>Worked example.</b> Chhota self-test. Device conn up, conf in sync, dev-db modified, dm retrieved dikhata hai. Aage kya? Device healthy aur reachable hai; ek change FortiManager mein wait kar raha hai. install-preview chalao, lines padho, phir install-device. Status phir dev-db not modified aur dm installed padhta hai.</p></div>

<div class="warn"><p><b>Exam room mein bachne wali galtiyan.</b> conf aur dev-db ki direction mix karna. ADOM version ke liye 7.6.0 likhna. Ye kehna ki ADOM traffic isolate karta hai. Ye bhoolna ki lab simulator kisi bhi existing ADOM mein authorize accept kar leta hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Jis sawaal mein refusal do version numbers ke saath ho wo ADOM fix karwana chahta hai. Conn down aur out of sync wala sawaal tunnel fix karwana chahta hai. Serial number wala sawaal chahta hai ki device ko usse pehchano, IP ya naam se nahi.</p></div>

<div class="scn"><h4>Handover note jisne Monday bacha liya</h4><p>Chhutti par jaate Kaveri engineer ne agli shift ke liye ek page ka note chhoda: ADOMs Corporate aur Retail, dono 7.6; kaun sa device kahan hai; status line kaise padhein; device amber ho to teen sawaal. Monday ko naye colleague ne note se do amber devices ka ticket das minute mein bina kisi ko call kiye solve kar diya.</p><p><b>Lesson:</b> achha design aur padhne laayak status line sabse achhi documentation hain.</p></div>

<div class="iv"><p class="q">"30 FortiGates chalane mein ADOMs aur device manager kaise madad karte hain, summarise karo."</p><p>ADOMs estate ko owner ya firmware se baant dete hain taaki changes contained rahein. Device database har FortiGate ko serial number se list karta hai, aur status line seconds mein batati hai ki device unreachable hai, drift kar raha hai ya install ka intezaar kar raha hai. Main pehle conn padhta hoon, phir conf, dev-db, pkg aur dm.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ADOM version device firmware ke barabar; root hamesha hota hai; ADOMs default se off hain.</li>
<li>ADOMs pehle owner se design karo, phir firmware se; ek device ek ADOM se bacho.</li>
<li>Serial number device ko pehchanta hai; naam sirf label hai.</li>
<li>Status line is order mein padho: conn, conf, dev-db, pkg, dm, cond.</li>
<li>Refusal messages wo do values batate hain jo match nahi karti.</li>
<li>Agla module: policy packages, objects aur install.</li>
</ul></div>
`}};export{e as default};