var e={id:`change-control`,h:{en:`Change control: redeploy, revisions, rollback and decommission`,hi:`Change control: redeploy, revisions, rollback aur decommission`},body:{en:`
<p>Think of a restaurant menu printed centrally. When head office reprints the menu, every outlet gets the new version on a set day. If a typo ruins the new menu, head office can bring the old one back. A branch that hand-writes its own menu breaks the system. Template-based management gives you the same power, and the same responsibility: <b>one change reaches many sites</b>.</p>

<h3>Who owns the configuration after onboarding</h3>
<p>After a successful push, the lines that came from the Director are <b>owned by the Director</b>. In the course model they are <b>read-only on the branch</b>; you cannot edit them from the branch CLI. To change them you edit the template or bind data in the Director and push again. This is intentional. It prevents configuration drift, where each branch slowly becomes a different snowflake. (In real Versa deployments, local edits and template pushes can conflict; teams usually forbid local edits to template-managed areas, and use the Director's configuration comparison before a push.)</p>

<h3>Redeploy and revisions</h3>
<p>Every deploy of a device workflow is a <b>revision</b>. The course Director numbers them: the first deploy is r1, the next r2, and so on, visible in <code>show devices brief</code> as <code>yes (r2)</code>. A redeploy rebuilds the configuration from the <b>current</b> template and bind data and pushes it to the branch.</p>
<pre class="code">admin@Director-1-cli% set director devices Branch3 bind lan-address 10.1.33.1/24
admin@Director-1-cli% commit
admin@Director-1-cli% exit
admin@Director-1-cli&gt; request devices workflow deploy device Branch3</pre>
<pre class="out">Workflow deploy submitted for Branch3 (revision 2). Check: show devices brief</pre>
<p>Notice the sequence: <b>commit</b> (change the intent), <b>deploy</b> (push the intent), <b>verify</b>. Committing a Director change without deploying changes nothing on the branch.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Revision timeline">
<line x1="40" y1="100" x2="610" y2="100" stroke="#64748b" stroke-width="3"/>
<circle cx="110" cy="100" r="14" fill="#bbf7d0"/><text x="110" y="104" text-anchor="middle" class="svg-ink" font-size="12">r1</text><text x="110" y="140" text-anchor="middle" class="svg-muted" font-size="12">first push</text>
<circle cx="300" cy="100" r="14" fill="#bbf7d0"/><text x="300" y="104" text-anchor="middle" class="svg-ink" font-size="12">r2</text><text x="300" y="140" text-anchor="middle" class="svg-muted" font-size="12">LAN change</text>
<circle cx="490" cy="100" r="14" fill="#fed7aa"/><text x="490" y="104" text-anchor="middle" class="svg-ink" font-size="12">r3</text><text x="490" y="140" text-anchor="middle" class="svg-muted" font-size="12">bad value</text>
<path d="M490 82 C440 30 360 30 310 82" fill="none" stroke="#0369a1" stroke-width="2"/><polygon points="304,74 312,86 318,76" fill="#0369a1"/>
<text x="400" y="30" text-anchor="middle" class="svg-accent" font-size="12">roll back to r2 data</text>
</svg><p class="cap">Each deploy is a revision; a bad revision is corrected by restoring the previous data and deploying again.</p></div>

<h3>Rollback</h3>
<p>Two layers of rollback exist and they are different:</p>
<ul>
<li><b>CLI session rollback.</b> In configuration mode, <code>rollback</code> discards uncommitted changes, and <code>show | compare</code> shows what you are about to commit. This protects you <i>before</i> commit.</li>
<li><b>Revision rollback.</b> After a bad deploy, restore the previous template or bind data values and deploy again, producing a new revision with the old content. Real Versa also lets you review configuration history and compare versions in the Director. The course model keeps things simple: fix the data and redeploy.</li>
</ul>
<div class="note"><p>A safety behaviour in the model: if the overlay session of a branch is down, the Director cannot push a newer revision; the status keeps the current revision active and says so in the Detail. This protects a working branch from a push it cannot receive.</p></div>

<h3>Undeploy</h3>
<p><code>request devices workflow undeploy device Branch3</code> withdraws the device's deployed workflow in the Director. It stops further pushes for that device. It is the first step when you pause or retire a site. In the model it clears the deployed marker; the device shows Deployed = no.</p>

<h3>Decommission and re-stage</h3>
<p>Retiring a site or reusing a box needs two sides cleaned up:</p>
<ol>
<li>In the Director: undeploy, then remove the device (and its bind data) so the serial is free.</li>
<li>On the branch: reset staging so that it returns to a factory staging state, <code>request staging reset</code>, which also removes the Director-pushed configuration.</li>
</ol>
<pre class="out">admin@Branch3-cli&gt; request staging reset
Staging state and Director-pushed configuration removed (device is back to factory staging state).</pre>
<p>The serial is the identity of the box. Never leave a live device record for hardware that has been shipped elsewhere.</p>

<div class="eg"><p><b>Worked example.</b> Delhi moves its LAN from 10.1.1.0/24 to 10.1.11.0/24. Steps: edit bind data for Branch1, commit, review the diff of what will change, schedule a maintenance window, deploy (r2), verify the overlay and that Bengaluru learns the new prefix, announce completion. Rollback plan: restore the old bind value and deploy again (r3).</p></div>

<div class="warn"><p><b>Common mistakes:</b> changing a shared template in the middle of the business day; undeploying a live branch by mistake (it is not the same as deleting configuration, but it stops management pushes); leaving old devices in the Director after a site closes.</p></div>
<div class="exam"><p><b>Exam trap:</b> a Director commit is not a branch change. Intent changes on commit; reality changes on deploy.</p></div>

<div class="scn"><h4>The template edit that waited</h4><p>An engineer edited the BR-DUAL SLA values at 11:00 and left for lunch without deploying. At 11:30 a colleague deployed a new site and, without knowing, delivered the changed SLA to it, while the 40 older sites still had the old SLA. Reports showed inconsistent behaviour for days.</p><p><b>Lesson:</b> treat commit and deploy as one change with an owner and a window. Keep a change record that lists both.</p></div>

<div class="iv"><p class="q">"How do you make a safe change to a template used by 100 branches?"</p><p>I review the diff, test on a pilot group first, schedule a window, deploy in waves, verify the overlay and a business application per wave, and keep the previous values ready to redeploy as a rollback.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Director-pushed lines are read-only on the branch; change them in the Director.</li>
<li>Commit changes intent; deploy creates a revision and pushes it.</li>
<li>Rollback = restore previous data and redeploy; CLI rollback only discards uncommitted edits.</li>
<li>Undeploy withdraws the workflow; decommission cleans the Director record and resets the branch.</li>
<li>Large blast radius means pilots, windows and waves.</li>
</ul></div>
`,hi:`
<p>Restaurant ka menu head office se print hota hai. Jab head office menu dobara print karta hai, har outlet ko ek tay din naya version milta hai. Naye menu mein typo ho jaye to head office purana wapas la sakta hai. Jo branch apna menu haath se likhti hai wo system tod deti hai. Template-based management wahi power deta hai, aur wahi zimmedari: <b>ek change kai sites tak pahunchta hai</b>.</p>

<h3>Onboarding ke baad configuration ka owner kaun</h3>
<p>Successful push ke baad Director se aayi lines ka <b>owner Director</b> hai. Course model mein wo <b>branch par read-only</b> hain; aap branch CLI se unhe edit nahi kar sakte. Badalne ke liye Director mein template ya bind data edit karo aur dobara push karo. Ye jaan-boojhkar hai. Ye configuration drift rokta hai, jahan har branch dheere-dheere alag ban jati hai. (Real Versa deployments mein local edits aur template pushes conflict kar sakte hain; teams aam taur par template-managed areas mein local edits mana karti hain, aur push se pehle Director ka configuration comparison use karti hain.)</p>

<h3>Redeploy aur revisions</h3>
<p>Device workflow ka har deploy ek <b>revision</b> hai. Course Director unhe number karta hai: pehla deploy r1, agla r2, aur aise hi, jo <code>show devices brief</code> mein <code>yes (r2)</code> ki tarah dikhta hai. Redeploy <b>current</b> template aur bind data se configuration rebuild karta hai aur branch ko push karta hai.</p>
<pre class="code">admin@Director-1-cli% set director devices Branch3 bind lan-address 10.1.33.1/24
admin@Director-1-cli% commit
admin@Director-1-cli% exit
admin@Director-1-cli&gt; request devices workflow deploy device Branch3</pre>
<pre class="out">Workflow deploy submitted for Branch3 (revision 2). Check: show devices brief</pre>
<p>Sequence dhyan se dekho: <b>commit</b> (intent badlo), <b>deploy</b> (intent push karo), <b>verify</b>. Director change ko bina deploy kiye commit karne se branch par kuch nahi badalta.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Revision timeline">
<line x1="40" y1="100" x2="610" y2="100" stroke="#64748b" stroke-width="3"/>
<circle cx="110" cy="100" r="14" fill="#bbf7d0"/><text x="110" y="104" text-anchor="middle" class="svg-ink" font-size="12">r1</text><text x="110" y="140" text-anchor="middle" class="svg-muted" font-size="12">pehla push</text>
<circle cx="300" cy="100" r="14" fill="#bbf7d0"/><text x="300" y="104" text-anchor="middle" class="svg-ink" font-size="12">r2</text><text x="300" y="140" text-anchor="middle" class="svg-muted" font-size="12">LAN change</text>
<circle cx="490" cy="100" r="14" fill="#fed7aa"/><text x="490" y="104" text-anchor="middle" class="svg-ink" font-size="12">r3</text><text x="490" y="140" text-anchor="middle" class="svg-muted" font-size="12">galat value</text>
<path d="M490 82 C440 30 360 30 310 82" fill="none" stroke="#0369a1" stroke-width="2"/><polygon points="304,74 312,86 318,76" fill="#0369a1"/>
<text x="400" y="30" text-anchor="middle" class="svg-accent" font-size="12">r2 data par rollback</text>
</svg><p class="cap">Har deploy ek revision hai; bad revision ko pichhla data restore karke dobara deploy karke theek karte hain.</p></div>

<h3>Rollback</h3>
<p>Rollback ke do layers hain aur wo alag hain:</p>
<ul>
<li><b>CLI session rollback.</b> Configuration mode mein <code>rollback</code> uncommitted changes discard karta hai, aur <code>show | compare</code> dikhata hai ki aap kya commit karne wale ho. Ye commit se <i>pehle</i> aapko bachata hai.</li>
<li><b>Revision rollback.</b> Bad deploy ke baad pichhla template ya bind data values restore karo aur dobara deploy karo, jisse purane content ke saath naya revision bana. Real Versa Director mein configuration history review aur versions compare karne bhi deta hai. Course model simple rakhta hai: data fix karo aur redeploy karo.</li>
</ul>
<div class="note"><p>Model ka ek safety behaviour: agar branch ka overlay session down hai, to Director naya revision push nahi kar sakta; status current revision ko active rakhta hai aur Detail mein bata deta hai. Ye working branch ko aise push se bachata hai jo wo receive nahi kar sakti.</p></div>

<h3>Undeploy</h3>
<p><code>request devices workflow undeploy device Branch3</code> Director mein device ka deployed workflow withdraw karta hai. Ye us device ke liye aage ke pushes rok deta hai. Site pause ya retire karte time ye pehla step hai. Model mein ye deployed marker clear karta hai; device Deployed = no dikhata hai.</p>

<h3>Decommission aur re-stage</h3>
<p>Site retire karne ya box reuse karne ke liye dono sides saaf karni hoti hain:</p>
<ol>
<li>Director mein: undeploy, phir device (aur uska bind data) remove karo taaki serial free ho jaye.</li>
<li>Branch par: staging reset karo taaki wo factory staging state mein wapas aaye, <code>request staging reset</code>, jo Director-pushed configuration bhi hata deta hai.</li>
</ol>
<pre class="out">admin@Branch3-cli&gt; request staging reset
Staging state and Director-pushed configuration removed (device is back to factory staging state).</pre>
<p>Serial box ki identity hai. Jo hardware kahin aur ship ho gaya hai uske liye live device record kabhi mat chhodo.</p>

<div class="eg"><p><b>Worked example.</b> Delhi apna LAN 10.1.1.0/24 se 10.1.11.0/24 mein move karta hai. Steps: Branch1 ka bind data edit karo, commit karo, kya badlega uska diff review karo, maintenance window schedule karo, deploy karo (r2), overlay verify karo aur ye bhi ki Bengaluru naya prefix seekhta hai, completion announce karo. Rollback plan: purani bind value restore karo aur dobara deploy karo (r3).</p></div>

<div class="warn"><p><b>Common mistakes:</b> business hours ke beech shared template change karna; galti se live branch undeploy karna (ye configuration delete karne jaisa nahi hai, lekin management pushes rok deta hai); site band hone ke baad purane devices Director mein chhod dena.</p></div>
<div class="exam"><p><b>Exam trap:</b> Director commit branch change nahi hai. Commit par intent badalta hai; deploy par reality badalti hai.</p></div>

<div class="scn"><h4>Template edit jo wait karta raha</h4><p>Ek engineer ne 11:00 baje BR-DUAL ke SLA values edit kiye aur deploy kiye bina lunch par chala gaya. 11:30 par ek colleague ne naya site deploy kiya aur anjaane mein badla hua SLA usko de diya, jabki 40 purani sites par purana SLA tha. Reports mein kai din inconsistent behaviour dikha.</p><p><b>Lesson:</b> commit aur deploy ko ek hi change maano jiska owner aur window ho. Change record mein dono likho.</p></div>

<div class="iv"><p class="q">"100 branches ke template mein safe change kaise karoge?"</p><p>Diff review, pehle pilot group par test, window schedule, waves mein deploy, har wave mein overlay aur ek business application verify, aur rollback ke liye pichhli values redeploy ke liye ready.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Director-pushed lines branch par read-only hain; Director mein badlo.</li>
<li>Commit intent badalta hai; deploy revision banata aur push karta hai.</li>
<li>Rollback = pichhla data restore karke redeploy; CLI rollback sirf uncommitted edits discard karta hai.</li>
<li>Undeploy workflow withdraw karta hai; decommission Director record saaf karta aur branch reset karta hai.</li>
<li>Bada blast radius matlab pilots, windows aur waves.</li>
</ul></div>
`}};export{e as default};