var e=`<svg viewBox="0 0 640 330" role="img" aria-label="Azure troubleshooting ladder with the Network Watcher tool for each layer">
<g font-size="12">
<rect x="20" y="10" width="330" height="40" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="34" y="35" class="svg-ink">1. Is the resource healthy? (VM running, Service Health)</text>
<rect x="360" y="10" width="260" height="40" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="374" y="35" class="svg-muted">Activity log, Resource Health</text>
<rect x="20" y="58" width="330" height="40" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="34" y="83" class="svg-ink">2. Is the address and name right? (IP, DNS)</text>
<rect x="360" y="58" width="260" height="40" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="374" y="83" class="svg-muted">nslookup, effective DNS settings</text>
<rect x="20" y="106" width="330" height="40" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="34" y="131" class="svg-ink">3. Does a route exist, and to where?</text>
<rect x="360" y="106" width="260" height="40" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="374" y="131" class="svg-muted">Next hop, effective routes</text>
<rect x="20" y="154" width="330" height="40" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="34" y="179" class="svg-ink">4. Does a filter allow it? (NSG, firewall)</text>
<rect x="360" y="154" width="260" height="40" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="374" y="179" class="svg-muted">IP flow verify, effective security rules</text>
<rect x="20" y="202" width="330" height="40" rx="8" fill="#fde68a" stroke="#64748b"/><text x="34" y="227" class="svg-ink">5. Does the end-to-end path work?</text>
<rect x="360" y="202" width="260" height="40" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="374" y="227" class="svg-muted">Connection troubleshoot, Connection Monitor</text>
<rect x="20" y="250" width="330" height="40" rx="8" fill="#fecaca" stroke="#64748b"/><text x="34" y="275" class="svg-ink">6. What is actually on the wire, and over time?</text>
<rect x="360" y="250" width="260" height="40" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="374" y="275" class="svg-muted">Packet capture, flow logs, Traffic Analytics</text>
</g>
<text x="320" y="316" text-anchor="middle" class="svg-muted" font-size="11">Left: question to ask. Right: the tool that answers it. Move down only when the layer above is proven.</text>
</svg>`,t={id:`troubleshooting-ladder`,h:{en:`The troubleshooting ladder and the Network Watcher toolbox`,hi:`Troubleshooting ladder aur Network Watcher toolbox`},body:{en:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.nwkings.com. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<h3>What you will learn</h3>
<ul>
<li>A fixed, layered method for any "A cannot reach B" ticket in Azure.</li>
<li>What Network Watcher is and which tool answers which question.</li>
<li>How to read evidence (next hop, security rules, flow logs, captures) instead of guessing.</li>
<li>How this module continues: tools, NSG and route rules, packet capture, flow logs and Traffic Analytics, monitoring, two guided labs and a NOC-style capstone with three faults.</li>
</ul>
<p><b>Prerequisites:</b> VNets, NSGs, routes, peering, and the hub-and-spoke and hybrid modules. We use the same addresses: hub 10.0.0.0/16, firewall 10.0.1.4, spoke1 10.1.0.0/16, spoke2 10.2.0.0/16, office 192.168.0.0/16.</p>

<h3>The doctor's checklist</h3>
<p>A good doctor does not order every test at once. She starts with vital signs, then narrows down. Network troubleshooting works the same way. "The app cannot reach the database" has many possible causes: the VM is stopped, the name points to the wrong address, there is no route, a firewall blocks, the application is down. If you check them in a random order you waste hours. If you check them in a fixed order, from cheap and common to deep and rare, each step either proves a layer healthy or points straight at the fault.</p>
<div class="dia">`+e+`<p class="cap">The ladder for this module. The right-hand column is the Azure tool for each rung.</p></div>

<h3>Network Watcher in one page</h3>
<p><b>Azure Network Watcher</b> is a regional service with diagnostic and monitoring tools for IaaS networking. It is typically enabled automatically per region when you create a VNet, living in a resource group called <code>NetworkWatcherRG</code> (verify the current behaviour before publishing). You use it for:</p>
<dl class="terms">
<dt>IP flow verify</dt><dd>Asks "would this exact packet be allowed or denied by the NSG rules on this VM's NIC?" and names the rule.</dd>
<dt>Next hop</dt><dd>Asks "where does a packet from this VM to this destination go next?" and names the route.</dd>
<dt>Effective security rules and effective routes</dt><dd>The merged rule set and route table that Azure actually applies to one NIC.</dd>
<dt>Connection troubleshoot</dt><dd>A live test from a VM to a destination (VM, IP, name, URL) that reports reachability, latency and the hops found.</dd>
<dt>Packet capture</dt><dd>A capture on a VM, written to a file in storage or on the VM, for Wireshark analysis.</dd>
<dt>Topology</dt><dd>A diagram of resources and links in a resource group.</dd>
<dt>VPN diagnostics</dt><dd>Checks VPN gateway and connection health and writes a report.</dd>
<dt>NSG and VNet flow logs, Traffic Analytics</dt><dd>History of who talked to whom, summarised and visualised.</dd>
<dt>Connection Monitor</dt><dd>Continuous tests between endpoints with alerts, including hybrid paths.</dd>
</dl>
<pre class="code"><span class="c"># make sure Network Watcher exists in your region (usually automatic)</span>
az network watcher list -o table
az network watcher configure -g NetworkWatcherRG --locations centralindia --enabled true</pre>
<pre class="out"><span class="c">Illustrative output</span>
Location       Name                         ProvisioningState   ResourceGroup
centralindia   NetworkWatcher_centralindia  <span class="hl">Succeeded</span>           NetworkWatcherRG</pre>
<p>Most tools need a running VM and, for some, the Network Watcher Agent extension on it. They work on the Azure side of the path; they cannot see inside your on-premises network.</p>

<h3>Five rules for every ticket</h3>
<ol>
<li><b>Restate the problem</b> as source, destination, protocol, port, time, and what error (timeout, refused, name not found, slow).</li>
<li><b>Prove, do not assume.</b> Use a tool to confirm each layer, then write down the result.</li>
<li><b>Change one thing at a time</b> and retest from the same source.</li>
<li><b>Test both directions</b> for stateful devices and routes.</li>
<li><b>Record</b> what you found: it becomes the ticket note and the next runbook.</li>
</ol>
<p>The error type already narrows the field. <b>Timeout</b> usually means a drop (NSG, firewall, route to nowhere, asymmetric path). <b>Connection refused</b> means the packet arrived and the host actively said no (nothing listening, OS firewall). <b>Name not found</b> is DNS. <b>Slow</b> points to MTU, congestion or a distant path.</p>

<div class="eg"><p><b>Worked example.</b> Ticket: "vm-app 10.1.1.4 cannot connect to vm-db 10.2.1.4 on TCP 1433, timeout." Rung 1: both VMs running. Rung 2: IP typed correctly. Rung 3: next hop from vm-app to 10.2.1.4 is VirtualAppliance 10.0.1.4. Rung 4: firewall log has Allow for the flow; IP flow verify on vm-db inbound reports Deny, rule DenyAllInBound. The fault is an NSG on the database subnet, found in four checks instead of forty guesses.</p></div>

<div class="warn"><p><b>Common mistakes:</b> opening many portal blades at random, changing rules before reading evidence, forgetting the destination NSG, and treating a tool's "Allow" for one NIC as proof for the whole path.</p></div>
<div class="exam"><p><b>Exam trap:</b> IP flow verify checks NSG rules on a NIC only. It does not check routes, Azure Firewall or the OS. Next hop checks routes only.</p></div>

<div class="scn"><h4>Fifty minutes on the wrong layer</h4><p>A support engineer spent most of an hour editing firewall rules because "it must be the firewall". When a colleague ran Network Watcher next hop it showed "None": a route to nowhere left by a test UDR. Deleting that route solved it in one minute.</p><p><b>Lesson:</b> let the ladder, not your hunch, pick the layer.</p></div>

<div class="iv"><p class="q">"A VM cannot reach another VM. How do you start?"</p><p>Restate the problem (source, destination, port, error type), check the resource and name, then routes with next hop, then filters with IP flow verify and effective security rules, then an end-to-end test with connection troubleshoot, and finally packet capture or flow logs. One change at a time, test both directions.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work a fixed ladder: health, name, route, filter, end-to-end, wire.</li>
<li>Network Watcher gives a tool per layer: next hop, IP flow verify, connection troubleshoot, packet capture.</li>
<li>Error type (timeout, refused, name not found, slow) narrows the cause.</li>
<li>Prove each layer; change one thing at a time; test both directions.</li>
<li>Tools see the Azure side only.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.nwkings.com. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<h3>Aap kya seekhoge</h3>
<ul>
<li>Azure mein har "A, B tak nahi pahunch raha" ticket ke liye fixed, layered method.</li>
<li>Network Watcher kya hai aur kaunsa tool kaunsa sawaal solve karta hai.</li>
<li>Andaze ki jagah evidence (next hop, security rules, flow logs, captures) kaise padhein.</li>
<li>Yeh module aage kaise chalta hai: tools, NSG aur route rules, packet capture, flow logs aur Traffic Analytics, monitoring, do guided labs aur teen faults wala NOC-style capstone.</li>
</ul>
<p><b>Prerequisites:</b> VNets, NSGs, routes, peering, aur hub-and-spoke aur hybrid modules. Hum wahi addresses use karte hain: hub 10.0.0.0/16, firewall 10.0.1.4, spoke1 10.1.0.0/16, spoke2 10.2.0.0/16, office 192.168.0.0/16.</p>

<h3>Doctor ki checklist</h3>
<p>Achha doctor saare tests ek saath order nahi karta. Woh vital signs se shuru karti hai, phir narrow karti hai. Network troubleshooting bhi aise hi chalta hai. "App database tak nahi pahunch raha" ke kai sambhavit karan hain: VM band hai, naam galat address par point karta hai, route nahi hai, firewall block karta hai, application down hai. Inhe random order mein check karoge to ghante barbaad honge. Fixed order mein check karoge, sasti aur aam cheezon se gehri aur rare cheezon tak, to har step ya to ek layer ko healthy saabit karta hai ya seedha fault ki taraf ishara karta hai.</p>
<div class="dia">`+e+`<p class="cap">Is module ki ladder. Daayi taraf ka column har rung ka Azure tool hai.</p></div>

<h3>Network Watcher ek page mein</h3>
<p><b>Azure Network Watcher</b> IaaS networking ke liye diagnostic aur monitoring tools wali regional service hai. VNet banate hi yeh aam taur par har region mein apne aap enable hoti hai, <code>NetworkWatcherRG</code> naam ke resource group mein (current behaviour publish se pehle verify karo). Aap ise in kaamon ke liye use karte ho:</p>
<dl class="terms">
<dt>IP flow verify</dt><dd>Poochta hai "kya yeh exact packet is VM ke NIC par NSG rules se allow hoga ya deny?" aur rule ka naam batata hai.</dd>
<dt>Next hop</dt><dd>Poochta hai "is VM se is destination ka packet agla kahan jaata hai?" aur route ka naam batata hai.</dd>
<dt>Effective security rules aur effective routes</dt><dd>Ek NIC par Azure jo merged rule set aur route table asal mein lagata hai.</dd>
<dt>Connection troubleshoot</dt><dd>VM se destination (VM, IP, naam, URL) tak live test jo reachability, latency aur mile hue hops report karta hai.</dd>
<dt>Packet capture</dt><dd>VM par capture, storage ya VM par file mein likha jaata hai, Wireshark analysis ke liye.</dd>
<dt>Topology</dt><dd>Resource group ke resources aur links ka diagram.</dd>
<dt>VPN diagnostics</dt><dd>VPN gateway aur connection health check karta hai aur report likhta hai.</dd>
<dt>NSG aur VNet flow logs, Traffic Analytics</dt><dd>Kisne kisse baat ki uski history, summarise aur visualise ki hui.</dd>
<dt>Connection Monitor</dt><dd>Endpoints ke beech continuous tests alerts ke saath, hybrid paths sahit.</dd>
</dl>
<pre class="code"><span class="c"># pakka karo ki aapke region mein Network Watcher hai (aam taur par automatic)</span>
az network watcher list -o table
az network watcher configure -g NetworkWatcherRG --locations centralindia --enabled true</pre>
<pre class="out"><span class="c">Illustrative output</span>
Location       Name                         ProvisioningState   ResourceGroup
centralindia   NetworkWatcher_centralindia  <span class="hl">Succeeded</span>           NetworkWatcherRG</pre>
<p>Zyadatar tools ko running VM chahiye aur kuch ko us par Network Watcher Agent extension. Yeh path ke Azure side par kaam karte hain; aapke on-premises network ke andar nahi dekh sakte.</p>

<h3>Har ticket ke paanch niyam</h3>
<ol>
<li><b>Problem dobara likho</b>: source, destination, protocol, port, time, aur kaunsa error (timeout, refused, name not found, slow).</li>
<li><b>Assume mat karo, saabit karo.</b> Har layer ko tool se confirm karo, aur natija likh lo.</li>
<li><b>Ek samay mein ek cheez badlo</b> aur usi source se retest karo.</li>
<li>Stateful devices aur routes ke liye <b>dono directions test karo</b>.</li>
<li>Jo mila woh <b>record karo</b>: yeh ticket note aur agla runbook ban jaata hai.</li>
</ol>
<p>Error type pehle se field narrow kar deta hai. <b>Timeout</b> aam taur par drop ka matlab hai (NSG, firewall, kahin nahi jaata route, asymmetric path). <b>Connection refused</b> ka matlab packet pahuncha aur host ne khud mana kiya (koi sun nahi raha, OS firewall). <b>Name not found</b> DNS hai. <b>Slow</b> MTU, congestion ya door ke path ki taraf ishara karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Ticket: "vm-app 10.1.1.4 vm-db 10.2.1.4 se TCP 1433 par connect nahi kar pa raha, timeout." Rung 1: dono VMs running. Rung 2: IP sahi type hua. Rung 3: vm-app se 10.2.1.4 ka next hop VirtualAppliance 10.0.1.4 hai. Rung 4: firewall log mein flow ke liye Allow hai; vm-db inbound par IP flow verify Deny batata hai, rule DenyAllInBound. Fault database subnet ka NSG hai, chaalis andaazon ki jagah chaar checks mein mil gaya.</p></div>

<div class="warn"><p><b>Common mistakes:</b> random portal blades kholna, evidence padhne se pehle rules badalna, destination NSG bhool jaana, aur ek NIC ke tool ke "Allow" ko poore path ka saboot maan lena.</p></div>
<div class="exam"><p><b>Exam trap:</b> IP flow verify sirf NIC par NSG rules check karta hai. Woh routes, Azure Firewall ya OS check nahi karta. Next hop sirf routes check karta hai.</p></div>

<div class="scn"><h4>Galat layer par pachaas minute</h4><p>Ek support engineer ne lagbhag ek ghanta firewall rules edit karne mein lagaya kyunki "firewall hi hoga". Jab ek colleague ne Network Watcher next hop chalaya to "None" dikha: ek test UDR ka chhoda hua route jo kahin nahi jaata tha. Woh route delete karne se ek minute mein solve ho gaya.</p><p><b>Lesson:</b> layer aapka andaza nahi, ladder chune.</p></div>

<div class="iv"><p class="q">"Ek VM doosri VM tak nahi pahunch rahi. Shuru kaise karoge?"</p><p>Problem restate karo (source, destination, port, error type), resource aur naam check karo, phir next hop se routes, phir IP flow verify aur effective security rules se filters, phir connection troubleshoot se end-to-end test, aur aakhir mein packet capture ya flow logs. Ek samay mein ek change, dono directions test karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Fixed ladder follow karo: health, name, route, filter, end-to-end, wire.</li>
<li>Network Watcher har layer ka tool deta hai: next hop, IP flow verify, connection troubleshoot, packet capture.</li>
<li>Error type (timeout, refused, name not found, slow) cause narrow karta hai.</li>
<li>Har layer saabit karo; ek samay mein ek change; dono directions test karo.</li>
<li>Tools sirf Azure side dekhte hain.</li>
</ul></div>
`}};export{t as default};