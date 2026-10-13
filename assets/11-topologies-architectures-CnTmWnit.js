var e={id:`topologies`,h:{en:`Topologies and architectures: mesh to spine-leaf, north-south and east-west`,hi:`Topologies aur architectures: mesh se spine-leaf, north-south aur east-west`},body:{en:`
<p>In net-start you saw the classic shapes: bus, ring, star, mesh. Objective 1.6 goes further: it asks you to compare <b>designs</b> that real networks use, count the links they need, and match each design to the traffic it carries. A city is a useful picture. Villages joined by one road to a district town are hub-and-spoke. A city ring road with flyovers to every neighbourhood is closer to spine-leaf. And a national highway plan with local roads, state highways and expressways is the three-tier model.</p>

<h3>Point-to-point, star and hub-and-spoke</h3>
<p>A <b>point-to-point</b> topology is one link between exactly two devices: a WAN circuit between two routers, a dark-fibre link between two buildings, or a routed link addressed with a /30 or /31. Simple, private and easy to troubleshoot, but it connects only two ends.</p>
<p>A <b>star</b> puts a central device in the middle with every node connected to it. Every Ethernet LAN is a physical star around a switch. In the WAN the same shape is called <b>hub-and-spoke</b>: branches (spokes) connect to head office (hub). It is cheap (n-1 links for n sites) and easy to manage, and all policy can be applied at the hub. The costs: the hub is a <b>single point of failure</b> and a bottleneck, and branch-to-branch traffic must travel through the hub.</p>

<h3>Mesh and hybrid</h3>
<p>In a <b>full mesh</b> every node connects to every other node. The number of links is <b>n(n-1)/2</b>. It gives maximum redundancy and direct paths, but cost and complexity grow fast. A <b>partial mesh</b> connects only the important nodes to each other (for example the data centers and big regional offices) and leaves small sites as spokes. Real networks are usually <b>hybrid</b>: a star of access switches, a meshed core, hub-and-spoke WAN branches.</p>

<div class="eg"><p><b>Worked example.</b> Six sites. Full mesh: 6 x 5 / 2 = <b>15 links</b>. Hub-and-spoke: <b>5 links</b>. Partial mesh with the two data centers and the two regional offices meshed (6 links) and two small branches dual-homed to the regions (4 links): <b>10 links</b>. Each extra link buys resilience and shorter paths, and costs money every month.</p></div>

<h3>The three-tier hierarchical model</h3>
<p>The classic campus design splits the network into three layers, each with one job:</p>
<ul>
<li><b>Access layer:</b> where users and devices connect. Access switches, PoE for phones and APs, VLAN assignment, port security.</li>
<li><b>Distribution layer:</b> aggregates access switches for a building or floor, performs inter-VLAN routing, applies policy (ACLs, QoS) and provides redundant gateways.</li>
<li><b>Core layer:</b> a high-speed backbone joining the distribution blocks, the data center and the WAN edge. Its only job is to move traffic fast and reliably; no heavy policy here.</li>
</ul>
<p>The design is modular: adding a building means adding a distribution pair and its access switches, without touching the others.</p>

<h3>Collapsed core</h3>
<p>For small and medium sites, a separate core layer is overkill. A <b>collapsed core</b> (two-tier) design merges core and distribution into one pair of multilayer switches that connect directly to the access switches, the servers and the WAN. It saves cost and rack space; the trade-off is less scale and a larger impact if that pair has a problem.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Three-tier campus compared with spine-leaf">
<text x="150" y="18" text-anchor="middle" class="svg-ink" font-size="13">Three-tier campus</text>
<rect x="90" y="30" width="50" height="26" rx="4" fill="#fde68a"/><rect x="160" y="30" width="50" height="26" rx="4" fill="#fde68a"/><text x="230" y="48" class="svg-muted" font-size="12">Core</text>
<rect x="40" y="96" width="50" height="26" rx="4" fill="#ddd6fe"/><rect x="100" y="96" width="50" height="26" rx="4" fill="#ddd6fe"/><rect x="160" y="96" width="50" height="26" rx="4" fill="#ddd6fe"/><rect x="220" y="96" width="50" height="26" rx="4" fill="#ddd6fe"/><text x="190" y="140" class="svg-muted" font-size="12">Distribution</text>
<rect x="20" y="186" width="44" height="24" rx="4" fill="#bae6fd"/><rect x="80" y="186" width="44" height="24" rx="4" fill="#bae6fd"/><rect x="176" y="186" width="44" height="24" rx="4" fill="#bae6fd"/><rect x="236" y="186" width="44" height="24" rx="4" fill="#bae6fd"/><text x="150" y="232" text-anchor="middle" class="svg-muted" font-size="12">Access</text>
<line x1="115" y1="56" x2="65" y2="96" stroke="#64748b"/><line x1="115" y1="56" x2="125" y2="96" stroke="#64748b"/><line x1="185" y1="56" x2="185" y2="96" stroke="#64748b"/><line x1="185" y1="56" x2="245" y2="96" stroke="#64748b"/>
<line x1="65" y1="122" x2="42" y2="186" stroke="#64748b"/><line x1="125" y1="122" x2="102" y2="186" stroke="#64748b"/><line x1="185" y1="122" x2="198" y2="186" stroke="#64748b"/><line x1="245" y1="122" x2="258" y2="186" stroke="#64748b"/>
<text x="490" y="18" text-anchor="middle" class="svg-ink" font-size="13">Spine-leaf data center</text>
<rect x="400" y="40" width="70" height="30" rx="4" fill="#fde68a"/><text x="435" y="60" text-anchor="middle" class="svg-ink" font-size="12">Spine 1</text>
<rect x="510" y="40" width="70" height="30" rx="4" fill="#fde68a"/><text x="545" y="60" text-anchor="middle" class="svg-ink" font-size="12">Spine 2</text>
<rect x="350" y="160" width="60" height="30" rx="4" fill="#bbf7d0"/><text x="380" y="180" text-anchor="middle" class="svg-ink" font-size="12">Leaf 1</text>
<rect x="430" y="160" width="60" height="30" rx="4" fill="#bbf7d0"/><text x="460" y="180" text-anchor="middle" class="svg-ink" font-size="12">Leaf 2</text>
<rect x="510" y="160" width="60" height="30" rx="4" fill="#bbf7d0"/><text x="540" y="180" text-anchor="middle" class="svg-ink" font-size="12">Leaf 3</text>
<rect x="590" y="160" width="46" height="30" rx="4" fill="#bbf7d0"/><text x="613" y="180" text-anchor="middle" class="svg-ink" font-size="12">Leaf 4</text>
<line x1="435" y1="70" x2="380" y2="160" stroke="#64748b"/><line x1="435" y1="70" x2="460" y2="160" stroke="#64748b"/><line x1="435" y1="70" x2="540" y2="160" stroke="#64748b"/><line x1="435" y1="70" x2="613" y2="160" stroke="#64748b"/>
<line x1="545" y1="70" x2="380" y2="160" stroke="#64748b"/><line x1="545" y1="70" x2="460" y2="160" stroke="#64748b"/><line x1="545" y1="70" x2="540" y2="160" stroke="#64748b"/><line x1="545" y1="70" x2="613" y2="160" stroke="#64748b"/>
<text x="490" y="222" text-anchor="middle" class="svg-muted" font-size="12">Every leaf to every spine; any server is 2 hops away</text>
</svg><p class="cap">Three-tier grows up through layers; spine-leaf grows out by adding leaves and spines.</p></div>

<h3>Spine-leaf</h3>
<p>Modern data centers use <b>spine-leaf</b>. Servers connect to <b>leaf</b> switches (usually top-of-rack). Every leaf connects to <b>every spine</b>. Leaves never connect to each other, and spines never connect to each other. Result: traffic between any two servers on different leaves goes leaf, spine, leaf, always the same number of hops and the same latency. The links are usually routed, and all spines are used at once with <b>ECMP</b> (equal-cost multipath), instead of spanning tree blocking half the links. To add capacity you add spines; to add ports you add leaves. That is called scaling out.</p>

<h3>Traffic flows: north-south and east-west</h3>
<p><b>North-south</b> traffic enters or leaves the data center or site (users and the internet reaching servers). <b>East-west</b> traffic moves between servers inside it (web to application to database, storage replication, backups). Modern applications made east-west the larger flow, which is exactly why data centers moved from three-tier to spine-leaf: three-tier was built for north-south traffic and forces east-west flows up and down the hierarchy. Security follows the same idea: a perimeter firewall inspects north-south, while east-west needs internal segmentation.</p>

<h3>Verifying a leaf's uplinks</h3>
<pre class="code"><span class="c">! LLDP is vendor-neutral: confirm LEAF-01 sees every spine</span>
LEAF-01# show lldp neighbors</pre>
<pre class="out">Capability codes:
    (R) Router, (B) Bridge, (T) Telephone, (C) DOCSIS Cable Device
    (W) WLAN Access Point, (P) Repeater, (S) Station, (O) Other

Device ID           Local Intf     Hold-time  Capability      Port ID
<span class="hl">SPINE-01            Hu1/0/49       120        B,R             Hu1/0/1
SPINE-02            Hu1/0/50       120        B,R             Hu1/0/1</span>

Total entries displayed: 2</pre>
<p>One neighbour per spine, on the uplink ports. A missing spine here means lost bandwidth and a broken design assumption.</p>

<div class="warn"><p><b>Common mistakes.</b> Cabling leaf to leaf "for extra redundancy", which breaks the spine-leaf model. Building a full mesh WAN for many small branches and paying for links nobody uses. Calling a design "redundant" when both core switches share one power feed.</p></div>

<div class="exam"><p><b>Exam traps.</b> Full mesh links = n(n-1)/2. Hub-and-spoke = cheap, hub is a single point of failure. Access-distribution-core = three-tier; core and distribution combined = collapsed core. Every leaf to every spine, no leaf-to-leaf links = spine-leaf. North-south = in and out; east-west = server to server.</p></div>

<div class="scn"><h4>Branch video calls routed through head office</h4><p>A company with 40 branches on a hub-and-spoke WAN rolled out video calling. Calls between two branches in the same city had 180 ms of delay and poor quality, and the head-office internet link hit 100% during the day. Every branch-to-branch call was hairpinning through the hub. The network team moved to a design with dynamic spoke-to-spoke tunnels (a partial mesh created on demand), so calls went directly between branches while management traffic still used the hub.</p><p><b>Lesson:</b> choose the topology from the traffic pattern, and revisit it when the traffic changes.</p></div>

<div class="iv"><p class="q">"Compare a three-tier design with spine-leaf. When would you use each?"</p><p>Strong answer: three-tier (access, distribution, core) suits campuses: hierarchical, modular by building, with policy at distribution, and mostly north-south traffic to the internet and data center. Small sites collapse core and distribution. Spine-leaf suits data centers with heavy east-west traffic: every leaf connects to every spine, any two servers are two hops apart with predictable latency, all uplinks are active with ECMP instead of blocked by spanning tree, and capacity grows by adding spines and leaves. Mention oversubscription ratios as the sizing tool.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Point-to-point joins two ends; star/hub-and-spoke is cheap but has a central single point of failure.</li>
<li>Full mesh needs n(n-1)/2 links; partial mesh and hybrid designs balance cost and resilience.</li>
<li>Three-tier = access, distribution, core; collapsed core merges core and distribution for smaller sites.</li>
<li>Spine-leaf: every leaf to every spine, two hops between servers, ECMP, scale out.</li>
<li>North-south enters and leaves; east-west stays inside and now dominates data center traffic.</li>
</ul></div>
`,hi:`
<p>net-start mein aapne classic shapes dekhi thi: bus, ring, star, mesh. Objective 1.6 aage jaata hai: yeh aapse un <b>designs</b> ko compare karwata hai jo real networks use karte hain, unke links ginwata hai, aur har design ko uske traffic se match karwata hai. Ek sheher achhi picture hai. Gaon jo ek sadak se district town se jude hain, woh hub-and-spoke hain. Sheher ki ring road jiske flyovers har mohalle tak jaate hain, woh spine-leaf ke kareeb hai. Aur local roads, state highways aur expressways wala national highway plan three-tier model hai.</p>

<h3>Point-to-point, star aur hub-and-spoke</h3>
<p><b>Point-to-point</b> topology exactly do devices ke beech ek link hai: do routers ke beech WAN circuit, do buildings ke beech dark-fibre link, ya /30 ya /31 se addressed routed link. Simple, private aur troubleshoot karne mein aasaan, lekin sirf do ends jodta hai.</p>
<p><b>Star</b> beech mein ek central device rakhta hai aur har node usse juda hota hai. Har Ethernet LAN switch ke around physical star hai. WAN mein same shape ko <b>hub-and-spoke</b> kehte hain: branches (spokes) head office (hub) se judti hain. Yeh sasta hai (n sites ke liye n-1 links) aur manage karna aasaan hai, aur saari policy hub par lag sakti hai. Keemat: hub <b>single point of failure</b> aur bottleneck hai, aur branch-to-branch traffic ko hub se hokar jaana padta hai.</p>

<h3>Mesh aur hybrid</h3>
<p><b>Full mesh</b> mein har node har doosre node se juda hota hai. Links ki sankhya <b>n(n-1)/2</b> hai. Yeh maximum redundancy aur seedhe paths deta hai, lekin cost aur complexity tezi se badhti hai. <b>Partial mesh</b> sirf important nodes ko aapas mein jodta hai (jaise data centers aur bade regional offices) aur chhoti sites ko spokes rehne deta hai. Real networks aam taur par <b>hybrid</b> hote hain: access switches ka star, meshed core, hub-and-spoke WAN branches.</p>

<div class="eg"><p><b>Worked example.</b> Chhe sites. Full mesh: 6 x 5 / 2 = <b>15 links</b>. Hub-and-spoke: <b>5 links</b>. Partial mesh jismein do data centers aur do regional offices meshed hain (6 links) aur do chhoti branches regions se dual-homed hain (4 links): <b>10 links</b>. Har extra link resilience aur chhote paths khareedta hai, aur har mahine paisa leta hai.</p></div>

<h3>Three-tier hierarchical model</h3>
<p>Classic campus design network ko teen layers mein baantta hai, har ek ka ek kaam:</p>
<ul>
<li><b>Access layer:</b> jahan users aur devices judte hain. Access switches, phones aur APs ke liye PoE, VLAN assignment, port security.</li>
<li><b>Distribution layer:</b> building ya floor ke access switches ko aggregate karti hai, inter-VLAN routing karti hai, policy (ACLs, QoS) lagati hai aur redundant gateways deti hai.</li>
<li><b>Core layer:</b> high-speed backbone jo distribution blocks, data center aur WAN edge ko jodta hai. Iska ek hi kaam hai traffic ko tez aur reliably le jaana; yahan heavy policy nahi.</li>
</ul>
<p>Design modular hai: nayi building jodne ka matlab ek distribution pair aur uske access switches jodna, baaki ko chhuye bina.</p>

<h3>Collapsed core</h3>
<p>Chhoti aur medium sites ke liye alag core layer zarurat se zyada hai. <b>Collapsed core</b> (two-tier) design core aur distribution ko multilayer switches ke ek pair mein mila deta hai jo seedhe access switches, servers aur WAN se judta hai. Isse cost aur rack space bachta hai; trade-off hai kam scale aur us pair mein problem hone par bada asar.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Three-tier campus aur spine-leaf ki tulna">
<text x="150" y="18" text-anchor="middle" class="svg-ink" font-size="13">Three-tier campus</text>
<rect x="90" y="30" width="50" height="26" rx="4" fill="#fde68a"/><rect x="160" y="30" width="50" height="26" rx="4" fill="#fde68a"/><text x="230" y="48" class="svg-muted" font-size="12">Core</text>
<rect x="40" y="96" width="50" height="26" rx="4" fill="#ddd6fe"/><rect x="100" y="96" width="50" height="26" rx="4" fill="#ddd6fe"/><rect x="160" y="96" width="50" height="26" rx="4" fill="#ddd6fe"/><rect x="220" y="96" width="50" height="26" rx="4" fill="#ddd6fe"/><text x="190" y="140" class="svg-muted" font-size="12">Distribution</text>
<rect x="20" y="186" width="44" height="24" rx="4" fill="#bae6fd"/><rect x="80" y="186" width="44" height="24" rx="4" fill="#bae6fd"/><rect x="176" y="186" width="44" height="24" rx="4" fill="#bae6fd"/><rect x="236" y="186" width="44" height="24" rx="4" fill="#bae6fd"/><text x="150" y="232" text-anchor="middle" class="svg-muted" font-size="12">Access</text>
<line x1="115" y1="56" x2="65" y2="96" stroke="#64748b"/><line x1="115" y1="56" x2="125" y2="96" stroke="#64748b"/><line x1="185" y1="56" x2="185" y2="96" stroke="#64748b"/><line x1="185" y1="56" x2="245" y2="96" stroke="#64748b"/>
<line x1="65" y1="122" x2="42" y2="186" stroke="#64748b"/><line x1="125" y1="122" x2="102" y2="186" stroke="#64748b"/><line x1="185" y1="122" x2="198" y2="186" stroke="#64748b"/><line x1="245" y1="122" x2="258" y2="186" stroke="#64748b"/>
<text x="490" y="18" text-anchor="middle" class="svg-ink" font-size="13">Spine-leaf data center</text>
<rect x="400" y="40" width="70" height="30" rx="4" fill="#fde68a"/><text x="435" y="60" text-anchor="middle" class="svg-ink" font-size="12">Spine 1</text>
<rect x="510" y="40" width="70" height="30" rx="4" fill="#fde68a"/><text x="545" y="60" text-anchor="middle" class="svg-ink" font-size="12">Spine 2</text>
<rect x="350" y="160" width="60" height="30" rx="4" fill="#bbf7d0"/><text x="380" y="180" text-anchor="middle" class="svg-ink" font-size="12">Leaf 1</text>
<rect x="430" y="160" width="60" height="30" rx="4" fill="#bbf7d0"/><text x="460" y="180" text-anchor="middle" class="svg-ink" font-size="12">Leaf 2</text>
<rect x="510" y="160" width="60" height="30" rx="4" fill="#bbf7d0"/><text x="540" y="180" text-anchor="middle" class="svg-ink" font-size="12">Leaf 3</text>
<rect x="590" y="160" width="46" height="30" rx="4" fill="#bbf7d0"/><text x="613" y="180" text-anchor="middle" class="svg-ink" font-size="12">Leaf 4</text>
<line x1="435" y1="70" x2="380" y2="160" stroke="#64748b"/><line x1="435" y1="70" x2="460" y2="160" stroke="#64748b"/><line x1="435" y1="70" x2="540" y2="160" stroke="#64748b"/><line x1="435" y1="70" x2="613" y2="160" stroke="#64748b"/>
<line x1="545" y1="70" x2="380" y2="160" stroke="#64748b"/><line x1="545" y1="70" x2="460" y2="160" stroke="#64748b"/><line x1="545" y1="70" x2="540" y2="160" stroke="#64748b"/><line x1="545" y1="70" x2="613" y2="160" stroke="#64748b"/>
<text x="490" y="222" text-anchor="middle" class="svg-muted" font-size="12">Har leaf har spine se; koi bhi server 2 hops door</text>
</svg><p class="cap">Three-tier layers ke through upar badhta hai; spine-leaf leaves aur spines jod kar bahar badhta hai.</p></div>

<h3>Spine-leaf</h3>
<p>Modern data centers <b>spine-leaf</b> use karte hain. Servers <b>leaf</b> switches se judte hain (aam taur par top-of-rack). Har leaf <b>har spine</b> se judta hai. Leaves kabhi aapas mein nahi judte, aur spines kabhi aapas mein nahi judte. Nateeja: alag leaves ke kinhi do servers ke beech traffic leaf, spine, leaf jaata hai, hamesha same number of hops aur same latency. Links aam taur par routed hote hain, aur saare spines ek saath <b>ECMP</b> (equal-cost multipath) se use hote hain, spanning tree ke aadhe links block karne ki jagah. Capacity badhane ke liye spines jodo; ports badhane ke liye leaves jodo. Ise scaling out kehte hain.</p>

<h3>Traffic flows: north-south aur east-west</h3>
<p><b>North-south</b> traffic data center ya site mein aata ya bahar jaata hai (users aur internet servers tak pahunchte hain). <b>East-west</b> traffic andar servers ke beech chalta hai (web se application se database, storage replication, backups). Modern applications ne east-west ko bada flow bana diya, aur yahi wajah hai ki data centers three-tier se spine-leaf par gaye: three-tier north-south traffic ke liye bana tha aur east-west flows ko hierarchy mein upar-neeche ghumata hai. Security bhi yahi idea follow karti hai: perimeter firewall north-south inspect karta hai, jabki east-west ko internal segmentation chahiye.</p>

<h3>Leaf ke uplinks verify karna</h3>
<pre class="code"><span class="c">! LLDP vendor-neutral hai: confirm karo ki LEAF-01 har spine ko dekhta hai</span>
LEAF-01# show lldp neighbors</pre>
<pre class="out">Capability codes:
    (R) Router, (B) Bridge, (T) Telephone, (C) DOCSIS Cable Device
    (W) WLAN Access Point, (P) Repeater, (S) Station, (O) Other

Device ID           Local Intf     Hold-time  Capability      Port ID
<span class="hl">SPINE-01            Hu1/0/49       120        B,R             Hu1/0/1
SPINE-02            Hu1/0/50       120        B,R             Hu1/0/1</span>

Total entries displayed: 2</pre>
<p>Har spine ka ek neighbour, uplink ports par. Yahan koi spine missing hai to bandwidth kam hai aur design ki assumption tooti hui hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> "Extra redundancy ke liye" leaf se leaf cabling karna, jo spine-leaf model tod deta hai. Bahut saari chhoti branches ke liye full mesh WAN banana aur un links ka paisa dena jinhe koi use nahi karta. Design ko "redundant" kehna jab dono core switches ek hi power feed share karte hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> Full mesh links = n(n-1)/2. Hub-and-spoke = sasta, hub single point of failure. Access-distribution-core = three-tier; core aur distribution mila diye = collapsed core. Har leaf har spine se, koi leaf-to-leaf link nahi = spine-leaf. North-south = andar aur bahar; east-west = server se server.</p></div>

<div class="scn"><h4>Branch video calls jo head office se hokar jaati thi</h4><p>Hub-and-spoke WAN par 40 branches wali ek company ne video calling shuru ki. Same sheher ki do branches ke beech calls mein 180 ms delay aur kharab quality thi, aur head-office internet link din mein 100% par pahunch jaata tha. Har branch-to-branch call hub se hairpin ho rahi thi. Network team ne dynamic spoke-to-spoke tunnels wala design apnaya (demand par bana partial mesh), taaki calls seedhe branches ke beech jaayein jabki management traffic abhi bhi hub use kare.</p><p><b>Seekh:</b> topology traffic pattern se chuno, aur traffic badalne par use dobara dekho.</p></div>

<div class="iv"><p class="q">"Three-tier design ko spine-leaf se compare karo. Har ek ko kab use karoge?"</p><p>Strong answer: three-tier (access, distribution, core) campuses ke liye theek hai: hierarchical, building ke hisaab se modular, distribution par policy, aur zyada tar internet aur data center ki taraf north-south traffic. Chhoti sites core aur distribution collapse karti hain. Spine-leaf bhaari east-west traffic wale data centers ke liye theek hai: har leaf har spine se judta hai, koi bhi do servers predictable latency ke saath do hops door hain, saare uplinks spanning tree se block hone ki jagah ECMP ke saath active hain, aur capacity spines aur leaves jod kar badhti hai. Sizing tool ke roop mein oversubscription ratios mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Point-to-point do ends jodta hai; star/hub-and-spoke sasta hai lekin central single point of failure hai.</li>
<li>Full mesh ko n(n-1)/2 links chahiye; partial mesh aur hybrid designs cost aur resilience balance karte hain.</li>
<li>Three-tier = access, distribution, core; collapsed core chhoti sites ke liye core aur distribution milata hai.</li>
<li>Spine-leaf: har leaf har spine se, servers ke beech do hops, ECMP, scale out.</li>
<li>North-south andar aata aur bahar jaata hai; east-west andar rehta hai aur ab data center traffic par haavi hai.</li>
</ul></div>
`}};export{e as default};