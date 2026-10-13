var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started at a railway junction with a signal operator reading destinations off the front of trains. You now know how his board is built, how he picks one line when several match, how to add lines by hand, how to keep a spare line ready, and how to find out why a train stopped. This chapter packs the module into one page to revise from before the exam or an interview.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Module map">
<rect x="10" y="20" width="145" height="70" rx="8" fill="#e2e8f0"/><text x="82" y="48" text-anchor="middle" class="svg-ink" font-size="13">Read the table</text><text x="82" y="68" text-anchor="middle" class="svg-muted" font-size="12">C, L, S, [AD/metric]</text>
<rect x="170" y="20" width="145" height="70" rx="8" fill="#bae6fd"/><text x="242" y="48" text-anchor="middle" class="svg-ink" font-size="13">Select a route</text><text x="242" y="68" text-anchor="middle" class="svg-muted" font-size="12">prefix, AD, metric</text>
<rect x="330" y="20" width="145" height="70" rx="8" fill="#ddd6fe"/><text x="402" y="48" text-anchor="middle" class="svg-ink" font-size="13">Build statics</text><text x="402" y="68" text-anchor="middle" class="svg-muted" font-size="12">3 forms, return path</text>
<rect x="490" y="20" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="560" y="48" text-anchor="middle" class="svg-ink" font-size="13">Special statics</text><text x="560" y="68" text-anchor="middle" class="svg-muted" font-size="12">default, float, host</text>
<line x1="155" y1="55" x2="170" y2="55" stroke="#64748b" stroke-width="2"/><line x1="315" y1="55" x2="330" y2="55" stroke="#64748b" stroke-width="2"/><line x1="475" y1="55" x2="490" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="120" y="125" width="400" height="60" rx="8" fill="#fde68a"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">Troubleshoot: trace, route to dst, [N], route back</text><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">test from the real source</text>
<line x1="320" y1="90" x2="320" y2="125" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The whole module on one page.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Describe the per-packet steps: accept frame, longest-match lookup, TTL decrement, next-hop MAC resolution, frame rewrite.</li>
<li>Read every field of <code>show ip route</code>, including codes, heading lines, [AD/metric], next hop, exit interface and the gateway of last resort.</li>
<li>Explain connected and /32 local routes and when they appear or vanish.</li>
<li>Find the longest prefix match for any address in a table, using binary or block sizes.</li>
<li>Recite the default AD table and apply the selection order: longest match, then AD, then metric.</li>
<li>Configure next-hop, exit-interface and fully specified static routes, and explain recursive lookup and the proxy ARP problem on Ethernet.</li>
<li>Configure default, host, summary (with Null0) and floating static routes, and choose a floating AD that beats nothing it should not.</li>
<li>Configure the IPv6 equivalents, remembering <code>ipv6 unicast-routing</code> and link-local next hops with an interface.</li>
<li>Troubleshoot with ping, traceroute, <code>show ip route x</code> and <code>show ip static route</code>, including missing return routes and loops.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Routing table (RIB)</dt><dd>The router's list of known destinations and how to reach them; CEF builds the FIB from it.</dd>
<dt>Connected / local route</dt><dd>C: the subnet of an up/up interface. L: the router's own interface address as a /32.</dd>
<dt>Longest prefix match</dt><dd>Among matching routes, the one with the longest prefix length is used.</dd>
<dt>Administrative distance</dt><dd>Local trust value of a route source; lower wins for the same prefix. Static 1, OSPF 110.</dd>
<dt>Metric</dt><dd>A protocol's own path cost; lower wins within one protocol.</dd>
<dt>Next hop</dt><dd>The neighbouring router's address that receives the packet.</dd>
<dt>Recursive lookup</dt><dd>Looking up the next-hop address to find the exit interface.</dd>
<dt>Fully specified route</dt><dd>Static with both exit interface and next hop.</dd>
<dt>Default route / gateway of last resort</dt><dd>0.0.0.0/0 (IPv6 ::/0); used when nothing more specific matches; shown as S*.</dd>
<dt>Floating static</dt><dd>A static with a higher AD that installs only when the primary route is withdrawn.</dd>
<dt>Host route</dt><dd>/32 (IPv6 /128) route to one address.</dd>
<dt>Summary route / Null0</dt><dd>One shorter prefix covering many subnets; a Null0 route discards unused space to prevent loops.</dd>
</dl>

<h3>Most tested facts</h3>
<ul>
<li>Selection order: <b>longest prefix match first</b>; AD and metric only compare routes with the same prefix and length.</li>
<li>AD: connected 0, static 1, eBGP 20, EIGRP 90, OSPF 110, IS-IS 115, RIP 120, EIGRP external 170, iBGP 200, 255 never used.</li>
<li>In <code>[110/3]</code> the first number is AD, the second is metric. <code>*</code> = candidate default.</li>
<li>Local routes are /32; they need the interface up/up, like connected routes.</li>
<li>A next-hop static installs only if the next hop is reachable; an exit-interface static only if the interface is up/up.</li>
<li>An exit-interface static prints "directly connected" but still has AD 1; on Ethernet it relies on proxy ARP.</li>
<li>Default route mask is 0.0.0.0; <code>0.0.0.0 255.255.255.255</code> is a host route.</li>
<li>A floating static must have a higher AD than the route it backs up (above 110 for OSPF).</li>
<li>IPv6: <code>ipv6 unicast-routing</code>, <code>::/0</code>, /128 host routes, link-local next hop needs the exit interface.</li>
<li>Traceroute hops that alternate between two addresses mean a routing loop.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! IPv4 static routes</span>
ip route 172.16.3.0 255.255.255.0 10.12.12.2                      <span class="c">! next hop</span>
ip route 172.16.3.0 255.255.255.0 GigabitEthernet0/1              <span class="c">! exit interface</span>
ip route 172.16.1.0 255.255.255.0 GigabitEthernet0/1 10.23.23.1   <span class="c">! fully specified</span>
ip route 0.0.0.0 0.0.0.0 100.64.1.1                               <span class="c">! default</span>
ip route 0.0.0.0 0.0.0.0 100.64.2.1 5                             <span class="c">! floating default</span>
ip route 198.51.100.200 255.255.255.255 100.64.2.1                <span class="c">! host route</span>
ip route 172.20.8.0 255.255.248.0 Null0                           <span class="c">! discard for a summary</span>
ip route 10.10.0.0 255.255.0.0 10.99.0.2 name HQ-CAMPUS           <span class="c">! summary with a label</span>
<span class="c">! IPv6</span>
ipv6 unicast-routing
ipv6 route 2001:db8:3::/64 2001:db8:12::2
ipv6 route 2001:db8:1::/64 GigabitEthernet0/0 FE80::1
ipv6 route ::/0 2001:db8:23::1
<span class="c">! verification</span>
show ip route | show ip route static | show ip route 172.16.3.10
show ip static route | show ip interface brief | show ip arp
show ipv6 route static | ping 172.16.3.10 source Gi0/0 | traceroute 172.16.3.10</pre>

<div class="warn"><p><b>Common mistake.</b> Revising commands without revising the logic. The exam rarely asks you to type <code>ip route</code>; it shows a table and asks which route a packet uses, which route gets installed, or why a ping fails. Practise reading exhibits.</p></div>

<div class="exam"><p><b>Exam trap.</b> Watch for questions that mix AD with prefix length ("an OSPF /24 and a static /16, which is used for 10.1.1.5?") and floating ADs that are too low. Both are designed to catch memorised-but-not-understood answers.</p></div>

<div class="scn"><h4>The interview whiteboard</h4><p>A fresher interviewing at a managed-services company was handed a printed routing table with seven entries and three destination addresses, and asked where each packet goes. He calculated each prefix's range, picked the longest match every time, pointed out that one static was a floating route that would not appear in the table, and noted a missing return route for one subnet. He was hired for the NOC that week.</p><p><b>Lesson:</b> reading a routing table fluently is the single most valuable skill from this module.</p></div>

<div class="iv"><p class="q">"Why would you still use static routes when dynamic routing protocols exist?"</p><p>Strong answer: for stub sites with one exit (a single default route), for predictable and secure paths with no protocol traffic or neighbours to protect, for backups via floating statics, and for special cases like host routes, Null0 discard routes and default routes toward an ISP. The trade-off is manual maintenance and no automatic reaction to remote failures, so larger networks use OSPF, often with a few statics at the edge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A router forwards by longest prefix match; AD and metric only decide between identical prefixes.</li>
<li>Static routes come in next-hop, exit-interface and fully specified forms; prefer fully specified on Ethernet.</li>
<li>Default, host, summary, Null0 and floating statics each solve a specific design problem.</li>
<li>IPv6 static routing mirrors IPv4 with a few syntax and link-local differences.</li>
<li>Troubleshoot forward and return paths from the real source; <code>show ip static route</code> reveals inactive routes.</li>
</ul></div>
`,hi:`
<p>Aapne ek railway junction se shuru kiya tha jahan signal operator trains ke aage likhe destinations padhta tha. Ab aapko pata hai ki uska board kaise banta hai, jab kai lines match karein to woh ek kaise chunta hai, lines haath se kaise jodein, spare line kaise ready rakhein, aur train kyun ruki yeh kaise pata karein. Yeh chapter poore module ko ek page mein pack karta hai taaki exam ya interview se pehle revise kar sako.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Module map">
<rect x="10" y="20" width="145" height="70" rx="8" fill="#e2e8f0"/><text x="82" y="48" text-anchor="middle" class="svg-ink" font-size="13">Table padho</text><text x="82" y="68" text-anchor="middle" class="svg-muted" font-size="12">C, L, S, [AD/metric]</text>
<rect x="170" y="20" width="145" height="70" rx="8" fill="#bae6fd"/><text x="242" y="48" text-anchor="middle" class="svg-ink" font-size="13">Route chuno</text><text x="242" y="68" text-anchor="middle" class="svg-muted" font-size="12">prefix, AD, metric</text>
<rect x="330" y="20" width="145" height="70" rx="8" fill="#ddd6fe"/><text x="402" y="48" text-anchor="middle" class="svg-ink" font-size="13">Statics banao</text><text x="402" y="68" text-anchor="middle" class="svg-muted" font-size="12">3 forms, return path</text>
<rect x="490" y="20" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="560" y="48" text-anchor="middle" class="svg-ink" font-size="13">Special statics</text><text x="560" y="68" text-anchor="middle" class="svg-muted" font-size="12">default, float, host</text>
<line x1="155" y1="55" x2="170" y2="55" stroke="#64748b" stroke-width="2"/><line x1="315" y1="55" x2="330" y2="55" stroke="#64748b" stroke-width="2"/><line x1="475" y1="55" x2="490" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="120" y="125" width="400" height="60" rx="8" fill="#fde68a"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">Troubleshoot: trace, dst ka route, [N], wapas route</text><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">asli source se test karo</text>
<line x1="320" y1="90" x2="320" y2="125" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Poora module ek page par.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Per-packet steps describe karo: frame accept, longest-match lookup, TTL decrement, next-hop MAC resolution, frame rewrite.</li>
<li><code>show ip route</code> ka har field padho, codes, heading lines, [AD/metric], next hop, exit interface aur gateway of last resort samet.</li>
<li>Connected aur /32 local routes samjhao aur woh kab aate ya gayab hote hain.</li>
<li>Binary ya block sizes se table mein kisi bhi address ka longest prefix match dhoondho.</li>
<li>Default AD table sunao aur selection order laagu karo: longest match, phir AD, phir metric.</li>
<li>Next-hop, exit-interface aur fully specified static routes configure karo, aur recursive lookup aur Ethernet par proxy ARP problem samjhao.</li>
<li>Default, host, summary (Null0 ke saath) aur floating static routes configure karo, aur aisi floating AD chuno jo kisi aise route ko na harae jise nahi harana chahiye.</li>
<li>IPv6 equivalents configure karo, <code>ipv6 unicast-routing</code> aur interface ke saath link-local next hops yaad rakhte hue.</li>
<li>Ping, traceroute, <code>show ip route x</code> aur <code>show ip static route</code> se troubleshoot karo, missing return routes aur loops samet.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Routing table (RIB)</dt><dd>Router ki known destinations aur unhe reach karne ke tarikon ki list; CEF isse FIB banata hai.</dd>
<dt>Connected / local route</dt><dd>C: up/up interface ka subnet. L: router ka apna interface address /32 ke roop mein.</dd>
<dt>Longest prefix match</dt><dd>Matching routes mein sabse lambi prefix length wala use hota hai.</dd>
<dt>Administrative distance</dt><dd>Route source ki local trust value; same prefix ke liye kam jeetti hai. Static 1, OSPF 110.</dd>
<dt>Metric</dt><dd>Protocol ki apni path cost; ek protocol ke andar kam jeetta hai.</dd>
<dt>Next hop</dt><dd>Padosi router ka address jo packet receive karta hai.</dd>
<dt>Recursive lookup</dt><dd>Exit interface dhoondhne ke liye next-hop address lookup karna.</dd>
<dt>Fully specified route</dt><dd>Exit interface aur next hop dono wala static.</dd>
<dt>Default route / gateway of last resort</dt><dd>0.0.0.0/0 (IPv6 ::/0); jab kuch aur specific match na kare tab use hota hai; S* dikhta hai.</dd>
<dt>Floating static</dt><dd>Zyada AD wala static jo sirf primary route withdraw hone par install hota hai.</dd>
<dt>Host route</dt><dd>Ek address ka /32 (IPv6 /128) route.</dd>
<dt>Summary route / Null0</dt><dd>Kai subnets cover karne wala ek chhota prefix; Null0 route loops rokne ke liye unused space discard karta hai.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<ul>
<li>Selection order: <b>pehle longest prefix match</b>; AD aur metric sirf same prefix aur length wale routes compare karte hain.</li>
<li>AD: connected 0, static 1, eBGP 20, EIGRP 90, OSPF 110, IS-IS 115, RIP 120, EIGRP external 170, iBGP 200, 255 kabhi use nahi.</li>
<li><code>[110/3]</code> mein pehla number AD hai, doosra metric. <code>*</code> = candidate default.</li>
<li>Local routes /32 hote hain; connected routes ki tarah unhe interface up/up chahiye.</li>
<li>Next-hop static tabhi install hota hai jab next hop reachable ho; exit-interface static tabhi jab interface up/up ho.</li>
<li>Exit-interface static "directly connected" print karta hai par AD 1 hi rehti hai; Ethernet par yeh proxy ARP par depend karta hai.</li>
<li>Default route ka mask 0.0.0.0 hai; <code>0.0.0.0 255.255.255.255</code> host route hai.</li>
<li>Floating static ki AD us route se zyada honi chahiye jiska woh backup hai (OSPF ke liye 110 se upar).</li>
<li>IPv6: <code>ipv6 unicast-routing</code>, <code>::/0</code>, /128 host routes, link-local next hop ko exit interface chahiye.</li>
<li>Traceroute hops jo do addresses ke beech badlein, routing loop dikhate hain.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! IPv4 static routes</span>
ip route 172.16.3.0 255.255.255.0 10.12.12.2                      <span class="c">! next hop</span>
ip route 172.16.3.0 255.255.255.0 GigabitEthernet0/1              <span class="c">! exit interface</span>
ip route 172.16.1.0 255.255.255.0 GigabitEthernet0/1 10.23.23.1   <span class="c">! fully specified</span>
ip route 0.0.0.0 0.0.0.0 100.64.1.1                               <span class="c">! default</span>
ip route 0.0.0.0 0.0.0.0 100.64.2.1 5                             <span class="c">! floating default</span>
ip route 198.51.100.200 255.255.255.255 100.64.2.1                <span class="c">! host route</span>
ip route 172.20.8.0 255.255.248.0 Null0                           <span class="c">! summary ke liye discard</span>
ip route 10.10.0.0 255.255.0.0 10.99.0.2 name HQ-CAMPUS           <span class="c">! label ke saath summary</span>
<span class="c">! IPv6</span>
ipv6 unicast-routing
ipv6 route 2001:db8:3::/64 2001:db8:12::2
ipv6 route 2001:db8:1::/64 GigabitEthernet0/0 FE80::1
ipv6 route ::/0 2001:db8:23::1
<span class="c">! verification</span>
show ip route | show ip route static | show ip route 172.16.3.10
show ip static route | show ip interface brief | show ip arp
show ipv6 route static | ping 172.16.3.10 source Gi0/0 | traceroute 172.16.3.10</pre>

<div class="warn"><p><b>Common galti.</b> Logic revise kiye bina commands revise karna. Exam shayad hi aapse <code>ip route</code> type karwata hai; woh ek table dikhata hai aur poochta hai ki packet kaunsa route use karega, kaunsa route install hoga, ya ping kyun fail ho raha hai. Exhibits padhne ki practice karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Aise questions dhyan se dekho jo AD ko prefix length ke saath mix karte hain ("OSPF /24 aur static /16, 10.1.1.5 ke liye kaunsa use hoga?") aur bahut kam floating ADs. Dono ratte hue par na samjhe answers pakadne ke liye bane hain.</p></div>

<div class="scn"><h4>Interview whiteboard</h4><p>Ek managed-services company mein interview de rahe fresher ko saat entries wali printed routing table aur teen destination addresses diye gaye, aur poocha gaya ki har packet kahan jaayega. Usne har prefix ki range calculate ki, har baar longest match chuna, bataya ki ek static floating route hai jo table mein nahi dikhega, aur ek subnet ke liye missing return route note kiya. Usi hafte use NOC mein hire kar liya gaya.</p><p><b>Seekh:</b> routing table fluently padhna is module ki sabse keemti skill hai.</p></div>

<div class="iv"><p class="q">"Jab dynamic routing protocols hain to aap static routes kyun use karoge?"</p><p>Strong answer: ek exit wali stub sites ke liye (ek default route), bina protocol traffic ya protect karne layak neighbours ke predictable aur secure paths ke liye, floating statics se backups ke liye, aur host routes, Null0 discard routes aur ISP ki taraf default routes jaise special cases ke liye. Trade-off hai manual maintenance aur remote failures par automatic reaction nahi, isliye bade networks OSPF use karte hain, aksar edge par kuch statics ke saath.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Router longest prefix match se forward karta hai; AD aur metric sirf identical prefixes ke beech decide karte hain.</li>
<li>Static routes next-hop, exit-interface aur fully specified forms mein aate hain; Ethernet par fully specified prefer karo.</li>
<li>Default, host, summary, Null0 aur floating statics har ek specific design problem solve karte hain.</li>
<li>IPv6 static routing kuch syntax aur link-local farak ke saath IPv4 jaisi hai.</li>
<li>Asli source se forward aur return paths troubleshoot karo; <code>show ip static route</code> inactive routes dikhata hai.</li>
</ul></div>
`}};export{e as default};