var e={id:`coexistence`,h:{en:`Coexistence: dual stack, tunnels and NAT64/DNS64`,hi:`Coexistence: dual stack, tunnels aur NAT64/DNS64`},body:{en:`
<p>IPv4 and IPv6 cannot talk to each other directly: an IPv6-only host has no way to put an IPv4 address in its packet header. For many years both will exist side by side, so Network+ asks you to know the three <b>compatibility requirements</b> that let them coexist. Think of two railway systems with different track widths. You can build both tracks everywhere (<b>dual stack</b>), load one train onto wagons of the other to cross a stretch that only has the other track (<b>tunnelling</b>), or move passengers from one train to the other at a station (<b>translation</b>, NAT64).</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Three coexistence methods">
<rect x="10" y="20" width="195" height="170" rx="10" fill="#bbf7d0"/><text x="107" y="45" text-anchor="middle" class="svg-ink" font-size="14">Dual stack</text>
<text x="107" y="80" text-anchor="middle" class="svg-muted" font-size="12">IPv4 and IPv6 both</text><text x="107" y="98" text-anchor="middle" class="svg-muted" font-size="12">run natively</text><text x="107" y="140" text-anchor="middle" class="svg-accent" font-size="12">Preferred method</text>
<rect x="222" y="20" width="195" height="170" rx="10" fill="#bae6fd"/><text x="319" y="45" text-anchor="middle" class="svg-ink" font-size="14">Tunnelling</text>
<text x="319" y="80" text-anchor="middle" class="svg-muted" font-size="12">IPv6 packet carried</text><text x="319" y="98" text-anchor="middle" class="svg-muted" font-size="12">inside IPv4</text><text x="319" y="140" text-anchor="middle" class="svg-accent" font-size="12">6in4, GRE</text>
<rect x="434" y="20" width="195" height="170" rx="10" fill="#fde68a"/><text x="531" y="45" text-anchor="middle" class="svg-ink" font-size="14">Translation</text>
<text x="531" y="80" text-anchor="middle" class="svg-muted" font-size="12">IPv6-only client reaches</text><text x="531" y="98" text-anchor="middle" class="svg-muted" font-size="12">IPv4-only server</text><text x="531" y="140" text-anchor="middle" class="svg-accent" font-size="12">NAT64 + DNS64</text>
</svg><p class="cap">Dual stack runs both; tunnels carry one inside the other; translation converts between them.</p></div>

<h3>1. Dual stack</h3>
<p>You configured this in chapter 7. Every device runs both protocols natively, DNS returns A and AAAA records, and hosts prefer IPv6. It is the simplest and best-performing option, but it still needs IPv4 addresses everywhere, so it does not remove the dependence on IPv4.</p>

<h3>2. Tunnelling: IPv6 across an IPv4-only network</h3>
<p>Sometimes two IPv6 islands are separated by a network that only carries IPv4, for example a provider that has not enabled IPv6. A <b>tunnel</b> wraps each IPv6 packet inside an IPv4 packet at one edge and unwraps it at the other. The IPv4 network in the middle, the <b>underlay</b>, only ever sees IPv4.</p>
<ul>
<li><b>6in4</b> (manual or configured tunnel): the IPv6 packet goes directly inside an IPv4 header with <b>protocol number 41</b>. 20 bytes of overhead.</li>
<li><b>GRE</b>: Generic Routing Encapsulation, <b>IP protocol 47</b>, adds a 4-byte GRE header, so 24 bytes of overhead. It can carry IPv6, IPv4 and multicast, which makes it popular between routers.</li>
<li><b>Older automatic methods</b>: <b>6to4</b> (<code>2002::/16</code>), <b>Teredo</b> (IPv6 inside UDP 3544 to cross NAT) and <b>ISATAP</b>. They are deprecated and usually disabled today; recognise the names for the exam.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="GRE encapsulation of IPv6">
<rect x="20" y="30" width="170" height="40" rx="6" fill="#fed7aa"/><text x="105" y="55" text-anchor="middle" class="svg-ink" font-size="13">IPv4 header (47)</text>
<rect x="195" y="30" width="80" height="40" rx="6" fill="#fde68a"/><text x="235" y="55" text-anchor="middle" class="svg-ink" font-size="13">GRE</text>
<rect x="280" y="30" width="150" height="40" rx="6" fill="#bbf7d0"/><text x="355" y="55" text-anchor="middle" class="svg-ink" font-size="13">IPv6 header</text>
<rect x="435" y="30" width="185" height="40" rx="6" fill="#e2e8f0"/><text x="527" y="55" text-anchor="middle" class="svg-ink" font-size="13">ICMPv6 / TCP / UDP</text>
<text x="105" y="95" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.1 to 198.51.100.1</text>
<text x="355" y="95" text-anchor="middle" class="svg-muted" font-size="12">PC1 to SRV (IPv6)</text>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="13">The ISP router only reads the outer IPv4 header</text>
</svg><p class="cap">In the second lab, R1 and R2 wrap IPv6 in GRE over IPv4 so the provider never sees an IPv6 packet.</p></div>

<h3>The tunnel lab walkthrough</h3>
<p>In <b>IPv6 across an IPv4-only provider</b>, head office R1 (<code>203.0.113.1</code>) and branch R2 (<code>198.51.100.1</code>) reach each other only over IPv4 through the provider router ISP. First prove the underlay works (<code>ping 198.51.100.1</code> from R1), then build the tunnel:</p>
<pre class="code"><span class="c">! R1 (mirror on R2: 2001:db8:acad:99::2/64, source g0/0, destination 203.0.113.1)</span>
R1(config)# interface tunnel0
R1(config-if)# ipv6 address 2001:db8:acad:99::1/64
R1(config-if)# tunnel source g0/1
R1(config-if)# tunnel destination 198.51.100.1
R1(config-if)# exit
<span class="c">! Route through the tunnel: the next hop is the far tunnel end, not the ISP</span>
R1(config)# ipv6 route ::/0 2001:db8:acad:99::2
R2(config)# ipv6 route 2001:db8:acad:10::/64 2001:db8:acad:99::1</pre>
<pre class="out">R1# show interfaces tunnel0
<span class="hl">Tunnel0 is up, line protocol is up</span>
  Tunnel source 203.0.113.1 (GigabitEthernet0/1), destination 198.51.100.1
  <span class="hl">Tunnel protocol/transport GRE/IP</span>
  Tunnel transport MTU 1476 bytes

PC1&gt; trace 2001:db8:acad:20::10
 1   2001:DB8:ACAD:10::1 0.500 ms  0.450 ms  0.480 ms
 2   <span class="hl">2001:DB8:ACAD:99::2</span> 0.700 ms  0.650 ms  0.680 ms
 3   *2001:DB8:ACAD:20::10   1.000 ms (ICMP type:3, code:3, Destination port unreachable)</pre>
<p>The trace shows the tunnel as <b>one IPv6 hop</b>: the provider router is invisible to IPv6. The transport MTU of 1476 bytes (1500 minus 24) is the price of encapsulation.</p>

<h3>3. Translation: NAT64 with DNS64</h3>
<p>Mobile carriers and new networks increasingly give clients <b>IPv6 only</b>. Those clients still need to reach websites that exist only on IPv4. <b>NAT64</b> translates between the two, and <b>DNS64</b> makes it transparent.</p>
<ol>
<li>The IPv6-only phone asks DNS64 for the AAAA record of <code>legacy.example</code>.</li>
<li>The site has only an A record, <code>198.51.100.20</code>. DNS64 <b>synthesises</b> a AAAA record by placing the IPv4 address in the last 32 bits of the NAT64 prefix <code>64:ff9b::/96</code>: 198 = c6, 51 = 33, 100 = 64, 20 = 14, so <code>64:ff9b::c633:6414</code>.</li>
<li>The phone sends IPv6 packets to <code>64:ff9b::c633:6414</code>. Routing delivers them to the <b>NAT64 gateway</b>.</li>
<li>The gateway builds an IPv4 packet from one of its public IPv4 addresses to <code>198.51.100.20</code>, remembering the mapping (stateful NAT64, like PAT), and translates replies back to IPv6.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> Which IPv4 server is <code>64:ff9b::cb00:710a</code>? Split the last 32 bits into bytes: cb = 203, 00 = 0, 71 = 113, 0a = 10, so <code>203.0.113.10</code>. Written the mixed way, the same address is <code>64:ff9b::203.0.113.10</code>.</p></div>
<p>NAT64 breaks applications that use IPv4 <b>literals</b> (an IPv4 address typed in the app instead of a name) because DNS64 never sees them. Mobile networks fix this with <b>464XLAT</b>: a small translator on the phone (CLAT) turns the app's IPv4 into IPv6, and the carrier's NAT64 (PLAT) turns it back. The reverse idea, <b>DS-Lite</b>, carries customer IPv4 inside IPv6 to a provider CGNAT.</p>

<table class="cmp"><tr><th>Method</th><th>Solves</th><th>Cost</th></tr>
<tr><td>Dual stack</td><td>Running both natively</td><td>Needs IPv4 addresses, two of everything</td></tr>
<tr><td>6in4 / GRE tunnel</td><td>IPv6 islands across IPv4-only paths</td><td>Overhead, smaller MTU, manual config</td></tr>
<tr><td>NAT64 + DNS64</td><td>IPv6-only clients reaching IPv4-only servers</td><td>Stateful gateway, breaks IPv4 literals</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Pointing the IPv6 route at the ISP's address instead of the far tunnel end. Forgetting the lower tunnel MTU. Enabling DNS64 on a resolver used by dual-stack hosts that do not need it, so they send traffic through NAT64 unnecessarily.</p></div>

<div class="exam"><p><b>Exam traps.</b> NAT64 lets <b>IPv6-only</b> clients reach <b>IPv4-only</b> servers and needs <b>DNS64</b>. The well-known NAT64 prefix is <b>64:ff9b::/96</b>. 6in4 uses IP protocol <b>41</b>; GRE uses <b>47</b>. Tunnelling carries one protocol inside the other; it does not translate. Dual stack is the preferred method.</p></div>

<div class="scn"><h4>The branch that got IPv6 before its provider did</h4><p>A company's head office had native IPv6, but a new branch's only provider offered IPv4 only. Branch users needed IPv6 access to an internal application hosted only on IPv6. The engineer built a GRE tunnel between the head-office and branch routers over the IPv4 Internet, gave the tunnel a /64, and pointed the branch's IPv6 default route at the head-office tunnel address. A trace from a branch PC showed the tunnel as a single hop. Large uploads stalled until the team confirmed ICMPv6 Packet Too Big was permitted, so hosts adapted to the 1476-byte tunnel MTU.</p><p><b>Lesson:</b> a tunnel is a quick way to join IPv6 islands, but remember the extra header and the smaller MTU.</p></div>

<div class="iv"><p class="q">"How can an IPv6-only client reach an IPv4-only website?"</p><p>Strong answer: with NAT64 and DNS64. DNS64 synthesises a AAAA record by embedding the site's IPv4 address in 64:ff9b::/96 (or a provider prefix); the client sends IPv6 to that address, and the NAT64 gateway translates to IPv4 statefully and back. Mention the IPv4-literal problem and 464XLAT on mobile networks, and contrast with tunnels (encapsulate, no translation) and dual stack (both natively).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three coexistence methods: dual stack (preferred), tunnelling, translation (NAT64).</li>
<li>6in4 uses IP protocol 41; GRE uses 47 and lowers the MTU to 1476; 6to4, Teredo and ISATAP are deprecated.</li>
<li>A tunnel appears as one IPv6 hop; route to the far tunnel end.</li>
<li>NAT64 + DNS64 let IPv6-only clients reach IPv4-only servers via 64:ff9b::/96.</li>
<li>464XLAT solves IPv4 literals on IPv6-only mobile networks; DS-Lite carries IPv4 over IPv6.</li>
</ul></div>
`,hi:`
<p>IPv4 aur IPv6 seedha ek doosre se baat nahi kar sakte: IPv6-only host apne packet header mein IPv4 address daal hi nahi sakta. Kai saalon tak dono saath rahenge, isliye Network+ aapse woh teen <b>compatibility requirements</b> poochta hai jo dono ko saath rehne dete hain. Alag track width wale do railway systems socho. Aap har jagah dono tracks bana sakte ho (<b>dual stack</b>), ek train ko doosri ke wagons par load karke us hisse ko paar kar sakte ho jahan sirf doosra track hai (<b>tunnelling</b>), ya station par passengers ko ek train se doosri mein shift kar sakte ho (<b>translation</b>, NAT64).</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Coexistence ke teen methods">
<rect x="10" y="20" width="195" height="170" rx="10" fill="#bbf7d0"/><text x="107" y="45" text-anchor="middle" class="svg-ink" font-size="14">Dual stack</text>
<text x="107" y="80" text-anchor="middle" class="svg-muted" font-size="12">IPv4 aur IPv6 dono</text><text x="107" y="98" text-anchor="middle" class="svg-muted" font-size="12">natively chalte hain</text><text x="107" y="140" text-anchor="middle" class="svg-accent" font-size="12">Preferred method</text>
<rect x="222" y="20" width="195" height="170" rx="10" fill="#bae6fd"/><text x="319" y="45" text-anchor="middle" class="svg-ink" font-size="14">Tunnelling</text>
<text x="319" y="80" text-anchor="middle" class="svg-muted" font-size="12">IPv6 packet IPv4 ke</text><text x="319" y="98" text-anchor="middle" class="svg-muted" font-size="12">andar jaata hai</text><text x="319" y="140" text-anchor="middle" class="svg-accent" font-size="12">6in4, GRE</text>
<rect x="434" y="20" width="195" height="170" rx="10" fill="#fde68a"/><text x="531" y="45" text-anchor="middle" class="svg-ink" font-size="14">Translation</text>
<text x="531" y="80" text-anchor="middle" class="svg-muted" font-size="12">IPv6-only client IPv4-only</text><text x="531" y="98" text-anchor="middle" class="svg-muted" font-size="12">server tak pahunchta hai</text><text x="531" y="140" text-anchor="middle" class="svg-accent" font-size="12">NAT64 + DNS64</text>
</svg><p class="cap">Dual stack dono chalata hai; tunnels ek ko doosre ke andar le jaate hain; translation dono ke beech convert karta hai.</p></div>

<h3>1. Dual stack</h3>
<p>Yeh aapne chapter 7 mein configure kiya. Har device dono protocols natively chalata hai, DNS A aur AAAA records deta hai, aur hosts IPv6 prefer karte hain. Yeh sabse simple aur sabse achhi performance wala option hai, lekin isme ab bhi har jagah IPv4 addresses chahiye, isliye yeh IPv4 par dependence khatam nahi karta.</p>

<h3>2. Tunnelling: IPv4-only network ke paar IPv6</h3>
<p>Kabhi kabhi do IPv6 islands ke beech aisa network hota hai jo sirf IPv4 le jaata hai, jaise woh provider jisne IPv6 enable nahi kiya. <b>Tunnel</b> ek edge par har IPv6 packet ko IPv4 packet ke andar lapet deta hai aur doosre edge par khol deta hai. Beech ka IPv4 network, yaani <b>underlay</b>, sirf IPv4 hi dekhta hai.</p>
<ul>
<li><b>6in4</b> (manual ya configured tunnel): IPv6 packet seedha IPv4 header ke andar jaata hai, <b>protocol number 41</b> ke saath. 20 bytes overhead.</li>
<li><b>GRE</b>: Generic Routing Encapsulation, <b>IP protocol 47</b>, 4-byte GRE header jodta hai, to 24 bytes overhead. Yeh IPv6, IPv4 aur multicast le ja sakta hai, isliye routers ke beech popular hai.</li>
<li><b>Purane automatic methods</b>: <b>6to4</b> (<code>2002::/16</code>), <b>Teredo</b> (NAT cross karne ke liye UDP 3544 ke andar IPv6) aur <b>ISATAP</b>. Yeh deprecated hain aur aaj aam taur par disabled hote hain; exam ke liye naam pehchano.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="IPv6 ka GRE encapsulation">
<rect x="20" y="30" width="170" height="40" rx="6" fill="#fed7aa"/><text x="105" y="55" text-anchor="middle" class="svg-ink" font-size="13">IPv4 header (47)</text>
<rect x="195" y="30" width="80" height="40" rx="6" fill="#fde68a"/><text x="235" y="55" text-anchor="middle" class="svg-ink" font-size="13">GRE</text>
<rect x="280" y="30" width="150" height="40" rx="6" fill="#bbf7d0"/><text x="355" y="55" text-anchor="middle" class="svg-ink" font-size="13">IPv6 header</text>
<rect x="435" y="30" width="185" height="40" rx="6" fill="#e2e8f0"/><text x="527" y="55" text-anchor="middle" class="svg-ink" font-size="13">ICMPv6 / TCP / UDP</text>
<text x="105" y="95" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.1 se 198.51.100.1</text>
<text x="355" y="95" text-anchor="middle" class="svg-muted" font-size="12">PC1 se SRV (IPv6)</text>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="13">ISP router sirf bahar ka IPv4 header padhta hai</text>
</svg><p class="cap">Doosre lab mein R1 aur R2 IPv6 ko IPv4 ke upar GRE mein lapet dete hain, isliye provider ko kabhi IPv6 packet nahi dikhta.</p></div>

<h3>Tunnel lab walkthrough</h3>
<p><b>IPv6 across an IPv4-only provider</b> mein head office R1 (<code>203.0.113.1</code>) aur branch R2 (<code>198.51.100.1</code>) provider router ISP ke through sirf IPv4 par ek doosre tak pahunchte hain. Pehle saabit karo ki underlay chal raha hai (R1 se <code>ping 198.51.100.1</code>), phir tunnel banao:</p>
<pre class="code"><span class="c">! R1 (R2 par ulta: 2001:db8:acad:99::2/64, source g0/0, destination 203.0.113.1)</span>
R1(config)# interface tunnel0
R1(config-if)# ipv6 address 2001:db8:acad:99::1/64
R1(config-if)# tunnel source g0/1
R1(config-if)# tunnel destination 198.51.100.1
R1(config-if)# exit
<span class="c">! Tunnel se route karo: next hop tunnel ka doosra end hai, ISP nahi</span>
R1(config)# ipv6 route ::/0 2001:db8:acad:99::2
R2(config)# ipv6 route 2001:db8:acad:10::/64 2001:db8:acad:99::1</pre>
<pre class="out">R1# show interfaces tunnel0
<span class="hl">Tunnel0 is up, line protocol is up</span>
  Tunnel source 203.0.113.1 (GigabitEthernet0/1), destination 198.51.100.1
  <span class="hl">Tunnel protocol/transport GRE/IP</span>
  Tunnel transport MTU 1476 bytes

PC1&gt; trace 2001:db8:acad:20::10
 1   2001:DB8:ACAD:10::1 0.500 ms  0.450 ms  0.480 ms
 2   <span class="hl">2001:DB8:ACAD:99::2</span> 0.700 ms  0.650 ms  0.680 ms
 3   *2001:DB8:ACAD:20::10   1.000 ms (ICMP type:3, code:3, Destination port unreachable)</pre>
<p>Trace tunnel ko <b>ek IPv6 hop</b> ki tarah dikhata hai: provider router IPv6 ko dikhta hi nahi. 1476 bytes ka transport MTU (1500 minus 24) encapsulation ki keemat hai.</p>

<h3>3. Translation: NAT64 ke saath DNS64</h3>
<p>Mobile carriers aur naye networks clients ko badhte hue <b>sirf IPv6</b> dete hain. Un clients ko phir bhi un websites tak pahunchna hai jo sirf IPv4 par hain. <b>NAT64</b> dono ke beech translate karta hai, aur <b>DNS64</b> ise transparent banata hai.</p>
<ol>
<li>IPv6-only phone DNS64 se <code>legacy.example</code> ka AAAA record maangta hai.</li>
<li>Site ke paas sirf A record hai, <code>198.51.100.20</code>. DNS64 IPv4 address ko NAT64 prefix <code>64:ff9b::/96</code> ke aakhri 32 bits mein rakh kar AAAA record <b>synthesise</b> karta hai: 198 = c6, 51 = 33, 100 = 64, 20 = 14, to <code>64:ff9b::c633:6414</code>.</li>
<li>Phone <code>64:ff9b::c633:6414</code> ko IPv6 packets bhejta hai. Routing unhe <b>NAT64 gateway</b> tak pahunchati hai.</li>
<li>Gateway apne ek public IPv4 address se <code>198.51.100.20</code> ko IPv4 packet banata hai, mapping yaad rakhta hai (stateful NAT64, PAT jaisa), aur replies ko wapas IPv6 mein translate karta hai.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> <code>64:ff9b::cb00:710a</code> kaunsa IPv4 server hai? Aakhri 32 bits ko bytes mein todo: cb = 203, 00 = 0, 71 = 113, 0a = 10, to <code>203.0.113.10</code>. Mixed tareeke se likha jaaye to wahi address <code>64:ff9b::203.0.113.10</code> hai.</p></div>
<p>NAT64 un applications ko tod deta hai jo IPv4 <b>literals</b> use karti hain (naam ki jagah app mein type kiya IPv4 address) kyunki DNS64 unhe kabhi dekhta hi nahi. Mobile networks ise <b>464XLAT</b> se theek karte hain: phone par ek chhota translator (CLAT) app ke IPv4 ko IPv6 banata hai, aur carrier ka NAT64 (PLAT) use wapas badal deta hai. Ulta idea, <b>DS-Lite</b>, customer ke IPv4 ko IPv6 ke andar provider CGNAT tak le jaata hai.</p>

<table class="cmp"><tr><th>Method</th><th>Kya solve karta hai</th><th>Keemat</th></tr>
<tr><td>Dual stack</td><td>Dono natively chalana</td><td>IPv4 addresses chahiye, har cheez do baar</td></tr>
<tr><td>6in4 / GRE tunnel</td><td>IPv4-only paths ke paar IPv6 islands</td><td>Overhead, chhota MTU, manual config</td></tr>
<tr><td>NAT64 + DNS64</td><td>IPv6-only clients ka IPv4-only servers tak pahunchna</td><td>Stateful gateway, IPv4 literals toot jaate hain</td></tr>
</table>

<div class="warn"><p><b>Common galtiyan.</b> IPv6 route ko tunnel ke doosre end ki jagah ISP ke address par point karna. Tunnel ka chhota MTU bhool jaana. Aise resolver par DNS64 enable karna jo dual-stack hosts use karte hain jinhe iski zaroorat nahi, jisse woh bina wajah NAT64 se traffic bhejte hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> NAT64 <b>IPv6-only</b> clients ko <b>IPv4-only</b> servers tak pahunchne deta hai aur use <b>DNS64</b> chahiye. Well-known NAT64 prefix <b>64:ff9b::/96</b> hai. 6in4 IP protocol <b>41</b> use karta hai; GRE <b>47</b>. Tunnelling ek protocol ko doosre ke andar le jaata hai; translate nahi karta. Dual stack preferred method hai.</p></div>

<div class="scn"><h4>Woh branch jise provider se pehle IPv6 mila</h4><p>Ek company ke head office mein native IPv6 tha, lekin nayi branch ka ekmatra provider sirf IPv4 deta tha. Branch users ko ek internal application tak IPv6 access chahiye tha jo sirf IPv6 par host thi. Engineer ne IPv4 Internet ke upar head-office aur branch routers ke beech GRE tunnel banaya, tunnel ko /64 diya, aur branch ka IPv6 default route head-office tunnel address par point kiya. Branch PC se trace ne tunnel ko ek single hop dikhaya. Bade uploads tab tak atke rahe jab tak team ne confirm nahi kiya ki ICMPv6 Packet Too Big permitted hai, taaki hosts 1476-byte tunnel MTU ke hisaab se adjust ho sakein.</p><p><b>Seekh:</b> tunnel IPv6 islands jodne ka tez tareeka hai, lekin extra header aur chhota MTU yaad rakho.</p></div>

<div class="iv"><p class="q">"IPv6-only client IPv4-only website tak kaise pahunch sakta hai?"</p><p>Strong answer: NAT64 aur DNS64 se. DNS64 site ke IPv4 address ko 64:ff9b::/96 (ya provider prefix) mein embed karke AAAA record synthesise karta hai; client us address ko IPv6 bhejta hai, aur NAT64 gateway statefully IPv4 mein aur wapas translate karta hai. IPv4-literal problem aur mobile networks par 464XLAT ka zikr karo, aur tunnels (encapsulate, translation nahi) aur dual stack (dono natively) se compare karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Coexistence ke teen methods: dual stack (preferred), tunnelling, translation (NAT64).</li>
<li>6in4 IP protocol 41 use karta hai; GRE 47 use karta hai aur MTU 1476 kar deta hai; 6to4, Teredo aur ISATAP deprecated hain.</li>
<li>Tunnel ek IPv6 hop ki tarah dikhta hai; tunnel ke doosre end ki taraf route karo.</li>
<li>NAT64 + DNS64 IPv6-only clients ko 64:ff9b::/96 ke through IPv4-only servers tak pahunchate hain.</li>
<li>464XLAT IPv6-only mobile networks par IPv4 literals solve karta hai; DS-Lite IPv4 ko IPv6 ke upar le jaata hai.</li>
</ul></div>
`}};export{e as default};