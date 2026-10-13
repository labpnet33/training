var e={id:`topologies`,h:{en:`Topology architectures: 2-tier, 3-tier, spine-leaf, WAN, SOHO and cloud`,hi:`Topology architectures: 2-tier, 3-tier, spine-leaf, WAN, SOHO aur cloud`},body:{en:`
<p>A city's road network has a shape. Small lanes lead to local roads, local roads join a ring road, and the ring road meets the highways. Planners do not connect every lane to every other lane; they pick a hierarchy so traffic flows, failures are contained, and new neighbourhoods can be added. Networks work the same way. The CCNA blueprint asks you to describe the standard shapes: <b>two-tier</b>, <b>three-tier</b>, <b>spine-leaf</b>, <b>WAN</b>, <b>SOHO</b>, and <b>on-premises versus cloud</b>.</p>

<h3>The layers of a campus design</h3>
<dl class="terms">
<dt>Access layer</dt><dd>Where endpoints connect: Layer 2 switches with many ports, PoE for phones and APs, and edge security such as port security and 802.1X.</dd>
<dt>Distribution layer</dt><dd>Aggregates access switches, usually Layer 3 switches. It is the boundary between Layer 2 and Layer 3, hosts the default gateways (SVIs), and applies policy and summarisation.</dd>
<dt>Core layer</dt><dd>A fast, simple, highly available backbone that joins distribution blocks and the data center or WAN edge. It should forward quickly and avoid slow features.</dd>
</dl>

<h3>Two-tier (collapsed core)</h3>
<p>The distribution and core are <b>collapsed</b> into one pair of Layer 3 switches, and access switches connect to both. This suits a single building or a small campus: fewer devices, lower cost, simple to run. Each access switch has two uplinks, one to each collapsed-core switch, for redundancy.</p>

<h3>Three-tier (core, distribution, access)</h3>
<p>When there are many buildings, connecting every distribution pair to every other one becomes a full mesh that does not scale (with n pairs you need about n(n-1)/2 bundles). A dedicated <b>core</b> fixes this: each distribution block connects only to the core. Three-tier suits large campuses; it adds cost but contains failures within a block and makes growth easy.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Three-tier versus spine-leaf">
<text x="160" y="18" text-anchor="middle" class="svg-ink" font-size="13">Three-tier campus</text><text x="480" y="18" text-anchor="middle" class="svg-ink" font-size="13">Spine-leaf data center</text>
<rect x="100" y="30" width="50" height="28" rx="6" fill="#ddd6fe"/><rect x="170" y="30" width="50" height="28" rx="6" fill="#ddd6fe"/><text x="160" y="75" text-anchor="middle" class="svg-muted" font-size="12">core</text>
<rect x="40" y="95" width="50" height="28" rx="6" fill="#bae6fd"/><rect x="100" y="95" width="50" height="28" rx="6" fill="#bae6fd"/><rect x="170" y="95" width="50" height="28" rx="6" fill="#bae6fd"/><rect x="230" y="95" width="50" height="28" rx="6" fill="#bae6fd"/><text x="160" y="140" text-anchor="middle" class="svg-muted" font-size="12">distribution</text>
<rect x="30" y="170" width="40" height="26" rx="6" fill="#bbf7d0"/><rect x="80" y="170" width="40" height="26" rx="6" fill="#bbf7d0"/><rect x="140" y="170" width="40" height="26" rx="6" fill="#bbf7d0"/><rect x="190" y="170" width="40" height="26" rx="6" fill="#bbf7d0"/><rect x="250" y="170" width="40" height="26" rx="6" fill="#bbf7d0"/><text x="160" y="215" text-anchor="middle" class="svg-muted" font-size="12">access</text>
<line x1="125" y1="58" x2="65" y2="95" stroke="#64748b"/><line x1="125" y1="58" x2="125" y2="95" stroke="#64748b"/><line x1="195" y1="58" x2="195" y2="95" stroke="#64748b"/><line x1="195" y1="58" x2="255" y2="95" stroke="#64748b"/>
<line x1="65" y1="123" x2="50" y2="170" stroke="#64748b"/><line x1="125" y1="123" x2="100" y2="170" stroke="#64748b"/><line x1="195" y1="123" x2="160" y2="170" stroke="#64748b"/><line x1="195" y1="123" x2="210" y2="170" stroke="#64748b"/><line x1="255" y1="123" x2="270" y2="170" stroke="#64748b"/>
<rect x="400" y="40" width="60" height="30" rx="6" fill="#ddd6fe"/><text x="430" y="60" text-anchor="middle" class="svg-ink" font-size="12">Spine1</text>
<rect x="500" y="40" width="60" height="30" rx="6" fill="#ddd6fe"/><text x="530" y="60" text-anchor="middle" class="svg-ink" font-size="12">Spine2</text>
<rect x="360" y="160" width="50" height="30" rx="6" fill="#bae6fd"/><text x="385" y="180" text-anchor="middle" class="svg-ink" font-size="12">L1</text>
<rect x="430" y="160" width="50" height="30" rx="6" fill="#bae6fd"/><text x="455" y="180" text-anchor="middle" class="svg-ink" font-size="12">L2</text>
<rect x="500" y="160" width="50" height="30" rx="6" fill="#bae6fd"/><text x="525" y="180" text-anchor="middle" class="svg-ink" font-size="12">L3</text>
<rect x="570" y="160" width="50" height="30" rx="6" fill="#bae6fd"/><text x="595" y="180" text-anchor="middle" class="svg-ink" font-size="12">L4</text>
<line x1="430" y1="70" x2="385" y2="160" stroke="#64748b"/><line x1="430" y1="70" x2="455" y2="160" stroke="#64748b"/><line x1="430" y1="70" x2="525" y2="160" stroke="#64748b"/><line x1="430" y1="70" x2="595" y2="160" stroke="#64748b"/>
<line x1="530" y1="70" x2="385" y2="160" stroke="#64748b"/><line x1="530" y1="70" x2="455" y2="160" stroke="#64748b"/><line x1="530" y1="70" x2="525" y2="160" stroke="#64748b"/><line x1="530" y1="70" x2="595" y2="160" stroke="#64748b"/>
<text x="490" y="215" text-anchor="middle" class="svg-muted" font-size="12">every leaf to every spine</text>
<text x="490" y="235" text-anchor="middle" class="svg-muted" font-size="12">no leaf-leaf or spine-spine links</text>
</svg><p class="cap">Left: hierarchical campus. Right: spine-leaf, where any leaf reaches any other leaf through exactly one spine.</p></div>

<h3>Spine-leaf</h3>
<p>Modern data centers carry mostly <b>east-west</b> traffic (server to server). In spine-leaf, servers connect to <b>leaf</b> switches, and every leaf connects to <b>every spine</b>. Leaves never connect to each other, and spines never connect to each other. Any server reaches any other server on a different leaf in the same number of hops (leaf, spine, leaf), so latency is predictable. Links are usually routed and load-shared with <b>ECMP</b> (equal-cost multipath), so no link sits idle blocked by spanning tree. To grow bandwidth you add spines; to add ports you add leaves.</p>

<div class="eg"><p><b>Worked example.</b> A fabric has 4 spines and 20 leaves: 4 x 20 = <b>80</b> fabric links. Each leaf has 48 x 25G server ports (1200 Gbps down) and 4 x 100G uplinks (400 Gbps up), so the <b>oversubscription</b> ratio is 1200:400 = <b>3:1</b>. Adding two spines (and two more uplinks per leaf) would take it to 2:1. If one spine fails, each leaf loses a quarter of its uplink bandwidth, but nothing becomes unreachable.</p></div>

<h3>WAN architectures</h3>
<p>A WAN connects sites over distance. Shapes: <b>point-to-point</b> (two sites), <b>hub-and-spoke</b> (branches connect to a central hub; cheap, but branch-to-branch traffic goes through the hub), <b>full mesh</b> (every site to every other; best paths, expensive), and <b>partial mesh</b>. Connection options include leased lines, <b>MPLS</b> services from a provider, <b>internet VPN</b> (IPsec, DMVPN) and <b>SD-WAN</b>, which manages several links centrally and steers applications over the best one. Redundancy terms: <b>single-homed</b> (one link to one provider), <b>dual-homed</b> (two links, one provider), <b>multihomed</b> (links to two providers), <b>dual multihomed</b> (two links to each of two providers).</p>

<h3>SOHO</h3>
<p>A small office or home office uses one integrated device that is a router, a small switch, a wireless AP, a firewall, a DHCP server and a NAT gateway all at once, connected to a broadband or fibre line. Simple and cheap, with no redundancy.</p>

<h3>On-premises versus cloud</h3>
<p><b>On-premises</b>: the organisation buys, houses and runs its own servers and network; full control, up-front capital cost (capex), and the team must handle power, cooling, hardware and scaling. <b>Cloud</b>: a provider runs the infrastructure and you consume it as a service (IaaS, PaaS, SaaS), paying as you go (opex), scaling quickly, with responsibility <b>shared</b> between you and the provider. Deployment models: public, private, hybrid (on-prem plus cloud, linked by VPN or private connections) and multicloud. Connectivity to the cloud and the security of what you put there remain the network team's job.</p>

<div class="warn"><p><b>Common mistakes.</b> Connecting leaf to leaf "for extra redundancy" in a spine-leaf fabric (it breaks the equal-hop model). Building three tiers for a single small building. Forgetting that hub-and-spoke makes the hub a single point of failure unless you add a second hub.</p></div>

<div class="exam"><p><b>Exam traps.</b> Collapsed core = two-tier. In spine-leaf every leaf connects to every spine, and servers, firewalls and routers connect only to leaves. Access layer = endpoints and PoE; distribution = L2/L3 boundary and policy; core = fast transport. Cloud moves spending from capex to opex.</p></div>

<div class="scn"><h4>The campus that outgrew its collapsed core</h4><p>A college began with one building on a collapsed core. It then added five more buildings, each with its own distribution pair, and linked every pair to every other pair. Changes became risky, a loop in one building disturbed others, and adding a seventh building meant six new link bundles. The network team introduced a dedicated core pair: every building connected only to the core, each building's Layer 2 stayed inside its distribution block, and new buildings needed just two uplinks.</p><p><b>Lesson:</b> two-tier is right for small sites; once many distribution blocks must talk to each other, a core layer turns a mesh into a clean hierarchy.</p></div>

<div class="iv"><p class="q">"Why do modern data centers use spine-leaf instead of the three-tier design?"</p><p>Explain east-west dominance, the leaf-spine-leaf path that gives equal hops and predictable latency, routed links with ECMP instead of spanning tree blocking half the links, and scaling by adding spines (bandwidth) or leaves (ports). Mention oversubscription and give numbers. Contrast with three-tier, which suits north-south campus traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Two-tier (collapsed core) for small sites; three-tier adds a core when many distribution blocks exist.</li>
<li>Spine-leaf: every leaf to every spine, no leaf-leaf links, equal hops, ECMP, scale by adding spines or leaves.</li>
<li>WAN shapes: point-to-point, hub-and-spoke, full and partial mesh; options: MPLS, internet VPN, SD-WAN; single/dual/multihomed.</li>
<li>SOHO: one box does routing, switching, Wi-Fi, firewall, DHCP and NAT.</li>
<li>On-prem = control and capex; cloud = elastic, opex, shared responsibility; hybrid combines both.</li>
</ul></div>
`,hi:`
<p>Kisi shehar ke road network ka ek shape hota hai. Chhoti galiyan local sadkon tak jaati hain, local sadkein ring road se milti hain, aur ring road highways se milti hai. Planners har gali ko har dusri gali se nahi jodte; woh ek hierarchy chunte hain taaki traffic chale, failures seemit rahein, aur naye mohalle jode ja sakein. Networks bhi aise hi kaam karte hain. CCNA blueprint aapse standard shapes describe karne ko kehta hai: <b>two-tier</b>, <b>three-tier</b>, <b>spine-leaf</b>, <b>WAN</b>, <b>SOHO</b>, aur <b>on-premises vs cloud</b>.</p>

<h3>Campus design ki layers</h3>
<dl class="terms">
<dt>Access layer</dt><dd>Jahan endpoints connect hote hain: bahut saare ports wale Layer 2 switches, phones aur APs ke liye PoE, aur port security aur 802.1X jaisi edge security.</dd>
<dt>Distribution layer</dt><dd>Access switches ko aggregate karti hai, aam taur par Layer 3 switches. Yeh Layer 2 aur Layer 3 ki boundary hai, default gateways (SVIs) host karti hai, aur policy aur summarisation apply karti hai.</dd>
<dt>Core layer</dt><dd>Ek tez, simple, highly available backbone jo distribution blocks aur data center ya WAN edge ko jodta hai. Ise jaldi forward karna chahiye aur slow features se bachna chahiye.</dd>
</dl>

<h3>Two-tier (collapsed core)</h3>
<p>Distribution aur core ek hi pair of Layer 3 switches mein <b>collapse</b> ho jaate hain, aur access switches dono se connect hote hain. Yeh ek building ya chhote campus ke liye theek hai: kam devices, kam cost, chalana simple. Redundancy ke liye har access switch ke do uplinks hote hain, har collapsed-core switch ke liye ek.</p>

<h3>Three-tier (core, distribution, access)</h3>
<p>Jab bahut saari buildings hon, har distribution pair ko har dusre se jodna ek full mesh ban jaata hai jo scale nahi karta (n pairs ke saath lagbhag n(n-1)/2 bundles chahiye). Ek dedicated <b>core</b> ise theek karta hai: har distribution block sirf core se connect hota hai. Three-tier bade campuses ke liye hai; yeh cost badhata hai lekin failures ko ek block ke andar rakhta hai aur growth aasaan banata hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Three-tier vs spine-leaf">
<text x="160" y="18" text-anchor="middle" class="svg-ink" font-size="13">Three-tier campus</text><text x="480" y="18" text-anchor="middle" class="svg-ink" font-size="13">Spine-leaf data center</text>
<rect x="100" y="30" width="50" height="28" rx="6" fill="#ddd6fe"/><rect x="170" y="30" width="50" height="28" rx="6" fill="#ddd6fe"/><text x="160" y="75" text-anchor="middle" class="svg-muted" font-size="12">core</text>
<rect x="40" y="95" width="50" height="28" rx="6" fill="#bae6fd"/><rect x="100" y="95" width="50" height="28" rx="6" fill="#bae6fd"/><rect x="170" y="95" width="50" height="28" rx="6" fill="#bae6fd"/><rect x="230" y="95" width="50" height="28" rx="6" fill="#bae6fd"/><text x="160" y="140" text-anchor="middle" class="svg-muted" font-size="12">distribution</text>
<rect x="30" y="170" width="40" height="26" rx="6" fill="#bbf7d0"/><rect x="80" y="170" width="40" height="26" rx="6" fill="#bbf7d0"/><rect x="140" y="170" width="40" height="26" rx="6" fill="#bbf7d0"/><rect x="190" y="170" width="40" height="26" rx="6" fill="#bbf7d0"/><rect x="250" y="170" width="40" height="26" rx="6" fill="#bbf7d0"/><text x="160" y="215" text-anchor="middle" class="svg-muted" font-size="12">access</text>
<line x1="125" y1="58" x2="65" y2="95" stroke="#64748b"/><line x1="125" y1="58" x2="125" y2="95" stroke="#64748b"/><line x1="195" y1="58" x2="195" y2="95" stroke="#64748b"/><line x1="195" y1="58" x2="255" y2="95" stroke="#64748b"/>
<line x1="65" y1="123" x2="50" y2="170" stroke="#64748b"/><line x1="125" y1="123" x2="100" y2="170" stroke="#64748b"/><line x1="195" y1="123" x2="160" y2="170" stroke="#64748b"/><line x1="195" y1="123" x2="210" y2="170" stroke="#64748b"/><line x1="255" y1="123" x2="270" y2="170" stroke="#64748b"/>
<rect x="400" y="40" width="60" height="30" rx="6" fill="#ddd6fe"/><text x="430" y="60" text-anchor="middle" class="svg-ink" font-size="12">Spine1</text>
<rect x="500" y="40" width="60" height="30" rx="6" fill="#ddd6fe"/><text x="530" y="60" text-anchor="middle" class="svg-ink" font-size="12">Spine2</text>
<rect x="360" y="160" width="50" height="30" rx="6" fill="#bae6fd"/><text x="385" y="180" text-anchor="middle" class="svg-ink" font-size="12">L1</text>
<rect x="430" y="160" width="50" height="30" rx="6" fill="#bae6fd"/><text x="455" y="180" text-anchor="middle" class="svg-ink" font-size="12">L2</text>
<rect x="500" y="160" width="50" height="30" rx="6" fill="#bae6fd"/><text x="525" y="180" text-anchor="middle" class="svg-ink" font-size="12">L3</text>
<rect x="570" y="160" width="50" height="30" rx="6" fill="#bae6fd"/><text x="595" y="180" text-anchor="middle" class="svg-ink" font-size="12">L4</text>
<line x1="430" y1="70" x2="385" y2="160" stroke="#64748b"/><line x1="430" y1="70" x2="455" y2="160" stroke="#64748b"/><line x1="430" y1="70" x2="525" y2="160" stroke="#64748b"/><line x1="430" y1="70" x2="595" y2="160" stroke="#64748b"/>
<line x1="530" y1="70" x2="385" y2="160" stroke="#64748b"/><line x1="530" y1="70" x2="455" y2="160" stroke="#64748b"/><line x1="530" y1="70" x2="525" y2="160" stroke="#64748b"/><line x1="530" y1="70" x2="595" y2="160" stroke="#64748b"/>
<text x="490" y="215" text-anchor="middle" class="svg-muted" font-size="12">har leaf har spine se</text>
<text x="490" y="235" text-anchor="middle" class="svg-muted" font-size="12">leaf-leaf ya spine-spine links nahi</text>
</svg><p class="cap">Left: hierarchical campus. Right: spine-leaf, jahan koi bhi leaf kisi bhi dusri leaf tak bilkul ek spine ke through pahunchti hai.</p></div>

<h3>Spine-leaf</h3>
<p>Modern data centers zyada tar <b>east-west</b> traffic (server se server) le jaate hain. Spine-leaf mein servers <b>leaf</b> switches se connect hote hain, aur har leaf <b>har spine</b> se connect hoti hai. Leaves kabhi aapas mein connect nahi hoti, aur spines kabhi aapas mein nahi. Koi bhi server dusri leaf par kisi bhi server tak same number of hops (leaf, spine, leaf) mein pahunchta hai, isliye latency predictable hoti hai. Links aam taur par routed hote hain aur <b>ECMP</b> (equal-cost multipath) se load share karte hain, isliye koi link spanning tree se blocked hokar khaali nahi baithta. Bandwidth badhane ke liye spines jodo; ports badhane ke liye leaves jodo.</p>

<div class="eg"><p><b>Worked example.</b> Ek fabric mein 4 spines aur 20 leaves hain: 4 x 20 = <b>80</b> fabric links. Har leaf mein 48 x 25G server ports (1200 Gbps neeche) aur 4 x 100G uplinks (400 Gbps upar) hain, isliye <b>oversubscription</b> ratio 1200:400 = <b>3:1</b> hai. Do spines (aur har leaf par do aur uplinks) jodne se yeh 2:1 ho jaayega. Agar ek spine fail ho, to har leaf apni uplink bandwidth ka ek chauthai khoti hai, lekin kuch bhi unreachable nahi hota.</p></div>

<h3>WAN architectures</h3>
<p>WAN doori par sites ko jodta hai. Shapes: <b>point-to-point</b> (do sites), <b>hub-and-spoke</b> (branches ek central hub se connect hoti hain; sasta, lekin branch-to-branch traffic hub se hokar jaata hai), <b>full mesh</b> (har site har dusri se; best paths, mehenga), aur <b>partial mesh</b>. Connection options mein leased lines, provider ki <b>MPLS</b> services, <b>internet VPN</b> (IPsec, DMVPN) aur <b>SD-WAN</b> aate hain, jo kai links ko centrally manage karta hai aur applications ko best link par bhejta hai. Redundancy terms: <b>single-homed</b> (ek provider ka ek link), <b>dual-homed</b> (ek provider ke do links), <b>multihomed</b> (do providers ke links), <b>dual multihomed</b> (do providers mein se har ek ke do links).</p>

<h3>SOHO</h3>
<p>Small office ya home office ek integrated device use karta hai jo ek saath router, chhota switch, wireless AP, firewall, DHCP server aur NAT gateway hai, broadband ya fibre line se connected. Simple aur sasta, bina redundancy ke.</p>

<h3>On-premises vs cloud</h3>
<p><b>On-premises</b>: organisation apne servers aur network khud khareedti, rakhti aur chalati hai; poora control, pehle se capital cost (capex), aur team ko power, cooling, hardware aur scaling sambhalni padti hai. <b>Cloud</b>: provider infrastructure chalata hai aur aap use service ki tarah use karte ho (IaaS, PaaS, SaaS), jitna use utna pay (opex), jaldi scale, aur zimmedari aapke aur provider ke beech <b>shared</b> hoti hai. Deployment models: public, private, hybrid (on-prem plus cloud, VPN ya private connections se jude) aur multicloud. Cloud tak connectivity aur wahan jo aap rakhte ho uski security ab bhi network team ka kaam hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Spine-leaf fabric mein "extra redundancy ke liye" leaf ko leaf se jodna (isse equal-hop model tootta hai). Ek chhoti building ke liye teen tiers banana. Bhoolna ki hub-and-spoke mein hub single point of failure hai jab tak doosra hub na jodo.</p></div>

<div class="exam"><p><b>Exam traps.</b> Collapsed core = two-tier. Spine-leaf mein har leaf har spine se connect hoti hai, aur servers, firewalls aur routers sirf leaves se connect hote hain. Access layer = endpoints aur PoE; distribution = L2/L3 boundary aur policy; core = tez transport. Cloud kharche ko capex se opex mein le jaata hai.</p></div>

<div class="scn"><h4>Campus jo apne collapsed core se bada ho gaya</h4><p>Ek college ne collapsed core par ek building se shuruaat ki. Phir paanch aur buildings jodi, har ek ka apna distribution pair, aur har pair ko har dusre pair se link kar diya. Changes risky ho gaye, ek building ka loop dusron ko pareshaan karta, aur saatvi building jodne ka matlab tha chhe naye link bundles. Network team ne ek dedicated core pair lagaya: har building sirf core se connect hui, har building ka Layer 2 uske distribution block ke andar raha, aur nayi buildings ko sirf do uplinks chahiye the.</p><p><b>Seekh:</b> two-tier chhoti sites ke liye sahi hai; jab bahut saare distribution blocks ko aapas mein baat karni ho, to core layer mesh ko saaf hierarchy mein badal deti hai.</p></div>

<div class="iv"><p class="q">"Modern data centers three-tier design ke bajaye spine-leaf kyun use karte hain?"</p><p>East-west dominance samjhao, leaf-spine-leaf path jo equal hops aur predictable latency deta hai, spanning tree se aadhe links block karne ke bajaye ECMP wale routed links, aur spines (bandwidth) ya leaves (ports) jod kar scaling. Oversubscription mention karo aur numbers do. Three-tier se contrast karo, jo north-south campus traffic ke liye theek hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chhoti sites ke liye two-tier (collapsed core); bahut saare distribution blocks hon to three-tier core jodta hai.</li>
<li>Spine-leaf: har leaf har spine se, leaf-leaf links nahi, equal hops, ECMP, spines ya leaves jod kar scale.</li>
<li>WAN shapes: point-to-point, hub-and-spoke, full aur partial mesh; options: MPLS, internet VPN, SD-WAN; single/dual/multihomed.</li>
<li>SOHO: ek box routing, switching, Wi-Fi, firewall, DHCP aur NAT karta hai.</li>
<li>On-prem = control aur capex; cloud = elastic, opex, shared responsibility; hybrid dono ko jodta hai.</li>
</ul></div>
`}};export{e as default};