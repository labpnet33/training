var e={id:`hygiene-patterns`,h:{en:`Rule hygiene, design patterns and anti-patterns`,hi:`Rule hygiene, design patterns aur anti-patterns`},body:{en:`
<p><b>Analogy.</b> A kitchen with unlabelled jars, three half-used bags of the same flour and a drawer of old keys works, until someone new has to cook in a hurry. A rulebase grows the same way. Rule hygiene is the habit of labelling and cleaning as you go, so the next engineer, or you in six months, can understand it in minutes.</p>

<h3>Hygiene habits</h3>
<table class="tbl"><tr><th>Habit</th><th>What to do</th><th>Why</th></tr>
<tr><td><b>Naming</b></td><td>Use a convention: origin prefix, action, subject (for example SH-Block-Telnet-Out)</td><td>A name in a log tells you who owns the rule and what it does</td></tr>
<tr><td><b>Descriptions</b></td><td>One line with the reason and ticket reference</td><td>Without a reason nobody dares to delete it</td></tr>
<tr><td><b>Tags</b></td><td>Tag by owner, project or expiry</td><td>Lets you list all rules of one project in one view</td></tr>
<tr><td><b>Specific matches</b></td><td>Use real zones, objects and applications instead of any</td><td>Narrow rules are easier to reason about</td></tr>
<tr><td><b>Audit</b></td><td>Review rules with targets, any-any and no logging on a schedule</td><td>Finds drift before an auditor does</td></tr>
</table>

<h3>Good patterns</h3>
<ul>
<li><b>Baseline in Shared pre.</b> A short list of company-wide must-haves (block, management allow).</li>
<li><b>Standard in the parent.</b> The normal outbound policy that most sites share.</li>
<li><b>Exceptions in the child.</b> One group per truly different family of sites.</li>
<li><b>Catch-all in post, with logging.</b> A final deny that logs, below every local rule.</li>
<li><b>Objects over literals.</b> Rules refer to names, so one object edit updates many rules.</li>
</ul>

<h3>Anti-patterns</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Anti-patterns">
<rect x="10" y="10" width="200" height="80" rx="8" fill="#fed7aa"/><text x="110" y="34" text-anchor="middle" class="svg-ink" font-size="13">Allow-any pre-rule</text><text x="110" y="54" text-anchor="middle" class="svg-muted" font-size="12">matches first, hides</text><text x="110" y="70" text-anchor="middle" class="svg-muted" font-size="12">every rule below it</text>
<rect x="220" y="10" width="200" height="80" rx="8" fill="#fed7aa"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">Shadowed rule</text><text x="320" y="54" text-anchor="middle" class="svg-muted" font-size="12">a broader rule above it</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">always matches first</text>
<rect x="430" y="10" width="200" height="80" rx="8" fill="#fed7aa"/><text x="530" y="34" text-anchor="middle" class="svg-ink" font-size="13">Dead rule</text><text x="530" y="54" text-anchor="middle" class="svg-muted" font-size="12">no traffic matches it;</text><text x="530" y="70" text-anchor="middle" class="svg-muted" font-size="12">nobody dares delete it</text>
<text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="13">Cure: read the final numbered list, test with real addresses,</text>
<text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">log the rules you care about, and delete after review.</text>
</svg><p class="cap">Three common problems and the one habit that finds all of them.</p></div>
<ul>
<li><b>Allow-any pre-rules.</b> A broad allow high in the list hides every deny below it. Fix: move it down, narrow it, or remove it.</li>
<li><b>Shadowed rules.</b> A rule below a broader rule never matches. Example: a deny for one application placed below an allow for any application from the same zones.</li>
<li><b>Dead rules.</b> Rules that no traffic hits any more. They add risk and noise. Confirm with logs and ownership before deleting.</li>
<li><b>Too many targets.</b> Hidden exceptions (see the targets chapter).</li>
<li><b>Cloned groups.</b> Copies drift apart; inherit instead.</li>
</ul>

<h3>Finding a shadow with the test command</h3>
<p>Ask the firewall which rule would handle a specific flow. If the rule named is not the one you expect, something above it is shadowing yours:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from trust to untrust source 10.1.1.10 destination 8.8.8.8 protocol 6 destination-port 22
"Allow-Out-Broad; index: 2" {
        from trust;
        to untrust;
        application/service any/any;
        action allow;
}</pre>
<p>Here you wanted SSH denied but a broad allow at index 2 catches it first. The cure is to place a specific deny above it or to narrow the allow.</p>

<div class="warn"><p><b>Common mistakes.</b> Deleting a rule because "nobody uses it" without checking logs; fixing a shadow by adding yet another rule rather than reordering; leaving temporary rules without an expiry tag.</p></div>
<div class="exam"><p><b>Exam trap.</b> The broader rule wins if it comes first. When two rules overlap, the narrower one must be higher in the list to take effect.</p></div>

<div class="scn"><h4>Forty rules, six that mattered</h4><p>A team inherited a rulebase of forty rules with names like Rule-17. An audit found that eleven rules were shadowed and eight had never matched a log. After naming, tagging and a two-week log review, the team deleted nineteen rules and documented the rest. Troubleshooting time for access tickets fell noticeably because every rule explained itself.</p><p><b>Lesson:</b> hygiene is not tidiness for its own sake; it is time saved at 2 a.m.</p></div>

<div class="iv"><p class="q">"How do you keep a large rulebase healthy?"</p><p>A naming convention with origin and purpose, descriptions with reasons, tags for owner and expiry, objects instead of literals, logging on rules that matter, and a scheduled audit for any-any, shadowed, unused and targeted rules. I confirm unused rules with logs before deleting.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Name, describe and tag every rule; use objects instead of literals.</li>
<li>Keep the baseline in Shared pre, the standard in the parent, exceptions in children, the catch-all in post.</li>
<li>Allow-any pre-rules, shadowed rules and dead rules are the classic problems.</li>
<li>test security-policy-match shows which rule handles a flow and reveals shadows.</li>
<li>Audit regularly; delete only after log and owner checks.</li>
</ul></div>
`,hi:`
<p><b>Analogy.</b> Aisi kitchen jisme bina label ke jars, ek hi aate ke teen aadhe bags aur purani chabiyon ki drawer ho, tab tak kaam karti hai jab tak koi naya jaldi mein khana banane na aaye. Rulebase bhi aise hi badhti hai. Rule hygiene chalte-chalte label aur safai ki aadat hai, taaki agla engineer, ya aap chhe mahine baad, use minutes mein samajh sako.</p>

<h3>Hygiene habits</h3>
<table class="tbl"><tr><th>Habit</th><th>Kya karo</th><th>Kyun</th></tr>
<tr><td><b>Naming</b></td><td>Convention use karo: origin prefix, action, subject (jaise SH-Block-Telnet-Out)</td><td>Log mein naam batata hai ki rule kiski hai aur kya karti hai</td></tr>
<tr><td><b>Descriptions</b></td><td>Reason aur ticket reference ke saath ek line</td><td>Reason ke bina koi delete karne ki himmat nahi karta</td></tr>
<tr><td><b>Tags</b></td><td>Owner, project ya expiry se tag karo</td><td>Ek project ki saari rules ek view mein list ho jaati hain</td></tr>
<tr><td><b>Specific matches</b></td><td>any ki jagah real zones, objects aur applications</td><td>Narrow rules par reason karna aasaan hai</td></tr>
<tr><td><b>Audit</b></td><td>Targets, any-any aur no-logging wali rules ko schedule par review karo</td><td>Auditor se pehle drift pakad leta hai</td></tr>
</table>

<h3>Achhe patterns</h3>
<ul>
<li><b>Baseline Shared pre mein.</b> Company-wide must-haves ki chhoti list (block, management allow).</li>
<li><b>Standard parent mein.</b> Normal outbound policy jo zyadatar sites share karti hain.</li>
<li><b>Exceptions child mein.</b> Sach mein alag sites ki family ke liye ek group.</li>
<li><b>Catch-all post mein, logging ke saath.</b> Har local rule ke neeche logging wali final deny.</li>
<li><b>Literals ki jagah objects.</b> Rules naam refer karti hain, to ek object edit kai rules update kar deta hai.</li>
</ul>

<h3>Anti-patterns</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Anti-patterns">
<rect x="10" y="10" width="200" height="80" rx="8" fill="#fed7aa"/><text x="110" y="34" text-anchor="middle" class="svg-ink" font-size="13">Allow-any pre-rule</text><text x="110" y="54" text-anchor="middle" class="svg-muted" font-size="12">pehle match karti hai,</text><text x="110" y="70" text-anchor="middle" class="svg-muted" font-size="12">neeche ki sab chhupa deti</text>
<rect x="220" y="10" width="200" height="80" rx="8" fill="#fed7aa"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">Shadowed rule</text><text x="320" y="54" text-anchor="middle" class="svg-muted" font-size="12">upar ki broader rule</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">hamesha pehle match</text>
<rect x="430" y="10" width="200" height="80" rx="8" fill="#fed7aa"/><text x="530" y="34" text-anchor="middle" class="svg-ink" font-size="13">Dead rule</text><text x="530" y="54" text-anchor="middle" class="svg-muted" font-size="12">koi traffic match nahi;</text><text x="530" y="70" text-anchor="middle" class="svg-muted" font-size="12">delete karne ki himmat nahi</text>
<text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="13">Ilaaj: final numbered list padho, real addresses se test karo,</text>
<text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">zaroori rules log karo, aur review ke baad delete karo.</text>
</svg><p class="cap">Teen common problems aur ek aadat jo sabko pakad leti hai.</p></div>
<ul>
<li><b>Allow-any pre-rules.</b> List mein upar broad allow neeche ki har deny ko chhupa deti hai. Fix: neeche karo, narrow karo, ya hata do.</li>
<li><b>Shadowed rules.</b> Broader rule ke neeche wali rule kabhi match nahi karti. Example: ek application ki deny, usi zones se any application ki allow ke neeche.</li>
<li><b>Dead rules.</b> Jin par ab koi traffic nahi lagta. Ye risk aur noise badhati hain. Delete se pehle logs aur ownership confirm karo.</li>
<li><b>Bahut saare targets.</b> Hidden exceptions (targets chapter dekho).</li>
<li><b>Cloned groups.</b> Copies alag-alag drift karti hain; inherit karo.</li>
</ul>

<h3>Test command se shadow dhundhna</h3>
<p>Firewall se pucho ki kisi specific flow ko kaunsi rule handle karegi. Agar naam expected rule ka nahi hai, to uske upar kuch use shadow kar raha hai:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from trust to untrust source 10.1.1.10 destination 8.8.8.8 protocol 6 destination-port 22
"Allow-Out-Broad; index: 2" {
        from trust;
        to untrust;
        application/service any/any;
        action allow;
}</pre>
<p>Yahan aap SSH deny chahte the par index 2 ki broad allow use pehle pakad leti hai. Ilaaj hai uske upar specific deny rakhna ya allow ko narrow karna.</p>

<div class="warn"><p><b>Common mistakes.</b> "Koi use nahi karta" soch kar logs dekhe bina rule delete karna; shadow ko reorder karne ki jagah ek aur rule jodkar fix karna; temporary rules ko expiry tag ke bina chhod dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Broader rule agar pehle aaye to wahi jeetti hai. Do rules overlap karein to narrower rule effect mein aane ke liye list mein upar honi chahiye.</p></div>

<div class="scn"><h4>Chalis rules, chhe jo matter karti thi</h4><p>Ek team ko chalis rules ki rulebase mili jinke naam Rule-17 jaise the. Audit mein pata chala ki gyarah rules shadowed hain aur aath ne kabhi log match nahi kiya. Naming, tagging aur do hafte ke log review ke baad team ne unnees rules delete ki aur baaki document ki. Access tickets ka troubleshooting time kaafi ghata kyunki har rule apni baat khud batati thi.</p><p><b>Lesson:</b> hygiene saaf-safai ke liye nahi, raat ke 2 baje ka time bachane ke liye hai.</p></div>

<div class="iv"><p class="q">"Badi rulebase ko healthy kaise rakhte ho?"</p><p>Origin aur purpose wali naming convention, reasons wali descriptions, owner aur expiry ke tags, literals ki jagah objects, zaroori rules par logging, aur any-any, shadowed, unused aur targeted rules ka scheduled audit. Delete se pehle logs se unused confirm karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har rule ko naam, description aur tag do; literals ki jagah objects use karo.</li>
<li>Baseline Shared pre mein, standard parent mein, exceptions children mein, catch-all post mein.</li>
<li>Allow-any pre-rules, shadowed rules aur dead rules classic problems hain.</li>
<li>test security-policy-match batata hai ki flow ko kaunsi rule handle karti hai aur shadows dikhata hai.</li>
<li>Regular audit karo; log aur owner checks ke baad hi delete karo.</li>
</ul></div>
`}};export{e as default};