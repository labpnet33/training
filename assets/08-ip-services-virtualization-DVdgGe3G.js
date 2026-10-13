var e={id:`ip-services-virtualization`,h:{en:`IP services refresher and a first look at virtualization`,hi:`IP services refresher aur virtualization par pehli nazar`},body:{en:`
<p>An office building runs on quiet services nobody notices until they fail: a receptionist who hands out desk numbers (<b>DHCP</b>), one master clock everyone sets their watch to (<b>NTP</b>), a backup receptionist who takes over the moment the first one leaves (<b>FHRP</b>), and a mailroom that relabels outgoing letters with the company's public address (<b>NAT</b>). The same building can also be split into separate floors rented to different tenants who never see each other's mail (<b>VRF</b>), and connected to another building by a private tube (<b>tunnel</b>). This chapter refreshes the services and previews the virtualization domain.</p>

<h3>First hop redundancy: HSRP, VRRP, GLBP</h3>
<p>Hosts have one default gateway. An FHRP lets two routers share a <b>virtual IP and virtual MAC</b> so the gateway survives a router failure.</p>
<table class="cmp"><tr><th></th><th>HSRP</th><th>VRRP</th><th>GLBP</th></tr>
<tr><td>Standard</td><td>Cisco</td><td>Open (RFC 5798 for v3)</td><td>Cisco</td></tr>
<tr><td>Roles</td><td>Active / standby</td><td>Master / backup</td><td>AVG / AVFs</td></tr>
<tr><td>Multicast</td><td>v1 224.0.0.2, v2 224.0.0.102 (UDP 1985)</td><td>224.0.0.18 (IP protocol 112)</td><td>224.0.0.102 (UDP 3222)</td></tr>
<tr><td>Virtual MAC</td><td>v1 0000.0c07.acXX, v2 0000.0c9f.fXXX</td><td>0000.5e00.01XX</td><td>0007.b400.XXYY</td></tr>
<tr><td>Preemption</td><td>Off by default</td><td>On by default</td><td>Off for AVG, on for AVF</td></tr>
<tr><td>Load sharing</td><td>Per group or VLAN</td><td>Per group or VLAN</td><td>Per host inside one group</td></tr>
</table>
<p>Default priority is 100, higher wins, and the highest IP breaks ties. <b>Object tracking</b> lowers the priority when an uplink fails, so the peer (with preempt) takes over.</p>
<pre class="code"><span class="c">! DIST1: HSRPv2 active for VLAN 10, tracking its uplink to CORE1</span>
DIST1(config)# track 1 interface TenGigabitEthernet1/0/1 line-protocol
DIST1(config)# interface Vlan10
DIST1(config-if)# standby version 2
DIST1(config-if)# standby 10 ip 10.1.10.1
DIST1(config-if)# standby 10 priority 110
DIST1(config-if)# standby 10 preempt
DIST1(config-if)# standby 10 track 1 decrement 20
DIST1(config-if)# ip helper-address 10.10.20.5</pre>
<pre class="out">DIST1# show standby brief
                     P indicates configured to preempt.
                     |
Interface   Grp  Pri P State   Active          Standby         Virtual IP
<span class="hl">Vl10        10   110 P Active  local           10.1.10.3       10.1.10.1</span></pre>
<p>The <code>ip helper-address</code> line is the <b>DHCP relay</b>: the SVI turns the client's broadcast DISCOVER into a unicast to the DHCP server 10.10.20.5 in the data center, setting the relay agent address (giaddr) to 10.1.10.2 so the server picks the VLAN 10 scope. DHCP itself is DORA: Discover, Offer, Request, Acknowledge (UDP 67 server, 68 client).</p>

<h3>NAT and PAT</h3>
<p>NAT terms describe a host from two points of view. <b>Inside local</b> is the private address of your host (10.1.10.50); <b>inside global</b> is the public address it appears as (203.0.113.10). <b>Outside global</b> is the real address of the remote server; <b>outside local</b> is how it appears inside (usually the same). <b>Static NAT</b> maps one to one (for servers), <b>dynamic NAT</b> uses a pool, and <b>PAT</b> (overload) shares one public address by tracking source ports.</p>
<pre class="code">WAN1(config)# ip access-list standard NAT-USERS
WAN1(config-std-nacl)# permit 10.1.0.0 0.0.255.255
WAN1(config-std-nacl)# exit
WAN1(config)# interface GigabitEthernet0/0/1
WAN1(config-if)# ip nat inside
WAN1(config-if)# interface GigabitEthernet0/0/0
WAN1(config-if)# ip nat outside
WAN1(config-if)# exit
WAN1(config)# ip nat pool USERS 203.0.113.10 203.0.113.10 prefix-length 24
WAN1(config)# ip nat inside source list NAT-USERS pool USERS overload</pre>
<pre class="out">WAN1# show ip nat translations
Pro  Inside global         Inside local          Outside local         Outside global
<span class="hl">tcp  203.0.113.10:5012     10.1.10.50:5012       192.0.2.80:443        192.0.2.80:443</span></pre>

<h3>NTP and PTP</h3>
<p>Logs, certificates, AAA and troubleshooting all depend on correct time. <b>NTP</b> (UDP 123) is hierarchical: <b>stratum</b> 1 servers sync to a reference clock, stratum 2 to them, and so on; stratum 16 means unsynchronised. At NK Corp, CORE1 and CORE2 sync to external servers and every other device uses their loopbacks. <b>PTP</b> (IEEE 1588) reaches sub-microsecond accuracy using hardware timestamps and roles such as grandmaster, boundary clock and transparent clock; it matters for audio-video, industrial and financial networks. ENCOR asks you to <b>interpret</b> NTP and PTP configurations.</p>
<pre class="out">ACC1# show ntp status
<span class="hl">Clock is synchronized, stratum 3, reference is 10.255.0.1</span></pre>

<h3>A first look at virtualization (ENCOR domain 2)</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="HSRP and VRF">
<rect x="20" y="20" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="12">DIST1 .2 active</text>
<rect x="170" y="20" width="120" height="44" rx="8" fill="#bae6fd"/><text x="230" y="47" text-anchor="middle" class="svg-ink" font-size="12">DIST2 .3 standby</text>
<rect x="75" y="100" width="170" height="36" rx="18" fill="#fde68a" stroke="#64748b" stroke-dasharray="4 4"/><text x="160" y="123" text-anchor="middle" class="svg-ink" font-size="12">VIP 10.1.10.1</text>
<rect x="100" y="180" width="120" height="40" rx="8" fill="#e2e8f0"/><text x="160" y="205" text-anchor="middle" class="svg-ink" font-size="12">PC gw .1</text>
<line x1="80" y1="64" x2="130" y2="100" stroke="#64748b" stroke-width="2"/><line x1="230" y1="64" x2="190" y2="100" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<line x1="160" y1="136" x2="160" y2="180" stroke="#64748b" stroke-width="2"/>
<rect x="340" y="20" width="280" height="200" rx="10" fill="#e2e8f0"/><text x="480" y="44" text-anchor="middle" class="svg-ink" font-size="13">One router, separate tables</text>
<rect x="360" y="60" width="240" height="60" rx="8" fill="#bbf7d0"/><text x="480" y="84" text-anchor="middle" class="svg-ink" font-size="12">VRF CORP</text><text x="480" y="104" text-anchor="middle" class="svg-muted" font-size="12">10.1.0.0/16, 10.10.0.0/16</text>
<rect x="360" y="140" width="240" height="60" rx="8" fill="#fed7aa"/><text x="480" y="164" text-anchor="middle" class="svg-ink" font-size="12">VRF GUEST</text><text x="480" y="184" text-anchor="middle" class="svg-muted" font-size="12">172.16.0.0/16, internet only</text>
</svg><p class="cap">Left: an FHRP gives hosts one gateway that survives a router failure. Right: VRFs give one router several isolated routing tables.</p></div>
<dl class="terms">
<dt>Device virtualization</dt><dd>A <b>hypervisor</b> runs virtual machines. <b>Type 1</b> (bare metal: VMware ESXi, KVM) runs directly on hardware; <b>type 2</b> (hosted) runs on top of an operating system. VMs connect through a <b>virtual switch</b> inside the host. Catalyst 8000V is a router running as a VM.</dd>
<dt>VRF</dt><dd>Virtual Routing and Forwarding: separate routing tables and interfaces inside one router, so overlapping addresses are allowed and tenants are isolated. Without MPLS it is called <b>VRF-lite</b>.</dd>
<dt>GRE</dt><dd>Generic Routing Encapsulation (IP protocol 47): a simple tunnel that can carry multicast and routing protocols, 24 bytes of overhead, <b>no encryption</b>.</dd>
<dt>IPsec</dt><dd>Encryption and integrity (ESP, IP protocol 50) negotiated by IKE (UDP 500, or 4500 through NAT). Often combined as <b>GRE over IPsec</b> to get both routing and security.</dd>
<dt>LISP and VXLAN</dt><dd>LISP separates <b>who</b> an endpoint is (EID) from <b>where</b> it is (RLOC). VXLAN carries Layer 2 frames inside UDP 4789 with a 24-bit VNI, about 16 million segments. SD-Access uses LISP for the control plane and VXLAN for the data plane.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> DIST1 has priority 110 and tracks Te1/0/1 with decrement 20. When that uplink fails, its priority drops to 90. DIST2 has the default 100 and preempt, so DIST2 becomes active within about 3 to 10 seconds (hello 3 s, hold 10 s by default). When the uplink returns, DIST1's priority goes back to 110 and, because DIST1 also has preempt, it takes the active role back.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring tracking without <code>preempt</code> on the peer. The tracked router lowers its priority, but the standby never takes over because HSRP preemption is off by default. Tracking only works when the other router is allowed to preempt.</p></div>

<div class="exam"><p><b>Exam trap.</b> VRRP preempts by default, HSRP does not. The HSRPv1 virtual MAC for group 10 is 0000.0c07.ac0a; the VRRP one for group 10 is 0000.5e00.010a. In NAT, "inside global" is the public address of <b>your</b> host, not of the remote server.</p></div>

<div class="scn"><h4>The logs that lied</h4><p>During a security investigation, the team tried to line up firewall logs with switch logs and found them 7 minutes apart; the switch logs also showed timestamps from 1993. Several access switches had no NTP configuration after a template change, and one had <code>ntp server</code> pointing to a decommissioned address. <code>show ntp status</code> said "Clock is unsynchronized, stratum 16". The fix was a standard NTP block pointing to both core loopbacks plus <code>service timestamps log datetime msec</code>, pushed to every device.</p><p><b>Lesson:</b> without synchronised time, troubleshooting and security investigations are guesswork. Verify NTP on every device, not only the core.</p></div>

<div class="iv"><p class="q">"Explain inside local, inside global, outside local and outside global."</p><p>Strong answer: "inside" and "outside" say whose address it is; "local" and "global" say from which side you are looking. Inside local is my host's private address, inside global is how the internet sees my host after NAT, outside global is the remote server's real address, and outside local is how that server appears to my inside network, normally identical unless you also translate the destination. Draw a quick example with 10.1.10.50 and 203.0.113.10.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HSRP (Cisco, preempt off), VRRP (open, preempt on), GLBP (per-host load sharing); tracking needs preempt on the peer.</li>
<li>DHCP relay: <code>ip helper-address</code> on the SVI, giaddr selects the scope; DORA over UDP 67/68.</li>
<li>NAT: inside local/global, outside local/global; static, dynamic, PAT with overload.</li>
<li>NTP stratum hierarchy, stratum 16 = unsynchronised; PTP for sub-microsecond accuracy.</li>
<li>Virtualization: type 1 and 2 hypervisors, VRF-lite, GRE (no encryption), IPsec, LISP (EID/RLOC), VXLAN (UDP 4789, 24-bit VNI).</li>
</ul></div>
`,hi:`
<p>Ek office building chupchaap chalti services par chalti hai jinhe koi notice nahi karta jab tak woh fail na hon: ek receptionist jo desk numbers deta hai (<b>DHCP</b>), ek master clock jisse sab apni ghadi milaate hain (<b>NTP</b>), ek backup receptionist jo pehle wale ke jaate hi kaam sambhaal leta hai (<b>FHRP</b>), aur ek mailroom jo bahar jaane wale letters par company ka public address laga deta hai (<b>NAT</b>). Wahi building alag floors mein bhi baanti ja sakti hai jo alag tenants ko kiraye par diye jaate hain jo kabhi ek doosre ki mail nahi dekhte (<b>VRF</b>), aur ek private tube se doosri building se judi ho sakti hai (<b>tunnel</b>). Yeh chapter services refresh karta hai aur virtualization domain ka preview deta hai.</p>

<h3>First hop redundancy: HSRP, VRRP, GLBP</h3>
<p>Hosts ka ek default gateway hota hai. FHRP do routers ko ek <b>virtual IP aur virtual MAC</b> share karne deta hai taaki router fail hone par bhi gateway bacha rahe.</p>
<table class="cmp"><tr><th></th><th>HSRP</th><th>VRRP</th><th>GLBP</th></tr>
<tr><td>Standard</td><td>Cisco</td><td>Open (v3 ke liye RFC 5798)</td><td>Cisco</td></tr>
<tr><td>Roles</td><td>Active / standby</td><td>Master / backup</td><td>AVG / AVFs</td></tr>
<tr><td>Multicast</td><td>v1 224.0.0.2, v2 224.0.0.102 (UDP 1985)</td><td>224.0.0.18 (IP protocol 112)</td><td>224.0.0.102 (UDP 3222)</td></tr>
<tr><td>Virtual MAC</td><td>v1 0000.0c07.acXX, v2 0000.0c9f.fXXX</td><td>0000.5e00.01XX</td><td>0007.b400.XXYY</td></tr>
<tr><td>Preemption</td><td>Default mein off</td><td>Default mein on</td><td>AVG ke liye off, AVF ke liye on</td></tr>
<tr><td>Load sharing</td><td>Per group ya VLAN</td><td>Per group ya VLAN</td><td>Ek group ke andar per host</td></tr>
</table>
<p>Default priority 100 hai, zyada jeetti hai, aur tie mein sabse bada IP jeetta hai. <b>Object tracking</b> uplink fail hone par priority kam kar deta hai, taaki peer (preempt ke saath) kaam sambhaal le.</p>
<pre class="code"><span class="c">! DIST1: VLAN 10 ke liye HSRPv2 active, CORE1 tak apna uplink track karta hai</span>
DIST1(config)# track 1 interface TenGigabitEthernet1/0/1 line-protocol
DIST1(config)# interface Vlan10
DIST1(config-if)# standby version 2
DIST1(config-if)# standby 10 ip 10.1.10.1
DIST1(config-if)# standby 10 priority 110
DIST1(config-if)# standby 10 preempt
DIST1(config-if)# standby 10 track 1 decrement 20
DIST1(config-if)# ip helper-address 10.10.20.5</pre>
<pre class="out">DIST1# show standby brief
                     P indicates configured to preempt.
                     |
Interface   Grp  Pri P State   Active          Standby         Virtual IP
<span class="hl">Vl10        10   110 P Active  local           10.1.10.3       10.1.10.1</span></pre>
<p><code>ip helper-address</code> wali line <b>DHCP relay</b> hai: SVI client ke broadcast DISCOVER ko data center ke DHCP server 10.10.20.5 tak unicast mein badal deta hai, relay agent address (giaddr) 10.1.10.2 set karke taaki server VLAN 10 ka scope chune. DHCP khud DORA hai: Discover, Offer, Request, Acknowledge (UDP 67 server, 68 client).</p>

<h3>NAT aur PAT</h3>
<p>NAT terms ek host ko do nazariyon se describe karte hain. <b>Inside local</b> aapke host ka private address hai (10.1.10.50); <b>inside global</b> woh public address hai jaisa woh dikhta hai (203.0.113.10). <b>Outside global</b> remote server ka asli address hai; <b>outside local</b> woh hai jaisa woh andar dikhta hai (aam taur par same). <b>Static NAT</b> one to one map karta hai (servers ke liye), <b>dynamic NAT</b> pool use karta hai, aur <b>PAT</b> (overload) source ports track karke ek public address share karta hai.</p>
<pre class="code">WAN1(config)# ip access-list standard NAT-USERS
WAN1(config-std-nacl)# permit 10.1.0.0 0.0.255.255
WAN1(config-std-nacl)# exit
WAN1(config)# interface GigabitEthernet0/0/1
WAN1(config-if)# ip nat inside
WAN1(config-if)# interface GigabitEthernet0/0/0
WAN1(config-if)# ip nat outside
WAN1(config-if)# exit
WAN1(config)# ip nat pool USERS 203.0.113.10 203.0.113.10 prefix-length 24
WAN1(config)# ip nat inside source list NAT-USERS pool USERS overload</pre>
<pre class="out">WAN1# show ip nat translations
Pro  Inside global         Inside local          Outside local         Outside global
<span class="hl">tcp  203.0.113.10:5012     10.1.10.50:5012       192.0.2.80:443        192.0.2.80:443</span></pre>

<h3>NTP aur PTP</h3>
<p>Logs, certificates, AAA aur troubleshooting sab sahi time par depend karte hain. <b>NTP</b> (UDP 123) hierarchical hai: <b>stratum</b> 1 servers reference clock se sync karte hain, stratum 2 unse, aur aise hi aage; stratum 16 ka matlab unsynchronised. NK Corp mein CORE1 aur CORE2 external servers se sync karte hain aur baaki har device unke loopbacks use karta hai. <b>PTP</b> (IEEE 1588) hardware timestamps aur grandmaster, boundary clock aur transparent clock jaise roles use karke sub-microsecond accuracy tak pahunchta hai; yeh audio-video, industrial aur financial networks ke liye matter karta hai. ENCOR aapse NTP aur PTP configurations <b>interpret</b> karwata hai.</p>
<pre class="out">ACC1# show ntp status
<span class="hl">Clock is synchronized, stratum 3, reference is 10.255.0.1</span></pre>

<h3>Virtualization par pehli nazar (ENCOR domain 2)</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="HSRP and VRF">
<rect x="20" y="20" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="12">DIST1 .2 active</text>
<rect x="170" y="20" width="120" height="44" rx="8" fill="#bae6fd"/><text x="230" y="47" text-anchor="middle" class="svg-ink" font-size="12">DIST2 .3 standby</text>
<rect x="75" y="100" width="170" height="36" rx="18" fill="#fde68a" stroke="#64748b" stroke-dasharray="4 4"/><text x="160" y="123" text-anchor="middle" class="svg-ink" font-size="12">VIP 10.1.10.1</text>
<rect x="100" y="180" width="120" height="40" rx="8" fill="#e2e8f0"/><text x="160" y="205" text-anchor="middle" class="svg-ink" font-size="12">PC gw .1</text>
<line x1="80" y1="64" x2="130" y2="100" stroke="#64748b" stroke-width="2"/><line x1="230" y1="64" x2="190" y2="100" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<line x1="160" y1="136" x2="160" y2="180" stroke="#64748b" stroke-width="2"/>
<rect x="340" y="20" width="280" height="200" rx="10" fill="#e2e8f0"/><text x="480" y="44" text-anchor="middle" class="svg-ink" font-size="13">Ek router, alag tables</text>
<rect x="360" y="60" width="240" height="60" rx="8" fill="#bbf7d0"/><text x="480" y="84" text-anchor="middle" class="svg-ink" font-size="12">VRF CORP</text><text x="480" y="104" text-anchor="middle" class="svg-muted" font-size="12">10.1.0.0/16, 10.10.0.0/16</text>
<rect x="360" y="140" width="240" height="60" rx="8" fill="#fed7aa"/><text x="480" y="164" text-anchor="middle" class="svg-ink" font-size="12">VRF GUEST</text><text x="480" y="184" text-anchor="middle" class="svg-muted" font-size="12">172.16.0.0/16, sirf internet</text>
</svg><p class="cap">Left: FHRP hosts ko ek gateway deta hai jo router fail hone par bhi bacha rehta hai. Right: VRFs ek router ko kai isolated routing tables dete hain.</p></div>
<dl class="terms">
<dt>Device virtualization</dt><dd>Ek <b>hypervisor</b> virtual machines chalata hai. <b>Type 1</b> (bare metal: VMware ESXi, KVM) seedhe hardware par chalta hai; <b>type 2</b> (hosted) ek operating system ke upar chalta hai. VMs host ke andar ek <b>virtual switch</b> se judte hain. Catalyst 8000V VM ki tarah chalne wala router hai.</dd>
<dt>VRF</dt><dd>Virtual Routing and Forwarding: ek router ke andar alag routing tables aur interfaces, isliye overlapping addresses allowed hain aur tenants isolated rehte hain. Bina MPLS ke ise <b>VRF-lite</b> kehte hain.</dd>
<dt>GRE</dt><dd>Generic Routing Encapsulation (IP protocol 47): ek simple tunnel jo multicast aur routing protocols le jaa sakta hai, 24 bytes overhead, <b>koi encryption nahi</b>.</dd>
<dt>IPsec</dt><dd>Encryption aur integrity (ESP, IP protocol 50) jo IKE (UDP 500, ya NAT ke through 4500) se negotiate hoti hai. Routing aur security dono paane ke liye aksar <b>GRE over IPsec</b> ki tarah combine hota hai.</dd>
<dt>LISP aur VXLAN</dt><dd>LISP endpoint <b>kaun</b> hai (EID) ko woh <b>kahan</b> hai (RLOC) se alag karta hai. VXLAN Layer 2 frames ko UDP 4789 ke andar 24-bit VNI ke saath le jaata hai, lagbhag 16 million segments. SD-Access control plane ke liye LISP aur data plane ke liye VXLAN use karta hai.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> DIST1 ki priority 110 hai aur woh decrement 20 ke saath Te1/0/1 track karta hai. Jab woh uplink fail hota hai, uski priority 90 par gir jaati hai. DIST2 ki default 100 hai aur preempt hai, isliye DIST2 lagbhag 3 se 10 seconds mein active ban jaata hai (default mein hello 3 s, hold 10 s). Jab uplink wapas aata hai, DIST1 ki priority 110 par wapas jaati hai aur, kyunki DIST1 par bhi preempt hai, woh active role wapas le leta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Peer par <code>preempt</code> ke bina tracking configure karna. Tracked router apni priority kam karta hai, par standby kabhi kaam nahi sambhaalta kyunki HSRP preemption default mein off hai. Tracking tabhi kaam karti hai jab doosre router ko preempt karne ki ijazat ho.</p></div>

<div class="exam"><p><b>Exam trap.</b> VRRP default mein preempt karta hai, HSRP nahi. Group 10 ka HSRPv1 virtual MAC 0000.0c07.ac0a hai; group 10 ka VRRP wala 0000.5e00.010a hai. NAT mein "inside global" <b>aapke</b> host ka public address hai, remote server ka nahi.</p></div>

<div class="scn"><h4>Logs jo jhooth bol rahe the</h4><p>Ek security investigation ke dauraan, team ne firewall logs ko switch logs ke saath line up karne ki koshish ki aur unhe 7 minute ke antar par paaya; switch logs 1993 ke timestamps bhi dikha rahe the. Template change ke baad kai access switches par koi NTP configuration nahi thi, aur ek par <code>ntp server</code> ek decommissioned address ki taraf point kar raha tha. <code>show ntp status</code> ne kaha "Clock is unsynchronized, stratum 16". Fix tha dono core loopbacks ki taraf point karta ek standard NTP block plus <code>service timestamps log datetime msec</code>, har device par push kiya gaya.</p><p><b>Seekh:</b> synchronised time ke bina troubleshooting aur security investigations andaaze hain. NTP har device par verify karo, sirf core par nahi.</p></div>

<div class="iv"><p class="q">"Inside local, inside global, outside local aur outside global explain karo."</p><p>Strong answer: "inside" aur "outside" batate hain ki address kiska hai; "local" aur "global" batate hain ki aap kis side se dekh rahe ho. Inside local mere host ka private address hai, inside global woh hai jaisa internet NAT ke baad mere host ko dekhta hai, outside global remote server ka asli address hai, aur outside local woh hai jaisa woh server mere inside network ko dikhta hai, normally identical jab tak aap destination bhi translate na karo. 10.1.10.50 aur 203.0.113.10 ke saath ek quick example draw karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HSRP (Cisco, preempt off), VRRP (open, preempt on), GLBP (per-host load sharing); tracking ko peer par preempt chahiye.</li>
<li>DHCP relay: SVI par <code>ip helper-address</code>, giaddr scope chunta hai; UDP 67/68 par DORA.</li>
<li>NAT: inside local/global, outside local/global; static, dynamic, overload ke saath PAT.</li>
<li>NTP stratum hierarchy, stratum 16 = unsynchronised; sub-microsecond accuracy ke liye PTP.</li>
<li>Virtualization: type 1 aur 2 hypervisors, VRF-lite, GRE (koi encryption nahi), IPsec, LISP (EID/RLOC), VXLAN (UDP 4789, 24-bit VNI).</li>
</ul></div>
`}};export{e as default};