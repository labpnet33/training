var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>A pilot runs through a checklist before every flight, not because she forgot how to fly, but because a checklist makes sure nothing small is missed. This chapter is your checklist for provisioning templates: what you must be able to do, the words you must know, and the facts that questions return to again and again. This module overlaps with skills that vendor administrator-level exams also test, and it is independent training.</p>

<h3>Checklist: can you do these?</h3>
<ul>
<li>Explain in two sentences why DNS and a tunnel belong in a template and firewall rules belong in a policy package.</li>
<li>Create a system template (DNS primary, secondary, domain), assign it with <code>set template</code> and read <code>dev-db: modified</code> and <code>cond: pending</code>.</li>
<li>Write a CLI template as one script with semicolons, assign it with <code>cli-template</code>, and read the preview line by line.</li>
<li>Activate Branch_IPSec_Recommended under your own name, fill tunnel-name, remote-gw and psksecret, and assign it with <code>ipsec-template</code>.</li>
<li>State the install order: system, IPsec, CLI, then the policy package.</li>
<li>Run install-preview, install-device, and verify with show commands on the FortiGate and with the revision diff.</li>
<li>Troubleshoot a template that did not arrive: assigned, pending, installed, checks, rejected line, content.</li>
<li>Say what is theory only in this simulator: BGP, SD-WAN and certificate templates, template groups, metadata variables and Jinja.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Template workflow">
<rect x="8" y="35" width="95" height="56" rx="8" fill="#bbf7d0"/><text x="55" y="60" text-anchor="middle" class="svg-ink" font-size="12">Create</text><text x="55" y="78" text-anchor="middle" class="svg-muted" font-size="11">pm template</text>
<rect x="118" y="35" width="95" height="56" rx="8" fill="#fde68a"/><text x="165" y="60" text-anchor="middle" class="svg-ink" font-size="12">Assign</text><text x="165" y="78" text-anchor="middle" class="svg-muted" font-size="11">dvmdb device</text>
<rect x="228" y="35" width="95" height="56" rx="8" fill="#bae6fd"/><text x="275" y="60" text-anchor="middle" class="svg-ink" font-size="12">Status</text><text x="275" y="78" text-anchor="middle" class="svg-muted" font-size="11">dev-db</text>
<rect x="338" y="35" width="95" height="56" rx="8" fill="#ddd6fe"/><text x="385" y="60" text-anchor="middle" class="svg-ink" font-size="12">Preview</text><text x="385" y="78" text-anchor="middle" class="svg-muted" font-size="11">CLI lines</text>
<rect x="448" y="35" width="85" height="56" rx="8" fill="#fed7aa"/><text x="490" y="60" text-anchor="middle" class="svg-ink" font-size="12">Install</text><text x="490" y="78" text-anchor="middle" class="svg-muted" font-size="11">device</text>
<rect x="548" y="35" width="84" height="56" rx="8" fill="#e2e8f0"/><text x="590" y="60" text-anchor="middle" class="svg-ink" font-size="12">Verify</text><text x="590" y="78" text-anchor="middle" class="svg-muted" font-size="11">FortiGate</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">Six steps; skipping the last one is the most common mistake</text>
</svg><p class="cap">The working loop for every template.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Template</dt><dd>A named, reusable block of device settings, assigned per device.</dd>
<dt>System template</dt><dd>DNS primary, secondary and search domain in the simulator; default is read-only.</dd>
<dt>CLI template</dt><dd>One script attribute; semicolons separate the CLI lines.</dd>
<dt>IPsec template</dt><dd>A tunnel built from an activated copy of Branch_IPSec_Recommended.</dd>
<dt>Recommended template</dt><dd>Fortinet-provided and read-only; activate a copy to use it.</dd>
<dt>dev-db</dt><dd>modified means template changes wait in FortiManager; not modified means none are waiting.</dd>
<dt>install-device</dt><dd>Sends device settings only; install-package also sends the package.</dd>
<dt>Metadata variable</dt><dd>Real-product placeholder for per-device values in a template (theory here).</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Where DNS and tunnels live</td><td>Provisioning templates, not the policy package</td></tr>
<tr><td>Assignment attributes</td><td>template, ipsec-template, cli-template in the device entry</td></tr>
<tr><td>Install order</td><td>System, IPsec, CLI, then package</td></tr>
<tr><td>CLI separator</td><td>Semicolon in the simulator</td></tr>
<tr><td>Read-only templates</td><td>default and the five Fortinet-recommended ones</td></tr>
<tr><td>Activatable in the simulator</td><td>Branch_IPSec_Recommended only</td></tr>
<tr><td>Failed install</td><td>Device and revision history unchanged</td></tr>
<tr><td>Proof</td><td>A show command on the FortiGate, not the task message</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Final run for Trichy: three templates exist, all assigned, the preview shows 28 lines in the order DNS, tunnel, address, the install reports a new revision, and show output on TRY-FGT matches. Status: dev-db not modified, conf in sync, dm installed.</p></div>

<div class="warn"><p><b>Common mistakes to avoid.</b> Stopping after assignment; editing a recommended template instead of activating a copy; leaving factory gateway or key; using the wrong attribute for a template kind; fixing a branch by hand instead of fixing the template; pasting a preview with the clear-text key.</p></div>

<div class="exam"><p><b>Exam traps, last look.</b> dev-db is about templates, conf about local drift, pkg about the package. A script that fails is rolled back. Revision revert, workspace mode, template groups and BGP, SD-WAN or certificate templates are theory in this simulator. Authorize, install and template activation are GUI or API actions in the real product, and execute fmgui commands here.</p></div>

<div class="scn"><h4>Handover at the end of a change window</h4><p>At the end of a night change, a senior engineer handed the Kaveri rollout to the morning team with a short list: templates created, devices assigned, previews checked, installs done, show output saved, status lines dev-db not modified on both branches. One branch had been forgotten and still showed modified. The list made the gap obvious in a minute, and the morning team installed it before the shops opened.</p><p><b>Lesson:</b> a checklist turns hidden pending changes into visible ones.</p></div>

<div class="iv"><p class="q">"Give me the full life cycle of a template change."</p><p>Create or edit the template, assign it, read dev-db and cond, preview the CLI lines, install the device settings in the order system, IPsec, CLI, check the task and the revision, verify on the FortiGate, and record the diff. Add that a failed install leaves everything unchanged and that anything beyond DNS, tunnel and CLI templates is real-product theory here.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Templates provision the device; packages carry policy.</li>
<li>Three kinds in the simulator: system (DNS), CLI (semicolon script), IPsec (activated copy).</li>
<li>Order: system, IPsec, CLI, package; recommended templates are read-only.</li>
<li>dev-db: modified means pending; install, then verify on the FortiGate.</li>
<li>Repair in the template, never by hand on the branch.</li>
</ul></div>
`,hi:`
<p>Pilot har flight se pehle checklist chalati hai, isliye nahi ki wo udna bhool gayi, balki isliye ki checklist pakka karti hai ki koi chhoti cheez na chhute. Ye chapter provisioning templates ki aapki checklist hai: aap kya kar sakte ho, kaunse words aane chahiye, aur kaunse facts par sawal baar-baar lautte hain. Ye module un skills se overlap karta hai jo vendor administrator-level exams bhi test karte hain, aur ye independent training hai.</p>

<h3>Checklist: kya aap ye kar sakte ho?</h3>
<ul>
<li>Do sentences mein samjhao ki DNS aur tunnel template mein aur firewall rules policy package mein kyun hote hain.</li>
<li>System template banao (DNS primary, secondary, domain), <code>set template</code> se assign karo aur <code>dev-db: modified</code> aur <code>cond: pending</code> padho.</li>
<li>CLI template ko semicolons wali ek script ki tarah likho, <code>cli-template</code> se assign karo, aur preview line by line padho.</li>
<li>Branch_IPSec_Recommended ko apne naam se activate karo, tunnel-name, remote-gw aur psksecret bharo, aur <code>ipsec-template</code> se assign karo.</li>
<li>Install order batao: system, IPsec, CLI, phir policy package.</li>
<li>install-preview, install-device chalao, aur FortiGate par show commands aur revision diff se verify karo.</li>
<li>Jo template pahuncha nahi use troubleshoot karo: assigned, pending, installed, checks, rejected line, content.</li>
<li>Batao is simulator mein kya sirf theory hai: BGP, SD-WAN aur certificate templates, template groups, metadata variables aur Jinja.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Template workflow">
<rect x="8" y="35" width="95" height="56" rx="8" fill="#bbf7d0"/><text x="55" y="60" text-anchor="middle" class="svg-ink" font-size="12">Create</text><text x="55" y="78" text-anchor="middle" class="svg-muted" font-size="11">pm template</text>
<rect x="118" y="35" width="95" height="56" rx="8" fill="#fde68a"/><text x="165" y="60" text-anchor="middle" class="svg-ink" font-size="12">Assign</text><text x="165" y="78" text-anchor="middle" class="svg-muted" font-size="11">dvmdb device</text>
<rect x="228" y="35" width="95" height="56" rx="8" fill="#bae6fd"/><text x="275" y="60" text-anchor="middle" class="svg-ink" font-size="12">Status</text><text x="275" y="78" text-anchor="middle" class="svg-muted" font-size="11">dev-db</text>
<rect x="338" y="35" width="95" height="56" rx="8" fill="#ddd6fe"/><text x="385" y="60" text-anchor="middle" class="svg-ink" font-size="12">Preview</text><text x="385" y="78" text-anchor="middle" class="svg-muted" font-size="11">CLI lines</text>
<rect x="448" y="35" width="85" height="56" rx="8" fill="#fed7aa"/><text x="490" y="60" text-anchor="middle" class="svg-ink" font-size="12">Install</text><text x="490" y="78" text-anchor="middle" class="svg-muted" font-size="11">device</text>
<rect x="548" y="35" width="84" height="56" rx="8" fill="#e2e8f0"/><text x="590" y="60" text-anchor="middle" class="svg-ink" font-size="12">Verify</text><text x="590" y="78" text-anchor="middle" class="svg-muted" font-size="11">FortiGate</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">Chhe steps; aakhri step chhodna sabse aam galti hai</text>
</svg><p class="cap">Har template ka working loop.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Template</dt><dd>Device settings ka named, reusable block jo har device ko assign hota hai.</dd>
<dt>System template</dt><dd>Simulator mein DNS primary, secondary aur search domain; default read-only hai.</dd>
<dt>CLI template</dt><dd>Ek script attribute; semicolons CLI lines ko alag karte hain.</dd>
<dt>IPsec template</dt><dd>Branch_IPSec_Recommended ki activated copy se bana tunnel.</dd>
<dt>Recommended template</dt><dd>Fortinet ka diya hua aur read-only; use karne ke liye copy activate karo.</dd>
<dt>dev-db</dt><dd>modified matlab template changes FortiManager mein wait kar rahe hain; not modified matlab koi wait nahi kar raha.</dd>
<dt>install-device</dt><dd>Sirf device settings bhejta hai; install-package package bhi bhejta hai.</dd>
<dt>Metadata variable</dt><dd>Template mein per-device values ka real-product placeholder (yahan theory).</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>DNS aur tunnels kahan rehte hain</td><td>Provisioning templates mein, policy package mein nahi</td></tr>
<tr><td>Assignment attributes</td><td>device entry mein template, ipsec-template, cli-template</td></tr>
<tr><td>Install order</td><td>System, IPsec, CLI, phir package</td></tr>
<tr><td>CLI separator</td><td>Simulator mein semicolon</td></tr>
<tr><td>Read-only templates</td><td>default aur paanch Fortinet-recommended</td></tr>
<tr><td>Simulator mein activate hone wala</td><td>Sirf Branch_IPSec_Recommended</td></tr>
<tr><td>Failed install</td><td>Device aur revision history unchanged</td></tr>
<tr><td>Proof</td><td>FortiGate par show command, task message nahi</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Trichy ka final run: teen templates exist karte hain, sab assigned, preview mein DNS, tunnel, address ke order mein 28 lines, install naya revision report karta hai, aur TRY-FGT ka show output match karta hai. Status: dev-db not modified, conf in sync, dm installed.</p></div>

<div class="warn"><p><b>Bachne wali common mistakes.</b> Assignment ke baad ruk jana; recommended template ki copy activate karne ke bajay use edit karna; factory gateway ya key chhodna; template kind ke liye galat attribute use karna; template fix karne ke bajay branch haath se fix karna; clear-text key wala preview paste karna.</p></div>

<div class="exam"><p><b>Exam traps, aakhri nazar.</b> dev-db templates ke baare mein hai, conf local drift ke baare mein, pkg package ke baare mein. Jo script fail hoti hai wo rollback hoti hai. Revision revert, workspace mode, template groups aur BGP, SD-WAN ya certificate templates is simulator mein theory hain. Authorize, install aur template activation real product mein GUI ya API actions hain, aur yahan execute fmgui commands.</p></div>

<div class="scn"><h4>Change window ke ant mein handover</h4><p>Raat ke change ke ant mein ek senior engineer ne Kaveri rollout morning team ko ek chhoti list ke saath handover kiya: templates bane, devices assigned, previews checked, installs done, show output saved, dono branches par status dev-db not modified. Ek branch bhool gayi thi aur abhi bhi modified dikha rahi thi. List ne gap ek minute mein saaf kar diya, aur morning team ne shops khulne se pehle install kar diya.</p><p><b>Lesson:</b> checklist chhupe pending changes ko visible bana deti hai.</p></div>

<div class="iv"><p class="q">"Template change ka poora life cycle batao."</p><p>Template banao ya edit karo, assign karo, dev-db aur cond padho, CLI lines preview karo, device settings system, IPsec, CLI ke order mein install karo, task aur revision check karo, FortiGate par verify karo, aur diff record karo. Ye jodo ki failed install sab unchanged chhodta hai aur DNS, tunnel aur CLI templates ke aage ka sab kuch yahan real-product theory hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Templates device ko provision karte hain; packages policy carry karte hain.</li>
<li>Simulator mein teen kinds: system (DNS), CLI (semicolon script), IPsec (activated copy).</li>
<li>Order: system, IPsec, CLI, package; recommended templates read-only hain.</li>
<li>dev-db: modified matlab pending; install karo, phir FortiGate par verify karo.</li>
<li>Repair template mein karo, branch par haath se kabhi nahi.</li>
</ul></div>
`}};export{e as default};