var e={id:`nat64-design-config`,h:{en:`Designing and configuring NAT64 (reference configuration)`,hi:`NAT64 design aur configuration (reference configuration)`},body:{en:`
<p>This chapter turns the theory into a deployable design: where the gateway sits, how it is announced, what the configuration looks like on a Cisco router, and what you check afterwards. The simulator does not run NAT64, so everything here is <b>Reference configuration (not run in the simulator)</b>. Command names follow Cisco IOS XE; exact syntax and feature support vary by platform and release, so always confirm against the release documentation for your device.</p>

<h3>Where the NAT64 gateway sits</h3>
<p>The gateway needs one interface facing the IPv6-only side (the <b>inside</b>) and one facing the IPv4 Internet (the <b>outside</b>). It must attract traffic for the NAT64 prefix. Two common placements:</p>
<ul>
<li><b>Centralised</b>: a few big gateways at the Internet edge. Easy to operate and log, but all translated traffic hairpins to the edge.</li>
<li><b>Distributed</b>: gateways near aggregation. Shorter paths and smaller failure domains, but more devices and more IPv4 pool fragmentation.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="NAT64 gateway placement">
<rect x="20" y="30" width="120" height="50" rx="10" fill="#bae6fd"/><text x="80" y="60" text-anchor="middle" class="svg-ink" font-size="13">IPv6-only users</text>
<rect x="200" y="30" width="120" height="50" rx="10" fill="#e2e8f0"/><text x="260" y="60" text-anchor="middle" class="svg-ink" font-size="13">SP IPv6 core</text>
<rect x="380" y="30" width="110" height="50" rx="10" fill="#fde68a"/><text x="435" y="55" text-anchor="middle" class="svg-ink" font-size="13">NAT64 GW</text><text x="435" y="72" text-anchor="middle" class="svg-muted" font-size="11">inside / outside</text>
<rect x="530" y="30" width="95" height="50" rx="10" fill="#bbf7d0"/><text x="577" y="60" text-anchor="middle" class="svg-ink" font-size="13">IPv4 Internet</text>
<line x1="140" y1="55" x2="200" y2="55" stroke="#64748b" stroke-width="2"/><line x1="320" y1="55" x2="380" y2="55" stroke="#64748b" stroke-width="2"/><line x1="490" y1="55" x2="530" y2="55" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">The gateway originates 64:ff9b::/96 into the IPv6 routing system</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">and owns the IPv4 pool 198.51.100.0/24 toward the Internet</text>
</svg><p class="cap">The gateway attracts the NAT64 prefix and owns the IPv4 pool.</p></div>

<h3>Reference configuration: stateful NAT64</h3>
<p>The logic is: mark the interfaces, define the prefix, define an IPv4 pool, and say which IPv6 sources may be translated.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
ipv6 unicast-routing
interface GigabitEthernet0/0/0
 description IPv6-only side
 ipv6 address 2001:db8:100::1/64
 nat64 enable
interface GigabitEthernet0/0/1
 description IPv4 Internet side
 ip address 198.51.100.1 255.255.255.0
 nat64 enable
<span class="c">! translate flows that use the well-known prefix</span>
nat64 prefix stateful 64:ff9b::/96
nat64 v4 pool POOL1 198.51.100.10 198.51.100.20
ipv6 access-list NAT64-SRC
 permit ipv6 2001:db8:100::/64 any
nat64 v6v4 list NAT64-SRC pool POOL1 overload</pre>
<p>Note the three ideas: <code>nat64 enable</code> on both interfaces, a <b>prefix</b>, and a <b>pool plus an ACL</b> with <code>overload</code>, which makes it port-based like NAT overload. The gateway must also advertise the prefix. A static route to the gateway or a redistributed route into the IGP does this, for example a route for 64:ff9b::/96 pointing at the gateway.</p>

<h3>Static and stateless mapping</h3>
<p>When an IPv4 client or server must start a connection <i>toward</i> an IPv6 host, you need a mapping that exists before any flow. A <b>static</b> mapping ties one IPv6 address to one IPv4 address. IOS XE has static forms of the <code>nat64 v6v4 static</code> and <code>nat64 v4v6 static</code> family. Stateless translation goes further and keeps no table: the IPv4 address is embedded in or derived from the IPv6 address by a rule.</p>

<h3>Verification (what to look at)</h3>
<p>I do not reproduce device output here because it was not captured from a real device. The checks you run are:</p>
<ul>
<li><code>show nat64 translations</code>: do bindings exist for the client? Is the translated source from the pool?</li>
<li><code>show nat64 statistics</code>: are packets translated, and are there drop counters (no pool address, no mapping, MTU)?</li>
<li><code>show ipv6 route 64:ff9b::/96</code> on a core router: is the prefix reachable and does it point at the gateway?</li>
<li><code>ping</code> and <code>traceroute</code> from the client to the synthetic address, then to the real IPv4 address from the gateway.</li>
</ul>

<h3>Sizing and design questions</h3>
<ul>
<li><b>Sessions</b>: total concurrent translations and new sessions per second.</li>
<li><b>Pool</b>: number of public IPv4 addresses and ports per subscriber.</li>
<li><b>Logging</b>: what must be recorded for the regulator, and where it is exported.</li>
<li><b>Redundancy</b>: stateful gateways keep per-flow state, so an active-active pair with anycast routing may break flows on failover unless state is synchronized. Many designs accept that flows restart.</li>
<li><b>MTU</b>: IPv6 is not fragmented in transit; a path MTU of at least 1280 must always be available, and the IPv4 side may be 1500.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> An operator expects 200,000 IPv6-only subscribers, an average of 300 sessions each at peak, so 60 million sessions if every user were busy. In practice about 20 percent are active, giving 12 million sessions. With a pool of 4 addresses per 1,000 users (800 addresses) and about 64,000 ports each, the port space is 51 million, which covers 12 million. The engineer also checks that the gateway platform supports 12 million sessions; the numbers here are planning arithmetic, not product limits.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Applying <code>nat64 enable</code> on only one interface; permitting the wrong IPv6 prefix in the ACL; forgetting that DNS64 must use the same prefix as the gateway; and advertising 64:ff9b::/96 beyond the operator network.</p></div>
<div class="exam"><p><b>Exam trap.</b> 64:ff9b::/96 is the well-known prefix, but an operator who translates to non-global or private IPv4 destinations should use a network-specific prefix, because the well-known prefix is intended for global IPv4 addresses.</p></div>

<div class="scn"><h4>Synthetic addresses go nowhere</h4><p>An IPv6-only pilot resolved names correctly but pings to 64:ff9b::c000:250 timed out. The core routers had no route for the NAT64 prefix; the gateway never announced it. After adding the route on the gateway and redistributing it into the IPv6 IGP, flows started and <code>show nat64 translations</code> showed bindings.</p><p><b>Lesson:</b> DNS64 and the prefix route must agree, and the prefix must be reachable.</p></div>

<div class="iv"><p class="q">"What do you configure for stateful NAT64 on a Cisco router?"</p><p>NAT64 enabled on the inside and outside interfaces, a stateful prefix, an IPv4 pool, and a list-to-pool mapping with overload. Add the route for the prefix and match DNS64 to it. Name the checks: translations, statistics, route to the prefix.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT64 needs an inside and an outside interface plus a prefix and an IPv4 pool.</li>
<li>The gateway must advertise the NAT64 prefix into the IPv6 routing system.</li>
<li>Static or stateless mappings allow IPv4-initiated connections.</li>
<li>Plan sessions, pool size, logging, MTU and failover behaviour.</li>
<li>Confirm exact syntax against your platform and release.</li>
</ul></div>
`,hi:`
<p>Yeh chapter theory ko deployable design mein badalta hai: gateway kahan baithta hai, kaise announce hota hai, Cisco router par configuration kaisi dikhti hai, aur baad mein kya check karte hain. Simulator NAT64 nahi chalata, isliye yahan sab kuch <b>Reference configuration (not run in the simulator)</b> hai. Command names Cisco IOS XE ko follow karte hain; exact syntax aur feature support platform aur release ke hisaab se badalta hai, isliye hamesha apne device ki release documentation se confirm karo.</p>

<h3>NAT64 gateway kahan baithta hai</h3>
<p>Gateway ko ek interface IPv6-only side (<b>inside</b>) ki taraf chahiye aur ek IPv4 Internet (<b>outside</b>) ki taraf. Use NAT64 prefix ka traffic attract karna padta hai. Do common placements:</p>
<ul>
<li><b>Centralised</b>: Internet edge par kuch bade gateways. Operate aur log karna aasaan, lekin saara translated traffic edge tak hairpin karta hai.</li>
<li><b>Distributed</b>: aggregation ke paas gateways. Chhote paths aur chhote failure domains, lekin zyaada devices aur IPv4 pool fragmentation.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="NAT64 gateway placement">
<rect x="20" y="30" width="120" height="50" rx="10" fill="#bae6fd"/><text x="80" y="60" text-anchor="middle" class="svg-ink" font-size="13">IPv6-only users</text>
<rect x="200" y="30" width="120" height="50" rx="10" fill="#e2e8f0"/><text x="260" y="60" text-anchor="middle" class="svg-ink" font-size="13">SP IPv6 core</text>
<rect x="380" y="30" width="110" height="50" rx="10" fill="#fde68a"/><text x="435" y="55" text-anchor="middle" class="svg-ink" font-size="13">NAT64 GW</text><text x="435" y="72" text-anchor="middle" class="svg-muted" font-size="11">inside / outside</text>
<rect x="530" y="30" width="95" height="50" rx="10" fill="#bbf7d0"/><text x="577" y="60" text-anchor="middle" class="svg-ink" font-size="13">IPv4 Internet</text>
<line x1="140" y1="55" x2="200" y2="55" stroke="#64748b" stroke-width="2"/><line x1="320" y1="55" x2="380" y2="55" stroke="#64748b" stroke-width="2"/><line x1="490" y1="55" x2="530" y2="55" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">Gateway 64:ff9b::/96 ko IPv6 routing system mein originate karta hai</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">aur Internet ki taraf IPv4 pool 198.51.100.0/24 ka owner hai</text>
</svg><p class="cap">Gateway NAT64 prefix attract karta hai aur IPv4 pool ka owner hai.</p></div>

<h3>Reference configuration: stateful NAT64</h3>
<p>Logic yeh hai: interfaces mark karo, prefix define karo, IPv4 pool define karo, aur batao kaun se IPv6 sources translate ho sakte hain.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
ipv6 unicast-routing
interface GigabitEthernet0/0/0
 description IPv6-only side
 ipv6 address 2001:db8:100::1/64
 nat64 enable
interface GigabitEthernet0/0/1
 description IPv4 Internet side
 ip address 198.51.100.1 255.255.255.0
 nat64 enable
<span class="c">! translate flows that use the well-known prefix</span>
nat64 prefix stateful 64:ff9b::/96
nat64 v4 pool POOL1 198.51.100.10 198.51.100.20
ipv6 access-list NAT64-SRC
 permit ipv6 2001:db8:100::/64 any
nat64 v6v4 list NAT64-SRC pool POOL1 overload</pre>
<p>Teen ideas dhyan do: dono interfaces par <code>nat64 enable</code>, ek <b>prefix</b>, aur <code>overload</code> ke saath <b>pool plus ACL</b>, jo use NAT overload jaisa port-based banata hai. Gateway ko prefix advertise bhi karna hai. Gateway ki taraf static route ya IGP mein redistributed route yeh karta hai, jaise 64:ff9b::/96 ka route gateway ki taraf.</p>

<h3>Static aur stateless mapping</h3>
<p>Jab IPv4 client ya server ko IPv6 host <i>ki taraf</i> connection shuru karna ho, to flow se pehle mapping chahiye. <b>Static</b> mapping ek IPv6 address ko ek IPv4 address se jodta hai. IOS XE mein <code>nat64 v6v4 static</code> aur <code>nat64 v4v6 static</code> family ke static forms hain. Stateless translation aur aage jaata hai aur koi table nahi rakhta: IPv4 address rule se IPv6 address mein embed ya usse derive hota hai.</p>

<h3>Verification (kya dekhna hai)</h3>
<p>Main yahan device output reproduce nahi karta kyunki woh real device se capture nahi hua. Aap yeh checks chalate ho:</p>
<ul>
<li><code>show nat64 translations</code>: client ke liye bindings hain? Translated source pool se hai?</li>
<li><code>show nat64 statistics</code>: packets translate ho rahe hain, aur drop counters (no pool address, no mapping, MTU) hain?</li>
<li>Core router par <code>show ipv6 route 64:ff9b::/96</code>: prefix reachable hai aur gateway ki taraf point karta hai?</li>
<li>Client se synthetic address tak, phir gateway se real IPv4 address tak <code>ping</code> aur <code>traceroute</code>.</li>
</ul>

<h3>Sizing aur design questions</h3>
<ul>
<li><b>Sessions</b>: total concurrent translations aur new sessions per second.</li>
<li><b>Pool</b>: public IPv4 addresses ki ginti aur ports per subscriber.</li>
<li><b>Logging</b>: regulator ke liye kya record hona chahiye, aur kahan export hoga.</li>
<li><b>Redundancy</b>: stateful gateways per-flow state rakhte hain, isliye anycast routing ke saath active-active pair failover par flows tod sakta hai agar state synchronize na ho. Kai designs flows ke restart ko accept karte hain.</li>
<li><b>MTU</b>: IPv6 transit mein fragment nahi hota; kam se kam 1280 ka path MTU hamesha chahiye, aur IPv4 side 1500 ho sakti hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Operator 200,000 IPv6-only subscribers expect karta hai, peak par average 300 sessions each, yaani agar sab busy ho to 60 million sessions. Practically lagbhag 20 percent active hote hain, yaani 12 million sessions. Har 1,000 users par 4 addresses (800 addresses) aur har ek ke lagbhag 64,000 ports ke saath, port space 51 million hai, jo 12 million ko cover karta hai. Engineer yeh bhi check karta hai ki gateway platform 12 million sessions support karta hai; yahan ke numbers planning arithmetic hain, product limits nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>nat64 enable</code> sirf ek interface par lagana; ACL mein galat IPv6 prefix permit karna; yeh bhoolna ki DNS64 ko gateway wala hi prefix use karna padta hai; aur 64:ff9b::/96 ko operator network ke bahar advertise karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> 64:ff9b::/96 well-known prefix hai, lekin jo operator non-global ya private IPv4 destinations ko translate karta hai use network-specific prefix use karna chahiye, kyunki well-known prefix global IPv4 addresses ke liye hai.</p></div>

<div class="scn"><h4>Synthetic addresses kahin nahi jaate</h4><p>IPv6-only pilot mein names sahi resolve hue lekin 64:ff9b::c000:250 par ping time out hua. Core routers ke paas NAT64 prefix ka route nahi tha; gateway ne use kabhi announce nahi kiya. Gateway par route jodne aur use IPv6 IGP mein redistribute karne ke baad flows shuru hue aur <code>show nat64 translations</code> mein bindings dikhi.</p><p><b>Lesson:</b> DNS64 aur prefix route ek hi hone chahiye, aur prefix reachable hona chahiye.</p></div>

<div class="iv"><p class="q">"Cisco router par stateful NAT64 ke liye kya configure karte ho?"</p><p>Inside aur outside interfaces par NAT64 enabled, ek stateful prefix, ek IPv4 pool, aur overload ke saath list-to-pool mapping. Prefix ka route jodo aur DNS64 ko usse match karo. Checks batao: translations, statistics, prefix ka route.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT64 ko inside aur outside interface, plus prefix aur IPv4 pool chahiye.</li>
<li>Gateway ko NAT64 prefix IPv6 routing system mein advertise karna padta hai.</li>
<li>Static ya stateless mappings IPv4-initiated connections allow karte hain.</li>
<li>Sessions, pool size, logging, MTU aur failover behaviour plan karo.</li>
<li>Exact syntax apne platform aur release se confirm karo.</li>
</ul></div>
`}};export{e as default};