var e=`<svg viewBox="0 0 640 240" role="img" aria-label="Guided lab 1 layout: one VNet with an app subnet and a db subnet protected by nsg-db that has a deny rule for TCP 1433 from the app subnet">
<rect x="15" y="25" width="610" height="170" rx="12" fill="#ddd6fe" stroke="#64748b"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">lab-vnet 10.1.0.0/16</text>
<rect x="35" y="65" width="230" height="110" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="150" y="88" text-anchor="middle" class="svg-ink" font-size="12">app subnet 10.1.1.0/24</text><rect x="75" y="105" width="150" height="45" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="150" y="125" text-anchor="middle" class="svg-ink" font-size="12">vm-app 10.1.1.4</text><text x="150" y="141" text-anchor="middle" class="svg-muted" font-size="10">agent + tests</text>
<rect x="375" y="65" width="230" height="110" rx="10" fill="#bbf7d0" stroke="#64748b"/><text x="490" y="88" text-anchor="middle" class="svg-ink" font-size="12">db subnet 10.1.2.0/24 + nsg-db</text><rect x="415" y="105" width="150" height="45" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="490" y="125" text-anchor="middle" class="svg-ink" font-size="12">vm-db 10.1.2.4</text><text x="490" y="141" text-anchor="middle" class="svg-muted" font-size="10">listener on 1433</text>
<line x1="265" y1="127" x2="375" y2="127" stroke="#dc2626" stroke-width="3" stroke-dasharray="6 4"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="11">TCP 1433 DENIED (rule 200)</text>
<text x="320" y="222" text-anchor="middle" class="svg-muted" font-size="11">Cheap lab: two small VMs, one storage account. Still delete the resource group the same day</text>
</svg>`,t={id:`guided-lab-watcher`,h:{en:`Guided lab on your own Azure account: find a blocked port with Network Watcher`,hi:`Apne Azure account par guided lab: Network Watcher se blocked port dhundo`},body:{en:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<h3>Goal</h3>
<p>Build a tiny network with a hidden fault, then find it the professional way: a failing test, next hop, IP flow verify, effective security rules, a fix, connection troubleshoot and a short packet capture. The fault is an NSG deny rule on the database subnet that blocks TCP 1433 from the app subnet. This lab is cheap (two small VMs and a storage account), but it still bills until you delete it.</p>
<div class="dia">`+e+`<p class="cap">What you will build. Region: centralindia. One VNet keeps the cost and the steps low; the same tools work across peered VNets.</p></div>

<h3>Prerequisites</h3>
<ul>
<li>An Azure subscription you control; Azure CLI or Cloud Shell, signed in. Check with <code>az account show</code>.</li>
<li>Quota for two small VMs. Network Watcher must exist in the region (normally automatic; see Step 1).</li>
<li>About 60 minutes. You will <b>delete everything the same day</b>.</li>
</ul>
<div class="note"><p><b>Portal wording</b> was written from familiarity and <b>not re-verified</b> against the current portal. CLI parameters should be confirmed with <code>--help</code> (verify before publishing).</p></div>

<h3>Honest cost</h3>
<p>How you are billed (read the current Azure pricing pages first): VMs bill per hour while allocated, plus disks; storage bills per GB-month and per operation; Network Watcher tools differ: some diagnostics are free, others (such as connection troubleshoot or Connection Monitor) may bill per use (verify the current Network Watcher pricing page). <b>Every number here is ASSUMED for illustration</b>: <b>assumed</b> $0.02 per VM-hour, <b>assumed</b> $0.002 per disk-hour, <b>assumed</b> $0.02 per GB-month storage, <b>assumed</b> $0.01 per connection test.</p>
<div class="eg"><p><b>Worked example (assumed rates).</b> Two VMs for 2 hours: 2 x 2 x $0.02 = <b>$0.08</b>. Two disks: about $0.01. Storage with a tiny capture: under $0.01. A few connection tests: about $0.05. Total about <b>$0.15</b>.</p></div>
<div class="warn"><p><b>Warning.</b> Forgotten VMs keep billing: two VMs for a month at the assumed rate cost about 2 x 730 x $0.02 = <b>$29.20</b>, plus disks. Packet capture sessions and the agent extension also remain until deleted. Set a phone reminder for the cleanup step now.</p></div>

<h3>Step 0: budget alert</h3>
<p>Cost Management, Budgets, Add; a small monthly amount; alert at 80 percent (labels unverified). Alerts lag; a safety net only.</p>

<h3>Step 1: resource group, VNet, subnets, NSG with the fault</h3>
<p><b>Portal:</b> create <code>rg-nk-ops</code>; Virtual network lab-vnet 10.1.0.0/16 with subnets app 10.1.1.0/24 and db 10.1.2.0/24; Network security group nsg-db; add inbound rule priority 200, source 10.1.1.0/24, destination port 1433, protocol TCP, action <b>Deny</b>; associate nsg-db with the db subnet.</p>
<pre class="code">az group create -n rg-nk-ops -l centralindia
az network vnet create -g rg-nk-ops -n lab-vnet --address-prefixes 10.1.0.0/16 --subnet-name app --subnet-prefixes 10.1.1.0/24
az network vnet subnet create -g rg-nk-ops --vnet-name lab-vnet -n db --address-prefixes 10.1.2.0/24
az network nsg create -g rg-nk-ops -n nsg-db
az network nsg rule create -g rg-nk-ops --nsg-name nsg-db -n deny-app-1433 --priority 200 --direction Inbound --access Deny --protocol Tcp --source-address-prefixes 10.1.1.0/24 --destination-port-ranges 1433
az network vnet subnet update -g rg-nk-ops --vnet-name lab-vnet -n db --network-security-group nsg-db
az network watcher list -o table <span class="c"># a Network Watcher for centralindia should be listed</span></pre>
<p>If no Network Watcher is listed for the region, enable it: <code>az network watcher configure -g NetworkWatcherRG --locations centralindia --enabled true</code>.</p>

<h3>Step 2: two small VMs and a listener</h3>
<pre class="code">az vm create -g rg-nk-ops -n vm-app --image Ubuntu2204 --size Standard_B1s --vnet-name lab-vnet --subnet app --public-ip-address "" --nsg "" --admin-username azureuser --generate-ssh-keys
az vm create -g rg-nk-ops -n vm-db --image Ubuntu2204 --size Standard_B1s --vnet-name lab-vnet --subnet db --public-ip-address "" --nsg "" --admin-username azureuser --generate-ssh-keys
az vm run-command invoke -g rg-nk-ops -n vm-db --command-id RunShellScript --scripts "systemd-run --unit=lab-listener nc -lk 1433"</pre>
<p>Expect 10.1.1.4 and 10.1.2.4. The listener only needs to open TCP 1433. (Image alias and size: verify before publishing.)</p>

<h3>Step 3: reproduce the failure</h3>
<pre class="code">az vm run-command invoke -g rg-nk-ops -n vm-app --command-id RunShellScript --scripts "nc -zv -w 3 10.1.2.4 1433; echo exit=$?"</pre>
<pre class="out"><span class="c">Illustrative output</span>
nc: connect to 10.1.2.4 port 1433 (tcp) timed out: Operation now in progress
exit=<span class="hl">1</span></pre>
<p>A timeout, not "refused": something drops the packet.</p>

<h3>Step 4: climb the ladder</h3>
<pre class="code"><span class="c"># rung 3: route</span>
az network watcher show-next-hop -g rg-nk-ops --vm vm-app --source-ip 10.1.1.4 --dest-ip 10.1.2.4
<span class="c"># rung 4: filter (on the destination NIC)</span>
az network watcher test-ip-flow -g rg-nk-ops --vm vm-db --direction Inbound --protocol TCP --local 10.1.2.4:1433 --remote 10.1.1.4:50000
NIC=$(az vm show -g rg-nk-ops -n vm-db --query "networkProfile.networkInterfaces[0].id" -o tsv | xargs basename)
az network nic list-effective-nsg -g rg-nk-ops -n $NIC -o table</pre>
<pre class="out"><span class="c">Illustrative output</span>
NextHopType: <span class="hl">VnetLocal</span>           (the route is fine)
Access: <span class="hl">Deny</span>   RuleName: securityRules/deny-app-1433
Priority 200  deny-app-1433  Tcp  1433  10.1.1.0/24  Deny</pre>
<p>The route is fine; the named rule is the culprit. You found it in two commands.</p>

<h3>Step 5: fix and re-verify</h3>
<p><b>Portal:</b> nsg-db, Inbound security rules, delete deny-app-1433 (or add an Allow with a lower priority number such as 100).</p>
<pre class="code">az network nsg rule delete -g rg-nk-ops --nsg-name nsg-db -n deny-app-1433
az network watcher test-ip-flow -g rg-nk-ops --vm vm-db --direction Inbound --protocol TCP --local 10.1.2.4:1433 --remote 10.1.1.4:50000
az vm run-command invoke -g rg-nk-ops -n vm-app --command-id RunShellScript --scripts "nc -zv -w 3 10.1.2.4 1433; echo exit=$?"</pre>
<p><b>Check:</b> IP flow verify now reports <code>Allow</code> (rule AllowVnetInBound) and the nc command reports success, exit 0. Rules take a few seconds to apply.</p>

<h3>Step 6: end-to-end proof with connection troubleshoot</h3>
<pre class="code">az vm extension set -g rg-nk-ops --vm-name vm-app --name NetworkWatcherAgentLinux --publisher Microsoft.Azure.NetworkWatcher
az network watcher test-connectivity -g rg-nk-ops --source-resource vm-app --dest-resource vm-db --dest-port 1433</pre>
<pre class="out"><span class="c">Illustrative output</span>
ConnectionStatus: <span class="hl">Reachable</span>   AvgLatencyInMs: 1   Hops: vm-app -&gt; vm-db</pre>

<h3>Step 7: a short packet capture</h3>
<pre class="code">SA=stnkops$RANDOM
az storage account create -g rg-nk-ops -n $SA -l centralindia --sku Standard_LRS
az network watcher packet-capture create -g rg-nk-ops -n cap-app --vm vm-app --storage-account $SA --time-limit 60 --filters '[{"protocol":"TCP","remoteIPAddress":"10.1.2.4","remotePort":"1433"}]'
az vm run-command invoke -g rg-nk-ops -n vm-app --command-id RunShellScript --scripts "nc -zv -w 3 10.1.2.4 1433"
az network watcher packet-capture show-status -g rg-nk-ops -n cap-app -l centralindia</pre>
<pre class="out"><span class="c">Illustrative output</span>
PacketCaptureStatus: Stopped   StopReason: <span class="hl">TimeExceeded</span>   PacketCaptureError: []</pre>
<p>The capture file is written to the storage account (a container named for packet captures, verify the name). Download it and open it in Wireshark: you should see the SYN, SYN-ACK and ACK for port 1433. If you re-run the test while the deny rule is in place you would see only repeated SYNs, the pattern from the packet capture chapter.</p>

<h3>MANDATORY CLEANUP</h3>
<pre class="code">az network watcher packet-capture delete -g rg-nk-ops -n cap-app -l centralindia
az group delete -n rg-nk-ops --yes --no-wait
az group exists -n rg-nk-ops <span class="c"># repeat until it prints false</span></pre>
<p>Delete the capture session first, because it belongs to Network Watcher and is not removed with your resource group. <b>Confirm</b> in the portal under Resource groups and in Network Watcher, and look at Cost analysis the next day.</p>

<h3>What bills you: the trap list</h3>
<ul>
<li>Two VMs and disks, until the resource group is deleted. Stopping inside the OS does not stop the meter.</li>
<li>The storage account and the capture file.</li>
<li>Network Watcher tools that bill per use, such as connection troubleshoot (verify).</li>
<li>Capture sessions and agent extensions left behind in Network Watcher.</li>
<li>Anything you add: public IPs, Log Analytics, flow logs (next lab).</li>
</ul>

<div class="scn"><h4>The capture session nobody deleted</h4><p>A learner deleted the lab resource group and believed everything was gone. Weeks later a packet capture session was still listed under Network Watcher in another resource group, still pointing at a storage account that no longer existed and generating errors in the activity log. It cost nothing, but it confused the next person who inspected the subscription.</p><p><b>Lesson:</b> check Network Watcher for child resources that live outside your resource group.</p></div>

<div class="iv"><p class="q">"Walk me through finding which NSG rule blocks a port."</p><p>Reproduce with a test, confirm a timeout, check next hop to prove the route, run IP flow verify on the destination NIC to get Allow or Deny and the rule name, confirm with effective security rules, fix the rule, and re-run the test. Then prove it end to end with connection troubleshoot and keep the note.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A timeout points to a drop: check route, then filters.</li>
<li>Next hop proves the route; IP flow verify names the NSG rule.</li>
<li>Fix, then re-verify with the same commands.</li>
<li>Connection troubleshoot needs the agent on the source VM.</li>
<li>Delete capture sessions and the resource group, then confirm.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<h3>Goal</h3>
<p>Ek chhota network banao jisme chhupa hua fault ho, phir use professional tareeke se dhundo: failing test, next hop, IP flow verify, effective security rules, fix, connection troubleshoot aur chhota packet capture. Fault database subnet par ek NSG deny rule hai jo app subnet se TCP 1433 block karta hai. Yeh lab sasta hai (do chhoti VMs aur ek storage account), par delete karne tak bill karta hai.</p>
<div class="dia">`+e+`<p class="cap">Aap kya banaoge. Region: centralindia. Ek VNet cost aur steps kam rakhta hai; wahi tools peered VNets mein bhi chalte hain.</p></div>

<h3>Prerequisites</h3>
<ul>
<li>Aapke control wali Azure subscription; Azure CLI ya Cloud Shell, signed in. <code>az account show</code> se check karo.</li>
<li>Do chhoti VMs ka quota. Region mein Network Watcher hona chahiye (aam taur par automatic; Step 1 dekho).</li>
<li>Lagbhag 60 minute. Aap <b>usi din sab kuch delete karoge</b>.</li>
</ul>
<div class="note"><p><b>Portal wording</b> jaankari se likhi gayi hai aur current portal se <b>re-verify nahi</b> hui. CLI parameters <code>--help</code> se confirm karo (verify before publishing).</p></div>

<h3>Imaandar cost</h3>
<p>Billing kaise hoti hai (pehle current Azure pricing pages padho): VMs allocated rehne tak per hour bill karti hain, plus disks; storage per GB-month aur per operation bill hota hai; Network Watcher tools alag hain: kuch diagnostics free hain, doosre (jaise connection troubleshoot ya Connection Monitor) per use bill kar sakte hain (current Network Watcher pricing page verify karo). <b>Yahan ka har number samjhane ke liye ASSUMED hai</b>: <b>assumed</b> $0.02 per VM-hour, <b>assumed</b> $0.002 per disk-hour, <b>assumed</b> $0.02 per GB-month storage, <b>assumed</b> $0.01 per connection test.</p>
<div class="eg"><p><b>Worked example (assumed rates).</b> Do VMs 2 ghante: 2 x 2 x $0.02 = <b>$0.08</b>. Do disks: lagbhag $0.01. Chhote capture wala storage: $0.01 se kam. Kuch connection tests: lagbhag $0.05. Total lagbhag <b>$0.15</b>.</p></div>
<div class="warn"><p><b>Warning.</b> Bhooli hui VMs bill karti rehti hain: assumed rate par do VMs ek mahine ke lagbhag 2 x 730 x $0.02 = <b>$29.20</b> padti hain, disks alag. Packet capture sessions aur agent extension bhi delete hone tak rehte hain. Abhi phone par cleanup ka reminder laga lo.</p></div>

<h3>Step 0: budget alert</h3>
<p>Cost Management, Budgets, Add; chhoti monthly amount; 80 percent par alert (labels unverified). Alerts peeche chalte hain; sirf safety net.</p>

<h3>Step 1: resource group, VNet, subnets, fault wala NSG</h3>
<p><b>Portal:</b> <code>rg-nk-ops</code> banao; Virtual network lab-vnet 10.1.0.0/16, subnets app 10.1.1.0/24 aur db 10.1.2.0/24; Network security group nsg-db; inbound rule priority 200, source 10.1.1.0/24, destination port 1433, protocol TCP, action <b>Deny</b> jodo; nsg-db ko db subnet se associate karo.</p>
<pre class="code">az group create -n rg-nk-ops -l centralindia
az network vnet create -g rg-nk-ops -n lab-vnet --address-prefixes 10.1.0.0/16 --subnet-name app --subnet-prefixes 10.1.1.0/24
az network vnet subnet create -g rg-nk-ops --vnet-name lab-vnet -n db --address-prefixes 10.1.2.0/24
az network nsg create -g rg-nk-ops -n nsg-db
az network nsg rule create -g rg-nk-ops --nsg-name nsg-db -n deny-app-1433 --priority 200 --direction Inbound --access Deny --protocol Tcp --source-address-prefixes 10.1.1.0/24 --destination-port-ranges 1433
az network vnet subnet update -g rg-nk-ops --vnet-name lab-vnet -n db --network-security-group nsg-db
az network watcher list -o table <span class="c"># centralindia ka Network Watcher listed hona chahiye</span></pre>
<p>Region ke liye Network Watcher listed na ho to enable karo: <code>az network watcher configure -g NetworkWatcherRG --locations centralindia --enabled true</code>.</p>

<h3>Step 2: do chhoti VMs aur ek listener</h3>
<pre class="code">az vm create -g rg-nk-ops -n vm-app --image Ubuntu2204 --size Standard_B1s --vnet-name lab-vnet --subnet app --public-ip-address "" --nsg "" --admin-username azureuser --generate-ssh-keys
az vm create -g rg-nk-ops -n vm-db --image Ubuntu2204 --size Standard_B1s --vnet-name lab-vnet --subnet db --public-ip-address "" --nsg "" --admin-username azureuser --generate-ssh-keys
az vm run-command invoke -g rg-nk-ops -n vm-db --command-id RunShellScript --scripts "systemd-run --unit=lab-listener nc -lk 1433"</pre>
<p>10.1.1.4 aur 10.1.2.4 expect karo. Listener ko sirf TCP 1433 kholna hai. (Image alias aur size: publish se pehle verify karo.)</p>

<h3>Step 3: failure reproduce karo</h3>
<pre class="code">az vm run-command invoke -g rg-nk-ops -n vm-app --command-id RunShellScript --scripts "nc -zv -w 3 10.1.2.4 1433; echo exit=$?"</pre>
<pre class="out"><span class="c">Illustrative output</span>
nc: connect to 10.1.2.4 port 1433 (tcp) timed out: Operation now in progress
exit=<span class="hl">1</span></pre>
<p>Timeout, "refused" nahi: koi cheez packet drop kar rahi hai.</p>

<h3>Step 4: ladder chadho</h3>
<pre class="code"><span class="c"># rung 3: route</span>
az network watcher show-next-hop -g rg-nk-ops --vm vm-app --source-ip 10.1.1.4 --dest-ip 10.1.2.4
<span class="c"># rung 4: filter (destination NIC par)</span>
az network watcher test-ip-flow -g rg-nk-ops --vm vm-db --direction Inbound --protocol TCP --local 10.1.2.4:1433 --remote 10.1.1.4:50000
NIC=$(az vm show -g rg-nk-ops -n vm-db --query "networkProfile.networkInterfaces[0].id" -o tsv | xargs basename)
az network nic list-effective-nsg -g rg-nk-ops -n $NIC -o table</pre>
<pre class="out"><span class="c">Illustrative output</span>
NextHopType: <span class="hl">VnetLocal</span>           (route theek hai)
Access: <span class="hl">Deny</span>   RuleName: securityRules/deny-app-1433
Priority 200  deny-app-1433  Tcp  1433  10.1.1.0/24  Deny</pre>
<p>Route theek hai; naam wala rule doshi hai. Aapne use do commands mein dhundh liya.</p>

<h3>Step 5: fix karo aur re-verify karo</h3>
<p><b>Portal:</b> nsg-db, Inbound security rules, deny-app-1433 delete karo (ya kam priority number, jaise 100, ke saath Allow jodo).</p>
<pre class="code">az network nsg rule delete -g rg-nk-ops --nsg-name nsg-db -n deny-app-1433
az network watcher test-ip-flow -g rg-nk-ops --vm vm-db --direction Inbound --protocol TCP --local 10.1.2.4:1433 --remote 10.1.1.4:50000
az vm run-command invoke -g rg-nk-ops -n vm-app --command-id RunShellScript --scripts "nc -zv -w 3 10.1.2.4 1433; echo exit=$?"</pre>
<p><b>Check:</b> IP flow verify ab <code>Allow</code> (rule AllowVnetInBound) report karta hai aur nc command success, exit 0. Rules apply hone mein kuch second lagte hain.</p>

<h3>Step 6: connection troubleshoot se end-to-end saboot</h3>
<pre class="code">az vm extension set -g rg-nk-ops --vm-name vm-app --name NetworkWatcherAgentLinux --publisher Microsoft.Azure.NetworkWatcher
az network watcher test-connectivity -g rg-nk-ops --source-resource vm-app --dest-resource vm-db --dest-port 1433</pre>
<pre class="out"><span class="c">Illustrative output</span>
ConnectionStatus: <span class="hl">Reachable</span>   AvgLatencyInMs: 1   Hops: vm-app -&gt; vm-db</pre>

<h3>Step 7: chhota packet capture</h3>
<pre class="code">SA=stnkops$RANDOM
az storage account create -g rg-nk-ops -n $SA -l centralindia --sku Standard_LRS
az network watcher packet-capture create -g rg-nk-ops -n cap-app --vm vm-app --storage-account $SA --time-limit 60 --filters '[{"protocol":"TCP","remoteIPAddress":"10.1.2.4","remotePort":"1433"}]'
az vm run-command invoke -g rg-nk-ops -n vm-app --command-id RunShellScript --scripts "nc -zv -w 3 10.1.2.4 1433"
az network watcher packet-capture show-status -g rg-nk-ops -n cap-app -l centralindia</pre>
<pre class="out"><span class="c">Illustrative output</span>
PacketCaptureStatus: Stopped   StopReason: <span class="hl">TimeExceeded</span>   PacketCaptureError: []</pre>
<p>Capture file storage account mein likhi jaati hai (packet captures ke naam wala container, naam verify karo). Use download karke Wireshark mein kholo: port 1433 ke liye SYN, SYN-ACK aur ACK dikhne chahiye. Deny rule maujood hote hue test dohrate to sirf repeated SYNs dikhte, jo packet capture chapter ka pattern hai.</p>

<h3>MANDATORY CLEANUP</h3>
<pre class="code">az network watcher packet-capture delete -g rg-nk-ops -n cap-app -l centralindia
az group delete -n rg-nk-ops --yes --no-wait
az group exists -n rg-nk-ops <span class="c"># tab tak dohrao jab tak false print na ho</span></pre>
<p>Pehle capture session delete karo, kyunki woh Network Watcher ka hai aur aapke resource group ke saath nahi hat'ta. Portal mein Resource groups aur Network Watcher mein <b>confirm</b> karo, aur agle din Cost analysis dekho.</p>

<h3>What bills you: trap list</h3>
<ul>
<li>Do VMs aur disks, jab tak resource group delete na ho. OS ke andar band karne se meter band nahi hota.</li>
<li>Storage account aur capture file.</li>
<li>Network Watcher tools jo per use bill karte hain, jaise connection troubleshoot (verify).</li>
<li>Network Watcher mein chhodi hui capture sessions aur agent extensions.</li>
<li>Jo bhi aap jodo: public IPs, Log Analytics, flow logs (agla lab).</li>
</ul>

<div class="scn"><h4>Capture session jise kisi ne delete nahi kiya</h4><p>Ek learner ne lab resource group delete kiya aur maan liya ki sab kuch gaya. Hafton baad ek packet capture session doosre resource group mein Network Watcher ke neeche listed thi, ab bhi aise storage account ko point karti jo exist nahi karta tha, aur activity log mein errors bana rahi thi. Cost kuch nahi tha, par agle vyakti ko confuse kiya jisne subscription inspect ki.</p><p><b>Lesson:</b> Network Watcher mein un child resources ko check karo jo aapke resource group ke bahar rehte hain.</p></div>

<div class="iv"><p class="q">"Mujhe batao kaunsa NSG rule port block kar raha hai, yeh kaise dhundte ho."</p><p>Test se reproduce, timeout confirm, next hop se route saabit, destination NIC par IP flow verify se Allow ya Deny aur rule ka naam, effective security rules se confirm, rule fix, aur test dobara chalao. Phir connection troubleshoot se end to end saabit karo aur note rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Timeout drop ki taraf ishara karta hai: pehle route, phir filters check karo.</li>
<li>Next hop route saabit karta hai; IP flow verify NSG rule ka naam batata hai.</li>
<li>Fix karo, phir wahi commands se re-verify karo.</li>
<li>Connection troubleshoot ko source VM par agent chahiye.</li>
<li>Capture sessions aur resource group delete karo, phir confirm karo.</li>
</ul></div>
`}};export{t as default};