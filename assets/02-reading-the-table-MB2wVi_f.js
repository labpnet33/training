var e={id:`reading-the-table`,h:{en:`Reading the routing table line by line`,hi:`Routing table ko line by line padhna`},body:{en:`
<p>A railway timetable looks scary the first time: codes, platform numbers, footnotes. After ten minutes you read it without thinking. <code>show ip route</code> is the same. It has a fixed layout, and once you know what each column means you can diagnose half of all routing tickets just by reading it.</p>

<h3>The full output from R1</h3>
<p>This is R1 from the first lab after the static routes are in place:</p>
<pre class="out">R1#show ip route
Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
       i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2
       ia - IS-IS inter area, * - candidate default, U - per-user static route
       o - ODR, P - periodic downloaded static route, H - NHRP, l - LISP
       a - application route
       + - replicated route, % - next hop override, p - overrides from PfR

<span class="hl">Gateway of last resort is not set</span>

      10.0.0.0/8 is variably subnetted, 3 subnets, 2 masks
C        10.12.12.0/30 is directly connected, GigabitEthernet0/1
L        10.12.12.1/32 is directly connected, GigabitEthernet0/1
S        10.23.23.0/30 [1/0] via 10.12.12.2
      172.16.0.0/16 is variably subnetted, 3 subnets, 2 masks
C        172.16.1.0/24 is directly connected, GigabitEthernet0/0
L        172.16.1.1/32 is directly connected, GigabitEthernet0/0
<span class="hl">S        172.16.3.0/24 [1/0] via 10.12.12.2</span></pre>

<h3>Part 1: the codes legend</h3>
<p>The first block is just a legend. The letter at the start of every route tells you its <b>source</b>. For CCNA you must recognise <b>L</b> (local), <b>C</b> (connected), <b>S</b> (static), <b>O</b> (OSPF intra-area), <b>D</b> (EIGRP), <b>R</b> (RIP), <b>B</b> (BGP) and the asterisk <b>*</b>, which marks a <b>candidate default</b> route. <code>S*</code> therefore means a static default route, and <code>O*E2</code> means an OSPF external default route.</p>

<h3>Part 2: the gateway of last resort</h3>
<p>This line tells you whether a default route is installed. "not set" means there is no default, so any destination not listed below is dropped. When a default exists you see, for example, <code>Gateway of last resort is 100.64.1.1 to network 0.0.0.0</code>. Chapter 8 covers default routes in depth.</p>

<h3>Part 3: parent (heading) lines</h3>
<p>Lines such as <code>172.16.0.0/16 is variably subnetted, 3 subnets, 2 masks</code> are not routes. IOS groups the entries under their old classful network (10.0.0.0/8, 172.16.0.0/16, 192.168.x.0/24) and tells you how many subnets and how many different mask lengths live under it. "Variably subnetted" simply means more than one mask length. You never forward traffic using the heading line.</p>

<h3>Part 4: anatomy of one route</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Anatomy of a routing table entry">
<rect x="20" y="60" width="600" height="46" rx="8" fill="#e2e8f0"/>
<text x="40" y="89" class="svg-ink" font-size="14">O</text>
<text x="80" y="89" class="svg-ink" font-size="14">10.1.3.0/24</text>
<text x="200" y="89" class="svg-ink" font-size="14">[110/3]</text>
<text x="275" y="89" class="svg-ink" font-size="14">via 10.12.12.2,</text>
<text x="395" y="89" class="svg-ink" font-size="14">00:03:12,</text>
<text x="480" y="89" class="svg-ink" font-size="14">Gi0/1</text>
<text x="44" y="40" text-anchor="middle" class="svg-accent" font-size="12">source</text>
<text x="120" y="40" text-anchor="middle" class="svg-accent" font-size="12">prefix/length</text>
<text x="226" y="40" text-anchor="middle" class="svg-accent" font-size="12">AD/metric</text>
<text x="325" y="40" text-anchor="middle" class="svg-accent" font-size="12">next hop</text>
<text x="428" y="140" text-anchor="middle" class="svg-muted" font-size="12">age</text>
<text x="500" y="140" text-anchor="middle" class="svg-muted" font-size="12">exit interface</text>
<line x1="44" y1="46" x2="44" y2="66" stroke="#64748b"/><line x1="120" y1="46" x2="120" y2="66" stroke="#64748b"/><line x1="226" y1="46" x2="226" y2="66" stroke="#64748b"/><line x1="325" y1="46" x2="325" y2="66" stroke="#64748b"/>
<line x1="428" y1="100" x2="428" y2="128" stroke="#64748b"/><line x1="500" y1="100" x2="500" y2="128" stroke="#64748b"/>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">Static routes show no age and, with a next hop only, no exit interface</text>
</svg><p class="cap">Six fields of a routing entry, shown on an OSPF route because it has all of them.</p></div>
<dl class="terms">
<dt>Source code</dt><dd>Who put the route here: C, L, S, O and so on.</dd>
<dt>Prefix/length</dt><dd>The destination network and how many leading bits must match. 172.16.3.0/24 matches any address from 172.16.3.0 to 172.16.3.255.</dd>
<dt>[AD/metric]</dt><dd><b>Administrative distance</b> (how trustworthy the source is, lower wins) and <b>metric</b> (the cost of this path inside that source, lower wins). Static routes default to [1/0]. Connected and local routes do not show brackets; their AD is 0.</dd>
<dt>via next hop</dt><dd>The IP address of the neighbouring router that receives the packet. It must be reachable, normally on a directly connected subnet.</dd>
<dt>Age</dt><dd>How long ago a dynamic protocol learned or refreshed the route. Static and connected routes show none.</dd>
<dt>Exit interface</dt><dd>The interface the packet leaves by. A static route with only a next hop does not print it; the router finds it by looking up the next hop (recursive lookup, chapter 7).</dd>
</dl>

<h3>Filtering the output</h3>
<pre class="code"><span class="c">! show only one source</span>
show ip route static
show ip route connected
show ip route ospf
<span class="c">! show the entry used for one destination address</span>
show ip route 172.16.3.10
<span class="c">! show everything inside a prefix, including longer matches</span>
show ip route 172.16.0.0 255.255.0.0 longer-prefixes</pre>

<div class="eg"><p><b>Worked example.</b> Read this line aloud: <code>S 172.16.3.0/24 [1/0] via 10.12.12.2</code>. "A static route to the 256-address network 172.16.3.0/24, administrative distance 1, metric 0, forwarded to the neighbour 10.12.12.2." To learn which interface is used, look up 10.12.12.2 itself: it falls in <code>C 10.12.12.0/30 ... GigabitEthernet0/1</code>, so traffic leaves by Gi0/1.</p></div>

<div class="warn"><p><b>Common mistake.</b> Reading the heading line <code>10.0.0.0/8 is variably subnetted</code> as if the router had a route for all of 10.0.0.0/8. It does not. Only the indented entries are routes. A packet for 10.50.1.1 in this table matches nothing and is dropped.</p></div>

<div class="exam"><p><b>Exam trap.</b> Exam exhibits love asking "which value is the metric?" In <code>[110/3]</code>, 110 is the AD and 3 is the metric. Another favourite: <code>*</code> means candidate default, not "best route" or "active route".</p></div>

<div class="scn"><h4>The route that was there, but was not</h4><p>A NOC engineer was told "we have a route to 10.0.0.0/8 on the edge router, so the new 10.77.4.0/24 site must be reachable". The ticket stayed open for an hour. Reading <code>show ip route</code> properly showed only the heading line <code>10.0.0.0/8 is variably subnetted, 12 subnets, 3 masks</code> and twelve specific subnets, none covering 10.77.4.0. Running <code>show ip route 10.77.4.1</code> answered instantly: <code>% Subnet not in table</code>. A static route to the new site closed the ticket.</p><p><b>Lesson:</b> read the entries, not the headings, and test a specific address with <code>show ip route x.x.x.x</code>.</p></div>

<div class="iv"><p class="q">"In a routing table entry, what do the two numbers in square brackets mean?"</p><p>Strong answer: the first is administrative distance, the trust level of the route source, used to choose between sources offering the same prefix; the second is the metric, the protocol's own cost, used to choose between paths from the same source. Give an example: [110/3] is OSPF with cost 3, [1/0] is a static route. Add that connected routes have AD 0 and print no brackets.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The code letter shows the route source; * marks a candidate default.</li>
<li>"Gateway of last resort" tells you whether a default route exists.</li>
<li>Heading lines ("variably subnetted") are summaries of the display, not routes.</li>
<li>Entry format: code, prefix/length, [AD/metric], via next hop, age, exit interface.</li>
<li>Use <code>show ip route static</code> and <code>show ip route x.x.x.x</code> to filter and to test one destination.</li>
</ul></div>
`,hi:`
<p>Railway timetable pehli baar dekhne mein darawna lagta hai: codes, platform numbers, footnotes. Das minute baad aap use bina soche padh lete ho. <code>show ip route</code> bhi waisa hi hai. Iska layout fixed hai, aur jab aapko har column ka matlab pata ho jaata hai to aap sirf use padh kar aadhe routing tickets diagnose kar sakte ho.</p>

<h3>R1 ka poora output</h3>
<p>Yeh pehle lab ka R1 hai, static routes lagne ke baad:</p>
<pre class="out">R1#show ip route
Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
       i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2
       ia - IS-IS inter area, * - candidate default, U - per-user static route
       o - ODR, P - periodic downloaded static route, H - NHRP, l - LISP
       a - application route
       + - replicated route, % - next hop override, p - overrides from PfR

<span class="hl">Gateway of last resort is not set</span>

      10.0.0.0/8 is variably subnetted, 3 subnets, 2 masks
C        10.12.12.0/30 is directly connected, GigabitEthernet0/1
L        10.12.12.1/32 is directly connected, GigabitEthernet0/1
S        10.23.23.0/30 [1/0] via 10.12.12.2
      172.16.0.0/16 is variably subnetted, 3 subnets, 2 masks
C        172.16.1.0/24 is directly connected, GigabitEthernet0/0
L        172.16.1.1/32 is directly connected, GigabitEthernet0/0
<span class="hl">S        172.16.3.0/24 [1/0] via 10.12.12.2</span></pre>

<h3>Part 1: codes legend</h3>
<p>Pehla block sirf ek legend hai. Har route ke shuru ka letter aapko uska <b>source</b> batata hai. CCNA ke liye aapko <b>L</b> (local), <b>C</b> (connected), <b>S</b> (static), <b>O</b> (OSPF intra-area), <b>D</b> (EIGRP), <b>R</b> (RIP), <b>B</b> (BGP) aur asterisk <b>*</b> pehchanna hai, jo <b>candidate default</b> route mark karta hai. Isliye <code>S*</code> ka matlab static default route, aur <code>O*E2</code> ka matlab OSPF external default route.</p>

<h3>Part 2: gateway of last resort</h3>
<p>Yeh line batati hai ki default route install hai ya nahi. "not set" ka matlab koi default nahi, isliye jo destination neeche listed nahi hai woh drop hoga. Default hone par aapko dikhega, jaise <code>Gateway of last resort is 100.64.1.1 to network 0.0.0.0</code>. Chapter 8 default routes ko detail mein cover karta hai.</p>

<h3>Part 3: parent (heading) lines</h3>
<p><code>172.16.0.0/16 is variably subnetted, 3 subnets, 2 masks</code> jaisi lines routes nahi hain. IOS entries ko unke purane classful network (10.0.0.0/8, 172.16.0.0/16, 192.168.x.0/24) ke neeche group karta hai aur batata hai ki uske andar kitne subnets aur kitni alag mask lengths hain. "Variably subnetted" ka simple matlab hai ek se zyada mask length. Heading line se kabhi traffic forward nahi hota.</p>

<h3>Part 4: ek route ki anatomy</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Routing table entry ki anatomy">
<rect x="20" y="60" width="600" height="46" rx="8" fill="#e2e8f0"/>
<text x="40" y="89" class="svg-ink" font-size="14">O</text>
<text x="80" y="89" class="svg-ink" font-size="14">10.1.3.0/24</text>
<text x="200" y="89" class="svg-ink" font-size="14">[110/3]</text>
<text x="275" y="89" class="svg-ink" font-size="14">via 10.12.12.2,</text>
<text x="395" y="89" class="svg-ink" font-size="14">00:03:12,</text>
<text x="480" y="89" class="svg-ink" font-size="14">Gi0/1</text>
<text x="44" y="40" text-anchor="middle" class="svg-accent" font-size="12">source</text>
<text x="120" y="40" text-anchor="middle" class="svg-accent" font-size="12">prefix/length</text>
<text x="226" y="40" text-anchor="middle" class="svg-accent" font-size="12">AD/metric</text>
<text x="325" y="40" text-anchor="middle" class="svg-accent" font-size="12">next hop</text>
<text x="428" y="140" text-anchor="middle" class="svg-muted" font-size="12">age</text>
<text x="500" y="140" text-anchor="middle" class="svg-muted" font-size="12">exit interface</text>
<line x1="44" y1="46" x2="44" y2="66" stroke="#64748b"/><line x1="120" y1="46" x2="120" y2="66" stroke="#64748b"/><line x1="226" y1="46" x2="226" y2="66" stroke="#64748b"/><line x1="325" y1="46" x2="325" y2="66" stroke="#64748b"/>
<line x1="428" y1="100" x2="428" y2="128" stroke="#64748b"/><line x1="500" y1="100" x2="500" y2="128" stroke="#64748b"/>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">Static routes mein age nahi, aur sirf next hop ho to exit interface bhi nahi</text>
</svg><p class="cap">Routing entry ke chhe fields, OSPF route par dikhaye gaye kyunki usme sab hote hain.</p></div>
<dl class="terms">
<dt>Source code</dt><dd>Route yahan kisne daala: C, L, S, O wagairah.</dd>
<dt>Prefix/length</dt><dd>Destination network aur kitne shuruaati bits match hone chahiye. 172.16.3.0/24 172.16.3.0 se 172.16.3.255 tak koi bhi address match karta hai.</dd>
<dt>[AD/metric]</dt><dd><b>Administrative distance</b> (source kitna bharosemand hai, kam jeetta hai) aur <b>metric</b> (us source ke andar is path ki cost, kam jeetta hai). Static routes default mein [1/0] hote hain. Connected aur local routes brackets nahi dikhate; unki AD 0 hai.</dd>
<dt>via next hop</dt><dd>Padosi router ka IP address jo packet receive karta hai. Yeh reachable hona chahiye, normally directly connected subnet par.</dd>
<dt>Age</dt><dd>Kitni der pehle dynamic protocol ne route seekha ya refresh kiya. Static aur connected routes mein age nahi hoti.</dd>
<dt>Exit interface</dt><dd>Woh interface jisse packet bahar jaata hai. Sirf next hop wala static route ise print nahi karta; router next hop ko lookup karke ise dhoondhta hai (recursive lookup, chapter 7).</dd>
</dl>

<h3>Output filter karna</h3>
<pre class="code"><span class="c">! sirf ek source dikhao</span>
show ip route static
show ip route connected
show ip route ospf
<span class="c">! ek destination address ke liye use hone wali entry dikhao</span>
show ip route 172.16.3.10
<span class="c">! ek prefix ke andar sab kuch dikhao, longer matches samet</span>
show ip route 172.16.0.0 255.255.0.0 longer-prefixes</pre>

<div class="eg"><p><b>Worked example.</b> Yeh line zor se padho: <code>S 172.16.3.0/24 [1/0] via 10.12.12.2</code>. "256 addresses wale network 172.16.3.0/24 ka static route, administrative distance 1, metric 0, neighbour 10.12.12.2 ko forward." Kaunsa interface use hota hai yeh jaanne ke liye, khud 10.12.12.2 lookup karo: yeh <code>C 10.12.12.0/30 ... GigabitEthernet0/1</code> mein aata hai, isliye traffic Gi0/1 se nikalta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Heading line <code>10.0.0.0/8 is variably subnetted</code> ko aise padhna jaise router ke paas poore 10.0.0.0/8 ka route ho. Aisa nahi hai. Sirf indented entries routes hain. Is table mein 10.50.1.1 ka packet kuch match nahi karta aur drop hota hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Exam exhibits ko poochna pasand hai "kaunsa value metric hai?" <code>[110/3]</code> mein 110 AD hai aur 3 metric. Ek aur favourite: <code>*</code> ka matlab candidate default hai, "best route" ya "active route" nahi.</p></div>

<div class="scn"><h4>Woh route jo tha, par tha nahi</h4><p>Ek NOC engineer ko bataya gaya "edge router par 10.0.0.0/8 ka route hai, to naya 10.77.4.0/24 site reachable hona chahiye". Ticket ek ghante tak khula raha. <code>show ip route</code> dhyan se padhne par sirf heading line <code>10.0.0.0/8 is variably subnetted, 12 subnets, 3 masks</code> aur baarah specific subnets dikhe, koi bhi 10.77.4.0 cover nahi karta tha. <code>show ip route 10.77.4.1</code> ne turant jawab diya: <code>% Subnet not in table</code>. Naye site ke static route ne ticket close kiya.</p><p><b>Seekh:</b> headings nahi, entries padho, aur ek specific address ko <code>show ip route x.x.x.x</code> se test karo.</p></div>

<div class="iv"><p class="q">"Routing table entry mein square brackets ke do numbers ka kya matlab hai?"</p><p>Strong answer: pehla administrative distance hai, route source ka trust level, jo same prefix dene wale sources mein choose karne ke liye use hota hai; doosra metric hai, protocol ki apni cost, jo same source ke paths mein choose karne ke liye use hoti hai. Example do: [110/3] cost 3 wala OSPF hai, [1/0] static route hai. Jodo ki connected routes ki AD 0 hai aur woh brackets print nahi karte.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Code letter route ka source dikhata hai; * candidate default mark karta hai.</li>
<li>"Gateway of last resort" batata hai ki default route hai ya nahi.</li>
<li>Heading lines ("variably subnetted") display ki summary hain, routes nahi.</li>
<li>Entry format: code, prefix/length, [AD/metric], via next hop, age, exit interface.</li>
<li>Filter karne aur ek destination test karne ke liye <code>show ip route static</code> aur <code>show ip route x.x.x.x</code> use karo.</li>
</ul></div>
`}};export{e as default};