var e=(e,t)=>e.replace(/\{\{(\w+)\}\}/g,(e,n)=>t[n]),t=`<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="{{aria}}">
<rect x="20" y="10" width="600" height="38" rx="6" fill="#bae6fd"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">{{l1}}</text>
<rect x="20" y="58" width="600" height="38" rx="6" fill="#ddd6fe"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="13">{{l2}}</text>
<rect x="20" y="106" width="600" height="38" rx="6" fill="#fde68a"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">{{l3}}</text>
<rect x="20" y="154" width="600" height="38" rx="6" fill="#fed7aa"/><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="13">{{l4}}</text>
<rect x="20" y="202" width="600" height="38" rx="6" fill="#bbf7d0"/><text x="320" y="226" text-anchor="middle" class="svg-ink" font-size="13">{{l5}}</text>
<text x="320" y="268" text-anchor="middle" class="svg-muted" font-size="12">{{n}}</text>
</svg><p class="cap">{{cap}}</p></div>`,n=e(t,{aria:`Layered troubleshooting for peering and routes`,l1:`1 Addressing: overlap? correct VMs and IPs?`,l2:`2 Peering: both links Connected? flags correct?`,l3:`3 Routes: effective routes and next hop match the design?`,l4:`4 Filters: NSG, firewall, OS firewall allow the flow?`,l5:`5 Appliance and application: forwarding, listeners, DNS`,n:`Move top to bottom. Each tool answers one layer. Test from inside the source VM.`,cap:`Five layers, five checks: the same order every time.`}),r=e(t,{aria:`Layered troubleshooting for peering and routes`,l1:`1 Addressing: overlap? sahi VMs aur IPs?`,l2:`2 Peering: dono links Connected? flags sahi?`,l3:`3 Routes: effective routes aur next hop design se match?`,l4:`4 Filters: NSG, firewall, OS firewall flow allow karte hain?`,l5:`5 Appliance aur application: forwarding, listeners, DNS`,n:`Upar se neeche chalo. Har tool ek layer ka jawab deta hai. Source VM ke andar se test karo.`,cap:`Paanch layers, paanch checks: har baar wahi order.`}),i={id:`troubleshooting`,h:{en:`Troubleshooting peering and routing`,hi:`Peering aur routing troubleshoot karna`},body:{en:`
<h3>The method</h3>
<p>Symptoms such as "VM A cannot reach VM B" cross many layers. The Azure tool set matches the layers: <b>Network Watcher</b> (next hop, IP flow verify, connection troubleshoot, effective security rules), the NIC's <b>effective routes</b>, and the peering list. Do not guess; walk the layers from bottom to top or top to bottom, always testing from inside the source VM so that you test the real path.</p>
`+n+`
<h3>Layer 1: addressing</h3>
<p>Do the VNets overlap? Is the destination IP actually inside the peer's address space (10.20.0.0/16) and is the VM the one you think it is? A typo such as 10.2.1.4 versus 10.20.1.4 wastes hours. Use <code>az vm show -d --query privateIps</code>.</p>

<h3>Layer 2: peering</h3>
<pre class="code">az network vnet peering list -g nk-rg --vnet-name vnet-a \\
  --query "[].{name:name, state:peeringState, access:allowVirtualNetworkAccess, fwd:allowForwardedTraffic, gwt:allowGatewayTransit, remote:useRemoteGateways}" -o table</pre>
<pre class="out">Illustrative output
Name     State          Access  Fwd    Gwt    Remote
-------  -------------  ------  -----  -----  ------
a-to-b   <span class="hl">Initiated</span>      True    False  False  False</pre>
<p>Initiated: create the other link. Disconnected: delete and recreate. Access false: traffic is blocked. Forwarded false in a hub-and-spoke through an NVA: packets forwarded by the NVA are dropped.</p>

<h3>Layer 3: routes</h3>
<pre class="code"><span class="c"># What routes does the SOURCE VM's NIC use? Look for the destination prefix and the next hop type.</span>
az network nic show-effective-route-table -g nk-rg -n vm-aVMNic -o table

<span class="c"># What next hop does Azure choose for a specific destination?</span>
az network watcher show-next-hop -g nk-rg --vm vm-a --source-ip 10.10.1.4 --dest-ip 10.20.1.4</pre>
<pre class="out">Illustrative output
NextHopType     : VNetPeering          (what you expect for a directly peered VNet)
NextHopType     : VirtualAppliance     (expected when a UDR forces it through the NVA)
NextHopType     : <span class="hl">None</span>                 (a blackhole route or no usable route: investigate)
NextHopType     : Internet             (the peering route is missing or lost)</pre>

<h3>Layer 4: filters</h3>
<pre class="code"><span class="c"># Would the NSGs permit this exact flow?</span>
az network watcher test-ip-flow -g nk-rg --vm vm-a --direction Outbound --protocol TCP \\
  --local 10.10.1.4:50000 --remote 10.20.1.4:443

<span class="c"># End-to-end test with a verdict (may install an extension on the VM)</span>
az network watcher test-connectivity -g nk-rg --source-resource vm-a --dest-address 10.20.1.4 --dest-port 443</pre>
<pre class="out">Illustrative output
Access: Deny
RuleName: <span class="hl">securityRules/deny-all-in-b</span>   (an NSG on the destination blocks it)</pre>
<p>Also check the OS firewall inside the VM and any Azure Firewall rules in the path.</p>

<h3>Layer 5: appliance and application</h3>
<p>If the path goes through an NVA: is IP forwarding on in <b>both</b> the Azure NIC and the OS? Is the NVA's own firewall allowing the flow? Is the reverse path symmetric? Finally the application: does a process listen on that port, and does the name resolve (peering does not share DNS; use a private DNS zone linked to both VNets)?</p>

<h3>Symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th></tr>
<tr><td>Peering state Initiated</td><td>Missing link on the other side</td></tr>
<tr><td>Peering Disconnected</td><td>One link deleted</td></tr>
<tr><td>Spoke to spoke fails via hub</td><td>Non-transitive; no UDR; no NVA forwarding</td></tr>
<tr><td>Works one way only</td><td>Asymmetric UDRs; stateful firewall sees half</td></tr>
<tr><td>Next hop None</td><td>Blackhole UDR or no route</td></tr>
<tr><td>On-premises unreachable from spoke</td><td>Transit flags missing; gateway or BGP routes missing; use-remote-gateways off</td></tr>
<tr><td>Name does not resolve</td><td>DNS not shared; missing private DNS link</td></tr></table>

<div class="eg"><b>Worked example.</b> Ticket: app in vnet-a cannot reach SQL at 10.20.1.4 port 1433. Peering Connected both ways. Next hop VNetPeering: routing is fine. IP flow verify returns Deny with rule deny-all-in-b on vnet-b's subnet NSG: someone added a deny. The fix is an allow rule for source 10.10.1.0/24 to port 1433 with a lower priority number than the deny. Ten minutes, three commands.</div>

<div class="warn"><b>Common mistakes.</b> Testing from outside; changing several things at once; reading the portal peering list without checking both directions; forgetting NSG rules on the <b>destination</b> side; blaming peering when DNS is the problem.</div>
<div class="exam"><b>Exam trap.</b> "Which tool shows the next hop type for traffic from a VM?" Network Watcher <b>Next hop</b> (and effective routes). "Which tool checks whether an NSG allows a flow?" <b>IP flow verify</b>.</div>

<div class="scn"><h4>Everything Connected, nothing works</h4><p>Two production VNets showed Connected in the portal, yet the app timed out. The engineer used IP flow verify and discovered that the destination subnet's NSG had a custom rule denying all inbound from the VirtualNetwork tag, added by a security baseline. Peering was never the problem. A narrower allow rule above the deny fixed it, and the baseline was updated.</p><p><b>Lesson:</b> Connected means routing exists, not that filters allow the flow.</p></div>

<div class="iv"><p class="q">"Peering is Connected but connectivity fails. What next?"</p><p>Check effective routes and next hop on the source NIC, then IP flow verify for NSG decisions on both ends, the OS firewall, and the application. If an NVA is in the path, confirm forwarding in Azure and the OS, and symmetric routing. Check DNS if names are used.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five layers: addressing, peering, routes, filters, appliance and application.</li>
<li>Network Watcher: next hop, IP flow verify, connection troubleshoot.</li>
<li>Effective routes on the source NIC show what Azure will actually do.</li>
<li>Connected status does not guarantee NSGs allow the flow.</li>
<li>Always test from inside the source VM and change one thing at a time.</li>
</ul></div>
`,hi:`
<h3>Method</h3>
<p>"VM A, VM B tak nahi pahunch raha" jaise symptoms kai layers cross karte hain. Azure ka tool set layers se match karta hai: <b>Network Watcher</b> (next hop, IP flow verify, connection troubleshoot, effective security rules), NIC ke <b>effective routes</b>, aur peering list. Andaza mat lagao; layers par neeche se upar ya upar se neeche chalo, hamesha source VM ke andar se test karo taaki asli path test ho.</p>
`+r+`
<h3>Layer 1: addressing</h3>
<p>Kya VNets overlap karte hain? Kya destination IP asal mein peer ke address space (10.20.0.0/16) mein hai aur VM wahi hai jo aap sochte ho? 10.2.1.4 versus 10.20.1.4 jaisa typo ghanton barbaad karta hai. <code>az vm show -d --query privateIps</code> use karo.</p>

<h3>Layer 2: peering</h3>
<pre class="code">az network vnet peering list -g nk-rg --vnet-name vnet-a \\
  --query "[].{name:name, state:peeringState, access:allowVirtualNetworkAccess, fwd:allowForwardedTraffic, gwt:allowGatewayTransit, remote:useRemoteGateways}" -o table</pre>
<pre class="out">Illustrative output
Name     State          Access  Fwd    Gwt    Remote
-------  -------------  ------  -----  -----  ------
a-to-b   <span class="hl">Initiated</span>      True    False  False  False</pre>
<p>Initiated: doosra link banao. Disconnected: delete karke dobara banao. Access false: traffic blocked. NVA ke through hub-and-spoke mein Forwarded false: NVA ke forward kiye packets drop hote hain.</p>

<h3>Layer 3: routes</h3>
<pre class="code"><span class="c"># SOURCE VM ki NIC kaunse routes use karti hai? Destination prefix aur next hop type dhoondo.</span>
az network nic show-effective-route-table -g nk-rg -n vm-aVMNic -o table

<span class="c"># Kisi khaas destination ke liye Azure kaunsa next hop chunta hai?</span>
az network watcher show-next-hop -g nk-rg --vm vm-a --source-ip 10.10.1.4 --dest-ip 10.20.1.4</pre>
<pre class="out">Illustrative output
NextHopType     : VNetPeering          (seedhe peered VNet ke liye jo expected hai)
NextHopType     : VirtualAppliance     (jab UDR NVA ke through force kare tab expected)
NextHopType     : <span class="hl">None</span>                 (blackhole route ya koi usable route nahi: investigate karo)
NextHopType     : Internet             (peering route missing ya kho gaya)</pre>

<h3>Layer 4: filters</h3>
<pre class="code"><span class="c"># Kya NSGs yeh exact flow allow karenge?</span>
az network watcher test-ip-flow -g nk-rg --vm vm-a --direction Outbound --protocol TCP \\
  --local 10.10.1.4:50000 --remote 10.20.1.4:443

<span class="c"># Verdict ke saath end-to-end test (VM par extension install ho sakta hai)</span>
az network watcher test-connectivity -g nk-rg --source-resource vm-a --dest-address 10.20.1.4 --dest-port 443</pre>
<pre class="out">Illustrative output
Access: Deny
RuleName: <span class="hl">securityRules/deny-all-in-b</span>   (destination par NSG block karta hai)</pre>
<p>VM ke andar OS firewall aur path mein kisi bhi Azure Firewall rules ko bhi check karo.</p>

<h3>Layer 5: appliance aur application</h3>
<p>Path NVA ke through jaata hai to: IP forwarding Azure NIC aur OS <b>dono</b> mein on hai? NVA ka apna firewall flow allow karta hai? Reverse path symmetric hai? Aakhir mein application: kya us port par koi process listen karta hai, aur naam resolve hota hai (peering DNS share nahi karti; dono VNets se linked private DNS zone use karo)?</p>

<h3>Symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th></tr>
<tr><td>Peering state Initiated</td><td>Doosri taraf ka link missing</td></tr>
<tr><td>Peering Disconnected</td><td>Ek link delete hua</td></tr>
<tr><td>Hub ke through spoke to spoke fail</td><td>Non-transitive; UDR nahi; NVA forwarding nahi</td></tr>
<tr><td>Sirf ek taraf chalta hai</td><td>Asymmetric UDRs; stateful firewall ko aadha dikhta hai</td></tr>
<tr><td>Next hop None</td><td>Blackhole UDR ya route nahi</td></tr>
<tr><td>Spoke se on-premises unreachable</td><td>Transit flags missing; gateway ya BGP routes missing; use-remote-gateways off</td></tr>
<tr><td>Naam resolve nahi hota</td><td>DNS share nahi; private DNS link missing</td></tr></table>

<div class="eg"><b>Worked example.</b> Ticket: vnet-a ka app 10.20.1.4 port 1433 par SQL tak nahi pahunch raha. Peering dono taraf Connected. Next hop VNetPeering: routing theek hai. IP flow verify Deny deta hai rule deny-all-in-b ke saath, vnet-b ke subnet NSG par: kisi ne deny jodha hai. Fix source 10.10.1.0/24 se port 1433 ka allow rule hai, deny se chhote priority number ke saath. Das minute, teen commands.</div>

<div class="warn"><b>Common mistakes.</b> Bahar se test karna; kai cheezein ek saath badalna; dono directions check kiye bina portal ki peering list padhna; <b>destination</b> side ke NSG rules bhool jaana; DNS problem ho to peering ko blame karna.</div>
<div class="exam"><b>Exam trap.</b> "VM se traffic ka next hop type kaunsa tool dikhata hai?" Network Watcher <b>Next hop</b> (aur effective routes). "NSG flow allow karta hai ya nahi kaunsa tool check karta hai?" <b>IP flow verify</b>.</div>

<div class="scn"><h4>Sab Connected, kuch kaam nahi karta</h4><p>Do production VNets portal mein Connected the, phir bhi app timeout hui. Engineer ne IP flow verify use kiya aur dekha ki destination subnet ke NSG mein security baseline ne VirtualNetwork tag se saara inbound deny karne wala custom rule jodha tha. Peering kabhi problem thi hi nahi. Deny ke upar ek narrow allow rule ne theek kiya, aur baseline update hui.</p><p><b>Lesson:</b> Connected matlab routing hai, yeh nahi ki filters flow allow karte hain.</p></div>

<div class="iv"><p class="q">"Peering Connected hai par connectivity fail hai. Aage kya?"</p><p>Source NIC ke effective routes aur next hop dekho, phir dono ends ke NSG decisions ke liye IP flow verify, OS firewall aur application. Path mein NVA ho to Azure aur OS mein forwarding aur symmetric routing confirm karo. Names use hon to DNS check karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch layers: addressing, peering, routes, filters, appliance aur application.</li>
<li>Network Watcher: next hop, IP flow verify, connection troubleshoot.</li>
<li>Source NIC ke effective routes dikhate hain Azure asal mein kya karega.</li>
<li>Connected status guarantee nahi deta ki NSGs flow allow karte hain.</li>
<li>Hamesha source VM ke andar se test karo aur ek samay mein ek cheez badlo.</li>
</ul></div>
`}};export{i as default};