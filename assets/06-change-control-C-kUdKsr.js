var e={id:`change-control`,h:{en:`Change-control practice: locking down local changes and rollback thinking`,hi:`Change-control practice: local changes lock karna aur rollback ki soch`},body:{en:`
<p>A hospital keeps medicine in a locked cupboard. Nurses can take what a doctor ordered, there is a register, and for a real emergency there is a sealed box that can be opened by one senior person, who must write down why. The rules are not meant to slow the hospital down; they make sure that when something goes wrong, someone knows what was taken, by whom and why. Change control for firewalls is the same idea.</p>

<h3>Two kinds of change</h3>
<p>With FortiManager there are two legitimate ways to change a managed FortiGate. The <b>planned change</b> is made in FortiManager (objects, packages, templates), previewed and installed. The <b>emergency change</b> is typed locally because FortiManager cannot be reached or the problem cannot wait. The first is the norm. The second must be rare, announced and brought back under central control afterwards. Everything else, a "quick fix" that nobody records, is drift.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Change-control flow">
<rect x="20" y="30" width="130" height="56" rx="8" fill="#bae6fd"/><text x="85" y="55" text-anchor="middle" class="svg-ink" font-size="13">request</text><text x="85" y="73" text-anchor="middle" class="svg-muted" font-size="12">ticket + window</text>
<rect x="175" y="30" width="130" height="56" rx="8" fill="#ddd6fe"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="13">edit in FMG</text><text x="240" y="73" text-anchor="middle" class="svg-muted" font-size="12">package, object</text>
<rect x="330" y="30" width="130" height="56" rx="8" fill="#fde68a"/><text x="395" y="55" text-anchor="middle" class="svg-ink" font-size="13">preview</text><text x="395" y="73" text-anchor="middle" class="svg-muted" font-size="12">read the deletes</text>
<rect x="485" y="30" width="130" height="56" rx="8" fill="#bbf7d0"/><text x="550" y="55" text-anchor="middle" class="svg-ink" font-size="13">install</text><text x="550" y="73" text-anchor="middle" class="svg-muted" font-size="12">new revision</text>
<rect x="175" y="124" width="285" height="52" rx="8" fill="#fed7aa"/><text x="317" y="147" text-anchor="middle" class="svg-ink" font-size="13">emergency local change</text><text x="317" y="165" text-anchor="middle" class="svg-muted" font-size="12">then import, review, close ticket</text>
<line x1="150" y1="58" x2="175" y2="58" stroke="#64748b" stroke-width="2"/><line x1="305" y1="58" x2="330" y2="58" stroke="#64748b" stroke-width="2"/><line x1="460" y1="58" x2="485" y2="58" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The normal path on top; the emergency path below must rejoin it.</p></div>

<h3>Limiting local changes</h3>
<p>You cannot audit what you cannot limit. These measures belong to the FortiGate side and to your process, and the simulator only models part of them, so read this section as practice, not as lab steps.</p>
<ul>
<li><b>Few local administrators.</b> Give most people read-only admin profiles on the FortiGate, and restrict login sources with trusted hosts. In the real product this is ordinary admin configuration.</li>
<li><b>A written emergency rule.</b> Who may type locally, when, and what they must do afterwards: tell the team, raise a ticket, and make sure the change reaches FortiManager and a package.</li>
<li><b>A named time window</b> for installs, so that everyone knows when policy tables are replaced.</li>
<li><b>A review habit.</b> Someone checks the status board for conf out of sync every day.</li>
</ul>

<h3>allow-push-configuration: a different switch</h3>
<p>On the FortiGate, <code>config system central-management</code> has the setting <code>allow-push-configuration</code>. When it is disabled, the FortiGate refuses configuration pushed from FortiManager. Look at what happens in the lab after the setting is changed on MDU-FGT.</p>
<pre class="code"><span class="c">! on MDU-FGT</span>
config system central-management
  set allow-push-configuration disable
end
<span class="c">! on FMG-1</span>
execute fmgui install-package Kaveri Branch-PP MDU-FGT</pre>
<pre class="out"><span class="hl">Install failed: MDU-FGT does not accept configuration changes from FortiManager (allow-push-configuration is disabled).</span></pre>
<p>This switch protects the FortiGate <b>from FortiManager</b>. It does not stop anyone typing on the FortiGate, and it does not make the device immune to drift: the opposite, a device that refuses pushes can only drift further. It is useful in a freeze or during an investigation, when you want to be sure that no central install touches the device. A failed install leaves the revision history unchanged, so the evidence stays as it was.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri Retail agrees: planned changes on Tuesday and Thursday nights from 22:00. On Tuesday afternoon the Trichy ISP link fails, and the on-call engineer types a static policy on TRY-FGT. Rule: within one hour she tells the team and opens a ticket. On Wednesday the team reads the auto update revision, diffs it, imports the policy into a package and installs it in the Thursday window. The emergency change became a managed one without any outage.</p></div>

<h3>Backups and rollback thinking</h3>
<p>A <b>rollback</b> means going back to a known good state. The question is always the same: what is my known good state, and where is it stored? In FortiManager the answer has layers.</p>
<ul>
<li><b>The revision history</b> is the first layer: every install and every takeover is saved. In the real product you can revert a device to an older revision. <b>Revert is not modelled in the simulator</b>, so treat it as theory here.</li>
<li><b>The packages themselves.</b> If packages are versioned by name (Branch-PP, then Branch-PP-v2), reinstalling the old package is a rollback you can practise. Check the preview first, because it will also delete local policies.</li>
<li><b>Backups outside FortiManager.</b> In the real product you back up the FortiManager configuration and the FortiGate configurations on a schedule. The simulator has no backup feature; this is theory.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Using allow-push-configuration as a lock against local administrators. Having an emergency rule that nobody follows afterwards. Believing that a revision means a backup: revisions live on FortiManager, so if FortiManager is lost, they are lost too. Rolling back without reading the preview.</p></div>

<div class="exam"><p><b>Exam traps.</b> allow-push-configuration disable blocks pushes from FortiManager; it does not block local edits. A refused install does not change the revision history. Revisions are not a replacement for external backups. Revert exists in the real product, not in this simulator.</p></div>

<div class="scn"><h4>The freeze that hid a change</h4><p>A bank branch network went into a change freeze for a festival week. The security team disabled push on all branch FortiGates to be safe. During the week an engineer fixed a routing issue locally on one device. Because no installs were possible, nobody noticed the conf out of sync marker until the freeze ended, and the first install then raised a question about the unexplained auto update revision. The diff showed the fix in a minute, and the team imported it.</p><p><b>Lesson:</b> a freeze stops pushes, not people. Keep watching conf during a freeze.</p></div>

<div class="iv"><p class="q">"How do you control changes on a FortiManager-managed estate and plan a rollback?"</p><p>Planned changes go through packages with a ticket, a preview and an install window. Local changes are allowed only as a documented emergency and are imported afterwards. For rollback I rely on the revision history, versioned packages and external backups, and I explain that revert exists in the product but I always read the preview first.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Planned changes go through FortiManager; emergencies are local, rare and must be brought back.</li>
<li>Limit local access with admin profiles, trusted hosts and a written emergency rule.</li>
<li>allow-push-configuration disable stops FortiManager pushes, not local edits.</li>
<li>Revisions help rollback but are not a backup; revert is theory in this simulator.</li>
<li>Watch conf out of sync daily, even during a freeze.</li>
</ul></div>
`,hi:`
<p>Hospital dawai ko locked cupboard mein rakhta hai. Nurses wahi le sakti hain jo doctor ne likha, ek register hota hai, aur sachche emergency ke liye ek sealed box hota hai jise sirf ek senior vyakti khol sakta hai, jise likhna padta hai kyun. Rules hospital ko slow karne ke liye nahi hote; ye pakka karte hain ki kuch galat ho to koi jaane ki kya nikala gaya, kisne aur kyun. Firewalls ka change control bhi yahi idea hai.</p>

<h3>Do kism ke change</h3>
<p>FortiManager ke saath managed FortiGate badalne ke do jaayaz tareeke hain. <b>Planned change</b> FortiManager mein hota hai (objects, packages, templates), preview hota hai aur install hota hai. <b>Emergency change</b> locally type hota hai kyunki FortiManager tak pahunch nahi sakte ya problem ruk nahi sakti. Pehla norm hai. Doosra rare, announced hona chahiye aur baad mein central control mein wapas aana chahiye. Baaki sab, koi "quick fix" jo kisi ne record nahi kiya, drift hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Change-control flow">
<rect x="20" y="30" width="130" height="56" rx="8" fill="#bae6fd"/><text x="85" y="55" text-anchor="middle" class="svg-ink" font-size="13">request</text><text x="85" y="73" text-anchor="middle" class="svg-muted" font-size="12">ticket + window</text>
<rect x="175" y="30" width="130" height="56" rx="8" fill="#ddd6fe"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="13">FMG mein edit</text><text x="240" y="73" text-anchor="middle" class="svg-muted" font-size="12">package, object</text>
<rect x="330" y="30" width="130" height="56" rx="8" fill="#fde68a"/><text x="395" y="55" text-anchor="middle" class="svg-ink" font-size="13">preview</text><text x="395" y="73" text-anchor="middle" class="svg-muted" font-size="12">deletes padho</text>
<rect x="485" y="30" width="130" height="56" rx="8" fill="#bbf7d0"/><text x="550" y="55" text-anchor="middle" class="svg-ink" font-size="13">install</text><text x="550" y="73" text-anchor="middle" class="svg-muted" font-size="12">nayi revision</text>
<rect x="175" y="124" width="285" height="52" rx="8" fill="#fed7aa"/><text x="317" y="147" text-anchor="middle" class="svg-ink" font-size="13">emergency local change</text><text x="317" y="165" text-anchor="middle" class="svg-muted" font-size="12">phir import, review, ticket band</text>
<line x1="150" y1="58" x2="175" y2="58" stroke="#64748b" stroke-width="2"/><line x1="305" y1="58" x2="330" y2="58" stroke="#64748b" stroke-width="2"/><line x1="460" y1="58" x2="485" y2="58" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Upar normal raasta; neeche ka emergency raasta wapas usi mein judna chahiye.</p></div>

<h3>Local changes ko limit karna</h3>
<p>Jise limit nahi kar sakte, use audit nahi kar sakte. Ye measures FortiGate side aur aapke process ke hain, aur simulator inka sirf ek hissa model karta hai, isliye is section ko practice samjho, lab steps nahi.</p>
<ul>
<li><b>Kam local administrators.</b> Zyadatar logon ko FortiGate par read-only admin profiles do, aur trusted hosts se login sources restrict karo. Real product mein ye normal admin configuration hai.</li>
<li><b>Likha hua emergency rule.</b> Kaun locally type kar sakta hai, kab, aur baad mein kya karna hai: team ko batana, ticket kholna, aur ye pakka karna ki change FortiManager aur package tak pahunche.</li>
<li><b>Naam wali time window</b> installs ke liye, taaki sabko pata ho policy tables kab replace hoti hain.</li>
<li><b>Review ki aadat.</b> Koi roz status board par conf out of sync check kare.</li>
</ul>

<h3>allow-push-configuration: alag switch</h3>
<p>FortiGate par <code>config system central-management</code> mein setting <code>allow-push-configuration</code> hoti hai. Disable ho to FortiGate FortiManager se pushed configuration refuse karta hai. Dekho lab mein MDU-FGT par setting badalne ke baad kya hota hai.</p>
<pre class="code"><span class="c">! on MDU-FGT</span>
config system central-management
  set allow-push-configuration disable
end
<span class="c">! on FMG-1</span>
execute fmgui install-package Kaveri Branch-PP MDU-FGT</pre>
<pre class="out"><span class="hl">Install failed: MDU-FGT does not accept configuration changes from FortiManager (allow-push-configuration is disabled).</span></pre>
<p>Ye switch FortiGate ko <b>FortiManager se</b> bachata hai. Ye FortiGate par type karne wale ko nahi rokta, aur device ko drift se immune nahi banata: ulta, jo device push refuse karta hai wo aur drift kar sakta hai. Freeze mein ya investigation ke dauran kaam aata hai, jab aap pakka karna chahte ho ki koi central install device ko na chhue. Failed install revision history ko unchanged chhodta hai, isliye evidence jaisa tha waisa rehta hai.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri Retail tay karta hai: planned changes mangal aur guruwar raat 22:00 se. Mangalwar dopahar Trichy ISP link fail hota hai, aur on-call engineer TRY-FGT par static policy type karti hai. Rule: ek ghante mein team ko batana aur ticket kholna. Budhwar ko team auto update revision padhti hai, diff karti hai, policy ko package mein import karti hai aur guruwar ki window mein install karti hai. Emergency change bina outage ke managed change ban gayi.</p></div>

<h3>Backups aur rollback ki soch</h3>
<p><b>Rollback</b> matlab known good state par wapas jana. Sawal hamesha ek hi hai: meri known good state kya hai, aur kahan stored hai? FortiManager mein jawab ki parten hain.</p>
<ul>
<li><b>Revision history</b> pehli parat hai: har install aur har takeover save hota hai. Real product mein device ko purani revision par revert kar sakte ho. <b>Revert simulator mein model nahi hai</b>, isliye ise yahan theory maano.</li>
<li><b>Packages khud.</b> Agar packages naam se versioned hain (Branch-PP, phir Branch-PP-v2), to purana package dobara install karna aisa rollback hai jo practice kar sakte ho. Pehle preview dekho, kyunki wo local policies bhi delete karega.</li>
<li><b>FortiManager ke bahar backups.</b> Real product mein FortiManager configuration aur FortiGate configurations ka schedule par backup lete ho. Simulator mein backup feature nahi hai; ye theory hai.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> allow-push-configuration ko local administrators ke khilaf lock ki tarah use karna. Emergency rule hona jise baad mein koi follow nahi karta. Revision ko backup maan lena: revisions FortiManager par rehti hain, FortiManager kho jaye to wo bhi kho jati hain. Preview padhe bina rollback karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> allow-push-configuration disable FortiManager ke pushes rokta hai; local edits nahi. Refused install revision history nahi badalta. Revisions external backups ka replacement nahi hain. Revert real product mein hai, is simulator mein nahi.</p></div>

<div class="scn"><h4>Freeze jisne change chhupa liya</h4><p>Ek bank branch network festival week ke liye change freeze mein gaya. Security team ne safe rehne ke liye sab branch FortiGates par push disable kar diya. Hafte ke dauran ek engineer ne ek device par routing issue locally theek kiya. Install ho hi nahi sakte the, isliye freeze khatam hone tak kisi ne conf out of sync marker notice nahi kiya, aur pehle install ne unexplained auto update revision par sawal uthaya. Diff ne ek minute mein fix dikha diya, aur team ne use import kar liya.</p><p><b>Lesson:</b> freeze pushes rokta hai, logon ko nahi. Freeze mein bhi conf dekhte raho.</p></div>

<div class="iv"><p class="q">"FortiManager-managed estate par changes kaise control karoge aur rollback kaise plan karoge?"</p><p>Planned changes packages ke through ticket, preview aur install window ke saath. Local changes sirf documented emergency ki tarah, aur baad mein import. Rollback ke liye revision history, versioned packages aur external backups par bharosa, aur batata hoon ki revert product mein hai par main hamesha pehle preview padhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Planned changes FortiManager se; emergencies local, rare aur wapas laane layak.</li>
<li>Admin profiles, trusted hosts aur likhe emergency rule se local access limit karo.</li>
<li>allow-push-configuration disable FortiManager pushes rokta hai, local edits nahi.</li>
<li>Revisions rollback mein madad karti hain par backup nahi; revert is simulator mein theory hai.</li>
<li>Freeze mein bhi roz conf out of sync dekho.</li>
</ul></div>
`}};export{e as default};