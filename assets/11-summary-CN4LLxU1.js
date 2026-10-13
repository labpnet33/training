var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a long drive, a pilot or a careful driver runs through a checklist, even when they have done the trip a hundred times. This chapter is your pre-flight checklist for OSPFv3 on the ENARSI exam and in interviews. If you can tick every line below without looking back, you have mastered this module.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Explain why OSPFv3 runs per link over link-local addresses, and why routes show FE80:: next hops with an exit interface.</li>
<li>Name every OSPFv3 LSA with its code and scope: 0x2001, 0x2002, 0x2003, 0x2004, 0x4005, 0x2007, 0x0008, 0x2009.</li>
<li>Read a link LSA and an intra-area prefix LSA, and say which topology LSA a type 9 references.</li>
<li>Configure OSPFv3 in traditional style and in address-family style, including the IPv4 AF.</li>
<li>Fix a NORTRID problem and explain the router ID selection order.</li>
<li>List what must match for adjacency, and spot an instance ID mismatch from interface output.</li>
<li>Configure point-to-point on Ethernet and predict the symptom of a one-sided change.</li>
<li>Make interfaces passive per process or per AF, and prove the prefix is still advertised.</li>
<li>Configure stub, totally stubby, NSSA and totally NSSA areas and predict the routing table of an internal router.</li>
<li>Calculate an IPv6 summary and configure <code>area range</code> and <code>summary-prefix</code> on the right routers.</li>
<li>Configure IPsec authentication and describe the key-chain authentication trailer.</li>
<li>Work a ticket bottom-up from <code>ipv6 unicast-routing</code> to forwarding.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="OSPFv3 at a glance">
<rect x="20" y="20" width="190" height="80" rx="8" fill="#bae6fd"/><text x="115" y="48" text-anchor="middle" class="svg-ink" font-size="13">Topology</text><text x="115" y="68" text-anchor="middle" class="svg-muted" font-size="12">0x2001 router</text><text x="115" y="86" text-anchor="middle" class="svg-muted" font-size="12">0x2002 network</text>
<rect x="225" y="20" width="190" height="80" rx="8" fill="#bbf7d0"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">Prefixes</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">0x0008 link</text><text x="320" y="86" text-anchor="middle" class="svg-muted" font-size="12">0x2009 intra-area</text>
<rect x="430" y="20" width="190" height="80" rx="8" fill="#fde68a"/><text x="525" y="48" text-anchor="middle" class="svg-ink" font-size="13">Across boundaries</text><text x="525" y="68" text-anchor="middle" class="svg-muted" font-size="12">0x2003, 0x2004</text><text x="525" y="86" text-anchor="middle" class="svg-muted" font-size="12">0x4005, 0x2007</text>
<rect x="20" y="125" width="600" height="70" rx="8" fill="#e2e8f0"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="13">Runs on FE80:: to FF02::5 / FF02::6, protocol 89, 32-bit router ID</text><text x="320" y="176" text-anchor="middle" class="svg-accent" font-size="12">Must match: area, timers, instance ID, stub flags, auth. MTU in DBD.</text>
</svg><p class="cap">The whole module on one card.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Link LSA (0x0008)</dt><dd>Link-scope LSA with a router's link-local address, priority, options and on-link prefixes.</dd>
<dt>Intra-area prefix LSA (0x2009)</dt><dd>Area-scope LSA carrying prefixes, referencing a router LSA or (from the DR) a network LSA.</dd>
<dt>Inter-area prefix LSA (0x2003)</dt><dd>The OSPFv3 name for the v2 summary LSA, sent by ABRs.</dd>
<dt>Instance ID</dt><dd>8-bit header field; must match on a link. IPv6 AF 0 to 31, IPv4 AF 64 to 95.</dd>
<dt>Interface ID</dt><dd>32-bit per-interface number; the network LSA's link state ID is the DR's interface ID.</dd>
<dt>Address family</dt><dd>RFC 5838 extension letting OSPFv3 carry IPv6 and IPv4 as separate instances.</dd>
<dt>LA bit</dt><dd>Prefix option marking a local host address, as used for /128 loopbacks.</dd>
<dt>SPI</dt><dd>Security Parameter Index; labels a manual IPsec security association (256 and up).</dd>
<dt>Authentication trailer</dt><dd>RFC 7166 HMAC digest appended to OSPFv3 packets, keyed from a key chain.</dd>
</dl>

<h3>Most tested facts</h3>
<ul>
<li>OSPFv3 does not check global prefixes in Hellos; neighbours on different /64s still form.</li>
<li>Instance ID mismatch = no neighbour and no error message.</li>
<li>No IPv4 address and no <code>router-id</code> = <code>%OSPFv3-4-NORTRID</code> and Router ID 0.0.0.0.</li>
<li>Loopbacks are advertised as /128 unless their network type is point-to-point.</li>
<li><code>FULL/  -</code> = point-to-point or point-to-multipoint; <code>2WAY/DROTHER</code> between DROTHERs is normal.</li>
<li>Broadcast versus point-to-point = FULL but missing routes; broadcast versus point-to-multipoint = no adjacency (timers).</li>
<li>Passive keeps the prefix; AF mode configures passive per address family.</li>
<li>Plain NSSA has no automatic default; stub and totally stubby do.</li>
<li><code>area range</code> on ABRs, <code>summary-prefix</code> on ASBRs; ABR installs a Null0 discard route.</li>
<li>OSPFv3 authentication = IPsec AH/ESP or RFC 7166 trailer; interface settings override area settings.</li>
<li>IPv4 AF needs IPv6 enabled on the interface and <code>ipv6 unicast-routing</code>.</li>
</ul>

<h3>Command cheat-sheet</h3>
<table class="cmp"><tr><th>Task</th><th>Traditional</th><th>Address family</th></tr>
<tr><td>Process</td><td><code>ipv6 router ospf 1</code></td><td><code>router ospfv3 1</code> + <code>address-family ipv6 unicast</code></td></tr>
<tr><td>Enable on interface</td><td><code>ipv6 ospf 1 area 0</code></td><td><code>ospfv3 1 ipv6 area 0</code> / <code>ospfv3 1 ipv4 area 0</code></td></tr>
<tr><td>Network type</td><td><code>ipv6 ospf network point-to-point</code></td><td><code>ospfv3 network point-to-point</code></td></tr>
<tr><td>Passive</td><td><code>passive-interface Gi0/2</code> under process</td><td>same, under the AF</td></tr>
<tr><td>Inter-area summary</td><td><code>area 1 range 2001:DB8:ACAD:10::/62</code></td><td>same, under the AF</td></tr>
<tr><td>External summary</td><td><code>summary-prefix 2001:DB8:FF00::/40</code></td><td>same, under the AF</td></tr>
<tr><td>Stub / NSSA</td><td><code>area 1 stub [no-summary]</code>, <code>area 1 nssa</code></td><td>same, under the AF</td></tr>
<tr><td>IPsec auth</td><td><code>ipv6 ospf authentication ipsec spi 256 sha1 KEY</code></td><td><code>ospfv3 authentication ipsec spi 256 sha1 KEY</code></td></tr>
<tr><td>Key-chain auth</td><td>use the AF-style interface command</td><td><code>ospfv3 authentication key-chain NAME</code></td></tr>
<tr><td>Neighbours</td><td><code>show ipv6 ospf neighbor</code></td><td><code>show ospfv3 neighbor</code></td></tr>
<tr><td>Interface detail</td><td><code>show ipv6 ospf interface</code></td><td><code>show ospfv3 interface</code></td></tr>
<tr><td>Database</td><td><code>show ipv6 ospf database [link|prefix]</code></td><td><code>show ospfv3 database [link|prefix]</code></td></tr>
<tr><td>Routes</td><td colspan="2"><code>show ipv6 route ospf</code> (and <code>show ip route ospfv3</code> for the IPv4 AF)</td></tr>
</table>

<div class="warn"><p><b>Common mistake.</b> Memorising commands without the symptom they fix. The exam gives you output, not a blank config prompt. For each command above, know what the broken output looks like before the fix.</p></div>

<div class="exam"><p><b>Exam trap.</b> Watch the verbs: "which command <b>verifies</b>" wants a show command; "which command <b>resolves</b>" wants a config command on the correct router. Many wrong answers are correct commands on the wrong device, such as <code>area range</code> on an internal router.</p></div>

<div class="scn"><h4>Interview day at a service provider</h4><p>A candidate was handed a printout: two routers, <code>show ipv6 ospf neighbor</code> empty on both, <code>show ipv6 ospf interface</code> for each end. Areas, timers and network types matched. The candidate went line by line and found Instance ID 0 on one side and Instance ID 2 on the other, explained that OSPFv3 silently ignores packets from another instance, and gave the fix. The panel moved straight to design questions.</p><p><b>Lesson:</b> a calm, line-by-line comparison of both ends solves most OSPFv3 puzzles.</p></div>

<div class="iv"><p class="q">"Give me a two-minute overview of OSPFv3 for a network that is going dual-stack."</p><p>Strong answer: OSPFv3 is the IPv6 OSPF: same link-state engine, but it runs per link over link-local addresses, uses FF02::5 and FF02::6, keeps topology in router and network LSAs and prefixes in link and intra-area prefix LSAs, and uses IPsec or a key-chain trailer for authentication. With address families it can also carry IPv4, so one protocol can serve both stacks. Design it like OSPFv2: manual router IDs, passive host LANs, point-to-point transit links, summaries at ABRs and stub areas at the edge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPFv3 = same engine, per-link transport, split topology and prefix LSAs.</li>
<li>Know both configuration styles and where each command lives.</li>
<li>Match area, timers, instance ID, stub flags and auth; check MTU and network type.</li>
<li>Passive user LANs, point-to-point transit links and ABR summaries are the standard design.</li>
<li>Troubleshoot bottom-up and compare both ends line by line.</li>
</ul></div>
`,hi:`
<p>Lambi drive se pehle pilot ya samajhdar driver checklist se guzarta hai, bhale hi woh safar sau baar kar chuka ho. Yeh chapter ENARSI exam aur interviews mein OSPFv3 ke liye aapki pre-flight checklist hai. Agar aap bina peeche dekhe neeche ki har line tick kar sakte ho, to aapne yeh module master kar liya.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao ki OSPFv3 link-local addresses par per link kyun chalta hai, aur routes exit interface ke saath FE80:: next hops kyun dikhate hain.</li>
<li>Har OSPFv3 LSA ka code aur scope batao: 0x2001, 0x2002, 0x2003, 0x2004, 0x4005, 0x2007, 0x0008, 0x2009.</li>
<li>Link LSA aur intra-area prefix LSA padho, aur batao ki type 9 kaunse topology LSA ko reference karta hai.</li>
<li>OSPFv3 ko traditional style aur address-family style mein configure karo, IPv4 AF samet.</li>
<li>NORTRID problem fix karo aur router ID selection order samjhao.</li>
<li>Adjacency ke liye kya match hona chahiye list karo, aur interface output se instance ID mismatch pakdo.</li>
<li>Ethernet par point-to-point configure karo aur ek-taraf change ka symptom predict karo.</li>
<li>Interfaces ko per process ya per AF passive banao, aur prove karo ki prefix abhi bhi advertise ho raha hai.</li>
<li>Stub, totally stubby, NSSA aur totally NSSA areas configure karo aur internal router ki routing table predict karo.</li>
<li>IPv6 summary calculate karo aur sahi routers par <code>area range</code> aur <code>summary-prefix</code> configure karo.</li>
<li>IPsec authentication configure karo aur key-chain authentication trailer describe karo.</li>
<li><code>ipv6 unicast-routing</code> se forwarding tak ticket bottom-up solve karo.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="OSPFv3 at a glance">
<rect x="20" y="20" width="190" height="80" rx="8" fill="#bae6fd"/><text x="115" y="48" text-anchor="middle" class="svg-ink" font-size="13">Topology</text><text x="115" y="68" text-anchor="middle" class="svg-muted" font-size="12">0x2001 router</text><text x="115" y="86" text-anchor="middle" class="svg-muted" font-size="12">0x2002 network</text>
<rect x="225" y="20" width="190" height="80" rx="8" fill="#bbf7d0"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">Prefixes</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">0x0008 link</text><text x="320" y="86" text-anchor="middle" class="svg-muted" font-size="12">0x2009 intra-area</text>
<rect x="430" y="20" width="190" height="80" rx="8" fill="#fde68a"/><text x="525" y="48" text-anchor="middle" class="svg-ink" font-size="13">Boundaries ke paar</text><text x="525" y="68" text-anchor="middle" class="svg-muted" font-size="12">0x2003, 0x2004</text><text x="525" y="86" text-anchor="middle" class="svg-muted" font-size="12">0x4005, 0x2007</text>
<rect x="20" y="125" width="600" height="70" rx="8" fill="#e2e8f0"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="13">FE80:: se FF02::5 / FF02::6 par, protocol 89, 32-bit router ID</text><text x="320" y="176" text-anchor="middle" class="svg-accent" font-size="12">Match zaroori: area, timers, instance ID, stub flags, auth. MTU DBD mein.</text>
</svg><p class="cap">Poora module ek card par.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Link LSA (0x0008)</dt><dd>Link-scope LSA jisme router ka link-local address, priority, options aur link ke prefixes hote hain.</dd>
<dt>Intra-area prefix LSA (0x2009)</dt><dd>Area-scope LSA jo prefixes le jaata hai, router LSA ya (DR se) network LSA ko reference karta hai.</dd>
<dt>Inter-area prefix LSA (0x2003)</dt><dd>v2 summary LSA ka OSPFv3 naam, ABRs bhejte hain.</dd>
<dt>Instance ID</dt><dd>8-bit header field; link par match hona chahiye. IPv6 AF 0 se 31, IPv4 AF 64 se 95.</dd>
<dt>Interface ID</dt><dd>32-bit per-interface number; network LSA ka link state ID DR ka interface ID hota hai.</dd>
<dt>Address family</dt><dd>RFC 5838 extension jo OSPFv3 ko IPv6 aur IPv4 alag instances ki tarah le jaane deta hai.</dd>
<dt>LA bit</dt><dd>Prefix option jo local host address mark karta hai, jaise /128 loopbacks ke liye.</dd>
<dt>SPI</dt><dd>Security Parameter Index; manual IPsec security association ko label karta hai (256 aur upar).</dd>
<dt>Authentication trailer</dt><dd>OSPFv3 packets ke saath juda RFC 7166 HMAC digest, key chain se key kiya hua.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<ul>
<li>OSPFv3 Hellos mein global prefixes check nahi karta; alag /64s par neighbours bhi ban jaate hain.</li>
<li>Instance ID mismatch = neighbour nahi aur koi error message nahi.</li>
<li>Na IPv4 address na <code>router-id</code> = <code>%OSPFv3-4-NORTRID</code> aur Router ID 0.0.0.0.</li>
<li>Loopbacks /128 advertise hote hain jab tak unka network type point-to-point na ho.</li>
<li><code>FULL/  -</code> = point-to-point ya point-to-multipoint; DROTHERs ke beech <code>2WAY/DROTHER</code> normal hai.</li>
<li>Broadcast vs point-to-point = FULL lekin routes gayab; broadcast vs point-to-multipoint = adjacency nahi (timers).</li>
<li>Passive prefix rakhta hai; AF mode passive har address family ke liye configure karta hai.</li>
<li>Plain NSSA ko automatic default nahi milta; stub aur totally stubby ko milta hai.</li>
<li>ABRs par <code>area range</code>, ASBRs par <code>summary-prefix</code>; ABR Null0 discard route install karta hai.</li>
<li>OSPFv3 authentication = IPsec AH/ESP ya RFC 7166 trailer; interface settings area settings ko override karti hain.</li>
<li>IPv4 AF ko interface par IPv6 enabled aur <code>ipv6 unicast-routing</code> chahiye.</li>
</ul>

<h3>Command cheat-sheet</h3>
<table class="cmp"><tr><th>Kaam</th><th>Traditional</th><th>Address family</th></tr>
<tr><td>Process</td><td><code>ipv6 router ospf 1</code></td><td><code>router ospfv3 1</code> + <code>address-family ipv6 unicast</code></td></tr>
<tr><td>Interface par enable</td><td><code>ipv6 ospf 1 area 0</code></td><td><code>ospfv3 1 ipv6 area 0</code> / <code>ospfv3 1 ipv4 area 0</code></td></tr>
<tr><td>Network type</td><td><code>ipv6 ospf network point-to-point</code></td><td><code>ospfv3 network point-to-point</code></td></tr>
<tr><td>Passive</td><td>process ke neeche <code>passive-interface Gi0/2</code></td><td>same, AF ke neeche</td></tr>
<tr><td>Inter-area summary</td><td><code>area 1 range 2001:DB8:ACAD:10::/62</code></td><td>same, AF ke neeche</td></tr>
<tr><td>External summary</td><td><code>summary-prefix 2001:DB8:FF00::/40</code></td><td>same, AF ke neeche</td></tr>
<tr><td>Stub / NSSA</td><td><code>area 1 stub [no-summary]</code>, <code>area 1 nssa</code></td><td>same, AF ke neeche</td></tr>
<tr><td>IPsec auth</td><td><code>ipv6 ospf authentication ipsec spi 256 sha1 KEY</code></td><td><code>ospfv3 authentication ipsec spi 256 sha1 KEY</code></td></tr>
<tr><td>Key-chain auth</td><td>AF-style interface command use karo</td><td><code>ospfv3 authentication key-chain NAME</code></td></tr>
<tr><td>Neighbours</td><td><code>show ipv6 ospf neighbor</code></td><td><code>show ospfv3 neighbor</code></td></tr>
<tr><td>Interface detail</td><td><code>show ipv6 ospf interface</code></td><td><code>show ospfv3 interface</code></td></tr>
<tr><td>Database</td><td><code>show ipv6 ospf database [link|prefix]</code></td><td><code>show ospfv3 database [link|prefix]</code></td></tr>
<tr><td>Routes</td><td colspan="2"><code>show ipv6 route ospf</code> (aur IPv4 AF ke liye <code>show ip route ospfv3</code>)</td></tr>
</table>

<div class="warn"><p><b>Common galti.</b> Commands ko bina us symptom ke ratna jo woh fix karti hain. Exam aapko output deta hai, khaali config prompt nahi. Upar ki har command ke liye jaano ki fix se pehle toota output kaisa dikhta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Verbs par dhyan do: "kaunsi command <b>verify</b> karti hai" show command maangta hai; "kaunsi command <b>resolve</b> karti hai" sahi router par config command maangta hai. Bahut saare galat answers galat device par sahi commands hote hain, jaise internal router par <code>area range</code>.</p></div>

<div class="scn"><h4>Service provider mein interview ka din</h4><p>Ek candidate ko printout diya gaya: do routers, dono par <code>show ipv6 ospf neighbor</code> khaali, har end ka <code>show ipv6 ospf interface</code>. Areas, timers aur network types match karte the. Candidate ne line by line dekha aur ek side par Instance ID 0 aur doosri par Instance ID 2 paaya, samjhaya ki OSPFv3 doosre instance ke packets chupchaap ignore karta hai, aur fix bataya. Panel seedhe design questions par chala gaya.</p><p><b>Seekh:</b> dono ends ka shaant, line-by-line comparison zyada tar OSPFv3 puzzles solve kar deta hai.</p></div>

<div class="iv"><p class="q">"Dual-stack ho rahe network ke liye mujhe OSPFv3 ka do minute ka overview do."</p><p>Strong answer: OSPFv3 IPv6 ka OSPF hai: same link-state engine, lekin yeh link-local addresses par per link chalta hai, FF02::5 aur FF02::6 use karta hai, topology router aur network LSAs mein aur prefixes link aur intra-area prefix LSAs mein rakhta hai, aur authentication ke liye IPsec ya key-chain trailer use karta hai. Address families ke saath yeh IPv4 bhi le ja sakta hai, isliye ek protocol dono stacks serve kar sakta hai. Ise OSPFv2 ki tarah design karo: manual router IDs, passive host LANs, point-to-point transit links, ABRs par summaries aur edge par stub areas.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPFv3 = same engine, per-link transport, alag topology aur prefix LSAs.</li>
<li>Dono configuration styles aur har command kahan rehti hai, jaano.</li>
<li>Area, timers, instance ID, stub flags aur auth match karo; MTU aur network type check karo.</li>
<li>Passive user LANs, point-to-point transit links aur ABR summaries standard design hain.</li>
<li>Bottom-up troubleshoot karo aur dono ends line by line compare karo.</li>
</ul></div>
`}};export{e as default};