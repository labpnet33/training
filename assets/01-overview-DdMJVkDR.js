var e={id:`overview`,h:{en:`Protocol-independent routing: what you will learn and the big picture`,hi:`Protocol-independent routing: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn.</b> You will learn how a Junos router decides which route to use, and how to create routes that do not depend on any routing protocol: static routes (with backup next hops), aggregate routes (summaries), and generated routes (conditional defaults). You will also learn the small amount of routing policy needed to advertise those routes into OSPF or BGP, and how to prove with the right <code>show</code> command what the router is really doing. These are objectives of JNCIS-ENT (JN0-351 and JN0-352), under protocol-independent routing.</p>
<p><b>Prerequisites.</b> IP addressing and subnetting, basic Junos CLI (candidate configuration, commit, <code>show route</code>) from JNCIA, and a first idea of OSPF as a protocol that learns routes.</p>

<h3>Analogy: a taxi dispatcher's address book</h3>
<p>Imagine a taxi dispatcher with several address books. One was written by the manager (static routes), one is updated by drivers calling in (OSPF), and one comes from a partner company (BGP). When a customer asks for a route to a street, the dispatcher looks in all the books. If two books give an answer, the dispatcher trusts one source more than the other: that trust level is the <b>route preference</b>. The dispatcher also has a habit of using the most detailed address: "Rose Street 12" beats "Rose Street" and "Rose Street" beats "the old town". That is <b>longest prefix match</b>. And sometimes the manager writes "everything in the old town goes to the depot" (an aggregate) or "if the airport road is open, send all unknown addresses that way" (a generated route).</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Routes from several sources into the routing table">
<rect x="20" y="20" width="130" height="40" rx="8" fill="#fde68a"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="13">Static / aggregate</text>
<rect x="20" y="80" width="130" height="40" rx="8" fill="#bae6fd"/><text x="85" y="105" text-anchor="middle" class="svg-ink" font-size="13">OSPF</text>
<rect x="20" y="140" width="130" height="40" rx="8" fill="#ddd6fe"/><text x="85" y="165" text-anchor="middle" class="svg-ink" font-size="13">BGP</text>
<rect x="250" y="60" width="150" height="100" rx="10" fill="#bbf7d0"/><text x="325" y="95" text-anchor="middle" class="svg-ink" font-size="14">inet.0</text><text x="325" y="117" text-anchor="middle" class="svg-muted" font-size="12">routing table</text><text x="325" y="137" text-anchor="middle" class="svg-muted" font-size="12">best = lowest preference</text>
<rect x="500" y="80" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="560" y="102" text-anchor="middle" class="svg-ink" font-size="13">Forwarding</text><text x="560" y="120" text-anchor="middle" class="svg-ink" font-size="13">table (PFE)</text>
<line x1="150" y1="40" x2="250" y2="90" stroke="#64748b" stroke-width="2"/><line x1="150" y1="100" x2="250" y2="110" stroke="#64748b" stroke-width="2"/><line x1="150" y1="160" x2="250" y2="130" stroke="#64748b" stroke-width="2"/><line x1="400" y1="110" x2="500" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="450" y="95" text-anchor="middle" class="svg-accent" font-size="12">active only</text>
</svg><p class="cap">Many sources offer routes; only the active route reaches the forwarding table.</p></div>

<h3>Why "protocol-independent"</h3>
<p>OSPF and BGP are <i>protocols</i>: they discover and exchange routes automatically. Static, aggregate and generated routes exist purely in the local configuration of one router; no neighbour has to speak any protocol for them to exist. That is what protocol-independent means. They are the glue that holds many real networks together: a branch with one uplink, a default route to an ISP, a summary of a campus, a blackhole for unused address space.</p>

<h3>The routers you will use</h3>
<table class="cmp"><tr><th>Lab</th><th>Devices</th><th>Skill</th></tr>
<tr><td>One summary for the whole campus</td><td>SRV, CORE, EDGE, ACC, PC1, PC2</td><td>Aggregate route and export policy</td></tr>
<tr><td>A default route that follows the ISP</td><td>PC1, R2, R1, ISP, SRV</td><td>Generated route, OSPF export, failure test</td></tr>
<tr><td>The branch that took the slow road</td><td>PC, BR1, HQ, SRV</td><td>Static and floating static, black hole</td></tr></table>

<h3>Module roadmap</h3>
<ol>
<li>Route preference and the two tables (chapter 2).</li>
<li>Static routes in depth (chapter 3).</li>
<li>Aggregate routes (chapter 4) and generated routes (chapter 5).</li>
<li>Routing policy to advertise them (chapter 6).</li>
<li>Verification commands (chapter 7), troubleshooting (chapter 8) and a final summary (chapter 9).</li>
</ol>

<div class="eg"><p><b>Worked example.</b> The Pune branch router BR1 connects to HQ over two links. You want everything for HQ's 172.30.0.0/16 to use the fast link, and the slow link only if the fast one fails. Two static routes do it: one with the default preference 5 and one with a higher preference 20 through the other link. No routing protocol is involved, and the router always prefers the lower number. You will build exactly this in the last lab.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking that a static route you typed is automatically advertised to neighbours. It is not. A static route lives only on this router; sharing it needs an export policy (chapter 6).</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam says "static route preference" and means the default 5, not the metric. Preference chooses between <i>sources</i> of routes; metric chooses between routes of the <i>same</i> source.</p></div>

<div class="scn"><h4>The summary that shrank the core table</h4><p>A university campus router advertised each of its 40 static LAN routes separately into the core OSPF area. Every change in a lab building caused a new LSA flood. The team replaced the 40 advertisements with one aggregate route 10.40.0.0/16 and exported only that. The core table shrank by 39 entries and changes inside the campus stopped affecting the core at all.</p><p><b>Lesson:</b> aggregation hides detail from places that do not need it.</p></div>

<div class="iv"><p class="q">"What does protocol-independent routing mean on Junos?"</p><p>It covers routes that are configured locally and not learned from a protocol: static, aggregate and generated routes. They are protocol-independent because they exist without any neighbour. Mention that they are controlled with preference and exported to protocols with routing policy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static, aggregate and generated routes are configured locally and need no protocol.</li>
<li>The lowest route preference wins between sources; the longest prefix wins between routes.</li>
<li>Only active routes are copied to the forwarding table.</li>
<li>Local routes are not advertised to neighbours unless an export policy says so.</li>
<li>The three labs build a summary, a conditional default and a floating backup.</li>
</ul></div>
`,hi:`
<p><b>Aap kya seekhoge.</b> Aap seekhoge ki Junos router kaise tay karta hai kaunsa route use karna hai, aur aise routes kaise banate hain jo kisi routing protocol par depend nahi karte: static routes (backup next hop ke saath), aggregate routes (summaries), aur generated routes (conditional defaults). Yeh bhi seekhoge ki in routes ko OSPF ya BGP mein advertise karne ke liye routing policy ki thodi si zaroorat kitni hai, aur sahi <code>show</code> command se kaise saabit karte ho ki router asal mein kya kar raha hai. Yeh JNCIS-ENT (JN0-351 aur JN0-352) ke objectives hain, protocol-independent routing ke andar.</p>
<p><b>Prerequisites.</b> IP addressing aur subnetting, JNCIA ka basic Junos CLI (candidate configuration, commit, <code>show route</code>), aur OSPF ka pehla idea ki yeh routes seekhne wala protocol hai.</p>

<h3>Analogy: taxi dispatcher ki address books</h3>
<p>Ek taxi dispatcher socho jiske paas kai address books hain. Ek manager ne likhi hai (static routes), ek ko drivers phone karke update karte hain (OSPF), aur ek partner company se aati hai (BGP). Jab customer kisi street ka raasta poochta hai to dispatcher saari books dekhta hai. Agar do books jawab dein to dispatcher ek source par doosre se zyada bharosa karta hai: us bharose ka level <b>route preference</b> hai. Dispatcher sabse detailed address bhi use karta hai: "Rose Street 12" "Rose Street" ko, aur "Rose Street" "purane sheher" ko harata hai. Yeh <b>longest prefix match</b> hai. Aur kabhi manager likhta hai "purane sheher ka sab kuch depot jaayega" (aggregate) ya "airport road khuli ho to saare unknown addresses udhar bhejo" (generated route).</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Kai sources ke routes routing table mein">
<rect x="20" y="20" width="130" height="40" rx="8" fill="#fde68a"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="13">Static / aggregate</text>
<rect x="20" y="80" width="130" height="40" rx="8" fill="#bae6fd"/><text x="85" y="105" text-anchor="middle" class="svg-ink" font-size="13">OSPF</text>
<rect x="20" y="140" width="130" height="40" rx="8" fill="#ddd6fe"/><text x="85" y="165" text-anchor="middle" class="svg-ink" font-size="13">BGP</text>
<rect x="250" y="60" width="150" height="100" rx="10" fill="#bbf7d0"/><text x="325" y="95" text-anchor="middle" class="svg-ink" font-size="14">inet.0</text><text x="325" y="117" text-anchor="middle" class="svg-muted" font-size="12">routing table</text><text x="325" y="137" text-anchor="middle" class="svg-muted" font-size="12">best = sabse kam preference</text>
<rect x="500" y="80" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="560" y="102" text-anchor="middle" class="svg-ink" font-size="13">Forwarding</text><text x="560" y="120" text-anchor="middle" class="svg-ink" font-size="13">table (PFE)</text>
<line x1="150" y1="40" x2="250" y2="90" stroke="#64748b" stroke-width="2"/><line x1="150" y1="100" x2="250" y2="110" stroke="#64748b" stroke-width="2"/><line x1="150" y1="160" x2="250" y2="130" stroke="#64748b" stroke-width="2"/><line x1="400" y1="110" x2="500" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="450" y="95" text-anchor="middle" class="svg-accent" font-size="12">sirf active</text>
</svg><p class="cap">Kai sources routes dete hain; sirf active route forwarding table tak jaata hai.</p></div>

<h3>"Protocol-independent" kyun</h3>
<p>OSPF aur BGP <i>protocols</i> hain: routes khud discover aur exchange karte hain. Static, aggregate aur generated routes sirf ek router ke local configuration mein hote hain; unke hone ke liye kisi neighbour ko koi protocol bolna zaroori nahi. Yahi protocol-independent ka matlab hai. Yeh kai real networks ko jodne wala glue hain: ek uplink wala branch, ISP ka default route, campus ka summary, unused address space ke liye blackhole.</p>

<h3>Jin routers ko aap use karoge</h3>
<table class="cmp"><tr><th>Lab</th><th>Devices</th><th>Skill</th></tr>
<tr><td>Poore campus ke liye ek summary</td><td>SRV, CORE, EDGE, ACC, PC1, PC2</td><td>Aggregate route aur export policy</td></tr>
<tr><td>Aisa default route jo ISP ke saath chale</td><td>PC1, R2, R1, ISP, SRV</td><td>Generated route, OSPF export, failure test</td></tr>
<tr><td>Branch jo dheemi raah par chala</td><td>PC, BR1, HQ, SRV</td><td>Static aur floating static, black hole</td></tr></table>

<h3>Module roadmap</h3>
<ol>
<li>Route preference aur do tables (chapter 2).</li>
<li>Static routes gehrai se (chapter 3).</li>
<li>Aggregate routes (chapter 4) aur generated routes (chapter 5).</li>
<li>Unhe advertise karne ke liye routing policy (chapter 6).</li>
<li>Verification commands (chapter 7), troubleshooting (chapter 8) aur final summary (chapter 9).</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Pune branch router BR1 HQ se do links se juda hai. Aap chahte ho HQ ke 172.30.0.0/16 ka sab kuch fast link se jaaye, aur slow link tabhi jab fast gir jaaye. Do static routes yeh kar dete hain: ek default preference 5 ke saath aur ek doosre link se zyada preference 20 ke saath. Koi routing protocol nahi, aur router hamesha kam number ko chunta hai. Aap bilkul yahi aakhri lab mein banaoge.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Yeh sochna ki aapka type kiya static route apne aap neighbours ko advertise ho jaata hai. Nahi hota. Static route sirf is router par rehta hai; share karne ke liye export policy chahiye (chapter 6).</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam "static route preference" kehta hai to matlab default 5 hai, metric nahi. Preference route ke <i>sources</i> ke beech chunti hai; metric <i>ek hi</i> source ke routes ke beech.</p></div>

<div class="scn"><h4>Summary jisne core table chhota kiya</h4><p>Ek university campus router apne 40 static LAN routes ko core OSPF area mein alag-alag advertise karta tha. Lab building mein har change se naya LSA flood hota tha. Team ne 40 advertisements ki jagah ek aggregate route 10.40.0.0/16 banaya aur sirf wahi export kiya. Core table 39 entries chhota ho gaya aur campus ke andar ke changes core ko chhoote hi nahi the.</p><p><b>Lesson:</b> aggregation detail ko un jagahon se chhupata hai jinhe uski zaroorat nahi.</p></div>

<div class="iv"><p class="q">"Junos mein protocol-independent routing ka kya matlab hai?"</p><p>Yeh un routes ko cover karta hai jo locally configure hote hain aur kisi protocol se seekhe nahi jaate: static, aggregate aur generated routes. Yeh protocol-independent isliye hain kyunki inke liye neighbour ki zaroorat nahi. Yeh batao ki unhe preference se control karte hain aur routing policy se protocols mein export karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static, aggregate aur generated routes locally configure hote hain aur protocol nahi chahiye.</li>
<li>Sources ke beech sabse kam route preference jeetti hai; routes ke beech longest prefix.</li>
<li>Sirf active routes forwarding table mein copy hote hain.</li>
<li>Local routes neighbours ko tab tak advertise nahi hote jab tak export policy na kahe.</li>
<li>Teen labs summary, conditional default aur floating backup banate hain.</li>
</ul></div>
`}};export{e as default};