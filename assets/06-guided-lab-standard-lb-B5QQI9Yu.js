var e=e=>`<pre class="code">`+e+(e.endsWith(`</pre>`)?``:`</pre>`),t=`<div class="note"><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.nwkings.com. Or use your own account: set a budget alert first and delete the resource group when you finish.</div>`,n=e(`RG=nk-lb-rg
LOC=centralindia

<span class="c"># 1. Resource group (tagged), VNet with one subnet, and an NSG that allows TCP 80 (Standard LB is closed by default)</span>
az group create -n $RG -l $LOC --tags Project=nk-lb-lab
az network vnet create -g $RG -n nk-lb-vnet --address-prefixes 10.30.0.0/16 --subnet-name web-sn --subnet-prefixes 10.30.2.0/24
az network nsg create -g $RG -n nk-lb-nsg
az network nsg rule create -g $RG --nsg-name nk-lb-nsg -n allow-80 --priority 100 --access Allow --direction Inbound \\
  --protocol Tcp --source-address-prefixes Internet --destination-port-ranges 80
az network vnet subnet update -g $RG --vnet-name nk-lb-vnet -n web-sn --network-security-group nk-lb-nsg</pre>`),r=e(`<span class="c"># 2. Standard public IP and a Standard Load Balancer with frontend, pool, probe and rule</span>
az network public-ip create -g $RG -n nk-lb-pip --sku Standard --allocation-method Static
az network lb create -g $RG -n nk-lb --sku Standard --public-ip-address nk-lb-pip --frontend-ip-name fe --backend-pool-name be
az network lb probe create -g $RG --lb-name nk-lb -n hp80 --protocol tcp --port 80 --interval 5 --threshold 2
az network lb rule create -g $RG --lb-name nk-lb -n r80 --protocol tcp --frontend-port 80 --backend-port 80 \\
  --frontend-ip-name fe --backend-pool-name be --probe-name hp80 --idle-timeout 4

<span class="c"># 3. Show the objects you just built</span>
az network lb show -g $RG -n nk-lb --query "{sku:sku.name, frontends:frontendIpConfigurations[].name, pools:backendAddressPools[].name, rules:loadBalancingRules[].name, probes:probes[].name}"</pre>`),i=e(`<span class="c"># 4. cloud-init: install nginx and write a page that shows the VM name</span>
cat &gt; cloud-init.txt &lt;&lt;'EOF'
#cloud-config
package_update: true
packages:
  - nginx
runcmd:
  - echo "Hello from $(hostname)" &gt; /var/www/html/index.html
EOF

<span class="c"># 5. Two NICs placed directly into the backend pool, then two VMs on those NICs (no public IPs)</span>
for N in 1 2; do
  az network nic create -g $RG -n web-$N-nic --vnet-name nk-lb-vnet --subnet web-sn \\
    --lb-name nk-lb --lb-address-pools be --private-ip-address 10.30.2.$((3+N))
  az vm create -g $RG -n web-$N --image Ubuntu2204 --size Standard_B1s --nics web-$N-nic \\
    --custom-data cloud-init.txt --admin-username azureuser --generate-ssh-keys --no-wait
done
az vm wait -g $RG -n web-2 --created</pre>`),a=e(`<span class="c"># 6. Test from your own machine: new connections should reach both VMs</span>
IP=$(az network public-ip show -g $RG -n nk-lb-pip --query ipAddress -o tsv)
for i in 1 2 3 4 5 6 7 8; do curl -s -m 5 $IP; done</pre>
<pre class="out">Illustrative output (cloud-init can take 2 to 3 minutes after the VMs are created)
Hello from web-1
Hello from web-2
Hello from web-2
Hello from web-1
<span class="hl">Hello from web-2</span>   both names appear: the hash spreads new connections</pre>`),o=e(`<span class="c"># 7. Failover test: stop nginx on web-1, wait about 20 seconds, call again</span>
az vm run-command invoke -g $RG -n web-1 --command-id RunShellScript --scripts "systemctl stop nginx"
sleep 20
for i in 1 2 3 4 5 6; do curl -s -m 5 $IP; done

<span class="c"># 8. Read the probe health metric (metric name from memory: verify with list-definitions)</span>
LBID=$(az network lb show -g $RG -n nk-lb --query id -o tsv)
az monitor metrics list-definitions --resource $LBID --query "[].name.value" -o tsv
az monitor metrics list --resource $LBID --metric DipAvailability --interval PT1M --offset 15m -o table

<span class="c"># 9. Bring it back</span>
az vm run-command invoke -g $RG -n web-1 --command-id RunShellScript --scripts "systemctl start nginx"

<span class="c"># 10. Optional: sticky sessions by client IP, then repeat step 6 (expect one name only)</span>
az network lb rule update -g $RG --lb-name nk-lb -n r80 --load-distribution SourceIP</pre>
<pre class="out">Illustrative output
Hello from web-2
Hello from web-2
Hello from web-2   only web-2 answers while web-1 fails the probe</pre>`),s=e(`az group delete -n $RG --yes --no-wait

<span class="c"># Prove it later</span>
az group exists -n $RG
az resource list --tag Project=nk-lb-lab -o table
az network public-ip list --query "[?contains(name,'nk-lb')]" -o table</pre>
<pre class="out">Illustrative output
false</pre>`),c={id:`guided-lab-standard-lb`,h:{en:`Guided lab on your own Azure account: a Standard Load Balancer`,hi:`Apne Azure account par guided lab: Standard Load Balancer`},body:{en:`
`+t+`

<h3>Goal</h3>
<p>Build a public Standard Load Balancer in front of two web VMs, watch it spread new connections across both, then stop the web service on one VM and see the probe remove it from rotation. Finally <b>delete the resource group</b>.</p>

<div class="warn"><b>BILLING WARNING.</b> A Standard public IP and a Standard Load Balancer bill <b>by the hour while they exist</b> (the load balancer by its rules and by data processed; verify the structure), and the two VMs bill by the hour too. Stopping VMs does not stop the IP and the load balancer. Only deleting does. Do not leave this lab overnight.</div>

<h3>Prerequisites</h3>
<ul>
<li>An Azure subscription, Azure CLI 2.x signed in, a Bash shell (heredoc and loops are used; on PowerShell, adapt or use Azure Cloud Shell in Bash).</li>
<li>A <b>budget alert</b> already created. About 50 minutes. Finish cleanup in the same sitting.</li>
<li>Read the load-balancer chapter first (frontend, pool, probe, rule, NSG).</li>
</ul>

<h3>Honest estimated cost</h3>
<p>You pay for the Standard public IP (hourly), the Standard Load Balancer (an hourly charge tied to the number of rules plus a per-GB data processed charge; verify the structure on the pricing page), two small VMs (hourly) and their managed disks. <b>ASSUMED rates only</b>: 0.025 USD per load balancer hour, 0.005 USD per public IP hour, 0.012 USD per VM hour for two VMs. That is about 0.054 USD per hour, so a 2-hour lab is roughly 0.11 USD. The same assumptions over a forgotten month give roughly 39 USD. Replace them with real rates from the pricing calculator.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Lab architecture">
<rect x="10" y="60" width="90" height="50" rx="6" fill="#fed7aa"/><text x="55" y="90" text-anchor="middle" class="svg-ink" font-size="13">curl</text>
<rect x="130" y="40" width="170" height="90" rx="8" fill="#fde68a"/><text x="215" y="62" text-anchor="middle" class="svg-ink" font-size="13">Standard LB</text><text x="215" y="82" text-anchor="middle" class="svg-muted" font-size="12">public IP, port 80</text><text x="215" y="102" text-anchor="middle" class="svg-accent" font-size="12">probe TCP 80</text>
<rect x="360" y="20" width="270" height="130" rx="8" fill="#f1f5f9" stroke="#94a3b8"/><text x="495" y="40" text-anchor="middle" class="svg-muted" font-size="12">web-sn 10.30.2.0/24 + NSG allow 80</text>
<rect x="380" y="55" width="110" height="40" rx="6" fill="#bbf7d0"/><text x="435" y="80" text-anchor="middle" class="svg-ink" font-size="12">web-1 .4</text>
<rect x="500" y="55" width="110" height="40" rx="6" fill="#bbf7d0"/><text x="555" y="80" text-anchor="middle" class="svg-ink" font-size="12">web-2 .5</text>
<line x1="100" y1="85" x2="130" y2="85" stroke="#64748b" stroke-width="2"/><line x1="300" y1="85" x2="380" y2="75" stroke="#64748b" stroke-width="2"/><line x1="300" y1="90" x2="500" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="495" y="130" text-anchor="middle" class="svg-muted" font-size="12">Delete: az group delete removes all of it</text>
</svg><p class="cap">Everything lives in one resource group, so one command cleans it up.</p></div>

<div class="note"><b>Portal wording</b> below is from memory and Azure changes the portal often. Treat labels as unverified; the az commands are the reliable route.</div>

<h3>Step 1: network and NSG</h3>
<p><b>Portal (unverified wording):</b> create resource group nk-lb-rg (tag Project = nk-lb-lab). Virtual networks, Create nk-lb-vnet 10.30.0.0/16 with subnet web-sn 10.30.2.0/24. Network security groups, Create nk-lb-nsg, add an inbound rule: source Internet service tag, destination port 80, protocol TCP, allow, priority 100; associate it with web-sn.</p>
<p><b>CLI:</b></p>
`+n+`
<h3>Step 2: public IP and the Load Balancer</h3>
<p><b>Portal (unverified wording):</b> Load balancers, Create: SKU Standard, Type Public, Tier Regional, a new Standard static public IP nk-lb-pip, backend pool be, a health probe hp80 (TCP 80, 5 seconds) and a load-balancing rule r80 (TCP 80 to 80). The wizard may offer outbound rules: leave defaults.</p>
<p><b>CLI:</b></p>
`+r+`
<h3>Step 3: two web VMs placed in the pool</h3>
<p><b>Portal (unverified wording):</b> create two small Ubuntu VMs in web-sn, no public IP, and under Networking choose to place them behind the existing Standard load balancer with pool be. Paste the cloud-init text under Advanced, Custom data. Names web-1 and web-2.</p>
<p><b>CLI:</b> NICs are created inside the pool first so that the VMs have outbound access (through the rule's SNAT) while installing nginx.</p>
`+i+`
<h3>Steps 6 to 10: test, fail over, restore</h3>
`+a+`
`+o+`
<p>Why only one name with source IP affinity? The hash uses only client and destination IP, so all your connections go to one backend.</p>

<h3>Cleanup (mandatory)</h3>
<p>Do it now unless you go straight to the next lab, which uses its own resource group and its own cleanup.</p>
`+s+`

<h3>What bills you: the trap list</h3>
<ul>
<li><b>Standard public IP</b>: hourly, attached or not.</li>
<li><b>Standard Load Balancer</b>: hourly by rules plus per GB processed (verify).</li>
<li><b>VMs and disks</b>: stopped (deallocated) VMs still pay for disks.</li>
<li><b>NAT Gateway, Azure Firewall, Application Gateway v2, Bastion</b>: hourly and expensive; do not add them casually.</li>
<li><b>Forgotten resource groups</b> in other regions; search by tag Project.</li>
</ul>

<div class="warn"><b>Common mistakes.</b> No NSG allow rule (timeouts although everything is healthy); creating the VMs before the pool so cloud-init cannot reach the internet; testing from inside the VNet and expecting public-IP behaviour; leaving the lab running.</div>
<div class="exam"><b>Exam trap.</b> Standard Load Balancer plus Standard public IP: closed until an NSG allows traffic. Basic SKU is retired (verify) and is not available for new deployments.</div>

<div class="scn"><h4>The lab that never answered</h4><p>A learner followed the steps but skipped the NSG rule. Curl timed out and the pool showed healthy VMs. They checked the effective security rules and saw the default deny for Internet inbound. After adding the allow rule for TCP 80, answers arrived instantly.</p><p><b>Lesson:</b> Standard SKU is secure by default; the NSG is part of the design.</p></div>

<div class="iv"><p class="q">"How can you show that the load balancer removed an unhealthy VM?"</p><p>Stop the web service on one VM, wait a few probe intervals, and call the frontend repeatedly: only the healthy VM answers. The health probe metric also drops for the stopped VM. Restart the service and both answer again.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build order: network and NSG, public IP, load balancer, pool members, test.</li>
<li>A closed NSG is the most common reason for timeouts.</li>
<li>Stopping the service on one VM proves probe-based failover.</li>
<li>Source IP affinity makes one client stick to one VM.</li>
<li>Delete the resource group when you finish.</li>
</ul></div>
`,hi:`
`+t+`

<h3>Goal</h3>
<p>Do web VMs ke saamne public Standard Load Balancer banao, dekho ki woh naye connections dono mein baantta hai, phir ek VM par web service band karke dekho ki probe use rotation se hata deta hai. Aakhir mein <b>resource group delete</b> karo.</p>

<div class="warn"><b>BILLING WARNING.</b> Standard public IP aur Standard Load Balancer jab tak exist karte hain <b>ghante ke hisaab se bill</b> karte hain (load balancer apne rules aur data processed se; structure verify karo), aur do VMs bhi ghante se bill hote hain. VMs stop karne se IP aur load balancer nahi rukte. Sirf delete karne se rukte hain. Is lab ko raat bhar mat chhodo.</div>

<h3>Prerequisites</h3>
<ul>
<li>Azure subscription, Azure CLI 2.x sign-in ke saath, Bash shell (heredoc aur loops use hue hain; PowerShell par adapt karo ya Azure Cloud Shell Bash use karo).</li>
<li>Pehle se bana <b>budget alert</b>. Lagbhag 50 minute. Cleanup usi sitting mein poora karo.</li>
<li>Pehle load-balancer chapter padho (frontend, pool, probe, rule, NSG).</li>
</ul>

<h3>Imaandaar estimated cost</h3>
<p>Aap Standard public IP (hourly), Standard Load Balancer (rules ki sankhya se jude hourly charge plus per-GB data processed; pricing page par structure verify karo), do chhote VMs (hourly) aur unki managed disks ka paisa dete ho. <b>Sirf ASSUMED rates</b>: 0.025 USD per load balancer hour, 0.005 USD per public IP hour, do VMs ke liye 0.012 USD per VM hour. Yeh lagbhag 0.054 USD per hour hai, isliye 2 ghante ka lab lagbhag 0.11 USD. Wahi assumptions bhoole hue mahine par lagbhag 39 USD dete hain. Inhe pricing calculator ke asli rates se badal do.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Lab architecture">
<rect x="10" y="60" width="90" height="50" rx="6" fill="#fed7aa"/><text x="55" y="90" text-anchor="middle" class="svg-ink" font-size="13">curl</text>
<rect x="130" y="40" width="170" height="90" rx="8" fill="#fde68a"/><text x="215" y="62" text-anchor="middle" class="svg-ink" font-size="13">Standard LB</text><text x="215" y="82" text-anchor="middle" class="svg-muted" font-size="12">public IP, port 80</text><text x="215" y="102" text-anchor="middle" class="svg-accent" font-size="12">probe TCP 80</text>
<rect x="360" y="20" width="270" height="130" rx="8" fill="#f1f5f9" stroke="#94a3b8"/><text x="495" y="40" text-anchor="middle" class="svg-muted" font-size="12">web-sn 10.30.2.0/24 + NSG allow 80</text>
<rect x="380" y="55" width="110" height="40" rx="6" fill="#bbf7d0"/><text x="435" y="80" text-anchor="middle" class="svg-ink" font-size="12">web-1 .4</text>
<rect x="500" y="55" width="110" height="40" rx="6" fill="#bbf7d0"/><text x="555" y="80" text-anchor="middle" class="svg-ink" font-size="12">web-2 .5</text>
<line x1="100" y1="85" x2="130" y2="85" stroke="#64748b" stroke-width="2"/><line x1="300" y1="85" x2="380" y2="75" stroke="#64748b" stroke-width="2"/><line x1="300" y1="90" x2="500" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="495" y="130" text-anchor="middle" class="svg-muted" font-size="12">Delete: az group delete sab hata deta hai</text>
</svg><p class="cap">Sab kuch ek resource group mein hai, isliye ek command se cleanup.</p></div>

<div class="note"><b>Portal wording</b> neeche yaad se hai aur Azure portal aksar badalta hai. Labels ko unverified maano; az commands bharosemand route hain.</div>

<h3>Step 1: network aur NSG</h3>
<p><b>Portal (unverified wording):</b> resource group nk-lb-rg banao (tag Project = nk-lb-lab). Virtual networks, nk-lb-vnet 10.30.0.0/16 subnet web-sn 10.30.2.0/24 ke saath Create. Network security groups, nk-lb-nsg Create, inbound rule jodo: source Internet service tag, destination port 80, protocol TCP, allow, priority 100; ise web-sn se associate karo.</p>
<p><b>CLI:</b></p>
`+n+`
<h3>Step 2: public IP aur Load Balancer</h3>
<p><b>Portal (unverified wording):</b> Load balancers, Create: SKU Standard, Type Public, Tier Regional, naya Standard static public IP nk-lb-pip, backend pool be, health probe hp80 (TCP 80, 5 second) aur load-balancing rule r80 (TCP 80 se 80). Wizard outbound rules offer kar sakta hai: defaults rehne do.</p>
<p><b>CLI:</b></p>
`+r+`
<h3>Step 3: pool mein rakhe do web VMs</h3>
<p><b>Portal (unverified wording):</b> web-sn mein do chhote Ubuntu VMs banao, public IP nahi, aur Networking ke under maujooda Standard load balancer ke peeche pool be chuno. Advanced, Custom data ke under cloud-init text paste karo. Naam web-1 aur web-2.</p>
<p><b>CLI:</b> NICs pehle pool ke andar banaye jaate hain taaki nginx install karte waqt VMs ko (rule ke SNAT se) outbound access mile.</p>
`+i+`
<h3>Step 6 se 10: test, fail over, restore</h3>
`+a+`
`+o+`
<p>Source IP affinity ke saath sirf ek naam kyun? Hash sirf client aur destination IP use karta hai, isliye aapke saare connections ek backend ko jaate hain.</p>

<h3>Cleanup (mandatory)</h3>
<p>Ab karo, jab tak aap seedha agle lab par na ja rahe ho, jo apna resource group aur apna cleanup use karta hai.</p>
`+s+`

<h3>Kya bill karta hai: trap list</h3>
<ul>
<li><b>Standard public IP</b>: attached ho ya nahi hourly.</li>
<li><b>Standard Load Balancer</b>: rules ke hisaab se hourly plus per GB processed (verify).</li>
<li><b>VMs aur disks</b>: stopped (deallocated) VMs bhi disks ka paisa dete hain.</li>
<li><b>NAT Gateway, Azure Firewall, Application Gateway v2, Bastion</b>: hourly aur mehnge; yunhi mat jodo.</li>
<li>Doosre regions ke <b>bhoole hue resource groups</b>; Project tag se search karo.</li>
</ul>

<div class="warn"><b>Common mistakes.</b> NSG allow rule nahi (sab healthy hone par bhi timeouts); VMs ko pool se pehle banana taaki cloud-init internet tak na pahunch sake; VNet ke andar se test karke public-IP behaviour ki ummeed; lab ko chalta chhodna.</div>
<div class="exam"><b>Exam trap.</b> Standard Load Balancer plus Standard public IP: NSG traffic allow karne tak band. Basic SKU retire hai (verify) aur naye deployments ke liye available nahi.</div>

<div class="scn"><h4>Lab jo kabhi jawab nahi deta tha</h4><p>Ek learner ne steps follow kiye par NSG rule skip kiya. Curl timeout hua aur pool mein healthy VMs dikhe. Unhone effective security rules dekhe aur Internet inbound ka default deny dikha. TCP 80 ka allow rule jodne ke baad jawab turant aaye.</p><p><b>Lesson:</b> Standard SKU secure by default hai; NSG design ka hissa hai.</p></div>

<div class="iv"><p class="q">"Kaise dikhaoge ki load balancer ne unhealthy VM ko hata diya?"</p><p>Ek VM par web service band karo, kuch probe intervals ruko, aur frontend ko baar-baar call karo: sirf healthy VM jawab deta hai. Health probe metric bhi band VM ke liye gir jaata hai. Service restart karo to dono phir jawab dete hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build order: network aur NSG, public IP, load balancer, pool members, test.</li>
<li>Band NSG timeouts ki sabse common wajah hai.</li>
<li>Ek VM par service band karna probe-based failover sabit karta hai.</li>
<li>Source IP affinity ek client ko ek VM se chipka deti hai.</li>
<li>Khatam karne par resource group delete karo.</li>
</ul></div>
`}};export{c as default};