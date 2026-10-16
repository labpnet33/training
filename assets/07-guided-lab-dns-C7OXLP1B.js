var e=`<svg viewBox="0 0 640 250" role="img" aria-label="Guided lab 2 layout: hub VNet with DNS Private Resolver and private zone, office VNet with a DNS server VM, peering standing in for the VPN">
<rect x="15" y="25" width="360" height="185" rx="12" fill="#ddd6fe" stroke="#64748b"/><text x="195" y="47" text-anchor="middle" class="svg-ink" font-size="13">hub-vnet 10.0.0.0/16</text>
<rect x="30" y="62" width="160" height="50" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="110" y="82" text-anchor="middle" class="svg-ink" font-size="12">inbound 10.0.7.4</text><text x="110" y="98" text-anchor="middle" class="svg-muted" font-size="10">subnet dns-in 10.0.7.0/28</text>
<rect x="200" y="62" width="160" height="50" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="280" y="82" text-anchor="middle" class="svg-ink" font-size="12">outbound endpoint</text><text x="280" y="98" text-anchor="middle" class="svg-muted" font-size="10">subnet dns-out 10.0.8.0/28</text>
<rect x="30" y="125" width="160" height="50" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="110" y="145" text-anchor="middle" class="svg-ink" font-size="12">vm-hub 10.0.3.4</text><text x="110" y="161" text-anchor="middle" class="svg-muted" font-size="10">zone lab.example</text>
<rect x="200" y="125" width="160" height="50" rx="8" fill="#fde68a" stroke="#64748b"/><text x="280" y="145" text-anchor="middle" class="svg-ink" font-size="12">ruleset: corp.example</text><text x="280" y="161" text-anchor="middle" class="svg-muted" font-size="10">forwards to 192.168.1.4</text>
<rect x="435" y="25" width="190" height="185" rx="12" fill="#e2e8f0" stroke="#64748b"/><text x="530" y="47" text-anchor="middle" class="svg-ink" font-size="13">office-vnet 192.168.0.0/16</text>
<rect x="450" y="80" width="160" height="50" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="530" y="100" text-anchor="middle" class="svg-ink" font-size="12">vm-office dnsmasq</text><text x="530" y="116" text-anchor="middle" class="svg-muted" font-size="10">192.168.1.4</text>
<line x1="375" y1="105" x2="435" y2="105" stroke="#2563eb" stroke-width="3"/><text x="405" y="97" text-anchor="middle" class="svg-accent" font-size="9">peering</text>
<text x="320" y="238" text-anchor="middle" class="svg-ink" font-size="12">Peering stands in for the VPN. Resolver endpoints bill hourly: delete the same day</text>
</svg>`,t={id:`guided-lab-dns`,h:{en:`Guided lab on your own Azure account: DNS Private Resolver`,hi:`Apne Azure account par guided lab: DNS Private Resolver`},body:{en:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<div class="warn"><p><b>Billed lab.</b> Private Resolver endpoints bill <b>every hour they exist</b>. Use a <b>free-credit account</b> if you can, finish <b>the same day</b>, and <b>delete the resource group</b> at the end. This lab is much cheaper and quicker than the VPN lab, but it is not free.</p></div>

<h3>Goal</h3>
<p>Prove hybrid DNS in both directions without a VPN. VNet peering will stand in for the VPN, and a small Linux VM in <code>office-vnet</code> (192.168.0.0/16) will play the on-premises DNS server. You will check: (1) a hub VM resolves <code>files.corp.example</code> through a forwarding rule to the office DNS; (2) the office VM resolves <code>app.lab.example</code> from an Azure Private DNS zone through the resolver's inbound endpoint.</p>
<div class="dia">`+e+`<p class="cap">What you will build. Region: centralindia. Endpoint subnets are delegated to Microsoft.Network/dnsResolvers.</p></div>

<h3>Prerequisites</h3>
<ul>
<li>An Azure subscription (free credits recommended), Azure CLI or Cloud Shell. The resolver commands may need <code>az extension add -n dns-resolver</code> (verify before publishing).</li>
<li>Quota for two small VMs. The office VM installs dnsmasq from the internet, so it needs outbound access (default outbound access or a public IP; verify what your subscription allows before publishing).</li>
<li>About 60 to 90 minutes.</li>
</ul>
<div class="note"><p><b>Portal wording</b> was written from familiarity and <b>not re-verified</b>. DNS resolver CLI parameters differ by extension version; confirm with <code>--help</code> (verify before publishing).</p></div>

<h3>Honest cost</h3>
<p>How you are billed (read the current Azure DNS pricing page first): the Private Resolver bills <b>per hour for each endpoint</b> and per million queries; Private DNS zones bill per zone per month plus queries; VMs and disks bill per hour. <b>Every number here is ASSUMED for illustration</b>: <b>assumed</b> $0.20 per endpoint-hour, <b>assumed</b> $0.50 per zone-month, <b>assumed</b> $0.02 per VM-hour, query charges negligible.</p>
<div class="eg"><p><b>Worked example (assumed rates).</b> Two endpoints for 3 hours: 2 x 3 x $0.20 = <b>$1.20</b>. One zone for a day: about $0.02. Two VMs for 3 hours: $0.12. Total about <b>$1.35</b>.</p></div>
<div class="warn"><p><b>Loud warning.</b> With the same assumed rate, two forgotten endpoints cost 2 x 24 x $0.20 = <b>$9.60 per day</b> and about 2 x 730 x $0.20 = <b>$292 per month</b>. Set a phone reminder for the cleanup now.</p></div>

<h3>Step 0: budget alert</h3>
<p>Cost Management, Budgets, Add; small amount, alert at 80 percent (labels unverified). Alerts lag; a safety net only.</p>

<h3>Step 1: networks, delegated subnets, peering</h3>
<p><b>Portal:</b> two virtual networks; in the hub add subnets dns-in 10.0.7.0/28 and dns-out 10.0.8.0/28, and under Subnet delegation choose Microsoft.Network/dnsResolvers for both. Then peer the VNets (both sides).</p>
<pre class="code">az group create -n rg-nk-dns -l centralindia
az network vnet create -g rg-nk-dns -n hub-vnet --address-prefixes 10.0.0.0/16 --subnet-name workload --subnet-prefixes 10.0.3.0/24
az network vnet subnet create -g rg-nk-dns --vnet-name hub-vnet -n dns-in --address-prefixes 10.0.7.0/28 --delegations Microsoft.Network/dnsResolvers
az network vnet subnet create -g rg-nk-dns --vnet-name hub-vnet -n dns-out --address-prefixes 10.0.8.0/28 --delegations Microsoft.Network/dnsResolvers
az network vnet create -g rg-nk-dns -n office-vnet --address-prefixes 192.168.0.0/16 --subnet-name servers --subnet-prefixes 192.168.1.0/24
az network vnet peering create -g rg-nk-dns -n hub-to-office --vnet-name hub-vnet --remote-vnet office-vnet --allow-vnet-access
az network vnet peering create -g rg-nk-dns -n office-to-hub --vnet-name office-vnet --remote-vnet hub-vnet --allow-vnet-access</pre>

<h3>Step 2: two small VMs, and the office DNS server</h3>
<pre class="code">az vm create -g rg-nk-dns -n vm-hub --image Ubuntu2204 --size Standard_B1s --vnet-name hub-vnet --subnet workload --public-ip-address "" --nsg "" --admin-username azureuser --generate-ssh-keys
az vm create -g rg-nk-dns -n vm-office --image Ubuntu2204 --size Standard_B1s --vnet-name office-vnet --subnet servers --public-ip-address "" --nsg "" --admin-username azureuser --generate-ssh-keys
az vm run-command invoke -g rg-nk-dns -n vm-office --command-id RunShellScript --scripts "apt-get update -y &amp;&amp; apt-get install -y dnsmasq &amp;&amp; echo 'address=/files.corp.example/192.168.1.20' &gt; /etc/dnsmasq.d/corp.conf &amp;&amp; echo 'listen-address=192.168.1.4' &gt;&gt; /etc/dnsmasq.d/corp.conf &amp;&amp; systemctl restart dnsmasq"</pre>
<p>Expect addresses 10.0.3.4 and 192.168.1.4. If package install fails because of no outbound access, give the office VM a temporary public IP and remove it afterwards, or skip the dnsmasq part and use the second check only.</p>

<h3>Step 3: Private DNS zone and a record</h3>
<p><b>Portal:</b> Private DNS zones, Create <code>lab.example</code>; Virtual network links, Add hub-vnet; Record sets, Add A record <code>app</code> = 10.0.3.50.</p>
<pre class="code">az network private-dns zone create -g rg-nk-dns -n lab.example
az network private-dns link vnet create -g rg-nk-dns -z lab.example -n link-hub -v hub-vnet -e false
az network private-dns record-set a add-record -g rg-nk-dns -z lab.example -n app -a 10.0.3.50</pre>

<h3>Step 4: the resolver, endpoints, ruleset and link</h3>
<p><b>Portal:</b> DNS Private Resolvers, Create: VNet hub-vnet, inbound endpoint in dns-in, outbound endpoint in dns-out. Then DNS Forwarding Rulesets, Create, attach the outbound endpoint, add a rule <code>corp.example.</code> to 192.168.1.4:53, and link the ruleset to hub-vnet.</p>
<pre class="code"><span class="c"># parameters differ by extension version: confirm every command with --help</span>
az dns-resolver create -g rg-nk-dns -n dnspr-hub -l centralindia --id <span class="c">&lt;hub-vnet-id&gt;</span>
az dns-resolver inbound-endpoint create -g rg-nk-dns --dns-resolver-name dnspr-hub -n dns-in -l centralindia --ip-configurations "[{private-ip-allocation-method:Dynamic,id:<span class="c">&lt;dns-in-subnet-id&gt;</span>}]"
az dns-resolver outbound-endpoint create -g rg-nk-dns --dns-resolver-name dnspr-hub -n dns-out -l centralindia --id <span class="c">&lt;dns-out-subnet-id&gt;</span>
az dns-resolver forwarding-ruleset create -g rg-nk-dns -n frs-hub -l centralindia --outbound-endpoints "[{id:<span class="c">&lt;dns-out-endpoint-id&gt;</span>}]"
az dns-resolver forwarding-rule create -g rg-nk-dns --ruleset-name frs-hub -n corp --domain-name "corp.example." --forwarding-rule-state Enabled --target-dns-servers "[{ip-address:192.168.1.4,port:53}]"
az dns-resolver vnet-link create -g rg-nk-dns --ruleset-name frs-hub -n link-hub --id <span class="c">&lt;hub-vnet-id&gt;</span>
az dns-resolver inbound-endpoint show -g rg-nk-dns --dns-resolver-name dnspr-hub -n dns-in --query ipConfigurations[0].privateIpAddress -o tsv</pre>
<p>Note the inbound endpoint IP (normally 10.0.7.4).</p>

<h3>Step 5: verify both directions</h3>
<pre class="code">az vm run-command invoke -g rg-nk-dns -n vm-hub --command-id RunShellScript --scripts "nslookup files.corp.example; nslookup app.lab.example"
az vm run-command invoke -g rg-nk-dns -n vm-office --command-id RunShellScript --scripts "nslookup app.lab.example 10.0.7.4"</pre>
<pre class="out"><span class="c">Illustrative output</span>
vm-hub:     files.corp.example  Address: <span class="hl">192.168.1.20</span>   (via ruleset to the office DNS)
vm-hub:     app.lab.example     Address: <span class="hl">10.0.3.50</span>     (private zone)
vm-office:  app.lab.example     Address: <span class="hl">10.0.3.50</span>     (via the inbound endpoint 10.0.7.4)</pre>
<p>If a lookup fails: confirm both subnets are delegated, the ruleset is <i>linked</i> to hub-vnet, the zone is linked to hub-vnet, the peering is Connected, and dnsmasq listens on 192.168.1.4. A lookup of a public name from vm-hub should still work: unmatched names go to Azure DNS.</p>

<h3>MANDATORY CLEANUP</h3>
<pre class="code">az group delete -n rg-nk-dns --yes --no-wait
az group exists -n rg-nk-dns <span class="c"># repeat until it prints false</span></pre>
<p><b>Confirm</b> the group is gone and check Cost analysis the next day.</p>

<h3>What bills you: the trap list</h3>
<ul>
<li>Each resolver endpoint, per hour, even with no queries.</li>
<li>DNS queries to the resolver, per million (small).</li>
<li>Private DNS zone, per month, plus queries.</li>
<li>VMs, disks and any temporary public IP.</li>
<li>Peering traffic between the VNets.</li>
</ul>

<div class="scn"><h4>The resolver that nobody queried</h4><p>A team built a Private Resolver for a proof of concept, then the project paused. Two endpoints stayed deployed for a month, answering almost no queries, and still cost about as much as two small servers. A tag review with expiry dates found it; deleting the resource group removed it.</p><p><b>Lesson:</b> usage-light services can still bill by existence. Tag with an owner and an expiry.</p></div>

<div class="iv"><p class="q">"How would you verify hybrid DNS is working?"</p><p>From Azure: resolve an on-premises name and check it reaches the forwarder through the ruleset. From on-premises: query the inbound endpoint for an Azure private name and confirm it returns the private IP. Check delegated subnets, ruleset links and zone links when it fails.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Endpoint subnets must be delegated to Microsoft.Network/dnsResolvers.</li>
<li>Outbound endpoint plus a linked ruleset sends Azure queries to on-premises DNS.</li>
<li>Inbound endpoint lets on-premises DNS resolve Azure private zones.</li>
<li>Both the ruleset and the Private DNS zone must be linked to the VNet.</li>
<li>Delete the resource group the same day and confirm.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<div class="warn"><p><b>Billed lab.</b> Private Resolver endpoints <b>jitni der exist karte hain har ghante</b> bill karte hain. Ho sake to <b>free-credit account</b> use karo, <b>usi din</b> khatam karo, aur aakhir mein <b>resource group delete</b> karo. Yeh lab VPN lab se bahut sasta aur tez hai, par free nahi hai.</p></div>

<h3>Goal</h3>
<p>VPN ke bina hybrid DNS dono directions mein saabit karo. VNet peering VPN ki jagah lega, aur <code>office-vnet</code> (192.168.0.0/16) ki ek chhoti Linux VM on-premises DNS server ka role nibhayegi. Aap check karoge: (1) hub VM forwarding rule se office DNS ke through <code>files.corp.example</code> resolve karti hai; (2) office VM resolver ke inbound endpoint ke through Azure Private DNS zone se <code>app.lab.example</code> resolve karti hai.</p>
<div class="dia">`+e+`<p class="cap">Aap kya banaoge. Region: centralindia. Endpoint subnets Microsoft.Network/dnsResolvers ko delegated hain.</p></div>

<h3>Prerequisites</h3>
<ul>
<li>Azure subscription (free credits behtar), Azure CLI ya Cloud Shell. Resolver commands ke liye <code>az extension add -n dns-resolver</code> chahiye ho sakta hai (publish se pehle verify karo).</li>
<li>Do chhoti VMs ka quota. Office VM internet se dnsmasq install karti hai, isliye outbound access chahiye (default outbound access ya public IP; aapki subscription kya allow karti hai publish se pehle verify karo).</li>
<li>Lagbhag 60 se 90 minute.</li>
</ul>
<div class="note"><p><b>Portal wording</b> jaankari se likhi gayi hai aur <b>re-verify nahi</b> hui. DNS resolver CLI parameters extension version ke hisaab se alag hote hain; <code>--help</code> se confirm karo (verify before publishing).</p></div>

<h3>Imaandar cost</h3>
<p>Billing kaise hoti hai (pehle current Azure DNS pricing page padho): Private Resolver <b>har endpoint ke liye per hour</b> aur per million queries bill karta hai; Private DNS zones per zone per month plus queries; VMs aur disks per hour. <b>Yahan ka har number samjhane ke liye ASSUMED hai</b>: <b>assumed</b> $0.20 per endpoint-hour, <b>assumed</b> $0.50 per zone-month, <b>assumed</b> $0.02 per VM-hour, query charges na ke barabar.</p>
<div class="eg"><p><b>Worked example (assumed rates).</b> Do endpoints 3 ghante: 2 x 3 x $0.20 = <b>$1.20</b>. Ek zone ek din: lagbhag $0.02. Do VMs 3 ghante: $0.12. Total lagbhag <b>$1.35</b>.</p></div>
<div class="warn"><p><b>Loud warning.</b> Usi assumed rate par do bhoole hue endpoints 2 x 24 x $0.20 = <b>$9.60 per day</b> aur lagbhag 2 x 730 x $0.20 = <b>$292 per month</b> padte hain. Abhi phone par cleanup ka reminder laga lo.</p></div>

<h3>Step 0: budget alert</h3>
<p>Cost Management, Budgets, Add; chhoti amount, 80 percent par alert (labels unverified). Alerts peeche chalte hain; sirf safety net.</p>

<h3>Step 1: networks, delegated subnets, peering</h3>
<p><b>Portal:</b> do virtual networks; hub mein subnets dns-in 10.0.7.0/28 aur dns-out 10.0.8.0/28 jodo, aur Subnet delegation mein dono ke liye Microsoft.Network/dnsResolvers chuno. Phir VNets ko peer karo (dono sides).</p>
<pre class="code">az group create -n rg-nk-dns -l centralindia
az network vnet create -g rg-nk-dns -n hub-vnet --address-prefixes 10.0.0.0/16 --subnet-name workload --subnet-prefixes 10.0.3.0/24
az network vnet subnet create -g rg-nk-dns --vnet-name hub-vnet -n dns-in --address-prefixes 10.0.7.0/28 --delegations Microsoft.Network/dnsResolvers
az network vnet subnet create -g rg-nk-dns --vnet-name hub-vnet -n dns-out --address-prefixes 10.0.8.0/28 --delegations Microsoft.Network/dnsResolvers
az network vnet create -g rg-nk-dns -n office-vnet --address-prefixes 192.168.0.0/16 --subnet-name servers --subnet-prefixes 192.168.1.0/24
az network vnet peering create -g rg-nk-dns -n hub-to-office --vnet-name hub-vnet --remote-vnet office-vnet --allow-vnet-access
az network vnet peering create -g rg-nk-dns -n office-to-hub --vnet-name office-vnet --remote-vnet hub-vnet --allow-vnet-access</pre>

<h3>Step 2: do chhoti VMs, aur office DNS server</h3>
<pre class="code">az vm create -g rg-nk-dns -n vm-hub --image Ubuntu2204 --size Standard_B1s --vnet-name hub-vnet --subnet workload --public-ip-address "" --nsg "" --admin-username azureuser --generate-ssh-keys
az vm create -g rg-nk-dns -n vm-office --image Ubuntu2204 --size Standard_B1s --vnet-name office-vnet --subnet servers --public-ip-address "" --nsg "" --admin-username azureuser --generate-ssh-keys
az vm run-command invoke -g rg-nk-dns -n vm-office --command-id RunShellScript --scripts "apt-get update -y &amp;&amp; apt-get install -y dnsmasq &amp;&amp; echo 'address=/files.corp.example/192.168.1.20' &gt; /etc/dnsmasq.d/corp.conf &amp;&amp; echo 'listen-address=192.168.1.4' &gt;&gt; /etc/dnsmasq.d/corp.conf &amp;&amp; systemctl restart dnsmasq"</pre>
<p>Addresses 10.0.3.4 aur 192.168.1.4 expect karo. Outbound access na hone se package install fail ho to office VM ko temporary public IP do aur baad mein hata do, ya dnsmasq wala hissa chhodkar sirf doosra check karo.</p>

<h3>Step 3: Private DNS zone aur ek record</h3>
<p><b>Portal:</b> Private DNS zones, Create <code>lab.example</code>; Virtual network links, Add hub-vnet; Record sets, Add A record <code>app</code> = 10.0.3.50.</p>
<pre class="code">az network private-dns zone create -g rg-nk-dns -n lab.example
az network private-dns link vnet create -g rg-nk-dns -z lab.example -n link-hub -v hub-vnet -e false
az network private-dns record-set a add-record -g rg-nk-dns -z lab.example -n app -a 10.0.3.50</pre>

<h3>Step 4: resolver, endpoints, ruleset aur link</h3>
<p><b>Portal:</b> DNS Private Resolvers, Create: VNet hub-vnet, dns-in mein inbound endpoint, dns-out mein outbound endpoint. Phir DNS Forwarding Rulesets, Create, outbound endpoint attach karo, rule <code>corp.example.</code> se 192.168.1.4:53 jodo, aur ruleset ko hub-vnet se link karo.</p>
<pre class="code"><span class="c"># parameters extension version ke hisaab se alag: har command --help se confirm karo</span>
az dns-resolver create -g rg-nk-dns -n dnspr-hub -l centralindia --id <span class="c">&lt;hub-vnet-id&gt;</span>
az dns-resolver inbound-endpoint create -g rg-nk-dns --dns-resolver-name dnspr-hub -n dns-in -l centralindia --ip-configurations "[{private-ip-allocation-method:Dynamic,id:<span class="c">&lt;dns-in-subnet-id&gt;</span>}]"
az dns-resolver outbound-endpoint create -g rg-nk-dns --dns-resolver-name dnspr-hub -n dns-out -l centralindia --id <span class="c">&lt;dns-out-subnet-id&gt;</span>
az dns-resolver forwarding-ruleset create -g rg-nk-dns -n frs-hub -l centralindia --outbound-endpoints "[{id:<span class="c">&lt;dns-out-endpoint-id&gt;</span>}]"
az dns-resolver forwarding-rule create -g rg-nk-dns --ruleset-name frs-hub -n corp --domain-name "corp.example." --forwarding-rule-state Enabled --target-dns-servers "[{ip-address:192.168.1.4,port:53}]"
az dns-resolver vnet-link create -g rg-nk-dns --ruleset-name frs-hub -n link-hub --id <span class="c">&lt;hub-vnet-id&gt;</span>
az dns-resolver inbound-endpoint show -g rg-nk-dns --dns-resolver-name dnspr-hub -n dns-in --query ipConfigurations[0].privateIpAddress -o tsv</pre>
<p>Inbound endpoint IP note karo (aam taur par 10.0.7.4).</p>

<h3>Step 5: dono directions verify karo</h3>
<pre class="code">az vm run-command invoke -g rg-nk-dns -n vm-hub --command-id RunShellScript --scripts "nslookup files.corp.example; nslookup app.lab.example"
az vm run-command invoke -g rg-nk-dns -n vm-office --command-id RunShellScript --scripts "nslookup app.lab.example 10.0.7.4"</pre>
<pre class="out"><span class="c">Illustrative output</span>
vm-hub:     files.corp.example  Address: <span class="hl">192.168.1.20</span>   (ruleset ke through office DNS se)
vm-hub:     app.lab.example     Address: <span class="hl">10.0.3.50</span>     (private zone)
vm-office:  app.lab.example     Address: <span class="hl">10.0.3.50</span>     (inbound endpoint 10.0.7.4 ke through)</pre>
<p>Lookup fail ho to confirm karo: dono subnets delegated hain, ruleset hub-vnet se <i>linked</i> hai, zone hub-vnet se linked hai, peering Connected hai, aur dnsmasq 192.168.1.4 par sun raha hai. vm-hub se public name ka lookup phir bhi chalna chahiye: unmatched names Azure DNS ko jaate hain.</p>

<h3>MANDATORY CLEANUP</h3>
<pre class="code">az group delete -n rg-nk-dns --yes --no-wait
az group exists -n rg-nk-dns <span class="c"># tab tak dohrao jab tak false print na ho</span></pre>
<p><b>Confirm</b> karo ki group gaya aur agle din Cost analysis dekho.</p>

<h3>What bills you: trap list</h3>
<ul>
<li>Har resolver endpoint, per hour, queries na hon tab bhi.</li>
<li>Resolver ko DNS queries, per million (chhota).</li>
<li>Private DNS zone, per month, plus queries.</li>
<li>VMs, disks aur koi temporary public IP.</li>
<li>VNets ke beech peering traffic.</li>
</ul>

<div class="scn"><h4>Resolver jise kisi ne query nahi kiya</h4><p>Ek team ne proof of concept ke liye Private Resolver banaya, phir project ruk gaya. Do endpoints ek mahine deployed rahe, lagbhag koi query nahi aayi, phir bhi do chhote servers jitna cost aaya. Expiry dates wale tag review ne ise pakda; resource group delete karne se hat gaya.</p><p><b>Lesson:</b> kam-use wali services bhi sirf exist karne par bill kar sakti hain. Owner aur expiry ka tag lagao.</p></div>

<div class="iv"><p class="q">"Hybrid DNS kaam kar raha hai, yeh kaise verify karoge?"</p><p>Azure se: on-premises naam resolve karo aur check karo ki woh ruleset ke through forwarder tak pahunchta hai. On-premises se: inbound endpoint se Azure private naam poochho aur confirm karo ki private IP aata hai. Fail ho to delegated subnets, ruleset links aur zone links check karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Endpoint subnets Microsoft.Network/dnsResolvers ko delegated hone chahiye.</li>
<li>Outbound endpoint plus linked ruleset Azure queries ko on-premises DNS bhejta hai.</li>
<li>Inbound endpoint on-premises DNS ko Azure private zones resolve karne deta hai.</li>
<li>Ruleset aur Private DNS zone dono VNet se linked hone chahiye.</li>
<li>Resource group usi din delete karo aur confirm karo.</li>
</ul></div>
`}};export{t as default};