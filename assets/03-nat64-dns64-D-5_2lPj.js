var e={id:`nat64-dns64`,h:{en:`NAT64 and DNS64: IPv6-only clients reaching IPv4 servers`,hi:`NAT64 aur DNS64: IPv6-only clients se IPv4 servers tak`},body:{en:`
<p>Suppose a subscriber network is IPv6-only. The phone wants a site that only has an IPv4 address. The phone cannot send an IPv4 packet and the server cannot read IPv6. <b>NAT64</b> sits in the middle and translates between the two. <b>DNS64</b> makes the phone believe the server has an IPv6 address in the first place. Together they let an IPv6-only network reach the IPv4 Internet.</p>

<h3>The two pieces</h3>
<dl class="terms">
<dt>NAT64</dt><dd>A gateway that translates IPv6 packets to IPv4 and back (RFC 6146 for the stateful form, RFC 6145 for header translation).</dd>
<dt>DNS64</dt><dd>A DNS resolver feature (RFC 6147) that, when a name has an A record but no AAAA record, builds a synthetic AAAA record by embedding the IPv4 address inside an IPv6 prefix.</dd>
<dt>NAT64 prefix</dt><dd>The IPv6 prefix used for embedding. The well-known prefix is <b>64:ff9b::/96</b> (RFC 6052). An operator may instead use a network-specific prefix from its own space.</dd>
</dl>

<h3>How a connection works, step by step</h3>
<ol>
<li>The IPv6-only client asks the DNS64 resolver for <code>app.example</code>.</li>
<li>The authoritative DNS returns only an A record, say 192.0.2.80.</li>
<li>DNS64 synthesizes an AAAA record: prefix 64:ff9b::/96 plus the 32 bits of 192.0.2.80, written <code>64:ff9b::c000:250</code> (192 = c0, 0 = 00, 2 = 02, 80 = 50 in hex).</li>
<li>The client sends an IPv6 packet to 64:ff9b::c000:250. Routing delivers it to the NAT64 gateway, because the gateway advertises the NAT64 prefix.</li>
<li>NAT64 takes the last 32 bits as the IPv4 destination (192.0.2.80). It picks an IPv4 source from its pool (for example 198.51.100.10 and a port) and records the binding.</li>
<li>The server replies to 198.51.100.10. NAT64 looks up the binding and rebuilds an IPv6 packet whose source is 64:ff9b::c000:250 and whose destination is the original client.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="NAT64 and DNS64 flow">
<rect x="10" y="60" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="88" text-anchor="middle" class="svg-ink" font-size="13">IPv6-only</text><text x="65" y="106" text-anchor="middle" class="svg-muted" font-size="11">client</text>
<rect x="165" y="10" width="130" height="45" rx="10" fill="#ddd6fe"/><text x="230" y="38" text-anchor="middle" class="svg-ink" font-size="13">DNS64</text>
<rect x="250" y="80" width="130" height="60" rx="10" fill="#fde68a"/><text x="315" y="108" text-anchor="middle" class="svg-ink" font-size="13">NAT64</text><text x="315" y="126" text-anchor="middle" class="svg-muted" font-size="11">64:ff9b::/96</text>
<rect x="480" y="60" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="555" y="88" text-anchor="middle" class="svg-ink" font-size="13">IPv4 server</text><text x="555" y="106" text-anchor="middle" class="svg-muted" font-size="11">192.0.2.80</text>
<line x1="120" y1="90" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><line x1="380" y1="110" x2="480" y2="95" stroke="#64748b" stroke-width="2"/><line x1="90" y1="60" x2="165" y2="32" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 3"/>
<text x="185" y="82" text-anchor="middle" class="svg-accent" font-size="11">IPv6</text><text x="430" y="85" text-anchor="middle" class="svg-accent" font-size="11">IPv4</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">DNS64 invents the AAAA; NAT64 translates the packets</text>
</svg><p class="cap">DNS64 answers the name, NAT64 moves the packets.</p></div>

<h3>Stateful and stateless NAT64</h3>
<ul>
<li><b>Stateful NAT64</b> (RFC 6146): many IPv6 clients share a small IPv4 pool. The gateway keeps a binding per flow, like NAT overload. Connections must start from the IPv6 side.</li>
<li><b>Stateless NAT64</b> (RFC 6145 with an explicit mapping, often called IVI or SIIT): each IPv6 host maps to one fixed IPv4 address. No per-flow table, so it scales and supports sessions in both directions, but it consumes one IPv4 address per host.</li>
</ul>

<h3>The IPv6-to-IPv4 header translation</h3>
<p>The translator rewrites rather than wraps. The IPv6 header has no checksum while IPv4 does, so the IPv4 header checksum is computed. The IPv6 hop limit becomes the IPv4 TTL. Traffic class becomes TOS. For TCP and UDP the transport checksum must be recalculated because it covers a pseudo-header with the addresses. ICMP and ICMPv6 are converted to each other. Fragmentation is a particular issue: IPv6 routers do not fragment, while IPv4 headers may carry fragments. The NAT64 therefore must handle the Don't Fragment bit and MTU differences (the IPv6 minimum MTU is 1280 bytes).</p>

<div class="eg"><p><b>Worked example.</b> The client 2001:db8:100::25 connects to 64:ff9b::c000:250 on TCP port 443. NAT64 maps to source 198.51.100.10 port 40001 and destination 192.0.2.80 port 443. The binding stored is: 2001:db8:100::25 port 51234 equals 198.51.100.10 port 40001. The return packet to 198.51.100.10 port 40001 is matched to that binding and sent back to the client as an IPv6 packet.</p></div>

<h3>Limits</h3>
<ul>
<li>Applications with <b>IPv4 literals</b> (a hard-coded address, or old software) bypass DNS, so DNS64 cannot help them. 464XLAT fixes that (next chapters).</li>
<li><b>DNSSEC</b> validation can break when the resolver rewrites answers; clients that validate themselves reject the synthetic record.</li>
<li>Protocols that embed addresses in payload need an ALG.</li>
<li>Inbound connections to IPv6 clients from the IPv4 side need a stateless or static mapping.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Forgetting to route the NAT64 prefix. The gateway must announce 64:ff9b::/96 (or the network-specific prefix) into the IPv6 IGP or BGP, or traffic to the synthetic addresses has nowhere to go.</p></div>
<div class="exam"><p><b>Exam trap.</b> DNS64 only synthesizes a AAAA record when no real AAAA exists. If the destination has a real IPv6 address, the client uses native IPv6 and NAT64 is not involved.</p></div>

<div class="scn"><h4>Only some apps work on the IPv6-only Wi-Fi</h4><p>A campus moved a guest Wi-Fi to IPv6-only with NAT64 and DNS64. Browsers and mail worked. An old VoIP client that connected by a typed IPv4 address failed. The team saw that DNS was never involved for that app, so no synthetic AAAA existed. They added a client-side translator (464XLAT) on managed devices.</p><p><b>Lesson:</b> DNS64 depends on name resolution; IPv4 literals need another tool.</p></div>

<div class="iv"><p class="q">"Walk me through how an IPv6-only client reaches an IPv4-only server."</p><p>DNS64 returns a synthetic AAAA made from the prefix and the IPv4 address. The client sends IPv6 to that address. The NAT64 gateway extracts the IPv4 destination, translates the header, uses an IPv4 pool address as source, and stores a binding for the reply. Mention 64:ff9b::/96 and that IPv4 literals and DNSSEC are limitations.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT64 translates packets; DNS64 synthesizes AAAA records.</li>
<li>Well-known prefix: 64:ff9b::/96; the IPv4 address sits in the last 32 bits.</li>
<li>Stateful NAT64 shares IPv4 addresses and needs an IPv6-initiated flow.</li>
<li>Stateless NAT64 maps hosts one-to-one without a flow table.</li>
<li>IPv4 literals and DNSSEC are the classic problems.</li>
</ul></div>
`,hi:`
<p>Maan lo subscriber network IPv6-only hai. Phone ko ek aisi site chahiye jiska sirf IPv4 address hai. Phone IPv4 packet bhej nahi sakta aur server IPv6 padh nahi sakta. <b>NAT64</b> beech mein baithkar dono ke beech translate karta hai. <b>DNS64</b> phone ko yeh yakeen dilata hai ki server ka IPv6 address hai. Dono saath mein IPv6-only network ko IPv4 Internet tak pahunchne dete hain.</p>

<h3>Do hisse</h3>
<dl class="terms">
<dt>NAT64</dt><dd>Gateway jo IPv6 packets ko IPv4 mein aur wapas translate karta hai (stateful form ke liye RFC 6146, header translation ke liye RFC 6145).</dd>
<dt>DNS64</dt><dd>DNS resolver feature (RFC 6147) jo, jab kisi name ka A record ho lekin AAAA record na ho, to IPv4 address ko IPv6 prefix ke andar embed karke synthetic AAAA record banata hai.</dd>
<dt>NAT64 prefix</dt><dd>Embedding ke liye use hone wala IPv6 prefix. Well-known prefix <b>64:ff9b::/96</b> hai (RFC 6052). Operator apne space ka network-specific prefix bhi use kar sakta hai.</dd>
</dl>

<h3>Connection step by step</h3>
<ol>
<li>IPv6-only client DNS64 resolver se <code>app.example</code> maangta hai.</li>
<li>Authoritative DNS sirf A record lautata hai, maan lo 192.0.2.80.</li>
<li>DNS64 synthetic AAAA banata hai: prefix 64:ff9b::/96 plus 192.0.2.80 ke 32 bits, jo <code>64:ff9b::c000:250</code> likha jaata hai (192 = c0, 0 = 00, 2 = 02, 80 = 50 hex mein).</li>
<li>Client 64:ff9b::c000:250 par IPv6 packet bhejta hai. Routing use NAT64 gateway tak pahunchati hai, kyunki gateway NAT64 prefix advertise karta hai.</li>
<li>NAT64 aakhri 32 bits ko IPv4 destination (192.0.2.80) maanta hai. Woh apne pool se IPv4 source (jaise 198.51.100.10 aur ek port) chunta hai aur binding record karta hai.</li>
<li>Server 198.51.100.10 ko reply karta hai. NAT64 binding dhundhta hai aur IPv6 packet banata hai jiska source 64:ff9b::c000:250 aur destination original client hai.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="NAT64 aur DNS64 flow">
<rect x="10" y="60" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="88" text-anchor="middle" class="svg-ink" font-size="13">IPv6-only</text><text x="65" y="106" text-anchor="middle" class="svg-muted" font-size="11">client</text>
<rect x="165" y="10" width="130" height="45" rx="10" fill="#ddd6fe"/><text x="230" y="38" text-anchor="middle" class="svg-ink" font-size="13">DNS64</text>
<rect x="250" y="80" width="130" height="60" rx="10" fill="#fde68a"/><text x="315" y="108" text-anchor="middle" class="svg-ink" font-size="13">NAT64</text><text x="315" y="126" text-anchor="middle" class="svg-muted" font-size="11">64:ff9b::/96</text>
<rect x="480" y="60" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="555" y="88" text-anchor="middle" class="svg-ink" font-size="13">IPv4 server</text><text x="555" y="106" text-anchor="middle" class="svg-muted" font-size="11">192.0.2.80</text>
<line x1="120" y1="90" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><line x1="380" y1="110" x2="480" y2="95" stroke="#64748b" stroke-width="2"/><line x1="90" y1="60" x2="165" y2="32" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 3"/>
<text x="185" y="82" text-anchor="middle" class="svg-accent" font-size="11">IPv6</text><text x="430" y="85" text-anchor="middle" class="svg-accent" font-size="11">IPv4</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">DNS64 AAAA banata hai; NAT64 packets translate karta hai</text>
</svg><p class="cap">DNS64 naam ka jawab deta hai, NAT64 packets le jaata hai.</p></div>

<h3>Stateful aur stateless NAT64</h3>
<ul>
<li><b>Stateful NAT64</b> (RFC 6146): kai IPv6 clients chhota IPv4 pool share karte hain. Gateway har flow ki binding rakhta hai, NAT overload jaise. Connections IPv6 side se shuru hone chahiye.</li>
<li><b>Stateless NAT64</b> (RFC 6145 explicit mapping ke saath, aksar IVI ya SIIT kehte hain): har IPv6 host ek fixed IPv4 address se map hota hai. Per-flow table nahi, isliye scale karta hai aur dono taraf sessions support karta hai, lekin har host ke liye ek IPv4 address kharch hota hai.</li>
</ul>

<h3>IPv6 se IPv4 header translation</h3>
<p>Translator wrap nahi karta, rewrite karta hai. IPv6 header mein checksum nahi hota jabki IPv4 mein hota hai, isliye IPv4 header checksum compute hota hai. IPv6 hop limit IPv4 TTL ban jaata hai. Traffic class TOS ban jaata hai. TCP aur UDP ke liye transport checksum dobara calculate karna padta hai kyunki woh addresses wale pseudo-header ko cover karta hai. ICMP aur ICMPv6 ek-doosre mein convert hote hain. Fragmentation khaas issue hai: IPv6 routers fragment nahi karte, jabki IPv4 headers fragments le sakte hain. Isliye NAT64 ko Don't Fragment bit aur MTU differences handle karne padte hain (IPv6 minimum MTU 1280 bytes hai).</p>

<div class="eg"><p><b>Worked example.</b> Client 2001:db8:100::25, 64:ff9b::c000:250 par TCP port 443 se connect karta hai. NAT64 source 198.51.100.10 port 40001 aur destination 192.0.2.80 port 443 par map karta hai. Stored binding: 2001:db8:100::25 port 51234 barabar 198.51.100.10 port 40001. 198.51.100.10 port 40001 par aaya return packet us binding se match hota hai aur client ko IPv6 packet ke roop mein wapas jaata hai.</p></div>

<h3>Limits</h3>
<ul>
<li><b>IPv4 literals</b> wali applications (hard-coded address, ya purana software) DNS bypass karti hain, isliye DNS64 madad nahi kar sakta. 464XLAT isse theek karta hai (agle chapters).</li>
<li>Resolver jab answers rewrite karta hai to <b>DNSSEC</b> validation toot sakti hai; khud validate karne wale clients synthetic record reject karte hain.</li>
<li>Payload mein addresses embed karne wale protocols ko ALG chahiye.</li>
<li>IPv4 side se IPv6 clients tak inbound connections ke liye stateless ya static mapping chahiye.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> NAT64 prefix ko route karna bhool jaana. Gateway ko 64:ff9b::/96 (ya network-specific prefix) IPv6 IGP ya BGP mein announce karna padta hai, nahi to synthetic addresses ka traffic kahin nahi jaata.</p></div>
<div class="exam"><p><b>Exam trap.</b> DNS64 synthetic AAAA tabhi banata hai jab asli AAAA na ho. Agar destination ka asli IPv6 address hai, to client native IPv6 use karta hai aur NAT64 involve nahi hota.</p></div>

<div class="scn"><h4>IPv6-only Wi-Fi par sirf kuch apps chalte hain</h4><p>Ek campus ne guest Wi-Fi ko NAT64 aur DNS64 ke saath IPv6-only kiya. Browsers aur mail chale. Ek purana VoIP client jo typed IPv4 address se connect karta tha fail hua. Team ne dekha ki us app ke liye DNS kabhi involve hi nahi hua, isliye synthetic AAAA nahi bana. Unhone managed devices par client-side translator (464XLAT) jodha.</p><p><b>Lesson:</b> DNS64 name resolution par depend karta hai; IPv4 literals ke liye alag tool chahiye.</p></div>

<div class="iv"><p class="q">"IPv6-only client IPv4-only server tak kaise pahunchta hai, samjhao."</p><p>DNS64 prefix aur IPv4 address se bana synthetic AAAA lautata hai. Client us address par IPv6 bhejta hai. NAT64 gateway IPv4 destination nikalta hai, header translate karta hai, IPv4 pool ka address source banata hai, aur reply ke liye binding store karta hai. 64:ff9b::/96 batao aur IPv4 literals tatha DNSSEC ko limitations mein gino.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT64 packets translate karta hai; DNS64 AAAA records synthesize karta hai.</li>
<li>Well-known prefix: 64:ff9b::/96; IPv4 address aakhri 32 bits mein hota hai.</li>
<li>Stateful NAT64 IPv4 addresses share karta hai aur IPv6 se shuru hua flow chahta hai.</li>
<li>Stateless NAT64 flow table ke bina hosts ko one-to-one map karta hai.</li>
<li>IPv4 literals aur DNSSEC classic problems hain.</li>
</ul></div>
`}};export{e as default};