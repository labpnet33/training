var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with a FortiGate that had no policy and ended it with three sites sharing one package. This chapter pulls everything together: the picture, a checklist of things you must be able to do, a mini glossary and the most tested facts. Read it the day before an interview or a test. The skills here overlap with what vendor-level administrator exams ask about, but this is independent training and not a course for any exam.</p>

<h3>The whole module in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="From objects to installed policy">
<rect x="14" y="20" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="84" y="46" text-anchor="middle" class="svg-ink" font-size="13">Objects</text><text x="84" y="66" text-anchor="middle" class="svg-muted" font-size="12">SRV-WEB, LAN, WAN</text>
<rect x="174" y="20" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="244" y="46" text-anchor="middle" class="svg-ink" font-size="13">Mapping rows</text><text x="244" y="66" text-anchor="middle" class="svg-muted" font-size="12">LAN = port2 per device</text>
<rect x="334" y="20" width="140" height="70" rx="8" fill="#fde68a"/><text x="404" y="46" text-anchor="middle" class="svg-ink" font-size="13">Package</text><text x="404" y="66" text-anchor="middle" class="svg-muted" font-size="12">policies, install-target</text>
<rect x="494" y="20" width="132" height="70" rx="8" fill="#bae6fd"/><text x="560" y="46" text-anchor="middle" class="svg-ink" font-size="13">Preview</text><text x="560" y="66" text-anchor="middle" class="svg-muted" font-size="12">read the CLI</text>
<rect x="244" y="130" width="152" height="64" rx="8" fill="#bbf7d0"/><text x="320" y="156" text-anchor="middle" class="svg-ink" font-size="13">Install per device</text><text x="320" y="176" text-anchor="middle" class="svg-muted" font-size="12">table replaced</text>
<line x1="154" y1="55" x2="174" y2="55" stroke="#64748b" stroke-width="2"/><line x1="314" y1="55" x2="334" y2="55" stroke="#64748b" stroke-width="2"/><line x1="474" y1="55" x2="494" y2="55" stroke="#64748b" stroke-width="2"/><line x1="560" y1="90" x2="396" y2="150" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Objects and mappings feed the package; the preview checks it; the install writes it.</p></div>

<h3>Checklist: can you do these?</h3>
<ul>
<li>Create an address object in the ADOM (<code>config pm address</code>) and say why it is defined once.</li>
<li>Create normalized interfaces with a dynamic mapping row for each device (<code>config pm interface</code>).</li>
<li>Build a policy package with policies and an <code>install-target</code> list (<code>config pm pkg</code>).</li>
<li>Run the preview, read the CLI lines and spot delete lines and port names.</li>
<li>Install per device, then verify with the device list (<code>pkg:[installed]</code>, <code>dm: installed</code>) and a real ping.</li>
<li>Explain what an install replaces and why import-policy comes first on a device with rules.</li>
<li>Read the five typical install failure messages and name the fix for each.</li>
<li>Show the effect of a local change: out of sync, auto-update revision, removal at the next install.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Object</dt><dd>A named building block that policies refer to, such as an address.</dd>
<dt>Normalized interface</dt><dd>An ADOM-level interface name (LAN, WAN) used in policies.</dd>
<dt>Dynamic mapping</dt><dd>The per-device row that says which real interface a normalized name means.</dd>
<dt>Policy package</dt><dd>A named set of firewall policies in one ADOM with a list of installation targets.</dd>
<dt>Installation target</dt><dd>A device on which a package may be installed (attribute install-target).</dd>
<dt>Install preview</dt><dd>The CLI that an install would send, shown without sending it.</dd>
<dt>Import-policy</dt><dd>Reading a device's policies and addresses into a new package.</dd>
<dt>Auto update</dt><dd>FortiManager taking a local device change over as a new revision.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>What does install do to the policy table?</td><td>Replaces it with the package</td></tr>
<tr><td>Where are address objects stored?</td><td>In the ADOM database</td></tr>
<tr><td>Which objects reach a device?</td><td>Only those used by the installed policies</td></tr>
<tr><td>Message for a device missing in the package list</td><td>is not an installation target of package</td></tr>
<tr><td>Message for a missing row</td><td>normalized interface 'LAN' has no mapping for device</td></tr>
<tr><td>Message when pushes are blocked</td><td>does not accept configuration changes (allow-push-configuration is disabled)</td></tr>
<tr><td>Does a failed install change the device?</td><td>No, and no revision is created</td></tr>
<tr><td>Import before or after the first install?</td><td>Before</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A new site Salem is authorized. Checklist walk-through: add LAN and WAN mapping rows for Salem, add Salem to install-target of the shared package (keeping the existing names), preview and look for unexpected delete lines, install, check pkg:[installed] and conf: in sync, ping SRV-WEB from the Salem PC.</p></div>

<div class="warn"><p><b>Common mistakes to avoid.</b> Installing before importing; shortening the install-target list; mapping only some interfaces; trusting "success" without a traffic test; leaving local rules on a managed FortiGate; using real port names inside a shared package.</p></div>

<div class="exam"><p><b>Exam traps.</b> In the simulator, <code>execute fmgui</code> stands for GUI or API actions. Import in the simulator keeps plain interface names, while the real product can create normalized ones. Workspace mode, ADOM locking and revision revert are not modelled here: in the real product they exist and are covered as theory only.</p></div>

<div class="scn"><h4>The Friday change that was safe</h4><p>On a Friday a retailer had to add one rule to a shared package for 12 branches. The engineer added the rule, checked install targets and mappings, previewed one branch, installed to a pilot branch and pinged the server from its PC. Only then did the engineer install the other eleven, checking each device list. The change took 40 minutes and produced no incident.</p><p><b>Lesson:</b> preview, pilot, verify, then scale.</p></div>

<div class="iv"><p class="q">"Walk me through how you would deliver a firewall policy to many FortiGates with FortiManager."</p><p>Create the objects in the ADOM, define normalized interfaces with a mapping per device, build the package with its installation targets, preview an install and read the CLI for deletes and port names, install per device, and verify with the device list and real traffic. Mention that an install replaces the table, so existing rules are imported first.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Define objects and interfaces once in the ADOM; map interfaces per device.</li>
<li>A package holds policies and an install-target list; install runs per device.</li>
<li>Install replaces the policy table; import first, preview always.</li>
<li>Read the words after Install failed: they name the check that failed.</li>
<li>Verify with pkg:[installed], conf: in sync and a real ping.</li>
</ul></div>
`,hi:`
<p>Aapne ye module aise FortiGate se shuru kiya jiske paas koi policy nahi thi, aur khatam kiya teen sites ke ek package share karne par. Ye chapter sab kuch jodta hai: tasveer, ek checklist ki aap kya kar sakte ho, mini glossary aur sabse zyada tested facts. Interview ya test se ek din pehle padho. Yahan ke skills vendor-level administrator exams ke sawaalon se overlap karte hain, par ye independent training hai, kisi exam ka course nahi.</p>

<h3>Poora module ek tasveer mein</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Objects se installed policy tak">
<rect x="14" y="20" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="84" y="46" text-anchor="middle" class="svg-ink" font-size="13">Objects</text><text x="84" y="66" text-anchor="middle" class="svg-muted" font-size="12">SRV-WEB, LAN, WAN</text>
<rect x="174" y="20" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="244" y="46" text-anchor="middle" class="svg-ink" font-size="13">Mapping rows</text><text x="244" y="66" text-anchor="middle" class="svg-muted" font-size="12">LAN = port2 per device</text>
<rect x="334" y="20" width="140" height="70" rx="8" fill="#fde68a"/><text x="404" y="46" text-anchor="middle" class="svg-ink" font-size="13">Package</text><text x="404" y="66" text-anchor="middle" class="svg-muted" font-size="12">policies, install-target</text>
<rect x="494" y="20" width="132" height="70" rx="8" fill="#bae6fd"/><text x="560" y="46" text-anchor="middle" class="svg-ink" font-size="13">Preview</text><text x="560" y="66" text-anchor="middle" class="svg-muted" font-size="12">CLI padho</text>
<rect x="244" y="130" width="152" height="64" rx="8" fill="#bbf7d0"/><text x="320" y="156" text-anchor="middle" class="svg-ink" font-size="13">Install per device</text><text x="320" y="176" text-anchor="middle" class="svg-muted" font-size="12">table replace</text>
<line x1="154" y1="55" x2="174" y2="55" stroke="#64748b" stroke-width="2"/><line x1="314" y1="55" x2="334" y2="55" stroke="#64748b" stroke-width="2"/><line x1="474" y1="55" x2="494" y2="55" stroke="#64748b" stroke-width="2"/><line x1="560" y1="90" x2="396" y2="150" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Objects aur mappings package ko feed karte hain; preview use check karta hai; install use likhta hai.</p></div>

<h3>Checklist: kya aap ye kar sakte ho?</h3>
<ul>
<li>ADOM mein address object banao (<code>config pm address</code>) aur batao wo ek baar kyun define hota hai.</li>
<li>Har device ke liye dynamic mapping row ke saath normalized interfaces banao (<code>config pm interface</code>).</li>
<li>Policies aur <code>install-target</code> list ke saath policy package banao (<code>config pm pkg</code>).</li>
<li>Preview chalao, CLI lines padho aur delete lines aur port names pehchano.</li>
<li>Per device install karo, phir device list (<code>pkg:[installed]</code>, <code>dm: installed</code>) aur real ping se verify karo.</li>
<li>Samjhao install kya replace karta hai aur rules wale device par import-policy pehle kyun aata hai.</li>
<li>Paanch typical install failure messages padho aur har ek ka fix batao.</li>
<li>Local change ka asar dikhao: out of sync, auto-update revision, agle install par removal.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Object</dt><dd>Named building block jise policies refer karti hain, jaise address.</dd>
<dt>Normalized interface</dt><dd>Policies mein use hone wala ADOM-level interface naam (LAN, WAN).</dd>
<dt>Dynamic mapping</dt><dd>Per-device row jo batati hai normalized naam ka real interface kya hai.</dd>
<dt>Policy package</dt><dd>Ek ADOM mein firewall policies ka named set, installation targets ki list ke saath.</dd>
<dt>Installation target</dt><dd>Wo device jis par package install ho sakta hai (attribute install-target).</dd>
<dt>Install preview</dt><dd>Wo CLI jo install bhejta, bhejne ke bina dikhaya gaya.</dd>
<dt>Import-policy</dt><dd>Device ki policies aur addresses ko naye package mein padhna.</dd>
<dt>Auto update</dt><dd>FortiManager ka local device change ko naye revision ki tarah le lena.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Jawab</th></tr>
<tr><td>Install policy table ke saath kya karta hai?</td><td>Use package se replace karta hai</td></tr>
<tr><td>Address objects kahan stored hote hain?</td><td>ADOM database mein</td></tr>
<tr><td>Device tak kaun se objects pahunchte hain?</td><td>Sirf wahi jo installed policies use karti hain</td></tr>
<tr><td>Package list mein device na ho to message</td><td>is not an installation target of package</td></tr>
<tr><td>Missing row ka message</td><td>normalized interface 'LAN' has no mapping for device</td></tr>
<tr><td>Push blocked ho to message</td><td>does not accept configuration changes (allow-push-configuration is disabled)</td></tr>
<tr><td>Kya failed install device badalta hai?</td><td>Nahi, aur revision nahi banta</td></tr>
<tr><td>Import pehle install se pehle ya baad?</td><td>Pehle</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Naya site Salem authorize hua. Checklist walk-through: Salem ke liye LAN aur WAN mapping rows jodo, Salem ko shared package ke install-target mein jodo (maujooda naam rakhte hue), preview karke unexpected delete lines dekho, install karo, pkg:[installed] aur conf: in sync check karo, Salem PC se SRV-WEB ping karo.</p></div>

<div class="warn"><p><b>Bachne wali common mistakes.</b> Import kiye bina install; install-target list chhoti karna; kuch hi interfaces map karna; traffic test ke bina "success" par bharosa; managed FortiGate par local rules chhodna; shared package ke andar real port names use karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Simulator mein <code>execute fmgui</code> GUI ya API actions ki jagah hai. Simulator ka import plain interface names rakhta hai, jabki real product normalized names bana sakta hai. Workspace mode, ADOM locking aur revision revert yahan model nahi hain: real product mein hain aur sirf theory ki tarah cover hue.</p></div>

<div class="scn"><h4>Friday ka safe change</h4><p>Ek Friday retailer ko 12 branches ke shared package mein ek rule jodna tha. Engineer ne rule jodha, install targets aur mappings check kiye, ek branch ka preview liya, pilot branch par install kiya aur uske PC se server ping kiya. Tabhi baaki gyarah par install kiya, har device list check karte hue. Change mein 40 minute lage aur koi incident nahi hua.</p><p><b>Lesson:</b> preview, pilot, verify, phir scale.</p></div>

<div class="iv"><p class="q">"FortiManager se kai FortiGates tak firewall policy deliver karna step by step batao."</p><p>ADOM mein objects banao, har device ke liye mapping ke saath normalized interfaces define karo, installation targets ke saath package banao, install ka preview lekar delete lines aur port names ke liye CLI padho, per device install karo, aur device list aur real traffic se verify karo. Ye bhi bolo ki install table replace karta hai, isliye maujooda rules pehle import hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Objects aur interfaces ADOM mein ek baar define karo; interfaces per device map karo.</li>
<li>Package mein policies aur install-target list hoti hai; install per device chalta hai.</li>
<li>Install policy table replace karta hai; pehle import, hamesha preview.</li>
<li>Install failed ke baad ke shabd padho: wo fail hui check ka naam batate hain.</li>
<li>pkg:[installed], conf: in sync aur real ping se verify karo.</li>
</ul></div>
`}};export{e as default};