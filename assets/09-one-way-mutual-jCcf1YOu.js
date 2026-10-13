var e={id:`one-way-mutual`,h:{en:`One-way and mutual redistribution: building lab 1`,hi:`One-way aur mutual redistribution: lab 1 banana`},body:{en:`
<p>A small village joined to a highway by a single one-way slip road is easy to manage: cars can enter the highway, and for the way back the village simply follows a sign that says "everything else, this way". Connect a big city to the highway with two two-way junctions and you need traffic police, signs and rules, or cars will circle forever. Redistribution designs grow the same way, from <b>one-way</b> at one point to <b>mutual</b> (two-way) at several points.</p>

<h3>Four designs, four risk levels</h3>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Redistribution design risk">
<rect x="120" y="20" width="250" height="90" rx="10" fill="#bbf7d0"/><text x="245" y="55" text-anchor="middle" class="svg-ink" font-size="14">one-way, one point</text><text x="245" y="78" text-anchor="middle" class="svg-muted" font-size="12">safest; add a default route back</text>
<rect x="380" y="20" width="250" height="90" rx="10" fill="#fde68a"/><text x="505" y="55" text-anchor="middle" class="svg-ink" font-size="14">mutual, one point</text><text x="505" y="78" text-anchor="middle" class="svg-muted" font-size="12">no feedback path, single failure point</text>
<rect x="120" y="120" width="250" height="90" rx="10" fill="#fde68a"/><text x="245" y="155" text-anchor="middle" class="svg-ink" font-size="14">one-way, two points</text><text x="245" y="178" text-anchor="middle" class="svg-muted" font-size="12">redundant; AD surprises possible</text>
<rect x="380" y="120" width="250" height="90" rx="10" fill="#fed7aa"/><text x="505" y="155" text-anchor="middle" class="svg-ink" font-size="14">mutual, two points</text><text x="505" y="178" text-anchor="middle" class="svg-muted" font-size="12">feedback, loops, suboptimal paths</text>
<text x="60" y="70" text-anchor="middle" class="svg-muted" font-size="12">1 point</text><text x="60" y="170" text-anchor="middle" class="svg-muted" font-size="12">2+ points</text>
<text x="245" y="232" text-anchor="middle" class="svg-muted" font-size="12">one direction</text><text x="505" y="232" text-anchor="middle" class="svg-muted" font-size="12">both directions</text>
</svg><p class="cap">Risk grows with the number of redistribution points and directions; the module labs sit in the bottom-right corner.</p></div>
<ul>
<li><b>One-way, one point.</b> Example: a small OSPF branch domain behind BR1. BR1 redistributes OSPF into EIGRP, and instead of redistributing EIGRP back, it sends a default route into OSPF with <code>default-information originate</code>. No feedback is possible.</li>
<li><b>Mutual, one point.</b> Both directions on one router. A route cannot come back through a second boundary, so feedback is impossible, but the single router is a single point of failure.</li>
<li><b>One-way, two points.</b> Redundant, but a route redistributed at one point can still be seen by the other point in the destination protocol and win on AD.</li>
<li><b>Mutual, two or more points.</b> Redundant and realistic, and home to every problem in chapter 10. You need tags, filters and AD planning.</li>
</ul>

<h3>Lab 1, step by step</h3>
<p>Starting point: EIGRP 100 is up between E1, BR1 and BR2; OSPF area 0 is up between O1, BR1 and BR2; no redistribution yet.</p>
<p><b>Step 1: OSPF into EIGRP on both boundary routers.</b></p>
<pre class="code"><span class="c">! BR1 and BR2</span>
router eigrp 100
 redistribute ospf 1 metric 100000 100 255 1 1500
<span class="c">! alternative: default-metric 100000 100 255 1 1500, then redistribute ospf 1</span></pre>
<pre class="out">E1#show ip route eigrp | include EX
<span class="hl">D EX     10.200.10.0/24 [170/51456] via 10.1.2.2, 00:00:41, GigabitEthernet0/1</span>
<span class="hl">                        [170/51456] via 10.1.1.2, 00:00:41, GigabitEthernet0/0</span>
D EX     10.200.1.0/24 [170/51456] via 10.1.2.2, 00:00:41, GigabitEthernet0/1
                       [170/51456] via 10.1.1.2, 00:00:41, GigabitEthernet0/0</pre>
<p>Two equal next hops: both boundary routers redistribute with the same seed, so E1 load-shares.</p>

<p><b>Step 2: EIGRP into OSPF on both boundary routers.</b></p>
<pre class="code">router ospf 1
 redistribute eigrp 100 subnets</pre>
<pre class="out">O1#show ip route ospf | include E2
<span class="hl">O E2     172.16.10.0/24 [110/20] via 10.2.2.2, 00:01:02, GigabitEthernet0/1</span>
<span class="hl">                        [110/20] via 10.2.1.2, 00:01:02, GigabitEthernet0/0</span>
O E2     192.168.50.0/24 [110/20] via 10.2.2.2, 00:01:02, GigabitEthernet0/1</pre>
<p>Notice the difference. 172.16.10.0/24 is an EIGRP <b>internal</b> route (AD 90) on both boundary routers, so both redistribute it. 192.168.50.0/24 is EIGRP <b>external</b> (AD 170). Whichever boundary router redistributed it first (here BR2) created an O E2 route; the other one (BR1) then preferred that O E2 copy (AD 110) over its own D EX route (AD 170), so BR1 has nothing to redistribute. You have just reproduced the suboptimal-routing problem that lab 2 fixes.</p>

<p><b>Step 3: feedback appears.</b> BR1 now holds 192.168.50.0/24 as an OSPF route, and it redistributes OSPF into EIGRP, so it injects E1's own network back into EIGRP with the lab seed metric.</p>
<pre class="out">E1#show ip eigrp topology all-links | section 192.168.50.0
P 192.168.50.0/24, 1 successors, FD is 128256, serno 7
        via Rconnected (128256/0)
<span class="hl">        via 10.1.1.2 (51456/51200), GigabitEthernet0/0</span></pre>
<p>E1 still forwards with its connected route (AD 0), but EIGRP now holds a second path for this network pointing back through BR1, and that fake path even has the better metric. If Loopback1 went down, the fake path could keep the network alive in EIGRP and pull traffic into a loop.</p>

<p><b>Step 4: tag and filter.</b> On both boundary routers, stamp routes on the way out and refuse the stamp on the way back (chapter 11 explains the design in depth).</p>
<pre class="code">route-map EIGRP-TO-OSPF deny 10
 match tag 110
route-map EIGRP-TO-OSPF permit 20
 set tag 90
route-map OSPF-TO-EIGRP deny 10
 match tag 90
route-map OSPF-TO-EIGRP permit 20
 set tag 110
router ospf 1
 redistribute eigrp 100 subnets route-map EIGRP-TO-OSPF
router eigrp 100
 redistribute ospf 1 metric 100000 100 255 1 1500 route-map OSPF-TO-EIGRP</pre>

<p><b>Step 5: verify.</b></p>
<pre class="out">E1#show ip eigrp topology all-links | section 192.168.50.0
P 192.168.50.0/24, 1 successors, FD is 128256, serno 9
<span class="hl">        via Rconnected (128256/0)</span>

O1#show ip route 172.16.10.0
Routing entry for 172.16.10.0/24
  Known via "ospf 1", distance 110, metric 20
  <span class="hl">Tag 90, type extern 2, forward metric 1</span>
  Routing Descriptor Blocks:
    10.2.2.2, from 2.2.2.2, 00:00:32 ago, via GigabitEthernet0/1
      Route metric is 20, traffic share count is 1
      Route tag 90
  * 10.2.1.2, from 1.1.1.1, 00:00:32 ago, via GigabitEthernet0/0
      Route metric is 20, traffic share count is 1
      Route tag 90</pre>
<p>The lab asks you to read that tag: <b>90</b>. Finally, <code>ping 10.200.10.10</code> from PCE succeeds, and PCO reaches 192.168.50.1.</p>

<div class="eg"><p><b>Worked example: why the ping works in both directions.</b> PCE (172.16.10.10) sends to 10.200.10.10. E1 has D EX 10.200.10.0/24 via BR1 and BR2 (seed from step 1). BR1 has O 10.200.10.0/24 via O1. The reply to 172.16.10.10 uses O1's O E2 172.16.10.0/24 via either boundary router, which has D 172.16.10.0/24 via E1. Every hop has a route in both directions: that is the definition of working redistribution.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring the tag route maps on only one boundary router. The other one keeps redistributing untagged routes and will happily re-inject routes that the first router tagged. Mutual redistribution policy must be identical on every boundary router.</p></div>

<div class="exam"><p><b>Exam trap.</b> Mutual redistribution at a <b>single</b> point cannot cause route feedback between the two domains, because there is no second boundary for a route to come back through. Questions about feedback loops always involve two or more redistribution points.</p></div>

<div class="scn"><h4>The branch that only needed a default</h4><p>A retail company ran mutual redistribution between its EIGRP core and every OSPF store router at two hubs. Every store change caused EIGRP churn and one hub sometimes routed store traffic through the other. The redesign made redistribution one-way: each hub redistributed OSPF store networks into EIGRP with tags, and sent only <code>default-information originate</code> into OSPF. The stores lost nothing (all non-store traffic went to the hubs anyway) and the feedback risk disappeared.</p><p><b>Lesson:</b> the safest redistribution is the one you do not need; a default route often replaces the return direction.</p></div>

<div class="iv"><p class="q">"When would you choose one-way redistribution plus a default route instead of mutual redistribution?"</p><p>Strong answer: when one domain is a stub, such as branches or an acquired site whose only exit is the core. Redistribute the stub's prefixes into the core (tagged and filtered), and give the stub a default with <code>default-information originate</code>. It removes feedback and AD problems in the return direction and keeps the stub's tables small. Use mutual redistribution only when both domains need specific routes from each other, and then plan tags, filters and AD on every boundary router.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Risk grows from one-way at one point to mutual at several points.</li>
<li>One-way plus a default route is the simplest safe design for stub domains.</li>
<li>Lab 1: seed metric into EIGRP, <code>subnets</code> into OSPF, then tag route maps on both boundary routers.</li>
<li>EIGRP externals redistributed at two points show both feedback and AD-based suboptimal routing.</li>
<li>Verify with <code>show ip route</code> (tags, next hops), <code>show ip eigrp topology all-links</code> and end-to-end pings.</li>
</ul></div>
`,hi:`
<p>Ek chhota gaon jo highway se ek hi one-way slip road se juda hai, manage karna aasaan hai: gaadiyan highway par ja sakti hain, aur wapas aane ke liye gaon bas ek board follow karta hai jo kehta hai "baaki sab, is taraf". Ek bade shehar ko highway se do two-way junctions se jodo to traffic police, boards aur rules chahiye, warna gaadiyan hamesha chakkar lagati rahengi. Redistribution designs bhi aise hi badhte hain, ek point par <b>one-way</b> se lekar kai points par <b>mutual</b> (two-way) tak.</p>

<h3>Chaar designs, chaar risk levels</h3>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Redistribution design risk">
<rect x="120" y="20" width="250" height="90" rx="10" fill="#bbf7d0"/><text x="245" y="55" text-anchor="middle" class="svg-ink" font-size="14">one-way, ek point</text><text x="245" y="78" text-anchor="middle" class="svg-muted" font-size="12">sabse safe; wapsi ke liye default</text>
<rect x="380" y="20" width="250" height="90" rx="10" fill="#fde68a"/><text x="505" y="55" text-anchor="middle" class="svg-ink" font-size="14">mutual, ek point</text><text x="505" y="78" text-anchor="middle" class="svg-muted" font-size="12">feedback path nahi, single failure point</text>
<rect x="120" y="120" width="250" height="90" rx="10" fill="#fde68a"/><text x="245" y="155" text-anchor="middle" class="svg-ink" font-size="14">one-way, do points</text><text x="245" y="178" text-anchor="middle" class="svg-muted" font-size="12">redundant; AD surprises possible</text>
<rect x="380" y="120" width="250" height="90" rx="10" fill="#fed7aa"/><text x="505" y="155" text-anchor="middle" class="svg-ink" font-size="14">mutual, do points</text><text x="505" y="178" text-anchor="middle" class="svg-muted" font-size="12">feedback, loops, suboptimal paths</text>
<text x="60" y="70" text-anchor="middle" class="svg-muted" font-size="12">1 point</text><text x="60" y="170" text-anchor="middle" class="svg-muted" font-size="12">2+ points</text>
<text x="245" y="232" text-anchor="middle" class="svg-muted" font-size="12">ek direction</text><text x="505" y="232" text-anchor="middle" class="svg-muted" font-size="12">dono directions</text>
</svg><p class="cap">Redistribution points aur directions ki sankhya ke saath risk badhta hai; module ki labs neeche-daayein kone mein hain.</p></div>
<ul>
<li><b>One-way, ek point.</b> Example: BR1 ke peeche ek chhota OSPF branch domain. BR1 OSPF ko EIGRP mein redistribute karta hai, aur EIGRP ko wapas redistribute karne ki jagah <code>default-information originate</code> se OSPF mein default route bhejta hai. Feedback possible hi nahi.</li>
<li><b>Mutual, ek point.</b> Ek router par dono directions. Route doosre boundary se wapas nahi aa sakta, isliye feedback impossible hai, lekin woh akela router single point of failure hai.</li>
<li><b>One-way, do points.</b> Redundant, lekin ek point par redistribute hua route destination protocol mein doosre point ko dikh sakta hai aur AD par jeet sakta hai.</li>
<li><b>Mutual, do ya zyada points.</b> Redundant aur realistic, aur chapter 10 ki har problem ka ghar. Aapko tags, filters aur AD planning chahiye.</li>
</ul>

<h3>Lab 1, step by step</h3>
<p>Starting point: E1, BR1 aur BR2 ke beech EIGRP 100 up hai; O1, BR1 aur BR2 ke beech OSPF area 0 up hai; abhi koi redistribution nahi.</p>
<p><b>Step 1: dono boundary routers par OSPF ko EIGRP mein.</b></p>
<pre class="code"><span class="c">! BR1 aur BR2</span>
router eigrp 100
 redistribute ospf 1 metric 100000 100 255 1 1500
<span class="c">! alternative: default-metric 100000 100 255 1 1500, phir redistribute ospf 1</span></pre>
<pre class="out">E1#show ip route eigrp | include EX
<span class="hl">D EX     10.200.10.0/24 [170/51456] via 10.1.2.2, 00:00:41, GigabitEthernet0/1</span>
<span class="hl">                        [170/51456] via 10.1.1.2, 00:00:41, GigabitEthernet0/0</span>
D EX     10.200.1.0/24 [170/51456] via 10.1.2.2, 00:00:41, GigabitEthernet0/1
                       [170/51456] via 10.1.1.2, 00:00:41, GigabitEthernet0/0</pre>
<p>Do barabar next hops: dono boundary routers same seed se redistribute karte hain, isliye E1 load-share karta hai.</p>

<p><b>Step 2: dono boundary routers par EIGRP ko OSPF mein.</b></p>
<pre class="code">router ospf 1
 redistribute eigrp 100 subnets</pre>
<pre class="out">O1#show ip route ospf | include E2
<span class="hl">O E2     172.16.10.0/24 [110/20] via 10.2.2.2, 00:01:02, GigabitEthernet0/1</span>
<span class="hl">                        [110/20] via 10.2.1.2, 00:01:02, GigabitEthernet0/0</span>
O E2     192.168.50.0/24 [110/20] via 10.2.2.2, 00:01:02, GigabitEthernet0/1</pre>
<p>Fark dekho. 172.16.10.0/24 dono boundary routers par EIGRP <b>internal</b> route (AD 90) hai, isliye dono ise redistribute karte hain. 192.168.50.0/24 EIGRP <b>external</b> (AD 170) hai. Jis boundary router ne ise pehle redistribute kiya (yahan BR2) usne O E2 route banaya; doosre (BR1) ne phir apne D EX route (AD 170) ki jagah woh O E2 copy (AD 110) prefer ki, isliye BR1 ke paas redistribute karne ko kuch nahi. Aapne abhi woh suboptimal-routing problem reproduce ki hai jo lab 2 theek karti hai.</p>

<p><b>Step 3: feedback dikhta hai.</b> BR1 ke paas ab 192.168.50.0/24 OSPF route ki tarah hai, aur woh OSPF ko EIGRP mein redistribute karta hai, isliye woh E1 ka apna network lab seed metric ke saath wapas EIGRP mein daal deta hai.</p>
<pre class="out">E1#show ip eigrp topology all-links | section 192.168.50.0
P 192.168.50.0/24, 1 successors, FD is 128256, serno 7
        via Rconnected (128256/0)
<span class="hl">        via 10.1.1.2 (51456/51200), GigabitEthernet0/0</span></pre>
<p>E1 ab bhi apne connected route (AD 0) se forward karta hai, lekin EIGRP ke paas ab is network ka doosra path hai jo BR1 ke through wapas point karta hai, aur us nakli path ka metric bhi behtar hai. Agar Loopback1 down ho jaaye, to nakli path network ko EIGRP mein zinda rakh sakta hai aur traffic ko loop mein kheench sakta hai.</p>

<p><b>Step 4: tag aur filter.</b> Dono boundary routers par bahar jaate waqt routes par stamp lagao aur wapas aate waqt woh stamp mana karo (chapter 11 design ko gehraai se samjhata hai).</p>
<pre class="code">route-map EIGRP-TO-OSPF deny 10
 match tag 110
route-map EIGRP-TO-OSPF permit 20
 set tag 90
route-map OSPF-TO-EIGRP deny 10
 match tag 90
route-map OSPF-TO-EIGRP permit 20
 set tag 110
router ospf 1
 redistribute eigrp 100 subnets route-map EIGRP-TO-OSPF
router eigrp 100
 redistribute ospf 1 metric 100000 100 255 1 1500 route-map OSPF-TO-EIGRP</pre>

<p><b>Step 5: verify.</b></p>
<pre class="out">E1#show ip eigrp topology all-links | section 192.168.50.0
P 192.168.50.0/24, 1 successors, FD is 128256, serno 9
<span class="hl">        via Rconnected (128256/0)</span>

O1#show ip route 172.16.10.0
Routing entry for 172.16.10.0/24
  Known via "ospf 1", distance 110, metric 20
  <span class="hl">Tag 90, type extern 2, forward metric 1</span>
  Routing Descriptor Blocks:
    10.2.2.2, from 2.2.2.2, 00:00:32 ago, via GigabitEthernet0/1
      Route metric is 20, traffic share count is 1
      Route tag 90
  * 10.2.1.2, from 1.1.1.1, 00:00:32 ago, via GigabitEthernet0/0
      Route metric is 20, traffic share count is 1
      Route tag 90</pre>
<p>Lab aapse woh tag padhne ko kehti hai: <b>90</b>. Aakhir mein PCE se <code>ping 10.200.10.10</code> succeed hota hai, aur PCO 192.168.50.1 tak pahunchta hai.</p>

<div class="eg"><p><b>Worked example: ping dono directions mein kyun chalta hai.</b> PCE (172.16.10.10) 10.200.10.10 ko bhejta hai. E1 ke paas BR1 aur BR2 ke through D EX 10.200.10.0/24 hai (step 1 ka seed). BR1 ke paas O1 ke through O 10.200.10.0/24 hai. 172.16.10.10 ka reply O1 ka O E2 172.16.10.0/24 kisi bhi boundary router ke through use karta hai, jiske paas E1 ke through D 172.16.10.0/24 hai. Har hop ke paas dono directions mein route hai: working redistribution ki yahi definition hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Tag route maps sirf ek boundary router par configure karna. Doosra untagged routes redistribute karta rehta hai aur pehle router ke tag kiye routes ko khushi se dobara inject kar deta hai. Mutual redistribution policy har boundary router par identical honi chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> <b>Ek</b> point par mutual redistribution do domains ke beech route feedback nahi bana sakta, kyunki route ke wapas aane ke liye doosra boundary hai hi nahi. Feedback loops ke questions mein hamesha do ya zyada redistribution points hote hain.</p></div>

<div class="scn"><h4>Woh branch jise sirf default chahiye tha</h4><p>Ek retail company apne EIGRP core aur har OSPF store router ke beech do hubs par mutual redistribution chala rahi thi. Har store change se EIGRP churn hota tha aur ek hub kabhi kabhi store traffic doosre hub se route karta tha. Redesign ne redistribution ko one-way bana diya: har hub ne OSPF store networks ko tags ke saath EIGRP mein redistribute kiya, aur OSPF mein sirf <code>default-information originate</code> bheja. Stores ne kuch nahi khoya (non-store traffic waise bhi hubs par jaata tha) aur feedback risk gayab ho gaya.</p><p><b>Seekh:</b> sabse safe redistribution woh hai jiski aapko zaroorat hi nahi; default route aksar return direction ki jagah le leta hai.</p></div>

<div class="iv"><p class="q">"Mutual redistribution ki jagah aap one-way redistribution plus default route kab chunoge?"</p><p>Strong answer: jab ek domain stub ho, jaise branches ya acquired site jiska ek hi exit core hai. Stub ke prefixes ko core mein redistribute karo (tagged aur filtered), aur stub ko <code>default-information originate</code> se default do. Isse return direction mein feedback aur AD problems khatam hoti hain aur stub ki tables chhoti rehti hain. Mutual redistribution sirf tab use karo jab dono domains ko ek doosre ke specific routes chahiye, aur tab har boundary router par tags, filters aur AD plan karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Risk ek point par one-way se kai points par mutual tak badhta hai.</li>
<li>Stub domains ke liye one-way plus default route sabse simple safe design hai.</li>
<li>Lab 1: EIGRP mein seed metric, OSPF mein <code>subnets</code>, phir dono boundary routers par tag route maps.</li>
<li>Do points par redistribute hue EIGRP externals feedback aur AD-based suboptimal routing dono dikhate hain.</li>
<li><code>show ip route</code> (tags, next hops), <code>show ip eigrp topology all-links</code> aur end-to-end pings se verify karo.</li>
</ul></div>
`}};export{e as default};