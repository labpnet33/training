var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You now have the architecture vocabulary for the SPCOR exam: the tiers of a provider network, the access technologies feeding it, how aggregation and core are designed, how IOS, IOS XE and IOS XR differ, how XR's commit model works, and where NFV fits. There are no labs for this module. To practise the protocols that live in this architecture, use spcor-mpls-ldp and spcor-l3vpn, and spcor-isis and spcor-bgp for the underlay and service control plane.</p>

<h3>One-page architecture map</h3>
<table class="cmp"><tr><th>Tier</th><th>Job</th><th>Typical devices and state</th></tr>
<tr><td>Access</td><td>Reach customers and cell sites</td><td>OLT, CMTS, small Ethernet nodes; little state</td></tr>
<tr><td>Aggregation</td><td>Collect, apply policy, oversubscribe</td><td>Aggregation routers; QoS, VLAN or label mapping</td></tr>
<tr><td>Core</td><td>Move traffic fast and reliably</td><td>P routers; IGP and labels only</td></tr>
<tr><td>Edge</td><td>Services and peering</td><td>PE, BNG, Internet gateways; VRFs, sessions, policy</td></tr></table>

<h3>Operating system quick comparison</h3>
<table class="cmp"><tr><th></th><th>IOS</th><th>IOS XE</th><th>IOS XR</th></tr>
<tr><td>Design</td><td>Monolithic</td><td>IOS process on Linux base</td><td>Modular and distributed</td></tr>
<tr><td>Config</td><td>Immediate</td><td>Immediate</td><td>Commit and rollback</td></tr>
<tr><td>Role</td><td>Enterprise, older</td><td>Enterprise, WAN, some edge, virtual</td><td>SP core, edge, peering</td></tr></table>

<h3>Can-do checklist</h3>
<ul>
<li>Describe the four tiers and the PE, P, CE, BNG and route reflector roles.</li>
<li>Explain why the core is kept simple and state is pushed to the edge.</li>
<li>Calculate oversubscription and a failure-case utilisation check.</li>
<li>Describe FTTH with OLT and ONT, cable with CMTS, mobile backhaul with SyncE and PTP, and business access.</li>
<li>Explain IGP hierarchy, BGP labelled-unicast (seamless MPLS), route reflectors and why SR simplifies transport.</li>
<li>Compare IOS, IOS XE and IOS XR in architecture, configuration model and role.</li>
<li>Use configure, show configuration, commit, commit confirmed and rollback on XR.</li>
<li>Name the ETSI NFV blocks and the difference between NFV and SDN.</li>
<li>Localise a fault with the blast-radius method.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>BNG</dt><dd>Broadband network gateway: terminates subscriber sessions.</dd>
<dt>BGP-LU</dt><dd>BGP labelled-unicast: carries prefixes with labels across domains.</dd>
<dt>RR</dt><dd>Route reflector: removes the iBGP full mesh.</dd>
<dt>RPL</dt><dd>Route policy language in IOS XR.</dd>
<dt>MANO</dt><dd>NFV management and orchestration: NFVO, VNFM and VIM.</dd>
<dt>SyncE / PTP</dt><dd>Frequency and time-phase synchronisation for mobile transport.</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li>PE holds service state; P routers only forward labelled traffic.</li>
<li>The IGP carries infrastructure; BGP carries services and external routes.</li>
<li>IOS XR changes apply on commit; show configuration shows pending changes.</li>
<li>IOS XR eBGP needs a route policy to pass routes.</li>
<li>IOS XE runs IOS as a process on Linux; IOS XR is modular and distributed.</li>
<li>VNF, NFVI and MANO are the ETSI blocks; MANO has NFVO, VNFM and VIM.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Oversubscription check: 48 access ports at 1 Gbps feed two 10 Gbps uplinks. Sum of access = 48 Gbps, uplink = 20 Gbps, ratio 2.4 to 1. In a single-uplink failure the capacity falls to 10 Gbps, ratio 4.8 to 1. If measured busy-hour traffic is 6 Gbps, one uplink still carries it (60 percent), so the design survives a failure.</p></div>
<div class="warn"><p><b>Common mistake.</b> Memorising product names instead of principles. Exam questions ask about behaviour: what is applied on commit, what restarts alone, what state is where.</p></div>
<div class="exam"><p><b>Exam trap.</b> Words like "commit", "rollback", "per-process restart" and "carrier-class" point to IOS XR; "process on Linux" points to IOS XE; "monolithic" points to classic IOS.</p></div>

<div class="scn"><h4>Putting it together on a design review</h4><p>A reviewer was shown a new metro design. She checked redundancy at each tier, found two aggregation routers per ring, confirmed the IGP carried only loopbacks and links, noticed PE loopbacks were summarised and asked for /32 reachability or BGP-LU, verified headroom for single failures, and asked how changes would be rolled back. The design was approved with two changes.</p><p><b>Lesson:</b> a short, repeatable checklist finds most architectural flaws.</p></div>

<div class="iv"><p class="q">"Summarise the key principles of service provider network architecture."</p><p>Hierarchy of access, aggregation, core and edge; redundancy at each tier; a simple, fast core and service state at the edge; IGP for infrastructure and BGP for services; transport by LDP or SR; capacity planned for failure; an OS fitted to the role (IOS XR for carrier core and edge with commit and rollback); and NFV where software functions help.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four tiers, with state at the edge and a simple core.</li>
<li>IGP for infrastructure, BGP for services, hierarchy for scale.</li>
<li>IOS, IOS XE and IOS XR serve different roles and have different config models.</li>
<li>NFV virtualises functions; SDN controls the network; they complement each other.</li>
<li>Use blast radius and layered troubleshooting.</li>
</ul></div>
`,hi:`
<p>Ab aapke paas SPCOR exam ki architecture vocabulary hai: provider network ke tiers, use feed karne wali access technologies, aggregation aur core kaise design hote hain, IOS, IOS XE aur IOS XR mein kya farq hai, XR ka commit model kaise kaam karta hai, aur NFV kahan fit hota hai. Is module ke liye labs nahi hain. Is architecture mein rehne wale protocols practise karne ke liye spcor-mpls-ldp aur spcor-l3vpn, aur underlay tatha service control plane ke liye spcor-isis aur spcor-bgp use karo.</p>

<h3>Ek-page architecture map</h3>
<table class="cmp"><tr><th>Tier</th><th>Kaam</th><th>Typical devices aur state</th></tr>
<tr><td>Access</td><td>Customers aur cell sites tak pahunchna</td><td>OLT, CMTS, chhote Ethernet nodes; kam state</td></tr>
<tr><td>Aggregation</td><td>Ikattha karna, policy lagana, oversubscribe karna</td><td>Aggregation routers; QoS, VLAN ya label mapping</td></tr>
<tr><td>Core</td><td>Traffic tezi se aur reliably le jaana</td><td>P routers; sirf IGP aur labels</td></tr>
<tr><td>Edge</td><td>Services aur peering</td><td>PE, BNG, Internet gateways; VRFs, sessions, policy</td></tr></table>

<h3>Operating system quick comparison</h3>
<table class="cmp"><tr><th></th><th>IOS</th><th>IOS XE</th><th>IOS XR</th></tr>
<tr><td>Design</td><td>Monolithic</td><td>Linux base par IOS process</td><td>Modular aur distributed</td></tr>
<tr><td>Config</td><td>Immediate</td><td>Immediate</td><td>Commit aur rollback</td></tr>
<tr><td>Role</td><td>Enterprise, purana</td><td>Enterprise, WAN, kuch edge, virtual</td><td>SP core, edge, peering</td></tr></table>

<h3>Can-do checklist</h3>
<ul>
<li>Chaar tiers aur PE, P, CE, BNG tatha route reflector roles describe karo.</li>
<li>Samjhao ki core simple kyun rakha jaata hai aur state edge ki taraf kyun dhakeli jaati hai.</li>
<li>Oversubscription aur failure-case utilisation check calculate karo.</li>
<li>OLT aur ONT ke saath FTTH, CMTS ke saath cable, SyncE tatha PTP ke saath mobile backhaul, aur business access describe karo.</li>
<li>IGP hierarchy, BGP labelled-unicast (seamless MPLS), route reflectors aur SR transport ko simple kyun banata hai, samjhao.</li>
<li>IOS, IOS XE aur IOS XR ko architecture, configuration model aur role mein compare karo.</li>
<li>XR par configure, show configuration, commit, commit confirmed aur rollback use karo.</li>
<li>ETSI NFV blocks aur NFV tatha SDN ka farq batao.</li>
<li>Blast-radius method se fault localise karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>BNG</dt><dd>Broadband network gateway: subscriber sessions terminate karta hai.</dd>
<dt>BGP-LU</dt><dd>BGP labelled-unicast: domains ke across labels ke saath prefixes carry karta hai.</dd>
<dt>RR</dt><dd>Route reflector: iBGP full mesh hata deta hai.</dd>
<dt>RPL</dt><dd>IOS XR mein route policy language.</dd>
<dt>MANO</dt><dd>NFV management aur orchestration: NFVO, VNFM aur VIM.</dd>
<dt>SyncE / PTP</dt><dd>Mobile transport ke liye frequency aur time-phase synchronisation.</dd>
</dl>

<h3>Sabse zyaada tested facts</h3>
<ul>
<li>PE service state rakhta hai; P routers sirf labelled traffic forward karte hain.</li>
<li>IGP infrastructure carry karta hai; BGP services aur external routes.</li>
<li>IOS XR changes commit par apply hote hain; show configuration pending changes dikhata hai.</li>
<li>IOS XR eBGP ko routes pass karne ke liye route policy chahiye.</li>
<li>IOS XE IOS ko Linux par process ke roop mein chalata hai; IOS XR modular aur distributed hai.</li>
<li>VNF, NFVI aur MANO ETSI blocks hain; MANO mein NFVO, VNFM aur VIM hain.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Oversubscription check: 1 Gbps ke 48 access ports do 10 Gbps uplinks ko feed karte hain. Access ka sum = 48 Gbps, uplink = 20 Gbps, ratio 2.4 to 1. Single-uplink failure mein capacity 10 Gbps rah jaati hai, ratio 4.8 to 1. Agar measured busy-hour traffic 6 Gbps hai, to ek uplink abhi bhi use carry karta hai (60 percent), isliye design failure survive karta hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Principles ke bajaye product names yaad karna. Exam questions behaviour poochte hain: commit par kya apply hota hai, kya akele restart hota hai, state kahan hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "commit", "rollback", "per-process restart" aur "carrier-class" jaise words IOS XR ki taraf ishara karte hain; "process on Linux" IOS XE ki taraf; "monolithic" classic IOS ki taraf.</p></div>

<div class="scn"><h4>Design review mein sab jodna</h4><p>Reviewer ko naya metro design dikhaya gaya. Usne har tier par redundancy check ki, har ring par do aggregation routers paye, confirm kiya ki IGP sirf loopbacks aur links carry karta hai, dekha ki PE loopbacks summarised the aur /32 reachability ya BGP-LU maanga, single failures ke liye headroom verify kiya, aur poocha ki changes kaise roll back honge. Design do changes ke saath approve hua.</p><p><b>Lesson:</b> chhoti, repeatable checklist zyaadatar architectural flaws dhoondh leti hai.</p></div>

<div class="iv"><p class="q">"Service provider network architecture ke key principles summarise karo."</p><p>Access, aggregation, core aur edge ki hierarchy; har tier par redundancy; simple, fast core aur edge par service state; infrastructure ke liye IGP aur services ke liye BGP; LDP ya SR se transport; failure ke liye planned capacity; role ke hisaab se OS (carrier core aur edge ke liye commit aur rollback wala IOS XR); aur jahan software functions madad karein wahan NFV.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar tiers, state edge par aur core simple.</li>
<li>Infrastructure ke liye IGP, services ke liye BGP, scale ke liye hierarchy.</li>
<li>IOS, IOS XE aur IOS XR alag roles serve karte hain aur unke config models alag hain.</li>
<li>NFV functions virtualise karta hai; SDN network control karta hai; yeh poorak hain.</li>
<li>Blast radius aur layered troubleshooting use karo.</li>
</ul></div>
`}};export{e as default};