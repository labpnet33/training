var e=`<svg viewBox="0 0 640 230" role="img" aria-label="Lab 1 design">
<rect x="10" y="10" width="620" height="210" rx="10" fill="#bae6fd"/><text x="24" y="32" class="svg-ink" font-size="13">vnet-nk 10.10.0.0/16 (Central India) in rg-nk-lab</text>
<rect x="30" y="50" width="180" height="70" rx="6" fill="#bbf7d0"/><text x="120" y="80" text-anchor="middle" class="svg-ink" font-size="12">snet-web 10.10.1.0/24</text><text x="120" y="100" text-anchor="middle" class="svg-muted" font-size="11">route table rt-web</text>
<rect x="230" y="50" width="180" height="70" rx="6" fill="#ddd6fe"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="12">snet-app 10.10.2.0/24</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="11">no route table</text>
<rect x="430" y="50" width="180" height="70" rx="6" fill="#fde68a"/><text x="520" y="80" text-anchor="middle" class="svg-ink" font-size="12">snet-data 10.10.3.0/24</text><text x="520" y="100" text-anchor="middle" class="svg-muted" font-size="11">service endpoint Storage</text>
<rect x="30" y="140" width="580" height="60" rx="6" fill="#e2e8f0"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">Free resources only: VNet, subnets, route table, service endpoint</text><text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Nothing runs, so nothing is billed by the hour</text>
</svg>`,t={id:`guided-lab-vnet-subnets`,h:{en:`Guided lab 1 on your own Azure account: build a VNet with three subnets and a route table`,hi:`Guided lab 1 apne Azure account par: teen subnets aur route table wala VNet`},body:{en:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.nwkings.com. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<h3>Goal</h3>
<p>Build the address plan from this module with real resources: a VNet 10.10.0.0/16, three /24 subnets, a service endpoint, and a route table associated with one subnet. You will confirm the numbers, prove the reserved addresses, and delete everything.</p>

<h3>Prerequisites</h3>
<ul>
<li>The previous module done: budget alert set, <code>az account show</code> works, you know how to delete a resource group.</li>
<li>About 30 minutes.</li>
</ul>

<h3>Honest cost estimate</h3>
<p>Pricing structure: VNets, subnets, route tables and service endpoints are not billed (verify before publishing). No VM, disk or public IP is created, so there is no hourly compute charge. As an assumed example for planning, expect a cost of zero. Confirm in Cost Management after one day.</p>

<div class="dia">`+e+`<p class="cap">Everything in this lab is a free networking object.</p></div>

<h3>Steps</h3>
<p>Portal wording is from experience and may have moved (verify wording).</p>

<h4>Step 1. Resource group</h4>
<p>Portal: Resource groups, Create, <code>rg-nk-lab</code>, Central India, tags purpose=lab.</p>
<pre class="code">az group create --name rg-nk-lab --location centralindia --tags purpose=lab owner=yourname</pre>

<h4>Step 2. VNet with the first subnet</h4>
<p>Portal: Virtual networks, Create, resource group rg-nk-lab, name vnet-nk, Central India, address space 10.10.0.0/16, subnet snet-web 10.10.1.0/24. Change the wizard defaults.</p>
<pre class="code">az network vnet create -g rg-nk-lab -n vnet-nk --location centralindia --address-prefixes 10.10.0.0/16 --subnet-name snet-web --subnet-prefixes 10.10.1.0/24</pre>

<h4>Step 3. Two more subnets</h4>
<p>Portal: open vnet-nk, Subnets, add snet-app 10.10.2.0/24 and snet-data 10.10.3.0/24.</p>
<pre class="code">az network vnet subnet create -g rg-nk-lab --vnet-name vnet-nk -n snet-app --address-prefixes 10.10.2.0/24
az network vnet subnet create -g rg-nk-lab --vnet-name vnet-nk -n snet-data --address-prefixes 10.10.3.0/24 --service-endpoints Microsoft.Storage</pre>

<h4>Step 4. Create a route table and associate it with snet-web</h4>
<p>Portal: Route tables, Create, name rt-web, Central India. Open it, Routes, Add: name block-10-99, prefix 10.99.0.0/16, next hop None. Then Subnets, Associate, choose vnet-nk and snet-web.</p>
<pre class="code">az network route-table create -g rg-nk-lab -n rt-web --location centralindia
az network route-table route create -g rg-nk-lab --route-table-name rt-web -n block-10-99 --address-prefix 10.99.0.0/16 --next-hop-type None
az network vnet subnet update -g rg-nk-lab --vnet-name vnet-nk -n snet-web --route-table rt-web</pre>

<h3>Verification</h3>
<pre class="code">az network vnet subnet list -g rg-nk-lab --vnet-name vnet-nk --query "[].{name:name, prefix:addressPrefix, rt:routeTable.id, ep:serviceEndpoints[0].service}" --output table
az network route-table route list -g rg-nk-lab --route-table-name rt-web --output table
az network vnet check-ip-address -g rg-nk-lab -n vnet-nk --ip-address 10.10.1.3
az network vnet check-ip-address -g rg-nk-lab -n vnet-nk --ip-address 10.10.1.4</pre>
<p>Illustrative output:</p>
<pre class="out">Name       Prefix         Rt                       Ep
---------  -------------  -----------------------  ----------------
snet-web   10.10.1.0/24   <span class="hl">.../routeTables/rt-web</span>
snet-app   10.10.2.0/24
snet-data  10.10.3.0/24                            Microsoft.Storage

{ "available": false }   <span class="c"># .3 is reserved</span>
{ "available": true }    <span class="c"># .4 is the first usable</span></pre>
<p>Add a second prefix and see it appear. This is a safe change because nothing depends on it yet:</p>
<pre class="code">az network vnet update -g rg-nk-lab -n vnet-nk --address-prefixes 10.10.0.0/16 10.11.0.0/16
az network vnet show -g rg-nk-lab -n vnet-nk --query addressSpace.addressPrefixes</pre>
<pre class="out">[ "10.10.0.0/16", <span class="hl">"10.11.0.0/16"</span> ]</pre>
<p>Break-it test: try to create a subnet 10.10.2.64/26. It overlaps snet-app, so Azure rejects it. Then create 10.11.1.0/24 and notice it works because it is in the new prefix.</p>

<h3>Mandatory cleanup</h3>
<pre class="code">az group delete --name rg-nk-lab --yes --no-wait
az group exists --name rg-nk-lab</pre>
<p>Repeat the second command until it prints <code>false</code>. Confirm in Cost Management the next day.</p>

<h3>What bills you: trap list</h3>
<ul>
<li>Nothing in this lab, but the next lab adds a VM and a Standard public IP, which bill hourly (verify before publishing).</li>
<li><b>Service endpoints</b> are free; <b>private endpoints</b> and <b>NAT Gateway</b> are not. Do not confuse them when you experiment.</li>
<li><b>VNet peering</b> (later module) charges for data transferred (verify).</li>
<li><b>Network Watcher</b> tools can create small storage costs when you enable logs (verify).</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Associating a route table with a subnet and expecting it to change only that subnet's VMs. A route table acts on all NICs in the subnet. Test with one VM first when you do this in a shared network.</p></div>

<div class="exam"><p><b>Exam trap.</b> Route tables are associated with subnets, not VNets. A subnet has at most one route table. A route table can be associated with many subnets in the same region and subscription (verify).</p></div>

<div class="scn"><h4>The overlapping prefix</h4><p>A learner added 10.10.0.0/16 and then tried to add 10.10.0.0/20 as a second prefix. Azure refused it because it overlaps the first. He chose 10.20.0.0/16 instead and the VNet accepted it.</p><p><b>Lesson:</b> address prefixes in one VNet cannot overlap each other, just like subnets.</p></div>

<div class="iv"><p class="q">"What can you change in a VNet address space after resources are deployed?"</p><p>You can add prefixes. Removing or changing a prefix that has subnets in it is blocked; you must remove the subnets first. If it is peered, resync peering after the change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The VNet, subnets, route table and service endpoint are free objects.</li>
<li>The first usable address in a subnet is .4; .3 is reserved.</li>
<li>Route tables associate with subnets; a next hop of None drops traffic.</li>
<li>You can add a second address prefix, but not an overlapping one.</li>
<li>Always delete the resource group at the end.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.nwkings.com. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<h3>Goal</h3>
<p>Is module ka address plan asli resources ke saath banao: VNet 10.10.0.0/16, teen /24 subnets, ek service endpoint, aur ek subnet se associated route table. Aap numbers confirm karoge, reserved addresses prove karoge, aur sab delete karoge.</p>

<h3>Prerequisites</h3>
<ul>
<li>Pichla module complete: budget alert set hai, <code>az account show</code> chalta hai, aur resource group delete karna aata hai.</li>
<li>Lagbhag 30 minute.</li>
</ul>

<h3>Honest cost estimate</h3>
<p>Pricing structure: VNets, subnets, route tables aur service endpoints bill nahi hote (verify before publishing). Koi VM, disk ya public IP nahi banta, isliye hourly compute charge nahi. Planning ke liye assumed example ke taur par cost zero expect karo. Ek din baad Cost Management mein confirm karo.</p>

<div class="dia">`+e+`<p class="cap">Is lab ka sab kuch free networking object hai.</p></div>

<h3>Steps</h3>
<p>Portal wording experience se hai aur hil sakti hai (verify wording).</p>

<h4>Step 1. Resource group</h4>
<p>Portal: Resource groups, Create, <code>rg-nk-lab</code>, Central India, tags purpose=lab.</p>
<pre class="code">az group create --name rg-nk-lab --location centralindia --tags purpose=lab owner=yourname</pre>

<h4>Step 2. Pehle subnet ke saath VNet</h4>
<p>Portal: Virtual networks, Create, resource group rg-nk-lab, naam vnet-nk, Central India, address space 10.10.0.0/16, subnet snet-web 10.10.1.0/24. Wizard defaults badlo.</p>
<pre class="code">az network vnet create -g rg-nk-lab -n vnet-nk --location centralindia --address-prefixes 10.10.0.0/16 --subnet-name snet-web --subnet-prefixes 10.10.1.0/24</pre>

<h4>Step 3. Do aur subnets</h4>
<p>Portal: vnet-nk kholo, Subnets, snet-app 10.10.2.0/24 aur snet-data 10.10.3.0/24 add karo.</p>
<pre class="code">az network vnet subnet create -g rg-nk-lab --vnet-name vnet-nk -n snet-app --address-prefixes 10.10.2.0/24
az network vnet subnet create -g rg-nk-lab --vnet-name vnet-nk -n snet-data --address-prefixes 10.10.3.0/24 --service-endpoints Microsoft.Storage</pre>

<h4>Step 4. Route table banao aur snet-web se associate karo</h4>
<p>Portal: Route tables, Create, naam rt-web, Central India. Use kholo, Routes, Add: naam block-10-99, prefix 10.99.0.0/16, next hop None. Phir Subnets, Associate, vnet-nk aur snet-web chuno.</p>
<pre class="code">az network route-table create -g rg-nk-lab -n rt-web --location centralindia
az network route-table route create -g rg-nk-lab --route-table-name rt-web -n block-10-99 --address-prefix 10.99.0.0/16 --next-hop-type None
az network vnet subnet update -g rg-nk-lab --vnet-name vnet-nk -n snet-web --route-table rt-web</pre>

<h3>Verification</h3>
<pre class="code">az network vnet subnet list -g rg-nk-lab --vnet-name vnet-nk --query "[].{name:name, prefix:addressPrefix, rt:routeTable.id, ep:serviceEndpoints[0].service}" --output table
az network route-table route list -g rg-nk-lab --route-table-name rt-web --output table
az network vnet check-ip-address -g rg-nk-lab -n vnet-nk --ip-address 10.10.1.3
az network vnet check-ip-address -g rg-nk-lab -n vnet-nk --ip-address 10.10.1.4</pre>
<p>Illustrative output:</p>
<pre class="out">Name       Prefix         Rt                       Ep
---------  -------------  -----------------------  ----------------
snet-web   10.10.1.0/24   <span class="hl">.../routeTables/rt-web</span>
snet-app   10.10.2.0/24
snet-data  10.10.3.0/24                            Microsoft.Storage

{ "available": false }   <span class="c"># .3 reserved hai</span>
{ "available": true }    <span class="c"># .4 pehla usable hai</span></pre>
<p>Doosra prefix add karo aur dekho woh aa jata hai. Yeh safe change hai kyunki abhi us par kuch depend nahi karta:</p>
<pre class="code">az network vnet update -g rg-nk-lab -n vnet-nk --address-prefixes 10.10.0.0/16 10.11.0.0/16
az network vnet show -g rg-nk-lab -n vnet-nk --query addressSpace.addressPrefixes</pre>
<pre class="out">[ "10.10.0.0/16", <span class="hl">"10.11.0.0/16"</span> ]</pre>
<p>Break-it test: subnet 10.10.2.64/26 banane ki koshish karo. Woh snet-app se overlap karta hai, isliye Azure reject karta hai. Phir 10.11.1.0/24 banao aur dekho chalta hai kyunki woh naye prefix mein hai.</p>

<h3>Mandatory cleanup</h3>
<pre class="code">az group delete --name rg-nk-lab --yes --no-wait
az group exists --name rg-nk-lab</pre>
<p>Doosri command tab tak repeat karo jab tak <code>false</code> print na ho. Agle din Cost Management mein confirm karo.</p>

<h3>Kya bill karta hai: trap list</h3>
<ul>
<li>Is lab mein kuch nahi, lekin agla lab VM aur Standard public IP add karta hai jo hourly bill karte hain (verify before publishing).</li>
<li><b>Service endpoints</b> free hain; <b>private endpoints</b> aur <b>NAT Gateway</b> nahi. Experiment karte waqt inhe mix mat karo.</li>
<li><b>VNet peering</b> (baad ka module) data transfer par charge karta hai (verify).</li>
<li><b>Network Watcher</b> tools logs enable karne par chhote storage costs bana sakte hain (verify).</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Subnet se route table associate karke yeh umeed karna ki sirf us subnet ke kuch VMs par asar padega. Route table subnet ke saare NICs par kaam karta hai. Shared network mein yeh karte waqt pehle ek VM se test karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Route tables subnets se associate hote hain, VNets se nahi. Ek subnet ka maximum ek route table hota hai. Ek route table same region aur subscription ke kai subnets se associate ho sakta hai (verify).</p></div>

<div class="scn"><h4>Overlapping prefix</h4><p>Ek learner ne 10.10.0.0/16 add kiya aur phir doosre prefix ke roop mein 10.10.0.0/20 add karne ki koshish ki. Azure ne refuse kiya kyunki woh pehle se overlap karta hai. Usne 10.20.0.0/16 chuna aur VNet ne accept kiya.</p><p><b>Lesson:</b> ek VNet ke address prefixes ek doosre se overlap nahi kar sakte, bilkul subnets ki tarah.</p></div>

<div class="iv"><p class="q">"Resources deploy hone ke baad VNet address space mein kya badal sakte ho?"</p><p>Prefixes add kar sakte ho. Jis prefix mein subnets hain use hatana ya badalna blocked hai; pehle subnets hatane padte hain. Agar peered hai to change ke baad peering resync karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VNet, subnets, route table aur service endpoint free objects hain.</li>
<li>Subnet ka pehla usable address .4 hai; .3 reserved hai.</li>
<li>Route tables subnets se associate hote hain; next hop None traffic drop karta hai.</li>
<li>Doosra address prefix add kar sakte ho, overlapping nahi.</li>
<li>End mein hamesha resource group delete karo.</li>
</ul></div>
`}};export{t as default};