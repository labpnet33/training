var e={id:`requirements`,h:{en:`Underlay requirements: what it must do, and what stays out`,hi:`Underlay requirements: ise kya karna hai, aur kya bahar rehta hai`},body:{en:`
<p>Before a highway is built, engineers write a specification: how many lanes, what weight limit, how quickly a crash must be cleared, which vehicles are not allowed. The underlay deserves the same discipline. If you can recite its requirements, you can design it on a whiteboard, defend it in an interview and, most usefully, spot what is wrong when a fabric misbehaves.</p>

<h3>Requirement 1: loopback reachability</h3>
<p>Everything in a VXLAN EVPN fabric talks loopback to loopback. Typical loopbacks on a Nexus leaf are:</p>
<ul>
<li><b>loopback0</b>: router-ID for OSPF and BGP, and the source address for iBGP EVPN sessions to the spines (route reflectors).</li>
<li><b>loopback1</b>: the VTEP source address used by <code>interface nve1</code>. On a vPC pair this loopback also carries a shared <b>secondary</b> address (the anycast VTEP), which must also be advertised.</li>
<li>On spines, an extra loopback for the <b>anycast rendezvous point</b> if you use a multicast underlay.</li>
</ul>
<p>Each is a <b>/32 host route</b>. The underlay must deliver every one of them to every switch. A missing /32 means a missing tunnel or a missing BGP session.</p>

<h3>Requirement 2: ECMP across all spines</h3>
<p>Every leaf must reach every remote loopback through <b>every spine</b> at equal cost. With 4 spines you expect 4 next hops. This needs symmetric cabling (each leaf has the same number and speed of uplinks to each spine), identical OSPF costs and enough <code>maximum-paths</code>. The payoff: bandwidth grows with each spine you add, and a spine failure removes only 1/N of the capacity.</p>

<h3>Requirement 3: fast, predictable convergence</h3>
<p>When a link or spine fails, traffic must move to the surviving paths in milliseconds, not tens of seconds. Physical link loss is detected almost instantly on direct fibre; BFD covers failures that do not drop the light, such as a hung line card or a one-way fibre. Because ECMP already has the other paths installed, recovery is mostly just removing a next hop.</p>

<h3>Requirement 4: jumbo MTU end to end</h3>
<p>VXLAN adds headers to every server frame. The standard IPv4 calculation:</p>
<table class="cmp"><tr><th>Header</th><th>Bytes</th></tr>
<tr><td>Outer Ethernet</td><td>14</td></tr>
<tr><td>Outer IPv4</td><td>20</td></tr>
<tr><td>Outer UDP (dst 4789)</td><td>8</td></tr>
<tr><td>VXLAN header (carries the 24-bit VNI)</td><td>8</td></tr>
<tr><td><b>Total overhead</b></td><td><b>50</b> (54 if the inner frame keeps an 802.1Q tag; 70 with an IPv6 outer header)</td></tr>
</table>
<p>A server sending standard 1,500-byte packets needs an underlay IP MTU of at least 1,550. Servers using 9,000-byte jumbo frames need at least 9,050. The industry habit is simple: set <b>mtu 9216</b> (the Nexus maximum) on every fabric link and never think about it again.</p>
<pre class="out">LEAF1# show interface Ethernet1/1 | include MTU
<span class="hl">  MTU 9216 bytes, BW 100000000 Kbit , DLY 10 usec</span></pre>

<h3>Requirement 5: simplicity</h3>
<p>The underlay should be boring. One OSPF area (area 0), one process name, point-to-point network type everywhere, no redistribution, the same template on every leaf. A simple underlay is easy to automate, easy to read at 3 a.m. and hard to break. Clever features (multiple areas, route filtering, policy routing) belong elsewhere.</p>

<h3>Requirement 6: scale</h3>
<p>Because the underlay carries only infrastructure prefixes, it stays tiny even in big fabrics. The size grows with the number of switches, not with the number of servers or VMs. That is why a single OSPF area works comfortably for hundreds of switches.</p>

<div class="eg"><p><b>Worked example: how big is the underlay table?</b> Fabric: 2 spines and 4 leaves, multicast underlay. Loopbacks: 4 leaves × 2 (lo0, lo1) = 8, plus 2 spine lo0 = 10, plus 1 anycast RP = <b>11 /32 routes</b>. Links: 4 leaves × 2 uplinks = <b>8 /31 routes</b>. Total about <b>19 prefixes</b>. Grow to 64 leaves and 4 spines: 128 + 4 + 1 = 133 loopbacks and 256 links, still under 400 routes. Now compare with the overlay, which may carry tens of thousands of MAC and host routes. Keeping those out of the underlay is what keeps it fast.</p></div>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="What belongs in underlay and what does not">
<rect x="20" y="15" width="290" height="200" rx="8" fill="#bbf7d0"/><text x="165" y="40" text-anchor="middle" class="svg-ink" font-size="14">In the underlay</text>
<text x="40" y="70" class="svg-ink" font-size="13">Leaf lo0 /32 (router-ID)</text>
<text x="40" y="95" class="svg-ink" font-size="13">Leaf lo1 /32 (VTEP)</text>
<text x="40" y="120" class="svg-ink" font-size="13">Spine lo0 /32</text>
<text x="40" y="145" class="svg-ink" font-size="13">Anycast RP /32</text>
<text x="40" y="170" class="svg-ink" font-size="13">Fabric /31 links (optional)</text>
<rect x="330" y="15" width="290" height="200" rx="8" fill="#fed7aa"/><text x="475" y="40" text-anchor="middle" class="svg-ink" font-size="14">Keep out</text>
<text x="350" y="70" class="svg-ink" font-size="13">Server and tenant subnets</text>
<text x="350" y="95" class="svg-ink" font-size="13">Host routes of VMs</text>
<text x="350" y="120" class="svg-ink" font-size="13">Internet or WAN routes</text>
<text x="350" y="145" class="svg-ink" font-size="13">Redistributed statics</text>
<text x="350" y="170" class="svg-ink" font-size="13">mgmt0 (management VRF)</text>
</svg><p class="cap">The underlay carries only what switches need to reach each other. Tenant routes live in VRFs in the overlay.</p></div>

<h3>What NOT to put in the underlay</h3>
<ul>
<li><b>Tenant and server subnets.</b> These go into tenant VRFs and are carried by BGP EVPN (route types 2 and 5). Putting them in the default VRF mixes customer changes with fabric stability.</li>
<li><b>External routes.</b> Internet and WAN prefixes arrive at the border leaf inside tenant VRFs, not into the underlay IGP.</li>
<li><b>Redistribution.</b> Avoid <code>redistribute direct</code> or <code>redistribute static</code> into the underlay. Advertise exactly the interfaces you mean with <code>ip router ospf</code>.</li>
<li><b>Layer-2 extensions.</b> No VLANs trunked between switches for transport, no spanning tree between leaf and spine. Fabric links are routed ports.</li>
<li><b>Leaf-to-leaf transport links.</b> The only leaf-to-leaf links are vPC peer links, and they are not part of the spine-leaf path.</li>
<li><b>Management.</b> mgmt0 stays in the management VRF on the out-of-band network.</li>
</ul>

<table class="cmp"><tr><th>Requirement</th><th>How you meet it on NX-OS</th></tr>
<tr><td>Loopback reachability</td><td>/32 loopbacks with <code>ip router ospf UNDERLAY area 0.0.0.0</code></td></tr>
<tr><td>ECMP</td><td>Symmetric cabling, equal cost, <code>maximum-paths</code></td></tr>
<tr><td>Convergence</td><td><code>feature bfd</code>, BFD on OSPF or BGP, sensible SPF timers</td></tr>
<tr><td>MTU</td><td><code>mtu 9216</code> on every fabric interface</td></tr>
<tr><td>Simplicity</td><td>Single area, point-to-point, one template</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Setting mtu 9216 on leaves but forgetting a spine replaced after an RMA. Leaving one uplink at a different speed, which changes its OSPF cost and silently removes it from ECMP. Redistributing connected routes and accidentally pulling server SVIs into the underlay.</p></div>
<div class="exam"><p><b>Exam tip.</b> VXLAN overhead with IPv4 outer header = 50 bytes. Recommended underlay MTU = 9216. The underlay advertises VTEP and router-ID loopbacks; tenant prefixes go in EVPN.</p></div>

<div class="scn"><h4>The replaced spine with a default MTU</h4><p>After a hardware RMA, SPINE2 was rebuilt from an old template. Monitoring showed nothing wrong: OSPF was FULL and small pings worked. But database replication between racks stalled for about half of the flows. The engineer checked <code>show interface | include MTU</code> on SPINE2 and found 1500 on every fabric port. Flows hashed through SPINE2 carrying 1,500-byte server frames became 1,550-byte packets and were dropped. OSPF had formed only because ip ospf mtu-ignore was in the old template. Setting mtu 9216 and removing mtu-ignore fixed it.</p><p><b>Lesson:</b> MTU is a requirement, not a default. Verify it on every switch after every rebuild.</p></div>

<div class="iv"><p class="q">"What are the requirements of a data center underlay?"</p><p>Strong answer, in order: reachability of every /32 loopback (router-ID, VTEP, anycast RP); ECMP through all spines; sub-second convergence using BFD; jumbo MTU 9216 to absorb the 50-byte VXLAN overhead; simplicity (single area, point-to-point, no redistribution); and scale, which comes from carrying only infrastructure prefixes. Finish with what you keep out: tenant subnets, external routes and Layer-2.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The underlay carries /32 loopbacks (lo0, lo1, anycast RP) and fabric links, nothing else.</li>
<li>ECMP through every spine needs symmetric cabling and equal costs.</li>
<li>VXLAN adds 50 bytes; use mtu 9216 on every fabric link.</li>
<li>Keep it simple: one area, point-to-point, no redistribution, one template.</li>
<li>Tenant, external and management routes stay out of the underlay.</li>
</ul></div>
`,hi:`
<p>Highway banne se pehle engineers ek specification likhte hain: kitni lanes, kitna weight limit, accident kitni jaldi clear hona chahiye, kaunse vehicles allowed nahi. Underlay ko bhi wahi discipline chahiye. Agar aap iski requirements bol sakte ho, to aap ise whiteboard par design kar sakte ho, interview mein defend kar sakte ho aur, sabse useful, jab fabric gadbad kare to pakad sakte ho ki kya galat hai.</p>

<h3>Requirement 1: loopback reachability</h3>
<p>VXLAN EVPN fabric mein sab kuch loopback se loopback baat karta hai. Nexus leaf par typical loopbacks yeh hain:</p>
<ul>
<li><b>loopback0</b>: OSPF aur BGP ka router-ID, aur spines (route reflectors) ke saath iBGP EVPN sessions ka source address.</li>
<li><b>loopback1</b>: VTEP source address jo <code>interface nve1</code> use karta hai. vPC pair par is loopback par ek shared <b>secondary</b> address (anycast VTEP) bhi hota hai, jise bhi advertise karna padta hai.</li>
<li>Spines par, agar multicast underlay use kar rahe ho to <b>anycast rendezvous point</b> ke liye ek extra loopback.</li>
</ul>
<p>Har ek <b>/32 host route</b> hai. Underlay ko inmein se har ek ko har switch tak pahunchana hai. Ek /32 missing matlab ek tunnel missing ya ek BGP session missing.</p>

<h3>Requirement 2: saare spines par ECMP</h3>
<p>Har leaf ko har remote loopback tak <b>har spine</b> ke through equal cost par pahunchna chahiye. 4 spines hain to aap 4 next hops expect karte ho. Iske liye symmetric cabling chahiye (har leaf ke har spine tak same number aur same speed ke uplinks), identical OSPF costs aur kaafi <code>maximum-paths</code>. Fayda: har naye spine ke saath bandwidth badhti hai, aur ek spine failure capacity ka sirf 1/N hissa hataata hai.</p>

<h3>Requirement 3: fast, predictable convergence</h3>
<p>Jab ek link ya spine fail ho, traffic ko milliseconds mein bache hue paths par shift hona chahiye, das-das seconds mein nahi. Direct fibre par physical link loss lagbhag turant detect hota hai; BFD un failures ko cover karta hai jo light nahi girate, jaise hung line card ya one-way fibre. Kyunki ECMP ke paas dusre paths pehle se installed hain, recovery zyada tar bas ek next hop hatana hai.</p>

<h3>Requirement 4: end to end jumbo MTU</h3>
<p>VXLAN har server frame mein headers jodta hai. Standard IPv4 calculation:</p>
<table class="cmp"><tr><th>Header</th><th>Bytes</th></tr>
<tr><td>Outer Ethernet</td><td>14</td></tr>
<tr><td>Outer IPv4</td><td>20</td></tr>
<tr><td>Outer UDP (dst 4789)</td><td>8</td></tr>
<tr><td>VXLAN header (24-bit VNI le jaata hai)</td><td>8</td></tr>
<tr><td><b>Total overhead</b></td><td><b>50</b> (agar inner frame 802.1Q tag rakhe to 54; IPv6 outer header ke saath 70)</td></tr>
</table>
<p>Standard 1,500-byte packets bhejne wale server ko kam se kam 1,550 ka underlay IP MTU chahiye. 9,000-byte jumbo frames use karne wale servers ko kam se kam 9,050 chahiye. Industry ki aadat simple hai: har fabric link par <b>mtu 9216</b> (Nexus maximum) set karo aur phir iske baare mein kabhi mat socho.</p>
<pre class="out">LEAF1# show interface Ethernet1/1 | include MTU
<span class="hl">  MTU 9216 bytes, BW 100000000 Kbit , DLY 10 usec</span></pre>

<h3>Requirement 5: simplicity</h3>
<p>Underlay boring hona chahiye. Ek OSPF area (area 0), ek process name, har jagah point-to-point network type, koi redistribution nahi, har leaf par same template. Simple underlay automate karna aasaan hai, raat 3 baje padhna aasaan hai aur todna mushkil hai. Clever features (multiple areas, route filtering, policy routing) kahin aur jagah ke liye hain.</p>

<h3>Requirement 6: scale</h3>
<p>Kyunki underlay sirf infrastructure prefixes le jaata hai, yeh bade fabrics mein bhi chhota rehta hai. Iska size switches ki ginti ke saath badhta hai, servers ya VMs ki ginti ke saath nahi. Isiliye ek single OSPF area sainkdon switches ke liye aaram se kaam karta hai.</p>

<div class="eg"><p><b>Worked example: underlay table kitna bada hai?</b> Fabric: 2 spines aur 4 leaves, multicast underlay. Loopbacks: 4 leaves × 2 (lo0, lo1) = 8, plus 2 spine lo0 = 10, plus 1 anycast RP = <b>11 /32 routes</b>. Links: 4 leaves × 2 uplinks = <b>8 /31 routes</b>. Total lagbhag <b>19 prefixes</b>. 64 leaves aur 4 spines tak badhao: 128 + 4 + 1 = 133 loopbacks aur 256 links, phir bhi 400 routes se kam. Ab overlay se compare karo, jo das hazaron MAC aur host routes le ja sakta hai. Unhe underlay se bahar rakhna hi use fast rakhta hai.</p></div>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Underlay mein kya hai aur kya nahi">
<rect x="20" y="15" width="290" height="200" rx="8" fill="#bbf7d0"/><text x="165" y="40" text-anchor="middle" class="svg-ink" font-size="14">Underlay mein</text>
<text x="40" y="70" class="svg-ink" font-size="13">Leaf lo0 /32 (router-ID)</text>
<text x="40" y="95" class="svg-ink" font-size="13">Leaf lo1 /32 (VTEP)</text>
<text x="40" y="120" class="svg-ink" font-size="13">Spine lo0 /32</text>
<text x="40" y="145" class="svg-ink" font-size="13">Anycast RP /32</text>
<text x="40" y="170" class="svg-ink" font-size="13">Fabric /31 links (optional)</text>
<rect x="330" y="15" width="290" height="200" rx="8" fill="#fed7aa"/><text x="475" y="40" text-anchor="middle" class="svg-ink" font-size="14">Bahar rakho</text>
<text x="350" y="70" class="svg-ink" font-size="13">Server aur tenant subnets</text>
<text x="350" y="95" class="svg-ink" font-size="13">VMs ke host routes</text>
<text x="350" y="120" class="svg-ink" font-size="13">Internet ya WAN routes</text>
<text x="350" y="145" class="svg-ink" font-size="13">Redistributed statics</text>
<text x="350" y="170" class="svg-ink" font-size="13">mgmt0 (management VRF)</text>
</svg><p class="cap">Underlay sirf woh le jaata hai jo switches ko ek dusre tak pahunchne ke liye chahiye. Tenant routes overlay mein VRFs ke andar rehte hain.</p></div>

<h3>Underlay mein kya NAHI daalna</h3>
<ul>
<li><b>Tenant aur server subnets.</b> Yeh tenant VRFs mein jaate hain aur BGP EVPN (route types 2 aur 5) inhe le jaata hai. Inhe default VRF mein daalne se customer changes fabric stability ke saath mix ho jaate hain.</li>
<li><b>External routes.</b> Internet aur WAN prefixes border leaf par tenant VRFs ke andar aate hain, underlay IGP mein nahi.</li>
<li><b>Redistribution.</b> Underlay mein <code>redistribute direct</code> ya <code>redistribute static</code> se bacho. Jo interfaces aap chahte ho, bilkul wahi <code>ip router ospf</code> se advertise karo.</li>
<li><b>Layer-2 extensions.</b> Transport ke liye switches ke beech VLANs trunk nahi, leaf aur spine ke beech spanning tree nahi. Fabric links routed ports hain.</li>
<li><b>Leaf-to-leaf transport links.</b> Leaf-to-leaf links sirf vPC peer links hote hain, aur woh spine-leaf path ka hissa nahi hain.</li>
<li><b>Management.</b> mgmt0 out-of-band network par management VRF mein rehta hai.</li>
</ul>

<table class="cmp"><tr><th>Requirement</th><th>NX-OS par ise kaise poora karte ho</th></tr>
<tr><td>Loopback reachability</td><td><code>ip router ospf UNDERLAY area 0.0.0.0</code> ke saath /32 loopbacks</td></tr>
<tr><td>ECMP</td><td>Symmetric cabling, equal cost, <code>maximum-paths</code></td></tr>
<tr><td>Convergence</td><td><code>feature bfd</code>, OSPF ya BGP par BFD, sensible SPF timers</td></tr>
<tr><td>MTU</td><td>Har fabric interface par <code>mtu 9216</code></td></tr>
<tr><td>Simplicity</td><td>Single area, point-to-point, ek template</td></tr>
</table>

<div class="warn"><p><b>Common galtiyan.</b> Leaves par mtu 9216 set karna lekin RMA ke baad replace hua spine bhool jaana. Ek uplink ko alag speed par chhod dena, jo uski OSPF cost badal deta hai aur chupchaap use ECMP se hata deta hai. Connected routes redistribute karna aur galti se server SVIs ko underlay mein kheench lena.</p></div>
<div class="exam"><p><b>Exam tip.</b> IPv4 outer header ke saath VXLAN overhead = 50 bytes. Recommended underlay MTU = 9216. Underlay VTEP aur router-ID loopbacks advertise karta hai; tenant prefixes EVPN mein jaate hain.</p></div>

<div class="scn"><h4>Default MTU wala replaced spine</h4><p>Hardware RMA ke baad SPINE2 ko ek purane template se rebuild kiya gaya. Monitoring mein kuch galat nahi dikha: OSPF FULL tha aur chhote pings chal rahe the. Lekin racks ke beech database replication lagbhag aadhe flows ke liye atak gaya. Engineer ne SPINE2 par <code>show interface | include MTU</code> check kiya aur har fabric port par 1500 mila. SPINE2 se hash hone wale flows jo 1,500-byte server frames le ja rahe the, 1,550-byte packets ban gaye aur drop ho gaye. OSPF sirf isliye bana tha kyunki purane template mein ip ospf mtu-ignore tha. mtu 9216 set karne aur mtu-ignore hatane se yeh theek hua.</p><p><b>Seekh:</b> MTU ek requirement hai, default nahi. Har rebuild ke baad har switch par ise verify karo.</p></div>

<div class="iv"><p class="q">"Data center underlay ki requirements kya hain?"</p><p>Strong answer, order mein: har /32 loopback ki reachability (router-ID, VTEP, anycast RP); saare spines ke through ECMP; BFD use karke sub-second convergence; 50-byte VXLAN overhead ko absorb karne ke liye jumbo MTU 9216; simplicity (single area, point-to-point, koi redistribution nahi); aur scale, jo sirf infrastructure prefixes le jaane se aata hai. Aakhir mein batao ki kya bahar rakhte ho: tenant subnets, external routes aur Layer-2.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay /32 loopbacks (lo0, lo1, anycast RP) aur fabric links le jaata hai, aur kuch nahi.</li>
<li>Har spine ke through ECMP ke liye symmetric cabling aur equal costs chahiye.</li>
<li>VXLAN 50 bytes jodta hai; har fabric link par mtu 9216 use karo.</li>
<li>Simple rakho: ek area, point-to-point, koi redistribution nahi, ek template.</li>
<li>Tenant, external aur management routes underlay se bahar rehte hain.</li>
</ul></div>
`}};export{e as default};