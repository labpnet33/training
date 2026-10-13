var e={id:`switching-mechanisms`,h:{en:`Hardware and software switching: CEF, RIB, FIB, adjacency, CAM and TCAM`,hi:`Hardware aur software switching: CEF, RIB, FIB, adjacency, CAM aur TCAM`},body:{en:`
<p>A busy post office can sort letters in three ways. A clerk can read every envelope and look the address up in a big book (slow, but always correct). A clerk can keep sticky notes for addresses seen recently, so only the first letter to a new address is slow. Or the office can print a complete sorting table for every possible destination before the morning mail arrives, with a pre-printed label for each outgoing van, and feed it to an automatic sorting machine. Routers and switches went through exactly these three stages: <b>process switching</b>, <b>fast switching</b> and <b>Cisco Express Forwarding (CEF)</b> in hardware. ENCOR 1.7 asks you to explain them and the tables behind them.</p>

<h3>Control plane and data plane</h3>
<p>The <b>control plane</b> is the device's brain: routing protocols, spanning tree, ARP, building tables. The <b>data plane</b> is its muscle: moving each packet from an input port to an output port as fast as possible. The <b>management plane</b> is how you reach the device (SSH, SNMP, NETCONF). Good switching design keeps the data plane in hardware and the control plane on the CPU.</p>

<h3>From process switching to CEF</h3>
<table class="cmp"><tr><th>Method</th><th>How it works</th><th>Weakness</th></tr>
<tr><td>Process switching</td><td>The CPU handles every packet: routing table lookup, ARP lookup, rewrite</td><td>Slow, CPU bound</td></tr>
<tr><td>Fast switching</td><td>First packet to a destination is process-switched; the result is cached and later packets use the cache ("route once, switch many")</td><td>Demand-driven: first packet always slow; cache churn with many flows</td></tr>
<tr><td><b>CEF</b></td><td>Tables are built in advance from the routing table and ARP, before any packet arrives</td><td>Tables use memory; hardware tables have finite size</td></tr>
</table>
<p>CEF is <b>topology-driven</b>: whenever the routing table or ARP changes, CEF updates its tables immediately, so there is no first-packet penalty. It is the default on all modern Cisco platforms.</p>

<h3>The four tables</h3>
<dl class="terms">
<dt>RIB (routing information base)</dt><dd>The routing table built by the control plane from connected, static and dynamic routes. <code>show ip route</code>.</dd>
<dt>FIB (forwarding information base)</dt><dd>CEF's copy of the RIB, optimised for lookup, with recursive next hops already resolved to a directly connected next hop. <code>show ip cef</code>.</dd>
<dt>Adjacency table</dt><dd>For every directly connected next hop, the pre-built Layer 2 header (destination MAC, source MAC, EtherType) learned from ARP. <code>show adjacency detail</code>.</dd>
<dt>CAM / MAC address table</dt><dd>Layer 2 switching: VLAN plus MAC to port, an exact-match lookup. <code>show mac address-table</code>.</dd>
</dl>
<p>Special adjacencies handle exceptions: <b>glean</b> (the destination is on a connected subnet but its ARP entry is missing, so the packet is punted to trigger ARP), <b>punt</b> (send to the CPU, for example traffic addressed to the device), <b>drop</b>, <b>discard</b> and <b>null</b> (routes to Null0).</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Control plane builds tables that the data plane uses">
<rect x="20" y="20" width="600" height="70" rx="10" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Control plane (CPU)</text>
<rect x="50" y="52" width="160" height="30" rx="6" fill="#e2e8f0"/><text x="130" y="72" text-anchor="middle" class="svg-ink" font-size="12">OSPF, BGP, static</text>
<rect x="240" y="52" width="100" height="30" rx="6" fill="#fde68a"/><text x="290" y="72" text-anchor="middle" class="svg-ink" font-size="12">RIB</text>
<rect x="370" y="52" width="100" height="30" rx="6" fill="#fde68a"/><text x="420" y="72" text-anchor="middle" class="svg-ink" font-size="12">ARP</text>
<rect x="20" y="130" width="600" height="70" rx="10" fill="#bae6fd"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="13">Data plane (ASIC)</text>
<rect x="160" y="162" width="130" height="30" rx="6" fill="#bbf7d0"/><text x="225" y="182" text-anchor="middle" class="svg-ink" font-size="12">FIB in TCAM</text>
<rect x="330" y="162" width="130" height="30" rx="6" fill="#bbf7d0"/><text x="395" y="182" text-anchor="middle" class="svg-ink" font-size="12">Adjacency</text>
<rect x="490" y="162" width="110" height="30" rx="6" fill="#bbf7d0"/><text x="545" y="182" text-anchor="middle" class="svg-ink" font-size="12">MAC in CAM</text>
<line x1="290" y1="82" x2="225" y2="162" stroke="#64748b" stroke-width="2"/><line x1="420" y1="82" x2="395" y2="162" stroke="#64748b" stroke-width="2"/>
<text x="330" y="118" class="svg-muted" font-size="12">CEF programs hardware</text>
</svg><p class="cap">The CPU builds the RIB and ARP; CEF turns them into the FIB and adjacency table that the hardware uses for every packet.</p></div>

<h3>CAM and TCAM: the hardware memories</h3>
<p><b>CAM (content-addressable memory)</b> is searched by content rather than by address, and answers in one lookup. It is <b>binary</b>: every bit must match exactly (0 or 1), which is perfect for the MAC address table, where a VLAN plus MAC either matches or does not.</p>
<p><b>TCAM (ternary CAM)</b> adds a third state, <b>X, "don't care"</b>. Each entry is a <b>value, mask and result (VMR)</b>. That makes it ideal for lookups that are not exact: longest-prefix match for the FIB, ACLs, QoS classification and policy-based routing. All entries are compared in parallel, so a 1,000-line ACL is checked as fast as a 10-line one. TCAM is expensive and limited; on Catalyst switches <b>SDM templates</b> decide how it is shared between routes, MAC addresses, ACLs and QoS.</p>

<div class="eg"><p><b>Worked example.</b> An ACL line <code>permit ip 10.1.10.0 0.0.0.255 any</code> becomes a TCAM entry: value 10.1.10.0, mask "compare the first 24 bits, ignore the last 8", result permit. A packet from 10.1.10.11 matches in one clock cycle. For routing, R1's FIB entries 10.1.20.0/24 and 10.1.0.0/16 are both in TCAM ordered by prefix length, so a packet to 10.1.20.12 hits the /24 first: longest match wins without scanning.</p></div>

<h3>Verification on the lab network</h3>
<pre class="out">R1# show ip cef 10.1.20.0/24
10.1.20.0/24
<span class="hl">  nexthop 10.0.1.2 GigabitEthernet0/0</span>
<span class="hl">  nexthop 10.0.2.2 GigabitEthernet0/1</span>

R1# show ip cef exact-route 172.16.0.10 10.1.20.12
<span class="hl">172.16.0.10 -&gt; 10.1.20.12 =&gt;IP adj out of GigabitEthernet0/1, addr 10.0.2.2</span>

AS1# show mac address-table vlan 10
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
<span class="hl">  10    0000.0c07.ac0a    DYNAMIC     Gi0/0</span>
  10    0050.7966.6801    DYNAMIC     Gi0/2</pre>
<p>CEF shares load <b>per destination</b> by default: a hash of source and destination address picks one of the equal-cost next hops, so one flow stays on one path and packets are not reordered. On AS1 the HSRP virtual MAC is learned on Gi0/0, the uplink towards DS1, which is exactly what an aligned design should show.</p>

<h3>When hardware falls back to software</h3>
<p>Some packets are always <b>punted</b> to the CPU: packets addressed to the device, TTL expiry, IP options, glean adjacencies, and traffic that needs features the ASIC cannot do. If TCAM runs out, new routes or ACL entries cannot be programmed in hardware and matching traffic may be software-switched or dropped, which shows up as high CPU. On Catalyst 9000 check resources with <code>show platform hardware fed switch active fwd-asic resource tcam utilization</code> and the template with <code>show sdm prefer</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> Troubleshooting with <code>show ip route</code> only, when the FIB or adjacency is what forwards. Assuming a huge ACL is free because "it is in hardware" while TCAM is nearly full. Changing an SDM template and forgetting it needs a reload.</p></div>

<div class="exam"><p><b>Exam trap.</b> The RIB is control plane; the FIB and adjacency table are data plane. CAM is binary exact match (MAC table); TCAM is ternary with don't-care bits (routes, ACLs, QoS). Fast switching is demand-driven; CEF is topology-driven. A glean adjacency means ARP is still needed.</p></div>

<div class="scn"><h4>The ACL that pushed the CPU to 99 percent</h4><p>A security team added a 3,000-line ACL to a distribution switch's user SVIs. Users complained about slow applications, and <code>show processes cpu sorted</code> showed the CPU near 99 percent, driven by packet-forwarding processes. The log reported that hardware resources for ACLs were exhausted, and the TCAM utilisation command confirmed the ACL region was full, so part of the traffic was being handled in software. The engineer summarised the ACL into 400 lines using object groups and wider masks, moved to an SDM template with more ACL space during a maintenance window, and CPU returned to normal.</p><p><b>Lesson:</b> hardware switching is only as fast as the space you leave it in TCAM.</p></div>

<div class="iv"><p class="q">"Explain the difference between the RIB and the FIB, and between CAM and TCAM."</p><p>The RIB is the routing table built by routing protocols in the control plane; CEF copies it into the FIB, resolves recursive next hops and pairs each entry with an adjacency that holds the pre-built Layer 2 rewrite from ARP, so the data plane forwards without asking the CPU. CAM is binary exact-match memory used for the MAC table; TCAM adds a don't-care bit, stores value-mask-result entries and does longest-prefix match, ACL and QoS lookups in a single parallel search. Mention punts and TCAM exhaustion for a senior-level answer.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Process switching uses the CPU per packet; fast switching caches after the first packet; CEF prebuilds tables.</li>
<li>RIB = routing table (control plane); FIB + adjacency table = CEF forwarding tables (data plane).</li>
<li>Glean, punt, drop, discard and null are special adjacencies.</li>
<li>CAM is binary exact match for MAC tables; TCAM is ternary (value, mask, result) for routes, ACLs and QoS.</li>
<li>TCAM is finite; SDM templates share it, and exhaustion pushes traffic to software.</li>
</ul></div>
`,hi:`
<p>Ek busy post office letters ko teen tarike se sort kar sakta hai. Clerk har envelope padh kar ek badi kitaab mein address dhoondh sakta hai (slow, lekin hamesha sahi). Clerk haal mein dekhe addresses ke liye sticky notes rakh sakta hai, taaki naye address ka sirf pehla letter slow ho. Ya office subah ki daak aane se pehle har possible destination ki poori sorting table print kar sakta hai, har outgoing van ke pre-printed label ke saath, aur use automatic sorting machine mein daal sakta hai. Routers aur switches bilkul inhi teen stages se guzre: <b>process switching</b>, <b>fast switching</b> aur hardware mein <b>Cisco Express Forwarding (CEF)</b>. ENCOR 1.7 aapse inhe aur inke peeche ki tables samjhane ko kehta hai.</p>

<h3>Control plane aur data plane</h3>
<p><b>Control plane</b> device ka dimaag hai: routing protocols, spanning tree, ARP, tables banana. <b>Data plane</b> uski maspeshiyan hai: har packet ko input port se output port tak jitna tez ho sake move karna. <b>Management plane</b> woh hai jisse aap device tak pahunchte ho (SSH, SNMP, NETCONF). Achha switching design data plane ko hardware mein aur control plane ko CPU par rakhta hai.</p>

<h3>Process switching se CEF tak</h3>
<table class="cmp"><tr><th>Method</th><th>Kaise kaam karta hai</th><th>Kamzori</th></tr>
<tr><td>Process switching</td><td>CPU har packet handle karta hai: routing table lookup, ARP lookup, rewrite</td><td>Slow, CPU bound</td></tr>
<tr><td>Fast switching</td><td>Destination ka pehla packet process-switch hota hai; result cache hota hai aur baad ke packets cache use karte hain ("route once, switch many")</td><td>Demand-driven: pehla packet hamesha slow; bahut flows mein cache churn</td></tr>
<tr><td><b>CEF</b></td><td>Tables pehle se routing table aur ARP se bante hain, kisi packet ke aane se pehle</td><td>Tables memory lete hain; hardware tables ka size limited</td></tr>
</table>
<p>CEF <b>topology-driven</b> hai: jab bhi routing table ya ARP badalta hai, CEF turant apni tables update karta hai, isliye first-packet penalty nahi hoti. Saare modern Cisco platforms par yahi default hai.</p>

<h3>Chaar tables</h3>
<dl class="terms">
<dt>RIB (routing information base)</dt><dd>Control plane dwara connected, static aur dynamic routes se bani routing table. <code>show ip route</code>.</dd>
<dt>FIB (forwarding information base)</dt><dd>RIB ki CEF copy, lookup ke liye optimised, recursive next hops pehle se directly connected next hop tak resolved. <code>show ip cef</code>.</dd>
<dt>Adjacency table</dt><dd>Har directly connected next hop ke liye pre-built Layer 2 header (destination MAC, source MAC, EtherType), ARP se seekha hua. <code>show adjacency detail</code>.</dd>
<dt>CAM / MAC address table</dt><dd>Layer 2 switching: VLAN plus MAC se port, exact-match lookup. <code>show mac address-table</code>.</dd>
</dl>
<p>Special adjacencies exceptions handle karti hain: <b>glean</b> (destination connected subnet par hai lekin uski ARP entry nahi hai, isliye ARP trigger karne ke liye packet punt hota hai), <b>punt</b> (CPU ko bhejo, jaise device ko address kiya traffic), <b>drop</b>, <b>discard</b> aur <b>null</b> (Null0 wale routes).</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Control plane tables banata hai jo data plane use karta hai">
<rect x="20" y="20" width="600" height="70" rx="10" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Control plane (CPU)</text>
<rect x="50" y="52" width="160" height="30" rx="6" fill="#e2e8f0"/><text x="130" y="72" text-anchor="middle" class="svg-ink" font-size="12">OSPF, BGP, static</text>
<rect x="240" y="52" width="100" height="30" rx="6" fill="#fde68a"/><text x="290" y="72" text-anchor="middle" class="svg-ink" font-size="12">RIB</text>
<rect x="370" y="52" width="100" height="30" rx="6" fill="#fde68a"/><text x="420" y="72" text-anchor="middle" class="svg-ink" font-size="12">ARP</text>
<rect x="20" y="130" width="600" height="70" rx="10" fill="#bae6fd"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="13">Data plane (ASIC)</text>
<rect x="160" y="162" width="130" height="30" rx="6" fill="#bbf7d0"/><text x="225" y="182" text-anchor="middle" class="svg-ink" font-size="12">TCAM mein FIB</text>
<rect x="330" y="162" width="130" height="30" rx="6" fill="#bbf7d0"/><text x="395" y="182" text-anchor="middle" class="svg-ink" font-size="12">Adjacency</text>
<rect x="490" y="162" width="110" height="30" rx="6" fill="#bbf7d0"/><text x="545" y="182" text-anchor="middle" class="svg-ink" font-size="12">CAM mein MAC</text>
<line x1="290" y1="82" x2="225" y2="162" stroke="#64748b" stroke-width="2"/><line x1="420" y1="82" x2="395" y2="162" stroke="#64748b" stroke-width="2"/>
<text x="330" y="118" class="svg-muted" font-size="12">CEF hardware program karta hai</text>
</svg><p class="cap">CPU RIB aur ARP banata hai; CEF unhe FIB aur adjacency table mein badalta hai jo hardware har packet ke liye use karta hai.</p></div>

<h3>CAM aur TCAM: hardware memories</h3>
<p><b>CAM (content-addressable memory)</b> address ki jagah content se search hoti hai, aur ek lookup mein jawab deti hai. Yeh <b>binary</b> hai: har bit exactly match hona chahiye (0 ya 1), jo MAC address table ke liye perfect hai, jahan VLAN plus MAC ya to match karta hai ya nahi.</p>
<p><b>TCAM (ternary CAM)</b> teesra state jodta hai, <b>X, "don't care"</b>. Har entry ek <b>value, mask aur result (VMR)</b> hai. Isse yeh un lookups ke liye ideal hai jo exact nahi hote: FIB ke liye longest-prefix match, ACLs, QoS classification aur policy-based routing. Saari entries parallel mein compare hoti hain, isliye 1,000-line ACL utni hi tezi se check hoti hai jitni 10-line. TCAM mehenga aur limited hai; Catalyst switches par <b>SDM templates</b> decide karte hain ki use routes, MAC addresses, ACLs aur QoS mein kaise baanta jaaye.</p>

<div class="eg"><p><b>Worked example.</b> ACL line <code>permit ip 10.1.10.0 0.0.0.255 any</code> ek TCAM entry banti hai: value 10.1.10.0, mask "pehle 24 bits compare karo, aakhri 8 ignore karo", result permit. 10.1.10.11 se aaya packet ek clock cycle mein match hota hai. Routing ke liye R1 ki FIB entries 10.1.20.0/24 aur 10.1.0.0/16 dono TCAM mein prefix length ke order mein hain, isliye 10.1.20.12 wala packet pehle /24 ko hit karta hai: bina scan kiye longest match jeet jaata hai.</p></div>

<h3>Lab network par verification</h3>
<pre class="out">R1# show ip cef 10.1.20.0/24
10.1.20.0/24
<span class="hl">  nexthop 10.0.1.2 GigabitEthernet0/0</span>
<span class="hl">  nexthop 10.0.2.2 GigabitEthernet0/1</span>

R1# show ip cef exact-route 172.16.0.10 10.1.20.12
<span class="hl">172.16.0.10 -&gt; 10.1.20.12 =&gt;IP adj out of GigabitEthernet0/1, addr 10.0.2.2</span>

AS1# show mac address-table vlan 10
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
<span class="hl">  10    0000.0c07.ac0a    DYNAMIC     Gi0/0</span>
  10    0050.7966.6801    DYNAMIC     Gi0/2</pre>
<p>CEF default mein <b>per destination</b> load share karta hai: source aur destination address ka hash equal-cost next hops mein se ek chunta hai, isliye ek flow ek path par rehta hai aur packets reorder nahi hote. AS1 par HSRP virtual MAC Gi0/0 par seekha gaya hai, DS1 ki taraf wala uplink, jo bilkul wahi hai jo aligned design mein dikhna chahiye.</p>

<h3>Jab hardware software par gir jaata hai</h3>
<p>Kuch packets hamesha CPU ko <b>punt</b> hote hain: device ko address kiye packets, TTL expiry, IP options, glean adjacencies, aur woh traffic jise aise features chahiye jo ASIC nahi kar sakta. Agar TCAM khatam ho jaaye, to naye routes ya ACL entries hardware mein program nahi ho sakti aur matching traffic software-switch ya drop ho sakta hai, jo high CPU ke roop mein dikhta hai. Catalyst 9000 par <code>show platform hardware fed switch active fwd-asic resource tcam utilization</code> se resources aur <code>show sdm prefer</code> se template check karo.</p>

<div class="warn"><p><b>Common galtiyan.</b> Sirf <code>show ip route</code> se troubleshoot karna, jabki forward FIB ya adjacency karti hai. Maan lena ki badi ACL free hai kyunki "woh hardware mein hai" jabki TCAM lagbhag full hai. SDM template badalna aur bhool jaana ki use reload chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> RIB control plane hai; FIB aur adjacency table data plane hain. CAM binary exact match hai (MAC table); TCAM don't-care bits ke saath ternary hai (routes, ACLs, QoS). Fast switching demand-driven hai; CEF topology-driven. Glean adjacency ka matlab ARP abhi chahiye.</p></div>

<div class="scn"><h4>Woh ACL jisne CPU 99 percent par pahuncha diya</h4><p>Security team ne distribution switch ke user SVIs par 3,000-line ACL lagayi. Users ne slow applications ki shikayat ki, aur <code>show processes cpu sorted</code> ne CPU ko 99 percent ke paas dikhaya, packet-forwarding processes ki wajah se. Log ne report kiya ki ACLs ke hardware resources khatam ho gaye the, aur TCAM utilisation command ne confirm kiya ki ACL region full tha, isliye traffic ka hissa software mein handle ho raha tha. Engineer ne object groups aur wider masks use karke ACL ko 400 lines mein summarise kiya, maintenance window mein zyada ACL space wale SDM template par shift kiya, aur CPU normal ho gaya.</p><p><b>Seekh:</b> hardware switching utni hi tez hai jitni jagah aap use TCAM mein chhodte ho.</p></div>

<div class="iv"><p class="q">"RIB aur FIB mein, aur CAM aur TCAM mein fark samjhao."</p><p>RIB control plane mein routing protocols dwara bani routing table hai; CEF use FIB mein copy karta hai, recursive next hops resolve karta hai aur har entry ko ek adjacency se jodta hai jismein ARP se bana pre-built Layer 2 rewrite hota hai, taaki data plane CPU se poochhe bina forward kare. CAM MAC table ke liye binary exact-match memory hai; TCAM don't-care bit jodta hai, value-mask-result entries store karta hai aur longest-prefix match, ACL aur QoS lookups ek parallel search mein karta hai. Senior-level answer ke liye punts aur TCAM exhaustion ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Process switching har packet par CPU use karta hai; fast switching pehle packet ke baad cache karta hai; CEF tables pehle se banata hai.</li>
<li>RIB = routing table (control plane); FIB + adjacency table = CEF forwarding tables (data plane).</li>
<li>Glean, punt, drop, discard aur null special adjacencies hain.</li>
<li>CAM MAC tables ke liye binary exact match hai; TCAM routes, ACLs aur QoS ke liye ternary (value, mask, result) hai.</li>
<li>TCAM limited hai; SDM templates use baantte hain, aur exhaustion traffic ko software mein dhakelta hai.</li>
</ul></div>
`}};export{e as default};