var e=e=>`<pre class="code">`+e+(e.endsWith(`</pre>`)?``:`</pre>`),t=e(`RG=nk-hub-rg
LOC=centralindia
az group create -n $RG -l $LOC --tags Project=nk-hub-lab

<span class="c"># Three VNets with distinct ranges</span>
az network vnet create -g $RG -n vnet-hub    --address-prefixes 10.0.0.0/16 --subnet-name sn-hub --subnet-prefixes 10.0.1.0/24
az network vnet create -g $RG -n vnet-spoke1 --address-prefixes 10.1.0.0/16 --subnet-name sn-s1  --subnet-prefixes 10.1.1.0/24
az network vnet create -g $RG -n vnet-spoke2 --address-prefixes 10.2.0.0/16 --subnet-name sn-s2  --subnet-prefixes 10.2.1.0/24

<span class="c"># Three small VMs, no public IP; the hub VM will act as the appliance (NVA)</span>
for X in "nva1 vnet-hub sn-hub 10.0.1.4" "vm-s1 vnet-spoke1 sn-s1 10.1.1.4" "vm-s2 vnet-spoke2 sn-s2 10.2.1.4"; do
  set -- $X
  az vm create -g $RG -n $1 --image Ubuntu2204 --size Standard_B1s --vnet-name $2 --subnet $3 \\
    --public-ip-address "" --nsg "" --private-ip-address $4 --admin-username azureuser --generate-ssh-keys --no-wait
done</pre>`),n=e(`<span class="c"># Peer hub with each spoke, both directions, allowing forwarded traffic</span>
for S in spoke1 spoke2; do
  az network vnet peering create -g $RG -n hub-to-$S --vnet-name vnet-hub --remote-vnet vnet-$S --allow-vnet-access --allow-forwarded-traffic
  az network vnet peering create -g $RG -n $S-to-hub --vnet-name vnet-$S --remote-vnet vnet-hub --allow-vnet-access --allow-forwarded-traffic
done

<span class="c"># TEST 1: hub reaches both spokes. spoke1 to spoke2 must FAIL (non-transitive)</span>
az vm run-command invoke -g $RG -n nva1  --command-id RunShellScript --scripts "ping -c 2 -W 2 10.1.1.4; ping -c 2 -W 2 10.2.1.4"
az vm run-command invoke -g $RG -n vm-s1 --command-id RunShellScript --scripts "ping -c 2 -W 2 10.2.1.4 || echo UNREACHABLE"</pre>
<pre class="out">Illustrative output
(from nva1)  0% packet loss to 10.1.1.4 and 10.2.1.4
(from vm-s1) <span class="hl">UNREACHABLE</span>   peering is non-transitive</pre>`),r=e(`<span class="c"># Route tables: each spoke sends the OTHER spoke's range to the appliance 10.0.1.4</span>
az network route-table create -g $RG -n rt-s1 --disable-bgp-route-propagation true
az network route-table route create -g $RG --route-table-name rt-s1 -n to-s2 --address-prefix 10.2.0.0/16 --next-hop-type VirtualAppliance --next-hop-ip-address 10.0.1.4
az network vnet subnet update -g $RG --vnet-name vnet-spoke1 -n sn-s1 --route-table rt-s1

az network route-table create -g $RG -n rt-s2 --disable-bgp-route-propagation true
az network route-table route create -g $RG --route-table-name rt-s2 -n to-s1 --address-prefix 10.1.0.0/16 --next-hop-type VirtualAppliance --next-hop-ip-address 10.0.1.4
az network vnet subnet update -g $RG --vnet-name vnet-spoke2 -n sn-s2 --route-table rt-s2

<span class="c"># TEST 2: routes exist, but the appliance does not forward yet, so it still FAILS</span>
az network watcher show-next-hop -g $RG --vm vm-s1 --source-ip 10.1.1.4 --dest-ip 10.2.1.4
az vm run-command invoke -g $RG -n vm-s1 --command-id RunShellScript --scripts "ping -c 2 -W 2 10.2.1.4 || echo UNREACHABLE"</pre>
<pre class="out">Illustrative output
NextHopType: <span class="hl">VirtualAppliance</span>   NextHopIpAddress: 10.0.1.4
<span class="hl">UNREACHABLE</span>   the NVA drops transit packets until forwarding is on (both switches)`),i=e(`<span class="c"># Switch 1: Azure NIC accepts packets not addressed to it</span>
az network nic update -g $RG -n nva1VMNic --ip-forwarding true

<span class="c"># Switch 2: the operating system routes between interfaces</span>
az vm run-command invoke -g $RG -n nva1 --command-id RunShellScript --scripts "sysctl -w net.ipv4.ip_forward=1; cat /proc/sys/net/ipv4/ip_forward"

<span class="c"># TEST 3: should work now, in both directions</span>
az vm run-command invoke -g $RG -n vm-s1 --command-id RunShellScript --scripts "ping -c 3 -W 2 10.2.1.4"
az vm run-command invoke -g $RG -n vm-s2 --command-id RunShellScript --scripts "ping -c 3 -W 2 10.1.1.4"
az network nic show-effective-route-table -g $RG -n vm-s1VMNic -o table</pre>
<pre class="out">Illustrative output
1
3 packets transmitted, 3 received, 0% packet loss
Source   State   Address Prefix   Next Hop Type      Next Hop IP
Default  Active  10.1.0.0/16      VnetLocal
Default  Active  10.0.0.0/16      VNetPeering
<span class="hl">User     Active  10.2.0.0/16      VirtualAppliance   10.0.1.4</span></pre>`),a=e(`<span class="c"># Optional: black-hole 198.51.100.0/24 with next hop None and read the route</span>
az network route-table route create -g $RG --route-table-name rt-s1 -n block-test --address-prefix 198.51.100.0/24 --next-hop-type None
az network nic show-effective-route-table -g $RG -n vm-s1VMNic -o table | grep 198.51.100

<span class="c"># Optional: remove the s2 return route to see the asymmetric/one-way symptom (restore it afterwards)</span>
az network route-table route delete -g $RG --route-table-name rt-s2 -n to-s1
az network route-table route create -g $RG --route-table-name rt-s2 -n to-s1 --address-prefix 10.1.0.0/16 --next-hop-type VirtualAppliance --next-hop-ip-address 10.0.1.4</pre>`),o=e(`az group delete -n $RG --yes --no-wait

<span class="c"># Prove it later</span>
az group exists -n $RG
az resource list --tag Project=nk-hub-lab -o table</pre>
<pre class="out">Illustrative output
false</pre>`),s={id:`guided-lab-udr-and-nva`,h:{en:`Guided lab: hub and spoke with UDRs and an appliance VM`,hi:`Guided lab: UDRs aur appliance VM ke saath hub and spoke`},body:{en:`
<h3>Goal</h3>
<p>Prove two key facts with your own hands. First: spokes peered only to a hub <b>cannot</b> reach each other (non-transitive). Second: UDRs plus an appliance with <b>IP forwarding</b> make spoke-to-spoke traffic work through the hub. You will use a small Linux VM as the appliance, not a paid firewall. Then <b>delete the resource group</b>.</p>

<div class="warn"><b>BILLING WARNING.</b> This lab uses three VMs. Do <b>not</b> replace the appliance VM with Azure Firewall or add a VPN gateway or Bastion: they bill hourly and are far more expensive than three small VMs. If you try Azure Firewall elsewhere, delete it in the same sitting.</div>

<h3>Prerequisites</h3>
<ul>
<li>A subscription and Azure CLI as in the previous lab; the peering chapter and the UDR chapters read first.</li>
<li>A budget alert already in place. About 50 minutes; cleanup in the same sitting.</li>
<li>A Bash shell (the loop in step 1 uses Bash; on PowerShell, run the commands one by one).</li>
</ul>

<h3>Honest estimated cost</h3>
<p>Three small VMs bill per hour plus managed disks per month; peering charges apply per GB (tiny here). <b>ASSUMED example</b>: 3 x 0.012 USD per hour for 2 hours is about 0.07 USD, plus a few cents of disk. Left for a month the VMs would be roughly 26 USD under the same assumptions. Replace with real rates (verify).</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Lab milestones">
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">The lab in five tests</text>
<rect x="8" y="38" width="118" height="50" rx="6" fill="#bae6fd"/><text x="67" y="58" text-anchor="middle" class="svg-ink" font-size="12">Peer hub to</text><text x="67" y="74" text-anchor="middle" class="svg-ink" font-size="12">both spokes</text>
<rect x="136" y="38" width="118" height="50" rx="6" fill="#fecaca"/><text x="195" y="58" text-anchor="middle" class="svg-ink" font-size="12">Test 1: s1 to s2</text><text x="195" y="74" text-anchor="middle" class="svg-ink" font-size="12">FAILS</text>
<rect x="264" y="38" width="118" height="50" rx="6" fill="#ddd6fe"/><text x="323" y="58" text-anchor="middle" class="svg-ink" font-size="12">Add UDRs</text><text x="323" y="74" text-anchor="middle" class="svg-ink" font-size="12">Test 2 FAILS</text>
<rect x="392" y="38" width="118" height="50" rx="6" fill="#fde68a"/><text x="451" y="58" text-anchor="middle" class="svg-ink" font-size="12">IP forwarding</text><text x="451" y="74" text-anchor="middle" class="svg-ink" font-size="12">NIC + OS</text>
<rect x="520" y="38" width="112" height="50" rx="6" fill="#bbf7d0"/><text x="576" y="58" text-anchor="middle" class="svg-ink" font-size="12">Test 3</text><text x="576" y="74" text-anchor="middle" class="svg-ink" font-size="12">WORKS</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">Failing tests are the point: they teach what each ingredient does</text>
</svg><p class="cap">Each failing test removes one missing ingredient: peering alone, then routes alone, then forwarding.</p></div>

<div class="note"><b>Portal wording</b> is from memory and changes often. Treat labels as unverified; the az commands are the reliable route. Portal route tables live under Route tables, Routes and Subnets; the NIC setting is under the NIC, IP configurations, Enable IP forwarding.</div>

<h3>Step 1: three VNets and three VMs</h3>
<p><b>Portal (unverified wording):</b> create nk-hub-rg, then vnet-hub 10.0.0.0/16 (subnet sn-hub 10.0.1.0/24), vnet-spoke1 10.1.0.0/16 (sn-s1 10.1.1.0/24), vnet-spoke2 10.2.0.0/16 (sn-s2 10.2.1.0/24), and one small Ubuntu VM in each subnet with no public IP and NIC NSG None. Make nva1 the hub VM with private IP 10.0.1.4.</p>
<p><b>CLI:</b></p>
`+t+`
<p>Wait for the VMs to finish creating (<code>az vm list -g $RG -d -o table</code>).</p>

<h3>Step 2: peer the hub with both spokes, then test</h3>
<p><b>Portal (unverified wording):</b> vnet-hub, Peerings, Add, to each spoke; in the dialogs enable "Allow forwarded traffic" on both sides.</p>
`+n+`
<h3>Step 3: add the UDRs</h3>
<p><b>Portal (unverified wording):</b> Route tables, Create rt-s1; Routes, Add: prefix 10.2.0.0/16, next hop type Virtual appliance, address 10.0.1.4. Subnets, Associate with vnet-spoke1/sn-s1. Repeat mirrored for rt-s2.</p>
`+r+`
<h3>Step 4: turn forwarding on (both switches) and retest</h3>
<p><b>Portal (unverified wording):</b> open nva1's network interface, IP configurations, tick Enable IP forwarding, Save. In the OS: <code>sysctl -w net.ipv4.ip_forward=1</code>.</p>
`+i+`
<h3>Step 5 (optional): black-hole and asymmetry experiments</h3>
`+a+`
<p>Note: the second experiment briefly breaks the return path; recreate the route right away as shown.</p>

<h3>Cleanup (mandatory)</h3>
`+o+`

<h3>What bills you: the trap list</h3>
<ul>
<li><b>Three VMs and disks</b> until the resource group is deleted.</li>
<li><b>Azure Firewall</b>: hourly deployment fee plus per GB, far above these three VMs; never leave it running.</li>
<li><b>VPN or ExpressRoute gateway</b> if you add transit later: hourly.</li>
<li><b>Bastion</b>: hourly; we avoid it with run-command.</li>
<li><b>Peering data transfer</b>: per GB; trivial here.</li>
</ul>

<div class="warn"><b>Common mistakes.</b> Enabling IP forwarding only on the NIC or only in the OS; forgetting to associate the route table; putting a UDR only on one spoke (asymmetric: replies bypass the appliance); forgetting allow-forwarded-traffic on the peering.</div>
<div class="exam"><b>Exam trap.</b> The appliance sits in the hub, but the UDRs live in the <b>spokes</b>. Nothing needs to change in the hub for spoke-to-spoke through it, other than forwarding.</div>

<div class="scn"><h4>Three tests, three lessons</h4><p>A trainee ran the lab and noted: Test 1 failed because peering is non-transitive; Test 2 failed because NIC forwarding was off; Test 3 passed after both switches. When asked in an interview how to troubleshoot spoke-to-spoke over an NVA, they listed exactly these three layers.</p><p><b>Lesson:</b> deliberately failing a lab teaches more than a green run.</p></div>

<div class="iv"><p class="q">"You added UDRs for spoke-to-spoke via the hub NVA but ping fails. What do you check?"</p><p>Next hop with Network Watcher (is the appliance IP right and the route Active?), IP forwarding on the NIC, IP forwarding in the OS, allow-forwarded-traffic on both peering links, NSGs on the NVA, and whether the reverse route exists in the other spoke.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hub-only peering does not connect spokes to each other.</li>
<li>UDRs in both spokes send the other spoke's range to the appliance.</li>
<li>The appliance needs IP forwarding on the Azure NIC and in the OS.</li>
<li>Peering links need allow-forwarded-traffic.</li>
<li>Delete the resource group and avoid hourly-billed services in practice.</li>
</ul></div>
`,hi:`
<h3>Goal</h3>
<p>Do key facts apne haathon se sabit karo. Pehla: sirf hub se peered spokes ek doosre tak <b>nahi</b> pahunch sakte (non-transitive). Doosra: UDRs aur <b>IP forwarding</b> wala appliance hub ke through spoke-to-spoke traffic chalate hain. Aap paid firewall nahi, chhota Linux VM appliance ki tarah use karoge. Phir <b>resource group delete</b> karoge.</p>

<div class="warn"><b>BILLING WARNING.</b> Is lab mein teen VMs hain. Appliance VM ko Azure Firewall se replace <b>mat</b> karo aur VPN gateway ya Bastion mat jodo: woh hourly bill karte hain aur teen chhote VMs se kaafi mehnge hain. Kahin aur Azure Firewall try karo to usi sitting mein delete karo.</div>

<h3>Prerequisites</h3>
<ul>
<li>Pichle lab jaisa subscription aur Azure CLI; peering chapter aur UDR chapters pehle padho.</li>
<li>Budget alert pehle se. Lagbhag 50 minute; cleanup usi sitting mein.</li>
<li>Bash shell (step 1 ka loop Bash use karta hai; PowerShell mein commands ek-ek karke chalao).</li>
</ul>

<h3>Imaandaar estimated cost</h3>
<p>Teen chhote VMs per hour plus managed disks per month bill karte hain; peering charges per GB lagte hain (yahan bahut kam). <b>ASSUMED example</b>: 2 ghante ke liye 3 x 0.012 USD per hour lagbhag 0.07 USD, plus disk ke kuch cents. Mahine bhar chhodo to wahi assumptions par VMs lagbhag 26 USD. Asli rates se badlo (verify).</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Lab milestones">
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">Lab paanch tests mein</text>
<rect x="8" y="38" width="118" height="50" rx="6" fill="#bae6fd"/><text x="67" y="58" text-anchor="middle" class="svg-ink" font-size="12">Hub ko dono</text><text x="67" y="74" text-anchor="middle" class="svg-ink" font-size="12">spokes se peer</text>
<rect x="136" y="38" width="118" height="50" rx="6" fill="#fecaca"/><text x="195" y="58" text-anchor="middle" class="svg-ink" font-size="12">Test 1: s1 se s2</text><text x="195" y="74" text-anchor="middle" class="svg-ink" font-size="12">FAIL</text>
<rect x="264" y="38" width="118" height="50" rx="6" fill="#ddd6fe"/><text x="323" y="58" text-anchor="middle" class="svg-ink" font-size="12">UDRs jodo</text><text x="323" y="74" text-anchor="middle" class="svg-ink" font-size="12">Test 2 FAIL</text>
<rect x="392" y="38" width="118" height="50" rx="6" fill="#fde68a"/><text x="451" y="58" text-anchor="middle" class="svg-ink" font-size="12">IP forwarding</text><text x="451" y="74" text-anchor="middle" class="svg-ink" font-size="12">NIC + OS</text>
<rect x="520" y="38" width="112" height="50" rx="6" fill="#bbf7d0"/><text x="576" y="58" text-anchor="middle" class="svg-ink" font-size="12">Test 3</text><text x="576" y="74" text-anchor="middle" class="svg-ink" font-size="12">CHALTA HAI</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">Fail hote tests hi point hain: woh sikhate hain har ingredient kya karta hai</text>
</svg><p class="cap">Har failing test ek missing ingredient dikhata hai: sirf peering, phir sirf routes, phir forwarding.</p></div>

<div class="note"><b>Portal wording</b> yaad se hai aur aksar badalta hai. Labels ko unverified maano; az commands bharosemand route hain. Portal mein route tables Route tables, Routes aur Subnets ke andar hoti hain; NIC setting NIC, IP configurations, Enable IP forwarding mein.</div>

<h3>Step 1: teen VNets aur teen VMs</h3>
<p><b>Portal (unverified wording):</b> nk-hub-rg banao, phir vnet-hub 10.0.0.0/16 (subnet sn-hub 10.0.1.0/24), vnet-spoke1 10.1.0.0/16 (sn-s1 10.1.1.0/24), vnet-spoke2 10.2.0.0/16 (sn-s2 10.2.1.0/24), aur har subnet mein ek chhota Ubuntu VM bina public IP aur NIC NSG None ke saath. nva1 ko hub VM banao, private IP 10.0.1.4.</p>
<p><b>CLI:</b></p>
`+t+`
<p>VMs ke ban jaane ka intezaar karo (<code>az vm list -g $RG -d -o table</code>).</p>

<h3>Step 2: hub ko dono spokes se peer karo, phir test</h3>
<p><b>Portal (unverified wording):</b> vnet-hub, Peerings, Add, har spoke ke liye; dialogs mein dono taraf "Allow forwarded traffic" enable karo.</p>
`+n+`
<h3>Step 3: UDRs jodo</h3>
<p><b>Portal (unverified wording):</b> Route tables, Create rt-s1; Routes, Add: prefix 10.2.0.0/16, next hop type Virtual appliance, address 10.0.1.4. Subnets, vnet-spoke1/sn-s1 se Associate karo. rt-s2 ke liye mirror karke dohrao.</p>
`+r+`
<h3>Step 4: forwarding on karo (dono switches) aur retest</h3>
<p><b>Portal (unverified wording):</b> nva1 ki network interface kholo, IP configurations, Enable IP forwarding tick karo, Save. OS mein: <code>sysctl -w net.ipv4.ip_forward=1</code>.</p>
`+i+`
<h3>Step 5 (optional): black-hole aur asymmetry experiments</h3>
`+a+`
<p>Dhyan: doosra experiment return path ko thodi der ke liye todta hai; dikhaye anusar route turant dobara banao.</p>

<h3>Cleanup (mandatory)</h3>
`+o+`

<h3>Kya bill karta hai: trap list</h3>
<ul>
<li>Resource group delete hone tak <b>teen VMs aur disks</b>.</li>
<li><b>Azure Firewall</b>: hourly deployment fee plus per GB, in teen VMs se kaafi upar; kabhi chalta mat chhodo.</li>
<li>Baad mein transit jodo to <b>VPN ya ExpressRoute gateway</b>: hourly.</li>
<li><b>Bastion</b>: hourly; run-command se hum ise avoid karte hain.</li>
<li><b>Peering data transfer</b>: per GB; yahan bahut kam.</li>
</ul>

<div class="warn"><b>Common mistakes.</b> IP forwarding sirf NIC par ya sirf OS mein on karna; route table associate karna bhool jaana; UDR sirf ek spoke par lagana (asymmetric: replies appliance ko bypass karti hain); peering par allow-forwarded-traffic bhool jaana.</div>
<div class="exam"><b>Exam trap.</b> Appliance hub mein hai, par UDRs <b>spokes</b> mein rehte hain. Hub mein forwarding ke alawa spoke-to-spoke ke liye kuch badalna nahi padta.</div>

<div class="scn"><h4>Teen tests, teen lessons</h4><p>Ek trainee ne lab chalaya aur note kiya: Test 1 fail hua kyunki peering non-transitive hai; Test 2 fail hua kyunki NIC forwarding off thi; Test 3 dono switches ke baad pass hua. Interview mein NVA ke upar spoke-to-spoke troubleshoot karne ka sawal aaya to unhone yahi teen layers gina diye.</p><p><b>Lesson:</b> jaanboojhkar fail karne wala lab green run se zyada sikhata hai.</p></div>

<div class="iv"><p class="q">"Aapne hub NVA ke through spoke-to-spoke ke liye UDRs jode par ping fail hai. Kya check karoge?"</p><p>Network Watcher se next hop (appliance IP sahi aur route Active?), NIC par IP forwarding, OS mein IP forwarding, dono peering links par allow-forwarded-traffic, NVA par NSGs, aur doosre spoke mein reverse route hai ya nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sirf hub se peering spokes ko ek doosre se nahi jodti.</li>
<li>Dono spokes ke UDRs doosre spoke ki range appliance ko bhejte hain.</li>
<li>Appliance ko Azure NIC aur OS dono mein IP forwarding chahiye.</li>
<li>Peering links ko allow-forwarded-traffic chahiye.</li>
<li>Resource group delete karo aur practice mein hourly-billed services se bacho.</li>
</ul></div>
`}};export{s as default};