var e={id:`ospf`,h:{en:`OSPF on a virtual router: areas, interfaces and verification`,hi:`Virtual router par OSPF: areas, interfaces aur verification`},body:{en:`
<p>OSPF is a link-state protocol: every router in an area builds the same map (the link-state database) and runs the SPF algorithm to find best paths. The theory is in enarsi-ospf and ccna-ospf. This chapter shows how a PAN-OS virtual router expresses it.</p>
<div class="note"><p><b>Note.</b> Everything in this chapter is a reference configuration (not run in the simulator). Names, areas and addresses are lab values.</p></div>
<h3>The pieces you configure</h3>
<ul>
<li><b>Router ID</b>: a 32-bit identifier, written like an IPv4 address. Set it explicitly on a firewall so it does not change.</li>
<li><b>Area</b>: a group of routers sharing a database. Area 0.0.0.0 is the backbone.</li>
<li><b>Interface settings</b>: enable, link type (broadcast, p2p, p2mp), metric, priority, timers, passive and authentication profile.</li>
<li><b>Auth profile</b>: MD5 or a password on the interface; both neighbours must match.</li>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="The firewall joins OSPF per interface; each interface is placed in an area and forms neighbours."><rect x="20" y="40" width="184" height="80" rx="10" fill="#bae6fd"/><text x="112" y="76" text-anchor="middle" class="svg-ink" font-size="14">Core router</text><text x="112" y="98" text-anchor="middle" class="svg-muted" font-size="12">area 0</text><line x1="204" y1="80" x2="228" y2="80" stroke="#64748b" stroke-width="2"/><rect x="228" y="40" width="184" height="80" rx="10" fill="#bbf7d0"/><text x="320" y="76" text-anchor="middle" class="svg-ink" font-size="14">Firewall VR</text><text x="320" y="98" text-anchor="middle" class="svg-muted" font-size="12">router-id 10.0.0.1</text><line x1="412" y1="80" x2="436" y2="80" stroke="#64748b" stroke-width="2"/><rect x="436" y="40" width="184" height="80" rx="10" fill="#ddd6fe"/><text x="528" y="76" text-anchor="middle" class="svg-ink" font-size="14">Branch router</text><text x="528" y="98" text-anchor="middle" class="svg-muted" font-size="12">area 1</text></svg><p class="cap">The firewall joins OSPF per interface; each interface is placed in an area and forms neighbours.</p></div>
</ul>
<h3>Minimal configuration</h3>
<pre class="code">set network virtual-router default protocol ospf enable yes
set network virtual-router default protocol ospf router-id 10.0.0.1
set network virtual-router default protocol ospf area 0.0.0.0 interface ethernet1/1 enable yes
set network virtual-router default protocol ospf area 0.0.0.0 interface ethernet1/1 link-type broadcast
set network virtual-router default protocol ospf area 0.0.0.0 interface ethernet1/1 metric 10
set network virtual-router default protocol ospf area 0.0.0.0 interface ethernet1/1 priority 1
set network virtual-router default protocol ospf area 0.0.0.0 interface ethernet1/3 passive yes
commit</pre>
<p>The default hello interval is 10 seconds, with dead counts of 4 (dead interval 40 seconds) and retransmit 5. Timers must match between neighbours, as must the area ID, the area type and authentication. Interface <code>ethernet1/3</code> above is a LAN where no router lives, so it is advertised but does not form neighbours (<b>passive</b>).</p>
<h3>Authentication</h3>
<pre class="code">set network virtual-router default protocol ospf auth-profile NK-OSPF md5 1 key CHANGE-ME-PLACEHOLDER
set network virtual-router default protocol ospf area 0.0.0.0 interface ethernet1/1 authentication NK-OSPF</pre>
<p>Use a long random key from your secrets vault, never a shared simple word. Rotate it with the neighbours in a change window.</p>
<h3>Area types</h3>
<ul>
<li><b>Normal</b>: accepts internal, summary and external routes.</li>
<li><b>Stub</b>: blocks external routes, injects a default route from the ABR.</li>
<li><b>NSSA</b>: allows a local redistribution inside a stub-like area (type 7 LSAs, converted to type 5 at the ABR).</li>
</ul>
<p>A firewall at the edge of a small branch is often placed in a stub area so it keeps a smaller table. A firewall that redistributes a static route into OSPF is an ASBR, so it cannot sit in a plain stub area.</p>
<h3>Ranges, virtual links and costs</h3>
<ul>
<li>An <b>area range</b> on the ABR summarises routes between areas.</li>
<li>A <b>virtual link</b> reconnects a disconnected area to the backbone; it is a fix, not a design.</li>
<li>The OSPF cost of an interface comes from the configured <b>metric</b>; there is no reference-bandwidth calculation to rely on, so set metrics deliberately.</li>
</ul>
<h3>Verification commands</h3>
<pre class="code">show routing protocol ospf summary
show routing protocol ospf neighbor
show routing protocol ospf interface
show routing protocol ospf lsdb
show routing route type ospf</pre>
<p>Look for neighbour state <b>Full</b> (or 2-Way with other routers on a broadcast segment between non-DR routers). A neighbour stuck in Init usually means one-way hellos; stuck in ExStart or Exchange often means an MTU mismatch.</p>
<h3>Traffic to the firewall itself</h3>
<p>OSPF packets arrive at the firewall like any other packet. The security policy and zones can drop them: an intrazone block override or a deny rule between zones will stop the adjacency even though the configuration is perfect. Allow the <code>ospf</code> application from the neighbour's zone to the interface zone.</p>
<div class="eg"><p><b>Worked example.</b> R-core (10.0.0.2) and the firewall (10.0.0.1) share 10.20.1.0/30 in area 0. The firewall also owns LAN 10.10.1.0/24 as a passive interface. After the neighbour reaches Full, the core router learns 10.10.1.0/24 as an OSPF route and the firewall learns the data centre routes with distance 30.</p></div>
<div class="warn"><p><b>Common mistake.</b> Forgetting to enable OSPF globally and per interface, or leaving a different hello and dead timer on one side. The neighbour never appears and the logs show nothing about it.</p></div>
<div class="exam"><p><b>Exam trap.</b> An area ID must match on both sides of a link, and a router in a stub area cannot be an ASBR. OSPF internal distance is 30.</p></div>
<div class="scn"><h4>Neighbour stuck in ExStart</h4><p>After a firewall replacement, the OSPF neighbour with the core stayed in ExStart. Hellos matched and authentication was right. The engineer compared the interface MTU: the new firewall used 1500 and the core 9000 on the same segment. Setting equal MTUs fixed it.</p><p><b>Lesson:</b> a stuck ExStart or Exchange state usually points to MTU, not to hello timers.</p></div>
<div class="iv"><p class="q">"A firewall must learn routes from a core router with OSPF. What do you configure and check?"</p><p>Enable OSPF in the virtual router with a fixed router ID, put the interface in the right area with matching timers and authentication, and mark LAN interfaces passive. Verify with show routing protocol ospf neighbor and the route table, and confirm the security policy allows the ospf application.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>OSPF on PAN-OS is enabled per virtual router and per interface in an area.</li><li>Set the router ID explicitly; area, timers, type and auth must match.</li><li>Passive interfaces advertise subnets without forming neighbours.</li><li>ExStart and Exchange often mean MTU; Init means one-way hellos.</li><li>Security policy can block OSPF to the firewall; allow the ospf application.</li></ul></div>
`,hi:`
<p>OSPF link-state protocol hai: area ka har router same map (link-state database) banata hai aur best paths nikalne ke liye SPF chalata hai. Theory enarsi-ospf aur ccna-ospf mein hai. Yeh chapter dikhata hai ki PAN-OS virtual router use kaise express karta hai.</p>
<div class="note"><p><b>Note.</b> Is chapter ka sab kuch reference configuration hai (simulator mein nahi chalta). Names, areas aur addresses lab values hain.</p></div>
<h3>Aap kya configure karte ho</h3>
<ul>
<li><b>Router ID</b>: 32-bit identifier, IPv4 address jaisa likha jaata hai. Firewall par ise explicitly set karo taaki badle nahi.</li>
<li><b>Area</b>: routers ka group jo ek database share karta hai. Area 0.0.0.0 backbone hai.</li>
<li><b>Interface settings</b>: enable, link type (broadcast, p2p, p2mp), metric, priority, timers, passive aur authentication profile.</li>
<li><b>Auth profile</b>: interface par MD5 ya password; dono neighbours mein match hona chahiye.</li>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Firewall OSPF mein interface ke hisaab se judta hai; har interface ek area mein hota hai aur neighbours banata hai."><rect x="20" y="40" width="184" height="80" rx="10" fill="#bae6fd"/><text x="112" y="76" text-anchor="middle" class="svg-ink" font-size="14">Core router</text><text x="112" y="98" text-anchor="middle" class="svg-muted" font-size="12">area 0</text><line x1="204" y1="80" x2="228" y2="80" stroke="#64748b" stroke-width="2"/><rect x="228" y="40" width="184" height="80" rx="10" fill="#bbf7d0"/><text x="320" y="76" text-anchor="middle" class="svg-ink" font-size="14">Firewall VR</text><text x="320" y="98" text-anchor="middle" class="svg-muted" font-size="12">router-id 10.0.0.1</text><line x1="412" y1="80" x2="436" y2="80" stroke="#64748b" stroke-width="2"/><rect x="436" y="40" width="184" height="80" rx="10" fill="#ddd6fe"/><text x="528" y="76" text-anchor="middle" class="svg-ink" font-size="14">Branch router</text><text x="528" y="98" text-anchor="middle" class="svg-muted" font-size="12">area 1</text></svg><p class="cap">Firewall OSPF mein interface ke hisaab se judta hai; har interface ek area mein hota hai aur neighbours banata hai.</p></div>
</ul>
<h3>Minimal configuration</h3>
<pre class="code">set network virtual-router default protocol ospf enable yes
set network virtual-router default protocol ospf router-id 10.0.0.1
set network virtual-router default protocol ospf area 0.0.0.0 interface ethernet1/1 enable yes
set network virtual-router default protocol ospf area 0.0.0.0 interface ethernet1/1 link-type broadcast
set network virtual-router default protocol ospf area 0.0.0.0 interface ethernet1/1 metric 10
set network virtual-router default protocol ospf area 0.0.0.0 interface ethernet1/1 priority 1
set network virtual-router default protocol ospf area 0.0.0.0 interface ethernet1/3 passive yes
commit</pre>
<p>Default hello interval 10 second hai, dead counts 4 (dead interval 40 second) aur retransmit 5. Neighbours ke beech timers match hone chahiye, area ID, area type aur authentication bhi. Upar <code>ethernet1/3</code> LAN hai jahan koi router nahi, isliye woh advertise hota hai par neighbour nahi banata (<b>passive</b>).</p>
<h3>Authentication</h3>
<pre class="code">set network virtual-router default protocol ospf auth-profile NK-OSPF md5 1 key CHANGE-ME-PLACEHOLDER
set network virtual-router default protocol ospf area 0.0.0.0 interface ethernet1/1 authentication NK-OSPF</pre>
<p>Secrets vault se lamba random key use karo, kabhi shared simple word nahi. Key neighbours ke saath change window mein rotate karo.</p>
<h3>Area types</h3>
<ul>
<li><b>Normal</b>: internal, summary aur external routes accept karta hai.</li>
<li><b>Stub</b>: external routes block karta hai, ABR se default route inject hota hai.</li>
<li><b>NSSA</b>: stub jaise area ke andar local redistribution allow karta hai (type 7 LSAs, ABR par type 5 mein convert).</li>
</ul>
<p>Chhote branch ke edge ka firewall aksar stub area mein rakha jaata hai taaki table chhota rahe. Jo firewall static route ko OSPF mein redistribute karta hai woh ASBR hai, isliye plain stub area mein nahi baith sakta.</p>
<h3>Ranges, virtual links aur costs</h3>
<ul>
<li>ABR par <b>area range</b> areas ke beech routes summarise karta hai.</li>
<li><b>Virtual link</b> kate hue area ko backbone se jodta hai; yeh fix hai, design nahi.</li>
<li>Interface ka OSPF cost configured <b>metric</b> se aata hai; reference-bandwidth calculation par bharosa mat karo, metrics soch-samajhkar set karo.</li>
</ul>
<h3>Verification commands</h3>
<pre class="code">show routing protocol ospf summary
show routing protocol ospf neighbor
show routing protocol ospf interface
show routing protocol ospf lsdb
show routing route type ospf</pre>
<p>Neighbour state <b>Full</b> dekho (broadcast segment par non-DR routers ke beech 2-Way normal hai). Init mein atka neighbour aam taur par one-way hellos dikhata hai; ExStart ya Exchange mein atka hona aksar MTU mismatch hota hai.</p>
<h3>Firewall tak aane wala traffic</h3>
<p>OSPF packets firewall par kisi bhi aur packet ki tarah aate hain. Security policy aur zones unhe drop kar sakte hain: intrazone block override ya zones ke beech deny rule adjacency rok dega chahe configuration perfect ho. Neighbour ke zone se interface zone tak <code>ospf</code> application allow karo.</p>
<div class="eg"><p><b>Worked example.</b> R-core (10.0.0.2) aur firewall (10.0.0.1) area 0 mein 10.20.1.0/30 share karte hain. Firewall ke paas LAN 10.10.1.0/24 passive interface hai. Neighbour Full hone ke baad core router 10.10.1.0/24 ko OSPF route ki tarah seekhta hai aur firewall data centre routes distance 30 ke saath seekhta hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> OSPF ko globally aur interface par enable karna bhoolna, ya ek side par alag hello aur dead timer chhod dena. Neighbour kabhi nahi dikhta aur logs kuch nahi batate.</p></div>
<div class="exam"><p><b>Exam trap.</b> Link ke dono sides par area ID match hona chahiye, aur stub area ka router ASBR nahi ho sakta. OSPF internal distance 30 hai.</p></div>
<div class="scn"><h4>Neighbour ExStart mein atka</h4><p>Firewall replacement ke baad core ke saath OSPF neighbour ExStart mein atka raha. Hellos match the aur authentication sahi tha. Engineer ne interface MTU compare kiya: naye firewall par 1500 aur same segment par core par 9000. MTU barabar karne se theek ho gaya.</p><p><b>Lesson:</b> ExStart ya Exchange mein atkna aam taur par MTU ki taraf ishara karta hai, hello timers ki taraf nahi.</p></div>
<div class="iv"><p class="q">"Firewall ko core router se OSPF se routes seekhne hain. Kya configure aur check karoge?"</p><p>Virtual router mein fixed router ID ke saath OSPF enable karo, interface ko sahi area mein matching timers aur authentication ke saath rakho, aur LAN interfaces passive karo. show routing protocol ospf neighbor aur route table se verify karo, aur confirm karo ki security policy ospf application allow karti hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>PAN-OS mein OSPF virtual router aur area ke interface par enable hota hai.</li><li>Router ID explicitly set karo; area, timers, type aur auth match hone chahiye.</li><li>Passive interfaces neighbour banaye bina subnets advertise karte hain.</li><li>ExStart aur Exchange aksar MTU hote hain; Init matlab one-way hellos.</li><li>Security policy firewall tak OSPF block kar sakti hai; ospf application allow karo.</li></ul></div>
`}};export{e as default};