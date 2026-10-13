var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with a phone number that stays the same while you change towers, and you have built the network version of that idea twice: LISP separates identity from location, and VXLAN carries Layer 2 segments across a routed underlay. Use this chapter as the page you read the night before the exam and the morning before an interview.</p>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain the identity/location problem and why it hurts mobility and routing table size.</li>
<li>I can define EID, RLOC, ITR, ETR, xTR, MS, MR, PITR, PETR and PxTR, and place each on a diagram.</li>
<li>I can walk Map-Register, Map-Request, Map-Reply and Negative Map-Reply, including who sends each and on which UDP port.</li>
<li>I can draw the LISP encapsulation and compute its 36-byte overhead.</li>
<li>I can configure a map-server/map-resolver and two xTRs on IOS XE and verify with show lisp site, show ip lisp database and show ip lisp map-cache.</li>
<li>I can describe LISP host mobility with dynamic-EIDs, Map-Notify and SMR.</li>
<li>I can explain VXLAN, draw its header byte by byte, and compute the 50-byte overhead and 1550 MTU.</li>
<li>I can compare flood and learn (multicast or ingress replication) with BGP EVPN and LISP control planes.</li>
<li>I can configure flood-and-learn VXLAN on NX-OS and read show nve peers, show nve vni and the MAC table.</li>
<li>I can explain how SD-Access combines the LISP control plane, VXLAN-GPO data plane and SGT policy.</li>
<li>I can troubleshoot a site that will not register and a VTEP pair that will not learn.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="LISP vs VXLAN at a glance">
<rect x="20" y="16" width="290" height="200" rx="10" fill="#bae6fd"/><text x="165" y="42" text-anchor="middle" class="svg-ink" font-size="14">LISP</text>
<text x="165" y="68" text-anchor="middle" class="svg-muted" font-size="12">Carries IP packets</text>
<text x="165" y="90" text-anchor="middle" class="svg-muted" font-size="12">Data UDP 4341, control 4342</text>
<text x="165" y="112" text-anchor="middle" class="svg-muted" font-size="12">Overhead 36 bytes (IPv4 outer)</text>
<text x="165" y="134" text-anchor="middle" class="svg-muted" font-size="12">24-bit instance ID</text>
<text x="165" y="156" text-anchor="middle" class="svg-muted" font-size="12">Pull: map-server on demand</text>
<text x="165" y="186" text-anchor="middle" class="svg-accent" font-size="12">SD-Access control plane</text>
<rect x="330" y="16" width="290" height="200" rx="10" fill="#bbf7d0"/><text x="475" y="42" text-anchor="middle" class="svg-ink" font-size="14">VXLAN</text>
<text x="475" y="68" text-anchor="middle" class="svg-muted" font-size="12">Carries Ethernet frames</text>
<text x="475" y="90" text-anchor="middle" class="svg-muted" font-size="12">UDP 4789</text>
<text x="475" y="112" text-anchor="middle" class="svg-muted" font-size="12">Overhead 50 bytes (with outer Eth)</text>
<text x="475" y="134" text-anchor="middle" class="svg-muted" font-size="12">24-bit VNI</text>
<text x="475" y="156" text-anchor="middle" class="svg-muted" font-size="12">Flood and learn, EVPN or LISP</text>
<text x="475" y="186" text-anchor="middle" class="svg-accent" font-size="12">SD-Access data plane (GPO)</text>
</svg><p class="cap">The comparison that answers half of the exam questions on objective 2.3.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>EID</dt><dd>Endpoint Identifier, the host address inside a LISP site.</dd>
<dt>RLOC</dt><dd>Routing Locator, the underlay address of the site's LISP router.</dd>
<dt>ITR / ETR / xTR</dt><dd>Encapsulating router / decapsulating and registering router / both.</dd>
<dt>MS / MR</dt><dd>Map-server stores registrations; map-resolver answers Map-Requests.</dd>
<dt>PITR / PETR</dt><dd>Proxies between LISP and non-LISP networks, inbound and outbound.</dd>
<dt>Map-cache</dt><dd>ITR's learned EID-to-RLOC entries, 24-hour TTL by default.</dd>
<dt>SMR</dt><dd>Solicit-Map-Request, tells an ITR its cache is stale.</dd>
<dt>VTEP / NVE</dt><dd>VXLAN tunnel endpoint / its logical interface nve1.</dd>
<dt>VNI</dt><dd>24-bit VXLAN segment ID, about 16 million values.</dd>
<dt>BUM</dt><dd>Broadcast, unknown unicast and multicast traffic.</dd>
<dt>VXLAN-GPO</dt><dd>VXLAN with a 16-bit Group Policy ID, used for SGTs in SD-Access.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>LISP control port / data port</td><td>UDP 4342 / UDP 4341</td></tr>
<tr><td>VXLAN port</td><td>UDP 4789</td></tr>
<tr><td>LISP overhead (IPv4 / IPv6 outer)</td><td>36 / 56 bytes</td></tr>
<tr><td>VXLAN overhead</td><td>50 bytes (14 + 20 + 8 + 8)</td></tr>
<tr><td>VNI and instance ID length</td><td>24 bits each</td></tr>
<tr><td>Map-Register interval / expiry</td><td>60 seconds / about 3 minutes</td></tr>
<tr><td>Positive / negative map-cache TTL</td><td>24 hours / typically 15 minutes</td></tr>
<tr><td>Priority / weight</td><td>Lower priority wins, 255 = unusable; weight shares load</td></tr>
<tr><td>SD-Access roles</td><td>CP node = MS/MR, edge = xTR, border = PxTR</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! LISP map-server / map-resolver</span>
router lisp
 site SITE-A
  authentication-key NK-LISP
  eid-prefix 10.1.1.0/24
 service ipv4
  map-server
  map-resolver
<span class="c">! LISP xTR</span>
router lisp
 service ipv4
  itr map-resolver 100.64.3.2
  itr
  etr map-server 100.64.3.2 key NK-LISP
  etr
  database-mapping 10.1.1.0/24 100.64.1.2 priority 1 weight 100
<span class="c">! VXLAN flood and learn (NX-OS)</span>
feature nv overlay
feature vn-segment-vlan-based
vlan 10
 vn-segment 10010
interface nve1
 source-interface loopback0
 member vni 10010 ingress-replication 2.2.2.2
 no shutdown
<span class="c">! verification</span>
show lisp site | show ip lisp | show ip lisp database | show ip lisp map-cache
show nve peers | show nve vni | show mac address-table</pre>

<div class="eg"><p><b>Worked example: a two-minute exam drill.</b> "An ITR receives a packet for an EID not in its cache. Which message, to which device, on which port?" Map-Request, to the map-resolver, UDP 4342. "A 1500-byte host MTU over VXLAN needs what underlay MTU?" 1550. "Which SD-Access node runs the LISP map-server?" The control plane node.</p></div>

<div class="warn"><p><b>Common mistake.</b> Memorising ports without the direction: remember "4342 is talk, 4341 is data" for LISP and "VXLAN is 4789". Mixing 4341 and 4789 is the most frequent wrong answer in practice tests.</p></div>

<div class="exam"><p><b>Exam trap.</b> The blueprint verb is "describe". Expect scenario wording such as "which component answers" or "which header carries the group tag", not configuration typing. Know the roles, messages, ports, sizes and the SD-Access mapping cold.</p></div>

<div class="scn"><h4>The interview that turned on one diagram</h4><p>A candidate for a campus network role was asked to "explain SD-Access on the whiteboard". She drew an edge, a control plane node and a border, labelled them xTR, MS/MR and PxTR, then drew a VXLAN-GPO header with the VNI and the SGT field, and walked one packet from registration to egress enforcement. The panel skipped their remaining SD-Access questions.</p><p><b>Lesson:</b> one clear packet walk proves more understanding than a list of acronyms. Practise drawing it.</p></div>

<div class="iv"><p class="q">"Summarise LISP and VXLAN and how they differ, in under a minute."</p><p>Strong answer: LISP separates identity (EID) from location (RLOC); ETRs register with a map-server, ITRs query a map-resolver on demand and encapsulate IP in UDP 4341 with 36 bytes of overhead. VXLAN encapsulates Ethernet frames in UDP 4789 between VTEPs with a 24-bit VNI and 50 bytes of overhead, learning by flooding or through BGP EVPN or LISP. SD-Access uses LISP for control, VXLAN-GPO for data and SGTs for policy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LISP = identity/location split with an on-demand mapping system; ports 4342 and 4341; 36 bytes.</li>
<li>VXLAN = Layer 2 over Layer 3 with a 24-bit VNI; UDP 4789; 50 bytes; 1550 MTU minimum.</li>
<li>Flood and learn vs BGP EVPN (push) vs LISP (pull).</li>
<li>SD-Access: CP node = MS/MR, edge = xTR, border = PxTR, VXLAN-GPO carries the SGT.</li>
<li>Troubleshoot underlay first, then registration or peers, then learning, then MTU.</li>
</ul></div>
`,hi:`
<p>Aapne ek phone number se shuru kiya jo tower badalne par bhi wahi rehta hai, aur us idea ka network version do baar banaya: LISP identity ko location se alag karta hai, aur VXLAN Layer 2 segments ko routed underlay ke paar le jaata hai. Is chapter ko exam se pehle ki raat aur interview se pehle ki subah padhne wala page samjho.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Main identity/location problem samjha sakta hoon aur yeh mobility aur routing table size ko kyun nuksaan deta hai.</li>
<li>Main EID, RLOC, ITR, ETR, xTR, MS, MR, PITR, PETR aur PxTR define kar sakta hoon, aur har ek ko diagram par rakh sakta hoon.</li>
<li>Main Map-Register, Map-Request, Map-Reply aur Negative Map-Reply walk kar sakta hoon, kaun bhejta hai aur kis UDP port par, sab ke saath.</li>
<li>Main LISP encapsulation bana sakta hoon aur uska 36-byte overhead nikaal sakta hoon.</li>
<li>Main IOS XE par map-server/map-resolver aur do xTRs configure kar sakta hoon aur show lisp site, show ip lisp database aur show ip lisp map-cache se verify kar sakta hoon.</li>
<li>Main dynamic-EIDs, Map-Notify aur SMR ke saath LISP host mobility describe kar sakta hoon.</li>
<li>Main VXLAN samjha sakta hoon, uska header byte by byte bana sakta hoon, aur 50-byte overhead aur 1550 MTU nikaal sakta hoon.</li>
<li>Main flood and learn (multicast ya ingress replication) ko BGP EVPN aur LISP control planes se compare kar sakta hoon.</li>
<li>Main NX-OS par flood-and-learn VXLAN configure kar sakta hoon aur show nve peers, show nve vni aur MAC table padh sakta hoon.</li>
<li>Main samjha sakta hoon ki SD-Access LISP control plane, VXLAN-GPO data plane aur SGT policy ko kaise jodta hai.</li>
<li>Main register na hone wali site aur na seekhne wale VTEP pair ko troubleshoot kar sakta hoon.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="LISP vs VXLAN ek nazar mein">
<rect x="20" y="16" width="290" height="200" rx="10" fill="#bae6fd"/><text x="165" y="42" text-anchor="middle" class="svg-ink" font-size="14">LISP</text>
<text x="165" y="68" text-anchor="middle" class="svg-muted" font-size="12">IP packets le jaata hai</text>
<text x="165" y="90" text-anchor="middle" class="svg-muted" font-size="12">Data UDP 4341, control 4342</text>
<text x="165" y="112" text-anchor="middle" class="svg-muted" font-size="12">Overhead 36 bytes (IPv4 outer)</text>
<text x="165" y="134" text-anchor="middle" class="svg-muted" font-size="12">24-bit instance ID</text>
<text x="165" y="156" text-anchor="middle" class="svg-muted" font-size="12">Pull: zaroorat par map-server</text>
<text x="165" y="186" text-anchor="middle" class="svg-accent" font-size="12">SD-Access control plane</text>
<rect x="330" y="16" width="290" height="200" rx="10" fill="#bbf7d0"/><text x="475" y="42" text-anchor="middle" class="svg-ink" font-size="14">VXLAN</text>
<text x="475" y="68" text-anchor="middle" class="svg-muted" font-size="12">Ethernet frames le jaata hai</text>
<text x="475" y="90" text-anchor="middle" class="svg-muted" font-size="12">UDP 4789</text>
<text x="475" y="112" text-anchor="middle" class="svg-muted" font-size="12">Overhead 50 bytes (outer Eth ke saath)</text>
<text x="475" y="134" text-anchor="middle" class="svg-muted" font-size="12">24-bit VNI</text>
<text x="475" y="156" text-anchor="middle" class="svg-muted" font-size="12">Flood and learn, EVPN ya LISP</text>
<text x="475" y="186" text-anchor="middle" class="svg-accent" font-size="12">SD-Access data plane (GPO)</text>
</svg><p class="cap">Woh comparison jo objective 2.3 ke aadhe exam questions ka jawab hai.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>EID</dt><dd>Endpoint Identifier, LISP site ke andar host ka address.</dd>
<dt>RLOC</dt><dd>Routing Locator, site ke LISP router ka underlay address.</dd>
<dt>ITR / ETR / xTR</dt><dd>Encapsulate karne wala router / decapsulate aur register karne wala router / dono.</dd>
<dt>MS / MR</dt><dd>Map-server registrations store karta hai; map-resolver Map-Requests ka jawab deta hai.</dd>
<dt>PITR / PETR</dt><dd>LISP aur non-LISP networks ke beech proxies, inbound aur outbound.</dd>
<dt>Map-cache</dt><dd>ITR ki seekhi EID-se-RLOC entries, default mein 24-ghante TTL.</dd>
<dt>SMR</dt><dd>Solicit-Map-Request, ITR ko batata hai ki uska cache purana hai.</dd>
<dt>VTEP / NVE</dt><dd>VXLAN tunnel endpoint / uska logical interface nve1.</dd>
<dt>VNI</dt><dd>24-bit VXLAN segment ID, lagbhag 16 million values.</dd>
<dt>BUM</dt><dd>Broadcast, unknown unicast aur multicast traffic.</dd>
<dt>VXLAN-GPO</dt><dd>16-bit Group Policy ID wala VXLAN, SD-Access mein SGTs ke liye use hota hai.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>LISP control port / data port</td><td>UDP 4342 / UDP 4341</td></tr>
<tr><td>VXLAN port</td><td>UDP 4789</td></tr>
<tr><td>LISP overhead (IPv4 / IPv6 outer)</td><td>36 / 56 bytes</td></tr>
<tr><td>VXLAN overhead</td><td>50 bytes (14 + 20 + 8 + 8)</td></tr>
<tr><td>VNI aur instance ID length</td><td>dono 24 bits</td></tr>
<tr><td>Map-Register interval / expiry</td><td>60 second / lagbhag 3 minute</td></tr>
<tr><td>Positive / negative map-cache TTL</td><td>24 ghante / aam taur par 15 minute</td></tr>
<tr><td>Priority / weight</td><td>Kam priority jeetti hai, 255 = unusable; weight load baant-ta hai</td></tr>
<tr><td>SD-Access roles</td><td>CP node = MS/MR, edge = xTR, border = PxTR</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! LISP map-server / map-resolver</span>
router lisp
 site SITE-A
  authentication-key NK-LISP
  eid-prefix 10.1.1.0/24
 service ipv4
  map-server
  map-resolver
<span class="c">! LISP xTR</span>
router lisp
 service ipv4
  itr map-resolver 100.64.3.2
  itr
  etr map-server 100.64.3.2 key NK-LISP
  etr
  database-mapping 10.1.1.0/24 100.64.1.2 priority 1 weight 100
<span class="c">! VXLAN flood and learn (NX-OS)</span>
feature nv overlay
feature vn-segment-vlan-based
vlan 10
 vn-segment 10010
interface nve1
 source-interface loopback0
 member vni 10010 ingress-replication 2.2.2.2
 no shutdown
<span class="c">! verification</span>
show lisp site | show ip lisp | show ip lisp database | show ip lisp map-cache
show nve peers | show nve vni | show mac address-table</pre>

<div class="eg"><p><b>Worked example: do-minute exam drill.</b> "ITR ko aise EID ka packet milta hai jo cache mein nahi hai. Kaunsa message, kis device ko, kis port par?" Map-Request, map-resolver ko, UDP 4342. "VXLAN par 1500-byte host MTU ke liye kitna underlay MTU chahiye?" 1550. "Kaunsa SD-Access node LISP map-server chalata hai?" Control plane node.</p></div>

<div class="warn"><p><b>Common galti.</b> Direction ke bina ports ratna: LISP ke liye yaad rakho "4342 baat hai, 4341 data hai" aur "VXLAN 4789 hai". 4341 aur 4789 ko milana practice tests mein sabse aam galat jawab hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Blueprint ka verb "describe" hai. "Kaunsa component jawab deta hai" ya "kaunsa header group tag le jaata hai" jaisi scenario wording ki umeed karo, configuration typing ki nahi. Roles, messages, ports, sizes aur SD-Access mapping pakke se yaad rakho.</p></div>

<div class="scn"><h4>Woh interview jo ek diagram par palat gaya</h4><p>Campus network role ki ek candidate se kaha gaya "whiteboard par SD-Access samjhao". Usne ek edge, ek control plane node aur ek border banaya, unhe xTR, MS/MR aur PxTR label kiya, phir VNI aur SGT field ke saath VXLAN-GPO header banaya, aur ek packet ko registration se egress enforcement tak walk kiya. Panel ne apne baaki SD-Access questions chhod diye.</p><p><b>Seekh:</b> ek saaf packet walk acronyms ki list se zyada samajh sabit karta hai. Ise banane ki practice karo.</p></div>

<div class="iv"><p class="q">"Ek minute se kam mein LISP aur VXLAN summarise karo aur fark batao."</p><p>Strong answer: LISP identity (EID) ko location (RLOC) se alag karta hai; ETRs map-server par register karte hain, ITRs zaroorat par map-resolver se poochte hain aur IP ko UDP 4341 mein 36 bytes overhead ke saath encapsulate karte hain. VXLAN VTEPs ke beech Ethernet frames ko UDP 4789 mein 24-bit VNI aur 50 bytes overhead ke saath encapsulate karta hai, flooding se ya BGP EVPN ya LISP se seekhta hai. SD-Access control ke liye LISP, data ke liye VXLAN-GPO aur policy ke liye SGTs use karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LISP = on-demand mapping system ke saath identity/location split; ports 4342 aur 4341; 36 bytes.</li>
<li>VXLAN = 24-bit VNI ke saath Layer 3 par Layer 2; UDP 4789; 50 bytes; minimum 1550 MTU.</li>
<li>Flood and learn vs BGP EVPN (push) vs LISP (pull).</li>
<li>SD-Access: CP node = MS/MR, edge = xTR, border = PxTR, VXLAN-GPO SGT le jaata hai.</li>
<li>Pehle underlay troubleshoot karo, phir registration ya peers, phir learning, phir MTU.</li>
</ul></div>
`}};export{e as default};