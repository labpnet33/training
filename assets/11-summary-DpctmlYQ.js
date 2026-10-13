var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with a routed fabric where VLAN 10 was trapped inside each leaf. You finish it able to stretch that VLAN across the fabric as VNI 10010, explain every byte of the packet, choose a BUM method, verify the result like an operator and fix the five classic faults. This last chapter packs it all into a checklist, a glossary and the facts most often tested, so you can revise in fifteen minutes before an exam or an interview.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="VXLAN in one picture">
<rect x="20" y="70" width="130" height="50" rx="8" fill="#fed7aa"/><text x="85" y="92" text-anchor="middle" class="svg-ink" font-size="12">SRV1</text><text x="85" y="109" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10</text>
<rect x="170" y="70" width="130" height="50" rx="8" fill="#bae6fd"/><text x="235" y="92" text-anchor="middle" class="svg-ink" font-size="12">LEAF1 nve1</text><text x="235" y="109" text-anchor="middle" class="svg-muted" font-size="12">10.254.0.1</text>
<rect x="340" y="70" width="130" height="50" rx="8" fill="#bae6fd"/><text x="405" y="92" text-anchor="middle" class="svg-ink" font-size="12">LEAF2 nve1</text><text x="405" y="109" text-anchor="middle" class="svg-muted" font-size="12">10.254.0.2</text>
<rect x="490" y="70" width="130" height="50" rx="8" fill="#fed7aa"/><text x="555" y="92" text-anchor="middle" class="svg-ink" font-size="12">SRV2</text><text x="555" y="109" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10</text>
<line x1="150" y1="95" x2="170" y2="95" stroke="#64748b" stroke-width="2"/><line x1="300" y1="95" x2="340" y2="95" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/><line x1="470" y1="95" x2="490" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="13">VNI 10010 · UDP 4789 · +50 bytes · ingress replication</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Underlay: OSPF, ECMP, loopbacks, MTU 9216</text>
</svg><p class="cap">The whole module in one line: VLAN → VNI → VTEP → routed underlay → VTEP → VNI → VLAN.</p></div>

<h3>Checklist: you should be able to…</h3>
<ul>
<li>Explain the underlay/overlay split and why the uplinks stay routed.</li>
<li>List the problems overlays solve: 4094 VLAN limit, Layer 2 over Layer 3, VM mobility, STP containment, multitenancy.</li>
<li>Draw the VXLAN packet and add up 14 + 20 + 8 + 8 = 50 bytes; compute the 1550 minimum underlay IP MTU.</li>
<li>Explain why the UDP source port is a hash (ECMP entropy) and the destination is 4789.</li>
<li>Configure <code>feature nv overlay</code>, <code>feature vn-segment-vlan-based</code>, <code>vlan 10</code> / <code>vn-segment 10010</code>, and nve1 with <code>source-interface loopback1</code>, <code>member vni 10010</code>, <code>ingress-replication protocol static</code>, <code>peer-ip</code>.</li>
<li>Describe the multicast alternative with <code>mcast-group</code> and the PIM requirement.</li>
<li>Walk an ARP between two racks and say where each MAC is learned.</li>
<li>Read <code>show nve peers</code>, <code>show nve vni</code>, <code>show nve vni ingress-replication</code>, <code>show nve interface nve1 detail</code> and <code>show mac address-table</code>.</li>
<li>Diagnose unreachable loopback, VNI mismatch, MTU, wrong source-interface and missing peer from their signatures.</li>
<li>Explain the limits of flood-and-learn and what BGP EVPN adds.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>VXLAN</dt><dd>Virtual eXtensible LAN: MAC-in-UDP encapsulation (RFC 7348) that carries Layer 2 frames over a routed IP network.</dd>
<dt>VNI</dt><dd>VXLAN Network Identifier: 24-bit segment ID, about 16 million values; global across the fabric.</dd>
<dt>VTEP</dt><dd>VXLAN Tunnel End Point: encapsulates and decapsulates; the leaf switch in spine-leaf.</dd>
<dt>NVE</dt><dd>Network Virtualization Edge: the NX-OS logical VTEP interface, <code>interface nve1</code>.</dd>
<dt>vn-segment</dt><dd>VLAN sub-command that maps a local VLAN to a VNI.</dd>
<dt>BUM</dt><dd>Broadcast, unknown unicast and multicast traffic that must reach every VTEP in the VNI.</dd>
<dt>Ingress replication</dt><dd>Head-end replication: the source VTEP sends a unicast copy to each peer (static list or EVPN).</dd>
<dt>Multicast underlay</dt><dd>Each VNI mapped to a group (<code>mcast-group</code>); PIM replicates in the network.</dd>
<dt>Flood and learn</dt><dd>Data-plane learning: remote MACs learned from decapsulated traffic, inner source MAC → outer source IP.</dd>
<dt>Underlay / overlay</dt><dd>The routed physical fabric / the virtual networks carried on top of it.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>VXLAN UDP destination port</td><td>4789 (IANA); Linux legacy default 8472</td></tr>
<tr><td>VNI size / number of segments</td><td>24 bits / about 16 million</td></tr>
<tr><td>VLAN ID size / usable VLANs</td><td>12 bits / 4094</td></tr>
<tr><td>Encapsulation overhead (IPv4)</td><td>50 bytes (54 with outer 802.1Q)</td></tr>
<tr><td>Minimum underlay IP MTU for 1500-byte hosts</td><td>1550; use 9216</td></tr>
<tr><td>VLAN-to-VNI command</td><td><code>vn-segment</code> under <code>vlan</code></td></tr>
<tr><td>VNI on the VTEP</td><td><code>member vni</code> under <code>interface nve1</code></td></tr>
<tr><td>Why a loopback source</td><td>Always up; reachable over every uplink via ECMP</td></tr>
<tr><td>BUM with no underlay multicast</td><td>Ingress (head-end) replication</td></tr>
<tr><td>LearnType in flood-and-learn / EVPN</td><td>DP / CP</td></tr>
<tr><td>Remote MAC in the MAC table</td><td>Port shows <code>nve1(peer VTEP IP)</code></td></tr>
</table>

<div class="warn"><p><b>Last-minute traps.</b> The VNI must match across leaves; the VLAN need not. Spines are not VTEPs. EVPN is a control plane, not a new encapsulation. Small pings passing does not prove MTU. Static peer lists must be symmetric.</p></div>

<div class="exam"><p><b>Exam strategy.</b> When a question shows output, find the column that matters first: VNI and Multicast-group in <code>show nve vni</code>, Peer-IP and LearnType in <code>show nve peers</code>, the Ports column in the MAC table. Most VXLAN output questions are answered by one highlighted value.</p></div>

<div class="scn"><h4>The interview that turned into a whiteboard lab</h4><p>A candidate for a data center role was asked to "stretch VLAN 20 between two racks without trunking over the spines". She drew the underlay first (OSPF, loopback1 on each leaf, MTU 9216), then the VXLAN packet with its 50 bytes, then the exact NX-OS config on both leaves with static ingress replication, and finished with the five show commands in order. When the interviewer asked "what breaks at 40 leaves?", she answered with the N×(N−1) peer-list math and ARP flooding, and proposed BGP EVPN. She got the offer; the feedback said she "explained the data plane before the control plane, which most candidates skip".</p><p><b>Lesson:</b> the structure of this module (underlay, packet, config, verify, limits) is also the structure of a great interview answer.</p></div>

<div class="iv"><p class="q">"Summarise VXLAN in two minutes."</p><p>Strong answer: VXLAN is MAC-in-UDP encapsulation that carries Layer 2 segments over a routed IP underlay. Each segment is a 24-bit VNI (about 16 million) instead of a 12-bit VLAN. Leaves act as VTEPs (nve1 on a loopback), adding 50 bytes: outer Ethernet, outer IP between VTEP loopbacks, UDP with destination 4789 and a hashed source port for ECMP, and the VXLAN header. BUM traffic uses multicast groups or ingress replication. Without a control plane MACs are learned from the data plane; BGP EVPN adds a control plane, ARP suppression and distributed gateways.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VXLAN = Layer 2 over routed IP, with a 24-bit VNI and 50 bytes of overhead.</li>
<li>Configuration: features, vn-segment, nve1 on loopback1, member vni, replication method.</li>
<li>Verification ladder: underlay, nve interface, nve vni, nve peers, MAC table.</li>
<li>Classic faults: loopback, VNI mismatch, MTU, source-interface, peer list.</li>
<li>Next module: BGP EVPN adds the control plane on the same data plane.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module ek routed fabric ke saath shuru kiya tha jahan VLAN 10 har leaf ke andar band tha. Ab aap use VNI 10010 ban kar fabric ke paar stretch kar sakte ho, packet ka har byte samjha sakte ho, BUM method choose kar sakte ho, result ko operator ki tarah verify kar sakte ho aur paanch classic faults theek kar sakte ho. Yeh aakhri chapter sab kuch ek checklist, ek glossary aur sabse zyada test hone wale facts mein pack karta hai, taaki exam ya interview se pehle pandrah minute mein revise kar sako.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Ek picture mein VXLAN">
<rect x="20" y="70" width="130" height="50" rx="8" fill="#fed7aa"/><text x="85" y="92" text-anchor="middle" class="svg-ink" font-size="12">SRV1</text><text x="85" y="109" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10</text>
<rect x="170" y="70" width="130" height="50" rx="8" fill="#bae6fd"/><text x="235" y="92" text-anchor="middle" class="svg-ink" font-size="12">LEAF1 nve1</text><text x="235" y="109" text-anchor="middle" class="svg-muted" font-size="12">10.254.0.1</text>
<rect x="340" y="70" width="130" height="50" rx="8" fill="#bae6fd"/><text x="405" y="92" text-anchor="middle" class="svg-ink" font-size="12">LEAF2 nve1</text><text x="405" y="109" text-anchor="middle" class="svg-muted" font-size="12">10.254.0.2</text>
<rect x="490" y="70" width="130" height="50" rx="8" fill="#fed7aa"/><text x="555" y="92" text-anchor="middle" class="svg-ink" font-size="12">SRV2</text><text x="555" y="109" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10</text>
<line x1="150" y1="95" x2="170" y2="95" stroke="#64748b" stroke-width="2"/><line x1="300" y1="95" x2="340" y2="95" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/><line x1="470" y1="95" x2="490" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="13">VNI 10010 · UDP 4789 · +50 bytes · ingress replication</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Underlay: OSPF, ECMP, loopbacks, MTU 9216</text>
</svg><p class="cap">Poora module ek line mein: VLAN → VNI → VTEP → routed underlay → VTEP → VNI → VLAN.</p></div>

<h3>Checklist: aapko yeh aana chahiye…</h3>
<ul>
<li>Underlay/overlay split aur uplinks routed kyun rehte hain, samjhana.</li>
<li>Overlays kaunsi problems solve karte hain list karna: 4094 VLAN limit, Layer 3 par Layer 2, VM mobility, STP containment, multitenancy.</li>
<li>VXLAN packet draw karna aur 14 + 20 + 8 + 8 = 50 bytes jodna; 1550 minimum underlay IP MTU calculate karna.</li>
<li>Samjhana ki UDP source port hash kyun hai (ECMP entropy) aur destination 4789.</li>
<li><code>feature nv overlay</code>, <code>feature vn-segment-vlan-based</code>, <code>vlan 10</code> / <code>vn-segment 10010</code>, aur <code>source-interface loopback1</code>, <code>member vni 10010</code>, <code>ingress-replication protocol static</code>, <code>peer-ip</code> ke saath nve1 configure karna.</li>
<li><code>mcast-group</code> wala multicast alternative aur PIM requirement describe karna.</li>
<li>Do racks ke beech ARP walk karna aur batana ki har MAC kahan learn hota hai.</li>
<li><code>show nve peers</code>, <code>show nve vni</code>, <code>show nve vni ingress-replication</code>, <code>show nve interface nve1 detail</code> aur <code>show mac address-table</code> padhna.</li>
<li>Unreachable loopback, VNI mismatch, MTU, galat source-interface aur missing peer ko unke signatures se diagnose karna.</li>
<li>Flood-and-learn ki limits aur BGP EVPN kya jodta hai, samjhana.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>VXLAN</dt><dd>Virtual eXtensible LAN: MAC-in-UDP encapsulation (RFC 7348) jo Layer 2 frames ko routed IP network par carry karta hai.</dd>
<dt>VNI</dt><dd>VXLAN Network Identifier: 24-bit segment ID, lagbhag 16 million values; poore fabric mein global.</dd>
<dt>VTEP</dt><dd>VXLAN Tunnel End Point: encapsulate aur decapsulate karta hai; spine-leaf mein leaf switch.</dd>
<dt>NVE</dt><dd>Network Virtualization Edge: NX-OS ka logical VTEP interface, <code>interface nve1</code>.</dd>
<dt>vn-segment</dt><dd>VLAN sub-command jo local VLAN ko VNI se map karta hai.</dd>
<dt>BUM</dt><dd>Broadcast, unknown unicast aur multicast traffic jo VNI ke har VTEP tak pahunchna chahiye.</dd>
<dt>Ingress replication</dt><dd>Head-end replication: source VTEP har peer ko ek unicast copy bhejta hai (static list ya EVPN).</dd>
<dt>Multicast underlay</dt><dd>Har VNI ek group par map (<code>mcast-group</code>); PIM network mein replicate karta hai.</dd>
<dt>Flood and learn</dt><dd>Data-plane learning: remote MACs decapsulated traffic se seekhe jaate hain, inner source MAC → outer source IP.</dd>
<dt>Underlay / overlay</dt><dd>Routed physical fabric / uske upar carry hone wale virtual networks.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>VXLAN UDP destination port</td><td>4789 (IANA); Linux legacy default 8472</td></tr>
<tr><td>VNI size / segments ki sankhya</td><td>24 bits / lagbhag 16 million</td></tr>
<tr><td>VLAN ID size / usable VLANs</td><td>12 bits / 4094</td></tr>
<tr><td>Encapsulation overhead (IPv4)</td><td>50 bytes (outer 802.1Q ke saath 54)</td></tr>
<tr><td>1500-byte hosts ke liye minimum underlay IP MTU</td><td>1550; 9216 use karo</td></tr>
<tr><td>VLAN-to-VNI command</td><td><code>vlan</code> ke neeche <code>vn-segment</code></td></tr>
<tr><td>VTEP par VNI</td><td><code>interface nve1</code> ke neeche <code>member vni</code></td></tr>
<tr><td>Loopback source kyun</td><td>Hamesha up; ECMP se har uplink par reachable</td></tr>
<tr><td>Underlay multicast ke bina BUM</td><td>Ingress (head-end) replication</td></tr>
<tr><td>Flood-and-learn / EVPN mein LearnType</td><td>DP / CP</td></tr>
<tr><td>MAC table mein remote MAC</td><td>Port <code>nve1(peer VTEP IP)</code> dikhata hai</td></tr>
</table>

<div class="warn"><p><b>Aakhri minute ke traps.</b> VNI leaves ke beech match hona chahiye; VLAN ka zaroori nahi. Spines VTEPs nahi hain. EVPN control plane hai, nayi encapsulation nahi. Chhote pings pass hona MTU prove nahi karta. Static peer lists symmetric honi chahiye.</p></div>

<div class="exam"><p><b>Exam strategy.</b> Jab question output dikhaye, pehle woh column dhoondho jo matter karta hai: <code>show nve vni</code> mein VNI aur Multicast-group, <code>show nve peers</code> mein Peer-IP aur LearnType, MAC table mein Ports column. Zyada tar VXLAN output questions ek highlighted value se answer ho jaate hain.</p></div>

<div class="scn"><h4>Woh interview jo whiteboard lab ban gaya</h4><p>Data center role ki ek candidate se kaha gaya "spines par trunk kiye bina VLAN 20 ko do racks ke beech stretch karo". Usne pehle underlay draw kiya (OSPF, har leaf par loopback1, MTU 9216), phir 50 bytes ke saath VXLAN packet, phir static ingress replication ke saath dono leaves ka exact NX-OS config, aur aakhir mein order mein paanch show commands. Jab interviewer ne poocha "40 leaves par kya tootega?", usne N×(N−1) peer-list math aur ARP flooding se jawab diya, aur BGP EVPN propose kiya. Use offer mila; feedback mein likha tha ki usne "control plane se pehle data plane samjhaya, jo zyada tar candidates skip kar dete hain".</p><p><b>Seekh:</b> is module ka structure (underlay, packet, config, verify, limits) ek shaandaar interview answer ka structure bhi hai.</p></div>

<div class="iv"><p class="q">"VXLAN ko do minute mein summarise karo."</p><p>Strong answer: VXLAN MAC-in-UDP encapsulation hai jo Layer 2 segments ko routed IP underlay par carry karta hai. Har segment 12-bit VLAN ki jagah 24-bit VNI hai (lagbhag 16 million). Leaves VTEPs ka kaam karte hain (loopback par nve1), aur 50 bytes jodte hain: outer Ethernet, VTEP loopbacks ke beech outer IP, destination 4789 aur ECMP ke liye hashed source port wala UDP, aur VXLAN header. BUM traffic multicast groups ya ingress replication use karta hai. Control plane ke bina MACs data plane se seekhe jaate hain; BGP EVPN control plane, ARP suppression aur distributed gateways jodta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VXLAN = routed IP par Layer 2, 24-bit VNI aur 50 bytes overhead ke saath.</li>
<li>Configuration: features, vn-segment, loopback1 par nve1, member vni, replication method.</li>
<li>Verification ladder: underlay, nve interface, nve vni, nve peers, MAC table.</li>
<li>Classic faults: loopback, VNI mismatch, MTU, source-interface, peer list.</li>
<li>Agla module: BGP EVPN same data plane par control plane jodta hai.</li>
</ul></div>
`}};export{e as default};