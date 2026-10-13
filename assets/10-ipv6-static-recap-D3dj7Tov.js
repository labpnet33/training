var e={id:`ipv6-static-recap`,h:{en:`IPv6 static routes: the same ideas, new syntax`,hi:`IPv6 static routes: wahi ideas, naya syntax`},body:{en:`
<p>If you can drive in Delhi, you can drive in Bengaluru. The roads have different names and the signs look a little different, but the rules of the road are the same. IPv6 static routing is exactly like that. Everything you learned in this module, longest match, AD, recursive lookup, default and floating routes, return paths, applies unchanged. Only the syntax and a few details differ. The IPv6 module covered IPv6 static routes in full; this chapter is a focused recap that maps each IPv4 idea to its IPv6 twin so the exam cannot catch you out.</p>

<h3>Before any IPv6 route works</h3>
<p>Cisco routers forward IPv4 by default but <b>not IPv6</b>. Without <code>ipv6 unicast-routing</code> in global configuration, the router accepts IPv6 addresses on its interfaces and can ping, but it will not route IPv6 packets between interfaces and it sends no Router Advertisements. This is the most common "my IPv6 static route does nothing" cause.</p>
<pre class="code">R1(config)# ipv6 unicast-routing</pre>

<h3>IPv4 and IPv6 side by side</h3>
<table class="cmp">
<tr><th>Idea</th><th>IPv4</th><th>IPv6</th></tr>
<tr><td>Enable routing</td><td>On by default on routers</td><td><code>ipv6 unicast-routing</code></td></tr>
<tr><td>Next-hop route</td><td><code>ip route 172.16.3.0 255.255.255.0 10.12.12.2</code></td><td><code>ipv6 route 2001:db8:3::/64 2001:db8:12::2</code></td></tr>
<tr><td>Fully specified</td><td><code>ip route ... Gi0/1 10.23.23.1</code></td><td><code>ipv6 route ... Gi0/1 FE80::2</code></td></tr>
<tr><td>Default route</td><td><code>0.0.0.0 0.0.0.0</code></td><td><code>::/0</code></td></tr>
<tr><td>Host route</td><td>/32 (255.255.255.255)</td><td>/128</td></tr>
<tr><td>Local route</td><td>L x.x.x.x/32</td><td>L .../128, "receive"</td></tr>
<tr><td>Floating</td><td>AD at the end</td><td>AD at the end</td></tr>
<tr><td>Verify</td><td><code>show ip route static</code></td><td><code>show ipv6 route static</code></td></tr>
</table>
<p>Note the prefix format: IPv6 routes use <b>prefix/length</b> notation directly (no dotted mask), and the prefix must be written as the network, for example 2001:db8:3::/64.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Dual-stack version of the first lab">
<rect x="20" y="40" width="170" height="60" rx="8" fill="#bae6fd"/><text x="105" y="65" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="105" y="85" text-anchor="middle" class="svg-muted" font-size="12">LAN 2001:db8:1::/64</text>
<rect x="235" y="40" width="170" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="65" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="320" y="85" text-anchor="middle" class="svg-muted" font-size="12">transit</text>
<rect x="450" y="40" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="65" text-anchor="middle" class="svg-ink" font-size="13">R3</text><text x="535" y="85" text-anchor="middle" class="svg-muted" font-size="12">LAN 2001:db8:3::/64</text>
<line x1="190" y1="70" x2="235" y2="70" stroke="#64748b" stroke-width="2"/><line x1="405" y1="70" x2="450" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="212" y="130" text-anchor="middle" class="svg-accent" font-size="12">2001:db8:12::/64</text>
<text x="428" y="130" text-anchor="middle" class="svg-accent" font-size="12">2001:db8:23::/64</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">Same routers, same logic: forward and return routes for each LAN</text>
</svg><p class="cap">The first lab with IPv6 prefixes added: every IPv4 rule in this module carries over.</p></div>

<h3>Configuration on the dual-stack lab</h3>
<pre class="code"><span class="c">! R1: next hop, R2's global address on the shared link</span>
R1(config)# ipv6 route 2001:db8:3::/64 2001:db8:12::2
<span class="c">! R2: fully specified with link-local next hops (interface required)</span>
R2(config)# ipv6 route 2001:db8:1::/64 GigabitEthernet0/0 FE80::1
R2(config)# ipv6 route 2001:db8:3::/64 GigabitEthernet0/1 FE80::3
<span class="c">! R3: a stub, so one default route back toward R2</span>
R3(config)# ipv6 route ::/0 2001:db8:23::1</pre>

<pre class="out">R1#show ipv6 route
IPv6 Routing Table - default - 6 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
       B - BGP, R - RIP, D - EIGRP, EX - EIGRP external
       O - OSPF Intra, OI - OSPF Inter, OE1 - OSPF ext 1, OE2 - OSPF ext 2
C   2001:DB8:1::/64 [0/0]
     via GigabitEthernet0/0, directly connected
L   2001:DB8:1::1/128 [0/0]
     via GigabitEthernet0/0, receive
C   2001:DB8:12::/64 [0/0]
     via GigabitEthernet0/1, directly connected
L   2001:DB8:12::1/128 [0/0]
     via GigabitEthernet0/1, receive
<span class="hl">S   2001:DB8:3::/64 [1/0]
     via 2001:DB8:12::2</span>
L   FF00::/8 [0/0]
     via Null0, receive</pre>
<p>Differences from the IPv4 table: each entry spans two lines, connected routes print <code>[0/0]</code>, local routes are /128 and say "receive", multicast FF00::/8 is always present, and there is no "Gateway of last resort" line. A default shows simply as <code>S ::/0</code>.</p>

<h3>The IPv6-specific details</h3>
<ul>
<li><b>Link-local next hops need an interface.</b> FE80::1 exists on every link, so <code>ipv6 route 2001:db8:1::/64 FE80::1</code> alone is rejected with <code>% Interface has to be specified for a link-local nexthop</code>.</li>
<li><b>Exit-interface-only on Ethernet</b> behaves like the IPv4 version: the router treats every destination as on-link and uses Neighbor Discovery for each one. Without something answering on behalf of remote hosts it fails, so use a next hop or a fully specified route on Ethernet.</li>
<li><b>Floating routes</b> work identically: <code>ipv6 route ::/0 2001:db8:acad:2::1 5</code> backs up a primary default with AD 1.</li>
<li><b>Verification</b>: <code>show ipv6 route</code>, <code>show ipv6 route 2001:db8:3::10</code>, <code>ping ipv6</code> (or just <code>ping</code> with an IPv6 address) and <code>traceroute</code>.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> R3 needs a way back to 2001:db8:1::/64 and to 2001:db8:12::/64. Because R3 is a stub with a single uplink, one default <code>ipv6 route ::/0 2001:db8:23::1</code> covers both, just as an IPv4 default would. A ping from R1 sourced from its LAN, <code>ping 2001:db8:3::1 source GigabitEthernet0/0</code>, tests forward and return paths in one go.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring perfect <code>ipv6 route</code> statements on a router that never had <code>ipv6 unicast-routing</code>. The routes may even appear in the table, but the router does not forward transit IPv6 traffic. Check <code>show running-config | include unicast-routing</code> first.</p></div>

<div class="exam"><p><b>Exam trap.</b> Identify route types from the command alone: <code>::/0</code> default, <code>/128</code> host, trailing number = AD (floating), interface plus <code>FE80::</code> = fully specified with link-local next hop. IPv6 and IPv4 use the <b>same</b> default AD values: static 1, OSPF 110 and so on.</p></div>

<div class="scn"><h4>IPv4 fine, IPv6 dead</h4><p>A university enabled dual stack in a lab building. IPv4 worked everywhere, but IPv6 clients could only reach their own gateway. The building router had correct static routes toward the campus core, <code>show ipv6 route</code> listed them, and the core had routes back. A trace from a client stopped at the first hop. <code>show running-config | include ipv6 unicast</code> returned nothing: the router had been configured from a template that forgot <code>ipv6 unicast-routing</code>. One command fixed the whole building.</p><p><b>Lesson:</b> for IPv6, check that routing itself is enabled before debugging individual routes.</p></div>

<div class="iv"><p class="q">"How do IPv6 static routes differ from IPv4 static routes?"</p><p>Strong answer: the concepts are the same, longest match, AD 1, recursive or fully specified, default and floating routes. The differences: <code>ipv6 unicast-routing</code> must be enabled; syntax is <code>ipv6 route prefix/length</code>; the default is ::/0 and host routes are /128; a link-local next hop must be paired with an exit interface; and the table shows local /128 routes marked receive and no gateway of last resort line.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Enable <code>ipv6 unicast-routing</code> or the router will not forward IPv6.</li>
<li><code>ipv6 route prefix/length next-hop | interface [next-hop] [AD]</code>; default ::/0, host /128.</li>
<li>Link-local next hops require the exit interface (fully specified).</li>
<li>Longest match, AD values, floating routes and return-path thinking are identical to IPv4.</li>
<li>Verify with <code>show ipv6 route static</code>, <code>show ipv6 route x</code>, ping and traceroute.</li>
</ul></div>
`,hi:`
<p>Agar aap Delhi mein gaadi chala sakte ho, to Bengaluru mein bhi chala sakte ho. Sadkon ke naam alag hain aur signs thode alag dikhte hain, lekin road ke rules wahi hain. IPv6 static routing bilkul aisi hi hai. Is module mein jo kuch seekha, longest match, AD, recursive lookup, default aur floating routes, return paths, sab bina badlaav ke laagu hota hai. Sirf syntax aur kuch details alag hain. IPv6 module ne IPv6 static routes poori tarah cover kiye; yeh chapter ek focused recap hai jo har IPv4 idea ko uske IPv6 jodidaar se map karta hai taaki exam aapko pakad na sake.</p>

<h3>Koi bhi IPv6 route kaam kare usse pehle</h3>
<p>Cisco routers default mein IPv4 forward karte hain lekin <b>IPv6 nahi</b>. Global configuration mein <code>ipv6 unicast-routing</code> ke bina router apne interfaces par IPv6 addresses accept karta hai aur ping kar sakta hai, lekin interfaces ke beech IPv6 packets route nahi karta aur koi Router Advertisements nahi bhejta. "Mera IPv6 static route kuch nahi karta" ka yeh sabse common kaaran hai.</p>
<pre class="code">R1(config)# ipv6 unicast-routing</pre>

<h3>IPv4 aur IPv6 side by side</h3>
<table class="cmp">
<tr><th>Idea</th><th>IPv4</th><th>IPv6</th></tr>
<tr><td>Routing enable</td><td>Routers par default mein on</td><td><code>ipv6 unicast-routing</code></td></tr>
<tr><td>Next-hop route</td><td><code>ip route 172.16.3.0 255.255.255.0 10.12.12.2</code></td><td><code>ipv6 route 2001:db8:3::/64 2001:db8:12::2</code></td></tr>
<tr><td>Fully specified</td><td><code>ip route ... Gi0/1 10.23.23.1</code></td><td><code>ipv6 route ... Gi0/1 FE80::2</code></td></tr>
<tr><td>Default route</td><td><code>0.0.0.0 0.0.0.0</code></td><td><code>::/0</code></td></tr>
<tr><td>Host route</td><td>/32 (255.255.255.255)</td><td>/128</td></tr>
<tr><td>Local route</td><td>L x.x.x.x/32</td><td>L .../128, "receive"</td></tr>
<tr><td>Floating</td><td>End mein AD</td><td>End mein AD</td></tr>
<tr><td>Verify</td><td><code>show ip route static</code></td><td><code>show ipv6 route static</code></td></tr>
</table>
<p>Prefix format par dhyan do: IPv6 routes seedha <b>prefix/length</b> notation use karte hain (dotted mask nahi), aur prefix network ke roop mein likhna hota hai, jaise 2001:db8:3::/64.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Pehle lab ka dual-stack version">
<rect x="20" y="40" width="170" height="60" rx="8" fill="#bae6fd"/><text x="105" y="65" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="105" y="85" text-anchor="middle" class="svg-muted" font-size="12">LAN 2001:db8:1::/64</text>
<rect x="235" y="40" width="170" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="65" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="320" y="85" text-anchor="middle" class="svg-muted" font-size="12">transit</text>
<rect x="450" y="40" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="65" text-anchor="middle" class="svg-ink" font-size="13">R3</text><text x="535" y="85" text-anchor="middle" class="svg-muted" font-size="12">LAN 2001:db8:3::/64</text>
<line x1="190" y1="70" x2="235" y2="70" stroke="#64748b" stroke-width="2"/><line x1="405" y1="70" x2="450" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="212" y="130" text-anchor="middle" class="svg-accent" font-size="12">2001:db8:12::/64</text>
<text x="428" y="130" text-anchor="middle" class="svg-accent" font-size="12">2001:db8:23::/64</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">Wahi routers, wahi logic: har LAN ke liye forward aur return routes</text>
</svg><p class="cap">IPv6 prefixes ke saath pehla lab: is module ka har IPv4 rule aage chalta hai.</p></div>

<h3>Dual-stack lab par configuration</h3>
<pre class="code"><span class="c">! R1: next hop, shared link par R2 ka global address</span>
R1(config)# ipv6 route 2001:db8:3::/64 2001:db8:12::2
<span class="c">! R2: link-local next hops ke saath fully specified (interface zaroori)</span>
R2(config)# ipv6 route 2001:db8:1::/64 GigabitEthernet0/0 FE80::1
R2(config)# ipv6 route 2001:db8:3::/64 GigabitEthernet0/1 FE80::3
<span class="c">! R3: stub hai, isliye R2 ki taraf ek default route</span>
R3(config)# ipv6 route ::/0 2001:db8:23::1</pre>

<pre class="out">R1#show ipv6 route
IPv6 Routing Table - default - 6 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
       B - BGP, R - RIP, D - EIGRP, EX - EIGRP external
       O - OSPF Intra, OI - OSPF Inter, OE1 - OSPF ext 1, OE2 - OSPF ext 2
C   2001:DB8:1::/64 [0/0]
     via GigabitEthernet0/0, directly connected
L   2001:DB8:1::1/128 [0/0]
     via GigabitEthernet0/0, receive
C   2001:DB8:12::/64 [0/0]
     via GigabitEthernet0/1, directly connected
L   2001:DB8:12::1/128 [0/0]
     via GigabitEthernet0/1, receive
<span class="hl">S   2001:DB8:3::/64 [1/0]
     via 2001:DB8:12::2</span>
L   FF00::/8 [0/0]
     via Null0, receive</pre>
<p>IPv4 table se fark: har entry do lines ki hai, connected routes <code>[0/0]</code> print karte hain, local routes /128 hain aur "receive" bolte hain, multicast FF00::/8 hamesha hota hai, aur "Gateway of last resort" line nahi hoti. Default simply <code>S ::/0</code> dikhta hai.</p>

<h3>IPv6-specific details</h3>
<ul>
<li><b>Link-local next hops ko interface chahiye.</b> FE80::1 har link par exist karta hai, isliye akela <code>ipv6 route 2001:db8:1::/64 FE80::1</code> <code>% Interface has to be specified for a link-local nexthop</code> ke saath reject hota hai.</li>
<li><b>Ethernet par sirf exit-interface</b> IPv4 version jaisa hi behave karta hai: router har destination ko on-link maanta hai aur har ek ke liye Neighbor Discovery use karta hai. Agar remote hosts ki taraf se koi jawab na de to fail hota hai, isliye Ethernet par next hop ya fully specified route use karo.</li>
<li><b>Floating routes</b> bilkul same kaam karte hain: <code>ipv6 route ::/0 2001:db8:acad:2::1 5</code> AD 1 wale primary default ka backup hai.</li>
<li><b>Verification</b>: <code>show ipv6 route</code>, <code>show ipv6 route 2001:db8:3::10</code>, <code>ping ipv6</code> (ya bas IPv6 address ke saath <code>ping</code>) aur <code>traceroute</code>.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> R3 ko 2001:db8:1::/64 aur 2001:db8:12::/64 dono tak wapas jaane ka raasta chahiye. Kyunki R3 ek uplink wala stub hai, ek default <code>ipv6 route ::/0 2001:db8:23::1</code> dono cover karta hai, jaise IPv4 default karta. R1 se uske LAN ko source banakar ping, <code>ping 2001:db8:3::1 source GigabitEthernet0/0</code>, forward aur return paths ek saath test karta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Aise router par perfect <code>ipv6 route</code> statements configure karna jis par kabhi <code>ipv6 unicast-routing</code> tha hi nahi. Routes table mein dikh bhi sakte hain, lekin router transit IPv6 traffic forward nahi karta. Pehle <code>show running-config | include unicast-routing</code> check karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Sirf command se route types pehchano: <code>::/0</code> default, <code>/128</code> host, end ka number = AD (floating), interface plus <code>FE80::</code> = link-local next hop ke saath fully specified. IPv6 aur IPv4 <b>same</b> default AD values use karte hain: static 1, OSPF 110 wagairah.</p></div>

<div class="scn"><h4>IPv4 theek, IPv6 dead</h4><p>Ek university ne ek lab building mein dual stack enable kiya. IPv4 har jagah chala, lekin IPv6 clients sirf apne gateway tak pahunch paate the. Building router par campus core ki taraf sahi static routes the, <code>show ipv6 route</code> unhe list karta tha, aur core par wapas ke routes the. Client se trace pehle hop par ruk jaata tha. <code>show running-config | include ipv6 unicast</code> ne kuch nahi lautaya: router ek aise template se configure hua tha jo <code>ipv6 unicast-routing</code> bhool gaya. Ek command ne poori building fix kar di.</p><p><b>Seekh:</b> IPv6 ke liye, individual routes debug karne se pehle check karo ki routing khud enable hai.</p></div>

<div class="iv"><p class="q">"IPv6 static routes IPv4 static routes se kaise alag hain?"</p><p>Strong answer: concepts same hain, longest match, AD 1, recursive ya fully specified, default aur floating routes. Fark: <code>ipv6 unicast-routing</code> enable hona chahiye; syntax <code>ipv6 route prefix/length</code> hai; default ::/0 aur host routes /128 hain; link-local next hop ke saath exit interface zaroori hai; aur table mein receive mark wale local /128 routes dikhte hain aur gateway of last resort line nahi hoti.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ipv6 unicast-routing</code> enable karo warna router IPv6 forward nahi karega.</li>
<li><code>ipv6 route prefix/length next-hop | interface [next-hop] [AD]</code>; default ::/0, host /128.</li>
<li>Link-local next hops ko exit interface chahiye (fully specified).</li>
<li>Longest match, AD values, floating routes aur return-path thinking IPv4 jaise hi hain.</li>
<li><code>show ipv6 route static</code>, <code>show ipv6 route x</code>, ping aur traceroute se verify karo.</li>
</ul></div>
`}};export{e as default};