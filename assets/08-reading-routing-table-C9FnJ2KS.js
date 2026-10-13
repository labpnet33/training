var e={id:`reading-routing-table`,h:{en:`Reading the routing table like an ENARSI engineer`,hi:`Routing table ko ENARSI engineer ki tarah padhna`},body:{en:`
<p>A postman sorting letters uses the most specific instruction he has. A note saying "all letters for this city go to the central depot" is overruled by a note saying "letters for Park Street go to depot 7", and that is overruled by "letters for 12 Park Street go to the reception desk". If two notes are equally specific, he trusts the one from the more reliable source. And if the same source gives two routes, he takes the shorter one. That is exactly how a router chooses: <b>longest match</b>, then <b>administrative distance</b>, then <b>metric</b>. An ENARSI engineer reads every routing table with those three rules in mind.</p>

<h3>Anatomy of a routing table entry</h3>
<pre class="out">R1# show ip route | begin Gateway
Gateway of last resort is 10.0.12.2 to network 0.0.0.0

O*E2  0.0.0.0/0 [110/1] via 10.0.12.2, 01:10:22, GigabitEthernet0/0
      10.0.0.0/8 is variably subnetted, 9 subnets, 4 masks
C        10.0.12.0/30 is directly connected, GigabitEthernet0/0
L        10.0.12.1/32 is directly connected, GigabitEthernet0/0
O E2     10.0.23.0/30 [110/20] via 10.0.12.2, 00:12:41, GigabitEthernet0/0
C        10.1.10.0/24 is directly connected, GigabitEthernet0/1
L        10.1.10.1/32 is directly connected, GigabitEthernet0/1
S        10.3.0.0/16 [1/0] via 10.0.12.2
<span class="hl">O E2     10.3.30.0/24 [110/20] via 10.0.12.2, 00:12:41, GigabitEthernet0/0</span>
C        10.255.0.1/32 is directly connected, Loopback0
O        10.255.0.2/32 [110/2] via 10.0.12.2, 01:10:22, GigabitEthernet0/0</pre>
<p>Take the highlighted line apart: <b>O E2</b> is the source (OSPF external type 2), <b>10.3.30.0/24</b> the prefix and length, <b>[110/20]</b> the administrative distance and metric, <b>via 10.0.12.2</b> the next hop, <b>00:12:41</b> the age (how long since the route last changed; a small age on a stable network is a flapping hint) and <b>GigabitEthernet0/0</b> the exit interface.</p>

<table class="cmp"><tr><th>Code</th><th>Source</th><th>Code</th><th>Source</th></tr>
<tr><td>C / L</td><td>Connected / local host route</td><td>D</td><td>EIGRP internal</td></tr>
<tr><td>S</td><td>Static</td><td>D EX</td><td>EIGRP external</td></tr>
<tr><td>O</td><td>OSPF intra-area</td><td>B</td><td>BGP</td></tr>
<tr><td>O IA</td><td>OSPF inter-area</td><td>i L1 / L2</td><td>IS-IS</td></tr>
<tr><td>O E1 / E2</td><td>OSPF external type 1 / 2</td><td>*</td><td>Candidate default</td></tr>
<tr><td>O N1 / N2</td><td>OSPF NSSA external</td><td>+ / %</td><td>Replicated route / next hop override</td></tr>
</table>

<h3>Rule 1: longest match</h3>
<p>Routes for different prefix lengths do not compete; they are all installed. At forwarding time the router picks the route with the <b>longest matching prefix</b>. For destination 10.3.30.10, R1 has three candidates: 10.3.30.0/24 (OSPF), 10.3.0.0/16 (static) and 0.0.0.0/0 (OSPF default). The /24 wins, even though the static route has a far better AD.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Route selection order">
<rect x="20" y="30" width="180" height="60" rx="8" fill="#bae6fd"/><text x="110" y="56" text-anchor="middle" class="svg-ink" font-size="13">1 Longest match</text><text x="110" y="76" text-anchor="middle" class="svg-muted" font-size="12">at lookup time</text>
<rect x="230" y="30" width="180" height="60" rx="8" fill="#fde68a"/><text x="320" y="56" text-anchor="middle" class="svg-ink" font-size="13">2 Lowest AD</text><text x="320" y="76" text-anchor="middle" class="svg-muted" font-size="12">same prefix, many sources</text>
<rect x="440" y="30" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="530" y="56" text-anchor="middle" class="svg-ink" font-size="13">3 Lowest metric</text><text x="530" y="76" text-anchor="middle" class="svg-muted" font-size="12">inside one protocol</text>
<line x1="200" y1="60" x2="230" y2="60" stroke="#64748b" stroke-width="2"/><line x1="410" y1="60" x2="440" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="110" y="130" text-anchor="middle" class="svg-accent" font-size="12">/24 beats /16 beats /0</text>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">OSPF 110 beats D EX 170</text>
<text x="530" y="130" text-anchor="middle" class="svg-accent" font-size="12">equal metric: ECMP</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">Steps 2 and 3 decide what is installed; step 1 decides which installed route is used</text>
</svg><p class="cap">Route selection: installation by AD and metric, forwarding by longest match.</p></div>

<h3>Rule 2: administrative distance</h3>
<p>When the <b>same prefix with the same length</b> is offered by several sources, the lowest AD is installed. Default values: connected 0, static 1, EIGRP summary 5, eBGP 20, EIGRP internal 90, OSPF 110, IS-IS 115, RIP 120, EIGRP external 170, iBGP 200, and 255 means "never use". A static route with a raised AD, such as <code>ip route 10.3.30.0 255.255.255.0 10.0.99.2 200</code>, is a <b>floating static</b>: it only appears when the dynamic route disappears. AD is local to the router; it is never advertised.</p>

<h3>Rule 3: metric, and protocol-specific preferences</h3>
<p>Inside one protocol the lowest metric wins, and equal metrics give equal-cost multipath. Each protocol has its own metric: OSPF cost, EIGRP composite metric from bandwidth and delay, BGP uses its best-path algorithm instead. OSPF adds a rule before the cost: <b>intra-area</b> beats <b>inter-area</b> beats <b>E1/N1</b> beats <b>E2/N2</b>, whatever the costs. For two E2 routes with the same metric, the lower <b>forward metric</b> (cost to the ASBR) breaks the tie.</p>

<h3>Recursive next hops</h3>
<p>A next hop that is not on a connected subnet must itself be looked up: that is <b>recursive lookup</b>. iBGP routes normally point to a remote loopback, for example <code>B 203.0.113.0/24 [200/0] via 10.255.0.3</code>; the router then needs an IGP route to 10.255.0.3. If that recursion fails, BGP marks the next hop inaccessible and does not install the route. CEF resolves the recursion in advance, so <code>show ip cef 203.0.113.1</code> shows the real exit interface. Static routes can recurse too; a static route pointing only to an Ethernet exit interface, without a next-hop address, relies on proxy ARP and should be avoided.</p>

<div class="eg"><p><b>Worked example.</b> Which route does R2 use for 10.3.30.10 when it has: <code>S 10.3.0.0/16 [1/0]</code>, <code>O E2 10.3.30.0/24 [110/20]</code> learned from another ASBR, and <code>D EX 10.3.30.0/24 [170/3072]</code> from R3? Step 1 at install time: the two /24s compete; OSPF AD 110 beats EIGRP external 170, so the OSPF /24 is installed and the EIGRP one is not. The /16 static is installed separately. Step 2 at lookup: the /24 is longer than the /16, so traffic follows the OSPF route. If the OSPF route came from a stale redistribution point, this is exactly how suboptimal routing and loops appear after mutual redistribution.</p></div>

<div class="warn"><p><b>Common mistake.</b> Comparing ADs of routes with different prefix lengths. A static /16 with AD 1 never "beats" an OSPF /24 for addresses inside the /24; longest match decides first.</p></div>

<div class="exam"><p><b>Exam trap.</b> iBGP has AD 200, so an iBGP route loses to the same prefix from OSPF (110) or EIGRP external (170). EIGRP external is 170, not 90. OSPF intra-area wins over inter-area even with a higher cost. And <code>show ip route 10.3.30.10</code> does not fall back to the default route; it reports "Subnet not in table".</p></div>

<div class="scn"><h4>The backup route that became primary</h4><p>An engineer added a backup static route to the data centre through a slow DSL link, <code>ip route 10.3.0.0 255.255.0.0 198.51.100.1</code>, but forgot the AD. The primary path was OSPF for the same 10.3.0.0/16 summary. With AD 1 the static route replaced the OSPF route, and all data-centre traffic moved to DSL. The fix was to add an AD of 250 to make it a floating static. If the OSPF route had been more specific (/24s), the static would not have mattered, which is why the problem only appeared for the summary.</p><p><b>Lesson:</b> AD decides between identical prefixes; always set a higher AD on backup statics.</p></div>

<div class="iv"><p class="q">"How does a router choose between routes from different protocols?"</p><p>Explain the order clearly: prefixes of different lengths are all installed and the longest match is used when forwarding; for identical prefixes the lowest AD is installed; inside one protocol the lowest metric wins with ECMP on ties. Give the AD values, mention OSPF's route-type preference and the floating static technique, and note that AD is local and not advertised.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read every entry as: source code, prefix/length, [AD/metric], next hop, age, exit interface.</li>
<li>Longest match first; AD only compares identical prefixes; metric only compares within one protocol.</li>
<li>AD values: 0, 1, 5, 20, 90, 110, 115, 120, 170, 200, 255.</li>
<li>OSPF prefers intra-area, then inter-area, then E1/N1, then E2/N2, regardless of cost.</li>
<li>Recursive next hops (BGP, static) must resolve through another route or the route is not usable.</li>
</ul></div>
`,hi:`
<p>Letters sort karne wala postman apne paas ki sabse specific instruction use karta hai. "Is shehar ke saare letters central depot jaate hain" wala note "Park Street ke letters depot 7 jaate hain" wale note se overrule hota hai, aur woh "12 Park Street ke letters reception desk jaate hain" se overrule hota hai. Agar do notes barabar specific hon, to woh zyada bharosemand source wale par bharosa karta hai. Aur agar ek hi source do routes de, to woh chhota wala leta hai. Router bilkul aise hi chunta hai: <b>longest match</b>, phir <b>administrative distance</b>, phir <b>metric</b>. ENARSI engineer har routing table in teen rules ko dhyan mein rakhkar padhta hai.</p>

<h3>Routing table entry ki anatomy</h3>
<pre class="out">R1# show ip route | begin Gateway
Gateway of last resort is 10.0.12.2 to network 0.0.0.0

O*E2  0.0.0.0/0 [110/1] via 10.0.12.2, 01:10:22, GigabitEthernet0/0
      10.0.0.0/8 is variably subnetted, 9 subnets, 4 masks
C        10.0.12.0/30 is directly connected, GigabitEthernet0/0
L        10.0.12.1/32 is directly connected, GigabitEthernet0/0
O E2     10.0.23.0/30 [110/20] via 10.0.12.2, 00:12:41, GigabitEthernet0/0
C        10.1.10.0/24 is directly connected, GigabitEthernet0/1
L        10.1.10.1/32 is directly connected, GigabitEthernet0/1
S        10.3.0.0/16 [1/0] via 10.0.12.2
<span class="hl">O E2     10.3.30.0/24 [110/20] via 10.0.12.2, 00:12:41, GigabitEthernet0/0</span>
C        10.255.0.1/32 is directly connected, Loopback0
O        10.255.0.2/32 [110/2] via 10.0.12.2, 01:10:22, GigabitEthernet0/0</pre>
<p>Highlighted line ko todo: <b>O E2</b> source hai (OSPF external type 2), <b>10.3.30.0/24</b> prefix aur length, <b>[110/20]</b> administrative distance aur metric, <b>via 10.0.12.2</b> next hop, <b>00:12:41</b> age (route ko aakhri baar badle kitna samay hua; stable network par chhoti age flapping ka ishaara hai) aur <b>GigabitEthernet0/0</b> exit interface.</p>

<table class="cmp"><tr><th>Code</th><th>Source</th><th>Code</th><th>Source</th></tr>
<tr><td>C / L</td><td>Connected / local host route</td><td>D</td><td>EIGRP internal</td></tr>
<tr><td>S</td><td>Static</td><td>D EX</td><td>EIGRP external</td></tr>
<tr><td>O</td><td>OSPF intra-area</td><td>B</td><td>BGP</td></tr>
<tr><td>O IA</td><td>OSPF inter-area</td><td>i L1 / L2</td><td>IS-IS</td></tr>
<tr><td>O E1 / E2</td><td>OSPF external type 1 / 2</td><td>*</td><td>Candidate default</td></tr>
<tr><td>O N1 / N2</td><td>OSPF NSSA external</td><td>+ / %</td><td>Replicated route / next hop override</td></tr>
</table>

<h3>Rule 1: longest match</h3>
<p>Alag prefix lengths ke routes compete nahi karte; sab install hote hain. Forwarding ke samay router <b>sabse lamba matching prefix</b> wala route chunta hai. Destination 10.3.30.10 ke liye R1 ke paas teen candidates hain: 10.3.30.0/24 (OSPF), 10.3.0.0/16 (static) aur 0.0.0.0/0 (OSPF default). /24 jeet-ta hai, chahe static route ka AD kahin behtar ho.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Route selection order">
<rect x="20" y="30" width="180" height="60" rx="8" fill="#bae6fd"/><text x="110" y="56" text-anchor="middle" class="svg-ink" font-size="13">1 Longest match</text><text x="110" y="76" text-anchor="middle" class="svg-muted" font-size="12">lookup ke samay</text>
<rect x="230" y="30" width="180" height="60" rx="8" fill="#fde68a"/><text x="320" y="56" text-anchor="middle" class="svg-ink" font-size="13">2 Sabse kam AD</text><text x="320" y="76" text-anchor="middle" class="svg-muted" font-size="12">same prefix, kai sources</text>
<rect x="440" y="30" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="530" y="56" text-anchor="middle" class="svg-ink" font-size="13">3 Sabse kam metric</text><text x="530" y="76" text-anchor="middle" class="svg-muted" font-size="12">ek protocol ke andar</text>
<line x1="200" y1="60" x2="230" y2="60" stroke="#64748b" stroke-width="2"/><line x1="410" y1="60" x2="440" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="110" y="130" text-anchor="middle" class="svg-accent" font-size="12">/24 haraata /16 ko, /16 haraata /0 ko</text>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">OSPF 110 haraata D EX 170 ko</text>
<text x="530" y="130" text-anchor="middle" class="svg-accent" font-size="12">equal metric: ECMP</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">Steps 2 aur 3 tay karte hain kya install hoga; step 1 tay karta hai kaunsa installed route use hoga</text>
</svg><p class="cap">Route selection: AD aur metric se installation, longest match se forwarding.</p></div>

<h3>Rule 2: administrative distance</h3>
<p>Jab <b>same prefix same length ke saath</b> kai sources se aaye, to sabse kam AD install hota hai. Default values: connected 0, static 1, EIGRP summary 5, eBGP 20, EIGRP internal 90, OSPF 110, IS-IS 115, RIP 120, EIGRP external 170, iBGP 200, aur 255 matlab "kabhi use mat karo". Badhaye hue AD wala static route, jaise <code>ip route 10.3.30.0 255.255.255.0 10.0.99.2 200</code>, <b>floating static</b> hai: yeh tabhi dikhta hai jab dynamic route gayab ho. AD router ke liye local hai; yeh kabhi advertise nahi hota.</p>

<h3>Rule 3: metric, aur protocol-specific preferences</h3>
<p>Ek protocol ke andar sabse kam metric jeet-ta hai, aur barabar metrics equal-cost multipath dete hain. Har protocol ka apna metric hai: OSPF cost, bandwidth aur delay se bana EIGRP composite metric, BGP iski jagah apna best-path algorithm use karta hai. OSPF cost se pehle ek rule jodta hai: <b>intra-area</b> haraata hai <b>inter-area</b> ko, jo haraata hai <b>E1/N1</b> ko, jo haraata hai <b>E2/N2</b> ko, costs chahe jo hon. Same metric wale do E2 routes ke liye, kam <b>forward metric</b> (ASBR tak ki cost) tie todta hai.</p>

<h3>Recursive next hops</h3>
<p>Jo next hop connected subnet par nahi hai, use khud look up karna padta hai: yeh <b>recursive lookup</b> hai. iBGP routes normally remote loopback ki taraf point karte hain, jaise <code>B 203.0.113.0/24 [200/0] via 10.255.0.3</code>; tab router ko 10.255.0.3 ka IGP route chahiye. Agar recursion fail ho, BGP next hop ko inaccessible mark karta hai aur route install nahi karta. CEF recursion pehle se resolve karta hai, isliye <code>show ip cef 203.0.113.1</code> asli exit interface dikhata hai. Static routes bhi recurse kar sakte hain; bina next-hop address ke sirf Ethernet exit interface ki taraf point karta static route proxy ARP par nirbhar hota hai aur usse bachna chahiye.</p>

<div class="eg"><p><b>Worked example.</b> R2 10.3.30.10 ke liye kaunsa route use karta hai jab uske paas hain: <code>S 10.3.0.0/16 [1/0]</code>, doosre ASBR se seekha <code>O E2 10.3.30.0/24 [110/20]</code>, aur R3 se <code>D EX 10.3.30.0/24 [170/3072]</code>? Install ke samay step 1: do /24s compete karte hain; OSPF AD 110 EIGRP external 170 ko haraata hai, isliye OSPF /24 install hota hai aur EIGRP wala nahi. /16 static alag se install hota hai. Lookup par step 2: /24 /16 se lamba hai, isliye traffic OSPF route follow karta hai. Agar OSPF route kisi purane redistribution point se aaya ho, to mutual redistribution ke baad suboptimal routing aur loops bilkul aise hi aate hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Alag prefix lengths wale routes ke ADs compare karna. AD 1 wala static /16 /24 ke andar ke addresses ke liye OSPF /24 ko kabhi "haraata" nahi; pehle longest match decide karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> iBGP ka AD 200 hai, isliye iBGP route OSPF (110) ya EIGRP external (170) se aaye same prefix se haarta hai. EIGRP external 170 hai, 90 nahi. OSPF intra-area zyada cost ke saath bhi inter-area par jeet-ta hai. Aur <code>show ip route 10.3.30.10</code> default route par fall back nahi karta; yeh "Subnet not in table" report karta hai.</p></div>

<div class="scn"><h4>Backup route jo primary ban gaya</h4><p>Ek engineer ne slow DSL link se data centre ka backup static route joda, <code>ip route 10.3.0.0 255.255.0.0 198.51.100.1</code>, par AD bhool gaya. Primary path usi 10.3.0.0/16 summary ke liye OSPF tha. AD 1 ke saath static route ne OSPF route ko replace kar diya, aur saara data-centre traffic DSL par chala gaya. Fix tha 250 ka AD jodkar ise floating static banana. Agar OSPF route zyada specific (/24s) hota, to static se fark nahi padta, isliye problem sirf summary ke liye aayi.</p><p><b>Seekh:</b> AD identical prefixes ke beech decide karta hai; backup statics par hamesha zyada AD set karo.</p></div>

<div class="iv"><p class="q">"Router alag protocols ke routes mein se kaise chunta hai?"</p><p>Order saaf samjhao: alag lengths ke prefixes sab install hote hain aur forwarding mein longest match use hota hai; identical prefixes ke liye sabse kam AD install hota hai; ek protocol ke andar sabse kam metric jeet-ta hai aur tie par ECMP. AD values batao, OSPF ki route-type preference aur floating static technique mention karo, aur note karo ki AD local hai aur advertise nahi hota.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har entry aise padho: source code, prefix/length, [AD/metric], next hop, age, exit interface.</li>
<li>Pehle longest match; AD sirf identical prefixes compare karta hai; metric sirf ek protocol ke andar compare hota hai.</li>
<li>AD values: 0, 1, 5, 20, 90, 110, 115, 120, 170, 200, 255.</li>
<li>OSPF intra-area, phir inter-area, phir E1/N1, phir E2/N2 prefer karta hai, cost chahe jo ho.</li>
<li>Recursive next hops (BGP, static) ko doosre route se resolve hona chahiye warna route usable nahi.</li>
</ul></div>
`}};export{e as default};