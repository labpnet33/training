var e={id:`lsa-area-types`,h:{en:`LSA types, router types and what each area type blocks`,hi:`LSA types, router types aur har area type kya rokta hai`},body:{en:`
<p>Think of the OSPF link-state database (LSDB) as a library. Every router keeps a copy of the books for each area it belongs to, and every book is an <b>LSA</b> (link-state advertisement). Area types do not change how the books are written. They only change which shelves the ABR is allowed to fill. Before you can design or troubleshoot special areas, you must know every shelf by heart.</p>

<h3>Router types (a refresher from ENCOR)</h3>
<dl class="terms">
<dt>Internal router</dt><dd>All OSPF interfaces are in one area. BR in the branch labs is an internal router of area 51, 52, 30 or 40.</dd>
<dt>Backbone router</dt><dd>At least one interface in area 0. CORE and the ABR are both backbone routers.</dd>
<dt>ABR (area border router)</dt><dd>Interfaces in area 0 and at least one other area. It keeps one LSDB per area, runs SPF per area and creates type-3 and type-4 LSAs. <code>show ip ospf</code> prints "It is an area border router".</dd>
<dt>ASBR (autonomous system boundary router)</dt><dd>Any router that redistributes routes into OSPF (or originates a default with <code>default-information originate</code>). CORE is the ASBR in the branch labs. <code>show ip ospf</code> prints "It is an autonomous system boundary router".</dd>
</dl>
<p>One router can hold several roles. The NSSA ABR that translates type-7 LSAs, for example, is an ABR <b>and</b> an ASBR, because it originates type-5 LSAs itself.</p>

<h3>The LSA types you must know</h3>
<table class="cmp"><tr><th>Type</th><th>Name</th><th>Created by</th><th>Flooding scope</th><th>Route code</th></tr>
<tr><td>1</td><td>Router LSA</td><td>Every router</td><td>Its own area</td><td>O</td></tr>
<tr><td>2</td><td>Network LSA</td><td>The DR of a multi-access segment</td><td>Its own area</td><td>O</td></tr>
<tr><td>3</td><td>Summary (network) LSA</td><td>ABR</td><td>Into one area</td><td>O IA</td></tr>
<tr><td>4</td><td>ASBR summary LSA</td><td>ABR</td><td>Into one area</td><td>none (it locates the ASBR)</td></tr>
<tr><td>5</td><td>AS external LSA</td><td>ASBR</td><td>Whole domain except stub and NSSA areas</td><td>O E1 / O E2</td></tr>
<tr><td>7</td><td>NSSA external LSA</td><td>ASBR inside an NSSA</td><td>Only that NSSA</td><td>O N1 / O N2</td></tr>
</table>
<p>Type-4 deserves a closer look. A type-5 LSA says "network X is reachable through ASBR 3.3.3.3". Routers inside area 0 can find 3.3.3.3 in its type-1 router LSA. Routers in area 51 cannot, because type-1 LSAs never leave their area. So the ABR creates a <b>type-4</b> that says "ASBR 3.3.3.3 is reachable through me at cost N". Without type-4, the branch would hold a type-5 LSA it cannot use. That is also why a stub area blocks both together: no type-5 means no need for type-4. Types 9, 10 and 11 are opaque LSAs used by features such as MPLS traffic engineering and graceful restart; they do not change area design.</p>

<h3>What each area type lets in</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Which LSAs each area type receives">
<rect x="10" y="30" width="150" height="200" rx="10" fill="#bae6fd"/><text x="85" y="55" text-anchor="middle" class="svg-ink" font-size="13">Area 0 LSDB</text>
<text x="85" y="95" text-anchor="middle" class="svg-ink" font-size="12">Type 3 summaries</text>
<text x="85" y="135" text-anchor="middle" class="svg-ink" font-size="12">Type 4 ASBR</text>
<text x="85" y="175" text-anchor="middle" class="svg-ink" font-size="12">Type 5 externals</text>
<rect x="175" y="30" width="70" height="200" rx="10" fill="#ddd6fe"/><text x="210" y="125" text-anchor="middle" class="svg-ink" font-size="13">ABR</text><text x="210" y="143" text-anchor="middle" class="svg-muted" font-size="12">gate</text>
<rect x="265" y="30" width="365" height="42" rx="8" fill="#bbf7d0"/><text x="447" y="56" text-anchor="middle" class="svg-ink" font-size="12">Stub: T3 in, T4/T5 out, O*IA default</text>
<rect x="265" y="82" width="365" height="42" rx="8" fill="#bbf7d0"/><text x="447" y="108" text-anchor="middle" class="svg-ink" font-size="12">Totally stubby: only the T3 default</text>
<rect x="265" y="134" width="365" height="42" rx="8" fill="#fde68a"/><text x="447" y="160" text-anchor="middle" class="svg-ink" font-size="12">NSSA: T3 in, T4/T5 out, local T7 allowed</text>
<rect x="265" y="186" width="365" height="42" rx="8" fill="#fde68a"/><text x="447" y="212" text-anchor="middle" class="svg-ink" font-size="12">Totally NSSA: T3 default + local T7</text>
<line x1="245" y1="80" x2="265" y2="51" stroke="#64748b" stroke-width="1.5"/><line x1="245" y1="110" x2="265" y2="103" stroke="#64748b" stroke-width="1.5"/>
<line x1="245" y1="150" x2="265" y2="155" stroke="#64748b" stroke-width="1.5"/><line x1="245" y1="180" x2="265" y2="207" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">The ABR is the only place where filtering by area type happens. Types 1 and 2 always stay inside their own area.</p></div>

<table class="cmp"><tr><th>Area type</th><th>T3</th><th>T4 / T5</th><th>T7</th><th>Default route</th><th>ASBR inside</th><th>Transit for VL</th></tr>
<tr><td>Backbone (0)</td><td>yes</td><td>yes</td><td>no</td><td>none automatic</td><td>yes</td><td>not applicable</td></tr>
<tr><td>Normal</td><td>yes</td><td>yes</td><td>no</td><td>none automatic</td><td>yes</td><td>yes</td></tr>
<tr><td>Stub</td><td>yes</td><td>no</td><td>no</td><td>O*IA, automatic</td><td>no</td><td>no</td></tr>
<tr><td>Totally stubby</td><td>default only</td><td>no</td><td>no</td><td>O*IA, automatic</td><td>no</td><td>no</td></tr>
<tr><td>NSSA</td><td>yes</td><td>no</td><td>yes</td><td>O*N2, only if configured</td><td>yes</td><td>no</td></tr>
<tr><td>Totally NSSA</td><td>default only</td><td>no</td><td>yes</td><td>O*IA, automatic</td><td>yes</td><td>no</td></tr>
</table>

<h3>Reading the database</h3>
<p>Here is BR in area 51 before the stub lab. Every shelf is full: router and network LSAs, summaries, a type-4 for CORE and two type-5 externals.</p>
<pre class="out">BR#show ip ospf database

            OSPF Router with ID (1.1.1.1) (Process ID 1)

                Router Link States (Area 51)
Link ID         ADV Router      Age         Seq#       Checksum Link count
1.1.1.1         1.1.1.1         112         0x80000004 0x00A1B2 3
2.2.2.2         2.2.2.2         110         0x80000003 0x0033C4 1

                Net Link States (Area 51)
Link ID         ADV Router      Age         Seq#       Checksum
10.51.12.2      2.2.2.2         110         0x80000001 0x00F1A3

                Summary Net Link States (Area 51)
Link ID         ADV Router      Age         Seq#       Checksum
2.2.2.2         2.2.2.2         160         0x80000001 0x00D2E6
3.3.3.3         2.2.2.2         150         0x80000001 0x00B4FF
10.0.23.0       2.2.2.2         160         0x80000001 0x0015A0

<span class="hl">                Summary ASB Link States (Area 51)</span>
Link ID         ADV Router      Age         Seq#       Checksum
3.3.3.3         2.2.2.2         150         0x80000001 0x009C12

<span class="hl">                Type-5 AS External Link States</span>
Link ID         ADV Router      Age         Seq#       Checksum Tag
0.0.0.0         3.3.3.3         151         0x80000001 0x00C2A8 1
203.0.113.0     3.3.3.3         151         0x80000001 0x0063B7 0</pre>
<p>Note that type-5 LSAs show no area in the heading, because their scope is the whole domain. The advertising router of a type-3 or type-4 is always the ABR, while the advertising router of a type-5 is the ASBR (or the translating NSSA ABR). For a quick count per type, use <code>show ip ospf database database-summary</code>.</p>

<div class="eg"><p><b>Worked example.</b> Count BR's LSAs above: 2 router + 1 network + 3 summary + 1 ASBR summary + 2 external = 9. After the stub lab, the type-4 and both type-5 LSAs vanish and one new type-3 (0.0.0.0) appears: 2 + 1 + 4 = 7. After the totally stubby lab, only the type-3 default is left among the summaries: 2 + 1 + 1 = 4.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Calling type-3 a "summarised route": it is simply a summary of another area's prefix, one LSA per prefix unless you configure <code>area range</code>. Also, expecting type-7 LSAs to leave the NSSA: they never do. The ABR creates a new type-5 instead.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which LSA types are blocked from entering a stub area?" The answer is types 4 and 5, not just type 5. For a totally stubby area it is types 3 (except the default), 4 and 5.</p></div>

<div class="scn"><h4>External routes in the database, missing from the table</h4><p>A new area 20 router showed a type-5 LSA for 198.51.100.0/24 in <code>show ip ospf database external</code>, but no route. The detail output had "Forward Address: 10.9.9.1". The engineer found that the ASBR's link 10.9.9.0/24 was not advertised into OSPF, so no router could reach the forwarding address, and OSPF refuses to install an external route whose forwarding address is unreachable. Advertising 10.9.9.0/24 fixed it.</p><p><b>Lesson:</b> an LSA in the database is not a route. Check the ASBR path (type-4) or the forwarding address before blaming filtering.</p></div>

<div class="iv"><p class="q">"Why does OSPF need a type-4 LSA?"</p><p>Strong answer: type-5 LSAs point at the ASBR by router ID, but type-1 LSAs that describe the ASBR stay inside the ASBR's area. The ABR therefore originates a type-4 into each other area saying how far the ASBR is through the ABR. Mention that type-4 is removed together with type-5 in stub areas, and that when an NSSA ABR translates type-7 to type-5 it becomes the ASBR itself.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Router roles: internal, backbone, ABR and ASBR; one router can be several.</li>
<li>Types 1 and 2 stay in the area; 3 and 4 are ABR-made per area; 5 floods the domain; 7 lives only in an NSSA.</li>
<li>Stub blocks 4 and 5; totally stubby also blocks 3 except the default; NSSA variants add type 7.</li>
<li>Only normal areas can be transit areas for virtual links; stub and NSSA areas cannot hold one.</li>
<li>Always check the advertising router and the heading of each database section.</li>
</ul></div>
`,hi:`
<p>OSPF link-state database (LSDB) ko ek library samjho. Har router apne har area ki books ki copy rakhta hai, aur har book ek <b>LSA</b> (link-state advertisement) hai. Area types books likhne ka tareeka nahi badalte. Woh sirf yeh badalte hain ki ABR kaunse shelves bhar sakta hai. Special areas design ya troubleshoot karne se pehle aapko har shelf zubaani yaad honi chahiye.</p>

<h3>Router types (ENCOR se refresher)</h3>
<dl class="terms">
<dt>Internal router</dt><dd>Saare OSPF interfaces ek hi area mein. Branch labs mein BR area 51, 52, 30 ya 40 ka internal router hai.</dd>
<dt>Backbone router</dt><dd>Kam se kam ek interface area 0 mein. CORE aur ABR dono backbone routers hain.</dd>
<dt>ABR (area border router)</dt><dd>Interfaces area 0 aur kam se kam ek doosre area mein. Yeh har area ka ek LSDB rakhta hai, har area ke liye SPF chalata hai aur type-3 aur type-4 LSAs banata hai. <code>show ip ospf</code> print karta hai "It is an area border router".</dd>
<dt>ASBR (autonomous system boundary router)</dt><dd>Koi bhi router jo OSPF mein routes redistribute karta hai (ya <code>default-information originate</code> se default originate karta hai). Branch labs mein CORE ASBR hai. <code>show ip ospf</code> print karta hai "It is an autonomous system boundary router".</dd>
</dl>
<p>Ek router kai roles rakh sakta hai. Jaise type-7 LSAs translate karne wala NSSA ABR ek ABR <b>aur</b> ASBR dono hai, kyunki woh khud type-5 LSAs originate karta hai.</p>

<h3>LSA types jo aapko aane chahiye</h3>
<table class="cmp"><tr><th>Type</th><th>Naam</th><th>Kaun banata hai</th><th>Flooding scope</th><th>Route code</th></tr>
<tr><td>1</td><td>Router LSA</td><td>Har router</td><td>Apna area</td><td>O</td></tr>
<tr><td>2</td><td>Network LSA</td><td>Multi-access segment ka DR</td><td>Apna area</td><td>O</td></tr>
<tr><td>3</td><td>Summary (network) LSA</td><td>ABR</td><td>Ek area ke andar</td><td>O IA</td></tr>
<tr><td>4</td><td>ASBR summary LSA</td><td>ABR</td><td>Ek area ke andar</td><td>koi nahi (ASBR locate karta hai)</td></tr>
<tr><td>5</td><td>AS external LSA</td><td>ASBR</td><td>Stub aur NSSA ko chhod kar poora domain</td><td>O E1 / O E2</td></tr>
<tr><td>7</td><td>NSSA external LSA</td><td>NSSA ke andar ASBR</td><td>Sirf woh NSSA</td><td>O N1 / O N2</td></tr>
</table>
<p>Type-4 ko dhyaan se dekho. Type-5 LSA kehta hai "network X ASBR 3.3.3.3 ke through reachable hai". Area 0 ke routers 3.3.3.3 ko uske type-1 router LSA mein dhoondh sakte hain. Area 51 ke routers nahi, kyunki type-1 LSAs kabhi apna area nahi chhodte. Isliye ABR ek <b>type-4</b> banata hai jo kehta hai "ASBR 3.3.3.3 mere through cost N par reachable hai". Type-4 ke bina branch ke paas ek type-5 LSA hoga jise woh use nahi kar sakta. Isiliye stub area dono ko saath mein rokta hai: type-5 nahi to type-4 ki zaroorat nahi. Types 9, 10 aur 11 opaque LSAs hain jo MPLS traffic engineering aur graceful restart jaise features use karte hain; yeh area design nahi badalte.</p>

<h3>Har area type kya andar aane deta hai</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Har area type ko kaunse LSAs milte hain">
<rect x="10" y="30" width="150" height="200" rx="10" fill="#bae6fd"/><text x="85" y="55" text-anchor="middle" class="svg-ink" font-size="13">Area 0 LSDB</text>
<text x="85" y="95" text-anchor="middle" class="svg-ink" font-size="12">Type 3 summaries</text>
<text x="85" y="135" text-anchor="middle" class="svg-ink" font-size="12">Type 4 ASBR</text>
<text x="85" y="175" text-anchor="middle" class="svg-ink" font-size="12">Type 5 externals</text>
<rect x="175" y="30" width="70" height="200" rx="10" fill="#ddd6fe"/><text x="210" y="125" text-anchor="middle" class="svg-ink" font-size="13">ABR</text><text x="210" y="143" text-anchor="middle" class="svg-muted" font-size="12">gate</text>
<rect x="265" y="30" width="365" height="42" rx="8" fill="#bbf7d0"/><text x="447" y="56" text-anchor="middle" class="svg-ink" font-size="12">Stub: T3 andar, T4/T5 bahar, O*IA default</text>
<rect x="265" y="82" width="365" height="42" rx="8" fill="#bbf7d0"/><text x="447" y="108" text-anchor="middle" class="svg-ink" font-size="12">Totally stubby: sirf T3 default</text>
<rect x="265" y="134" width="365" height="42" rx="8" fill="#fde68a"/><text x="447" y="160" text-anchor="middle" class="svg-ink" font-size="12">NSSA: T3 andar, T4/T5 bahar, local T7 allowed</text>
<rect x="265" y="186" width="365" height="42" rx="8" fill="#fde68a"/><text x="447" y="212" text-anchor="middle" class="svg-ink" font-size="12">Totally NSSA: T3 default + local T7</text>
<line x1="245" y1="80" x2="265" y2="51" stroke="#64748b" stroke-width="1.5"/><line x1="245" y1="110" x2="265" y2="103" stroke="#64748b" stroke-width="1.5"/>
<line x1="245" y1="150" x2="265" y2="155" stroke="#64748b" stroke-width="1.5"/><line x1="245" y1="180" x2="265" y2="207" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Area type ke hisaab se filtering sirf ABR par hoti hai. Types 1 aur 2 hamesha apne area ke andar rehte hain.</p></div>

<table class="cmp"><tr><th>Area type</th><th>T3</th><th>T4 / T5</th><th>T7</th><th>Default route</th><th>Andar ASBR</th><th>VL ke liye transit</th></tr>
<tr><td>Backbone (0)</td><td>haan</td><td>haan</td><td>nahi</td><td>apne aap koi nahi</td><td>haan</td><td>lagu nahi</td></tr>
<tr><td>Normal</td><td>haan</td><td>haan</td><td>nahi</td><td>apne aap koi nahi</td><td>haan</td><td>haan</td></tr>
<tr><td>Stub</td><td>haan</td><td>nahi</td><td>nahi</td><td>O*IA, apne aap</td><td>nahi</td><td>nahi</td></tr>
<tr><td>Totally stubby</td><td>sirf default</td><td>nahi</td><td>nahi</td><td>O*IA, apne aap</td><td>nahi</td><td>nahi</td></tr>
<tr><td>NSSA</td><td>haan</td><td>nahi</td><td>haan</td><td>O*N2, sirf configure karne par</td><td>haan</td><td>nahi</td></tr>
<tr><td>Totally NSSA</td><td>sirf default</td><td>nahi</td><td>haan</td><td>O*IA, apne aap</td><td>haan</td><td>nahi</td></tr>
</table>

<h3>Database padhna</h3>
<p>Yeh stub lab se pehle area 51 mein BR hai. Har shelf bhari hai: router aur network LSAs, summaries, CORE ke liye ek type-4 aur do type-5 externals.</p>
<pre class="out">BR#show ip ospf database

            OSPF Router with ID (1.1.1.1) (Process ID 1)

                Router Link States (Area 51)
Link ID         ADV Router      Age         Seq#       Checksum Link count
1.1.1.1         1.1.1.1         112         0x80000004 0x00A1B2 3
2.2.2.2         2.2.2.2         110         0x80000003 0x0033C4 1

                Net Link States (Area 51)
Link ID         ADV Router      Age         Seq#       Checksum
10.51.12.2      2.2.2.2         110         0x80000001 0x00F1A3

                Summary Net Link States (Area 51)
Link ID         ADV Router      Age         Seq#       Checksum
2.2.2.2         2.2.2.2         160         0x80000001 0x00D2E6
3.3.3.3         2.2.2.2         150         0x80000001 0x00B4FF
10.0.23.0       2.2.2.2         160         0x80000001 0x0015A0

<span class="hl">                Summary ASB Link States (Area 51)</span>
Link ID         ADV Router      Age         Seq#       Checksum
3.3.3.3         2.2.2.2         150         0x80000001 0x009C12

<span class="hl">                Type-5 AS External Link States</span>
Link ID         ADV Router      Age         Seq#       Checksum Tag
0.0.0.0         3.3.3.3         151         0x80000001 0x00C2A8 1
203.0.113.0     3.3.3.3         151         0x80000001 0x0063B7 0</pre>
<p>Dhyaan do ki type-5 LSAs ki heading mein koi area nahi hai, kyunki unka scope poora domain hai. Type-3 ya type-4 ka advertising router hamesha ABR hota hai, jabki type-5 ka advertising router ASBR (ya translate karne wala NSSA ABR) hota hai. Har type ki jaldi ginti ke liye <code>show ip ospf database database-summary</code> use karo.</p>

<div class="eg"><p><b>Worked example.</b> Upar BR ke LSAs gino: 2 router + 1 network + 3 summary + 1 ASBR summary + 2 external = 9. Stub lab ke baad type-4 aur dono type-5 LSAs gayab ho jaate hain aur ek naya type-3 (0.0.0.0) aata hai: 2 + 1 + 4 = 7. Totally stubby lab ke baad summaries mein sirf type-3 default bachta hai: 2 + 1 + 1 = 4.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Type-3 ko "summarised route" kehna: yeh bas doosre area ke prefix ki summary hai, har prefix ka ek LSA, jab tak aap <code>area range</code> configure na karo. Aur yeh expect karna ki type-7 LSAs NSSA se bahar jaayenge: woh kabhi nahi jaate. ABR uski jagah ek naya type-5 banata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Stub area mein kaunse LSA types block hote hain?" Jawab hai types 4 aur 5, sirf type 5 nahi. Totally stubby area ke liye types 3 (default ko chhod kar), 4 aur 5.</p></div>

<div class="scn"><h4>Database mein external routes, table se gayab</h4><p>Area 20 ke ek naye router ne <code>show ip ospf database external</code> mein 198.51.100.0/24 ka type-5 LSA dikhaya, lekin koi route nahi. Detail output mein "Forward Address: 10.9.9.1" tha. Engineer ne dekha ki ASBR ka link 10.9.9.0/24 OSPF mein advertise hi nahi tha, isliye koi router forwarding address tak nahi pahunch sakta tha, aur OSPF aisa external route install nahi karta jiska forwarding address unreachable ho. 10.9.9.0/24 advertise karne se fix ho gaya.</p><p><b>Lesson:</b> database mein LSA hona route hona nahi hai. Filtering ko blame karne se pehle ASBR ka path (type-4) ya forwarding address check karo.</p></div>

<div class="iv"><p class="q">"OSPF ko type-4 LSA ki zaroorat kyun hai?"</p><p>Strong answer: type-5 LSAs ASBR ko router ID se point karte hain, lekin ASBR ko describe karne wale type-1 LSAs ASBR ke area mein hi rehte hain. Isliye ABR har doosre area mein ek type-4 originate karta hai jo batata hai ki ABR ke through ASBR kitna door hai. Yeh bhi batao ki stub areas mein type-4 type-5 ke saath hi hat jaata hai, aur jab NSSA ABR type-7 ko type-5 mein translate karta hai to woh khud ASBR ban jaata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Router roles: internal, backbone, ABR aur ASBR; ek router kai roles rakh sakta hai.</li>
<li>Types 1 aur 2 area mein rehte hain; 3 aur 4 ABR har area ke liye banata hai; 5 poore domain mein flood hota hai; 7 sirf NSSA mein rehta hai.</li>
<li>Stub 4 aur 5 rokta hai; totally stubby default ko chhod kar 3 bhi rokta hai; NSSA variants type 7 jodte hain.</li>
<li>Sirf normal areas virtual links ke transit areas ban sakte hain; stub aur NSSA areas nahi.</li>
<li>Database ke har section ki heading aur advertising router hamesha check karo.</li>
</ul></div>
`}};export{e as default};