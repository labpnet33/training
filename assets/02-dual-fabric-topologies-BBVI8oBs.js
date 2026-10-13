var e={id:`dual-fabric-topologies`,h:{en:`Dual-fabric A/B design, core-edge and collapsed-core SAN, MDS 9000 selection`,hi:`Dual-fabric A/B design, core-edge aur collapsed-core SAN, MDS 9000 selection`},body:{en:`
<p>In chapter 1 you saw two fabrics in a picture. In this chapter you learn why they exist, how to lay out each one, and how to pick the MDS 9000 hardware, using a customer who learned the hard way.</p>

<h3>The case: Harbor Mutual Insurance</h3>
<div class="eg"><p><b>Customer.</b> Harbor Mutual, a mid-size insurer. Today: 220 servers (VMware and bare-metal AIX), three storage arrays, 16G FC, one fabric built from two switches joined by two ISLs.</p><p><b>Trigger.</b> A technician loaded a wrong zone set during a change window. Every server lost its storage for 38 minutes, because there was only one fabric, and one zoning database.</p><p><b>Requirements.</b> No single fabric-wide failure domain; 32G readiness; room for 400 server ports in three years; two change windows a year; budget approved for four director-class or fixed switches per site.</p><p><b>Constraints.</b> Two server rooms, 60 metres apart; fibre is already pulled to both; existing arrays have 16G ports.</p></div>

<h3>Why two fabrics: failure domains</h3>
<p>A <b>fabric</b> is one or more FC switches joined together that share one set of services: the principal switch, the name server, the zoning database, FSPF routing. Those shared services are exactly why one bad zone set, one runaway RSCN storm or one misconfigured domain ID can bring down every device. The cure is a <b>dual-fabric (A/B) design</b>: two completely separate fabrics, with no ISL between A and B. Each host has at least two HBA ports, one to each fabric; each array has ports from both controllers in both fabrics. Multipathing software in the host chooses the live path.</p>
<p>The rule of thumb: <b>treat A and B as two independent networks that happen to reach the same devices</b>. Different switches, different power feeds, different cable trays, different change windows. You change fabric A on Tuesday, check for a week, then change B.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Core-edge SAN with fabric A and B">
<text x="320" y="16" text-anchor="middle" class="svg-muted" font-size="12">No link between Fabric A and Fabric B</text>
<rect x="30" y="30" width="270" height="250" rx="10" fill="#f0fdf4" stroke="#64748b" stroke-dasharray="4 3"/>
<rect x="340" y="30" width="270" height="250" rx="10" fill="#fffbeb" stroke="#64748b" stroke-dasharray="4 3"/>
<text x="165" y="50" text-anchor="middle" class="svg-ink" font-size="13">Fabric A (VSAN 10)</text>
<text x="475" y="50" text-anchor="middle" class="svg-ink" font-size="13">Fabric B (VSAN 20)</text>
<rect x="100" y="150" width="130" height="36" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="165" y="173" text-anchor="middle" class="svg-ink" font-size="12">Core A (array side)</text>
<rect x="410" y="150" width="130" height="36" rx="6" fill="#fde68a" stroke="#64748b"/><text x="475" y="173" text-anchor="middle" class="svg-ink" font-size="12">Core B (array side)</text>
<rect x="50" y="70" width="90" height="34" rx="6" fill="#fed7aa" stroke="#64748b"/><text x="95" y="92" text-anchor="middle" class="svg-ink" font-size="12">Edge A1</text>
<rect x="190" y="70" width="90" height="34" rx="6" fill="#fed7aa" stroke="#64748b"/><text x="235" y="92" text-anchor="middle" class="svg-ink" font-size="12">Edge A2</text>
<rect x="360" y="70" width="90" height="34" rx="6" fill="#fed7aa" stroke="#64748b"/><text x="405" y="92" text-anchor="middle" class="svg-ink" font-size="12">Edge B1</text>
<rect x="500" y="70" width="90" height="34" rx="6" fill="#fed7aa" stroke="#64748b"/><text x="545" y="92" text-anchor="middle" class="svg-ink" font-size="12">Edge B2</text>
<line x1="95" y1="104" x2="140" y2="150" stroke="#64748b" stroke-width="2"/><line x1="235" y1="104" x2="190" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="405" y1="104" x2="450" y2="150" stroke="#64748b" stroke-width="2"/><line x1="545" y1="104" x2="500" y2="150" stroke="#64748b" stroke-width="2"/>
<rect x="90" y="225" width="150" height="34" rx="6" fill="#ddd6fe" stroke="#64748b"/><text x="165" y="247" text-anchor="middle" class="svg-ink" font-size="12">Array ctrl 1 / 2</text>
<rect x="400" y="225" width="150" height="34" rx="6" fill="#ddd6fe" stroke="#64748b"/><text x="475" y="247" text-anchor="middle" class="svg-ink" font-size="12">Array ctrl 1 / 2</text>
<line x1="165" y1="186" x2="165" y2="225" stroke="#64748b" stroke-width="2"/><line x1="475" y1="186" x2="475" y2="225" stroke="#64748b" stroke-width="2"/>
<text x="95" y="124" text-anchor="middle" class="svg-muted" font-size="11">hosts</text><text x="235" y="124" text-anchor="middle" class="svg-muted" font-size="11">hosts</text><text x="405" y="124" text-anchor="middle" class="svg-muted" font-size="11">hosts</text><text x="545" y="124" text-anchor="middle" class="svg-muted" font-size="11">hosts</text>
</svg><p class="cap">Green and amber are the two fabrics; orange switches are edge, ISLs run up to the core; arrays attach to the core.</p></div>

<h3>Topology options</h3>
<ul>
<li><b>Collapsed core.</b> One tier. Hosts and storage both plug into the same pair (A and B) of switches, often director-class like the MDS 9706 or 9710. Simple, fewest hops, no ISL oversubscription. Limit: port count of the chassis.</li>
<li><b>Core-edge.</b> Edge switches (fixed or blade-server style) connect hosts; core switches connect storage and ISLs. Scales to hundreds of host ports; ISL oversubscription must be calculated (chapter 4).</li>
<li><b>Edge-core-edge.</b> Hosts on one edge, storage on another edge, a core in the middle. Used for very large or multi-site layouts, at the cost of extra hops and ISLs.</li>
</ul>

<table class="cmp"><tr><th>Topology</th><th>Hops host to array</th><th>Best for</th><th>Risk</th></tr>
<tr><td>Collapsed core</td><td>1 switch</td><td>Up to a few hundred ports</td><td>Chassis port limit</td></tr>
<tr><td>Core-edge</td><td>2 switches</td><td>Hundreds to low thousands of ports</td><td>ISL oversubscription</td></tr>
<tr><td>Edge-core-edge</td><td>3 switches</td><td>Very large, multi-building</td><td>Latency, complexity</td></tr>
</table>

<h3>Choosing the MDS 9000 hardware</h3>
<p>Match the platform to port count, speed and growth. Fixed 1RU/2RU switches (for example MDS 9148T and 9396T, 32G) suit edge or small collapsed-core designs. Modular directors (MDS 9706, 9710, 9718) suit collapsed core with many ports, dual supervisors, redundant fabric modules and in-service software upgrade. Design checks: line cards with enough 32G ports, a supervisor pair for control-plane HA, power supplies on separate feeds, and licences for the features you need (for example FCIP, enterprise features, SAN analytics). Always confirm current models and licences in the Cisco documentation; part numbers change.</p>

<h3>Chosen design for Harbor Mutual</h3>
<p>Two collapsed-core fabrics, one MDS 9706 per room, not connected to each other. Fabric A in room 1, fabric B in room 2, each in its own VSAN. Servers get two HBAs; arrays get controller ports in both. 16G array ports negotiate down; 32G host ports will be used as arrays are refreshed. Growth to 400 ports is within one 9706 per fabric. Each fabric has its own domain ID plan and its own change calendar.</p>
<pre class="out">switch-a# show vsan
vsan 10 information
         name:HARBOR-A  state:active
         <span class="hl">interoperability mode:default</span>
         loadbalancing:src-id/dst-id/oxid
         operational state:up</pre>

<div class="warn"><p><b>Common mistake.</b> Cabling a cross-link "just for management" between A and B, or merging fabrics through a shared VSAN trunk. You have recreated one failure domain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Dual fabric is not the same as two ISLs. Two ISLs protect against a link failure inside one fabric; fabrics A and B protect against fabric-wide faults such as zoning errors, RSCN storms and software upgrades.</p></div>

<div class="scn"><h4>The 38-minute zoning outage</h4><p>At Harbor Mutual the engineer activated a zone set from a stale text file; the new set omitted 14 database initiators. RSCNs fired, hosts logged out of zones, and all 220 servers lost disks at once. Recovery was a re-activation of the previous zone set. After the redesign the same mistake on fabric A would have left fabric B untouched; multipathing would have kept every server running on the B paths.</p><p><b>Lesson:</b> the cost of the second fabric is small compared with the cost of one fabric-wide change error.</p></div>

<div class="iv"><p class="q">"Why not connect fabric A and fabric B for flexibility?"</p><p>Strong answer: the entire value of A/B is isolated failure domains. A cross-connection shares the name server, zoning and RSCN propagation, so one error spreads. Flexibility comes from multipathing on the host, not from joining fabrics.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A fabric is one set of shared services; protect against fabric-wide faults with a second, isolated fabric.</li>
<li>Collapsed core is simplest; core-edge scales; edge-core-edge is for very large sites.</li>
<li>Pick fixed MDS for small or edge roles and director-class for large collapsed cores.</li>
<li>Separate power, cabling and change windows for A and B.</li>
</ul></div>
`,hi:`
<p>Chapter 1 mein aapne ek picture mein do fabrics dekhe. Is chapter mein seekhoge ki woh kyun hote hain, har fabric ko kaise lay out karte hain, aur MDS 9000 hardware kaise chunte hain, ek aise customer ke saath jisne mushkil tareeke se seekha.</p>

<h3>Case: Harbor Mutual Insurance</h3>
<div class="eg"><p><b>Customer.</b> Harbor Mutual, ek mid-size insurer. Abhi: 220 servers (VMware aur bare-metal AIX), teen storage arrays, 16G FC, ek hi fabric jo do switches se bana hai aur do ISLs se juda hai.</p><p><b>Trigger.</b> Change window mein ek technician ne galat zone set load kar diya. Saare servers 38 minute tak storage se kat gaye, kyunki sirf ek fabric tha, aur ek hi zoning database.</p><p><b>Requirements.</b> Koi single fabric-wide failure domain nahi; 32G readiness; teen saal mein 400 server ports ki jagah; saal mein do change windows; har site par chaar director-class ya fixed switches ka budget approved.</p><p><b>Constraints.</b> Do server rooms, 60 metre door; dono mein fibre pehle se khinchi hai; existing arrays ke ports 16G hain.</p></div>

<h3>Do fabrics kyun: failure domains</h3>
<p><b>Fabric</b> ek ya zyada FC switches ka group hai jo ek hi shared services set share karte hain: principal switch, name server, zoning database, FSPF routing. Yahi shared services wajah hain ki ek galat zone set, ek runaway RSCN storm ya ek galat domain ID har device ko gira sakta hai. Ilaaj hai <b>dual-fabric (A/B) design</b>: do bilkul alag fabrics, A aur B ke beech koi ISL nahi. Har host ke kam se kam do HBA ports hote hain, har fabric mein ek; har array ke dono controllers ke ports dono fabrics mein hote hain. Host ka multipathing software live path chunta hai.</p>
<p>Rule of thumb: <b>A aur B ko do independent networks maano jo ittefaq se same devices tak pahunchte hain</b>. Alag switches, alag power feeds, alag cable trays, alag change windows. Fabric A mangalwar ko badlo, ek hafta check karo, phir B badlo.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Fabric A aur B ke saath core-edge SAN">
<text x="320" y="16" text-anchor="middle" class="svg-muted" font-size="12">Fabric A aur Fabric B ke beech koi link nahi</text>
<rect x="30" y="30" width="270" height="250" rx="10" fill="#f0fdf4" stroke="#64748b" stroke-dasharray="4 3"/>
<rect x="340" y="30" width="270" height="250" rx="10" fill="#fffbeb" stroke="#64748b" stroke-dasharray="4 3"/>
<text x="165" y="50" text-anchor="middle" class="svg-ink" font-size="13">Fabric A (VSAN 10)</text>
<text x="475" y="50" text-anchor="middle" class="svg-ink" font-size="13">Fabric B (VSAN 20)</text>
<rect x="100" y="150" width="130" height="36" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="165" y="173" text-anchor="middle" class="svg-ink" font-size="12">Core A (array side)</text>
<rect x="410" y="150" width="130" height="36" rx="6" fill="#fde68a" stroke="#64748b"/><text x="475" y="173" text-anchor="middle" class="svg-ink" font-size="12">Core B (array side)</text>
<rect x="50" y="70" width="90" height="34" rx="6" fill="#fed7aa" stroke="#64748b"/><text x="95" y="92" text-anchor="middle" class="svg-ink" font-size="12">Edge A1</text>
<rect x="190" y="70" width="90" height="34" rx="6" fill="#fed7aa" stroke="#64748b"/><text x="235" y="92" text-anchor="middle" class="svg-ink" font-size="12">Edge A2</text>
<rect x="360" y="70" width="90" height="34" rx="6" fill="#fed7aa" stroke="#64748b"/><text x="405" y="92" text-anchor="middle" class="svg-ink" font-size="12">Edge B1</text>
<rect x="500" y="70" width="90" height="34" rx="6" fill="#fed7aa" stroke="#64748b"/><text x="545" y="92" text-anchor="middle" class="svg-ink" font-size="12">Edge B2</text>
<line x1="95" y1="104" x2="140" y2="150" stroke="#64748b" stroke-width="2"/><line x1="235" y1="104" x2="190" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="405" y1="104" x2="450" y2="150" stroke="#64748b" stroke-width="2"/><line x1="545" y1="104" x2="500" y2="150" stroke="#64748b" stroke-width="2"/>
<rect x="90" y="225" width="150" height="34" rx="6" fill="#ddd6fe" stroke="#64748b"/><text x="165" y="247" text-anchor="middle" class="svg-ink" font-size="12">Array ctrl 1 / 2</text>
<rect x="400" y="225" width="150" height="34" rx="6" fill="#ddd6fe" stroke="#64748b"/><text x="475" y="247" text-anchor="middle" class="svg-ink" font-size="12">Array ctrl 1 / 2</text>
<line x1="165" y1="186" x2="165" y2="225" stroke="#64748b" stroke-width="2"/><line x1="475" y1="186" x2="475" y2="225" stroke="#64748b" stroke-width="2"/>
<text x="95" y="124" text-anchor="middle" class="svg-muted" font-size="11">hosts</text><text x="235" y="124" text-anchor="middle" class="svg-muted" font-size="11">hosts</text><text x="405" y="124" text-anchor="middle" class="svg-muted" font-size="11">hosts</text><text x="545" y="124" text-anchor="middle" class="svg-muted" font-size="11">hosts</text>
</svg><p class="cap">Hara aur amber do fabrics hain; orange switches edge hain, ISLs upar core tak jaati hain; arrays core se lagte hain.</p></div>

<h3>Topology options</h3>
<ul>
<li><b>Collapsed core.</b> Ek tier. Hosts aur storage dono ek hi switches ki pair (A aur B) se lagte hain, aksar director-class jaise MDS 9706 ya 9710. Simple, sabse kam hops, ISL oversubscription nahi. Limit: chassis ka port count.</li>
<li><b>Core-edge.</b> Edge switches (fixed ya blade-server style) hosts ko jodte hain; core switches storage aur ISLs ko. Sainkdon host ports tak scale hota hai; ISL oversubscription calculate karna padta hai (chapter 4).</li>
<li><b>Edge-core-edge.</b> Hosts ek edge par, storage doosre edge par, beech mein core. Bahut bade ya multi-site layouts ke liye, extra hops aur ISLs ki keemat par.</li>
</ul>

<table class="cmp"><tr><th>Topology</th><th>Host se array hops</th><th>Best for</th><th>Risk</th></tr>
<tr><td>Collapsed core</td><td>1 switch</td><td>Kuch sau ports tak</td><td>Chassis port limit</td></tr>
<tr><td>Core-edge</td><td>2 switches</td><td>Sau se kuch hazaar ports</td><td>ISL oversubscription</td></tr>
<tr><td>Edge-core-edge</td><td>3 switches</td><td>Bahut bade, multi-building</td><td>Latency, complexity</td></tr>
</table>

<h3>MDS 9000 hardware chunna</h3>
<p>Platform ko port count, speed aur growth se match karo. Fixed 1RU/2RU switches (jaise MDS 9148T aur 9396T, 32G) edge ya chhote collapsed-core designs ke liye hain. Modular directors (MDS 9706, 9710, 9718) bahut ports wale collapsed core ke liye hain, dual supervisors, redundant fabric modules aur in-service software upgrade ke saath. Design checks: kaafi 32G ports wale line cards, control-plane HA ke liye supervisor pair, alag feeds par power supplies, aur jo features chahiye unke licences (jaise FCIP, enterprise features, SAN analytics). Current models aur licences hamesha Cisco documentation se confirm karo; part numbers badalte rehte hain.</p>

<h3>Harbor Mutual ke liye chosen design</h3>
<p>Do collapsed-core fabrics, har room mein ek MDS 9706, aapas mein connected nahi. Fabric A room 1 mein, fabric B room 2 mein, har ek apne VSAN mein. Servers ko do HBAs; arrays ko dono mein controller ports. 16G array ports negotiate down hote hain; arrays refresh hone par 32G host ports use honge. 400 ports tak growth har fabric mein ek 9706 ke andar hai. Har fabric ka apna domain ID plan aur apna change calendar hai.</p>
<pre class="out">switch-a# show vsan
vsan 10 information
         name:HARBOR-A  state:active
         <span class="hl">interoperability mode:default</span>
         loadbalancing:src-id/dst-id/oxid
         operational state:up</pre>

<div class="warn"><p><b>Common mistake.</b> A aur B ke beech "sirf management ke liye" cross-link lagana, ya shared VSAN trunk se fabrics merge karna. Aapne phir ek failure domain bana diya.</p></div>
<div class="exam"><p><b>Exam trap.</b> Dual fabric ka matlab do ISLs nahi hai. Do ISLs ek fabric ke andar link failure se bachate hain; fabrics A aur B fabric-wide faults se bachate hain jaise zoning errors, RSCN storms aur software upgrades.</p></div>

<div class="scn"><h4>38 minute ka zoning outage</h4><p>Harbor Mutual mein engineer ne purani text file se zone set activate kiya; naye set mein 14 database initiators chhoot gaye. RSCNs chale, hosts zones se logout ho gaye, aur saare 220 servers ek saath disks se kat gaye. Recovery pichhle zone set ko dobara activate karke hui. Redesign ke baad fabric A par yahi galti hoti to fabric B par asar nahi padta; multipathing har server ko B paths par chalta rakhta.</p><p><b>Lesson:</b> doosre fabric ki keemat ek fabric-wide change error ki keemat ke saamne bahut chhoti hai.</p></div>

<div class="iv"><p class="q">"Flexibility ke liye fabric A aur fabric B ko connect kyun na karein?"</p><p>Strong answer: A/B ki poori value isolated failure domains mein hai. Cross-connection name server, zoning aur RSCN propagation share karwa deta hai, isliye ek error phail jaati hai. Flexibility host ke multipathing se aati hai, fabrics jodne se nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Fabric shared services ka ek set hai; fabric-wide faults se bachne ke liye doosra isolated fabric chahiye.</li>
<li>Collapsed core sabse simple; core-edge scale karta hai; edge-core-edge bahut bade sites ke liye.</li>
<li>Chhote ya edge roles ke liye fixed MDS, bade collapsed core ke liye director-class chuno.</li>
<li>A aur B ke power, cabling aur change windows alag rakho.</li>
</ul></div>
`}};export{e as default};