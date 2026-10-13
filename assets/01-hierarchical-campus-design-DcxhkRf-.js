var e={id:`hierarchy`,h:{en:`Hierarchical campus design: 2-tier, 3-tier, Layer 2 or routed access`,hi:`Hierarchical campus design: 2-tier, 3-tier, Layer 2 ya routed access`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn to design an enterprise campus the way the ENSLD 300-420 exam expects: start from a customer, list requirements and constraints, compare options, choose, and defend the choice. The module covers hierarchical LAN design, Layer 2 loop-free design (STP, RSTP, MST, EtherChannel, StackWise Virtual), first-hop redundancy and high availability, Cisco SD-Access fabric design, Layer 2 flat versus fabric, QoS, multicast and segmentation. <b>Prerequisites:</b> CCNA-level switching and routing (VLANs, trunks, OSPF or EIGRP basics) and the earlier modules of this track on addressing and routing. No design experience is needed.</p>

<h3>The case: Harbourline Foods</h3>
<div class="eg"><p><b>Customer.</b> Harbourline Foods Ltd is a packaged-food manufacturer with one campus: four buildings (A office, B plant floor, C warehouse, D data and R&amp;D). It has 2,400 office users, 600 IP phones, 1,100 cameras and sensors, and 250 wireless APs. Budget is USD 1.4 million. The ERP system must reach 99.99% availability (about 53 minutes of downtime a year). The IT team is five people and nobody is a spanning-tree expert. Existing fibre gives two diverse paths from each building to Building D. The plant floor in Building B runs a legacy PLC network that needs one VLAN stretched across two wiring closets.</p></div>

<h3>Why a hierarchy at all</h3>
<p>Think of a city road network: neighbourhood streets feed arterial roads, which feed highways. Nobody builds a motorway to every house. A <b>hierarchical design</b> splits the campus into layers with a clear job each, so you can scale, summarise routes, limit failure domains and troubleshoot one layer at a time.</p>
<dl class="terms">
<dt>Access layer</dt><dd>Connects endpoints (PCs, phones, APs, cameras). Provides port security, PoE, QoS marking, first line of segmentation.</dd>
<dt>Distribution layer</dt><dd>Aggregates access switches into a <b>distribution block</b>. Boundary between Layer 2 and Layer 3 in classic designs, where route summarisation, policy and first-hop redundancy live.</dd>
<dt>Core layer</dt><dd>High-speed Layer 3 backbone that joins distribution blocks. It should do as little as possible: fast, redundant, no policy.</dd>
<dt>Failure domain</dt><dd>The set of devices affected when something breaks. Good design keeps each domain small.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 340" role="img" aria-label="Three-tier campus">
<rect x="25" y="112" width="310" height="190" rx="10" fill="none" stroke="#64748b" stroke-dasharray="5 4"/>
<rect x="345" y="112" width="290" height="190" rx="10" fill="none" stroke="#64748b" stroke-dasharray="5 4"/>
<g stroke="#64748b" stroke-width="1.5">
<line x1="215" y1="60" x2="105" y2="130"/><line x1="215" y1="60" x2="225" y2="130"/><line x1="215" y1="60" x2="405" y2="130"/><line x1="215" y1="60" x2="525" y2="130"/>
<line x1="425" y1="60" x2="105" y2="130"/><line x1="425" y1="60" x2="225" y2="130"/><line x1="425" y1="60" x2="405" y2="130"/><line x1="425" y1="60" x2="525" y2="130"/>
<line x1="260" y1="40" x2="380" y2="40"/>
<line x1="105" y1="164" x2="80" y2="240"/><line x1="105" y1="164" x2="180" y2="240"/><line x1="105" y1="164" x2="280" y2="240"/>
<line x1="225" y1="164" x2="80" y2="240"/><line x1="225" y1="164" x2="180" y2="240"/><line x1="225" y1="164" x2="280" y2="240"/>
<line x1="405" y1="164" x2="390" y2="240"/><line x1="405" y1="164" x2="490" y2="240"/><line x1="405" y1="164" x2="590" y2="240"/>
<line x1="525" y1="164" x2="390" y2="240"/><line x1="525" y1="164" x2="490" y2="240"/><line x1="525" y1="164" x2="590" y2="240"/>
</g>
<g class="svg-ink" font-size="13" text-anchor="middle">
<rect x="170" y="20" width="90" height="40" rx="8" fill="#bae6fd" stroke="#475569"/><text x="215" y="45">Core 1</text>
<rect x="380" y="20" width="90" height="40" rx="8" fill="#bae6fd" stroke="#475569"/><text x="425" y="45">Core 2</text>
<rect x="60" y="130" width="90" height="34" rx="8" fill="#ddd6fe" stroke="#475569"/><text x="105" y="152">Dist A1</text>
<rect x="180" y="130" width="90" height="34" rx="8" fill="#ddd6fe" stroke="#475569"/><text x="225" y="152">Dist A2</text>
<rect x="360" y="130" width="90" height="34" rx="8" fill="#ddd6fe" stroke="#475569"/><text x="405" y="152">Dist B1</text>
<rect x="480" y="130" width="90" height="34" rx="8" fill="#ddd6fe" stroke="#475569"/><text x="525" y="152">Dist B2</text>
<rect x="40" y="240" width="80" height="30" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="80" y="260">Access</text>
<rect x="140" y="240" width="80" height="30" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="180" y="260">Access</text>
<rect x="240" y="240" width="80" height="30" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="280" y="260">Access</text>
<rect x="350" y="240" width="80" height="30" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="390" y="260">Access</text>
<rect x="450" y="240" width="80" height="30" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="490" y="260">Access</text>
<rect x="550" y="240" width="80" height="30" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="590" y="260">Access</text>
<text x="180" y="292" class="svg-muted" font-size="12">Building A block</text>
<text x="490" y="292" class="svg-muted" font-size="12">Building B block</text>
</g>
<rect x="25" y="314" width="14" height="14" fill="#bae6fd"/><text x="45" y="326" class="svg-ink" font-size="12">Core</text>
<rect x="105" y="314" width="14" height="14" fill="#ddd6fe"/><text x="125" y="326" class="svg-ink" font-size="12">Distribution</text>
<rect x="225" y="314" width="14" height="14" fill="#bbf7d0"/><text x="245" y="326" class="svg-ink" font-size="12">Access</text>
</svg><p class="cap">Three-tier campus: each building is a distribution block; two core switches join the blocks.</p></div>

<h3>Options for Harbourline</h3>
<table class="cmp"><tr><th>Option</th><th>Strengths</th><th>Weaknesses</th></tr>
<tr><td><b>A. 3-tier, Layer 2 access</b></td><td>Familiar; VLANs reach any closet in the block</td><td>STP everywhere, blocked links, large failure domains</td></tr>
<tr><td><b>B. 2-tier collapsed core, routed access</b></td><td>No STP on uplinks, ECMP, fast convergence</td><td>VLANs cannot span closets; needs IP plan; more routing to run</td></tr>
<tr><td><b>C. 2-tier L2 access + StackWise Virtual distribution</b></td><td>Loop-free via Multichassis EtherChannel; simple</td><td>Distribution pair is one logical control plane</td></tr>
<tr><td><b>D. SD-Access fabric</b></td><td>Automation, segmentation, anycast gateway</td><td>Licences, Catalyst Center and ISE, skills; over budget now</td></tr></table>

<h3>Collapsed core or separate core?</h3>
<p>In a <b>2-tier (collapsed core)</b> design the distribution switches also act as the core. It saves hardware and is right for a single building or a small campus. The question for several buildings is cabling and ports. Without a core, every distribution block must link to every other: n blocks need n(n-1)/2 block-to-block connections. For 4 blocks that is 6; for 8 blocks it is 28. With a core, each block needs only 2 links to the core pair: 4 blocks = 8 links, 8 blocks = 16. The rule of thumb: add a dedicated core when you have more than about three distribution blocks, or when the fibre or port count makes the full mesh painful.</p>

<h3>Layer 2 access versus routed access</h3>
<p>In <b>Layer 2 access</b> the access switch is a VLAN switch, and the uplinks are trunks that rely on STP or EtherChannel. In <b>routed access</b> the access switch routes: its uplinks are point-to-point Layer 3 links and its VLANs end at the closet. Benefits of routed access: no STP on the uplinks, equal-cost multipath (ECMP) uses both uplinks, convergence in milliseconds with BFD and tuned timers, no first-hop redundancy protocol needed because each closet is its own gateway, and smaller broadcast domains. Cost: a VLAN cannot span closets, so wireless roaming, voice VLANs and legacy Layer 2 applications need care.</p>

<pre class="code"><span class="c">! Routed access switch ACC-A3 (uplink to Dist A1)</span>
interface TenGigabitEthernet1/1/1
 description to-DIST-A1
 no switchport
 ip address 10.10.1.1 255.255.255.252
 ip ospf network point-to-point
!
router ospf 1
 passive-interface default
 no passive-interface TenGigabitEthernet1/1/1
</pre>
<pre class="out">ACC-A3# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
10.255.0.1        0   <span class="hl">FULL/  -</span>        00:00:34    10.10.1.2       TenGigabitEthernet1/1/1
</pre>

<h3>Chosen design for Harbourline</h3>
<p>The team chose <b>2-tier per building plus a small routed core</b>: Buildings A, C and D use routed access with a distribution pair in each building. Building B uses Layer 2 access only in the plant closets, where the PLC VLAN spans two closets over a Multichassis EtherChannel to a StackWise Virtual distribution pair (chapter 2). All blocks uplink to two core switches in Building D. Justification: it meets 99.99% with no single point of failure, removes STP from 85% of the network, fits the budget, and the exception is contained in one block. SD-Access is documented as phase 2 once the underlay is routed (chapter 4).</p>

<div class="warn"><p><b>Common mistakes.</b> Stretching one VLAN across the whole campus "for flexibility"; oversubscribing uplinks without measuring (classic rule of thumb is up to about 20:1 access to distribution and 4:1 distribution to core, but voice and video change that); and putting policy or ACLs on core switches.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam asks for the <i>most scalable</i> or <i>fastest converging</i> design under stated constraints. Read constraints first: "VLAN must span closets" kills routed access; "no STP expertise" favours routed access or SVL.</p></div>

<div class="scn"><h4>The plant-floor broadcast storm</h4><p>Before the redesign, Harbourline had one VLAN 100 across Buildings B and C. A technician plugged a small unmanaged switch into two wall ports, creating a loop. The storm saturated CPU on both distribution switches and the ERP link dropped for 40 minutes. After the redesign, VLAN 100 exists only inside the Building B block, and BPDU guard is on every edge port.</p><p><b>Lesson:</b> hierarchy limits the failure domain; a loop now hurts one block, not the campus.</p></div>
<div class="iv"><p class="q">"When would you choose a collapsed core over a three-tier design?"</p><p>Strong answer: single building or a small campus with up to about three distribution blocks, where full-mesh links stay few. Mention n(n-1)/2 links, cost, and that you can add a core later because the distribution blocks are already routed and summarised.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Access, distribution and core each have one job; keep failure domains small.</li>
<li>Collapsed core saves cost; add a core when full-mesh links between blocks grow.</li>
<li>Routed access removes STP and FHRP from the closet but stops VLANs spanning closets.</li>
<li>Design answers always start from requirements and constraints, then options and trade-offs.</li>
<li>Contain exceptions (like a stretched VLAN) in one block.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap enterprise campus ko us tareeke se design karna seekhoge jaisa ENSLD 300-420 exam expect karta hai: customer se shuru karo, requirements aur constraints likho, options compare karo, choose karo aur apna choice defend karo. Module mein hierarchical LAN design, Layer 2 loop-free design (STP, RSTP, MST, EtherChannel, StackWise Virtual), first-hop redundancy aur high availability, Cisco SD-Access fabric design, Layer 2 flat versus fabric, QoS, multicast aur segmentation aate hain. <b>Prerequisites:</b> CCNA-level switching aur routing (VLANs, trunks, OSPF ya EIGRP basics) aur is track ke pehle ke modules (addressing aur routing). Design ka koi pehle se experience nahi chahiye.</p>

<h3>Case: Harbourline Foods</h3>
<div class="eg"><p><b>Customer.</b> Harbourline Foods Ltd ek packaged-food manufacturer hai jiska ek campus hai: chaar buildings (A office, B plant floor, C warehouse, D data aur R&amp;D). Uske paas 2,400 office users, 600 IP phones, 1,100 cameras aur sensors, aur 250 wireless APs hain. Budget USD 1.4 million hai. ERP system ko 99.99% availability chahiye (saal mein lagbhag 53 minute downtime). IT team paanch logon ki hai aur koi spanning-tree expert nahi hai. Existing fibre har building se Building D tak do diverse paths deta hai. Building B ka plant floor legacy PLC network chalata hai jise do wiring closets ke beech ek VLAN stretch karna padta hai.</p></div>

<h3>Hierarchy kyun chahiye</h3>
<p>City ke road network ke baare mein socho: mohalle ki galiyan arterial roads se judti hain, aur woh highways se. Har ghar tak motorway koi nahi banata. <b>Hierarchical design</b> campus ko layers mein baantta hai jinka ek clear kaam hota hai, taaki aap scale kar sako, routes summarise kar sako, failure domains chhote rakh sako aur ek time par ek layer troubleshoot kar sako.</p>
<dl class="terms">
<dt>Access layer</dt><dd>Endpoints (PCs, phones, APs, cameras) ko connect karti hai. Port security, PoE, QoS marking aur segmentation ki pehli line deti hai.</dd>
<dt>Distribution layer</dt><dd>Access switches ko <b>distribution block</b> mein aggregate karti hai. Classic designs mein Layer 2 aur Layer 3 ki boundary hai, jahan route summarisation, policy aur first-hop redundancy rehte hain.</dd>
<dt>Core layer</dt><dd>High-speed Layer 3 backbone jo distribution blocks ko jodta hai. Use kam se kam kaam karna chahiye: fast, redundant, koi policy nahi.</dd>
<dt>Failure domain</dt><dd>Wo devices jo kuch toot jaane par affect hote hain. Achha design har domain ko chhota rakhta hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 340" role="img" aria-label="Three-tier campus">
<rect x="25" y="112" width="310" height="190" rx="10" fill="none" stroke="#64748b" stroke-dasharray="5 4"/>
<rect x="345" y="112" width="290" height="190" rx="10" fill="none" stroke="#64748b" stroke-dasharray="5 4"/>
<g stroke="#64748b" stroke-width="1.5">
<line x1="215" y1="60" x2="105" y2="130"/><line x1="215" y1="60" x2="225" y2="130"/><line x1="215" y1="60" x2="405" y2="130"/><line x1="215" y1="60" x2="525" y2="130"/>
<line x1="425" y1="60" x2="105" y2="130"/><line x1="425" y1="60" x2="225" y2="130"/><line x1="425" y1="60" x2="405" y2="130"/><line x1="425" y1="60" x2="525" y2="130"/>
<line x1="260" y1="40" x2="380" y2="40"/>
<line x1="105" y1="164" x2="80" y2="240"/><line x1="105" y1="164" x2="180" y2="240"/><line x1="105" y1="164" x2="280" y2="240"/>
<line x1="225" y1="164" x2="80" y2="240"/><line x1="225" y1="164" x2="180" y2="240"/><line x1="225" y1="164" x2="280" y2="240"/>
<line x1="405" y1="164" x2="390" y2="240"/><line x1="405" y1="164" x2="490" y2="240"/><line x1="405" y1="164" x2="590" y2="240"/>
<line x1="525" y1="164" x2="390" y2="240"/><line x1="525" y1="164" x2="490" y2="240"/><line x1="525" y1="164" x2="590" y2="240"/>
</g>
<g class="svg-ink" font-size="13" text-anchor="middle">
<rect x="170" y="20" width="90" height="40" rx="8" fill="#bae6fd" stroke="#475569"/><text x="215" y="45">Core 1</text>
<rect x="380" y="20" width="90" height="40" rx="8" fill="#bae6fd" stroke="#475569"/><text x="425" y="45">Core 2</text>
<rect x="60" y="130" width="90" height="34" rx="8" fill="#ddd6fe" stroke="#475569"/><text x="105" y="152">Dist A1</text>
<rect x="180" y="130" width="90" height="34" rx="8" fill="#ddd6fe" stroke="#475569"/><text x="225" y="152">Dist A2</text>
<rect x="360" y="130" width="90" height="34" rx="8" fill="#ddd6fe" stroke="#475569"/><text x="405" y="152">Dist B1</text>
<rect x="480" y="130" width="90" height="34" rx="8" fill="#ddd6fe" stroke="#475569"/><text x="525" y="152">Dist B2</text>
<rect x="40" y="240" width="80" height="30" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="80" y="260">Access</text>
<rect x="140" y="240" width="80" height="30" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="180" y="260">Access</text>
<rect x="240" y="240" width="80" height="30" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="280" y="260">Access</text>
<rect x="350" y="240" width="80" height="30" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="390" y="260">Access</text>
<rect x="450" y="240" width="80" height="30" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="490" y="260">Access</text>
<rect x="550" y="240" width="80" height="30" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="590" y="260">Access</text>
<text x="180" y="292" class="svg-muted" font-size="12">Building A block</text>
<text x="490" y="292" class="svg-muted" font-size="12">Building B block</text>
</g>
<rect x="25" y="314" width="14" height="14" fill="#bae6fd"/><text x="45" y="326" class="svg-ink" font-size="12">Core</text>
<rect x="105" y="314" width="14" height="14" fill="#ddd6fe"/><text x="125" y="326" class="svg-ink" font-size="12">Distribution</text>
<rect x="225" y="314" width="14" height="14" fill="#bbf7d0"/><text x="245" y="326" class="svg-ink" font-size="12">Access</text>
</svg><p class="cap">Three-tier campus: har building ek distribution block hai; do core switches blocks ko jodte hain.</p></div>

<h3>Harbourline ke options</h3>
<table class="cmp"><tr><th>Option</th><th>Strengths</th><th>Weaknesses</th></tr>
<tr><td><b>A. 3-tier, Layer 2 access</b></td><td>Familiar; VLANs block ke kisi bhi closet tak jaate hain</td><td>Har jagah STP, blocked links, bade failure domains</td></tr>
<tr><td><b>B. 2-tier collapsed core, routed access</b></td><td>Uplinks par STP nahi, ECMP, fast convergence</td><td>VLANs closets ke beech span nahi kar sakte; IP plan chahiye; zyada routing</td></tr>
<tr><td><b>C. 2-tier L2 access + StackWise Virtual distribution</b></td><td>Multichassis EtherChannel se loop-free; simple</td><td>Distribution pair ek logical control plane hai</td></tr>
<tr><td><b>D. SD-Access fabric</b></td><td>Automation, segmentation, anycast gateway</td><td>Licences, Catalyst Center aur ISE, skills; abhi budget se bahar</td></tr></table>

<h3>Collapsed core ya alag core?</h3>
<p><b>2-tier (collapsed core)</b> design mein distribution switches hi core ka kaam bhi karte hain. Isse hardware bachta hai aur single building ya chhote campus ke liye sahi hai. Kai buildings ho to sawaal cabling aur ports ka hai. Core ke bina har distribution block ko har dusre se jodna padta hai: n blocks ko n(n-1)/2 block-to-block connections chahiye. 4 blocks ke liye 6; 8 blocks ke liye 28. Core ke saath har block ko core pair tak sirf 2 links chahiye: 4 blocks = 8 links, 8 blocks = 16. Rule of thumb: jab lagbhag teen se zyada distribution blocks hon, ya fibre aur ports ke kaaran full mesh mushkil ho, to dedicated core lagao.</p>

<h3>Layer 2 access versus routed access</h3>
<p><b>Layer 2 access</b> mein access switch VLAN switch hota hai, aur uplinks trunks hote hain jo STP ya EtherChannel par depend karte hain. <b>Routed access</b> mein access switch route karta hai: uske uplinks point-to-point Layer 3 links hain aur VLANs closet par hi khatam ho jaate hain. Routed access ke fayde: uplinks par STP nahi, equal-cost multipath (ECMP) dono uplinks use karta hai, BFD aur tuned timers ke saath milliseconds mein convergence, first-hop redundancy protocol ki zaroorat nahi kyunki har closet apna gateway hai, aur chhote broadcast domains. Cost: VLAN closets ke beech span nahi kar sakta, isliye wireless roaming, voice VLANs aur legacy Layer 2 applications mein dhyan dena padta hai.</p>

<pre class="code"><span class="c">! Routed access switch ACC-A3 (uplink to Dist A1)</span>
interface TenGigabitEthernet1/1/1
 description to-DIST-A1
 no switchport
 ip address 10.10.1.1 255.255.255.252
 ip ospf network point-to-point
!
router ospf 1
 passive-interface default
 no passive-interface TenGigabitEthernet1/1/1
</pre>
<pre class="out">ACC-A3# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
10.255.0.1        0   <span class="hl">FULL/  -</span>        00:00:34    10.10.1.2       TenGigabitEthernet1/1/1
</pre>

<h3>Harbourline ke liye chosen design</h3>
<p>Team ne <b>har building mein 2-tier plus chhota routed core</b> choose kiya: Buildings A, C aur D mein routed access hai aur har building mein ek distribution pair. Building B sirf plant closets mein Layer 2 access use karta hai, jahan PLC VLAN do closets mein StackWise Virtual distribution pair tak Multichassis EtherChannel par span karta hai (chapter 2). Saare blocks Building D ke do core switches tak uplink karte hain. Justification: single point of failure ke bina 99.99% milta hai, network ke 85% se STP hat jaata hai, budget mein fit hota hai, aur exception ek hi block mein contained hai. SD-Access phase 2 ke roop mein document kiya gaya hai jab underlay routed ho jaaye (chapter 4).</p>

<div class="warn"><p><b>Common mistakes.</b> "Flexibility ke liye" ek VLAN poore campus mein stretch karna; bina measure kiye uplinks oversubscribe karna (classic rule of thumb access se distribution lagbhag 20:1 aur distribution se core 4:1 hai, lekin voice aur video isse badal dete hain); aur core switches par policy ya ACLs lagana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam stated constraints ke under <i>most scalable</i> ya <i>fastest converging</i> design poochta hai. Pehle constraints padho: "VLAN closets ke beech span karna hai" routed access ko rule out karta hai; "STP expertise nahi hai" routed access ya SVL ko favour karta hai.</p></div>

<div class="scn"><h4>Plant-floor broadcast storm</h4><p>Redesign se pehle Harbourline mein VLAN 100 Buildings B aur C dono mein tha. Ek technician ne chhota unmanaged switch do wall ports mein laga diya, jisse loop ban gaya. Storm ne dono distribution switches ka CPU saturate kar diya aur ERP link 40 minute ke liye gir gaya. Redesign ke baad VLAN 100 sirf Building B block ke andar hai, aur har edge port par BPDU guard hai.</p><p><b>Seekh:</b> hierarchy failure domain limit karti hai; ab loop ek block ko hurt karta hai, poore campus ko nahi.</p></div>
<div class="iv"><p class="q">"Aap three-tier ki jagah collapsed core kab choose karoge?"</p><p>Strong answer: single building ya chhota campus jahan lagbhag teen distribution blocks tak full-mesh links kam rahein. n(n-1)/2 links, cost ka zikr karo, aur ye ki baad mein core add kar sakte ho kyunki distribution blocks pehle se routed aur summarised hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Access, distribution aur core ka ek-ek kaam hai; failure domains chhote rakho.</li>
<li>Collapsed core cost bachata hai; blocks ke beech full-mesh links badhein to core add karo.</li>
<li>Routed access closet se STP aur FHRP hata deta hai lekin VLANs ko closets ke beech span nahi hone deta.</li>
<li>Design answers hamesha requirements aur constraints se shuru hote hain, phir options aur trade-offs.</li>
<li>Exceptions (jaise stretched VLAN) ko ek block mein contain karo.</li>
</ul></div>
`}};export{e as default};