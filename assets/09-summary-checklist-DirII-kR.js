var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a pilot flies, there is a checklist: not because the pilot forgot how to fly, but because a short list catches the one thing that tiredness hides. This chapter is that list for the onboarding module. Read it once now and again before you work on a real FortiManager.</p>

<h3>What you should be able to do</h3>
<ul>
<li>Explain in two sentences why a company uses FortiManager, and say that it is not in the traffic path.</li>
<li>Name the three databases (device, ADOM, policy) and say which question each one answers.</li>
<li>Turn on ADOMs and create an ADOM with the correct version, then confirm it with <code>diagnose dvm adom list</code>.</li>
<li>Configure <code>config system central-management</code> with type fortimanager and the FortiManager address.</li>
<li>Find a connected device in the unauthorized list, authorize it into an ADOM and explain what revision 1 is.</li>
<li>Import the existing policy of a device into a policy package and read <code>pkg:[imported]</code>.</li>
<li>Add a device from the FortiManager side and explain why the interface needs <code>fgfm</code> in allowaccess.</li>
<li>Use the fgfmsd debug on a FortiGate and read which address is called.</li>
<li>Tell the difference between "refused", "timed out" and silence, and say what each points to.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Decision path for a missing device">
<rect x="220" y="8" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Device not managed</text>
<rect x="10" y="80" width="190" height="44" rx="8" fill="#bbf7d0"/><text x="105" y="100" text-anchor="middle" class="svg-ink" font-size="12">In unauthorized list?</text><text x="105" y="116" text-anchor="middle" class="svg-accent" font-size="12">authorize (ADOM version)</text>
<rect x="225" y="80" width="190" height="44" rx="8" fill="#fed7aa"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="12">Debug shows a call?</text><text x="320" y="116" text-anchor="middle" class="svg-accent" font-size="12">check address, path, serial</text>
<rect x="440" y="80" width="190" height="44" rx="8" fill="#fde68a"/><text x="535" y="100" text-anchor="middle" class="svg-ink" font-size="12">Debug is silent?</text><text x="535" y="116" text-anchor="middle" class="svg-accent" font-size="12">set type fortimanager</text>
<rect x="150" y="145" width="340" height="38" rx="8" fill="#bae6fd"/><text x="320" y="169" text-anchor="middle" class="svg-ink" font-size="12">FortiManager added the device and was refused? allowaccess fgfm</text>
<line x1="320" y1="48" x2="105" y2="80" stroke="#64748b" stroke-width="2"/><line x1="320" y1="48" x2="320" y2="80" stroke="#64748b" stroke-width="2"/><line x1="320" y1="48" x2="535" y2="80" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Three symptoms, three first moves. The last box is the FortiManager-initiated case.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>FortiManager (FMG-1)</dt><dd>The central manager that stores intended configuration for many FortiGates.</dd>
<dt>ADOM</dt><dd>Administrative domain, a named container with a version that holds devices and policies.</dd>
<dt>FGFM</dt><dd>The management tunnel between FortiGate and FortiManager, TCP 541.</dd>
<dt>central-management</dt><dd>The FortiGate section with type and the FortiManager address.</dd>
<dt>Unauthorized device</dt><dd>Connected through FGFM but not yet accepted into the device database.</dd>
<dt>Authorize</dt><dd>Accept the device into an ADOM and retrieve its configuration as revision 1.</dd>
<dt>Retrieve</dt><dd>Copy the FortiGate configuration into FortiManager.</dd>
<dt>Import policy</dt><dd>Copy the device policy and objects into a policy package.</dd>
<dt>allowaccess</dt><dd>The list of management services an interface accepts; fgfm is needed for add-device.</dd>
<dt>dm, conf, conn</dt><dd>Fields of the status line: how the device was last updated, whether it is in sync, whether it is reachable.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>FGFM port</td><td>TCP 541</td></tr>
<tr><td>Default central-management type</td><td>fortiguard</td></tr>
<tr><td>ADOM version rule</td><td>Equals the device firmware</td></tr>
<tr><td>Interface keyword for add-device</td><td>fgfm in allowaccess</td></tr>
<tr><td>What authorize creates</td><td>Revision 1, by retrieve</td></tr>
<tr><td>pkg field after import</td><td>[imported]</td></tr>
<tr><td>Is FortiManager in the data path</td><td>No</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Self-test: HQ-FGT has type fortimanager, fmg 192.0.2.5, and is not in the unauthorized list. FMG-1 is reachable. What next? Run the fgfmsd debug on HQ-FGT; the address or the path is the likely fault. Compare: if the debug is silent the type is wrong; if the list shows the device, authorize it.</p></div>

<div class="warn"><p><b>Common mistakes to avoid.</b> Authorizing before the ADOM exists; creating the ADOM at the wrong version; changing FortiManager when the fault is on the FortiGate; installing before importing; trusting a lab habit in production without reading the product documentation for your version. Remember that this simulator models only part of the real product; workspace mode, ADOM locking, FortiManager high availability and more are real features that these labs do not cover.</p></div>

<div class="exam"><p><b>Exam traps.</b> Connected is not managed. A refusal is a permission on the FortiGate; a timeout is address or path. Import does not touch the device. The track overlaps with skills that vendor administrator exams test (device management, ADOMs, policy packages, install, troubleshooting), but this is independent training and not a preparation course for any exam.</p></div>

<div class="scn"><h4>The checklist that saved a Friday evening</h4><p>On a Friday evening a new Kaveri branch FortiGate had to join FMG-1 before a Saturday cutover. The engineer worked through the list: ADOM at 7.6, type and address on the device, unauthorized list, authorize, import. A single check failed: the first authorize named an ADOM at 7.4. She fixed the ADOM version and finished in minutes instead of searching the network for an hour.</p><p><b>Lesson:</b> a boring checklist is faster than a clever guess.</p></div>

<div class="iv"><p class="q">"Describe the whole onboarding of a new branch FortiGate in one minute."</p><p>Prepare the ADOM with the same version as the firmware. Either set central-management on the FortiGate and authorize it from the unauthorized list, or add it from FortiManager with fgfm allowed. Check conn up and conf in sync, confirm revision 1, then import the policy before any install. If something fails I read the message and work the chain: type, address, path, serial, authorize, version.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FortiManager manages configuration; it is not in the traffic path.</li>
<li>Two ways to onboard: the FortiGate calls in, or FortiManager adds the device.</li>
<li>ADOM version equals device firmware; authorize creates revision 1.</li>
<li>Import the existing policy before the first install.</li>
<li>Refused, timed out and silent each point to a different fix.</li>
</ul></div>
`,hi:`
<p>Pilot ke udne se pehle checklist hoti hai: isliye nahi ki pilot udna bhool gaya, balki isliye ki chhoti list wo ek cheez pakad leti hai jo thakaan chhupa deti hai. Ye chapter onboarding module ki wahi list hai. Ise abhi ek baar padho aur real FortiManager par kaam karne se pehle phir padho.</p>

<h3>Aap kya kar paane chahiye</h3>
<ul>
<li>Do sentences mein samjhao company FortiManager kyun use karti hai, aur batao ki wo traffic path mein nahi hai.</li>
<li>Teen databases (device, ADOM, policy) ke naam batao aur kaho har ek kaun sa sawaal answer karta hai.</li>
<li>ADOMs on karo aur sahi version ke saath ADOM banao, phir <code>diagnose dvm adom list</code> se confirm karo.</li>
<li>Type fortimanager aur FortiManager address ke saath <code>config system central-management</code> configure karo.</li>
<li>Connected device ko unauthorized list mein dhoondho, ADOM mein authorize karo aur batao revision 1 kya hai.</li>
<li>Device ki existing policy ko policy package mein import karo aur <code>pkg:[imported]</code> padho.</li>
<li>FortiManager side se device add karo aur batao interface ko allowaccess mein <code>fgfm</code> kyun chahiye.</li>
<li>FortiGate par fgfmsd debug use karo aur padho kaun sa address call hota hai.</li>
<li>"Refused", "timed out" aur khamoshi mein fark batao, aur kaho har ek kis taraf ishara karta hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Missing device ke liye decision path">
<rect x="220" y="8" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Device managed nahi</text>
<rect x="10" y="80" width="190" height="44" rx="8" fill="#bbf7d0"/><text x="105" y="100" text-anchor="middle" class="svg-ink" font-size="12">Unauthorized list mein?</text><text x="105" y="116" text-anchor="middle" class="svg-accent" font-size="12">authorize (ADOM version)</text>
<rect x="225" y="80" width="190" height="44" rx="8" fill="#fed7aa"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="12">Debug mein call dikhti hai?</text><text x="320" y="116" text-anchor="middle" class="svg-accent" font-size="12">address, path, serial dekho</text>
<rect x="440" y="80" width="190" height="44" rx="8" fill="#fde68a"/><text x="535" y="100" text-anchor="middle" class="svg-ink" font-size="12">Debug khamosh hai?</text><text x="535" y="116" text-anchor="middle" class="svg-accent" font-size="12">type fortimanager set karo</text>
<rect x="150" y="145" width="340" height="38" rx="8" fill="#bae6fd"/><text x="320" y="169" text-anchor="middle" class="svg-ink" font-size="12">FortiManager ne add kiya aur refuse hua? allowaccess fgfm</text>
<line x1="320" y1="48" x2="105" y2="80" stroke="#64748b" stroke-width="2"/><line x1="320" y1="48" x2="320" y2="80" stroke="#64748b" stroke-width="2"/><line x1="320" y1="48" x2="535" y2="80" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Teen symptoms, teen pehle moves. Aakhri box FortiManager-initiated case hai.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>FortiManager (FMG-1)</dt><dd>Central manager jo kai FortiGates ki intended configuration store karta hai.</dd>
<dt>ADOM</dt><dd>Administrative domain, version wala named container jisme devices aur policies hoti hain.</dd>
<dt>FGFM</dt><dd>FortiGate aur FortiManager ke beech management tunnel, TCP 541.</dd>
<dt>central-management</dt><dd>FortiGate ka section jisme type aur FortiManager address hota hai.</dd>
<dt>Unauthorized device</dt><dd>FGFM se connected par abhi device database mein accept nahi hua.</dd>
<dt>Authorize</dt><dd>Device ko ADOM mein accept karna aur configuration ko revision 1 ki tarah retrieve karna.</dd>
<dt>Retrieve</dt><dd>FortiGate configuration ko FortiManager mein copy karna.</dd>
<dt>Import policy</dt><dd>Device policy aur objects ko policy package mein copy karna.</dd>
<dt>allowaccess</dt><dd>Interface jin management services ko accept karta hai unki list; add-device ke liye fgfm chahiye.</dd>
<dt>dm, conf, conn</dt><dd>Status line ke fields: device last baar kaise update hua, in sync hai ya nahi, reachable hai ya nahi.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>FGFM port</td><td>TCP 541</td></tr>
<tr><td>Default central-management type</td><td>fortiguard</td></tr>
<tr><td>ADOM version rule</td><td>Device firmware ke barabar</td></tr>
<tr><td>add-device ke liye interface keyword</td><td>allowaccess mein fgfm</td></tr>
<tr><td>Authorize kya banata hai</td><td>Revision 1, retrieve se</td></tr>
<tr><td>Import ke baad pkg field</td><td>[imported]</td></tr>
<tr><td>Kya FortiManager data path mein hai</td><td>Nahi</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Self-test: HQ-FGT par type fortimanager, fmg 192.0.2.5 hai, aur wo unauthorized list mein nahi hai. FMG-1 reachable hai. Aage kya? HQ-FGT par fgfmsd debug chalao; address ya path likely fault hai. Tulna: debug khamosh ho to type galat hai; list device dikhaye to use authorize karo.</p></div>

<div class="warn"><p><b>Bachne wali common mistakes.</b> ADOM ke exist karne se pehle authorize karna; ADOM galat version par banana; fault FortiGate par ho aur FortiManager badalna; import se pehle install karna; lab ki aadat ko apne version ki product documentation padhe bina production mein bharosa karna. Yaad rakho ki ye simulator real product ka sirf ek hissa model karta hai; workspace mode, ADOM locking, FortiManager high availability aur aur bhi real features hain jo ye labs cover nahi karte.</p></div>

<div class="exam"><p><b>Exam traps.</b> Connected managed nahi hai. Refusal FortiGate par permission hai; timeout address ya path hai. Import device ko nahi chhoota. Ye track un skills se overlap karta hai jo vendor administrator exams test karte hain (device management, ADOMs, policy packages, install, troubleshooting), par ye independent training hai aur kisi exam ki preparation course nahi.</p></div>

<div class="scn"><h4>Checklist jisne Friday ki shaam bachayi</h4><p>Friday shaam ko Kaveri ke ek naye branch FortiGate ko Saturday cutover se pehle FMG-1 se judna tha. Engineer ne list chalayi: ADOM 7.6 par, device par type aur address, unauthorized list, authorize, import. Ek check fail hua: pehle authorize ne 7.4 wale ADOM ka naam liya. Usne ADOM version fix kiya aur network mein ek ghanta dhoondhne ke bajay minutes mein khatam kiya.</p><p><b>Lesson:</b> boring checklist clever andaze se tez hai.</p></div>

<div class="iv"><p class="q">"Naye branch FortiGate ka poora onboarding ek minute mein describe karo."</p><p>ADOM ko firmware ke same version par taiyar karo. Ya to FortiGate par central-management set karke use unauthorized list se authorize karo, ya fgfm allow karke FortiManager se add karo. conn up aur conf in sync check karo, revision 1 confirm karo, phir kisi install se pehle policy import karo. Kuch fail ho to message padhta hoon aur chain chalata hoon: type, address, path, serial, authorize, version.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FortiManager configuration manage karta hai; wo traffic path mein nahi hai.</li>
<li>Onboarding ke do tareeke: FortiGate call in kare, ya FortiManager device add kare.</li>
<li>ADOM version device firmware ke barabar; authorize revision 1 banata hai.</li>
<li>Pehle install se pehle, existing policy import karo.</li>
<li>Refused, timed out aur silent har ek alag fix ki taraf ishara karta hai.</li>
</ul></div>
`}};export{e as default};