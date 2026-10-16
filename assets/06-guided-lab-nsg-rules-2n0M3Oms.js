var e=`<svg viewBox="0 0 640 220" role="img" aria-label="Lab 1 design">
<rect x="10" y="10" width="620" height="200" rx="10" fill="#bae6fd"/><text x="24" y="32" class="svg-ink" font-size="13">rg-nk-lab: vnet-nk 10.10.0.0/16</text>
<rect x="30" y="50" width="280" height="140" rx="8" fill="#bbf7d0"/><text x="170" y="72" text-anchor="middle" class="svg-ink" font-size="13">snet-web 10.10.1.0/24</text>
<rect x="50" y="85" width="240" height="90" rx="6" fill="#fde68a"/><text x="170" y="108" text-anchor="middle" class="svg-ink" font-size="12">nsg-web (associated)</text><text x="170" y="128" text-anchor="middle" class="svg-muted" font-size="11">100 Allow TCP 443 from Internet</text><text x="170" y="146" text-anchor="middle" class="svg-muted" font-size="11">110 Allow TCP 22 from your IP /32</text><text x="170" y="164" text-anchor="middle" class="svg-muted" font-size="11">200 Deny everything else from Internet</text>
<rect x="340" y="50" width="270" height="140" rx="8" fill="#ddd6fe"/><text x="475" y="72" text-anchor="middle" class="svg-ink" font-size="13">ASGs (empty groups)</text><text x="475" y="110" text-anchor="middle" class="svg-ink" font-size="12">asg-web   asg-app</text><text x="475" y="135" text-anchor="middle" class="svg-muted" font-size="11">no VM yet, so nothing runs</text><text x="475" y="160" text-anchor="middle" class="svg-muted" font-size="11">NSG, ASG, VNet: all free objects</text>
</svg>`,t={id:`guided-lab-nsg-rules`,h:{en:`Guided lab 1 on your own Azure account: build an NSG, write rules and attach it to a subnet`,hi:`Guided lab 1 apne Azure account par: NSG banao, rules likho aur subnet se attach karo`},body:{en:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<h3>Goal</h3>
<p>Create an NSG with three custom rules, create two ASGs, attach the NSG to a subnet, list the rules including the defaults, and test what the priority numbers do. No VM is created, so there is almost nothing to pay.</p>

<h3>Prerequisites</h3>
<ul>
<li>The VNet module done, a budget alert set and <code>az account show</code> working.</li>
<li>Your own public IPv4 address from your internet provider's page or a search engine "what is my IP". In examples we show it as the documentation address 198.51.100.10. Use your own.</li>
<li>About 30 minutes.</li>
</ul>

<h3>Honest cost estimate</h3>
<p>Pricing structure: NSGs, ASGs, VNets and subnets are not billed (verify before publishing). No compute, disk, public IP or flow log is created, so as an assumed example the cost is zero. Confirm in Cost Management the next day.</p>

<div class="dia">`+e+`<p class="cap">A subnet protected by one NSG, plus two ASGs for later. Everything here is a free object.</p></div>

<h3>Steps</h3>
<p>Portal wording is from experience and may have moved (verify wording).</p>

<h4>Step 1. Base network</h4>
<pre class="code">az group create --name rg-nk-lab --location centralindia --tags purpose=lab owner=yourname
az network vnet create -g rg-nk-lab -n vnet-nk --location centralindia --address-prefixes 10.10.0.0/16 --subnet-name snet-web --subnet-prefixes 10.10.1.0/24</pre>

<h4>Step 2. Create the NSG</h4>
<p>Portal: Network security groups, Create, resource group rg-nk-lab, name nsg-web, Central India.</p>
<pre class="code">az network nsg create -g rg-nk-lab -n nsg-web --location centralindia</pre>

<h4>Step 3. Add three inbound rules</h4>
<p>Portal: open nsg-web, Inbound security rules, Add. Fill source, source port, destination, service or port, protocol, action, priority and name for each rule (verify wording).</p>
<pre class="code">az network nsg rule create -g rg-nk-lab --nsg-name nsg-web -n AllowHttps --priority 100 \\
  --direction Inbound --access Allow --protocol Tcp \\
  --source-address-prefixes Internet --source-port-ranges "*" \\
  --destination-address-prefixes "*" --destination-port-ranges 443

az network nsg rule create -g rg-nk-lab --nsg-name nsg-web -n AllowAdminSsh --priority 110 \\
  --direction Inbound --access Allow --protocol Tcp \\
  --source-address-prefixes 198.51.100.10/32 --source-port-ranges "*" \\
  --destination-address-prefixes "*" --destination-port-ranges 22

az network nsg rule create -g rg-nk-lab --nsg-name nsg-web -n DenyInternetAll --priority 200 \\
  --direction Inbound --access Deny --protocol "*" \\
  --source-address-prefixes Internet --source-port-ranges "*" \\
  --destination-address-prefixes "*" --destination-port-ranges "*"</pre>

<h4>Step 4. Attach the NSG to the subnet</h4>
<p>Portal: open nsg-web, Subnets, Associate, choose vnet-nk and snet-web.</p>
<pre class="code">az network vnet subnet update -g rg-nk-lab --vnet-name vnet-nk -n snet-web --network-security-group nsg-web</pre>

<h4>Step 5. Create two ASGs</h4>
<pre class="code">az network asg create -g rg-nk-lab -n asg-web --location centralindia
az network asg create -g rg-nk-lab -n asg-app --location centralindia
az network nsg rule create -g rg-nk-lab --nsg-name nsg-web -n AllowWebToApp --priority 300 \\
  --direction Inbound --access Allow --protocol Tcp \\
  --source-asgs asg-web --destination-asgs asg-app --source-port-ranges "*" --destination-port-ranges 8080</pre>
<p>If the CLI rejects the ASG rule (an ASG rule needs ASG names or IDs and may need a certain order), run <code>az network nsg rule create -h</code> and adjust (verify before publishing).</p>

<h3>Verification</h3>
<pre class="code">az network nsg rule list -g rg-nk-lab --nsg-name nsg-web --query "[].{name:name, pri:priority, access:access, src:sourceAddressPrefix, port:destinationPortRange}" --output table
az network nsg show -g rg-nk-lab -n nsg-web --query "defaultSecurityRules[].{name:name, pri:priority, dir:direction, access:access}" --output table
az network vnet subnet show -g rg-nk-lab --vnet-name vnet-nk -n snet-web --query networkSecurityGroup.id</pre>
<p>Illustrative output:</p>
<pre class="out">Name            Pri  Access  Src                Port
--------------  ---  ------  -----------------  ----
AllowHttps      100  Allow   Internet           443
AllowAdminSsh   110  Allow   198.51.100.10/32   22
DenyInternetAll 200  Deny    Internet           *
AllowWebToApp   300  Allow                      8080

Name                           Pri    Dir       Access
-----------------------------  -----  --------  ------
AllowVnetInBound               65000  Inbound   Allow
AllowAzureLoadBalancerInBound  65001  Inbound   Allow
<span class="hl">DenyAllInBound</span>                 65500  Inbound   Deny
...</pre>
<p>Break-it tests:</p>
<ol>
<li>Create another rule with priority 100. Azure rejects it because 100 is already used in the same direction.</li>
<li>Reason it through: a packet from the Internet to TCP 8080 first meets 100 (443, no), 110 (22, no), then 200 (Deny from Internet to anything): it is dropped before it would reach any later allow.</li>
<li>Change AllowWebToApp to priority 150 with <code>az network nsg rule update</code>. Now its position is before the deny. The source is asg-web, not Internet, so the deny never applied to it anyway; the point of the exercise is to see how position and match interact.</li>
</ol>

<h3>Mandatory cleanup</h3>
<pre class="code">az group delete --name rg-nk-lab --yes --no-wait
az group exists --name rg-nk-lab</pre>
<p>Wait for <code>false</code>. Cost Management check the next day.</p>

<h3>What bills you: trap list</h3>
<ul>
<li>Nothing in this lab bills. Lab 2 adds a VM, disk and a Standard public IP.</li>
<li><b>Flow logs</b> add storage and Traffic Analytics charges (verify), so do not enable them casually.</li>
<li><b>Azure Firewall</b>, <b>NAT Gateway</b> and <b>Bastion</b> bill hourly; this lab does not use them, but similar tutorials do.</li>
<li>Rules that allow management ports from Any can cost far more than money; do not leave them.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Using your office's public address with a /24 or a dynamic home address without noting it will change. If your provider changes your IP, you lock yourself out of SSH. Use the Cloud Shell, Bastion or update the rule.</p></div>

<div class="exam"><p><b>Exam trap.</b> You can associate one NSG with many subnets in the same region, but each subnet has only one NSG. Associating at the subnet level affects every NIC in it.</p></div>

<div class="scn"><h4>Locked out by a home IP change</h4><p>A learner restricted SSH to his home address. The next morning his ISP gave him a new address and SSH timed out. He opened the portal, edited the rule's source to his new IP, and was back in a minute. Later he moved to Bastion.</p><p><b>Lesson:</b> a narrow rule is good, but know how you will change it.</p></div>

<div class="iv"><p class="q">"How would you restrict SSH to a VM in Azure?"</p><p>Remove public SSH if possible and use Bastion or a VPN. If you must, allow TCP 22 only from known address ranges in the NSG, with a priority above the deny, and review it regularly. Mention just-in-time VM access in Defender for Cloud as an option (verify availability).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NSG, ASG, VNet and subnet are free objects; cost starts with VMs, IPs, firewalls and logs.</li>
<li>Rules need unique priorities per direction; the lowest number is checked first.</li>
<li>Attach one NSG per subnet and verify with az network vnet subnet show.</li>
<li>Defaults remain after your rules; DenyAllInBound is the final inbound rule.</li>
<li>Delete the group at the end and confirm.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<h3>Goal</h3>
<p>Teen custom rules wala NSG banao, do ASGs banao, NSG ko subnet se attach karo, defaults ke saath rules list karo, aur test karo ki priority numbers kya karte hain. Koi VM nahi banta, isliye pay karne ko lagbhag kuch nahi.</p>

<h3>Prerequisites</h3>
<ul>
<li>VNet module complete, budget alert set aur <code>az account show</code> chalta hai.</li>
<li>Aapka apna public IPv4 address, internet provider ke page se ya search engine "what is my IP" se. Examples mein hum ise documentation address 198.51.100.10 ke roop mein dikhate hain. Apna use karo.</li>
<li>Lagbhag 30 minute.</li>
</ul>

<h3>Honest cost estimate</h3>
<p>Pricing structure: NSGs, ASGs, VNets aur subnets bill nahi hote (verify before publishing). Koi compute, disk, public IP ya flow log nahi banta, isliye assumed example ke taur par cost zero hai. Agle din Cost Management mein confirm karo.</p>

<div class="dia">`+e+`<p class="cap">Ek NSG se protected subnet, plus baad ke liye do ASGs. Yahan sab kuch free object hai.</p></div>

<h3>Steps</h3>
<p>Portal wording experience se hai aur hil sakti hai (verify wording).</p>

<h4>Step 1. Base network</h4>
<pre class="code">az group create --name rg-nk-lab --location centralindia --tags purpose=lab owner=yourname
az network vnet create -g rg-nk-lab -n vnet-nk --location centralindia --address-prefixes 10.10.0.0/16 --subnet-name snet-web --subnet-prefixes 10.10.1.0/24</pre>

<h4>Step 2. NSG banao</h4>
<p>Portal: Network security groups, Create, resource group rg-nk-lab, naam nsg-web, Central India.</p>
<pre class="code">az network nsg create -g rg-nk-lab -n nsg-web --location centralindia</pre>

<h4>Step 3. Teen inbound rules add karo</h4>
<p>Portal: nsg-web kholo, Inbound security rules, Add. Har rule ke liye source, source port, destination, service ya port, protocol, action, priority aur naam bharo (verify wording).</p>
<pre class="code">az network nsg rule create -g rg-nk-lab --nsg-name nsg-web -n AllowHttps --priority 100 \\
  --direction Inbound --access Allow --protocol Tcp \\
  --source-address-prefixes Internet --source-port-ranges "*" \\
  --destination-address-prefixes "*" --destination-port-ranges 443

az network nsg rule create -g rg-nk-lab --nsg-name nsg-web -n AllowAdminSsh --priority 110 \\
  --direction Inbound --access Allow --protocol Tcp \\
  --source-address-prefixes 198.51.100.10/32 --source-port-ranges "*" \\
  --destination-address-prefixes "*" --destination-port-ranges 22

az network nsg rule create -g rg-nk-lab --nsg-name nsg-web -n DenyInternetAll --priority 200 \\
  --direction Inbound --access Deny --protocol "*" \\
  --source-address-prefixes Internet --source-port-ranges "*" \\
  --destination-address-prefixes "*" --destination-port-ranges "*"</pre>

<h4>Step 4. NSG ko subnet se attach karo</h4>
<p>Portal: nsg-web kholo, Subnets, Associate, vnet-nk aur snet-web chuno.</p>
<pre class="code">az network vnet subnet update -g rg-nk-lab --vnet-name vnet-nk -n snet-web --network-security-group nsg-web</pre>

<h4>Step 5. Do ASGs banao</h4>
<pre class="code">az network asg create -g rg-nk-lab -n asg-web --location centralindia
az network asg create -g rg-nk-lab -n asg-app --location centralindia
az network nsg rule create -g rg-nk-lab --nsg-name nsg-web -n AllowWebToApp --priority 300 \\
  --direction Inbound --access Allow --protocol Tcp \\
  --source-asgs asg-web --destination-asgs asg-app --source-port-ranges "*" --destination-port-ranges 8080</pre>
<p>Agar CLI ASG rule reject kare (ASG rule ko ASG names ya IDs chahiye aur kuch order ki zaroorat ho sakti hai), to <code>az network nsg rule create -h</code> chalao aur adjust karo (verify before publishing).</p>

<h3>Verification</h3>
<pre class="code">az network nsg rule list -g rg-nk-lab --nsg-name nsg-web --query "[].{name:name, pri:priority, access:access, src:sourceAddressPrefix, port:destinationPortRange}" --output table
az network nsg show -g rg-nk-lab -n nsg-web --query "defaultSecurityRules[].{name:name, pri:priority, dir:direction, access:access}" --output table
az network vnet subnet show -g rg-nk-lab --vnet-name vnet-nk -n snet-web --query networkSecurityGroup.id</pre>
<p>Illustrative output:</p>
<pre class="out">Name            Pri  Access  Src                Port
--------------  ---  ------  -----------------  ----
AllowHttps      100  Allow   Internet           443
AllowAdminSsh   110  Allow   198.51.100.10/32   22
DenyInternetAll 200  Deny    Internet           *
AllowWebToApp   300  Allow                      8080

Name                           Pri    Dir       Access
-----------------------------  -----  --------  ------
AllowVnetInBound               65000  Inbound   Allow
AllowAzureLoadBalancerInBound  65001  Inbound   Allow
<span class="hl">DenyAllInBound</span>                 65500  Inbound   Deny
...</pre>
<p>Break-it tests:</p>
<ol>
<li>Priority 100 ke saath ek aur rule banao. Azure reject karta hai kyunki 100 same direction mein pehle se use mein hai.</li>
<li>Soch ke dekho: Internet se TCP 8080 ka packet pehle 100 (443, nahi), 110 (22, nahi), phir 200 (Internet se kisi bhi tak Deny) se milta hai: woh kisi baad ke allow tak pahunchne se pehle drop ho jata hai.</li>
<li><code>az network nsg rule update</code> se AllowWebToApp ko priority 150 par karo. Ab uski position deny se pehle hai. Source asg-web hai, Internet nahi, isliye deny kabhi uspar lagta hi nahi tha; exercise ka point yeh dekhna hai ki position aur match kaise interact karte hain.</li>
</ol>

<h3>Mandatory cleanup</h3>
<pre class="code">az group delete --name rg-nk-lab --yes --no-wait
az group exists --name rg-nk-lab</pre>
<p><code>false</code> tak ruko. Agle din Cost Management check karo.</p>

<h3>Kya bill karta hai: trap list</h3>
<ul>
<li>Is lab mein kuch bill nahi hota. Lab 2 mein VM, disk aur Standard public IP add hote hain.</li>
<li><b>Flow logs</b> storage aur Traffic Analytics charges jodte hain (verify), isliye casually enable mat karo.</li>
<li><b>Azure Firewall</b>, <b>NAT Gateway</b> aur <b>Bastion</b> hourly bill karte hain; yeh lab unhe use nahi karta, lekin milte-julte tutorials karte hain.</li>
<li>Jo rules management ports ko Any se allow karte hain unki keemat paise se kaafi zyada ho sakti hai; unhe mat chhodo.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Office ka public address /24 ke saath ya dynamic home address use karna bina yeh note kiye ki woh badlega. Agar provider aapka IP badal de to aap SSH se bahar ho jaate ho. Cloud Shell, Bastion use karo ya rule update karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Ek NSG ko same region ke kai subnets se associate kar sakte ho, lekin har subnet ka sirf ek NSG hota hai. Subnet level par associate karne se uske har NIC par asar padta hai.</p></div>

<div class="scn"><h4>Home IP badalne se lockout</h4><p>Ek learner ne SSH ko apne home address tak restrict kiya. Agli subah ISP ne use naya address diya aur SSH time out hone laga. Usne portal kholkar rule ka source apne naye IP par edit kiya, aur ek minute mein wapas andar tha. Baad mein woh Bastion par chala gaya.</p><p><b>Lesson:</b> narrow rule achha hai, lekin jaano use badloge kaise.</p></div>

<div class="iv"><p class="q">"Azure mein VM tak SSH ko kaise restrict karoge?"</p><p>Jahan ho sake public SSH hatao aur Bastion ya VPN use karo. Agar zaroori ho to NSG mein TCP 22 sirf known address ranges se allow karo, deny se upar ki priority ke saath, aur regularly review karo. Defender for Cloud mein just-in-time VM access ko option ke roop mein batao (availability verify karo).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NSG, ASG, VNet aur subnet free objects hain; cost VMs, IPs, firewalls aur logs se shuru hoti hai.</li>
<li>Rules ko har direction mein unique priorities chahiye; sabse chhota number pehle check hota hai.</li>
<li>Har subnet ke liye ek NSG attach karo aur az network vnet subnet show se verify karo.</li>
<li>Aapke rules ke baad defaults rehte hain; DenyAllInBound aakhri inbound rule hai.</li>
<li>End mein group delete karo aur confirm karo.</li>
</ul></div>
`}};export{t as default};