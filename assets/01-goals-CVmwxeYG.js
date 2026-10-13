var e={id:`goals`,h:{en:`Goals, prerequisites and the fabric we will build`,hi:`Goals, prerequisites aur woh fabric jo hum banayenge`},body:{en:`
<p>Imagine a company with three office floors. Every floor has its own set of desks, but the finance team wants "one big open room" feeling: Priya on floor 1 and Rahul on floor 2 should behave as if they sit next to each other. You cannot move the walls, so you build a private tunnel system between the floors and tell each floor's reception to carry messages through it. <b>VXLAN</b> is that tunnel system for Ethernet: it carries a Layer 2 segment (a VLAN) across a routed IP network, so two servers in different racks think they share one switch.</p>

<div class="note"><p><b>What you will learn.</b> Why overlays exist, what a VNI and a VTEP are, how the routed underlay is prepared, how flood-and-learn works with static ingress replication, the IOS XE-style configuration, the verification ladder and the most common faults. This is the first of three modules in the EVPN-VXLAN fabric: <code>sre-vxlan</code> (data plane), <code>sre-evpn</code> (BGP control plane) and <code>sre-esi</code> (multi-homing).</p></div>

<div class="note"><p><b>Prerequisites.</b> You should already be comfortable with VLANs and trunks, OSPF basics and loopbacks, and the idea of spine-leaf design. If any of that is shaky, revise the modules <code>dc-underlay</code> and <code>dc-vxlan</code> first. Here we do not repeat the full theory of the VXLAN header; we reuse it, apply it on IOS XE-style switches and extend it with the full troubleshooting method used in this track.</p></div>

<h3>The fabric used in every example</h3>
<p>All three modules use the same small data center. Two spines, three leaves, four ordinary hosts. Keep this picture in your head, because every command output in the module refers to it.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Spine-leaf fabric">
<rect x="150" y="15" width="130" height="40" rx="8" fill="#ddd6fe"/><text x="215" y="33" text-anchor="middle" class="svg-ink" font-size="12">SPINE1</text><text x="215" y="48" text-anchor="middle" class="svg-muted" font-size="12">Lo0 10.255.0.101</text>
<rect x="360" y="15" width="130" height="40" rx="8" fill="#ddd6fe"/><text x="425" y="33" text-anchor="middle" class="svg-ink" font-size="12">SPINE2</text><text x="425" y="48" text-anchor="middle" class="svg-muted" font-size="12">Lo0 10.255.0.102</text>
<rect x="30" y="130" width="140" height="44" rx="8" fill="#bae6fd"/><text x="100" y="149" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="100" y="165" text-anchor="middle" class="svg-muted" font-size="12">VTEP 10.255.1.11</text>
<rect x="250" y="130" width="140" height="44" rx="8" fill="#bae6fd"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">VTEP 10.255.1.12</text>
<rect x="470" y="130" width="140" height="44" rx="8" fill="#bae6fd"/><text x="540" y="149" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text><text x="540" y="165" text-anchor="middle" class="svg-muted" font-size="12">VTEP 10.255.1.13</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="215" y1="55" x2="100" y2="130"/><line x1="215" y1="55" x2="320" y2="130"/><line x1="215" y1="55" x2="540" y2="130"/><line x1="425" y1="55" x2="100" y2="130"/><line x1="425" y1="55" x2="320" y2="130"/><line x1="425" y1="55" x2="540" y2="130"/></g>
<rect x="40" y="214" width="120" height="30" rx="6" fill="#fed7aa"/><text x="100" y="233" text-anchor="middle" class="svg-ink" font-size="12">H1 VLAN10 .11</text>
<rect x="190" y="214" width="110" height="30" rx="6" fill="#fed7aa"/><text x="245" y="233" text-anchor="middle" class="svg-ink" font-size="12">H2 VLAN10 .12</text>
<rect x="330" y="214" width="110" height="30" rx="6" fill="#fed7aa"/><text x="385" y="233" text-anchor="middle" class="svg-ink" font-size="12">H3 VLAN20 .13</text>
<rect x="480" y="214" width="120" height="30" rx="6" fill="#fed7aa"/><text x="540" y="233" text-anchor="middle" class="svg-ink" font-size="12">H4 VLAN20 .14</text>
<g stroke="#64748b"><line x1="100" y1="174" x2="100" y2="214"/><line x1="300" y1="174" x2="245" y2="214"/><line x1="340" y1="174" x2="385" y2="214"/><line x1="540" y1="174" x2="540" y2="214"/></g>
</svg><p class="cap">Every leaf connects to both spines. Spines only route; leaves are the VTEPs.</p></div>

<table class="cmp"><tr><th>Item</th><th>Value</th></tr>
<tr><td>Spine loopbacks (Lo0)</td><td>SPINE1 10.255.0.101, SPINE2 10.255.0.102</td></tr>
<tr><td>Leaf router-id loopbacks (Lo0)</td><td>10.255.0.11, .12, .13</td></tr>
<tr><td>Leaf VTEP loopbacks (Lo1)</td><td>10.255.1.11, .12, .13</td></tr>
<tr><td>Links</td><td>LEAFn to SPINE1 10.1.n.0/30 (spine .1, leaf .2); LEAFn to SPINE2 10.2.n.0/30</td></tr>
<tr><td>Tenant segments</td><td>VLAN 10 = VNI 10010 (10.10.10.0/24), VLAN 20 = VNI 10020 (10.10.20.0/24)</td></tr>
<tr><td>Hosts</td><td>H1 on LEAF1 and H2 on LEAF2 in VLAN 10; H3 on LEAF2 and H4 on LEAF3 in VLAN 20</td></tr>
</table>

<h3>Why do we need this at all?</h3>
<p>A classic campus network stretches a VLAN by trunking it across every switch in between. That makes one giant broadcast domain and relies on Spanning Tree, which blocks links. In a data center you want every uplink forwarding, so the links between leaf and spine are <b>routed</b>. But applications such as VM live migration still want the same subnet in two racks. The answer is to keep the network routed (the <b>underlay</b>) and build virtual Layer 2 segments on top (the <b>overlay</b>).</p>

<div class="eg"><p><b>Worked example.</b> H1 (10.10.10.11, LEAF1) pings H2 (10.10.10.12, LEAF2). Both are in VLAN 10. LEAF1 wraps H1's Ethernet frame in a VXLAN packet whose outer source is 10.255.1.11 and outer destination is 10.255.1.12, with VNI 10010 inside. The spines see an ordinary IP packet between two loopbacks and just route it. LEAF2 unwraps it and delivers the original frame to H2.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking the spines "know" about VLAN 10. They do not. A spine is not a VTEP in this design; it only needs IP reachability between leaf loopbacks.</p></div>

<div class="exam"><p><b>Exam trap.</b> VXLAN is the encapsulation (the data plane). It is not a control plane. The words "flood and learn" and "EVPN" describe two different ways to learn MAC addresses on the same VXLAN data plane.</p></div>

<div class="scn"><h4>The stretched VLAN that melted the core</h4><p>A retail company stretched VLAN 30 across four buildings with trunks. One loose cable in building C created a loop, STP reconverged badly, and broadcast storms stopped every point-of-sale terminal for forty minutes. The redesign kept all inter-building links routed and carried VLAN 30 as a VNI. The next loose cable only affected one rack, because the storm could not cross the routed boundary.</p><p><b>Lesson:</b> overlays contain failures that stretched VLANs spread.</p></div>

<div class="iv"><p class="q">"Why use VXLAN instead of just trunking VLANs between racks?"</p><p>Strong answer: trunking creates one big failure and broadcast domain and depends on STP, which blocks links. VXLAN keeps the leaf-spine links routed with ECMP, scales segment IDs from 4094 VLANs to about 16 million VNIs, and still lets a subnet exist in several racks.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VXLAN carries Layer 2 segments over a routed IP underlay.</li>
<li>Leaves are VTEPs; spines only route between loopbacks.</li>
<li>Our fabric: 2 spines, 3 leaves, VLAN 10 and 20 mapped to VNI 10010 and 10020.</li>
<li>VXLAN is the data plane; flood-and-learn or EVPN is how MACs are learned.</li>
<li>This module teaches the data plane; the next two add BGP EVPN and multi-homing.</li>
</ul></div>
`,hi:`
<p>Socho ek company ki teen office floors hain. Har floor ke apne desks hain, lekin finance team chahti hai ki "ek bada open room" jaisa feel ho: floor 1 par Priya aur floor 2 par Rahul aise kaam karein jaise saath baithe hon. Aap deewarein hata nahi sakte, isliye floors ke beech ek private tunnel system banate ho aur har floor ki reception ko kehte ho ki messages us tunnel se bhejo. <b>VXLAN</b> Ethernet ke liye wahi tunnel system hai: yeh Layer 2 segment (ek VLAN) ko routed IP network ke paar le jaata hai, taaki alag racks ke do servers sochein ki woh ek hi switch par hain.</p>

<div class="note"><p><b>Aap kya seekhoge.</b> Overlays kyun hote hain, VNI aur VTEP kya hain, routed underlay kaise taiyaar hota hai, static ingress replication ke saath flood-and-learn kaise kaam karta hai, IOS XE-style configuration, verification ladder aur sabse common faults. Yeh EVPN-VXLAN fabric ke teen modules mein pehla hai: <code>sre-vxlan</code> (data plane), <code>sre-evpn</code> (BGP control plane) aur <code>sre-esi</code> (multi-homing).</p></div>

<div class="note"><p><b>Prerequisites.</b> Aapko VLANs aur trunks, OSPF basics aur loopbacks, aur spine-leaf design ka idea pehle se aana chahiye. Agar kuch kamzor lage to pehle <code>dc-underlay</code> aur <code>dc-vxlan</code> modules revise karo. Yahan hum VXLAN header ki poori theory dobara nahi padhate; use reuse karte hain, IOS XE-style switches par apply karte hain aur is track ka poora troubleshooting method jodte hain.</p></div>

<h3>Har example mein use hone wala fabric</h3>
<p>Teeno modules ek hi chhote data center use karte hain. Do spines, teen leaves, chaar normal hosts. Is picture ko dimaag mein rakho, kyunki module ka har command output isi ko refer karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Spine-leaf fabric">
<rect x="150" y="15" width="130" height="40" rx="8" fill="#ddd6fe"/><text x="215" y="33" text-anchor="middle" class="svg-ink" font-size="12">SPINE1</text><text x="215" y="48" text-anchor="middle" class="svg-muted" font-size="12">Lo0 10.255.0.101</text>
<rect x="360" y="15" width="130" height="40" rx="8" fill="#ddd6fe"/><text x="425" y="33" text-anchor="middle" class="svg-ink" font-size="12">SPINE2</text><text x="425" y="48" text-anchor="middle" class="svg-muted" font-size="12">Lo0 10.255.0.102</text>
<rect x="30" y="130" width="140" height="44" rx="8" fill="#bae6fd"/><text x="100" y="149" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="100" y="165" text-anchor="middle" class="svg-muted" font-size="12">VTEP 10.255.1.11</text>
<rect x="250" y="130" width="140" height="44" rx="8" fill="#bae6fd"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">VTEP 10.255.1.12</text>
<rect x="470" y="130" width="140" height="44" rx="8" fill="#bae6fd"/><text x="540" y="149" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text><text x="540" y="165" text-anchor="middle" class="svg-muted" font-size="12">VTEP 10.255.1.13</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="215" y1="55" x2="100" y2="130"/><line x1="215" y1="55" x2="320" y2="130"/><line x1="215" y1="55" x2="540" y2="130"/><line x1="425" y1="55" x2="100" y2="130"/><line x1="425" y1="55" x2="320" y2="130"/><line x1="425" y1="55" x2="540" y2="130"/></g>
<rect x="40" y="214" width="120" height="30" rx="6" fill="#fed7aa"/><text x="100" y="233" text-anchor="middle" class="svg-ink" font-size="12">H1 VLAN10 .11</text>
<rect x="190" y="214" width="110" height="30" rx="6" fill="#fed7aa"/><text x="245" y="233" text-anchor="middle" class="svg-ink" font-size="12">H2 VLAN10 .12</text>
<rect x="330" y="214" width="110" height="30" rx="6" fill="#fed7aa"/><text x="385" y="233" text-anchor="middle" class="svg-ink" font-size="12">H3 VLAN20 .13</text>
<rect x="480" y="214" width="120" height="30" rx="6" fill="#fed7aa"/><text x="540" y="233" text-anchor="middle" class="svg-ink" font-size="12">H4 VLAN20 .14</text>
<g stroke="#64748b"><line x1="100" y1="174" x2="100" y2="214"/><line x1="300" y1="174" x2="245" y2="214"/><line x1="340" y1="174" x2="385" y2="214"/><line x1="540" y1="174" x2="540" y2="214"/></g>
</svg><p class="cap">Har leaf dono spines se juda hai. Spines sirf route karte hain; leaves VTEPs hain.</p></div>

<table class="cmp"><tr><th>Item</th><th>Value</th></tr>
<tr><td>Spine loopbacks (Lo0)</td><td>SPINE1 10.255.0.101, SPINE2 10.255.0.102</td></tr>
<tr><td>Leaf router-id loopbacks (Lo0)</td><td>10.255.0.11, .12, .13</td></tr>
<tr><td>Leaf VTEP loopbacks (Lo1)</td><td>10.255.1.11, .12, .13</td></tr>
<tr><td>Links</td><td>LEAFn se SPINE1 10.1.n.0/30 (spine .1, leaf .2); LEAFn se SPINE2 10.2.n.0/30</td></tr>
<tr><td>Tenant segments</td><td>VLAN 10 = VNI 10010 (10.10.10.0/24), VLAN 20 = VNI 10020 (10.10.20.0/24)</td></tr>
<tr><td>Hosts</td><td>H1 LEAF1 par aur H2 LEAF2 par VLAN 10 mein; H3 LEAF2 par aur H4 LEAF3 par VLAN 20 mein</td></tr>
</table>

<h3>Yeh sab chahiye hi kyun?</h3>
<p>Classic campus network VLAN ko beech ke har switch par trunk karke stretch karta hai. Isse ek giant broadcast domain banta hai aur Spanning Tree par dependency aati hai, jo links block kar deta hai. Data center mein aap chahte ho ki har uplink forward kare, isliye leaf aur spine ke beech ke links <b>routed</b> hote hain. Lekin VM live migration jaisi applications ko ab bhi do racks mein same subnet chahiye. Jawab hai: network ko routed rakho (<b>underlay</b>) aur uske upar virtual Layer 2 segments banao (<b>overlay</b>).</p>

<div class="eg"><p><b>Worked example.</b> H1 (10.10.10.11, LEAF1) H2 (10.10.10.12, LEAF2) ko ping karta hai. Dono VLAN 10 mein hain. LEAF1 H1 ke Ethernet frame ko VXLAN packet mein wrap karta hai jiska outer source 10.255.1.11 aur outer destination 10.255.1.12 hai, andar VNI 10010. Spines ko sirf do loopbacks ke beech ka normal IP packet dikhta hai aur woh use route kar dete hain. LEAF2 use unwrap karke original frame H2 ko deta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki spines VLAN 10 "jaante" hain. Aisa nahi hai. Is design mein spine VTEP nahi hai; use sirf leaf loopbacks ke beech IP reachability chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> VXLAN encapsulation hai (data plane). Yeh control plane nahi hai. "Flood and learn" aur "EVPN" same VXLAN data plane par MAC addresses seekhne ke do alag tareeke hain.</p></div>

<div class="scn"><h4>Stretched VLAN jisne core pighla diya</h4><p>Ek retail company ne VLAN 30 ko chaar buildings mein trunks se stretch kiya tha. Building C ki ek dheeli cable se loop ban gaya, STP bura reconverge hua, aur broadcast storm ne chalees minute tak har point-of-sale terminal band kar diya. Redesign mein saare inter-building links routed rakhe gaye aur VLAN 30 VNI ke roop mein gaya. Agli dheeli cable sirf ek rack ko affect karti, kyunki storm routed boundary paar nahi kar sakta tha.</p><p><b>Seekh:</b> overlays un failures ko contain karte hain jo stretched VLANs phaila dete hain.</p></div>

<div class="iv"><p class="q">"Racks ke beech VLANs trunk karne ki jagah VXLAN kyun?"</p><p>Strong answer: trunking ek bada failure aur broadcast domain banata hai aur STP par depend karta hai, jo links block karta hai. VXLAN leaf-spine links ko ECMP ke saath routed rakhta hai, segment IDs ko 4094 VLANs se lagbhag 16 million VNIs tak le jaata hai, aur phir bhi ek subnet ko kai racks mein rehne deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VXLAN Layer 2 segments ko routed IP underlay par carry karta hai.</li>
<li>Leaves VTEPs hain; spines sirf loopbacks ke beech route karte hain.</li>
<li>Hamara fabric: 2 spines, 3 leaves, VLAN 10 aur 20 ka VNI 10010 aur 10020 par mapping.</li>
<li>VXLAN data plane hai; MACs flood-and-learn ya EVPN se seekhe jaate hain.</li>
<li>Yeh module data plane sikhata hai; agle do mein BGP EVPN aur multi-homing aate hain.</li>
</ul></div>
`}};export{e as default};