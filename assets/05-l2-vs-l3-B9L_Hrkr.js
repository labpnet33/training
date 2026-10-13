var e={id:`l2-vs-l3`,h:{en:`Layer-2 fabric or Layer-3 fabric?`,hi:`Layer-2 fabric ya Layer-3 fabric?`},body:{en:`
<p>When you move to a new flat in the same city, you want to keep your mobile number. Your friends should still reach you without learning a new number. But the postal system works by area codes: your address must change when you move. Data centers face the same tension. Applications want to keep their IP address wherever they run (Layer-2 thinking), while large networks scale best when addresses follow location (Layer-3 thinking). This chapter compares the ways the industry has tried to have both.</p>

<h3>Why Layer 2 is still needed</h3>
<p>If routing is so robust, why not make every rack its own subnet and forget Layer 2? Because many workloads still expect to share a subnet with peers in other racks:</p>
<ul>
<li><b>VM live migration.</b> A VM keeps its IP and MAC when it moves to another host, so the destination must be in the same Layer-2 segment.</li>
<li><b>Clusters and floating IPs.</b> Many database and firewall clusters move a virtual IP between nodes and announce it with gratuitous ARP. That only works inside one subnet.</li>
<li><b>Legacy and appliance workloads.</b> Old applications with hard-coded addresses, or discovery protocols that use broadcast or link-local multicast.</li>
<li><b>Operational convenience.</b> Server teams like to place a workload anywhere without asking for a new IP.</li>
</ul>
<p>So the question is not "Layer 2 or Layer 3" but "how do we give Layer-2 segments to workloads without building a giant Layer-2 failure domain?"</p>

<h3>Option 1: classic Layer 2 with spanning tree</h3>
<p>Stretch VLANs everywhere and let STP break loops. You already know the problems from chapter 2: blocked links, unequal paths, huge flooding domains. Nobody designs a new fabric this way.</p>

<h3>Option 2: Layer-2 multipath: TRILL and FabricPath (history)</h3>
<p>Around 2010 the industry tried to make Layer 2 behave like Layer 3. Both designs replaced spanning tree inside the fabric with a link-state protocol (<b>IS-IS</b>) so every link could forward with ECMP.</p>
<ul>
<li><b>TRILL</b> (Transparent Interconnection of Lots of Links, IETF RFC 6325) used switches called RBridges and added a TRILL header with a hop count to every frame.</li>
<li><b>Cisco FabricPath</b> ran on Nexus 5500, 6000 and 7000 (with F-series line cards). Each switch had a <b>switch ID</b>; frames were encapsulated with a FabricPath header that carried a TTL; edge switches used <b>conversational MAC learning</b> to keep MAC tables small; up to 16 equal paths were used.</li>
</ul>
<pre class="code"><span class="c">! FabricPath on a Nexus 7000 (historical, for recognition only)</span>
install feature-set fabricpath
feature-set fabricpath
vlan 10
  mode fabricpath
interface Ethernet3/1
  switchport mode fabricpath</pre>
<p>Both solved STP blocking, but both faded. They needed specific hardware, they still relied on <b>flood-and-learn</b> for unknown destinations, they were limited to 4,094 VLANs, and vendors never agreed on one version. Meanwhile, IP networks already had ECMP, huge scale and cheap merchant silicon. You may meet FabricPath in older brownfield sites and in migration projects, and the exam may ask you to recognise it, but new designs use a routed underlay.</p>

<h3>Option 3: pure Layer 3 (routed to the top of rack)</h3>
<p>Every leaf is a router. Each rack gets its own subnet, the leaf is its default gateway, and the leaf advertises the subnet into the fabric routing protocol.</p>
<pre class="code"><span class="c">! LEAF3: gateway for its own rack subnet, advertised into OSPF</span>
feature interface-vlan
vlan 30
interface Vlan30
  no shutdown
  ip address 10.10.3.1/24
  ip router ospf UNDERLAY area 0.0.0.0</pre>
<p>Failure domains are tiny (one rack), there is no STP between switches, and troubleshooting is plain IP routing. Container platforms and cloud-native applications love this model, because they expect IP connectivity rather than a shared subnet, and some even peer BGP directly from the host. The weakness: a VM cannot move to another rack and keep its IP, and cluster floating IPs break.</p>

<h3>Option 4: Layer-3 underlay plus a Layer-2 overlay</h3>
<p>The modern answer combines both. Build a routed fabric (the <b>underlay</b>) exactly as in option 3, but do not put tenant subnets in it. Then let each leaf act as a <b>tunnel endpoint</b> that wraps a server's Ethernet frame inside an IP packet and sends it across the routed fabric to the leaf where the destination lives. That is <b>VXLAN</b>. To the servers, VLAN 10 appears to stretch across any racks you choose; to the fabric, it is only routed IP traffic between loopbacks.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Layer-2 overlay over a routed underlay">
<rect x="10" y="20" width="620" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Overlay: VLAN 10 / VNI 10010 appears on any leaf</text>
<rect x="10" y="80" width="620" height="40" rx="8" fill="#bae6fd"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="13">Underlay: routed /31 links, loopbacks, OSPF, ECMP</text>
<rect x="40" y="150" width="120" height="36" rx="6" fill="#e2e8f0"/><text x="100" y="173" text-anchor="middle" class="svg-ink" font-size="12">VM on LEAF1</text>
<rect x="480" y="150" width="120" height="36" rx="6" fill="#e2e8f0"/><text x="540" y="173" text-anchor="middle" class="svg-ink" font-size="12">VM on LEAF4</text>
<line x1="160" y1="168" x2="480" y2="168" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">same subnet, different racks, no STP in the fabric</text>
</svg><p class="cap">Layer 2 where the workload needs it, Layer 3 everywhere in between.</p></div>
<p>With <b>BGP EVPN</b> as the control plane, leaves learn MAC and IP locations from BGP instead of flooding, and every leaf can act as the default gateway for a VLAN at the same time (the <b>distributed anycast gateway</b>). Chapter 6 explains the underlay/overlay idea in depth.</p>

<table class="cmp"><tr><th>Design</th><th>All links forward</th><th>Failure domain</th><th>L2 anywhere</th><th>Status</th></tr>
<tr><td>L2 with STP</td><td>No</td><td>Large</td><td>Yes</td><td>Legacy</td></tr>
<tr><td>FabricPath / TRILL</td><td>Yes</td><td>Large (flooding)</td><td>Yes</td><td>Legacy</td></tr>
<tr><td>Pure L3 to ToR</td><td>Yes</td><td>One rack</td><td>No</td><td>Cloud-native</td></tr>
<tr><td>L3 underlay + VXLAN overlay</td><td>Yes</td><td>Small</td><td>Yes</td><td>Modern standard</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Saying "spine-leaf means no Layer 2": it means no Layer 2 <i>between switches</i>; servers still get VLANs at the leaf edge. Putting tenant server subnets into the underlay IGP of a VXLAN fabric: the underlay should carry only loopbacks and fabric links. Assuming FabricPath skills transfer directly to VXLAN: the goals are similar, the mechanics are not.</p></div>
<div class="exam"><p><b>Exam tip.</b> FabricPath and TRILL use IS-IS to route at Layer 2 and removed STP from the fabric core; FabricPath uses switch IDs, a TTL and conversational MAC learning. VXLAN gives Layer 2 over a Layer-3 underlay and is the current standard; BGP EVPN is its control plane.</p></div>

<div class="scn"><h4>The cluster that could not fail over</h4><p>A team migrated a two-node database cluster onto a new routed-to-the-rack fabric. Node 1 sat in rack 4 (10.10.4.0/24), node 2 in rack 9 (10.10.9.0/24). During a failover test the cluster virtual IP 10.10.4.50 moved to node 2, which sent a gratuitous ARP in rack 9. Nobody outside rack 9 could reach the VIP, because the fabric routed 10.10.4.0/24 to LEAF4. The engineer confirmed with <code>show ip route 10.10.4.50</code> on a spine, which pointed only to LEAF4. The fix was to give the cluster a shared VLAN extended over a VXLAN EVPN overlay to both racks, and in the longer term to use the database's multi-subnet listener mode.</p><p><b>Lesson:</b> check what each workload expects from Layer 2 before choosing a pure Layer-3 design; overlays exist exactly for these cases.</p></div>

<div class="iv"><p class="q">"If routed fabrics are so good, why do data centers still need Layer 2?"</p><p>Strong answer: VM live migration keeps the IP and MAC, clusters move floating IPs with gratuitous ARP, and legacy applications depend on a shared subnet. Stretching VLANs with STP creates large failure domains, and FabricPath/TRILL were proprietary or never widely adopted. The modern solution is a routed Layer-3 underlay with a VXLAN overlay and BGP EVPN control plane, giving Layer-2 segments where needed with routed robustness underneath. Mention that cloud-native workloads can often run on pure Layer 3.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layer 2 is still needed for VM mobility, cluster floating IPs and legacy applications.</li>
<li>Stretching Layer 2 with STP creates large failure domains and blocked links.</li>
<li>FabricPath and TRILL routed Layer 2 with IS-IS but are legacy today.</li>
<li>Pure Layer 3 to the rack gives tiny failure domains but no subnet mobility.</li>
<li>The modern standard is a routed underlay with a VXLAN overlay (BGP EVPN control plane).</li>
</ul></div>
`,hi:`
<p>Jab aap usi shehar mein naye flat mein shift hote ho, to aap apna mobile number same rakhna chahte ho. Aapke dost naya number seekhe bina aapko call kar sakein. Lekin postal system area codes par chalta hai: shift hone par aapka address badalna hi padta hai. Data centers bhi yahi khinchaav jhelte hain. Applications chahti hain ki woh jahan bhi chalein unka IP address same rahe (Layer-2 soch), jabki bade networks sabse achha tab scale karte hain jab addresses location ke hisaab se hon (Layer-3 soch). Yeh chapter un tareekon ko compare karta hai jinse industry ne dono ek saath paane ki koshish ki.</p>

<h3>Layer 2 ab bhi kyun chahiye</h3>
<p>Agar routing itni robust hai, to har rack ko apna subnet bana kar Layer 2 ko bhool kyun na jaayein? Kyunki bahut saare workloads ab bhi dusre racks ke peers ke saath ek subnet share karne ki umeed rakhte hain:</p>
<ul>
<li><b>VM live migration.</b> VM dusre host par move hote hue apna IP aur MAC same rakhta hai, isliye destination same Layer-2 segment mein hona chahiye.</li>
<li><b>Clusters aur floating IPs.</b> Bahut saare database aur firewall clusters ek virtual IP ko nodes ke beech move karte hain aur gratuitous ARP se announce karte hain. Yeh sirf ek subnet ke andar kaam karta hai.</li>
<li><b>Legacy aur appliance workloads.</b> Hard-coded addresses wali purani applications, ya discovery protocols jo broadcast ya link-local multicast use karte hain.</li>
<li><b>Operational convenience.</b> Server teams chahti hain ki naya IP maange bina workload ko kahin bhi rakh sakein.</li>
</ul>
<p>To sawaal "Layer 2 ya Layer 3" nahi hai, balki "giant Layer-2 failure domain banaye bina workloads ko Layer-2 segments kaise dein?" hai.</p>

<h3>Option 1: spanning tree ke saath classic Layer 2</h3>
<p>VLANs ko har jagah stretch karo aur STP ko loops todne do. Iski problems aap chapter 2 se jaante ho: blocked links, unequal paths, bade flooding domains. Koi bhi naya fabric aise design nahi karta.</p>

<h3>Option 2: Layer-2 multipath: TRILL aur FabricPath (history)</h3>
<p>2010 ke aas-paas industry ne Layer 2 ko Layer 3 jaisa behave karwane ki koshish ki. Dono designs ne fabric ke andar spanning tree ko ek link-state protocol (<b>IS-IS</b>) se replace kiya taaki har link ECMP ke saath forward kar sake.</p>
<ul>
<li><b>TRILL</b> (Transparent Interconnection of Lots of Links, IETF RFC 6325) RBridges naam ke switches use karta tha aur har frame mein hop count wala TRILL header jodta tha.</li>
<li><b>Cisco FabricPath</b> Nexus 5500, 6000 aur 7000 (F-series line cards ke saath) par chalta tha. Har switch ka ek <b>switch ID</b> hota tha; frames ek FabricPath header ke saath encapsulate hote the jismein TTL hota tha; edge switches MAC tables chhoti rakhne ke liye <b>conversational MAC learning</b> use karte the; 16 tak equal paths use hote the.</li>
</ul>
<pre class="code"><span class="c">! Nexus 7000 par FabricPath (historical, sirf pehchanne ke liye)</span>
install feature-set fabricpath
feature-set fabricpath
vlan 10
  mode fabricpath
interface Ethernet3/1
  switchport mode fabricpath</pre>
<p>Dono ne STP blocking solve ki, lekin dono fade ho gaye. Unhe specific hardware chahiye tha, woh unknown destinations ke liye ab bhi <b>flood-and-learn</b> par depend the, 4,094 VLANs tak limited the, aur vendors kabhi ek version par agree nahi hue. Us beech IP networks ke paas pehle se ECMP, bahut bada scale aur sasta merchant silicon tha. FabricPath aapko purani brownfield sites aur migration projects mein mil sakta hai, aur exam aapse ise pehchanne ko keh sakta hai, lekin naye designs routed underlay use karte hain.</p>

<h3>Option 3: pure Layer 3 (top of rack tak routed)</h3>
<p>Har leaf ek router hai. Har rack ko apna subnet milta hai, leaf uska default gateway hai, aur leaf us subnet ko fabric routing protocol mein advertise karta hai.</p>
<pre class="code"><span class="c">! LEAF3: apne rack subnet ka gateway, OSPF mein advertise kiya hua</span>
feature interface-vlan
vlan 30
interface Vlan30
  no shutdown
  ip address 10.10.3.1/24
  ip router ospf UNDERLAY area 0.0.0.0</pre>
<p>Failure domains bahut chhote hain (ek rack), switches ke beech STP nahi hai, aur troubleshooting simple IP routing hai. Container platforms aur cloud-native applications ko yeh model pasand hai, kyunki woh shared subnet ki jagah IP connectivity expect karti hain, aur kuch to host se seedhe BGP peer karti hain. Kamzori: VM dusre rack mein move hokar apna IP nahi rakh sakta, aur cluster floating IPs toot jaate hain.</p>

<h3>Option 4: Layer-3 underlay plus Layer-2 overlay</h3>
<p>Modern jawab dono ko jodta hai. Ek routed fabric (<b>underlay</b>) bilkul option 3 ki tarah banao, lekin usmein tenant subnets mat daalo. Phir har leaf ko ek <b>tunnel endpoint</b> banne do jo server ke Ethernet frame ko ek IP packet mein lapet kar routed fabric ke paar us leaf tak bhejta hai jahan destination rehta hai. Yahi <b>VXLAN</b> hai. Servers ko lagta hai ki VLAN 10 aapke chune hue kisi bhi racks tak stretch hai; fabric ke liye yeh sirf loopbacks ke beech routed IP traffic hai.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Routed underlay ke upar Layer-2 overlay">
<rect x="10" y="20" width="620" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Overlay: VLAN 10 / VNI 10010 kisi bhi leaf par dikhta hai</text>
<rect x="10" y="80" width="620" height="40" rx="8" fill="#bae6fd"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="13">Underlay: routed /31 links, loopbacks, OSPF, ECMP</text>
<rect x="40" y="150" width="120" height="36" rx="6" fill="#e2e8f0"/><text x="100" y="173" text-anchor="middle" class="svg-ink" font-size="12">LEAF1 par VM</text>
<rect x="480" y="150" width="120" height="36" rx="6" fill="#e2e8f0"/><text x="540" y="173" text-anchor="middle" class="svg-ink" font-size="12">LEAF4 par VM</text>
<line x1="160" y1="168" x2="480" y2="168" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">same subnet, alag racks, fabric mein STP nahi</text>
</svg><p class="cap">Jahan workload ko chahiye wahan Layer 2, beech mein har jagah Layer 3.</p></div>
<p>Control plane ke roop mein <b>BGP EVPN</b> ke saath leaves flooding ki jagah BGP se MAC aur IP locations seekhte hain, aur har leaf ek hi samay par ek VLAN ka default gateway ban sakta hai (<b>distributed anycast gateway</b>). Chapter 6 underlay/overlay idea ko gehraai se samjhata hai.</p>

<table class="cmp"><tr><th>Design</th><th>Saare links forward</th><th>Failure domain</th><th>L2 kahin bhi</th><th>Status</th></tr>
<tr><td>STP ke saath L2</td><td>Nahi</td><td>Bada</td><td>Haan</td><td>Legacy</td></tr>
<tr><td>FabricPath / TRILL</td><td>Haan</td><td>Bada (flooding)</td><td>Haan</td><td>Legacy</td></tr>
<tr><td>ToR tak pure L3</td><td>Haan</td><td>Ek rack</td><td>Nahi</td><td>Cloud-native</td></tr>
<tr><td>L3 underlay + VXLAN overlay</td><td>Haan</td><td>Chhota</td><td>Haan</td><td>Modern standard</td></tr></table>

<div class="warn"><p><b>Common galtiyan.</b> Yeh kehna ki "spine-leaf ka matlab koi Layer 2 nahi": iska matlab hai <i>switches ke beech</i> koi Layer 2 nahi; servers ko leaf edge par ab bhi VLANs milte hain. VXLAN fabric ke underlay IGP mein tenant server subnets daalna: underlay sirf loopbacks aur fabric links le jaaye. Yeh maanna ki FabricPath skills seedhe VXLAN par transfer hoti hain: goals milte-julte hain, mechanics nahi.</p></div>
<div class="exam"><p><b>Exam tip.</b> FabricPath aur TRILL Layer 2 par route karne ke liye IS-IS use karte hain aur fabric core se STP hata dete hain; FabricPath switch IDs, TTL aur conversational MAC learning use karta hai. VXLAN Layer-3 underlay ke upar Layer 2 deta hai aur current standard hai; BGP EVPN uska control plane hai.</p></div>

<div class="scn"><h4>Cluster jo fail over nahi kar paaya</h4><p>Ek team ne do-node database cluster ko naye routed-to-the-rack fabric par migrate kiya. Node 1 rack 4 (10.10.4.0/24) mein tha, node 2 rack 9 (10.10.9.0/24) mein. Failover test ke dauraan cluster virtual IP 10.10.4.50 node 2 par gaya, jisne rack 9 mein gratuitous ARP bheja. Rack 9 ke bahar koi bhi VIP tak nahi pahunch paaya, kyunki fabric 10.10.4.0/24 ko LEAF4 par route karta tha. Engineer ne ek spine par <code>show ip route 10.10.4.50</code> se confirm kiya, jo sirf LEAF4 ki taraf point karta tha. Fix tha cluster ko ek shared VLAN dena jo VXLAN EVPN overlay par dono racks tak extended ho, aur long term mein database ka multi-subnet listener mode use karna.</p><p><b>Seekh:</b> pure Layer-3 design chunne se pehle check karo ki har workload Layer 2 se kya expect karta hai; overlays bilkul inhi cases ke liye hain.</p></div>

<div class="iv"><p class="q">"Agar routed fabrics itne achhe hain, to data centers ko ab bhi Layer 2 kyun chahiye?"</p><p>Strong answer: VM live migration IP aur MAC same rakhta hai, clusters gratuitous ARP se floating IPs move karte hain, aur legacy applications shared subnet par depend karti hain. STP ke saath VLANs stretch karne se bade failure domains bante hain, aur FabricPath/TRILL proprietary the ya kabhi widely adopt nahi hue. Modern solution routed Layer-3 underlay ke saath VXLAN overlay aur BGP EVPN control plane hai, jo neeche routed robustness ke saath jahan zaroorat ho wahan Layer-2 segments deta hai. Yeh bhi batao ki cloud-native workloads aksar pure Layer 3 par chal sakte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layer 2 ab bhi VM mobility, cluster floating IPs aur legacy applications ke liye chahiye.</li>
<li>STP ke saath Layer 2 stretch karne se bade failure domains aur blocked links bante hain.</li>
<li>FabricPath aur TRILL ne IS-IS se Layer 2 route kiya lekin aaj legacy hain.</li>
<li>Rack tak pure Layer 3 bahut chhote failure domains deta hai lekin subnet mobility nahi.</li>
<li>Modern standard hai routed underlay ke saath VXLAN overlay (BGP EVPN control plane).</li>
</ul></div>
`}};export{e as default};