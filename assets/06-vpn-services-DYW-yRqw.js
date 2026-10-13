var e={id:`vpn-services`,h:{en:`VPN services: L3VPN with VRFs, and L2VPN at a glance`,hi:`VPN services: VRFs ke saath L3VPN, aur L2VPN ek nazar mein`},body:{en:`
<p>Now we put the pieces together. A <b>VPN service</b> gives a customer a private network across the shared provider core. Two customers may use the same address space and never see each other. The provider offers VPNs at two layers: <b>L3VPN</b> (the provider routes the customer's IP traffic) and <b>L2VPN</b> (the provider carries Ethernet frames and the customer does the routing).</p>

<h3>L3VPN: the four ingredients</h3>
<dl class="terms">
<dt>VRF</dt><dd>Virtual Routing and Forwarding table: a separate routing table on the PE, one per customer. A PE interface to the customer is placed in the VRF.</dd>
<dt>RD (Route Distinguisher)</dt><dd>A 64-bit tag added to a customer prefix so that two customers' 10.1.1.0/24 become different VPNv4 prefixes (for example 65000:1:10.1.1.0/24). It only makes routes <i>unique</i>.</dd>
<dt>RT (Route Target)</dt><dd>A BGP extended community that decides <i>who imports</i> a route. Export RT on one PE, import RT on the other: if they match, the route enters that VRF.</dd>
<dt>MP-BGP VPNv4</dt><dd>BGP address family that carries customer routes, RDs, RTs and the VPN label between PE loopbacks.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="L3VPN control plane and data plane">
<rect x="15" y="85" width="80" height="50" rx="8" fill="#bae6fd"/><text x="55" y="115" text-anchor="middle" class="svg-ink" font-size="13">CE1</text>
<rect x="135" y="70" width="110" height="80" rx="8" fill="#bbf7d0"/><text x="190" y="95" text-anchor="middle" class="svg-ink" font-size="13">PE1</text><text x="190" y="115" text-anchor="middle" class="svg-muted" font-size="11">VRF CUST_A</text><text x="190" y="132" text-anchor="middle" class="svg-muted" font-size="11">RD 65000:1</text>
<rect x="285" y="85" width="70" height="50" rx="8" fill="#fde68a"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="13">P</text>
<rect x="395" y="70" width="110" height="80" rx="8" fill="#bbf7d0"/><text x="450" y="95" text-anchor="middle" class="svg-ink" font-size="13">PE2</text><text x="450" y="115" text-anchor="middle" class="svg-muted" font-size="11">VRF CUST_A</text><text x="450" y="132" text-anchor="middle" class="svg-muted" font-size="11">RD 65000:1</text>
<rect x="545" y="85" width="80" height="50" rx="8" fill="#bae6fd"/><text x="585" y="115" text-anchor="middle" class="svg-ink" font-size="13">CE2</text>
<g stroke="#64748b" stroke-width="2"><line x1="95" y1="110" x2="135" y2="110"/><line x1="245" y1="110" x2="285" y2="110"/><line x1="355" y1="110" x2="395" y2="110"/><line x1="505" y1="110" x2="545" y2="110"/></g>
<path d="M190 70 Q320 20 450 70" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="30" text-anchor="middle" class="svg-accent" font-size="12">MP-BGP VPNv4 between PE loopbacks (RD, RT, VPN label)</text>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">Data plane: [transport label][VPN label][customer IP packet]</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">P router swaps only the transport label and knows no customer route</text>
</svg><p class="cap">The control plane runs between PEs in VPNv4; the data plane carries two labels.</p></div>

<h3>The lab, in real output</h3>
<p>In the spcor-l3vpn lab, VRF <code>CUST_A</code> has RD 65000:1 and route target 65000:1 for import and export. After the lab is built, PE1 shows:</p>
<pre class="out">PE1# show vrf
  Name                             Default RD            Protocols   Interfaces
  CUST_A                           65000:1               ipv4        Gi0/1

PE1# show bgp vpnv4 unicast all
     Network          Next Hop            Metric LocPrf Weight Path
Route Distinguisher: 65000:1 (default for vrf CUST_A)
 *>  172.16.1.0/24    192.168.1.2              0             0 65101 i
 *>i 172.16.2.0/24    <span class="hl">10.0.255.3</span>               0    100      0 65102 i

PE1# show ip route vrf CUST_A
Routing Table: CUST_A
...
B        172.16.1.0 [20/0] via 192.168.1.2, 00:00:35
B        172.16.2.0 [<span class="hl">200/0</span>] via 10.0.255.3, 00:00:35
C        192.168.1.0/24 is directly connected, GigabitEthernet0/1</pre>
<p>Read it: the first route came from the local customer over eBGP (distance 20, via the CE). The second came from PE2 over iBGP (distance 200, next hop PE2's loopback 10.0.255.3). The same table shows the connected PE-CE link: customers live inside the VRF, not in the global table. And on the P router the customer prefix is simply not there:</p>
<pre class="out">P# show ip route 172.16.1.0
% Network not in table</pre>
<p>That is the whole promise of the design: <b>PEs know customers, P routers do not</b>.</p>

<h3>L2VPN at a glance</h3>
<p>In an L2VPN the provider does not look at customer IP at all; it carries Ethernet frames between sites. You will meet three flavours:</p>
<table class="cmp"><tr><th>Service</th><th>Shape</th><th>Mechanism</th></tr>
<tr><td>VPWS / pseudowire (EoMPLS)</td><td>Point-to-point virtual cable</td><td>One LDP-signalled pseudowire between two PEs over an LSP</td></tr>
<tr><td>VPLS</td><td>Multipoint virtual LAN</td><td>Full mesh of pseudowires; PEs learn MACs like a switch</td></tr>
<tr><td>EVPN</td><td>Multipoint or point-to-point, modern</td><td>MAC addresses learned and advertised in BGP; multihoming and ECMP built in</td></tr></table>
<p>The customer sees a transparent Ethernet segment. The provider still uses the same MPLS core; only the PE configuration differs. The spcor-l2vpn module covers it.</p>

<div class="eg"><p><b>Worked example.</b> Two customers both use 10.1.1.0/24. On PE1 the first is in VRF RED (RD 65000:10) and the second in VRF BLUE (RD 65000:20). In VPNv4 they travel as 65000:10:10.1.1.0/24 and 65000:20:10.1.1.0/24, two different routes. Route targets 65000:10 and 65000:20 make RED routes import only into RED and BLUE routes only into BLUE.</p></div>

<div class="warn"><p><b>Common mistake.</b> Confusing RD and RT. RD makes a route unique; RT controls which VRFs accept it. A route can have the right RD and still not arrive in the other VRF because the route targets do not match, or because <code>send-community extended</code> is missing on the VPNv4 neighbour.</p></div>
<div class="exam"><p><b>Exam trap.</b> Applying <code>vrf forwarding</code> to an interface removes its IP address. Re-enter the address afterwards. Also: VPN label is inside, transport label is outside, and P routers see only the outer label.</p></div>

<div class="scn"><h4>The VPN that half works</h4><p>Site A could reach site B but not the other way. The route from A was present in B's VRF, but B's route never reached A: the export route target on PE2 did not match the import route target on PE1. Correcting the target on PE2 fixed both directions.</p><p><b>Lesson:</b> check both directions. Compare export RTs on one PE with import RTs on the other with <code>show vrf detail</code> and <code>show bgp vpnv4 unicast all</code>.</p></div>

<div class="iv"><p class="q">"What is the difference between a route distinguisher and a route target?"</p><p>The RD is prepended to a customer prefix to make VPNv4 prefixes unique, so overlapping address space does not collide. The RT is an extended community that controls import and export between VRFs, so it decides which sites can talk to which. Different jobs; do not use one for the other.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>L3VPN uses VRFs on PEs, MP-BGP VPNv4 between PEs, and MPLS in the core.</li>
<li>RD makes prefixes unique; RT controls import and export.</li>
<li>VPN packets carry a transport label (outer) and a VPN label (inner).</li>
<li>P routers hold no customer routes.</li>
<li>L2VPN carries Ethernet: pseudowire, VPLS or EVPN.</li>
</ul></div>
`,hi:`
<p>Ab hum sab pieces jodte hain. <b>VPN service</b> customer ko shared provider core ke upar private network deti hai. Do customers same address space use kar sakte hain aur kabhi ek doosre ko nahi dekhte. Provider VPNs do layers par deta hai: <b>L3VPN</b> (provider customer ka IP traffic route karta hai) aur <b>L2VPN</b> (provider Ethernet frames le jaata hai aur customer routing karta hai).</p>

<h3>L3VPN: chaar ingredients</h3>
<dl class="terms">
<dt>VRF</dt><dd>Virtual Routing and Forwarding table: PE par alag routing table, har customer ke liye ek. Customer ki taraf ka PE interface VRF mein rakha jaata hai.</dd>
<dt>RD (Route Distinguisher)</dt><dd>Customer prefix mein jodha gaya 64-bit tag taaki do customers ke 10.1.1.0/24 alag VPNv4 prefixes ban jaayein (jaise 65000:1:10.1.1.0/24). Yeh sirf routes ko <i>unique</i> banata hai.</dd>
<dt>RT (Route Target)</dt><dd>BGP extended community jo tay karti hai ki route <i>kaun import karega</i>. Ek PE par export RT, doosre par import RT: match ho to route us VRF mein jaata hai.</dd>
<dt>MP-BGP VPNv4</dt><dd>BGP address family jo PE loopbacks ke beech customer routes, RDs, RTs aur VPN label le jaati hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="L3VPN control plane aur data plane">
<rect x="15" y="85" width="80" height="50" rx="8" fill="#bae6fd"/><text x="55" y="115" text-anchor="middle" class="svg-ink" font-size="13">CE1</text>
<rect x="135" y="70" width="110" height="80" rx="8" fill="#bbf7d0"/><text x="190" y="95" text-anchor="middle" class="svg-ink" font-size="13">PE1</text><text x="190" y="115" text-anchor="middle" class="svg-muted" font-size="11">VRF CUST_A</text><text x="190" y="132" text-anchor="middle" class="svg-muted" font-size="11">RD 65000:1</text>
<rect x="285" y="85" width="70" height="50" rx="8" fill="#fde68a"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="13">P</text>
<rect x="395" y="70" width="110" height="80" rx="8" fill="#bbf7d0"/><text x="450" y="95" text-anchor="middle" class="svg-ink" font-size="13">PE2</text><text x="450" y="115" text-anchor="middle" class="svg-muted" font-size="11">VRF CUST_A</text><text x="450" y="132" text-anchor="middle" class="svg-muted" font-size="11">RD 65000:1</text>
<rect x="545" y="85" width="80" height="50" rx="8" fill="#bae6fd"/><text x="585" y="115" text-anchor="middle" class="svg-ink" font-size="13">CE2</text>
<g stroke="#64748b" stroke-width="2"><line x1="95" y1="110" x2="135" y2="110"/><line x1="245" y1="110" x2="285" y2="110"/><line x1="355" y1="110" x2="395" y2="110"/><line x1="505" y1="110" x2="545" y2="110"/></g>
<path d="M190 70 Q320 20 450 70" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="30" text-anchor="middle" class="svg-accent" font-size="12">PE loopbacks ke beech MP-BGP VPNv4 (RD, RT, VPN label)</text>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">Data plane: [transport label][VPN label][customer IP packet]</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">P router sirf transport label swap karta hai, koi customer route nahi jaanta</text>
</svg><p class="cap">Control plane PEs ke beech VPNv4 mein chalta hai; data plane do labels le jaata hai.</p></div>

<h3>Lab real output mein</h3>
<p>spcor-l3vpn lab mein VRF <code>CUST_A</code> ka RD 65000:1 aur import-export dono ke liye route target 65000:1 hai. Lab banne ke baad PE1 dikhata hai:</p>
<pre class="out">PE1# show vrf
  Name                             Default RD            Protocols   Interfaces
  CUST_A                           65000:1               ipv4        Gi0/1

PE1# show bgp vpnv4 unicast all
     Network          Next Hop            Metric LocPrf Weight Path
Route Distinguisher: 65000:1 (default for vrf CUST_A)
 *>  172.16.1.0/24    192.168.1.2              0             0 65101 i
 *>i 172.16.2.0/24    <span class="hl">10.0.255.3</span>               0    100      0 65102 i

PE1# show ip route vrf CUST_A
Routing Table: CUST_A
...
B        172.16.1.0 [20/0] via 192.168.1.2, 00:00:35
B        172.16.2.0 [<span class="hl">200/0</span>] via 10.0.255.3, 00:00:35
C        192.168.1.0/24 is directly connected, GigabitEthernet0/1</pre>
<p>Padho: pehla route local customer se eBGP par aaya (distance 20, CE ke through). Doosra PE2 se iBGP par aaya (distance 200, next hop PE2 ka loopback 10.0.255.3). Wahi table connected PE-CE link bhi dikhati hai: customers VRF ke andar rehte hain, global table mein nahi. Aur P router par customer prefix hai hi nahi:</p>
<pre class="out">P# show ip route 172.16.1.0
% Network not in table</pre>
<p>Design ka poora wada yahi hai: <b>PEs customers ko jaante hain, P routers nahi</b>.</p>

<h3>L2VPN ek nazar mein</h3>
<p>L2VPN mein provider customer ka IP bilkul nahi dekhta; woh sites ke beech Ethernet frames le jaata hai. Teen flavours milenge:</p>
<table class="cmp"><tr><th>Service</th><th>Shape</th><th>Mechanism</th></tr>
<tr><td>VPWS / pseudowire (EoMPLS)</td><td>Point-to-point virtual cable</td><td>Do PEs ke beech LSP par ek LDP-signalled pseudowire</td></tr>
<tr><td>VPLS</td><td>Multipoint virtual LAN</td><td>Pseudowires ka full mesh; PEs switch ki tarah MACs seekhte hain</td></tr>
<tr><td>EVPN</td><td>Multipoint ya point-to-point, modern</td><td>MAC addresses BGP mein seekhe aur advertise kiye jaate hain; multihoming aur ECMP built-in</td></tr></table>
<p>Customer ko transparent Ethernet segment dikhta hai. Provider wahi MPLS core use karta hai; sirf PE configuration alag hoti hai. spcor-l2vpn module ise cover karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Do customers dono 10.1.1.0/24 use karte hain. PE1 par pehla VRF RED (RD 65000:10) mein aur doosra VRF BLUE (RD 65000:20) mein hai. VPNv4 mein woh 65000:10:10.1.1.0/24 aur 65000:20:10.1.1.0/24 ban jaate hain, do alag routes. Route targets 65000:10 aur 65000:20 RED routes ko sirf RED mein aur BLUE routes ko sirf BLUE mein import karwate hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> RD aur RT ko confuse karna. RD route ko unique banata hai; RT tay karta hai ki kaunse VRFs use accept karenge. Route ka RD sahi ho sakta hai phir bhi doosre VRF mein na pahunche kyunki route targets match nahi karte, ya VPNv4 neighbour par <code>send-community extended</code> missing hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Interface par <code>vrf forwarding</code> lagane se uska IP address hat jaata hai. Baad mein address dobara daalo. Aur: VPN label andar hai, transport label bahar, aur P routers sirf bahar ka label dekhte hain.</p></div>

<div class="scn"><h4>Aadha chalne wala VPN</h4><p>Site A site B tak pahunch sakti thi par ulta nahi. A ka route B ke VRF mein tha, par B ka route A tak kabhi nahi pahuncha: PE2 ka export route target PE1 ke import route target se match nahi karta tha. PE2 par target sahi karne se dono directions theek ho gaye.</p><p><b>Lesson:</b> dono directions check karo. <code>show vrf detail</code> aur <code>show bgp vpnv4 unicast all</code> se ek PE ke export RTs ko doosre ke import RTs se compare karo.</p></div>

<div class="iv"><p class="q">"Route distinguisher aur route target mein kya difference hai?"</p><p>RD customer prefix ke aage jodta hai taaki VPNv4 prefixes unique ho jaayein aur overlapping address space na takraye. RT extended community hai jo VRFs ke beech import aur export control karti hai, yaani tay karti hai ki kaunsi sites aapas mein baat kar sakti hain. Alag kaam hain; ek ki jagah doosra mat use karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>L3VPN PEs par VRFs, PEs ke beech MP-BGP VPNv4 aur core mein MPLS use karta hai.</li>
<li>RD prefixes ko unique banata hai; RT import aur export control karta hai.</li>
<li>VPN packets transport label (bahar) aur VPN label (andar) le jaate hain.</li>
<li>P routers koi customer route nahi rakhte.</li>
<li>L2VPN Ethernet le jaata hai: pseudowire, VPLS ya EVPN.</li>
</ul></div>
`}};export{e as default};