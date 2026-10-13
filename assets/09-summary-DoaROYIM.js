var e=`<svg viewBox="0 0 640 200" role="img" aria-label="Module summary map: hub-and-spoke, firewall, routes, virtual WAN, route server">
<rect x="20" y="20" width="180" height="60" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="110" y="46" text-anchor="middle" class="svg-ink" font-size="13">Topology</text><text x="110" y="64" text-anchor="middle" class="svg-muted" font-size="11">hub, spokes, peering</text>
<rect x="230" y="20" width="180" height="60" rx="10" fill="#fed7aa" stroke="#64748b"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">Inspection</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="11">Azure Firewall + policy</text>
<rect x="440" y="20" width="180" height="60" rx="10" fill="#bbf7d0" stroke="#64748b"/><text x="530" y="46" text-anchor="middle" class="svg-ink" font-size="13">Steering</text><text x="530" y="64" text-anchor="middle" class="svg-muted" font-size="11">UDRs, forced tunnelling</text>
<rect x="125" y="110" width="180" height="60" rx="10" fill="#ddd6fe" stroke="#64748b"/><text x="215" y="136" text-anchor="middle" class="svg-ink" font-size="13">Managed hub</text><text x="215" y="154" text-anchor="middle" class="svg-muted" font-size="11">Virtual WAN, routing intent</text>
<rect x="335" y="110" width="180" height="60" rx="10" fill="#fde68a" stroke="#64748b"/><text x="425" y="136" text-anchor="middle" class="svg-ink" font-size="13">Dynamic + shared</text><text x="425" y="154" text-anchor="middle" class="svg-muted" font-size="11">Route Server, DNS, Bastion</text>
<g stroke="#64748b" stroke-width="2"><line x1="200" y1="50" x2="230" y2="50"/><line x1="410" y1="50" x2="440" y2="50"/><line x1="320" y1="80" x2="260" y2="110"/><line x1="320" y1="80" x2="380" y2="110"/></g>
</svg>`,t={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The module in one picture</h3>
<div class="dia">`+e+`<p class="cap">Topology decides the shape, the firewall inspects, routes steer, Virtual WAN manages the hub for you, Route Server and shared services complete it.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Draw a hub-and-spoke network and say what lives in the hub and in a spoke.</li>
<li>Create two-sided peerings and explain forwarded traffic, gateway transit and use remote gateways.</li>
<li>Explain why peering is not transitive and how a hub fixes it.</li>
<li>Name the Azure Firewall SKUs and what Premium adds.</li>
<li>Explain Firewall Policy structure and the order DNAT, network, application, default deny.</li>
<li>Write the UDRs for spoke-to-spoke and internet egress, in both directions.</li>
<li>Explain forced tunnelling and the role of the management subnet.</li>
<li>Compare Virtual WAN with a DIY hub, and explain routing intent and secured hubs.</li>
<li>Explain what Route Server does and does not do.</li>
<li>Troubleshoot with the five-rung ladder and effective routes.</li>
<li>Run the two guided labs safely: budget first, delete the resource group the same day.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Spoke</dt><dd>A workload VNet connected to the hub.</dd>
<dt>Hub</dt><dd>The central VNet with shared and security services.</dd>
<dt>Peering</dt><dd>A private, non-transitive link between two VNets; two objects.</dd>
<dt>UDR</dt><dd>User-defined route in a route table; next hop type VirtualAppliance sends traffic to a firewall or NVA.</dd>
<dt>NVA</dt><dd>Network virtual appliance: a vendor firewall or router running in a VM.</dd>
<dt>Firewall Policy</dt><dd>A separate resource that holds rule collection groups, collections and rules.</dd>
<dt>Virtual hub</dt><dd>A Microsoft-managed hub in Virtual WAN.</dd>
<dt>Routing intent</dt><dd>A virtual-hub setting that sends private and/or internet traffic to the hub firewall or NVA.</dd>
<dt>Route Server</dt><dd>A managed BGP service that exchanges routes between an NVA and Azure routing; control plane only.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Subnet names</td><td>AzureFirewallSubnet (/26 or larger), AzureFirewallManagementSubnet (/26), GatewaySubnet, RouteServerSubnet (/27 or larger)</td></tr>
<tr><td>Firewall order</td><td>DNAT, then network, then application, then default deny</td></tr>
<tr><td>Route choice</td><td>Longest prefix first; then UDR, BGP, system route</td></tr>
<tr><td>Peering</td><td>Non-transitive; both sides needed; no overlap</td></tr>
<tr><td>Premium only</td><td>TLS inspection, IDPS, URL filtering and web categories</td></tr>
<tr><td>Route Server</td><td>ASN 65515, BGP, control plane only</td></tr>
<tr><td>Virtual WAN</td><td>Standard type for transit and secured hubs; slow to create; billed hourly</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">az network vnet peering create -g RG -n NAME --vnet-name VNET --remote-vnet REMOTE --allow-forwarded-traffic
az network route-table route create -g RG --route-table-name RT -n NAME --address-prefix 10.2.0.0/16 --next-hop-type VirtualAppliance --next-hop-ip-address 10.0.1.4
az network vnet subnet update -g RG --vnet-name VNET -n SUBNET --route-table RT
az network firewall policy create -g RG -n POLICY --sku Standard
az network watcher show-next-hop -g RG --vm VM --source-ip SRC --dest-ip DST
az network nic show-effective-route-table -g RG -n NIC -o table
az group delete -n RG --yes --no-wait</pre>

<div class="exam"><p><b>Last-minute exam traps:</b> the firewall does nothing until traffic is routed to it; "allow forwarded traffic" is needed for hub-forwarded flows; routes must exist in both directions; a virtual hub is not a normal VNet.</p></div>

<div class="scn"><h4>Interview day, whiteboard</h4><p>A candidate was asked to design connectivity for ten spokes, one office and an internet egress control. They drew a hub with firewall, gateway and DNS, ten peerings, a route table for each spoke with 0.0.0.0/0 and the other spokes' prefixes to the firewall, and noted symmetry and the GatewaySubnet UDR. Asked about scale to 40 branches, they proposed Virtual WAN with routing intent and explained the trade-off.</p><p><b>Lesson:</b> a clear picture, the routes, and the trade-offs beat a list of product names.</p></div>

<div class="iv"><p class="q">"Summarise a secure hub-and-spoke in two minutes."</p><p>Spokes hold workloads and peer to the hub. The hub holds the firewall, the gateway and shared services. UDRs send spoke traffic to the firewall in both directions. A policy defines DNAT, network and application rules. At scale, Virtual WAN with routing intent replaces hand-built routes. Verify with next hop and effective routes, and watch the hourly cost.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hub for control, spokes for workloads, UDRs for steering.</li>
<li>Firewall policy order and subnet names are exam favourites.</li>
<li>Virtual WAN is the managed alternative; Route Server is for dynamic BGP routes.</li>
<li>Troubleshoot top to bottom and verify with effective routes.</li>
<li>Always clean up expensive labs the same day.</li>
</ul></div>
`,hi:`
<h3>Module ek picture mein</h3>
<div class="dia">`+e+`<p class="cap">Topology shape decide karti hai, firewall inspect karta hai, routes steer karte hain, Virtual WAN aapke liye hub manage karta hai, Route Server aur shared services ise poora karte hain.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Hub-and-spoke network draw karo aur batao ki hub aur spoke mein kya rehta hai.</li>
<li>Do-sided peerings banao aur forwarded traffic, gateway transit aur use remote gateways samjhao.</li>
<li>Samjhao ki peering transitive kyun nahi hai aur hub ise kaise theek karta hai.</li>
<li>Azure Firewall SKUs ke naam batao aur Premium kya add karta hai.</li>
<li>Firewall Policy structure aur order DNAT, network, application, default deny samjhao.</li>
<li>Spoke-to-spoke aur internet egress ke UDRs likho, dono directions mein.</li>
<li>Forced tunnelling aur management subnet ka role samjhao.</li>
<li>Virtual WAN ko DIY hub se compare karo, aur routing intent aur secured hubs samjhao.</li>
<li>Samjhao ki Route Server kya karta hai aur kya nahi.</li>
<li>Paanch-rung ladder aur effective routes se troubleshoot karo.</li>
<li>Do guided labs safely chalao: pehle budget, usi din resource group delete.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Spoke</dt><dd>Hub se juda workload VNet.</dd>
<dt>Hub</dt><dd>Shared aur security services wala central VNet.</dd>
<dt>Peering</dt><dd>Do VNets ke beech private, non-transitive link; do objects.</dd>
<dt>UDR</dt><dd>Route table mein user-defined route; next hop type VirtualAppliance traffic firewall ya NVA ko bhejta hai.</dd>
<dt>NVA</dt><dd>Network virtual appliance: VM mein chalne wala vendor firewall ya router.</dd>
<dt>Firewall Policy</dt><dd>Alag resource jisme rule collection groups, collections aur rules hote hain.</dd>
<dt>Virtual hub</dt><dd>Virtual WAN mein Microsoft-managed hub.</dd>
<dt>Routing intent</dt><dd>Virtual-hub setting jo private aur/ya internet traffic hub firewall ya NVA ko bhejti hai.</dd>
<dt>Route Server</dt><dd>Managed BGP service jo NVA aur Azure routing ke beech routes exchange karti hai; sirf control plane.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Subnet names</td><td>AzureFirewallSubnet (/26 ya bada), AzureFirewallManagementSubnet (/26), GatewaySubnet, RouteServerSubnet (/27 ya bada)</td></tr>
<tr><td>Firewall order</td><td>DNAT, phir network, phir application, phir default deny</td></tr>
<tr><td>Route choice</td><td>Pehle longest prefix; phir UDR, BGP, system route</td></tr>
<tr><td>Peering</td><td>Non-transitive; dono sides chahiye; overlap nahi</td></tr>
<tr><td>Sirf Premium</td><td>TLS inspection, IDPS, URL filtering aur web categories</td></tr>
<tr><td>Route Server</td><td>ASN 65515, BGP, sirf control plane</td></tr>
<tr><td>Virtual WAN</td><td>Transit aur secured hubs ke liye Standard type; banane mein slow; hourly billed</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">az network vnet peering create -g RG -n NAME --vnet-name VNET --remote-vnet REMOTE --allow-forwarded-traffic
az network route-table route create -g RG --route-table-name RT -n NAME --address-prefix 10.2.0.0/16 --next-hop-type VirtualAppliance --next-hop-ip-address 10.0.1.4
az network vnet subnet update -g RG --vnet-name VNET -n SUBNET --route-table RT
az network firewall policy create -g RG -n POLICY --sku Standard
az network watcher show-next-hop -g RG --vm VM --source-ip SRC --dest-ip DST
az network nic show-effective-route-table -g RG -n NIC -o table
az group delete -n RG --yes --no-wait</pre>

<div class="exam"><p><b>Aakhri minute ke exam traps:</b> jab tak traffic firewall ko route nahi hota woh kuch nahi karta; hub-forwarded flows ke liye "allow forwarded traffic" chahiye; routes dono directions mein hone chahiye; virtual hub normal VNet nahi hai.</p></div>

<div class="scn"><h4>Interview day, whiteboard</h4><p>Ek candidate se das spokes, ek office aur internet egress control ke liye connectivity design karne ko kaha gaya. Unhone firewall, gateway aur DNS wala hub, das peerings, har spoke ki route table mein 0.0.0.0/0 aur doosre spokes ke prefixes firewall ko, aur symmetry aur GatewaySubnet UDR ka zikr draw kiya. 40 branches tak scale poochhne par unhone routing intent ke saath Virtual WAN suggest kiya aur trade-off samjhaya.</p><p><b>Lesson:</b> saaf picture, routes aur trade-offs product names ki list se behtar hain.</p></div>

<div class="iv"><p class="q">"Secure hub-and-spoke do minute mein summarise karo."</p><p>Spokes workloads rakhte hain aur hub se peer hote hain. Hub mein firewall, gateway aur shared services hain. UDRs spoke traffic dono directions mein firewall ko bhejte hain. Policy DNAT, network aur application rules define karti hai. Scale par hand-built routes ki jagah routing intent wala Virtual WAN aata hai. Next hop aur effective routes se verify karo, aur hourly cost par nazar rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Control ke liye hub, workloads ke liye spokes, steering ke liye UDRs.</li>
<li>Firewall policy order aur subnet names exam favourites hain.</li>
<li>Virtual WAN managed alternative hai; Route Server dynamic BGP routes ke liye.</li>
<li>Upar se neeche troubleshoot karo aur effective routes se verify karo.</li>
<li>Mehenge labs usi din clean up karo.</li>
</ul></div>
`}};export{t as default};