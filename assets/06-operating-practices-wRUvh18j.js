var e={id:`operating-practices`,h:{en:`Operating practices: naming, change windows, admin separation, documentation`,hi:`Operating practices: naming, change windows, admin separation, documentation`},body:{en:`
<p>A hospital runs on routines: a handover note at every shift, labelled drawers, a checklist before surgery. None of it is clever; all of it prevents mistakes on a busy night. FortiManager gives you powerful tools, and a wrong install can reach many firewalls in one click. Routines are what keep that power safe. This chapter covers four habits: naming, change windows, separation of administrators and documentation.</p>

<h3>1. Naming</h3>
<p>Good names let a stranger understand the estate at 3 am. Choose a pattern once and keep it. In the Kaveri examples the devices are named after the site with a suffix (HQ-FGT, MDU-FGT, TRY-FGT), objects after what they are (SRV-WEB), packages after their scope (Branch-PP), and ADOMs after the business unit (Kaveri, Corporate). Remember the simulator rule that names are global: a name used in one ADOM cannot be reused in another, so plan names before you create them.</p>
<table class="cmp"><tr><th>Item</th><th>Weak name</th><th>Better name</th></tr>
<tr><td>Device</td><td>fw2</td><td>MDU-FGT</td></tr>
<tr><td>Address object</td><td>new1</td><td>SRV-WEB</td></tr>
<tr><td>Policy package</td><td>test-final-2</td><td>Branch-PP</td></tr>
<tr><td>Policy</td><td>policy 5</td><td>LAN-TO-SRV</td></tr>
<tr><td>Template</td><td>t1</td><td>KR-DNS</td></tr></table>

<h3>2. Change windows</h3>
<p>A <b>change window</b> is an agreed time when changes may be made, with a person who approves and a way back if it fails. A safe change on FortiManager follows the same steps every time:</p>
<ol>
<li>Check that the device is healthy: <code>diagnose dvm device list</code> shows conn up and conf in sync.</li>
<li>Run the install preview and read the lines. Remember that an install replaces the whole policy table of the device.</li>
<li>Install in the window, to one device first when the change is risky.</li>
<li>Verify on the FortiGate and with a real test, for example a ping from PC-MDU to 192.0.2.80.</li>
<li>Look at the new revision and record it in the ticket.</li>
</ol>
<pre class="out">FMG-1 # execute fmgui revision list MDU-FGT
Revision history of MDU-FGT:
ID	CREATED BY	TIME			NAME
1	retrieve	2026-10-12 19:20:29	Retrieved
<span class="hl">2	install	2026-10-12 19:21:24	Installed Branch-PP</span></pre>
<p>The time stamps in the simulator are synthetic, but the habit is real: every install leaves one line that links the change to a moment.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Change cycle">
<rect x="10" y="30" width="96" height="46" rx="6" fill="#bae6fd"/><text x="58" y="58" text-anchor="middle" class="svg-ink" font-size="12">Check health</text>
<rect x="132" y="30" width="96" height="46" rx="6" fill="#bae6fd"/><text x="180" y="58" text-anchor="middle" class="svg-ink" font-size="12">Preview</text>
<rect x="254" y="30" width="96" height="46" rx="6" fill="#fde68a"/><text x="302" y="58" text-anchor="middle" class="svg-ink" font-size="12">Install</text>
<rect x="376" y="30" width="96" height="46" rx="6" fill="#bbf7d0"/><text x="424" y="58" text-anchor="middle" class="svg-ink" font-size="12">Verify</text>
<rect x="498" y="30" width="126" height="46" rx="6" fill="#ddd6fe"/><text x="561" y="58" text-anchor="middle" class="svg-ink" font-size="12">Record revision</text>
<line x1="106" y1="53" x2="132" y2="53" stroke="#64748b" stroke-width="2"/><line x1="228" y1="53" x2="254" y2="53" stroke="#64748b" stroke-width="2"/><line x1="350" y1="53" x2="376" y2="53" stroke="#64748b" stroke-width="2"/><line x1="472" y1="53" x2="498" y2="53" stroke="#64748b" stroke-width="2"/>
<text x="10" y="110" class="svg-muted" font-size="12">Same five steps for every change, big or small.</text>
</svg><p class="cap">A repeatable change cycle.</p></div>

<h3>3. Separating administrators</h3>
<p>In the real product, administrators receive profiles that decide what they may do and which ADOMs they see, so the Trichy team can work on its own devices without touching the head office. Good practice: personal accounts instead of a shared one, the least permission that does the job, and one person to prepare and another to approve big installs. These controls (including ADOM locking and workflow approval) are real-product theory; the simulator has one administrator and does not model them. Mention them honestly in an interview.</p>
<p>A second separation is on the FortiGate: the setting <code>allow-push-configuration</code> decides whether FortiManager may push at all. Some teams keep it disabled until a change window opens. That is a valid control, as long as everybody knows, because a disabled setting produces exactly the install failure from chapter 2.</p>

<h3>4. Documentation</h3>
<p>Write down what the system cannot tell you: why a design was chosen, who owns each site, the maintenance windows, the order of steps for a replacement, and the contact for each ADOM. Keep it short and next to the change tickets. A one-page runbook for each task (onboard, replace, roll back) is worth more than a long manual.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri writes a half-page runbook for a new branch: create the device record, set central-management with type fortimanager and fmg 192.0.2.5, wait for the unauthorized list, authorize into the ADOM Kaveri, install Branch-PP in the next window, ping SRV-WEB, add the revision number to the ticket. A new engineer follows it without help.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Installing during working hours "just a small change". Using one shared admin account, so the audit trail names nobody. Skipping the preview. Leaving temporary rules unrecorded. Names that change meaning over time.</p></div>

<div class="exam"><p><b>Exam traps.</b> Preview sends nothing. An install replaces the device's policy table. Allow-push-configuration lives on the FortiGate. Workflow and ADOM locking are real-product features not modelled in the simulator.</p></div>

<div class="scn"><h4>The Friday afternoon "small change"</h4><p>A team lead installed a package at 5 pm on a Friday without a preview. The package did not contain a manual rule that a branch engineer had added the week before, so the install removed it and a billing link stopped working. The revision history showed both the install and the earlier automatic update, so the cause was found in minutes, but the weekend was spent restoring the rule.</p><p><b>Lesson:</b> preview and a change window would have shown the missing line before it hurt anyone.</p></div>

<div class="iv"><p class="q">"How do you keep FortiManager changes safe in a large team?"</p><p>A fixed cycle: health check, preview, install in the window, verify, record the revision. Personal accounts with least privilege and approval for large installs (real-product features), a clear naming scheme, and short runbooks. Add that a failed install changes nothing, but a successful install of a wrong package does, so review comes first.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Agree a naming pattern before you create objects; names are global in the simulator.</li>
<li>Use one change cycle every time: health, preview, install, verify, record.</li>
<li>Separate administrators and approvals are real-product theory here.</li>
<li>Allow-push-configuration on the FortiGate is a control and a common failure cause.</li>
<li>Short runbooks beat long manuals.</li>
</ul></div>
`,hi:`
<p>Hospital routines par chalta hai: har shift mein handover note, labelled drawers, surgery se pehle checklist. Inme se kuch bhi clever nahi hai; sab kuch busy raat ki galtiyan rokta hai. FortiManager aapko powerful tools deta hai, aur galat install ek click mein kai firewalls tak pahunch sakta hai. Routines us power ko safe rakhte hain. Ye chapter chaar aadatein cover karta hai: naming, change windows, administrators ka separation aur documentation.</p>

<h3>1. Naming</h3>
<p>Achhe naam se ajnabi bhi raat ke 3 baje estate samajh leta hai. Pattern ek baar chuno aur use rakho. Kaveri ke examples mein devices site ke naam plus suffix se hain (HQ-FGT, MDU-FGT, TRY-FGT), objects unke kaam se (SRV-WEB), packages scope se (Branch-PP), aur ADOMs business unit se (Kaveri, Corporate). Simulator ka rule yaad rakho ki names global hain: ek ADOM mein use hua naam doosre ADOM mein dobara nahi ho sakta, isliye banane se pehle naam plan karo.</p>
<table class="cmp"><tr><th>Item</th><th>Weak name</th><th>Better name</th></tr>
<tr><td>Device</td><td>fw2</td><td>MDU-FGT</td></tr>
<tr><td>Address object</td><td>new1</td><td>SRV-WEB</td></tr>
<tr><td>Policy package</td><td>test-final-2</td><td>Branch-PP</td></tr>
<tr><td>Policy</td><td>policy 5</td><td>LAN-TO-SRV</td></tr>
<tr><td>Template</td><td>t1</td><td>KR-DNS</td></tr></table>

<h3>2. Change windows</h3>
<p><b>Change window</b> ek agreed time hai jab changes kiye ja sakte hain, ek approve karne wala vyakti hota hai aur fail hone par wapas jaane ka raasta. FortiManager par safe change har baar yahi steps follow karta hai:</p>
<ol>
<li>Check karo ki device healthy hai: <code>diagnose dvm device list</code> mein conn up aur conf in sync dikhe.</li>
<li>Install preview chalao aur lines padho. Yaad rakho ki install device ki poori policy table replace karta hai.</li>
<li>Window mein install karo, risky change ho to pehle ek device par.</li>
<li>FortiGate par aur real test se verify karo, jaise PC-MDU se 192.0.2.80 tak ping.</li>
<li>Nayi revision dekho aur ticket mein record karo.</li>
</ol>
<pre class="out">FMG-1 # execute fmgui revision list MDU-FGT
Revision history of MDU-FGT:
ID	CREATED BY	TIME			NAME
1	retrieve	2026-10-12 19:20:29	Retrieved
<span class="hl">2	install	2026-10-12 19:21:24	Installed Branch-PP</span></pre>
<p>Simulator ke time stamps synthetic hain, par aadat real hai: har install ek line chhodta hai jo change ko ek moment se jodti hai.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Change cycle">
<rect x="10" y="30" width="96" height="46" rx="6" fill="#bae6fd"/><text x="58" y="58" text-anchor="middle" class="svg-ink" font-size="12">Check health</text>
<rect x="132" y="30" width="96" height="46" rx="6" fill="#bae6fd"/><text x="180" y="58" text-anchor="middle" class="svg-ink" font-size="12">Preview</text>
<rect x="254" y="30" width="96" height="46" rx="6" fill="#fde68a"/><text x="302" y="58" text-anchor="middle" class="svg-ink" font-size="12">Install</text>
<rect x="376" y="30" width="96" height="46" rx="6" fill="#bbf7d0"/><text x="424" y="58" text-anchor="middle" class="svg-ink" font-size="12">Verify</text>
<rect x="498" y="30" width="126" height="46" rx="6" fill="#ddd6fe"/><text x="561" y="58" text-anchor="middle" class="svg-ink" font-size="12">Record revision</text>
<line x1="106" y1="53" x2="132" y2="53" stroke="#64748b" stroke-width="2"/><line x1="228" y1="53" x2="254" y2="53" stroke="#64748b" stroke-width="2"/><line x1="350" y1="53" x2="376" y2="53" stroke="#64748b" stroke-width="2"/><line x1="472" y1="53" x2="498" y2="53" stroke="#64748b" stroke-width="2"/>
<text x="10" y="110" class="svg-muted" font-size="12">Har change ke liye wahi paanch steps, bada ho ya chhota.</text>
</svg><p class="cap">Repeatable change cycle.</p></div>

<h3>3. Administrators ko alag karna</h3>
<p>Real product mein administrators ko profiles milte hain jo decide karte hain ki wo kya kar sakte hain aur kaun se ADOMs dekh sakte hain, taaki Trichy team apne devices par kaam kare bina head office ko chhue. Achhi practice: shared account ki jagah personal accounts, kaam ke liye sabse kam permission, aur bade installs ke liye ek vyakti taiyaari kare aur doosra approve kare. Ye controls (ADOM locking aur workflow approval samet) real-product theory hain; simulator mein ek hi administrator hai aur ye model nahi hote. Interview mein ye imandari se kaho.</p>
<p>Doosra separation FortiGate par hai: setting <code>allow-push-configuration</code> decide karti hai ki FortiManager push kar sakta hai ya nahi. Kuch teams ise change window khulne tak disabled rakhti hain. Ye valid control hai, jab tak sab ko pata ho, kyunki disabled setting wahi install failure deti hai jo chapter 2 mein dekha.</p>

<h3>4. Documentation</h3>
<p>Wo likho jo system nahi bata sakta: design kyun chuna gaya, har site ka owner kaun hai, maintenance windows, replacement ke steps ka order, aur har ADOM ka contact. Chhota rakho aur change tickets ke paas rakho. Har task (onboard, replace, roll back) ka ek page ka runbook lambe manual se zyada kaam ka hai.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri naye branch ke liye aadhe page ka runbook likhta hai: device record banao, central-management mein type fortimanager aur fmg 192.0.2.5 set karo, unauthorized list ka wait karo, ADOM Kaveri mein authorize karo, agli window mein Branch-PP install karo, SRV-WEB ko ping karo, revision number ticket mein jodo. Naya engineer bina madad ke follow kar leta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Working hours mein "bas chhota change" install karna. Ek shared admin account use karna, jisse audit trail kisi ka naam nahi batata. Preview skip karna. Temporary rules ko record na karna. Naam jo samay ke saath matlab badal dein.</p></div>

<div class="exam"><p><b>Exam traps.</b> Preview kuch nahi bhejta. Install device ki policy table replace karta hai. Allow-push-configuration FortiGate par hai. Workflow aur ADOM locking real-product features hain jo simulator mein model nahi hain.</p></div>

<div class="scn"><h4>Friday shaam ka "chhota change"</h4><p>Ek team lead ne Friday shaam 5 baje bina preview ke package install kiya. Package mein wo manual rule nahi tha jo ek branch engineer ne pichhle hafte jodha tha, to install ne use hata diya aur billing link band ho gaya. Revision history mein install aur pehle ka automatic update dono dikhe, isliye cause minutes mein mil gaya, par weekend rule wapas banane mein gaya.</p><p><b>Lesson:</b> preview aur change window missing line ko kisi ko nuksan se pehle dikha dete.</p></div>

<div class="iv"><p class="q">"Badi team mein FortiManager changes safe kaise rakhte ho?"</p><p>Fixed cycle: health check, preview, window mein install, verify, revision record. Least privilege wale personal accounts aur bade installs ke liye approval (real-product features), clear naming scheme, aur chhote runbooks. Jodo ki failed install kuch nahi badalta, par galat package ka successful install badalta hai, isliye review pehle aata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Objects banane se pehle naming pattern agree karo; simulator mein names global hain.</li>
<li>Har baar ek hi change cycle: health, preview, install, verify, record.</li>
<li>Alag administrators aur approvals yahan real-product theory hain.</li>
<li>FortiGate par allow-push-configuration ek control bhi hai aur aam failure cause bhi.</li>
<li>Chhote runbooks lambe manuals se behtar hain.</li>
</ul></div>
`}};export{e as default};