var e={id:`ospfv3-multiarea`,h:{en:`OSPFv3 multi-area and address families`,hi:`OSPFv3 multi-area aur address families`},body:{en:`
<p>When a city adds a metro line next to its bus network, the stations, zones and interchange rules stay the same; only the vehicles change. OSPFv3 is the metro line built on the same city plan. Areas, ABRs, ASBRs, network types, DR election, the adjacency process and path selection all work as you have learned. What changes is the packaging: OSPFv3 runs over IPv6 link-local addresses, it separates topology from prefixes in its LSAs, and with <b>address families</b> one process can carry both IPv6 and IPv4 routes.</p>

<h3>What stays the same, what changes</h3>
<table class="cmp"><tr><th>Topic</th><th>OSPFv2</th><th>OSPFv3</th></tr>
<tr><td>Transport</td><td>IPv4, protocol 89, 224.0.0.5/6</td><td>IPv6, next header 89, FF02::5/6, link-local source</td></tr>
<tr><td>Router ID</td><td>32-bit</td><td>32-bit, must be set manually if no IPv4 address exists</td></tr>
<tr><td>Enable on interface</td><td><code>ip ospf 1 area 10</code></td><td><code>ospfv3 1 ipv6 area 10</code></td></tr>
<tr><td>Prefixes in router/network LSAs</td><td>Yes</td><td>No: moved to intra-area prefix LSA</td></tr>
<tr><td>Authentication</td><td>In OSPF header</td><td>IPsec (AH/ESP) or the authentication trailer</td></tr>
<tr><td>Route codes</td><td>O, O IA, O E1/E2</td><td>O, OI, OE1/OE2, ON1/ON2</td></tr></table>

<h3>OSPFv3 LSA types</h3>
<table class="cmp"><tr><th>Function code</th><th>Name</th><th>OSPFv2 equivalent</th></tr>
<tr><td>0x2001</td><td>Router</td><td>Type 1, but topology only</td></tr>
<tr><td>0x2002</td><td>Network</td><td>Type 2, topology only</td></tr>
<tr><td>0x2003</td><td>Inter-area prefix</td><td>Type 3</td></tr>
<tr><td>0x2004</td><td>Inter-area router</td><td>Type 4</td></tr>
<tr><td>0x4005</td><td>AS external</td><td>Type 5</td></tr>
<tr><td>0x2007</td><td>NSSA</td><td>Type 7</td></tr>
<tr><td>0x0008</td><td>Link (link-local scope)</td><td>None: link-local address and prefixes on one link</td></tr>
<tr><td>0x2009</td><td>Intra-area prefix</td><td>None: the prefixes of an area</td></tr></table>
<p>Because router and network LSAs carry no addresses, adding a new IPv6 prefix to an interface changes only an intra-area prefix LSA, not the topology, so it does not trigger a full SPF run.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="OSPFv3 dual-stack multi-area lab">
<rect x="10" y="40" width="190" height="120" rx="12" fill="#bbf7d0"/><text x="105" y="60" text-anchor="middle" class="svg-ink" font-size="13">Area 10</text>
<rect x="215" y="40" width="210" height="120" rx="12" fill="#bae6fd"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="13">Area 0</text>
<rect x="440" y="40" width="190" height="120" rx="12" fill="#fde68a"/><text x="535" y="60" text-anchor="middle" class="svg-ink" font-size="13">Area 20</text>
<rect x="30" y="85" width="70" height="36" rx="8" fill="#e2e8f0"/><text x="65" y="108" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="175" y="85" width="80" height="36" rx="8" fill="#ddd6fe"/><text x="215" y="108" text-anchor="middle" class="svg-ink" font-size="13">ABR1</text>
<rect x="285" y="85" width="70" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="13">CORE</text>
<rect x="385" y="85" width="80" height="36" rx="8" fill="#ddd6fe"/><text x="425" y="108" text-anchor="middle" class="svg-ink" font-size="13">ABR2</text>
<rect x="540" y="85" width="70" height="36" rx="8" fill="#e2e8f0"/><text x="575" y="108" text-anchor="middle" class="svg-ink" font-size="13">R5</text>
<line x1="100" y1="103" x2="175" y2="103" stroke="#64748b" stroke-width="2"/><line x1="255" y1="103" x2="285" y2="103" stroke="#64748b" stroke-width="2"/><line x1="355" y1="103" x2="385" y2="103" stroke="#64748b" stroke-width="2"/><line x1="465" y1="103" x2="540" y2="103" stroke="#64748b" stroke-width="2"/>
<text x="65" y="145" text-anchor="middle" class="svg-muted" font-size="12">2001:DB8:10:0-3::/64</text>
<text x="575" y="145" text-anchor="middle" class="svg-muted" font-size="12">2001:DB8:20::/64</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">Same areas and RIDs; ABR1 summarises 2001:DB8:10::/62</text>
</svg><p class="cap">The lab 1 design, dual-stacked. The IPv6 plan mirrors the IPv4 one.</p></div>

<h3>Configuration with address families</h3>
<pre class="code">ABR1(config)# ipv6 unicast-routing
ABR1(config)# router ospfv3 1
ABR1(config-router)# router-id 2.2.2.2
ABR1(config-router)# address-family ipv6 unicast
ABR1(config-router-af)# area 10 range 2001:DB8:10::/62
ABR1(config-router-af)# exit-address-family
ABR1(config)# interface GigabitEthernet0/0
ABR1(config-if)# ipv6 address 2001:DB8:0:12::2/64
ABR1(config-if)# ospfv3 1 ipv6 area 10
ABR1(config-if)# ospfv3 network point-to-point
ABR1(config)# interface GigabitEthernet0/1
ABR1(config-if)# ipv6 address 2001:DB8:0:23::1/64
ABR1(config-if)# ospfv3 1 ipv6 area 0
ABR1(config-if)# ospfv3 network point-to-point</pre>
<p>To carry IPv4 in the same process, add <code>address-family ipv4 unicast</code> under <code>router ospfv3 1</code> and <code>ospfv3 1 ipv4 area 10</code> on the interface. The IPv4 address family still uses OSPFv3 packets over IPv6 link-local addresses, so the interface must have IPv6 enabled. Each address family runs its own adjacency, LSDB and SPF. The older <code>ipv6 router ospf 1</code> with <code>ipv6 ospf 1 area 10</code> syntax (from CCNA) also works for IPv6 only, and accepts the same <code>area range</code> command. Passive interfaces, costs, reference bandwidth and network types are configured the same way as in OSPFv2.</p>

<h3>Summarisation and filtering in OSPFv3</h3>
<ul>
<li>Inter-area: <code>area 10 range 2001:DB8:10::/62</code> under the IPv6 address family on the ABR.</li>
<li>External: <code>summary-prefix 2001:DB8:50::/48</code> on the ASBR.</li>
<li>Local RIB filtering: <code>distribute-list prefix-list NAME in</code> under the address family, using an <code>ipv6 prefix-list</code>.</li>
</ul>

<h3>Verification</h3>
<pre class="out">ABR1# show ospfv3 neighbor

          OSPFv3 1 address-family ipv6 (router-id 2.2.2.2)

Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
<span class="hl">1.1.1.1           0   FULL/  -        00:00:34    3               GigabitEthernet0/0</span>
<span class="hl">3.3.3.3           0   FULL/  -        00:00:38    4               GigabitEthernet0/1</span>

CORE# show ipv6 route ospf
<span class="hl">OI  2001:DB8:10::/62 [110/3]</span>
     via FE80::2, GigabitEthernet0/0
OI  2001:DB8:20::/64 [110/3]
     via FE80::4, GigabitEthernet0/1

CORE# show ospfv3 database | include Link States
                Router Link States (Area 0)
                <span class="hl">Inter Area Prefix Link States (Area 0)</span>
                Link (Type-8) Link States (Area 0)
                Intra Area Prefix Link States (Area 0)</pre>
<p>Next hops are link-local addresses: that is normal for every IPv6 IGP.</p>

<div class="eg"><p><b>Worked example.</b> Pune's IPv6 LANs are 2001:DB8:10:0::/64, 2001:DB8:10:1::/64, 2001:DB8:10:2::/64 and 2001:DB8:10:3::/64. The fourth hextet runs 0 to 3, so the last two bits vary and the first 14 bits of that hextet are common: 48 + 14 = /62. <code>area 10 range 2001:DB8:10::/62</code> replaces four inter-area prefix LSAs with one, exactly like the IPv4 /22.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting <code>ipv6 unicast-routing</code>, or not setting a router ID on an IPv6-only router. Without an IPv4 address to borrow, the OSPFv3 process cannot start and logs that it has no router ID.</p></div>

<div class="exam"><p><b>Exam trap.</b> OSPFv3 uses FF02::5 and FF02::6 and link-local next hops. Its router and network LSAs carry no prefixes; the type 3 equivalent is the inter-area prefix LSA. The IPv4 address family still rides on IPv6.</p></div>

<div class="scn"><h4>The IPv4 address family that would not start</h4><p>An engineer migrated a branch to <code>router ospfv3</code> with both address families. IPv6 neighbours came up, but the IPv4 family showed no neighbours on one WAN link. That interface had only an IPv4 address; IPv6 had never been enabled on it. Because OSPFv3 packets for both families travel over IPv6 link-local, the fix was <code>ipv6 enable</code> on the interface. The IPv4 adjacency formed immediately.</p><p><b>Lesson:</b> OSPFv3 address families share one IPv6 transport; every OSPFv3 interface needs IPv6 enabled.</p></div>

<div class="iv"><p class="q">"What are the main differences between OSPFv2 and OSPFv3 in a multi-area design?"</p><p>Strong answer: the area design, roles, network types and path selection are identical. OSPFv3 runs over IPv6 link-local with FF02::5/6, keeps a 32-bit router ID, uses per-interface <code>ospfv3 1 ipv6 area X</code>, separates topology (router/network LSAs) from prefixes (intra-area prefix and link LSAs), renames type 3 and 4 to inter-area prefix and router LSAs, and with address families can carry IPv4 as well. Summarise with <code>area range</code> in the address family.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Multi-area rules are identical in OSPFv3: area 0, ABRs, ASBRs, O &gt; OI &gt; OE1 &gt; OE2.</li>
<li>Enable per interface with <code>ospfv3 1 ipv6 area X</code> (and <code>ospfv3 1 ipv4 area X</code> for the IPv4 family).</li>
<li>New LSAs: link (0x0008) and intra-area prefix (0x2009); inter-area prefix (0x2003) replaces type 3.</li>
<li>Summarise with <code>area X range</code> in the address family, and <code>summary-prefix</code> for externals.</li>
<li>Verify with <code>show ospfv3 neighbor</code>, <code>show ospfv3 database</code> and <code>show ipv6 route ospf</code>.</li>
</ul></div>
`,hi:`
<p>Jab koi shehar apne bus network ke saath metro line jodta hai, stations, zones aur interchange rules wahi rehte hain; sirf vehicles badalte hain. OSPFv3 usi city plan par bani metro line hai. Areas, ABRs, ASBRs, network types, DR election, adjacency process aur path selection sab waise hi kaam karte hain jaise aapne seekha. Jo badalta hai woh packaging hai: OSPFv3 IPv6 link-local addresses par chalta hai, apne LSAs mein topology ko prefixes se alag karta hai, aur <b>address families</b> ke saath ek hi process IPv6 aur IPv4 dono routes le ja sakta hai.</p>

<h3>Kya same rehta hai, kya badalta hai</h3>
<table class="cmp"><tr><th>Topic</th><th>OSPFv2</th><th>OSPFv3</th></tr>
<tr><td>Transport</td><td>IPv4, protocol 89, 224.0.0.5/6</td><td>IPv6, next header 89, FF02::5/6, link-local source</td></tr>
<tr><td>Router ID</td><td>32-bit</td><td>32-bit, koi IPv4 address na ho to manually set karna padta hai</td></tr>
<tr><td>Interface par enable</td><td><code>ip ospf 1 area 10</code></td><td><code>ospfv3 1 ipv6 area 10</code></td></tr>
<tr><td>Router/network LSAs mein prefixes</td><td>Haan</td><td>Nahi: intra-area prefix LSA mein shift</td></tr>
<tr><td>Authentication</td><td>OSPF header mein</td><td>IPsec (AH/ESP) ya authentication trailer</td></tr>
<tr><td>Route codes</td><td>O, O IA, O E1/E2</td><td>O, OI, OE1/OE2, ON1/ON2</td></tr></table>

<h3>OSPFv3 LSA types</h3>
<table class="cmp"><tr><th>Function code</th><th>Naam</th><th>OSPFv2 equivalent</th></tr>
<tr><td>0x2001</td><td>Router</td><td>Type 1, par sirf topology</td></tr>
<tr><td>0x2002</td><td>Network</td><td>Type 2, sirf topology</td></tr>
<tr><td>0x2003</td><td>Inter-area prefix</td><td>Type 3</td></tr>
<tr><td>0x2004</td><td>Inter-area router</td><td>Type 4</td></tr>
<tr><td>0x4005</td><td>AS external</td><td>Type 5</td></tr>
<tr><td>0x2007</td><td>NSSA</td><td>Type 7</td></tr>
<tr><td>0x0008</td><td>Link (link-local scope)</td><td>Koi nahi: ek link par link-local address aur prefixes</td></tr>
<tr><td>0x2009</td><td>Intra-area prefix</td><td>Koi nahi: area ke prefixes</td></tr></table>
<p>Kyunki router aur network LSAs mein addresses nahi hote, interface par naya IPv6 prefix jodne se sirf intra-area prefix LSA badalta hai, topology nahi, isliye full SPF run trigger nahi hota.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="OSPFv3 dual-stack multi-area lab">
<rect x="10" y="40" width="190" height="120" rx="12" fill="#bbf7d0"/><text x="105" y="60" text-anchor="middle" class="svg-ink" font-size="13">Area 10</text>
<rect x="215" y="40" width="210" height="120" rx="12" fill="#bae6fd"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="13">Area 0</text>
<rect x="440" y="40" width="190" height="120" rx="12" fill="#fde68a"/><text x="535" y="60" text-anchor="middle" class="svg-ink" font-size="13">Area 20</text>
<rect x="30" y="85" width="70" height="36" rx="8" fill="#e2e8f0"/><text x="65" y="108" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="175" y="85" width="80" height="36" rx="8" fill="#ddd6fe"/><text x="215" y="108" text-anchor="middle" class="svg-ink" font-size="13">ABR1</text>
<rect x="285" y="85" width="70" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="13">CORE</text>
<rect x="385" y="85" width="80" height="36" rx="8" fill="#ddd6fe"/><text x="425" y="108" text-anchor="middle" class="svg-ink" font-size="13">ABR2</text>
<rect x="540" y="85" width="70" height="36" rx="8" fill="#e2e8f0"/><text x="575" y="108" text-anchor="middle" class="svg-ink" font-size="13">R5</text>
<line x1="100" y1="103" x2="175" y2="103" stroke="#64748b" stroke-width="2"/><line x1="255" y1="103" x2="285" y2="103" stroke="#64748b" stroke-width="2"/><line x1="355" y1="103" x2="385" y2="103" stroke="#64748b" stroke-width="2"/><line x1="465" y1="103" x2="540" y2="103" stroke="#64748b" stroke-width="2"/>
<text x="65" y="145" text-anchor="middle" class="svg-muted" font-size="12">2001:DB8:10:0-3::/64</text>
<text x="575" y="145" text-anchor="middle" class="svg-muted" font-size="12">2001:DB8:20::/64</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">Same areas aur RIDs; ABR1 2001:DB8:10::/62 summarise karta hai</text>
</svg><p class="cap">Lab 1 ka design, dual-stack. IPv6 plan IPv4 wale ko mirror karta hai.</p></div>

<h3>Address families ke saath configuration</h3>
<pre class="code">ABR1(config)# ipv6 unicast-routing
ABR1(config)# router ospfv3 1
ABR1(config-router)# router-id 2.2.2.2
ABR1(config-router)# address-family ipv6 unicast
ABR1(config-router-af)# area 10 range 2001:DB8:10::/62
ABR1(config-router-af)# exit-address-family
ABR1(config)# interface GigabitEthernet0/0
ABR1(config-if)# ipv6 address 2001:DB8:0:12::2/64
ABR1(config-if)# ospfv3 1 ipv6 area 10
ABR1(config-if)# ospfv3 network point-to-point
ABR1(config)# interface GigabitEthernet0/1
ABR1(config-if)# ipv6 address 2001:DB8:0:23::1/64
ABR1(config-if)# ospfv3 1 ipv6 area 0
ABR1(config-if)# ospfv3 network point-to-point</pre>
<p>Same process mein IPv4 le jaane ke liye <code>router ospfv3 1</code> ke andar <code>address-family ipv4 unicast</code> aur interface par <code>ospfv3 1 ipv4 area 10</code> jodo. IPv4 address family bhi IPv6 link-local addresses par OSPFv3 packets use karti hai, isliye interface par IPv6 enabled hona chahiye. Har address family apni adjacency, LSDB aur SPF chalati hai. Purana <code>ipv6 router ospf 1</code> aur <code>ipv6 ospf 1 area 10</code> syntax (CCNA wala) bhi sirf IPv6 ke liye kaam karta hai, aur wahi <code>area range</code> command accept karta hai. Passive interfaces, costs, reference bandwidth aur network types OSPFv2 ki tarah hi configure hote hain.</p>

<h3>OSPFv3 mein summarisation aur filtering</h3>
<ul>
<li>Inter-area: ABR par IPv6 address family ke andar <code>area 10 range 2001:DB8:10::/62</code>.</li>
<li>External: ASBR par <code>summary-prefix 2001:DB8:50::/48</code>.</li>
<li>Local RIB filtering: address family ke andar <code>distribute-list prefix-list NAME in</code>, ek <code>ipv6 prefix-list</code> ke saath.</li>
</ul>

<h3>Verification</h3>
<pre class="out">ABR1# show ospfv3 neighbor

          OSPFv3 1 address-family ipv6 (router-id 2.2.2.2)

Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
<span class="hl">1.1.1.1           0   FULL/  -        00:00:34    3               GigabitEthernet0/0</span>
<span class="hl">3.3.3.3           0   FULL/  -        00:00:38    4               GigabitEthernet0/1</span>

CORE# show ipv6 route ospf
<span class="hl">OI  2001:DB8:10::/62 [110/3]</span>
     via FE80::2, GigabitEthernet0/0
OI  2001:DB8:20::/64 [110/3]
     via FE80::4, GigabitEthernet0/1

CORE# show ospfv3 database | include Link States
                Router Link States (Area 0)
                <span class="hl">Inter Area Prefix Link States (Area 0)</span>
                Link (Type-8) Link States (Area 0)
                Intra Area Prefix Link States (Area 0)</pre>
<p>Next hops link-local addresses hain: har IPv6 IGP ke liye yeh normal hai.</p>

<div class="eg"><p><b>Worked example.</b> Pune ke IPv6 LANs 2001:DB8:10:0::/64, 2001:DB8:10:1::/64, 2001:DB8:10:2::/64 aur 2001:DB8:10:3::/64 hain. Chautha hextet 0 se 3 tak jaata hai, isliye aakhri do bits badalte hain aur us hextet ke pehle 14 bits common hain: 48 + 14 = /62. <code>area 10 range 2001:DB8:10::/62</code> chaar inter-area prefix LSAs ko ek se replace karta hai, bilkul IPv4 /22 ki tarah.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>ipv6 unicast-routing</code> bhool jaana, ya IPv6-only router par router ID set na karna. Borrow karne ke liye IPv4 address na ho to OSPFv3 process start nahi ho sakta aur log karta hai ki uske paas router ID nahi hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> OSPFv3 FF02::5 aur FF02::6 aur link-local next hops use karta hai. Uske router aur network LSAs mein prefixes nahi hote; type 3 ka equivalent inter-area prefix LSA hai. IPv4 address family bhi IPv6 par hi chalti hai.</p></div>

<div class="scn"><h4>IPv4 address family jo start nahi hui</h4><p>Ek engineer ne branch ko dono address families ke saath <code>router ospfv3</code> par migrate kiya. IPv6 neighbours up aa gaye, lekin ek WAN link par IPv4 family koi neighbour nahi dikha rahi thi. Us interface par sirf IPv4 address tha; IPv6 kabhi enable hi nahi hua tha. Kyunki dono families ke OSPFv3 packets IPv6 link-local par chalte hain, fix tha interface par <code>ipv6 enable</code>. IPv4 adjacency turant ban gayi.</p><p><b>Seekh:</b> OSPFv3 address families ek IPv6 transport share karti hain; har OSPFv3 interface par IPv6 enabled hona chahiye.</p></div>

<div class="iv"><p class="q">"Multi-area design mein OSPFv2 aur OSPFv3 ke main differences kya hain?"</p><p>Strong answer: area design, roles, network types aur path selection identical hain. OSPFv3 IPv6 link-local par FF02::5/6 ke saath chalta hai, 32-bit router ID rakhta hai, per-interface <code>ospfv3 1 ipv6 area X</code> use karta hai, topology (router/network LSAs) ko prefixes (intra-area prefix aur link LSAs) se alag karta hai, type 3 aur 4 ko inter-area prefix aur router LSAs naam deta hai, aur address families ke saath IPv4 bhi le ja sakta hai. Address family mein <code>area range</code> se summarise karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPFv3 mein multi-area rules identical hain: area 0, ABRs, ASBRs, O &gt; OI &gt; OE1 &gt; OE2.</li>
<li>Per interface <code>ospfv3 1 ipv6 area X</code> se enable karo (aur IPv4 family ke liye <code>ospfv3 1 ipv4 area X</code>).</li>
<li>Naye LSAs: link (0x0008) aur intra-area prefix (0x2009); inter-area prefix (0x2003) type 3 ki jagah leta hai.</li>
<li>Address family mein <code>area X range</code> se summarise karo, aur externals ke liye <code>summary-prefix</code>.</li>
<li><code>show ospfv3 neighbor</code>, <code>show ospfv3 database</code> aur <code>show ipv6 route ospf</code> se verify karo.</li>
</ul></div>
`}};export{e as default};