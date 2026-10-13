var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You now have the full picture of routing on a PAN-OS virtual router. Use this page to check yourself before the exam and before an interview.</p>
<div class="note"><p><b>Note.</b> OSPF, BGP and redistribution have no simulator lab yet. For hands-on practice, use pan-setup and pan-nat for virtual routers, static routes and zones, and enarsi-ospf, enarsi-bgp and nse4-dynamic for protocol behaviour.</p></div>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="The path from a connected port to an allowed session; each stage can be the failing one."><rect x="20" y="40" width="100" height="80" rx="10" fill="#bae6fd"/><text x="70" y="86" text-anchor="middle" class="svg-ink" font-size="14">Interface</text><line x1="120" y1="80" x2="144" y2="80" stroke="#64748b" stroke-width="2"/><rect x="144" y="40" width="100" height="80" rx="10" fill="#bbf7d0"/><text x="194" y="86" text-anchor="middle" class="svg-ink" font-size="14">Protocol</text><line x1="244" y1="80" x2="268" y2="80" stroke="#64748b" stroke-width="2"/><rect x="268" y="40" width="100" height="80" rx="10" fill="#ddd6fe"/><text x="318" y="86" text-anchor="middle" class="svg-ink" font-size="14">Route table</text><line x1="368" y1="80" x2="392" y2="80" stroke="#64748b" stroke-width="2"/><rect x="392" y="40" width="100" height="80" rx="10" fill="#fde68a"/><text x="442" y="86" text-anchor="middle" class="svg-ink" font-size="14">Zone</text><line x1="492" y1="80" x2="516" y2="80" stroke="#64748b" stroke-width="2"/><rect x="516" y="40" width="100" height="80" rx="10" fill="#fed7aa"/><text x="566" y="86" text-anchor="middle" class="svg-ink" font-size="14">Policy</text></svg><p class="cap">The path from a connected port to an allowed session; each stage can be the failing one.</p></div>
<h3>Can-do checklist</h3>
<ul>
<li>Explain what a virtual router is and why each Layer 3 interface belongs to one.</li>
<li>State the default administrative distances without notes.</li>
<li>Build a floating static route and enable path monitoring with the right failure condition.</li>
<li>Configure OSPF with a router ID, areas, passive interfaces and authentication.</li>
<li>Configure a BGP peer group, peer, local AS and an import rule that sets local preference.</li>
<li>Advertise a static route with a redistribution profile and an export rule, with a filter.</li>
<li>Explain how the route lookup supplies the destination zone, and where PBF fits.</li>
<li>Troubleshoot in order from interface to policy using real commands.</li>
<li>Describe BFD, graceful restart and HA in relation to routing.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms">
<dt>Virtual router</dt><dd>Routing instance with its own route table, protocols and interfaces.</dd>
<dt>Administrative distance</dt><dd>Trust ranking between route sources; lower wins.</dd>
<dt>Path monitoring</dt><dd>ICMP checks that remove a static route when targets fail.</dd>
<dt>Redistribution profile</dt><dd>Object that selects routes to advertise into another protocol.</dd>
<dt>ECMP</dt><dd>Using several equal-cost paths at once.</dd>
<dt>PBF</dt><dd>Policy-based forwarding that overrides the route table for matching traffic.</dd>
<dt>FIB</dt><dd>Forwarding table built from the active routes.</dd>
</dl>
<h3>Most tested facts</h3>
<ul>
<li>Distances: static 10, EBGP 20, OSPF internal 30, OSPF external 110, RIP 120, IBGP 200.</li>
<li>Hello 10 seconds and dead counts 4 are the OSPF defaults; area, timers and auth must match.</li>
<li>BGP runs on TCP 179; only Established exchanges routes; local preference selects the exit.</li>
<li>A redistribution profile alone changes nothing; it must be referenced by an export or redistribution rule.</li>
<li>Destination zone comes from the route lookup; PBF is checked before it.</li>
<li>Empty traffic logs often indicate no route.</li>
</ul>
<h3>Command cheat-sheet</h3>
<pre class="code">show routing route
show routing route type static
show routing protocol ospf neighbor
show routing protocol bgp summary
show routing protocol bgp loc-rib
show routing fib
test routing fib-lookup virtual-router default ip 203.0.113.50
test security-policy-match source 10.10.1.20 destination 203.0.113.50 destination-port 443 protocol 6</pre>
<p>The first two commands run in the simulator; the rest are real PAN-OS commands for production.</p>
<div class="exam"><p><b>Exam trap.</b> When two answers both look right, pick the one that checks the lowest layer first: interface, neighbour, route, policy.</p></div>
<div class="scn"><h4>Passing the routing round</h4><p>In an interview for a firewall role, the candidate was given a branch with dual ISPs and a data centre over OSPF. They drew the route table sources, chose a floating static default with path monitoring, advertised the LAN with an export rule and a filter, and described how they would verify with a fib lookup. The panel noted the structure more than the detail.</p><p><b>Lesson:</b> answer in layers and name the command that proves each layer.</p></div>
<div class="iv"><p class="q">"Walk me through how you would design routing for a branch with two ISPs and a data centre."</p><p>Floating static or BGP defaults to two ISPs with path monitoring or BFD, OSPF or BGP to the data centre with authentication, filtered redistribution of branch prefixes, and policy for each possible egress zone. Close with verification: neighbours, route table, fib lookup and policy match, and a rollback plan.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Remember the six distances.</li><li>Control what you accept and what you advertise.</li><li>The route supplies the zone that policy uses.</li><li>Troubleshoot in layers and prove each with a command.</li><li>Practise in pan-setup, pan-nat, enarsi-ospf, enarsi-bgp and nse4-dynamic.</li></ul></div>
`,hi:`
<p>Ab aapke paas PAN-OS virtual router par routing ki poori picture hai. Exam aur interview se pehle khud ko check karne ke liye yeh page use karo.</p>
<div class="note"><p><b>Note.</b> OSPF, BGP aur redistribution ka abhi simulator lab nahi hai. Hands-on practice ke liye virtual routers, static routes aur zones ke liye pan-setup aur pan-nat, aur protocol behaviour ke liye enarsi-ospf, enarsi-bgp aur nse4-dynamic use karo.</p></div>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Connected port se allowed session tak ka path; har stage fail wali ho sakti hai."><rect x="20" y="40" width="100" height="80" rx="10" fill="#bae6fd"/><text x="70" y="86" text-anchor="middle" class="svg-ink" font-size="14">Interface</text><line x1="120" y1="80" x2="144" y2="80" stroke="#64748b" stroke-width="2"/><rect x="144" y="40" width="100" height="80" rx="10" fill="#bbf7d0"/><text x="194" y="86" text-anchor="middle" class="svg-ink" font-size="14">Protocol</text><line x1="244" y1="80" x2="268" y2="80" stroke="#64748b" stroke-width="2"/><rect x="268" y="40" width="100" height="80" rx="10" fill="#ddd6fe"/><text x="318" y="86" text-anchor="middle" class="svg-ink" font-size="14">Route table</text><line x1="368" y1="80" x2="392" y2="80" stroke="#64748b" stroke-width="2"/><rect x="392" y="40" width="100" height="80" rx="10" fill="#fde68a"/><text x="442" y="86" text-anchor="middle" class="svg-ink" font-size="14">Zone</text><line x1="492" y1="80" x2="516" y2="80" stroke="#64748b" stroke-width="2"/><rect x="516" y="40" width="100" height="80" rx="10" fill="#fed7aa"/><text x="566" y="86" text-anchor="middle" class="svg-ink" font-size="14">Policy</text></svg><p class="cap">Connected port se allowed session tak ka path; har stage fail wali ho sakti hai.</p></div>
<h3>Can-do checklist</h3>
<ul>
<li>Samjha sako ki virtual router kya hai aur har Layer 3 interface ek hi ka kyun hota hai.</li>
<li>Default administrative distances bina notes ke bata sako.</li>
<li>Floating static route banao aur sahi failure condition ke saath path monitoring enable karo.</li>
<li>Router ID, areas, passive interfaces aur authentication ke saath OSPF configure karo.</li>
<li>BGP peer group, peer, local AS aur local preference set karne wala import rule configure karo.</li>
<li>Redistribution profile aur export rule se, filter ke saath, static route advertise karo.</li>
<li>Samjha sako ki route lookup destination zone kaise deta hai, aur PBF kahan aata hai.</li>
<li>Real commands se interface se policy tak kram mein troubleshoot karo.</li>
<li>BFD, graceful restart aur HA ko routing ke sandarbh mein describe karo.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms">
<dt>Virtual router</dt><dd>Apne route table, protocols aur interfaces wala routing instance.</dd>
<dt>Administrative distance</dt><dd>Route sources ke beech trust ranking; kam jeetta hai.</dd>
<dt>Path monitoring</dt><dd>ICMP checks jo targets fail hone par static route hata dete hain.</dd>
<dt>Redistribution profile</dt><dd>Object jo doosre protocol mein advertise hone wale routes chunta hai.</dd>
<dt>ECMP</dt><dd>Kai equal-cost paths ek saath use karna.</dd>
<dt>PBF</dt><dd>Policy-based forwarding jo matching traffic ke liye route table override karta hai.</dd>
<dt>FIB</dt><dd>Active routes se bani forwarding table.</dd>
</dl>
<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>Distances: static 10, EBGP 20, OSPF internal 30, OSPF external 110, RIP 120, IBGP 200.</li>
<li>Hello 10 second aur dead counts 4 OSPF defaults hain; area, timers aur auth match hone chahiye.</li>
<li>BGP TCP 179 par chalta hai; sirf Established routes exchange karta hai; local preference exit chunta hai.</li>
<li>Akela redistribution profile kuch nahi badalta; use export ya redistribution rule se reference karna padta hai.</li>
<li>Destination zone route lookup se aati hai; PBF usse pehle check hota hai.</li>
<li>Khaali traffic logs aksar route na hone ka sanket hain.</li>
</ul>
<h3>Command cheat-sheet</h3>
<pre class="code">show routing route
show routing route type static
show routing protocol ospf neighbor
show routing protocol bgp summary
show routing protocol bgp loc-rib
show routing fib
test routing fib-lookup virtual-router default ip 203.0.113.50
test security-policy-match source 10.10.1.20 destination 203.0.113.50 destination-port 443 protocol 6</pre>
<p>Pehle do commands simulator mein chalte hain; baaki production ke liye real PAN-OS commands hain.</p>
<div class="exam"><p><b>Exam trap.</b> Do answers sahi lagein to woh chuno jo sabse neeche ki layer pehle check karta hai: interface, neighbour, route, policy.</p></div>
<div class="scn"><h4>Routing round clear karna</h4><p>Firewall role ke interview mein candidate ko dual ISPs aur OSPF par data centre wala branch diya gaya. Unhone route table ke sources banaye, path monitoring ke saath floating static default chuna, export rule aur filter se LAN advertise kiya, aur fib lookup se verify karne ka tareeka bataya. Panel ne detail se zyada structure notice kiya.</p><p><b>Lesson:</b> layers mein jawab do aur har layer ko prove karne wala command batao.</p></div>
<div class="iv"><p class="q">"Do ISPs aur data centre wale branch ke liye routing design kaise karoge?"</p><p>Do ISPs ke liye path monitoring ya BFD ke saath floating static ya BGP defaults, data centre ke liye authentication ke saath OSPF ya BGP, branch prefixes ka filtered redistribution, aur har possible egress zone ke liye policy. End mein verification: neighbours, route table, fib lookup aur policy match, aur rollback plan.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Chhe distances yaad rakho.</li><li>Jo accept aur advertise karte ho use control karo.</li><li>Route woh zone deta hai jise policy use karti hai.</li><li>Layers mein troubleshoot karo aur har ek ko command se prove karo.</li><li>pan-setup, pan-nat, enarsi-ospf, enarsi-bgp aur nse4-dynamic mein practise karo.</li></ul></div>
`}};export{e as default};