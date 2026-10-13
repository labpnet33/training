var e={id:`campus-architecture`,h:{en:`How an enterprise campus network is built`,hi:`Enterprise campus network kaise banta hai`},body:{en:`
<p>A good campus network is built like a good road system: local streets where people live, arterial roads that gather traffic, and a motorway that moves it quickly between districts. Planners do not build one giant road. They divide the job into layers, each with a clear purpose, and then connect the layers with redundant links. In this chapter you learn the three-layer model, where VLANs and routing live inside it, and why every design question in the JNCIS-ENT exam makes sense once you see it.</p>

<h3>The three layers</h3>
<dl class="terms">
<dt>Access layer</dt><dd>Where devices connect: PCs, phones, printers, access points. Many ports, low cost per port, Layer 2 only in most designs. Features: VLANs, port security, PoE, edge ports. Example in our labs: AS1, ACC, FLOOR2, ACC1.</dd>
<dt>Distribution layer</dt><dd>Aggregates the access switches of a building or floor group. Often the first Layer 3 hop: IRB gateways, routing, policy, spanning tree root. Example: DSW1, DSW2, DIST1, DIST2.</dd>
<dt>Core layer</dt><dd>The fast backbone between distribution blocks and to the WAN edge. Only job: move packets quickly and reliably. In a small campus the core and distribution layers merge into a <b>collapsed core</b>. Example: CORE.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Three-layer campus">
<rect x="210" y="15" width="220" height="44" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Core: fast, routed, redundant</text>
<rect x="60" y="100" width="190" height="44" rx="10" fill="#bae6fd"/><text x="155" y="127" text-anchor="middle" class="svg-ink" font-size="13">Distribution A: IRB, root</text>
<rect x="390" y="100" width="190" height="44" rx="10" fill="#bae6fd"/><text x="485" y="127" text-anchor="middle" class="svg-ink" font-size="13">Distribution B: IRB, backup</text>
<rect x="20" y="190" width="140" height="44" rx="10" fill="#bbf7d0"/><text x="90" y="217" text-anchor="middle" class="svg-ink" font-size="12">Access: floor 1</text>
<rect x="180" y="190" width="140" height="44" rx="10" fill="#bbf7d0"/><text x="250" y="217" text-anchor="middle" class="svg-ink" font-size="12">Access: floor 2</text>
<rect x="340" y="190" width="140" height="44" rx="10" fill="#bbf7d0"/><text x="410" y="217" text-anchor="middle" class="svg-ink" font-size="12">Access: floor 3</text>
<rect x="500" y="190" width="130" height="44" rx="10" fill="#bbf7d0"/><text x="565" y="217" text-anchor="middle" class="svg-ink" font-size="12">Access: floor 4</text>
<line x1="280" y1="59" x2="190" y2="100" stroke="#64748b" stroke-width="3"/><line x1="360" y1="59" x2="450" y2="100" stroke="#64748b" stroke-width="3"/>
<line x1="250" y1="122" x2="390" y2="122" stroke="#64748b" stroke-width="2"/>
<line x1="120" y1="144" x2="90" y2="190" stroke="#64748b" stroke-width="2"/><line x1="190" y1="144" x2="250" y2="190" stroke="#64748b" stroke-width="2"/><line x1="460" y1="144" x2="410" y2="190" stroke="#64748b" stroke-width="2"/><line x1="530" y1="144" x2="565" y2="190" stroke="#64748b" stroke-width="2"/>
<line x1="130" y1="144" x2="250" y2="190" stroke="#64748b" stroke-width="1" stroke-dasharray="4 3"/><line x1="500" y1="144" x2="410" y2="190" stroke="#64748b" stroke-width="1" stroke-dasharray="4 3"/>
</svg><p class="cap">Every access switch has two uplinks, one to each distribution switch (dashed lines show the second uplinks).</p></div>

<h3>Why layers?</h3>
<ul>
<li><b>Scale:</b> to add a floor you add an access switch and two uplinks. The rest is untouched.</li>
<li><b>Fault isolation:</b> a broadcast storm in one access block should not leave the distribution layer.</li>
<li><b>Predictable paths:</b> traffic goes access to distribution to core. Troubleshooting follows the same path.</li>
<li><b>Policy in the right place:</b> security filters at the distribution layer, speed at the core.</li>
</ul>

<h3>Where Layer 2 and Layer 3 meet</h3>
<p>The border between Layer 2 and Layer 3 can sit at two places. In the classic design the VLANs are carried by trunks from the access switches up to the distribution switches, which hold the IRB gateways. Spanning tree runs on those trunks, which is why the distribution pair holds the root and backup root. In a <b>routed access</b> design the access switch itself routes, so each uplink is a Layer 3 link and spanning tree is limited to the access switch's own ports. That removes loops but needs a routing protocol on every access switch. JNCIS-ENT focuses on the classic design, with routing added from the distribution layer upwards.</p>

<div class="eg"><p><b>Worked example.</b> A company has 4 floors with 48 users each. Each floor gets one access switch with two 1 Gbit/s uplinks, one to each of two distribution switches. VLAN 10 (staff) and VLAN 20 (voice) run on all floors, so the trunks carry both. The distribution switches are the IRB gateways (10.10.10.1 and 10.10.20.1). DSW1 is the spanning tree root with priority 4k, DSW2 the backup with 8k. A pair of routers at the edge connect to the head office with OSPF. Count the pieces: each one is a module in this track.</p></div>

<h3>Redundancy: two of everything</h3>
<p>Redundant links, redundant switches and redundant gateways make failure survivable. That redundancy creates the problems this track solves: loops (spanning tree), a second gateway that hosts can use (VRRP), several links acting as one (LAG) and multiple routing paths (dynamic routing). When you meet a protocol in later modules, ask: which redundancy problem does it solve?</p>

<div class="warn"><p><b>Common mistakes.</b> Making one VLAN span the whole campus: a broadcast storm then reaches everyone. Letting the access layer route without a plan. Forgetting a second uplink and calling the design redundant. Putting the spanning tree root on an access switch by accident.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam uses layer names to ask where a feature belongs. Edge ports, port security and VLAN membership are access-layer features. IRB gateways, routing policy and spanning tree root placement belong to distribution. The core should be kept simple and fast.</p></div>

<div class="scn"><h4>The flat network that was "redundant"</h4><p>A hospital had 12 switches daisy-chained with two cables between each pair. When one cable failed, nothing improved, because every switch was a root candidate and the tree changed around the fault. After a redesign into access and distribution layers with one clear root, a cable failure became a one-second blip that staff never noticed.</p><p><b>Lesson:</b> redundancy needs structure.</p></div>

<div class="iv"><p class="q">"Explain the three-layer campus model."</p><p>Access connects end devices with VLANs and edge features. Distribution aggregates the access switches, hosts IRB gateways, policy and the spanning tree root. Core is a fast routed backbone that connects distribution blocks and the WAN edge. Small sites collapse distribution and core. Every access switch uses two uplinks for redundancy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Access, distribution and core layers each have one clear job.</li>
<li>VLANs reach up to the distribution layer where IRB gateways sit.</li>
<li>Small campuses use a collapsed core.</li>
<li>Redundancy brings loops, gateway and link-failover problems that later modules solve.</li>
<li>Place the spanning tree root and gateways on purpose.</li>
</ul></div>
`,hi:`
<p>Achha campus network achhe road system ki tarah banta hai: local galiyan jahan log rehte hain, arterial roads jo traffic jama karti hain, aur motorway jo districts ke beech tezi se le jaata hai. Planners ek vishaal road nahi banate. Woh kaam ko layers mein baantte hain, har ek ka saaf maqsad, aur phir layers ko redundant links se jodte hain. Is chapter mein aap three-layer model, usme VLANs aur routing kahan rehte hain, aur yeh seekhte ho ki JNCIS-ENT exam ka har design question kyun samajh aata hai jab aap yeh dekh lete ho.</p>

<h3>Teen layers</h3>
<dl class="terms">
<dt>Access layer</dt><dd>Jahan devices jude hote hain: PCs, phones, printers, access points. Bahut ports, kam cost per port, zyadatar designs mein sirf Layer 2. Features: VLANs, port security, PoE, edge ports. Hamare labs ka udaharan: AS1, ACC, FLOOR2, ACC1.</dd>
<dt>Distribution layer</dt><dd>Building ya floor group ke access switches ko aggregate karta hai. Aksar pehla Layer 3 hop: IRB gateways, routing, policy, spanning tree root. Udaharan: DSW1, DSW2, DIST1, DIST2.</dd>
<dt>Core layer</dt><dd>Distribution blocks ke beech aur WAN edge tak tez backbone. Ek hi kaam: packets ko tezi aur bharose se aage bhejna. Chhote campus mein core aur distribution layers mil kar <b>collapsed core</b> ban jaati hain. Udaharan: CORE.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Three-layer campus">
<rect x="210" y="15" width="220" height="44" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Core: tez, routed, redundant</text>
<rect x="60" y="100" width="190" height="44" rx="10" fill="#bae6fd"/><text x="155" y="127" text-anchor="middle" class="svg-ink" font-size="13">Distribution A: IRB, root</text>
<rect x="390" y="100" width="190" height="44" rx="10" fill="#bae6fd"/><text x="485" y="127" text-anchor="middle" class="svg-ink" font-size="13">Distribution B: IRB, backup</text>
<rect x="20" y="190" width="140" height="44" rx="10" fill="#bbf7d0"/><text x="90" y="217" text-anchor="middle" class="svg-ink" font-size="12">Access: floor 1</text>
<rect x="180" y="190" width="140" height="44" rx="10" fill="#bbf7d0"/><text x="250" y="217" text-anchor="middle" class="svg-ink" font-size="12">Access: floor 2</text>
<rect x="340" y="190" width="140" height="44" rx="10" fill="#bbf7d0"/><text x="410" y="217" text-anchor="middle" class="svg-ink" font-size="12">Access: floor 3</text>
<rect x="500" y="190" width="130" height="44" rx="10" fill="#bbf7d0"/><text x="565" y="217" text-anchor="middle" class="svg-ink" font-size="12">Access: floor 4</text>
<line x1="280" y1="59" x2="190" y2="100" stroke="#64748b" stroke-width="3"/><line x1="360" y1="59" x2="450" y2="100" stroke="#64748b" stroke-width="3"/>
<line x1="250" y1="122" x2="390" y2="122" stroke="#64748b" stroke-width="2"/>
<line x1="120" y1="144" x2="90" y2="190" stroke="#64748b" stroke-width="2"/><line x1="190" y1="144" x2="250" y2="190" stroke="#64748b" stroke-width="2"/><line x1="460" y1="144" x2="410" y2="190" stroke="#64748b" stroke-width="2"/><line x1="530" y1="144" x2="565" y2="190" stroke="#64748b" stroke-width="2"/>
<line x1="130" y1="144" x2="250" y2="190" stroke="#64748b" stroke-width="1" stroke-dasharray="4 3"/><line x1="500" y1="144" x2="410" y2="190" stroke="#64748b" stroke-width="1" stroke-dasharray="4 3"/>
</svg><p class="cap">Har access switch ke do uplinks hain, har distribution switch ki taraf ek (dashed lines doosre uplinks dikhati hain).</p></div>

<h3>Layers kyun?</h3>
<ul>
<li><b>Scale:</b> floor badhane ke liye ek access switch aur do uplinks jodte ho. Baaki sab waisa hi rehta hai.</li>
<li><b>Fault isolation:</b> ek access block ka broadcast storm distribution layer se bahar nahi jaana chahiye.</li>
<li><b>Predictable paths:</b> traffic access se distribution se core jaata hai. Troubleshooting bhi wahi path follow karti hai.</li>
<li><b>Policy sahi jagah par:</b> security filters distribution layer par, speed core par.</li>
</ul>

<h3>Layer 2 aur Layer 3 kahan milte hain</h3>
<p>Layer 2 aur Layer 3 ki seema do jagah ho sakti hai. Classic design mein VLANs trunks se access switches se distribution switches tak jaate hain, jahan IRB gateways hote hain. In trunks par spanning tree chalta hai, isliye distribution pair root aur backup root rakhta hai. <b>Routed access</b> design mein access switch khud route karta hai, isliye har uplink Layer 3 link hai aur spanning tree access switch ke apne ports tak seemit rehta hai. Isse loops hatate hain lekin har access switch par routing protocol chahiye. JNCIS-ENT classic design par focus karta hai, aur routing distribution layer se upar jodi jaati hai.</p>

<div class="eg"><p><b>Worked example.</b> Company ke 4 floors hain, har ek mein 48 users. Har floor ko ek access switch milta hai jiske do 1 Gbit/s uplinks hain, har ek do distribution switches mein se ek ko. VLAN 10 (staff) aur VLAN 20 (voice) saare floors par chalte hain, isliye trunks dono carry karte hain. Distribution switches IRB gateways hain (10.10.10.1 aur 10.10.20.1). DSW1 spanning tree root hai priority 4k ke saath, DSW2 backup 8k ke saath. Edge par routers ka pair head office se OSPF se judta hai. Pieces gino: har ek is track ka ek module hai.</p></div>

<h3>Redundancy: har cheez do</h3>
<p>Redundant links, redundant switches aur redundant gateways failure ko survive karne layak banate hain. Wahi redundancy un problems ko janm deti hai jo yeh track solve karta hai: loops (spanning tree), doosra gateway jo hosts use kar sakein (VRRP), kai links jo ek ki tarah kaam karein (LAG) aur kai routing paths (dynamic routing). Aage ke modules mein koi protocol milne par poocho: yeh kaunsi redundancy problem solve karta hai?</p>

<div class="warn"><p><b>Common mistakes.</b> Ek VLAN ko poore campus mein phaila dena: broadcast storm sab tak pahunchta hai. Plan ke bina access layer ko route karne dena. Doosra uplink bhool jaana aur design ko redundant kehna. Spanning tree root galti se access switch par chala jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam layer names se poochta hai ki feature kahan belong karta hai. Edge ports, port security aur VLAN membership access-layer features hain. IRB gateways, routing policy aur spanning tree root placement distribution ke hain. Core ko simple aur tez rakho.</p></div>

<div class="scn"><h4>Flat network jo "redundant" thi</h4><p>Ek hospital mein 12 switches daisy-chain mein the, har pair ke beech do cables. Ek cable fail hone par kuch behtar nahi hua, kyunki har switch root candidate tha aur fault ke aas-paas tree badalta rehta tha. Access aur distribution layers mein redesign, ek saaf root ke saath, ke baad cable failure ek second ka blip ban gaya jo staff ko pata hi nahi chala.</p><p><b>Lesson:</b> redundancy ko structure chahiye.</p></div>

<div class="iv"><p class="q">"Three-layer campus model samjhao."</p><p>Access end devices ko VLANs aur edge features ke saath jodta hai. Distribution access switches ko aggregate karta hai, IRB gateways, policy aur spanning tree root rakhta hai. Core tez routed backbone hai jo distribution blocks aur WAN edge ko jodta hai. Chhote sites distribution aur core ko collapse karte hain. Har access switch redundancy ke liye do uplinks use karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Access, distribution aur core layers ka ek-ek saaf kaam hai.</li>
<li>VLANs distribution layer tak jaate hain jahan IRB gateways hote hain.</li>
<li>Chhote campuses collapsed core use karte hain.</li>
<li>Redundancy loops, gateway aur link-failover problems laati hai jo aage ke modules solve karte hain.</li>
<li>Spanning tree root aur gateways jaan-boojhkar rakho.</li>
</ul></div>
`}};export{e as default};