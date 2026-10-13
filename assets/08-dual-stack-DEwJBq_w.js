var e={id:`dual-stack`,h:{en:`Dual stack: OSPFv2 and OSPFv3 side by side`,hi:`Dual stack: OSPFv2 aur OSPFv3 saath saath`},body:{en:`
<p>Mumbai has local trains and a metro. They share stations, serve the same passengers and often run side by side, but each has its own tracks, its own signalling and its own control room. A signal failure on the metro does not stop the local train. A <b>dual-stack</b> network running OSPFv2 and OSPFv3 is exactly that: the same routers and links carry IPv4 and IPv6, but each protocol has its own OSPF process, its own neighbours, its own LSDB and its own routing table.</p>

<h3>What "side by side" means on one router</h3>
<ul>
<li><b>Two processes.</b> <code>router ospf 1</code> for IPv4 (OSPFv2) and <code>ipv6 router ospf 10</code> (or <code>router ospfv3 10</code>) for IPv6. The process numbers are independent and can even be equal.</li>
<li><b>Two neighbour tables.</b> <code>show ip ospf neighbor</code> and <code>show ipv6 ospf neighbor</code>. Each has its own Hellos: OSPFv2 to 224.0.0.5, OSPFv3 to FF02::5.</li>
<li><b>Two LSDBs and two SPF runs.</b> A change in IPv4 does not trigger SPF for IPv6 and vice versa.</li>
<li><b>Two routing tables.</b> <code>show ip route</code> and <code>show ipv6 route</code>. Both use AD 110 for OSPF, but they never compete, because they hold different address families.</li>
<li><b>Router IDs.</b> Both are 32-bit. They may be the same on one router, and many designs make them the same deliberately.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="OSPFv2 and OSPFv3 running in parallel">
<rect x="20" y="20" width="600" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">Same routers, same links: R1, R2, R3</text>
<rect x="20" y="70" width="290" height="160" rx="8" fill="#bae6fd"/>
<text x="165" y="95" text-anchor="middle" class="svg-ink" font-size="14">OSPFv2 (IPv4)</text>
<text x="165" y="120" text-anchor="middle" class="svg-ink" font-size="12">router ospf 1</text>
<text x="165" y="142" text-anchor="middle" class="svg-ink" font-size="12">Hellos to 224.0.0.5</text>
<text x="165" y="164" text-anchor="middle" class="svg-ink" font-size="12">show ip ospf neighbor</text>
<text x="165" y="186" text-anchor="middle" class="svg-ink" font-size="12">show ip route ospf</text>
<text x="165" y="208" text-anchor="middle" class="svg-muted" font-size="12">own LSDB, own SPF</text>
<rect x="330" y="70" width="290" height="160" rx="8" fill="#bbf7d0"/>
<text x="475" y="95" text-anchor="middle" class="svg-ink" font-size="14">OSPFv3 (IPv6)</text>
<text x="475" y="120" text-anchor="middle" class="svg-ink" font-size="12">ipv6 router ospf 10</text>
<text x="475" y="142" text-anchor="middle" class="svg-ink" font-size="12">Hellos to FF02::5</text>
<text x="475" y="164" text-anchor="middle" class="svg-ink" font-size="12">show ipv6 ospf neighbor</text>
<text x="475" y="186" text-anchor="middle" class="svg-ink" font-size="12">show ipv6 route ospf</text>
<text x="475" y="208" text-anchor="middle" class="svg-muted" font-size="12">own LSDB, own SPF</text>
</svg><p class="cap">Two independent control planes on shared hardware.</p></div>

<h3>Configuring R1 as dual stack</h3>
<p>Take the lab and add IPv4: R1-R2 link 10.1.12.0/30, Delhi LAN 10.1.1.0/24, and a loopback on each router so the RID comes from it automatically.</p>
<pre class="code"><span class="c">! Global</span>
R1(config)# ipv6 unicast-routing
R1(config)# interface Loopback0
R1(config-if)# ip address 1.1.1.1 255.255.255.255
<span class="c">! Link to R2: both protocols on one interface</span>
R1(config-if)# interface GigabitEthernet0/0
R1(config-if)# ip address 10.1.12.1 255.255.255.252
R1(config-if)# ipv6 address 2001:DB8:ACAD:12::1/64
R1(config-if)# ip ospf 1 area 0
R1(config-if)# ipv6 ospf 10 area 0
<span class="c">! Delhi LAN</span>
R1(config-if)# interface GigabitEthernet0/1
R1(config-if)# ip address 10.1.1.1 255.255.255.0
R1(config-if)# ipv6 address 2001:DB8:ACAD:1::1/64
R1(config-if)# ip ospf 1 area 0
R1(config-if)# ipv6 ospf 10 area 0
<span class="c">! Processes: explicit RIDs are still best practice</span>
R1(config-if)# router ospf 1
R1(config-router)# router-id 1.1.1.1
R1(config-router)# passive-interface GigabitEthernet0/1
R1(config-router)# ipv6 router ospf 10
R1(config-rtr)# router-id 1.1.1.1
R1(config-rtr)# passive-interface GigabitEthernet0/1</pre>
<p>Notice that passive interfaces, reference bandwidth, costs and authentication are configured <b>per process</b>. Setting <code>passive-interface</code> under <code>router ospf 1</code> does nothing for OSPFv3.</p>

<h3>Verifying both at once</h3>
<pre class="out">R2# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">1.1.1.1           1   FULL/BDR        00:00:37    10.1.12.1       GigabitEthernet0/0</span>
3.3.3.3           1   FULL/DR         00:00:31    10.1.23.3       GigabitEthernet0/1

R2# show ipv6 ospf neighbor

            OSPFv3 Router with ID (2.2.2.2) (Process ID 10)

Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
<span class="hl">1.1.1.1           1   FULL/BDR        00:00:35    3               GigabitEthernet0/0</span>
3.3.3.3           1   FULL/DR         00:00:33    3               GigabitEthernet0/1</pre>
<p>The same router IDs appear in both tables, which makes correlation easy. Compare the fourth column: OSPFv2 shows the neighbour's IPv4 <b>Address</b>; OSPFv3 shows the neighbour's <b>Interface ID</b>.</p>

<h3>Independent failures: the real value of this chapter</h3>
<table class="cmp"><tr><th>Problem</th><th>OSPFv2</th><th>OSPFv3</th></tr>
<tr><td>IPv4 ACL on interface blocks protocol 89</td><td>Down</td><td>Unaffected</td></tr>
<tr><td>IPv6 ACL (<code>ipv6 traffic-filter</code>) with implicit deny</td><td>Unaffected</td><td>Down</td></tr>
<tr><td>IPv4 subnet mask mismatch on a link</td><td>No adjacency</td><td>Unaffected</td></tr>
<tr><td>Area or hello timer mismatch set in one process</td><td>Only the process where it is set</td><td>Only the process where it is set</td></tr>
<tr><td>Interface MTU mismatch</td><td>Stuck in ExStart/Exchange</td><td>Stuck in ExStart/Exchange</td></tr>
<tr><td>Physical link down</td><td>Down</td><td>Down</td></tr>
</table>
<p>This table is a troubleshooting shortcut. If IPv4 is fine and IPv6 is broken on the same link, the physical layer is fine; look at what is specific to IPv6: IPv6 ACLs, <code>ipv6 unicast-routing</code>, the OSPFv3 interface line, OSPFv3 router ID.</p>

<div class="eg"><p><b>Worked example.</b> You raise the reference bandwidth to 10000 under <code>router ospf 1</code> only. IPv4 now costs 10 per GigabitEthernet link and IPv6 still costs 1. On a network with a parallel slower path, IPv4 and IPv6 could now choose <b>different paths</b> for the same pair of sites. Keep costs, reference bandwidth and areas identical in both processes so the two topologies stay congruent.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Assuming OSPFv3 will reuse OSPFv2's passive-interface, costs or authentication. (2) Using different router IDs for v2 and v3 on the same router without a reason, which makes troubleshooting harder. (3) Applying a new IPv6 ACL to an interface and forgetting that its implicit <code>deny ipv6 any any</code> also drops OSPFv3 Hellos.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Because both OSPFv2 and OSPFv3 have AD 110, the router must choose between them." False. They populate different routing tables (IPv4 and IPv6), so they never compete. Another trap: "a dual-stack router must use different router IDs for OSPFv2 and OSPFv3." False; the same RID is allowed and common.</p></div>

<div class="scn"><h4>Half the network after a security change</h4><p>A hospital's security team applied a new inbound IPv6 ACL to the core-facing interfaces of all branch routers, permitting only HTTPS and DNS. Within a minute, IPv6 routes to the branches vanished while IPv4 kept working, so most users noticed nothing except slower video calls. On a branch router, <code>show ip ospf neighbor</code> was FULL but <code>show ipv6 ospf neighbor</code> was empty. <code>show ipv6 access-list</code> showed matches on the implicit deny. The team added <code>permit ospf any any</code> (protocol 89) near the top of the ACL, and adjacencies returned within 40 seconds.</p><p><b>Lesson:</b> in dual stack, a problem that affects only one protocol points to something specific to that protocol.</p></div>

<div class="iv"><p class="q">"How do OSPFv2 and OSPFv3 coexist on a dual-stack router?"</p><p>Strong answer: they are separate protocols running separate processes, each with its own Hellos (224.0.0.5 versus FF02::5), neighbour table, LSDB, SPF and routing table. Both can share the same router ID. Per-process settings such as passive interfaces, costs, reference bandwidth and authentication must be configured twice and kept consistent so IPv4 and IPv6 follow the same paths. Failures can be protocol-specific, for example an IPv6 ACL breaking only OSPFv3. Optionally mention the OSPFv3 IPv4 address family as an alternative.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dual stack means two OSPF processes, two neighbour tables, two LSDBs, two routing tables.</li>
<li>The same 32-bit router ID can be used for both; it helps correlation.</li>
<li>Passive, cost, reference bandwidth and authentication are per process: configure both.</li>
<li>Keep both topologies congruent so IPv4 and IPv6 follow the same paths.</li>
<li>A failure in only one protocol points to protocol-specific causes like ACLs or missing interface lines.</li>
</ul></div>
`,hi:`
<p>Mumbai mein local trains bhi hain aur metro bhi. Woh stations share karti hain, same passengers ko serve karti hain aur aksar saath saath chalti hain, lekin har ek ke apne tracks, apni signalling aur apna control room hai. Metro par signal failure local train ko nahi rokta. OSPFv2 aur OSPFv3 chalane wala <b>dual-stack</b> network bilkul aisa hi hai: same routers aur links IPv4 aur IPv6 le jaate hain, lekin har protocol ka apna OSPF process, apne neighbours, apna LSDB aur apni routing table hoti hai.</p>

<h3>Ek router par "saath saath" ka matlab</h3>
<ul>
<li><b>Do processes.</b> IPv4 ke liye <code>router ospf 1</code> (OSPFv2) aur IPv6 ke liye <code>ipv6 router ospf 10</code> (ya <code>router ospfv3 10</code>). Process numbers independent hain aur same bhi ho sakte hain.</li>
<li><b>Do neighbour tables.</b> <code>show ip ospf neighbor</code> aur <code>show ipv6 ospf neighbor</code>. Har ek ke apne Hellos hain: OSPFv2 224.0.0.5 par, OSPFv3 FF02::5 par.</li>
<li><b>Do LSDBs aur do SPF runs.</b> IPv4 mein change IPv6 ke liye SPF trigger nahi karta aur ulta bhi nahi.</li>
<li><b>Do routing tables.</b> <code>show ip route</code> aur <code>show ipv6 route</code>. Dono OSPF ke liye AD 110 use karte hain, lekin kabhi compete nahi karte, kyunki alag address families rakhte hain.</li>
<li><b>Router IDs.</b> Dono 32-bit hain. Ek router par same ho sakte hain, aur bahut designs unhe jaan boojh kar same rakhte hain.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="OSPFv2 aur OSPFv3 parallel mein">
<rect x="20" y="20" width="600" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">Wahi routers, wahi links: R1, R2, R3</text>
<rect x="20" y="70" width="290" height="160" rx="8" fill="#bae6fd"/>
<text x="165" y="95" text-anchor="middle" class="svg-ink" font-size="14">OSPFv2 (IPv4)</text>
<text x="165" y="120" text-anchor="middle" class="svg-ink" font-size="12">router ospf 1</text>
<text x="165" y="142" text-anchor="middle" class="svg-ink" font-size="12">Hellos 224.0.0.5 par</text>
<text x="165" y="164" text-anchor="middle" class="svg-ink" font-size="12">show ip ospf neighbor</text>
<text x="165" y="186" text-anchor="middle" class="svg-ink" font-size="12">show ip route ospf</text>
<text x="165" y="208" text-anchor="middle" class="svg-muted" font-size="12">apna LSDB, apna SPF</text>
<rect x="330" y="70" width="290" height="160" rx="8" fill="#bbf7d0"/>
<text x="475" y="95" text-anchor="middle" class="svg-ink" font-size="14">OSPFv3 (IPv6)</text>
<text x="475" y="120" text-anchor="middle" class="svg-ink" font-size="12">ipv6 router ospf 10</text>
<text x="475" y="142" text-anchor="middle" class="svg-ink" font-size="12">Hellos FF02::5 par</text>
<text x="475" y="164" text-anchor="middle" class="svg-ink" font-size="12">show ipv6 ospf neighbor</text>
<text x="475" y="186" text-anchor="middle" class="svg-ink" font-size="12">show ipv6 route ospf</text>
<text x="475" y="208" text-anchor="middle" class="svg-muted" font-size="12">apna LSDB, apna SPF</text>
</svg><p class="cap">Shared hardware par do independent control planes.</p></div>

<h3>R1 ko dual stack configure karna</h3>
<p>Lab lo aur IPv4 jodo: R1-R2 link 10.1.12.0/30, Delhi LAN 10.1.1.0/24, aur har router par ek loopback taaki RID apne aap usse aaye.</p>
<pre class="code"><span class="c">! Global</span>
R1(config)# ipv6 unicast-routing
R1(config)# interface Loopback0
R1(config-if)# ip address 1.1.1.1 255.255.255.255
<span class="c">! R2 wala link: ek interface par dono protocols</span>
R1(config-if)# interface GigabitEthernet0/0
R1(config-if)# ip address 10.1.12.1 255.255.255.252
R1(config-if)# ipv6 address 2001:DB8:ACAD:12::1/64
R1(config-if)# ip ospf 1 area 0
R1(config-if)# ipv6 ospf 10 area 0
<span class="c">! Delhi LAN</span>
R1(config-if)# interface GigabitEthernet0/1
R1(config-if)# ip address 10.1.1.1 255.255.255.0
R1(config-if)# ipv6 address 2001:DB8:ACAD:1::1/64
R1(config-if)# ip ospf 1 area 0
R1(config-if)# ipv6 ospf 10 area 0
<span class="c">! Processes: explicit RIDs ab bhi best practice hain</span>
R1(config-if)# router ospf 1
R1(config-router)# router-id 1.1.1.1
R1(config-router)# passive-interface GigabitEthernet0/1
R1(config-router)# ipv6 router ospf 10
R1(config-rtr)# router-id 1.1.1.1
R1(config-rtr)# passive-interface GigabitEthernet0/1</pre>
<p>Dhyan do ki passive interfaces, reference bandwidth, costs aur authentication <b>per process</b> configure hote hain. <code>router ospf 1</code> ke andar <code>passive-interface</code> set karna OSPFv3 ke liye kuch nahi karta.</p>

<h3>Dono ko ek saath verify karna</h3>
<pre class="out">R2# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">1.1.1.1           1   FULL/BDR        00:00:37    10.1.12.1       GigabitEthernet0/0</span>
3.3.3.3           1   FULL/DR         00:00:31    10.1.23.3       GigabitEthernet0/1

R2# show ipv6 ospf neighbor

            OSPFv3 Router with ID (2.2.2.2) (Process ID 10)

Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
<span class="hl">1.1.1.1           1   FULL/BDR        00:00:35    3               GigabitEthernet0/0</span>
3.3.3.3           1   FULL/DR         00:00:33    3               GigabitEthernet0/1</pre>
<p>Dono tables mein same router IDs dikhte hain, jisse correlate karna aasaan hai. Chautha column compare karo: OSPFv2 neighbour ka IPv4 <b>Address</b> dikhata hai; OSPFv3 neighbour ka <b>Interface ID</b>.</p>

<h3>Independent failures: is chapter ki asli value</h3>
<table class="cmp"><tr><th>Problem</th><th>OSPFv2</th><th>OSPFv3</th></tr>
<tr><td>Interface par IPv4 ACL protocol 89 block karta hai</td><td>Down</td><td>Koi asar nahi</td></tr>
<tr><td>Implicit deny wala IPv6 ACL (<code>ipv6 traffic-filter</code>)</td><td>Koi asar nahi</td><td>Down</td></tr>
<tr><td>Link par IPv4 subnet mask mismatch</td><td>Adjacency nahi</td><td>Koi asar nahi</td></tr>
<tr><td>Ek process mein set area ya hello timer mismatch</td><td>Sirf wahi process jahan set hai</td><td>Sirf wahi process jahan set hai</td></tr>
<tr><td>Interface MTU mismatch</td><td>ExStart/Exchange mein atka</td><td>ExStart/Exchange mein atka</td></tr>
<tr><td>Physical link down</td><td>Down</td><td>Down</td></tr>
</table>
<p>Yeh table troubleshooting shortcut hai. Agar same link par IPv4 theek hai aur IPv6 toota hai, to physical layer theek hai; woh dekho jo IPv6-specific hai: IPv6 ACLs, <code>ipv6 unicast-routing</code>, OSPFv3 interface line, OSPFv3 router ID.</p>

<div class="eg"><p><b>Worked example.</b> Aap reference bandwidth ko sirf <code>router ospf 1</code> ke andar 10000 karte ho. Ab IPv4 mein har GigabitEthernet link ka cost 10 hai aur IPv6 mein ab bhi 1. Jis network mein parallel slower path hai, wahan ab IPv4 aur IPv6 same do sites ke liye <b>alag paths</b> chun sakte hain. Dono processes mein costs, reference bandwidth aur areas identical rakho taaki dono topologies congruent rahein.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Maan lena ki OSPFv3 OSPFv2 ka passive-interface, costs ya authentication reuse karega. (2) Bina wajah same router par v2 aur v3 ke liye alag router IDs use karna, jisse troubleshooting mushkil hoti hai. (3) Interface par naya IPv6 ACL lagana aur bhool jaana ki uska implicit <code>deny ipv6 any any</code> OSPFv3 Hellos bhi drop karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Kyunki OSPFv2 aur OSPFv3 dono ka AD 110 hai, router ko unmein se chunna padega." Galat. Woh alag routing tables (IPv4 aur IPv6) bharte hain, isliye kabhi compete nahi karte. Ek aur trap: "dual-stack router ko OSPFv2 aur OSPFv3 ke liye alag router IDs use karne padenge." Galat; same RID allowed hai aur common hai.</p></div>

<div class="scn"><h4>Security change ke baad aadha network</h4><p>Ek hospital ki security team ne saare branch routers ke core-facing interfaces par naya inbound IPv6 ACL lagaya, jo sirf HTTPS aur DNS permit karta tha. Ek minute ke andar branches ke IPv6 routes gayab ho gaye jabki IPv4 chalta raha, isliye zyada tar users ko slower video calls ke alawa kuch pata nahi chala. Branch router par <code>show ip ospf neighbor</code> FULL tha lekin <code>show ipv6 ospf neighbor</code> khaali tha. <code>show ipv6 access-list</code> mein implicit deny par matches dikhe. Team ne ACL ke upar ki taraf <code>permit ospf any any</code> (protocol 89) joda, aur 40 seconds mein adjacencies wapas aa gayi.</p><p><b>Seekh:</b> dual stack mein jo problem sirf ek protocol ko affect kare, woh us protocol ki specific cheez ki taraf ishara karti hai.</p></div>

<div class="iv"><p class="q">"Dual-stack router par OSPFv2 aur OSPFv3 kaise saath rehte hain?"</p><p>Strong answer: yeh alag protocols hain jo alag processes chalate hain, har ek ke apne Hellos (224.0.0.5 vs FF02::5), neighbour table, LSDB, SPF aur routing table. Dono same router ID share kar sakte hain. Per-process settings jaise passive interfaces, costs, reference bandwidth aur authentication do baar configure karni padti hain aur consistent rakhni padti hain taaki IPv4 aur IPv6 same paths follow karein. Failures protocol-specific ho sakte hain, jaise IPv6 ACL sirf OSPFv3 ko todna. Optionally alternative ke roop mein OSPFv3 IPv4 address family batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dual stack matlab do OSPF processes, do neighbour tables, do LSDBs, do routing tables.</li>
<li>Dono ke liye same 32-bit router ID use ho sakta hai; correlation mein madad karta hai.</li>
<li>Passive, cost, reference bandwidth aur authentication per process hain: dono configure karo.</li>
<li>Dono topologies congruent rakho taaki IPv4 aur IPv6 same paths follow karein.</li>
<li>Sirf ek protocol mein failure protocol-specific causes ki taraf point karta hai jaise ACLs ya missing interface lines.</li>
</ul></div>
`}};export{e as default};