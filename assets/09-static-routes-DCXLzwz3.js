var e={id:`static`,h:{en:`IPv6 static, default and floating routes`,hi:`IPv6 static, default aur floating routes`},body:{en:`
<p>A static route is a signpost you put up by hand at a road junction: "for Mumbai, take the left road". The router follows it without question and never checks whether the road ahead is still open. IPv6 static routes work exactly like IPv4 ones; the new parts are the address format and link-local next hops. This chapter builds lab 3, where three routers connect the head-office network (R1 Loopback0, <code>2001:db8:1::/64</code>) and the data-centre network (R3 Loopback0, <code>2001:db8:3::/64</code>).</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Lab 3 topology">
<rect x="40" y="30" width="120" height="50" rx="8" fill="#bae6fd"/><text x="100" y="52" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="100" y="70" text-anchor="middle" class="svg-muted" font-size="12">Lo0 2001:db8:1::1</text>
<rect x="480" y="30" width="120" height="50" rx="8" fill="#bae6fd"/><text x="540" y="52" text-anchor="middle" class="svg-ink" font-size="14">R3</text><text x="540" y="70" text-anchor="middle" class="svg-muted" font-size="12">Lo0 2001:db8:3::1</text>
<rect x="260" y="170" width="120" height="46" rx="8" fill="#bae6fd"/><text x="320" y="198" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<line x1="100" y1="80" x2="280" y2="170" stroke="#64748b" stroke-width="3"/><text x="130" y="140" class="svg-accent" font-size="12">2001:db8:12::/64</text>
<line x1="540" y1="80" x2="360" y2="170" stroke="#64748b" stroke-width="3"/><text x="430" y="140" class="svg-accent" font-size="12">2001:db8:23::/64</text>
<line x1="160" y1="45" x2="480" y2="45" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6 4"/><text x="320" y="36" text-anchor="middle" class="svg-muted" font-size="12">backup 2001:db8:13::/64</text>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">Link-locals: FE80::1 on R1, FE80::2 on R2, FE80::3 on R3 (all their interfaces)</text>
</svg><p class="cap">Lab 3: primary path R1, R2, R3; slower backup link R1 to R3.</p></div>

<h3>The command</h3>
<pre class="code">ipv6 route <b>prefix/length</b> { next-hop | exit-interface [next-hop] } [administrative-distance]</pre>
<table class="cmp"><tr><th>Type</th><th>Example</th><th>When to use</th></tr>
<tr><td>Recursive (next hop)</td><td><code>ipv6 route 2001:db8:3::/64 2001:db8:12::2</code></td><td>Most common. The router looks up the next hop in its table to find the exit interface.</td></tr>
<tr><td>Directly attached</td><td><code>ipv6 route 2001:db8:3::/64 serial0/0/0</code></td><td>Point-to-point links only. On Ethernet the router would have to resolve every destination itself.</td></tr>
<tr><td>Fully specified</td><td><code>ipv6 route 2001:db8:1::/64 g0/0 fe80::1</code></td><td>Exit interface plus next hop. <b>Required</b> when the next hop is link-local.</td></tr>
<tr><td>Default</td><td><code>ipv6 route ::/0 2001:db8:23::2</code></td><td>Stub routers and Internet edges: everything unknown goes this way.</td></tr>
<tr><td>Host route</td><td><code>ipv6 route 2001:db8:3::1/128 2001:db8:12::2</code></td><td>A single address, for example a server or a loopback.</td></tr>
<tr><td>Floating</td><td><code>ipv6 route 2001:db8:3::/64 2001:db8:13::3 10</code></td><td>Backup with a higher AD; used only when the better route disappears.</td></tr></table>

<h3>Why link-local next hops need an interface</h3>
<p>A link-local address is unique only on its own link. R2 has <code>fe80::1</code> behind G0/0 (R1), and in another design could see <code>fe80::1</code> on every link. If you only typed <code>ipv6 route 2001:db8:1::/64 fe80::1</code>, the router would not know which link to use, so IOS refuses it:</p>
<pre class="out">R2(config)# ipv6 route 2001:db8:1::/64 fe80::1
<span class="hl">% Interface has to be specified for a link-local nexthop</span></pre>
<p>Why use link-local next hops at all? They do not change when you renumber global prefixes, and dynamic IPv6 routing protocols use them too, so the routing table looks the same either way.</p>

<h3>Lab 3 configuration</h3>
<pre class="code"><span class="c">! R1: recursive route via R2, plus a floating backup via R3</span>
R1(config)# ipv6 route 2001:db8:3::/64 2001:db8:12::2
R1(config)# ipv6 route 2001:db8:3::/64 2001:db8:13::3 10
<span class="c">! R2: fully specified routes with link-local next hops</span>
R2(config)# ipv6 route 2001:db8:1::/64 g0/0 fe80::1
R2(config)# ipv6 route 2001:db8:3::/64 g0/1 fe80::3
<span class="c">! R3: stub router, one default route</span>
R3(config)# ipv6 route ::/0 2001:db8:23::2</pre>

<h3>Verification</h3>
<pre class="out">R1# show ipv6 route static
<span class="hl">S   2001:DB8:3::/64 [1/0]
     via 2001:DB8:12::2</span>
R2# show ipv6 route static
S   2001:DB8:1::/64 [1/0]
     via FE80::1, GigabitEthernet0/0
S   2001:DB8:3::/64 [1/0]
     via FE80::3, GigabitEthernet0/1
R3# show ipv6 route static
S   ::/0 [1/0]
     via 2001:DB8:23::2
R1# ping 2001:db8:3::1 source Loopback0
Sending 5, 100-byte ICMP Echos to 2001:DB8:3::1, timeout is 2 seconds:
Packet sent with a source address of 2001:DB8:1::1
!!!!!
<span class="hl">Success rate is 100 percent (5/5)</span>, round-trip min/avg/max = 1/2/4 ms</pre>
<p>The <code>[1/0]</code> is administrative distance 1 (static) and metric 0. The floating route with AD 10 is in the running config but <b>not</b> in the routing table, because the AD 1 route to the same prefix wins. For a detailed lookup, <code>show ipv6 route 2001:db8:3::1</code> shows the matching entry, how it was learned and its next hop.</p>

<div class="eg"><p><b>Worked example: the return path.</b> Why does the ping from Loopback0 need R3's default and R2's route to <code>2001:db8:1::/64</code>? The echo request goes R1 to R2 (R1's static) to R3 (R2's route to <code>2001:db8:3::/64</code>). The reply is sourced from <code>2001:db8:3::1</code> to <code>2001:db8:1::1</code>: R3 sends it via its default to R2, and R2 needs its route to <code>2001:db8:1::/64</code> via <code>fe80::1</code>. Without the <code>source Loopback0</code>, R1 would use its G0/0 address <code>2001:db8:12::1</code>, which R2 knows as connected, and the ping could succeed while real users on the loopback network would fail.</p></div>

<h3>How the floating route takes over</h3>
<p>If R1's G0/0 goes down, the connected route <code>2001:db8:12::/64</code> disappears, the next hop <code>2001:db8:12::2</code> becomes unreachable, and the AD 1 static is removed. The AD 10 route via <code>2001:db8:13::3</code> is installed as <code>S 2001:DB8:3::/64 [10/0]</code>. When G0/0 comes back, the primary returns automatically.</p>

<div class="warn"><p><b>Common mistakes.</b> A link-local next hop without an exit interface; forgetting the return route on the far routers; a floating route whose AD is <b>lower</b> than the primary (it becomes the primary); and typos such as <code>2001:db8:30::/64</code> instead of <code>2001:db8:3::/64</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> Recognise each type from the command: prefix <code>::/0</code> is a default route, <code>/128</code> is a host route, a trailing number like <code>10</code> or <code>200</code> is an AD and makes it floating, and <code>interface + fe80::x</code> is fully specified. <code>ipv6 route 2001:db8:1::/64 fe80::1</code> on its own is rejected.</p></div>

<div class="scn"><h4>The backup route that never woke up</h4><p>A branch had a primary IPv6 static route to the head office via a metro-Ethernet provider, and a floating static with AD 250 via a 4G router. The provider had a fault in its core, and the branch lost IPv6 access to head office for two hours, although the 4G link was fine. <code>show ipv6 route</code> still showed the primary <code>[1/0]</code> route. The branch router's Ethernet port toward the provider's switch stayed up, so the next hop still looked reachable and the static route stayed in the table. The fix was to track the far end: an IP SLA probe tied to the static route, later replaced by a dynamic routing protocol.</p><p><b>Lesson:</b> a floating static only takes over when the primary is withdrawn, and a plain static route is withdrawn only when its next hop or interface disappears locally.</p></div>

<div class="iv"><p class="q">"Why must you give an exit interface when an IPv6 static route uses a link-local next hop?"</p><p>Strong answer: link-local addresses are only unique per link, and the same fe80 address can appear on several interfaces, so the router cannot resolve which link the next hop is on. IOS rejects the route with "Interface has to be specified for a link-local nexthop". The fully specified form, interface plus link-local, fixes that. Add that link-local next hops survive global renumbering, and name the other types: recursive, directly attached, default, host and floating.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Syntax: <code>ipv6 route prefix/len {next-hop | interface [next-hop]} [AD]</code>.</li>
<li>Recursive uses a global next hop; directly attached only on point-to-point; fully specified is required for link-local next hops.</li>
<li><code>::/0</code> is the IPv6 default route; <code>/128</code> is a host route.</li>
<li>A floating static has a higher AD than the primary and appears only when the primary is withdrawn.</li>
<li>Always test with a ping sourced from the real LAN or loopback, and check the return path on the far routers.</li>
</ul></div>
`,hi:`
<p>Static route ek signpost hai jo aap haath se kisi chauraahe par lagate ho: "Mumbai ke liye left wali sadak lo". Router bina sawaal kiye use follow karta hai aur kabhi check nahi karta ki aage ki sadak abhi khuli hai ya nahi. IPv6 static routes bilkul IPv4 wale jaise kaam karte hain; naye hisse address format aur link-local next hops hain. Yeh chapter lab 3 banata hai, jahan teen routers head-office network (R1 Loopback0, <code>2001:db8:1::/64</code>) aur data-centre network (R3 Loopback0, <code>2001:db8:3::/64</code>) ko jodte hain.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Lab 3 topology">
<rect x="40" y="30" width="120" height="50" rx="8" fill="#bae6fd"/><text x="100" y="52" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="100" y="70" text-anchor="middle" class="svg-muted" font-size="12">Lo0 2001:db8:1::1</text>
<rect x="480" y="30" width="120" height="50" rx="8" fill="#bae6fd"/><text x="540" y="52" text-anchor="middle" class="svg-ink" font-size="14">R3</text><text x="540" y="70" text-anchor="middle" class="svg-muted" font-size="12">Lo0 2001:db8:3::1</text>
<rect x="260" y="170" width="120" height="46" rx="8" fill="#bae6fd"/><text x="320" y="198" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<line x1="100" y1="80" x2="280" y2="170" stroke="#64748b" stroke-width="3"/><text x="130" y="140" class="svg-accent" font-size="12">2001:db8:12::/64</text>
<line x1="540" y1="80" x2="360" y2="170" stroke="#64748b" stroke-width="3"/><text x="430" y="140" class="svg-accent" font-size="12">2001:db8:23::/64</text>
<line x1="160" y1="45" x2="480" y2="45" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6 4"/><text x="320" y="36" text-anchor="middle" class="svg-muted" font-size="12">backup 2001:db8:13::/64</text>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">Link-locals: R1 par FE80::1, R2 par FE80::2, R3 par FE80::3 (unke saare interfaces)</text>
</svg><p class="cap">Lab 3: primary path R1, R2, R3; R1 se R3 slow backup link.</p></div>

<h3>Command</h3>
<pre class="code">ipv6 route <b>prefix/length</b> { next-hop | exit-interface [next-hop] } [administrative-distance]</pre>
<table class="cmp"><tr><th>Type</th><th>Example</th><th>Kab use karein</th></tr>
<tr><td>Recursive (next hop)</td><td><code>ipv6 route 2001:db8:3::/64 2001:db8:12::2</code></td><td>Sabse common. Router exit interface dhoondhne ke liye next hop ko apni table mein lookup karta hai.</td></tr>
<tr><td>Directly attached</td><td><code>ipv6 route 2001:db8:3::/64 serial0/0/0</code></td><td>Sirf point-to-point links. Ethernet par router ko har destination khud resolve karna padega.</td></tr>
<tr><td>Fully specified</td><td><code>ipv6 route 2001:db8:1::/64 g0/0 fe80::1</code></td><td>Exit interface plus next hop. Next hop link-local ho to <b>zaroori</b>.</td></tr>
<tr><td>Default</td><td><code>ipv6 route ::/0 2001:db8:23::2</code></td><td>Stub routers aur Internet edges: har anjaana traffic is taraf.</td></tr>
<tr><td>Host route</td><td><code>ipv6 route 2001:db8:3::1/128 2001:db8:12::2</code></td><td>Ek single address, jaise koi server ya loopback.</td></tr>
<tr><td>Floating</td><td><code>ipv6 route 2001:db8:3::/64 2001:db8:13::3 10</code></td><td>Zyada AD wala backup; sirf tab use hota hai jab behtar route gayab ho.</td></tr></table>

<h3>Link-local next hops ko interface kyun chahiye</h3>
<p>Link-local address sirf apne link par unique hota hai. R2 ke G0/0 ke peeche (R1) <code>fe80::1</code> hai, aur kisi doosre design mein use har link par <code>fe80::1</code> dikh sakta hai. Agar aapne sirf <code>ipv6 route 2001:db8:1::/64 fe80::1</code> type kiya, to router ko pata nahi chalega ki kaunsa link use kare, isliye IOS use reject karta hai:</p>
<pre class="out">R2(config)# ipv6 route 2001:db8:1::/64 fe80::1
<span class="hl">% Interface has to be specified for a link-local nexthop</span></pre>
<p>Link-local next hops use hi kyun karein? Global prefixes renumber karne par yeh nahi badalte, aur dynamic IPv6 routing protocols bhi inhe use karte hain, isliye dono tarah routing table ek jaisi dikhti hai.</p>

<h3>Lab 3 configuration</h3>
<pre class="code"><span class="c">! R1: R2 ke through recursive route, plus R3 ke through floating backup</span>
R1(config)# ipv6 route 2001:db8:3::/64 2001:db8:12::2
R1(config)# ipv6 route 2001:db8:3::/64 2001:db8:13::3 10
<span class="c">! R2: link-local next hops ke saath fully specified routes</span>
R2(config)# ipv6 route 2001:db8:1::/64 g0/0 fe80::1
R2(config)# ipv6 route 2001:db8:3::/64 g0/1 fe80::3
<span class="c">! R3: stub router, ek default route</span>
R3(config)# ipv6 route ::/0 2001:db8:23::2</pre>

<h3>Verification</h3>
<pre class="out">R1# show ipv6 route static
<span class="hl">S   2001:DB8:3::/64 [1/0]
     via 2001:DB8:12::2</span>
R2# show ipv6 route static
S   2001:DB8:1::/64 [1/0]
     via FE80::1, GigabitEthernet0/0
S   2001:DB8:3::/64 [1/0]
     via FE80::3, GigabitEthernet0/1
R3# show ipv6 route static
S   ::/0 [1/0]
     via 2001:DB8:23::2
R1# ping 2001:db8:3::1 source Loopback0
Sending 5, 100-byte ICMP Echos to 2001:DB8:3::1, timeout is 2 seconds:
Packet sent with a source address of 2001:DB8:1::1
!!!!!
<span class="hl">Success rate is 100 percent (5/5)</span>, round-trip min/avg/max = 1/2/4 ms</pre>
<p><code>[1/0]</code> administrative distance 1 (static) aur metric 0 hai. AD 10 wala floating route running config mein hai par routing table mein <b>nahi</b>, kyunki same prefix ka AD 1 route jeetta hai. Detailed lookup ke liye <code>show ipv6 route 2001:db8:3::1</code> matching entry, woh kaise seekhi gayi aur uska next hop dikhata hai.</p>

<div class="eg"><p><b>Worked example: return path.</b> Loopback0 se ping ko R3 ka default aur R2 ka <code>2001:db8:1::/64</code> wala route kyun chahiye? Echo request R1 se R2 (R1 ka static) se R3 (R2 ka <code>2001:db8:3::/64</code> wala route) jaati hai. Reply <code>2001:db8:3::1</code> se <code>2001:db8:1::1</code> ko jaata hai: R3 use apne default se R2 ko bhejta hai, aur R2 ko <code>fe80::1</code> ke through <code>2001:db8:1::/64</code> wala route chahiye. <code>source Loopback0</code> ke bina R1 apna G0/0 address <code>2001:db8:12::1</code> use karega, jise R2 connected ki tarah jaanta hai, aur ping succeed ho sakta hai jabki loopback network ke asli users fail honge.</p></div>

<h3>Floating route kaise sambhalta hai</h3>
<p>Agar R1 ka G0/0 down ho jaaye, connected route <code>2001:db8:12::/64</code> gayab ho jaata hai, next hop <code>2001:db8:12::2</code> unreachable ho jaata hai, aur AD 1 static hat jaata hai. <code>2001:db8:13::3</code> ke through AD 10 route <code>S 2001:DB8:3::/64 [10/0]</code> ki tarah install hota hai. G0/0 wapas aane par primary apne aap laut aata hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Bina exit interface ke link-local next hop; door ke routers par return route bhoolna; aisa floating route jiska AD primary se <b>kam</b> ho (woh primary ban jaata hai); aur typos jaise <code>2001:db8:3::/64</code> ki jagah <code>2001:db8:30::/64</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> Command se har type pehchano: prefix <code>::/0</code> default route hai, <code>/128</code> host route hai, end mein <code>10</code> ya <code>200</code> jaisa number AD hai aur use floating banata hai, aur <code>interface + fe80::x</code> fully specified hai. Akela <code>ipv6 route 2001:db8:1::/64 fe80::1</code> reject hota hai.</p></div>

<div class="scn"><h4>Backup route jo kabhi jaaga hi nahi</h4><p>Ek branch ke paas metro-Ethernet provider ke through head office ka primary IPv6 static route tha, aur 4G router ke through AD 250 wala floating static. Provider ke core mein fault aaya, aur branch ka head office tak IPv6 access do ghante band raha, jabki 4G link bilkul theek tha. <code>show ipv6 route</code> abhi bhi primary <code>[1/0]</code> route dikha raha tha. Provider ke switch ki taraf branch router ka Ethernet port up raha, isliye next hop ab bhi reachable lag raha tha aur static route table mein bana raha. Fix tha door ke end ko track karna: static route se juda IP SLA probe, jise baad mein dynamic routing protocol se badla gaya.</p><p><b>Seekh:</b> floating static tabhi sambhalta hai jab primary withdraw ho, aur plain static route tabhi withdraw hota hai jab uska next hop ya interface locally gayab ho.</p></div>

<div class="iv"><p class="q">"Jab IPv6 static route link-local next hop use kare, to exit interface dena kyun zaroori hai?"</p><p>Strong answer: link-local addresses sirf har link par unique hote hain, aur same fe80 address kai interfaces par dikh sakta hai, isliye router tay nahi kar sakta ki next hop kis link par hai. IOS route ko "Interface has to be specified for a link-local nexthop" ke saath reject karta hai. Fully specified form, interface plus link-local, ise theek karta hai. Jodo ki link-local next hops global renumbering mein bache rehte hain, aur baaki types ke naam lo: recursive, directly attached, default, host aur floating.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Syntax: <code>ipv6 route prefix/len {next-hop | interface [next-hop]} [AD]</code>.</li>
<li>Recursive global next hop use karta hai; directly attached sirf point-to-point par; link-local next hops ke liye fully specified zaroori.</li>
<li><code>::/0</code> IPv6 default route hai; <code>/128</code> host route hai.</li>
<li>Floating static ka AD primary se zyada hota hai aur woh tabhi aata hai jab primary withdraw ho.</li>
<li>Hamesha asli LAN ya loopback se sourced ping se test karo, aur door ke routers par return path check karo.</li>
</ul></div>
`}};export{e as default};