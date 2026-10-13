var e={id:`eigrp-bgp`,h:{en:`EIGRP and BGP concepts, and choosing a protocol`,hi:`EIGRP aur BGP concepts, aur protocol chunna`},body:{en:`
<p>Network+ expects you to recognise EIGRP and BGP, know where each is used and how each chooses paths. You will not configure them in this module, but you will meet both in real jobs: EIGRP in many Cisco enterprise networks and BGP at every internet edge and cloud connection.</p>

<h3>An analogy: two kinds of navigation</h3>
<p>EIGRP is like a delivery rider who always knows the fastest road <b>and</b> keeps a backup road already checked in his head. If the main road is blocked, he switches instantly without phoning anyone. BGP is like international shipping: the route is chosen less by distance and more by contracts, which carriers you trust, and which countries you are allowed to pass through.</p>

<h3>EIGRP: Enhanced Interior Gateway Routing Protocol</h3>
<ul>
<li><b>Type:</b> advanced distance-vector IGP (sometimes called hybrid). Developed by Cisco; the basic protocol was later published openly as an informational RFC, but it is still found mostly on Cisco devices.</li>
<li><b>Transport:</b> runs directly over IP as <b>protocol 88</b>, multicasting to <b>224.0.0.10</b>. It forms neighbours with hellos, sends a full table once, and afterwards sends only <b>partial, triggered updates</b> when something changes.</li>
<li><b>Metric:</b> a composite metric calculated by default from the <b>minimum bandwidth</b> along the path and the <b>total delay</b>. (Load and reliability exist in the formula but are off by default.)</li>
<li><b>Algorithm:</b> <b>DUAL</b> (Diffusing Update Algorithm). The best path is the <b>successor</b>. A loop-free backup that meets the <b>feasibility condition</b> is a <b>feasible successor</b>, kept ready in the topology table. If the successor fails, the feasible successor is installed immediately, with no recalculation.</li>
<li><b>Administrative distance:</b> <b>90</b> internal, <b>170</b> external (redistributed), 5 for summaries.</li>
<li><b>Special feature:</b> it can load-balance over paths with <b>unequal</b> cost using the <code>variance</code> command. OSPF load-balances only over equal costs.</li>
</ul>
<pre class="out">R1#show ip route eigrp
<span class="hl">D        10.20.0.0/24 [90/3072] via 10.0.12.2, 00:05:12, GigabitEthernet0/0</span></pre>
<p>The code <b>D</b> stands for EIGRP (the letter E was already used by the old EGP protocol). [90/3072] is AD 90, composite metric 3072.</p>

<h3>BGP: Border Gateway Protocol</h3>
<ul>
<li><b>Type:</b> <b>path-vector</b> exterior gateway protocol, the routing protocol of the internet. Current version BGP-4.</li>
<li><b>Transport:</b> runs over <b>TCP port 179</b>. Neighbours (called <b>peers</b>) are configured manually; there is no automatic discovery.</li>
<li><b>Autonomous system numbers (ASNs):</b> each organisation that runs BGP on the internet has an ASN. Private ASNs (64512 to 65534 in the 16-bit range) are used internally and for private links, like private IP addresses.</li>
<li><b>eBGP and iBGP:</b> <b>external BGP</b> runs between different ASes (AD <b>20</b>); <b>internal BGP</b> runs between routers in the same AS to carry external routes across it (AD <b>200</b>).</li>
<li><b>Path selection:</b> uses <b>attributes</b> and policy, for example local preference (which exit my AS prefers), <b>AS path</b> length (fewer ASes is usually better), origin and MED (a hint from a neighbouring AS). Cisco adds a local-only attribute called weight.</li>
<li><b>Loop prevention:</b> a router rejects any route whose AS path already contains its own ASN.</li>
<li><b>Scale:</b> the global internet table holds around a million IPv4 prefixes. BGP is built for scale and stability, not for sub-second convergence.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="eBGP between autonomous systems and iBGP inside one">
<rect x="10" y="40" width="190" height="120" rx="10" fill="#bae6fd"/><text x="105" y="62" text-anchor="middle" class="svg-ink" font-size="13">AS 64500 (company)</text>
<rect x="30" y="90" width="70" height="36" rx="6" fill="#e2e8f0"/><text x="65" y="113" text-anchor="middle" class="svg-ink" font-size="12">Edge-1</text>
<rect x="115" y="90" width="70" height="36" rx="6" fill="#e2e8f0"/><text x="150" y="113" text-anchor="middle" class="svg-ink" font-size="12">Edge-2</text>
<line x1="100" y1="108" x2="115" y2="108" stroke="#64748b" stroke-width="2"/><text x="105" y="148" text-anchor="middle" class="svg-muted" font-size="12">iBGP (AD 200)</text>
<rect x="250" y="20" width="160" height="60" rx="10" fill="#fde68a"/><text x="330" y="55" text-anchor="middle" class="svg-ink" font-size="13">ISP-A AS 64501</text>
<rect x="250" y="120" width="160" height="60" rx="10" fill="#fed7aa"/><text x="330" y="155" text-anchor="middle" class="svg-ink" font-size="13">ISP-B AS 64502</text>
<line x1="100" y1="90" x2="250" y2="50" stroke="#64748b" stroke-width="2"/><line x1="185" y1="126" x2="250" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="190" y="62" class="svg-accent" font-size="12">eBGP (AD 20)</text>
<rect x="460" y="70" width="170" height="60" rx="10" fill="#bbf7d0"/><text x="545" y="105" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="410" y1="50" x2="460" y2="95" stroke="#64748b" stroke-width="2"/><line x1="410" y1="150" x2="460" y2="105" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">A multihomed company: eBGP to two ISPs, iBGP between its own edge routers. Private ASNs shown for illustration.</p></div>

<div class="eg"><p><b>Worked example: why a company runs BGP.</b> A payments company has two ISPs. With only static default routes, if ISP-A has a problem beyond the first hop, the company cannot detect it and cannot tell the internet to send inbound traffic via ISP-B. With BGP, the company announces its own public prefix (say 203.0.113.0/24) to both ISPs. If ISP-A fails, the BGP session drops, the internet withdraws the path through ISP-A, and all traffic flows through ISP-B. Policy (local preference outbound, AS-path prepending inbound) can make ISP-A primary while both are up.</p></div>

<h3>Choosing and comparing</h3>
<table class="cmp"><tr><th>Feature</th><th>RIP (legacy)</th><th>OSPF</th><th>EIGRP</th><th>BGP</th></tr>
<tr><td>Family</td><td>Distance-vector</td><td>Link-state</td><td>Advanced distance-vector</td><td>Path-vector</td></tr>
<tr><td>Where</td><td>IGP</td><td>IGP</td><td>IGP</td><td>EGP (also large internal)</td></tr>
<tr><td>Standard</td><td>Open</td><td>Open</td><td>Cisco origin</td><td>Open</td></tr>
<tr><td>Metric</td><td>Hop count (max 15)</td><td>Cost (bandwidth)</td><td>Bandwidth + delay</td><td>Attributes, AS path</td></tr>
<tr><td>Default AD</td><td>120</td><td>110</td><td>90 / 170 external</td><td>20 eBGP / 200 iBGP</td></tr>
<tr><td>Transport</td><td>UDP 520</td><td>IP protocol 89</td><td>IP protocol 88</td><td>TCP 179</td></tr>
<tr><td>Convergence</td><td>Slow</td><td>Fast</td><td>Very fast (feasible successor)</td><td>Slow, stable</td></tr>
<tr><td>Typical use</td><td>Old small networks</td><td>Multi-vendor enterprise</td><td>Cisco enterprise</td><td>ISPs, multihoming, cloud</td></tr>
</table>

<div class="warn"><p><b>Common mistake.</b> Assuming BGP is only for ISPs. Enterprises use it for multihoming, for connections to cloud providers (private interconnects typically use BGP), for SD-WAN overlays and inside large data centers. Another mistake: thinking BGP picks the fastest path. It picks the path its policy prefers.</p></div>

<div class="exam"><p><b>Exam trap.</b> Match protocol to clue: "TCP 179" or "autonomous systems" means BGP; "feasible successor", "DUAL" or "unequal-cost load balancing" means EIGRP; "SPF", "areas" or "LSAs" means OSPF; "hop count 15" means RIP.</p></div>

<div class="scn"><h4>The cloud link that ignored the backup</h4><p>A company connected its data center to a cloud provider with a private circuit and a VPN backup, both running BGP. During a circuit fault the VPN did take over, but when the circuit came back, traffic returned only in one direction, and some applications broke. The engineer found that the company preferred the circuit outbound (local preference), while the cloud side preferred the VPN inbound because the company had prepended its AS path on the wrong session. Correcting the prepending made the circuit primary in both directions.</p><p><b>Lesson:</b> BGP is about policy in both directions. Check what you send and what you receive.</p></div>

<div class="iv"><p class="q">"What is the difference between eBGP and iBGP, and why is iBGP's AD 200?"</p><p>Strong answer: eBGP peers are in different autonomous systems, iBGP peers are in the same AS and carry external routes across it. eBGP has AD 20 because external routes learned directly from a neighbour AS are trusted over IGP routes; iBGP has AD 200 so that the organisation's own IGP routes (OSPF 110, EIGRP 90) are preferred for internal destinations. Add that BGP uses TCP 179 and manually configured peers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EIGRP: advanced distance-vector, Cisco origin, DUAL with successor and feasible successor, bandwidth plus delay metric, AD 90/170.</li>
<li>BGP: path-vector EGP over TCP 179, manual peers, chooses paths by attributes and policy.</li>
<li>eBGP (AD 20) runs between ASes; iBGP (AD 200) runs inside an AS.</li>
<li>OSPF suits multi-vendor enterprises, EIGRP Cisco enterprises, BGP internet and cloud edges.</li>
<li>Learn the clue words for each protocol; exam questions are built on them.</li>
</ul></div>
`,hi:`
<p>Network+ expect karta hai ki aap EIGRP aur BGP ko pehchano, jaano ki har ek kahan use hota hai aur har ek paths kaise chunta hai. Is module mein aap inhe configure nahi karoge, lekin real jobs mein dono se miloge: bahut saare Cisco enterprise networks mein EIGRP aur har internet edge aur cloud connection par BGP.</p>

<h3>Ek analogy: do tarah ka navigation</h3>
<p>EIGRP us delivery rider jaisa hai jise hamesha sabse tez sadak pata hoti hai <b>aur</b> jo apne dimaag mein ek backup sadak pehle se check karke rakhta hai. Agar main sadak band ho, to woh bina kisi ko phone kiye turant switch kar leta hai. BGP international shipping jaisa hai: raasta doori se kam aur contracts se zyada chuna jaata hai, kin carriers par aap bharosa karte ho, aur kin deshon se guzarne ki aapko permission hai.</p>

<h3>EIGRP: Enhanced Interior Gateway Routing Protocol</h3>
<ul>
<li><b>Type:</b> advanced distance-vector IGP (kabhi kabhi hybrid kehte hain). Cisco ne develop kiya; basic protocol baad mein informational RFC ke roop mein openly publish hua, lekin zyada tar Cisco devices par hi milta hai.</li>
<li><b>Transport:</b> seedhe IP par <b>protocol 88</b> ki tarah chalta hai, <b>224.0.0.10</b> par multicast karta hai. Hellos se neighbours banata hai, ek baar poori table bhejta hai, aur uske baad kuch badalne par sirf <b>partial, triggered updates</b> bhejta hai.</li>
<li><b>Metric:</b> composite metric jo default mein path ki <b>minimum bandwidth</b> aur <b>total delay</b> se calculate hota hai. (Load aur reliability formula mein hain lekin default mein off hain.)</li>
<li><b>Algorithm:</b> <b>DUAL</b> (Diffusing Update Algorithm). Best path <b>successor</b> hai. Ek loop-free backup jo <b>feasibility condition</b> poori kare woh <b>feasible successor</b> hai, jo topology table mein ready rakha jaata hai. Agar successor fail ho, feasible successor turant install hota hai, bina recalculation ke.</li>
<li><b>Administrative distance:</b> internal <b>90</b>, external (redistributed) <b>170</b>, summaries ke liye 5.</li>
<li><b>Special feature:</b> yeh <code>variance</code> command se <b>unequal</b> cost wale paths par load-balance kar sakta hai. OSPF sirf equal costs par load-balance karta hai.</li>
</ul>
<pre class="out">R1#show ip route eigrp
<span class="hl">D        10.20.0.0/24 [90/3072] via 10.0.12.2, 00:05:12, GigabitEthernet0/0</span></pre>
<p>Code <b>D</b> EIGRP ke liye hai (letter E purane EGP protocol ne pehle hi le liya tha). [90/3072] matlab AD 90, composite metric 3072.</p>

<h3>BGP: Border Gateway Protocol</h3>
<ul>
<li><b>Type:</b> <b>path-vector</b> exterior gateway protocol, internet ka routing protocol. Current version BGP-4.</li>
<li><b>Transport:</b> <b>TCP port 179</b> par chalta hai. Neighbours (jinhe <b>peers</b> kehte hain) manually configure hote hain; koi automatic discovery nahi.</li>
<li><b>Autonomous system numbers (ASNs):</b> internet par BGP chalane wali har organisation ka ek ASN hota hai. Private ASNs (16-bit range mein 64512 se 65534) andar aur private links ke liye use hote hain, private IP addresses ki tarah.</li>
<li><b>eBGP aur iBGP:</b> <b>external BGP</b> alag ASes ke beech chalta hai (AD <b>20</b>); <b>internal BGP</b> same AS ke routers ke beech chalta hai taaki external routes AS ke paar le jaaye (AD <b>200</b>).</li>
<li><b>Path selection:</b> <b>attributes</b> aur policy use karta hai, jaise local preference (mera AS kaunsa exit prefer karta hai), <b>AS path</b> length (kam ASes aam taur par behtar), origin aur MED (padosi AS ka hint). Cisco ek local-only attribute weight bhi jodta hai.</li>
<li><b>Loop prevention:</b> router aisa har route reject karta hai jiske AS path mein pehle se uska apna ASN ho.</li>
<li><b>Scale:</b> global internet table mein lagbhag das lakh IPv4 prefixes hain. BGP scale aur stability ke liye bana hai, sub-second convergence ke liye nahi.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Autonomous systems ke beech eBGP aur ek ke andar iBGP">
<rect x="10" y="40" width="190" height="120" rx="10" fill="#bae6fd"/><text x="105" y="62" text-anchor="middle" class="svg-ink" font-size="13">AS 64500 (company)</text>
<rect x="30" y="90" width="70" height="36" rx="6" fill="#e2e8f0"/><text x="65" y="113" text-anchor="middle" class="svg-ink" font-size="12">Edge-1</text>
<rect x="115" y="90" width="70" height="36" rx="6" fill="#e2e8f0"/><text x="150" y="113" text-anchor="middle" class="svg-ink" font-size="12">Edge-2</text>
<line x1="100" y1="108" x2="115" y2="108" stroke="#64748b" stroke-width="2"/><text x="105" y="148" text-anchor="middle" class="svg-muted" font-size="12">iBGP (AD 200)</text>
<rect x="250" y="20" width="160" height="60" rx="10" fill="#fde68a"/><text x="330" y="55" text-anchor="middle" class="svg-ink" font-size="13">ISP-A AS 64501</text>
<rect x="250" y="120" width="160" height="60" rx="10" fill="#fed7aa"/><text x="330" y="155" text-anchor="middle" class="svg-ink" font-size="13">ISP-B AS 64502</text>
<line x1="100" y1="90" x2="250" y2="50" stroke="#64748b" stroke-width="2"/><line x1="185" y1="126" x2="250" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="190" y="62" class="svg-accent" font-size="12">eBGP (AD 20)</text>
<rect x="460" y="70" width="170" height="60" rx="10" fill="#bbf7d0"/><text x="545" y="105" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="410" y1="50" x2="460" y2="95" stroke="#64748b" stroke-width="2"/><line x1="410" y1="150" x2="460" y2="105" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Multihomed company: do ISPs se eBGP, apne edge routers ke beech iBGP. Samjhaane ke liye private ASNs dikhaye gaye hain.</p></div>

<div class="eg"><p><b>Worked example: company BGP kyun chalati hai.</b> Ek payments company ke do ISPs hain. Sirf static default routes ke saath, agar ISP-A mein first hop ke aage problem ho, to company use detect nahi kar sakti aur internet ko nahi bata sakti ki inbound traffic ISP-B se bheje. BGP ke saath company apna public prefix (maan lo 203.0.113.0/24) dono ISPs ko announce karti hai. Agar ISP-A fail ho, BGP session gir jaata hai, internet ISP-A wala path withdraw kar deta hai, aur saara traffic ISP-B se aata hai. Policy (outbound local preference, inbound AS-path prepending) dono up hone par ISP-A ko primary bana sakti hai.</p></div>

<h3>Chunna aur compare karna</h3>
<table class="cmp"><tr><th>Feature</th><th>RIP (legacy)</th><th>OSPF</th><th>EIGRP</th><th>BGP</th></tr>
<tr><td>Family</td><td>Distance-vector</td><td>Link-state</td><td>Advanced distance-vector</td><td>Path-vector</td></tr>
<tr><td>Kahan</td><td>IGP</td><td>IGP</td><td>IGP</td><td>EGP (bade internal bhi)</td></tr>
<tr><td>Standard</td><td>Open</td><td>Open</td><td>Cisco origin</td><td>Open</td></tr>
<tr><td>Metric</td><td>Hop count (max 15)</td><td>Cost (bandwidth)</td><td>Bandwidth + delay</td><td>Attributes, AS path</td></tr>
<tr><td>Default AD</td><td>120</td><td>110</td><td>90 / 170 external</td><td>20 eBGP / 200 iBGP</td></tr>
<tr><td>Transport</td><td>UDP 520</td><td>IP protocol 89</td><td>IP protocol 88</td><td>TCP 179</td></tr>
<tr><td>Convergence</td><td>Slow</td><td>Fast</td><td>Bahut fast (feasible successor)</td><td>Slow, stable</td></tr>
<tr><td>Typical use</td><td>Purane chhote networks</td><td>Multi-vendor enterprise</td><td>Cisco enterprise</td><td>ISPs, multihoming, cloud</td></tr>
</table>

<div class="warn"><p><b>Common galti.</b> Yeh maan lena ki BGP sirf ISPs ke liye hai. Enterprises ise multihoming, cloud providers se connections (private interconnects aam taur par BGP use karte hain), SD-WAN overlays aur bade data centers ke andar use karte hain. Ek aur galti: yeh sochna ki BGP sabse tez path chunta hai. Woh woh path chunta hai jo uski policy prefer karti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Clue se protocol match karo: "TCP 179" ya "autonomous systems" matlab BGP; "feasible successor", "DUAL" ya "unequal-cost load balancing" matlab EIGRP; "SPF", "areas" ya "LSAs" matlab OSPF; "hop count 15" matlab RIP.</p></div>

<div class="scn"><h4>Cloud link jisne backup ko ignore kiya</h4><p>Ek company ne apna data center cloud provider se ek private circuit aur ek VPN backup se joda, dono BGP chala rahe the. Circuit fault ke dauraan VPN ne sach mein le liya, lekin jab circuit wapas aaya, traffic sirf ek direction mein laut aaya, aur kuch applications toot gayi. Engineer ne dekha ki company outbound circuit prefer karti thi (local preference), jabki cloud side inbound VPN prefer karti thi kyunki company ne galat session par apna AS path prepend kiya tha. Prepending theek karne se circuit dono directions mein primary ban gaya.</p><p><b>Seekh:</b> BGP dono directions mein policy ka khel hai. Check karo aap kya bhejte ho aur kya receive karte ho.</p></div>

<div class="iv"><p class="q">"eBGP aur iBGP mein kya farak hai, aur iBGP ki AD 200 kyun hai?"</p><p>Strong answer: eBGP peers alag autonomous systems mein hote hain, iBGP peers same AS mein hote hain aur external routes ko AS ke paar le jaate hain. eBGP ki AD 20 hai kyunki padosi AS se seedhe seekhe external routes par IGP routes se zyada bharosa kiya jaata hai; iBGP ki AD 200 hai taaki internal destinations ke liye organisation ke apne IGP routes (OSPF 110, EIGRP 90) prefer hon. Yeh bhi jodo ki BGP TCP 179 aur manually configured peers use karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EIGRP: advanced distance-vector, Cisco origin, successor aur feasible successor ke saath DUAL, bandwidth plus delay metric, AD 90/170.</li>
<li>BGP: TCP 179 par path-vector EGP, manual peers, attributes aur policy se paths chunta hai.</li>
<li>eBGP (AD 20) ASes ke beech chalta hai; iBGP (AD 200) AS ke andar.</li>
<li>OSPF multi-vendor enterprises ke liye, EIGRP Cisco enterprises ke liye, BGP internet aur cloud edges ke liye.</li>
<li>Har protocol ke clue words seekho; exam questions unhi par bane hote hain.</li>
</ul></div>
`}};export{e as default};