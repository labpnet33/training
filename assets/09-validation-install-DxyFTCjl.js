var e={id:`install`,h:{en:`Validation when installing a policy`,hi:`Policy install karte waqt validation`},body:{en:`
<p>Install is the moment your plan becomes the engine's reality. Before that happens, the SMC checks the policy. This <b>validation</b> protects you from sending a broken policy to a live firewall. This chapter explains what the check looks at, the difference between errors and warnings, and what happens when an install fails.</p>

<h3>Analogy: the pre-flight checklist</h3>
<p>Before a plane leaves the gate, the crew runs a checklist. A missing fuel report stops the flight. A dim cabin light is noted but the flight goes. Validation is the same: <b>errors block</b> the install, <b>warnings do not</b>.</p>

<h3>Errors that block install</h3>
<p>These are things the engine cannot work without. In the simulator the main ones are:</p>
<ul>
<li>A rule refers to a <b>missing element</b>, alias value, service, time range, user group, sub-policy or template (for example a rule uses <code>srv-mail</code> but that element was deleted).</li>
<li>An interface has an invalid address.</li>
<li>A route gateway is not on any interface network.</li>
<li>The engine has no inspection policy assigned.</li>
<li>A cluster node address is outside the cluster virtual network.</li>
<li>The SMC has no contact with a node.</li>
</ul>
<p>Only the policy-related ones matter for this module, but the install bar checks all of them together, which is why a fault outside the policy can also block your policy install.</p>

<h3>Warnings that do not block</h3>
<ul>
<li>A <b>shadowed rule</b> that can never match because an earlier rule already covers it.</li>
<li>An <b>allow any-any-any</b> rule, which allows everything.</li>
</ul>
<p>Warnings travel with the install result. The install goes ahead, and the warning stays visible so a reviewer can act on it. Do not mistake "installed" for "good".</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Install validation flow">
<rect x="20" y="85" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="115" text-anchor="middle" class="svg-ink" font-size="13">Install policy</text>
<rect x="180" y="85" width="120" height="50" rx="8" fill="#fde68a"/><text x="240" y="115" text-anchor="middle" class="svg-ink" font-size="13">Validate</text>
<rect x="360" y="20" width="260" height="50" rx="8" fill="#fed7aa"/><text x="490" y="40" text-anchor="middle" class="svg-ink" font-size="12">Errors: install stops</text><text x="490" y="58" text-anchor="middle" class="svg-muted" font-size="12">engine keeps the old policy</text>
<rect x="360" y="95" width="260" height="50" rx="8" fill="#bbf7d0"/><text x="490" y="115" text-anchor="middle" class="svg-ink" font-size="12">Warnings only: compile and install</text><text x="490" y="133" text-anchor="middle" class="svg-muted" font-size="12">warnings kept in the result</text>
<rect x="360" y="170" width="260" height="50" rx="8" fill="#e2e8f0"/><text x="490" y="190" text-anchor="middle" class="svg-ink" font-size="12">Clean: compile and install</text>
<line x1="140" y1="110" x2="178" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="300" y1="100" x2="358" y2="45" stroke="#64748b" stroke-width="2"/><line x1="300" y1="110" x2="358" y2="120" stroke="#64748b" stroke-width="2"/><line x1="300" y1="120" x2="358" y2="195" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Validation has three outcomes. Only errors stop the install.</p></div>

<h3>A failed install changes nothing</h3>
<p>If validation finds an error, the install stops before anything is sent. The engine keeps running the <b>previously installed policy</b>. This is a rollback in effect: nothing half-applied, no change to connections. Existing simulated connections are cleared only when an install succeeds. The SMC still holds your edits, so you fix the cause and install again.</p>
<pre class="out">Install policy  engine NK-PUNE-FW  policy NK-PUNE
Validation:
<span class="hl">  ERROR   rule 4: element srv-mail not found</span>
  WARNING rule 9: allow any any any
Install blocked. Engine keeps installed policy rev 6.</pre>
<p>After you restore or recreate the element and install again:</p>
<pre class="out">Validation:
  WARNING rule 9: allow any any any
<span class="hl">Install successful. New installed policy rev 7.</span></pre>

<div class="eg"><p><b>Worked example.</b> Lab <b>fp-policy-5</b>: install is blocked by a validation error. The message names a missing element. Read the message, find the rule that names the element, and decide between two fixes: recreate the element with the right address or change the rule to use an element that exists. Then install again. The lab passes only after a successful install, because checks read the installed policy.</p></div>

<h3>A short troubleshooting routine</h3>
<ol>
<li>Read the validation text. It tells you the rule and the missing item.</li>
<li>Decide whether the rule or the element is wrong.</li>
<li>Fix it in the Elements or Policies page.</li>
<li>Install again and confirm the success line.</li>
<li>Run the Policy match test to confirm behaviour.</li>
</ol>

<div class="warn"><p><b>Common mistake.</b> Deleting an element that rules still use, for tidiness. The policy looks fine until the next install, when the missing-element error blocks every pending change, including unrelated ones. Check where an element is used before removing it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Errors block, warnings do not. A failed install does not partially apply: the engine keeps the old policy. A successful install clears simulated connections, so long-running test sessions restart.</p></div>

<div class="scn"><h4>Friday install that went nowhere</h4><p>An admin edited three rules on a Friday afternoon and pressed install. The install bar showed an error: a rule referred to a server element another engineer had deleted that morning. Nothing changed on the engine, so users saw no disturbance. The admin recreated the element with the correct address, installed again, and the new rules went live. The warning about a broad rule stayed on the result, so the team opened a ticket to narrow it on Monday.</p><p><b>Lesson:</b> a blocked install is a safety net, not a failure. Read it, fix it, install again.</p></div>
<div class="iv"><p class="q">"What happens if a policy install fails validation?"</p><p>The install stops before anything is applied, and the engine keeps running the previous policy, so there is no impact on traffic. The error names the problem, such as a missing element. You fix it and install again. Warnings, such as shadowed rules or allow any-any, do not block, but they should be reviewed.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Validation runs before install: errors block, warnings do not.</li>
<li>A missing element, service, time range, group, sub-policy or template is an error.</li>
<li>A failed install changes nothing; the old policy stays.</li>
<li>Warnings include shadowed rules and allow any-any-any.</li>
<li>Labs pass only after a successful install.</li>
</ul></div>
`,hi:`
<p>Install woh pal hai jab aapka plan engine ki reality ban jata hai. Usse pehle SMC policy check karta hai. Yeh <b>validation</b> aapko live firewall par kharab policy bhejne se bachata hai. Yeh chapter batata hai ki check kya dekhta hai, errors aur warnings mein kya fark hai, aur install fail hone par kya hota hai.</p>

<h3>Analogy: pre-flight checklist</h3>
<p>Plane gate se nikalne se pehle crew checklist chalata hai. Fuel report missing ho to flight ruk jati hai. Cabin ki ek light dim ho to note hota hai par flight chalti hai. Validation bhi waisa hi hai: <b>errors install block karte hain</b>, <b>warnings nahi</b>.</p>

<h3>Errors jo install block karte hain</h3>
<p>Yeh woh cheezein hain jinke bina engine kaam nahi kar sakta. Simulator mein mukhya yeh hain:</p>
<ul>
<li>Rule <b>missing element</b>, alias value, service, time range, user group, sub-policy ya template ko refer karta hai (jaise rule <code>srv-mail</code> use karta hai par woh element delete ho gaya).</li>
<li>Interface ka address invalid hai.</li>
<li>Route gateway kisi interface network par nahi hai.</li>
<li>Engine ko inspection policy assign nahi hai.</li>
<li>Cluster node address cluster virtual network ke bahar hai.</li>
<li>SMC ka node se contact nahi hai.</li>
</ul>
<p>Is module ke liye sirf policy se jude errors matter karte hain, par install bar sabko saath check karta hai, isliye policy ke bahar ki fault bhi aapka policy install block kar sakti hai.</p>

<h3>Warnings jo block nahi karte</h3>
<ul>
<li><b>Shadowed rule</b> jo kabhi match nahi kar sakta kyunki pehle ka rule use already cover karta hai.</li>
<li><b>Allow any-any-any</b> rule, jo sab kuch allow karta hai.</li>
</ul>
<p>Warnings install result ke saath jaati hain. Install aage badhta hai, aur warning visible rehti hai taaki reviewer action le sake. "Installed" ko "accha" mat samajhna.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Install validation flow">
<rect x="20" y="85" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="115" text-anchor="middle" class="svg-ink" font-size="13">Install policy</text>
<rect x="180" y="85" width="120" height="50" rx="8" fill="#fde68a"/><text x="240" y="115" text-anchor="middle" class="svg-ink" font-size="13">Validate</text>
<rect x="360" y="20" width="260" height="50" rx="8" fill="#fed7aa"/><text x="490" y="40" text-anchor="middle" class="svg-ink" font-size="12">Errors: install ruk jata hai</text><text x="490" y="58" text-anchor="middle" class="svg-muted" font-size="12">engine purani policy rakhta hai</text>
<rect x="360" y="95" width="260" height="50" rx="8" fill="#bbf7d0"/><text x="490" y="115" text-anchor="middle" class="svg-ink" font-size="12">Sirf warnings: compile aur install</text><text x="490" y="133" text-anchor="middle" class="svg-muted" font-size="12">warnings result mein rehti hain</text>
<rect x="360" y="170" width="260" height="50" rx="8" fill="#e2e8f0"/><text x="490" y="190" text-anchor="middle" class="svg-ink" font-size="12">Clean: compile aur install</text>
<line x1="140" y1="110" x2="178" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="300" y1="100" x2="358" y2="45" stroke="#64748b" stroke-width="2"/><line x1="300" y1="110" x2="358" y2="120" stroke="#64748b" stroke-width="2"/><line x1="300" y1="120" x2="358" y2="195" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Validation ke teen outcomes hain. Sirf errors install rokte hain.</p></div>

<h3>Failed install kuch nahi badalta</h3>
<p>Agar validation ko error mile, install kuch bhejne se pehle ruk jata hai. Engine <b>pehle se installed policy</b> chalata rehta hai. Yeh asal mein rollback hai: aadha-adhura kuch apply nahi hota, connections par asar nahi padta. Simulated connections tabhi clear hoti hain jab install succeed ho. SMC aapke edits rakhta hai, to aap wajah fix karke dubara install karte ho.</p>
<pre class="out">Install policy  engine NK-PUNE-FW  policy NK-PUNE
Validation:
<span class="hl">  ERROR   rule 4: element srv-mail not found</span>
  WARNING rule 9: allow any any any
Install blocked. Engine keeps installed policy rev 6.</pre>
<p>Element restore ya recreate karke dubara install karne ke baad:</p>
<pre class="out">Validation:
  WARNING rule 9: allow any any any
<span class="hl">Install successful. New installed policy rev 7.</span></pre>

<div class="eg"><p><b>Worked example.</b> Lab <b>fp-policy-5</b>: install validation error se block hota hai. Message missing element ka naam batata hai. Message padho, woh rule dhundho jo element ka naam use karta hai, aur do fixes mein se chuno: sahi address ke saath element recreate karo ya rule ko aise element par badlo jo exist karta hai. Phir dubara install karo. Lab sirf successful install ke baad pass hota hai, kyunki checks installed policy padhte hain.</p></div>

<h3>Chhota troubleshooting routine</h3>
<ol>
<li>Validation text padho. Woh rule aur missing cheez batata hai.</li>
<li>Tay karo rule galat hai ya element.</li>
<li>Elements ya Policies page par fix karo.</li>
<li>Dubara install karo aur success line confirm karo.</li>
<li>Behaviour confirm karne ke liye Policy match test chalao.</li>
</ol>

<div class="warn"><p><b>Common mistake.</b> Safai ke naam par aisa element delete karna jo rules abhi bhi use karte hain. Policy agle install tak theek dikhti hai, phir missing-element error har pending change ko block karta hai, unrelated changes ko bhi. Hataane se pehle check karo element kahan use hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Errors block karte hain, warnings nahi. Failed install partially apply nahi hota: engine purani policy rakhta hai. Successful install simulated connections clear karta hai, to lambe test sessions restart ho jaate hain.</p></div>

<div class="scn"><h4>Friday ka install jo kahin nahi gaya</h4><p>Ek admin ne Friday dopahar teen rules edit kiye aur install dabaya. Install bar ne error dikhaya: ek rule us server element ko refer kar raha tha jo subah doosre engineer ne delete kar diya tha. Engine par kuch nahi badla, to users ko koi disturbance nahi dikha. Admin ne sahi address ke saath element recreate kiya, dubara install kiya, aur naye rules live ho gaye. Broad rule ki warning result par rahi, to team ne Monday ko use narrow karne ka ticket khola.</p><p><b>Lesson:</b> blocked install safety net hai, failure nahi. Padho, fix karo, dubara install karo.</p></div>
<div class="iv"><p class="q">"Policy install validation fail ho jaye to kya hota hai?"</p><p>Install kuch apply hone se pehle ruk jata hai, aur engine pichli policy chalata rehta hai, to traffic par koi impact nahi. Error problem batata hai, jaise missing element. Aap fix karke dubara install karte ho. Shadowed rules ya allow any-any jaisi warnings block nahi karti, par unka review hona chahiye.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Validation install se pehle chalta hai: errors block, warnings nahi.</li>
<li>Missing element, service, time range, group, sub-policy ya template error hai.</li>
<li>Failed install kuch nahi badalta; purani policy rehti hai.</li>
<li>Warnings mein shadowed rules aur allow any-any-any aate hain.</li>
<li>Labs sirf successful install ke baad pass hote hain.</li>
</ul></div>
`}};export{e as default};