var e={id:`route-selection`,h:{en:`Route selection: prefix length, administrative distance and metric`,hi:`Route selection: prefix length, administrative distance aur metric`},body:{en:`
<p>Real routers often have several routes that could carry the same packet. Network+ objective 2.1 lists exactly three tie-breakers under "route selection": <b>prefix length</b>, <b>administrative distance</b> and <b>metric</b>. The secret most learners miss is that they are used at two different moments. Prefix length is used when a <b>packet</b> arrives. AD and metric are used earlier, when the router decides which <b>routes</b> to put into the table.</p>

<h3>An analogy: asking for directions</h3>
<p>You are looking for "Flat 12, Tower B, Green Park, Pune". One sign says "Pune this way", another says "Green Park this way", a third says "Tower B this way". You follow the most specific sign that still matches your address: Tower B. That is <b>longest prefix match</b>. Now imagine two people give you directions to Tower B: a security guard who works there and a stranger. You trust the guard more: that is <b>administrative distance</b>. If the guard mentions two routes, a 2 km road and a 5 km road, you take the shorter one: that is the <b>metric</b>.</p>

<h3>Step 1 (per packet): longest prefix match</h3>
<p>Each route is a pattern: a network address plus a prefix length that says how many leading bits must match. For a packet, the router finds every route that matches the destination and chooses the one with the <b>longest</b> prefix, because it is the most specific. The default route 0.0.0.0/0 matches everything with zero bits, so it always loses to anything more specific and is used only as a last resort.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Longest prefix match for destination 10.2.2.10">
<rect x="10" y="10" width="620" height="36" rx="8" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="14">Packet to 10.2.2.10: which routes match?</text>
<rect x="10" y="56" width="400" height="30" rx="6" fill="#e2e8f0"/><text x="20" y="76" class="svg-ink" font-size="13">0.0.0.0/0 via ISP (matches, 0 bits)</text>
<rect x="10" y="92" width="400" height="30" rx="6" fill="#e2e8f0"/><text x="20" y="112" class="svg-ink" font-size="13">10.0.0.0/8 via R-A (matches, 8 bits)</text>
<rect x="10" y="128" width="400" height="30" rx="6" fill="#e2e8f0"/><text x="20" y="148" class="svg-ink" font-size="13">10.2.0.0/16 via R-B (matches, 16 bits)</text>
<rect x="10" y="164" width="400" height="30" rx="6" fill="#bbf7d0"/><text x="20" y="184" class="svg-ink" font-size="13">10.2.2.0/24 via BR (matches, 24 bits)</text>
<text x="430" y="184" class="svg-accent" font-size="14">winner: longest</text>
<text x="430" y="112" class="svg-muted" font-size="12">all four match,</text>
<text x="430" y="130" class="svg-muted" font-size="12">only one is used</text>
</svg><p class="cap">All four routes contain 10.2.2.10, but the /24 is the most specific, so it wins.</p></div>

<div class="eg"><p><b>Worked example.</b> A router holds 0.0.0.0/0 via the ISP, 10.0.0.0/8 via R-A, 10.2.0.0/16 via R-B and 10.2.2.0/24 via BR. Where does each packet go?</p><ul>
<li>10.2.2.10 matches all four; the /24 is longest, so it goes to <b>BR</b>.</li>
<li>10.2.9.1 matches /0, /8 and /16 (not the /24, because the third octet differs); it goes to <b>R-B</b>.</li>
<li>10.9.9.9 matches /0 and /8; it goes to <b>R-A</b>.</li>
<li>172.16.1.1 matches only /0; it goes to the <b>ISP</b>.</li>
</ul></div>

<h3>Step 2 (building the table): administrative distance</h3>
<p>When two different <b>sources</b> offer the <b>same prefix with the same length</b>, the router can install only one of them. It picks the source with the lowest <b>administrative distance</b> (AD), a number from 0 to 255 that expresses trust. 255 means "never trust, never install". These Cisco default values are heavily tested:</p>
<table class="cmp"><tr><th>Route source</th><th>Default AD</th></tr>
<tr><td>Connected</td><td>0</td></tr>
<tr><td>Static</td><td>1</td></tr>
<tr><td>EIGRP summary</td><td>5</td></tr>
<tr><td>External BGP (eBGP)</td><td>20</td></tr>
<tr><td>Internal EIGRP</td><td>90</td></tr>
<tr><td>OSPF</td><td>110</td></tr>
<tr><td>IS-IS</td><td>115</td></tr>
<tr><td>RIP</td><td>120</td></tr>
<tr><td>External EIGRP</td><td>170</td></tr>
<tr><td>Internal BGP (iBGP)</td><td>200</td></tr>
<tr><td>Unknown / unusable</td><td>255</td></tr>
</table>
<p>So if you configure a static route to 192.168.2.0/24 and OSPF also learns 192.168.2.0/24, the static route (AD 1) is installed and the OSPF route (AD 110) waits in the background. If the static route's next hop fails, the OSPF route takes over. You will exploit this deliberately with floating static routes later.</p>

<h3>Step 3 (building the table): metric</h3>
<p>When the <b>same protocol</b> knows several paths to the <b>same prefix</b>, it compares its own <b>metric</b> and installs the lowest. Each protocol measures differently:</p>
<ul>
<li><b>RIP:</b> hop count (maximum 15; 16 means unreachable).</li>
<li><b>OSPF:</b> cost, based on interface bandwidth (reference bandwidth divided by interface bandwidth).</li>
<li><b>EIGRP:</b> a composite metric, by default from the slowest bandwidth and total delay on the path.</li>
<li><b>BGP:</b> not a single number; a list of path attributes, with AS-path length a key one.</li>
</ul>
<p>Metrics from different protocols are never compared with each other: an OSPF cost of 20 and a RIP hop count of 2 mean completely different things. That is exactly why AD exists. If two paths from the same protocol tie on metric, the router installs both and shares traffic across them: <b>equal-cost multipath (ECMP)</b>. You will see an ECMP route in the OSPF lab.</p>

<pre class="out">R1#show ip route ospf
      10.0.0.0/8 is variably subnetted, 5 subnets, 2 masks
O        10.0.23.0/30 [110/2] via 10.0.13.2, 00:00:41, GigabitEthernet0/1
<span class="hl">                      [110/2] via 10.0.12.2, 00:00:41, GigabitEthernet0/0</span>
O     192.168.2.0/24 [110/2] via 10.0.12.2, 00:00:41, GigabitEthernet0/0</pre>
<p>R1 reaches the R2-R3 link 10.0.23.0/30 at cost 2 through R2 and at cost 2 through R3, so both next hops are installed.</p>

<div class="warn"><p><b>Common mistake.</b> Saying "the static route wins because it has a lower AD" when the static route is a /16 and the OSPF route is a /24. Different prefix lengths are different routes; both are installed, and longest prefix match decides per packet. AD only breaks ties between identical prefixes.</p></div>

<div class="exam"><p><b>Exam trap.</b> The order is always: longest prefix first, then AD, then metric. If a question offers "the route with the lowest metric" against "the route with the longest prefix", the longest prefix wins, even when its AD or metric is worse.</p></div>

<div class="scn"><h4>The summary that stole the traffic</h4><p>An engineer added <code>ip route 10.2.0.0 255.255.0.0 10.0.99.2</code> to send several branch subnets to a new WAN router, expecting it to override the existing OSPF routes. It did not: traffic to 10.2.2.0/24 still followed OSPF. The OSPF /24 was longer than the static /16, so it won for those addresses despite AD 110 versus 1. Meanwhile unrelated 10.2.x subnets that OSPF did not know started going to the new router. The fix was to use specific /24 static routes for the migration and remove the broad /16.</p><p><b>Lesson:</b> prefix length beats AD. Think about every address your new route covers.</p></div>

<div class="iv"><p class="q">"How does a router choose between multiple routes to a destination?"</p><p>Strong answer in three layers: per packet, longest prefix match picks the most specific route. When building the table, identical prefixes from different sources are resolved by the lowest administrative distance; identical prefixes from the same protocol are resolved by the lowest metric, and equal metrics give ECMP. Quote two or three AD values (connected 0, static 1, OSPF 110) and give a one-line example.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Longest prefix match is applied to every packet; the default route 0.0.0.0/0 always loses to anything more specific.</li>
<li>Administrative distance chooses between different sources for the same prefix; lower is more trusted.</li>
<li>Metric chooses between paths from the same protocol; equal metrics produce ECMP.</li>
<li>Memorise: connected 0, static 1, eBGP 20, EIGRP 90, OSPF 110, RIP 120, iBGP 200, unusable 255.</li>
<li>Metrics from different protocols are never compared directly.</li>
</ul></div>
`,hi:`
<p>Real routers ke paas aksar kai routes hote hain jo same packet le ja sakte hain. Network+ objective 2.1 "route selection" ke neeche exactly teen tie-breakers deta hai: <b>prefix length</b>, <b>administrative distance</b> aur <b>metric</b>. Jo secret zyada tar learners miss karte hain woh yeh hai ki yeh do alag moments par use hote hain. Prefix length tab use hoti hai jab <b>packet</b> aata hai. AD aur metric pehle use hote hain, jab router decide karta hai ki kaunse <b>routes</b> table mein daalne hain.</p>

<h3>Ek analogy: raasta poochna</h3>
<p>Aap "Flat 12, Tower B, Green Park, Pune" dhoondh rahe ho. Ek board kehta hai "Pune is taraf", doosra "Green Park is taraf", teesra "Tower B is taraf". Aap sabse specific board follow karte ho jo aapke address se match karta hai: Tower B. Yahi <b>longest prefix match</b> hai. Ab socho do log aapko Tower B ka raasta batate hain: wahan kaam karne wala security guard aur ek ajnabi. Aap guard par zyada bharosa karte ho: yahi <b>administrative distance</b> hai. Agar guard do raaste batata hai, ek 2 km ka aur ek 5 km ka, aap chhota lete ho: yahi <b>metric</b> hai.</p>

<h3>Step 1 (har packet par): longest prefix match</h3>
<p>Har route ek pattern hai: network address aur prefix length jo batati hai ki shuru ke kitne bits match hone chahiye. Packet ke liye router har woh route dhoondhta hai jo destination se match kare aur sabse <b>lambe</b> prefix wala chunta hai, kyunki woh sabse specific hai. Default route 0.0.0.0/0 zero bits ke saath sab kuch match karta hai, isliye woh hamesha kisi bhi zyada specific route se haarta hai aur sirf last resort ki tarah use hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Destination 10.2.2.10 ke liye longest prefix match">
<rect x="10" y="10" width="620" height="36" rx="8" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="14">10.2.2.10 ka packet: kaunse routes match karte hain?</text>
<rect x="10" y="56" width="400" height="30" rx="6" fill="#e2e8f0"/><text x="20" y="76" class="svg-ink" font-size="13">0.0.0.0/0 via ISP (match, 0 bits)</text>
<rect x="10" y="92" width="400" height="30" rx="6" fill="#e2e8f0"/><text x="20" y="112" class="svg-ink" font-size="13">10.0.0.0/8 via R-A (match, 8 bits)</text>
<rect x="10" y="128" width="400" height="30" rx="6" fill="#e2e8f0"/><text x="20" y="148" class="svg-ink" font-size="13">10.2.0.0/16 via R-B (match, 16 bits)</text>
<rect x="10" y="164" width="400" height="30" rx="6" fill="#bbf7d0"/><text x="20" y="184" class="svg-ink" font-size="13">10.2.2.0/24 via BR (match, 24 bits)</text>
<text x="430" y="184" class="svg-accent" font-size="14">winner: sabse lamba</text>
<text x="430" y="112" class="svg-muted" font-size="12">chaaron match,</text>
<text x="430" y="130" class="svg-muted" font-size="12">use sirf ek hota hai</text>
</svg><p class="cap">Chaaron routes mein 10.2.2.10 aata hai, lekin /24 sabse specific hai, isliye woh jeetta hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Router ke paas 0.0.0.0/0 via ISP, 10.0.0.0/8 via R-A, 10.2.0.0/16 via R-B aur 10.2.2.0/24 via BR hain. Har packet kahan jaata hai?</p><ul>
<li>10.2.2.10 chaaron se match karta hai; /24 sabse lamba hai, isliye <b>BR</b> ko jaata hai.</li>
<li>10.2.9.1 /0, /8 aur /16 se match karta hai (/24 se nahi, kyunki teesra octet alag hai); <b>R-B</b> ko jaata hai.</li>
<li>10.9.9.9 /0 aur /8 se match karta hai; <b>R-A</b> ko jaata hai.</li>
<li>172.16.1.1 sirf /0 se match karta hai; <b>ISP</b> ko jaata hai.</li>
</ul></div>

<h3>Step 2 (table banate waqt): administrative distance</h3>
<p>Jab do alag <b>sources</b> <b>same prefix same length ke saath</b> dete hain, router unmein se sirf ek install kar sakta hai. Woh sabse kam <b>administrative distance</b> (AD) wala source chunta hai, 0 se 255 tak ka number jo bharosa dikhata hai. 255 ka matlab "kabhi trust nahi, kabhi install nahi". Yeh Cisco default values bahut test hoti hain:</p>
<table class="cmp"><tr><th>Route source</th><th>Default AD</th></tr>
<tr><td>Connected</td><td>0</td></tr>
<tr><td>Static</td><td>1</td></tr>
<tr><td>EIGRP summary</td><td>5</td></tr>
<tr><td>External BGP (eBGP)</td><td>20</td></tr>
<tr><td>Internal EIGRP</td><td>90</td></tr>
<tr><td>OSPF</td><td>110</td></tr>
<tr><td>IS-IS</td><td>115</td></tr>
<tr><td>RIP</td><td>120</td></tr>
<tr><td>External EIGRP</td><td>170</td></tr>
<tr><td>Internal BGP (iBGP)</td><td>200</td></tr>
<tr><td>Unknown / unusable</td><td>255</td></tr>
</table>
<p>To agar aap 192.168.2.0/24 ka static route configure karte ho aur OSPF bhi 192.168.2.0/24 seekhta hai, to static route (AD 1) install hota hai aur OSPF route (AD 110) background mein wait karta hai. Agar static route ka next hop fail ho jaaye, to OSPF route le leta hai. Aage floating static routes mein aap isi ka jaan-boojh kar fayda uthaoge.</p>

<h3>Step 3 (table banate waqt): metric</h3>
<p>Jab <b>same protocol</b> ko <b>same prefix</b> ke kai paths pata hote hain, woh apna <b>metric</b> compare karta hai aur sabse kam wala install karta hai. Har protocol alag tarah se naapta hai:</p>
<ul>
<li><b>RIP:</b> hop count (maximum 15; 16 matlab unreachable).</li>
<li><b>OSPF:</b> cost, interface bandwidth par based (reference bandwidth ko interface bandwidth se divide karke).</li>
<li><b>EIGRP:</b> composite metric, default mein path ki sabse slow bandwidth aur total delay se.</li>
<li><b>BGP:</b> ek single number nahi; path attributes ki list, jismein AS-path length ek important attribute hai.</li>
</ul>
<p>Alag protocols ke metrics kabhi aapas mein compare nahi hote: OSPF cost 20 aur RIP hop count 2 ka matlab bilkul alag hai. Isiliye AD exist karta hai. Agar same protocol ke do paths metric par tie karte hain, to router dono install karta hai aur traffic dono par baant deta hai: <b>equal-cost multipath (ECMP)</b>. OSPF lab mein aap ek ECMP route dekhoge.</p>

<pre class="out">R1#show ip route ospf
      10.0.0.0/8 is variably subnetted, 5 subnets, 2 masks
O        10.0.23.0/30 [110/2] via 10.0.13.2, 00:00:41, GigabitEthernet0/1
<span class="hl">                      [110/2] via 10.0.12.2, 00:00:41, GigabitEthernet0/0</span>
O     192.168.2.0/24 [110/2] via 10.0.12.2, 00:00:41, GigabitEthernet0/0</pre>
<p>R1 R2-R3 link 10.0.23.0/30 tak R2 ke through cost 2 par aur R3 ke through bhi cost 2 par pahunchta hai, isliye dono next hops install hote hain.</p>

<div class="warn"><p><b>Common galti.</b> Yeh kehna ki "static route jeetta hai kyunki uski AD kam hai" jab static route /16 hai aur OSPF route /24. Alag prefix lengths alag routes hain; dono install hote hain, aur har packet ke liye longest prefix match decide karta hai. AD sirf identical prefixes ke beech tie todti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Order hamesha yeh hai: pehle longest prefix, phir AD, phir metric. Agar question "sabse kam metric wala route" aur "sabse lamba prefix wala route" deta hai, to longest prefix jeetta hai, chahe uski AD ya metric kharab ho.</p></div>

<div class="scn"><h4>Summary jo traffic chura le gaya</h4><p>Ek engineer ne kai branch subnets ko naye WAN router par bhejne ke liye <code>ip route 10.2.0.0 255.255.0.0 10.0.99.2</code> add kiya, yeh sochkar ki yeh existing OSPF routes ko override karega. Aisa nahi hua: 10.2.2.0/24 ka traffic ab bhi OSPF follow karta raha. OSPF ka /24 static /16 se lamba tha, isliye un addresses ke liye woh jeeta, AD 110 vs 1 ke bawajood. Saath hi 10.2.x ke woh unrelated subnets jo OSPF ko pata nahi the, naye router par jaane lage. Fix tha migration ke liye specific /24 static routes use karna aur broad /16 hatana.</p><p><b>Seekh:</b> prefix length AD ko beat karti hai. Socho ki aapka naya route kaun kaun se addresses cover karta hai.</p></div>

<div class="iv"><p class="q">"Router kisi destination ke multiple routes mein se kaise chunta hai?"</p><p>Teen layers mein strong answer: har packet par longest prefix match sabse specific route chunta hai. Table banate waqt, alag sources ke identical prefixes sabse kam administrative distance se resolve hote hain; same protocol ke identical prefixes sabse kam metric se, aur equal metrics ECMP dete hain. Do-teen AD values bolo (connected 0, static 1, OSPF 110) aur ek line ka example do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Longest prefix match har packet par lagta hai; default route 0.0.0.0/0 hamesha kisi bhi zyada specific route se haarta hai.</li>
<li>Administrative distance same prefix ke alag sources mein se chunti hai; kam matlab zyada trusted.</li>
<li>Metric same protocol ke paths mein se chunta hai; equal metrics ECMP banate hain.</li>
<li>Yaad rakho: connected 0, static 1, eBGP 20, EIGRP 90, OSPF 110, RIP 120, iBGP 200, unusable 255.</li>
<li>Alag protocols ke metrics kabhi seedhe compare nahi hote.</li>
</ul></div>
`}};export{e as default};