var e={id:`change-routine`,h:{en:`The change routine: validate, small blast radius, verify, document`,hi:`Change routine: validate, chhota blast radius, verify, document`},body:{en:`
<p>You now know the parts: candidate and running, commit and push, packages, options, order, per-firewall results, jobs, clashes, pending changes. This chapter ties them into a routine you can repeat on every change, so that quality does not depend on mood or memory.</p>

<h3>Analogy: the pre-flight checklist</h3>
<p>Pilots with thousands of hours still run the same checklist before take-off. Not because they forget how to fly, but because the cost of one skipped item is huge. A Panorama push touches many firewalls at once; it deserves a checklist.</p>

<h3>The routine in seven steps</h3>
<ol>
<li><b>Define.</b> What exactly changes, on which firewalls, which package (device group, template, collector), and what is the expected result?</li>
<li><b>Prepare.</b> Back up, check who else is working, look for pending local changes on target firewalls, and write the rollback.</li>
<li><b>Commit to Panorama.</b> Only your change, reviewed. Confirm it with show devices all (Out of Sync is expected).</li>
<li><b>Validate.</b> Run the push with validate-only yes and read every firewall line.</li>
<li><b>Pilot.</b> Push with all options explicit to one firewall using the device filter.</li>
<li><b>Verify.</b> On the firewall: show config pushed-shared-policy or pushed-template, show running security-policy, a test-security-policy-match, and a real user test. On Panorama: show jobs all and show devices all.</li>
<li><b>Roll out and document.</b> Push to the rest, then record what ran, results, the job ids and any follow-ups.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Routine">
<rect x="6" y="30" width="82" height="44" rx="6" fill="#bae6fd"/><text x="47" y="56" text-anchor="middle" class="svg-ink" font-size="11">Define</text>
<rect x="96" y="30" width="82" height="44" rx="6" fill="#bae6fd"/><text x="137" y="56" text-anchor="middle" class="svg-ink" font-size="11">Prepare</text>
<rect x="186" y="30" width="82" height="44" rx="6" fill="#fde68a"/><text x="227" y="56" text-anchor="middle" class="svg-ink" font-size="11">Commit</text>
<rect x="276" y="30" width="82" height="44" rx="6" fill="#ddd6fe"/><text x="317" y="56" text-anchor="middle" class="svg-ink" font-size="11">Validate</text>
<rect x="366" y="30" width="82" height="44" rx="6" fill="#fed7aa"/><text x="407" y="56" text-anchor="middle" class="svg-ink" font-size="11">Pilot</text>
<rect x="456" y="30" width="82" height="44" rx="6" fill="#bbf7d0"/><text x="497" y="56" text-anchor="middle" class="svg-ink" font-size="11">Verify</text>
<rect x="546" y="30" width="88" height="44" rx="6" fill="#e2e8f0"/><text x="590" y="56" text-anchor="middle" class="svg-ink" font-size="11">Roll out + log</text>
</svg><p class="cap">Seven steps. Skipping validate or verify is how outages start.</p></div>

<h3>A worked example</h3>
<pre class="code"><span class="c">! 3 and 4: commit, then dry run on every firewall</span>
PANO&gt; configure
PANO# commit
PANO# exit
PANO&gt; commit-all shared-policy device-group NK-BRANCHES include-template no merge-with-candidate-cfg no validate-only yes
<span class="c">! 5: pilot on Pune only</span>
PANO&gt; commit-all shared-policy device-group NK-BRANCHES include-template no merge-with-candidate-cfg no device 0079185321121
<span class="c">! 6: verify on the firewall</span>
PA1&gt; show config pushed-shared-policy
PA1&gt; test security-policy-match from trust to untrust source 10.1.1.10 destination 8.8.8.8 protocol 6 destination-port 22</pre>
<p>Only when Pune behaves as predicted do you push to Delhi and Chennai. The same options appear in the pilot and the roll-out, so the two pushes mean the same thing.</p>

<h3>Blast radius</h3>
<p>Blast radius is how many sites a mistake can hurt. Reduce it with the device filter, with targeted rules (a rule with <code>target devices</code> applies only to those firewalls), and by splitting big changes. Prefer three small pushes with verification to one large push with hope.</p>

<h3>Documentation</h3>
<p>Write down: the ticket id, the commands including options, the job ids, which firewalls were In Sync afterwards, and who verified. This record is what you open at 2 a.m. when someone asks "what changed?".</p>

<div class="warn"><p><b>Common mistakes.</b> Skipping the pilot because the change is "just one rule"; verifying only on Panorama; recording nothing; mixing a template change and a policy change in one window without a plan for which to roll back.</p></div>
<div class="exam"><p><b>Exam trap.</b> Verification happens on the firewall as well as on Panorama. Panorama saying In Sync is good evidence, but the firewall's own show commands and a user test close the loop.</p></div>

<div class="scn"><h4>The calm Friday</h4><p>A team needed to block Telnet on forty branches. They validated, pushed to one pilot branch, tested from a user PC, then pushed in two waves. One branch failed validation on a local-rule clash and was fixed before any push. No user noticed. The notes in the ticket took five minutes to write.</p><p><b>Lesson:</b> boring routines prevent exciting outages.</p></div>

<div class="iv"><p class="q">"Walk me through how you deploy a policy change with Panorama."</p><p>Define scope, back up and check pending local changes, commit to Panorama, validate-only, pilot on one firewall with explicit options, verify on the firewall with show commands and a user test, roll out, and document the job ids.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use the same seven-step routine for every change.</li>
<li>Validate-only, then pilot with the device filter.</li>
<li>Verify on the firewall and on Panorama.</li>
<li>Document commands, options, jobs and results.</li>
</ul></div>
`,hi:`
<p>Ab aap parts jaante ho: candidate aur running, commit aur push, packages, options, order, per-firewall results, jobs, clashes, pending changes. Ye chapter unhe ek routine mein jodta hai jo aap har change par repeat kar sako, taaki quality mood ya memory par depend na kare.</p>

<h3>Analogy: pre-flight checklist</h3>
<p>Hazaaron ghante wale pilots bhi take-off se pehle wahi checklist chalate hain. Isliye nahi ki wo udna bhool gaye, balki isliye ki ek skip hui item ki keemat bahut badi hoti hai. Panorama push ek saath kai firewalls ko touch karta hai; uske liye checklist banti hai.</p>

<h3>Seven steps ka routine</h3>
<ol>
<li><b>Define.</b> Exactly kya badal raha hai, kin firewalls par, kaunsa package (device group, template, collector), aur expected result kya hai?</li>
<li><b>Prepare.</b> Backup lo, check karo aur kaun kaam kar raha hai, target firewalls par pending local changes dekho, aur rollback likho.</li>
<li><b>Commit to Panorama.</b> Sirf aapka change, reviewed. show devices all se confirm karo (Out of Sync expected hai).</li>
<li><b>Validate.</b> Push validate-only yes ke saath chalao aur har firewall line padho.</li>
<li><b>Pilot.</b> Saare options explicit rakhkar device filter se ek firewall par push karo.</li>
<li><b>Verify.</b> Firewall par: show config pushed-shared-policy ya pushed-template, show running security-policy, test-security-policy-match, aur real user test. Panorama par: show jobs all aur show devices all.</li>
<li><b>Roll out aur document.</b> Baaki par push karo, phir record karo kya chala, results, job ids aur follow-ups.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Routine">
<rect x="6" y="30" width="82" height="44" rx="6" fill="#bae6fd"/><text x="47" y="56" text-anchor="middle" class="svg-ink" font-size="11">Define</text>
<rect x="96" y="30" width="82" height="44" rx="6" fill="#bae6fd"/><text x="137" y="56" text-anchor="middle" class="svg-ink" font-size="11">Prepare</text>
<rect x="186" y="30" width="82" height="44" rx="6" fill="#fde68a"/><text x="227" y="56" text-anchor="middle" class="svg-ink" font-size="11">Commit</text>
<rect x="276" y="30" width="82" height="44" rx="6" fill="#ddd6fe"/><text x="317" y="56" text-anchor="middle" class="svg-ink" font-size="11">Validate</text>
<rect x="366" y="30" width="82" height="44" rx="6" fill="#fed7aa"/><text x="407" y="56" text-anchor="middle" class="svg-ink" font-size="11">Pilot</text>
<rect x="456" y="30" width="82" height="44" rx="6" fill="#bbf7d0"/><text x="497" y="56" text-anchor="middle" class="svg-ink" font-size="11">Verify</text>
<rect x="546" y="30" width="88" height="44" rx="6" fill="#e2e8f0"/><text x="590" y="56" text-anchor="middle" class="svg-ink" font-size="11">Roll out + log</text>
</svg><p class="cap">Seven steps. Validate ya verify skip karna outages ki shuruaat hai.</p></div>

<h3>Worked example</h3>
<pre class="code"><span class="c">! 3 aur 4: commit, phir har firewall par dry run</span>
PANO&gt; configure
PANO# commit
PANO# exit
PANO&gt; commit-all shared-policy device-group NK-BRANCHES include-template no merge-with-candidate-cfg no validate-only yes
<span class="c">! 5: sirf Pune par pilot</span>
PANO&gt; commit-all shared-policy device-group NK-BRANCHES include-template no merge-with-candidate-cfg no device 0079185321121
<span class="c">! 6: firewall par verify</span>
PA1&gt; show config pushed-shared-policy
PA1&gt; test security-policy-match from trust to untrust source 10.1.1.10 destination 8.8.8.8 protocol 6 destination-port 22</pre>
<p>Pune predicted tareeke se behave kare tabhi Delhi aur Chennai par push karo. Pilot aur roll-out mein wahi options aate hain, isliye dono pushes ka matlab same hai.</p>

<h3>Blast radius</h3>
<p>Blast radius yaani galti kitni sites ko hurt kar sakti hai. Isse kam karo device filter se, targeted rules se (<code>target devices</code> wali rule sirf unhi firewalls par lagti hai), aur bade changes ko todkar. Ek bade push par ummeed se behtar hai verification ke saath teen chhote pushes.</p>

<h3>Documentation</h3>
<p>Likho: ticket id, options samet commands, job ids, baad mein kaunse firewalls In Sync the, aur kisne verify kiya. Ye record wo hai jo raat ke 2 baje kholte ho jab koi poochhe "kya badla?".</p>

<div class="warn"><p><b>Common mistakes.</b> Pilot skip karna kyunki change "bas ek rule" hai; sirf Panorama par verify karna; kuch record na karna; ek window mein template aur policy change mix karna bina plan ke ki kaunsa rollback hoga.</p></div>
<div class="exam"><p><b>Exam trap.</b> Verification Panorama ke saath firewall par bhi hota hai. Panorama ka In Sync achha evidence hai, par firewall ke apne show commands aur user test loop poora karte hain.</p></div>

<div class="scn"><h4>Shaant Friday</h4><p>Ek team ko chaalis branches par Telnet block karna tha. Unhone validate kiya, ek pilot branch par push kiya, user PC se test kiya, phir do waves mein push kiya. Ek branch validation mein local-rule clash par fail hui aur kisi push se pehle fix ho gayi. Kisi user ko pata nahi chala. Ticket mein notes likhne mein paanch minute lage.</p><p><b>Lesson:</b> boring routines exciting outages ko rokte hain.</p></div>

<div class="iv"><p class="q">"Panorama se policy change kaise deploy karte ho, walk me through."</p><p>Scope define, backup aur pending local changes check, commit to Panorama, validate-only, explicit options ke saath ek firewall par pilot, firewall par show commands aur user test se verify, roll out, aur job ids document.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har change par wahi seven-step routine use karo.</li>
<li>Validate-only, phir device filter se pilot.</li>
<li>Firewall par aur Panorama par verify karo.</li>
<li>Commands, options, jobs aur results document karo.</li>
</ul></div>
`}};export{e as default};