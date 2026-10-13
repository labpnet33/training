var e=e=>`<pre class="code">`+e+(e.endsWith(`</pre>`)?``:`</pre>`),t=`<div class="note"><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.nwkings.com. Or use your own account: set a budget alert first and delete the resource group when you finish.</div>`,n=e(`<span class="c"># Variables (change the region to one close to you that has VM capacity)</span>
RG=nk-nat-rg
LOC=centralindia

<span class="c"># 1. Resource group, tagged so you can find leftovers</span>
az group create -n $RG -l $LOC --tags Project=nk-nat-lab

<span class="c"># 2. Virtual network with one subnet</span>
az network vnet create -g $RG -n nk-nat-vnet --address-prefixes 10.60.0.0/16 \\
  --subnet-name nk-nat-sn --subnet-prefixes 10.60.1.0/24`),r=e(`<span class="c"># 3. A VM with NO public IP and NO NSG-opening (image alias and size may need changing: verify availability)</span>
az vm create -g $RG -n nk-nat-app-1 --image Ubuntu2204 --size Standard_B1s \\
  --vnet-name nk-nat-vnet --subnet nk-nat-sn --public-ip-address "" \\
  --admin-username azureuser --generate-ssh-keys --private-ip-address 10.60.1.4

<span class="c"># Optional: make the subnet private so there is no implicit outbound path (flag depends on CLI version: verify)</span>
az network vnet subnet update -g $RG --vnet-name nk-nat-vnet -n nk-nat-sn --default-outbound false

<span class="c"># 4. Test BEFORE the NAT Gateway: run a command inside the VM through the Azure control plane</span>
az vm run-command invoke -g $RG -n nk-nat-app-1 --command-id RunShellScript \\
  --scripts "curl -s -m 10 ifconfig.me || echo NO-OUTBOUND"</pre>
<pre class="out">Illustrative output (the exact JSON wrapper differs)
<span class="hl">NO-OUTBOUND</span>   the subnet is private and has no outbound method yet`),i=e(`<span class="c"># 5. Standard, static public IP (billing starts when it exists)</span>
az network public-ip create -g $RG -n nk-nat-pip --sku Standard --allocation-method Static

<span class="c"># 6. NAT Gateway with that IP and a 10-minute idle timeout</span>
az network nat gateway create -g $RG -n nk-nat-gw --public-ip-addresses nk-nat-pip --idle-timeout 10

<span class="c"># 7. Attach the gateway to the subnet</span>
az network vnet subnet update -g $RG --vnet-name nk-nat-vnet -n nk-nat-sn --nat-gateway nk-nat-gw`),a=e(`<span class="c"># 8. Test again from inside the VM</span>
az vm run-command invoke -g $RG -n nk-nat-app-1 --command-id RunShellScript \\
  --scripts "curl -s -m 10 ifconfig.me"

<span class="c"># 9. Compare with the public IP of the NAT Gateway</span>
az network public-ip show -g $RG -n nk-nat-pip --query ipAddress -o tsv

<span class="c"># 10. Confirm the subnet association</span>
az network vnet subnet show -g $RG --vnet-name nk-nat-vnet -n nk-nat-sn --query natGateway.id -o tsv</pre>
<pre class="out">Illustrative output
(inside the VM)        <span class="hl">203.0.113.50</span>
(public-ip show)       <span class="hl">203.0.113.50</span>   same address: the internet sees the NAT Gateway, not app-1
(subnet natGateway)    /subscriptions/.../natGateways/nk-nat-gw</pre>`),o=e(`<span class="c"># Delete the WHOLE resource group: removes VM, disk, NIC, NAT Gateway, public IP, VNet</span>
az group delete -n $RG --yes --no-wait

<span class="c"># Wait a few minutes, then prove it is gone</span>
az group exists -n $RG
az resource list --tag Project=nk-nat-lab -o table
az network public-ip list --query "[?contains(name,'nk-nat')]" -o table</pre>
<pre class="out">Illustrative output
false</pre>`),s={id:`guided-lab-nat-gateway`,h:{en:`Guided lab on your own Azure account: build a NAT Gateway`,hi:`Apne Azure account par guided lab: NAT Gateway banao`},body:{en:`
`+t+`

<h3>Goal</h3>
<p>Build the architecture from chapter 4 for real: a virtual network with one private subnet, a VM with no public IP, a NAT Gateway with a Standard public IP attached to the subnet. You will prove that the VM first has no outbound path, then, after the NAT Gateway, that the IP the internet sees is the gateway's public IP. Then you will <b>delete the whole resource group</b>.</p>

<div class="warn"><b>BILLING WARNING.</b> A NAT Gateway and a Standard public IP bill <b>by the hour while they exist</b>, even with zero traffic. Stopping the VM does not stop them. Only deleting them does. Do not leave this lab overnight.</div>

<h3>Prerequisites</h3>
<ul>
<li>An Azure subscription where you can create resource groups, VMs and networking, and Azure CLI 2.x signed in (<code>az account show</code> works).</li>
<li>A <b>budget with an email alert</b> created first: Cost Management, Budgets (portal wording: verify). Do this before anything else.</li>
<li>About 40 minutes. Finish the cleanup in the same sitting.</li>
<li>No Bastion, no jump host: we run commands through <code>az vm run-command</code>, which avoids an extra hourly bill.</li>
</ul>

<h3>Honest estimated cost</h3>
<p>Azure NAT Gateway bills an hourly resource charge plus a charge per GB of data processed; the Standard public IP bills hourly; the small VM bills per hour and its disk per month. Current rates are on the Azure pricing pages and vary by region (verify before publishing). <b>Worked example with ASSUMED rates only</b> (0.045 USD per NAT Gateway hour, 0.045 USD per GB, 0.005 USD per public IP hour, 0.012 USD per VM hour): a 2-hour session with under 1 GB of traffic is about 0.09 + 0.045 + 0.01 + 0.024, roughly 0.17 USD. The same assumptions left running for a month give roughly 45 USD for the gateway alone. Replace these assumptions with real rates from the pricing calculator.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Order of creation">
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">Build order (left to right). Delete with one command: the resource group</text>
<rect x="8" y="40" width="96" height="40" rx="6" fill="#bae6fd"/><text x="56" y="64" text-anchor="middle" class="svg-ink" font-size="12">Resource group</text>
<rect x="114" y="40" width="96" height="40" rx="6" fill="#bae6fd"/><text x="162" y="64" text-anchor="middle" class="svg-ink" font-size="12">VNet + subnet</text>
<rect x="220" y="40" width="96" height="40" rx="6" fill="#bbf7d0"/><text x="268" y="64" text-anchor="middle" class="svg-ink" font-size="12">VM no PIP</text>
<rect x="326" y="40" width="96" height="40" rx="6" fill="#fde68a"/><text x="374" y="64" text-anchor="middle" class="svg-ink" font-size="12">Public IP</text>
<rect x="432" y="40" width="96" height="40" rx="6" fill="#fde68a"/><text x="480" y="64" text-anchor="middle" class="svg-ink" font-size="12">NAT Gateway</text>
<rect x="538" y="40" width="94" height="40" rx="6" fill="#ddd6fe"/><text x="585" y="64" text-anchor="middle" class="svg-ink" font-size="12">Attach, verify</text>
<text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="12">Cleanup: az group delete removes everything inside in the right order</text>
</svg><p class="cap">Azure lets you delete the resource group and handles dependency order itself: much simpler than AWS cleanup.</p></div>

<div class="note"><b>Portal wording</b> below is from memory and Azure changes the portal often. Treat labels as unverified and follow what you see on screen. The az commands are the reliable route.</div>

<h3>Steps 1 and 2: resource group, virtual network and subnet</h3>
<p><b>Portal (unverified wording):</b> Resource groups, Create, name nk-nat-rg, region of your choice, add tag Project = nk-nat-lab. Then Virtual networks, Create: same resource group, name nk-nat-vnet, IPv4 address space 10.60.0.0/16, subnet nk-nat-sn 10.60.1.0/24. Do not enable Bastion, Firewall or DDoS protection options during creation.</p>
<p><b>CLI:</b></p>
`+n+`
<h3>Steps 3 and 4: a private VM and a before-test</h3>
<p><b>Portal (unverified wording):</b> Virtual machines, Create, Azure virtual machine: resource group nk-nat-rg, name nk-nat-app-1, Ubuntu LTS, a small size, SSH key authentication. On the Networking tab select nk-nat-vnet and nk-nat-sn, set Public IP to None, and set the NIC network security group to Basic or None as you prefer (no inbound is needed). The VM Run command blade (Operations) lets you execute a shell script.</p>
<p><b>CLI:</b></p>
`+r+`
<p>This is the lesson hidden in the order: the VM is healthy, but until an explicit outbound method exists it cannot reach the internet (if your subnet still has the old implicit path, the test may succeed with an Azure-owned address; the optional private-subnet step removes it).</p>

<h3>Steps 5 to 7: public IP, NAT Gateway and the subnet association</h3>
<p><b>Portal (unverified wording):</b> Public IP addresses, Create: SKU Standard, assignment Static, name nk-nat-pip. NAT gateways, Create: name nk-nat-gw, TCP idle timeout 10 minutes, Outbound IP tab select nk-nat-pip, Subnet tab select nk-nat-vnet / nk-nat-sn. In the portal the association is made while creating the gateway.</p>
<p><b>CLI:</b></p>
`+i+`
<h3>Steps 8 to 10: verify</h3>
`+a+`
<p>If the result is blank or an error, wait two minutes (the association takes a moment) and try again. If it still fails, see the troubleshooting chapter.</p>

<h3>Cleanup (mandatory)</h3>
<p>Start now unless you continue directly to the next lab, which reuses this environment and ends with the same cleanup.</p>
`+o+`

<h3>What bills you: the trap list</h3>
<ul>
<li><b>NAT Gateway</b>: hourly while it exists, no traffic needed. Stopping or deallocating the VM does not help.</li>
<li><b>Standard public IP</b>: hourly whether attached or not, and Standard IPv4 addresses are billed (verify current rates). Public IP prefixes bill for every address in the block.</li>
<li><b>VM and its OS disk</b>: a deallocated VM still pays for its managed disk.</li>
<li><b>Data processed</b>: per GB through the NAT Gateway, including traffic to Azure services that could have used a private endpoint.</li>
<li><b>Azure Firewall and Application Gateway v2</b>: if you add them while experimenting, they bill hourly and are far more expensive. Never leave them running.</li>
<li><b>Forgotten second attempt</b>: a failed run in another region or resource group. Search by the tag Project and check each region you used.</li>
</ul>

<div class="warn"><b>Common mistakes.</b> Creating the public IP as Basic or in a different region from the gateway; deleting only the VM and leaving the gateway and IP running; forgetting <code>--no-wait</code> and thinking the terminal is hung; assuming ping to the internet proves NAT works.</div>
<div class="exam"><b>Exam trap.</b> "Which two actions give a subnet outbound NAT?" Create a NAT Gateway with a public IP, and associate it with the subnet. No route table is involved.</div>

<div class="scn"><h4>A weekend lab that cost a month</h4><p>A learner followed a tutorial, deallocated the VM on Friday evening and thought the lab was paused. The next invoice showed the NAT Gateway and public IP running for weeks. Their budget alert had never been created. Now they tag every resource with Project, keep one cleanup line per lab and always create the budget first.</p><p><b>Lesson:</b> deallocating a VM does not stop a NAT Gateway. Deleting the resource group does.</p></div>

<div class="iv"><p class="q">"How do you prove from inside a private VM that outbound traffic goes through the NAT Gateway?"</p><p>Request a what-is-my-IP service from the VM and compare the answer with the public IP attached to the NAT Gateway. They must match while the VM itself has no public IP. Use a TCP test, not ping.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build order: resource group, VNet and subnet, VM, Standard public IP, NAT Gateway, association.</li>
<li>Test before and after; compare the outside IP with the gateway's public IP.</li>
<li>Delete the whole resource group; confirm with <code>az group exists</code>.</li>
<li>Budget alert first, tags on everything, cleanup in the same sitting.</li>
</ul></div>
`,hi:`
`+t+`

<h3>Goal</h3>
<p>Chapter 4 ka architecture asli mein banao: ek private subnet wala virtual network, bina public IP ka VM, aur subnet se attached Standard public IP wala NAT Gateway. Aap sabit karoge ki pehle VM ke paas outbound path nahi hai, phir NAT Gateway ke baad internet ko jo IP dikhta hai woh gateway ka public IP hai. Phir aap <b>poora resource group delete</b> karoge.</p>

<div class="warn"><b>BILLING WARNING.</b> NAT Gateway aur Standard public IP jab tak exist karte hain <b>ghante ke hisaab se bill</b> karte hain, zero traffic par bhi. VM stop karne se yeh nahi rukte. Sirf delete karne se rukte hain. Is lab ko raat bhar mat chhodo.</div>

<h3>Prerequisites</h3>
<ul>
<li>Azure subscription jahan aap resource groups, VMs aur networking bana sako, aur Azure CLI 2.x sign-in ke saath (<code>az account show</code> chalta ho).</li>
<li>Pehle se bana <b>email alert wala budget</b>: Cost Management, Budgets (portal wording: verify). Yeh sabse pehle karo.</li>
<li>Lagbhag 40 minute. Cleanup usi sitting mein poora karo.</li>
<li>Bastion ya jump host nahi: hum commands <code>az vm run-command</code> se chalate hain, jisse extra hourly bill bachta hai.</li>
</ul>

<h3>Imaandaar estimated cost</h3>
<p>Azure NAT Gateway hourly resource charge plus per GB data processed bill karta hai; Standard public IP hourly bill hota hai; chhota VM per hour aur uski disk per month. Current rates Azure pricing pages par hain aur region ke saath badalte hain (publish karne se pehle verify karo). <b>Sirf ASSUMED rates ke saath worked example</b> (0.045 USD per NAT Gateway hour, 0.045 USD per GB, 0.005 USD per public IP hour, 0.012 USD per VM hour): 1 GB se kam traffic ke saath 2 ghante ka session lagbhag 0.09 + 0.045 + 0.01 + 0.024, yaani takriban 0.17 USD. Wahi assumptions mahine bhar chalne par akele gateway ke liye lagbhag 45 USD dete hain. In assumptions ko pricing calculator ke asli rates se badal do.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Banane ka order">
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">Build order (left se right). Delete ek command se: resource group</text>
<rect x="8" y="40" width="96" height="40" rx="6" fill="#bae6fd"/><text x="56" y="64" text-anchor="middle" class="svg-ink" font-size="12">Resource group</text>
<rect x="114" y="40" width="96" height="40" rx="6" fill="#bae6fd"/><text x="162" y="64" text-anchor="middle" class="svg-ink" font-size="12">VNet + subnet</text>
<rect x="220" y="40" width="96" height="40" rx="6" fill="#bbf7d0"/><text x="268" y="64" text-anchor="middle" class="svg-ink" font-size="12">VM no PIP</text>
<rect x="326" y="40" width="96" height="40" rx="6" fill="#fde68a"/><text x="374" y="64" text-anchor="middle" class="svg-ink" font-size="12">Public IP</text>
<rect x="432" y="40" width="96" height="40" rx="6" fill="#fde68a"/><text x="480" y="64" text-anchor="middle" class="svg-ink" font-size="12">NAT Gateway</text>
<rect x="538" y="40" width="94" height="40" rx="6" fill="#ddd6fe"/><text x="585" y="64" text-anchor="middle" class="svg-ink" font-size="12">Attach, verify</text>
<text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="12">Cleanup: az group delete andar ki sab cheezein sahi order mein hata deta hai</text>
</svg><p class="cap">Azure resource group delete karne deta hai aur dependency order khud sambhalta hai: AWS cleanup se kaafi aasaan.</p></div>

<div class="note"><b>Portal wording</b> neeche yaad se hai aur Azure portal aksar badalta hai. Labels ko unverified maano aur screen par jo dikhe wo follow karo. az commands bharosemand route hain.</div>

<h3>Step 1 aur 2: resource group, virtual network aur subnet</h3>
<p><b>Portal (unverified wording):</b> Resource groups, Create, name nk-nat-rg, apni pasand ka region, tag Project = nk-nat-lab jodo. Phir Virtual networks, Create: wahi resource group, name nk-nat-vnet, IPv4 address space 10.60.0.0/16, subnet nk-nat-sn 10.60.1.0/24. Creation ke dauran Bastion, Firewall ya DDoS protection options on mat karo.</p>
<p><b>CLI:</b></p>
`+n+`
<h3>Step 3 aur 4: private VM aur before-test</h3>
<p><b>Portal (unverified wording):</b> Virtual machines, Create, Azure virtual machine: resource group nk-nat-rg, name nk-nat-app-1, Ubuntu LTS, chhota size, SSH key authentication. Networking tab par nk-nat-vnet aur nk-nat-sn chuno, Public IP None karo, aur NIC network security group Basic ya None rakho (inbound ki zaroorat nahi). VM ka Run command blade (Operations) shell script chalane deta hai.</p>
<p><b>CLI:</b></p>
`+r+`
<p>Order mein chhupa lesson yeh hai: VM bilkul theek hai, par explicit outbound method ke bina woh internet tak nahi pahunch sakta (agar aapke subnet mein purana implicit path abhi bhi hai to test Azure-owned address ke saath succeed ho sakta hai; optional private-subnet step use hata deta hai).</p>

<h3>Step 5 se 7: public IP, NAT Gateway aur subnet association</h3>
<p><b>Portal (unverified wording):</b> Public IP addresses, Create: SKU Standard, assignment Static, name nk-nat-pip. NAT gateways, Create: name nk-nat-gw, TCP idle timeout 10 minute, Outbound IP tab mein nk-nat-pip chuno, Subnet tab mein nk-nat-vnet / nk-nat-sn chuno. Portal mein association gateway banate waqt hi ho jaata hai.</p>
<p><b>CLI:</b></p>
`+i+`
<h3>Step 8 se 10: verify</h3>
`+a+`
<p>Result khaali ya error ho to do minute ruko (association mein thoda waqt lagta hai) aur dobara try karo. Phir bhi fail ho to troubleshooting chapter dekho.</p>

<h3>Cleanup (mandatory)</h3>
<p>Ab shuru karo, jab tak aap seedha agle lab par na ja rahe ho, jo yahi environment dobara use karta hai aur wahi cleanup ke saath khatam hota hai.</p>
`+o+`

<h3>Kya bill karta hai: trap list</h3>
<ul>
<li><b>NAT Gateway</b>: jab tak exist karta hai ghante ke hisaab se, traffic ki zaroorat nahi. VM stop ya deallocate karne se madad nahi milti.</li>
<li><b>Standard public IP</b>: attached ho ya nahi ghante ke hisaab se, aur Standard IPv4 addresses bill hote hain (current rates verify karo). Public IP prefixes block ke har address ka bill dete hain.</li>
<li><b>VM aur uski OS disk</b>: deallocated VM bhi apni managed disk ka paisa deta hai.</li>
<li><b>Data processed</b>: NAT Gateway se guzre har GB ka, un Azure services ke traffic ka bhi jo private endpoint use kar sakta tha.</li>
<li><b>Azure Firewall aur Application Gateway v2</b>: experiment mein jodo to ghante ke hisaab se bill hote hain aur kaafi mehnge hain. Kabhi chalta mat chhodo.</li>
<li><b>Bhoola hua doosra attempt</b>: kisi aur region ya resource group mein fail hui koshish. Project tag se search karo aur jitne regions use kiye sab check karo.</li>
</ul>

<div class="warn"><b>Common mistakes.</b> Public IP ko Basic banana ya gateway se alag region mein banana; sirf VM delete karna aur gateway tatha IP chalte chhod dena; <code>--no-wait</code> bhool jaana aur terminal hung samajhna; maan lena ki internet ko ping NAT chalne ko prove karta hai.</div>
<div class="exam"><b>Exam trap.</b> "Subnet ko outbound NAT dene ke liye kaunse do kaam?" Public IP ke saath NAT Gateway banao, aur use subnet se associate karo. Route table involve nahi hota.</div>

<div class="scn"><h4>Weekend ka lab jo mahine bhar ka bill bana</h4><p>Ek learner ne tutorial follow kiya, Friday shaam VM deallocate kiya aur socha lab pause ho gaya. Agle invoice mein NAT Gateway aur public IP hafton chale dikhe. Budget alert kabhi bana hi nahi tha. Ab woh har resource par Project tag lagata hai, har lab ke liye cleanup ki ek line rakhta hai aur budget hamesha pehle banata hai.</p><p><b>Lesson:</b> VM deallocate karne se NAT Gateway nahi rukta. Resource group delete karne se rukta hai.</p></div>

<div class="iv"><p class="q">"Private VM ke andar se kaise sabit karoge ki outbound traffic NAT Gateway se ja raha hai?"</p><p>VM se what-is-my-IP service ko request bhejo aur jawab ko NAT Gateway se attached public IP se compare karo. Dono match hone chahiye jabki VM ke paas khud public IP nahi hai. TCP test use karo, ping nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build order: resource group, VNet aur subnet, VM, Standard public IP, NAT Gateway, association.</li>
<li>Pehle aur baad test karo; outside IP ko gateway ke public IP se compare karo.</li>
<li>Poora resource group delete karo; <code>az group exists</code> se confirm karo.</li>
<li>Pehle budget alert, har cheez par tags, cleanup usi sitting mein.</li>
</ul></div>
`}};export{s as default};