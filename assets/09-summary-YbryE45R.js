var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with a company where every depot keeps the same city map. You now know how the map is built (LSAs), who writes each notice (router roles), how two depots swap maps (adjacency states), how big companies split into districts (areas), how small branches get a simplified map (stub and NSSA), and how to check everything when a road goes missing.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="OSPF module map">
<rect x="20" y="20" width="130" height="60" rx="10" fill="#bae6fd"/><text x="85" y="46" text-anchor="middle" class="svg-ink" font-size="13">Neighbours</text><text x="85" y="64" text-anchor="middle" class="svg-muted" font-size="11">hello, states, DR</text>
<rect x="175" y="20" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="240" y="46" text-anchor="middle" class="svg-ink" font-size="13">Database</text><text x="240" y="64" text-anchor="middle" class="svg-muted" font-size="11">LSA types 1-5, 7</text>
<rect x="330" y="20" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="395" y="46" text-anchor="middle" class="svg-ink" font-size="13">Areas</text><text x="395" y="64" text-anchor="middle" class="svg-muted" font-size="11">ABR, summaries</text>
<rect x="485" y="20" width="135" height="60" rx="10" fill="#fde68a"/><text x="552" y="46" text-anchor="middle" class="svg-ink" font-size="13">Area types</text><text x="552" y="64" text-anchor="middle" class="svg-muted" font-size="11">stub, NSSA</text>
<rect x="20" y="110" width="290" height="60" rx="10" fill="#fed7aa"/><text x="165" y="136" text-anchor="middle" class="svg-ink" font-size="13">External routes and metrics</text><text x="165" y="154" text-anchor="middle" class="svg-muted" font-size="11">export, E1/E2, reference bandwidth</text>
<rect x="330" y="110" width="290" height="60" rx="10" fill="#e2e8f0"/><text x="475" y="136" text-anchor="middle" class="svg-ink" font-size="13">Troubleshooting</text><text x="475" y="154" text-anchor="middle" class="svg-muted" font-size="11">interface, neighbour, database, route</text>
</svg><p class="cap">The six pieces of OSPF on Junos.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Configure OSPF in several areas with passive interfaces and a fixed router ID.</li>
<li>Read <code>show ospf database</code> and name every LSA type, its creator and its scope.</li>
<li>Identify internal, backbone, ABR and ASBR routers with <code>show ospf overview</code>.</li>
<li>Explain the DR/BDR election, change it with priority, and know why it is not pre-emptive.</li>
<li>Walk an adjacency from Down to Full and name the mismatch behind each stuck state.</li>
<li>Summarise with <code>area-range</code> (override-metric, restrict, exact) under the source area.</li>
<li>Configure stub, totally stubby, NSSA and totally NSSA, including the default route on a Junos ABR.</li>
<li>Export routes with a policy, choose E1 or E2, and tune cost with reference bandwidth.</li>
<li>Run the interface, neighbour, database, route ladder on any ticket.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>LSDB</dt><dd>link-state database; identical in every router of an area.</dd>
<dt>LSA</dt><dd>link-state advertisement; identified by type, ID and advertising router.</dd>
<dt>SPF</dt><dd>shortest path first; the algorithm that builds routes from the LSDB.</dd>
<dt>ABR / ASBR</dt><dd>area border router / autonomous system boundary router.</dd>
<dt>DR / BDR</dt><dd>designated and backup designated router on a broadcast LAN.</dd>
<dt>DbD</dt><dd>database description packet; lists LSA headers during the exchange.</dd>
<dt>NSSA</dt><dd>not-so-stubby area; external routes travel as type 7 LSAs.</dd>
<dt>Virtual link</dt><dd>tunnel through a transit area that extends area 0.</dd>
<dt>Reference bandwidth</dt><dd>value used to turn interface bandwidth into an OSPF cost.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Transport</td><td>IP protocol 89; hellos to 224.0.0.5, DR to 224.0.0.6</td></tr>
<tr><td>Defaults</td><td>hello 10 s, dead 40 s, priority 128, reference bandwidth 100 Mbps</td></tr>
<tr><td>Preference</td><td>internal 10, external 150</td></tr>
<tr><td>LSAs</td><td>1 router, 2 network (DR), 3 summary, 4 ASBRSum, 5 external, 7 NSSA</td></tr>
<tr><td>Hello match</td><td>area, timers, subnet, authentication, stub flag</td></tr>
<tr><td>ExStart / Exchange</td><td>MTU mismatch is the classic cause</td></tr>
<tr><td>Election</td><td>highest priority, then router ID; not pre-emptive; 0 = never</td></tr>
<tr><td>Stub on Junos</td><td>no automatic default; use <code>default-metric</code> / <code>default-lsa</code></td></tr>
<tr><td>area-range</td><td>under the source area on the ABR</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">show ospf neighbor [extensive]
show ospf interface [extensive]
show ospf database [router|network|netsummary|asbrsummary|external|nssa] [detail]
show ospf database summary
show ospf route [abr|asbr|extern]
show ospf overview
show ospf statistics
show ospf log
show route protocol ospf
clear ospf neighbor</pre>

<div class="eg"><p><b>Worked example.</b> Final self-test: area 40 is an NSSA, R4 inside it exports 203.0.113.0/24, and the rest of the network cannot reach it. Which LSA does R4 originate? Type 7. Who translates it? The NSSA ABR (highest router ID). What does R1 see? A type 5 advertised by the ABR. If R4 cannot reach the cloud, which line is missing? <code>nssa default-lsa default-metric</code> on the ABR.</p></div>

<div class="warn"><p><b>Last common mistakes.</b> Stub on one side only; forgetting the passive loopback; leaving a router ID unset; summarising under the wrong area; changing the MTU on one end; trusting a Full neighbour as proof that every prefix is in the table.</p></div>
<div class="exam"><p><b>Exam trap.</b> Read the question for the area type and the router: <code>no-summaries</code> and <code>default-metric</code> belong on the ABR only, while <code>stub</code> and <code>nssa</code> belong on all routers of the area.</p></div>

<div class="scn"><h4>The new engineer's first ticket</h4><p>A new engineer received "the branch lost the Internet". She went down the ladder: neighbour Full, database lacked the default, the ABR had <code>stub</code> but no <code>default-metric</code> after a rebuild. One line later the branch was back. Her notes listed each command she ran, which made the handover easy.</p><p><b>Lesson:</b> a method beats guessing, and notes make fixes repeatable.</p></div>

<div class="iv"><p class="q">"Describe OSPF end to end as if I were a junior colleague."</p><p>Routers find neighbours with hellos, become adjacent, flood LSAs and build the same database per area, then run SPF for routes. Areas keep the databases small; ABRs summarise between areas through area 0; stub and NSSA areas cut external LSAs and use defaults. Costs come from bandwidth, and externals are exported through policy. Finish with how you would troubleshoot.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Know the LSA types, roles, states and area types cold.</li>
<li>Junos specifics: no default into stub areas, policy-based export, priority 128, preference 10/150.</li>
<li>Use the troubleshooting ladder and the extensive and statistics outputs.</li>
<li>Next steps: practise the three labs, then move on to IS-IS and BGP.</li>
</ul></div>
`,hi:`
<p>Aapne ek aisi company se shuru kiya jahan har depot ke paas same city map hota hai. Ab aap jaante ho ki map kaise banta hai (LSAs), har notice kaun likhta hai (router roles), do depots map kaise badalte hain (adjacency states), badi companies districts mein kaise bantti hain (areas), chhote branches ko simplified map kaise milta hai (stub aur NSSA), aur jab koi road gaayab ho to sab kuch kaise check karna hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="OSPF module map">
<rect x="20" y="20" width="130" height="60" rx="10" fill="#bae6fd"/><text x="85" y="46" text-anchor="middle" class="svg-ink" font-size="13">Neighbours</text><text x="85" y="64" text-anchor="middle" class="svg-muted" font-size="11">hello, states, DR</text>
<rect x="175" y="20" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="240" y="46" text-anchor="middle" class="svg-ink" font-size="13">Database</text><text x="240" y="64" text-anchor="middle" class="svg-muted" font-size="11">LSA types 1-5, 7</text>
<rect x="330" y="20" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="395" y="46" text-anchor="middle" class="svg-ink" font-size="13">Areas</text><text x="395" y="64" text-anchor="middle" class="svg-muted" font-size="11">ABR, summaries</text>
<rect x="485" y="20" width="135" height="60" rx="10" fill="#fde68a"/><text x="552" y="46" text-anchor="middle" class="svg-ink" font-size="13">Area types</text><text x="552" y="64" text-anchor="middle" class="svg-muted" font-size="11">stub, NSSA</text>
<rect x="20" y="110" width="290" height="60" rx="10" fill="#fed7aa"/><text x="165" y="136" text-anchor="middle" class="svg-ink" font-size="13">External routes aur metrics</text><text x="165" y="154" text-anchor="middle" class="svg-muted" font-size="11">export, E1/E2, reference bandwidth</text>
<rect x="330" y="110" width="290" height="60" rx="10" fill="#e2e8f0"/><text x="475" y="136" text-anchor="middle" class="svg-ink" font-size="13">Troubleshooting</text><text x="475" y="154" text-anchor="middle" class="svg-muted" font-size="11">interface, neighbour, database, route</text>
</svg><p class="cap">Junos par OSPF ke chhe hisse.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Kai areas mein passive interfaces aur fixed router ID ke saath OSPF configure karna.</li>
<li><code>show ospf database</code> padhna aur har LSA type, uska creator aur scope batana.</li>
<li><code>show ospf overview</code> se internal, backbone, ABR aur ASBR routers pehchaanna.</li>
<li>DR/BDR election samjhana, priority se badalna, aur batana ki wo pre-emptive kyun nahi.</li>
<li>Adjacency ko Down se Full tak chalana aur har atke state ke peeche ka mismatch batana.</li>
<li>Source area ke neeche <code>area-range</code> (override-metric, restrict, exact) se summarise karna.</li>
<li>Stub, totally stubby, NSSA aur totally NSSA configure karna, Junos ABR par default route samet.</li>
<li>Policy se routes export karna, E1 ya E2 chunna, aur reference bandwidth se cost tune karna.</li>
<li>Kisi bhi ticket par interface, neighbour, database, route seedhi chalana.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>LSDB</dt><dd>link-state database; area ke har router mein identical.</dd>
<dt>LSA</dt><dd>link-state advertisement; type, ID aur advertising router se pehchana jaata hai.</dd>
<dt>SPF</dt><dd>shortest path first; wo algorithm jo LSDB se routes banata hai.</dd>
<dt>ABR / ASBR</dt><dd>area border router / autonomous system boundary router.</dd>
<dt>DR / BDR</dt><dd>broadcast LAN par designated aur backup designated router.</dd>
<dt>DbD</dt><dd>database description packet; exchange ke dauran LSA headers list karta hai.</dd>
<dt>NSSA</dt><dd>not-so-stubby area; external routes type 7 LSAs mein chalte hain.</dd>
<dt>Virtual link</dt><dd>transit area ke through tunnel jo area 0 ko badhata hai.</dd>
<dt>Reference bandwidth</dt><dd>wo value jo interface bandwidth ko OSPF cost mein badalti hai.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Transport</td><td>IP protocol 89; hellos 224.0.0.5 par, DR 224.0.0.6 par</td></tr>
<tr><td>Defaults</td><td>hello 10 s, dead 40 s, priority 128, reference bandwidth 100 Mbps</td></tr>
<tr><td>Preference</td><td>internal 10, external 150</td></tr>
<tr><td>LSAs</td><td>1 router, 2 network (DR), 3 summary, 4 ASBRSum, 5 external, 7 NSSA</td></tr>
<tr><td>Hello match</td><td>area, timers, subnet, authentication, stub flag</td></tr>
<tr><td>ExStart / Exchange</td><td>MTU mismatch classic cause hai</td></tr>
<tr><td>Election</td><td>sabse bada priority, phir router ID; pre-emptive nahi; 0 = kabhi nahi</td></tr>
<tr><td>Junos par stub</td><td>apne aap default nahi; <code>default-metric</code> / <code>default-lsa</code> use karo</td></tr>
<tr><td>area-range</td><td>ABR par source area ke neeche</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">show ospf neighbor [extensive]
show ospf interface [extensive]
show ospf database [router|network|netsummary|asbrsummary|external|nssa] [detail]
show ospf database summary
show ospf route [abr|asbr|extern]
show ospf overview
show ospf statistics
show ospf log
show route protocol ospf
clear ospf neighbor</pre>

<div class="eg"><p><b>Worked example.</b> Final self-test: area 40 NSSA hai, uske andar R4 203.0.113.0/24 export karta hai, aur baaki network use reach nahi kar paata. R4 kaun sa LSA originate karta hai? Type 7. Kaun translate karta hai? NSSA ABR (sabse bada router ID). R1 par kya dikhta hai? ABR ka advertise kiya type 5. R4 cloud tak nahi pahunch raha to kaun si line missing hai? ABR par <code>nssa default-lsa default-metric</code>.</p></div>

<div class="warn"><p><b>Aakhri common mistakes.</b> Sirf ek taraf stub; passive loopback bhoolna; router ID unset chhodna; galat area ke neeche summarise karna; link ke ek end par MTU badalna; Full neighbour ko is baat ka saboot maan lena ki har prefix table mein hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawal mein area type aur router padho: <code>no-summaries</code> aur <code>default-metric</code> sirf ABR par jaate hain, jabki <code>stub</code> aur <code>nssa</code> area ke saare routers par.</p></div>

<div class="scn"><h4>Naye engineer ka pehla ticket</h4><p>Naye engineer ko "branch ka Internet chala gaya" ticket mila. Wo seedhi se neeche gayi: neighbour Full, database mein default nahi, rebuild ke baad ABR par <code>stub</code> tha par <code>default-metric</code> nahi. Ek line ke baad branch wapas aa gaya. Uske notes mein har command likhi thi jo usne chalayi, isse handover aasaan hua.</p><p><b>Lesson:</b> method andaaze se behtar hai, aur notes fixes ko repeatable banate hain.</p></div>

<div class="iv"><p class="q">"OSPF ko end to end aise samjhao jaise main junior colleague hoon."</p><p>Routers hellos se neighbours dhoondhte hain, adjacent bante hain, LSAs flood karke har area mein same database banate hain, phir routes ke liye SPF chalate hain. Areas databases chhote rakhte hain; ABRs area 0 ke through areas ke beech summarise karte hain; stub aur NSSA areas external LSAs kaat kar defaults use karte hain. Costs bandwidth se aate hain, aur externals policy se export hote hain. Ant mein troubleshooting kaise karoge wo batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LSA types, roles, states aur area types ratt lo.</li>
<li>Junos specifics: stub areas mein default nahi, policy-based export, priority 128, preference 10/150.</li>
<li>Troubleshooting seedhi aur extensive aur statistics outputs use karo.</li>
<li>Agle steps: teeno labs practise karo, phir IS-IS aur BGP par jaao.</li>
</ul></div>
`}};export{e as default};