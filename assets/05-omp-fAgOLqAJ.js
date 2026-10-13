var e={id:`omp`,h:{en:`OMP: the SD-WAN control plane`,hi:`OMP: SD-WAN ka control plane`},body:{en:`
<p>In a big office nobody phones everybody. Each team lead sends updates to the <b>coordinator</b>, and the coordinator forwards to each team exactly what it needs. That is how <b>OMP</b> (Overlay Management Protocol) works. Every WAN edge talks only to the SD-WAN Controllers; the Controllers collect everything, apply policy, and reflect the result back. If you know BGP route reflectors, you already understand 80% of OMP.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="OMP peering through the controller">
<rect x="245" y="15" width="150" height="46" rx="8" fill="#bae6fd"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">CTRL 10.255.0.1</text><text x="320" y="53" text-anchor="middle" class="svg-muted" font-size="12">route reflector</text>
<rect x="40" y="160" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="125" y="182" text-anchor="middle" class="svg-ink" font-size="13">EDGE1 10.255.0.11</text><text x="125" y="200" text-anchor="middle" class="svg-muted" font-size="12">VPN 1: 10.10.1.0/24</text>
<rect x="430" y="160" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="515" y="182" text-anchor="middle" class="svg-ink" font-size="13">EDGE2 10.255.0.12</text><text x="515" y="200" text-anchor="middle" class="svg-muted" font-size="12">VPN 1: 10.20.1.0/24</text>
<line x1="280" y1="61" x2="125" y2="160" stroke="#64748b"/><line x1="360" y1="61" x2="515" y2="160" stroke="#64748b"/>
<text x="150" y="110" class="svg-accent" font-size="12">OMP</text><text x="460" y="110" class="svg-accent" font-size="12">OMP</text>
<line x1="210" y1="185" x2="430" y2="185" stroke="#64748b" stroke-dasharray="3 5"/><text x="320" y="178" text-anchor="middle" class="svg-muted" font-size="12">no OMP between edges</text>
</svg><p class="cap">Edges peer only with controllers. Controllers reflect routes, TLOCs and policy.</p></div>

<h3>What OMP carries</h3>
<ul>
<li><b>OMP routes</b> (sometimes called vRoutes): service-side prefixes, each tagged with its <b>VPN</b>, its <b>originator</b> system-ip, <b>site-id</b>, <b>origin</b> protocol and metric, <b>preference</b>, a <b>label</b>, and — most important — the <b>TLOCs</b> through which it can be reached (its next hops).</li>
<li><b>TLOC routes</b>: the transports themselves, with private/public IPs, colour, encapsulation, preference and weight.</li>
<li><b>Service routes</b>: network services such as a firewall or IPS at a site, used for service chaining by policy.</li>
</ul>
<p>OMP also carries the <b>IPsec keys</b> (each edge generates keys per TLOC) and the <b>centralised policies</b> the Controller sends down.</p>

<h3>Key facts about OMP</h3>
<ul>
<li>Runs inside the DTLS/TLS control connection; enabled by default, no neighbour statements.</li>
<li>Hello 1 s, hold time 60 s. <b>Graceful restart</b> is on by default with a 43,200 s (12 h) timer, so edges keep forwarding on cached routes if all Controllers disappear.</li>
<li>By default an edge advertises its <b>connected</b> and <b>static</b> service-VPN routes and <b>OSPF intra- and inter-area</b> routes. BGP, EIGRP and OSPF external routes must be added under <code>omp / advertise</code>.</li>
<li>In the other direction, OMP routes are pushed into LAN protocols only if you redistribute <code>omp</code> into OSPF or BGP in that service VPN.</li>
<li>Controllers send up to 4 paths per prefix by default (<code>send-path-limit</code>) and edges install up to 4 equal paths (<code>ecmp-limit</code>).</li>
<li>On IOS XE edges OMP routes appear in the VRF table with code <b>m</b> and administrative distance <b>251</b> (legacy vEdge: 250), so any locally learned route wins.</li>
</ul>

<h3>Route resolution: why a route is or is not installed</h3>
<p>The edge receives an OMP route that says "10.20.1.0/24 in VPN 1 is behind TLOCs (10.255.0.12, biz-internet) and (10.255.0.12, mpls)". It installs the route only if at least one of those TLOCs is <b>resolved</b>, meaning a BFD session to it is up. No working tunnel, no route. This is why OMP and BFD must be checked together.</p>
<table class="cmp"><tr><th>Status code</th><th>Meaning</th></tr>
<tr><td>C</td><td>Chosen: best path</td></tr><tr><td>I</td><td>Installed in the routing table</td></tr>
<tr><td>R</td><td>Resolved: its TLOC is reachable</td></tr><tr><td>Red</td><td>Redistributed: originated locally</td></tr>
<tr><td>Inv</td><td>Invalid</td></tr><tr><td>U</td><td>TLOC unresolved (no BFD to it)</td></tr>
<tr><td>Rej</td><td>Rejected by policy</td></tr><tr><td>S</td><td>Stale (during graceful restart)</td></tr></table>
<p>When several routes exist for a prefix, the simplified best-path order is: resolved TLOC first, then lower administrative distance, higher <b>OMP route preference</b>, higher <b>TLOC preference</b>, better origin type (connected, static, eBGP, OSPF...), lower origin metric, and finally a tie-break on system-ip. Centralised control policy can set preference to steer traffic.</p>

<h3>Verification in the lab</h3>
<pre class="out">EDGE1# show sdwan omp peers
R -> routes received
I -> routes installed
S -> routes sent

PEER             TYPE        DOMAIN ID  SITE ID   STATE   UPTIME       R/I/S
---------------- ----------- ---------- --------- ------- ------------ --------
<span class="hl">10.255.0.1       controller  1          1         up      0:00:05:12   1/1/1</span>

EDGE1# show sdwan omp routes
VPN   PREFIX              FROM PEER        STATUS   ATTRIBUTE TYPE  TLOC IP          COLOR           ENCAP
----- ------------------- ---------------- -------- --------------- ---------------- --------------- -----
1     10.10.1.0/24        0.0.0.0          C,Red,R  installed       10.255.0.11      biz-internet    ipsec
1     10.10.1.0/24        0.0.0.0          C,Red,R  installed       10.255.0.11      mpls            ipsec
<span class="hl">1     10.20.1.0/24        10.255.0.1       C,I,R    installed       10.255.0.12      biz-internet    ipsec</span>
<span class="hl">1     10.20.1.0/24        10.255.0.1       C,I,R    installed       10.255.0.12      mpls            ipsec</span>

EDGE1# show ip route
<span class="hl">m     10.20.1.0/24 [251/0] via 10.255.0.12, 00:05:02, Sdwan-system-intf</span></pre>
<p>Read it this way: our own LAN is <b>Red</b> (redistributed from us), EDGE2's LAN arrived from the controller and is <b>C,I,R</b> through both of EDGE2's TLOCs, and the routing table points at EDGE2's <b>system-ip</b>, not at a physical next hop. The tunnel beneath chooses the actual colour. On a real IOS XE edge use <code>show ip route vrf 1</code>.</p>

<div class="eg"><p><b>Worked example.</b> A branch has 10.30.0.0/24 in VPN 1 and learns 10.30.0.0/24 also via OMP from another site after a mistake. The local connected route (AD 0) wins; the OMP copy (AD 251) stays in the OMP table only. Traffic from that branch never leaves, while other sites now see two origins for the same prefix. Duplicate prefixes across sites are an addressing error OMP will not fix.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Expecting OMP routes to appear in the LAN OSPF without redistributing <code>omp</code>. Expecting BGP-learned LAN prefixes in OMP without <code>advertise bgp</code>. Looking at "show ip route" only and missing that the route is in OMP but <b>Inv,U</b> because BFD is down.</p></div>

<div class="exam"><p><b>Exam traps.</b> OMP peers are edge-to-controller (and controller-to-controller), never edge-to-edge. OMP carries three route types: OMP, TLOC and service. A route needs a resolved TLOC to be installed. OMP AD on IOS XE is 251.</p></div>

<div class="scn"><h4>Routes present, traffic missing</h4><p>After a firewall change at a data centre, users in two branches could not reach the DC servers. The Controller showed the DC prefixes perfectly. On the branch edge, <code>show sdwan omp routes</code> listed them as <b>Inv,U</b>. The firewall now blocked UDP 12346 between the internet-facing TLOCs, so the BFD sessions were down and the TLOCs unresolved. Opening the IPsec/BFD port range restored the tunnels and the routes turned C,I,R within seconds.</p><p><b>Lesson:</b> in SD-WAN the control plane can be perfect while the data plane is broken. Always pair OMP checks with BFD checks.</p></div>

<div class="iv"><p class="q">"Compare OMP with BGP."</p><p>Strong answer: both are path-vector style with attributes and route reflection. OMP runs automatically inside DTLS/TLS to the Controllers, which act as route reflectors; it carries three route types (OMP, TLOC, service), distributes IPsec keys and policy, and ties route installation to TLOC resolution by BFD. Its defaults: graceful restart 12 h, send-path-limit and ECMP 4, AD 251 on IOS XE. Mention that control policy on the Controller manipulates OMP like route-maps on a BGP RR.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OMP runs edge to Controller only; Controllers reflect like BGP route reflectors.</li>
<li>Three route types: OMP (prefixes), TLOC (transports), service (network services).</li>
<li>A route is installed only when one of its TLOCs is resolved by an up BFD session.</li>
<li>Defaults: connected, static and OSPF intra/inter advertised; AD 251; graceful restart 12 h.</li>
<li>Verify with <code>show sdwan omp peers</code>, <code>show sdwan omp routes</code>, <code>show ip route</code>.</li>
</ul></div>
`,hi:`
<p>Bade office mein koi har kisi ko phone nahi karta. Har team lead updates <b>coordinator</b> ko bhejta hai, aur coordinator har team ko bilkul utna aage bhejta hai jitna use chahiye. <b>OMP</b> (Overlay Management Protocol) aise hi kaam karta hai. Har WAN edge sirf SD-WAN Controllers se baat karta hai; Controllers sab kuch ikattha karte hain, policy lagate hain, aur result wapas reflect karte hain. Agar aap BGP route reflectors jaante ho, to aap OMP ka 80% pehle se samajhte ho.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Controller ke through OMP peering">
<rect x="245" y="15" width="150" height="46" rx="8" fill="#bae6fd"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">CTRL 10.255.0.1</text><text x="320" y="53" text-anchor="middle" class="svg-muted" font-size="12">route reflector</text>
<rect x="40" y="160" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="125" y="182" text-anchor="middle" class="svg-ink" font-size="13">EDGE1 10.255.0.11</text><text x="125" y="200" text-anchor="middle" class="svg-muted" font-size="12">VPN 1: 10.10.1.0/24</text>
<rect x="430" y="160" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="515" y="182" text-anchor="middle" class="svg-ink" font-size="13">EDGE2 10.255.0.12</text><text x="515" y="200" text-anchor="middle" class="svg-muted" font-size="12">VPN 1: 10.20.1.0/24</text>
<line x1="280" y1="61" x2="125" y2="160" stroke="#64748b"/><line x1="360" y1="61" x2="515" y2="160" stroke="#64748b"/>
<text x="150" y="110" class="svg-accent" font-size="12">OMP</text><text x="460" y="110" class="svg-accent" font-size="12">OMP</text>
<line x1="210" y1="185" x2="430" y2="185" stroke="#64748b" stroke-dasharray="3 5"/><text x="320" y="178" text-anchor="middle" class="svg-muted" font-size="12">edges ke beech OMP nahi</text>
</svg><p class="cap">Edges sirf controllers se peer karte hain. Controllers routes, TLOCs aur policy reflect karte hain.</p></div>

<h3>OMP kya le jaata hai</h3>
<ul>
<li><b>OMP routes</b> (kabhi vRoutes bhi kehte hain): service-side prefixes, har ek par uska <b>VPN</b>, <b>originator</b> system-ip, <b>site-id</b>, <b>origin</b> protocol aur metric, <b>preference</b>, ek <b>label</b>, aur — sabse zaroori — woh <b>TLOCs</b> jinke through yeh reachable hai (iske next hops).</li>
<li><b>TLOC routes</b>: khud transports, private/public IPs, colour, encapsulation, preference aur weight ke saath.</li>
<li><b>Service routes</b>: kisi site par firewall ya IPS jaisi network services, policy se service chaining ke liye.</li>
</ul>
<p>OMP <b>IPsec keys</b> (har edge har TLOC ke liye keys banata hai) aur Controller ki bheji <b>centralised policies</b> bhi le jaata hai.</p>

<h3>OMP ke key facts</h3>
<ul>
<li>DTLS/TLS control connection ke andar chalta hai; default mein enabled, koi neighbour statements nahi.</li>
<li>Hello 1 s, hold time 60 s. <b>Graceful restart</b> default mein on hai 43,200 s (12 h) timer ke saath, isliye agar saare Controllers gayab ho jaayein to bhi edges cached routes par forward karte rehte hain.</li>
<li>Default mein edge apne service-VPN ke <b>connected</b> aur <b>static</b> routes aur <b>OSPF intra- aur inter-area</b> routes advertise karta hai. BGP, EIGRP aur OSPF external routes <code>omp / advertise</code> ke neeche jodne padte hain.</li>
<li>Doosri direction mein, OMP routes LAN protocols mein tabhi jaate hain jab aap us service VPN mein <code>omp</code> ko OSPF ya BGP mein redistribute karo.</li>
<li>Controllers default mein har prefix ke 4 tak paths bhejte hain (<code>send-path-limit</code>) aur edges 4 tak equal paths install karte hain (<code>ecmp-limit</code>).</li>
<li>IOS XE edges par OMP routes VRF table mein code <b>m</b> aur administrative distance <b>251</b> ke saath dikhte hain (purana vEdge: 250), isliye koi bhi locally seekha route jeetta hai.</li>
</ul>

<h3>Route resolution: route install kyun hota hai ya nahi hota</h3>
<p>Edge ko ek OMP route milta hai jo kehta hai "VPN 1 mein 10.20.1.0/24 TLOCs (10.255.0.12, biz-internet) aur (10.255.0.12, mpls) ke peeche hai". Yeh route tabhi install karta hai jab un TLOCs mein se kam se kam ek <b>resolved</b> ho, yaani us tak BFD session up ho. Chalta hua tunnel nahi, to route nahi. Isiliye OMP aur BFD ko saath check karna padta hai.</p>
<table class="cmp"><tr><th>Status code</th><th>Matlab</th></tr>
<tr><td>C</td><td>Chosen: best path</td></tr><tr><td>I</td><td>Routing table mein installed</td></tr>
<tr><td>R</td><td>Resolved: uska TLOC reachable hai</td></tr><tr><td>Red</td><td>Redistributed: locally originate hua</td></tr>
<tr><td>Inv</td><td>Invalid</td></tr><tr><td>U</td><td>TLOC unresolved (us tak BFD nahi)</td></tr>
<tr><td>Rej</td><td>Policy ne reject kiya</td></tr><tr><td>S</td><td>Stale (graceful restart ke dauraan)</td></tr></table>
<p>Jab ek prefix ke kai routes hon, to simplified best-path order hai: pehle resolved TLOC, phir kam administrative distance, zyada <b>OMP route preference</b>, zyada <b>TLOC preference</b>, behtar origin type (connected, static, eBGP, OSPF...), kam origin metric, aur aakhir mein system-ip par tie-break. Centralised control policy traffic ko steer karne ke liye preference set kar sakti hai.</p>

<h3>Lab mein verification</h3>
<pre class="out">EDGE1# show sdwan omp peers
R -> routes received
I -> routes installed
S -> routes sent

PEER             TYPE        DOMAIN ID  SITE ID   STATE   UPTIME       R/I/S
---------------- ----------- ---------- --------- ------- ------------ --------
<span class="hl">10.255.0.1       controller  1          1         up      0:00:05:12   1/1/1</span>

EDGE1# show sdwan omp routes
VPN   PREFIX              FROM PEER        STATUS   ATTRIBUTE TYPE  TLOC IP          COLOR           ENCAP
----- ------------------- ---------------- -------- --------------- ---------------- --------------- -----
1     10.10.1.0/24        0.0.0.0          C,Red,R  installed       10.255.0.11      biz-internet    ipsec
1     10.10.1.0/24        0.0.0.0          C,Red,R  installed       10.255.0.11      mpls            ipsec
<span class="hl">1     10.20.1.0/24        10.255.0.1       C,I,R    installed       10.255.0.12      biz-internet    ipsec</span>
<span class="hl">1     10.20.1.0/24        10.255.0.1       C,I,R    installed       10.255.0.12      mpls            ipsec</span>

EDGE1# show ip route
<span class="hl">m     10.20.1.0/24 [251/0] via 10.255.0.12, 00:05:02, Sdwan-system-intf</span></pre>
<p>Ise aise padho: hamara apna LAN <b>Red</b> hai (humse redistribute hua), EDGE2 ka LAN controller se aaya aur EDGE2 ke dono TLOCs ke through <b>C,I,R</b> hai, aur routing table EDGE2 ke <b>system-ip</b> ki taraf point karti hai, kisi physical next hop ki taraf nahi. Neeche ka tunnel asli colour chunta hai. Real IOS XE edge par <code>show ip route vrf 1</code> use karo.</p>

<div class="eg"><p><b>Worked example.</b> Ek branch ke VPN 1 mein 10.30.0.0/24 hai aur galti se 10.30.0.0/24 kisi doosri site se OMP ke through bhi seekhti hai. Local connected route (AD 0) jeetta hai; OMP copy (AD 251) sirf OMP table mein rehti hai. Us branch ka traffic kabhi bahar nahi jaata, jabki doosri sites ko ab ek hi prefix ke do origins dikhte hain. Sites ke beech duplicate prefixes ek addressing error hai jise OMP theek nahi karega.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>omp</code> redistribute kiye bina OMP routes ko LAN OSPF mein expect karna. <code>advertise bgp</code> ke bina BGP se seekhe LAN prefixes ko OMP mein expect karna. Sirf "show ip route" dekhna aur yeh miss karna ki route OMP mein hai par <b>Inv,U</b> hai kyunki BFD down hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> OMP peers edge-to-controller (aur controller-to-controller) hote hain, kabhi edge-to-edge nahi. OMP teen route types le jaata hai: OMP, TLOC aur service. Route install hone ke liye resolved TLOC chahiye. IOS XE par OMP AD 251 hai.</p></div>

<div class="scn"><h4>Routes maujood, traffic gayab</h4><p>Data centre par firewall change ke baad do branches ke users DC servers tak nahi pahunch pa rahe the. Controller DC prefixes bilkul sahi dikha raha tha. Branch edge par <code>show sdwan omp routes</code> unhe <b>Inv,U</b> dikha raha tha. Firewall ab internet-facing TLOCs ke beech UDP 12346 block kar raha tha, isliye BFD sessions down the aur TLOCs unresolved. IPsec/BFD port range kholne se tunnels wapas aaye aur routes seconds mein C,I,R ho gaye.</p><p><b>Seekh:</b> SD-WAN mein control plane perfect ho sakta hai jabki data plane toota ho. OMP checks ko hamesha BFD checks ke saath jodo.</p></div>

<div class="iv"><p class="q">"OMP ko BGP se compare karo."</p><p>Strong answer: dono attributes aur route reflection wale path-vector style hain. OMP Controllers tak DTLS/TLS ke andar automatically chalta hai, jo route reflectors ki tarah kaam karte hain; yeh teen route types (OMP, TLOC, service) le jaata hai, IPsec keys aur policy baant-ta hai, aur route installation ko BFD se TLOC resolution se jodta hai. Iske defaults: graceful restart 12 h, send-path-limit aur ECMP 4, IOS XE par AD 251. Batao ki Controller par control policy OMP ko waise hi manipulate karti hai jaise BGP RR par route-maps.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OMP sirf edge se Controller chalta hai; Controllers BGP route reflectors ki tarah reflect karte hain.</li>
<li>Teen route types: OMP (prefixes), TLOC (transports), service (network services).</li>
<li>Route tabhi install hota hai jab uska koi TLOC up BFD session se resolved ho.</li>
<li>Defaults: connected, static aur OSPF intra/inter advertise; AD 251; graceful restart 12 h.</li>
<li><code>show sdwan omp peers</code>, <code>show sdwan omp routes</code>, <code>show ip route</code> se verify karo.</li>
</ul></div>
`}};export{e as default};