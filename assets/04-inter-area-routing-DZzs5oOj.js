var e={id:`inter-area-routing`,h:{en:`Inter-area routing: O, O IA, E1 and E2 and how cost is built`,hi:`Inter-area routing: O, O IA, E1, E2 aur cost kaise banti hai`},body:{en:`
<p>When you book a train from Delhi to Kochi, the ticket does not list every junction in Kerala. It says: Delhi to Ernakulam, 2,700 km. The route inside Kerala is the local railway's problem. An ABR gives routers in other areas exactly that kind of ticket: 'the prefix is over there, and it costs this much to reach'. This chapter shows how those tickets become routes, how the cost adds up, and why the route codes <code>O</code>, <code>O IA</code>, <code>O E1</code> and <code>O E2</code> are never compared by metric.</p>

<h3>The four route types</h3>
<div class="tbl"><table>
<tr><th>Code</th><th>Meaning</th><th>Learned from</th><th>Preference</th></tr>
<tr><td><b>O</b></td><td>Intra-area</td><td>Type 1 and 2 LSAs of the router's own area</td><td>Best</td></tr>
<tr><td><b>O IA</b></td><td>Inter-area</td><td>Type 3 LSA from an ABR</td><td>Second</td></tr>
<tr><td><b>O E1</b></td><td>External type 1</td><td>Type 5 LSA, metric = external cost + internal cost</td><td>Third</td></tr>
<tr><td><b>O E2</b></td><td>External type 2 (the default for externals)</td><td>Type 5 LSA, metric = external cost only</td><td>Last</td></tr>
</table></div>
<p>All four have administrative distance 110, so the choice between them is not made by AD or by comparing metrics: OSPF simply prefers <b>O over O IA over E1 over E2</b> for the same prefix. A longer, more specific prefix still wins over any of them, because longest match happens first.</p>

<h3>See them in the table</h3>
<p>R3 sits in area 0. The ABR R2 has turned the area 1 prefixes into type 3 LSAs:</p>
<pre class="out">R3# show ip route ospf
Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
       i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2
       * - candidate default, U - per-user static route, + - replicated route

Gateway of last resort is 203.0.113.2 to network 0.0.0.0

      1.0.0.0/32 is subnetted, 1 subnets
<span class="hl">O IA     1.1.1.1 [110/3] via 10.0.23.1, 00:01:00, GigabitEthernet0/0</span>
      2.0.0.0/32 is subnetted, 1 subnets
<span class="hl">O        2.2.2.2 [110/2] via 10.0.23.1, 00:01:00, GigabitEthernet0/0</span>
      10.0.0.0/30 is subnetted, 1 subnets
O IA     10.0.12.0 [110/2] via 10.0.23.1, 00:01:00, GigabitEthernet0/0
      172.16.0.0/24 is subnetted, 3 subnets
<span class="hl">O IA     172.16.1.0 [110/3] via 10.0.23.1, 00:01:00, GigabitEthernet0/0</span>
O IA     172.16.2.0 [110/3] via 10.0.23.1, 00:01:00, GigabitEthernet0/0
O IA     172.16.3.0 [110/3] via 10.0.23.1, 00:01:00, GigabitEthernet0/0</pre>
<p>R2's loopback 2.2.2.2 is in area 0, so R3 sees it as plain <code>O</code>. Everything that lives in area 1 is <code>O IA</code>. All four next hops are 10.0.23.1: the ABR. R3 neither knows nor cares how R1 connects its three LANs. The same view from R1 shows the default route as external:</p>
<pre class="out">R1# show ip route ospf
Gateway of last resort is 10.0.12.2 to network 0.0.0.0

<span class="hl">O*E2     0.0.0.0/0 [110/1] via 10.0.12.2, 00:01:00, GigabitEthernet0/0</span>
      2.0.0.0/32 is subnetted, 1 subnets
O IA     2.2.2.2 [110/2] via 10.0.12.2, 00:01:00, GigabitEthernet0/0
      3.0.0.0/32 is subnetted, 1 subnets
O IA     3.3.3.3 [110/3] via 10.0.12.2, 00:01:00, GigabitEthernet0/0
      10.0.0.0/30 is subnetted, 1 subnets
O IA     10.0.23.0 [110/2] via 10.0.12.2, 00:01:00, GigabitEthernet0/0</pre>
<p>(The code legend, identical to the one above, is trimmed here.) For R1, everything in area 0 is <code>O IA</code> through 10.0.12.2, and the default route is <code>O*E2</code>. The asterisk marks the candidate default.</p>

<h3>How the cost is built across areas</h3>
<p>A type 3 LSA carries the cost <b>from the ABR to the prefix</b>, measured with the ABR's own SPF in the source area. The router that receives it adds <b>its cost to reach the ABR</b>. So the total is: cost to the ABR plus the ABR's advertised cost.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Cost of 172.16.1.0/24 as seen from R3: 1 plus 2 equals 3">
<rect x="20" y="55" width="110" height="46" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="75" y="76" text-anchor="middle" class="svg-ink" font-size="13">R3</text><text x="75" y="92" text-anchor="middle" class="svg-muted" font-size="10">area 0</text>
<rect x="265" y="55" width="110" height="46" rx="8" fill="#fff" stroke="#64748b" stroke-width="2"/><text x="320" y="76" text-anchor="middle" class="svg-ink" font-size="13">R2 (ABR)</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="10">type 3 cost 2</text>
<rect x="510" y="55" width="110" height="46" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="565" y="76" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="565" y="92" text-anchor="middle" class="svg-muted" font-size="10">172.16.1.0/24</text>
<line x1="130" y1="78" x2="265" y2="78" stroke="#64748b" stroke-width="3"/><text x="198" y="70" text-anchor="middle" class="svg-accent" font-size="12">cost 1</text>
<line x1="375" y1="78" x2="510" y2="78" stroke="#64748b" stroke-width="3"/><text x="443" y="70" text-anchor="middle" class="svg-ink" font-size="12">link 1 + loopback 1</text>
<text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">R3 metric = 1 (to ABR) + 2 (advertised) = 3</text>
</svg><p class="cap">The ABR advertises 2: one for the R2-R1 link and one for the LAN interface itself. R3 adds its own cost to reach R2.</p></div>
<p>The route detail confirms the number and the type:</p>
<pre class="out">R3# show ip route 172.16.1.0
Routing entry for 172.16.1.0/24
  Known via "ospf 1", distance 110, metric 3, type inter area
  Routing Descriptor Blocks:
  * 10.0.23.1, via GigabitEthernet0/0</pre>
<p>R1's reverse path works the same way: the type 3 for 3.3.3.3 carries cost 2 from R2 (link to R3 plus the loopback), and R1 adds 1 to reach R2, giving <code>[110/3]</code>.</p>

<h3>External routes: E1 versus E2</h3>
<ul>
<li><b>E2</b> (default): the metric given by the ASBR is carried unchanged to every router. Inside the domain the cost does not grow. The default route above shows <code>[110/1]</code> on both R2 and R1. Use E2 when there is only one way out, or when internal cost should not matter.</li>
<li><b>E1</b>: each router adds the internal cost to the ASBR to the external metric. A route that is nearer to one of two ASBRs costs less, so E1 is the right choice when there are several exits and you want the closest one. Chapter 8 shows the numbers.</li>
</ul>
<p>When the same prefix is available as E1 and E2 from different ASBRs, E1 wins. When two E2 routes compete, the lower external metric wins first, and the cost to the ASBR breaks the tie.</p>

<div class="eg"><p><b>Worked example.</b> Suppose R3 also had a new area 0 prefix 192.168.50.0/24 at cost 1, and R1 learned it. R1 sees R2's type 3 with cost 2 (R2 to R3 link 1 plus the LAN 1). R1 adds its own cost to R2, 1. The route is <code>O IA 192.168.50.0 [110/3]</code>. Now imagine someone also redistributes the same prefix as external E2 with metric 5. R1 would still choose the O IA route, even if the E2 metric looked smaller, because inter-area beats external. Metrics are only compared inside one route type.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Comparing an <code>O IA</code> metric to an <code>O E2</code> metric as if they were the same kind of number. Expecting the cost of an <code>O E2</code> route to change as it crosses areas: it will not. Forgetting that an <code>O IA</code> route always goes through an ABR, so if the ABR fails, the area loses all inter-area routes until the topology converges. And thinking that O IA means a route from a far-away site: it only means a route from another area.</p></div>

<div class="exam"><p><b>Exam traps.</b> OSPF AD is 110 for O, O IA, E1 and E2. Preference order is O, O IA, E1, E2 for the same prefix. E2 is the default external type. Routes redistributed into OSPF get metric 20 by default, while a default route from default-information originate gets metric 1. The next hop of an O IA route is always on the path towards an ABR. The cost to the ABR is added to the advertised cost.</p></div>

<div class="scn"><h4>Two exits, one wrong</h4><p>A company had two internet exits, one in Mumbai and one in Chennai, both ASBRs advertising a default route as E2 with metric 1. Branch routers in the south happily sent traffic to Mumbai because the E2 tie-break only looks at the cost to the ASBR when the external metrics are equal, and with a poorly set reference bandwidth both costs looked the same. Changing the Chennai default to E1 and fixing the reference bandwidth let each router choose the nearest exit.</p><p><b>Lesson:</b> with several exits, E1 or consistent costs matter. With one exit, E2 is fine.</p></div>

<div class="iv"><p class="q">'How does a router calculate the cost of an inter-area route?'</p><p>Strong answer: the ABR runs SPF inside the source area and advertises the prefix in a type 3 LSA with that cost. The remote router runs SPF to the ABR and adds that cost to the advertised value. So the total is cost to the ABR plus ABR-to-prefix cost. I would add that the route shows as O IA, and that it is preferred over any external route.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>O is intra-area, O IA is learned from a type 3 LSA, E1 and E2 are externals from type 5 LSAs.</li>
<li>Preference for the same prefix is O, then O IA, then E1, then E2: metrics are not compared across types.</li>
<li>Inter-area cost = cost to the ABR plus the cost the ABR advertises.</li>
<li>E2 keeps the external metric fixed; E1 adds the internal cost to the ASBR at every hop.</li>
</ul></div>
`,hi:`
<p>Delhi se Kochi ki train book karte ho to ticket par Kerala ka har junction nahi likha hota. Likha hota hai: Delhi se Ernakulam, 2,700 km. Kerala ke andar ka raasta local railway ka sirdard hai. ABR dusre areas ke routers ko bilkul aisa hi ticket deta hai: 'prefix udhar hai, aur wahan tak pahunchne ki cost itni hai'. Yeh chapter dikhata hai ki yeh tickets routes kaise banti hain, cost kaise judti hai, aur route codes <code>O</code>, <code>O IA</code>, <code>O E1</code> aur <code>O E2</code> ko metric se kyun kabhi compare nahi kiya jaata.</p>

<h3>Chaar route types</h3>
<div class="tbl"><table>
<tr><th>Code</th><th>Matlab</th><th>Kahan se seekha</th><th>Preference</th></tr>
<tr><td><b>O</b></td><td>Intra-area</td><td>Router ke apne area ke type 1 aur 2 LSAs</td><td>Sabse achha</td></tr>
<tr><td><b>O IA</b></td><td>Inter-area</td><td>ABR ka type 3 LSA</td><td>Doosra</td></tr>
<tr><td><b>O E1</b></td><td>External type 1</td><td>Type 5 LSA, metric = external cost + internal cost</td><td>Teesra</td></tr>
<tr><td><b>O E2</b></td><td>External type 2 (externals ke liye default)</td><td>Type 5 LSA, metric = sirf external cost</td><td>Aakhri</td></tr>
</table></div>
<p>Chaaron ka administrative distance 110 hai, isliye inke beech ka faisla AD ya metric compare karke nahi hota: OSPF same prefix ke liye seedha <b>O ko O IA par, O IA ko E1 par, E1 ko E2 par</b> prefer karta hai. Lekin longer, zyada specific prefix inn sab par bhaari padta hai, kyunki longest match pehle hota hai.</p>

<h3>Table mein dekho</h3>
<p>R3 area 0 mein hai. ABR R2 ne area 1 ke prefixes ko type 3 LSAs mein badal diya hai:</p>
<pre class="out">R3# show ip route ospf
Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
       i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2
       * - candidate default, U - per-user static route, + - replicated route

Gateway of last resort is 203.0.113.2 to network 0.0.0.0

      1.0.0.0/32 is subnetted, 1 subnets
<span class="hl">O IA     1.1.1.1 [110/3] via 10.0.23.1, 00:01:00, GigabitEthernet0/0</span>
      2.0.0.0/32 is subnetted, 1 subnets
<span class="hl">O        2.2.2.2 [110/2] via 10.0.23.1, 00:01:00, GigabitEthernet0/0</span>
      10.0.0.0/30 is subnetted, 1 subnets
O IA     10.0.12.0 [110/2] via 10.0.23.1, 00:01:00, GigabitEthernet0/0
      172.16.0.0/24 is subnetted, 3 subnets
<span class="hl">O IA     172.16.1.0 [110/3] via 10.0.23.1, 00:01:00, GigabitEthernet0/0</span>
O IA     172.16.2.0 [110/3] via 10.0.23.1, 00:01:00, GigabitEthernet0/0
O IA     172.16.3.0 [110/3] via 10.0.23.1, 00:01:00, GigabitEthernet0/0</pre>
<p>R2 ka loopback 2.2.2.2 area 0 mein hai, isliye R3 ise seedha <code>O</code> ke roop mein dekhta hai. Area 1 mein jo kuch hai woh <code>O IA</code> hai. Chaaron next hops 10.0.23.1 hain: ABR. R3 ko na pata hai na parwah ki R1 apne teen LANs kaise jodta hai. R1 ka same view default route ko external dikhata hai:</p>
<pre class="out">R1# show ip route ospf
Gateway of last resort is 10.0.12.2 to network 0.0.0.0

<span class="hl">O*E2     0.0.0.0/0 [110/1] via 10.0.12.2, 00:01:00, GigabitEthernet0/0</span>
      2.0.0.0/32 is subnetted, 1 subnets
O IA     2.2.2.2 [110/2] via 10.0.12.2, 00:01:00, GigabitEthernet0/0
      3.0.0.0/32 is subnetted, 1 subnets
O IA     3.3.3.3 [110/3] via 10.0.12.2, 00:01:00, GigabitEthernet0/0
      10.0.0.0/30 is subnetted, 1 subnets
O IA     10.0.23.0 [110/2] via 10.0.12.2, 00:01:00, GigabitEthernet0/0</pre>
<p>(Code legend, upar jaisi hi, yahan chhaanti gayi hai.) R1 ke liye area 0 ka sab kuch 10.0.12.2 ke through <code>O IA</code> hai, aur default route <code>O*E2</code> hai. Asterisk candidate default mark karta hai.</p>

<h3>Areas ke paar cost kaise banti hai</h3>
<p>Type 3 LSA <b>ABR se prefix tak ki cost</b> le jaata hai, jo ABR ke apne SPF se source area mein nikali jaati hai. Receive karne wala router usmein <b>ABR tak apni cost</b> jodta hai. Total: ABR tak cost plus ABR ki advertised cost.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="R3 se dekha 172.16.1.0/24 ki cost: 1 plus 2 barabar 3">
<rect x="20" y="55" width="110" height="46" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="75" y="76" text-anchor="middle" class="svg-ink" font-size="13">R3</text><text x="75" y="92" text-anchor="middle" class="svg-muted" font-size="10">area 0</text>
<rect x="265" y="55" width="110" height="46" rx="8" fill="#fff" stroke="#64748b" stroke-width="2"/><text x="320" y="76" text-anchor="middle" class="svg-ink" font-size="13">R2 (ABR)</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="10">type 3 cost 2</text>
<rect x="510" y="55" width="110" height="46" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="565" y="76" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="565" y="92" text-anchor="middle" class="svg-muted" font-size="10">172.16.1.0/24</text>
<line x1="130" y1="78" x2="265" y2="78" stroke="#64748b" stroke-width="3"/><text x="198" y="70" text-anchor="middle" class="svg-accent" font-size="12">cost 1</text>
<line x1="375" y1="78" x2="510" y2="78" stroke="#64748b" stroke-width="3"/><text x="443" y="70" text-anchor="middle" class="svg-ink" font-size="12">link 1 + loopback 1</text>
<text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">R3 metric = 1 (ABR tak) + 2 (advertised) = 3</text>
</svg><p class="cap">ABR 2 advertise karta hai: R2-R1 link ka 1 aur LAN interface ka khud ka 1. R3 R2 tak apni cost jodta hai.</p></div>
<p>Route ka detail number aur type dono confirm karta hai:</p>
<pre class="out">R3# show ip route 172.16.1.0
Routing entry for 172.16.1.0/24
  Known via "ospf 1", distance 110, metric 3, type inter area
  Routing Descriptor Blocks:
  * 10.0.23.1, via GigabitEthernet0/0</pre>
<p>R1 ka ulta raasta bhi aise hi chalta hai: 3.3.3.3 ka type 3 R2 se cost 2 le jaata hai (R3 tak link plus loopback), aur R1 R2 tak 1 jodta hai, jisse <code>[110/3]</code> banta hai.</p>

<h3>External routes: E1 versus E2</h3>
<ul>
<li><b>E2</b> (default): ASBR ka diya hua metric har router tak bina badle jaata hai. Domain ke andar cost badhti nahi. Upar default route R2 aur R1 dono par <code>[110/1]</code> dikhata hai. E2 tab use karo jab nikalne ka ek hi rasta ho, ya internal cost se farak na padna chahiye.</li>
<li><b>E1</b>: har router ASBR tak ki internal cost external metric mein jodta hai. Do ASBRs mein se jo paas ho uska route sasta padta hai, isliye kai exits hon aur sabse nazdeeki chahiye to E1 sahi choice hai. Chapter 8 mein numbers dikhte hain.</li>
</ul>
<p>Jab same prefix alag ASBRs se E1 aur E2 dono ke roop mein mile, E1 jeetta hai. Jab do E2 routes compete karein, pehle kam external metric jeetta hai, aur ASBR tak ki cost tie todti hai.</p>

<div class="eg"><p><b>Worked example.</b> Maan lo R3 ke paas area 0 ka ek naya prefix 192.168.50.0/24 cost 1 par hai, aur R1 ne use seekha. R1 ko R2 ka type 3 cost 2 ke saath dikhta hai (R2 se R3 link 1 plus LAN 1). R1 R2 tak apni cost 1 jodta hai. Route: <code>O IA 192.168.50.0 [110/3]</code>. Ab socho kisi ne wahi prefix metric 5 ke saath external E2 ke roop mein bhi redistribute kiya. R1 phir bhi O IA route chunega, chahe E2 metric chhota dikhe, kyunki inter-area external par bhaari hai. Metrics sirf ek route type ke andar compare hote hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>O IA</code> metric ko <code>O E2</code> metric se aise compare karna jaise dono ek hi tarah ke number hon. <code>O E2</code> route ki cost areas paar karte time badalne ki ummeed rakhna: nahi badalti. Bhoolna ki <code>O IA</code> route hamesha ABR se guzarta hai, isliye ABR fail ho to area topology converge hone tak saare inter-area routes kho deta hai. Aur sochna ki O IA matlab door ki site ka route: iska matlab sirf dusre area ka route hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> O, O IA, E1 aur E2 sab ka AD 110 hai. Same prefix ke liye preference order O, O IA, E1, E2 hai. E2 default external type hai. OSPF mein redistribute kiye routes ka default metric 20 hota hai, jabki default-information originate se aaye default route ka metric 1 hota hai. O IA route ka next hop hamesha ABR ki taraf wale path par hota hai. ABR tak ki cost advertised cost mein judti hai.</p></div>

<div class="scn"><h4>Do exits, ek galat</h4><p>Ek company ke do internet exits the, ek Mumbai mein aur ek Chennai mein, dono ASBRs E2 metric 1 ke saath default route advertise karte the. South ke branch routers khushi se Mumbai ko traffic bhej rahe the, kyunki E2 tie-break tabhi ASBR tak ki cost dekhta hai jab external metrics barabar hon, aur kharab reference bandwidth ki wajah se dono costs ek jaisi dikh rahi thi. Chennai ke default ko E1 karne aur reference bandwidth theek karne se har router ne nazdeeki exit chuna.</p><p><b>Seekh:</b> kai exits hon to E1 ya consistent costs zaroori hain. Ek exit ho to E2 theek hai.</p></div>

<div class="iv"><p class="q">'Router inter-area route ki cost kaise calculate karta hai?'</p><p>Strong answer: ABR source area ke andar SPF chalata hai aur prefix ko us cost ke saath type 3 LSA mein advertise karta hai. Remote router ABR tak SPF chalata hai aur us cost ko advertised value mein jodta hai. Total: ABR tak cost plus ABR se prefix tak cost. Main yeh bhi jodunga ki route O IA dikhta hai, aur woh kisi bhi external route se zyada preferred hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>O intra-area hai, O IA type 3 LSA se aata hai, E1 aur E2 type 5 LSAs ke externals hain.</li>
<li>Same prefix ke liye preference O, phir O IA, phir E1, phir E2: metrics types ke beech compare nahi hote.</li>
<li>Inter-area cost = ABR tak cost plus ABR ki advertised cost.</li>
<li>E2 external metric ko fixed rakhta hai; E1 har hop par ASBR tak ki internal cost jodta hai.</li>
</ul></div>
`}};export{e as default};