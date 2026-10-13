var e={id:`how-to-practise`,h:{en:`How to practise in the labs and study plan`,hi:`Labs mein practise kaise karein aur study plan`},body:{en:`
<p>Reading builds understanding; typing builds skill. The JNCIS-ENT exam rewards people who have seen the output of a command many times. This chapter gives you a study order, a repeatable lab routine and the Junos habits that keep a practice session safe and fast.</p>

<h3>Suggested study order</h3>
<ol>
<li><b>Switching:</b> MAC learning, VLANs, trunks, native VLAN and IRB.</li>
<li><b>Spanning tree:</b> root election, RSTP roles and states, edge ports and protection.</li>
<li><b>Layer 2 security:</b> limiting MACs, snooping, storm control.</li>
<li><b>Routing base:</b> static and aggregate routes, preference, instances.</li>
<li><b>Dynamic routing:</b> OSPF, then IS-IS, then BGP.</li>
<li><b>Resilience:</b> tunnels, LAG, VRRP, graceful restart, Virtual Chassis.</li>
<li><b>Revision:</b> quizzes, interview questions and timed mixed practice.</li>
</ol>
<p>Keep each topic to a short, regular session rather than one marathon. Four 45-minute sessions a week are more effective than one long weekend.</p>

<h3>The lab routine: plan, build, verify, break, fix</h3>
<ul>
<li><b>Plan:</b> read the task and write down what the end state should look like.</li>
<li><b>Build:</b> configure step by step; commit once a logical block is complete.</li>
<li><b>Verify:</b> use show commands to prove the result, never assume.</li>
<li><b>Break:</b> remove one setting on purpose (a VLAN on a trunk, an IRB binding) and predict the symptom before you check.</li>
<li><b>Fix:</b> restore it and confirm the output returns to normal.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Lab loop">
<rect x="10" y="60" width="105" height="46" rx="8" fill="#bbf7d0"/><text x="62" y="88" text-anchor="middle" class="svg-ink" font-size="13">Plan</text>
<rect x="135" y="60" width="105" height="46" rx="8" fill="#bae6fd"/><text x="187" y="88" text-anchor="middle" class="svg-ink" font-size="13">Build</text>
<rect x="260" y="60" width="105" height="46" rx="8" fill="#ddd6fe"/><text x="312" y="88" text-anchor="middle" class="svg-ink" font-size="13">Verify</text>
<rect x="385" y="60" width="105" height="46" rx="8" fill="#fde68a"/><text x="437" y="88" text-anchor="middle" class="svg-ink" font-size="13">Break</text>
<rect x="510" y="60" width="105" height="46" rx="8" fill="#fed7aa"/><text x="562" y="88" text-anchor="middle" class="svg-ink" font-size="13">Fix</text>
<line x1="115" y1="83" x2="135" y2="83" stroke="#64748b" stroke-width="2"/><line x1="240" y1="83" x2="260" y2="83" stroke="#64748b" stroke-width="2"/><line x1="365" y1="83" x2="385" y2="83" stroke="#64748b" stroke-width="2"/><line x1="490" y1="83" x2="510" y2="83" stroke="#64748b" stroke-width="2"/>
<path d="M562 106 L562 140 L62 140 L62 106" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="312" y="134" text-anchor="middle" class="svg-ink" font-size="12">repeat with a different topic</text>
</svg><p class="cap">Breaking things on purpose is the fastest way to learn troubleshooting.</p></div>

<h3>Junos habits that save time</h3>
<ul>
<li><code>show | compare</code> before every commit shows exactly what you are about to change.</li>
<li><code>commit check</code> validates without applying.</li>
<li><code>commit confirmed 5</code> applies with an automatic rollback in five minutes unless you confirm; vital when you might lock yourself out of a management path.</li>
<li><code>rollback 1</code> and <code>show | compare rollback 1</code> let you undo and review changes.</li>
<li><code>show configuration | display set</code> gives the set commands for easy copying and comparing.</li>
<li>Use <code>?</code> and Tab in the CLI to discover options; the exam expects you to know the hierarchy, and Tab teaches it.</li>
<li><code>run show ...</code> lets you run operational commands from configuration mode.</li>
</ul>

<h3>Using the labs in this course</h3>
<ul>
<li>Each module has labs with a topology, tasks and hints. Try a task before opening a hint.</li>
<li>Read the exercise goal first, then choose the device and open its console.</li>
<li>After each task, run the verification command from the task, and compare to the expected output in the chapter.</li>
<li>If you get stuck, return to the matching chapter, then retry the lab from the start.</li>
</ul>

<div class="eg"><p><b>Worked example: one 45-minute session.</b> Minutes 0 to 5: read the lab goal and predict the end state. Minutes 5 to 25: configure a VLAN, a trunk and an IRB. Minutes 25 to 30: verify with show vlans, show ethernet-switching table and show interfaces terse irb. Minutes 30 to 40: remove the VLAN from the trunk, predict the result, check, then restore. Minutes 40 to 45: write three lines on what you learned and one question to look up.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Copying configuration without understanding it. Skipping verification. Leaving a lab half done and starting another. Never practising the break and fix part. Memorising output without knowing which command produced it.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam may ask which command validates or safely applies a change. Know the difference between commit check (validate only), commit confirmed (apply with timed rollback) and commit and-quit.</p></div>

<div class="scn"><h4>The commit that cut the session</h4><p>A candidate practised changing the management interface on a remote device and committed directly. The change dropped the session and the device became unreachable. A colleague repeated it with commit confirmed 5 and the device rolled back to a working configuration automatically.</p><p><b>Lesson:</b> use commit confirmed whenever a change can cut your own path.</p></div>

<div class="iv"><p class="q">"How do you make a risky change safely on Junos?"</p><p>I review it with show | compare, run commit check, and use commit confirmed with a short timer so the device returns to the previous configuration if I lose access. When the result is verified I confirm it with a plain commit. I can also use rollback to return to an earlier version.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Study bottom up: switching, spanning tree, security, routing base, dynamic routing, resilience.</li>
<li>Routine: plan, build, verify, break, fix.</li>
<li>Use show | compare, commit check and commit confirmed.</li>
<li>Short regular sessions beat marathons.</li>
<li>Always verify with show commands and compare with expected output.</li>
</ul></div>
`,hi:`
<p>Padhne se samajh banti hai; type karne se skill banti hai. JNCIS-ENT exam unhe inaam deta hai jinhone command ka output kai baar dekha hai. Yeh chapter aapko study order, ek doharaya ja sakne wala lab routine aur Junos ki aadatein deta hai jo practice session ko surakshit aur tez rakhti hain.</p>

<h3>Sujhaya gaya study order</h3>
<ol>
<li><b>Switching:</b> MAC learning, VLANs, trunks, native VLAN aur IRB.</li>
<li><b>Spanning tree:</b> root election, RSTP roles aur states, edge ports aur protection.</li>
<li><b>Layer 2 security:</b> MACs limit karna, snooping, storm control.</li>
<li><b>Routing base:</b> static aur aggregate routes, preference, instances.</li>
<li><b>Dynamic routing:</b> OSPF, phir IS-IS, phir BGP.</li>
<li><b>Resilience:</b> tunnels, LAG, VRRP, graceful restart, Virtual Chassis.</li>
<li><b>Revision:</b> quizzes, interview questions aur timed mixed practice.</li>
</ol>
<p>Har topic ke liye chhota, niyamit session rakho, ek marathon nahi. Hafte mein chaar 45-minute sessions ek lambe weekend se zyada asardaar hain.</p>

<h3>Lab routine: plan, build, verify, break, fix</h3>
<ul>
<li><b>Plan:</b> task padho aur likho ki end state kaisa dikhna chahiye.</li>
<li><b>Build:</b> step by step configure karo; ek logical block poora hone par commit karo.</li>
<li><b>Verify:</b> show commands se result saabit karo, kabhi maano mat.</li>
<li><b>Break:</b> jaanboojhkar ek setting hatao (trunk par ek VLAN, ek IRB binding) aur check karne se pehle symptom predict karo.</li>
<li><b>Fix:</b> use wapas lagao aur confirm karo ki output normal ho gaya.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Lab loop">
<rect x="10" y="60" width="105" height="46" rx="8" fill="#bbf7d0"/><text x="62" y="88" text-anchor="middle" class="svg-ink" font-size="13">Plan</text>
<rect x="135" y="60" width="105" height="46" rx="8" fill="#bae6fd"/><text x="187" y="88" text-anchor="middle" class="svg-ink" font-size="13">Build</text>
<rect x="260" y="60" width="105" height="46" rx="8" fill="#ddd6fe"/><text x="312" y="88" text-anchor="middle" class="svg-ink" font-size="13">Verify</text>
<rect x="385" y="60" width="105" height="46" rx="8" fill="#fde68a"/><text x="437" y="88" text-anchor="middle" class="svg-ink" font-size="13">Break</text>
<rect x="510" y="60" width="105" height="46" rx="8" fill="#fed7aa"/><text x="562" y="88" text-anchor="middle" class="svg-ink" font-size="13">Fix</text>
<line x1="115" y1="83" x2="135" y2="83" stroke="#64748b" stroke-width="2"/><line x1="240" y1="83" x2="260" y2="83" stroke="#64748b" stroke-width="2"/><line x1="365" y1="83" x2="385" y2="83" stroke="#64748b" stroke-width="2"/><line x1="490" y1="83" x2="510" y2="83" stroke="#64748b" stroke-width="2"/>
<path d="M562 106 L562 140 L62 140 L62 106" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="312" y="134" text-anchor="middle" class="svg-ink" font-size="12">alag topic ke saath dohrao</text>
</svg><p class="cap">Jaanboojhkar cheezein todna troubleshooting seekhne ka sabse tez tareeka hai.</p></div>

<h3>Junos ki aadatein jo samay bachati hain</h3>
<ul>
<li>Har commit se pehle <code>show | compare</code> bilkul dikhata hai ki aap kya badalne wale ho.</li>
<li><code>commit check</code> bina apply kiye validate karta hai.</li>
<li><code>commit confirmed 5</code> apply karta hai aur paanch minute mein automatic rollback karta hai jab tak aap confirm na karo; zaroori jab aap apna management path khud kaat sakte ho.</li>
<li><code>rollback 1</code> aur <code>show | compare rollback 1</code> changes undo aur review karne dete hain.</li>
<li><code>show configuration | display set</code> set commands deta hai, copy aur compare karne ke liye.</li>
<li>CLI mein options khojne ke liye <code>?</code> aur Tab use karo; exam hierarchy jaanne ki ummeed rakhta hai, aur Tab use sikhata hai.</li>
<li><code>run show ...</code> configuration mode se operational commands chalane deta hai.</li>
</ul>

<h3>Is course ke labs ka use</h3>
<ul>
<li>Har module mein topology, tasks aur hints wale labs hain. Hint kholne se pehle task khud try karo.</li>
<li>Pehle exercise ka goal padho, phir device chuno aur uska console kholo.</li>
<li>Har task ke baad task ka verification command chalao aur chapter ke expected output se milao.</li>
<li>Atak jao to matching chapter par wapas jao, phir lab ko shuru se dobara try karo.</li>
</ul>

<div class="eg"><p><b>Worked example: ek 45-minute session.</b> Minute 0 se 5: lab goal padho aur end state predict karo. Minute 5 se 25: VLAN, trunk aur IRB configure karo. Minute 25 se 30: show vlans, show ethernet-switching table aur show interfaces terse irb se verify karo. Minute 30 se 40: trunk se VLAN hatao, result predict karo, check karo, phir wapas lagao. Minute 40 se 45: teen line likho ki kya seekha aur ek sawal jo dekhna hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Bina samjhe configuration copy karna. Verification chhod dena. Lab adhoora chhodkar doosra shuru karna. Break aur fix wala hissa kabhi practise na karna. Output yaad karna bina yeh jaane ki kaunse command ne diya.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam poochh sakta hai ki kaunsa command change ko validate ya surakshit tareeke se apply karta hai. commit check (sirf validate), commit confirmed (timed rollback ke saath apply) aur commit and-quit ka fark jaano.</p></div>

<div class="scn"><h4>Commit jisne session kaat diya</h4><p>Ek candidate ne remote device ka management interface badalne ki practice ki aur seedha commit kiya. Change ne session gira diya aur device unreachable ho gaya. Ek colleague ne wahi commit confirmed 5 ke saath kiya aur device apne aap working configuration par rollback ho gaya.</p><p><b>Lesson:</b> jab change aapka apna path kaat sakta ho, commit confirmed use karo.</p></div>

<div class="iv"><p class="q">"Junos par risky change surakshit tareeke se kaise karte hain?"</p><p>Main use show | compare se review karta hoon, commit check chalata hoon, aur chhote timer ke saath commit confirmed use karta hoon taaki access khone par device pichli configuration par laut aaye. Result verify hone par plain commit se confirm karta hoon. Main rollback se pichle version par bhi ja sakta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Neeche se upar padho: switching, spanning tree, security, routing base, dynamic routing, resilience.</li>
<li>Routine: plan, build, verify, break, fix.</li>
<li>show | compare, commit check aur commit confirmed use karo.</li>
<li>Chhote niyamit sessions marathon se behtar hain.</li>
<li>Hamesha show commands se verify karo aur expected output se milao.</li>
</ul></div>
`}};export{e as default};