var e={id:`postmortems-and-change-control`,h:{en:`Postmortems and change control`,hi:`Postmortems aur change control`},body:{en:`
<h3>Two ends of the same loop</h3>
<p>Most incidents start with a change, and the best incident reviews end with a better change process. Change control is the seat belt; the postmortem is the investigation after a crash that makes the next car safer. Together they turn pain into learning.</p>

<h3>Change control: make the change boring</h3>
<p>A <b>change</b> is any deliberate edit to production: an alert threshold, a polling credential, a route, a probe. In the console the safety net is built in: edits go to a candidate, you see an "after Apply" preview, and Apply writes an entry to the audit log. A good process adds human steps around that:</p>
<ol>
<li><b>Request:</b> what, why, who, which devices and sites.</li>
<li><b>Risk and impact:</b> what could break, who will notice, how long.</li>
<li><b>Plan with a rollback:</b> the exact steps and the exact undo. A change without a rollback is a gamble.</li>
<li><b>Window and approval:</b> a time when impact is smallest, approved by an owner.</li>
<li><b>Pre-checks:</b> capture the current state (poll states, probe verdicts, counts of notifications and flows).</li>
<li><b>Execute</b> one step at a time.</li>
<li><b>Post-checks:</b> the same checks as before, plus user-level evidence.</li>
<li><b>Close or roll back:</b> decide by data, not feeling.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Change control loop">
<rect x="10" y="30" width="110" height="55" rx="9" fill="#bae6fd"/><text x="65" y="62" text-anchor="middle" class="svg-ink" font-size="12">Plan + rollback</text>
<rect x="140" y="30" width="110" height="55" rx="9" fill="#fde68a"/><text x="195" y="62" text-anchor="middle" class="svg-ink" font-size="12">Pre-checks</text>
<rect x="270" y="30" width="110" height="55" rx="9" fill="#fed7aa"/><text x="325" y="62" text-anchor="middle" class="svg-ink" font-size="12">Change, Apply</text>
<rect x="400" y="30" width="110" height="55" rx="9" fill="#bbf7d0"/><text x="455" y="62" text-anchor="middle" class="svg-ink" font-size="12">Post-checks</text>
<rect x="530" y="30" width="100" height="55" rx="9" fill="#ddd6fe"/><text x="580" y="62" text-anchor="middle" class="svg-ink" font-size="12">Close / undo</text>
<g stroke="#64748b" stroke-width="2"><line x1="120" y1="57" x2="140" y2="57"/><line x1="250" y1="57" x2="270" y2="57"/><line x1="380" y1="57" x2="400" y2="57"/><line x1="510" y1="57" x2="530" y2="57"/></g>
<path d="M455 85 L455 125 L325 125 L325 85" fill="none" stroke="#ea5d0c" stroke-width="2" stroke-dasharray="5 4"/>
<text x="390" y="145" text-anchor="middle" class="svg-accent" font-size="12">post-checks fail: roll back</text>
</svg><p class="cap">Plan, check, change, check, close; roll back if the second check fails.</p></div>

<h3>Why the weekend changes bite</h3>
<p>Weekend and night changes are popular because nobody is working, which is also why nobody notices a broken monitor until Monday. The fix is not to ban them. It is to require post-checks that include the monitoring itself: after any change, confirm every target still polls, logs still arrive from every router and flows still reach the collector. A change that blinds you is an incident that starts later.</p>

<h3>Maintenance silences and alert changes</h3>
<p>Planned work should silence the expected alerts for a stated window and then restore them. Alert changes are also changes: tuning a threshold or a route should have a request, a preview screenshot (the before and after counts of notifications and pages) and an owner. If a route edit leaves the pager route without critical severity, the next page goes nowhere. Pre-checks and post-checks catch that.</p>

<h3>The blameless postmortem</h3>
<p>A <b>postmortem</b> is a written review after an incident. <b>Blameless</b> means the question is "how did our system allow this?" and not "who did it?". People who fear punishment hide information; people who feel safe tell you the whole story, including the near misses. Humans make errors; a robust process makes errors cheap to catch.</p>
<table class="cmp"><tr><th>Section</th><th>Content</th></tr>
<tr><td>Summary</td><td>Two sentences: what happened, who was affected, how long</td></tr>
<tr><td>Impact</td><td>Sites, users, services, duration, any SLO or error budget used</td></tr>
<tr><td>Timeline</td><td>Detect, triage, mitigate, fix, verify, with clock times from the scribe</td></tr>
<tr><td>Root cause and contributing factors</td><td>The trigger, and the conditions that let it hurt (no pre-check, no alert, no runbook)</td></tr>
<tr><td>What went well, what went badly, where we were lucky</td><td>Honest list</td></tr>
<tr><td>Action items</td><td>Each with an owner and a date; fewer and sharper is better</td></tr>
</table>
<pre class="out">Postmortem: Kochi ERP slow, 10:00 to 10:42
Detect      10:00 latency rule (warning) to chat      <span class="hl">time to detect: 3 min</span>
Mitigate    10:18 ERP moved to backup path            time to mitigate: 18 min
Fix         11:30 provider repaired handoff card
Verify      10:42 p-erp back to 41 ms
Contributing: no probe on backup path; runbook missing
Actions: (1) probe backup path, owner Ravi, due Fri  (2) write runbook, owner Meena</pre>

<div class="note"><p><b>What does this change on the wire/policy?</b> A postmortem changes nothing by itself; its action items do, through the same change control. Typical outputs: a new probe (adds test packets), a threshold edit (changes who is notified) or a new pre-check item.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) A postmortem that names a guilty person. (2) Ten vague actions with no owner. (3) Treating the root cause as one single cause when there were several conditions. (4) Changes with no rollback plan. (5) Verification by "the alert cleared".</p></div>
<div class="exam"><p><b>Exam trap.</b> Blameless does not mean no accountability: it means focusing on system and process. Also, the rollback plan is part of the change request, written before the change, not invented during the outage.</p></div>

<div class="scn"><h4>The change that blinded Kochi</h4><p>Kabir Shah changed the SNMP community on R-KCH at night and forgot the console. For a day Kochi showed no data, and a real link problem went unseen. The postmortem was blameless: it found that the change template had no post-check for polling. The action items were a pre and post checklist (poll state, log source, flow exporter), an alert on "no data for a target", and a rule that every credential change updates both ends in one change.</p><p><b>Lesson:</b> improve the process, not the blame.</p></div>

<div class="iv"><p class="q">"What goes into a good postmortem, and what does blameless mean?"</p><p>Summary, impact, timeline, root cause and contributing factors, what went well and badly, and owned action items with dates. Blameless means we examine how the system and process allowed the failure, so people share facts freely and the fix targets the process.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Change control: plan with rollback, pre-check, change, post-check, close or undo.</li>
<li>Post-checks must include the monitoring itself: polls, logs, flows.</li>
<li>Silence expected alerts for planned work, and restore them.</li>
<li>Blameless review asks how the system allowed it, not who did it.</li>
<li>Action items need an owner and a date; verify by data.</li>
</ul></div>
`,hi:`
<h3>Ek hi loop ke do sire</h3>
<p>Zyadatar incidents kisi change se shuru hote hain, aur sabse achhe incident reviews behtar change process par khatam hote hain. Change control seat belt hai; postmortem crash ke baad ki jaanch hai jo agli gaadi ko safe banati hai. Dono milkar dard ko seekh mein badalte hain.</p>

<h3>Change control: change ko boring banao</h3>
<p><b>Change</b> production mein koi bhi soch-samajh kar kiya gaya edit hai: alert threshold, polling credential, route, probe. Console mein safety net built-in hai: edits candidate mein jaate hain, "after Apply" preview milta hai, aur Apply audit log mein entry likhta hai. Achha process uske aas paas insaani steps jodta hai:</p>
<ol>
<li><b>Request:</b> kya, kyun, kaun, kaun se devices aur sites.</li>
<li><b>Risk aur impact:</b> kya toot sakta hai, kise pata chalega, kitni der.</li>
<li><b>Rollback ke saath plan:</b> exact steps aur exact undo. Rollback ke bina change juaa hai.</li>
<li><b>Window aur approval:</b> aisa time jab impact sabse kam ho, owner se approved.</li>
<li><b>Pre-checks:</b> maujooda state capture karo (poll states, probe verdicts, notifications aur flows ki counts).</li>
<li><b>Execute</b> ek ek step karke.</li>
<li><b>Post-checks:</b> wahi checks, plus user-level evidence.</li>
<li><b>Close ya rollback:</b> data se decide karo, feeling se nahi.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Change control loop">
<rect x="10" y="30" width="110" height="55" rx="9" fill="#bae6fd"/><text x="65" y="62" text-anchor="middle" class="svg-ink" font-size="12">Plan + rollback</text>
<rect x="140" y="30" width="110" height="55" rx="9" fill="#fde68a"/><text x="195" y="62" text-anchor="middle" class="svg-ink" font-size="12">Pre-checks</text>
<rect x="270" y="30" width="110" height="55" rx="9" fill="#fed7aa"/><text x="325" y="62" text-anchor="middle" class="svg-ink" font-size="12">Change, Apply</text>
<rect x="400" y="30" width="110" height="55" rx="9" fill="#bbf7d0"/><text x="455" y="62" text-anchor="middle" class="svg-ink" font-size="12">Post-checks</text>
<rect x="530" y="30" width="100" height="55" rx="9" fill="#ddd6fe"/><text x="580" y="62" text-anchor="middle" class="svg-ink" font-size="12">Close / undo</text>
<g stroke="#64748b" stroke-width="2"><line x1="120" y1="57" x2="140" y2="57"/><line x1="250" y1="57" x2="270" y2="57"/><line x1="380" y1="57" x2="400" y2="57"/><line x1="510" y1="57" x2="530" y2="57"/></g>
<path d="M455 85 L455 125 L325 125 L325 85" fill="none" stroke="#ea5d0c" stroke-width="2" stroke-dasharray="5 4"/>
<text x="390" y="145" text-anchor="middle" class="svg-accent" font-size="12">post-checks fail: rollback</text>
</svg><p class="cap">Plan, check, change, check, close; doosra check fail ho to rollback.</p></div>

<h3>Weekend changes kyun kaatate hain</h3>
<p>Weekend aur raat ke changes popular hain kyunki koi kaam nahi kar raha, aur isi wajah se Monday tak kisi ko toota monitor nahi dikhta. Fix unhe ban karna nahi hai. Fix yeh hai ki post-checks mein monitoring khud shamil ho: har change ke baad confirm karo ki har target poll ho raha hai, har router se logs aa rahe hain aur flows collector tak pahunch rahe hain. Jo change aapko andha kar de woh incident hai jo der se shuru hota hai.</p>

<h3>Maintenance silences aur alert changes</h3>
<p>Planned kaam ko expected alerts ko batayi hui window ke liye silence karna chahiye aur phir restore karna chahiye. Alert changes bhi changes hain: threshold ya route tune karne ke liye request, preview screenshot (notifications aur pages ki before aur after counts) aur owner hona chahiye. Agar route edit pager route se critical severity hata de to agla page kahin nahi jaata. Pre-checks aur post-checks yeh pakad lete hain.</p>

<h3>Blameless postmortem</h3>
<p><b>Postmortem</b> incident ke baad likha gaya review hai. <b>Blameless</b> ka matlab hai ki sawal "hamara system isse kaise hone diya?" hai, "kisne kiya?" nahi. Jo log saza se darte hain woh information chhupate hain; jo safe mehsoos karte hain woh poori kahani batate hain, near misses samet. Insaan galtiyan karte hain; robust process galtiyon ko pakadna sasta bana deta hai.</p>
<table class="cmp"><tr><th>Section</th><th>Content</th></tr>
<tr><td>Summary</td><td>Do sentences: kya hua, kaun affected, kitni der</td></tr>
<tr><td>Impact</td><td>Sites, users, services, duration, kitna SLO ya error budget laga</td></tr>
<tr><td>Timeline</td><td>Detect, triage, mitigate, fix, verify, scribe ke clock times ke saath</td></tr>
<tr><td>Root cause aur contributing factors</td><td>Trigger, aur woh conditions jinhone use hurt karne diya (no pre-check, no alert, no runbook)</td></tr>
<tr><td>Kya achha gaya, kya bura, kahan kismat se bache</td><td>Imaandar list</td></tr>
<tr><td>Action items</td><td>Har ek ka owner aur date; kam aur dhaardaar behtar</td></tr>
</table>
<pre class="out">Postmortem: Kochi ERP slow, 10:00 to 10:42
Detect      10:00 latency rule (warning) to chat      <span class="hl">time to detect: 3 min</span>
Mitigate    10:18 ERP moved to backup path            time to mitigate: 18 min
Fix         11:30 provider repaired handoff card
Verify      10:42 p-erp back to 41 ms
Contributing: no probe on backup path; runbook missing
Actions: (1) probe backup path, owner Ravi, due Fri  (2) write runbook, owner Meena</pre>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Postmortem khud kuch nahi badalta; uske action items badalte hain, usi change control se. Typical outputs: naya probe (test packets jodta hai), threshold edit (kise notify karna badalta hai) ya naya pre-check item.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Aisa postmortem jo kisi doshi ka naam leta hai. (2) Dus vague actions bina owner ke. (3) Root cause ko ek single cause maanna jabki kai conditions thi. (4) Rollback plan ke bina changes. (5) "Alert clear ho gaya" se verification.</p></div>
<div class="exam"><p><b>Exam trap.</b> Blameless ka matlab no accountability nahi: ka matlab system aur process par focus. Yeh bhi: rollback plan change request ka hissa hai, change se pehle likha jaata hai, outage ke dauraan nahi banaya jaata.</p></div>

<div class="scn"><h4>Woh change jisne Kochi ko andha kar diya</h4><p>Kabir Shah ne raat ko R-KCH par SNMP community badli aur console bhool gaya. Ek din Kochi ka data nahi aaya, aur asli link problem dikhi hi nahi. Postmortem blameless tha: usne paaya ki change template mein polling ka post-check nahi tha. Action items the pre aur post checklist (poll state, log source, flow exporter), "target ka no data" par alert, aur rule ki har credential change dono ends ek hi change mein update kare.</p><p><b>Seekh:</b> process behtar karo, blame nahi.</p></div>

<div class="iv"><p class="q">"Achhe postmortem mein kya hota hai, aur blameless ka matlab kya hai?"</p><p>Summary, impact, timeline, root cause aur contributing factors, kya achha aur bura gaya, aur owner aur date ke saath action items. Blameless ka matlab hum dekhte hain ki system aur process ne failure kaise hone diya, taaki log facts khulke batayein aur fix process par ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Change control: rollback ke saath plan, pre-check, change, post-check, close ya undo.</li>
<li>Post-checks mein monitoring khud shamil ho: polls, logs, flows.</li>
<li>Planned kaam ke liye expected alerts silence karo, aur restore karo.</li>
<li>Blameless review poochta hai system ne kaise hone diya, kisne kiya nahi.</li>
<li>Action items ko owner aur date chahiye; data se verify karo.</li>
</ul></div>
`}};export{e as default};