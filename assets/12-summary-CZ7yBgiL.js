var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with a post office analogy and finished it by watching OSPF reroute around a cut fibre. This chapter pulls everything together: what you should now be able to do, the vocabulary, the facts the Network+ N10-009 exam tests most often under objective 2.1, and a command cheat-sheet for the labs and the job.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module map">
<rect x="10" y="10" width="150" height="50" rx="8" fill="#fde68a"/><text x="85" y="40" text-anchor="middle" class="svg-ink" font-size="13">Routing table</text>
<rect x="170" y="10" width="150" height="50" rx="8" fill="#fde68a"/><text x="245" y="30" text-anchor="middle" class="svg-ink" font-size="13">Selection</text><text x="245" y="48" text-anchor="middle" class="svg-muted" font-size="12">prefix, AD, metric</text>
<rect x="330" y="10" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="405" y="30" text-anchor="middle" class="svg-ink" font-size="13">Static</text><text x="405" y="48" text-anchor="middle" class="svg-muted" font-size="12">default, floating</text>
<rect x="490" y="10" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="40" text-anchor="middle" class="svg-ink" font-size="13">Lab 1</text>
<rect x="10" y="80" width="150" height="50" rx="8" fill="#bae6fd"/><text x="85" y="110" text-anchor="middle" class="svg-ink" font-size="13">DV / LS / PV</text>
<rect x="170" y="80" width="150" height="50" rx="8" fill="#bae6fd"/><text x="245" y="110" text-anchor="middle" class="svg-ink" font-size="13">OSPF</text>
<rect x="330" y="80" width="150" height="50" rx="8" fill="#bae6fd"/><text x="405" y="110" text-anchor="middle" class="svg-ink" font-size="13">EIGRP, BGP</text>
<rect x="490" y="80" width="140" height="50" rx="8" fill="#bae6fd"/><text x="560" y="110" text-anchor="middle" class="svg-ink" font-size="13">Lab 2</text>
<rect x="10" y="150" width="310" height="40" rx="8" fill="#ddd6fe"/><text x="165" y="175" text-anchor="middle" class="svg-ink" font-size="13">NAT/PAT, FHRP, VIP, subinterfaces</text>
<rect x="330" y="150" width="300" height="40" rx="8" fill="#fed7aa"/><text x="480" y="175" text-anchor="middle" class="svg-ink" font-size="13">Troubleshooting workflow</text>
</svg><p class="cap">Everything in objective 2.1, and the two labs that make it real.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can read every part of a routing table line: code, prefix, [AD/metric], next hop, exit interface, age.</li>
<li>I can apply longest prefix match to any destination and explain why the default route is used last.</li>
<li>I can choose between routes using AD (different sources) and metric (same protocol), and spot ECMP.</li>
<li>I can configure static, default, floating, summary and host routes, and remember routes are needed in both directions.</li>
<li>I can complete Lab 1: two routes on HQ, one default on BR, then ping and trace from PC-BR.</li>
<li>I can compare distance-vector, link-state and path-vector, and IGP versus EGP.</li>
<li>I can explain OSPF neighbours, states, router ID, DR/BDR, LSDB, SPF, cost and areas.</li>
<li>I can complete Lab 2: OSPF on three routers, verify [110/2] via 10.0.12.2, cut the link and see [110/3] via 10.0.13.2.</li>
<li>I can describe EIGRP (DUAL, feasible successor) and BGP (AS path, TCP 179, eBGP/iBGP).</li>
<li>I can explain NAT, PAT, FHRP (HSRP, VRRP, GLBP), VIPs and subinterfaces.</li>
<li>I can troubleshoot a "cannot reach" ticket in a fixed order, including the return path.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Routing table (RIB)</dt><dd>The router's list of destination prefixes with next hops.</dd>
<dt>Longest prefix match</dt><dd>The most specific matching route wins for each packet.</dd>
<dt>Administrative distance</dt><dd>Trust in a route source, 0 to 255; lower wins between sources.</dd>
<dt>Metric</dt><dd>A protocol's measure of path quality; lower wins within a protocol.</dd>
<dt>Default route / gateway of last resort</dt><dd>0.0.0.0/0 and its next hop, used when nothing else matches.</dd>
<dt>Floating static route</dt><dd>A backup static route with a higher AD than the primary.</dd>
<dt>Convergence</dt><dd>The time until all routers agree after a change.</dd>
<dt>Autonomous system</dt><dd>A network under one administrative control, identified in BGP by an ASN.</dd>
<dt>LSA / LSDB / SPF</dt><dd>OSPF's link advertisements, the database they form, and the algorithm that computes best paths.</dd>
<dt>Successor / feasible successor</dt><dd>EIGRP's best path and its pre-computed loop-free backup.</dd>
<dt>PAT</dt><dd>Many private hosts sharing one public IP, distinguished by port.</dd>
<dt>FHRP / VIP</dt><dd>Protocols that let routers share a virtual gateway IP; an address not tied to one device.</dd>
<dt>Subinterface</dt><dd>A logical interface on a physical port, often one per VLAN with dot1Q.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Selection order</td><td>Longest prefix, then lowest AD, then lowest metric</td></tr>
<tr><td>AD values</td><td>Connected 0, static 1, eBGP 20, EIGRP 90, OSPF 110, RIP 120, EIGRP external 170, iBGP 200, 255 unusable</td></tr>
<tr><td>Default route</td><td>0.0.0.0/0, shown as S*, sets gateway of last resort</td></tr>
<tr><td>Floating static</td><td>Higher AD than the primary; above 110 to back up OSPF</td></tr>
<tr><td>OSPF</td><td>Link-state, open, cost = 100 Mbps / bandwidth, area 0 backbone, hello 10 / dead 40, 224.0.0.5 / .6, protocol 89, FULL = healthy</td></tr>
<tr><td>EIGRP</td><td>Advanced distance-vector, DUAL, bandwidth + delay, unequal-cost load balancing, 224.0.0.10, protocol 88</td></tr>
<tr><td>BGP</td><td>Path-vector EGP, TCP 179, AS path loop prevention, policy-based</td></tr>
<tr><td>RIP (legacy)</td><td>Hop count, 15 max, 16 unreachable, UDP 520</td></tr>
<tr><td>NAT types</td><td>Static 1:1, dynamic pool, PAT many-to-one by port</td></tr>
<tr><td>FHRPs</td><td>HSRP (Cisco, active/standby), VRRP (open, master/backup), GLBP (Cisco, load balancing)</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! static and default routes</span>
ip route 10.2.2.0 255.255.255.0 10.0.12.2
ip route 0.0.0.0 0.0.0.0 203.0.113.1
ip route 0.0.0.0 0.0.0.0 198.51.100.1 10        <span class="c">! floating backup</span>
<span class="c">! OSPF</span>
router ospf 1
 network 10.0.0.0 0.255.255.255 area 0
 network 192.168.0.0 0.0.255.255 area 0
<span class="c">! verification</span>
show ip route
show ip route 192.168.2.10
show ip route ospf
show ip interface brief
show ip ospf neighbor
show ip protocols
<span class="c">! from hosts</span>
ping 10.1.1.10
trace 8.8.8.8</pre>

<div class="eg"><p><b>Worked example: one question, every idea.</b> A router has <code>S 10.0.0.0/8 [1/0]</code>, <code>O 10.2.0.0/16 [110/20]</code> and <code>D 10.2.2.0/24 [90/3072]</code>. A packet goes to 10.2.2.77. All three match; the /24 is longest, so the EIGRP route is used even though the static route has a lower AD. A packet to 10.2.9.1 uses the OSPF /16. A packet to 10.9.9.9 uses the static /8. A packet to 172.16.0.1 is dropped unless a default route exists.</p></div>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> Comparing AD across different prefix lengths; forgetting the return route; confusing wildcard and subnet masks in OSPF; thinking a floating route reacts to failures beyond the local link; calling BGP link-state.</p></div>

<div class="exam"><p><b>Exam strategy.</b> For "which route is used" questions, first underline the destination and the prefix lengths, then AD, then metric. For "which protocol" questions, look for the clue words: SPF/areas (OSPF), DUAL/feasible successor (EIGRP), AS/TCP 179 (BGP), hop count (RIP).</p></div>

<div class="scn"><h4>Putting it all together at a new branch</h4><p>An engineer opened a branch with two uplinks: MPLS to HQ running OSPF, and broadband for backup. OSPF carried HQ routes, a floating static default via broadband (AD 130) waited in the background, PAT translated branch users onto the broadband address only when needed, and two branch routers shared a VRRP VIP as the gateway, with subinterfaces for the staff and guest VLANs. During the first MPLS outage, the OSPF routes vanished, the floating default appeared, and users kept working over broadband. The monitoring alert was the only sign.</p><p><b>Lesson:</b> every piece of this module is a building block. Real designs combine them.</p></div>

<div class="iv"><p class="q">"Summarise how you would design routing for a company with an HQ, five branches and two ISPs."</p><p>Strong answer: OSPF as the IGP with area 0 at HQ, branches in area 0 or their own areas depending on size; default routes toward the internet originated at HQ; eBGP with both ISPs (or static defaults with tracking if BGP is not available); PAT at the edge; an FHRP pair at HQ for gateway redundancy; floating static or LTE backup at branches; and a documented troubleshooting runbook. Explain one trade-off, such as static simplicity versus dynamic failover.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route selection is longest prefix, then AD, then metric; know the AD table by heart.</li>
<li>Static and default routes suit stubs and edges; floating statics provide simple backups.</li>
<li>OSPF (link-state), EIGRP (advanced distance-vector) and BGP (path-vector) solve different problems.</li>
<li>NAT/PAT, FHRP with VIPs and subinterfaces complete objective 2.1.</li>
<li>Troubleshoot in a fixed order and always check both directions.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module post office analogy se shuru kiya aur OSPF ko kate hue fibre ke aas-paas reroute karte dekh kar khatam kiya. Yeh chapter sab kuch ek saath laata hai: ab aap kya kar paoge, vocabulary, woh facts jo Network+ N10-009 exam objective 2.1 ke neeche sabse zyada test karta hai, aur labs aur job ke liye ek command cheat-sheet.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module map">
<rect x="10" y="10" width="150" height="50" rx="8" fill="#fde68a"/><text x="85" y="40" text-anchor="middle" class="svg-ink" font-size="13">Routing table</text>
<rect x="170" y="10" width="150" height="50" rx="8" fill="#fde68a"/><text x="245" y="30" text-anchor="middle" class="svg-ink" font-size="13">Selection</text><text x="245" y="48" text-anchor="middle" class="svg-muted" font-size="12">prefix, AD, metric</text>
<rect x="330" y="10" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="405" y="30" text-anchor="middle" class="svg-ink" font-size="13">Static</text><text x="405" y="48" text-anchor="middle" class="svg-muted" font-size="12">default, floating</text>
<rect x="490" y="10" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="40" text-anchor="middle" class="svg-ink" font-size="13">Lab 1</text>
<rect x="10" y="80" width="150" height="50" rx="8" fill="#bae6fd"/><text x="85" y="110" text-anchor="middle" class="svg-ink" font-size="13">DV / LS / PV</text>
<rect x="170" y="80" width="150" height="50" rx="8" fill="#bae6fd"/><text x="245" y="110" text-anchor="middle" class="svg-ink" font-size="13">OSPF</text>
<rect x="330" y="80" width="150" height="50" rx="8" fill="#bae6fd"/><text x="405" y="110" text-anchor="middle" class="svg-ink" font-size="13">EIGRP, BGP</text>
<rect x="490" y="80" width="140" height="50" rx="8" fill="#bae6fd"/><text x="560" y="110" text-anchor="middle" class="svg-ink" font-size="13">Lab 2</text>
<rect x="10" y="150" width="310" height="40" rx="8" fill="#ddd6fe"/><text x="165" y="175" text-anchor="middle" class="svg-ink" font-size="13">NAT/PAT, FHRP, VIP, subinterfaces</text>
<rect x="330" y="150" width="300" height="40" rx="8" fill="#fed7aa"/><text x="480" y="175" text-anchor="middle" class="svg-ink" font-size="13">Troubleshooting workflow</text>
</svg><p class="cap">Objective 2.1 ki har cheez, aur do labs jo use real banati hain.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main routing table line ka har hissa padh sakta/sakti hoon: code, prefix, [AD/metric], next hop, exit interface, age.</li>
<li>Main kisi bhi destination par longest prefix match laga sakta hoon aur samjha sakta hoon ki default route aakhri mein kyun use hota hai.</li>
<li>Main AD (alag sources) aur metric (same protocol) se routes chun sakta hoon, aur ECMP pehchan sakta hoon.</li>
<li>Main static, default, floating, summary aur host routes configure kar sakta hoon, aur yaad rakhta hoon ki routes dono directions mein chahiye.</li>
<li>Main Lab 1 poora kar sakta hoon: HQ par do routes, BR par ek default, phir PC-BR se ping aur trace.</li>
<li>Main distance-vector, link-state aur path-vector, aur IGP vs EGP compare kar sakta hoon.</li>
<li>Main OSPF neighbours, states, router ID, DR/BDR, LSDB, SPF, cost aur areas samjha sakta hoon.</li>
<li>Main Lab 2 poora kar sakta hoon: teen routers par OSPF, [110/2] via 10.0.12.2 verify karna, link kaatna aur [110/3] via 10.0.13.2 dekhna.</li>
<li>Main EIGRP (DUAL, feasible successor) aur BGP (AS path, TCP 179, eBGP/iBGP) describe kar sakta hoon.</li>
<li>Main NAT, PAT, FHRP (HSRP, VRRP, GLBP), VIPs aur subinterfaces samjha sakta hoon.</li>
<li>Main "cannot reach" ticket ko fixed order mein troubleshoot kar sakta hoon, return path samet.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Routing table (RIB)</dt><dd>Router ki destination prefixes aur next hops ki list.</dd>
<dt>Longest prefix match</dt><dd>Har packet ke liye sabse specific matching route jeetta hai.</dd>
<dt>Administrative distance</dt><dd>Route source par bharosa, 0 se 255; sources ke beech kam jeetta hai.</dd>
<dt>Metric</dt><dd>Protocol ka path quality naapne ka tareeka; protocol ke andar kam jeetta hai.</dd>
<dt>Default route / gateway of last resort</dt><dd>0.0.0.0/0 aur uska next hop, jab kuch aur match na ho tab use hota hai.</dd>
<dt>Floating static route</dt><dd>Primary se zyada AD wala backup static route.</dd>
<dt>Convergence</dt><dd>Change ke baad saare routers ke agree hone tak ka time.</dd>
<dt>Autonomous system</dt><dd>Ek administrative control ke neeche ka network, BGP mein ASN se pehchana jaata hai.</dd>
<dt>LSA / LSDB / SPF</dt><dd>OSPF ke link advertisements, unse bana database, aur best paths nikaalne wala algorithm.</dd>
<dt>Successor / feasible successor</dt><dd>EIGRP ka best path aur uska pehle se compute kiya loop-free backup.</dd>
<dt>PAT</dt><dd>Bahut saare private hosts ek public IP share karte hain, port se alag pehchane jaate hain.</dd>
<dt>FHRP / VIP</dt><dd>Protocols jo routers ko virtual gateway IP share karne dete hain; aisa address jo ek device se bandha nahi.</dd>
<dt>Subinterface</dt><dd>Physical port par logical interface, aksar har VLAN ke liye ek, dot1Q ke saath.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>Selection order</td><td>Longest prefix, phir sabse kam AD, phir sabse kam metric</td></tr>
<tr><td>AD values</td><td>Connected 0, static 1, eBGP 20, EIGRP 90, OSPF 110, RIP 120, EIGRP external 170, iBGP 200, 255 unusable</td></tr>
<tr><td>Default route</td><td>0.0.0.0/0, S* ki tarah dikhta hai, gateway of last resort set karta hai</td></tr>
<tr><td>Floating static</td><td>Primary se zyada AD; OSPF ke backup ke liye 110 se upar</td></tr>
<tr><td>OSPF</td><td>Link-state, open, cost = 100 Mbps / bandwidth, area 0 backbone, hello 10 / dead 40, 224.0.0.5 / .6, protocol 89, FULL = healthy</td></tr>
<tr><td>EIGRP</td><td>Advanced distance-vector, DUAL, bandwidth + delay, unequal-cost load balancing, 224.0.0.10, protocol 88</td></tr>
<tr><td>BGP</td><td>Path-vector EGP, TCP 179, AS path se loop prevention, policy-based</td></tr>
<tr><td>RIP (legacy)</td><td>Hop count, 15 max, 16 unreachable, UDP 520</td></tr>
<tr><td>NAT types</td><td>Static 1:1, dynamic pool, PAT port se many-to-one</td></tr>
<tr><td>FHRPs</td><td>HSRP (Cisco, active/standby), VRRP (open, master/backup), GLBP (Cisco, load balancing)</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! static aur default routes</span>
ip route 10.2.2.0 255.255.255.0 10.0.12.2
ip route 0.0.0.0 0.0.0.0 203.0.113.1
ip route 0.0.0.0 0.0.0.0 198.51.100.1 10        <span class="c">! floating backup</span>
<span class="c">! OSPF</span>
router ospf 1
 network 10.0.0.0 0.255.255.255 area 0
 network 192.168.0.0 0.0.255.255 area 0
<span class="c">! verification</span>
show ip route
show ip route 192.168.2.10
show ip route ospf
show ip interface brief
show ip ospf neighbor
show ip protocols
<span class="c">! hosts se</span>
ping 10.1.1.10
trace 8.8.8.8</pre>

<div class="eg"><p><b>Worked example: ek sawaal, har idea.</b> Router ke paas <code>S 10.0.0.0/8 [1/0]</code>, <code>O 10.2.0.0/16 [110/20]</code> aur <code>D 10.2.2.0/24 [90/3072]</code> hain. Ek packet 10.2.2.77 ko jaata hai. Teeno match karte hain; /24 sabse lamba hai, isliye EIGRP route use hota hai chahe static route ki AD kam ho. 10.2.9.1 ka packet OSPF /16 use karta hai. 10.9.9.9 ka packet static /8 use karta hai. 172.16.0.1 ka packet drop hota hai jab tak default route na ho.</p></div>

<div class="warn"><p><b>Aakhri minute ki galtiyan jinse bachna hai.</b> Alag prefix lengths ke beech AD compare karna; return route bhoolna; OSPF mein wildcard aur subnet masks mein confuse hona; yeh sochna ki floating route local link ke aage ke failures par react karta hai; BGP ko link-state kehna.</p></div>

<div class="exam"><p><b>Exam strategy.</b> "Kaunsa route use hoga" wale questions mein pehle destination aur prefix lengths underline karo, phir AD, phir metric. "Kaunsa protocol" wale questions mein clue words dhoondho: SPF/areas (OSPF), DUAL/feasible successor (EIGRP), AS/TCP 179 (BGP), hop count (RIP).</p></div>

<div class="scn"><h4>Nayi branch par sab kuch ek saath</h4><p>Ek engineer ne do uplinks ke saath branch kholi: HQ ki taraf OSPF chalata MPLS, aur backup ke liye broadband. OSPF HQ routes le jaata tha, broadband ke through floating static default (AD 130) background mein wait karta tha, PAT branch users ko zaroorat padne par hi broadband address par translate karta tha, aur do branch routers gateway ke roop mein VRRP VIP share karte the, staff aur guest VLANs ke liye subinterfaces ke saath. Pehle MPLS outage mein OSPF routes gayab hue, floating default aaya, aur users broadband par kaam karte rahe. Sirf monitoring alert se pata chala.</p><p><b>Seekh:</b> is module ka har hissa ek building block hai. Real designs unhe milaate hain.</p></div>

<div class="iv"><p class="q">"Ek HQ, paanch branches aur do ISPs wali company ke liye routing kaise design karoge, summarise karo."</p><p>Strong answer: IGP ke roop mein OSPF, HQ par area 0, branches size ke hisaab se area 0 ya apne areas mein; internet ki taraf default routes HQ se originate hon; dono ISPs ke saath eBGP (ya BGP available na ho to tracking ke saath static defaults); edge par PAT; gateway redundancy ke liye HQ par FHRP pair; branches par floating static ya LTE backup; aur ek documented troubleshooting runbook. Ek trade-off samjhao, jaise static ki simplicity vs dynamic failover.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route selection longest prefix, phir AD, phir metric hai; AD table zubaani yaad rakho.</li>
<li>Static aur default routes stubs aur edges ke liye theek hain; floating statics simple backups dete hain.</li>
<li>OSPF (link-state), EIGRP (advanced distance-vector) aur BGP (path-vector) alag problems solve karte hain.</li>
<li>NAT/PAT, VIPs ke saath FHRP aur subinterfaces objective 2.1 poora karte hain.</li>
<li>Fixed order mein troubleshoot karo aur hamesha dono directions check karo.</li>
</ul></div>
`}};export{e as default};