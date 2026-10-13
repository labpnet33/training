var e={id:`underlay-overlay`,h:{en:`The underlay and the BGP EVPN overlay with a route-reflector spine`,hi:`Underlay aur route-reflector spine ke saath BGP EVPN overlay`},body:{en:`
<p>A fabric is built in two layers, and you must build them in order. First the <b>underlay</b>, so every leaf can reach every other leaf loopback. Then the <b>overlay</b>, the BGP EVPN sessions that run between those loopbacks. This chapter builds both for pod 30 (AS 65030) in the "Build a two-leaf fabric" lab: SPINE1, LEAF1, LEAF2, with hosts PC1 and PC2.</p>

<h3>Step 1: the underlay</h3>
<p>The underlay needs only one thing: IP reachability between loopbacks. In the lab OSPF does it, with point-to-point /31 links and passive loopbacks. The lab starts with this already configured on every device. It looks like this on SPINE1 and LEAF1:</p>
<pre class="code"><span class="c"># SPINE1 (underlay, already in the lab startup)</span>
set routing-options router-id 10.30.255.1
set routing-options autonomous-system 65030
set interfaces lo0 unit 0 family inet address 10.30.255.1/32
set interfaces ge-0/0/0 unit 0 family inet address 10.30.0.0/31
set interfaces ge-0/0/1 unit 0 family inet address 10.30.0.2/31
set protocols ospf area 0 interface ge-0/0/0.0 interface-type p2p
set protocols ospf area 0 interface ge-0/0/1.0 interface-type p2p
set protocols ospf area 0 interface lo0.0 passive

<span class="c"># LEAF1</span>
set interfaces lo0 unit 0 family inet address 10.30.255.11/32
set interfaces ge-0/0/0 unit 0 family inet address 10.30.0.1/31
set protocols ospf area 0 interface ge-0/0/0.0 interface-type p2p
set protocols ospf area 0 interface lo0.0 passive</pre>
<p>Always prove the underlay before touching the overlay. The important test is a ping <b>between loopbacks, sourced from your own loopback</b>, because that is exactly the traffic the tunnel and the BGP session will use:</p>
<pre class="out">lab@LEAF1&gt; ping 10.30.255.12 source 10.30.255.11 count 2
PING 10.30.255.12 (10.30.255.12): 56 data bytes
64 bytes from 10.30.255.12: icmp_seq=0 ttl=63 time=2.300 ms
64 bytes from 10.30.255.12: icmp_seq=1 ttl=63 time=2.600 ms
--- 10.30.255.12 ping statistics ---
<span class="hl">2 packets transmitted, 2 packets received, 0% packet loss</span></pre>
<p>On real hardware also raise the MTU on every fabric link (for example 9192), because VXLAN adds about 50 bytes. The simulator does not model MTU, so the lab has no MTU commands.</p>

<h3>Underlay design choices</h3>
<table class="cmp"><tr><th>Design</th><th>Underlay</th><th>Overlay</th><th>Note</th></tr>
<tr><td>IBGP overlay (this lab)</td><td>OSPF or IS-IS</td><td>IBGP, spine is route reflector</td><td>Spine needs only a loopback and the RR role</td></tr>
<tr><td>EBGP overlay</td><td>EBGP on fabric links</td><td>EBGP between loopbacks (multihop)</td><td>Each leaf has its own AS; no route reflector needed</td></tr></table>
<p>Both are valid and both appear in Juniper design guides. The labs use IBGP because it makes the route-reflector role easy to see.</p>

<h3>Step 2: the overlay sessions</h3>
<p>BGP EVPN sessions run between loopbacks, not between fabric link addresses. The spine is a <b>route reflector (RR)</b>: without it every leaf would need a session to every other leaf. The leaves are RR clients. A route reflector keeps the next hop, which is why the spine never has to be a VTEP.</p>
<pre class="code"><span class="c"># SPINE1: route reflector for the two leaves</span>
set protocols bgp group OVERLAY type internal
set protocols bgp group OVERLAY local-address 10.30.255.1
set protocols bgp group OVERLAY family evpn signaling
set protocols bgp group OVERLAY cluster 10.30.255.1
set protocols bgp group OVERLAY neighbor 10.30.255.11
set protocols bgp group OVERLAY neighbor 10.30.255.12

<span class="c"># LEAF1 (LEAF2 uses local-address 10.30.255.12)</span>
set protocols bgp group OVERLAY type internal
set protocols bgp group OVERLAY local-address 10.30.255.11
set protocols bgp group OVERLAY family evpn signaling
set protocols bgp group OVERLAY neighbor 10.30.255.1</pre>
<p>The three lines that make this an EVPN session are <code>type internal</code>, <code>local-address</code> (a loopback) and <code>family evpn signaling</code>. A missing <code>family evpn signaling</code> on either side leaves the session Established but with no EVPN routes. The <code>cluster</code> statement turns the spine into a reflector. Verify:</p>
<pre class="out">lab@SPINE1&gt; show bgp summary
Groups: 1 Peers: 2 Down peers: 0
Table          Tot Paths  Act Paths Suppressed    History Damp State    Pending
bgp.evpn.0
                       0          0          0          0          0          0
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
10.30.255.11          65030          2          2       0       0        0:15 <span class="hl">Establ</span>
  bgp.evpn.0: 0/0/0/0
10.30.255.12          65030          2          2       0       0        0:15 Establ
  bgp.evpn.0: 0/0/0/0</pre>
<p>(inet.0 lines trimmed.) Both sessions are Established and the table <code>bgp.evpn.0</code> exists, but it is empty: 0 routes. That is correct at this point, because no leaf has an EVPN instance yet. The next chapter adds it. You can also check that EVPN was negotiated on one session:</p>
<pre class="out">lab@LEAF1&gt; show bgp neighbor 10.30.255.1
Peer: 10.30.255.1+179 AS 65030 Local: 10.30.255.11+13023 AS 65030
  Group: OVERLAY      Routing-Instance: master
  Type: Internal    State: Established    Flags: &lt;Sync&gt;
  ...
  <span class="hl">NLRI for this session: evpn</span>
  Peer supports Refresh capability (2)
  Table bgp.evpn.0 Bit: 30000</pre>

<div class="eg"><p><b>Worked example.</b> A fabric has 2 spines and 20 leaves. Full-mesh IBGP between leaves would need 190 sessions. With the two spines as route reflectors each leaf needs only 2 sessions, 40 in total plus one session between spines, and adding a leaf means configuring only that leaf and its two reflectors. The leaf announces its routes to both RRs, so losing a spine does not interrupt the overlay.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Sourcing the session from a fabric link address instead of lo0. (2) Forgetting <code>family evpn signaling</code> on one side. (3) Building the overlay before the underlay works: an Idle or Active session usually means the loopbacks cannot reach each other. (4) Forgetting <code>cluster</code> on the reflector, so routes are not reflected between the two clients.</p></div>
<div class="exam"><p><b>Exam trap.</b> The EVPN address family in Junos is <code>family evpn signaling</code>, not <code>family inet</code>. The EVPN routes live in the table <code>bgp.evpn.0</code>. A route reflector does not change the next hop of the routes it reflects.</p></div>

<div class="scn"><h4>The session that was up but empty</h4><p>A new leaf joined a Kochi fabric. <code>show bgp summary</code> showed Establ for its session to the spine, so the engineer declared the overlay ready. But the other leaves saw none of its MACs. <code>show bgp neighbor</code> on the new leaf showed the NLRI list without <code>evpn</code>. The group on the leaf had been copied from an IPv4 template and lacked <code>family evpn signaling</code>. One line fixed it and the type-3 routes appeared at once.</p><p><b>Lesson:</b> Establ only means BGP is up. Check the negotiated NLRI and the <code>bgp.evpn.0</code> counters.</p></div>

<div class="iv"><p class="q">"Why is the spine a route reflector in an EVPN fabric?"</p><p>With IBGP, a router does not re-advertise IBGP-learned routes to other IBGP peers, so leaves would need a full mesh. A route reflector reflects routes between its clients and keeps the next hop, so the sessions scale linearly and the spine never becomes a VTEP. I use a cluster ID, run EVPN signaling on the loopbacks, and use two spines for redundancy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build the underlay first and prove loopback-to-loopback ping with a source address.</li>
<li>The overlay is IBGP (or EBGP) between loopbacks with <code>family evpn signaling</code>.</li>
<li>The spine is a route reflector and keeps next hops; it needs no VLANs or VNIs.</li>
<li>Establ is not enough: check NLRI evpn and <code>bgp.evpn.0</code> counters.</li>
<li>Raise the fabric MTU on real devices for the 50-byte VXLAN overhead.</li>
</ul></div>
`,hi:`
<p>Fabric do layers mein banta hai, aur aapko unhe order mein banana hai. Pehle <b>underlay</b>, taaki har leaf har doosre leaf ke loopback tak pahunch sake. Phir <b>overlay</b>, yaani un loopbacks ke beech chalne wale BGP EVPN sessions. Yeh chapter "Do-leaf fabric banao" lab ke pod 30 (AS 65030) ke liye dono banata hai: SPINE1, LEAF1, LEAF2, aur hosts PC1 aur PC2.</p>

<h3>Step 1: underlay</h3>
<p>Underlay ko sirf ek cheez chahiye: loopbacks ke beech IP reachability. Lab mein yeh OSPF karta hai, point-to-point /31 links aur passive loopbacks ke saath. Lab har device par yeh pehle se configured shuru hota hai. SPINE1 aur LEAF1 par yeh aisa dikhta hai:</p>
<pre class="code"><span class="c"># SPINE1 (underlay, lab startup mein pehle se)</span>
set routing-options router-id 10.30.255.1
set routing-options autonomous-system 65030
set interfaces lo0 unit 0 family inet address 10.30.255.1/32
set interfaces ge-0/0/0 unit 0 family inet address 10.30.0.0/31
set interfaces ge-0/0/1 unit 0 family inet address 10.30.0.2/31
set protocols ospf area 0 interface ge-0/0/0.0 interface-type p2p
set protocols ospf area 0 interface ge-0/0/1.0 interface-type p2p
set protocols ospf area 0 interface lo0.0 passive

<span class="c"># LEAF1</span>
set interfaces lo0 unit 0 family inet address 10.30.255.11/32
set interfaces ge-0/0/0 unit 0 family inet address 10.30.0.1/31
set protocols ospf area 0 interface ge-0/0/0.0 interface-type p2p
set protocols ospf area 0 interface lo0.0 passive</pre>
<p>Overlay ko chhune se pehle underlay hamesha saabit karo. Zaroori test <b>loopbacks ke beech aise ping hai jo apne loopback se source ho</b>, kyunki tunnel aur BGP session yahi traffic use karenge:</p>
<pre class="out">lab@LEAF1&gt; ping 10.30.255.12 source 10.30.255.11 count 2
PING 10.30.255.12 (10.30.255.12): 56 data bytes
64 bytes from 10.30.255.12: icmp_seq=0 ttl=63 time=2.300 ms
64 bytes from 10.30.255.12: icmp_seq=1 ttl=63 time=2.600 ms
--- 10.30.255.12 ping statistics ---
<span class="hl">2 packets transmitted, 2 packets received, 0% packet loss</span></pre>
<p>Asli hardware par har fabric link par MTU bhi badhao (jaise 9192), kyunki VXLAN lagbhag 50 bytes jodta hai. Simulator MTU model nahi karta, isliye lab mein MTU commands nahi hain.</p>

<h3>Underlay design ke choices</h3>
<table class="cmp"><tr><th>Design</th><th>Underlay</th><th>Overlay</th><th>Note</th></tr>
<tr><td>IBGP overlay (is lab mein)</td><td>OSPF ya IS-IS</td><td>IBGP, spine route reflector</td><td>Spine ko sirf loopback aur RR role chahiye</td></tr>
<tr><td>EBGP overlay</td><td>Fabric links par EBGP</td><td>Loopbacks ke beech EBGP (multihop)</td><td>Har leaf ka apna AS; route reflector nahi chahiye</td></tr></table>
<p>Dono valid hain aur Juniper design guides mein dono aate hain. Labs IBGP use karte hain kyunki isse route-reflector role aasani se dikhta hai.</p>

<h3>Step 2: overlay sessions</h3>
<p>BGP EVPN sessions loopbacks ke beech chalte hain, fabric link addresses ke beech nahi. Spine <b>route reflector (RR)</b> hai: iske bina har leaf ko har doosre leaf se session chahiye hota. Leaves RR clients hain. Route reflector next hop rakhta hai, isliye spine ko VTEP banne ki zaroorat nahi.</p>
<pre class="code"><span class="c"># SPINE1: dono leaves ke liye route reflector</span>
set protocols bgp group OVERLAY type internal
set protocols bgp group OVERLAY local-address 10.30.255.1
set protocols bgp group OVERLAY family evpn signaling
set protocols bgp group OVERLAY cluster 10.30.255.1
set protocols bgp group OVERLAY neighbor 10.30.255.11
set protocols bgp group OVERLAY neighbor 10.30.255.12

<span class="c"># LEAF1 (LEAF2 local-address 10.30.255.12 use karta hai)</span>
set protocols bgp group OVERLAY type internal
set protocols bgp group OVERLAY local-address 10.30.255.11
set protocols bgp group OVERLAY family evpn signaling
set protocols bgp group OVERLAY neighbor 10.30.255.1</pre>
<p>Jo teen cheezein ise EVPN session banati hain: <code>type internal</code>, <code>local-address</code> (loopback) aur <code>family evpn signaling</code>. Kisi bhi side <code>family evpn signaling</code> na ho to session Established rehta hai lekin EVPN routes nahi aate. <code>cluster</code> statement spine ko reflector banata hai. Verify karo:</p>
<pre class="out">lab@SPINE1&gt; show bgp summary
Groups: 1 Peers: 2 Down peers: 0
Table          Tot Paths  Act Paths Suppressed    History Damp State    Pending
bgp.evpn.0
                       0          0          0          0          0          0
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
10.30.255.11          65030          2          2       0       0        0:15 <span class="hl">Establ</span>
  bgp.evpn.0: 0/0/0/0
10.30.255.12          65030          2          2       0       0        0:15 Establ
  bgp.evpn.0: 0/0/0/0</pre>
<p>(inet.0 lines trim ki gayi.) Dono sessions Established hain aur table <code>bgp.evpn.0</code> maujood hai, lekin khaali hai: 0 routes. Is point par yeh sahi hai, kyunki kisi leaf par abhi EVPN instance nahi hai. Agla chapter use jodta hai. Aap yeh bhi dekh sakte ho ki ek session par EVPN negotiate hua:</p>
<pre class="out">lab@LEAF1&gt; show bgp neighbor 10.30.255.1
Peer: 10.30.255.1+179 AS 65030 Local: 10.30.255.11+13023 AS 65030
  Group: OVERLAY      Routing-Instance: master
  Type: Internal    State: Established    Flags: &lt;Sync&gt;
  ...
  <span class="hl">NLRI for this session: evpn</span>
  Peer supports Refresh capability (2)
  Table bgp.evpn.0 Bit: 30000</pre>

<div class="eg"><p><b>Worked example.</b> Ek fabric mein 2 spines aur 20 leaves hain. Leaves ke beech full-mesh IBGP ko 190 sessions chahiye. Dono spines route reflector hon to har leaf ko sirf 2 sessions chahiye, kul 40 aur spines ke beech ek session, aur naya leaf jodne ka matlab sirf us leaf aur uske do reflectors ko configure karna. Leaf apne routes dono RRs ko announce karta hai, isliye ek spine khone se overlay nahi rukta.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Session ko lo0 ki jagah fabric link address se source karna. (2) Ek side <code>family evpn signaling</code> bhool jaana. (3) Underlay chalne se pehle overlay banana: Idle ya Active session ka matlab aksar yahi hota hai ki loopbacks ek doosre tak nahi pahunchte. (4) Reflector par <code>cluster</code> bhool jaana, jisse do clients ke beech routes reflect nahi hote.</p></div>
<div class="exam"><p><b>Exam trap.</b> Junos mein EVPN address family <code>family evpn signaling</code> hai, <code>family inet</code> nahi. EVPN routes table <code>bgp.evpn.0</code> mein rehte hain. Route reflector jin routes ko reflect karta hai unka next hop nahi badalta.</p></div>

<div class="scn"><h4>Session up tha lekin khaali</h4><p>Kochi fabric mein naya leaf juda. <code>show bgp summary</code> ne spine ke saath uska session Establ dikhaya, to engineer ne overlay ready maan liya. Lekin baaki leaves ko uske koi MACs nahi dikhe. Naye leaf par <code>show bgp neighbor</code> ne NLRI list mein <code>evpn</code> nahi dikhaya. Leaf ka group IPv4 template se copy hua tha aur usme <code>family evpn signaling</code> nahi tha. Ek line se fix hua aur type-3 routes turant dikhne lage.</p><p><b>Lesson:</b> Establ ka matlab sirf BGP up hai. Negotiated NLRI aur <code>bgp.evpn.0</code> counters check karo.</p></div>

<div class="iv"><p class="q">"EVPN fabric mein spine route reflector kyun hota hai?"</p><p>IBGP mein router IBGP se seekhe routes ko doosre IBGP peers ko re-advertise nahi karta, isliye leaves ko full mesh chahiye hota. Route reflector clients ke beech routes reflect karta hai aur next hop rakhta hai, to sessions linear scale karte hain aur spine kabhi VTEP nahi banta. Main cluster ID use karta hoon, loopbacks par EVPN signaling chalata hoon, aur redundancy ke liye do spines rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay pehle banao aur source address ke saath loopback-to-loopback ping saabit karo.</li>
<li>Overlay loopbacks ke beech IBGP (ya EBGP) hai, <code>family evpn signaling</code> ke saath.</li>
<li>Spine route reflector hai aur next hops rakhta hai; use VLANs ya VNIs nahi chahiye.</li>
<li>Establ kaafi nahi: NLRI evpn aur <code>bgp.evpn.0</code> counters check karo.</li>
<li>Asli devices par 50-byte VXLAN overhead ke liye fabric MTU badhao.</li>
</ul></div>
`}};export{e as default};