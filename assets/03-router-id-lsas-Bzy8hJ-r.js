var e={id:`rid-lsas`,h:{en:`The router ID and the OSPFv3 LSA types`,hi:`Router ID aur OSPFv3 LSA types`},body:{en:`
<p>Every employee in a large company has an employee number, even if they change desk, phone and email. HR uses that number, not the desk address, to know who is who. In OSPF, that employee number is the <b>router ID</b> (RID). In OSPFv3 it has a surprising property: even in a pure IPv6 world, it is still a <b>32-bit number written like an IPv4 address</b>.</p>

<h3>How OSPFv3 picks its router ID</h3>
<p>The selection order is the same as OSPFv2, and it only looks at IPv4 addresses:</p>
<ol>
<li>The <code>router-id</code> command under the OSPFv3 process. Always preferred.</li>
<li>Otherwise, the highest IPv4 address on an up/up <b>loopback</b> interface.</li>
<li>Otherwise, the highest IPv4 address on any up/up physical interface.</li>
</ol>
<p>Notice that IPv6 addresses never appear in that list. The IPv4 address does not need to be advertised in any routing protocol; it only has to exist. On a dual-stack router, OSPFv3 therefore usually picks up the same RID as OSPFv2 automatically.</p>
<p>On an <b>IPv6-only</b> router, like every router in our lab, steps 2 and 3 find nothing. The process starts, but it cannot choose an ID, and IOS logs:</p>
<pre class="out"><span class="hl">%OSPFv3-4-NORTRID: OSPFv3 process 10 could not pick a router-id,</span>
please configure manually</pre>
<p>Until you fix it, the router sends no Hellos, forms no neighbours and shows nothing in <code>show ipv6 ospf neighbor</code>. The fix is one line:</p>
<pre class="code">R1(config)# ipv6 router ospf 10
R1(config-rtr)# router-id 1.1.1.1
<span class="c">! If the process already had a RID, a new one needs a reset:</span>
R1# clear ipv6 ospf process
Reset selected OSPFv3 processes? [no]: yes</pre>
<p>The RID must be <b>unique</b> in the OSPF domain. Two routers with the same RID confuse every LSDB, because each router's LSAs are keyed by its RID.</p>
<div class="tip"><p><b>Good habit.</b> Use a clear pattern such as 1.1.1.1, 2.2.2.2, or the router's loopback IPv4 address if the network is dual-stack. In a dual-stack network, many teams use the same RID for OSPFv2 and OSPFv3 on each router so that outputs are easy to correlate.</p></div>

<h3>Why the LSAs had to change</h3>
<p>In OSPFv2, a Router LSA (type 1) mixes two kinds of information: the <b>topology</b> (which neighbours I have and the cost to each) and the <b>addressing</b> (which IPv4 subnets sit on my links). If you added a secondary address to a LAN, the Router LSA changed, and every router in the area re-ran a full SPF even though the shape of the network had not changed.</p>
<p>OSPFv3 splits these jobs. Router and Network LSAs now carry <b>only topology</b>, identified by router IDs and interface IDs. Prefixes move into separate LSAs. When a prefix changes, routers only need a cheap partial calculation instead of a full SPF.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="OSPFv3 separates topology from prefixes">
<rect x="20" y="20" width="290" height="40" rx="8" fill="#ddd6fe"/><text x="165" y="45" text-anchor="middle" class="svg-ink" font-size="13">OSPFv2 Router LSA</text>
<rect x="20" y="70" width="140" height="40" rx="6" fill="#bae6fd"/><text x="90" y="95" text-anchor="middle" class="svg-ink" font-size="12">Topology</text>
<rect x="170" y="70" width="140" height="40" rx="6" fill="#bbf7d0"/><text x="240" y="95" text-anchor="middle" class="svg-ink" font-size="12">IPv4 prefixes</text>
<rect x="330" y="20" width="290" height="40" rx="8" fill="#ddd6fe"/><text x="475" y="45" text-anchor="middle" class="svg-ink" font-size="13">OSPFv3</text>
<rect x="330" y="70" width="290" height="40" rx="6" fill="#bae6fd"/><text x="475" y="95" text-anchor="middle" class="svg-ink" font-size="12">Type 1 Router + Type 2 Network: topology only</text>
<rect x="330" y="120" width="290" height="40" rx="6" fill="#bbf7d0"/><text x="475" y="145" text-anchor="middle" class="svg-ink" font-size="12">Type 9 Intra-Area Prefix: IPv6 prefixes</text>
<rect x="330" y="170" width="290" height="40" rx="6" fill="#fde68a"/><text x="475" y="195" text-anchor="middle" class="svg-ink" font-size="12">Type 8 Link: link-local, only on one link</text>
</svg><p class="cap">OSPFv2 packs topology and addresses into one LSA; OSPFv3 splits them into separate LSAs.</p></div>

<h3>The OSPFv3 LSA types</h3>
<table class="cmp"><tr><th>Type</th><th>Name</th><th>Flooding scope</th><th>What it carries</th></tr>
<tr><td>1</td><td>Router</td><td>Area</td><td>Router's links and costs, no prefixes</td></tr>
<tr><td>2</td><td>Network</td><td>Area</td><td>Created by the DR: routers attached to a multi-access link, no prefixes</td></tr>
<tr><td>3</td><td>Inter-Area Prefix</td><td>Area</td><td>Prefixes from other areas (was "Summary" in OSPFv2)</td></tr>
<tr><td>4</td><td>Inter-Area Router</td><td>Area</td><td>How to reach an ASBR in another area</td></tr>
<tr><td>5</td><td>AS-External</td><td>Whole domain</td><td>Redistributed routes, including a default route</td></tr>
<tr><td>7</td><td>NSSA</td><td>NSSA area</td><td>External routes inside an NSSA</td></tr>
<tr><td><b>8</b></td><td><b>Link</b></td><td><b>Link only</b></td><td>The router's link-local address and the prefixes on that link, for neighbours on the same link</td></tr>
<tr><td><b>9</b></td><td><b>Intra-Area Prefix</b></td><td>Area</td><td>IPv6 prefixes of the router's interfaces (or of a transit link, from the DR)</td></tr>
</table>
<p>For CCNA, know types 8 and 9 at concept level. <b>Type 8 (Link LSA)</b> never leaves the link: it tells neighbours "this is my link-local address, and these are the prefixes I have here". <b>Type 9 (Intra-Area Prefix LSA)</b> floods through the area and carries the prefixes that OSPFv2 used to put in type 1 and type 2 LSAs.</p>

<h3>Seeing them in the database</h3>
<pre class="out">R1# show ipv6 ospf database

            OSPFv3 Router with ID (1.1.1.1) (Process ID 10)

                Router Link States (Area 0)

ADV Router       Age         Seq#        Fragment ID  Link count  Bits
 1.1.1.1         112         0x80000003  0            1           None
 2.2.2.2         110         0x80000004  0            2           None
 3.3.3.3         108         0x80000003  0            1           None

                Net Link States (Area 0)

ADV Router       Age         Seq#        Link ID    Rtr count
 2.2.2.2         110         0x80000001  3          2
 3.3.3.3         108         0x80000001  3          2

<span class="hl">                Link (Type-8) Link States (Area 0)</span>

ADV Router       Age         Seq#        Link ID    Interface
 1.1.1.1         160         0x80000001  3          Gi0/0
 2.2.2.2         150         0x80000001  3          Gi0/0
 1.1.1.1         160         0x80000001  4          Gi0/1

<span class="hl">                Intra Area Prefix Link States (Area 0)</span>

ADV Router       Age         Seq#        Link ID    Ref-lstype  Ref-LSID
 1.1.1.1         112         0x80000003  0          0x2001      0
 2.2.2.2         110         0x80000001  3072       0x2002      3
 3.3.3.3         108         0x80000001  3072       0x2002      3
 3.3.3.3         108         0x80000003  0          0x2001      0</pre>
<p>Read it like this: three Router LSAs (one per router), two Network LSAs (R2 is DR on the R1-R2 link, R3 is DR on the R2-R3 link), Link LSAs listed per interface, and Intra-Area Prefix LSAs that point back to either a Router LSA (0x2001) for stub prefixes like the LANs or a Network LSA (0x2002) for transit links.</p>

<div class="eg"><p><b>Worked example.</b> The Delhi team adds a second prefix, 2001:DB8:ACAD:11::/64, to R1's LAN. In OSPFv2 this would change R1's Router LSA and trigger a full SPF on all routers. In OSPFv3, only R1's type 9 Intra-Area Prefix LSA (and type 8 Link LSA on that LAN) changes. R2 and R3 run a partial calculation, adding one route without recomputing the tree.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing the <code>router-id</code> on a running process and expecting it to apply immediately. IOS keeps the old RID until you run <code>clear ipv6 ospf process</code> (or reload). Doing that drops all adjacencies for a few seconds, so plan it in a change window.</p></div>
<div class="exam"><p><b>Exam trap.</b> "An IPv6-only router uses its highest IPv6 loopback address as the OSPFv3 router ID." False. The RID is 32 bits and is taken only from IPv4 addresses or the <code>router-id</code> command. With no IPv4 and no command, OSPFv3 cannot start.</p></div>

<div class="scn"><h4>The cloned configuration</h4><p>A data center team built two new edge routers by pasting the same template, including <code>router-id 10.255.0.1</code>. Both routers came up, adjacencies formed, but routes kept appearing and disappearing, and the logs showed repeated LSA refreshes. <code>show ipv6 ospf database</code> showed a single Router LSA for 10.255.0.1 whose sequence number jumped every few seconds, because two routers were fighting over it. The engineer changed one RID to 10.255.0.2 and ran <code>clear ipv6 ospf process</code> on that router. The flapping stopped.</p><p><b>Lesson:</b> a duplicate router ID does not always stop adjacencies; it corrupts the LSDB. Keep RIDs unique and documented.</p></div>

<div class="iv"><p class="q">"What are LSA types 8 and 9 in OSPFv3, and why were they added?"</p><p>Strong answer: OSPFv3 removed addressing from Router and Network LSAs so they describe topology only. Type 8, the Link LSA, has link-local flooding scope and tells neighbours on that link the router's link-local address and the prefixes on the link. Type 9, the Intra-Area Prefix LSA, floods in the area and carries the router's or transit network's IPv6 prefixes. Benefit: prefix changes do not force a full SPF. Bonus: mention type 3 is renamed Inter-Area Prefix.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The OSPFv3 RID is 32 bits: <code>router-id</code> command, then highest IPv4 loopback, then highest IPv4 interface.</li>
<li>An IPv6-only router with no <code>router-id</code> logs NORTRID and forms no neighbours.</li>
<li>Changing a RID needs <code>clear ipv6 ospf process</code>; RIDs must be unique.</li>
<li>Router and Network LSAs carry topology only; prefixes live in type 9.</li>
<li>Type 8 Link LSA stays on one link and carries the link-local address and link prefixes.</li>
</ul></div>
`,hi:`
<p>Badi company mein har employee ka ek employee number hota hai, chahe woh desk, phone aur email badal le. HR yeh jaanne ke liye ki kaun kaun hai woh number use karta hai, desk ka address nahi. OSPF mein woh employee number <b>router ID</b> (RID) hai. OSPFv3 mein iski ek hairaan karne wali property hai: pure IPv6 duniya mein bhi yeh ab bhi <b>32-bit number hai jo IPv4 address jaisa likha jaata hai</b>.</p>

<h3>OSPFv3 apna router ID kaise chunta hai</h3>
<p>Selection order OSPFv2 jaisa hi hai, aur yeh sirf IPv4 addresses dekhta hai:</p>
<ol>
<li>OSPFv3 process ke andar <code>router-id</code> command. Hamesha preferred.</li>
<li>Warna, kisi up/up <b>loopback</b> interface par sabse bada IPv4 address.</li>
<li>Warna, kisi bhi up/up physical interface par sabse bada IPv4 address.</li>
</ol>
<p>Dhyan do ki is list mein IPv6 addresses kabhi nahi aate. IPv4 address ko kisi routing protocol mein advertise hone ki zaroorat nahi; bas uska exist karna kaafi hai. Isliye dual-stack router par OSPFv3 aam taur par apne aap OSPFv2 wala hi RID utha leta hai.</p>
<p><b>IPv6-only</b> router par, jaise hamare lab ka har router, steps 2 aur 3 ko kuch nahi milta. Process start hota hai, lekin ID nahi chun paata, aur IOS log karta hai:</p>
<pre class="out"><span class="hl">%OSPFv3-4-NORTRID: OSPFv3 process 10 could not pick a router-id,</span>
please configure manually</pre>
<p>Jab tak aap ise fix nahi karte, router koi Hello nahi bhejta, koi neighbour nahi banata aur <code>show ipv6 ospf neighbor</code> mein kuch nahi dikhta. Fix ek line ka hai:</p>
<pre class="code">R1(config)# ipv6 router ospf 10
R1(config-rtr)# router-id 1.1.1.1
<span class="c">! Agar process ka pehle se RID tha, to naye ke liye reset chahiye:</span>
R1# clear ipv6 ospf process
Reset selected OSPFv3 processes? [no]: yes</pre>
<p>RID OSPF domain mein <b>unique</b> hona chahiye. Same RID wale do routers har LSDB ko confuse kar dete hain, kyunki har router ke LSAs uske RID se pehchane jaate hain.</p>
<div class="tip"><p><b>Achhi aadat.</b> Ek saaf pattern use karo jaise 1.1.1.1, 2.2.2.2, ya network dual-stack ho to router ka loopback IPv4 address. Dual-stack network mein bahut teams har router par OSPFv2 aur OSPFv3 ke liye same RID use karti hain taaki outputs aasani se match ho sakein.</p></div>

<h3>LSAs ko kyun badalna pada</h3>
<p>OSPFv2 mein Router LSA (type 1) do tarah ki information mix karta hai: <b>topology</b> (mere kaunse neighbours hain aur har ek tak cost) aur <b>addressing</b> (mere links par kaunse IPv4 subnets hain). Agar aap LAN par secondary address jodte, to Router LSA badal jaata, aur area ka har router poora SPF dobara chalata, jabki network ka shape badla hi nahi tha.</p>
<p>OSPFv3 in kaamon ko alag karta hai. Router aur Network LSAs ab <b>sirf topology</b> le jaate hain, jo router IDs aur interface IDs se pehchani jaati hai. Prefixes alag LSAs mein chale gaye. Jab prefix badalta hai, routers ko poore SPF ki jagah bas ek sasti partial calculation karni padti hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="OSPFv3 topology aur prefixes ko alag karta hai">
<rect x="20" y="20" width="290" height="40" rx="8" fill="#ddd6fe"/><text x="165" y="45" text-anchor="middle" class="svg-ink" font-size="13">OSPFv2 Router LSA</text>
<rect x="20" y="70" width="140" height="40" rx="6" fill="#bae6fd"/><text x="90" y="95" text-anchor="middle" class="svg-ink" font-size="12">Topology</text>
<rect x="170" y="70" width="140" height="40" rx="6" fill="#bbf7d0"/><text x="240" y="95" text-anchor="middle" class="svg-ink" font-size="12">IPv4 prefixes</text>
<rect x="330" y="20" width="290" height="40" rx="8" fill="#ddd6fe"/><text x="475" y="45" text-anchor="middle" class="svg-ink" font-size="13">OSPFv3</text>
<rect x="330" y="70" width="290" height="40" rx="6" fill="#bae6fd"/><text x="475" y="95" text-anchor="middle" class="svg-ink" font-size="12">Type 1 Router + Type 2 Network: sirf topology</text>
<rect x="330" y="120" width="290" height="40" rx="6" fill="#bbf7d0"/><text x="475" y="145" text-anchor="middle" class="svg-ink" font-size="12">Type 9 Intra-Area Prefix: IPv6 prefixes</text>
<rect x="330" y="170" width="290" height="40" rx="6" fill="#fde68a"/><text x="475" y="195" text-anchor="middle" class="svg-ink" font-size="12">Type 8 Link: link-local, sirf ek link par</text>
</svg><p class="cap">OSPFv2 topology aur addresses ek LSA mein bharta hai; OSPFv3 unhe alag LSAs mein baant deta hai.</p></div>

<h3>OSPFv3 LSA types</h3>
<table class="cmp"><tr><th>Type</th><th>Naam</th><th>Flooding scope</th><th>Kya le jaata hai</th></tr>
<tr><td>1</td><td>Router</td><td>Area</td><td>Router ke links aur costs, prefixes nahi</td></tr>
<tr><td>2</td><td>Network</td><td>Area</td><td>DR banata hai: multi-access link se jude routers, prefixes nahi</td></tr>
<tr><td>3</td><td>Inter-Area Prefix</td><td>Area</td><td>Doosre areas ke prefixes (OSPFv2 mein "Summary" tha)</td></tr>
<tr><td>4</td><td>Inter-Area Router</td><td>Area</td><td>Doosre area ke ASBR tak kaise pahunchein</td></tr>
<tr><td>5</td><td>AS-External</td><td>Poora domain</td><td>Redistributed routes, default route bhi</td></tr>
<tr><td>7</td><td>NSSA</td><td>NSSA area</td><td>NSSA ke andar external routes</td></tr>
<tr><td><b>8</b></td><td><b>Link</b></td><td><b>Sirf link</b></td><td>Router ka link-local address aur us link ke prefixes, same link ke neighbours ke liye</td></tr>
<tr><td><b>9</b></td><td><b>Intra-Area Prefix</b></td><td>Area</td><td>Router ke interfaces ke IPv6 prefixes (ya transit link ke, DR se)</td></tr>
</table>
<p>CCNA ke liye types 8 aur 9 concept level par jaano. <b>Type 8 (Link LSA)</b> link se kabhi bahar nahi jaata: yeh neighbours ko batata hai "yeh mera link-local address hai, aur yahan mere yeh prefixes hain". <b>Type 9 (Intra-Area Prefix LSA)</b> poore area mein flood hota hai aur woh prefixes le jaata hai jo OSPFv2 type 1 aur type 2 LSAs mein daalta tha.</p>

<h3>Database mein inhe dekhna</h3>
<pre class="out">R1# show ipv6 ospf database

            OSPFv3 Router with ID (1.1.1.1) (Process ID 10)

                Router Link States (Area 0)

ADV Router       Age         Seq#        Fragment ID  Link count  Bits
 1.1.1.1         112         0x80000003  0            1           None
 2.2.2.2         110         0x80000004  0            2           None
 3.3.3.3         108         0x80000003  0            1           None

                Net Link States (Area 0)

ADV Router       Age         Seq#        Link ID    Rtr count
 2.2.2.2         110         0x80000001  3          2
 3.3.3.3         108         0x80000001  3          2

<span class="hl">                Link (Type-8) Link States (Area 0)</span>

ADV Router       Age         Seq#        Link ID    Interface
 1.1.1.1         160         0x80000001  3          Gi0/0
 2.2.2.2         150         0x80000001  3          Gi0/0
 1.1.1.1         160         0x80000001  4          Gi0/1

<span class="hl">                Intra Area Prefix Link States (Area 0)</span>

ADV Router       Age         Seq#        Link ID    Ref-lstype  Ref-LSID
 1.1.1.1         112         0x80000003  0          0x2001      0
 2.2.2.2         110         0x80000001  3072       0x2002      3
 3.3.3.3         108         0x80000001  3072       0x2002      3
 3.3.3.3         108         0x80000003  0          0x2001      0</pre>
<p>Ise aise padho: teen Router LSAs (har router ka ek), do Network LSAs (R1-R2 link par R2 DR hai, R2-R3 link par R3 DR hai), Link LSAs har interface ke hisaab se, aur Intra-Area Prefix LSAs jo ya to Router LSA (0x2001) ki taraf point karte hain, LANs jaise stub prefixes ke liye, ya Network LSA (0x2002) ki taraf, transit links ke liye.</p>

<div class="eg"><p><b>Worked example.</b> Delhi team R1 ke LAN par doosra prefix 2001:DB8:ACAD:11::/64 jodti hai. OSPFv2 mein isse R1 ka Router LSA badalta aur saare routers par poora SPF trigger hota. OSPFv3 mein sirf R1 ka type 9 Intra-Area Prefix LSA (aur us LAN par type 8 Link LSA) badalta hai. R2 aur R3 partial calculation chalate hain, tree dobara compute kiye bina ek route jod dete hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Chalte process par <code>router-id</code> badalna aur expect karna ki woh turant lag jaaye. IOS purana RID tab tak rakhta hai jab tak aap <code>clear ipv6 ospf process</code> na chalao (ya reload na karo). Aisa karne se kuch seconds ke liye saari adjacencies gir jaati hain, isliye ise change window mein plan karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> "IPv6-only router apna highest IPv6 loopback address OSPFv3 router ID ke roop mein use karta hai." Galat. RID 32 bits ka hai aur sirf IPv4 addresses ya <code>router-id</code> command se liya jaata hai. IPv4 aur command dono na hon to OSPFv3 start nahi ho sakta.</p></div>

<div class="scn"><h4>Clone kiya hua configuration</h4><p>Ek data center team ne same template paste karke do naye edge routers banaye, jismein <code>router-id 10.255.0.1</code> bhi tha. Dono routers up hue, adjacencies bani, lekin routes aate jaate rahe, aur logs mein baar baar LSA refreshes dikhe. <code>show ipv6 ospf database</code> mein 10.255.0.1 ka ek hi Router LSA tha jiska sequence number har kuch seconds mein uchhalta tha, kyunki do routers us par lad rahe the. Engineer ne ek RID ko 10.255.0.2 kiya aur us router par <code>clear ipv6 ospf process</code> chalaya. Flapping ruk gayi.</p><p><b>Seekh:</b> duplicate router ID hamesha adjacencies nahi rokta; woh LSDB ko corrupt karta hai. RIDs unique aur documented rakho.</p></div>

<div class="iv"><p class="q">"OSPFv3 mein LSA types 8 aur 9 kya hain, aur unhe kyun joda gaya?"</p><p>Strong answer: OSPFv3 ne Router aur Network LSAs se addressing hata di taaki woh sirf topology describe karein. Type 8, Link LSA, ka flooding scope link-local hai aur woh us link ke neighbours ko router ka link-local address aur link ke prefixes batata hai. Type 9, Intra-Area Prefix LSA, area mein flood hota hai aur router ya transit network ke IPv6 prefixes le jaata hai. Fayda: prefix changes poora SPF force nahi karte. Bonus: batao ki type 3 ka naam Inter-Area Prefix ho gaya.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPFv3 RID 32 bits ka hai: <code>router-id</code> command, phir highest IPv4 loopback, phir highest IPv4 interface.</li>
<li><code>router-id</code> ke bina IPv6-only router NORTRID log karta hai aur koi neighbour nahi banata.</li>
<li>RID badalne ke liye <code>clear ipv6 ospf process</code> chahiye; RIDs unique hone chahiye.</li>
<li>Router aur Network LSAs sirf topology le jaate hain; prefixes type 9 mein rehte hain.</li>
<li>Type 8 Link LSA ek hi link par rehta hai aur link-local address aur link prefixes le jaata hai.</li>
</ul></div>
`}};export{e as default};