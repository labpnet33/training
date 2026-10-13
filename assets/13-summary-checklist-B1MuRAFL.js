var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You now know how Panorama turns many scattered rulebooks into one managed policy. This chapter collects what to remember, what to be able to do, and the facts most often tested. Read it before the labs, before the quiz and before an interview.</p>

<h3>The whole module in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Module summary">
<rect x="10" y="10" width="200" height="80" rx="8" fill="#fde68a"/><text x="110" y="34" text-anchor="middle" class="svg-ink" font-size="13">Design</text><text x="110" y="54" text-anchor="middle" class="svg-muted" font-size="12">Shared, parent, child</text><text x="110" y="70" text-anchor="middle" class="svg-muted" font-size="12">objects, targets</text>
<rect x="220" y="10" width="200" height="80" rx="8" fill="#bae6fd"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">Assemble</text><text x="320" y="54" text-anchor="middle" class="svg-muted" font-size="12">commit, push the group</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">firewall merges the list</text>
<rect x="430" y="10" width="200" height="80" rx="8" fill="#bbf7d0"/><text x="530" y="34" text-anchor="middle" class="svg-ink" font-size="13">Prove</text><text x="530" y="54" text-anchor="middle" class="svg-muted" font-size="12">running list, test match</text><text x="530" y="70" text-anchor="middle" class="svg-muted" font-size="12">pushed policy</text>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Shared pre, parent pre, child pre, local, child post, parent post, Shared post, defaults</text>
<text x="320" y="156" text-anchor="middle" class="svg-muted" font-size="12">First match wins.</text>
</svg><p class="cap">Design it, assemble it, prove it.</p></div>

<h3>Exam checklist: can you do these?</h3>
<ul>
<li>Explain what a device group holds and what belongs to templates instead.</li>
<li>Place a rule at Shared, parent or child, and as pre or post, with a reason.</li>
<li>Write the evaluation order from memory.</li>
<li>Explain how local rules and name clashes behave.</li>
<li>Explain object scope, visibility and shadowing.</li>
<li>Explain target and negate, and say when not to use them.</li>
<li>Explain that NAT and security are separate rulebases.</li>
<li>Name the two settings on a rule that affect log forwarding.</li>
<li>Name three anti-patterns: allow-any pre, shadowed rule, dead rule.</li>
<li>Use the three firewall commands to prove what happened.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Device group</dt><dd>A named container of policy, objects and log forwarding profiles pushed to member firewalls.</dd>
<dt>Shared</dt><dd>The top location whose content every device group inherits.</dd>
<dt>Pre-rule / post-rule</dt><dd>Central rules placed above or below the firewall's local rules.</dd>
<dt>Local rule</dt><dd>A rule typed on the firewall itself; sits between pre and post.</dd>
<dt>Shadowing</dt><dd>A same-named object in a child group overriding the parent's value for that child.</dd>
<dt>Target</dt><dd>A restriction of which firewalls receive a rule; with negate, everyone except the listed ones.</dd>
<dt>Push</dt><dd>Sending the committed Panorama configuration to firewalls; separate from commit.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="tbl"><tr><th>Fact</th><th>Remember</th></tr>
<tr><td>Order</td><td>Shared pre, parent pre, child pre, local, child post, parent post, Shared post, defaults</td></tr>
<tr><td>Default rules</td><td>Intrazone allow, interzone deny</td></tr>
<tr><td>Name clash</td><td>Push fails for that firewall; others may succeed</td></tr>
<tr><td>Object visibility</td><td>A rule sees only objects of its own group, parents and Shared</td></tr>
<tr><td>Targeted rule</td><td>Absent from non-target firewalls</td></tr>
<tr><td>Commit vs push</td><td>Commit changes Panorama; push sends the committed config to firewalls</td></tr>
<tr><td>Version-dependent items</td><td>Check the documentation for your PAN-OS version</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Judging by "push completed" instead of reading the firewall; putting a catch-all deny in a pre-rulebase; shadowing objects without documenting them; using targets as a permanent substitute for groups.</p></div>
<div class="exam"><p><b>Exam trap.</b> Read each question for scope words: "which firewall", "which level", "pre or post", "pushed or running". The answer usually hides in one of them.</p></div>

<div class="scn"><h4>From scattered to managed</h4><p>A company with twelve firewalls began with twelve different rulebases. After moving the baseline to Shared pre, the standard to a parent group, region exceptions to children and a logged deny to post, every ticket started from the same sentence: "which rule decides this flow?" and one command on the firewall answered it.</p><p><b>Lesson:</b> structure makes support fast, and fast support is the real result.</p></div>

<div class="iv"><p class="q">"Summarise how Panorama device groups manage policy."</p><p>Policy and objects are defined once in Shared, a parent or a child group; a push merges them around each firewall's local rules in a fixed order, with pre-rules first and post-rules last. Child objects can shadow parent ones, targets can narrow delivery, and I always verify on the firewall with the running list, a policy-match test and the pushed policy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design in levels, assemble by commit and push, prove on the firewall.</li>
<li>The evaluation order is a sandwich with local rules in the middle.</li>
<li>Objects shadow by name; rules see only objects visible from their group.</li>
<li>Targets and negate are powerful and easy to misuse; use sparingly.</li>
<li>Check the documentation for your PAN-OS version for limits and defaults.</li>
</ul></div>
`,hi:`
<p>Ab aap jaante ho ki Panorama kai bikhri rulebooks ko ek managed policy mein kaise badalta hai. Ye chapter yaad rakhne wali baatein, jo aap kar paane chahiye, aur sabse zyada test hone wale facts ikatthe karta hai. Labs se pehle, quiz se pehle aur interview se pehle ise padho.</p>

<h3>Poora module ek picture mein</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Module summary">
<rect x="10" y="10" width="200" height="80" rx="8" fill="#fde68a"/><text x="110" y="34" text-anchor="middle" class="svg-ink" font-size="13">Design</text><text x="110" y="54" text-anchor="middle" class="svg-muted" font-size="12">Shared, parent, child</text><text x="110" y="70" text-anchor="middle" class="svg-muted" font-size="12">objects, targets</text>
<rect x="220" y="10" width="200" height="80" rx="8" fill="#bae6fd"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">Assemble</text><text x="320" y="54" text-anchor="middle" class="svg-muted" font-size="12">commit, group push</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">firewall list merge karta hai</text>
<rect x="430" y="10" width="200" height="80" rx="8" fill="#bbf7d0"/><text x="530" y="34" text-anchor="middle" class="svg-ink" font-size="13">Prove</text><text x="530" y="54" text-anchor="middle" class="svg-muted" font-size="12">running list, test match</text><text x="530" y="70" text-anchor="middle" class="svg-muted" font-size="12">pushed policy</text>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Shared pre, parent pre, child pre, local, child post, parent post, Shared post, defaults</text>
<text x="320" y="156" text-anchor="middle" class="svg-muted" font-size="12">Pehli match jeetti hai.</text>
</svg><p class="cap">Design karo, assemble karo, prove karo.</p></div>

<h3>Exam checklist: kya aap ye kar sakte ho?</h3>
<ul>
<li>Samjhao ki device group mein kya hota hai aur kya templates ka hai.</li>
<li>Rule ko Shared, parent ya child mein, aur pre ya post ki tarah, reason ke saath place karo.</li>
<li>Evaluation order yaad se likho.</li>
<li>Samjhao ki local rules aur name clashes kaise behave karte hain.</li>
<li>Object scope, visibility aur shadowing samjhao.</li>
<li>Target aur negate samjhao, aur batao kab use nahi karne.</li>
<li>Samjhao ki NAT aur security alag rulebases hain.</li>
<li>Rule ki wo do settings batao jo log forwarding ko affect karti hain.</li>
<li>Teen anti-patterns batao: allow-any pre, shadowed rule, dead rule.</li>
<li>Teen firewall commands se prove karo ki kya hua.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Device group</dt><dd>Policy, objects aur log forwarding profiles ka named container jo member firewalls ko push hota hai.</dd>
<dt>Shared</dt><dd>Top location jiska content har device group inherit karta hai.</dd>
<dt>Pre-rule / post-rule</dt><dd>Central rules jo firewall ki local rules ke upar ya neeche aati hain.</dd>
<dt>Local rule</dt><dd>Firewall par khud type ki rule; pre aur post ke beech baithti hai.</dd>
<dt>Shadowing</dt><dd>Child group ka same-named object us child ke liye parent ki value override karta hai.</dd>
<dt>Target</dt><dd>Kaunse firewalls rule receive karein uski restriction; negate ke saath, listed ke alawa sab.</dd>
<dt>Push</dt><dd>Committed Panorama configuration firewalls ko bhejna; commit se alag.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<table class="tbl"><tr><th>Fact</th><th>Yaad rakho</th></tr>
<tr><td>Order</td><td>Shared pre, parent pre, child pre, local, child post, parent post, Shared post, defaults</td></tr>
<tr><td>Default rules</td><td>Intrazone allow, interzone deny</td></tr>
<tr><td>Name clash</td><td>Us firewall ka push fail; doosre succeed kar sakte hain</td></tr>
<tr><td>Object visibility</td><td>Rule sirf apne group, parents aur Shared ke objects dekhti hai</td></tr>
<tr><td>Targeted rule</td><td>Non-target firewalls se absent</td></tr>
<tr><td>Commit vs push</td><td>Commit Panorama ko badalta hai; push committed config firewalls ko bhejta hai</td></tr>
<tr><td>Version-dependent items</td><td>Apne PAN-OS version ki documentation check karo</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Firewall padhne ki jagah "push completed" se judge karna; pre-rulebase mein catch-all deny daalna; objects ko document kiye bina shadow karna; targets ko groups ka permanent substitute banana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Har sawal ko scope words ke liye padho: "kaunsa firewall", "kaunsa level", "pre ya post", "pushed ya running". Jawab aksar inhi mein se ek mein chhupa hota hai.</p></div>

<div class="scn"><h4>Bikhri se managed tak</h4><p>Barah firewalls wali company barah alag rulebases se shuru hui. Baseline Shared pre mein, standard parent group mein, region exceptions children mein aur logged deny post mein le jaane ke baad har ticket ek hi sawal se shuru hota tha: "ye flow kaunsi rule decide karti hai?" aur firewall par ek command jawab de deta tha.</p><p><b>Lesson:</b> structure support ko fast banata hai, aur fast support hi asli result hai.</p></div>

<div class="iv"><p class="q">"Panorama device groups policy kaise manage karte hain, summary do."</p><p>Policy aur objects ek baar Shared, parent ya child group mein define hote hain; push unhe har firewall ki local rules ke around fixed order mein merge karta hai, pre-rules pehle aur post-rules aakhir mein. Child objects parent wale ko shadow kar sakte hain, targets delivery narrow kar sakte hain, aur main hamesha firewall par running list, policy-match test aur pushed policy se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Levels mein design karo, commit aur push se assemble karo, firewall par prove karo.</li>
<li>Evaluation order sandwich hai jisme local rules beech mein hain.</li>
<li>Objects naam se shadow hote hain; rules sirf apne group se visible objects dekhti hain.</li>
<li>Targets aur negate powerful hain aur galat use hona aasaan hai; kam use karo.</li>
<li>Limits aur defaults ke liye apne PAN-OS version ki documentation check karo.</li>
</ul></div>
`}};export{e as default};