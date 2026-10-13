var e=`<svg viewBox="0 0 640 230" role="img" aria-label="VNet troubleshooting layers">
<rect x="10" y="10" width="190" height="50" rx="8" fill="#bae6fd"/><text x="105" y="40" text-anchor="middle" class="svg-ink" font-size="13">1 Addressing and subnet</text>
<rect x="225" y="10" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">2 Effective routes</text>
<rect x="440" y="10" width="190" height="50" rx="8" fill="#ddd6fe"/><text x="535" y="40" text-anchor="middle" class="svg-ink" font-size="13">3 Public IP and SKU</text>
<rect x="10" y="90" width="190" height="50" rx="8" fill="#fde68a"/><text x="105" y="120" text-anchor="middle" class="svg-ink" font-size="13">4 NSG (next module)</text>
<rect x="225" y="90" width="190" height="50" rx="8" fill="#fed7aa"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">5 DNS resolution</text>
<rect x="440" y="90" width="190" height="50" rx="8" fill="#e2e8f0"/><text x="535" y="120" text-anchor="middle" class="svg-ink" font-size="13">6 OS firewall and service</text>
<rect x="120" y="170" width="400" height="48" rx="8" fill="#bbf7d0"/><text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">7 Network Watcher: Next hop, Connection troubleshoot</text>
<g stroke="#64748b" stroke-width="2"><line x1="200" y1="35" x2="225" y2="35"/><line x1="415" y1="35" x2="440" y2="35"/><line x1="535" y1="60" x2="535" y2="90"/><line x1="440" y1="115" x2="415" y2="115"/><line x1="225" y1="115" x2="200" y2="115"/><line x1="320" y1="140" x2="320" y2="170"/></g>
</svg>`,t={id:`troubleshooting`,h:{en:`Troubleshooting workflow: routes, public IP, outbound and DNS`,hi:`Troubleshooting workflow: routes, public IP, outbound aur DNS`},body:{en:`
<h3>A layer-by-layer method</h3>
<p>"I cannot connect" is a symptom, not a diagnosis. Work from the bottom of the stack to the top and change one thing at a time.</p>

<div class="dia">`+e+`<p class="cap">Seven layers to check in order. Stop at the first failure.</p></div>

<h3>1. Addressing and subnet</h3>
<p>Check that both ends are in the VNet or peered networks, do not overlap, and the private IP is what you think.</p>
<pre class="code">az vm list-ip-addresses -g rg-nk-lab -o table
az network vnet subnet list -g rg-nk-lab --vnet-name vnet-nk -o table</pre>
<p>Typical errors: subnet full, overlapping prefixes, a VM in the wrong subnet, a static IP below .4.</p>

<h3>2. Effective routes</h3>
<pre class="code">az network nic show-effective-route-table -g rg-nk-lab -n &lt;nic-name&gt; -o table</pre>
<p>Is there a route to the destination prefix? Is the next hop type right (Virtual network, Internet, Virtual appliance, None)? A <span class="hl">None</span> next hop means a drop. A UDR with 0.0.0.0/0 to an appliance sends everything to it; if the appliance is down or has no rule, traffic fails.</p>
<pre class="out">Source   State    Address Prefix   Next Hop Type      Next Hop IP
-------  -------  ---------------  -----------------  -----------
Default  Active   10.10.0.0/16     VnetLocal
<span class="hl">User</span>     Active   0.0.0.0/0        VirtualAppliance   10.10.250.4
Default  Invalid  0.0.0.0/0        Internet</pre>
<p>Illustrative output. The default Internet route is shown as Invalid because the user route overrides it.</p>

<h3>3. Public IP and SKU</h3>
<p>Does the NIC have a public IP? Is it Standard? Standard is closed until an NSG allows traffic. Is the address static, so DNS records do not go stale? Is the public IP attached to the right NIC configuration?</p>
<pre class="code">az network public-ip show -g rg-nk-lab -n pip-web --query "{ip:ipAddress, sku:sku.name, nic:ipConfiguration.id}"</pre>

<h3>4. NSG</h3>
<p>If addressing, routes and public IP are fine, the next suspect is an NSG on the subnet or the NIC. The next module covers it fully. For now, run Network Watcher IP flow verify when available.</p>

<h3>5. DNS</h3>
<p>Does the name resolve, and to the right address? Compare <code>nslookup name</code> against what you expect. Private endpoint names that resolve to public IPs mean a missing private DNS zone link or a custom DNS server that does not forward to 168.63.129.16. A VNet DNS change needs a VM restart or DHCP renewal to apply (verify).</p>

<h3>6. OS firewall and the service</h3>
<p>The most common cause of "Azure is broken" is a service that is not listening, or a guest firewall such as ufw or Windows Firewall. Check from inside the VM: is the port listening, and does it work on localhost?</p>

<h3>7. Network Watcher</h3>
<pre class="code">az network watcher show-next-hop -g rg-nk-lab --vm vm-web --source-ip 10.10.1.4 --dest-ip 203.0.113.50
az network watcher test-connectivity -g rg-nk-lab --source-resource vm-web --dest-address 10.10.2.4 --dest-port 22</pre>
<p>Next hop answers routing questions. Connection troubleshoot or test-connectivity tests the path end to end. Both need Network Watcher enabled in the region and may need an agent extension on the VM (verify before publishing).</p>

<h3>Worked tickets</h3>
<ol>
<li><b>"VM cannot reach the Internet in a new VNet."</b> Default outbound access is off for new VNets. Add NAT Gateway, load balancer outbound or a public IP.</li>
<li><b>"VM unreachable on its public IP."</b> Standard SKU with no NSG allow rule.</li>
<li><b>"Private endpoint resolves to a public IP."</b> Link the private DNS zone or fix the custom DNS forwarder.</li>
<li><b>"Traffic to 10.99.0.5 disappears."</b> Matches the 10.0.0.0/8 system route with next hop None, or a user route None. Add a route if the destination is real.</li>
<li><b>"Subnet delete fails."</b> A NIC, private endpoint or delegation is still in the subnet. Remove the dependencies first.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Asha cannot reach vm-app (10.10.2.4) from vm-web. Layer 1: both in the VNet, addresses correct. Layer 2: effective routes on vm-web show 10.10.0.0/16 VnetLocal, fine. Layer 3: no public IP needed. Layer 4: an NSG on snet-app denies inbound from snet-web. She edits the rule and it works. Starting at layer 1 stopped her from rebuilding routes that were never broken.</p></div>

<div class="warn"><p><b>Common mistake.</b> Jumping to NSG or firewall first. Many "network" problems are a missing route, a wrong DNS answer or an application not listening.</p></div>

<div class="exam"><p><b>Exam trap.</b> Know which tool answers which question: effective routes and Next hop for routing, IP flow verify for NSG decisions, Connection troubleshoot for end-to-end paths, and nslookup for DNS.</p></div>

<div class="scn"><h4>The Internet that left with the old subnet</h4><p>A nightly job failed after a platform team moved workloads into a new VNet. Routes were healthy and the NSG allowed outbound. The job needed Internet access, and the new subnet had no default outbound access and no NAT Gateway. They attached a NAT Gateway and the job passed.</p><p><b>Lesson:</b> outbound is a design decision in new VNets.</p></div>

<div class="iv"><p class="q">"A VM cannot reach a destination. What is your first diagnostic?"</p><p>Effective routes on the NIC and Next hop for that destination, because routing decides where the packet goes. Then NSG, DNS and the guest OS. Mention changing one thing at a time.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Check in order: addressing, routes, public IP, NSG, DNS, guest OS, Network Watcher.</li>
<li>Effective routes show the truth; None means drop.</li>
<li>New VNets have no default outbound access.</li>
<li>Private endpoint problems are usually DNS.</li>
<li>Subnet delete fails while NICs or endpoints remain.</li>
</ul></div>
`,hi:`
<h3>Layer-by-layer method</h3>
<p>"Connect nahi ho raha" ek symptom hai, diagnosis nahi. Stack ke neeche se upar tak kaam karo aur ek baar mein ek hi cheez badlo.</p>

<div class="dia">`+e+`<p class="cap">Order mein check karne ke saat layers. Pehle failure par ruk jao.</p></div>

<h3>1. Addressing aur subnet</h3>
<p>Check karo ki dono ends VNet ya peered networks mein hain, overlap nahi karte, aur private IP wahi hai jo aap sochte ho.</p>
<pre class="code">az vm list-ip-addresses -g rg-nk-lab -o table
az network vnet subnet list -g rg-nk-lab --vnet-name vnet-nk -o table</pre>
<p>Typical errors: subnet full, overlapping prefixes, galat subnet mein VM, .4 se neeche static IP.</p>

<h3>2. Effective routes</h3>
<pre class="code">az network nic show-effective-route-table -g rg-nk-lab -n &lt;nic-name&gt; -o table</pre>
<p>Kya destination prefix ka route hai? Kya next hop type sahi hai (Virtual network, Internet, Virtual appliance, None)? <span class="hl">None</span> next hop ka matlab drop. 0.0.0.0/0 ka UDR appliance ki taraf sab kuch bhej deta hai; agar appliance down hai ya uske paas rule nahi hai to traffic fail hota hai.</p>
<pre class="out">Source   State    Address Prefix   Next Hop Type      Next Hop IP
-------  -------  ---------------  -----------------  -----------
Default  Active   10.10.0.0/16     VnetLocal
<span class="hl">User</span>     Active   0.0.0.0/0        VirtualAppliance   10.10.250.4
Default  Invalid  0.0.0.0/0        Internet</pre>
<p>Illustrative output. Default Internet route Invalid dikhta hai kyunki user route use override karta hai.</p>

<h3>3. Public IP aur SKU</h3>
<p>Kya NIC ke paas public IP hai? Kya woh Standard hai? Standard NSG allow karne tak closed hai. Kya address static hai, taki DNS records stale na hon? Kya public IP sahi NIC configuration se attached hai?</p>
<pre class="code">az network public-ip show -g rg-nk-lab -n pip-web --query "{ip:ipAddress, sku:sku.name, nic:ipConfiguration.id}"</pre>

<h3>4. NSG</h3>
<p>Agar addressing, routes aur public IP theek hain to agla suspect subnet ya NIC par NSG hai. Agla module ise poora cover karta hai. Abhi ke liye, jab available ho Network Watcher IP flow verify chalao.</p>

<h3>5. DNS</h3>
<p>Kya naam resolve hota hai, aur sahi address par? <code>nslookup name</code> ko apni umeed se compare karo. Private endpoint names jo public IPs par resolve hote hain unka matlab private DNS zone link missing hai ya custom DNS server 168.63.129.16 ko forward nahi karta. VNet DNS change apply hone ke liye VM restart ya DHCP renewal chahiye (verify).</p>

<h3>6. OS firewall aur service</h3>
<p>"Azure kharab hai" ka sabse common karan woh service hai jo listen nahi kar rahi, ya guest firewall jaise ufw ya Windows Firewall. VM ke andar se check karo: kya port listen kar raha hai, aur localhost par chalta hai?</p>

<h3>7. Network Watcher</h3>
<pre class="code">az network watcher show-next-hop -g rg-nk-lab --vm vm-web --source-ip 10.10.1.4 --dest-ip 203.0.113.50
az network watcher test-connectivity -g rg-nk-lab --source-resource vm-web --dest-address 10.10.2.4 --dest-port 22</pre>
<p>Next hop routing ke sawalon ka jawab deta hai. Connection troubleshoot ya test-connectivity path ko end to end test karta hai. Dono ko region mein Network Watcher enabled chahiye aur VM par agent extension lag sakta hai (verify before publishing).</p>

<h3>Worked tickets</h3>
<ol>
<li><b>"Naye VNet mein VM Internet tak nahi pahunch raha."</b> Naye VNets mein default outbound access off hai. NAT Gateway, load balancer outbound ya public IP add karo.</li>
<li><b>"VM public IP par unreachable."</b> Standard SKU aur NSG allow rule nahi.</li>
<li><b>"Private endpoint public IP par resolve ho raha hai."</b> Private DNS zone link karo ya custom DNS forwarder fix karo.</li>
<li><b>"10.99.0.5 ka traffic gaayab ho jata hai."</b> Woh 10.0.0.0/8 system route se match karta hai jiska next hop None hai, ya user route None. Agar destination asli hai to route add karo.</li>
<li><b>"Subnet delete fail ho raha hai."</b> Subnet mein NIC, private endpoint ya delegation abhi bhi hai. Pehle dependencies hatao.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Asha vm-web se vm-app (10.10.2.4) tak nahi pahunch pa rahi. Layer 1: dono VNet mein, addresses sahi. Layer 2: vm-web ke effective routes 10.10.0.0/16 VnetLocal dikhate hain, theek. Layer 3: public IP ki zaroorat nahi. Layer 4: snet-app par NSG snet-web se inbound deny karta hai. Woh rule edit karti hai aur chal jata hai. Layer 1 se shuru karne ne use un routes ko dobara banane se bachaya jo kabhi toote nahi the.</p></div>

<div class="warn"><p><b>Common mistake.</b> Pehle NSG ya firewall par kood jana. Kai "network" problems missing route, galat DNS jawab ya application ka listen na karna hoti hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Jaano kaun sa tool kaun sa sawal solve karta hai: routing ke liye effective routes aur Next hop, NSG decisions ke liye IP flow verify, end-to-end paths ke liye Connection troubleshoot, aur DNS ke liye nslookup.</p></div>

<div class="scn"><h4>Internet jo purane subnet ke saath chala gaya</h4><p>Platform team ne workloads ko naye VNet mein move kiya aur raat ka job fail ho gaya. Routes theek the aur NSG outbound allow karta tha. Job ko Internet access chahiye tha, aur naye subnet mein default outbound access aur NAT Gateway dono nahi the. Unhone NAT Gateway attach kiya aur job pass ho gaya.</p><p><b>Lesson:</b> naye VNets mein outbound design ka faisla hai.</p></div>

<div class="iv"><p class="q">"VM kisi destination tak nahi pahunch pa raha. Pehla diagnostic kya hai?"</p><p>NIC par effective routes aur us destination ke liye Next hop, kyunki routing decide karta hai ki packet kahan jayega. Phir NSG, DNS aur guest OS. Ek baar mein ek cheez badalne ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein check karo: addressing, routes, public IP, NSG, DNS, guest OS, Network Watcher.</li>
<li>Effective routes sach dikhate hain; None matlab drop.</li>
<li>Naye VNets mein default outbound access nahi hota.</li>
<li>Private endpoint problems aksar DNS hoti hain.</li>
<li>NICs ya endpoints rehne tak subnet delete fail hota hai.</li>
</ul></div>
`}};export{t as default};