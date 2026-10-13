var e={id:`change-control`,h:{en:`Change control, rollback and the audit log`,hi:`Change control, rollback aur audit log`},body:{en:`
<h3>Why the portal needs discipline</h3>
<p>One click on Activate changes can alter how three cities reach the internet. In a hospital, a surgeon does not operate without a checklist; in a security service, an engineer should not publish policy without a plan. <b>Change control</b> is that plan: decide what you will change, when, how you will test, and how you will undo it.</p>

<h3>The pieces of a good change</h3>
<ol>
<li><b>Request:</b> who asked, why, what outcome is expected.</li>
<li><b>Impact:</b> which sites and groups are affected; what could break.</li>
<li><b>Window:</b> a time with the lowest business cost and people available to test.</li>
<li><b>Test plan:</b> exact tester runs and client checks, written before the change, with expected results.</li>
<li><b>Rollback plan:</b> how to return to the previous state and how long it takes.</li>
<li><b>Record:</b> what was done and the evidence it worked.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Change lifecycle">
<rect x="10" y="40" width="100" height="60" rx="8" fill="#bae6fd"/><text x="60" y="75" text-anchor="middle" class="svg-ink" font-size="13">Plan</text>
<rect x="130" y="40" width="100" height="60" rx="8" fill="#bbf7d0"/><text x="180" y="75" text-anchor="middle" class="svg-ink" font-size="13">Test first</text>
<rect x="250" y="40" width="110" height="60" rx="8" fill="#fde68a"/><text x="305" y="68" text-anchor="middle" class="svg-ink" font-size="13">Activate in</text><text x="305" y="86" text-anchor="middle" class="svg-ink" font-size="13">the window</text>
<rect x="380" y="40" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="430" y="75" text-anchor="middle" class="svg-ink" font-size="13">Verify</text>
<rect x="500" y="40" width="130" height="60" rx="8" fill="#fed7aa"/><text x="565" y="68" text-anchor="middle" class="svg-ink" font-size="13">Keep or</text><text x="565" y="86" text-anchor="middle" class="svg-ink" font-size="13">roll back</text>
<line x1="110" y1="70" x2="130" y2="70" stroke="#64748b" stroke-width="2"/><line x1="230" y1="70" x2="250" y2="70" stroke="#64748b" stroke-width="2"/><line x1="360" y1="70" x2="380" y2="70" stroke="#64748b" stroke-width="2"/><line x1="480" y1="70" x2="500" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">no change is finished until verified or rolled back</text>
</svg><p class="cap">A change is a loop, not a click.</p></div>

<h3>Rollback: write it before you need it</h3>
<p>Rollback means putting the previous values back. In the portal the simplest method is to <b>note the old value</b> before editing (a rule position, a PAC URL, a destination, a threshold). If the verification fails, restore those values and activate again, then run the same tests to prove you are back to normal. For a risky change, say "if the Pune test fails within ten minutes, we roll back". A rollback decision made in advance is calm; one made during an outage is not.</p>

<h3>Staged changes</h3>
<p>The portal edits a candidate configuration and applies it when you press <b>Activate changes</b>. Use that: make the edit, run the policy tester against the candidate where possible, then activate. Prefer small changes: one rule or one setting per activation, so a failure points to exactly one cause.</p>

<h3>The audit log</h3>
<p>The <b>Alerts and audit</b> page keeps the audit log: who changed what and when, including every <code>tool:policy</code> tester run. It answers "what changed before it broke?" faster than any memory. In troubleshooting, check the audit log early: most outages start with a change.</p>
<pre class="out">Alerts and audit &gt; Audit log
Time     Admin   Action
Sat 23:10  atul    changed edge.chn.tunnel.dest 203.0.113.101 -&gt; <span class="hl">203.0.113.10</span>
Sat 23:12  atul    changed pac.url (jpr)
Sat 23:14  atul    Activate changes
Mon 09:05  ops1    tool:policy  user kabir  host social.example
Mon 09:20  ops1    changed edge.chn.tunnel.dest 203.0.113.10 -&gt; 203.0.113.101</pre>

<div class="eg"><p><b>Worked example.</b> Request: "allow Engineering ssh through the cloud firewall". Plan: add one allow rule above the block rule. Window: Tuesday morning. Test plan: tester for vikram (expected allowed) and for ravi (expected blocked). Rollback: remove the new rule. After activation both tests give the expected result, and the ticket records both outputs.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> Activating applies the candidate to live traffic: rule order, tunnel parameters, PAC and thresholds all take effect at once. Rolling back is another activation, so it has the same effect speed. Planning does not change traffic; it prevents surprises.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Changing several things in one activation. (2) No old values written down. (3) Testing only the user who complained. (4) Making changes at 17:55 on a Friday.</p></div>
<div class="exam"><p><b>Exam trap.</b> "What do you do first when an outage starts after a change?" Check the audit log, then roll back the specific change if it explains the symptom and verify.</p></div>

<div class="scn"><h4>The Friday evening tweak</h4><p>A PAC "optimisation" was activated at the end of a Friday with no test plan. On Monday morning Jaipur could not reach mail. The audit log pointed to the Friday change in one minute and the saved old PAC rules restored service.</p><p><b>Lesson:</b> old values and the audit log turn a long outage into a short one.</p></div>

<div class="iv"><p class="q">"How do you make a risky policy change safely?"</p><p>Plan the change with impact, window and test plan; note old values for rollback; make one small change; activate in the window; run the written tests for allowed and blocked cases; record evidence; roll back if tests fail. Mention the audit log.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Change control: request, impact, window, test plan, rollback, record.</li>
<li>Write old values down before editing.</li>
<li>One small change per activation.</li>
<li>Verify with both allowed and blocked tests.</li>
<li>The audit log shows who changed what before the outage.</li>
</ul></div>
`,hi:`
<h3>Portal ko discipline kyun chahiye</h3>
<p>Activate changes par ek click teen shehron ke internet access ko badal sakta hai. Hospital mein surgeon checklist ke bina operate nahi karta; security service mein engineer ko plan ke bina policy publish nahi karni chahiye. <b>Change control</b> woh plan hai: tay karo kya badloge, kab, test kaise karoge, aur undo kaise karoge.</p>

<h3>Achhe change ke hisse</h3>
<ol>
<li><b>Request:</b> kisne maanga, kyun, kya outcome expected hai.</li>
<li><b>Impact:</b> kaun si sites aur groups affected hain; kya toot sakta hai.</li>
<li><b>Window:</b> sabse kam business cost wala time jab test karne ke liye log available hon.</li>
<li><b>Test plan:</b> exact tester runs aur client checks, change se pehle likhe hue, expected results ke saath.</li>
<li><b>Rollback plan:</b> pichhli state par kaise wapas jaana hai aur kitna time lagega.</li>
<li><b>Record:</b> kya kiya aur evidence ki kaam kiya.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Change lifecycle">
<rect x="10" y="40" width="100" height="60" rx="8" fill="#bae6fd"/><text x="60" y="75" text-anchor="middle" class="svg-ink" font-size="13">Plan</text>
<rect x="130" y="40" width="100" height="60" rx="8" fill="#bbf7d0"/><text x="180" y="75" text-anchor="middle" class="svg-ink" font-size="13">Pehle test</text>
<rect x="250" y="40" width="110" height="60" rx="8" fill="#fde68a"/><text x="305" y="68" text-anchor="middle" class="svg-ink" font-size="13">Window mein</text><text x="305" y="86" text-anchor="middle" class="svg-ink" font-size="13">activate</text>
<rect x="380" y="40" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="430" y="75" text-anchor="middle" class="svg-ink" font-size="13">Verify</text>
<rect x="500" y="40" width="130" height="60" rx="8" fill="#fed7aa"/><text x="565" y="68" text-anchor="middle" class="svg-ink" font-size="13">Rakho ya</text><text x="565" y="86" text-anchor="middle" class="svg-ink" font-size="13">roll back</text>
<line x1="110" y1="70" x2="130" y2="70" stroke="#64748b" stroke-width="2"/><line x1="230" y1="70" x2="250" y2="70" stroke="#64748b" stroke-width="2"/><line x1="360" y1="70" x2="380" y2="70" stroke="#64748b" stroke-width="2"/><line x1="480" y1="70" x2="500" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">koi change tab tak poora nahi jab tak verify ya roll back na ho</text>
</svg><p class="cap">Change ek loop hai, click nahi.</p></div>

<h3>Rollback: zaroorat se pehle likho</h3>
<p>Rollback ka matlab pichhli values wapas daalna. Portal mein sabse simple tareeka hai edit karne se pehle <b>purani value note karo</b> (rule position, PAC URL, destination, threshold). Verification fail ho to wahi values restore karo aur dobara activate karo, phir wahi tests chalao taaki prove ho ki aap normal par wapas ho. Risky change ke liye bolo "agar Pune test das minute mein fail ho to roll back karenge". Pehle se liya hua rollback decision shaant hota hai; outage ke beech liya hua nahi.</p>

<h3>Staged changes</h3>
<p>Portal candidate configuration edit karta hai aur <b>Activate changes</b> dabane par apply karta hai. Isse use karo: edit karo, jahan possible ho candidate ke against policy tester chalao, phir activate karo. Chhote changes pasand karo: ek activation mein ek rule ya ek setting, taaki failure sirf ek cause ki taraf ishara kare.</p>

<h3>Audit log</h3>
<p><b>Alerts and audit</b> page audit log rakhta hai: kisne kya aur kab badla, har <code>tool:policy</code> tester run samet. Yeh "toot'ne se pehle kya badla?" ka jawab kisi bhi yaadasht se tez deta hai. Troubleshooting mein audit log jaldi dekho: zyadatar outages kisi change se shuru hote hain.</p>
<pre class="out">Alerts and audit &gt; Audit log
Time     Admin   Action
Sat 23:10  atul    changed edge.chn.tunnel.dest 203.0.113.101 -&gt; <span class="hl">203.0.113.10</span>
Sat 23:12  atul    changed pac.url (jpr)
Sat 23:14  atul    Activate changes
Mon 09:05  ops1    tool:policy  user kabir  host social.example
Mon 09:20  ops1    changed edge.chn.tunnel.dest 203.0.113.10 -&gt; 203.0.113.101</pre>

<div class="eg"><p><b>Worked example.</b> Request: "cloud firewall se Engineering ko ssh allow karo". Plan: block rule ke upar ek allow rule jodo. Window: Tuesday subah. Test plan: vikram ke liye tester (expected allowed) aur ravi ke liye (expected blocked). Rollback: naya rule hata do. Activation ke baad dono tests expected result dete hain, aur ticket dono outputs record karta hai.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Activate candidate ko live traffic par apply karta hai: rule order, tunnel parameters, PAC aur thresholds sab ek saath effect mein aate hain. Rollback bhi ek activation hai, to uski effect speed wahi hai. Planning traffic nahi badalti; woh surprises rokti hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Ek activation mein kai cheezein badalna. (2) Purani values likhe bina. (3) Sirf complain karne wale user ko test karna. (4) Friday 17:55 par changes karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Change ke baad outage shuru ho to pehle kya karte ho?" Audit log check karo, phir agar woh specific change symptom explain kare to use roll back karo aur verify karo.</p></div>

<div class="scn"><h4>Friday shaam ki tweak</h4><p>Ek PAC "optimisation" Friday ke end mein bina test plan ke activate hui. Monday subah Jaipur mail nahi khol paaya. Audit log ne ek minute mein Friday ke change ki taraf ishara kiya aur saved purane PAC rules ne service wapas kar di.</p><p><b>Seekh:</b> purani values aur audit log lambe outage ko chhota bana dete hain.</p></div>

<div class="iv"><p class="q">"Risky policy change safely kaise karoge?"</p><p>Impact, window aur test plan ke saath change plan karo; rollback ke liye purani values note karo; ek chhota change karo; window mein activate karo; allowed aur blocked cases ke likhe tests chalao; evidence record karo; tests fail hon to roll back. Audit log mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Change control: request, impact, window, test plan, rollback, record.</li>
<li>Edit se pehle purani values likho.</li>
<li>Ek activation mein ek chhota change.</li>
<li>Allowed aur blocked dono tests se verify karo.</li>
<li>Audit log batata hai outage se pehle kisne kya badla.</li>
</ul></div>
`}};export{e as default};