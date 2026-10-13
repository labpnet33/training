var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before an exam, a pilot runs a checklist even if she has flown a thousand hours. Use this chapter the same way: tick every line honestly. Anything you cannot do or explain is the next thing to revise or to practise in the labs.</p>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain connected, static and dynamic routes, longest-prefix match and administrative distance, and apply them in the right order.</li>
<li>I can explain why transport VRs and LAN VRs are separate and name what each holds.</li>
<li>I can configure the transport VR default and specific static routes with the correct next hop for Internet, MPLS and LTE.</li>
<li>I can explain floating static routes and why SD-WAN uses SLA and transport priority for LTE backup.</li>
<li>I can describe what MP-BGP carries between branches and the Controller and why the Controller acts like a route reflector.</li>
<li>I can describe LAN-side routing with static, OSPF and BGP, plus redistribution and the loop risk.</li>
<li>I can explain tenants, segments, route leaking and shared services.</li>
<li>I can compare full mesh, hub-and-spoke and regional hubs, and local versus central breakout.</li>
<li>I can complete vs-lan-advertise, vs-mpls-route and vs-tenant-mismatch without hints.</li>
<li>I can run the bottom-up reachability workflow and write the evidence line.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Underlay</dt><dd>The transport circuits and routes that make tunnel endpoints reachable.</dd>
<dt>Overlay</dt><dd>Tunnels between sites plus the tenant routes carried over them.</dd>
<dt>Transport VR</dt><dd>A virtual router facing one circuit (Internet-Transport-VR, MPLS-Transport-VR, LTE-Transport-VR).</dd>
<dt>LAN VR</dt><dd>A tenant virtual router holding LAN and learned overlay routes.</dd>
<dt>Organization (tenant)</dt><dd>The administrative and routing boundary, shown as orgs org Acme.</dd>
<dt>Site-id</dt><dd>Unique number of a site inside an organization (101, 102, 103).</dd>
<dt>MP-BGP</dt><dd>Multiprotocol BGP, the control protocol between VOS branches and the Controller.</dd>
<dt>Route leaking</dt><dd>Deliberately copying selected routes between VRs.</dd>
<dt>Redistribution</dt><dd>Advertising routes learned one way (static, OSPF) into another (overlay).</dd>
<dt>Floating static</dt><dd>A static route with worse preference that appears only if the better route disappears.</dd>
<dt>Next hop</dt><dd>The address the packet is handed to; it must be reachable.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Route selection</td><td>Longest prefix first, then lowest administrative distance, then metric</td></tr>
<tr><td>Static route</td><td>Next hop must be inside a connected subnet</td></tr>
<tr><td>Course addressing</td><td>Internet 203.0.113.(4k)/30, MPLS 172.31.k.0/30, LTE 100.64.k.0/30, LAN 10.1.k.0/24</td></tr>
<tr><td>Controller addresses</td><td>198.51.100.20 (Internet), 172.31.100.2 (MPLS); Director is 198.51.100.10</td></tr>
<tr><td>Session conditions</td><td>One tunnel up, same organization, site-id and correct Controller address</td></tr>
<tr><td>LAN reachability</td><td>Both overlays Established, same organization, LAN interface configured</td></tr>
<tr><td>Full mesh tunnels</td><td>N(N-1)/2</td></tr>
<tr><td>Segmentation</td><td>Organization is the hard boundary; VRs inside are segments</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">configure
set interfaces vni-0/3 unit 0 family inet address 10.1.2.1/24
set interfaces vni-0/3 enable true
set routing-instances MPLS-Transport-VR routing-options static route 172.31.0.0/16 next-hop 172.31.1.1
set orgs org Acme sd-wan site-id 103
set orgs org Acme sd-wan controllers 198.51.100.20
set orgs org Acme sd-wan wan-interfaces vni-0/0 transport Internet
delete orgs org Guest
show | compare
commit
rollback
exit</pre>
<pre class="out">show interfaces brief
show route
ping 10.1.1.10
show orgs org Acme sd-wan brief
show orgs org Acme sd-wan wan-interfaces
show orgs org Acme sd-wan sla-monitor status
show orgs org Acme sd-wan sites
show bgp neighbor brief</pre>
<p>These commands belong to the simplified course model. Real VOS offers far richer syntax, and the Director GUI and workflow wizards handle most of this through templates. Practise the logic here, then adapt on real platforms.</p>

<h3>What comes next</h3>
<p>The next module covers SD-WAN policy: SLA profiles, forwarding profiles, application rules and path selection, which decide <b>which</b> of the tunnels you made reachable carries each kind of traffic. Without the routes from this module, policy has nothing to steer.</p>

<div class="warn"><p><b>Common mistake.</b> Memorising commands without the reason behind them. Exams and interviews test why a symptom points to a layer.</p></div>
<div class="exam"><p><b>Exam trap.</b> Words such as "interface up", "carrier healthy" or "Established" are partial evidence. Look for what they do not prove.</p></div>

<div class="scn"><h4>The 15-minute handover</h4><p>An engineer finishing her shift handed three open tickets to the night team with one page: for each ticket the symptom, the layer, the evidence line and the next command. The night team closed two within the hour. The page used exactly the five-layer order from this module.</p><p><b>Lesson:</b> a shared method makes handovers fast.</p></div>
<div class="iv"><p class="q">"Summarise how reachability works in a Versa SD-WAN."</p><p>Underlay routes in transport VRs bring tunnels up; each branch peers with the Controller using MP-BGP in its tenant; branches originate LAN prefixes, the Controller reflects them within the organization, and traffic flows over tunnels between sites. Troubleshoot bottom up: interface, underlay, identity, overlay, prefix and path.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay brings tunnels up; overlay routes move user traffic.</li>
<li>Prefixes need a configured LAN interface, an Established session and a matching organization.</li>
<li>Most faults are simple: missing LAN address, wrong next hop, wrong organization.</li>
<li>Use the five-layer bottom-up workflow and verify from the user side.</li>
<li>The lab CLI is a simplified model; concepts carry over to real Versa.</li>
</ul></div>
`,hi:`
<p>Exam se pehle pilot checklist chalati hai, chahe usne hazaar ghante udaan bhari ho. Is chapter ko waise hi use karo: har line ko imaandari se tick karo. Jo kuch aap nahi kar paate ya explain nahi kar paate, woh agla revise ya labs mein practise karne wala topic hai.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Main connected, static aur dynamic routes, longest-prefix match aur administrative distance explain kar sakta hoon aur sahi order mein apply kar sakta hoon.</li>
<li>Main explain kar sakta hoon ki transport VRs aur LAN VRs alag kyun hain aur har ek mein kya hota hai.</li>
<li>Main Internet, MPLS aur LTE ke liye transport VR ke default aur specific static routes sahi next hop ke saath configure kar sakta hoon.</li>
<li>Main floating static routes explain kar sakta hoon aur batata hoon ki SD-WAN LTE backup ke liye SLA aur transport priority kyun use karta hai.</li>
<li>Main describe kar sakta hoon ki MP-BGP branches aur Controller ke beech kya carry karta hai aur Controller route reflector jaisa kyun hai.</li>
<li>Main static, OSPF aur BGP ke saath LAN-side routing, redistribution aur loop risk describe kar sakta hoon.</li>
<li>Main tenants, segments, route leaking aur shared services explain kar sakta hoon.</li>
<li>Main full mesh, hub-and-spoke aur regional hubs, aur local versus central breakout compare kar sakta hoon.</li>
<li>Main vs-lan-advertise, vs-mpls-route aur vs-tenant-mismatch bina hints ke complete kar sakta hoon.</li>
<li>Main bottom-up reachability workflow chala sakta hoon aur evidence line likh sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Underlay</dt><dd>Transport circuits aur woh routes jo tunnel endpoints ko reachable banate hain.</dd>
<dt>Overlay</dt><dd>Sites ke beech tunnels plus un par carry hone wale tenant routes.</dd>
<dt>Transport VR</dt><dd>Ek circuit ko face karne wala virtual router (Internet-Transport-VR, MPLS-Transport-VR, LTE-Transport-VR).</dd>
<dt>LAN VR</dt><dd>Tenant virtual router jisme LAN aur seekhe hue overlay routes hote hain.</dd>
<dt>Organization (tenant)</dt><dd>Administrative aur routing boundary, orgs org Acme ke roop mein dikhti hai.</dd>
<dt>Site-id</dt><dd>Organization ke andar site ka unique number (101, 102, 103).</dd>
<dt>MP-BGP</dt><dd>Multiprotocol BGP, VOS branches aur Controller ke beech control protocol.</dd>
<dt>Route leaking</dt><dd>Chune hue routes ko VRs ke beech jaan-boojh kar copy karna.</dd>
<dt>Redistribution</dt><dd>Ek tareeke (static, OSPF) se seekhe routes ko doosre (overlay) mein advertise karna.</dd>
<dt>Floating static</dt><dd>Kharab preference wala static route jo tabhi aata hai jab behtar route gayab ho.</dd>
<dt>Next hop</dt><dd>Woh address jise packet handover hota hai; woh reachable hona chahiye.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Route selection</td><td>Pehle longest prefix, phir lowest administrative distance, phir metric</td></tr>
<tr><td>Static route</td><td>Next hop connected subnet ke andar hona chahiye</td></tr>
<tr><td>Course addressing</td><td>Internet 203.0.113.(4k)/30, MPLS 172.31.k.0/30, LTE 100.64.k.0/30, LAN 10.1.k.0/24</td></tr>
<tr><td>Controller addresses</td><td>198.51.100.20 (Internet), 172.31.100.2 (MPLS); Director 198.51.100.10 hai</td></tr>
<tr><td>Session conditions</td><td>Ek tunnel up, same organization, site-id aur sahi Controller address</td></tr>
<tr><td>LAN reachability</td><td>Dono overlays Established, same organization, LAN interface configured</td></tr>
<tr><td>Full mesh tunnels</td><td>N(N-1)/2</td></tr>
<tr><td>Segmentation</td><td>Organization hard boundary hai; andar ke VRs segments</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">configure
set interfaces vni-0/3 unit 0 family inet address 10.1.2.1/24
set interfaces vni-0/3 enable true
set routing-instances MPLS-Transport-VR routing-options static route 172.31.0.0/16 next-hop 172.31.1.1
set orgs org Acme sd-wan site-id 103
set orgs org Acme sd-wan controllers 198.51.100.20
set orgs org Acme sd-wan wan-interfaces vni-0/0 transport Internet
delete orgs org Guest
show | compare
commit
rollback
exit</pre>
<pre class="out">show interfaces brief
show route
ping 10.1.1.10
show orgs org Acme sd-wan brief
show orgs org Acme sd-wan wan-interfaces
show orgs org Acme sd-wan sla-monitor status
show orgs org Acme sd-wan sites
show bgp neighbor brief</pre>
<p>Yeh commands simplified course model ke hain. Real VOS mein bahut richer syntax hai, aur Director GUI aur workflow wizards templates ke through yeh zyada tar sambhaalte hain. Yahan logic practise karo, phir real platforms par adapt karo.</p>

<h3>Aage kya aata hai</h3>
<p>Agla module SD-WAN policy cover karta hai: SLA profiles, forwarding profiles, application rules aur path selection, jo tay karte hain ki aapke banaye reachable tunnels mein se <b>kaunsa</b> har tarah ka traffic le jaaye. Is module ke routes ke bina policy ke paas steer karne ko kuch nahi.</p>

<div class="warn"><p><b>Common galti.</b> Reason samjhe bina commands ratna. Exams aur interviews yeh test karte hain ki symptom kis layer ki taraf point karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Interface up", "carrier healthy" ya "Established" jaise words partial evidence hain. Dekho ki woh kya prove nahi karte.</p></div>

<div class="scn"><h4>15 minute ka handover</h4><p>Shift khatam karti ek engineer ne teen open tickets night team ko ek page mein handover kiye: har ticket ke liye symptom, layer, evidence line aur agla command. Night team ne ghante bhar mein do close kiye. Page ne is module ka paanch-layer order hi use kiya tha.</p><p><b>Seekh:</b> shared method handovers ko tez banata hai.</p></div>
<div class="iv"><p class="q">"Versa SD-WAN mein reachability kaise kaam karti hai, summarise karo."</p><p>Transport VRs ke underlay routes tunnels up karte hain; har branch apne tenant mein Controller se MP-BGP se peer karti hai; branches LAN prefixes originate karti hain, Controller unhe organization ke andar reflect karta hai, aur traffic sites ke beech tunnels par chalta hai. Bottom up troubleshoot karo: interface, underlay, identity, overlay, prefix aur path.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay tunnels up karta hai; overlay routes user traffic chalate hain.</li>
<li>Prefixes ko configured LAN interface, Established session aur matching organization chahiye.</li>
<li>Zyada tar faults simple hain: missing LAN address, galat next hop, galat organization.</li>
<li>Paanch-layer bottom-up workflow use karo aur user side se verify karo.</li>
<li>Lab CLI simplified model hai; concepts real Versa par bhi chalte hain.</li>
</ul></div>
`}};export{e as default};