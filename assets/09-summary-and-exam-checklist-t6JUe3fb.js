var e={id:`summary-and-exam-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You can now take a FortiGate from factory state to a verified branch edge and fix the classic management ticket. This chapter is the revision sheet: the can-do checklist, a glossary, the most tested facts and a command cheat-sheet. Next come nse4-zones (VLAN interfaces and zones) and nse4-policy (objects, order, logging).</p>
<h3>Can-do checklist</h3>
<ul>
<li>Open a table, edit an entry, set attributes and save with next or end, and explain why there is no commit.</li>
<li>Use set for single values and replacement, append and unselect for lists.</li>
<li>Name the device with <code>config system global</code>.</li>
<li>Address an interface with ip, alias and role, and explain what each does and does not change.</li>
<li>Choose allowaccess for LAN and WAN and say why the WAN should allow ping at most.</li>
<li>Add a default route with gateway and device, and read S*, C, [10/0] and [1/0].</li>
<li>Explain distance versus priority and build a floating backup.</li>
<li>Add a day-one LAN-to-WAN policy with NAT and verify with the ladder.</li>
<li>Run the GUI-ticket workflow: split the path, read allowaccess, fix, retest.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>Table / entry / attribute</dt><dd>rows and columns of the FortiOS configuration</dd><dt>allowaccess</dt><dd>management services an interface answers</dd><dt>role</dt><dd>lan, wan, dmz or undefined label; does not change forwarding</dd><dt>alias</dt><dd>friendly name next to the port name</dd><dt>trusted host</dt><dd>source range an admin account may log in from</dd><dt>administrative distance</dt><dd>route trust; lower wins; static default 10</dd><dt>priority</dt><dd>tie-breaker between equal-distance static routes</dd><dt>floating route</dt><dd>static route with higher distance used as backup</dd><dt>connected route (C)</dt><dd>automatic route for an addressed, up interface</dd></dl>
<h3>Most tested facts</h3>
<ul>
<li>FortiOS has no commit; saving the entry applies it.</li>
<li>show hides defaults; get prints attributes and runtime state; execute runs actions; diagnose digs deeper.</li>
<li>Traffic to the firewall uses allowaccess; traffic through it uses policy.</li>
<li>Two interfaces cannot have overlapping subnets.</li>
<li>Static route default distance is 10, priority 1.</li>
<li>Hostname and admin ports are in system global; administrators are in system admin.</li>
<li>Role and alias do not change forwarding.</li>
</ul>
<h3>Command cheat-sheet</h3>
<table class="cmp"><tr><th>Task</th><th>Command</th></tr><tr><td>hostname</td><td><code>config system global</code> / <code>set hostname NK-PUNE-FGT</code></td></tr><tr><td>address a port</td><td><code>config system interface</code> / <code>edit port2</code> / <code>set ip 10.0.1.1 255.255.255.0</code></td></tr><tr><td>add a service</td><td><code>append allowaccess ping h&#116;tps</code></td></tr><tr><td>default route</td><td><code>config router static</code> / <code>edit 1</code> / <code>set gateway 203.0.113.1</code> / <code>set device port1</code></td></tr><tr><td>view interface</td><td><code>show system interface port2</code>, <code>get system interface physical</code></td></tr><tr><td>routing table</td><td><code>get router info routing-table all</code></td></tr><tr><td>neighbours</td><td><code>get system arp</code></td></tr><tr><td>test</td><td><code>execute ping</code>, <code>execute traceroute</code></td></tr><tr><td>sessions</td><td><code>diagnose sys session list</code></td></tr></table>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="The four tables of a bring-up"><rect x="10" y="20" width="150" height="50" rx="9" fill="#bae6fd"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="13">Name</text><text x="85" y="59" text-anchor="middle" class="svg-muted" font-size="11">system global</text><rect x="175" y="20" width="150" height="50" rx="9" fill="#bbf7d0"/><text x="250" y="42" text-anchor="middle" class="svg-ink" font-size="13">Address</text><text x="250" y="59" text-anchor="middle" class="svg-muted" font-size="11">system interface</text><rect x="340" y="20" width="150" height="50" rx="9" fill="#fde68a"/><text x="415" y="42" text-anchor="middle" class="svg-ink" font-size="13">Route</text><text x="415" y="59" text-anchor="middle" class="svg-muted" font-size="11">router static</text><rect x="505" y="20" width="125" height="50" rx="9" fill="#ddd6fe"/><text x="567.5" y="42" text-anchor="middle" class="svg-ink" font-size="13">Permit</text><text x="567.5" y="59" text-anchor="middle" class="svg-muted" font-size="11">firewall policy</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="12">Four tables, in this order, bring a FortiGate up</text></svg><p class="cap">The four tables of a bring-up</p></div>
<div class="warn"><p><b>Common mistake.</b> Memorising commands without understanding which table they belong to. When a command is rejected, the cause is usually the wrong place in the tree.</p></div>
<div class="exam"><p><b>Exam trap.</b> When two answers are close, pick the one that keeps working services (append) and changes least. The exam favours minimal, targeted fixes.</p></div>
<div class="scn"><h4>From lab to production</h4><p>A learner who finished both labs was asked to onboard a real branch. She followed the five steps and the ladder, caught that the ISP had given a /29 instead of the /30 she assumed, and fixed the mask before any user noticed. The habit of verifying each rung paid off on the first real job.</p><p><b>Lesson:</b> the lab routine scales to real deployments.</p></div>
<div class="iv"><p class="q">"Summarise how you would bring up a FortiGate at a new branch."</p><p>Name it, address the LAN and WAN with alias and role, set allowaccess so management is on the LAN only, add a default route through the ISP, add a LAN-to-WAN policy with NAT, then verify by the ladder: link, LAN ping, ISP ping, route, a client ping to the internet and the session table. Finally back up the configuration and document it.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bring-up tables: system global, system interface, router static, firewall policy.</li>
<li>allowaccess governs the box; policy governs through-traffic.</li>
<li>Distance 10 default; floating backup uses a higher distance.</li>
<li>Verify with the ladder and document the fix.</li>
</ul></div>
`,hi:`
<p>Aap ab FortiGate ko factory state se verified branch edge tak le ja sakte ho aur classic management ticket fix kar sakte ho. Yeh chapter revision sheet hai: can-do checklist, glossary, sabse zyada tested facts aur command cheat-sheet. Aage nse4-zones (VLAN interfaces aur zones) aur nse4-policy (objects, order, logging) aate hain.</p>
<h3>Can-do checklist</h3>
<ul>
<li>Table kholo, entry edit karo, attributes set karo aur next ya end se save karo, aur batao commit kyun nahi hota.</li>
<li>Single values aur replacement ke liye set, lists ke liye append aur unselect use karo.</li>
<li><code>config system global</code> se device ko naam do.</li>
<li>Interface ko ip, alias aur role se address do, aur batao har ek kya badalta hai aur kya nahi.</li>
<li>LAN aur WAN ke liye allowaccess chuno aur batao WAN zyada se zyada ping kyun allow kare.</li>
<li>Gateway aur device ke saath default route jodo, aur S*, C, [10/0] aur [1/0] padho.</li>
<li>Distance versus priority samjhao aur floating backup banao.</li>
<li>NAT ke saath pehle din ki LAN-to-WAN policy jodo aur ladder se verify karo.</li>
<li>GUI-ticket workflow chalao: path baanto, allowaccess padho, fix karo, retest karo.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>Table / entry / attribute</dt><dd>FortiOS configuration ki rows aur columns</dd><dt>allowaccess</dt><dd>interface jin management services ka jawab deta hai</dd><dt>role</dt><dd>lan, wan, dmz ya undefined label; forwarding nahi badalta</dd><dt>alias</dt><dd>port name ke saath friendly naam</dd><dt>trusted host</dt><dd>source range jahan se admin account login kar sakta hai</dd><dt>administrative distance</dt><dd>route ka bharosa; kam jeetta hai; static default 10</dd><dt>priority</dt><dd>barabar-distance static routes ke beech tie-breaker</dd><dt>floating route</dt><dd>zyada distance wala static route jo backup ki tarah use hota hai</dd><dt>connected route (C)</dt><dd>address wale, up interface ka automatic route</dd></dl>
<h3>Sabse zyada tested facts</h3>
<ul>
<li>FortiOS mein commit nahi; entry save karne se lagu hota hai.</li>
<li>show defaults chhupata hai; get attributes aur runtime state print karta hai; execute actions chalata hai; diagnose gehra jaata hai.</li>
<li>Firewall tak ka traffic allowaccess use karta hai; uske through policy.</li>
<li>Do interfaces ke overlapping subnets nahi ho sakte.</li>
<li>Static route ka default distance 10, priority 1.</li>
<li>Hostname aur admin ports system global mein; administrators system admin mein.</li>
<li>Role aur alias forwarding nahi badalte.</li>
</ul>
<h3>Command cheat-sheet</h3>
<table class="cmp"><tr><th>Kaam</th><th>Command</th></tr><tr><td>hostname</td><td><code>config system global</code> / <code>set hostname NK-PUNE-FGT</code></td></tr><tr><td>port ko address</td><td><code>config system interface</code> / <code>edit port2</code> / <code>set ip 10.0.1.1 255.255.255.0</code></td></tr><tr><td>service jodna</td><td><code>append allowaccess ping h&#116;tps</code></td></tr><tr><td>default route</td><td><code>config router static</code> / <code>edit 1</code> / <code>set gateway 203.0.113.1</code> / <code>set device port1</code></td></tr><tr><td>interface dekhna</td><td><code>show system interface port2</code>, <code>get system interface physical</code></td></tr><tr><td>routing table</td><td><code>get router info routing-table all</code></td></tr><tr><td>neighbours</td><td><code>get system arp</code></td></tr><tr><td>test</td><td><code>execute ping</code>, <code>execute traceroute</code></td></tr><tr><td>sessions</td><td><code>diagnose sys session list</code></td></tr></table>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Bring-up ki chaar tables"><rect x="10" y="20" width="150" height="50" rx="9" fill="#bae6fd"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="13">Naam</text><text x="85" y="59" text-anchor="middle" class="svg-muted" font-size="11">system global</text><rect x="175" y="20" width="150" height="50" rx="9" fill="#bbf7d0"/><text x="250" y="42" text-anchor="middle" class="svg-ink" font-size="13">Address</text><text x="250" y="59" text-anchor="middle" class="svg-muted" font-size="11">system interface</text><rect x="340" y="20" width="150" height="50" rx="9" fill="#fde68a"/><text x="415" y="42" text-anchor="middle" class="svg-ink" font-size="13">Route</text><text x="415" y="59" text-anchor="middle" class="svg-muted" font-size="11">router static</text><rect x="505" y="20" width="125" height="50" rx="9" fill="#ddd6fe"/><text x="567.5" y="42" text-anchor="middle" class="svg-ink" font-size="13">Permit</text><text x="567.5" y="59" text-anchor="middle" class="svg-muted" font-size="11">firewall policy</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="12">Chaar tables, isi order mein, FortiGate ko up karti hain</text></svg><p class="cap">Bring-up ki chaar tables</p></div>
<div class="warn"><p><b>Common mistake.</b> Commands ratna par yeh samjhe bina ki woh kis table ke hain. Command reject ho to wajah aksar tree mein galat jagah hoti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jab do jawab kareeb hon to woh chuno jo kaam karti services rakhe (append) aur sabse kam badle. Exam minimal, targeted fixes ko prefer karta hai.</p></div>
<div class="scn"><h4>Lab se production tak</h4><p>Ek learner jisne dono labs khatam kiye the use real branch onboard karne ko kaha gaya. Usne paanch steps aur ladder follow ki, pakda ki ISP ne /30 ki jagah /29 diya tha jo usne maana tha, aur kisi user ke notice karne se pehle mask theek kiya. Har rung verify karne ki aadat pehle real kaam par kaam aayi.</p><p><b>Lesson:</b> lab routine real deployments par bhi chalti hai.</p></div>
<div class="iv"><p class="q">"Naye branch par FortiGate bring up karne ka summary do."</p><p>Naam do, LAN aur WAN ko alias aur role ke saath address do, allowaccess aise set karo ki management sirf LAN par ho, ISP ke through default route jodo, NAT ke saath LAN-to-WAN policy jodo, phir ladder se verify karo: link, LAN ping, ISP ping, route, client se internet ping aur session table. Aakhir mein configuration ka backup lo aur document karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bring-up tables: system global, system interface, router static, firewall policy.</li>
<li>allowaccess box ko govern karta hai; policy through-traffic ko.</li>
<li>Distance default 10; floating backup zyada distance use karta hai.</li>
<li>Ladder se verify karo aur fix document karo.</li>
</ul></div>
`}};export{e as default};