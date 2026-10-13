var e=`<svg viewBox="0 0 640 270" role="img" aria-label="Hub-and-spoke troubleshooting order: peering, effective routes, firewall logs, NSG, DNS">
<g font-size="13">
<rect x="20" y="15" width="600" height="38" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="40" y="39" class="svg-ink">1. Peering state Connected on both sides? Address spaces unique?</text>
<rect x="20" y="62" width="600" height="38" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="40" y="86" class="svg-ink">2. Effective routes and next hop on the source NIC: where does the packet go?</text>
<rect x="20" y="109" width="600" height="38" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="40" y="133" class="svg-ink">3. Return path: do replies come back through the same firewall?</text>
<rect x="20" y="156" width="600" height="38" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="40" y="180" class="svg-ink">4. Firewall logs: Allow, Deny, or nothing? Which rule, which priority?</text>
<rect x="20" y="203" width="600" height="38" rx="8" fill="#fde68a" stroke="#64748b"/><text x="40" y="227" class="svg-ink">5. NSG on subnet and NIC; then OS firewall; then DNS and the application</text>
</g>
<text x="320" y="260" text-anchor="middle" class="svg-muted" font-size="11">Work top to bottom; stop at the first layer that disagrees with the design</text>
</svg>`,t={id:`troubleshooting`,h:{en:`Troubleshooting hub-and-spoke: a layered workflow`,hi:`Hub-and-spoke troubleshooting: layered workflow`},body:{en:`
<h3>Do not guess: climb the ladder</h3>
<p>A ticket says "spoke1 cannot reach spoke2". A beginner opens the firewall and starts editing rules. An engineer works down a fixed order, because each layer can fail on its own and the symptoms look the same: a timeout. The order below follows the path of a packet and goes from cheap checks to deeper ones.</p>
<div class="dia">`+e+`<p class="cap">The hub-and-spoke troubleshooting ladder. The next module (Network Watcher) gives you the tools for each rung.</p></div>

<h3>Rung 1: peering and addressing</h3>
<pre class="code">az network vnet peering list -g rg-hub --vnet-name hub-vnet --query "[].{name:name,state:peeringState,fwd:allowForwardedTraffic,gw:allowGatewayTransit}" -o table</pre>
<pre class="out"><span class="c">Illustrative output</span>
Name            State        Fwd     Gw
hub-to-spoke1   Connected    True    True
hub-to-spoke2   <span class="hl">Initiated</span>    True    True</pre>
<p><code>Initiated</code> means the reverse side was never created. <code>Disconnected</code> means one side was deleted and must be recreated. Also confirm that address spaces do not overlap, including with on-premises.</p>

<h3>Rung 2: effective routes and next hop</h3>
<p>Read what Azure actually uses, not what you think you configured.</p>
<pre class="code">az network nic show-effective-route-table -g rg-spoke1 -n vm-spoke1-nic -o table
az network watcher show-next-hop -g rg-spoke1 --vm vm-spoke1 --source-ip 10.1.1.4 --dest-ip 10.2.1.4</pre>
<pre class="out"><span class="c">Illustrative output</span>
Source    State    Address Prefix   Next Hop Type      Next Hop IP
Default   Active   10.2.0.0/16      <span class="hl">VNetPeering</span>   -       (no UDR for this prefix)
User      Active   0.0.0.0/0        VirtualAppliance   10.0.1.4</pre>
<p>If a more specific system route (a peering) exists for the destination, it beats a broader UDR. Peering routes are /16 here, so a UDR for 10.2.0.0/16 ties on prefix length and the UDR wins. If you used 10.0.0.0/8 in the UDR, the peering's 10.2.0.0/16 would win and traffic would skip the firewall. Always use the same or longer prefix.</p>

<h3>Rung 3: the return path</h3>
<p>Run the same check from the destination VM back to the source. If the replies go straight over a peering while the request crossed the firewall, you have asymmetric routing and a stateful firewall will drop the reply. Also look at <b>GatewaySubnet</b>: traffic from on-premises to a spoke needs a UDR there if you want it inspected.</p>

<h3>Rung 4: firewall logs</h3>
<p>With diagnostics on, search the logs for the source and destination IPs. Three outcomes: <b>Allow</b> (the firewall is fine, look further), <b>Deny</b> (read the rule name or default deny and fix the rule, mind priorities and order DNAT, network, application), or <b>nothing</b> (the packet never arrived: go back to rungs 1 to 3).</p>
<pre class="out"><span class="c">Illustrative output (log search, not exact schema)</span>
10:42:11  Deny   10.1.1.4:51022 -&gt; 10.2.1.4:1433   rule: Default deny   <span class="hl">(no rule allows SQL)</span></pre>

<h3>Rung 5: NSG, OS, DNS, application</h3>
<p>The destination subnet and NIC may have NSGs. The default rules allow VNet traffic, but custom rules can deny. Check effective security rules on the destination NIC. Then the guest OS firewall, then DNS (names resolve to the right private IP?), then the application listening on the port.</p>

<h3>Symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Spoke to spoke times out, no firewall log</td><td>Missing UDR, or peering not Connected</td><td>Next hop, peering state</td></tr>
<tr><td>Firewall log shows Allow, still fails</td><td>Asymmetric return path, NSG or OS firewall</td><td>Return next hop, effective NSG</td></tr>
<tr><td>Firewall log Deny</td><td>No rule, or higher priority deny</td><td>Rule priorities, group order</td></tr>
<tr><td>Works in one direction only</td><td>Rule written one way, or missing mirror UDR</td><td>Both route tables, rule source and destination</td></tr>
<tr><td>On-premises cannot reach a spoke</td><td>Gateway transit or remote gateways flag missing; no UDR on GatewaySubnet</td><td>Peering flags, effective routes on GatewaySubnet</td></tr>
<tr><td>Internet egress dies after adding 0/0</td><td>Firewall has no rule, or no public IP, or loop</td><td>Application rule, route on AzureFirewallSubnet</td></tr></table>
<div class="warn"><p><b>Common mistakes:</b> changing many things at once, trusting the route table you wrote instead of the effective routes, testing only one direction, and forgetting NSGs on the destination.</p></div>
<div class="exam"><p><b>Exam trap:</b> a firewall log with no entry means the packet never reached the firewall. Do not edit rules; fix the routing.</p></div>

<div class="scn"><h4>The 10.0.0.0/8 shortcut</h4><p>To save effort a network admin created a single UDR 10.0.0.0/8 to the firewall on spoke1 and called it done. Spoke1 could reach the hub and the firewall allowed it, but spoke1 to spoke2 bypassed the firewall, so the compliance team found uninspected traffic. Effective routes showed the peering route 10.2.0.0/16 (longer prefix) winning over the UDR. The fix was one UDR per destination spoke prefix at the same or longer length.</p><p><b>Lesson:</b> read effective routes; longest prefix always wins.</p></div>

<div class="iv"><p class="q">"Users say two spokes cannot talk through the hub firewall. How do you debug?"</p><p>Peering state, then effective routes and next hop on the source, then the return path, then firewall logs to see allow, deny or nothing, then NSG, OS and DNS. Say you change one thing at a time and re-test from both ends.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Follow the ladder: peering, routes, return path, firewall logs, NSG, DNS.</li>
<li>Effective routes show what Azure uses; longest prefix wins.</li>
<li>No firewall log entry means a routing problem, not a rule problem.</li>
<li>Check both directions and the GatewaySubnet for on-premises traffic.</li>
<li>One change at a time, then retest.</li>
</ul></div>
`,hi:`
<h3>Andaza mat lagao: seedhi chadho</h3>
<p>Ticket kehta hai "spoke1 spoke2 tak nahi pahunch raha". Beginner firewall khol kar rules edit karne lagta hai. Engineer ek fixed order mein neeche jaata hai, kyunki har layer akeli fail ho sakti hai aur symptoms ek jaise dikhte hain: timeout. Neeche ka order packet ke raaste ko follow karta hai aur sasti checks se gehri checks tak jaata hai.</p>
<div class="dia">`+e+`<p class="cap">Hub-and-spoke troubleshooting ladder. Agla module (Network Watcher) har rung ke tools deta hai.</p></div>

<h3>Rung 1: peering aur addressing</h3>
<pre class="code">az network vnet peering list -g rg-hub --vnet-name hub-vnet --query "[].{name:name,state:peeringState,fwd:allowForwardedTraffic,gw:allowGatewayTransit}" -o table</pre>
<pre class="out"><span class="c">Illustrative output</span>
Name            State        Fwd     Gw
hub-to-spoke1   Connected    True    True
hub-to-spoke2   <span class="hl">Initiated</span>    True    True</pre>
<p><code>Initiated</code> ka matlab reverse side kabhi bani hi nahi. <code>Disconnected</code> ka matlab ek side delete hui aur dobara banani padegi. Yeh bhi confirm karo ki address spaces overlap nahi karte, on-premises ke saath bhi.</p>

<h3>Rung 2: effective routes aur next hop</h3>
<p>Wahi padho jo Azure asal mein use karta hai, woh nahi jo aap sochte ho ki aapne configure kiya.</p>
<pre class="code">az network nic show-effective-route-table -g rg-spoke1 -n vm-spoke1-nic -o table
az network watcher show-next-hop -g rg-spoke1 --vm vm-spoke1 --source-ip 10.1.1.4 --dest-ip 10.2.1.4</pre>
<pre class="out"><span class="c">Illustrative output</span>
Source    State    Address Prefix   Next Hop Type      Next Hop IP
Default   Active   10.2.0.0/16      <span class="hl">VNetPeering</span>   -       (is prefix ka UDR nahi)
User      Active   0.0.0.0/0        VirtualAppliance   10.0.1.4</pre>
<p>Agar destination ke liye zyada specific system route (peering) hai to woh broader UDR ko haraata hai. Yahan peering routes /16 hain, isliye 10.2.0.0/16 ka UDR prefix length par tie karta hai aur UDR jeetta hai. Agar UDR mein 10.0.0.0/8 use karte, to peering ka 10.2.0.0/16 jeet jaata aur traffic firewall skip kar deta. Hamesha same ya lamba prefix use karo.</p>

<h3>Rung 3: return path</h3>
<p>Wahi check destination VM se source tak chalao. Agar request firewall se guzri aur replies seedhe peering par gaye, to asymmetric routing hai aur stateful firewall reply drop kar dega. <b>GatewaySubnet</b> bhi dekho: on-premises se spoke ka traffic inspect karna ho to wahan UDR chahiye.</p>

<h3>Rung 4: firewall logs</h3>
<p>Diagnostics on hon to source aur destination IPs se logs search karo. Teen natije: <b>Allow</b> (firewall theek hai, aage dekho), <b>Deny</b> (rule ka naam ya default deny padho aur rule fix karo, priorities aur DNAT, network, application order ka dhyan rakho), ya <b>kuch nahi</b> (packet kabhi pahuncha hi nahi: rungs 1 se 3 par wapas jao).</p>
<pre class="out"><span class="c">Illustrative output (log search, exact schema nahi)</span>
10:42:11  Deny   10.1.1.4:51022 -&gt; 10.2.1.4:1433   rule: Default deny   <span class="hl">(koi rule SQL allow nahi karta)</span></pre>

<h3>Rung 5: NSG, OS, DNS, application</h3>
<p>Destination subnet aur NIC par NSGs ho sakte hain. Default rules VNet traffic allow karte hain, par custom rules deny kar sakte hain. Destination NIC par effective security rules check karo. Phir guest OS firewall, phir DNS (naam sahi private IP par resolve hota hai?), phir application jo port par sun raha ho.</p>

<h3>Symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Sambhavit wajah</th><th>Check</th></tr>
<tr><td>Spoke to spoke timeout, firewall log nahi</td><td>UDR missing, ya peering Connected nahi</td><td>Next hop, peering state</td></tr>
<tr><td>Firewall log Allow dikhata hai, phir bhi fail</td><td>Asymmetric return path, NSG ya OS firewall</td><td>Return next hop, effective NSG</td></tr>
<tr><td>Firewall log Deny</td><td>Rule nahi, ya higher priority deny</td><td>Rule priorities, group order</td></tr>
<tr><td>Sirf ek direction mein chalta hai</td><td>Rule ek taraf likha, ya mirror UDR missing</td><td>Dono route tables, rule source aur destination</td></tr>
<tr><td>On-premises spoke tak nahi pahunchta</td><td>Gateway transit ya remote gateways flag missing; GatewaySubnet par UDR nahi</td><td>Peering flags, GatewaySubnet ke effective routes</td></tr>
<tr><td>0/0 jodne ke baad internet egress mar gaya</td><td>Firewall mein rule nahi, public IP nahi, ya loop</td><td>Application rule, AzureFirewallSubnet ka route</td></tr></table>
<div class="warn"><p><b>Common mistakes:</b> ek saath kai cheezein badalna, effective routes ki jagah apni likhi route table par bharosa karna, sirf ek direction test karna, aur destination ke NSGs bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap:</b> firewall log mein entry na ho to matlab packet firewall tak pahuncha hi nahi. Rules edit mat karo; routing fix karo.</p></div>

<div class="scn"><h4>10.0.0.0/8 ka shortcut</h4><p>Mehnat bachane ke liye ek network admin ne spoke1 par firewall ko ek hi UDR 10.0.0.0/8 bana diya aur kaam khatam maan liya. Spoke1 hub tak pahunch gaya aur firewall ne allow kiya, par spoke1 se spoke2 firewall ko bypass kar gaya, aur compliance team ko uninspected traffic mila. Effective routes mein peering route 10.2.0.0/16 (lamba prefix) UDR par jeet raha tha. Fix: har destination spoke prefix ke liye same ya lambe length ka ek UDR.</p><p><b>Lesson:</b> effective routes padho; longest prefix hamesha jeetta hai.</p></div>

<div class="iv"><p class="q">"Users kehte hain do spokes hub firewall se baat nahi kar paate. Debug kaise karoge?"</p><p>Peering state, phir source par effective routes aur next hop, phir return path, phir firewall logs se allow, deny ya kuch nahi dekhna, phir NSG, OS aur DNS. Bolo ki ek samay mein ek cheez badalte ho aur dono ends se retest karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ladder follow karo: peering, routes, return path, firewall logs, NSG, DNS.</li>
<li>Effective routes dikhate hain Azure kya use karta hai; longest prefix jeetta hai.</li>
<li>Firewall log mein entry nahi matlab routing problem, rule problem nahi.</li>
<li>Dono directions aur on-premises traffic ke liye GatewaySubnet check karo.</li>
<li>Ek samay mein ek change, phir retest.</li>
</ul></div>
`}};export{t as default};