var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow, lab walkthrough and tickets`,hi:`Troubleshooting workflow, lab walkthrough aur tickets`},body:{en:`
<p>A good doctor does not start with a brain scan. They check pulse, temperature and blood pressure first, and only go deeper when the basics are fine. OSPFv3 troubleshooting works the same way: check the cheap, common things at the bottom first, then climb. Most tickets are solved by step 4.</p>

<h3>The bottom-up workflow for IPv6 routing</h3>
<ol>
<li><b>Is IPv6 routing on?</b> <code>show running-config | include unicast-routing</code>. Without <code>ipv6 unicast-routing</code> the router forwards no IPv6 transit traffic and OSPFv3 cannot even be configured.</li>
<li><b>Are the interfaces ready?</b> <code>show ipv6 interface brief</code>: up/up, a link-local address, the correct global address.</li>
<li><b>Is the process healthy?</b> <code>show ipv6 protocols</code> or <code>show ipv6 ospf</code>: a router ID that is not 0.0.0.0, the expected areas and area types. In AF mode, <code>show ospfv3</code> must list the address family you need.</li>
<li><b>Are the right interfaces in OSPFv3?</b> <code>show ipv6 ospf interface brief</code>, then <code>show ipv6 ospf interface X</code>: area, instance ID, network type, passive, timers, authentication.</li>
<li><b>Neighbours?</b> <code>show ipv6 ospf neighbor</code>: missing, stuck, or FULL.</li>
<li><b>Database?</b> <code>show ipv6 ospf database</code> and its <code>prefix</code> / <code>inter-area prefix</code> views: is the prefix advertised by anyone?</li>
<li><b>Routing table?</b> <code>show ipv6 route ospf</code> and <code>show ipv6 route PREFIX</code>: is the OSPF route installed, or beaten by a better AD (a static route has AD 1)?</li>
<li><b>Forwarding path?</b> <code>ping</code> and <code>traceroute</code>, and check IPv6 ACLs applied with <code>ipv6 traffic-filter</code>.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Troubleshooting ladder">
<rect x="40" y="200" width="560" height="34" rx="6" fill="#e2e8f0"/><text x="320" y="222" text-anchor="middle" class="svg-ink" font-size="12">1-2 ipv6 unicast-routing, interfaces, link-local</text>
<rect x="80" y="158" width="480" height="34" rx="6" fill="#bae6fd"/><text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="12">3-4 process, router ID, AF, interface settings</text>
<rect x="120" y="116" width="400" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="12">5 neighbours: missing, stuck, FULL</text>
<rect x="160" y="74" width="320" height="34" rx="6" fill="#fde68a"/><text x="320" y="96" text-anchor="middle" class="svg-ink" font-size="12">6-7 LSDB, then RIB and AD</text>
<rect x="200" y="32" width="240" height="34" rx="6" fill="#fed7aa"/><text x="320" y="54" text-anchor="middle" class="svg-ink" font-size="12">8 forwarding, ACLs</text>
</svg><p class="cap">Climb the ladder from the bottom; do not open the database before the basics are proven.</p></div>

<h3>Fault table: symptom to fix</h3>
<table class="cmp"><tr><th>Fault</th><th>Symptom</th><th>Where you see it</th><th>Fix</th></tr>
<tr><td>No router ID</td><td>No Hellos at all</td><td>NORTRID log, Router ID 0.0.0.0</td><td><code>router-id</code></td></tr>
<tr><td>Instance ID mismatch</td><td>Neighbour never appears, no error</td><td>"Instance ID" line differs on each end</td><td>Match <code>instance</code></td></tr>
<tr><td>Area or timer mismatch</td><td>No neighbour</td><td>Interface output, <code>debug ipv6 ospf hello</code></td><td>Match area/timers</td></tr>
<tr><td>Stub flag mismatch</td><td>No neighbour</td><td><code>show ipv6 ospf</code> area section</td><td><code>area X stub</code> on all</td></tr>
<tr><td>MTU mismatch</td><td>Stuck EXSTART/EXCHANGE</td><td>Neighbour table, <code>show ipv6 interface</code> MTU</td><td>Match MTU or <code>mtu-ignore</code></td></tr>
<tr><td>Network type mismatch</td><td>FULL but routes missing</td><td>Network Type line differs</td><td>Same type on both ends</td></tr>
<tr><td>Address family missing</td><td>Neighbour in one AF only</td><td><code>show ospfv3 neighbor</code> sections</td><td>Enable AF on both ends</td></tr>
<tr><td>Passive transit link</td><td>Neighbour gone, prefix still advertised</td><td>"No Hellos (Passive interface)"</td><td><code>no passive-interface</code></td></tr>
<tr><td>Authentication mismatch</td><td>Neighbour lost after dead time</td><td>Interface auth line, SA counters</td><td>Match SPI/key or key chain</td></tr>
<tr><td>ACL blocks OSPFv3</td><td>No neighbour</td><td><code>show ipv6 access-list</code> hits</td><td>Permit next header 89 from FE80::/10</td></tr>
</table>

<h3>Two outputs you must be able to read</h3>
<pre class="out">R2# show ipv6 ospf neighbor
Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
<span class="hl">3.3.3.3           1   EXSTART/DR      00:00:38    3               GigabitEthernet0/1</span></pre>
<p>EXSTART or EXCHANGE that never finishes almost always means an <b>MTU mismatch</b>. The DBD packet carries the interface MTU and a router rejects a DBD from a neighbour with a larger MTU. Compare <code>show ipv6 interface Gi0/1 | include MTU</code> on both ends; fix the MTU, or use <code>ipv6 ospf mtu-ignore</code> as a workaround.</p>
<pre class="out">R2# show ipv6 ospf interface Gi0/1 | include Instance
  Area 1, Process ID 1, <span class="hl">Instance ID 0</span>, Router ID 2.2.2.2
R3# show ipv6 ospf interface Gi0/0 | include Instance
  Area 1, Process ID 1, <span class="hl">Instance ID 1</span>, Router ID 3.3.3.3</pre>
<p>Different instance IDs: each router drops the other's packets silently. R3 was configured with <code>ipv6 ospf 1 area 1 instance 1</code>; change it back to the default.</p>

<h3>Walking the lab</h3>
<p>The complete fix from the module's lab, in order:</p>
<pre class="code"><span class="c">! R1: task 1 (passive LAN) and its half of task 2</span>
ipv6 router ospf 1
 passive-interface GigabitEthernet0/2
interface GigabitEthernet0/0
 ipv6 ospf network point-to-point
<span class="c">! R2: task 2 on both transit links, then task 3</span>
interface GigabitEthernet0/0
 ipv6 ospf network point-to-point
interface GigabitEthernet0/1
 ipv6 ospf network point-to-point
ipv6 router ospf 1
 area 1 range 2001:DB8:ACAD:10::/62
<span class="c">! R3: its half of task 2</span>
interface GigabitEthernet0/0
 ipv6 ospf network point-to-point
<span class="c">! wait for the adjacencies, then task 4 from R1</span>
ping 2001:DB8:ACAD:12::1</pre>
<p>Verify in the same order the checker does: <b>(1)</b> R1 <code>show ipv6 ospf interface Gi0/2</code> says "No Hellos (Passive interface)" and R3 has <code>OI 2001:DB8:ACAD:100::/64</code>; <b>(2)</b> all four transit interfaces show <code>POINT_TO_POINT</code> and R2 lists two <code>FULL/  -</code> neighbours; <b>(3)</b> R1 has <code>OI 2001:DB8:ACAD:10::/62</code> and no more-specific OI routes from that block; <b>(4)</b> the ping succeeds. If step 2 shows one neighbour missing right after the change, give it a few seconds; changing the network type resets the adjacency.</p>

<h3>Text tickets</h3>
<div class="eg"><p><b>Ticket A.</b> "After adding IPv4 to OSPFv3, the Chennai branch lost IPv4 routes, IPv6 fine." <code>show ospfv3 neighbor</code> on the hub shows only an <code>address-family ipv6</code> section. Cause: the IPv4 AF is not enabled on the hub interface (or under <code>router ospfv3</code>). Fix: <code>ospfv3 1 ipv4 area 0</code> and <code>address-family ipv4 unicast</code> on the hub.</p>
<p><b>Ticket B.</b> "R3 rebuilt, no OSPFv3 neighbour, network is IPv6-only." Log shows NORTRID. Fix: <code>router-id 3.3.3.3</code>.</p>
<p><b>Ticket C.</b> "Neighbours FULL on the new WAN, but remote LANs missing." One end shows <code>Network Type BROADCAST</code>, the other <code>POINT_TO_POINT</code>. Fix: make both point-to-point.</p></div>

<div class="warn"><p><b>Common mistake.</b> Jumping straight to <code>debug</code> on a busy router. Debugs cost CPU and flood the console. Use show commands first; if you need a debug, limit it (for example <code>debug ipv6 ospf hello</code> only) and turn it off with <code>undebug all</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> "FULL" does not mean "routes installed". Network type mismatch, a better-AD static route, or a distribute-list can all leave a FULL adjacency with missing routes. Conversely, "2WAY" between DROTHERs is healthy.</p></div>

<div class="scn"><h4>The ACL that ate the Hellos</h4><p>After a security team applied a new inbound IPv6 ACL to a WAN interface, the OSPFv3 neighbour on that link went down after 40 seconds. IPv6 pings to the neighbour's global address still worked, which confused the first responder. <code>show ipv6 access-list</code> showed hits on the final deny, and the ACL permitted ICMPv6 and TCP but nothing for next header 89. IPv6 ACLs implicitly permit neighbour discovery, not OSPF. Adding <code>permit 89 FE80::/10 any</code> above the deny restored the adjacency.</p><p><b>Lesson:</b> when a neighbour disappears after a change, check what was applied to the interface, including ACLs.</p></div>

<div class="iv"><p class="q">"OSPFv3 neighbours will not form. How do you troubleshoot?"</p><p>Strong answer: bottom-up. Confirm <code>ipv6 unicast-routing</code>, interfaces up with link-local addresses, and a valid router ID. Then compare <code>show ipv6 ospf interface</code> on both ends: area, instance ID, timers, network type, stub flags, passive and authentication. If the neighbour is stuck in EXSTART/EXCHANGE, check MTU. Check IPv6 ACLs for protocol 89 from FE80::/10. Only then use a targeted debug. Mention that prefix mismatches do not matter in OSPFv3 but instance IDs do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work bottom-up: IPv6 routing, interfaces, process and router ID, interface settings, neighbours, LSDB, RIB, forwarding.</li>
<li>No neighbour: area, timers, instance ID, stub flags, auth, ACL, passive, router ID.</li>
<li>Stuck EXSTART/EXCHANGE: MTU. FULL but no routes: network type or AD.</li>
<li>In AF mode, a missing section in <code>show ospfv3 neighbor</code> means a missing AF.</li>
<li>The lab is proven by: passive Gi0/2, two <code>FULL/  -</code> on R2, one /62 on R1, and a successful ping.</li>
</ul></div>
`,hi:`
<p>Achha doctor brain scan se shuru nahi karta. Woh pehle pulse, temperature aur blood pressure check karta hai, aur basics theek hon tabhi gehraai mein jaata hai. OSPFv3 troubleshooting bhi aise hi kaam karti hai: pehle neeche ki saste, common cheezein check karo, phir upar chadho. Zyada tar tickets step 4 tak solve ho jaate hain.</p>

<h3>IPv6 routing ke liye bottom-up workflow</h3>
<ol>
<li><b>Kya IPv6 routing on hai?</b> <code>show running-config | include unicast-routing</code>. <code>ipv6 unicast-routing</code> ke bina router koi IPv6 transit traffic forward nahi karta aur OSPFv3 configure bhi nahi ho sakta.</li>
<li><b>Kya interfaces ready hain?</b> <code>show ipv6 interface brief</code>: up/up, ek link-local address, sahi global address.</li>
<li><b>Kya process healthy hai?</b> <code>show ipv6 protocols</code> ya <code>show ipv6 ospf</code>: router ID jo 0.0.0.0 nahi hai, expected areas aur area types. AF mode mein <code>show ospfv3</code> mein zaroori address family list honi chahiye.</li>
<li><b>Kya sahi interfaces OSPFv3 mein hain?</b> <code>show ipv6 ospf interface brief</code>, phir <code>show ipv6 ospf interface X</code>: area, instance ID, network type, passive, timers, authentication.</li>
<li><b>Neighbours?</b> <code>show ipv6 ospf neighbor</code>: missing, atka hua, ya FULL.</li>
<li><b>Database?</b> <code>show ipv6 ospf database</code> aur uske <code>prefix</code> / <code>inter-area prefix</code> views: kya koi prefix advertise kar raha hai?</li>
<li><b>Routing table?</b> <code>show ipv6 route ospf</code> aur <code>show ipv6 route PREFIX</code>: kya OSPF route install hai, ya behtar AD ne use hara diya (static route ka AD 1 hai)?</li>
<li><b>Forwarding path?</b> <code>ping</code> aur <code>traceroute</code>, aur <code>ipv6 traffic-filter</code> se lage IPv6 ACLs check karo.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Troubleshooting ladder">
<rect x="40" y="200" width="560" height="34" rx="6" fill="#e2e8f0"/><text x="320" y="222" text-anchor="middle" class="svg-ink" font-size="12">1-2 ipv6 unicast-routing, interfaces, link-local</text>
<rect x="80" y="158" width="480" height="34" rx="6" fill="#bae6fd"/><text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="12">3-4 process, router ID, AF, interface settings</text>
<rect x="120" y="116" width="400" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="12">5 neighbours: missing, atke, FULL</text>
<rect x="160" y="74" width="320" height="34" rx="6" fill="#fde68a"/><text x="320" y="96" text-anchor="middle" class="svg-ink" font-size="12">6-7 LSDB, phir RIB aur AD</text>
<rect x="200" y="32" width="240" height="34" rx="6" fill="#fed7aa"/><text x="320" y="54" text-anchor="middle" class="svg-ink" font-size="12">8 forwarding, ACLs</text>
</svg><p class="cap">Seedhi neeche se chadho; basics prove hone se pehle database mat kholo.</p></div>

<h3>Fault table: symptom se fix tak</h3>
<table class="cmp"><tr><th>Fault</th><th>Symptom</th><th>Kahan dikhta hai</th><th>Fix</th></tr>
<tr><td>Router ID nahi</td><td>Koi Hello nahi</td><td>NORTRID log, Router ID 0.0.0.0</td><td><code>router-id</code></td></tr>
<tr><td>Instance ID mismatch</td><td>Neighbour kabhi nahi dikhta, koi error nahi</td><td>Dono ends par "Instance ID" line alag</td><td><code>instance</code> match karo</td></tr>
<tr><td>Area ya timer mismatch</td><td>Neighbour nahi</td><td>Interface output, <code>debug ipv6 ospf hello</code></td><td>Area/timers match karo</td></tr>
<tr><td>Stub flag mismatch</td><td>Neighbour nahi</td><td><code>show ipv6 ospf</code> area section</td><td>Sab par <code>area X stub</code></td></tr>
<tr><td>MTU mismatch</td><td>EXSTART/EXCHANGE mein atka</td><td>Neighbour table, <code>show ipv6 interface</code> MTU</td><td>MTU match ya <code>mtu-ignore</code></td></tr>
<tr><td>Network type mismatch</td><td>FULL lekin routes gayab</td><td>Network Type line alag</td><td>Dono ends par same type</td></tr>
<tr><td>Address family missing</td><td>Neighbour sirf ek AF mein</td><td><code>show ospfv3 neighbor</code> sections</td><td>Dono ends par AF enable</td></tr>
<tr><td>Passive transit link</td><td>Neighbour gayab, prefix abhi bhi advertise</td><td>"No Hellos (Passive interface)"</td><td><code>no passive-interface</code></td></tr>
<tr><td>Authentication mismatch</td><td>Dead time ke baad neighbour lost</td><td>Interface auth line, SA counters</td><td>SPI/key ya key chain match</td></tr>
<tr><td>ACL OSPFv3 block karta hai</td><td>Neighbour nahi</td><td><code>show ipv6 access-list</code> hits</td><td>FE80::/10 se next header 89 permit</td></tr>
</table>

<h3>Do outputs jo aapko padhne aane chahiye</h3>
<pre class="out">R2# show ipv6 ospf neighbor
Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
<span class="hl">3.3.3.3           1   EXSTART/DR      00:00:38    3               GigabitEthernet0/1</span></pre>
<p>EXSTART ya EXCHANGE jo kabhi khatam na ho, lagbhag hamesha <b>MTU mismatch</b> hota hai. DBD packet interface MTU le jaata hai aur router bade MTU wale neighbour ka DBD reject karta hai. Dono ends par <code>show ipv6 interface Gi0/1 | include MTU</code> compare karo; MTU theek karo, ya workaround ki tarah <code>ipv6 ospf mtu-ignore</code> use karo.</p>
<pre class="out">R2# show ipv6 ospf interface Gi0/1 | include Instance
  Area 1, Process ID 1, <span class="hl">Instance ID 0</span>, Router ID 2.2.2.2
R3# show ipv6 ospf interface Gi0/0 | include Instance
  Area 1, Process ID 1, <span class="hl">Instance ID 1</span>, Router ID 3.3.3.3</pre>
<p>Alag instance IDs: har router doosre ke packets chupchaap drop karta hai. R3 ko <code>ipv6 ospf 1 area 1 instance 1</code> ke saath configure kiya gaya tha; ise default par wapas lao.</p>

<h3>Lab walk karna</h3>
<p>Module ke lab ka poora fix, order mein:</p>
<pre class="code"><span class="c">! R1: task 1 (passive LAN) aur task 2 ka uska hissa</span>
ipv6 router ospf 1
 passive-interface GigabitEthernet0/2
interface GigabitEthernet0/0
 ipv6 ospf network point-to-point
<span class="c">! R2: dono transit links par task 2, phir task 3</span>
interface GigabitEthernet0/0
 ipv6 ospf network point-to-point
interface GigabitEthernet0/1
 ipv6 ospf network point-to-point
ipv6 router ospf 1
 area 1 range 2001:DB8:ACAD:10::/62
<span class="c">! R3: task 2 ka uska hissa</span>
interface GigabitEthernet0/0
 ipv6 ospf network point-to-point
<span class="c">! adjacencies ka intezaar karo, phir R1 se task 4</span>
ping 2001:DB8:ACAD:12::1</pre>
<p>Usi order mein verify karo jaise checker karta hai: <b>(1)</b> R1 <code>show ipv6 ospf interface Gi0/2</code> "No Hellos (Passive interface)" kehta hai aur R3 ke paas <code>OI 2001:DB8:ACAD:100::/64</code> hai; <b>(2)</b> chaaron transit interfaces <code>POINT_TO_POINT</code> dikhate hain aur R2 do <code>FULL/  -</code> neighbours list karta hai; <b>(3)</b> R1 ke paas <code>OI 2001:DB8:ACAD:10::/62</code> hai aur us block se koi more-specific OI route nahi; <b>(4)</b> ping successful hai. Agar change ke turant baad step 2 mein ek neighbour gayab dikhe, to kuch seconds do; network type badalne se adjacency reset hoti hai.</p>

<h3>Text tickets</h3>
<div class="eg"><p><b>Ticket A.</b> "OSPFv3 mein IPv4 jodne ke baad Chennai branch ke IPv4 routes chale gaye, IPv6 theek." Hub par <code>show ospfv3 neighbor</code> sirf <code>address-family ipv6</code> section dikhata hai. Cause: hub interface par (ya <code>router ospfv3</code> ke neeche) IPv4 AF enable nahi hai. Fix: hub par <code>ospfv3 1 ipv4 area 0</code> aur <code>address-family ipv4 unicast</code>.</p>
<p><b>Ticket B.</b> "R3 rebuild hua, koi OSPFv3 neighbour nahi, network IPv6-only hai." Log NORTRID dikhata hai. Fix: <code>router-id 3.3.3.3</code>.</p>
<p><b>Ticket C.</b> "Naye WAN par neighbours FULL, lekin remote LANs gayab." Ek end <code>Network Type BROADCAST</code> dikhata hai, doosra <code>POINT_TO_POINT</code>. Fix: dono ko point-to-point banao.</p></div>

<div class="warn"><p><b>Common galti.</b> Busy router par seedhe <code>debug</code> par kood jaana. Debugs CPU khaate hain aur console flood karte hain. Pehle show commands use karo; debug chahiye to use limit karo (jaise sirf <code>debug ipv6 ospf hello</code>) aur <code>undebug all</code> se band karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> "FULL" ka matlab "routes installed" nahi hai. Network type mismatch, behtar AD wala static route, ya distribute-list sab FULL adjacency ke saath routes gayab chhod sakte hain. Ulta, DROTHERs ke beech "2WAY" healthy hai.</p></div>

<div class="scn"><h4>ACL jo Hellos kha gaya</h4><p>Security team ne WAN interface par naya inbound IPv6 ACL lagaya, uske baad us link ka OSPFv3 neighbour 40 seconds mein down ho gaya. Neighbour ke global address par IPv6 pings abhi bhi chal rahe the, jisne pehle responder ko confuse kiya. <code>show ipv6 access-list</code> ne final deny par hits dikhaye, aur ACL ICMPv6 aur TCP permit karta tha lekin next header 89 ke liye kuch nahi. IPv6 ACLs implicitly neighbour discovery permit karte hain, OSPF nahi. Deny ke upar <code>permit 89 FE80::/10 any</code> jodne se adjacency wapas aayi.</p><p><b>Seekh:</b> change ke baad neighbour gayab ho to dekho interface par kya lagaya gaya, ACLs bhi.</p></div>

<div class="iv"><p class="q">"OSPFv3 neighbours nahi ban rahe. Aap kaise troubleshoot karoge?"</p><p>Strong answer: bottom-up. <code>ipv6 unicast-routing</code>, link-local addresses ke saath up interfaces, aur valid router ID confirm karo. Phir dono ends par <code>show ipv6 ospf interface</code> compare karo: area, instance ID, timers, network type, stub flags, passive aur authentication. Agar neighbour EXSTART/EXCHANGE mein atka hai, MTU check karo. FE80::/10 se protocol 89 ke liye IPv6 ACLs check karo. Uske baad hi targeted debug use karo. Batao ki OSPFv3 mein prefix mismatches matter nahi karte lekin instance IDs karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bottom-up kaam karo: IPv6 routing, interfaces, process aur router ID, interface settings, neighbours, LSDB, RIB, forwarding.</li>
<li>Neighbour nahi: area, timers, instance ID, stub flags, auth, ACL, passive, router ID.</li>
<li>EXSTART/EXCHANGE mein atka: MTU. FULL lekin routes nahi: network type ya AD.</li>
<li>AF mode mein <code>show ospfv3 neighbor</code> ka gayab section matlab gayab AF.</li>
<li>Lab prove hota hai: passive Gi0/2, R2 par do <code>FULL/  -</code>, R1 par ek /62, aur successful ping.</li>
</ul></div>
`}};export{e as default};