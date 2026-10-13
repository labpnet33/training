var e={id:`designing-adoms`,h:{en:`Designing ADOMs: by unit, by region, by firmware`,hi:`ADOMs design karna: unit, region aur firmware ke hisaab se`},body:{en:`
<p>Sorting laundry is easy when you decide the rule first: whites together, colours together. If you sort by whatever is closest, you end up with pink shirts. ADOM design is the same. Before you create a single ADOM you decide what the rule of separation is, because moving devices between ADOMs later is real work: the policy packages and objects have to be rebuilt in the new ADOM.</p>

<h3>The three common ways to split</h3>
<table class="cmp"><tr><th>Split by</th><th>Example at Kaveri</th><th>Good when</th><th>Watch out for</th></tr>
<tr><td>Business unit</td><td>Corporate (HQ-FGT), Retail (MDU-FGT, TRY-FGT)</td><td>Different teams own different parts</td><td>Objects that both units need must be created twice</td></tr>
<tr><td>Region</td><td>Chennai, Madurai, Trichy</td><td>Regional admins, local rules</td><td>Many small ADOMs with one device each</td></tr>
<tr><td>Firmware</td><td>ADOM 7.4 and ADOM 7.6</td><td>An upgrade happens in waves</td><td>Temporary by nature; plan its end</td></tr></table>
<p>The three are not exclusive. Many companies split by business unit first and add a separate ADOM only while some devices wait for an upgrade. Firmware is the one split that you do not choose freely: the version rule of chapter 2 forces it whenever devices run different releases.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Questions to decide ADOMs">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">New device to place</text>
<rect x="20" y="85" width="170" height="50" rx="8" fill="#fde68a"/><text x="105" y="106" text-anchor="middle" class="svg-ink" font-size="12">Same firmware as</text><text x="105" y="122" text-anchor="middle" class="svg-ink" font-size="12">an existing ADOM?</text>
<rect x="235" y="85" width="170" height="50" rx="8" fill="#fde68a"/><text x="320" y="106" text-anchor="middle" class="svg-ink" font-size="12">Same admin team</text><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="12">and policy style?</text>
<rect x="450" y="85" width="170" height="50" rx="8" fill="#fde68a"/><text x="535" y="106" text-anchor="middle" class="svg-ink" font-size="12">Needs its own</text><text x="535" y="122" text-anchor="middle" class="svg-ink" font-size="12">packages?</text>
<rect x="20" y="160" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="105" y="185" text-anchor="middle" class="svg-ink" font-size="12">no: new ADOM</text>
<rect x="235" y="160" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="12">yes: same ADOM</text>
<rect x="450" y="160" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="535" y="185" text-anchor="middle" class="svg-ink" font-size="12">yes: own ADOM</text>
<line x1="280" y1="50" x2="105" y2="85" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="85" stroke="#64748b" stroke-width="2"/><line x1="360" y1="50" x2="535" y2="85" stroke="#64748b" stroke-width="2"/>
<line x1="105" y1="135" x2="105" y2="160" stroke="#64748b" stroke-width="2"/><line x1="320" y1="135" x2="320" y2="160" stroke="#64748b" stroke-width="2"/><line x1="535" y1="135" x2="535" y2="160" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Three questions, in this order: firmware, team, packages.</p></div>

<h3>Naming</h3>
<p>An ADOM name is typed in many commands (<code>execute fmgui authorize HQ-FGT Corporate</code>), shown in every device row and used by every admin. Good names are short, stable and about the owner, not the moment: Corporate, Retail, Kaveri. Bad names describe a project or a date (Q3-Test, New2), because the project ends and the name stays. In the simulator a name is global, so you cannot reuse Retail inside another ADOM, which is a useful discipline anyway.</p>

<h3>Worked example: the Kaveri choice</h3>
<div class="eg"><p>Kaveri has three FortiGates. Option A is one ADOM, Kaveri, for all three: simple, and fine while one team does everything. Option B is two ADOMs, Corporate for HQ-FGT and Retail for MDU-FGT and TRY-FGT, because the head office security team and the retail network team are different people. The lab of chapter 6 builds option B. This is what the result looks like:</p></div>
<pre class="out">FMG-1 # diagnose dvm adom list
--- There are currently 3 ADOMs ---
OID	STATE	NAME		VERSION	MODE	DEVICES
3	enabled	root		7.6	GMS	0
283	enabled	Corporate		7.6	GMS	<span class="hl">1</span>
259	enabled	Retail		7.6	GMS	<span class="hl">2</span></pre>
<p>Three rows: root with 0 devices, Corporate with 1, Retail with 2. The DEVICES column adds up to the 3 FortiGates, which is a quick sanity check.</p>

<h3>What not to do</h3>
<ul>
<li><b>One ADOM per device.</b> Ten branches with ten ADOMs means ten copies of every object and package. Share an ADOM when the policy is the same.</li>
<li><b>Everything in root.</b> It works, but you give up separation. Root is better kept empty once real ADOMs exist.</li>
<li><b>Splitting by technology you do not manage.</b> ADOMs do not separate traffic, so do not use them as security zones.</li>
<li><b>Mixing firmware in one ADOM.</b> The simulator refuses it, and the real product has the same rule.</li>
</ul>
<p>In the real product a global policy database can share policies across ADOMs. It is not modelled in the simulator; treat it as a pointer for further reading.</p>

<div class="warn"><p><b>Common mistakes.</b> Designing for today's org chart only; creating the ADOM with the wrong version and then authorizing five devices into the wrong place; forgetting that a policy package cannot be installed on a device that is in another ADOM.</p></div>

<div class="exam"><p><b>Exam traps.</b> An ADOM is a management boundary, not a traffic boundary. Objects and packages belong to one ADOM. A mixed-firmware estate needs one ADOM per firmware version.</p></div>

<div class="scn"><h4>The takeover that doubled the ADOMs</h4><p>Kaveri bought a small retailer whose FortiGates still ran 7.4. The first idea was to upgrade them all in one weekend. The engineer instead created an ADOM at version 7.4 for the new devices, kept their packages separate and upgraded in waves. Each wave moved devices once the ADOM and firmware matched.</p><p><b>Lesson:</b> a firmware ADOM is a bridge, not a destination; write down when it will be removed.</p></div>

<div class="iv"><p class="q">"How would you design ADOMs for a company with 40 branches and a head office?"</p><p>Ask about teams and firmware first. A sensible answer: one ADOM for the head office and one for the branches if the branch policy is common, extra ADOMs only for different admin teams or temporary firmware groups. Mention naming and that you avoid one ADOM per device.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Decide the rule of separation before creating ADOMs: unit, region or firmware.</li>
<li>Ask in order: firmware, team, packages.</li>
<li>Use short, stable names about the owner; names are global in the simulator.</li>
<li>Avoid one ADOM per device and avoid everything in root.</li>
<li>The DEVICES column of the ADOM list is a quick sanity check.</li>
</ul></div>
`,hi:`
<p>Kapde sort karna tab aasan hota hai jab pehle rule tay ho: safed ek saath, rangeen ek saath. Jo paas hai usse sort karoge to gulabi shirts mil jayengi. ADOM design bhi aisa hi hai. Ek bhi ADOM banane se pehle tay karo ki separation ka rule kya hai, kyunki baad mein devices ko ADOMs ke beech le jana asli kaam hai: policy packages aur objects naye ADOM mein dobara banane padte hain.</p>

<h3>Baantne ke teen common tareeke</h3>
<table class="cmp"><tr><th>Kis hisaab se</th><th>Kaveri mein example</th><th>Kab achha hai</th><th>Dhyan rakho</th></tr>
<tr><td>Business unit</td><td>Corporate (HQ-FGT), Retail (MDU-FGT, TRY-FGT)</td><td>Alag teams alag parts own karti hain</td><td>Jo objects dono units ko chahiye wo do baar banane padte hain</td></tr>
<tr><td>Region</td><td>Chennai, Madurai, Trichy</td><td>Regional admins, local rules</td><td>Ek-ek device wale bahut chhote ADOMs</td></tr>
<tr><td>Firmware</td><td>ADOM 7.4 aur ADOM 7.6</td><td>Upgrade waves mein hota hai</td><td>Temporary hota hai; uska ant plan karo</td></tr></table>
<p>Teeno ek doosre ko rokte nahi. Kai companies pehle business unit se baantti hain aur alag ADOM sirf tab jodti hain jab kuch devices upgrade ka intezaar kar rahe hon. Firmware wo split hai jo aap freely choose nahi karte: chapter 2 ka version rule use majboor karta hai jab devices alag releases chalate hon.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="ADOMs tay karne ke sawaal">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Naya device rakhna hai</text>
<rect x="20" y="85" width="170" height="50" rx="8" fill="#fde68a"/><text x="105" y="106" text-anchor="middle" class="svg-ink" font-size="12">Kisi ADOM ke jaisa</text><text x="105" y="122" text-anchor="middle" class="svg-ink" font-size="12">firmware hai?</text>
<rect x="235" y="85" width="170" height="50" rx="8" fill="#fde68a"/><text x="320" y="106" text-anchor="middle" class="svg-ink" font-size="12">Wahi admin team</text><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="12">aur policy style?</text>
<rect x="450" y="85" width="170" height="50" rx="8" fill="#fde68a"/><text x="535" y="106" text-anchor="middle" class="svg-ink" font-size="12">Apne alag</text><text x="535" y="122" text-anchor="middle" class="svg-ink" font-size="12">packages chahiye?</text>
<rect x="20" y="160" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="105" y="185" text-anchor="middle" class="svg-ink" font-size="12">nahi: naya ADOM</text>
<rect x="235" y="160" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="12">haan: wahi ADOM</text>
<rect x="450" y="160" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="535" y="185" text-anchor="middle" class="svg-ink" font-size="12">haan: apna ADOM</text>
<line x1="280" y1="50" x2="105" y2="85" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="85" stroke="#64748b" stroke-width="2"/><line x1="360" y1="50" x2="535" y2="85" stroke="#64748b" stroke-width="2"/>
<line x1="105" y1="135" x2="105" y2="160" stroke="#64748b" stroke-width="2"/><line x1="320" y1="135" x2="320" y2="160" stroke="#64748b" stroke-width="2"/><line x1="535" y1="135" x2="535" y2="160" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Teen sawaal, is order mein: firmware, team, packages.</p></div>

<h3>Naming</h3>
<p>ADOM name kai commands mein type hota hai (<code>execute fmgui authorize HQ-FGT Corporate</code>), har device row mein dikhta hai aur har admin use karta hai. Achhe names chhote, stable aur owner ke baare mein hote hain, lamhe ke baare mein nahi: Corporate, Retail, Kaveri. Bure names project ya date batate hain (Q3-Test, New2), kyunki project khatam hota hai aur naam rah jata hai. Simulator mein naam global hota hai, isliye Retail ko doosre ADOM ke andar dobara use nahi kar sakte, jo waise bhi achhi discipline hai.</p>

<h3>Worked example: Kaveri ka choice</h3>
<div class="eg"><p>Kaveri ke teen FortiGates hain. Option A: teeno ke liye ek ADOM Kaveri: simple, aur tab theek jab ek hi team sab karti hai. Option B: do ADOMs, HQ-FGT ke liye Corporate aur MDU-FGT, TRY-FGT ke liye Retail, kyunki head-office security team aur retail network team alag log hain. Chapter 6 ka lab option B banata hai. Result aisa dikhta hai:</p></div>
<pre class="out">FMG-1 # diagnose dvm adom list
--- There are currently 3 ADOMs ---
OID	STATE	NAME		VERSION	MODE	DEVICES
3	enabled	root		7.6	GMS	0
283	enabled	Corporate		7.6	GMS	<span class="hl">1</span>
259	enabled	Retail		7.6	GMS	<span class="hl">2</span></pre>
<p>Teen rows: root mein 0 devices, Corporate mein 1, Retail mein 2. DEVICES column ka jod 3 FortiGates hai, jo quick sanity check hai.</p>

<h3>Kya nahi karna</h3>
<ul>
<li><b>Ek device ke liye ek ADOM.</b> Das branches ke liye das ADOMs ka matlab har object aur package ki das copies. Policy same ho to ADOM share karo.</li>
<li><b>Sab kuch root mein.</b> Chalta hai, par separation chhod dete ho. Asli ADOMs ban jayein to root ko khaali rakhna behtar hai.</li>
<li><b>Aisi technology se baantna jo aap manage nahi karte.</b> ADOMs traffic alag nahi karte, isliye unhe security zones ki tarah use mat karo.</li>
<li><b>Ek ADOM mein mixed firmware.</b> Simulator refuse karta hai, aur real product mein bhi yahi rule hai.</li>
</ul>
<p>Real product mein global policy database ADOMs ke beech policies share kar sakta hai. Simulator mein model nahi hai; ise aage padhne ka pointer samjho.</p>

<div class="warn"><p><b>Common mistakes.</b> Sirf aaj ke org chart ke hisaab se design karna; galat version ke saath ADOM banakar paanch devices galat jagah authorize kar dena; ye bhoolna ki policy package aise device par install nahi ho sakta jo doosre ADOM mein hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> ADOM management boundary hai, traffic boundary nahi. Objects aur packages ek ADOM ke hote hain. Mixed-firmware estate ko har firmware version ke liye ek ADOM chahiye.</p></div>

<div class="scn"><h4>Takeover jisne ADOMs doguna kar diye</h4><p>Kaveri ne ek chhota retailer khareeda jiske FortiGates abhi 7.4 chalate the. Pehla idea tha ek weekend mein sab upgrade karna. Engineer ne iski jagah naye devices ke liye version 7.4 ka ADOM banaya, unke packages alag rakhe aur waves mein upgrade kiya. Har wave mein devices tab move hue jab ADOM aur firmware match hue.</p><p><b>Lesson:</b> firmware ADOM ek pul hai, manzil nahi; likh kar rakho ki wo kab hatega.</p></div>

<div class="iv"><p class="q">"40 branches aur head office wali company ke liye ADOMs kaise design karoge?"</p><p>Pehle teams aur firmware poochho. Achha jawab: head office ke liye ek ADOM aur branch policy common ho to branches ke liye ek ADOM, extra ADOMs sirf alag admin teams ya temporary firmware groups ke liye. Naming mention karo aur ye ki ek device ek ADOM se bachte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ADOMs banane se pehle separation ka rule tay karo: unit, region ya firmware.</li>
<li>Is order mein poochho: firmware, team, packages.</li>
<li>Chhote, stable, owner wale names rakho; simulator mein names global hain.</li>
<li>Ek device ek ADOM se bacho aur sab kuch root mein mat rakho.</li>
<li>ADOM list ka DEVICES column quick sanity check hai.</li>
</ul></div>
`}};export{e as default};