var e={id:`why-overlays`,h:{en:`Why overlays: the problems VXLAN solves`,hi:`Overlays kyun: VXLAN kaunsi problems solve karta hai`},body:{en:`
<p>Think of a housing society that numbers flats with only two digits on the door plate. It works for 90 flats. The day the builder adds tower number twenty, the numbering runs out, two families get the same number, and the post starts reaching the wrong house. Classic VLANs have the same problem: the number field is too small for a modern multi-tenant data center. That is the first of several reasons the industry moved to <b>overlays</b>.</p>

<h3>Problem 1: the 4094 VLAN limit</h3>
<p>The 802.1Q tag carries a <b>12-bit VLAN ID</b>. 2<sup>12</sup> = 4096 values, but 0 and 4095 are reserved, so only <b>4094 VLANs</b> are usable, and Nexus switches reserve a further internal range (by default 3968–4095) for their own use. A cloud provider with thousands of customers, each wanting several isolated networks (web, app, database, backup), runs out quickly.</p>
<p>VXLAN replaces the VLAN number with a <b>24-bit VNI</b> (VXLAN Network Identifier). 2<sup>24</sup> = <b>16,777,216</b> values, about 16 million segments. The VLAN still exists, but only locally on the leaf, as the handle for the access port. On the wire between leaves, the VNI is the segment identity.</p>

<div class="eg"><p><b>Worked example.</b> A provider hosts 1,500 tenants, each with 4 networks. That is 6,000 segments, which is impossible with 4094 VLANs. With VXLAN, tenant 1 might use VNIs 10010–10013, tenant 2 uses 10020–10023, and so on. Each leaf only needs local VLANs for the tenants actually attached to it, so a leaf with 40 tenants uses about 160 local VLANs.</p></div>

<h3>Problem 2: Layer 2 must cross a routed fabric</h3>
<p>The spine-leaf fabric you built in the underlay module is routed: every uplink is a /31 with <code>no switchport</code>. Routing gives ECMP, fast convergence and no spanning tree. But some applications still need two servers in <b>the same subnet</b> on different racks: clusters that use Layer 2 heartbeats, legacy apps with hard-coded IPs, appliances that require adjacency. A routed link cannot carry a VLAN. An overlay can: it tunnels the Ethernet frame across the routed network.</p>

<h3>Problem 3: VM mobility</h3>
<p>A hypervisor can live-migrate a running virtual machine to another host with vMotion or a similar feature. The VM keeps its IP address, MAC address and gateway, so its network must exist on the destination host. If the destination host is on a different leaf in a different rack, the subnet must be available there too. Overlays make any subnet available on any leaf, without extending spanning tree across the building.</p>

<h3>Problem 4: keeping spanning tree out of the fabric</h3>
<p>Large Layer 2 domains are fragile. Spanning tree blocks redundant links, converges slowly after some failures, and a single loop or broadcast storm can flood every switch that carries the VLAN. With VXLAN, spanning tree stays at the edge of each leaf (on access ports, typically as edge ports with BPDU Guard). The fabric itself is routed, and <b>BPDUs are not carried across the VXLAN tunnel</b>, so each leaf remains its own small, safe Layer 2 island.</p>

<h3>Problem 5: multitenancy and address overlap</h3>
<p>Two customers may both want 10.0.0.0/24. In an overlay each gets its own VNI, and in the routed case its own VRF, so their traffic never mixes even with identical addresses. The underlay only ever sees VTEP-to-VTEP packets, so tenants cannot see the underlay and cannot see each other.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Five problems solved by overlays">
<rect x="220" y="90" width="200" height="50" rx="10" fill="#fde68a"/><text x="320" y="113" text-anchor="middle" class="svg-ink" font-size="14">VXLAN overlay</text><text x="320" y="131" text-anchor="middle" class="svg-muted" font-size="12">24-bit VNI over routed IP</text>
<rect x="20" y="15" width="170" height="36" rx="6" fill="#bae6fd"/><text x="105" y="38" text-anchor="middle" class="svg-ink" font-size="12">4094 VLAN limit</text>
<rect x="450" y="15" width="170" height="36" rx="6" fill="#bae6fd"/><text x="535" y="38" text-anchor="middle" class="svg-ink" font-size="12">L2 over routed fabric</text>
<rect x="20" y="180" width="170" height="36" rx="6" fill="#bbf7d0"/><text x="105" y="203" text-anchor="middle" class="svg-ink" font-size="12">VM mobility</text>
<rect x="450" y="180" width="170" height="36" rx="6" fill="#bbf7d0"/><text x="535" y="203" text-anchor="middle" class="svg-ink" font-size="12">No STP in the fabric</text>
<rect x="235" y="180" width="170" height="36" rx="6" fill="#ddd6fe"/><text x="320" y="203" text-anchor="middle" class="svg-ink" font-size="12">Multitenancy</text>
<line x1="190" y1="40" x2="240" y2="95" stroke="#64748b" stroke-width="2"/><line x1="450" y1="40" x2="400" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="190" y1="190" x2="240" y2="135" stroke="#64748b" stroke-width="2"/><line x1="450" y1="190" x2="400" y2="135" stroke="#64748b" stroke-width="2"/><line x1="320" y1="180" x2="320" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">One mechanism, five problems solved: scale, Layer 2 reach, mobility, stability and isolation.</p></div>

<h3>Why UDP and IP?</h3>
<p>Because the underlay already knows how to route IP perfectly: ECMP, fast convergence, simple troubleshooting with ping and traceroute. By putting frames inside UDP, VXLAN also gains <b>entropy</b>: the UDP source port is derived from a hash of the inner frame, so different inner flows get different outer source ports and are spread across all spines by ECMP. You will see this in detail in the next chapter.</p>

<h3>Other overlay encapsulations, briefly</h3>
<table class="cmp"><tr><th>Encapsulation</th><th>Transport</th><th>Segment ID</th><th>Where you meet it</th></tr>
<tr><td><b>VXLAN</b> (RFC 7348)</td><td>UDP 4789</td><td>24-bit VNI</td><td>Nexus, most DC switches, hypervisors; the industry default with EVPN</td></tr>
<tr><td><b>NVGRE</b></td><td>GRE</td><td>24-bit VSID</td><td>Older Microsoft Hyper-V designs; poor ECMP entropy because GRE has no ports; largely obsolete</td></tr>
<tr><td><b>Geneve</b> (RFC 8926)</td><td>UDP 6081</td><td>24-bit VNI plus extensible options</td><td>Software overlays such as VMware NSX and Open vSwitch based clouds</td></tr>
<tr><td><b>STT</b></td><td>TCP-like header</td><td>64-bit context</td><td>Historical, early NSX; no longer used</td></tr>
</table>
<p>For CCNP Data Center and for Nexus hardware, VXLAN is the one that matters.</p>

<div class="warn"><p><b>Common mistake.</b> Believing that VXLAN removes the VLAN completely. On a Nexus leaf in this design the access port is still in a VLAN, and <code>vn-segment</code> ties that local VLAN to a VNI. Two leaves can even use different local VLAN numbers for the same VNI; what must match everywhere is the VNI.</p></div>

<div class="exam"><p><b>Exam trap.</b> "How many segments does VXLAN support?" The answer is about 16 million (24-bit VNI), not 4096 and not 16,000. And "which field extends the VLAN space" is the <b>VNI in the VXLAN header</b>, not the UDP port or the outer 802.1Q tag.</p></div>

<div class="scn"><h4>The provider that ran out of VLANs</h4><p>A regional cloud provider grew to 1,100 customers, each with three to five VLANs, on a large Layer 2 design with VLAN pruning. Provisioning started failing: no free VLAN IDs were left in the pod, and a broadcast storm caused by a looped customer appliance affected every rack that carried that VLAN. The redesign moved to a routed spine-leaf underlay with VXLAN. Each customer network got its own VNI; local VLANs were reused per leaf. Two months later another customer created a loop on its own server port; BPDU Guard shut the port, and because the fabric was routed, the storm never left that leaf.</p><p><b>Lesson:</b> the VNI solves scale, and the routed underlay solves blast radius. You need both.</p></div>

<div class="iv"><p class="q">"Why do we need VXLAN in a data center when we already have VLANs?"</p><p>Strong answer: VLANs have a 12-bit ID (4094 usable), cannot cross a routed spine-leaf fabric, and stretching them needs spanning tree with blocked links and large failure domains. VXLAN gives a 24-bit VNI (about 16 million segments), carries Layer 2 over routed IP with full ECMP, keeps STP local to each leaf, and supports VM mobility and multitenancy. Close by naming the control plane: flood-and-learn at first, BGP EVPN in production.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VLAN ID = 12 bits (4094 usable); VNI = 24 bits (about 16 million).</li>
<li>Overlays carry Layer 2 across a routed fabric, enabling VM mobility and same-subnet clusters in different racks.</li>
<li>STP stays local to each leaf; BPDUs do not cross the VXLAN tunnel.</li>
<li>UDP encapsulation gives ECMP entropy through a hashed source port.</li>
<li>NVGRE and Geneve are alternatives; VXLAN is the standard on Nexus and with EVPN.</li>
</ul></div>
`,hi:`
<p>Ek housing society socho jo flats ko door plate par sirf do digits se number karti hai. 90 flats tak yeh chal jaata hai. Jis din builder tower number bees jodta hai, numbering khatam ho jaati hai, do families ko same number mil jaata hai, aur daak galat ghar pahunchne lagti hai. Classic VLANs ki bhi yahi problem hai: modern multi-tenant data center ke liye number field bahut chhota hai. Industry ke <b>overlays</b> par shift hone ki kai wajahon mein yeh pehli hai.</p>

<h3>Problem 1: 4094 VLAN ki limit</h3>
<p>802.1Q tag ek <b>12-bit VLAN ID</b> carry karta hai. 2<sup>12</sup> = 4096 values, lekin 0 aur 4095 reserved hain, isliye sirf <b>4094 VLANs</b> usable hain, aur Nexus switches apne internal use ke liye ek aur range (default mein 3968–4095) reserve karte hain. Hazaaron customers wala cloud provider, jismein har customer ko kai isolated networks chahiye (web, app, database, backup), bahut jaldi VLANs khatam kar deta hai.</p>
<p>VXLAN VLAN number ki jagah <b>24-bit VNI</b> (VXLAN Network Identifier) use karta hai. 2<sup>24</sup> = <b>16,777,216</b> values, lagbhag 16 million segments. VLAN ab bhi exist karta hai, lekin sirf leaf par local, access port ke handle ki tarah. Leaves ke beech wire par segment ki pehchaan VNI hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek provider 1,500 tenants host karta hai, har ek ke 4 networks. Yeh 6,000 segments hue, jo 4094 VLANs ke saath impossible hai. VXLAN ke saath tenant 1 VNIs 10010–10013 use kar sakta hai, tenant 2 10020–10023, aur aise hi aage. Har leaf ko sirf un tenants ke local VLANs chahiye jo us par actually jude hain, isliye 40 tenants wala leaf lagbhag 160 local VLANs use karta hai.</p></div>

<h3>Problem 2: Layer 2 ko routed fabric paar karna hai</h3>
<p>Underlay module mein jo spine-leaf fabric aapne banaya woh routed hai: har uplink <code>no switchport</code> wala /31 hai. Routing se ECMP, fast convergence aur bina spanning tree ka network milta hai. Lekin kuch applications ko ab bhi alag racks par do servers <b>same subnet</b> mein chahiye: Layer 2 heartbeats use karne wale clusters, hard-coded IPs wale legacy apps, adjacency maangne wale appliances. Routed link VLAN carry nahi kar sakta. Overlay kar sakta hai: woh Ethernet frame ko routed network ke paar tunnel karta hai.</p>

<h3>Problem 3: VM mobility</h3>
<p>Hypervisor vMotion ya aise hi feature se chalti hui virtual machine ko doosre host par live-migrate kar sakta hai. VM apna IP address, MAC address aur gateway rakhti hai, isliye uska network destination host par bhi exist karna chahiye. Agar destination host doosre rack mein doosre leaf par hai, to subnet wahan bhi available hona chahiye. Overlays kisi bhi subnet ko kisi bhi leaf par available bana dete hain, bina spanning tree ko poori building mein failaye.</p>

<h3>Problem 4: spanning tree ko fabric se bahar rakhna</h3>
<p>Bade Layer 2 domains nazuk hote hain. Spanning tree redundant links block karta hai, kuch failures ke baad dheere converge hota hai, aur ek loop ya broadcast storm VLAN carry karne wale har switch ko flood kar sakta hai. VXLAN ke saath spanning tree har leaf ke edge par rehta hai (access ports par, aam taur par BPDU Guard ke saath edge ports ki tarah). Fabric khud routed hai, aur <b>BPDUs VXLAN tunnel ke paar carry nahi hote</b>, isliye har leaf apna chhota, safe Layer 2 island bana rehta hai.</p>

<h3>Problem 5: multitenancy aur address overlap</h3>
<p>Do customers dono 10.0.0.0/24 chahte ho sakte hain. Overlay mein har ek ko apna VNI milta hai, aur routed case mein apna VRF, isliye identical addresses ke saath bhi unka traffic kabhi mix nahi hota. Underlay ko sirf VTEP-to-VTEP packets dikhte hain, isliye tenants underlay ko nahi dekh sakte aur ek doosre ko bhi nahi.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Overlays dwara solve hone wali paanch problems">
<rect x="220" y="90" width="200" height="50" rx="10" fill="#fde68a"/><text x="320" y="113" text-anchor="middle" class="svg-ink" font-size="14">VXLAN overlay</text><text x="320" y="131" text-anchor="middle" class="svg-muted" font-size="12">routed IP par 24-bit VNI</text>
<rect x="20" y="15" width="170" height="36" rx="6" fill="#bae6fd"/><text x="105" y="38" text-anchor="middle" class="svg-ink" font-size="12">4094 VLAN limit</text>
<rect x="450" y="15" width="170" height="36" rx="6" fill="#bae6fd"/><text x="535" y="38" text-anchor="middle" class="svg-ink" font-size="12">Routed fabric par L2</text>
<rect x="20" y="180" width="170" height="36" rx="6" fill="#bbf7d0"/><text x="105" y="203" text-anchor="middle" class="svg-ink" font-size="12">VM mobility</text>
<rect x="450" y="180" width="170" height="36" rx="6" fill="#bbf7d0"/><text x="535" y="203" text-anchor="middle" class="svg-ink" font-size="12">Fabric mein STP nahi</text>
<rect x="235" y="180" width="170" height="36" rx="6" fill="#ddd6fe"/><text x="320" y="203" text-anchor="middle" class="svg-ink" font-size="12">Multitenancy</text>
<line x1="190" y1="40" x2="240" y2="95" stroke="#64748b" stroke-width="2"/><line x1="450" y1="40" x2="400" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="190" y1="190" x2="240" y2="135" stroke="#64748b" stroke-width="2"/><line x1="450" y1="190" x2="400" y2="135" stroke="#64748b" stroke-width="2"/><line x1="320" y1="180" x2="320" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek mechanism, paanch problems solve: scale, Layer 2 reach, mobility, stability aur isolation.</p></div>

<h3>UDP aur IP hi kyun?</h3>
<p>Kyunki underlay pehle se IP ko perfectly route karna jaanta hai: ECMP, fast convergence, ping aur traceroute se simple troubleshooting. Frames ko UDP ke andar daal kar VXLAN ko <b>entropy</b> bhi milti hai: UDP source port inner frame ke hash se nikalta hai, isliye alag inner flows ko alag outer source ports milte hain aur ECMP unhe saare spines par baant deta hai. Yeh aap agle chapter mein detail mein dekhoge.</p>

<h3>Doosre overlay encapsulations, short mein</h3>
<table class="cmp"><tr><th>Encapsulation</th><th>Transport</th><th>Segment ID</th><th>Kahan milta hai</th></tr>
<tr><td><b>VXLAN</b> (RFC 7348)</td><td>UDP 4789</td><td>24-bit VNI</td><td>Nexus, zyada tar DC switches, hypervisors; EVPN ke saath industry default</td></tr>
<tr><td><b>NVGRE</b></td><td>GRE</td><td>24-bit VSID</td><td>Purane Microsoft Hyper-V designs; GRE mein ports nahi hote isliye ECMP entropy kharab; zyada tar obsolete</td></tr>
<tr><td><b>Geneve</b> (RFC 8926)</td><td>UDP 6081</td><td>24-bit VNI plus extensible options</td><td>VMware NSX aur Open vSwitch based clouds jaise software overlays</td></tr>
<tr><td><b>STT</b></td><td>TCP jaisa header</td><td>64-bit context</td><td>Historical, early NSX; ab use nahi hota</td></tr>
</table>
<p>CCNP Data Center aur Nexus hardware ke liye VXLAN hi matter karta hai.</p>

<div class="warn"><p><b>Common galti.</b> Yeh maanna ki VXLAN VLAN ko poori tarah hata deta hai. Is design mein Nexus leaf par access port ab bhi ek VLAN mein hai, aur <code>vn-segment</code> us local VLAN ko VNI se jodta hai. Do leaves same VNI ke liye alag local VLAN numbers bhi use kar sakte hain; har jagah jo match hona chahiye woh VNI hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "VXLAN kitne segments support karta hai?" Answer lagbhag 16 million hai (24-bit VNI), na ki 4096 aur na 16,000. Aur "kaunsa field VLAN space extend karta hai" ka answer <b>VXLAN header ka VNI</b> hai, UDP port ya outer 802.1Q tag nahi.</p></div>

<div class="scn"><h4>Woh provider jiske VLANs khatam ho gaye</h4><p>Ek regional cloud provider 1,100 customers tak badh gaya, har ek ke teen se paanch VLANs, ek bade Layer 2 design par VLAN pruning ke saath. Provisioning fail hone laga: pod mein koi free VLAN ID nahi bacha, aur ek customer ke looped appliance se hue broadcast storm ne us VLAN ko carry karne wale har rack ko affect kiya. Redesign mein routed spine-leaf underlay aur VXLAN aaya. Har customer network ko apna VNI mila; local VLANs har leaf par reuse hue. Do mahine baad ek aur customer ne apne server port par loop bana diya; BPDU Guard ne port band kar diya, aur fabric routed hone ki wajah se storm us leaf se bahar hi nahi gaya.</p><p><b>Seekh:</b> VNI scale solve karta hai, aur routed underlay blast radius solve karta hai. Dono chahiye.</p></div>

<div class="iv"><p class="q">"Jab VLANs pehle se hain to data center mein VXLAN kyun chahiye?"</p><p>Strong answer: VLANs ka ID 12-bit hai (4094 usable), woh routed spine-leaf fabric paar nahi kar sakte, aur unhe stretch karne ke liye blocked links aur bade failure domains wala spanning tree chahiye. VXLAN 24-bit VNI deta hai (lagbhag 16 million segments), full ECMP ke saath routed IP par Layer 2 carry karta hai, STP ko har leaf tak local rakhta hai, aur VM mobility aur multitenancy support karta hai. Control plane ka naam le kar khatam karo: shuru mein flood-and-learn, production mein BGP EVPN.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VLAN ID = 12 bits (4094 usable); VNI = 24 bits (lagbhag 16 million).</li>
<li>Overlays routed fabric ke paar Layer 2 carry karte hain, jisse VM mobility aur alag racks mein same-subnet clusters possible hote hain.</li>
<li>STP har leaf tak local rehta hai; BPDUs VXLAN tunnel paar nahi karte.</li>
<li>UDP encapsulation hashed source port se ECMP entropy deta hai.</li>
<li>NVGRE aur Geneve alternatives hain; Nexus par aur EVPN ke saath standard VXLAN hai.</li>
</ul></div>
`}};export{e as default};