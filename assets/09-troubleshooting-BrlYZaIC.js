var e={id:`troubleshoot`,h:{en:`Troubleshooting workflow and exam traps`,hi:`Troubleshooting workflow aur exam traps`},body:{en:`
<p>When a car will not start, a good mechanic does not replace the engine first. He checks fuel, then the battery, then the starter, in that order, because each check rules out a whole group of causes. OSPFv3 troubleshooting works the same way. Most problems fall into a small set of causes, and a fixed order of checks finds them in minutes. This chapter gives you that order, walks through the lab ticket "OSPFv3 neighbours missing", and collects the exam traps.</p>

<h3>The workflow, bottom to top</h3>
<ol>
<li><b>Layer 1/2 and IPv6 on the link.</b> <code>show ipv6 interface brief</code>: interface up/up and a link-local address present.</li>
<li><b>IPv6 routing on.</b> <code>show running-config | include unicast-routing</code>.</li>
<li><b>Process and router ID.</b> <code>show ipv6 protocols</code> or <code>show ipv6 ospf</code>. No RID on an IPv6-only router means NORTRID.</li>
<li><b>Interface in OSPFv3, right process and area, not passive.</b> <code>show ipv6 ospf interface brief</code> and <code>show ipv6 ospf interface</code>.</li>
<li><b>Neighbour state.</b> <code>show ipv6 ospf neighbor</code>. The state tells you which family of causes to look at.</li>
<li><b>Parameters that must match.</b> Area ID, hello and dead timers, area type (stub flags), Instance ID, network type, authentication; plus unique router IDs and matching MTU.</li>
<li><b>Filters.</b> <code>show ipv6 access-list</code> for an IPv6 ACL dropping protocol 89 or FF02::5.</li>
<li><b>Routes and forwarding.</b> <code>show ipv6 route ospf</code>, then ping and traceroute.</li>
</ol>

<h3>Reading the neighbour state</h3>
<table class="cmp"><tr><th>What you see</th><th>Likely causes</th></tr>
<tr><td>No neighbour at all</td><td>Interface not enabled for OSPFv3, passive interface, no router ID, <code>ipv6 unicast-routing</code> missing, area/timer/Instance ID mismatch, IPv6 ACL, link down</td></tr>
<tr><td>INIT</td><td>We hear their Hellos but they do not list us: one-way problem, often an ACL or filter on the other side</td></tr>
<tr><td>2WAY</td><td>Normal between two DROthers on a LAN. Only a problem on a point-to-point link or where FULL is expected</td></tr>
<tr><td>EXSTART / EXCHANGE</td><td><b>MTU mismatch</b> (classic), or a duplicate router ID</td></tr>
<tr><td>FULL but prefix missing</td><td>The interface owning the prefix is not in OSPFv3; wrong area; the remote router lacks the route</td></tr>
<tr><td>Route present, ping fails</td><td>Return route missing, <code>ipv6 unicast-routing</code> off on a transit router, data ACL</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="OSPFv3 troubleshooting decision flow">
<rect x="220" y="10" width="200" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">show ipv6 ospf neighbor</text>
<line x1="320" y1="46" x2="100" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="46" x2="320" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="46" x2="540" y2="80" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="80" width="160" height="36" rx="8" fill="#fed7aa"/><text x="100" y="103" text-anchor="middle" class="svg-ink" font-size="13">Empty</text>
<rect x="240" y="80" width="160" height="36" rx="8" fill="#fde68a"/><text x="320" y="103" text-anchor="middle" class="svg-ink" font-size="13">Stuck state</text>
<rect x="460" y="80" width="160" height="36" rx="8" fill="#bbf7d0"/><text x="540" y="103" text-anchor="middle" class="svg-ink" font-size="13">FULL</text>
<rect x="20" y="130" width="160" height="110" rx="8" fill="#fff7ed" stroke="#64748b"/><text x="100" y="152" text-anchor="middle" class="svg-ink" font-size="12">RID set?</text><text x="100" y="172" text-anchor="middle" class="svg-ink" font-size="12">int in OSPFv3?</text><text x="100" y="192" text-anchor="middle" class="svg-ink" font-size="12">passive?</text><text x="100" y="212" text-anchor="middle" class="svg-ink" font-size="12">area, timers?</text><text x="100" y="232" text-anchor="middle" class="svg-ink" font-size="12">IPv6 ACL?</text>
<rect x="240" y="130" width="160" height="110" rx="8" fill="#fefce8" stroke="#64748b"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="12">INIT: one-way</text><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="12">EXSTART: MTU</text><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="12">or duplicate RID</text><text x="320" y="212" text-anchor="middle" class="svg-ink" font-size="12">2WAY: normal</text><text x="320" y="232" text-anchor="middle" class="svg-ink" font-size="12">for DROthers</text>
<rect x="460" y="130" width="160" height="110" rx="8" fill="#f0fdf4" stroke="#64748b"/><text x="540" y="152" text-anchor="middle" class="svg-ink" font-size="12">route in table?</text><text x="540" y="172" text-anchor="middle" class="svg-ink" font-size="12">prefix int enabled?</text><text x="540" y="192" text-anchor="middle" class="svg-ink" font-size="12">return route?</text><text x="540" y="212" text-anchor="middle" class="svg-ink" font-size="12">unicast-routing</text><text x="540" y="232" text-anchor="middle" class="svg-ink" font-size="12">on transit?</text>
</svg><p class="cap">Let the neighbour table choose your next check.</p></div>

<h3>Walkthrough: ticket "OSPFv3 neighbours missing"</h3>
<p>The Mumbai team reports: "Since last night's change, Mumbai cannot reach Delhi over IPv6." You start on R2, in the middle of the path.</p>
<pre class="out">R2# show ipv6 ospf neighbor

            OSPFv3 Router with ID (2.2.2.2) (Process ID 10)

Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
1.1.1.1           1   FULL/BDR        00:00:36    3               GigabitEthernet0/0</pre>
<p>R3 is missing. Check R2's side of that link first:</p>
<pre class="out">R2# show ipv6 ospf interface brief
Interface    PID   Area            Intf ID    Cost  State Nbrs F/C
<span class="hl">Gi0/1        10    0               4          1     DR    0/0</span>
Gi0/0        10    0               3          1     DR    1/1</pre>
<p>R2 Gi0/1 is enabled in area 0 but sees nobody. Move to R3:</p>
<pre class="out">R3# show ipv6 protocols | begin ospf
IPv6 Routing Protocol is "ospf 10"
  <span class="hl">Router ID 0.0.0.0</span>
  Number of areas: 0 normal, 0 stub, 0 nssa
  Redistribution:
    None
R3# show logging | include OSPFv3
<span class="hl">%OSPFv3-4-NORTRID: OSPFv3 process 10 could not pick a router-id,</span></pre>
<p>Fault 1: during the change, the process was removed and re-created without <code>router-id 3.3.3.3</code>. R3 is IPv6-only, so it cannot choose an ID. Fix it and look again:</p>
<pre class="code">R3(config)# ipv6 router ospf 10
R3(config-rtr)# router-id 3.3.3.3</pre>
<p>Still no neighbour after a minute. The interface check on R3 now shows the second problem:</p>
<pre class="out">R3# show ipv6 ospf interface GigabitEthernet0/0 | include Area|Timer
  <span class="hl">Area 0, Process ID 10, Instance ID 0, Router ID 3.3.3.3</span>
  <span class="hl">Timer intervals configured, Hello 5, Dead 20, Wait 20, Retransmit 5</span>
R2# debug ipv6 ospf hello
OSPFv3-10-IPv6 HELLO Gi0/1: Mismatched hello parameters from FE80::5200:FF:FE03:0
OSPFv3-10-IPv6 HELLO Gi0/1: Dead R 20 C 40, Hello R 5 C 10
R2# undebug all</pre>
<p>Fault 2: someone set <code>ipv6 ospf hello-interval 5</code> on R3 Gi0/0 while R2 kept the default 10/40. "R" is what was received, "C" is what is configured locally. Remove the custom timers (<code>no ipv6 ospf hello-interval</code> and <code>no ipv6 ospf dead-interval</code>) or match them on both ends. Within seconds:</p>
<pre class="out"><span class="hl">%OSPFv3-5-ADJCHG: Process 10, Nbr 3.3.3.3 on GigabitEthernet0/1 from LOADING to FULL, Loading Done</span></pre>
<p>Finish the workflow: <code>show ipv6 route ospf</code> on R3 shows the Delhi prefix, and a ping from R1 to 2001:DB8:ACAD:3::1 succeeds. Close the ticket with both root causes documented.</p>

<div class="eg"><p><b>Worked example: area mismatch.</b> If R3 Gi0/0 had been set to <code>ipv6 ospf 10 area 1</code> instead, R2 would log a message such as <code>%OSPFv3-4-ERRRCV: Received invalid packet: mismatched area ID</code> naming R3's link-local address and Gi0/1. The neighbour never appears. The fix is to put both ends of the link in the same area.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Jumping to <code>debug</code> before reading <code>show</code> output; debugs are noisy and risky on busy routers. Always <code>undebug all</code> afterwards. (2) Treating 2WAY between two DROthers as a fault. (3) Fixing one fault and closing the ticket without re-verifying; tickets often hide two faults, as here.</p></div>
<div class="exam"><p><b>Exam traps, collected.</b></p><ul>
<li>No <code>network</code> command in OSPFv3; enable per interface.</li>
<li>IPv6-only router with no <code>router-id</code>: no neighbours, NORTRID.</li>
<li>Multicast FF02::5 (all OSPF routers) and FF02::6 (DR/BDR), not FF02::1/FF02::2.</li>
<li>Next hops are link-local; Neighbor ID is the router ID.</li>
<li>Neighbours need matching area, timers, stub flags and Instance ID, not matching global prefixes.</li>
<li>Route codes: O, OI, OE1/OE2, ON1/ON2; AD 110.</li>
<li>Passive stops Hellos, not advertisement. Authentication in classic OSPFv3 uses IPsec.</li>
<li>Stuck in EXSTART/EXCHANGE usually means MTU mismatch.</li>
</ul></div>

<div class="scn"><h4>The jumbo-frame upgrade</h4><p>A data center team raised the MTU to 9000 on one side of a core link to support storage traffic. OSPFv2 on that link had been removed during a migration, so only OSPFv3 ran there. That evening the IPv6 routes over the link disappeared. <code>show ipv6 ospf neighbor</code> showed the neighbour cycling between EXSTART and EXCHANGE. <code>show ipv6 interface</code> on both ends revealed MTU 9000 versus 1500. Setting the same MTU on both sides brought the adjacency to FULL. (<code>ipv6 ospf mtu-ignore</code> would also form the adjacency, but hides a real mismatch.)</p><p><b>Lesson:</b> the stuck state points straight at the cause; learn the state-to-cause mapping.</p></div>

<div class="iv"><p class="q">"Two routers are directly connected but show no OSPFv3 neighbour. How do you troubleshoot?"</p><p>Strong answer: go bottom-up. Interface up/up with link-local; <code>ipv6 unicast-routing</code> present; process has a router ID; interface enabled with the right process and area and not passive (<code>show ipv6 ospf interface</code>); Hello/dead timers, area type, Instance ID and authentication match; no IPv6 ACL blocking OSPF; unique router IDs. Use <code>debug ipv6 ospf hello</code> briefly if <code>show</code> commands do not reveal it. Mention that global prefixes do not need to match.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Check in order: interface, unicast-routing, router ID, OSPFv3 interface, neighbour state, parameters, filters, routes.</li>
<li>The neighbour state points to the cause: empty, INIT, 2WAY, EXSTART, FULL.</li>
<li>NORTRID and timer mismatch are the two most common OSPFv3 lab faults.</li>
<li>Use debug briefly and always <code>undebug all</code>.</li>
<li>Re-verify end to end after every fix; tickets often contain more than one fault.</li>
</ul></div>
`,hi:`
<p>Jab car start nahi hoti, achha mechanic pehle engine replace nahi karta. Woh fuel check karta hai, phir battery, phir starter, isi order mein, kyunki har check causes ke ek poore group ko rule out kar deta hai. OSPFv3 troubleshooting bhi aise hi kaam karta hai. Zyada tar problems causes ke ek chhote set mein aati hain, aur checks ka fixed order unhe minutes mein dhoondh leta hai. Yeh chapter aapko woh order deta hai, lab ticket "OSPFv3 neighbours missing" ko walk through karta hai, aur exam traps ikattha karta hai.</p>

<h3>Workflow, neeche se upar</h3>
<ol>
<li><b>Link par Layer 1/2 aur IPv6.</b> <code>show ipv6 interface brief</code>: interface up/up aur link-local address maujood.</li>
<li><b>IPv6 routing on.</b> <code>show running-config | include unicast-routing</code>.</li>
<li><b>Process aur router ID.</b> <code>show ipv6 protocols</code> ya <code>show ipv6 ospf</code>. IPv6-only router par RID nahi matlab NORTRID.</li>
<li><b>Interface OSPFv3 mein, sahi process aur area, passive nahi.</b> <code>show ipv6 ospf interface brief</code> aur <code>show ipv6 ospf interface</code>.</li>
<li><b>Neighbour state.</b> <code>show ipv6 ospf neighbor</code>. State batata hai ki causes ki kaunsi family dekhni hai.</li>
<li><b>Parameters jo match hone chahiye.</b> Area ID, hello aur dead timers, area type (stub flags), Instance ID, network type, authentication; saath mein unique router IDs aur matching MTU.</li>
<li><b>Filters.</b> <code>show ipv6 access-list</code>, koi IPv6 ACL jo protocol 89 ya FF02::5 drop kar raha ho.</li>
<li><b>Routes aur forwarding.</b> <code>show ipv6 route ospf</code>, phir ping aur traceroute.</li>
</ol>

<h3>Neighbour state padhna</h3>
<table class="cmp"><tr><th>Kya dikhta hai</th><th>Sambhavit causes</th></tr>
<tr><td>Koi neighbour hi nahi</td><td>Interface OSPFv3 ke liye enabled nahi, passive interface, router ID nahi, <code>ipv6 unicast-routing</code> missing, area/timer/Instance ID mismatch, IPv6 ACL, link down</td></tr>
<tr><td>INIT</td><td>Hum unke Hellos sunte hain lekin woh humein list nahi karte: one-way problem, aksar doosri side par ACL ya filter</td></tr>
<tr><td>2WAY</td><td>LAN par do DROthers ke beech normal hai. Sirf point-to-point link par ya jahan FULL expected ho wahan problem</td></tr>
<tr><td>EXSTART / EXCHANGE</td><td><b>MTU mismatch</b> (classic), ya duplicate router ID</td></tr>
<tr><td>FULL lekin prefix missing</td><td>Prefix wala interface OSPFv3 mein nahi; galat area; remote router ke paas route nahi</td></tr>
<tr><td>Route hai, ping fail</td><td>Return route missing, transit router par <code>ipv6 unicast-routing</code> off, data ACL</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="OSPFv3 troubleshooting decision flow">
<rect x="220" y="10" width="200" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">show ipv6 ospf neighbor</text>
<line x1="320" y1="46" x2="100" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="46" x2="320" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="46" x2="540" y2="80" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="80" width="160" height="36" rx="8" fill="#fed7aa"/><text x="100" y="103" text-anchor="middle" class="svg-ink" font-size="13">Khaali</text>
<rect x="240" y="80" width="160" height="36" rx="8" fill="#fde68a"/><text x="320" y="103" text-anchor="middle" class="svg-ink" font-size="13">Atki state</text>
<rect x="460" y="80" width="160" height="36" rx="8" fill="#bbf7d0"/><text x="540" y="103" text-anchor="middle" class="svg-ink" font-size="13">FULL</text>
<rect x="20" y="130" width="160" height="110" rx="8" fill="#fff7ed" stroke="#64748b"/><text x="100" y="152" text-anchor="middle" class="svg-ink" font-size="12">RID set hai?</text><text x="100" y="172" text-anchor="middle" class="svg-ink" font-size="12">int OSPFv3 mein?</text><text x="100" y="192" text-anchor="middle" class="svg-ink" font-size="12">passive?</text><text x="100" y="212" text-anchor="middle" class="svg-ink" font-size="12">area, timers?</text><text x="100" y="232" text-anchor="middle" class="svg-ink" font-size="12">IPv6 ACL?</text>
<rect x="240" y="130" width="160" height="110" rx="8" fill="#fefce8" stroke="#64748b"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="12">INIT: one-way</text><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="12">EXSTART: MTU</text><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="12">ya duplicate RID</text><text x="320" y="212" text-anchor="middle" class="svg-ink" font-size="12">2WAY: DROthers</text><text x="320" y="232" text-anchor="middle" class="svg-ink" font-size="12">ke liye normal</text>
<rect x="460" y="130" width="160" height="110" rx="8" fill="#f0fdf4" stroke="#64748b"/><text x="540" y="152" text-anchor="middle" class="svg-ink" font-size="12">route table mein?</text><text x="540" y="172" text-anchor="middle" class="svg-ink" font-size="12">prefix int enabled?</text><text x="540" y="192" text-anchor="middle" class="svg-ink" font-size="12">return route?</text><text x="540" y="212" text-anchor="middle" class="svg-ink" font-size="12">transit par</text><text x="540" y="232" text-anchor="middle" class="svg-ink" font-size="12">unicast-routing?</text>
</svg><p class="cap">Neighbour table ko aapka agla check chunne do.</p></div>

<h3>Walkthrough: ticket "OSPFv3 neighbours missing"</h3>
<p>Mumbai team report karti hai: "Kal raat ke change ke baad se Mumbai IPv6 par Delhi tak nahi pahunch pa raha." Aap path ke beech wale R2 se shuru karte ho.</p>
<pre class="out">R2# show ipv6 ospf neighbor

            OSPFv3 Router with ID (2.2.2.2) (Process ID 10)

Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
1.1.1.1           1   FULL/BDR        00:00:36    3               GigabitEthernet0/0</pre>
<p>R3 gayab hai. Pehle us link ki R2 wali side check karo:</p>
<pre class="out">R2# show ipv6 ospf interface brief
Interface    PID   Area            Intf ID    Cost  State Nbrs F/C
<span class="hl">Gi0/1        10    0               4          1     DR    0/0</span>
Gi0/0        10    0               3          1     DR    1/1</pre>
<p>R2 Gi0/1 area 0 mein enabled hai lekin kisi ko nahi dekhta. R3 par jao:</p>
<pre class="out">R3# show ipv6 protocols | begin ospf
IPv6 Routing Protocol is "ospf 10"
  <span class="hl">Router ID 0.0.0.0</span>
  Number of areas: 0 normal, 0 stub, 0 nssa
  Redistribution:
    None
R3# show logging | include OSPFv3
<span class="hl">%OSPFv3-4-NORTRID: OSPFv3 process 10 could not pick a router-id,</span></pre>
<p>Fault 1: change ke dauraan process hata kar <code>router-id 3.3.3.3</code> ke bina dobara banaya gaya. R3 IPv6-only hai, isliye ID nahi chun sakta. Fix karo aur phir dekho:</p>
<pre class="code">R3(config)# ipv6 router ospf 10
R3(config-rtr)# router-id 3.3.3.3</pre>
<p>Ek minute baad bhi neighbour nahi. Ab R3 par interface check doosri problem dikhata hai:</p>
<pre class="out">R3# show ipv6 ospf interface GigabitEthernet0/0 | include Area|Timer
  <span class="hl">Area 0, Process ID 10, Instance ID 0, Router ID 3.3.3.3</span>
  <span class="hl">Timer intervals configured, Hello 5, Dead 20, Wait 20, Retransmit 5</span>
R2# debug ipv6 ospf hello
OSPFv3-10-IPv6 HELLO Gi0/1: Mismatched hello parameters from FE80::5200:FF:FE03:0
OSPFv3-10-IPv6 HELLO Gi0/1: Dead R 20 C 40, Hello R 5 C 10
R2# undebug all</pre>
<p>Fault 2: kisi ne R3 Gi0/0 par <code>ipv6 ospf hello-interval 5</code> set kar diya jabki R2 default 10/40 par raha. "R" matlab jo receive hua, "C" matlab jo locally configured hai. Custom timers hatao (<code>no ipv6 ospf hello-interval</code> aur <code>no ipv6 ospf dead-interval</code>) ya dono ends par match karo. Seconds mein:</p>
<pre class="out"><span class="hl">%OSPFv3-5-ADJCHG: Process 10, Nbr 3.3.3.3 on GigabitEthernet0/1 from LOADING to FULL, Loading Done</span></pre>
<p>Workflow poora karo: R3 par <code>show ipv6 route ospf</code> Delhi prefix dikhata hai, aur R1 se 2001:DB8:ACAD:3::1 ka ping succeed hota hai. Dono root causes document karke ticket band karo.</p>

<div class="eg"><p><b>Worked example: area mismatch.</b> Agar R3 Gi0/0 par uski jagah <code>ipv6 ospf 10 area 1</code> set hota, to R2 <code>%OSPFv3-4-ERRRCV: Received invalid packet: mismatched area ID</code> jaisa message log karta jismein R3 ka link-local address aur Gi0/1 hota. Neighbour kabhi nahi dikhta. Fix hai link ke dono ends ko same area mein daalna.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) <code>show</code> output padhne se pehle <code>debug</code> par kood jaana; busy routers par debugs shor wale aur risky hote hain. Baad mein hamesha <code>undebug all</code>. (2) Do DROthers ke beech 2WAY ko fault samajhna. (3) Ek fault fix karke bina dobara verify kiye ticket band karna; tickets mein aksar do faults chhupe hote hain, jaise yahan.</p></div>
<div class="exam"><p><b>Exam traps, ek jagah.</b></p><ul>
<li>OSPFv3 mein <code>network</code> command nahi; per interface enable karo.</li>
<li><code>router-id</code> ke bina IPv6-only router: koi neighbour nahi, NORTRID.</li>
<li>Multicast FF02::5 (saare OSPF routers) aur FF02::6 (DR/BDR), FF02::1/FF02::2 nahi.</li>
<li>Next hops link-local hain; Neighbor ID router ID hai.</li>
<li>Neighbours ko matching area, timers, stub flags aur Instance ID chahiye, matching global prefixes nahi.</li>
<li>Route codes: O, OI, OE1/OE2, ON1/ON2; AD 110.</li>
<li>Passive Hellos rokta hai, advertisement nahi. Classic OSPFv3 mein authentication IPsec use karta hai.</li>
<li>EXSTART/EXCHANGE mein atakna aam taur par MTU mismatch hai.</li>
</ul></div>

<div class="scn"><h4>Jumbo-frame upgrade</h4><p>Ek data center team ne storage traffic ke liye core link ki ek side par MTU 9000 kar diya. Migration ke dauraan us link se OSPFv2 hata diya gaya tha, isliye wahan sirf OSPFv3 chal raha tha. Us shaam link ke upar ke IPv6 routes gayab ho gaye. <code>show ipv6 ospf neighbor</code> mein neighbour EXSTART aur EXCHANGE ke beech ghoom raha tha. Dono ends par <code>show ipv6 interface</code> ne MTU 9000 vs 1500 dikhaya. Dono sides par same MTU set karne se adjacency FULL ho gayi. (<code>ipv6 ospf mtu-ignore</code> se bhi adjacency ban jaati, lekin woh asli mismatch ko chhupa deta hai.)</p><p><b>Seekh:</b> atki hui state seedha cause ki taraf point karti hai; state-to-cause mapping seekho.</p></div>

<div class="iv"><p class="q">"Do routers directly connected hain lekin koi OSPFv3 neighbour nahi dikhta. Kaise troubleshoot karoge?"</p><p>Strong answer: neeche se upar jao. Interface up/up link-local ke saath; <code>ipv6 unicast-routing</code> maujood; process ka router ID hai; interface sahi process aur area ke saath enabled hai aur passive nahi (<code>show ipv6 ospf interface</code>); Hello/dead timers, area type, Instance ID aur authentication match karte hain; koi IPv6 ACL OSPF ko block nahi kar raha; router IDs unique hain. Agar <code>show</code> commands se pata na chale to thodi der ke liye <code>debug ipv6 ospf hello</code> use karo. Batao ki global prefixes ka match hona zaroori nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein check karo: interface, unicast-routing, router ID, OSPFv3 interface, neighbour state, parameters, filters, routes.</li>
<li>Neighbour state cause ki taraf point karti hai: khaali, INIT, 2WAY, EXSTART, FULL.</li>
<li>NORTRID aur timer mismatch do sabse common OSPFv3 lab faults hain.</li>
<li>Debug thodi der ke liye use karo aur hamesha <code>undebug all</code>.</li>
<li>Har fix ke baad end to end dobara verify karo; tickets mein aksar ek se zyada fault hote hain.</li>
</ul></div>
`}};export{e as default};