var e={id:`cleanup`,h:{en:`Clean-up, shadowed rules, change discipline and summary`,hi:`Clean-up, shadowed rules, change discipline aur summary`},body:{en:`
<p>A policy is never finished. Rules are added for a project and forgotten. Two years later nobody dares to delete anything, and the list is long, slow to read and full of risk. This final chapter covers the warnings the console gives you, how to clean up safely, and then gives the summary and exam checklist for the whole module.</p>

<h3>Analogy: the cupboard</h3>
<p>A cupboard where everyone puts things and nobody removes anything ends up with old files, broken keys and a locked drawer nobody can open. A policy is the same. Regular, careful tidying keeps it useful and safe.</p>

<h3>Shadowed rules</h3>
<p>A rule is <b>shadowed</b> when an earlier rule already matches everything it would match. The shadowed rule can never fire. The console raises a <b>shadow warning</b> on install. It does not block, but it is a clue: either the rule is useless, or it is in the wrong place, as in lab <b>fp-policy-3</b> where a broad Discard sits above an Allow.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Shadowed rule">
<rect x="20" y="20" width="360" height="34" rx="6" fill="#fed7aa"/><text x="30" y="42" class="svg-ink" font-size="12">1  net-staff to net-dmz  any  Discard   hits 52</text>
<rect x="20" y="62" width="360" height="34" rx="6" fill="#e2e8f0"/><text x="30" y="84" class="svg-ink" font-size="12">2  net-staff to srv-web  HTTPS  Allow    hits 0</text>
<text x="400" y="84" class="svg-accent" font-size="12">shadowed by rule 1</text>
<text x="20" y="130" class="svg-ink" font-size="13">Fix: move rule 2 above rule 1, or narrow rule 1.</text>
<text x="20" y="155" class="svg-muted" font-size="12">Then install and check that the counter on rule 2 moves.</text>
</svg><p class="cap">Zero hits plus a shadow warning is the signature of a rule that can never match.</p></div>

<h3>The allow any-any warning</h3>
<p>A rule with source any, destination any and service any and the action Allow says "everything is allowed". Once it sits high in the list, nothing below it can ever matter. The console warns you. Sometimes it is put in on purpose for a short test; the discipline is to remove it and replace it with specific rules.</p>

<h3>Change discipline</h3>
<ol>
<li><b>One purpose per change.</b> Do not mix a clean-up with a new project in a single install.</li>
<li><b>Evidence first.</b> Use hit counters and the match test to show a rule is unused or shadowed before you change it.</li>
<li><b>Disable before delete.</b> Disable a doubtful rule, install, and watch for complaints. Delete after a quiet period.</li>
<li><b>Name and describe.</b> A good name and comment saves the next engineer an hour.</li>
<li><b>Install, then verify.</b> Run the match test or a live test, read the logs, and keep the install result with its warnings.</li>
<li><b>Know the rollback.</b> The engine keeps the previous installed policy snapshots (the last six in the simulator), and a failed install changes nothing.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> The Pune policy shows two warnings after an install: rule 6 shadowed by rule 3, and rule 9 allow any-any-any. The admin checks counters: rule 6 has zero hits, rule 9 has thousands because it quietly allows traffic that rules 4 to 8 were meant to control. The admin opens a change: disable rule 9, install, read the logs for Discards that should have been Allows, add the missing narrow rules, and only then delete rule 9. Rule 6 is moved above rule 3 after confirming the intent.</p></div>

<div class="warn"><p><b>Common mistake.</b> Deleting a zero-hit rule right after reinstalling a policy or on a quiet weekend. Zero hits since last install proves little. Observe over a full business cycle first.</p></div>
<div class="exam"><p><b>Exam trap.</b> Shadow and any-any are warnings, so install proceeds. Missing elements are errors, so install is blocked.</p></div>

<div class="scn"><h4>The quarterly clean-up</h4><p>The Network Kings Pune security lead scheduled a quarterly review. Counters showed 11 rules with zero hits and two shadow warnings. The team disabled the zero-hit rules, installed, and watched the Logs for one week. One rule came back into use at month-end for a payroll upload and was re-enabled; the other ten were deleted. Warnings dropped to zero and the policy was a third shorter.</p><p><b>Lesson:</b> evidence, disable, observe, then delete.</p></div>
<div class="iv"><p class="q">"How do you safely clean up an old firewall policy?"</p><p>Collect evidence from hit counters and logs over a full business cycle, resolve shadow warnings, disable before deleting, make small changes, install and verify, and keep a rollback path. Mention that any-any Allow rules should be replaced by specific ones.</p></div>

<h3>Summary and exam checklist</h3>
<p><b>You should now be able to:</b></p>
<ul>
<li>Describe the parts of an Access rule: Source, Destination, Service, Action and options (logging, inspection, VPN, authentication, time).</li>
<li>Name the actions Allow, Discard, Refuse, Continue and Jump and say what each does.</li>
<li>Explain first match, the implicit discard and how disabled rules behave.</li>
<li>Explain template rules (T1..) above own rules (1..) and why branches share a template.</li>
<li>Explain Jump into a sub-policy (3.1..), the return when nothing matches, and that sub-policies cannot hold NAT.</li>
<li>Use hit counters and the Policy match test to prove which rule matched.</li>
<li>Choose log levels and explain Discard against Refuse.</li>
<li>Explain authentication rules and time-range rules, including why a rule is never active.</li>
<li>Explain install validation: errors block, warnings do not, failed install changes nothing.</li>
</ul>
<dl class="terms">
<dt>Access rule</dt><dd>One row of the policy: match columns, action and options.</dd>
<dt>Implicit discard</dt><dd>The built-in drop for connections that match no rule.</dd>
<dt>Template</dt><dd>A policy whose rules appear on top of every policy based on it.</dd>
<dt>Sub-policy</dt><dd>A named group of rules reached by a Jump rule; no NAT inside.</dd>
<dt>Continue</dt><dd>Sets defaults such as log level; matching goes on.</dd>
<dt>Shadowed rule</dt><dd>A rule that can never match because an earlier one covers it.</dd>
<dt>Install</dt><dd>Validate, compile and copy the policy to the engine; the engine runs the installed copy.</dd>
</dl>
<div class="kt"><p><b>Most tested facts</b></p><ul>
<li>Order is top to bottom, first match wins, and template rules come first.</li>
<li>Log levels: None, Transient, Stored, Essential, Alert; default Stored.</li>
<li>Discard is silent; Refuse answers the client.</li>
<li>Authentication and time rules are skipped when their condition is not met.</li>
<li>Errors block install, warnings do not, and a failed install changes nothing.</li>
<li>Shadow and allow any-any are warnings; always check counters before deleting.</li>
</ul></div>
`,hi:`
<p>Policy kabhi khatam nahi hoti. Rules kisi project ke liye add hote hain aur bhula diye jaate hain. Do saal baad koi kuch delete karne ki himmat nahi karta, aur list lambi, padhne mein dheemi aur risk se bhari ho jati hai. Yeh aakhri chapter console ki warnings, safe clean-up, aur phir poore module ka summary aur exam checklist deta hai.</p>

<h3>Analogy: almari</h3>
<p>Jis almari mein sab cheezein rakhte hain aur koi hataata nahi, usme purani files, tooti chaabiyan aur ek locked drawer ho jaati hai jo koi khol nahi sakta. Policy bhi waisi hi hai. Regular, dhyan se safai use kaam ki aur safe rakhti hai.</p>

<h3>Shadowed rules</h3>
<p>Rule <b>shadowed</b> hota hai jab pehle ka rule woh sab kuch match kar leta hai jo yeh karta. Shadowed rule kabhi fire nahi hota. Console install par <b>shadow warning</b> deta hai. Yeh block nahi karti, par clue hai: ya rule bekaar hai, ya galat jagah par hai, jaise lab <b>fp-policy-3</b> mein jahan broad Discard Allow ke upar hai.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Shadowed rule">
<rect x="20" y="20" width="360" height="34" rx="6" fill="#fed7aa"/><text x="30" y="42" class="svg-ink" font-size="12">1  net-staff to net-dmz  any  Discard   hits 52</text>
<rect x="20" y="62" width="360" height="34" rx="6" fill="#e2e8f0"/><text x="30" y="84" class="svg-ink" font-size="12">2  net-staff to srv-web  HTTPS  Allow    hits 0</text>
<text x="400" y="84" class="svg-accent" font-size="12">rule 1 se shadowed</text>
<text x="20" y="130" class="svg-ink" font-size="13">Fix: rule 2 ko rule 1 ke upar le jao, ya rule 1 narrow karo.</text>
<text x="20" y="155" class="svg-muted" font-size="12">Phir install karo aur check karo rule 2 ka counter badhta hai.</text>
</svg><p class="cap">Zero hits plus shadow warning us rule ki pehchan hai jo kabhi match nahi kar sakta.</p></div>

<h3>Allow any-any warning</h3>
<p>Source any, destination any, service any aur action Allow wala rule kehta hai "sab kuch allowed hai". Jab woh list mein upar ho, to uske neeche kuch matter nahi karta. Console warning deta hai. Kabhi kabhi use short test ke liye jaan-boojh kar lagate hain; discipline yeh hai ki use hata kar specific rules lagao.</p>

<h3>Change discipline</h3>
<ol>
<li><b>Ek change, ek purpose.</b> Ek install mein clean-up aur naya project mix mat karo.</li>
<li><b>Pehle evidence.</b> Rule badalne se pehle hit counters aur match test se dikhao ki woh unused ya shadowed hai.</li>
<li><b>Delete se pehle disable.</b> Shaky rule ko disable karo, install karo, complaints dekho. Quiet period ke baad delete karo.</li>
<li><b>Naam aur description.</b> Accha naam aur comment agle engineer ka ek ghanta bachata hai.</li>
<li><b>Install, phir verify.</b> Match test ya live test chalao, logs padho, aur install result warnings ke saath rakho.</li>
<li><b>Rollback jaano.</b> Engine pichli installed policy snapshots rakhta hai (simulator mein aakhri chhe), aur failed install kuch nahi badalta.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Install ke baad Pune policy do warnings dikhati hai: rule 6 rule 3 se shadowed, aur rule 9 allow any-any-any. Admin counters check karta hai: rule 6 ke zero hits, rule 9 ke hazaaron hits kyunki woh chupchap woh traffic allow kar raha hai jise rules 4 se 8 control karne wale the. Admin change kholta hai: rule 9 disable karo, install karo, logs mein woh Discards dekho jo Allow hone chahiye the, missing narrow rules add karo, aur tab rule 9 delete karo. Rule 6 ko intent confirm karke rule 3 ke upar le jaya jata hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Policy reinstall ke turant baad ya shaant weekend par zero-hit rule delete karna. Pichle install se zero hits kuch zyada prove nahi karte. Pehle poora business cycle observe karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Shadow aur any-any warnings hain, to install chalta hai. Missing elements errors hain, to install block hota hai.</p></div>

<div class="scn"><h4>Quarterly clean-up</h4><p>Network Kings Pune ke security lead ne quarterly review rakha. Counters ne 11 rules zero hits ke aur do shadow warnings dikhaye. Team ne zero-hit rules disable kiye, install kiya, aur ek hafte Logs dekhe. Ek rule month-end par payroll upload ke liye wapas use mein aaya aur re-enable hua; baaki das delete ho gaye. Warnings zero ho gayi aur policy ek tihai chhoti ho gayi.</p><p><b>Lesson:</b> evidence, disable, observe, phir delete.</p></div>
<div class="iv"><p class="q">"Purani firewall policy ko safely clean up kaise karoge?"</p><p>Poore business cycle ke hit counters aur logs se evidence lo, shadow warnings resolve karo, delete se pehle disable karo, chhote changes karo, install karke verify karo, aur rollback path rakho. Yeh bhi bolo ki any-any Allow rules ko specific rules se replace karna chahiye.</p></div>

<h3>Summary aur exam checklist</h3>
<p><b>Ab aap yeh kar sakte ho:</b></p>
<ul>
<li>Access rule ke parts batana: Source, Destination, Service, Action aur options (logging, inspection, VPN, authentication, time).</li>
<li>Actions Allow, Discard, Refuse, Continue aur Jump ke naam aur kaam batana.</li>
<li>First match, implicit discard aur disabled rules ka behaviour samjhana.</li>
<li>Template rules (T1..) apne rules (1..) ke upar kyun, aur branches template kyun share karti hain, samjhana.</li>
<li>Sub-policy (3.1..) mein Jump, no match par return, aur sub-policy mein NAT nahi ho sakta, samjhana.</li>
<li>Hit counters aur Policy match test se prove karna ki kaunsa rule match hua.</li>
<li>Log levels chunna aur Discard aur Refuse ka fark samjhana.</li>
<li>Authentication rules aur time-range rules samjhana, aur rule kabhi active kyun nahi hota.</li>
<li>Install validation samjhana: errors block, warnings nahi, failed install kuch nahi badalta.</li>
</ul>
<dl class="terms">
<dt>Access rule</dt><dd>Policy ki ek row: match columns, action aur options.</dd>
<dt>Implicit discard</dt><dd>Jo connection kisi rule se match nahi karti uske liye built-in drop.</dd>
<dt>Template</dt><dd>Aisi policy jiske rules us par based har policy ke upar aate hain.</dd>
<dt>Sub-policy</dt><dd>Jump rule se pahunchne wala named rules group; andar NAT nahi.</dd>
<dt>Continue</dt><dd>Log level jaise defaults set karta hai; matching aage jati hai.</dd>
<dt>Shadowed rule</dt><dd>Aisa rule jo kabhi match nahi kar sakta kyunki pehle ka rule use cover karta hai.</dd>
<dt>Install</dt><dd>Validate, compile aur policy ko engine tak copy karna; engine installed copy chalata hai.</dd>
</dl>
<div class="kt"><p><b>Sabse zyada poochhe jaane wale facts</b></p><ul>
<li>Order upar se neeche hai, first match jeetta hai, aur template rules pehle aate hain.</li>
<li>Log levels: None, Transient, Stored, Essential, Alert; default Stored.</li>
<li>Discard silent hai; Refuse client ko jawab deta hai.</li>
<li>Authentication aur time rules condition poori na hone par skip hote hain.</li>
<li>Errors install block karte hain, warnings nahi, aur failed install kuch nahi badalta.</li>
<li>Shadow aur allow any-any warnings hain; delete se pehle hamesha counters check karo.</li>
</ul></div>
`}};export{e as default};