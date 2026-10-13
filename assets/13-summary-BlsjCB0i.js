var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with a fabric that flooded ARP everywhere and needed a hand-written peer list on every leaf. You now have a control plane that discovers VTEPs, advertises every host, routes between subnets on the first leaf, reaches the outside world through a border leaf, and can be debugged layer by layer. Like a pilot's pre-flight checklist, this chapter puts everything in one place so you can review before a lab, an exam or an interview.</p>

<h3>The complete leaf, in one view</h3>
<pre class="code"><span class="c">! Features</span>
feature bgp
feature nv overlay
feature vn-segment-vlan-based
feature interface-vlan
feature fabric forwarding
nv overlay evpn
fabric forwarding anycast-gateway-mac 0000.2222.3333
<span class="c">! VLANs to VNIs</span>
vlan 10
  vn-segment 10010
vlan 3001
  vn-segment 50001
<span class="c">! Tenant VRF and L3VNI</span>
vrf context TENANT-A
  vni 50001
  rd auto
  address-family ipv4 unicast
    route-target both auto
    route-target both auto evpn
interface Vlan3001
  no shutdown
  vrf member TENANT-A
  ip forward
interface Vlan10
  no shutdown
  vrf member TENANT-A
  ip address 172.16.10.1/24
  fabric forwarding mode anycast-gateway
<span class="c">! NVE</span>
interface nve1
  no shutdown
  host-reachability protocol bgp
  source-interface loopback1
  member vni 10010
    suppress-arp
    ingress-replication protocol bgp
  member vni 50001 associate-vrf
<span class="c">! EVPN instance</span>
evpn
  vni 10010 l2
    rd auto
    route-target import auto
    route-target export auto
<span class="c">! BGP</span>
router bgp 65001
  router-id 10.255.0.1
  neighbor 10.255.0.11
    remote-as 65001
    update-source loopback0
    address-family l2vpn evpn
      send-community
      send-community extended
  neighbor 10.255.0.12
    remote-as 65001
    update-source loopback0
    address-family l2vpn evpn
      send-community
      send-community extended
  vrf TENANT-A
    address-family ipv4 unicast
      advertise l2vpn evpn</pre>
<p>The spines add only the BGP part, with <code>route-reflector-client</code> under each leaf neighbor's l2vpn evpn family.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="EVPN building blocks">
<rect x="10" y="150" width="620" height="36" rx="6" fill="#fed7aa"/><text x="320" y="173" text-anchor="middle" class="svg-ink" font-size="12">Underlay: OSPF, loopback0 (BGP), loopback1 (VTEP), MTU 9216</text>
<rect x="10" y="105" width="620" height="36" rx="6" fill="#fde68a"/><text x="320" y="128" text-anchor="middle" class="svg-ink" font-size="12">MP-BGP L2VPN EVPN: iBGP to spine RRs, send-community extended</text>
<rect x="10" y="60" width="305" height="36" rx="6" fill="#bae6fd"/><text x="162" y="83" text-anchor="middle" class="svg-ink" font-size="12">L2VNI: type 2, type 3, ARP suppression</text>
<rect x="325" y="60" width="305" height="36" rx="6" fill="#ddd6fe"/><text x="477" y="83" text-anchor="middle" class="svg-ink" font-size="12">L3VNI: VRF, type 5, symmetric IRB</text>
<rect x="10" y="15" width="620" height="36" rx="6" fill="#bbf7d0"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="12">Anycast gateway, border leaf, multihoming, Multi-Site</text>
</svg><p class="cap">The module in one picture: each layer builds on the one below.</p></div>

<h3>Checklist: can you do all of this?</h3>
<ul>
<li>Explain why EVPN replaces flood-and-learn, and state that VXLAN stays the data plane.</li>
<li>Configure iBGP L2VPN EVPN sessions from leaves to spine route reflectors with loopback peering.</li>
<li>Explain why <code>send-community extended</code> and <code>nv overlay evpn</code> are required.</li>
<li>Name route types 1 to 5 and read <code>[2]</code>, <code>[3]</code> and <code>[5]</code> entries in show output.</li>
<li>Calculate auto RD (router-id:32767+VLAN) and auto RT (ASN:VNI), and explain RD vs RT.</li>
<li>Convert an L2VNI to BGP: EVPN instance, host-reachability, ingress replication BGP, suppress-arp.</li>
<li>Compare asymmetric and symmetric IRB with a packet walk.</li>
<li>Configure the distributed anycast gateway and explain host mobility.</li>
<li>Build a tenant VRF with L3VNI, verify Router MAC and host routes with segid.</li>
<li>Describe border leaf VRF-lite handoff and type-5 external routes.</li>
<li>Compare vPC and ESI multihoming; explain Multi-Site BGWs.</li>
<li>Troubleshoot bottom-up and fix the classic faults.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>EVPN</dt><dd>Ethernet VPN; BGP control plane for L2/L3 overlays (RFC 7432, RFC 8365 for VXLAN).</dd>
<dt>VTEP</dt><dd>VXLAN tunnel endpoint; the leaf's NVE interface sourced from loopback1.</dd>
<dt>L2VNI</dt><dd>VNI mapped to a VLAN; a bridged segment across the fabric.</dd>
<dt>L3VNI</dt><dd>VNI mapped to a tenant VRF; carries routed traffic in symmetric IRB.</dd>
<dt>RD</dt><dd>Route distinguisher; makes routes unique.</dd>
<dt>RT</dt><dd>Route target; extended community controlling import and export.</dd>
<dt>IMET</dt><dd>Type-3 route announcing VNI membership and ingress replication.</dd>
<dt>PMSI</dt><dd>Tunnel attribute on type 3 saying how to send BUM traffic.</dd>
<dt>Router MAC</dt><dd>Extended community with the leaf's MAC, used as inner destination in symmetric IRB.</dd>
<dt>IRB</dt><dd>Integrated routing and bridging on the same device.</dd>
<dt>BGW</dt><dd>Border gateway joining sites in EVPN Multi-Site.</dd>
<dt>ESI</dt><dd>Ethernet segment identifier for standards-based multihoming.</dd>
<dt>DF</dt><dd>Designated forwarder; the one leaf sending BUM traffic to a multihomed segment.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>EVPN AFI/SAFI</td><td>25 / 70</td></tr>
<tr><td>VXLAN UDP port</td><td>4789</td></tr>
<tr><td>Type 2 / 3 / 5</td><td>MAC/IP / IMET / IP prefix</td></tr>
<tr><td>Types 1 and 4</td><td>ESI multihoming (A-D, Ethernet segment)</td></tr>
<tr><td>Auto RD L2VNI</td><td>router-id:(32767 + VLAN)</td></tr>
<tr><td>Auto RT</td><td>ASN:VNI</td></tr>
<tr><td>Peers learned by EVPN</td><td>LearnType CP</td></tr>
<tr><td>VNI on the wire, symmetric IRB</td><td>L3VNI of the VRF</td></tr>
<tr><td>L3VNI SVI</td><td>ip forward, no IP address</td></tr>
<tr><td>EVPN next hop</td><td>VTEP loopback1, unchanged by the RR</td></tr>
</table>

<div class="warn"><p><b>Last-minute traps.</b> RD never controls import. Spines are route reflectors, not VTEPs, in the lab design. <code>route-target both auto</code> without <code>evpn</code> does not import EVPN routes. The anycast MAC is global, the anycast mode is per SVI. <code>host-reachability protocol bgp</code> must come before BGP options under member VNIs.</p></div>
<div class="exam"><p><b>Exam strategy.</b> For show-output questions, read the route type in brackets first, then the RD, then the Extcommunity line, then the next hop. Most EVPN questions are answered by one of those four fields.</p></div>

<div class="scn"><h4>The interview whiteboard</h4><p>A candidate for a data center role was asked: "Draw what happens when a VM in VLAN 10 on leaf A pings a VM in VLAN 20 on leaf B in your EVPN fabric." She drew the underlay first (loopbacks, OSPF), then the BGP sessions to the spine RRs, then the type-2 MAC/IP route from leaf B with labels 10020 and 50001 and a Router MAC, then the ping: routed at leaf A's anycast gateway, encapsulated in L3VNI 50001 with leaf B's Router MAC as inner destination, routed again at leaf B into VLAN 20. She finished with the two show commands that prove it: <code>show bgp l2vpn evpn route-type 2</code> and <code>show ip route vrf TENANT-A</code> with segid 50001. She got the offer.</p><p><b>Lesson:</b> connect control plane (routes) and data plane (packets) in one story, and name the show command that proves each step.</p></div>

<div class="iv"><p class="q">"Summarise VXLAN BGP EVPN in two minutes."</p><p>Strong answer: VXLAN is the data plane, UDP 4789 between VTEP loopbacks over a routed underlay. EVPN is the MP-BGP control plane, usually iBGP to spine route reflectors with extended communities. Type 3 builds flood lists, type 2 advertises MAC/IP for forwarding and ARP suppression, type 5 carries prefixes. RD makes routes unique, RT controls import. Every leaf is an anycast gateway, and symmetric IRB routes through a per-VRF L3VNI using Router MACs. Border leaves hand off VRFs with VRF-lite, and Multi-Site joins fabrics via BGWs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EVPN = control plane; VXLAN = data plane; underlay first, always.</li>
<li>Types 2, 3 and 5 carry most of a Nexus fabric's information.</li>
<li>RD for uniqueness, RT for import: auto values are router-id:(32767+VLAN) and ASN:VNI.</li>
<li>Anycast gateway plus symmetric IRB with an L3VNI give first-hop routing on every leaf.</li>
<li>Troubleshoot bottom-up and prove every step with a show command.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module ek aise fabric se shuru kiya tha jo har jagah ARP flood karta tha aur jise har leaf par haath se likhi peer list chahiye thi. Ab aapke paas ek control plane hai jo VTEPs discover karta hai, har host advertise karta hai, pehle hi leaf par subnets ke beech route karta hai, border leaf se bahar ki duniya tak pahunchta hai, aur layer by layer debug kiya ja sakta hai. Pilot ki pre-flight checklist ki tarah, yeh chapter sab kuch ek jagah rakhta hai taaki aap lab, exam ya interview se pehle revise kar sako.</p>

<h3>Poora leaf, ek nazar mein</h3>
<pre class="code"><span class="c">! Features</span>
feature bgp
feature nv overlay
feature vn-segment-vlan-based
feature interface-vlan
feature fabric forwarding
nv overlay evpn
fabric forwarding anycast-gateway-mac 0000.2222.3333
<span class="c">! VLANs se VNIs</span>
vlan 10
  vn-segment 10010
vlan 3001
  vn-segment 50001
<span class="c">! Tenant VRF aur L3VNI</span>
vrf context TENANT-A
  vni 50001
  rd auto
  address-family ipv4 unicast
    route-target both auto
    route-target both auto evpn
interface Vlan3001
  no shutdown
  vrf member TENANT-A
  ip forward
interface Vlan10
  no shutdown
  vrf member TENANT-A
  ip address 172.16.10.1/24
  fabric forwarding mode anycast-gateway
<span class="c">! NVE</span>
interface nve1
  no shutdown
  host-reachability protocol bgp
  source-interface loopback1
  member vni 10010
    suppress-arp
    ingress-replication protocol bgp
  member vni 50001 associate-vrf
<span class="c">! EVPN instance</span>
evpn
  vni 10010 l2
    rd auto
    route-target import auto
    route-target export auto
<span class="c">! BGP</span>
router bgp 65001
  router-id 10.255.0.1
  neighbor 10.255.0.11
    remote-as 65001
    update-source loopback0
    address-family l2vpn evpn
      send-community
      send-community extended
  neighbor 10.255.0.12
    remote-as 65001
    update-source loopback0
    address-family l2vpn evpn
      send-community
      send-community extended
  vrf TENANT-A
    address-family ipv4 unicast
      advertise l2vpn evpn</pre>
<p>Spines sirf BGP hissa jodte hain, har leaf neighbor ki l2vpn evpn family ke neeche <code>route-reflector-client</code> ke saath.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="EVPN building blocks">
<rect x="10" y="150" width="620" height="36" rx="6" fill="#fed7aa"/><text x="320" y="173" text-anchor="middle" class="svg-ink" font-size="12">Underlay: OSPF, loopback0 (BGP), loopback1 (VTEP), MTU 9216</text>
<rect x="10" y="105" width="620" height="36" rx="6" fill="#fde68a"/><text x="320" y="128" text-anchor="middle" class="svg-ink" font-size="12">MP-BGP L2VPN EVPN: spine RRs tak iBGP, send-community extended</text>
<rect x="10" y="60" width="305" height="36" rx="6" fill="#bae6fd"/><text x="162" y="83" text-anchor="middle" class="svg-ink" font-size="12">L2VNI: type 2, type 3, ARP suppression</text>
<rect x="325" y="60" width="305" height="36" rx="6" fill="#ddd6fe"/><text x="477" y="83" text-anchor="middle" class="svg-ink" font-size="12">L3VNI: VRF, type 5, symmetric IRB</text>
<rect x="10" y="15" width="620" height="36" rx="6" fill="#bbf7d0"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="12">Anycast gateway, border leaf, multihoming, Multi-Site</text>
</svg><p class="cap">Poora module ek picture mein: har layer apne neeche wali par banti hai.</p></div>

<h3>Checklist: kya aap yeh sab kar sakte ho?</h3>
<ul>
<li>Samjhao ki EVPN flood-and-learn ko kyun replace karta hai, aur batao ki VXLAN data plane hi rehta hai.</li>
<li>Loopback peering ke saath leaves se spine route reflectors tak iBGP L2VPN EVPN sessions configure karo.</li>
<li>Samjhao ki <code>send-community extended</code> aur <code>nv overlay evpn</code> kyun zaroori hain.</li>
<li>Route types 1 se 5 ke naam batao aur show output mein <code>[2]</code>, <code>[3]</code> aur <code>[5]</code> entries padho.</li>
<li>Auto RD (router-id:32767+VLAN) aur auto RT (ASN:VNI) calculate karo, aur RD vs RT samjhao.</li>
<li>L2VNI ko BGP par convert karo: EVPN instance, host-reachability, ingress replication BGP, suppress-arp.</li>
<li>Packet walk ke saath asymmetric aur symmetric IRB compare karo.</li>
<li>Distributed anycast gateway configure karo aur host mobility samjhao.</li>
<li>L3VNI ke saath tenant VRF banao, Router MAC aur segid wale host routes verify karo.</li>
<li>Border leaf VRF-lite handoff aur type-5 external routes describe karo.</li>
<li>vPC aur ESI multihoming compare karo; Multi-Site BGWs samjhao.</li>
<li>Neeche se upar troubleshoot karo aur classic faults theek karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>EVPN</dt><dd>Ethernet VPN; L2/L3 overlays ke liye BGP control plane (RFC 7432, VXLAN ke liye RFC 8365).</dd>
<dt>VTEP</dt><dd>VXLAN tunnel endpoint; leaf ka NVE interface jo loopback1 se source hota hai.</dd>
<dt>L2VNI</dt><dd>VLAN se mapped VNI; fabric ke paar ek bridged segment.</dd>
<dt>L3VNI</dt><dd>Tenant VRF se mapped VNI; symmetric IRB mein routed traffic le jaata hai.</dd>
<dt>RD</dt><dd>Route distinguisher; routes ko unique banata hai.</dd>
<dt>RT</dt><dd>Route target; import aur export control karne wali extended community.</dd>
<dt>IMET</dt><dd>Type-3 route jo VNI membership aur ingress replication announce karta hai.</dd>
<dt>PMSI</dt><dd>Type 3 par tunnel attribute jo batata hai ki BUM traffic kaise bhejna hai.</dd>
<dt>Router MAC</dt><dd>Leaf ke MAC wali extended community, symmetric IRB mein inner destination.</dd>
<dt>IRB</dt><dd>Same device par integrated routing and bridging.</dd>
<dt>BGW</dt><dd>EVPN Multi-Site mein sites ko jodne wala border gateway.</dd>
<dt>ESI</dt><dd>Standards-based multihoming ke liye Ethernet segment identifier.</dd>
<dt>DF</dt><dd>Designated forwarder; multihomed segment ko BUM traffic bhejne wala akela leaf.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>EVPN AFI/SAFI</td><td>25 / 70</td></tr>
<tr><td>VXLAN UDP port</td><td>4789</td></tr>
<tr><td>Type 2 / 3 / 5</td><td>MAC/IP / IMET / IP prefix</td></tr>
<tr><td>Types 1 aur 4</td><td>ESI multihoming (A-D, Ethernet segment)</td></tr>
<tr><td>Auto RD L2VNI</td><td>router-id:(32767 + VLAN)</td></tr>
<tr><td>Auto RT</td><td>ASN:VNI</td></tr>
<tr><td>EVPN se seekhe peers</td><td>LearnType CP</td></tr>
<tr><td>Symmetric IRB mein wire par VNI</td><td>VRF ka L3VNI</td></tr>
<tr><td>L3VNI SVI</td><td>ip forward, koi IP address nahi</td></tr>
<tr><td>EVPN next hop</td><td>VTEP loopback1, RR se unchanged</td></tr>
</table>

<div class="warn"><p><b>Aakhri minute ke traps.</b> RD kabhi import control nahi karta. Lab design mein spines route reflectors hain, VTEPs nahi. <code>evpn</code> ke bina <code>route-target both auto</code> EVPN routes import nahi karta. Anycast MAC global hai, anycast mode har SVI par. Member VNIs ke neeche BGP options se pehle <code>host-reachability protocol bgp</code> aana chahiye.</p></div>
<div class="exam"><p><b>Exam strategy.</b> Show-output sawaalon mein pehle brackets mein route type padho, phir RD, phir Extcommunity line, phir next hop. Zyada tar EVPN sawaalon ka jawab in chaar fields mein se kisi ek se milta hai.</p></div>

<div class="scn"><h4>Interview ka whiteboard</h4><p>Data center role ki ek candidate se poocha gaya: "Draw karo ki aapke EVPN fabric mein leaf A par VLAN 10 ki VM jab leaf B par VLAN 20 ki VM ko ping karti hai to kya hota hai." Usne pehle underlay banaya (loopbacks, OSPF), phir spine RRs tak BGP sessions, phir leaf B se labels 10020 aur 50001 aur Router MAC wala type-2 MAC/IP route, phir ping: leaf A ke anycast gateway par route, L3VNI 50001 mein encapsulate leaf B ke Router MAC ko inner destination bana kar, leaf B par VLAN 20 mein dobara route. Usne woh do show commands bata kar khatam kiya jo ise saabit karte hain: <code>show bgp l2vpn evpn route-type 2</code> aur segid 50001 ke saath <code>show ip route vrf TENANT-A</code>. Use offer mil gaya.</p><p><b>Seekh:</b> control plane (routes) aur data plane (packets) ko ek kahani mein jodo, aur har step saabit karne wala show command batao.</p></div>

<div class="iv"><p class="q">"VXLAN BGP EVPN ko do minute mein summarise karo."</p><p>Strong answer: VXLAN data plane hai, routed underlay par VTEP loopbacks ke beech UDP 4789. EVPN MP-BGP control plane hai, aam taur par extended communities ke saath spine route reflectors tak iBGP. Type 3 flood lists banata hai, type 2 forwarding aur ARP suppression ke liye MAC/IP advertise karta hai, type 5 prefixes le jaata hai. RD routes ko unique banata hai, RT import control karta hai. Har leaf anycast gateway hai, aur symmetric IRB Router MACs use karke har VRF ke L3VNI se route karta hai. Border leaves VRF-lite se VRFs handoff karte hain, aur Multi-Site BGWs se fabrics jodta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EVPN = control plane; VXLAN = data plane; hamesha pehle underlay.</li>
<li>Types 2, 3 aur 5 Nexus fabric ki zyada tar information le jaate hain.</li>
<li>Uniqueness ke liye RD, import ke liye RT: auto values router-id:(32767+VLAN) aur ASN:VNI.</li>
<li>Anycast gateway plus L3VNI wala symmetric IRB har leaf par first-hop routing dete hain.</li>
<li>Neeche se upar troubleshoot karo aur har step show command se saabit karo.</li>
</ul></div>
`}};export{e as default};