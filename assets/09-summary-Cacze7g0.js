var e={id:`summary`,h:{en:`Summary: IS-IS checklist, glossary and cheat sheet`,hi:`Summary: IS-IS checklist, glossary aur cheat sheet`},body:{en:`
<p>You have now covered the IS-IS objectives of JN0-650 as a connected story. This chapter pulls the module into one page you can revisit before the exam or before a change window.</p>

<h3>The design in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IS-IS design summary">
<rect x="20" y="20" width="200" height="190" rx="14" fill="#bae6fd" opacity="0.7"/><text x="120" y="42" text-anchor="middle" class="svg-ink" font-size="13">Level 1 area</text>
<rect x="420" y="20" width="200" height="190" rx="14" fill="#ddd6fe" opacity="0.7"/><text x="520" y="42" text-anchor="middle" class="svg-ink" font-size="13">Level 2 backbone</text>
<circle cx="80" cy="120" r="22" fill="#bbf7d0" stroke="#64748b"/><text x="80" y="124" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="80" y="160" text-anchor="middle" class="svg-muted" font-size="11">default via ATT</text>
<circle cx="320" cy="70" r="26" fill="#fde68a" stroke="#64748b"/><text x="320" y="74" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<circle cx="320" cy="170" r="26" fill="#fde68a" stroke="#64748b"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<circle cx="520" cy="120" r="22" fill="#fed7aa" stroke="#64748b"/><text x="520" y="124" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<line x1="100" y1="112" x2="296" y2="76" stroke="#64748b" stroke-width="2"/><line x1="100" y1="128" x2="296" y2="164" stroke="#64748b" stroke-width="2"/>
<line x1="346" y1="74" x2="500" y2="112" stroke="#64748b" stroke-width="2"/><line x1="346" y1="166" x2="500" y2="128" stroke="#64748b" stroke-width="2"/>
<text x="210" y="112" text-anchor="middle" class="svg-muted" font-size="11">L1, metrics</text><text x="430" y="112" text-anchor="middle" class="svg-muted" font-size="11">L2, leak and export</text>
</svg><p class="cap">Level 1 access, L1/L2 borders that set Attached and leak, a Level 2 core.</p></div>

<h3>Pre-change and fault checklist</h3>
<ol>
<li>Is <code>family iso</code> on every IS-IS interface, and is the NET on lo0 with a unique system ID?</li>
<li>Do area IDs match where you expect Level 1, and are levels disabled where you do not want them?</li>
<li>Is point-to-point set on both ends of router-to-router links?</li>
<li>Do all routers agree on metric style (wide, narrow, wide-metrics-only) and on a metric plan?</li>
<li>Do Level 1 routers need leaked routes, and is the policy narrow with from level 2, to level 1?</li>
<li>Are redistribution points tagged, and do exports have explicit accept?</li>
<li>Before maintenance, set overload and verify routes have moved; before a change, take a commit confirmed.</li>
<li>When something fails: adjacency, then database, then routes.</li></ol>

<h3>Cheat sheet of commands from the labs</h3>
<table class="cmp"><tr><th>Question</th><th>Command</th></tr>
<tr><td>Who are my neighbours, at which level?</td><td>show isis adjacency</td></tr>
<tr><td>Which interfaces run IS-IS, circuit type, metric?</td><td>show isis interface</td></tr>
<tr><td>Which LSPs exist, and are they Attached or Overload?</td><td>show isis database</td></tr>
<tr><td>Prefixes with Up/Down and Internal/External</td><td>show isis database detail</td></tr>
<tr><td>System ID, area, preferences, metric styles</td><td>show isis overview</td></tr>
<tr><td>IS-IS route table</td><td>show isis route, show route protocol isis</td></tr>
<tr><td>Configuration and policy</td><td>show configuration protocols isis, show configuration policy-options</td></tr>
<tr><td>Events and reasons</td><td>show log messages</td></tr></table>

<h3>Numbers to remember</h3>
<table class="cmp"><tr><th>Item</th><th>Value</th></tr>
<tr><td>Preference L1 and L2 internal</td><td>15 and 18</td></tr>
<tr><td>Preference L1 and L2 external</td><td>160 and 165</td></tr>
<tr><td>OSPF internal and external</td><td>10 and 150</td></tr>
<tr><td>Default interface metric</td><td>10 (any speed)</td></tr>
<tr><td>Narrow limits</td><td>63 per link, 1023 per path</td></tr>
<tr><td>LSP lifetime</td><td>1200 seconds by default</td></tr>
<tr><td>Default DIS priority</td><td>64</td></tr></table>

<h3>Glossary</h3>
<table class="cmp"><tr><th>Term</th><th>Meaning</th></tr>
<tr><td>NET</td><td>Area ID, system ID and NSEL that name a router</td></tr>
<tr><td>L1/L2 router</td><td>A border that keeps two databases and sets Attached</td></tr>
<tr><td>DIS and pseudonode</td><td>The elected LAN router and the virtual node it creates</td></tr>
<tr><td>CSNP and PSNP</td><td>Complete and partial sequence-number PDUs for synchronisation</td></tr>
<tr><td>Up/down bit</td><td>Marks leaked routes so they are not sent back up</td></tr>
<tr><td>Overload bit</td><td>Removes a router as transit; keeps its own prefixes</td></tr>
<tr><td>Attached bit</td><td>Tells Level 1 routers the border can reach other areas</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A one-minute review of the Nagpur lab: R1 (L1) sees a default via R2 (metric 10). After the leak policy, 172.20.4.0/24 arrives with Down bit and metric 110 and 20, and R1 selects R3 at metric 40. In the Jaipur lab, overload on R2 moves R1's path to R3 from metric 20 to 60, and exports on R3 bring R5's loopback into IS-IS as an external route with preference 165.</p></div>

<div class="warn"><p><b>Common mistake.</b> Memorising commands without the layers. The exam gives you output and asks what is wrong; the three-layer method gets you to the answer faster than guessing.</p></div>
<div class="exam"><p><b>Exam trap.</b> Many options look right. Check three things for every IS-IS question: the level, whether the router is L1, L2 or L1/L2, and whether the route is internal or external.</p></div>

<div class="scn"><h4>The clean change window</h4><p>A team planned a core upgrade. They checked the leak policy and metrics, set overload on the first router, confirmed with show route that traffic had moved, upgraded, removed overload and repeated on the second router. Not a single user complaint. The same team had needed three hours for the previous upgrade without a plan.</p><p><b>Lesson:</b> a method turns an upgrade into a routine.</p></div>

<div class="iv"><p class="q">"Walk me through how you would design IS-IS for a campus with fifty access routers and two data centres."</p><p>Access routers Level 1 in a few areas, borders Level 1/Level 2, a Level 2 core. Wide metrics with a reference bandwidth, point-to-point links, narrow leaking of the data-centre prefixes into Level 1 for good exits, overload for maintenance and tagged redistribution where other protocols join.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Choose levels and areas on purpose; keep the backbone contiguous.</li>
<li>Metrics are flat by default; set them with a plan.</li>
<li>Leak narrowly, trust the Down bit, drain with overload.</li>
<li>Export with tags and explicit accepts at every two-way boundary.</li>
<li>Troubleshoot adjacency, database, routes in that order.</li>
</ul></div>
`,hi:`
<p>Ab aapne JN0-650 ke IS-IS objectives ek juri hui kahani ki tarah cover kar liye. Yeh chapter module ko ek page mein samet deta hai jise aap exam se pehle ya change window se pehle dobara dekh sakte ho.</p>

<h3>Design ek tasveer mein</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IS-IS design summary">
<rect x="20" y="20" width="200" height="190" rx="14" fill="#bae6fd" opacity="0.7"/><text x="120" y="42" text-anchor="middle" class="svg-ink" font-size="13">Level 1 area</text>
<rect x="420" y="20" width="200" height="190" rx="14" fill="#ddd6fe" opacity="0.7"/><text x="520" y="42" text-anchor="middle" class="svg-ink" font-size="13">Level 2 backbone</text>
<circle cx="80" cy="120" r="22" fill="#bbf7d0" stroke="#64748b"/><text x="80" y="124" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="80" y="160" text-anchor="middle" class="svg-muted" font-size="11">ATT se default</text>
<circle cx="320" cy="70" r="26" fill="#fde68a" stroke="#64748b"/><text x="320" y="74" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<circle cx="320" cy="170" r="26" fill="#fde68a" stroke="#64748b"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<circle cx="520" cy="120" r="22" fill="#fed7aa" stroke="#64748b"/><text x="520" y="124" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<line x1="100" y1="112" x2="296" y2="76" stroke="#64748b" stroke-width="2"/><line x1="100" y1="128" x2="296" y2="164" stroke="#64748b" stroke-width="2"/>
<line x1="346" y1="74" x2="500" y2="112" stroke="#64748b" stroke-width="2"/><line x1="346" y1="166" x2="500" y2="128" stroke="#64748b" stroke-width="2"/>
<text x="210" y="112" text-anchor="middle" class="svg-muted" font-size="11">L1, metrics</text><text x="430" y="112" text-anchor="middle" class="svg-muted" font-size="11">L2, leak aur export</text>
</svg><p class="cap">Level 1 access, L1/L2 borders jo Attached set aur leak karte hain, Level 2 core.</p></div>

<h3>Pre-change aur fault checklist</h3>
<ol>
<li>Har IS-IS interface par <code>family iso</code> hai, aur lo0 par unique system ID wala NET hai?</li>
<li>Jahan Level 1 chahiye wahan area IDs match karte hain, aur jahan nahi chahiye wahan levels disable hain?</li>
<li>Router-to-router links ke dono ends par point-to-point set hai?</li>
<li>Saare routers metric style (wide, narrow, wide-metrics-only) aur metric plan par agree hain?</li>
<li>Level 1 routers ko leaked routes chahiye, aur policy from level 2, to level 1 ke saath patli hai?</li>
<li>Redistribution points tagged hain, aur exports mein explicit accept hai?</li>
<li>Maintenance se pehle overload set karo aur verify karo ki routes shift ho gaye; change se pehle commit confirmed lo.</li>
<li>Kuch fail ho to: adjacency, phir database, phir routes.</li></ol>

<h3>Labs ke commands ki cheat sheet</h3>
<table class="cmp"><tr><th>Sawal</th><th>Command</th></tr>
<tr><td>Mere neighbours kaun hain, kis level par?</td><td>show isis adjacency</td></tr>
<tr><td>Kaun se interfaces IS-IS chalate hain, circuit type, metric?</td><td>show isis interface</td></tr>
<tr><td>Kaun se LSPs hain, Attached ya Overload?</td><td>show isis database</td></tr>
<tr><td>Up/Down aur Internal/External ke saath prefixes</td><td>show isis database detail</td></tr>
<tr><td>System ID, area, preferences, metric styles</td><td>show isis overview</td></tr>
<tr><td>IS-IS route table</td><td>show isis route, show route protocol isis</td></tr>
<tr><td>Configuration aur policy</td><td>show configuration protocols isis, show configuration policy-options</td></tr>
<tr><td>Events aur reasons</td><td>show log messages</td></tr></table>

<h3>Yaad rakhne wale numbers</h3>
<table class="cmp"><tr><th>Item</th><th>Value</th></tr>
<tr><td>Preference L1 aur L2 internal</td><td>15 aur 18</td></tr>
<tr><td>Preference L1 aur L2 external</td><td>160 aur 165</td></tr>
<tr><td>OSPF internal aur external</td><td>10 aur 150</td></tr>
<tr><td>Default interface metric</td><td>10 (kisi bhi speed par)</td></tr>
<tr><td>Narrow limits</td><td>link par 63, path par 1023</td></tr>
<tr><td>LSP lifetime</td><td>Default 1200 seconds</td></tr>
<tr><td>Default DIS priority</td><td>64</td></tr></table>

<h3>Glossary</h3>
<table class="cmp"><tr><th>Term</th><th>Matlab</th></tr>
<tr><td>NET</td><td>Area ID, system ID aur NSEL jo router ka naam banate hain</td></tr>
<tr><td>L1/L2 router</td><td>Border jo do databases rakhta hai aur Attached set karta hai</td></tr>
<tr><td>DIS aur pseudonode</td><td>Chuna hua LAN router aur woh virtual node jo woh banata hai</td></tr>
<tr><td>CSNP aur PSNP</td><td>Synchronisation ke liye complete aur partial sequence-number PDUs</td></tr>
<tr><td>Up/down bit</td><td>Leak hue routes ko mark karta hai taaki woh upar wapas na jayein</td></tr>
<tr><td>Overload bit</td><td>Router ko transit se hatata hai; uske apne prefixes rakhta hai</td></tr>
<tr><td>Attached bit</td><td>Level 1 routers ko batata hai ki border doosre areas tak pahunch sakta hai</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Nagpur lab ka ek minute ka review: R1 (L1) R2 ke through default dekhta hai (metric 10). Leak policy ke baad 172.20.4.0/24 Down bit aur metric 110 aur 20 ke saath aata hai, aur R1 R3 ko metric 40 par chunta hai. Jaipur lab mein R2 par overload R1 ke R3 tak path ko metric 20 se 60 kar deta hai, aur R3 par exports R5 ke loopback ko IS-IS mein preference 165 wale external route ke roop mein laate hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Layers ke bina commands ratna. Exam aapko output deta hai aur poochta hai kya galat hai; teen-layer method guess karne se tez answer tak pahunchata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Kai options sahi dikhte hain. Har IS-IS sawal mein teen cheezein check karo: level, router L1, L2 ya L1/L2 hai, aur route internal hai ya external.</p></div>

<div class="scn"><h4>Saaf change window</h4><p>Ek team ne core upgrade plan kiya. Unhone leak policy aur metrics check kiye, pehle router par overload set kiya, show route se confirm kiya ki traffic shift ho gaya, upgrade kiya, overload hataya aur doosre router par dohraya. Ek bhi user complaint nahi. Isi team ko pichhle upgrade mein bina plan ke teen ghante lage the.</p><p><b>Lesson:</b> method upgrade ko routine bana deta hai.</p></div>

<div class="iv"><p class="q">"Pachaas access routers aur do data centres wale campus ke liye IS-IS design kaise karoge?"</p><p>Access routers kuch areas mein Level 1, borders Level 1/Level 2, Level 2 core. Reference bandwidth ke saath wide metrics, point-to-point links, achhe exits ke liye data-centre prefixes ka patla leaking Level 1 mein, maintenance ke liye overload aur jahan doosre protocols judte hain wahan tagged redistribution.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Levels aur areas jaanbujhkar chuno; backbone contiguous rakho.</li>
<li>Metrics default mein flat hote hain; plan ke saath set karo.</li>
<li>Patla leak karo, Down bit par bharosa karo, overload se drain karo.</li>
<li>Har do-tarfa boundary par tags aur explicit accepts ke saath export karo.</li>
<li>Adjacency, database, routes isi order mein troubleshoot karo.</li>
</ul></div>
`}};export{e as default};