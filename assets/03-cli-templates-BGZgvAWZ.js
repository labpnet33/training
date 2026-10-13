var e={id:`cli-templates`,h:{en:`CLI templates: the script, the semicolon and the run order`,hi:`CLI templates: script, semicolon aur run order`},body:{en:`
<p>Some jobs do not have a form to fill in. Imagine a recipe card that says exactly which steps to follow, in order, in the kitchen of every shop. A <b>CLI template</b> is that recipe card for a FortiGate: a script of ordinary FortiGate CLI lines that FortiManager runs on the device for you. It is the flexible tool of provisioning. Anything you can type on a FortiGate can go into a script, which is both its strength and its danger.</p>

<h3>How the simulator stores a script</h3>
<p>In the real product a CLI template is a multi-line text with an editor. In the simulator it is one attribute called <code>script</code> on a template of kind <code>cli</code>, and a <b>semicolon</b> separates the lines. Each part between semicolons becomes one CLI line on the device. So the four lines "config firewall address", "edit NK-MGMT", "set subnet 192.0.2.0 255.255.255.0", "next" and "end" are written on one line joined by semicolons. The script is limited to 2048 characters.</p>

<h3>Step by step</h3>
<ol>
<li><b>Write the lines</b> you would type on the FortiGate, from the <code>config</code> line to the closing <code>end</code>. Every <code>config</code> needs its <code>end</code>, and every <code>edit</code> its <code>next</code>.</li>
<li><b>Join them with semicolons</b> into the script attribute of a template with <code>set kind cli</code>.</li>
<li><b>Assign</b> it with <code>set cli-template</code> in the device entry. dev-db becomes modified.</li>
<li><b>Preview</b> the install and read the lines as the device will see them.</li>
<li><b>Install</b> the device settings and verify with a show command on the FortiGate.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Script split at semicolons into CLI lines">
<rect x="20" y="20" width="600" height="44" rx="8" fill="#fde68a"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="12">config firewall address ; edit NK-MGMT ; set subnet 192.0.2.0 255.255.255.0 ; next ; end</text>
<line x1="320" y1="64" x2="320" y2="86" stroke="#64748b" stroke-width="2"/><text x="332" y="80" class="svg-accent" font-size="12">split at ;</text>
<rect x="20" y="90" width="110" height="38" rx="6" fill="#e2e8f0"/><text x="75" y="113" text-anchor="middle" class="svg-ink" font-size="11">config firewall address</text>
<rect x="140" y="90" width="90" height="38" rx="6" fill="#e2e8f0"/><text x="185" y="113" text-anchor="middle" class="svg-ink" font-size="11">edit NK-MGMT</text>
<rect x="240" y="90" width="250" height="38" rx="6" fill="#e2e8f0"/><text x="365" y="113" text-anchor="middle" class="svg-ink" font-size="11">set subnet 192.0.2.0 255.255.255.0</text>
<rect x="500" y="90" width="50" height="38" rx="6" fill="#e2e8f0"/><text x="525" y="113" text-anchor="middle" class="svg-ink" font-size="11">next</text>
<rect x="560" y="90" width="60" height="38" rx="6" fill="#e2e8f0"/><text x="590" y="113" text-anchor="middle" class="svg-ink" font-size="11">end</text>
</svg><p class="cap">One attribute, five CLI lines, run top to bottom.</p></div>

<div class="eg"><p><b>Worked example.</b> Kaveri wants two address objects on both branches: NK-DC (10.99.0.0/16) and NK-MGMT (192.0.2.0/24). One script creates both. Assigned to MDU-FGT and TRY-FGT, one template serves two devices. Note that an address object is not a policy: it is a device object, so a CLI template is a fair way to deliver it, though a policy package can also carry objects it uses.</p></div>

<h3>Run order</h3>
<p>A device can have a system template, an IPsec template and a CLI template at once. FortiManager installs them in a fixed order: <b>system template, IPsec template, CLI template</b>, and then the policy package if one is part of the install. The CLI template runs last among the templates, so it can rely on what the earlier ones created. The simulator preview prints the lines in exactly this order. A script that references an object from a package would fail if installed on its own, because the package comes after.</p>

<h3>Configuration</h3>
<pre class="code"><span class="c">! on FMG-1: one CLI template for two address objects</span>
config pm template
    edit "KR-OBJECTS"
        set adom "Kaveri"
        set kind cli
        set script "config firewall address;edit NK-DC;set subnet 10.99.0.0 255.255.0.0;next;edit NK-MGMT;set subnet 192.0.2.0 255.255.255.0;next;end"
    next
end
config dvmdb device
    edit "TRY-FGT"
        set cli-template "KR-OBJECTS"
    next
end</pre>

<h3>What the output looks like</h3>
<pre class="out">FMG-1 # execute fmgui install-preview Kaveri TRY-FGT
Install preview for TRY-FGT (8 CLI lines, nothing is sent to the device):
  config firewall address
  edit NK-DC
  set subnet 10.99.0.0 255.255.0.0
  next
  edit NK-MGMT
  set subnet 192.0.2.0 255.255.255.0
  next
  end</pre>
<p>If a line is wrong, the FortiGate rejects it and FortiManager rolls the install back. The device and the revision list stay unchanged, and the error names the bad line:</p>
<pre class="out">FMG-1 # execute fmgui install-device Kaveri TRY-FGT
Install failed on TRY-FGT: <span class="hl">value parse error before '10.1.1.0'  [set subnet 10.1.1.0 notamask]</span>
The device rejected the configuration; the install was rolled back by FortiManager and the revision history is unchanged.</pre>
<p>After this failure dev-db still says modified, because the template is still waiting.</p>

<h3>Risks and theory</h3>
<p>A script has no safety net except the device's own parser. It can delete things, and it runs on every assigned device with the same text. Always preview, test on one branch first, and keep scripts small and named for their purpose. In the real product, <b>metadata variables</b> let one template contain placeholders such as a per-device address, and templates can use the <b>Jinja</b> scripting language for conditions and loops. Neither is modelled in the simulator: here a script is plain text, identical for every device.</p>

<div class="warn"><p><b>Common mistakes.</b> Writing a newline or a comma instead of the semicolon; forgetting the final <code>end</code> or a <code>next</code>; assuming the script runs before the IPsec template; putting a pre-shared key or password in a script, where every administrator who can read the template can read it; running a script that only makes sense on one site on all devices.</p></div>

<div class="exam"><p><b>Exam traps.</b> The order is system template, IPsec template, CLI template, then package. A CLI template is assigned with the cli-template attribute, not template. The semicolon is the simulator's line separator; the real product uses a multi-line script editor. Metadata variables and Jinja are theory here.</p></div>

<div class="scn"><h4>The script that worked on one branch and failed on the other</h4><p>An engineer wrote a CLI template to create an address object and assigned it to two branches. It installed on the first and failed on the second with a value parse error. The second branch had been given a different subnet notation by a colleague in the script copy he had pasted. Preview showed the bad line before anyone pressed install on the second branch, and since the failed install is rolled back, nothing half-written was left on the FortiGate. He fixed the one line in the template and both branches installed.</p><p><b>Lesson:</b> the preview and the rollback are your safety net, so use them for every script.</p></div>

<div class="iv"><p class="q">"When would you use a CLI template instead of a normal template?"</p><p>When the setting has no dedicated template in FortiManager, or when a small, well-understood CLI change must reach many devices. Say that you preview the lines, test on one device, keep scripts short, avoid secrets in them, and know that the order is system, IPsec, CLI, then package. Mention metadata variables as the real-product way to personalise one script per device.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A CLI template is one script attribute; a semicolon separates the CLI lines in the simulator.</li>
<li>Assign it with cli-template; it runs after the system and IPsec templates and before the package.</li>
<li>A rejected line rolls the install back and the revision history stays unchanged.</li>
<li>Preview first; a script is plain text and identical on every assigned device.</li>
<li>Metadata variables and Jinja exist in the real product only.</li>
</ul></div>
`,hi:`
<p>Kuch kaam aise hote hain jinke liye bharne wala form nahi hota. Socho ek recipe card hai jo har shop ki kitchen mein bataata hai kaunse steps, kis order mein follow karne hain. <b>CLI template</b> FortiGate ke liye wahi recipe card hai: normal FortiGate CLI lines ki script jo FortiManager aapke liye device par chalata hai. Ye provisioning ka flexible tool hai. Jo kuch aap FortiGate par type kar sakte ho wo script mein ja sakta hai, jo iski taakat bhi hai aur khatra bhi.</p>

<h3>Simulator script kaise store karta hai</h3>
<p>Real product mein CLI template editor wala multi-line text hota hai. Simulator mein ye <code>kind cli</code> wale template par <code>script</code> naam ka ek attribute hai, aur ek <b>semicolon</b> lines ko alag karta hai. Semicolons ke beech ka har hissa device par ek CLI line ban jata hai. To chaar lines "config firewall address", "edit NK-MGMT", "set subnet 192.0.2.0 255.255.255.0", "next" aur "end" ek hi line mein semicolons se jud kar likhi jaati hain. Script ki limit 2048 characters hai.</p>

<h3>Step by step</h3>
<ol>
<li>Wo lines <b>likho</b> jo aap FortiGate par type karte, <code>config</code> line se closing <code>end</code> tak. Har <code>config</code> ko <code>end</code> chahiye aur har <code>edit</code> ko <code>next</code>.</li>
<li>Unhe semicolons se <b>jodo</b> aur <code>set kind cli</code> wale template ke script attribute mein daalo.</li>
<li>Device entry mein <code>set cli-template</code> se <b>assign</b> karo. dev-db modified ho jata hai.</li>
<li>Install ka <b>preview</b> lo aur lines waise padho jaise device dekhega.</li>
<li>Device settings <b>install</b> karo aur FortiGate par show command se verify karo.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Script semicolon par CLI lines mein tooti">
<rect x="20" y="20" width="600" height="44" rx="8" fill="#fde68a"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="12">config firewall address ; edit NK-MGMT ; set subnet 192.0.2.0 255.255.255.0 ; next ; end</text>
<line x1="320" y1="64" x2="320" y2="86" stroke="#64748b" stroke-width="2"/><text x="332" y="80" class="svg-accent" font-size="12">; par split</text>
<rect x="20" y="90" width="110" height="38" rx="6" fill="#e2e8f0"/><text x="75" y="113" text-anchor="middle" class="svg-ink" font-size="11">config firewall address</text>
<rect x="140" y="90" width="90" height="38" rx="6" fill="#e2e8f0"/><text x="185" y="113" text-anchor="middle" class="svg-ink" font-size="11">edit NK-MGMT</text>
<rect x="240" y="90" width="250" height="38" rx="6" fill="#e2e8f0"/><text x="365" y="113" text-anchor="middle" class="svg-ink" font-size="11">set subnet 192.0.2.0 255.255.255.0</text>
<rect x="500" y="90" width="50" height="38" rx="6" fill="#e2e8f0"/><text x="525" y="113" text-anchor="middle" class="svg-ink" font-size="11">next</text>
<rect x="560" y="90" width="60" height="38" rx="6" fill="#e2e8f0"/><text x="590" y="113" text-anchor="middle" class="svg-ink" font-size="11">end</text>
</svg><p class="cap">Ek attribute, paanch CLI lines, upar se neeche chalti hain.</p></div>

<div class="eg"><p><b>Worked example.</b> Kaveri ko dono branches par do address objects chahiye: NK-DC (10.99.0.0/16) aur NK-MGMT (192.0.2.0/24). Ek script dono banati hai. MDU-FGT aur TRY-FGT ko assign karo to ek template do devices ko serve karta hai. Dhyan do ki address object policy nahi hai: wo device object hai, isliye CLI template use karna theek tareeka hai, haalaanki policy package bhi apne use kiye objects carry kar sakta hai.</p></div>

<h3>Run order</h3>
<p>Ek device par system template, IPsec template aur CLI template ek saath ho sakte hain. FortiManager unhe fixed order mein install karta hai: <b>system template, IPsec template, CLI template</b>, aur phir policy package agar install ka hissa ho. CLI template templates mein sabse baad chalta hai, isliye wo pehle wale templates ke banaye hue par depend kar sakta hai. Simulator ka preview lines bilkul isi order mein print karta hai. Jo script package ke object ko refer kare wo akeli install ho to fail hogi, kyunki package baad mein aata hai.</p>

<h3>Configuration</h3>
<pre class="code"><span class="c">! on FMG-1: one CLI template for two address objects</span>
config pm template
    edit "KR-OBJECTS"
        set adom "Kaveri"
        set kind cli
        set script "config firewall address;edit NK-DC;set subnet 10.99.0.0 255.255.0.0;next;edit NK-MGMT;set subnet 192.0.2.0 255.255.255.0;next;end"
    next
end
config dvmdb device
    edit "TRY-FGT"
        set cli-template "KR-OBJECTS"
    next
end</pre>

<h3>Output kaisa dikhta hai</h3>
<pre class="out">FMG-1 # execute fmgui install-preview Kaveri TRY-FGT
Install preview for TRY-FGT (8 CLI lines, nothing is sent to the device):
  config firewall address
  edit NK-DC
  set subnet 10.99.0.0 255.255.0.0
  next
  edit NK-MGMT
  set subnet 192.0.2.0 255.255.255.0
  next
  end</pre>
<p>Agar koi line galat hai to FortiGate use reject karta hai aur FortiManager install rollback kar deta hai. Device aur revision list unchanged rehte hain, aur error bad line ka naam batata hai:</p>
<pre class="out">FMG-1 # execute fmgui install-device Kaveri TRY-FGT
Install failed on TRY-FGT: <span class="hl">value parse error before '10.1.1.0'  [set subnet 10.1.1.0 notamask]</span>
The device rejected the configuration; the install was rolled back by FortiManager and the revision history is unchanged.</pre>
<p>Is failure ke baad bhi dev-db modified rehta hai, kyunki template abhi wait kar raha hai.</p>

<h3>Risks aur theory</h3>
<p>Script ke paas device ke apne parser ke alawa koi safety net nahi hota. Wo cheezein delete kar sakti hai, aur har assigned device par same text ke saath chalti hai. Hamesha preview lo, pehle ek branch par test karo, aur scripts chhoti rakho aur unke kaam ke naam par naam do. Real product mein <b>metadata variables</b> ek template mein per-device address jaise placeholders rakhne dete hain, aur templates conditions aur loops ke liye <b>Jinja</b> scripting language use kar sakte hain. Dono simulator mein model nahi hain: yahan script plain text hai, har device ke liye same.</p>

<div class="warn"><p><b>Common mistakes.</b> Semicolon ki jagah newline ya comma likhna; aakhri <code>end</code> ya koi <code>next</code> bhool jana; ye maan lena ki script IPsec template se pehle chalti hai; script mein pre-shared key ya password daalna, jahan template padh sakne wala har administrator use padh sakta hai; aisi script sab devices par chalana jo sirf ek site ke liye sahi hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Order hai system template, IPsec template, CLI template, phir package. CLI template cli-template attribute se assign hota hai, template se nahi. Semicolon simulator ka line separator hai; real product multi-line script editor use karta hai. Metadata variables aur Jinja yahan theory hain.</p></div>

<div class="scn"><h4>Script jo ek branch par chali aur doosri par fail hui</h4><p>Ek engineer ne address object banane ke liye CLI template likha aur do branches ko assign kiya. Pehli par install hua aur doosri par value parse error se fail. Doosri branch ke liye colleague ne paste ki hui script copy mein alag subnet notation de diya tha. Preview ne bad line install dabane se pehle hi dikha di, aur failed install rollback hota hai, isliye FortiGate par aadha likha kuch nahi bacha. Usne template ki ek line fix ki aur dono branches install ho gayi.</p><p><b>Lesson:</b> preview aur rollback aapka safety net hain, isliye har script ke liye unhe use karo.</p></div>

<div class="iv"><p class="q">"Normal template ki jagah CLI template kab use karoge?"</p><p>Jab setting ke liye FortiManager mein dedicated template nahi hai, ya jab chhota, achhe se samjha hua CLI change kai devices tak pahunchana hai. Bolo ki aap lines preview karte ho, ek device par test karte ho, scripts chhoti rakhte ho, unmein secrets nahi daalte, aur order system, IPsec, CLI, phir package jaante ho. Metadata variables ko ek script ko per-device personalise karne ka real-product tareeka batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CLI template ek script attribute hai; simulator mein semicolon CLI lines ko alag karta hai.</li>
<li>cli-template se assign hota hai; system aur IPsec templates ke baad aur package se pehle chalta hai.</li>
<li>Reject hui line install ko rollback karti hai aur revision history unchanged rehti hai.</li>
<li>Pehle preview lo; script plain text hai aur har assigned device par same hai.</li>
<li>Metadata variables aur Jinja sirf real product mein hain.</li>
</ul></div>
`}};export{e as default};