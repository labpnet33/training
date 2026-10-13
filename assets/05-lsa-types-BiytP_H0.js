var e={id:`lsa-types`,h:{en:`LSA types 1, 2, 3, 4, 5 and 7`,hi:`LSA types 1, 2, 3, 4, 5 aur 7`},body:{en:`
<p>A city library has different kinds of cards in its catalogue: a card for each building, a card for each hall inside a building, a card from other cities saying "we have these books", a card saying "the import office is here", and cards for books bought from abroad. The OSPF link-state database is that catalogue, and each card is a <b>Link-State Advertisement (LSA)</b> of a specific type. Reading the LSDB is the single most useful OSPF skill at CCNP level.</p>

<h3>The LSA header</h3>
<p>Every LSA starts with a 20-byte header. Three fields together identify an LSA uniquely: <b>LS type</b>, <b>Link State ID</b> and <b>Advertising Router</b>. The other key fields are <b>LS age</b> (seconds since origination; refreshed every 1800 seconds, flushed at 3600, MaxAge), <b>LS sequence number</b> (starts at 0x80000001, higher is newer) and a checksum. The meaning of the Link State ID changes by type, which the table below lists.</p>

<table class="cmp"><tr><th>Type</th><th>Name</th><th>Originated by</th><th>Link State ID</th><th>Flooding scope</th></tr>
<tr><td>1</td><td>Router</td><td>Every router, per area</td><td>Originator's RID</td><td>Its area</td></tr>
<tr><td>2</td><td>Network</td><td>DR of a transit segment</td><td>DR's interface IP</td><td>Its area</td></tr>
<tr><td>3</td><td>Summary (network)</td><td>ABR</td><td>Network address</td><td>Other areas, one per area</td></tr>
<tr><td>4</td><td>Summary (ASBR)</td><td>ABR</td><td>ASBR's RID</td><td>Other areas</td></tr>
<tr><td>5</td><td>AS external</td><td>ASBR</td><td>External network</td><td>Whole domain (not stub/NSSA)</td></tr>
<tr><td>7</td><td>NSSA external</td><td>ASBR inside an NSSA</td><td>External network</td><td>That NSSA only</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Where each LSA type is flooded">
<rect x="10" y="30" width="190" height="170" rx="12" fill="#bbf7d0"/><text x="105" y="50" text-anchor="middle" class="svg-ink" font-size="13">Area 10</text>
<rect x="225" y="30" width="190" height="170" rx="12" fill="#bae6fd"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Area 0</text>
<rect x="440" y="30" width="190" height="170" rx="12" fill="#fde68a"/><text x="535" y="50" text-anchor="middle" class="svg-ink" font-size="13">Area 20</text>
<rect x="170" y="100" width="80" height="34" rx="6" fill="#ddd6fe"/><text x="210" y="122" text-anchor="middle" class="svg-ink" font-size="12">ABR1</text>
<rect x="390" y="100" width="80" height="34" rx="6" fill="#ddd6fe"/><text x="430" y="122" text-anchor="middle" class="svg-ink" font-size="12">ABR2</text>
<rect x="540" y="150" width="80" height="34" rx="6" fill="#fed7aa"/><text x="580" y="172" text-anchor="middle" class="svg-ink" font-size="12">ASBR</text>
<text x="80" y="80" text-anchor="middle" class="svg-muted" font-size="12">T1, T2 stay here</text>
<text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">T1, T2 of area 0</text>
<text x="510" y="80" text-anchor="middle" class="svg-muted" font-size="12">T1, T2 stay here</text>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">T3 from ABRs</text>
<text x="80" y="160" text-anchor="middle" class="svg-accent" font-size="12">T3, T4, T5</text>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="12">T4 (ABR2 says ASBR)</text>
<text x="320" y="235" text-anchor="middle" class="svg-ink" font-size="12">T5 from the ASBR floods to every normal area unchanged</text>
</svg><p class="cap">Type 1 and 2 never leave their area. ABRs create type 3 and 4. Type 5 floods everywhere except stub-type areas.</p></div>

<h3>Type 1: router LSA</h3>
<p>Every router originates one type 1 LSA per area it belongs to, listing each OSPF interface as a link: <b>point-to-point</b> (to a neighbour RID), <b>transit network</b> (a segment with a DR, Link ID is the DR's IP), <b>stub network</b> (a subnet with no neighbour, such as a loopback or passive LAN), or <b>virtual link</b>. Flags in the LSA mark the router as an ABR (B bit) or ASBR (E bit). IOS prints "Area Border Router" or "AS Boundary Router" in the detail view.</p>

<h3>Type 2: network LSA</h3>
<p>Originated by the DR for each broadcast or NBMA segment that has at least one full neighbour. It lists the subnet mask and every attached router. It is the pseudonode that type 1 transit links point to. Point-to-point links create no type 2 LSA.</p>

<h3>Type 3: summary LSA</h3>
<p>An ABR takes the routes it has for one area and describes each prefix to its other areas in a separate type 3 LSA, with the ABR as advertising router and the ABR's cost to that prefix as metric. The ABR originates a <b>new</b> type 3 into each area; it does not forward the old one. Routers in the receiving area simply add their cost to the ABR. That is distance-vector behaviour between areas, and it is why OSPF insists on a backbone to stay loop-free.</p>

<h3>Type 4 and type 5</h3>
<p>An ASBR redistributes external routes (static, EIGRP, BGP) as type 5 LSAs, flooded unchanged across all normal areas with the ASBR as advertising router. A router in another area must know how to reach that ASBR. Inside the ASBR's own area, the ASBR's type 1 LSA with the E bit is enough. For other areas, the ABR originates a <b>type 4</b> LSA whose Link State ID is the ASBR's RID and whose metric is the ABR's cost to the ASBR.</p>

<h3>Type 7</h3>
<p>Stub areas block type 5. A <b>not-so-stubby area (NSSA)</b> still blocks type 5 from outside but allows a local ASBR, whose external routes are carried as type 7 inside the NSSA. The NSSA ABR translates type 7 into type 5 for the rest of the domain. Routing table codes are <code>O N1</code> and <code>O N2</code>. Stub, totally stubby and NSSA configuration are covered in the ENARSI track; for ENCOR you must recognise type 7 and know where it lives.</p>

<pre class="out">CORE# show ip ospf database

            OSPF Router with ID (3.3.3.3) (Process ID 1)

                <span class="hl">Router Link States (Area 0)</span>
Link ID         ADV Router      Age         Seq#       Checksum Link count
2.2.2.2         2.2.2.2         310         0x80000004 0x00A1B2 2
3.3.3.3         3.3.3.3         305         0x80000006 0x0071C4 3
4.4.4.4         4.4.4.4         298         0x80000004 0x00D3E1 2

                <span class="hl">Net Link States (Area 0)</span>
Link ID         ADV Router      Age         Seq#       Checksum
10.0.23.2       3.3.3.3         305         0x80000001 0x004E27
10.0.34.1       3.3.3.3         298         0x80000001 0x0061A8

                <span class="hl">Summary Net Link States (Area 0)</span>
Link ID         ADV Router      Age         Seq#       Checksum
1.1.1.1         2.2.2.2         240         0x80000001 0x00C9D3
10.10.12.0      2.2.2.2         240         0x80000001 0x00B8A5
172.16.0.0      2.2.2.2         95          0x80000001 0x005A1C
5.5.5.5         4.4.4.4         236         0x80000001 0x00E1B7
10.20.45.0      4.4.4.4         236         0x80000001 0x0093C2
192.168.20.0    4.4.4.4         236         0x80000001 0x0027F0</pre>

<div class="eg"><p><b>Worked example: reading one line.</b> "192.168.20.0 4.4.4.4" under Summary Net Link States (Area 0) says: ABR2 (RID 4.4.4.4) tells area 0 that it can reach 192.168.20.0. CORE's cost to ABR2 is 1 and the type 3 metric is 2 (ABR2 to R5 plus the LAN), so CORE installs <code>O IA 192.168.20.0/24 [110/3]</code>. The two Net Link States entries have Link IDs 10.0.23.2 and 10.0.34.1, both advertised by 3.3.3.3: CORE came up first and is the DR on both broadcast backbone links, and the Link ID is the DR's interface address.</p></div>

<div class="warn"><p><b>Common mistake.</b> Reading the Link ID column as always being a router ID. It is a router ID for type 1 and 4, but an interface IP for type 2 and a network address for type 3, 5 and 7.</p></div>

<div class="exam"><p><b>Exam trap.</b> Type 4 is created by the ABR, not the ASBR, and does not exist in the ASBR's own area. Type 7 exists only inside an NSSA. And a type 3 LSA is regenerated by each ABR; it is never passed through unchanged like a type 5.</p></div>

<div class="scn"><h4>The external routes nobody could use</h4><p>After a redesign, routers in area 30 had O E2 routes in the LSDB (type 5 visible in <code>show ip ospf database external</code>) but none in the routing table. The engineer checked <code>show ip ospf database asbr-summary</code> in area 30 and found no type 4 for the ASBR, because the ASBR sat behind a router that had been wrongly configured with no interface in area 0 and so was not acting as an ABR. Without a path to the ASBR, the type 5 LSAs were unusable. Fixing the backbone connection restored the type 4 and the routes.</p><p><b>Lesson:</b> a type 5 is only usable if the router can reach its advertising ASBR, via type 1 in the same area or type 4 elsewhere.</p></div>

<div class="iv"><p class="q">"Name the OSPF LSA types and who generates them."</p><p>Strong answer: type 1 router, every router, area scope; type 2 network, the DR, area scope; type 3 summary, the ABR, describing prefixes from other areas; type 4 ASBR summary, the ABR, giving the path to an ASBR in another area; type 5 external, the ASBR, domain-wide except stub areas; type 7 NSSA external, an ASBR inside an NSSA, translated to type 5 by the ABR. Mention the Link State ID meaning for each.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An LSA is identified by LS type, Link State ID and Advertising Router; higher sequence number is newer.</li>
<li>Type 1 and 2 describe topology and never leave their area.</li>
<li>ABRs create type 3 (prefixes) and type 4 (path to an ASBR) into other areas.</li>
<li>ASBRs create type 5 (domain-wide) or type 7 (inside an NSSA).</li>
<li><code>show ip ospf database</code> groups LSAs by type and area; learn to read each column.</li>
</ul></div>
`,hi:`
<p>Shehar ki library ke catalogue mein alag alag tarah ke cards hote hain: har building ka ek card, building ke andar har hall ka card, doosre shehron ka card jo kehta hai "hamare paas yeh kitaabein hain", ek card jo kehta hai "import office yahan hai", aur videsh se khareedi kitaabon ke cards. OSPF link-state database wahi catalogue hai, aur har card ek specific type ka <b>Link-State Advertisement (LSA)</b> hai. LSDB padhna CCNP level par sabse useful OSPF skill hai.</p>

<h3>LSA header</h3>
<p>Har LSA 20-byte header se shuru hota hai. Teen fields milkar LSA ko uniquely identify karte hain: <b>LS type</b>, <b>Link State ID</b> aur <b>Advertising Router</b>. Baaki key fields hain <b>LS age</b> (origination se seconds; har 1800 second mein refresh, 3600 par flush, MaxAge), <b>LS sequence number</b> (0x80000001 se shuru, bada matlab naya) aur checksum. Link State ID ka matlab type ke hisaab se badalta hai, jo neeche ki table batati hai.</p>

<table class="cmp"><tr><th>Type</th><th>Naam</th><th>Kaun banata hai</th><th>Link State ID</th><th>Flooding scope</th></tr>
<tr><td>1</td><td>Router</td><td>Har router, har area ke liye</td><td>Originator ka RID</td><td>Apna area</td></tr>
<tr><td>2</td><td>Network</td><td>Transit segment ka DR</td><td>DR ka interface IP</td><td>Apna area</td></tr>
<tr><td>3</td><td>Summary (network)</td><td>ABR</td><td>Network address</td><td>Doosre areas, har area mein ek</td></tr>
<tr><td>4</td><td>Summary (ASBR)</td><td>ABR</td><td>ASBR ka RID</td><td>Doosre areas</td></tr>
<tr><td>5</td><td>AS external</td><td>ASBR</td><td>External network</td><td>Poora domain (stub/NSSA nahi)</td></tr>
<tr><td>7</td><td>NSSA external</td><td>NSSA ke andar ASBR</td><td>External network</td><td>Sirf woh NSSA</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Har LSA type kahan flood hota hai">
<rect x="10" y="30" width="190" height="170" rx="12" fill="#bbf7d0"/><text x="105" y="50" text-anchor="middle" class="svg-ink" font-size="13">Area 10</text>
<rect x="225" y="30" width="190" height="170" rx="12" fill="#bae6fd"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Area 0</text>
<rect x="440" y="30" width="190" height="170" rx="12" fill="#fde68a"/><text x="535" y="50" text-anchor="middle" class="svg-ink" font-size="13">Area 20</text>
<rect x="170" y="100" width="80" height="34" rx="6" fill="#ddd6fe"/><text x="210" y="122" text-anchor="middle" class="svg-ink" font-size="12">ABR1</text>
<rect x="390" y="100" width="80" height="34" rx="6" fill="#ddd6fe"/><text x="430" y="122" text-anchor="middle" class="svg-ink" font-size="12">ABR2</text>
<rect x="540" y="150" width="80" height="34" rx="6" fill="#fed7aa"/><text x="580" y="172" text-anchor="middle" class="svg-ink" font-size="12">ASBR</text>
<text x="80" y="80" text-anchor="middle" class="svg-muted" font-size="12">T1, T2 yahin rehte</text>
<text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">Area 0 ke T1, T2</text>
<text x="510" y="80" text-anchor="middle" class="svg-muted" font-size="12">T1, T2 yahin rehte</text>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">ABRs se T3</text>
<text x="80" y="160" text-anchor="middle" class="svg-accent" font-size="12">T3, T4, T5</text>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="12">T4 (ABR2 batata ASBR)</text>
<text x="320" y="235" text-anchor="middle" class="svg-ink" font-size="12">ASBR ka T5 har normal area mein bina badle flood hota hai</text>
</svg><p class="cap">Type 1 aur 2 kabhi apna area nahi chhodte. ABRs type 3 aur 4 banate hain. Type 5 stub-type areas chhod kar har jagah flood hota hai.</p></div>

<h3>Type 1: router LSA</h3>
<p>Har router har us area ke liye ek type 1 LSA banata hai jismein woh hai, har OSPF interface ko link ki tarah list karta hai: <b>point-to-point</b> (neighbour RID tak), <b>transit network</b> (DR wala segment, Link ID DR ka IP hai), <b>stub network</b> (bina neighbour wala subnet, jaise loopback ya passive LAN), ya <b>virtual link</b>. LSA ke flags router ko ABR (B bit) ya ASBR (E bit) mark karte hain. IOS detail view mein "Area Border Router" ya "AS Boundary Router" print karta hai.</p>

<h3>Type 2: network LSA</h3>
<p>DR har us broadcast ya NBMA segment ke liye banata hai jismein kam se kam ek full neighbour ho. Ismein subnet mask aur har attached router list hota hai. Yahi woh pseudonode hai jiski taraf type 1 transit links point karte hain. Point-to-point links koi type 2 LSA nahi banate.</p>

<h3>Type 3: summary LSA</h3>
<p>ABR ek area ke apne routes leta hai aur har prefix ko apne doosre areas mein alag type 3 LSA mein describe karta hai, ABR advertising router hota hai aur ABR ki us prefix tak ki cost metric hoti hai. ABR har area mein <b>naya</b> type 3 banata hai; purana forward nahi karta. Receiving area ke routers bas ABR tak ki apni cost jod dete hain. Yeh areas ke beech distance-vector behaviour hai, aur isiliye OSPF loop-free rehne ke liye backbone par zor deta hai.</p>

<h3>Type 4 aur type 5</h3>
<p>ASBR external routes (static, EIGRP, BGP) ko type 5 LSAs ke roop mein redistribute karta hai, jo saare normal areas mein bina badle flood hote hain, ASBR advertising router hota hai. Doosre area ke router ko pata hona chahiye ki us ASBR tak kaise pahunche. ASBR ke apne area ke andar, E bit wala ASBR ka type 1 LSA kaafi hai. Doosre areas ke liye ABR ek <b>type 4</b> LSA banata hai jiska Link State ID ASBR ka RID hai aur metric ABR ki ASBR tak ki cost.</p>

<h3>Type 7</h3>
<p>Stub areas type 5 block karte hain. <b>Not-so-stubby area (NSSA)</b> bahar se aane wale type 5 ko block karta hai par ek local ASBR allow karta hai, jiske external routes NSSA ke andar type 7 ke roop mein chalte hain. NSSA ABR baaki domain ke liye type 7 ko type 5 mein translate karta hai. Routing table codes <code>O N1</code> aur <code>O N2</code> hain. Stub, totally stubby aur NSSA configuration ENARSI track mein cover hota hai; ENCOR ke liye aapko type 7 pehchanna aur yeh jaanna hai ki woh kahan rehta hai.</p>

<pre class="out">CORE# show ip ospf database

            OSPF Router with ID (3.3.3.3) (Process ID 1)

                <span class="hl">Router Link States (Area 0)</span>
Link ID         ADV Router      Age         Seq#       Checksum Link count
2.2.2.2         2.2.2.2         310         0x80000004 0x00A1B2 2
3.3.3.3         3.3.3.3         305         0x80000006 0x0071C4 3
4.4.4.4         4.4.4.4         298         0x80000004 0x00D3E1 2

                <span class="hl">Net Link States (Area 0)</span>
Link ID         ADV Router      Age         Seq#       Checksum
10.0.23.2       3.3.3.3         305         0x80000001 0x004E27
10.0.34.1       3.3.3.3         298         0x80000001 0x0061A8

                <span class="hl">Summary Net Link States (Area 0)</span>
Link ID         ADV Router      Age         Seq#       Checksum
1.1.1.1         2.2.2.2         240         0x80000001 0x00C9D3
10.10.12.0      2.2.2.2         240         0x80000001 0x00B8A5
172.16.0.0      2.2.2.2         95          0x80000001 0x005A1C
5.5.5.5         4.4.4.4         236         0x80000001 0x00E1B7
10.20.45.0      4.4.4.4         236         0x80000001 0x0093C2
192.168.20.0    4.4.4.4         236         0x80000001 0x0027F0</pre>

<div class="eg"><p><b>Worked example: ek line padhna.</b> Summary Net Link States (Area 0) ke neeche "192.168.20.0 4.4.4.4" kehta hai: ABR2 (RID 4.4.4.4) area 0 ko batata hai ki woh 192.168.20.0 tak pahunch sakta hai. CORE ki ABR2 tak ki cost 1 hai aur type 3 metric 2 hai (ABR2 se R5 plus LAN), isliye CORE <code>O IA 192.168.20.0/24 [110/3]</code> install karta hai. Do Net Link States entries ke Link IDs 10.0.23.2 aur 10.0.34.1 hain, dono 3.3.3.3 ne advertise kiye: CORE pehle up hua aur dono broadcast backbone links par DR hai, aur Link ID DR ka interface address hota hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Link ID column ko hamesha router ID samajhna. Type 1 aur 4 ke liye yeh router ID hai, lekin type 2 ke liye interface IP aur type 3, 5 aur 7 ke liye network address.</p></div>

<div class="exam"><p><b>Exam trap.</b> Type 4 ABR banata hai, ASBR nahi, aur yeh ASBR ke apne area mein exist nahi karta. Type 7 sirf NSSA ke andar hota hai. Aur type 3 LSA har ABR dobara banata hai; type 5 ki tarah bina badle pass nahi hota.</p></div>

<div class="scn"><h4>External routes jo koi use nahi kar paaya</h4><p>Ek redesign ke baad area 30 ke routers ke LSDB mein O E2 routes the (<code>show ip ospf database external</code> mein type 5 dikh raha tha) lekin routing table mein ek bhi nahi. Engineer ne area 30 mein <code>show ip ospf database asbr-summary</code> check kiya aur ASBR ke liye koi type 4 nahi mila, kyunki ASBR ek aise router ke peeche tha jiska galti se area 0 mein koi interface nahi tha aur isliye woh ABR ka kaam nahi kar raha tha. ASBR tak path ke bina type 5 LSAs bekaar the. Backbone connection fix karne se type 4 aur routes wapas aa gaye.</p><p><b>Seekh:</b> type 5 tabhi usable hai jab router apne advertising ASBR tak pahunch sake, same area mein type 1 se ya baaki jagah type 4 se.</p></div>

<div class="iv"><p class="q">"OSPF LSA types ke naam batao aur unhe kaun generate karta hai."</p><p>Strong answer: type 1 router, har router, area scope; type 2 network, DR, area scope; type 3 summary, ABR, doosre areas ke prefixes describe karta hai; type 4 ASBR summary, ABR, doosre area ke ASBR tak path deta hai; type 5 external, ASBR, stub areas chhod kar poore domain mein; type 7 NSSA external, NSSA ke andar ASBR, ABR ise type 5 mein translate karta hai. Har ek ke liye Link State ID ka matlab bhi batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LSA LS type, Link State ID aur Advertising Router se identify hota hai; bada sequence number naya hai.</li>
<li>Type 1 aur 2 topology describe karte hain aur kabhi apna area nahi chhodte.</li>
<li>ABRs doosre areas mein type 3 (prefixes) aur type 4 (ASBR tak path) banate hain.</li>
<li>ASBRs type 5 (domain-wide) ya type 7 (NSSA ke andar) banate hain.</li>
<li><code>show ip ospf database</code> LSAs ko type aur area ke hisaab se group karta hai; har column padhna seekho.</li>
</ul></div>
`}};export{e as default};