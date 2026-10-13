var e={id:`isis-summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Think of IS-IS as a postal service with two kinds of sorting offices. Local offices (level 1) know every street in their own district. Regional offices (level 2) know every district but not every street. L1/L2 routers are the offices that do both jobs. Every office keeps the same map of its zone (the link-state database) and finds the shortest path itself. This last chapter ties the whole module together and gives you a checklist for the exam.</p>

<h3>The module in one page</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="IS-IS module map">
<rect x="20" y="20" width="180" height="70" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="110" y="48" text-anchor="middle" class="svg-ink" font-size="13">Foundations</text><text x="110" y="68" text-anchor="middle" class="svg-muted" font-size="11">NET, family iso, PDUs, TLVs</text>
<rect x="230" y="20" width="180" height="70" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">Neighbours</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="11">levels, adjacency, DIS</text>
<rect x="440" y="20" width="180" height="70" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="530" y="48" text-anchor="middle" class="svg-ink" font-size="13">Routing</text><text x="530" y="68" text-anchor="middle" class="svg-muted" font-size="11">metrics, ATT, leaking</text>
<rect x="125" y="115" width="180" height="70" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="215" y="143" text-anchor="middle" class="svg-ink" font-size="13">Operations</text><text x="215" y="163" text-anchor="middle" class="svg-muted" font-size="11">auth, overload, timers</text>
<rect x="335" y="115" width="180" height="70" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="425" y="143" text-anchor="middle" class="svg-ink" font-size="13">Troubleshooting</text><text x="425" y="163" text-anchor="middle" class="svg-muted" font-size="11">five layers, one at a time</text>
<line x1="200" y1="55" x2="230" y2="55" stroke="#64748b" stroke-width="2"/><line x1="410" y1="55" x2="440" y2="55" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">From addresses to adjacencies to routes to operations.</p></div>

<h3>Facts to memorise</h3>
<table class="cmp"><tr><th>Topic</th><th>What to remember</th></tr>
<tr><td>NET</td><td>Area + 6-byte system ID + 00. Example 49.0001.0100.3025.5002.00. System ID must be unique.</td></tr>
<tr><td>Interface</td><td>family iso on the unit and the interface under protocols isis. Loopback is passive.</td></tr>
<tr><td>Levels</td><td>L1 inside an area, L2 between areas, L1/L2 does both. Default is both levels.</td></tr>
<tr><td>Adjacency</td><td>L1 needs the same area; L2 does not. Hello authentication must match.</td></tr>
<tr><td>PDUs</td><td>IIH (hello), LSP, CSNP (summary), PSNP (request or acknowledge).</td></tr>
<tr><td>DIS</td><td>LAN only, highest priority (default 64) then highest MAC, preemptive, no backup, pseudonode LSP .01, CSNP every 10 s, hello 3 s.</td></tr>
<tr><td>Metric</td><td>Default 10 per interface, reference-bandwidth to scale, wide metrics for large values.</td></tr>
<tr><td>Preference</td><td>L1 internal 15, L2 internal 18, L1 external 160, L2 external 165.</td></tr>
<tr><td>ATT bit</td><td>L1/L2 router sets it with a L2 adjacency to another area; L1 routers install a default.</td></tr>
<tr><td>Leaking</td><td>Export policy from level 2 to level 1; leaked routes carry the Down bit.</td></tr>
<tr><td>Timers</td><td>Hello 9 s, hold 27 s, LSP lifetime 1200 s.</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code">show isis interface
show isis overview
show isis adjacency [detail]
show isis database [detail]
show isis route
show route protocol isis</pre>

<h3>IS-IS versus OSPF, the table interviewers love</h3>
<table class="cmp"><tr><th>Point</th><th>IS-IS</th><th>OSPF</th></tr>
<tr><td>Runs over</td><td>Layer 2 directly (CLNS)</td><td>IP protocol 89</td></tr>
<tr><td>Areas</td><td>Link between areas; backbone is the set of L2 routers</td><td>Area 0 and ABRs inside</td></tr>
<tr><td>LAN leader</td><td>DIS, preemptive, no backup</td><td>DR and BDR, not preemptive</td></tr>
<tr><td>Extending</td><td>TLVs, easy to add features</td><td>New LSA types</td></tr>
<tr><td>Default metric</td><td>10</td><td>From reference bandwidth</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Design check: R1 (L1) in 49.0001, R2 (L1/L2) in 49.0001, R3 (L2) in 49.0002. Which adjacencies form? R1-R2 at level 1 (same area). R2-R3 at level 2 (different areas, both have L2). R1-R3 do not connect directly. R2 sets ATT because it has a L2 adjacency to another area, so R1 receives a default route. This is the Pune design from the earlier chapters.</p></div>

<div class="warn"><p><b>Common mistake.</b> Memorising commands without the logic. On the exam, a wrong design is usually hiding behind a plausible output: look at the area, the level and the interface family before the details.</p></div>
<div class="exam"><p><b>Exam checklist.</b> (1) Can I write a NET and explain each part? (2) Can I predict the adjacency level from two area IDs and level settings? (3) Do I know DIS rules, including preemption? (4) Can I explain ATT, default routes and leaking with the Down bit? (5) Do I know the four preferences and the default metric? (6) Can I name hello and LSP authentication differences? (7) Can I follow the five-step troubleshooting order?</p></div>

<div class="scn"><h4>Whiteboard round</h4><p>In an interview you are asked to design IS-IS for a company with a head office and two branches. A good answer picks one area per site, makes the site border routers L1/L2, keeps the head office core at level 2, sets metrics consistently with one reference bandwidth, enables hello and LSP authentication, and uses the overload bit for maintenance. Then you describe how you would verify each layer.</p><p><b>Lesson:</b> a clear structure of design choices matters more than reciting every command.</p></div>

<div class="iv"><p class="q">"Summarise how IS-IS works in one minute."</p><p>IS-IS is a link-state protocol that runs directly over layer 2. Each router has a NET with an area and a system ID, forms adjacencies at level 1 or level 2, floods LSPs and runs SPF. Level 1 stays inside an area, level 2 connects areas, and L1/L2 routers bridge them with the ATT bit. On LANs a DIS creates a pseudonode. Metrics default to 10, and I verify everything with the adjacency, database and route tables.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Everything starts with family iso and a correct NET.</li>
<li>Adjacency rules differ by level; area matters at level 1.</li>
<li>Metrics decide inside IS-IS; preferences decide between protocols.</li>
<li>The ATT bit gives a default; leaking gives specific routes.</li>
<li>Troubleshoot in layers. Next: practise the labs, then continue to BGP.</li>
</ul></div>
`,hi:`
<p>IS-IS ko ek dak seva samjho jismein do tarah ke sorting offices hain. Local offices (level 1) apne district ki har gali jaante hain. Regional offices (level 2) har district jaante hain par har gali nahi. L1/L2 routers dono kaam karne wale offices hain. Har office apne zone ka same map (link-state database) rakhta hai aur shortest path khud nikalta hai. Ye aakhri chapter poore module ko jodta hai aur exam ke liye checklist deta hai.</p>

<h3>Module ek page mein</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="IS-IS module map">
<rect x="20" y="20" width="180" height="70" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="110" y="48" text-anchor="middle" class="svg-ink" font-size="13">Foundations</text><text x="110" y="68" text-anchor="middle" class="svg-muted" font-size="11">NET, family iso, PDUs, TLVs</text>
<rect x="230" y="20" width="180" height="70" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">Neighbours</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="11">levels, adjacency, DIS</text>
<rect x="440" y="20" width="180" height="70" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="530" y="48" text-anchor="middle" class="svg-ink" font-size="13">Routing</text><text x="530" y="68" text-anchor="middle" class="svg-muted" font-size="11">metrics, ATT, leaking</text>
<rect x="125" y="115" width="180" height="70" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="215" y="143" text-anchor="middle" class="svg-ink" font-size="13">Operations</text><text x="215" y="163" text-anchor="middle" class="svg-muted" font-size="11">auth, overload, timers</text>
<rect x="335" y="115" width="180" height="70" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="425" y="143" text-anchor="middle" class="svg-ink" font-size="13">Troubleshooting</text><text x="425" y="163" text-anchor="middle" class="svg-muted" font-size="11">paanch layers, ek ek karke</text>
<line x1="200" y1="55" x2="230" y2="55" stroke="#64748b" stroke-width="2"/><line x1="410" y1="55" x2="440" y2="55" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Addresses se adjacencies, routes aur operations tak.</p></div>

<h3>Yaad rakhne wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Kya yaad rakhna hai</th></tr>
<tr><td>NET</td><td>Area + 6-byte system ID + 00. Example 49.0001.0100.3025.5002.00. System ID unique hona chahiye.</td></tr>
<tr><td>Interface</td><td>Unit par family iso aur protocols isis ke neeche interface. Loopback passive.</td></tr>
<tr><td>Levels</td><td>L1 area ke andar, L2 areas ke beech, L1/L2 dono. Default dono levels.</td></tr>
<tr><td>Adjacency</td><td>L1 ke liye same area; L2 ke liye nahi. Hello authentication match hona chahiye.</td></tr>
<tr><td>PDUs</td><td>IIH (hello), LSP, CSNP (summary), PSNP (request ya acknowledge).</td></tr>
<tr><td>DIS</td><td>Sirf LAN, sabse high priority (default 64) phir highest MAC, preemptive, backup nahi, pseudonode LSP .01, CSNP har 10 s, hello 3 s.</td></tr>
<tr><td>Metric</td><td>Default 10 per interface, scale ke liye reference-bandwidth, bade values ke liye wide metrics.</td></tr>
<tr><td>Preference</td><td>L1 internal 15, L2 internal 18, L1 external 160, L2 external 165.</td></tr>
<tr><td>ATT bit</td><td>Doosre area ke saath L2 adjacency wala L1/L2 router set karta hai; L1 routers default install karte hain.</td></tr>
<tr><td>Leaking</td><td>Level 2 se level 1 export policy; leaked routes par Down bit.</td></tr>
<tr><td>Timers</td><td>Hello 9 s, hold 27 s, LSP lifetime 1200 s.</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code">show isis interface
show isis overview
show isis adjacency [detail]
show isis database [detail]
show isis route
show route protocol isis</pre>

<h3>IS-IS vs OSPF, wo table jo interviewers pasand karte hain</h3>
<table class="cmp"><tr><th>Point</th><th>IS-IS</th><th>OSPF</th></tr>
<tr><td>Kahan chalta hai</td><td>Seedha layer 2 (CLNS)</td><td>IP protocol 89</td></tr>
<tr><td>Areas</td><td>Areas ke beech link; backbone L2 routers ka set</td><td>Area 0 aur beech mein ABRs</td></tr>
<tr><td>LAN leader</td><td>DIS, preemptive, backup nahi</td><td>DR aur BDR, preemptive nahi</td></tr>
<tr><td>Extend karna</td><td>TLVs, features jodna aasaan</td><td>Naye LSA types</td></tr>
<tr><td>Default metric</td><td>10</td><td>Reference bandwidth se</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Design check: R1 (L1) 49.0001 mein, R2 (L1/L2) 49.0001 mein, R3 (L2) 49.0002 mein. Kaun si adjacencies banengi? R1-R2 level 1 par (same area). R2-R3 level 2 par (alag areas, dono ke paas L2). R1-R3 seedha jude nahi. R2 ATT set karta hai kyunki uska doosre area ke saath L2 adjacency hai, isliye R1 ko default route milta hai. Ye pichhle chapters ka Pune design hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Logic ke bina commands ratt lena. Exam mein galat design aksar sahi lagte output ke peeche chhupa hota hai: details se pehle area, level aur interface family dekho.</p></div>
<div class="exam"><p><b>Exam checklist.</b> (1) Kya main NET likh sakta hoon aur har hissa samjha sakta hoon? (2) Kya do area IDs aur level settings se adjacency level bata sakta hoon? (3) Kya DIS rules aur preemption pata hain? (4) Kya ATT, default routes aur Down bit wali leaking samjha sakta hoon? (5) Kya chaar preferences aur default metric pata hain? (6) Kya hello aur LSP authentication ka farq bata sakta hoon? (7) Kya paanch step troubleshooting order follow kar sakta hoon?</p></div>

<div class="scn"><h4>Whiteboard round</h4><p>Interview mein aapse head office aur do branches wali company ke liye IS-IS design karne ko kaha jaata hai. Achha jawab har site ke liye ek area chunta hai, site border routers ko L1/L2 banata hai, head office core level 2 par rakhta hai, ek reference bandwidth se metrics consistent rakhta hai, hello aur LSP authentication enable karta hai, aur maintenance ke liye overload bit use karta hai. Phir batate ho ki har layer kaise verify karoge.</p><p><b>Lesson:</b> design choices ka saaf structure har command batane se zyada maayne rakhta hai.</p></div>

<div class="iv"><p class="q">"IS-IS kaise kaam karta hai, ek minute mein batao."</p><p>IS-IS link-state protocol hai jo seedha layer 2 par chalta hai. Har router ka NET hota hai jismein area aur system ID hota hai, wo level 1 ya level 2 par adjacencies banata hai, LSPs flood karta hai aur SPF chalata hai. Level 1 area ke andar rehta hai, level 2 areas jodta hai, aur L1/L2 routers ATT bit se dono ko jodte hain. LANs par DIS pseudonode banata hai. Metrics default 10 hote hain, aur main sab kuch adjacency, database aur route tables se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sab kuch family iso aur sahi NET se shuru hota hai.</li>
<li>Adjacency rules level ke hisaab se alag; level 1 par area matter karta hai.</li>
<li>IS-IS ke andar metrics tay karte hain; protocols ke beech preferences.</li>
<li>ATT bit default deta hai; leaking specific routes deti hai.</li>
<li>Layers mein troubleshoot karo. Agla: labs practise karo, phir BGP par jao.</li>
</ul></div>
`}};export{e as default};