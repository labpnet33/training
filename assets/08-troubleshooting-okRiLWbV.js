var e=`<svg viewBox="0 0 640 300" role="img" aria-label="Hybrid troubleshooting: separate underlay, tunnel or circuit, BGP, routes, filters, DNS and application">
<g font-size="13">
<rect x="20" y="12" width="600" height="36" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="40" y="35" class="svg-ink">1. Underlay: public IPs reachable, UDP 500 / 4500 open, provider circuit Provisioned</text>
<rect x="20" y="56" width="600" height="36" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="40" y="79" class="svg-ink">2. Tunnel / circuit state: Connected? key, proposals, both links</text>
<rect x="20" y="100" width="600" height="36" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="40" y="123" class="svg-ink">3. BGP: neighbour state, learned and advertised routes</text>
<rect x="20" y="144" width="600" height="36" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="40" y="167" class="svg-ink">4. Routes: effective routes, UDRs, overlap, ER versus VPN preference</text>
<rect x="20" y="188" width="600" height="36" rx="8" fill="#fde68a" stroke="#64748b"/><text x="40" y="211" class="svg-ink">5. Filters: NSG, firewall, OS firewall, MTU / MSS</text>
<rect x="20" y="232" width="600" height="36" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="40" y="255" class="svg-ink">6. Names and application: DNS answers, ports, application health</text>
</g>
<text x="320" y="290" text-anchor="middle" class="svg-muted" font-size="11">Stop at the first layer that disagrees with the design; do not skip down</text>
</svg>`,t={id:`troubleshooting`,h:{en:`Troubleshooting hybrid links: tunnels, BGP, circuits and DNS`,hi:`Hybrid links troubleshoot karna: tunnels, BGP, circuits aur DNS`},body:{en:`
<h3>Layers again</h3>
<p>"The office cannot reach Azure" is the most expensive ticket in cloud networking, because the path crosses your device, the internet or a provider, Azure gateways, routes, filters and DNS. A fixed order avoids chasing the wrong layer.</p>
<div class="dia">`+e+`<p class="cap">The hybrid troubleshooting ladder. Each rung has an Azure view and a device view; compare them.</p></div>

<h3>Rung 1 and 2: is the tunnel or circuit up?</h3>
<pre class="code">az network vpn-connection show -g rg-hub -n cn-office --query "{status:connectionStatus,in:ingressBytesTransferred,out:egressBytesTransferred}" -o json
az network vnet-gateway show -g rg-hub -n vpn-gw-hub --query "{state:provisioningState,sku:sku.name,bgp:bgpSettings.asn}" -o json</pre>
<pre class="out"><span class="c">Illustrative output</span>
{ "status": <span class="hl">"Connecting"</span>, "in": 0, "out": 5821 }</pre>
<p><b>VPN, status not Connected:</b> check that both ends use the same pre-shared key (watch for spaces), the peer public IP in the local network gateway is right, UDP 500 and 4500 (and ESP) are open end to end, IKE version and proposals match, and the device is not behind NAT without NAT-T support. Enable the gateway diagnostic logs (IKE, tunnel and route diagnostics) to a Log Analytics workspace and read the IKE failure reason. Network Watcher can run VPN diagnostics on a connection and write a report to storage. As a last resort, reset the gateway or the connection (briefly disruptive, plan it).</p>
<p><b>ExpressRoute, circuit not working:</b> in the circuit, <code>ServiceProviderProvisioningState</code> must be <code>Provisioned</code>; check both primary and secondary peerings, VLAN, /30 addresses, ASN and MD5. A circuit still <code>NotProvisioned</code> is a provider ticket, not an Azure ticket.</p>
<pre class="code">az network express-route show -g rg-hub -n er-cin --query "{circuit:circuitProvisioningState,provider:serviceProviderProvisioningState}" -o json
az network express-route list-route-tables -g rg-hub -n er-cin --path primary --peering-name AzurePrivatePeering -o table
az network express-route get-stats -g rg-hub -n er-cin -o table</pre>

<h3>Rung 3: BGP</h3>
<pre class="code">az network vnet-gateway list-bgp-peer-status -g rg-hub -n vpn-gw-hub -o table
az network vnet-gateway list-learned-routes -g rg-hub -n vpn-gw-hub -o table
az network vnet-gateway list-advertised-routes -g rg-hub -n vpn-gw-hub --peer 192.168.255.1 -o table</pre>
<p>Tunnel Connected but BGP not: wrong ASN or peer IP, the on-premises peer IP not routed through the tunnel, BGP not enabled on the connection, or ASN clash. No learned routes: the device is not advertising, or a prefix list is filtering. The office does not learn Azure prefixes: check advertised routes and device import policy.</p>

<h3>Rung 4: routes</h3>
<p>Read the <b>effective routes</b> of a VM NIC in a spoke. The on-premises prefix should be next hop <code>VirtualNetworkGateway</code>. If it is missing: gateway transit and use remote gateways on the peerings (spokes), or "Disable BGP route propagation" on a route table, or a UDR overriding it. If the prefix comes via the wrong path: ExpressRoute is preferred over VPN for the same prefix; a more specific prefix on the VPN wins everywhere. Overlapping address space between Azure and on-premises makes some traffic stay local: renumber or use NAT on a device.</p>
<pre class="out"><span class="c">Illustrative output (effective routes)</span>
Source                 State    Address Prefix   Next Hop Type
VirtualNetworkGateway  Active   192.168.0.0/16   <span class="hl">VirtualNetworkGateway</span>   10.0.2.4
Default                Active   10.1.0.0/16      VNetPeering</pre>

<h3>Rung 5: filters, MTU and MSS</h3>
<p>Check NSGs on the target subnet and NIC, the Azure Firewall log if traffic is routed through it, and the guest OS firewall. A tunnel adds IPsec overhead, so large packets may exceed the path MTU: small pings work, big transfers stall, HTTPS handshakes hang. Clamp TCP MSS on the on-premises device (a value around 1350 is often used, verify the current Azure recommendation) and allow ICMP fragmentation-needed messages.</p>

<h3>Rung 6: names and application</h3>
<p>Resolve the name from both sides. If a name returns a public IP instead of the private-endpoint address, fix the Private DNS zone link or the forwarding rule (see the previous chapter). Then test the TCP port with a tool, and only then blame the application.</p>

<h3>Symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>First check</th></tr>
<tr><td>VPN status Connecting</td><td>Key, peer IP, proposals, UDP 500/4500</td><td>Both configs; IKE diagnostic log</td></tr>
<tr><td>Tunnel up, no traffic</td><td>Missing routes, NSG, overlap</td><td>Effective routes, learned routes</td></tr>
<tr><td>Spoke cannot reach on-premises</td><td>No gateway transit / use remote gateways</td><td>Peering flags</td></tr>
<tr><td>BGP stuck in Connecting</td><td>ASN or peer IP wrong, peer not routed</td><td>BGP peer status</td></tr>
<tr><td>Small pings fine, big transfers fail</td><td>MTU / MSS through IPsec</td><td>MSS clamp on device</td></tr>
<tr><td>ExpressRoute down, VPN carries traffic</td><td>Provider or peering failure; failover worked</td><td>Circuit state, both links</td></tr>
<tr><td>Traffic uses VPN though ER is healthy</td><td>VPN advertises more specific prefix</td><td>Effective routes, prefix lengths</td></tr>
<tr><td>Name resolves to public IP</td><td>Private DNS zone not linked, no forwarding</td><td>Zone links, ruleset, resolver</td></tr></table>
<div class="warn"><p><b>Common mistakes:</b> changing both sides at once, resetting the gateway first, never reading the IKE log, ignoring MTU, and forgetting that provider tickets exist.</p></div>
<div class="exam"><p><b>Exam trap:</b> a connection showing Connected means the tunnel is up, not that routes or filters are right. And a longer prefix beats the ExpressRoute preference.</p></div>

<div class="scn"><h4>Small pings, dead SMB</h4><p>After a new tunnel went up, an office PC could ping Azure but file shares from a spoke VM hung at login. Effective routes and NSGs were fine. The engineer tested with a large ping and fragmentation disabled and saw failures above 1400 bytes. Clamping TCP MSS on the office firewall fixed the share.</p><p><b>Lesson:</b> if small works and large fails, think MTU and MSS.</p></div>

<div class="iv"><p class="q">"A site-to-site VPN shows Connected but users cannot reach a server in Azure. Steps?"</p><p>Effective routes on an Azure VM and the on-premises route table, BGP learned and advertised routes, peering flags and UDRs in spokes, NSG and firewall logs, MTU and MSS, then DNS and the application. Say you read evidence at each rung before changing anything.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work in order: underlay, tunnel or circuit, BGP, routes, filters, DNS.</li>
<li>Connected is not the same as working: verify routes and filters.</li>
<li>Read the IKE and BGP evidence before resetting anything.</li>
<li>ExpressRoute preferred for equal prefixes; longest prefix always wins.</li>
<li>Small works, big fails: MTU and MSS.</li>
</ul></div>
`,hi:`
<h3>Phir se layers</h3>
<p>"Office Azure tak nahi pahunch pa raha" cloud networking ka sabse mehenga ticket hai, kyunki path aapke device, internet ya provider, Azure gateways, routes, filters aur DNS se guzarta hai. Fixed order galat layer ke peeche bhaagne se bachata hai.</p>
<div class="dia">`+e+`<p class="cap">Hybrid troubleshooting ladder. Har rung ka ek Azure view aur ek device view hota hai; unki tulna karo.</p></div>

<h3>Rung 1 aur 2: tunnel ya circuit up hai?</h3>
<pre class="code">az network vpn-connection show -g rg-hub -n cn-office --query "{status:connectionStatus,in:ingressBytesTransferred,out:egressBytesTransferred}" -o json
az network vnet-gateway show -g rg-hub -n vpn-gw-hub --query "{state:provisioningState,sku:sku.name,bgp:bgpSettings.asn}" -o json</pre>
<pre class="out"><span class="c">Illustrative output</span>
{ "status": <span class="hl">"Connecting"</span>, "in": 0, "out": 5821 }</pre>
<p><b>VPN, status Connected nahi:</b> check karo ki dono ends par same pre-shared key hai (spaces se savdhan), local network gateway mein peer public IP sahi hai, UDP 500 aur 4500 (aur ESP) end to end khule hain, IKE version aur proposals match karte hain, aur device NAT-T support ke bina NAT ke peeche nahi hai. Gateway diagnostic logs (IKE, tunnel aur route diagnostics) Log Analytics workspace mein on karo aur IKE failure reason padho. Network Watcher connection par VPN diagnostics chala kar report storage mein likh sakta hai. Aakhri upay ke taur par gateway ya connection reset karo (thodi der disruptive, plan karke).</p>
<p><b>ExpressRoute, circuit kaam nahi kar raha:</b> circuit mein <code>ServiceProviderProvisioningState</code> <code>Provisioned</code> hona chahiye; primary aur secondary dono peerings, VLAN, /30 addresses, ASN aur MD5 check karo. Jo circuit abhi <code>NotProvisioned</code> hai woh provider ka ticket hai, Azure ka nahi.</p>
<pre class="code">az network express-route show -g rg-hub -n er-cin --query "{circuit:circuitProvisioningState,provider:serviceProviderProvisioningState}" -o json
az network express-route list-route-tables -g rg-hub -n er-cin --path primary --peering-name AzurePrivatePeering -o table
az network express-route get-stats -g rg-hub -n er-cin -o table</pre>

<h3>Rung 3: BGP</h3>
<pre class="code">az network vnet-gateway list-bgp-peer-status -g rg-hub -n vpn-gw-hub -o table
az network vnet-gateway list-learned-routes -g rg-hub -n vpn-gw-hub -o table
az network vnet-gateway list-advertised-routes -g rg-hub -n vpn-gw-hub --peer 192.168.255.1 -o table</pre>
<p>Tunnel Connected par BGP nahi: galat ASN ya peer IP, on-premises peer IP tunnel se route nahi hota, connection par BGP enabled nahi, ya ASN clash. Learned routes nahi: device advertise nahi kar raha, ya prefix list filter kar rahi hai. Office Azure prefixes nahi seekhta: advertised routes aur device import policy check karo.</p>

<h3>Rung 4: routes</h3>
<p>Spoke ki VM NIC ke <b>effective routes</b> padho. On-premises prefix next hop <code>VirtualNetworkGateway</code> hona chahiye. Missing ho to: peerings par gateway transit aur use remote gateways (spokes), ya route table par "Disable BGP route propagation", ya use override karta UDR. Prefix galat path se aaye to: same prefix ke liye ExpressRoute VPN par prefer hota hai; VPN par zyada specific prefix har jagah jeetta hai. Azure aur on-premises ke beech overlapping address space se kuch traffic local reh jaata hai: renumber karo ya device par NAT use karo.</p>
<pre class="out"><span class="c">Illustrative output (effective routes)</span>
Source                 State    Address Prefix   Next Hop Type
VirtualNetworkGateway  Active   192.168.0.0/16   <span class="hl">VirtualNetworkGateway</span>   10.0.2.4
Default                Active   10.1.0.0/16      VNetPeering</pre>

<h3>Rung 5: filters, MTU aur MSS</h3>
<p>Target subnet aur NIC ke NSGs, traffic firewall se route ho to Azure Firewall log, aur guest OS firewall check karo. Tunnel IPsec overhead jodta hai, isliye bade packets path MTU se zyada ho sakte hain: chhote ping chalte hain, bade transfers atak jaate hain, HTTPS handshakes hang hote hain. On-premises device par TCP MSS clamp karo (aam taur par 1350 ke aaspaas ki value use hoti hai, current Azure recommendation verify karo) aur ICMP fragmentation-needed messages allow karo.</p>

<h3>Rung 6: names aur application</h3>
<p>Naam dono sides se resolve karo. Naam private-endpoint address ki jagah public IP de to Private DNS zone link ya forwarding rule theek karo (pichhla chapter dekho). Phir TCP port tool se test karo, aur uske baad hi application ko doshi thehrao.</p>

<h3>Symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Sambhavit wajah</th><th>Pehla check</th></tr>
<tr><td>VPN status Connecting</td><td>Key, peer IP, proposals, UDP 500/4500</td><td>Dono configs; IKE diagnostic log</td></tr>
<tr><td>Tunnel up, traffic nahi</td><td>Routes missing, NSG, overlap</td><td>Effective routes, learned routes</td></tr>
<tr><td>Spoke on-premises tak nahi pahunchta</td><td>Gateway transit / use remote gateways nahi</td><td>Peering flags</td></tr>
<tr><td>BGP Connecting par atka</td><td>ASN ya peer IP galat, peer route nahi</td><td>BGP peer status</td></tr>
<tr><td>Chhote ping theek, bade transfers fail</td><td>IPsec ke through MTU / MSS</td><td>Device par MSS clamp</td></tr>
<tr><td>ExpressRoute down, VPN traffic le raha hai</td><td>Provider ya peering failure; failover chala</td><td>Circuit state, dono links</td></tr>
<tr><td>ER healthy hai par traffic VPN use kare</td><td>VPN zyada specific prefix advertise karta hai</td><td>Effective routes, prefix lengths</td></tr>
<tr><td>Naam public IP par resolve hota hai</td><td>Private DNS zone linked nahi, forwarding nahi</td><td>Zone links, ruleset, resolver</td></tr></table>
<div class="warn"><p><b>Common mistakes:</b> dono sides ek saath badalna, pehle gateway reset karna, IKE log kabhi na padhna, MTU ignore karna, aur yeh bhoolna ki provider tickets hote hain.</p></div>
<div class="exam"><p><b>Exam trap:</b> connection Connected dikhaye to matlab tunnel up hai, routes ya filters sahi hain yeh nahi. Aur lamba prefix ExpressRoute ki preference ko haraata hai.</p></div>

<div class="scn"><h4>Chhote ping, mara hua SMB</h4><p>Naya tunnel up hone ke baad office PC Azure ko ping kar sakta tha par spoke VM ke file shares login par hang ho jaate the. Effective routes aur NSGs theek the. Engineer ne fragmentation disable karke bade ping se test kiya aur 1400 bytes ke upar failures dekhe. Office firewall par TCP MSS clamp karne se share chal gaya.</p><p><b>Lesson:</b> chhota chale aur bada fail ho to MTU aur MSS socho.</p></div>

<div class="iv"><p class="q">"Site-to-site VPN Connected dikhata hai par users Azure ke server tak nahi pahunch rahe. Steps?"</p><p>Azure VM par effective routes aur on-premises route table, BGP learned aur advertised routes, spokes mein peering flags aur UDRs, NSG aur firewall logs, MTU aur MSS, phir DNS aur application. Bolo ki kuch badalne se pehle har rung par evidence padhte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein kaam karo: underlay, tunnel ya circuit, BGP, routes, filters, DNS.</li>
<li>Connected matlab working nahi: routes aur filters verify karo.</li>
<li>Kuch reset karne se pehle IKE aur BGP evidence padho.</li>
<li>Barabar prefixes ke liye ExpressRoute preferred; longest prefix hamesha jeetta hai.</li>
<li>Chhota chale, bada fail ho: MTU aur MSS.</li>
</ul></div>
`}};export{t as default};