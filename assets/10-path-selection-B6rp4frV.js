var e={id:`path-selection`,h:{en:`Path selection order and cost tuning`,hi:`Path selection order aur cost tuning`},body:{en:`
<p>A company's travel policy says: take a direct company car if one exists; if not, take a company-approved inter-city bus; only if neither exists may you use an outside taxi. Within each category you choose the cheapest option, but a cheap taxi never beats an expensive company bus. OSPF path selection works the same way: first the <b>route type</b>, and only then the <b>cost</b>.</p>

<h3>The selection order</h3>
<p>When one OSPF process has several ways to reach the same prefix (same prefix length), it prefers, in this order:</p>
<ol>
<li><b>Intra-area</b> (<code>O</code>): learned from type 1 and 2 LSAs of an area the router is in.</li>
<li><b>Inter-area</b> (<code>O IA</code>): learned from type 3 LSAs.</li>
<li><b>External type 1</b> (<code>O E1</code>, and NSSA <code>O N1</code>): external cost plus the internal cost to the ASBR.</li>
<li><b>External type 2</b> (<code>O E2</code>, and NSSA <code>O N2</code>): external cost only; the default for redistribution.</li>
</ol>
<p>Cost is compared only between candidates of the same type. An intra-area path with cost 500 beats an inter-area path with cost 10. All OSPF routes share administrative distance 110, so AD does not decide between them. Remember that the router always applies <b>longest prefix match</b> first; this order only picks among routes to the identical prefix.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="OSPF route type preference ladder">
<rect x="20" y="50" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="85" y="76" text-anchor="middle" class="svg-ink" font-size="14">O</text><text x="85" y="96" text-anchor="middle" class="svg-muted" font-size="12">intra-area</text>
<rect x="175" y="50" width="130" height="60" rx="10" fill="#bae6fd"/><text x="240" y="76" text-anchor="middle" class="svg-ink" font-size="14">O IA</text><text x="240" y="96" text-anchor="middle" class="svg-muted" font-size="12">inter-area</text>
<rect x="330" y="50" width="130" height="60" rx="10" fill="#fde68a"/><text x="395" y="76" text-anchor="middle" class="svg-ink" font-size="14">E1 / N1</text><text x="395" y="96" text-anchor="middle" class="svg-muted" font-size="12">ext + internal</text>
<rect x="485" y="50" width="130" height="60" rx="10" fill="#fed7aa"/><text x="550" y="76" text-anchor="middle" class="svg-ink" font-size="14">E2 / N2</text><text x="550" y="96" text-anchor="middle" class="svg-muted" font-size="12">ext only</text>
<text x="162" y="85" text-anchor="middle" class="svg-accent" font-size="16">&gt;</text><text x="317" y="85" text-anchor="middle" class="svg-accent" font-size="16">&gt;</text><text x="472" y="85" text-anchor="middle" class="svg-accent" font-size="16">&gt;</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">Type decides first; cost only breaks ties inside a type</text>
</svg><p class="cap">The OSPF preference ladder. Cost never lets a lower rung beat a higher one.</p></div>

<h3>E1 versus E2</h3>
<p>An ASBR redistributes with <code>metric-type 2</code> by default and a seed metric of 20 (1 for routes from BGP). With <b>E2</b> the cost seen everywhere stays 20, whatever the distance to the ASBR. If two ASBRs advertise the same E2 prefix with the same metric, the tie is broken by the <b>forward metric</b>: the internal cost to reach each ASBR (via type 1 in the same area or type 4 elsewhere). With <b>E1</b> (<code>redistribute static subnets metric-type 1</code>) the internal cost is added to the external metric in the route itself, which is better when multiple ASBRs advertise the same external prefix and you want the nearest one.</p>

<h3>Cost and reference bandwidth</h3>
<p>Interface cost = reference bandwidth / interface bandwidth, minimum 1. The default reference is 100 Mbps, so FastEthernet, GigabitEthernet and TenGigabitEthernet all cost 1, and OSPF cannot tell them apart. Raise the reference on <b>every</b> router in the domain:</p>
<pre class="code">router ospf 1
 auto-cost reference-bandwidth 100000
<span class="c">! value in Mbps: 100 Gbps reference, 1G = 100, 10G = 10</span>
interface GigabitEthernet0/1
 ip ospf cost 50
<span class="c">! explicit cost overrides the calculation on this interface</span></pre>
<p>IOS warns you with "Please ensure reference bandwidth is consistent across all routers". An inconsistent reference makes different routers disagree on costs and paths. The <code>bandwidth</code> interface command also changes the calculated cost (and EIGRP and QoS behaviour), so for OSPF-only tuning prefer <code>ip ospf cost</code>.</p>

<h3>Equal-cost multipath</h3>
<p>If several paths of the same type have the same lowest cost, OSPF installs them all, up to <code>maximum-paths</code> (4 by default on most IOS platforms, configurable). Traffic is load-shared per flow by CEF.</p>

<pre class="out">R1# show ip route 192.168.20.0
Routing entry for 192.168.20.0/24
  <span class="hl">Known via "ospf 1", distance 110, metric 5, type inter area</span>
  Last update from 10.10.12.2 on GigabitEthernet0/0, 00:04:11 ago
  Routing Descriptor Blocks:
  * 10.10.12.2, from 2.2.2.2, 00:04:11 ago, via GigabitEthernet0/0
      Route metric is 5, traffic share count is 1</pre>
<p>"type inter area" and "from 2.2.2.2" tell you the route came from ABR1's type 3 LSA. For externals you would see "type extern 2, forward metric 4".</p>

<div class="eg"><p><b>Worked example.</b> Chennai (area 20) is later connected to Pune by a second path: a direct link from R5 into area 10 would be wrong by design, so instead the company adds a second ABR, ABR3, between area 20 and area 0 with total cost 12 to 192.168.20.0/24 from R1, compared with 5 through ABR2. Both are O IA, so cost decides: the path via ABR2 wins with 5. Now imagine someone accidentally puts 192.168.20.0/24 into area 10 on another router with a cost of 40. That route is intra-area (O) for R1, so R1 prefers it despite cost 40 versus 5. Route type always wins first.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing <code>auto-cost reference-bandwidth</code> on only some routers during a maintenance window and leaving the rest for "next week". Costs become inconsistent and traffic may take strange asymmetric paths until every router matches.</p></div>

<div class="exam"><p><b>Exam trap.</b> Order is O, then O IA, then E1/N1, then E2/N2, regardless of cost. Default redistribution is E2 with metric 20. The default reference bandwidth is 100 Mbps, so every interface of 100 Mbps or faster costs 1.</p></div>

<div class="scn"><h4>The 10G link that nobody used</h4><p>A campus upgraded its core-to-distribution links from 1G to 10G but traffic kept flowing over an old 1G path. Both had OSPF cost 1 with the default reference bandwidth, and the old path had fewer hops, so it had lower total cost. The engineer set <code>auto-cost reference-bandwidth 100000</code> on every router in a single change window; the 1G links became cost 100 and the 10G links cost 10, and traffic moved to the new links.</p><p><b>Lesson:</b> with modern speeds, raise the reference bandwidth consistently, or set explicit costs.</p></div>

<div class="iv"><p class="q">"OSPF has an intra-area route with cost 100 and an inter-area route with cost 10 to the same prefix. Which one is used, and why?"</p><p>Strong answer: the intra-area route, because OSPF prefers route types in the order intra-area, inter-area, external type 1, external type 2, and compares cost only within a type. Both have AD 110, so AD does not decide. Add the E1 versus E2 difference and how E2 ties are broken by forward metric.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Preference: O &gt; O IA &gt; E1/N1 &gt; E2/N2; cost only breaks ties inside a type.</li>
<li>E2 (default, metric 20) ignores internal cost; E1 adds it; E2 ties use the forward metric.</li>
<li>Cost = reference / bandwidth; default reference 100 Mbps; set it the same on every router.</li>
<li><code>ip ospf cost</code> overrides the calculation per interface.</li>
<li>Equal-cost paths are load-shared up to <code>maximum-paths</code>.</li>
</ul></div>
`,hi:`
<p>Company ki travel policy kehti hai: agar direct company car hai to wahi lo; nahi hai to company-approved inter-city bus lo; dono na hon tabhi bahar ki taxi use kar sakte ho. Har category ke andar sabse sasta option chuno, lekin sasti taxi kabhi mehngi company bus ko nahi haraati. OSPF path selection bhi aise hi kaam karta hai: pehle <b>route type</b>, aur uske baad hi <b>cost</b>.</p>

<h3>Selection order</h3>
<p>Jab ek OSPF process ke paas same prefix (same prefix length) tak pahunchne ke kai tarike hote hain, woh is order mein prefer karta hai:</p>
<ol>
<li><b>Intra-area</b> (<code>O</code>): us area ke type 1 aur 2 LSAs se seekha jismein router hai.</li>
<li><b>Inter-area</b> (<code>O IA</code>): type 3 LSAs se seekha.</li>
<li><b>External type 1</b> (<code>O E1</code>, aur NSSA <code>O N1</code>): external cost plus ASBR tak internal cost.</li>
<li><b>External type 2</b> (<code>O E2</code>, aur NSSA <code>O N2</code>): sirf external cost; redistribution ka default.</li>
</ol>
<p>Cost sirf same type ke candidates ke beech compare hoti hai. Cost 500 wala intra-area path cost 10 wale inter-area path ko haraata hai. Saare OSPF routes ka administrative distance 110 hai, isliye AD unke beech faisla nahi karta. Yaad rakho ki router hamesha pehle <b>longest prefix match</b> lagata hai; yeh order sirf bilkul same prefix ke routes mein se chunta hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="OSPF route type preference ladder">
<rect x="20" y="50" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="85" y="76" text-anchor="middle" class="svg-ink" font-size="14">O</text><text x="85" y="96" text-anchor="middle" class="svg-muted" font-size="12">intra-area</text>
<rect x="175" y="50" width="130" height="60" rx="10" fill="#bae6fd"/><text x="240" y="76" text-anchor="middle" class="svg-ink" font-size="14">O IA</text><text x="240" y="96" text-anchor="middle" class="svg-muted" font-size="12">inter-area</text>
<rect x="330" y="50" width="130" height="60" rx="10" fill="#fde68a"/><text x="395" y="76" text-anchor="middle" class="svg-ink" font-size="14">E1 / N1</text><text x="395" y="96" text-anchor="middle" class="svg-muted" font-size="12">ext + internal</text>
<rect x="485" y="50" width="130" height="60" rx="10" fill="#fed7aa"/><text x="550" y="76" text-anchor="middle" class="svg-ink" font-size="14">E2 / N2</text><text x="550" y="96" text-anchor="middle" class="svg-muted" font-size="12">sirf ext</text>
<text x="162" y="85" text-anchor="middle" class="svg-accent" font-size="16">&gt;</text><text x="317" y="85" text-anchor="middle" class="svg-accent" font-size="16">&gt;</text><text x="472" y="85" text-anchor="middle" class="svg-accent" font-size="16">&gt;</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">Pehle type faisla karta hai; cost sirf type ke andar tie todti hai</text>
</svg><p class="cap">OSPF preference ladder. Cost kabhi neeche ke paaydaan ko upar wale se jeetne nahi deti.</p></div>

<h3>E1 vs E2</h3>
<p>ASBR default mein <code>metric-type 2</code> aur seed metric 20 (BGP se aaye routes ke liye 1) ke saath redistribute karta hai. <b>E2</b> mein har jagah dikhne wali cost 20 hi rehti hai, ASBR kitna bhi door ho. Agar do ASBRs same E2 prefix same metric ke saath advertise karein, to tie <b>forward metric</b> se tootta hai: har ASBR tak pahunchne ki internal cost (same area mein type 1 se ya baaki jagah type 4 se). <b>E1</b> (<code>redistribute static subnets metric-type 1</code>) mein internal cost route mein hi external metric mein judti hai, jo tab behtar hai jab kai ASBRs same external prefix advertise karein aur aap sabse nazdeek wala chahte ho.</p>

<h3>Cost aur reference bandwidth</h3>
<p>Interface cost = reference bandwidth / interface bandwidth, minimum 1. Default reference 100 Mbps hai, isliye FastEthernet, GigabitEthernet aur TenGigabitEthernet sabki cost 1 hai, aur OSPF unmein fark nahi kar sakta. Domain ke <b>har</b> router par reference badhao:</p>
<pre class="code">router ospf 1
 auto-cost reference-bandwidth 100000
<span class="c">! value Mbps mein: 100 Gbps reference, 1G = 100, 10G = 10</span>
interface GigabitEthernet0/1
 ip ospf cost 50
<span class="c">! explicit cost is interface par calculation ko override karti hai</span></pre>
<p>IOS "Please ensure reference bandwidth is consistent across all routers" ke saath warning deta hai. Inconsistent reference se alag routers costs aur paths par asahmat hote hain. <code>bandwidth</code> interface command bhi calculated cost badalta hai (aur EIGRP aur QoS behaviour bhi), isliye sirf OSPF tuning ke liye <code>ip ospf cost</code> prefer karo.</p>

<h3>Equal-cost multipath</h3>
<p>Agar same type ke kai paths ki same lowest cost hai, OSPF sabko install karta hai, <code>maximum-paths</code> tak (zyada tar IOS platforms par default 4, configurable). CEF traffic ko per flow load-share karta hai.</p>

<pre class="out">R1# show ip route 192.168.20.0
Routing entry for 192.168.20.0/24
  <span class="hl">Known via "ospf 1", distance 110, metric 5, type inter area</span>
  Last update from 10.10.12.2 on GigabitEthernet0/0, 00:04:11 ago
  Routing Descriptor Blocks:
  * 10.10.12.2, from 2.2.2.2, 00:04:11 ago, via GigabitEthernet0/0
      Route metric is 5, traffic share count is 1</pre>
<p>"type inter area" aur "from 2.2.2.2" batate hain ki route ABR1 ke type 3 LSA se aaya. Externals ke liye aapko "type extern 2, forward metric 4" dikhega.</p>

<div class="eg"><p><b>Worked example.</b> Chennai (area 20) baad mein Pune se ek doosre path se judta hai: R5 se area 10 mein direct link design ke hisaab se galat hoga, isliye company area 20 aur area 0 ke beech doosra ABR, ABR3, jodti hai jiski R1 se 192.168.20.0/24 tak total cost 12 hai, ABR2 ke through 5 ke comparison mein. Dono O IA hain, isliye cost faisla karti hai: ABR2 wala path 5 ke saath jeetta hai. Ab socho kisi ne galti se kisi aur router par 192.168.20.0/24 ko area 10 mein 40 cost ke saath daal diya. Woh route R1 ke liye intra-area (O) hai, isliye R1 use prefer karta hai, 40 vs 5 cost ke bawajood. Route type hamesha pehle jeetta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Maintenance window mein sirf kuch routers par <code>auto-cost reference-bandwidth</code> badalna aur baaki ko "agle hafte" ke liye chhod dena. Costs inconsistent ho jaati hain aur jab tak har router match na kare, traffic ajeeb asymmetric paths le sakta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Order hai O, phir O IA, phir E1/N1, phir E2/N2, cost kuch bhi ho. Default redistribution metric 20 ke saath E2 hai. Default reference bandwidth 100 Mbps hai, isliye 100 Mbps ya tez har interface ki cost 1 hai.</p></div>

<div class="scn"><h4>10G link jise kisi ne use nahi kiya</h4><p>Ek campus ne apne core-to-distribution links 1G se 10G kiye lekin traffic purane 1G path par hi chalta raha. Default reference bandwidth ke saath dono ki OSPF cost 1 thi, aur purane path mein kam hops the, isliye uski total cost kam thi. Engineer ne ek hi change window mein har router par <code>auto-cost reference-bandwidth 100000</code> set kiya; 1G links cost 100 aur 10G links cost 10 ho gaye, aur traffic naye links par shift ho gaya.</p><p><b>Seekh:</b> modern speeds ke saath reference bandwidth consistently badhao, ya explicit costs set karo.</p></div>

<div class="iv"><p class="q">"OSPF ke paas same prefix ke liye cost 100 wala intra-area route aur cost 10 wala inter-area route hai. Kaunsa use hoga, aur kyun?"</p><p>Strong answer: intra-area route, kyunki OSPF route types ko intra-area, inter-area, external type 1, external type 2 ke order mein prefer karta hai, aur cost sirf ek type ke andar compare karta hai. Dono ka AD 110 hai, isliye AD faisla nahi karta. E1 vs E2 ka fark aur E2 ties forward metric se kaise tootte hain, yeh bhi jodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Preference: O &gt; O IA &gt; E1/N1 &gt; E2/N2; cost sirf type ke andar tie todti hai.</li>
<li>E2 (default, metric 20) internal cost ignore karta hai; E1 use jodta hai; E2 ties forward metric use karte hain.</li>
<li>Cost = reference / bandwidth; default reference 100 Mbps; har router par same set karo.</li>
<li><code>ip ospf cost</code> per interface calculation override karta hai.</li>
<li>Equal-cost paths <code>maximum-paths</code> tak load-share hote hain.</li>
</ul></div>
`}};export{e as default};