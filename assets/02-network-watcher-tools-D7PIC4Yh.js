var e=`<svg viewBox="0 0 640 260" role="img" aria-label="What each Network Watcher tool inspects along the path from vm-app to vm-db: NSG, route, firewall, destination NSG">
<rect x="15" y="80" width="110" height="60" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="70" y="106" text-anchor="middle" class="svg-ink" font-size="12">vm-app</text><text x="70" y="124" text-anchor="middle" class="svg-muted" font-size="10">10.1.1.4</text>
<rect x="165" y="80" width="90" height="60" rx="10" fill="#ddd6fe" stroke="#64748b"/><text x="210" y="106" text-anchor="middle" class="svg-ink" font-size="12">Route</text><text x="210" y="124" text-anchor="middle" class="svg-muted" font-size="10">UDR to 10.0.1.4</text>
<rect x="295" y="80" width="100" height="60" rx="10" fill="#fed7aa" stroke="#64748b"/><text x="345" y="106" text-anchor="middle" class="svg-ink" font-size="12">Firewall</text><text x="345" y="124" text-anchor="middle" class="svg-muted" font-size="10">10.0.1.4</text>
<rect x="435" y="80" width="90" height="60" rx="10" fill="#bbf7d0" stroke="#64748b"/><text x="480" y="106" text-anchor="middle" class="svg-ink" font-size="12">NSG</text><text x="480" y="124" text-anchor="middle" class="svg-muted" font-size="10">db subnet</text>
<rect x="545" y="80" width="80" height="60" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="585" y="106" text-anchor="middle" class="svg-ink" font-size="12">vm-db</text><text x="585" y="124" text-anchor="middle" class="svg-muted" font-size="10">10.2.1.4</text>
<g stroke="#64748b" stroke-width="2"><line x1="125" y1="110" x2="165" y2="110"/><line x1="255" y1="110" x2="295" y2="110"/><line x1="395" y1="110" x2="435" y2="110"/><line x1="525" y1="110" x2="545" y2="110"/></g>
<text x="210" y="62" text-anchor="middle" class="svg-accent" font-size="11">next hop</text><text x="210" y="46" text-anchor="middle" class="svg-accent" font-size="11">effective routes</text>
<text x="345" y="62" text-anchor="middle" class="svg-muted" font-size="11">firewall log (not Watcher)</text>
<text x="480" y="62" text-anchor="middle" class="svg-accent" font-size="11">IP flow verify</text><text x="480" y="46" text-anchor="middle" class="svg-accent" font-size="11">effective security rules</text>
<rect x="30" y="175" width="580" height="40" rx="8" fill="#fde68a" stroke="#64748b"/><text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">Connection troubleshoot tests the whole path live; packet capture shows it on the wire</text>
<text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="11">Each tool answers one question; none of them replaces the others</text>
</svg>`,t={id:`network-watcher-tools`,h:{en:`Network Watcher tools: IP flow verify, next hop, connection troubleshoot`,hi:`Network Watcher tools: IP flow verify, next hop, connection troubleshoot`},body:{en:`
<h3>Ask Azure instead of guessing</h3>
<p>A packet from vm-app to vm-db crosses several decisions: a route, maybe a firewall, and two sets of NSG rules. Network Watcher lets you ask Azure about each decision with the exact packet you care about. Think of it as asking each checkpoint: "would you let this person through?"</p>
<div class="dia">`+e+`<p class="cap">Which tool inspects which part of the path. The firewall has its own logs; the others are Network Watcher tools.</p></div>

<h3>IP flow verify</h3>
<p>You give it a VM (NIC), a direction, protocol, local IP and port, remote IP and port. It evaluates the NSG rules (subnet and NIC) and answers <b>Allow</b> or <b>Deny</b> and the name of the rule. It does not send traffic and it does not look at routes or Azure Firewall.</p>
<pre class="code">az network watcher test-ip-flow -g rg-spoke2 --vm vm-db --direction Inbound --protocol TCP --local 10.2.1.4:1433 --remote 10.1.1.4:50000</pre>
<pre class="out"><span class="c">Illustrative output</span>
Access   RuleName
<span class="hl">Deny</span>     defaultSecurityRules/DenyAllInBound</pre>
<p>Reading it: the destination NIC denies this packet because no custom rule allows TCP 1433 from 10.1.1.4, so the default deny rule matched. The fix is a rule, not a route. Use a high ephemeral port such as 50000 for the source side, because inbound rules usually care about the destination port only.</p>

<h3>Next hop</h3>
<p>Given a VM and a destination IP, it tells you the next hop type and address and the route table that made the decision.</p>
<pre class="code">az network watcher show-next-hop -g rg-spoke1 --vm vm-app --source-ip 10.1.1.4 --dest-ip 10.2.1.4</pre>
<pre class="out"><span class="c">Illustrative output</span>
NextHopType        NextHopIpAddress   RouteTableId
<span class="hl">VirtualAppliance</span>   10.0.1.4           .../routeTables/rt-spoke1</pre>
<p>Possible types: <code>VnetLocal</code>, <code>VNetPeering</code>, <code>VirtualNetworkGateway</code>, <code>VirtualAppliance</code>, <code>Internet</code>, <code>VirtualNetworkServiceEndpoint</code>, <code>None</code>. <b>None</b> means the packet is dropped: a route to nowhere, or no route at all. Next hop shows the route decision only; it does not tell you whether the next hop will allow the packet.</p>

<h3>Effective security rules and effective routes</h3>
<p>These show everything Azure applies to one NIC after merging, which is what you read when two teams edit the same NSG or route table.</p>
<pre class="code">az network nic list-effective-nsg -g rg-spoke2 -n vm-db-nic -o table
az network nic show-effective-route-table -g rg-spoke2 -n vm-db-nic -o table</pre>
<p>Effective security rules lists the NIC NSG and subnet NSG rules with priority, source, destination, port and action. Effective routes lists system, BGP and user routes with their state: <code>Active</code> or <code>Invalid</code>. An <code>Invalid</code> UDR (for example next hop pointing at an unreachable address) is a classic finding.</p>

<h3>Connection troubleshoot</h3>
<p>This tool runs a live test from a source VM to a destination VM, FQDN, URL or IP and port. It reports <b>reachable or unreachable</b>, latency, the hops found and, when it can, the reason, such as a rule or route that blocks. The source VM needs the Network Watcher Agent extension (verify the current extension and agent requirements before publishing).</p>
<pre class="code">az vm extension set -g rg-spoke1 --vm-name vm-app --name NetworkWatcherAgentLinux --publisher Microsoft.Azure.NetworkWatcher
az network watcher test-connectivity -g rg-spoke1 --source-resource vm-app --dest-address 10.2.1.4 --dest-port 1433</pre>
<pre class="out"><span class="c">Illustrative output</span>
ConnectionStatus: <span class="hl">Unreachable</span>
AvgLatencyInMs:   n/a
Hops: vm-app -&gt; 10.0.1.4 (VirtualAppliance) -&gt; 10.2.1.4   issue: NetworkSecurityRule (rule: DenyAllInBound)</pre>
<p>A reachable result proves the network path for that port; the application can still fail above it.</p>

<h3>Topology and VPN diagnostics</h3>
<p><b>Topology</b> draws the resources in a resource group and their links (NICs, subnets, VNets, NSGs, route tables) to help you see what is connected to what. <b>VPN diagnostics</b> (also reachable from the VPN gateway blade) checks a gateway or connection and saves a report to a storage account, with findings such as tunnel not up or key mismatch (verify the current report contents).</p>
<pre class="code">az network watcher show-topology -g rg-spoke1 -o table</pre>

<h3>Limits to remember</h3>
<ul>
<li>IP flow verify does not understand Azure Firewall rules, OS firewalls or application state.</li>
<li>Next hop covers the first routing decision from that NIC, not every hop beyond.</li>
<li>Most tools need the VM to be running and the Network Watcher resource to exist in that region.</li>
<li>They see Azure; they cannot see on-premises devices.</li>
</ul>

<div class="warn"><p><b>Common mistakes:</b> testing with the wrong NIC, using the source port as the destination port, reading "Allow" from IP flow verify as proof the whole path works, and forgetting the subnet NSG when only the NIC was checked.</p></div>
<div class="exam"><p><b>Exam trap:</b> next hop type <code>None</code> means traffic is dropped. IP flow verify answers about NSGs only. Connection troubleshoot needs the agent on the source VM.</p></div>

<div class="scn"><h4>Allowed in the tool, blocked in the firewall</h4><p>An engineer ran IP flow verify and got Allow for vm-app to vm-db, yet the connection failed. The firewall log showed Deny. IP flow verify only looks at NSGs, so it was truthful but incomplete. Connection troubleshoot then listed the firewall hop, and the missing firewall rule was added.</p><p><b>Lesson:</b> know what each tool does not see.</p></div>

<div class="iv"><p class="q">"What is the difference between IP flow verify and connection troubleshoot?"</p><p>IP flow verify evaluates NSG rules for one packet on one NIC without sending traffic and names the rule. Connection troubleshoot sends a real test to a destination and reports reachability, latency and hops, including issues it can attribute. Use the first to find which rule, the second to prove the whole path.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IP flow verify: NSG allow or deny and the rule name, no traffic sent.</li>
<li>Next hop: the route decision; type None means drop.</li>
<li>Effective security rules and routes show what Azure really applies to a NIC.</li>
<li>Connection troubleshoot tests the real path and needs the agent on the source.</li>
<li>Know each tool's blind spots: firewall, OS and on-premises.</li>
</ul></div>
`,hi:`
<h3>Andaza lagane ki jagah Azure se poochho</h3>
<p>vm-app se vm-db ka packet kai faislon se guzarta hai: ek route, shayad firewall, aur NSG rules ke do set. Network Watcher aapko har faisle ke baare mein Azure se usi exact packet ke saath poochne deta hai jo aapko chahiye. Ise aise samjho ki har checkpoint se poochh rahe ho: "kya aap is vyakti ko jaane denge?"</p>
<div class="dia">`+e+`<p class="cap">Kaunsa tool path ke kaunse hisse ko inspect karta hai. Firewall ke apne logs hain; baaki Network Watcher tools hain.</p></div>

<h3>IP flow verify</h3>
<p>Aap ise VM (NIC), direction, protocol, local IP aur port, remote IP aur port dete ho. Yeh NSG rules (subnet aur NIC) evaluate karta hai aur <b>Allow</b> ya <b>Deny</b> aur rule ka naam batata hai. Yeh traffic nahi bhejta aur routes ya Azure Firewall ko nahi dekhta.</p>
<pre class="code">az network watcher test-ip-flow -g rg-spoke2 --vm vm-db --direction Inbound --protocol TCP --local 10.2.1.4:1433 --remote 10.1.1.4:50000</pre>
<pre class="out"><span class="c">Illustrative output</span>
Access   RuleName
<span class="hl">Deny</span>     defaultSecurityRules/DenyAllInBound</pre>
<p>Padhna: destination NIC is packet ko deny karta hai kyunki 10.1.1.4 se TCP 1433 allow karne wala koi custom rule nahi, isliye default deny rule match hua. Fix rule hai, route nahi. Source side ke liye 50000 jaisa high ephemeral port use karo, kyunki inbound rules aam taur par sirf destination port dekhte hain.</p>

<h3>Next hop</h3>
<p>VM aur destination IP dene par yeh next hop type aur address aur woh route table batata hai jisne faisla kiya.</p>
<pre class="code">az network watcher show-next-hop -g rg-spoke1 --vm vm-app --source-ip 10.1.1.4 --dest-ip 10.2.1.4</pre>
<pre class="out"><span class="c">Illustrative output</span>
NextHopType        NextHopIpAddress   RouteTableId
<span class="hl">VirtualAppliance</span>   10.0.1.4           .../routeTables/rt-spoke1</pre>
<p>Sambhavit types: <code>VnetLocal</code>, <code>VNetPeering</code>, <code>VirtualNetworkGateway</code>, <code>VirtualAppliance</code>, <code>Internet</code>, <code>VirtualNetworkServiceEndpoint</code>, <code>None</code>. <b>None</b> ka matlab packet drop hota hai: kahin nahi jaata route, ya koi route nahi. Next hop sirf route faisla dikhata hai; yeh nahi batata ki next hop packet ko allow karega ya nahi.</p>

<h3>Effective security rules aur effective routes</h3>
<p>Yeh ek NIC par merge hone ke baad Azure jo kuch lagata hai woh sab dikhate hain, jo tab padhte ho jab do teams ek hi NSG ya route table edit karti hain.</p>
<pre class="code">az network nic list-effective-nsg -g rg-spoke2 -n vm-db-nic -o table
az network nic show-effective-route-table -g rg-spoke2 -n vm-db-nic -o table</pre>
<p>Effective security rules NIC NSG aur subnet NSG rules priority, source, destination, port aur action ke saath dikhata hai. Effective routes system, BGP aur user routes unki state ke saath dikhata hai: <code>Active</code> ya <code>Invalid</code>. <code>Invalid</code> UDR (jaise next hop unreachable address par) classic finding hai.</p>

<h3>Connection troubleshoot</h3>
<p>Yeh tool source VM se destination VM, FQDN, URL ya IP aur port tak live test chalata hai. Yeh <b>reachable ya unreachable</b>, latency, mile hue hops aur, jab sake, karan report karta hai, jaise koi rule ya route jo block karta hai. Source VM ko Network Watcher Agent extension chahiye (current extension aur agent requirements publish se pehle verify karo).</p>
<pre class="code">az vm extension set -g rg-spoke1 --vm-name vm-app --name NetworkWatcherAgentLinux --publisher Microsoft.Azure.NetworkWatcher
az network watcher test-connectivity -g rg-spoke1 --source-resource vm-app --dest-address 10.2.1.4 --dest-port 1433</pre>
<pre class="out"><span class="c">Illustrative output</span>
ConnectionStatus: <span class="hl">Unreachable</span>
AvgLatencyInMs:   n/a
Hops: vm-app -&gt; 10.0.1.4 (VirtualAppliance) -&gt; 10.2.1.4   issue: NetworkSecurityRule (rule: DenyAllInBound)</pre>
<p>Reachable result us port ke liye network path saabit karta hai; application phir bhi uske upar fail ho sakti hai.</p>

<h3>Topology aur VPN diagnostics</h3>
<p><b>Topology</b> resource group ke resources aur unke links (NICs, subnets, VNets, NSGs, route tables) draw karta hai taaki dikhe ki kya kisse juda hai. <b>VPN diagnostics</b> (VPN gateway blade se bhi milta hai) gateway ya connection check karke storage account mein report save karta hai, findings jaise tunnel up nahi ya key mismatch ke saath (current report contents verify karo).</p>
<pre class="code">az network watcher show-topology -g rg-spoke1 -o table</pre>

<h3>Yaad rakhne wali limits</h3>
<ul>
<li>IP flow verify Azure Firewall rules, OS firewalls ya application state nahi samajhta.</li>
<li>Next hop us NIC se pehla routing faisla cover karta hai, uske aage ke har hop ko nahi.</li>
<li>Zyadatar tools ko VM running aur us region mein Network Watcher resource chahiye.</li>
<li>Yeh Azure dekhte hain; on-premises devices nahi dekh sakte.</li>
</ul>

<div class="warn"><p><b>Common mistakes:</b> galat NIC se test karna, source port ko destination port ki tarah use karna, IP flow verify ke "Allow" ko poore path ka saboot maan lena, aur sirf NIC check karke subnet NSG bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap:</b> next hop type <code>None</code> matlab traffic drop. IP flow verify sirf NSGs ke baare mein jawab deta hai. Connection troubleshoot ko source VM par agent chahiye.</p></div>

<div class="scn"><h4>Tool mein allowed, firewall mein blocked</h4><p>Ek engineer ne IP flow verify chalaya aur vm-app se vm-db ke liye Allow mila, phir bhi connection fail hua. Firewall log mein Deny tha. IP flow verify sirf NSGs dekhta hai, isliye woh sachcha tha par adhoora. Connection troubleshoot ne phir firewall hop list kiya, aur missing firewall rule jodi gayi.</p><p><b>Lesson:</b> jaano ki har tool kya nahi dekhta.</p></div>

<div class="iv"><p class="q">"IP flow verify aur connection troubleshoot mein kya farq hai?"</p><p>IP flow verify ek NIC par ek packet ke liye NSG rules evaluate karta hai, traffic bheje bina, aur rule ka naam batata hai. Connection troubleshoot destination tak asli test bhejta hai aur reachability, latency aur hops report karta hai, jo issues attribute kar sake unhe bhi. Pehle se pata chalta hai kaunsa rule, doosre se poora path saabit hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IP flow verify: NSG allow ya deny aur rule ka naam, traffic nahi bhejta.</li>
<li>Next hop: route faisla; type None matlab drop.</li>
<li>Effective security rules aur routes dikhate hain Azure NIC par asal mein kya lagata hai.</li>
<li>Connection troubleshoot asli path test karta hai aur source par agent chahiye.</li>
<li>Har tool ke blind spots jaano: firewall, OS aur on-premises.</li>
</ul></div>
`}};export{t as default};