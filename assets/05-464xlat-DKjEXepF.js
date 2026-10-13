var e={id:`464xlat`,h:{en:`464XLAT: IPv4-only apps on IPv6-only networks`,hi:`464XLAT: IPv6-only networks par IPv4-only apps`},body:{en:`
<p>NAT64 with DNS64 has one famous gap: applications that use IPv4 literals, or that open sockets only for IPv4, never ask DNS for an AAAA record and so never reach the NAT64. <b>464XLAT</b> (RFC 6877) fixes this by adding a second translator on the device itself. The name describes the path: IPv4 to IPv6 to IPv4, with translation at both ends, so the access and core network can be IPv6-only. It is widely used on mobile networks.</p>

<h3>The two translators</h3>
<dl class="terms">
<dt>CLAT (customer-side translator)</dt><dd>Stateless translation (IPv4 to IPv6) located on the host or the CPE. It gives the IPv4-only application a private IPv4 address and turns its IPv4 packets into IPv6.</dd>
<dt>PLAT (provider-side translator)</dt><dd>Stateful NAT64 in the provider network. It turns the IPv6 packets back into IPv4 toward the Internet and keeps the per-flow state and the public pool.</dd>
</dl>
<p>Think of CLAT as a local interpreter who writes everything in the network's language, and PLAT as the interpreter at the border who translates into the outside language.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="464XLAT path">
<rect x="10" y="55" width="110" height="70" rx="10" fill="#bae6fd"/><text x="65" y="85" text-anchor="middle" class="svg-ink" font-size="13">IPv4-only app</text><text x="65" y="105" text-anchor="middle" class="svg-muted" font-size="11">192.0.0.4</text>
<rect x="160" y="55" width="90" height="70" rx="10" fill="#ddd6fe"/><text x="205" y="85" text-anchor="middle" class="svg-ink" font-size="13">CLAT</text><text x="205" y="105" text-anchor="middle" class="svg-muted" font-size="11">stateless</text>
<rect x="290" y="55" width="140" height="70" rx="10" fill="#e2e8f0"/><text x="360" y="85" text-anchor="middle" class="svg-ink" font-size="13">IPv6-only network</text><text x="360" y="105" text-anchor="middle" class="svg-muted" font-size="11">access and core</text>
<rect x="470" y="55" width="70" height="70" rx="10" fill="#fde68a"/><text x="505" y="85" text-anchor="middle" class="svg-ink" font-size="13">PLAT</text><text x="505" y="105" text-anchor="middle" class="svg-muted" font-size="11">NAT64</text>
<rect x="570" y="55" width="65" height="70" rx="10" fill="#bbf7d0"/><text x="602" y="95" text-anchor="middle" class="svg-ink" font-size="13">IPv4</text>
<line x1="120" y1="90" x2="160" y2="90" stroke="#64748b" stroke-width="2"/><line x1="250" y1="90" x2="290" y2="90" stroke="#64748b" stroke-width="2"/><line x1="430" y1="90" x2="470" y2="90" stroke="#64748b" stroke-width="2"/><line x1="540" y1="90" x2="570" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">IPv4 - IPv6 - IPv4: two translations, one IPv6-only network</text>
</svg><p class="cap">CLAT on the device, PLAT in the provider.</p></div>

<h3>How a packet travels</h3>
<ol>
<li>The app sends IPv4 from its local address, which the device took from the special-purpose range <b>192.0.0.0/29</b> (the same block reserved for DS-Lite; it is often 192.0.0.4 on handsets).</li>
<li>The CLAT translates the IPv4 header to IPv6 statelessly. The source becomes an IPv6 address from a prefix delegated to the device (a /64 from the carrier). The destination becomes the PLAT prefix plus the destination IPv4 address, just like the synthetic addresses in NAT64.</li>
<li>The IPv6-only network forwards it natively to the PLAT.</li>
<li>The PLAT performs stateful NAT64, picks a public IPv4 address and port, and sends the IPv4 packet out.</li>
<li>The reply returns the same way: PLAT to IPv6, then CLAT to IPv4 for the app.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> A banking app on a phone connects to 203.0.113.9 using an IPv4 literal. With plain NAT64 this fails because no DNS lookup occurred. With 464XLAT the CLAT builds a packet to 64:ff9b::cb00:7109 (203 = cb, 0 = 00, 113 = 71, 9 = 09). The network routes it to the PLAT, which translates to 203.0.113.9. The app never knew the network was IPv6-only.</p></div>

<h3>Why operators like it</h3>
<ul>
<li>The access and core network carry <b>only IPv6</b>: one routing protocol family, one set of QoS and security policies, no dual-stack operations.</li>
<li>Only one stateful element (the PLAT) per flow. The CLAT is stateless, so it is cheap in a phone or CPE.</li>
<li>It works for apps that ignore DNS.</li>
<li>Native IPv6 traffic (for most big content networks) bypasses the PLAT altogether, which reduces its load.</li>
</ul>

<h3>Design points</h3>
<ul>
<li>The device needs a /64 for the CLAT. This ties 464XLAT to a prefix-delegation model (SLAAC with a dedicated /64 on mobile networks, DHCPv6-PD on fixed access).</li>
<li>PLAT is the same NAT64 you configured in the previous chapter. The DNS64 resolver may still be present for the native NAT64 path.</li>
<li>CLAT support depends on the operating system or CPE software. A device without a CLAT falls back to NAT64 only.</li>
<li>MTU: two headers differ by 20 bytes (IPv6 is 40 bytes, IPv4 is 20), so the CLAT adjusts MSS or fragments as needed; the path should be able to carry at least the larger packet.</li>
</ul>

<h3>Reference configuration (not run in the simulator)</h3>
<p>For a CPE-based CLAT there is no common IOS command; the CLAT usually lives in host or CPE firmware. The provider side is the NAT64 configuration of the previous chapter. The design in text form:</p>
<pre class="code"><span class="c">! Reference design (not run in the simulator)</span>
<span class="c">! CLAT: inside 192.0.0.0/29, outside = delegated /64 from the carrier</span>
<span class="c">! PLAT: nat64 prefix stateful 64:ff9b::/96  with an IPv4 pool toward the Internet</span></pre>

<div class="warn"><p><b>Common mistakes.</b> Believing 464XLAT removes the need for NAT64; PLAT <i>is</i> NAT64. Assuming it needs DNS64; the CLAT builds the destination itself, though DNS64 helps apps that do resolve names.</p></div>
<div class="exam"><p><b>Exam trap.</b> CLAT is stateless, PLAT is stateful. 464XLAT is a translation technology, not tunnelling, and the fixed prefix 192.0.0.0/29 is the IPv4 service-continuity range.</p></div>

<div class="scn"><h4>Mobile operator turns off IPv4 in the radio network</h4><p>A mobile operator moved the core to IPv6-only. Most apps worked. A few older apps with hard-coded IPv4 addresses failed until the handset operating system enabled its CLAT. After the update, support tickets about those apps dropped, and PLAT counters showed a sharp rise in translated flows for the legacy apps only.</p><p><b>Lesson:</b> 464XLAT lets the network be IPv6-only without abandoning IPv4-only applications.</p></div>

<div class="iv"><p class="q">"What problem does 464XLAT solve that NAT64 and DNS64 alone do not?"</p><p>Applications that use IPv4 literals or IPv4-only sockets. The CLAT on the host translates their IPv4 into IPv6 statelessly, and the PLAT (a NAT64) translates it back to IPv4 for the Internet. The provider network stays IPv6-only.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>464XLAT = CLAT (stateless, customer side) + PLAT (stateful NAT64, provider side).</li>
<li>It supports IPv4 literals and IPv4-only apps on an IPv6-only network.</li>
<li>The host uses an address in 192.0.0.0/29 for the local IPv4 side.</li>
<li>Widely used on mobile networks.</li>
<li>It is translation, not tunnelling.</li>
</ul></div>
`,hi:`
<p>DNS64 ke saath NAT64 mein ek mashhoor gap hai: jo applications IPv4 literals use karti hain, ya sirf IPv4 sockets kholti hain, woh kabhi AAAA record ke liye DNS se nahi poochtin aur isliye NAT64 tak nahi pahunchtin. <b>464XLAT</b> (RFC 6877) device par hi doosra translator jodkar isse theek karta hai. Naam path batata hai: IPv4 se IPv6 se IPv4, dono sirey par translation ke saath, taaki access aur core network IPv6-only ho sake. Yeh mobile networks par bahut use hota hai.</p>

<h3>Do translators</h3>
<dl class="terms">
<dt>CLAT (customer-side translator)</dt><dd>Host ya CPE par stateless translation (IPv4 se IPv6). Yeh IPv4-only application ko private IPv4 address deta hai aur uske IPv4 packets ko IPv6 mein badalta hai.</dd>
<dt>PLAT (provider-side translator)</dt><dd>Provider network mein stateful NAT64. Yeh IPv6 packets ko Internet ki taraf wapas IPv4 mein badalta hai aur per-flow state aur public pool rakhta hai.</dd>
</dl>
<p>CLAT ko local interpreter samjho jo network ki bhasha mein sab likhta hai, aur PLAT ko border ka interpreter jo bahar ki bhasha mein translate karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="464XLAT path">
<rect x="10" y="55" width="110" height="70" rx="10" fill="#bae6fd"/><text x="65" y="85" text-anchor="middle" class="svg-ink" font-size="13">IPv4-only app</text><text x="65" y="105" text-anchor="middle" class="svg-muted" font-size="11">192.0.0.4</text>
<rect x="160" y="55" width="90" height="70" rx="10" fill="#ddd6fe"/><text x="205" y="85" text-anchor="middle" class="svg-ink" font-size="13">CLAT</text><text x="205" y="105" text-anchor="middle" class="svg-muted" font-size="11">stateless</text>
<rect x="290" y="55" width="140" height="70" rx="10" fill="#e2e8f0"/><text x="360" y="85" text-anchor="middle" class="svg-ink" font-size="13">IPv6-only network</text><text x="360" y="105" text-anchor="middle" class="svg-muted" font-size="11">access aur core</text>
<rect x="470" y="55" width="70" height="70" rx="10" fill="#fde68a"/><text x="505" y="85" text-anchor="middle" class="svg-ink" font-size="13">PLAT</text><text x="505" y="105" text-anchor="middle" class="svg-muted" font-size="11">NAT64</text>
<rect x="570" y="55" width="65" height="70" rx="10" fill="#bbf7d0"/><text x="602" y="95" text-anchor="middle" class="svg-ink" font-size="13">IPv4</text>
<line x1="120" y1="90" x2="160" y2="90" stroke="#64748b" stroke-width="2"/><line x1="250" y1="90" x2="290" y2="90" stroke="#64748b" stroke-width="2"/><line x1="430" y1="90" x2="470" y2="90" stroke="#64748b" stroke-width="2"/><line x1="540" y1="90" x2="570" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">IPv4 - IPv6 - IPv4: do translations, ek IPv6-only network</text>
</svg><p class="cap">Device par CLAT, provider mein PLAT.</p></div>

<h3>Packet kaise travel karta hai</h3>
<ol>
<li>App apne local address se IPv4 bhejta hai, jo device ne special-purpose range <b>192.0.0.0/29</b> se liya (yahi block DS-Lite ke liye reserved hai; handsets par aksar 192.0.0.4).</li>
<li>CLAT IPv4 header ko stateless tareeke se IPv6 mein translate karta hai. Source carrier se delegated prefix (/64) ka IPv6 address ban jaata hai. Destination PLAT prefix plus destination IPv4 address ban jaata hai, bilkul NAT64 ke synthetic addresses jaise.</li>
<li>IPv6-only network use natively PLAT tak forward karta hai.</li>
<li>PLAT stateful NAT64 karta hai, public IPv4 address aur port chunta hai, aur IPv4 packet bahar bhejta hai.</li>
<li>Reply usi raaste wapas aata hai: PLAT se IPv6, phir CLAT se app ke liye IPv4.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> Phone par banking app IPv4 literal se 203.0.113.9 se connect karta hai. Plain NAT64 mein yeh fail hota hai kyunki DNS lookup hua hi nahi. 464XLAT mein CLAT 64:ff9b::cb00:7109 ke liye packet banata hai (203 = cb, 0 = 00, 113 = 71, 9 = 09). Network use PLAT tak route karta hai, jo 203.0.113.9 par translate karta hai. App ko pata hi nahi chala ki network IPv6-only hai.</p></div>

<h3>Operators ko yeh kyun pasand hai</h3>
<ul>
<li>Access aur core network <b>sirf IPv6</b> carry karte hain: ek routing protocol family, ek QoS aur security policy set, dual-stack operations nahi.</li>
<li>Per flow sirf ek stateful element (PLAT). CLAT stateless hai, isliye phone ya CPE mein sasta hai.</li>
<li>Yeh un apps ke liye kaam karta hai jo DNS ignore karte hain.</li>
<li>Native IPv6 traffic (bade content networks ke liye) PLAT ko poori tarah bypass karta hai, jisse uska load kam hota hai.</li>
</ul>

<h3>Design points</h3>
<ul>
<li>Device ko CLAT ke liye /64 chahiye. Isse 464XLAT prefix-delegation model se bandhta hai (mobile networks par dedicated /64 ke saath SLAAC, fixed access par DHCPv6-PD).</li>
<li>PLAT wahi NAT64 hai jo pichhle chapter mein configure kiya. Native NAT64 path ke liye DNS64 resolver abhi bhi ho sakta hai.</li>
<li>CLAT support operating system ya CPE software par depend karta hai. CLAT ke bina device sirf NAT64 par fall back karta hai.</li>
<li>MTU: dono headers 20 bytes se alag hain (IPv6 40 bytes, IPv4 20), isliye CLAT MSS adjust ya fragment karta hai; path ko kam se kam bada packet carry karna chahiye.</li>
</ul>

<h3>Reference configuration (not run in the simulator)</h3>
<p>CPE-based CLAT ke liye koi common IOS command nahi hai; CLAT aam taur par host ya CPE firmware mein hota hai. Provider side pichhle chapter ki NAT64 configuration hai. Design text roop mein:</p>
<pre class="code"><span class="c">! Reference design (not run in the simulator)</span>
<span class="c">! CLAT: inside 192.0.0.0/29, outside = delegated /64 from the carrier</span>
<span class="c">! PLAT: nat64 prefix stateful 64:ff9b::/96  with an IPv4 pool toward the Internet</span></pre>

<div class="warn"><p><b>Common mistakes.</b> Yeh maanna ki 464XLAT NAT64 ki zaroorat hata deta hai; PLAT <i>hi</i> NAT64 hai. Yeh maanna ki ise DNS64 chahiye; CLAT destination khud banata hai, lekin DNS64 un apps ki madad karta hai jo names resolve karte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> CLAT stateless hai, PLAT stateful. 464XLAT translation technology hai, tunnelling nahi, aur fixed prefix 192.0.0.0/29 IPv4 service-continuity range hai.</p></div>

<div class="scn"><h4>Mobile operator radio network mein IPv4 band karta hai</h4><p>Mobile operator ne core ko IPv6-only kiya. Zyaadatar apps chale. Kuch purane apps jinme hard-coded IPv4 addresses the, tab tak fail rahe jab tak handset operating system ne apna CLAT enable nahi kiya. Update ke baad un apps ki support tickets ghati, aur PLAT counters mein sirf legacy apps ke translated flows mein tez badhot dikhi.</p><p><b>Lesson:</b> 464XLAT network ko IPv6-only rakhta hai bina IPv4-only applications ko chhode.</p></div>

<div class="iv"><p class="q">"464XLAT woh kaunsi problem solve karta hai jo akele NAT64 aur DNS64 nahi karte?"</p><p>Woh applications jo IPv4 literals ya IPv4-only sockets use karti hain. Host ka CLAT unke IPv4 ko stateless IPv6 mein translate karta hai, aur PLAT (ek NAT64) use Internet ke liye wapas IPv4 mein translate karta hai. Provider network IPv6-only rehta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>464XLAT = CLAT (stateless, customer side) + PLAT (stateful NAT64, provider side).</li>
<li>Yeh IPv6-only network par IPv4 literals aur IPv4-only apps support karta hai.</li>
<li>Host local IPv4 side ke liye 192.0.0.0/29 ka address use karta hai.</li>
<li>Mobile networks par bahut use hota hai.</li>
<li>Yeh translation hai, tunnelling nahi.</li>
</ul></div>
`}};export{e as default};