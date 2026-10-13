var e={id:`welcome`,h:{en:`Welcome: from JNCIA to enterprise switching and routing`,hi:`Welcome: JNCIA se enterprise switching aur routing tak`},body:{en:`
<p><b>What you will learn in this module.</b> This is the Start here module of the JNCIS-ENT track (Juniper Networks Certified Specialist, Enterprise Routing and Switching). You have finished JNCIA-Junos, so you can already read a Junos prompt and commit a change. Now you step up to the questions that real campus engineers answer every day. How is a campus network built from layers? How do Layer 2 and Layer 3 fit together? Which Juniper box does which job? What does the JNCIS-ENT exam ask, and in which order should you learn it? How do you practise in this simulator so that every lab sticks? There are no labs here. The goal is a clear map before you start building.</p>
<p><b>Prerequisites.</b> JNCIA-Junos level skills: <code>configure</code>, <code>set</code>, <code>show | compare</code>, <code>commit</code>, <code>rollback</code> and operational <code>show</code> commands. If those feel shaky, revisit the JNCIA CLI module first. You should also know what an IP address, a subnet mask and a default gateway are.</p>

<h3>Analogy: a university campus</h3>
<p>Picture a large university. Every department building has corridors and rooms where people talk freely. That is a <b>LAN segment</b>, and the corridor system inside a building is Layer 2 switching. Each building has a ground-floor reception desk that knows how to send visitors to other buildings. That is Layer 3 routing. The campus also has a main gate to the outside world, with a security desk, which is the WAN edge. The university does not run on one road; it has two gates and two roads to the library, so that a blocked road does not stop classes. That is redundancy, and the clever traffic police who stop students walking in circles are spanning tree.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Campus as university analogy">
<rect x="230" y="15" width="180" height="46" rx="10" fill="#fde68a"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">Main gate: WAN edge (MX)</text>
<rect x="60" y="90" width="170" height="46" rx="10" fill="#bae6fd"/><text x="145" y="118" text-anchor="middle" class="svg-ink" font-size="13">Reception: Layer 3 core</text>
<rect x="410" y="90" width="170" height="46" rx="10" fill="#bae6fd"/><text x="495" y="118" text-anchor="middle" class="svg-ink" font-size="13">Reception: Layer 3 core</text>
<rect x="30" y="170" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="95" y="194" text-anchor="middle" class="svg-ink" font-size="12">Building A: access</text>
<rect x="255" y="170" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="194" text-anchor="middle" class="svg-ink" font-size="12">Building B: access</text>
<rect x="480" y="170" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="545" y="194" text-anchor="middle" class="svg-ink" font-size="12">Building C: access</text>
<line x1="290" y1="61" x2="170" y2="90" stroke="#64748b" stroke-width="2"/><line x1="350" y1="61" x2="470" y2="90" stroke="#64748b" stroke-width="2"/><line x1="230" y1="113" x2="410" y2="113" stroke="#64748b" stroke-width="2"/>
<line x1="120" y1="136" x2="95" y2="170" stroke="#64748b" stroke-width="2"/><line x1="170" y1="136" x2="300" y2="170" stroke="#64748b" stroke-width="2"/><line x1="470" y1="136" x2="340" y2="170" stroke="#64748b" stroke-width="2"/><line x1="520" y1="136" x2="545" y2="170" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">A campus network is a university: access buildings, redundant core reception desks and one gate outside.</p></div>

<h3>The route through the track</h3>
<p>JNCIS-ENT is a specialist level. It assumes you can operate Junos and asks you to <b>implement and troubleshoot</b> enterprise features. The modules in this course follow the order in which the pieces depend on each other:</p>
<ol>
<li><b>Layer 2 switching:</b> MAC learning, VLANs, trunks, native VLAN, IRB.</li>
<li><b>Spanning tree:</b> RSTP, root election, edge ports, MSTP and VSTP.</li>
<li><b>Layer 2 security:</b> MAC limiting, DHCP snooping, DAI, BPDU, loop and root protection, storm control.</li>
<li><b>Protocol-independent routing:</b> static, aggregate and generated routes, then routing instances, RIB groups, load balancing and filter-based forwarding.</li>
<li><b>Dynamic routing:</b> OSPF, IS-IS and BGP.</li>
<li><b>Tunnels and high availability:</b> GRE and IP-IP tunnels, LAG, VRRP, graceful restart and virtual chassis.</li>
</ol>

<div class="eg"><p><b>Worked example: what a day looks like.</b> A branch in Pune opens a new floor. You create two VLANs on the access switch and a trunk to the core, give each VLAN an IRB gateway, make sure RSTP picks the core as root, lock the user ports against rogue devices, and route the new subnets with OSPF to the head office. Every item of that list is one module of this track.</p></div>

<div class="note"><p>Exam codes and weights change over time. This course labels the switching modules JN0-352 and covers the topics of the JNCIS-ENT blueprint. Always check the current exam page of the vendor before booking.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Jumping straight to OSPF or BGP because they sound advanced. Routing protocols run over a working Layer 2 foundation. If VLANs, trunks and spanning tree are shaky, every routing fault looks like a routing problem and costs hours.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam mixes topics inside one question: a scenario may show a VLAN fault, a spanning tree role and a routing table in one exhibit. Studying in layers lets you eliminate whole classes of faults quickly.</p></div>

<div class="scn"><h4>The OSPF neighbour that was a VLAN problem</h4><p>A new switch pair would not bring up an OSPF neighbour for two days. The engineer reread the OSPF configuration ten times. A colleague ran <code>show vlans</code> and saw that the VLAN carrying the link was missing from one end of the trunk. Ten minutes later the neighbour was up.</p><p><b>Lesson:</b> work bottom up. Layer 2 first, then Layer 3.</p></div>

<div class="iv"><p class="q">"You passed JNCIA. How would you prepare for JNCIS-ENT?"</p><p>Study in dependency order: switching and VLANs, spanning tree, Layer 2 security, static and policy-driven routing, then OSPF, IS-IS, BGP, tunnels and high availability. Do every lab twice, once with the guide and once from memory, and read <code>show</code> output until you can spot the fault without the hint.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>JNCIS-ENT asks you to implement and troubleshoot enterprise switching and routing on Junos.</li>
<li>A campus is layered: access, distribution and core, with redundancy and a WAN edge.</li>
<li>Learn bottom up: Layer 2, spanning tree, security, routing, dynamic protocols, high availability.</li>
<li>JNCIA CLI skills are assumed throughout.</li>
<li>This module is a map; the next modules are where you build.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Yeh JNCIS-ENT track (Juniper Networks Certified Specialist, Enterprise Routing and Switching) ka Start here module hai. Aapne JNCIA-Junos khatam kiya hai, isliye aap Junos prompt padh sakte ho aur change commit kar sakte ho. Ab aap un sawaalon par aate ho jinka jawab real campus engineers roz dete hain. Campus network layers se kaise banta hai? Layer 2 aur Layer 3 kaise jude hote hain? Kaunsa Juniper box kaunsa kaam karta hai? JNCIS-ENT exam kya poochta hai, aur kis order mein seekhna chahiye? Is simulator mein practice kaise karein taaki har lab yaad rahe? Yahan koi lab nahi hai. Maqsad hai build karne se pehle saaf naksha.</p>
<p><b>Prerequisites.</b> JNCIA-Junos level skills: <code>configure</code>, <code>set</code>, <code>show | compare</code>, <code>commit</code>, <code>rollback</code> aur operational <code>show</code> commands. Agar yeh kamzor lagein to pehle JNCIA CLI module dobara dekho. Aapko IP address, subnet mask aur default gateway bhi pata hone chahiye.</p>

<h3>Analogy: ek university campus</h3>
<p>Ek bada university socho. Har department building mein corridors aur kamre hain jahan log aaram se baat karte hain. Yeh ek <b>LAN segment</b> hai, aur building ke andar ka corridor system Layer 2 switching hai. Har building ki ground floor par reception desk hai jo visitors ko doosri buildings bhejna jaanta hai. Yeh Layer 3 routing hai. Campus ka bahar ki duniya ke liye ek main gate bhi hai, security desk ke saath, jo WAN edge hai. University ek hi road par nahi chalta; library ke liye do gates aur do roads hain, taaki ek road band ho to classes na rukein. Yeh redundancy hai, aur jo hoshiyar traffic police students ko gol-gol ghoomne se rokti hai woh spanning tree hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="University analogy se campus">
<rect x="230" y="15" width="180" height="46" rx="10" fill="#fde68a"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">Main gate: WAN edge (MX)</text>
<rect x="60" y="90" width="170" height="46" rx="10" fill="#bae6fd"/><text x="145" y="118" text-anchor="middle" class="svg-ink" font-size="13">Reception: Layer 3 core</text>
<rect x="410" y="90" width="170" height="46" rx="10" fill="#bae6fd"/><text x="495" y="118" text-anchor="middle" class="svg-ink" font-size="13">Reception: Layer 3 core</text>
<rect x="30" y="170" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="95" y="194" text-anchor="middle" class="svg-ink" font-size="12">Building A: access</text>
<rect x="255" y="170" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="194" text-anchor="middle" class="svg-ink" font-size="12">Building B: access</text>
<rect x="480" y="170" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="545" y="194" text-anchor="middle" class="svg-ink" font-size="12">Building C: access</text>
<line x1="290" y1="61" x2="170" y2="90" stroke="#64748b" stroke-width="2"/><line x1="350" y1="61" x2="470" y2="90" stroke="#64748b" stroke-width="2"/><line x1="230" y1="113" x2="410" y2="113" stroke="#64748b" stroke-width="2"/>
<line x1="120" y1="136" x2="95" y2="170" stroke="#64748b" stroke-width="2"/><line x1="170" y1="136" x2="300" y2="170" stroke="#64748b" stroke-width="2"/><line x1="470" y1="136" x2="340" y2="170" stroke="#64748b" stroke-width="2"/><line x1="520" y1="136" x2="545" y2="170" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Campus network ek university hai: access buildings, redundant core reception desks aur bahar ek gate.</p></div>

<h3>Track ka raasta</h3>
<p>JNCIS-ENT specialist level hai. Yeh maanta hai ki aap Junos chala sakte ho aur aapse enterprise features <b>implement aur troubleshoot</b> karne ko kehta hai. Is course ke modules us order mein hain jisme cheezein ek doosre par depend karti hain:</p>
<ol>
<li><b>Layer 2 switching:</b> MAC learning, VLANs, trunks, native VLAN, IRB.</li>
<li><b>Spanning tree:</b> RSTP, root election, edge ports, MSTP aur VSTP.</li>
<li><b>Layer 2 security:</b> MAC limiting, DHCP snooping, DAI, BPDU, loop aur root protection, storm control.</li>
<li><b>Protocol-independent routing:</b> static, aggregate aur generated routes, phir routing instances, RIB groups, load balancing aur filter-based forwarding.</li>
<li><b>Dynamic routing:</b> OSPF, IS-IS aur BGP.</li>
<li><b>Tunnels aur high availability:</b> GRE aur IP-IP tunnels, LAG, VRRP, graceful restart aur virtual chassis.</li>
</ol>

<div class="eg"><p><b>Worked example: ek din kaisa dikhta hai.</b> Pune branch mein naya floor khulta hai. Aap access switch par do VLANs aur core tak trunk banate ho, har VLAN ko IRB gateway dete ho, dekhte ho ki RSTP core ko root chune, user ports ko rogue devices se lock karte ho, aur naye subnets ko OSPF se head office tak route karte ho. Us list ka har item is track ka ek module hai.</p></div>

<div class="note"><p>Exam codes aur weights waqt ke saath badalte hain. Yeh course switching modules ko JN0-352 label karta hai aur JNCIS-ENT blueprint ke topics cover karta hai. Book karne se pehle vendor ka current exam page zaroor dekho.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Seedha OSPF ya BGP par kood jaana kyunki woh advanced lagte hain. Routing protocols kaam karte Layer 2 foundation par chalte hain. VLANs, trunks aur spanning tree kamzor hon to har fault routing problem lagta hai aur ghante kha jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam ek hi question mein topics mila deta hai: ek scenario mein VLAN fault, spanning tree role aur routing table ek exhibit mein ho sakte hain. Layers mein padhne se aap poori classes of faults jaldi eliminate kar sakte ho.</p></div>

<div class="scn"><h4>OSPF neighbour jo asal mein VLAN problem tha</h4><p>Naye switch pair ka OSPF neighbour do din tak up nahi hua. Engineer ne OSPF configuration das baar padhi. Ek colleague ne <code>show vlans</code> chalaya aur dekha ki link carry karne wala VLAN trunk ke ek end par missing tha. Das minute baad neighbour up tha.</p><p><b>Lesson:</b> neeche se upar kaam karo. Pehle Layer 2, phir Layer 3.</p></div>

<div class="iv"><p class="q">"Aapne JNCIA pass kar liya. JNCIS-ENT ki taiyaari kaise karoge?"</p><p>Dependency order mein padhunga: switching aur VLANs, spanning tree, Layer 2 security, static aur policy-driven routing, phir OSPF, IS-IS, BGP, tunnels aur high availability. Har lab do baar karunga, ek baar guide ke saath aur ek baar yaad se, aur <code>show</code> output tab tak padhunga jab tak hint ke bina fault pehchan na lun.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>JNCIS-ENT aapse Junos par enterprise switching aur routing implement aur troubleshoot karne ko kehta hai.</li>
<li>Campus layered hota hai: access, distribution aur core, redundancy aur WAN edge ke saath.</li>
<li>Neeche se upar seekho: Layer 2, spanning tree, security, routing, dynamic protocols, high availability.</li>
<li>JNCIA CLI skills har jagah maani jaati hain.</li>
<li>Yeh module naksha hai; agle modules mein aap build karte ho.</li>
</ul></div>
`}};export{e as default};