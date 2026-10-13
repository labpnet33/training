var e={id:`pre-post-rules`,h:{en:`Pre-rules, post-rules and policy design on Panorama`,hi:`Panorama par pre-rules, post-rules aur policy design`},body:{en:`
<p>On a managed firewall, the rulebase is stitched together from several places. Knowing the order is the most tested part of Panorama policy.</p>
<div class="note"><p><b>Note.</b> Reference material (not run in the simulator). The rules are lab examples with documentation addresses.</p></div>
<h3>The three parts of a Panorama rulebase</h3>
<ul>
<li><b>Pre-rules</b>: created on Panorama, evaluated first, and cannot be edited on the firewall. Use them for company standards that must always apply, such as blocking known-bad destinations and allowing management traffic.</li>
<li><b>Local rules</b>: created on the firewall itself (if you allow it), evaluated in the middle. Use them for site-specific exceptions.</li>
<li><b>Post-rules</b>: created on Panorama, evaluated after local rules. Use them for the broad baseline and the cleanup rule at the end.</li>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Evaluation order on a managed firewall: pre-rules, local rules, post-rules, then default rules."><rect x="20" y="40" width="132" height="80" rx="10" fill="#bae6fd"/><text x="86" y="76" text-anchor="middle" class="svg-ink" font-size="14">Shared pre</text><text x="86" y="98" text-anchor="middle" class="svg-muted" font-size="12">then DG pre</text><line x1="152" y1="80" x2="176" y2="80" stroke="#64748b" stroke-width="2"/><rect x="176" y="40" width="132" height="80" rx="10" fill="#bbf7d0"/><text x="242" y="76" text-anchor="middle" class="svg-ink" font-size="14">Local rules</text><text x="242" y="98" text-anchor="middle" class="svg-muted" font-size="12">on the firewall</text><line x1="308" y1="80" x2="332" y2="80" stroke="#64748b" stroke-width="2"/><rect x="332" y="40" width="132" height="80" rx="10" fill="#ddd6fe"/><text x="398" y="76" text-anchor="middle" class="svg-ink" font-size="14">DG post</text><text x="398" y="98" text-anchor="middle" class="svg-muted" font-size="12">then Shared post</text><line x1="464" y1="80" x2="488" y2="80" stroke="#64748b" stroke-width="2"/><rect x="488" y="40" width="132" height="80" rx="10" fill="#fde68a"/><text x="554" y="76" text-anchor="middle" class="svg-ink" font-size="14">Default rules</text><text x="554" y="98" text-anchor="middle" class="svg-muted" font-size="12">last</text></svg><p class="cap">Evaluation order on a managed firewall: pre-rules, local rules, post-rules, then default rules.</p></div>
</ul>
<h3>Full order of evaluation</h3>
<p>1. Shared pre-rules</p>
<p>2. Device group pre-rules (parent first, then child)</p>
<p>3. Local firewall rules</p>
<p>4. Device group post-rules (child first, then parent)</p>
<p>5. Shared post-rules</p>
<p>6. Default rules (intrazone-default allow and interzone-default deny, which can be overridden)</p>
<p>The first match decides, as on any firewall. Because pre-rules come first, a deny in a pre-rule cannot be undone by a local allow.</p>
<h3>What belongs where</h3>
<table class="cmp">
<tr><th>Rule</th><th>Placed as</th><th>Example</th></tr>
<tr><td>Block known-bad destinations</td><td>Shared pre-rule</td><td>Deny threat-feed list to any</td></tr>
<tr><td>Allow DNS to internal servers</td><td>Parent pre-rule</td><td>LAN to DNS servers, application dns</td></tr>
<tr><td>Branch site exception</td><td>Local rule</td><td>One site's legacy app</td></tr>
<tr><td>Internet access baseline</td><td>Parent post-rule</td><td>LAN to UNTRUST, web-browsing and ssl, with profiles</td></tr>
<tr><td>Cleanup and log</td><td>Shared post-rule</td><td>Deny and log all</td></tr>
</table>
<h3>Rule hygiene</h3>
<ul>
<li>Rules use <b>zones, application and user</b>, not just ports and IPs; rely on App-ID.</li>
<li>Attach a <b>security profile group</b> to every allow rule so protection is consistent.</li>
<li>Give each rule a clear name, tags and a description that includes the ticket number; require audit comments.</li>
<li>Use rule <b>targets</b> to apply a rule to only some firewalls in a device group, or to all except some.</li>
<li>Enable log at session end for allows and denies that matter.</li>
<li>Review unused rules with hit counts and the policy optimizer before removing them, and keep removed rules in a disabled state during a short observation period.</li>
<li>Rule UUIDs let you track a rule across renames and across devices.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> DG-Global-Branches has pre-rule 1 allowing LAN to the DNS group (application dns), a post-rule allowing LAN to UNTRUST for web-browsing and ssl with a profile group, and a post-rule at the end denying all with logging. Pune keeps one local rule for a legacy scanner. Traffic from LAN to a bad destination hits Shared pre-rule 0 first and is denied before local or post-rules are read.</p></div>
<div class="warn"><p><b>Common mistake.</b> Putting a broad allow in a pre-rule. It cannot be overridden by local rules and may allow more than intended in every site. Keep pre-rules narrow and security-focused; put broad baselines in post-rules.</p></div>
<div class="exam"><p><b>Exam trap.</b> Pre-rules first, then local rules, then post-rules, then default rules. Shared before device group for pre-rules, and the reverse for post-rules.</p></div>
<div class="scn"><h4>A local allow that never worked</h4><p>A site engineer added a local rule to allow a legacy scanner, but it never matched. The Shared pre-rule that blocks a broad destination range matched first. After the policy owner agreed an exception, they added a narrow allow above the block in the parent pre-rules for that scanner only, and kept a ticket reference in the description.</p><p><b>Lesson:</b> pre-rules win over local rules, so exceptions must be placed above the rule that blocks them.</p></div>
<div class="iv"><p class="q">"Explain the order of rule evaluation on a Panorama-managed firewall."</p><p>Shared pre-rules, device group pre-rules, local rules, device group post-rules, shared post-rules, and finally the default rules. The first match wins. Pre-rules are for non-negotiable standards, post-rules for baselines and cleanup.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Pre-rules come from Panorama and are evaluated first; they cannot be edited locally.</li><li>Order: shared pre, DG pre, local, DG post, shared post, default.</li><li>Use App-ID, profile groups, tags, descriptions and targets for clean policy.</li><li>Keep pre-rules narrow; put broad baselines in post-rules.</li><li>Review hit counts before removing rules.</li></ul></div>
`,hi:`
<p>Managed firewall par rulebase kai jagah se jodkar banta hai. Order jaanna Panorama policy ka sabse zyada poochha jaane wala hissa hai.</p>
<div class="note"><p><b>Note.</b> Reference material (simulator mein nahi chalta). Rules lab examples hain jo documentation addresses use karte hain.</p></div>
<h3>Panorama rulebase ke teen hisse</h3>
<ul>
<li><b>Pre-rules</b>: Panorama par bante hain, pehle evaluate hote hain, aur firewall par edit nahi ho sakte. Company standards ke liye use karo jo hamesha lagu hone chahiye, jaise known-bad destinations block karna aur management traffic allow karna.</li>
<li><b>Local rules</b>: firewall par hi bante hain (agar aap allow karo), beech mein evaluate hote hain. Site-specific exceptions ke liye use karo.</li>
<li><b>Post-rules</b>: Panorama par bante hain, local rules ke baad evaluate hote hain. Broad baseline aur end ki cleanup rule ke liye use karo.</li>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Managed firewall par evaluation order: pre-rules, local rules, post-rules, phir default rules."><rect x="20" y="40" width="132" height="80" rx="10" fill="#bae6fd"/><text x="86" y="76" text-anchor="middle" class="svg-ink" font-size="14">Shared pre</text><text x="86" y="98" text-anchor="middle" class="svg-muted" font-size="12">phir DG pre</text><line x1="152" y1="80" x2="176" y2="80" stroke="#64748b" stroke-width="2"/><rect x="176" y="40" width="132" height="80" rx="10" fill="#bbf7d0"/><text x="242" y="76" text-anchor="middle" class="svg-ink" font-size="14">Local rules</text><text x="242" y="98" text-anchor="middle" class="svg-muted" font-size="12">firewall par</text><line x1="308" y1="80" x2="332" y2="80" stroke="#64748b" stroke-width="2"/><rect x="332" y="40" width="132" height="80" rx="10" fill="#ddd6fe"/><text x="398" y="76" text-anchor="middle" class="svg-ink" font-size="14">DG post</text><text x="398" y="98" text-anchor="middle" class="svg-muted" font-size="12">phir Shared post</text><line x1="464" y1="80" x2="488" y2="80" stroke="#64748b" stroke-width="2"/><rect x="488" y="40" width="132" height="80" rx="10" fill="#fde68a"/><text x="554" y="76" text-anchor="middle" class="svg-ink" font-size="14">Default rules</text><text x="554" y="98" text-anchor="middle" class="svg-muted" font-size="12">aakhir mein</text></svg><p class="cap">Managed firewall par evaluation order: pre-rules, local rules, post-rules, phir default rules.</p></div>
</ul>
<h3>Evaluation ka poora order</h3>
<p>1. Shared pre-rules</p>
<p>2. Device group pre-rules (pehle parent, phir child)</p>
<p>3. Local firewall rules</p>
<p>4. Device group post-rules (pehle child, phir parent)</p>
<p>5. Shared post-rules</p>
<p>6. Default rules (intrazone-default allow aur interzone-default deny, jo override ho sakte hain)</p>
<p>Pehla match decide karta hai, jaisa har firewall par hota hai. Pre-rules pehle aate hain, isliye pre-rule ka deny local allow se undo nahi ho sakta.</p>
<h3>Kya kahan rakhein</h3>
<table class="cmp">
<tr><th>Rule</th><th>Kahan rakhein</th><th>Example</th></tr>
<tr><td>Known-bad destinations block</td><td>Shared pre-rule</td><td>Threat-feed list to any deny</td></tr>
<tr><td>Internal servers ko DNS allow</td><td>Parent pre-rule</td><td>LAN se DNS servers, application dns</td></tr>
<tr><td>Branch site exception</td><td>Local rule</td><td>Ek site ka legacy app</td></tr>
<tr><td>Internet access baseline</td><td>Parent post-rule</td><td>LAN se UNTRUST, web-browsing aur ssl, profiles ke saath</td></tr>
<tr><td>Cleanup aur log</td><td>Shared post-rule</td><td>Sab deny aur log</td></tr>
</table>
<h3>Rule hygiene</h3>
<ul>
<li>Rules <b>zones, application aur user</b> use karein, sirf ports aur IPs nahi; App-ID par bharosa karo.</li>
<li>Har allow rule par <b>security profile group</b> lagao taaki protection consistent ho.</li>
<li>Har rule ko clear naam, tags aur ticket number wali description do; audit comments zaroori karo.</li>
<li>Device group ke kuch hi firewalls par rule lagane ya kuch ko chhodkar sab par lagane ke liye rule <b>targets</b> use karo.</li>
<li>Jo allows aur denies matter karte hain unke liye log at session end enable karo.</li>
<li>Rules hatane se pehle hit counts aur policy optimizer se unused rules review karo, aur hatayi gayi rules ko chhoti observation period ke liye disabled rakho.</li>
<li>Rule UUIDs rename aur devices ke beech bhi rule ko track karne dete hain.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> DG-Global-Branches mein pre-rule 1 LAN se DNS group tak (application dns) allow karti hai, ek post-rule LAN se UNTRUST ko web-browsing aur ssl ke liye profile group ke saath allow karti hai, aur ek post-rule end mein sab deny aur log karti hai. Pune ek legacy scanner ke liye ek local rule rakhta hai. LAN se bad destination ka traffic Shared pre-rule 0 ko pehle hit karta hai aur local ya post-rules padhe jaane se pehle deny ho jaata hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Broad allow ko pre-rule mein rakhna. Local rules use override nahi kar sakte aur woh har site mein jitna socha tha usse zyada allow kar sakti hai. Pre-rules narrow aur security-focused rakho; broad baselines post-rules mein.</p></div>
<div class="exam"><p><b>Exam trap.</b> Pehle pre-rules, phir local rules, phir post-rules, phir default rules. Pre-rules mein Shared device group se pehle, post-rules mein ulta.</p></div>
<div class="scn"><h4>Local allow jo kabhi kaam nahi karti thi</h4><p>Site engineer ne legacy scanner allow karne ke liye local rule jodi, par woh kabhi match nahi hui. Broad destination range block karne wali Shared pre-rule pehle match karti thi. Policy owner ke exception manne ke baad unhone sirf us scanner ke liye parent pre-rules mein block ke upar narrow allow jodi, aur description mein ticket reference rakha.</p><p><b>Lesson:</b> pre-rules local rules par jeet jaate hain, isliye exceptions ko block karne wali rule ke upar rakhna padta hai.</p></div>
<div class="iv"><p class="q">"Panorama-managed firewall par rule evaluation ka order samjhao."</p><p>Shared pre-rules, device group pre-rules, local rules, device group post-rules, shared post-rules, aur aakhir mein default rules. Pehla match jeetta hai. Pre-rules non-negotiable standards ke liye, post-rules baselines aur cleanup ke liye.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Pre-rules Panorama se aate hain aur pehle evaluate hote hain; local edit nahi ho sakte.</li><li>Order: shared pre, DG pre, local, DG post, shared post, default.</li><li>Clean policy ke liye App-ID, profile groups, tags, descriptions aur targets use karo.</li><li>Pre-rules narrow rakho; broad baselines post-rules mein.</li><li>Rules hatane se pehle hit counts review karo.</li></ul></div>
`}};export{e as default};