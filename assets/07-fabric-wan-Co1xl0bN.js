var e={id:`fabric-wan`,h:{en:`Fabric designs, spine-leaf and the WAN and branch edge`,hi:`Fabric designs, spine-leaf aur WAN aur branch edge`},body:{en:`
<p>A metro rail network with a ring line and radial lines has a nice property: from any station you can reach any other station with at most one change, and if one ring segment closes, trains simply use the other direction. Compare that with an old tree-shaped bus network where every trip goes to the central depot first. Data-centre and modern campus <b>fabrics</b> are the metro: every edge switch is exactly one hop from every other edge switch through a set of equal paths. This chapter covers fabric designs (ENCOR 1.1 lists "fabric" next to 2-tier and 3-tier) and the WAN and branch designs that connect an enterprise's sites.</p>

<h3>Why the data centre moved to spine-leaf</h3>
<p>Traditional three-tier data centres were built for <b>north-south</b> traffic: clients outside talking to servers inside. Modern applications are split into many services that talk to each other, so most traffic is now <b>east-west</b>, server to server. In a three-tier design with spanning tree, east-west traffic often climbs to the aggregation or core layer and back down, half the links are blocked, and latency differs depending on where two servers sit.</p>
<p>A <b>spine-leaf</b> (Clos) fabric fixes this with two strict rules:</p>
<ul>
<li>Every <b>leaf</b> (top-of-rack switch where servers, firewalls and routers attach) connects to <b>every spine</b>.</li>
<li>Spines never connect to each other, and leaves never connect to each other (apart from special pairs such as vPC or MLAG peers).</li>
</ul>
<p>So any server reaches any other server on another leaf in exactly <b>leaf → spine → leaf</b>: the same number of hops and predictable latency. The links are routed and every spine offers an equal-cost path, so traffic is spread with <b>ECMP</b> and nothing is blocked.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Spine-leaf fabric">
<rect x="170" y="25" width="110" height="36" rx="6" fill="#fde68a"/><text x="225" y="48" text-anchor="middle" class="svg-ink" font-size="13">Spine 1</text>
<rect x="360" y="25" width="110" height="36" rx="6" fill="#fde68a"/><text x="415" y="48" text-anchor="middle" class="svg-ink" font-size="13">Spine 2</text>
<rect x="30" y="150" width="110" height="36" rx="6" fill="#bae6fd"/><text x="85" y="173" text-anchor="middle" class="svg-ink" font-size="13">Leaf 1</text>
<rect x="190" y="150" width="110" height="36" rx="6" fill="#bae6fd"/><text x="245" y="173" text-anchor="middle" class="svg-ink" font-size="13">Leaf 2</text>
<rect x="350" y="150" width="110" height="36" rx="6" fill="#bae6fd"/><text x="405" y="173" text-anchor="middle" class="svg-ink" font-size="13">Leaf 3</text>
<rect x="510" y="150" width="110" height="36" rx="6" fill="#bbf7d0"/><text x="565" y="173" text-anchor="middle" class="svg-ink" font-size="13">Border leaf</text>
<line x1="225" y1="61" x2="85" y2="150" stroke="#64748b"/><line x1="225" y1="61" x2="245" y2="150" stroke="#64748b"/><line x1="225" y1="61" x2="405" y2="150" stroke="#64748b"/><line x1="225" y1="61" x2="565" y2="150" stroke="#64748b"/>
<line x1="415" y1="61" x2="85" y2="150" stroke="#64748b"/><line x1="415" y1="61" x2="245" y2="150" stroke="#64748b"/><line x1="415" y1="61" x2="405" y2="150" stroke="#64748b"/><line x1="415" y1="61" x2="565" y2="150" stroke="#64748b"/>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">Every leaf to every spine; routed links; ECMP across spines</text>
</svg><p class="cap">Any leaf reaches any other leaf through any spine in two hops. The border leaf connects to WAN, internet and campus.</p></div>

<h3>Scaling and oversubscription in a fabric</h3>
<p>You scale a fabric <b>out</b>, not up. Need more server ports? Add a leaf. Need more bandwidth between leaves? Add a spine and one more uplink on every leaf. The limits are simple: the number of spines is capped by the uplink ports on each leaf, and the number of leaves is capped by the ports on each spine.</p>
<div class="eg"><p><b>Worked example.</b> Each leaf has 48 server ports at 25 Gbps (1,200 Gbps down) and uplinks at 100 Gbps. With 4 spines (4 x 100 = 400 Gbps up) the leaf is <b>3:1</b> oversubscribed. With 6 spines (600 Gbps up) it is <b>2:1</b>. If each spine has 32 ports of 100 Gbps, the fabric can hold up to 32 leaves, or 32 x 48 = 1,536 server ports at 25 Gbps.</p></div>
<pre class="out">LEAF1# show ip route 10.20.3.0
Routing entry for 10.20.3.0/24
  Known via "ospf 1", distance 110, metric 3, type intra area
  Routing Descriptor Blocks:
<span class="hl">  * 10.255.1.1, from 10.255.0.3, via HundredGigE1/0/49</span>
<span class="hl">    10.255.2.1, from 10.255.0.3, via HundredGigE1/0/50</span></pre>
<p>Two spines, two equal-cost next hops towards LEAF3's subnet.</p>

<h3>Underlay and overlay</h3>
<p>A fabric has two layers. The <b>underlay</b> is the routed physical network (OSPF, IS-IS or eBGP between leaves and spines) that simply makes every switch's loopback reachable. The <b>overlay</b> builds tenant networks on top, typically <b>VXLAN</b> tunnels between leaves, so a VLAN or subnet can appear on any leaf without stretching spanning tree. In data centres the overlay control plane is usually BGP EVPN.</p>
<p>The same idea came to the campus as <b>SD-Access</b>: a routed underlay (often IS-IS built by LAN automation), <b>LISP</b> as the control plane that tracks where each endpoint is, <b>VXLAN</b> as the data plane, and <b>Scalable Group Tags</b> as the policy plane, managed by Catalyst Center. Its roles are edge nodes (where users attach), border nodes (exits to other networks) and control-plane nodes (the LISP map server). You get routed access for resiliency, yet a subnet can still exist on every edge node. The SD-WAN/SD-Access and LISP/VXLAN modules go deep; here you only need to recognise fabric as a design option.</p>

<h3>WAN and branch designs</h3>
<p>Branches range from a two-person sales office to a thousand-person regional hub, so there is no single branch design. Choose by size and by how much downtime the branch can tolerate:</p>
<table class="cmp"><tr><th>Branch size</th><th>Typical design</th><th>Weak point</th></tr>
<tr><td>Small</td><td>One router or SD-WAN edge, one or two WAN links (for example broadband plus 4G/5G), access switch with integrated services</td><td>Single device</td></tr>
<tr><td>Medium</td><td>Two routers or edges, two transports (MPLS plus internet), FHRP or routing towards a switch stack</td><td>Single switch stack</td></tr>
<tr><td>Large</td><td>Dual edges, dual transports, a small collapsed core or full access-distribution block</td><td>Cost and complexity</td></tr>
</table>
<p>Transports include MPLS L3VPN (provider-managed, SLAs), dedicated or broadband internet with IPsec or DMVPN, and cellular backup. <b>SD-WAN</b> overlays all of them, measures loss, latency and jitter on each, and steers each application to the best path. The <b>internet edge</b> module usually has redundant firewalls, two ISPs and BGP for multihoming.</p>

<div class="warn"><p><b>Common mistakes.</b> Cabling a leaf to only some spines, which breaks the equal-path promise. Connecting two spines together "for redundancy". Giving a branch two routers that both use the same ISP and the same last-mile cable.</p></div>

<div class="exam"><p><b>Exam trap.</b> In spine-leaf, the answer to "how many hops between servers on different leaves" is always leaf-spine-leaf, and the answer to "how do you add bandwidth" is <b>add spines</b>. In SD-Access, LISP is the control plane, VXLAN the data plane and SGT the policy plane.</p></div>

<div class="scn"><h4>Backups at 2 AM</h4><p>A company's new data centre used four leaves and two spines, each leaf with 48 x 25 Gbps server ports and two 100 Gbps uplinks: 6:1 oversubscription. Every night at 2 AM the backup job pulled data from all servers to the storage leaf, and application monitoring showed drops and retransmissions. Interface counters on the leaf uplinks showed output drops, while spine CPU and links looked healthy. The fix needed no redesign: two more spines were added and every leaf got two more uplinks, giving 3:1 and four ECMP paths. The backup window shrank by half.</p><p><b>Lesson:</b> spine-leaf scales out; when leaves run hot on uplinks, add spines rather than bigger boxes.</p></div>

<div class="iv"><p class="q">"Why do data centres use spine-leaf instead of three-tier?"</p><p>Because traffic became mostly east-west. Spine-leaf gives every pair of leaves the same two-hop path, uses routed links with ECMP so no link is blocked, gives predictable latency and scales out by adding spines for bandwidth or leaves for ports. Mention the underlay/overlay split (routed underlay, VXLAN overlay with EVPN) and that SD-Access brings the same model to the campus with LISP and VXLAN.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Spine-leaf: every leaf to every spine; no spine-spine or leaf-leaf links; always leaf-spine-leaf.</li>
<li>Routed links with ECMP; scale out by adding spines (bandwidth) or leaves (ports).</li>
<li>Fabrics use a routed underlay and an overlay (VXLAN with EVPN in the DC, LISP plus VXLAN in SD-Access).</li>
<li>Branch design depends on size and tolerance for downtime: single, dual-edge, or small campus.</li>
<li>SD-WAN overlays MPLS, internet and cellular and picks a path per application.</li>
</ul></div>
`,hi:`
<p>Ek metro rail network jismein ring line aur radial lines ho, uski ek achhi khoobi hai: kisi bhi station se kisi bhi station tak zyada se zyada ek change mein pahunch sakte ho, aur agar ring ka ek segment band ho jaaye, to trains bas doosri direction use karti hain. Iski tulna ek purane tree-shaped bus network se karo jahan har trip pehle central depot jaati hai. Data-centre aur modern campus <b>fabrics</b> metro hain: har edge switch har doosre edge switch se barabar paths ke set ke through theek ek hop door hai. Yeh chapter fabric designs (ENCOR 1.1 "fabric" ko 2-tier aur 3-tier ke saath list karta hai) aur woh WAN aur branch designs cover karta hai jo enterprise ki sites jodte hain.</p>

<h3>Data centre spine-leaf par kyun gaya</h3>
<p>Traditional three-tier data centres <b>north-south</b> traffic ke liye bane the: bahar ke clients andar ke servers se baat karte the. Modern applications kai services mein bati hoti hain jo aapas mein baat karti hain, isliye ab zyada tar traffic <b>east-west</b> hai, server se server. Spanning tree wale three-tier design mein east-west traffic aksar aggregation ya core layer tak chadh kar wapas utarta hai, aadhe links blocked hote hain, aur latency is par depend karti hai ki do servers kahan baithe hain.</p>
<p><b>Spine-leaf</b> (Clos) fabric isse do strict rules se theek karta hai:</p>
<ul>
<li>Har <b>leaf</b> (top-of-rack switch jahan servers, firewalls aur routers judte hain) <b>har spine</b> se judta hai.</li>
<li>Spines kabhi aapas mein nahi judte, aur leaves kabhi aapas mein nahi judte (vPC ya MLAG peers jaise special pairs ko chhodkar).</li>
</ul>
<p>Isliye koi bhi server doosre leaf ke kisi bhi server tak theek <b>leaf → spine → leaf</b> mein pahunchta hai: same number of hops aur predictable latency. Links routed hain aur har spine equal-cost path deta hai, isliye traffic <b>ECMP</b> se failta hai aur kuch block nahi hota.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Spine-leaf fabric">
<rect x="170" y="25" width="110" height="36" rx="6" fill="#fde68a"/><text x="225" y="48" text-anchor="middle" class="svg-ink" font-size="13">Spine 1</text>
<rect x="360" y="25" width="110" height="36" rx="6" fill="#fde68a"/><text x="415" y="48" text-anchor="middle" class="svg-ink" font-size="13">Spine 2</text>
<rect x="30" y="150" width="110" height="36" rx="6" fill="#bae6fd"/><text x="85" y="173" text-anchor="middle" class="svg-ink" font-size="13">Leaf 1</text>
<rect x="190" y="150" width="110" height="36" rx="6" fill="#bae6fd"/><text x="245" y="173" text-anchor="middle" class="svg-ink" font-size="13">Leaf 2</text>
<rect x="350" y="150" width="110" height="36" rx="6" fill="#bae6fd"/><text x="405" y="173" text-anchor="middle" class="svg-ink" font-size="13">Leaf 3</text>
<rect x="510" y="150" width="110" height="36" rx="6" fill="#bbf7d0"/><text x="565" y="173" text-anchor="middle" class="svg-ink" font-size="13">Border leaf</text>
<line x1="225" y1="61" x2="85" y2="150" stroke="#64748b"/><line x1="225" y1="61" x2="245" y2="150" stroke="#64748b"/><line x1="225" y1="61" x2="405" y2="150" stroke="#64748b"/><line x1="225" y1="61" x2="565" y2="150" stroke="#64748b"/>
<line x1="415" y1="61" x2="85" y2="150" stroke="#64748b"/><line x1="415" y1="61" x2="245" y2="150" stroke="#64748b"/><line x1="415" y1="61" x2="405" y2="150" stroke="#64748b"/><line x1="415" y1="61" x2="565" y2="150" stroke="#64748b"/>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">Har leaf har spine tak; routed links; spines par ECMP</text>
</svg><p class="cap">Koi bhi leaf kisi bhi doosre leaf tak kisi bhi spine ke through do hops mein pahunchta hai. Border leaf WAN, internet aur campus se judta hai.</p></div>

<h3>Fabric mein scaling aur oversubscription</h3>
<p>Fabric ko <b>out</b> scale karte hain, up nahi. Zyada server ports chahiye? Ek leaf jodo. Leaves ke beech zyada bandwidth chahiye? Ek spine jodo aur har leaf par ek aur uplink. Limits simple hain: spines ki sankhya har leaf ke uplink ports se capped hai, aur leaves ki sankhya har spine ke ports se.</p>
<div class="eg"><p><b>Worked example.</b> Har leaf mein 25 Gbps ke 48 server ports (1,200 Gbps neeche) aur 100 Gbps ke uplinks hain. 4 spines ke saath (4 x 100 = 400 Gbps upar) leaf <b>3:1</b> oversubscribed hai. 6 spines ke saath (600 Gbps upar) <b>2:1</b>. Agar har spine mein 100 Gbps ke 32 ports hain, to fabric 32 leaves tak rakh sakta hai, yaani 25 Gbps ke 32 x 48 = 1,536 server ports.</p></div>
<pre class="out">LEAF1# show ip route 10.20.3.0
Routing entry for 10.20.3.0/24
  Known via "ospf 1", distance 110, metric 3, type intra area
  Routing Descriptor Blocks:
<span class="hl">  * 10.255.1.1, from 10.255.0.3, via HundredGigE1/0/49</span>
<span class="hl">    10.255.2.1, from 10.255.0.3, via HundredGigE1/0/50</span></pre>
<p>Do spines, LEAF3 ke subnet ki taraf do equal-cost next hops.</p>

<h3>Underlay aur overlay</h3>
<p>Fabric ki do layers hoti hain. <b>Underlay</b> routed physical network hai (leaves aur spines ke beech OSPF, IS-IS ya eBGP) jo bas har switch ka loopback reachable banata hai. <b>Overlay</b> uske upar tenant networks banata hai, aam taur par leaves ke beech <b>VXLAN</b> tunnels, taaki koi VLAN ya subnet spanning tree stretch kiye bina kisi bhi leaf par dikh sake. Data centres mein overlay control plane aam taur par BGP EVPN hota hai.</p>
<p>Yahi idea campus mein <b>SD-Access</b> ki tarah aaya: routed underlay (aksar LAN automation se bana IS-IS), <b>LISP</b> control plane jo track karta hai ki har endpoint kahan hai, <b>VXLAN</b> data plane, aur <b>Scalable Group Tags</b> policy plane, sab Catalyst Center se managed. Iske roles hain edge nodes (jahan users judte hain), border nodes (doosre networks ke exits) aur control-plane nodes (LISP map server). Aapko resiliency ke liye routed access milta hai, phir bhi ek subnet har edge node par ho sakta hai. SD-WAN/SD-Access aur LISP/VXLAN modules gehrai mein jaate hain; yahan aapko sirf fabric ko design option ki tarah pehchanna hai.</p>

<h3>WAN aur branch designs</h3>
<p>Branches do logon ke sales office se hazaar logon ke regional hub tak hoti hain, isliye koi ek branch design nahi hai. Size aur branch kitna downtime jhel sakti hai, uske hisaab se chuno:</p>
<table class="cmp"><tr><th>Branch size</th><th>Typical design</th><th>Kamzor point</th></tr>
<tr><td>Small</td><td>Ek router ya SD-WAN edge, ek ya do WAN links (jaise broadband plus 4G/5G), integrated services wala access switch</td><td>Single device</td></tr>
<tr><td>Medium</td><td>Do routers ya edges, do transports (MPLS plus internet), switch stack ki taraf FHRP ya routing</td><td>Single switch stack</td></tr>
<tr><td>Large</td><td>Dual edges, dual transports, chhota collapsed core ya poora access-distribution block</td><td>Cost aur complexity</td></tr>
</table>
<p>Transports mein MPLS L3VPN (provider-managed, SLAs), IPsec ya DMVPN ke saath dedicated ya broadband internet, aur cellular backup aate hain. <b>SD-WAN</b> in sab ke upar overlay banata hai, har ek par loss, latency aur jitter naapta hai, aur har application ko best path par bhejta hai. <b>Internet edge</b> module mein aam taur par redundant firewalls, do ISPs aur multihoming ke liye BGP hota hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Leaf ko sirf kuch spines se cable karna, jo equal-path ka waada tod deta hai. "Redundancy ke liye" do spines ko aapas mein jodna. Branch ko do routers dena jo dono same ISP aur same last-mile cable use karte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Spine-leaf mein "alag leaves ke servers ke beech kitne hops" ka answer hamesha leaf-spine-leaf hai, aur "bandwidth kaise badhayein" ka answer hai <b>spines jodo</b>. SD-Access mein LISP control plane hai, VXLAN data plane aur SGT policy plane.</p></div>

<div class="scn"><h4>Raat 2 baje ke backups</h4><p>Ek company ke naye data centre mein chaar leaves aur do spines the, har leaf mein 48 x 25 Gbps server ports aur do 100 Gbps uplinks: 6:1 oversubscription. Har raat 2 baje backup job saare servers se storage leaf tak data kheenchta tha, aur application monitoring drops aur retransmissions dikhata tha. Leaf uplinks ke interface counters par output drops the, jabki spine CPU aur links healthy dikhte the. Fix ke liye redesign nahi chahiye tha: do aur spines jode gaye aur har leaf ko do aur uplinks mile, jisse 3:1 aur chaar ECMP paths mile. Backup window aadhi ho gayi.</p><p><b>Seekh:</b> spine-leaf out scale hota hai; jab leaves uplinks par garam chalen, bade boxes ki jagah spines jodo.</p></div>

<div class="iv"><p class="q">"Data centres three-tier ki jagah spine-leaf kyun use karte hain?"</p><p>Kyunki traffic zyada tar east-west ho gaya. Spine-leaf har leaves pair ko same two-hop path deta hai, ECMP ke saath routed links use karta hai taaki koi link block na ho, predictable latency deta hai aur bandwidth ke liye spines ya ports ke liye leaves jodkar out scale hota hai. Underlay/overlay split (routed underlay, EVPN ke saath VXLAN overlay) ka zikr karo aur batao ki SD-Access yahi model LISP aur VXLAN ke saath campus mein laata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Spine-leaf: har leaf har spine tak; spine-spine ya leaf-leaf links nahi; hamesha leaf-spine-leaf.</li>
<li>ECMP ke saath routed links; spines (bandwidth) ya leaves (ports) jodkar out scale karo.</li>
<li>Fabrics routed underlay aur overlay use karte hain (DC mein EVPN ke saath VXLAN, SD-Access mein LISP plus VXLAN).</li>
<li>Branch design size aur downtime tolerance par depend karta hai: single, dual-edge, ya chhota campus.</li>
<li>SD-WAN MPLS, internet aur cellular ke upar overlay banata hai aur har application ke liye path chunta hai.</li>
</ul></div>
`}};export{e as default};