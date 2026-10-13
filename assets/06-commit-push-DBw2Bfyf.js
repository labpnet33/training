var e={id:`commit-push`,h:{en:`The commit and push workflow`,hi:`Commit aur push workflow`},body:{en:`
<p>The commit and push sequence is where Panorama changes become real. It has two stages, and mixing them up is the number one beginner mistake.</p>
<div class="note"><p><b>Note.</b> Reference material (not run in the simulator). Menu and button names are from the Panorama web interface; wording can vary slightly by version.</p></div>
<h3>Two stages, three places</h3>
<p>1. <b>Edit</b>: you change the Panorama <b>candidate</b> configuration. Nothing is saved or pushed.</p>
<p>2. <b>Commit to Panorama</b>: the candidate becomes the Panorama running configuration. Panorama now knows the intended state but the firewalls have not changed.</p>
<p>3. <b>Push to devices</b>: Panorama sends the template and device group configuration to the selected firewalls, which then commit it locally.</p>
<p>A single button, <b>Commit and Push</b>, does both. Use the two stages separately when you want to review before touching production.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Changes exist in three places: the Panorama candidate, the Panorama running configuration, and each firewall."><rect x="20" y="40" width="100" height="80" rx="10" fill="#bae6fd"/><text x="70" y="76" text-anchor="middle" class="svg-ink" font-size="14">Edit</text><text x="70" y="98" text-anchor="middle" class="svg-muted" font-size="12">candidate</text><line x1="120" y1="80" x2="144" y2="80" stroke="#64748b" stroke-width="2"/><rect x="144" y="40" width="100" height="80" rx="10" fill="#bbf7d0"/><text x="194" y="76" text-anchor="middle" class="svg-ink" font-size="14">Commit to Panorama</text><text x="194" y="98" text-anchor="middle" class="svg-muted" font-size="12">saved on Panorama</text><line x1="244" y1="80" x2="268" y2="80" stroke="#64748b" stroke-width="2"/><rect x="268" y="40" width="100" height="80" rx="10" fill="#ddd6fe"/><text x="318" y="76" text-anchor="middle" class="svg-ink" font-size="14">Validate + preview</text><text x="318" y="98" text-anchor="middle" class="svg-muted" font-size="12">check</text><line x1="368" y1="80" x2="392" y2="80" stroke="#64748b" stroke-width="2"/><rect x="392" y="40" width="100" height="80" rx="10" fill="#fde68a"/><text x="442" y="76" text-anchor="middle" class="svg-ink" font-size="14">Push to devices</text><text x="442" y="98" text-anchor="middle" class="svg-muted" font-size="12">firewalls</text><line x1="492" y1="80" x2="516" y2="80" stroke="#64748b" stroke-width="2"/><rect x="516" y="40" width="100" height="80" rx="10" fill="#fed7aa"/><text x="566" y="76" text-anchor="middle" class="svg-ink" font-size="14">Verify</text><text x="566" y="98" text-anchor="middle" class="svg-muted" font-size="12">in sync</text></svg><p class="cap">Changes exist in three places: the Panorama candidate, the Panorama running configuration, and each firewall.</p></div>
<h3>Review before you push</h3>
<ul>
<li><b>Preview Changes</b> shows the XML difference between candidate and running configuration.</li>
<li><b>Change Summary</b> lists changed objects, rules and settings in readable form.</li>
<li><b>Validate Commit</b> checks for errors and warnings, such as a missing object, without applying.</li>
<li><b>Validate Device Group Push</b> and template validation check what the firewalls will receive.</li>
</ul>
<p>Make reading the change summary a habit; it is the cheapest peer review you can have.</p>
<h3>Commit scope</h3>
<p>If several administrators edit at the same time, a commit can include others' changes. You can limit a commit to changes made by selected administrators or locations (partial commit). Use config locks when two people must not edit together. A commit lock tells others a commit is in progress.</p>
<h3>Push scope and options</h3>
<p>When you push, you pick device groups and templates (or template stacks) and the target firewalls. Important options:</p>
<ul>
<li><b>Merge with Candidate Config</b>: includes the firewall's pending local candidate changes, which is normally off; keep it off so unreviewed local edits do not go live.</li>
<li><b>Include Device and Network Templates</b>: push templates and policy together.</li>
<li><b>Force Template Values</b>: overrides local values with the template values. Use it deliberately when cleaning up drift, and check what will be overridden first.</li>
<li><b>Edit Selections</b>: choose exactly which devices and device groups to push to.</li>
</ul>
<p>Large estates push in waves: a pilot site, then one region, then the rest. Watch jobs (Tasks) for results; a failed device does not stop the others.</p>
<h3>Command line</h3>
<p>Many actions can be run from the Panorama CLI as well, which helps for automation and audit records. For example, the commit to Panorama and the push to a device group are available as commit and commit-all commands; check the syntax with the question mark in your version before use.</p>
<pre class="code">commit
commit-all shared-policy device-group DG-EMEA
commit-all template-stack name TS-EMEA-Branch</pre>
<h3>Rolling back</h3>
<ul>
<li><b>Revert changes</b> discards uncommitted candidate changes.</li>
<li>Panorama keeps saved configuration versions. You can load an earlier version, commit to Panorama and push again to roll back for all devices.</li>
<li>On a firewall, a local rollback is available, but a later push can overwrite it, so prefer reverting centrally.</li>
</ul>
<h3>Sync state and drift</h3>
<p>Managed Devices shows each firewall's <b>Shared Policy</b> and <b>Template</b> sync state. In Sync means the firewall matches Panorama's last push. Out of Sync means a pending push or a local change. Investigate drift: local changes outside Panorama are a control gap and, if not intended, a security risk.</p>
<div class="eg"><p><b>Worked example.</b> A change adds a rule to DG-Global-Branches. The author edits, saves with audit comment CHG-1042, and asks the approver. The approver opens Preview Changes, sees one new rule and nothing else, commits to Panorama with the description CHG-1042, then pushes to the pilot site. After a clean test, the push goes to the remaining 39 sites.</p></div>
<div class="warn"><p><b>Common mistake.</b> Pushing everything to every device every time. Pushing unrelated pending changes by other administrators is a quick route to an outage. Use partial commits and selected push scope.</p></div>
<div class="exam"><p><b>Exam trap.</b> Commit to Panorama saves to Panorama only; Push to Devices sends to firewalls. Force Template Values overrides local values. Rollback is done by loading a saved version and pushing it.</p></div>
<div class="scn"><h4>Two engineers, one commit</h4><p>Two administrators edited at the same time. One committed and accidentally included the other's half-finished NAT change, which then went to production. The team switched on config locks for rulebase edits, required previews with a named reviewer, and used partial commits. The next change contained only its own edits.</p><p><b>Lesson:</b> commit scope is as important as the change itself.</p></div>
<div class="iv"><p class="q">"What is the difference between commit and push in Panorama?"</p><p>Commit saves the candidate configuration as the running configuration on Panorama only. Push sends the template and device group configuration to the managed firewalls, which commit it locally. Review with preview and validation, limit the scope, and verify sync status afterward.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Commit to Panorama and Push to Devices are separate stages.</li><li>Preview Changes, Change Summary and Validate catch errors before production.</li><li>Use partial commits and scoped pushes; push in waves.</li><li>Force Template Values overwrites local settings; use it deliberately.</li><li>Roll back by loading a saved version and pushing it; watch sync state.</li></ul></div>
`,hi:`
<p>Commit aur push sequence woh jagah hai jahan Panorama ke changes real hote hain. Isme do stages hain, aur unhe mix karna beginners ki number one galti hai.</p>
<div class="note"><p><b>Note.</b> Reference material (simulator mein nahi chalta). Menu aur button names Panorama web interface ke hain; version ke hisaab se wording thodi alag ho sakti hai.</p></div>
<h3>Do stages, teen jagah</h3>
<p>1. <b>Edit</b>: aap Panorama ka <b>candidate</b> configuration badalte ho. Kuch save ya push nahi hota.</p>
<p>2. <b>Commit to Panorama</b>: candidate Panorama ka running configuration ban jaata hai. Panorama ko ab intended state pata hai par firewalls nahi badle.</p>
<p>3. <b>Push to devices</b>: Panorama chuninda firewalls ko template aur device group configuration bhejta hai, jo use local commit karte hain.</p>
<p>Ek single button <b>Commit and Push</b> dono karta hai. Production chhune se pehle review karna ho to dono stages alag use karo.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Changes teen jagah hote hain: Panorama candidate, Panorama running configuration, aur har firewall."><rect x="20" y="40" width="100" height="80" rx="10" fill="#bae6fd"/><text x="70" y="76" text-anchor="middle" class="svg-ink" font-size="14">Edit</text><text x="70" y="98" text-anchor="middle" class="svg-muted" font-size="12">candidate</text><line x1="120" y1="80" x2="144" y2="80" stroke="#64748b" stroke-width="2"/><rect x="144" y="40" width="100" height="80" rx="10" fill="#bbf7d0"/><text x="194" y="76" text-anchor="middle" class="svg-ink" font-size="14">Commit to Panorama</text><text x="194" y="98" text-anchor="middle" class="svg-muted" font-size="12">Panorama par saved</text><line x1="244" y1="80" x2="268" y2="80" stroke="#64748b" stroke-width="2"/><rect x="268" y="40" width="100" height="80" rx="10" fill="#ddd6fe"/><text x="318" y="76" text-anchor="middle" class="svg-ink" font-size="14">Validate + preview</text><text x="318" y="98" text-anchor="middle" class="svg-muted" font-size="12">check</text><line x1="368" y1="80" x2="392" y2="80" stroke="#64748b" stroke-width="2"/><rect x="392" y="40" width="100" height="80" rx="10" fill="#fde68a"/><text x="442" y="76" text-anchor="middle" class="svg-ink" font-size="14">Push to devices</text><text x="442" y="98" text-anchor="middle" class="svg-muted" font-size="12">firewalls</text><line x1="492" y1="80" x2="516" y2="80" stroke="#64748b" stroke-width="2"/><rect x="516" y="40" width="100" height="80" rx="10" fill="#fed7aa"/><text x="566" y="76" text-anchor="middle" class="svg-ink" font-size="14">Verify</text><text x="566" y="98" text-anchor="middle" class="svg-muted" font-size="12">in sync</text></svg><p class="cap">Changes teen jagah hote hain: Panorama candidate, Panorama running configuration, aur har firewall.</p></div>
<h3>Push se pehle review</h3>
<ul>
<li><b>Preview Changes</b> candidate aur running configuration ka XML difference dikhata hai.</li>
<li><b>Change Summary</b> badle hue objects, rules aur settings readable form mein list karta hai.</li>
<li><b>Validate Commit</b> bina apply kiye errors aur warnings check karta hai, jaise missing object.</li>
<li><b>Validate Device Group Push</b> aur template validation check karte hain ki firewalls ko kya milega.</li>
</ul>
<p>Change summary padhna aadat banao; yeh sabse sasta peer review hai.</p>
<h3>Commit scope</h3>
<p>Kai administrators ek saath edit karein to commit mein doosron ke changes aa sakte hain. Aap commit ko chune hue administrators ya locations ke changes tak limit kar sakte ho (partial commit). Do log saath edit na karein to config locks use karo. Commit lock doosron ko batata hai ki commit chal raha hai.</p>
<h3>Push scope aur options</h3>
<p>Push karte waqt aap device groups aur templates (ya template stacks) aur target firewalls chunte ho. Important options:</p>
<ul>
<li><b>Merge with Candidate Config</b>: firewall ke pending local candidate changes shamil karta hai, jo normally off hota hai; ise off rakho taaki unreviewed local edits live na ho.</li>
<li><b>Include Device and Network Templates</b>: templates aur policy saath push karta hai.</li>
<li><b>Force Template Values</b>: local values ko template values se override karta hai. Drift saaf karte waqt soch-samajhkar use karo, aur pehle dekho kya override hoga.</li>
<li><b>Edit Selections</b>: exactly kin devices aur device groups par push karna hai chuno.</li>
</ul>
<p>Bade estates waves mein push karte hain: pilot site, phir ek region, phir baaki. Results ke liye jobs (Tasks) dekho; fail hua device baaki ko nahi rokta.</p>
<h3>Command line</h3>
<p>Kai actions Panorama CLI se bhi chal sakte hain, jo automation aur audit records ke liye madad karta hai. Jaise Panorama ko commit aur device group par push commit aur commit-all commands se available hain; use se pehle apne version mein question mark se syntax check karo.</p>
<pre class="code">commit
commit-all shared-policy device-group DG-EMEA
commit-all template-stack name TS-EMEA-Branch</pre>
<h3>Rolling back</h3>
<ul>
<li><b>Revert changes</b> uncommitted candidate changes discard karta hai.</li>
<li>Panorama saved configuration versions rakhta hai. Aap purana version load karke Panorama mein commit karke dobara push kar sakte ho taaki saare devices ke liye rollback ho.</li>
<li>Firewall par local rollback available hai, par baad ka push use overwrite kar sakta hai, isliye central revert pasand karo.</li>
</ul>
<h3>Sync state aur drift</h3>
<p>Managed Devices har firewall ka <b>Shared Policy</b> aur <b>Template</b> sync state dikhata hai. In Sync matlab firewall Panorama ke last push se match karta hai. Out of Sync matlab pending push ya local change. Drift investigate karo: Panorama ke bahar local changes control gap hain aur agar intended na ho to security risk.</p>
<div class="eg"><p><b>Worked example.</b> Change DG-Global-Branches mein rule jodta hai. Author edit karke audit comment CHG-1042 ke saath save karta hai aur approver se kehta hai. Approver Preview Changes kholta hai, ek nayi rule aur kuch nahi dekhta, description CHG-1042 ke saath Panorama mein commit karta hai, phir pilot site par push karta hai. Clean test ke baad push baaki 39 sites par jaata hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Har baar sab devices par sab kuch push karna. Doosre administrators ke unrelated pending changes push karna outage ka tez raasta hai. Partial commits aur selected push scope use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Commit to Panorama sirf Panorama par save karta hai; Push to Devices firewalls ko bhejta hai. Force Template Values local values override karta hai. Rollback saved version load karke push karne se hota hai.</p></div>
<div class="scn"><h4>Do engineers, ek commit</h4><p>Do administrators ne ek saath edit kiya. Ek ne commit kiya aur galti se doosre ka adhoora NAT change shamil ho gaya, jo production mein chala gaya. Team ne rulebase edits ke liye config locks on kiye, named reviewer ke saath preview zaroori kiya, aur partial commits use kiye. Agle change mein sirf uske apne edits the.</p><p><b>Lesson:</b> commit scope utna hi important hai jitna change khud.</p></div>
<div class="iv"><p class="q">"Panorama mein commit aur push mein kya difference hai?"</p><p>Commit candidate configuration ko sirf Panorama par running configuration ki tarah save karta hai. Push template aur device group configuration managed firewalls ko bhejta hai, jo use local commit karte hain. Preview aur validation se review karo, scope limit karo, aur baad mein sync status verify karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Commit to Panorama aur Push to Devices alag stages hain.</li><li>Preview Changes, Change Summary aur Validate production se pehle errors pakadte hain.</li><li>Partial commits aur scoped pushes use karo; waves mein push karo.</li><li>Force Template Values local settings overwrite karta hai; soch-samajhkar use karo.</li><li>Saved version load karke push se rollback karo; sync state dekho.</li></ul></div>
`}};export{e as default};