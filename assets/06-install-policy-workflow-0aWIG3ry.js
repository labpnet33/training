var e={id:`install-policy-workflow`,h:{en:`The Install Policy workflow`,hi:`Install Policy workflow`},body:{en:`
<p>Think of a newspaper. Editors write and correct stories all day, and nothing reaches readers. Only when the final pages are approved and sent to the printing press does the printed paper change. If the press finds a broken page, it stops, and yesterday's edition stays on sale. The SMC works the same way. Your edits are the draft. <b>Install policy</b> is the press. The engine is the printed edition that readers (users) actually get.</p>

<h3>Two copies of the truth</h3>
<p>In the simulator, and in the real product concept, there are two layers:</p>
<ul>
<li><b>Candidate (edited) layer:</b> the SMC database where you create elements, edit rules and change engine settings. Changes here are immediate in the SMC but do nothing to traffic.</li>
<li><b>Installed layer:</b> the compiled snapshot that the engine is running. Traffic decisions, and the lab checks, read only this layer.</li>
</ul>
<p>The difference between the two is called <b>pending changes</b>. The Install policy bar tells you when there is a difference. A policy with pending changes is a policy whose edits have not yet reached the engine.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Install policy workflow">
<rect x="10" y="30" width="110" height="70" rx="10" fill="#bae6fd"/><text x="65" y="60" text-anchor="middle" class="svg-ink" font-size="13">1 Edit</text><text x="65" y="80" text-anchor="middle" class="svg-muted" font-size="11">candidate in SMC</text>
<rect x="150" y="30" width="110" height="70" rx="10" fill="#fde68a"/><text x="205" y="60" text-anchor="middle" class="svg-ink" font-size="13">2 Validate</text><text x="205" y="80" text-anchor="middle" class="svg-muted" font-size="11">errors, warnings</text>
<rect x="290" y="30" width="110" height="70" rx="10" fill="#ddd6fe"/><text x="345" y="60" text-anchor="middle" class="svg-ink" font-size="13">3 Compile</text><text x="345" y="80" text-anchor="middle" class="svg-muted" font-size="11">snapshot</text>
<rect x="430" y="30" width="90" height="70" rx="10" fill="#bbf7d0"/><text x="475" y="60" text-anchor="middle" class="svg-ink" font-size="13">4 Install</text><text x="475" y="80" text-anchor="middle" class="svg-muted" font-size="11">on engine</text>
<rect x="550" y="30" width="80" height="70" rx="10" fill="#fed7aa"/><text x="590" y="60" text-anchor="middle" class="svg-ink" font-size="13">5 Run</text><text x="590" y="80" text-anchor="middle" class="svg-muted" font-size="11">traffic</text>
<line x1="120" y1="65" x2="150" y2="65" stroke="#64748b" stroke-width="2"/><line x1="260" y1="65" x2="290" y2="65" stroke="#64748b" stroke-width="2"/><line x1="400" y1="65" x2="430" y2="65" stroke="#64748b" stroke-width="2"/><line x1="520" y1="65" x2="550" y2="65" stroke="#64748b" stroke-width="2"/>
<rect x="150" y="140" width="250" height="60" rx="8" fill="#fff" stroke="#64748b"/><text x="275" y="165" text-anchor="middle" class="svg-ink" font-size="12">Error found: install stops.</text><text x="275" y="185" text-anchor="middle" class="svg-ink" font-size="12">Engine keeps the old policy (rollback).</text>
<line x1="205" y1="100" x2="205" y2="140" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
</svg><p class="cap">An error at the validate step stops everything. Nothing reaches the engine and the old snapshot remains active.</p></div>

<h3>Step 1 and 2: edit and validate</h3>
<p>You change elements and rules on Elements and Policies. When you press Install policy, the SMC first <b>validates</b> the policy for the target engine. Validation produces two kinds of results:</p>
<table class="cmp"><tr><th>Result</th><th>Examples</th><th>Effect</th></tr>
<tr><td><b>Error</b></td><td>A rule names an element that does not exist; an alias has no value for this engine; a sub-policy or template is missing; an interface address is invalid; a route gateway is not on any interface network; the engine cannot be contacted</td><td>Install is <b>blocked</b>. Nothing changes.</td></tr>
<tr><td><b>Warning</b></td><td>A rule is shadowed and can never match; an allow any-any-any rule exists</td><td>Install <b>continues</b>. Please read and decide.</td></tr>
</table>

<h3>Step 3 to 5: compile, install, run</h3>
<p>If there are no errors, the SMC compiles the policy and the engine settings into a snapshot, sends it to the engine, and the engine starts running it. In the simulator the install also applies interface addresses and routes to the engine device, stores the snapshot, and <b>clears existing connections</b>. That means a download in progress at that moment will need to be started again. Real behaviour on existing connections depends on the release and the change; check the documentation for your NGFW version.</p>

<h3>Rollback and snapshots</h3>
<p>If an install fails, the engine does not end up half-configured: it keeps the previous snapshot, and the failure tells you why. This is the failed-install rollback. Separately, the SMC keeps <b>policy snapshots</b> of previous successful installs. In the lab, the last six installs of each engine are kept. A snapshot lets you view what was installed earlier and compare it with what you have now, which is useful when a change causes a problem and you want to see what changed. Fixing the problem is still done by editing and installing again.</p>

<pre class="out">Install policy  -  NK-PUNE-FW  -  policy: Pune-Policy
Validating ...
<span class="hl">ERROR   rule 4: element "net-guest" not found</span>
WARN    rule 7: shadowed by rule 3 (never matches)
Result: NOT INSTALLED. Engine keeps previous policy (rev 12).</pre>
<pre class="out">Install policy  -  NK-PUNE-FW  -  policy: Pune-Policy
Validating ...
WARN    rule 7: shadowed by rule 3 (never matches)
Compiling ... done
Installing on node 1 ... <span class="hl">done  (rev 13)</span>
Existing connections cleared.
Result: INSTALLED. Status: Online.</pre>

<div class="eg"><p><b>Worked example for lab 1.</b> The engine NK-PUNE-FW is in status No Policy Installed after sg-contact-mgmt. On Engines, select it and choose the Initial Policy as its policy. Press Install policy. Validation: the Initial Policy only uses the predefined service SMC contact and the elements srv-smc and the engine itself, so no errors. Compile, install, revision 1. Existing connections: none. Status: Online. The lab passes when the engine is Online <i>and</i> the Initial Policy is the installed one.</p></div>

<div class="eg"><p><b>Worked example for lab 2.</b> You create net-staff, net-dmz, srv-web and a service in Elements, then build a draft rule in Policies with these names, then press Install policy for the engine. If you mistype a name in the rule (for example "net-stff"), validation shows an error and the install is blocked; correct the element name and install again. Only after a successful install do checks see the new rule.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Believing the work is done after Save. Ignoring the pending-changes hint on the Install policy bar. Installing the wrong policy on the wrong engine. Reading warnings as noise. Installing a policy that removes management contact; a successful install can still lock you out.</p></div>
<div class="exam"><p><b>Exam trap.</b> A warning never blocks; an error always blocks. A failed install does not change the engine. Checks and traffic read the installed snapshot, not the candidate. Install clears existing connections in the lab.</p></div>

<div class="scn"><h4>The Friday change that "did nothing"</h4><p>A Network Kings engineer added an Allow rule for the new HR portal on Friday at 5 pm and went home. On Monday HR complained the portal was still blocked. The Install policy bar had shown pending changes all weekend. The engine was running Thursday's snapshot. The engineer installed on Monday morning; validation showed one warning, which was read this time, and the portal worked after the install.</p><p><b>Lesson:</b> saved is not installed. Close the loop: edit, validate, install, test.</p></div>

<div class="iv"><p class="q">"A user says your new rule does not work. What do you check first?"</p><p>Strong answer: first, was the policy installed on the correct engine, and are there pending changes? Then check the installed rule order, shadowing warnings, element values, and the logs for which rule matched. Explain that the candidate in the SMC is not what the engine runs, and that errors block an install while warnings do not.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Edits are a candidate in the SMC; the engine runs the installed snapshot.</li>
<li>Validate first: errors block the install, warnings do not.</li>
<li>A failed install changes nothing; the previous policy stays active.</li>
<li>The last six installs per engine are kept as snapshots in the lab.</li>
<li>In the lab an install clears existing connections; lab checks read the installed layer only.</li>
</ul></div>
`,hi:`
<p>Akhbaar ko socho. Editors poora din stories likhte aur correct karte hain, aur readers tak kuch nahi pahunchta. Final pages approve hokar printing press ko jaate hain tabhi chhapa hua akhbaar badalta hai. Press ko koi page toota mile to woh ruk jata hai, aur kal ka edition bikta rehta hai. SMC bhi aise hi kaam karta hai. Aapke edits draft hain. <b>Install policy</b> press hai. Engine woh chhapa hua edition hai jo readers (users) ko asal mein milta hai.</p>

<h3>Sach ki do copies</h3>
<p>Simulator mein, aur real product ke concept mein, do layers hain:</p>
<ul>
<li><b>Candidate (edited) layer:</b> SMC database jahan aap elements banate, rules edit karte aur engine settings badalte ho. Yahan changes SMC mein turant dikhte hain lekin traffic par kuch asar nahi.</li>
<li><b>Installed layer:</b> compiled snapshot jo engine chala raha hai. Traffic decisions, aur lab checks, sirf isi layer ko padhte hain.</li>
</ul>
<p>Dono ke beech ka difference <b>pending changes</b> kehlata hai. Install policy bar batata hai ki difference hai. Pending changes wali policy matlab woh policy jiske edits abhi engine tak nahi pahunche.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Install policy workflow">
<rect x="10" y="30" width="110" height="70" rx="10" fill="#bae6fd"/><text x="65" y="60" text-anchor="middle" class="svg-ink" font-size="13">1 Edit</text><text x="65" y="80" text-anchor="middle" class="svg-muted" font-size="11">SMC mein candidate</text>
<rect x="150" y="30" width="110" height="70" rx="10" fill="#fde68a"/><text x="205" y="60" text-anchor="middle" class="svg-ink" font-size="13">2 Validate</text><text x="205" y="80" text-anchor="middle" class="svg-muted" font-size="11">errors, warnings</text>
<rect x="290" y="30" width="110" height="70" rx="10" fill="#ddd6fe"/><text x="345" y="60" text-anchor="middle" class="svg-ink" font-size="13">3 Compile</text><text x="345" y="80" text-anchor="middle" class="svg-muted" font-size="11">snapshot</text>
<rect x="430" y="30" width="90" height="70" rx="10" fill="#bbf7d0"/><text x="475" y="60" text-anchor="middle" class="svg-ink" font-size="13">4 Install</text><text x="475" y="80" text-anchor="middle" class="svg-muted" font-size="11">engine par</text>
<rect x="550" y="30" width="80" height="70" rx="10" fill="#fed7aa"/><text x="590" y="60" text-anchor="middle" class="svg-ink" font-size="13">5 Run</text><text x="590" y="80" text-anchor="middle" class="svg-muted" font-size="11">traffic</text>
<line x1="120" y1="65" x2="150" y2="65" stroke="#64748b" stroke-width="2"/><line x1="260" y1="65" x2="290" y2="65" stroke="#64748b" stroke-width="2"/><line x1="400" y1="65" x2="430" y2="65" stroke="#64748b" stroke-width="2"/><line x1="520" y1="65" x2="550" y2="65" stroke="#64748b" stroke-width="2"/>
<rect x="150" y="140" width="250" height="60" rx="8" fill="#fff" stroke="#64748b"/><text x="275" y="165" text-anchor="middle" class="svg-ink" font-size="12">Error mila: install ruk jata hai.</text><text x="275" y="185" text-anchor="middle" class="svg-ink" font-size="12">Engine purani policy rakhta hai (rollback).</text>
<line x1="205" y1="100" x2="205" y2="140" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
</svg><p class="cap">Validate step par error aaye to sab ruk jata hai. Engine tak kuch nahi pahunchta aur purana snapshot active rehta hai.</p></div>

<h3>Step 1 aur 2: edit aur validate</h3>
<p>Aap Elements aur Policies par changes karte ho. Install policy dabate hi SMC pehle target engine ke liye policy ko <b>validate</b> karta hai. Validation do tarah ke results deta hai:</p>
<table class="cmp"><tr><th>Result</th><th>Examples</th><th>Asar</th></tr>
<tr><td><b>Error</b></td><td>Rule ek aise element ka naam leta hai jo exist nahi karta; alias ki is engine ke liye value nahi; sub-policy ya template missing; interface address invalid; route gateway kisi interface network par nahi; engine se contact nahi ho sakta</td><td>Install <b>block</b>. Kuch nahi badalta.</td></tr>
<tr><td><b>Warning</b></td><td>Rule shadowed hai aur kabhi match nahi karega; allow any-any-any rule hai</td><td>Install <b>jaari rehta hai</b>. Padho aur decide karo.</td></tr>
</table>

<h3>Step 3 se 5: compile, install, run</h3>
<p>Error na ho to SMC policy aur engine settings ko snapshot mein compile karta hai, engine ko bhejta hai, aur engine use chalana shuru karta hai. Simulator mein install engine device par interface addresses aur routes bhi apply karta hai, snapshot store karta hai, aur <b>existing connections clear</b> kar deta hai. Yaani us waqt chal raha download dobara shuru karna padega. Existing connections par real behaviour release aur change par depend karta hai; apne NGFW version ki documentation check karo.</p>

<h3>Rollback aur snapshots</h3>
<p>Install fail ho jaye to engine aadhe-adhoore configuration mein nahi rehta: woh pichla snapshot rakhta hai, aur failure batata hai kyun. Yeh failed-install rollback hai. Alag se, SMC pichhle successful installs ke <b>policy snapshots</b> rakhta hai. Lab mein har engine ke last six installs rakhe jaate hain. Snapshot se aap dekh sakte ho pehle kya install tha aur abhi se compare kar sakte ho, jo tab kaam aata hai jab koi change problem kare aur aap dekhna chahte ho kya badla. Problem fix karna phir bhi edit karke dobara install karna hi hai.</p>

<pre class="out">Install policy  -  NK-PUNE-FW  -  policy: Pune-Policy
Validating ...
<span class="hl">ERROR   rule 4: element "net-guest" not found</span>
WARN    rule 7: shadowed by rule 3 (never matches)
Result: NOT INSTALLED. Engine keeps previous policy (rev 12).</pre>
<pre class="out">Install policy  -  NK-PUNE-FW  -  policy: Pune-Policy
Validating ...
WARN    rule 7: shadowed by rule 3 (never matches)
Compiling ... done
Installing on node 1 ... <span class="hl">done  (rev 13)</span>
Existing connections cleared.
Result: INSTALLED. Status: Online.</pre>

<div class="eg"><p><b>Lab 1 ka worked example.</b> Engine NK-PUNE-FW sg-contact-mgmt ke baad No Policy Installed status mein hai. Engines mein ise select karo aur Initial Policy ko uski policy chuno. Install policy dabao. Validation: Initial Policy sirf predefined service SMC contact aur elements srv-smc aur engine khud use karti hai, isliye koi error nahi. Compile, install, revision 1. Existing connections: koi nahi. Status: Online. Lab tab pass hota hai jab engine Online ho <i>aur</i> Initial Policy installed ho.</p></div>

<div class="eg"><p><b>Lab 2 ka worked example.</b> Elements mein net-staff, net-dmz, srv-web aur ek service banate ho, phir Policies mein in naamon ke saath draft rule banate ho, phir engine ke liye Install policy dabate ho. Rule mein naam galat type ho jaye (jaise "net-stff") to validation error dikhata hai aur install block hota hai; element ka naam sahi karo aur dobara install karo. Successful install ke baad hi checks naya rule dekhte hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Save ke baad kaam khatam samajhna. Install policy bar ke pending-changes hint ko ignore karna. Galat engine par galat policy install karna. Warnings ko noise samajhna. Aisi policy install karna jo management contact hata de; successful install bhi aapko lock out kar sakta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Warning kabhi block nahi karti; error hamesha block karta hai. Failed install engine nahi badalta. Checks aur traffic installed snapshot padhte hain, candidate nahi. Lab mein install existing connections clear karta hai.</p></div>

<div class="scn"><h4>Friday ka change jisne "kuch nahi kiya"</h4><p>Network Kings ke ek engineer ne Friday 5 baje naye HR portal ke liye Allow rule joda aur ghar chala gaya. Monday ko HR ne shikayat ki ki portal ab bhi block hai. Install policy bar poore weekend pending changes dikha raha tha. Engine Thursday ka snapshot chala raha tha. Engineer ne Monday subah install kiya; validation ne ek warning dikhayi, jo is baar padhi gayi, aur install ke baad portal chal gaya.</p><p><b>Lesson:</b> saved matlab installed nahi. Loop band karo: edit, validate, install, test.</p></div>

<div class="iv"><p class="q">"User kehta hai tumhara naya rule kaam nahi kar raha. Sabse pehle kya check karoge?"</p><p>Strong answer: pehle, kya policy sahi engine par install hui hai, aur kya pending changes hain? Phir installed rule order, shadowing warnings, element values, aur logs mein dekho kaunsa rule match hua. Samjhao ki SMC ka candidate woh nahi jo engine chalata hai, aur errors install block karte hain jabki warnings nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Edits SMC mein candidate hain; engine installed snapshot chalata hai.</li>
<li>Pehle validate: errors install block karte hain, warnings nahi.</li>
<li>Failed install kuch nahi badalta; purani policy active rehti hai.</li>
<li>Lab mein har engine ke last six installs snapshots ki tarah rakhe jaate hain.</li>
<li>Lab mein install existing connections clear karta hai; lab checks sirf installed layer padhte hain.</li>
</ul></div>
`}};export{e as default};