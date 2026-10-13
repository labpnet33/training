var e={id:`addressing`,h:{en:`Addressing plan: loopbacks, /31 links and IP unnumbered`,hi:`Addressing plan: loopbacks, /31 links aur IP unnumbered`},body:{en:`
<p>A new housing society first decides its numbering: tower A, flat 101, and so on. If the numbers follow a pattern, the postman, the security guard and the plumber all find the right door without asking. A fabric addressing plan works the same way. When LEAF3's uplink to SPINE2 is always 10.3.2.1, anyone reading a routing table at 3 a.m. knows instantly which cable is involved. In this chapter you will build that pattern.</p>

<h3>Two kinds of addresses</h3>
<p>The underlay needs only two kinds of addresses:</p>
<ul>
<li><b>Loopbacks (/32).</b> Identity addresses. They never go down while the switch is alive, so they are used as router-ID, BGP peering source and VTEP source.</li>
<li><b>Point-to-point link addresses.</b> One small subnet per leaf-spine cable, or none at all if you use IP unnumbered.</li>
</ul>

<h3>Loopbacks: why two per leaf</h3>
<p>Cisco's validated designs use separate loopbacks for control plane and data plane:</p>
<table class="cmp"><tr><th>Loopback</th><th>Purpose</th><th>Block in our plan</th></tr>
<tr><td>loopback0</td><td>Router-ID for OSPF and BGP, iBGP EVPN session source</td><td>10.255.0.0/24</td></tr>
<tr><td>loopback1</td><td>VTEP source for interface nve1 (plus the vPC anycast secondary address)</td><td>10.254.0.0/24</td></tr>
<tr><td>loopback254 (spines)</td><td>Anycast RP address for the multicast underlay</td><td>10.254.254.1/32</td></tr>
</table>
<p>Why not use one loopback for everything? The VTEP loopback has special behaviour: on a vPC pair NX-OS keeps it administratively down for a hold-down period after a reload, until routing and vPC have converged, so that the leaf does not attract VXLAN traffic it cannot yet forward. If BGP also used that loopback, the BGP sessions would wait too, delaying convergence. Separate loopbacks keep the control plane and the data plane independent.</p>

<h3>Point-to-point links: why /31</h3>
<p>A classic /30 subnet has four addresses: network, two hosts and broadcast. On a link with exactly two routers, the network and broadcast addresses are useless. <b>RFC 3021</b> allows a <b>/31</b> on point-to-point links: both addresses are usable, one per end. That halves the address space and, more importantly, keeps the plan tidy.</p>
<div class="eg"><p><b>Worked example: /30 versus /31.</b> 2 spines × 4 leaves = 8 links. With /30: 8 × 4 = 32 addresses. With /31: 8 × 2 = 16 addresses. With 4 spines × 64 leaves = 256 links: /30 needs 1,024 addresses, /31 needs 512. The routing table size is the same either way (one prefix per link), but the /31 plan fits into half the space.</p></div>

<h3>Worked address plan: 2 spines × 4 leaves</h3>
<p>The module labs use a very readable scheme: the link between LEAF <i>L</i> and SPINE <i>S</i> is <b>10.L.S.0/31</b>. The spine takes <b>.0</b>, the leaf takes <b>.1</b>. Leaf Ethernet1/1 goes to SPINE1, Ethernet1/2 to SPINE2; spine Ethernet1/<i>L</i> goes to LEAF <i>L</i>.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Address scheme 10.L.S.0/31">
<rect x="140" y="15" width="130" height="40" rx="6" fill="#ddd6fe"/><text x="205" y="34" text-anchor="middle" class="svg-ink" font-size="13">SPINE1</text><text x="205" y="49" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.11</text>
<rect x="370" y="15" width="130" height="40" rx="6" fill="#ddd6fe"/><text x="435" y="34" text-anchor="middle" class="svg-ink" font-size="13">SPINE2</text><text x="435" y="49" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.12</text>
<rect x="20" y="170" width="120" height="44" rx="6" fill="#bae6fd"/><text x="80" y="189" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text><text x="80" y="206" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.1</text>
<rect x="175" y="170" width="120" height="44" rx="6" fill="#bae6fd"/><text x="235" y="189" text-anchor="middle" class="svg-ink" font-size="13">LEAF2</text><text x="235" y="206" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.2</text>
<rect x="345" y="170" width="120" height="44" rx="6" fill="#bae6fd"/><text x="405" y="189" text-anchor="middle" class="svg-ink" font-size="13">LEAF3</text><text x="405" y="206" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.3</text>
<rect x="500" y="170" width="120" height="44" rx="6" fill="#bae6fd"/><text x="560" y="189" text-anchor="middle" class="svg-ink" font-size="13">LEAF4</text><text x="560" y="206" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.4</text>
<line x1="205" y1="55" x2="70" y2="170" stroke="#64748b" stroke-width="3"/><line x1="435" y1="55" x2="95" y2="170" stroke="#64748b" stroke-width="3"/>
<line x1="205" y1="55" x2="235" y2="170" stroke="#64748b" stroke-width="1"/><line x1="205" y1="55" x2="405" y2="170" stroke="#64748b" stroke-width="1"/><line x1="205" y1="55" x2="560" y2="170" stroke="#64748b" stroke-width="1"/>
<line x1="435" y1="55" x2="245" y2="170" stroke="#64748b" stroke-width="1"/><line x1="435" y1="55" x2="415" y2="170" stroke="#64748b" stroke-width="1"/><line x1="435" y1="55" x2="570" y2="170" stroke="#64748b" stroke-width="1"/>
<text x="40" y="120" class="svg-accent" font-size="12">10.1.1.0/31</text><text x="150" y="150" class="svg-accent" font-size="12">10.1.2.0/31</text>
<text x="320" y="232" text-anchor="middle" class="svg-muted" font-size="12">Rule: LEAF L to SPINE S = 10.L.S.0/31, spine .0, leaf .1</text>
</svg><p class="cap">The address tells you the cable: 10.3.2.1 is LEAF3's end of the link to SPINE2.</p></div>

<table class="cmp"><tr><th>Link</th><th>Leaf side</th><th>Spine side</th></tr>
<tr><td>LEAF1 to SPINE1</td><td>Eth1/1 10.1.1.1/31</td><td>SPINE1 Eth1/1 10.1.1.0/31</td></tr>
<tr><td>LEAF1 to SPINE2</td><td>Eth1/2 10.1.2.1/31</td><td>SPINE2 Eth1/1 10.1.2.0/31</td></tr>
<tr><td>LEAF2 to SPINE1</td><td>Eth1/1 10.2.1.1/31</td><td>SPINE1 Eth1/2 10.2.1.0/31</td></tr>
<tr><td>LEAF2 to SPINE2</td><td>Eth1/2 10.2.2.1/31</td><td>SPINE2 Eth1/2 10.2.2.0/31</td></tr>
<tr><td>LEAF3 to SPINE1</td><td>Eth1/1 10.3.1.1/31</td><td>SPINE1 Eth1/3 10.3.1.0/31</td></tr>
<tr><td>LEAF3 to SPINE2</td><td>Eth1/2 10.3.2.1/31</td><td>SPINE2 Eth1/3 10.3.2.0/31</td></tr>
<tr><td>LEAF4 to SPINE1</td><td>Eth1/1 10.4.1.1/31</td><td>SPINE1 Eth1/4 10.4.1.0/31</td></tr>
<tr><td>LEAF4 to SPINE2</td><td>Eth1/2 10.4.2.1/31</td><td>SPINE2 Eth1/4 10.4.2.0/31</td></tr>
</table>
<p>Loopbacks: leaves lo0 = 10.255.0.1 to .4, leaves lo1 (VTEP) = 10.254.0.1 to .4, spines lo0 = 10.255.0.11 and .12, anycast RP = 10.254.254.1 on both spines.</p>
<div class="note"><p>This teaching scheme spends a whole /24 per leaf-spine pair. In a large production fabric you would usually carve one block (for example 10.0.0.0/22) into consecutive /31s so that all fabric links are summarisable and easy to filter. The principle is the same: a predictable formula, never ad-hoc numbers.</p></div>

<h3>Configuration on NX-OS</h3>
<pre class="code"><span class="c">! LEAF3</span>
interface loopback0
  ip address 10.255.0.3/32
interface loopback1
  ip address 10.254.0.3/32
interface Ethernet1/1
  description to SPINE1 Eth1/3
  no switchport
  mtu 9216
  ip address 10.3.1.1/31
  no shutdown
interface Ethernet1/2
  description to SPINE2 Eth1/3
  no switchport
  mtu 9216
  ip address 10.3.2.1/31
  no shutdown</pre>
<pre class="out">LEAF3# show ip interface brief
IP Interface Status for VRF "default"(1)
Interface            IP Address      Interface Status
Lo0                  10.255.0.3      protocol-up/link-up/admin-up
Lo1                  10.254.0.3      protocol-up/link-up/admin-up
<span class="hl">Eth1/1               10.3.1.1        protocol-up/link-up/admin-up
Eth1/2               10.3.2.1        protocol-up/link-up/admin-up</span></pre>

<h3>IP unnumbered: the alternative</h3>
<p>Instead of a /31 per link, each fabric interface can <b>borrow</b> the loopback0 address. On Nexus 9000 this is supported for OSPF and IS-IS underlays on point-to-point Ethernet:</p>
<pre class="code">interface Ethernet1/1
  no switchport
  mtu 9216
  medium p2p
  ip unnumbered loopback0
  ip ospf network point-to-point
  ip router ospf UNDERLAY area 0.0.0.0</pre>
<table class="cmp"><tr><th></th><th>/31 per link</th><th>IP unnumbered</th></tr>
<tr><td>Address planning</td><td>One /31 per cable</td><td>Only loopbacks</td></tr>
<tr><td>Routes in table</td><td>Loopbacks plus links</td><td>Loopbacks only</td></tr>
<tr><td>Troubleshooting</td><td>Ping the neighbour's link address</td><td>Link has no own address; use loopbacks</td></tr>
<tr><td>eBGP underlay</td><td>Natural (peer on link address)</td><td>Not a fit for classic IPv4 eBGP peering</td></tr>
</table>

<h3>Documentation</h3>
<p>Keep the plan in one source of truth (an IPAM tool or at least a version-controlled spreadsheet) and mirror it on the switches: interface <code>description</code> lines naming the remote device and port, consistent hostnames, and loopback numbers that match the hostname (LEAF3 = .3). Automation templates then fill everything from the leaf number.</p>

<div class="warn"><p><b>Common mistakes.</b> Mismatched masks (/31 on one end, /30 on the other): on the broadcast OSPF network type the hello mask check fails and no adjacency forms, and with /30 the address .0 is not even a valid host. Swapping .0 and .1 on one link so both ends claim the same address. Reusing a leaf number after decommissioning without updating the documentation.</p></div>
<div class="exam"><p><b>Exam tip.</b> /31 on point-to-point links is defined in RFC 3021: two usable addresses, no broadcast. Loopbacks are /32. IP unnumbered on Nexus needs <code>medium p2p</code> on the interface.</p></div>

<div class="scn"><h4>Duplicate router-ID after a copy-paste</h4><p>A new LEAF4 was configured by copying LEAF3's file and changing the interface addresses, but not loopback0. OSPF adjacencies came up, yet routes flapped every few seconds and the log showed duplicate router-ID messages. Both leaves were originating router LSAs with ID 10.255.0.3, each overwriting the other. The engineer fixed loopback0 to 10.255.0.4, set router-id 10.255.0.4 and restarted the OSPF process on LEAF4.</p><p><b>Lesson:</b> derive every address, including loopbacks and router-ID, from the leaf number, and review the plan before commit.</p></div>

<div class="iv"><p class="q">"Why do we use /31 on fabric links, and why separate loopbacks for BGP and VTEP?"</p><p>Strong answer: /31 (RFC 3021) gives both usable addresses on a two-router link, halving address use compared with /30. Separate loopbacks let the VTEP loopback be held down after a reload (for example on vPC) without delaying BGP, and keep the anycast VTEP secondary address apart from the router-ID. Mention IP unnumbered as an option for OSPF or IS-IS and its trade-off in troubleshooting.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay addresses are only /32 loopbacks and point-to-point links.</li>
<li>loopback0 = router-ID and BGP; loopback1 = VTEP; spines add an anycast RP loopback.</li>
<li>/31 links (RFC 3021) use two addresses per cable; a formula like 10.L.S.0/31 makes every address self-explaining.</li>
<li>IP unnumbered (medium p2p) removes link subnets but makes link-level tests harder.</li>
<li>Document once, mirror it in descriptions and hostnames, and derive everything from the device number.</li>
</ul></div>
`,hi:`
<p>Ek nayi housing society sabse pehle apni numbering tay karti hai: tower A, flat 101, waghera. Agar numbers ek pattern follow karte hain, to postman, security guard aur plumber sab bina pooche sahi darwaza dhoondh lete hain. Fabric addressing plan bhi aise hi kaam karta hai. Jab LEAF3 ka SPINE2 wala uplink hamesha 10.3.2.1 ho, to raat 3 baje routing table padhne wala koi bhi turant jaan jaata hai ki kaunsi cable involved hai. Is chapter mein aap woh pattern banaoge.</p>

<h3>Do tarah ke addresses</h3>
<p>Underlay ko sirf do tarah ke addresses chahiye:</p>
<ul>
<li><b>Loopbacks (/32).</b> Identity addresses. Switch zinda rehne tak yeh kabhi down nahi hote, isliye router-ID, BGP peering source aur VTEP source ke liye use hote hain.</li>
<li><b>Point-to-point link addresses.</b> Har leaf-spine cable ke liye ek chhota subnet, ya agar IP unnumbered use karo to bilkul nahi.</li>
</ul>

<h3>Loopbacks: har leaf par do kyun</h3>
<p>Cisco ke validated designs control plane aur data plane ke liye alag loopbacks use karte hain:</p>
<table class="cmp"><tr><th>Loopback</th><th>Purpose</th><th>Hamare plan mein block</th></tr>
<tr><td>loopback0</td><td>OSPF aur BGP ke liye router-ID, iBGP EVPN session source</td><td>10.255.0.0/24</td></tr>
<tr><td>loopback1</td><td>interface nve1 ke liye VTEP source (plus vPC anycast secondary address)</td><td>10.254.0.0/24</td></tr>
<tr><td>loopback254 (spines)</td><td>Multicast underlay ke liye anycast RP address</td><td>10.254.254.1/32</td></tr>
</table>
<p>Sab kuch ke liye ek hi loopback kyun nahi? VTEP loopback ka special behaviour hai: vPC pair par NX-OS reload ke baad ise ek hold-down period tak administratively down rakhta hai, jab tak routing aur vPC converge na ho jaayein, taaki leaf aisa VXLAN traffic attract na kare jise woh abhi forward nahi kar sakta. Agar BGP bhi wahi loopback use karta, to BGP sessions bhi wait karte, jisse convergence late hota. Alag loopbacks control plane aur data plane ko independent rakhte hain.</p>

<h3>Point-to-point links: /31 kyun</h3>
<p>Classic /30 subnet mein chaar addresses hote hain: network, do hosts aur broadcast. Jis link par exactly do routers hain, wahan network aur broadcast addresses bekaar hain. <b>RFC 3021</b> point-to-point links par <b>/31</b> allow karta hai: dono addresses usable hain, har end ka ek. Isse address space aadha ho jaata hai aur, usse bhi zaroori, plan saaf rehta hai.</p>
<div class="eg"><p><b>Worked example: /30 versus /31.</b> 2 spines × 4 leaves = 8 links. /30 ke saath: 8 × 4 = 32 addresses. /31 ke saath: 8 × 2 = 16 addresses. 4 spines × 64 leaves = 256 links ke saath: /30 ko 1,024 addresses chahiye, /31 ko 512. Routing table ka size dono tarah same hai (har link ka ek prefix), lekin /31 plan aadhi jagah mein fit ho jaata hai.</p></div>

<h3>Worked address plan: 2 spines × 4 leaves</h3>
<p>Module labs ek bahut readable scheme use karti hain: LEAF <i>L</i> aur SPINE <i>S</i> ke beech ka link <b>10.L.S.0/31</b> hai. Spine <b>.0</b> leta hai, leaf <b>.1</b> leta hai. Leaf ka Ethernet1/1 SPINE1 ko jaata hai, Ethernet1/2 SPINE2 ko; spine ka Ethernet1/<i>L</i> LEAF <i>L</i> ko jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Address scheme 10.L.S.0/31">
<rect x="140" y="15" width="130" height="40" rx="6" fill="#ddd6fe"/><text x="205" y="34" text-anchor="middle" class="svg-ink" font-size="13">SPINE1</text><text x="205" y="49" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.11</text>
<rect x="370" y="15" width="130" height="40" rx="6" fill="#ddd6fe"/><text x="435" y="34" text-anchor="middle" class="svg-ink" font-size="13">SPINE2</text><text x="435" y="49" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.12</text>
<rect x="20" y="170" width="120" height="44" rx="6" fill="#bae6fd"/><text x="80" y="189" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text><text x="80" y="206" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.1</text>
<rect x="175" y="170" width="120" height="44" rx="6" fill="#bae6fd"/><text x="235" y="189" text-anchor="middle" class="svg-ink" font-size="13">LEAF2</text><text x="235" y="206" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.2</text>
<rect x="345" y="170" width="120" height="44" rx="6" fill="#bae6fd"/><text x="405" y="189" text-anchor="middle" class="svg-ink" font-size="13">LEAF3</text><text x="405" y="206" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.3</text>
<rect x="500" y="170" width="120" height="44" rx="6" fill="#bae6fd"/><text x="560" y="189" text-anchor="middle" class="svg-ink" font-size="13">LEAF4</text><text x="560" y="206" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.4</text>
<line x1="205" y1="55" x2="70" y2="170" stroke="#64748b" stroke-width="3"/><line x1="435" y1="55" x2="95" y2="170" stroke="#64748b" stroke-width="3"/>
<line x1="205" y1="55" x2="235" y2="170" stroke="#64748b" stroke-width="1"/><line x1="205" y1="55" x2="405" y2="170" stroke="#64748b" stroke-width="1"/><line x1="205" y1="55" x2="560" y2="170" stroke="#64748b" stroke-width="1"/>
<line x1="435" y1="55" x2="245" y2="170" stroke="#64748b" stroke-width="1"/><line x1="435" y1="55" x2="415" y2="170" stroke="#64748b" stroke-width="1"/><line x1="435" y1="55" x2="570" y2="170" stroke="#64748b" stroke-width="1"/>
<text x="40" y="120" class="svg-accent" font-size="12">10.1.1.0/31</text><text x="150" y="150" class="svg-accent" font-size="12">10.1.2.0/31</text>
<text x="320" y="232" text-anchor="middle" class="svg-muted" font-size="12">Rule: LEAF L se SPINE S = 10.L.S.0/31, spine .0, leaf .1</text>
</svg><p class="cap">Address hi cable bata deta hai: 10.3.2.1 LEAF3 ka SPINE2 wale link ka end hai.</p></div>

<table class="cmp"><tr><th>Link</th><th>Leaf side</th><th>Spine side</th></tr>
<tr><td>LEAF1 se SPINE1</td><td>Eth1/1 10.1.1.1/31</td><td>SPINE1 Eth1/1 10.1.1.0/31</td></tr>
<tr><td>LEAF1 se SPINE2</td><td>Eth1/2 10.1.2.1/31</td><td>SPINE2 Eth1/1 10.1.2.0/31</td></tr>
<tr><td>LEAF2 se SPINE1</td><td>Eth1/1 10.2.1.1/31</td><td>SPINE1 Eth1/2 10.2.1.0/31</td></tr>
<tr><td>LEAF2 se SPINE2</td><td>Eth1/2 10.2.2.1/31</td><td>SPINE2 Eth1/2 10.2.2.0/31</td></tr>
<tr><td>LEAF3 se SPINE1</td><td>Eth1/1 10.3.1.1/31</td><td>SPINE1 Eth1/3 10.3.1.0/31</td></tr>
<tr><td>LEAF3 se SPINE2</td><td>Eth1/2 10.3.2.1/31</td><td>SPINE2 Eth1/3 10.3.2.0/31</td></tr>
<tr><td>LEAF4 se SPINE1</td><td>Eth1/1 10.4.1.1/31</td><td>SPINE1 Eth1/4 10.4.1.0/31</td></tr>
<tr><td>LEAF4 se SPINE2</td><td>Eth1/2 10.4.2.1/31</td><td>SPINE2 Eth1/4 10.4.2.0/31</td></tr>
</table>
<p>Loopbacks: leaves lo0 = 10.255.0.1 se .4, leaves lo1 (VTEP) = 10.254.0.1 se .4, spines lo0 = 10.255.0.11 aur .12, anycast RP = dono spines par 10.254.254.1.</p>
<div class="note"><p>Yeh teaching scheme har leaf-spine pair par poora /24 kharch karti hai. Bade production fabric mein aap aam taur par ek block (jaise 10.0.0.0/22) ko consecutive /31s mein kaatte ho taaki saare fabric links summarise aur filter karne mein aasaan hon. Principle same hai: ek predictable formula, kabhi random numbers nahi.</p></div>

<h3>NX-OS par configuration</h3>
<pre class="code"><span class="c">! LEAF3</span>
interface loopback0
  ip address 10.255.0.3/32
interface loopback1
  ip address 10.254.0.3/32
interface Ethernet1/1
  description to SPINE1 Eth1/3
  no switchport
  mtu 9216
  ip address 10.3.1.1/31
  no shutdown
interface Ethernet1/2
  description to SPINE2 Eth1/3
  no switchport
  mtu 9216
  ip address 10.3.2.1/31
  no shutdown</pre>
<pre class="out">LEAF3# show ip interface brief
IP Interface Status for VRF "default"(1)
Interface            IP Address      Interface Status
Lo0                  10.255.0.3      protocol-up/link-up/admin-up
Lo1                  10.254.0.3      protocol-up/link-up/admin-up
<span class="hl">Eth1/1               10.3.1.1        protocol-up/link-up/admin-up
Eth1/2               10.3.2.1        protocol-up/link-up/admin-up</span></pre>

<h3>IP unnumbered: alternative</h3>
<p>Har link par /31 ki jagah, har fabric interface loopback0 ka address <b>udhaar</b> le sakta hai. Nexus 9000 par yeh point-to-point Ethernet par OSPF aur IS-IS underlays ke liye supported hai:</p>
<pre class="code">interface Ethernet1/1
  no switchport
  mtu 9216
  medium p2p
  ip unnumbered loopback0
  ip ospf network point-to-point
  ip router ospf UNDERLAY area 0.0.0.0</pre>
<table class="cmp"><tr><th></th><th>Har link par /31</th><th>IP unnumbered</th></tr>
<tr><td>Address planning</td><td>Har cable ka ek /31</td><td>Sirf loopbacks</td></tr>
<tr><td>Table mein routes</td><td>Loopbacks plus links</td><td>Sirf loopbacks</td></tr>
<tr><td>Troubleshooting</td><td>Neighbour ka link address ping karo</td><td>Link ka apna address nahi; loopbacks use karo</td></tr>
<tr><td>eBGP underlay</td><td>Natural (link address par peer)</td><td>Classic IPv4 eBGP peering ke liye fit nahi</td></tr>
</table>

<h3>Documentation</h3>
<p>Plan ko ek source of truth mein rakho (IPAM tool ya kam se kam version-controlled spreadsheet) aur switches par use mirror karo: interface <code>description</code> lines jo remote device aur port ka naam batayein, consistent hostnames, aur loopback numbers jo hostname se match karein (LEAF3 = .3). Phir automation templates leaf number se sab kuch bhar dete hain.</p>

<div class="warn"><p><b>Common galtiyan.</b> Masks mismatch karna (ek end par /31, dusre par /30): broadcast OSPF network type par hello mask check fail hota hai aur adjacency nahi banti, aur /30 mein .0 address valid host bhi nahi hai. Ek link par .0 aur .1 ulta kar dena jisse dono ends same address claim karein. Decommission ke baad leaf number reuse karna bina documentation update kiye.</p></div>
<div class="exam"><p><b>Exam tip.</b> Point-to-point links par /31 RFC 3021 mein defined hai: do usable addresses, koi broadcast nahi. Loopbacks /32 hote hain. Nexus par IP unnumbered ke liye interface par <code>medium p2p</code> chahiye.</p></div>

<div class="scn"><h4>Copy-paste ke baad duplicate router-ID</h4><p>Naya LEAF4 LEAF3 ki file copy karke aur interface addresses badal kar configure kiya gaya, lekin loopback0 nahi badla. OSPF adjacencies up ho gayi, phir bhi routes har kuch seconds mein flap ho rahe the aur log mein duplicate router-ID messages the. Dono leaves ID 10.255.0.3 ke saath router LSAs originate kar rahe the, aur ek dusre ko overwrite kar rahe the. Engineer ne loopback0 ko 10.255.0.4 kiya, router-id 10.255.0.4 set kiya aur LEAF4 par OSPF process restart kiya.</p><p><b>Seekh:</b> har address, loopbacks aur router-ID samet, leaf number se derive karo, aur commit se pehle plan review karo.</p></div>

<div class="iv"><p class="q">"Fabric links par /31 kyun use karte hain, aur BGP aur VTEP ke liye alag loopbacks kyun?"</p><p>Strong answer: /31 (RFC 3021) do-router link par dono addresses usable deta hai, /30 ke mukable address use aadha karta hai. Alag loopbacks se VTEP loopback ko reload ke baad (jaise vPC par) hold down kiya ja sakta hai bina BGP ko late kiye, aur anycast VTEP secondary address router-ID se alag rehta hai. OSPF ya IS-IS ke liye option ki tarah IP unnumbered aur troubleshooting mein uska trade-off bhi batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay addresses sirf /32 loopbacks aur point-to-point links hain.</li>
<li>loopback0 = router-ID aur BGP; loopback1 = VTEP; spines ek anycast RP loopback jodte hain.</li>
<li>/31 links (RFC 3021) har cable par do addresses use karte hain; 10.L.S.0/31 jaisa formula har address ko khud explain karta hai.</li>
<li>IP unnumbered (medium p2p) link subnets hata deta hai lekin link-level tests mushkil kar deta hai.</li>
<li>Ek baar document karo, descriptions aur hostnames mein mirror karo, aur sab kuch device number se derive karo.</li>
</ul></div>
`}};export{e as default};