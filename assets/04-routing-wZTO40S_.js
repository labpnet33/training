var e={id:`routing`,h:{en:`Routing faults: BGP, OSPF, static routes, advertisement and segments`,hi:`Routing faults: BGP, OSPF, static routes, advertisement aur segments`},body:{en:`
<p>The tunnels are up and the paths exist, but a user still cannot reach 10.10.50.10. Think of a courier network: the roads are open (layers 2 and 3), but does the sorting office know which town holds this address? That is routing: layer 4. psd-routing taught you how BGP, OSPF, static routes and VRFs are built; this chapter teaches you how to find which part is broken, quickly, from the symptom.</p>
<h3>Follow the prefix</h3>
<p>Take the destination prefix and follow it from where it starts to where it must arrive, and then back again for the reply:</p>
<ol>
<li><b>Origin.</b> Does the site that owns the prefix know it (a connected interface, a static route, an OSPF or BGP route)?</li>
<li><b>Advertisement.</b> Is the prefix announced to the fabric? Scope matters: a prefix with local scope stays at its site. At data centers, site-level prefixes must be configured so that branches know where DC prefixes live.</li>
<li><b>Distribution.</b> Do other sites receive it, and is it in the right segment (VRF)?</li>
<li><b>Installation.</b> Is it in the routing table of the source site, and not hidden by a more specific or better route?</li>
<li><b>Return path.</b> Does the destination know how to answer? The data center core must hold the branch prefixes, and the DC ION must inject them.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="diagram">
<rect x="10" y="80" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="108" text-anchor="middle" class="svg-ink" font-size="12">1 Origin</text><text x="65" y="126" text-anchor="middle" class="svg-muted" font-size="11">prefix known</text>
<rect x="140" y="80" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="195" y="108" text-anchor="middle" class="svg-ink" font-size="12">2 Advertised</text><text x="195" y="126" text-anchor="middle" class="svg-muted" font-size="11">scope, filters</text>
<rect x="270" y="80" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="325" y="108" text-anchor="middle" class="svg-ink" font-size="12">3 Received</text><text x="325" y="126" text-anchor="middle" class="svg-muted" font-size="11">right segment</text>
<rect x="400" y="80" width="110" height="60" rx="10" fill="#fde68a"/><text x="455" y="108" text-anchor="middle" class="svg-ink" font-size="12">4 Installed</text><text x="455" y="126" text-anchor="middle" class="svg-muted" font-size="11">best route</text>
<rect x="530" y="80" width="100" height="60" rx="10" fill="#fecaca"/><text x="580" y="108" text-anchor="middle" class="svg-ink" font-size="12">5 Return</text><text x="580" y="126" text-anchor="middle" class="svg-muted" font-size="11">reply path</text>
<line x1="120" y1="110" x2="140" y2="110" stroke="#64748b" stroke-width="2"/><line x1="250" y1="110" x2="270" y2="110" stroke="#64748b" stroke-width="2"/><line x1="380" y1="110" x2="400" y2="110" stroke="#64748b" stroke-width="2"/><line x1="510" y1="110" x2="530" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">The first stage that fails tells you which tool and which setting to look at</text>
</svg><p class="cap">Five stages from the prefix at its origin to the reply. Break one, and the user sees "cannot reach".</p></div>
<h3>The ION CLI checks</h3>
<p>The ION CLI reference lists these routing commands. They are read-only and run in a remote session.</p>
<h4>Reference configuration (not run in the simulator)</h4>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! br-delhi-02 ION; use the CLI help for exact options in your release</span>
dump routing summary
dump routing peer status all
dump routing peer received-routes
dump routing peer advertised-routes
dump routing route
dump static routes
dump routing static-route config
dump bfd status
dump vrf</pre>
<p>Read them in order: <code>dump routing summary</code> (what is running), <code>dump routing peer status</code> (is each BGP peer up, with state and uptime), received and advertised routes (what came in and went out), <code>dump routing route</code> (what is installed), and <code>dump vrf</code> (which segments exist).</p>
<h4>Illustrative output, not captured from a device</h4>
<pre class="out">dump routing peer status all
BGP Peer IP : 192.0.2.10
ID : 15269236938690175
State : <span class="hl">Established</span>
Uptime : 11:42:08

BGP Peer IP : 192.0.2.11
ID : 15269236938690188
State : <span class="hl">Active</span>
Uptime : 00:00:00</pre>
<p>The format follows the documented fields (peer IP, ID, state, uptime). Peer .10 is healthy. Peer .11 is in Active: the ION is trying to open the TCP session and failing, so look at reachability, port 179, AS numbers and authentication.</p>
<h3>Signatures: symptom to cause</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Where to look</th></tr><tr><td>BGP peer Idle or Active</td><td>Wrong peer IP or remote AS, MD5 password mismatch, TCP 179 blocked, multihop or reachability problem, MTU mismatch</td><td>Peer status and config on both sides, firewall</td></tr><tr><td>Established, zero prefixes</td><td>Route map or prefix list denies, neighbour's policy, auto-generated map overriding</td><td>Received routes, route maps, prefix lists</td></tr><tr><td>Remote sites cannot reach a new subnet, origin works</td><td>Scope is local, or prefix missing from the advertise list, or a stale policy needing a soft reset</td><td>Advertised prefixes, scope</td></tr><tr><td>Works one way only</td><td>Return route missing at the core, or asymmetric path through different hubs</td><td>DC core table, preference, host tracking</td></tr><tr><td>Reaches the wrong network, or nothing</td><td>Interface in the wrong VRF, VRF missing at the far site, leak rule not matching</td><td>dump vrf, interface-to-segment mapping</td></tr><tr><td>OSPF neighbour stuck</td><td>Area, timer, network type, mask or authentication mismatch</td><td>OSPF neighbour state, both ends</td></tr><tr><td>Static route vanished</td><td>The next hop failed its reachability probe</td><td>Static route status</td></tr><tr><td>Branches cannot reach DC prefixes</td><td>DC site-level prefixes not configured, or BGP to the core not announcing them</td><td>DC site prefixes, core peering</td></tr></table>
<p>BGP is generally preferred to static routes for scale and resilience; static routes at the data center are needed only when BGP is not running between the DC ION and the core. A reminder from the best practices article: always configure the site-level prefixes for data center sites, because branches use the DC prefixes to route traffic to private applications.</p>
<div class="eg"><p><b>Worked example.</b> Ticket: finance at dc-central cannot reach 10.20.13.0/24 at Chennai, while Chennai users reach the data center. Origin: Chennai's ION has the route via OSPF. Advertisement: the advertised-prefixes view does not list 10.20.13.0/24. The OSPF peer scope is Local. The engineer changes it to Global scope, and the prefix appears in the advertised list and in dc-central's routing table. Return path: dc-central's core already has the default towards the DC ION. Ping works. Total time: six minutes, because the order of checks was followed.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Debugging the VPN when the prefix is just not advertised. Hard-resetting a production BGP peer instead of a soft reset after a policy edit. Changing three settings at once. Reading only the session state ("Established, so routing is fine"). Forgetting the return path and the VRF on the far side. Overlooking route maps that the system generated.</p></div>
<div class="exam"><p><b>Exam trap.</b> Learn three signatures: Established with zero prefixes is a policy or filter problem; works one way is a return route or asymmetry problem; reaches the wrong network is a VRF assignment problem. A peer in Idle or Active is a session problem (reachability, AS, authentication, port 179).</p></div>
<div class="scn"><h4>The soft reset nobody did</h4><p>An engineer at Harbor Retail edited a prefix list at 09:20 to add a new store subnet, but the subnet never appeared at the data center. The BGP peer was Established and no error was visible. The edit had not been applied to the existing session; a soft reset of the peer made the prefix appear, and the ERP became reachable from the new store.</p><p><b>Lesson:</b> after a filter edit, apply it with a soft reset, and do not trust "Established" as proof of routes.</p></div>
<div class="iv"><p class="q">"BGP is Established but the branch cannot reach a data center subnet. What next?"</p><p>An Established session only says the TCP connection works. I check the received and advertised routes for that prefix, the prefix lists and route maps in both directions (including auto-generated ones), that the DC site-level prefixes exist, the VRF of the interface and the prefix, and the return path at the core. After a filter edit I apply a soft reset.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Follow the prefix: origin, advertisement, distribution, installation, return path.</li><li>Commands: dump routing summary, peer status, received and advertised routes, route, vrf, bfd.</li><li>Three signatures: Established with no prefixes (filters), one way (return route), wrong network (VRF).</li><li>Scope Local keeps a prefix at its site; set Global scope when other sites need it.</li><li>Configure DC site-level prefixes; use soft reset after policy edits.</li></ul></div>
`,hi:`
<p>Tunnels up hain aur paths maujood hain, phir bhi user 10.10.50.10 tak nahi pahunch pa raha. Courier network socho: roads khule hain (layers 2 aur 3), par kya sorting office ko pata hai ki yeh address kis shehar mein hai? Yahi routing hai: layer 4. psd-routing ne sikhaya ki BGP, OSPF, static routes aur VRFs kaise bante hain; yeh chapter sikhata hai ki symptom se jaldi kaise pata karein ki kaun sa hissa toota hai.</p>
<h3>Prefix ko follow karo</h3>
<p>Destination prefix lo aur use shuruat se manzil tak follow karo, aur phir reply ke liye wapas:</p>
<ol>
<li><b>Origin.</b> Kya prefix ka maalik site use jaanti hai (connected interface, static route, OSPF ya BGP route)?</li>
<li><b>Advertisement.</b> Kya prefix fabric ko announce hota hai? Scope matter karta hai: local scope wala prefix apni site par rehta hai. Data centers par site-level prefixes configure hone chahiye taaki branches jaan saken DC prefixes kahan hain.</li>
<li><b>Distribution.</b> Kya doosri sites use receive karti hain, aur kya woh sahi segment (VRF) mein hai?</li>
<li><b>Installation.</b> Kya woh source site ki routing table mein hai, aur kisi zyada specific ya behtar route se chhupa nahi?</li>
<li><b>Return path.</b> Kya destination jawab dena jaanta hai? Data center core ke paas branch prefixes hone chahiye, aur DC ION unhe inject kare.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="diagram">
<rect x="10" y="80" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="108" text-anchor="middle" class="svg-ink" font-size="12">1 Origin</text><text x="65" y="126" text-anchor="middle" class="svg-muted" font-size="11">prefix known</text>
<rect x="140" y="80" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="195" y="108" text-anchor="middle" class="svg-ink" font-size="12">2 Advertised</text><text x="195" y="126" text-anchor="middle" class="svg-muted" font-size="11">scope, filters</text>
<rect x="270" y="80" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="325" y="108" text-anchor="middle" class="svg-ink" font-size="12">3 Received</text><text x="325" y="126" text-anchor="middle" class="svg-muted" font-size="11">right segment</text>
<rect x="400" y="80" width="110" height="60" rx="10" fill="#fde68a"/><text x="455" y="108" text-anchor="middle" class="svg-ink" font-size="12">4 Installed</text><text x="455" y="126" text-anchor="middle" class="svg-muted" font-size="11">best route</text>
<rect x="530" y="80" width="100" height="60" rx="10" fill="#fecaca"/><text x="580" y="108" text-anchor="middle" class="svg-ink" font-size="12">5 Return</text><text x="580" y="126" text-anchor="middle" class="svg-muted" font-size="11">reply path</text>
<line x1="120" y1="110" x2="140" y2="110" stroke="#64748b" stroke-width="2"/><line x1="250" y1="110" x2="270" y2="110" stroke="#64748b" stroke-width="2"/><line x1="380" y1="110" x2="400" y2="110" stroke="#64748b" stroke-width="2"/><line x1="510" y1="110" x2="530" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Jo pehla stage fail ho woh batata hai kaun sa tool aur kaun si setting dekhni hai</text>
</svg><p class="cap">Origin par prefix se reply tak paanch stages. Ek tode, aur user ko "cannot reach" dikhta hai.</p></div>
<h3>ION CLI checks</h3>
<p>ION CLI reference yeh routing commands list karta hai. Yeh read-only hain aur remote session mein chalte hain.</p>
<h4>Reference configuration (not run in the simulator)</h4>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! br-delhi-02 ION; use the CLI help for exact options in your release</span>
dump routing summary
dump routing peer status all
dump routing peer received-routes
dump routing peer advertised-routes
dump routing route
dump static routes
dump routing static-route config
dump bfd status
dump vrf</pre>
<p>Inhe order mein padho: <code>dump routing summary</code> (kya chal raha hai), <code>dump routing peer status</code> (har BGP peer up hai, state aur uptime ke saath), received aur advertised routes (kya aaya aur gaya), <code>dump routing route</code> (kya installed hai), aur <code>dump vrf</code> (kaun se segments hain).</p>
<h4>Illustrative output, not captured from a device</h4>
<pre class="out">dump routing peer status all
BGP Peer IP : 192.0.2.10
ID : 15269236938690175
State : <span class="hl">Established</span>
Uptime : 11:42:08

BGP Peer IP : 192.0.2.11
ID : 15269236938690188
State : <span class="hl">Active</span>
Uptime : 00:00:00</pre>
<p>Format documented fields (peer IP, ID, state, uptime) ko follow karta hai. Peer .10 healthy hai. Peer .11 Active mein hai: ION TCP session kholne ki koshish kar raha hai aur fail ho raha hai, isliye reachability, port 179, AS numbers aur authentication dekho.</p>
<h3>Signatures: symptom se wajah</h3>
<table class="cmp"><tr><th>Symptom</th><th>Sambhavit wajah</th><th>Kahan dekhein</th></tr><tr><td>BGP peer Idle ya Active</td><td>Galat peer IP ya remote AS, MD5 password mismatch, TCP 179 blocked, multihop ya reachability problem, MTU mismatch</td><td>Dono sides par peer status aur config, firewall</td></tr><tr><td>Established, zero prefixes</td><td>Route map ya prefix list deny karti hai, neighbour ki policy, auto-generated map override kar raha hai</td><td>Received routes, route maps, prefix lists</td></tr><tr><td>Remote sites naye subnet tak nahi pahunchti, origin chalta hai</td><td>Scope local hai, ya prefix advertise list se missing, ya stale policy ko soft reset chahiye</td><td>Advertised prefixes, scope</td></tr><tr><td>Sirf ek taraf chalta hai</td><td>Core par return route missing, ya alag hubs se asymmetric path</td><td>DC core table, preference, host tracking</td></tr><tr><td>Galat network tak ya kahin nahi</td><td>Interface galat VRF mein, far site par VRF missing, leak rule match nahi karti</td><td>dump vrf, interface-to-segment mapping</td></tr><tr><td>OSPF neighbour atka</td><td>Area, timer, network type, mask ya authentication mismatch</td><td>OSPF neighbour state, dono ends</td></tr><tr><td>Static route gayab</td><td>Next hop reachability probe mein fail hua</td><td>Static route status</td></tr><tr><td>Branches DC prefixes tak nahi pahunchte</td><td>DC site-level prefixes configure nahi, ya core ko BGP unhe announce nahi kar raha</td><td>DC site prefixes, core peering</td></tr></table>
<p>Scale aur resilience ke liye BGP aam taur par static routes se behtar hai; data center par static routes tab chahiye jab DC ION aur core ke beech BGP nahi chal raha. Best practices article ki yaad dilaane wali baat: data center sites ke liye site-level prefixes hamesha configure karo, kyunki branches private applications tak traffic route karne ke liye DC prefixes use karte hain.</p>
<div class="eg"><p><b>Worked example.</b> Ticket: dc-central ka finance Chennai ke 10.20.13.0/24 tak nahi pahunch pa raha, jabki Chennai users data center tak pahunchte hain. Origin: Chennai ke ION mein OSPF se route hai. Advertisement: advertised-prefixes view mein 10.20.13.0/24 list nahi hai. OSPF peer scope Local hai. Engineer use Global scope par badalta hai, aur prefix advertised list aur dc-central ki routing table mein aa jaata hai. Return path: dc-central ke core ke paas DC ION ki taraf default pehle se hai. Ping chalta hai. Kul samay: chhe minute, kyunki checks ka order follow kiya gaya.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> VPN debug karna jabki prefix bas advertise nahi hua. Policy edit ke baad soft reset ke bajay production BGP peer ka hard reset. Teen settings ek saath badalna. Sirf session state padhna ("Established hai, to routing theek hai"). Return path aur far side ka VRF bhool jaana. System ke generated route maps ko nazarandaz karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Teen signatures seekho: zero prefixes ke saath Established policy ya filter problem hai; sirf ek taraf chalna return route ya asymmetry problem hai; galat network tak pahunchna VRF assignment problem hai. Idle ya Active peer session problem hai (reachability, AS, authentication, port 179).</p></div>
<div class="scn"><h4>Woh soft reset jo kisi ne nahi kiya</h4><p>Harbor Retail ke engineer ne 09:20 par naye store subnet ko jodne ke liye prefix list edit ki, par subnet data center par kabhi nahi dikha. BGP peer Established tha aur koi error nahi dikha. Edit maujooda session par apply nahi hua tha; peer ka soft reset karne se prefix aa gaya, aur naye store se ERP reachable ho gaya.</p><p><b>Seekh:</b> filter edit ke baad use soft reset se apply karo, aur routes ke saboot ke roop mein "Established" par bharosa mat karo.</p></div>
<div class="iv"><p class="q">"BGP Established hai par branch data center subnet tak nahi pahunch raha. Aage kya?"</p><p>Established session sirf itna batata hai ki TCP connection chalta hai. Main us prefix ke received aur advertised routes, dono directions ke prefix lists aur route maps (auto-generated sahit), DC site-level prefixes, interface aur prefix ka VRF, aur core par return path check karta hoon. Filter edit ke baad soft reset se apply karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Prefix follow karo: origin, advertisement, distribution, installation, return path.</li><li>Commands: dump routing summary, peer status, received aur advertised routes, route, vrf, bfd.</li><li>Teen signatures: no prefixes ke saath Established (filters), ek taraf (return route), galat network (VRF).</li><li>Scope Local prefix ko uski site par rakhta hai; jab doosri sites ko chahiye to Global scope set karo.</li><li>DC site-level prefixes configure karo; policy edits ke baad soft reset use karo.</li></ul></div>
`}};export{e as default};