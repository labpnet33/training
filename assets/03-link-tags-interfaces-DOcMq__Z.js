var e={id:`link-tags-interfaces`,h:{en:`Link tags, SD-WAN interface profiles and the virtual SD-WAN interface`,hi:`Link tags, SD-WAN interface profiles aur virtual SD-WAN interface`},body:{en:`
<p>Before PAN-OS SD-WAN can choose a path, it must know what the links are. Three objects answer that: the <b>link tag</b> (a name for a kind of link), the <b>SD-WAN interface profile</b> (the facts about one physical link) and the <b>virtual SD-WAN interface</b> (the logical interface that groups links going to the same place). Policy later refers to tags, not to individual interfaces, which is what makes the design scale.</p>
<h3>Analogy: roads and road signs</h3>
<p>A delivery company has many roads: a toll motorway, a free national road, a mountain track. It puts a sign on each road type: "fast and expensive", "slow and free". The dispatcher does not memorise every road; he reads the signs. A link tag is that sign, and the interface profile is the note on the road: which sign, what type of road, how many trucks per hour it carries.</p>
<h3>The three objects</h3>
<table class="cmp"><tr><th>Object</th><th>What it holds</th><th>Documentation facts</th></tr>
<tr><td><b>Link tag</b></td><td>A name that identifies a link or group of similar links</td><td>A link can have only one tag; tags control the order in which interfaces are used for traffic distribution</td></tr>
<tr><td><b>SD-WAN interface profile</b></td><td>The tag assigned to a physical interface, the link type, the maximum upload and download speed, and how often the link is monitored</td><td>Link types named in the documentation include DSL, cable, Ethernet, fiber, LTE or 5G, MPLS, satellite and WiFi; speeds are in Mbps</td></tr>
<tr><td><b>Virtual SD-WAN interface</b></td><td>A numbered logical interface (for example sdwan.1) that groups one or more physical interfaces</td><td>All paths in one SD-WAN interface go to the same destination WAN; the physical interfaces are Layer 3 Ethernet interfaces with SD-WAN enabled</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Link tags and sdwan.1">
<rect x="10" y="20" width="170" height="60" rx="10" fill="#bae6fd"/><text x="95" y="45" text-anchor="middle" class="svg-ink" font-size="13">ethernet1/1</text><text x="95" y="65" text-anchor="middle" class="svg-muted" font-size="11">broadband, tag: Broadband</text>
<rect x="10" y="100" width="170" height="60" rx="10" fill="#bae6fd"/><text x="95" y="125" text-anchor="middle" class="svg-ink" font-size="13">ethernet1/2</text><text x="95" y="145" text-anchor="middle" class="svg-muted" font-size="11">cable, tag: Broadband</text>
<rect x="10" y="180" width="170" height="60" rx="10" fill="#fed7aa"/><text x="95" y="205" text-anchor="middle" class="svg-ink" font-size="13">ethernet1/3</text><text x="95" y="225" text-anchor="middle" class="svg-muted" font-size="11">5G, tag: Cellular</text>
<rect x="250" y="60" width="170" height="130" rx="12" fill="#bbf7d0"/><text x="335" y="95" text-anchor="middle" class="svg-ink" font-size="14">sdwan.1</text><text x="335" y="120" text-anchor="middle" class="svg-muted" font-size="11">virtual interface</text><text x="335" y="140" text-anchor="middle" class="svg-muted" font-size="11">same destination WAN</text>
<line x1="180" y1="50" x2="250" y2="100" stroke="#2563eb" stroke-width="2"/><line x1="180" y1="130" x2="250" y2="125" stroke="#2563eb" stroke-width="2"/><line x1="180" y1="210" x2="250" y2="160" stroke="#ea580c" stroke-width="2"/>
<rect x="490" y="80" width="140" height="90" rx="10" fill="#fde68a"/><text x="560" y="115" text-anchor="middle" class="svg-ink" font-size="13">Static route</text><text x="560" y="135" text-anchor="middle" class="svg-muted" font-size="11">via sdwan.1</text>
<line x1="420" y1="125" x2="490" y2="125" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Two broadband links share a tag, a 5G link has another. The three physical interfaces sit inside sdwan.1, and routing points at sdwan.1.</p></div>
<h3>How the pieces connect</h3>
<ol>
<li>Create a link tag for each class of link (for example Broadband, Cellular, MPLS).</li>
<li>Create an SD-WAN interface profile for each kind of link: tag, link type, upload and download maximum in Mbps, monitoring frequency.</li>
<li>Enable SD-WAN on each physical Layer 3 Ethernet interface and attach its profile.</li>
<li>The physical interfaces are grouped in a virtual SD-WAN interface (sdwan.1, sdwan.2 and so on). The redundant-internet tutorial in the documentation shows exactly this pattern: one sdwan.1 over several ISP links.</li>
<li>Point static routes at the virtual interface, and keep one source NAT rule per physical connection so that the return traffic uses the address of the link it left on.</li>
</ol>
<h3>Why the speeds matter</h3>
<p>The upload and download maximums in the profile are not decoration. Path quality profiles can use bandwidth utilisation as a degradation signal, so a wrong number (a 1 Gbps value on a 100 Mbps circuit) makes the firewall believe the link is nearly idle when it is saturated.</p>
<h3>Portal walk-through (not run in the simulator)</h3>
<p>On Panorama the plugin gives you an SD-WAN section for devices, and the SD-WAN link management objects (tags and profiles) live under the Objects menu in the group named SD-WAN Link Management, which is where the documentation places the path quality, traffic distribution, SaaS quality and error correction profiles. The interface profile is part of the network profiles that you attach to the interface. I describe the places in words, and I do not give click-by-click field names beyond those the documentation names, because menu details change between releases.</p>
<div class="eg"><p><b>Worked example: tags for STORE-007.</b> Interfaces: ethernet1/1 (broadband 300 Mbps down, 50 Mbps up), ethernet1/2 (cable 200/20), ethernet1/3 (5G 100/20). Tags: Broadband for the first two, Cellular for the third. Policy later says "prefer Broadband, then Cellular" without naming any interface. If a store gets a fourth link, you tag it Broadband and policy needs no change.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Giving one link two tags (a link can have only one). Entering the contract speed instead of real usable speed. Grouping links that go to different destinations in one SD-WAN interface. Forgetting the per-link source NAT.</p></div>
<div class="exam"><p><b>Exam trap.</b> "How many tags can a link have?" One. "What groups physical interfaces into one logical path set?" The virtual SD-WAN interface. "What references tags in policy?" Traffic distribution profiles.</p></div>
<div class="scn"><h4>Return traffic on the wrong ISP</h4><p>After SD-WAN goes live, downloads stall on ISP-B only. The cause is a single source NAT rule that translates everything to the ISP-A address. Replies for ISP-B sessions return to ISP-A and break. Adding one NAT rule per physical interface, each translating to its own address, fixes it.</p></div>
<div class="iv"><p class="q">"What is a link tag and why is it useful?"</p><p>A link tag labels a class of links, and a link has only one. Policy and traffic distribution profiles refer to tags, so I can add or replace links without rewriting policy. It plays the role that the circuit label plays in Prisma SD-WAN, but the objects are not the same.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Link tag: name of a link class, one per link.</li>
<li>Interface profile: tag, link type, maximum upload and download speeds, monitoring frequency.</li>
<li>Virtual SD-WAN interface groups links to the same destination WAN.</li>
<li>Routes point at the virtual interface; NAT is per physical link.</li>
</ul></div>
`,hi:`
<p>PAN-OS SD-WAN path chunne se pehle jaanna chahta hai ki links kya hain. Teen objects yeh batate hain: <b>link tag</b> (link ki kism ka naam), <b>SD-WAN interface profile</b> (ek physical link ke facts) aur <b>virtual SD-WAN interface</b> (woh logical interface jo ek hi jagah jaane wale links ko group karta hai). Policy baad mein individual interfaces nahi, tags ko refer karti hai, aur isi se design scale hota hai.</p>
<h3>Analogy: roads aur road signs</h3>
<p>Delivery company ke paas kai roads hain: toll motorway, free national road, pahadi raasta. Woh har road type par sign lagati hai: "tez aur mehenga", "dheema aur free". Dispatcher har road yaad nahi rakhta; woh signs padhta hai. Link tag woh sign hai, aur interface profile road par note hai: kaunsa sign, road kis type ka, ek ghante mein kitne trucks.</p>
<h3>Teen objects</h3>
<table class="cmp"><tr><th>Object</th><th>Kya rakhta hai</th><th>Documentation facts</th></tr>
<tr><td><b>Link tag</b></td><td>Link ya milte-julte links ke group ko pehchanne wala naam</td><td>Ek link ka sirf ek tag ho sakta hai; tags traffic distribution ke liye interfaces use hone ka order control karte hain</td></tr>
<tr><td><b>SD-WAN interface profile</b></td><td>Physical interface ko diya gaya tag, link type, maximum upload aur download speed, aur link kitni baar monitor hota hai</td><td>Documentation mein naam diye link types: DSL, cable, Ethernet, fiber, LTE ya 5G, MPLS, satellite aur WiFi; speeds Mbps mein</td></tr>
<tr><td><b>Virtual SD-WAN interface</b></td><td>Numbered logical interface (jaise sdwan.1) jo ek ya zyada physical interfaces group karta hai</td><td>Ek SD-WAN interface ke saare paths same destination WAN tak jaate hain; physical interfaces SD-WAN enabled Layer 3 Ethernet interfaces hain</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Link tags and sdwan.1">
<rect x="10" y="20" width="170" height="60" rx="10" fill="#bae6fd"/><text x="95" y="45" text-anchor="middle" class="svg-ink" font-size="13">ethernet1/1</text><text x="95" y="65" text-anchor="middle" class="svg-muted" font-size="11">broadband, tag: Broadband</text>
<rect x="10" y="100" width="170" height="60" rx="10" fill="#bae6fd"/><text x="95" y="125" text-anchor="middle" class="svg-ink" font-size="13">ethernet1/2</text><text x="95" y="145" text-anchor="middle" class="svg-muted" font-size="11">cable, tag: Broadband</text>
<rect x="10" y="180" width="170" height="60" rx="10" fill="#fed7aa"/><text x="95" y="205" text-anchor="middle" class="svg-ink" font-size="13">ethernet1/3</text><text x="95" y="225" text-anchor="middle" class="svg-muted" font-size="11">5G, tag: Cellular</text>
<rect x="250" y="60" width="170" height="130" rx="12" fill="#bbf7d0"/><text x="335" y="95" text-anchor="middle" class="svg-ink" font-size="14">sdwan.1</text><text x="335" y="120" text-anchor="middle" class="svg-muted" font-size="11">virtual interface</text><text x="335" y="140" text-anchor="middle" class="svg-muted" font-size="11">same destination WAN</text>
<line x1="180" y1="50" x2="250" y2="100" stroke="#2563eb" stroke-width="2"/><line x1="180" y1="130" x2="250" y2="125" stroke="#2563eb" stroke-width="2"/><line x1="180" y1="210" x2="250" y2="160" stroke="#ea580c" stroke-width="2"/>
<rect x="490" y="80" width="140" height="90" rx="10" fill="#fde68a"/><text x="560" y="115" text-anchor="middle" class="svg-ink" font-size="13">Static route</text><text x="560" y="135" text-anchor="middle" class="svg-muted" font-size="11">via sdwan.1</text>
<line x1="420" y1="125" x2="490" y2="125" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Do broadband links ka ek tag, 5G link ka doosra. Teeno physical interfaces sdwan.1 ke andar hain, aur routing sdwan.1 ko point karti hai.</p></div>
<h3>Pieces kaise jurte hain</h3>
<ol>
<li>Har link class ke liye ek link tag banao (jaise Broadband, Cellular, MPLS).</li>
<li>Har link kind ke liye SD-WAN interface profile banao: tag, link type, upload aur download maximum Mbps mein, monitoring frequency.</li>
<li>Har physical Layer 3 Ethernet interface par SD-WAN enable karo aur uska profile attach karo.</li>
<li>Physical interfaces virtual SD-WAN interface (sdwan.1, sdwan.2 aur aage) mein group hote hain. Documentation ka redundant-internet tutorial yahi pattern dikhata hai: kai ISP links par ek sdwan.1.</li>
<li>Static routes virtual interface ko point karo, aur har physical connection ke liye ek source NAT rule rakho taaki return traffic us link ka address use kare jis se woh nikla.</li>
</ol>
<h3>Speeds kyun matter karti hain</h3>
<p>Profile mein upload aur download maximum sajawat nahi hain. Path quality profiles bandwidth utilisation ko degradation signal ki tarah use kar sakte hain, isliye galat number (100 Mbps circuit par 1 Gbps value) firewall ko yeh maanne par majboor karta hai ki link lagbhag khaali hai jabki woh saturated hai.</p>
<h3>Portal walk-through (not run in the simulator)</h3>
<p>Panorama par plugin aapko devices ke liye SD-WAN section deta hai, aur SD-WAN link management objects (tags aur profiles) Objects menu ke SD-WAN Link Management group mein hain, jahan documentation path quality, traffic distribution, SaaS quality aur error correction profiles rakhti hai. Interface profile network profiles ka hissa hai jise aap interface par attach karte ho. Main jagah shabdon mein batata hoon, aur documentation ke diye naamon se aage click-by-click field names nahi deta, kyunki menu details releases ke beech badalte hain.</p>
<div class="eg"><p><b>Worked example: STORE-007 ke tags.</b> Interfaces: ethernet1/1 (broadband 300 Mbps down, 50 Mbps up), ethernet1/2 (cable 200/20), ethernet1/3 (5G 100/20). Tags: pehle do ko Broadband, teesre ko Cellular. Policy baad mein bina kisi interface ka naam liye kehti hai "Broadband prefer karo, phir Cellular". Agar store ko chautha link mile to use Broadband tag do aur policy mein change nahi chahiye.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Ek link ko do tags dena (ek link ka sirf ek ho sakta hai). Real usable speed ke bajay contract speed bharna. Alag destinations wale links ko ek SD-WAN interface mein group karna. Per-link source NAT bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Ek link ke kitne tags ho sakte hain?" Ek. "Physical interfaces ko ek logical path set mein kaun group karta hai?" Virtual SD-WAN interface. "Policy mein tags kaun refer karta hai?" Traffic distribution profiles.</p></div>
<div class="scn"><h4>Return traffic galat ISP par</h4><p>SD-WAN live hone ke baad downloads sirf ISP-B par ruk jaate hain. Karan ek hi source NAT rule hai jo sab kuch ISP-A address mein translate karta hai. ISP-B sessions ke replies ISP-A par laut aate hain aur toot jaate hain. Har physical interface ke liye ek NAT rule jodna, har ek apne address mein translate karta hua, fix kar deta hai.</p></div>
<div class="iv"><p class="q">"Link tag kya hai aur kyun useful hai?"</p><p>Link tag links ki ek class ko label karta hai, aur ek link ka sirf ek tag hota hai. Policy aur traffic distribution profiles tags ko refer karte hain, isliye main policy dobara likhe bina links add ya replace kar sakta hoon. Yeh wahi role nibhata hai jo Prisma SD-WAN mein circuit label nibhata hai, par objects ek jaise nahi hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Link tag: link class ka naam, ek link ka ek.</li>
<li>Interface profile: tag, link type, maximum upload aur download speeds, monitoring frequency.</li>
<li>Virtual SD-WAN interface same destination WAN ke links group karta hai.</li>
<li>Routes virtual interface ko point karte hain; NAT per physical link.</li>
</ul></div>
`}};export{e as default};