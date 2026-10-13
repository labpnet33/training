var e={id:`ipv6-ecmp`,h:{en:`IPv6 static routes, resolve and equal-cost load balancing`,hi:`IPv6 static routes, resolve aur equal-cost load balancing`},body:{en:`
<p>Everything you learned about IPv4 static routing carries over to IPv6, with a few name changes. This chapter also covers two extras that the exam likes to mention: the <code>resolve</code> keyword for distant next hops, and what happens when two routes tie.</p>

<h3>IPv6 in one minute</h3>
<p>An IPv6 address has 128 bits written in hexadecimal, such as <code>2001:db8:12::1</code>. The <code>::</code> replaces one run of zero groups. Prefix lengths work as before: <code>2001:db8:30::/64</code> is a /64 network. The documentation range 2001:db8::/32 is reserved for examples, and the default IPv6 route is <code>::/0</code>.</p>
<p>On Junos, IPv6 uses its own address family, <code>family inet6</code>, and its own routing table, <code>inet6.0</code>. That is why IPv6 static routes are configured under the routing table name.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="inet and inet6 tables">
<rect x="20" y="20" width="270" height="140" rx="10" fill="#bae6fd"/><text x="155" y="45" text-anchor="middle" class="svg-ink" font-size="14">inet.0 (IPv4 unicast)</text>
<text x="155" y="72" text-anchor="middle" class="svg-ink" font-size="12">family inet address 10.1.12.1/30</text>
<text x="155" y="94" text-anchor="middle" class="svg-ink" font-size="12">routing-options static route</text>
<text x="155" y="116" text-anchor="middle" class="svg-ink" font-size="12">0.0.0.0/0 default</text>
<text x="155" y="142" text-anchor="middle" class="svg-muted" font-size="11">show route table inet.0</text>
<rect x="350" y="20" width="270" height="140" rx="10" fill="#ddd6fe"/><text x="485" y="45" text-anchor="middle" class="svg-ink" font-size="14">inet6.0 (IPv6 unicast)</text>
<text x="485" y="72" text-anchor="middle" class="svg-ink" font-size="12">family inet6 address 2001:db8:12::1/64</text>
<text x="485" y="94" text-anchor="middle" class="svg-ink" font-size="12">rib inet6.0 static route</text>
<text x="485" y="116" text-anchor="middle" class="svg-ink" font-size="12">::/0 default</text>
<text x="485" y="142" text-anchor="middle" class="svg-muted" font-size="11">show route table inet6.0</text>
</svg><p class="cap">Two address families, two tables, same logic.</p></div>

<h3>Configuring IPv6 static routes</h3>
<pre class="code">set interfaces ge-0/0/0 unit 0 family inet6 address 2001:db8:12::1/64
set routing-options rib inet6.0 static route 2001:db8:30::/64 next-hop 2001:db8:12::2
set routing-options rib inet6.0 static route ::/0 next-hop 2001:db8:12::2</pre>
<pre class="out">lab@R1&gt; show route table inet6.0

inet6.0: 5 destinations, 5 routes (5 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

::/0               *[Static/5] 00:00:41
                    &gt;  to 2001:db8:12::2 via ge-0/0/0.0
2001:db8:12::/64   *[Direct/0] 00:09:12
                    &gt;  via ge-0/0/0.0
2001:db8:12::1/128 *[Local/0] 00:09:12
                      Local via ge-0/0/0.0
fe80::/64          *[Direct/0] 00:09:12
                    &gt;  via ge-0/0/0.0
</pre>
<p>Preference 5, <code>discard</code>, <code>reject</code>, <code>qualified-next-hop</code> and <code>preference</code> all work exactly as for IPv4. A link-local address (fe80::) appears automatically on every IPv6 interface; the Local route for your own address is a /128 rather than a /32. Test with <code>ping 2001:db8:30::10</code>.</p>
<table class="cmp"><tr><th>IPv4</th><th>IPv6</th></tr>
<tr><td>inet.0</td><td>inet6.0</td></tr>
<tr><td>routing-options static route</td><td>routing-options rib inet6.0 static route</td></tr>
<tr><td>0.0.0.0/0</td><td>::/0</td></tr>
<tr><td>Local /32</td><td>Local /128</td></tr>
<tr><td>family inet</td><td>family inet6</td></tr></table>

<h3>The resolve keyword</h3>
<p>By default a static next hop must be on a directly connected subnet. If the next hop is farther away, add <code>resolve</code>. Junos then looks up the next hop in the routing table (recursively) to find how to reach it.</p>
<pre class="code">set routing-options static route 203.0.113.0/24 next-hop 10.9.9.9 resolve</pre>
<p>Without resolve, a route with a far next hop stays hidden. With resolve, it becomes active as soon as a route to 10.9.9.9 exists. This is also how static routes can follow a loopback address of another router (a pattern common in larger designs).</p>

<h3>Equal-cost paths and load balancing</h3>
<p>If a route has more than one next hop of equal preference, Junos installs them all in the routing table, but by default the forwarding table uses only one at random for the prefix. To use several next hops, you apply a policy that sets <code>load-balance per-packet</code> to the forwarding table. Despite the name, modern Junos platforms balance <b>per flow</b> (a hash of source, destination and ports), which keeps the packets of one conversation on one path and avoids reordering.</p>
<pre class="code">set policy-options policy-statement LB then load-balance per-packet
set routing-options forwarding-table export LB</pre>
<p>OSPF gives equal-cost multipath on its own when two paths have the same cost (you will see this in the next module: R1 has two next hops to R4's loopback). The same forwarding-table export policy applies there too.</p>
<pre class="out">lab@R1&gt; show route 10.255.4.4

10.255.4.4/32      *[OSPF/10] 00:03:17, metric 2
                    &gt;  to 10.4.12.2 via ge-0/0/0.0
                      to 10.4.13.2 via ge-0/0/1.0
</pre>

<div class="warn"><p><b>Common mistake.</b> Typing an IPv6 static route under <code>routing-options static</code>. That stanza is IPv4 only. IPv6 statics belong under <code>routing-options rib inet6.0 static</code>. Another one: forgetting to configure <code>family inet6</code> on the interface first.</p></div>
<div class="exam"><p><b>Exam trap.</b> Which table holds IPv6 unicast routes? inet6.0, not inet.6 or ipv6.0. What does resolve do? It allows a next hop that is not directly connected, by recursive lookup. What does an equal-cost route give by default in the forwarding table? One next hop, unless a load-balancing policy is exported.</p></div>

<div class="scn"><h4>Dual-stack, half working</h4><p>A new office was brought up with IPv4 and IPv6. Users reached IPv4 sites but IPv6 sites timed out. The engineer had configured the IPv4 default route but not the IPv6 one. show route table inet6.0 showed only Direct and Local routes. One line, <code>set routing-options rib inet6.0 static route ::/0 next-hop 2001:db8:12::2</code>, fixed it.</p><p><b>Lesson:</b> IPv4 and IPv6 are separate worlds on Junos; configure and verify both.</p></div>

<div class="iv"><p class="q">"Where do IPv6 static routes go in Junos and how do they differ from IPv4?"</p><p>They go under routing-options rib inet6.0 static, install in inet6.0, and the default is ::/0. Preference 5, discard, reject and qualified-next-hop behave the same. The interface needs family inet6. Verify with show route table inet6.0 and ping with the IPv6 address.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv6 unicast routes live in inet6.0; statics are under routing-options rib inet6.0 static.</li>
<li>The default IPv6 route is ::/0; Local routes are /128.</li>
<li>resolve allows a static next hop that is not directly connected.</li>
<li>Equal-cost next hops are all installed; load balancing in the forwarding table needs a policy.</li>
<li>Configure and verify IPv4 and IPv6 separately.</li>
</ul></div>
`,hi:`
<p>IPv4 static routing mein jo kuch seekha woh IPv6 par bhi laagu hota hai, kuch naam badalne ke saath. Is chapter mein do extras bhi hain jo exam mention karna pasand karta hai: door ke next hops ke liye <code>resolve</code> keyword, aur jab do routes tie karte hain tab kya hota hai.</p>

<h3>Ek minute mein IPv6</h3>
<p>IPv6 address mein 128 bits hote hain jo hexadecimal mein likhe jaate hain, jaise <code>2001:db8:12::1</code>. <code>::</code> zero groups ke ek run ki jagah lagta hai. Prefix lengths pehle ki tarah chalti hain: <code>2001:db8:30::/64</code> ek /64 network hai. Documentation range 2001:db8::/32 examples ke liye reserved hai, aur default IPv6 route <code>::/0</code> hai.</p>
<p>Junos par IPv6 ki apni address family <code>family inet6</code> aur apni routing table <code>inet6.0</code> hai. Isliye IPv6 static routes routing table ke naam ke neeche configure hote hain.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="inet and inet6 tables">
<rect x="20" y="20" width="270" height="140" rx="10" fill="#bae6fd"/><text x="155" y="45" text-anchor="middle" class="svg-ink" font-size="14">inet.0 (IPv4 unicast)</text>
<text x="155" y="72" text-anchor="middle" class="svg-ink" font-size="12">family inet address 10.1.12.1/30</text>
<text x="155" y="94" text-anchor="middle" class="svg-ink" font-size="12">routing-options static route</text>
<text x="155" y="116" text-anchor="middle" class="svg-ink" font-size="12">0.0.0.0/0 default</text>
<text x="155" y="142" text-anchor="middle" class="svg-muted" font-size="11">show route table inet.0</text>
<rect x="350" y="20" width="270" height="140" rx="10" fill="#ddd6fe"/><text x="485" y="45" text-anchor="middle" class="svg-ink" font-size="14">inet6.0 (IPv6 unicast)</text>
<text x="485" y="72" text-anchor="middle" class="svg-ink" font-size="12">family inet6 address 2001:db8:12::1/64</text>
<text x="485" y="94" text-anchor="middle" class="svg-ink" font-size="12">rib inet6.0 static route</text>
<text x="485" y="116" text-anchor="middle" class="svg-ink" font-size="12">::/0 default</text>
<text x="485" y="142" text-anchor="middle" class="svg-muted" font-size="11">show route table inet6.0</text>
</svg><p class="cap">Do address families, do tables, wahi logic.</p></div>

<h3>IPv6 static routes configure karna</h3>
<pre class="code">set interfaces ge-0/0/0 unit 0 family inet6 address 2001:db8:12::1/64
set routing-options rib inet6.0 static route 2001:db8:30::/64 next-hop 2001:db8:12::2
set routing-options rib inet6.0 static route ::/0 next-hop 2001:db8:12::2</pre>
<pre class="out">lab@R1&gt; show route table inet6.0

inet6.0: 5 destinations, 5 routes (5 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

::/0               *[Static/5] 00:00:41
                    &gt;  to 2001:db8:12::2 via ge-0/0/0.0
2001:db8:12::/64   *[Direct/0] 00:09:12
                    &gt;  via ge-0/0/0.0
2001:db8:12::1/128 *[Local/0] 00:09:12
                      Local via ge-0/0/0.0
fe80::/64          *[Direct/0] 00:09:12
                    &gt;  via ge-0/0/0.0
</pre>
<p>Preference 5, <code>discard</code>, <code>reject</code>, <code>qualified-next-hop</code> aur <code>preference</code> bilkul IPv4 ki tarah chalte hain. Har IPv6 interface par link-local address (fe80::) apne aap aata hai; apne address ka Local route /32 ki jagah /128 hota hai. <code>ping 2001:db8:30::10</code> se test karo.</p>
<table class="cmp"><tr><th>IPv4</th><th>IPv6</th></tr>
<tr><td>inet.0</td><td>inet6.0</td></tr>
<tr><td>routing-options static route</td><td>routing-options rib inet6.0 static route</td></tr>
<tr><td>0.0.0.0/0</td><td>::/0</td></tr>
<tr><td>Local /32</td><td>Local /128</td></tr>
<tr><td>family inet</td><td>family inet6</td></tr></table>

<h3>resolve keyword</h3>
<p>Default mein static next hop directly connected subnet par hona chahiye. Next hop door ho to <code>resolve</code> lagao. Tab Junos next hop ko routing table mein (recursively) dhoondhta hai ki us tak kaise pahunchein.</p>
<pre class="code">set routing-options static route 203.0.113.0/24 next-hop 10.9.9.9 resolve</pre>
<p>Resolve ke bina door next hop wala route hidden rehta hai. Resolve ke saath, 10.9.9.9 ka route milte hi woh active ho jaata hai. Isi tarah static routes kisi doosre router ke loopback address ko follow kar sakte hain (bade designs mein common pattern).</p>

<h3>Equal-cost paths aur load balancing</h3>
<p>Ek route ke ek se zyada barabar preference wale next hops hon to Junos sabko routing table mein install karta hai, lekin default mein forwarding table prefix ke liye random sirf ek use karti hai. Kai next hops use karne ke liye forwarding table par <code>load-balance per-packet</code> set karne wali policy lagate hain. Naam ke bawajood, modern Junos platforms <b>per flow</b> balance karte hain (source, destination aur ports ka hash), jisse ek conversation ke packets ek hi path par rehte hain aur reordering nahi hoti.</p>
<pre class="code">set policy-options policy-statement LB then load-balance per-packet
set routing-options forwarding-table export LB</pre>
<p>OSPF jab do paths ka cost same ho to khud equal-cost multipath deta hai (agle module mein dekhoge: R1 ke R4 ke loopback tak do next hops hain). Wahi forwarding-table export policy wahan bhi lagti hai.</p>
<pre class="out">lab@R1&gt; show route 10.255.4.4

10.255.4.4/32      *[OSPF/10] 00:03:17, metric 2
                    &gt;  to 10.4.12.2 via ge-0/0/0.0
                      to 10.4.13.2 via ge-0/0/1.0
</pre>

<div class="warn"><p><b>Common mistake.</b> IPv6 static route ko <code>routing-options static</code> ke neeche type karna. Woh stanza sirf IPv4 ke liye hai. IPv6 statics <code>routing-options rib inet6.0 static</code> ke neeche jaate hain. Ek aur: pehle interface par <code>family inet6</code> configure karna bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> IPv6 unicast routes kaunsi table mein? inet6.0, inet.6 ya ipv6.0 nahi. Resolve kya karta hai? Recursive lookup se aisa next hop allow karta hai jo directly connected nahi. Equal-cost route forwarding table mein default mein kya deta hai? Ek next hop, jab tak load-balancing policy export na ho.</p></div>

<div class="scn"><h4>Dual-stack, aadha chalta hua</h4><p>Ek naya office IPv4 aur IPv6 dono ke saath up kiya gaya. Users IPv4 sites tak pahunche lekin IPv6 sites time out hui. Engineer ne IPv4 default route configure kiya tha, IPv6 wala nahi. show route table inet6.0 mein sirf Direct aur Local routes the. Ek line, <code>set routing-options rib inet6.0 static route ::/0 next-hop 2001:db8:12::2</code>, ne theek kar diya.</p><p><b>Lesson:</b> Junos par IPv4 aur IPv6 alag duniya hain; dono configure aur verify karo.</p></div>

<div class="iv"><p class="q">"Junos mein IPv6 static routes kahan jaate hain aur IPv4 se kaise alag hain?"</p><p>Woh routing-options rib inet6.0 static ke neeche jaate hain, inet6.0 mein install hote hain, aur default ::/0 hai. Preference 5, discard, reject aur qualified-next-hop wahi tarah chalte hain. Interface par family inet6 chahiye. show route table inet6.0 aur IPv6 address se ping se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv6 unicast routes inet6.0 mein rehte hain; statics routing-options rib inet6.0 static ke neeche.</li>
<li>Default IPv6 route ::/0 hai; Local routes /128 hote hain.</li>
<li>resolve aisa static next hop allow karta hai jo directly connected nahi.</li>
<li>Equal-cost next hops sab install hote hain; forwarding table mein load balancing ke liye policy chahiye.</li>
<li>IPv4 aur IPv6 alag-alag configure aur verify karo.</li>
</ul></div>
`}};export{e as default};