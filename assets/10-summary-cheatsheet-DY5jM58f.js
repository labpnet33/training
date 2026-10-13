var e={id:`summary-cheatsheet`,h:{en:`Summary: the validation workflow, cheat sheet and glossary`,hi:`Summary: validation workflow, cheat sheet aur glossary`},body:{en:`
<p>You now have four tools and one habit. The tools are JSNAPy snapshots and checks, pytest for intent, deepdiff for open questions and a gate script around <code>commit confirmed</code>. The habit is chapter 9's: never trust a check you have not seen fail. This last chapter ties them into one workflow, then gives you a cheat sheet to keep beside the keyboard.</p>

<h3>The workflow, start to finish</h3>
<table class="cmp"><tr><th>When</th><th>Do</th><th>Tool</th></tr>
<tr><td>Before the window</td><td>Prove the checks can fail (break something in the lab)</td><td>Mutation test</td></tr>
<tr><td>T minus 5 min</td><td>Snapshot every router; confirm pytest intent passes</td><td><code>snap pre</code>, <code>pytest</code></td></tr>
<tr><td>Change</td><td>Apply with a rollback timer</td><td><code>commit(confirm=N)</code></td></tr>
<tr><td>Settle</td><td>Poll until the protocol is stable</td><td>Loop on neighbour count</td></tr>
<tr><td>After</td><td>Snapshot, compare with the past, compare with the design</td><td><code>snap post</code>, <code>check</code>, <code>pytest</code></td></tr>
<tr><td>Decide</td><td>All pass: confirm. Anything else: do nothing, let it roll back</td><td>Gate, exit code</td></tr>
<tr><td>Afterwards</td><td>Attach the log and the diff to the ticket</td><td>deepdiff, log file</td></tr></table>

<h3>Cheat sheet</h3>
<table class="cmp"><tr><th>Need</th><th>Remember</th></tr>
<tr><td>Save state</td><td><code>js.snap(config, "pre")</code>, files in <code>./snapshots/host_tag_command.xml</code></td></tr>
<tr><td>One snapshot test</td><td><code>js.snapcheck(config, "tag")</code></td></tr>
<tr><td>Before against after</td><td><code>js.check(config, "pre", "post")</code></td></tr>
<tr><td>A verdict per router</td><td><code>r.device</code>, <code>r.result</code>, <code>r.no_passed</code>, <code>r.no_failed</code></td></tr>
<tr><td>All nodes / first node</td><td><code>iterate</code> / <code>item</code></td></tr>
<tr><td>Value is right</td><td><code>is-equal</code>, <code>in-range</code>, <code>contains</code>, <code>is-in</code></td></tr>
<tr><td>Nothing lost or changed</td><td><code>list-not-less</code>, <code>no-diff</code>, <code>delta</code> (check only)</td></tr>
<tr><td>Readable failures</td><td><code>err</code> and <code>info</code> with <code>post[...]</code></td></tr>
<tr><td>pytest on one router</td><td><code>pytest -q -k J2</code></td></tr>
<tr><td>deepdiff without noise</td><td><code>exclude_regex_paths</code>, <code>ignore_order=True</code>, <code>pretty()</code></td></tr>
<tr><td>Safe change</td><td><code>commit(confirm=2)</code>, then plain <code>commit()</code> only on pass</td></tr></table>

<h3>Glossary</h3>
<table class="cmp"><tr><th>Term</th><th>Meaning</th></tr>
<tr><td>Snapshot</td><td>Router output saved as a file, with a tag name</td></tr>
<tr><td>Pre / post</td><td>Snapshots before and after a change</td></tr>
<tr><td>Operator</td><td>A JSNAPy test word such as <code>is-equal</code> or <code>list-not-less</code></td></tr>
<tr><td>xpath</td><td>The XML tag path selecting the nodes to test</td></tr>
<tr><td>ignore-null</td><td>Treat "no nodes found" as a pass; dangerous with a typo</td></tr>
<tr><td>Fixture</td><td>pytest setup code shared by tests, closed after the last one</td></tr>
<tr><td>parametrize</td><td>Run one test function once per value</td></tr>
<tr><td>Intent</td><td>The state the design says the network should be in</td></tr>
<tr><td>Gate</td><td>A script that lets a change become permanent only if checks pass</td></tr>
<tr><td>Commit confirmed</td><td>A commit that rolls back unless confirmed in time</td></tr>
<tr><td>False green</td><td>A passing check on a broken network</td></tr></table>

<h3>Lab and real life</h3>
<p>The lab uses a lightweight JSNAPy that follows the real API for <code>snap</code>, <code>snapcheck</code> and <code>check</code>, but it is not the full product. Differences to keep in mind when you move to a real network:</p>
<ul>
<li>Real JSNAPy also has a command-line mode, mail alerts and database storage; the lab has the Python API only.</li>
<li>The wording of FAIL and ERROR lines is close to the real report but not identical. Do not parse the wording; use the result objects.</li>
<li>Here the config is passed as YAML text. Real projects normally keep a config file and a test-file folder.</li>
<li>Real OSPF timing depends on the platform. Poll, as the labs do.</li>
<li>Field names inside PyEZ tables can differ between versions. Check the table definition before relying on one.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Your ticket for next Tuesday reads "shut an unused port on J2". Plan: intent test (ports on J2 only), pre snapshot, <code>commit(confirm=3)</code>, poll until four Full neighbours or the timer, post snapshot and <code>check</code>, pytest for J2, deepdiff to attach. If the typo from CHG-3105 happens, the gate refuses to confirm and the router corrects itself.</p></div>

<div class="warn"><p><b>Before every window.</b> (1) Are the tags unique to this change? (2) Did the check run against all routers (count the results)? (3) Does the timer cover settle plus check? (4) Is there a log to attach? (5) Did you see the check fail at least once?</p></div>
<div class="exam"><p><b>Exam trap.</b> Choose the tool by the question: "unchanged?" is JSNAPy, "as designed?" is pytest, "what exactly moved?" is deepdiff, "may it stay?" is the gate.</p></div>

<div class="scn"><h4>A quiet change window</h4><p>The team that built this workflow stopped getting 3 a.m. calls about silent failures. The big win was not the tools but the rule that the gate can only say yes after a no was seen once. New engineers copy the files and inherit the discipline.</p><p><b>Lesson:</b> the workflow is the product, the scripts are just its shape.</p></div>

<div class="iv"><p class="q">"Describe your change validation process."</p><p>Snapshot before; commit confirmed; wait for convergence; snapshot after; compare to the past with JSNAPy and to the design with pytest; confirm only if everything passes; keep the log and the diff with the ticket. And I test the checks themselves by breaking something in the lab.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One workflow: pre, change with timer, settle, post, check, decide, record.</li>
<li>Four tools, four questions: JSNAPy, pytest, deepdiff, gate.</li>
<li>A check is trusted only after it has failed on purpose.</li>
<li>Count the results; never let an empty list pass.</li>
<li>Know where the lab differs from the real product.</li>
</ul></div>
`,hi:`
<p>Ab aapke paas chaar tools aur ek aadat hai. Tools hain JSNAPy snapshots aur checks, intent ke liye pytest, khule sawaalon ke liye deepdiff aur <code>commit confirmed</code> ke aas-paas gate script. Aadat chapter 9 ki hai: jis check ko fail hote nahi dekha uspar bharosa mat karo. Yeh aakhri chapter inhe ek workflow mein jodta hai, phir keyboard ke paas rakhne ke liye cheat sheet deta hai.</p>

<h3>Workflow, shuru se ant tak</h3>
<table class="cmp"><tr><th>Kab</th><th>Kya karo</th><th>Tool</th></tr>
<tr><td>Window se pehle</td><td>Saabit karo ki checks fail ho sakte hain (lab mein kuch todo)</td><td>Mutation test</td></tr>
<tr><td>T minus 5 min</td><td>Har router ka snapshot; pytest intent pass hone ki pushti</td><td><code>snap pre</code>, <code>pytest</code></td></tr>
<tr><td>Change</td><td>Rollback timer ke saath lagao</td><td><code>commit(confirm=N)</code></td></tr>
<tr><td>Settle</td><td>Protocol stable hone tak poll karo</td><td>Neighbour count par loop</td></tr>
<tr><td>Baad mein</td><td>Snapshot, beete hue kal se compare, design se compare</td><td><code>snap post</code>, <code>check</code>, <code>pytest</code></td></tr>
<tr><td>Faisla</td><td>Sab pass: confirm. Kuch aur: kuch mat karo, rollback hone do</td><td>Gate, exit code</td></tr>
<tr><td>Uske baad</td><td>Log aur diff ticket mein lagao</td><td>deepdiff, log file</td></tr></table>

<h3>Cheat sheet</h3>
<table class="cmp"><tr><th>Zaroorat</th><th>Yaad rakho</th></tr>
<tr><td>State save karo</td><td><code>js.snap(config, "pre")</code>, files <code>./snapshots/host_tag_command.xml</code> mein</td></tr>
<tr><td>Ek snapshot ka test</td><td><code>js.snapcheck(config, "tag")</code></td></tr>
<tr><td>Pehle ke saamne baad</td><td><code>js.check(config, "pre", "post")</code></td></tr>
<tr><td>Har router ka verdict</td><td><code>r.device</code>, <code>r.result</code>, <code>r.no_passed</code>, <code>r.no_failed</code></td></tr>
<tr><td>Sab nodes / pehla node</td><td><code>iterate</code> / <code>item</code></td></tr>
<tr><td>Value sahi hai</td><td><code>is-equal</code>, <code>in-range</code>, <code>contains</code>, <code>is-in</code></td></tr>
<tr><td>Kuch khoya ya badla nahi</td><td><code>list-not-less</code>, <code>no-diff</code>, <code>delta</code> (sirf check)</td></tr>
<tr><td>Padhne layak failures</td><td><code>err</code> aur <code>info</code>, <code>post[...]</code> ke saath</td></tr>
<tr><td>Ek router par pytest</td><td><code>pytest -q -k J2</code></td></tr>
<tr><td>Shor ke bina deepdiff</td><td><code>exclude_regex_paths</code>, <code>ignore_order=True</code>, <code>pretty()</code></td></tr>
<tr><td>Surakshit change</td><td><code>commit(confirm=2)</code>, phir saada <code>commit()</code> sirf pass par</td></tr></table>

<h3>Glossary</h3>
<table class="cmp"><tr><th>Shabd</th><th>Matlab</th></tr>
<tr><td>Snapshot</td><td>Tag ke naam ke saath file mein save kiya router output</td></tr>
<tr><td>Pre / post</td><td>Change se pehle aur baad ke snapshots</td></tr>
<tr><td>Operator</td><td>JSNAPy test shabd, jaise <code>is-equal</code> ya <code>list-not-less</code></td></tr>
<tr><td>xpath</td><td>Test hone wale nodes chunne wala XML tag path</td></tr>
<tr><td>ignore-null</td><td>"Koi node nahi mila" ko pass maano; typo ke saath khatarnak</td></tr>
<tr><td>Fixture</td><td>Tests ke beech saajha pytest setup code, aakhri test ke baad band</td></tr>
<tr><td>parametrize</td><td>Ek test function ko har value ke liye ek baar chalao</td></tr>
<tr><td>Intent</td><td>Woh state jismein design ke hisaab se network hona chahiye</td></tr>
<tr><td>Gate</td><td>Script jo change ko checks pass hone par hi permanent hone deti hai</td></tr>
<tr><td>Commit confirmed</td><td>Aisa commit jo time par confirm na ho to rollback ho jaata hai</td></tr>
<tr><td>False green</td><td>Toote network par pass hota check</td></tr></table>

<h3>Lab aur asli duniya</h3>
<p>Lab halka JSNAPy use karta hai jo <code>snap</code>, <code>snapcheck</code> aur <code>check</code> ke liye asli API ka paalan karta hai, par poora product nahi hai. Asli network par jaate waqt yeh farak yaad rakho:</p>
<ul>
<li>Asli JSNAPy mein command-line mode, mail alerts aur database storage bhi hai; lab mein sirf Python API hai.</li>
<li>FAIL aur ERROR lines ke shabd asli report ke kareeb hain par bilkul wahi nahi. Shabd parse mat karo; result objects use karo.</li>
<li>Yahan config YAML text ki tarah di jaati hai. Asli projects aam taur par config file aur test-file folder rakhte hain.</li>
<li>Asli OSPF timing platform par nirbhar hai. Labs ki tarah poll karo.</li>
<li>PyEZ tables ke andar ke field names versions mein alag ho sakte hain. Kisi par nirbhar hone se pehle table definition dekho.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Agle mangalvar ke ticket mein likha hai "J2 par unused port band karo". Plan: intent test (sirf J2 ke ports), pre snapshot, <code>commit(confirm=3)</code>, chaar Full neighbours ya timer tak poll, post snapshot aur <code>check</code>, J2 ke liye pytest, attach karne ke liye deepdiff. Agar CHG-3105 jaisi typo ho jaye to gate confirm karne se inkaar karta hai aur router khud ko theek kar leta hai.</p></div>

<div class="warn"><p><b>Har window se pehle.</b> (1) Kya tags is change ke liye unique hain? (2) Kya check sab routers par chala (results ginkar dekho)? (3) Kya timer settle plus check dono ko dhakta hai? (4) Attach karne ke liye log hai? (5) Kya aapne check ko kam se kam ek baar fail hote dekha?</p></div>
<div class="exam"><p><b>Exam trap.</b> Tool sawaal se chuno: "badla nahi?" JSNAPy hai, "design jaisa hai?" pytest hai, "exactly kya hila?" deepdiff hai, "kya yeh rah sakta hai?" gate hai.</p></div>

<div class="scn"><h4>Ek shaant change window</h4><p>Jis team ne yeh workflow banaya, uske paas chupchaap failures ke baare mein raat 3 baje ke calls aane band ho gaye. Bada fayda tools nahi, woh niyam tha ki gate "haan" tabhi keh sakta hai jab ek baar "na" dekh liya gaya ho. Naye engineers files copy karte hain aur anushasan viraasat mein paate hain.</p><p><b>Lesson:</b> workflow product hai, scripts sirf uska roop.</p></div>

<div class="iv"><p class="q">"Apna change validation process batao."</p><p>Pehle snapshot; commit confirmed; convergence ka wait; baad ka snapshot; JSNAPy se beete hue kal se aur pytest se design se compare; sab pass hone par hi confirm; log aur diff ticket ke saath rakhna. Aur main checks ko khud bhi lab mein kuch todkar test karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek workflow: pre, timer ke saath change, settle, post, check, faisla, record.</li>
<li>Chaar tools, chaar sawaal: JSNAPy, pytest, deepdiff, gate.</li>
<li>Check par tabhi bharosa jab woh jaanboojhkar fail ho chuka ho.</li>
<li>Results ginte raho; khaali list ko kabhi pass mat hone do.</li>
<li>Jaano ki lab asli product se kahan alag hai.</li>
</ul></div>
`}};export{e as default};