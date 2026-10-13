var e={id:`big-picture`,h:{en:`The enterprise network: what you will learn and the big picture`,hi:`Enterprise network: aap kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to look at any enterprise network drawing and explain why it is built the way it is: why there are two of every box, where Layer 2 ends and Layer 3 begins, why the spanning-tree root and the default gateway must live on the same switch, how a supervisor can fail without users noticing, which wireless deployment model fits a campus or a branch, when a workload belongs in the cloud, and how a switch actually forwards a frame in hardware. You will also build a redundant collapsed-core block in the lab and review a broken design until traffic stops taking the long way.</p>

<p><b>Prerequisites.</b> You should be comfortable with CCNA-level VLANs and trunks, spanning tree (root bridge, root port, blocking), EtherChannel with LACP, HSRP basics and single-area OSPF. If any of these feel shaky, revisit the CCNA modules on STP, EtherChannel and FHRP first. This module does not re-teach them; it uses them as building blocks for <b>design</b>.</p>

<h3>An analogy: a network is a city's road system</h3>
<p>Picture a well-planned city. Every house sits on a quiet <b>local lane</b>. Lanes feed into <b>arterial roads</b> where the traffic lights, speed checks and turn restrictions live. Arterial roads join a fast <b>highway</b> with no traffic lights at all, because its only job is to move a lot of cars quickly between districts. Every district is planned as a copy of the same template, so a new district can be added without redesigning the city. If a lane is dug up for repairs, only that street is affected, and there is always a second road into every district.</p>
<p>An enterprise network works the same way. Local lanes are the <b>access layer</b> where users plug in. Arterial roads are the <b>distribution layer</b> where policy and routing decisions happen. The highway is the <b>core</b>. Districts are <b>modules</b> (a building, a data centre, a WAN edge). The second road is <b>redundancy</b>. The rule that a dug-up lane only affects one street is the idea of a <b>failure domain</b>.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Enterprise network modules">
<rect x="250" y="105" width="140" height="50" rx="10" fill="#fde68a"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="14">Campus core</text>
<rect x="20" y="20" width="170" height="50" rx="10" fill="#bae6fd"/><text x="105" y="50" text-anchor="middle" class="svg-ink" font-size="13">Campus buildings</text>
<rect x="235" y="20" width="170" height="50" rx="10" fill="#bbf7d0"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Data centre</text>
<rect x="450" y="20" width="170" height="50" rx="10" fill="#ddd6fe"/><text x="535" y="50" text-anchor="middle" class="svg-ink" font-size="13">Internet edge</text>
<rect x="20" y="190" width="170" height="50" rx="10" fill="#fed7aa"/><text x="105" y="220" text-anchor="middle" class="svg-ink" font-size="13">WAN / SD-WAN edge</text>
<rect x="235" y="190" width="170" height="50" rx="10" fill="#e2e8f0"/><text x="320" y="220" text-anchor="middle" class="svg-ink" font-size="13">Branches</text>
<rect x="450" y="190" width="170" height="50" rx="10" fill="#bae6fd"/><text x="535" y="220" text-anchor="middle" class="svg-ink" font-size="13">Public cloud</text>
<line x1="190" y1="60" x2="250" y2="115" stroke="#64748b" stroke-width="2"/><line x1="320" y1="70" x2="320" y2="105" stroke="#64748b" stroke-width="2"/><line x1="450" y1="60" x2="390" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="190" y1="200" x2="250" y2="145" stroke="#64748b" stroke-width="2"/><line x1="190" y1="215" x2="235" y2="215" stroke="#64748b" stroke-width="2"/><line x1="535" y1="70" x2="535" y2="190" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="548" y="135" class="svg-muted" font-size="12">VPN / interconnect</text>
</svg><p class="cap">An enterprise is a set of modules joined by a core. Each module is designed on its own and can fail on its own.</p></div>

<h3>Where this module sits in the exam</h3>
<p>The ENCOR 350-401 Architecture domain opens with design. This module covers the design-level items; later modules go deep on the technologies they mention.</p>
<table class="cmp"><tr><th>Blueprint item</th><th>What you must be able to do</th><th>Chapters</th></tr>
<tr><td>1.1 Design principles</td><td>Explain 2-tier, 3-tier, fabric and cloud designs; high availability with redundancy, FHRP and SSO</td><td>2 to 7</td></tr>
<tr><td>1.2 WLAN deployment models</td><td>Compare centralised, distributed, controller-less, controller-based, cloud and remote-branch designs</td><td>9</td></tr>
<tr><td>1.3 On-premises vs cloud</td><td>Choose where infrastructure should live and how it connects</td><td>8</td></tr>
<tr><td>1.7 Hardware vs software switching</td><td>Explain process switching, CEF, RIB, FIB, adjacency table, CAM and TCAM</td><td>10</td></tr>
</table>
<p>SD-WAN and SD-Access, LISP and VXLAN, HSRP object tracking and deep wireless configuration each get their own modules later. Here you learn <b>why</b> they exist and where they fit.</p>

<h3>The lab network you will use</h3>
<p>Both labs use the same small collapsed-core block. Two distribution/core switches, <b>DS1</b> and <b>DS2</b>, are joined by two links (Gi0/6 and Gi0/7). One access switch, <b>AS1</b>, has an uplink to each: Gi0/0 to DS1 and Gi0/1 to DS2. <b>PC1</b> sits in VLAN 10 (10.1.10.0/24) and <b>PC2</b> in VLAN 20 (10.1.20.0/24). DS1 owns .2 and DS2 owns .3 in each VLAN, and HSRP provides the virtual gateway .1. A WAN router <b>R1</b> connects to DS1 over 10.0.1.0/30 and to DS2 over 10.0.2.0/30, and reaches the data-centre server <b>SRV</b> (172.16.0.10). OSPF area 0 runs between R1 and the distribution switches.</p>

<div class="eg"><p><b>Worked example.</b> PC1 (10.1.10.11) opens a file on SRV (172.16.0.10). The frame leaves AS1 on the uplink towards the HSRP active gateway, DS1 routes it onto 10.0.1.0/30, R1 routes it to the data-centre LAN. If DS1 dies, HSRP moves 10.1.10.1 to DS2, spanning tree unblocks the DS2 uplink if needed, and OSPF on R1 already has a second equal-cost path through DS2. Three independent mechanisms, each covering a different failure. That is design.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating design as drawing boxes. Every design choice has a protocol consequence. "Two distribution switches" immediately means you must decide the STP root, the HSRP active router, the EtherChannel mode between them and how routing sees both paths. Most outages in well-funded networks are caused by redundancy that was bought but never aligned.</p></div>

<div class="exam"><p><b>Exam trap.</b> ENCOR design questions rarely ask for commands. They describe a situation (many buildings, a small branch, heavy east-west traffic, a supervisor failure) and ask which design or feature fits. Learn the reason behind each option, not just its name.</p></div>

<div class="scn"><h4>The campus that grew one switch at a time</h4><p>A college started with one core switch and added access switches whenever a lab opened, daisy-chaining some of them. After five years a single faulty NIC in one hostel caused a broadcast storm that took down every building, because all 40 switches shared one flat VLAN and one spanning tree. The redesign split the campus into building modules, each with a distribution pair, routed links to a core pair and VLANs that never leave the building.</p><p><b>Lesson:</b> hierarchy and modularity are not paperwork. They are what keeps one bad cable from becoming a campus-wide outage.</p></div>

<div class="iv"><p class="q">"Walk me through how you would design a new enterprise campus."</p><p>Start with requirements: number of users and buildings, applications, growth, availability target. Then describe the hierarchy (access, distribution, core, or collapsed core if small), the Layer 2/3 boundary, redundancy at every layer, how STP and FHRP are aligned, how the campus connects to the data centre, WAN and cloud, and how wireless is deployed. Mentioning failure domains and oversubscription shows you think like a designer, not just a configurator.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Enterprise networks are built from modules joined by a core, like districts joined by a highway.</li>
<li>Access connects users, distribution applies policy and is the L2/L3 boundary, core moves traffic fast.</li>
<li>Redundancy only works when protocols such as STP, FHRP and routing are aligned with it.</li>
<li>This module covers ENCOR 1.1, 1.2, 1.3 and 1.7 at a design level; later modules go deep.</li>
<li>The labs use DS1, DS2, AS1, R1, SRV, PC1 and PC2 in a collapsed-core block.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap kisi bhi enterprise network drawing ko dekh kar samjha paoge ki woh aise kyun bana hai: har box do kyun hain, Layer 2 kahan khatam hoti hai aur Layer 3 kahan shuru, spanning-tree root aur default gateway ek hi switch par kyun hone chahiye, supervisor fail ho jaaye to bhi users ko pata kyun nahi chalta, campus ya branch ke liye kaunsa wireless deployment model sahi hai, kaunsa workload cloud mein jaana chahiye, aur switch hardware mein frame ko actually kaise forward karta hai. Aap lab mein ek redundant collapsed-core block bhi banaoge aur ek toote hue design ko review karoge jab tak traffic lamba raasta lena band na kar de.</p>

<p><b>Prerequisites.</b> Aapko CCNA level ke VLANs aur trunks, spanning tree (root bridge, root port, blocking), LACP ke saath EtherChannel, HSRP basics aur single-area OSPF aana chahiye. Agar inmein se kuch kamzor lage, to pehle STP, EtherChannel aur FHRP ke CCNA modules dobara dekho. Yeh module unhe dobara nahi padhata; unhe <b>design</b> ke building blocks ki tarah use karta hai.</p>

<h3>Ek analogy: network ek shehar ka road system hai</h3>
<p>Ek achhe se planned shehar ki kalpana karo. Har ghar ek shaant <b>local gali</b> par hai. Galiyan <b>arterial roads</b> mein milti hain jahan traffic lights, speed checks aur turn restrictions hote hain. Arterial roads ek tez <b>highway</b> se judte hain jismein koi traffic light nahi, kyunki uska ek hi kaam hai: districts ke beech bahut saari gaadiyan jaldi pahunchana. Har district ek hi template ki copy ki tarah plan hota hai, taaki naya district bina poore shehar ko redesign kiye joda ja sake. Agar repair ke liye ek gali khodi jaaye, to sirf wahi gali affect hoti hai, aur har district mein hamesha doosra raasta hota hai.</p>
<p>Enterprise network bilkul aise hi kaam karta hai. Local galiyan <b>access layer</b> hain jahan users plug in karte hain. Arterial roads <b>distribution layer</b> hain jahan policy aur routing decisions hote hain. Highway <b>core</b> hai. Districts <b>modules</b> hain (ek building, data centre, WAN edge). Doosra raasta <b>redundancy</b> hai. Aur yeh rule ki khodi hui gali sirf ek street ko affect kare, <b>failure domain</b> ka idea hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Enterprise network ke modules">
<rect x="250" y="105" width="140" height="50" rx="10" fill="#fde68a"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="14">Campus core</text>
<rect x="20" y="20" width="170" height="50" rx="10" fill="#bae6fd"/><text x="105" y="50" text-anchor="middle" class="svg-ink" font-size="13">Campus buildings</text>
<rect x="235" y="20" width="170" height="50" rx="10" fill="#bbf7d0"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Data centre</text>
<rect x="450" y="20" width="170" height="50" rx="10" fill="#ddd6fe"/><text x="535" y="50" text-anchor="middle" class="svg-ink" font-size="13">Internet edge</text>
<rect x="20" y="190" width="170" height="50" rx="10" fill="#fed7aa"/><text x="105" y="220" text-anchor="middle" class="svg-ink" font-size="13">WAN / SD-WAN edge</text>
<rect x="235" y="190" width="170" height="50" rx="10" fill="#e2e8f0"/><text x="320" y="220" text-anchor="middle" class="svg-ink" font-size="13">Branches</text>
<rect x="450" y="190" width="170" height="50" rx="10" fill="#bae6fd"/><text x="535" y="220" text-anchor="middle" class="svg-ink" font-size="13">Public cloud</text>
<line x1="190" y1="60" x2="250" y2="115" stroke="#64748b" stroke-width="2"/><line x1="320" y1="70" x2="320" y2="105" stroke="#64748b" stroke-width="2"/><line x1="450" y1="60" x2="390" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="190" y1="200" x2="250" y2="145" stroke="#64748b" stroke-width="2"/><line x1="190" y1="215" x2="235" y2="215" stroke="#64748b" stroke-width="2"/><line x1="535" y1="70" x2="535" y2="190" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="548" y="135" class="svg-muted" font-size="12">VPN / interconnect</text>
</svg><p class="cap">Enterprise modules ka set hai jo core se jude hain. Har module alag se design hota hai aur alag se fail ho sakta hai.</p></div>

<h3>Exam mein yeh module kahan aata hai</h3>
<p>ENCOR 350-401 ka Architecture domain design se shuru hota hai. Yeh module design-level items cover karta hai; baad ke modules un technologies mein gehrai tak jaate hain.</p>
<table class="cmp"><tr><th>Blueprint item</th><th>Aapko kya karna aana chahiye</th><th>Chapters</th></tr>
<tr><td>1.1 Design principles</td><td>2-tier, 3-tier, fabric aur cloud designs samjhana; redundancy, FHRP aur SSO ke saath high availability</td><td>2 se 7</td></tr>
<tr><td>1.2 WLAN deployment models</td><td>Centralised, distributed, controller-less, controller-based, cloud aur remote-branch designs compare karna</td><td>9</td></tr>
<tr><td>1.3 On-premises vs cloud</td><td>Decide karna ki infrastructure kahan rahe aur kaise connect ho</td><td>8</td></tr>
<tr><td>1.7 Hardware vs software switching</td><td>Process switching, CEF, RIB, FIB, adjacency table, CAM aur TCAM samjhana</td><td>10</td></tr>
</table>
<p>SD-WAN aur SD-Access, LISP aur VXLAN, HSRP object tracking aur deep wireless configuration ke apne alag modules baad mein hain. Yahan aap seekhoge ki woh <b>kyun</b> hain aur kahan fit hote hain.</p>

<h3>Lab network jo aap use karoge</h3>
<p>Dono labs ek hi chhota collapsed-core block use karti hain. Do distribution/core switches, <b>DS1</b> aur <b>DS2</b>, do links (Gi0/6 aur Gi0/7) se jude hain. Ek access switch, <b>AS1</b>, ka har ek par uplink hai: Gi0/0 DS1 ki taraf aur Gi0/1 DS2 ki taraf. <b>PC1</b> VLAN 10 (10.1.10.0/24) mein hai aur <b>PC2</b> VLAN 20 (10.1.20.0/24) mein. Har VLAN mein DS1 ke paas .2 aur DS2 ke paas .3 hai, aur HSRP virtual gateway .1 deta hai. WAN router <b>R1</b> DS1 se 10.0.1.0/30 par aur DS2 se 10.0.2.0/30 par juda hai, aur data-centre server <b>SRV</b> (172.16.0.10) tak pahunchta hai. R1 aur distribution switches ke beech OSPF area 0 chalta hai.</p>

<div class="eg"><p><b>Worked example.</b> PC1 (10.1.10.11) SRV (172.16.0.10) par ek file kholta hai. Frame AS1 se HSRP active gateway wale uplink par nikalta hai, DS1 use 10.0.1.0/30 par route karta hai, R1 use data-centre LAN tak route karta hai. Agar DS1 mar jaaye, to HSRP 10.1.10.1 ko DS2 par le jaata hai, zaroorat ho to spanning tree DS2 wala uplink unblock karta hai, aur R1 par OSPF ke paas DS2 ke through pehle se doosra equal-cost path hai. Teen independent mechanisms, har ek alag failure cover karta hai. Yahi design hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Design ko sirf boxes draw karna samajhna. Har design choice ka protocol par asar hota hai. "Do distribution switches" ka matlab turant yeh hai ki aapko STP root, HSRP active router, unke beech EtherChannel mode aur routing dono paths ko kaise dekhti hai, yeh sab decide karna padega. Paise wale networks mein zyada tar outages us redundancy se hote hain jo khareedi gayi lekin kabhi align nahi ki gayi.</p></div>

<div class="exam"><p><b>Exam trap.</b> ENCOR design questions shayad hi commands poochte hain. Woh ek situation batate hain (bahut saari buildings, chhoti branch, heavy east-west traffic, supervisor failure) aur poochte hain ki kaunsa design ya feature fit hota hai. Har option ke peeche ki wajah seekho, sirf naam nahi.</p></div>

<div class="scn"><h4>Woh campus jo ek-ek switch karke bada hua</h4><p>Ek college ne ek core switch se shuru kiya aur jab bhi naya lab khula, access switches jodte gaye, kuch ko daisy-chain karke. Paanch saal baad ek hostel ke ek kharab NIC ne broadcast storm paida kiya jisne har building gira di, kyunki saare 40 switches ek flat VLAN aur ek spanning tree share karte the. Redesign mein campus ko building modules mein baanta gaya, har ek mein distribution pair, core pair tak routed links, aur aise VLANs jo kabhi building se bahar nahi jaate.</p><p><b>Seekh:</b> hierarchy aur modularity kaagzi kaam nahi hain. Yahi ek kharab cable ko poore campus ka outage banne se rokte hain.</p></div>

<div class="iv"><p class="q">"Mujhe batao ki aap ek naya enterprise campus kaise design karoge."</p><p>Requirements se shuru karo: users aur buildings ki sankhya, applications, growth, availability target. Phir hierarchy batao (access, distribution, core, ya chhota ho to collapsed core), Layer 2/3 boundary, har layer par redundancy, STP aur FHRP kaise align hain, campus data centre, WAN aur cloud se kaise judta hai, aur wireless kaise deploy hota hai. Failure domains aur oversubscription ka zikr dikhata hai ki aap designer ki tarah sochte ho, sirf configurator ki tarah nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Enterprise networks modules se bante hain jo core se jude hain, jaise districts highway se.</li>
<li>Access users ko jodta hai, distribution policy lagata hai aur L2/L3 boundary hai, core traffic ko tezi se le jaata hai.</li>
<li>Redundancy tabhi kaam karti hai jab STP, FHRP aur routing jaise protocols uske saath aligned hon.</li>
<li>Yeh module ENCOR 1.1, 1.2, 1.3 aur 1.7 ko design level par cover karta hai; baad ke modules gehrai mein jaate hain.</li>
<li>Labs collapsed-core block mein DS1, DS2, AS1, R1, SRV, PC1 aur PC2 use karti hain.</li>
</ul></div>
`}};export{e as default};