var e={id:`routing-fundamentals`,h:{en:`Routing fundamentals refresher`,hi:`Routing fundamentals refresher`},body:{en:`
<p>Imagine you have three navigation apps on your phone. For a trip you trust them in a fixed order: the official one first, then a popular one, then a random one (that trust ranking is <b>administrative distance</b>). Each app also scores its own routes by time or distance (that score is the <b>metric</b>). And when you are looking for an exact address, "Tower B, 4th floor" beats "somewhere in Sector 18" (that is <b>longest prefix match</b>). A router makes exactly these three decisions, in a strict order. Most ENCOR routing questions are really questions about this order.</p>

<h3>How a router chooses, step by step</h3>
<ol>
<li><b>Building the RIB, same prefix and length from different sources:</b> the lowest <b>administrative distance</b> wins.</li>
<li><b>Same prefix from the same protocol:</b> the lowest <b>metric</b> wins; equal metrics give <b>ECMP</b> (equal-cost multipath, OSPF and EIGRP install up to 4 paths by default, tunable with <code>maximum-paths</code>).</li>
<li><b>Forwarding a packet:</b> among all RIB entries that contain the destination, the <b>longest prefix</b> wins, regardless of AD or metric.</li>
</ol>
<p>Step 3 surprises people: a /24 learned by RIP (AD 120) beats a /16 learned by OSPF (AD 110) for a destination inside the /24, because they are different prefixes and both are installed.</p>

<table class="cmp"><tr><th>Source</th><th>AD</th><th>Source</th><th>AD</th></tr>
<tr><td>Connected</td><td>0</td><td>OSPF</td><td>110</td></tr>
<tr><td>Static</td><td>1</td><td>IS-IS</td><td>115</td></tr>
<tr><td>EIGRP summary</td><td>5</td><td>RIP</td><td>120</td></tr>
<tr><td>eBGP</td><td>20</td><td>EIGRP external</td><td>170</td></tr>
<tr><td>EIGRP internal</td><td>90</td><td>iBGP</td><td>200</td></tr>
<tr><td colspan="2"></td><td>Unknown / unusable</td><td>255</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Longest prefix match">
<text x="20" y="22" class="svg-ink" font-size="13">Destination 10.10.20.10</text>
<text x="20" y="62" class="svg-ink" font-size="13">0.0.0.0/0 via WAN1</text><rect x="210" y="46" width="4" height="24" fill="#e2e8f0"/><text x="225" y="63" class="svg-muted" font-size="12">0 bits match</text>
<text x="20" y="102" class="svg-ink" font-size="13">10.0.0.0/8 to Null0</text><rect x="210" y="86" width="100" height="24" fill="#bae6fd"/><text x="320" y="103" class="svg-muted" font-size="12">8 bits</text>
<text x="20" y="142" class="svg-ink" font-size="13">10.10.0.0/16 via CORE2</text><rect x="210" y="126" width="200" height="24" fill="#ddd6fe"/><text x="420" y="143" class="svg-muted" font-size="12">16 bits</text>
<text x="20" y="182" class="svg-ink" font-size="13">10.10.20.0/24 via CORE1</text><rect x="210" y="166" width="300" height="24" fill="#bbf7d0"/><text x="520" y="183" class="svg-accent" font-size="12">24 bits: wins</text>
<text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="12">All four contain the destination; the most specific one is used</text>
</svg><p class="cap">Longest prefix match is decided per packet, after AD and metric have already chosen what is in the RIB.</p></div>

<h3>Metrics differ by protocol</h3>
<ul>
<li><b>OSPF</b>: cost = reference bandwidth / interface bandwidth. The default reference is 100 Mbps, so 100M, 1G and 10G links all cost 1. Set <code>auto-cost reference-bandwidth 100000</code> (in Mbps) on every router so that 10G = 10 and 1G = 100.</li>
<li><b>EIGRP</b>: a composite of bandwidth and delay by default (K1 and K3), with optional load and reliability.</li>
<li><b>BGP</b>: not a metric but a list of path attributes (weight, local preference, AS path length, origin, MED and more) compared in order.</li>
<li><b>RIP</b>: hop count, maximum 15.</li>
</ul>

<h3>Static routes you must master</h3>
<p>A static route can point to a next-hop IP (recursive lookup needed), an exit interface (fine on point-to-point links, bad on Ethernet because the router ARPs for every destination), or both (fully specified, the safest). A <b>floating static</b> has an AD higher than the dynamic route it backs up, so it stays out of the RIB until the primary disappears. A <b>discard route</b> to Null0 stops a summary from looping traffic for unused parts of its range.</p>
<pre class="code"><span class="c">! BR1: default from the WAN via OSPF (AD 110); LTE backup floats at AD 250</span>
BR1(config)# ip route 0.0.0.0 0.0.0.0 192.0.2.1 250
<span class="c">! WAN1: summary for HQ plus a discard route</span>
WAN1(config)# ip route 10.1.0.0 255.255.0.0 Null0</pre>
<pre class="out">BR1# show ip route | begin Gateway
<span class="hl">Gateway of last resort is 10.0.2.1 to network 0.0.0.0</span>

O*E2  0.0.0.0/0 [110/1] via 10.0.2.1, 3d02h, GigabitEthernet0/0/0
      10.0.0.0/8 is variably subnetted, 4 subnets, 3 masks
O IA     10.1.0.0/16 [110/4] via 10.0.2.1, 3d02h, GigabitEthernet0/0/0
C        10.2.10.0/24 is directly connected, GigabitEthernet0/1/0
L        10.2.10.1/32 is directly connected, GigabitEthernet0/1/0

<span class="c">! after the WAN link fails</span>
BR1# show ip route static | begin Gateway
Gateway of last resort is 192.0.2.1 to network 0.0.0.0

<span class="hl">S*    0.0.0.0/0 [250/0] via 192.0.2.1</span></pre>

<h3>Summarisation</h3>
<p>Summarising many prefixes into one (10.1.0.0/16 for all of HQ) shrinks routing tables and, more importantly, <b>hides instability</b>: a flapping /24 inside the summary no longer triggers recalculation elsewhere. The costs: possible <b>suboptimal routing</b> (the summary hides which exit is closer) and <b>black holes</b> if the summarising router advertises a range it can no longer fully reach. EIGRP and OSPF create the Null0 discard route automatically for their own summaries.</p>

<h3>Three families of routing protocol</h3>
<table class="cmp"><tr><th>Family</th><th>Examples</th><th>How it learns</th><th>Loop prevention</th></tr>
<tr><td>Distance vector</td><td>RIP; EIGRP (advanced DV)</td><td>Neighbours tell you their best routes ("routing by rumour")</td><td>Split horizon, poison reverse; EIGRP uses DUAL and feasible successors</td></tr>
<tr><td>Link state</td><td>OSPF, IS-IS</td><td>Every router floods link-state advertisements; each builds the same database and runs SPF (Dijkstra)</td><td>Everyone computes from the same map</td></tr>
<tr><td>Path vector</td><td>BGP</td><td>Neighbours advertise prefixes with the list of ASes crossed</td><td>Reject a route whose AS_PATH already contains your own AS</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> WAN1 has four candidate sources for 10.2.10.0/24: OSPF (AD 110, cost 20), eBGP from the MPLS provider (AD 20), a static route someone left behind (AD 1), and EIGRP external (AD 170). The static wins. If the static points to a dead next hop, it is removed only when the next hop becomes unreachable in the RIB; a static to a reachable but wrong next hop silently black-holes traffic. Lesson: remove leftover statics during clean-up.</p></div>

<div class="warn"><p><b>Common mistake.</b> Setting a floating static with a lower AD than the primary protocol (for example AD 100 while the primary is OSPF at 110). The "backup" immediately becomes the primary. Always make it higher than every dynamic source it backs up.</p></div>

<div class="exam"><p><b>Exam trap.</b> Longest match is evaluated first when forwarding, and AD only compares routes for the <b>identical</b> prefix and length. Also know: eBGP 20 beats OSPF 110 but iBGP 200 loses to it; EIGRP internal 90 beats OSPF, EIGRP external 170 does not.</p></div>

<div class="scn"><h4>The summary that black-holed a branch</h4><p>WAN1 advertised 10.2.0.0/16 to the core as a summary for all branches. When branch BR3 (10.2.30.0/24) lost its WAN link, WAN2 still had a backup path to it, but core routers kept sending BR3 traffic to WAN1 because of the summary, and WAN1 dropped it at its Null0 discard route. The engineer added more specific advertisements from WAN2 as a backup (longest match wins over the summary) and reviewed which failure cases the summary could hide.</p><p><b>Lesson:</b> summaries trade detail for stability; design where more specific routes must still leak for failover.</p></div>

<div class="iv"><p class="q">"If a router learns the same prefix from OSPF and EIGRP, which does it use, and what if EIGRP only had a /16 and OSPF a /24?"</p><p>Strong answer: for the identical prefix, EIGRP internal wins with AD 90 over OSPF's 110. With different prefix lengths both are installed, and for a destination inside the /24 the OSPF /24 is used because longest match beats AD at forwarding time. Explaining the order (AD and metric build the RIB, longest match forwards) is what the interviewer wants.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: AD picks between sources for the same prefix, metric within a protocol, longest match per packet.</li>
<li>Know the AD table: 0, 1, 5, 20, 90, 110, 115, 120, 170, 200, 255.</li>
<li>OSPF cost needs a higher reference bandwidth on fast links; EIGRP uses bandwidth and delay; BGP uses attributes.</li>
<li>Floating statics need an AD higher than the primary; summaries hide instability but can black-hole traffic.</li>
<li>Distance vector (rumour), link state (shared map, SPF), path vector (AS_PATH).</li>
</ul></div>
`,hi:`
<p>Socho aapke phone mein teen navigation apps hain. Kisi trip ke liye aap unpar ek fixed order mein bharosa karte ho: pehle official, phir popular, phir random (yeh trust ranking <b>administrative distance</b> hai). Har app apne routes ko time ya distance se score bhi karta hai (yeh score <b>metric</b> hai). Aur jab aap exact address dhoondh rahe ho, to "Tower B, 4th floor" "Sector 18 mein kahin" ko hara deta hai (yeh <b>longest prefix match</b> hai). Router bilkul yeh teen decisions ek strict order mein leta hai. Zyada tar ENCOR routing questions asal mein isi order ke baare mein hote hain.</p>

<h3>Router kaise choose karta hai, step by step</h3>
<ol>
<li><b>RIB banate waqt, alag sources se same prefix aur length:</b> sabse kam <b>administrative distance</b> jeetta hai.</li>
<li><b>Same protocol se same prefix:</b> sabse kam <b>metric</b> jeetta hai; barabar metrics <b>ECMP</b> dete hain (equal-cost multipath, OSPF aur EIGRP default mein 4 paths tak install karte hain, <code>maximum-paths</code> se tune hota hai).</li>
<li><b>Packet forward karte waqt:</b> destination ko contain karne wali saari RIB entries mein se <b>longest prefix</b> jeetta hai, AD ya metric kuch bhi ho.</li>
</ol>
<p>Step 3 logon ko chaunka deta hai: RIP (AD 120) se seekha /24, OSPF (AD 110) se seekhe /16 ko /24 ke andar ki destination ke liye hara deta hai, kyunki yeh alag prefixes hain aur dono install hote hain.</p>

<table class="cmp"><tr><th>Source</th><th>AD</th><th>Source</th><th>AD</th></tr>
<tr><td>Connected</td><td>0</td><td>OSPF</td><td>110</td></tr>
<tr><td>Static</td><td>1</td><td>IS-IS</td><td>115</td></tr>
<tr><td>EIGRP summary</td><td>5</td><td>RIP</td><td>120</td></tr>
<tr><td>eBGP</td><td>20</td><td>EIGRP external</td><td>170</td></tr>
<tr><td>EIGRP internal</td><td>90</td><td>iBGP</td><td>200</td></tr>
<tr><td colspan="2"></td><td>Unknown / unusable</td><td>255</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Longest prefix match">
<text x="20" y="22" class="svg-ink" font-size="13">Destination 10.10.20.10</text>
<text x="20" y="62" class="svg-ink" font-size="13">0.0.0.0/0 via WAN1</text><rect x="210" y="46" width="4" height="24" fill="#e2e8f0"/><text x="225" y="63" class="svg-muted" font-size="12">0 bits match</text>
<text x="20" y="102" class="svg-ink" font-size="13">10.0.0.0/8 to Null0</text><rect x="210" y="86" width="100" height="24" fill="#bae6fd"/><text x="320" y="103" class="svg-muted" font-size="12">8 bits</text>
<text x="20" y="142" class="svg-ink" font-size="13">10.10.0.0/16 via CORE2</text><rect x="210" y="126" width="200" height="24" fill="#ddd6fe"/><text x="420" y="143" class="svg-muted" font-size="12">16 bits</text>
<text x="20" y="182" class="svg-ink" font-size="13">10.10.20.0/24 via CORE1</text><rect x="210" y="166" width="300" height="24" fill="#bbf7d0"/><text x="520" y="183" class="svg-accent" font-size="12">24 bits: jeetta hai</text>
<text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="12">Chaaron destination ko contain karte hain; sabse specific wala use hota hai</text>
</svg><p class="cap">Longest prefix match har packet par decide hota hai, jab AD aur metric pehle hi chun chuke hote hain ki RIB mein kya hai.</p></div>

<h3>Metrics protocol ke hisaab se alag hain</h3>
<ul>
<li><b>OSPF</b>: cost = reference bandwidth / interface bandwidth. Default reference 100 Mbps hai, isliye 100M, 1G aur 10G links sabka cost 1 hai. Har router par <code>auto-cost reference-bandwidth 100000</code> (Mbps mein) set karo taaki 10G = 10 aur 1G = 100 ho.</li>
<li><b>EIGRP</b>: default mein bandwidth aur delay ka composite (K1 aur K3), optional load aur reliability ke saath.</li>
<li><b>BGP</b>: metric nahi balki path attributes ki list (weight, local preference, AS path length, origin, MED aur aur bhi) jo order mein compare hote hain.</li>
<li><b>RIP</b>: hop count, maximum 15.</li>
</ul>

<h3>Static routes jo aapko master karne hain</h3>
<p>Static route next-hop IP (recursive lookup chahiye), exit interface (point-to-point links par theek, Ethernet par bura kyunki router har destination ke liye ARP karta hai), ya dono (fully specified, sabse safe) ki taraf point kar sakta hai. <b>Floating static</b> ka AD us dynamic route se zyada hota hai jiska woh backup hai, isliye woh primary gaayab hone tak RIB se bahar rehta hai. Null0 ki taraf <b>discard route</b> summary ko uski range ke unused hisson ke liye traffic loop karne se rokta hai.</p>
<pre class="code"><span class="c">! BR1: WAN se OSPF ke through default (AD 110); LTE backup AD 250 par float karta hai</span>
BR1(config)# ip route 0.0.0.0 0.0.0.0 192.0.2.1 250
<span class="c">! WAN1: HQ ke liye summary plus discard route</span>
WAN1(config)# ip route 10.1.0.0 255.255.0.0 Null0</pre>
<pre class="out">BR1# show ip route | begin Gateway
<span class="hl">Gateway of last resort is 10.0.2.1 to network 0.0.0.0</span>

O*E2  0.0.0.0/0 [110/1] via 10.0.2.1, 3d02h, GigabitEthernet0/0/0
      10.0.0.0/8 is variably subnetted, 4 subnets, 3 masks
O IA     10.1.0.0/16 [110/4] via 10.0.2.1, 3d02h, GigabitEthernet0/0/0
C        10.2.10.0/24 is directly connected, GigabitEthernet0/1/0
L        10.2.10.1/32 is directly connected, GigabitEthernet0/1/0

<span class="c">! WAN link fail hone ke baad</span>
BR1# show ip route static | begin Gateway
Gateway of last resort is 192.0.2.1 to network 0.0.0.0

<span class="hl">S*    0.0.0.0/0 [250/0] via 192.0.2.1</span></pre>

<h3>Summarisation</h3>
<p>Kai prefixes ko ek mein summarise karna (poore HQ ke liye 10.1.0.0/16) routing tables chhoti karta hai aur, usse bhi zaroori, <b>instability chhupata hai</b>: summary ke andar flap karta /24 ab doosri jagah recalculation trigger nahi karta. Keemat: possible <b>suboptimal routing</b> (summary chhupa deti hai ki kaunsa exit kareeb hai) aur <b>black holes</b> agar summarising router aisi range advertise kare jise woh ab poori tarah reach nahi kar sakta. EIGRP aur OSPF apni summaries ke liye Null0 discard route apne aap banate hain.</p>

<h3>Routing protocols ki teen families</h3>
<table class="cmp"><tr><th>Family</th><th>Examples</th><th>Kaise seekhta hai</th><th>Loop prevention</th></tr>
<tr><td>Distance vector</td><td>RIP; EIGRP (advanced DV)</td><td>Neighbours aapko apne best routes batate hain ("routing by rumour")</td><td>Split horizon, poison reverse; EIGRP DUAL aur feasible successors use karta hai</td></tr>
<tr><td>Link state</td><td>OSPF, IS-IS</td><td>Har router link-state advertisements flood karta hai; har ek same database banata hai aur SPF (Dijkstra) chalata hai</td><td>Sab same map se calculate karte hain</td></tr>
<tr><td>Path vector</td><td>BGP</td><td>Neighbours prefixes ko cross kiye gaye ASes ki list ke saath advertise karte hain</td><td>Jis route ke AS_PATH mein pehle se apna AS ho use reject karo</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> WAN1 ke paas 10.2.10.0/24 ke chaar candidate sources hain: OSPF (AD 110, cost 20), MPLS provider se eBGP (AD 20), kisi ka chhoda hua static route (AD 1), aur EIGRP external (AD 170). Static jeetta hai. Agar static ek dead next hop ki taraf point karta hai, to woh tabhi hatta hai jab next hop RIB mein unreachable ho jaaye; reachable par galat next hop wala static chupchaap traffic black-hole karta hai. Seekh: clean-up ke dauraan bache hue statics hatao.</p></div>

<div class="warn"><p><b>Common galti.</b> Floating static ka AD primary protocol se kam set karna (jaise AD 100 jabki primary OSPF 110 par hai). "Backup" turant primary ban jaata hai. Ise hamesha har us dynamic source se zyada rakho jiska yeh backup hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Forward karte waqt longest match pehle evaluate hota hai, aur AD sirf <b>bilkul same</b> prefix aur length ke routes compare karta hai. Yeh bhi jaano: eBGP 20 OSPF 110 ko harata hai par iBGP 200 usse haarta hai; EIGRP internal 90 OSPF ko harata hai, EIGRP external 170 nahi.</p></div>

<div class="scn"><h4>Summary jisne branch ko black-hole kiya</h4><p>WAN1 core ko saari branches ke liye summary ki tarah 10.2.0.0/16 advertise karta tha. Jab branch BR3 (10.2.30.0/24) ka WAN link gaya, WAN2 ke paas abhi bhi uska backup path tha, par core routers summary ki wajah se BR3 ka traffic WAN1 ko bhejte rahe, aur WAN1 use apne Null0 discard route par drop karta raha. Engineer ne WAN2 se backup ki tarah zyada specific advertisements jode (longest match summary par jeetta hai) aur review kiya ki summary kaunse failure cases chhupa sakti hai.</p><p><b>Seekh:</b> summaries stability ke liye detail ka trade karti hain; design karo ki failover ke liye kahan zyada specific routes ab bhi leak hone chahiye.</p></div>

<div class="iv"><p class="q">"Agar router same prefix OSPF aur EIGRP dono se seekhe, to woh kaunsa use karega, aur agar EIGRP ke paas sirf /16 ho aur OSPF ke paas /24?"</p><p>Strong answer: identical prefix ke liye EIGRP internal AD 90 ke saath OSPF ke 110 par jeetta hai. Alag prefix lengths ke saath dono install hote hain, aur /24 ke andar ki destination ke liye OSPF /24 use hota hai kyunki forwarding ke waqt longest match AD ko harata hai. Order samjhana (AD aur metric RIB banate hain, longest match forward karta hai) wahi hai jo interviewer chahta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: same prefix ke liye sources mein AD chunta hai, protocol ke andar metric, har packet par longest match.</li>
<li>AD table jaano: 0, 1, 5, 20, 90, 110, 115, 120, 170, 200, 255.</li>
<li>Fast links par OSPF cost ko zyada reference bandwidth chahiye; EIGRP bandwidth aur delay use karta hai; BGP attributes use karta hai.</li>
<li>Floating statics ka AD primary se zyada hona chahiye; summaries instability chhupati hain par traffic black-hole kar sakti hain.</li>
<li>Distance vector (rumour), link state (shared map, SPF), path vector (AS_PATH).</li>
</ul></div>
`}};export{e as default};