var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>A pilot runs the same checklist before every flight, no matter how many thousand hours she has flown. The checklist is short, it is always in the same order, and it catches the mistakes that experience alone misses. This last chapter is your ENARSI pre-flight checklist: the method, the two checklists, the commands, the facts most often tested, and a glossary. Come back to it before every later module and before the exam.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Module summary map">
<rect x="230" y="15" width="180" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Ticket</text>
<rect x="30" y="95" width="180" height="60" rx="8" fill="#bae6fd"/><text x="120" y="120" text-anchor="middle" class="svg-ink" font-size="13">Process</text><text x="120" y="140" text-anchor="middle" class="svg-muted" font-size="12">define ... document</text>
<rect x="230" y="95" width="180" height="60" rx="8" fill="#fde68a"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">Approach</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">top-down, path, compare</text>
<rect x="430" y="95" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="520" y="120" text-anchor="middle" class="svg-ink" font-size="13">Checklists</text><text x="520" y="140" text-anchor="middle" class="svg-muted" font-size="12">forwarding, protocol</text>
<rect x="130" y="185" width="380" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="212" text-anchor="middle" class="svg-ink" font-size="13">Toolkit: show, ping, debug, logs, SLA, EPC</text>
<line x1="320" y1="59" x2="120" y2="95" stroke="#64748b" stroke-width="2"/><line x1="320" y1="59" x2="320" y2="95" stroke="#64748b" stroke-width="2"/><line x1="320" y1="59" x2="520" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="120" y1="155" x2="250" y2="185" stroke="#64748b" stroke-width="2"/><line x1="320" y1="155" x2="320" y2="185" stroke="#64748b" stroke-width="2"/><line x1="520" y1="155" x2="390" y2="185" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The whole module on one page: process, approach, checklists, toolkit.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can state the ENARSI 300-410 v1.1 domains and weights: Layer 3 35%, VPN 20%, Infrastructure Security 20%, Infrastructure Services 25%.</li>
<li>I can list the eight process steps in order and explain why defining the problem and documenting matter most.</li>
<li>I can choose between top-down, bottom-up, divide and conquer, follow the path, compare configurations and component swapping from a symptom.</li>
<li>I can run the packet-forwarding checklist on each hop: Layer 2, ARP, RIB, CEF, ACL/NAT/PBR, return path.</li>
<li>I can run the routing-protocol checklist: neighbours, advertised, received or filtered, wins in the RIB, redistribution.</li>
<li>I can debug safely, set up logging with timestamps, and use SNMP, syslog, NetFlow, IP SLA and EPC as evidence.</li>
<li>I can read every field of a routing table entry and predict route selection with longest match, AD and metric.</li>
<li>I can roll back safely with <code>configure terminal revert timer</code> and <code>configure replace</code>.</li>
<li>I can work a multi-fault ticket to the end without breaking constraints.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Baseline</dt><dd>A record of normal behaviour (CPU, memory, traffic, routes, neighbours) used to spot abnormal behaviour.</dd>
<dt>RIB</dt><dd>Routing information base: the routing table of best routes from all sources.</dd>
<dt>FIB</dt><dd>Forwarding information base built by CEF from the RIB, with recursion resolved.</dd>
<dt>Adjacency table</dt><dd>CEF table of pre-built Layer 2 headers for each next hop, built from ARP and ND.</dd>
<dt>Administrative distance</dt><dd>Trust value of a route source; lower wins for identical prefixes; local only.</dd>
<dt>Seed metric</dt><dd>The starting metric given to routes when they are redistributed into another protocol.</dd>
<dt>Floating static</dt><dd>A static route with a raised AD so that it is used only when the dynamic route disappears.</dd>
<dt>Conditional debug</dt><dd>A debug limited by an interface, neighbour, ACL or other condition to protect the CPU.</dd>
<dt>EPC</dt><dd>Embedded Packet Capture: capturing packets on the router and exporting a pcap file.</dd>
<dt>Simlet</dt><dd>An exam item with a live topology for show commands and several related questions.</dd>
</dl>

<h3>Most tested facts</h3>
<ul>
<li>AD: connected 0, static 1, EIGRP summary 5, eBGP 20, EIGRP 90, OSPF 110, IS-IS 115, RIP 120, EIGRP external 170, iBGP 200, unusable 255.</li>
<li>Longest match beats AD; AD compares only identical prefixes; metric compares only within one protocol.</li>
<li>OSPF preference: intra-area, inter-area, E1/N1, E2/N2, regardless of cost.</li>
<li>OSPF <code>distribute-list in</code> filters the routing table, not the LSDB.</li>
<li>Classic EIGRP needs a seed metric for routes from other routing protocols; OSPF uses 20 (1 for BGP) as E2 by default.</li>
<li>BGP <code>r</code> = RIB-failure; BGP <code>network</code> needs an exact prefix and mask in the RIB.</li>
<li>PBR is processed before the routing table on the interface where it is applied.</li>
<li><code>debug ip packet</code> shows only process-switched packets.</li>
<li>Syslog levels 0 to 7: emergencies, alerts, critical, errors, warnings, notifications, informational, debugging.</li>
<li>Ping codes: <b>!</b> reply, <b>.</b> timeout, <b>U</b> unreachable, <b>M</b> could not fragment; traceroute <b>A</b> = administratively prohibited.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Where does this destination go?</span>
show ip route 10.3.30.10
show ip route 10.3.0.0 255.255.0.0 longer-prefixes
show ip cef exact-route 10.1.10.10 10.3.30.10
<span class="c">! Control plane overview</span>
show ip protocols
show ip ospf neighbor
show ip eigrp neighbors
show ip bgp summary
show ip route summary
<span class="c">! Policy on the path</span>
show ip interface Gi0/2 | include access list
show access-lists
show ip policy
show ip nat translations
<span class="c">! Tests</span>
ping 10.3.30.10 source Gi0/1 repeat 100 size 1400 df-bit
traceroute 10.3.30.10 source 10.1.10.1 numeric
<span class="c">! Evidence and change</span>
show logging | include ADJCHG|NBRCHANGE
show archive log config all
show archive config differences flash:R3-cfg-2 system:running-config
configure terminal revert timer 5
configure confirm
configure replace flash:R3-cfg-2 list
undebug all</pre>

<div class="eg"><p><b>Worked example: a two-minute self-test.</b> Cover the page and answer: (1) Which domain is 25%? Infrastructure Services. (2) Route in OSPF database, not in RIB: two likely causes? A distribute list in, or the same prefix from a lower-AD source. (3) PC can ping, cannot browse: which approach? Top-down. (4) Which command shows the exact exit interface for a flow? <code>show ip cef exact-route</code>. If you got all four in under two minutes, you are ready for the technology modules.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating this module as "soft" material and skipping to the protocols. Every later lab and ticket assumes you run the checklists automatically. Practise them until you no longer think about the order.</p></div>

<div class="exam"><p><b>Exam trap.</b> Watch for answers that are true statements but do not answer the question asked. In troubleshooting items, the right answer is the one that explains the specific evidence shown, not a generally good practice.</p></div>

<div class="scn"><h4>From checklist to habit</h4><p>A NOC team adopted the two checklists from this module as a laminated card at every desk. For the first month engineers ticked each line; after that they no longer needed the card. Their mean time to resolve routing incidents fell noticeably, and escalations to senior engineers dropped, because junior engineers now arrived with a precise fault domain and evidence instead of "the network is down".</p><p><b>Lesson:</b> a checklist practised deliberately becomes instinct, and instinct built on method is what ENARSI measures.</p></div>

<div class="iv"><p class="q">"What makes a good network troubleshooter?"</p><p>A strong answer mentions method (a structured process and checklists), fundamentals (how routers really forward and select routes), tools (targeted show commands, safe debugging, logs, IP SLA, captures), discipline (one change at a time, rollback, respecting constraints) and communication (a clear problem statement and documentation). Give a short example of a ticket you solved that way.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ENARSI is a troubleshooting exam: Layer 3 35%, VPN 20%, Security 20%, Services 25%.</li>
<li>Process: define, gather, analyse, eliminate, propose, test, solve, document.</li>
<li>Two checklists: packet forwarding per hop, and the routing-protocol checklist for missing or wrong routes.</li>
<li>Targeted commands and safe tools save time and protect the network.</li>
<li>Smallest fix, respect constraints, verify end to end, document; every later module builds on this.</li>
</ul></div>
`,hi:`
<p>Pilot har flight se pehle wahi checklist chalati hai, chahe usne kitne hi hazaar ghante udaan bhari ho. Checklist chhoti hai, hamesha same order mein hai, aur woh galtiyan pakadti hai jo sirf experience se chhoot jaati hain. Yeh aakhri chapter aapki ENARSI pre-flight checklist hai: method, do checklists, commands, sabse zyada test hone wale facts, aur ek glossary. Har agle module se pehle aur exam se pehle yahan wapas aao.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Module summary map">
<rect x="230" y="15" width="180" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Ticket</text>
<rect x="30" y="95" width="180" height="60" rx="8" fill="#bae6fd"/><text x="120" y="120" text-anchor="middle" class="svg-ink" font-size="13">Process</text><text x="120" y="140" text-anchor="middle" class="svg-muted" font-size="12">define ... document</text>
<rect x="230" y="95" width="180" height="60" rx="8" fill="#fde68a"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">Approach</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">top-down, path, compare</text>
<rect x="430" y="95" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="520" y="120" text-anchor="middle" class="svg-ink" font-size="13">Checklists</text><text x="520" y="140" text-anchor="middle" class="svg-muted" font-size="12">forwarding, protocol</text>
<rect x="130" y="185" width="380" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="212" text-anchor="middle" class="svg-ink" font-size="13">Toolkit: show, ping, debug, logs, SLA, EPC</text>
<line x1="320" y1="59" x2="120" y2="95" stroke="#64748b" stroke-width="2"/><line x1="320" y1="59" x2="320" y2="95" stroke="#64748b" stroke-width="2"/><line x1="320" y1="59" x2="520" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="120" y1="155" x2="250" y2="185" stroke="#64748b" stroke-width="2"/><line x1="320" y1="155" x2="320" y2="185" stroke="#64748b" stroke-width="2"/><line x1="520" y1="155" x2="390" y2="185" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Poora module ek page par: process, approach, checklists, toolkit.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main ENARSI 300-410 v1.1 ke domains aur weights bata sakta hoon: Layer 3 35%, VPN 20%, Infrastructure Security 20%, Infrastructure Services 25%.</li>
<li>Main aath process steps order mein list kar sakta hoon aur samjha sakta hoon ki problem define karna aur document karna sabse zyada kyun matter karta hai.</li>
<li>Main symptom se top-down, bottom-up, divide and conquer, follow the path, compare configurations aur component swapping mein se chun sakta hoon.</li>
<li>Main har hop par packet-forwarding checklist chala sakta hoon: Layer 2, ARP, RIB, CEF, ACL/NAT/PBR, return path.</li>
<li>Main routing-protocol checklist chala sakta hoon: neighbours, advertised, received ya filtered, RIB mein jeet, redistribution.</li>
<li>Main safely debug kar sakta hoon, timestamps ke saath logging set up kar sakta hoon, aur SNMP, syslog, NetFlow, IP SLA aur EPC ko saboot ki tarah use kar sakta hoon.</li>
<li>Main routing table entry ka har field padh sakta hoon aur longest match, AD aur metric se route selection predict kar sakta hoon.</li>
<li>Main <code>configure terminal revert timer</code> aur <code>configure replace</code> se safely roll back kar sakta hoon.</li>
<li>Main constraints tode bina multi-fault ticket ko aakhir tak solve kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Baseline</dt><dd>Normal behaviour ka record (CPU, memory, traffic, routes, neighbours) jo abnormal behaviour pakadne ke liye use hota hai.</dd>
<dt>RIB</dt><dd>Routing information base: saare sources ke best routes ki routing table.</dd>
<dt>FIB</dt><dd>CEF dwara RIB se bani forwarding information base, recursion resolve karke.</dd>
<dt>Adjacency table</dt><dd>Har next hop ke liye pehle se bane Layer 2 headers ki CEF table, ARP aur ND se bani.</dd>
<dt>Administrative distance</dt><dd>Route source ki trust value; identical prefixes ke liye kam wala jeet-ta hai; sirf local.</dd>
<dt>Seed metric</dt><dd>Doosre protocol mein redistribute hote routes ko diya gaya shuruaati metric.</dd>
<dt>Floating static</dt><dd>Badhaye hue AD wala static route taaki woh sirf dynamic route gayab hone par use ho.</dd>
<dt>Conditional debug</dt><dd>CPU bachane ke liye interface, neighbour, ACL ya kisi aur condition se limited debug.</dd>
<dt>EPC</dt><dd>Embedded Packet Capture: router par packets capture karke pcap file export karna.</dd>
<dt>Simlet</dt><dd>Show commands ke liye live topology aur kai related sawaalon wala exam item.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<ul>
<li>AD: connected 0, static 1, EIGRP summary 5, eBGP 20, EIGRP 90, OSPF 110, IS-IS 115, RIP 120, EIGRP external 170, iBGP 200, unusable 255.</li>
<li>Longest match AD ko haraata hai; AD sirf identical prefixes compare karta hai; metric sirf ek protocol ke andar compare hota hai.</li>
<li>OSPF preference: intra-area, inter-area, E1/N1, E2/N2, cost chahe jo ho.</li>
<li>OSPF <code>distribute-list in</code> routing table filter karta hai, LSDB nahi.</li>
<li>Classic EIGRP ko doosre routing protocols ke routes ke liye seed metric chahiye; OSPF default mein 20 (BGP ke liye 1) as E2 use karta hai.</li>
<li>BGP <code>r</code> = RIB-failure; BGP <code>network</code> ko RIB mein exact prefix aur mask chahiye.</li>
<li>PBR jis interface par laga hai wahan routing table se pehle process hota hai.</li>
<li><code>debug ip packet</code> sirf process-switched packets dikhata hai.</li>
<li>Syslog levels 0 se 7: emergencies, alerts, critical, errors, warnings, notifications, informational, debugging.</li>
<li>Ping codes: <b>!</b> reply, <b>.</b> timeout, <b>U</b> unreachable, <b>M</b> could not fragment; traceroute <b>A</b> = administratively prohibited.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Yeh destination kahan jaata hai?</span>
show ip route 10.3.30.10
show ip route 10.3.0.0 255.255.0.0 longer-prefixes
show ip cef exact-route 10.1.10.10 10.3.30.10
<span class="c">! Control plane overview</span>
show ip protocols
show ip ospf neighbor
show ip eigrp neighbors
show ip bgp summary
show ip route summary
<span class="c">! Path par policy</span>
show ip interface Gi0/2 | include access list
show access-lists
show ip policy
show ip nat translations
<span class="c">! Tests</span>
ping 10.3.30.10 source Gi0/1 repeat 100 size 1400 df-bit
traceroute 10.3.30.10 source 10.1.10.1 numeric
<span class="c">! Saboot aur change</span>
show logging | include ADJCHG|NBRCHANGE
show archive log config all
show archive config differences flash:R3-cfg-2 system:running-config
configure terminal revert timer 5
configure confirm
configure replace flash:R3-cfg-2 list
undebug all</pre>

<div class="eg"><p><b>Worked example: do minute ka self-test.</b> Page dhako aur jawab do: (1) Kaunsa domain 25% hai? Infrastructure Services. (2) Route OSPF database mein hai, RIB mein nahi: do likely causes? Distribute list in, ya kam AD wale source se same prefix. (3) PC ping kar sakta hai, browse nahi: kaunsa approach? Top-down. (4) Kaunsa command ek flow ka exact exit interface dikhata hai? <code>show ip cef exact-route</code>. Agar chaaron do minute se kam mein sahi hue, to aap technology modules ke liye tayyar ho.</p></div>

<div class="warn"><p><b>Common galti.</b> Is module ko "soft" material maankar seedha protocols par koodna. Har agla lab aur ticket maanta hai ki aap checklists automatically chalate ho. Unhe tab tak practise karo jab tak order ke baare mein sochna na pade.</p></div>

<div class="exam"><p><b>Exam trap.</b> Aise answers se saavdhaan raho jo sach statements hain par poochhe gaye sawaal ka jawab nahi dete. Troubleshooting items mein sahi answer woh hai jo dikhaaye gaye specific saboot ko samjhaaye, koi generally achhi practice nahi.</p></div>

<div class="scn"><h4>Checklist se aadat tak</h4><p>Ek NOC team ne is module ki do checklists ko har desk par laminated card ki tarah apnaya. Pehle mahine engineers har line tick karte the; uske baad unhe card ki zaroorat nahi rahi. Routing incidents resolve karne ka unka average time kaafi ghat gaya, aur senior engineers tak escalations kam hue, kyunki junior engineers ab "network down hai" ki jagah precise fault domain aur saboot ke saath aate the.</p><p><b>Seekh:</b> soch samajhkar practise ki gayi checklist instinct ban jaati hai, aur method par bani instinct hi woh cheez hai jo ENARSI naapta hai.</p></div>

<div class="iv"><p class="q">"Achha network troubleshooter kya banata hai?"</p><p>Strong answer method (structured process aur checklists), fundamentals (routers asal mein kaise forward karte aur routes chunte hain), tools (targeted show commands, safe debugging, logs, IP SLA, captures), discipline (ek baar mein ek change, rollback, constraints ka samman) aur communication (clear problem statement aur documentation) mention karta hai. Aise solve kiye ek ticket ka chhota example do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ENARSI troubleshooting exam hai: Layer 3 35%, VPN 20%, Security 20%, Services 25%.</li>
<li>Process: define, gather, analyse, eliminate, propose, test, solve, document.</li>
<li>Do checklists: har hop par packet forwarding, aur missing ya galat routes ke liye routing-protocol checklist.</li>
<li>Targeted commands aur safe tools time bachate hain aur network ko protect karte hain.</li>
<li>Sabse chhota fix, constraints ka samman, end to end verify, document; har agla module isi par banta hai.</li>
</ul></div>
`}};export{e as default};