var e={id:`underlay-overlay`,h:{en:`Underlay and overlay`,hi:`Underlay aur overlay`},body:{en:`
<p>Think about a courier company. You hand over a parcel addressed to your friend. The courier puts it in its own box, sticks on a label that says "from Mumbai hub to Delhi hub", and puts it on a truck. The national highways (the roads) do not care what is inside the box; they only move trucks from hub to hub. At the Delhi hub the box is opened and your parcel is delivered to your friend's door. Several courier companies can share the same highways without ever mixing their parcels. In a data center, the <b>highways are the underlay</b> and the <b>courier service is the overlay</b>.</p>

<h3>Two networks, one set of cables</h3>
<dl class="terms">
<dt>Underlay</dt><dd>The physical, routed spine-leaf network: point-to-point links, loopbacks and a routing protocol. Its only job is to move IP packets between switches quickly and reliably.</dd>
<dt>Overlay</dt><dd>A logical network built on top of the underlay with tunnels. It carries tenant traffic (servers, VMs, containers) inside an outer IP header.</dd>
<dt>Tunnel endpoint</dt><dd>The device that adds and removes the outer header. In VXLAN it is called a <b>VTEP</b> (VXLAN Tunnel Endpoint), usually a leaf switch. On NX-OS it is represented by the <code>nve1</code> interface.</dd>
<dt>Encapsulation</dt><dd>Wrapping the original frame inside new headers. Decapsulation is removing them at the far end.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="VXLAN encapsulation layers">
<rect x="10" y="30" width="100" height="44" rx="6" fill="#fed7aa"/><text x="60" y="50" text-anchor="middle" class="svg-ink" font-size="12">Outer Eth</text><text x="60" y="66" text-anchor="middle" class="svg-muted" font-size="12">14 B</text>
<rect x="115" y="30" width="110" height="44" rx="6" fill="#fed7aa"/><text x="170" y="50" text-anchor="middle" class="svg-ink" font-size="12">Outer IP</text><text x="170" y="66" text-anchor="middle" class="svg-muted" font-size="12">VTEP to VTEP</text>
<rect x="230" y="30" width="90" height="44" rx="6" fill="#fde68a"/><text x="275" y="50" text-anchor="middle" class="svg-ink" font-size="12">UDP</text><text x="275" y="66" text-anchor="middle" class="svg-muted" font-size="12">dst 4789</text>
<rect x="325" y="30" width="90" height="44" rx="6" fill="#ddd6fe"/><text x="370" y="50" text-anchor="middle" class="svg-ink" font-size="12">VXLAN</text><text x="370" y="66" text-anchor="middle" class="svg-muted" font-size="12">24-bit VNI</text>
<rect x="420" y="30" width="210" height="44" rx="6" fill="#bbf7d0"/><text x="525" y="50" text-anchor="middle" class="svg-ink" font-size="12">Original Ethernet frame</text><text x="525" y="66" text-anchor="middle" class="svg-muted" font-size="12">server MACs, IPs, data</text>
<text x="215" y="105" text-anchor="middle" class="svg-accent" font-size="12">Added by the VTEP: about 50 bytes</text>
<line x1="10" y1="90" x2="415" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">Underlay routes on the outer IP header only.</text>
<text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">The destination VTEP strips the outer headers and delivers the frame.</text>
</svg><p class="cap">VXLAN wraps a whole Ethernet frame in outer Ethernet, IP, UDP and VXLAN headers.</p></div>

<h3>What the underlay must provide</h3>
<ol>
<li><b>Loopback reachability.</b> Every VTEP address must be reachable from every other VTEP. VTEPs source tunnels from a loopback (in this course: loopback1, 10.254.0.x), so each leaf advertises its loopbacks as /32 routes into the IGP. If a loopback is missing, tunnels to that leaf silently fail.</li>
<li><b>Enough MTU.</b> VXLAN adds about 50 bytes: outer Ethernet 14, outer IPv4 20, UDP 8 and VXLAN 8 (54 if the outer frame carries an 802.1Q tag). VTEPs do not fragment, so a 1,500-byte server packet needs at least 1,550 bytes on every fabric link. The usual practice on Nexus is <code>mtu 9216</code> on all fabric links, which also carries 9,000-byte jumbo frames from servers.</li>
<li><b>ECMP.</b> Many equal paths between VTEPs. The VTEP sets the outer UDP source port from a hash of the inner packet, so different inner flows get different outer headers and spread across all spines.</li>
<li><b>Fast, stable convergence.</b> A simple IGP (OSPF or IS-IS) or eBGP, often with BFD. For flooding of broadcast and unknown traffic, the underlay may also run multicast (PIM), or the overlay may use ingress replication instead.</li>
</ol>

<h3>What the overlay adds</h3>
<ul>
<li><b>Multitenancy.</b> Each segment gets a <b>VNI</b> (VXLAN Network Identifier). Tenants live in separate VRFs, so two customers can even use the same IP ranges.</li>
<li><b>Scale.</b> A VNI is 24 bits: 2^24, about <b>16.7 million</b> segments, versus 4,094 usable VLAN IDs (12 bits).</li>
<li><b>Mobility.</b> Any segment can exist on any leaf, so a VM keeps its IP wherever it moves.</li>
<li><b>Decoupling.</b> Tenant changes (new VLAN, new VRF) touch only the leaves involved; the underlay stays untouched and boring, which is exactly what you want.</li>
</ul>

<h3>Configuring the underlay part on a leaf</h3>
<p>This is the underlay you build in this module. The fabric link gets a /31 and jumbo MTU; two loopbacks are advertised into OSPF: loopback0 for the router ID and loopback1 for the future VTEP.</p>
<pre class="code"><span class="c">! LEAF1 underlay essentials</span>
feature ospf
interface loopback0
  ip address 10.255.0.1/32
  ip router ospf UNDERLAY area 0.0.0.0
interface loopback1
  ip address 10.254.0.1/32
  ip router ospf UNDERLAY area 0.0.0.0
interface Ethernet1/1
  description to SPINE1
  no switchport
  mtu 9216
  ip address 10.1.1.1/31
  ip ospf network point-to-point
  ip router ospf UNDERLAY area 0.0.0.0
  no shutdown</pre>
<p>For recognition only, this is what the overlay adds later in the VXLAN EVPN module. Do not worry about every line yet:</p>
<pre class="code"><span class="c">! Preview: VXLAN with BGP EVPN (covered in a later module)</span>
feature nv overlay
feature vn-segment-vlan-based
vlan 10
  vn-segment 10010
interface nve1
  no shutdown
  source-interface loopback1
  host-reachability protocol bgp
  member vni 10010
    ingress-replication protocol bgp</pre>

<h3>Verifying the underlay is ready for an overlay</h3>
<p>From LEAF1, the remote VTEP loopback must be present with one path per spine, and a full-size packet with the don't-fragment bit must pass.</p>
<pre class="out">LEAF1# show ip route 10.254.0.2
10.254.0.2/32, ubest/mbest: 2/0
<span class="hl">    *via 10.1.1.0, Eth1/1, [110/81], 01:12:40, ospf-UNDERLAY, intra
    *via 10.1.2.0, Eth1/2, [110/81], 01:12:40, ospf-UNDERLAY, intra</span>

LEAF1# ping 10.254.0.2 source 10.254.0.1 packet-size 8972 df-bit count 2
PING 10.254.0.2 (10.254.0.2) from 10.254.0.1: 8972 data bytes
<span class="hl">8980 bytes from 10.254.0.2: icmp_seq=0 ttl=254 time=1.1 ms</span>
8980 bytes from 10.254.0.2: icmp_seq=1 ttl=254 time=0.9 ms</pre>

<h3>Control planes and ACI (preview)</h3>
<p>How does a VTEP know which remote VTEP hosts a given MAC? Early VXLAN used <b>flood-and-learn</b> over underlay multicast, like a classic switch. Modern fabrics use <b>BGP EVPN</b>: each leaf advertises the MAC and IP addresses of its local hosts as BGP routes, so others learn them without flooding. <b>Cisco ACI</b> uses the same underlay/overlay split but automates it: the APIC controller builds an IS-IS underlay by itself, spines keep an endpoint database (COOP), and you describe policy (tenants, EPGs, contracts) instead of VLANs and VNIs.</p>

<div class="warn"><p><b>Common mistakes.</b> Leaving fabric links at MTU 1500: small pings work, large transfers and VM migrations fail. Forgetting to advertise the VTEP loopback into the IGP. Putting tenant subnets into the underlay. Trying to troubleshoot the overlay before proving the underlay (loopback to loopback ping with full MTU) is healthy.</p></div>
<div class="exam"><p><b>Exam tip.</b> VXLAN: UDP destination port 4789, 24-bit VNI (about 16M segments), about 50 bytes of overhead, VTEP = tunnel endpoint (nve interface on NX-OS). Underlay needs loopback reachability, MTU and ECMP. BGP EVPN is the control plane; ACI automates the same model with APIC.</p></div>

<div class="scn"><h4>Pings work, migrations fail</h4><p>After a new spine (SPINE3) was added, the virtualisation team reported that about a third of VM live migrations between racks were timing out, although every ping succeeded. The engineer pinged VTEP to VTEP with <code>ping 10.254.0.7 source 10.254.0.1 packet-size 8972 df-bit</code>: some attempts failed, depending on which spine the flow hashed to. <code>show interface ethernet1/3</code> on SPINE3 showed <code>MTU 1500 bytes</code>. The install template had missed <code>mtu 9216</code> on the new spine's fabric ports. Large encapsulated packets hashed through SPINE3 were dropped. Adding <code>mtu 9216</code> to every SPINE3 fabric interface fixed it immediately.</p><p><b>Lesson:</b> the underlay must have consistent jumbo MTU on every link; test with don't-fragment pings at full size, not with default small pings.</p></div>

<div class="iv"><p class="q">"What does the underlay need to provide for a VXLAN overlay to work?"</p><p>Strong answer: IP reachability between all VTEP loopbacks (advertised as /32 in the IGP), MTU large enough for about 50 bytes of VXLAN overhead (in practice 9216 on fabric links), ECMP across the spines (helped by the UDP source port entropy), and fast stable convergence, plus multicast only if you use multicast replication for BUM traffic. Then explain what the overlay adds: VNIs for 16 million segments, tenant VRFs, mobility, and a BGP EVPN control plane.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay = routed physical fabric; overlay = tunnels on top that carry tenant traffic.</li>
<li>VTEPs on leaves encapsulate frames in VXLAN (UDP 4789, 24-bit VNI, about 50 bytes overhead).</li>
<li>Underlay must provide loopback reachability, jumbo MTU and ECMP, with fast convergence.</li>
<li>Overlay adds multitenancy, 16M segments, mobility and separation from the underlay.</li>
<li>BGP EVPN is the modern overlay control plane; ACI automates the same design with APIC.</li>
</ul></div>
`,hi:`
<p>Ek courier company ke baare mein socho. Aap apne dost ke naam ka parcel dete ho. Courier use apne box mein daalta hai, us par "Mumbai hub se Delhi hub" ka label lagata hai, aur truck par chadha deta hai. National highways (sadkein) ko farak nahi padta ki box ke andar kya hai; woh bas trucks ko ek hub se dusre hub tak le jaate hain. Delhi hub par box khulta hai aur aapka parcel dost ke darwaze tak pahunch jaata hai. Kai courier companies ek hi highways share kar sakti hain aur unke parcels kabhi mix nahi hote. Data center mein <b>highways underlay hain</b> aur <b>courier service overlay hai</b>.</p>

<h3>Do networks, cables ka ek hi set</h3>
<dl class="terms">
<dt>Underlay</dt><dd>Physical, routed spine-leaf network: point-to-point links, loopbacks aur ek routing protocol. Iska ek hi kaam hai switches ke beech IP packets ko jaldi aur reliably move karna.</dd>
<dt>Overlay</dt><dd>Underlay ke upar tunnels se bana ek logical network. Yeh tenant traffic (servers, VMs, containers) ko ek outer IP header ke andar le jaata hai.</dd>
<dt>Tunnel endpoint</dt><dd>Woh device jo outer header jodta aur hatata hai. VXLAN mein ise <b>VTEP</b> (VXLAN Tunnel Endpoint) kehte hain, aam taur par ek leaf switch. NX-OS par ise <code>nve1</code> interface represent karta hai.</dd>
<dt>Encapsulation</dt><dd>Original frame ko naye headers ke andar lapetna. Decapsulation matlab dusre end par unhe hatana.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="VXLAN encapsulation layers">
<rect x="10" y="30" width="100" height="44" rx="6" fill="#fed7aa"/><text x="60" y="50" text-anchor="middle" class="svg-ink" font-size="12">Outer Eth</text><text x="60" y="66" text-anchor="middle" class="svg-muted" font-size="12">14 B</text>
<rect x="115" y="30" width="110" height="44" rx="6" fill="#fed7aa"/><text x="170" y="50" text-anchor="middle" class="svg-ink" font-size="12">Outer IP</text><text x="170" y="66" text-anchor="middle" class="svg-muted" font-size="12">VTEP se VTEP</text>
<rect x="230" y="30" width="90" height="44" rx="6" fill="#fde68a"/><text x="275" y="50" text-anchor="middle" class="svg-ink" font-size="12">UDP</text><text x="275" y="66" text-anchor="middle" class="svg-muted" font-size="12">dst 4789</text>
<rect x="325" y="30" width="90" height="44" rx="6" fill="#ddd6fe"/><text x="370" y="50" text-anchor="middle" class="svg-ink" font-size="12">VXLAN</text><text x="370" y="66" text-anchor="middle" class="svg-muted" font-size="12">24-bit VNI</text>
<rect x="420" y="30" width="210" height="44" rx="6" fill="#bbf7d0"/><text x="525" y="50" text-anchor="middle" class="svg-ink" font-size="12">Original Ethernet frame</text><text x="525" y="66" text-anchor="middle" class="svg-muted" font-size="12">server MACs, IPs, data</text>
<text x="215" y="105" text-anchor="middle" class="svg-accent" font-size="12">VTEP jodta hai: lagbhag 50 bytes</text>
<line x1="10" y1="90" x2="415" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">Underlay sirf outer IP header par route karta hai.</text>
<text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">Destination VTEP outer headers hata kar frame deliver karta hai.</text>
</svg><p class="cap">VXLAN poore Ethernet frame ko outer Ethernet, IP, UDP aur VXLAN headers mein lapet-ta hai.</p></div>

<h3>Underlay ko kya dena chahiye</h3>
<ol>
<li><b>Loopback reachability.</b> Har VTEP address har dusre VTEP se reachable hona chahiye. VTEPs tunnels ko ek loopback se source karte hain (is course mein: loopback1, 10.254.0.x), isliye har leaf apne loopbacks ko IGP mein /32 routes ki tarah advertise karta hai. Agar ek loopback missing ho, to us leaf tak tunnels chupchaap fail ho jaate hain.</li>
<li><b>Kaafi MTU.</b> VXLAN lagbhag 50 bytes jodta hai: outer Ethernet 14, outer IPv4 20, UDP 8 aur VXLAN 8 (agar outer frame mein 802.1Q tag ho to 54). VTEPs fragment nahi karte, isliye 1,500-byte server packet ko har fabric link par kam se kam 1,550 bytes chahiye. Nexus par common practice hai saare fabric links par <code>mtu 9216</code>, jo servers ke 9,000-byte jumbo frames bhi le jaata hai.</li>
<li><b>ECMP.</b> VTEPs ke beech kai barabar paths. VTEP inner packet ke hash se outer UDP source port set karta hai, isliye alag inner flows ko alag outer headers milte hain aur woh saare spines par fail jaate hain.</li>
<li><b>Fast, stable convergence.</b> Ek simple IGP (OSPF ya IS-IS) ya eBGP, aksar BFD ke saath. Broadcast aur unknown traffic ki flooding ke liye underlay multicast (PIM) bhi chala sakta hai, ya overlay uski jagah ingress replication use kar sakta hai.</li>
</ol>

<h3>Overlay kya jodta hai</h3>
<ul>
<li><b>Multitenancy.</b> Har segment ko ek <b>VNI</b> (VXLAN Network Identifier) milta hai. Tenants alag VRFs mein rehte hain, isliye do customers same IP ranges bhi use kar sakte hain.</li>
<li><b>Scale.</b> VNI 24 bits ka hai: 2^24, lagbhag <b>1.67 crore (16.7 million)</b> segments, jabki usable VLAN IDs sirf 4,094 hain (12 bits).</li>
<li><b>Mobility.</b> Koi bhi segment kisi bhi leaf par ho sakta hai, isliye VM jahan bhi move kare apna IP rakhta hai.</li>
<li><b>Decoupling.</b> Tenant changes (naya VLAN, naya VRF) sirf involved leaves ko chhoote hain; underlay untouched aur boring rehta hai, jo bilkul aapko chahiye.</li>
</ul>

<h3>Leaf par underlay wala hissa configure karna</h3>
<p>Yeh woh underlay hai jo aap is module mein banate ho. Fabric link ko /31 aur jumbo MTU milta hai; do loopbacks OSPF mein advertise hote hain: router ID ke liye loopback0 aur future VTEP ke liye loopback1.</p>
<pre class="code"><span class="c">! LEAF1 underlay essentials</span>
feature ospf
interface loopback0
  ip address 10.255.0.1/32
  ip router ospf UNDERLAY area 0.0.0.0
interface loopback1
  ip address 10.254.0.1/32
  ip router ospf UNDERLAY area 0.0.0.0
interface Ethernet1/1
  description to SPINE1
  no switchport
  mtu 9216
  ip address 10.1.1.1/31
  ip ospf network point-to-point
  ip router ospf UNDERLAY area 0.0.0.0
  no shutdown</pre>
<p>Sirf pehchanne ke liye, yeh woh hai jo overlay baad mein VXLAN EVPN module mein jodta hai. Abhi har line ki fikr mat karo:</p>
<pre class="code"><span class="c">! Preview: BGP EVPN ke saath VXLAN (baad ke module mein cover hoga)</span>
feature nv overlay
feature vn-segment-vlan-based
vlan 10
  vn-segment 10010
interface nve1
  no shutdown
  source-interface loopback1
  host-reachability protocol bgp
  member vni 10010
    ingress-replication protocol bgp</pre>

<h3>Verify karna ki underlay overlay ke liye ready hai</h3>
<p>LEAF1 se remote VTEP loopback har spine ke liye ek path ke saath present hona chahiye, aur don't-fragment bit wala full-size packet paas hona chahiye.</p>
<pre class="out">LEAF1# show ip route 10.254.0.2
10.254.0.2/32, ubest/mbest: 2/0
<span class="hl">    *via 10.1.1.0, Eth1/1, [110/81], 01:12:40, ospf-UNDERLAY, intra
    *via 10.1.2.0, Eth1/2, [110/81], 01:12:40, ospf-UNDERLAY, intra</span>

LEAF1# ping 10.254.0.2 source 10.254.0.1 packet-size 8972 df-bit count 2
PING 10.254.0.2 (10.254.0.2) from 10.254.0.1: 8972 data bytes
<span class="hl">8980 bytes from 10.254.0.2: icmp_seq=0 ttl=254 time=1.1 ms</span>
8980 bytes from 10.254.0.2: icmp_seq=1 ttl=254 time=0.9 ms</pre>

<h3>Control planes aur ACI (preview)</h3>
<p>VTEP ko kaise pata chalta hai ki kaunsa remote VTEP ek given MAC ko host karta hai? Shuruaati VXLAN underlay multicast par <b>flood-and-learn</b> use karta tha, classic switch ki tarah. Modern fabrics <b>BGP EVPN</b> use karte hain: har leaf apne local hosts ke MAC aur IP addresses BGP routes ki tarah advertise karta hai, isliye baaki bina flooding ke unhe seekh lete hain. <b>Cisco ACI</b> wahi underlay/overlay split use karta hai lekin use automate karta hai: APIC controller khud IS-IS underlay banata hai, spines ek endpoint database (COOP) rakhte hain, aur aap VLANs aur VNIs ki jagah policy (tenants, EPGs, contracts) describe karte ho.</p>

<div class="warn"><p><b>Common galtiyan.</b> Fabric links ko MTU 1500 par chhod dena: chhote pings chalte hain, bade transfers aur VM migrations fail hote hain. VTEP loopback ko IGP mein advertise karna bhool jaana. Tenant subnets ko underlay mein daalna. Underlay healthy hai yeh prove kiye bina (full MTU ke saath loopback se loopback ping) overlay troubleshoot karne ki koshish karna.</p></div>
<div class="exam"><p><b>Exam tip.</b> VXLAN: UDP destination port 4789, 24-bit VNI (lagbhag 16M segments), lagbhag 50 bytes overhead, VTEP = tunnel endpoint (NX-OS par nve interface). Underlay ko loopback reachability, MTU aur ECMP chahiye. BGP EVPN control plane hai; ACI APIC ke saath wahi model automate karta hai.</p></div>

<div class="scn"><h4>Pings chalte hain, migrations fail hote hain</h4><p>Naya spine (SPINE3) jodne ke baad virtualisation team ne report kiya ki racks ke beech lagbhag ek tihaai VM live migrations time out ho rahe the, jabki har ping succeed ho raha tha. Engineer ne VTEP se VTEP <code>ping 10.254.0.7 source 10.254.0.1 packet-size 8972 df-bit</code> kiya: kuch attempts fail hue, is par depend karte hue ki flow kis spine par hash hua. SPINE3 par <code>show interface ethernet1/3</code> ne <code>MTU 1500 bytes</code> dikhaya. Install template naye spine ke fabric ports par <code>mtu 9216</code> miss kar gaya tha. SPINE3 se hash hone wale bade encapsulated packets drop ho rahe the. SPINE3 ke har fabric interface par <code>mtu 9216</code> jodne se turant fix ho gaya.</p><p><b>Seekh:</b> underlay ke har link par consistent jumbo MTU hona chahiye; default chhote pings se nahi, full size ke don't-fragment pings se test karo.</p></div>

<div class="iv"><p class="q">"VXLAN overlay kaam kare, iske liye underlay ko kya provide karna chahiye?"</p><p>Strong answer: saare VTEP loopbacks ke beech IP reachability (IGP mein /32 ki tarah advertised), lagbhag 50 bytes VXLAN overhead ke liye kaafi bada MTU (practice mein fabric links par 9216), spines ke paar ECMP (UDP source port entropy isme madad karti hai), aur fast stable convergence, plus multicast sirf tab jab aap BUM traffic ke liye multicast replication use karo. Phir batao ki overlay kya jodta hai: 16 million segments ke liye VNIs, tenant VRFs, mobility, aur BGP EVPN control plane.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay = routed physical fabric; overlay = upar ke tunnels jo tenant traffic le jaate hain.</li>
<li>Leaves par VTEPs frames ko VXLAN mein encapsulate karte hain (UDP 4789, 24-bit VNI, lagbhag 50 bytes overhead).</li>
<li>Underlay ko loopback reachability, jumbo MTU aur ECMP dena chahiye, fast convergence ke saath.</li>
<li>Overlay multitenancy, 16M segments, mobility aur underlay se separation jodta hai.</li>
<li>BGP EVPN modern overlay control plane hai; ACI APIC ke saath wahi design automate karta hai.</li>
</ul></div>
`}};export{e as default};