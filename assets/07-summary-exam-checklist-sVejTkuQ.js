var e=(e,t,n,r)=>`<text x="`+e+`" y="`+t+`" text-anchor="middle" class="`+(r||`svg-ink`)+`" font-size="12">`+n+`</text>`,t=(e,t,n,r,i)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"`+(i?` stroke-dasharray="5 4"`:``)+`/>`,n=(e,t,n)=>`<circle cx="`+e+`" cy="`+t+`" r="16" fill="`+n+`" stroke="#475569" stroke-width="1.5"/><path d="M`+(e-9)+` `+t+`H`+(e+9)+`M`+e+` `+(t-9)+`V`+(t+9)+`M`+(e-5)+` `+(t-5)+`L`+(e-9)+` `+t+`L`+(e-5)+` `+(t+5)+`M`+(e+5)+` `+(t-5)+`L`+(e+9)+` `+t+`L`+(e+5)+` `+(t+5)+`" fill="none" stroke="#334155" stroke-width="1.5"/>`,r=(e,t,n)=>`<g fill="`+n+`" stroke="none"><ellipse cx="`+e+`" cy="`+(t+4)+`" rx="28" ry="13"/><circle cx="`+(e-10)+`" cy="`+(t-4)+`" r="12"/><circle cx="`+(e+8)+`" cy="`+(t-7)+`" r="15"/></g>`,i=(e,t,n)=>`<rect x="`+(e-16)+`" y="`+(t-18)+`" width="32" height="36" rx="3" fill="`+n+`" stroke="#475569" stroke-width="1.5"/><path d="M`+(e-9)+` `+(t-10)+`h5v5h-5zM`+(e+4)+` `+(t-10)+`h5v5h-5zM`+(e-9)+` `+(t+1)+`h5v5h-5zM`+(e+4)+` `+(t+1)+`h5v5h-5z" fill="#ffffff" stroke="none"/>`,a=(e,t,n)=>`<rect x="`+(e-14)+`" y="`+(t-17)+`" width="28" height="34" rx="3" fill="`+n+`" stroke="#475569" stroke-width="1.5"/><path d="M`+(e-8)+` `+(t-8)+`H`+(e+8)+`M`+(e-8)+` `+t+`H`+(e+8)+`M`+(e-8)+` `+(t+8)+`H`+(e+8)+`" stroke="#334155" stroke-width="2"/>`,o=(e,t,n)=>`<path d="M`+e+` `+(t-18)+`L`+(e+16)+` `+(t-11)+`V`+(t+2)+`C`+(e+16)+` `+(t+12)+` `+(e+6)+` `+(t+17)+` `+e+` `+(t+20)+`C`+(e-6)+` `+(t+17)+` `+(e-16)+` `+(t+12)+` `+(e-16)+` `+(t+2)+`V`+(t-11)+`Z" fill="`+n+`" stroke="#475569" stroke-width="1.5"/>`,s=(e,t,n,r)=>`<div class="dia"><svg viewBox="0 0 640 `+e+`" role="img" aria-label="`+t+`">`+n+`</svg><p class="cap">`+r+`</p></div>`,c=c=>{let l=(t,n,r,i,a,o)=>n+e(t,98,r)+e(t,118,i,`svg-muted`)+e(t,134,a,`svg-muted`)+e(t,150,o,`svg-muted`),u=t(84,56,172,56)+t(212,56,300,56)+t(340,56,428,56)+t(468,56,556,56)+l(64,i(64,56,`#bbf7d0`),c[0],c[1],c[2],c[3])+l(192,n(192,56,`#ddd6fe`),c[4],c[5],c[6],c[7])+l(320,r(320,52,`#e2e8f0`),c[8],c[9],c[10],c[11])+l(448,o(448,56,`#fed7aa`),c[12],c[13],c[14],c[15])+l(576,a(576,56,`#fde68a`),c[16],c[17],c[18],c[19])+`<rect x="10" y="168" width="620" height="34" rx="8" fill="#f1f5f9" stroke="#94a3b8"/><text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">`+c[20]+`</text>`;return s(215,c[21],u,c[22])},l={id:`summary-exam-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>Customer case: the Brightwave design review</h3>
<p>Brightwave Group (a retail chain with 300 stores, two data centers and two internet providers) asks an external architect to review a proposed routing design before it is built. You are the reviewer, and the exam asks you to think the same way. For every part of the proposal you ask four questions: <b>What are the requirements? What are the constraints? Which options were compared? What trade-off was accepted?</b> This chapter is the checklist you use, with the facts the exam tests most.</p>

@@DIA@@

<h3>The review in five layers</h3>
<table class="cmp"><tr><th>Layer</th><th>Design question</th><th>Typical good answer</th></tr>
<tr><td>Addressing</td><td>Can each region and site be one summary?</td><td>Contiguous, bit-aligned blocks; /31 or /127 on links; /48 per site, /64 per subnet; reserve growth</td></tr>
<tr><td>IPv6 migration</td><td>Native, overlay or boundary?</td><td>Dual stack where possible; tunnels for gaps; NAT64 and DNS64 for IPv6-only edges</td></tr>
<tr><td>OSPF</td><td>Where is the failure domain?</td><td>Areas aligned to regions; stub or totally stubby edges; NSSA where an ASBR exists; summaries at ABR and ASBR</td></tr>
<tr><td>EIGRP</td><td>How far do queries go?</td><td>Stub spokes, hub summaries, feasible successors, named mode</td></tr>
<tr><td>IS-IS</td><td>Levels and address families?</td><td>L1 areas, contiguous L2, wide metrics, overload bit, multi-topology for IPv6 when needed</td></tr>
<tr><td>BGP</td><td>iBGP scaling and edge policy?</td><td>RR pairs or confederation; local preference outbound; prepending, MED, communities inbound; own-prefix filters</td></tr>
<tr><td>Redistribution</td><td>Can routes feed back?</td><td>Seed metrics, tags, filters, summaries; prefer one-way with defaults</td></tr>
<tr><td>Convergence</td><td>Which stage is slow?</td><td>BFD, throttle timers, IP FRR, graceful restart; tuned to the platform</td></tr>
</table>

<h3>Exam checklist: I can...</h3>
<ul>
<li>Build a hierarchical IPv4 and IPv6 plan and show where each summary is made.</li>
<li>Choose native, overlay or boundary IPv6 migration and justify it.</li>
<li>Design OSPF areas, pick the right stub type and name the LSA types involved (1, 2, 3, 4, 5, 7).</li>
<li>Bound EIGRP queries with stub, summarisation and filtering, and explain feasible successors.</li>
<li>Describe IS-IS levels, NET format, ATT bit, wide metrics, overload bit and single versus multi-topology.</li>
<li>Choose between full mesh, route reflectors and confederations, and between default, partial and full tables.</li>
<li>Control inbound and outbound traffic with local preference, prepending, MED and communities.</li>
<li>Prevent redistribution loops with tags, filters and seed metrics.</li>
<li>Explain BFD, throttle timers and IP FRR (LFA, remote LFA) and where each helps.</li>
<li>Choose an IGP from stated requirements and name the trade-off.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Failure domain / blast radius</dt><dd>The part of the network affected by one failure or change. Hierarchy and summarisation shrink it.</dd>
<dt>Summarisation</dt><dd>Advertising one aggregate in place of many specific routes.</dd>
<dt>ABR / ASBR</dt><dd>OSPF router between areas / router that injects external routes.</dd>
<dt>NSSA</dt><dd>Not-so-stubby area: allows Type 7 external routes inside a stub-like area.</dd>
<dt>Query scope</dt><dd>How far an EIGRP query travels. Stubs and summaries limit it.</dd>
<dt>ATT bit</dt><dd>IS-IS flag by which a L1/L2 router tells L1 routers to use it as the default exit.</dd>
<dt>Route reflector</dt><dd>iBGP router that reflects routes to clients, avoiding a full mesh.</dd>
<dt>IP FRR / LFA</dt><dd>Pre-computed backup next hop installed before a failure.</dd>
</dl>

<h3>Most tested facts</h3>
<ul>
<li>Full mesh sessions = n(n-1)/2. Two RRs plus clients is about 2n.</li>
<li>AD: eBGP 20, EIGRP 90, OSPF 110, IS-IS 115, EIGRP external 170, iBGP 200; EIGRP summary Null0 route is AD 5.</li>
<li>Stub and totally stubby cannot contain an ASBR; NSSA can; the ABR translates Type 7 to Type 5.</li>
<li>OSPF prefers intra-area over inter-area regardless of cost; every area connects to area 0.</li>
<li>EIGRP queries are bounded by stub, summarisation and filters; the active timer is 3 minutes by default.</li>
<li>IS-IS has no area 0; the L2 backbone must be contiguous; borders fall on links.</li>
<li>Local preference: outbound. Prepending and MED: inbound.</li>
<li>Tag on entry, deny the tag on re-entry.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Reviewing Brightwave: the proposal used one OSPF area for 300 stores. Requirement: a store outage must not affect other stores. Constraint: store routers are small. Option compared: single area, multi-area, multi-area with totally stubby stores. Chosen: the last, because stores need only a default; accepted trade-off: more ABR configuration. Four sentences, and each one is what the examiner wants to read.</p></div>

<div class="scn"><h4>Post-mortem: the design nobody reviewed</h4><p>A company deployed a flat OSPF area, a full iBGP mesh and mutual redistribution with no tags, all "to keep it simple". Within two years a store flap caused SPF storms, adding a router meant touching 30 devices, and a redistribution change caused a 40-minute loop. A single design review against this checklist would have flagged all three.</p><p><b>Lesson:</b> simplicity that ignores failure domains is not simple. Good design states the trade-off in advance.</p></div>

<div class="warn"><p><b>Common mistakes in the exam.</b> Choosing a favourite protocol instead of the one the requirements point to. Ignoring a stated constraint such as multi-vendor, small routers or skills. Picking a technology that solves a problem the scenario does not have.</p></div>
<div class="exam"><p><b>Exam trap.</b> The answer is usually the option that satisfies <i>all</i> stated requirements with the least complexity. Read the constraint sentence twice.</p></div>

<div class="iv"><p class="q">"Walk me through how you would design routing for a new multi-site enterprise."</p><p>Strong answer: gather requirements and constraints; build the hierarchical address plan; choose the IGP and its hierarchy against scale, convergence, vendors and skills; design the BGP edge and iBGP scaling; define redistribution boundaries with tags and filters; tune convergence to the platform; document trade-offs and a rollback plan.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design in order: addressing, IGP hierarchy, BGP, boundaries, convergence.</li>
<li>Every decision should name requirement, constraint, options and trade-off.</li>
<li>Summarisation and hierarchy are the common thread: they shrink failure domains.</li>
<li>Know the numbers: n(n-1)/2, AD values, LSA types, stub rules.</li>
<li>The best exam answer meets all requirements with the least complexity.</li>
</ul></div>
`.replace(`@@DIA@@`,c([`Addressing`,`Region /14`,`Site /20, /48`,`Summaries`,`IGP`,`OSPF areas`,`EIGRP stubs`,`IS-IS L1/L2`,`BGP edge`,`RR pair`,`Local pref`,`Own prefixes`,`Boundary`,`Route tags`,`Filters`,`Seed metric`,`Speed`,`BFD`,`Throttle`,`IP FRR`,`Every choice shrinks a failure domain and states its trade-off`,`Five layers of routing design`,`Design in this order: addressing first, then IGP, BGP edge, redistribution boundary and convergence.`])),hi:`
<h3>Customer case: Brightwave design review</h3>
<p>Brightwave Group (300 stores, do data centers aur do internet providers wali retail chain) ek external architect se kehta hai ki proposed routing design ko build karne se pehle review kare. Aap reviewer ho, aur exam bhi aapse isi tarah sochne ko kehta hai. Proposal ke har hisse ke liye aap chaar sawal poochte ho: <b>Requirements kya hain? Constraints kya hain? Kaun se options compare hue? Kaun sa trade-off accept hua?</b> Yeh chapter woh checklist hai jo aap use karte ho, un facts ke saath jo exam mein sabse zyada poochhe jaate hain.</p>

@@DIA@@

<h3>Review paanch layers mein</h3>
<table class="cmp"><tr><th>Layer</th><th>Design question</th><th>Typical achha jawab</th></tr>
<tr><td>Addressing</td><td>Kya har region aur site ek summary ban sakta hai?</td><td>Contiguous, bit-aligned blocks; links par /31 ya /127; /48 per site, /64 per subnet; growth reserve</td></tr>
<tr><td>IPv6 migration</td><td>Native, overlay ya boundary?</td><td>Jahan ho sake dual stack; gaps ke liye tunnels; IPv6-only edges ke liye NAT64 aur DNS64</td></tr>
<tr><td>OSPF</td><td>Failure domain kahan hai?</td><td>Regions ke saath aligned areas; stub ya totally stubby edges; ASBR ho to NSSA; ABR aur ASBR par summaries</td></tr>
<tr><td>EIGRP</td><td>Queries kitni door jaati hain?</td><td>Stub spokes, hub summaries, feasible successors, named mode</td></tr>
<tr><td>IS-IS</td><td>Levels aur address families?</td><td>L1 areas, contiguous L2, wide metrics, overload bit, zaroorat par IPv6 ke liye multi-topology</td></tr>
<tr><td>BGP</td><td>iBGP scaling aur edge policy?</td><td>RR pairs ya confederation; outbound local preference; inbound prepending, MED, communities; own-prefix filters</td></tr>
<tr><td>Redistribution</td><td>Kya routes feedback ho sakte hain?</td><td>Seed metrics, tags, filters, summaries; ho sake to defaults ke saath one-way</td></tr>
<tr><td>Convergence</td><td>Kaun sa stage slow hai?</td><td>BFD, throttle timers, IP FRR, graceful restart; platform ke hisaab se tuned</td></tr>
</table>

<h3>Exam checklist: Main kar sakta hoon...</h3>
<ul>
<li>Hierarchical IPv4 aur IPv6 plan banana aur dikhana ki har summary kahan banti hai.</li>
<li>Native, overlay ya boundary IPv6 migration chunna aur justify karna.</li>
<li>OSPF areas design karna, sahi stub type chunna aur involved LSA types (1, 2, 3, 4, 5, 7) batana.</li>
<li>EIGRP queries ko stub, summarisation aur filtering se bound karna, aur feasible successors samjhana.</li>
<li>IS-IS levels, NET format, ATT bit, wide metrics, overload bit aur single versus multi-topology batana.</li>
<li>Full mesh, route reflectors aur confederations mein se, aur default, partial aur full tables mein se chunna.</li>
<li>Local preference, prepending, MED aur communities se inbound aur outbound traffic control karna.</li>
<li>Tags, filters aur seed metrics se redistribution loops rokna.</li>
<li>BFD, throttle timers aur IP FRR (LFA, remote LFA) samjhana aur batana ki har ek kahan madad karta hai.</li>
<li>Stated requirements se IGP chunna aur trade-off ka naam batana.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Failure domain / blast radius</dt><dd>Network ka woh hissa jo ek failure ya change se affect hota hai. Hierarchy aur summarisation ise chhota karte hain.</dd>
<dt>Summarisation</dt><dd>Kai specific routes ki jagah ek aggregate advertise karna.</dd>
<dt>ABR / ASBR</dt><dd>Areas ke beech OSPF router / external routes inject karne wala router.</dd>
<dt>NSSA</dt><dd>Not-so-stubby area: stub jaise area ke andar Type 7 external routes allow karta hai.</dd>
<dt>Query scope</dt><dd>EIGRP query kitni door tak jaati hai. Stubs aur summaries ise limit karte hain.</dd>
<dt>ATT bit</dt><dd>IS-IS flag jisse L1/L2 router L1 routers ko batata hai ki use default exit banao.</dd>
<dt>Route reflector</dt><dd>iBGP router jo clients ko routes reflect karta hai, full mesh se bachata hai.</dd>
<dt>IP FRR / LFA</dt><dd>Failure se pehle install kiya gaya pre-computed backup next hop.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<ul>
<li>Full mesh sessions = n(n-1)/2. Do RRs aur clients lagbhag 2n.</li>
<li>AD: eBGP 20, EIGRP 90, OSPF 110, IS-IS 115, EIGRP external 170, iBGP 200; EIGRP summary ka Null0 route AD 5.</li>
<li>Stub aur totally stubby mein ASBR nahi ho sakta; NSSA mein ho sakta hai; ABR Type 7 ko Type 5 mein translate karta hai.</li>
<li>OSPF cost ki parwah kiye bina intra-area ko inter-area par prefer karta hai; har area area 0 se connect hota hai.</li>
<li>EIGRP queries stub, summarisation aur filters se bound hoti hain; active timer default 3 minute.</li>
<li>IS-IS mein area 0 nahi; L2 backbone contiguous hona chahiye; borders links par girte hain.</li>
<li>Local preference: outbound. Prepending aur MED: inbound.</li>
<li>Entry par tag, re-entry par tag deny.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Brightwave review karte hue: proposal ne 300 stores ke liye ek OSPF area use kiya tha. Requirement: ek store ka outage doosre stores ko affect na kare. Constraint: store routers chhote hain. Compare kiye gaye options: single area, multi-area, totally stubby stores ke saath multi-area. Chosen: aakhri, kyunki stores ko sirf default chahiye; accept kiya gaya trade-off: zyada ABR configuration. Chaar sentences, aur har sentence wahi hai jo examiner padhna chahta hai.</p></div>

<div class="scn"><h4>Post-mortem: woh design jise kisi ne review nahi kiya</h4><p>Ek company ne "simple rakhne" ke liye flat OSPF area, full iBGP mesh aur bina tags ke mutual redistribution deploy kiya. Do saal mein ek store ke flap se SPF storms aaye, ek router jodne ke liye 30 devices chhone pade, aur redistribution change se 40 minute ka loop hua. Is checklist ke saamne ek hi design review teeno cheezein pakad leta.</p><p><b>Lesson:</b> jo simplicity failure domains ko ignore kare woh simple nahi hai. Achha design trade-off pehle se batata hai.</p></div>

<div class="warn"><p><b>Exam mein common mistakes.</b> Requirements jo protocol dikhati hain uski jagah apna pasandida protocol chunna. Stated constraint jaise multi-vendor, chhote routers ya skills ko ignore karna. Aisi technology chunna jo scenario ki na ho aisi problem solve kare.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jawab aam taur par woh option hota hai jo <i>saari</i> stated requirements ko sabse kam complexity ke saath poori kare. Constraint wala sentence do baar padho.</p></div>

<div class="iv"><p class="q">"Naye multi-site enterprise ke liye routing design kaise karoge, step by step batao."</p><p>Strong answer: requirements aur constraints jama karo; hierarchical address plan banao; scale, convergence, vendors aur skills ke against IGP aur uski hierarchy chuno; BGP edge aur iBGP scaling design karo; tags aur filters ke saath redistribution boundaries tay karo; convergence ko platform ke hisaab se tune karo; trade-offs aur rollback plan document karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Is order mein design karo: addressing, IGP hierarchy, BGP, boundaries, convergence.</li>
<li>Har decision mein requirement, constraint, options aur trade-off ka naam ho.</li>
<li>Summarisation aur hierarchy common dhaaga hain: yeh failure domains chhote karte hain.</li>
<li>Numbers jaano: n(n-1)/2, AD values, LSA types, stub rules.</li>
<li>Best exam jawab sabse kam complexity mein saari requirements poori karta hai.</li>
</ul></div>
`.replace(`@@DIA@@`,c([`Addressing`,`Region /14`,`Site /20, /48`,`Summaries`,`IGP`,`OSPF areas`,`EIGRP stubs`,`IS-IS L1/L2`,`BGP edge`,`RR pair`,`Local pref`,`Own prefixes`,`Boundary`,`Route tags`,`Filters`,`Seed metric`,`Speed`,`BFD`,`Throttle`,`IP FRR`,`Har choice failure domain chhota karta hai aur trade-off batata hai`,`Routing design ki paanch layers`,`Is order mein design karo: pehle addressing, phir IGP, BGP edge, redistribution boundary aur convergence.`]))}};export{l as default};