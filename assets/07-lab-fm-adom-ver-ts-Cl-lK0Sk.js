var e={id:`lab-fm-adom-ver-ts`,h:{en:`Lab fm-adom-ver-ts: authorization refused, the ADOM version`,hi:`Lab fm-adom-ver-ts: authorization refuse, ADOM version`},body:{en:`
<p>A doctor does not give medicine before reading the patient's chart. A troubleshooting lab trains the same habit: read the message first, then act. In this lab the ticket is short and the error is clear, so the skill being tested is patience. Two FortiGates, HQ-FGT and MDU-FGT, wait in the unauthorized list of FMG-1. The ADOM Kaveri was prepared last month. Every authorize attempt fails. The lab has three tasks and takes about 25 minutes.</p>

<div class="note"><p><b>Before you start.</b> Authorize is an <code>execute fmgui</code> command in the simulator because it is a GUI or API action in the real product. This is a troubleshoot lab, so you get no list of steps: you read, decide, fix and verify. Do not look at the solution before you have read the error twice.</p></div>

<h3>Goal and approach</h3>
<p>The goal is that both devices end up in the device database of Kaveri with the tunnel up. The approach in four moves: reproduce the failure, read the message, find the disagreeing value on FortiManager, correct the right side, then repeat the action.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Troubleshooting loop">
<rect x="10" y="40" width="130" height="60" rx="8" fill="#fed7aa"/><text x="75" y="66" text-anchor="middle" class="svg-ink" font-size="13">Reproduce</text><text x="75" y="86" text-anchor="middle" class="svg-muted" font-size="12">authorize fails</text>
<rect x="170" y="40" width="130" height="60" rx="8" fill="#fde68a"/><text x="235" y="66" text-anchor="middle" class="svg-ink" font-size="13">Read</text><text x="235" y="86" text-anchor="middle" class="svg-muted" font-size="12">two versions named</text>
<rect x="330" y="40" width="130" height="60" rx="8" fill="#bae6fd"/><text x="395" y="66" text-anchor="middle" class="svg-ink" font-size="13">Compare</text><text x="395" y="86" text-anchor="middle" class="svg-muted" font-size="12">ADOM list</text>
<rect x="490" y="40" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="66" text-anchor="middle" class="svg-ink" font-size="13">Fix and retry</text><text x="560" y="86" text-anchor="middle" class="svg-muted" font-size="12">then verify</text>
<line x1="140" y1="70" x2="170" y2="70" stroke="#64748b" stroke-width="2"/><line x1="300" y1="70" x2="330" y2="70" stroke="#64748b" stroke-width="2"/><line x1="460" y1="70" x2="490" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The same loop works for every refused action in FortiManager.</p></div>

<h3>Task 1: try to authorize HQ-FGT into Kaveri and read the message</h3>
<p>Why: you want the real text, not your memory of it. First list the unauthorized devices to confirm both are waiting, then try the authorize. The task asks which ADOM version the message names. Read the whole line, because it contains two numbers and only one is the answer.</p>
<pre class="out">FMG-1 # execute fmgui authorize HQ-FGT Kaveri
Authorization failed: Device firmware version 7.6 does not match the version of ADOM Kaveri (<span class="hl">7.4</span>).</pre>
<p>The first number is the device firmware, 7.6. The number in brackets belongs to the ADOM, 7.4. The answer for the lab is the ADOM version.</p>

<h3>Task 2: fix the ADOM and authorize both devices</h3>
<p>Why: the message is about the ADOM, and the FortiGates are both on the same release, so the ADOM is what is wrong. Confirm on the ADOM list that Kaveri shows 7.4 and 0 devices:</p>
<pre class="out">FMG-1 # diagnose dvm adom list
OID	STATE	NAME		VERSION	MODE	DEVICES
3	enabled	root		7.6	GMS	0
464	enabled	Kaveri		<span class="hl">7.4</span>	GMS	<span class="hl">0</span></pre>
<p>Edit the entry of Kaveri in <code>config dvmdb adom</code> and set the version to match the devices. Then authorize both devices. What to look for at the end: both devices listed in Kaveri, <code>conn: up</code> and <code>conf: in sync</code>, and the ADOM list showing 2 devices.</p>
<pre class="out">464	enabled	Kaveri		7.6	GMS	<span class="hl">2</span></pre>
<p>Wrong turns, all of which cost time:</p>
<ul>
<li><b>Writing the version as 7.6.0.</b> FortiManager rejects it: "value parse error before '7.6.0'". Use 7.6.</li>
<li><b>Trying to change the FortiGate.</b> The firmware is correct; the ADOM is wrong. In this simulator the banner of <code>get system status</code> on a FortiGate prints a generic version, so use the FortiManager device list and the refusal text as your reference for the release.</li>
<li><b>Forgetting that the edit must be saved.</b> After <code>set version</code> you need <code>next</code> and <code>end</code>; run <code>diagnose dvm adom list</code> to prove the change before you authorize again.</li>
<li><b>Authorizing only one device</b> and ending the lab. The check wants both.</li>
</ul>

<h3>Task 3: the one-word question</h3>
<p>The ADOM version must equal which property of the device? One word. Think of the column in the device list that shows 7.6 MR0 and of the first number in the refusal message. The word is the property that the message calls "Device ... version".</p>

<div class="eg"><p><b>Worked example.</b> The same loop with another symptom. If the message had said "ADOM 'Kaveri' does not exist", the disagreement would be a spelling or a missing ADOM, and the fix would be on the ADOM list, not the version. The message decides the branch of the loop.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Starting with the FGFM tunnel when the tunnel works: the devices are in the unauthorized list, so FGFM is fine. Deleting and recreating the ADOM when one edit is enough. Fixing the ADOM but forgetting to repeat the authorize command.</p></div>

<div class="exam"><p><b>Exam traps.</b> A device in the unauthorized list has a working tunnel. Authorization fails on a version mismatch, not on a network problem. The ADOM version is a two-part number such as 7.6.</p></div>

<div class="scn"><h4>Friday upgrade, Monday refusal</h4><p>Kaveri upgraded two branch FortiGates on Friday night and prepared the ADOM for the new devices on Saturday, but copied the version from last year's notes. On Monday both devices called in, appeared in the waiting list and could not be authorized. The engineer read the refusal, saw 7.6 against 7.4, edited the ADOM and authorized both devices in under five minutes.</p><p><b>Lesson:</b> the message tells you which two values disagree; believe it before you look elsewhere.</p></div>

<div class="iv"><p class="q">"Authorization is refused with a version message. Walk me through your fix."</p><p>Read both versions in the message, confirm the ADOM version on the ADOM list, correct the ADOM to the device firmware, authorize again and verify that conn is up and conf in sync. Add that you do not touch the FortiGate when the message points at the ADOM.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The refusal names the device firmware and, in brackets, the ADOM version.</li>
<li>Fix the ADOM with <code>set version 7.6</code>; 7.6.0 is a parse error.</li>
<li>Repeat the authorize after the fix and verify with the device list.</li>
<li>A device in the waiting list proves that FGFM works.</li>
<li>The answer to task 3 is firmware.</li>
</ul></div>
`,hi:`
<p>Doctor patient ka chart padhe bina dawa nahi deta. Troubleshooting lab wahi aadat sikhata hai: pehle message padho, phir action lo. Is lab mein ticket chhota hai aur error saaf, isliye jo skill test hoti hai wo dhairya hai. Do FortiGates, HQ-FGT aur MDU-FGT, FMG-1 ki unauthorized list mein wait kar rahe hain. ADOM Kaveri pichhle mahine taiyar hua tha. Har authorize attempt fail hota hai. Lab mein teen tasks hain aur lagbhag 25 minute lagte hain.</p>

<div class="note"><p><b>Shuru karne se pehle.</b> Authorize simulator mein <code>execute fmgui</code> command hai kyunki real product mein ye GUI ya API action hai. Ye troubleshoot lab hai, isliye steps ki list nahi milti: aap padhte ho, tay karte ho, fix karte ho aur verify karte ho. Error do baar padhne se pehle solution mat dekho.</p></div>

<h3>Goal aur approach</h3>
<p>Goal hai ki dono devices Kaveri ke device database mein tunnel up ke saath aa jayein. Approach chaar moves mein: failure reproduce karo, message padho, FortiManager par wo value dhundho jo match nahi karti, sahi side theek karo, phir action dohrao.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Troubleshooting loop">
<rect x="10" y="40" width="130" height="60" rx="8" fill="#fed7aa"/><text x="75" y="66" text-anchor="middle" class="svg-ink" font-size="13">Reproduce</text><text x="75" y="86" text-anchor="middle" class="svg-muted" font-size="12">authorize fail</text>
<rect x="170" y="40" width="130" height="60" rx="8" fill="#fde68a"/><text x="235" y="66" text-anchor="middle" class="svg-ink" font-size="13">Padho</text><text x="235" y="86" text-anchor="middle" class="svg-muted" font-size="12">do versions ke naam</text>
<rect x="330" y="40" width="130" height="60" rx="8" fill="#bae6fd"/><text x="395" y="66" text-anchor="middle" class="svg-ink" font-size="13">Compare</text><text x="395" y="86" text-anchor="middle" class="svg-muted" font-size="12">ADOM list</text>
<rect x="490" y="40" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="66" text-anchor="middle" class="svg-ink" font-size="13">Fix aur retry</text><text x="560" y="86" text-anchor="middle" class="svg-muted" font-size="12">phir verify</text>
<line x1="140" y1="70" x2="170" y2="70" stroke="#64748b" stroke-width="2"/><line x1="300" y1="70" x2="330" y2="70" stroke="#64748b" stroke-width="2"/><line x1="460" y1="70" x2="490" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">FortiManager ki har refused action ke liye yahi loop kaam karta hai.</p></div>

<h3>Task 1: HQ-FGT ko Kaveri mein authorize karne ki koshish karo aur message padho</h3>
<p>Kyun: aapko asli text chahiye, apni yaadasht nahi. Pehle unauthorized devices list karo ki dono wait kar rahe hain, phir authorize try karo. Task poochta hai message kaun sa ADOM version batata hai. Poori line padho, kyunki usme do numbers hain aur jawab sirf ek hai.</p>
<pre class="out">FMG-1 # execute fmgui authorize HQ-FGT Kaveri
Authorization failed: Device firmware version 7.6 does not match the version of ADOM Kaveri (<span class="hl">7.4</span>).</pre>
<p>Pehla number device firmware hai, 7.6. Bracket wala number ADOM ka hai, 7.4. Lab ka jawab ADOM version hai.</p>

<h3>Task 2: ADOM theek karo aur dono devices authorize karo</h3>
<p>Kyun: message ADOM ke baare mein hai, aur dono FortiGates ek hi release par hain, isliye ADOM galat hai. ADOM list mein confirm karo ki Kaveri 7.4 aur 0 devices dikhata hai:</p>
<pre class="out">FMG-1 # diagnose dvm adom list
OID	STATE	NAME		VERSION	MODE	DEVICES
3	enabled	root		7.6	GMS	0
464	enabled	Kaveri		<span class="hl">7.4</span>	GMS	<span class="hl">0</span></pre>
<p><code>config dvmdb adom</code> mein Kaveri ki entry edit karo aur version devices ke barabar set karo. Phir dono devices authorize karo. Ant mein kya dekhna hai: dono devices Kaveri mein, <code>conn: up</code> aur <code>conf: in sync</code>, aur ADOM list mein 2 devices.</p>
<pre class="out">464	enabled	Kaveri		7.6	GMS	<span class="hl">2</span></pre>
<p>Wrong turns, jo sab samay kharch karte hain:</p>
<ul>
<li><b>Version 7.6.0 likhna.</b> FortiManager use reject karta hai: "value parse error before '7.6.0'". 7.6 use karo.</li>
<li><b>FortiGate badalne ki koshish.</b> Firmware sahi hai; ADOM galat hai. Is simulator mein FortiGate par <code>get system status</code> ka banner generic version print karta hai, isliye release ke liye FortiManager ki device list aur refusal text ko reference maano.</li>
<li><b>Edit save karna bhool jana.</b> <code>set version</code> ke baad <code>next</code> aur <code>end</code> chahiye; dobara authorize karne se pehle <code>diagnose dvm adom list</code> se change saabit karo.</li>
<li><b>Sirf ek device authorize</b> karke lab khatam maan lena. Check dono maangta hai.</li>
</ul>

<h3>Task 3: ek shabd ka sawaal</h3>
<p>ADOM version device ki kaun si property ke barabar hona chahiye? Ek shabd. Device list ke us column ko socho jo 7.6 MR0 dikhata hai aur refusal message ke pehle number ko. Shabd wo property hai jise message "Device ... version" kehta hai.</p>

<div class="eg"><p><b>Worked example.</b> Wahi loop, doosre symptom ke saath. Message "ADOM 'Kaveri' does not exist" kehta, to mismatch spelling ya missing ADOM hota, aur fix ADOM list mein hota, version mein nahi. Message loop ki branch tay karta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Tunnel chal raha ho tab FGFM tunnel se shuru karna: devices unauthorized list mein hain, matlab FGFM theek hai. Ek edit kaafi ho tab ADOM delete karke dobara banana. ADOM theek karke authorize command dohrana bhool jana.</p></div>

<div class="exam"><p><b>Exam traps.</b> Unauthorized list mein device ka matlab tunnel chal raha hai. Authorization version mismatch par fail hota hai, network problem par nahi. ADOM version 7.6 jaisa do hisse ka number hai.</p></div>

<div class="scn"><h4>Friday upgrade, Monday refusal</h4><p>Kaveri ne Friday raat do branch FortiGates upgrade kiye aur Saturday naye devices ke liye ADOM taiyar kiya, par version pichhle saal ke notes se copy kar liya. Monday dono devices ne call in kiya, waiting list mein aaye aur authorize nahi ho sake. Engineer ne refusal padha, 7.6 aur 7.4 dekha, ADOM edit kiya aur paanch minute se kam mein dono authorize kar diye.</p><p><b>Lesson:</b> message batata hai kaun si do values match nahi karti; kahin aur dekhne se pehle us par bharosa karo.</p></div>

<div class="iv"><p class="q">"Authorization version message ke saath refuse ho raha hai. Apna fix batao."</p><p>Message mein dono versions padho, ADOM list mein ADOM version confirm karo, ADOM ko device firmware ke barabar karo, dobara authorize karo aur verify karo ki conn up aur conf in sync hai. Jodo ki message ADOM ki taraf ishara kare to FortiGate ko haath nahi lagate.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Refusal device firmware aur bracket mein ADOM version batata hai.</li>
<li>ADOM ko <code>set version 7.6</code> se theek karo; 7.6.0 parse error hai.</li>
<li>Fix ke baad authorize dohrao aur device list se verify karo.</li>
<li>Waiting list mein device ka hona saabit karta hai ki FGFM chal raha hai.</li>
<li>Task 3 ka jawab firmware hai.</li>
</ul></div>
`}};export{e as default};