var e={id:`troubleshooting`,h:{en:`The EVPN troubleshooting playbook`,hi:`EVPN troubleshooting playbook`},body:{en:`
<p>A pilot does not improvise when a warning light turns on; she opens a checklist and follows it top to bottom. An EVPN fabric deserves the same: a fixed sequence that answers "where does the information stop?". The information travels a chain: <b>host to local leaf, to BGP, through the spines, into the remote leaf, into the remote forwarding table</b>. Find the first link that is broken and you have found the fault.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Information chain">
<g font-size="12" class="svg-ink">
<rect x="10" y="40" width="90" height="46" rx="6" fill="#fed7aa"/><text x="55" y="68" text-anchor="middle">1 Local MAC</text>
<rect x="115" y="40" width="100" height="46" rx="6" fill="#bae6fd"/><text x="165" y="60" text-anchor="middle">2 Local</text><text x="165" y="76" text-anchor="middle">EVPN route</text>
<rect x="230" y="40" width="100" height="46" rx="6" fill="#ddd6fe"/><text x="280" y="60" text-anchor="middle">3 Spines</text><text x="280" y="76" text-anchor="middle">reflect</text>
<rect x="345" y="40" width="100" height="46" rx="6" fill="#bae6fd"/><text x="395" y="60" text-anchor="middle">4 Remote BGP</text><text x="395" y="76" text-anchor="middle">table</text>
<rect x="460" y="40" width="80" height="46" rx="6" fill="#fde68a"/><text x="500" y="60" text-anchor="middle">5 RT</text><text x="500" y="76" text-anchor="middle">import</text>
<rect x="555" y="40" width="75" height="46" rx="6" fill="#bbf7d0"/><text x="592" y="60" text-anchor="middle">6 MAC /</text><text x="592" y="76" text-anchor="middle">route</text>
</g><g stroke="#64748b" stroke-width="2"><line x1="100" y1="63" x2="115" y2="63"/><line x1="215" y1="63" x2="230" y2="63"/><line x1="330" y1="63" x2="345" y2="63"/><line x1="445" y1="63" x2="460" y2="63"/><line x1="540" y1="63" x2="555" y2="63"/></g>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">Walk left to right. The first missing link is the fault.</text>
</svg><p class="cap">Six links, six show commands.</p></div>

<h3>The six checks and what each one proves</h3>
<table class="cmp"><tr><th>Link</th><th>Command</th><th>If it fails</th></tr>
<tr><td>0 Underlay</td><td><code>show ip route</code> remote Lo1, big ping</td><td>No tunnel and no BGP</td></tr>
<tr><td>1 Local MAC</td><td><code>show mac address-table</code></td><td>Host silent, wrong VLAN, port down</td></tr>
<tr><td>2 Local EVPN route</td><td><code>show l2vpn evpn mac</code></td><td>VLAN/EVI/VNI binding missing, VNI typo</td></tr>
<tr><td>3 Session</td><td><code>show bgp l2vpn evpn summary</code></td><td>Neighbor not activated, not RR client</td></tr>
<tr><td>4 Received route</td><td><code>show bgp l2vpn evpn route-type 2</code></td><td>send-community, spine problem</td></tr>
<tr><td>5 Import</td><td><code>show l2vpn evpn evi detail</code></td><td>RT mismatch</td></tr>
<tr><td>6 Forwarding</td><td><code>show nve peers</code>, <code>show nve vni</code></td><td>host-reachability, source-interface, L3VNI</td></tr>
</table>

<h3>The six classic faults and their signatures</h3>
<ol>
<li><b>Missing send-community both.</b> The route reaches the spine, but the Extended Community line is missing. No leaf imports it. Fix: add <code>send-community both</code> under the l2vpn evpn neighbor (also on the spine side if it is the culprit).</li>
<li><b>RT import mismatch.</b> The route is in <code>show bgp l2vpn evpn</code> but not in the MAC table or VRF. Compare export RT on the sender with import RT of the receiver.</li>
<li><b>VNI/VLAN mismatch.</b> The EVI shows the wrong VNI, or the route has an unexpected L2VNI. Check <code>vlan configuration</code> / <code>member evpn-instance ... vni</code> on both leaves.</li>
<li><b>Source-interface down or outside the underlay.</b> nve1 Oper Down or no VTEP peers although BGP is fine. Check <code>show nve interface nve1</code> and that Lo1 is in OSPF.</li>
<li><b>Missing advertise l2vpn evpn.</b> Hosts work inside the fabric (type 2) but no type-5 prefixes appear. Add <code>advertise l2vpn evpn</code> under <code>address-family ipv4 vrf TENANT-A</code>.</li>
<li><b>Missing member vni N vrf, or L3VNI mismatch.</b> Intra-VLAN works; inter-subnet routing fails. <code>show nve vni</code> lacks the L3CP row or shows a different VNI than the other leaf.</li>
</ol>
<p>Two other classics: <b>no host-reachability protocol bgp</b> (nve1 stays data-plane, BGP routes have no effect) and <b>missing route-reflector-client</b> (spines keep routes but never pass them on).</p>

<pre class="out">SPINE1# show bgp l2vpn evpn route-type 2
 *>i [2][65001:10][0][48][0050.56aa.0002][32][10.10.10.12]/24
                    10.255.1.12              0    100      0 i
      <span class="hl">(no Extended Community line)</span>

LEAF1# show bgp l2vpn evpn summary | include 10.255.0.101
10.255.0.101    4 65001     330     301       17    0    0 00:55:10        4
LEAF1# show l2vpn evpn mac
<span class="hl">(no remote MAC entries)</span></pre>

<div class="eg"><p><b>Worked example: ticket "H2 not reachable from H1".</b> Underlay fine. LEAF2 has H2's MAC in <code>show l2vpn evpn mac</code> (links 1-2 ok). SPINE1 shows the type-2 route but without an Extended Community line (link 4). The leaf's neighbor line says only <code>send-community</code>. Add <code>send-community both</code> on LEAF2 for both spines. LEAF1 now installs the MAC, link 6 satisfied. Total time: three commands.</p></div>

<div class="warn"><p><b>Common mistake.</b> Troubleshooting from the host side only. Ping tests tell you a symptom; the six links tell you the cause. Also, do not clear BGP sessions as a first reaction. A clear hides the evidence and does not fix a configuration error.</p></div>

<div class="exam"><p><b>Exam trap.</b> "BGP neighbor is Established" says nothing about EVPN. The relevant summary is <code>show bgp l2vpn evpn summary</code>, and the relevant counter is State/PfxRcd with a number, per neighbor.</p></div>

<div class="scn"><h4>Three tickets, one afternoon</h4><p>The NOC received: "VLAN 20 hosts cannot talk across leaves", "TENANT-A cannot reach the data centre firewall prefix" and "LEAF3 hosts cannot be routed to". The playbook took the three tickets in ten minutes: the first was an RT mismatch (import 65001:20 versus export 65001:21), the second a missing <code>advertise l2vpn evpn</code> on the border leaf (no type 5), and the third a missing <code>member vni 50901 vrf TENANT-A</code> on LEAF3 (no L3CP row). Each was one line of configuration.</p><p><b>Lesson:</b> three different symptoms can have three simple, distinct causes; the playbook separates them quickly.</p></div>

<div class="iv"><p class="q">"Walk me through troubleshooting a remote MAC that is not learned in EVPN."</p><p>Strong answer: confirm underlay and BGP session with l2vpn evpn activated; confirm the MAC is learned locally on the originating leaf and appears as an EVPN route; check the spine received it with extended communities; check the receiver's BGP table for the route and its RT against the EVI import; and finally verify nve peers and VNI state. Name the likely faults: send-community, RT, VNI mismatch, host-reachability.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Follow the chain: local MAC, local route, spine, remote BGP, RT import, forwarding.</li>
<li>Established is not enough; check the l2vpn evpn summary and per-neighbor prefixes.</li>
<li>A route in BGP but not installed points to RT.</li>
<li>Do not clear sessions before collecting evidence.</li>
</ul></div>
`,hi:`
<p>Pilot warning light jalne par improvise nahi karta; woh checklist kholti hai aur upar se neeche follow karti hai. EVPN fabric ko bhi yahi chahiye: ek fixed sequence jo jawab de "information kahan ruk rahi hai?". Information ek chain mein chalti hai: <b>host se local leaf, BGP, spines ke through, remote leaf mein, remote forwarding table mein</b>. Pehla toota hua link dhoondho aur fault mil gaya.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Information chain">
<g font-size="12" class="svg-ink">
<rect x="10" y="40" width="90" height="46" rx="6" fill="#fed7aa"/><text x="55" y="68" text-anchor="middle">1 Local MAC</text>
<rect x="115" y="40" width="100" height="46" rx="6" fill="#bae6fd"/><text x="165" y="60" text-anchor="middle">2 Local</text><text x="165" y="76" text-anchor="middle">EVPN route</text>
<rect x="230" y="40" width="100" height="46" rx="6" fill="#ddd6fe"/><text x="280" y="60" text-anchor="middle">3 Spines</text><text x="280" y="76" text-anchor="middle">reflect</text>
<rect x="345" y="40" width="100" height="46" rx="6" fill="#bae6fd"/><text x="395" y="60" text-anchor="middle">4 Remote BGP</text><text x="395" y="76" text-anchor="middle">table</text>
<rect x="460" y="40" width="80" height="46" rx="6" fill="#fde68a"/><text x="500" y="60" text-anchor="middle">5 RT</text><text x="500" y="76" text-anchor="middle">import</text>
<rect x="555" y="40" width="75" height="46" rx="6" fill="#bbf7d0"/><text x="592" y="60" text-anchor="middle">6 MAC /</text><text x="592" y="76" text-anchor="middle">route</text>
</g><g stroke="#64748b" stroke-width="2"><line x1="100" y1="63" x2="115" y2="63"/><line x1="215" y1="63" x2="230" y2="63"/><line x1="330" y1="63" x2="345" y2="63"/><line x1="445" y1="63" x2="460" y2="63"/><line x1="540" y1="63" x2="555" y2="63"/></g>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">Left se right chalo. Pehla missing link hi fault hai.</text>
</svg><p class="cap">Chhe links, chhe show commands.</p></div>

<h3>Chhe checks aur har ek kya prove karta hai</h3>
<table class="cmp"><tr><th>Link</th><th>Command</th><th>Fail ho to</th></tr>
<tr><td>0 Underlay</td><td>remote Lo1 ke liye <code>show ip route</code>, bada ping</td><td>Tunnel aur BGP dono nahi</td></tr>
<tr><td>1 Local MAC</td><td><code>show mac address-table</code></td><td>Host silent, galat VLAN, port down</td></tr>
<tr><td>2 Local EVPN route</td><td><code>show l2vpn evpn mac</code></td><td>VLAN/EVI/VNI binding missing, VNI typo</td></tr>
<tr><td>3 Session</td><td><code>show bgp l2vpn evpn summary</code></td><td>Neighbor activate nahi, RR client nahi</td></tr>
<tr><td>4 Received route</td><td><code>show bgp l2vpn evpn route-type 2</code></td><td>send-community, spine problem</td></tr>
<tr><td>5 Import</td><td><code>show l2vpn evpn evi detail</code></td><td>RT mismatch</td></tr>
<tr><td>6 Forwarding</td><td><code>show nve peers</code>, <code>show nve vni</code></td><td>host-reachability, source-interface, L3VNI</td></tr>
</table>

<h3>Chhe classic faults aur unke signatures</h3>
<ol>
<li><b>send-community both missing.</b> Route spine tak pahunchta hai, lekin Extended Community line missing hai. Koi leaf import nahi karta. Fix: l2vpn evpn neighbor ke neeche <code>send-community both</code> jodo (agar spine side culprit ho to wahan bhi).</li>
<li><b>RT import mismatch.</b> Route <code>show bgp l2vpn evpn</code> mein hai lekin MAC table ya VRF mein nahi. Sender ka export RT receiver ke import RT se compare karo.</li>
<li><b>VNI/VLAN mismatch.</b> EVI galat VNI dikhata hai, ya route ka L2VNI unexpected hai. Dono leaves par <code>vlan configuration</code> / <code>member evpn-instance ... vni</code> check karo.</li>
<li><b>Source-interface down ya underlay ke bahar.</b> BGP theek hone ke bawajood nve1 Oper Down ya VTEP peers nahi. <code>show nve interface nve1</code> aur Lo1 OSPF mein hai ya nahi dekho.</li>
<li><b>advertise l2vpn evpn missing.</b> Fabric ke andar hosts chalte hain (type 2) lekin koi type-5 prefix nahi aata. <code>address-family ipv4 vrf TENANT-A</code> ke neeche <code>advertise l2vpn evpn</code> jodo.</li>
<li><b>member vni N vrf missing, ya L3VNI mismatch.</b> Intra-VLAN chalta hai; inter-subnet routing fail. <code>show nve vni</code> mein L3CP row nahi ya doosre leaf se alag VNI hai.</li>
</ol>
<p>Do aur classics: <b>host-reachability protocol bgp nahi</b> (nve1 data-plane rehta hai, BGP routes ka asar nahi) aur <b>route-reflector-client missing</b> (spines routes rakhte hain lekin aage nahi dete).</p>

<pre class="out">SPINE1# show bgp l2vpn evpn route-type 2
 *>i [2][65001:10][0][48][0050.56aa.0002][32][10.10.10.12]/24
                    10.255.1.12              0    100      0 i
      <span class="hl">(Extended Community line nahi)</span>

LEAF1# show bgp l2vpn evpn summary | include 10.255.0.101
10.255.0.101    4 65001     330     301       17    0    0 00:55:10        4
LEAF1# show l2vpn evpn mac
<span class="hl">(koi remote MAC entry nahi)</span></pre>

<div class="eg"><p><b>Worked example: ticket "H2 H1 se reachable nahi".</b> Underlay theek. LEAF2 par H2 ka MAC <code>show l2vpn evpn mac</code> mein hai (links 1-2 ok). SPINE1 type-2 route dikhata hai lekin Extended Community line ke bina (link 4). Leaf ki neighbor line mein sirf <code>send-community</code> hai. LEAF2 par dono spines ke liye <code>send-community both</code> jodo. LEAF1 ab MAC install karta hai, link 6 satisfied. Kul samay: teen commands.</p></div>

<div class="warn"><p><b>Common galti.</b> Sirf host side se troubleshoot karna. Ping tests symptom batate hain; chhe links cause batate hain. Aur pehli reaction mein BGP sessions clear mat karo. Clear evidence chhupa deta hai aur configuration error theek nahi karta.</p></div>

<div class="exam"><p><b>Exam trap.</b> "BGP neighbor is Established" EVPN ke baare mein kuch nahi batata. Relevant summary <code>show bgp l2vpn evpn summary</code> hai, aur relevant counter per neighbor State/PfxRcd (number) hai.</p></div>

<div class="scn"><h4>Ek dopahar, teen tickets</h4><p>NOC ko mile: "VLAN 20 hosts leaves ke beech baat nahi kar paate", "TENANT-A data centre firewall prefix tak nahi pahunch pa raha" aur "LEAF3 hosts ko route nahi kiya ja sakta". Playbook ne teeno tickets das minute mein nipta diye: pehla RT mismatch tha (import 65001:20 versus export 65001:21), doosra border leaf par missing <code>advertise l2vpn evpn</code> (type 5 nahi), aur teesra LEAF3 par missing <code>member vni 50901 vrf TENANT-A</code> (L3CP row nahi). Har ek configuration ki ek line thi.</p><p><b>Seekh:</b> teen alag symptoms ke teen simple, alag causes ho sakte hain; playbook unhe jaldi alag karta hai.</p></div>

<div class="iv"><p class="q">"EVPN mein remote MAC learn nahi ho raha, troubleshooting samjhao."</p><p>Strong answer: underlay aur l2vpn evpn activated BGP session confirm karo; confirm karo ki MAC originating leaf par locally learned hai aur EVPN route ke roop mein dikhta hai; check karo ki spine ne use extended communities ke saath receive kiya; receiver ki BGP table mein route aur uska RT EVI import se check karo; aur aakhir mein nve peers aur VNI state verify karo. Likely faults ke naam lo: send-community, RT, VNI mismatch, host-reachability.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chain follow karo: local MAC, local route, spine, remote BGP, RT import, forwarding.</li>
<li>Established kaafi nahi; l2vpn evpn summary aur per-neighbor prefixes dekho.</li>
<li>BGP mein route hai lekin installed nahi to RT ki taraf point karta hai.</li>
<li>Evidence collect karne se pehle sessions clear mat karo.</li>
</ul></div>
`}};export{e as default};