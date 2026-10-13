var e={id:`how-ospf-works`,h:{en:`How OSPF works: LSDB, SPF and the five packet types`,hi:`OSPF kaise kaam karta hai: LSDB, SPF aur paanch packet types`},body:{en:`
<p>Think of an office notice board. Every department pins one notice about itself: who works there and which doors lead where. Every employee keeps a photocopy of <b>every</b> notice. When the accounts department moves a door, it pins a new version of its own notice, and everyone replaces their old copy. Nobody rewrites another department's notice. OSPF works exactly like this. Each router describes only itself, every router keeps a copy of every description, and each one works out its own routes from the full set.</p>

<h3>Three tables inside every OSPF router</h3>
<table class="cmp"><tr><th>Table</th><th>What it holds</th><th>Command</th></tr>
<tr><td><b>Neighbour table</b></td><td>Routers discovered with Hello packets on each interface, and the state of each relationship</td><td><code>show ip ospf neighbor</code></td></tr>
<tr><td><b>Topology table (LSDB)</b></td><td>Every LSA in the area: the full map, identical on every router in the area</td><td><code>show ip ospf database</code></td></tr>
<tr><td><b>Routing table</b></td><td>The best routes computed by SPF, offered to the router's main routing table</td><td><code>show ip route ospf</code></td></tr>
</table>

<h3>From power-on to routes, step by step</h3>
<ol>
<li><b>Discover neighbours.</b> Each OSPF interface sends a <b>Hello</b> every 10 seconds on Ethernet. Routers whose Hellos agree become neighbours.</li>
<li><b>Synchronise databases.</b> Neighbours describe the LSAs they hold (<b>DBD</b>), ask for the ones they are missing (<b>LSR</b>), receive them (<b>LSU</b>) and confirm receipt (<b>LSAck</b>).</li>
<li><b>Run SPF.</b> With a complete LSDB, each router runs Dijkstra's Shortest Path First algorithm, placing itself at the root of a tree, and finds the lowest-cost path to every network.</li>
<li><b>Install routes.</b> The best paths go into the routing table with AD 110.</li>
<li><b>Maintain.</b> Hellos continue as keepalives. When a link changes, the router that owns it floods a new version of its LSA, and every router reruns SPF. Each LSA is also refreshed every 30 minutes even if nothing changes.</li>
</ol>

<h3>The five OSPF packet types</h3>
<table class="cmp"><tr><th>Type</th><th>Name</th><th>Job</th></tr>
<tr><td>1</td><td><b>Hello</b></td><td>Discover and keep neighbours; carries the parameters that must match; elects DR/BDR</td></tr>
<tr><td>2</td><td><b>DBD</b> (Database Description)</td><td>A summary list of the LSAs a router holds, like a table of contents</td></tr>
<tr><td>3</td><td><b>LSR</b> (Link-State Request)</td><td>"Please send me these LSAs, mine are missing or older"</td></tr>
<tr><td>4</td><td><b>LSU</b> (Link-State Update)</td><td>Carries one or more full LSAs; used for sync and for flooding changes</td></tr>
<tr><td>5</td><td><b>LSAck</b></td><td>Confirms each LSA received, which makes flooding reliable</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="OSPF packet exchange between R1 and R2">
<rect x="40" y="10" width="90" height="34" rx="8" fill="#bae6fd"/><text x="85" y="32" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="510" y="10" width="90" height="34" rx="8" fill="#bae6fd"/><text x="555" y="32" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<line x1="85" y1="44" x2="85" y2="250" stroke="#64748b" stroke-width="2"/><line x1="555" y1="44" x2="555" y2="250" stroke="#64748b" stroke-width="2"/>
<line x1="85" y1="66" x2="555" y2="76" stroke="#64748b" stroke-width="2"/><text x="320" y="64" text-anchor="middle" class="svg-ink" font-size="12">1 Hello (to 224.0.0.5)</text>
<line x1="555" y1="96" x2="85" y2="106" stroke="#64748b" stroke-width="2"/><text x="320" y="94" text-anchor="middle" class="svg-ink" font-size="12">1 Hello, now listing R1's RID</text>
<line x1="85" y1="126" x2="555" y2="136" stroke="#64748b" stroke-width="2"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="12">2 DBD: my LSA headers</text>
<line x1="555" y1="156" x2="85" y2="166" stroke="#64748b" stroke-width="2"/><text x="320" y="154" text-anchor="middle" class="svg-ink" font-size="12">3 LSR: send me LSA 2.2.2.2</text>
<line x1="85" y1="186" x2="555" y2="196" stroke="#64748b" stroke-width="2"/><text x="320" y="184" text-anchor="middle" class="svg-ink" font-size="12">4 LSU: here is the full LSA</text>
<line x1="555" y1="216" x2="85" y2="226" stroke="#64748b" stroke-width="2"/><text x="320" y="214" text-anchor="middle" class="svg-ink" font-size="12">5 LSAck: received</text>
<text x="320" y="250" text-anchor="middle" class="svg-accent" font-size="12">Both LSDBs identical: state FULL</text>
</svg><p class="cap">A simplified adjacency: Hellos first, then the database exchange (both sides send DBDs, LSRs and LSUs in reality).</p></div>

<h3>How OSPF travels on the wire</h3>
<ul>
<li>OSPF runs <b>directly on IP with protocol number 89</b>. It does not use TCP or UDP, so it builds its own reliability with LSAcks and retransmissions.</li>
<li>Hellos and most updates go to multicast <b>224.0.0.5</b> (AllSPFRouters, every OSPF router). Updates towards the DR and BDR go to <b>224.0.0.6</b> (AllDRouters). On Ethernet these map to MAC addresses 0100.5e00.0005 and 0100.5e00.0006.</li>
<li>OSPF packets have a TTL of 1: they never leave the local link. Neighbours must share a subnet.</li>
<li>Every LSA carries a <b>sequence number</b>, starting at 0x80000001. A higher number means a newer LSA, and it replaces the older copy everywhere.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> In the lab chain, the R3 to R4 cable is pulled. R3 sees its Gi0/1 go down, removes the link from its router LSA, raises the sequence number from 0x80000004 to 0x80000005 and floods an LSU to R2. R2 acknowledges it, installs it and floods it to R1. R4 does the same from its side. R1 and R2 rerun SPF, find no path to 4.4.4.4 or 10.0.34.0/30 any more, and remove both routes. With physical link-down detection this takes well under a second on each router; only a silent failure waits for the 40-second dead timer.</p></div>

<pre class="out">R1# show ip ospf | include SPF algorithm
        SPF algorithm last executed 00:00:07.412 ago
<span class="hl">        SPF algorithm executed 6 times</span></pre>
<p>A counter that keeps rising while nobody is changing anything means a link somewhere is flapping.</p>

<div class="warn"><p><b>Common mistake.</b> Applying an interface ACL that permits only TCP, UDP and ICMP. The implicit deny drops protocol 89, the Hellos stop, and 40 seconds later every neighbour on that interface goes down. Always add <code>permit ospf any any</code> (or a tighter equivalent) above the deny.</p></div>

<div class="exam"><p><b>Exam trap.</b> Match the numbers: OSPF = IP protocol 89, 224.0.0.5 and 224.0.0.6. EIGRP = protocol 88 and 224.0.0.10. RIPv2 = UDP 520 and 224.0.0.9. Questions often swap 224.0.0.5 and 224.0.0.6: remember that <b>.6 is only for the DR and BDR</b>.</p></div>

<div class="scn"><h4>The security hardening that broke routing</h4><p>An auditor asked a bank branch to restrict traffic on the WAN interface. The engineer applied an inbound ACL permitting HTTPS, SSH and ICMP from head office. Exactly 40 seconds later the syslog showed <code>%OSPF-5-ADJCHG: ... from FULL to DOWN, Neighbor Down: Dead timer expired</code> and the branch vanished from the network. <code>show access-lists</code> showed the implicit deny matching packets. Adding <code>permit ospf host 10.0.12.1 any</code> at the top brought the neighbour back.</p><p><b>Lesson:</b> OSPF is its own IP protocol. Any filter on a routed link must explicitly allow it.</p></div>

<div class="iv"><p class="q">"Walk me through the OSPF packet types."</p><p>Strong answer: type 1 Hello discovers and maintains neighbours and elects the DR/BDR; type 2 DBD summarises the LSDB during the exchange; type 3 LSR requests missing LSAs; type 4 LSU carries full LSAs, both during sync and when flooding changes; type 5 LSAck acknowledges LSAs because OSPF runs directly on IP protocol 89 without TCP. Mention the multicast addresses 224.0.0.5 and 224.0.0.6 and you have covered what most interviewers want.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPF keeps three tables: neighbours, the LSDB (topology) and the routing table.</li>
<li>Five packets: Hello, DBD, LSR, LSU, LSAck.</li>
<li>OSPF uses IP protocol 89, multicast 224.0.0.5 (all OSPF routers) and 224.0.0.6 (DR/BDR), TTL 1.</li>
<li>Changes are flooded as new LSA versions with higher sequence numbers; every router reruns SPF.</li>
<li>ACLs on routed links must permit OSPF, or neighbours die after the dead interval.</li>
</ul></div>
`,hi:`
<p>Office ka notice board socho. Har department apne baare mein ek notice lagata hai: wahan kaun kaam karta hai aur kaunsa darwaza kahan jaata hai. Har employee <b>har</b> notice ki photocopy rakhta hai. Jab accounts department ek darwaza shift karta hai, woh apne notice ka naya version lagata hai, aur sab apni purani copy badal lete hain. Koi kisi dusre department ka notice dobara nahi likhta. OSPF bilkul aise hi kaam karta hai. Har router sirf apne aap ko describe karta hai, har router har description ki copy rakhta hai, aur har ek poore set se apne routes khud nikaalta hai.</p>

<h3>Har OSPF router ke andar teen tables</h3>
<table class="cmp"><tr><th>Table</th><th>Isme kya hota hai</th><th>Command</th></tr>
<tr><td><b>Neighbour table</b></td><td>Har interface par Hello packets se mile routers, aur har relationship ki state</td><td><code>show ip ospf neighbor</code></td></tr>
<tr><td><b>Topology table (LSDB)</b></td><td>Area ka har LSA: poora map, area ke har router par identical</td><td><code>show ip ospf database</code></td></tr>
<tr><td><b>Routing table</b></td><td>SPF se nikle best routes, jo router ki main routing table ko offer hote hain</td><td><code>show ip route ospf</code></td></tr>
</table>

<h3>Power-on se routes tak, step by step</h3>
<ol>
<li><b>Neighbours dhoondho.</b> Har OSPF interface Ethernet par har 10 second mein ek <b>Hello</b> bhejta hai. Jin routers ke Hellos agree karte hain woh neighbours ban jaate hain.</li>
<li><b>Databases sync karo.</b> Neighbours batate hain ki unke paas kaunse LSAs hain (<b>DBD</b>), jo missing hain woh maangte hain (<b>LSR</b>), unhe receive karte hain (<b>LSU</b>) aur receipt confirm karte hain (<b>LSAck</b>).</li>
<li><b>SPF chalao.</b> Poora LSDB milne par har router Dijkstra ka Shortest Path First algorithm chalata hai, khud ko ek tree ke root par rakh kar, aur har network tak lowest-cost path nikaalta hai.</li>
<li><b>Routes install karo.</b> Best paths AD 110 ke saath routing table mein jaate hain.</li>
<li><b>Maintain karo.</b> Hellos keepalive ki tarah chalte rehte hain. Jab koi link badalta hai, us link ka maalik router apne LSA ka naya version flood karta hai, aur har router SPF dobara chalata hai. Har LSA har 30 minute refresh bhi hota hai, chahe kuch na badle.</li>
</ol>

<h3>OSPF ke paanch packet types</h3>
<table class="cmp"><tr><th>Type</th><th>Naam</th><th>Kaam</th></tr>
<tr><td>1</td><td><b>Hello</b></td><td>Neighbours dhoondhna aur banaye rakhna; match hone wale parameters le jaata hai; DR/BDR elect karta hai</td></tr>
<tr><td>2</td><td><b>DBD</b> (Database Description)</td><td>Router ke paas jo LSAs hain unki summary list, table of contents jaisi</td></tr>
<tr><td>3</td><td><b>LSR</b> (Link-State Request)</td><td>"Mujhe yeh LSAs bhejo, mere paas missing hain ya purane hain"</td></tr>
<tr><td>4</td><td><b>LSU</b> (Link-State Update)</td><td>Ek ya zyada poore LSAs le jaata hai; sync aur changes flood karne dono ke liye</td></tr>
<tr><td>5</td><td><b>LSAck</b></td><td>Har mila LSA confirm karta hai, jisse flooding reliable banti hai</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="R1 aur R2 ke beech OSPF packet exchange">
<rect x="40" y="10" width="90" height="34" rx="8" fill="#bae6fd"/><text x="85" y="32" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="510" y="10" width="90" height="34" rx="8" fill="#bae6fd"/><text x="555" y="32" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<line x1="85" y1="44" x2="85" y2="250" stroke="#64748b" stroke-width="2"/><line x1="555" y1="44" x2="555" y2="250" stroke="#64748b" stroke-width="2"/>
<line x1="85" y1="66" x2="555" y2="76" stroke="#64748b" stroke-width="2"/><text x="320" y="64" text-anchor="middle" class="svg-ink" font-size="12">1 Hello (224.0.0.5 ko)</text>
<line x1="555" y1="96" x2="85" y2="106" stroke="#64748b" stroke-width="2"/><text x="320" y="94" text-anchor="middle" class="svg-ink" font-size="12">1 Hello, ab R1 ka RID list mein</text>
<line x1="85" y1="126" x2="555" y2="136" stroke="#64748b" stroke-width="2"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="12">2 DBD: mere LSA headers</text>
<line x1="555" y1="156" x2="85" y2="166" stroke="#64748b" stroke-width="2"/><text x="320" y="154" text-anchor="middle" class="svg-ink" font-size="12">3 LSR: mujhe LSA 2.2.2.2 bhejo</text>
<line x1="85" y1="186" x2="555" y2="196" stroke="#64748b" stroke-width="2"/><text x="320" y="184" text-anchor="middle" class="svg-ink" font-size="12">4 LSU: yeh raha poora LSA</text>
<line x1="555" y1="216" x2="85" y2="226" stroke="#64748b" stroke-width="2"/><text x="320" y="214" text-anchor="middle" class="svg-ink" font-size="12">5 LSAck: mil gaya</text>
<text x="320" y="250" text-anchor="middle" class="svg-accent" font-size="12">Dono LSDB identical: state FULL</text>
</svg><p class="cap">Simplified adjacency: pehle Hellos, phir database exchange (asal mein dono taraf se DBDs, LSRs aur LSUs jaate hain).</p></div>

<h3>OSPF wire par kaise chalta hai</h3>
<ul>
<li>OSPF <b>seedha IP par protocol number 89 ke saath</b> chalta hai. Yeh TCP ya UDP use nahi karta, isliye LSAcks aur retransmissions se apni reliability khud banata hai.</li>
<li>Hellos aur zyada tar updates multicast <b>224.0.0.5</b> (AllSPFRouters, har OSPF router) par jaate hain. DR aur BDR ki taraf updates <b>224.0.0.6</b> (AllDRouters) par jaate hain. Ethernet par yeh MAC addresses 0100.5e00.0005 aur 0100.5e00.0006 ban jaate hain.</li>
<li>OSPF packets ka TTL 1 hota hai: woh local link se bahar nahi jaate. Neighbours ka same subnet mein hona zaroori hai.</li>
<li>Har LSA ek <b>sequence number</b> le kar chalta hai, jo 0x80000001 se shuru hota hai. Bada number matlab naya LSA, aur woh har jagah purani copy ko replace kar deta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Lab chain mein R3 se R4 ka cable nikal diya gaya. R3 dekhta hai ki uska Gi0/1 down hua, apne router LSA se woh link hata deta hai, sequence number 0x80000004 se 0x80000005 karta hai aur R2 ko LSU flood karta hai. R2 use acknowledge karta hai, install karta hai aur R1 ko flood karta hai. R4 apni taraf se yahi karta hai. R1 aur R2 SPF dobara chalate hain, 4.4.4.4 ya 10.0.34.0/30 ka koi path nahi milta, aur dono routes hata dete hain. Physical link-down detection ke saath yeh har router par ek second se bhi kam leta hai; sirf silent failure 40 second ke dead timer ka wait karta hai.</p></div>

<pre class="out">R1# show ip ospf | include SPF algorithm
        SPF algorithm last executed 00:00:07.412 ago
<span class="hl">        SPF algorithm executed 6 times</span></pre>
<p>Agar koi kuch change nahi kar raha aur yeh counter badhta ja raha hai, to kahin koi link flap kar raha hai.</p>

<div class="warn"><p><b>Common galti.</b> Aisa interface ACL lagana jo sirf TCP, UDP aur ICMP permit kare. Implicit deny protocol 89 ko drop kar deta hai, Hellos band ho jaate hain, aur 40 second baad us interface ke saare neighbours down ho jaate hain. Deny ke upar hamesha <code>permit ospf any any</code> (ya usse tight equivalent) jodo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Numbers match karo: OSPF = IP protocol 89, 224.0.0.5 aur 224.0.0.6. EIGRP = protocol 88 aur 224.0.0.10. RIPv2 = UDP 520 aur 224.0.0.9. Questions aksar 224.0.0.5 aur 224.0.0.6 ko swap karte hain: yaad rakho ki <b>.6 sirf DR aur BDR ke liye hai</b>.</p></div>

<div class="scn"><h4>Security hardening jisne routing tod di</h4><p>Ek auditor ne bank branch se WAN interface par traffic restrict karne ko kaha. Engineer ne ek inbound ACL lagaya jo head office se HTTPS, SSH aur ICMP permit karta tha. Theek 40 second baad syslog mein <code>%OSPF-5-ADJCHG: ... from FULL to DOWN, Neighbor Down: Dead timer expired</code> aaya aur branch network se gayab ho gayi. <code>show access-lists</code> mein implicit deny packets match karta dikha. Sabse upar <code>permit ospf host 10.0.12.1 any</code> jodne se neighbour wapas aa gaya.</p><p><b>Seekh:</b> OSPF apna khud ka IP protocol hai. Routed link par koi bhi filter use explicitly allow kare.</p></div>

<div class="iv"><p class="q">"OSPF packet types samjhao."</p><p>Strong answer: type 1 Hello neighbours dhoondhta aur maintain karta hai aur DR/BDR elect karta hai; type 2 DBD exchange ke dauraan LSDB ki summary deta hai; type 3 LSR missing LSAs request karta hai; type 4 LSU poore LSAs le jaata hai, sync mein bhi aur changes flood karte waqt bhi; type 5 LSAck LSAs acknowledge karta hai kyunki OSPF bina TCP ke seedha IP protocol 89 par chalta hai. Multicast addresses 224.0.0.5 aur 224.0.0.6 mention karo aur zyada tar interviewers jo chahte hain woh cover ho gaya.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPF teen tables rakhta hai: neighbours, LSDB (topology) aur routing table.</li>
<li>Paanch packets: Hello, DBD, LSR, LSU, LSAck.</li>
<li>OSPF IP protocol 89, multicast 224.0.0.5 (saare OSPF routers) aur 224.0.0.6 (DR/BDR), TTL 1 use karta hai.</li>
<li>Changes bade sequence numbers wale naye LSA versions ke roop mein flood hote hain; har router SPF dobara chalata hai.</li>
<li>Routed links par ACLs ko OSPF permit karna chahiye, warna dead interval ke baad neighbours mar jaate hain.</li>
</ul></div>
`}};export{e as default};