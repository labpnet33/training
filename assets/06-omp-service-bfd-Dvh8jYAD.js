var e={id:`omp-service-bfd`,h:{en:`Service side, OMP on the edge and BFD`,hi:`Service side, edge par OMP aur BFD`},body:{en:`
<p>Think of a courier company. The head office keeps a <b>directory</b> that says which city every parcel address belongs to (that is OMP). Each delivery van drives on real roads, and every few seconds a van calls the dispatcher to say "road open, 20 ms, no parcels lost" (that is BFD). A parcel is only sent along a road that the directory lists <b>and</b> that the vans report as working.</p>

<h3>The service side: where the users are</h3>
<p>The <b>service side</b> of an edge is the LAN facing the users: a service VPN (a VRF on IOS XE) with an interface toward the switch. On E-DEL-1 the LAN is VPN 10:</p>
<pre class="code">vrf definition 10
 address-family ipv4
 exit-address-family
!
interface GigabitEthernet3
 description DELHI-LAN
 vrf forwarding 10
 ip address 10.1.10.1 255.255.255.0
 no shutdown</pre>
<p>The same VPN number must be used on every site that should share the segment. VPN 10 at Delhi, Mumbai and Bengaluru is one logical network. A VPN that exists at only one site is simply local.</p>

<h3>OMP on the edge</h3>
<p><b>OMP</b> (Overlay Management Protocol) runs between each edge and the Controller inside the control connection. Edges never speak OMP to each other. The edge advertises three kinds of information: <b>routes</b> (service-side prefixes, with their VPN label and TLOC), <b>TLOCs</b> and <b>services</b>. To tell the edge which prefixes to share, you configure which sources to advertise:</p>
<pre class="code">sdwan
 omp
  no shutdown
  graceful-restart
  address-family ipv4 vrf 10
   advertise connected
   advertise static
   advertise ospf
   exit
  exit</pre>
<p>Without an <code>advertise</code> line, the prefixes stay local. In the Manager's OMP and VPN templates, connected and static are on by default; learned routes such as OSPF or BGP must be turned on. Routes received from the Controller are installed in the service VRF with route code <code>m</code> and administrative distance <b>251</b>. To hand overlay routes to the LAN, redistribute OMP into the LAN's routing protocol (for example OSPF or BGP in that VRF).</p>
<p>Key OMP attributes: the <b>TLOC</b> (next hop), <b>VPN label</b>, <b>origin protocol</b> and metric, <b>preference</b>, <b>site ID</b>, <b>tag</b> and <b>path ID</b>. By default an edge sends up to 4 paths per prefix and installs up to 4 equal-cost paths.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="OMP and BFD on the edge">
<rect x="250" y="10" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">VSMART (OMP)</text>
<rect x="20" y="130" width="140" height="60" rx="8" fill="#bae6fd"/><text x="90" y="155" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1</text><text x="90" y="175" text-anchor="middle" class="svg-muted" font-size="12">VPN 10 10.1.10.0/24</text>
<rect x="240" y="130" width="160" height="60" rx="8" fill="#bae6fd"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">E-MUM-1</text><text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">VPN 10 10.2.10.0/24</text>
<rect x="480" y="130" width="140" height="60" rx="8" fill="#bae6fd"/><text x="550" y="155" text-anchor="middle" class="svg-ink" font-size="13">E-BLR-1</text><text x="550" y="175" text-anchor="middle" class="svg-muted" font-size="12">VPN 10 10.3.10.0/24</text>
<line x1="90" y1="130" x2="270" y2="60" stroke="#16a34a" stroke-width="2" stroke-dasharray="5 3"/><line x1="320" y1="130" x2="320" y2="60" stroke="#16a34a" stroke-width="2" stroke-dasharray="5 3"/><line x1="550" y1="130" x2="370" y2="60" stroke="#16a34a" stroke-width="2" stroke-dasharray="5 3"/>
<line x1="160" y1="160" x2="240" y2="160" stroke="#64748b" stroke-width="3"/><line x1="400" y1="160" x2="480" y2="160" stroke="#64748b" stroke-width="3"/>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">Dashed green: OMP to the Controller. Solid grey: IPsec tunnels carrying BFD.</text>
</svg><p class="cap">OMP carries the information. BFD proves that each tunnel really works.</p></div>

<h3>BFD: the tunnel heartbeat</h3>
<p><b>BFD</b> (Bidirectional Forwarding Detection) runs automatically inside every IPsec tunnel between two TLOCs. You do not have to enable it and you cannot switch it off. It sends a hello every <b>1000 ms</b> by default and declares the tunnel down after a <b>multiplier</b> of <b>7</b> missed hellos. Besides up/down, BFD measures <b>loss, latency and jitter</b>; application-aware routing, in a later module, uses those numbers to choose paths.</p>
<p>BFD is tuned per color. Shorter timers detect failures faster but use more bandwidth and CPU:</p>
<pre class="code">sdwan
 bfd color mpls
  hello-interval 1000
  multiplier 7</pre>
<p>BFD decides whether a TLOC is <b>resolved</b>. An OMP route is usable only if the TLOC it points to has a BFD session up. That is why a route can be received but show as invalid when BFD is down.</p>

<h3>Dynamic tunnels</h3>
<p>In a very large network a full mesh of tunnels is wasteful. <b>On-demand tunnels</b> let spokes build a direct tunnel to another spoke only when traffic needs it. Until then traffic uses the hub, and after an idle timeout the direct tunnel is removed. This saves tunnels and CPU on small devices. You enable it with the on-demand setting in the system configuration (a field in the Manager's system template).</p>

<h3>Verification</h3>
<pre class="out">E-DEL-1# show sdwan omp summary
oper-state               UP
admin-state              UP
personality              vedge
routes-received          2
routes-installed         2
routes-sent              1
tlocs-received           3
tlocs-installed          3
tlocs-sent               2

E-DEL-1# show sdwan omp routes vpn 10
VPN PREFIX       FROM PEER    ID   LABEL STATUS  TYPE      TLOC IP     COLOR        ENCAP PREFERENCE
10  10.1.10.0/24 0.0.0.0      64   1012  C,Red,R installed 10.255.0.11 biz-internet ipsec -
10  10.2.10.0/24 10.255.255.2 1    1012  C,I,R   installed 10.255.0.12 biz-internet ipsec -
10  10.3.10.0/24 10.255.255.2 1    1012  C,I,R   installed 10.255.0.13 biz-internet ipsec -

E-DEL-1# show sdwan bfd summary
sessions-total                  <span class="hl">3</span>
sessions-up                     <span class="hl">3</span>
sessions-flap                   0

E-DEL-1# show ip route vrf 10 | begin Gateway
C        10.1.10.0/24 is directly connected, GigabitEthernet3
m        10.2.10.0/24 [251/0] via 10.255.0.12, 00:04:10, Sdwan-system-intf
m        10.3.10.0/24 [251/0] via 10.255.0.13, 00:04:10, Sdwan-system-intf</pre>
<p>Read the status codes: <b>C</b> chosen, <b>I</b> installed, <b>R</b> resolved, <b>Red</b> redistributed (our own prefix), <b>Inv,U</b> invalid or unresolved.</p>

<div class="warn"><p><b>Common mistakes.</b> Using VPN 10 at one site and VPN 20 at another and expecting them to connect; forgetting <code>advertise connected</code> (the LAN does not show up elsewhere); forgetting to redistribute OMP into the LAN routing protocol; and lowering BFD timers on every circuit, including metered LTE.</p></div>
<div class="exam"><p><b>Exam trap.</b> Edges peer with Controllers over OMP, never with each other. OMP administrative distance is 251 on IOS XE. BFD runs inside IPsec tunnels, is always on, and its timers are per color.</p></div>

<div class="scn"><h4>Delhi LAN invisible to Mumbai</h4><p>Users in Mumbai could not reach a new Delhi subnet 10.1.20.0/24 on a router behind E-DEL-1, learned through OSPF. <code>show sdwan omp routes vpn 10</code> on E-MUM-1 had no such prefix. The OMP configuration on E-DEL-1 had <code>advertise connected</code> but not <code>advertise ospf</code>. After adding it, the route appeared within seconds with the right TLOC.</p><p><b>Lesson:</b> OMP advertises only the sources you enable.</p></div>

<div class="iv"><p class="q">"A route is in the OMP table but not in the routing table. Why?"</p><p>Strong answer: the TLOC it points to is unresolved. Check <code>show sdwan bfd sessions</code> for a session to that TLOC. Also look at the route status (Inv,U), a policy that filters it, or a more specific or lower-AD route in the VRF. Mention that OMP routes install with AD 251 and code m.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The service side is a service VPN (VRF) facing the LAN; use the same VPN number across sites.</li>
<li>OMP runs edge to Controller only and advertises routes, TLOCs and services; you choose what to advertise.</li>
<li>OMP routes install with code <code>m</code> and AD 251 when the TLOC is resolved.</li>
<li>BFD runs in every IPsec tunnel: 1000 ms hello, multiplier 7, tuned per color.</li>
<li>On-demand tunnels build spoke-to-spoke tunnels only when needed.</li>
</ul></div>
`,hi:`
<p>Ek courier company ke baare mein socho. Head office ke paas ek <b>directory</b> hoti hai jo batati hai ki har parcel address kis shehar ka hai (yeh OMP hai). Har delivery van asli sadkon par chalti hai, aur har kuch seconds mein van dispatcher ko call karke kehti hai "road open hai, 20 ms, koi parcel nahi khoya" (yeh BFD hai). Parcel sirf us sadak par bheja jaata hai jo directory mein listed hai <b>aur</b> jise vans working report karti hain.</p>

<h3>Service side: jahan users hain</h3>
<p>Edge ka <b>service side</b> woh LAN hai jo users ki taraf dekhta hai: ek service VPN (IOS XE par VRF) jiska ek interface switch ki taraf hota hai. E-DEL-1 par LAN VPN 10 hai:</p>
<pre class="code">vrf definition 10
 address-family ipv4
 exit-address-family
!
interface GigabitEthernet3
 description DELHI-LAN
 vrf forwarding 10
 ip address 10.1.10.1 255.255.255.0
 no shutdown</pre>
<p>Jo bhi sites segment share karein un sab par same VPN number use hona chahiye. Delhi, Mumbai aur Bengaluru par VPN 10 ek logical network hai. Jo VPN sirf ek site par hai woh simply local hai.</p>

<h3>Edge par OMP</h3>
<p><b>OMP</b> (Overlay Management Protocol) har edge aur Controller ke beech control connection ke andar chalta hai. Edges kabhi ek dusre se OMP nahi bolte. Edge teen tarah ki information advertise karta hai: <b>routes</b> (service-side prefixes, unke VPN label aur TLOC ke saath), <b>TLOCs</b> aur <b>services</b>. Edge ko batane ke liye ki kaunse prefixes share karne hain, aap configure karte ho ki kaunse sources advertise honge:</p>
<pre class="code">sdwan
 omp
  no shutdown
  graceful-restart
  address-family ipv4 vrf 10
   advertise connected
   advertise static
   advertise ospf
   exit
  exit</pre>
<p><code>advertise</code> line ke bina prefixes local rehte hain. Manager ke OMP aur VPN templates mein connected aur static default mein on hote hain; OSPF ya BGP jaise learned routes ko on karna padta hai. Controller se mile routes service VRF mein route code <code>m</code> aur administrative distance <b>251</b> ke saath install hote hain. Overlay routes LAN ko dene ke liye OMP ko LAN ke routing protocol mein redistribute karo (jaise us VRF mein OSPF ya BGP).</p>
<p>Key OMP attributes: <b>TLOC</b> (next hop), <b>VPN label</b>, <b>origin protocol</b> aur metric, <b>preference</b>, <b>site ID</b>, <b>tag</b> aur <b>path ID</b>. Default mein edge har prefix ke liye 4 paths tak bhejta hai aur 4 equal-cost paths tak install karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Edge par OMP aur BFD">
<rect x="250" y="10" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">VSMART (OMP)</text>
<rect x="20" y="130" width="140" height="60" rx="8" fill="#bae6fd"/><text x="90" y="155" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1</text><text x="90" y="175" text-anchor="middle" class="svg-muted" font-size="12">VPN 10 10.1.10.0/24</text>
<rect x="240" y="130" width="160" height="60" rx="8" fill="#bae6fd"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">E-MUM-1</text><text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">VPN 10 10.2.10.0/24</text>
<rect x="480" y="130" width="140" height="60" rx="8" fill="#bae6fd"/><text x="550" y="155" text-anchor="middle" class="svg-ink" font-size="13">E-BLR-1</text><text x="550" y="175" text-anchor="middle" class="svg-muted" font-size="12">VPN 10 10.3.10.0/24</text>
<line x1="90" y1="130" x2="270" y2="60" stroke="#16a34a" stroke-width="2" stroke-dasharray="5 3"/><line x1="320" y1="130" x2="320" y2="60" stroke="#16a34a" stroke-width="2" stroke-dasharray="5 3"/><line x1="550" y1="130" x2="370" y2="60" stroke="#16a34a" stroke-width="2" stroke-dasharray="5 3"/>
<line x1="160" y1="160" x2="240" y2="160" stroke="#64748b" stroke-width="3"/><line x1="400" y1="160" x2="480" y2="160" stroke="#64748b" stroke-width="3"/>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">Dashed green: Controller tak OMP. Solid grey: BFD le jaane wale IPsec tunnels.</text>
</svg><p class="cap">OMP information le jaata hai. BFD prove karta hai ki har tunnel sach mein chal raha hai.</p></div>

<h3>BFD: tunnel ki heartbeat</h3>
<p><b>BFD</b> (Bidirectional Forwarding Detection) do TLOCs ke beech har IPsec tunnel ke andar apne aap chalta hai. Ise enable karne ki zaroorat nahi aur band bhi nahi kar sakte. Yeh default mein har <b>1000 ms</b> par hello bhejta hai aur <b>multiplier</b> <b>7</b> yaani 7 hellos miss hone par tunnel ko down declare karta hai. Up/down ke alawa BFD <b>loss, latency aur jitter</b> measure karta hai; application-aware routing, jo agle module mein hai, in numbers se path chunti hai.</p>
<p>BFD per color tune hota hai. Chhote timers failure jaldi detect karte hain par bandwidth aur CPU zyada use karte hain:</p>
<pre class="code">sdwan
 bfd color mpls
  hello-interval 1000
  multiplier 7</pre>
<p>BFD decide karta hai ki TLOC <b>resolved</b> hai ya nahi. OMP route tabhi usable hai jab uske TLOC tak BFD session up ho. Isliye route received hone par bhi BFD down ho to invalid dikhta hai.</p>

<h3>Dynamic tunnels</h3>
<p>Bahut bade network mein tunnels ka full mesh wasteful hota hai. <b>On-demand tunnels</b> spokes ko doosre spoke tak direct tunnel tabhi banane dete hain jab traffic ko zaroorat ho. Tab tak traffic hub se jaata hai, aur idle timeout ke baad direct tunnel hata diya jaata hai. Isse chhote devices par tunnels aur CPU bachta hai. Aap ise system configuration mein on-demand setting se enable karte ho (Manager ke system template mein ek field).</p>

<h3>Verification</h3>
<pre class="out">E-DEL-1# show sdwan omp summary
oper-state               UP
admin-state              UP
personality              vedge
routes-received          2
routes-installed         2
routes-sent              1
tlocs-received           3
tlocs-installed          3
tlocs-sent               2

E-DEL-1# show sdwan omp routes vpn 10
VPN PREFIX       FROM PEER    ID   LABEL STATUS  TYPE      TLOC IP     COLOR        ENCAP PREFERENCE
10  10.1.10.0/24 0.0.0.0      64   1012  C,Red,R installed 10.255.0.11 biz-internet ipsec -
10  10.2.10.0/24 10.255.255.2 1    1012  C,I,R   installed 10.255.0.12 biz-internet ipsec -
10  10.3.10.0/24 10.255.255.2 1    1012  C,I,R   installed 10.255.0.13 biz-internet ipsec -

E-DEL-1# show sdwan bfd summary
sessions-total                  <span class="hl">3</span>
sessions-up                     <span class="hl">3</span>
sessions-flap                   0

E-DEL-1# show ip route vrf 10 | begin Gateway
C        10.1.10.0/24 is directly connected, GigabitEthernet3
m        10.2.10.0/24 [251/0] via 10.255.0.12, 00:04:10, Sdwan-system-intf
m        10.3.10.0/24 [251/0] via 10.255.0.13, 00:04:10, Sdwan-system-intf</pre>
<p>Status codes padho: <b>C</b> chosen, <b>I</b> installed, <b>R</b> resolved, <b>Red</b> redistributed (hamara apna prefix), <b>Inv,U</b> invalid ya unresolved.</p>

<div class="warn"><p><b>Common mistakes.</b> Ek site par VPN 10 aur doosri par VPN 20 use karke ummeed karna ki woh connect honge; <code>advertise connected</code> bhool jaana (LAN doosri jagah dikhta nahi); OMP ko LAN routing protocol mein redistribute karna bhool jaana; aur har circuit par BFD timers kam kar dena, metered LTE par bhi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Edges Controllers se OMP peer karte hain, ek dusre se kabhi nahi. IOS XE par OMP administrative distance 251 hai. BFD IPsec tunnels ke andar chalta hai, hamesha on hai, aur uske timers per color hote hain.</p></div>

<div class="scn"><h4>Delhi LAN Mumbai ko nahi dikh raha</h4><p>Mumbai ke users E-DEL-1 ke peeche ke router par naye Delhi subnet 10.1.20.0/24 tak nahi pahunch pa rahe the, jo OSPF se seekha gaya tha. E-MUM-1 par <code>show sdwan omp routes vpn 10</code> mein woh prefix nahi tha. E-DEL-1 ki OMP configuration mein <code>advertise connected</code> tha lekin <code>advertise ospf</code> nahi. Jodne ke baad route kuch seconds mein sahi TLOC ke saath aa gaya.</p><p><b>Seekh:</b> OMP sirf wahi sources advertise karta hai jo aap enable karte ho.</p></div>

<div class="iv"><p class="q">"Route OMP table mein hai lekin routing table mein nahi. Kyun?"</p><p>Strong answer: jis TLOC ki taraf woh point karta hai woh unresolved hai. Us TLOC ke liye <code>show sdwan bfd sessions</code> mein session check karo. Route status (Inv,U), use filter karne wali policy, ya VRF mein zyada specific ya kam-AD wala route bhi dekho. Batao ki OMP routes AD 251 aur code m ke saath install hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Service side LAN ki taraf dekhta service VPN (VRF) hai; sites ke beech same VPN number use karo.</li>
<li>OMP sirf edge se Controller tak chalta hai aur routes, TLOCs aur services advertise karta hai; kya advertise karna hai aap chunte ho.</li>
<li>TLOC resolved hone par OMP routes code <code>m</code> aur AD 251 ke saath install hote hain.</li>
<li>BFD har IPsec tunnel mein chalta hai: 1000 ms hello, multiplier 7, per color tune.</li>
<li>On-demand tunnels spoke-to-spoke tunnels sirf zaroorat par banate hain.</li>
</ul></div>
`}};export{e as default};