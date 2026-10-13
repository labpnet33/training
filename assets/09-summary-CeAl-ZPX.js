var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>This chapter ties OSPF and BGP on the FortiGate into one checklist, a glossary and the facts that matter most for the exam. All FortiOS configuration of this module was reference only; practise the protocols themselves on the simulator's routers.</p>
<h3>Can-do checklist</h3>
<ul><li>Say when to use static, OSPF and BGP on a FortiGate.</li><li>List what must match for OSPF neighbours: area, timers, authentication, stub flags, subnet, MTU.</li><li>Configure OSPF with network statements, passive interfaces, ospf-interface, authentication and a default route.</li><li>Read an OSPF neighbour list and decide what each state means.</li><li>Configure eBGP to two providers with prefix-lists and route-maps, local preference and prepending.</li><li>Explain iBGP, next-hop-self and update-source loopback.</li><li>Diagnose Idle, Active and Established-with-zero-prefixes.</li><li>Explain why a learned route still needs a firewall policy and passes the reverse-path check.</li></ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>LSA</dt><dd>Link-state advertisement flooded inside an OSPF area.</dd><dt>ABR / ASBR</dt><dd>Area border router / router that brings in external routes.</dd><dt>Passive interface</dt><dd>Advertises its network but sends no hellos.</dd><dt>AS / ASN</dt><dd>Autonomous system and its number (private 64512 to 65534).</dd><dt>eBGP / iBGP</dt><dd>BGP between ASes (20) / inside an AS (200).</dd><dt>Local preference</dt><dd>Higher wins; chooses the exit from the AS.</dd><dt>Prefix-list / route-map</dt><dd>Filter and attribute-changing objects.</dd><dt>Redistribution</dt><dd>Copying routes from one protocol or source into another.</dd></dl>
<h3>Most-tested facts</h3>
<ul><li>Distances: static 10, eBGP 20, OSPF 110, iBGP 200.</li><li>OSPF defaults: hello 10 s, dead 40 s; reference bandwidth 1000 Mbit/s.</li><li>ExStart or Exchange stuck means MTU mismatch.</li><li>A BGP network statement needs the exact prefix in the routing table.</li><li>A BGP session in Active is failing at TCP 179.</li><li>Routing never replaces the firewall policy.</li></ul>
<h3>Command cheat-sheet (reference)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config router ospf
config router bgp
config router prefix-list
config router route-map
get router info ospf neighbor
get router info ospf interface
get router info routing-table ospf
get router info bgp summary
get router info bgp neighbors 203.0.113.1 advertised-routes
get router info routing-table bgp
diagnose ip router ospf all enable
diagnose ip router bgp all enable
diagnose debug disable</pre>
<h3>Where to practise</h3>
<p>The simulator's routers run these protocols today: <b>enarsi-ospf</b> and <b>jncis-ospf</b> for OSPF neighbours, areas, authentication and troubleshooting, <b>enarsi-bgp</b> for eBGP, iBGP and route-maps, and <b>ccna-ospf</b> for the basics. For the FortiGate-specific routing foundation, repeat the labs in <b>nse4-routing</b>.</p>
<div class="exam"><p><b>Exam trap.</b> Watch the trap "OSPF learns the prefix so traffic works". A policy, NAT and the reverse-path check also have to pass.</p></div>
<div class="scn"><h4>The interview whiteboard</h4><p>An interviewer drew two FortiGates, a /30 link and a provider, and asked how to build routing. The candidate chose OSPF area 0 with passive LANs and MD5 inside, eBGP with a prefix-list and local preference to the provider, a route-map filtering redistribution, and finished by saying the firewall policies still had to be written. He got the offer.</p><p><b>Lesson:</b> A complete design includes protocol, filters and permissions.</p></div>
<div class="iv"><p class="q">"Summarise dynamic routing on a FortiGate in two minutes."</p><p>OSPF inside the organisation: network statements pick the interfaces and areas, passive interfaces face users, neighbours need matching parameters and I verify with neighbour, interface and routing-table commands. BGP to providers: remote-as, network statement, prefix-lists and route-maps, local preference for the exit, prepending for the entry, and filters to avoid transit. Distances 10, 20, 110, 200 decide between sources. Routes still need firewall policies.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>OSPF inside, BGP at the edge and over SD-WAN overlays.</li><li>Neighbour parameters and BGP states explain most failures.</li><li>Filter every redistribution and every outbound BGP advertisement.</li><li>Routes do not replace firewall policies.</li></ul></div>
`,hi:`
<p>Yeh chapter FortiGate par OSPF aur BGP ko ek checklist, glossary aur exam ke sabse zaroori facts mein jodta hai. Is module ki saari FortiOS configuration sirf reference thi; protocols ko khud simulator ke routers par practise karo.</p>
<h3>Can-do checklist</h3>
<ul><li>Batao ki FortiGate par static, OSPF aur BGP kab use karne hain.</li><li>OSPF neighbours ke liye kya match hona chahiye list karo: area, timers, authentication, stub flags, subnet, MTU.</li><li>Network statements, passive interfaces, ospf-interface, authentication aur default route ke saath OSPF configure karo.</li><li>OSPF neighbour list padho aur tay karo ki har state ka kya matlab hai.</li><li>Prefix-lists aur route-maps, local preference aur prepending ke saath do providers se eBGP configure karo.</li><li>iBGP, next-hop-self aur update-source loopback samjhao.</li><li>Idle, Active aur zero-prefixes wale Established ko diagnose karo.</li><li>Samjhao ki learned route ko firewall policy kyun chahiye aur woh reverse-path check kaise paar karta hai.</li></ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>LSA</dt><dd>OSPF area ke andar flood hone wala link-state advertisement.</dd><dt>ABR / ASBR</dt><dd>Area border router / router jo external routes laata hai.</dd><dt>Passive interface</dt><dd>Apna network advertise karta hai par hellos nahi bhejta.</dd><dt>AS / ASN</dt><dd>Autonomous system aur uska number (private 64512 se 65534).</dd><dt>eBGP / iBGP</dt><dd>ASes ke beech BGP (20) / AS ke andar (200).</dd><dt>Local preference</dt><dd>Zyada jeetti hai; AS se exit chunti hai.</dd><dt>Prefix-list / route-map</dt><dd>Filter aur attribute badalne wale objects.</dd><dt>Redistribution</dt><dd>Ek protocol ya source ke routes ko doosre mein copy karna.</dd></dl>
<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul><li>Distances: static 10, eBGP 20, OSPF 110, iBGP 200.</li><li>OSPF defaults: hello 10 s, dead 40 s; reference bandwidth 1000 Mbit/s.</li><li>ExStart ya Exchange atka matlab MTU mismatch.</li><li>BGP network statement ko routing table mein exact prefix chahiye.</li><li>Active mein BGP session TCP 179 par fail ho raha hai.</li><li>Routing kabhi firewall policy ki jagah nahi leti.</li></ul>
<h3>Command cheat-sheet (reference)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config router ospf
config router bgp
config router prefix-list
config router route-map
get router info ospf neighbor
get router info ospf interface
get router info routing-table ospf
get router info bgp summary
get router info bgp neighbors 203.0.113.1 advertised-routes
get router info routing-table bgp
diagnose ip router ospf all enable
diagnose ip router bgp all enable
diagnose debug disable</pre>
<h3>Kahan practise karein</h3>
<p>Simulator ke routers aaj yeh protocols chalate hain: OSPF neighbours, areas, authentication aur troubleshooting ke liye <b>enarsi-ospf</b> aur <b>jncis-ospf</b>, eBGP, iBGP aur route-maps ke liye <b>enarsi-bgp</b>, aur basics ke liye <b>ccna-ospf</b>. FortiGate-specific routing foundation ke liye <b>nse4-routing</b> ke labs repeat karo.</p>
<div class="exam"><p><b>Exam trap.</b> Is trap par dhyan do: "OSPF ne prefix seekha isliye traffic chalega". Policy, NAT aur reverse-path check bhi paas hone chahiye.</p></div>
<div class="scn"><h4>Interview whiteboard</h4><p>Interviewer ne do FortiGates, ek /30 link aur ek provider banaya aur poocha ki routing kaise banayenge. Candidate ne andar passive LANs aur MD5 ke saath OSPF area 0, provider ke liye prefix-list aur local preference ke saath eBGP, redistribution filter karne wala route-map chuna, aur yeh kehkar khatam kiya ki firewall policies ab bhi likhni hongi. Use offer mil gaya.</p><p><b>Seekh:</b> Poore design mein protocol, filters aur permissions shamil hote hain.</p></div>
<div class="iv"><p class="q">"Do minute mein FortiGate par dynamic routing summarise karo."</p><p>Organisation ke andar OSPF: network statements interfaces aur areas chunte hain, passive interfaces users ki taraf, neighbours ko matching parameters chahiye aur main neighbour, interface aur routing-table commands se verify karta hoon. Providers ke saath BGP: remote-as, network statement, prefix-lists aur route-maps, exit ke liye local preference, entry ke liye prepending, aur transit se bachne ke liye filters. Distances 10, 20, 110, 200 sources ke beech tay karti hain. Routes ko phir bhi firewall policies chahiye.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Andar OSPF, edge par aur SD-WAN overlays par BGP.</li><li>Neighbour parameters aur BGP states zyada tar failures samjhate hain.</li><li>Har redistribution aur har outbound BGP advertisement ko filter karo.</li><li>Routes firewall policies ki jagah nahi lete.</li></ul></div>
`}};export{e as default};