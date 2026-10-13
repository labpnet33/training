var e={id:`ds-lite`,h:{en:`DS-Lite: IPv4 inside an IPv6 tunnel to a carrier NAT`,hi:`DS-Lite: IPv4 ko IPv6 tunnel mein carrier NAT tak le jaana`},body:{en:`
<p><b>Dual-Stack Lite (DS-Lite)</b>, defined in RFC 6333, is a <b>tunnelling</b> approach. The provider access network is IPv6-only. Customers still need IPv4, so the home router carries IPv4 packets <i>inside</i> an IPv6 tunnel to a central carrier-grade NAT. The home router does not need a public IPv4 address, and the provider does not have to run IPv4 in its access or aggregation network. The name says "dual-stack" because the subscriber has both IPv4 and IPv6 service, and "lite" because the access network does not.</p>

<h3>The two actors</h3>
<dl class="terms">
<dt>B4 (Basic Bridging BroadBand element)</dt><dd>The tunnel initiator, normally the home router (CPE). It encapsulates IPv4 in IPv6 (IPv4-in-IPv6, protocol 4).</dd>
<dt>AFTR (Address Family Transition Router)</dt><dd>The tunnel terminator in the provider network. It decapsulates and then performs a stateful NAT44 (CGNAT) to the Internet.</dd>
</dl>
<p>The B4 learns the AFTR address, usually as a name, through DHCPv6 option 64 (the AFTR-Name option). It resolves the name to an IPv6 address and builds the tunnel. The B4 uses the reserved address <b>192.0.0.2</b> as its tunnel endpoint on the IPv4 side, and the AFTR uses <b>192.0.0.1</b>, both from 192.0.0.0/29.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="DS-Lite path">
<rect x="10" y="55" width="110" height="70" rx="10" fill="#bae6fd"/><text x="65" y="85" text-anchor="middle" class="svg-ink" font-size="13">Home LAN</text><text x="65" y="105" text-anchor="middle" class="svg-muted" font-size="11">IPv4 192.168.1.0/24</text>
<rect x="160" y="55" width="100" height="70" rx="10" fill="#ddd6fe"/><text x="210" y="85" text-anchor="middle" class="svg-ink" font-size="13">B4 (CPE)</text><text x="210" y="105" text-anchor="middle" class="svg-muted" font-size="11">no NAT44</text>
<rect x="300" y="75" width="170" height="30" rx="6" fill="#e2e8f0"/><text x="385" y="95" text-anchor="middle" class="svg-ink" font-size="12">IPv6-only access and core</text>
<rect x="500" y="55" width="130" height="70" rx="10" fill="#fde68a"/><text x="565" y="85" text-anchor="middle" class="svg-ink" font-size="13">AFTR</text><text x="565" y="105" text-anchor="middle" class="svg-muted" font-size="11">NAT44 to Internet</text>
<line x1="120" y1="90" x2="160" y2="90" stroke="#64748b" stroke-width="2"/><line x1="260" y1="90" x2="300" y2="90" stroke="#64748b" stroke-width="2"/><line x1="470" y1="90" x2="500" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="385" y="150" text-anchor="middle" class="svg-accent" font-size="12">IPv4-in-IPv6 tunnel from B4 to AFTR</text>
</svg><p class="cap">DS-Lite: tunnel from the CPE to the AFTR.</p></div>

<h3>What happens to a packet</h3>
<ol>
<li>A home PC (192.168.1.10) sends IPv4 to 203.0.113.9.</li>
<li>The B4 does <b>not</b> NAT. It encapsulates the whole IPv4 packet in IPv6, source = the B4 WAN IPv6 address, destination = the AFTR IPv6 address.</li>
<li>The IPv6 network forwards the packet like any other IPv6 traffic.</li>
<li>The AFTR removes the outer header and NATs the inner IPv4 packet. The NAT binding key includes the <b>B4 tunnel IPv6 address</b> as well as the inner source, which allows two customers to use the same private 192.168.1.10.</li>
<li>Return traffic is matched, re-encapsulated and sent to the right B4.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> Customer A and customer B both use 192.168.1.10. Customer A's B4 is 2001:db8:a::2 and customer B's is 2001:db8:b::2. The AFTR sees the same inner source twice, but the entries are <code>(2001:db8:a::2, 192.168.1.10, port)</code> and <code>(2001:db8:b::2, 192.168.1.10, port)</code>, so they never clash. This is why DS-Lite does not need a unique private address per customer and why the 100.64.0.0/10 range is not needed.</p></div>

<h3>Benefits and drawbacks</h3>
<table class="cmp"><tr><th>Benefit</th><th>Drawback</th></tr>
<tr><td>Access network is IPv6-only: one routing family.</td><td>CPE must support B4; old IPv4-only CPE does not.</td></tr>
<tr><td>Only one NAT (at the AFTR); no double NAT.</td><td>AFTR is a stateful CGNAT with the usual issues: logging, ports, no inbound.</td></tr>
<tr><td>No need to assign 100.64.0.0/10 addresses.</td><td>Tunnel adds 40 bytes: MTU and MSS must be tuned.</td></tr>
<tr><td>Customer private addresses may overlap safely.</td><td>All IPv4 hairpins to the AFTR, so placement matters.</td></tr></table>

<h3>Design points</h3>
<ul>
<li><b>MTU</b>: 40-byte outer IPv6 header reduces the IPv4 payload room. If the core MTU is 1500, the inner IPv4 packet must be at most 1460 bytes; tune MSS clamping at the B4 or increase the core MTU.</li>
<li><b>AFTR redundancy and scale</b>: anycast or multiple AFTR names; remember it is stateful.</li>
<li><b>Port control</b>: per-subscriber port limits prevent one customer from using the whole pool.</li>
<li><b>Direct IPv4 between customers</b> is not possible without hairpinning in the AFTR. Hairpinning support is optional.</li>
</ul>

<h3>Reference configuration (not run in the simulator)</h3>
<p>DS-Lite is mostly implemented on CPE and AFTR platforms rather than as a classic IOS recipe. The provider-side ingredients are shown as design inputs rather than commands:</p>
<pre class="code"><span class="c">! Reference design (not run in the simulator)</span>
<span class="c">! DHCPv6 server hands the CPE the AFTR-Name option (option 64):</span>
<span class="c">!   aftr.provider.example  -> resolves to the AFTR IPv6 address, e.g. 2001:db8:ffff::1</span>
<span class="c">! B4 tunnel: IPv4-in-IPv6 to 2001:db8:ffff::1, inner endpoint 192.0.0.2</span>
<span class="c">! AFTR: terminates tunnels, inner endpoint 192.0.0.1, then stateful NAT44 to a pool</span></pre>

<div class="warn"><p><b>Common mistakes.</b> Leaving a NAT44 enabled on the B4 (this creates the NAT444 that DS-Lite is meant to avoid); ignoring the 40-byte MTU cost; and exposing the AFTR address to the whole Internet instead of only to subscribers.</p></div>
<div class="exam"><p><b>Exam trap.</b> DS-Lite is tunnelling with <b>one</b> NAT (the AFTR). The B4 does not translate. The AFTR-Name arrives in DHCPv6 option 64, and the tunnel endpoints use 192.0.0.1 and 192.0.0.2.</p></div>

<div class="scn"><h4>Web pages load slowly, speed tests look fine</h4><p>After a DS-Lite rollout some sites stalled on large pages. Ping worked. Small requests were fine. The engineer found that the core MTU was 1500, the B4 sent full 1500-byte inner IPv4 packets, and the encapsulated packets were 1540 bytes. ICMP "packet too big" was filtered in one segment. MSS clamping at the B4 and allowing ICMPv6 packet-too-big fixed it.</p><p><b>Lesson:</b> every tunnel needs an MTU plan.</p></div>

<div class="iv"><p class="q">"How is DS-Lite different from NAT444 CGNAT?"</p><p>NAT444 has two IPv4 NATs and runs IPv4 in the access network. DS-Lite has an IPv6-only access network, tunnels IPv4 over IPv6 from the CPE (B4) to the AFTR, and has only one NAT, at the AFTR. Customer address overlap is handled because the tunnel address is part of the NAT key.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DS-Lite = IPv4-in-IPv6 tunnel from the B4 (CPE) to the AFTR, then CGNAT.</li>
<li>The B4 does not NAT; the AFTR does a single NAT44.</li>
<li>AFTR-Name comes in DHCPv6 option 64; endpoints use 192.0.0.1 and 192.0.0.2.</li>
<li>Overlapping customer private addresses are fine.</li>
<li>Plan the 40-byte MTU overhead.</li>
</ul></div>
`,hi:`
<p><b>Dual-Stack Lite (DS-Lite)</b>, RFC 6333 mein defined, ek <b>tunnelling</b> approach hai. Provider access network IPv6-only hai. Customers ko phir bhi IPv4 chahiye, isliye home router IPv4 packets ko IPv6 tunnel ke <i>andar</i> central carrier-grade NAT tak le jaata hai. Home router ko public IPv4 address nahi chahiye, aur provider ko access ya aggregation network mein IPv4 chalana nahi padta. Naam "dual-stack" isliye hai kyunki subscriber ko IPv4 aur IPv6 dono service milti hai, aur "lite" isliye kyunki access network ko nahi milti.</p>

<h3>Do actors</h3>
<dl class="terms">
<dt>B4 (Basic Bridging BroadBand element)</dt><dd>Tunnel initiator, aam taur par home router (CPE). Yeh IPv4 ko IPv6 mein encapsulate karta hai (IPv4-in-IPv6, protocol 4).</dd>
<dt>AFTR (Address Family Transition Router)</dt><dd>Provider network mein tunnel terminator. Yeh decapsulate karta hai aur phir Internet ki taraf stateful NAT44 (CGNAT) karta hai.</dd>
</dl>
<p>B4 AFTR ka address, aam taur par naam ke roop mein, DHCPv6 option 64 (AFTR-Name option) se seekhta hai. Woh naam ko IPv6 address mein resolve karta hai aur tunnel banata hai. B4 IPv4 side par apne tunnel endpoint ke liye reserved address <b>192.0.0.2</b> use karta hai, aur AFTR <b>192.0.0.1</b>, dono 192.0.0.0/29 se.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="DS-Lite path">
<rect x="10" y="55" width="110" height="70" rx="10" fill="#bae6fd"/><text x="65" y="85" text-anchor="middle" class="svg-ink" font-size="13">Home LAN</text><text x="65" y="105" text-anchor="middle" class="svg-muted" font-size="11">IPv4 192.168.1.0/24</text>
<rect x="160" y="55" width="100" height="70" rx="10" fill="#ddd6fe"/><text x="210" y="85" text-anchor="middle" class="svg-ink" font-size="13">B4 (CPE)</text><text x="210" y="105" text-anchor="middle" class="svg-muted" font-size="11">NAT44 nahi</text>
<rect x="300" y="75" width="170" height="30" rx="6" fill="#e2e8f0"/><text x="385" y="95" text-anchor="middle" class="svg-ink" font-size="12">IPv6-only access aur core</text>
<rect x="500" y="55" width="130" height="70" rx="10" fill="#fde68a"/><text x="565" y="85" text-anchor="middle" class="svg-ink" font-size="13">AFTR</text><text x="565" y="105" text-anchor="middle" class="svg-muted" font-size="11">Internet ke liye NAT44</text>
<line x1="120" y1="90" x2="160" y2="90" stroke="#64748b" stroke-width="2"/><line x1="260" y1="90" x2="300" y2="90" stroke="#64748b" stroke-width="2"/><line x1="470" y1="90" x2="500" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="385" y="150" text-anchor="middle" class="svg-accent" font-size="12">B4 se AFTR tak IPv4-in-IPv6 tunnel</text>
</svg><p class="cap">DS-Lite: CPE se AFTR tak tunnel.</p></div>

<h3>Packet ke saath kya hota hai</h3>
<ol>
<li>Home PC (192.168.1.10) 203.0.113.9 ko IPv4 bhejta hai.</li>
<li>B4 NAT <b>nahi</b> karta. Woh poore IPv4 packet ko IPv6 mein encapsulate karta hai, source = B4 ka WAN IPv6 address, destination = AFTR ka IPv6 address.</li>
<li>IPv6 network packet ko kisi bhi IPv6 traffic ki tarah forward karta hai.</li>
<li>AFTR outer header hatata hai aur inner IPv4 packet ko NAT karta hai. NAT binding key mein inner source ke saath <b>B4 tunnel IPv6 address</b> bhi shamil hota hai, jisse do customers ek hi private 192.168.1.10 use kar sakte hain.</li>
<li>Return traffic match hota hai, dobara encapsulate hota hai aur sahi B4 ko jaata hai.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> Customer A aur customer B dono 192.168.1.10 use karte hain. Customer A ka B4 2001:db8:a::2 hai aur customer B ka 2001:db8:b::2. AFTR ko wahi inner source do baar dikhta hai, lekin entries <code>(2001:db8:a::2, 192.168.1.10, port)</code> aur <code>(2001:db8:b::2, 192.168.1.10, port)</code> hain, isliye kabhi clash nahi hote. Isi wajah se DS-Lite ko har customer ke liye unique private address nahi chahiye aur 100.64.0.0/10 range ki zaroorat nahi.</p></div>

<h3>Fayde aur nuksan</h3>
<table class="cmp"><tr><th>Fayda</th><th>Nuksan</th></tr>
<tr><td>Access network IPv6-only: ek routing family.</td><td>CPE ko B4 support karna padta hai; purane IPv4-only CPE nahi karte.</td></tr>
<tr><td>Sirf ek NAT (AFTR par); double NAT nahi.</td><td>AFTR stateful CGNAT hai jiske wahi issues: logging, ports, inbound nahi.</td></tr>
<tr><td>100.64.0.0/10 addresses assign nahi karne.</td><td>Tunnel 40 bytes jodta hai: MTU aur MSS tune karne padte hain.</td></tr>
<tr><td>Customer private addresses safely overlap kar sakte hain.</td><td>Saara IPv4 AFTR tak hairpin karta hai, isliye placement matter karta hai.</td></tr></table>

<h3>Design points</h3>
<ul>
<li><b>MTU</b>: 40-byte outer IPv6 header IPv4 payload ki jagah kam karta hai. Agar core MTU 1500 hai, to inner IPv4 packet adhiktam 1460 bytes ka hona chahiye; B4 par MSS clamping tune karo ya core MTU badhao.</li>
<li><b>AFTR redundancy aur scale</b>: anycast ya multiple AFTR names; yaad rakho yeh stateful hai.</li>
<li><b>Port control</b>: per-subscriber port limits ek customer ko poora pool use karne se rokti hain.</li>
<li><b>Customers ke beech direct IPv4</b> AFTR mein hairpinning ke bina possible nahi. Hairpinning support optional hai.</li>
</ul>

<h3>Reference configuration (not run in the simulator)</h3>
<p>DS-Lite zyaadatar CPE aur AFTR platforms par implement hota hai, classic IOS recipe ke roop mein nahi. Provider-side ingredients commands ke bajaye design inputs ke roop mein dikhaye hain:</p>
<pre class="code"><span class="c">! Reference design (not run in the simulator)</span>
<span class="c">! DHCPv6 server hands the CPE the AFTR-Name option (option 64):</span>
<span class="c">!   aftr.provider.example  -> resolves to the AFTR IPv6 address, e.g. 2001:db8:ffff::1</span>
<span class="c">! B4 tunnel: IPv4-in-IPv6 to 2001:db8:ffff::1, inner endpoint 192.0.0.2</span>
<span class="c">! AFTR: terminates tunnels, inner endpoint 192.0.0.1, then stateful NAT44 to a pool</span></pre>

<div class="warn"><p><b>Common mistakes.</b> B4 par NAT44 enabled chhodna (isse NAT444 banta hai jisse DS-Lite bachna chahta hai); 40-byte MTU cost ignore karna; aur AFTR address ko sirf subscribers ke bajaye poore Internet ke liye expose karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> DS-Lite tunnelling hai jisme <b>ek</b> NAT (AFTR) hota hai. B4 translate nahi karta. AFTR-Name DHCPv6 option 64 mein aata hai, aur tunnel endpoints 192.0.0.1 aur 192.0.0.2 use karte hain.</p></div>

<div class="scn"><h4>Web pages dheere load hote hain, speed test theek</h4><p>DS-Lite rollout ke baad kuch sites badi pages par atak gayi. Ping chala. Chhote requests theek the. Engineer ne dekha ki core MTU 1500 tha, B4 poore 1500-byte inner IPv4 packets bhej raha tha, aur encapsulated packets 1540 bytes ke the. Ek segment mein ICMP "packet too big" filter ho raha tha. B4 par MSS clamping aur ICMPv6 packet-too-big allow karne se fix hua.</p><p><b>Lesson:</b> har tunnel ko MTU plan chahiye.</p></div>

<div class="iv"><p class="q">"DS-Lite NAT444 CGNAT se kaise alag hai?"</p><p>NAT444 mein do IPv4 NATs hain aur access network mein IPv4 chalta hai. DS-Lite mein access network IPv6-only hai, CPE (B4) se AFTR tak IPv4 ko IPv6 par tunnel karta hai, aur sirf ek NAT hai, AFTR par. Customer address overlap handle hota hai kyunki tunnel address NAT key ka hissa hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DS-Lite = B4 (CPE) se AFTR tak IPv4-in-IPv6 tunnel, phir CGNAT.</li>
<li>B4 NAT nahi karta; AFTR ek NAT44 karta hai.</li>
<li>AFTR-Name DHCPv6 option 64 mein aata hai; endpoints 192.0.0.1 aur 192.0.0.2.</li>
<li>Overlapping customer private addresses theek hain.</li>
<li>40-byte MTU overhead plan karo.</li>
</ul></div>
`}};export{e as default};