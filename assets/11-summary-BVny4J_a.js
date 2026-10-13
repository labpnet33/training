var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You have built the road network that every VXLAN and EVPN feature will drive on. Before moving to the overlay, use this chapter as a pre-flight checklist: a pilot does not take off because the plane "looks fine"; they tick every item. If you can do everything below without notes, you are ready for the labs, the exam questions and the interview.</p>

<h3>The underlay on one page</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Underlay summary">
<rect x="20" y="15" width="190" height="90" rx="8" fill="#bae6fd"/><text x="115" y="40" text-anchor="middle" class="svg-ink" font-size="13">Addressing</text><text x="115" y="62" text-anchor="middle" class="svg-muted" font-size="12">lo0 router-ID, lo1 VTEP</text><text x="115" y="82" text-anchor="middle" class="svg-muted" font-size="12">/31 links, MTU 9216</text>
<rect x="225" y="15" width="190" height="90" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Routing</text><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">OSPF p2p area 0</text><text x="320" y="82" text-anchor="middle" class="svg-muted" font-size="12">or IS-IS L2, or eBGP</text>
<rect x="430" y="15" width="190" height="90" rx="8" fill="#bbf7d0"/><text x="525" y="40" text-anchor="middle" class="svg-ink" font-size="13">Paths</text><text x="525" y="62" text-anchor="middle" class="svg-muted" font-size="12">ECMP via every spine</text><text x="525" y="82" text-anchor="middle" class="svg-muted" font-size="12">5-tuple hashing</text>
<rect x="20" y="125" width="190" height="90" rx="8" fill="#fde68a"/><text x="115" y="150" text-anchor="middle" class="svg-ink" font-size="13">Convergence</text><text x="115" y="172" text-anchor="middle" class="svg-muted" font-size="12">BFD 50 ms x 3</text><text x="115" y="192" text-anchor="middle" class="svg-muted" font-size="12">GR for restarts</text>
<rect x="225" y="125" width="190" height="90" rx="8" fill="#fed7aa"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">BUM</text><text x="320" y="172" text-anchor="middle" class="svg-muted" font-size="12">PIM + anycast RP</text><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">or ingress replication</text>
<rect x="430" y="125" width="190" height="90" rx="8" fill="#e2e8f0"/><text x="525" y="150" text-anchor="middle" class="svg-ink" font-size="13">Operations</text><text x="525" y="172" text-anchor="middle" class="svg-muted" font-size="12">Bottom-up workflow</text><text x="525" y="192" text-anchor="middle" class="svg-muted" font-size="12">verify ubest = spines</text>
</svg><p class="cap">Six boxes, one contract: every loopback, over every spine, with big packets and fast failover.</p></div>

<h3>Checklist: you should be able to</h3>
<ul>
<li>Explain the difference between underlay and overlay, and why spines never see tenant addresses.</li>
<li>List the underlay requirements (loopback reachability, ECMP, convergence, MTU, simplicity, scale) and what must stay out of it.</li>
<li>Build an address plan for any number of spines and leaves using /32 loopbacks and /31 links, and explain IP unnumbered.</li>
<li>Configure OSPF on NX-OS from scratch: <code>feature ospf</code>, router-ID, point-to-point interfaces in area 0, loopbacks advertised.</li>
<li>Read <code>show ip ospf neighbors</code> and <code>show ip route</code> and prove ECMP (ubest equals the number of spines).</li>
<li>Explain the cost in [110/81] from the reference bandwidth.</li>
<li>Sketch an IS-IS underlay (NET, level-2, point-to-point) and compare it with OSPF.</li>
<li>Design an eBGP underlay with RFC 7938 ASNs, and know when allowas-in, disable-peer-as-check and multipath-relax are needed.</li>
<li>Explain ECMP hashing, VXLAN source-port entropy, polarisation and flowlets.</li>
<li>Configure BFD for OSPF or BGP and calculate the detection time.</li>
<li>Design a PIM underlay with anycast RP and say when ingress replication is the better choice.</li>
<li>Troubleshoot any of: port down, swapped cable, MTU mismatch, area mismatch, missing loopback, unequal cost.</li>
</ul>

<h3>Reference configuration: one leaf</h3>
<pre class="code">feature ospf
feature bfd
interface loopback0
  ip address 10.255.0.1/32
  ip router ospf UNDERLAY area 0.0.0.0
interface loopback1
  ip address 10.254.0.1/32
  ip router ospf UNDERLAY area 0.0.0.0
interface Ethernet1/1
  description to SPINE1 Eth1/1
  no switchport
  mtu 9216
  no ip redirects
  ip address 10.1.1.1/31
  ip ospf network point-to-point
  ip router ospf UNDERLAY area 0.0.0.0
  no shutdown
<span class="c">! Ethernet1/2 identical with 10.1.2.1/31 to SPINE2</span>
router ospf UNDERLAY
  router-id 10.255.0.1
  bfd
  log-adjacency-changes</pre>
<pre class="out">LEAF1# show ip route 10.254.0.2
10.254.0.2/32, ubest/mbest: 2/0
<span class="hl">    *via 10.1.1.0, Eth1/1, [110/81], 01:02:33, ospf-UNDERLAY, intra
    *via 10.1.2.0, Eth1/2, [110/81], 01:02:33, ospf-UNDERLAY, intra</span></pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Underlay</dt><dd>Routed spine-leaf network carrying loopback reachability.</dd>
<dt>VTEP</dt><dd>VXLAN tunnel end point; its loopback must be in the underlay.</dd>
<dt>/31</dt><dd>Point-to-point subnet with two usable addresses (RFC 3021).</dd>
<dt>Point-to-point network type</dt><dd>OSPF or IS-IS mode with no DR/DIS election.</dd>
<dt>ECMP</dt><dd>Several equal-cost next hops installed and used per flow.</dd>
<dt>Entropy</dt><dd>Variation in the outer UDP source port so VXLAN flows hash onto different paths.</dd>
<dt>Polarisation</dt><dd>Identical hashing at consecutive tiers leaving links idle.</dd>
<dt>BFD</dt><dd>Millisecond hello protocol that tells OSPF, IS-IS or BGP when a path dies.</dd>
<dt>BUM</dt><dd>Broadcast, unknown unicast and multicast traffic.</dd>
<dt>Anycast RP</dt><dd>Same RP address on several spines, synchronised with PIM anycast-RP or MSDP.</dd>
<dt>Ingress replication</dt><dd>Source VTEP sends a unicast copy of BUM traffic to each peer VTEP.</dd>
<dt>NET</dt><dd>IS-IS router address: area, system ID, NSEL 00.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>VXLAN overhead</td><td>50 bytes (IPv4 outer); underlay MTU 9216</td></tr>
<tr><td>VXLAN port</td><td>UDP 4789; entropy in the outer source port</td></tr>
<tr><td>OSPF on NX-OS</td><td>feature ospf; ip router ospf TAG area X on the interface</td></tr>
<tr><td>Point-to-point</td><td>No DR/BDR; neighbour shows FULL/ -</td></tr>
<tr><td>Reference bandwidth</td><td>40 Gbit/s default on NX-OS</td></tr>
<tr><td>Default maximum-paths</td><td>OSPF 8, BGP 1</td></tr>
<tr><td>Admin distances</td><td>eBGP 20, OSPF 110, IS-IS 115, iBGP 200</td></tr>
<tr><td>EXSTART stuck</td><td>MTU mismatch</td></tr>
<tr><td>RFC 7938</td><td>eBGP underlay: spines share an ASN, each leaf unique</td></tr>
<tr><td>Shared leaf ASN</td><td>allowas-in on leaves; disable-peer-as-check on NX-OS spines</td></tr>
<tr><td>BFD</td><td>interval × multiplier; 50 ms × 3 = 150 ms; no ip redirects</td></tr>
<tr><td>BUM options</td><td>PIM-SM with anycast RP, PIM BiDir, or ingress replication</td></tr>
</table>

<div class="warn"><p><b>Common mistakes to avoid in the exam.</b> Confusing ubest (number of equal paths) with the metric. Thinking BGP does ECMP by default. Choosing mtu-ignore as the fix for EXSTART. Mixing up anycast RP (PIM-SM) with phantom RP (BiDir).</p></div>
<div class="exam"><p><b>Exam tip.</b> Many questions show an output and ask for the cause. Read in this order: how many neighbours, which state, which area and network type, how many next hops, what cost. The answer is almost always the first abnormal line.</p></div>

<div class="scn"><h4>The pre-flight check that saved a go-live</h4><p>A bank was due to move production workloads onto a new 4-spine, 24-leaf fabric on Saturday. On Friday the engineer ran a scripted checklist on every leaf: two lines per uplink in <code>show ip ospf neighbors</code>, ubest 4 for every remote VTEP, a 9000-byte df-bit ping between every pair of VTEP loopbacks, and <code>show bfd neighbors</code> Up on every link. Twenty-three leaves passed. LEAF17 showed ubest 3 to every destination: one uplink had been patched into a spine port that was still in the default Layer-2 mode. Fixing it took five minutes on Friday instead of an outage on Monday.</p><p><b>Lesson:</b> verify the underlay contract on every switch before the overlay goes live, ideally with automation.</p></div>

<div class="iv"><p class="q">"Walk me through how you would build and validate a new spine-leaf underlay."</p><p>Strong answer: plan addressing first (lo0, lo1, /31s derived from device numbers, MTU 9216 everywhere). Choose the protocol (OSPF area 0 point-to-point for most enterprises; IS-IS or RFC 7938 eBGP when justified). Add BFD and, if needed, PIM with anycast RP on the spines. Validate on every leaf: neighbours FULL on all uplinks, every loopback present, ubest equal to the spine count, large df-bit pings between VTEPs, BFD up. Only then build the VXLAN EVPN overlay.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The underlay contract: every loopback, via every spine, jumbo MTU, sub-second failover.</li>
<li>OSPF point-to-point in area 0 is the default choice; IS-IS and eBGP are valid alternatives.</li>
<li>ECMP proof is ubest equal to the number of spines; equal costs are mandatory.</li>
<li>BFD handles silent failures; PIM or ingress replication handles BUM.</li>
<li>Troubleshoot bottom-up and verify every switch before building the overlay.</li>
</ul></div>
`,hi:`
<p>Aapne woh road network bana liya hai jis par har VXLAN aur EVPN feature chalega. Overlay par jaane se pehle is chapter ko pre-flight checklist ki tarah use karo: pilot isliye take off nahi karta kyunki plane "theek dikh raha hai"; woh har item tick karta hai. Agar aap neeche ki har cheez bina notes ke kar sakte ho, to aap labs, exam questions aur interview ke liye ready ho.</p>

<h3>Ek page par underlay</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Underlay summary">
<rect x="20" y="15" width="190" height="90" rx="8" fill="#bae6fd"/><text x="115" y="40" text-anchor="middle" class="svg-ink" font-size="13">Addressing</text><text x="115" y="62" text-anchor="middle" class="svg-muted" font-size="12">lo0 router-ID, lo1 VTEP</text><text x="115" y="82" text-anchor="middle" class="svg-muted" font-size="12">/31 links, MTU 9216</text>
<rect x="225" y="15" width="190" height="90" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Routing</text><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">OSPF p2p area 0</text><text x="320" y="82" text-anchor="middle" class="svg-muted" font-size="12">ya IS-IS L2, ya eBGP</text>
<rect x="430" y="15" width="190" height="90" rx="8" fill="#bbf7d0"/><text x="525" y="40" text-anchor="middle" class="svg-ink" font-size="13">Paths</text><text x="525" y="62" text-anchor="middle" class="svg-muted" font-size="12">Har spine ke through ECMP</text><text x="525" y="82" text-anchor="middle" class="svg-muted" font-size="12">5-tuple hashing</text>
<rect x="20" y="125" width="190" height="90" rx="8" fill="#fde68a"/><text x="115" y="150" text-anchor="middle" class="svg-ink" font-size="13">Convergence</text><text x="115" y="172" text-anchor="middle" class="svg-muted" font-size="12">BFD 50 ms x 3</text><text x="115" y="192" text-anchor="middle" class="svg-muted" font-size="12">Restarts ke liye GR</text>
<rect x="225" y="125" width="190" height="90" rx="8" fill="#fed7aa"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">BUM</text><text x="320" y="172" text-anchor="middle" class="svg-muted" font-size="12">PIM + anycast RP</text><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">ya ingress replication</text>
<rect x="430" y="125" width="190" height="90" rx="8" fill="#e2e8f0"/><text x="525" y="150" text-anchor="middle" class="svg-ink" font-size="13">Operations</text><text x="525" y="172" text-anchor="middle" class="svg-muted" font-size="12">Bottom-up workflow</text><text x="525" y="192" text-anchor="middle" class="svg-muted" font-size="12">ubest = spines verify karo</text>
</svg><p class="cap">Chhe boxes, ek contract: har loopback, har spine ke through, bade packets aur fast failover ke saath.</p></div>

<h3>Checklist: aapko yeh kar paana chahiye</h3>
<ul>
<li>Underlay aur overlay ka farak explain karna, aur spines kabhi tenant addresses kyun nahi dekhte.</li>
<li>Underlay requirements list karna (loopback reachability, ECMP, convergence, MTU, simplicity, scale) aur kya bahar rehna chahiye.</li>
<li>Kitne bhi spines aur leaves ke liye /32 loopbacks aur /31 links se address plan banana, aur IP unnumbered explain karna.</li>
<li>NX-OS par OSPF scratch se configure karna: <code>feature ospf</code>, router-ID, area 0 mein point-to-point interfaces, loopbacks advertised.</li>
<li><code>show ip ospf neighbors</code> aur <code>show ip route</code> padhna aur ECMP prove karna (ubest spines ki ginti ke barabar).</li>
<li>[110/81] mein cost ko reference bandwidth se explain karna.</li>
<li>IS-IS underlay sketch karna (NET, level-2, point-to-point) aur OSPF se compare karna.</li>
<li>RFC 7938 ASNs ke saath eBGP underlay design karna, aur jaanna ki allowas-in, disable-peer-as-check aur multipath-relax kab chahiye.</li>
<li>ECMP hashing, VXLAN source-port entropy, polarisation aur flowlets explain karna.</li>
<li>OSPF ya BGP ke liye BFD configure karna aur detection time calculate karna.</li>
<li>Anycast RP ke saath PIM underlay design karna aur batana ki kab ingress replication better choice hai.</li>
<li>Inmein se koi bhi troubleshoot karna: port down, swapped cable, MTU mismatch, area mismatch, missing loopback, unequal cost.</li>
</ul>

<h3>Reference configuration: ek leaf</h3>
<pre class="code">feature ospf
feature bfd
interface loopback0
  ip address 10.255.0.1/32
  ip router ospf UNDERLAY area 0.0.0.0
interface loopback1
  ip address 10.254.0.1/32
  ip router ospf UNDERLAY area 0.0.0.0
interface Ethernet1/1
  description to SPINE1 Eth1/1
  no switchport
  mtu 9216
  no ip redirects
  ip address 10.1.1.1/31
  ip ospf network point-to-point
  ip router ospf UNDERLAY area 0.0.0.0
  no shutdown
<span class="c">! Ethernet1/2 same, SPINE2 ke liye 10.1.2.1/31 ke saath</span>
router ospf UNDERLAY
  router-id 10.255.0.1
  bfd
  log-adjacency-changes</pre>
<pre class="out">LEAF1# show ip route 10.254.0.2
10.254.0.2/32, ubest/mbest: 2/0
<span class="hl">    *via 10.1.1.0, Eth1/1, [110/81], 01:02:33, ospf-UNDERLAY, intra
    *via 10.1.2.0, Eth1/2, [110/81], 01:02:33, ospf-UNDERLAY, intra</span></pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Underlay</dt><dd>Routed spine-leaf network jo loopback reachability le jaata hai.</dd>
<dt>VTEP</dt><dd>VXLAN tunnel end point; iska loopback underlay mein hona chahiye.</dd>
<dt>/31</dt><dd>Do usable addresses wala point-to-point subnet (RFC 3021).</dd>
<dt>Point-to-point network type</dt><dd>OSPF ya IS-IS mode jismein DR/DIS election nahi hota.</dd>
<dt>ECMP</dt><dd>Kai equal-cost next hops installed aur per flow use hote hain.</dd>
<dt>Entropy</dt><dd>Outer UDP source port mein variation taaki VXLAN flows alag paths par hash hon.</dd>
<dt>Polarisation</dt><dd>Consecutive tiers par identical hashing jisse links khaali rehte hain.</dd>
<dt>BFD</dt><dd>Millisecond hello protocol jo OSPF, IS-IS ya BGP ko batata hai jab path mar jaaye.</dd>
<dt>BUM</dt><dd>Broadcast, unknown unicast aur multicast traffic.</dd>
<dt>Anycast RP</dt><dd>Kai spines par same RP address, PIM anycast-RP ya MSDP se synchronised.</dd>
<dt>Ingress replication</dt><dd>Source VTEP BUM traffic ki unicast copy har peer VTEP ko bhejta hai.</dd>
<dt>NET</dt><dd>IS-IS router address: area, system ID, NSEL 00.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>VXLAN overhead</td><td>50 bytes (IPv4 outer); underlay MTU 9216</td></tr>
<tr><td>VXLAN port</td><td>UDP 4789; entropy outer source port mein</td></tr>
<tr><td>NX-OS par OSPF</td><td>feature ospf; interface par ip router ospf TAG area X</td></tr>
<tr><td>Point-to-point</td><td>Koi DR/BDR nahi; neighbour FULL/ - dikhata hai</td></tr>
<tr><td>Reference bandwidth</td><td>NX-OS par default 40 Gbit/s</td></tr>
<tr><td>Default maximum-paths</td><td>OSPF 8, BGP 1</td></tr>
<tr><td>Admin distances</td><td>eBGP 20, OSPF 110, IS-IS 115, iBGP 200</td></tr>
<tr><td>EXSTART par atka</td><td>MTU mismatch</td></tr>
<tr><td>RFC 7938</td><td>eBGP underlay: spines ek ASN share karte hain, har leaf unique</td></tr>
<tr><td>Shared leaf ASN</td><td>Leaves par allowas-in; NX-OS spines par disable-peer-as-check</td></tr>
<tr><td>BFD</td><td>interval × multiplier; 50 ms × 3 = 150 ms; no ip redirects</td></tr>
<tr><td>BUM options</td><td>Anycast RP ke saath PIM-SM, PIM BiDir, ya ingress replication</td></tr>
</table>

<div class="warn"><p><b>Exam mein bachne wali common galtiyan.</b> ubest (equal paths ki ginti) ko metric samajh lena. Sochna ki BGP default mein ECMP karta hai. EXSTART ke fix ke liye mtu-ignore chunna. Anycast RP (PIM-SM) aur phantom RP (BiDir) ko mix karna.</p></div>
<div class="exam"><p><b>Exam tip.</b> Kai questions ek output dikhate hain aur cause poochte hain. Is order mein padho: kitne neighbours, kaunsa state, kaunsa area aur network type, kitne next hops, kya cost. Jawab lagbhag hamesha pehli abnormal line hoti hai.</p></div>

<div class="scn"><h4>Pre-flight check jisne go-live bachaya</h4><p>Ek bank Saturday ko production workloads naye 4-spine, 24-leaf fabric par move karne wala tha. Friday ko engineer ne har leaf par ek scripted checklist chalayi: <code>show ip ospf neighbors</code> mein har uplink ki ek line, har remote VTEP ke liye ubest 4, har VTEP loopback pair ke beech 9000-byte df-bit ping, aur har link par <code>show bfd neighbors</code> Up. Teis leaves pass hue. LEAF17 har destination ke liye ubest 3 dikha raha tha: ek uplink aise spine port mein patch hua tha jo abhi bhi default Layer-2 mode mein tha. Ise theek karne mein Friday ko paanch minute lage, Monday ko outage ki jagah.</p><p><b>Seekh:</b> overlay live hone se pehle har switch par underlay contract verify karo, ideally automation ke saath.</p></div>

<div class="iv"><p class="q">"Mujhe batao ki aap naya spine-leaf underlay kaise banaoge aur validate karoge."</p><p>Strong answer: pehle addressing plan karo (lo0, lo1, device numbers se derive kiye /31s, har jagah MTU 9216). Protocol chuno (zyada tar enterprises ke liye OSPF area 0 point-to-point; justified ho to IS-IS ya RFC 7938 eBGP). BFD jodo aur zaroorat ho to spines par anycast RP ke saath PIM. Har leaf par validate karo: saare uplinks par neighbours FULL, har loopback maujood, ubest spine count ke barabar, VTEPs ke beech bade df-bit pings, BFD up. Sirf tab VXLAN EVPN overlay banao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay contract: har loopback, har spine ke through, jumbo MTU, sub-second failover.</li>
<li>Area 0 mein OSPF point-to-point default choice hai; IS-IS aur eBGP valid alternatives hain.</li>
<li>ECMP ka proof hai ubest spines ki ginti ke barabar; equal costs zaroori hain.</li>
<li>BFD silent failures handle karta hai; PIM ya ingress replication BUM handle karta hai.</li>
<li>Bottom-up troubleshoot karo aur overlay banane se pehle har switch verify karo.</li>
</ul></div>
`}};export{e as default};