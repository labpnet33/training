var e=`<svg viewBox="0 0 640 230" role="img" aria-label="Lab 2 design">
<rect x="10" y="85" width="100" height="60" rx="8" fill="#e2e8f0"/><text x="60" y="112" text-anchor="middle" class="svg-ink" font-size="13">Your laptop</text><text x="60" y="130" text-anchor="middle" class="svg-muted" font-size="11">198.51.100.10</text>
<rect x="150" y="10" width="480" height="210" rx="10" fill="#bae6fd"/><text x="164" y="30" class="svg-ink" font-size="13">vnet-nk 10.10.0.0/16</text>
<rect x="170" y="45" width="280" height="160" rx="8" fill="#fde68a"/><text x="310" y="65" text-anchor="middle" class="svg-ink" font-size="13">nsg-web on snet-web</text>
<rect x="190" y="80" width="240" height="105" rx="6" fill="#bbf7d0"/><text x="310" y="102" text-anchor="middle" class="svg-ink" font-size="12">vm-web 10.10.1.4 (asg-web)</text><text x="310" y="122" text-anchor="middle" class="svg-muted" font-size="11">Standard public IP pip-web</text><text x="310" y="142" text-anchor="middle" class="svg-muted" font-size="11">22 allowed from your IP only</text><text x="310" y="162" text-anchor="middle" class="svg-muted" font-size="11">other Internet sources denied</text>
<rect x="470" y="80" width="150" height="105" rx="8" fill="#ddd6fe"/><text x="545" y="125" text-anchor="middle" class="svg-ink" font-size="12">Network Watcher</text><text x="545" y="145" text-anchor="middle" class="svg-muted" font-size="11">IP flow verify</text>
<line x1="110" y1="115" x2="190" y2="125" stroke="#64748b" stroke-width="2"/><text x="150" y="105" class="svg-accent" font-size="11">SSH ok</text>
</svg>`,t={id:`guided-lab-vm-ip-flow-verify`,h:{en:`Guided lab 2 on your own Azure account: protect a VM, test rules and read effective security rules`,hi:`Guided lab 2 apne Azure account par: VM protect karo, rules test karo aur effective security rules padho`},body:{en:`
<h3>Goal</h3>
<p>Put a small VM behind the subnet NSG from lab 1, prove that SSH works only from your address, ask Network Watcher which rule decides a flow, read the effective security rules of the NIC, and cause and fix a denied flow on purpose. Then delete everything within about an hour.</p>

<h3>Prerequisites</h3>
<ul>
<li>Lab 1 of this module and the VNet labs understood; a budget alert set.</li>
<li>An SSH client and your public IPv4 address (we write it as 198.51.100.10).</li>
<li>About 45 minutes.</li>
</ul>

<h3>Honest cost estimate</h3>
<p>Pricing structure: a VM bills while allocated, its OS disk bills while it exists and a Standard public IP bills hourly while it exists (verify before publishing). NSG, ASG, VNet and Network Watcher on-demand checks are not billed, though enabling logs would store data (we do not). As an <b>assumed example</b>, one hour of a small burstable Linux VM, disk and Standard IP costs a few US cents. Check the pricing calculator for your region first.</p>

<div class="dia">`+e+`<p class="cap">One VM, one NSG on the subnet, one ASG, and Network Watcher as the referee.</p></div>

<h3>Steps</h3>

<h4>Step 1. Base network and NSG</h4>
<pre class="code">az group create --name rg-nk-lab --location centralindia --tags purpose=lab owner=yourname delete-after=today
az network vnet create -g rg-nk-lab -n vnet-nk --location centralindia --address-prefixes 10.10.0.0/16 --subnet-name snet-web --subnet-prefixes 10.10.1.0/24
az network nsg create -g rg-nk-lab -n nsg-web --location centralindia
az network nsg rule create -g rg-nk-lab --nsg-name nsg-web -n AllowAdminSsh --priority 110 --direction Inbound --access Allow --protocol Tcp --source-address-prefixes 198.51.100.10/32 --source-port-ranges "*" --destination-address-prefixes "*" --destination-port-ranges 22
az network nsg rule create -g rg-nk-lab --nsg-name nsg-web -n DenyInternetAll --priority 200 --direction Inbound --access Deny --protocol "*" --source-address-prefixes Internet --source-port-ranges "*" --destination-address-prefixes "*" --destination-port-ranges "*"
az network vnet subnet update -g rg-nk-lab --vnet-name vnet-nk -n snet-web --network-security-group nsg-web</pre>
<p>Use your own address instead of 198.51.100.10.</p>

<h4>Step 2. Public IP, ASG and VM</h4>
<p>Portal: create the Standard public IP, the ASG and the VM, set NIC network security group to None because the subnet NSG already protects it (verify wording).</p>
<pre class="code">az network public-ip create -g rg-nk-lab -n pip-web --sku Standard --allocation-method Static --location centralindia
az network asg create -g rg-nk-lab -n asg-web --location centralindia
az vm create -g rg-nk-lab -n vm-web --image Ubuntu2204 --size Standard_B1s \\
  --vnet-name vnet-nk --subnet snet-web --public-ip-address pip-web --nsg "" \\
  --admin-username azureuser --generate-ssh-keys
az network nic ip-config list -g rg-nk-lab --nic-name vm-webVMNic --query "[].name" --output tsv</pre>
<p>Size, image alias and the empty NSG option can differ by CLI version and region (verify before publishing). Use the ip-configuration name returned by the last command (often <code>ipconfigvm-web</code>) in the next step:</p>
<pre class="code">az network nic ip-config update -g rg-nk-lab --nic-name vm-webVMNic -n ipconfigvm-web --application-security-groups asg-web</pre>

<h4>Step 3. Test the allowed flow</h4>
<pre class="code">az vm list-ip-addresses -g rg-nk-lab -n vm-web --output table
ssh azureuser@203.0.113.25</pre>
<p>Use your VM's real public address (203.0.113.25 is a documentation example). If SSH works, the allow rule at 110 is doing its job. If it does not, check that your public IP in the rule is current.</p>

<h4>Step 4. Ask the platform: IP flow verify</h4>
<p>Portal: Network Watcher, IP flow verify (verify wording).</p>
<pre class="code">az network watcher test-ip-flow -g rg-nk-lab --vm vm-web --direction Inbound --protocol TCP \\
  --local 10.10.1.4:22 --remote 198.51.100.10:50000
az network watcher test-ip-flow -g rg-nk-lab --vm vm-web --direction Inbound --protocol TCP \\
  --local 10.10.1.4:22 --remote 203.0.113.77:50000</pre>
<p>Illustrative output:</p>
<pre class="out">Access: <span class="hl">Allow</span>   RuleName: securityRules/AllowAdminSsh
Access: <span class="hl">Deny</span>    RuleName: securityRules/DenyInternetAll</pre>
<p>If the command fails because Network Watcher or its VM extension is not ready, the portal tool usually enables it for you, and it can take a minute (verify before publishing).</p>

<h4>Step 5. Read the effective security rules</h4>
<pre class="code">az network nic list-effective-nsg -g rg-nk-lab -n vm-webVMNic --query "value[].{nsg:networkSecurityGroup.id, rules:effectiveSecurityRules[].name}"</pre>
<p>You should see nsg-web listed through the subnet association and the rules AllowAdminSsh, DenyInternetAll and the defaults.</p>

<h4>Step 6. Break it and fix it</h4>
<ol>
<li>Add a Deny rule for TCP 22 from your address at priority 100. Run IP flow verify again for your source: the result is Deny and the rule name is the new one, because 100 is read before 110. SSH to a new session fails.</li>
<li>Delete that rule. Run the test again: Allow.</li>
</ol>
<pre class="code">az network nsg rule create -g rg-nk-lab --nsg-name nsg-web -n TempDeny --priority 100 --direction Inbound --access Deny --protocol Tcp --source-address-prefixes 198.51.100.10/32 --source-port-ranges "*" --destination-address-prefixes "*" --destination-port-ranges 22
az network nsg rule delete -g rg-nk-lab --nsg-name nsg-web -n TempDeny</pre>

<h3>Verification checklist</h3>
<ul>
<li>SSH works from your address and fails from elsewhere (IP flow verify shows Deny).</li>
<li>Effective security rules show the subnet NSG and both custom rules.</li>
<li>The temporary deny at priority 100 overrode the allow at 110, and deleting it restored access.</li>
</ul>

<h3>Mandatory cleanup</h3>
<pre class="code">az group delete --name rg-nk-lab --yes --no-wait
az group exists --name rg-nk-lab</pre>
<p>Wait for <code>false</code>. Check Cost Management tomorrow and look at the resource groups list for strays such as <code>NetworkWatcherRG</code> (Azure may create it; it contains the Network Watcher resource, which does not bill by itself; verify before publishing).</p>

<h3>What bills you: trap list</h3>
<ul>
<li><b>The VM</b> until deallocated; <b>the disk</b> and <b>the Standard public IP</b> until deleted (verify).</li>
<li><b>Flow logs and Traffic Analytics</b> if you turned them on.</li>
<li><b>Azure Firewall, Bastion, NAT Gateway</b> if you tried tutorials that add them.</li>
<li><b>Open SSH to the Internet</b> is a security cost, not a money cost; the lab does not leave it open.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Skipping the cleanup because the VM was "stopped". Stopping from inside the OS does not stop billing. Delete the group.</p></div>

<div class="exam"><p><b>Exam trap.</b> IP flow verify tests one specific 5-tuple and reports the matching rule; it does not prove the application works. Effective security rules combine NSGs from both subnet and NIC.</p></div>

<div class="scn"><h4>Access restored by deleting one rule</h4><p>During the practice, a trainee created a deny at priority 100 to see what would happen. His SSH session dropped on reconnect. IP flow verify named TempDeny as the matching rule. He deleted it and connected again in half a minute.</p><p><b>Lesson:</b> the tool that names the rule makes troubleshooting short.</p></div>

<div class="iv"><p class="q">"How do you prove which NSG rule blocks a connection?"</p><p>Use Network Watcher IP flow verify with the exact source, destination, port and protocol. It reports allow or deny and the rule name. Cross-check with effective security rules on the NIC and check both subnet and NIC NSGs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A subnet NSG protects every VM in the subnet.</li>
<li>IP flow verify names the deciding rule.</li>
<li>Effective security rules show the combined result.</li>
<li>A lower-numbered deny overrides a higher-numbered allow.</li>
<li>Delete the resource group to stop all billing.</li>
</ul></div>
`,hi:`
<h3>Goal</h3>
<p>Lab 1 ke subnet NSG ke peeche ek chhota VM rakho, prove karo ki SSH sirf aapke address se chalta hai, Network Watcher se pucho ki flow kaun sa rule decide karta hai, NIC ke effective security rules padho, aur jaan-boojh kar denied flow banao aur fix karo. Phir lagbhag ek ghante ke andar sab delete karo.</p>

<h3>Prerequisites</h3>
<ul>
<li>Is module ka lab 1 aur VNet labs samjhe hue; budget alert set.</li>
<li>SSH client aur aapka public IPv4 address (hum ise 198.51.100.10 likhte hain).</li>
<li>Lagbhag 45 minute.</li>
</ul>

<h3>Honest cost estimate</h3>
<p>Pricing structure: VM allocated rehne tak bill hota hai, uski OS disk jab tak exist karti hai bill hoti hai aur Standard public IP jab tak exist karta hai hourly bill hota hai (verify before publishing). NSG, ASG, VNet aur Network Watcher ke on-demand checks bill nahi hote, haalaanki logs enable karne par data store hota (hum nahi karte). <b>Assumed example</b> ke taur par, ek ghante ka chhota burstable Linux VM, disk aur Standard IP kuch US cents ka hota hai. Pehle apne region ka pricing calculator dekho.</p>

<div class="dia">`+e+`<p class="cap">Ek VM, subnet par ek NSG, ek ASG, aur referee ke roop mein Network Watcher.</p></div>

<h3>Steps</h3>

<h4>Step 1. Base network aur NSG</h4>
<pre class="code">az group create --name rg-nk-lab --location centralindia --tags purpose=lab owner=yourname delete-after=today
az network vnet create -g rg-nk-lab -n vnet-nk --location centralindia --address-prefixes 10.10.0.0/16 --subnet-name snet-web --subnet-prefixes 10.10.1.0/24
az network nsg create -g rg-nk-lab -n nsg-web --location centralindia
az network nsg rule create -g rg-nk-lab --nsg-name nsg-web -n AllowAdminSsh --priority 110 --direction Inbound --access Allow --protocol Tcp --source-address-prefixes 198.51.100.10/32 --source-port-ranges "*" --destination-address-prefixes "*" --destination-port-ranges 22
az network nsg rule create -g rg-nk-lab --nsg-name nsg-web -n DenyInternetAll --priority 200 --direction Inbound --access Deny --protocol "*" --source-address-prefixes Internet --source-port-ranges "*" --destination-address-prefixes "*" --destination-port-ranges "*"
az network vnet subnet update -g rg-nk-lab --vnet-name vnet-nk -n snet-web --network-security-group nsg-web</pre>
<p>198.51.100.10 ki jagah apna address use karo.</p>

<h4>Step 2. Public IP, ASG aur VM</h4>
<p>Portal: Standard public IP, ASG aur VM banao, NIC network security group None set karo kyunki subnet NSG pehle se protect karta hai (verify wording).</p>
<pre class="code">az network public-ip create -g rg-nk-lab -n pip-web --sku Standard --allocation-method Static --location centralindia
az network asg create -g rg-nk-lab -n asg-web --location centralindia
az vm create -g rg-nk-lab -n vm-web --image Ubuntu2204 --size Standard_B1s \\
  --vnet-name vnet-nk --subnet snet-web --public-ip-address pip-web --nsg "" \\
  --admin-username azureuser --generate-ssh-keys
az network nic ip-config list -g rg-nk-lab --nic-name vm-webVMNic --query "[].name" --output tsv</pre>
<p>Size, image alias aur khali NSG option CLI version aur region ke hisaab se alag ho sakte hain (verify before publishing). Aakhri command ka returned ip-configuration naam (aksar <code>ipconfigvm-web</code>) agle step mein use karo:</p>
<pre class="code">az network nic ip-config update -g rg-nk-lab --nic-name vm-webVMNic -n ipconfigvm-web --application-security-groups asg-web</pre>

<h4>Step 3. Allowed flow test karo</h4>
<pre class="code">az vm list-ip-addresses -g rg-nk-lab -n vm-web --output table
ssh azureuser@203.0.113.25</pre>
<p>Apne VM ka asli public address use karo (203.0.113.25 documentation example hai). Agar SSH chalta hai to 110 ka allow rule apna kaam kar raha hai. Agar nahi, to check karo ki rule mein aapka public IP current hai.</p>

<h4>Step 4. Platform se pucho: IP flow verify</h4>
<p>Portal: Network Watcher, IP flow verify (verify wording).</p>
<pre class="code">az network watcher test-ip-flow -g rg-nk-lab --vm vm-web --direction Inbound --protocol TCP \\
  --local 10.10.1.4:22 --remote 198.51.100.10:50000
az network watcher test-ip-flow -g rg-nk-lab --vm vm-web --direction Inbound --protocol TCP \\
  --local 10.10.1.4:22 --remote 203.0.113.77:50000</pre>
<p>Illustrative output:</p>
<pre class="out">Access: <span class="hl">Allow</span>   RuleName: securityRules/AllowAdminSsh
Access: <span class="hl">Deny</span>    RuleName: securityRules/DenyInternetAll</pre>
<p>Agar command isliye fail ho ki Network Watcher ya uska VM extension ready nahi hai, to portal tool aam taur par use aapke liye enable kar deta hai, aur ek minute lag sakta hai (verify before publishing).</p>

<h4>Step 5. Effective security rules padho</h4>
<pre class="code">az network nic list-effective-nsg -g rg-nk-lab -n vm-webVMNic --query "value[].{nsg:networkSecurityGroup.id, rules:effectiveSecurityRules[].name}"</pre>
<p>Aapko subnet association ke zariye nsg-web listed dikhna chahiye aur rules AllowAdminSsh, DenyInternetAll aur defaults.</p>

<h4>Step 6. Todo aur fix karo</h4>
<ol>
<li>Priority 100 par apne address se TCP 22 ka Deny rule add karo. Apne source ke liye IP flow verify dobara chalao: result Deny hai aur rule ka naam naya wala hai, kyunki 100 110 se pehle padha jata hai. Naye session mein SSH fail hota hai.</li>
<li>Woh rule delete karo. Test dobara chalao: Allow.</li>
</ol>
<pre class="code">az network nsg rule create -g rg-nk-lab --nsg-name nsg-web -n TempDeny --priority 100 --direction Inbound --access Deny --protocol Tcp --source-address-prefixes 198.51.100.10/32 --source-port-ranges "*" --destination-address-prefixes "*" --destination-port-ranges 22
az network nsg rule delete -g rg-nk-lab --nsg-name nsg-web -n TempDeny</pre>

<h3>Verification checklist</h3>
<ul>
<li>SSH aapke address se chalta hai aur doosri jagah se fail hota hai (IP flow verify Deny dikhata hai).</li>
<li>Effective security rules subnet NSG aur dono custom rules dikhate hain.</li>
<li>Priority 100 ke temporary deny ne 110 ke allow ko override kiya, aur use delete karne se access wapas aaya.</li>
</ul>

<h3>Mandatory cleanup</h3>
<pre class="code">az group delete --name rg-nk-lab --yes --no-wait
az group exists --name rg-nk-lab</pre>
<p><code>false</code> tak ruko. Kal Cost Management check karo aur resource groups ki list mein <code>NetworkWatcherRG</code> jaise strays dekho (Azure ise bana sakta hai; usme Network Watcher resource hota hai, jo khud bill nahi karta; verify before publishing).</p>

<h3>Kya bill karta hai: trap list</h3>
<ul>
<li><b>VM</b> deallocate hone tak; <b>disk</b> aur <b>Standard public IP</b> delete hone tak (verify).</li>
<li><b>Flow logs aur Traffic Analytics</b> agar aapne on kiye.</li>
<li><b>Azure Firewall, Bastion, NAT Gateway</b> agar aapne aise tutorials try kiye jo unhe add karte hain.</li>
<li><b>Internet ke liye open SSH</b> security cost hai, paise ki nahi; lab use open nahi chhodta.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Cleanup chhodna kyunki VM "stopped" tha. OS ke andar se stop karne se billing nahi rukti. Group delete karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> IP flow verify ek specific 5-tuple test karta hai aur matching rule batata hai; yeh prove nahi karta ki application chalti hai. Effective security rules subnet aur NIC dono ke NSGs ko jodte hain.</p></div>

<div class="scn"><h4>Ek rule delete karne se access wapas</h4><p>Practice ke dauran ek trainee ne dekhne ke liye priority 100 par deny banaya. Reconnect par uska SSH session gir gaya. IP flow verify ne TempDeny ko matching rule bataya. Usne use delete kiya aur aadhe minute mein dobara connect ho gaya.</p><p><b>Lesson:</b> jo tool rule ka naam batata hai woh troubleshooting chhoti kar deta hai.</p></div>

<div class="iv"><p class="q">"Kaun sa NSG rule connection block kar raha hai yeh kaise prove karoge?"</p><p>Exact source, destination, port aur protocol ke saath Network Watcher IP flow verify use karo. Woh allow ya deny aur rule ka naam batata hai. NIC ke effective security rules se cross-check karo aur subnet aur NIC dono NSGs check karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Subnet NSG subnet ke har VM ko protect karta hai.</li>
<li>IP flow verify decide karne wale rule ka naam batata hai.</li>
<li>Effective security rules combined result dikhate hain.</li>
<li>Chhote number ka deny bade number ke allow ko override karta hai.</li>
<li>Saari billing rokne ke liye resource group delete karo.</li>
</ul></div>
`}};export{t as default};