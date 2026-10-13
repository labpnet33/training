var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You have built an EVPN-VXLAN fabric from the underlay up and fixed it when it broke. This chapter pulls everything together for the JN0-650 exam: a can-do checklist, a mini glossary, the most tested facts and a command cheat sheet. Remember which parts you practised in the simulator (underlay, IBGP, leaf configuration, second VNI, troubleshooting) and which parts are concept only (multihoming and IRB gateways).</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Summary map">
<rect x="10" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="80" y="42" text-anchor="middle" class="svg-ink" font-size="12">Underlay</text><text x="80" y="59" text-anchor="middle" class="svg-muted" font-size="11">OSPF, loopbacks</text>
<rect x="170" y="20" width="140" height="50" rx="8" fill="#fde68a"/><text x="240" y="42" text-anchor="middle" class="svg-ink" font-size="12">Overlay</text><text x="240" y="59" text-anchor="middle" class="svg-muted" font-size="11">IBGP family evpn</text>
<rect x="330" y="20" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="400" y="42" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text><text x="400" y="59" text-anchor="middle" class="svg-muted" font-size="11">RD, RT, VNI list</text>
<rect x="490" y="20" width="140" height="50" rx="8" fill="#fed7aa"/><text x="560" y="42" text-anchor="middle" class="svg-ink" font-size="12">Verify</text><text x="560" y="59" text-anchor="middle" class="svg-muted" font-size="11">routes, tunnels, MACs</text>
<text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">Route types: 1 AD, 2 MAC/IP, 3 IM, 4 ES, 5 prefix</text>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">Troubleshoot bottom-up: underlay, session, accepted, VNIs, data plane</text>
</svg><p class="cap">The whole module on one line.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain why VXLAN with a 24-bit VNI replaces VLANs at data-centre scale, and why EVPN replaces flood-and-learn.</li>
<li>I can build an OSPF underlay on point-to-point links and test with a loopback-sourced ping.</li>
<li>I can configure an IBGP overlay with <code>family evpn signaling</code> and a spine route reflector.</li>
<li>I can name the five route types and say what each carries.</li>
<li>I can configure a leaf: vtep-source-interface, route-distinguisher, vrf-target, encapsulation vxlan and extended-vni-list.</li>
<li>I can explain the difference between RD and RT.</li>
<li>I can add a second VNI and know the three places it must appear.</li>
<li>I can explain ESI, DF election, aliasing, mass withdrawal and the CRB versus ERB choice.</li>
<li>I can troubleshoot from the underlay up using the accepted counter, the tunnel list and the instance output.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>VTEP</dt><dd>VXLAN tunnel endpoint: the leaf function that encapsulates and decapsulates.</dd>
<dt>VNI</dt><dd>24-bit VXLAN network identifier, one per Layer 2 segment.</dd>
<dt>NLRI evpn</dt><dd>The BGP address family that carries EVPN routes (table bgp.evpn.0).</dd>
<dt>RD</dt><dd>Makes routes unique; per leaf and instance.</dd>
<dt>RT (vrf-target)</dt><dd>Controls import and export of routes between leaves.</dd>
<dt>Type 2</dt><dd>MAC (and optionally IP) advertisement.</dd>
<dt>Type 3</dt><dd>Inclusive multicast route; builds the ingress-replication flood list.</dd>
<dt>Type 5</dt><dd>IP prefix route for Layer 3 between tenants.</dd>
<dt>ESI</dt><dd>10-byte identifier of a multihomed Ethernet segment.</dd>
<dt>DF</dt><dd>Designated forwarder: the leaf per VLAN that sends BUM to the segment.</dd>
<dt>Aliasing</dt><dd>Load balancing to all leaves on an ESI.</dd>
<dt>CRB / ERB</dt><dd>Gateways on the spines / anycast gateways on every leaf.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Transport</td><td>VXLAN is carried in UDP, destination port 4789, with about 50 bytes of overhead</td></tr>
<tr><td>Underlay</td><td>Any IGP or eBGP; the loopback is the VTEP address and must be reachable</td></tr>
<tr><td>Overlay</td><td>IBGP with family evpn signaling; the spine as route reflector</td></tr>
<tr><td>Type 1</td><td>Auto-discovery: mass withdrawal (per ES) and aliasing (per EVI)</td></tr>
<tr><td>Type 2</td><td>MAC and MAC+IP; the control-plane replacement for flood-and-learn</td></tr>
<tr><td>Type 3</td><td>BUM flood list through the PMSI attribute with ingress replication</td></tr>
<tr><td>Type 4</td><td>Finds peers on the same ESI and elects the DF</td></tr>
<tr><td>Type 5</td><td>IP prefixes between VRFs</td></tr>
<tr><td>Config trap</td><td>The VNI must be in the leaf's own extended-vni-list, or it is not advertised</td></tr>
<tr><td>Import trap</td><td>Established with 0 accepted means route target mismatch</td></tr></table>

<h3>Command cheat sheet</h3>
<table class="cmp"><tr><th>Goal</th><th>Command</th></tr>
<tr><td>Underlay neighbours</td><td><code>show ospf neighbor</code></td></tr>
<tr><td>Loopback test</td><td><code>ping 10.50.255.12 source 10.50.255.11</code></td></tr>
<tr><td>Session and accepted counts</td><td><code>show bgp summary</code></td></tr>
<tr><td>EVPN routes</td><td><code>show route table bgp.evpn.0</code></td></tr>
<tr><td>Route detail with PMSI</td><td><code>show route table bgp.evpn.0 extensive</code></td></tr>
<tr><td>Instance, VNIs, neighbours</td><td><code>show evpn instance extensive</code></td></tr>
<tr><td>Remote VTEPs</td><td><code>show ethernet-switching vxlan-tunnel-end-point remote</code></td></tr>
<tr><td>Local VTEP</td><td><code>show ethernet-switching vxlan-tunnel-end-point source</code></td></tr>
<tr><td>Learned MACs</td><td><code>show ethernet-switching table</code>, <code>show evpn database</code></td></tr>
<tr><td>What changed</td><td><code>show system commit</code>, <code>show configuration | compare rollback 1</code></td></tr></table>

<div class="exam"><p><b>Exam trap.</b> Questions often hide the fault in one counter or one configuration line: a RT that differs by a digit, a VNI absent from the list, an ESI that differs by a byte, or the wrong BGP family. Read the whole output before choosing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build bottom-up and troubleshoot bottom-up.</li>
<li>Learn the route types by job, not by number alone.</li>
<li>RD keeps routes unique; RT decides who imports them.</li>
<li>Multihoming and IRB are exam concepts; practise reading their configuration.</li>
<li>Always read received versus accepted.</li>
</ul></div>
`,hi:`
<p>Aapne EVPN-VXLAN fabric underlay se banaya aur toota to theek kiya. Yeh chapter JN0-650 exam ke liye sab kuch jodta hai: can-do checklist, mini glossary, sabse zyada poochhe jaane wale facts aur command cheat sheet. Yaad rakho ki simulator mein kya practise kiya (underlay, IBGP, leaf configuration, second VNI, troubleshooting) aur kya sirf concept hai (multihoming aur IRB gateways).</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Summary map">
<rect x="10" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="80" y="42" text-anchor="middle" class="svg-ink" font-size="12">Underlay</text><text x="80" y="59" text-anchor="middle" class="svg-muted" font-size="11">OSPF, loopbacks</text>
<rect x="170" y="20" width="140" height="50" rx="8" fill="#fde68a"/><text x="240" y="42" text-anchor="middle" class="svg-ink" font-size="12">Overlay</text><text x="240" y="59" text-anchor="middle" class="svg-muted" font-size="11">IBGP family evpn</text>
<rect x="330" y="20" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="400" y="42" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text><text x="400" y="59" text-anchor="middle" class="svg-muted" font-size="11">RD, RT, VNI list</text>
<rect x="490" y="20" width="140" height="50" rx="8" fill="#fed7aa"/><text x="560" y="42" text-anchor="middle" class="svg-ink" font-size="12">Verify</text><text x="560" y="59" text-anchor="middle" class="svg-muted" font-size="11">routes, tunnels, MACs</text>
<text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">Route types: 1 AD, 2 MAC/IP, 3 IM, 4 ES, 5 prefix</text>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">Troubleshoot bottom-up: underlay, session, accepted, VNIs, data plane</text>
</svg><p class="cap">Poora module ek line mein.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main samjha sakta hoon ki data-centre scale par 24-bit VNI wala VXLAN VLANs ki jagah kyun leta hai, aur EVPN flood-and-learn ki jagah kyun leta hai.</li>
<li>Main point-to-point links par OSPF underlay bana sakta hoon aur loopback-sourced ping se test kar sakta hoon.</li>
<li>Main <code>family evpn signaling</code> aur spine route reflector ke saath IBGP overlay configure kar sakta hoon.</li>
<li>Main paanchon route types ke naam aur unka kaam bata sakta hoon.</li>
<li>Main leaf configure kar sakta hoon: vtep-source-interface, route-distinguisher, vrf-target, encapsulation vxlan aur extended-vni-list.</li>
<li>Main RD aur RT ka fark samjha sakta hoon.</li>
<li>Main second VNI jod sakta hoon aur jaanta hoon ki woh teen jagah dikhna chahiye.</li>
<li>Main ESI, DF election, aliasing, mass withdrawal aur CRB versus ERB ka choice samjha sakta hoon.</li>
<li>Main underlay se upar ki taraf accepted counter, tunnel list aur instance output se troubleshoot kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>VTEP</dt><dd>VXLAN tunnel endpoint: leaf ka function jo encapsulate aur decapsulate karta hai.</dd>
<dt>VNI</dt><dd>24-bit VXLAN network identifier, har Layer 2 segment ke liye ek.</dd>
<dt>NLRI evpn</dt><dd>BGP address family jo EVPN routes le jaati hai (table bgp.evpn.0).</dd>
<dt>RD</dt><dd>Routes ko unique banata hai; per leaf aur instance.</dd>
<dt>RT (vrf-target)</dt><dd>Leaves ke beech routes ka import aur export control karta hai.</dd>
<dt>Type 2</dt><dd>MAC (aur optional IP) advertisement.</dd>
<dt>Type 3</dt><dd>Inclusive multicast route; ingress-replication flood list banata hai.</dd>
<dt>Type 5</dt><dd>Tenants ke beech Layer 3 ke liye IP prefix route.</dd>
<dt>ESI</dt><dd>Multihomed Ethernet segment ka 10-byte identifier.</dd>
<dt>DF</dt><dd>Designated forwarder: woh leaf jo per VLAN segment ko BUM bhejta hai.</dd>
<dt>Aliasing</dt><dd>ESI ke saare leaves par load balancing.</dd>
<dt>CRB / ERB</dt><dd>Spines par gateways / har leaf par anycast gateways.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>Transport</td><td>VXLAN UDP mein jaata hai, destination port 4789, lagbhag 50 byte overhead ke saath</td></tr>
<tr><td>Underlay</td><td>Koi bhi IGP ya eBGP; loopback VTEP address hai aur reachable hona chahiye</td></tr>
<tr><td>Overlay</td><td>Family evpn signaling ke saath IBGP; spine route reflector</td></tr>
<tr><td>Type 1</td><td>Auto-discovery: mass withdrawal (per ES) aur aliasing (per EVI)</td></tr>
<tr><td>Type 2</td><td>MAC aur MAC+IP; flood-and-learn ka control-plane replacement</td></tr>
<tr><td>Type 3</td><td>PMSI attribute aur ingress replication ke saath BUM flood list</td></tr>
<tr><td>Type 4</td><td>Same ESI ke peers dhoondta hai aur DF chunta hai</td></tr>
<tr><td>Type 5</td><td>VRFs ke beech IP prefixes</td></tr>
<tr><td>Config trap</td><td>VNI leaf ki apni extended-vni-list mein hona chahiye, warna advertise nahi hota</td></tr>
<tr><td>Import trap</td><td>Established ke saath 0 accepted ka matlab route target mismatch</td></tr></table>

<h3>Command cheat sheet</h3>
<table class="cmp"><tr><th>Maksad</th><th>Command</th></tr>
<tr><td>Underlay neighbours</td><td><code>show ospf neighbor</code></td></tr>
<tr><td>Loopback test</td><td><code>ping 10.50.255.12 source 10.50.255.11</code></td></tr>
<tr><td>Session aur accepted counts</td><td><code>show bgp summary</code></td></tr>
<tr><td>EVPN routes</td><td><code>show route table bgp.evpn.0</code></td></tr>
<tr><td>PMSI ke saath route detail</td><td><code>show route table bgp.evpn.0 extensive</code></td></tr>
<tr><td>Instance, VNIs, neighbours</td><td><code>show evpn instance extensive</code></td></tr>
<tr><td>Remote VTEPs</td><td><code>show ethernet-switching vxlan-tunnel-end-point remote</code></td></tr>
<tr><td>Local VTEP</td><td><code>show ethernet-switching vxlan-tunnel-end-point source</code></td></tr>
<tr><td>Seekhe gaye MACs</td><td><code>show ethernet-switching table</code>, <code>show evpn database</code></td></tr>
<tr><td>Kya badla</td><td><code>show system commit</code>, <code>show configuration | compare rollback 1</code></td></tr></table>

<div class="exam"><p><b>Exam trap.</b> Sawaal aksar fault ko ek counter ya ek configuration line mein chhupate hain: ek digit se alag RT, list se gayab VNI, ek byte se alag ESI, ya galat BGP family. Chunne se pehle poora output padho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Neeche se upar banao aur neeche se upar troubleshoot karo.</li>
<li>Route types ko kaam se seekho, sirf number se nahi.</li>
<li>RD routes ko unique rakhta hai; RT tay karta hai kaun import karega.</li>
<li>Multihoming aur IRB exam concepts hain; unki configuration padhna practise karo.</li>
<li>Hamesha received versus accepted padho.</li>
</ul></div>
`}};export{e as default};