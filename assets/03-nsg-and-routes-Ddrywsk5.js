var e=`<svg viewBox="0 0 640 250" role="img" aria-label="NSG evaluation order: inbound traffic meets the subnet NSG first then the NIC NSG; outbound meets the NIC NSG first then the subnet NSG">
<rect x="15" y="30" width="610" height="90" rx="10" fill="#f1f5f9" stroke="#64748b"/><text x="30" y="52" class="svg-accent" font-size="12">Inbound to vm-db</text>
<rect x="30" y="64" width="110" height="40" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="85" y="89" text-anchor="middle" class="svg-ink" font-size="12">Packet arrives</text>
<rect x="190" y="64" width="170" height="40" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="275" y="82" text-anchor="middle" class="svg-ink" font-size="12">1. Subnet NSG</text><text x="275" y="97" text-anchor="middle" class="svg-muted" font-size="10">first match wins</text>
<rect x="410" y="64" width="150" height="40" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="485" y="82" text-anchor="middle" class="svg-ink" font-size="12">2. NIC NSG</text><text x="485" y="97" text-anchor="middle" class="svg-muted" font-size="10">first match wins</text>
<g stroke="#64748b" stroke-width="2"><line x1="140" y1="84" x2="190" y2="84"/><line x1="360" y1="84" x2="410" y2="84"/></g>
<rect x="15" y="135" width="610" height="90" rx="10" fill="#f1f5f9" stroke="#64748b"/><text x="30" y="157" class="svg-accent" font-size="12">Outbound from vm-db</text>
<rect x="30" y="169" width="110" height="40" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="85" y="194" text-anchor="middle" class="svg-ink" font-size="12">Packet leaves</text>
<rect x="190" y="169" width="170" height="40" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="275" y="187" text-anchor="middle" class="svg-ink" font-size="12">1. NIC NSG</text><text x="275" y="202" text-anchor="middle" class="svg-muted" font-size="10">first match wins</text>
<rect x="410" y="169" width="150" height="40" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="485" y="187" text-anchor="middle" class="svg-ink" font-size="12">2. Subnet NSG</text><text x="485" y="202" text-anchor="middle" class="svg-muted" font-size="10">first match wins</text>
<g stroke="#64748b" stroke-width="2"><line x1="140" y1="189" x2="190" y2="189"/><line x1="360" y1="189" x2="410" y2="189"/></g>
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="12">Both NSGs must allow the packet</text>
<text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="11">Lowest priority number is checked first inside each NSG</text>
</svg>`,t={id:`nsg-and-routes`,h:{en:`Reading NSG rules and effective routes like a pro`,hi:`NSG rules aur effective routes pro ki tarah padhna`},body:{en:`
<h3>Two checkpoints, one rulebook</h3>
<p>Most "cannot connect" tickets inside Azure end at one of two places: a <b>Network Security Group (NSG)</b> rule, or a <b>route</b>. The tools in the last chapter find them; this chapter teaches you to read what they show, so that you can tell in seconds <i>why</i> a packet was denied or sent the wrong way.</p>

<h3>How NSG rules are evaluated</h3>
<ul>
<li>An NSG holds inbound and outbound rules. Each rule has a <b>priority</b> (100 to 4096; lower number first), source, destination, protocol, port range and action (Allow or Deny).</li>
<li>Rules are checked from the lowest priority number up. The <b>first match wins</b> and checking stops.</li>
<li>NSGs are <b>stateful</b>: if a flow is allowed in one direction, the replies are allowed automatically.</li>
<li>An NSG can be attached to a subnet, to a NIC, or to both. For <b>inbound</b> traffic the subnet NSG is checked first, then the NIC NSG. For <b>outbound</b> traffic the NIC NSG is checked first, then the subnet NSG. <b>Both must allow</b> the packet.</li>
</ul>
<div class="dia">`+e+`<p class="cap">Evaluation order for traffic into and out of vm-db when both a subnet NSG and a NIC NSG exist.</p></div>

<h3>The default rules you cannot delete</h3>
<table class="cmp"><tr><th>Direction</th><th>Priority</th><th>Name</th><th>Action</th></tr>
<tr><td>Inbound</td><td>65000</td><td>AllowVnetInBound</td><td>Allow VirtualNetwork to VirtualNetwork</td></tr>
<tr><td>Inbound</td><td>65001</td><td>AllowAzureLoadBalancerInBound</td><td>Allow AzureLoadBalancer to any</td></tr>
<tr><td>Inbound</td><td>65500</td><td>DenyAllInBound</td><td>Deny all</td></tr>
<tr><td>Outbound</td><td>65000</td><td>AllowVnetOutBound</td><td>Allow VirtualNetwork to VirtualNetwork</td></tr>
<tr><td>Outbound</td><td>65001</td><td>AllowInternetOutBound</td><td>Allow any to Internet</td></tr>
<tr><td>Outbound</td><td>65500</td><td>DenyAllOutBound</td><td>Deny all</td></tr></table>
<p>The <b>VirtualNetwork</b> service tag covers the VNet address space, peered VNets, and on-premises ranges connected by VPN or ExpressRoute (and routes behind a firewall used in UDRs, verify). That is why spoke-to-spoke traffic is usually allowed by default and the default deny only matters from the internet and where you add your own deny rules.</p>
<p>Use <b>service tags</b> (such as Internet, AzureLoadBalancer, Storage) and <b>application security groups</b> (named sets of NICs) in rules instead of IP lists. They are easier to read and do not go stale.</p>

<h3>Reading a rule set</h3>
<pre class="out"><span class="c">Illustrative output: effective security rules for vm-db inbound</span>
Priority  Name                 Port   Source          Action
100       allow-app-sql        1433   10.1.1.0/24     Allow
200       deny-spoke1          Any    10.1.0.0/16     <span class="hl">Deny</span>
65000     AllowVnetInBound     Any    VirtualNetwork  Allow
65500     DenyAllInBound       Any    Any             Deny</pre>
<p>A packet from 10.1.1.4 to TCP 1433 matches priority 100 first: allowed. A packet from 10.1.2.9 (another subnet in spoke1) misses rule 100 (wrong source subnet), matches rule 200: denied. Order, not just content, decides. If the allow were priority 300 and the deny priority 200, 10.1.1.4 would be denied too.</p>
<pre class="code">az network nsg rule create -g rg-spoke2 --nsg-name nsg-db -n allow-app-sql --priority 100 --direction Inbound --access Allow --protocol Tcp --source-address-prefixes 10.1.1.0/24 --destination-port-ranges 1433
az network nsg rule list -g rg-spoke2 --nsg-name nsg-db -o table</pre>

<h3>Routes: a quick revision with new eyes</h3>
<ol>
<li>The longest prefix match wins.</li>
<li>For equal prefixes: UDR, then BGP, then system routes (peering routes are system routes).</li>
<li>Next hop types decide the path: VnetLocal, VNetPeering, VirtualNetworkGateway, VirtualAppliance, Internet, None.</li>
</ol>
<pre class="out"><span class="c">Illustrative output: effective routes of vm-db</span>
Source    State      Address Prefix    Next Hop Type      Next Hop IP
Default   Active     10.2.0.0/16       VnetLocal          -
Default   Active     10.0.0.0/16       VNetPeering        -
User      <span class="hl">Invalid</span>    10.1.0.0/16       VirtualAppliance   10.0.1.40
Default   Active     0.0.0.0/0         Internet           -</pre>
<p>The <code>Invalid</code> UDR means Azure cannot use it (the next hop address 10.0.1.40 is not a valid appliance). Since the route is invalid, the traffic falls back to the next best route, often the peering route, so replies bypass the firewall (asymmetric) or go nowhere. Always scan the State column.</p>

<h3>Other places a packet can be stopped</h3>
<ul>
<li><b>Azure Firewall</b> (check its logs; IP flow verify does not see it).</li>
<li><b>OS firewall</b> (Windows Defender Firewall, iptables, ufw).</li>
<li><b>Service endpoints and private endpoints</b>, storage firewalls and PaaS firewalls.</li>
<li><b>NSG on GatewaySubnet</b>, which can break VPN or ExpressRoute gateways; do not attach one unless you know the current guidance (verify).</li>
<li>Platform addresses such as 168.63.129.16 (DNS, health probes) and 169.254.169.254 (metadata) must not be blocked.</li>
</ul>

<div class="warn"><p><b>Common mistakes:</b> an NSG rule with the wrong priority order, allowing on the NIC NSG but forgetting the subnet NSG, wide Deny rules above narrow Allows, and ignoring Invalid routes.</p></div>
<div class="exam"><p><b>Exam trap:</b> inbound = subnet NSG then NIC NSG; outbound = NIC NSG then subnet NSG. Lower priority number is evaluated first. NSGs are stateful.</p></div>

<div class="scn"><h4>The deny rule with a lucky number</h4><p>A security engineer added "deny all from spoke1" at priority 90 to protect the database subnet. It sat above the app's allow at priority 100, and the next morning the application could not connect. Effective security rules showed rule 90 matched first. Moving the allow to priority 80 restored service while keeping the deny for other sources.</p><p><b>Lesson:</b> read priorities, not just rule names.</p></div>

<div class="iv"><p class="q">"In what order are NSGs evaluated and how do you find which rule blocked a packet?"</p><p>Inbound: subnet NSG then NIC NSG; outbound: NIC NSG then subnet NSG; lowest priority number first, first match wins, both must allow. To find the rule use IP flow verify or effective security rules on the destination NIC, and for flows that already happened check flow logs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NSG rules: lowest number first, first match wins, stateful.</li>
<li>Inbound hits the subnet NSG first; outbound hits the NIC NSG first; both must allow.</li>
<li>Default rules allow VNet traffic and deny the rest of the inbound.</li>
<li>Effective routes: scan State; an Invalid UDR silently changes the path.</li>
<li>Remember other blockers: firewall, OS, PaaS firewalls and platform addresses.</li>
</ul></div>
`,hi:`
<h3>Do checkpoints, ek rulebook</h3>
<p>Azure ke andar zyadatar "connect nahi hota" tickets do jagah khatam hote hain: ek <b>Network Security Group (NSG)</b> rule, ya ek <b>route</b>. Pichhle chapter ke tools unhe dhundte hain; yeh chapter sikhata hai ki woh jo dikhate hain use kaise padhein, taaki aap seconds mein bata sako ki packet <i>kyun</i> deny hua ya galat taraf gaya.</p>

<h3>NSG rules kaise evaluate hote hain</h3>
<ul>
<li>NSG mein inbound aur outbound rules hote hain. Har rule ki ek <b>priority</b> (100 se 4096; kam number pehle), source, destination, protocol, port range aur action (Allow ya Deny) hoti hai.</li>
<li>Rules sabse kam priority number se upar ki taraf check hote hain. <b>Pehla match jeetta hai</b> aur checking ruk jaati hai.</li>
<li>NSGs <b>stateful</b> hain: ek direction mein flow allowed ho to replies apne aap allowed hote hain.</li>
<li>NSG subnet se, NIC se, ya dono se attach ho sakta hai. <b>Inbound</b> traffic ke liye pehle subnet NSG, phir NIC NSG check hota hai. <b>Outbound</b> ke liye pehle NIC NSG, phir subnet NSG. <b>Dono ko allow</b> karna padta hai.</li>
</ul>
<div class="dia">`+e+`<p class="cap">Subnet NSG aur NIC NSG dono hone par vm-db ke andar aur bahar ke traffic ka evaluation order.</p></div>

<h3>Default rules jinhe aap delete nahi kar sakte</h3>
<table class="cmp"><tr><th>Direction</th><th>Priority</th><th>Name</th><th>Action</th></tr>
<tr><td>Inbound</td><td>65000</td><td>AllowVnetInBound</td><td>VirtualNetwork se VirtualNetwork allow</td></tr>
<tr><td>Inbound</td><td>65001</td><td>AllowAzureLoadBalancerInBound</td><td>AzureLoadBalancer se any allow</td></tr>
<tr><td>Inbound</td><td>65500</td><td>DenyAllInBound</td><td>Sab deny</td></tr>
<tr><td>Outbound</td><td>65000</td><td>AllowVnetOutBound</td><td>VirtualNetwork se VirtualNetwork allow</td></tr>
<tr><td>Outbound</td><td>65001</td><td>AllowInternetOutBound</td><td>Any se Internet allow</td></tr>
<tr><td>Outbound</td><td>65500</td><td>DenyAllOutBound</td><td>Sab deny</td></tr></table>
<p><b>VirtualNetwork</b> service tag VNet address space, peered VNets, aur VPN ya ExpressRoute se jude on-premises ranges cover karta hai (aur UDRs mein use hue firewall ke peeche ke routes, verify). Isiliye spoke-to-spoke traffic aam taur par default se allowed hota hai aur default deny sirf internet se aur wahan matter karta hai jahan aap apne deny rules jodte ho.</p>
<p>Rules mein IP lists ki jagah <b>service tags</b> (jaise Internet, AzureLoadBalancer, Storage) aur <b>application security groups</b> (NICs ke named sets) use karo. Woh padhne mein aasaan hain aur purane nahi hote.</p>

<h3>Rule set padhna</h3>
<pre class="out"><span class="c">Illustrative output: vm-db inbound ke effective security rules</span>
Priority  Name                 Port   Source          Action
100       allow-app-sql        1433   10.1.1.0/24     Allow
200       deny-spoke1          Any    10.1.0.0/16     <span class="hl">Deny</span>
65000     AllowVnetInBound     Any    VirtualNetwork  Allow
65500     DenyAllInBound       Any    Any             Deny</pre>
<p>10.1.1.4 se TCP 1433 ka packet pehle priority 100 se match hota hai: allowed. 10.1.2.9 (spoke1 ka doosra subnet) ka packet rule 100 miss karta hai (galat source subnet), rule 200 se match hota hai: denied. Sirf content nahi, order faisla karta hai. Allow priority 300 par aur deny priority 200 par hota to 10.1.1.4 bhi denied hota.</p>
<pre class="code">az network nsg rule create -g rg-spoke2 --nsg-name nsg-db -n allow-app-sql --priority 100 --direction Inbound --access Allow --protocol Tcp --source-address-prefixes 10.1.1.0/24 --destination-port-ranges 1433
az network nsg rule list -g rg-spoke2 --nsg-name nsg-db -o table</pre>

<h3>Routes: naye nazariye se quick revision</h3>
<ol>
<li>Longest prefix match jeetta hai.</li>
<li>Barabar prefixes ke liye: UDR, phir BGP, phir system routes (peering routes system routes hain).</li>
<li>Next hop types path decide karte hain: VnetLocal, VNetPeering, VirtualNetworkGateway, VirtualAppliance, Internet, None.</li>
</ol>
<pre class="out"><span class="c">Illustrative output: vm-db ke effective routes</span>
Source    State      Address Prefix    Next Hop Type      Next Hop IP
Default   Active     10.2.0.0/16       VnetLocal          -
Default   Active     10.0.0.0/16       VNetPeering        -
User      <span class="hl">Invalid</span>    10.1.0.0/16       VirtualAppliance   10.0.1.40
Default   Active     0.0.0.0/0         Internet           -</pre>
<p><code>Invalid</code> UDR ka matlab Azure ise use nahi kar sakta (next hop address 10.0.1.40 valid appliance nahi hai). Route invalid hone se traffic agle best route par girta hai, aksar peering route, isliye replies firewall bypass karte hain (asymmetric) ya kahin nahi jaate. Hamesha State column scan karo.</p>

<h3>Doosri jagahein jahan packet ruk sakta hai</h3>
<ul>
<li><b>Azure Firewall</b> (uske logs dekho; IP flow verify ise nahi dekhta).</li>
<li><b>OS firewall</b> (Windows Defender Firewall, iptables, ufw).</li>
<li><b>Service endpoints aur private endpoints</b>, storage firewalls aur PaaS firewalls.</li>
<li><b>GatewaySubnet par NSG</b>, jo VPN ya ExpressRoute gateways tod sakta hai; current guidance jaane bina attach mat karo (verify).</li>
<li>168.63.129.16 (DNS, health probes) aur 169.254.169.254 (metadata) jaise platform addresses block nahi hone chahiye.</li>
</ul>

<div class="warn"><p><b>Common mistakes:</b> galat priority order wala NSG rule, NIC NSG par allow karke subnet NSG bhool jaana, narrow Allows ke upar wide Deny rules, aur Invalid routes ignore karna.</p></div>
<div class="exam"><p><b>Exam trap:</b> inbound = subnet NSG phir NIC NSG; outbound = NIC NSG phir subnet NSG. Kam priority number pehle evaluate hota hai. NSGs stateful hain.</p></div>

<div class="scn"><h4>Lucky number wala deny rule</h4><p>Ek security engineer ne database subnet ki suraksha ke liye "spoke1 se sab deny" priority 90 par jodi. Woh app ke priority 100 wale allow ke upar baithi, aur agli subah application connect nahi kar paya. Effective security rules ne dikhaya ki rule 90 pehle match hua. Allow ko priority 80 par le jaane se service wapas aa gayi aur doosre sources ke liye deny bana raha.</p><p><b>Lesson:</b> priorities padho, sirf rule ke naam nahi.</p></div>

<div class="iv"><p class="q">"NSGs kis order mein evaluate hote hain aur kaunsa rule block kar raha hai yeh kaise dhundte ho?"</p><p>Inbound: subnet NSG phir NIC NSG; outbound: NIC NSG phir subnet NSG; kam priority number pehle, pehla match jeetta hai, dono allow karein. Rule dhundne ke liye destination NIC par IP flow verify ya effective security rules, aur jo flows ho chuke unke liye flow logs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NSG rules: kam number pehle, pehla match jeetta hai, stateful.</li>
<li>Inbound pehle subnet NSG se; outbound pehle NIC NSG se; dono allow karein.</li>
<li>Default rules VNet traffic allow aur baaki inbound deny karte hain.</li>
<li>Effective routes: State scan karo; Invalid UDR chupke se path badal deta hai.</li>
<li>Doosre blockers yaad rakho: firewall, OS, PaaS firewalls aur platform addresses.</li>
</ul></div>
`}};export{t as default};