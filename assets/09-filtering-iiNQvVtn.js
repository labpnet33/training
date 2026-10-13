var e={id:`filtering`,h:{en:`Filtering OSPF routes: filter-list, distribute-list and prefix-lists`,hi:`OSPF routes filter karna: filter-list, distribute-list aur prefix-lists`},body:{en:`
<p>In a housing society, the security guard at the gate decides which visitors enter the whole society. Once a visitor is inside, each flat owner can still decide not to open their own door. OSPF filtering works at the same two levels. At the <b>gate</b> (the ABR) you can stop a prefix from being advertised into an area at all. At a <b>single flat</b> (one router) you can stop a prefix from entering that router's routing table, while its neighbours still know about it.</p>

<h3>The golden rule: you cannot filter LSAs inside an area</h3>
<p>Inside one area every router must have an identical LSDB, otherwise SPF results would disagree and loops would form. So OSPF has no way to block type 1 or type 2 LSAs between neighbours in the same area. Filtering is possible only where LSAs are <b>created</b>: at the ABR for type 3, at the ASBR for type 5/7. The only per-router tool, the inbound distribute-list, does not touch the LSDB at all; it only filters what goes from the LSDB into the routing table.</p>

<h3>Prefix-lists, the building block</h3>
<pre class="code">ip prefix-list NO-LAB seq 5 deny 172.16.3.0/24
ip prefix-list NO-LAB seq 10 permit 0.0.0.0/0 le 32</pre>
<p>A prefix-list matches a prefix and its length. <code>ge</code> and <code>le</code> set a range of lengths. Every prefix-list ends with an implicit deny, so a list that only denies must end with the permit-all line <code>0.0.0.0/0 le 32</code>.</p>

<h3>Tool 1: area filter-list (type 3 filtering on the ABR)</h3>
<pre class="code">ABR1(config)# router ospf 1
ABR1(config-router)# area 10 filter-list prefix NO-LAB out
<span class="c">! or, filtering what enters an area from all other areas:</span>
ABR2(config-router)# area 20 filter-list prefix PLANT-ONLY in</pre>
<ul>
<li><code>area 10 ... out</code>: filter type 3 LSAs that describe prefixes <b>from</b> area 10 as they are created into other areas.</li>
<li><code>area 20 ... in</code>: filter type 3 LSAs being created <b>into</b> area 20 from any other area.</li>
<li>It affects only type 3. It cannot filter type 1, 2, 4 or 5.</li>
<li>Because the LSA is never created, the prefix disappears from the LSDB and the routing table of every router in the target areas. This is clean and consistent.</li>
</ul>
<p>A related option is <code>area 10 range 172.16.3.0 255.255.255.0 not-advertise</code>, which suppresses the prefix at the ABR in all directions.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Where each OSPF filter acts">
<rect x="20" y="40" width="170" height="150" rx="12" fill="#bbf7d0"/><text x="105" y="62" text-anchor="middle" class="svg-ink" font-size="13">Area 10</text>
<rect x="230" y="40" width="180" height="150" rx="12" fill="#bae6fd"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="13">Area 0</text>
<rect x="450" y="40" width="170" height="150" rx="12" fill="#fde68a"/><text x="535" y="62" text-anchor="middle" class="svg-ink" font-size="13">Area 20</text>
<rect x="160" y="100" width="100" height="40" rx="8" fill="#ddd6fe"/><text x="210" y="118" text-anchor="middle" class="svg-ink" font-size="12">ABR1</text><text x="210" y="133" text-anchor="middle" class="svg-accent" font-size="12">filter-list</text>
<rect x="280" y="120" width="80" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="12">CORE</text><text x="320" y="153" text-anchor="middle" class="svg-accent" font-size="12">dist-list in</text>
<rect x="540" y="130" width="70" height="40" rx="8" fill="#fed7aa"/><text x="575" y="148" text-anchor="middle" class="svg-ink" font-size="12">ASBR</text><text x="575" y="163" text-anchor="middle" class="svg-accent" font-size="12">dist-list out</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">filter-list: stops T3 creation. dist-list in: RIB only. dist-list out: stops T5.</text>
</svg><p class="cap">Three tools, three different places, three different effects on the LSDB.</p></div>

<h3>Tool 2: distribute-list in (local RIB filtering)</h3>
<pre class="code">CORE(config)# router ospf 1
CORE(config-router)# distribute-list prefix NO-LAB in</pre>
<p>CORE still receives and floods every LSA, and its LSDB still contains 172.16.3.0/24, but the route is not installed in CORE's routing table. Neighbours are unaffected. You can also use <code>distribute-list route-map NAME in</code> or restrict it to an interface. Use it with care: if CORE is a transit router, other routers may still send traffic to CORE for that prefix, and CORE will drop it or send it along a default route. It is useful on edge routers that should not use a path, and in multi-protocol designs.</p>

<h3>Tool 3: distribute-list out (on the ASBR)</h3>
<p>In OSPF, <code>distribute-list out</code> works only on an ASBR, and only for routes being redistributed: it stops those external prefixes from becoming type 5/7 LSAs. It cannot filter internal routes or LSAs you receive. A route-map on the <code>redistribute</code> command does the same job more flexibly.</p>

<pre class="out">CORE# show ip ospf database summary 172.16.3.0

            OSPF Router with ID (3.3.3.3) (Process ID 1)

                Summary Net Link States (Area 0)
  LS age: 58
  Options: (No TOS-capability, DC, Upward)
  LS Type: Summary Links(Network)
  <span class="hl">Link State ID: 172.16.3.0 (summary Network Number)</span>
  Advertising Router: 2.2.2.2
  LS Seq Number: 80000002
  Network Mask: /24
        MTID: 0         Metric: 2

CORE# show ip route 172.16.3.0
<span class="hl">% Subnet not in table</span></pre>
<p>That combination, an LSA in the database but no route in the table, is the fingerprint of a <code>distribute-list in</code>. With a filter-list on ABR1 instead, the database query itself would return nothing.</p>

<div class="eg"><p><b>Worked example.</b> Before the /22 summary is applied, the security team wants the Pune lab LAN 172.16.3.0/24 unreachable from Chennai but still reachable from CORE. Option A: on ABR2, <code>area 20 filter-list prefix NO-LAB in</code>. ABR2 simply does not create a type 3 for 172.16.3.0/24 into area 20; R5 and the whole of area 20 lose the route, CORE keeps it. Option B: <code>distribute-list prefix NO-LAB in</code> on R5 only. R5 loses the route, but any other future router in area 20 would still have it. Option A is the right design; also remember that routing filters are not security controls, so pair them with an ACL.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting the final <code>permit 0.0.0.0/0 le 32</code> line. The implicit deny then removes every inter-area prefix from the area, not just the one you meant.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>distribute-list in</code> filters the routing table only; the LSA stays in the LSDB and is still flooded. <code>area filter-list</code> filters type 3 only and is configured on the ABR. <code>in</code> and <code>out</code> in a filter-list are relative to the <b>area named in the command</b>.</p></div>

<div class="scn"><h4>The route that existed and did not exist</h4><p>A NOC engineer saw that a branch router in area 0 had no route to a finance subnet, while the neighbour right next to it did. <code>show ip ospf database summary</code> on both showed the same LSA, so the engineer suspected a corrupt database and was about to clear the OSPF process. A senior checked <code>show run | section router ospf</code> first and found <code>distribute-list prefix BLOCK-FIN in</code> left over from an old test. Removing the line restored the route without any adjacency reset.</p><p><b>Lesson:</b> LSA present but route absent means a local RIB filter; check the configuration before clearing anything.</p></div>

<div class="iv"><p class="q">"How can you filter routes in OSPF, and why can't you filter LSAs inside an area?"</p><p>Strong answer: every router in an area must share an identical LSDB for SPF to be consistent, so filtering happens only where LSAs are generated. On the ABR, <code>area X filter-list prefix NAME in|out</code> or <code>area range not-advertise</code> stop type 3 LSAs. On the ASBR, <code>distribute-list out</code> or a route-map on <code>redistribute</code> stops external routes. Per router, <code>distribute-list in</code> keeps a route out of the RIB but leaves the LSDB unchanged, which can black-hole transit traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>No filtering of type 1/2 LSAs inside an area; LSDBs must match.</li>
<li><code>area X filter-list prefix NAME in|out</code> on the ABR filters type 3 LSAs, relative to area X.</li>
<li><code>distribute-list in</code> filters only the local routing table; the LSA remains.</li>
<li><code>distribute-list out</code> works only for redistributed routes on the ASBR.</li>
<li>Prefix-lists end with an implicit deny; add <code>permit 0.0.0.0/0 le 32</code>.</li>
</ul></div>
`,hi:`
<p>Housing society mein gate ka security guard tay karta hai ki kaunse visitors poori society mein aayenge. Visitor andar aane ke baad bhi har flat owner apna darwaza na kholne ka faisla kar sakta hai. OSPF filtering bhi inhi do levels par kaam karti hai. <b>Gate</b> (ABR) par aap kisi prefix ko area mein advertise hone se hi rok sakte ho. <b>Ek flat</b> (ek router) par aap prefix ko us router ki routing table mein jaane se rok sakte ho, jabki uske neighbours ko uske baare mein pata rehta hai.</p>

<h3>Golden rule: area ke andar LSAs filter nahi kar sakte</h3>
<p>Ek area ke andar har router ka LSDB identical hona chahiye, warna SPF results alag honge aur loops banenge. Isliye OSPF mein same area ke neighbours ke beech type 1 ya type 2 LSAs block karne ka koi tarika nahi hai. Filtering sirf wahan possible hai jahan LSAs <b>bante</b> hain: type 3 ke liye ABR par, type 5/7 ke liye ASBR par. Ek hi per-router tool, inbound distribute-list, LSDB ko chhoota hi nahi; yeh sirf filter karta hai ki LSDB se routing table mein kya jaaye.</p>

<h3>Prefix-lists, building block</h3>
<pre class="code">ip prefix-list NO-LAB seq 5 deny 172.16.3.0/24
ip prefix-list NO-LAB seq 10 permit 0.0.0.0/0 le 32</pre>
<p>Prefix-list prefix aur uski length match karti hai. <code>ge</code> aur <code>le</code> lengths ki range set karte hain. Har prefix-list implicit deny ke saath khatam hoti hai, isliye jo list sirf deny karti hai uske end mein permit-all line <code>0.0.0.0/0 le 32</code> honi chahiye.</p>

<h3>Tool 1: area filter-list (ABR par type 3 filtering)</h3>
<pre class="code">ABR1(config)# router ospf 1
ABR1(config-router)# area 10 filter-list prefix NO-LAB out
<span class="c">! ya, baaki saare areas se area mein aane wala filter karna:</span>
ABR2(config-router)# area 20 filter-list prefix PLANT-ONLY in</pre>
<ul>
<li><code>area 10 ... out</code>: area 10 <b>se</b> aane wale prefixes describe karne wale type 3 LSAs ko doosre areas mein bante waqt filter karo.</li>
<li><code>area 20 ... in</code>: kisi bhi doosre area se area 20 <b>mein</b> ban rahe type 3 LSAs filter karo.</li>
<li>Yeh sirf type 3 par asar karta hai. Type 1, 2, 4 ya 5 filter nahi kar sakta.</li>
<li>Kyunki LSA kabhi banta hi nahi, prefix target areas ke har router ke LSDB aur routing table se gayab ho jaata hai. Yeh clean aur consistent hai.</li>
</ul>
<p>Ek related option hai <code>area 10 range 172.16.3.0 255.255.255.0 not-advertise</code>, jo ABR par prefix ko saari directions mein suppress karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Har OSPF filter kahan kaam karta hai">
<rect x="20" y="40" width="170" height="150" rx="12" fill="#bbf7d0"/><text x="105" y="62" text-anchor="middle" class="svg-ink" font-size="13">Area 10</text>
<rect x="230" y="40" width="180" height="150" rx="12" fill="#bae6fd"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="13">Area 0</text>
<rect x="450" y="40" width="170" height="150" rx="12" fill="#fde68a"/><text x="535" y="62" text-anchor="middle" class="svg-ink" font-size="13">Area 20</text>
<rect x="160" y="100" width="100" height="40" rx="8" fill="#ddd6fe"/><text x="210" y="118" text-anchor="middle" class="svg-ink" font-size="12">ABR1</text><text x="210" y="133" text-anchor="middle" class="svg-accent" font-size="12">filter-list</text>
<rect x="280" y="120" width="80" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="12">CORE</text><text x="320" y="153" text-anchor="middle" class="svg-accent" font-size="12">dist-list in</text>
<rect x="540" y="130" width="70" height="40" rx="8" fill="#fed7aa"/><text x="575" y="148" text-anchor="middle" class="svg-ink" font-size="12">ASBR</text><text x="575" y="163" text-anchor="middle" class="svg-accent" font-size="12">dist-list out</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">filter-list: T3 banna rokta. dist-list in: sirf RIB. dist-list out: T5 rokta.</text>
</svg><p class="cap">Teen tools, teen alag jagah, LSDB par teen alag asar.</p></div>

<h3>Tool 2: distribute-list in (local RIB filtering)</h3>
<pre class="code">CORE(config)# router ospf 1
CORE(config-router)# distribute-list prefix NO-LAB in</pre>
<p>CORE har LSA receive aur flood karta rehta hai, aur uske LSDB mein 172.16.3.0/24 rehta hai, lekin route CORE ki routing table mein install nahi hota. Neighbours par koi asar nahi. Aap <code>distribute-list route-map NAME in</code> bhi use kar sakte ho ya ise ek interface tak seemit kar sakte ho. Dhyan se use karo: agar CORE transit router hai, to doosre routers us prefix ke liye traffic CORE ko bhejte rahenge, aur CORE use drop karega ya default route par bhej dega. Yeh un edge routers par useful hai jinhe koi path use nahi karna, aur multi-protocol designs mein.</p>

<h3>Tool 3: distribute-list out (ASBR par)</h3>
<p>OSPF mein <code>distribute-list out</code> sirf ASBR par kaam karta hai, aur sirf redistribute ho rahe routes ke liye: yeh un external prefixes ko type 5/7 LSAs banne se rokta hai. Yeh internal routes ya receive kiye LSAs filter nahi kar sakta. <code>redistribute</code> command par route-map yahi kaam zyada flexibly karta hai.</p>

<pre class="out">CORE# show ip ospf database summary 172.16.3.0

            OSPF Router with ID (3.3.3.3) (Process ID 1)

                Summary Net Link States (Area 0)
  LS age: 58
  Options: (No TOS-capability, DC, Upward)
  LS Type: Summary Links(Network)
  <span class="hl">Link State ID: 172.16.3.0 (summary Network Number)</span>
  Advertising Router: 2.2.2.2
  LS Seq Number: 80000002
  Network Mask: /24
        MTID: 0         Metric: 2

CORE# show ip route 172.16.3.0
<span class="hl">% Subnet not in table</span></pre>
<p>Yeh combination, database mein LSA par table mein route nahi, <code>distribute-list in</code> ka fingerprint hai. Agar iski jagah ABR1 par filter-list hoti, to database query khud kuch return nahi karti.</p>

<div class="eg"><p><b>Worked example.</b> /22 summary lagne se pehle, security team chahti hai ki Pune lab LAN 172.16.3.0/24 Chennai se unreachable ho par CORE se reachable rahe. Option A: ABR2 par <code>area 20 filter-list prefix NO-LAB in</code>. ABR2 area 20 mein 172.16.3.0/24 ka type 3 banata hi nahi; R5 aur poora area 20 route kho dete hain, CORE ke paas rehta hai. Option B: sirf R5 par <code>distribute-list prefix NO-LAB in</code>. R5 route kho deta hai, lekin area 20 ke kisi bhi future router ke paas woh rahega. Option A sahi design hai; yeh bhi yaad rakho ki routing filters security controls nahi hain, isliye unke saath ACL lagao.</p></div>

<div class="warn"><p><b>Common galti.</b> Aakhri <code>permit 0.0.0.0/0 le 32</code> line bhool jaana. Tab implicit deny area se har inter-area prefix hata deta hai, sirf woh nahi jo aap chahte the.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>distribute-list in</code> sirf routing table filter karta hai; LSA LSDB mein rehta hai aur flood hota rehta hai. <code>area filter-list</code> sirf type 3 filter karta hai aur ABR par configure hota hai. Filter-list mein <code>in</code> aur <code>out</code> <b>command mein diye area</b> ke relative hain.</p></div>

<div class="scn"><h4>Route jo tha bhi aur nahi bhi</h4><p>Ek NOC engineer ne dekha ki area 0 ke ek branch router par finance subnet ka route nahi tha, jabki bilkul bagal wale neighbour par tha. Dono par <code>show ip ospf database summary</code> same LSA dikha raha tha, isliye engineer ko corrupt database ka shak hua aur woh OSPF process clear karne wala tha. Ek senior ne pehle <code>show run | section router ospf</code> check kiya aur ek purane test se bachi <code>distribute-list prefix BLOCK-FIN in</code> paayi. Line hatane se bina kisi adjacency reset ke route wapas aa gaya.</p><p><b>Seekh:</b> LSA hai par route nahi matlab local RIB filter; kuch bhi clear karne se pehle configuration check karo.</p></div>

<div class="iv"><p class="q">"OSPF mein routes kaise filter kar sakte ho, aur area ke andar LSAs filter kyun nahi kar sakte?"</p><p>Strong answer: SPF consistent rehne ke liye area ke har router ka LSDB identical hona chahiye, isliye filtering sirf wahan hoti hai jahan LSAs generate hote hain. ABR par <code>area X filter-list prefix NAME in|out</code> ya <code>area range not-advertise</code> type 3 LSAs rokte hain. ASBR par <code>distribute-list out</code> ya <code>redistribute</code> par route-map external routes rokta hai. Per router, <code>distribute-list in</code> route ko RIB se bahar rakhta hai par LSDB nahi badalta, jo transit traffic black-hole kar sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Area ke andar type 1/2 LSAs ki filtering nahi; LSDBs match hone chahiye.</li>
<li>ABR par <code>area X filter-list prefix NAME in|out</code> type 3 LSAs filter karta hai, area X ke relative.</li>
<li><code>distribute-list in</code> sirf local routing table filter karta hai; LSA rehta hai.</li>
<li><code>distribute-list out</code> sirf ASBR par redistributed routes ke liye kaam karta hai.</li>
<li>Prefix-lists implicit deny ke saath khatam hoti hain; <code>permit 0.0.0.0/0 le 32</code> jodo.</li>
</ul></div>
`}};export{e as default};