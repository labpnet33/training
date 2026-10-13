var e={id:`external`,h:{en:`External connectivity: border leaf, type-5 and VRF-lite`,hi:`External connectivity: border leaf, type-5 aur VRF-lite`},body:{en:`
<p>A gated campus has many internal roads, but only one or two gates connect it to the city. Deliveries from outside enter through the gate; residents leaving the campus drive to the gate. Nobody builds a gate behind every house. In an EVPN fabric the gate is the <b>border leaf</b>: a leaf (usually a pair) that connects the fabric's tenant VRFs to firewalls, WAN routers or the internet edge. It learns external routes, converts them into EVPN <b>type-5</b> routes for the rest of the fabric, and tells the outside world which tenant subnets live inside.</p>

<h3>What the border leaf does</h3>
<ol>
<li><b>Hands off each VRF</b> to an external device using <b>VRF-lite</b>: one Layer-3 subinterface (or SVI) per VRF, with a routing protocol (usually eBGP, sometimes OSPF or static) per VRF.</li>
<li><b>Imports external routes</b>, for example a default route 0.0.0.0/0 from the firewall, into the tenant VRF's BGP table.</li>
<li><b>Re-advertises them into EVPN</b> as type-5 routes with the L3VNI label, its own VTEP as next hop and its Router MAC. Every leaf installs them in the tenant VRF.</li>
<li><b>Advertises tenant prefixes outward</b>: the subnets learned from the fabric (type-5 and optionally host routes) are sent to the firewall so return traffic knows the way in.</li>
</ol>
<p>A border leaf is still a normal VTEP: it has an NVE interface, the tenant's L3VNI and the VRF. It usually does not need the tenant's L2VNIs because it hosts no servers.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Border leaf with VRF-lite to firewall">
<rect x="240" y="15" width="160" height="36" rx="6" fill="#ddd6fe"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="12">Spines (RR)</text>
<rect x="20" y="110" width="120" height="40" rx="6" fill="#bae6fd"/><text x="80" y="135" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text>
<rect x="170" y="110" width="120" height="40" rx="6" fill="#bae6fd"/><text x="230" y="135" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text>
<rect x="380" y="110" width="150" height="40" rx="6" fill="#fde68a"/><text x="455" y="128" text-anchor="middle" class="svg-ink" font-size="12">BORDER1</text><text x="455" y="144" text-anchor="middle" class="svg-muted" font-size="12">VTEP 10.254.0.9</text>
<rect x="400" y="190" width="110" height="36" rx="6" fill="#fed7aa"/><text x="455" y="213" text-anchor="middle" class="svg-ink" font-size="12">Firewall</text>
<line x1="80" y1="110" x2="290" y2="51" stroke="#64748b" stroke-width="2"/><line x1="230" y1="110" x2="310" y2="51" stroke="#64748b" stroke-width="2"/><line x1="455" y1="110" x2="350" y2="51" stroke="#64748b" stroke-width="2"/>
<line x1="455" y1="150" x2="455" y2="190" stroke="#64748b" stroke-width="3"/><text x="520" y="175" class="svg-accent" font-size="12">Eth1/49.100 eBGP</text>
<text x="160" y="195" text-anchor="middle" class="svg-muted" font-size="12">0.0.0.0/0 as type 5, L3VNI 50001</text>
</svg><p class="cap">The firewall speaks eBGP to the border leaf inside VRF TENANT-A; the border leaf turns the default route into a type-5 route for all leaves.</p></div>

<h3>Configuration: border leaf with VRF-lite and eBGP</h3>
<pre class="code"><span class="c">! BORDER1: tenant VRF and L3VNI exactly as on the other leaves (chapter 9)</span>
interface Ethernet1/49
  no switchport
  no shutdown
interface Ethernet1/49.100
  encapsulation dot1q 100
  vrf member TENANT-A
  ip address 198.51.100.1/30
  no shutdown
router bgp 65001
  vrf TENANT-A
    address-family ipv4 unicast
      advertise l2vpn evpn
      aggregate-address 172.16.0.0/16 summary-only
    neighbor 198.51.100.2
      remote-as 65100
      address-family ipv4 unicast</pre>
<p>What each part does: the 802.1Q subinterface puts one VLAN tag per VRF on the physical link (VRF-lite); the eBGP neighbor lives <b>inside</b> the VRF, so its routes land in TENANT-A; routes learned from the firewall are exported into EVPN as type 5 automatically, because the VRF has <code>route-target both auto evpn</code>; the aggregate sends one summary to the firewall instead of hundreds of host /32 routes.</p>
<p>If the firewall cannot run BGP, use a static default in the VRF and redistribute it. NX-OS needs a route-map on redistribution and, for a default route, <code>default-information originate</code>:</p>
<pre class="code">vrf context TENANT-A
  ip route 0.0.0.0/0 198.51.100.2
route-map RM-DEFAULT permit 10
  match ip address prefix-list PL-DEFAULT
ip prefix-list PL-DEFAULT seq 5 permit 0.0.0.0/0
router bgp 65001
  vrf TENANT-A
    address-family ipv4 unicast
      redistribute static route-map RM-DEFAULT
      default-information originate</pre>

<h3>Verification</h3>
<pre class="out">BORDER1# show bgp vrf TENANT-A ipv4 unicast summary
Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">198.51.100.2    4 65100     230     228       31    0    0 03:40:12 1</span>
LEAF1# show bgp l2vpn evpn route-type 5 | include 0.0.0.0
<span class="hl">BGP routing table entry for [5]:[0]:[0]:[0]:[0.0.0.0]/224, version 101</span>
LEAF1# show ip route vrf TENANT-A 0.0.0.0/0
0.0.0.0/0, ubest/mbest: 1/0
<span class="hl">    *via 10.254.0.9%default, [200/0], 01:02:11, bgp-65001, internal, tag 65100, segid: 50001 tunnelid: 0xafe0009 encap: VXLAN</span></pre>
<p>The chain to verify: the eBGP session in the VRF is up and receives the default; the border leaf originates a type-5 route for 0.0.0.0/0; every leaf installs it in VRF TENANT-A with the border leaf's VTEP as next hop and segid 50001.</p>

<h3>Design notes</h3>
<ul>
<li><b>Always two border leaves</b>, each with its own link to the firewall pair. Leaves receive the default from both and use ECMP.</li>
<li><b>Inter-tenant traffic</b> usually goes through the firewall: tenant A's VRF and tenant B's VRF each peer with the firewall, which enforces policy between them. Route leaking between VRFs on the fabric is possible but bypasses the firewall.</li>
<li><b>Advertise summaries outward</b> to protect external devices with small route tables.</li>
<li>The external link is plain routed Ethernet: no VXLAN, so no jumbo MTU requirement for VXLAN overhead there.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Tenant A has 12 subnets and 3,000 active hosts. Without filtering, BORDER1 would send 12 subnet routes plus 3,000 host /32 routes to the firewall. With <code>aggregate-address 172.16.0.0/16 summary-only</code> it sends a single route. The firewall's 1,024-route limit per virtual context is no longer a risk.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Putting the external subinterface in the default VRF instead of the tenant VRF; configuring the eBGP neighbor under the global BGP process instead of under <code>vrf TENANT-A</code>; forgetting the tenant's L3VNI on the border leaf (type-5 routes then point to a VTEP that cannot route for the VRF); redistributing a static default without <code>default-information originate</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> External routes enter the fabric as <b>type-5</b> routes, never type 2. VRF-lite means one Layer-3 interface and one routing adjacency per VRF on the external link.</p></div>

<div class="scn"><h4>The firewall that fell over at 9 a.m.</h4><p>A bank's border leaves advertised every EVPN route in the tenant VRF to the firewall pair. At 9 a.m. thousands of virtual desktops booted, each creating a type-2 MAC/IP route and a /32 host route. The firewall's per-context route limit was exceeded, BGP sessions to the border leaves were reset by the firewall's protection, and the default route disappeared from the fabric: all tenant internet access was lost. The fix was an outbound policy: <code>aggregate-address 172.16.0.0/16 summary-only</code> in the VRF (and a prefix-list blocking /32s) toward the firewall. The firewall then held a handful of routes regardless of how many hosts came online.</p><p><b>Lesson:</b> the fabric carries host routes internally; the outside world should only see summaries.</p></div>

<div class="iv"><p class="q">"How do you connect an EVPN fabric to a firewall or WAN router?"</p><p>Strong answer: through a pair of border leaves using VRF-lite: one 802.1Q subinterface per tenant VRF, and an eBGP (or OSPF/static) session inside each VRF. Routes from outside, like the default, are exported by the border leaf into EVPN as type-5 routes with the L3VNI and its VTEP as next hop, so every leaf routes north-south traffic to the border leaf. Toward the outside, send summaries, not host routes. The border leaf needs the tenant VRF and L3VNI but not the L2VNIs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The border leaf is a VTEP that also peers with external devices per VRF (VRF-lite).</li>
<li>External routes become type-5 routes with the L3VNI and the border leaf VTEP as next hop.</li>
<li>Configure the external eBGP neighbor under router bgp / vrf TENANT-A.</li>
<li>Summarise outward to protect firewalls and routers from host-route floods.</li>
<li>Use two border leaves; leaves get ECMP to both.</li>
</ul></div>
`,hi:`
<p>Ek gated campus mein bahut saari andar ki sadkein hoti hain, lekin sirf ek ya do gates use shehar se jodte hain. Bahar se deliveries gate se andar aati hain; campus chhodne wale residents gate tak drive karte hain. Koi har ghar ke peeche gate nahi banata. EVPN fabric mein gate <b>border leaf</b> hai: ek leaf (aam taur par jodi) jo fabric ke tenant VRFs ko firewalls, WAN routers ya internet edge se jodta hai. Yeh external routes seekhta hai, unhe baaki fabric ke liye EVPN <b>type-5</b> routes mein badalta hai, aur bahar ki duniya ko batata hai ki kaunse tenant subnets andar hain.</p>

<h3>Border leaf kya karta hai</h3>
<ol>
<li><b>Har VRF ko handoff</b> karta hai external device ko <b>VRF-lite</b> se: har VRF ke liye ek Layer-3 subinterface (ya SVI), aur har VRF ka ek routing protocol (aam taur par eBGP, kabhi OSPF ya static).</li>
<li><b>External routes import</b> karta hai, jaise firewall se default route 0.0.0.0/0, tenant VRF ki BGP table mein.</li>
<li><b>Unhe EVPN mein dobara advertise</b> karta hai type-5 routes ki tarah, L3VNI label, apne VTEP ko next hop aur apne Router MAC ke saath. Har leaf unhe tenant VRF mein install karta hai.</li>
<li><b>Tenant prefixes bahar advertise</b> karta hai: fabric se seekhe subnets (type-5 aur optionally host routes) firewall ko bheje jaate hain taaki return traffic ko andar ka raasta pata ho.</li>
</ol>
<p>Border leaf abhi bhi normal VTEP hai: uske paas NVE interface, tenant ka L3VNI aur VRF hota hai. Aam taur par use tenant ke L2VNIs nahi chahiye kyunki woh koi servers host nahi karta.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Firewall tak VRF-lite wala border leaf">
<rect x="240" y="15" width="160" height="36" rx="6" fill="#ddd6fe"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="12">Spines (RR)</text>
<rect x="20" y="110" width="120" height="40" rx="6" fill="#bae6fd"/><text x="80" y="135" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text>
<rect x="170" y="110" width="120" height="40" rx="6" fill="#bae6fd"/><text x="230" y="135" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text>
<rect x="380" y="110" width="150" height="40" rx="6" fill="#fde68a"/><text x="455" y="128" text-anchor="middle" class="svg-ink" font-size="12">BORDER1</text><text x="455" y="144" text-anchor="middle" class="svg-muted" font-size="12">VTEP 10.254.0.9</text>
<rect x="400" y="190" width="110" height="36" rx="6" fill="#fed7aa"/><text x="455" y="213" text-anchor="middle" class="svg-ink" font-size="12">Firewall</text>
<line x1="80" y1="110" x2="290" y2="51" stroke="#64748b" stroke-width="2"/><line x1="230" y1="110" x2="310" y2="51" stroke="#64748b" stroke-width="2"/><line x1="455" y1="110" x2="350" y2="51" stroke="#64748b" stroke-width="2"/>
<line x1="455" y1="150" x2="455" y2="190" stroke="#64748b" stroke-width="3"/><text x="520" y="175" class="svg-accent" font-size="12">Eth1/49.100 eBGP</text>
<text x="160" y="195" text-anchor="middle" class="svg-muted" font-size="12">0.0.0.0/0 type 5 ki tarah, L3VNI 50001</text>
</svg><p class="cap">Firewall VRF TENANT-A ke andar border leaf se eBGP bolta hai; border leaf default route ko saare leaves ke liye type-5 route bana deta hai.</p></div>

<h3>Configuration: VRF-lite aur eBGP wala border leaf</h3>
<pre class="code"><span class="c">! BORDER1: tenant VRF aur L3VNI bilkul baaki leaves jaisa (chapter 9)</span>
interface Ethernet1/49
  no switchport
  no shutdown
interface Ethernet1/49.100
  encapsulation dot1q 100
  vrf member TENANT-A
  ip address 198.51.100.1/30
  no shutdown
router bgp 65001
  vrf TENANT-A
    address-family ipv4 unicast
      advertise l2vpn evpn
      aggregate-address 172.16.0.0/16 summary-only
    neighbor 198.51.100.2
      remote-as 65100
      address-family ipv4 unicast</pre>
<p>Har hissa kya karta hai: 802.1Q subinterface physical link par har VRF ka ek VLAN tag lagata hai (VRF-lite); eBGP neighbor VRF ke <b>andar</b> rehta hai, isliye uske routes TENANT-A mein aate hain; firewall se seekhe routes apne aap type 5 ki tarah EVPN mein export hote hain, kyunki VRF mein <code>route-target both auto evpn</code> hai; aggregate firewall ko sainkdon host /32 routes ki jagah ek summary bhejta hai.</p>
<p>Agar firewall BGP nahi chala sakta, to VRF mein static default use karo aur use redistribute karo. NX-OS ko redistribution par route-map chahiye aur default route ke liye <code>default-information originate</code>:</p>
<pre class="code">vrf context TENANT-A
  ip route 0.0.0.0/0 198.51.100.2
route-map RM-DEFAULT permit 10
  match ip address prefix-list PL-DEFAULT
ip prefix-list PL-DEFAULT seq 5 permit 0.0.0.0/0
router bgp 65001
  vrf TENANT-A
    address-family ipv4 unicast
      redistribute static route-map RM-DEFAULT
      default-information originate</pre>

<h3>Verification</h3>
<pre class="out">BORDER1# show bgp vrf TENANT-A ipv4 unicast summary
Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">198.51.100.2    4 65100     230     228       31    0    0 03:40:12 1</span>
LEAF1# show bgp l2vpn evpn route-type 5 | include 0.0.0.0
<span class="hl">BGP routing table entry for [5]:[0]:[0]:[0]:[0.0.0.0]/224, version 101</span>
LEAF1# show ip route vrf TENANT-A 0.0.0.0/0
0.0.0.0/0, ubest/mbest: 1/0
<span class="hl">    *via 10.254.0.9%default, [200/0], 01:02:11, bgp-65001, internal, tag 65100, segid: 50001 tunnelid: 0xafe0009 encap: VXLAN</span></pre>
<p>Verify karne ki chain: VRF mein eBGP session up hai aur default receive karta hai; border leaf 0.0.0.0/0 ka type-5 route originate karta hai; har leaf use VRF TENANT-A mein border leaf ke VTEP ko next hop aur segid 50001 ke saath install karta hai.</p>

<h3>Design notes</h3>
<ul>
<li><b>Hamesha do border leaves</b>, har ek ka firewall pair tak apna link. Leaves dono se default paate hain aur ECMP use karte hain.</li>
<li><b>Inter-tenant traffic</b> aam taur par firewall se jaata hai: tenant A ka VRF aur tenant B ka VRF dono firewall se peer karte hain, jo unke beech policy enforce karta hai. Fabric par VRFs ke beech route leaking possible hai lekin woh firewall ko bypass karta hai.</li>
<li>Chhoti route tables wale external devices ko bachane ke liye <b>bahar summaries advertise karo</b>.</li>
<li>External link plain routed Ethernet hai: VXLAN nahi, isliye wahan VXLAN overhead ke liye jumbo MTU ki zaroorat nahi.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Tenant A ke 12 subnets aur 3,000 active hosts hain. Filtering ke bina BORDER1 firewall ko 12 subnet routes plus 3,000 host /32 routes bhejta. <code>aggregate-address 172.16.0.0/16 summary-only</code> ke saath woh ek hi route bhejta hai. Firewall ki har virtual context ki 1,024-route limit ab risk nahi hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> External subinterface ko tenant VRF ki jagah default VRF mein daalna; eBGP neighbor ko <code>vrf TENANT-A</code> ki jagah global BGP process ke neeche configure karna; border leaf par tenant ka L3VNI bhoolna (tab type-5 routes aise VTEP ki taraf point karte hain jo VRF ke liye route nahi kar sakta); <code>default-information originate</code> ke bina static default redistribute karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> External routes fabric mein <b>type-5</b> routes ki tarah aate hain, type 2 kabhi nahi. VRF-lite matlab external link par har VRF ka ek Layer-3 interface aur ek routing adjacency.</p></div>

<div class="scn"><h4>Woh firewall jo subah 9 baje gir gaya</h4><p>Ek bank ke border leaves tenant VRF ka har EVPN route firewall pair ko advertise karte the. Subah 9 baje hazaaron virtual desktops boot hue, har ek ne type-2 MAC/IP route aur /32 host route banaya. Firewall ki per-context route limit cross ho gayi, firewall ki protection ne border leaves ke BGP sessions reset kar diye, aur default route fabric se gayab ho gaya: saare tenant internet access chale gaye. Fix tha ek outbound policy: firewall ki taraf VRF mein <code>aggregate-address 172.16.0.0/16 summary-only</code> (aur /32s block karne wali prefix-list). Uske baad firewall ke paas kuch hi routes rehte the, chahe kitne bhi hosts online aayein.</p><p><b>Seekh:</b> fabric andar host routes le jaata hai; bahar ki duniya ko sirf summaries dikhni chahiye.</p></div>

<div class="iv"><p class="q">"EVPN fabric ko firewall ya WAN router se kaise jodoge?"</p><p>Strong answer: border leaves ki jodi ke through VRF-lite se: har tenant VRF ka ek 802.1Q subinterface, aur har VRF ke andar ek eBGP (ya OSPF/static) session. Bahar se aaye routes, jaise default, border leaf EVPN mein type-5 routes ki tarah export karta hai L3VNI aur apne VTEP ko next hop bana kar, isliye har leaf north-south traffic border leaf ki taraf route karta hai. Bahar ki taraf summaries bhejo, host routes nahi. Border leaf ko tenant VRF aur L3VNI chahiye, L2VNIs nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Border leaf ek VTEP hai jo har VRF mein external devices se bhi peer karta hai (VRF-lite).</li>
<li>External routes L3VNI aur border leaf VTEP next hop wale type-5 routes ban jaate hain.</li>
<li>External eBGP neighbor router bgp / vrf TENANT-A ke neeche configure karo.</li>
<li>Firewalls aur routers ko host-route flood se bachane ke liye bahar summarise karo.</li>
<li>Do border leaves use karo; leaves ko dono tak ECMP milta hai.</li>
</ul></div>
`}};export{e as default};