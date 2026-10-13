var e=`<svg viewBox="0 0 640 220" role="img" aria-label="Lab 2 target design">
<rect x="10" y="10" width="620" height="200" rx="10" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/><text x="24" y="30" class="svg-accent" font-size="13">rg-nk-lab (Central India)</text>
<rect x="30" y="45" width="580" height="150" rx="8" fill="#bae6fd"/><text x="44" y="65" class="svg-ink" font-size="13">vnet-nk 10.10.0.0/16</text>
<rect x="50" y="80" width="250" height="95" rx="6" fill="#bbf7d0"/><text x="175" y="110" text-anchor="middle" class="svg-ink" font-size="13">snet-web 10.10.1.0/24</text><text x="175" y="130" text-anchor="middle" class="svg-muted" font-size="12">251 usable (5 reserved)</text><text x="175" y="150" text-anchor="middle" class="svg-muted" font-size="12">first usable: 10.10.1.4</text>
<rect x="340" y="80" width="250" height="95" rx="6" fill="#ddd6fe"/><text x="465" y="110" text-anchor="middle" class="svg-ink" font-size="13">snet-app 10.10.2.0/24</text><text x="465" y="130" text-anchor="middle" class="svg-muted" font-size="12">251 usable (5 reserved)</text><text x="465" y="150" text-anchor="middle" class="svg-muted" font-size="12">first usable: 10.10.2.4</text>
</svg>`,t={id:`guided-lab-first-vnet`,h:{en:`Guided lab 2 on your own Azure account: your first virtual network with two subnets`,hi:`Guided lab 2 apne Azure account par: do subnets wala pehla virtual network`},body:{en:`
<h3>Goal</h3>
<p>Build a resource group, a VNet with the address space 10.10.0.0/16 and two subnets, check the numbers, and then delete everything. You create no virtual machine, so the lab is close to free.</p>

<h3>Prerequisites</h3>
<ul>
<li>Lab 1 finished: budget set, <code>az account show</code> works.</li>
<li>About 20 minutes.</li>
</ul>

<h3>Honest cost estimate</h3>
<p>Pricing structure: resource groups, VNets and subnets have no hourly charge (verify before publishing). Data transfer inside a VNet is not charged here because nothing runs. Charges start when you add VMs, Standard public IPs, NAT, Bastion or gateways, none of which are in this lab. As an assumed example for planning, the total should be zero; confirm in Cost Management the next day.</p>

<div class="dia">`+e+`<p class="cap">Target design: one VNet, two /24 subnets, nothing else.</p></div>

<h3>Steps</h3>

<h4>Step 1. Create the resource group</h4>
<p>Portal: Resource groups, Create, name <code>rg-nk-lab</code>, region Central India, tags purpose=lab (verify wording).</p>
<pre class="code">az group create --name rg-nk-lab --location centralindia --tags purpose=lab owner=yourname</pre>

<h4>Step 2. Create the VNet with the first subnet</h4>
<p>Portal: search <b>Virtual networks</b>, Create. On Basics choose the resource group, name <code>vnet-nk</code>, region Central India. On IP addresses set the address space 10.10.0.0/16 and a subnet named <code>snet-web</code> with range 10.10.1.0/24 (verify wording; the portal may suggest a default 10.0.0.0/16, so change it).</p>
<pre class="code">az network vnet create \\
  --resource-group rg-nk-lab \\
  --name vnet-nk \\
  --location centralindia \\
  --address-prefixes 10.10.0.0/16 \\
  --subnet-name snet-web \\
  --subnet-prefixes 10.10.1.0/24</pre>

<h4>Step 3. Add the second subnet</h4>
<p>Portal: open <code>vnet-nk</code>, choose Subnets, then add a subnet <code>snet-app</code> with 10.10.2.0/24 (verify wording).</p>
<pre class="code">az network vnet subnet create \\
  --resource-group rg-nk-lab \\
  --vnet-name vnet-nk \\
  --name snet-app \\
  --address-prefixes 10.10.2.0/24</pre>

<h3>Verification</h3>
<pre class="code">az network vnet show --resource-group rg-nk-lab --name vnet-nk --query "{space:addressSpace.addressPrefixes, state:provisioningState}"
az network vnet subnet list --resource-group rg-nk-lab --vnet-name vnet-nk --query "[].{name:name, prefix:addressPrefix}" --output table</pre>
<p>Illustrative output:</p>
<pre class="out">Name      Prefix
--------  -------------
snet-web  <span class="hl">10.10.1.0/24</span>
snet-app  <span class="hl">10.10.2.0/24</span></pre>
<p>Now test the address rules. Ask Azure whether an address is valid and free inside the VNet:</p>
<pre class="code">az network vnet check-ip-address --resource-group rg-nk-lab --name vnet-nk --ip-address 10.10.1.4
az network vnet check-ip-address --resource-group rg-nk-lab --name vnet-nk --ip-address 10.10.1.2</pre>
<p>Illustrative output (field names may differ by version, so read the "available" field):</p>
<pre class="out">{ "available": <span class="hl">true</span> }          <span class="c"># 10.10.1.4: first usable address</span>
{ "available": <span class="hl">false</span> }         <span class="c"># 10.10.1.2: reserved by Azure (DNS mapping)</span></pre>
<p>This shows the five reserved addresses of the subnet: .0 network, .1 default gateway, .2 and .3 Azure DNS mapping, and .255 broadcast. The first address you can assign is .4.</p>
<p>Optional break-it test: try to add a third subnet that overlaps, for example 10.10.1.128/25. Azure rejects it because it overlaps snet-web. Read the error; it names the overlap.</p>

<h3>Mandatory cleanup</h3>
<pre class="code">az group delete --name rg-nk-lab --yes --no-wait
az group exists --name rg-nk-lab</pre>
<p>Wait until it prints <code>false</code>. Then check Cost Management tomorrow.</p>

<h3>What bills you: trap list</h3>
<ul>
<li>Nothing in this lab bills by the hour, but people often add a VM "just to test" and forget it.</li>
<li><b>VM disks</b> bill even when the VM is stopped (deallocated VMs stop compute charges, not disk charges; verify before publishing).</li>
<li><b>Standard public IPs</b> bill hourly whether or not they are attached (verify before publishing).</li>
<li><b>Bastion, NAT Gateway, VPN gateway and Azure Firewall</b> bill hourly plus data. Treat them as expensive in a personal lab.</li>
<li><b>Resources in another resource group</b> are not deleted when you delete this one. Check the list.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Using the portal defaults without reading them. The wizard can create a VNet with a default subnet and default 10.0.0.0/16. Always read the address fields.</p></div>

<div class="exam"><p><b>Exam trap.</b> Azure reserves five addresses per subnet: network address, default gateway, two for Azure DNS mapping, and broadcast. A /24 subnet gives 251 usable addresses, a /29 gives 3.</p></div>

<div class="scn"><h4>The subnet that was too small</h4><p>A learner made a /29 subnet for Bastion practice and Azure refused the deployment: Bastion needs a subnet named AzureBastionSubnet of at least a certain size (verify the current minimum). He deleted the subnet, created a larger one with the exact required name and the deployment worked.</p><p><b>Lesson:</b> special Azure services have naming and size rules. Plan gaps in the address space.</p></div>

<div class="iv"><p class="q">"How many usable IPs are in a /24 subnet in Azure and why?"</p><p>251. A /24 has 256 addresses and Azure reserves 5: network, default gateway, two for Azure DNS, and broadcast. Add that the smallest subnet is /29, giving 3 usable.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VNet has an address space; subnets are carved from it and cannot overlap.</li>
<li>az network vnet create can make the first subnet in one command.</li>
<li>The first usable address in a subnet is .4.</li>
<li>Delete the resource group and confirm with az group exists.</li>
<li>The cost risks are what you add later: VMs, disks, IPs, gateways.</li>
</ul></div>
`,hi:`
<h3>Goal</h3>
<p>Resource group banao, address space 10.10.0.0/16 wala VNet aur do subnets banao, numbers check karo, aur phir sab delete karo. Aap koi virtual machine nahi banate, isliye lab lagbhag free hai.</p>

<h3>Prerequisites</h3>
<ul>
<li>Lab 1 complete: budget set hai, <code>az account show</code> chalta hai.</li>
<li>Lagbhag 20 minute.</li>
</ul>

<h3>Honest cost estimate</h3>
<p>Pricing structure: resource groups, VNets aur subnets par hourly charge nahi hota (verify before publishing). VNet ke andar data transfer yahan charge nahi hota kyunki kuch chal nahi raha. Charges tab shuru hote hain jab aap VMs, Standard public IPs, NAT, Bastion ya gateways add karte ho, jo is lab mein nahi hain. Planning ke liye assumed example ke taur par total zero hona chahiye; agle din Cost Management mein confirm karo.</p>

<div class="dia">`+e+`<p class="cap">Target design: ek VNet, do /24 subnets, aur kuch nahi.</p></div>

<h3>Steps</h3>

<h4>Step 1. Resource group banao</h4>
<p>Portal: Resource groups, Create, naam <code>rg-nk-lab</code>, region Central India, tags purpose=lab (verify wording).</p>
<pre class="code">az group create --name rg-nk-lab --location centralindia --tags purpose=lab owner=yourname</pre>

<h4>Step 2. Pehle subnet ke saath VNet banao</h4>
<p>Portal: <b>Virtual networks</b> search karo, Create. Basics par resource group chuno, naam <code>vnet-nk</code>, region Central India. IP addresses par address space 10.10.0.0/16 aur <code>snet-web</code> naam ka subnet 10.10.1.0/24 range ke saath set karo (verify wording; portal default 10.0.0.0/16 suggest kar sakta hai, use badal do).</p>
<pre class="code">az network vnet create \\
  --resource-group rg-nk-lab \\
  --name vnet-nk \\
  --location centralindia \\
  --address-prefixes 10.10.0.0/16 \\
  --subnet-name snet-web \\
  --subnet-prefixes 10.10.1.0/24</pre>

<h4>Step 3. Doosra subnet add karo</h4>
<p>Portal: <code>vnet-nk</code> kholo, Subnets chuno, phir 10.10.2.0/24 ke saath <code>snet-app</code> subnet add karo (verify wording).</p>
<pre class="code">az network vnet subnet create \\
  --resource-group rg-nk-lab \\
  --vnet-name vnet-nk \\
  --name snet-app \\
  --address-prefixes 10.10.2.0/24</pre>

<h3>Verification</h3>
<pre class="code">az network vnet show --resource-group rg-nk-lab --name vnet-nk --query "{space:addressSpace.addressPrefixes, state:provisioningState}"
az network vnet subnet list --resource-group rg-nk-lab --vnet-name vnet-nk --query "[].{name:name, prefix:addressPrefix}" --output table</pre>
<p>Illustrative output:</p>
<pre class="out">Name      Prefix
--------  -------------
snet-web  <span class="hl">10.10.1.0/24</span>
snet-app  <span class="hl">10.10.2.0/24</span></pre>
<p>Ab address rules test karo. Azure se pucho ki VNet ke andar koi address valid aur free hai ya nahi:</p>
<pre class="code">az network vnet check-ip-address --resource-group rg-nk-lab --name vnet-nk --ip-address 10.10.1.4
az network vnet check-ip-address --resource-group rg-nk-lab --name vnet-nk --ip-address 10.10.1.2</pre>
<p>Illustrative output (field names version ke hisaab se alag ho sakte hain, isliye "available" field padho):</p>
<pre class="out">{ "available": <span class="hl">true</span> }          <span class="c"># 10.10.1.4: pehla usable address</span>
{ "available": <span class="hl">false</span> }         <span class="c"># 10.10.1.2: Azure ne reserve kiya (DNS mapping)</span></pre>
<p>Yeh subnet ke paanch reserved addresses dikhata hai: .0 network, .1 default gateway, .2 aur .3 Azure DNS mapping, aur .255 broadcast. Pehla address jo aap assign kar sakte ho woh .4 hai.</p>
<p>Optional break-it test: overlapping teesra subnet add karne ki koshish karo, jaise 10.10.1.128/25. Azure reject karta hai kyunki woh snet-web se overlap karta hai. Error padho; woh overlap ka naam batata hai.</p>

<h3>Mandatory cleanup</h3>
<pre class="code">az group delete --name rg-nk-lab --yes --no-wait
az group exists --name rg-nk-lab</pre>
<p>Tab tak ruko jab tak <code>false</code> print na ho. Phir kal Cost Management check karo.</p>

<h3>Kya bill karta hai: trap list</h3>
<ul>
<li>Is lab mein kuch hourly bill nahi karta, lekin log aksar "bas test ke liye" VM add karke bhool jaate hain.</li>
<li><b>VM disks</b> VM stopped hone par bhi bill karti hain (deallocated VMs compute charge rokte hain, disk charge nahi; verify before publishing).</li>
<li><b>Standard public IPs</b> attached ho ya nahi, hourly bill karte hain (verify before publishing).</li>
<li><b>Bastion, NAT Gateway, VPN gateway aur Azure Firewall</b> hourly aur data ke hisaab se bill karte hain. Personal lab mein inhe mehnga maano.</li>
<li><b>Doosre resource group ke resources</b> is group ko delete karne par delete nahi hote. List check karo.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Portal defaults ko bina padhe use karna. Wizard default subnet aur default 10.0.0.0/16 ke saath VNet bana sakta hai. Address fields hamesha padho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Azure har subnet mein paanch addresses reserve karta hai: network address, default gateway, Azure DNS mapping ke do, aur broadcast. /24 subnet mein 251 usable addresses milte hain, /29 mein 3.</p></div>

<div class="scn"><h4>Jo subnet chhota nikla</h4><p>Ek learner ne Bastion practice ke liye /29 subnet banaya aur Azure ne deployment refuse kar diya: Bastion ko AzureBastionSubnet naam ka subnet chahiye jo ek minimum size ka ho (current minimum verify karo). Usne subnet delete kiya, exact required naam ke saath bada subnet banaya aur deployment chal gaya.</p><p><b>Lesson:</b> special Azure services ke naming aur size rules hote hain. Address space mein gaps plan karo.</p></div>

<div class="iv"><p class="q">"Azure mein /24 subnet mein kitne usable IPs hote hain aur kyun?"</p><p>251. /24 mein 256 addresses hote hain aur Azure 5 reserve karta hai: network, default gateway, Azure DNS ke do, aur broadcast. Jodo ki sabse chhota subnet /29 hai, jisme 3 usable milte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VNet ka address space hota hai; subnets usi se kate jaate hain aur overlap nahi kar sakte.</li>
<li>az network vnet create ek command mein pehla subnet bana sakta hai.</li>
<li>Subnet ka pehla usable address .4 hai.</li>
<li>Resource group delete karo aur az group exists se confirm karo.</li>
<li>Cost risk woh hai jo aap baad mein add karte ho: VMs, disks, IPs, gateways.</li>
</ul></div>
`}};export{t as default};