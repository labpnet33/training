var e=e=>`<pre class="code">`+e+(e.endsWith(`</pre>`)?``:`</pre>`),t=`<div class="note"><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.nwkings.com. Or use your own account: set a budget alert first and delete the resource group when you finish.</div>`,n=e(`RG=nk-peer-rg
LOC=centralindia

<span class="c"># 1. Resource group (tagged) and two VNets with NON-overlapping spaces</span>
az group create -n $RG -l $LOC --tags Project=nk-peer-lab
az network vnet create -g $RG -n vnet-a --address-prefixes 10.10.0.0/16 --subnet-name sn-a --subnet-prefixes 10.10.1.0/24
az network vnet create -g $RG -n vnet-b --address-prefixes 10.20.0.0/16 --subnet-name sn-b --subnet-prefixes 10.20.1.0/24`),r=e(`<span class="c"># 2. Two small VMs, no public IP, no NSG attached, fixed private IPs (size/image: verify availability)</span>
az vm create -g $RG -n vm-a --image Ubuntu2204 --size Standard_B1s --vnet-name vnet-a --subnet sn-a \\
  --public-ip-address "" --nsg "" --private-ip-address 10.10.1.4 --admin-username azureuser --generate-ssh-keys
az vm create -g $RG -n vm-b --image Ubuntu2204 --size Standard_B1s --vnet-name vnet-b --subnet sn-b \\
  --public-ip-address "" --nsg "" --private-ip-address 10.20.1.4 --admin-username azureuser --generate-ssh-keys

<span class="c"># 3. BEFORE peering: should fail (isolated VNets)</span>
az vm run-command invoke -g $RG -n vm-a --command-id RunShellScript --scripts "ping -c 3 -W 2 10.20.1.4 || echo UNREACHABLE"</pre>
<pre class="out">Illustrative output
3 packets transmitted, 0 received, 100% packet loss
<span class="hl">UNREACHABLE</span>`),i=e(`<span class="c"># 4. Peering needs a link on EACH side</span>
az network vnet peering create -g $RG -n a-to-b --vnet-name vnet-a --remote-vnet vnet-b --allow-vnet-access
az network vnet peering list -g $RG --vnet-name vnet-a --query "[].{name:name, state:peeringState}" -o table

az network vnet peering create -g $RG -n b-to-a --vnet-name vnet-b --remote-vnet vnet-a --allow-vnet-access
az network vnet peering list -g $RG --vnet-name vnet-a --query "[].{name:name, state:peeringState}" -o table</pre>
<pre class="out">Illustrative output
Name     State
-------  ---------
a-to-b   <span class="hl">Initiated</span>        (after the first link only)

Name     State
-------  ---------
a-to-b   <span class="hl">Connected</span>        (after both links exist)`),a=e(`<span class="c"># 5. Test again, from both sides</span>
az vm run-command invoke -g $RG -n vm-a --command-id RunShellScript --scripts "ping -c 3 -W 2 10.20.1.4"
az vm run-command invoke -g $RG -n vm-b --command-id RunShellScript --scripts "ping -c 3 -W 2 10.10.1.4"

<span class="c"># 6. See what Azure now knows: the NIC's effective routes, and the next hop</span>
az network nic show-effective-route-table -g $RG -n vm-aVMNic -o table
az network watcher show-next-hop -g $RG --vm vm-a --source-ip 10.10.1.4 --dest-ip 10.20.1.4</pre>
<pre class="out">Illustrative output
3 packets transmitted, 3 received, 0% packet loss

Source   State   Address Prefix   Next Hop Type
Default  Active  10.10.0.0/16     VnetLocal
Default  Active  <span class="hl">10.20.0.0/16</span>     <span class="hl">VNetPeering</span>
Default  Active  0.0.0.0/0        Internet</pre>`),o=e(`<span class="c"># 7. Break it on purpose: delete one link and read the state of the other</span>
az network vnet peering delete -g $RG --vnet-name vnet-b -n b-to-a
az network vnet peering list -g $RG --vnet-name vnet-a --query "[].{name:name, state:peeringState}" -o table
az vm run-command invoke -g $RG -n vm-a --command-id RunShellScript --scripts "ping -c 2 -W 2 10.20.1.4 || echo UNREACHABLE"

<span class="c"># 8. Fix it (recreate the missing link)</span>
az network vnet peering create -g $RG -n b-to-a --vnet-name vnet-b --remote-vnet vnet-a --allow-vnet-access</pre>
<pre class="out">Illustrative output
Name     State
-------  ------------
a-to-b   <span class="hl">Disconnected</span>
UNREACHABLE</pre>`),s=e(`<span class="c"># Delete everything: VMs, disks, NICs, VNets and the peerings</span>
az group delete -n $RG --yes --no-wait

<span class="c"># Later, prove it is gone</span>
az group exists -n $RG
az resource list --tag Project=nk-peer-lab -o table</pre>
<pre class="out">Illustrative output
false</pre>`),c={id:`guided-lab-vnet-peering`,h:{en:`Guided lab on your own Azure account: peer two VNets`,hi:`Apne Azure account par guided lab: do VNets peer karo`},body:{en:`
`+t+`

<h3>Goal</h3>
<p>Build two VNets with non-overlapping address spaces (10.10.0.0/16 and 10.20.0.0/16), put a VM in each, show that they cannot talk, create a peering in each direction, prove they now can, read the effective routes, then break the peering on purpose and fix it. Finally <b>delete the resource group</b>.</p>

<h3>Prerequisites</h3>
<ul>
<li>An Azure subscription where you can create resource groups, VMs and VNets; Azure CLI 2.x signed in.</li>
<li>A <b>budget alert</b> created first (Cost Management, Budgets; wording: verify).</li>
<li>About 40 minutes. Do the cleanup in the same sitting.</li>
<li>No Bastion and no public IPs: commands run through <code>az vm run-command</code>.</li>
</ul>

<h3>Honest estimated cost</h3>
<p>VNets and the peering resource themselves have no hourly charge. The cost comes from the two small VMs (per hour, plus their managed disks per month) and from <b>data transferred over the peering</b>, charged per GB in each direction (verify current rates; global peering is dearer). <b>ASSUMED example</b>: 0.012 USD per VM hour for two VMs for 2 hours is about 0.05 USD; a few MB of ping traffic over a 0.01 USD per GB peering is effectively zero; disks add a few cents per day. A forgotten month of two small VMs is a few USD under these assumptions: small, but pointless. Replace the assumptions with real rates from the pricing calculator.</p>

<div class="warn"><b>BILLING NOTE.</b> This lab has no hourly-billed network gateway, but VMs and disks still bill until deleted. Do <b>not</b> add a VPN gateway, Azure Firewall or Bastion to this lab: they bill hourly and are expensive. The next lab uses a VM as the appliance on purpose.</div>

<div class="note"><b>Portal wording</b> below is from memory and Azure changes the portal often. Treat labels as unverified; the az commands are the reliable route.</div>

<h3>Steps 1 and 2: VNets and VMs</h3>
<p><b>Portal (unverified wording):</b> Resource groups, Create nk-peer-rg with tag Project = nk-peer-lab. Virtual networks, Create twice: vnet-a 10.10.0.0/16 with subnet sn-a 10.10.1.0/24, and vnet-b 10.20.0.0/16 with subnet sn-b 10.20.1.0/24. Virtual machines, Create vm-a in vnet-a/sn-a and vm-b in vnet-b/sn-b, Ubuntu LTS, small size, SSH key, Public IP None, NIC network security group None. On each VM use Operations, Run command, RunShellScript.</p>
<p><b>CLI:</b></p>
`+n+`
`+r+`
<h3>Steps 4: create the peering (both directions)</h3>
<p><b>Portal (unverified wording):</b> open vnet-a, Settings, Peerings, Add. Name the local link a-to-b and the remote link b-to-a, choose vnet-b, keep "Allow access" enabled. The portal creates both links at once. With the CLI you create each one.</p>
`+i+`
<h3>Steps 5 and 6: verify</h3>
`+a+`
<p>If the ping fails after Connected, check an NSG on the subnet or NIC (we attached none), and the OS firewall. The default NSG rule AllowVnetInBound would allow it anyway.</p>

<h3>Steps 7 and 8: break and fix</h3>
`+o+`
<h3>Cleanup (mandatory)</h3>
<p>Start now unless you are going straight on to the next lab, which uses a similar environment and ends with its own cleanup.</p>
`+s+`

<h3>What bills you: the trap list</h3>
<ul>
<li><b>VMs and managed disks</b>: bill until deleted; a deallocated VM still pays for its disk.</li>
<li><b>Peering data transfer</b>: per GB in and out; a big copy test over global peering costs more than regional (verify).</li>
<li><b>Public IPs</b> if you added any: Standard public IPs bill hourly.</li>
<li><b>VPN or ExpressRoute gateways, Azure Firewall, Bastion, Application Gateway v2</b>: hourly and expensive; do not add them in a practice lab, and check the resource group list before you finish.</li>
<li><b>Forgotten attempts</b>: resource groups in other regions; search by tag Project.</li>
</ul>

<div class="warn"><b>Common mistakes.</b> Creating only one link and wondering why traffic fails; overlapping address spaces (Azure refuses); testing from your laptop instead of from a VM in the VNet; forgetting that the second subscription also needs a link if you try cross-subscription.</div>
<div class="exam"><b>Exam trap.</b> Peering status Initiated means one side only; Disconnected means a link was deleted; Connected needs both.</div>

<div class="scn"><h4>The peering that was half-deleted</h4><p>A teammate deleted what looked like a duplicate peering in vnet-b during a clean-up. vnet-a still showed its link, now Disconnected, and the app lost database access. The activity log identified the delete. Recreating the b-to-a link restored Connected and traffic in seconds.</p><p><b>Lesson:</b> a peering is two links; deleting one breaks both directions. Put resource locks on production peerings.</p></div>

<div class="iv"><p class="q">"How do you prove that two VMs are using the peering and not the internet?"</p><p>Use their private IPs (no public IPs involved), check that the peering state is Connected on both links, and read the effective routes of the source NIC: the remote address space appears with next hop VNetPeering. Network Watcher next hop gives the same answer.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Two VNets, non-overlapping spaces, one VM each, no public IPs.</li>
<li>Create the link in each direction; check state Connected.</li>
<li>Verify with ping over private IPs, effective routes and next hop.</li>
<li>Deleting one link gives Disconnected and traffic stops.</li>
<li>Delete the resource group when you finish.</li>
</ul></div>
`,hi:`
`+t+`

<h3>Goal</h3>
<p>Non-overlapping address spaces (10.10.0.0/16 aur 10.20.0.0/16) wale do VNets banao, har ek mein ek VM rakho, dikhao ki woh baat nahi kar sakte, har direction mein peering banao, sabit karo ki ab kar sakte hain, effective routes padho, phir peering ko jaanboojhkar todo aur fix karo. Aakhir mein <b>resource group delete</b> karo.</p>

<h3>Prerequisites</h3>
<ul>
<li>Azure subscription jahan aap resource groups, VMs aur VNets bana sako; Azure CLI 2.x sign-in ke saath.</li>
<li>Pehle se bana <b>budget alert</b> (Cost Management, Budgets; wording: verify).</li>
<li>Lagbhag 40 minute. Cleanup usi sitting mein karo.</li>
<li>Bastion aur public IPs nahi: commands <code>az vm run-command</code> se chalte hain.</li>
</ul>

<h3>Imaandaar estimated cost</h3>
<p>VNets aur peering resource par khud koi hourly charge nahi. Cost do chhote VMs (per hour, plus unki managed disks per month) aur <b>peering par transfer hue data</b> se aata hai, jo har direction mein per GB charge hota hai (current rates verify karo; global peering mehngi hai). <b>ASSUMED example</b>: do VMs ke liye 0.012 USD per VM hour, 2 ghante lagbhag 0.05 USD; 0.01 USD per GB peering par kuch MB ping traffic lagbhag zero; disks kuch cents per day jodti hain. Do chhote VMs ka bhoola hua mahina in assumptions par kuch USD hai: chhota, par bekaar. Assumptions ko pricing calculator ke asli rates se badal do.</p>

<div class="warn"><b>BILLING NOTE.</b> Is lab mein hourly-billed network gateway nahi hai, par VMs aur disks delete hone tak bill karte hain. Is lab mein VPN gateway, Azure Firewall ya Bastion <b>mat</b> jodo: woh hourly bill karte hain aur mehnge hain. Agla lab jaanboojhkar VM ko appliance banata hai.</div>

<div class="note"><b>Portal wording</b> neeche yaad se hai aur Azure portal aksar badalta hai. Labels ko unverified maano; az commands bharosemand route hain.</div>

<h3>Step 1 aur 2: VNets aur VMs</h3>
<p><b>Portal (unverified wording):</b> Resource groups, Create nk-peer-rg tag Project = nk-peer-lab ke saath. Virtual networks, do baar Create: vnet-a 10.10.0.0/16 subnet sn-a 10.10.1.0/24 ke saath, aur vnet-b 10.20.0.0/16 subnet sn-b 10.20.1.0/24 ke saath. Virtual machines, vm-a ko vnet-a/sn-a mein aur vm-b ko vnet-b/sn-b mein Create karo, Ubuntu LTS, chhota size, SSH key, Public IP None, NIC network security group None. Har VM par Operations, Run command, RunShellScript use karo.</p>
<p><b>CLI:</b></p>
`+n+`
`+r+`
<h3>Step 4: peering banao (dono directions)</h3>
<p><b>Portal (unverified wording):</b> vnet-a kholo, Settings, Peerings, Add. Local link a-to-b aur remote link b-to-a naam do, vnet-b chuno, "Allow access" enabled rakho. Portal dono links ek saath banata hai. CLI mein har ek alag banate ho.</p>
`+i+`
<h3>Step 5 aur 6: verify</h3>
`+a+`
<p>Connected ke baad bhi ping fail ho to subnet ya NIC par NSG (humne koi attach nahi kiya) aur OS firewall check karo. Default NSG rule AllowVnetInBound waise bhi allow karta.</p>

<h3>Step 7 aur 8: todo aur fix karo</h3>
`+o+`
<h3>Cleanup (mandatory)</h3>
<p>Ab shuru karo, jab tak aap seedha agle lab par na ja rahe ho, jo milta-julta environment use karta hai aur apne cleanup ke saath khatam hota hai.</p>
`+s+`

<h3>Kya bill karta hai: trap list</h3>
<ul>
<li><b>VMs aur managed disks</b>: delete hone tak bill; deallocated VM bhi disk ka paisa deta hai.</li>
<li><b>Peering data transfer</b>: per GB in aur out; global peering par bada copy test regional se mehnga (verify).</li>
<li><b>Public IPs</b> agar jodi hon: Standard public IPs hourly bill karti hain.</li>
<li><b>VPN ya ExpressRoute gateways, Azure Firewall, Bastion, Application Gateway v2</b>: hourly aur mehnge; practice lab mein mat jodo, aur khatam karne se pehle resource group list check karo.</li>
<li><b>Bhoole hue attempts</b>: doosre regions ke resource groups; Project tag se search karo.</li>
</ul>

<div class="warn"><b>Common mistakes.</b> Sirf ek link banana aur sochna ki traffic kyun fail; overlapping address spaces (Azure refuse karta hai); laptop se test karna, VNet ke VM se nahi; bhoolna ki cross-subscription try karo to doosre subscription mein bhi link chahiye.</div>
<div class="exam"><b>Exam trap.</b> Peering status Initiated matlab sirf ek taraf; Disconnected matlab ek link delete hua; Connected ke liye dono chahiye.</div>

<div class="scn"><h4>Aadhi delete hui peering</h4><p>Ek teammate ne clean-up mein vnet-b ki duplicate lagne wali peering delete kar di. vnet-a mein uska link abhi bhi tha, ab Disconnected, aur app ka database access chala gaya. Activity log ne delete pehchana. b-to-a link dobara banane se Connected aur traffic seconds mein wapas aaye.</p><p><b>Lesson:</b> peering do links hai; ek delete karne se dono directions toot jaate hain. Production peerings par resource locks lagao.</p></div>

<div class="iv"><p class="q">"Kaise sabit karoge ki do VMs peering use kar rahe hain, internet nahi?"</p><p>Unke private IPs use karo (public IPs involve nahi), check karo ki dono links par peering state Connected hai, aur source NIC ke effective routes padho: remote address space next hop VNetPeering ke saath dikhta hai. Network Watcher next hop wahi jawab deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Do VNets, non-overlapping spaces, ek-ek VM, public IPs nahi.</li>
<li>Har direction mein link banao; state Connected check karo.</li>
<li>Private IPs par ping, effective routes aur next hop se verify karo.</li>
<li>Ek link delete karne se Disconnected hota hai aur traffic ruk jaata hai.</li>
<li>Khatam karne par resource group delete karo.</li>
</ul></div>
`}};export{c as default};