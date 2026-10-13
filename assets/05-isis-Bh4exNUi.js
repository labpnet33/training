var e={id:`isis`,h:{en:`IS-IS as an underlay option`,hi:`Underlay option ki tarah IS-IS`},body:{en:`
<p>Imagine two cartographers drawing the same city map. One writes the map in English and posts it through the city's normal mail system; the other writes it in an older script and hands it directly over the garden wall to each neighbour. Both end up with identical maps. OSPF and IS-IS are those two cartographers. Both are <b>link-state</b> protocols that run the same Dijkstra shortest-path calculation. The differences are in how they travel and how they are organised, and those differences are exactly why some large data centers prefer IS-IS.</p>

<h3>What makes IS-IS different</h3>
<ul>
<li><b>It does not run over IP.</b> OSPF packets are IP packets (protocol 89). IS-IS PDUs are carried directly inside Layer-2 frames. An attacker or a misrouted packet from the IP world cannot easily reach the IS-IS process, and IS-IS adjacencies do not depend on IP subnets matching.</li>
<li><b>One process, many address families.</b> The same IS-IS instance carries IPv4 and IPv6 prefixes as TLVs (type-length-value fields). With OSPF you need OSPFv2 for IPv4 and a separate OSPFv3 for IPv6.</li>
<li><b>TLV extensibility.</b> New features are added as new TLVs, which is why IS-IS has been the choice for segment routing and many service provider cores.</li>
<li><b>Simpler hierarchy.</b> Area boundaries sit on links, not inside routers, and a flat single-level design is natural.</li>
<li><b>Proven in fabrics.</b> Cisco ACI uses IS-IS internally as its underlay for tunnel endpoint (TEP) reachability, and FabricPath used it before that.</li>
</ul>

<h3>Levels</h3>
<p>IS-IS has two levels instead of OSPF's areas:</p>
<dl class="terms">
<dt>Level 1 (L1)</dt><dd>Routing inside one area, similar to an OSPF non-backbone area.</dd>
<dt>Level 2 (L2)</dt><dd>The backbone that connects areas, similar to OSPF area 0.</dd>
<dt>Level 1-2</dt><dd>A router that takes part in both. Cisco routers default to L1-2, forming two adjacencies and two databases per link.</dd>
</dl>
<p>A data center underlay is small and flat, so the usual choice is <b>level-2 only</b> on every switch (<code>is-type level-2</code>). That gives one database, one adjacency per link and no route leaking between levels.</p>

<h3>NET addresses</h3>
<p>IS-IS identifies each router by a <b>NET</b> (Network Entity Title), an address from the old OSI world. It has three parts:</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Parts of a NET address">
<rect x="40" y="30" width="130" height="44" rx="6" fill="#fde68a"/><text x="105" y="57" text-anchor="middle" class="svg-ink" font-size="14">49.0001</text>
<rect x="190" y="30" width="260" height="44" rx="6" fill="#bae6fd"/><text x="320" y="57" text-anchor="middle" class="svg-ink" font-size="14">0102.5500.0001</text>
<rect x="470" y="30" width="130" height="44" rx="6" fill="#bbf7d0"/><text x="535" y="57" text-anchor="middle" class="svg-ink" font-size="14">00</text>
<text x="105" y="100" text-anchor="middle" class="svg-muted" font-size="12">Area ID</text>
<text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">System ID (6 bytes, unique)</text>
<text x="535" y="100" text-anchor="middle" class="svg-muted" font-size="12">NSEL, always 00</text>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">System ID built from loopback0 10.255.0.1</text>
</svg><p class="cap">49 marks a private address, like 10.x in IPv4. The system ID must be unique in the fabric.</p></div>
<div class="eg"><p><b>Worked example: turning a loopback into a system ID.</b> LEAF1's loopback0 is 10.255.0.1. Pad each octet to three digits: 010.255.000.001. Join them: 010255000001. Regroup into three blocks of four: <b>0102.5500.0001</b>. The NET is <b>49.0001.0102.5500.0001.00</b>. For SPINE1 (10.255.0.11): 010.255.000.011 gives 0102.5500.0011, NET 49.0001.0102.5500.0011.00. The benefit: the system ID tells you the loopback, so outputs are easy to read.</p></div>

<h3>NX-OS configuration sketch</h3>
<pre class="code"><span class="c">! LEAF1, IS-IS underlay (instead of OSPF)</span>
feature isis
router isis UNDERLAY
  net 49.0001.0102.5500.0001.00
  is-type level-2
  log-adjacency-changes
  set-overload-bit on-startup 180
interface loopback0
  ip router isis UNDERLAY
interface loopback1
  ip router isis UNDERLAY
interface Ethernet1/1
  mtu 9216
  isis network point-to-point
  ip router isis UNDERLAY
interface Ethernet1/2
  mtu 9216
  isis network point-to-point
  ip router isis UNDERLAY</pre>
<ul>
<li><b>isis network point-to-point</b> plays the same role as in OSPF: no DIS (IS-IS's version of the DR) election and no pseudonode.</li>
<li><b>set-overload-bit on-startup 180</b> tells neighbours not to use this switch as a transit path for 180 seconds after boot. Its own loopbacks are still reachable, but spines will not route through a leaf that is still loading. It is a neat feature that OSPF achieves with max-metric router LSA.</li>
</ul>

<h3>Verification</h3>
<pre class="out">LEAF1# show isis adjacency
IS-IS process: UNDERLAY VRF: default
IS-IS adjacency database:
System ID       SNPA            Level  State  Hold Time  Interface
<span class="hl">SPINE1          N/A             2      UP     00:00:27   Ethernet1/1
SPINE2          N/A             2      UP     00:00:29   Ethernet1/2</span>

LEAF1# show ip route 10.255.0.2
10.255.0.2/32, ubest/mbest: 2/0
<span class="hl">    *via 10.1.1.0, Eth1/1, [115/81], 00:02:10, isis-UNDERLAY, L2
    *via 10.1.2.0, Eth1/2, [115/81], 00:02:10, isis-UNDERLAY, L2</span></pre>
<p>The shape is the same as OSPF: two adjacencies, two equal next hops. Note the administrative distance 115 and the route source isis-UNDERLAY, level L2. Hostnames appear instead of system IDs because IS-IS dynamic hostname exchange is on by default.</p>

<h3>OSPF or IS-IS?</h3>
<table class="cmp"><tr><th></th><th>OSPF</th><th>IS-IS</th></tr>
<tr><td>Transport</td><td>IP protocol 89</td><td>Directly over Layer 2</td></tr>
<tr><td>Router identity</td><td>Router-ID (IPv4 format)</td><td>NET / system ID</td></tr>
<tr><td>Hierarchy</td><td>Areas, area 0 backbone</td><td>Levels L1 and L2</td></tr>
<tr><td>IPv6</td><td>Separate OSPFv3</td><td>Same process</td></tr>
<tr><td>Election on LAN</td><td>DR/BDR (avoid with p2p)</td><td>DIS (avoid with p2p)</td></tr>
<tr><td>Admin distance</td><td>110</td><td>115</td></tr>
<tr><td>Team familiarity</td><td>Very high</td><td>Lower in enterprise</td></tr>
</table>
<p>For most enterprise fabrics OSPF wins on familiarity, and Cisco's reference designs use it. IS-IS wins when the team already runs it in the WAN, when IPv6 underlay is planned, or at very large scale. Either is a correct answer if you can justify it.</p>

<div class="warn"><p><b>Common mistakes.</b> Leaving the default L1-2 type, which doubles adjacencies and databases. Duplicate system IDs after copying a config. Mismatched MTU: IS-IS pads its hellos to the full interface MTU by default, so a 9216 versus 1500 mismatch stops the adjacency, which is actually helpful because it exposes the problem early.</p></div>
<div class="exam"><p><b>Exam tip.</b> IS-IS: NET = area + 6-byte system ID + NSEL 00; levels L1, L2, L1-2; AD 115; runs over Layer 2, not IP; <code>feature isis</code> on NX-OS. ACI's internal underlay is IS-IS.</p></div>

<div class="scn"><h4>The adjacency that would not come up</h4><p>A leaf migrated from OSPF to IS-IS kept one uplink in the INIT state. The other uplink was UP. Both had the same configuration. The engineer compared the interfaces and found the spine side still at mtu 1500 after a line card swap. Because IS-IS hello padding fills each hello to the interface MTU, the 9216-byte hellos from the leaf never arrived. Setting mtu 9216 on the spine port brought the adjacency straight to UP.</p><p><b>Lesson:</b> IS-IS hello padding turns a silent MTU problem into a visible adjacency problem. Do not disable padding just to "make it come up".</p></div>

<div class="iv"><p class="q">"Why would you choose IS-IS instead of OSPF for a data center underlay?"</p><p>Strong answer: IS-IS runs directly over Layer 2, so it is independent of IP addressing and harder to attack from the IP side; one instance carries IPv4 and IPv6; TLVs make it easy to extend; a single level-2 flat design is simple; and it is proven at scale, including inside Cisco ACI. Then be balanced: OSPF is equally capable for a typical fabric and more familiar to most teams, so the choice often comes down to operations and existing skills.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IS-IS is link-state like OSPF but runs over Layer 2 and carries IPv4 and IPv6 in one process.</li>
<li>Use level-2 only and point-to-point circuits in a fabric.</li>
<li>NET = 49.area.systemID.00; derive the system ID from loopback0.</li>
<li>set-overload-bit on-startup keeps a booting switch out of transit paths.</li>
<li>Both OSPF and IS-IS are valid underlays; justify the choice by team skills, IPv6 and scale.</li>
</ul></div>
`,hi:`
<p>Socho do cartographers ek hi city map bana rahe hain. Ek map English mein likhta hai aur shehar ke normal mail system se post karta hai; dusra ek purani script mein likhta hai aur garden wall ke upar se seedha har padosi ko de deta hai. Dono ke paas aakhir mein bilkul same map hota hai. OSPF aur IS-IS wahi do cartographers hain. Dono <b>link-state</b> protocols hain jo same Dijkstra shortest-path calculation chalate hain. Farak is baat mein hai ki woh kaise travel karte hain aur kaise organised hain, aur yahi farak hain jiski wajah se kuch bade data centers IS-IS prefer karte hain.</p>

<h3>IS-IS ko kya alag banata hai</h3>
<ul>
<li><b>Yeh IP par nahi chalta.</b> OSPF packets IP packets hain (protocol 89). IS-IS PDUs seedha Layer-2 frames ke andar jaate hain. IP duniya se koi attacker ya galat route hua packet aasaani se IS-IS process tak nahi pahunch sakta, aur IS-IS adjacencies IP subnets match hone par depend nahi karti.</li>
<li><b>Ek process, kai address families.</b> Same IS-IS instance IPv4 aur IPv6 prefixes ko TLVs (type-length-value fields) ki tarah le jaata hai. OSPF mein aapko IPv4 ke liye OSPFv2 aur IPv6 ke liye alag OSPFv3 chahiye.</li>
<li><b>TLV extensibility.</b> Naye features naye TLVs ki tarah jodte hain, isiliye IS-IS segment routing aur kai service provider cores ki choice raha hai.</li>
<li><b>Simple hierarchy.</b> Area boundaries links par hoti hain, routers ke andar nahi, aur flat single-level design natural hai.</li>
<li><b>Fabrics mein proven.</b> Cisco ACI andar se tunnel endpoint (TEP) reachability ke liye IS-IS ko underlay ki tarah use karta hai, aur usse pehle FabricPath bhi use karta tha.</li>
</ul>

<h3>Levels</h3>
<p>IS-IS mein OSPF ke areas ki jagah do levels hote hain:</p>
<dl class="terms">
<dt>Level 1 (L1)</dt><dd>Ek area ke andar routing, OSPF non-backbone area jaisa.</dd>
<dt>Level 2 (L2)</dt><dd>Backbone jo areas ko jodta hai, OSPF area 0 jaisa.</dd>
<dt>Level 1-2</dt><dd>Router jo dono mein hissa leta hai. Cisco routers default mein L1-2 hote hain, har link par do adjacencies aur do databases banate hain.</dd>
</dl>
<p>Data center underlay chhota aur flat hota hai, isliye usual choice har switch par <b>sirf level-2</b> hai (<code>is-type level-2</code>). Isse ek database, har link par ek adjacency aur levels ke beech koi route leaking nahi.</p>

<h3>NET addresses</h3>
<p>IS-IS har router ko ek <b>NET</b> (Network Entity Title) se pehchanta hai, jo purani OSI duniya ka address hai. Iske teen parts hain:</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="NET address ke parts">
<rect x="40" y="30" width="130" height="44" rx="6" fill="#fde68a"/><text x="105" y="57" text-anchor="middle" class="svg-ink" font-size="14">49.0001</text>
<rect x="190" y="30" width="260" height="44" rx="6" fill="#bae6fd"/><text x="320" y="57" text-anchor="middle" class="svg-ink" font-size="14">0102.5500.0001</text>
<rect x="470" y="30" width="130" height="44" rx="6" fill="#bbf7d0"/><text x="535" y="57" text-anchor="middle" class="svg-ink" font-size="14">00</text>
<text x="105" y="100" text-anchor="middle" class="svg-muted" font-size="12">Area ID</text>
<text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">System ID (6 bytes, unique)</text>
<text x="535" y="100" text-anchor="middle" class="svg-muted" font-size="12">NSEL, hamesha 00</text>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">System ID loopback0 10.255.0.1 se bana</text>
</svg><p class="cap">49 private address mark karta hai, IPv4 mein 10.x jaisa. System ID fabric mein unique hona chahiye.</p></div>
<div class="eg"><p><b>Worked example: loopback ko system ID mein badalna.</b> LEAF1 ka loopback0 10.255.0.1 hai. Har octet ko teen digits tak pad karo: 010.255.000.001. Inhe jodo: 010255000001. Chaar-chaar ke teen blocks mein regroup karo: <b>0102.5500.0001</b>. NET hai <b>49.0001.0102.5500.0001.00</b>. SPINE1 (10.255.0.11) ke liye: 010.255.000.011 se 0102.5500.0011 milta hai, NET 49.0001.0102.5500.0011.00. Fayda: system ID aapko loopback bata deta hai, isliye outputs padhna aasaan hai.</p></div>

<h3>NX-OS configuration sketch</h3>
<pre class="code"><span class="c">! LEAF1, IS-IS underlay (OSPF ki jagah)</span>
feature isis
router isis UNDERLAY
  net 49.0001.0102.5500.0001.00
  is-type level-2
  log-adjacency-changes
  set-overload-bit on-startup 180
interface loopback0
  ip router isis UNDERLAY
interface loopback1
  ip router isis UNDERLAY
interface Ethernet1/1
  mtu 9216
  isis network point-to-point
  ip router isis UNDERLAY
interface Ethernet1/2
  mtu 9216
  isis network point-to-point
  ip router isis UNDERLAY</pre>
<ul>
<li><b>isis network point-to-point</b> wahi role nibhata hai jo OSPF mein: koi DIS (IS-IS ka DR version) election nahi aur koi pseudonode nahi.</li>
<li><b>set-overload-bit on-startup 180</b> neighbours ko batata hai ki boot ke baad 180 seconds tak is switch ko transit path ki tarah use mat karo. Iske apne loopbacks phir bhi reachable rehte hain, lekin spines abhi load ho rahe leaf ke through route nahi karenge. Yeh ek badhiya feature hai jo OSPF max-metric router LSA se achieve karta hai.</li>
</ul>

<h3>Verification</h3>
<pre class="out">LEAF1# show isis adjacency
IS-IS process: UNDERLAY VRF: default
IS-IS adjacency database:
System ID       SNPA            Level  State  Hold Time  Interface
<span class="hl">SPINE1          N/A             2      UP     00:00:27   Ethernet1/1
SPINE2          N/A             2      UP     00:00:29   Ethernet1/2</span>

LEAF1# show ip route 10.255.0.2
10.255.0.2/32, ubest/mbest: 2/0
<span class="hl">    *via 10.1.1.0, Eth1/1, [115/81], 00:02:10, isis-UNDERLAY, L2
    *via 10.1.2.0, Eth1/2, [115/81], 00:02:10, isis-UNDERLAY, L2</span></pre>
<p>Shape OSPF jaisa hi hai: do adjacencies, do equal next hops. Administrative distance 115 aur route source isis-UNDERLAY, level L2 note karo. System IDs ki jagah hostnames dikhte hain kyunki IS-IS dynamic hostname exchange default mein on hota hai.</p>

<h3>OSPF ya IS-IS?</h3>
<table class="cmp"><tr><th></th><th>OSPF</th><th>IS-IS</th></tr>
<tr><td>Transport</td><td>IP protocol 89</td><td>Seedha Layer 2 par</td></tr>
<tr><td>Router identity</td><td>Router-ID (IPv4 format)</td><td>NET / system ID</td></tr>
<tr><td>Hierarchy</td><td>Areas, area 0 backbone</td><td>Levels L1 aur L2</td></tr>
<tr><td>IPv6</td><td>Alag OSPFv3</td><td>Same process</td></tr>
<tr><td>LAN par election</td><td>DR/BDR (p2p se bacho)</td><td>DIS (p2p se bacho)</td></tr>
<tr><td>Admin distance</td><td>110</td><td>115</td></tr>
<tr><td>Team familiarity</td><td>Bahut zyada</td><td>Enterprise mein kam</td></tr>
</table>
<p>Zyada tar enterprise fabrics ke liye OSPF familiarity par jeet-ta hai, aur Cisco ke reference designs ise use karte hain. IS-IS tab jeet-ta hai jab team pehle se WAN mein ise chala rahi ho, jab IPv6 underlay planned ho, ya bahut bade scale par. Dono sahi jawab hain agar aap justify kar sako.</p>

<div class="warn"><p><b>Common galtiyan.</b> Default L1-2 type chhod dena, jo adjacencies aur databases double kar deta hai. Config copy karne ke baad duplicate system IDs. Mismatched MTU: IS-IS default mein apne hellos ko poore interface MTU tak pad karta hai, isliye 9216 versus 1500 mismatch adjacency rok deta hai, jo asal mein helpful hai kyunki yeh problem ko jaldi expose kar deta hai.</p></div>
<div class="exam"><p><b>Exam tip.</b> IS-IS: NET = area + 6-byte system ID + NSEL 00; levels L1, L2, L1-2; AD 115; Layer 2 par chalta hai, IP par nahi; NX-OS par <code>feature isis</code>. ACI ka internal underlay IS-IS hai.</p></div>

<div class="scn"><h4>Adjacency jo up nahi ho rahi thi</h4><p>OSPF se IS-IS par migrate hue ek leaf ka ek uplink INIT state mein atka raha. Dusra uplink UP tha. Dono ki configuration same thi. Engineer ne interfaces compare kiye aur paaya ki line card swap ke baad spine side abhi bhi mtu 1500 par thi. Kyunki IS-IS hello padding har hello ko interface MTU tak bharta hai, leaf ke 9216-byte hellos kabhi pahunche hi nahi. Spine port par mtu 9216 set karte hi adjacency seedha UP ho gayi.</p><p><b>Seekh:</b> IS-IS hello padding ek silent MTU problem ko visible adjacency problem mein badal deta hai. Sirf "up karne ke liye" padding disable mat karo.</p></div>

<div class="iv"><p class="q">"Data center underlay ke liye OSPF ki jagah IS-IS kyun choose karoge?"</p><p>Strong answer: IS-IS seedha Layer 2 par chalta hai, isliye IP addressing se independent hai aur IP side se attack karna mushkil hai; ek instance IPv4 aur IPv6 dono le jaata hai; TLVs ise extend karna aasaan banate hain; single level-2 flat design simple hai; aur yeh scale par proven hai, Cisco ACI ke andar bhi. Phir balanced raho: typical fabric ke liye OSPF bhi utna hi capable hai aur zyada tar teams ke liye zyada familiar hai, isliye choice aksar operations aur existing skills par aati hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IS-IS OSPF ki tarah link-state hai lekin Layer 2 par chalta hai aur ek process mein IPv4 aur IPv6 le jaata hai.</li>
<li>Fabric mein sirf level-2 aur point-to-point circuits use karo.</li>
<li>NET = 49.area.systemID.00; system ID loopback0 se derive karo.</li>
<li>set-overload-bit on-startup boot ho rahe switch ko transit paths se bahar rakhta hai.</li>
<li>OSPF aur IS-IS dono valid underlays hain; choice ko team skills, IPv6 aur scale se justify karo.</li>
</ul></div>
`}};export{e as default};