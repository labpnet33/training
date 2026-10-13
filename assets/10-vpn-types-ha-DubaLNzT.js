var e={id:`vpn-types-ha`,h:{en:`VPN types compared, remote access with Secure Client, and high availability`,hi:`VPN types ki tulna, Secure Client ke saath remote access, aur high availability`},body:{en:`
<p>Transport companies offer many products: a dedicated truck between two warehouses, a bus network with a central depot, a courier van that picks up any employee from home, or a shared delivery pool where every store can send to every other store. Each fits a different business. VPN types are the same: the crypto (IKE, ESP, AES) is shared, but the way tunnels are built, addressed and routed differs.</p>

<h3>Site-to-site vs remote access</h3>
<p><b>Site-to-site</b> VPNs join networks: a router or firewall at each site encrypts traffic for whole subnets, and users notice nothing. <b>Remote access</b> VPNs join one user device to a network: a client (Cisco <b>Secure Client</b>, formerly AnyConnect) builds the tunnel, the headend authenticates the user, assigns an address from a pool and pushes policy such as split tunnelling.</p>

<h3>The big comparison table</h3>
<table class="cmp"><tr><th>Type</th><th>How it works</th><th>Routing and multicast</th><th>Best for</th><th>HA approach</th></tr>
<tr><td><b>Crypto map</b> (policy-based IPsec)</td><td>A crypto ACL on the physical interface selects "interesting" traffic; IKEv1 or IKEv2</td><td>No tunnel interface, so no routing protocols or multicast</td><td>Interop with any vendor, few static peers</td><td>Multiple <code>set peer</code> entries, DPD, stateful firewall failover</td></tr>
<tr><td><b>sVTI</b> (static virtual tunnel interface)</td><td>Route-based: a tunnel interface with <code>tunnel mode ipsec ipv4</code>; anything routed into it is encrypted</td><td>Yes: OSPF, EIGRP, BGP, multicast, per-tunnel QoS and features</td><td>Site-to-site with dynamic routing, cloud and SSE tunnels</td><td>Two tunnels to two peers, routing or BFD picks the live one</td></tr>
<tr><td><b>DMVPN</b></td><td>mGRE + NHRP + IPsec profile; spokes register with the hub and build dynamic spoke-to-spoke tunnels (phase 2/3)</td><td>Yes</td><td>Large hub-and-spoke WANs over the internet, Cisco only</td><td>Dual hubs, single or dual cloud</td></tr>
<tr><td><b>GETVPN</b></td><td>Tunnel-less: members get group keys from a GDOI key server and keep the original IP header</td><td>Yes, native (uses the WAN's routing), multicast friendly</td><td>Any-to-any encryption over a private MPLS WAN; not the internet</td><td>Cooperative key servers</td></tr>
<tr><td><b>FlexVPN</b></td><td>IKEv2-only framework with sVTI and dynamic VTIs from virtual templates; one config style for all topologies</td><td>Yes; routes can be pushed with IKEv2 configuration exchange</td><td>Unifying site-to-site, hub-spoke, spoke-spoke and remote access</td><td>Client backup peer lists with tracking, dual hubs, IKEv2 load balancer</td></tr>
<tr><td><b>RA IPsec (IKEv2)</b> with Secure Client</td><td>IKEv2 on UDP 500/4500, certificate or EAP authentication</td><td>Headend pushes routes, split tunnel lists</td><td>Users who need full network access; standards-based</td><td>Backup server list, load-balancing cluster, failover</td></tr>
<tr><td><b>RA SSL/TLS</b> with Secure Client</td><td>TLS on TCP 443 for control, <b>DTLS</b> on UDP 443 for data (falls back to TLS if UDP is blocked)</td><td>Same as above</td><td>Most common RA choice; passes hotel and guest firewalls</td><td>Same as above</td></tr>
<tr><td><b>Clientless SSL VPN</b></td><td>Browser portal that proxies web applications; no client</td><td>None; per application</td><td>Legacy: deprecated on ASA from 9.17, not offered on Threat Defense; ZTNA replaces it</td><td>Same headend HA</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Policy-based versus route-based VPN">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">Crypto map (policy-based)</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">sVTI (route-based)</text>
<rect x="40" y="40" width="240" height="40" rx="8" fill="#bae6fd"/><text x="160" y="65" text-anchor="middle" class="svg-ink" font-size="12">Packet 10.1.1.5 to 10.2.2.9</text>
<rect x="40" y="100" width="240" height="40" rx="8" fill="#fde68a"/><text x="160" y="125" text-anchor="middle" class="svg-ink" font-size="12">Crypto ACL match on Gi1?</text>
<rect x="40" y="160" width="240" height="40" rx="8" fill="#ddd6fe"/><text x="160" y="185" text-anchor="middle" class="svg-ink" font-size="12">yes: encrypt; no: send in clear</text>
<line x1="160" y1="80" x2="160" y2="100" stroke="#64748b"/><line x1="160" y1="140" x2="160" y2="160" stroke="#64748b"/>
<rect x="360" y="40" width="240" height="40" rx="8" fill="#bae6fd"/><text x="480" y="65" text-anchor="middle" class="svg-ink" font-size="12">Packet 10.1.1.5 to 10.2.2.9</text>
<rect x="360" y="100" width="240" height="40" rx="8" fill="#fde68a"/><text x="480" y="125" text-anchor="middle" class="svg-ink" font-size="12">Routing table: via Tunnel0</text>
<rect x="360" y="160" width="240" height="40" rx="8" fill="#ddd6fe"/><text x="480" y="185" text-anchor="middle" class="svg-ink" font-size="12">Tunnel0 always encrypts</text>
<line x1="480" y1="80" x2="480" y2="100" stroke="#64748b"/><line x1="480" y1="140" x2="480" y2="160" stroke="#64748b"/>
<text x="320" y="235" text-anchor="middle" class="svg-accent" font-size="12">Policy decides in the ACL; route-based decides in the routing table</text>
</svg><p class="cap">Route-based VPNs let routing protocols, failover and per-tunnel features work naturally.</p></div>

<pre class="code"><span class="c">! crypto map with a backup peer (tried in order)</span>
access-list 110 permit ip 10.1.1.0 0.0.0.255 10.2.2.0 0.0.0.255
crypto map NK-CMAP 10 ipsec-isakmp
 set peer 198.51.100.2
 set peer 198.51.100.66
 set transform-set TS-GCM
 match address 110
interface GigabitEthernet1
 crypto map NK-CMAP
<span class="c">! the same link as an sVTI</span>
interface Tunnel0
 ip address 172.16.12.1 255.255.255.252
 tunnel source GigabitEthernet1
 tunnel mode ipsec ipv4
 tunnel destination 198.51.100.2
 tunnel protection ipsec profile NK-IPSEC</pre>

<h3>High availability considerations</h3>
<ul>
<li><b>Detect failure quickly.</b> Dead peer detection sends liveness checks when a peer goes quiet (IKEv2 profile <code>dpd 10 3 on-demand</code> = 10-second interval, 3-second retries; IKEv1 <code>crypto isakmp keepalive 10 3</code>). Over VTIs, routing hellos or <b>BFD</b> detect loss even faster.</li>
<li><b>Redundant peers.</b> Crypto maps list backup peers; Secure Client profiles list backup servers; FlexVPN clients list peers in priority order with object tracking; DMVPN spokes register with two hubs.</li>
<li><b>Redundant paths.</b> Two ISPs with a tunnel over each, and routing metrics or IP SLA to prefer one.</li>
<li><b>Stateless vs stateful failover.</b> Stateless: the backup rebuilds IKE and IPsec SAs after a failure, so traffic drops for a few seconds and remote users reconnect. Stateful: an ASA or Threat Defense active/standby pair replicates IKE and IPsec SA state over the stateful failover link, so tunnels and Secure Client sessions survive (built hands-on in sec-asa-ha).</li>
<li><b>Scale-out for remote access.</b> An ASA VPN load-balancing cluster redirects new users to the least-loaded member; the client connects to one virtual address.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> R1 has two sVTIs to two Pune routers, running OSPF with default hellos (10 s, dead 40 s). When the primary Pune router dies, OSPF waits up to <b>40 seconds</b> before moving traffic. Adding BFD at 300 ms with multiplier 3 detects the loss in about <b>0.9 seconds</b>. A crypto map design relying on DPD (10-second interval, 3-second retry interval) declares the peer dead only after several unanswered retries, typically 20 to 30 seconds, and then must still negotiate a new IKE SA to the backup peer.</p></div>

<div class="warn"><p><b>Common mistake.</b> Building a crypto map between two sites and then asking why OSPF will not form. There is no tunnel interface for OSPF to run on and multicast hellos do not match a unicast crypto ACL. Use sVTI, DMVPN or FlexVPN when you need routing.</p></div>

<div class="exam"><p><b>Exam trap.</b> GETVPN is tunnel-less and preserves the original header, so it suits private MPLS, not the internet. FlexVPN is IKEv2-only. DMVPN combines mGRE, NHRP and IPsec. Secure Client's SSL VPN uses DTLS on UDP 443 for data and TLS on TCP 443 as a fallback.</p></div>

<div class="scn"><h4>Five hundred users, one headend</h4><p>During a monsoon week, 500 staff worked from home and the single ASA headend hit its session licence and CPU limits; new users saw "login failed" while existing sessions crawled. The team added a second ASA in a VPN load-balancing cluster with a shared virtual address, enabled DTLS so data used UDP instead of TCP-over-TCP, and applied split tunnelling so internet traffic did not hairpin through HQ.</p><p><b>Lesson:</b> remote access HA is about capacity as much as failover. Plan for peak, use DTLS and split tunnel policy.</p></div>

<div class="iv"><p class="q">"Compare crypto map, sVTI, DMVPN, GETVPN and FlexVPN."</p><p>Strong answer: crypto maps are policy-based and interoperable but cannot run routing protocols; sVTI is route-based point-to-point with full routing and features; DMVPN scales hub-and-spoke with dynamic spoke-to-spoke tunnels using mGRE and NHRP; GETVPN is tunnel-less group encryption for private WANs with a GDOI key server; FlexVPN is Cisco's IKEv2-only framework unifying all of these plus remote access. Close with HA: DPD or BFD for detection, redundant peers or hubs, and stateful failover on firewalls.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Site-to-site joins networks; remote access joins one device using Secure Client.</li>
<li>Crypto map = policy-based; sVTI, DMVPN and FlexVPN = route-based with routing and multicast.</li>
<li>GETVPN keeps the original header: private WAN only. FlexVPN is IKEv2 only.</li>
<li>Secure Client SSL VPN uses TLS 443 plus DTLS UDP 443; clientless VPN is deprecated on ASA.</li>
<li>HA = fast detection (DPD, BFD), redundant peers and paths, and stateful failover where sessions must survive.</li>
</ul></div>
`,hi:`
<p>Transport companies kai products deti hain: do warehouses ke beech dedicated truck, central depot wala bus network, courier van jo kisi bhi employee ko ghar se uthaye, ya shared delivery pool jahan har store har doosre store ko bhej sake. Har ek alag business ke liye fit hai. VPN types bhi aise hi hain: crypto (IKE, ESP, AES) shared hai, par tunnels banane, address karne aur route karne ka tarika alag hai.</p>

<h3>Site-to-site vs remote access</h3>
<p><b>Site-to-site</b> VPNs networks ko jodte hain: har site par router ya firewall poore subnets ka traffic encrypt karta hai, aur users ko kuch pata nahi chalta. <b>Remote access</b> VPNs ek user device ko network se jodte hain: ek client (Cisco <b>Secure Client</b>, pehle AnyConnect) tunnel banata hai, headend user ko authenticate karta hai, pool se address deta hai aur split tunnelling jaisi policy push karta hai.</p>

<h3>Badi comparison table</h3>
<table class="cmp"><tr><th>Type</th><th>Kaise kaam karta hai</th><th>Routing aur multicast</th><th>Kiske liye best</th><th>HA approach</th></tr>
<tr><td><b>Crypto map</b> (policy-based IPsec)</td><td>Physical interface par crypto ACL "interesting" traffic chunti hai; IKEv1 ya IKEv2</td><td>Tunnel interface nahi, isliye routing protocols ya multicast nahi</td><td>Kisi bhi vendor ke saath interop, kam static peers</td><td>Kai <code>set peer</code> entries, DPD, stateful firewall failover</td></tr>
<tr><td><b>sVTI</b> (static virtual tunnel interface)</td><td>Route-based: <code>tunnel mode ipsec ipv4</code> wala tunnel interface; jo bhi isme route ho woh encrypt</td><td>Haan: OSPF, EIGRP, BGP, multicast, per-tunnel QoS aur features</td><td>Dynamic routing ke saath site-to-site, cloud aur SSE tunnels</td><td>Do peers tak do tunnels, routing ya BFD zinda wala chunta hai</td></tr>
<tr><td><b>DMVPN</b></td><td>mGRE + NHRP + IPsec profile; spokes hub par register karte hain aur dynamic spoke-to-spoke tunnels banate hain (phase 2/3)</td><td>Haan</td><td>Internet par bade hub-and-spoke WANs, sirf Cisco</td><td>Dual hubs, single ya dual cloud</td></tr>
<tr><td><b>GETVPN</b></td><td>Tunnel-less: members GDOI key server se group keys lete hain aur original IP header rakhte hain</td><td>Haan, native (WAN ki routing use karta hai), multicast friendly</td><td>Private MPLS WAN par any-to-any encryption; internet nahi</td><td>Cooperative key servers</td></tr>
<tr><td><b>FlexVPN</b></td><td>Sirf-IKEv2 framework, sVTI aur virtual templates se dynamic VTIs; saari topologies ke liye ek config style</td><td>Haan; routes IKEv2 configuration exchange se push ho sakte hain</td><td>Site-to-site, hub-spoke, spoke-spoke aur remote access ko ek karna</td><td>Tracking ke saath client backup peer lists, dual hubs, IKEv2 load balancer</td></tr>
<tr><td>Secure Client ke saath <b>RA IPsec (IKEv2)</b></td><td>UDP 500/4500 par IKEv2, certificate ya EAP authentication</td><td>Headend routes, split tunnel lists push karta hai</td><td>Jin users ko poora network access chahiye; standards-based</td><td>Backup server list, load-balancing cluster, failover</td></tr>
<tr><td>Secure Client ke saath <b>RA SSL/TLS</b></td><td>Control ke liye TCP 443 par TLS, data ke liye UDP 443 par <b>DTLS</b> (UDP blocked ho to TLS par wapas)</td><td>Upar jaisa</td><td>Sabse common RA choice; hotel aur guest firewalls paar kar leta hai</td><td>Upar jaisa</td></tr>
<tr><td><b>Clientless SSL VPN</b></td><td>Browser portal jo web applications proxy karta hai; koi client nahi</td><td>Koi nahi; per application</td><td>Legacy: ASA par 9.17 se deprecated, Threat Defense par offer nahi; ZTNA iski jagah leta hai</td><td>Same headend HA</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Policy-based vs route-based VPN">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">Crypto map (policy-based)</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">sVTI (route-based)</text>
<rect x="40" y="40" width="240" height="40" rx="8" fill="#bae6fd"/><text x="160" y="65" text-anchor="middle" class="svg-ink" font-size="12">Packet 10.1.1.5 se 10.2.2.9</text>
<rect x="40" y="100" width="240" height="40" rx="8" fill="#fde68a"/><text x="160" y="125" text-anchor="middle" class="svg-ink" font-size="12">Gi1 par crypto ACL match?</text>
<rect x="40" y="160" width="240" height="40" rx="8" fill="#ddd6fe"/><text x="160" y="185" text-anchor="middle" class="svg-ink" font-size="12">haan: encrypt; nahi: clear mein</text>
<line x1="160" y1="80" x2="160" y2="100" stroke="#64748b"/><line x1="160" y1="140" x2="160" y2="160" stroke="#64748b"/>
<rect x="360" y="40" width="240" height="40" rx="8" fill="#bae6fd"/><text x="480" y="65" text-anchor="middle" class="svg-ink" font-size="12">Packet 10.1.1.5 se 10.2.2.9</text>
<rect x="360" y="100" width="240" height="40" rx="8" fill="#fde68a"/><text x="480" y="125" text-anchor="middle" class="svg-ink" font-size="12">Routing table: via Tunnel0</text>
<rect x="360" y="160" width="240" height="40" rx="8" fill="#ddd6fe"/><text x="480" y="185" text-anchor="middle" class="svg-ink" font-size="12">Tunnel0 hamesha encrypt karta hai</text>
<line x1="480" y1="80" x2="480" y2="100" stroke="#64748b"/><line x1="480" y1="140" x2="480" y2="160" stroke="#64748b"/>
<text x="320" y="235" text-anchor="middle" class="svg-accent" font-size="12">Policy ACL mein decide karti hai; route-based routing table mein</text>
</svg><p class="cap">Route-based VPNs routing protocols, failover aur per-tunnel features ko natural tarike se chalne dete hain.</p></div>

<pre class="code"><span class="c">! backup peer ke saath crypto map (order mein try hota hai)</span>
access-list 110 permit ip 10.1.1.0 0.0.0.255 10.2.2.0 0.0.0.255
crypto map NK-CMAP 10 ipsec-isakmp
 set peer 198.51.100.2
 set peer 198.51.100.66
 set transform-set TS-GCM
 match address 110
interface GigabitEthernet1
 crypto map NK-CMAP
<span class="c">! wahi link sVTI ki tarah</span>
interface Tunnel0
 ip address 172.16.12.1 255.255.255.252
 tunnel source GigabitEthernet1
 tunnel mode ipsec ipv4
 tunnel destination 198.51.100.2
 tunnel protection ipsec profile NK-IPSEC</pre>

<h3>High availability considerations</h3>
<ul>
<li><b>Failure jaldi detect karo.</b> Dead peer detection tab liveness checks bhejta hai jab peer chup ho jaye (IKEv2 profile <code>dpd 10 3 on-demand</code> = 10-second interval, 3-second retries; IKEv1 <code>crypto isakmp keepalive 10 3</code>). VTIs par routing hellos ya <b>BFD</b> loss aur bhi tez pakadte hain.</li>
<li><b>Redundant peers.</b> Crypto maps backup peers list karte hain; Secure Client profiles backup servers list karte hain; FlexVPN clients object tracking ke saath priority order mein peers list karte hain; DMVPN spokes do hubs par register hote hain.</li>
<li><b>Redundant paths.</b> Do ISPs, har ek par ek tunnel, aur ek ko prefer karne ke liye routing metrics ya IP SLA.</li>
<li><b>Stateless vs stateful failover.</b> Stateless: failure ke baad backup IKE aur IPsec SAs dobara banata hai, isliye kuch seconds traffic girta hai aur remote users reconnect karte hain. Stateful: ASA ya Threat Defense active/standby pair stateful failover link par IKE aur IPsec SA state replicate karta hai, isliye tunnels aur Secure Client sessions bache rehte hain (sec-asa-ha mein hands-on banaya jaata hai).</li>
<li><b>Remote access ke liye scale-out.</b> ASA VPN load-balancing cluster naye users ko sabse kam loaded member par redirect karta hai; client ek virtual address se connect karta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> R1 ke do Pune routers tak do sVTIs hain, default hellos (10 s, dead 40 s) ke saath OSPF chal raha hai. Jab primary Pune router marta hai, OSPF traffic move karne se pehle <b>40 seconds</b> tak wait karta hai. 300 ms aur multiplier 3 ke saath BFD jodne se loss lagbhag <b>0.9 seconds</b> mein detect hota hai. DPD (10-second interval, 3-second retry interval) par tika crypto map design peer ko kai unanswered retries ke baad hi dead maanta hai, aam taur par 20 se 30 seconds, aur phir use backup peer tak naya IKE SA bhi negotiate karna padta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Do sites ke beech crypto map banana aur phir poochna ki OSPF kyun nahi banta. OSPF chalane ke liye koi tunnel interface nahi hai aur multicast hellos unicast crypto ACL se match nahi karte. Jab routing chahiye to sVTI, DMVPN ya FlexVPN use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> GETVPN tunnel-less hai aur original header rakhta hai, isliye private MPLS ke liye hai, internet ke liye nahi. FlexVPN sirf IKEv2 hai. DMVPN mGRE, NHRP aur IPsec jodta hai. Secure Client ka SSL VPN data ke liye UDP 443 par DTLS aur fallback ke roop mein TCP 443 par TLS use karta hai.</p></div>

<div class="scn"><h4>Paanch sau users, ek headend</h4><p>Monsoon ke ek hafte mein 500 staff ghar se kaam kar rahe the aur akela ASA headend apni session licence aur CPU limits par pahunch gaya; naye users ko "login failed" dikha jabki existing sessions reng rahe the. Team ne shared virtual address ke saath VPN load-balancing cluster mein doosra ASA joda, DTLS enable kiya taaki data TCP-over-TCP ki jagah UDP use kare, aur split tunnelling apply ki taaki internet traffic HQ se hairpin na ho.</p><p><b>Seekh:</b> remote access HA failover jitna hi capacity ke baare mein hai. Peak ke liye plan karo, DTLS aur split tunnel policy use karo.</p></div>

<div class="iv"><p class="q">"Crypto map, sVTI, DMVPN, GETVPN aur FlexVPN compare karo."</p><p>Strong answer: crypto maps policy-based aur interoperable hain par routing protocols nahi chala sakte; sVTI poori routing aur features ke saath route-based point-to-point hai; DMVPN mGRE aur NHRP se dynamic spoke-to-spoke tunnels ke saath hub-and-spoke scale karta hai; GETVPN GDOI key server ke saath private WANs ke liye tunnel-less group encryption hai; FlexVPN Cisco ka sirf-IKEv2 framework hai jo in sabko plus remote access ko ek karta hai. HA ke saath khatam karo: detection ke liye DPD ya BFD, redundant peers ya hubs, aur firewalls par stateful failover.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Site-to-site networks jodta hai; remote access Secure Client se ek device jodta hai.</li>
<li>Crypto map = policy-based; sVTI, DMVPN aur FlexVPN = routing aur multicast ke saath route-based.</li>
<li>GETVPN original header rakhta hai: sirf private WAN. FlexVPN sirf IKEv2 hai.</li>
<li>Secure Client SSL VPN TLS 443 plus DTLS UDP 443 use karta hai; clientless VPN ASA par deprecated hai.</li>
<li>HA = tez detection (DPD, BFD), redundant peers aur paths, aur jahan sessions bachne chahiye wahan stateful failover.</li>
</ul></div>
`}};export{e as default};