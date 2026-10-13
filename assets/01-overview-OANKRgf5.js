var e={id:`overview`,h:{en:`Advanced IS-IS: what you will learn and the big picture`,hi:`Advanced IS-IS: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> IS-IS is the link-state IGP that many large providers and campus cores prefer. At JNCIP level you must go beyond "the adjacency is up". Over nine chapters you will: build multi-level designs, understand NETs, PDUs, the DIS and point-to-point links, choose metrics with wide metrics and a reference bandwidth, fix bad exits with route leaking, drain a router with the overload bit, redistribute routes between IS-IS, static and OSPF with export policies, and troubleshoot adjacencies and routes with a clear method. These match the IS-IS objectives of JN0-650. Check the current objectives on the Juniper certification page.</p>
<p><b>Prerequisites.</b> JNCIA-Junos and JNCIS-ENT level IS-IS: the NET format, L1 and L2 adjacencies, basic configuration with <code>family iso</code>, and routing policy basics. The Start here module and the OSPF module help but are not required.</p>

<h3>Analogy: local post offices and regional hubs</h3>
<p>A country's postal service has local post offices (<b>Level 1</b>) that know every street in their own district, and regional sorting hubs (<b>Level 2</b>) that know how to move mail between districts. A local office that cannot deliver a letter hands it to the nearest hub that is connected to the hub network: this is the <b>attached bit</b> and the default route. A hub that also acts as a local office is a <b>Level 1/Level 2 router</b>. The border between a district and the hub network is not inside a building. It is the road between them. In IS-IS the area border is on the link, and each router belongs to exactly one area.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Multi-level IS-IS lab topology">
<rect x="20" y="30" width="270" height="200" rx="14" fill="#bae6fd" opacity="0.7"/><text x="155" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 49.0001 (Level 1)</text>
<rect x="400" y="30" width="220" height="200" rx="14" fill="#ddd6fe" opacity="0.7"/><text x="510" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 49.0002</text>
<circle cx="70" cy="140" r="22" fill="#bbf7d0" stroke="#64748b"/><text x="70" y="144" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="70" y="180" text-anchor="middle" class="svg-muted" font-size="11">L1 only</text>
<circle cx="220" cy="85" r="22" fill="#fde68a" stroke="#64748b"/><text x="220" y="89" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<circle cx="220" cy="195" r="22" fill="#fde68a" stroke="#64748b"/><text x="220" y="199" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<circle cx="450" cy="140" r="22" fill="#fed7aa" stroke="#64748b"/><text x="450" y="144" text-anchor="middle" class="svg-ink" font-size="13">R4</text><text x="450" y="180" text-anchor="middle" class="svg-muted" font-size="11">L2 only</text>
<rect x="560" y="120" width="56" height="40" rx="6" fill="#e2e8f0" stroke="#64748b"/><text x="588" y="144" text-anchor="middle" class="svg-ink" font-size="12">SRV</text>
<line x1="92" y1="132" x2="198" y2="92" stroke="#64748b" stroke-width="2"/><line x1="92" y1="148" x2="198" y2="188" stroke="#64748b" stroke-width="2"/>
<line x1="242" y1="85" x2="428" y2="132" stroke="#64748b" stroke-width="2"/><line x1="242" y1="195" x2="428" y2="148" stroke="#64748b" stroke-width="2"/><line x1="472" y1="140" x2="560" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="220" y="125" text-anchor="middle" class="svg-muted" font-size="11">L1/L2</text><text x="220" y="235" text-anchor="middle" class="svg-muted" font-size="11">L1/L2</text>
</svg><p class="cap">The Nagpur lab: R2 and R3 are Level 1/Level 2 borders; the core R4 is Level 2 only.</p></div>

<h3>The module map</h3>
<table class="cmp"><tr><th>Chapter</th><th>Question it answers</th></tr>
<tr><td>2 Levels, areas and NETs</td><td>How is an IS-IS network structured?</td></tr>
<tr><td>3 PDUs, DIS and adjacencies</td><td>What does IS-IS send, and how do neighbours form?</td></tr>
<tr><td>4 Metrics</td><td>Narrow versus wide, reference bandwidth</td></tr>
<tr><td>5 Route leaking</td><td>How do I fix a bad exit from a Level 1 area?</td></tr>
<tr><td>6 Overload and attached bit</td><td>How do I drain a router, and where does the default come from?</td></tr>
<tr><td>7 Export policy</td><td>How do I move routes between IS-IS, static and OSPF?</td></tr>
<tr><td>8 Troubleshooting</td><td>How do I find an adjacency or route fault?</td></tr>
<tr><td>9 Summary</td><td>Checklist, glossary, cheat sheet</td></tr></table>

<h3>The lab devices</h3>
<p>In the Nagpur lab R1 (L1 only) reaches the data-centre LAN 172.20.4.0/24 through the borders R2 and R3 and the core router R4. In the Jaipur lab four L2-only routers form a ring in area 49.0077 with wide metrics, plus an OSPF-only router R5 that must be connected both ways. Router names are plain R1 to R5, loopbacks look like 10.1.255.1/32, and NETs like 49.0001.0100.0125.5001.00.</p>

<div class="eg"><p><b>Worked example.</b> In the Nagpur lab R1 has only a default route toward R2: <code>0.0.0.0/0 [IS-IS/15] metric 10</code>. R2 is the nearest attached router, but its uplink to the core is slow. After you leak the data-centre prefix into Level 1 on both borders, R1 shows <code>172.20.4.0/24 [IS-IS/15] metric 40</code> through R3 (10.1.13.3). The destination did not move; R1 simply got enough information to choose well.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting <code>family iso</code> on an interface, or the NET on the loopback. IS-IS does not run over IP, so without the iso family there are no hellos at all.</p></div>
<div class="exam"><p><b>Exam trap.</b> IS-IS routers belong to an area (the NET), not the interface. Two routers with different area IDs can still form a Level 2 adjacency, but not a Level 1 adjacency.</p></div>

<div class="scn"><h4>The core with no level plan</h4><p>A provider enabled IS-IS on all interfaces of all routers with defaults. Every link ran both Level 1 and Level 2. The databases were duplicated, SPF ran twice for every change, and nobody could say which routers formed the backbone. A redesign made the core L2-only, the access routers L1-only, and the borders L1/L2. Table sizes and CPU load fell sharply.</p><p><b>Lesson:</b> choose a level for every router and link on purpose.</p></div>

<div class="iv"><p class="q">"How is the IS-IS area border different from OSPF?"</p><p>In OSPF the border is inside a router, the ABR, whose interfaces are in different areas. In IS-IS each router is in exactly one area (from its NET) and the border lies on the link between areas. L1/L2 routers connect Level 1 areas to the Level 2 backbone, which must be contiguous.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>This module covers JN0-650 IS-IS: levels, NETs, PDUs, metrics, leaking, overload, export, troubleshooting.</li>
<li>IS-IS runs directly on Layer 2 and needs family iso and a NET.</li>
<li>Level 1 areas hang off a contiguous Level 2 backbone; the border is on the link.</li>
<li>L1/L2 routers stitch levels together and set the attached bit.</li>
<li>Labs: Nagpur (leaking) and Jaipur (overload, export, redistribution).</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> IS-IS woh link-state IGP hai jo bahut se bade providers aur campus cores prefer karte hain. JNCIP level par "adjacency up hai" se aage jaana padta hai. Nau chapters mein aap: multi-level designs banaoge, NETs, PDUs, DIS aur point-to-point links samjhoge, wide metrics aur reference bandwidth se metrics chunoge, route leaking se bad exits theek karoge, overload bit se router drain karoge, export policies se IS-IS, static aur OSPF ke beech routes redistribute karoge, aur saaf method se adjacencies aur routes troubleshoot karoge. Yeh JN0-650 ke IS-IS objectives se milte hain. Current objectives Juniper certification page par dekho.</p>
<p><b>Prerequisites.</b> JNCIA-Junos aur JNCIS-ENT level IS-IS: NET format, L1 aur L2 adjacencies, <code>family iso</code> ke saath basic configuration, aur routing policy basics. Start here module aur OSPF module madad karte hain par zaroori nahi.</p>

<h3>Analogy: local post offices aur regional hubs</h3>
<p>Desh ki postal service mein local post offices (<b>Level 1</b>) apne district ki har gali jaante hain, aur regional sorting hubs (<b>Level 2</b>) jaante hain ki districts ke beech mail kaise jaye. Jo local office letter deliver nahi kar sakta woh use sabse nazdeeki hub ko deta hai jo hub network se juda hai: yahi <b>attached bit</b> aur default route hai. Jo hub local office ka kaam bhi karta hai woh <b>Level 1/Level 2 router</b> hai. District aur hub network ke beech ki seema kisi building ke andar nahi hoti. Woh unke beech ki sadak hai. IS-IS mein area border link par hota hai, aur har router bilkul ek area ka hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Multi-level IS-IS lab topology">
<rect x="20" y="30" width="270" height="200" rx="14" fill="#bae6fd" opacity="0.7"/><text x="155" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 49.0001 (Level 1)</text>
<rect x="400" y="30" width="220" height="200" rx="14" fill="#ddd6fe" opacity="0.7"/><text x="510" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 49.0002</text>
<circle cx="70" cy="140" r="22" fill="#bbf7d0" stroke="#64748b"/><text x="70" y="144" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="70" y="180" text-anchor="middle" class="svg-muted" font-size="11">sirf L1</text>
<circle cx="220" cy="85" r="22" fill="#fde68a" stroke="#64748b"/><text x="220" y="89" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<circle cx="220" cy="195" r="22" fill="#fde68a" stroke="#64748b"/><text x="220" y="199" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<circle cx="450" cy="140" r="22" fill="#fed7aa" stroke="#64748b"/><text x="450" y="144" text-anchor="middle" class="svg-ink" font-size="13">R4</text><text x="450" y="180" text-anchor="middle" class="svg-muted" font-size="11">sirf L2</text>
<rect x="560" y="120" width="56" height="40" rx="6" fill="#e2e8f0" stroke="#64748b"/><text x="588" y="144" text-anchor="middle" class="svg-ink" font-size="12">SRV</text>
<line x1="92" y1="132" x2="198" y2="92" stroke="#64748b" stroke-width="2"/><line x1="92" y1="148" x2="198" y2="188" stroke="#64748b" stroke-width="2"/>
<line x1="242" y1="85" x2="428" y2="132" stroke="#64748b" stroke-width="2"/><line x1="242" y1="195" x2="428" y2="148" stroke="#64748b" stroke-width="2"/><line x1="472" y1="140" x2="560" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="220" y="125" text-anchor="middle" class="svg-muted" font-size="11">L1/L2</text><text x="220" y="235" text-anchor="middle" class="svg-muted" font-size="11">L1/L2</text>
</svg><p class="cap">Nagpur lab: R2 aur R3 Level 1/Level 2 borders hain; core R4 sirf Level 2 hai.</p></div>

<h3>Module map</h3>
<table class="cmp"><tr><th>Chapter</th><th>Kaunsa sawal solve karta hai</th></tr>
<tr><td>2 Levels, areas aur NETs</td><td>IS-IS network ka structure kaisa hota hai?</td></tr>
<tr><td>3 PDUs, DIS aur adjacencies</td><td>IS-IS kya bhejta hai, aur neighbours kaise bante hain?</td></tr>
<tr><td>4 Metrics</td><td>Narrow versus wide, reference bandwidth</td></tr>
<tr><td>5 Route leaking</td><td>Level 1 area se bad exit kaise theek karun?</td></tr>
<tr><td>6 Overload aur attached bit</td><td>Router drain kaise karun, aur default kahan se aata hai?</td></tr>
<tr><td>7 Export policy</td><td>IS-IS, static aur OSPF ke beech routes kaise bhejun?</td></tr>
<tr><td>8 Troubleshooting</td><td>Adjacency ya route fault kaise dhoondhun?</td></tr>
<tr><td>9 Summary</td><td>Checklist, glossary, cheat sheet</td></tr></table>

<h3>Lab devices</h3>
<p>Nagpur lab mein R1 (sirf L1) data-centre LAN 172.20.4.0/24 tak borders R2 aur R3 aur core router R4 ke through pahunchta hai. Jaipur lab mein chaar L2-only routers area 49.0077 mein wide metrics ke saath ring banate hain, plus OSPF-only router R5 jise dono taraf se jodna hai. Router naam seedhe R1 se R5, loopbacks 10.1.255.1/32 jaise, aur NETs 49.0001.0100.0125.5001.00 jaise.</p>

<div class="eg"><p><b>Worked example.</b> Nagpur lab mein R1 ke paas sirf R2 ki taraf default route hai: <code>0.0.0.0/0 [IS-IS/15] metric 10</code>. R2 sabse nazdeeki attached router hai, par uska core uplink dheema hai. Data-centre prefix ko dono borders par Level 1 mein leak karne ke baad R1 <code>172.20.4.0/24 [IS-IS/15] metric 40</code> R3 (10.1.13.3) ke through dikhata hai. Destination nahi hila; R1 ko bas achha chunne ke liye kaafi information mil gayi.</p></div>

<div class="warn"><p><b>Common mistake.</b> Interface par <code>family iso</code> ya loopback par NET bhool jaana. IS-IS IP par nahi chalta, isliye iso family ke bina hellos bilkul nahi jaate.</p></div>
<div class="exam"><p><b>Exam trap.</b> IS-IS routers area (NET) ke hote hain, interface ke nahi. Alag area IDs wale do routers Level 2 adjacency bana sakte hain, Level 1 nahi.</p></div>

<div class="scn"><h4>Core jisme level plan nahi tha</h4><p>Ek provider ne saare routers ke saare interfaces par defaults ke saath IS-IS enable kiya. Har link par Level 1 aur Level 2 dono chalte the. Databases duplicate the, har change par SPF do baar chalta tha, aur koi nahi bata sakta tha ki backbone kaun se routers hain. Redesign mein core L2-only, access routers L1-only aur borders L1/L2 banaye gaye. Table sizes aur CPU load kaafi gir gaye.</p><p><b>Lesson:</b> har router aur link ke liye level jaanbujhkar chuno.</p></div>

<div class="iv"><p class="q">"IS-IS ka area border OSPF se kaise alag hai?"</p><p>OSPF mein border router ke andar hota hai, ABR, jiske interfaces alag areas mein hote hain. IS-IS mein har router bilkul ek area (apne NET se) ka hota hai aur border areas ke beech ke link par hota hai. L1/L2 routers Level 1 areas ko Level 2 backbone se jodte hain, jo contiguous hona chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Yeh module JN0-650 IS-IS cover karta hai: levels, NETs, PDUs, metrics, leaking, overload, export, troubleshooting.</li>
<li>IS-IS seedha Layer 2 par chalta hai aur family iso tatha NET chahiye.</li>
<li>Level 1 areas contiguous Level 2 backbone se latakte hain; border link par hai.</li>
<li>L1/L2 routers levels ko jodte hain aur attached bit set karte hain.</li>
<li>Labs: Nagpur (leaking) aur Jaipur (overload, export, redistribution).</li>
</ul></div>
`}};export{e as default};