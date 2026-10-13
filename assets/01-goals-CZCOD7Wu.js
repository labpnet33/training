var e={id:`goals`,h:{en:`Why multi-homing: goals, prerequisites and the dual-attached switch`,hi:`Multi-homing kyun: goals, prerequisites aur dual-attached switch`},body:{en:`
<p>A house with only one front door is fine until the door jams. A house with two doors keeps working when one fails, and a smart family uses both doors at the same time to avoid queues. A server or switch connected to <b>two leaves</b> is that house. In the fabric so far, each host plugged into just one leaf, so a dead leaf or cable cut that host off completely. <b>EVPN multi-homing</b> lets one device connect to two (or more) leaves with a port-channel, using both links at once, while the fabric itself behaves as if it were one logical connection.</p>

<div class="note"><p><b>What you will learn.</b> What an Ethernet Segment and an ESI are, route types 1 and 4, designated forwarder (DF) election, all-active versus single-active, aliasing and fast convergence, how to configure and verify it on the lab fabric, and the split-brain failure modes with a troubleshooting method. This is the third module of the EVPN-VXLAN fabric.</p></div>

<div class="note"><p><b>Prerequisites.</b> You should have completed <code>sre-vxlan</code> and <code>sre-evpn</code>: VNIs, VTEPs, BGP l2vpn evpn with the spines as route reflectors, route types 2, 3 and 5, RD and RT. You should also know LACP port-channels from the switching modules. This module does not repeat classic vPC or MLAG in detail (see the <code>dc-vpc</code> module); it explains the standards-based EVPN alternative and compares them.</p></div>

<h3>The new devices</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Multi-homed switch">
<rect x="130" y="15" width="130" height="38" rx="8" fill="#ddd6fe"/><text x="195" y="39" text-anchor="middle" class="svg-ink" font-size="12">SPINE1 (RR)</text>
<rect x="380" y="15" width="130" height="38" rx="8" fill="#ddd6fe"/><text x="445" y="39" text-anchor="middle" class="svg-ink" font-size="12">SPINE2 (RR)</text>
<rect x="60" y="100" width="140" height="46" rx="8" fill="#bae6fd"/><text x="130" y="120" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="130" y="136" text-anchor="middle" class="svg-muted" font-size="12">Po10 member Gi1/0/6</text>
<rect x="260" y="100" width="140" height="46" rx="8" fill="#bae6fd"/><text x="330" y="120" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text><text x="330" y="136" text-anchor="middle" class="svg-muted" font-size="12">Po10 member Gi1/0/6</text>
<rect x="470" y="100" width="140" height="46" rx="8" fill="#bae6fd"/><text x="540" y="125" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text>
<g stroke="#64748b" stroke-width="1.4"><line x1="195" y1="53" x2="130" y2="100"/><line x1="195" y1="53" x2="330" y2="100"/><line x1="195" y1="53" x2="540" y2="100"/><line x1="445" y1="53" x2="130" y2="100"/><line x1="445" y1="53" x2="330" y2="100"/><line x1="445" y1="53" x2="540" y2="100"/></g>
<rect x="150" y="180" width="160" height="40" rx="8" fill="#fde68a"/><text x="230" y="204" text-anchor="middle" class="svg-ink" font-size="12">SW-CE (LACP Po10)</text>
<rect x="360" y="185" width="140" height="32" rx="6" fill="#fed7aa"/><text x="430" y="206" text-anchor="middle" class="svg-ink" font-size="12">H5 10.10.10.15</text>
<g stroke="#64748b" stroke-width="2"><line x1="130" y1="146" x2="200" y2="180"/><line x1="330" y1="146" x2="260" y2="180"/><line x1="310" y1="200" x2="360" y2="200"/></g>
</svg><p class="cap">SW-CE has one port-channel whose two links go to two different leaves. Behind SW-CE sits H5 in VLAN 10.</p></div>

<h3>The problems multi-homing solves</h3>
<table class="cmp"><tr><th>Problem</th><th>Answer in EVPN</th></tr>
<tr><td>A leaf or cable failure isolates a host</td><td>Second link to a second leaf keeps the host connected</td></tr>
<tr><td>Half of the bandwidth idle</td><td>All-active: both links carry traffic</td></tr>
<tr><td>Vendor-specific pairing protocols (vPC, MLAG)</td><td>Standards-based control plane: BGP route types 1 and 4</td></tr>
<tr><td>Remote leaves send everything to one of the two</td><td>Aliasing: remote leaves load-balance across both</td></tr>
<tr><td>Duplicate BUM copies to the dual-homed device</td><td>DF election: only one leaf forwards BUM to the segment</td></tr>
<tr><td>Slow convergence when a leaf dies</td><td>Mass withdraw: a single type-1 route withdrawal fixes all MACs</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> H5 (MAC 0050.56aa.0005, IP 10.10.10.15, VLAN 10) hangs behind SW-CE. SW-CE hashes each flow over its two uplinks, so H5's frames sometimes enter LEAF1 and sometimes LEAF2. Both leaves are attached to the same <b>Ethernet Segment</b>, and both advertise H5's MAC. A remote leaf (LEAF3) installs the MAC with <b>two</b> next hops, 10.255.1.11 and 10.255.1.12, and spreads traffic across them.</p></div>

<h3>The five ideas of the module</h3>
<ol>
<li>An <b>Ethernet Segment (ES)</b> is the set of links that connect one device to the fabric; its identifier is the <b>ESI</b>.</li>
<li>Type 4 finds the other leaves on the segment; type 1 supports fast convergence and aliasing.</li>
<li>One leaf per VLAN is elected <b>DF</b> to forward BUM toward the segment.</li>
<li>All-active uses every link; single-active uses one.</li>
<li>Misconfigured ESIs and DF disagreements create <b>split-brain</b> symptoms: duplicate BUM, no aliasing, traffic black holes.</li>
</ol>

<div class="warn"><p><b>Common mistake.</b> Treating this as just "an LACP port-channel on two switches". The port-channel is local on each leaf; the fabric coordination (ESI, DF, aliasing) is done by BGP. Both parts must be right.</p></div>

<div class="exam"><p><b>Exam trap.</b> EVPN multi-homing does not need a peer-link between the leaves. That is the main difference from vPC/MLAG. The leaves coordinate through BGP over the fabric.</p></div>

<div class="scn"><h4>The cable that took a rack offline</h4><p>An e-commerce team ran servers single-attached to one leaf. A technician replacing a transceiver pulled the wrong cable and a whole rack (40 servers) lost connectivity for 15 minutes. After the redesign, each rack used a port-channel to two leaves. The next time the same mistake happened, nobody noticed; traffic simply moved to the other link in under a second.</p><p><b>Lesson:</b> multi-homing converts hardware incidents into non-events.</p></div>

<div class="iv"><p class="q">"Why would you use EVPN multi-homing instead of vPC?"</p><p>Strong answer: it is standards-based (RFC 7432), vendor-interoperable, needs no dedicated peer-link, scales beyond two leaves, and is coordinated entirely by BGP. All-active mode uses both links, and aliasing and mass withdraw give load balancing and fast failover.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One device, two leaves, one logical bundle: the Ethernet Segment.</li>
<li>BGP coordinates the leaves; no peer-link is needed.</li>
<li>Remote leaves see two next hops (aliasing).</li>
<li>Misconfiguration shows up as split-brain symptoms.</li>
</ul></div>
`,hi:`
<p>Sirf ek front door wala ghar tab tak theek hai jab tak darwaza jam na ho jaaye. Do darwaze wala ghar ek fail hone par bhi chalta hai, aur samajhdar parivar queue se bachne ke liye dono darwaze ek saath use karta hai. <b>Do leaves</b> se connected server ya switch wahi ghar hai. Ab tak fabric mein har host sirf ek leaf mein plugged tha, isliye leaf ya cable fail hone par woh host poori tarah cut ho jaata tha. <b>EVPN multi-homing</b> ek device ko port-channel se do (ya zyada) leaves se connect karne deta hai, dono links ek saath use karke, jabki fabric aise behave karta hai jaise woh ek logical connection ho.</p>

<div class="note"><p><b>Aap kya seekhoge.</b> Ethernet Segment aur ESI kya hain, route types 1 aur 4, designated forwarder (DF) election, all-active versus single-active, aliasing aur fast convergence, lab fabric par ise configure aur verify kaise karein, aur split-brain failure modes troubleshooting method ke saath. Yeh EVPN-VXLAN fabric ka teesra module hai.</p></div>

<div class="note"><p><b>Prerequisites.</b> Aapne <code>sre-vxlan</code> aur <code>sre-evpn</code> complete kiye hone chahiye: VNIs, VTEPs, spines ko route reflector bana kar BGP l2vpn evpn, route types 2, 3 aur 5, RD aur RT. Aapko switching modules se LACP port-channels bhi aane chahiye. Yeh module classic vPC ya MLAG ko detail mein dobara nahi padhata (<code>dc-vpc</code> module dekho); yeh standards-based EVPN alternative samjhata hai aur dono compare karta hai.</p></div>

<h3>Naye devices</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Multi-homed switch">
<rect x="130" y="15" width="130" height="38" rx="8" fill="#ddd6fe"/><text x="195" y="39" text-anchor="middle" class="svg-ink" font-size="12">SPINE1 (RR)</text>
<rect x="380" y="15" width="130" height="38" rx="8" fill="#ddd6fe"/><text x="445" y="39" text-anchor="middle" class="svg-ink" font-size="12">SPINE2 (RR)</text>
<rect x="60" y="100" width="140" height="46" rx="8" fill="#bae6fd"/><text x="130" y="120" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="130" y="136" text-anchor="middle" class="svg-muted" font-size="12">Po10 member Gi1/0/6</text>
<rect x="260" y="100" width="140" height="46" rx="8" fill="#bae6fd"/><text x="330" y="120" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text><text x="330" y="136" text-anchor="middle" class="svg-muted" font-size="12">Po10 member Gi1/0/6</text>
<rect x="470" y="100" width="140" height="46" rx="8" fill="#bae6fd"/><text x="540" y="125" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text>
<g stroke="#64748b" stroke-width="1.4"><line x1="195" y1="53" x2="130" y2="100"/><line x1="195" y1="53" x2="330" y2="100"/><line x1="195" y1="53" x2="540" y2="100"/><line x1="445" y1="53" x2="130" y2="100"/><line x1="445" y1="53" x2="330" y2="100"/><line x1="445" y1="53" x2="540" y2="100"/></g>
<rect x="150" y="180" width="160" height="40" rx="8" fill="#fde68a"/><text x="230" y="204" text-anchor="middle" class="svg-ink" font-size="12">SW-CE (LACP Po10)</text>
<rect x="360" y="185" width="140" height="32" rx="6" fill="#fed7aa"/><text x="430" y="206" text-anchor="middle" class="svg-ink" font-size="12">H5 10.10.10.15</text>
<g stroke="#64748b" stroke-width="2"><line x1="130" y1="146" x2="200" y2="180"/><line x1="330" y1="146" x2="260" y2="180"/><line x1="310" y1="200" x2="360" y2="200"/></g>
</svg><p class="cap">SW-CE ka ek port-channel hai jiske do links do alag leaves ko jaate hain. SW-CE ke peeche H5 VLAN 10 mein hai.</p></div>

<h3>Multi-homing kaunsi problems solve karta hai</h3>
<table class="cmp"><tr><th>Problem</th><th>EVPN mein jawab</th></tr>
<tr><td>Leaf ya cable failure host ko isolate karta hai</td><td>Doosre leaf ka doosra link host ko connected rakhta hai</td></tr>
<tr><td>Aadhi bandwidth idle</td><td>All-active: dono links traffic carry karte hain</td></tr>
<tr><td>Vendor-specific pairing protocols (vPC, MLAG)</td><td>Standards-based control plane: BGP route types 1 aur 4</td></tr>
<tr><td>Remote leaves sab kuch do mein se ek ko bhejte hain</td><td>Aliasing: remote leaves dono par load-balance karte hain</td></tr>
<tr><td>Dual-homed device ko duplicate BUM copies</td><td>DF election: sirf ek leaf segment ko BUM forward karta hai</td></tr>
<tr><td>Leaf marne par slow convergence</td><td>Mass withdraw: ek type-1 withdrawal sab MACs theek kar deta hai</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> H5 (MAC 0050.56aa.0005, IP 10.10.10.15, VLAN 10) SW-CE ke peeche hai. SW-CE har flow ko apne do uplinks par hash karta hai, isliye H5 ke frames kabhi LEAF1 mein aur kabhi LEAF2 mein jaate hain. Dono leaves ek hi <b>Ethernet Segment</b> se attached hain, aur dono H5 ka MAC advertise karte hain. Remote leaf (LEAF3) MAC ko <b>do</b> next hops, 10.255.1.11 aur 10.255.1.12, ke saath install karta hai aur traffic dono par baant deta hai.</p></div>

<h3>Module ke paanch ideas</h3>
<ol>
<li><b>Ethernet Segment (ES)</b> woh links ka set hai jo ek device ko fabric se jodta hai; uska identifier <b>ESI</b> hai.</li>
<li>Type 4 segment ke doosre leaves dhoondhta hai; type 1 fast convergence aur aliasing support karta hai.</li>
<li>Har VLAN ke liye ek leaf <b>DF</b> elect hota hai jo segment ki taraf BUM forward karta hai.</li>
<li>All-active har link use karta hai; single-active ek.</li>
<li>Galat ESIs aur DF disagreements <b>split-brain</b> symptoms banate hain: duplicate BUM, aliasing nahi, traffic black holes.</li>
</ol>

<div class="warn"><p><b>Common galti.</b> Ise sirf "do switches par LACP port-channel" samajhna. Port-channel har leaf par local hai; fabric coordination (ESI, DF, aliasing) BGP karta hai. Dono hisse sahi hone chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> EVPN multi-homing ko leaves ke beech peer-link nahi chahiye. Yahi vPC/MLAG se main fark hai. Leaves fabric ke upar BGP se coordinate karte hain.</p></div>

<div class="scn"><h4>Cable jo poora rack offline kar gaya</h4><p>Ek e-commerce team ke servers ek hi leaf se single-attached the. Transceiver badalte hue technician ne galat cable kheench di aur poora rack (40 servers) 15 minute connectivity kho baitha. Redesign ke baad har rack do leaves ko port-channel use karta tha. Agli baar wahi galti hui to kisi ko pata bhi nahi chala; traffic ek second se kam mein doosre link par chala gaya.</p><p><b>Seekh:</b> multi-homing hardware incidents ko non-events bana deta hai.</p></div>

<div class="iv"><p class="q">"vPC ki jagah EVPN multi-homing kyun use karoge?"</p><p>Strong answer: yeh standards-based (RFC 7432) hai, vendor-interoperable hai, dedicated peer-link nahi chahiye, do leaves se zyada scale karta hai, aur poori tarah BGP se coordinate hota hai. All-active mode dono links use karta hai, aur aliasing aur mass withdraw load balancing aur fast failover dete hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek device, do leaves, ek logical bundle: Ethernet Segment.</li>
<li>BGP leaves ko coordinate karta hai; peer-link nahi chahiye.</li>
<li>Remote leaves do next hops dekhte hain (aliasing).</li>
<li>Misconfiguration split-brain symptoms ke roop mein dikhta hai.</li>
</ul></div>
`}};export{e as default};