var e=`<svg viewBox="0 0 640 170" role="img" aria-label="NSG module summary">
<rect x="10" y="15" width="140" height="55" rx="8" fill="#fde68a"/><text x="80" y="48" text-anchor="middle" class="svg-ink" font-size="13">Rules + priority</text>
<rect x="170" y="15" width="140" height="55" rx="8" fill="#bbf7d0"/><text x="240" y="48" text-anchor="middle" class="svg-ink" font-size="13">Tags + ASGs</text>
<rect x="330" y="15" width="140" height="55" rx="8" fill="#ddd6fe"/><text x="400" y="48" text-anchor="middle" class="svg-ink" font-size="13">Subnet + NIC</text>
<rect x="490" y="15" width="140" height="55" rx="8" fill="#bae6fd"/><text x="560" y="48" text-anchor="middle" class="svg-ink" font-size="13">Logs + Firewall</text>
<g stroke="#64748b" stroke-width="2"><line x1="150" y1="42" x2="170" y2="42"/><line x1="310" y1="42" x2="330" y2="42"/><line x1="470" y1="42" x2="490" y2="42"/></g>
<rect x="150" y="100" width="340" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Test with IP flow verify, clean up with az group delete</text>
</svg>`,t={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>What you can now do</h3>
<div class="dia">`+e+`<p class="cap">The NSG module in one line.</p></div>
<ul>
<li>Write inbound and outbound NSG rules with correct priority, direction, protocol and ports.</li>
<li>Name the six default rules and their priorities, and say what they allow.</li>
<li>Use service tags and ASGs instead of hard-coded IP lists.</li>
<li>Predict evaluation order for subnet and NIC NSGs, inbound and outbound, and read effective security rules.</li>
<li>Use Network Watcher IP flow verify to name the rule that decides a flow.</li>
<li>Explain virtual network flow logs versus the retiring NSG flow logs (verify dates), and when Azure Firewall is needed.</li>
<li>Run both guided labs with a cost estimate, verification and cleanup.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>NSG</dt><dd>Stateful layer 3 and 4 filter of numbered rules, attached to a subnet or NIC.</dd>
<dt>Priority</dt><dd>100 to 4096 for custom rules; lower number is evaluated first.</dd>
<dt>Service tag</dt><dd>Microsoft-maintained group of address prefixes, such as Internet or Storage.</dd>
<dt>ASG</dt><dd>Application security group: NICs grouped by role within a VNet.</dd>
<dt>Effective security rules</dt><dd>The combined rules applied to a NIC.</dd>
<dt>IP flow verify</dt><dd>Network Watcher check that names the rule deciding a 5-tuple.</dd>
<dt>Flow log</dt><dd>Record of connections, stored in a storage account.</dd>
<dt>Azure Firewall</dt><dd>Managed stateful firewall with FQDN filtering, deployed in AzureFirewallSubnet.</dd>
</dl>

<h3>Most tested facts</h3>
<ol>
<li>NSGs are stateful, work at layers 3 and 4, and can attach to a subnet or a NIC.</li>
<li>Priority 100 to 4096; lowest first; first match wins; no duplicates in one direction.</li>
<li>Default rules: 65000 and 65001 allow VNet and load balancer inbound; 65500 DenyAllInBound; outbound allows VNet and Internet then denies the rest.</li>
<li>Inbound: subnet NSG then NIC NSG. Outbound: NIC NSG then subnet NSG.</li>
<li>Service tags are maintained by Microsoft; ASGs group your NICs in one VNet.</li>
<li>Standard public IPs are closed until an NSG allows traffic.</li>
<li>NSG flow logs are being retired in favour of virtual network flow logs (verify dates).</li>
<li>FQDN filtering needs Azure Firewall, not an NSG.</li>
</ol>

<h3>Command cheat-sheet</h3>
<pre class="code">az network nsg create -g rg-nk-lab -n nsg-web
az network nsg rule create -g rg-nk-lab --nsg-name nsg-web -n AllowHttps --priority 100 --direction Inbound --access Allow --protocol Tcp --source-address-prefixes Internet --source-port-ranges "*" --destination-address-prefixes "*" --destination-port-ranges 443
az network nsg rule list -g rg-nk-lab --nsg-name nsg-web -o table
az network vnet subnet update -g rg-nk-lab --vnet-name vnet-nk -n snet-web --network-security-group nsg-web
az network asg create -g rg-nk-lab -n asg-web
az network nic list-effective-nsg -g rg-nk-lab -n &lt;nic-name&gt;
az network watcher test-ip-flow -g rg-nk-lab --vm vm-web --direction Inbound --protocol TCP --local 10.10.1.4:443 --remote 203.0.113.50:50000
az network list-service-tags --location centralindia
az group delete --name rg-nk-lab --yes --no-wait</pre>

<h3>Items to verify before relying on them</h3>
<p>NSG flow log retirement dates and virtual network flow log CLI parameters; ASG same-VNet rules; rule and prefix limits; Azure Firewall subnet size and SKU features; Network Watcher prerequisites; VM image alias and size availability; service tag content; portal menu wording; whether existing connections persist after a rule change.</p>

<div class="warn"><p><b>Common mistake.</b> Treating NSGs as a complete security plan. They are one layer. Combine them with identity controls, patching, private endpoints, logging and a firewall where needed.</p></div>

<div class="exam"><p><b>Exam alignment.</b> AZ-900: NSGs, Azure Firewall overview, defence in depth. AZ-700 foundations: NSG rules and priorities, ASGs, service tags, flow logs, Network Watcher tools, firewall versus NSG. Check the current skills outline.</p></div>

<div class="scn"><h4>The review that caught three problems</h4><p>A security review of an Azure subnet found SSH open to the Internet at priority 100, a NIC NSG that nobody remembered, and a missing allow for the load balancer probe. They removed the SSH rule in favour of Bastion, deleted the NIC NSG, added the probe tag allow, and wrote the rule set as code.</p><p><b>Lesson:</b> list rules in priority order, list both NSG levels, and keep the defaults in mind.</p></div>

<div class="iv"><p class="q">"Design the NSG rules for a three-tier app in one VNet."</p><p>One NSG per subnet or ASGs per role. Web: allow 443 from Internet. App: allow 8080 only from asg-web. Data: allow 1433 only from asg-app. Deny the rest of VirtualNetwork above the default allow. Restrict admin access to Bastion or a known range. Check with IP flow verify and keep flow logs and a firewall for the perimeter.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Priority order, direction and both NSG levels explain most tickets.</li>
<li>ASGs and service tags keep rules short and correct.</li>
<li>IP flow verify and effective security rules are free proof tools.</li>
<li>Use virtual network flow logs for new work; verify dates for NSG flow logs.</li>
<li>Delete lab resource groups: VMs, IPs and firewalls bill hourly.</li>
</ul></div>
`,hi:`
<h3>Ab aap kya kar sakte ho</h3>
<div class="dia">`+e+`<p class="cap">NSG module ek line mein.</p></div>
<ul>
<li>Sahi priority, direction, protocol aur ports ke saath inbound aur outbound NSG rules likho.</li>
<li>Chhe default rules aur unki priorities batao, aur yeh ki woh kya allow karte hain.</li>
<li>Hard-coded IP lists ki jagah service tags aur ASGs use karo.</li>
<li>Subnet aur NIC NSGs ke liye evaluation order predict karo, inbound aur outbound, aur effective security rules padho.</li>
<li>Flow decide karne wale rule ka naam batane ke liye Network Watcher IP flow verify use karo.</li>
<li>Virtual network flow logs ko retire hote NSG flow logs se compare karo (dates verify karo), aur batao kab Azure Firewall chahiye.</li>
<li>Dono guided labs cost estimate, verification aur cleanup ke saath chalao.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>NSG</dt><dd>Numbered rules ka stateful layer 3 aur 4 filter, subnet ya NIC se attached.</dd>
<dt>Priority</dt><dd>Custom rules ke liye 100 se 4096; chhota number pehle evaluate hota hai.</dd>
<dt>Service tag</dt><dd>Address prefixes ka Microsoft-maintained group, jaise Internet ya Storage.</dd>
<dt>ASG</dt><dd>Application security group: ek VNet ke andar role ke hisaab se grouped NICs.</dd>
<dt>Effective security rules</dt><dd>NIC par lagne wale combined rules.</dd>
<dt>IP flow verify</dt><dd>Network Watcher check jo 5-tuple decide karne wale rule ka naam batata hai.</dd>
<dt>Flow log</dt><dd>Connections ka record, storage account mein store.</dd>
<dt>Azure Firewall</dt><dd>FQDN filtering wala managed stateful firewall, AzureFirewallSubnet mein deployed.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<ol>
<li>NSGs stateful hain, layers 3 aur 4 par kaam karte hain, aur subnet ya NIC se attach ho sakte hain.</li>
<li>Priority 100 se 4096; sabse chhota pehle; pehla match jeetta hai; ek direction mein duplicates nahi.</li>
<li>Default rules: 65000 aur 65001 VNet aur load balancer inbound allow karte hain; 65500 DenyAllInBound; outbound VNet aur Internet allow karta hai phir baaki deny.</li>
<li>Inbound: subnet NSG phir NIC NSG. Outbound: NIC NSG phir subnet NSG.</li>
<li>Service tags Microsoft maintain karta hai; ASGs ek VNet mein aapke NICs group karte hain.</li>
<li>Standard public IPs NSG allow karne tak closed hain.</li>
<li>NSG flow logs virtual network flow logs ke favour mein retire ho rahe hain (dates verify karo).</li>
<li>FQDN filtering ko Azure Firewall chahiye, NSG nahi.</li>
</ol>

<h3>Command cheat-sheet</h3>
<pre class="code">az network nsg create -g rg-nk-lab -n nsg-web
az network nsg rule create -g rg-nk-lab --nsg-name nsg-web -n AllowHttps --priority 100 --direction Inbound --access Allow --protocol Tcp --source-address-prefixes Internet --source-port-ranges "*" --destination-address-prefixes "*" --destination-port-ranges 443
az network nsg rule list -g rg-nk-lab --nsg-name nsg-web -o table
az network vnet subnet update -g rg-nk-lab --vnet-name vnet-nk -n snet-web --network-security-group nsg-web
az network asg create -g rg-nk-lab -n asg-web
az network nic list-effective-nsg -g rg-nk-lab -n &lt;nic-name&gt;
az network watcher test-ip-flow -g rg-nk-lab --vm vm-web --direction Inbound --protocol TCP --local 10.10.1.4:443 --remote 203.0.113.50:50000
az network list-service-tags --location centralindia
az group delete --name rg-nk-lab --yes --no-wait</pre>

<h3>Jin items ko rely karne se pehle verify karo</h3>
<p>NSG flow log retirement dates aur virtual network flow log CLI parameters; ASG same-VNet rules; rule aur prefix limits; Azure Firewall subnet size aur SKU features; Network Watcher prerequisites; VM image alias aur size availability; service tag content; portal menu wording; rule change ke baad maujooda connections rehte hain ya nahi.</p>

<div class="warn"><p><b>Common mistake.</b> NSGs ko complete security plan maan lena. Woh ek layer hain. Unhe identity controls, patching, private endpoints, logging aur zaroorat par firewall ke saath jodo.</p></div>

<div class="exam"><p><b>Exam alignment.</b> AZ-900: NSGs, Azure Firewall overview, defence in depth. AZ-700 foundations: NSG rules aur priorities, ASGs, service tags, flow logs, Network Watcher tools, firewall versus NSG. Current skills outline check karo.</p></div>

<div class="scn"><h4>Review jisne teen problems pakdin</h4><p>Azure subnet ke security review ne priority 100 par Internet ke liye open SSH, ek aisa NIC NSG jo kisi ko yaad nahi tha, aur load balancer probe ka missing allow dhundha. Unhone SSH rule hataya aur Bastion lagaya, NIC NSG delete kiya, probe tag ka allow add kiya, aur rule set ko code mein likh diya.</p><p><b>Lesson:</b> rules priority order mein list karo, dono NSG levels list karo, aur defaults dhyan mein rakho.</p></div>

<div class="iv"><p class="q">"Ek VNet mein teen-tier app ke liye NSG rules design karo."</p><p>Har subnet ke liye ek NSG ya role ke hisaab se ASGs. Web: Internet se 443 allow. App: sirf asg-web se 8080 allow. Data: sirf asg-app se 1433 allow. VirtualNetwork ka baaki default allow ke upar deny karo. Admin access Bastion ya known range tak restrict karo. IP flow verify se check karo aur perimeter ke liye flow logs aur firewall rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Priority order, direction aur dono NSG levels zyadatar tickets samjhate hain.</li>
<li>ASGs aur service tags rules ko chhota aur sahi rakhte hain.</li>
<li>IP flow verify aur effective security rules free proof tools hain.</li>
<li>Naye kaam ke liye virtual network flow logs; NSG flow logs ki dates verify karo.</li>
<li>Lab resource groups delete karo: VMs, IPs aur firewalls hourly bill karte hain.</li>
</ul></div>
`}};export{t as default};