var e={id:`routing-ipv6`,h:{en:`Routing IPv6: tables, static and default routes`,hi:`IPv6 routing: tables, static aur default routes`},body:{en:`
<p>A dual-stack router is like a post office that handles two kinds of mail with two separate sorting frames. Letters with IPv4 addresses are sorted using the IPv4 frame; letters with IPv6 addresses use the IPv6 frame. A slot in one frame does nothing for the other. That is the most important routing fact in this chapter: <b>IPv6 has its own routing table</b>, and every IPv4 route you already have is invisible to IPv6 packets.</p>

<h3>The same logic as IPv4</h3>
<p>Everything you know about IPv4 routing still applies. The router looks up the destination, picks the <b>longest matching prefix</b>, compares <b>administrative distance</b> when several sources offer the same prefix, and forwards to the next hop. The hop limit drops by one at each router, and if it reaches zero the router sends back an ICMPv6 Time Exceeded, which is how traceroute works. Two things are different: routers never fragment IPv6 packets (they send <b>ICMPv6 Packet Too Big</b> so the source can shrink them), and link-local addresses often appear as next hops.</p>

<h3>Reading the IPv6 routing table</h3>
<pre class="out">R1# show ipv6 route
IPv6 Routing Table - default - 6 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
       B - BGP, R - RIP, O - OSPF Intra, OI - OSPF Inter, OE1 - OSPF ext 1
       ...
       ND - ND Default, NDp - ND Prefix, DCE - Destination, NDr - Redirect
<span class="hl">S  ::/0 [1/0]
     via 2001:DB8:ACAD:12::2</span>
C  2001:DB8:ACAD:10::/64 [0/0]
     via GigabitEthernet0/0, directly connected
L  2001:DB8:ACAD:10::1/128 [0/0]
     via GigabitEthernet0/0, receive
C  2001:DB8:ACAD:12::/64 [0/0]
     via GigabitEthernet0/1, directly connected
L  2001:DB8:ACAD:12::1/128 [0/0]
     via GigabitEthernet0/1, receive
L  FF00::/8 [0/0]
     via Null0, receive</pre>
<ul>
<li><b>C</b>: the connected /64 of each interface.</li>
<li><b>L</b>: a /128 host route for the router's own address on that interface, so packets for the router itself are received locally.</li>
<li><b>S</b>: static routes; <code>[1/0]</code> is administrative distance 1, metric 0.</li>
<li><b>ND</b>: a default route learned from a Router Advertisement, seen when a router is itself a SLAAC client.</li>
<li><code>FF00::/8</code> to Null0: multicast is handled locally, never routed like unicast.</li>
</ul>

<h3>Static and default routes</h3>
<pre class="code"><span class="c">! Default route: everything unknown goes to R2</span>
ipv6 route ::/0 2001:db8:acad:12::2
<span class="c">! Specific route with a global next hop</span>
ipv6 route 2001:db8:acad:10::/64 2001:db8:acad:12::1
<span class="c">! Link-local next hop: the exit interface is REQUIRED</span>
ipv6 route 2001:db8:acad:10::/64 g0/0 fe80::1
<span class="c">! Floating static backup with administrative distance 10</span>
ipv6 route ::/0 2001:db8:acad:13::3 10</pre>
<p>The IPv6 default route is <code>::/0</code>, the equivalent of <code>0.0.0.0/0</code>. A link-local next hop needs the interface because <code>fe80::1</code> can exist on every link of the router. If you forget it, the router refuses the command:</p>
<pre class="out">R1(config)# ipv6 route 2001:db8:acad:20::/64 fe80::1
<span class="hl">% Interface has to be specified for a link-local nexthop</span></pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Routes needed in both directions">
<rect x="20" y="70" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="75" y="95" text-anchor="middle" class="svg-ink" font-size="13">Office /64</text>
<rect x="190" y="70" width="90" height="40" rx="8" fill="#bae6fd"/><text x="235" y="95" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="360" y="70" width="90" height="40" rx="8" fill="#bae6fd"/><text x="405" y="95" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="510" y="70" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="565" y="95" text-anchor="middle" class="svg-ink" font-size="13">Server /64</text>
<line x1="130" y1="90" x2="190" y2="90" stroke="#64748b"/><line x1="280" y1="90" x2="360" y2="90" stroke="#64748b"/><line x1="450" y1="90" x2="510" y2="90" stroke="#64748b"/>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="13">R1: ::/0 via 2001:db8:acad:12::2</text>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="13">R2: 2001:db8:acad:10::/64 via 2001:db8:acad:12::1</text>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">A ping needs a route there AND a route back</text>
</svg><p class="cap">The lab's two IPv6 routes. Without R2's route back, the request arrives but the reply is dropped.</p></div>

<div class="eg"><p><b>Worked example: follow one packet.</b> PC1 (<code>2001:db8:acad:10:250:7fff:fe06:6d01</code>) pings SRV (<code>2001:db8:acad:20::10</code>). PC1 sees the destination is off-link and sends the frame to its gateway, R1's link-local. R1 has no specific route for <code>2001:db8:acad:20::/64</code>, so the longest match is <code>::/0</code>, next hop <code>2001:db8:acad:12::2</code>, reached through G0/1. R2 has <code>2001:db8:acad:20::/64</code> as connected and delivers the packet. For the reply, R2 looks up <code>2001:db8:acad:10::/64</code> and finds the static route back via <code>2001:db8:acad:12::1</code>. A traceroute shows exactly these hops:</p></div>
<pre class="out">PC1&gt; trace 2001:db8:acad:20::10
trace to 2001:DB8:ACAD:20::10, 8 hops max, press Ctrl+C to stop
 1   <span class="hl">2001:DB8:ACAD:10::1</span> 0.500 ms  0.450 ms  0.480 ms
 2   <span class="hl">2001:DB8:ACAD:12::2</span> 0.700 ms  0.650 ms  0.680 ms
 3   *2001:DB8:ACAD:20::10   1.000 ms (ICMP type:3, code:3, Destination port unreachable)</pre>

<h3>Dynamic routing for IPv6 (preview)</h3>
<p>Static routes are fine for a small office. Larger networks run a routing protocol, and each has an IPv6 version: <b>OSPFv3</b> (multicast ff02::5 and ff02::6), <b>EIGRP for IPv6</b>, <b>RIPng</b> (UDP 521, group ff02::9) and <b>MP-BGP</b>, which carries IPv6 prefixes between providers. These protocols form neighbourships using link-local addresses, so you will see <code>fe80::</code> next hops in their routes. The routing module covers them properly; for this module remember that IPv6 needs its own protocol instance or address family.</p>

<h3>Verification toolkit</h3>
<table class="cmp"><tr><th>Question</th><th>Router</th><th>Windows / Linux host</th></tr>
<tr><td>Which addresses and interfaces?</td><td>show ipv6 interface brief</td><td>ipconfig / ip -6 addr</td></tr>
<tr><td>Which routes?</td><td>show ipv6 route</td><td>route print -6 / ip -6 route</td></tr>
<tr><td>Which neighbours?</td><td>show ipv6 neighbors</td><td>netsh interface ipv6 show neighbors / ip -6 neigh</td></tr>
<tr><td>Can I reach it?</td><td>ping ipv6 X</td><td>ping -6 X / ping6 X</td></tr>
<tr><td>Which path?</td><td>traceroute ipv6 X</td><td>tracert -6 X / traceroute -6 X</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Configuring the route in one direction only. Adding an IPv4 route and expecting it to work for IPv6. Using a link-local next hop without the exit interface. Filtering ICMPv6 Packet Too Big at a firewall, which breaks large transfers while small pings still succeed.</p></div>

<div class="exam"><p><b>Exam traps.</b> The IPv6 default route is <b>::/0</b>. IPv6 routers do not fragment; the source does, after an ICMPv6 Packet Too Big. RIPng uses UDP <b>521</b>. OSPFv3 is the OSPF version for IPv6. "L" routes are /128 entries for the router's own addresses.</p></div>

<div class="scn"><h4>Pings work, file copies hang</h4><p>After IPv6 was enabled across a WAN, small pings between sites worked but large file copies over IPv6 froze after a few seconds. The WAN path included a tunnel with a smaller MTU. The router was sending ICMPv6 Packet Too Big messages, but a firewall rule written as "deny all ICMPv6 except echo" dropped them, so the servers never learned to send smaller packets. The engineer allowed ICMPv6 Packet Too Big (type 2) through the firewall and the transfers completed.</p><p><b>Lesson:</b> in IPv6, path MTU discovery depends on ICMPv6. Blocking it creates "black holes" that only hit large packets.</p></div>

<div class="iv"><p class="q">"What is different about routing IPv6 compared with IPv4?"</p><p>Strong answer: the logic is identical (longest prefix match, administrative distance, next hop), but IPv6 has a separate routing table and needs separate routes or protocol instances. The default route is ::/0, next hops are often link-local and then need an exit interface, routers never fragment and rely on ICMPv6 Packet Too Big, and ND replaces ARP for resolving next-hop MACs. Name the IPv6 protocols: OSPFv3, EIGRP for IPv6, RIPng, MP-BGP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv6 has its own routing table; IPv4 routes do nothing for IPv6 traffic.</li>
<li>Default route is ::/0; C, L (/128 own address) and S are the common codes.</li>
<li>Link-local next hops need the exit interface in a static route.</li>
<li>Always check the return route: a ping needs routes in both directions.</li>
<li>Routers never fragment IPv6; ICMPv6 Packet Too Big must be allowed.</li>
</ul></div>
`,hi:`
<p>Dual-stack router ek aise post office jaisa hai jo do tarah ki daak do alag sorting frames se sambhalta hai. IPv4 address wali chitthiyan IPv4 frame se sort hoti hain; IPv6 address wali IPv6 frame se. Ek frame ka slot doosre ke liye kuch nahi karta. Is chapter ka sabse zaroori routing fact yahi hai: <b>IPv6 ki apni routing table hoti hai</b>, aur aapke paas pehle se jo bhi IPv4 routes hain woh IPv6 packets ko dikhte hi nahi.</p>

<h3>Logic IPv4 jaisa hi</h3>
<p>IPv4 routing ke baare mein aap jo jaante ho sab ab bhi lagta hai. Router destination dekhta hai, <b>longest matching prefix</b> chunta hai, jab kai sources same prefix dein to <b>administrative distance</b> compare karta hai, aur next hop ko forward karta hai. Har router par hop limit ek kam hota hai, aur zero pahunchne par router ICMPv6 Time Exceeded wapas bhejta hai, isi se traceroute kaam karta hai. Do cheezein alag hain: routers IPv6 packets ko kabhi fragment nahi karte (woh <b>ICMPv6 Packet Too Big</b> bhejte hain taaki source unhe chhota kare), aur next hops mein aksar link-local addresses dikhte hain.</p>

<h3>IPv6 routing table padhna</h3>
<pre class="out">R1# show ipv6 route
IPv6 Routing Table - default - 6 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
       B - BGP, R - RIP, O - OSPF Intra, OI - OSPF Inter, OE1 - OSPF ext 1
       ...
       ND - ND Default, NDp - ND Prefix, DCE - Destination, NDr - Redirect
<span class="hl">S  ::/0 [1/0]
     via 2001:DB8:ACAD:12::2</span>
C  2001:DB8:ACAD:10::/64 [0/0]
     via GigabitEthernet0/0, directly connected
L  2001:DB8:ACAD:10::1/128 [0/0]
     via GigabitEthernet0/0, receive
C  2001:DB8:ACAD:12::/64 [0/0]
     via GigabitEthernet0/1, directly connected
L  2001:DB8:ACAD:12::1/128 [0/0]
     via GigabitEthernet0/1, receive
L  FF00::/8 [0/0]
     via Null0, receive</pre>
<ul>
<li><b>C</b>: har interface ka connected /64.</li>
<li><b>L</b>: us interface par router ke apne address ka /128 host route, taaki router ke liye aaye packets locally receive hon.</li>
<li><b>S</b>: static routes; <code>[1/0]</code> matlab administrative distance 1, metric 0.</li>
<li><b>ND</b>: Router Advertisement se seekha default route, tab dikhta hai jab router khud SLAAC client ho.</li>
<li><code>FF00::/8</code> Null0 ko: multicast locally handle hota hai, unicast ki tarah route nahi hota.</li>
</ul>

<h3>Static aur default routes</h3>
<pre class="code"><span class="c">! Default route: har anjaani cheez R2 ko jaati hai</span>
ipv6 route ::/0 2001:db8:acad:12::2
<span class="c">! Global next hop ke saath specific route</span>
ipv6 route 2001:db8:acad:10::/64 2001:db8:acad:12::1
<span class="c">! Link-local next hop: exit interface ZAROORI hai</span>
ipv6 route 2001:db8:acad:10::/64 g0/0 fe80::1
<span class="c">! Administrative distance 10 ke saath floating static backup</span>
ipv6 route ::/0 2001:db8:acad:13::3 10</pre>
<p>IPv6 default route <code>::/0</code> hai, <code>0.0.0.0/0</code> ke barabar. Link-local next hop ko interface chahiye kyunki <code>fe80::1</code> router ke har link par ho sakta hai. Bhool gaye to router command reject kar deta hai:</p>
<pre class="out">R1(config)# ipv6 route 2001:db8:acad:20::/64 fe80::1
<span class="hl">% Interface has to be specified for a link-local nexthop</span></pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Dono direction mein routes chahiye">
<rect x="20" y="70" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="75" y="95" text-anchor="middle" class="svg-ink" font-size="13">Office /64</text>
<rect x="190" y="70" width="90" height="40" rx="8" fill="#bae6fd"/><text x="235" y="95" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="360" y="70" width="90" height="40" rx="8" fill="#bae6fd"/><text x="405" y="95" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="510" y="70" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="565" y="95" text-anchor="middle" class="svg-ink" font-size="13">Server /64</text>
<line x1="130" y1="90" x2="190" y2="90" stroke="#64748b"/><line x1="280" y1="90" x2="360" y2="90" stroke="#64748b"/><line x1="450" y1="90" x2="510" y2="90" stroke="#64748b"/>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="13">R1: ::/0 via 2001:db8:acad:12::2</text>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="13">R2: 2001:db8:acad:10::/64 via 2001:db8:acad:12::1</text>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">Ping ko jaane ka route AUR wapas aane ka route chahiye</text>
</svg><p class="cap">Lab ke do IPv6 routes. R2 ke wapas wale route ke bina request pahunchti hai lekin reply drop ho jata hai.</p></div>

<div class="eg"><p><b>Worked example: ek packet ko follow karo.</b> PC1 (<code>2001:db8:acad:10:250:7fff:fe06:6d01</code>) SRV (<code>2001:db8:acad:20::10</code>) ko ping karta hai. PC1 dekhta hai ki destination off-link hai aur frame apne gateway, R1 ke link-local, ko bhejta hai. R1 ke paas <code>2001:db8:acad:20::/64</code> ka specific route nahi hai, isliye longest match <code>::/0</code> hai, next hop <code>2001:db8:acad:12::2</code>, G0/1 ke through. R2 ke paas <code>2001:db8:acad:20::/64</code> connected hai aur woh packet deliver karta hai. Reply ke liye R2 <code>2001:db8:acad:10::/64</code> dhoondhta hai aur <code>2001:db8:acad:12::1</code> via wala static route paata hai. Traceroute bilkul yahi hops dikhata hai:</p></div>
<pre class="out">PC1&gt; trace 2001:db8:acad:20::10
trace to 2001:DB8:ACAD:20::10, 8 hops max, press Ctrl+C to stop
 1   <span class="hl">2001:DB8:ACAD:10::1</span> 0.500 ms  0.450 ms  0.480 ms
 2   <span class="hl">2001:DB8:ACAD:12::2</span> 0.700 ms  0.650 ms  0.680 ms
 3   *2001:DB8:ACAD:20::10   1.000 ms (ICMP type:3, code:3, Destination port unreachable)</pre>

<h3>IPv6 ke liye dynamic routing (preview)</h3>
<p>Chhote office ke liye static routes theek hain. Bade networks routing protocol chalate hain, aur har ek ka IPv6 version hai: <b>OSPFv3</b> (multicast ff02::5 aur ff02::6), <b>EIGRP for IPv6</b>, <b>RIPng</b> (UDP 521, group ff02::9) aur <b>MP-BGP</b>, jo providers ke beech IPv6 prefixes le jaata hai. Yeh protocols link-local addresses se neighbourships banate hain, isliye unke routes mein aapko <code>fe80::</code> next hops dikhenge. Routing module inhe theek se cover karta hai; is module ke liye yaad rakho ki IPv6 ko apna protocol instance ya address family chahiye.</p>

<h3>Verification toolkit</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Router</th><th>Windows / Linux host</th></tr>
<tr><td>Kaunse addresses aur interfaces?</td><td>show ipv6 interface brief</td><td>ipconfig / ip -6 addr</td></tr>
<tr><td>Kaunse routes?</td><td>show ipv6 route</td><td>route print -6 / ip -6 route</td></tr>
<tr><td>Kaunse neighbours?</td><td>show ipv6 neighbors</td><td>netsh interface ipv6 show neighbors / ip -6 neigh</td></tr>
<tr><td>Kya main pahunch sakta hoon?</td><td>ping ipv6 X</td><td>ping -6 X / ping6 X</td></tr>
<tr><td>Kaunsa path?</td><td>traceroute ipv6 X</td><td>tracert -6 X / traceroute -6 X</td></tr>
</table>

<div class="warn"><p><b>Common galtiyan.</b> Route sirf ek direction mein lagana. IPv4 route jodna aur ummeed karna ki woh IPv6 ke liye chalega. Link-local next hop bina exit interface ke use karna. Firewall par ICMPv6 Packet Too Big filter karna, jisse bade transfers toot jaate hain jabki chhote pings chalte rehte hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> IPv6 default route <b>::/0</b> hai. IPv6 routers fragment nahi karte; source karta hai, ICMPv6 Packet Too Big ke baad. RIPng UDP <b>521</b> use karta hai. OSPFv3 IPv6 ke liye OSPF version hai. "L" routes router ke apne addresses ki /128 entries hain.</p></div>

<div class="scn"><h4>Pings chalte hain, file copies atak jaati hain</h4><p>WAN par IPv6 enable karne ke baad sites ke beech chhote pings chal rahe the lekin IPv6 par badi file copies kuch second baad ruk jaati thi. WAN path mein chhote MTU wala ek tunnel tha. Router ICMPv6 Packet Too Big messages bhej raha tha, lekin "echo ke alawa saara ICMPv6 deny" wale firewall rule ne unhe drop kar diya, isliye servers ko kabhi pata nahi chala ki chhote packets bhejne hain. Engineer ne firewall mein ICMPv6 Packet Too Big (type 2) allow kiya aur transfers poore ho gaye.</p><p><b>Seekh:</b> IPv6 mein path MTU discovery ICMPv6 par depend karta hai. Use block karne se "black holes" bante hain jo sirf bade packets ko lagte hain.</p></div>

<div class="iv"><p class="q">"IPv4 ke comparison mein IPv6 routing mein kya alag hai?"</p><p>Strong answer: logic same hai (longest prefix match, administrative distance, next hop), lekin IPv6 ki alag routing table hai aur alag routes ya protocol instances chahiye. Default route ::/0 hai, next hops aksar link-local hote hain aur tab exit interface chahiye, routers kabhi fragment nahi karte aur ICMPv6 Packet Too Big par depend karte hain, aur next-hop MACs resolve karne ke liye ARP ki jagah ND hai. IPv6 protocols ke naam lo: OSPFv3, EIGRP for IPv6, RIPng, MP-BGP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv6 ki apni routing table hai; IPv4 routes IPv6 traffic ke liye kuch nahi karte.</li>
<li>Default route ::/0 hai; C, L (/128 apna address) aur S common codes hain.</li>
<li>Static route mein link-local next hop ko exit interface chahiye.</li>
<li>Hamesha return route check karo: ping ko dono direction mein routes chahiye.</li>
<li>Routers IPv6 kabhi fragment nahi karte; ICMPv6 Packet Too Big allow hona chahiye.</li>
</ul></div>
`}};export{e as default};