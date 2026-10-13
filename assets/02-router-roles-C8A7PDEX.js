var e={id:`router-roles`,h:{en:`Router roles and the area 0 rule`,hi:`Router roles aur area 0 ka rule`},body:{en:`
<p>Picture a state road network. Most officers work inside one district. A few officers stand at district borders and hand over traffic to the next district. One or two stand at the national border and deal with other countries. All of them are officers, but the job depends on where the post is. OSPF routers are labelled the same way: by <b>where their interfaces sit</b>, not by hardware.</p>

<h3>The four roles</h3>
<div class="tbl"><table>
<tr><th>Role</th><th>Definition</th><th>Shows up as</th></tr>
<tr><td><b>Internal router</b></td><td>All OSPF interfaces are in one area (any area)</td><td>No role line in <code>show ip ospf</code></td></tr>
<tr><td><b>Backbone router</b></td><td>At least one OSPF interface is in area 0</td><td>An internal router inside area 0 is also a backbone router</td></tr>
<tr><td><b>ABR</b></td><td>OSPF interfaces in two or more areas, one of which is area 0</td><td><code>It is an area border router</code></td></tr>
<tr><td><b>ASBR</b></td><td>Injects routes learned outside OSPF (static, other protocol, default)</td><td><code>It is an autonomous system boundary router</code></td></tr>
</table></div>
<p>Roles can combine. One router can be an ABR and an ASBR at the same time; a router in area 0 that originates a default route is a backbone router and an ASBR. The role says nothing about the router model: a small branch router can be an ABR, and a big chassis can be a plain internal router.</p>

<h3>Our reference network</h3>
<p>The next chapters use one small network. R1 sits alone in area 1 and owns three LANs (172.16.1.0/24 to 172.16.3.0/24, built here as loopbacks so we do not need extra switches). R2 joins area 1 to area 0. R3 is in area 0 and also reaches an ISP, from which it will originate a default route.</p>
<div class="dia"><svg viewBox="0 0 680 210" role="img" aria-label="Reference network: R1 in area 1, R2 is the ABR, R3 in area 0 is the ASBR with an ISP">
<ellipse cx="150" cy="105" rx="120" ry="80" fill="#ddd6fe" stroke="#64748b" stroke-width="2" opacity="0.6"/>
<ellipse cx="400" cy="105" rx="130" ry="80" fill="#bae6fd" stroke="#64748b" stroke-width="2" opacity="0.6"/>
<text x="90" y="40" text-anchor="middle" class="svg-muted" font-size="12">Area 1</text><text x="420" y="40" text-anchor="middle" class="svg-muted" font-size="12">Area 0</text>
<line x1="95" y1="105" x2="215" y2="105" stroke="#64748b" stroke-width="2"/><line x1="215" y1="105" x2="395" y2="105" stroke="#64748b" stroke-width="2"/><line x1="395" y1="105" x2="560" y2="105" stroke="#64748b" stroke-width="2"/>
<rect x="55" y="85" width="80" height="40" rx="8" fill="#fff" stroke="#64748b"/><text x="95" y="103" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="95" y="117" text-anchor="middle" class="svg-muted" font-size="10">internal</text>
<rect x="175" y="85" width="80" height="40" rx="8" fill="#fff" stroke="#64748b"/><text x="215" y="103" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="215" y="117" text-anchor="middle" class="svg-accent" font-size="10">ABR</text>
<rect x="355" y="85" width="80" height="40" rx="8" fill="#fff" stroke="#64748b"/><text x="395" y="103" text-anchor="middle" class="svg-ink" font-size="13">R3</text><text x="395" y="117" text-anchor="middle" class="svg-accent" font-size="10">backbone + ASBR</text>
<rect x="520" y="85" width="80" height="40" rx="8" fill="#fff" stroke="#64748b"/><text x="560" y="108" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<text x="155" y="98" text-anchor="middle" class="svg-muted" font-size="10">10.0.12.0/30</text><text x="305" y="98" text-anchor="middle" class="svg-muted" font-size="10">10.0.23.0/30</text><text x="478" y="98" text-anchor="middle" class="svg-muted" font-size="10">203.0.113.0/30</text>
<text x="95" y="165" text-anchor="middle" class="svg-muted" font-size="10">LANs 172.16.1-3.0/24</text>
</svg><p class="cap">R2 has Gi0/0 in area 1 and Gi0/1 in area 0, so it is the ABR. R3 originates the default route, so it is the ASBR.</p></div>
<p>The simulator tells each router what it is:</p>
<pre class="out">R1# show ip ospf | include border|boundary|Number of areas
 Number of areas in this router is 1. 1 normal 0 stub 0 nssa

R2# show ip ospf | include border|boundary|Number of areas
<span class="hl"> It is an area border router</span>
 Number of areas in this router is 2. 2 normal 0 stub 0 nssa

R3# show ip ospf | include border|boundary|Number of areas
<span class="hl"> It is an autonomous system boundary router</span>
 Number of areas in this router is 1. 1 normal 0 stub 0 nssa</pre>
<p>R1 prints no role line: it is simply internal. R3 has only one area, so it is not an ABR, but it injects external routes, so it is an ASBR.</p>

<h3>Writing area IDs</h3>
<p>An area ID is a 32-bit number. IOS accepts it in decimal (<code>area 1</code>) or in dotted notation (<code>area 0.0.0.1</code>), and treats both as the same area. Area 0 is also 0.0.0.0, and <code>show</code> commands print it as <code>BACKBONE(0)</code>. Large networks like dotted IDs when area numbers follow addresses, for example area 10.20.0.0 for the 10.20.0.0/16 region. The ID has no relation to the interface address of the link.</p>

<h3>The area 0 rule</h3>
<p>Every ordinary area must have <b>at least one ABR with an interface in area 0</b>, and the backbone must be one connected piece. Why so strict? Inside an area, SPF guarantees loop-free paths because every router has the whole map. Between areas, an ABR only hands out prefixes and costs, like a distance-vector protocol. That is safe only if inter-area traffic always travels up to area 0 and down to the target area, never sideways between two ordinary areas. Area 0 is that fixed centre, and the ABR does not advertise one area's routes into another ordinary area unless it also has area 0.</p>
<ul>
<li>Two ordinary areas cannot be joined by a direct link and expect to exchange routes: they must each reach area 0.</li>
<li>The backbone must be <b>contiguous</b>. If area 0 splits into two islands, the islands do not exchange routes unless something repairs the gap.</li>
<li>Area 0 may be tiny: even one link between two ABRs can be the whole backbone.</li>
</ul>
<p>The standard repair for a broken backbone is a <b>virtual link</b>. It is a CCNP topic; for CCNA the correct answer is to fix the design, not to patch it.</p>

<div class="eg"><p><b>Worked example.</b> Classify four routers. W has Gi0/0 in area 0 and Gi0/1 in area 5: ABR and backbone router. X has all interfaces in area 5: internal router. Y has all interfaces in area 0 and a static default route redistributed into OSPF: backbone router and ASBR. Z has Gi0/0 in area 5 and Gi0/1 in area 7 and nothing in area 0: it is technically an area border router for two areas, but it cannot join them, because the area 0 rule is not met. Z is the classic 'ABR not touching area 0' fault.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Assuming that an ABR automatically connects any two areas. Without a leg in area 0, it does not. Typing the ID 0 and 00 and thinking they are different areas (they are not; 0 is area 0). Calling the ISP-facing router an ABR: an ABR is about OSPF areas, not about the edge of your company. And forgetting that a loopback in area 0 also counts as an interface in area 0: an ABR whose only area 0 interface is a loopback is flagged as an ABR but has no backbone neighbour.</p></div>

<div class="exam"><p><b>Exam traps.</b> ABR = interfaces in area 0 and in another area. ASBR = brings in external routes. A router can be both. An ordinary area needs a path to area 0. Area 0 is written 0 or 0.0.0.0. Stub, totally stubby and NSSA areas change how externals reach an area, and belong to CCNP ENARSI.</p></div>

<div class="scn"><h4>The ABR that was not</h4><p>A new branch router, BR5, was placed between the Pune area 3 and the new Goa area 7 to 'link them directly'. Both sides came up as FULL, yet Pune and Goa could not ping each other. <code>show ip ospf</code> on BR5 said 2 areas, but neither was area 0. The fix was to attach BR5 (or its neighbours) to the backbone at the data centre and let traffic go up to area 0 and down again.</p><p><b>Lesson:</b> the number of areas on a router does not make it a working ABR. The area 0 leg does.</p></div>

<div class="iv"><p class="q">'What is the difference between an ABR and an ASBR?'</p><p>Strong answer: an ABR has interfaces in area 0 and at least one other area, keeps a separate LSDB for each, and turns routes of one area into summaries for the others. An ASBR injects routes from outside OSPF, for example a static default route or another protocol, as external routes. They are about different boundaries and one router can be both.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Roles are decided by where a router's OSPF interfaces sit: internal, backbone, ABR, ASBR.</li>
<li>An ABR has area 0 plus at least one other area; an ASBR injects external routes; one router can be both.</li>
<li>Area IDs are 32 bits: 1 and 0.0.0.1 are the same area, and area 0 is the backbone.</li>
<li>Every ordinary area must reach area 0, and area 0 must be contiguous. Virtual links are a CCNP fix.</li>
</ul></div>
`,hi:`
<p>Ek state ke road network ki kalpana karo. Zyadatar officers ek district ke andar kaam karte hain. Kuch officers district ke border par khade hote hain aur traffic agle district ko saunpte hain. Ek-do national border par hote hain aur dusre deshon se nipatte hain. Sab officer hain, lekin kaam is baat par depend karta hai ki post kahan hai. OSPF routers ko bhi aise hi label kiya jaata hai: unke <b>interfaces kahan hain</b> us hisaab se, hardware se nahi.</p>

<h3>Chaar roles</h3>
<div class="tbl"><table>
<tr><th>Role</th><th>Definition</th><th>Kaise dikhta hai</th></tr>
<tr><td><b>Internal router</b></td><td>Saare OSPF interfaces ek hi area mein (kisi bhi area mein)</td><td><code>show ip ospf</code> mein koi role line nahi</td></tr>
<tr><td><b>Backbone router</b></td><td>Kam se kam ek OSPF interface area 0 mein</td><td>Area 0 ke andar ka internal router bhi backbone router hai</td></tr>
<tr><td><b>ABR</b></td><td>Do ya zyada areas mein OSPF interfaces, jinme se ek area 0</td><td><code>It is an area border router</code></td></tr>
<tr><td><b>ASBR</b></td><td>OSPF ke bahar se seekhe routes daalta hai (static, dusra protocol, default)</td><td><code>It is an autonomous system boundary router</code></td></tr>
</table></div>
<p>Roles mil sakte hain. Ek router ABR aur ASBR dono ek saath ho sakta hai; area 0 ka router jo default route originate kare, woh backbone router bhi hai aur ASBR bhi. Role router ke model ke baare mein kuch nahi batata: chhota branch router ABR ho sakta hai, aur bada chassis sirf internal router.</p>

<h3>Hamara reference network</h3>
<p>Agle chapters mein ek chhota network use hoga. R1 akela area 1 mein hai aur teen LANs ka maalik hai (172.16.1.0/24 se 172.16.3.0/24, yahan loopbacks ke roop mein banaye hain taaki extra switches na chahiye). R2 area 1 ko area 0 se jodta hai. R3 area 0 mein hai aur ISP tak bhi jaata hai, jahan se woh default route originate karega.</p>
<div class="dia"><svg viewBox="0 0 680 210" role="img" aria-label="Reference network: area 1 mein R1, R2 ABR hai, area 0 mein R3 jo ISP ke saath ASBR hai">
<ellipse cx="150" cy="105" rx="120" ry="80" fill="#ddd6fe" stroke="#64748b" stroke-width="2" opacity="0.6"/>
<ellipse cx="400" cy="105" rx="130" ry="80" fill="#bae6fd" stroke="#64748b" stroke-width="2" opacity="0.6"/>
<text x="90" y="40" text-anchor="middle" class="svg-muted" font-size="12">Area 1</text><text x="420" y="40" text-anchor="middle" class="svg-muted" font-size="12">Area 0</text>
<line x1="95" y1="105" x2="215" y2="105" stroke="#64748b" stroke-width="2"/><line x1="215" y1="105" x2="395" y2="105" stroke="#64748b" stroke-width="2"/><line x1="395" y1="105" x2="560" y2="105" stroke="#64748b" stroke-width="2"/>
<rect x="55" y="85" width="80" height="40" rx="8" fill="#fff" stroke="#64748b"/><text x="95" y="103" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="95" y="117" text-anchor="middle" class="svg-muted" font-size="10">internal</text>
<rect x="175" y="85" width="80" height="40" rx="8" fill="#fff" stroke="#64748b"/><text x="215" y="103" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="215" y="117" text-anchor="middle" class="svg-accent" font-size="10">ABR</text>
<rect x="355" y="85" width="80" height="40" rx="8" fill="#fff" stroke="#64748b"/><text x="395" y="103" text-anchor="middle" class="svg-ink" font-size="13">R3</text><text x="395" y="117" text-anchor="middle" class="svg-accent" font-size="10">backbone + ASBR</text>
<rect x="520" y="85" width="80" height="40" rx="8" fill="#fff" stroke="#64748b"/><text x="560" y="108" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<text x="155" y="98" text-anchor="middle" class="svg-muted" font-size="10">10.0.12.0/30</text><text x="305" y="98" text-anchor="middle" class="svg-muted" font-size="10">10.0.23.0/30</text><text x="478" y="98" text-anchor="middle" class="svg-muted" font-size="10">203.0.113.0/30</text>
<text x="95" y="165" text-anchor="middle" class="svg-muted" font-size="10">LANs 172.16.1-3.0/24</text>
</svg><p class="cap">R2 ka Gi0/0 area 1 mein aur Gi0/1 area 0 mein hai, isliye woh ABR hai. R3 default route originate karta hai, isliye woh ASBR hai.</p></div>
<p>Simulator har router ko batata hai ki woh kya hai:</p>
<pre class="out">R1# show ip ospf | include border|boundary|Number of areas
 Number of areas in this router is 1. 1 normal 0 stub 0 nssa

R2# show ip ospf | include border|boundary|Number of areas
<span class="hl"> It is an area border router</span>
 Number of areas in this router is 2. 2 normal 0 stub 0 nssa

R3# show ip ospf | include border|boundary|Number of areas
<span class="hl"> It is an autonomous system boundary router</span>
 Number of areas in this router is 1. 1 normal 0 stub 0 nssa</pre>
<p>R1 koi role line nahi dikhata: woh bas internal hai. R3 ke paas sirf ek area hai, isliye woh ABR nahi, lekin external routes daalta hai, isliye ASBR hai.</p>

<h3>Area IDs likhna</h3>
<p>Area ID 32-bit number hai. IOS ise decimal (<code>area 1</code>) ya dotted notation (<code>area 0.0.0.1</code>) mein leta hai, aur dono ko ek hi area maanta hai. Area 0 ka matlab 0.0.0.0 bhi hai, aur <code>show</code> commands ise <code>BACKBONE(0)</code> print karte hain. Bade networks dotted IDs pasand karte hain jab area numbers addresses ko follow karte hain, jaise 10.20.0.0/16 region ke liye area 10.20.0.0. ID ka link ke interface address se koi sambandh nahi.</p>

<h3>Area 0 ka rule</h3>
<p>Har ordinary area mein <b>kam se kam ek ABR ka interface area 0 mein</b> hona chahiye, aur backbone ek jura hua tukda hona chahiye. Itna sakht kyun? Area ke andar SPF loop-free paths guarantee karta hai kyunki har router ke paas poora map hai. Areas ke beech ABR sirf prefixes aur costs deta hai, jaise distance-vector protocol. Yeh tabhi safe hai jab inter-area traffic hamesha upar area 0 tak jaaye aur neeche target area tak, kabhi do ordinary areas ke beech side-ways nahi. Area 0 wahi fixed centre hai.</p>
<ul>
<li>Do ordinary areas ko seedhe link se jodkar routes exchange ki ummeed nahi kar sakte: dono ko area 0 tak pahunchna hoga.</li>
<li>Backbone <b>contiguous</b> hona chahiye. Agar area 0 do tapuon mein toot jaaye, to jab tak gap theek na ho tapu routes exchange nahi karte.</li>
<li>Area 0 chhota ho sakta hai: do ABRs ke beech ek link bhi poora backbone ho sakta hai.</li>
</ul>
<p>Toote backbone ka standard ilaaj <b>virtual link</b> hai. Yeh CCNP topic hai; CCNA mein sahi jawab design theek karna hai, patch lagana nahi.</p>

<div class="eg"><p><b>Worked example.</b> Chaar routers classify karo. W ka Gi0/0 area 0 mein aur Gi0/1 area 5 mein: ABR aur backbone router. X ke saare interfaces area 5 mein: internal router. Y ke saare interfaces area 0 mein aur ek static default route OSPF mein redistribute: backbone router aur ASBR. Z ka Gi0/0 area 5 mein, Gi0/1 area 7 mein, area 0 mein kuch nahi: technically do areas ka border router hai, lekin unhe jod nahi sakta, kyunki area 0 ka rule poora nahi hota. Yahi classic 'ABR not touching area 0' fault hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Maan lena ki ABR apne aap koi bhi do areas ko jod deta hai. Area 0 mein ek leg ke bina nahi jodta. ID 0 aur 00 ko alag areas samajhna (nahi hain; 0 matlab area 0). ISP-facing router ko ABR kehna: ABR OSPF areas ke baare mein hai, company ke edge ke baare mein nahi. Aur yeh bhoolna ki area 0 mein loopback bhi area 0 ka interface gina jaata hai: jis ABR ka area 0 mein sirf loopback ho, woh ABR flag ho jaata hai lekin uska koi backbone neighbour nahi hota.</p></div>

<div class="exam"><p><b>Exam traps.</b> ABR = area 0 aur dusre area mein interfaces. ASBR = external routes laata hai. Ek router dono ho sakta hai. Ordinary area ko area 0 tak path chahiye. Area 0 ko 0 ya 0.0.0.0 likhte hain. Stub, totally stubby aur NSSA areas badalte hain ki externals area tak kaise pahunchte hain, aur woh CCNP ENARSI ke hisse hain.</p></div>

<div class="scn"><h4>Woh ABR jo tha hi nahi</h4><p>Ek naya branch router BR5 Pune ke area 3 aur naye Goa area 7 ke beech 'seedha link karne' ke liye lagaya gaya. Dono taraf FULL aaya, phir bhi Pune aur Goa ek-dusre ko ping nahi kar paaye. BR5 par <code>show ip ospf</code> ne 2 areas bataye, lekin koi bhi area 0 nahi tha. Fix: BR5 (ya uske neighbours) ko data centre ke backbone se jodo aur traffic ko area 0 tak upar aur wapas neeche jaane do.</p><p><b>Seekh:</b> router par areas ki sankhya use working ABR nahi banati. Area 0 wala leg banata hai.</p></div>

<div class="iv"><p class="q">'ABR aur ASBR mein kya farak hai?'</p><p>Strong answer: ABR ke interfaces area 0 aur kam se kam ek dusre area mein hote hain, har area ka alag LSDB rakhta hai, aur ek area ke routes ko dusron ke liye summaries mein badalta hai. ASBR OSPF ke bahar ke routes, jaise static default route ya dusra protocol, external routes ke roop mein inject karta hai. Dono alag boundaries ke baare mein hain aur ek router dono ho sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Roles router ke OSPF interfaces ki jagah se tay hote hain: internal, backbone, ABR, ASBR.</li>
<li>ABR ke paas area 0 plus kam se kam ek aur area; ASBR external routes inject karta hai; ek router dono ho sakta hai.</li>
<li>Area IDs 32-bit hain: 1 aur 0.0.0.1 same area hain, aur area 0 backbone hai.</li>
<li>Har ordinary area ko area 0 tak pahunchna hai, aur area 0 contiguous hona chahiye. Virtual links CCNP ka fix hain.</li>
</ul></div>
`}};export{e as default};