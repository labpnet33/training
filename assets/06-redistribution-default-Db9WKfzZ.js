var e={id:`redistribution-default`,h:{en:`Redistribution and default route origination at the edge`,hi:`Edge par redistribution aur default route origination`},body:{en:`
<p>IS-IS carries the provider's infrastructure routes: loopbacks and links. Sometimes it must also carry a few outside routes, for example a customer's static prefix or a default route toward the internet. <b>Redistribution</b> injects routes learned another way (static, connected, another protocol) into IS-IS. It is powerful and dangerous, so you control it with a route-map and a prefix-list and you redistribute as little as possible.</p>

<h3>Analogy: the airport border desk</h3>
<p>The IS-IS domain is a country. Redistribution is the border desk letting goods in. If the desk waves everything through, contraband (a bad prefix, a private range) enters. A good desk checks a list: only items named on the list pass, and each gets a stamp (metric). That list is the prefix-list; the stamp is the route-map set.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="The second lab topology">
<rect x="10" y="80" width="100" height="60" rx="10" fill="#e2e8f0"/><text x="60" y="108" text-anchor="middle" class="svg-ink" font-size="13">ISP</text><text x="60" y="126" text-anchor="middle" class="svg-muted" font-size="10">203.0.113.2</text>
<rect x="170" y="80" width="110" height="60" rx="10" fill="#bae6fd"/><text x="225" y="108" text-anchor="middle" class="svg-ink" font-size="13">PE1</text><text x="225" y="126" text-anchor="middle" class="svg-muted" font-size="10">lo 10.3.255.1</text>
<rect x="340" y="80" width="110" height="60" rx="10" fill="#bae6fd"/><text x="395" y="108" text-anchor="middle" class="svg-ink" font-size="13">P1</text><text x="395" y="126" text-anchor="middle" class="svg-muted" font-size="10">lo 10.3.255.2</text>
<rect x="510" y="80" width="110" height="60" rx="10" fill="#fed7aa"/><text x="565" y="108" text-anchor="middle" class="svg-ink" font-size="13">JP1 (Junos)</text><text x="565" y="126" text-anchor="middle" class="svg-muted" font-size="10">lo 10.3.255.3</text>
<g stroke="#64748b" stroke-width="2"><line x1="110" y1="110" x2="170" y2="110"/><line x1="280" y1="110" x2="340" y2="110"/><line x1="450" y1="110" x2="510" y2="110"/></g>
<text x="225" y="170" text-anchor="middle" class="svg-accent" font-size="11">statics: 0/0, 172.20.0.0/16, 192.168.99.0/24</text>
<text x="400" y="200" text-anchor="middle" class="svg-muted" font-size="11">IS-IS level 2 core, PE1 is the internet edge</text>
</svg><p class="cap">PE1 has three static routes; only the ones we choose may enter IS-IS.</p></div>

<h3>The lab before the change</h3>
<p>Before the solution, P1 and JP1 know only infrastructure routes:</p>
<pre class="out">P1# show ip route isis
Gateway of last resort is not set

      10.0.0.0/32 is subnetted, 2 subnets
i L2     10.3.255.1 [115/10] via 10.3.12.1, 00:00:30, GigabitEthernet0/1
i L2     10.3.255.3 [115/10] via 10.3.23.3, 00:00:30, GigabitEthernet0/0</pre>
<p>(Output shortened: the codes legend is omitted.)</p>

<h3>The reference configuration for the task</h3>
<p>The lab requires redistributing only 172.20.0.0/16 into level 2 with metric 50, and originating a default. The matching configuration is shown here as reference configuration and then proved from the router's own state:</p>
<pre class="code">ip prefix-list CUST seq 5 permit 172.20.0.0/16
route-map CUST permit 10
 match ip address prefix-list CUST
 set metric 50
router isis
 redistribute static level-2 route-map CUST
 <span class="hl">default-information originate</span></pre>
<pre class="out">PE1# show running-config | section router isis
router isis
 net 49.0010.0000.0000.0101.00
 is-type level-2-only
 metric-style wide
 default-information originate
 redistribute static level-2 route-map CUST

PE1# show ip prefix-list
ip prefix-list CUST: 1 entries
   seq 5 permit 172.20.0.0/16

PE1# show route-map
route-map CUST, permit, sequence 10
  Match clauses:
    ip address prefix-lists: CUST
  Set clauses:
    metric 50</pre>
<p>(Output shortened: one counters line is omitted.) Only one static (172.20.0.0/16) is permitted. 192.168.99.0/24 is not in the list, so it stays out of IS-IS, which is exactly what we want for a private range.</p>

<h3>The result downstream</h3>
<pre class="out">P1# show ip route isis
Gateway of last resort is 10.3.12.1 to network 0.0.0.0

i*L2     0.0.0.0/0 [115/10] via 10.3.12.1, 00:00:35, GigabitEthernet0/1
      10.0.0.0/32 is subnetted, 2 subnets
i L2     10.3.255.1 [115/10] via 10.3.12.1, 00:01:05, GigabitEthernet0/1
i L2     10.3.255.3 [115/10] via 10.3.23.3, 00:01:05, GigabitEthernet0/0
i L2     172.20.0.0/16 [115/60] via 10.3.12.1, 00:00:35, GigabitEthernet0/1</pre>
<p>The redistributed route has metric 60 on P1: the seed 50 set by the route-map plus the 10 of the PE1-P1 link. The default route shows 10, which is just the link cost: the default is not subject to the CUST route-map. On Junos:</p>
<pre class="out">JP1&gt; show route 172.20.0.0/16 exact
172.20.0.0/16      *[IS-IS/165] 00:00:35, metric 70
                    &gt;  to 10.3.23.2 via ge-0/0/0.0

JP1&gt; show route 192.168.99.0/24
0.0.0.0/0          *[IS-IS/165] 00:00:35, metric 20
                    &gt;  to 10.3.23.2 via ge-0/0/0.0</pre>
<p>Junos installs the external routes with preference <b>165</b> (internal level-2 routes are 18 in the same table). The query for 192.168.99.0/24 returns only the default, proving the private prefix did not leak.</p>

<div class="eg"><p><b>Worked example.</b> Metric on the downstream router = seed metric plus the path cost to the originator. For 172.20.0.0/16: seed 50 plus 10 (P1 to PE1) is 60 on P1, and plus another 10 (JP1 to P1) is 70 on JP1. Both numbers match the captured output.</p></div>
<div class="warn"><p><b>Common mistake.</b> Redistributing without a route-map. Every static or connected route, including private ranges and management prefixes, would enter the core. Also remember a default must exist on the originator for <code>default-information originate</code> to advertise it, unless you use the always keyword (reference option, not captured here).</p></div>
<div class="exam"><p><b>Exam trap.</b> Redistributed routes are external; on IOS XE they stay IS-IS (AD 115), and on Junos they get preference 165 instead of 18 for internal. In wide metrics, external routes can carry a metric up to the wide maximum. Two redistribution points can create loops, so use tags and filters when a second protocol redistributes back.</p></div>

<div class="scn"><h4>The private range in the core</h4><p>A new PE was configured with <code>redistribute static</code> and no route-map. A management static (192.168.99.0/24) entered the IS-IS database and appeared in every router's table. A security scan found it reachable from customer-facing routers. The team added a prefix-list permitting only the intended customer prefix and the leak ended.</p><p><b>Lesson:</b> always redistribute through an explicit permit list.</p></div>

<div class="iv"><p class="q">"How do you safely put a customer static route and a default route into IS-IS?"</p><p>I redistribute static into level 2 through a route-map that matches a prefix-list of exactly the customer prefix and sets a metric. For the default, I use default-information originate on the internet-edge PE only. I then check the neighbour routing tables to confirm only the permitted prefix and the default appeared.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Redistribute with a prefix-list and route-map; never unfiltered.</li>
<li>default-information originate advertises a default from the edge.</li>
<li>Downstream metric is the seed metric plus path cost: 50 becomes 60 then 70.</li>
<li>Junos external IS-IS routes have preference 165 versus 18 internal.</li>
<li>Prefixes not in the list, such as 192.168.99.0/24, stay out of IS-IS.</li>
</ul></div>
`,hi:`
<p>IS-IS provider ke infrastructure routes carry karta hai: loopbacks aur links. Kabhi-kabhi use kuch bahari routes bhi carry karne padte hain, jaise customer ka static prefix ya internet ki taraf default route. <b>Redistribution</b> doosre tareeke se seekhe gaye routes (static, connected, doosra protocol) ko IS-IS mein daalta hai. Yeh powerful aur khatarnaak hai, isliye ise route-map aur prefix-list se control karte hain aur kam se kam redistribute karte hain.</p>

<h3>Analogy: airport ka border desk</h3>
<p>IS-IS domain ek desh hai. Redistribution border desk hai jo saaman andar aane deta hai. Agar desk sab kuch jaane de to contraband (kharab prefix, private range) andar aa jaata hai. Achha desk list check karta hai: sirf list mein likhi cheezein guzarti hain aur har ek par stamp (metric) lagta hai. Woh list prefix-list hai; stamp route-map ka set hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Doosre lab ki topology">
<rect x="10" y="80" width="100" height="60" rx="10" fill="#e2e8f0"/><text x="60" y="108" text-anchor="middle" class="svg-ink" font-size="13">ISP</text><text x="60" y="126" text-anchor="middle" class="svg-muted" font-size="10">203.0.113.2</text>
<rect x="170" y="80" width="110" height="60" rx="10" fill="#bae6fd"/><text x="225" y="108" text-anchor="middle" class="svg-ink" font-size="13">PE1</text><text x="225" y="126" text-anchor="middle" class="svg-muted" font-size="10">lo 10.3.255.1</text>
<rect x="340" y="80" width="110" height="60" rx="10" fill="#bae6fd"/><text x="395" y="108" text-anchor="middle" class="svg-ink" font-size="13">P1</text><text x="395" y="126" text-anchor="middle" class="svg-muted" font-size="10">lo 10.3.255.2</text>
<rect x="510" y="80" width="110" height="60" rx="10" fill="#fed7aa"/><text x="565" y="108" text-anchor="middle" class="svg-ink" font-size="13">JP1 (Junos)</text><text x="565" y="126" text-anchor="middle" class="svg-muted" font-size="10">lo 10.3.255.3</text>
<g stroke="#64748b" stroke-width="2"><line x1="110" y1="110" x2="170" y2="110"/><line x1="280" y1="110" x2="340" y2="110"/><line x1="450" y1="110" x2="510" y2="110"/></g>
<text x="225" y="170" text-anchor="middle" class="svg-accent" font-size="11">statics: 0/0, 172.20.0.0/16, 192.168.99.0/24</text>
<text x="400" y="200" text-anchor="middle" class="svg-muted" font-size="11">IS-IS level 2 core, PE1 internet edge hai</text>
</svg><p class="cap">PE1 ke paas teen static routes hain; sirf jo hum chunein woh IS-IS mein aa sakte hain.</p></div>

<h3>Badlaav se pehle lab</h3>
<p>Solution se pehle P1 aur JP1 sirf infrastructure routes jaante hain:</p>
<pre class="out">P1# show ip route isis
Gateway of last resort is not set

      10.0.0.0/32 is subnetted, 2 subnets
i L2     10.3.255.1 [115/10] via 10.3.12.1, 00:00:30, GigabitEthernet0/1
i L2     10.3.255.3 [115/10] via 10.3.23.3, 00:00:30, GigabitEthernet0/0</pre>
<p>(Output chhota kiya gaya: codes legend hata di gayi.)</p>

<h3>Task ki reference configuration</h3>
<p>Lab kehta hai sirf 172.20.0.0/16 ko metric 50 ke saath level 2 mein redistribute karo, aur default originate karo. Matching configuration yahan reference configuration ke taur par dikhayi gayi hai aur phir router ki apni state se prove ki gayi:</p>
<pre class="code">ip prefix-list CUST seq 5 permit 172.20.0.0/16
route-map CUST permit 10
 match ip address prefix-list CUST
 set metric 50
router isis
 redistribute static level-2 route-map CUST
 <span class="hl">default-information originate</span></pre>
<pre class="out">PE1# show running-config | section router isis
router isis
 net 49.0010.0000.0000.0101.00
 is-type level-2-only
 metric-style wide
 default-information originate
 redistribute static level-2 route-map CUST

PE1# show ip prefix-list
ip prefix-list CUST: 1 entries
   seq 5 permit 172.20.0.0/16

PE1# show route-map
route-map CUST, permit, sequence 10
  Match clauses:
    ip address prefix-lists: CUST
  Set clauses:
    metric 50</pre>
<p>(Output chhota kiya gaya: ek counters line hata di gayi.) Sirf ek static (172.20.0.0/16) permit hai. 192.168.99.0/24 list mein nahi hai, isliye woh IS-IS se bahar rehta hai, jo private range ke liye bilkul wahi chahiye.</p>

<h3>Downstream natija</h3>
<pre class="out">P1# show ip route isis
Gateway of last resort is 10.3.12.1 to network 0.0.0.0

i*L2     0.0.0.0/0 [115/10] via 10.3.12.1, 00:00:35, GigabitEthernet0/1
      10.0.0.0/32 is subnetted, 2 subnets
i L2     10.3.255.1 [115/10] via 10.3.12.1, 00:01:05, GigabitEthernet0/1
i L2     10.3.255.3 [115/10] via 10.3.23.3, 00:01:05, GigabitEthernet0/0
i L2     172.20.0.0/16 [115/60] via 10.3.12.1, 00:00:35, GigabitEthernet0/1</pre>
<p>Redistributed route ka P1 par metric 60 hai: route-map ka seed 50 plus PE1-P1 link ka 10. Default route 10 dikhata hai, jo sirf link cost hai: default CUST route-map ke tahat nahi aata. Junos par:</p>
<pre class="out">JP1&gt; show route 172.20.0.0/16 exact
172.20.0.0/16      *[IS-IS/165] 00:00:35, metric 70
                    &gt;  to 10.3.23.2 via ge-0/0/0.0

JP1&gt; show route 192.168.99.0/24
0.0.0.0/0          *[IS-IS/165] 00:00:35, metric 20
                    &gt;  to 10.3.23.2 via ge-0/0/0.0</pre>
<p>Junos external routes <b>165</b> preference ke saath install karta hai (usi table mein internal level-2 routes 18 hain). 192.168.99.0/24 ki query sirf default lautati hai, jo prove karta hai ki private prefix leak nahi hua.</p>

<div class="eg"><p><b>Worked example.</b> Downstream router par metric = seed metric plus originator tak path cost. 172.20.0.0/16 ke liye: seed 50 plus 10 (P1 se PE1) P1 par 60 hai, aur ek aur 10 (JP1 se P1) ke saath JP1 par 70. Dono numbers captured output se milte hain.</p></div>
<div class="warn"><p><b>Common mistake.</b> Bina route-map ke redistribute karna. Har static ya connected route, private ranges aur management prefixes sameet, core mein aa jaata. Yeh bhi yaad rakho ki <code>default-information originate</code> ke liye originator par default maujood ho, jab tak always keyword use na karo (reference option, yahan captured nahi).</p></div>
<div class="exam"><p><b>Exam trap.</b> Redistributed routes external hote hain; IOS XE par woh IS-IS (AD 115) hi rehte hain, aur Junos par internal ke 18 ke bajaye preference 165 milta hai. Do redistribution points loops bana sakte hain, isliye jab doosra protocol wapas redistribute kare to tags aur filters use karo.</p></div>

<div class="scn"><h4>Core mein private range</h4><p>Naye PE par bina route-map ke <code>redistribute static</code> configure ho gaya. Ek management static (192.168.99.0/24) IS-IS database mein aa gaya aur har router ki table mein dikha. Security scan mein woh customer-facing routers se reachable mila. Team ne sirf iccha ke customer prefix ko permit karne wali prefix-list lagayi aur leak band hua.</p><p><b>Lesson:</b> hamesha explicit permit list se redistribute karo.</p></div>

<div class="iv"><p class="q">"Customer static route aur default route ko IS-IS mein safely kaise daaloge?"</p><p>Static ko level 2 mein route-map se redistribute karta hoon jo bilkul customer prefix ki prefix-list match karta hai aur metric set karta hai. Default ke liye sirf internet-edge PE par default-information originate use karta hoon. Phir neighbour routing tables se confirm karta hoon ki sirf permitted prefix aur default aaye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Prefix-list aur route-map ke saath redistribute karo; kabhi unfiltered nahi.</li>
<li>default-information originate edge se default advertise karta hai.</li>
<li>Downstream metric seed metric plus path cost hai: 50 se 60 phir 70.</li>
<li>Junos external IS-IS routes ki preference 165 versus internal 18.</li>
<li>List mein na hone wale prefixes, jaise 192.168.99.0/24, IS-IS se bahar rehte hain.</li>
</ul></div>
`}};export{e as default};