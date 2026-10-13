var e={id:`life-of-a-packet`,h:{en:`The life of a packet inside a router or switch`,hi:`Router ya switch ke andar packet ki zindagi`},body:{en:`
<p>Picture a big airport. The <b>admin office</b> handles staff logins, reports and audits. <b>Air traffic control</b> talks to other airports and decides which runway and route each flight should take. The <b>baggage belts</b> move thousands of bags per minute without asking anyone, following labels that were printed in advance. A router or switch has exactly these three parts, called <b>planes</b>. CCNA taught you what a router does; ENCOR expects you to know <b>how</b> it does it, because many exam questions and many real outages are about which plane is busy or broken.</p>

<h3>The three planes</h3>
<dl class="terms">
<dt>Management plane</dt><dd>Everything used to manage the device: SSH, the console, SNMP, syslog, NETCONF, RESTCONF, AAA. If it breaks, the device may still forward traffic perfectly, but you cannot log in or monitor it.</dd>
<dt>Control plane</dt><dd>The "brain" that learns the network: routing protocols (OSPF, EIGRP, BGP), STP, ARP and IPv6 Neighbor Discovery, LACP, CDP. It runs on the <b>CPU</b> and builds the tables that the data plane uses.</dd>
<dt>Data plane (forwarding plane)</dt><dd>The "muscle" that moves transit packets from an input interface to an output interface using prebuilt tables. On Catalyst switches and many routers this happens in <b>hardware (ASICs)</b> at line rate, without touching the CPU.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Planes and tables inside a router">
<rect x="20" y="10" width="600" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">Management plane: SSH, SNMP, syslog, NETCONF</text>
<rect x="20" y="70" width="600" height="80" rx="8" fill="#ddd6fe"/><text x="40" y="92" class="svg-ink" font-size="13">Control plane (CPU)</text>
<rect x="60" y="102" width="200" height="38" rx="6" fill="#bae6fd"/><text x="160" y="126" text-anchor="middle" class="svg-ink" font-size="13">RIB: best routes</text>
<rect x="380" y="102" width="200" height="38" rx="6" fill="#bae6fd"/><text x="480" y="126" text-anchor="middle" class="svg-ink" font-size="13">ARP / ND table</text>
<rect x="20" y="180" width="600" height="80" rx="8" fill="#bbf7d0"/><text x="40" y="202" class="svg-ink" font-size="13">Data plane (ASIC / CEF)</text>
<rect x="60" y="212" width="200" height="38" rx="6" fill="#fde68a"/><text x="160" y="236" text-anchor="middle" class="svg-ink" font-size="13">FIB: prefix, next hop</text>
<rect x="380" y="212" width="200" height="38" rx="6" fill="#fde68a"/><text x="480" y="236" text-anchor="middle" class="svg-ink" font-size="13">Adjacency: L2 rewrite</text>
<line x1="160" y1="140" x2="160" y2="212" stroke="#64748b" stroke-width="2"/><line x1="480" y1="140" x2="480" y2="212" stroke="#64748b" stroke-width="2"/>
<line x1="260" y1="231" x2="380" y2="231" stroke="#64748b" stroke-width="2"/>
<text x="175" y="175" class="svg-accent" font-size="12">copied down</text><text x="495" y="175" class="svg-accent" font-size="12">copied down</text>
<text x="320" y="282" text-anchor="middle" class="svg-muted" font-size="12">Transit packets use only the green layer; the CPU prepares it in advance</text>
</svg><p class="cap">The control plane builds the RIB and ARP table; CEF copies them into the FIB and adjacency table that the data plane uses.</p></div>

<h3>RIB, FIB and the adjacency table</h3>
<p>The <b>RIB</b> (Routing Information Base) is what <code>show ip route</code> displays. Every routing source offers routes; for each prefix the router keeps the one with the lowest administrative distance. The RIB can contain <b>recursive</b> next hops, for example a BGP route whose next hop is a loopback that is itself reached through OSPF.</p>
<p>Looking through the RIB for every packet would be slow, so <b>CEF</b> (Cisco Express Forwarding) builds two optimised tables from it:</p>
<ul>
<li><b>FIB</b> (Forwarding Information Base): every prefix with its next hop and outgoing interface already <b>resolved</b>, organised for fast longest-prefix-match lookups.</li>
<li><b>Adjacency table</b>: for each directly connected next hop, the complete Layer 2 header to write on the packet (destination MAC, source MAC, EtherType), taken from ARP or IPv6 ND.</li>
</ul>
<p>Some adjacencies are special: <b>glean</b> (the destination is on a connected subnet but ARP is not resolved yet, so the packet is sent to the CPU to trigger ARP), <b>punt</b> (send to the CPU), <b>drop</b> and <b>null</b> (discard, for example a route to Null0).</p>

<h3>Three switching methods, from slowest to fastest</h3>
<table class="cmp"><tr><th>Method</th><th>How it works</th><th>Today</th></tr>
<tr><td><b>Process switching</b></td><td>The CPU looks up the RIB and ARP for <b>every</b> packet.</td><td>Only for packets that must be punted: traffic to the device itself, TTL expiry, IP options, ACL logging, glean.</td></tr>
<tr><td><b>Fast switching</b></td><td>The first packet to a destination is process switched and the result stored in a <b>route cache</b>; later packets use the cache ("route once, switch many").</td><td>Legacy. Caches aged out and were rebuilt, and the first packet of every new flow still hit the CPU.</td></tr>
<tr><td><b>CEF</b></td><td>FIB and adjacency table are built <b>before</b> any packet arrives, from the topology. Every packet, including the first, is switched with one lookup.</td><td>Default on IOS and IOS XE. On Catalyst switches the FIB is programmed into hardware TCAM.</td></tr>
</table>

<h3>CAM and TCAM</h3>
<p>Switches store tables in special memories. <b>CAM</b> (Content Addressable Memory) does exact-match lookups on binary values; the MAC address table (VLAN + MAC gives port) lives here. <b>TCAM</b> (Ternary CAM) stores a value <b>and a mask</b>, so each bit can be 0, 1 or "don't care". That makes it perfect for longest-prefix match, ACLs and QoS classification, all in a single clock cycle. TCAM space is limited; on Catalyst switches <b>SDM templates</b> (<code>show sdm prefer</code>) decide how much goes to routes, MACs, ACLs and so on.</p>

<div class="eg"><p><b>Worked example.</b> A PC 10.1.10.50 sends a packet to the ERP server 10.10.20.10. It reaches CORE1. CORE1's FIB matches 10.10.20.0/24 with next hop 10.0.0.9 out of Te1/0/5. The adjacency entry gives the new Layer 2 header: destination MAC of DC-SW1, source MAC of CORE1's Te1/0/5, EtherType 0x0800. CORE1 decrements the TTL (say 63 to 62), recalculates the IP header checksum, rewrites the Ethernet header and sends the packet. The IP source and destination never change; the MAC addresses change at every routed hop.</p></div>

<h3>Verifying the path at each level</h3>
<pre class="code"><span class="c">! control plane view: the RIB</span>
CORE1# show ip route 10.10.20.10
<span class="c">! data plane view: the FIB and the adjacency CEF will use</span>
CORE1# show ip cef 10.10.20.10
CORE1# show ip cef exact-route 10.1.10.50 10.10.20.10
CORE1# show adjacency TenGigabitEthernet1/0/5 detail</pre>
<pre class="out">CORE1# show ip route 10.10.20.10
Routing entry for 10.10.20.0/24
  <span class="hl">Known via "ospf 1", distance 110, metric 2, type intra area</span>
  Last update from 10.0.0.9 on TenGigabitEthernet1/0/5, 02:14:07 ago
  Routing Descriptor Blocks:
  * 10.0.0.9, from 10.255.0.10, 02:14:07 ago, via TenGigabitEthernet1/0/5
      Route metric is 2, traffic share count is 1

CORE1# show ip cef 10.10.20.10
10.10.20.0/24
  <span class="hl">nexthop 10.0.0.9 TenGigabitEthernet1/0/5</span>

CORE1# show ip cef exact-route 10.1.10.50 10.10.20.10
10.1.10.50 -&gt; 10.10.20.10 =&gt;IP adj out of TenGigabitEthernet1/0/5, addr 10.0.0.9</pre>
<p>If the RIB has a route but the FIB does not, or the adjacency shows as incomplete, the problem is between the planes (for example ARP not resolving), not in the routing protocol.</p>

<div class="warn"><p><b>Common mistake.</b> Assuming that high CPU means the switch is "too slow to forward". On hardware platforms transit traffic never touches the CPU. High CPU usually means something is being <b>punted</b>: ACL <code>log</code> entries, TTL-expired packets from a routing loop, ARP storms, or control-plane attacks. That is why CoPP (Control Plane Policing) exists.</p></div>

<div class="exam"><p><b>Exam trap.</b> Fast switching is <b>demand-driven</b> (the cache is built by the first packet); CEF is <b>topology-driven</b> (tables built before traffic flows). Also remember: the FIB is derived from the RIB, and the adjacency table from ARP/ND, not the other way round. TCAM, not CAM, is used for longest match and ACLs.</p></div>

<div class="scn"><h4>The log keyword that ate the CPU</h4><p>After a security change, users on a distribution switch reported slow SSH sessions and occasional OSPF flaps. <code>show processes cpu sorted</code> showed CPU at 95% with most of it in packet-handling processes. The new ACL on the user SVIs ended with <code>deny ip any any log</code>. Every denied packet was punted to the CPU to generate a syslog message, starving OSPF hellos. Removing <code>log</code> from the busy entry (keeping it only on a narrow, low-volume line) brought CPU down to 8% and OSPF stabilised.</p><p><b>Lesson:</b> the data plane is fast only while packets stay in hardware. Anything that punts traffic to the CPU is a control-plane risk.</p></div>

<div class="iv"><p class="q">"What is the difference between the RIB and the FIB?"</p><p>Strong answer: the RIB is the control-plane routing table holding the best route per prefix from all sources after administrative distance; it may contain recursive next hops. The FIB is CEF's data-plane copy with next hops fully resolved to an outgoing interface, paired with the adjacency table that holds the Layer 2 rewrite. Packets are forwarded using FIB plus adjacency, often in hardware TCAM. Mention <code>show ip route</code> versus <code>show ip cef</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Management plane manages, control plane learns (CPU), data plane forwards (often ASIC hardware).</li>
<li>RIB = best routes after AD; FIB = resolved copy for forwarding; adjacency table = Layer 2 rewrite from ARP/ND.</li>
<li>Process switching uses the CPU per packet; fast switching caches per flow (legacy); CEF is prebuilt and default.</li>
<li>CAM does exact match (MAC table); TCAM does value plus mask (routes, ACLs, QoS); SDM templates share TCAM space.</li>
<li>High CPU usually means punted traffic, not slow forwarding.</li>
</ul></div>
`,hi:`
<p>Ek bada airport socho. <b>Admin office</b> staff logins, reports aur audits handle karta hai. <b>Air traffic control</b> doosre airports se baat karta hai aur decide karta hai ki har flight kaunsa runway aur route le. <b>Baggage belts</b> har minute hazaaron bags bina kisi se pooche move karti hain, pehle se print kiye labels follow karke. Router ya switch mein bilkul yeh teen hisse hote hain, jinhe <b>planes</b> kehte hain. CCNA ne sikhaya ki router kya karta hai; ENCOR expect karta hai ki aap jaano woh <b>kaise</b> karta hai, kyunki kai exam questions aur kai real outages is baare mein hote hain ki kaunsa plane busy ya broken hai.</p>

<h3>Teen planes</h3>
<dl class="terms">
<dt>Management plane</dt><dd>Device manage karne mein use hone wali har cheez: SSH, console, SNMP, syslog, NETCONF, RESTCONF, AAA. Agar yeh toote, to device phir bhi traffic perfectly forward kar sakta hai, par aap login ya monitor nahi kar paoge.</dd>
<dt>Control plane</dt><dd>"Dimaag" jo network seekhta hai: routing protocols (OSPF, EIGRP, BGP), STP, ARP aur IPv6 Neighbor Discovery, LACP, CDP. Yeh <b>CPU</b> par chalta hai aur woh tables banata hai jo data plane use karta hai.</dd>
<dt>Data plane (forwarding plane)</dt><dd>"Muscle" jo transit packets ko prebuilt tables ki madad se input interface se output interface tak le jaata hai. Catalyst switches aur kai routers par yeh <b>hardware (ASICs)</b> mein line rate par hota hai, CPU ko chhue bina.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Planes and tables inside a router">
<rect x="20" y="10" width="600" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">Management plane: SSH, SNMP, syslog, NETCONF</text>
<rect x="20" y="70" width="600" height="80" rx="8" fill="#ddd6fe"/><text x="40" y="92" class="svg-ink" font-size="13">Control plane (CPU)</text>
<rect x="60" y="102" width="200" height="38" rx="6" fill="#bae6fd"/><text x="160" y="126" text-anchor="middle" class="svg-ink" font-size="13">RIB: best routes</text>
<rect x="380" y="102" width="200" height="38" rx="6" fill="#bae6fd"/><text x="480" y="126" text-anchor="middle" class="svg-ink" font-size="13">ARP / ND table</text>
<rect x="20" y="180" width="600" height="80" rx="8" fill="#bbf7d0"/><text x="40" y="202" class="svg-ink" font-size="13">Data plane (ASIC / CEF)</text>
<rect x="60" y="212" width="200" height="38" rx="6" fill="#fde68a"/><text x="160" y="236" text-anchor="middle" class="svg-ink" font-size="13">FIB: prefix, next hop</text>
<rect x="380" y="212" width="200" height="38" rx="6" fill="#fde68a"/><text x="480" y="236" text-anchor="middle" class="svg-ink" font-size="13">Adjacency: L2 rewrite</text>
<line x1="160" y1="140" x2="160" y2="212" stroke="#64748b" stroke-width="2"/><line x1="480" y1="140" x2="480" y2="212" stroke="#64748b" stroke-width="2"/>
<line x1="260" y1="231" x2="380" y2="231" stroke="#64748b" stroke-width="2"/>
<text x="175" y="175" class="svg-accent" font-size="12">neeche copy</text><text x="495" y="175" class="svg-accent" font-size="12">neeche copy</text>
<text x="320" y="282" text-anchor="middle" class="svg-muted" font-size="12">Transit packets sirf green layer use karte hain; CPU use pehle se taiyaar karta hai</text>
</svg><p class="cap">Control plane RIB aur ARP table banata hai; CEF unhe FIB aur adjacency table mein copy karta hai jo data plane use karta hai.</p></div>

<h3>RIB, FIB aur adjacency table</h3>
<p><b>RIB</b> (Routing Information Base) woh hai jo <code>show ip route</code> dikhata hai. Har routing source routes offer karta hai; har prefix ke liye router sabse kam administrative distance wala route rakhta hai. RIB mein <b>recursive</b> next hops ho sakte hain, jaise ek BGP route jiska next hop ek loopback hai jo khud OSPF se reach hota hai.</p>
<p>Har packet ke liye RIB mein dhoondhna slow hoga, isliye <b>CEF</b> (Cisco Express Forwarding) usse do optimised tables banata hai:</p>
<ul>
<li><b>FIB</b> (Forwarding Information Base): har prefix apne next hop aur outgoing interface ke saath pehle se <b>resolved</b>, fast longest-prefix-match lookups ke liye organised.</li>
<li><b>Adjacency table</b>: har directly connected next hop ke liye packet par likhne wala poora Layer 2 header (destination MAC, source MAC, EtherType), ARP ya IPv6 ND se liya hua.</li>
</ul>
<p>Kuch adjacencies special hoti hain: <b>glean</b> (destination connected subnet par hai par ARP abhi resolve nahi hua, isliye ARP trigger karne ke liye packet CPU ko jaata hai), <b>punt</b> (CPU ko bhejo), <b>drop</b> aur <b>null</b> (discard, jaise Null0 ka route).</p>

<h3>Teen switching methods, sabse slow se sabse fast</h3>
<table class="cmp"><tr><th>Method</th><th>Kaise kaam karta hai</th><th>Aaj</th></tr>
<tr><td><b>Process switching</b></td><td>CPU <b>har</b> packet ke liye RIB aur ARP dekhta hai.</td><td>Sirf un packets ke liye jo punt hone chahiye: device ke liye traffic, TTL expiry, IP options, ACL logging, glean.</td></tr>
<tr><td><b>Fast switching</b></td><td>Kisi destination ka pehla packet process switch hota hai aur result <b>route cache</b> mein store hota hai; baad ke packets cache use karte hain ("route once, switch many").</td><td>Legacy. Caches age out hokar dobara bante the, aur har naye flow ka pehla packet phir bhi CPU tak jaata tha.</td></tr>
<tr><td><b>CEF</b></td><td>FIB aur adjacency table kisi bhi packet ke aane se <b>pehle</b>, topology se ban jaate hain. Har packet, pehla bhi, ek lookup se switch hota hai.</td><td>IOS aur IOS XE par default. Catalyst switches par FIB hardware TCAM mein program hota hai.</td></tr>
</table>

<h3>CAM aur TCAM</h3>
<p>Switches tables ko special memories mein store karte hain. <b>CAM</b> (Content Addressable Memory) binary values par exact-match lookups karta hai; MAC address table (VLAN + MAC se port) yahin rehti hai. <b>TCAM</b> (Ternary CAM) ek value <b>aur ek mask</b> store karta hai, isliye har bit 0, 1 ya "don't care" ho sakti hai. Isse yeh longest-prefix match, ACLs aur QoS classification ke liye perfect hai, sab ek hi clock cycle mein. TCAM space limited hai; Catalyst switches par <b>SDM templates</b> (<code>show sdm prefer</code>) decide karte hain ki kitna routes, MACs, ACLs wagairah ko milega.</p>

<div class="eg"><p><b>Worked example.</b> PC 10.1.10.50 ERP server 10.10.20.10 ko packet bhejta hai. Woh CORE1 tak pahunchta hai. CORE1 ki FIB 10.10.20.0/24 ko next hop 10.0.0.9 ke saath Te1/0/5 se match karti hai. Adjacency entry naya Layer 2 header deti hai: DC-SW1 ka destination MAC, CORE1 ke Te1/0/5 ka source MAC, EtherType 0x0800. CORE1 TTL kam karta hai (maan lo 63 se 62), IP header checksum dobara calculate karta hai, Ethernet header rewrite karta hai aur packet bhejta hai. IP source aur destination kabhi nahi badalte; MAC addresses har routed hop par badalte hain.</p></div>

<h3>Har level par path verify karna</h3>
<pre class="code"><span class="c">! control plane view: RIB</span>
CORE1# show ip route 10.10.20.10
<span class="c">! data plane view: FIB aur woh adjacency jo CEF use karega</span>
CORE1# show ip cef 10.10.20.10
CORE1# show ip cef exact-route 10.1.10.50 10.10.20.10
CORE1# show adjacency TenGigabitEthernet1/0/5 detail</pre>
<pre class="out">CORE1# show ip route 10.10.20.10
Routing entry for 10.10.20.0/24
  <span class="hl">Known via "ospf 1", distance 110, metric 2, type intra area</span>
  Last update from 10.0.0.9 on TenGigabitEthernet1/0/5, 02:14:07 ago
  Routing Descriptor Blocks:
  * 10.0.0.9, from 10.255.0.10, 02:14:07 ago, via TenGigabitEthernet1/0/5
      Route metric is 2, traffic share count is 1

CORE1# show ip cef 10.10.20.10
10.10.20.0/24
  <span class="hl">nexthop 10.0.0.9 TenGigabitEthernet1/0/5</span>

CORE1# show ip cef exact-route 10.1.10.50 10.10.20.10
10.1.10.50 -&gt; 10.10.20.10 =&gt;IP adj out of TenGigabitEthernet1/0/5, addr 10.0.0.9</pre>
<p>Agar RIB mein route hai par FIB mein nahi, ya adjacency incomplete dikhti hai, to problem planes ke beech hai (jaise ARP resolve nahi ho raha), routing protocol mein nahi.</p>

<div class="warn"><p><b>Common galti.</b> Yeh maan lena ki high CPU ka matlab switch "forward karne mein bahut slow" hai. Hardware platforms par transit traffic kabhi CPU ko nahi chhoota. High CPU ka aam matlab hai ki kuch <b>punt</b> ho raha hai: ACL <code>log</code> entries, routing loop se TTL-expired packets, ARP storms, ya control-plane attacks. Isiliye CoPP (Control Plane Policing) exist karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Fast switching <b>demand-driven</b> hai (cache pehle packet se banta hai); CEF <b>topology-driven</b> hai (traffic chalne se pehle tables bante hain). Yeh bhi yaad rakho: FIB RIB se banti hai, aur adjacency table ARP/ND se, ulta nahi. Longest match aur ACLs ke liye TCAM use hota hai, CAM nahi.</p></div>

<div class="scn"><h4>Log keyword jo CPU kha gaya</h4><p>Ek security change ke baad, ek distribution switch ke users ne slow SSH sessions aur kabhi kabhi OSPF flaps report kiye. <code>show processes cpu sorted</code> ne CPU 95% dikhaya, zyada tar packet-handling processes mein. User SVIs par naya ACL <code>deny ip any any log</code> par khatam hota tha. Har denied packet syslog message banane ke liye CPU ko punt ho raha tha, jisse OSPF hellos bhookhe reh gaye. Busy entry se <code>log</code> hataane se (use sirf ek narrow, low-volume line par rakha) CPU 8% par aa gaya aur OSPF stable ho gaya.</p><p><b>Seekh:</b> data plane tabhi tak fast hai jab tak packets hardware mein rehte hain. Jo bhi cheez traffic ko CPU par punt karti hai, woh control-plane risk hai.</p></div>

<div class="iv"><p class="q">"RIB aur FIB mein kya fark hai?"</p><p>Strong answer: RIB control-plane routing table hai jo administrative distance ke baad saare sources se har prefix ka best route rakhti hai; isme recursive next hops ho sakte hain. FIB CEF ki data-plane copy hai jisme next hops poori tarah outgoing interface tak resolved hote hain, adjacency table ke saath jo Layer 2 rewrite rakhti hai. Packets FIB plus adjacency se forward hote hain, aksar hardware TCAM mein. <code>show ip route</code> versus <code>show ip cef</code> mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Management plane manage karta hai, control plane seekhta hai (CPU), data plane forward karta hai (aksar ASIC hardware).</li>
<li>RIB = AD ke baad best routes; FIB = forwarding ke liye resolved copy; adjacency table = ARP/ND se Layer 2 rewrite.</li>
<li>Process switching har packet par CPU use karta hai; fast switching per flow cache karta hai (legacy); CEF prebuilt aur default hai.</li>
<li>CAM exact match karta hai (MAC table); TCAM value plus mask karta hai (routes, ACLs, QoS); SDM templates TCAM space baant-te hain.</li>
<li>High CPU ka aam matlab punted traffic hai, slow forwarding nahi.</li>
</ul></div>
`}};export{e as default};