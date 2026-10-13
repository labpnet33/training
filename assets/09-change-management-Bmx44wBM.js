var e={id:`change-management`,h:{en:`Maintenance and change management: backup, commit, rollback, staged rollout`,hi:`Maintenance aur change management: backup, commit, rollback, staged rollout`},body:{en:`
<p>Airlines do not let a pilot decide on the runway to try a new procedure. Changes are planned, checked by a second person, tested on a simulator, and introduced one aircraft at a time. Network changes deserve the same respect, because the number-one cause of outages is not hardware or carriers; it is <b>our own changes</b>. The capstone lab in this module is literally a "rushed change" that broke three layers. This chapter gives you the habits that prevent such incidents and the tools that limit the damage when they happen anyway.</p>

<h3>The change lifecycle</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Change lifecycle">
<rect x="8" y="40" width="94" height="52" rx="8" fill="#bae6fd"/><text x="55" y="70" text-anchor="middle" class="svg-ink" font-size="12">Plan</text>
<rect x="116" y="40" width="94" height="52" rx="8" fill="#bae6fd"/><text x="163" y="64" text-anchor="middle" class="svg-ink" font-size="12">Back up</text><text x="163" y="80" text-anchor="middle" class="svg-muted" font-size="11">and review</text>
<rect x="224" y="40" width="94" height="52" rx="8" fill="#ddd6fe"/><text x="271" y="64" text-anchor="middle" class="svg-ink" font-size="12">Compare</text><text x="271" y="80" text-anchor="middle" class="svg-muted" font-size="11">show | compare</text>
<rect x="332" y="40" width="94" height="52" rx="8" fill="#fde68a"/><text x="379" y="70" text-anchor="middle" class="svg-ink" font-size="12">Commit</text>
<rect x="440" y="40" width="94" height="52" rx="8" fill="#bbf7d0"/><text x="487" y="70" text-anchor="middle" class="svg-ink" font-size="12">Verify</text>
<rect x="548" y="40" width="84" height="52" rx="8" fill="#e2e8f0"/><text x="590" y="64" text-anchor="middle" class="svg-ink" font-size="12">Record or</text><text x="590" y="80" text-anchor="middle" class="svg-ink" font-size="12">roll back</text>
<line x1="102" y1="66" x2="116" y2="66" stroke="#64748b" stroke-width="2"/><line x1="210" y1="66" x2="224" y2="66" stroke="#64748b" stroke-width="2"/><line x1="318" y1="66" x2="332" y2="66" stroke="#64748b" stroke-width="2"/><line x1="426" y1="66" x2="440" y2="66" stroke="#64748b" stroke-width="2"/><line x1="534" y1="66" x2="548" y2="66" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">If Verify fails, go straight to rollback; investigate afterwards</text>
</svg><p class="cap">Every step has a purpose. The rushed change skips Back up, Compare and Verify.</p></div>

<h3>Candidate configuration, compare, commit, rollback</h3>
<p>The VOS CLI (real and course) uses a <b>candidate configuration</b>: your edits sit in a draft until you <code>commit</code>. The draft can be inspected and discarded. This is your safety net, if you use it.</p>
<pre class="code"><span class="c">! step by step on Branch2</span>
admin@Branch2-cli&gt; configure
admin@Branch2-cli% set orgs org Acme sd-wan wan-interfaces vni-0/1 transport MPLS
admin@Branch2-cli% show | compare
admin@Branch2-cli% commit
<span class="c">! changed your mind before commit? throw the draft away</span>
admin@Branch2-cli% rollback
admin@Branch2-cli% exit</pre>
<dl class="terms">
<dt>show | compare</dt><dd>Prints the difference between running and candidate configuration. Read it every time: it catches the extra line you did not mean to type.</dd>
<dt>commit</dt><dd>Validates and applies the candidate. In the course model a commit with an invalid statement is refused with an error.</dd>
<dt>rollback</dt><dd>In the course CLI it discards the candidate changes. In real VOS there are also ways to return to previous committed versions and a timed commit that reverts by itself if you lose access; check your release documentation for the exact commands.</dd>
</dl>

<h3>Backups</h3>
<p>Before any non-trivial change save the running configuration: <code>show configuration</code> output saved to a file, or the Director's own backup and device snapshot features. A backup is useful only if you know where it is and have tested restoring from it. Name it with date, device and ticket number. For template-based branches, the <b>template and bind data in the Director</b> are the source of truth; remember from the onboarding module that lines pushed by a template are read-only on the branch, so a branch-local edit of such a line is not possible and the change must be made in the template.</p>

<h3>Staged rollouts</h3>
<p>The blast radius of a change is the number of sites it can hurt. A template change applied to the device group BRANCHES (template BR-DUAL) reaches every branch at once. Reduce the blast radius:</p>
<ol>
<li><b>Pilot.</b> Apply to one low-risk site first (a lab branch or the smallest office).</li>
<li><b>Observe.</b> Wait a defined time, run the verification list, watch dashboards.</li>
<li><b>Wave.</b> Move to 10 percent, then 50 percent, then all. Pause automatically if an alarm fires.</li>
<li><b>Have an exit.</b> Know how you will go back before you start: previous template revision, saved config, or the delete of the added statement.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> Change request: shorten the VOICE SLA latency from 150 ms to 100 ms. Risk: with Internet at 30 ms nothing moves, but LTE at 60 ms still passes while a congested MPLS at 110 ms would now fail and voice would shift to another transport. Plan: pilot on Delhi at 22:00, verify <code>show orgs org Acme sd-wan sla-monitor status</code> and path-selection for voice, observe for one hour, then roll to Bengaluru and Kolkata. Exit: <code>set orgs org-services Acme sd-wan sla-profiles VOICE latency 150</code> returns the old value. Notice that the exit command was written before the change.</p></div>

<h3>Software upgrades at concept level</h3>
<p>Upgrading VOS, the Director, Controller or Analytics follows the same discipline with extra rules. Read the release notes and compatibility between components (the Director and Controller versions must be compatible with the branch software, and the order matters: headend first, branches afterwards is the common pattern, but follow the vendor guide for your release). Back up before. Upgrade a pilot branch, verify tunnels, BGP, policy and logs, then wave the rest. Schedule in a maintenance window agreed with the business, announce it, and keep a rollback plan including the previous image. Never upgrade both devices of an HA pair at once.</p>

<h3>Change records</h3>
<p>Each change gets a record: what, why, who approved, when, expected impact, test plan, rollback plan, result. In an incident this record is the first thing you read, because "what changed recently" explains most faults. Analytics and the Director also keep audit trails of who did what; correlate them with chart steps (chapter 3).</p>

<div class="warn"><p><b>Common mistakes.</b> Committing without reading the compare; editing a template that feeds all branches directly in production; no exit plan; mixing unrelated changes in one window; skipping the pilot "because it is a small change"; forgetting to tell the service desk.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>rollback</code> before commit discards the draft, it does not undo a committed change. After a commit you need a previous version, a saved config, or a corrective change. Also remember that a Director template change is pushed to many devices, so its blast radius is the whole device group.</p></div>

<div class="scn"><h4>The ten-minute change that took the site down</h4><p>An engineer edited three things on a branch in one commit at the end of a long shift: a static route, a transport mapping and a policy match. A typo in the route and a missing mapping isolated the branch, and the policy edit matched the wrong application. Nobody had saved the old config. It took ninety minutes to reconstruct. The same work, done as three small commits with a compare and a verification after each, would have been found and undone in minutes.</p><p><b>Lesson:</b> small steps, compare, verify, and keep an exit.</p></div>

<div class="iv"><p class="q">"How do you make a risky change safely?"</p><p>Plan with an approved record, back up the config, make the change in the candidate, read show | compare, commit, verify with a defined test list, pilot on one site then roll out in waves, and have a rollback ready before you start. Mention that you change one thing at a time.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Most outages come from our own changes, so control them.</li>
<li>Use candidate config, show | compare, commit, verify, and keep a backup and an exit.</li>
<li>Reduce blast radius with a pilot and staged waves; templates reach whole groups.</li>
<li>Upgrades follow the same discipline: compatibility, backup, pilot, waves, window.</li>
<li>Keep change records: they are the first clue in the next incident.</li>
</ul></div>
`,hi:`
<p>Airlines pilot ko runway par naya procedure try karne nahi deti. Changes plan hote hain, doosra vyakti check karta hai, simulator par test hote hain, aur ek aircraft par ek ek karke introduce hote hain. Network changes ko bhi yahi izzat milni chahiye, kyunki outages ka number-one cause hardware ya carriers nahi, <b>hamare apne changes</b> hain. Is module ka capstone lab literally ek "rushed change" hai jisne teen layers tod di. Ye chapter wo habits deta hai jo aise incidents roke aur wo tools jo phir bhi hone par damage kam karein.</p>

<h3>Change lifecycle</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Change lifecycle">
<rect x="8" y="40" width="94" height="52" rx="8" fill="#bae6fd"/><text x="55" y="70" text-anchor="middle" class="svg-ink" font-size="12">Plan</text>
<rect x="116" y="40" width="94" height="52" rx="8" fill="#bae6fd"/><text x="163" y="64" text-anchor="middle" class="svg-ink" font-size="12">Back up</text><text x="163" y="80" text-anchor="middle" class="svg-muted" font-size="11">aur review</text>
<rect x="224" y="40" width="94" height="52" rx="8" fill="#ddd6fe"/><text x="271" y="64" text-anchor="middle" class="svg-ink" font-size="12">Compare</text><text x="271" y="80" text-anchor="middle" class="svg-muted" font-size="11">show | compare</text>
<rect x="332" y="40" width="94" height="52" rx="8" fill="#fde68a"/><text x="379" y="70" text-anchor="middle" class="svg-ink" font-size="12">Commit</text>
<rect x="440" y="40" width="94" height="52" rx="8" fill="#bbf7d0"/><text x="487" y="70" text-anchor="middle" class="svg-ink" font-size="12">Verify</text>
<rect x="548" y="40" width="84" height="52" rx="8" fill="#e2e8f0"/><text x="590" y="64" text-anchor="middle" class="svg-ink" font-size="12">Record ya</text><text x="590" y="80" text-anchor="middle" class="svg-ink" font-size="12">roll back</text>
<line x1="102" y1="66" x2="116" y2="66" stroke="#64748b" stroke-width="2"/><line x1="210" y1="66" x2="224" y2="66" stroke="#64748b" stroke-width="2"/><line x1="318" y1="66" x2="332" y2="66" stroke="#64748b" stroke-width="2"/><line x1="426" y1="66" x2="440" y2="66" stroke="#64748b" stroke-width="2"/><line x1="534" y1="66" x2="548" y2="66" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Verify fail ho to seedha rollback; investigation baad mein</text>
</svg><p class="cap">Har step ka purpose hai. Rushed change Back up, Compare aur Verify skip karta hai.</p></div>

<h3>Candidate configuration, compare, commit, rollback</h3>
<p>VOS CLI (real aur course) <b>candidate configuration</b> use karta hai: aapke edits draft mein rehte hain jab tak <code>commit</code> na karo. Draft ko inspect aur discard kiya ja sakta hai. Ye aapka safety net hai, agar aap use karo.</p>
<pre class="code"><span class="c">! Branch2 par step by step</span>
admin@Branch2-cli&gt; configure
admin@Branch2-cli% set orgs org Acme sd-wan wan-interfaces vni-0/1 transport MPLS
admin@Branch2-cli% show | compare
admin@Branch2-cli% commit
<span class="c">! commit se pehle mann badal gaya? draft phenk do</span>
admin@Branch2-cli% rollback
admin@Branch2-cli% exit</pre>
<dl class="terms">
<dt>show | compare</dt><dd>Running aur candidate configuration ka difference print karta hai. Har baar padho: ye wo extra line pakad leta hai jo aapne type karne ka irada nahi kiya tha.</dd>
<dt>commit</dt><dd>Candidate ko validate karke apply karta hai. Course model mein invalid statement wala commit error ke saath refuse hota hai.</dd>
<dt>rollback</dt><dd>Course CLI mein candidate changes discard karta hai. Real VOS mein pichhle committed versions par wapas jane ke tareeke aur timed commit bhi hote hain jo access chali jaye to khud revert hota hai; exact commands ke liye apni release ki documentation dekho.</dd>
</dl>

<h3>Backups</h3>
<p>Kisi bhi non-trivial change se pehle running configuration save karo: <code>show configuration</code> output file mein, ya Director ke apne backup aur device snapshot features. Backup tabhi kaam ka hai jab aapko pata ho wo kahan hai aur aapne restore test kiya ho. Naam mein date, device aur ticket number rakho. Template-based branches ke liye Director mein <b>template aur bind data</b> source of truth hain; onboarding module se yaad rakho ki template se push hui lines branch par read-only hoti hain, isliye aisi line ka branch-local edit possible nahi aur change template mein karna padta hai.</p>

<h3>Staged rollouts</h3>
<p>Change ka blast radius wo sites ki ginti hai jinhe wo hurt kar sakta hai. Device group BRANCHES (template BR-DUAL) par lagaya template change ek saath har branch tak pahunchta hai. Blast radius kam karo:</p>
<ol>
<li><b>Pilot.</b> Pehle ek low-risk site par lagao (lab branch ya sabse chhota office).</li>
<li><b>Observe.</b> Defined time wait karo, verification list chalao, dashboards dekho.</li>
<li><b>Wave.</b> 10 percent, phir 50 percent, phir sab. Alarm fire ho to automatically pause karo.</li>
<li><b>Exit rakho.</b> Shuru karne se pehle jaano ki wapas kaise jaoge: pichhli template revision, saved config, ya joda hua statement delete.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> Change request: VOICE SLA latency 150 ms se 100 ms karna. Risk: Internet 30 ms par kuch nahi hilta, LTE 60 ms abhi bhi pass hota hai, lekin congested MPLS 110 ms par ab fail hoga aur voice doosre transport par shift hogi. Plan: Delhi par 22:00 baje pilot, <code>show orgs org Acme sd-wan sla-monitor status</code> aur voice ka path-selection verify, ek ghanta observe, phir Bengaluru aur Kolkata. Exit: <code>set orgs org-services Acme sd-wan sla-profiles VOICE latency 150</code> purani value wapas deta hai. Dhyan do ki exit command change se pehle likha gaya.</p></div>

<h3>Software upgrades concept level par</h3>
<p>VOS, Director, Controller ya Analytics ka upgrade bhi wahi discipline follow karta hai, kuch extra rules ke saath. Release notes aur components ke beech compatibility padho (Director aur Controller versions branch software ke saath compatible hone chahiye, aur order matter karta hai: aam pattern headend pehle, branches baad mein, lekin apni release ki vendor guide follow karo). Pehle backup. Pilot branch upgrade karo, tunnels, BGP, policy aur logs verify karo, phir baaki waves mein. Business ke saath agreed maintenance window mein schedule karo, announce karo, aur pichhli image samet rollback plan rakho. HA pair ke dono devices ek saath kabhi upgrade mat karo.</p>

<h3>Change records</h3>
<p>Har change ka record hota hai: kya, kyun, kisne approve kiya, kab, expected impact, test plan, rollback plan, result. Incident mein ye record sabse pehle padhte hain kyunki "haal mein kya badla" zyadatar faults explain karta hai. Analytics aur Director audit trails bhi rakhte hain ki kisne kya kiya; unhe chart steps se correlate karo (chapter 3).</p>

<div class="warn"><p><b>Common mistakes.</b> Compare padhe bina commit; sab branches ko feed karne wale template ko production mein seedha edit karna; exit plan na hona; ek window mein unrelated changes mix karna; "chhota change hai" kehkar pilot skip karna; service desk ko batana bhool jana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Commit se pehle <code>rollback</code> draft discard karta hai, committed change undo nahi karta. Commit ke baad pichhla version, saved config ya corrective change chahiye. Ye bhi yaad rakho ki Director template change bahut se devices ko push hota hai, isliye uska blast radius poora device group hai.</p></div>

<div class="scn"><h4>Das minute ka change jisne site gira di</h4><p>Ek engineer ne lambi shift ke aakhir mein ek branch par ek commit mein teen cheezein edit kin: static route, transport mapping aur policy match. Route mein typo aur missing mapping ne branch isolate kar di, aur policy edit ne galat application match kiya. Kisi ne purani config save nahi ki thi. Reconstruct karne mein nabbe minute lage. Wahi kaam teen chhote commits mein, har ek ke baad compare aur verification ke saath hota to minutes mein pakda aur undo kiya ja sakta tha.</p><p><b>Lesson:</b> chhote steps, compare, verify, aur exit rakho.</p></div>

<div class="iv"><p class="q">"Risky change safely kaise karte ho?"</p><p>Approved record ke saath plan, config backup, candidate mein change, show | compare padho, commit, defined test list se verify, pehle ek site par pilot phir waves mein rollout, aur shuru karne se pehle rollback ready. Batao ki aap ek time par ek cheez badalte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zyadatar outages hamare apne changes se aate hain, isliye unhe control karo.</li>
<li>Candidate config, show | compare, commit, verify use karo, aur backup aur exit rakho.</li>
<li>Pilot aur staged waves se blast radius kam karo; templates poore groups tak pahunchte hain.</li>
<li>Upgrades wahi discipline follow karte hain: compatibility, backup, pilot, waves, window.</li>
<li>Change records rakho: agle incident mein wahi pehla clue hain.</li>
</ul></div>
`}};export{e as default};