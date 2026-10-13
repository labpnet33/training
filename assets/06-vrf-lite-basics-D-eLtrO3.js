var e={id:`vrf-basics`,h:{en:`VRF-lite: one router, several routing tables`,hi:`VRF-lite: ek router, kai routing tables`},body:{en:`
<p>Picture an apartment building. Every flat has its own front door, its own letterbox and its own address inside the building: "Flat 101". Two different buildings can both have a Flat 101 without confusion, because the building name is part of the address. A <b>VRF (Virtual Routing and Forwarding instance)</b> turns one router into an apartment building: each VRF is a flat with its own routing table, its own forwarding table (CEF) and its own interfaces.</p>

<h3>What a VRF really is</h3>
<ul>
<li>Every Layer 3 interface belongs to exactly one routing table: either the <b>global table</b> (the default) or one named VRF.</li>
<li>A packet arriving on an interface is looked up <b>only</b> in that interface's VRF. It cannot jump into another table unless you deliberately leak routes (chapter 8).</li>
<li>Because the tables are independent, the same prefix (for example 10.1.1.0/24) can exist in two VRFs at once.</li>
</ul>
<p><b>VRF-lite</b> means using VRFs on their own, without MPLS. Separation between routers is kept hop by hop: each VRF gets its own link or 802.1Q subinterface between neighbouring routers, and its own routing protocol process or address family. In an MPLS L3VPN (covered in the MPLS module), labels and MP-BGP carry the separation across a provider core instead. The ENCOR <i>VRF and tunnels</i> module introduced the idea; here we go deeper into configuration and faults.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="VRF-lite on EDGE">
<rect x="200" y="20" width="240" height="220" rx="12" fill="#e2e8f0"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">EDGE</text>
<rect x="220" y="55" width="200" height="75" rx="8" fill="#bbf7d0"/><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="13">Global table</text><text x="320" y="96" text-anchor="middle" class="svg-muted" font-size="12">Gi0/2 staff, Gi0/0 ISP1</text><text x="320" y="114" text-anchor="middle" class="svg-muted" font-size="12">0.0.0.0/0 via 10.0.1.1</text>
<rect x="220" y="145" width="200" height="80" rx="8" fill="#fde68a"/><text x="320" y="168" text-anchor="middle" class="svg-ink" font-size="13">VRF GUEST</text><text x="320" y="186" text-anchor="middle" class="svg-muted" font-size="12">Gi0/3 guest, Gi0/1 ISP2</text><text x="320" y="204" text-anchor="middle" class="svg-muted" font-size="12">0.0.0.0/0 via 10.0.2.1</text>
<rect x="20" y="70" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="80" y="95" text-anchor="middle" class="svg-ink" font-size="13">PC-STAFF</text>
<rect x="20" y="165" width="120" height="40" rx="8" fill="#fde68a"/><text x="80" y="190" text-anchor="middle" class="svg-ink" font-size="13">PC-GUEST</text>
<rect x="500" y="70" width="120" height="40" rx="8" fill="#ddd6fe"/><text x="560" y="95" text-anchor="middle" class="svg-ink" font-size="13">ISP1</text>
<rect x="500" y="165" width="120" height="40" rx="8" fill="#ddd6fe"/><text x="560" y="190" text-anchor="middle" class="svg-ink" font-size="13">ISP2</text>
<line x1="140" y1="90" x2="220" y2="90" stroke="#64748b" stroke-width="2"/><line x1="140" y1="185" x2="220" y2="185" stroke="#64748b" stroke-width="2"/>
<line x1="420" y1="90" x2="500" y2="90" stroke="#64748b" stroke-width="2"/><line x1="420" y1="185" x2="500" y2="185" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The same business need as the PBR lab, solved with VRF-lite: guests live in their own table with their own default route.</p></div>

<h3>Configuration, step by step</h3>
<pre class="code"><span class="c">! 1. Create the VRF and enable the address families it will carry</span>
vrf definition GUEST
 description Guest Wi-Fi isolation
 address-family ipv4
 exit-address-family
 address-family ipv6
 exit-address-family
<span class="c">! 2. Move interfaces into the VRF, THEN (re)configure the IP address</span>
interface GigabitEthernet0/3
 vrf forwarding GUEST
 ip address 192.168.20.1 255.255.255.0
interface GigabitEthernet0/1
 vrf forwarding GUEST
 ip address 10.0.2.2 255.255.255.252
<span class="c">! 3. Give the VRF its own default route</span>
ip route vrf GUEST 0.0.0.0 0.0.0.0 10.0.2.1</pre>
<p>When you enter <code>vrf forwarding</code> on an interface that already has an address, IOS removes the address:</p>
<pre class="out">EDGE(config-if)# vrf forwarding GUEST
<span class="hl">% Interface GigabitEthernet0/3 IPv4 disabled and address(es) removed due to enabling VRF GUEST</span></pre>
<p>That is expected: the address belonged to the global table. Re-enter it after the <code>vrf forwarding</code> line. In a pasted config, order matters for the same reason.</p>

<h3>Two syntaxes you will meet</h3>
<table class="cmp"><tr><th>Multi-AF (current)</th><th>Legacy (IPv4 only)</th></tr>
<tr><td><code>vrf definition NAME</code> + <code>address-family ipv4</code></td><td><code>ip vrf NAME</code></td></tr>
<tr><td><code>vrf forwarding NAME</code> on the interface</td><td><code>ip vrf forwarding NAME</code> on the interface</td></tr>
<tr><td>IPv4 and IPv6 in one VRF</td><td>IPv4 only</td></tr></table>
<p>The command <code>vrf upgrade-cli multi-af-mode common-policies</code> converts legacy VRFs to the new format. A <b>route distinguisher</b> (<code>rd 65010:20</code>) is optional for pure VRF-lite with static, OSPF or EIGRP, but it is required as soon as you configure a BGP address family for that VRF.</p>

<h3>Verification</h3>
<pre class="out">EDGE# show vrf
  Name                             Default RD            Protocols   Interfaces
  <span class="hl">GUEST                            &lt;not set&gt;             ipv4,ipv6   Gi0/3</span>
                                                                     Gi0/1
EDGE# show ip vrf interfaces
Interface              IP-Address      VRF                              Protocol
Gi0/3                  192.168.20.1    GUEST                            up
Gi0/1                  10.0.2.2        GUEST                            up

EDGE# show ip route vrf GUEST
Routing Table: GUEST
Gateway of last resort is 10.0.2.1 to network 0.0.0.0

<span class="hl">S*    0.0.0.0/0 [1/0] via 10.0.2.1</span>
      10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
C        10.0.2.0/30 is directly connected, GigabitEthernet0/1
L        10.0.2.2/32 is directly connected, GigabitEthernet0/1
      192.168.20.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.20.0/24 is directly connected, GigabitEthernet0/3
L        192.168.20.1/32 is directly connected, GigabitEthernet0/3</pre>
<p>A plain <code>show ip route</code> now shows no trace of 192.168.20.0/24 or 10.0.2.0/30; they live only in GUEST.</p>

<h3>Carrying VRFs between routers</h3>
<p>If guests must cross a second router (for example a distribution router DIST before reaching EDGE), you need one Layer 3 link per VRF between them. The usual way is 802.1Q subinterfaces on one physical link:</p>
<pre class="code">interface GigabitEthernet0/4.10
 encapsulation dot1Q 10
 ip address 10.10.0.1 255.255.255.252
interface GigabitEthernet0/4.20
 encapsulation dot1Q 20
 vrf forwarding GUEST
 ip address 10.20.0.1 255.255.255.252</pre>
<p>Global traffic uses .10 and guest traffic uses .20. Both ends must put the same subinterface in the same VRF.</p>

<div class="eg"><p><b>Worked example.</b> A company has 3 departments, each needing isolation across 4 routers in a chain. Hop-by-hop VRF-lite needs 3 VRFs on every router and 3 subinterfaces on each of the 3 inter-router links, so 9 subinterface pairs and 3 routing processes per router, 12 processes in total. At 30 routers this becomes painful, which is exactly where MPLS L3VPN starts to win.</p></div>

<div class="warn"><p><b>Common mistake.</b> Pasting the IP address before <code>vrf forwarding</code>. The address is silently removed and the interface sits in the VRF with no IP. Always check <code>show ip vrf interfaces</code> after a change.</p></div>

<div class="exam"><p><b>Exam trap.</b> VRF-lite does not need MPLS, LDP or MP-BGP, and a route distinguisher is not required unless BGP runs in the VRF. Also, <code>ping 192.168.20.10</code> from EDGE uses the global table and fails; you need <code>ping vrf GUEST 192.168.20.10</code>.</p></div>

<div class="scn"><h4>Two acquisitions, one 10.1.0.0/16</h4><p>A logistics company bought two smaller firms that both used 10.1.0.0/16 internally. Re-addressing would take months. The network team put each acquisition into its own VRF (ACQ-A and ACQ-B) on the integration router, with separate uplinks and default routes toward their own firewalls. Both 10.1.0.0/16 networks lived happily on one router the same week. Shared services were reached later through NAT and controlled leaking.</p><p><b>Lesson:</b> VRFs solve overlapping addresses and isolation without new hardware.</p></div>

<div class="iv"><p class="q">"What is VRF-lite and how is it different from MPLS L3VPN?"</p><p>Strong answer: VRF-lite uses multiple VRFs on a router without MPLS. Each interface belongs to one VRF, each VRF has its own RIB and FIB, and separation between routers is maintained hop by hop with a dedicated link or subinterface and routing process per VRF. MPLS L3VPN carries VRF routes over a shared core with MP-BGP (RD, route targets) and labels, so core routers need no per-customer configuration. VRF-lite suits a few VRFs over a few hops; L3VPN scales.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VRF is an independent RIB and FIB; every L3 interface belongs to the global table or one VRF.</li>
<li><code>vrf definition</code> + <code>address-family</code>, then <code>vrf forwarding</code> on interfaces, then re-add IP addresses.</li>
<li>An RD is optional for VRF-lite unless BGP runs inside the VRF.</li>
<li>Between routers, carry each VRF on its own link or 802.1Q subinterface.</li>
<li>Verify with <code>show vrf</code>, <code>show ip vrf interfaces</code>, <code>show ip route vrf NAME</code>.</li>
</ul></div>
`,hi:`
<p>Ek apartment building socho. Har flat ka apna front door, apna letterbox aur building ke andar apna address hai: "Flat 101". Do alag buildings mein dono ka Flat 101 ho sakta hai bina confusion ke, kyunki building ka naam address ka hissa hai. <b>VRF (Virtual Routing and Forwarding instance)</b> ek router ko apartment building bana deta hai: har VRF ek flat hai jiski apni routing table, apni forwarding table (CEF) aur apne interfaces hain.</p>

<h3>VRF asal mein kya hai</h3>
<ul>
<li>Har Layer 3 interface bilkul ek routing table ka hota hai: ya to <b>global table</b> (default) ya ek named VRF.</li>
<li>Interface par aane wala packet <b>sirf</b> us interface ke VRF mein lookup hota hai. Woh doosri table mein nahi kood sakta jab tak aap jaan-boojh kar routes leak na karo (chapter 8).</li>
<li>Kyunki tables independent hain, same prefix (jaise 10.1.1.0/24) ek saath do VRFs mein ho sakta hai.</li>
</ul>
<p><b>VRF-lite</b> ka matlab hai VRFs ko akele, bina MPLS ke use karna. Routers ke beech separation hop by hop rakha jaata hai: har VRF ko neighbouring routers ke beech apna link ya 802.1Q subinterface milta hai, aur apna routing protocol process ya address family. MPLS L3VPN (MPLS module mein cover) mein labels aur MP-BGP provider core ke across separation le jaate hain. ENCOR ke <i>VRF and tunnels</i> module ne idea introduce kiya tha; yahan hum configuration aur faults mein aur gehre jaate hain.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="VRF-lite on EDGE">
<rect x="200" y="20" width="240" height="220" rx="12" fill="#e2e8f0"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">EDGE</text>
<rect x="220" y="55" width="200" height="75" rx="8" fill="#bbf7d0"/><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="13">Global table</text><text x="320" y="96" text-anchor="middle" class="svg-muted" font-size="12">Gi0/2 staff, Gi0/0 ISP1</text><text x="320" y="114" text-anchor="middle" class="svg-muted" font-size="12">0.0.0.0/0 via 10.0.1.1</text>
<rect x="220" y="145" width="200" height="80" rx="8" fill="#fde68a"/><text x="320" y="168" text-anchor="middle" class="svg-ink" font-size="13">VRF GUEST</text><text x="320" y="186" text-anchor="middle" class="svg-muted" font-size="12">Gi0/3 guest, Gi0/1 ISP2</text><text x="320" y="204" text-anchor="middle" class="svg-muted" font-size="12">0.0.0.0/0 via 10.0.2.1</text>
<rect x="20" y="70" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="80" y="95" text-anchor="middle" class="svg-ink" font-size="13">PC-STAFF</text>
<rect x="20" y="165" width="120" height="40" rx="8" fill="#fde68a"/><text x="80" y="190" text-anchor="middle" class="svg-ink" font-size="13">PC-GUEST</text>
<rect x="500" y="70" width="120" height="40" rx="8" fill="#ddd6fe"/><text x="560" y="95" text-anchor="middle" class="svg-ink" font-size="13">ISP1</text>
<rect x="500" y="165" width="120" height="40" rx="8" fill="#ddd6fe"/><text x="560" y="190" text-anchor="middle" class="svg-ink" font-size="13">ISP2</text>
<line x1="140" y1="90" x2="220" y2="90" stroke="#64748b" stroke-width="2"/><line x1="140" y1="185" x2="220" y2="185" stroke="#64748b" stroke-width="2"/>
<line x1="420" y1="90" x2="500" y2="90" stroke="#64748b" stroke-width="2"/><line x1="420" y1="185" x2="500" y2="185" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">PBR lab wali hi business need, VRF-lite se solve: guests apni table mein apne default route ke saath rehte hain.</p></div>

<h3>Configuration, step by step</h3>
<pre class="code"><span class="c">! 1. VRF banao aur jo address families woh le jaayega unhe enable karo</span>
vrf definition GUEST
 description Guest Wi-Fi isolation
 address-family ipv4
 exit-address-family
 address-family ipv6
 exit-address-family
<span class="c">! 2. Interfaces ko VRF mein daalo, PHIR IP address (dobara) configure karo</span>
interface GigabitEthernet0/3
 vrf forwarding GUEST
 ip address 192.168.20.1 255.255.255.0
interface GigabitEthernet0/1
 vrf forwarding GUEST
 ip address 10.0.2.2 255.255.255.252
<span class="c">! 3. VRF ko uska apna default route do</span>
ip route vrf GUEST 0.0.0.0 0.0.0.0 10.0.2.1</pre>
<p>Jab aap aise interface par <code>vrf forwarding</code> daalte ho jiska pehle se address hai, IOS address hata deta hai:</p>
<pre class="out">EDGE(config-if)# vrf forwarding GUEST
<span class="hl">% Interface GigabitEthernet0/3 IPv4 disabled and address(es) removed due to enabling VRF GUEST</span></pre>
<p>Yeh expected hai: address global table ka tha. <code>vrf forwarding</code> line ke baad use dobara daalo. Paste kiye config mein bhi isi wajah se order matter karta hai.</p>

<h3>Do syntaxes jo aap dekhoge</h3>
<table class="cmp"><tr><th>Multi-AF (current)</th><th>Legacy (sirf IPv4)</th></tr>
<tr><td><code>vrf definition NAME</code> + <code>address-family ipv4</code></td><td><code>ip vrf NAME</code></td></tr>
<tr><td>Interface par <code>vrf forwarding NAME</code></td><td>Interface par <code>ip vrf forwarding NAME</code></td></tr>
<tr><td>Ek VRF mein IPv4 aur IPv6</td><td>Sirf IPv4</td></tr></table>
<p><code>vrf upgrade-cli multi-af-mode common-policies</code> command legacy VRFs ko naye format mein badalta hai. Pure VRF-lite ke liye static, OSPF ya EIGRP ke saath <b>route distinguisher</b> (<code>rd 65010:20</code>) optional hai, lekin jaise hi us VRF ke liye BGP address family configure karte ho, yeh zaroori ho jaata hai.</p>

<h3>Verification</h3>
<pre class="out">EDGE# show vrf
  Name                             Default RD            Protocols   Interfaces
  <span class="hl">GUEST                            &lt;not set&gt;             ipv4,ipv6   Gi0/3</span>
                                                                     Gi0/1
EDGE# show ip vrf interfaces
Interface              IP-Address      VRF                              Protocol
Gi0/3                  192.168.20.1    GUEST                            up
Gi0/1                  10.0.2.2        GUEST                            up

EDGE# show ip route vrf GUEST
Routing Table: GUEST
Gateway of last resort is 10.0.2.1 to network 0.0.0.0

<span class="hl">S*    0.0.0.0/0 [1/0] via 10.0.2.1</span>
      10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
C        10.0.2.0/30 is directly connected, GigabitEthernet0/1
L        10.0.2.2/32 is directly connected, GigabitEthernet0/1
      192.168.20.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.20.0/24 is directly connected, GigabitEthernet0/3
L        192.168.20.1/32 is directly connected, GigabitEthernet0/3</pre>
<p>Ab plain <code>show ip route</code> mein 192.168.20.0/24 ya 10.0.2.0/30 ka koi nishaan nahi; woh sirf GUEST mein rehte hain.</p>

<h3>Routers ke beech VRFs le jaana</h3>
<p>Agar guests ko doosra router cross karna hai (jaise EDGE tak pahunchne se pehle distribution router DIST), to unke beech har VRF ke liye ek Layer 3 link chahiye. Aam tareeka hai ek physical link par 802.1Q subinterfaces:</p>
<pre class="code">interface GigabitEthernet0/4.10
 encapsulation dot1Q 10
 ip address 10.10.0.1 255.255.255.252
interface GigabitEthernet0/4.20
 encapsulation dot1Q 20
 vrf forwarding GUEST
 ip address 10.20.0.1 255.255.255.252</pre>
<p>Global traffic .10 use karta hai aur guest traffic .20. Dono ends ko same subinterface same VRF mein daalna chahiye.</p>

<div class="eg"><p><b>Worked example.</b> Ek company ke 3 departments hain, har ek ko chain mein 4 routers ke across isolation chahiye. Hop-by-hop VRF-lite ko har router par 3 VRFs aur 3 inter-router links mein se har ek par 3 subinterfaces chahiye, yaani 9 subinterface pairs aur har router par 3 routing processes, kul 12 processes. 30 routers par yeh dard ban jaata hai, aur bilkul yahin MPLS L3VPN jeetne lagta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>vrf forwarding</code> se pehle IP address paste karna. Address chupchaap hat jaata hai aur interface bina IP ke VRF mein baitha rehta hai. Har change ke baad <code>show ip vrf interfaces</code> check karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> VRF-lite ko MPLS, LDP ya MP-BGP nahi chahiye, aur route distinguisher tab tak zaroori nahi jab tak VRF mein BGP na chale. Saath hi, EDGE se <code>ping 192.168.20.10</code> global table use karta hai aur fail hota hai; aapko <code>ping vrf GUEST 192.168.20.10</code> chahiye.</p></div>

<div class="scn"><h4>Do acquisitions, ek 10.1.0.0/16</h4><p>Ek logistics company ne do chhoti firms khareedi jo dono internally 10.1.0.0/16 use karti thi. Re-addressing mein mahine lagte. Network team ne integration router par har acquisition ko apne VRF (ACQ-A aur ACQ-B) mein daala, apne firewalls ki taraf alag uplinks aur default routes ke saath. Dono 10.1.0.0/16 networks usi hafte ek router par aaram se chal rahe the. Shared services baad mein NAT aur controlled leaking se pahunche gaye.</p><p><b>Seekh:</b> VRFs overlapping addresses aur isolation ko bina naye hardware ke solve karte hain.</p></div>

<div class="iv"><p class="q">"VRF-lite kya hai aur MPLS L3VPN se kaise alag hai?"</p><p>Strong answer: VRF-lite router par bina MPLS ke multiple VRFs use karta hai. Har interface ek VRF ka hota hai, har VRF ka apna RIB aur FIB hai, aur routers ke beech separation hop by hop har VRF ke dedicated link ya subinterface aur routing process se rakha jaata hai. MPLS L3VPN VRF routes ko shared core par MP-BGP (RD, route targets) aur labels se le jaata hai, isliye core routers ko per-customer configuration nahi chahiye. VRF-lite kuch hops par kuch VRFs ke liye theek hai; L3VPN scale karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VRF ek independent RIB aur FIB hai; har L3 interface global table ya ek VRF ka hota hai.</li>
<li><code>vrf definition</code> + <code>address-family</code>, phir interfaces par <code>vrf forwarding</code>, phir IP addresses dobara daalo.</li>
<li>VRF-lite ke liye RD optional hai jab tak VRF ke andar BGP na chale.</li>
<li>Routers ke beech har VRF ko apne link ya 802.1Q subinterface par le jao.</li>
<li><code>show vrf</code>, <code>show ip vrf interfaces</code>, <code>show ip route vrf NAME</code> se verify karo.</li>
</ul></div>
`}};export{e as default};