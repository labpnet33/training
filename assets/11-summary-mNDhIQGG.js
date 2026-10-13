var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You have gone from "why do we even need IPv6?" to dual-stacking an office and carrying IPv6 across an IPv4-only provider. Use this chapter the way a pilot uses a pre-flight checklist: read each line, and if you cannot do it confidently, go back to the chapter listed.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Explain IPv4 exhaustion and the difference between mitigating it (NAT, CGNAT) and solving it (IPv6). <i>Ch 1</i></li>
<li>Shorten and expand any IPv6 address, spot an invalid double <code>::</code>. <i>Ch 2</i></li>
<li>Explain /48, /56, /64 and /128 and why every LAN is a /64. <i>Ch 2</i></li>
<li>Identify GUA, ULA, link-local, multicast, anycast, loopback and unspecified from the first hex digits. <i>Ch 3</i></li>
<li>Build an EUI-64 interface ID from a MAC, and explain privacy and stable random addresses. <i>Ch 4</i></li>
<li>Name the five ND messages and explain how NS/NA replace ARP and how DAD works. <i>Ch 5</i></li>
<li>Choose between SLAAC, stateless DHCPv6 and stateful DHCPv6 from the M and O flags. <i>Ch 6</i></li>
<li>Dual-stack routers and hosts and verify both protocols separately. <i>Ch 7, Lab 1</i></li>
<li>Write IPv6 static and default routes, including link-local next hops. <i>Ch 8</i></li>
<li>Explain dual stack, 6in4/GRE tunnels and NAT64/DNS64, and build a GRE tunnel for IPv6. <i>Ch 9, Lab 2</i></li>
<li>Troubleshoot hosts with only link-local addresses, missing return routes and tunnel faults. <i>Ch 10</i></li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Address type quick map">
<rect x="10" y="15" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="85" y="37" text-anchor="middle" class="svg-ink" font-size="13">2000::/3</text><text x="85" y="55" text-anchor="middle" class="svg-muted" font-size="12">Global unicast</text>
<rect x="170" y="15" width="150" height="50" rx="8" fill="#bae6fd"/><text x="245" y="37" text-anchor="middle" class="svg-ink" font-size="13">fc00::/7 (fd)</text><text x="245" y="55" text-anchor="middle" class="svg-muted" font-size="12">Unique local</text>
<rect x="330" y="15" width="150" height="50" rx="8" fill="#fde68a"/><text x="405" y="37" text-anchor="middle" class="svg-ink" font-size="13">fe80::/10</text><text x="405" y="55" text-anchor="middle" class="svg-muted" font-size="12">Link-local</text>
<rect x="490" y="15" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="560" y="37" text-anchor="middle" class="svg-ink" font-size="13">ff00::/8</text><text x="560" y="55" text-anchor="middle" class="svg-muted" font-size="12">Multicast</text>
<rect x="10" y="85" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="85" y="107" text-anchor="middle" class="svg-ink" font-size="13">::1/128</text><text x="85" y="125" text-anchor="middle" class="svg-muted" font-size="12">Loopback</text>
<rect x="170" y="85" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="245" y="107" text-anchor="middle" class="svg-ink" font-size="13">::/128</text><text x="245" y="125" text-anchor="middle" class="svg-muted" font-size="12">Unspecified</text>
<rect x="330" y="85" width="150" height="50" rx="8" fill="#fed7aa"/><text x="405" y="107" text-anchor="middle" class="svg-ink" font-size="13">64:ff9b::/96</text><text x="405" y="125" text-anchor="middle" class="svg-muted" font-size="12">NAT64</text>
<rect x="490" y="85" width="140" height="50" rx="8" fill="#fed7aa"/><text x="560" y="107" text-anchor="middle" class="svg-ink" font-size="13">2001:db8::/32</text><text x="560" y="125" text-anchor="middle" class="svg-muted" font-size="12">Documentation</text>
<text x="320" y="175" text-anchor="middle" class="svg-accent" font-size="13">No broadcast. Default route ::/0. Every LAN /64.</text>
</svg><p class="cap">The prefixes most likely to appear on the exam.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Hextet</dt><dd>One 16-bit group of four hex digits; an IPv6 address has eight.</dd>
<dt>Interface ID</dt><dd>The host part, the last 64 bits on a /64.</dd>
<dt>EUI-64</dt><dd>Interface ID made from a MAC: insert FFFE, flip the 7th bit.</dd>
<dt>SLAAC</dt><dd>Stateless address autoconfiguration from the RA prefix.</dd>
<dt>RA / RS</dt><dd>Router Advertisement (134) / Router Solicitation (133).</dd>
<dt>NS / NA</dt><dd>Neighbor Solicitation (135) / Advertisement (136); replace ARP.</dd>
<dt>DAD</dt><dd>Duplicate Address Detection before an address is used.</dd>
<dt>M / O flags</dt><dd>RA flags: Managed (stateful DHCPv6) and Other configuration (stateless DHCPv6).</dd>
<dt>DUID</dt><dd>The identifier DHCPv6 uses for clients instead of the MAC.</dd>
<dt>Dual stack</dt><dd>IPv4 and IPv6 running natively on the same devices.</dd>
<dt>6in4 / GRE</dt><dd>Tunnels carrying IPv6 inside IPv4 (protocol 41 / 47).</dd>
<dt>NAT64 / DNS64</dt><dd>Translation letting IPv6-only clients reach IPv4-only servers, with synthesised AAAA records.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Address size</td><td>128 bits, 8 hextets, hex</td></tr>
<tr><td>Double colon</td><td>Once per address, longest (then leftmost) zero run</td></tr>
<tr><td>Private equivalent</td><td>Unique local fc00::/7 (fd00::/8)</td></tr>
<tr><td>Always present on an interface</td><td>Link-local fe80::/10</td></tr>
<tr><td>All nodes / all routers</td><td>ff02::1 / ff02::2</td></tr>
<tr><td>DHCPv6 ports and group</td><td>UDP 546 client, 547 server; ff02::1:2</td></tr>
<tr><td>Default gateway source</td><td>Router link-local from the RA, never DHCPv6</td></tr>
<tr><td>Default route</td><td>::/0</td></tr>
<tr><td>NAT64 well-known prefix</td><td>64:ff9b::/96</td></tr>
<tr><td>Tunnel protocol numbers</td><td>6in4 = 41, GRE = 47</td></tr>
<tr><td>Minimum IPv6 MTU</td><td>1280 bytes; routers do not fragment</td></tr>
<tr><td>Shared address space for CGNAT</td><td>100.64.0.0/10</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Router</span>
ipv6 unicast-routing
interface g0/0
 ipv6 address 2001:db8:acad:10::1/64
 ipv6 address 2001:db8:acad:10::/64 eui-64
 ipv6 address fe80::1 link-local
 ipv6 nd other-config-flag | ipv6 nd managed-config-flag
ipv6 route ::/0 2001:db8:acad:12::2
interface tunnel0
 ipv6 address 2001:db8:acad:99::1/64
 tunnel source g0/1
 tunnel destination 198.51.100.1
show ipv6 interface brief | show ipv6 route | show ipv6 neighbors
<span class="c">! Lab hosts</span>
ip auto | ip 2001:db8:acad:20::10/64 2001:db8:acad:20::1 | show ipv6 | ping | trace
<span class="c">! Windows / Linux</span>
ipconfig | ping -6 | tracert -6 | netsh interface ipv6 show neighbors
ip -6 addr | ip -6 route | ip -6 neigh | ping -6 (ping6) | traceroute -6</pre>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> Two <code>::</code> in one address; removing trailing zeros; thinking DHCPv6 gives the gateway; forgetting the route back; confusing ULA with link-local; thinking tunnels translate.</p></div>

<div class="exam"><p><b>Exam strategy.</b> For "which address type" questions, look only at the first hex digits. For "which coexistence method" questions, ask who is IPv6-only: an IPv6-only client reaching IPv4 needs NAT64/DNS64; IPv6 islands across IPv4 need a tunnel; everything capable of both means dual stack.</p></div>

<div class="scn"><h4>The interview whiteboard</h4><p>A candidate for a network support role was asked to draw how a new laptop gets online over IPv6. She drew the laptop creating a link-local address and running DAD, sending an RS to ff02::2, receiving an RA with a /64 prefix and the M and O flags, building SLAAC addresses, taking the router's link-local as gateway, then asking DNS for a AAAA record and resolving the gateway's MAC with NS/NA. She finished by noting that if the site were IPv6-only, DNS64 and NAT64 would handle IPv4-only websites. She got the job.</p><p><b>Lesson:</b> if you can tell the whole story of one host joining the network, you understand this module.</p></div>

<div class="iv"><p class="q">"Walk me through what happens when an IPv6 host connects to a network."</p><p>Strong answer: link-local address and DAD, RS to all routers, RA with prefix, lifetime and M/O flags, SLAAC (or DHCPv6 if M=1, DNS via DHCPv6 if O=1 or RDNSS), default gateway = router link-local, NS/NA to resolve MACs, AAAA lookups and IPv6 preferred with Happy Eyeballs fallback. Keep it in order and name the message types.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv6 solves IPv4 exhaustion; NAT and CGNAT only mitigate it.</li>
<li>Know the shortening rules, the /64 rule and every address type by prefix.</li>
<li>ND (ICMPv6) replaces ARP; RAs give prefix, flags and the link-local gateway.</li>
<li>SLAAC, stateless and stateful DHCPv6 are selected by the M and O flags.</li>
<li>Coexistence: dual stack (preferred), 6in4/GRE tunnels, NAT64 + DNS64.</li>
</ul></div>
`,hi:`
<p>Aap "IPv6 ki zaroorat hi kyun hai?" se shuru karke ek office ko dual-stack karne aur IPv4-only provider ke paar IPv6 le jaane tak pahunch gaye ho. Is chapter ko waise use karo jaise pilot pre-flight checklist use karta hai: har line padho, aur agar aap use confidently nahi kar sakte, to list mein diye chapter par wapas jao.</p>

<h3>Can-do checklist</h3>
<ul>
<li>IPv4 exhaustion samjhao aur use kam karne (NAT, CGNAT) aur solve karne (IPv6) ka farak batao. <i>Ch 1</i></li>
<li>Koi bhi IPv6 address chhota aur expand karo, invalid double <code>::</code> pakdo. <i>Ch 2</i></li>
<li>/48, /56, /64 aur /128 samjhao aur batao ki har LAN /64 kyun hai. <i>Ch 2</i></li>
<li>Pehle hex digits se GUA, ULA, link-local, multicast, anycast, loopback aur unspecified pehchano. <i>Ch 3</i></li>
<li>MAC se EUI-64 interface ID banao, aur privacy aur stable random addresses samjhao. <i>Ch 4</i></li>
<li>Paanch ND messages ke naam lo aur samjhao ki NS/NA ARP ki jagah kaise lete hain aur DAD kaise kaam karta hai. <i>Ch 5</i></li>
<li>M aur O flags se SLAAC, stateless DHCPv6 aur stateful DHCPv6 mein se chuno. <i>Ch 6</i></li>
<li>Routers aur hosts ko dual-stack karo aur dono protocols alag alag verify karo. <i>Ch 7, Lab 1</i></li>
<li>Link-local next hops samet IPv6 static aur default routes likho. <i>Ch 8</i></li>
<li>Dual stack, 6in4/GRE tunnels aur NAT64/DNS64 samjhao, aur IPv6 ke liye GRE tunnel banao. <i>Ch 9, Lab 2</i></li>
<li>Sirf link-local wale hosts, missing return routes aur tunnel faults troubleshoot karo. <i>Ch 10</i></li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Address types ka quick map">
<rect x="10" y="15" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="85" y="37" text-anchor="middle" class="svg-ink" font-size="13">2000::/3</text><text x="85" y="55" text-anchor="middle" class="svg-muted" font-size="12">Global unicast</text>
<rect x="170" y="15" width="150" height="50" rx="8" fill="#bae6fd"/><text x="245" y="37" text-anchor="middle" class="svg-ink" font-size="13">fc00::/7 (fd)</text><text x="245" y="55" text-anchor="middle" class="svg-muted" font-size="12">Unique local</text>
<rect x="330" y="15" width="150" height="50" rx="8" fill="#fde68a"/><text x="405" y="37" text-anchor="middle" class="svg-ink" font-size="13">fe80::/10</text><text x="405" y="55" text-anchor="middle" class="svg-muted" font-size="12">Link-local</text>
<rect x="490" y="15" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="560" y="37" text-anchor="middle" class="svg-ink" font-size="13">ff00::/8</text><text x="560" y="55" text-anchor="middle" class="svg-muted" font-size="12">Multicast</text>
<rect x="10" y="85" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="85" y="107" text-anchor="middle" class="svg-ink" font-size="13">::1/128</text><text x="85" y="125" text-anchor="middle" class="svg-muted" font-size="12">Loopback</text>
<rect x="170" y="85" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="245" y="107" text-anchor="middle" class="svg-ink" font-size="13">::/128</text><text x="245" y="125" text-anchor="middle" class="svg-muted" font-size="12">Unspecified</text>
<rect x="330" y="85" width="150" height="50" rx="8" fill="#fed7aa"/><text x="405" y="107" text-anchor="middle" class="svg-ink" font-size="13">64:ff9b::/96</text><text x="405" y="125" text-anchor="middle" class="svg-muted" font-size="12">NAT64</text>
<rect x="490" y="85" width="140" height="50" rx="8" fill="#fed7aa"/><text x="560" y="107" text-anchor="middle" class="svg-ink" font-size="13">2001:db8::/32</text><text x="560" y="125" text-anchor="middle" class="svg-muted" font-size="12">Documentation</text>
<text x="320" y="175" text-anchor="middle" class="svg-accent" font-size="13">Broadcast nahi. Default route ::/0. Har LAN /64.</text>
</svg><p class="cap">Woh prefixes jo exam mein sabse zyada aane ki sambhavna hai.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Hextet</dt><dd>Chaar hex digits ka ek 16-bit group; IPv6 address mein aath hote hain.</dd>
<dt>Interface ID</dt><dd>Host wala hissa, /64 par aakhri 64 bits.</dd>
<dt>EUI-64</dt><dd>MAC se bana interface ID: FFFE daalo, 7th bit flip karo.</dd>
<dt>SLAAC</dt><dd>RA prefix se stateless address autoconfiguration.</dd>
<dt>RA / RS</dt><dd>Router Advertisement (134) / Router Solicitation (133).</dd>
<dt>NS / NA</dt><dd>Neighbor Solicitation (135) / Advertisement (136); ARP ki jagah lete hain.</dd>
<dt>DAD</dt><dd>Address use hone se pehle Duplicate Address Detection.</dd>
<dt>M / O flags</dt><dd>RA flags: Managed (stateful DHCPv6) aur Other configuration (stateless DHCPv6).</dd>
<dt>DUID</dt><dd>Woh identifier jo DHCPv6 clients ke liye MAC ki jagah use karta hai.</dd>
<dt>Dual stack</dt><dd>Same devices par IPv4 aur IPv6 natively chalna.</dd>
<dt>6in4 / GRE</dt><dd>IPv6 ko IPv4 ke andar le jaane wale tunnels (protocol 41 / 47).</dd>
<dt>NAT64 / DNS64</dt><dd>Translation jo IPv6-only clients ko IPv4-only servers tak pahunchata hai, synthesised AAAA records ke saath.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Address size</td><td>128 bits, 8 hextets, hex</td></tr>
<tr><td>Double colon</td><td>Ek address mein ek baar, sabse lamba (phir sabse left) zero run</td></tr>
<tr><td>Private ke barabar</td><td>Unique local fc00::/7 (fd00::/8)</td></tr>
<tr><td>Interface par hamesha hota hai</td><td>Link-local fe80::/10</td></tr>
<tr><td>All nodes / all routers</td><td>ff02::1 / ff02::2</td></tr>
<tr><td>DHCPv6 ports aur group</td><td>UDP 546 client, 547 server; ff02::1:2</td></tr>
<tr><td>Default gateway ka source</td><td>RA wala router link-local, DHCPv6 kabhi nahi</td></tr>
<tr><td>Default route</td><td>::/0</td></tr>
<tr><td>NAT64 well-known prefix</td><td>64:ff9b::/96</td></tr>
<tr><td>Tunnel protocol numbers</td><td>6in4 = 41, GRE = 47</td></tr>
<tr><td>Minimum IPv6 MTU</td><td>1280 bytes; routers fragment nahi karte</td></tr>
<tr><td>CGNAT ka shared address space</td><td>100.64.0.0/10</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Router</span>
ipv6 unicast-routing
interface g0/0
 ipv6 address 2001:db8:acad:10::1/64
 ipv6 address 2001:db8:acad:10::/64 eui-64
 ipv6 address fe80::1 link-local
 ipv6 nd other-config-flag | ipv6 nd managed-config-flag
ipv6 route ::/0 2001:db8:acad:12::2
interface tunnel0
 ipv6 address 2001:db8:acad:99::1/64
 tunnel source g0/1
 tunnel destination 198.51.100.1
show ipv6 interface brief | show ipv6 route | show ipv6 neighbors
<span class="c">! Lab hosts</span>
ip auto | ip 2001:db8:acad:20::10/64 2001:db8:acad:20::1 | show ipv6 | ping | trace
<span class="c">! Windows / Linux</span>
ipconfig | ping -6 | tracert -6 | netsh interface ipv6 show neighbors
ip -6 addr | ip -6 route | ip -6 neigh | ping -6 (ping6) | traceroute -6</pre>

<div class="warn"><p><b>Aakhri minute ki galtiyan jinse bachna hai.</b> Ek address mein do <code>::</code>; peechhe ke zero hatana; sochna ki DHCPv6 gateway deta hai; wapas ka route bhoolna; ULA ko link-local se confuse karna; sochna ki tunnels translate karte hain.</p></div>

<div class="exam"><p><b>Exam strategy.</b> "Kaunsa address type" wale sawaalon mein sirf pehle hex digits dekho. "Kaunsa coexistence method" wale sawaalon mein poochho ki IPv6-only kaun hai: IPv4 tak pahunchne wale IPv6-only client ko NAT64/DNS64 chahiye; IPv4 ke paar IPv6 islands ko tunnel chahiye; sab kuch dono chala sake to dual stack.</p></div>

<div class="scn"><h4>Interview ka whiteboard</h4><p>Network support role ki ek candidate se kaha gaya ki draw karo ek naya laptop IPv6 par online kaise hota hai. Usne draw kiya ki laptop link-local address banata hai aur DAD chalata hai, ff02::2 ko RS bhejta hai, /64 prefix aur M aur O flags wala RA paata hai, SLAAC addresses banata hai, router ke link-local ko gateway banata hai, phir DNS se AAAA record maangta hai aur NS/NA se gateway ka MAC resolve karta hai. Aakhir mein usne bataya ki agar site IPv6-only hoti, to DNS64 aur NAT64 IPv4-only websites sambhal lete. Use job mil gayi.</p><p><b>Seekh:</b> agar aap ek host ke network join karne ki poori kahani suna sakte ho, to aap yeh module samajh gaye ho.</p></div>

<div class="iv"><p class="q">"Batao jab IPv6 host network se connect hota hai to kya hota hai."</p><p>Strong answer: link-local address aur DAD, saare routers ko RS, prefix, lifetime aur M/O flags wala RA, SLAAC (ya M=1 ho to DHCPv6, O=1 ho to DNS DHCPv6 se ya RDNSS se), default gateway = router link-local, MACs resolve karne ke liye NS/NA, AAAA lookups aur Happy Eyeballs fallback ke saath IPv6 preferred. Order mein batao aur message types ke naam lo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv6 IPv4 exhaustion solve karta hai; NAT aur CGNAT sirf kam karte hain.</li>
<li>Shortening rules, /64 rule aur har address type ka prefix yaad rakho.</li>
<li>ND (ICMPv6) ARP ki jagah leta hai; RAs prefix, flags aur link-local gateway dete hain.</li>
<li>SLAAC, stateless aur stateful DHCPv6 M aur O flags se chune jaate hain.</li>
<li>Coexistence: dual stack (preferred), 6in4/GRE tunnels, NAT64 + DNS64.</li>
</ul></div>
`}};export{e as default};