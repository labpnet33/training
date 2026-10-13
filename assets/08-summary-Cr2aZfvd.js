var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You now have a complete picture of an EVPN-VXLAN fabric: BGP sessions through route reflectors, three route types carrying VTEPs, hosts and prefixes, a routed tenant with an anycast gateway and a symmetric L3VNI, and a playbook to find faults fast. This chapter is a fifteen-minute revision sheet before an exam, a lab or an interview.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Route type map">
<g font-size="12" class="svg-ink">
<rect x="20" y="20" width="190" height="60" rx="8" fill="#bae6fd"/><text x="115" y="42" text-anchor="middle">Type 3 (IMET)</text><text x="115" y="60" text-anchor="middle" class="svg-muted">VTEP in this VNI, flood list</text>
<rect x="225" y="20" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="320" y="42" text-anchor="middle">Type 2 (MAC/IP)</text><text x="320" y="60" text-anchor="middle" class="svg-muted">host, L2VNI, mobility seq</text>
<rect x="430" y="20" width="190" height="60" rx="8" fill="#fde68a"/><text x="525" y="42" text-anchor="middle">Type 5 (prefix)</text><text x="525" y="60" text-anchor="middle" class="svg-muted">subnet, L3VNI, Router MAC</text>
</g>
<text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="12">RD makes them unique, RT chooses who imports, send-community both carries the RT</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">Types 1 and 4 (Ethernet segments) arrive in the next module</text>
</svg><p class="cap">The three route types of this module.</p></div>

<h3>Checklist: you should be able to...</h3>
<ul>
<li>Explain what EVPN adds to VXLAN and why spines act as route reflectors in iBGP AS 65001.</li>
<li>Configure leaf and spine BGP: <code>neighbor ... activate</code>, <code>send-community both</code>, <code>route-reflector-client</code> in <code>address-family l2vpn evpn</code>.</li>
<li>Configure an L2VNI: <code>l2vpn evpn instance</code>, <code>rd</code>, <code>route-target</code>, <code>vlan configuration ... member evpn-instance ... vni</code>, and <code>host-reachability protocol bgp</code> with <code>member vni ... ingress-replication</code>.</li>
<li>Read type-3, type-2 and type-5 routes and decode their keys and extended communities.</li>
<li>Explain RD versus RT and justify one RD per leaf.</li>
<li>Build symmetric IRB: VRF TENANT-A, VLAN 901 and L3VNI 50901, Vlan SVIs with anycast IP, <code>member vni 50901 vrf TENANT-A</code>, <code>advertise l2vpn evpn</code>.</li>
<li>Describe MAC mobility with its sequence number and duplicate detection.</li>
<li>Run the six-link playbook and name each classic fault from its signature.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>EVPN</dt><dd>MP-BGP address family l2vpn evpn that advertises MACs, IPs and VTEPs.</dd>
<dt>IMET (type 3)</dt><dd>Inclusive multicast route; per-VNI VTEP membership and BUM destination.</dd>
<dt>MAC/IP (type 2)</dt><dd>Host route: MAC, optional IP, L2VNI, next hop VTEP.</dd>
<dt>IP prefix (type 5)</dt><dd>Prefix route into the VRF with L3VNI and Router MAC.</dd>
<dt>L2VNI / L3VNI</dt><dd>Bridged segment of one VLAN / routed segment of one VRF.</dd>
<dt>Symmetric IRB</dt><dd>Route at ingress and egress, forward in the L3VNI.</dd>
<dt>Anycast gateway</dt><dd>Same SVI IP and MAC on every leaf.</dd>
<dt>RD / RT</dt><dd>Route uniqueness / import-export control.</dd>
<dt>RR</dt><dd>Route reflector, here SPINE1 and SPINE2.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>Which BGP address family?</td><td>l2vpn evpn</td></tr>
<tr><td>Which community carries the RT?</td><td>Extended: send-community both</td></tr>
<tr><td>Route type for VTEP membership</td><td>3</td></tr>
<tr><td>Route type for host MAC/IP</td><td>2</td></tr>
<tr><td>Route type for IP prefixes</td><td>5</td></tr>
<tr><td>Peer type in show nve peers</td><td>L2CP / L3CP (control plane)</td></tr>
<tr><td>L3VNI in this fabric</td><td>50901 on VLAN 901, VRF TENANT-A, RT 65001:50901</td></tr>
<tr><td>Why does the RD differ per leaf?</td><td>Distinct routes at the RR, multipath</td></tr>
<tr><td>Route in BGP but not installed</td><td>RT mismatch</td></tr>
<tr><td>Hosts fine, no prefixes</td><td>advertise l2vpn evpn missing</td></tr>
</table>

<div class="warn"><p><b>Last-minute traps.</b> Established is not EVPN-ready. The RD never controls import. Anycast gateway means the same IP on every leaf. Spines have no VNIs. Type 5 needs a redistribution source.</p></div>

<div class="exam"><p><b>Exam strategy.</b> For output questions, read the extended community line first (RT, ENCAP, Router MAC, MacMobility). For configuration questions, check the three places a value must appear: VLAN binding, nve1 member, and the BGP or VRF block.</p></div>

<div class="scn"><h4>The interview that became a lab</h4><p>A candidate was told: "H1 on LEAF1 cannot reach H4 on LEAF3 across VLANs; you have five minutes and only show commands." She checked show nve vni on LEAF3 and saw no L3CP row, asked to see the nve1 config, and spotted the missing <code>member vni 50901 vrf TENANT-A</code>. The interviewer said that finding the fault in three commands mattered more than fixing it quickly.</p><p><b>Lesson:</b> structure beats speed; practice the playbook until it is automatic.</p></div>

<div class="iv"><p class="q">"Describe your EVPN-VXLAN fabric design in two minutes."</p><p>Strong answer: OSPF underlay with loopbacks; VXLAN data plane with L2VNIs per VLAN and an L3VNI per VRF; iBGP AS 65001 with the two spines as route reflectors and l2vpn evpn on every session with send-community both; leaves advertise type 3 for VTEP membership, type 2 for hosts, type 5 for prefixes; symmetric IRB with anycast gateway; RTs control import; MAC mobility sequences handle moves.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EVPN = BGP control plane for VXLAN: types 3, 2, 5.</li>
<li>Spines are RRs; leaves carry all VNI/VRF state.</li>
<li>Symmetric IRB with anycast gateway: L3VNI 50901 per VRF.</li>
<li>Playbook: local MAC, local route, spine, remote BGP, RT, forwarding.</li>
<li>Next: <code>sre-esi</code> adds multi-homing with route types 1 and 4.</li>
</ul></div>
`,hi:`
<p>Ab aapke paas EVPN-VXLAN fabric ki poori picture hai: route reflectors ke through BGP sessions, VTEPs, hosts aur prefixes carry karne wale teen route types, anycast gateway aur symmetric L3VNI ke saath routed tenant, aur faults jaldi dhoondhne ka playbook. Yeh chapter exam, lab ya interview se pehle pandrah minute ki revision sheet hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Route type map">
<g font-size="12" class="svg-ink">
<rect x="20" y="20" width="190" height="60" rx="8" fill="#bae6fd"/><text x="115" y="42" text-anchor="middle">Type 3 (IMET)</text><text x="115" y="60" text-anchor="middle" class="svg-muted">is VNI mein VTEP, flood list</text>
<rect x="225" y="20" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="320" y="42" text-anchor="middle">Type 2 (MAC/IP)</text><text x="320" y="60" text-anchor="middle" class="svg-muted">host, L2VNI, mobility seq</text>
<rect x="430" y="20" width="190" height="60" rx="8" fill="#fde68a"/><text x="525" y="42" text-anchor="middle">Type 5 (prefix)</text><text x="525" y="60" text-anchor="middle" class="svg-muted">subnet, L3VNI, Router MAC</text>
</g>
<text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="12">RD unique banata hai, RT import chunta hai, send-community both RT carry karta hai</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">Types 1 aur 4 (Ethernet segments) agle module mein</text>
</svg><p class="cap">Is module ke teen route types.</p></div>

<h3>Checklist: aapko yeh aana chahiye...</h3>
<ul>
<li>Samjhana ki EVPN VXLAN mein kya jodta hai aur iBGP AS 65001 mein spines route reflectors kyun hain.</li>
<li>Leaf aur spine BGP configure karna: <code>address-family l2vpn evpn</code> mein <code>neighbor ... activate</code>, <code>send-community both</code>, <code>route-reflector-client</code>.</li>
<li>L2VNI configure karna: <code>l2vpn evpn instance</code>, <code>rd</code>, <code>route-target</code>, <code>vlan configuration ... member evpn-instance ... vni</code>, aur <code>member vni ... ingress-replication</code> ke saath <code>host-reachability protocol bgp</code>.</li>
<li>Type-3, type-2 aur type-5 routes padhna aur unki keys aur extended communities decode karna.</li>
<li>RD versus RT samjhana aur har leaf par ek RD ko justify karna.</li>
<li>Symmetric IRB banana: VRF TENANT-A, VLAN 901 aur L3VNI 50901, anycast IP wale Vlan SVIs, <code>member vni 50901 vrf TENANT-A</code>, <code>advertise l2vpn evpn</code>.</li>
<li>MAC mobility ko sequence number aur duplicate detection ke saath describe karna.</li>
<li>Chhe-link playbook chalana aur har classic fault ko uske signature se naam dena.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>EVPN</dt><dd>MP-BGP address family l2vpn evpn jo MACs, IPs aur VTEPs advertise karta hai.</dd>
<dt>IMET (type 3)</dt><dd>Inclusive multicast route; per-VNI VTEP membership aur BUM destination.</dd>
<dt>MAC/IP (type 2)</dt><dd>Host route: MAC, optional IP, L2VNI, next hop VTEP.</dd>
<dt>IP prefix (type 5)</dt><dd>VRF mein prefix route, L3VNI aur Router MAC ke saath.</dd>
<dt>L2VNI / L3VNI</dt><dd>Ek VLAN ka bridged segment / ek VRF ka routed segment.</dd>
<dt>Symmetric IRB</dt><dd>Ingress aur egress par route, L3VNI mein forward.</dd>
<dt>Anycast gateway</dt><dd>Har leaf par same SVI IP aur MAC.</dd>
<dt>RD / RT</dt><dd>Route uniqueness / import-export control.</dd>
<dt>RR</dt><dd>Route reflector, yahan SPINE1 aur SPINE2.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>Kaunsi BGP address family?</td><td>l2vpn evpn</td></tr>
<tr><td>RT kaunsi community carry karti hai?</td><td>Extended: send-community both</td></tr>
<tr><td>VTEP membership ka route type</td><td>3</td></tr>
<tr><td>Host MAC/IP ka route type</td><td>2</td></tr>
<tr><td>IP prefixes ka route type</td><td>5</td></tr>
<tr><td>show nve peers mein peer type</td><td>L2CP / L3CP (control plane)</td></tr>
<tr><td>Is fabric ka L3VNI</td><td>VLAN 901 par 50901, VRF TENANT-A, RT 65001:50901</td></tr>
<tr><td>RD har leaf par alag kyun?</td><td>RR par distinct routes, multipath</td></tr>
<tr><td>Route BGP mein hai lekin installed nahi</td><td>RT mismatch</td></tr>
<tr><td>Hosts theek, prefixes nahi</td><td>advertise l2vpn evpn missing</td></tr>
</table>

<div class="warn"><p><b>Aakhri minute ke traps.</b> Established ka matlab EVPN-ready nahi. RD kabhi import control nahi karta. Anycast gateway matlab har leaf par same IP. Spines ke paas VNIs nahi hote. Type 5 ko redistribution source chahiye.</p></div>

<div class="exam"><p><b>Exam strategy.</b> Output questions mein pehle extended community line padho (RT, ENCAP, Router MAC, MacMobility). Configuration questions mein teen jagah check karo jahan value honi chahiye: VLAN binding, nve1 member, aur BGP ya VRF block.</p></div>

<div class="scn"><h4>Interview jo lab ban gaya</h4><p>Candidate se kaha gaya: "LEAF1 par H1 LEAF3 par H4 tak VLANs ke paar nahi pahunch pa raha; paanch minute aur sirf show commands." Usne LEAF3 par show nve vni dekha aur L3CP row nahi mili, nve1 config dikhane ko kaha, aur missing <code>member vni 50901 vrf TENANT-A</code> pakad liya. Interviewer ne kaha ki teen commands mein fault dhoondhna jaldi fix karne se zyada matter karta hai.</p><p><b>Seekh:</b> structure speed se behtar hai; playbook ko automatic hone tak practice karo.</p></div>

<div class="iv"><p class="q">"Apna EVPN-VXLAN fabric design do minute mein describe karo."</p><p>Strong answer: loopbacks ke saath OSPF underlay; har VLAN ke L2VNI aur har VRF ke L3VNI ke saath VXLAN data plane; iBGP AS 65001 jisme dono spines route reflectors hain aur har session par send-community both ke saath l2vpn evpn; leaves VTEP membership ke liye type 3, hosts ke liye type 2, prefixes ke liye type 5 advertise karte hain; anycast gateway ke saath symmetric IRB; RTs import control karte hain; MAC mobility sequences moves handle karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EVPN = VXLAN ka BGP control plane: types 3, 2, 5.</li>
<li>Spines RRs hain; leaves saari VNI/VRF state rakhte hain.</li>
<li>Anycast gateway ke saath symmetric IRB: per VRF L3VNI 50901.</li>
<li>Playbook: local MAC, local route, spine, remote BGP, RT, forwarding.</li>
<li>Agla: <code>sre-esi</code> route types 1 aur 4 ke saath multi-homing jodta hai.</li>
</ul></div>
`}};export{e as default};