var e={id:`sdn-vxlan`,h:{en:`SDN and VXLAN: a programmable network and Layer 2 over Layer 3`,hi:`SDN aur VXLAN: programmable network aur Layer 3 ke upar Layer 2`},body:{en:`
<p>Think of a city's traffic lights. In an old city each junction has its own timer box: every junction decides alone, and changing the timing across the city means sending a technician to every box. In a smart city all lights report to one traffic control center, which sees the whole map and pushes new timings to every junction in seconds. The lights still stop and start the cars locally; only the decisions moved to the center. That is <b>software-defined networking (SDN)</b>.</p>

<h3>The three planes</h3>
<dl class="terms">
<dt>Data plane (forwarding plane)</dt><dd>Moves packets: looks up the destination, rewrites headers and sends the packet out of the right port. Done in hardware at line rate.</dd>
<dt>Control plane</dt><dd>Decides <b>how</b> packets should be forwarded: routing protocols (OSPF, BGP), spanning tree, ARP, building the tables the data plane uses.</dd>
<dt>Management plane</dt><dd>How humans and tools configure and monitor the device: SSH, SNMP, APIs, syslog.</dd>
</dl>
<p>In a traditional network every router and switch runs its own control plane and is configured box by box. In <b>SDN</b> the control logic is <b>centralised</b> in a <b>controller</b> (software on servers) that has a global view and programs the data planes of many devices. The devices become simpler forwarding engines.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="SDN architecture layers">
<rect x="20" y="15" width="600" height="55" rx="8" fill="#fde68a"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">Application layer</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">orchestration, automation scripts, monitoring, policy apps</text>
<line x1="320" y1="70" x2="320" y2="100" stroke="#64748b" stroke-width="2"/><text x="330" y="90" class="svg-accent" font-size="12">northbound API (REST)</text>
<rect x="20" y="100" width="600" height="55" rx="8" fill="#ddd6fe"/><text x="320" y="123" text-anchor="middle" class="svg-ink" font-size="14">Control layer: SDN controller</text><text x="320" y="143" text-anchor="middle" class="svg-muted" font-size="12">global view, topology, policy, path computation</text>
<line x1="320" y1="155" x2="320" y2="185" stroke="#64748b" stroke-width="2"/><text x="330" y="175" class="svg-accent" font-size="12">southbound API (OpenFlow, NETCONF, gRPC)</text>
<rect x="20" y="185" width="600" height="70" rx="8" fill="#bae6fd"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="14">Infrastructure layer: data plane</text>
<rect x="60" y="215" width="110" height="30" rx="6" fill="#ffffff" stroke="#64748b"/><text x="115" y="235" text-anchor="middle" class="svg-ink" font-size="12">switch</text>
<rect x="265" y="215" width="110" height="30" rx="6" fill="#ffffff" stroke="#64748b"/><text x="320" y="235" text-anchor="middle" class="svg-ink" font-size="12">router</text>
<rect x="470" y="215" width="110" height="30" rx="6" fill="#ffffff" stroke="#64748b"/><text x="525" y="235" text-anchor="middle" class="svg-ink" font-size="12">vSwitch</text>
</svg><p class="cap">The SDN model: applications talk to the controller through the northbound API; the controller programs devices through the southbound API.</p></div>

<p><b>Northbound APIs</b> (usually REST with JSON) let applications ask the controller for things such as "give the voice VLAN priority on every branch". <b>Southbound APIs</b> (OpenFlow, NETCONF, RESTCONF, gRPC, vendor protocols) carry the controller's instructions down to the devices. Benefits: one place to apply policy, fast consistent change, programmability and automation. Risk: the controller must be highly available, usually a cluster of three.</p>
<p>SDN ideas are everywhere today: cloud VPCs are software-defined networks you program through an API, data-center fabrics use controllers, and SD-WAN (next chapter) applies SDN to the WAN.</p>

<h3>Overlay and underlay</h3>
<p>Many SDN solutions build an <b>overlay</b>: virtual networks carried inside tunnels over a simple routed <b>underlay</b> network. The underlay only has to move IP packets between tunnel endpoints; the overlay provides the segments tenants see. VXLAN is the most common overlay encapsulation.</p>

<h3>VXLAN: Layer 2 encapsulated in Layer 3</h3>
<p>Classic VLANs have two limits: only about 4,094 IDs, and a VLAN cannot cross a routed network. Data centers and clouds with thousands of tenants and routed fabrics needed more. <b>Virtual Extensible LAN (VXLAN)</b> takes the whole original Ethernet frame and wraps it in a <b>UDP</b> datagram (destination port <b>4789</b>) inside an IP packet. This is <b>Layer 2 encapsulation</b> (MAC-in-UDP).</p>
<ul>
<li>The <b>VXLAN network identifier (VNI)</b> is <b>24 bits</b>: about 16 million segments instead of 4,094.</li>
<li>A <b>VTEP</b> (VXLAN tunnel endpoint), in a switch or a hypervisor, encapsulates and decapsulates frames.</li>
<li>Endpoints learn MAC addresses by flood-and-learn or, in modern fabrics, with <b>BGP EVPN</b> as the control plane.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="VXLAN packet format">
<rect x="10" y="30" width="90" height="50" rx="4" fill="#e2e8f0"/><text x="55" y="52" text-anchor="middle" class="svg-ink" font-size="12">Outer MAC</text><text x="55" y="70" text-anchor="middle" class="svg-muted" font-size="12">14 B</text>
<rect x="100" y="30" width="90" height="50" rx="4" fill="#bae6fd"/><text x="145" y="52" text-anchor="middle" class="svg-ink" font-size="12">Outer IP</text><text x="145" y="70" text-anchor="middle" class="svg-muted" font-size="12">20 B</text>
<rect x="190" y="30" width="90" height="50" rx="4" fill="#bbf7d0"/><text x="235" y="52" text-anchor="middle" class="svg-ink" font-size="12">UDP 4789</text><text x="235" y="70" text-anchor="middle" class="svg-muted" font-size="12">8 B</text>
<rect x="280" y="30" width="90" height="50" rx="4" fill="#fde68a"/><text x="325" y="52" text-anchor="middle" class="svg-ink" font-size="12">VXLAN VNI</text><text x="325" y="70" text-anchor="middle" class="svg-muted" font-size="12">8 B</text>
<rect x="370" y="30" width="260" height="50" rx="4" fill="#ddd6fe"/><text x="500" y="52" text-anchor="middle" class="svg-ink" font-size="12">Original Ethernet frame</text><text x="500" y="70" text-anchor="middle" class="svg-muted" font-size="12">inner MAC + IP + data</text>
<text x="190" y="110" text-anchor="middle" class="svg-accent" font-size="12">50 bytes of overhead added by the VTEP</text>
<line x1="10" y1="92" x2="370" y2="92" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">VXLAN wraps the original frame in 50 bytes of new headers, so the underlay MTU must be larger than 1500.</p></div>

<h3>VXLAN for data center interconnect (DCI)</h3>
<p><b>Data center interconnect (DCI)</b> links two or more data centers. Harbourline has its HQ data center and a disaster-recovery site (10.40.0.0/16) connected over a routed WAN. Some legacy apps must keep the same IP address when a VM moves to the DR site, which needs the same Layer 2 segment in both places. VXLAN stretches VNI 10100 across the routed link without stretching spanning tree, because the WAN in the middle stays pure Layer 3.</p>

<div class="eg"><p><b>Worked example: MTU and a Linux VTEP.</b> Overhead = outer Ethernet 14 + outer IP 20 + UDP 8 + VXLAN 8 = <b>50 bytes</b>. To carry a normal 1500-byte inner IP packet (1514-byte inner frame), the underlay must carry IP packets of 1514 + 8 + 8 + 20 = <b>1550 bytes</b>. Most fabrics simply use jumbo frames (9000 or 9216). If the underlay is only 1500, the VXLAN interface must drop its own MTU to 1450, as Linux does automatically:</p></div>
<pre class="code"><span class="c"># HQ server acting as a software VTEP for VNI 10100 toward the DR site</span>
ip link add vxlan10100 type vxlan id 10100 dstport 4789 local 10.255.0.1 remote 10.255.0.2 dev eth0
ip link set vxlan10100 up
ip -d link show vxlan10100</pre>
<pre class="out">7: vxlan10100: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt; <span class="hl">mtu 1450</span> qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000
    link/ether 6a:3c:1e:2b:9f:10 brd ff:ff:ff:ff:ff:ff promiscuity 0 minmtu 68 maxmtu 65535
    <span class="hl">vxlan id 10100 remote 10.255.0.2 local 10.255.0.1 dev eth0 srcport 0 0 dstport 4789</span> ttl auto ageing 300 udpcsum noudp6zerocsumtx noudp6zerocsumrx</pre>

<div class="warn"><p><b>Common mistake.</b> Building a VXLAN overlay over an underlay with a 1500-byte MTU and leaving hosts at 1500. Pings work (small packets), but file transfers and web pages hang because large packets are dropped. Always raise the underlay MTU or lower the overlay MTU.</p></div>

<div class="exam"><p><b>Exam trap.</b> VXLAN: 24-bit VNI (16 million segments), UDP port 4789, Layer 2 frames encapsulated in Layer 3/UDP, used for DCI and multitenant data centers. SDN separates the control plane from the data plane; northbound = to applications, southbound = to devices.</p></div>

<div class="scn"><h4>The DR test that moved VMs but not users</h4><p>During a disaster-recovery test, VMs were moved to the DR site over a VXLAN DCI. They booted with their original IPs, but users could only reach some of them. Pings to all VMs worked; large database queries timed out. The WAN provider's link had a 1500-byte MTU. Lowering the VM MTU to 1450 as a quick fix and ordering jumbo frame support on the link resolved it.</p><p><b>Lesson:</b> "ping works but the application does not" through a tunnel almost always means MTU.</p></div>

<div class="iv"><p class="q">"What problem does VXLAN solve, and how does it work?"</p><p>Strong answer: VLANs are limited to about 4,094 IDs and cannot cross Layer 3 boundaries. VXLAN encapsulates the original Ethernet frame in UDP (port 4789) and IP, with a 24-bit VNI giving about 16 million segments. VTEPs in switches or hypervisors encapsulate and decapsulate. It lets you stretch Layer 2 over a routed underlay for multitenancy and data center interconnect. Mention the 50-byte overhead and MTU, and BGP EVPN as the control plane in modern fabrics.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SDN centralises the control plane in a controller; devices keep the data plane.</li>
<li>Northbound API (REST) connects applications to the controller; southbound API (OpenFlow, NETCONF, gRPC) connects the controller to devices.</li>
<li>VXLAN encapsulates Layer 2 frames in UDP 4789 over IP, with a 24-bit VNI (about 16 million segments).</li>
<li>VXLAN is used for multitenancy and data center interconnect without stretching spanning tree.</li>
<li>Overhead is 50 bytes: underlay MTU at least 1550, or jumbo frames.</li>
</ul></div>
`,hi:`
<p>Ek shehar ki traffic lights socho. Purane shehar mein har junction ka apna timer box hota hai: har junction akele decide karta hai, aur poore shehar mein timing badalne ke liye har box par technician bhejna padta hai. Smart city mein saari lights ek traffic control center ko report karti hain, jo poora map dekhta hai aur seconds mein har junction ko nayi timings push karta hai. Lights ab bhi gaadiyon ko locally rokti aur chalati hain; sirf decisions center mein chale gaye. Yahi <b>software-defined networking (SDN)</b> hai.</p>

<h3>Teen planes</h3>
<dl class="terms">
<dt>Data plane (forwarding plane)</dt><dd>Packets ko move karta hai: destination dekhta hai, headers rewrite karta hai aur packet ko sahi port se bahar bhejta hai. Line rate par hardware mein hota hai.</dd>
<dt>Control plane</dt><dd>Decide karta hai ki packets <b>kaise</b> forward hon: routing protocols (OSPF, BGP), spanning tree, ARP, woh tables banana jo data plane use karta hai.</dd>
<dt>Management plane</dt><dd>Insaan aur tools device ko kaise configure aur monitor karte hain: SSH, SNMP, APIs, syslog.</dd>
</dl>
<p>Traditional network mein har router aur switch apna control plane chalata hai aur box by box configure hota hai. <b>SDN</b> mein control logic ek <b>controller</b> (servers par software) mein <b>centralise</b> hota hai jiske paas global view hai aur jo kai devices ke data planes ko program karta hai. Devices simple forwarding engines ban jaate hain.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="SDN architecture layers">
<rect x="20" y="15" width="600" height="55" rx="8" fill="#fde68a"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">Application layer</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">orchestration, automation scripts, monitoring, policy apps</text>
<line x1="320" y1="70" x2="320" y2="100" stroke="#64748b" stroke-width="2"/><text x="330" y="90" class="svg-accent" font-size="12">northbound API (REST)</text>
<rect x="20" y="100" width="600" height="55" rx="8" fill="#ddd6fe"/><text x="320" y="123" text-anchor="middle" class="svg-ink" font-size="14">Control layer: SDN controller</text><text x="320" y="143" text-anchor="middle" class="svg-muted" font-size="12">global view, topology, policy, path computation</text>
<line x1="320" y1="155" x2="320" y2="185" stroke="#64748b" stroke-width="2"/><text x="330" y="175" class="svg-accent" font-size="12">southbound API (OpenFlow, NETCONF, gRPC)</text>
<rect x="20" y="185" width="600" height="70" rx="8" fill="#bae6fd"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="14">Infrastructure layer: data plane</text>
<rect x="60" y="215" width="110" height="30" rx="6" fill="#ffffff" stroke="#64748b"/><text x="115" y="235" text-anchor="middle" class="svg-ink" font-size="12">switch</text>
<rect x="265" y="215" width="110" height="30" rx="6" fill="#ffffff" stroke="#64748b"/><text x="320" y="235" text-anchor="middle" class="svg-ink" font-size="12">router</text>
<rect x="470" y="215" width="110" height="30" rx="6" fill="#ffffff" stroke="#64748b"/><text x="525" y="235" text-anchor="middle" class="svg-ink" font-size="12">vSwitch</text>
</svg><p class="cap">SDN model: applications northbound API se controller se baat karti hain; controller southbound API se devices ko program karta hai.</p></div>

<p><b>Northbound APIs</b> (aam taur par JSON ke saath REST) applications ko controller se "har branch par voice VLAN ko priority do" jaisi cheezein maangne deti hain. <b>Southbound APIs</b> (OpenFlow, NETCONF, RESTCONF, gRPC, vendor protocols) controller ke instructions ko neeche devices tak le jaati hain. Fayde: policy lagane ki ek jagah, tez aur consistent change, programmability aur automation. Risk: controller highly available hona chahiye, aam taur par teen ka cluster.</p>
<p>SDN ideas aaj har jagah hain: cloud VPCs software-defined networks hain jinhe aap API se program karte ho, data-center fabrics controllers use karte hain, aur SD-WAN (agla chapter) SDN ko WAN par lagata hai.</p>

<h3>Overlay aur underlay</h3>
<p>Kai SDN solutions ek <b>overlay</b> banate hain: virtual networks jo ek simple routed <b>underlay</b> network ke upar tunnels ke andar chalte hain. Underlay ko sirf tunnel endpoints ke beech IP packets move karne hain; overlay woh segments deta hai jo tenants dekhte hain. VXLAN sabse common overlay encapsulation hai.</p>

<h3>VXLAN: Layer 3 mein encapsulated Layer 2</h3>
<p>Classic VLANs ki do limits hain: sirf lagbhag 4,094 IDs, aur VLAN routed network cross nahi kar sakta. Hazaaron tenants aur routed fabrics wale data centers aur clouds ko zyada chahiye tha. <b>Virtual Extensible LAN (VXLAN)</b> poore original Ethernet frame ko lekar ek IP packet ke andar <b>UDP</b> datagram (destination port <b>4789</b>) mein lapet deta hai. Yeh <b>Layer 2 encapsulation</b> (MAC-in-UDP) hai.</p>
<ul>
<li><b>VXLAN network identifier (VNI)</b> <b>24 bits</b> ka hai: 4,094 ki jagah lagbhag 16 million segments.</li>
<li><b>VTEP</b> (VXLAN tunnel endpoint), switch ya hypervisor mein, frames ko encapsulate aur decapsulate karta hai.</li>
<li>Endpoints MAC addresses flood-and-learn se seekhte hain ya, modern fabrics mein, control plane ki tarah <b>BGP EVPN</b> se.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="VXLAN packet format">
<rect x="10" y="30" width="90" height="50" rx="4" fill="#e2e8f0"/><text x="55" y="52" text-anchor="middle" class="svg-ink" font-size="12">Outer MAC</text><text x="55" y="70" text-anchor="middle" class="svg-muted" font-size="12">14 B</text>
<rect x="100" y="30" width="90" height="50" rx="4" fill="#bae6fd"/><text x="145" y="52" text-anchor="middle" class="svg-ink" font-size="12">Outer IP</text><text x="145" y="70" text-anchor="middle" class="svg-muted" font-size="12">20 B</text>
<rect x="190" y="30" width="90" height="50" rx="4" fill="#bbf7d0"/><text x="235" y="52" text-anchor="middle" class="svg-ink" font-size="12">UDP 4789</text><text x="235" y="70" text-anchor="middle" class="svg-muted" font-size="12">8 B</text>
<rect x="280" y="30" width="90" height="50" rx="4" fill="#fde68a"/><text x="325" y="52" text-anchor="middle" class="svg-ink" font-size="12">VXLAN VNI</text><text x="325" y="70" text-anchor="middle" class="svg-muted" font-size="12">8 B</text>
<rect x="370" y="30" width="260" height="50" rx="4" fill="#ddd6fe"/><text x="500" y="52" text-anchor="middle" class="svg-ink" font-size="12">Original Ethernet frame</text><text x="500" y="70" text-anchor="middle" class="svg-muted" font-size="12">inner MAC + IP + data</text>
<text x="190" y="110" text-anchor="middle" class="svg-accent" font-size="12">VTEP ke jode 50 bytes ka overhead</text>
<line x1="10" y1="92" x2="370" y2="92" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">VXLAN original frame ko 50 bytes ke naye headers mein lapet deta hai, isliye underlay MTU 1500 se bada hona chahiye.</p></div>

<h3>Data center interconnect (DCI) ke liye VXLAN</h3>
<p><b>Data center interconnect (DCI)</b> do ya zyada data centers ko jodta hai. Harbourline ka HQ data center aur ek disaster-recovery site (10.40.0.0/16) routed WAN se jude hain. Kuch legacy apps ko VM ke DR site par move hone par bhi same IP address rakhna hai, jiske liye dono jagah same Layer 2 segment chahiye. VXLAN VNI 10100 ko routed link ke across stretch kar deta hai bina spanning tree stretch kiye, kyunki beech ka WAN pure Layer 3 rehta hai.</p>

<div class="eg"><p><b>Worked example: MTU aur ek Linux VTEP.</b> Overhead = outer Ethernet 14 + outer IP 20 + UDP 8 + VXLAN 8 = <b>50 bytes</b>. Normal 1500-byte inner IP packet (1514-byte inner frame) le jaane ke liye underlay ko 1514 + 8 + 8 + 20 = <b>1550 bytes</b> ke IP packets le jaane chahiye. Zyada tar fabrics seedha jumbo frames (9000 ya 9216) use karte hain. Agar underlay sirf 1500 hai, to VXLAN interface ko apna MTU 1450 karna padta hai, jaisa Linux automatically karta hai:</p></div>
<pre class="code"><span class="c"># HQ server DR site ki taraf VNI 10100 ke liye software VTEP ban raha hai</span>
ip link add vxlan10100 type vxlan id 10100 dstport 4789 local 10.255.0.1 remote 10.255.0.2 dev eth0
ip link set vxlan10100 up
ip -d link show vxlan10100</pre>
<pre class="out">7: vxlan10100: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt; <span class="hl">mtu 1450</span> qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000
    link/ether 6a:3c:1e:2b:9f:10 brd ff:ff:ff:ff:ff:ff promiscuity 0 minmtu 68 maxmtu 65535
    <span class="hl">vxlan id 10100 remote 10.255.0.2 local 10.255.0.1 dev eth0 srcport 0 0 dstport 4789</span> ttl auto ageing 300 udpcsum noudp6zerocsumtx noudp6zerocsumrx</pre>

<div class="warn"><p><b>Common galti.</b> 1500-byte MTU wale underlay par VXLAN overlay banana aur hosts ko 1500 par hi chhod dena. Pings kaam karte hain (chhote packets), par file transfers aur web pages atak jaate hain kyunki bade packets drop hote hain. Hamesha underlay MTU badhao ya overlay MTU ghatao.</p></div>

<div class="exam"><p><b>Exam trap.</b> VXLAN: 24-bit VNI (16 million segments), UDP port 4789, Layer 3/UDP mein encapsulated Layer 2 frames, DCI aur multitenant data centers ke liye use hota hai. SDN control plane ko data plane se alag karta hai; northbound = applications ki taraf, southbound = devices ki taraf.</p></div>

<div class="scn"><h4>DR test jisne VMs move kiye par users nahi</h4><p>Disaster-recovery test ke dauraan, VMs VXLAN DCI par DR site par move kiye gaye. Woh apne original IPs ke saath boot hue, par users kuch hi tak pahunch paaye. Saare VMs ko ping kaam karta tha; bade database queries timeout hote the. WAN provider ke link ka MTU 1500-byte tha. Quick fix ki tarah VM MTU 1450 karne aur link par jumbo frame support order karne se problem solve hui.</p><p><b>Seekh:</b> tunnel ke through "ping chalta hai par application nahi" ka matlab lagbhag hamesha MTU hota hai.</p></div>

<div class="iv"><p class="q">"VXLAN kaunsi problem solve karta hai, aur yeh kaise kaam karta hai?"</p><p>Strong answer: VLANs lagbhag 4,094 IDs tak limited hain aur Layer 3 boundaries cross nahi kar sakte. VXLAN original Ethernet frame ko UDP (port 4789) aur IP mein encapsulate karta hai, 24-bit VNI ke saath jo lagbhag 16 million segments deta hai. Switches ya hypervisors mein VTEPs encapsulate aur decapsulate karte hain. Yeh multitenancy aur data center interconnect ke liye routed underlay par Layer 2 stretch karne deta hai. 50-byte overhead aur MTU, aur modern fabrics mein control plane ki tarah BGP EVPN ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SDN control plane ko ek controller mein centralise karta hai; devices data plane rakhte hain.</li>
<li>Northbound API (REST) applications ko controller se jodta hai; southbound API (OpenFlow, NETCONF, gRPC) controller ko devices se.</li>
<li>VXLAN Layer 2 frames ko IP par UDP 4789 mein encapsulate karta hai, 24-bit VNI ke saath (lagbhag 16 million segments).</li>
<li>VXLAN multitenancy aur data center interconnect ke liye bina spanning tree stretch kiye use hota hai.</li>
<li>Overhead 50 bytes hai: underlay MTU kam se kam 1550, ya jumbo frames.</li>
</ul></div>
`}};export{e as default};