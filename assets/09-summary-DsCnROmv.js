var e=`<svg viewBox="0 0 640 170" role="img" aria-label="VNet summary map">
<rect x="10" y="15" width="130" height="55" rx="8" fill="#bae6fd"/><text x="75" y="48" text-anchor="middle" class="svg-ink" font-size="13">Address space</text>
<rect x="160" y="15" width="130" height="55" rx="8" fill="#bbf7d0"/><text x="225" y="48" text-anchor="middle" class="svg-ink" font-size="13">Subnets (5 rsvd)</text>
<rect x="310" y="15" width="130" height="55" rx="8" fill="#ddd6fe"/><text x="375" y="48" text-anchor="middle" class="svg-ink" font-size="13">System routes</text>
<rect x="460" y="15" width="170" height="55" rx="8" fill="#fde68a"/><text x="545" y="48" text-anchor="middle" class="svg-ink" font-size="13">Public IP / outbound</text>
<g stroke="#64748b" stroke-width="2"><line x1="140" y1="42" x2="160" y2="42"/><line x1="290" y1="42" x2="310" y2="42"/><line x1="440" y1="42" x2="460" y2="42"/></g>
<rect x="160" y="100" width="280" height="50" rx="8" fill="#e2e8f0"/><text x="300" y="130" text-anchor="middle" class="svg-ink" font-size="13">Endpoints and DNS (168.63.129.16)</text>
<line x1="300" y1="70" x2="300" y2="100" stroke="#64748b" stroke-width="2"/>
</svg>`,t={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>What you can now do</h3>
<div class="dia">`+e+`<p class="cap">The VNet module in one picture.</p></div>
<ul>
<li>Plan an RFC1918 address space and carve subnets without overlap, leaving room for GatewaySubnet, AzureBastionSubnet and AzureFirewallSubnet.</li>
<li>State the five reserved addresses and the usable counts for /24, /26, /27, /28 and /29.</li>
<li>Read system routes and effective routes, apply longest prefix match, and explain UDR versus BGP versus system priority.</li>
<li>Choose a Standard public IP and explain Basic retirement and the default outbound change (verify dates).</li>
<li>Pick NAT Gateway, load balancer outbound, firewall or a NIC public IP for outbound access.</li>
<li>Compare service endpoints with private endpoints and describe DNS and 168.63.129.16.</li>
<li>Run both guided labs with a cost estimate, verification and cleanup.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>VNet</dt><dd>Regional isolated private network with address prefixes and subnets.</dd>
<dt>System route</dt><dd>Built-in route; defaults for the VNet, the Internet and private ranges.</dd>
<dt>UDR</dt><dd>User-defined route in a route table associated with a subnet.</dd>
<dt>Next hop type</dt><dd>Virtual network, Internet, Virtual appliance, Virtual network gateway, VNet peering, Service endpoint, None.</dd>
<dt>Standard public IP</dt><dd>Static, zone-capable, closed by default.</dd>
<dt>NAT Gateway</dt><dd>Subnet-level outbound with static public IPs.</dd>
<dt>Service endpoint</dt><dd>Subnet extension to a service over the backbone; service keeps a public IP.</dd>
<dt>Private endpoint</dt><dd>Private IP in your subnet for one service resource, via Private Link.</dd>
<dt>168.63.129.16</dt><dd>Azure virtual public IP used for DNS and platform health probes.</dd>
</dl>

<h3>Most tested facts</h3>
<ol>
<li>A VNet is regional and free; subnets are regional too.</li>
<li>Azure reserves 5 addresses per subnet; a /24 has 251 usable; the smallest subnet is /29.</li>
<li>Default routes: VNet space to Virtual network, 0.0.0.0/0 to Internet, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 and 100.64.0.0/10 to None.</li>
<li>Longest prefix wins; on tie, UDR over BGP over system.</li>
<li>Standard public IPs are static and closed by default; Basic is retiring (verify).</li>
<li>New VNets have no default outbound access (verify date).</li>
<li>Service endpoints keep the public IP; private endpoints give a private IP and need private DNS.</li>
<li>Route tables associate with subnets.</li>
</ol>

<h3>Command cheat-sheet</h3>
<pre class="code">az network vnet create -g rg-nk-lab -n vnet-nk --address-prefixes 10.10.0.0/16 --subnet-name snet-web --subnet-prefixes 10.10.1.0/24
az network vnet subnet create -g rg-nk-lab --vnet-name vnet-nk -n snet-app --address-prefixes 10.10.2.0/24
az network vnet subnet update -g rg-nk-lab --vnet-name vnet-nk -n snet-data --service-endpoints Microsoft.Storage
az network route-table create -g rg-nk-lab -n rt-web
az network route-table route create -g rg-nk-lab --route-table-name rt-web -n r1 --address-prefix 10.99.0.0/16 --next-hop-type None
az network vnet subnet update -g rg-nk-lab --vnet-name vnet-nk -n snet-web --route-table rt-web
az network public-ip create -g rg-nk-lab -n pip-web --sku Standard --allocation-method Static
az network nic show-effective-route-table -g rg-nk-lab -n &lt;nic-name&gt; -o table
az network watcher show-next-hop -g rg-nk-lab --vm vm-web --source-ip 10.10.1.4 --dest-ip 203.0.113.50
az group delete --name rg-nk-lab --yes --no-wait</pre>

<h3>Items to verify before relying on them</h3>
<p>Basic public IP retirement date; default outbound access retirement date and property name; system route list; subnet size limits; service endpoint and private endpoint pricing; Network Watcher agent requirements; VM size and image alias availability; portal menu wording.</p>

<div class="warn"><p><b>Common mistake.</b> Memorising the facts without the cleanup habit. The VNet is free, but the VM, disk and Standard public IP of lab 2 are not. Delete the group.</p></div>

<div class="exam"><p><b>Exam alignment.</b> AZ-900: virtual networks, subnets, peering concept, public and private IPs, DNS. AZ-700 foundations: address planning, routing, public IP addressing, service and private endpoints. Always check the current skills outline.</p></div>

<div class="scn"><h4>Design review</h4><p>A reviewer asked a team three questions about their VNet: what is the address plan and does it overlap with the office, how do private VMs get outbound access now that default outbound is gone, and how does the storage account stay private. The team answered with a plan sheet, a NAT Gateway on the app subnet and a private endpoint with a linked DNS zone. The review passed in ten minutes.</p><p><b>Lesson:</b> addressing, outbound and private access are the three standard questions.</p></div>

<div class="iv"><p class="q">"Design a small Azure VNet for a web and an app tier."</p><p>RFC1918 /16 with /24 subnets for web, app and data, a Standard public IP or load balancer for the web tier, NAT Gateway for outbound from private tiers, a private endpoint for storage with private DNS, and NSGs for filtering (next module). Leave space for gateway and firewall subnets.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VNet, subnets and routes are the foundation; NSGs add filtering next.</li>
<li>Plan addresses, leave gaps, avoid overlap.</li>
<li>Standard public IP, explicit outbound, private endpoint plus DNS.</li>
<li>Diagnose with effective routes, Next hop and DNS checks.</li>
<li>Delete the resource group after every lab.</li>
</ul></div>
`,hi:`
<h3>Ab aap kya kar sakte ho</h3>
<div class="dia">`+e+`<p class="cap">VNet module ek picture mein.</p></div>
<ul>
<li>RFC1918 address space plan karo aur bina overlap ke subnets kaato, GatewaySubnet, AzureBastionSubnet aur AzureFirewallSubnet ke liye jagah chhodkar.</li>
<li>Paanch reserved addresses aur /24, /26, /27, /28 aur /29 ke usable counts batao.</li>
<li>System routes aur effective routes padho, longest prefix match lagao, aur UDR versus BGP versus system priority samjhao.</li>
<li>Standard public IP chuno aur Basic retirement aur default outbound change samjhao (dates verify karo).</li>
<li>Outbound access ke liye NAT Gateway, load balancer outbound, firewall ya NIC public IP chuno.</li>
<li>Service endpoints ko private endpoints se compare karo aur DNS aur 168.63.129.16 describe karo.</li>
<li>Dono guided labs cost estimate, verification aur cleanup ke saath chalao.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>VNet</dt><dd>Address prefixes aur subnets wala regional isolated private network.</dd>
<dt>System route</dt><dd>Built-in route; VNet, Internet aur private ranges ke defaults.</dd>
<dt>UDR</dt><dd>Subnet se associated route table mein user-defined route.</dd>
<dt>Next hop type</dt><dd>Virtual network, Internet, Virtual appliance, Virtual network gateway, VNet peering, Service endpoint, None.</dd>
<dt>Standard public IP</dt><dd>Static, zone-capable, default mein closed.</dd>
<dt>NAT Gateway</dt><dd>Static public IPs ke saath subnet-level outbound.</dd>
<dt>Service endpoint</dt><dd>Backbone par service tak subnet ka extension; service public IP rakhti hai.</dd>
<dt>Private endpoint</dt><dd>Private Link se ek service resource ke liye aapke subnet mein private IP.</dd>
<dt>168.63.129.16</dt><dd>DNS aur platform health probes ke liye use hone wala Azure virtual public IP.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<ol>
<li>VNet regional aur free hai; subnets bhi regional hain.</li>
<li>Azure har subnet mein 5 addresses reserve karta hai; /24 mein 251 usable; sabse chhota subnet /29.</li>
<li>Default routes: VNet space Virtual network ko, 0.0.0.0/0 Internet ko, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 aur 100.64.0.0/10 None ko.</li>
<li>Longest prefix jeetta hai; tie par UDR, BGP se aage, BGP system se aage.</li>
<li>Standard public IPs static aur default mein closed hain; Basic retire ho raha hai (verify).</li>
<li>Naye VNets mein default outbound access nahi (date verify karo).</li>
<li>Service endpoints public IP rakhte hain; private endpoints private IP dete hain aur private DNS chahiye.</li>
<li>Route tables subnets se associate hote hain.</li>
</ol>

<h3>Command cheat-sheet</h3>
<pre class="code">az network vnet create -g rg-nk-lab -n vnet-nk --address-prefixes 10.10.0.0/16 --subnet-name snet-web --subnet-prefixes 10.10.1.0/24
az network vnet subnet create -g rg-nk-lab --vnet-name vnet-nk -n snet-app --address-prefixes 10.10.2.0/24
az network vnet subnet update -g rg-nk-lab --vnet-name vnet-nk -n snet-data --service-endpoints Microsoft.Storage
az network route-table create -g rg-nk-lab -n rt-web
az network route-table route create -g rg-nk-lab --route-table-name rt-web -n r1 --address-prefix 10.99.0.0/16 --next-hop-type None
az network vnet subnet update -g rg-nk-lab --vnet-name vnet-nk -n snet-web --route-table rt-web
az network public-ip create -g rg-nk-lab -n pip-web --sku Standard --allocation-method Static
az network nic show-effective-route-table -g rg-nk-lab -n &lt;nic-name&gt; -o table
az network watcher show-next-hop -g rg-nk-lab --vm vm-web --source-ip 10.10.1.4 --dest-ip 203.0.113.50
az group delete --name rg-nk-lab --yes --no-wait</pre>

<h3>Jin items ko rely karne se pehle verify karo</h3>
<p>Basic public IP retirement date; default outbound access retirement date aur property name; system route list; subnet size limits; service endpoint aur private endpoint pricing; Network Watcher agent requirements; VM size aur image alias availability; portal menu wording.</p>

<div class="warn"><p><b>Common mistake.</b> Cleanup ki aadat ke bina facts ratna. VNet free hai, lekin lab 2 ka VM, disk aur Standard public IP free nahi hain. Group delete karo.</p></div>

<div class="exam"><p><b>Exam alignment.</b> AZ-900: virtual networks, subnets, peering concept, public aur private IPs, DNS. AZ-700 foundations: address planning, routing, public IP addressing, service aur private endpoints. Hamesha current skills outline check karo.</p></div>

<div class="scn"><h4>Design review</h4><p>Ek reviewer ne team se unke VNet ke baare mein teen sawal puchhe: address plan kya hai aur kya woh office se overlap karta hai, ab default outbound jaane ke baad private VMs ko outbound access kaise milta hai, aur storage account private kaise rehta hai. Team ne plan sheet, app subnet par NAT Gateway aur linked DNS zone wale private endpoint se jawab diye. Review das minute mein pass ho gaya.</p><p><b>Lesson:</b> addressing, outbound aur private access teen standard sawal hain.</p></div>

<div class="iv"><p class="q">"Web aur app tier ke liye chhota Azure VNet design karo."</p><p>Web, app aur data ke liye /24 subnets wala RFC1918 /16, web tier ke liye Standard public IP ya load balancer, private tiers ke outbound ke liye NAT Gateway, private DNS ke saath storage ke liye private endpoint, aur filtering ke liye NSGs (agla module). Gateway aur firewall subnets ke liye jagah chhodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VNet, subnets aur routes foundation hain; NSGs agla filtering jodte hain.</li>
<li>Addresses plan karo, gaps chhodo, overlap se bacho.</li>
<li>Standard public IP, explicit outbound, private endpoint plus DNS.</li>
<li>Effective routes, Next hop aur DNS checks se diagnose karo.</li>
<li>Har lab ke baad resource group delete karo.</li>
</ul></div>
`}};export{t as default};