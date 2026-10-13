var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a long train journey you check four things: ticket, ID, charger, water. It takes a minute and saves the trip. This chapter is that one-minute check for IPv6. Read it the night before the exam or an interview, and come back to it before your first IPv6 change at work.</p>

<h3>Checklist: you should be able to...</h3>
<ul>
<li>Explain why IPv4 ran out, what NAT and CGNAT cost, and what IPv6 changed besides the address length (no broadcast, no ARP, fixed 40-byte header, Hop Limit, several addresses per interface).</li>
<li>Convert hex to binary, shorten any address with the two rules, and expand a shortened one back to eight hextets.</li>
<li>Find the /64 prefix of any address and plan subnets from a /48 or /56.</li>
<li>Identify GUA, ULA, link-local, loopback, unspecified, multicast and anycast from the first hextet, and compute a solicited-node group.</li>
<li>Build a modified EUI-64 interface ID by hand from a MAC address.</li>
<li>Configure <code>ipv6 unicast-routing</code>, global, EUI-64 and link-local addresses on IOS, and read <code>show ipv6 interface [brief]</code>.</li>
<li>Explain RS, RA, NS, NA and DAD, and read <code>show ipv6 neighbors</code> and <code>show ipv6 routers</code>.</li>
<li>Choose SLAAC, stateless or stateful DHCPv6 with the M and O flags, and configure each.</li>
<li>Configure recursive, directly attached, fully specified, default, host and floating IPv6 static routes, and verify both directions.</li>
<li>Describe dual stack, tunnelling and NAT64/DNS64.</li>
<li>Troubleshoot "host has no IPv6 address" and "can ping the gateway but nothing else" with a fixed workflow.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Address types by first hextet">
<rect x="10" y="20" width="120" height="56" rx="8" fill="#bbf7d0"/><text x="70" y="44" text-anchor="middle" class="svg-ink" font-size="13">2 or 3</text><text x="70" y="63" text-anchor="middle" class="svg-muted" font-size="12">GUA 2000::/3</text>
<rect x="135" y="20" width="120" height="56" rx="8" fill="#fde68a"/><text x="195" y="44" text-anchor="middle" class="svg-ink" font-size="13">fd</text><text x="195" y="63" text-anchor="middle" class="svg-muted" font-size="12">ULA fc00::/7</text>
<rect x="260" y="20" width="120" height="56" rx="8" fill="#bae6fd"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">fe80</text><text x="320" y="63" text-anchor="middle" class="svg-muted" font-size="12">link-local /10</text>
<rect x="385" y="20" width="120" height="56" rx="8" fill="#ddd6fe"/><text x="445" y="44" text-anchor="middle" class="svg-ink" font-size="13">ff</text><text x="445" y="63" text-anchor="middle" class="svg-muted" font-size="12">multicast /8</text>
<rect x="510" y="20" width="120" height="56" rx="8" fill="#e2e8f0"/><text x="570" y="44" text-anchor="middle" class="svg-ink" font-size="13">::1 and ::</text><text x="570" y="63" text-anchor="middle" class="svg-muted" font-size="12">loopback, unspec.</text>
<text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="13">Interface ID tricks: ff:fe in the middle = EUI-64</text>
<text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Solicited-node: ff02::1:ff + last 24 bits</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="13">RA flags: M=0 O=0 SLAAC | O=1 stateless | M=1 stateful</text>
</svg><p class="cap">The whole module on one card: read the first hextet, the middle of the interface ID and the RA flags.</p></div>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Size</td><td>128 bits, 8 hextets of 16 bits, 32 hex digits</td></tr>
<tr><td>Shortening</td><td>Drop leading zeros; <code>::</code> once, for the longest zero run</td></tr>
<tr><td>LAN prefix</td><td>/64; loopback /128; point-to-point /64 or /127</td></tr>
<tr><td>Broadcast</td><td>Does not exist; ff02::1 reaches all nodes</td></tr>
<tr><td>EUI-64</td><td>Split MAC, insert fffe, flip the 7th bit</td></tr>
<tr><td>ND types</td><td>RS 133, RA 134, NS 135, NA 136, Redirect 137</td></tr>
<tr><td>DAD</td><td>NS from :: to the solicited-node group; reply = duplicate</td></tr>
<tr><td>Default gateway</td><td>Always the RA's link-local source, never from DHCPv6</td></tr>
<tr><td>DHCPv6</td><td>UDP 546 client, 547 server; ff02::1:2; SARR</td></tr>
<tr><td>IOS default</td><td><code>ipv6 unicast-routing</code> is off</td></tr>
<tr><td>Static rule</td><td>Link-local next hop needs the exit interface</td></tr>
<tr><td>Default route</td><td><code>::/0</code>; ND default from autoconfig has AD 2</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! global</span>
ipv6 unicast-routing
ipv6 route 2001:db8:3::/64 2001:db8:12::2
ipv6 route 2001:db8:1::/64 g0/0 fe80::1
ipv6 route ::/0 2001:db8:23::2
ipv6 route 2001:db8:3::/64 2001:db8:13::3 10
<span class="c">! interface</span>
ipv6 address 2001:db8:acad:12::1/64
ipv6 address 2001:db8:cafe:1::/64 eui-64
ipv6 address fe80::1 link-local
ipv6 enable
ipv6 address autoconfig default
ipv6 nd other-config-flag
ipv6 nd managed-config-flag
ipv6 nd prefix 2001:db8:cafe:1::/64 no-autoconfig
ipv6 dhcp server POOL
<span class="c">! verify</span>
show ipv6 interface brief
show ipv6 interface g0/0
show ipv6 route [static]
show ipv6 neighbors
show ipv6 routers
show ipv6 dhcp pool
ping 2001:db8:3::1 source Loopback0</pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Hextet</dt><dd>One 16-bit group of four hex digits.</dd>
<dt>Prefix / interface ID</dt><dd>The network part and the host part of an address; usually 64 bits each.</dd>
<dt>GUA / ULA / LLA</dt><dd>Global unicast, unique local, link-local addresses.</dd>
<dt>Solicited-node multicast</dt><dd>ff02::1:ff plus the last 24 bits of an address; target of NS messages.</dd>
<dt>EUI-64</dt><dd>Interface ID built from a MAC with fffe inserted and the U/L bit flipped.</dd>
<dt>NDP</dt><dd>Neighbor Discovery Protocol: ICMPv6 RS, RA, NS, NA, Redirect.</dd>
<dt>DAD</dt><dd>Duplicate Address Detection before using a new address.</dd>
<dt>SLAAC</dt><dd>Stateless address autoconfiguration from a /64 in an RA.</dd>
<dt>M / O flags</dt><dd>RA flags: Managed (use DHCPv6 for addresses), Other (use DHCPv6 for other options).</dd>
<dt>Floating static</dt><dd>A backup static route with a higher administrative distance.</dd>
<dt>Dual stack</dt><dd>IPv4 and IPv6 running side by side on the same devices.</dd>
</dl>

<div class="warn"><p><b>Common mistakes to avoid on exam day.</b> Two <code>::</code> in one address; dropping trailing zeros; forgetting the EUI-64 bit flip; believing DHCPv6 supplies the gateway; and choosing <code>ip routing</code> when the question is about IPv6 forwarding.</p></div>

<div class="exam"><p><b>Exam trap.</b> Read every option to the last hextet. Many wrong answers differ from the right one by a single digit, such as <code>fe80::/10</code> versus <code>fec0::/10</code>, <code>ff02::1</code> versus <code>ff02::2</code>, or <code>5054</code> versus <code>5254</code> in an EUI-64 ID.</p></div>

<div class="scn"><h4>The pre-change checklist that saved a night</h4><p>Before enabling IPv6 on forty branch routers, a team ran exactly this checklist on a pilot site. The pilot passed every step except one: <code>show ipv6 interface</code> showed <code>Hosts use DHCP to obtain routable addresses.</code> because the template set the M flag, while the branches had no DHCPv6 server. Catching it on one router took five minutes; finding it after the rollout would have meant forty sites of users without IPv6.</p><p><b>Lesson:</b> a short, fixed checklist run on a pilot catches template mistakes before they multiply.</p></div>

<div class="iv"><p class="q">"In two minutes, explain how a laptop gets online with IPv6."</p><p>Strong answer: it creates a link-local address and runs DAD. It sends an RS; the router replies with an RA carrying the /64 prefix, flags and its link-local as gateway. With M=0 O=0 the laptop builds its own interface ID (random or EUI-64), runs DAD and uses SLAAC; with O=1 it also asks DHCPv6 for DNS; with M=1 it gets its address from DHCPv6. It resolves the gateway's MAC with NS/NA to the solicited-node group, and sends traffic. Mention there is no broadcast anywhere in that process.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Know the address types by first hextet, and compute shortening, prefixes, EUI-64 and solicited-node by hand.</li>
<li>Router basics: ipv6 unicast-routing plus ipv6 address on each interface; verify with show ipv6 interface brief.</li>
<li>ND (RS/RA/NS/NA/DAD) replaces ARP and router discovery; the RA sets gateway and M/O flags.</li>
<li>Static routes: recursive, fully specified for link-local, ::/0 default, /128 host, floating by AD.</li>
<li>Troubleshoot bottom-up, test with real source addresses, and check the return path.</li>
</ul></div>
`,hi:`
<p>Lambi train yatra se pehle aap chaar cheezein check karte ho: ticket, ID, charger, paani. Ek minute lagta hai aur safar bach jaata hai. Yeh chapter IPv6 ke liye wahi ek-minute check hai. Exam ya interview se pehle ki raat ise padho, aur kaam par apne pehle IPv6 change se pehle ise dobara dekho.</p>

<h3>Checklist: aapko yeh aana chahiye...</h3>
<ul>
<li>Samjhana ki IPv4 kyun khatam hua, NAT aur CGNAT ki kya keemat hai, aur address length ke alawa IPv6 ne kya badla (broadcast nahi, ARP nahi, fixed 40-byte header, Hop Limit, ek interface par kai addresses).</li>
<li>Hex ko binary mein badalna, do rules se koi bhi address chhota karna, aur chhote address ko wapas aath hextets mein expand karna.</li>
<li>Kisi bhi address ka /64 prefix nikalna aur /48 ya /56 se subnets plan karna.</li>
<li>Pehle hextet se GUA, ULA, link-local, loopback, unspecified, multicast aur anycast pehchanna, aur solicited-node group nikalna.</li>
<li>MAC address se haath se modified EUI-64 interface ID banana.</li>
<li>IOS par <code>ipv6 unicast-routing</code>, global, EUI-64 aur link-local addresses configure karna, aur <code>show ipv6 interface [brief]</code> padhna.</li>
<li>RS, RA, NS, NA aur DAD samjhana, aur <code>show ipv6 neighbors</code> aur <code>show ipv6 routers</code> padhna.</li>
<li>M aur O flags se SLAAC, stateless ya stateful DHCPv6 chunna, aur har ek configure karna.</li>
<li>Recursive, directly attached, fully specified, default, host aur floating IPv6 static routes configure karna, aur dono direction verify karna.</li>
<li>Dual stack, tunnelling aur NAT64/DNS64 samjhana.</li>
<li>Fixed workflow se "host ke paas IPv6 address nahi" aur "gateway ping hota hai par aur kuch nahi" troubleshoot karna.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Pehle hextet se address types">
<rect x="10" y="20" width="120" height="56" rx="8" fill="#bbf7d0"/><text x="70" y="44" text-anchor="middle" class="svg-ink" font-size="13">2 ya 3</text><text x="70" y="63" text-anchor="middle" class="svg-muted" font-size="12">GUA 2000::/3</text>
<rect x="135" y="20" width="120" height="56" rx="8" fill="#fde68a"/><text x="195" y="44" text-anchor="middle" class="svg-ink" font-size="13">fd</text><text x="195" y="63" text-anchor="middle" class="svg-muted" font-size="12">ULA fc00::/7</text>
<rect x="260" y="20" width="120" height="56" rx="8" fill="#bae6fd"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">fe80</text><text x="320" y="63" text-anchor="middle" class="svg-muted" font-size="12">link-local /10</text>
<rect x="385" y="20" width="120" height="56" rx="8" fill="#ddd6fe"/><text x="445" y="44" text-anchor="middle" class="svg-ink" font-size="13">ff</text><text x="445" y="63" text-anchor="middle" class="svg-muted" font-size="12">multicast /8</text>
<rect x="510" y="20" width="120" height="56" rx="8" fill="#e2e8f0"/><text x="570" y="44" text-anchor="middle" class="svg-ink" font-size="13">::1 aur ::</text><text x="570" y="63" text-anchor="middle" class="svg-muted" font-size="12">loopback, unspec.</text>
<text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="13">Interface ID tricks: beech mein ff:fe = EUI-64</text>
<text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Solicited-node: ff02::1:ff + aakhri 24 bits</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="13">RA flags: M=0 O=0 SLAAC | O=1 stateless | M=1 stateful</text>
</svg><p class="cap">Poora module ek card par: pehla hextet, interface ID ka beech aur RA flags padho.</p></div>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Size</td><td>128 bits, 16 bits ke 8 hextets, 32 hex digits</td></tr>
<tr><td>Shortening</td><td>Leading zeros hatao; <code>::</code> ek baar, sabse lambe zero run ke liye</td></tr>
<tr><td>LAN prefix</td><td>/64; loopback /128; point-to-point /64 ya /127</td></tr>
<tr><td>Broadcast</td><td>Exist nahi karta; ff02::1 saare nodes tak pahunchta hai</td></tr>
<tr><td>EUI-64</td><td>MAC todo, fffe daalo, 7th bit flip karo</td></tr>
<tr><td>ND types</td><td>RS 133, RA 134, NS 135, NA 136, Redirect 137</td></tr>
<tr><td>DAD</td><td>:: se solicited-node group ko NS; jawab = duplicate</td></tr>
<tr><td>Default gateway</td><td>Hamesha RA ka link-local source, DHCPv6 se kabhi nahi</td></tr>
<tr><td>DHCPv6</td><td>UDP 546 client, 547 server; ff02::1:2; SARR</td></tr>
<tr><td>IOS default</td><td><code>ipv6 unicast-routing</code> off hai</td></tr>
<tr><td>Static rule</td><td>Link-local next hop ko exit interface chahiye</td></tr>
<tr><td>Default route</td><td><code>::/0</code>; autoconfig se ND default ka AD 2</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! global</span>
ipv6 unicast-routing
ipv6 route 2001:db8:3::/64 2001:db8:12::2
ipv6 route 2001:db8:1::/64 g0/0 fe80::1
ipv6 route ::/0 2001:db8:23::2
ipv6 route 2001:db8:3::/64 2001:db8:13::3 10
<span class="c">! interface</span>
ipv6 address 2001:db8:acad:12::1/64
ipv6 address 2001:db8:cafe:1::/64 eui-64
ipv6 address fe80::1 link-local
ipv6 enable
ipv6 address autoconfig default
ipv6 nd other-config-flag
ipv6 nd managed-config-flag
ipv6 nd prefix 2001:db8:cafe:1::/64 no-autoconfig
ipv6 dhcp server POOL
<span class="c">! verify</span>
show ipv6 interface brief
show ipv6 interface g0/0
show ipv6 route [static]
show ipv6 neighbors
show ipv6 routers
show ipv6 dhcp pool
ping 2001:db8:3::1 source Loopback0</pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Hextet</dt><dd>Chaar hex digits ka ek 16-bit group.</dd>
<dt>Prefix / interface ID</dt><dd>Address ka network part aur host part; aam taur par dono 64 bits.</dd>
<dt>GUA / ULA / LLA</dt><dd>Global unicast, unique local, link-local addresses.</dd>
<dt>Solicited-node multicast</dt><dd>ff02::1:ff plus address ke aakhri 24 bits; NS messages ka target.</dd>
<dt>EUI-64</dt><dd>MAC se bana interface ID, fffe daala hua aur U/L bit flip kiya hua.</dd>
<dt>NDP</dt><dd>Neighbor Discovery Protocol: ICMPv6 RS, RA, NS, NA, Redirect.</dd>
<dt>DAD</dt><dd>Naya address use karne se pehle Duplicate Address Detection.</dd>
<dt>SLAAC</dt><dd>RA ke /64 se stateless address autoconfiguration.</dd>
<dt>M / O flags</dt><dd>RA flags: Managed (addresses ke liye DHCPv6 use karo), Other (baaki options ke liye DHCPv6 use karo).</dd>
<dt>Floating static</dt><dd>Zyada administrative distance wala backup static route.</dd>
<dt>Dual stack</dt><dd>Same devices par IPv4 aur IPv6 saath saath chalna.</dd>
</dl>

<div class="warn"><p><b>Exam ke din bachne wali common galtiyan.</b> Ek address mein do <code>::</code>; trailing zeros hatana; EUI-64 bit flip bhoolna; yeh maanna ki DHCPv6 gateway deta hai; aur jab sawaal IPv6 forwarding ka ho tab <code>ip routing</code> chunna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Har option ko aakhri hextet tak padho. Kai galat answers sahi wale se sirf ek digit se alag hote hain, jaise <code>fe80::/10</code> aur <code>fec0::/10</code>, <code>ff02::1</code> aur <code>ff02::2</code>, ya EUI-64 ID mein <code>5054</code> aur <code>5254</code>.</p></div>

<div class="scn"><h4>Pre-change checklist jisne ek raat bacha li</h4><p>Chaalees branch routers par IPv6 enable karne se pehle, ek team ne pilot site par bilkul yahi checklist chalayi. Pilot ne ek ko chhod kar har step pass kiya: <code>show ipv6 interface</code> ne <code>Hosts use DHCP to obtain routable addresses.</code> dikhaya kyunki template M flag set kar raha tha, jabki branches mein koi DHCPv6 server nahi tha. Ek router par ise pakadne mein paanch minute lage; rollout ke baad milta to chaalees sites ke users bina IPv6 ke hote.</p><p><b>Seekh:</b> pilot par chalayi gayi chhoti, fixed checklist template ki galtiyon ko failne se pehle pakad leti hai.</p></div>

<div class="iv"><p class="q">"Do minute mein samjhao ki laptop IPv6 ke saath online kaise hota hai."</p><p>Strong answer: woh link-local address banata hai aur DAD chalata hai. RS bhejta hai; router /64 prefix, flags aur gateway ke roop mein apne link-local ke saath RA se jawab deta hai. M=0 O=0 ke saath laptop apna interface ID (random ya EUI-64) banata hai, DAD chalata hai aur SLAAC use karta hai; O=1 ke saath woh DNS ke liye DHCPv6 se bhi poochta hai; M=1 ke saath address DHCPv6 se leta hai. Woh solicited-node group ko NS/NA se gateway ka MAC resolve karta hai, aur traffic bhejta hai. Batao ki is poore process mein kahin broadcast nahi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle hextet se address types jaano, aur shortening, prefixes, EUI-64 aur solicited-node haath se nikaalo.</li>
<li>Router basics: ipv6 unicast-routing plus har interface par ipv6 address; show ipv6 interface brief se verify karo.</li>
<li>ND (RS/RA/NS/NA/DAD) ARP aur router discovery ki jagah leta hai; RA gateway aur M/O flags set karta hai.</li>
<li>Static routes: recursive, link-local ke liye fully specified, ::/0 default, /128 host, AD se floating.</li>
<li>Neeche se upar troubleshoot karo, asli source addresses se test karo, aur return path check karo.</li>
</ul></div>
`}};export{e as default};