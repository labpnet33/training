var e=(e,t)=>e.replace(/\{\{(\w+)\}\}/g,(e,n)=>t[n]),t=`<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="{{aria}}">
<rect x="10" y="10" width="190" height="190" rx="8" fill="#bae6fd"/><text x="105" y="34" text-anchor="middle" class="svg-ink" font-size="13">{{h1}}</text>
<text x="105" y="62" text-anchor="middle" class="svg-muted" font-size="12">{{a1}}</text><text x="105" y="84" text-anchor="middle" class="svg-muted" font-size="12">{{a2}}</text><text x="105" y="106" text-anchor="middle" class="svg-muted" font-size="12">{{a3}}</text><text x="105" y="128" text-anchor="middle" class="svg-muted" font-size="12">{{a4}}</text>
<rect x="225" y="10" width="190" height="190" rx="8" fill="#ddd6fe"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">{{h2}}</text>
<text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">{{b1}}</text><text x="320" y="84" text-anchor="middle" class="svg-muted" font-size="12">{{b2}}</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="12">{{b3}}</text><text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="12">{{b4}}</text>
<rect x="440" y="10" width="190" height="190" rx="8" fill="#fde68a"/><text x="535" y="34" text-anchor="middle" class="svg-ink" font-size="13">{{h3}}</text>
<text x="535" y="62" text-anchor="middle" class="svg-muted" font-size="12">{{c1}}</text><text x="535" y="84" text-anchor="middle" class="svg-muted" font-size="12">{{c2}}</text><text x="535" y="106" text-anchor="middle" class="svg-muted" font-size="12">{{c3}}</text><text x="535" y="128" text-anchor="middle" class="svg-muted" font-size="12">{{c4}}</text>
</svg><p class="cap">{{cap}}</p></div>`,n=e(t,{aria:`Peering, routes, appliance summary`,h1:`Peering`,a1:`Two links`,a2:`Non-transitive`,a3:`No overlap`,a4:`Flags: 4 per link`,h2:`Routes`,b1:`System + UDR`,b2:`Longest prefix`,b3:`UDR > BGP > system`,b4:`Next hop 5 types`,h3:`Appliance`,c1:`IP forwarding x2`,c2:`Symmetric UDRs`,c3:`Forwarded traffic`,c4:`Hub and spoke`,cap:`The three pillars of this module.`}),r=e(t,{aria:`Peering, routes, appliance summary`,h1:`Peering`,a1:`Do links`,a2:`Non-transitive`,a3:`Overlap nahi`,a4:`Flags: 4 per link`,h2:`Routes`,b1:`System + UDR`,b2:`Longest prefix`,b3:`UDR > BGP > system`,b4:`Next hop 5 types`,h3:`Appliance`,c1:`IP forwarding x2`,c2:`Symmetric UDRs`,c3:`Forwarded traffic`,c4:`Hub and spoke`,cap:`Is module ke teen stambh.`}),i={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>What you can now do</h3>
<ul>
<li>Create, verify and troubleshoot VNet peering in both directions, and explain Initiated, Connected and Disconnected.</li>
<li>Explain non-transitivity and the three ways around it: direct peering, NVA or firewall with UDRs, Virtual WAN or Network Manager.</li>
<li>Plan address space with no overlap and use an IPAM table.</li>
<li>Configure gateway transit and use-remote-gateways as a pair; know global peering cost and limit differences (verify).</li>
<li>List the system routes and the five next-hop types; apply route precedence correctly.</li>
<li>Build hub-and-spoke through an appliance with UDRs, allow-forwarded-traffic and IP forwarding on both the NIC and OS; explain forced tunnelling.</li>
<li>Use effective routes, next hop and IP flow verify; clean up with <code>az group delete</code>.</li>
</ul>
`+n+`
<h3>Mini glossary</h3>
<dl class="terms">
<dt>VNet peering</dt><dd>Private connectivity between two VNets over the Microsoft backbone; two links; non-transitive.</dd>
<dt>Gateway transit</dt><dd>Hub VNet shares its VPN or ExpressRoute gateway with peered spokes.</dd>
<dt>Use remote gateways</dt><dd>Spoke setting to use the hub's gateway.</dd>
<dt>System route</dt><dd>Default route created by Azure (VNet local, internet, peering, gateway).</dd>
<dt>UDR</dt><dd>User-defined route in a route table associated with a subnet.</dd>
<dt>Next hop type</dt><dd>Virtual network, internet, virtual appliance, virtual network gateway, none.</dd>
<dt>NVA</dt><dd>Network virtual appliance: VM or marketplace image acting as router or firewall.</dd>
<dt>IP forwarding</dt><dd>NIC setting plus OS setting allowing a VM to forward packets not addressed to it.</dd>
<dt>Forced tunnelling</dt><dd>Sending 0.0.0.0/0 to on-premises or an appliance instead of straight to the internet.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>Is peering transitive?</td><td>No</td></tr>
<tr><td>Can overlapping VNets peer?</td><td>No</td></tr>
<tr><td>How many links make a peering?</td><td>Two, one per VNet</td></tr>
<tr><td>Does peering use the public internet?</td><td>No, the Microsoft backbone</td></tr>
<tr><td>Route precedence?</td><td>Longest prefix; then UDR, BGP, system</td></tr>
<tr><td>Next hop types?</td><td>Virtual network, internet, virtual appliance, virtual network gateway, none</td></tr>
<tr><td>Gateway transit flags?</td><td>Allow gateway transit (hub), use remote gateways (spoke)</td></tr>
<tr><td>Does the NVA need anything?</td><td>IP forwarding on NIC and OS</td></tr>
<tr><td>Tool for next hop?</td><td>Network Watcher next hop, effective routes</td></tr>
<tr><td>Tool for NSG verdict?</td><td>IP flow verify</td></tr>
<tr><td>Azure reserved addresses per subnet</td><td>5</td></tr>
<tr><td>Is peering data transfer free?</td><td>No, charged per GB (verify)</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">az network vnet peering create -g RG -n a-to-b --vnet-name vnet-a --remote-vnet vnet-b --allow-vnet-access
az network vnet peering list -g RG --vnet-name vnet-a -o table
az network route-table create -g RG -n rt --disable-bgp-route-propagation true
az network route-table route create -g RG --route-table-name rt -n r1 --address-prefix 10.2.0.0/16 --next-hop-type VirtualAppliance --next-hop-ip-address 10.0.1.4
az network vnet subnet update -g RG --vnet-name VNET -n SUBNET --route-table rt
az network nic update -g RG -n NIC --ip-forwarding true
az network nic show-effective-route-table -g RG -n NIC -o table
az network watcher show-next-hop -g RG --vm VM --source-ip SRC --dest-ip DST
az network watcher test-ip-flow -g RG --vm VM --direction Outbound --protocol TCP --local SRC:PORT --remote DST:PORT
az group delete -n RG --yes --no-wait</pre>

<div class="warn"><b>Mistakes to avoid on the exam.</b> Calling peering transitive; forgetting that a UDR for 0.0.0.0/0 does not beat a more specific route; confusing allow-forwarded-traffic (peering) with IP forwarding (NIC); thinking Connected means NSGs allow traffic.</div>
<div class="exam"><b>Exam trap.</b> Watch for questions where the spoke has its own gateway while another option says "use remote gateways": the two are mutually exclusive.</div>

<div class="scn"><h4>The whiteboard interview</h4><p>An interviewer drew three VNets with a hub, asked how spoke 1 reaches spoke 2 privately and securely, and listed constraints: no new public IPs, inspect everything. The candidate described peering with forwarded traffic, UDRs in each spoke, an Azure Firewall in the hub with a NAT Gateway on its subnet, symmetric routing and verification with next hop. The interviewer moved straight to the next topic.</p><p><b>Lesson:</b> a structured answer with verification beats a list of features.</p></div>

<div class="iv"><p class="q">"Summarise in one minute how you connect and control traffic between Azure VNets."</p><p>Peer VNets (two links, no overlap, non-transitive), use hub-and-spoke for shared services, add UDRs to steer traffic through a firewall or NVA, enable allow-forwarded-traffic and IP forwarding, use gateway transit for on-premises, verify with effective routes and next hop, and watch costs (peering data, firewalls, gateways).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Peering gives reachability; routes decide the path.</li>
<li>Longest prefix first, then UDR over BGP over system.</li>
<li>Appliances need both forwarding switches and symmetric routes.</li>
<li>Verify with Network Watcher and effective routes.</li>
<li>Delete the resource group after every lab.</li>
</ul></div>
`,hi:`
<h3>Ab aap kya kar sakte ho</h3>
<ul>
<li>Dono directions mein VNet peering banao, verify aur troubleshoot karo, aur Initiated, Connected, Disconnected samjhao.</li>
<li>Non-transitivity aur uske teen raaste samjhao: direct peering, UDRs ke saath NVA ya firewall, Virtual WAN ya Network Manager.</li>
<li>Bina overlap ke address space plan karo aur IPAM table use karo.</li>
<li>Gateway transit aur use-remote-gateways ko jodi mein configure karo; global peering ke cost aur limit farq jaano (verify).</li>
<li>System routes aur paanch next-hop types gino; route precedence sahi lagao.</li>
<li>UDRs, allow-forwarded-traffic aur NIC tatha OS dono par IP forwarding ke saath appliance ke through hub-and-spoke banao; forced tunnelling samjhao.</li>
<li>Effective routes, next hop aur IP flow verify use karo; <code>az group delete</code> se cleanup karo.</li>
</ul>
`+r+`
<h3>Mini glossary</h3>
<dl class="terms">
<dt>VNet peering</dt><dd>Microsoft backbone par do VNets ke beech private connectivity; do links; non-transitive.</dd>
<dt>Gateway transit</dt><dd>Hub VNet apna VPN ya ExpressRoute gateway peered spokes ke saath share karta hai.</dd>
<dt>Use remote gateways</dt><dd>Hub ka gateway use karne ki spoke setting.</dd>
<dt>System route</dt><dd>Azure ka banaya default route (VNet local, internet, peering, gateway).</dd>
<dt>UDR</dt><dd>Subnet se associated route table mein user-defined route.</dd>
<dt>Next hop type</dt><dd>Virtual network, internet, virtual appliance, virtual network gateway, none.</dd>
<dt>NVA</dt><dd>Network virtual appliance: router ya firewall ki tarah kaam karne wala VM ya marketplace image.</dd>
<dt>IP forwarding</dt><dd>NIC setting plus OS setting jo VM ko apne address par na aaye packets forward karne deti hai.</dd>
<dt>Forced tunnelling</dt><dd>0.0.0.0/0 ko seedha internet ki jagah on-premises ya appliance ko bhejna.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Jawab</th></tr>
<tr><td>Kya peering transitive hai?</td><td>Nahi</td></tr>
<tr><td>Kya overlapping VNets peer ho sakte hain?</td><td>Nahi</td></tr>
<tr><td>Peering kitne links se banti hai?</td><td>Do, har VNet par ek</td></tr>
<tr><td>Kya peering public internet use karti hai?</td><td>Nahi, Microsoft backbone</td></tr>
<tr><td>Route precedence?</td><td>Longest prefix; phir UDR, BGP, system</td></tr>
<tr><td>Next hop types?</td><td>Virtual network, internet, virtual appliance, virtual network gateway, none</td></tr>
<tr><td>Gateway transit flags?</td><td>Allow gateway transit (hub), use remote gateways (spoke)</td></tr>
<tr><td>NVA ko kya chahiye?</td><td>NIC aur OS par IP forwarding</td></tr>
<tr><td>Next hop ka tool?</td><td>Network Watcher next hop, effective routes</td></tr>
<tr><td>NSG verdict ka tool?</td><td>IP flow verify</td></tr>
<tr><td>Subnet mein Azure ke reserved addresses</td><td>5</td></tr>
<tr><td>Kya peering data transfer free hai?</td><td>Nahi, per GB charge (verify)</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">az network vnet peering create -g RG -n a-to-b --vnet-name vnet-a --remote-vnet vnet-b --allow-vnet-access
az network vnet peering list -g RG --vnet-name vnet-a -o table
az network route-table create -g RG -n rt --disable-bgp-route-propagation true
az network route-table route create -g RG --route-table-name rt -n r1 --address-prefix 10.2.0.0/16 --next-hop-type VirtualAppliance --next-hop-ip-address 10.0.1.4
az network vnet subnet update -g RG --vnet-name VNET -n SUBNET --route-table rt
az network nic update -g RG -n NIC --ip-forwarding true
az network nic show-effective-route-table -g RG -n NIC -o table
az network watcher show-next-hop -g RG --vm VM --source-ip SRC --dest-ip DST
az network watcher test-ip-flow -g RG --vm VM --direction Outbound --protocol TCP --local SRC:PORT --remote DST:PORT
az group delete -n RG --yes --no-wait</pre>

<div class="warn"><b>Exam mein bachne wali mistakes.</b> Peering ko transitive kehna; bhoolna ki 0.0.0.0/0 ka UDR zyada specific route ko nahi haraata; allow-forwarded-traffic (peering) ko IP forwarding (NIC) se confuse karna; sochna ki Connected matlab NSGs traffic allow karte hain.</div>
<div class="exam"><b>Exam trap.</b> Aise questions dekho jahan spoke ka apna gateway hai aur doosra option "use remote gateways" kehta hai: dono mutually exclusive hain.</div>

<div class="scn"><h4>Whiteboard interview</h4><p>Interviewer ne hub ke saath teen VNets banaye, poocha ki spoke 1, spoke 2 tak privately aur securely kaise pahunche, aur constraints diye: naye public IPs nahi, sab inspect karo. Candidate ne forwarded traffic ke saath peering, har spoke mein UDRs, hub mein Azure Firewall jiske subnet par NAT Gateway, symmetric routing aur next hop se verification samjhaya. Interviewer seedha agle topic par chala gaya.</p><p><b>Lesson:</b> verification ke saath structured jawab features ki list se behtar hai.</p></div>

<div class="iv"><p class="q">"Ek minute mein batao Azure VNets ke beech traffic kaise jodte aur control karte ho."</p><p>VNets peer karo (do links, overlap nahi, non-transitive), shared services ke liye hub-and-spoke, firewall ya NVA ke through traffic steer karne ke liye UDRs, allow-forwarded-traffic aur IP forwarding enable, on-premises ke liye gateway transit, effective routes aur next hop se verify, aur costs (peering data, firewalls, gateways) par nazar.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Peering reachability deti hai; routes path decide karte hain.</li>
<li>Pehle longest prefix, phir UDR over BGP over system.</li>
<li>Appliances ko dono forwarding switches aur symmetric routes chahiye.</li>
<li>Network Watcher aur effective routes se verify karo.</li>
<li>Har lab ke baad resource group delete karo.</li>
</ul></div>
`}};export{i as default};