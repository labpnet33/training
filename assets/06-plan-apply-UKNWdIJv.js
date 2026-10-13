var e={id:`plan-apply`,h:{en:`The workflow: plan, apply and destroy, and how to read a plan`,hi:`Workflow: plan, apply aur destroy, aur plan kaise padhein`},body:{en:`
<p>Everything you have written so far is only text. Three commands turn it into reality, and the most important skill in Terraform is <b>reading the plan before you approve it</b>. This chapter explains the commands and teaches you to read the symbols, without inventing any output: the real thing appears on your own screen.</p>

<h3>Analogy: the building inspector's report</h3>
<p>Before work starts, the inspector walks the site with your blueprint and writes a report: "add 2 windows, repaint 1 wall, demolish the shed." You read it, you say yes or no, and only then do the builders start. <code>terraform plan</code> is that report. <code>terraform apply</code> is the builders starting. <code>terraform destroy</code> is the demolition crew.</p>

<h3>The three commands</h3>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator)</span>
terraform plan -out=tfplan     <span class="c"># compare files with reality, save the plan to a file</span>
terraform apply tfplan         <span class="c"># make exactly the changes in that saved plan</span>
terraform destroy              <span class="c"># remove everything this configuration manages</span></pre>
<ul>
<li><b>plan</b> reads your .tf files and the state (chapter 7), asks the platform what exists now, and prints the difference. It changes nothing. <code>-out=tfplan</code> saves the plan.</li>
<li><b>apply</b> on a saved plan makes exactly those changes, so what was reviewed is what is applied. If you run apply without a file, Terraform makes a fresh plan and asks you to type yes.</li>
<li><b>destroy</b> plans the removal of every object in the state and asks for confirmation. Use it for lab environments, rarely for production.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Terraform workflow">
<rect x="10" y="50" width="100" height="55" rx="10" fill="#bae6fd"/><text x="60" y="82" text-anchor="middle" class="svg-ink" font-size="13">init</text>
<rect x="135" y="50" width="100" height="55" rx="10" fill="#fde68a"/><text x="185" y="82" text-anchor="middle" class="svg-ink" font-size="13">validate</text>
<rect x="260" y="50" width="100" height="55" rx="10" fill="#ddd6fe"/><text x="310" y="82" text-anchor="middle" class="svg-ink" font-size="13">plan</text>
<rect x="385" y="50" width="100" height="55" rx="10" fill="#fed7aa"/><text x="435" y="82" text-anchor="middle" class="svg-ink" font-size="13">review</text>
<rect x="510" y="50" width="120" height="55" rx="10" fill="#bbf7d0"/><text x="570" y="82" text-anchor="middle" class="svg-ink" font-size="13">apply</text>
<line x1="110" y1="77" x2="135" y2="77" stroke="#64748b" stroke-width="2"/><line x1="235" y1="77" x2="260" y2="77" stroke="#64748b" stroke-width="2"/><line x1="360" y1="77" x2="385" y2="77" stroke="#64748b" stroke-width="2"/><line x1="485" y1="77" x2="510" y2="77" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">a human (or a policy check) approves between plan and apply</text>
</svg><p class="cap">Plan is the safe preview; apply is the change.</p></div>

<h3>Reading the plan: symbols</h3>
<table class="cmp"><tr><th>Symbol</th><th>Meaning</th><th>Risk</th></tr>
<tr><td><code>+</code></td><td>create a new object</td><td>usually low</td></tr>
<tr><td><code>~</code></td><td>update in place (change a setting)</td><td>check which setting</td></tr>
<tr><td><code>-</code></td><td>destroy the object</td><td>high: read twice</td></tr>
<tr><td><code>-/+</code></td><td>destroy and recreate (a setting cannot change in place)</td><td>high: may cause an outage</td></tr></table>
<p>Each changed argument is listed under its object. Values Terraform will only learn after the apply (such as an id) are shown as "known after apply". At the bottom a summary line counts how many objects will be added, changed and destroyed. Your habit: look at the summary first. If it says something you did not expect (a destroy when you only meant to add), stop and find out why.</p>

<h3>A review checklist</h3>
<ol>
<li>Are there any destroys or replacements? Is each one intended?</li>
<li>Does the number of changes match the size of your edit? A one-line edit that changes forty objects is a warning sign.</li>
<li>Are the addresses and CIDR blocks the ones you expect?</li>
<li>Is any argument shown as sensitive or hidden? Fine; it is protected.</li>
</ol>

<h3>Apply behaviour</h3>
<p>Apply creates objects in dependency order and in parallel where possible. If one object fails, Terraform stops starting new work, records what already succeeded in the state, and reports the error. You fix the cause and run plan and apply again: Terraform continues from where reality is, not from the beginning. That is the benefit of declarative.</p>
<p>Two flags to treat with care. <code>-auto-approve</code> skips the yes prompt; use it only in a pipeline where the plan was already approved. <code>-target</code> applies only one object; it is for emergencies, because it can leave the rest of the design out of step.</p>

<div class="eg"><p><b>Worked example.</b> You add a third subnet entry to the map variable. The plan shows one object marked create, the summary says one to add and zero to change or destroy. That matches your edit, so you approve. If the summary had said one to destroy, you would stop and investigate before approving anything.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Running apply without reading the plan because "it worked yesterday". Another is rerunning apply repeatedly hoping a failure goes away. Read the error message; Terraform's errors usually name the exact argument and the platform's reason.</p></div>
<div class="exam"><p><b>Exam trap.</b> plan never changes anything; apply with a saved plan applies exactly that plan; destroy is itself a plan-and-confirm operation. A change to some arguments forces replacement, shown as -/+, and replacement of a VPC or a firewall means an outage.</p></div>

<div class="scn"><h4>The plan that said destroy</h4><p>A pipeline job at a retailer ran plan on a pull request that only edited a tag. The plan comment showed one route table marked for replacement because a colleague had also changed an argument that cannot be updated in place. The reviewer asked why a tag change touched routing, the argument was reverted, and the plan went back to one in-place update.</p><p><b>Lesson:</b> the plan is your last cheap chance to catch a costly mistake.</p></div>

<div class="iv"><p class="q">"Explain terraform plan versus apply and how you make them safe."</p><p>Plan computes and shows the difference between the code and reality without changing anything; apply performs the changes. For safety I save the plan to a file and apply that exact file, review destroys and replacements, run plan in a pull request for peer review, restrict who can apply, and avoid auto-approve outside a controlled pipeline.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>plan previews, apply changes, destroy removes; apply a saved plan to apply exactly what was reviewed.</li>
<li>Symbols: + create, ~ update in place, - destroy, -/+ replace.</li>
<li>Read the summary line first; unexpected destroys mean stop.</li>
<li>After a partial failure fix the cause and rerun; state records what succeeded.</li>
<li>Treat -auto-approve and -target with great care.</li>
</ul></div>
`,hi:`
<p>Ab tak jo bhi aapne likha woh sirf text hai. Teen commands use reality banate hain, aur Terraform ka sabse zaroori skill hai <b>approve karne se pehle plan padhna</b>. Yeh chapter commands samjhata hai aur symbols padhna sikhata hai, bina koi output invent kiye: asli output aapki apni screen par dikhega.</p>

<h3>Analogy: building inspector ki report</h3>
<p>Kaam shuru hone se pehle inspector aapke blueprint ke saath site ghoomta hai aur report likhta hai: "2 khidkiyan jodo, 1 deewar repaint karo, shed todo." Aap padhte ho, haan ya na kehte ho, aur tabhi builders shuru karte hain. <code>terraform plan</code> woh report hai. <code>terraform apply</code> builders ka shuru karna hai. <code>terraform destroy</code> todne wali crew hai.</p>

<h3>Teen commands</h3>
<pre class="code"><span class="c"># Reference configuration (simulator mein run nahi hua)</span>
terraform plan -out=tfplan     <span class="c"># files ko reality se compare karo, plan file mein save karo</span>
terraform apply tfplan         <span class="c"># theek wahi changes karo jo us saved plan mein hain</span>
terraform destroy              <span class="c"># is configuration ka manage kiya sab kuch hatao</span></pre>
<ul>
<li><b>plan</b> aapki .tf files aur state (chapter 7) padhta hai, platform se poochta hai abhi kya maujood hai, aur farak print karta hai. Kuch nahi badalta. <code>-out=tfplan</code> plan ko save karta hai.</li>
<li>Saved plan par <b>apply</b> theek wahi changes karta hai, isliye jo review hua wahi apply hota hai. File ke bina apply chalao to Terraform naya plan banata hai aur yes type karne ko kehta hai.</li>
<li><b>destroy</b> state ke har object ko hatane ka plan banata hai aur confirmation maangta hai. Lab environments ke liye use karo, production ke liye kabhi-kabhar.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Terraform workflow">
<rect x="10" y="50" width="100" height="55" rx="10" fill="#bae6fd"/><text x="60" y="82" text-anchor="middle" class="svg-ink" font-size="13">init</text>
<rect x="135" y="50" width="100" height="55" rx="10" fill="#fde68a"/><text x="185" y="82" text-anchor="middle" class="svg-ink" font-size="13">validate</text>
<rect x="260" y="50" width="100" height="55" rx="10" fill="#ddd6fe"/><text x="310" y="82" text-anchor="middle" class="svg-ink" font-size="13">plan</text>
<rect x="385" y="50" width="100" height="55" rx="10" fill="#fed7aa"/><text x="435" y="82" text-anchor="middle" class="svg-ink" font-size="13">review</text>
<rect x="510" y="50" width="120" height="55" rx="10" fill="#bbf7d0"/><text x="570" y="82" text-anchor="middle" class="svg-ink" font-size="13">apply</text>
<line x1="110" y1="77" x2="135" y2="77" stroke="#64748b" stroke-width="2"/><line x1="235" y1="77" x2="260" y2="77" stroke="#64748b" stroke-width="2"/><line x1="360" y1="77" x2="385" y2="77" stroke="#64748b" stroke-width="2"/><line x1="485" y1="77" x2="510" y2="77" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">plan aur apply ke beech insaan (ya policy check) approve karta hai</text>
</svg><p class="cap">Plan safe preview hai; apply change hai.</p></div>

<h3>Plan padhna: symbols</h3>
<table class="cmp"><tr><th>Symbol</th><th>Matlab</th><th>Risk</th></tr>
<tr><td><code>+</code></td><td>naya object banao</td><td>aam taur par kam</td></tr>
<tr><td><code>~</code></td><td>jagah par update (setting badlo)</td><td>dekho kaunsi setting</td></tr>
<tr><td><code>-</code></td><td>object destroy karo</td><td>zyada: do baar padho</td></tr>
<tr><td><code>-/+</code></td><td>destroy karke recreate (setting jagah par nahi badal sakti)</td><td>zyada: outage ho sakta hai</td></tr></table>
<p>Har badla hua argument apne object ke neeche listed hota hai. Jo values Terraform apply ke baad hi jaanega (jaise id) woh "known after apply" dikhti hain. Neeche ek summary line gintati hai kitne objects add, change aur destroy honge. Aapki aadat: pehle summary dekho. Agar kuch unexpected likha hai (sirf add karna tha par destroy), ruko aur wajah dhoondho.</p>

<h3>Review checklist</h3>
<ol>
<li>Koi destroy ya replacement hai? Kya har ek intended hai?</li>
<li>Changes ki sankhya aapke edit ke size se match karti hai? Ek line ka edit chaalis objects badle to yeh warning sign hai.</li>
<li>Addresses aur CIDR blocks wahi hain jo expected the?</li>
<li>Koi argument sensitive ya hidden dikhta hai? Theek hai; woh protected hai.</li>
</ol>

<h3>Apply ka behaviour</h3>
<p>Apply objects ko dependency order mein aur jahan ho sake parallel banata hai. Ek object fail ho to Terraform naya kaam shuru karna rok deta hai, jo pehle safal hua use state mein record karta hai, aur error report karta hai. Aap wajah theek karke plan aur apply dobara chalate ho: Terraform wahan se aage badhta hai jahan reality hai, shuru se nahi. Yahi declarative ka fayda hai.</p>
<p>Do flags se savdhan raho. <code>-auto-approve</code> yes prompt skip karta hai; sirf pipeline mein use karo jahan plan pehle approve ho chuka ho. <code>-target</code> sirf ek object apply karta hai; yeh emergencies ke liye hai, kyunki baaki design ko step se bahar chhod sakta hai.</p>

<div class="eg"><p><b>Worked example.</b> Aap map variable mein teesri subnet entry jodte ho. Plan ek object ko create mark karke dikhata hai, summary kehti hai ek add, zero change ya destroy. Yeh aapke edit se match karta hai, isliye approve karte ho. Summary mein ek destroy hota to aap approve karne se pehle ruk kar jaanch karte.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> "Kal chala tha" kehkar plan padhe bina apply chalana. Ek aur: failure khud theek ho jaayegi sochkar apply baar-baar chalana. Error message padho; Terraform ke errors aam taur par exact argument aur platform ki wajah batate hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> plan kabhi kuch nahi badalta; saved plan ke saath apply theek wahi plan apply karta hai; destroy khud bhi plan-aur-confirm operation hai. Kuch arguments ka change replacement force karta hai, jo -/+ dikhta hai, aur VPC ya firewall ka replacement matlab outage.</p></div>

<div class="scn"><h4>Plan jisne destroy kaha</h4><p>Ek retailer ke pipeline job ne sirf tag edit karne wale pull request par plan chalaya. Plan comment mein ek route table replacement ke liye marked dikha kyunki ek colleague ne ek aisa argument bhi badla tha jo jagah par update nahi ho sakta. Reviewer ne poocha tag change routing ko kyun chhu raha hai, argument revert hua, aur plan ek in-place update par lauta.</p><p><b>Lesson:</b> plan kisi mehnge galti ko pakadne ka aapka aakhri sasta mauka hai.</p></div>

<div class="iv"><p class="q">"terraform plan aur apply samjhao aur unhe safe kaise banate ho."</p><p>Plan code aur reality ka farak bina kuch badle compute karke dikhata hai; apply changes karta hai. Safety ke liye main plan ko file mein save karke wahi file apply karta hoon, destroys aur replacements review karta hoon, peer review ke liye pull request mein plan chalata hoon, kaun apply kar sakta hai restrict karta hoon, aur controlled pipeline ke bahar auto-approve avoid karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>plan preview karta hai, apply badalta hai, destroy hatata hai; saved plan apply karo taaki wahi apply ho jo review hua.</li>
<li>Symbols: + create, ~ jagah par update, - destroy, -/+ replace.</li>
<li>Pehle summary line padho; unexpected destroy matlab ruko.</li>
<li>Partial failure ke baad wajah theek karke rerun karo; state record rakhti hai kya safal hua.</li>
<li>-auto-approve aur -target ko bahut savdhani se use karo.</li>
</ul></div>
`}};export{e as default};