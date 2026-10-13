var e={id:`routing-protocol-checklist`,h:{en:`The routing-protocol checklist`,hi:`Routing-protocol checklist`},body:{en:`
<p>Think of how news travels between offices in a company. First, two offices must be on speaking terms. Then the sender must actually mention the news. The receiver must hear it and not throw it away as irrelevant. If the receiver hears two versions of the same story, it must decide which source to believe. And if the news has to pass between two departments that speak different languages, someone must translate it. Routing protocols work the same way, and when a route is missing, one of those five steps failed. Chapter 4 sent you here when the routing table had no route or the wrong one; this chapter tells you how to find out why.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Routing protocol checklist">
<rect x="10" y="30" width="116" height="60" rx="8" fill="#bae6fd"/><text x="68" y="56" text-anchor="middle" class="svg-ink" font-size="12">1 Neighbours</text><text x="68" y="74" text-anchor="middle" class="svg-muted" font-size="12">up and stable?</text>
<rect x="136" y="30" width="116" height="60" rx="8" fill="#bae6fd"/><text x="194" y="56" text-anchor="middle" class="svg-ink" font-size="12">2 Advertised</text><text x="194" y="74" text-anchor="middle" class="svg-muted" font-size="12">sent at all?</text>
<rect x="262" y="30" width="116" height="60" rx="8" fill="#fde68a"/><text x="320" y="56" text-anchor="middle" class="svg-ink" font-size="12">3 Received</text><text x="320" y="74" text-anchor="middle" class="svg-muted" font-size="12">or filtered?</text>
<rect x="388" y="30" width="116" height="60" rx="8" fill="#fed7aa"/><text x="446" y="56" text-anchor="middle" class="svg-ink" font-size="12">4 Wins in RIB</text><text x="446" y="74" text-anchor="middle" class="svg-muted" font-size="12">AD, metric</text>
<rect x="514" y="30" width="116" height="60" rx="8" fill="#ddd6fe"/><text x="572" y="56" text-anchor="middle" class="svg-ink" font-size="12">5 Redistribution</text><text x="572" y="74" text-anchor="middle" class="svg-muted" font-size="12">between domains</text>
<line x1="126" y1="60" x2="136" y2="60" stroke="#64748b" stroke-width="2"/><line x1="252" y1="60" x2="262" y2="60" stroke="#64748b" stroke-width="2"/><line x1="378" y1="60" x2="388" y2="60" stroke="#64748b" stroke-width="2"/><line x1="504" y1="60" x2="514" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="68" y="120" text-anchor="middle" class="svg-muted" font-size="12">nbr tables</text>
<text x="194" y="120" text-anchor="middle" class="svg-muted" font-size="12">LSDB, topology</text>
<text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">filters, stub</text>
<text x="446" y="120" text-anchor="middle" class="svg-muted" font-size="12">show ip route</text>
<text x="572" y="120" text-anchor="middle" class="svg-muted" font-size="12">seed metric</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">Where does the prefix disappear?</text>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="12">Find the first router on which it is missing, then ask which step failed there</text>
</svg><p class="cap">Five questions for any missing or wrong route, whatever the protocol.</p></div>

<h3>1. Are the neighbours up?</h3>
<p>No neighbour, no routes. Check the neighbour table of the protocol involved:</p>
<pre class="out">R2# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">10.255.0.1        1   FULL/BDR        00:00:34    10.0.12.1       GigabitEthernet0/0</span>
R2# show ip eigrp neighbors
EIGRP-IPv4 Neighbors for AS(100)
H   Address                 Interface              Hold Uptime   SRTT   RTO  Q  Seq
                                                   (sec)         (ms)       Cnt Num
<span class="hl">0   10.0.23.2               Gi0/1                    13 01:02:11    1   100  0  27</span></pre>
<p>If a neighbour is missing, check that the interface is enabled for the protocol and not passive (<code>show ip protocols</code>, <code>show ip ospf interface brief</code>, <code>show ip eigrp interfaces</code>), then the parameters that must match. OSPF: area, subnet, hello and dead timers, authentication, network type, MTU (stuck in ExStart/Exchange), stub flags, unique router IDs. EIGRP: AS number, K values, subnet, authentication. BGP: <code>remote-as</code>, reachability of the peer address, <code>update-source</code>, eBGP multihop/TTL, and TCP port 179 allowed through ACLs. Also watch the <b>uptime</b>: a neighbour that keeps restarting is as bad as a missing one.</p>

<h3>2. Is the route being advertised?</h3>
<p>Go to the router that <b>originates</b> the prefix. Is it in the protocol at all? The interface must be covered by a <code>network</code> statement or interface command, or the prefix must be redistributed. In BGP, a <code>network</code> statement only advertises a prefix that exists in the routing table with the <b>exact</b> same mask. Look at the protocol database: <code>show ip ospf database</code> (the LSA must exist), <code>show ip eigrp topology</code>, <code>show ip bgp</code> and <code>show ip bgp neighbors 10.0.0.1 advertised-routes</code>. Summarisation also changes what is advertised: a summary hides the specific prefixes behind it.</p>

<h3>3. Is it received, or filtered?</h3>
<p>On the next router, is the route arriving? Filters can remove it on the way out of the sender or on the way into the receiver: distribute lists, prefix lists, route maps, BGP inbound policy, EIGRP stub (a stub router does not re-advertise learned routes by default), OSPF stub areas (no type 5 external LSAs) and split horizon on hub interfaces. For BGP, <code>show ip bgp neighbors 10.0.0.1 routes</code> shows what was accepted after inbound policy; <code>received-routes</code> shows everything received but needs <code>soft-reconfiguration inbound</code>.</p>
<p>One OSPF detail is heavily tested: a <code>distribute-list in</code> under OSPF filters routes from entering the <b>routing table</b>, not LSAs from the database. So the LSA is present in <code>show ip ospf database</code> while the route is missing from <code>show ip route</code>.</p>

<h3>4. Does it win in the routing table?</h3>
<p>The route may be received and still not installed. The router first compares prefixes with the same length; among those, the lowest <b>administrative distance</b> (AD) wins, and within one protocol the lowest <b>metric</b>. A static route (AD 1) beats OSPF (110) for the same prefix; an external EIGRP route (170) loses to OSPF. In BGP, <code>show ip bgp</code> marks a best path that could not be installed with <b>r</b> for RIB-failure, usually because a lower-AD source already owns that prefix. Chapter 8 goes deep on route selection.</p>

<h3>5. Is redistribution doing its job?</h3>
<p>When the prefix must cross from one protocol to another, check the redistributing router. Redistribution only takes routes that are in the RIB <b>via the source protocol</b> (plus connected networks covered by that protocol). Each target protocol needs a sensible <b>seed metric</b>: OSPF assigns 20 by default (1 for routes from BGP) as external type 2; classic EIGRP needs an explicit metric for routes from other routing protocols, or nothing is redistributed. Route maps and tags on the redistribution line may filter prefixes. Mutual redistribution at two or more points can cause loops and suboptimal routing, which the redistribution module covers in depth.</p>
<pre class="out">R2# show ip protocols | section eigrp
Routing Protocol is "eigrp 100"
  Outgoing update filter list for all interfaces is not set
  Incoming update filter list for all interfaces is not set
  Default networks flagged in outgoing updates
  Default networks accepted from incoming updates
<span class="hl">  Redistributing: ospf 1</span>
  EIGRP-IPv4 Protocol for AS(100)
    Metric weight K1=1, K2=0, K3=1, K4=0, K5=0</pre>

<div class="eg"><p><b>Worked example.</b> R3 has no route to 10.1.10.0/24. Step 1: the EIGRP neighbour R2 is up. Step 2: the prefix should be advertised by R2 into EIGRP through redistribution. On R2, <code>show ip eigrp topology 10.1.10.0/24</code> returns <code>%Entry 10.1.10.0/24 not in topology table</code>. So R2 is not advertising it. Step 5: <code>show run | section router eigrp</code> shows <code>redistribute ospf 1</code> with no metric and no <code>default-metric</code>. Classic EIGRP needs a seed metric for OSPF routes. The fix:</p>
<pre class="code"><span class="c">! Give redistributed OSPF routes a seed metric: bandwidth (kbps) delay (tens of usec) reliability load MTU</span>
R2(config)# router eigrp 100
R2(config-router)# redistribute ospf 1 metric 100000 10 255 1 1500</pre>
<p>Afterwards R3 shows <code>D EX 10.1.10.0/24 [170/...] via 10.0.23.1</code>. The external marker and AD 170 confirm it came from redistribution.</p></div>

<div class="warn"><p><b>Common mistake.</b> Looking only at the router where the symptom appears. Walk back toward the originator and find the <b>first</b> router on which the prefix is missing; the cause is on that router or on its upstream neighbour.</p></div>

<div class="exam"><p><b>Exam trap.</b> "The route is in the OSPF database but not in the routing table" points to a <code>distribute-list in</code> or to a better route from a lower-AD source. "The route is in the BGP table with r" means RIB-failure. "Redistributed into EIGRP but nothing appears" means a missing seed metric.</p></div>

<div class="scn"><h4>The stub that stopped the transit</h4><p>A company added a second WAN router at a branch and configured both branch routers as EIGRP stubs, copied from the single-router template. The hub could no longer reach the LAN behind the second router when its own WAN link failed, because the first router, being a stub, did not re-advertise routes learned from its neighbour. Neighbours were up and nothing was filtered by a list, so the cause hid in step 3 (received, but not propagated). Adding <code>eigrp stub connected summary leak-map</code> for the needed prefixes restored the backup path.</p><p><b>Lesson:</b> "filtered" includes protocol features like stub and stub areas, not only distribute lists.</p></div>

<div class="iv"><p class="q">"A route is missing on a router. Walk me through how you find out why."</p><p>Say you find the first router where it is missing, then check: neighbours up and stable, is the originator advertising it (network statement, redistribution, database), is it received or filtered (distribute lists, prefix lists, route maps, stub, area types, split horizon), does it win in the RIB (longest match, AD, metric, BGP RIB-failure), and whether redistribution has a seed metric and correct filters. Name the commands for each step.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five steps: neighbours, advertised, received or filtered, wins in the RIB, redistribution.</li>
<li>Find the first router on which the prefix is missing; the cause is there or on its upstream neighbour.</li>
<li>OSPF <code>distribute-list in</code> filters the RIB, not the LSDB.</li>
<li>BGP <code>r</code> means RIB-failure; BGP <code>network</code> needs an exact RIB match.</li>
<li>Classic EIGRP needs a seed metric for routes redistributed from other routing protocols; OSPF defaults to 20 as E2.</li>
</ul></div>
`,hi:`
<p>Socho ki company ke offices ke beech khabar kaise failti hai. Pehle, do offices ke beech baatcheet honi chahiye. Phir bhejne wala khabar ka zikr kare. Receiver use sune aur bekaar samajh kar phenk na de. Agar receiver ek hi kahani ke do versions sune, to use decide karna hai kis source par bharosa kare. Aur agar khabar alag bhasha bolne wale do departments ke beech jaani hai, to kisi ko translate karna padega. Routing protocols bilkul aise hi kaam karte hain, aur jab route missing ho, to in paanch steps mein se ek fail hua hai. Chapter 4 ne aapko yahan bheja tha jab routing table mein route nahi tha ya galat tha; yeh chapter batata hai ki kyun, yeh kaise pata karein.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Routing protocol checklist">
<rect x="10" y="30" width="116" height="60" rx="8" fill="#bae6fd"/><text x="68" y="56" text-anchor="middle" class="svg-ink" font-size="12">1 Neighbours</text><text x="68" y="74" text-anchor="middle" class="svg-muted" font-size="12">up aur stable?</text>
<rect x="136" y="30" width="116" height="60" rx="8" fill="#bae6fd"/><text x="194" y="56" text-anchor="middle" class="svg-ink" font-size="12">2 Advertised</text><text x="194" y="74" text-anchor="middle" class="svg-muted" font-size="12">bheja bhi?</text>
<rect x="262" y="30" width="116" height="60" rx="8" fill="#fde68a"/><text x="320" y="56" text-anchor="middle" class="svg-ink" font-size="12">3 Received</text><text x="320" y="74" text-anchor="middle" class="svg-muted" font-size="12">ya filtered?</text>
<rect x="388" y="30" width="116" height="60" rx="8" fill="#fed7aa"/><text x="446" y="56" text-anchor="middle" class="svg-ink" font-size="12">4 RIB mein jeeta</text><text x="446" y="74" text-anchor="middle" class="svg-muted" font-size="12">AD, metric</text>
<rect x="514" y="30" width="116" height="60" rx="8" fill="#ddd6fe"/><text x="572" y="56" text-anchor="middle" class="svg-ink" font-size="12">5 Redistribution</text><text x="572" y="74" text-anchor="middle" class="svg-muted" font-size="12">domains ke beech</text>
<line x1="126" y1="60" x2="136" y2="60" stroke="#64748b" stroke-width="2"/><line x1="252" y1="60" x2="262" y2="60" stroke="#64748b" stroke-width="2"/><line x1="378" y1="60" x2="388" y2="60" stroke="#64748b" stroke-width="2"/><line x1="504" y1="60" x2="514" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="68" y="120" text-anchor="middle" class="svg-muted" font-size="12">nbr tables</text>
<text x="194" y="120" text-anchor="middle" class="svg-muted" font-size="12">LSDB, topology</text>
<text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">filters, stub</text>
<text x="446" y="120" text-anchor="middle" class="svg-muted" font-size="12">show ip route</text>
<text x="572" y="120" text-anchor="middle" class="svg-muted" font-size="12">seed metric</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">Prefix kahan gayab hota hai?</text>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="12">Pehla router dhoondho jahan woh missing hai, phir poochho wahan kaunsa step fail hua</text>
</svg><p class="cap">Kisi bhi missing ya galat route ke liye paanch sawaal, protocol koi bhi ho.</p></div>

<h3>1. Kya neighbours up hain?</h3>
<p>Neighbour nahi, to routes nahi. Involved protocol ki neighbour table check karo:</p>
<pre class="out">R2# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">10.255.0.1        1   FULL/BDR        00:00:34    10.0.12.1       GigabitEthernet0/0</span>
R2# show ip eigrp neighbors
EIGRP-IPv4 Neighbors for AS(100)
H   Address                 Interface              Hold Uptime   SRTT   RTO  Q  Seq
                                                   (sec)         (ms)       Cnt Num
<span class="hl">0   10.0.23.2               Gi0/1                    13 01:02:11    1   100  0  27</span></pre>
<p>Agar neighbour missing hai, to check karo ki interface protocol ke liye enabled hai aur passive nahi hai (<code>show ip protocols</code>, <code>show ip ospf interface brief</code>, <code>show ip eigrp interfaces</code>), phir woh parameters jo match hone chahiye. OSPF: area, subnet, hello aur dead timers, authentication, network type, MTU (ExStart/Exchange mein atka), stub flags, unique router IDs. EIGRP: AS number, K values, subnet, authentication. BGP: <code>remote-as</code>, peer address ki reachability, <code>update-source</code>, eBGP multihop/TTL, aur ACLs se TCP port 179 allowed. <b>Uptime</b> bhi dekho: baar baar restart hone wala neighbour missing neighbour jitna hi bura hai.</p>

<h3>2. Kya route advertise ho raha hai?</h3>
<p>Us router par jao jo prefix <b>originate</b> karta hai. Kya woh protocol mein hai bhi? Interface kisi <code>network</code> statement ya interface command se cover hona chahiye, ya prefix redistribute hona chahiye. BGP mein <code>network</code> statement sirf woh prefix advertise karta hai jo routing table mein <b>exact</b> same mask ke saath ho. Protocol database dekho: <code>show ip ospf database</code> (LSA exist karna chahiye), <code>show ip eigrp topology</code>, <code>show ip bgp</code> aur <code>show ip bgp neighbors 10.0.0.1 advertised-routes</code>. Summarisation bhi badalta hai ki kya advertise hota hai: summary apne peeche ke specific prefixes chhupa deta hai.</p>

<h3>3. Kya receive hua, ya filter hua?</h3>
<p>Agle router par, kya route aa raha hai? Filters ise sender se nikalte waqt ya receiver mein aate waqt hata sakte hain: distribute lists, prefix lists, route maps, BGP inbound policy, EIGRP stub (stub router default mein seekhe hue routes re-advertise nahi karta), OSPF stub areas (type 5 external LSAs nahi) aur hub interfaces par split horizon. BGP ke liye, <code>show ip bgp neighbors 10.0.0.1 routes</code> inbound policy ke baad accept hue routes dikhata hai; <code>received-routes</code> sab kuch received dikhata hai par iske liye <code>soft-reconfiguration inbound</code> chahiye.</p>
<p>Ek OSPF detail bahut test hoti hai: OSPF ke neeche <code>distribute-list in</code> routes ko <b>routing table</b> mein aane se rokta hai, database se LSAs ko nahi. Isliye LSA <code>show ip ospf database</code> mein maujood hota hai jabki route <code>show ip route</code> se missing hota hai.</p>

<h3>4. Kya woh routing table mein jeet-ta hai?</h3>
<p>Route receive hokar bhi install na ho, aisa ho sakta hai. Router pehle same length wale prefixes compare karta hai; unmein sabse kam <b>administrative distance</b> (AD) jeet-ta hai, aur ek protocol ke andar sabse kam <b>metric</b>. Same prefix ke liye static route (AD 1) OSPF (110) ko haraata hai; external EIGRP route (170) OSPF se haarta hai. BGP mein <code>show ip bgp</code> us best path ko jo install nahi ho saka <b>r</b> se mark karta hai, RIB-failure, aam taur par isliye ki kam AD wala source us prefix ka pehle se maalik hai. Chapter 8 route selection mein gehrai tak jaata hai.</p>

<h3>5. Kya redistribution apna kaam kar raha hai?</h3>
<p>Jab prefix ko ek protocol se doosre mein jaana ho, to redistributing router check karo. Redistribution sirf woh routes leta hai jo RIB mein <b>source protocol ke through</b> hain (plus us protocol se covered connected networks). Har target protocol ko sahi <b>seed metric</b> chahiye: OSPF default mein 20 deta hai (BGP se aaye routes ko 1) external type 2 ke roop mein; classic EIGRP ko doosre routing protocols ke routes ke liye explicit metric chahiye, warna kuch redistribute nahi hota. Redistribution line par route maps aur tags prefixes filter kar sakte hain. Do ya zyada points par mutual redistribution loops aur suboptimal routing bana sakta hai, jo redistribution module gehrai se cover karta hai.</p>
<pre class="out">R2# show ip protocols | section eigrp
Routing Protocol is "eigrp 100"
  Outgoing update filter list for all interfaces is not set
  Incoming update filter list for all interfaces is not set
  Default networks flagged in outgoing updates
  Default networks accepted from incoming updates
<span class="hl">  Redistributing: ospf 1</span>
  EIGRP-IPv4 Protocol for AS(100)
    Metric weight K1=1, K2=0, K3=1, K4=0, K5=0</pre>

<div class="eg"><p><b>Worked example.</b> R3 ke paas 10.1.10.0/24 ka route nahi hai. Step 1: EIGRP neighbour R2 up hai. Step 2: prefix R2 dwara redistribution ke through EIGRP mein advertise hona chahiye. R2 par <code>show ip eigrp topology 10.1.10.0/24</code> <code>%Entry 10.1.10.0/24 not in topology table</code> deta hai. Yaani R2 ise advertise nahi kar raha. Step 5: <code>show run | section router eigrp</code> bina metric aur bina <code>default-metric</code> ke <code>redistribute ospf 1</code> dikhata hai. Classic EIGRP ko OSPF routes ke liye seed metric chahiye. Fix:</p>
<pre class="code"><span class="c">! Redistributed OSPF routes ko seed metric do: bandwidth (kbps) delay (tens of usec) reliability load MTU</span>
R2(config)# router eigrp 100
R2(config-router)# redistribute ospf 1 metric 100000 10 255 1 1500</pre>
<p>Iske baad R3 <code>D EX 10.1.10.0/24 [170/...] via 10.0.23.1</code> dikhata hai. External marker aur AD 170 confirm karte hain ki yeh redistribution se aaya.</p></div>

<div class="warn"><p><b>Common galti.</b> Sirf us router ko dekhna jahan symptom dikhta hai. Originator ki taraf wapas chalo aur woh <b>pehla</b> router dhoondho jahan prefix missing hai; cause usi router par ya uske upstream neighbour par hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Route OSPF database mein hai par routing table mein nahi" <code>distribute-list in</code> ya kam AD wale source ke better route ki taraf ishaara karta hai. "Route BGP table mein r ke saath hai" matlab RIB-failure. "EIGRP mein redistribute kiya par kuch nahi dikhta" matlab missing seed metric.</p></div>

<div class="scn"><h4>Woh stub jisne transit rok diya</h4><p>Ek company ne ek branch par doosra WAN router joda aur dono branch routers ko EIGRP stubs configure kiya, single-router template se copy karke. Jab doosre router ka apna WAN link fail hua, hub uske peeche ke LAN tak nahi pahunch saka, kyunki pehla router, stub hone ki wajah se, apne neighbour se seekhe routes re-advertise nahi karta tha. Neighbours up the aur kisi list se kuch filter nahi tha, isliye cause step 3 mein chhupa tha (receive hua, par aage propagate nahi hua). Zaroori prefixes ke liye <code>eigrp stub connected summary leak-map</code> jodne se backup path wapas aa gaya.</p><p><b>Seekh:</b> "filtered" mein stub aur stub areas jaise protocol features bhi aate hain, sirf distribute lists nahi.</p></div>

<div class="iv"><p class="q">"Ek router par route missing hai. Mujhe batao aap kaise pata karoge kyun."</p><p>Batao ki aap pehla router dhoondhte ho jahan woh missing hai, phir check karte ho: neighbours up aur stable, kya originator ise advertise kar raha hai (network statement, redistribution, database), kya receive hua ya filter hua (distribute lists, prefix lists, route maps, stub, area types, split horizon), kya RIB mein jeet-ta hai (longest match, AD, metric, BGP RIB-failure), aur kya redistribution mein seed metric aur sahi filters hain. Har step ke commands naam lo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch steps: neighbours, advertised, received ya filtered, RIB mein jeet, redistribution.</li>
<li>Pehla router dhoondho jahan prefix missing hai; cause wahin ya uske upstream neighbour par hai.</li>
<li>OSPF <code>distribute-list in</code> RIB ko filter karta hai, LSDB ko nahi.</li>
<li>BGP <code>r</code> matlab RIB-failure; BGP <code>network</code> ko RIB mein exact match chahiye.</li>
<li>Classic EIGRP ko doosre routing protocols se redistribute hue routes ke liye seed metric chahiye; OSPF default 20 as E2 deta hai.</li>
</ul></div>
`}};export{e as default};