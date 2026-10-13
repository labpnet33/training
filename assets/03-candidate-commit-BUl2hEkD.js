var e={id:`candidate-commit`,h:{en:`Candidate, running and commit in practice`,hi:`Practice mein candidate, running aur commit`},body:{en:`
<p><b>Analogy: a wedding invitation.</b> You draft the invitation (candidate), a relative proofreads it (validation), and only when it is perfect do you print and send it (commit). Once it is sent you cannot recall it, but you can send a correction. PAN-OS works in the same careful way, and the first lab starts with exactly this cycle: rename the firewall and commit.</p>

<h3>The cycle, step by step</h3>
<ol>
<li>Enter configure mode.</li>
<li>Make edits. They go to the candidate only.</li>
<li>Review: <code>show</code> branches or <code>show config candidate</code>.</li>
<li><code>commit</code>. PAN-OS validates, then applies.</li>
<li>Verify in operational mode.</li>
</ol>
<p>Lab task 1 is the shortest possible cycle: <code>set deviceconfig system hostname NK-PUNE-PA</code>, then <code>commit</code>. After the commit succeeds the prompt changes from <code>PA1</code> to <code>NK-PUNE-PA</code>. The prompt is a free verification: it reads the running configuration.</p>
<pre class="out">admin@PA1# set deviceconfig system hostname NK-PUNE-PA
admin@PA1# commit

Commit job 3 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
<span class="hl">Configuration committed successfully</span>
admin@NK-PUNE-PA# </pre>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Commit cycle">
<rect x="10" y="40" width="110" height="55" rx="8" fill="#fde68a"/><text x="65" y="72" text-anchor="middle" class="svg-ink" font-size="13">1 Edit</text>
<rect x="140" y="40" width="110" height="55" rx="8" fill="#bae6fd"/><text x="195" y="72" text-anchor="middle" class="svg-ink" font-size="13">2 Review</text>
<rect x="270" y="40" width="110" height="55" rx="8" fill="#ddd6fe"/><text x="325" y="72" text-anchor="middle" class="svg-ink" font-size="13">3 Validate</text>
<rect x="400" y="40" width="110" height="55" rx="8" fill="#bbf7d0"/><text x="455" y="72" text-anchor="middle" class="svg-ink" font-size="13">4 Commit</text>
<rect x="530" y="40" width="100" height="55" rx="8" fill="#fed7aa"/><text x="580" y="72" text-anchor="middle" class="svg-ink" font-size="13">5 Verify</text>
<line x1="120" y1="67" x2="140" y2="67" stroke="#64748b" stroke-width="2"/><line x1="250" y1="67" x2="270" y2="67" stroke="#64748b" stroke-width="2"/><line x1="380" y1="67" x2="400" y2="67" stroke="#64748b" stroke-width="2"/><line x1="510" y1="67" x2="530" y2="67" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">A failed validation stops at step 3 and the running configuration is untouched.</text>
</svg><p class="cap">Edit, review, validate, commit, verify.</p></div>

<h3>Reading validation errors</h3>
<p>PAN-OS refuses a commit with a list of problems. Each line has a path and a reason. Typical reasons you will meet in the labs:</p>
<ul>
<li><b>is not a valid reference</b>: you named something that does not exist or is not valid yet (a zone, a profile, an interface).</li>
<li><b>... is missing</b>: a required field was not set (a rule without source, destination or service).</li>
</ul>
<p>A misspelt management profile on an interface produces one precise line:</p>
<pre class="out">admin@PA1# set network profiles interface-management-profile lan ping yes
admin@PA1# set network interface ethernet ethernet1/2 layer3 interface-management-profile lanx
admin@PA1# commit

Validation Error:
 <span class="hl">network -&gt; interface -&gt; ethernet -&gt; ethernet1/2 -&gt; layer3 interface-management-profile 'lanx' is not a valid reference</span>
Commit failed</pre>
<p>The profile is named <code>lan</code>, not <code>lanx</code>. Fix the typo and commit again. Because the commit failed, <i>none</i> of your pending edits were applied. Remember the habit from the overview: commit in small blocks so an error points at a small change.</p>

<h3>Jobs, and proving the commit worked</h3>
<p><code>show jobs all</code> lists each commit, newest first, with its status and result. Use it when you are not sure a commit finished, or when someone else may have committed:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show jobs all
Enqueued              Dequeued              ID    Type        Status  Result  Completed
-----------------------------------------------------------------------------------------------
2026-10-02 03:40:07   2026-10-02 03:40:07   3     Commit      FIN     OK      2026-10-02 03:40:07
2026-10-02 03:39:37   2026-10-02 03:39:37   2     Commit      FIN     OK      2026-10-02 03:39:37</pre>

<h3>Discarding drafts</h3>
<p>In configure mode, <code>revert config</code> replaces the candidate with the running configuration ("Candidate configuration reverted to the running configuration"). Use it when you realise your uncommitted edits are wrong. Real PAN-OS also has saved snapshots, loading earlier versions and a commit lock that stops two admins from clashing. These are not in the simulator but are part of daily practice on real firewalls and appear in exam questions.</p>

<div class="eg"><p><b>Worked example.</b> You add the zone assignment for ethernet1/2 before you have configured the interface. Commit prints "zone -&gt; trust -&gt; network -&gt; layer3 'ethernet1/2' is not a valid reference". The cure is not to fiddle with the zone but to configure the interface first, then commit zone and interface together or in the right order. Order of creation matters when one object refers to another.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reading the first validation error only (there may be six). Fixing one error and recommitting without reading the rest. Assuming "commit failed" means "partly applied".</p></div>
<div class="exam"><p><b>Exam trap.</b> "What does the prompt hostname reflect?" The running configuration. "Commit failed with an invalid reference: what is the production impact?" None, since nothing was applied.</p></div>

<div class="scn"><h4>The typo that taught the team to read errors</h4><p>A junior engineer saw "Commit failed" and retyped the whole interface block, which did not help. The real message was a single line naming the misspelt profile. After that the team added a rule to every change: read the Validation Error list top to bottom and fix the first problem named, then re-read.</p><p><b>Lesson:</b> the error text is a precise pointer. Read it.</p></div>

<div class="iv"><p class="q">"A commit fails with validation errors. What is the state of the firewall and how do you proceed?"</p><p>The firewall is unchanged because validation is all or nothing. Read every error line, fix the candidate or revert config, commit again and confirm with show jobs all that the job finished OK. In a team, check the commit lock and pending changes from other admins first.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cycle: edit, review, validate, commit, verify.</li>
<li>The prompt hostname follows the running configuration.</li>
<li>Validation errors give a path and a reason; read all of them.</li>
<li>show jobs all proves commits finished; revert config discards drafts.</li>
<li>When one object refers to another, create the referred object first.</li>
</ul></div>
`,hi:`
<p><b>Analogy: shaadi ka card.</b> Aap invitation ka draft banate ho (candidate), koi rishtedaar proofread karta hai (validation), aur jab sab perfect ho tabhi print karke bhejte ho (commit). Bhejne ke baad wapas nahi bula sakte, lekin correction bhej sakte ho. PAN-OS isi savdhani se kaam karta hai, aur pehla lab bilkul isi cycle se shuru hota hai: firewall ka naam badlo aur commit karo.</p>

<h3>Cycle, step by step</h3>
<ol>
<li>Configure mode mein jao.</li>
<li>Edits karo. Woh sirf candidate mein jaate hain.</li>
<li>Review: <code>show</code> branches ya <code>show config candidate</code>.</li>
<li><code>commit</code>. PAN-OS validate karta hai, phir apply.</li>
<li>Operational mode mein verify karo.</li>
</ol>
<p>Lab task 1 sabse chhota cycle hai: <code>set deviceconfig system hostname NK-PUNE-PA</code>, phir <code>commit</code>. Commit succeed hone ke baad prompt <code>PA1</code> se <code>NK-PUNE-PA</code> ho jaata hai. Prompt free verification hai: woh running configuration padhta hai.</p>
<pre class="out">admin@PA1# set deviceconfig system hostname NK-PUNE-PA
admin@PA1# commit

Commit job 3 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
<span class="hl">Configuration committed successfully</span>
admin@NK-PUNE-PA# </pre>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Commit cycle">
<rect x="10" y="40" width="110" height="55" rx="8" fill="#fde68a"/><text x="65" y="72" text-anchor="middle" class="svg-ink" font-size="13">1 Edit</text>
<rect x="140" y="40" width="110" height="55" rx="8" fill="#bae6fd"/><text x="195" y="72" text-anchor="middle" class="svg-ink" font-size="13">2 Review</text>
<rect x="270" y="40" width="110" height="55" rx="8" fill="#ddd6fe"/><text x="325" y="72" text-anchor="middle" class="svg-ink" font-size="13">3 Validate</text>
<rect x="400" y="40" width="110" height="55" rx="8" fill="#bbf7d0"/><text x="455" y="72" text-anchor="middle" class="svg-ink" font-size="13">4 Commit</text>
<rect x="530" y="40" width="100" height="55" rx="8" fill="#fed7aa"/><text x="580" y="72" text-anchor="middle" class="svg-ink" font-size="13">5 Verify</text>
<line x1="120" y1="67" x2="140" y2="67" stroke="#64748b" stroke-width="2"/><line x1="250" y1="67" x2="270" y2="67" stroke="#64748b" stroke-width="2"/><line x1="380" y1="67" x2="400" y2="67" stroke="#64748b" stroke-width="2"/><line x1="510" y1="67" x2="530" y2="67" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">Fail hui validation step 3 par ruk jaati hai aur running configuration untouched rehti hai.</text>
</svg><p class="cap">Edit, review, validate, commit, verify.</p></div>

<h3>Validation errors padhna</h3>
<p>PAN-OS commit ko problems ki list ke saath refuse karta hai. Har line mein ek path aur ek wajah hoti hai. Labs mein jo aam wajah milengi:</p>
<ul>
<li><b>is not a valid reference</b>: aapne aisi cheez ka naam liya jo exist nahi karti ya abhi valid nahi (zone, profile, interface).</li>
<li><b>... is missing</b>: required field set nahi hua (source, destination ya service ke bina rule).</li>
</ul>
<p>Interface par galat spelling ka management profile ek precise line deta hai:</p>
<pre class="out">admin@PA1# set network profiles interface-management-profile lan ping yes
admin@PA1# set network interface ethernet ethernet1/2 layer3 interface-management-profile lanx
admin@PA1# commit

Validation Error:
 <span class="hl">network -&gt; interface -&gt; ethernet -&gt; ethernet1/2 -&gt; layer3 interface-management-profile 'lanx' is not a valid reference</span>
Commit failed</pre>
<p>Profile ka naam <code>lan</code> hai, <code>lanx</code> nahi. Typo theek karo aur dobara commit karo. Commit fail hua, isliye aapke pending edits mein se <i>kuch bhi</i> apply nahi hua. Overview ki aadat yaad rakho: chhote blocks mein commit karo taaki error chhote change ki taraf ishara kare.</p>

<h3>Jobs, aur commit kaam kiya yeh saabit karna</h3>
<p><code>show jobs all</code> har commit ko newest first, status aur result ke saath list karta hai. Jab pakka na ho ki commit khatam hua, ya kisi aur ne commit kiya ho sakta hai, tab use karo:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show jobs all
Enqueued              Dequeued              ID    Type        Status  Result  Completed
-----------------------------------------------------------------------------------------------
2026-10-02 03:40:07   2026-10-02 03:40:07   3     Commit      FIN     OK      2026-10-02 03:40:07
2026-10-02 03:39:37   2026-10-02 03:39:37   2     Commit      FIN     OK      2026-10-02 03:39:37</pre>

<h3>Drafts phenkna</h3>
<p>Configure mode mein <code>revert config</code> candidate ko running configuration se replace karta hai ("Candidate configuration reverted to the running configuration"). Jab samajh aaye ki aapke uncommitted edits galat hain tab use karo. Real PAN-OS mein saved snapshots, purane versions load karna aur commit lock bhi hai jo do admins ko takraane se rokta hai. Yeh simulator mein nahi hain lekin real firewalls par roz ke kaam mein aate hain aur exam questions mein bhi.</p>

<div class="eg"><p><b>Worked example.</b> Aap interface configure karne se pehle ethernet1/2 ka zone assignment jodte ho. Commit "zone -&gt; trust -&gt; network -&gt; layer3 'ethernet1/2' is not a valid reference" print karta hai. Ilaaj zone ke saath chhedchhad nahi balki pehle interface configure karna hai, phir zone aur interface ek saath ya sahi order mein commit karo. Jab ek object doosre ko refer kare to creation ka order matter karta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sirf pehla validation error padhna (chhe ho sakte hain). Ek error theek karke baaki padhe bina recommit karna. Maan lena ki "commit failed" ka matlab "aadha apply hua".</p></div>
<div class="exam"><p><b>Exam trap.</b> "Prompt ka hostname kya reflect karta hai?" Running configuration. "Commit invalid reference ke saath fail hua: production par asar?" Koi nahi, kyunki kuch apply nahi hua.</p></div>

<div class="scn"><h4>Typo jisne team ko errors padhna sikhaya</h4><p>Ek junior engineer ne "Commit failed" dekha aur poora interface block dobara type kiya, jisse kuch fayda nahi hua. Asli message ek hi line thi jisme galat spelling ka profile likha tha. Uske baad team ne har change mein ek niyam jodi: Validation Error list upar se neeche padho aur pehli batayi problem theek karo, phir dobara padho.</p><p><b>Lesson:</b> error text ek precise pointer hai. Use padho.</p></div>

<div class="iv"><p class="q">"Commit validation errors ke saath fail hua. Firewall ki state kya hai aur aap aage kaise badhte ho?"</p><p>Firewall unchanged hai kyunki validation all or nothing hai. Har error line padho, candidate theek karo ya revert config karo, dobara commit karo aur show jobs all se confirm karo ki job OK ke saath finished hua. Team mein pehle commit lock aur doosre admins ke pending changes check karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cycle: edit, review, validate, commit, verify.</li>
<li>Prompt hostname running configuration ko follow karta hai.</li>
<li>Validation errors path aur wajah dete hain; saare padho.</li>
<li>show jobs all commits finish hue yeh saabit karta hai; revert config drafts phenkta hai.</li>
<li>Ek object doosre ko refer kare to refer hone wala object pehle banao.</li>
</ul></div>
`}};export{e as default};