var e={id:`sda-planes`,h:{en:`SD-Access planes: underlay, LISP control, VXLAN data, SGT policy`,hi:`SD-Access planes: underlay, LISP control, VXLAN data, SGT policy`},body:{en:`
<p>A city postal service has roads (anyone can drive between post offices), an address directory (which post office serves which person today), sealed bags (a parcel from one post office travels inside a bag addressed to the other post office) and a stamp on each bag saying who sent it, so the receiving office can refuse forbidden deliveries. SD-Access has exactly these four layers: <b>underlay</b>, <b>LISP control plane</b>, <b>VXLAN data plane</b> and <b>TrustSec policy plane</b>.</p>

<h3>1. The underlay</h3>
<ul>
<li>Every switch-to-switch link is a <b>routed point-to-point</b> link; each node has a <b>Loopback0 /32</b> that serves as its <b>RLOC</b> (routing locator, the "post office address").</li>
<li>Any IGP works, but Catalyst Center <b>LAN Automation</b> builds it for you with <b>IS-IS</b>: it discovers new switches with Plug and Play through a seed device, assigns /31 links and loopbacks from a pool, and enables IS-IS and BFD. IS-IS is chosen because it runs directly on Layer 2 (no IP needed to form adjacencies), converges fast and is simple.</li>
<li>Raise the underlay <b>MTU</b> (9100 is the usual recommendation) because VXLAN adds 50 bytes.</li>
<li>Underlay multicast is optional, used when you enable Layer 2 flooding or native multicast in the overlay.</li>
</ul>

<h3>2. Control plane: LISP</h3>
<dl class="terms">
<dt>EID</dt><dd>Endpoint identifier: the host's IP or MAC address.</dd>
<dt>RLOC</dt><dd>The loopback of the fabric node the host sits behind.</dd>
<dt>xTR</dt><dd>Ingress/egress tunnel router: the edge node that encapsulates (ITR) and decapsulates (ETR).</dd>
<dt>Map-Server / Map-Resolver</dt><dd>The control plane node: edges send it <b>Map-Register</b> messages; it answers <b>Map-Request</b>s (via the resolver) with <b>Map-Reply</b>s.</dd>
<dt>Instance ID</dt><dd>The LISP number for a virtual network, so each VN has its own EID space.</dd>
</dl>
<p>When a host connects, its edge registers it. When an edge must send to an unknown destination, it asks the control plane and caches the answer. If the destination is not in the fabric at all, traffic is sent to the <b>external border</b>. Only the edges that actually talk to a host learn about it, which keeps tables small. (Full LISP message formats are covered in the <i>LISP &amp; VXLAN</i> module.)</p>

<h3>3. Data plane: VXLAN-GPO</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="VXLAN-GPO frame">
<rect x="10" y="40" width="120" height="50" fill="#e2e8f0"/><text x="70" y="62" text-anchor="middle" class="svg-ink" font-size="12">Outer IP</text><text x="70" y="80" text-anchor="middle" class="svg-muted" font-size="11">RLOC to RLOC</text>
<rect x="130" y="40" width="90" height="50" fill="#bae6fd"/><text x="175" y="62" text-anchor="middle" class="svg-ink" font-size="12">UDP</text><text x="175" y="80" text-anchor="middle" class="svg-muted" font-size="11">dst 4789</text>
<rect x="220" y="40" width="200" height="50" fill="#fde68a"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="12">VXLAN-GPO header</text><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="11">VNI 24 bit + group 16 bit</text>
<rect x="420" y="40" width="210" height="50" fill="#bbf7d0"/><text x="525" y="62" text-anchor="middle" class="svg-ink" font-size="12">Original frame</text><text x="525" y="80" text-anchor="middle" class="svg-muted" font-size="11">host to host</text>
<text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="12">VNI = which virtual network, group = source SGT</text>
</svg><p class="cap">About 50 bytes of overhead; the SGT travels with every packet inside the fabric.</p></div>
<p>The ingress edge wraps the user frame in <b>VXLAN</b> with the <b>Group Policy Option</b>: a 24-bit <b>VNI</b> identifying the VN (or the Layer 2 segment) and a 16-bit <b>group policy ID</b> carrying the source <b>SGT</b>. The outer IP header goes from the ingress edge's RLOC to the egress edge's RLOC, routed by the underlay with ECMP. The user subnet's gateway is an <b>anycast gateway</b>: the same IP and MAC on every edge, so a host never needs to re-ARP when it moves.</p>

<h3>4. Policy plane: TrustSec</h3>
<ol><li><b>Classification</b>: ISE assigns the SGT at authentication (802.1X, MAB), or statically by IP/subnet or port.</li>
<li><b>Propagation</b>: inside the fabric the SGT rides in VXLAN-GPO; outside it, by inline tagging (Cisco metadata header on Ethernet) or <b>SXP</b> (a TCP protocol that shares IP-to-SGT bindings).</li>
<li><b>Enforcement</b>: the <b>egress edge</b> applies the <b>SGACL</b> from the source-group by destination-group matrix it downloaded from ISE.</li></ol>

<div class="eg"><p><b>Worked example: a packet walk.</b> A doctor's laptop 10.40.3.25 (VN CLINICAL, SGT 17) on Edge1 (RLOC 10.255.1.1) sends to an infusion-pump server 10.40.9.50 (SGT 40) behind Edge3 (RLOC 10.255.1.3). (1) The laptop sends to its anycast gateway on Edge1. (2) Edge1 has no cache entry, sends a Map-Request to the control plane node. (3) The reply says 10.40.9.50/32 is at 10.255.1.3. (4) Edge1 encapsulates: outer 10.255.1.1 to 10.255.1.3, UDP 4789, VNI of CLINICAL, group 17. (5) IS-IS routes it across intermediate nodes. (6) Edge3 decapsulates, checks the SGACL for 17 to 40, which permits, and delivers.</p></div>

<pre class="out">Edge1# show lisp instance-id 4099 ipv4 map-cache
LISP IPv4 Mapping Cache for EID-table vrf CLINICAL (IID 4099), 2 entries

0.0.0.0/0, uptime: 2d03h, expires: never, via static-send-map-request
  Negative cache entry, action: send-map-request
<span class="hl">10.40.9.50/32, uptime: 00:00:12, expires: 23:59:47, via map-reply, complete</span>
  Locator      Uptime    State      Pri/Wgt     Encap-IID
<span class="hl">  10.255.1.3   00:00:12  up          10/10        -</span>

Edge3# show cts role-based permissions from 17 to 40
IPv4 Role-based permissions from group 17:Doctors to group 40:MedDevices:
<span class="hl">        Permit_Clinical-00</span>
RBACL Monitor All for Dynamic Policies : FALSE
RBACL Monitor All for Configured policies : FALSE</pre>

<div class="warn"><p><b>Common mistakes.</b> Leaving the underlay MTU at 1500, so large packets fail after encapsulation while pings succeed. Assuming policy is enforced at the ingress edge: it is enforced at the <b>egress</b> edge, which knows the destination's group. Confusing the VNI (which network) with the SGT (which group).</p></div>

<div class="exam"><p><b>Exam traps.</b> SD-Access control plane = <b>LISP</b>; data plane = <b>VXLAN</b> (GPO, UDP 4789); policy plane = <b>Cisco TrustSec / SGT</b>; underlay built by LAN Automation uses <b>IS-IS</b>. VN = VRF = LISP instance ID = VNI. SGACLs are applied at egress.</p></div>

<div class="scn"><h4>Pings fine, file transfers fail</h4><p>After migrating a building to SD-Access, users could log in and ping servers, but large file copies and some web pages hung. Captures showed full-size 1500-byte packets being dropped between two intermediate nodes. The underlay had been built manually and one pair of links still had MTU 1500, so VXLAN-encapsulated packets of 1550 bytes could not pass. Setting MTU 9100 across the underlay fixed it.</p><p><b>Lesson:</b> every overlay needs a bigger underlay MTU. Small pings prove nothing about encapsulated large packets.</p></div>

<div class="iv"><p class="q">"Explain the control, data and policy planes of SD-Access."</p><p>Strong answer: underlay is a routed IS-IS network of loopbacks, usually built by LAN Automation. Control plane is LISP: edges register EIDs with the map-server and query the map-resolver, caching EID-to-RLOC mappings. Data plane is VXLAN-GPO: VNI for the VN and a 16-bit group field for the SGT, anycast gateway on every edge. Policy plane is TrustSec: ISE classifies, VXLAN or SXP/inline tagging propagates, egress edges enforce SGACLs. Walk one packet through if time allows.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay: routed links, loopback RLOCs, IS-IS via LAN Automation, jumbo MTU.</li>
<li>Control plane: LISP map-server/resolver; edges register and query EID-to-RLOC mappings.</li>
<li>Data plane: VXLAN-GPO carries VNI (VN) and SGT; anycast gateway on all edges.</li>
<li>Policy plane: TrustSec classify, propagate, enforce (SGACL at egress).</li>
<li>Verify with <code>show lisp ... map-cache</code> and <code>show cts role-based permissions</code>.</li>
</ul></div>
`,hi:`
<p>Sheher ki postal service mein sadakein hoti hain (koi bhi post offices ke beech chala sakta hai), ek address directory (aaj kaunsa post office kis vyakti ko serve karta hai), sealed bags (ek post office ka parcel doosre post office ke address wale bag ke andar jaata hai) aur har bag par ek stamp jo batata hai ki kisne bheja, taaki receiving office mana ki gayi deliveries refuse kar sake. SD-Access mein bilkul yahi chaar layers hain: <b>underlay</b>, <b>LISP control plane</b>, <b>VXLAN data plane</b> aur <b>TrustSec policy plane</b>.</p>

<h3>1. Underlay</h3>
<ul>
<li>Har switch-to-switch link ek <b>routed point-to-point</b> link hai; har node ka ek <b>Loopback0 /32</b> hota hai jo uska <b>RLOC</b> (routing locator, "post office ka address") hai.</li>
<li>Koi bhi IGP chalega, lekin Catalyst Center <b>LAN Automation</b> ise aapke liye <b>IS-IS</b> se banata hai: yeh seed device ke through Plug and Play se naye switches discover karta hai, pool se /31 links aur loopbacks assign karta hai, aur IS-IS aur BFD enable karta hai. IS-IS isliye chuna jaata hai kyunki yeh seedha Layer 2 par chalta hai (adjacency banane ke liye IP nahi chahiye), jaldi converge hota hai aur simple hai.</li>
<li>Underlay <b>MTU</b> badhao (aam taur par 9100 recommended hai) kyunki VXLAN 50 bytes jodta hai.</li>
<li>Underlay multicast optional hai, tab use hota hai jab aap overlay mein Layer 2 flooding ya native multicast enable karte ho.</li>
</ul>

<h3>2. Control plane: LISP</h3>
<dl class="terms">
<dt>EID</dt><dd>Endpoint identifier: host ka IP ya MAC address.</dd>
<dt>RLOC</dt><dd>Us fabric node ka loopback jiske peeche host baitha hai.</dd>
<dt>xTR</dt><dd>Ingress/egress tunnel router: edge node jo encapsulate (ITR) aur decapsulate (ETR) karta hai.</dd>
<dt>Map-Server / Map-Resolver</dt><dd>Control plane node: edges ise <b>Map-Register</b> messages bhejte hain; yeh (resolver ke through) <b>Map-Request</b>s ka jawab <b>Map-Reply</b> se deta hai.</dd>
<dt>Instance ID</dt><dd>Virtual network ka LISP number, taaki har VN ka apna EID space ho.</dd>
</dl>
<p>Jab host connect hota hai, uska edge use register karta hai. Jab edge ko unknown destination par bhejna ho, woh control plane se poochta hai aur jawab cache karta hai. Agar destination fabric mein hai hi nahi, to traffic <b>external border</b> ko bheja jaata hai. Sirf woh edges host ke baare mein seekhte hain jo sach mein usse baat karte hain, jisse tables chhoti rehti hain. (Poore LISP message formats <i>LISP &amp; VXLAN</i> module mein cover hote hain.)</p>

<h3>3. Data plane: VXLAN-GPO</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="VXLAN-GPO frame">
<rect x="10" y="40" width="120" height="50" fill="#e2e8f0"/><text x="70" y="62" text-anchor="middle" class="svg-ink" font-size="12">Outer IP</text><text x="70" y="80" text-anchor="middle" class="svg-muted" font-size="11">RLOC se RLOC</text>
<rect x="130" y="40" width="90" height="50" fill="#bae6fd"/><text x="175" y="62" text-anchor="middle" class="svg-ink" font-size="12">UDP</text><text x="175" y="80" text-anchor="middle" class="svg-muted" font-size="11">dst 4789</text>
<rect x="220" y="40" width="200" height="50" fill="#fde68a"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="12">VXLAN-GPO header</text><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="11">VNI 24 bit + group 16 bit</text>
<rect x="420" y="40" width="210" height="50" fill="#bbf7d0"/><text x="525" y="62" text-anchor="middle" class="svg-ink" font-size="12">Original frame</text><text x="525" y="80" text-anchor="middle" class="svg-muted" font-size="11">host se host</text>
<text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="12">VNI = kaunsa virtual network, group = source SGT</text>
</svg><p class="cap">Lagbhag 50 bytes overhead; fabric ke andar SGT har packet ke saath chalta hai.</p></div>
<p>Ingress edge user frame ko <b>Group Policy Option</b> wale <b>VXLAN</b> mein lapet-ta hai: ek 24-bit <b>VNI</b> jo VN (ya Layer 2 segment) pehchanta hai aur ek 16-bit <b>group policy ID</b> jo source <b>SGT</b> le jaata hai. Outer IP header ingress edge ke RLOC se egress edge ke RLOC tak jaata hai, underlay ECMP se route karta hai. User subnet ka gateway <b>anycast gateway</b> hai: har edge par same IP aur MAC, isliye host ko move hone par dobara ARP nahi karna padta.</p>

<h3>4. Policy plane: TrustSec</h3>
<ol><li><b>Classification</b>: ISE authentication (802.1X, MAB) par SGT assign karta hai, ya statically IP/subnet ya port se.</li>
<li><b>Propagation</b>: fabric ke andar SGT VXLAN-GPO mein chalta hai; bahar inline tagging (Ethernet par Cisco metadata header) ya <b>SXP</b> (TCP protocol jo IP-to-SGT bindings share karta hai) se.</li>
<li><b>Enforcement</b>: <b>egress edge</b> ISE se download kiye source-group by destination-group matrix se <b>SGACL</b> lagata hai.</li></ol>

<div class="eg"><p><b>Worked example: ek packet walk.</b> Edge1 (RLOC 10.255.1.1) par doctor ka laptop 10.40.3.25 (VN CLINICAL, SGT 17) Edge3 (RLOC 10.255.1.3) ke peeche infusion-pump server 10.40.9.50 (SGT 40) ko bhejta hai. (1) Laptop Edge1 par apne anycast gateway ko bhejta hai. (2) Edge1 ke paas cache entry nahi, woh control plane node ko Map-Request bhejta hai. (3) Reply kehta hai 10.40.9.50/32 10.255.1.3 par hai. (4) Edge1 encapsulate karta hai: outer 10.255.1.1 se 10.255.1.3, UDP 4789, CLINICAL ka VNI, group 17. (5) IS-IS ise intermediate nodes ke paar route karta hai. (6) Edge3 decapsulate karta hai, 17 se 40 ka SGACL check karta hai, jo permit karta hai, aur deliver karta hai.</p></div>

<pre class="out">Edge1# show lisp instance-id 4099 ipv4 map-cache
LISP IPv4 Mapping Cache for EID-table vrf CLINICAL (IID 4099), 2 entries

0.0.0.0/0, uptime: 2d03h, expires: never, via static-send-map-request
  Negative cache entry, action: send-map-request
<span class="hl">10.40.9.50/32, uptime: 00:00:12, expires: 23:59:47, via map-reply, complete</span>
  Locator      Uptime    State      Pri/Wgt     Encap-IID
<span class="hl">  10.255.1.3   00:00:12  up          10/10        -</span>

Edge3# show cts role-based permissions from 17 to 40
IPv4 Role-based permissions from group 17:Doctors to group 40:MedDevices:
<span class="hl">        Permit_Clinical-00</span>
RBACL Monitor All for Dynamic Policies : FALSE
RBACL Monitor All for Configured policies : FALSE</pre>

<div class="warn"><p><b>Common galtiyan.</b> Underlay MTU 1500 par chhod dena, jisse encapsulation ke baad bade packets fail hote hain jabki pings chal jaate hain. Yeh maan lena ki policy ingress edge par enforce hoti hai: yeh <b>egress</b> edge par hoti hai, jo destination ka group jaanta hai. VNI (kaunsa network) ko SGT (kaunsa group) se confuse karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> SD-Access control plane = <b>LISP</b>; data plane = <b>VXLAN</b> (GPO, UDP 4789); policy plane = <b>Cisco TrustSec / SGT</b>; LAN Automation se bana underlay <b>IS-IS</b> use karta hai. VN = VRF = LISP instance ID = VNI. SGACLs egress par lagte hain.</p></div>

<div class="scn"><h4>Pings theek, file transfers fail</h4><p>Ek building ko SD-Access par migrate karne ke baad users login kar sakte the aur servers ko ping kar sakte the, lekin badi file copies aur kuch web pages atak jaate the. Captures ne dikhaya ki do intermediate nodes ke beech full-size 1500-byte packets drop ho rahe the. Underlay haath se bana tha aur links ke ek pair par ab bhi MTU 1500 tha, isliye 1550 bytes ke VXLAN-encapsulated packets paar nahi ho paate the. Poore underlay par MTU 9100 set karne se theek ho gaya.</p><p><b>Seekh:</b> har overlay ko bada underlay MTU chahiye. Chhote pings encapsulated bade packets ke baare mein kuch sabit nahi karte.</p></div>

<div class="iv"><p class="q">"SD-Access ke control, data aur policy planes explain karo."</p><p>Strong answer: underlay loopbacks ka routed IS-IS network hai, aksar LAN Automation se bana. Control plane LISP hai: edges map-server ke saath EIDs register karte hain aur map-resolver se query karte hain, EID-to-RLOC mappings cache karte hain. Data plane VXLAN-GPO hai: VN ke liye VNI aur SGT ke liye 16-bit group field, har edge par anycast gateway. Policy plane TrustSec hai: ISE classify karta hai, VXLAN ya SXP/inline tagging propagate karta hai, egress edges SGACLs enforce karte hain. Time ho to ek packet walk karao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay: routed links, loopback RLOCs, LAN Automation se IS-IS, jumbo MTU.</li>
<li>Control plane: LISP map-server/resolver; edges EID-to-RLOC mappings register aur query karte hain.</li>
<li>Data plane: VXLAN-GPO VNI (VN) aur SGT le jaata hai; saare edges par anycast gateway.</li>
<li>Policy plane: TrustSec classify, propagate, enforce (egress par SGACL).</li>
<li><code>show lisp ... map-cache</code> aur <code>show cts role-based permissions</code> se verify karo.</li>
</ul></div>
`}};export{e as default};