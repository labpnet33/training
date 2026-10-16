var e=`<svg viewBox="0 0 640 250" role="img" aria-label="Guided lab 1 layout: hub VNet with VPN gateway and VM, a second VNet acting as the office with its own VPN gateway and VM, two connections with BGP">
<rect x="15" y="30" width="250" height="170" rx="12" fill="#ddd6fe" stroke="#64748b"/><text x="140" y="52" text-anchor="middle" class="svg-ink" font-size="13">hub-vnet 10.0.0.0/16 (Azure)</text>
<rect x="35" y="70" width="210" height="40" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="140" y="95" text-anchor="middle" class="svg-ink" font-size="12">vpn-gw-hub, ASN 65515</text>
<rect x="35" y="125" width="210" height="40" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="140" y="150" text-anchor="middle" class="svg-ink" font-size="12">vm-hub 10.0.3.4</text>
<rect x="375" y="30" width="250" height="170" rx="12" fill="#e2e8f0" stroke="#64748b"/><text x="500" y="52" text-anchor="middle" class="svg-ink" font-size="13">onprem-vnet 192.168.0.0/16 (office)</text>
<rect x="395" y="70" width="210" height="40" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="500" y="95" text-anchor="middle" class="svg-ink" font-size="12">vpn-gw-office, ASN 65010</text>
<rect x="395" y="125" width="210" height="40" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="500" y="150" text-anchor="middle" class="svg-ink" font-size="12">vm-office 192.168.1.4</text>
<line x1="245" y1="90" x2="395" y2="90" stroke="#2563eb" stroke-width="4"/><text x="320" y="82" text-anchor="middle" class="svg-accent" font-size="11">IPsec + BGP</text>
<text x="320" y="232" text-anchor="middle" class="svg-ink" font-size="12">Two gateways bill hourly and take 30 to 45 minutes to deploy: delete the same day</text>
</svg>`,t={id:`guided-lab-vpn`,h:{en:`Guided lab on your own Azure account: a VPN with BGP`,hi:`Apne Azure account par guided lab: BGP ke saath VPN`},body:{en:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<div class="warn"><p><b>EXPENSIVE AND SLOW LAB. Read before you start.</b> VPN Gateways bill <b>every hour they exist</b> and each takes <b>30 to 45 minutes</b> to deploy. This lab uses two. Do it <b>only on a free-credit account</b> or one where you accept the cost, finish <b>the same day</b>, and <b>delete the resource group</b> at the end.</p></div>

<h3>Goal</h3>
<p>You do not have an office VPN device at home, so you will make a second VNet play the office: <code>onprem-vnet</code> 192.168.0.0/16 with its own VPN gateway. You will connect it to the hub (10.0.0.0/16) with a VNet-to-VNet IPsec connection and BGP, then prove it with BGP peer status, learned routes and a ping between two small VMs. The same concepts (gateway, connection, BGP) apply to a real office with a local network gateway.</p>
<div class="dia">`+e+`<p class="cap">What you will build. Region: centralindia for both VNets. Different ASNs are required for eBGP between the gateways.</p></div>

<h3>Prerequisites</h3>
<ul>
<li>An Azure subscription with free credits or an approved budget; Azure CLI or Cloud Shell, signed in.</li>
<li>Quota for two VPN gateways and two small VMs in the region.</li>
<li>About 2 to 3 hours, mostly waiting for gateways.</li>
</ul>
<div class="note"><p><b>Portal wording</b> was written from familiarity and <b>not re-verified</b> against the current portal. CLI parameters (especially zone, SKU and BGP options) should be confirmed with <code>--help</code> (verify before publishing).</p></div>

<h3>Honest cost</h3>
<p>How you are billed (read the current VPN Gateway pricing page first): each VPN gateway bills <b>per hour by SKU</b> from the moment it is created, even with no traffic; outbound data bills per GB (data between VNets in the same region may be charged as VNet-to-VNet transfer, verify); Standard public IPs bill per hour; VMs and disks bill per hour. <b>Every number here is ASSUMED for illustration</b>: <b>assumed</b> $0.20 per gateway-hour (VpnGw1AZ-class), <b>assumed</b> $0.005 per public-IP-hour, <b>assumed</b> $0.02 per VM-hour, <b>assumed</b> $0.01 per GB.</p>
<div class="eg"><p><b>Worked example (assumed rates).</b> Two gateways for 3 hours: 2 x 3 x $0.20 = <b>$1.20</b>. Two public IPs: 2 x 3 x $0.005 = $0.03. Two VMs: 2 x 3 x $0.02 = $0.12. Ping traffic: about $0. Total about <b>$1.40</b>.</p></div>
<div class="warn"><p><b>Loud warning.</b> With the same assumed rates, two forgotten gateways cost 2 x 24 x $0.20 = <b>$9.60 per day</b> and about 2 x 730 x $0.20 = <b>$292 per month</b>. Set a phone reminder for the cleanup step now.</p></div>

<h3>Step 0: budget alert</h3>
<p><b>Portal (unverified labels):</b> Cost Management, Budgets, Add; small monthly amount, alert at 80 percent. Alerts lag; they are a safety net only.</p>

<h3>Step 1: resource group, two VNets, subnets</h3>
<p><b>Portal:</b> create <code>rg-nk-vpn</code>; then two virtual networks. Hub: 10.0.0.0/16 with subnets GatewaySubnet 10.0.2.0/27 and workload 10.0.3.0/24. Office: 192.168.0.0/16 with GatewaySubnet 192.168.255.0/27 and servers 192.168.1.0/24.</p>
<pre class="code">az group create -n rg-nk-vpn -l centralindia
az network vnet create -g rg-nk-vpn -n hub-vnet --address-prefixes 10.0.0.0/16 --subnet-name workload --subnet-prefixes 10.0.3.0/24
az network vnet subnet create -g rg-nk-vpn --vnet-name hub-vnet -n GatewaySubnet --address-prefixes 10.0.2.0/27
az network vnet create -g rg-nk-vpn -n onprem-vnet --address-prefixes 192.168.0.0/16 --subnet-name servers --subnet-prefixes 192.168.1.0/24
az network vnet subnet create -g rg-nk-vpn --vnet-name onprem-vnet -n GatewaySubnet --address-prefixes 192.168.255.0/27</pre>

<h3>Step 2: public IPs and the two gateways (start now, then wait)</h3>
<p><b>Portal:</b> Virtual network gateways, Create: gateway type VPN, route-based, SKU VpnGw1AZ (or the smallest available non-Basic SKU), Generation 2, the VNet, a new Standard public IP, Enable BGP, ASN 65515 for the hub and 65010 for the office. This starts a 30 to 45 minute deployment.</p>
<pre class="code">az network public-ip create -g rg-nk-vpn -n pip-gw-hub --sku Standard --allocation-method Static --zone 1 2 3
az network public-ip create -g rg-nk-vpn -n pip-gw-office --sku Standard --allocation-method Static --zone 1 2 3
az network vnet-gateway create -g rg-nk-vpn -n vpn-gw-hub --vnet hub-vnet --public-ip-addresses pip-gw-hub --gateway-type Vpn --vpn-type RouteBased --sku VpnGw1AZ --vpn-gateway-generation Generation2 --asn 65515 --no-wait
az network vnet-gateway create -g rg-nk-vpn -n vpn-gw-office --vnet onprem-vnet --public-ip-addresses pip-gw-office --gateway-type Vpn --vpn-type RouteBased --sku VpnGw1AZ --vpn-gateway-generation Generation2 --asn 65010 --no-wait</pre>

<h3>Step 3: two small VMs while you wait</h3>
<pre class="code">az vm create -g rg-nk-vpn -n vm-hub --image Ubuntu2204 --size Standard_B1s --vnet-name hub-vnet --subnet workload --public-ip-address "" --nsg "" --admin-username azureuser --generate-ssh-keys --no-wait
az vm create -g rg-nk-vpn -n vm-office --image Ubuntu2204 --size Standard_B1s --vnet-name onprem-vnet --subnet servers --public-ip-address "" --nsg "" --admin-username azureuser --generate-ssh-keys --no-wait</pre>
<p>The VMs should get 10.0.3.4 and 192.168.1.4. (Image alias and size: verify before publishing.)</p>

<h3>Step 4: wait for both gateways</h3>
<pre class="code">for G in vpn-gw-hub vpn-gw-office; do
  until [ "$(az network vnet-gateway show -g rg-nk-vpn -n $G --query provisioningState -o tsv)" = Succeeded ]; do echo waiting $G; sleep 60; done
done</pre>

<h3>Step 5: connect them, both directions, with BGP</h3>
<p><b>Portal:</b> the hub gateway, Connections, Add: type VNet-to-VNet, second gateway vpn-gw-office, shared key, Enable BGP. Then the reverse connection from the office gateway with the same key.</p>
<pre class="code">KEY='REPLACE-WITH-A-LONG-RANDOM-KEY'
az network vpn-connection create -g rg-nk-vpn -n cn-hub-to-office --vnet-gateway1 vpn-gw-hub --vnet-gateway2 vpn-gw-office --shared-key "$KEY" --enable-bgp true
az network vpn-connection create -g rg-nk-vpn -n cn-office-to-hub --vnet-gateway1 vpn-gw-office --vnet-gateway2 vpn-gw-hub --shared-key "$KEY" --enable-bgp true</pre>

<h3>Step 6: verify</h3>
<pre class="code">az network vpn-connection show -g rg-nk-vpn -n cn-hub-to-office --query connectionStatus -o tsv
az network vnet-gateway list-bgp-peer-status -g rg-nk-vpn -n vpn-gw-hub -o table
az network vnet-gateway list-learned-routes -g rg-nk-vpn -n vpn-gw-hub -o table
az vm run-command invoke -g rg-nk-vpn -n vm-hub --command-id RunShellScript --scripts "ping -c 3 -W 2 192.168.1.4"
az network watcher show-next-hop -g rg-nk-vpn --vm vm-hub --source-ip 10.0.3.4 --dest-ip 192.168.1.4</pre>
<pre class="out"><span class="c">Illustrative output</span>
Connected
Neighbor     ASN     State        RoutesReceived
10.x.x.x     65010   <span class="hl">Connected</span>    1
192.168.0.0/16   learned over eBgp, AS path <span class="hl">65010</span>
3 packets transmitted, <span class="hl">3 received</span>
nextHopType: <span class="hl">VirtualNetworkGateway</span></pre>
<p>If the status is not <code>Connected</code>: check that both connections use the identical key, both have BGP enabled, and the ASNs differ. Allow a few minutes for BGP.</p>

<h3>Step 7: bonus, watch BGP withdraw a route</h3>
<pre class="code">az network vpn-connection delete -g rg-nk-vpn -n cn-office-to-hub
az network vnet-gateway list-learned-routes -g rg-nk-vpn -n vpn-gw-hub -o table</pre>
<p>After a short delay the 192.168.0.0/16 route disappears from the hub, and the ping fails. Recreate the connection to recover. This is the behaviour that makes BGP-based failover work.</p>

<h3>MANDATORY CLEANUP</h3>
<pre class="code">az group delete -n rg-nk-vpn --yes --no-wait
az group exists -n rg-nk-vpn <span class="c"># repeat until it prints false</span></pre>
<p>Gateways can take several minutes to delete. <b>Confirm</b> the group is gone, and look at Cost analysis the next day.</p>

<h3>What bills you: the trap list</h3>
<ul>
<li>Each VPN gateway, per hour, with no traffic at all.</li>
<li>Standard public IPs, per hour.</li>
<li>Data transfer between the VNets, per GB (verify).</li>
<li>VMs and disks until the resource group is deleted.</li>
<li>Any gateway you resized to a larger SKU and forgot.</li>
</ul>

<div class="scn"><h4>The gateway nobody remembered</h4><p>A trainee built a VPN lab on a Friday, got the ping working and went home. The portal showed no running VMs, so the lab looked finished, but the gateways were still deployed. The alert arrived on Monday because the team had a subscription budget. Deleting the resource group took ten minutes and ended the cost.</p><p><b>Lesson:</b> hidden infrastructure such as gateways bills even when nothing visibly runs.</p></div>

<div class="iv"><p class="q">"How would you test a site-to-site VPN without a physical office device?"</p><p>Use a second VNet with its own gateway as the "office" and a VNet-to-VNet connection with BGP, then verify with peer status, learned routes, next hop and a ping. Say that the same objects apply on a real office (local network gateway for the device) and that gateways bill hourly, so you delete the lab the same day.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Gateways take 30 to 45 minutes and bill hourly; start them first and use the wait.</li>
<li>VNet-to-VNet needs matching keys and, with BGP, different ASNs.</li>
<li>Verify with connection status, BGP peer status, learned routes, next hop and ping.</li>
<li>Deleting a connection withdraws the BGP routes.</li>
<li>Delete the resource group the same day and confirm it is gone.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<div class="warn"><p><b>MEHENGA AUR SLOW LAB. Shuru karne se pehle padho.</b> VPN Gateways <b>jitni der exist karte hain har ghante</b> bill karte hain aur har ek deploy hone mein <b>30 se 45 minute</b> leta hai. Is lab mein do use hote hain. Yeh <b>sirf free-credit account</b> par karo ya aisa jahan aap cost accept karte ho, <b>usi din</b> khatam karo, aur aakhir mein <b>resource group delete</b> karo.</p></div>

<h3>Goal</h3>
<p>Ghar par office VPN device nahi hai, isliye ek doosra VNet office ka role nibhayega: <code>onprem-vnet</code> 192.168.0.0/16, apne VPN gateway ke saath. Use hub (10.0.0.0/16) se VNet-to-VNet IPsec connection aur BGP se jodoge, phir BGP peer status, learned routes aur do chhoti VMs ke beech ping se saabit karoge. Wahi concepts (gateway, connection, BGP) asli office par local network gateway ke saath lagu hote hain.</p>
<div class="dia">`+e+`<p class="cap">Aap kya banaoge. Dono VNets ke liye region: centralindia. Gateways ke beech eBGP ke liye alag ASNs zaroori hain.</p></div>

<h3>Prerequisites</h3>
<ul>
<li>Free credits ya approved budget wali Azure subscription; Azure CLI ya Cloud Shell, signed in.</li>
<li>Region mein do VPN gateways aur do chhoti VMs ka quota.</li>
<li>Lagbhag 2 se 3 ghante, zyadatar gateways ka intezaar.</li>
</ul>
<div class="note"><p><b>Portal wording</b> jaankari se likhi gayi hai aur current portal se <b>re-verify nahi</b> hui. CLI parameters (khaaskar zone, SKU aur BGP options) <code>--help</code> se confirm karo (verify before publishing).</p></div>

<h3>Imaandar cost</h3>
<p>Billing kaise hoti hai (pehle current VPN Gateway pricing page padho): har VPN gateway banne ke pal se <b>SKU ke hisaab se per hour</b> bill karta hai, traffic na ho tab bhi; outbound data per GB bill hota hai (same region ke VNets ke beech data VNet-to-VNet transfer ki tarah charge ho sakta hai, verify); Standard public IPs per hour; VMs aur disks per hour. <b>Yahan ka har number samjhane ke liye ASSUMED hai</b>: <b>assumed</b> $0.20 per gateway-hour (VpnGw1AZ-class), <b>assumed</b> $0.005 per public-IP-hour, <b>assumed</b> $0.02 per VM-hour, <b>assumed</b> $0.01 per GB.</p>
<div class="eg"><p><b>Worked example (assumed rates).</b> Do gateways 3 ghante: 2 x 3 x $0.20 = <b>$1.20</b>. Do public IPs: 2 x 3 x $0.005 = $0.03. Do VMs: 2 x 3 x $0.02 = $0.12. Ping traffic: lagbhag $0. Total lagbhag <b>$1.40</b>.</p></div>
<div class="warn"><p><b>Loud warning.</b> Usi assumed rate par do bhoole hue gateways 2 x 24 x $0.20 = <b>$9.60 per day</b> aur lagbhag 2 x 730 x $0.20 = <b>$292 per month</b> padte hain. Abhi phone par cleanup ka reminder laga lo.</p></div>

<h3>Step 0: budget alert</h3>
<p><b>Portal (unverified labels):</b> Cost Management, Budgets, Add; chhoti monthly amount, 80 percent par alert. Alerts peeche chalte hain; sirf safety net hain.</p>

<h3>Step 1: resource group, do VNets, subnets</h3>
<p><b>Portal:</b> <code>rg-nk-vpn</code> banao; phir do virtual networks. Hub: 10.0.0.0/16, subnets GatewaySubnet 10.0.2.0/27 aur workload 10.0.3.0/24. Office: 192.168.0.0/16, GatewaySubnet 192.168.255.0/27 aur servers 192.168.1.0/24.</p>
<pre class="code">az group create -n rg-nk-vpn -l centralindia
az network vnet create -g rg-nk-vpn -n hub-vnet --address-prefixes 10.0.0.0/16 --subnet-name workload --subnet-prefixes 10.0.3.0/24
az network vnet subnet create -g rg-nk-vpn --vnet-name hub-vnet -n GatewaySubnet --address-prefixes 10.0.2.0/27
az network vnet create -g rg-nk-vpn -n onprem-vnet --address-prefixes 192.168.0.0/16 --subnet-name servers --subnet-prefixes 192.168.1.0/24
az network vnet subnet create -g rg-nk-vpn --vnet-name onprem-vnet -n GatewaySubnet --address-prefixes 192.168.255.0/27</pre>

<h3>Step 2: public IPs aur do gateways (abhi shuru karo, phir intezaar)</h3>
<p><b>Portal:</b> Virtual network gateways, Create: gateway type VPN, route-based, SKU VpnGw1AZ (ya sabse chhota available non-Basic SKU), Generation 2, VNet, naya Standard public IP, Enable BGP, hub ke liye ASN 65515 aur office ke liye 65010. Isse 30 se 45 minute ka deployment shuru hota hai.</p>
<pre class="code">az network public-ip create -g rg-nk-vpn -n pip-gw-hub --sku Standard --allocation-method Static --zone 1 2 3
az network public-ip create -g rg-nk-vpn -n pip-gw-office --sku Standard --allocation-method Static --zone 1 2 3
az network vnet-gateway create -g rg-nk-vpn -n vpn-gw-hub --vnet hub-vnet --public-ip-addresses pip-gw-hub --gateway-type Vpn --vpn-type RouteBased --sku VpnGw1AZ --vpn-gateway-generation Generation2 --asn 65515 --no-wait
az network vnet-gateway create -g rg-nk-vpn -n vpn-gw-office --vnet onprem-vnet --public-ip-addresses pip-gw-office --gateway-type Vpn --vpn-type RouteBased --sku VpnGw1AZ --vpn-gateway-generation Generation2 --asn 65010 --no-wait</pre>

<h3>Step 3: intezaar ke dauran do chhoti VMs</h3>
<pre class="code">az vm create -g rg-nk-vpn -n vm-hub --image Ubuntu2204 --size Standard_B1s --vnet-name hub-vnet --subnet workload --public-ip-address "" --nsg "" --admin-username azureuser --generate-ssh-keys --no-wait
az vm create -g rg-nk-vpn -n vm-office --image Ubuntu2204 --size Standard_B1s --vnet-name onprem-vnet --subnet servers --public-ip-address "" --nsg "" --admin-username azureuser --generate-ssh-keys --no-wait</pre>
<p>VMs ko 10.0.3.4 aur 192.168.1.4 milne chahiye. (Image alias aur size: publish se pehle verify karo.)</p>

<h3>Step 4: dono gateways ka intezaar</h3>
<pre class="code">for G in vpn-gw-hub vpn-gw-office; do
  until [ "$(az network vnet-gateway show -g rg-nk-vpn -n $G --query provisioningState -o tsv)" = Succeeded ]; do echo waiting $G; sleep 60; done
done</pre>

<h3>Step 5: dono directions mein BGP ke saath jodo</h3>
<p><b>Portal:</b> hub gateway, Connections, Add: type VNet-to-VNet, doosra gateway vpn-gw-office, shared key, Enable BGP. Phir office gateway se wahi key ke saath reverse connection.</p>
<pre class="code">KEY='REPLACE-WITH-A-LONG-RANDOM-KEY'
az network vpn-connection create -g rg-nk-vpn -n cn-hub-to-office --vnet-gateway1 vpn-gw-hub --vnet-gateway2 vpn-gw-office --shared-key "$KEY" --enable-bgp true
az network vpn-connection create -g rg-nk-vpn -n cn-office-to-hub --vnet-gateway1 vpn-gw-office --vnet-gateway2 vpn-gw-hub --shared-key "$KEY" --enable-bgp true</pre>

<h3>Step 6: verify</h3>
<pre class="code">az network vpn-connection show -g rg-nk-vpn -n cn-hub-to-office --query connectionStatus -o tsv
az network vnet-gateway list-bgp-peer-status -g rg-nk-vpn -n vpn-gw-hub -o table
az network vnet-gateway list-learned-routes -g rg-nk-vpn -n vpn-gw-hub -o table
az vm run-command invoke -g rg-nk-vpn -n vm-hub --command-id RunShellScript --scripts "ping -c 3 -W 2 192.168.1.4"
az network watcher show-next-hop -g rg-nk-vpn --vm vm-hub --source-ip 10.0.3.4 --dest-ip 192.168.1.4</pre>
<pre class="out"><span class="c">Illustrative output</span>
Connected
Neighbor     ASN     State        RoutesReceived
10.x.x.x     65010   <span class="hl">Connected</span>    1
192.168.0.0/16   eBgp se learned, AS path <span class="hl">65010</span>
3 packets transmitted, <span class="hl">3 received</span>
nextHopType: <span class="hl">VirtualNetworkGateway</span></pre>
<p>Status <code>Connected</code> na ho to check karo: dono connections par identical key, dono par BGP enabled, aur ASNs alag. BGP ke liye kuch minute do.</p>

<h3>Step 7: bonus, BGP ko route withdraw karte dekho</h3>
<pre class="code">az network vpn-connection delete -g rg-nk-vpn -n cn-office-to-hub
az network vnet-gateway list-learned-routes -g rg-nk-vpn -n vpn-gw-hub -o table</pre>
<p>Thodi der baad 192.168.0.0/16 route hub se gayab ho jaata hai, aur ping fail hota hai. Wapas laane ke liye connection dobara banao. Yahi behaviour BGP-based failover ko chalata hai.</p>

<h3>MANDATORY CLEANUP</h3>
<pre class="code">az group delete -n rg-nk-vpn --yes --no-wait
az group exists -n rg-nk-vpn <span class="c"># tab tak dohrao jab tak false print na ho</span></pre>
<p>Gateways delete hone mein kuch minute lag sakte hain. <b>Confirm</b> karo ki group gaya, aur agle din Cost analysis dekho.</p>

<h3>What bills you: trap list</h3>
<ul>
<li>Har VPN gateway, per hour, bilkul traffic ke bina bhi.</li>
<li>Standard public IPs, per hour.</li>
<li>VNets ke beech data transfer, per GB (verify).</li>
<li>VMs aur disks jab tak resource group delete na ho.</li>
<li>Koi gateway jo aapne bade SKU par resize kiya aur bhool gaye.</li>
</ul>

<div class="scn"><h4>Gateway jo kisi ko yaad nahi tha</h4><p>Ek trainee ne Friday ko VPN lab banaya, ping chalaya aur ghar chala gaya. Portal mein koi running VM nahi dikhi, isliye lab khatam lagta tha, par gateways abhi bhi deployed the. Alert Monday ko aaya kyunki team ne subscription budget lagaya tha. Resource group delete karne mein das minute lage aur cost band ho gaya.</p><p><b>Lesson:</b> gateways jaise hidden infrastructure tab bhi bill karte hain jab kuch visibly nahi chal raha.</p></div>

<div class="iv"><p class="q">"Physical office device ke bina site-to-site VPN kaise test karoge?"</p><p>Ek doosra VNet apne gateway ke saath "office" ke taur par, aur BGP ke saath VNet-to-VNet connection, phir peer status, learned routes, next hop aur ping se verify. Bolo ki asli office par wahi objects lagu hote hain (device ke liye local network gateway) aur gateways hourly bill karte hain, isliye lab usi din delete karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Gateways 30 se 45 minute lete hain aur hourly bill karte hain; pehle shuru karo aur intezaar use karo.</li>
<li>VNet-to-VNet ko matching keys chahiye aur BGP ke saath alag ASNs.</li>
<li>Connection status, BGP peer status, learned routes, next hop aur ping se verify karo.</li>
<li>Connection delete karne se BGP routes withdraw ho jaate hain.</li>
<li>Resource group usi din delete karo aur confirm karo ki gaya.</li>
</ul></div>
`}};export{t as default};