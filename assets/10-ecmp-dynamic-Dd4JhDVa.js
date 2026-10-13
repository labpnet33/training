var e={id:`ecmp-dynamic`,h:{en:`ECMP, ECMP zones, dual-ISP designs and dynamic routing on the firewall`,hi:`ECMP, ECMP zones, dual-ISP designs aur firewall par dynamic routing`},body:{en:`
<p>A supermarket with two checkout counters can use the second one only when the first breaks down, or open both and send every second customer to the other counter. Once both are open, the manager must also accept that a customer who queued at counter 1 may pay at counter 2. That is the difference between <b>active/standby</b> exits (the route tracking of chapter 9) and <b>load sharing</b> with <b>ECMP</b>, and the "pay at another counter" rule is what an <b>ECMP zone</b> adds.</p>

<h3>ECMP on one interface</h3>
<p><b>Equal-cost multipath (ECMP)</b> means several routes to the same destination with the same distance and metric are installed together. The ASA supports up to 8 equal-cost paths and chooses one per flow with a hash of the source and destination IP, so packets of one flow stay on one path. If the next hops are on the <b>same</b> interface, this works out of the box.</p>

<h3>ECMP across interfaces needs a zone</h3>
<p>In a dual-ISP design the two next hops are on <b>different</b> interfaces. By default the ASA refuses the second equal-cost route:</p>
<pre class="out">NK-ASA(config)# route backup 0.0.0.0 0.0.0.0 198.51.100.1
<span class="hl">ERROR: Cannot add route entry, possible conflict with existing routes.</span></pre>
<p>The reason is state: a connection built out of <code>outside</code> expects its return traffic on <code>outside</code>. A <b>traffic zone</b> (called an <b>ECMP zone</b> on Threat Defense) groups interfaces so the ASA treats them as one for connection purposes: return traffic may arrive on any member, and if one member fails, its connections move to another member without being dropped. Once both interfaces are in the zone, the second route is accepted.</p>
<pre class="code">zone ISPS
interface GigabitEthernet0/0
 zone-member ISPS
interface GigabitEthernet0/3
 zone-member ISPS
route outside 0.0.0.0 0.0.0.0 203.0.113.1
route backup  0.0.0.0 0.0.0.0 198.51.100.1</pre>
<pre class="out">NK-ASA# show zone
Zone: ISPS ecmp
  Security-level: 0
  Zone member(s): 2
    backup                GigabitEthernet0/3
    outside               GigabitEthernet0/0

NK-ASA# show route | begin Gateway
Gateway of last resort is 203.0.113.1 to network 0.0.0.0
<span class="hl">S*       0.0.0.0 0.0.0.0 [1/0] via 203.0.113.1, outside</span>
<span class="hl">                         [1/0] via 198.51.100.1, backup</span></pre>
<p>Rules for zones: all members must have the <b>same security level</b>; an interface belongs to one zone; zones are a <b>routed-mode</b> feature; NAT still needs a rule per egress interface so each flow is translated to the address of the ISP it leaves through. On Threat Defense you configure this under the device's Routing, <b>ECMP</b>, by adding an ECMP zone with its interfaces.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Three dual-ISP designs">
<rect x="15" y="20" width="195" height="170" rx="10" fill="#bae6fd"/><text x="112" y="45" text-anchor="middle" class="svg-ink" font-size="14">Active/standby</text>
<text x="112" y="72" text-anchor="middle" class="svg-muted" font-size="12">tracked route AD 1</text><text x="112" y="92" text-anchor="middle" class="svg-muted" font-size="12">floating route AD 254</text><text x="112" y="120" text-anchor="middle" class="svg-ink" font-size="12">ISP2 idle until failure</text><text x="112" y="150" text-anchor="middle" class="svg-accent" font-size="12">simple, cheap backup</text>
<rect x="222" y="20" width="195" height="170" rx="10" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">ECMP load share</text>
<text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="12">zone ISPS</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">2 equal routes</text><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="12">flows hashed per IP pair</text><text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">uses both links</text>
<rect x="430" y="20" width="195" height="170" rx="10" fill="#ddd6fe"/><text x="527" y="45" text-anchor="middle" class="svg-ink" font-size="14">Policy-based</text>
<text x="527" y="72" text-anchor="middle" class="svg-muted" font-size="12">route-map per source</text><text x="527" y="92" text-anchor="middle" class="svg-muted" font-size="12">or application</text><text x="527" y="120" text-anchor="middle" class="svg-ink" font-size="12">guests via ISP2</text><text x="527" y="150" text-anchor="middle" class="svg-accent" font-size="12">business intent</text>
<text x="320" y="222" text-anchor="middle" class="svg-ink" font-size="12">all three need NAT per exit; tracking can be added to any of them</text>
</svg><p class="cap">Three ways to use two internet providers.</p></div>

<h3>Policy-based routing</h3>
<p>Sometimes you want a <i>choice</i>, not a hash: guest Wi-Fi via the cheap provider, payroll via the reliable one. The ASA supports <b>policy-based routing (PBR)</b> with a route-map applied to the ingress interface:</p>
<pre class="code">access-list GUEST-NET extended permit ip 10.0.20.0 255.255.255.0 any
route-map GUEST-VIA-ISP2 permit 10
 match ip address GUEST-NET
 set ip next-hop 198.51.100.1
interface GigabitEthernet0/1.20
 policy-route route-map GUEST-VIA-ISP2</pre>
<p>Recent Threat Defense releases extend PBR with application-aware matching and path monitoring (jitter, latency, loss), which gives SD-WAN-style exit choice at a branch.</p>

<h3>Dynamic routing on the firewall</h3>
<p>In routed mode the ASA runs <b>OSPFv2, OSPFv3, EIGRP, BGP, RIP and IS-IS</b>; Threat Defense supports OSPF and BGP natively in the Management Center, plus other protocols depending on release. Typical uses:</p>
<ul>
<li>Advertise a default route into the inside network so core routers learn the exit: <code>router ospf 1</code>, <code>network 10.0.1.0 255.255.255.0 area 0</code>, <code>default-information originate</code>.</li>
<li>Learn internal prefixes instead of maintaining dozens of static routes.</li>
<li>Run <b>BGP with both providers</b> when you own provider-independent address space; failover then comes from BGP itself.</li>
</ul>
<p>In transparent mode the firewall does not take part in routing, but it can pass routing protocols between routers on both sides (chapter 5).</p>

<div class="eg"><p><b>Worked example.</b> With zone ISPS and two equal default routes, PC1 (10.0.1.10) opens sessions to 8.8.8.8 and to 192.0.2.80. The hash of 10.0.1.10 and 8.8.8.8 selects outside; the hash of 10.0.1.10 and 192.0.2.80 selects backup. The first flow is translated to 203.0.113.2, the second to 198.51.100.2. If Gi0/3 fails, the second flow's connection moves to outside inside the zone; the server sees a new source address, so for a TCP session behind PAT the application usually has to reconnect.</p></div>

<div class="warn"><p><b>Common mistake.</b> Adding ECMP across ISPs but leaving NAT for one exit only. Flows hashed to the second ISP leave with private source addresses and die. Every egress interface in the zone needs its own NAT rule.</p></div>

<div class="exam"><p><b>Exam trap.</b> "The ASA rejects an equal-cost route on a second interface" is solved by a <b>traffic zone</b>, not by transparent mode, failover or a higher distance (that makes it a floating route, not ECMP). Zone members must share a security level.</p></div>

<div class="scn"><h4>Half the SaaS logins fail</h4><p>After enabling ECMP across two ISPs, users reported that a SaaS application kept logging them out. The provider tied sessions to the client's public IP. Because the hash uses source and destination IP, most flows to one server stayed on one ISP, but the application used several server addresses, so one user appeared from two public IPs. The team kept ECMP for general browsing and used PBR to send that SaaS provider's address range always via ISP1.</p><p><b>Lesson:</b> load sharing changes the public source address per flow; applications that pin sessions to an IP need a deterministic path.</p></div>

<div class="iv"><p class="q">"How do you load-balance across two ISPs on an ASA, and what do you have to watch?"</p><p>Put both ISP interfaces into one traffic zone, add equal-cost default routes via each ISP, and add NAT per egress interface. The ASA hashes flows by source and destination IP. Watch for: same security level on members, applications sensitive to changing public IPs, uneven load because of the hash, and detection of an upstream failure, which ECMP alone does not do (add tracking or use BGP). Alternatives are active/standby with tracking or PBR for intent-based choice.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ECMP installs up to 8 equal-cost routes and hashes flows by source and destination IP.</li>
<li>Equal-cost routes on different interfaces require a traffic (ECMP) zone; members need the same security level.</li>
<li>Zones allow asymmetric return traffic and move connections to a surviving member.</li>
<li>Dual-ISP choices: active/standby with tracking, ECMP load sharing, or PBR; NAT per exit in every case.</li>
<li>Routed firewalls run OSPF, EIGRP, BGP and more; transparent firewalls only pass routing protocols through.</li>
</ul></div>
`,hi:`
<p>Do checkout counters wala supermarket doosra counter sirf tab use kar sakta hai jab pehla kharab ho, ya dono khol kar har doosre customer ko doosre counter par bhej sakta hai. Dono khulne ke baad manager ko yeh bhi maanna padta hai ki counter 1 par line mein laga customer counter 2 par pay kar sakta hai. Yahi fark hai <b>active/standby</b> exits (chapter 9 ki route tracking) aur <b>ECMP</b> ke saath <b>load sharing</b> mein, aur "doosre counter par pay karo" wala rule <b>ECMP zone</b> jodta hai.</p>

<h3>Ek interface par ECMP</h3>
<p><b>Equal-cost multipath (ECMP)</b> ka matlab hai ek hi destination ke kai routes jinki distance aur metric same hai, saath mein install hote hain. ASA 8 tak equal-cost paths support karta hai aur source aur destination IP ke hash se har flow ke liye ek chunta hai, isliye ek flow ke packets ek path par rehte hain. Agar next hops <b>same</b> interface par hain, to yeh seedha chalta hai.</p>

<h3>Interfaces ke paar ECMP ko zone chahiye</h3>
<p>Dual-ISP design mein dono next hops <b>alag</b> interfaces par hote hain. Default mein ASA doosra equal-cost route mana kar deta hai:</p>
<pre class="out">NK-ASA(config)# route backup 0.0.0.0 0.0.0.0 198.51.100.1
<span class="hl">ERROR: Cannot add route entry, possible conflict with existing routes.</span></pre>
<p>Wajah state hai: <code>outside</code> se bana connection apna return traffic <code>outside</code> par hi expect karta hai. <b>Traffic zone</b> (Threat Defense par <b>ECMP zone</b> kehte hain) interfaces ko group karta hai taaki ASA connection ke liye unhe ek maane: return traffic kisi bhi member par aa sakta hai, aur ek member fail ho to uske connections bina drop hue doosre member par chale jaate hain. Dono interfaces zone mein hone ke baad doosra route accept ho jaata hai.</p>
<pre class="code">zone ISPS
interface GigabitEthernet0/0
 zone-member ISPS
interface GigabitEthernet0/3
 zone-member ISPS
route outside 0.0.0.0 0.0.0.0 203.0.113.1
route backup  0.0.0.0 0.0.0.0 198.51.100.1</pre>
<pre class="out">NK-ASA# show zone
Zone: ISPS ecmp
  Security-level: 0
  Zone member(s): 2
    backup                GigabitEthernet0/3
    outside               GigabitEthernet0/0

NK-ASA# show route | begin Gateway
Gateway of last resort is 203.0.113.1 to network 0.0.0.0
<span class="hl">S*       0.0.0.0 0.0.0.0 [1/0] via 203.0.113.1, outside</span>
<span class="hl">                         [1/0] via 198.51.100.1, backup</span></pre>
<p>Zones ke rules: saare members ka <b>same security level</b> hona chahiye; ek interface ek zone mein hota hai; zones <b>routed-mode</b> feature hain; NAT ko ab bhi har egress interface ka rule chahiye taaki har flow us ISP ke address mein translate ho jisse woh nikalta hai. Threat Defense par ise device ke Routing, <b>ECMP</b> mein configure karte ho, interfaces ke saath ECMP zone add karke.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Teen dual-ISP designs">
<rect x="15" y="20" width="195" height="170" rx="10" fill="#bae6fd"/><text x="112" y="45" text-anchor="middle" class="svg-ink" font-size="14">Active/standby</text>
<text x="112" y="72" text-anchor="middle" class="svg-muted" font-size="12">tracked route AD 1</text><text x="112" y="92" text-anchor="middle" class="svg-muted" font-size="12">floating route AD 254</text><text x="112" y="120" text-anchor="middle" class="svg-ink" font-size="12">failure tak ISP2 idle</text><text x="112" y="150" text-anchor="middle" class="svg-accent" font-size="12">simple, sasta backup</text>
<rect x="222" y="20" width="195" height="170" rx="10" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">ECMP load share</text>
<text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="12">zone ISPS</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">2 equal routes</text><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="12">flows IP pair se hash</text><text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">dono links use</text>
<rect x="430" y="20" width="195" height="170" rx="10" fill="#ddd6fe"/><text x="527" y="45" text-anchor="middle" class="svg-ink" font-size="14">Policy-based</text>
<text x="527" y="72" text-anchor="middle" class="svg-muted" font-size="12">source ke hisaab se route-map</text><text x="527" y="92" text-anchor="middle" class="svg-muted" font-size="12">ya application</text><text x="527" y="120" text-anchor="middle" class="svg-ink" font-size="12">guests ISP2 se</text><text x="527" y="150" text-anchor="middle" class="svg-accent" font-size="12">business intent</text>
<text x="320" y="222" text-anchor="middle" class="svg-ink" font-size="12">teeno ko har exit ka NAT chahiye; tracking kisi mein bhi jod sakte ho</text>
</svg><p class="cap">Do internet providers use karne ke teen tareeke.</p></div>

<h3>Policy-based routing</h3>
<p>Kabhi aapko hash nahi, <i>choice</i> chahiye: guest Wi-Fi saste provider se, payroll reliable wale se. ASA ingress interface par lagaye route-map ke saath <b>policy-based routing (PBR)</b> support karta hai:</p>
<pre class="code">access-list GUEST-NET extended permit ip 10.0.20.0 255.255.255.0 any
route-map GUEST-VIA-ISP2 permit 10
 match ip address GUEST-NET
 set ip next-hop 198.51.100.1
interface GigabitEthernet0/1.20
 policy-route route-map GUEST-VIA-ISP2</pre>
<p>Recent Threat Defense releases PBR ko application-aware matching aur path monitoring (jitter, latency, loss) ke saath badhati hain, jo branch par SD-WAN jaisa exit choice deta hai.</p>

<h3>Firewall par dynamic routing</h3>
<p>Routed mode mein ASA <b>OSPFv2, OSPFv3, EIGRP, BGP, RIP aur IS-IS</b> chalata hai; Threat Defense Management Center mein OSPF aur BGP natively support karta hai, plus release ke hisaab se doosre protocols. Typical uses:</p>
<ul>
<li>Inside network mein default route advertise karo taaki core routers exit seekhein: <code>router ospf 1</code>, <code>network 10.0.1.0 255.255.255.0 area 0</code>, <code>default-information originate</code>.</li>
<li>Darjanon static routes maintain karne ke bajaye internal prefixes seekho.</li>
<li>Jab aapke paas provider-independent address space ho to <b>dono providers ke saath BGP</b> chalao; tab failover khud BGP se aata hai.</li>
</ul>
<p>Transparent mode mein firewall routing mein hissa nahi leta, lekin dono taraf ke routers ke beech routing protocols pass kar sakta hai (chapter 5).</p>

<div class="eg"><p><b>Worked example.</b> Zone ISPS aur do equal default routes ke saath, PC1 (10.0.1.10) 8.8.8.8 aur 192.0.2.80 ke sessions kholta hai. 10.0.1.10 aur 8.8.8.8 ka hash outside chunta hai; 10.0.1.10 aur 192.0.2.80 ka hash backup chunta hai. Pehla flow 203.0.113.2 mein translate hota hai, doosra 198.51.100.2 mein. Agar Gi0/3 fail ho, doosre flow ka connection zone ke andar outside par chala jaata hai; server ko naya source address dikhta hai, isliye PAT ke peeche TCP session mein application ko aam taur par reconnect karna padta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> ISPs ke paar ECMP jodna lekin NAT sirf ek exit ke liye chhodna. Doosre ISP par hash hue flows private source addresses ke saath nikalte hain aur mar jaate hain. Zone ke har egress interface ko apna NAT rule chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> "ASA doosre interface par equal-cost route mana karta hai" ka hal <b>traffic zone</b> hai, transparent mode, failover ya zyada distance nahi (woh use floating route banata hai, ECMP nahi). Zone members ka security level same hona chahiye.</p></div>

<div class="scn"><h4>Aadhe SaaS logins fail</h4><p>Do ISPs ke paar ECMP enable karne ke baad users ne report kiya ki ek SaaS application unhe baar baar log out karti thi. Provider sessions ko client ke public IP se jodta tha. Kyunki hash source aur destination IP use karta hai, ek server ke zyadatar flows ek ISP par rahe, lekin application kai server addresses use karti thi, isliye ek user do public IPs se aata dikhta tha. Team ne general browsing ke liye ECMP rakha aur us SaaS provider ki address range ko hamesha ISP1 se bhejne ke liye PBR use kiya.</p><p><b>Seekh:</b> load sharing har flow ka public source address badalta hai; jo applications session ko IP se pin karti hain unhe deterministic path chahiye.</p></div>

<div class="iv"><p class="q">"ASA par do ISPs ke beech load-balance kaise karoge, aur kya dhyaan rakhna padega?"</p><p>Dono ISP interfaces ko ek traffic zone mein daalo, har ISP ke through equal-cost default routes jodo, aur har egress interface ka NAT jodo. ASA flows ko source aur destination IP se hash karta hai. Dhyaan do: members ka same security level, badalte public IPs se sensitive applications, hash ki wajah se uneven load, aur upstream failure detection, jo akela ECMP nahi karta (tracking jodo ya BGP use karo). Alternatives hain tracking ke saath active/standby ya intent-based choice ke liye PBR.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ECMP 8 tak equal-cost routes install karta hai aur flows ko source aur destination IP se hash karta hai.</li>
<li>Alag interfaces par equal-cost routes ko traffic (ECMP) zone chahiye; members ka same security level hona chahiye.</li>
<li>Zones asymmetric return traffic allow karte hain aur connections ko bache hue member par le jaate hain.</li>
<li>Dual-ISP choices: tracking ke saath active/standby, ECMP load sharing, ya PBR; har case mein har exit ka NAT.</li>
<li>Routed firewalls OSPF, EIGRP, BGP aur zyada chalate hain; transparent firewalls sirf routing protocols pass karte hain.</li>
</ul></div>
`}};export{e as default};