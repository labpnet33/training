var e={id:`areas-roles`,h:{en:`Areas, router roles and multi-area design rules`,hi:`Areas, router roles aur multi-area design rules`},body:{en:`
<p>Think of an airline network. Small cities connect only to their regional hub. Regional hubs connect to each other only through the national hubs. A passenger from Coimbatore to Nagpur never flies directly from one small airport to another; the route always goes through the core. That rule keeps the network predictable. OSPF areas follow the same rule: every non-backbone area connects to <b>area 0</b>, and traffic between two non-backbone areas always passes through area 0.</p>

<h3>Router roles</h3>
<dl class="terms">
<dt>Internal router</dt><dd>All OSPF interfaces in one area. R1 (area 10) and R5 (area 20) in lab 1. Holds one LSDB.</dd>
<dt>Backbone router</dt><dd>At least one interface in area 0. CORE is a backbone internal router; ABR1 and ABR2 are also backbone routers.</dd>
<dt>Area Border Router (ABR)</dt><dd>Interfaces in area 0 <b>and</b> at least one other area. Keeps a separate LSDB per area, runs SPF per area, and originates type 3 and type 4 LSAs. It is the only place where inter-area summarisation and type 3 filtering can happen.</dd>
<dt>Autonomous System Boundary Router (ASBR)</dt><dd>Redistributes routes from another source (static, connected, EIGRP, BGP) into OSPF, creating type 5 or type 7 LSAs. Any router can be an ASBR, including an ABR or an internal router. It is the place for external summarisation.</dd>
</dl>
<p>There is no command that makes a router an ABR. The role appears the moment the router has active interfaces in area 0 and another area. The ASBR role appears when you configure <code>redistribute</code> (or <code>default-information originate</code>).</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Router roles and inter-area path">
<ellipse cx="320" cy="70" rx="150" ry="48" fill="#bae6fd"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">Area 0 backbone</text>
<ellipse cx="110" cy="190" rx="100" ry="46" fill="#bbf7d0"/><text x="110" y="200" text-anchor="middle" class="svg-ink" font-size="13">Area 10</text>
<ellipse cx="530" cy="190" rx="100" ry="46" fill="#fde68a"/><text x="530" y="200" text-anchor="middle" class="svg-ink" font-size="13">Area 20</text>
<rect x="160" y="110" width="80" height="30" rx="6" fill="#ddd6fe"/><text x="200" y="130" text-anchor="middle" class="svg-ink" font-size="12">ABR1</text>
<rect x="400" y="110" width="80" height="30" rx="6" fill="#ddd6fe"/><text x="440" y="130" text-anchor="middle" class="svg-ink" font-size="12">ABR2</text>
<rect x="290" y="70" width="60" height="28" rx="6" fill="#e2e8f0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="12">CORE</text>
<line x1="80" y1="175" x2="190" y2="140" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="220" y1="115" x2="295" y2="90" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="345" y1="90" x2="420" y2="115" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="450" y1="140" x2="560" y2="175" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="150" y1="210" x2="480" y2="210" stroke="#dc2626" stroke-width="2"/><text x="320" y="228" text-anchor="middle" class="svg-accent" font-size="12">No direct path between non-backbone areas</text>
</svg><p class="cap">Inter-area traffic (dashed) always crosses area 0. Two non-backbone areas never exchange type 3 LSAs directly.</p></div>

<h3>The design rules</h3>
<ol>
<li><b>Area 0 must exist</b> whenever there is more than one area, and every other area must touch it through an ABR.</li>
<li><b>Area 0 must be contiguous.</b> All parts of the backbone must be connected through area 0 links. A backbone cut into two pieces is called a <b>partitioned</b> or <b>split</b> area 0.</li>
<li><b>Both ends of a link must be in the same area.</b> Otherwise Hellos are rejected with "mismatched area ID".</li>
<li><b>An ABR learns inter-area routes only from area 0.</b> It ignores type 3 LSAs it receives in a non-backbone area when calculating its own routes. This is OSPF's loop-prevention rule between areas.</li>
<li><b>Areas are 32-bit numbers.</b> <code>area 10</code> and <code>area 0.0.0.10</code> are identical. Area 0 is also written <code>0.0.0.0</code>.</li>
</ol>

<h3>Why the backbone rule prevents loops</h3>
<p>Between areas, OSPF behaves like distance vector: an ABR says "prefix X, cost Y, via me", and nobody sees the topology behind it. Distance-vector protocols can loop. OSPF avoids that with a strict hub-and-spoke of areas. An ABR advertises into area 0 only intra-area routes of its attached areas. It advertises into non-backbone areas the intra-area routes of its other areas plus the inter-area routes it learned from area 0. And it never uses a type 3 from a non-backbone area for its own path calculation. A route can therefore never travel non-backbone to non-backbone and back.</p>

<h3>Virtual links (preview)</h3>
<p>Sometimes an area cannot touch area 0 physically, for example after a merger, or the backbone gets split. A <b>virtual link</b> is a logical area 0 link tunnelled through a non-backbone <b>transit area</b> between two ABRs. It is configured on both ends with the other router's RID, and it runs as an area 0 point-to-point adjacency:</p>
<pre class="code">ABR1(config)# router ospf 1
ABR1(config-router)# area 10 virtual-link 4.4.4.4
ABR2(config)# router ospf 1
ABR2(config-router)# area 10 virtual-link 2.2.2.2</pre>
<p>The transit area must be a normal area (not stub or NSSA). Virtual links are a repair tool, not a design goal; you will use one in the Area 0 split ticket in chapter 12, and the ENARSI track goes deeper.</p>

<h3>Area types (preview)</h3>
<p>Beyond normal areas there are stub (no type 4 or 5, default route instead), totally stubby (only a default, no type 3 either, Cisco proprietary), NSSA and totally NSSA. ENCOR v1.2 asks for multiple <b>normal</b> areas; treat the others as vocabulary.</p>

<div class="eg"><p><b>Worked example.</b> A company has HQ (area 0), Mumbai (area 1) and Delhi (area 2). Delhi's only link goes to Mumbai's router M-EDGE, which is in area 1 and area 2 but not area 0. M-EDGE is attached to two areas but has no backbone attachment, so it does not act as a full ABR. It will not pass Delhi's prefixes into area 0, and Delhi learns nothing from HQ. Solutions: give M-EDGE its own link into area 0 so it becomes a real ABR, run a virtual link through area 1 from M-EDGE to the Mumbai ABR, or merge Delhi into area 1.</p></div>

<div class="warn"><p><b>Common mistake.</b> Numbering areas by site and connecting two branch areas directly "because the fibre is there". Without area 0 between them, no inter-area routes flow across that link. Put such links in area 0 or in one of the two areas.</p></div>

<div class="exam"><p><b>Exam trap.</b> A router with interfaces in area 10 and area 20 only is not a working ABR between them. Also remember: ASBR is about redistribution, not about areas; an internal router can be an ASBR.</p></div>

<div class="scn"><h4>The acquisition that could not see head office</h4><p>After an acquisition, the new company's network (area 50) was connected to an existing branch router that lived in area 5. Users in area 50 could reach area 5 but nothing else. <code>show ip ospf</code> on the joining router did not show "It is an area border router" in the expected way, and <code>show ip ospf border-routers</code> in area 50 listed no ABR to the backbone. The team added a virtual link through area 5 to the area 5 ABR as a quick fix, then scheduled a direct backbone circuit.</p><p><b>Lesson:</b> every area needs a real connection to area 0; a virtual link is a temporary bridge.</p></div>

<div class="iv"><p class="q">"Why must all OSPF areas connect to area 0?"</p><p>Strong answer: because inter-area routing is distance-vector-like, and OSPF prevents loops by forcing a two-level hierarchy: ABRs only advertise backbone-learned inter-area routes into non-backbone areas and ignore type 3 LSAs from non-backbone areas for their own calculation. Mention that area 0 must also be contiguous, and that virtual links repair a missing or split backbone connection through a normal transit area.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Roles: internal, backbone, ABR (area 0 plus another area) and ASBR (redistributes).</li>
<li>Every area attaches to area 0; inter-area traffic crosses area 0.</li>
<li>Area 0 must be contiguous; a split backbone breaks inter-area routing.</li>
<li>ABRs use only backbone type 3 LSAs for their own routes: the loop-prevention rule.</li>
<li>Virtual links repair backbone connectivity through a normal transit area; they are a patch, not a design.</li>
</ul></div>
`,hi:`
<p>Ek airline network socho. Chhote shehar sirf apne regional hub se jude hain. Regional hubs ek doosre se sirf national hubs ke through jude hain. Coimbatore se Nagpur jaane wala passenger kabhi ek chhote airport se doosre chhote airport seedha nahi udta; route hamesha core se hokar jaata hai. Yeh rule network ko predictable rakhta hai. OSPF areas yahi rule follow karte hain: har non-backbone area <b>area 0</b> se judta hai, aur do non-backbone areas ke beech traffic hamesha area 0 se guzarta hai.</p>

<h3>Router roles</h3>
<dl class="terms">
<dt>Internal router</dt><dd>Saare OSPF interfaces ek hi area mein. Lab 1 mein R1 (area 10) aur R5 (area 20). Ek LSDB rakhta hai.</dd>
<dt>Backbone router</dt><dd>Kam se kam ek interface area 0 mein. CORE backbone internal router hai; ABR1 aur ABR2 bhi backbone routers hain.</dd>
<dt>Area Border Router (ABR)</dt><dd>Interfaces area 0 mein <b>aur</b> kam se kam ek doosre area mein. Har area ka alag LSDB rakhta hai, har area ke liye SPF chalata hai, aur type 3 aur type 4 LSAs banata hai. Inter-area summarisation aur type 3 filtering sirf yahin ho sakti hai.</dd>
<dt>Autonomous System Boundary Router (ASBR)</dt><dd>Doosre source (static, connected, EIGRP, BGP) ke routes OSPF mein redistribute karta hai, type 5 ya type 7 LSAs banata hai. Koi bhi router ASBR ho sakta hai, ABR ya internal router bhi. External summarisation ki jagah yahi hai.</dd>
</dl>
<p>Aisa koi command nahi jo router ko ABR banaye. Jaise hi router ke active interfaces area 0 aur kisi doosre area mein hote hain, role aa jaata hai. ASBR role tab aata hai jab aap <code>redistribute</code> (ya <code>default-information originate</code>) configure karte ho.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Router roles aur inter-area path">
<ellipse cx="320" cy="70" rx="150" ry="48" fill="#bae6fd"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">Area 0 backbone</text>
<ellipse cx="110" cy="190" rx="100" ry="46" fill="#bbf7d0"/><text x="110" y="200" text-anchor="middle" class="svg-ink" font-size="13">Area 10</text>
<ellipse cx="530" cy="190" rx="100" ry="46" fill="#fde68a"/><text x="530" y="200" text-anchor="middle" class="svg-ink" font-size="13">Area 20</text>
<rect x="160" y="110" width="80" height="30" rx="6" fill="#ddd6fe"/><text x="200" y="130" text-anchor="middle" class="svg-ink" font-size="12">ABR1</text>
<rect x="400" y="110" width="80" height="30" rx="6" fill="#ddd6fe"/><text x="440" y="130" text-anchor="middle" class="svg-ink" font-size="12">ABR2</text>
<rect x="290" y="70" width="60" height="28" rx="6" fill="#e2e8f0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="12">CORE</text>
<line x1="80" y1="175" x2="190" y2="140" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="220" y1="115" x2="295" y2="90" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="345" y1="90" x2="420" y2="115" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="450" y1="140" x2="560" y2="175" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="150" y1="210" x2="480" y2="210" stroke="#dc2626" stroke-width="2"/><text x="320" y="228" text-anchor="middle" class="svg-accent" font-size="12">Non-backbone areas ke beech direct path nahi</text>
</svg><p class="cap">Inter-area traffic (dashed) hamesha area 0 cross karta hai. Do non-backbone areas kabhi seedhe type 3 LSAs exchange nahi karte.</p></div>

<h3>Design rules</h3>
<ol>
<li>Jab bhi ek se zyada area ho, <b>area 0 hona zaroori hai</b>, aur har doosra area ABR ke through use chhoona chahiye.</li>
<li><b>Area 0 contiguous hona chahiye.</b> Backbone ke saare hisse area 0 links se jude hone chahiye. Do tukdon mein kata backbone <b>partitioned</b> ya <b>split</b> area 0 kehlata hai.</li>
<li><b>Link ke dono ends same area mein hone chahiye.</b> Warna Hellos "mismatched area ID" ke saath reject hote hain.</li>
<li><b>ABR inter-area routes sirf area 0 se seekhta hai.</b> Apne routes calculate karte waqt woh non-backbone area mein mile type 3 LSAs ignore karta hai. Yeh areas ke beech OSPF ka loop-prevention rule hai.</li>
<li><b>Areas 32-bit numbers hain.</b> <code>area 10</code> aur <code>area 0.0.0.10</code> bilkul same hain. Area 0 ko <code>0.0.0.0</code> bhi likhte hain.</li>
</ol>

<h3>Backbone rule loops kaise rokta hai</h3>
<p>Areas ke beech OSPF distance vector jaisa behave karta hai: ABR kehta hai "prefix X, cost Y, mere through", aur uske peeche ki topology koi nahi dekhta. Distance-vector protocols mein loops ho sakte hain. OSPF areas ke strict hub-and-spoke se ise rokta hai. ABR area 0 mein sirf apne attached areas ke intra-area routes advertise karta hai. Non-backbone areas mein woh apne doosre areas ke intra-area routes plus area 0 se seekhe inter-area routes advertise karta hai. Aur apne path calculation ke liye kabhi non-backbone area ka type 3 use nahi karta. Isliye koi route kabhi non-backbone se non-backbone aur wapas nahi ghoom sakta.</p>

<h3>Virtual links (preview)</h3>
<p>Kabhi kabhi koi area physically area 0 ko chhoo nahi sakta, jaise merger ke baad, ya backbone split ho jaata hai. <b>Virtual link</b> ek logical area 0 link hai jo do ABRs ke beech non-backbone <b>transit area</b> ke through tunnel hota hai. Ise dono ends par doosre router ke RID ke saath configure karte hain, aur yeh area 0 point-to-point adjacency ki tarah chalta hai:</p>
<pre class="code">ABR1(config)# router ospf 1
ABR1(config-router)# area 10 virtual-link 4.4.4.4
ABR2(config)# router ospf 1
ABR2(config-router)# area 10 virtual-link 2.2.2.2</pre>
<p>Transit area normal area hona chahiye (stub ya NSSA nahi). Virtual links repair tool hain, design goal nahi; chapter 12 ke Area 0 split ticket mein aap ek use karoge, aur ENARSI track aur gehraai mein jaata hai.</p>

<h3>Area types (preview)</h3>
<p>Normal areas ke alawa stub (type 4 ya 5 nahi, uski jagah default route), totally stubby (sirf default, type 3 bhi nahi, Cisco proprietary), NSSA aur totally NSSA hote hain. ENCOR v1.2 multiple <b>normal</b> areas maangta hai; baaki ko vocabulary ki tarah treat karo.</p>

<div class="eg"><p><b>Worked example.</b> Ek company ke paas HQ (area 0), Mumbai (area 1) aur Delhi (area 2) hain. Delhi ka ek hi link Mumbai ke router M-EDGE tak jaata hai, jo area 1 aur area 2 mein hai par area 0 mein nahi. M-EDGE do areas se juda hai lekin backbone attachment nahi hai, isliye woh poora ABR ka kaam nahi karta. Woh Delhi ke prefixes area 0 mein nahi bhejega, aur Delhi HQ se kuch nahi seekhta. Solutions: M-EDGE ko area 0 mein apna link do taaki woh asli ABR bane, M-EDGE se Mumbai ABR tak area 1 ke through virtual link chalao, ya Delhi ko area 1 mein merge kar do.</p></div>

<div class="warn"><p><b>Common galti.</b> Areas ko site ke hisaab se number karna aur do branch areas ko seedha jod dena "kyunki fibre wahan hai". Unke beech area 0 ke bina us link par koi inter-area routes nahi chalte. Aise links ko area 0 mein ya dono mein se kisi ek area mein daalo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Jis router ke interfaces sirf area 10 aur area 20 mein hain, woh unke beech kaam karne wala ABR nahi hai. Yeh bhi yaad rakho: ASBR redistribution ke baare mein hai, areas ke baare mein nahi; internal router bhi ASBR ho sakta hai.</p></div>

<div class="scn"><h4>Acquisition jo head office nahi dekh paaya</h4><p>Ek acquisition ke baad nayi company ka network (area 50) ek existing branch router se joda gaya jo area 5 mein tha. Area 50 ke users area 5 tak pahunch paate the par aur kahin nahi. Jodne wale router par <code>show ip ospf</code> expected tarike se "It is an area border router" nahi dikha raha tha, aur area 50 mein <code>show ip ospf border-routers</code> backbone tak koi ABR list nahi kar raha tha. Team ne quick fix ke roop mein area 5 ke through area 5 ABR tak virtual link joda, phir direct backbone circuit schedule kiya.</p><p><b>Seekh:</b> har area ko area 0 se asli connection chahiye; virtual link temporary pul hai.</p></div>

<div class="iv"><p class="q">"Saare OSPF areas ko area 0 se kyun judna chahiye?"</p><p>Strong answer: kyunki inter-area routing distance-vector jaisi hai, aur OSPF do-level hierarchy force karke loops rokta hai: ABRs non-backbone areas mein sirf backbone se seekhe inter-area routes advertise karte hain aur apne calculation ke liye non-backbone areas ke type 3 LSAs ignore karte hain. Batao ki area 0 contiguous bhi hona chahiye, aur virtual links normal transit area ke through missing ya split backbone connection repair karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Roles: internal, backbone, ABR (area 0 plus doosra area) aur ASBR (redistribute karta hai).</li>
<li>Har area area 0 se judta hai; inter-area traffic area 0 cross karta hai.</li>
<li>Area 0 contiguous hona chahiye; split backbone inter-area routing tod deta hai.</li>
<li>ABRs apne routes ke liye sirf backbone type 3 LSAs use karte hain: yahi loop-prevention rule hai.</li>
<li>Virtual links normal transit area ke through backbone connectivity repair karte hain; yeh patch hain, design nahi.</li>
</ul></div>
`}};export{e as default};