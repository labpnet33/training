var e={id:`same-different`,h:{en:`What stays the same, what changes`,hi:`Kya same rehta hai, kya badalta hai`},body:{en:`
<p>Think of moving from an old Nokia phone to a smartphone. You still call people, send messages and keep a contact list; your friends are the same friends. But the screen, the way you dial and the apps underneath are new. Moving from OSPFv2 to OSPFv3 feels exactly like that. If you understood the OSPFv2 module, about 80 percent of OSPFv3 is already in your head. This chapter shows you precisely which 20 percent is new.</p>

<h3>What stays exactly the same</h3>
<ul>
<li><b>Link-state behaviour.</b> Each router floods LSAs, builds the same LSDB inside an area, and runs Dijkstra's <b>SPF</b> algorithm to find the lowest-cost paths.</li>
<li><b>Areas.</b> Area 0 is the backbone, other areas must connect to it, ABRs and ASBRs have the same roles. Single-area design in this module means everything is in area 0.</li>
<li><b>Packet types.</b> Hello, DBD (Database Description), LSR, LSU and LSAck, the same five.</li>
<li><b>Neighbour states.</b> Down, Init, 2-Way, ExStart, Exchange, Loading, Full.</li>
<li><b>DR and BDR.</b> Elected on multi-access links by highest priority (default 1), then highest router ID; priority 0 means never DR; no pre-emption.</li>
<li><b>Cost.</b> Reference bandwidth divided by interface bandwidth, default reference 100 Mbps, so FastEthernet and GigabitEthernet both cost 1 unless you raise it.</li>
<li><b>Timers.</b> Hello 10 s and dead 40 s on broadcast and point-to-point links.</li>
<li><b>Administrative distance.</b> 110.</li>
<li><b>Router ID.</b> Still a 32-bit number written like an IPv4 address.</li>
</ul>

<h3>What changes</h3>
<table class="cmp"><tr><th>Item</th><th>OSPFv2</th><th>OSPFv3</th></tr>
<tr><td>Routes carried</td><td>IPv4</td><td>IPv6 (classic); IPv6 and IPv4 with address families</td></tr>
<tr><td>Runs over</td><td>Per subnet</td><td><b>Per link</b></td></tr>
<tr><td>Source of OSPF packets</td><td>Interface IPv4 address</td><td>Interface <b>link-local</b> address (FE80::/10)</td></tr>
<tr><td>Multicast groups</td><td>224.0.0.5 and 224.0.0.6</td><td><b>FF02::5</b> and <b>FF02::6</b></td></tr>
<tr><td>Next hop in routing table</td><td>Neighbour's IPv4 address</td><td>Neighbour's <b>link-local</b> address</td></tr>
<tr><td>How to enable</td><td>network command or <code>ip ospf</code> on interface</td><td><b>Interface only</b></td></tr>
<tr><td>Hello carries a mask</td><td>Yes, must match</td><td>No mask; carries an Interface ID</td></tr>
<tr><td>Prefixes carried in</td><td>Router and Network LSAs</td><td>New Intra-Area Prefix LSA (type 9)</td></tr>
<tr><td>Per-link addresses</td><td>Not needed</td><td>New Link LSA (type 8)</td></tr>
<tr><td>Authentication</td><td>Built into OSPF header</td><td>Removed; uses <b>IPsec</b> (AH/ESP)</td></tr>
<tr><td>Multiple instances per link</td><td>No</td><td>Yes, <b>Instance ID</b> field</td></tr>
</table>

<h3>"Runs per link": what it really means</h3>
<p>In OSPFv2, two routers only become neighbours if their interface addresses are in the <b>same subnet with the same mask</b>, because the Hello carries the mask and the receiver checks it. OSPFv3 removed the mask from the Hello. Every IPv6 interface always has a link-local address, and OSPFv3 uses that address to talk. So OSPFv3 cares that two routers share the same physical or logical <b>link</b>, not that their global addresses match. You could even put two different /64 prefixes on the two ends of a link and the adjacency would still form. The prefixes would simply be advertised as two separate prefixes. This is legal, but confusing, so real designs still use one prefix per link.</p>
<p>A link can also carry several IPv6 prefixes at once. OSPFv3 is happy with that because it treats the link as the unit and lists all prefixes on it separately.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="OSPFv3 Hello exchange over link-local">
<rect x="30" y="70" width="150" height="60" rx="8" fill="#bae6fd"/><text x="105" y="95" text-anchor="middle" class="svg-ink" font-size="14">R1 Gi0/0</text><text x="105" y="115" text-anchor="middle" class="svg-muted" font-size="12">FE80::1</text>
<rect x="460" y="70" width="150" height="60" rx="8" fill="#bae6fd"/><text x="535" y="95" text-anchor="middle" class="svg-ink" font-size="14">R2 Gi0/0</text><text x="535" y="115" text-anchor="middle" class="svg-muted" font-size="12">FE80::2</text>
<line x1="180" y1="100" x2="460" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="20" width="240" height="40" rx="6" fill="#fde68a"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="12">Hello: src FE80::1, dst FF02::5</text>
<rect x="200" y="140" width="240" height="40" rx="6" fill="#fde68a"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="12">Hello: src FE80::2, dst FF02::5</text>
<text x="320" y="205" text-anchor="middle" class="svg-accent" font-size="12">No mask checked; global prefixes are carried later in LSAs</text>
</svg><p class="cap">Hellos are sourced from link-local addresses and sent to the AllSPFRouters group FF02::5.</p></div>

<h3>The two multicast groups</h3>
<p><b>FF02::5</b> is <i>AllSPFRouters</i>: every OSPFv3 router listens to it and sends Hellos to it. <b>FF02::6</b> is <i>AllDRouters</i>: only the DR and BDR listen. On a broadcast segment, DROthers send their updates to FF02::6, and the DR re-floods them to FF02::5, exactly as OSPFv2 did with 224.0.0.6 and 224.0.0.5. Both are link-local scope (FF02), so routers never forward them.</p>
<p>OSPFv3 still runs directly on top of IP with <b>protocol (Next Header) number 89</b>, not TCP or UDP. The IPv6 Hop Limit on OSPF packets is 1.</p>

<h3>Authentication moves to IPsec</h3>
<p>OSPFv2 had authentication fields (plain text or MD5, later SHA) inside every OSPF packet. OSPFv3 deleted them. Classic OSPFv3 protects packets with the IPv6 <b>Authentication Header (AH)</b> for integrity or <b>Encapsulating Security Payload (ESP)</b> for integrity and encryption, configured per interface or per area, for example <code>ipv6 ospf authentication ipsec spi 256 sha1</code> followed by a key. Newer IOS XE releases also support an OSPFv3 authentication trailer (RFC 7166) with key chains, which works without IPsec. For CCNA, remember the one-line idea: <b>OSPFv3 authentication uses IPsec</b>, and both ends must use the same SPI and key.</p>

<div class="eg"><p><b>Worked example.</b> R1 Gi0/0 has 2001:DB8:ACAD:12::1/64 and link-local FE80::5200:FF:FE01:0. R2 Gi0/0 has 2001:DB8:ACAD:12::2/64 and link-local FE80::5200:FF:FE02:0. R1 sends a Hello from FE80::5200:FF:FE01:0 to FF02::5. When R1 later installs the Mumbai route, the next hop will be FE80::5200:FF:FE02:0 on Gi0/0, never 2001:DB8:ACAD:12::2.</p></div>

<div class="warn"><p><b>Common mistake.</b> Seeing <code>via FE80::...</code> in <code>show ipv6 route ospf</code> and thinking something is wrong because "the next hop should be the neighbour's real address". It is correct. Link-local next hops are normal for every IPv6 routing protocol, and the outgoing interface is always shown next to them because a link-local address only means something on one link.</p></div>
<div class="exam"><p><b>Exam trap.</b> A question lists the OSPFv3 multicast addresses as FF02::1 and FF02::2. Those are all-nodes and all-routers used by Neighbor Discovery. OSPFv3 uses <b>FF02::5</b> and <b>FF02::6</b>. Also: EIGRP for IPv6 uses FF02::A, and RIPng uses FF02::9.</p></div>

<div class="scn"><h4>Two prefixes, one link</h4><p>During a readdressing project, an engineer changed R2's Gi0/0 to a new prefix 2001:DB8:ACAD:120::2/64 but forgot to change R1's end, still on 2001:DB8:ACAD:12::1/64. The team expected OSPFv3 to drop the adjacency, as OSPFv2 would with a subnet mismatch. It stayed FULL. Instead, both prefixes appeared in every routing table, and a monitoring tool pinging 2001:DB8:ACAD:120::1 raised alarms. The engineer checked <code>show ipv6 ospf neighbor</code> (FULL), then <code>show ipv6 interface brief</code> on both ends and spotted the mismatch. Fixing R1's address cleaned up the extra prefix.</p><p><b>Lesson:</b> OSPFv3 does not protect you from mismatched global prefixes on a link. Verify addressing separately.</p></div>

<div class="iv"><p class="q">"What are the main differences between OSPFv2 and OSPFv3?"</p><p>Strong answer: group them. Same: link-state engine, areas, packet types, states, DR/BDR, cost, AD 110, 32-bit router ID. Different: runs per link over link-local addresses; multicast FF02::5 and FF02::6; enabled per interface, no network command; Hello has no mask; prefixes moved to new LSAs (type 9, plus link LSA type 8); authentication via IPsec; Instance ID allows multiple instances per link. Structured answers score far better than a random list.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Engine unchanged: SPF, areas, five packet types, seven states, DR/BDR, cost, AD 110.</li>
<li>OSPFv3 runs per link, sources packets from link-local and uses FF02::5 and FF02::6.</li>
<li>Next hops in the IPv6 routing table are link-local addresses plus an exit interface.</li>
<li>No mask in the Hello, so neighbours do not need matching global prefixes.</li>
<li>Authentication is done with IPsec (AH/ESP) in classic OSPFv3.</li>
</ul></div>
`,hi:`
<p>Purane Nokia phone se smartphone par shift hone ke baare mein socho. Aap ab bhi logon ko call karte ho, messages bhejte ho aur contact list rakhte ho; aapke dost wahi dost hain. Lekin screen, dial karne ka tareeka aur neeche ki apps nayi hain. OSPFv2 se OSPFv3 par jaana bilkul aisa hi lagta hai. Agar aapne OSPFv2 module samjha hai, to OSPFv3 ka lagbhag 80 percent pehle se aapke dimaag mein hai. Yeh chapter exactly batata hai ki naya 20 percent kaunsa hai.</p>

<h3>Kya bilkul same rehta hai</h3>
<ul>
<li><b>Link-state behaviour.</b> Har router LSAs flood karta hai, area ke andar same LSDB banata hai, aur lowest-cost paths dhoondhne ke liye Dijkstra ka <b>SPF</b> algorithm chalata hai.</li>
<li><b>Areas.</b> Area 0 backbone hai, doosre areas ko usse judna padta hai, ABRs aur ASBRs ke roles same hain. Is module mein single-area design ka matlab hai sab kuch area 0 mein.</li>
<li><b>Packet types.</b> Hello, DBD (Database Description), LSR, LSU aur LSAck, wahi paanch.</li>
<li><b>Neighbour states.</b> Down, Init, 2-Way, ExStart, Exchange, Loading, Full.</li>
<li><b>DR aur BDR.</b> Multi-access links par highest priority (default 1) se, phir highest router ID se elect hote hain; priority 0 matlab kabhi DR nahi; pre-emption nahi.</li>
<li><b>Cost.</b> Reference bandwidth divided by interface bandwidth, default reference 100 Mbps, isliye FastEthernet aur GigabitEthernet dono ka cost 1 hai jab tak aap reference na badhao.</li>
<li><b>Timers.</b> Broadcast aur point-to-point links par Hello 10 s aur dead 40 s.</li>
<li><b>Administrative distance.</b> 110.</li>
<li><b>Router ID.</b> Ab bhi 32-bit number jo IPv4 address jaisa likha jaata hai.</li>
</ul>

<h3>Kya badalta hai</h3>
<table class="cmp"><tr><th>Item</th><th>OSPFv2</th><th>OSPFv3</th></tr>
<tr><td>Routes jo le jaata hai</td><td>IPv4</td><td>IPv6 (classic); address families ke saath IPv6 aur IPv4</td></tr>
<tr><td>Kis par chalta hai</td><td>Per subnet</td><td><b>Per link</b></td></tr>
<tr><td>OSPF packets ka source</td><td>Interface IPv4 address</td><td>Interface ka <b>link-local</b> address (FE80::/10)</td></tr>
<tr><td>Multicast groups</td><td>224.0.0.5 aur 224.0.0.6</td><td><b>FF02::5</b> aur <b>FF02::6</b></td></tr>
<tr><td>Routing table mein next hop</td><td>Neighbour ka IPv4 address</td><td>Neighbour ka <b>link-local</b> address</td></tr>
<tr><td>Enable kaise karein</td><td>network command ya interface par <code>ip ospf</code></td><td><b>Sirf interface</b></td></tr>
<tr><td>Hello mein mask</td><td>Haan, match hona chahiye</td><td>Mask nahi; Interface ID hota hai</td></tr>
<tr><td>Prefixes kahan jaate hain</td><td>Router aur Network LSAs</td><td>Naya Intra-Area Prefix LSA (type 9)</td></tr>
<tr><td>Per-link addresses</td><td>Zaroorat nahi</td><td>Naya Link LSA (type 8)</td></tr>
<tr><td>Authentication</td><td>OSPF header mein built-in</td><td>Hata diya; <b>IPsec</b> (AH/ESP) use hota hai</td></tr>
<tr><td>Ek link par kai instances</td><td>Nahi</td><td>Haan, <b>Instance ID</b> field</td></tr>
</table>

<h3>"Per link chalta hai": asal matlab kya hai</h3>
<p>OSPFv2 mein do routers tabhi neighbours bante hain jab unke interface addresses <b>same subnet aur same mask</b> mein hon, kyunki Hello mask le jaata hai aur receiver use check karta hai. OSPFv3 ne Hello se mask hata diya. Har IPv6 interface par hamesha ek link-local address hota hai, aur OSPFv3 baat karne ke liye wahi address use karta hai. Isliye OSPFv3 ko farak padta hai ki do routers same physical ya logical <b>link</b> share karte hain, is baat se nahi ki unke global addresses match karte hain. Aap link ke dono ends par do alag /64 prefixes bhi laga sakte ho aur adjacency phir bhi ban jaayegi. Prefixes bas do alag prefixes ki tarah advertise honge. Yeh legal hai, lekin confusing hai, isliye real designs mein ab bhi ek link par ek prefix hi hota hai.</p>
<p>Ek link ek saath kai IPv6 prefixes bhi le ja sakta hai. OSPFv3 isse khush hai kyunki woh link ko unit maanta hai aur us par ke saare prefixes alag alag list karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Link-local par OSPFv3 Hello exchange">
<rect x="30" y="70" width="150" height="60" rx="8" fill="#bae6fd"/><text x="105" y="95" text-anchor="middle" class="svg-ink" font-size="14">R1 Gi0/0</text><text x="105" y="115" text-anchor="middle" class="svg-muted" font-size="12">FE80::1</text>
<rect x="460" y="70" width="150" height="60" rx="8" fill="#bae6fd"/><text x="535" y="95" text-anchor="middle" class="svg-ink" font-size="14">R2 Gi0/0</text><text x="535" y="115" text-anchor="middle" class="svg-muted" font-size="12">FE80::2</text>
<line x1="180" y1="100" x2="460" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="20" width="240" height="40" rx="6" fill="#fde68a"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="12">Hello: src FE80::1, dst FF02::5</text>
<rect x="200" y="140" width="240" height="40" rx="6" fill="#fde68a"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="12">Hello: src FE80::2, dst FF02::5</text>
<text x="320" y="205" text-anchor="middle" class="svg-accent" font-size="12">Mask check nahi; global prefixes baad mein LSAs mein jaate hain</text>
</svg><p class="cap">Hellos link-local addresses se source hote hain aur AllSPFRouters group FF02::5 par bheje jaate hain.</p></div>

<h3>Do multicast groups</h3>
<p><b>FF02::5</b> <i>AllSPFRouters</i> hai: har OSPFv3 router ise sunta hai aur Hellos isi par bhejta hai. <b>FF02::6</b> <i>AllDRouters</i> hai: sirf DR aur BDR sunte hain. Broadcast segment par DROthers apne updates FF02::6 par bhejte hain, aur DR unhe FF02::5 par re-flood karta hai, bilkul waise hi jaise OSPFv2 224.0.0.6 aur 224.0.0.5 ke saath karta tha. Dono link-local scope (FF02) ke hain, isliye routers inhe kabhi forward nahi karte.</p>
<p>OSPFv3 ab bhi seedha IP ke upar <b>protocol (Next Header) number 89</b> par chalta hai, TCP ya UDP par nahi. OSPF packets par IPv6 Hop Limit 1 hota hai.</p>

<h3>Authentication IPsec par shift hota hai</h3>
<p>OSPFv2 mein har OSPF packet ke andar authentication fields the (plain text ya MD5, baad mein SHA). OSPFv3 ne unhe delete kar diya. Classic OSPFv3 packets ko integrity ke liye IPv6 <b>Authentication Header (AH)</b> se ya integrity aur encryption ke liye <b>Encapsulating Security Payload (ESP)</b> se protect karta hai, jo per interface ya per area configure hota hai, jaise <code>ipv6 ospf authentication ipsec spi 256 sha1</code> ke baad ek key. Naye IOS XE releases OSPFv3 authentication trailer (RFC 7166) bhi support karte hain jo key chains ke saath IPsec ke bina kaam karta hai. CCNA ke liye ek line yaad rakho: <b>OSPFv3 authentication IPsec use karta hai</b>, aur dono ends par same SPI aur key honi chahiye.</p>

<div class="eg"><p><b>Worked example.</b> R1 Gi0/0 par 2001:DB8:ACAD:12::1/64 aur link-local FE80::5200:FF:FE01:0 hai. R2 Gi0/0 par 2001:DB8:ACAD:12::2/64 aur link-local FE80::5200:FF:FE02:0 hai. R1 Hello ko FE80::5200:FF:FE01:0 se FF02::5 par bhejta hai. Jab R1 baad mein Mumbai route install karega, to next hop Gi0/0 par FE80::5200:FF:FE02:0 hoga, kabhi 2001:DB8:ACAD:12::2 nahi.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>show ipv6 route ospf</code> mein <code>via FE80::...</code> dekh kar sochna ki kuch galat hai kyunki "next hop neighbour ka real address hona chahiye". Yeh sahi hai. Har IPv6 routing protocol ke liye link-local next hops normal hain, aur unke saath outgoing interface hamesha dikhaya jaata hai kyunki link-local address ka matlab sirf ek link par hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Question OSPFv3 multicast addresses FF02::1 aur FF02::2 batata hai. Woh Neighbor Discovery ke all-nodes aur all-routers hain. OSPFv3 <b>FF02::5</b> aur <b>FF02::6</b> use karta hai. Saath hi: EIGRP for IPv6 FF02::A use karta hai, aur RIPng FF02::9.</p></div>

<div class="scn"><h4>Ek link, do prefixes</h4><p>Ek readdressing project ke dauraan engineer ne R2 ka Gi0/0 naye prefix 2001:DB8:ACAD:120::2/64 par badal diya lekin R1 ka end badalna bhool gaya, jo abhi bhi 2001:DB8:ACAD:12::1/64 par tha. Team expect kar rahi thi ki OSPFv3 adjacency gira dega, jaise OSPFv2 subnet mismatch par karta. Woh FULL hi rahi. Uski jagah dono prefixes har routing table mein aa gaye, aur 2001:DB8:ACAD:120::1 ko ping karne wale monitoring tool ne alarms uthaye. Engineer ne <code>show ipv6 ospf neighbor</code> check kiya (FULL), phir dono ends par <code>show ipv6 interface brief</code> dekha aur mismatch pakda. R1 ka address theek karne se extra prefix saaf ho gaya.</p><p><b>Seekh:</b> OSPFv3 aapko link par mismatched global prefixes se nahi bachata. Addressing alag se verify karo.</p></div>

<div class="iv"><p class="q">"OSPFv2 aur OSPFv3 mein main differences kya hain?"</p><p>Strong answer: unhe group karo. Same: link-state engine, areas, packet types, states, DR/BDR, cost, AD 110, 32-bit router ID. Alag: link-local addresses par per link chalta hai; multicast FF02::5 aur FF02::6; per interface enable hota hai, network command nahi; Hello mein mask nahi; prefixes naye LSAs mein (type 9, aur link LSA type 8); authentication IPsec se; Instance ID ek link par multiple instances allow karta hai. Structured answers random list se kahin zyada score karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Engine same: SPF, areas, paanch packet types, saat states, DR/BDR, cost, AD 110.</li>
<li>OSPFv3 per link chalta hai, packets link-local se source karta hai aur FF02::5 aur FF02::6 use karta hai.</li>
<li>IPv6 routing table mein next hops link-local address plus exit interface hote hain.</li>
<li>Hello mein mask nahi, isliye neighbours ko matching global prefixes ki zaroorat nahi.</li>
<li>Classic OSPFv3 mein authentication IPsec (AH/ESP) se hota hai.</li>
</ul></div>
`}};export{e as default};