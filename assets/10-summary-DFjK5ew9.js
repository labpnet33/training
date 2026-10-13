var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You now have the full picture of Junos routing policy for JNCIA-Junos (JN0-106). This last chapter is your revision sheet: a map of everything, a can-do checklist, a glossary and the most tested facts.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Module summary map">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Routing policy</text>
<rect x="10" y="90" width="140" height="50" rx="8" fill="#bae6fd"/><text x="80" y="110" text-anchor="middle" class="svg-ink" font-size="12">Direction</text><text x="80" y="127" text-anchor="middle" class="svg-muted" font-size="11">import / export</text>
<rect x="170" y="90" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="240" y="110" text-anchor="middle" class="svg-ink" font-size="12">Structure</text><text x="240" y="127" text-anchor="middle" class="svg-muted" font-size="11">terms, from, then</text>
<rect x="330" y="90" width="140" height="50" rx="8" fill="#fde68a"/><text x="400" y="110" text-anchor="middle" class="svg-ink" font-size="12">Matching</text><text x="400" y="127" text-anchor="middle" class="svg-muted" font-size="11">route-filter, list</text>
<rect x="490" y="90" width="140" height="50" rx="8" fill="#fed7aa"/><text x="560" y="110" text-anchor="middle" class="svg-ink" font-size="12">Chains</text><text x="560" y="127" text-anchor="middle" class="svg-muted" font-size="11">order, default</text>
<rect x="170" y="170" width="300" height="46" rx="8" fill="#e2e8f0"/><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">Prove it: test policy, show policy,</text><text x="320" y="206" text-anchor="middle" class="svg-ink" font-size="12">show route at the receiver</text>
<line x1="320" y1="50" x2="80" y2="90" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="50" x2="240" y2="90" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="50" x2="400" y2="90" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="50" x2="560" y2="90" stroke="#64748b" stroke-width="1.5"/>
<line x1="80" y1="140" x2="250" y2="170" stroke="#64748b" stroke-width="1.5"/><line x1="560" y1="140" x2="400" y2="170" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Define, match, order, then prove.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain import versus export and say where a policy sits between a protocol and the routing table.</li>
<li>State the default import and export policy of OSPF, BGP and RIP.</li>
<li>Write a policy-statement with several terms, from and then clauses.</li>
<li>Distinguish terminating (accept, reject, next policy) from modifying (metric, tag, preference) actions.</li>
<li>Choose between protocol, route-filter, prefix-list, interface, tag and neighbor matches.</li>
<li>Use exact, longer, orlonger, upto and prefix-length-range, and apply the longest-match rule.</li>
<li>Build and reorder a policy chain, and predict the result.</li>
<li>Export static routes into OSPF with a metric, and recognise them as OSPF/150 externals.</li>
<li>Prove a policy with show policy, test policy, show | compare and show route detail.</li>
<li>Troubleshoot with the five-question workflow.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Policy-statement</dt><dd>Named list of terms defined under policy-options.</dd>
<dt>Term</dt><dd>One rule with optional from and to match conditions and then actions.</dd>
<dt>Import policy</dt><dd>Filters or changes routes learned from a protocol before the routing table.</dd>
<dt>Export policy</dt><dd>Chooses which active routes a protocol advertises.</dd>
<dt>Terminating action</dt><dd>accept, reject or next policy; ends evaluation of the policy.</dd>
<dt>Route-filter</dt><dd>Prefix plus match type (exact, longer, orlonger, upto, prefix-length-range, through).</dd>
<dt>Prefix-list</dt><dd>Named list of prefixes, matched exactly in policy.</dd>
<dt>Policy chain</dt><dd>Several policies applied in order; first terminating action wins.</dd>
<dt>ASBR</dt><dd>Router that injects external routes into OSPF.</dd>
<dt>Active route</dt><dd>The best route chosen for a prefix; the only kind that is exported.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>OSPF default export</td><td>Reject (only own LSAs)</td></tr>
<tr><td>BGP default export</td><td>Active BGP routes only</td></tr>
<tr><td>RIP default export</td><td>Reject</td></tr>
<tr><td>Exported static in OSPF</td><td>External, preference 150</td></tr>
<tr><td>Where policy is defined</td><td>policy-options policy-statement</td></tr>
<tr><td>Where policy is applied</td><td>protocol import or export</td></tr>
<tr><td>Chain evaluation</td><td>Left to right, first terminating action wins</td></tr>
<tr><td>Route-filter with many entries</td><td>Longest covering prefix decides</td></tr>
<tr><td>test policy default for undecided</td><td>Accept</td></tr>
<tr><td>Preference order</td><td>Direct 0, static 5, OSPF 10, RIP 100, OSPF ext 150, BGP 170</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">set policy-options policy-statement NAME term T from protocol static
set policy-options policy-statement NAME term T from route-filter 10.0.0.0/8 orlonger
set policy-options policy-statement NAME term T then metric 20
set policy-options policy-statement NAME term T then accept
set policy-options prefix-list LIST 192.168.99.0/24
set protocols ospf export [ P1 P2 P3 ]
delete protocols ospf export
show policy NAME
run test policy NAME 0/0
show route PREFIX detail
show ospf database external</pre>

<div class="warn"><p><b>Last reminder.</b> A policy that is defined but not applied does nothing. A policy that is applied but is in the wrong chain position may do nothing too. Always verify at the receiver.</p></div>
<div class="exam"><p><b>Exam trap.</b> Beware answers that say "reject always wins" or "all route-filters are tried". Neither is how Junos works. First terminating action wins; longest covering route-filter decides.</p></div>

<div class="scn"><h4>Change ticket template that stopped outages</h4><p>One operations team added four lines to every routing-policy change ticket: the show policy output, test policy for one allowed and one forbidden prefix, the chain order from show protocols, and the show route detail from the receiving router. Policy-related incidents dropped from about one a month to none in six months, because every mistake in this module (leftover route-filter, wrong order, missing apply, assumed default) shows up in those four outputs.</p><p><b>Lesson:</b> evidence turns policy from guesswork into engineering.</p></div>

<div class="iv"><p class="q">"Summarise how Junos decides whether a route is advertised by OSPF."</p><p>Strong answer: take the active route; evaluate the export chain left to right; the first term whose from conditions match and which has accept or reject decides; modifying actions such as metric and tag apply along the way; if no term decides, the OSPF default export rejects. Mention longest-match for route-filters and the preference 150 you see on the neighbour.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Import filters what is learned; export decides what is advertised.</li>
<li>Defaults: OSPF and RIP export nothing, BGP exports active BGP routes.</li>
<li>Terms run top to bottom; chains run left to right; first terminating action wins.</li>
<li>Route-filter: longest covering prefix decides; exact for summaries, orlonger for ranges.</li>
<li>Prove with show policy, test policy and the receiver's show route detail.</li>
</ul></div>
`,hi:`
<p>Ab aapke paas JNCIA-Junos (JN0-106) ke liye Junos routing policy ki poori tasveer hai. Yeh aakhri chapter aapki revision sheet hai: sab kuch ka map, can-do checklist, glossary aur sabse zyada poochhe jaane wale facts.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Module summary map">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Routing policy</text>
<rect x="10" y="90" width="140" height="50" rx="8" fill="#bae6fd"/><text x="80" y="110" text-anchor="middle" class="svg-ink" font-size="12">Direction</text><text x="80" y="127" text-anchor="middle" class="svg-muted" font-size="11">import / export</text>
<rect x="170" y="90" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="240" y="110" text-anchor="middle" class="svg-ink" font-size="12">Structure</text><text x="240" y="127" text-anchor="middle" class="svg-muted" font-size="11">terms, from, then</text>
<rect x="330" y="90" width="140" height="50" rx="8" fill="#fde68a"/><text x="400" y="110" text-anchor="middle" class="svg-ink" font-size="12">Matching</text><text x="400" y="127" text-anchor="middle" class="svg-muted" font-size="11">route-filter, list</text>
<rect x="490" y="90" width="140" height="50" rx="8" fill="#fed7aa"/><text x="560" y="110" text-anchor="middle" class="svg-ink" font-size="12">Chains</text><text x="560" y="127" text-anchor="middle" class="svg-muted" font-size="11">order, default</text>
<rect x="170" y="170" width="300" height="46" rx="8" fill="#e2e8f0"/><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">Prove karo: test policy, show policy,</text><text x="320" y="206" text-anchor="middle" class="svg-ink" font-size="12">receiver par show route</text>
<line x1="320" y1="50" x2="80" y2="90" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="50" x2="240" y2="90" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="50" x2="400" y2="90" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="50" x2="560" y2="90" stroke="#64748b" stroke-width="1.5"/>
<line x1="80" y1="140" x2="250" y2="170" stroke="#64748b" stroke-width="1.5"/><line x1="560" y1="140" x2="400" y2="170" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Define, match, order, phir prove.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Import aur export ka farak samjhao aur batao ki policy protocol aur routing table ke beech kahan baithti hai.</li>
<li>OSPF, BGP aur RIP ki default import aur export policy batao.</li>
<li>Kai terms, from aur then clauses wala policy-statement likho.</li>
<li>Terminating (accept, reject, next policy) aur modifying (metric, tag, preference) actions mein farak karo.</li>
<li>protocol, route-filter, prefix-list, interface, tag aur neighbor matches mein se chuno.</li>
<li>exact, longer, orlonger, upto aur prefix-length-range use karo, aur longest-match rule lagao.</li>
<li>Policy chain banao aur reorder karo, aur result predict karo.</li>
<li>Static routes ko metric ke saath OSPF mein export karo, aur unhe OSPF/150 externals ke roop mein pehchano.</li>
<li>show policy, test policy, show | compare aur show route detail se policy prove karo.</li>
<li>Paanch-sawal workflow se troubleshoot karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Policy-statement</dt><dd>policy-options ke neeche define hui terms ki naam wali list.</dd>
<dt>Term</dt><dd>Ek rule, optional from aur to match conditions aur then actions ke saath.</dd>
<dt>Import policy</dt><dd>Protocol se seekhe routes ko routing table se pehle filter ya change karti hai.</dd>
<dt>Export policy</dt><dd>Chunti hai ki protocol kaunse active routes advertise kare.</dd>
<dt>Terminating action</dt><dd>accept, reject ya next policy; policy ka evaluation khatam karta hai.</dd>
<dt>Route-filter</dt><dd>Prefix plus match type (exact, longer, orlonger, upto, prefix-length-range, through).</dd>
<dt>Prefix-list</dt><dd>Prefixes ki naam wali list, policy mein exactly match hoti hai.</dd>
<dt>Policy chain</dt><dd>Order mein lagi kai policies; pehla terminating action jeet-ta hai.</dd>
<dt>ASBR</dt><dd>Router jo external routes OSPF mein inject karta hai.</dd>
<dt>Active route</dt><dd>Prefix ke liye chuna gaya best route; sirf yahi export hota hai.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Jawab</th></tr>
<tr><td>OSPF default export</td><td>Reject (sirf apne LSAs)</td></tr>
<tr><td>BGP default export</td><td>Sirf active BGP routes</td></tr>
<tr><td>RIP default export</td><td>Reject</td></tr>
<tr><td>OSPF mein exported static</td><td>External, preference 150</td></tr>
<tr><td>Policy kahan define hoti hai</td><td>policy-options policy-statement</td></tr>
<tr><td>Policy kahan apply hoti hai</td><td>protocol import ya export</td></tr>
<tr><td>Chain evaluation</td><td>Left se right, pehla terminating action jeet-ta hai</td></tr>
<tr><td>Kai entries wala route-filter</td><td>Sabse lamba covering prefix decide karta hai</td></tr>
<tr><td>Undecided ke liye test policy default</td><td>Accept</td></tr>
<tr><td>Preference order</td><td>Direct 0, static 5, OSPF 10, RIP 100, OSPF ext 150, BGP 170</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">set policy-options policy-statement NAME term T from protocol static
set policy-options policy-statement NAME term T from route-filter 10.0.0.0/8 orlonger
set policy-options policy-statement NAME term T then metric 20
set policy-options policy-statement NAME term T then accept
set policy-options prefix-list LIST 192.168.99.0/24
set protocols ospf export [ P1 P2 P3 ]
delete protocols ospf export
show policy NAME
run test policy NAME 0/0
show route PREFIX detail
show ospf database external</pre>

<div class="warn"><p><b>Aakhri reminder.</b> Jo policy define hai par apply nahi hui woh kuch nahi karti. Jo policy apply hai par chain mein galat position par hai woh bhi kuch nahi kar sakti. Hamesha receiver par verify karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Un answers se bacho jo kehte hain "reject hamesha jeet-ta hai" ya "saare route-filters try hote hain". Junos aise kaam nahi karta. Pehla terminating action jeet-ta hai; sabse lamba covering route-filter decide karta hai.</p></div>

<div class="scn"><h4>Change ticket template jisne outages roke</h4><p>Ek operations team ne har routing-policy change ticket mein chaar cheezein jodi: show policy output, ek allowed aur ek forbidden prefix ke liye test policy, show protocols se chain order, aur receiving router ka show route detail. Policy se jude incidents mahine mein ek se chhe mahine mein zero ho gaye, kyunki is module ki har galti (bacha route-filter, galat order, apply bhoolna, maana hua default) in chaar outputs mein dikh jaati hai.</p><p><b>Lesson:</b> saboot policy ko andaaze se engineering bana deta hai.</p></div>

<div class="iv"><p class="q">"Batao Junos kaise decide karta hai ki OSPF route advertise karega ya nahi."</p><p>Strong answer: active route lo; export chain ko left se right evaluate karo; pehla term jiski from conditions match hon aur jisme accept ya reject ho, wahi decide karta hai; metric aur tag jaise modifying actions raste mein lagte hain; agar koi term decide na kare to OSPF default export reject karta hai. Route-filters ke liye longest-match aur neighbour par dikhne wali preference 150 bhi bolo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Import filter karta hai ki kya learn ho; export decide karta hai ki kya advertise ho.</li>
<li>Defaults: OSPF aur RIP kuch export nahi karte, BGP active BGP routes export karta hai.</li>
<li>Terms upar se neeche chalte hain; chains left se right; pehla terminating action jeet-ta hai.</li>
<li>Route-filter: sabse lamba covering prefix decide karta hai; summaries ke liye exact, ranges ke liye orlonger.</li>
<li>show policy, test policy aur receiver ke show route detail se prove karo.</li>
</ul></div>
`}};export{e as default};