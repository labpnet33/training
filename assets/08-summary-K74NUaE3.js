var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with three leaves that could not share a VLAN and finished with a working overlay you can build, verify and repair. This chapter is a fifteen-minute revision sheet: what you should be able to do, the vocabulary, the facts examiners like, and a bridge to the next module.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Module in one line">
<g font-size="12" class="svg-ink">
<rect x="10" y="30" width="90" height="46" rx="6" fill="#fed7aa"/><text x="55" y="58" text-anchor="middle">H1 VLAN 10</text>
<rect x="125" y="30" width="100" height="46" rx="6" fill="#bae6fd"/><text x="175" y="52" text-anchor="middle">LEAF1</text><text x="175" y="68" text-anchor="middle" class="svg-muted">VNI 10010</text>
<rect x="250" y="30" width="140" height="46" rx="6" fill="#ddd6fe"/><text x="320" y="52" text-anchor="middle">Underlay</text><text x="320" y="68" text-anchor="middle" class="svg-muted">OSPF, ECMP, MTU</text>
<rect x="415" y="30" width="100" height="46" rx="6" fill="#bae6fd"/><text x="465" y="52" text-anchor="middle">LEAF2</text><text x="465" y="68" text-anchor="middle" class="svg-muted">VNI 10010</text>
<rect x="540" y="30" width="90" height="46" rx="6" fill="#fed7aa"/><text x="585" y="58" text-anchor="middle">H2 VLAN 10</text>
</g><g stroke="#64748b" stroke-width="2"><line x1="100" y1="53" x2="125" y2="53"/><line x1="225" y1="53" x2="250" y2="53"/><line x1="390" y1="53" x2="415" y2="53"/><line x1="515" y1="53" x2="540" y2="53"/></g>
<text x="320" y="105" text-anchor="middle" class="svg-accent" font-size="12">VLAN to VNI to VTEP to routed underlay to VTEP to VNI to VLAN</text>
</svg><p class="cap">The whole module in one line.</p></div>

<h3>Checklist: you should be able to...</h3>
<ul>
<li>Explain why overlays exist and why the leaf-spine links stay routed.</li>
<li>Define VLAN, VNI, VTEP, NVE, L2VNI and say which of them must match between leaves.</li>
<li>Draw the VXLAN packet and add up 14 + 20 + 8 + 8 = 50 bytes; state the UDP destination 4789 and explain the hashed source port.</li>
<li>Build the underlay (OSPF process 1 area 0, Lo0 and Lo1, jumbo MTU) and prove it with a large, DF-bit ping sourced from Lo1.</li>
<li>Configure a leaf: VLAN and host port, <code>l2vpn evpn instance</code> with <code>encapsulation vxlan</code>, <code>vlan configuration</code> with <code>member evpn-instance ... vni</code>, nve1 with <code>source-interface</code> and <code>member vni ... ingress-replication</code>.</li>
<li>Describe flood-and-learn and walk an ARP between H1 and H2, saying where each MAC is learned.</li>
<li>Compare static ingress replication with underlay multicast.</li>
<li>Climb the five-rung ladder and name each of the five classic faults from its signature.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Underlay</dt><dd>The routed IP network that carries VXLAN packets between VTEP loopbacks.</dd>
<dt>Overlay</dt><dd>The virtual Layer 2 segments (VNIs) built on top of the underlay.</dd>
<dt>VNI</dt><dd>24-bit segment ID, fabric-wide.</dd>
<dt>VTEP / NVE</dt><dd>Tunnel endpoint and its logical interface (nve1).</dd>
<dt>BUM</dt><dd>Broadcast, unknown unicast, multicast.</dd>
<dt>Ingress replication</dt><dd>Unicast copy of BUM to each remote VTEP.</dd>
<dt>Flood and learn</dt><dd>Learning remote MACs from data-plane traffic: inner source MAC to outer source IP.</dd>
<dt>DP / CP</dt><dd>Data-plane versus control-plane learning, shown in show nve peers.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>VXLAN UDP destination port</td><td>4789</td></tr>
<tr><td>VNI bits / VLAN bits</td><td>24 / 12</td></tr>
<tr><td>Encapsulation overhead</td><td>50 bytes; 1550 minimum underlay IP MTU for 1500-byte hosts</td></tr>
<tr><td>What must match between leaves</td><td>The VNI (not the VLAN ID)</td></tr>
<tr><td>Source address of VXLAN packets</td><td>The nve1 source-interface (Lo1)</td></tr>
<tr><td>Remote MAC in the MAC table</td><td>Port shown as Nv1(peer VTEP IP)</td></tr>
<tr><td>Verification order</td><td>Underlay, nve1, VNI, peers, MACs</td></tr>
</table>

<div class="warn"><p><b>Last-minute traps.</b> Static peer lists must be symmetric. A UP peer does not prove a VNI. Spines are not VTEPs here. Small pings do not prove MTU.</p></div>

<div class="exam"><p><b>Exam strategy.</b> When shown output, find the one column that matters first: VNI and state in show nve vni, peer address and type in show nve peers, source address in show nve interface. Most questions are answered by one highlighted value.</p></div>

<div class="scn"><h4>The whiteboard question</h4><p>An interviewer asked a candidate to "stretch VLAN 10 between two racks". She drew the underlay, the 50-byte packet, the leaf config and the five-rung ladder, then volunteered that adding a fortieth leaf would mean editing 39 peer lists. The interviewer smiled: "so what would you change?" She answered: "BGP EVPN, so peers and MACs are advertised instead of typed".</p><p><b>Lesson:</b> that answer is exactly the next module. Knowing the limits of a design is as valuable as knowing the design.</p></div>

<div class="iv"><p class="q">"Summarise VXLAN flood-and-learn in two minutes."</p><p>Strong answer: VXLAN encapsulates Ethernet frames in UDP, with a 24-bit VNI, between VTEP loopbacks over a routed underlay (50 bytes overhead). Without a control plane, remote MACs are learned from decapsulated traffic and BUM is replicated to every VTEP by multicast or static ingress replication. It works for small fabrics but needs manual peer lists, floods more as it grows and has no ARP suppression, which is why BGP EVPN is used next.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VXLAN = L2 over routed IP, VNI 24 bits, 50 bytes overhead.</li>
<li>Build order: underlay, VLAN, EVI, VLAN-VNI binding, nve1, verify.</li>
<li>Ladder: underlay, nve1, VNI, peers, MACs.</li>
<li>Five faults: VNI mismatch, missing Lo1 route, source-interface, MTU, peer list.</li>
<li>Next: <code>sre-evpn</code> replaces typed lists with BGP.</li>
</ul></div>
`,hi:`
<p>Aapne teen leaves se shuru kiya jo VLAN share nahi kar sakte the aur ek aise working overlay par khatam kiya jise aap bana, verify aur repair kar sakte ho. Yeh chapter pandrah minute ki revision sheet hai: aapko kya aana chahiye, vocabulary, examiners ke pasandida facts, aur agle module ka bridge.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Module in one line">
<g font-size="12" class="svg-ink">
<rect x="10" y="30" width="90" height="46" rx="6" fill="#fed7aa"/><text x="55" y="58" text-anchor="middle">H1 VLAN 10</text>
<rect x="125" y="30" width="100" height="46" rx="6" fill="#bae6fd"/><text x="175" y="52" text-anchor="middle">LEAF1</text><text x="175" y="68" text-anchor="middle" class="svg-muted">VNI 10010</text>
<rect x="250" y="30" width="140" height="46" rx="6" fill="#ddd6fe"/><text x="320" y="52" text-anchor="middle">Underlay</text><text x="320" y="68" text-anchor="middle" class="svg-muted">OSPF, ECMP, MTU</text>
<rect x="415" y="30" width="100" height="46" rx="6" fill="#bae6fd"/><text x="465" y="52" text-anchor="middle">LEAF2</text><text x="465" y="68" text-anchor="middle" class="svg-muted">VNI 10010</text>
<rect x="540" y="30" width="90" height="46" rx="6" fill="#fed7aa"/><text x="585" y="58" text-anchor="middle">H2 VLAN 10</text>
</g><g stroke="#64748b" stroke-width="2"><line x1="100" y1="53" x2="125" y2="53"/><line x1="225" y1="53" x2="250" y2="53"/><line x1="390" y1="53" x2="415" y2="53"/><line x1="515" y1="53" x2="540" y2="53"/></g>
<text x="320" y="105" text-anchor="middle" class="svg-accent" font-size="12">VLAN se VNI se VTEP se routed underlay se VTEP se VNI se VLAN</text>
</svg><p class="cap">Poora module ek line mein.</p></div>

<h3>Checklist: aapko yeh aana chahiye...</h3>
<ul>
<li>Samjhana ki overlays kyun hain aur leaf-spine links routed kyun rehte hain.</li>
<li>VLAN, VNI, VTEP, NVE, L2VNI define karna aur batana ki leaves ke beech inmein se kya match hona chahiye.</li>
<li>VXLAN packet draw karna aur 14 + 20 + 8 + 8 = 50 bytes jodna; UDP destination 4789 batana aur hashed source port samjhana.</li>
<li>Underlay banana (OSPF process 1 area 0, Lo0 aur Lo1, jumbo MTU) aur Lo1 se sourced bade, DF-bit ping se prove karna.</li>
<li>Leaf configure karna: VLAN aur host port, <code>encapsulation vxlan</code> ke saath <code>l2vpn evpn instance</code>, <code>member evpn-instance ... vni</code> ke saath <code>vlan configuration</code>, <code>source-interface</code> aur <code>member vni ... ingress-replication</code> ke saath nve1.</li>
<li>Flood-and-learn describe karna aur H1 aur H2 ke beech ARP walk karna, batana ki har MAC kahan learn hota hai.</li>
<li>Static ingress replication ko underlay multicast se compare karna.</li>
<li>Paanch-rung ladder chadhna aur paanchon classic faults ko unke signature se pehchanna.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Underlay</dt><dd>Routed IP network jo VTEP loopbacks ke beech VXLAN packets carry karta hai.</dd>
<dt>Overlay</dt><dd>Underlay ke upar bane virtual Layer 2 segments (VNIs).</dd>
<dt>VNI</dt><dd>24-bit segment ID, fabric-wide.</dd>
<dt>VTEP / NVE</dt><dd>Tunnel endpoint aur uska logical interface (nve1).</dd>
<dt>BUM</dt><dd>Broadcast, unknown unicast, multicast.</dd>
<dt>Ingress replication</dt><dd>BUM ki har remote VTEP ko unicast copy.</dd>
<dt>Flood and learn</dt><dd>Remote MACs ko data-plane traffic se seekhna: inner source MAC se outer source IP.</dd>
<dt>DP / CP</dt><dd>Data-plane versus control-plane learning, show nve peers mein dikhta hai.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>VXLAN UDP destination port</td><td>4789</td></tr>
<tr><td>VNI bits / VLAN bits</td><td>24 / 12</td></tr>
<tr><td>Encapsulation overhead</td><td>50 bytes; 1500-byte hosts ke liye minimum underlay IP MTU 1550</td></tr>
<tr><td>Leaves ke beech kya match hona chahiye</td><td>VNI (VLAN ID nahi)</td></tr>
<tr><td>VXLAN packets ka source address</td><td>nve1 source-interface (Lo1)</td></tr>
<tr><td>MAC table mein remote MAC</td><td>Port Nv1(peer VTEP IP) dikhta hai</td></tr>
<tr><td>Verification order</td><td>Underlay, nve1, VNI, peers, MACs</td></tr>
</table>

<div class="warn"><p><b>Aakhri minute ke traps.</b> Static peer lists symmetric honi chahiye. UP peer VNI prove nahi karta. Yahan spines VTEPs nahi hain. Chhote pings MTU prove nahi karte.</p></div>

<div class="exam"><p><b>Exam strategy.</b> Output dikhe to pehle woh ek column dhoondho jo matter karta hai: show nve vni mein VNI aur state, show nve peers mein peer address aur type, show nve interface mein source address. Zyada tar questions ek highlighted value se solve ho jaate hain.</p></div>

<div class="scn"><h4>Whiteboard question</h4><p>Interviewer ne candidate se kaha "VLAN 10 ko do racks ke beech stretch karo". Usne underlay, 50-byte packet, leaf config aur paanch-rung ladder draw ki, phir khud bataya ki chaalisvaan leaf jodne ka matlab 39 peer lists edit karna hoga. Interviewer muskuraya: "to aap kya badloge?" Jawab: "BGP EVPN, taaki peers aur MACs type karne ki jagah advertise hon".</p><p><b>Seekh:</b> yahi jawab agla module hai. Design ki limits jaanna design jaanne jitna hi valuable hai.</p></div>

<div class="iv"><p class="q">"VXLAN flood-and-learn do minute mein summarise karo."</p><p>Strong answer: VXLAN Ethernet frames ko UDP mein, 24-bit VNI ke saath, routed underlay par VTEP loopbacks ke beech encapsulate karta hai (50 bytes overhead). Control plane ke bina remote MACs decapsulated traffic se seekhe jaate hain aur BUM har VTEP ko multicast ya static ingress replication se replicate hota hai. Chhote fabrics ke liye chalta hai lekin manual peer lists chahiye, badhne par zyada flood hota hai aur ARP suppression nahi hai, isliye aage BGP EVPN use hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VXLAN = routed IP par L2, VNI 24 bits, 50 bytes overhead.</li>
<li>Build order: underlay, VLAN, EVI, VLAN-VNI binding, nve1, verify.</li>
<li>Ladder: underlay, nve1, VNI, peers, MACs.</li>
<li>Paanch faults: VNI mismatch, missing Lo1 route, source-interface, MTU, peer list.</li>
<li>Agla: <code>sre-evpn</code> typed lists ki jagah BGP lata hai.</li>
</ul></div>
`}};export{e as default};