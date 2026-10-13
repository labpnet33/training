var e={id:`big-picture`,h:{en:`Advanced OSPF areas and security: the big picture`,hi:`Advanced OSPF areas aur security: poori picture`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to decide which LSAs are allowed into an area and prove it in the database, build stub, totally stubby, NSSA and totally NSSA areas, repair an area that has lost its backbone connection with a virtual link, protect every adjacency with plain-text, MD5 or HMAC-SHA authentication (including a key rollover without an outage), pick the right OSPF network type for Ethernet, hub-and-spoke and NBMA links, explain exactly why OSPF prefers one path over another (O, O IA, E1, N1, E2, N2 and the forwarding metric), and troubleshoot OSPFv3 address families. This is objective <b>1.9 of the CCNP ENARSI 300-410 v1.1 blueprint</b>, and it is one of the most tested areas of the exam.</p>

<h3>Prerequisites</h3>
<p>You should already know the material from the CCNP ENCOR OSPF module: how neighbours move from DOWN to FULL, what the DR and BDR do, the basic LSA types, and how to build a multi-area design with ABRs. You should also be comfortable with the structured troubleshooting method from the first ENARSI module, and with the idea of redistribution (seed metrics, E1 versus E2) from the redistribution module. We will refresh each of these quickly and then go much deeper.</p>

<h3>An analogy: a housing society with guarded gates</h3>
<p>Picture a large housing society. The main road running through the middle is <b>area 0</b>, the backbone. Every colony (an area) has a gate on the main road, and a guard (the <b>ABR</b>, area border router) decides which notices from outside are pinned on the colony notice board. Notices about other colonies are <b>type-3 summary LSAs</b>. Notices about shops outside the society (routes from other routing sources) are <b>type-5 external LSAs</b>.</p>
<ul>
<li>A <b>stub</b> colony says: "Do not pin outside-shop notices here. Just put up one sign: for anything outside the society, go to the gate." That sign is a <b>default route</b>.</li>
<li>A <b>totally stubby</b> colony removes even the notices about other colonies. Only the "go to the gate" sign remains.</li>
<li>A <b>not-so-stubby</b> colony (<b>NSSA</b>) also refuses outside notices, but it has its own small shop that imports goods from a partner. It labels those goods with a local tag (<b>type-7</b>), and the guard relabels them (<b>type-5</b>) when they leave the colony.</li>
<li>A colony that was built without its own gate on the main road needs a private corridor through a neighbouring colony. That corridor is a <b>virtual link</b>.</li>
<li>Finally, every resident must show an ID card at the gate. That is <b>authentication</b>.</li>
</ul>

<h3>The lab topology you will use most</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Branch, ABR and core topology">
<rect x="10" y="40" width="255" height="150" rx="10" fill="#bbf7d0"/><text x="135" y="62" text-anchor="middle" class="svg-ink" font-size="13">Area X (51, 52, 30 or 40)</text>
<rect x="330" y="40" width="300" height="150" rx="10" fill="#bae6fd"/><text x="490" y="62" text-anchor="middle" class="svg-ink" font-size="13">Area 0 (backbone)</text>
<rect x="35" y="90" width="115" height="50" rx="8" fill="#fde68a"/><text x="92" y="111" text-anchor="middle" class="svg-ink" font-size="13">BR 1.1.1.1</text><text x="92" y="129" text-anchor="middle" class="svg-muted" font-size="12">internal router</text>
<rect x="245" y="90" width="115" height="50" rx="8" fill="#ddd6fe"/><text x="302" y="111" text-anchor="middle" class="svg-ink" font-size="13">ABR 2.2.2.2</text><text x="302" y="129" text-anchor="middle" class="svg-muted" font-size="12">area border</text>
<rect x="495" y="90" width="115" height="50" rx="8" fill="#fed7aa"/><text x="552" y="111" text-anchor="middle" class="svg-ink" font-size="13">CORE 3.3.3.3</text><text x="552" y="129" text-anchor="middle" class="svg-muted" font-size="12">ASBR</text>
<line x1="150" y1="115" x2="245" y2="115" stroke="#64748b" stroke-width="2"/><text x="197" y="106" text-anchor="middle" class="svg-muted" font-size="12">10.X.12.0/30</text>
<line x1="360" y1="115" x2="495" y2="115" stroke="#64748b" stroke-width="2"/><text x="428" y="106" text-anchor="middle" class="svg-muted" font-size="12">10.0.23.0/30</text>
<text x="92" y="170" text-anchor="middle" class="svg-accent" font-size="12">LAN 192.168.X.0/24</text>
<text x="540" y="170" text-anchor="middle" class="svg-accent" font-size="12">203.0.113.0/24 + default</text>
</svg><p class="cap">Four of the seven labs use this trio. CORE redistributes 203.0.113.0/24 and originates a default route, so the branch sees external routes until you change the area type.</p></div>

<h3>The seven labs at a glance</h3>
<table class="cmp"><tr><th>Lab</th><th>Area and devices</th><th>What you prove</th></tr>
<tr><td>Stub area</td><td>Area 51, Indore branch: BR, ABR, CORE</td><td>E2 routes disappear, O*IA default appears, default-cost 50 gives metric 51</td></tr>
<tr><td>Totally stubby</td><td>Area 52, Kochi: BR, ABR, CORE</td><td>Only intra-area routes and one type-3 default remain</td></tr>
<tr><td>NSSA</td><td>Area 30, Nagpur: partner 172.31.0.0/24</td><td>O N2 inside, O E2 in the core, O*N2 default</td></tr>
<tr><td>Totally NSSA</td><td>Area 40, Surat: supplier 172.31.40.0/24</td><td>O*IA default, O N1 and O E1 with metric-type 1</td></tr>
<tr><td>Virtual link</td><td>R1 to R4 across area 1</td><td>R3 becomes an ABR, R4 pings 1.1.1.1</td></tr>
<tr><td>MD5 (ticket)</td><td>R1, R2, R3, areas 0 and 1</td><td>Area-level and interface-level MD5, a case-sensitive key typo</td></tr>
<tr><td>HMAC-SHA</td><td>DC1 and DC2</td><td>Key chain with hmac-sha-256, rollover to hmac-sha-512</td></tr>
</table>

<h3>Why this matters in real networks</h3>
<p>A large enterprise may carry thousands of external routes learned from BGP, partner links and data-centre redistribution. A small branch router with one uplink gains nothing from knowing all of them: every extra LSA costs memory, every change triggers SPF work, and every flap in the core ripples to the edge. Special area types let you shrink the database of those routers without losing reachability. Authentication makes sure that a laptop running routing software, or a misconnected lab router, cannot inject routes into production.</p>

<div class="eg"><p><b>Worked example.</b> A retail chain has 3,200 external routes in its OSPF domain and 180 inter-area summaries. Each of its 400 store routers sits in its own branch area with one uplink. As a normal area, every store router holds about 3,400 OSPF routes. As a totally stubby area, each holds its own 3 or 4 intra-area routes plus one default: about 99.9% fewer routes, with exactly the same forwarding result, because all traffic leaves through the one ABR anyway.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking that a stub area hides the branch from the rest of the network. Area types only filter what goes <b>into</b> the area. The branch's own networks still leave the area as type-3 LSAs, so the core always sees them.</p></div>

<div class="exam"><p><b>Exam trap.</b> The blueprint lists area types as backbone, normal, transit, stub, NSSA and totally stub. "Transit" is not a configuration keyword: it simply means a non-backbone area that a virtual link passes through. Be ready to say which area types can and cannot be transit areas.</p></div>

<div class="scn"><h4>The branch router that could not keep up</h4><p>A logistics company merged with a partner and redistributed the partner's 2,000 routes into OSPF at the core. Within a day, the smallest branch routers showed high CPU after every flap in the partner network, and one old model ran out of memory. The engineer checked <code>show ip ospf database database-summary</code> and saw more than 2,000 type-5 LSAs on routers that had a single uplink. The branch areas were converted to totally stubby areas. The database dropped to a handful of LSAs and the CPU spikes stopped.</p><p><b>Lesson:</b> area design is capacity planning. Keep external detail where it is needed and give the edges a default route.</p></div>

<div class="iv"><p class="q">"Why would you make an OSPF area a stub area?"</p><p>Strong answer: to shrink the LSDB and routing table of routers that have only one way out. A stub area blocks type-5 and type-4 LSAs and the ABR injects a type-3 default instead, so fewer LSAs, less SPF work and less memory, with the same forwarding. Mention the limits too: no ASBR inside, no virtual link through it, area 0 can never be stub, and every router in the area must agree on the stub flag.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>This module covers ENARSI objective 1.9: area types, router types, network types, virtual links, authentication and path preference.</li>
<li>ABRs act as gatekeepers: area types decide which LSAs they let into an area.</li>
<li>Stub and totally stubby areas swap external or inter-area detail for a default route.</li>
<li>NSSAs block type-5 but allow a local ASBR using type-7 LSAs.</li>
<li>Virtual links repair areas cut off from area 0; authentication stops rogue neighbours.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap decide kar paoge ki kaunse LSAs kisi area mein aa sakte hain aur database mein use prove kar paoge, stub, totally stubby, NSSA aur totally NSSA areas bana paoge, jo area backbone se kat gaya hai use virtual link se jod paoge, har adjacency ko plain-text, MD5 ya HMAC-SHA authentication se protect kar paoge (bina outage ke key rollover samet), Ethernet, hub-and-spoke aur NBMA links ke liye sahi OSPF network type chun paoge, exactly samjha paoge ki OSPF ek path ko doosre se zyada kyun pasand karta hai (O, O IA, E1, N1, E2, N2 aur forwarding metric), aur OSPFv3 address families troubleshoot kar paoge. Yeh <b>CCNP ENARSI 300-410 v1.1 blueprint ka objective 1.9</b> hai, aur exam ke sabse zyada test hone wale areas mein se ek hai.</p>

<h3>Prerequisites</h3>
<p>Aapko CCNP ENCOR OSPF module ka material pehle se aana chahiye: neighbours DOWN se FULL tak kaise jaate hain, DR aur BDR kya karte hain, basic LSA types, aur ABRs ke saath multi-area design kaise banate hain. Pehle ENARSI module ka structured troubleshooting method aur redistribution module ka idea (seed metrics, E1 vs E2) bhi comfortable hona chahiye. Hum inhe jaldi refresh karenge aur phir kaafi gehraai mein jayenge.</p>

<h3>Ek analogy: guarded gates wali housing society</h3>
<p>Ek badi housing society socho. Beech se jaane wali main road <b>area 0</b> hai, yaani backbone. Har colony (ek area) ka main road par ek gate hai, aur ek guard (<b>ABR</b>, area border router) decide karta hai ki bahar ke kaunse notices colony ke notice board par lagenge. Doosri colonies ke baare mein notices <b>type-3 summary LSAs</b> hain. Society ke bahar ki dukaano ke notices (doosre routing sources se aaye routes) <b>type-5 external LSAs</b> hain.</p>
<ul>
<li>Ek <b>stub</b> colony kehti hai: "Bahar ki dukaano ke notices yahan mat lagao. Bas ek board lagao: society ke bahar kuch bhi chahiye, gate par jao." Yeh board ek <b>default route</b> hai.</li>
<li>Ek <b>totally stubby</b> colony doosri colonies ke notices bhi hata deti hai. Sirf "gate par jao" wala board bachta hai.</li>
<li>Ek <b>not-so-stubby</b> colony (<b>NSSA</b>) bhi bahar ke notices mana karti hai, lekin uski apni ek chhoti dukaan hai jo partner se maal import karti hai. Woh us maal par ek local tag (<b>type-7</b>) lagati hai, aur guard colony se nikalte waqt uska label badal deta hai (<b>type-5</b>).</li>
<li>Jo colony main road par apne gate ke bina ban gayi, use padosi colony ke through ek private corridor chahiye. Woh corridor <b>virtual link</b> hai.</li>
<li>Aur aakhir mein, har resident ko gate par ID card dikhana padta hai. Yeh <b>authentication</b> hai.</li>
</ul>

<h3>Lab topology jo aap sabse zyada use karoge</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Branch, ABR aur core topology">
<rect x="10" y="40" width="255" height="150" rx="10" fill="#bbf7d0"/><text x="135" y="62" text-anchor="middle" class="svg-ink" font-size="13">Area X (51, 52, 30 ya 40)</text>
<rect x="330" y="40" width="300" height="150" rx="10" fill="#bae6fd"/><text x="490" y="62" text-anchor="middle" class="svg-ink" font-size="13">Area 0 (backbone)</text>
<rect x="35" y="90" width="115" height="50" rx="8" fill="#fde68a"/><text x="92" y="111" text-anchor="middle" class="svg-ink" font-size="13">BR 1.1.1.1</text><text x="92" y="129" text-anchor="middle" class="svg-muted" font-size="12">internal router</text>
<rect x="245" y="90" width="115" height="50" rx="8" fill="#ddd6fe"/><text x="302" y="111" text-anchor="middle" class="svg-ink" font-size="13">ABR 2.2.2.2</text><text x="302" y="129" text-anchor="middle" class="svg-muted" font-size="12">area border</text>
<rect x="495" y="90" width="115" height="50" rx="8" fill="#fed7aa"/><text x="552" y="111" text-anchor="middle" class="svg-ink" font-size="13">CORE 3.3.3.3</text><text x="552" y="129" text-anchor="middle" class="svg-muted" font-size="12">ASBR</text>
<line x1="150" y1="115" x2="245" y2="115" stroke="#64748b" stroke-width="2"/><text x="197" y="106" text-anchor="middle" class="svg-muted" font-size="12">10.X.12.0/30</text>
<line x1="360" y1="115" x2="495" y2="115" stroke="#64748b" stroke-width="2"/><text x="428" y="106" text-anchor="middle" class="svg-muted" font-size="12">10.0.23.0/30</text>
<text x="92" y="170" text-anchor="middle" class="svg-accent" font-size="12">LAN 192.168.X.0/24</text>
<text x="540" y="170" text-anchor="middle" class="svg-accent" font-size="12">203.0.113.0/24 + default</text>
</svg><p class="cap">Saat mein se chaar labs yahi trio use karti hain. CORE 203.0.113.0/24 redistribute karta hai aur default route originate karta hai, isliye jab tak aap area type nahi badalte, branch ko external routes dikhte hain.</p></div>

<h3>Saaton labs ek nazar mein</h3>
<table class="cmp"><tr><th>Lab</th><th>Area aur devices</th><th>Aap kya prove karte ho</th></tr>
<tr><td>Stub area</td><td>Area 51, Indore branch: BR, ABR, CORE</td><td>E2 routes gayab, O*IA default aata hai, default-cost 50 se metric 51</td></tr>
<tr><td>Totally stubby</td><td>Area 52, Kochi: BR, ABR, CORE</td><td>Sirf intra-area routes aur ek type-3 default bachte hain</td></tr>
<tr><td>NSSA</td><td>Area 30, Nagpur: partner 172.31.0.0/24</td><td>Andar O N2, core mein O E2, O*N2 default</td></tr>
<tr><td>Totally NSSA</td><td>Area 40, Surat: supplier 172.31.40.0/24</td><td>O*IA default, metric-type 1 ke saath O N1 aur O E1</td></tr>
<tr><td>Virtual link</td><td>Area 1 ke paar R1 se R4</td><td>R3 ABR banta hai, R4 1.1.1.1 ping karta hai</td></tr>
<tr><td>MD5 (ticket)</td><td>R1, R2, R3, areas 0 aur 1</td><td>Area-level aur interface-level MD5, case-sensitive key typo</td></tr>
<tr><td>HMAC-SHA</td><td>DC1 aur DC2</td><td>hmac-sha-256 wali key chain, hmac-sha-512 par rollover</td></tr>
</table>

<h3>Real networks mein yeh kyun matter karta hai</h3>
<p>Ek badi enterprise mein BGP, partner links aur data-centre redistribution se seekhe hue hazaaron external routes ho sakte hain. Ek uplink wale chhote branch router ko un sabko jaanne se kuch nahi milta: har extra LSA memory khaata hai, har change SPF ka kaam trigger karta hai, aur core ka har flap edge tak lehar ki tarah pahunchta hai. Special area types aapko un routers ka database chhota karne dete hain bina reachability khoye. Authentication pakka karta hai ki routing software chalane wala koi laptop, ya galat jude lab router, production mein routes inject na kar sake.</p>

<div class="eg"><p><b>Worked example.</b> Ek retail chain ke OSPF domain mein 3,200 external routes aur 180 inter-area summaries hain. Uske 400 store routers mein se har ek apne branch area mein ek uplink ke saath baitha hai. Normal area ke roop mein har store router lagbhag 3,400 OSPF routes rakhta hai. Totally stubby area ke roop mein har ek ke paas apne 3 ya 4 intra-area routes aur ek default hota hai: lagbhag 99.9% kam routes, bilkul same forwarding result ke saath, kyunki saara traffic waise bhi ek hi ABR se bahar jaata hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki stub area branch ko baaki network se chhupa deta hai. Area types sirf yeh filter karte hain ki area ke <b>andar</b> kya aaye. Branch ke apne networks ab bhi type-3 LSAs ke roop mein area se bahar jaate hain, isliye core ko woh hamesha dikhte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Blueprint area types ko backbone, normal, transit, stub, NSSA aur totally stub ke roop mein list karta hai. "Transit" koi configuration keyword nahi hai: iska matlab bas ek non-backbone area hai jiske through virtual link jaata hai. Ready raho yeh batane ke liye ki kaunse area types transit area ban sakte hain aur kaunse nahi.</p></div>

<div class="scn"><h4>Woh branch router jo sambhal nahi paaya</h4><p>Ek logistics company ne ek partner ke saath merger kiya aur core par partner ke 2,000 routes OSPF mein redistribute kar diye. Ek din ke andar sabse chhote branch routers partner network ke har flap ke baad high CPU dikhane lage, aur ek purane model ki memory khatam ho gayi. Engineer ne <code>show ip ospf database database-summary</code> check kiya aur ek uplink wale routers par 2,000 se zyada type-5 LSAs dekhe. Branch areas ko totally stubby areas mein convert kiya gaya. Database kuch hi LSAs tak gir gaya aur CPU spikes ruk gaye.</p><p><b>Lesson:</b> area design capacity planning hai. External detail wahin rakho jahan zaroorat hai aur edges ko default route do.</p></div>

<div class="iv"><p class="q">"Aap kisi OSPF area ko stub area kyun banaoge?"</p><p>Strong answer: un routers ka LSDB aur routing table chhota karne ke liye jinke paas bahar jaane ka ek hi raasta hai. Stub area type-5 aur type-4 LSAs ko rokta hai aur ABR uski jagah type-3 default inject karta hai, yaani kam LSAs, kam SPF kaam aur kam memory, same forwarding ke saath. Limits bhi batao: andar koi ASBR nahi, uske through virtual link nahi, area 0 kabhi stub nahi ho sakta, aur area ke har router ko stub flag par agree karna hoga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Yeh module ENARSI objective 1.9 cover karta hai: area types, router types, network types, virtual links, authentication aur path preference.</li>
<li>ABRs gatekeeper ki tarah kaam karte hain: area types decide karte hain ki woh kaunse LSAs area mein aane dein.</li>
<li>Stub aur totally stubby areas external ya inter-area detail ke badle default route dete hain.</li>
<li>NSSAs type-5 ko rokte hain lekin type-7 LSAs ke through local ASBR allow karte hain.</li>
<li>Virtual links area 0 se kate areas ko jodte hain; authentication rogue neighbours ko rokta hai.</li>
</ul></div>
`}};export{e as default};