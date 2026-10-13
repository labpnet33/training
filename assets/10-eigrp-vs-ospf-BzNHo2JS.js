var e={id:`eigrp-vs-ospf`,h:{en:`EIGRP vs OSPF: the blueprint comparison`,hi:`EIGRP vs OSPF: blueprint comparison`},body:{en:`
<p>Two friends are travelling across a new city. The first asks a traffic constable at each junction, "Which way to the station and how far?" and trusts the answer; he also remembers which other constables gave a reasonable answer, just in case. The second buys a complete city map at the airport and plans every route himself. The first is <b>EIGRP</b> (advanced distance vector), the second is <b>OSPF</b> (link state). ENCOR blueprint item <b>3.2.a</b> asks you to compare them on exactly these points: advanced distance vector vs link state, load balancing, path selection, path operations, metrics and area types.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="EIGRP and OSPF views of the network">
<rect x="20" y="20" width="290" height="220" rx="10" fill="#bbf7d0" opacity="0.5"/>
<text x="165" y="44" text-anchor="middle" class="svg-ink" font-size="14">EIGRP: ask the neighbours</text>
<rect x="115" y="120" width="100" height="40" rx="6" fill="#bae6fd"/><text x="165" y="145" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="40" y="60" width="90" height="34" rx="6" fill="#e2e8f0"/><text x="85" y="82" text-anchor="middle" class="svg-muted" font-size="12">R2: 3072</text>
<rect x="200" y="60" width="90" height="34" rx="6" fill="#e2e8f0"/><text x="245" y="82" text-anchor="middle" class="svg-muted" font-size="12">R3: 2816</text>
<line x1="85" y1="94" x2="140" y2="120" stroke="#64748b" stroke-width="2"/><line x1="245" y1="94" x2="190" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="165" y="195" text-anchor="middle" class="svg-muted" font-size="12">knows distances only</text>
<text x="165" y="215" text-anchor="middle" class="svg-muted" font-size="12">DUAL picks successor + FS</text>
<rect x="330" y="20" width="290" height="220" rx="10" fill="#ddd6fe" opacity="0.5"/>
<text x="475" y="44" text-anchor="middle" class="svg-ink" font-size="14">OSPF: own the map</text>
<circle cx="420" cy="90" r="16" fill="#bae6fd"/><circle cx="530" cy="90" r="16" fill="#bae6fd"/><circle cx="475" cy="150" r="16" fill="#bae6fd"/>
<line x1="436" y1="90" x2="514" y2="90" stroke="#64748b" stroke-width="2"/><line x1="428" y1="104" x2="465" y2="137" stroke="#64748b" stroke-width="2"/><line x1="522" y1="104" x2="485" y2="137" stroke="#64748b" stroke-width="2"/>
<text x="475" y="195" text-anchor="middle" class="svg-muted" font-size="12">identical LSDB per area</text>
<text x="475" y="215" text-anchor="middle" class="svg-muted" font-size="12">SPF computes every path</text>
</svg><p class="cap">EIGRP learns distances from neighbours; OSPF floods link-state information and computes paths from a shared map.</p></div>

<h3>The comparison table</h3>
<table class="cmp"><tr><th>Point</th><th>EIGRP</th><th>OSPF</th></tr>
<tr><td>Protocol type</td><td>Advanced distance vector</td><td>Link state</td></tr>
<tr><td>Algorithm</td><td>DUAL, with feasible successors</td><td>Dijkstra SPF on the link-state database</td></tr>
<tr><td>Standard</td><td>Cisco, informational RFC 7868</td><td>Open standard (OSPFv2, OSPFv3), every vendor</td></tr>
<tr><td>Transport</td><td>IP protocol 88, 224.0.0.10</td><td>IP protocol 89, 224.0.0.5 and 224.0.0.6</td></tr>
<tr><td>Administrative distance</td><td>90 internal, 170 external, 5 summary</td><td>110 for all OSPF routes</td></tr>
<tr><td>Metric</td><td>Composite: min bandwidth + total delay (wide metrics in named mode)</td><td>Cost = reference bandwidth / interface bandwidth, summed along the path</td></tr>
<tr><td>Load balancing</td><td>Equal cost, and <b>unequal cost</b> with variance</td><td>Equal cost only</td></tr>
<tr><td>Path selection</td><td>Lowest composite metric; AD separates internal from external</td><td>Route type first: intra-area, then inter-area, then E1/N1, then E2/N2; cost only breaks ties within a type</td></tr>
<tr><td>Path operations</td><td>Partial bounded updates; Queries and Replies when no FS; no periodic refresh</td><td>LSAs flooded in the area, LSDB synchronised, SPF rerun; LSAs refreshed every 30 minutes</td></tr>
<tr><td>Hierarchy and area types</td><td>None. Flat AS; summarise on any interface; stub <b>routers</b> limit queries</td><td>Area 0 backbone plus normal, stub, totally stubby, NSSA and totally NSSA areas; summarise at ABR and ASBR</td></tr>
<tr><td>Neighbour must match</td><td>AS, K values, subnet, authentication</td><td>Area, hello/dead timers, subnet and mask, authentication, stub flags, MTU for FULL</td></tr>
<tr><td>Multi-access segments</td><td>No DR; every router peers with every router</td><td>DR and BDR elected</td></tr>
<tr><td>Backup path</td><td>Pre-computed FS, used instantly</td><td>Recomputed by SPF after flooding (fast, but a computation)</td></tr>
</table>

<h3>Path selection in more detail</h3>
<p>EIGRP compares one number: the lowest composite metric wins, and up to <code>maximum-paths</code> equal (or, with variance, feasible unequal) paths are installed. An internal route (<code>D</code>, AD 90) beats an external route to the same prefix (<code>D EX</code>, AD 170) at the routing-table level. OSPF is stricter: it prefers an intra-area route over an inter-area route <b>even if the inter-area cost is lower</b>, and inter-area over external. You will study those route types in the next module, ENCOR OSPF.</p>

<div class="eg"><p><b>Worked example: lab 1 under both protocols.</b> EIGRP, as you calculated: via R2 = 3328, backup via the 10 Mbps link = 256512, and the backup is a feasible successor. OSPF with the default 100 Mbps reference bandwidth: a Gigabit link costs 1 and the 10 Mbps link costs 10. Via R2 = 1 + 1 + 1 = <b>3</b>; via the backup = 10 + 1 = <b>11</b>. Both protocols pick the R2 path. The differences appear when things change:</p>
<ul>
<li><b>R1 to R2 fails.</b> EIGRP promotes the FS immediately with no packets exchanged. OSPF floods new LSAs, reruns SPF and installs the cost-11 path; with tuned timers this is also sub-second, but it is a fresh computation.</li>
<li><b>You want both links used.</b> EIGRP: <code>variance</code> (if the numbers allow). OSPF: only by making the costs exactly equal, which would send half the traffic over the slow link.</li>
</ul></div>

<h3>Metrics: a quick contrast</h3>
<pre class="code"><span class="c">! EIGRP classic, default K values</span>
metric = 256 x ( 10^7 / min-bandwidth-Kbps + sum-of-delays / 10 )

<span class="c">! OSPF</span>
cost per interface = reference-bandwidth / interface-bandwidth  (default reference 100 Mbps)
path cost = sum of outgoing interface costs</pre>
<p>Both take bandwidth from the interface <code>bandwidth</code> value, which is another reason to steer EIGRP with delay: changing bandwidth would also move OSPF traffic if both run on the router.</p>

<h3>Choosing between them</h3>
<ul>
<li><b>Multi-vendor</b> network, firewalls or cloud routers in the IGP: OSPF.</li>
<li>Large domains that need strict <b>hierarchy</b> and predictable flooding boundaries: OSPF areas.</li>
<li><b>Cisco-only</b> WAN, especially large hub-and-spoke DMVPN, where simple configuration, stub spokes, summarisation anywhere and unequal-cost load balancing matter: EIGRP.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Saying EIGRP has "areas" because you can summarise or configure stubs. EIGRP has no area concept at all. An EIGRP <b>stub router</b> (not queried) is unrelated to an OSPF <b>stub area</b> (no external LSAs).</p></div>

<div class="exam"><p><b>Exam trap.</b> Which protocol supports unequal-cost load balancing? Only EIGRP. Which has area types? Only OSPF. Which elects a DR? Only OSPF. Which needs matching hello timers? Only OSPF. AD 90 vs 110; protocol 88 vs 89.</p></div>

<div class="scn"><h4>Merging two companies</h4><p>An Indian IT services company running EIGRP acquired a firm whose network ran OSPF on mixed-vendor routers. For three months the edge routers redistributed between the two protocols, with route tags to avoid loops. Because EIGRP internal routes (AD 90) beat OSPF (AD 110), traffic between shared prefixes followed EIGRP until the migration moved each site to OSPF. The team finally removed EIGRP when the last site moved.</p><p><b>Lesson:</b> AD decides between protocols, metric decides within one; multi-vendor growth is the most common reason companies move from EIGRP to OSPF.</p></div>

<div class="iv"><p class="q">"Compare EIGRP and OSPF."</p><p>Strong answer: structure it. Type: advanced distance vector with DUAL vs link state with SPF. Metric: composite bandwidth and delay vs cost from reference bandwidth. Load balancing: EIGRP does equal and unequal cost, OSPF equal only. Path selection: lowest metric vs route type first. Operations: partial updates and queries vs LSA flooding and SPF. Hierarchy: flat with summarisation anywhere vs areas and area types. Close with when you would choose each.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EIGRP: advanced distance vector, DUAL, pre-computed FS; OSPF: link state, LSDB, SPF.</li>
<li>EIGRP metric = bandwidth + delay; OSPF cost = reference bandwidth / interface bandwidth.</li>
<li>Only EIGRP does unequal-cost load balancing; OSPF shares equal-cost paths only.</li>
<li>OSPF selects by route type first (intra, inter, E1, E2); EIGRP by lowest metric.</li>
<li>OSPF has areas and area types; EIGRP is flat and uses summarisation and stub routers instead.</li>
</ul></div>
`,hi:`
<p>Do dost ek naye shehar mein ghoom rahe hain. Pehla har chauraahe par traffic constable se poochta hai, "Station kis taraf hai aur kitni door?" aur jawab par bharosa karta hai; woh yeh bhi yaad rakhta hai ki kin doosre constables ne theek-thaak jawab diya tha, zaroorat padne par. Doosra airport par shehar ka poora map khareedta hai aur har route khud plan karta hai. Pehla <b>EIGRP</b> (advanced distance vector) hai, doosra <b>OSPF</b> (link state). ENCOR blueprint item <b>3.2.a</b> aapse bilkul inhi points par dono ko compare karwata hai: advanced distance vector vs link state, load balancing, path selection, path operations, metrics aur area types.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Network ke EIGRP aur OSPF views">
<rect x="20" y="20" width="290" height="220" rx="10" fill="#bbf7d0" opacity="0.5"/>
<text x="165" y="44" text-anchor="middle" class="svg-ink" font-size="14">EIGRP: neighbours se poochho</text>
<rect x="115" y="120" width="100" height="40" rx="6" fill="#bae6fd"/><text x="165" y="145" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="40" y="60" width="90" height="34" rx="6" fill="#e2e8f0"/><text x="85" y="82" text-anchor="middle" class="svg-muted" font-size="12">R2: 3072</text>
<rect x="200" y="60" width="90" height="34" rx="6" fill="#e2e8f0"/><text x="245" y="82" text-anchor="middle" class="svg-muted" font-size="12">R3: 2816</text>
<line x1="85" y1="94" x2="140" y2="120" stroke="#64748b" stroke-width="2"/><line x1="245" y1="94" x2="190" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="165" y="195" text-anchor="middle" class="svg-muted" font-size="12">sirf distances pata hain</text>
<text x="165" y="215" text-anchor="middle" class="svg-muted" font-size="12">DUAL successor + FS chunta hai</text>
<rect x="330" y="20" width="290" height="220" rx="10" fill="#ddd6fe" opacity="0.5"/>
<text x="475" y="44" text-anchor="middle" class="svg-ink" font-size="14">OSPF: apna map</text>
<circle cx="420" cy="90" r="16" fill="#bae6fd"/><circle cx="530" cy="90" r="16" fill="#bae6fd"/><circle cx="475" cy="150" r="16" fill="#bae6fd"/>
<line x1="436" y1="90" x2="514" y2="90" stroke="#64748b" stroke-width="2"/><line x1="428" y1="104" x2="465" y2="137" stroke="#64748b" stroke-width="2"/><line x1="522" y1="104" x2="485" y2="137" stroke="#64748b" stroke-width="2"/>
<text x="475" y="195" text-anchor="middle" class="svg-muted" font-size="12">har area mein identical LSDB</text>
<text x="475" y="215" text-anchor="middle" class="svg-muted" font-size="12">SPF har path compute karta hai</text>
</svg><p class="cap">EIGRP neighbours se distances seekhta hai; OSPF link-state information flood karta hai aur shared map se paths compute karta hai.</p></div>

<h3>Comparison table</h3>
<table class="cmp"><tr><th>Point</th><th>EIGRP</th><th>OSPF</th></tr>
<tr><td>Protocol type</td><td>Advanced distance vector</td><td>Link state</td></tr>
<tr><td>Algorithm</td><td>DUAL, feasible successors ke saath</td><td>Link-state database par Dijkstra SPF</td></tr>
<tr><td>Standard</td><td>Cisco, informational RFC 7868</td><td>Open standard (OSPFv2, OSPFv3), har vendor</td></tr>
<tr><td>Transport</td><td>IP protocol 88, 224.0.0.10</td><td>IP protocol 89, 224.0.0.5 aur 224.0.0.6</td></tr>
<tr><td>Administrative distance</td><td>90 internal, 170 external, 5 summary</td><td>Saare OSPF routes ke liye 110</td></tr>
<tr><td>Metric</td><td>Composite: min bandwidth + total delay (named mode mein wide metrics)</td><td>Cost = reference bandwidth / interface bandwidth, path par joda hua</td></tr>
<tr><td>Load balancing</td><td>Equal cost, aur variance se <b>unequal cost</b></td><td>Sirf equal cost</td></tr>
<tr><td>Path selection</td><td>Sabse kam composite metric; AD internal ko external se alag karta hai</td><td>Pehle route type: intra-area, phir inter-area, phir E1/N1, phir E2/N2; cost sirf ek type ke andar tie todta hai</td></tr>
<tr><td>Path operations</td><td>Partial bounded updates; FS na ho to Queries aur Replies; koi periodic refresh nahi</td><td>Area mein LSAs flood, LSDB sync, SPF dobara; LSAs har 30 minute refresh</td></tr>
<tr><td>Hierarchy aur area types</td><td>Koi nahi. Flat AS; kisi bhi interface par summarise; stub <b>routers</b> queries limit karte hain</td><td>Area 0 backbone plus normal, stub, totally stubby, NSSA aur totally NSSA areas; ABR aur ASBR par summarise</td></tr>
<tr><td>Neighbour ke liye match</td><td>AS, K values, subnet, authentication</td><td>Area, hello/dead timers, subnet aur mask, authentication, stub flags, FULL ke liye MTU</td></tr>
<tr><td>Multi-access segments</td><td>Koi DR nahi; har router har router se peer karta hai</td><td>DR aur BDR elect hote hain</td></tr>
<tr><td>Backup path</td><td>Pre-computed FS, turant use</td><td>Flooding ke baad SPF se dobara compute (fast, lekin ek computation)</td></tr>
</table>

<h3>Path selection thoda aur detail mein</h3>
<p>EIGRP ek number compare karta hai: sabse kam composite metric jeetta hai, aur <code>maximum-paths</code> tak barabar (ya variance ke saath feasible unequal) paths install hote hain. Same prefix ke liye internal route (<code>D</code>, AD 90) routing-table level par external route (<code>D EX</code>, AD 170) ko haraata hai. OSPF zyada strict hai: woh intra-area route ko inter-area route se prefer karta hai <b>chahe inter-area cost kam ho</b>, aur inter-area ko external se. Yeh route types aap agle module, ENCOR OSPF, mein padhoge.</p>

<div class="eg"><p><b>Worked example: dono protocols ke neeche lab 1.</b> EIGRP, jaisa aapne calculate kiya: R2 se = 3328, 10 Mbps link wala backup = 256512, aur backup feasible successor hai. OSPF default 100 Mbps reference bandwidth ke saath: Gigabit link ki cost 1 aur 10 Mbps link ki cost 10. R2 se = 1 + 1 + 1 = <b>3</b>; backup se = 10 + 1 = <b>11</b>. Dono protocols R2 wala path chunte hain. Fark tab dikhta hai jab kuch badalta hai:</p>
<ul>
<li><b>R1 se R2 fail hota hai.</b> EIGRP bina koi packet exchange kiye FS ko turant promote karta hai. OSPF naye LSAs flood karta hai, SPF dobara chalata hai aur cost-11 path install karta hai; tuned timers ke saath yeh bhi sub-second hai, lekin yeh ek fresh computation hai.</li>
<li><b>Aap dono links use karna chahte ho.</b> EIGRP: <code>variance</code> (agar numbers ijaazat dein). OSPF: sirf costs bilkul barabar karke, jo aadha traffic slow link par bhej dega.</li>
</ul></div>

<h3>Metrics: ek jaldi sa contrast</h3>
<pre class="code"><span class="c">! EIGRP classic, default K values</span>
metric = 256 x ( 10^7 / min-bandwidth-Kbps + sum-of-delays / 10 )

<span class="c">! OSPF</span>
cost per interface = reference-bandwidth / interface-bandwidth  (default reference 100 Mbps)
path cost = outgoing interface costs ka jod</pre>
<p>Dono interface ki <code>bandwidth</code> value se bandwidth lete hain, yeh EIGRP ko delay se steer karne ki ek aur wajah hai: agar router par dono chal rahe hain to bandwidth badalne se OSPF traffic bhi hil jaayega.</p>

<h3>Dono mein se chunna</h3>
<ul>
<li><b>Multi-vendor</b> network, IGP mein firewalls ya cloud routers: OSPF.</li>
<li>Bade domains jinhe strict <b>hierarchy</b> aur predictable flooding boundaries chahiye: OSPF areas.</li>
<li><b>Cisco-only</b> WAN, khaas kar bada hub-and-spoke DMVPN, jahan simple configuration, stub spokes, kahin bhi summarisation aur unequal-cost load balancing matter karte hain: EIGRP.</li>
</ul>

<div class="warn"><p><b>Common galti.</b> Yeh kehna ki EIGRP mein "areas" hain kyunki aap summarise kar sakte ho ya stubs configure kar sakte ho. EIGRP mein area ka koi concept hi nahi. EIGRP <b>stub router</b> (query nahi hota) ka OSPF <b>stub area</b> (external LSAs nahi) se koi lena-dena nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Kaunsa protocol unequal-cost load balancing support karta hai? Sirf EIGRP. Kisme area types hain? Sirf OSPF. Kaun DR elect karta hai? Sirf OSPF. Kise matching hello timers chahiye? Sirf OSPF. AD 90 vs 110; protocol 88 vs 89.</p></div>

<div class="scn"><h4>Do companies ka merger</h4><p>EIGRP chalane wali ek Indian IT services company ne ek firm acquire ki jiska network mixed-vendor routers par OSPF chalata tha. Teen mahine tak edge routers ne dono protocols ke beech redistribute kiya, loops se bachne ke liye route tags ke saath. Kyunki EIGRP internal routes (AD 90) OSPF (AD 110) ko haraate hain, shared prefixes ke beech traffic EIGRP follow karta raha jab tak migration ne har site ko OSPF par nahi le liya. Aakhri site move hone par team ne EIGRP hata diya.</p><p><b>Seekh:</b> AD protocols ke beech decide karta hai, metric ek protocol ke andar; multi-vendor growth companies ke EIGRP se OSPF par jaane ki sabse aam wajah hai.</p></div>

<div class="iv"><p class="q">"EIGRP aur OSPF compare karo."</p><p>Strong answer: structure mein bolo. Type: DUAL ke saath advanced distance vector vs SPF ke saath link state. Metric: composite bandwidth aur delay vs reference bandwidth se cost. Load balancing: EIGRP equal aur unequal cost karta hai, OSPF sirf equal. Path selection: sabse kam metric vs pehle route type. Operations: partial updates aur queries vs LSA flooding aur SPF. Hierarchy: kahin bhi summarisation ke saath flat vs areas aur area types. Aakhir mein batao ki aap kab kaunsa chunoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EIGRP: advanced distance vector, DUAL, pre-computed FS; OSPF: link state, LSDB, SPF.</li>
<li>EIGRP metric = bandwidth + delay; OSPF cost = reference bandwidth / interface bandwidth.</li>
<li>Sirf EIGRP unequal-cost load balancing karta hai; OSPF sirf equal-cost paths share karta hai.</li>
<li>OSPF pehle route type se chunta hai (intra, inter, E1, E2); EIGRP sabse kam metric se.</li>
<li>OSPF mein areas aur area types hain; EIGRP flat hai aur iski jagah summarisation aur stub routers use karta hai.</li>
</ul></div>
`}};export{e as default};