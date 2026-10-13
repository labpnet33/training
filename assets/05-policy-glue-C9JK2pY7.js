var e={id:`policy-glue`,h:{en:`Routing policy: the glue between protocols`,hi:`Routing policy: protocols ko jodne wali glue`},body:{en:`
<p>Routing protocols decide how routes are <i>learned and calculated</i>. <b>Routing policy</b> decides which routes are <i>allowed in and out</i> and with what attributes. Every professional topic uses it: OSPF and IS-IS export, BGP import and export, route leaking, redistribution, even load balancing. If you master the policy language once, the rest becomes easier.</p>

<h3>Analogy: a passport desk</h3>
<p>Routes travel between countries (protocols and the routing table). At each border sits an officer with a checklist. The officer checks the passport (from conditions), then stamps or turns the traveller back (then actions). Different borders have different checklists, and a traveller with no matching rule gets the border's default treatment.</p>

<h3>The structure of a policy</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Import and export direction">
<rect x="30" y="60" width="150" height="60" rx="10" fill="#bae6fd"/><text x="105" y="88" text-anchor="middle" class="svg-ink" font-size="13">Protocol</text><text x="105" y="106" text-anchor="middle" class="svg-muted" font-size="11">OSPF, IS-IS, BGP</text>
<rect x="245" y="60" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">Routing table</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="11">inet.0</text>
<rect x="460" y="60" width="150" height="60" rx="10" fill="#ddd6fe"/><text x="535" y="88" text-anchor="middle" class="svg-ink" font-size="13">Protocol</text><text x="535" y="106" text-anchor="middle" class="svg-muted" font-size="11">another or same</text>
<line x1="180" y1="80" x2="245" y2="80" stroke="#64748b" stroke-width="2"/><text x="212" y="72" text-anchor="middle" class="svg-accent" font-size="12">import</text>
<line x1="395" y1="100" x2="460" y2="100" stroke="#64748b" stroke-width="2"/><text x="428" y="132" text-anchor="middle" class="svg-accent" font-size="12">export</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">Import: what the table accepts from a protocol. Export: what a protocol takes from the table.</text>
</svg><p class="cap">The routing table is the hub. Policy guards both directions.</p></div>
<p>A policy statement holds <b>terms</b>, evaluated top to bottom. The first term whose <code>from</code> conditions all match takes its <code>then</code> actions. <code>accept</code> and <code>reject</code> end the evaluation. If a term has only non-final actions such as <code>metric</code> or <code>tag</code>, evaluation continues to the next term or policy in the chain. If nothing matches, the <b>default policy</b> of that protocol decides.</p>
<pre class="code"><span class="c">! Two terms: tag and metric for partner routes</span>
set policy-options policy-statement PARTNERS term a from route-filter 192.0.2.0/24 exact
set policy-options policy-statement PARTNERS term a then metric 20
set policy-options policy-statement PARTNERS term a then tag 100
set policy-options policy-statement PARTNERS term a then accept
set policy-options policy-statement PARTNERS term b from route-filter 198.51.100.0/24 exact
set policy-options policy-statement PARTNERS term b then metric 20
set policy-options policy-statement PARTNERS term b then tag 666
set policy-options policy-statement PARTNERS term b then accept
set protocols ospf export PARTNERS</pre>

<h3>Match conditions you must know</h3>
<table class="cmp"><tr><th>Condition</th><th>Matches</th></tr>
<tr><td><code>route-filter P exact</code></td><td>only that prefix and length</td></tr>
<tr><td><code>route-filter P orlonger</code></td><td>that prefix and any more-specific</td></tr>
<tr><td><code>route-filter P longer</code></td><td>more-specifics only, not the prefix itself</td></tr>
<tr><td><code>route-filter P upto /n</code></td><td>lengths from the prefix up to /n</td></tr>
<tr><td><code>from protocol / tag / level</code></td><td>origin, route tag, IS-IS level</td></tr></table>

<h3>Defaults matter</h3>
<p>OSPF and IS-IS exports start from a default that exports <b>nothing</b> from other sources, and default import accepts everything the protocol learned. BGP by default accepts all received routes and advertises active BGP routes. This is why "I configured the static route but it is not in OSPF" is almost always a missing export policy.</p>

<h3>What a policy looks like at work</h3>
<p>After the PARTNERS policy on R4, router R1 has two external routes. The tag appears in the route, and the LSA keeps it in dotted form: 666 is 0.0.2.154.</p>
<pre class="out">lab@R1-CHENNAI&gt; show route protocol ospf
192.0.2.0/24       *[OSPF/150] 00:00:13, metric 20, <span class="hl">tag 100</span>
                    &gt;  to 10.4.12.2 via ge-0/0/0.0
                       to 10.4.13.2 via ge-0/0/1.0
198.51.100.0/24    *[OSPF/150] 00:00:13, metric 20, <span class="hl">tag 666</span>
                    &gt;  to 10.4.12.2 via ge-0/0/0.0
                       to 10.4.13.2 via ge-0/0/1.0

lab@R1-CHENNAI&gt; show ospf database external lsa-id 198.51.100.0 detail
Extern   198.51.100.0     10.255.4.4       0x80000001    14  0x22 0x98a3  36
  mask 255.255.255.0
  Topology default (ID 0)
    Type: 2, Metric: 20, Fwd addr: 0.0.0.0, Tag: <span class="hl">0.0.2.154</span></pre>
<p>Now R1 applies an import policy that rejects tag 666. The LSA stays in the database, since the database must be identical on every router, but the route leaves R1's table:</p>
<pre class="out">lab@R1-CHENNAI&gt; show route 198.51.100.0/24
inet.0: 15 destinations, 15 routes (15 active, 0 holddown, 0 hidden)</pre>

<div class="warn"><p><b>Common mistake.</b> Writing the import policy and then checking the database for the result. In OSPF and IS-IS, import policy never changes the link-state database. Check <code>show route</code> instead.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>accept</code> in a term with no <code>from</code> matches every route. A term meant for one prefix that lost its <code>from</code> line becomes a catch-all. Always read the <code>show configuration policy-options</code> output term by term.</p></div>

<div class="scn"><h4>The test network that escaped</h4><p>A lab static route 198.51.100.0/24 was exported along with real partner routes because the policy matched <code>from protocol static</code>. The security team noticed an unexpected external LSA. The fix was a tag on the test route and a second policy on edge routers that rejects that tag, plus replacing the broad match with exact route filters.</p><p><b>Lesson:</b> match as narrowly as the requirement says, and tag routes so that other routers can act on them.</p></div>

<div class="iv"><p class="q">"What is the difference between import and export policy?"</p><p>Import controls what the routing table accepts from a protocol. Export controls what a protocol advertises from the routing table. In link-state IGPs, import does not touch the database, because every router in the area must hold identical LSAs. Mention terms, accept and reject, and default policies.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Import means protocol to table; export means table to protocol.</li>
<li>Terms run top to bottom; accept or reject ends the evaluation.</li>
<li>Know exact, orlonger, longer, upto; a term without from matches everything.</li>
<li>OSPF and IS-IS export nothing from other sources by default.</li>
<li>Tags mark routes so other routers can act on them; OSPF shows them in dotted form.</li>
</ul></div>
`,hi:`
<p>Routing protocols tay karte hain ki routes kaise <i>seekhe aur calculate</i> hote hain. <b>Routing policy</b> tay karti hai ki kaunse routes <i>andar aur bahar aane dein</i> aur kin attributes ke saath. Har professional topic ise use karta hai: OSPF aur IS-IS export, BGP import aur export, route leaking, redistribution, load balancing tak. Policy language ek baar seekh li to baaki aasaan ho jaata hai.</p>

<h3>Analogy: passport desk</h3>
<p>Routes mulkon (protocols aur routing table) ke beech safar karte hain. Har border par ek officer checklist ke saath baitha hai. Officer passport check karta hai (from conditions), phir stamp lagata hai ya wapas bhej deta hai (then actions). Alag borders ki alag checklists hoti hain, aur jis musafir par koi rule match na ho use border ka default treatment milta hai.</p>

<h3>Policy ka structure</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Import aur export direction">
<rect x="30" y="60" width="150" height="60" rx="10" fill="#bae6fd"/><text x="105" y="88" text-anchor="middle" class="svg-ink" font-size="13">Protocol</text><text x="105" y="106" text-anchor="middle" class="svg-muted" font-size="11">OSPF, IS-IS, BGP</text>
<rect x="245" y="60" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">Routing table</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="11">inet.0</text>
<rect x="460" y="60" width="150" height="60" rx="10" fill="#ddd6fe"/><text x="535" y="88" text-anchor="middle" class="svg-ink" font-size="13">Protocol</text><text x="535" y="106" text-anchor="middle" class="svg-muted" font-size="11">doosra ya wahi</text>
<line x1="180" y1="80" x2="245" y2="80" stroke="#64748b" stroke-width="2"/><text x="212" y="72" text-anchor="middle" class="svg-accent" font-size="12">import</text>
<line x1="395" y1="100" x2="460" y2="100" stroke="#64748b" stroke-width="2"/><text x="428" y="132" text-anchor="middle" class="svg-accent" font-size="12">export</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">Import: table protocol se kya accept kare. Export: protocol table se kya le.</text>
</svg><p class="cap">Routing table hub hai. Policy dono directions ki chowki hai.</p></div>
<p>Policy statement mein <b>terms</b> hote hain, jo upar se neeche evaluate hote hain. Jis pehle term ki saari <code>from</code> conditions match karein woh apne <code>then</code> actions leta hai. <code>accept</code> aur <code>reject</code> evaluation khatam karte hain. Agar term mein sirf non-final actions hain jaise <code>metric</code> ya <code>tag</code>, to evaluation agle term ya chain ki agli policy par chalta hai. Kuch match na ho to us protocol ki <b>default policy</b> faisla karti hai.</p>
<pre class="code"><span class="c">! Do terms: partner routes ke liye tag aur metric</span>
set policy-options policy-statement PARTNERS term a from route-filter 192.0.2.0/24 exact
set policy-options policy-statement PARTNERS term a then metric 20
set policy-options policy-statement PARTNERS term a then tag 100
set policy-options policy-statement PARTNERS term a then accept
set policy-options policy-statement PARTNERS term b from route-filter 198.51.100.0/24 exact
set policy-options policy-statement PARTNERS term b then metric 20
set policy-options policy-statement PARTNERS term b then tag 666
set policy-options policy-statement PARTNERS term b then accept
set protocols ospf export PARTNERS</pre>

<h3>Jo match conditions aapko aani chahiye</h3>
<table class="cmp"><tr><th>Condition</th><th>Kya match karta hai</th></tr>
<tr><td><code>route-filter P exact</code></td><td>sirf wahi prefix aur length</td></tr>
<tr><td><code>route-filter P orlonger</code></td><td>woh prefix aur koi bhi more-specific</td></tr>
<tr><td><code>route-filter P longer</code></td><td>sirf more-specifics, prefix khud nahi</td></tr>
<tr><td><code>route-filter P upto /n</code></td><td>prefix se /n tak ki lengths</td></tr>
<tr><td><code>from protocol / tag / level</code></td><td>origin, route tag, IS-IS level</td></tr></table>

<h3>Defaults ahem hain</h3>
<p>OSPF aur IS-IS exports aise default se shuru hote hain jo doosre sources se <b>kuch export nahi</b> karta, aur default import protocol ne jo seekha sab accept karta hai. BGP default mein saare received routes accept karta hai aur active BGP routes advertise karta hai. Isliye "static route configure kiya par OSPF mein nahi hai" lagbhag hamesha missing export policy hota hai.</p>

<h3>Policy kaam par kaisi dikhti hai</h3>
<p>R4 par PARTNERS policy ke baad router R1 ke paas do external routes hain. Tag route mein dikhta hai, aur LSA use dotted form mein rakhta hai: 666 yaani 0.0.2.154.</p>
<pre class="out">lab@R1-CHENNAI&gt; show route protocol ospf
192.0.2.0/24       *[OSPF/150] 00:00:13, metric 20, <span class="hl">tag 100</span>
                    &gt;  to 10.4.12.2 via ge-0/0/0.0
                       to 10.4.13.2 via ge-0/0/1.0
198.51.100.0/24    *[OSPF/150] 00:00:13, metric 20, <span class="hl">tag 666</span>
                    &gt;  to 10.4.12.2 via ge-0/0/0.0
                       to 10.4.13.2 via ge-0/0/1.0

lab@R1-CHENNAI&gt; show ospf database external lsa-id 198.51.100.0 detail
Extern   198.51.100.0     10.255.4.4       0x80000001    14  0x22 0x98a3  36
  mask 255.255.255.0
  Topology default (ID 0)
    Type: 2, Metric: 20, Fwd addr: 0.0.0.0, Tag: <span class="hl">0.0.2.154</span></pre>
<p>Ab R1 import policy lagata hai jo tag 666 reject karti hai. LSA database mein rehti hai, kyunki database har router par identical hona chahiye, par route R1 ki table se chala jaata hai:</p>
<pre class="out">lab@R1-CHENNAI&gt; show route 198.51.100.0/24
inet.0: 15 destinations, 15 routes (15 active, 0 holddown, 0 hidden)</pre>

<div class="warn"><p><b>Common mistake.</b> Import policy likhkar result database mein dhoondhna. OSPF aur IS-IS mein import policy link-state database kabhi nahi badalti. Uski jagah <code>show route</code> dekho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Bina <code>from</code> ke term mein <code>accept</code> har route se match karta hai. Ek prefix ke liye bana term jiski <code>from</code> line chhoot gayi, catch-all ban jaata hai. <code>show configuration policy-options</code> output ko term-by-term padho.</p></div>

<div class="scn"><h4>Test network jo bahar nikal gaya</h4><p>Lab ka static route 198.51.100.0/24 asli partner routes ke saath export ho gaya kyunki policy <code>from protocol static</code> par match karti thi. Security team ne ek unexpected external LSA dekhi. Fix: test route par tag aur edge routers par doosri policy jo us tag ko reject kare, aur broad match ki jagah exact route filters.</p><p><b>Lesson:</b> requirement jitna kehti hai utna hi narrow match karo, aur routes ko tag karo taaki doosre routers unpar action le sakein.</p></div>

<div class="iv"><p class="q">"Import aur export policy mein kya difference hai?"</p><p>Import control karta hai ki routing table protocol se kya accept kare. Export control karta hai ki protocol routing table se kya advertise kare. Link-state IGPs mein import database ko nahi chhoota, kyunki area ke har router ke paas identical LSAs hone chahiye. Terms, accept aur reject, aur default policies ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Import yaani protocol se table; export yaani table se protocol.</li>
<li>Terms upar se neeche chalte hain; accept ya reject evaluation khatam karta hai.</li>
<li>exact, orlonger, longer, upto jaano; from ke bina term sab match karta hai.</li>
<li>OSPF aur IS-IS default mein doosre sources se kuch export nahi karte.</li>
<li>Tags routes ko mark karte hain taaki doosre routers action lein; OSPF unhe dotted form mein dikhata hai.</li>
</ul></div>
`}};export{e as default};