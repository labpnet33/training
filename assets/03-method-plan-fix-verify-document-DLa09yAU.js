var e={id:`method-4-7`,h:{en:`The methodology, part 2: plan, implement, verify, document`,hi:`Methodology, part 2: plan, implement, verify, document`},body:{en:`
<p>You now know the cause of INC-4410: line 20 of ACL FLOOR3-IN on CORE1 denies TCP 443 from <b>any</b> source to the payroll server 10.20.30.40. The change author only wanted to block the contractor hot-desk range 10.3.30.192/26. Steps 4 to 7 are about fixing that <b>safely</b>, proving the fix, and leaving a record. Think of a surgeon: knowing what is wrong is not permission to start cutting without a plan.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Steps 4 to 7 with a rollback loop">
<rect x="10" y="40" width="130" height="56" rx="8" fill="#bae6fd"/><text x="75" y="64" text-anchor="middle" class="svg-ink" font-size="13">4 Plan</text><text x="75" y="82" text-anchor="middle" class="svg-muted" font-size="12">effects, rollback</text>
<rect x="170" y="40" width="130" height="56" rx="8" fill="#bae6fd"/><text x="235" y="64" text-anchor="middle" class="svg-ink" font-size="13">5 Implement</text><text x="235" y="82" text-anchor="middle" class="svg-muted" font-size="12">or escalate</text>
<rect x="330" y="40" width="130" height="56" rx="8" fill="#bbf7d0"/><text x="395" y="64" text-anchor="middle" class="svg-ink" font-size="13">6 Verify</text><text x="395" y="82" text-anchor="middle" class="svg-muted" font-size="12">+ prevention</text>
<rect x="490" y="40" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="560" y="64" text-anchor="middle" class="svg-ink" font-size="13">7 Document</text><text x="560" y="82" text-anchor="middle" class="svg-muted" font-size="12">findings, lessons</text>
<line x1="140" y1="68" x2="170" y2="68" stroke="#64748b"/><line x1="300" y1="68" x2="330" y2="68" stroke="#64748b"/><line x1="460" y1="68" x2="490" y2="68" stroke="#64748b"/>
<path d="M395 98 Q 315 140 235 98" fill="none" stroke="#64748b"/><text x="315" y="140" text-anchor="middle" class="svg-muted" font-size="12">verification fails: roll back, rethink</text>
</svg><p class="cap">If verification fails, you roll back and return to your theory. Documentation always comes last.</p></div>

<h3>Step 4: Establish a plan of action and identify potential effects</h3>
<p>The plan answers four questions: <b>what</b> exactly will you change, <b>when</b>, <b>who</b> must approve, and <b>what else could break</b>. The last one is the part people skip. Every change to a shared device can affect other users.</p>
<ul>
<li><b>Potential effects:</b> which other traffic crosses this ACL, interface or device? Will the change cause a link flap, an STP recalculation or a routing reconvergence?</li>
<li><b>Change management:</b> most companies need approval (a change advisory board, or an emergency change for a P1/P2).</li>
<li><b>Backup and rollback:</b> save the current config and write the exact commands to undo your change.</li>
<li><b>Timing and communication:</b> fix now or in a maintenance window? Tell the service desk and affected users.</li>
</ul>
<div class="eg"><p><b>Step 4 on INC-4410.</b> Plan: replace line 20 in place, using sequence numbers, so there is never a moment without a filter. Effects: contractors must stay blocked (that was the purpose of CHG-2291); no other line changes. Approval: emergency change ECHG-118, approved by the network lead because payroll runs today. Rollback: re-add the original line 20. Backup: <code>copy running-config flash:core1-pre-echg118.cfg</code>.</p></div>

<div class="warn"><p><b>A classic plan mistake.</b> Removing the whole ACL with <code>no ip access-list extended FLOOR3-IN</code> and typing it again. For a moment the interface refers to an empty or missing list, and the result depends on the platform: traffic may be wide open or, on some devices, dropped. Editing one sequence number avoids that gap entirely.</p></div>

<h3>Step 5: Implement the solution or escalate as necessary</h3>
<p>Now, and only now, you touch production. Make the change exactly as planned. If you do not have the access, the skill or the authority (the device belongs to another team, or the fault is inside the ISP), you <b>escalate</b>: to a senior engineer (vertical escalation) or to another team or vendor (horizontal escalation), handing over all the evidence you collected.</p>
<pre class="code"><span class="c">! Replace line 20 only; the rest of the ACL keeps working</span>
CORE1# configure terminal
CORE1(config)# ip access-list extended FLOOR3-IN
CORE1(config-ext-nacl)# no 20
CORE1(config-ext-nacl)# 20 deny tcp 10.3.30.192 0.0.0.63 host 10.20.30.40 eq 443
CORE1(config-ext-nacl)# end</pre>

<h3>Step 6: Verify full system functionality and implement preventive measures</h3>
<p>"It works for me" is not verification. You check that the <b>original symptom is gone</b>, that the <b>intended behaviour still happens</b>, and that <b>nothing else broke</b>. Then, if applicable, you add something that stops the problem coming back.</p>
<pre class="out">CORE1# show access-lists FLOOR3-IN
Extended IP access list FLOOR3-IN
    10 deny tcp 10.3.30.0 0.0.0.255 host 10.20.40.25 eq 1433 (12 matches)
    <span class="hl">20 deny tcp 10.3.30.192 0.0.0.63 host 10.20.30.40 eq 443 (3 matches)</span>
    30 permit ip any any (91540 matches)

PS C:&#92;&gt; Test-NetConnection 10.20.30.40 -Port 443
<span class="hl">TcpTestSucceeded : True</span></pre>
<div class="eg"><p><b>Step 6 on INC-4410.</b> An accounts user logs in to payroll and runs a report. A contractor desk (10.3.30.200) is still refused, which is why line 20 shows 3 new matches. Email, internet and the database rule on line 10 are unchanged. <b>Preventive measures:</b> ACL changes now need a peer review and a written pre-check and post-check in the change form, and the monitoring system gets a synthetic TCP 443 check to payroll from each floor subnet.</p></div>

<h3>Step 7: Document findings, actions, outcomes and lessons learned</h3>
<p>Documentation is the last step, and it is not optional. A good ticket lets someone who was not there understand the incident in two minutes.</p>
<table class="cmp"><tr><th>Field</th><th>INC-4410 entry</th></tr>
<tr><td>Symptom</td><td>Floor 3 (VLAN 30) could not open payroll over TCP 443 from 09:15; ping worked</td></tr>
<tr><td>Root cause</td><td>CHG-2291 added ACL FLOOR3-IN line 20 with source <code>any</code> instead of 10.3.30.192/26</td></tr>
<tr><td>Actions</td><td>Replaced line 20 under ECHG-118 at 10:05; backup saved on flash</td></tr>
<tr><td>Outcome</td><td>Payroll reachable from floor 3; contractors still blocked; verified with users</td></tr>
<tr><td>Lessons learned</td><td>Peer review for ACL changes; synthetic app checks per subnet</td></tr>
</table>
<p>Also update the network documentation and the knowledge base article, and link the ticket to the change that caused it. That link is how a team spots patterns, such as three incidents from the same kind of change.</p>

<div class="exam"><p><b>Exam traps.</b> The order at the end is <b>implement, verify, document</b>. "Implement preventive measures" is part of step 6, not step 7. "Identify potential effects" is part of step 4. If a question says the fix is applied and asks what is next, the answer is verify full system functionality, not document.</p></div>

<div class="scn"><h4>The fix that broke the lift phones</h4><p>A technician fixed a VoIP complaint by changing the voice VLAN on an access switch stack. Office phones worked again, and he closed the ticket. He had not identified potential effects: the lift emergency phones were on the same stack and used the old VLAN. A week later a safety inspection found them dead. Proper step 4 (list every device on the stack) and step 6 (test more than the reported phones) would have caught it.</p><p><b>Lesson:</b> "identify potential effects" and "verify full system functionality" exist because networks are shared. Test beyond the user who called.</p></div>

<div class="iv"><p class="q">"You fixed the problem. What do you do before closing the ticket?"</p><p>Say: verify full functionality with the user and with tests of my own, check that nothing else was affected, add preventive measures such as monitoring or a config standard, then document symptom, root cause, actions, outcome and lessons learned, and update the knowledge base. Mention linking the incident to its change. Interviewers love candidates who document without being told.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Step 4 Plan: exact change, approval, backup, rollback and the potential effects on others.</li>
<li>Step 5 Implement exactly as planned, or escalate (vertical or horizontal) with all evidence.</li>
<li>Step 6 Verify: symptom gone, intended behaviour kept, nothing else broken; add preventive measures.</li>
<li>Step 7 Document findings, actions, outcomes and lessons learned; always last.</li>
<li>Edit ACLs line by line with sequence numbers; never delete and retype a live list.</li>
</ul></div>
`,hi:`
<p>Ab aap INC-4410 ka cause jaante ho: CORE1 par ACL FLOOR3-IN ki line 20 <b>kisi bhi</b> source se payroll server 10.20.30.40 tak TCP 443 deny karti hai. Change likhne wala sirf contractor hot-desk range 10.3.30.192/26 block karna chahta tha. Steps 4 se 7 is baare mein hain ki ise <b>safely</b> kaise fix karein, fix saabit karein, aur record chhodein. Surgeon ke baare mein socho: kya galat hai yeh jaanna bina plan ke kaatna shuru karne ki permission nahi hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Steps 4 se 7 rollback loop ke saath">
<rect x="10" y="40" width="130" height="56" rx="8" fill="#bae6fd"/><text x="75" y="64" text-anchor="middle" class="svg-ink" font-size="13">4 Plan</text><text x="75" y="82" text-anchor="middle" class="svg-muted" font-size="12">effects, rollback</text>
<rect x="170" y="40" width="130" height="56" rx="8" fill="#bae6fd"/><text x="235" y="64" text-anchor="middle" class="svg-ink" font-size="13">5 Implement</text><text x="235" y="82" text-anchor="middle" class="svg-muted" font-size="12">ya escalate</text>
<rect x="330" y="40" width="130" height="56" rx="8" fill="#bbf7d0"/><text x="395" y="64" text-anchor="middle" class="svg-ink" font-size="13">6 Verify</text><text x="395" y="82" text-anchor="middle" class="svg-muted" font-size="12">+ prevention</text>
<rect x="490" y="40" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="560" y="64" text-anchor="middle" class="svg-ink" font-size="13">7 Document</text><text x="560" y="82" text-anchor="middle" class="svg-muted" font-size="12">findings, lessons</text>
<line x1="140" y1="68" x2="170" y2="68" stroke="#64748b"/><line x1="300" y1="68" x2="330" y2="68" stroke="#64748b"/><line x1="460" y1="68" x2="490" y2="68" stroke="#64748b"/>
<path d="M395 98 Q 315 140 235 98" fill="none" stroke="#64748b"/><text x="315" y="140" text-anchor="middle" class="svg-muted" font-size="12">verification fail: roll back, dobara socho</text>
</svg><p class="cap">Agar verification fail ho, to roll back karo aur theory par wapas jao. Documentation hamesha aakhri mein aata hai.</p></div>

<h3>Step 4: Plan of action banao aur potential effects pehchano</h3>
<p>Plan chaar sawaalon ka jawab deta hai: <b>kya</b> exactly badloge, <b>kab</b>, <b>kaun</b> approve karega, aur <b>aur kya toot sakta hai</b>. Aakhri wala hissa log skip karte hain. Shared device par har change doosre users ko affect kar sakta hai.</p>
<ul>
<li><b>Potential effects:</b> is ACL, interface ya device se aur kaunsa traffic guzarta hai? Kya change se link flap, STP recalculation ya routing reconvergence hoga?</li>
<li><b>Change management:</b> zyada tar companies ko approval chahiye (change advisory board, ya P1/P2 ke liye emergency change).</li>
<li><b>Backup aur rollback:</b> current config save karo aur apna change undo karne ki exact commands likho.</li>
<li><b>Timing aur communication:</b> abhi fix karein ya maintenance window mein? Service desk aur affected users ko batao.</li>
</ul>
<div class="eg"><p><b>INC-4410 par step 4.</b> Plan: sequence numbers use karke line 20 ko wahin replace karo, taaki ek bhi pal filter ke bina na ho. Effects: contractors block rehne chahiye (CHG-2291 ka yahi maksad tha); koi aur line nahi badalti. Approval: emergency change ECHG-118, network lead ne approve kiya kyunki aaj payroll chalta hai. Rollback: original line 20 wapas add karo. Backup: <code>copy running-config flash:core1-pre-echg118.cfg</code>.</p></div>

<div class="warn"><p><b>Plan ki ek classic galti.</b> Poora ACL <code>no ip access-list extended FLOOR3-IN</code> se hata kar dobara type karna. Ek pal ke liye interface ek khaali ya missing list ko refer karta hai, aur result platform par depend karta hai: traffic poora khula ho sakta hai ya, kuch devices par, drop ho sakta hai. Ek sequence number edit karne se yeh gap bilkul nahi aata.</p></div>

<h3>Step 5: Solution implement karo ya zaroorat ho to escalate karo</h3>
<p>Ab, aur sirf ab, aap production chhoote ho. Change exactly plan ke mutabik karo. Agar aapke paas access, skill ya authority nahi hai (device doosri team ka hai, ya fault ISP ke andar hai), to aap <b>escalate</b> karte ho: senior engineer ko (vertical escalation) ya doosri team ya vendor ko (horizontal escalation), saara collected evidence saunp kar.</p>
<pre class="code"><span class="c">! Sirf line 20 replace karo; baaki ACL kaam karta rehta hai</span>
CORE1# configure terminal
CORE1(config)# ip access-list extended FLOOR3-IN
CORE1(config-ext-nacl)# no 20
CORE1(config-ext-nacl)# 20 deny tcp 10.3.30.192 0.0.0.63 host 10.20.30.40 eq 443
CORE1(config-ext-nacl)# end</pre>

<h3>Step 6: Poori system functionality verify karo aur preventive measures lagao</h3>
<p>"Mere liye chal raha hai" verification nahi hai. Aap check karte ho ki <b>original symptom chala gaya</b>, ki <b>intended behaviour ab bhi ho raha hai</b>, aur ki <b>aur kuch nahi toota</b>. Phir, jahan applicable ho, aisa kuch jodte ho jo problem ko wapas aane se roke.</p>
<pre class="out">CORE1# show access-lists FLOOR3-IN
Extended IP access list FLOOR3-IN
    10 deny tcp 10.3.30.0 0.0.0.255 host 10.20.40.25 eq 1433 (12 matches)
    <span class="hl">20 deny tcp 10.3.30.192 0.0.0.63 host 10.20.30.40 eq 443 (3 matches)</span>
    30 permit ip any any (91540 matches)

PS C:&#92;&gt; Test-NetConnection 10.20.30.40 -Port 443
<span class="hl">TcpTestSucceeded : True</span></pre>
<div class="eg"><p><b>INC-4410 par step 6.</b> Accounts ka ek user payroll mein login karke ek report chalata hai. Contractor desk (10.3.30.200) ab bhi refuse hota hai, isiliye line 20 par 3 naye matches dikhte hain. Email, internet aur line 10 ka database rule bina badlaav hain. <b>Preventive measures:</b> ab ACL changes ko peer review aur change form mein likha hua pre-check aur post-check chahiye, aur monitoring system ko har floor subnet se payroll tak synthetic TCP 443 check milta hai.</p></div>

<h3>Step 7: Findings, actions, outcomes aur lessons learned document karo</h3>
<p>Documentation aakhri step hai, aur optional nahi hai. Achha ticket kisi aise insaan ko jo wahan nahi tha, do minute mein incident samjha deta hai.</p>
<table class="cmp"><tr><th>Field</th><th>INC-4410 entry</th></tr>
<tr><td>Symptom</td><td>Floor 3 (VLAN 30) 09:15 se TCP 443 par payroll nahi khol pa raha tha; ping chalti thi</td></tr>
<tr><td>Root cause</td><td>CHG-2291 ne ACL FLOOR3-IN line 20 10.3.30.192/26 ki jagah source <code>any</code> ke saath add ki</td></tr>
<tr><td>Actions</td><td>ECHG-118 ke tahat 10:05 par line 20 replace ki; backup flash par save</td></tr>
<tr><td>Outcome</td><td>Floor 3 se payroll reachable; contractors ab bhi blocked; users ke saath verify kiya</td></tr>
<tr><td>Lessons learned</td><td>ACL changes ke liye peer review; har subnet se synthetic app checks</td></tr>
</table>
<p>Network documentation aur knowledge base article bhi update karo, aur ticket ko us change se link karo jisne use cause kiya. Yahi link team ko patterns pakadne deta hai, jaise ek hi tarah ke change se teen incidents.</p>

<div class="exam"><p><b>Exam traps.</b> End mein order hai <b>implement, verify, document</b>. "Implement preventive measures" step 6 ka hissa hai, step 7 ka nahi. "Identify potential effects" step 4 ka hissa hai. Agar sawaal kahe ki fix lag gaya aur poochhe aage kya, to jawab hai verify full system functionality, document nahi.</p></div>

<div class="scn"><h4>Fix jisne lift phones tod diye</h4><p>Ek technician ne access switch stack par voice VLAN badal kar ek VoIP complaint fix ki. Office phones phir chalne lage, aur usne ticket close kar diya. Usne potential effects identify nahi kiye the: lift ke emergency phones usi stack par the aur purana VLAN use karte the. Ek hafte baad safety inspection mein woh dead mile. Sahi step 4 (stack ke har device ki list) aur step 6 (report kiye gaye phones se zyada test karna) ise pakad lete.</p><p><b>Seekh:</b> "identify potential effects" aur "verify full system functionality" isliye hain kyunki networks shared hote hain. Jisne call kiya us user se aage bhi test karo.</p></div>

<div class="iv"><p class="q">"Aapne problem fix kar di. Ticket close karne se pehle kya karte ho?"</p><p>Bolo: user ke saath aur apne tests se poori functionality verify karta hoon, check karta hoon ki aur kuch affect nahi hua, monitoring ya config standard jaise preventive measures jodta hoon, phir symptom, root cause, actions, outcome aur lessons learned document karta hoon, aur knowledge base update karta hoon. Incident ko uske change se link karna mention karo. Interviewers un candidates ko pasand karte hain jo bina kahe document karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Step 4 Plan: exact change, approval, backup, rollback aur doosron par potential effects.</li>
<li>Step 5 Exactly plan ke mutabik implement karo, ya saare evidence ke saath escalate karo (vertical ya horizontal).</li>
<li>Step 6 Verify: symptom gaya, intended behaviour bacha, aur kuch nahi toota; preventive measures jodo.</li>
<li>Step 7 Findings, actions, outcomes aur lessons learned document karo; hamesha aakhri.</li>
<li>ACLs ko sequence numbers se line by line edit karo; live list ko kabhi delete karke dobara type mat karo.</li>
</ul></div>
`}};export{e as default};