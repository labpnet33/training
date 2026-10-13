var e={id:`provider-architecture`,h:{en:`How an ISP network is built: PoPs, PE, P and CE routers`,hi:`ISP network kaise bante hain: PoPs, PE, P aur CE routers`},body:{en:`
<p>A provider does not buy one giant router. It builds <b>Points of Presence (PoPs)</b>: rooms or buildings in each city that hold a handful of routers, power, cooling and fibre. PoPs are connected by long-distance links. Everything in the exam about "architecture" starts from this simple picture.</p>

<h3>Router roles you must know</h3>
<dl class="terms">
<dt>CE (Customer Edge)</dt><dd>The router at the customer site. It belongs to the customer, or is managed by the provider, but it is the first router the customer owns.</dd>
<dt>PE (Provider Edge)</dt><dd>The provider router that faces customers. It knows customer routes, applies VRFs, policies, QoS and security. It is the "smart" edge.</dd>
<dt>P (Provider core)</dt><dd>A core router. It knows only infrastructure: loopbacks and links. It forwards labelled packets and never holds customer routes.</dd>
<dt>RR (Route Reflector)</dt><dd>A control-plane router that passes BGP routes between PEs so that PEs do not need a full mesh of sessions. Often a P router or a dedicated box.</dd>
<dt>ASBR</dt><dd>A router at the border to another provider or autonomous system. It runs eBGP with the neighbour.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="CE, PE and P routers">
<rect x="10" y="95" width="70" height="50" rx="8" fill="#bae6fd"/><text x="45" y="125" text-anchor="middle" class="svg-ink" font-size="13">CE1</text>
<rect x="115" y="95" width="70" height="50" rx="8" fill="#bbf7d0"/><text x="150" y="125" text-anchor="middle" class="svg-ink" font-size="13">PE1</text>
<rect x="240" y="40" width="70" height="50" rx="8" fill="#fde68a"/><text x="275" y="70" text-anchor="middle" class="svg-ink" font-size="13">P1</text>
<rect x="240" y="150" width="70" height="50" rx="8" fill="#fde68a"/><text x="275" y="180" text-anchor="middle" class="svg-ink" font-size="13">P2</text>
<rect x="345" y="95" width="70" height="50" rx="8" fill="#ddd6fe"/><text x="380" y="125" text-anchor="middle" class="svg-ink" font-size="13">RR</text>
<rect x="450" y="95" width="70" height="50" rx="8" fill="#bbf7d0"/><text x="485" y="125" text-anchor="middle" class="svg-ink" font-size="13">PE2</text>
<rect x="555" y="95" width="70" height="50" rx="8" fill="#bae6fd"/><text x="590" y="125" text-anchor="middle" class="svg-ink" font-size="13">CE2</text>
<g stroke="#64748b" stroke-width="2"><line x1="80" y1="120" x2="115" y2="120"/><line x1="185" y1="110" x2="240" y2="70"/><line x1="185" y1="130" x2="240" y2="175"/><line x1="310" y1="65" x2="345" y2="110"/><line x1="310" y1="175" x2="345" y2="130"/><line x1="415" y1="120" x2="450" y2="120"/><line x1="520" y1="120" x2="555" y2="120"/><line x1="275" y1="90" x2="275" y2="150"/></g>
<text x="97" y="85" text-anchor="middle" class="svg-muted" font-size="11">PE-CE</text>
<text x="320" y="228" text-anchor="middle" class="svg-accent" font-size="12">PE routers face customers; P routers only switch labels in the middle</text>
</svg><p class="cap">Two PEs, two P routers and a route reflector: the shape of many real cores.</p></div>

<h3>Why the design looks like this</h3>
<ul>
<li><b>Dual everything.</b> Each PE connects to two P routers, and each PoP has two PEs. A single fibre cut or router failure must not isolate a city.</li>
<li><b>Hierarchy limits state.</b> Only PEs know customer routes. Hundreds of P routers know only a few hundred loopbacks, so the core is fast and cheap to run.</li>
<li><b>Roles are logical, not boxes.</b> One physical router can be a PE for some services and a P for transit. The role is what the router does, not the model number.</li>
<li><b>Layers can be merged.</b> A small ISP may combine aggregation and core in one pair of routers. Metro providers often use aggregation to build rings.</li>
</ul>

<h3>What providers sell</h3>
<table class="cmp"><tr><th>Service</th><th>What the customer gets</th><th>Technology</th></tr>
<tr><td>Internet access (DIA)</td><td>An IP address block and a path to the internet</td><td>Static or BGP on the PE, global routing table</td></tr>
<tr><td>L3VPN (private IP WAN)</td><td>A routed private network between sites</td><td>VRFs, MP-BGP VPNv4, MPLS</td></tr>
<tr><td>L2VPN (Ethernet service)</td><td>A virtual cable or LAN between sites</td><td>Pseudowires, VPLS, EVPN</td></tr>
<tr><td>Wholesale and transit</td><td>Capacity for another provider</td><td>eBGP at the ASBR, peering</td></tr></table>
<p>L3VPN and L2VPN are covered in two later chapters of this module, and in full depth in the spcor-l3vpn and spcor-l2vpn modules.</p>

<div class="eg"><p><b>Worked example.</b> Metro Fibre has PoPs in Mumbai, Pune and Nashik. Each PoP has two routers, PE-A and PE-B. Mumbai and Pune are linked by two 100G circuits on different fibre routes, and Nashik hangs off both. If the Mumbai-Pune primary fibre is cut, the IGP recomputes in under a second and the traffic moves to the second circuit or goes round through Nashik. Customers keep their sessions because the PEs never lost their loopback reachability.</p></div>

<div class="warn"><p><b>Common mistake.</b> Assuming a P router must be "smaller" than a PE. In many networks P routers are the biggest boxes, because they carry the most traffic. P means "no customers", not "small".</p></div>
<div class="exam"><p><b>Exam trap.</b> The word "edge" is used for both PE and ASBR. Read carefully: a PE connects customers; an ASBR connects another autonomous system. Also, the CE is not part of the provider's MPLS domain: the PE-CE link normally carries plain IP.</p></div>

<div class="scn"><h4>One fibre cut, two cities</h4><p>A single conduit carried both of a provider's circuits between two cities because a contractor had shared the trench. A digger cut it and both cities were isolated although the design drawing showed two links. The engineers added a third path through a third PoP and recorded shared-risk groups in their documentation.</p><p><b>Lesson:</b> redundancy on paper is not redundancy in the ground; architecture includes the physical layer.</p></div>

<div class="iv"><p class="q">"What is the difference between a PE and a P router?"</p><p>A PE connects customers and holds customer routes in VRFs or the internet table. A P router sits in the core, runs the IGP and label switching, and holds no customer routes. Say that this separation is why the core scales, and mention that one physical box can play both roles.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PoPs hold the routers; layers are access, aggregation and core.</li>
<li>CE is the customer router; PE faces customers; P is the core.</li>
<li>P routers know only infrastructure routes; PEs know customer routes.</li>
<li>RRs reduce BGP sessions; ASBRs connect other autonomous systems.</li>
<li>Redundancy must exist in the physical layer as well as in the design drawing.</li>
</ul></div>
`,hi:`
<p>Provider ek giant router nahi kharidta. Woh <b>Points of Presence (PoPs)</b> banata hai: har city mein kamre ya buildings jahan kuch routers, power, cooling aur fibre hote hain. PoPs long-distance links se jude hote hain. "Architecture" ke baare mein exam ka sab kuch is simple picture se shuru hota hai.</p>

<h3>Router roles jo aapko aani chahiye</h3>
<dl class="terms">
<dt>CE (Customer Edge)</dt><dd>Customer site ka router. Yeh customer ka hota hai, ya provider manage karta hai, par yeh pehla router hai jo customer ka apna hai.</dd>
<dt>PE (Provider Edge)</dt><dd>Provider ka woh router jo customers ki taraf face karta hai. Use customer routes pata hote hain, woh VRFs, policies, QoS aur security lagata hai. Yeh "smart" edge hai.</dd>
<dt>P (Provider core)</dt><dd>Core router. Use sirf infrastructure pata hai: loopbacks aur links. Woh labelled packets forward karta hai aur kabhi customer routes nahi rakhta.</dd>
<dt>RR (Route Reflector)</dt><dd>Control-plane router jo PEs ke beech BGP routes pass karta hai taaki PEs ko sessions ka full mesh na chahiye. Aksar P router ya dedicated box hota hai.</dd>
<dt>ASBR</dt><dd>Doosre provider ya autonomous system ki border par router. Woh neighbour ke saath eBGP chalata hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="CE, PE aur P routers">
<rect x="10" y="95" width="70" height="50" rx="8" fill="#bae6fd"/><text x="45" y="125" text-anchor="middle" class="svg-ink" font-size="13">CE1</text>
<rect x="115" y="95" width="70" height="50" rx="8" fill="#bbf7d0"/><text x="150" y="125" text-anchor="middle" class="svg-ink" font-size="13">PE1</text>
<rect x="240" y="40" width="70" height="50" rx="8" fill="#fde68a"/><text x="275" y="70" text-anchor="middle" class="svg-ink" font-size="13">P1</text>
<rect x="240" y="150" width="70" height="50" rx="8" fill="#fde68a"/><text x="275" y="180" text-anchor="middle" class="svg-ink" font-size="13">P2</text>
<rect x="345" y="95" width="70" height="50" rx="8" fill="#ddd6fe"/><text x="380" y="125" text-anchor="middle" class="svg-ink" font-size="13">RR</text>
<rect x="450" y="95" width="70" height="50" rx="8" fill="#bbf7d0"/><text x="485" y="125" text-anchor="middle" class="svg-ink" font-size="13">PE2</text>
<rect x="555" y="95" width="70" height="50" rx="8" fill="#bae6fd"/><text x="590" y="125" text-anchor="middle" class="svg-ink" font-size="13">CE2</text>
<g stroke="#64748b" stroke-width="2"><line x1="80" y1="120" x2="115" y2="120"/><line x1="185" y1="110" x2="240" y2="70"/><line x1="185" y1="130" x2="240" y2="175"/><line x1="310" y1="65" x2="345" y2="110"/><line x1="310" y1="175" x2="345" y2="130"/><line x1="415" y1="120" x2="450" y2="120"/><line x1="520" y1="120" x2="555" y2="120"/><line x1="275" y1="90" x2="275" y2="150"/></g>
<text x="97" y="85" text-anchor="middle" class="svg-muted" font-size="11">PE-CE</text>
<text x="320" y="228" text-anchor="middle" class="svg-accent" font-size="12">PE customers ki taraf; P routers beech mein sirf labels switch karte hain</text>
</svg><p class="cap">Do PEs, do P routers aur ek route reflector: kai real cores ka shape.</p></div>

<h3>Design aisa kyun dikhta hai</h3>
<ul>
<li><b>Sab kuch dual.</b> Har PE do P routers se juda hai, aur har PoP mein do PEs hain. Ek fibre cut ya router failure se kisi city ko isolate nahi hona chahiye.</li>
<li><b>Hierarchy state ko limit karti hai.</b> Sirf PEs ko customer routes pata hain. Saikdon P routers ko sirf kuch sau loopbacks pata hain, isliye core tez aur sasta chalta hai.</li>
<li><b>Roles logical hain, boxes nahi.</b> Ek physical router kuch services ke liye PE aur transit ke liye P ho sakta hai. Role woh hai jo router karta hai, model number nahi.</li>
<li><b>Layers merge ho sakti hain.</b> Chhota ISP aggregation aur core ek hi router pair mein mila sakta hai. Metro providers aksar rings banane ke liye aggregation use karte hain.</li>
</ul>

<h3>Providers kya bechte hain</h3>
<table class="cmp"><tr><th>Service</th><th>Customer ko kya milta hai</th><th>Technology</th></tr>
<tr><td>Internet access (DIA)</td><td>IP address block aur internet tak path</td><td>PE par static ya BGP, global routing table</td></tr>
<tr><td>L3VPN (private IP WAN)</td><td>Sites ke beech routed private network</td><td>VRFs, MP-BGP VPNv4, MPLS</td></tr>
<tr><td>L2VPN (Ethernet service)</td><td>Sites ke beech virtual cable ya LAN</td><td>Pseudowires, VPLS, EVPN</td></tr>
<tr><td>Wholesale aur transit</td><td>Doosre provider ke liye capacity</td><td>ASBR par eBGP, peering</td></tr></table>
<p>L3VPN aur L2VPN is module ke aage ke do chapters mein hain, aur poori depth mein spcor-l3vpn aur spcor-l2vpn modules mein.</p>

<div class="eg"><p><b>Worked example.</b> Metro Fibre ke PoPs Mumbai, Pune aur Nashik mein hain. Har PoP mein do routers hain, PE-A aur PE-B. Mumbai aur Pune do alag fibre routes par do 100G circuits se jude hain, aur Nashik dono se latka hai. Mumbai-Pune ka primary fibre kat jaaye to IGP ek second se kam mein dobara compute karta hai aur traffic doosre circuit par ya Nashik se ghoomkar chala jaata hai. Customers ke sessions bache rehte hain kyunki PEs ka loopback reachability kabhi gaya hi nahi.</p></div>

<div class="warn"><p><b>Common mistake.</b> Maan lena ki P router PE se "chhota" hona chahiye. Kai networks mein P routers sabse bade boxes hote hain kyunki woh sabse zyada traffic le jaate hain. P ka matlab "koi customer nahi" hai, "chhota" nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Edge" shabd PE aur ASBR dono ke liye use hota hai. Dhyan se padho: PE customers ko jodta hai; ASBR doosre autonomous system ko jodta hai. Aur CE provider ke MPLS domain ka hissa nahi hai: PE-CE link aam taur par plain IP le jaata hai.</p></div>

<div class="scn"><h4>Ek fibre cut, do cities</h4><p>Ek provider ke do circuits do cities ke beech ek hi conduit se guzarte the kyunki contractor ne trench share kar li thi. Digger ne use kaat diya aur dono cities isolate ho gayi jabki design drawing mein do links dikhte the. Engineers ne teesre PoP se teesra path joda aur apni documentation mein shared-risk groups likhe.</p><p><b>Lesson:</b> kaagaz par redundancy zameen mein redundancy nahi hoti; architecture mein physical layer bhi shamil hai.</p></div>

<div class="iv"><p class="q">"PE aur P router mein kya difference hai?"</p><p>PE customers ko jodta hai aur VRFs ya internet table mein customer routes rakhta hai. P router core mein baithta hai, IGP aur label switching chalata hai, aur koi customer route nahi rakhta. Kaho ki isi separation se core scale hota hai, aur zikr karo ki ek physical box dono roles nibha sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PoPs mein routers hote hain; layers access, aggregation aur core hain.</li>
<li>CE customer ka router hai; PE customers ki taraf face karta hai; P core hai.</li>
<li>P routers sirf infrastructure routes jaante hain; PEs customer routes.</li>
<li>RRs BGP sessions kam karte hain; ASBRs doosre autonomous systems ko jodte hain.</li>
<li>Redundancy physical layer mein bhi honi chahiye, sirf design drawing mein nahi.</li>
</ul></div>
`}};export{e as default};