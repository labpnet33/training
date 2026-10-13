var e={id:`levels-design`,h:{en:`Level design: flat level 2 or hierarchical L1/L2`,hi:`Level design: flat level 2 ya hierarchical L1/L2`},body:{en:`
<p>IS-IS lets you split a network into <b>areas</b> with two levels. Level 1 routers know their own area in detail. Level 2 routers form the backbone between areas. Level-1/level-2 routers sit on the border and stitch the two together. The design question is whether you need this at all. For many providers the honest answer is <b>no: a single flat level 2</b>.</p>

<h3>Analogy: one city map or a map with districts</h3>
<p>A small town needs one map where every street is visible. A huge country keeps district maps and one highway map. District maps are cheap to print and quick to read, but a driver crossing districts must use the highway map and may not take the perfect route. Hierarchy buys scale at the cost of optimality.</p>

<table class="cmp"><tr><th>Design</th><th>Strengths</th><th>Weaknesses</th></tr>
<tr><td>Flat level 2 (single level, one area or several)</td><td>Simple, optimal paths, full TE and SR visibility, no leaking to manage</td><td>Every router holds the whole LSDB; SPF scales with network size</td></tr>
<tr><td>L1/L2 hierarchy</td><td>Smaller LSDB per router, failures contained in an area</td><td>Suboptimal inter-area paths, route leaking, more operations</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Hierarchical IS-IS design">
<rect x="230" y="20" width="180" height="60" rx="30" fill="#bbf7d0"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="14">Level 2 backbone</text>
<rect x="40" y="150" width="200" height="90" rx="14" fill="#bae6fd"/><text x="140" y="180" text-anchor="middle" class="svg-ink" font-size="13">Area 49.0001 (level 1)</text><text x="140" y="205" text-anchor="middle" class="svg-muted" font-size="11">access routers</text>
<rect x="400" y="150" width="200" height="90" rx="14" fill="#fed7aa"/><text x="500" y="180" text-anchor="middle" class="svg-ink" font-size="13">Area 49.0002 (level 1)</text><text x="500" y="205" text-anchor="middle" class="svg-muted" font-size="11">access routers</text>
<g stroke="#64748b" stroke-width="2"><line x1="260" y1="80" x2="170" y2="150"/><line x1="380" y1="80" x2="470" y2="150"/></g>
<text x="190" y="120" class="svg-accent" font-size="11">L1/L2</text><text x="425" y="120" class="svg-accent" font-size="11">L1/L2</text>
</svg><p class="cap">The classic hierarchy: level-1 areas hang off a level-2 backbone through L1/L2 routers.</p></div>

<h3>What the lab shows</h3>
<p>The first lab is a deliberately flat design: every router is level-2 only. On Cisco that is <code>is-type level-2-only</code>; on Junos it is <code>level 1 disable</code>. Real output from R1 showed this:</p>
<pre class="out">R1# show running-config | section router isis
router isis
 net 49.0010.0000.0000.0001.00
 <span class="hl">is-type level-2-only</span>
 metric-style wide</pre>
<p>All four routers share area 49.0010 and have only level-2 adjacencies (the neighbour Type column reads L2). With level 1 disabled there are no level-1 hellos, no level-1 DIS election and no ATT bit to think about.</p>

<h3>When to introduce levels</h3>
<ul>
<li>Several hundred or thousands of routers, where one flat LSDB makes SPF slow and flooding heavy.</li>
<li>Administrative or organisational boundaries, such as separate regional teams.</li>
<li>Protecting the core from access instability: an access flap is contained in its level-1 area.</li>
</ul>
<p>Modern equipment handles large flat level-2 domains well, and features such as segment routing and traffic engineering prefer full visibility. Many providers therefore keep a flat level 2 until they have a clear reason to split, and use BGP or MPLS (not IS-IS levels) to scale services.</p>

<h3>Hierarchy rules you must remember</h3>
<ul>
<li>Level-1 routers get a default route from the closest L1/L2 router through the <b>ATT bit</b>.</li>
<li>L1 prefixes are propagated up into level 2 by the L1/L2 routers, but level-2 prefixes are not leaked down into level 1 unless you configure route leaking.</li>
<li>Without leaking, a level-1 router sends all inter-area traffic to the nearest L1/L2 router, which may not be the best exit. That is the suboptimal-routing cost.</li>
<li>Reference configuration (not output): leaking down is done with a redistribute from level-2 into level-1 under router isis, controlled by a route-map or distribute list.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A provider has two data-centre areas each with 150 routers. Putting each in level 1 with L1/L2 border routers keeps each LSDB around 150 plus a handful of prefix summaries. A flat level 2 would give each router a database of all 300. At this size either works; at 3,000 routers hierarchy starts to matter.</p></div>
<div class="warn"><p><b>Common mistake.</b> Leaving routers at the default level on IOS XE. Default is level-1/level-2, so a router you thought was level-2 only will also form level-1 adjacencies and flood level-1 LSPs. Always set is-type deliberately.</p></div>
<div class="exam"><p><b>Exam trap.</b> Level-1 routers need an L1/L2 router to leave the area; they do not run level 2. A level-1 adjacency needs a matching area address, while level-2 routers in different areas can still peer.</p></div>

<div class="scn"><h4>The accidental level-1 neighbours</h4><p>A new PE was added with default IS-IS settings to a core designed as level-2 only. It formed both L1 and L2 adjacencies and, because it shared the area ID, its level-1 database grew with prefixes nobody expected. The team set is-type level-2-only on every router and removed the stray level-1 adjacencies.</p><p><b>Lesson:</b> state the level on every router; never rely on defaults.</p></div>

<div class="iv"><p class="q">"Would you build a new SP core as hierarchical IS-IS or flat level 2?"</p><p>I start flat level 2 unless the size or an organisational boundary demands hierarchy. Flat gives optimal paths and full visibility for TE and SR, and it avoids route leaking. I move to L1/L2 when LSDB size, SPF time or fault containment require it, and I plan the leaking of loopbacks so the PE-to-PE LSPs stay optimal.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flat level 2 is a valid and common provider design.</li>
<li>Hierarchy trades path optimality for scale and fault containment.</li>
<li>The ATT bit gives level-1 routers a default; leaking fixes suboptimal exits.</li>
<li>Always set is-type explicitly; the IOS XE default is level-1/level-2.</li>
<li>The lab core is level-2 only on both Cisco and Junos.</li>
</ul></div>
`,hi:`
<p>IS-IS network ko do levels ke saath <b>areas</b> mein baant sakta hai. Level 1 routers apne area ko detail mein jaante hain. Level 2 routers areas ke beech backbone banate hain. Level-1/level-2 routers border par baithkar dono ko jodte hain. Design ka sawal hai ki aapko yeh chahiye bhi ya nahi. Kai providers ke liye imaandaar jawab hai <b>nahi: ek flat level 2</b>.</p>

<h3>Analogy: ek shehar ka nakshaa ya districts wala nakshaa</h3>
<p>Chhote kasbe ko ek hi nakshaa chahiye jisme har gali dikhe. Bade desh mein district maps aur ek highway map hota hai. District maps sasti chhapte hain aur jaldi padhe jaate hain, par districts paar karne wale driver ko highway map use karna padta hai aur ho sakta hai perfect route na mile. Hierarchy scale khareedti hai optimality ki keemat par.</p>

<table class="cmp"><tr><th>Design</th><th>Taakat</th><th>Kamzori</th></tr>
<tr><td>Flat level 2 (single level, ek ya kai areas)</td><td>Simple, optimal paths, poori TE aur SR visibility, leaking nahi</td><td>Har router poora LSDB rakhta hai; SPF network size ke saath badhta hai</td></tr>
<tr><td>L1/L2 hierarchy</td><td>Per router chhota LSDB, failures area mein simit</td><td>Suboptimal inter-area paths, route leaking, zyada operations</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Hierarchical IS-IS design">
<rect x="230" y="20" width="180" height="60" rx="30" fill="#bbf7d0"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="14">Level 2 backbone</text>
<rect x="40" y="150" width="200" height="90" rx="14" fill="#bae6fd"/><text x="140" y="180" text-anchor="middle" class="svg-ink" font-size="13">Area 49.0001 (level 1)</text><text x="140" y="205" text-anchor="middle" class="svg-muted" font-size="11">access routers</text>
<rect x="400" y="150" width="200" height="90" rx="14" fill="#fed7aa"/><text x="500" y="180" text-anchor="middle" class="svg-ink" font-size="13">Area 49.0002 (level 1)</text><text x="500" y="205" text-anchor="middle" class="svg-muted" font-size="11">access routers</text>
<g stroke="#64748b" stroke-width="2"><line x1="260" y1="80" x2="170" y2="150"/><line x1="380" y1="80" x2="470" y2="150"/></g>
<text x="190" y="120" class="svg-accent" font-size="11">L1/L2</text><text x="425" y="120" class="svg-accent" font-size="11">L1/L2</text>
</svg><p class="cap">Classic hierarchy: level-1 areas L1/L2 routers ke zariye level-2 backbone se jude hain.</p></div>

<h3>Lab kya dikhata hai</h3>
<p>Pehla lab jaanbujhkar flat design hai: har router level-2 only hai. Cisco par yeh <code>is-type level-2-only</code> hai; Junos par <code>level 1 disable</code>. R1 ka real output yeh dikhata tha:</p>
<pre class="out">R1# show running-config | section router isis
router isis
 net 49.0010.0000.0000.0001.00
 <span class="hl">is-type level-2-only</span>
 metric-style wide</pre>
<p>Chaaron routers area 49.0010 share karte hain aur sirf level-2 adjacencies hain (neighbour Type column mein L2). Level 1 disable hone par level-1 hellos, level-1 DIS election aur ATT bit ki chinta nahi.</p>

<h3>Levels kab laayein</h3>
<ul>
<li>Kai sau ya hazaaron routers, jahan ek flat LSDB SPF ko dheema aur flooding ko bhaari bana deta hai.</li>
<li>Administrative ya organisational boundaries, jaise alag regional teams.</li>
<li>Core ko access instability se bachana: access flap uske level-1 area mein simit rehta hai.</li>
</ul>
<p>Modern equipment bade flat level-2 domains achhe se sambhalta hai, aur segment routing tatha traffic engineering poori visibility pasand karte hain. Isliye kai providers saaf wajah milne tak flat level 2 rakhte hain, aur services scale karne ke liye BGP ya MPLS use karte hain (IS-IS levels nahi).</p>

<h3>Hierarchy ke rules jo yaad rakhne hain</h3>
<ul>
<li>Level-1 routers ko sabse nazdeeki L1/L2 router se <b>ATT bit</b> ke zariye default route milta hai.</li>
<li>L1 prefixes upar level 2 mein propagate hote hain, par level-2 prefixes neeche tab tak leak nahi hote jab tak route leaking configure na karo.</li>
<li>Leaking ke bina level-1 router sara inter-area traffic nazdeeki L1/L2 router ko bhejta hai, jo best exit na ho. Yahi suboptimal-routing ki keemat hai.</li>
<li>Reference configuration (output nahi): neeche leaking router isis ke andar level-2 se level-1 mein redistribute se hoti hai, route-map ya distribute list se control ke saath.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Provider ke do data-centre areas hain, har ek mein 150 routers. Har ek ko level 1 mein L1/L2 border routers ke saath rakhne se har LSDB lagbhag 150 plus kuch prefix summaries ka rehta hai. Flat level 2 mein har router ke paas sab 300 ka database hota. Is size par dono chalte hain; 3,000 routers par hierarchy matter karne lagti hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> IOS XE par routers ko default level par chhod dena. Default level-1/level-2 hai, isliye jis router ko aap level-2 only samajhte the woh level-1 adjacencies bhi banata hai aur level-1 LSPs flood karta hai. Is-type hamesha jaanbujhkar set karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Level-1 routers ko area se bahar jaane ke liye L1/L2 router chahiye; woh level 2 nahi chalate. Level-1 ko matching area chahiye, jabki level-2 alag areas ke routers bhi peer kar sakte hain.</p></div>

<div class="scn"><h4>Anjaane level-1 neighbours</h4><p>Level-2-only design wale core mein default IS-IS settings ke saath naya PE jod diya gaya. Usne L1 aur L2 dono adjacencies banayi aur, kyunki area ID wahi tha, uska level-1 database aise prefixes se badha jinki kisi ko ummeed nahi thi. Team ne har router par is-type level-2-only set kiya aur bhatke level-1 adjacencies hata di.</p><p><b>Lesson:</b> har router par level likho; defaults par bharosa mat karo.</p></div>

<div class="iv"><p class="q">"Naya SP core hierarchical IS-IS banaoge ya flat level 2?"</p><p>Jab tak size ya organisational boundary hierarchy na maange, main flat level 2 se shuru karta hoon. Flat optimal paths aur TE tatha SR ke liye poori visibility deta hai, aur route leaking se bachata hai. LSDB size, SPF time ya fault containment ki zaroorat par L1/L2 jaata hoon, aur loopbacks ka leaking plan karta hoon taaki PE-to-PE LSPs optimal rahein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flat level 2 valid aur aam provider design hai.</li>
<li>Hierarchy path optimality ke badle scale aur fault containment deti hai.</li>
<li>ATT bit level-1 ko default deta hai; leaking suboptimal exits theek karti hai.</li>
<li>Is-type hamesha explicit set karo; IOS XE default level-1/level-2 hai.</li>
<li>Lab core Cisco aur Junos dono par level-2 only hai.</li>
</ul></div>
`}};export{e as default};