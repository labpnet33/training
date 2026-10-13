var e={id:`types`,h:{en:`IPv6 address types: unicast, anycast and multicast`,hi:`IPv6 address types: unicast, anycast aur multicast`},body:{en:`
<p>In a large office you have a personal desk phone number that works from anywhere (global), an internal extension that only works inside the building (unique local), an intercom button that only reaches the person in the next cabin (link-local), a helpdesk number that rings whichever agent is nearest (anycast), and a paging system that speaks to a whole group (multicast). IPv6 has exactly these address families, and every interface has more than one of them at the same time.</p>

<h3>Three delivery models</h3>
<ul>
<li><b>Unicast</b>: one sender to one specific interface.</li>
<li><b>Anycast</b>: one address configured on several devices; the network delivers to the <b>nearest</b> one according to routing.</li>
<li><b>Multicast</b>: one sender to every interface that joined a group. This replaces broadcast, which IPv6 does not have.</li>
</ul>

<h3>The unicast types</h3>
<dl class="terms">
<dt>Global unicast address (GUA)</dt><dd>Routable on the Internet, like a public IPv4 address. Currently assigned from <code>2000::/3</code>, so a GUA starts with hex <b>2</b> or <b>3</b>. The block <code>2001:db8::/32</code> is reserved for documentation and labs, which is why every example in this module uses it.</dd>
<dt>Unique local address (ULA)</dt><dd><code>fc00::/7</code>; in practice always <code>fd00::/8</code>, followed by a 40-bit <b>random</b> global ID, a 16-bit subnet ID and a 64-bit interface ID. Used inside an organisation and never routed on the Internet, similar in spirit to RFC 1918 space. The random ID makes collisions unlikely when two companies merge.</dd>
<dt>Link-local address (LLA)</dt><dd><code>fe80::/10</code>, in practice <code>fe80::/64</code>. Created <b>automatically</b> as soon as IPv6 is enabled on an interface. Valid only on that link; routers never forward packets with a link-local source or destination. Neighbor Discovery, router advertisements and the hosts' <b>default gateway</b> all use link-local addresses.</dd>
<dt>Loopback</dt><dd><code>::1/128</code>, the device talking to itself, like 127.0.0.1.</dd>
<dt>Unspecified</dt><dd><code>::/128</code>, all zeros. Used as a source address before a host has an address, for example during Duplicate Address Detection. Do not confuse it with <code>::/0</code>, the default route prefix.</dd>
</dl>
<p>You may also meet <b>IPv4-mapped</b> addresses <code>::ffff:0:0/96</code> (for example <code>::ffff:192.0.2.10</code>), which dual-stack software uses to represent an IPv4 address inside an IPv6 socket. The old site-local range <code>fec0::/10</code> is deprecated.</p>

<h3>Anycast</h3>
<p>An anycast address looks like any unicast address; the difference is that several devices own it. Public DNS resolvers use this: the same address is announced from many cities, and routing sends you to the closest. On IOS you mark it so the router skips Duplicate Address Detection: <code>ipv6 address 2001:db8:ffff::53/128 anycast</code>. Every router also automatically joins the <b>subnet-router anycast</b> address of each of its prefixes: the prefix with an all-zero interface ID, for example <code>2001:db8:acad:12::</code>.</p>

<h3>Multicast</h3>
<p>Multicast addresses start with <code>ff</code>. The next hex digit holds flags, and the one after that is the <b>scope</b>: 1 interface-local, <b>2 link-local</b>, 5 site-local, 8 organisation-local, e global. The groups you must know:</p>
<table class="cmp"><tr><th>Group</th><th>Meaning</th></tr>
<tr><td><code>ff02::1</code></td><td>All nodes on the link (the closest thing to a broadcast)</td></tr>
<tr><td><code>ff02::2</code></td><td>All routers on the link (joined when <code>ipv6 unicast-routing</code> is on)</td></tr>
<tr><td><code>ff02::5</code> / <code>ff02::6</code></td><td>OSPFv3 routers / designated routers</td></tr>
<tr><td><code>ff02::9</code> / <code>ff02::a</code></td><td>RIPng / EIGRP for IPv6</td></tr>
<tr><td><code>ff02::1:2</code></td><td>All DHCPv6 servers and relay agents</td></tr>
<tr><td><code>ff02::1:ffxx:xxxx</code></td><td>Solicited-node group for one address</td></tr></table>

<h3>Solicited-node multicast: how IPv6 avoids broadcast</h3>
<p>To find a neighbour's MAC, IPv4 ARP shouts to everyone. IPv6 instead sends the question to a <b>solicited-node multicast</b> group that, in practice, only the target has joined. The group is <code>ff02::1:ff</code> followed by the <b>last 24 bits</b> (last six hex digits) of the unicast address. Every interface joins one such group for each of its unicast and anycast addresses. On Ethernet, an IPv6 multicast maps to a MAC starting with <code>33:33</code> followed by the last 32 bits of the group, so switches and NICs can filter it cheaply.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Solicited-node calculation">
<rect x="20" y="20" width="600" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">2001:db8:cafe:1:5054:cff:fe<tspan class="svg-accent">04:4b01</tspan></text>
<text x="320" y="76" text-anchor="middle" class="svg-muted" font-size="12">take the last 24 bits (6 hex digits)</text>
<rect x="120" y="86" width="400" height="34" rx="6" fill="#ddd6fe"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="13">ff02::1:ff<tspan class="svg-accent">04:4b01</tspan></text>
<text x="320" y="142" text-anchor="middle" class="svg-muted" font-size="12">33:33 + last 32 bits of the group</text>
<rect x="170" y="150" width="300" height="32" rx="6" fill="#fde68a"/><text x="320" y="171" text-anchor="middle" class="svg-ink" font-size="13">MAC 3333.ff04.4b01</text>
</svg><p class="cap">R1's EUI-64 address from lab 2, its solicited-node group and the Ethernet multicast MAC.</p></div>

<div class="eg"><p><b>Worked example.</b> R1 in lab 1 has <code>2001:db8:acad:12::1</code> and link-local <code>fe80::1</code> on G0/0. The last 24 bits of both are <code>00:0001</code>, so both map to the same group <code>ff02::1:ff00:1</code>. The joined groups on that interface are therefore <code>FF02::1</code> (all nodes), <code>FF02::2</code> (all routers, because IPv6 routing is enabled) and <code>FF02::1:FF00:1</code>.</p></div>
<pre class="out">R1# show ipv6 interface g0/0
GigabitEthernet0/0 is up, line protocol is up
  IPv6 is enabled, link-local address is FE80::1
  Global unicast address(es):
    2001:DB8:ACAD:12::1, subnet is 2001:DB8:ACAD:12::/64
  Joined group address(es):
<span class="hl">    FF02::1
    FF02::2
    FF02::1:FF00:1</span></pre>

<div class="warn"><p><b>Common mistake.</b> Assuming a link-local address is useless because it is "not routable". It is the most used address on the link: every ND message, every RA and every host's default gateway use it.</p></div>

<div class="exam"><p><b>Exam trap.</b> Know the prefixes cold: GUA <code>2000::/3</code>, ULA <code>fc00::/7</code> (<code>fd</code>), LLA <code>fe80::/10</code>, multicast <code>ff00::/8</code>, loopback <code>::1</code>, unspecified <code>::</code>. A question may show <code>fe80::a</code> and ask whether it can be the destination of a routed packet to another subnet: it cannot. And there is no "broadcast" option in IPv6.</p></div>

<div class="scn"><h4>The app that only worked on one VLAN</h4><p>A developer tested a new service and copied the server's address from <code>ipconfig</code> into the application config: <code>fe80::a1b2:3c4d:5e6f:7</code>. Clients in the same VLAN connected, but clients on every other subnet failed. The network engineer saw the <code>fe80</code> prefix immediately: a link-local address is only valid on its own link, and routers never forward it. The server's global address was put in DNS and the config instead, and every subnet could connect.</p><p><b>Lesson:</b> read the first hextet before using any IPv6 address. <code>fe80</code> means "this wire only".</p></div>

<div class="iv"><p class="q">"What is a solicited-node multicast address, and why does IPv6 use it?"</p><p>Strong answer: it is <code>ff02::1:ff</code> plus the last 24 bits of a unicast address. Each interface joins it for every address it owns. Neighbor Solicitations for address resolution and DAD are sent to it instead of to everyone, so only the target (and the rare device sharing those 24 bits) processes the message, unlike ARP broadcasts. Mention the 33:33 MAC mapping that lets NICs filter in hardware.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Unicast: GUA 2000::/3, ULA fc00::/7 (fd00::/8), LLA fe80::/10, loopback ::1, unspecified ::.</li>
<li>Every IPv6 interface has a link-local address; ND and default gateways use it.</li>
<li>Anycast is a unicast-format address on several devices; routing delivers to the nearest.</li>
<li>Multicast is ff00::/8; know ff02::1, ff02::2, ff02::1:2 and the solicited-node ff02::1:ffxx:xxxx.</li>
<li>Solicited-node = ff02::1:ff + last 24 bits; on Ethernet it maps to MAC 33:33 + last 32 bits.</li>
</ul></div>
`,hi:`
<p>Bade office mein aapka ek personal desk phone number hota hai jo kahin se bhi kaam karta hai (global), ek internal extension jo sirf building ke andar chalta hai (unique local), ek intercom button jo sirf agle cabin wale tak pahunchta hai (link-local), ek helpdesk number jo sabse paas wale agent ko ring karta hai (anycast), aur ek paging system jo poore group se baat karta hai (multicast). IPv6 mein bilkul yahi address families hain, aur har interface par ek hi samay mein inmein se ek se zyada hote hain.</p>

<h3>Teen delivery models</h3>
<ul>
<li><b>Unicast</b>: ek sender se ek specific interface tak.</li>
<li><b>Anycast</b>: ek address kai devices par configured; network routing ke hisaab se <b>sabse paas</b> wale ko deliver karta hai.</li>
<li><b>Multicast</b>: ek sender se har us interface tak jisne group join kiya. Yeh broadcast ki jagah leta hai, jo IPv6 mein hai hi nahi.</li>
</ul>

<h3>Unicast types</h3>
<dl class="terms">
<dt>Global unicast address (GUA)</dt><dd>Internet par routable, public IPv4 address jaisa. Abhi <code>2000::/3</code> se assign hota hai, isliye GUA hex <b>2</b> ya <b>3</b> se shuru hota hai. Block <code>2001:db8::/32</code> documentation aur labs ke liye reserved hai, isiliye is module ka har example ise use karta hai.</dd>
<dt>Unique local address (ULA)</dt><dd><code>fc00::/7</code>; practically hamesha <code>fd00::/8</code>, uske baad 40-bit <b>random</b> global ID, 16-bit subnet ID aur 64-bit interface ID. Organisation ke andar use hota hai aur Internet par kabhi route nahi hota, idea mein RFC 1918 space jaisa. Random ID ki wajah se do companies merge hon to collision ki sambhavna kam hoti hai.</dd>
<dt>Link-local address (LLA)</dt><dd><code>fe80::/10</code>, practically <code>fe80::/64</code>. Interface par IPv6 enable hote hi <b>apne aap</b> ban jaata hai. Sirf usi link par valid; routers link-local source ya destination wale packets kabhi forward nahi karte. Neighbor Discovery, router advertisements aur hosts ka <b>default gateway</b> sab link-local addresses use karte hain.</dd>
<dt>Loopback</dt><dd><code>::1/128</code>, device apne aap se baat karta hai, 127.0.0.1 jaisa.</dd>
<dt>Unspecified</dt><dd><code>::/128</code>, sab zeros. Jab host ke paas address nahi hota tab source ki tarah use hota hai, jaise Duplicate Address Detection ke dauraan. Ise <code>::/0</code> se confuse mat karo, jo default route prefix hai.</dd>
</dl>
<p>Aapko <b>IPv4-mapped</b> addresses <code>::ffff:0:0/96</code> bhi mil sakte hain (jaise <code>::ffff:192.0.2.10</code>), jinhe dual-stack software IPv6 socket ke andar IPv4 address dikhane ke liye use karta hai. Purani site-local range <code>fec0::/10</code> deprecated hai.</p>

<h3>Anycast</h3>
<p>Anycast address kisi bhi unicast address jaisa dikhta hai; fark yeh hai ki kai devices uske maalik hain. Public DNS resolvers yeh use karte hain: same address kai shehron se announce hota hai, aur routing aapko sabse paas wale tak bhejti hai. IOS par aap ise mark karte ho taaki router Duplicate Address Detection skip kare: <code>ipv6 address 2001:db8:ffff::53/128 anycast</code>. Har router apne har prefix ka <b>subnet-router anycast</b> address bhi apne aap join karta hai: all-zero interface ID wala prefix, jaise <code>2001:db8:acad:12::</code>.</p>

<h3>Multicast</h3>
<p>Multicast addresses <code>ff</code> se shuru hote hain. Agla hex digit flags rakhta hai, aur uske baad wala <b>scope</b> hai: 1 interface-local, <b>2 link-local</b>, 5 site-local, 8 organisation-local, e global. Jo groups aapko pata hone chahiye:</p>
<table class="cmp"><tr><th>Group</th><th>Matlab</th></tr>
<tr><td><code>ff02::1</code></td><td>Link par saare nodes (broadcast ke sabse kareeb)</td></tr>
<tr><td><code>ff02::2</code></td><td>Link par saare routers (<code>ipv6 unicast-routing</code> on hone par join hota hai)</td></tr>
<tr><td><code>ff02::5</code> / <code>ff02::6</code></td><td>OSPFv3 routers / designated routers</td></tr>
<tr><td><code>ff02::9</code> / <code>ff02::a</code></td><td>RIPng / EIGRP for IPv6</td></tr>
<tr><td><code>ff02::1:2</code></td><td>Saare DHCPv6 servers aur relay agents</td></tr>
<tr><td><code>ff02::1:ffxx:xxxx</code></td><td>Ek address ka solicited-node group</td></tr></table>

<h3>Solicited-node multicast: IPv6 broadcast se kaise bachta hai</h3>
<p>Neighbour ka MAC dhoondhne ke liye IPv4 ARP sabko chillata hai. IPv6 iski jagah sawaal ek <b>solicited-node multicast</b> group ko bhejta hai jise practically sirf target ne join kiya hota hai. Group hai <code>ff02::1:ff</code> ke baad unicast address ke <b>aakhri 24 bits</b> (aakhri chhe hex digits). Har interface apne har unicast aur anycast address ke liye aisa ek group join karta hai. Ethernet par IPv6 multicast ek aise MAC par map hota hai jo <code>33:33</code> se shuru hota hai aur uske baad group ke aakhri 32 bits, taaki switches aur NICs ise sasti tarah filter kar sakein.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Solicited-node calculation">
<rect x="20" y="20" width="600" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">2001:db8:cafe:1:5054:cff:fe<tspan class="svg-accent">04:4b01</tspan></text>
<text x="320" y="76" text-anchor="middle" class="svg-muted" font-size="12">aakhri 24 bits lo (6 hex digits)</text>
<rect x="120" y="86" width="400" height="34" rx="6" fill="#ddd6fe"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="13">ff02::1:ff<tspan class="svg-accent">04:4b01</tspan></text>
<text x="320" y="142" text-anchor="middle" class="svg-muted" font-size="12">33:33 + group ke aakhri 32 bits</text>
<rect x="170" y="150" width="300" height="32" rx="6" fill="#fde68a"/><text x="320" y="171" text-anchor="middle" class="svg-ink" font-size="13">MAC 3333.ff04.4b01</text>
</svg><p class="cap">Lab 2 se R1 ka EUI-64 address, uska solicited-node group aur Ethernet multicast MAC.</p></div>

<div class="eg"><p><b>Worked example.</b> Lab 1 mein R1 ke G0/0 par <code>2001:db8:acad:12::1</code> aur link-local <code>fe80::1</code> hai. Dono ke aakhri 24 bits <code>00:0001</code> hain, isliye dono same group <code>ff02::1:ff00:1</code> par map hote hain. Is interface ke joined groups isliye <code>FF02::1</code> (all nodes), <code>FF02::2</code> (all routers, kyunki IPv6 routing enabled hai) aur <code>FF02::1:FF00:1</code> hain.</p></div>
<pre class="out">R1# show ipv6 interface g0/0
GigabitEthernet0/0 is up, line protocol is up
  IPv6 is enabled, link-local address is FE80::1
  Global unicast address(es):
    2001:DB8:ACAD:12::1, subnet is 2001:DB8:ACAD:12::/64
  Joined group address(es):
<span class="hl">    FF02::1
    FF02::2
    FF02::1:FF00:1</span></pre>

<div class="warn"><p><b>Common galti.</b> Yeh maan lena ki link-local address bekaar hai kyunki woh "routable nahi" hai. Link par sabse zyada yahi address use hota hai: har ND message, har RA aur har host ka default gateway ise use karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Prefixes zubaani yaad rakho: GUA <code>2000::/3</code>, ULA <code>fc00::/7</code> (<code>fd</code>), LLA <code>fe80::/10</code>, multicast <code>ff00::/8</code>, loopback <code>::1</code>, unspecified <code>::</code>. Question <code>fe80::a</code> dikha kar pooch sakta hai ki kya yeh doosre subnet ko routed packet ka destination ho sakta hai: nahi ho sakta. Aur IPv6 mein "broadcast" ka koi option nahi hai.</p></div>

<div class="scn"><h4>App jo sirf ek VLAN par chalti thi</h4><p>Ek developer ne nayi service test ki aur server ka address <code>ipconfig</code> se application config mein copy kar diya: <code>fe80::a1b2:3c4d:5e6f:7</code>. Same VLAN ke clients connect ho gaye, par baaki har subnet ke clients fail hue. Network engineer ne <code>fe80</code> prefix turant dekh liya: link-local address sirf apne link par valid hota hai, aur routers use kabhi forward nahi karte. Iski jagah server ka global address DNS aur config mein daala gaya, aur har subnet connect kar paaya.</p><p><b>Seekh:</b> koi bhi IPv6 address use karne se pehle pehla hextet padho. <code>fe80</code> ka matlab hai "sirf yeh wire".</p></div>

<div class="iv"><p class="q">"Solicited-node multicast address kya hai, aur IPv6 ise kyun use karta hai?"</p><p>Strong answer: yeh <code>ff02::1:ff</code> plus unicast address ke aakhri 24 bits hai. Har interface apne har address ke liye ise join karta hai. Address resolution aur DAD ke Neighbor Solicitations sabko bhejne ki jagah isko bheje jaate hain, isliye ARP broadcasts ke ulat sirf target (aur woh rare device jo same 24 bits share kare) message process karta hai. 33:33 MAC mapping bhi batao jisse NICs hardware mein filter kar paate hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Unicast: GUA 2000::/3, ULA fc00::/7 (fd00::/8), LLA fe80::/10, loopback ::1, unspecified ::.</li>
<li>Har IPv6 interface par link-local address hota hai; ND aur default gateways ise use karte hain.</li>
<li>Anycast kai devices par ek unicast-format address hai; routing sabse paas wale tak deliver karti hai.</li>
<li>Multicast ff00::/8 hai; ff02::1, ff02::2, ff02::1:2 aur solicited-node ff02::1:ffxx:xxxx yaad rakho.</li>
<li>Solicited-node = ff02::1:ff + aakhri 24 bits; Ethernet par yeh MAC 33:33 + aakhri 32 bits par map hota hai.</li>
</ul></div>
`}};export{e as default};