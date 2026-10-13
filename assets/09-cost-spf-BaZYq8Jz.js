var e={id:`cost-spf`,h:{en:`Cost, reference bandwidth and a full SPF calculation`,hi:`Cost, reference bandwidth aur poora SPF calculation`},fig:`cost`,body:{en:`
<p>If you drive from Gurugram to Noida, the route with the fewest turns is not always the fastest. A six-lane expressway with more junctions usually beats a narrow road with two turns. RIP counts turns (hops). OSPF measures road speed: every interface has a <b>cost</b> derived from its bandwidth, and the path with the <b>lowest total cost</b> wins, however many hops it has.</p>

<h3>How cost is calculated</h3>
<p><b>Cost = reference bandwidth ÷ interface bandwidth</b>, rounded down to a whole number, never below 1. The default reference bandwidth on Cisco IOS is <b>100 Mbps</b>.</p>
<table class="cmp"><tr><th>Interface</th><th>Bandwidth</th><th>Cost (reference 100 Mbps)</th><th>Cost (reference 10000 Mbps)</th></tr>
<tr><td>Ethernet</td><td>10 Mbps</td><td>10</td><td>1000</td></tr>
<tr><td>FastEthernet</td><td>100 Mbps</td><td>1</td><td>100</td></tr>
<tr><td>GigabitEthernet</td><td>1 Gbps</td><td>1</td><td>10</td></tr>
<tr><td>TenGigabitEthernet</td><td>10 Gbps</td><td>1</td><td>1</td></tr>
<tr><td>Serial T1</td><td>1.544 Mbps</td><td>64</td><td>6476</td></tr>
<tr><td>Loopback</td><td>n/a</td><td>1</td><td>1</td></tr>
</table>
<p>With the default, everything from 100 Mbps upwards costs 1, so OSPF cannot tell a FastEthernet backup link from a 10 Gbps core. That is why real networks raise the reference bandwidth to at least the speed of their fastest link, <b>on every router</b>:</p>
<pre class="code">R1(config)# router ospf 1
R1(config-router)# auto-cost reference-bandwidth 10000
% OSPF: Reference bandwidth is changed.
        Please ensure reference bandwidth is consistent across all routers.</pre>
<p>The value is in Mbps. IOS itself warns you to keep it consistent, because each router computes costs for its own outgoing interfaces; mixing references makes paths look cheaper in one direction than the other.</p>
<p>You can also set a cost directly on one interface, which overrides the calculation: <code>ip ospf cost 100</code> (range 1 to 65535). Changing the interface <code>bandwidth</code> also changes the OSPF cost, but it affects QoS and other protocols too, so <code>ip ospf cost</code> is the cleaner tool.</p>

<h3>How the metric of a route is built</h3>
<p>The metric of an OSPF route is the <b>sum of the outgoing interface costs</b> along the path, from this router to the destination network, <b>including the cost of the interface attached to the destination network</b>. Costs of the interfaces where traffic enters a router are not counted. If two or more paths tie, OSPF installs all of them (equal-cost multipath, up to 4 by default).</p>

<h3>SPF worked by hand</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Five-router topology for an SPF calculation">
<line x1="80" y1="115" x2="320" y2="40" stroke="#64748b" stroke-width="2"/><text x="190" y="62" class="svg-ink" font-size="12">10</text>
<line x1="320" y1="40" x2="560" y2="115" stroke="#64748b" stroke-width="2"/><text x="450" y="62" class="svg-ink" font-size="12">1</text>
<line x1="80" y1="115" x2="240" y2="190" stroke="#64748b" stroke-width="3"/><text x="150" y="170" class="svg-accent" font-size="12">1</text>
<line x1="240" y1="190" x2="400" y2="190" stroke="#64748b" stroke-width="3"/><text x="320" y="183" class="svg-accent" font-size="12">1</text>
<line x1="400" y1="190" x2="560" y2="115" stroke="#64748b" stroke-width="3"/><text x="490" y="170" class="svg-accent" font-size="12">1</text>
<rect x="50" y="98" width="60" height="34" rx="8" fill="#bae6fd"/><text x="80" y="120" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="290" y="23" width="60" height="34" rx="8" fill="#e2e8f0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="210" y="173" width="60" height="34" rx="8" fill="#e2e8f0"/><text x="240" y="195" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="370" y="173" width="60" height="34" rx="8" fill="#e2e8f0"/><text x="400" y="195" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<rect x="530" y="98" width="60" height="34" rx="8" fill="#bbf7d0"/><text x="560" y="120" text-anchor="middle" class="svg-ink" font-size="13">R5</text>
<text x="560" y="152" text-anchor="middle" class="svg-muted" font-size="11">LAN 192.168.50.0/24, cost 1</text>
</svg><p class="cap">Two routes from R1 to R5's LAN: 2 hops via R2, or 3 hops via R3 and R4. Numbers are outgoing costs.</p></div>

<p>Dijkstra's algorithm keeps a list of <b>tentative</b> candidates and repeatedly makes the cheapest one <b>permanent</b>, then adds its neighbours' costs:</p>
<table class="cmp"><tr><th>Step</th><th>Made permanent (cost)</th><th>Tentative list after the step</th></tr>
<tr><td>1</td><td>R1 (0), the root</td><td>R3 = 1, R2 = 10</td></tr>
<tr><td>2</td><td>R3 (1)</td><td>R4 = 1 + 1 = 2, R2 = 10</td></tr>
<tr><td>3</td><td>R4 (2)</td><td>R5 = 2 + 1 = 3, R2 = 10</td></tr>
<tr><td>4</td><td>R5 (3)</td><td>R2 = 10 (R5 via R2 would be 11, worse)</td></tr>
<tr><td>5</td><td>R2 (10)</td><td>empty: tree complete</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> R5's LAN adds its own interface cost of 1, so R1's route to 192.168.50.0/24 has metric 3 + 1 = <b>4</b>, next hop R3. The 2-hop path through R2 would cost 10 + 1 + 1 = 12. RIP would have picked the 2-hop path; OSPF picks the faster 3-hop path. In <code>show ip route</code> R1 prints <code>[110/4] via</code> R3's address.</p></div>

<h3>Lab 3: steering traffic off the backup link</h3>
<p>R1 reaches the server LAN 192.168.4.0/24 either across the core VLAN to R4 or over the direct R1 to R4 backup link. Both are Gigabit, so both paths cost 1 + 1 = 2, and R1 load-shares:</p>
<pre class="out">R1# show ip route ospf | begin 192.168.4
<span class="hl">O        192.168.4.0/24 [110/2] via 10.14.0.2, 00:03:10, GigabitEthernet0/1
                        [110/2] via 10.10.0.4, 00:03:10, GigabitEthernet0/0</span></pre>
<pre class="code"><span class="c">! Both ends of the backup link, so the return path agrees</span>
R1(config)# interface GigabitEthernet0/1
R1(config-if)# ip ospf cost 100
R4(config)# interface GigabitEthernet0/1
R4(config-if)# ip ospf cost 100</pre>
<pre class="out">R1# show ip route ospf | begin 192.168.4
<span class="hl">O        192.168.4.0/24 [110/2] via 10.10.0.4, 00:00:05, GigabitEthernet0/0</span></pre>
<p>The backup path now costs 101 and stays in the LSDB, ready to take over the moment the core fails. The figure at the end of this chapter shows the same idea with a raised reference bandwidth: 10 Gbps path cost 2 against 1 Gbps path cost 20.</p>

<div class="warn"><p><b>Common mistakes.</b> Changing the reference bandwidth on some routers only. Setting a cost on one end of a link and forgetting the other, which makes forward and return traffic take different paths. Counting incoming interface costs, or forgetting the destination network's own interface cost.</p></div>

<div class="exam"><p><b>Exam traps.</b> FastEthernet, Gigabit and 10 Gigabit all cost <b>1</b> with the default reference. Cost is never below 1. The reference is set in Mbps with <code>auto-cost reference-bandwidth</code>. <code>ip ospf cost</code> overrides the formula. Equal-cost paths are all installed (default up to 4).</p></div>

<div class="scn"><h4>The 100 Mbps link that carried half the traffic</h4><p>A hospital had a 10 Gbps primary link and a 100 Mbps backup between two buildings. Staff complained that image transfers from the radiology servers were slow at random. <code>show ip route</code> showed the imaging subnet with two <code>[110/2]</code> paths: both links cost 1 under the default reference, so OSPF split flows across them and every flow on the backup crawled. Setting <code>auto-cost reference-bandwidth 10000</code> on every router made the costs 1 and 100, and all traffic moved to the 10 Gbps link.</p><p><b>Lesson:</b> with modern link speeds, the default reference bandwidth is wrong. Raise it everywhere, as part of your standard build.</p></div>

<div class="iv"><p class="q">"How does OSPF calculate cost, and why would you change the reference bandwidth?"</p><p>Strong answer: cost equals reference bandwidth divided by interface bandwidth, minimum 1, and a route's metric is the sum of outgoing interface costs to the destination. The default reference of 100 Mbps makes every link of 100 Mbps and faster cost 1, so OSPF cannot prefer 10 Gbps over 100 Mbps. I set <code>auto-cost reference-bandwidth</code> to at least the fastest link speed on every router, and use <code>ip ospf cost</code> for specific traffic engineering on both ends of a link.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cost = reference bandwidth ÷ interface bandwidth; default reference 100 Mbps; minimum cost 1.</li>
<li>Raise the reference with <code>auto-cost reference-bandwidth</code> (Mbps) consistently on every router.</li>
<li><code>ip ospf cost</code> sets an interface cost directly; apply it on both ends of a link.</li>
<li>Route metric = sum of outgoing costs, including the destination network's interface.</li>
<li>SPF makes the cheapest tentative node permanent step by step; ties give equal-cost multipath.</li>
</ul></div>
`,hi:`
<p>Agar aap Gurugram se Noida drive karte ho, to sabse kam turns wala route hamesha sabse fast nahi hota. Zyada junctions wala six-lane expressway aam taur par do turns wali patli sadak ko hara deta hai. RIP turns (hops) ginta hai. OSPF sadak ki speed naapta hai: har interface ki bandwidth se nikli ek <b>cost</b> hoti hai, aur <b>sabse kam total cost</b> wala path jeetta hai, chahe usmein kitne bhi hops hon.</p>

<h3>Cost kaise calculate hoti hai</h3>
<p><b>Cost = reference bandwidth ÷ interface bandwidth</b>, neeche ke poore number tak round, kabhi 1 se kam nahi. Cisco IOS par default reference bandwidth <b>100 Mbps</b> hai.</p>
<table class="cmp"><tr><th>Interface</th><th>Bandwidth</th><th>Cost (reference 100 Mbps)</th><th>Cost (reference 10000 Mbps)</th></tr>
<tr><td>Ethernet</td><td>10 Mbps</td><td>10</td><td>1000</td></tr>
<tr><td>FastEthernet</td><td>100 Mbps</td><td>1</td><td>100</td></tr>
<tr><td>GigabitEthernet</td><td>1 Gbps</td><td>1</td><td>10</td></tr>
<tr><td>TenGigabitEthernet</td><td>10 Gbps</td><td>1</td><td>1</td></tr>
<tr><td>Serial T1</td><td>1.544 Mbps</td><td>64</td><td>6476</td></tr>
<tr><td>Loopback</td><td>n/a</td><td>1</td><td>1</td></tr>
</table>
<p>Default mein 100 Mbps aur usse upar sab kuch cost 1 hai, isliye OSPF FastEthernet backup link aur 10 Gbps core mein farak nahi kar pata. Isiliye real networks reference bandwidth ko kam se kam apne sabse fast link ki speed tak badhate hain, <b>har router par</b>:</p>
<pre class="code">R1(config)# router ospf 1
R1(config-router)# auto-cost reference-bandwidth 10000
% OSPF: Reference bandwidth is changed.
        Please ensure reference bandwidth is consistent across all routers.</pre>
<p>Value Mbps mein hoti hai. IOS khud aapko ise consistent rakhne ki warning deta hai, kyunki har router apne outgoing interfaces ki cost khud nikaalta hai; alag references mix karne se paths ek direction mein dusri se saste dikhte hain.</p>
<p>Aap ek interface par seedha cost bhi set kar sakte ho, jo calculation ko override karti hai: <code>ip ospf cost 100</code> (range 1 se 65535). Interface ki <code>bandwidth</code> badalne se bhi OSPF cost badalti hai, lekin woh QoS aur dusre protocols ko bhi affect karti hai, isliye <code>ip ospf cost</code> zyada saaf tool hai.</p>

<h3>Route ka metric kaise banta hai</h3>
<p>OSPF route ka metric path ke <b>outgoing interface costs ka total</b> hota hai, is router se destination network tak, <b>destination network se jude interface ki cost samet</b>. Jin interfaces se traffic router mein ghusta hai unki cost nahi ginti. Agar do ya zyada paths barabar hon, OSPF sabko install karta hai (equal-cost multipath, default mein 4 tak).</p>

<h3>SPF haath se</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="SPF calculation ke liye paanch router topology">
<line x1="80" y1="115" x2="320" y2="40" stroke="#64748b" stroke-width="2"/><text x="190" y="62" class="svg-ink" font-size="12">10</text>
<line x1="320" y1="40" x2="560" y2="115" stroke="#64748b" stroke-width="2"/><text x="450" y="62" class="svg-ink" font-size="12">1</text>
<line x1="80" y1="115" x2="240" y2="190" stroke="#64748b" stroke-width="3"/><text x="150" y="170" class="svg-accent" font-size="12">1</text>
<line x1="240" y1="190" x2="400" y2="190" stroke="#64748b" stroke-width="3"/><text x="320" y="183" class="svg-accent" font-size="12">1</text>
<line x1="400" y1="190" x2="560" y2="115" stroke="#64748b" stroke-width="3"/><text x="490" y="170" class="svg-accent" font-size="12">1</text>
<rect x="50" y="98" width="60" height="34" rx="8" fill="#bae6fd"/><text x="80" y="120" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="290" y="23" width="60" height="34" rx="8" fill="#e2e8f0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="210" y="173" width="60" height="34" rx="8" fill="#e2e8f0"/><text x="240" y="195" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="370" y="173" width="60" height="34" rx="8" fill="#e2e8f0"/><text x="400" y="195" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<rect x="530" y="98" width="60" height="34" rx="8" fill="#bbf7d0"/><text x="560" y="120" text-anchor="middle" class="svg-ink" font-size="13">R5</text>
<text x="560" y="152" text-anchor="middle" class="svg-muted" font-size="11">LAN 192.168.50.0/24, cost 1</text>
</svg><p class="cap">R1 se R5 ke LAN tak do routes: R2 se 2 hops, ya R3 aur R4 se 3 hops. Numbers outgoing costs hain.</p></div>

<p>Dijkstra ka algorithm <b>tentative</b> candidates ki ek list rakhta hai aur baar baar sabse saste wale ko <b>permanent</b> banata hai, phir uske neighbours ki costs jodta hai:</p>
<table class="cmp"><tr><th>Step</th><th>Permanent bana (cost)</th><th>Step ke baad tentative list</th></tr>
<tr><td>1</td><td>R1 (0), root</td><td>R3 = 1, R2 = 10</td></tr>
<tr><td>2</td><td>R3 (1)</td><td>R4 = 1 + 1 = 2, R2 = 10</td></tr>
<tr><td>3</td><td>R4 (2)</td><td>R5 = 2 + 1 = 3, R2 = 10</td></tr>
<tr><td>4</td><td>R5 (3)</td><td>R2 = 10 (R2 se R5 ka 11 hota, bura)</td></tr>
<tr><td>5</td><td>R2 (10)</td><td>khaali: tree complete</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> R5 ka LAN apne interface ki cost 1 jodta hai, isliye R1 ke 192.168.50.0/24 route ka metric 3 + 1 = <b>4</b> hai, next hop R3. R2 se 2-hop path ki cost 10 + 1 + 1 = 12 hoti. RIP 2-hop path chunta; OSPF fast 3-hop path chunta hai. <code>show ip route</code> mein R1 <code>[110/4] via</code> R3 ka address print karta hai.</p></div>

<h3>Lab 3: traffic ko backup link se hatana</h3>
<p>R1 server LAN 192.168.4.0/24 tak ya to core VLAN se R4 tak pahunchta hai ya seedhe R1 se R4 backup link se. Dono Gigabit hain, isliye dono paths ki cost 1 + 1 = 2 hai, aur R1 load-share karta hai:</p>
<pre class="out">R1# show ip route ospf | begin 192.168.4
<span class="hl">O        192.168.4.0/24 [110/2] via 10.14.0.2, 00:03:10, GigabitEthernet0/1
                        [110/2] via 10.10.0.4, 00:03:10, GigabitEthernet0/0</span></pre>
<pre class="code"><span class="c">! Backup link ke dono ends par, taaki return path bhi agree kare</span>
R1(config)# interface GigabitEthernet0/1
R1(config-if)# ip ospf cost 100
R4(config)# interface GigabitEthernet0/1
R4(config-if)# ip ospf cost 100</pre>
<pre class="out">R1# show ip route ospf | begin 192.168.4
<span class="hl">O        192.168.4.0/24 [110/2] via 10.10.0.4, 00:00:05, GigabitEthernet0/0</span></pre>
<p>Backup path ki cost ab 101 hai aur woh LSDB mein bana rehta hai, core fail hote hi sambhalne ke liye ready. Is chapter ke end wala figure yahi idea badhaye hue reference bandwidth ke saath dikhata hai: 10 Gbps path ki cost 2, 1 Gbps path ki cost 20.</p>

<div class="warn"><p><b>Common galtiyan.</b> Reference bandwidth sirf kuch routers par badalna. Link ke ek end par cost set karke dusra bhool jaana, jisse jaane aur aane wala traffic alag paths leta hai. Incoming interface costs ginna, ya destination network ke apne interface ki cost bhool jaana.</p></div>

<div class="exam"><p><b>Exam traps.</b> Default reference ke saath FastEthernet, Gigabit aur 10 Gigabit sabki cost <b>1</b> hai. Cost kabhi 1 se kam nahi hoti. Reference <code>auto-cost reference-bandwidth</code> se Mbps mein set hota hai. <code>ip ospf cost</code> formula ko override karta hai. Barabar cost wale saare paths install hote hain (default 4 tak).</p></div>

<div class="scn"><h4>100 Mbps link jo aadha traffic le ja raha tha</h4><p>Ek hospital mein do buildings ke beech 10 Gbps primary link aur 100 Mbps backup tha. Staff ne shikayat ki ki radiology servers se image transfers kabhi bhi slow ho jaate hain. <code>show ip route</code> mein imaging subnet ke do <code>[110/2]</code> paths dikhe: default reference mein dono links ki cost 1 thi, isliye OSPF flows ko dono par baant raha tha aur backup par jaane wala har flow reng raha tha. Har router par <code>auto-cost reference-bandwidth 10000</code> set karne se costs 1 aur 100 ho gayi, aur saara traffic 10 Gbps link par chala gaya.</p><p><b>Seekh:</b> modern link speeds ke saath default reference bandwidth galat hai. Ise har jagah badhao, apne standard build ke hisse ke roop mein.</p></div>

<div class="iv"><p class="q">"OSPF cost kaise calculate karta hai, aur aap reference bandwidth kyun badloge?"</p><p>Strong answer: cost = reference bandwidth ÷ interface bandwidth, minimum 1, aur route ka metric destination tak outgoing interface costs ka total hota hai. 100 Mbps ka default reference 100 Mbps aur usse fast har link ki cost 1 kar deta hai, isliye OSPF 10 Gbps ko 100 Mbps se prefer nahi kar pata. Main har router par <code>auto-cost reference-bandwidth</code> ko kam se kam sabse fast link speed par set karta hoon, aur specific traffic engineering ke liye link ke dono ends par <code>ip ospf cost</code> use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cost = reference bandwidth ÷ interface bandwidth; default reference 100 Mbps; minimum cost 1.</li>
<li>Reference ko <code>auto-cost reference-bandwidth</code> (Mbps) se har router par consistently badhao.</li>
<li><code>ip ospf cost</code> interface cost seedha set karta hai; ise link ke dono ends par lagao.</li>
<li>Route metric = outgoing costs ka total, destination network ke interface samet.</li>
<li>SPF step by step sabse saste tentative node ko permanent banata hai; ties se equal-cost multipath milta hai.</li>
</ul></div>
`}};export{e as default};