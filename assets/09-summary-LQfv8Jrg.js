var e=`<svg viewBox="0 0 640 170" role="img" aria-label="Module summary map">
<rect x="10" y="20" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="13">Tenant</text>
<rect x="170" y="20" width="140" height="60" rx="8" fill="#bae6fd"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="13">Subscription</text>
<rect x="330" y="20" width="140" height="60" rx="8" fill="#fde68a"/><text x="400" y="55" text-anchor="middle" class="svg-ink" font-size="13">Resource group</text>
<rect x="490" y="20" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="55" text-anchor="middle" class="svg-ink" font-size="13">VNet + subnets</text>
<g stroke="#64748b" stroke-width="2"><line x1="150" y1="50" x2="170" y2="50"/><line x1="310" y1="50" x2="330" y2="50"/><line x1="470" y1="50" x2="490" y2="50"/></g>
<rect x="170" y="110" width="300" height="46" rx="8" fill="#e2e8f0"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="13">Budget alert first, delete the group last</text>
</svg>`,t={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>What you can now do</h3>
<div class="dia">`+e+`<p class="cap">The whole module on one line, with the safety habit around it.</p></div>
<ul>
<li>Explain tenant, management group, subscription, resource group and resource, and say which one is billed, which one is deleted together and which one holds identities.</li>
<li>Pick Central India or South India with a reason, and explain that VNets and subnets are regional while zones are chosen on VMs, disks and IPs.</li>
<li>Plan an RFC1918 address range without overlap and with space for gateway, Bastion and firewall subnets.</li>
<li>Use az login, az account show, az account set, az group create and az group delete, with --query and --output table.</li>
<li>Create a budget and alert before building, tag every lab, and delete the resource group at the end.</li>
<li>Run the two guided labs and triage a failed command with the seven checks.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Tenant</dt><dd>A Microsoft Entra ID directory of identities.</dd>
<dt>Subscription</dt><dd>Billing, quota and access container that trusts one tenant.</dd>
<dt>Management group</dt><dd>Container above subscriptions for policy and access at scale.</dd>
<dt>Resource group</dt><dd>Logical container for resources with a shared life cycle; delete it to delete its contents.</dd>
<dt>ARM</dt><dd>Azure Resource Manager, the deployment and management layer behind portal, CLI and templates.</dd>
<dt>Region / availability zone</dt><dd>A set of datacentres in an area / a physically separate location inside a region.</dd>
<dt>VNet / subnet</dt><dd>Regional private network / a range inside it.</dd>
<dt>RBAC / Policy / Lock</dt><dd>Who may act / what may exist / what cannot be deleted or changed.</dd>
<dt>Bicep</dt><dd>Readable language that compiles to ARM templates.</dd>
</dl>

<h3>Most tested facts</h3>
<ol>
<li>Hierarchy order: management group, subscription, resource group, resource.</li>
<li>A resource belongs to exactly one resource group; deleting the group deletes its resources.</li>
<li>A subscription trusts one tenant; a tenant can have many subscriptions.</li>
<li>VNets are regional. Azure subnets are regional, unlike AWS subnets which are per AZ.</li>
<li>Azure reserves 5 addresses per subnet; the first usable one is .4.</li>
<li>Budgets alert; they do not stop spending.</li>
<li>AuthorizationFailed is RBAC; RequestDisallowedByPolicy is Policy.</li>
<li>Tags do not automatically inherit unless a policy copies them (verify before publishing).</li>
</ol>

<h3>Command cheat-sheet</h3>
<pre class="code">az login
az account show --output table
az account list --output table
az account set --subscription "&lt;name-or-id&gt;"
az account list-locations --output table
az group create --name rg-nk-lab --location centralindia --tags purpose=lab
az network vnet create -g rg-nk-lab -n vnet-nk --address-prefixes 10.10.0.0/16 --subnet-name snet-web --subnet-prefixes 10.10.1.0/24
az network vnet subnet create -g rg-nk-lab --vnet-name vnet-nk -n snet-app --address-prefixes 10.10.2.0/24
az network vnet subnet list -g rg-nk-lab --vnet-name vnet-nk --output table
az group delete --name rg-nk-lab --yes --no-wait
az group exists --name rg-nk-lab</pre>

<h3>Items to verify before relying on them</h3>
<p>Free account amounts and durations; what happens when credit ends; Cloud Shell storage cost and options; region zone support and pairing; budget CLI support; portal menu wording. Always check the official Microsoft pages for current values.</p>

<div class="warn"><p><b>Common mistake.</b> Treating the module as finished once the lab works. The habit that matters is the last one: delete the group and check Cost Management the next day.</p></div>

<div class="exam"><p><b>Exam alignment.</b> This module supports AZ-900 (Azure architecture, regions, subscriptions, management groups, resource groups, Cost Management) and the foundations of AZ-700. It is not an exam-prep course; check the current skills outline.</p></div>

<div class="scn"><h4>The clean finish</h4><p>A batch of trainees each deployed the same lab in their own subscription. At the end the instructor asked everyone to run <code>az group exists</code> on the lab group. Three students got <code>true</code>: their deletes had been blocked by a lock they had added during practice. They removed the lock, deleted the group, and every student ended the day with an empty subscription.</p><p><b>Lesson:</b> verify the cleanup, do not assume it.</p></div>

<div class="iv"><p class="q">"Walk me through setting up a safe Azure lab from scratch."</p><p>Sign in with MFA, create a budget and email alert, pick a region such as Central India, create a tagged resource group, build in it using the CLI, verify, then delete the group and confirm in Cost Management the next day.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Know the hierarchy and what each level is for.</li>
<li>Budget first, tag everything, delete the group last.</li>
<li>VNets and subnets are regional in Azure.</li>
<li>Use the seven checks for every failure.</li>
<li>Next: virtual networks, subnets, system routes and public IPs.</li>
</ul></div>
`,hi:`
<h3>Ab aap kya kar sakte ho</h3>
<div class="dia">`+e+`<p class="cap">Poora module ek line mein, aur uske aas-paas ki safety aadat.</p></div>
<ul>
<li>Tenant, management group, subscription, resource group aur resource samjhao, aur batao kaun bill hota hai, kaun saath delete hota hai aur kaun identities rakhta hai.</li>
<li>Reason ke saath Central India ya South India chuno, aur samjhao ki VNets aur subnets regional hain jabki zones VMs, disks aur IPs par chune jaate hain.</li>
<li>Bina overlap ke aur gateway, Bastion aur firewall subnets ke liye jagah ke saath RFC1918 address range plan karo.</li>
<li>az login, az account show, az account set, az group create aur az group delete ko --query aur --output table ke saath use karo.</li>
<li>Build se pehle budget aur alert banao, har lab ko tag karo, aur end mein resource group delete karo.</li>
<li>Do guided labs chalao aur fail hui command ko saat checks se triage karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Tenant</dt><dd>Identities ki Microsoft Entra ID directory.</dd>
<dt>Subscription</dt><dd>Billing, quota aur access container jo ek tenant par trust karta hai.</dd>
<dt>Management group</dt><dd>Subscriptions ke upar ka container, scale par policy aur access ke liye.</dd>
<dt>Resource group</dt><dd>Same life cycle wale resources ka logical container; ise delete karo to contents delete ho jaate hain.</dd>
<dt>ARM</dt><dd>Azure Resource Manager, portal, CLI aur templates ke peeche ki deployment aur management layer.</dd>
<dt>Region / availability zone</dt><dd>Ek area ke datacentres ka set / region ke andar physically alag location.</dd>
<dt>VNet / subnet</dt><dd>Regional private network / uske andar ek range.</dd>
<dt>RBAC / Policy / Lock</dt><dd>Kaun act kare / kya exist kar sakta hai / kya delete ya change nahi ho sakta.</dd>
<dt>Bicep</dt><dd>Padhne mein aasaan language jo ARM templates mein compile hoti hai.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<ol>
<li>Hierarchy order: management group, subscription, resource group, resource.</li>
<li>Resource theek ek resource group ka hota hai; group delete karne se resources delete hote hain.</li>
<li>Subscription ek tenant par trust karti hai; tenant mein kai subscriptions ho sakti hain.</li>
<li>VNets regional hain. Azure subnets regional hain, AWS subnets ke ulat jo per AZ hote hain.</li>
<li>Azure har subnet mein 5 addresses reserve karta hai; pehla usable .4 hai.</li>
<li>Budgets alert karte hain; spending nahi rokte.</li>
<li>AuthorizationFailed matlab RBAC; RequestDisallowedByPolicy matlab Policy.</li>
<li>Tags apne aap inherit nahi hote jab tak policy copy na kare (verify before publishing).</li>
</ol>

<h3>Command cheat-sheet</h3>
<pre class="code">az login
az account show --output table
az account list --output table
az account set --subscription "&lt;name-or-id&gt;"
az account list-locations --output table
az group create --name rg-nk-lab --location centralindia --tags purpose=lab
az network vnet create -g rg-nk-lab -n vnet-nk --address-prefixes 10.10.0.0/16 --subnet-name snet-web --subnet-prefixes 10.10.1.0/24
az network vnet subnet create -g rg-nk-lab --vnet-name vnet-nk -n snet-app --address-prefixes 10.10.2.0/24
az network vnet subnet list -g rg-nk-lab --vnet-name vnet-nk --output table
az group delete --name rg-nk-lab --yes --no-wait
az group exists --name rg-nk-lab</pre>

<h3>Jin items ko rely karne se pehle verify karo</h3>
<p>Free account amounts aur durations; credit khatam hone par kya hota hai; Cloud Shell storage cost aur options; region zone support aur pairing; budget CLI support; portal menu wording. Current values ke liye hamesha official Microsoft pages check karo.</p>

<div class="warn"><p><b>Common mistake.</b> Lab chalte hi module khatam maan lena. Jo aadat matter karti hai woh aakhri hai: group delete karo aur agle din Cost Management check karo.</p></div>

<div class="exam"><p><b>Exam alignment.</b> Yeh module AZ-900 (Azure architecture, regions, subscriptions, management groups, resource groups, Cost Management) aur AZ-700 ki foundations ko support karta hai. Yeh exam-prep course nahi hai; current skills outline check karo.</p></div>

<div class="scn"><h4>Clean finish</h4><p>Trainees ke ek batch ne apni-apni subscription mein wahi lab deploy kiya. End mein instructor ne sabko lab group par <code>az group exists</code> chalane ko kaha. Teen students ko <code>true</code> mila: unke deletes ek lock ne block kiye the jo unhone practice ke dauran lagaya tha. Unhone lock hataya, group delete kiya, aur din ke end mein har student ki subscription khali thi.</p><p><b>Lesson:</b> cleanup verify karo, assume mat karo.</p></div>

<div class="iv"><p class="q">"Mujhe scratch se safe Azure lab setup karna samjhao."</p><p>MFA ke saath sign in, budget aur email alert banao, Central India jaisa region chuno, tagged resource group banao, CLI se usme build karo, verify karo, phir group delete karo aur agle din Cost Management mein confirm karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hierarchy aur har level ka kaam jaano.</li>
<li>Pehle budget, sab tag karo, group aakhir mein delete karo.</li>
<li>Azure mein VNets aur subnets regional hain.</li>
<li>Har failure ke liye saat checks use karo.</li>
<li>Agla: virtual networks, subnets, system routes aur public IPs.</li>
</ul></div>
`}};export{t as default};