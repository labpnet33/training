var e={id:`what-is-an-adom`,h:{en:`What an ADOM is and why companies use ADOMs`,hi:`ADOM kya hai aur companies ADOMs kyun use karti hain`},body:{en:`
<div class="note"><p><b>What you will learn.</b> What an administrative domain (ADOM) is, the four reasons companies split their FortiGates into ADOMs, how to see whether ADOMs are switched on, and which ADOM always exists. <b>Prerequisites:</b> the module fmg-start. You can already onboard a FortiGate, you know that FGFM runs over TCP 541, and you know the unauthorized list, authorize and revision 1.</p></div>

<p>Think of an office building with one reception desk. The building is the FortiManager. Each floor is rented by a different tenant, and each tenant has key cards that open only its own floor. The reception desk and the building are shared, but the finance team cannot walk into the HR floor. An ADOM is a floor.</p>

<h3>The definition, step by step</h3>
<p>An <b>ADOM</b> (administrative domain) is a named container inside FortiManager. It holds a group of FortiGates and everything that belongs to them in FortiManager: the policy packages, the address objects, the normalized interfaces and the templates. The ADOM exists only inside FortiManager. The FortiGate itself never knows which ADOM it belongs to; its own configuration looks the same either way.</p>
<p>Inside FMG-1 the layout is simple. The device database lists the devices, and each device row carries an <code>adom</code> value. The policy database is split per ADOM, so a package in the ADOM Retail cannot be installed on a device that lives in the ADOM Corporate. This is the same device database and policy database you met in fmg-start, now with one more label.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="FMG-1 with three ADOMs">
<rect x="10" y="10" width="620" height="210" rx="10" fill="#e2e8f0"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="14">FMG-1 (192.0.2.5)</text>
<rect x="30" y="52" width="170" height="150" rx="8" fill="#ddd6fe"/><text x="115" y="76" text-anchor="middle" class="svg-ink" font-size="13">ADOM root</text><text x="115" y="130" text-anchor="middle" class="svg-muted" font-size="12">always exists</text><text x="115" y="150" text-anchor="middle" class="svg-muted" font-size="12">no devices yet</text>
<rect x="235" y="52" width="170" height="150" rx="8" fill="#bae6fd"/><text x="320" y="76" text-anchor="middle" class="svg-ink" font-size="13">ADOM Corporate</text><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="12">HQ-FGT</text><text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">packages, objects</text>
<rect x="440" y="52" width="170" height="150" rx="8" fill="#bbf7d0"/><text x="525" y="76" text-anchor="middle" class="svg-ink" font-size="13">ADOM Retail</text><text x="525" y="112" text-anchor="middle" class="svg-ink" font-size="12">MDU-FGT</text><text x="525" y="132" text-anchor="middle" class="svg-ink" font-size="12">TRY-FGT</text><text x="525" y="162" text-anchor="middle" class="svg-muted" font-size="12">packages, objects</text>
</svg><p class="cap">One FortiManager, three ADOMs. Each device sits in exactly one ADOM.</p></div>

<h3>Why companies use ADOMs</h3>
<table class="cmp"><tr><th>Reason</th><th>What it solves</th></tr>
<tr><td>Administrative separation</td><td>The head-office security team edits Corporate; the retail network team edits Retail. Neither can break the other's policy by accident.</td></tr>
<tr><td>Firmware versions</td><td>An ADOM has one version, so a branch still on an older release can live in its own ADOM until it is upgraded (chapter 2).</td></tr>
<tr><td>Clarity at scale</td><td>Thirty devices in one list are hard to read. Three ADOMs of ten are easy.</td></tr>
<tr><td>Smaller blast radius</td><td>A wrong object edit affects only the devices of one ADOM.</td></tr></table>

<h3>Are ADOMs switched on?</h3>
<p>On a new FortiManager ADOMs are off and only the ADOM <code>root</code> is in use. You can see it in two places.</p>
<pre class="out">FMG-1 # get system status
...
Max Number of Admin Domains     : 5
Admin Domain Configuration      : <span class="hl">Disabled</span>

FMG-1 # diagnose dvm adom list
--- There are currently 1 ADOMs ---
OID	STATE	NAME		VERSION	MODE	DEVICES
3	enabled	root		7.6	GMS	0
<span class="hl">(ADOMs are disabled: only the root ADOM is in use)</span></pre>
<p>The first line is the switch, the second line is the proof. The MODE column reads GMS for every ADOM in this simulator, so you can ignore it. The limit of 5 is what this simulator reports; the real limit depends on the model and licence.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri Retail has three FortiGates: HQ-FGT in Chennai, MDU-FGT in Madurai and TRY-FGT in Trichy. The security team owns the head office and the retail team owns the branches. Two ADOMs, Corporate with 1 device and Retail with 2 devices, give each team its own space. After the lab of chapter 6 the list shows Corporate with 1 device and Retail with 2.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Believing an ADOM separates user traffic; it only separates management data in FortiManager. Confusing an ADOM with a VDOM: a VDOM is a virtual firewall inside one FortiGate, an ADOM is a management container in FortiManager. Creating ADOMs before turning the switch on.</p></div>

<div class="exam"><p><b>Exam traps.</b> The ADOM <code>root</code> exists even when ADOMs are disabled. ADOMs are a FortiManager feature only; the FortiGate does not store its ADOM name. In the real product a FortiGate with VDOMs can have its VDOMs placed in different ADOMs; that is not modelled here.</p></div>

<div class="scn"><h4>The contractor who needed only the shops</h4><p>Kaveri hired a contractor to refresh the shop firewall rules. The company did not want the contractor to see the head-office policies. Because Retail was its own ADOM, the security lead gave the contractor an account limited to that ADOM (an administrator setting in the real product). The contractor worked for two weeks and never saw Corporate.</p><p><b>Lesson:</b> ADOMs turn a trust question into a simple boundary.</p></div>

<div class="iv"><p class="q">"Explain ADOMs to a manager who has never seen FortiManager."</p><p>Say that an ADOM is a separate workspace inside one FortiManager, with its own devices, policies and objects. Give two reasons: different teams can own different parts, and devices on different firmware can be kept apart. Add that it does not touch user traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An ADOM is a named container for devices, packages, objects and templates inside FortiManager.</li>
<li>Reasons: separation of administrators, firmware versions, clarity and a smaller blast radius.</li>
<li>ADOMs are off by default; <code>diagnose dvm adom list</code> then says only root is in use.</li>
<li>root always exists; each device sits in exactly one ADOM.</li>
<li>An ADOM is not a VDOM and does not separate traffic.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Is chapter mein aap seekhoge.</b> Administrative domain (ADOM) kya hai, companies apne FortiGates ko ADOMs mein kyun baantti hain (chaar wajah), kaise dekhein ki ADOMs on hain ya nahi, aur kaun sa ADOM hamesha exist karta hai. <b>Prerequisites:</b> module fmg-start. Aap FortiGate onboard kar sakte ho, jaante ho ki FGFM TCP 541 par chalta hai, aur unauthorized list, authorize aur revision 1 samajhte ho.</p></div>

<p>Ek office building socho jisme ek hi reception desk hai. Building FortiManager hai. Har floor alag tenant ne kiraye par liya hai, aur har tenant ke key cards sirf apne floor ko kholte hain. Reception aur building shared hain, par finance team HR floor mein nahi ja sakti. ADOM ek floor hai.</p>

<h3>Definition, step by step</h3>
<p><b>ADOM</b> (administrative domain) FortiManager ke andar ek named container hai. Isme FortiGates ka ek group hota hai aur FortiManager mein unse jud sab kuch: policy packages, address objects, normalized interfaces aur templates. ADOM sirf FortiManager ke andar exist karta hai. FortiGate ko khud pata nahi hota ki wo kis ADOM ka hai; uski apni configuration dono tarah ek jaisi dikhti hai.</p>
<p>FMG-1 ke andar layout simple hai. Device database devices ko list karta hai, aur har device row mein ek <code>adom</code> value hoti hai. Policy database har ADOM ke hisaab se baanta hota hai, isliye ADOM Retail ka package aise device par install nahi ho sakta jo ADOM Corporate mein hai. Ye wahi device database aur policy database hain jo fmg-start mein mile the, bas ek label aur jud gaya.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="FMG-1 aur teen ADOMs">
<rect x="10" y="10" width="620" height="210" rx="10" fill="#e2e8f0"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="14">FMG-1 (192.0.2.5)</text>
<rect x="30" y="52" width="170" height="150" rx="8" fill="#ddd6fe"/><text x="115" y="76" text-anchor="middle" class="svg-ink" font-size="13">ADOM root</text><text x="115" y="130" text-anchor="middle" class="svg-muted" font-size="12">hamesha hota hai</text><text x="115" y="150" text-anchor="middle" class="svg-muted" font-size="12">abhi koi device nahi</text>
<rect x="235" y="52" width="170" height="150" rx="8" fill="#bae6fd"/><text x="320" y="76" text-anchor="middle" class="svg-ink" font-size="13">ADOM Corporate</text><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="12">HQ-FGT</text><text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">packages, objects</text>
<rect x="440" y="52" width="170" height="150" rx="8" fill="#bbf7d0"/><text x="525" y="76" text-anchor="middle" class="svg-ink" font-size="13">ADOM Retail</text><text x="525" y="112" text-anchor="middle" class="svg-ink" font-size="12">MDU-FGT</text><text x="525" y="132" text-anchor="middle" class="svg-ink" font-size="12">TRY-FGT</text><text x="525" y="162" text-anchor="middle" class="svg-muted" font-size="12">packages, objects</text>
</svg><p class="cap">Ek FortiManager, teen ADOMs. Har device sirf ek ADOM mein hota hai.</p></div>

<h3>Companies ADOMs kyun use karti hain</h3>
<table class="cmp"><tr><th>Wajah</th><th>Kya solve hota hai</th></tr>
<tr><td>Administrative separation</td><td>Head-office security team Corporate edit karti hai; retail network team Retail. Dono ek doosre ki policy galti se nahi tod sakti.</td></tr>
<tr><td>Firmware versions</td><td>ADOM ka ek hi version hota hai, isliye purane release wala branch upgrade hone tak apne ADOM mein rah sakta hai (chapter 2).</td></tr>
<tr><td>Scale par clarity</td><td>Ek list mein tees devices padhna mushkil hai. Das-das ke teen ADOMs aasan hain.</td></tr>
<tr><td>Chhota blast radius</td><td>Galat object edit sirf ek ADOM ke devices ko affect karta hai.</td></tr></table>

<h3>Kya ADOMs on hain?</h3>
<p>Nayi FortiManager par ADOMs off hote hain aur sirf ADOM <code>root</code> use hota hai. Ye aap do jagah dekh sakte ho.</p>
<pre class="out">FMG-1 # get system status
...
Max Number of Admin Domains     : 5
Admin Domain Configuration      : <span class="hl">Disabled</span>

FMG-1 # diagnose dvm adom list
--- There are currently 1 ADOMs ---
OID	STATE	NAME		VERSION	MODE	DEVICES
3	enabled	root		7.6	GMS	0
<span class="hl">(ADOMs are disabled: only the root ADOM is in use)</span></pre>
<p>Pehli line switch hai, doosri line saboot. Is simulator mein MODE column har ADOM ke liye GMS padhta hai, use ignore kar sakte ho. 5 ki limit simulator ki report hai; real limit model aur licence par depend karti hai.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri Retail ke teen FortiGates hain: Chennai mein HQ-FGT, Madurai mein MDU-FGT aur Trichy mein TRY-FGT. Security team head office sambhalti hai aur retail team branches. Do ADOMs, Corporate (1 device) aur Retail (2 devices), har team ko apni jagah dete hain. Chapter 6 ke lab ke baad list Corporate mein 1 device aur Retail mein 2 devices dikhati hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Ye maanna ki ADOM user traffic alag karta hai; wo sirf FortiManager mein management data alag karta hai. ADOM aur VDOM ko mix karna: VDOM ek FortiGate ke andar virtual firewall hai, ADOM FortiManager mein management container. Switch on karne se pehle ADOMs banane ki koshish.</p></div>

<div class="exam"><p><b>Exam traps.</b> ADOM <code>root</code> ADOMs disabled hone par bhi exist karta hai. ADOMs sirf FortiManager ki feature hain; FortiGate apna ADOM name store nahi karta. Real product mein VDOMs wale FortiGate ke VDOMs alag ADOMs mein rakhe ja sakte hain; yahan wo model nahi hai.</p></div>

<div class="scn"><h4>Contractor jise sirf shops chahiye the</h4><p>Kaveri ne shop firewall rules refresh karne ke liye contractor hire kiya. Company nahi chahti thi ki contractor head-office policies dekhe. Retail apna ADOM tha, isliye security lead ne contractor ko us ADOM tak limited account diya (real product mein administrator setting). Contractor ne do hafte kaam kiya aur Corporate kabhi nahi dekha.</p><p><b>Lesson:</b> ADOMs trust ke sawaal ko simple boundary bana dete hain.</p></div>

<div class="iv"><p class="q">"Ek manager ko ADOMs samjhao jisne FortiManager kabhi nahi dekha."</p><p>Kaho ki ADOM ek FortiManager ke andar alag workspace hai, apne devices, policies aur objects ke saath. Do wajah do: alag teams alag parts own kar sakti hain, aur alag firmware wale devices alag rakhe ja sakte hain. Jodo ki ye user traffic ko nahi chhoota.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ADOM FortiManager ke andar devices, packages, objects aur templates ka named container hai.</li>
<li>Wajah: administrators ki separation, firmware versions, clarity aur chhota blast radius.</li>
<li>ADOMs default se off hain; <code>diagnose dvm adom list</code> tab kehta hai ki sirf root use ho raha hai.</li>
<li>root hamesha exist karta hai; har device ek hi ADOM mein hota hai.</li>
<li>ADOM VDOM nahi hai aur traffic alag nahi karta.</li>
</ul></div>
`}};export{e as default};