var e={id:`summary`,h:{en:`Summary: the troubleshooting cheat sheet for the exam and the NOC`,hi:`Summary: exam aur NOC ke liye troubleshooting cheat sheet`},body:{en:`
<p>A pilot does not memorise a manual in the cockpit; she uses a short checklist that she has practised until it is automatic. This chapter is that checklist for Prisma SD-WAN troubleshooting, built from chapters 1 to 8 of this module. Read it the night before the exam and keep a copy next to your desk.</p>
<h3>Can-do checklist</h3>
<ul>
<li>I can state the layered method: scope, change, device and controller, circuits, fabric, routing, policy and path, application, SASE.</li>
<li>I can tell Unclaimed from Claimed and say what each ION state means.</li>
<li>I can test controller reachability with the right commands and know the port it needs.</li>
<li>I can find why a VPN link is down: circuit label, NAT, MTU, keepalive, firewall in front.</li>
<li>I can follow a prefix through peer status, received routes, advertised routes and the routing table.</li>
<li>I can explain a flow decision with the flow view: rule, allowed paths, filtered paths, preferred paths.</li>
<li>I can separate application slowness into segments with ADEM and link quality.</li>
<li>I can walk the SASE ladder from site to tunnel to Prisma Access.</li>
<li>I can assemble an escalation package.</li>
</ul>
<h3>Symptom to layer</h3>
<table class="cmp"><tr><th>Symptom</th><th>First layer to suspect</th><th>First check</th></tr><tr><td>Site offline in the portal</td><td>ION and controller</td><td>Claim state, <code>dump controller status</code>, DNS and TCP 443 outbound</td></tr><tr><td>Tunnels up but no WAN paths</td><td>Circuit label</td><td>Label on the circuit, <code>dump waninterface summary</code></td></tr><tr><td>VPN link down on one circuit</td><td>Circuit and NAT</td><td><code>dump vpn summary</code>, UDP 4500, MTU, external NAT address</td></tr><tr><td>BGP peer up, prefix missing</td><td>Routing</td><td>Received and advertised routes, route filters, segment</td></tr><tr><td>Peer stuck in Active</td><td>Routing underlay</td><td>Neighbour IP, reachability, AS numbers, ACL in front</td></tr><tr><td>Traffic on the wrong path</td><td>Policy</td><td>Flow view: rule hit, allowed and filtered paths</td></tr><tr><td>One application slow</td><td>Application path</td><td>ADEM segment, link quality, QoS bandwidth, MTU</td></tr><tr><td>Internet through Prisma Access fails</td><td>SASE</td><td>Tunnel state per circuit, then Prisma Access side</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="diagram">
<rect x="10" y="20" width="90" height="50" rx="8" fill="#fecaca"/><text x="55" y="50" text-anchor="middle" class="svg-ink" font-size="11">1 Scope</text>
<rect x="110" y="20" width="90" height="50" rx="8" fill="#fed7aa"/><text x="155" y="50" text-anchor="middle" class="svg-ink" font-size="11">2 Change</text>
<rect x="210" y="20" width="90" height="50" rx="8" fill="#fde68a"/><text x="255" y="50" text-anchor="middle" class="svg-ink" font-size="11">3 ION</text>
<rect x="310" y="20" width="90" height="50" rx="8" fill="#d9f99d"/><text x="355" y="50" text-anchor="middle" class="svg-ink" font-size="11">4 Circuit</text>
<rect x="410" y="20" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="455" y="50" text-anchor="middle" class="svg-ink" font-size="11">5 Fabric</text>
<rect x="510" y="20" width="120" height="50" rx="8" fill="#a7f3d0"/><text x="570" y="50" text-anchor="middle" class="svg-ink" font-size="11">6 Routing</text>
<rect x="110" y="110" width="130" height="50" rx="8" fill="#bae6fd"/><text x="175" y="140" text-anchor="middle" class="svg-ink" font-size="11">7 Policy and path</text>
<rect x="255" y="110" width="130" height="50" rx="8" fill="#c7d2fe"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="11">8 Application</text>
<rect x="400" y="110" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="465" y="140" text-anchor="middle" class="svg-ink" font-size="11">9 SASE</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Work from the bottom of the stack upward; stop at the first layer that fails.</text>
</svg><p class="cap">The nine-step method in one picture.</p></div>
<h3>Command cheat sheet</h3>
<h4>Reference configuration (not run in the simulator)</h4>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
dump controller status
debug controller reachability
dump interface status
dump waninterface summary
dump vpn summary all
dump routing peer status all
dump routing summary
dump static routes
dump bfd status
dump network-policy config policy-rules
dump performance-policy config policy-sets
dump standingalarms
dump flow count-summary</pre>
<p>Option syntax varies by software release, so use the CLI help on the device for the exact form.</p>
<h3>Most-tested facts</h3>
<ul>
<li>The ION needs outbound TCP 443 to the controller; VPN through NAT uses UDP 4500.</li>
<li>A circuit without a label gives tunnels with no WAN paths.</li>
<li>Aggressive keepalive of 1000 ms times 3 gives 3 second detection.</li>
<li>MTU: 1500 default, 1428 for cellular, 1280 minimum for IPv6.</li>
<li>Set circuit bandwidth a little below the carrier value (1 to 2 per cent).</li>
<li>A BGP peer in Established with no prefix is a policy or advertisement problem, not a link problem.</li>
<li>Audit log tells who changed; flow view tells the rule and path.</li>
<li>CLI sessions: 10 per device, 30 per account.</li>
</ul>
<h3>Exam traps</h3>
<ol>
<li>Choosing a routing fix when the circuit has no label.</li>
<li>Blaming the carrier before checking local NAT and firewall.</li>
<li>Forgetting the segment when a route "is missing".</li>
<li>Reading ADEM as a configuration tool; it measures, it does not explain the setting.</li>
<li>Clearing a routing peer in production before capturing evidence.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> Ticket: "br-chennai-03 reaches the data centre but not the Internet." Scope: one site. Change: none. ION online. Tunnels up. Routing fine. Policy: the flow view shows the Internet rule sends traffic to Prisma Access. SASE ladder: the tunnel to Prisma Access on ISP-A is up, ISP-B is down. The fault is on the second circuit, and the first still carries traffic. The answer therefore points to the SASE tunnel check, not to routing.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Skipping the scope step. Treating every outage as a carrier fault. Reading a command from memory instead of the help. Leaving evidence uncollected.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions give a symptom and four fixes. Name the layer first, then choose the fix that tests that layer.</p></div>
<div class="scn"><h4>Friday, 17:30</h4><p>A Harbor Retail store loses its ERP. The engineer runs the method in order and finds the circuit label was removed in a template edit at 16:50 (audit log). Restoring it brings paths back in two minutes. She fixes the template and updates the runbook.</p><p><b>Lesson:</b> method first, tools second.</p></div>
<div class="iv"><p class="q">"Give me your troubleshooting method in one minute."</p><p>Scope the impact, check the audit log for changes, confirm the ION is online to the controller, check circuits and labels, check the fabric links, then routing, then policy and path with the flow view, then the application with ADEM, then the SASE tunnels. I stop at the first failed layer and collect evidence before changing anything.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Name the layer before choosing the fix.</li><li>Label, NAT, MTU and keepalive explain most link faults.</li><li>Established BGP with no prefix is not a link problem.</li><li>Flow view gives the rule and the path.</li><li>Collect evidence before debug or clear.</li></ul></div>
`,hi:`
<p>Pilot cockpit mein manual yaad nahi karti; woh chhoti checklist use karti hai jise itna practise kiya ho ki automatic ho jaye. Yeh chapter Prisma SD-WAN troubleshooting ki wahi checklist hai, is module ke chapters 1 se 8 se bani. Exam se pehli raat padho aur ek copy desk ke paas rakho.</p>
<h3>Can-do checklist</h3>
<ul>
<li>Main layered method bata sakta hoon: scope, change, device aur controller, circuits, fabric, routing, policy aur path, application, SASE.</li>
<li>Main Unclaimed aur Claimed mein fark bata sakta hoon aur har ION state ka matlab.</li>
<li>Main sahi commands se controller reachability test kar sakta hoon aur jaanta hoon kaun sa port chahiye.</li>
<li>Main dhoondh sakta hoon ki VPN link kyun down hai: circuit label, NAT, MTU, keepalive, aage ka firewall.</li>
<li>Main prefix ko peer status, received routes, advertised routes aur routing table mein follow kar sakta hoon.</li>
<li>Main flow view se flow decision explain kar sakta hoon: rule, allowed paths, filtered paths, preferred paths.</li>
<li>Main ADEM aur link quality se application slowness ko segments mein baant sakta hoon.</li>
<li>Main site se tunnel se Prisma Access tak SASE ladder chal sakta hoon.</li>
<li>Main escalation package bana sakta hoon.</li>
</ul>
<h3>Symptom se layer</h3>
<table class="cmp"><tr><th>Symptom</th><th>Pehla shak kis layer par</th><th>Pehla check</th></tr><tr><td>Portal mein site offline</td><td>ION aur controller</td><td>Claim state, <code>dump controller status</code>, DNS aur TCP 443 outbound</td></tr><tr><td>Tunnels up par WAN paths nahi</td><td>Circuit label</td><td>Circuit par label, <code>dump waninterface summary</code></td></tr><tr><td>Ek circuit par VPN link down</td><td>Circuit aur NAT</td><td><code>dump vpn summary</code>, UDP 4500, MTU, external NAT address</td></tr><tr><td>BGP peer up, prefix gayab</td><td>Routing</td><td>Received aur advertised routes, route filters, segment</td></tr><tr><td>Peer Active mein atka</td><td>Routing underlay</td><td>Neighbour IP, reachability, AS numbers, aage ka ACL</td></tr><tr><td>Traffic galat path par</td><td>Policy</td><td>Flow view: rule hit, allowed aur filtered paths</td></tr><tr><td>Ek application slow</td><td>Application path</td><td>ADEM segment, link quality, QoS bandwidth, MTU</td></tr><tr><td>Prisma Access se Internet fail</td><td>SASE</td><td>Har circuit ka tunnel state, phir Prisma Access side</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="diagram">
<rect x="10" y="20" width="90" height="50" rx="8" fill="#fecaca"/><text x="55" y="50" text-anchor="middle" class="svg-ink" font-size="11">1 Scope</text>
<rect x="110" y="20" width="90" height="50" rx="8" fill="#fed7aa"/><text x="155" y="50" text-anchor="middle" class="svg-ink" font-size="11">2 Change</text>
<rect x="210" y="20" width="90" height="50" rx="8" fill="#fde68a"/><text x="255" y="50" text-anchor="middle" class="svg-ink" font-size="11">3 ION</text>
<rect x="310" y="20" width="90" height="50" rx="8" fill="#d9f99d"/><text x="355" y="50" text-anchor="middle" class="svg-ink" font-size="11">4 Circuit</text>
<rect x="410" y="20" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="455" y="50" text-anchor="middle" class="svg-ink" font-size="11">5 Fabric</text>
<rect x="510" y="20" width="120" height="50" rx="8" fill="#a7f3d0"/><text x="570" y="50" text-anchor="middle" class="svg-ink" font-size="11">6 Routing</text>
<rect x="110" y="110" width="130" height="50" rx="8" fill="#bae6fd"/><text x="175" y="140" text-anchor="middle" class="svg-ink" font-size="11">7 Policy aur path</text>
<rect x="255" y="110" width="130" height="50" rx="8" fill="#c7d2fe"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="11">8 Application</text>
<rect x="400" y="110" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="465" y="140" text-anchor="middle" class="svg-ink" font-size="11">9 SASE</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Stack ke neeche se upar kaam karo; pehli fail hui layer par ruko.</text>
</svg><p class="cap">Nau-step method ek picture mein.</p></div>
<h3>Command cheat sheet</h3>
<h4>Reference configuration (not run in the simulator)</h4>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
dump controller status
debug controller reachability
dump interface status
dump waninterface summary
dump vpn summary all
dump routing peer status all
dump routing summary
dump static routes
dump bfd status
dump network-policy config policy-rules
dump performance-policy config policy-sets
dump standingalarms
dump flow count-summary</pre>
<p>Option syntax software release ke saath badalta hai, isliye exact form ke liye device par CLI help use karo.</p>
<h3>Sabse zyada pooche jaane wale facts</h3>
<ul>
<li>ION ko controller tak outbound TCP 443 chahiye; NAT ke peeche VPN UDP 4500 use karta hai.</li>
<li>Label ke bina circuit se tunnels bante hain par WAN paths nahi.</li>
<li>Aggressive keepalive 1000 ms ganaa 3 se 3 second detection deta hai.</li>
<li>MTU: 1500 default, cellular ke liye 1428, IPv6 ke liye minimum 1280.</li>
<li>Circuit bandwidth carrier value se thodi kam rakho (1 se 2 percent).</li>
<li>BGP peer Established par prefix nahi: yeh policy ya advertisement problem hai, link problem nahi.</li>
<li>Audit log batata hai kisne badla; flow view batata hai rule aur path.</li>
<li>CLI sessions: 10 per device, 30 per account.</li>
</ul>
<h3>Exam traps</h3>
<ol>
<li>Circuit par label na ho tab routing fix chun lena.</li>
<li>Local NAT aur firewall check kiye bina carrier ko blame karna.</li>
<li>Route "missing" ho to segment bhool jaana.</li>
<li>ADEM ko configuration tool samajhna; woh measure karta hai, setting explain nahi karta.</li>
<li>Evidence capture kiye bina production mein routing peer clear karna.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> Ticket: "br-chennai-03 data centre tak pahunchta hai par Internet tak nahi." Scope: ek site. Change: koi nahi. ION online. Tunnels up. Routing theek. Policy: flow view dikhata hai ki Internet rule traffic ko Prisma Access bhejta hai. SASE ladder: ISP-A par Prisma Access tunnel up hai, ISP-B down. Fault doosre circuit par hai aur pehla abhi bhi traffic le ja raha hai. Isliye jawab SASE tunnel check ki taraf jata hai, routing ki taraf nahi.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Scope step skip karna. Har outage ko carrier fault samajhna. Help dekhne ke bajay command yaad se likhna. Evidence jama na karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawal symptom aur chaar fixes deta hai. Pehle layer ka naam lo, phir wahi fix chuno jo us layer ko test kare.</p></div>
<div class="scn"><h4>Friday, 17:30</h4><p>Harbor Retail ke ek store ka ERP chala jata hai. Engineer method ko order mein chalati hai aur audit log se dekhti hai ki 16:50 par template edit mein circuit label hat gaya tha. Use wapas lagane se do minute mein paths laut aate hain. Woh template theek karti hai aur runbook update karti hai.</p><p><b>Seekh:</b> pehle method, phir tools.</p></div>
<div class="iv"><p class="q">"Apna troubleshooting method ek minute mein batao."</p><p>Impact scope karo, audit log mein changes dekho, confirm karo ki ION controller se online hai, circuits aur labels check karo, fabric links dekho, phir routing, phir flow view se policy aur path, phir ADEM se application, phir SASE tunnels. Pehli fail layer par ruk jaata hoon aur kuch badalne se pehle evidence jama karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Fix chunne se pehle layer ka naam lo.</li><li>Label, NAT, MTU aur keepalive zyadatar link faults explain karte hain.</li><li>Established BGP bina prefix link problem nahi hai.</li><li>Flow view rule aur path deta hai.</li><li>Debug ya clear se pehle evidence jama karo.</li></ul></div>
`}};export{e as default};