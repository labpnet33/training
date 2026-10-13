var e={id:`summary`,h:{en:`Summary and exam checklist for IS-IS design`,hi:`IS-IS design ka summary aur exam checklist`},body:{en:`
<p>You have moved from "IS-IS works" to "IS-IS is designed". This chapter pulls the module together, shows the one-page mental map and gives a checklist for the SPCOR 350-501 exam and for real change windows.</p>

<h3>Analogy: the pre-flight checklist</h3>
<p>A pilot who knows how to fly still runs a checklist, because small misses cause the big accidents. A provider engineer does the same with IS-IS: the checklist below would have prevented every scenario in this module.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Module map">
<rect x="240" y="10" width="160" height="46" rx="23" fill="#bbf7d0"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">IS-IS design</text>
<rect x="10" y="110" width="140" height="56" rx="10" fill="#fde68a"/><text x="80" y="134" text-anchor="middle" class="svg-ink" font-size="12">Metric style</text><text x="80" y="152" text-anchor="middle" class="svg-muted" font-size="10">narrow, wide</text>
<rect x="165" y="110" width="140" height="56" rx="10" fill="#bae6fd"/><text x="235" y="134" text-anchor="middle" class="svg-ink" font-size="12">Steering</text><text x="235" y="152" text-anchor="middle" class="svg-muted" font-size="10">metrics, ECMP</text>
<rect x="320" y="110" width="140" height="56" rx="10" fill="#fed7aa"/><text x="390" y="134" text-anchor="middle" class="svg-ink" font-size="12">Levels</text><text x="390" y="152" text-anchor="middle" class="svg-muted" font-size="10">flat or L1/L2</text>
<rect x="475" y="110" width="150" height="56" rx="10" fill="#e9d5ff"/><text x="550" y="134" text-anchor="middle" class="svg-ink" font-size="12">Edge routes</text><text x="550" y="152" text-anchor="middle" class="svg-muted" font-size="10">redistribute, default</text>
<rect x="90" y="185" width="200" height="40" rx="10" fill="#fecaca"/><text x="190" y="210" text-anchor="middle" class="svg-ink" font-size="12">Convergence and protection</text>
<rect x="350" y="185" width="200" height="40" rx="10" fill="#e2e8f0"/><text x="450" y="210" text-anchor="middle" class="svg-ink" font-size="12">Troubleshooting</text>
<g stroke="#64748b" stroke-width="2"><line x1="300" y1="56" x2="80" y2="110"/><line x1="310" y1="56" x2="235" y2="110"/><line x1="330" y1="56" x2="390" y2="110"/><line x1="345" y1="56" x2="550" y2="110"/></g>
</svg><p class="cap">Six design areas of an IS-IS core.</p></div>

<h3>One line per chapter</h3>
<ul>
<li><b>Overview:</b> adjacency up is not proof of a working design.</li>
<li><b>Narrow versus wide:</b> narrow is TLV 2 and 128 with a 6-bit metric (max 63); wide is TLV 22 and 135 with 24 bits.</li>
<li><b>Mixed vendor:</b> IOS XE defaults to narrow; Junos can be set to wide-metrics-only; migrate narrow, transition, wide.</li>
<li><b>Steering:</b> lowest total metric wins, equal totals give ECMP, and raising a metric turns a link into a backup (lab: 10 became 30).</li>
<li><b>Levels:</b> flat level 2 is a legitimate design; hierarchy trades optimality for scale.</li>
<li><b>Redistribution:</b> always through a prefix-list and route-map; default via default-information originate; Junos external preference 165.</li>
<li><b>Convergence:</b> detect, flood, SPF, FIB; BFD, throttles, LFA and TI-LFA, overload bit.</li>
<li><b>Troubleshooting:</b> adjacency, database, routes, forwarding.</li>
</ul>

<h3>The design checklist</h3>
<pre class="code">1. metric style wide on every router (no mixed styles)
2. is-type set explicitly on every router
3. point-to-point on all core links
4. loopbacks advertised, passive on user-facing ports
5. metrics designed and symmetric on both link ends
6. redistribution only through prefix-list and route-map
7. default originated only at the internet-edge PE
8. authentication, BFD and overload-bit policy decided
9. verified with neighbors, database detail, topology, routes</pre>
<p>(This checklist is a reference design, not simulator output.)</p>

<h3>Numbers and facts to memorise</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Narrow interface metric maximum</td><td>63</td></tr>
<tr><td>Narrow path maximum</td><td>1023</td></tr>
<tr><td>Wide interface metric maximum</td><td>16,777,215</td></tr>
<tr><td>IOS XE IS-IS administrative distance</td><td>115</td></tr>
<tr><td>Junos IS-IS preference, internal level 2 / external</td><td>18 / 165</td></tr>
<tr><td>Wide TLVs</td><td>22 and 135</td></tr>
<tr><td>Default interface metric on IOS XE</td><td>10</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Walk the checklist for a new Juniper PE joining a Cisco core. Metric style: Cisco is narrow, so migrate through transition. Is-type: level 2 only on both vendors. Metrics: set the same cost for the same link on both ends. Edge: redistribution only on the internet PE. Verify: neighbours, database detail for IS-Extended, topology and routes. Each item is a command you ran in this module.</p></div>
<div class="warn"><p><b>Common mistake.</b> Treating redistribution or default originate as a quick fix on a core router. Always put them on a deliberate edge router and check the effect on every neighbour.</p></div>
<div class="exam"><p><b>Exam trap.</b> Scenario questions describe a symptom and offer four plausible fixes. Identify the layer first: neighbours up with missing routes is content (metric style or filters), not connectivity. Eliminate options that act on the wrong layer.</p></div>

<div class="scn"><h4>The change that followed the checklist</h4><p>A provider scheduled a wide migration for a mixed core. They enabled transition everywhere, recorded route counts, moved routers one by one to wide, rechecked the database for IS-Extended and removed transition at the end. No customer noticed. Compare this with the Friday batch in chapter 3.</p><p><b>Lesson:</b> a checklist turns a risky change into a routine one.</p></div>

<div class="iv"><p class="q">"Summarise how you would design and run the IS-IS core of a new SP network."</p><p>Wide metrics everywhere, level 2 flat unless scale demands more, explicit is-type, designed symmetric metrics, point-to-point links, filtered redistribution only at the edge, BFD plus throttles plus LFA for convergence, authentication and the overload bit for protection, and a layered troubleshooting method of adjacency, database, routes, forwarding.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Wide metrics everywhere; narrow is a legacy limitation of 63 per link.</li>
<li>Metrics are your traffic-steering tool; design them, on both ends.</li>
<li>Flat level 2 first; add hierarchy only for a reason.</li>
<li>Redistribute with filters, originate default at one edge.</li>
<li>Protect convergence, then troubleshoot bottom up.</li>
</ul></div>
`,hi:`
<p>Aap "IS-IS chalta hai" se "IS-IS design hota hai" tak aa gaye hain. Yeh chapter module ko ek jagah jodta hai, ek page ka mental map dikhata hai aur SPCOR 350-501 exam tatha real change windows ke liye checklist deta hai.</p>

<h3>Analogy: pre-flight checklist</h3>
<p>Jo pilot udna jaanta hai woh bhi checklist chalata hai, kyunki chhoti chook se bade haadse hote hain. Provider engineer IS-IS ke saath yahi karta hai: neeche ki checklist is module ke har scenario ko rok sakti thi.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Module map">
<rect x="240" y="10" width="160" height="46" rx="23" fill="#bbf7d0"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">IS-IS design</text>
<rect x="10" y="110" width="140" height="56" rx="10" fill="#fde68a"/><text x="80" y="134" text-anchor="middle" class="svg-ink" font-size="12">Metric style</text><text x="80" y="152" text-anchor="middle" class="svg-muted" font-size="10">narrow, wide</text>
<rect x="165" y="110" width="140" height="56" rx="10" fill="#bae6fd"/><text x="235" y="134" text-anchor="middle" class="svg-ink" font-size="12">Steering</text><text x="235" y="152" text-anchor="middle" class="svg-muted" font-size="10">metrics, ECMP</text>
<rect x="320" y="110" width="140" height="56" rx="10" fill="#fed7aa"/><text x="390" y="134" text-anchor="middle" class="svg-ink" font-size="12">Levels</text><text x="390" y="152" text-anchor="middle" class="svg-muted" font-size="10">flat ya L1/L2</text>
<rect x="475" y="110" width="150" height="56" rx="10" fill="#e9d5ff"/><text x="550" y="134" text-anchor="middle" class="svg-ink" font-size="12">Edge routes</text><text x="550" y="152" text-anchor="middle" class="svg-muted" font-size="10">redistribute, default</text>
<rect x="90" y="185" width="200" height="40" rx="10" fill="#fecaca"/><text x="190" y="210" text-anchor="middle" class="svg-ink" font-size="12">Convergence aur protection</text>
<rect x="350" y="185" width="200" height="40" rx="10" fill="#e2e8f0"/><text x="450" y="210" text-anchor="middle" class="svg-ink" font-size="12">Troubleshooting</text>
<g stroke="#64748b" stroke-width="2"><line x1="300" y1="56" x2="80" y2="110"/><line x1="310" y1="56" x2="235" y2="110"/><line x1="330" y1="56" x2="390" y2="110"/><line x1="345" y1="56" x2="550" y2="110"/></g>
</svg><p class="cap">IS-IS core ke chhe design areas.</p></div>

<h3>Har chapter ki ek line</h3>
<ul>
<li><b>Overview:</b> adjacency up hona working design ka saboot nahi.</li>
<li><b>Narrow versus wide:</b> narrow TLV 2 aur 128 hai 6-bit metric ke saath (max 63); wide TLV 22 aur 135 hai 24 bits ke saath.</li>
<li><b>Mixed vendor:</b> IOS XE default narrow; Junos wide-metrics-only par set ho sakta hai; narrow, transition, wide migrate karo.</li>
<li><b>Steering:</b> sabse kam total metric jeetta hai, barabar totals ECMP dete hain, aur metric badhane se link backup ban jaata hai (lab: 10 se 30).</li>
<li><b>Levels:</b> flat level 2 jaayaz design hai; hierarchy optimality ke badle scale deti hai.</li>
<li><b>Redistribution:</b> hamesha prefix-list aur route-map se; default default-information originate se; Junos external preference 165.</li>
<li><b>Convergence:</b> detect, flood, SPF, FIB; BFD, throttles, LFA aur TI-LFA, overload bit.</li>
<li><b>Troubleshooting:</b> adjacency, database, routes, forwarding.</li>
</ul>

<h3>Design checklist</h3>
<pre class="code">1. metric style wide on every router (no mixed styles)
2. is-type set explicitly on every router
3. point-to-point on all core links
4. loopbacks advertised, passive on user-facing ports
5. metrics designed and symmetric on both link ends
6. redistribution only through prefix-list and route-map
7. default originated only at the internet-edge PE
8. authentication, BFD and overload-bit policy decided
9. verified with neighbors, database detail, topology, routes</pre>
<p>(Yeh checklist ek reference design hai, simulator output nahi.)</p>

<h3>Yaad rakhne wale numbers aur facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Narrow interface metric maximum</td><td>63</td></tr>
<tr><td>Narrow path maximum</td><td>1023</td></tr>
<tr><td>Wide interface metric maximum</td><td>16,777,215</td></tr>
<tr><td>IOS XE IS-IS administrative distance</td><td>115</td></tr>
<tr><td>Junos IS-IS preference, internal level 2 / external</td><td>18 / 165</td></tr>
<tr><td>Wide TLVs</td><td>22 aur 135</td></tr>
<tr><td>IOS XE par default interface metric</td><td>10</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Cisco core mein judne wale naye Juniper PE ke liye checklist chalao. Metric style: Cisco narrow hai, isliye transition se migrate karo. Is-type: dono vendors par level 2 only. Metrics: ek hi link ke dono ends par same cost. Edge: redistribution sirf internet PE par. Verify: neighbours, IS-Extended ke liye database detail, topology aur routes. Har item ek command hai jo aapne is module mein chalayi.</p></div>
<div class="warn"><p><b>Common mistake.</b> Core router par redistribution ya default originate ko quick fix samajhna. Inhe hamesha soch-samajhkar chune edge router par rakho aur har neighbour par asar check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Scenario sawal ek symptom batate hain aur chaar plausible fixes dete hain. Pehle layer pehchano: neighbours up aur routes missing matlab content (metric style ya filters), connectivity nahi. Galat layer par kaam karne wale options hata do.</p></div>

<div class="scn"><h4>Checklist ke saath kiya gaya change</h4><p>Provider ne mixed core ke liye wide migration schedule kiya. Unhone har jagah transition enable kiya, route counts note kiye, routers ko ek-ek karke wide kiya, IS-Extended ke liye database dobara dekha aur end mein transition hata diya. Kisi customer ko pata nahi chala. Chapter 3 ke shukravaar wale batch se compare karo.</p><p><b>Lesson:</b> checklist risky change ko routine bana deti hai.</p></div>

<div class="iv"><p class="q">"Naye SP network ke IS-IS core ko design aur run kaise karoge, sankshep mein batao."</p><p>Har jagah wide metrics, jab tak scale zyada na maange flat level 2, explicit is-type, designed symmetric metrics, point-to-point links, sirf edge par filtered redistribution, convergence ke liye BFD plus throttles plus LFA, protection ke liye authentication aur overload bit, aur layered troubleshooting method: adjacency, database, routes, forwarding.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har jagah wide metrics; narrow link par 63 ki purani seema hai.</li>
<li>Metrics traffic steering ka tool hain; design karo, dono ends par.</li>
<li>Pehle flat level 2; hierarchy sirf wajah ke saath.</li>
<li>Filters ke saath redistribute karo, default ek edge par originate karo.</li>
<li>Convergence protect karo, phir neeche se upar troubleshoot karo.</li>
</ul></div>
`}};export{e as default};