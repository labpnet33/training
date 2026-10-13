var e={id:`omp`,h:{en:`OMP: the routing protocol of the overlay`,hi:`OMP: overlay ka routing protocol`},body:{en:`
<p>Tunnels alone do not tell an edge which prefixes live behind which remote site. That is the job of the <b>Overlay Management Protocol (OMP)</b>. This chapter explains what OMP carries, how an edge turns OMP information into a route, and how to read OMP output without getting lost in the status codes.</p>

<h3>What OMP is</h3>
<p>OMP runs inside the DTLS or TLS control connection between each edge and each Controller. Edges never peer with each other. It behaves like BGP with a route reflector: every edge tells the Controller what it knows, and the Controller reflects the (policy-filtered) result to the other edges. Unlike BGP, it was designed for this job, so it also carries encryption keys and policy and needs very little configuration. It is enabled by default on a WAN edge.</p>

<h3>The three kinds of OMP route</h3>
<ul>
<li><b>OMP routes</b> (also called vRoutes): service-side prefixes learned in a VPN (connected, static, OSPF, BGP, EIGRP and so on). Attributes include the VPN and a <b>label</b>, the <b>TLOC</b> that is the next hop, the origin protocol and metric, preference, site ID and tag.</li>
<li><b>TLOC routes</b>: each TLOC with its private and public address and port, colour, encapsulation, weight and preference (chapter 4).</li>
<li><b>Service routes</b>: services such as a firewall or IPS reachable in a VPN, used for service chaining (policy modules).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="OMP route flow">
<rect x="240" y="20" width="160" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">VSMART (Controller)</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="11">reflects + applies policy</text>
<rect x="30" y="170" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="115" y="192" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1</text><text x="115" y="210" text-anchor="middle" class="svg-muted" font-size="11">owns 10.1.10.0/24</text><text x="115" y="226" text-anchor="middle" class="svg-muted" font-size="11">TLOCs: biz-internet, mpls</text>
<rect x="440" y="170" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="525" y="192" text-anchor="middle" class="svg-ink" font-size="13">E-BLR-1</text><text x="525" y="210" text-anchor="middle" class="svg-muted" font-size="11">owns 10.3.10.0/24</text><text x="525" y="226" text-anchor="middle" class="svg-muted" font-size="11">TLOC: biz-internet</text>
<path d="M150 170 L270 70" stroke="#16a34a" stroke-width="2.5" fill="none"/><path d="M490 170 L370 70" stroke="#16a34a" stroke-width="2.5" fill="none"/>
<path d="M175 170 L295 70" stroke="#f97316" stroke-width="1.5" stroke-dasharray="4 3" fill="none"/><path d="M465 170 L345 70" stroke="#f97316" stroke-width="1.5" stroke-dasharray="4 3" fill="none"/>
<line x1="200" y1="205" x2="440" y2="205" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="11">IPsec data tunnel</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="11">green: routes sent up; orange: routes reflected down</text>
</svg><p class="cap">Each edge sends its prefixes and TLOCs to the Controller; the Controller sends the others' back. Data never goes through the Controller.</p></div>

<h3>From OMP route to forwarding</h3>
<p>An edge installs an OMP route in a VPN's routing table only if its TLOC is <b>resolved</b>: that is, a BFD session to that TLOC is up. This is why a prefix can be present in OMP yet unusable. Installed routes appear with code <code>m</code>, administrative distance 251, and point to the remote system IP out of the logical <code>Sdwan-system-intf</code> interface.</p>
<pre class="code">E-DEL-1# show sdwan omp routes vpn 10
                              PATH               ATTRIBUTE
VPN PREFIX       FROM PEER    ID   LABEL STATUS  TYPE      TLOC IP     COLOR        ENCAP PREFERENCE
-----------------------------------------------------------------------------------------------------
10  10.1.10.0/24 0.0.0.0      64   1012  C,Red,R installed 10.255.0.11 biz-internet ipsec -
10  10.1.10.0/24 0.0.0.0      65   1012  C,Red,R installed 10.255.0.11 mpls         ipsec -
10  10.3.10.0/24 10.255.255.2 1    1012  <span class="hl">C,I,R</span>   installed 10.255.0.13 biz-internet ipsec -

E-DEL-1# show ip route vrf 10 | begin Gateway
      10.0.0.0/8 is variably subnetted, 3 subnets, 2 masks
C        10.1.10.0/24 is directly connected, GigabitEthernet3
L        10.1.10.1/32 is directly connected, GigabitEthernet3
<span class="hl">m        10.3.10.0/24 [251/0] via 10.255.0.13, 00:00:03, Sdwan-system-intf</span></pre>
<p>Read it from the left: VPN 10, prefix 10.3.10.0/24, learned from the Controller (10.255.255.2), next hop is the TLOC of E-BLR-1 over biz-internet. In the routing table the same prefix appears with code <code>m</code>. The first two lines (<code>FROM PEER 0.0.0.0</code>) are the edge's own prefix, sent to the Controller.</p>

<h3>The status codes</h3>
<table class="cmp"><tr><th>Code</th><th>Meaning</th></tr>
<tr><td>C</td><td>Chosen: selected as best</td></tr>
<tr><td>I</td><td>Installed in the routing table</td></tr>
<tr><td>R</td><td>Resolved: the TLOC is reachable (BFD up)</td></tr>
<tr><td>Red</td><td>Redistributed: our own prefix, sent to the Controller</td></tr>
<tr><td>Inv, U</td><td>Invalid or unresolved: received but unusable, normally no BFD to that TLOC</td></tr>
<tr><td>S</td><td>Stale: kept during a graceful restart</td></tr></table>

<h3>Looking inside one route</h3>
<p>Add a prefix and the word <code>detail</code> to see all attributes of the route, including which TLOC is the next hop and which peer sent it. In the Zenith Logistics fabric (lab 2), E-DEL-1 learns 10.4.10.0/24 from E-HYD-1:</p>
<pre class="code">E-DEL-1# show sdwan omp routes vpn 10 10.4.10.0/24 detail
---------------------------------------------------
omp route entries for vpn 10 route 10.4.10.0/24
---------------------------------------------------
            RECEIVED FROM:
peer            10.255.255.2
path-id         1
label           1002
status          C,I,R
    Attributes:
     originator       10.255.0.14
     type             installed
     tloc             <span class="hl">10.255.0.14, mpls, ipsec</span>
     site-id          400
     origin-proto     connected
     origin-metric    0</pre>
<p>Two key answers: the <b>originator</b> (10.255.0.14, the system IP of E-HYD-1) and the <b>TLOC</b> (colour mpls, so today the traffic uses the MPLS tunnel). The path-ID and label are internal identifiers; the label is what marks the packet as belonging to VPN 10 inside the tunnel.</p>

<h3>What an edge advertises, and how many paths</h3>
<p>By default an edge advertises the <b>connected</b> and <b>static</b> routes of each VPN. Routes learned from OSPF, BGP or EIGRP are <b>not</b> advertised unless you ask, under <code>sdwan</code>, <code>omp</code>, <code>address-family ipv4 vrf</code>. The Controller sends at most <code>send-path-limit</code> paths per prefix (default 4) and the edge installs up to <code>ecmp-limit</code> (default 4) equal-cost paths. You can check the OMP state of an edge quickly with <code>show sdwan omp summary</code>.</p>
<pre class="code"><span class="c">! Reference configuration: also advertise BGP and OSPF routes of VPN 10</span>
config-transaction
sdwan
 omp
  address-family ipv4 vrf 10
   advertise connected
   advertise static
   advertise bgp
   advertise ospf external
   exit
  exit
 exit
commit</pre>

<div class="eg"><p><b>Worked example.</b> E-DEL-1 has two TLOCs and E-HYD-1 (in lab 2, after the second transport is added) also has two. For prefix 10.4.10.0/24 the Controller sends two paths: via 10.255.0.14 mpls and via 10.255.0.14 biz-internet. E-DEL-1 installs both (ecmp-limit 4), so <code>show sdwan omp routes</code> shows two <code>installed</code> lines. Before the second transport was added there was one.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reading <code>FROM PEER 0.0.0.0</code> as a fault (it is our own route); expecting OSPF routes to reach other sites without <code>advertise ospf</code>; forgetting that a received prefix with <code>Inv,U</code> is not in the routing table; confusing the TLOC's system IP with the interface used for the tunnel.</p></div>

<div class="exam"><p><b>Exam traps.</b> OMP administrative distance on IOS XE is <b>251</b>. By default only connected and static routes are redistributed into OMP. A route is installed only if its TLOC is resolved. The Controller reflects, it does not forward. Default send-path-limit is 4 and ecmp-limit is 4.</p></div>

<div class="scn"><h4>The route that was in OMP but not in the table</h4><p>After a firewall change at the Mumbai data centre, users in Delhi could not reach the 10.2.10.0/24 servers. The NOC saw the prefix in <code>show sdwan omp routes</code> but with status <code>Inv,U</code>, and no <code>m</code> route in the VRF. That pointed straight to the TLOC: no BFD session was up to it, because the new firewall rule blocked the IPsec UDP ports between the sites. After the rule was corrected, BFD came up, the route became <code>C,I,R</code> and traffic resumed.</p><p><b>Lesson:</b> an unresolved route is a data-plane problem, not a control-plane one. Look at BFD.</p></div>

<div class="iv"><p class="q">"How does a prefix learned at one branch reach another branch in Catalyst SD-WAN?"</p><p>Strong answer: the source edge advertises the prefix to the Controller in OMP with its TLOC as next hop and a VPN label; the Controller applies control policy and reflects it to other edges; each receiving edge installs it only if its TLOC is resolved through a BFD session, with administrative distance 251; the traffic then goes straight between the edges inside an IPsec tunnel using the TLOC's addresses.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OMP runs edge to Controller only; it carries OMP routes, TLOC routes and service routes, plus keys and policy.</li>
<li>A route is installed only when its TLOC is resolved (BFD up); it then appears with code m and AD 251.</li>
<li>Status codes: C chosen, I installed, R resolved, Red redistributed, Inv,U unusable, S stale.</li>
<li>Connected and static are advertised by default; OSPF, BGP and EIGRP need explicit advertise commands.</li>
<li>Use show sdwan omp routes (with detail), show ip route vrf, and show sdwan omp tlocs together.</li>
</ul></div>
`,hi:`
<p>Sirf tunnels edge ko nahi batate ki kaunse prefixes kis remote site ke peeche hain. Yeh <b>Overlay Management Protocol (OMP)</b> ka kaam hai. Yeh chapter samjhata hai ki OMP kya carry karta hai, edge OMP information ko route kaise banata hai, aur status codes mein kho jaye bina OMP output kaise padhte hain.</p>

<h3>OMP kya hai</h3>
<p>OMP har edge aur har Controller ke beech DTLS ya TLS control connection ke andar chalta hai. Edges aapas mein kabhi peer nahi karte. Yeh route reflector wale BGP jaisa behave karta hai: har edge Controller ko batata hai ki use kya pata hai, aur Controller (policy-filtered) result doosre edges ko reflect karta hai. BGP se alag, yeh isi kaam ke liye design hua, isliye yeh encryption keys aur policy bhi carry karta hai aur bahut kam configuration maangta hai. WAN edge par yeh default mein enabled hota hai.</p>

<h3>OMP routes ke teen prakaar</h3>
<ul>
<li><b>OMP routes</b> (vRoutes bhi kehte hain): kisi VPN mein seekhe gaye service-side prefixes (connected, static, OSPF, BGP, EIGRP aur aise). Attributes mein VPN aur ek <b>label</b>, next hop banne wala <b>TLOC</b>, origin protocol aur metric, preference, site ID aur tag shamil hain.</li>
<li><b>TLOC routes</b>: har TLOC apne private aur public address aur port, colour, encapsulation, weight aur preference ke saath (chapter 4).</li>
<li><b>Service routes</b>: VPN mein reachable services jaise firewall ya IPS, service chaining ke liye (policy modules).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="OMP route flow">
<rect x="240" y="20" width="160" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">VSMART (Controller)</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="11">reflect + policy lagata hai</text>
<rect x="30" y="170" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="115" y="192" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1</text><text x="115" y="210" text-anchor="middle" class="svg-muted" font-size="11">owns 10.1.10.0/24</text><text x="115" y="226" text-anchor="middle" class="svg-muted" font-size="11">TLOCs: biz-internet, mpls</text>
<rect x="440" y="170" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="525" y="192" text-anchor="middle" class="svg-ink" font-size="13">E-BLR-1</text><text x="525" y="210" text-anchor="middle" class="svg-muted" font-size="11">owns 10.3.10.0/24</text><text x="525" y="226" text-anchor="middle" class="svg-muted" font-size="11">TLOC: biz-internet</text>
<path d="M150 170 L270 70" stroke="#16a34a" stroke-width="2.5" fill="none"/><path d="M490 170 L370 70" stroke="#16a34a" stroke-width="2.5" fill="none"/>
<path d="M175 170 L295 70" stroke="#f97316" stroke-width="1.5" stroke-dasharray="4 3" fill="none"/><path d="M465 170 L345 70" stroke="#f97316" stroke-width="1.5" stroke-dasharray="4 3" fill="none"/>
<line x1="200" y1="205" x2="440" y2="205" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="11">IPsec data tunnel</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="11">green: routes upar bheje; orange: routes neeche reflect hue</text>
</svg><p class="cap">Har edge apne prefixes aur TLOCs Controller ko bhejta hai; Controller doosron ke wapas bhejta hai. Data kabhi Controller se nahi guzarta.</p></div>

<h3>OMP route se forwarding tak</h3>
<p>Edge OMP route VPN ki routing table mein tabhi install karta hai jab uska TLOC <b>resolved</b> ho: yaani us TLOC tak BFD session up ho. Isi liye prefix OMP mein ho kar bhi unusable ho sakta hai. Installed routes code <code>m</code>, administrative distance 251 ke saath dikhte hain, aur logical <code>Sdwan-system-intf</code> interface se remote system IP ko point karte hain.</p>
<pre class="code">E-DEL-1# show sdwan omp routes vpn 10
                              PATH               ATTRIBUTE
VPN PREFIX       FROM PEER    ID   LABEL STATUS  TYPE      TLOC IP     COLOR        ENCAP PREFERENCE
-----------------------------------------------------------------------------------------------------
10  10.1.10.0/24 0.0.0.0      64   1012  C,Red,R installed 10.255.0.11 biz-internet ipsec -
10  10.1.10.0/24 0.0.0.0      65   1012  C,Red,R installed 10.255.0.11 mpls         ipsec -
10  10.3.10.0/24 10.255.255.2 1    1012  <span class="hl">C,I,R</span>   installed 10.255.0.13 biz-internet ipsec -

E-DEL-1# show ip route vrf 10 | begin Gateway
      10.0.0.0/8 is variably subnetted, 3 subnets, 2 masks
C        10.1.10.0/24 is directly connected, GigabitEthernet3
L        10.1.10.1/32 is directly connected, GigabitEthernet3
<span class="hl">m        10.3.10.0/24 [251/0] via 10.255.0.13, 00:00:03, Sdwan-system-intf</span></pre>
<p>Left se padho: VPN 10, prefix 10.3.10.0/24, Controller (10.255.255.2) se seekha, next hop E-BLR-1 ka TLOC biz-internet par. Routing table mein wahi prefix code <code>m</code> ke saath dikhta hai. Pehli do lines (<code>FROM PEER 0.0.0.0</code>) edge ka apna prefix hain, jo Controller ko bheja gaya.</p>

<h3>Status codes</h3>
<table class="cmp"><tr><th>Code</th><th>Matlab</th></tr>
<tr><td>C</td><td>Chosen: best ke roop mein select hua</td></tr>
<tr><td>I</td><td>Routing table mein installed</td></tr>
<tr><td>R</td><td>Resolved: TLOC reachable hai (BFD up)</td></tr>
<tr><td>Red</td><td>Redistributed: hamara apna prefix, Controller ko bheja gaya</td></tr>
<tr><td>Inv, U</td><td>Invalid ya unresolved: mila par unusable, aam taur par us TLOC tak BFD nahi</td></tr>
<tr><td>S</td><td>Stale: graceful restart ke dauraan rakha gaya</td></tr></table>

<h3>Ek route ke andar dekhna</h3>
<p>Prefix aur <code>detail</code> shabd jodo to route ke saare attributes dikhte hain, jisme next hop kaunsa TLOC hai aur kis peer ne bheja yeh bhi. Zenith Logistics fabric (lab 2) mein E-DEL-1 E-HYD-1 se 10.4.10.0/24 seekhta hai:</p>
<pre class="code">E-DEL-1# show sdwan omp routes vpn 10 10.4.10.0/24 detail
---------------------------------------------------
omp route entries for vpn 10 route 10.4.10.0/24
---------------------------------------------------
            RECEIVED FROM:
peer            10.255.255.2
path-id         1
label           1002
status          C,I,R
    Attributes:
     originator       10.255.0.14
     type             installed
     tloc             <span class="hl">10.255.0.14, mpls, ipsec</span>
     site-id          400
     origin-proto     connected
     origin-metric    0</pre>
<p>Do key jawab: <b>originator</b> (10.255.0.14, E-HYD-1 ka system IP) aur <b>TLOC</b> (colour mpls, yaani aaj traffic MPLS tunnel use karta hai). Path-ID aur label internal identifiers hain; label hi packet ko tunnel ke andar VPN 10 ka mark karta hai.</p>

<h3>Edge kya advertise karta hai, aur kitne paths</h3>
<p>Default mein edge har VPN ke <b>connected</b> aur <b>static</b> routes advertise karta hai. OSPF, BGP ya EIGRP se seekhe routes tab tak advertise <b>nahi</b> hote jab tak aap <code>sdwan</code>, <code>omp</code>, <code>address-family ipv4 vrf</code> ke neeche na maango. Controller har prefix ke zyada se zyada <code>send-path-limit</code> paths bhejta hai (default 4) aur edge <code>ecmp-limit</code> (default 4) equal-cost paths tak install karta hai. Edge ki OMP state <code>show sdwan omp summary</code> se jaldi check kar sakte ho.</p>
<pre class="code"><span class="c">! Reference configuration: also advertise BGP and OSPF routes of VPN 10</span>
config-transaction
sdwan
 omp
  address-family ipv4 vrf 10
   advertise connected
   advertise static
   advertise bgp
   advertise ospf external
   exit
  exit
 exit
commit</pre>

<div class="eg"><p><b>Worked example.</b> E-DEL-1 ke do TLOCs hain aur E-HYD-1 ke (lab 2 mein, doosra transport jodne ke baad) bhi do hain. Prefix 10.4.10.0/24 ke liye Controller do paths bhejta hai: via 10.255.0.14 mpls aur via 10.255.0.14 biz-internet. E-DEL-1 dono install karta hai (ecmp-limit 4), isliye <code>show sdwan omp routes</code> do <code>installed</code> lines dikhata hai. Doosra transport jodne se pehle ek tha.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>FROM PEER 0.0.0.0</code> ko fault samajhna (yeh hamara apna route hai); <code>advertise ospf</code> ke bina OSPF routes doosri sites tak pahunchne ki ummeed karna; yeh bhool jaana ki <code>Inv,U</code> wala received prefix routing table mein nahi hota; TLOC ke system IP ko tunnel ke liye use hone wala interface samajhna.</p></div>

<div class="exam"><p><b>Exam traps.</b> IOS XE par OMP administrative distance <b>251</b> hai. Default mein sirf connected aur static routes OMP mein redistribute hote hain. Route tabhi install hota hai jab uska TLOC resolved ho. Controller reflect karta hai, forward nahi. Default send-path-limit 4 aur ecmp-limit 4 hai.</p></div>

<div class="scn"><h4>Woh route jo OMP mein tha par table mein nahi</h4><p>Mumbai data centre par firewall change ke baad Delhi ke users 10.2.10.0/24 servers tak nahi pahunch paaye. NOC ne prefix ko <code>show sdwan omp routes</code> mein dekha par status <code>Inv,U</code> ke saath, aur VRF mein koi <code>m</code> route nahi. Isne seedha TLOC ki taraf ishara kiya: us tak koi BFD session up nahi tha, kyunki naye firewall rule ne sites ke beech IPsec UDP ports block kar diye the. Rule sudharne ke baad BFD up aaya, route <code>C,I,R</code> ho gaya aur traffic wapas chalne laga.</p><p><b>Seekh:</b> unresolved route data-plane problem hai, control-plane nahi. BFD dekho.</p></div>

<div class="iv"><p class="q">"Catalyst SD-WAN mein ek branch par seekha prefix doosri branch tak kaise pahunchta hai?"</p><p>Strong answer: source edge prefix ko Controller ko OMP mein apne TLOC ko next hop aur VPN label ke saath advertise karta hai; Controller control policy lagakar use doosre edges ko reflect karta hai; har receiving edge use tabhi install karta hai jab uska TLOC BFD session se resolved ho, administrative distance 251 ke saath; phir traffic seedha edges ke beech IPsec tunnel mein TLOC ke addresses use karke jaata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OMP sirf edge se Controller tak chalta hai; woh OMP routes, TLOC routes aur service routes, plus keys aur policy carry karta hai.</li>
<li>Route tabhi install hota hai jab TLOC resolved (BFD up) ho; phir woh code m aur AD 251 ke saath dikhta hai.</li>
<li>Status codes: C chosen, I installed, R resolved, Red redistributed, Inv,U unusable, S stale.</li>
<li>Connected aur static default mein advertise hote hain; OSPF, BGP aur EIGRP ko explicit advertise commands chahiye.</li>
<li>show sdwan omp routes (detail ke saath), show ip route vrf aur show sdwan omp tlocs ko saath mein use karo.</li>
</ul></div>
`}};export{e as default};