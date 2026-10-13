var e={id:`goals`,h:{en:`The underlay: what you will learn and why it matters`,hi:`Underlay: aap kya seekhoge aur yeh kyun zaroori hai`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to design, configure, verify and troubleshoot the <b>routed underlay</b> of a Cisco Nexus spine-leaf fabric. You will plan loopbacks and point-to-point addresses, run OSPF (and understand IS-IS and eBGP as alternatives), prove that every leaf reaches every other leaf over <b>all</b> spines with ECMP, tune convergence with BFD, build a multicast underlay for VXLAN BUM traffic, and fix the classic faults: MTU mismatches, OSPF stuck states, missing loopbacks and the "one spine is idle" ticket.</p>
<p><b>Prerequisites.</b> You should know IPv4 subnetting (including /31 and /32), what a routing table is, and basic OSPF ideas (neighbours, areas, cost). You should have met the spine-leaf picture in the data center introduction module. No VXLAN knowledge is required yet: this module builds the road that VXLAN will later drive on.</p>

<h3>An analogy: roads first, delivery vans later</h3>
<p>Imagine a courier company that wants to deliver sealed boxes between warehouses in a city. Before a single box moves, the city needs <b>roads</b> between every warehouse, <b>addresses</b> painted on every warehouse gate, and several parallel roads so that one blocked road does not stop deliveries. The courier company (the overlay) does not care how the roads are built; it only needs every gate address to be reachable, quickly and by more than one route.</p>
<p>In a data center fabric the <b>underlay</b> is those roads and addresses. It is the plain IP network between the switches: routed links, loopback addresses and a routing protocol. The <b>overlay</b> (VXLAN, and later BGP EVPN) is the courier: it wraps server traffic in sealed "boxes" (encapsulated packets) and sends them from one leaf to another across the underlay.</p>

<h3>Key terms</h3>
<dl class="terms">
<dt>Underlay</dt><dd>The routed network of spines and leaves that carries packets between switch loopbacks. It knows nothing about tenants, VLANs or VMs.</dd>
<dt>Overlay</dt><dd>A virtual network built on top of the underlay using tunnels, for example VXLAN.</dd>
<dt>VTEP</dt><dd>VXLAN Tunnel End Point: the leaf function that encapsulates and decapsulates VXLAN. Its address is a loopback that the underlay must advertise.</dd>
<dt>Loopback</dt><dd>A virtual interface that is always up while the switch is up. Used for the router-ID, BGP peering and VTEP source.</dd>
<dt>ECMP</dt><dd>Equal-cost multipath: installing several best paths to the same prefix and spreading flows across them.</dd>
<dt>IGP</dt><dd>Interior gateway protocol, such as OSPF or IS-IS, used inside one organisation.</dd>
</dl>

<h3>The underlay's job in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Underlay connects leaf loopbacks through all spines">
<rect x="150" y="15" width="130" height="40" rx="6" fill="#ddd6fe"/><text x="215" y="34" text-anchor="middle" class="svg-ink" font-size="13">SPINE1</text><text x="215" y="49" text-anchor="middle" class="svg-muted" font-size="12">lo0 10.255.0.11</text>
<rect x="360" y="15" width="130" height="40" rx="6" fill="#ddd6fe"/><text x="425" y="34" text-anchor="middle" class="svg-ink" font-size="13">SPINE2</text><text x="425" y="49" text-anchor="middle" class="svg-muted" font-size="12">lo0 10.255.0.12</text>
<rect x="60" y="165" width="150" height="48" rx="6" fill="#bae6fd"/><text x="135" y="184" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text><text x="135" y="203" text-anchor="middle" class="svg-muted" font-size="12">VTEP 10.254.0.1</text>
<rect x="430" y="165" width="150" height="48" rx="6" fill="#bae6fd"/><text x="505" y="184" text-anchor="middle" class="svg-ink" font-size="13">LEAF2</text><text x="505" y="203" text-anchor="middle" class="svg-muted" font-size="12">VTEP 10.254.0.2</text>
<line x1="215" y1="55" x2="120" y2="165" stroke="#64748b" stroke-width="2"/><line x1="425" y1="55" x2="150" y2="165" stroke="#64748b" stroke-width="2"/>
<line x1="215" y1="55" x2="490" y2="165" stroke="#64748b" stroke-width="2"/><line x1="425" y1="55" x2="520" y2="165" stroke="#64748b" stroke-width="2"/>
<text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">routed /31 links, MTU 9216, OSPF</text>
<path d="M 210 235 Q 320 265 430 235" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/>
<text x="320" y="245" text-anchor="middle" class="svg-accent" font-size="12">VXLAN tunnel rides on top</text>
</svg><p class="cap">The underlay has one job: make every loopback reachable from every switch, over every spine, fast and with room for big packets.</p></div>

<h3>Why the underlay matters so much</h3>
<p>Every overlay feature depends on it. If LEAF1 cannot reach LEAF2's VTEP address, no VXLAN tunnel forms and servers in the same VLAN on different racks cannot talk. If LEAF1 reaches LEAF2 through only one spine, half the fabric bandwidth sits idle. If one link has a smaller MTU, large packets vanish silently while small pings still work. If the routing protocol takes 40 seconds to notice a dead link, every application in the data center stalls for 40 seconds. Experienced engineers say: <b>"Most overlay problems are underlay problems."</b></p>

<div class="eg"><p><b>Worked example: what the underlay actually sees.</b> VM-A (172.16.10.11) on LEAF1 sends a 1,450-byte packet to VM-B (172.16.10.12) on LEAF2. LEAF1 wraps it in VXLAN: new outer IP header with source 10.254.0.1 and destination 10.254.0.2, UDP destination port 4789, total about 1,500 bytes of inner frame plus 50 bytes of headers. SPINE1 and SPINE2 never see 172.16.x.x as a destination; they route only on the outer header. LEAF1 has two equal-cost routes to 10.254.0.2, one through each spine, and hashes the flow onto one of them. That is the whole contract: loopback to loopback, many paths, jumbo MTU.</p></div>

<h3>A first look at the configuration</h3>
<p>You will build this step by step later, but here is the shape of a leaf's underlay on NX-OS, exactly as the module labs use it:</p>
<pre class="code"><span class="c">! LEAF1: routed uplink to SPINE1 (repeat for Ethernet1/2 to SPINE2)</span>
feature ospf
interface Ethernet1/1
  no switchport
  mtu 9216
  ip address 10.1.1.1/31
  ip ospf network point-to-point
  ip router ospf UNDERLAY area 0.0.0.0
  no shutdown
interface loopback0
  ip address 10.255.0.1/32
  ip router ospf UNDERLAY area 0.0.0.0
router ospf UNDERLAY
  router-id 10.255.0.1</pre>
<p>And the single most important verification: two next hops, one per spine.</p>
<pre class="out">LEAF1# show ip route 10.255.0.2
10.255.0.2/32, ubest/mbest: 2/0
<span class="hl">    *via 10.1.1.0, Eth1/1, [110/81], 00:04:12, ospf-UNDERLAY, intra
    *via 10.1.2.0, Eth1/2, [110/81], 00:04:12, ospf-UNDERLAY, intra</span></pre>

<h3>Module map</h3>
<table class="cmp"><tr><th>Chapter</th><th>You will be able to</th></tr>
<tr><td>2 Requirements</td><td>List what the underlay must deliver and what must stay out of it</td></tr>
<tr><td>3 Addressing</td><td>Build a loopback and /31 plan for 2 spines and 4 leaves</td></tr>
<tr><td>4 to 6 Protocols</td><td>Configure OSPF; compare IS-IS and eBGP underlays</td></tr>
<tr><td>7 ECMP</td><td>Explain hashing, polarisation and spine failure</td></tr>
<tr><td>8 Convergence</td><td>Use BFD and timers to fail over in well under a second</td></tr>
<tr><td>9 Multicast</td><td>Build PIM with anycast RP for VXLAN BUM traffic</td></tr>
<tr><td>10 Troubleshooting</td><td>Follow a repeatable workflow from cable to route</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Jumping straight to VXLAN configuration before proving loopback-to-loopback reachability. Testing only with small pings. Advertising server subnets into the underlay "just to make it work", which mixes tenant routing into the infrastructure.</p></div>
<div class="exam"><p><b>Exam tip.</b> Know the split: underlay = IGP or eBGP carrying loopbacks between VTEPs; overlay = VXLAN data plane plus (usually) MP-BGP EVPN control plane. VXLAN uses UDP 4789 and adds about 50 bytes.</p></div>

<div class="scn"><h4>The fabric that "worked" but VXLAN did not</h4><p>A team brought up a new four-leaf fabric. Pings between spine and leaf interfaces worked, so they moved on to VXLAN. The NVE peers never came up. The engineer ran <code>show ip route 10.254.0.3</code> on LEAF1 and got "Route not found": the VTEP loopback1 had an IP address but was never added to OSPF. One line per leaf fixed it: <code>ip router ospf UNDERLAY area 0.0.0.0</code> under loopback1.</p><p><b>Lesson:</b> interface pings prove links; only loopback-to-loopback routes prove the underlay.</p></div>

<div class="iv"><p class="q">"What is the difference between the underlay and the overlay in a VXLAN fabric?"</p><p>Strong answer: the underlay is the routed IP network between switches (point-to-point links, loopbacks, OSPF, IS-IS or eBGP) and its only job is loopback reachability with ECMP, jumbo MTU and fast convergence. The overlay is VXLAN tunnels between VTEP loopbacks carrying tenant Layer-2 and Layer-3 traffic, usually with BGP EVPN as the control plane. Add that the underlay should know nothing about tenants, which keeps it small and stable.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The underlay is the routed spine-leaf network; the overlay rides on top of it.</li>
<li>Its contract: every loopback reachable from every switch, over all spines, with jumbo MTU and fast failover.</li>
<li>Spines route only on the outer VXLAN header; they never see tenant addresses.</li>
<li>Verify with loopback routes showing one next hop per spine, not just interface pings.</li>
<li>Most overlay problems turn out to be underlay problems.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap Cisco Nexus spine-leaf fabric ka <b>routed underlay</b> design, configure, verify aur troubleshoot kar paoge. Aap loopbacks aur point-to-point addresses plan karoge, OSPF chalaoge (aur IS-IS aur eBGP ko alternatives ki tarah samjhoge), prove karoge ki har leaf har dusre leaf tak <b>saare</b> spines ke through ECMP se pahunchta hai, BFD se convergence tune karoge, VXLAN BUM traffic ke liye multicast underlay banaoge, aur classic faults theek karoge: MTU mismatches, OSPF stuck states, missing loopbacks aur "ek spine khaali baitha hai" wala ticket.</p>
<p><b>Prerequisites.</b> Aapko IPv4 subnetting aani chahiye (/31 aur /32 samet), routing table kya hota hai yeh pata hona chahiye, aur basic OSPF ideas (neighbours, areas, cost). Data center introduction module mein aap spine-leaf picture dekh chuke ho. Abhi VXLAN knowledge zaroori nahi: yeh module woh sadak banata hai jis par baad mein VXLAN chalega.</p>

<h3>Ek analogy: pehle sadak, baad mein delivery vans</h3>
<p>Socho ek courier company shehar ke warehouses ke beech sealed boxes deliver karna chahti hai. Ek bhi box move hone se pehle shehar ko har warehouse ke beech <b>sadak</b> chahiye, har warehouse gate par likha hua <b>address</b> chahiye, aur kai parallel sadkein chahiye taaki ek sadak block ho to deliveries na rukein. Courier company (overlay) ko farak nahi padta ki sadkein kaise bani hain; use bas itna chahiye ki har gate address reachable ho, jaldi aur ek se zyada raaste se.</p>
<p>Data center fabric mein <b>underlay</b> wahi sadkein aur addresses hai. Yeh switches ke beech ka simple IP network hai: routed links, loopback addresses aur ek routing protocol. <b>Overlay</b> (VXLAN, aur baad mein BGP EVPN) courier hai: yeh server traffic ko sealed "boxes" (encapsulated packets) mein lapet kar ek leaf se dusre leaf tak underlay ke through bhejta hai.</p>

<h3>Key terms</h3>
<dl class="terms">
<dt>Underlay</dt><dd>Spines aur leaves ka routed network jo switch loopbacks ke beech packets le jaata hai. Ise tenants, VLANs ya VMs ke baare mein kuch nahi pata.</dd>
<dt>Overlay</dt><dd>Underlay ke upar tunnels se bana virtual network, jaise VXLAN.</dd>
<dt>VTEP</dt><dd>VXLAN Tunnel End Point: leaf ka woh function jo VXLAN encapsulate aur decapsulate karta hai. Iska address ek loopback hai jise underlay ko advertise karna padta hai.</dd>
<dt>Loopback</dt><dd>Ek virtual interface jo switch up rehne tak hamesha up rehta hai. Router-ID, BGP peering aur VTEP source ke liye use hota hai.</dd>
<dt>ECMP</dt><dd>Equal-cost multipath: ek hi prefix ke liye kai best paths install karna aur flows ko un par baantna.</dd>
<dt>IGP</dt><dd>Interior gateway protocol, jaise OSPF ya IS-IS, jo ek organisation ke andar use hota hai.</dd>
</dl>

<h3>Underlay ka kaam ek picture mein</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Underlay saare spines ke through leaf loopbacks jodta hai">
<rect x="150" y="15" width="130" height="40" rx="6" fill="#ddd6fe"/><text x="215" y="34" text-anchor="middle" class="svg-ink" font-size="13">SPINE1</text><text x="215" y="49" text-anchor="middle" class="svg-muted" font-size="12">lo0 10.255.0.11</text>
<rect x="360" y="15" width="130" height="40" rx="6" fill="#ddd6fe"/><text x="425" y="34" text-anchor="middle" class="svg-ink" font-size="13">SPINE2</text><text x="425" y="49" text-anchor="middle" class="svg-muted" font-size="12">lo0 10.255.0.12</text>
<rect x="60" y="165" width="150" height="48" rx="6" fill="#bae6fd"/><text x="135" y="184" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text><text x="135" y="203" text-anchor="middle" class="svg-muted" font-size="12">VTEP 10.254.0.1</text>
<rect x="430" y="165" width="150" height="48" rx="6" fill="#bae6fd"/><text x="505" y="184" text-anchor="middle" class="svg-ink" font-size="13">LEAF2</text><text x="505" y="203" text-anchor="middle" class="svg-muted" font-size="12">VTEP 10.254.0.2</text>
<line x1="215" y1="55" x2="120" y2="165" stroke="#64748b" stroke-width="2"/><line x1="425" y1="55" x2="150" y2="165" stroke="#64748b" stroke-width="2"/>
<line x1="215" y1="55" x2="490" y2="165" stroke="#64748b" stroke-width="2"/><line x1="425" y1="55" x2="520" y2="165" stroke="#64748b" stroke-width="2"/>
<text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">routed /31 links, MTU 9216, OSPF</text>
<path d="M 210 235 Q 320 265 430 235" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/>
<text x="320" y="245" text-anchor="middle" class="svg-accent" font-size="12">VXLAN tunnel upar chalta hai</text>
</svg><p class="cap">Underlay ka ek hi kaam hai: har loopback ko har switch se, har spine ke through, tezi se aur bade packets ki jagah ke saath reachable banana.</p></div>

<h3>Underlay itna zaroori kyun hai</h3>
<p>Har overlay feature isi par depend karta hai. Agar LEAF1, LEAF2 ke VTEP address tak nahi pahunch sakta, to koi VXLAN tunnel nahi banta aur alag racks par same VLAN ke servers baat nahi kar sakte. Agar LEAF1, LEAF2 tak sirf ek spine se pahunchta hai, to fabric ki aadhi bandwidth bekaar padi rehti hai. Agar ek link ka MTU chhota hai, to bade packets chupchaap gayab ho jaate hain jabki chhote pings chalte rehte hain. Agar routing protocol ko dead link notice karne mein 40 seconds lagte hain, to data center ki har application 40 seconds ke liye atak jaati hai. Experienced engineers kehte hain: <b>"Zyada tar overlay problems asal mein underlay problems hoti hain."</b></p>

<div class="eg"><p><b>Worked example: underlay asal mein kya dekhta hai.</b> LEAF1 par VM-A (172.16.10.11) LEAF2 par VM-B (172.16.10.12) ko 1,450-byte packet bhejta hai. LEAF1 use VXLAN mein lapet-ta hai: naya outer IP header jiska source 10.254.0.1 aur destination 10.254.0.2 hai, UDP destination port 4789, lagbhag 1,500 bytes inner frame plus 50 bytes headers. SPINE1 aur SPINE2 kabhi 172.16.x.x ko destination ki tarah nahi dekhte; woh sirf outer header par route karte hain. LEAF1 ke paas 10.254.0.2 ke liye do equal-cost routes hain, har spine se ek, aur woh flow ko hash karke unmein se ek par daalta hai. Poora contract yahi hai: loopback se loopback, kai paths, jumbo MTU.</p></div>

<h3>Configuration par pehli nazar</h3>
<p>Aap ise baad mein step by step banaoge, lekin NX-OS par ek leaf ke underlay ka shape yeh hai, bilkul waise hi jaise module labs use karti hain:</p>
<pre class="code"><span class="c">! LEAF1: SPINE1 ki taraf routed uplink (SPINE2 ke liye Ethernet1/2 par repeat karo)</span>
feature ospf
interface Ethernet1/1
  no switchport
  mtu 9216
  ip address 10.1.1.1/31
  ip ospf network point-to-point
  ip router ospf UNDERLAY area 0.0.0.0
  no shutdown
interface loopback0
  ip address 10.255.0.1/32
  ip router ospf UNDERLAY area 0.0.0.0
router ospf UNDERLAY
  router-id 10.255.0.1</pre>
<p>Aur sabse important verification: do next hops, har spine ka ek.</p>
<pre class="out">LEAF1# show ip route 10.255.0.2
10.255.0.2/32, ubest/mbest: 2/0
<span class="hl">    *via 10.1.1.0, Eth1/1, [110/81], 00:04:12, ospf-UNDERLAY, intra
    *via 10.1.2.0, Eth1/2, [110/81], 00:04:12, ospf-UNDERLAY, intra</span></pre>

<h3>Module map</h3>
<table class="cmp"><tr><th>Chapter</th><th>Aap kya kar paoge</th></tr>
<tr><td>2 Requirements</td><td>Underlay ko kya deliver karna hai aur kya bahar rakhna hai, list karna</td></tr>
<tr><td>3 Addressing</td><td>2 spines aur 4 leaves ke liye loopback aur /31 plan banana</td></tr>
<tr><td>4 se 6 Protocols</td><td>OSPF configure karna; IS-IS aur eBGP underlays compare karna</td></tr>
<tr><td>7 ECMP</td><td>Hashing, polarisation aur spine failure explain karna</td></tr>
<tr><td>8 Convergence</td><td>BFD aur timers se ek second se kaafi kam mein fail over karna</td></tr>
<tr><td>9 Multicast</td><td>VXLAN BUM traffic ke liye anycast RP ke saath PIM banana</td></tr>
<tr><td>10 Troubleshooting</td><td>Cable se route tak ek repeatable workflow follow karna</td></tr>
</table>

<div class="warn"><p><b>Common galtiyan.</b> Loopback-to-loopback reachability prove kiye bina seedha VXLAN configuration par kood jaana. Sirf chhote pings se test karna. "Bas kaam chalane ke liye" server subnets ko underlay mein advertise karna, jisse tenant routing infrastructure mein mix ho jaati hai.</p></div>
<div class="exam"><p><b>Exam tip.</b> Split yaad rakho: underlay = IGP ya eBGP jo VTEPs ke beech loopbacks le jaata hai; overlay = VXLAN data plane plus (aam taur par) MP-BGP EVPN control plane. VXLAN UDP 4789 use karta hai aur lagbhag 50 bytes jodta hai.</p></div>

<div class="scn"><h4>Fabric jo "chal raha tha" lekin VXLAN nahi</h4><p>Ek team ne naya four-leaf fabric up kiya. Spine aur leaf interfaces ke beech pings chal rahe the, to woh VXLAN par aage badh gaye. NVE peers kabhi up nahi hue. Engineer ne LEAF1 par <code>show ip route 10.254.0.3</code> chalaya aur "Route not found" mila: VTEP loopback1 par IP address tha lekin use kabhi OSPF mein add nahi kiya gaya tha. Har leaf par ek line ne ise theek kar diya: loopback1 ke neeche <code>ip router ospf UNDERLAY area 0.0.0.0</code>.</p><p><b>Seekh:</b> interface pings links prove karte hain; sirf loopback-to-loopback routes underlay prove karte hain.</p></div>

<div class="iv"><p class="q">"VXLAN fabric mein underlay aur overlay mein kya farak hai?"</p><p>Strong answer: underlay switches ke beech routed IP network hai (point-to-point links, loopbacks, OSPF, IS-IS ya eBGP) aur iska ek hi kaam hai ECMP, jumbo MTU aur fast convergence ke saath loopback reachability. Overlay VTEP loopbacks ke beech VXLAN tunnels hain jo tenant Layer-2 aur Layer-3 traffic le jaate hain, aam taur par BGP EVPN control plane ke saath. Yeh bhi jodo ki underlay ko tenants ke baare mein kuch pata nahi hona chahiye, jisse woh chhota aur stable rehta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay routed spine-leaf network hai; overlay uske upar chalta hai.</li>
<li>Iska contract: har loopback har switch se, saare spines ke through, jumbo MTU aur fast failover ke saath reachable.</li>
<li>Spines sirf outer VXLAN header par route karte hain; woh kabhi tenant addresses nahi dekhte.</li>
<li>Verify karo loopback routes se jismein har spine ka ek next hop dikhe, sirf interface pings se nahi.</li>
<li>Zyada tar overlay problems asal mein underlay problems nikalti hain.</li>
</ul></div>
`}};export{e as default};