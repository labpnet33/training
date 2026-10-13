var e={id:`af-config`,h:{en:`Address-family configuration: router ospfv3`,hi:`Address-family configuration: router ospfv3`},body:{en:`
<p>A family runs two kitchens in the same house: one vegetarian, one non-vegetarian. Earlier, each kitchen had its own manager and its own rulebook. Then the family decided to have one manager with a single rulebook that has two sections, "veg" and "non-veg". Same kitchens, same food, cleaner management. That is what the <b>address-family (AF)</b> style of OSPFv3 does: one <code>router ospfv3</code> process with an <code>address-family ipv6</code> section (and optionally an <code>address-family ipv4</code> section).</p>

<h3>Why a second configuration style exists</h3>
<p>The classic <code>ipv6 router ospf</code> command set appeared in the early IPv6 days. Later, RFC 5838 extended OSPFv3 so that a single protocol could carry <b>multiple address families</b>, including IPv4, by using different Instance ID ranges. Cisco introduced the <code>router ospfv3</code> CLI to match. Its advantages:</p>
<ul>
<li>One process and one router ID for IPv6 (and optionally IPv4) routing.</li>
<li>A command structure that looks like BGP and like modern IOS XE, IOS XR and NX-OS designs.</li>
<li>New OSPFv3 features on current IOS XE releases are added to this CLI first.</li>
</ul>
<p>On the wire, both styles speak the same OSPFv3 protocol. A router configured in classic style and a router configured with <code>router ospfv3 ... address-family ipv6</code> become normal neighbours, because the IPv6 address family uses Instance ID 0 by default in both cases.</p>

<h3>The lab in address-family style</h3>
<pre class="code"><span class="c">! Prerequisite unchanged</span>
R1(config)# ipv6 unicast-routing
<span class="c">! Process with router ID at the top level</span>
R1(config)# router ospfv3 10
R1(config-router)# router-id 1.1.1.1
<span class="c">! Enter the IPv6 address family (per-AF settings go here)</span>
R1(config-router)# address-family ipv6 unicast
R1(config-router-af)# exit-address-family
R1(config-router)# exit
<span class="c">! Enable per interface: process, address family, area</span>
R1(config)# interface GigabitEthernet0/0
R1(config-if)# ospfv3 10 ipv6 area 0
R1(config-if)# interface GigabitEthernet0/1
R1(config-if)# ospfv3 10 ipv6 area 0</pre>
<p>Notice the new pieces: the prompt is <code>(config-router)</code> and inside the AF it becomes <code>(config-router-af)</code>; the interface command starts with <code>ospfv3</code>, then the process ID, then the family <code>ipv6</code>, then the area. Like the classic style, there is no network command.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="router ospfv3 with address families">
<rect x="200" y="15" width="240" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">router ospfv3 10</text><text x="320" y="52" text-anchor="middle" class="svg-muted" font-size="12">router-id 1.1.1.1</text>
<rect x="60" y="100" width="230" height="56" rx="8" fill="#bbf7d0"/><text x="175" y="122" text-anchor="middle" class="svg-ink" font-size="13">address-family ipv6 unicast</text><text x="175" y="142" text-anchor="middle" class="svg-muted" font-size="12">Instance ID 0 to 31</text>
<rect x="350" y="100" width="230" height="56" rx="8" fill="#e2e8f0"/><text x="465" y="122" text-anchor="middle" class="svg-ink" font-size="13">address-family ipv4 unicast</text><text x="465" y="142" text-anchor="middle" class="svg-muted" font-size="12">optional, Instance ID 64 to 95</text>
<line x1="320" y1="59" x2="175" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="59" x2="465" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="180" width="230" height="40" rx="6" fill="#bae6fd"/><text x="175" y="205" text-anchor="middle" class="svg-ink" font-size="12">int: ospfv3 10 ipv6 area 0</text>
<rect x="350" y="180" width="230" height="40" rx="6" fill="#bae6fd"/><text x="465" y="205" text-anchor="middle" class="svg-ink" font-size="12">int: ospfv3 10 ipv4 area 0</text>
<line x1="175" y1="156" x2="175" y2="180" stroke="#64748b" stroke-width="2"/>
<line x1="465" y1="156" x2="465" y2="180" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">One process, one router ID, separate address families. Both families still travel over IPv6 link-local.</p></div>

<h3>Classic versus address-family, side by side</h3>
<table class="cmp"><tr><th>Task</th><th>Classic</th><th>Address family</th></tr>
<tr><td>Create process</td><td><code>ipv6 router ospf 10</code></td><td><code>router ospfv3 10</code> + <code>address-family ipv6 unicast</code></td></tr>
<tr><td>Router ID</td><td><code>router-id 1.1.1.1</code></td><td><code>router-id 1.1.1.1</code> (process level)</td></tr>
<tr><td>Enable on interface</td><td><code>ipv6 ospf 10 area 0</code></td><td><code>ospfv3 10 ipv6 area 0</code></td></tr>
<tr><td>Interface cost</td><td><code>ipv6 ospf cost 10</code></td><td><code>ospfv3 cost 10</code></td></tr>
<tr><td>Passive interface</td><td>under <code>ipv6 router ospf</code></td><td>under <code>address-family ipv6</code></td></tr>
<tr><td>Default route</td><td>under <code>ipv6 router ospf</code></td><td>under <code>address-family ipv6</code></td></tr>
<tr><td>Neighbours</td><td><code>show ipv6 ospf neighbor</code></td><td><code>show ospfv3 neighbor</code></td></tr>
</table>

<h3>Verification output in AF style</h3>
<pre class="out">R2# show ospfv3 neighbor

          <span class="hl">OSPFv3 10 address-family ipv6 (router-id 2.2.2.2)</span>

Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
1.1.1.1           1   FULL/BDR        00:00:35    3               GigabitEthernet0/0
3.3.3.3           1   FULL/DR         00:00:33    3               GigabitEthernet0/1

R1# show ospfv3 interface brief
Interface    PID   Area            AF          Cost  State Nbrs F/C
Gi0/1        10    0               ipv6        1     DR    0/0
Gi0/0        10    0               ipv6        1     BDR   1/1</pre>
<p>The header line tells you which address family you are looking at. <code>show ipv6 route ospf</code> is the same in both styles, because the routing table does not care how the process was configured.</p>

<h3>The IPv4 address family (concept level)</h3>
<p>With <code>address-family ipv4 unicast</code> under the same process and <code>ospfv3 10 ipv4 area 0</code> on interfaces, OSPFv3 can also route IPv4. Two facts matter: the interface must have <b>IPv6 enabled</b> (at least <code>ipv6 enable</code>), because OSPFv3 packets always travel over IPv6 link-local addresses; and the IPv4 family runs as a separate instance with its own neighbour relationships and LSDB. Most enterprises still run OSPFv2 for IPv4, which is what the dual-stack chapter uses, but you should recognise this option.</p>

<div class="eg"><p><b>Worked example.</b> R2 is being migrated from classic to AF style while R1 and R3 stay classic. The engineer removes <code>ipv6 router ospf 10</code> and the interface lines, adds <code>router ospfv3 10</code>, <code>router-id 2.2.2.2</code>, <code>address-family ipv6 unicast</code>, and <code>ospfv3 10 ipv6 area 0</code> on Gi0/0 and Gi0/1. Within 40 seconds both neighbours return to FULL: all three use Instance ID 0 for IPv6, so the styles interoperate.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Configuring <code>router ospfv3 10</code> and the interface lines but never entering <code>address-family ipv6 unicast</code>: depending on the release, the IPv6 family may not be active under the process, and nothing is advertised. Always create the AF. (2) Mixing the two styles for the same process number on one router, which makes the configuration hard to read. Pick one style per router. (3) Putting <code>passive-interface</code> at the process level when your release expects it under the AF.</p></div>
<div class="exam"><p><b>Exam trap.</b> "The address-family form of OSPFv3 carries IPv4 routes inside IPv4 packets." False. Both families use OSPFv3 packets over IPv6 link-local addresses. That is why the interface needs IPv6 enabled even for the IPv4 family.</p></div>

<div class="scn"><h4>The template that spoke a different dialect</h4><p>A new engineer copied an OSPFv3 template from a colleague's IOS XE router: <code>router ospfv3 10</code> with an IPv6 address family and <code>ospfv3 10 ipv6 area 0</code> on interfaces. The existing routers used classic <code>ipv6 router ospf 10</code>. The engineer worried the two would not talk and spent an hour searching for a "compatibility" command. A senior engineer ran <code>show ipv6 ospf neighbor</code> on the old router: FULL. Both styles use the same protocol and Instance ID 0 for IPv6. The team then standardised on the AF style for new builds and documented both.</p><p><b>Lesson:</b> the configuration style is a CLI choice, not a protocol difference.</p></div>

<div class="iv"><p class="q">"What is the difference between ipv6 router ospf and router ospfv3?"</p><p>Strong answer: both configure OSPFv3. <code>ipv6 router ospf</code> is the classic, IPv6-only CLI with <code>ipv6 ospf</code> interface commands. <code>router ospfv3</code> is the address-family CLI based on RFC 5838, where one process can have an IPv6 and an IPv4 family, enabled with <code>ospfv3 &lt;pid&gt; ipv6|ipv4 area &lt;a&gt;</code> on interfaces. They interoperate on the wire. Mention that the IPv4 family still needs IPv6 enabled on the link.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AF style: <code>router ospfv3 10</code>, <code>router-id</code>, <code>address-family ipv6 unicast</code>, then <code>ospfv3 10 ipv6 area 0</code> per interface.</li>
<li>Prompts: <code>(config-router)</code> for the process, <code>(config-router-af)</code> inside the family.</li>
<li>Classic and AF routers interoperate; IPv6 uses Instance ID 0 by default.</li>
<li>OSPFv3 can carry IPv4 with an IPv4 AF, still over IPv6 link-local.</li>
<li>Verify with <code>show ospfv3 neighbor</code> and <code>show ospfv3 interface brief</code>.</li>
</ul></div>
`,hi:`
<p>Ek family ek hi ghar mein do kitchens chalati hai: ek vegetarian, ek non-vegetarian. Pehle har kitchen ka apna manager aur apni rulebook thi. Phir family ne decide kiya ki ek hi manager hoga jiski ek rulebook mein do sections honge, "veg" aur "non-veg". Wahi kitchens, wahi khana, saaf management. OSPFv3 ka <b>address-family (AF)</b> style yahi karta hai: ek <code>router ospfv3</code> process jismein ek <code>address-family ipv6</code> section (aur optionally ek <code>address-family ipv4</code> section) hota hai.</p>

<h3>Doosra configuration style kyun hai</h3>
<p>Classic <code>ipv6 router ospf</code> command set IPv6 ke shuruaati dinon mein aaya tha. Baad mein RFC 5838 ne OSPFv3 ko extend kiya taaki ek hi protocol alag Instance ID ranges use karke <b>multiple address families</b> le ja sake, IPv4 bhi. Cisco ne iske liye <code>router ospfv3</code> CLI introduce kiya. Iske fayde:</p>
<ul>
<li>IPv6 (aur optionally IPv4) routing ke liye ek process aur ek router ID.</li>
<li>Command structure jo BGP jaisa aur modern IOS XE, IOS XR aur NX-OS designs jaisa dikhta hai.</li>
<li>Current IOS XE releases par naye OSPFv3 features pehle isi CLI mein aate hain.</li>
</ul>
<p>Wire par dono styles same OSPFv3 protocol bolte hain. Classic style mein configured router aur <code>router ospfv3 ... address-family ipv6</code> se configured router normal neighbours ban jaate hain, kyunki dono cases mein IPv6 address family default mein Instance ID 0 use karti hai.</p>

<h3>Lab address-family style mein</h3>
<pre class="code"><span class="c">! Prerequisite wahi hai</span>
R1(config)# ipv6 unicast-routing
<span class="c">! Top level par router ID ke saath process</span>
R1(config)# router ospfv3 10
R1(config-router)# router-id 1.1.1.1
<span class="c">! IPv6 address family mein jao (per-AF settings yahan aati hain)</span>
R1(config-router)# address-family ipv6 unicast
R1(config-router-af)# exit-address-family
R1(config-router)# exit
<span class="c">! Har interface par enable: process, address family, area</span>
R1(config)# interface GigabitEthernet0/0
R1(config-if)# ospfv3 10 ipv6 area 0
R1(config-if)# interface GigabitEthernet0/1
R1(config-if)# ospfv3 10 ipv6 area 0</pre>
<p>Naye hisse dekho: prompt <code>(config-router)</code> hai aur AF ke andar <code>(config-router-af)</code> ban jaata hai; interface command <code>ospfv3</code> se shuru hota hai, phir process ID, phir family <code>ipv6</code>, phir area. Classic style ki tarah, network command nahi hai.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="address families ke saath router ospfv3">
<rect x="200" y="15" width="240" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">router ospfv3 10</text><text x="320" y="52" text-anchor="middle" class="svg-muted" font-size="12">router-id 1.1.1.1</text>
<rect x="60" y="100" width="230" height="56" rx="8" fill="#bbf7d0"/><text x="175" y="122" text-anchor="middle" class="svg-ink" font-size="13">address-family ipv6 unicast</text><text x="175" y="142" text-anchor="middle" class="svg-muted" font-size="12">Instance ID 0 se 31</text>
<rect x="350" y="100" width="230" height="56" rx="8" fill="#e2e8f0"/><text x="465" y="122" text-anchor="middle" class="svg-ink" font-size="13">address-family ipv4 unicast</text><text x="465" y="142" text-anchor="middle" class="svg-muted" font-size="12">optional, Instance ID 64 se 95</text>
<line x1="320" y1="59" x2="175" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="59" x2="465" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="180" width="230" height="40" rx="6" fill="#bae6fd"/><text x="175" y="205" text-anchor="middle" class="svg-ink" font-size="12">int: ospfv3 10 ipv6 area 0</text>
<rect x="350" y="180" width="230" height="40" rx="6" fill="#bae6fd"/><text x="465" y="205" text-anchor="middle" class="svg-ink" font-size="12">int: ospfv3 10 ipv4 area 0</text>
<line x1="175" y1="156" x2="175" y2="180" stroke="#64748b" stroke-width="2"/>
<line x1="465" y1="156" x2="465" y2="180" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek process, ek router ID, alag address families. Dono families phir bhi IPv6 link-local par travel karti hain.</p></div>

<h3>Classic vs address-family, saath saath</h3>
<table class="cmp"><tr><th>Kaam</th><th>Classic</th><th>Address family</th></tr>
<tr><td>Process banana</td><td><code>ipv6 router ospf 10</code></td><td><code>router ospfv3 10</code> + <code>address-family ipv6 unicast</code></td></tr>
<tr><td>Router ID</td><td><code>router-id 1.1.1.1</code></td><td><code>router-id 1.1.1.1</code> (process level)</td></tr>
<tr><td>Interface par enable</td><td><code>ipv6 ospf 10 area 0</code></td><td><code>ospfv3 10 ipv6 area 0</code></td></tr>
<tr><td>Interface cost</td><td><code>ipv6 ospf cost 10</code></td><td><code>ospfv3 cost 10</code></td></tr>
<tr><td>Passive interface</td><td><code>ipv6 router ospf</code> ke andar</td><td><code>address-family ipv6</code> ke andar</td></tr>
<tr><td>Default route</td><td><code>ipv6 router ospf</code> ke andar</td><td><code>address-family ipv6</code> ke andar</td></tr>
<tr><td>Neighbours</td><td><code>show ipv6 ospf neighbor</code></td><td><code>show ospfv3 neighbor</code></td></tr>
</table>

<h3>AF style mein verification output</h3>
<pre class="out">R2# show ospfv3 neighbor

          <span class="hl">OSPFv3 10 address-family ipv6 (router-id 2.2.2.2)</span>

Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
1.1.1.1           1   FULL/BDR        00:00:35    3               GigabitEthernet0/0
3.3.3.3           1   FULL/DR         00:00:33    3               GigabitEthernet0/1

R1# show ospfv3 interface brief
Interface    PID   Area            AF          Cost  State Nbrs F/C
Gi0/1        10    0               ipv6        1     DR    0/0
Gi0/0        10    0               ipv6        1     BDR   1/1</pre>
<p>Header line batati hai ki aap kaunsi address family dekh rahe ho. <code>show ipv6 route ospf</code> dono styles mein same hai, kyunki routing table ko farak nahi padta ki process kaise configure hua.</p>

<h3>IPv4 address family (concept level)</h3>
<p>Same process ke andar <code>address-family ipv4 unicast</code> aur interfaces par <code>ospfv3 10 ipv4 area 0</code> ke saath OSPFv3 IPv4 bhi route kar sakta hai. Do facts important hain: interface par <b>IPv6 enabled</b> hona chahiye (kam se kam <code>ipv6 enable</code>), kyunki OSPFv3 packets hamesha IPv6 link-local addresses par travel karte hain; aur IPv4 family apne neighbour relationships aur LSDB ke saath alag instance ki tarah chalti hai. Zyada tar enterprises ab bhi IPv4 ke liye OSPFv2 chalate hain, jo dual-stack chapter mein use hota hai, lekin aapko yeh option pehchanna chahiye.</p>

<div class="eg"><p><b>Worked example.</b> R2 ko classic se AF style mein migrate kiya ja raha hai jabki R1 aur R3 classic rehte hain. Engineer <code>ipv6 router ospf 10</code> aur interface lines hatata hai, <code>router ospfv3 10</code>, <code>router-id 2.2.2.2</code>, <code>address-family ipv6 unicast</code> jodta hai, aur Gi0/0 aur Gi0/1 par <code>ospfv3 10 ipv6 area 0</code>. 40 seconds ke andar dono neighbours FULL par wapas aa jaate hain: teeno IPv6 ke liye Instance ID 0 use karte hain, isliye styles interoperate karte hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) <code>router ospfv3 10</code> aur interface lines configure karna lekin kabhi <code>address-family ipv6 unicast</code> mein enter na karna: release ke hisaab se IPv6 family process ke andar active nahi ho sakti, aur kuch advertise nahi hota. Hamesha AF banao. (2) Ek router par same process number ke liye dono styles mix karna, jisse configuration padhna mushkil ho jaata hai. Har router par ek style chuno. (3) <code>passive-interface</code> ko process level par daalna jab aapka release use AF ke andar expect karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "OSPFv3 ka address-family form IPv4 routes ko IPv4 packets ke andar le jaata hai." Galat. Dono families OSPFv3 packets IPv6 link-local addresses par use karti hain. Isiliye IPv4 family ke liye bhi interface par IPv6 enabled hona chahiye.</p></div>

<div class="scn"><h4>Template jo alag boli bolta tha</h4><p>Ek naye engineer ne colleague ke IOS XE router se OSPFv3 template copy kiya: IPv6 address family ke saath <code>router ospfv3 10</code> aur interfaces par <code>ospfv3 10 ipv6 area 0</code>. Existing routers classic <code>ipv6 router ospf 10</code> use karte the. Engineer ko dar tha ki dono baat nahi karenge aur usne ek ghanta ek "compatibility" command dhoondhne mein laga diya. Senior engineer ne purane router par <code>show ipv6 ospf neighbor</code> chalaya: FULL. Dono styles same protocol aur IPv6 ke liye Instance ID 0 use karte hain. Phir team ne naye builds ke liye AF style standard kar diya aur dono ko document kiya.</p><p><b>Seekh:</b> configuration style CLI ka choice hai, protocol ka farak nahi.</p></div>

<div class="iv"><p class="q">"ipv6 router ospf aur router ospfv3 mein kya farak hai?"</p><p>Strong answer: dono OSPFv3 configure karte hain. <code>ipv6 router ospf</code> classic, sirf-IPv6 CLI hai jismein <code>ipv6 ospf</code> interface commands hain. <code>router ospfv3</code> RFC 5838 par based address-family CLI hai, jahan ek process ki IPv6 aur IPv4 family ho sakti hai, jo interfaces par <code>ospfv3 &lt;pid&gt; ipv6|ipv4 area &lt;a&gt;</code> se enable hoti hai. Wire par dono interoperate karte hain. Batao ki IPv4 family ko bhi link par IPv6 enabled chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AF style: <code>router ospfv3 10</code>, <code>router-id</code>, <code>address-family ipv6 unicast</code>, phir har interface par <code>ospfv3 10 ipv6 area 0</code>.</li>
<li>Prompts: process ke liye <code>(config-router)</code>, family ke andar <code>(config-router-af)</code>.</li>
<li>Classic aur AF routers interoperate karte hain; IPv6 default mein Instance ID 0 use karta hai.</li>
<li>IPv4 AF ke saath OSPFv3 IPv4 bhi le ja sakta hai, phir bhi IPv6 link-local par.</li>
<li><code>show ospfv3 neighbor</code> aur <code>show ospfv3 interface brief</code> se verify karo.</li>
</ul></div>
`}};export{e as default};