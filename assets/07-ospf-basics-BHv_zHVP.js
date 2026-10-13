var e={id:`ospf-basics`,h:{en:`OSPF basics: neighbours, the database, SPF and cost`,hi:`OSPF basics: neighbours, database, SPF aur cost`},body:{en:`
<p><b>Open Shortest Path First (OSPF)</b> is the most widely deployed open-standard interior routing protocol. Every major vendor supports it, which makes it the default choice in multi-vendor enterprises. OSPFv2 carries IPv4 routes; OSPFv3 carries IPv6. This chapter explains how it works; the next chapter configures it in Lab 2.</p>

<h3>An analogy: a team building one shared map</h3>
<p>Imagine a team of surveyors in a new city. First each surveyor waves to the people on the neighbouring streets to make sure they can talk (<b>hellos</b>). Then they swap notebooks until everyone has an identical copy of the full street map (<b>database synchronisation</b>). Finally each surveyor, standing at their own position, works out the shortest route to every place (<b>SPF calculation</b>). If a street closes, the surveyor who sees it tells everyone, all notebooks are updated, and everyone recalculates.</p>

<h3>Step 1: finding neighbours with hellos</h3>
<p>OSPF runs directly over IP as <b>protocol number 89</b> (not TCP or UDP). On Ethernet, each router sends a <b>hello</b> every <b>10 seconds</b> to the multicast address <b>224.0.0.5</b> (all OSPF routers). If no hello is heard for the <b>dead interval</b>, <b>40 seconds</b> by default, the neighbour is declared down. Two routers become neighbours only if their hellos agree on key settings:</p>
<ul>
<li>Same <b>area</b> number on the link.</li>
<li>Same <b>subnet and mask</b> on the shared interfaces.</li>
<li>Same <b>hello and dead timers</b>.</li>
<li>Same <b>authentication</b> settings, if used.</li>
<li>Matching area type (for example both stub) and, to reach FULL, matching <b>MTU</b>.</li>
<li><b>Different router IDs</b>.</li>
</ul>

<h3>The router ID</h3>
<p>Every OSPF router has a 32-bit <b>router ID (RID)</b> written like an IPv4 address. It is chosen in this order: the <code>router-id</code> command; otherwise the highest IP on an up loopback interface; otherwise the highest IP on any up interface. In Lab 2 there are no loopbacks, so R1's RID is 192.168.1.1, R2's is 192.168.2.1, and R3's is 10.0.23.2. Best practice is to set it explicitly so it never changes.</p>

<h3>Step 2: neighbour states up to FULL</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="OSPF neighbour states">
<rect x="5" y="20" width="80" height="38" rx="8" fill="#e2e8f0"/><text x="45" y="44" text-anchor="middle" class="svg-ink" font-size="13">Down</text>
<rect x="95" y="20" width="80" height="38" rx="8" fill="#e2e8f0"/><text x="135" y="44" text-anchor="middle" class="svg-ink" font-size="13">Init</text>
<rect x="185" y="20" width="80" height="38" rx="8" fill="#fde68a"/><text x="225" y="44" text-anchor="middle" class="svg-ink" font-size="13">2-Way</text>
<rect x="275" y="20" width="90" height="38" rx="8" fill="#bae6fd"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">ExStart</text>
<rect x="375" y="20" width="90" height="38" rx="8" fill="#bae6fd"/><text x="420" y="44" text-anchor="middle" class="svg-ink" font-size="13">Exchange</text>
<rect x="475" y="20" width="80" height="38" rx="8" fill="#bae6fd"/><text x="515" y="44" text-anchor="middle" class="svg-ink" font-size="13">Loading</text>
<rect x="565" y="20" width="70" height="38" rx="8" fill="#bbf7d0"/><text x="600" y="44" text-anchor="middle" class="svg-ink" font-size="13">FULL</text>
<text x="135" y="90" text-anchor="middle" class="svg-muted" font-size="12">heard a hello</text>
<text x="225" y="110" text-anchor="middle" class="svg-muted" font-size="12">saw my RID in its hello</text>
<text x="420" y="90" text-anchor="middle" class="svg-muted" font-size="12">compare database summaries</text>
<text x="515" y="110" text-anchor="middle" class="svg-muted" font-size="12">request missing LSAs</text>
<text x="600" y="90" text-anchor="middle" class="svg-accent" font-size="12">synced</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Stuck in Init: one-way hellos. Stuck in ExStart/Exchange: often MTU mismatch.</text>
</svg><p class="cap">The neighbour state machine. FULL means both databases are identical: the adjacency is complete.</p></div>
<p>On a multi-access segment like an Ethernet LAN with many routers, OSPF elects a <b>designated router (DR)</b> and a <b>backup DR (BDR)</b> to avoid every router synchronising with every other. The highest interface priority wins (default 1), then the highest router ID; the election is not pre-emptive. Other routers (DROTHERs) stay in <b>2-WAY</b> with each other and go FULL only with the DR and BDR, which listen on <b>224.0.0.6</b>. So "2-WAY" between two DROTHERs is normal, not a fault.</p>

<h3>Step 3: the LSDB and SPF</h3>
<p>Once FULL, each router holds the same <b>LSDB</b> for the area. It runs <b>SPF</b> with itself as the root to build a tree of shortest paths, and installs the results as <b>O</b> routes with AD 110. When something changes, only the affected LSA is flooded and SPF runs again.</p>

<h3>Cost: the OSPF metric</h3>
<p>OSPF cost = <b>reference bandwidth / interface bandwidth</b>. The default reference bandwidth is <b>100 Mbps</b>, and the cost cannot be lower than 1. The path cost is the sum of the outgoing interface costs along the path, up to and including the destination network's interface.</p>
<table class="cmp"><tr><th>Interface</th><th>Bandwidth</th><th>Default cost</th></tr>
<tr><td>Serial T1</td><td>1.544 Mbps</td><td>64</td></tr>
<tr><td>FastEthernet</td><td>100 Mbps</td><td>1</td></tr>
<tr><td>GigabitEthernet</td><td>1000 Mbps</td><td>1</td></tr>
<tr><td>10 GigabitEthernet</td><td>10000 Mbps</td><td>1</td></tr>
</table>
<p>Because 100 Mbps, 1 Gbps and 10 Gbps all get cost 1, modern networks raise the reference on <b>every</b> router with <code>auto-cost reference-bandwidth 10000</code> (in Mbps), so a 1 Gbps link costs 10 and a 10 Gbps link costs 1.</p>

<div class="eg"><p><b>Worked example: Lab 2 costs.</b> All links are GigabitEthernet, cost 1 each. From R1 to 192.168.2.0/24 directly: R1 Gi0/0 (1) + R2 Gi0/2 (1) = <b>2</b>. Via R3: R1 Gi0/1 (1) + R3 Gi0/1 (1) + R2 Gi0/2 (1) = <b>3</b>. OSPF installs the cost-2 path via R2 and shows [110/2]. When the direct link fails, the cost-3 path via R3 is the best remaining and appears as [110/3].</p></div>

<h3>Areas</h3>
<p>OSPF can split a large network into <b>areas</b> to limit flooding and SPF work. <b>Area 0</b> is the <b>backbone</b>; every other area must connect to it through an <b>area border router (ABR)</b>. A router that injects routes from outside OSPF is an <b>ASBR</b>. Routes from other areas show as <b>O IA</b>; external routes as <b>O E2</b> or <b>O E1</b>. Small networks such as Lab 2 use a single area, area 0.</p>

<div class="warn"><p><b>Common mistake.</b> Mismatched hello or dead timers, a different area number, or a different subnet mask on the two ends of a link. Any one of these stops the neighbourship completely; <code>show ip ospf neighbor</code> will simply be empty for that interface.</p></div>

<div class="exam"><p><b>Exam trap.</b> OSPF uses <b>cost</b> based on bandwidth, not hop count. It is an open standard (unlike EIGRP), uses AD 110, multicasts to 224.0.0.5 and 224.0.0.6, and IP protocol 89. FULL is the healthy adjacency state; 2-WAY is normal between DROTHERs.</p></div>

<div class="scn"><h4>The new router that would not join</h4><p>A network team installed a new distribution router. Its uplinks were up, but <code>show ip ospf neighbor</code> stayed empty. <code>show ip ospf interface</code> showed "Hello 10, Dead 40" on the core but "Hello 5, Dead 20" on the new router, copied from a template for a different site. Hellos arrived, but OSPF silently ignored them because the timers did not match. Aligning the timers brought both adjacencies to FULL within seconds.</p><p><b>Lesson:</b> when OSPF neighbours will not form, compare area, subnet, timers, authentication and MTU on both ends.</p></div>

<div class="iv"><p class="q">"What must match for two OSPF routers to become neighbours?"</p><p>Strong answer: same area, same subnet and mask, same hello and dead intervals, same authentication, same area type (stub flags), and unique router IDs; MTU must match to get past ExStart/Exchange to FULL. Mention the verification: <code>show ip ospf interface</code> for timers and area, <code>show ip ospf neighbor</code> for state.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPF is an open-standard link-state IGP: hellos, database sync, SPF, O routes with AD 110.</li>
<li>Hello 10 s, dead 40 s on Ethernet; multicast 224.0.0.5 (all) and 224.0.0.6 (DR/BDR); IP protocol 89.</li>
<li>Neighbours need matching area, subnet, timers, authentication and MTU, plus unique router IDs.</li>
<li>Cost = reference bandwidth (100 Mbps default) / interface bandwidth; path cost is the sum.</li>
<li>Area 0 is the backbone; all other areas connect to it through ABRs.</li>
</ul></div>
`,hi:`
<p><b>Open Shortest Path First (OSPF)</b> sabse zyada deploy hone wala open-standard interior routing protocol hai. Har bada vendor ise support karta hai, isliye multi-vendor enterprises mein yeh default choice hai. OSPFv2 IPv4 routes carry karta hai; OSPFv3 IPv6. Yeh chapter samjhata hai ki yeh kaise kaam karta hai; agla chapter ise Lab 2 mein configure karta hai.</p>

<h3>Ek analogy: ek team jo ek shared map banati hai</h3>
<p>Naye shehar mein surveyors ki ek team socho. Pehle har surveyor padosi galiyon ke logon ko haath hilata hai taaki pakka ho ki baat ho sakti hai (<b>hellos</b>). Phir woh notebooks exchange karte hain jab tak sabke paas poore street map ki identical copy na ho (<b>database synchronisation</b>). Aakhir mein har surveyor apni jagah khade hokar har jagah ka sabse chhota raasta nikaalta hai (<b>SPF calculation</b>). Agar koi gali band ho jaaye, jo surveyor use dekhta hai woh sabko batata hai, saari notebooks update hoti hain, aur sab dobara calculate karte hain.</p>

<h3>Step 1: hellos se neighbours dhoondhna</h3>
<p>OSPF seedhe IP par <b>protocol number 89</b> ki tarah chalta hai (TCP ya UDP nahi). Ethernet par har router har <b>10 second</b> mein multicast address <b>224.0.0.5</b> (all OSPF routers) par <b>hello</b> bhejta hai. Agar <b>dead interval</b> tak koi hello nahi suna, default <b>40 second</b>, to neighbour down declare hota hai. Do routers tabhi neighbours bante hain jab unke hellos key settings par agree karein:</p>
<ul>
<li>Link par same <b>area</b> number.</li>
<li>Shared interfaces par same <b>subnet aur mask</b>.</li>
<li>Same <b>hello aur dead timers</b>.</li>
<li>Same <b>authentication</b> settings, agar use ho.</li>
<li>Matching area type (jaise dono stub) aur FULL tak pahunchne ke liye matching <b>MTU</b>.</li>
<li><b>Alag router IDs</b>.</li>
</ul>

<h3>Router ID</h3>
<p>Har OSPF router ka 32-bit <b>router ID (RID)</b> hota hai jo IPv4 address jaisa likha jaata hai. Yeh is order mein chuna jaata hai: <code>router-id</code> command; warna up loopback interface ka sabse bada IP; warna kisi bhi up interface ka sabse bada IP. Lab 2 mein loopbacks nahi hain, isliye R1 ka RID 192.168.1.1, R2 ka 192.168.2.1, aur R3 ka 10.0.23.2 hai. Best practice hai ise explicitly set karna taaki yeh kabhi na badle.</p>

<h3>Step 2: FULL tak neighbour states</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="OSPF neighbour states">
<rect x="5" y="20" width="80" height="38" rx="8" fill="#e2e8f0"/><text x="45" y="44" text-anchor="middle" class="svg-ink" font-size="13">Down</text>
<rect x="95" y="20" width="80" height="38" rx="8" fill="#e2e8f0"/><text x="135" y="44" text-anchor="middle" class="svg-ink" font-size="13">Init</text>
<rect x="185" y="20" width="80" height="38" rx="8" fill="#fde68a"/><text x="225" y="44" text-anchor="middle" class="svg-ink" font-size="13">2-Way</text>
<rect x="275" y="20" width="90" height="38" rx="8" fill="#bae6fd"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">ExStart</text>
<rect x="375" y="20" width="90" height="38" rx="8" fill="#bae6fd"/><text x="420" y="44" text-anchor="middle" class="svg-ink" font-size="13">Exchange</text>
<rect x="475" y="20" width="80" height="38" rx="8" fill="#bae6fd"/><text x="515" y="44" text-anchor="middle" class="svg-ink" font-size="13">Loading</text>
<rect x="565" y="20" width="70" height="38" rx="8" fill="#bbf7d0"/><text x="600" y="44" text-anchor="middle" class="svg-ink" font-size="13">FULL</text>
<text x="135" y="90" text-anchor="middle" class="svg-muted" font-size="12">hello suna</text>
<text x="225" y="110" text-anchor="middle" class="svg-muted" font-size="12">uske hello mein mera RID</text>
<text x="420" y="90" text-anchor="middle" class="svg-muted" font-size="12">database summaries compare</text>
<text x="515" y="110" text-anchor="middle" class="svg-muted" font-size="12">missing LSAs maango</text>
<text x="600" y="90" text-anchor="middle" class="svg-accent" font-size="12">synced</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Init mein atka: one-way hellos. ExStart/Exchange mein atka: aksar MTU mismatch.</text>
</svg><p class="cap">Neighbour state machine. FULL matlab dono databases identical hain: adjacency poori hai.</p></div>
<p>Ethernet LAN jaise multi-access segment par jahan bahut routers hon, OSPF ek <b>designated router (DR)</b> aur ek <b>backup DR (BDR)</b> elect karta hai taaki har router ko har doosre router se synchronise na karna pade. Sabse zyada interface priority jeetti hai (default 1), phir sabse bada router ID; election pre-emptive nahi hai. Baaki routers (DROTHERs) aapas mein <b>2-WAY</b> mein rehte hain aur sirf DR aur BDR ke saath FULL jaate hain, jo <b>224.0.0.6</b> par sunte hain. To do DROTHERs ke beech "2-WAY" normal hai, fault nahi.</p>

<h3>Step 3: LSDB aur SPF</h3>
<p>FULL hone ke baad har router ke paas area ka same <b>LSDB</b> hota hai. Woh khud ko root maan kar <b>SPF</b> chalata hai, shortest paths ka tree banata hai, aur results ko AD 110 wale <b>O</b> routes ki tarah install karta hai. Jab kuch badalta hai, sirf affected LSA flood hota hai aur SPF dobara chalta hai.</p>

<h3>Cost: OSPF ka metric</h3>
<p>OSPF cost = <b>reference bandwidth / interface bandwidth</b>. Default reference bandwidth <b>100 Mbps</b> hai, aur cost 1 se kam nahi ho sakti. Path cost path ke saare outgoing interface costs ka jod hai, destination network ke interface tak aur usko milaakar.</p>
<table class="cmp"><tr><th>Interface</th><th>Bandwidth</th><th>Default cost</th></tr>
<tr><td>Serial T1</td><td>1.544 Mbps</td><td>64</td></tr>
<tr><td>FastEthernet</td><td>100 Mbps</td><td>1</td></tr>
<tr><td>GigabitEthernet</td><td>1000 Mbps</td><td>1</td></tr>
<tr><td>10 GigabitEthernet</td><td>10000 Mbps</td><td>1</td></tr>
</table>
<p>Kyunki 100 Mbps, 1 Gbps aur 10 Gbps sabko cost 1 milti hai, modern networks <b>har</b> router par <code>auto-cost reference-bandwidth 10000</code> (Mbps mein) se reference badhate hain, taaki 1 Gbps link ki cost 10 aur 10 Gbps link ki cost 1 ho.</p>

<div class="eg"><p><b>Worked example: Lab 2 costs.</b> Saare links GigabitEthernet hain, har ek ki cost 1. R1 se 192.168.2.0/24 tak seedhe: R1 Gi0/0 (1) + R2 Gi0/2 (1) = <b>2</b>. R3 ke through: R1 Gi0/1 (1) + R3 Gi0/1 (1) + R2 Gi0/2 (1) = <b>3</b>. OSPF R2 wala cost-2 path install karta hai aur [110/2] dikhata hai. Jab direct link fail hota hai, R3 wala cost-3 path bacha hua best hai aur [110/3] ki tarah dikhta hai.</p></div>

<h3>Areas</h3>
<p>OSPF bade network ko <b>areas</b> mein baant sakta hai taaki flooding aur SPF ka kaam limit ho. <b>Area 0</b> <b>backbone</b> hai; har doosra area ek <b>area border router (ABR)</b> ke through isse juda hona chahiye. Jo router OSPF ke bahar se routes inject karta hai woh <b>ASBR</b> hai. Doosre areas ke routes <b>O IA</b> ki tarah dikhte hain; external routes <b>O E2</b> ya <b>O E1</b> ki tarah. Lab 2 jaise chhote networks ek single area, area 0 use karte hain.</p>

<div class="warn"><p><b>Common galti.</b> Link ke dono ends par mismatched hello ya dead timers, alag area number, ya alag subnet mask. Inmein se koi ek bhi neighbourship poori tarah rok deta hai; <code>show ip ospf neighbor</code> us interface ke liye bas khaali rahega.</p></div>

<div class="exam"><p><b>Exam trap.</b> OSPF bandwidth par based <b>cost</b> use karta hai, hop count nahi. Yeh open standard hai (EIGRP ke ulat), AD 110 use karta hai, 224.0.0.5 aur 224.0.0.6 par multicast karta hai, aur IP protocol 89. FULL healthy adjacency state hai; DROTHERs ke beech 2-WAY normal hai.</p></div>

<div class="scn"><h4>Naya router jo join nahi hua</h4><p>Network team ne ek naya distribution router lagaya. Uske uplinks up the, lekin <code>show ip ospf neighbor</code> khaali raha. <code>show ip ospf interface</code> ne core par "Hello 10, Dead 40" dikhaya lekin naye router par "Hello 5, Dead 20", jo kisi doosri site ke template se copy hua tha. Hellos pahunche, lekin OSPF ne unhe chupchaap ignore kiya kyunki timers match nahi karte the. Timers align karte hi dono adjacencies seconds mein FULL ho gayi.</p><p><b>Seekh:</b> jab OSPF neighbours na banein, dono ends par area, subnet, timers, authentication aur MTU compare karo.</p></div>

<div class="iv"><p class="q">"Do OSPF routers ke neighbours banne ke liye kya match hona chahiye?"</p><p>Strong answer: same area, same subnet aur mask, same hello aur dead intervals, same authentication, same area type (stub flags), aur unique router IDs; ExStart/Exchange se aage FULL tak jaane ke liye MTU match hona chahiye. Verification bhi bolo: timers aur area ke liye <code>show ip ospf interface</code>, state ke liye <code>show ip ospf neighbor</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPF open-standard link-state IGP hai: hellos, database sync, SPF, AD 110 wale O routes.</li>
<li>Ethernet par hello 10 s, dead 40 s; multicast 224.0.0.5 (all) aur 224.0.0.6 (DR/BDR); IP protocol 89.</li>
<li>Neighbours ko matching area, subnet, timers, authentication aur MTU, plus unique router IDs chahiye.</li>
<li>Cost = reference bandwidth (default 100 Mbps) / interface bandwidth; path cost jod hai.</li>
<li>Area 0 backbone hai; baaki saare areas ABRs ke through isse judte hain.</li>
</ul></div>
`}};export{e as default};