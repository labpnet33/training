var e=`<svg viewBox="0 0 640 240" role="img" aria-label="Guided lab 2 layout: Azure Firewall in AzureFirewallSubnet 10.0.1.0/26 with spoke routes pointing at 10.0.1.4">
<rect x="230" y="30" width="180" height="150" rx="12" fill="#ddd6fe" stroke="#64748b"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="13">hub-vnet 10.0.0.0/16</text>
<rect x="250" y="70" width="140" height="56" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="12">fw-hub (Standard)</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="11">AzureFirewallSubnet 10.0.1.0/26</text>
<text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="11">policy fwp-hub: 1 network rule</text>
<rect x="15" y="70" width="150" height="70" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="90" y="96" text-anchor="middle" class="svg-ink" font-size="13">spoke1 vm-s1</text><text x="90" y="116" text-anchor="middle" class="svg-muted" font-size="11">0/0 and 10.2/16 to FW</text>
<rect x="475" y="70" width="150" height="70" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="550" y="96" text-anchor="middle" class="svg-ink" font-size="13">spoke2 vm-s2</text><text x="550" y="116" text-anchor="middle" class="svg-muted" font-size="11">10.1/16 to FW</text>
<g stroke="#2563eb" stroke-width="2.5"><line x1="165" y1="105" x2="250" y2="100"/><line x1="390" y1="100" x2="475" y2="105"/></g>
<text x="320" y="215" text-anchor="middle" class="svg-ink" font-size="12">The firewall meter runs every hour it exists: delete the same day</text>
</svg>`,t={id:`guided-lab-firewall`,h:{en:`Guided lab on your own Azure account: Azure Firewall in the hub`,hi:`Apne Azure account par guided lab: hub mein Azure Firewall`},body:{en:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.nwkings.com. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<div class="warn"><p><b>EXPENSIVE LAB. Read before you start.</b> Azure Firewall bills <b>every hour it exists</b>, even with no traffic, and takes several minutes to deploy. Do this lab <b>only on a free-credit account</b> or a subscription where you accept the cost, finish <b>the same day</b>, and <b>delete the resource group</b> at the end. Do not leave it overnight.</p></div>

<h3>Goal</h3>
<p>Replace the router VM of the previous lab with a real <b>Azure Firewall</b>: deploy it with a Firewall Policy, point the spoke routes at its private IP, allow spoke1 to spoke2 with a network rule, and prove that the rule (and nothing else) makes the traffic flow.</p>
<div class="dia">`+e+`<p class="cap">What you will build. Region: centralindia. Addresses are the same as in the previous lab.</p></div>

<h3>Prerequisites</h3>
<ul>
<li>A subscription with free credits or an approved budget; Azure CLI or Cloud Shell. If the firewall CLI commands are not found, run <code>az extension add -n azure-firewall</code> (verify before publishing).</li>
<li>The setup from the previous lab: resource group, three VNets, three VMs and four peerings (its Steps 1 to 3). If you already deleted them, repeat those steps now; you can skip the router configuration and the first test.</li>
<li>About 90 minutes.</li>
</ul>
<div class="note"><p><b>Portal wording</b> was written from familiarity and <b>not re-verified</b> against the current portal; CLI parameters should be confirmed with <code>--help</code> (verify before publishing).</p></div>

<h3>Honest cost</h3>
<p>How you are billed (read the current Azure Firewall pricing page first): a <b>deployment fee per hour</b> that depends on the SKU, plus a <b>charge per GB processed</b>, plus the hourly cost of the Standard public IP. The previous lab's VMs and disks also keep billing. <b>Every number here is ASSUMED for illustration</b>: <b>assumed</b> $1.25 per firewall-hour (Standard), <b>assumed</b> $0.02 per GB processed, <b>assumed</b> $0.005 per public-IP-hour (verify before publishing).</p>
<div class="eg"><p><b>Worked example (assumed rates).</b> Firewall up for 3 hours: 3 x $1.25 = <b>$3.75</b>. Public IP: 3 x $0.005 = about $0.02. A few MB of tests: about $0. VMs from lab 1 for the same time: about $0.20. Total about <b>$4</b>.</p></div>
<div class="warn"><p><b>Loud warning.</b> With the same assumed rate, a forgotten firewall costs 24 x $1.25 = <b>$30 per day</b> and about 730 x $1.25 = <b>$912 per month</b>. A Premium SKU costs more. Set a phone reminder for the cleanup now.</p></div>

<h3>Step 0: budget alert</h3>
<p>If you did not set one in the previous lab, do it now (Cost Management, Budgets, Add; small amount, alert at 80 percent). Alerts lag; they are a safety net only.</p>

<h3>Step 1: the AzureFirewallSubnet</h3>
<p><b>Portal:</b> hub-vnet, Subnets, Add, name exactly <code>AzureFirewallSubnet</code>, range 10.0.1.0/26.</p>
<pre class="code">az network vnet subnet create -g rg-nk-hub --vnet-name hub-vnet -n AzureFirewallSubnet --address-prefixes 10.0.1.0/26</pre>

<h3>Step 2: public IP and Firewall Policy</h3>
<p><b>Portal:</b> Public IP addresses, Create (Standard, Static). Firewall Policies, Create, tier Standard, region Central India, name <code>fwp-hub</code>.</p>
<pre class="code">az network public-ip create -g rg-nk-hub -n pip-fw --sku Standard --allocation-method Static -l centralindia
az network firewall policy create -g rg-nk-hub -n fwp-hub --sku Standard -l centralindia</pre>

<h3>Step 3: one network rule, spoke1 to spoke2</h3>
<p><b>Portal:</b> the policy, Rules, Network rules, Add a rule collection: name allow-s1-s2, priority 1000, action Allow, rule: source 10.1.0.0/16, destination 10.2.0.0/16, protocols ICMP and TCP, ports *.</p>
<pre class="code">az network firewall policy rule-collection-group create -g rg-nk-hub --policy-name fwp-hub -n rcg-net --priority 200
az network firewall policy rule-collection-group collection add-filter-collection -g rg-nk-hub --policy-name fwp-hub --rule-collection-group-name rcg-net --name allow-s1-s2 --collection-priority 1000 --action Allow --rule-name s1-to-s2 --rule-type NetworkRule --ip-protocols ICMP TCP --source-addresses 10.1.0.0/16 --destination-addresses 10.2.0.0/16 --destination-ports "*"</pre>
<p>Only spoke1 to spoke2 is allowed. Spoke2 to spoke1 is <b>not</b>, so only spoke1 can start the conversation; replies are allowed automatically because the firewall is stateful.</p>

<h3>Step 4: deploy the firewall</h3>
<p><b>Portal:</b> Firewalls, Create: SKU type Standard, policy fwp-hub, choose hub-vnet, public IP pip-fw. This takes several minutes.</p>
<pre class="code">az network firewall create -g rg-nk-hub -n fw-hub --sku AZFW_VNet --tier Standard --firewall-policy fwp-hub -l centralindia
az network firewall ip-config create -g rg-nk-hub -f fw-hub -n ipconf --public-ip-address pip-fw --vnet-name hub-vnet
FWIP=$(az network firewall show -g rg-nk-hub -n fw-hub --query "ipConfigurations[0].privateIPAddress" -o tsv); echo $FWIP</pre>
<p><b>Check:</b> provisioning state Succeeded and a private IP, normally 10.0.1.4.</p>

<h3>Step 5: point the spokes at the firewall</h3>
<p><b>Portal:</b> each route table, Routes, edit the route: next hop address becomes the firewall private IP. Both tables.</p>
<pre class="code">az network route-table route update -g rg-nk-hub --route-table-name rt-spoke1 -n to-spoke2 --next-hop-ip-address $FWIP
az network route-table route update -g rg-nk-hub --route-table-name rt-spoke2 -n to-spoke1 --next-hop-ip-address $FWIP</pre>
<p>If you rebuilt the lab from scratch, create the two route tables as in Step 6 of the previous lab, but with next hop <code>$FWIP</code>.</p>

<h3>Step 6: verify</h3>
<pre class="code">az network watcher show-next-hop -g rg-nk-hub --vm vm-s1 --source-ip 10.1.1.4 --dest-ip 10.2.1.4
az vm run-command invoke -g rg-nk-hub -n vm-s1 --command-id RunShellScript --scripts "ping -c 3 -W 2 10.2.1.4"
az vm run-command invoke -g rg-nk-hub -n vm-s2 --command-id RunShellScript --scripts "ping -c 3 -W 2 10.1.1.4"</pre>
<pre class="out"><span class="c">Illustrative output</span>
nextHopType: <span class="hl">VirtualAppliance</span>   nextHopIpAddress: 10.0.1.4
vm-s1 to 10.2.1.4: 3 packets transmitted, <span class="hl">3 received</span>
vm-s2 to 10.1.1.4: 3 packets transmitted, <span class="hl">0 received, 100% packet loss</span></pre>
<p>The first works because the rule allows spoke1 to spoke2. The second is denied by the firewall's default deny, which proves it is really in the path. Now change the collection action to Deny (or delete the rule) and repeat the first ping to see it stop. If logs are on, you will see the allow and the deny (the log setup comes in the Network Watcher module).</p>

<h3>MANDATORY CLEANUP</h3>
<pre class="code">az group delete -n rg-nk-hub --yes --no-wait
az group exists -n rg-nk-hub <span class="c"># repeat until it prints false</span></pre>
<p>This removes the firewall, policy, public IP, VMs, disks and VNets together. A firewall delete can take minutes; <b>confirm</b> in the portal and check Cost analysis the next day. Do not rely on stopping VMs.</p>

<h3>What bills you: the trap list</h3>
<ul>
<li>The firewall deployment, every hour, with zero traffic.</li>
<li>Data processed through the firewall, per GB.</li>
<li>The Standard public IP, hourly, and any extra IPs.</li>
<li>Log Analytics ingestion, if you turn on firewall diagnostics (per GB ingested).</li>
<li>The VMs and disks from the previous lab, until the resource group is deleted.</li>
<li>Premium SKU or forced-tunnelling management IPs if you choose them.</li>
</ul>

<div class="scn"><h4>The $900 weekend</h4><p>A trainee deployed an Azure Firewall for a demo on Friday, showed it to the team, and closed the laptop. Nobody noticed until the monthly invoice: the firewall had run for three weeks before it was found. The company set a subscription budget with alerts and a policy that tags every lab resource group with an owner and an expiry date.</p><p><b>Lesson:</b> expensive resources need an owner, an expiry date and a budget alert before they exist.</p></div>

<div class="iv"><p class="q">"How do you keep the cost of firewall labs under control?"</p><p>Free-credit or sandbox subscription, a budget alert first, one resource group per lab with an expiry tag, same-day deletion and verification that the group is gone. Mention that the firewall bills per hour whether or not traffic flows.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Azure Firewall needs AzureFirewallSubnet (/26) and a Standard public IP.</li>
<li>Rules live in the policy; the firewall's private IP is the UDR next hop.</li>
<li>A stateful firewall allows replies automatically; a missing rule in the other direction blocks new flows.</li>
<li>Prove behaviour with next hop and ping from both sides.</li>
<li>Delete the resource group the same day and confirm.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.nwkings.com. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<div class="warn"><p><b>MEHENGA LAB. Shuru karne se pehle padho.</b> Azure Firewall <b>jitni der exist karta hai har ghante</b> bill karta hai, traffic na ho tab bhi, aur deploy hone mein kai minute lagte hain. Yeh lab <b>sirf free-credit account</b> par karo ya aisi subscription par jahan aap cost accept karte ho, <b>usi din</b> khatam karo, aur aakhir mein <b>resource group delete</b> karo. Raat bhar mat chhodo.</p></div>

<h3>Goal</h3>
<p>Pichhle lab ki router VM ki jagah asli <b>Azure Firewall</b> lagao: Firewall Policy ke saath deploy karo, spoke routes ko uske private IP par point karo, network rule se spoke1 se spoke2 allow karo, aur saabit karo ki wahi rule (aur kuch nahi) traffic chalata hai.</p>
<div class="dia">`+e+`<p class="cap">Aap kya banaoge. Region: centralindia. Addresses pichhle lab jaise hi hain.</p></div>

<h3>Prerequisites</h3>
<ul>
<li>Free credits wali ya approved budget wali subscription; Azure CLI ya Cloud Shell. Firewall CLI commands na milein to <code>az extension add -n azure-firewall</code> chalao (publish se pehle verify karo).</li>
<li>Pichhle lab ka setup: resource group, teen VNets, teen VMs aur chaar peerings (uske Steps 1 se 3). Agar delete kar chuke ho to ab wohi steps dohrao; router configuration aur pehla test skip kar sakte ho.</li>
<li>Lagbhag 90 minute.</li>
</ul>
<div class="note"><p><b>Portal wording</b> jaankari se likhi gayi hai aur current portal se <b>re-verify nahi</b> hui; CLI parameters <code>--help</code> se confirm karo (verify before publishing).</p></div>

<h3>Imaandar cost</h3>
<p>Billing kaise hoti hai (pehle current Azure Firewall pricing page padho): SKU par depend karne wali <b>per hour deployment fee</b>, plus <b>per GB processed charge</b>, plus Standard public IP ka hourly cost. Pichhle lab ki VMs aur disks bhi bill karti rehti hain. <b>Yahan ka har number samjhane ke liye ASSUMED hai</b>: <b>assumed</b> $1.25 per firewall-hour (Standard), <b>assumed</b> $0.02 per GB processed, <b>assumed</b> $0.005 per public-IP-hour (verify before publishing).</p>
<div class="eg"><p><b>Worked example (assumed rates).</b> Firewall 3 ghante up: 3 x $1.25 = <b>$3.75</b>. Public IP: 3 x $0.005 = lagbhag $0.02. Kuch MB tests: lagbhag $0. Lab 1 ki VMs usi time ke liye: lagbhag $0.20. Total lagbhag <b>$4</b>.</p></div>
<div class="warn"><p><b>Loud warning.</b> Usi assumed rate par bhoola hua firewall 24 x $1.25 = <b>$30 per day</b> aur lagbhag 730 x $1.25 = <b>$912 per month</b> padta hai. Premium SKU aur mehenga hai. Abhi phone par cleanup ka reminder laga lo.</p></div>

<h3>Step 0: budget alert</h3>
<p>Pichhle lab mein nahi lagaya to ab lagao (Cost Management, Budgets, Add; chhoti amount, 80 percent par alert). Alerts peeche chalte hain; sirf safety net hain.</p>

<h3>Step 1: AzureFirewallSubnet</h3>
<p><b>Portal:</b> hub-vnet, Subnets, Add, naam bilkul <code>AzureFirewallSubnet</code>, range 10.0.1.0/26.</p>
<pre class="code">az network vnet subnet create -g rg-nk-hub --vnet-name hub-vnet -n AzureFirewallSubnet --address-prefixes 10.0.1.0/26</pre>

<h3>Step 2: public IP aur Firewall Policy</h3>
<p><b>Portal:</b> Public IP addresses, Create (Standard, Static). Firewall Policies, Create, tier Standard, region Central India, naam <code>fwp-hub</code>.</p>
<pre class="code">az network public-ip create -g rg-nk-hub -n pip-fw --sku Standard --allocation-method Static -l centralindia
az network firewall policy create -g rg-nk-hub -n fwp-hub --sku Standard -l centralindia</pre>

<h3>Step 3: ek network rule, spoke1 se spoke2</h3>
<p><b>Portal:</b> policy, Rules, Network rules, Add a rule collection: naam allow-s1-s2, priority 1000, action Allow, rule: source 10.1.0.0/16, destination 10.2.0.0/16, protocols ICMP aur TCP, ports *.</p>
<pre class="code">az network firewall policy rule-collection-group create -g rg-nk-hub --policy-name fwp-hub -n rcg-net --priority 200
az network firewall policy rule-collection-group collection add-filter-collection -g rg-nk-hub --policy-name fwp-hub --rule-collection-group-name rcg-net --name allow-s1-s2 --collection-priority 1000 --action Allow --rule-name s1-to-s2 --rule-type NetworkRule --ip-protocols ICMP TCP --source-addresses 10.1.0.0/16 --destination-addresses 10.2.0.0/16 --destination-ports "*"</pre>
<p>Sirf spoke1 se spoke2 allowed hai. Spoke2 se spoke1 <b>nahi</b>, isliye conversation sirf spoke1 shuru kar sakta hai; replies apne aap allow ho jaate hain kyunki firewall stateful hai.</p>

<h3>Step 4: firewall deploy karo</h3>
<p><b>Portal:</b> Firewalls, Create: SKU type Standard, policy fwp-hub, hub-vnet chuno, public IP pip-fw. Isme kai minute lagte hain.</p>
<pre class="code">az network firewall create -g rg-nk-hub -n fw-hub --sku AZFW_VNet --tier Standard --firewall-policy fwp-hub -l centralindia
az network firewall ip-config create -g rg-nk-hub -f fw-hub -n ipconf --public-ip-address pip-fw --vnet-name hub-vnet
FWIP=$(az network firewall show -g rg-nk-hub -n fw-hub --query "ipConfigurations[0].privateIPAddress" -o tsv); echo $FWIP</pre>
<p><b>Check:</b> provisioning state Succeeded aur private IP, aam taur par 10.0.1.4.</p>

<h3>Step 5: spokes ko firewall par point karo</h3>
<p><b>Portal:</b> har route table, Routes, route edit karo: next hop address firewall ka private IP ban jaata hai. Dono tables.</p>
<pre class="code">az network route-table route update -g rg-nk-hub --route-table-name rt-spoke1 -n to-spoke2 --next-hop-ip-address $FWIP
az network route-table route update -g rg-nk-hub --route-table-name rt-spoke2 -n to-spoke1 --next-hop-ip-address $FWIP</pre>
<p>Agar lab scratch se rebuild kiya hai to do route tables pichhle lab ke Step 6 jaise banao, par next hop <code>$FWIP</code> ke saath.</p>

<h3>Step 6: verify</h3>
<pre class="code">az network watcher show-next-hop -g rg-nk-hub --vm vm-s1 --source-ip 10.1.1.4 --dest-ip 10.2.1.4
az vm run-command invoke -g rg-nk-hub -n vm-s1 --command-id RunShellScript --scripts "ping -c 3 -W 2 10.2.1.4"
az vm run-command invoke -g rg-nk-hub -n vm-s2 --command-id RunShellScript --scripts "ping -c 3 -W 2 10.1.1.4"</pre>
<pre class="out"><span class="c">Illustrative output</span>
nextHopType: <span class="hl">VirtualAppliance</span>   nextHopIpAddress: 10.0.1.4
vm-s1 to 10.2.1.4: 3 packets transmitted, <span class="hl">3 received</span>
vm-s2 to 10.1.1.4: 3 packets transmitted, <span class="hl">0 received, 100% packet loss</span></pre>
<p>Pehla chalta hai kyunki rule spoke1 se spoke2 allow karta hai. Doosra firewall ke default deny se block hota hai, jo saabit karta hai ki firewall sach mein path mein hai. Ab collection action Deny kar do (ya rule delete karo) aur pehla ping dohrao, woh ruk jaayega. Logs on hon to allow aur deny dono dikhenge (log setup Network Watcher module mein aata hai).</p>

<h3>MANDATORY CLEANUP</h3>
<pre class="code">az group delete -n rg-nk-hub --yes --no-wait
az group exists -n rg-nk-hub <span class="c"># tab tak dohrao jab tak false print na ho</span></pre>
<p>Isse firewall, policy, public IP, VMs, disks aur VNets ek saath hat jaate hain. Firewall delete mein minute lag sakte hain; portal mein <b>confirm</b> karo aur agle din Cost analysis dekho. VMs stop karne par bharosa mat karo.</p>

<h3>What bills you: trap list</h3>
<ul>
<li>Firewall deployment, har ghante, zero traffic ke saath bhi.</li>
<li>Firewall se guzra data, per GB.</li>
<li>Standard public IP, hourly, aur koi extra IPs.</li>
<li>Log Analytics ingestion, agar firewall diagnostics on karte ho (per GB ingested).</li>
<li>Pichhle lab ki VMs aur disks, jab tak resource group delete na ho.</li>
<li>Premium SKU ya forced-tunnelling management IPs agar aap unhe chunte ho.</li>
</ul>

<div class="scn"><h4>$900 ka weekend</h4><p>Ek trainee ne Friday ko demo ke liye Azure Firewall deploy kiya, team ko dikhaya, aur laptop band kar diya. Monthly invoice tak kisi ne notice nahi kiya: firewall teen hafte chalta raha tab pakda gaya. Company ne subscription budget alerts ke saath lagaya aur ek policy ki jo har lab resource group par owner aur expiry date ka tag lagwati hai.</p><p><b>Lesson:</b> mehenge resources ko exist karne se pehle owner, expiry date aur budget alert chahiye.</p></div>

<div class="iv"><p class="q">"Firewall labs ka cost control mein kaise rakhte ho?"</p><p>Free-credit ya sandbox subscription, pehle budget alert, har lab ke liye ek resource group expiry tag ke saath, usi din deletion, aur verify karna ki group gaya. Bolo ki firewall traffic ho ya na ho per hour bill karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Azure Firewall ko AzureFirewallSubnet (/26) aur Standard public IP chahiye.</li>
<li>Rules policy mein rehte hain; firewall ka private IP UDR next hop hai.</li>
<li>Stateful firewall replies apne aap allow karta hai; doosri direction ka rule na ho to naye flows block hote hain.</li>
<li>Behaviour dono sides se next hop aur ping se saabit karo.</li>
<li>Resource group usi din delete karo aur confirm karo.</li>
</ul></div>
`}};export{t as default};