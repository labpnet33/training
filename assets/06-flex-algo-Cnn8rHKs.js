var e={id:`flex-algo`,h:{en:`Flexible algorithm: constraint-based planes inside the IGP`,hi:`Flexible algorithm: IGP ke andar constraint-based planes`},body:{en:`
<p>A normal IGP runs one shortest-path calculation with one metric. Imagine a city with one set of road signs that always point to the cheapest route. <b>Flexible algorithm (flex-algo)</b> lets the city also print a second set of signs for "fastest route avoiding toll roads", and a third for "route over only the north ring". Each set is a separate <b>plane</b> in the same network, and a packet follows the plane whose signs it is given. All of this is done inside IS-IS or OSPF, so no tunnels are needed.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="Each flex-algo is a separate shortest-path computation with its own metric and constraints on the same physical network."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Algo 0</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">IGP metric, default</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Algo 128</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">min delay, avoid red</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Algo 129</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">plane A only</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Same links</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">one topology</text><text x="320" y="128" text-anchor="middle" class="svg-accent" font-size="12">Every plane has its own prefix-SIDs, so traffic is steered by picking the SID</text></svg><p class="cap">Each flex-algo is a separate shortest-path computation with its own metric and constraints on the same physical network.</p></div>
<h3>What a flex-algo is made of</h3>
<ul>
<li><b>Algorithm number.</b> Algorithm 0 is the regular IGP shortest path. Flex-algos use numbers <b>128 to 255</b>.</li>
<li><b>Flex-Algorithm Definition (FAD).</b> A small rule set that says what the plane computes: the <b>metric type</b> (the IGP metric, the minimum unidirectional link delay, or the TE metric) and <b>constraints</b> (exclude-any, include-any or include-all affinities, and optionally excluded SRLGs).</li>
<li><b>Participation.</b> A router joins an algorithm by advertising it in the IGP. Only participating routers appear in that plane, so the plane can be a subset of the network. Routers that do not participate simply do not forward that plane's traffic.</li>
<li><b>Per-algorithm prefix-SID.</b> A loopback has a normal prefix-SID for algorithm 0 and, for example, a second prefix-SID for algorithm 128 with its own index. Sending traffic to the algo-128 SID of PE2 means "go to PE2 along the algo-128 shortest path".</li>
</ul>
<h3>How the definition is distributed</h3>
<p>Any node can <b>advertise a FAD</b> in the IGP (IS-IS or OSPF, RFC 9350). All participating nodes must use the same definition, so if two nodes advertise different FADs for the same algorithm, a rule selects one: the highest <b>priority</b> value wins, then the highest router ID as a tie-break. Operators usually choose two or three routers (for example route reflectors) to advertise the definition and leave the rest as consumers. This avoids per-router configuration drift. A node that does not support the advertised definition stays out of that plane.</p>
<h3>Reference configuration (IOS XR style)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
segment-routing
 traffic-eng
  affinity-map
   name RED bit-position 2
<span class="c">  !</span>
<span class="c"> !</span>
<span class="c">!</span>
router isis CORE
 flex-algo 128
  priority 200
  metric-type delay
  affinity exclude-any RED
  advertise-definition
<span class="c"> !</span>
 address-family ipv4 unicast
  segment-routing mpls
<span class="c"> !</span>
 interface Loopback0
  address-family ipv4 unicast
   prefix-sid index 1
   prefix-sid algorithm 128 index 1128
<span class="c">  !</span>
<span class="c"> !</span>
 interface TenGigE0/0/0/1
  affinity flex-algo RED
  address-family ipv4 unicast
<span class="c">  !</span>
<span class="c"> !</span></pre>
<p>Reading it: the router participates in algorithm 128 and advertises the definition "minimum delay metric, exclude links with color RED". The loopback has the normal SID (index 1) and an algo-128 SID (index 1128, so label 17128 with the default SRGB). The interface towards the congested or expensive provider link is marked RED, so algorithm 128 never crosses it. Delay metrics come from link delay measurement; if not available, define the plane with the TE metric or IGP metric. Each flex-algo SID needs an index outside the plain-prefix index range.</p>
<h3>Using a flex-algo</h3>
<table class="cmp"><tr><th>Method</th><th>How</th></tr><tr><td>Direct SID</td><td>A service or policy uses the algo-128 prefix-SID of the endpoint as the next hop label</td></tr><tr><td>SR-TE policy</td><td>A dynamic candidate path is told to use a SID algorithm, so its computed list stays inside the plane</td></tr><tr><td>ODN with color</td><td>The ODN template for color 100 points to flex-algo 128, so routes with color 100 follow it with no extra work</td></tr><tr><td>TI-LFA</td><td>Protection is computed inside the same flex-algo, so repair never leaves the plane</td></tr></table>
<p>The key advantage over SR-TE with long segment lists is that the constraints are applied by the IGP, so the label stack stays at <b>one label</b>: the endpoint's algo-128 SID. The network follows the plane hop by hop. This scales much better and survives topology changes without any head-end recomputation.</p>
<h3>Typical use cases</h3>
<ul>
<li><b>Low-latency plane.</b> Metric type delay, serving voice, trading or gaming traffic.</li>
<li><b>Dual-plane network.</b> Two disjoint planes (for example "plane A" and "plane B" links by affinity). A customer connects to both for end-to-end redundancy.</li>
<li><b>Avoiding a link class</b> such as satellite, expensive transit or a particular vendor.</li>
<li><b>Network slicing</b> where a subset of nodes and links forms a plane for one customer.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> A provider has two metro rings per region. Links on ring 1 carry the colour RED, links on ring 2 are BLUE. Flex-algo 128 excludes BLUE and flex-algo 129 excludes RED. The bank's VPN is steered to PE2's algo-128 SID and only uses ring 1. A fibre cut on ring 1 triggers TI-LFA inside algo 128, so the repair stays on ring 1. If the bank also wants a disjoint backup, a second VPN path is steered to the algo-129 SID of PE2, which never touches ring 1.</p></div>
<div class="warn"><p><b>Common mistake.</b> Forgetting that every router in the plane needs the algorithm, an algo-specific SID and the same definition. A router that does not participate in algorithm 128 breaks the plane at that point; traffic to the algo-128 SID is dropped there. Another mistake: making the constraints so tight that the plane is partitioned and some PEs become unreachable in it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Algorithm numbers 128 to 255 are flexible; 0 is the IGP shortest path and 1 is strict SPF. The definition (FAD) is advertised by nodes and the highest priority wins. The plane has its own prefix-SIDs. Flex-algo does not need RSVP, tunnels or head-end computation.</p></div>
<div class="scn"><h4>Latency plane for the exchange</h4><p>A stock exchange customer needed the lowest latency between two data centres. The provider built flex-algo 128 with the delay metric, excluded the satellite-backed link by affinity, and gave the PEs algo-128 SIDs. Using one label to the destination algo-128 SID replaced a 5-segment SR-TE list. When a longer detour was added in the network, the plane avoided it automatically.</p><p><b>Lesson:</b> flex-algo moves the constraints into the IGP, so the stack is short and the plane adapts by itself.</p></div>
<div class="iv"><p class="q">"What is flexible algorithm and when would you use it instead of SR-TE with explicit lists?"</p><p>Flex-algo defines a separate IGP shortest-path computation, with algorithm number 128 to 255, its own metric type (IGP, delay or TE) and constraints (affinities, SRLG), advertised as a definition in the IGP. Nodes that participate get per-algorithm prefix-SIDs, so traffic to that SID follows the constrained plane with a single label, and TI-LFA works inside the plane. I use it for repeatable intents like low latency or disjoint planes at scale, and SR-TE explicit paths for one-off special paths.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flex-algo is a constraint-based IGP computation with its own metric and SIDs, algorithms 128 to 255.</li>
<li>The FAD is advertised in the IGP; highest priority wins on conflicts.</li>
<li>Only participating nodes are in the plane; each has an algo-specific prefix-SID.</li>
<li>One label to the algo SID follows the plane; TI-LFA stays inside it.</li>
<li>Use cases: low latency, dual planes, avoiding link classes, slicing.</li>
</ul></div>
`,hi:`
<p>Normal IGP ek metric ke saath ek shortest-path calculation chalata hai. Ek shehar ki socho jisme road signs ka ek hi set hai jo hamesha sabse sasta route dikhata hai. <b>Flexible algorithm (flex-algo)</b> shehar ko "toll roads se bachkar sabse tez route" ke liye doosra set aur "sirf north ring wala route" ke liye teesra set chhapne deta hai. Har set same network mein alag <b>plane</b> hai, aur packet usi plane ko follow karta hai jiske signs use diye jaayein. Yeh sab IS-IS ya OSPF ke andar hota hai, isliye tunnels nahi chahiye.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="Har flex-algo same physical network par apne metric aur constraints ke saath alag shortest-path computation hai."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Algo 0</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">IGP metric, default</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Algo 128</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">min delay, red avoid</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Algo 129</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">sirf plane A</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Same links</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">ek topology</text><text x="320" y="128" text-anchor="middle" class="svg-accent" font-size="12">Har plane ke apne prefix-SIDs hain, isliye SID chunkar traffic steer hota hai</text></svg><p class="cap">Har flex-algo same physical network par apne metric aur constraints ke saath alag shortest-path computation hai.</p></div>
<h3>Flex-algo kis se bana hai</h3>
<ul>
<li><b>Algorithm number.</b> Algorithm 0 regular IGP shortest path hai. Flex-algos <b>128 se 255</b> numbers use karte hain.</li>
<li><b>Flex-Algorithm Definition (FAD).</b> Chhota rule set jo batata hai plane kya compute karta hai: <b>metric type</b> (IGP metric, minimum unidirectional link delay, ya TE metric) aur <b>constraints</b> (exclude-any, include-any ya include-all affinities, aur optionally excluded SRLGs).</li>
<li><b>Participation.</b> Router IGP mein algorithm advertise karke usme judta hai. Sirf participating routers us plane mein dikhte hain, isliye plane network ka subset ho sakta hai. Jo routers participate nahi karte woh us plane ka traffic forward nahi karte.</li>
<li><b>Per-algorithm prefix-SID.</b> Loopback ka algorithm 0 ke liye normal prefix-SID hota hai aur, jaise, algorithm 128 ke liye apne index ke saath doosra prefix-SID. PE2 ke algo-128 SID par traffic bhejne ka matlab "PE2 tak algo-128 shortest path se jao".</li>
</ul>
<h3>Definition kaise distribute hoti hai</h3>
<p>Koi bhi node IGP mein <b>FAD advertise</b> kar sakta hai (IS-IS ya OSPF, RFC 9350). Saare participating nodes ko same definition use karni chahiye, isliye do nodes same algorithm ke liye alag FADs advertise karein to rule ek chunta hai: sabse high <b>priority</b> value jeetti hai, phir tie-break mein sabse high router ID. Operators aam taur par do-teen routers (jaise route reflectors) ko definition advertise karne ke liye chunte hain aur baaki ko consumers rakhte hain. Isse per-router configuration drift bachta hai. Jo node advertised definition support nahi karta woh us plane se bahar rehta hai.</p>
<h3>Reference configuration (IOS XR style)</h3>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
segment-routing
 traffic-eng
  affinity-map
   name RED bit-position 2
<span class="c">  !</span>
<span class="c"> !</span>
<span class="c">!</span>
router isis CORE
 flex-algo 128
  priority 200
  metric-type delay
  affinity exclude-any RED
  advertise-definition
<span class="c"> !</span>
 address-family ipv4 unicast
  segment-routing mpls
<span class="c"> !</span>
 interface Loopback0
  address-family ipv4 unicast
   prefix-sid index 1
   prefix-sid algorithm 128 index 1128
<span class="c">  !</span>
<span class="c"> !</span>
 interface TenGigE0/0/0/1
  affinity flex-algo RED
  address-family ipv4 unicast
<span class="c">  !</span>
<span class="c"> !</span></pre>
<p>Padhna: router algorithm 128 mein participate karta hai aur definition advertise karta hai "minimum delay metric, color RED wale links exclude karo". Loopback ka normal SID (index 1) aur algo-128 SID (index 1128, yaani default SRGB ke saath label 17128) hai. Congested ya mehnge provider link ki taraf wala interface RED mark hai, isliye algorithm 128 use kabhi cross nahi karta. Delay metrics link delay measurement se aate hain; available na hon to plane ko TE metric ya IGP metric se define karo. Har flex-algo SID ko plain-prefix index range ke bahar ka index chahiye.</p>
<h3>Flex-algo use karna</h3>
<table class="cmp"><tr><th>Method</th><th>Kaise</th></tr><tr><td>Direct SID</td><td>Service ya policy endpoint ka algo-128 prefix-SID next hop label ki tarah use karti hai</td></tr><tr><td>SR-TE policy</td><td>Dynamic candidate path ko SID algorithm use karne ko kaha jaata hai, isliye compute ki gayi list plane ke andar rehti hai</td></tr><tr><td>Color ke saath ODN</td><td>Color 100 ka ODN template flex-algo 128 ko point karta hai, isliye color 100 wale routes bina extra kaam ke use follow karte hain</td></tr><tr><td>TI-LFA</td><td>Protection usi flex-algo ke andar compute hoti hai, isliye repair kabhi plane se bahar nahi jaata</td></tr></table>
<p>Lambi segment lists wale SR-TE par key advantage yeh hai ki constraints IGP lagata hai, isliye label stack <b>ek label</b> rehta hai: endpoint ka algo-128 SID. Network plane ko hop by hop follow karta hai. Yeh bahut behtar scale karta hai aur head-end recomputation ke bina topology changes survive karta hai.</p>
<h3>Typical use cases</h3>
<ul>
<li><b>Low-latency plane.</b> Metric type delay, voice, trading ya gaming traffic ke liye.</li>
<li><b>Dual-plane network.</b> Do disjoint planes (jaise affinity se "plane A" aur "plane B" links). Customer end-to-end redundancy ke liye dono se judta hai.</li>
<li><b>Link class avoid karna</b> jaise satellite, mehnga transit ya koi particular vendor.</li>
<li><b>Network slicing</b> jahan nodes aur links ka subset ek customer ke liye plane banata hai.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Provider ke paas har region mein do metro rings hain. Ring 1 ke links par colour RED hai, ring 2 ke links BLUE. Flex-algo 128 BLUE exclude karta hai aur flex-algo 129 RED exclude karta hai. Bank ka VPN PE2 ke algo-128 SID par steer hota hai aur sirf ring 1 use karta hai. Ring 1 par fibre cut algo 128 ke andar TI-LFA trigger karta hai, isliye repair ring 1 par hi rehta hai. Bank ko disjoint backup bhi chahiye to doosra VPN path PE2 ke algo-129 SID par steer hota hai, jo ring 1 ko kabhi nahi chhuta.</p></div>
<div class="warn"><p><b>Common mistake.</b> Yeh bhoolna ki plane ke har router ko algorithm, algo-specific SID aur same definition chahiye. Jo router algorithm 128 mein participate nahi karta woh us point par plane todta hai; algo-128 SID ka traffic wahan drop hota hai. Ek aur galti: constraints itne tight karna ki plane partition ho jaaye aur kuch PEs usme unreachable ho jaayein.</p></div>
<div class="exam"><p><b>Exam trap.</b> Algorithm numbers 128 se 255 flexible hain; 0 IGP shortest path hai aur 1 strict SPF. Definition (FAD) nodes advertise karte hain aur sabse high priority jeetti hai. Plane ke apne prefix-SIDs hain. Flex-algo ko RSVP, tunnels ya head-end computation nahi chahiye.</p></div>
<div class="scn"><h4>Exchange ke liye latency plane</h4><p>Ek stock exchange customer ko do data centres ke beech sabse kam latency chahiye thi. Provider ne delay metric ke saath flex-algo 128 banaya, affinity se satellite-backed link exclude kiya, aur PEs ko algo-128 SIDs diye. Destination ke algo-128 SID ka ek label 5-segment SR-TE list ki jagah aa gaya. Network mein lamba detour jodne par plane ne use automatically avoid kiya.</p><p><b>Lesson:</b> flex-algo constraints ko IGP mein le jaata hai, isliye stack chhota rehta hai aur plane khud adapt karta hai.</p></div>
<div class="iv"><p class="q">"Flexible algorithm kya hai aur explicit lists wale SR-TE ki jagah ise kab use karoge?"</p><p>Flex-algo alag IGP shortest-path computation define karta hai, algorithm number 128 se 255, apne metric type (IGP, delay ya TE) aur constraints (affinities, SRLG) ke saath, jo IGP mein definition ke roop mein advertise hoti hai. Participating nodes ko per-algorithm prefix-SIDs milte hain, isliye us SID ka traffic ek label se constrained plane follow karta hai, aur TI-LFA plane ke andar kaam karta hai. Main ise low latency ya disjoint planes jaise repeatable intents ke liye scale par use karta hoon, aur SR-TE explicit paths ek-do special paths ke liye.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flex-algo apne metric aur SIDs wala constraint-based IGP computation hai, algorithms 128 se 255.</li>
<li>FAD IGP mein advertise hoti hai; conflict mein sabse high priority jeetti hai.</li>
<li>Sirf participating nodes plane mein hain; har ka algo-specific prefix-SID hota hai.</li>
<li>Algo SID ka ek label plane follow karta hai; TI-LFA uske andar rehta hai.</li>
<li>Use cases: low latency, dual planes, link classes avoid karna, slicing.</li>
</ul></div>
`}};export{e as default};