var e=`<svg viewBox="0 0 640 250" role="img" aria-label="Guided lab 1 layout: hub VNet with a router VM, two spoke VNets with one VM each, peerings and user-defined routes">
<rect x="240" y="40" width="160" height="150" rx="12" fill="#ddd6fe" stroke="#64748b"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="13">hub-vnet 10.0.0.0/16</text>
<rect x="260" y="84" width="120" height="50" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="320" y="106" text-anchor="middle" class="svg-ink" font-size="12">vm-hub 10.0.3.4</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="10">IP forwarding on (router)</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="11">stand-in for a firewall</text>
<rect x="15" y="70" width="160" height="90" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="95" y="96" text-anchor="middle" class="svg-ink" font-size="13">spoke1-vnet 10.1.0.0/16</text><text x="95" y="118" text-anchor="middle" class="svg-muted" font-size="11">vm-s1 10.1.1.4</text><text x="95" y="138" text-anchor="middle" class="svg-muted" font-size="11">rt-spoke1</text>
<rect x="465" y="70" width="160" height="90" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="545" y="96" text-anchor="middle" class="svg-ink" font-size="13">spoke2-vnet 10.2.0.0/16</text><text x="545" y="118" text-anchor="middle" class="svg-muted" font-size="11">vm-s2 10.2.1.4</text><text x="545" y="138" text-anchor="middle" class="svg-muted" font-size="11">rt-spoke2</text>
<g stroke="#64748b" stroke-width="2"><line x1="175" y1="115" x2="240" y2="115"/><line x1="400" y1="115" x2="465" y2="115"/></g>
<text x="320" y="225" text-anchor="middle" class="svg-ink" font-size="12">Test 1: spoke1 to spoke2 fails (no transit). Test 2: after UDRs it works via vm-hub.</text>
</svg>`,t={id:`guided-lab-build`,h:{en:`Guided lab on your own Azure account: build a hub-and-spoke`,hi:`Apne Azure account par guided lab: hub-and-spoke banao`},body:{en:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<h3>Goal</h3>
<p>Build a hub VNet and two spoke VNets, peer them, prove that spoke1 <i>cannot</i> reach spoke2 (peering is not transitive), then add user-defined routes and a small Linux VM in the hub acting as a router so the flow works. This is the same pattern Azure Firewall will replace in the next lab, with a lot less money.</p>
<div class="dia">`+e+`<p class="cap">What you will build. Region used in the commands: centralindia. Use one region for the whole lab.</p></div>

<h3>Prerequisites</h3>
<ul>
<li>An Azure subscription you control, with rights to create resource groups and Budgets (Owner or Contributor plus cost permissions).</li>
<li>Azure CLI installed, or Azure Cloud Shell (bash), signed in with <code>az login</code>. Check with <code>az account show</code>.</li>
<li>Quota for three small VMs in the region. If Standard_B1s is unavailable, pick another small size (verify before publishing).</li>
<li>About 60 to 90 minutes. You will <b>delete everything the same day</b>.</li>
</ul>
<div class="note"><p><b>Portal wording.</b> Portal menu and field names below are written from familiarity and were <b>not re-verified against the current Azure portal</b> in this course build. Labels change; pick the closest one. The az CLI commands are the stable reference, but confirm parameters with <code>--help</code> (verify before publishing).</p></div>

<h3>Honest cost</h3>
<p>How you are billed (read the current Azure pricing pages first): virtual machines bill <b>per hour while allocated</b>, plus their managed disks (per GB-month, even when the VM is stopped) and any public IPs. VNets, subnets, peering connections, route tables and NSGs have no hourly charge by themselves, but <b>VNet peering charges per GB transferred</b> across the peering. Rates differ by region. The course build could not re-read the pricing pages, so <b>every number here is ASSUMED for illustration</b>: <b>assumed</b> $0.02 per VM-hour for a small VM, <b>assumed</b> $0.01 per GB peering transfer in each direction, <b>assumed</b> $0.002 per disk-hour for a small standard disk.</p>
<div class="eg"><p><b>Worked example (assumed rates).</b> Three VMs for 3 hours: 3 x 3 x $0.02 = <b>$0.18</b>. Three small disks for 3 hours: 3 x 3 x $0.002 = about <b>$0.02</b>. A few MB of ping traffic: about $0. Total about <b>$0.20</b>.</p></div>
<div class="warn"><p><b>Warning: delete the resource group the same day.</b> Forgotten VMs keep billing. With the same assumed rates, three VMs left for a month cost about 3 x 730 x $0.02 = <b>$43.80</b>, plus disks. Set a phone reminder for the cleanup step now.</p></div>

<h3>Step 0: set a budget alert first</h3>
<p><b>Portal (unverified labels):</b> Cost Management + Billing, then Cost Management, Budgets, Add. Choose your subscription, a small monthly amount (for example 5 USD) and an alert at 80 percent with your email.</p>
<pre class="code">az consumption budget create --budget-name nk-lab --amount 5 --category cost --time-grain monthly --start-date 2026-10-01 --end-date 2027-10-01 <span class="c"># parameters: verify with --help; the portal is usually easier</span></pre>
<p>Budget alerts lag actual spending by hours. They are a safety net, not a substitute for deleting.</p>

<h3>Step 1: resource group, three VNets, subnets</h3>
<p><b>Portal:</b> Resource groups, Create (<code>rg-nk-hub</code>, Central India). Then Virtual networks, Create, three times: hub-vnet 10.0.0.0/16 with subnet shared 10.0.3.0/24; spoke1-vnet 10.1.0.0/16 with subnet workload 10.1.1.0/24; spoke2-vnet 10.2.0.0/16 with subnet workload 10.2.1.0/24.</p>
<pre class="code">az group create -n rg-nk-hub -l centralindia
az network vnet create -g rg-nk-hub -n hub-vnet --address-prefixes 10.0.0.0/16 --subnet-name shared --subnet-prefixes 10.0.3.0/24
az network vnet create -g rg-nk-hub -n spoke1-vnet --address-prefixes 10.1.0.0/16 --subnet-name workload --subnet-prefixes 10.1.1.0/24
az network vnet create -g rg-nk-hub -n spoke2-vnet --address-prefixes 10.2.0.0/16 --subnet-name workload --subnet-prefixes 10.2.1.0/24</pre>

<h3>Step 2: three small VMs without public IPs</h3>
<p><b>Portal:</b> Virtual machines, Create. Pick Ubuntu, a small size, SSH key authentication, and <b>None</b> for public IP and NIC network security group. Place each in the VNet and subnet from Step 1. The first free address in each subnet is normally .4; check it on the VM overview page.</p>
<pre class="code">for X in "vm-hub hub-vnet shared" "vm-s1 spoke1-vnet workload" "vm-s2 spoke2-vnet workload"; do
  set -- $X
  az vm create -g rg-nk-hub -n $1 --image Ubuntu2204 --size Standard_B1s --vnet-name $2 --subnet $3 --public-ip-address "" --nsg "" --admin-username azureuser --generate-ssh-keys --no-wait
done
az vm list -g rg-nk-hub -d --query "[].{name:name,ip:privateIps,state:powerState}" -o table</pre>
<p><b>Check:</b> three VMs with IPs 10.0.3.4, 10.1.1.4 and 10.2.1.4, state <code>VM running</code>. (Image alias and size availability: verify before publishing.)</p>

<h3>Step 3: peer the VNets (four peering objects)</h3>
<p><b>Portal:</b> hub-vnet, Peerings, Add. Create the peering to spoke1 and the reverse in one wizard; tick allow forwarded traffic on both sides. Repeat for spoke2.</p>
<pre class="code">for S in spoke1 spoke2; do
  az network vnet peering create -g rg-nk-hub -n hub-to-$S --vnet-name hub-vnet --remote-vnet $S-vnet --allow-vnet-access --allow-forwarded-traffic
  az network vnet peering create -g rg-nk-hub -n $S-to-hub --vnet-name $S-vnet --remote-vnet hub-vnet --allow-vnet-access --allow-forwarded-traffic
done
az network vnet peering list -g rg-nk-hub --vnet-name hub-vnet --query "[].{name:name,state:peeringState}" -o table</pre>
<p><b>Check:</b> both rows show <code>Connected</code>.</p>

<h3>Step 4: Test 1, spoke1 to spoke2 must fail</h3>
<pre class="code">az vm run-command invoke -g rg-nk-hub -n vm-s1 --command-id RunShellScript --scripts "ping -c 3 -W 2 10.2.1.4; ping -c 3 -W 2 10.0.3.4"</pre>
<pre class="out"><span class="c">Illustrative output</span>
PING 10.2.1.4 ... 3 packets transmitted, <span class="hl">0 received, 100% packet loss</span>
PING 10.0.3.4 ... 3 packets transmitted, 3 received, 0% packet loss</pre>
<p>The hub is reachable, spoke2 is not: peering is non-transitive.</p>

<h3>Step 5: make vm-hub a router</h3>
<p><b>Portal:</b> Network interfaces, the NIC of vm-hub, IP configurations, Enable IP forwarding. Then enable forwarding inside the VM.</p>
<pre class="code">NIC=$(az vm show -g rg-nk-hub -n vm-hub --query "networkProfile.networkInterfaces[0].id" -o tsv)
az network nic update --ids $NIC --ip-forwarding true
az vm run-command invoke -g rg-nk-hub -n vm-hub --command-id RunShellScript --scripts "sysctl -w net.ipv4.ip_forward=1"</pre>

<h3>Step 6: user-defined routes, both directions</h3>
<p><b>Portal:</b> Route tables, Create (rt-spoke1, rt-spoke2); Routes, Add: destination the other spoke, next hop type Virtual appliance, address 10.0.3.4; Subnets, Associate with the workload subnet.</p>
<pre class="code">az network route-table create -g rg-nk-hub -n rt-spoke1 -l centralindia
az network route-table route create -g rg-nk-hub --route-table-name rt-spoke1 -n to-spoke2 --address-prefix 10.2.0.0/16 --next-hop-type VirtualAppliance --next-hop-ip-address 10.0.3.4
az network vnet subnet update -g rg-nk-hub --vnet-name spoke1-vnet -n workload --route-table rt-spoke1
az network route-table create -g rg-nk-hub -n rt-spoke2 -l centralindia
az network route-table route create -g rg-nk-hub --route-table-name rt-spoke2 -n to-spoke1 --address-prefix 10.1.0.0/16 --next-hop-type VirtualAppliance --next-hop-ip-address 10.0.3.4
az network vnet subnet update -g rg-nk-hub --vnet-name spoke2-vnet -n workload --route-table rt-spoke2</pre>

<h3>Step 7: verify</h3>
<pre class="code">az network watcher show-next-hop -g rg-nk-hub --vm vm-s1 --source-ip 10.1.1.4 --dest-ip 10.2.1.4
az vm run-command invoke -g rg-nk-hub -n vm-s1 --command-id RunShellScript --scripts "ping -c 3 -W 2 10.2.1.4"</pre>
<pre class="out"><span class="c">Illustrative output</span>
nextHopType: <span class="hl">VirtualAppliance</span>   nextHopIpAddress: 10.0.3.4
PING 10.2.1.4 ... 3 packets transmitted, <span class="hl">3 received, 0% packet loss</span></pre>
<p>If it still fails, check: IP forwarding on both the NIC and the OS, allow-forwarded-traffic on all four peering objects, and the mirror route in rt-spoke2.</p>

<h3>MANDATORY CLEANUP</h3>
<pre class="code">az group delete -n rg-nk-hub --yes --no-wait
az group exists -n rg-nk-hub <span class="c"># repeat until it prints false</span></pre>
<p>Deleting the resource group removes the VMs, disks, NICs, VNets, peerings and route tables together. <b>Confirm</b> in the portal under Resource groups and look at Cost analysis the next day.</p>

<h3>What bills you: the trap list</h3>
<ul>
<li>Virtual machines, every hour they are allocated. Stopping inside the OS does not stop the meter; deallocate or delete.</li>
<li>Managed disks, even when the VM is deallocated.</li>
<li>Public IPs (Standard bills hourly even when unused) if you added any.</li>
<li>Peering data transfer between the VNets.</li>
<li>Resources left in a region or resource group you forgot.</li>
</ul>

<div class="scn"><h4>The deallocated VM that kept billing</h4><p>A learner "stopped" their lab VMs from inside Linux with shutdown and went on holiday. The portal showed Stopped, not Stopped (deallocated), so compute billing continued, and the disks billed too. The budget email arrived on day four.</p><p><b>Lesson:</b> delete the resource group; do not rely on stopping.</p></div>

<div class="iv"><p class="q">"How can you test a hub-and-spoke routing design cheaply?"</p><p>Use small VMs without public IPs, a hub VM with IP forwarding as a stand-in router, run-command or next hop to test, a budget alert up front, and delete the resource group the same day. Say you would replace the VM with a firewall once the routing logic is proven.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Set a budget alert before creating billable resources.</li>
<li>Peering alone does not give spoke-to-spoke; routes and a forwarder do.</li>
<li>IP forwarding must be on at the NIC and inside the OS.</li>
<li>Prove it with next hop and a ping, not assumption.</li>
<li>Delete the resource group, then confirm it is gone.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<h3>Goal</h3>
<p>Ek hub VNet aur do spoke VNets banao, unhe peer karo, saabit karo ki spoke1 spoke2 tak <i>nahi</i> pahunch sakta (peering transitive nahi), phir user-defined routes aur hub mein router ki tarah kaam karne wali ek chhoti Linux VM jodo taaki flow chal pade. Agle lab mein Azure Firewall isi pattern ki jagah lega, par bahut zyada paise ke saath.</p>
<div class="dia">`+e+`<p class="cap">Aap kya banaoge. Commands mein region: centralindia. Poore lab mein ek hi region use karo.</p></div>

<h3>Prerequisites</h3>
<ul>
<li>Aapke control wali Azure subscription, resource groups aur Budgets banane ke rights ke saath (Owner, ya Contributor plus cost permissions).</li>
<li>Azure CLI installed, ya Azure Cloud Shell (bash), <code>az login</code> se signed in. <code>az account show</code> se check karo.</li>
<li>Region mein teen chhoti VMs ka quota. Standard_B1s available na ho to koi aur chhota size chuno (publish se pehle verify karo).</li>
<li>Lagbhag 60 se 90 minute. Aap <b>usi din sab kuch delete karoge</b>.</li>
</ul>
<div class="note"><p><b>Portal wording.</b> Neeche ke portal menu aur field names jaankari se likhe gaye hain aur is course build mein current Azure portal se <b>re-verify nahi kiye gaye</b>. Labels badalte rehte hain; sabse kareeb wala chuno. az CLI commands stable reference hain, par parameters <code>--help</code> se confirm karo (verify before publishing).</p></div>

<h3>Imaandar cost</h3>
<p>Billing kaise hoti hai (pehle current Azure pricing pages padho): virtual machines <b>allocated rehne tak per hour</b> bill karti hain, plus unki managed disks (per GB-month, VM stopped ho tab bhi) aur koi bhi public IPs. VNets, subnets, peering connections, route tables aur NSGs ka khud ka hourly charge nahi hota, par <b>VNet peering peering ke paar transfer hue per GB</b> charge karti hai. Rates region ke hisaab se alag hote hain. Course build pricing pages dobara nahi padh paaya, isliye <b>yahan ka har number samjhane ke liye ASSUMED hai</b>: chhoti VM ke liye <b>assumed</b> $0.02 per VM-hour, <b>assumed</b> $0.01 per GB peering transfer har direction mein, chhoti standard disk ke liye <b>assumed</b> $0.002 per disk-hour.</p>
<div class="eg"><p><b>Worked example (assumed rates).</b> Teen VMs 3 ghante: 3 x 3 x $0.02 = <b>$0.18</b>. Teen chhoti disks 3 ghante: 3 x 3 x $0.002 = lagbhag <b>$0.02</b>. Kuch MB ping traffic: lagbhag $0. Total lagbhag <b>$0.20</b>.</p></div>
<div class="warn"><p><b>Warning: resource group usi din delete karo.</b> Bhooli hui VMs bill karti rehti hain. Usi assumed rate par teen VMs ek mahine chhodne par lagbhag 3 x 730 x $0.02 = <b>$43.80</b> padte hain, disks alag. Abhi phone par cleanup ka reminder laga lo.</p></div>

<h3>Step 0: pehle budget alert lagao</h3>
<p><b>Portal (unverified labels):</b> Cost Management + Billing, phir Cost Management, Budgets, Add. Apni subscription chuno, chhoti monthly amount (jaise 5 USD) aur 80 percent par apni email ke saath alert.</p>
<pre class="code">az consumption budget create --budget-name nk-lab --amount 5 --category cost --time-grain monthly --start-date 2026-10-01 --end-date 2027-10-01 <span class="c"># parameters: --help se verify karo; portal aksar aasaan hota hai</span></pre>
<p>Budget alerts actual spending se kuch ghante peeche chalte hain. Yeh safety net hain, delete karne ka substitute nahi.</p>

<h3>Step 1: resource group, teen VNets, subnets</h3>
<p><b>Portal:</b> Resource groups, Create (<code>rg-nk-hub</code>, Central India). Phir Virtual networks, Create, teen baar: hub-vnet 10.0.0.0/16 subnet shared 10.0.3.0/24 ke saath; spoke1-vnet 10.1.0.0/16 subnet workload 10.1.1.0/24 ke saath; spoke2-vnet 10.2.0.0/16 subnet workload 10.2.1.0/24 ke saath.</p>
<pre class="code">az group create -n rg-nk-hub -l centralindia
az network vnet create -g rg-nk-hub -n hub-vnet --address-prefixes 10.0.0.0/16 --subnet-name shared --subnet-prefixes 10.0.3.0/24
az network vnet create -g rg-nk-hub -n spoke1-vnet --address-prefixes 10.1.0.0/16 --subnet-name workload --subnet-prefixes 10.1.1.0/24
az network vnet create -g rg-nk-hub -n spoke2-vnet --address-prefixes 10.2.0.0/16 --subnet-name workload --subnet-prefixes 10.2.1.0/24</pre>

<h3>Step 2: teen chhoti VMs, bina public IP</h3>
<p><b>Portal:</b> Virtual machines, Create. Ubuntu, chhota size, SSH key authentication chuno, aur public IP aur NIC network security group ke liye <b>None</b>. Har ek ko Step 1 ke VNet aur subnet mein rakho. Har subnet ka pehla free address aam taur par .4 hota hai; VM overview page par check karo.</p>
<pre class="code">for X in "vm-hub hub-vnet shared" "vm-s1 spoke1-vnet workload" "vm-s2 spoke2-vnet workload"; do
  set -- $X
  az vm create -g rg-nk-hub -n $1 --image Ubuntu2204 --size Standard_B1s --vnet-name $2 --subnet $3 --public-ip-address "" --nsg "" --admin-username azureuser --generate-ssh-keys --no-wait
done
az vm list -g rg-nk-hub -d --query "[].{name:name,ip:privateIps,state:powerState}" -o table</pre>
<p><b>Check:</b> teen VMs, IPs 10.0.3.4, 10.1.1.4 aur 10.2.1.4, state <code>VM running</code>. (Image alias aur size availability: publish se pehle verify karo.)</p>

<h3>Step 3: VNets ko peer karo (chaar peering objects)</h3>
<p><b>Portal:</b> hub-vnet, Peerings, Add. Ek wizard mein spoke1 ki peering aur reverse banao; dono sides par allow forwarded traffic tick karo. Spoke2 ke liye dohrao.</p>
<pre class="code">for S in spoke1 spoke2; do
  az network vnet peering create -g rg-nk-hub -n hub-to-$S --vnet-name hub-vnet --remote-vnet $S-vnet --allow-vnet-access --allow-forwarded-traffic
  az network vnet peering create -g rg-nk-hub -n $S-to-hub --vnet-name $S-vnet --remote-vnet hub-vnet --allow-vnet-access --allow-forwarded-traffic
done
az network vnet peering list -g rg-nk-hub --vnet-name hub-vnet --query "[].{name:name,state:peeringState}" -o table</pre>
<p><b>Check:</b> dono rows <code>Connected</code> dikhayein.</p>

<h3>Step 4: Test 1, spoke1 se spoke2 fail hona chahiye</h3>
<pre class="code">az vm run-command invoke -g rg-nk-hub -n vm-s1 --command-id RunShellScript --scripts "ping -c 3 -W 2 10.2.1.4; ping -c 3 -W 2 10.0.3.4"</pre>
<pre class="out"><span class="c">Illustrative output</span>
PING 10.2.1.4 ... 3 packets transmitted, <span class="hl">0 received, 100% packet loss</span>
PING 10.0.3.4 ... 3 packets transmitted, 3 received, 0% packet loss</pre>
<p>Hub reachable hai, spoke2 nahi: peering non-transitive hai.</p>

<h3>Step 5: vm-hub ko router banao</h3>
<p><b>Portal:</b> Network interfaces, vm-hub ka NIC, IP configurations, Enable IP forwarding. Phir VM ke andar forwarding enable karo.</p>
<pre class="code">NIC=$(az vm show -g rg-nk-hub -n vm-hub --query "networkProfile.networkInterfaces[0].id" -o tsv)
az network nic update --ids $NIC --ip-forwarding true
az vm run-command invoke -g rg-nk-hub -n vm-hub --command-id RunShellScript --scripts "sysctl -w net.ipv4.ip_forward=1"</pre>

<h3>Step 6: user-defined routes, dono directions</h3>
<p><b>Portal:</b> Route tables, Create (rt-spoke1, rt-spoke2); Routes, Add: destination doosra spoke, next hop type Virtual appliance, address 10.0.3.4; Subnets, workload subnet se Associate.</p>
<pre class="code">az network route-table create -g rg-nk-hub -n rt-spoke1 -l centralindia
az network route-table route create -g rg-nk-hub --route-table-name rt-spoke1 -n to-spoke2 --address-prefix 10.2.0.0/16 --next-hop-type VirtualAppliance --next-hop-ip-address 10.0.3.4
az network vnet subnet update -g rg-nk-hub --vnet-name spoke1-vnet -n workload --route-table rt-spoke1
az network route-table create -g rg-nk-hub -n rt-spoke2 -l centralindia
az network route-table route create -g rg-nk-hub --route-table-name rt-spoke2 -n to-spoke1 --address-prefix 10.1.0.0/16 --next-hop-type VirtualAppliance --next-hop-ip-address 10.0.3.4
az network vnet subnet update -g rg-nk-hub --vnet-name spoke2-vnet -n workload --route-table rt-spoke2</pre>

<h3>Step 7: verify</h3>
<pre class="code">az network watcher show-next-hop -g rg-nk-hub --vm vm-s1 --source-ip 10.1.1.4 --dest-ip 10.2.1.4
az vm run-command invoke -g rg-nk-hub -n vm-s1 --command-id RunShellScript --scripts "ping -c 3 -W 2 10.2.1.4"</pre>
<pre class="out"><span class="c">Illustrative output</span>
nextHopType: <span class="hl">VirtualAppliance</span>   nextHopIpAddress: 10.0.3.4
PING 10.2.1.4 ... 3 packets transmitted, <span class="hl">3 received, 0% packet loss</span></pre>
<p>Phir bhi fail ho to check karo: NIC aur OS dono par IP forwarding, chaaron peering objects par allow-forwarded-traffic, aur rt-spoke2 ka mirror route.</p>

<h3>MANDATORY CLEANUP</h3>
<pre class="code">az group delete -n rg-nk-hub --yes --no-wait
az group exists -n rg-nk-hub <span class="c"># tab tak dohrao jab tak false print na ho</span></pre>
<p>Resource group delete karne se VMs, disks, NICs, VNets, peerings aur route tables ek saath hat jaate hain. Portal mein Resource groups mein <b>confirm</b> karo aur agle din Cost analysis dekho.</p>

<h3>What bills you: trap list</h3>
<ul>
<li>Virtual machines, jitne ghante allocated hain. OS ke andar band karne se meter band nahi hota; deallocate ya delete karo.</li>
<li>Managed disks, VM deallocated ho tab bhi.</li>
<li>Public IPs (Standard unused hone par bhi hourly bill karta hai) agar aapne jode ho.</li>
<li>VNets ke beech peering data transfer.</li>
<li>Kisi bhoole hue region ya resource group mein chhodi hui resources.</li>
</ul>

<div class="scn"><h4>Deallocated VM jo bill karti rahi</h4><p>Ek learner ne lab VMs ko Linux ke andar se shutdown karke "stop" kiya aur holiday par chala gaya. Portal mein Stopped dikha, Stopped (deallocated) nahi, isliye compute billing chalti rahi, aur disks bhi bill hui. Budget email chauthe din aayi.</p><p><b>Lesson:</b> resource group delete karo; stop karne par bharosa mat karo.</p></div>

<div class="iv"><p class="q">"Hub-and-spoke routing design ko sasta kaise test karoge?"</p><p>Bina public IP ki chhoti VMs, hub mein IP forwarding wali VM stand-in router ke taur par, run-command ya next hop se test, shuru mein budget alert, aur usi din resource group delete. Bolo ki routing logic saabit hone ke baad VM ki jagah firewall lagaoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Billable resources banane se pehle budget alert lagao.</li>
<li>Akeli peering spoke-to-spoke nahi deti; routes aur forwarder dete hain.</li>
<li>IP forwarding NIC par aur OS ke andar dono jagah on honi chahiye.</li>
<li>Next hop aur ping se saabit karo, assumption se nahi.</li>
<li>Resource group delete karo, phir confirm karo ki gaya.</li>
</ul></div>
`}};export{t as default};