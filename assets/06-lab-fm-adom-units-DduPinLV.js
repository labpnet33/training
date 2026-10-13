var e={id:`lab-fm-adom-units`,h:{en:`Lab fm-adom-units: organise the company in ADOMs`,hi:`Lab fm-adom-units: company ko ADOMs mein organise karo`},body:{en:`
<p>A lab is like arranging a new office: first you build the rooms, then you move people in. In this lab you build the rooms (the ADOMs Corporate and Retail) and then place each FortiGate in the right one. It has four tasks and takes about 25 minutes. The topology is the usual Kaveri Retail network: FMG-1 at 192.0.2.5, and HQ-FGT, MDU-FGT and TRY-FGT at .11, .12 and .13 on the management network. All three have already called in over FGFM and wait in the unauthorized list.</p>

<div class="note"><p><b>Before you start.</b> Authorize is an <code>execute fmgui</code> command in the simulator because it is a GUI or API action in the real product. Do not paste a finished script. Do each task and read the reply before the next one.</p></div>

<h3>Goal and approach</h3>
<p>The goal is a company in two ADOMs: HQ-FGT in Corporate, MDU-FGT and TRY-FGT in Retail, both ADOMs at version 7.6 (the firmware of the FortiGates, chapter 2). The order is forced: the switch must be on before an ADOM can be saved, and an ADOM must exist before a device can be authorized into it.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Target layout of the lab">
<rect x="20" y="20" width="180" height="110" rx="8" fill="#e2e8f0"/><text x="110" y="46" text-anchor="middle" class="svg-ink" font-size="13">1 Switch on</text><text x="110" y="70" text-anchor="middle" class="svg-muted" font-size="12">adom-status enable</text><text x="110" y="92" text-anchor="middle" class="svg-muted" font-size="12">then two ADOMs</text>
<rect x="250" y="20" width="170" height="50" rx="8" fill="#bae6fd"/><text x="335" y="42" text-anchor="middle" class="svg-ink" font-size="13">2 Corporate</text><text x="335" y="60" text-anchor="middle" class="svg-muted" font-size="12">HQ-FGT</text>
<rect x="250" y="80" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="335" y="102" text-anchor="middle" class="svg-ink" font-size="13">3 Retail</text><text x="335" y="120" text-anchor="middle" class="svg-muted" font-size="12">MDU-FGT, TRY-FGT</text>
<rect x="470" y="45" width="150" height="60" rx="8" fill="#fde68a"/><text x="545" y="70" text-anchor="middle" class="svg-ink" font-size="13">4 Question</text><text x="545" y="90" text-anchor="middle" class="svg-muted" font-size="12">which ADOM is built in?</text>
<line x1="200" y1="75" x2="250" y2="45" stroke="#64748b" stroke-width="2"/><line x1="200" y1="75" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><line x1="420" y1="75" x2="470" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Task 1 prepares the rooms, tasks 2 and 3 move the devices in.</p></div>

<h3>Task 1: switch ADOMs on and create the two ADOMs</h3>
<p>Why: with ADOMs off only root exists. Think of the section that holds the switch (<code>config system global</code>) and the table that holds the ADOMs (<code>config dvmdb adom</code>). Give each ADOM <code>set version 7.6</code>. What to look for: after the work, <code>diagnose dvm adom list</code> shows root plus your two rows.</p>
<p>Wrong turns: creating the ADOM before the switch. FortiManager answers when you leave the edit with next or end:</p>
<pre class="out">ADOMs are disabled. Enable them first: config system global, set adom-status enable.
Command fail. Return code -1</pre>
<p>Names are case-sensitive: authorizing into "retail" gives "ADOM 'retail' does not exist." Also remember that each ADOM needs its own <code>edit</code>, <code>set version</code> and <code>next</code>.</p>

<h3>Task 2: HQ-FGT into Corporate</h3>
<p>Why: authorize moves a device from the unauthorized list into the device database of an ADOM and retrieves its configuration as revision 1. Run authorize with the device name and the ADOM name. What to look for:</p>
<pre class="out">FMG-1 # execute fmgui authorize HQ-FGT Corporate
Device HQ-FGT (FGVMEV1RGF38I000) authorized in ADOM <span class="hl">Corporate</span>.
Configuration retrieved: revision 1 created.</pre>
<p>Wrong turn: authorizing the same device twice gives "'HQ-FGT' is not in the list of unauthorized devices." The simulator does not stop you from authorizing a device into the wrong ADOM, for example HQ-FGT into Retail; the reply looks like a success. Read the ADOM name in the reply every time.</p>

<h3>Task 3: MDU-FGT and TRY-FGT into Retail, then check</h3>
<p>Why: the same command twice, with Retail as the ADOM. Then list the ADOMs and the devices. What to look for is the DEVICES column and the ADOM column of the device list:</p>
<pre class="out">FMG-1 # diagnose dvm adom list
--- There are currently 3 ADOMs ---
OID	STATE	NAME		VERSION	MODE	DEVICES
3	enabled	root		7.6	GMS	0
283	enabled	Corporate		7.6	GMS	<span class="hl">1</span>
259	enabled	Retail		7.6	GMS	<span class="hl">2</span>

FMG-1 # diagnose dvm device list
HQ-FGT   Corporate  7.6 MR0 (3401)   conf: in sync; dm: retrieved; conn: up
MDU-FGT  Retail     7.6 MR0 (3401)   conf: in sync; dm: retrieved; conn: up
TRY-FGT  Retail     7.6 MR0 (3401)   conf: in sync; dm: retrieved; conn: up</pre>
<p>The device lines above are shortened to the columns that matter. Each device also shows pkg:[unknown]null, because nothing has been imported yet. This lab does not ask for an import.</p>

<h3>Task 4: the question</h3>
<p>The last task asks which ADOM exists from the start, even before you create any. The answer is in the output of the first <code>diagnose dvm adom list</code> you ran before turning ADOMs on: root, with the note that only root is in use.</p>

<div class="warn"><p><b>Common mistakes.</b> Putting the wrong version on one of the two ADOMs and then meeting the version refusal of chapter 2. Authorizing before both ADOMs exist. Reading DEVICES 0 for root as an error: root is meant to stay empty.</p></div>

<div class="exam"><p><b>Exam traps.</b> The ADOM list counts devices per ADOM; the device list names the ADOM per device. Both must tell the same story. Authorize also retrieves the configuration, so every device here starts with revision 1.</p></div>

<div class="scn"><h4>The device in the wrong room</h4><p>A junior engineer at Kaveri authorized TRY-FGT into Corporate while hurrying through the same steps as this lab. Nothing failed, because both ADOMs were 7.6. A week later the retail team could not find the branch in their ADOM. The engineer compared the ADOM list with the device list, saw Corporate with 2 devices, and moved the entry by deleting and re-authorizing it.</p><p><b>Lesson:</b> a successful reply is not a correct reply; check the ADOM name and the DEVICES count.</p></div>

<div class="iv"><p class="q">"You have created ADOMs. How do you prove the devices are in the right ones?"</p><p>Run the ADOM list and the device list together. The DEVICES column per ADOM must match the number of devices you placed, and the ADOM column of each device must name the intended ADOM. Mention that the simulator accepts any existing ADOM, so the check is on you.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: switch on, create ADOMs with version 7.6, authorize devices.</li>
<li>Creating an ADOM while ADOMs are disabled fails with a clear message.</li>
<li>Names are case-sensitive; authorize accepts any existing ADOM.</li>
<li>Check the DEVICES column and the ADOM column of the device list.</li>
<li>root is the ADOM that exists from the start.</li>
</ul></div>
`,hi:`
<p>Lab naye office ko arrange karne jaisa hai: pehle kamre banao, phir logon ko shift karo. Is lab mein aap kamre banate ho (ADOMs Corporate aur Retail) aur phir har FortiGate ko sahi kamre mein rakhte ho. Isme chaar tasks hain aur lagbhag 25 minute lagte hain. Topology wahi Kaveri Retail network hai: FMG-1 192.0.2.5 par, aur HQ-FGT, MDU-FGT, TRY-FGT management network par .11, .12 aur .13 par. Teeno FGFM se call in kar chuke hain aur unauthorized list mein wait kar rahe hain.</p>

<div class="note"><p><b>Shuru karne se pehle.</b> Authorize simulator mein <code>execute fmgui</code> command hai kyunki real product mein ye GUI ya API action hai. Taiyar script paste mat karo. Har task karo aur agle se pehle reply padho.</p></div>

<h3>Goal aur approach</h3>
<p>Goal hai company do ADOMs mein: HQ-FGT Corporate mein, MDU-FGT aur TRY-FGT Retail mein, dono ADOMs version 7.6 par (FortiGates ka firmware, chapter 2). Order tay hai: ADOM save hone se pehle switch on hona chahiye, aur device authorize hone se pehle ADOM exist karna chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Lab ka target layout">
<rect x="20" y="20" width="180" height="110" rx="8" fill="#e2e8f0"/><text x="110" y="46" text-anchor="middle" class="svg-ink" font-size="13">1 Switch on</text><text x="110" y="70" text-anchor="middle" class="svg-muted" font-size="12">adom-status enable</text><text x="110" y="92" text-anchor="middle" class="svg-muted" font-size="12">phir do ADOMs</text>
<rect x="250" y="20" width="170" height="50" rx="8" fill="#bae6fd"/><text x="335" y="42" text-anchor="middle" class="svg-ink" font-size="13">2 Corporate</text><text x="335" y="60" text-anchor="middle" class="svg-muted" font-size="12">HQ-FGT</text>
<rect x="250" y="80" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="335" y="102" text-anchor="middle" class="svg-ink" font-size="13">3 Retail</text><text x="335" y="120" text-anchor="middle" class="svg-muted" font-size="12">MDU-FGT, TRY-FGT</text>
<rect x="470" y="45" width="150" height="60" rx="8" fill="#fde68a"/><text x="545" y="70" text-anchor="middle" class="svg-ink" font-size="13">4 Sawaal</text><text x="545" y="90" text-anchor="middle" class="svg-muted" font-size="12">kaun sa ADOM built-in?</text>
<line x1="200" y1="75" x2="250" y2="45" stroke="#64748b" stroke-width="2"/><line x1="200" y1="75" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><line x1="420" y1="75" x2="470" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Task 1 kamre taiyar karta hai, tasks 2 aur 3 devices ko andar le jate hain.</p></div>

<h3>Task 1: ADOMs on karo aur do ADOMs banao</h3>
<p>Kyun: ADOMs off hon to sirf root exist karta hai. Socho switch kaun se section mein hai (<code>config system global</code>) aur ADOMs kaun si table mein (<code>config dvmdb adom</code>). Har ADOM ko <code>set version 7.6</code> do. Kya dekhna hai: kaam ke baad <code>diagnose dvm adom list</code> root aur aapki do rows dikhata hai.</p>
<p>Wrong turns: switch se pehle ADOM banana. Edit se next ya end se nikalte hi FortiManager jawab deta hai:</p>
<pre class="out">ADOMs are disabled. Enable them first: config system global, set adom-status enable.
Command fail. Return code -1</pre>
<p>Names case-sensitive hain: "retail" mein authorize karoge to "ADOM 'retail' does not exist." milega. Ye bhi yaad rakho ki har ADOM ko apna <code>edit</code>, <code>set version</code> aur <code>next</code> chahiye.</p>

<h3>Task 2: HQ-FGT ko Corporate mein</h3>
<p>Kyun: authorize device ko unauthorized list se ADOM ke device database mein le jata hai aur uski configuration revision 1 ki tarah retrieve karta hai. Device ka naam aur ADOM ka naam dekar authorize chalao. Kya dekhna hai:</p>
<pre class="out">FMG-1 # execute fmgui authorize HQ-FGT Corporate
Device HQ-FGT (FGVMEV1RGF38I000) authorized in ADOM <span class="hl">Corporate</span>.
Configuration retrieved: revision 1 created.</pre>
<p>Wrong turn: ek device ko do baar authorize karoge to "'HQ-FGT' is not in the list of unauthorized devices." milta hai. Simulator aapko device galat ADOM mein authorize karne se nahi rokta, jaise HQ-FGT ko Retail mein; reply success jaisa dikhta hai. Har baar reply mein ADOM ka naam padho.</p>

<h3>Task 3: MDU-FGT aur TRY-FGT ko Retail mein, phir check</h3>
<p>Kyun: wahi command do baar, ADOM Retail ke saath. Phir ADOMs aur devices list karo. Dekhna hai DEVICES column aur device list ka ADOM column:</p>
<pre class="out">FMG-1 # diagnose dvm adom list
--- There are currently 3 ADOMs ---
OID	STATE	NAME		VERSION	MODE	DEVICES
3	enabled	root		7.6	GMS	0
283	enabled	Corporate		7.6	GMS	<span class="hl">1</span>
259	enabled	Retail		7.6	GMS	<span class="hl">2</span>

FMG-1 # diagnose dvm device list
HQ-FGT   Corporate  7.6 MR0 (3401)   conf: in sync; dm: retrieved; conn: up
MDU-FGT  Retail     7.6 MR0 (3401)   conf: in sync; dm: retrieved; conn: up
TRY-FGT  Retail     7.6 MR0 (3401)   conf: in sync; dm: retrieved; conn: up</pre>
<p>Upar ki device lines un columns tak chhoti ki gayi hain jo zaroori hain. Har device pkg:[unknown]null bhi dikhata hai, kyunki abhi kuch import nahi hua. Ye lab import nahi maangta.</p>

<h3>Task 4: sawaal</h3>
<p>Aakhri task poochta hai ki shuru se, koi ADOM banane se pehle bhi, kaun sa ADOM exist karta hai. Jawab us pehle <code>diagnose dvm adom list</code> ke output mein hai jo ADOMs on karne se pehle chalayi thi: root, us note ke saath ki sirf root use ho raha hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Do ADOMs mein se ek par galat version daalna aur phir chapter 2 ka version refusal milna. Dono ADOMs banne se pehle authorize karna. Root ke liye DEVICES 0 ko error padhna: root ko khaali hi rehna hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> ADOM list har ADOM ke devices ginti hai; device list har device ka ADOM batati hai. Dono ek hi kahani kahein. Authorize configuration bhi retrieve karta hai, isliye yahan har device revision 1 se shuru hota hai.</p></div>

<div class="scn"><h4>Galat kamre mein device</h4><p>Kaveri ke ek junior engineer ne is lab jaise steps jaldi mein karte hue TRY-FGT ko Corporate mein authorize kar diya. Kuch fail nahi hua kyunki dono ADOMs 7.6 the. Ek hafte baad retail team ko apne ADOM mein branch nahi mila. Engineer ne ADOM list ko device list se compare kiya, Corporate mein 2 devices dekhe, aur entry ko delete aur dobara authorize karke move kiya.</p><p><b>Lesson:</b> successful reply sahi reply nahi hota; ADOM naam aur DEVICES count check karo.</p></div>

<div class="iv"><p class="q">"Aapne ADOMs bana liye. Kaise saabit karoge ki devices sahi ADOMs mein hain?"</p><p>ADOM list aur device list saath chalao. Har ADOM ka DEVICES column aapke rakhe devices ki ginti se match kare, aur har device ka ADOM column intended ADOM ka naam batae. Mention karo ki simulator koi bhi existing ADOM accept kar leta hai, isliye check aapki zimmedari hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: switch on, version 7.6 ke saath ADOMs banao, devices authorize karo.</li>
<li>ADOMs disabled hon to ADOM banana saaf message ke saath fail hota hai.</li>
<li>Names case-sensitive hain; authorize koi bhi existing ADOM accept karta hai.</li>
<li>DEVICES column aur device list ka ADOM column check karo.</li>
<li>root wo ADOM hai jo shuru se exist karta hai.</li>
</ul></div>
`}};export{e as default};