var e={id:`admins-backups-rollback`,h:{en:`Several administrators, backups and rollback thinking`,hi:`Kai administrators, backups aur rollback thinking`},body:{en:`
<p>Real Panorama servers are not used by one person. Two engineers may edit at the same time, someone may be mid-change when you push, and sometimes a change must be undone. This chapter is deliberately conservative: it describes the principles and tells you to confirm the details in the documentation for your PAN-OS version. The simulator does not model locks, per-administrator scope or config versions.</p>

<h3>Analogy: a shared whiteboard</h3>
<p>Two people write on one whiteboard. If one wipes it while the other is mid-sentence, work is lost. Teams agree: tell each other, take turns, take a photo before big changes. Panorama has features for this; the habits matter more than the buttons.</p>

<h3>Working at the same time</h3>
<ul>
<li>Panorama keeps one candidate configuration shared by administrators, so one person's commit can include another person's edits unless scope is limited. Many PAN-OS versions let you commit only the changes of a chosen administrator or location; check your version.</li>
<li>Administrators can place <b>locks</b> so that others cannot change or commit certain parts. Locks are a courtesy tool: they must be released, and a forgotten lock blocks colleagues.</li>
<li>A push uses the running configuration, so it includes <b>everything committed so far</b>, including a colleague's earlier commit. Before pushing, review what changed since the last push.</li>
</ul>
<div class="warn"><p><b>Habit.</b> Announce your window in the team channel, check who else is logged in, and agree who pushes. Never push at the same time as another engineer on the same device group.</p></div>

<h3>Backups and versions</h3>
<p>Panorama saves configuration versions on each commit, and you can export the running configuration to a file. A firewall also keeps its own versions. Because Panorama is the source of truth for pushed configuration, the Panorama backup is the most valuable one. Exact retention, naming and the commands or screens to load an older version depend on the release: <b>check the documentation for your PAN-OS version</b>.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Rollback loop">
<rect x="20" y="30" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="60" text-anchor="middle" class="svg-ink" font-size="12">Save backup</text>
<rect x="170" y="30" width="120" height="50" rx="8" fill="#fde68a"/><text x="230" y="60" text-anchor="middle" class="svg-ink" font-size="12">Change + push</text>
<rect x="320" y="30" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="380" y="60" text-anchor="middle" class="svg-ink" font-size="12">Verify</text>
<rect x="470" y="30" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="545" y="52" text-anchor="middle" class="svg-ink" font-size="12">If bad: restore</text><text x="545" y="68" text-anchor="middle" class="svg-muted" font-size="11">commit, push again</text>
<line x1="140" y1="55" x2="170" y2="55" stroke="#64748b" stroke-width="2"/><line x1="290" y1="55" x2="320" y2="55" stroke="#64748b" stroke-width="2"/><line x1="440" y1="55" x2="470" y2="55" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">A rollback on Panorama is another commit and another push, not an instant switch.</p></div>

<h3>Rollback thinking</h3>
<p>Because firewalls receive configuration only through push, <b>restoring an older configuration on Panorama does nothing to firewalls until you commit it and push it</b>. A rollback therefore has the same stages as the original change: restore on Panorama, commit to Panorama, validate-only, push, verify. Plan its blast radius too. A small pilot makes rollback small.</p>
<p>Reference configuration (not run in the simulator): the lab has no config version commands. In a real environment you would also keep a text export of the relevant rules and objects in your change ticket so you can re-create them quickly.</p>
<p>A practical rollback plan can also be a <b>corrective change</b>: delete the added rule, commit, push. It is often faster and more precise than reloading a whole old version, which would also undo unrelated changes from colleagues.</p>

<div class="exam"><p><b>Exam trap.</b> A rollback on Panorama is not instant: firewalls are still on the bad configuration until a push delivers the restored one.</p></div>

<div class="scn"><h4>Two engineers, one push</h4><p>Engineer A committed a new NAT rule at 10:00 for a later window. Engineer B pushed a different urgent change at 10:30. The push carried A's rule too. A branch lost internet access for ten minutes. The team now agrees: one pusher per window, and a review of the pending diff before every push.</p><p><b>Lesson:</b> push sends everything committed, not just your change.</p></div>

<div class="iv"><p class="q">"How do you roll back a bad Panorama push?"</p><p>Restore or reverse the change on Panorama, commit to Panorama, validate-only, push to the affected firewalls, and verify. Firewalls stay on the bad configuration until that push. I prefer a corrective change when the old version would undo unrelated work.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Coordinate: announce, check who is logged in, one pusher per window.</li>
<li>Locks and commit scope exist; confirm behaviour in your version.</li>
<li>Back up before change; Panorama's backup matters most.</li>
<li>Rollback = restore, commit, push, verify; it is not instant.</li>
</ul></div>
`,hi:`
<p>Real Panorama servers ko ek hi insaan use nahi karta. Do engineers ek saath edit kar sakte hain, aapke push ke waqt koi mid-change ho sakta hai, aur kabhi change undo karna padta hai. Ye chapter jaanbujhkar conservative hai: ye principles batata hai aur details apne PAN-OS version ki documentation mein confirm karne ko kehta hai. Simulator locks, per-administrator scope ya config versions model nahi karta.</p>

<h3>Analogy: shared whiteboard</h3>
<p>Do log ek whiteboard par likhte hain. Ek mita de jab doosra beech sentence mein ho, to kaam jaata hai. Teams agree karti hain: ek doosre ko batao, baari baari karo, bade changes se pehle photo lo. Panorama mein iske features hain; buttons se zyada habits matter karti hain.</p>

<h3>Ek saath kaam karna</h3>
<ul>
<li>Panorama administrators ke beech ek shared candidate configuration rakhta hai, isliye ek ka commit doosre ke edits bhi shamil kar sakta hai jab tak scope limit na ho. Kai PAN-OS versions mein chune hue administrator ya location ke changes hi commit kar sakte ho; apna version check karo.</li>
<li>Administrators <b>locks</b> laga sakte hain taaki doosre kuch hisson ko change ya commit na kar sakein. Locks courtesy tool hain: unhe release karna padta hai, aur bhoola hua lock colleagues ko rok deta hai.</li>
<li>Push running configuration use karta hai, isliye usme <b>ab tak ka sab committed</b> aata hai, colleague ka pehle ka commit bhi. Push se pehle review karo ki pichhle push ke baad kya badla.</li>
</ul>
<div class="warn"><p><b>Habit.</b> Team channel mein apni window announce karo, check karo aur kaun logged in hai, aur agree karo kaun push karega. Same device group par doosre engineer ke saath kabhi ek hi waqt push mat karo.</p></div>

<h3>Backups aur versions</h3>
<p>Panorama har commit par configuration versions save karta hai, aur aap running configuration ko file mein export kar sakte ho. Firewall bhi apne versions rakhta hai. Kyunki pushed configuration ka source of truth Panorama hai, Panorama ka backup sabse keemti hai. Exact retention, naming aur purana version load karne ke commands ya screens release par depend karte hain: <b>apne PAN-OS version ki documentation check karo</b>.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Rollback loop">
<rect x="20" y="30" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="60" text-anchor="middle" class="svg-ink" font-size="12">Backup save</text>
<rect x="170" y="30" width="120" height="50" rx="8" fill="#fde68a"/><text x="230" y="60" text-anchor="middle" class="svg-ink" font-size="12">Change + push</text>
<rect x="320" y="30" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="380" y="60" text-anchor="middle" class="svg-ink" font-size="12">Verify</text>
<rect x="470" y="30" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="545" y="52" text-anchor="middle" class="svg-ink" font-size="12">Bura ho to: restore</text><text x="545" y="68" text-anchor="middle" class="svg-muted" font-size="11">commit, dobara push</text>
<line x1="140" y1="55" x2="170" y2="55" stroke="#64748b" stroke-width="2"/><line x1="290" y1="55" x2="320" y2="55" stroke="#64748b" stroke-width="2"/><line x1="440" y1="55" x2="470" y2="55" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Panorama par rollback ek aur commit aur ek aur push hai, instant switch nahi.</p></div>

<h3>Rollback thinking</h3>
<p>Kyunki firewalls ko configuration sirf push se milti hai, <b>Panorama par purani configuration restore karne se firewalls par kuch nahi hota jab tak aap use commit aur push na karo</b>. Isliye rollback ke wahi stages hain jo original change ke the: Panorama par restore, commit to Panorama, validate-only, push, verify. Uska blast radius bhi plan karo. Chhota pilot rollback ko chhota rakhta hai.</p>
<p>Reference configuration (not run in the simulator): lab mein config version commands nahi hain. Real environment mein aap relevant rules aur objects ka text export bhi change ticket mein rakhoge taaki unhe jaldi re-create kar sako.</p>
<p>Practical rollback plan <b>corrective change</b> bhi ho sakta hai: joda hua rule delete karo, commit, push. Ye aksar poora purana version reload karne se tez aur precise hota hai, jo colleagues ke unrelated changes bhi undo kar deta.</p>

<div class="exam"><p><b>Exam trap.</b> Panorama par rollback instant nahi hai: firewalls tab tak buri configuration par rehte hain jab tak push restored configuration deliver na kare.</p></div>

<div class="scn"><h4>Do engineers, ek push</h4><p>Engineer A ne 10:00 baje agli window ke liye naya NAT rule commit kiya. Engineer B ne 10:30 par alag urgent change push kiya. Push A ki rule bhi le gaya. Ek branch ka internet das minute ke liye gaya. Ab team agree karti hai: ek window mein ek pusher, aur har push se pehle pending diff ka review.</p><p><b>Lesson:</b> push wo sab bhejta hai jo committed hai, sirf aapka change nahi.</p></div>

<div class="iv"><p class="q">"Buri Panorama push ko rollback kaise karte ho?"</p><p>Panorama par change restore ya reverse karta hoon, commit to Panorama, validate-only, affected firewalls par push, aur verify. Firewalls us push tak buri configuration par rehte hain. Jab purana version unrelated kaam undo kar de to corrective change prefer karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Coordinate karo: announce, kaun logged in check, ek window mein ek pusher.</li>
<li>Locks aur commit scope exist karte hain; apne version mein behaviour confirm karo.</li>
<li>Change se pehle backup; Panorama ka backup sabse zaroori hai.</li>
<li>Rollback = restore, commit, push, verify; instant nahi hai.</li>
</ul></div>
`}};export{e as default};